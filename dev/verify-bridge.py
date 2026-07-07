#!/usr/bin/env python3
"""Verify the DM Bridge round-trip (spec: docs/DM-BRIDGE.md §"Build order" step 5;
DM-SEAT adapter cases per docs/SEAT-ADAPTER.md §6).

Dependency-free. Spawns dev/dm-bridge.py on an ephemeral port, replays every fixture pair
through the real HTTP contract, and asserts:
  · POST /turn echoes the turnId and stores the turn
  · GET /response is 204 (pending) BEFORE the DM answers, 200 with the body AFTER
  · the static app is actually served (GET /genesis.html)
  · POST /state then GET /state round-trips the snapshot
  · every fixture response's events[] conform to the EVENT-CONTRACT envelope (type/payload/source)

Then, against a second bridge instance configured with SEAT_BASE_URL/SEAT_API_KEY pointed at a
local mock upstream (spawned in-process, no network egress) and the browser's REAL Genesis-shaped
body {turnId, lane, system, messages} — no model, no stream key:
  · the mock upstream sees the injected Authorization: Bearer <key> (or x-api-key) header
  · the fake key string is ABSENT from every response body, every seat-costs.jsonl line, and
    every other file under .dm/ after the run (the hard safety gate — see CRITICAL SAFETY RULES)
  · the bridge assembles the OpenAI dialect body (model injected per lane->model mapping, system
    message prepended, stream+stream_options) and the client receives NORMALIZED relay frames
    ({"delta"}/{"usage"}/[DONE]) reconstructing the mock's narration — never raw provider JSON
  · the lane->model mapping actually MOVES the upstream model between calls (mutation-proven, B2)
  · boundary 400s: forbidden top-level keys (model/stream), empty messages[], a path-escaping
    turnId, a messages[] entry with role="system" (E11)
  · the no-[DONE] and staggered-timing mock variants (B11/B12 — the LATENCY LAW: first delta must
    arrive well before the stream closes, proving the relay never buffers the whole stream)
  · one .dm/seat-costs.jsonl line got appended per call, with the right fields/MAPPED model/lane
  · POST /seat with SEAT_API_KEY unset -> clean 503, no traceback, no partial file

This proves the transport + contract. The in-browser EVENT runtime (applyEvent through the real
mutators) is exercised separately — see dev/verify-dm-events.mjs (jsdom).

SAFETY: this script only ever spawns dev/dm-bridge.py on OS-assigned ephemeral ports (free_port())
and only ever talks to 127.0.0.1. It must never be pointed at port 5175 — that's the live bridge
from the main worktree. Never run this against a live session's .dm/.

Run:  python3 dev/verify-bridge.py
"""
import json, os, sys, time, socket, subprocess, threading, urllib.request, urllib.error, glob
import http.server, socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIX  = os.path.join(ROOT, "dev", "fixtures")

def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p

def req(method, url, body=None, headers=None):
    data = json.dumps(body).encode() if body is not None else None
    hdrs = {"Content-Type": "application/json"}
    if headers: hdrs.update(headers)
    r = urllib.request.Request(url, data=data, method=method, headers=hdrs)
    try:
        with urllib.request.urlopen(r, timeout=5) as resp:
            raw = resp.read()
            return resp.status, raw, dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read(), dict(e.headers or {})

def req_json(method, url, body=None):
    st, raw, _ = req(method, url, body)
    try:
        return st, (json.loads(raw) if raw else None)
    except Exception:
        return st, None

PASS = 0; FAIL = 0
def check(name, cond, detail=""):
    global PASS, FAIL
    if cond: PASS += 1; print("  ✓", name)
    else:    FAIL += 1; print("  ✗", name, "—", detail)

EVENT_TYPES = {"front_closed","clock_fired","clock_advanced","fact_canonized","discovery",
               "encounter_resolved","kill","choice_logged","inspiration_granted","level_applied","adjudication"}

