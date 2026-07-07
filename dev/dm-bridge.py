#!/usr/bin/env python3
"""Genesis DM Bridge — the dev integration harness (spec: docs/DM-BRIDGE.md).

A tiny local server that does THREE jobs at once:
  1. serves the static app (replaces `python3 -m http.server` — one command runs everything),
  2. acts as a DUMB MAILBOX between the browser app and the Claude Code DM, and
  3. serves POST /seat — the TRUE ADAPTER BOUNDARY (docs/SEAT-ADAPTER.md) between the browser's
     provider-agnostic Genesis wire shape {turnId, lane, system, messages} and whichever real
     provider SEAT_PROVIDER names. The bridge owns EVERYTHING provider-shaped here: lane->model
     mapping, wire dialect assembly, key injection, normalized SSE framing back to the browser
     ({"delta"}/{"usage"}/[DONE]), and usage/cost telemetry. The browser never speaks provider
     dialect — no model, no stream, no provider frame parsing (docs/SEAT-ADAPTER.md §1/§3).

NO GAME LOGIC LIVES HERE. The app remains the sole owner + applier of state (the anti-drift
cardinal rule: one implementation of the mutators, in-browser). The bridge only relays
turn/response files and stores a read-only `U` snapshot the DM can consult. See DM-BRIDGE.md
§"State ownership". The bridge likewise never parses narration or validates events[] — the
app is the sole firewall for game dialect (docs/SEAT-ADAPTER.md §3.4).

Mailbox layout (all under .dm/, git-ignored):
  turn-<turnId>.json      the app's TurnRequest          (app writes via POST /turn)
  response-<turnId>.json  the DM's TurnResponse           (DM writes via file or POST /response)
  state.json              latest full `U` snapshot         (app writes via POST /state)
  seat-costs.jsonl        per-turn seat cost telemetry     (bridge appends after each /seat call)

Seat env (all optional unless noted):
  SEAT_BASE_URL   provider upstream base, e.g. https://api.z.ai/v1 (REQUIRED for /seat)
  SEAT_API_KEY    bearer/x-api-key injected server-side (REQUIRED for /seat; never sent to the
                  browser, never logged, never written to .dm/ — proxy only forwards it upstream
                  and never echoes it back or into seat-costs.jsonl)
  SEAT_MODEL_DEEP model sent upstream for lane "deep" — default glm-5.2 (docs/SEAT-ADAPTER.md §1.2)
  SEAT_MODEL_FAST model sent upstream for lane "fast" (and anything else/missing) — default glm-4.7
  SEAT_PROVIDER   wire dialect: "openai" (default, GLM via z.ai) or "anthropic" (A/B variant) —
                  docs/SEAT-ADAPTER.md §1.3. An unrecognized value warns at startup and falls back
                  to "openai" rather than bricking the dev loop.

Run:
    python3 dev/dm-bridge.py              # -> http://127.0.0.1:5175/genesis.html
    GENESIS_PORT=8080 python3 dev/dm-bridge.py

Then drive the DM with a `/loop` watch on the mailbox — see docs/DM-BRIDGE.md §"Runbook".
"""
import json, os, re, sys, time, glob, http.server, socketserver, urllib.request, urllib.error
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DM   = os.path.join(ROOT, ".dm")
PORT = int(os.environ.get("GENESIS_PORT", "5175"))
os.makedirs(DM, exist_ok=True)

# ---- DM-SEAT proxy config (docs/SEAT-ADAPTER.md §1) ----
SEAT_BASE_URL = os.environ.get("SEAT_BASE_URL", "")
SEAT_API_KEY  = os.environ.get("SEAT_API_KEY", "")
SEAT_MODEL_DEEP = os.environ.get("SEAT_MODEL_DEEP", "glm-5.2")   # lane "deep" -> this model, §1.2
SEAT_MODEL_FAST = os.environ.get("SEAT_MODEL_FAST", "glm-4.7")   # lane "fast" (+ unrecognized/missing)

_SEAT_PROVIDERS = ("openai", "anthropic")
_seat_provider_raw = os.environ.get("SEAT_PROVIDER", "openai")
if _seat_provider_raw not in _SEAT_PROVIDERS:
    # E8: a typo'd env var must not brick the dev loop -- warn once at import time, fall back to openai.
    sys.stderr.write("· WARN: SEAT_PROVIDER=%r not in %s -- falling back to 'openai'\n" % (_seat_provider_raw, _SEAT_PROVIDERS))
    SEAT_PROVIDER = "openai"
