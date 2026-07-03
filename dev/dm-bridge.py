#!/usr/bin/env python3
"""Genesis DM Bridge — the dev integration harness (spec: docs/DM-BRIDGE.md).

A tiny local server that does THREE jobs at once:
  1. serves the static app (replaces `python3 -m http.server` — one command runs everything),
  2. acts as a DUMB MAILBOX between the browser app and the Claude Code DM, and
  3. proxies POST /seat — a key-injecting passthrough to an OpenAI-compatible upstream for the
     DM-SEAT (see docs/DM-SEAT.md §5.2). The bridge stays dumb here too: it assembles nothing,
     just injects auth and relays the SSE stream back verbatim, then logs cost telemetry.

NO GAME LOGIC LIVES HERE. The app remains the sole owner + applier of state (the anti-drift
cardinal rule: one implementation of the mutators, in-browser). The bridge only relays
turn/response files and stores a read-only `U` snapshot the DM can consult. See DM-BRIDGE.md
§"State ownership".

Mailbox layout (all under .dm/, git-ignored):
  turn-<turnId>.json      the app's TurnRequest          (app writes via POST /turn)
  response-<turnId>.json  the DM's TurnResponse           (DM writes via file or POST /response)
  state.json              latest full `U` snapshot         (app writes via POST /state)
  seat-costs.jsonl        per-turn seat cost telemetry     (bridge appends after each /seat call)

Seat env (all optional unless noted):
  SEAT_BASE_URL   OpenAI-compatible upstream base, e.g. https://api.z.ai/v1 (REQUIRED for /seat)
  SEAT_API_KEY    bearer key injected server-side (REQUIRED for /seat; never sent to the browser,
                  never logged, never written to .dm/ — proxy only forwards it upstream in the
                  Authorization header and never echoes it back or into seat-costs.jsonl)
  SEAT_MODEL_DEEP default glm-5.2 (informational only; the app picks the model in its request body)
  SEAT_MODEL_FAST default glm-4.7

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

# ---- DM-SEAT proxy config (docs/DM-SEAT.md §5.2) ----
SEAT_BASE_URL = os.environ.get("SEAT_BASE_URL", "")
SEAT_API_KEY  = os.environ.get("SEAT_API_KEY", "")

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


def _extract_usage(sse_bytes):
    """Best-effort scan of a relayed SSE byte stream for an OpenAI-compatible `usage` block.
    Providers differ on where it lands (a final non-delta chunk, or trailing on the last delta
    chunk when stream_options.include_usage is set) — scan every `data:` line and keep the last
    usage object seen, tolerating chunks that have none. Returns {} if nothing was found."""
    usage = {}
    for raw_line in sse_bytes.split(b"\n"):
        line = raw_line.strip()
        if not line.startswith(b"data:"):
            continue
        payload = line[len(b"data:"):].strip()
        if not payload or payload == b"[DONE]":
            continue
        try:
            obj = json.loads(payload.decode("utf-8"))
        except Exception:
            continue
        u = obj.get("usage") if isinstance(obj, dict) else None
        if isinstance(u, dict):
            usage = u
    return usage


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
        if u.path == "/reset":                       # test: clear the mailbox (+ seat cost log)
            for f in glob.glob(os.path.join(DM, "*.json")) + glob.glob(os.path.join(DM, "*.jsonl")):
                os.remove(f)
            return self._json(200, {"ok": True, "cleared": True})
        if u.path == "/seat":
            return self._do_seat()
        return self._json(404, {"error": "no route: " + u.path})

    # ---- DM-SEAT proxy (docs/DM-SEAT.md §5.2) ----
    # Pure key-injecting passthrough: the app assembles the full OpenAI-compatible chat-completion
    # body (messages, model, stream:true, ...) plus two bridge-only metadata fields the upstream
    # doesn't want (turnId, lane) which we pop before forwarding. We add Authorization, forward to
    # SEAT_BASE_URL, and relay the SSE response back to the browser byte-for-byte. The bridge never
    # parses/edits narration — only the trailing `usage` block, for cost telemetry.
    def _do_seat(self):
        if not SEAT_BASE_URL or not SEAT_API_KEY:
            # Clean, boring failure — no key means no proxy, never a stack trace or a hint about
            # what's missing beyond "seat not configured" (the message itself must stay key-free).
            return self._json(503, {"error": "seat not configured (SEAT_BASE_URL/SEAT_API_KEY unset)"})

        body = self._body()
        if body is None:
            return self._json(400, {"error": "bad json"})

        turn_id = body.pop("turnId", None) or ("seat-" + str(int(time.time() * 1000)))
        lane = body.pop("lane", "unknown")
        model = body.get("model", "unknown")

        upstream_url = SEAT_BASE_URL.rstrip("/") + "/chat/completions"
        data = json.dumps(body).encode("utf-8")
        upstream_req = urllib.request.Request(
            upstream_url, data=data, method="POST",
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer " + SEAT_API_KEY,
                "Accept": "text/event-stream",
            },
        )

        t0 = time.time()
        try:
            with urllib.request.urlopen(upstream_req, timeout=120) as upstream:
                self.send_response(upstream.status)
                self.send_header("Content-Type", upstream.headers.get("Content-Type", "text/event-stream"))
                self.send_header("Cache-Control", "no-store")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                chunks = []
                while True:
                    chunk = upstream.read(4096)
                    if not chunk:
                        break
                    chunks.append(chunk)
                    try:
                        self.wfile.write(chunk)
                        self.wfile.flush()
                    except (BrokenPipeError, ConnectionResetError):
                        break  # client hung up mid-stream; still log what we saw
                all_bytes = b"".join(chunks)
        except urllib.error.HTTPError as e:
            # Upstream rejected the request (bad model, quota, etc). Relay status/body verbatim —
            # this is upstream's own error text, not ours to redact, and it never contains our key
            # (the key never round-trips back from an OpenAI-compatible upstream).
            err_body = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(err_body)))
            self.end_headers()
            self.wfile.write(err_body)
            return
        except Exception as e:
            return self._json(502, {"error": "seat upstream unreachable: " + type(e).__name__})

        ms = int((time.time() - t0) * 1000)
        usage = _extract_usage(all_bytes)
        prompt_tokens = int(usage.get("prompt_tokens") or 0)
        completion_tokens = int(usage.get("completion_tokens") or 0)
        cached_tokens = 0
        details = usage.get("prompt_tokens_details")
        if isinstance(details, dict):
            cached_tokens = int(details.get("cached_tokens") or 0)
        tokens_in = max(0, prompt_tokens - cached_tokens)
        _seat_log_cost(turn_id, lane, model, tokens_in, cached_tokens, completion_tokens, ms)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    os.chdir(ROOT)
    with Server(("127.0.0.1", PORT), Handler) as httpd:
        print("Genesis DM Bridge  ->  http://127.0.0.1:%d/genesis.html" % PORT)
        print("  mailbox:  %s" % DM)
        print("  routes:   POST /turn · GET /response?turnId · POST/GET /state · GET /dm/turns · POST /reset · POST /seat")
        print("  seat:     %s" % ("configured -> " + SEAT_BASE_URL if SEAT_BASE_URL and SEAT_API_KEY else "not configured (SEAT_BASE_URL/SEAT_API_KEY unset)"))
        print("  (Ctrl-C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nbridge down.")