# ---- DM-SEAT mock upstream (docs/SEAT-ADAPTER.md §6) ----
# A tiny local stand-in for the OpenAI-compatible provider. Records each request BODY (JSON) it
# received alongside the Authorization header (so tests can assert both key injection AND the
# dialect-assembled body), and serves per-variant canned SSE streams selected by request path.
# No network egress — 127.0.0.1 only, ephemeral port, in-process thread.
FAKE_SEAT_KEY = "sk-test-DO-NOT-LEAK-3f9a7c21"
CANNED_SSE = (
    b'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'
    b'data: {"choices":[{"delta":{"content":", traveler."}}]}\n\n'
    b'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":1000,"completion_tokens":200,'
    b'"prompt_tokens_details":{"cached_tokens":400}}}\n\n'
    b'data: [DONE]\n\n'
)
# same narration + usage, but the upstream never sends its own [DONE] sentinel (B11)
CANNED_SSE_NO_DONE = (
    b'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'
    b'data: {"choices":[{"delta":{"content":", traveler."}}]}\n\n'
    b'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":1000,"completion_tokens":200,'
    b'"prompt_tokens_details":{"cached_tokens":400}}}\n\n'
)

class _MockUpstreamHandler(http.server.BaseHTTPRequestHandler):
    seen_auth = []   # class-level: every Authorization header this mock ever received
    seen_bodies = [] # class-level: every parsed JSON body this mock ever received
    VARIANT = "normal"  # overridden per-subclass for the no-done / staggered mock server variants

    def log_message(self, fmt, *args):
        pass  # keep test output quiet

    def do_POST(self):
        if self.path not in ("/chat/completions", "/v1/messages"):
            self.send_response(404); self.end_headers(); return
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b""
        try:
            _MockUpstreamHandler.seen_bodies.append(json.loads(raw) if raw else None)
        except Exception:
            _MockUpstreamHandler.seen_bodies.append(None)
        _MockUpstreamHandler.seen_auth.append(
            self.headers.get("Authorization", "") or self.headers.get("x-api-key", ""))
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.end_headers()
        if self.VARIANT == "no-done":
            self.wfile.write(CANNED_SSE_NO_DONE); return
        if self.VARIANT == "staggered":
            self.wfile.write(b'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n')
            self.wfile.flush()
            time.sleep(1.2)
            self.wfile.write(b'data: {"choices":[{"delta":{"content":", traveler."}}]}\n\n'
                              b'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":1000,'
                              b'"completion_tokens":200,"prompt_tokens_details":{"cached_tokens":400}}}\n\n'
                              b'data: [DONE]\n\n')
            return
        self.wfile.write(CANNED_SSE)

class _MockUpstreamHandlerNoDone(_MockUpstreamHandler):
    VARIANT = "no-done"

class _MockUpstreamHandlerStaggered(_MockUpstreamHandler):
    VARIANT = "staggered"

class _MockUpstreamServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def _start_mock(port, handler_cls=_MockUpstreamHandler):
    mock = _MockUpstreamServer(("127.0.0.1", port), handler_cls)
    threading.Thread(target=mock.serve_forever, daemon=True).start()
    return mock