else:
    SEAT_PROVIDER = _seat_provider_raw

# Price table, USD per 1M tokens. Dated per docs/DM-SEAT.md §0 (2026-07-03 pricing snapshot —
# GLM-5.2 via z.ai). Re-date this comment whenever the numbers are refreshed; keep old rows for
# history rather than deleting them outright.
SEAT_PRICING_PER_M = {
    # model:            (input,  cached_input, output)
    "glm-5.2":           (1.40,  0.26,         4.40),
    "glm-4.7":           (1.40,  0.26,         4.40),  # same sheet as of 2026-07-03; revise if GLM splits it
}
SEAT_PRICING_DEFAULT = (1.40, 0.26, 4.40)  # fallback for an unlisted model — same 2026-07-03 sheet

# turnId becomes a filename component (turn-<tid>.json / response-<tid>.json) — it MUST NOT be able to
# escape .dm/ via `..` or a slash. Even bound to 127.0.0.1, the CORS-`*` routes are reachable cross-origin
# from any page open in the browser, so an unvalidated tid is an arbitrary-.json read/write. Reject anything
# that isn't a plain id token.
_TID_RE = re.compile(r"^[A-Za-z0-9_.-]+$")
def _safe_tid(tid):
    return bool(tid) and ".." not in tid and _TID_RE.match(tid) is not None

# /seat is a KEY-INJECTING proxy — it must only serve the app the bridge itself hosts.
# Browsers always send Origin on POST; same-origin is 127.0.0.1/localhost on our PORT.
# An ABSENT Origin (curl, harnesses) is allowed — the guard targets cross-origin webpages.
_SEAT_ALLOWED_ORIGINS = {"http://127.0.0.1:%d" % PORT, "http://localhost:%d" % PORT}
def _seat_origin_ok(origin):
    return (not origin) or (origin in _SEAT_ALLOWED_ORIGINS)


def _read(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except OSError:
        return None


# ---- DM-SEAT proxy helpers (docs/DM-SEAT.md §5.2 / §3.3 cost telemetry) ----

def _seat_cost_usd(model, tokens_in, tokens_cached, tokens_out):
    """USD for one turn from the dated price table. tokens_in is the NON-cached portion (the
    caller subtracts tokens_cached before passing tokens_in, mirroring how usage blocks report
    prompt_tokens vs. a cached sub-count)."""
    p_in, p_cached, p_out = SEAT_PRICING_PER_M.get(model, SEAT_PRICING_DEFAULT)
    return (tokens_in * p_in + tokens_cached * p_cached + tokens_out * p_out) / 1_000_000.0



# ---- §1.1 request validation (docs/SEAT-ADAPTER.md) ----
# Returns (reason, lane) where reason is None on success (lane is the RAW lane value, mapping to a
# model happens separately per §1.2 — validation never fails toward the expensive model).
_SEAT_FORBIDDEN_KEYS = ("model", "stream", "stream_options")

def _seat_validate(body):
    """Validate a parsed /seat POST body per docs/SEAT-ADAPTER.md §1.1, in order. Returns
    (reason_or_None, lane_raw, messages_projected). On any failure, reason is a string and the
    caller must 400 with it, forwarding NOTHING upstream and logging NOTHING to seat-costs.jsonl."""
    if not isinstance(body, dict):
        return "bad json", None, None

    tid = body.get("turnId")
    if not _safe_tid(tid):
        return "bad turnId", None, None

    # lane: OPTIONAL, never fatal (§1.1.2) -- non-string (incl. missing) is treated like missing.
    lane_raw = body.get("lane")
    if not isinstance(lane_raw, str):
        lane_raw = None   # logged as "unknown" by the caller; mapped to fast

    system = body.get("system")
    if not isinstance(system, str):
        return "system must be a string", None, None

    messages = body.get("messages")
    if not isinstance(messages, list) or len(messages) == 0:
        return "messages required", None, None
    projected = []
    for m in messages:
        if not isinstance(m, dict):
            return "bad message role", None, None
        role = m.get("role")
        if role not in ("user", "assistant"):
            return "bad message role", None, None
        content = m.get("content")
        if not isinstance(content, str):
            return "message content must be a string", None, None
        projected.append({"role": role, "content": content})   # §1.1.4: two-key projection only

    for k in _SEAT_FORBIDDEN_KEYS:
        if k in body:
            return "provider dialect keys are bridge-owned: " + k, None, None

    return None, lane_raw, {"system": system, "messages": projected}


def _seat_map_lane(lane_raw):
    """§1.2: lane -> (mapped_model, logged_lane_string). Every degraded case (missing/unrecognized/
    non-string) fails toward the CHEAP model; missing/non-string logs literally as "unknown". NOTE:
    lane_raw is None here ONLY for missing/non-string (per _seat_validate's collapse) -- an actual
    empty string "" is still a string and is "any OTHER string", logged verbatim per §1.1.2, NOT
    coerced to "unknown" (an empty-but-present lane is a different case than an absent one)."""
    if lane_raw == "deep":
        return SEAT_MODEL_DEEP, "deep"
    if lane_raw == "fast":
        return SEAT_MODEL_FAST, "fast"
    if isinstance(lane_raw, str):
        return SEAT_MODEL_FAST, lane_raw          # unrecognized string (incl. ""): fast model, logged verbatim
    return SEAT_MODEL_FAST, "unknown"             # missing/non-string: fast model, logged "unknown"


# ---- §1.3 provider dialect assembly ----
def _seat_build_request(provider, model, validated):
    """Build (url_path, headers, body_dict) for the named provider dialect. `validated` is the
    {"system","messages"} dict _seat_validate returned (messages already two-key-projected)."""
    system, messages = validated["system"], validated["messages"]
    if provider == "anthropic":
        return (
            "/v1/messages",
            {
                "Content-Type": "application/json",
                "x-api-key": SEAT_API_KEY,
                "anthropic-version": "2023-06-01",
                "Accept": "text/event-stream",
            },
            {"model": model, "system": system, "messages": messages, "max_tokens": 8192, "stream": True},
        )
    # openai (default)
    full_messages = [{"role": "system", "content": system}] + messages
    return (
        "/chat/completions",
        {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + SEAT_API_KEY,
            "Accept": "text/event-stream",
        },
        {"model": model, "messages": full_messages, "stream": True, "stream_options": {"include_usage": True}},
    )


# ---- §1.4 normalized SSE frame parsing (incremental, one upstream line at a time) ----
class _SeatFrameParser:
    """Consumes upstream SSE bytes incrementally (line-buffered, per docs/SEAT-ADAPTER.md §4 A1.2's
    "hold the trailing partial line" discipline — the same posture seatReadSSE uses browser-side) and
    yields normalized Genesis frames: ("delta", text) for narration/JSON text chunks, and tracks the
    running usage dict in-pass (no second scan of a buffered blob — the design pull toward buffering
    that a post-hoc usage extraction would create, §5.2, is why this is a single incremental pass)."""
    def __init__(self, provider):
        self.provider = provider
        self._buf = b""
        self.usage = {"prompt_tokens": 0, "cached_tokens": 0, "completion_tokens": 0}
        self._got_usage = False
        # anthropic-only running state across message_start / content_block_delta / message_delta
        self._anthropic_prompt = 0
        self._anthropic_cache_read = 0
        self._anthropic_cache_write = 0

    def feed(self, chunk):
        """Feed raw upstream bytes; returns a list of ("delta", text) frames found in complete lines."""
        self._buf += chunk
        frames = []
        while b"\n" in self._buf:
            line, self._buf = self._buf.split(b"\n", 1)
            frames.extend(self._consume_line(line))
        return frames

    def flush_tail(self):
        """Consume any trailing partial line at EOF (mirrors the trailing-buffer discipline)."""
        if not self._buf.strip():
            self._buf = b""
            return []
        line, self._buf = self._buf, b""
        return self._consume_line(line)

    def _consume_line(self, raw_line):
        line = raw_line.strip()
        if not line.startswith(b"data:"):
            return []
        payload = line[len(b"data:"):].strip()
        if not payload or payload == b"[DONE]":
            return []   # E7: upstream's own [DONE] is consumed, never relayed
        try:
            obj = json.loads(payload.decode("utf-8"))
        except Exception:
            return []
        if self.provider == "anthropic":
            return self._consume_anthropic(obj)
        return self._consume_openai(obj)

    def _consume_openai(self, obj):
        frames = []
        choices = obj.get("choices") if isinstance(obj, dict) else None
        if isinstance(choices, list) and choices:
            delta = choices[0].get("delta") if isinstance(choices[0], dict) else None
            content = delta.get("content") if isinstance(delta, dict) else None
            if isinstance(content, str) and content:
                frames.append(("delta", content))
        u = obj.get("usage") if isinstance(obj, dict) else None
        if isinstance(u, dict):
            prompt_tokens = int(u.get("prompt_tokens") or 0)
            completion_tokens = int(u.get("completion_tokens") or 0)
            cached_tokens = 0
            details = u.get("prompt_tokens_details")
            if isinstance(details, dict):
                cached_tokens = int(details.get("cached_tokens") or 0)
            self.usage = {"prompt_tokens": prompt_tokens, "cached_tokens": cached_tokens, "completion_tokens": completion_tokens}
            self._got_usage = True
        return frames

    def _consume_anthropic(self, obj):
        frames = []
        etype = obj.get("type") if isinstance(obj, dict) else None
        if etype == "content_block_delta":
            delta = obj.get("delta") or {}
            text = delta.get("text")
            if isinstance(text, str) and text:
                frames.append(("delta", text))
        elif etype == "message_start":
            msg = obj.get("message") or {}
            u = msg.get("usage") or {}
            self._anthropic_prompt = int(u.get("input_tokens") or 0)
            self._anthropic_cache_read = int(u.get("cache_read_input_tokens") or 0)
            self._anthropic_cache_write = int(u.get("cache_creation_input_tokens") or 0)
            self._recompute_anthropic_usage()
        elif etype == "message_delta":
            u = obj.get("usage") or {}
            out = int(u.get("output_tokens") or 0)
            self.usage["completion_tokens"] = out
            self._got_usage = True
        return frames

    def _recompute_anthropic_usage(self):
        prompt_tokens = self._anthropic_prompt + self._anthropic_cache_read + self._anthropic_cache_write
        self.usage["prompt_tokens"] = prompt_tokens
        self.usage["cached_tokens"] = self._anthropic_cache_read
        self._got_usage = True


def _seat_log_cost(turn_id, lane, model, tokens_in, tokens_cached, tokens_out, ms):
    """Append one cost-telemetry line to .dm/seat-costs.jsonl. NEVER pass anything key-shaped
    into this — it writes exactly the fields named in docs/DM-SEAT.md §5 fork #5, nothing else,
    so there is no path for SEAT_API_KEY to reach disk from here."""
    usd = _seat_cost_usd(model, tokens_in, tokens_cached, tokens_out)
    line = {
        "turnId": turn_id,
        "lane": lane,
        "model": model,
        "tokensIn": tokens_in,
        "tokensCached": tokens_cached,
        "tokensOut": tokens_out,
        "ms": ms,
        "usd": round(usd, 6),
    }
    os.makedirs(DM, exist_ok=True)
    with open(os.path.join(DM, "seat-costs.jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps(line) + "\n")


class Handler(http.server.SimpleHTTPRequestHandler):
    # serve static files out of the repo root
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, fmt, *args):
        sys.stderr.write("· " + (fmt % args) + "\n")

    # Dev server: never let the browser cache modules. Genesis loads ~30 classic <script> files;
    # a stale cached state.js/render.js after an edit silently breaks the app (renderWorld throws,
    # a tab looks dead). no-store on every response kills that whole class of trap — no version
    # query strings to bump (which would also break check-manifest's src="…js" matching).
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    # ---- response helpers ----
    def _json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _nobody(self, code):
        self.send_response(code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b""
        try:
            return json.loads(raw or b"{}")
        except Exception:
            return None

    def do_OPTIONS(self):
        if urlparse(self.path).path == "/seat":
            # /seat is key-injecting — no CORS preflight grant. Every other route keeps the
            # blanket grant (the mailbox routes are the loop-DM's surface, already tid-guarded).
            self.send_response(204)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    # ---- routes ----
    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/response":
            tid = (parse_qs(u.query).get("turnId") or [""])[0]
            if not _safe_tid(tid):
                return self._json(400, {"error": "bad turnId"})
            path = os.path.join(DM, "response-%s.json" % tid)
            # LONG-POLL: hold the request open until the DM answers (or `wait` seconds elapse), so the app
            # gets the reply the instant it lands — no poll-window lag. The server is threaded (daemon
            # threads), so a held request never blocks new turns or other clients.
            try:
                wait = float((parse_qs(u.query).get("wait") or ["0"])[0])
            except ValueError:
                wait = 0.0
            wait = max(0.0, min(wait, 55.0))
            deadline = time.time() + wait
            txt = _read(path)
            while txt is None and time.time() < deadline:
                time.sleep(0.12)
                txt = _read(path)
            if txt is None:
                return self._nobody(204)            # still pending after the hold — client re-issues
            return self._json(200, json.loads(txt))
        if u.path == "/state":
            txt = _read(os.path.join(DM, "state.json"))
            if txt is None:
                return self._nobody(404)
            return self._json(200, json.loads(txt))
        if u.path == "/dm/turns":                   # convenience for the DM's /loop watch
            pending = []
            for tp in sorted(glob.glob(os.path.join(DM, "turn-*.json"))):
                tid = os.path.basename(tp)[len("turn-"):-len(".json")]
                if not os.path.exists(os.path.join(DM, "response-%s.json" % tid)):
                    pending.append(tid)
            return self._json(200, {"pending": pending})
        if u.path == "/dm/health":
            return self._json(200, {"ok": True, "mailbox": DM})
        return super().do_GET()                     # static files (genesis.html + modules)

    def do_POST(self):
        u = urlparse(self.path)
        os.makedirs(DM, exist_ok=True)   # the mailbox dir may have been deleted since startup; never let a write 500
        if u.path == "/turn":
            body = self._body()
            if body is None:
                return self._json(400, {"error": "bad json"})
            tid = body.get("turnId") or ("t-" + str(int(time.time() * 1000)))
            if not _safe_tid(tid):
                return self._json(400, {"error": "bad turnId"})
            body["turnId"] = tid
            body["_received"] = time.time()
            with open(os.path.join(DM, "turn-%s.json" % tid), "w", encoding="utf-8") as f:
                json.dump(body, f, indent=2)
            return self._json(200, {"turnId": tid})
        if u.path == "/response":                   # DM may POST instead of writing the file
            body = self._body()
            tid = (body or {}).get("turnId")
            if not _safe_tid(tid):
                return self._json(400, {"error": "turnId required/invalid"})
            with open(os.path.join(DM, "response-%s.json" % tid), "w", encoding="utf-8") as f:
                json.dump(body, f, indent=2)
            return self._json(200, {"ok": True})
        if u.path == "/state":
            body = self._body()
            with open(os.path.join(DM, "state.json"), "w", encoding="utf-8") as f:
                json.dump(body if body is not None else {}, f, indent=2)
            return self._json(200, {"ok": True})
        if u.path == "/telemetry":                    # DM-SEAM: one structured per-turn row (mailbox path)
            body = self._body()
            if body is None:
                return self._json(400, {"error": "bad json"})
            # Append-only JSONL — the mailbox-path twin of seat-costs.jsonl. No key ever reaches here
            # (the app measures its own bytes/latency; nothing sensitive rides the telemetry row).
            with open(os.path.join(DM, "telemetry.jsonl"), "a", encoding="utf-8") as f:
                f.write(json.dumps(body) + "\n")
            return self._json(200, {"ok": True})
        if u.path == "/reset":                       # test: clear the mailbox (+ seat cost log)
            for f in glob.glob(os.path.join(DM, "*.json")) + glob.glob(os.path.join(DM, "*.jsonl")):
                os.remove(f)
            return self._json(200, {"ok": True, "cleared": True})
        if u.path == "/seat":
            return self._do_seat()
        return self._json(404, {"error": "no route: " + u.path})

    # ---- DM-SEAT proxy: the true adapter boundary (docs/SEAT-ADAPTER.md) ----
    # The browser ALWAYS sends the provider-agnostic Genesis shape {turnId, lane, system, messages}
    # (docs/SEAT-ADAPTER.md §1.1) -- this route validates it, maps lane->model (§1.2), assembles the
    # SEAT_PROVIDER wire dialect (§1.3), streams+normalizes the upstream SSE back to the browser as
    # {"delta"}/{"usage"}/[DONE] frames with per-frame flush (§1.4, the LATENCY LAW: never buffer the
    # whole stream before relaying), and logs cost telemetry (§1.5). The bridge never speaks GAME
    # dialect -- it does not parse narration or validate events[] (§3.4).
    def _do_seat(self):
        origin = self.headers.get("Origin")
        if not _seat_origin_ok(origin):
            return self._json(403, {"error": "seat: cross-origin denied"})

        if not SEAT_BASE_URL or not SEAT_API_KEY:
            # Clean, boring failure — no key means no proxy, never a stack trace or a hint about
            # what's missing beyond "seat not configured" (the message itself must stay key-free).
            return self._json(503, {"error": "seat not configured (SEAT_BASE_URL/SEAT_API_KEY unset)"})

        body = self._body()
        if body is None:
            return self._json(400, {"error": "bad json"})

        reason, lane_raw, validated = _seat_validate(body)
        if reason is not None:
            # §1.1: nothing forwarded upstream, nothing logged to seat-costs.jsonl on a validation fail.
            return self._json(400, {"error": "bad seat request: " + reason})

        turn_id = body.get("turnId")
        model, lane_logged = _seat_map_lane(lane_raw)

        path, headers, up_body = _seat_build_request(SEAT_PROVIDER, model, validated)
        upstream_url = SEAT_BASE_URL.rstrip("/") + path
        data = json.dumps(up_body).encode("utf-8")
        upstream_req = urllib.request.Request(upstream_url, data=data, method="POST", headers=headers)

        parser = _SeatFrameParser(SEAT_PROVIDER)
        t0 = time.time()
        client_alive = True

        def _emit(frame_obj):
            """Write one normalized frame + flush immediately (§1.4/§5: never buffer to stream-end).
            Swallows a dead client so usage capture below can still run to completion (E4)."""
            nonlocal client_alive
            if not client_alive:
                return
            try:
                self.wfile.write(("data: " + json.dumps(frame_obj) + "\n\n").encode("utf-8"))
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                client_alive = False

        try:
            with urllib.request.urlopen(upstream_req, timeout=120) as upstream:
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                while True:
                    # read1(), NOT read(): a connection-close-delimited response (no Content-Length,
                    # not chunked -- true of every streaming SSE upstream here) makes plain read(n) on
                    # http.client's BufferedReader-wrapped socket read-ahead-fill its ENTIRE internal
                    # buffer before returning ANYTHING, which silently reintroduces whole-stream
                    # buffering (the exact thing §5 LATENCY LAW forbids) even though this loop looks
                    # incremental. read1(n) does at most one raw-stream read and returns whatever
                    # arrived, which is the actual "normalize-and-flush, never buffer" behavior B12
                    # gates on.
                    chunk = upstream.read1(4096)
                    if not chunk:
                        break
                    for _kind, text in parser.feed(chunk):
                        _emit({"delta": text})
                for _kind, text in parser.flush_tail():
                    _emit({"delta": text})
        except urllib.error.HTTPError as e:
            # §1.6: upstream HTTP error -- normalized, never relay the provider's own body verbatim to
            # the browser (dialect must not leak even in errors); 500 chars keeps it legible.
            err_text = e.read()
            try:
                err_text = err_text.decode("utf-8", "ignore")
            except Exception:
                err_text = str(err_text)
            return self._json(e.code, {"error": "seat upstream " + str(e.code) + ": " + err_text[:500]})
        except Exception as e:
            return self._json(502, {"error": "seat upstream unreachable: " + type(e).__name__})

        # §1.4: exactly one usage frame (all-zeros if none seen), then exactly one terminal [DONE] --
        # always bridge-emitted, whether or not upstream sent its own (E7) and whether or not the
        # client is still connected (E4: money was spent regardless; still log the cost line below).
        usage = parser.usage
        _emit({"usage": {
            "prompt_tokens": usage.get("prompt_tokens", 0),
            "cached_tokens": usage.get("cached_tokens", 0),
            "completion_tokens": usage.get("completion_tokens", 0),
        }})
        if client_alive:
            try:
                self.wfile.write(b"data: [DONE]\n\n")
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                pass

        ms = int((time.time() - t0) * 1000)
        prompt_tokens = int(usage.get("prompt_tokens") or 0)
        cached_tokens = int(usage.get("cached_tokens") or 0)
        completion_tokens = int(usage.get("completion_tokens") or 0)
        tokens_in = max(0, prompt_tokens - cached_tokens)
        _seat_log_cost(turn_id, lane_logged, model, tokens_in, cached_tokens, completion_tokens, ms)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    os.chdir(ROOT)
    with Server(("127.0.0.1", PORT), Handler) as httpd:
        print("Genesis DM Bridge  ->  http://127.0.0.1:%d/genesis.html" % PORT)
        print("  mailbox:  %s" % DM)
        print("  routes:   POST /turn · GET /response?turnId · POST/GET /state · GET /dm/turns · POST /telemetry · POST /reset · POST /seat")
        print("  seat:     %s" % (
            "configured -> %s (provider=%s, deep=%s, fast=%s)" % (SEAT_BASE_URL, SEAT_PROVIDER, SEAT_MODEL_DEEP, SEAT_MODEL_FAST)
            if SEAT_BASE_URL and SEAT_API_KEY else "not configured (SEAT_BASE_URL/SEAT_API_KEY unset)"))
        print("  (Ctrl-C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nbridge down.")