def _start_bridge(port, base_url, extra_env=None):
    env = dict(os.environ, GENESIS_PORT=str(port), SEAT_BASE_URL=base_url, SEAT_API_KEY=FAKE_SEAT_KEY)
    if extra_env: env.update(extra_env)
    proc = subprocess.Popen([sys.executable, os.path.join(ROOT, "dev", "dm-bridge.py")],
                            env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    base = "http://127.0.0.1:%d" % port
    for _ in range(50):
        try:
            st, _ = req_json("GET", base + "/dm/health")
            if st == 200: return proc, base
        except Exception: pass
        time.sleep(0.1)
    check("seat bridge came up", False, "did not start")
    return proc, base


def run_seat_checks():
    """Spawns its own bridge instance (SEAT_BASE_URL/SEAT_API_KEY pointed at a local mock
    upstream, SEAT_MODEL_DEEP/SEAT_MODEL_FAST pinned explicitly) plus a bridge instance with NO
    seat env, and runs the docs/SEAT-ADAPTER.md §6 cases against both. Both bridges bind
    ephemeral ports — never 5175."""
    mock_port = free_port()
    mock = _start_mock(mock_port)

    bridge_port = free_port()
    dm_dir = os.path.join(ROOT, ".dm")
    proc, base = _start_bridge(bridge_port, "http://127.0.0.1:%d" % mock_port,
                                {"SEAT_MODEL_DEEP": "glm-5.2", "SEAT_MODEL_FAST": "glm-4.7"})
    try:
        req_json("POST", base + "/reset")

        # Genesis-shaped body: exactly what the browser sends -- NO model, NO stream.
        genesis_body = {
            "turnId": "seat-t1", "lane": "deep", "system": "SYS",
            "messages": [{"role": "user", "content": "probe turn"}],
        }
        _MockUpstreamHandler.seen_auth.clear(); _MockUpstreamHandler.seen_bodies.clear()
        st, raw, hdrs = req("POST", base + "/seat", genesis_body)

        # key injection: the mock upstream must have seen the bearer key
        check("seat: key injected into upstream Authorization header",
              len(_MockUpstreamHandler.seen_auth) == 1 and
              _MockUpstreamHandler.seen_auth[0] == "Bearer " + FAKE_SEAT_KEY,
              "seen_auth=%r" % (_MockUpstreamHandler.seen_auth,))

        # M1 (was "passthrough fidelity"): normalized relay -- concatenated delta frames == mock
        # narration, reconstructed ONLY from {"delta":...} frames (raw `choices` chunks reaching the
        # client = fail).
        delta_frames = [json.loads(l[len(b"data: "):]) for l in raw.split(b"\n\n") if l.startswith(b"data: ") and l[len(b"data: "):].strip() != b"[DONE]"]
        deltas = "".join(f["delta"] for f in delta_frames if "delta" in f)
        check("seat: normalized relay (concatenated delta frames == mock narration)",
              deltas == "Hello, traveler.", "got %r frames=%r" % (deltas, delta_frames))
        check("seat: relay uses SSE framing (data: ... lines)",
              raw.startswith(b"data: ") and b"\n\ndata: " in raw, "got %r" % (raw[:80],))
        check("seat: response status 200", st == 200, "status %s" % st)
        check("seat: exactly one terminal [DONE], bridge-emitted",
              raw.count(b"data: [DONE]") == 1 and raw.rstrip().endswith(b"data: [DONE]"),
              "got %r" % (raw[-40:],))

        # B1: upstream body model == "glm-5.2" for lane deep (red: no model key forwarded pre-fix)
        up_body1 = _MockUpstreamHandler.seen_bodies[-1]
        check("B1: upstream body model == glm-5.2 for lane deep",
              up_body1 and up_body1.get("model") == "glm-5.2", "got %s" % up_body1)

        # B3: stream + stream_options.include_usage
        check("B3: upstream body has stream=true and stream_options.include_usage=true",
              up_body1 and up_body1.get("stream") is True and
              isinstance(up_body1.get("stream_options"), dict) and up_body1["stream_options"].get("include_usage") is True,
              "got %s" % up_body1)

        # B4: upstream messages[0] == {"role":"system","content":"SYS"}, browser messages follow in order
        check("B4: upstream messages[0] is the system message, browser messages follow in order",
              up_body1 and up_body1.get("messages", [None])[0] == {"role": "system", "content": "SYS"} and
              up_body1["messages"][1:] == [{"role": "user", "content": "probe turn"}],
              "got %s" % (up_body1 and up_body1.get("messages"),))

        # B5: upstream body has NO turnId/lane/system top-level keys
        check("B5: upstream body carries no turnId/lane/system top-level keys",
              up_body1 is not None and not any(k in up_body1 for k in ("turnId", "lane", "system")),
              "got %s" % up_body1)

        # cost telemetry: exactly one line appended, with the right shape
        costs_path = os.path.join(dm_dir, "seat-costs.jsonl")
        with open(costs_path, encoding="utf-8") as f:
            cost_lines = [json.loads(l) for l in f if l.strip()]
        check("seat: one seat-costs.jsonl line appended", len(cost_lines) == 1, "got %d" % len(cost_lines))
        if cost_lines:
            c = cost_lines[0]
            # M2 (was "cost line has turnId/lane/model"): model asserted as the MAPPED glm-5.2 --
            # red against the un-fixed bridge, which logs "unknown" for a body with no model key.
            check("M2: cost line has turnId/lane/model (model is the MAPPED glm-5.2)",
                  c.get("turnId") == "seat-t1" and c.get("lane") == "deep" and c.get("model") == "glm-5.2",
                  "got %s" % c)
            # usage block: prompt_tokens=1000, cached=400 -> tokensIn (non-cached) = 600
            check("seat: cost line tokens derived from usage block (tokensIn=600, cached=400, out=200)",
                  c.get("tokensIn") == 600 and c.get("tokensCached") == 400 and c.get("tokensOut") == 200,
                  "got %s" % c)
            # B10: usage frame normalized -- client received exactly one {"usage":{...}} frame
            usage_frames = [json.loads(l[len(b"data: "):]) for l in raw.split(b"\n\n")
                             if l.startswith(b"data: ") and b'"usage"' in l]
            check("B10: client received exactly one normalized usage frame with the exact values",
                  len(usage_frames) == 1 and usage_frames[0] == {"usage": {"prompt_tokens": 1000, "cached_tokens": 400, "completion_tokens": 200}},
                  "got %s" % usage_frames)
            # glm-5.2 sheet: 600*1.40 + 400*0.26 + 200*4.40, all /1e6
            expected_usd = round((600*1.40 + 400*0.26 + 200*4.40) / 1_000_000.0, 6)
            check("seat: cost line usd matches the dated price table",
                  c.get("usd") == expected_usd, "got %s want %s" % (c.get("usd"), expected_usd))

        # B2 (mutation): second call with lane fast -> upstream body model glm-4.7; the mapping MOVED.
        genesis_body2 = dict(genesis_body, turnId="seat-t2", lane="fast")
        req("POST", base + "/seat", genesis_body2)
        up_body2 = _MockUpstreamHandler.seen_bodies[-1]
        check("B2 (mutation): lane fast -> upstream model glm-4.7, and it differs from lane deep's model",
              up_body2 and up_body2.get("model") == "glm-4.7" and up_body1.get("model") != up_body2.get("model"),
              "deep_model=%s fast_model=%s" % (up_body1 and up_body1.get("model"), up_body2 and up_body2.get("model")))

        with open(costs_path, encoding="utf-8") as f:
            cost_lines2 = [json.loads(l) for l in f if l.strip()]
        check("seat: costs file APPENDS (2 calls -> 2 lines)", len(cost_lines2) == 2, "got %d" % len(cost_lines2))

        # B6: POST with top-level "model" -> 400, mock saw zero NEW requests, no new cost line
        _MockUpstreamHandler.seen_bodies.clear()
        st6, raw6, _ = req("POST", base + "/seat", dict(genesis_body, turnId="seat-t6", model="glm-5.2"))
        check("B6: top-level model key -> 400, mock saw zero requests, no cost line",
              st6 == 400 and len(_MockUpstreamHandler.seen_bodies) == 0,
              "status=%s mockSeen=%d body=%r" % (st6, len(_MockUpstreamHandler.seen_bodies), raw6[:150]))
        with open(costs_path, encoding="utf-8") as f:
            cost_lines_b6 = [json.loads(l) for l in f if l.strip()]
        check("B6: no cost line written for the rejected request", len(cost_lines_b6) == 2, "got %d" % len(cost_lines_b6))

        # B7: POST with top-level "stream" -> 400
        st7, raw7, _ = req("POST", base + "/seat", dict(genesis_body, turnId="seat-t7", stream=True))
        check("B7: top-level stream key -> 400", st7 == 400, "status=%s body=%r" % (st7, raw7[:150]))

        # B8: POST with messages: [] -> 400
        st8, raw8, _ = req("POST", base + "/seat", dict(genesis_body, turnId="seat-t8", messages=[]))
        check("B8: empty messages[] -> 400", st8 == 400, "status=%s body=%r" % (st8, raw8[:150]))

        # B9: POST with turnId "../x" -> 400 (red: today's un-fixed /seat accepts it)
        st9, raw9, _ = req("POST", base + "/seat", dict(genesis_body, turnId="../x"))
        check("B9: path-escaping turnId -> 400", st9 == 400, "status=%s body=%r" % (st9, raw9[:150]))

        # E11: a browser messages[] entry carrying role:"system" -> 400 (two channels for the system
        # prompt is drift bait -- it travels ONLY in the top-level "system" field).
        st11, raw11, _ = req("POST", base + "/seat", dict(genesis_body, turnId="seat-t11",
                              messages=[{"role": "system", "content": "sneaky"}]))
        check("E11: a messages[] entry with role=system -> 400 (bad message role)",
              st11 == 400 and b"bad message role" in raw11, "status=%s body=%r" % (st11, raw11[:150]))

        # §1.1.4: an entry with EXTRA keys is accepted, but the bridge forwards ONLY {role,content} --
        # extra keys stripped before hitting the upstream wire.
        _MockUpstreamHandler.seen_bodies.clear()
        st_extra, raw_extra, _ = req("POST", base + "/seat", dict(genesis_body, turnId="seat-extra",
                                      messages=[{"role": "user", "content": "hi", "name": "extra-field"}]))
        up_body_extra = _MockUpstreamHandler.seen_bodies[-1] if _MockUpstreamHandler.seen_bodies else None
        check("extra message keys are accepted but stripped before forwarding upstream",
              st_extra == 200 and up_body_extra is not None and
              up_body_extra["messages"][-1] == {"role": "user", "content": "hi"},
              "status=%s got=%s" % (st_extra, up_body_extra and up_body_extra.get("messages")))

        # --- the hard safety gate: the fake key must be absent from EVERYTHING written to disk ---
        offenders = []
        for fp in glob.glob(os.path.join(dm_dir, "*")) + glob.glob(os.path.join(dm_dir, "**", "*"), recursive=True):
            if os.path.isfile(fp):
                try:
                    with open(fp, "rb") as f:
                        if FAKE_SEAT_KEY.encode() in f.read():
                            offenders.append(fp)
                except OSError:
                    pass
        check("seat: API key ABSENT from every file under .dm/ (cost log, mailbox, everything)",
              not offenders, "found key in: %s" % offenders)
        check("seat: API key ABSENT from the relayed response body",
              FAKE_SEAT_KEY.encode() not in raw, "key leaked into client response")

    finally:
        proc.terminate()
        try: proc.wait(timeout=3)
        except Exception: proc.kill()
        mock.shutdown()
        mock.server_close()

    # --- B11: upstream never sends its own [DONE] -- bridge still terminates usage frame + [DONE] ---
    mock_port_nd = free_port()
    mock_nd = _start_mock(mock_port_nd, _MockUpstreamHandlerNoDone)
    bridge_port_nd = free_port()
    proc_nd, base_nd = _start_bridge(bridge_port_nd, "http://127.0.0.1:%d" % mock_port_nd,
                                      {"SEAT_MODEL_DEEP": "glm-5.2", "SEAT_MODEL_FAST": "glm-4.7"})
    try:
        req_json("POST", base_nd + "/reset")
        st_nd, raw_nd, _ = req("POST", base_nd + "/seat", dict(genesis_body, turnId="seat-nodone"))
        check("B11: no-[DONE] mock variant -- client stream still ends usage frame + bridge-emitted [DONE]",
              st_nd == 200 and raw_nd.count(b"data: [DONE]") == 1 and raw_nd.rstrip().endswith(b"data: [DONE]") and
              b'"usage"' in raw_nd,
              "status=%s tail=%r" % (st_nd, raw_nd[-120:]))
    finally:
        proc_nd.terminate()
        try: proc_nd.wait(timeout=3)
        except Exception: proc_nd.kill()
        mock_nd.shutdown(); mock_nd.server_close()

    # --- B12: staggered mock (two deltas, 1.2s apart) -- first delta arrives well before stream close ---
    mock_port_sg = free_port()
    mock_sg = _start_mock(mock_port_sg, _MockUpstreamHandlerStaggered)
    bridge_port_sg = free_port()
    proc_sg, base_sg = _start_bridge(bridge_port_sg, "http://127.0.0.1:%d" % mock_port_sg,
                                      {"SEAT_MODEL_DEEP": "glm-5.2", "SEAT_MODEL_FAST": "glm-4.7"})
    try:
        req_json("POST", base_sg + "/reset")
        import http.client
        conn = http.client.HTTPConnection("127.0.0.1", bridge_port_sg, timeout=10)
        t_start = time.time()
        body = json.dumps(dict(genesis_body, turnId="seat-stagger")).encode()
        conn.request("POST", "/seat", body=body, headers={"Content-Type": "application/json"})
        resp = conn.getresponse()
        first_delta_t = None
        buf = b""
        while True:
            # read1(), NOT read(): a connection-close-delimited response makes plain read(n) wait for
            # the WHOLE stream via BufferedReader's readahead-fill behavior -- read1(n) does at most one
            # raw-stream read, which is what actually proves incremental delivery here (same fix as
            # dm-bridge.py's own upstream-reading loop, same underlying CPython http.client quirk).
            chunk = resp.read1(256)
            if not chunk:
                break
            buf += chunk
            if first_delta_t is None and b'"delta"' in buf:
                first_delta_t = time.time()
        total_t = time.time()
        conn.close()
        check("B12: first delta frame arrives >=1.0s before stream close (proves no whole-stream buffering)",
              first_delta_t is not None and (total_t - first_delta_t) >= 1.0,
              "first_delta_lag=%.2fs total=%.2fs" % ((first_delta_t or 0) - t_start, total_t - t_start))
    finally:
        proc_sg.terminate()
        try: proc_sg.wait(timeout=3)
        except Exception: proc_sg.kill()
        mock_sg.shutdown(); mock_sg.server_close()

    # --- missing-key case: a bridge with NO seat env configured -> clean 503, nothing written ---
    bare_port = free_port()
    bare_env = dict(os.environ, GENESIS_PORT=str(bare_port))
    for k in ("SEAT_BASE_URL", "SEAT_API_KEY"):
        bare_env.pop(k, None)
    bare_proc = subprocess.Popen([sys.executable, os.path.join(ROOT, "dev", "dm-bridge.py")],
                                 env=bare_env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    bare_base = "http://127.0.0.1:%d" % bare_port
    try:
        for _ in range(50):
            try:
                st, _ = req_json("GET", bare_base + "/dm/health")
                if st == 200: break
            except Exception: pass
            time.sleep(0.1)
        else:
            check("bare bridge (no seat env) came up", False, "did not start"); return
        req_json("POST", bare_base + "/reset")
        st, raw, _ = req("POST", bare_base + "/seat", {"turnId": "x", "lane": "deep", "model": "glm-5.2"})
        check("seat: missing SEAT_API_KEY -> clean 503 (no traceback)", st == 503, "status %s body %r" % (st, raw[:200]))
        try:
            err = json.loads(raw)
            check("seat: 503 body is clean JSON with no stack trace", "error" in err and "Traceback" not in raw.decode("utf-8", "ignore"),
                  "got %r" % raw)
        except Exception:
            check("seat: 503 body is clean JSON with no stack trace", False, "not JSON: %r" % raw)
        bare_dm = os.path.join(ROOT, ".dm")
        bare_costs = os.path.join(bare_dm, "seat-costs.jsonl")
        check("seat: missing-key call writes no cost line", not os.path.exists(bare_costs) or
              os.path.getsize(bare_costs) == 0, "cost file unexpectedly populated")
    finally:
        bare_proc.terminate()
        try: bare_proc.wait(timeout=3)
        except Exception: bare_proc.kill()

def main():
    port = free_port()
    env = dict(os.environ, GENESIS_PORT=str(port))
    proc = subprocess.Popen([sys.executable, os.path.join(ROOT, "dev", "dm-bridge.py")],
                            env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    base = "http://127.0.0.1:%d" % port
    try:
        # wait for health
        for _ in range(50):
            try:
                st, _ = req_json("GET", base + "/dm/health");
                if st == 200: break
            except Exception: pass
            time.sleep(0.1)
        else:
            print("bridge did not come up"); return 1

        print("bridge up on", base)
        req_json("POST", base + "/reset")

        # static serve
        try:
            with urllib.request.urlopen(base + "/genesis.html", timeout=5) as r:
                html = r.read().decode("utf-8", "ignore")
            check("serves genesis.html", "<html" in html.lower() and "src/world/dm.js" in html,
                  "app HTML missing or dm.js not wired")
        except Exception as e:
            check("serves genesis.html", False, str(e))

        # dev cache-busting: modules must be served no-store (no stale-cache trap)
        try:
            with urllib.request.urlopen(base + "/src/world/dm.js", timeout=5) as r:
                cc = (r.headers.get("Cache-Control") or "").lower()
            check("modules served no-store (no stale-cache trap)", "no-store" in cc, "Cache-Control: %r" % cc)
        except Exception as e:
            check("modules served no-store (no stale-cache trap)", False, str(e))

        # state snapshot round-trip
        st, _ = req_json("POST", base + "/state", {"worlds": {"w-x": {"name": "Probe"}}, "activeWorldId": "w-x"})
        check("POST /state ok", st == 200, "status %s" % st)
        st, body = req_json("GET", base + "/state")
        check("GET /state round-trips", st == 200 and body and body["activeWorldId"] == "w-x", "got %s" % (body,))

        # replay each fixture
        turns = sorted(glob.glob(os.path.join(FIX, "*.turn.json")))
        check("fixtures present", len(turns) >= 3, "found %d" % len(turns))
        for tp in turns:
            name = os.path.basename(tp)[:-len(".turn.json")]
            turn = json.load(open(tp))
            tid  = turn["turnId"]
            st, body = req_json("POST", base + "/turn", turn)
            check("[%s] POST /turn echoes id" % name, st == 200 and body.get("turnId") == tid, "got %s" % (body,))

            st, _ = req_json("GET", base + "/response?turnId=" + tid)
            check("[%s] /response 204 before DM answers" % name, st == 204, "got %s" % st)

            resp_path = os.path.join(FIX, name + ".response.json")
            resp = json.load(open(resp_path))
            st, _ = req_json("POST", base + "/response", resp)
            check("[%s] DM POST /response ok" % name, st == 200, "got %s" % st)

            st, got = req_json("GET", base + "/response?turnId=" + tid)
            check("[%s] /response 200 after answer" % name,
                  st == 200 and got and got.get("turnId") == tid and got.get("narration"),
                  "got %s" % st)

            # contract: envelope conformance
            ok_env = True
            for e in (resp.get("events") or []):
                if e.get("type") not in EVENT_TYPES or "payload" not in e or e.get("source") not in ("declared","detected"):
                    ok_env = False
            check("[%s] events conform to EVENT-CONTRACT envelope" % name, ok_env,
                  "bad type/payload/source in %s" % name)

            # contract: rolls live ON the turn, never in the response (the DM can't fabricate them)
            check("[%s] DM response carries no rolls[] field" % name, "rolls" not in resp,
                  "DM must never resolve rolls")

        # --- /seat origin guard (HOTFIX-QUEUE-2026-07-06 H5) ---
        # SEAT env is unset on this bridge instance -- the guard must fire BEFORE the 503
        # config check, so a cross-origin POST never reaches that check at all.
        st, raw, hdrs = req("POST", base + "/seat",
                             {"turnId": "x", "lane": "deep", "model": "glm-5.2"},
                             headers={"Origin": "http://evil.example"})
        check("seat origin guard: cross-origin POST /seat -> 403", st == 403,
              "status %s body %r" % (st, raw[:200]))

        st, raw, hdrs = req("POST", base + "/seat",
                             {"turnId": "x", "lane": "deep", "model": "glm-5.2"},
                             headers={"Origin": base})
        check("seat origin guard: same-origin POST /seat -> 503 (config check reached)",
              st == 503, "status %s body %r" % (st, raw[:200]))

        st, raw, hdrs = req("POST", base + "/seat",
                             {"turnId": "x", "lane": "deep", "model": "glm-5.2"})
        check("seat origin guard: no-Origin POST /seat -> 503 (curl/harness allowed through)",
              st == 503, "status %s body %r" % (st, raw[:200]))

        st, raw, hdrs = req("OPTIONS", base + "/seat")
        check("seat origin guard: OPTIONS /seat carries NO Access-Control-Allow-Origin",
              "Access-Control-Allow-Origin" not in hdrs, "headers: %r" % hdrs)

        st, raw, hdrs = req("OPTIONS", base + "/turn")
        check("seat origin guard: OPTIONS /turn still carries Access-Control-Allow-Origin: * (mailbox unchanged)",
              hdrs.get("Access-Control-Allow-Origin") == "*", "headers: %r" % hdrs)
    finally:
        proc.terminate()
        try: proc.wait(timeout=3)
        except Exception: proc.kill()

    # DM-SEAT proxy cases run against their OWN bridge instances (need SEAT_* env), separate
    # from the mailbox bridge above.
    print("\nseat proxy checks:")
    run_seat_checks()

    print("\n%d passed, %d failed" % (PASS, FAIL))
    return 0 if FAIL == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
