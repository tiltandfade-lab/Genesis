#!/usr/bin/env python3
"""Verify the DM Bridge round-trip (spec: docs/DM-BRIDGE.md §"Build order" step 5;
DM-SEAT proxy cases per docs/DM-SEAT.md §4.2 / §5.2).

Dependency-free. Spawns dev/dm-bridge.py on an ephemeral port, replays every fixture pair
through the real HTTP contract, and asserts:
  · POST /turn echoes the turnId and stores the turn
  · GET /response is 204 (pending) BEFORE the DM answers, 200 with the body AFTER
  · the static app is actually served (GET /genesis.html)
  · POST /state then GET /state round-trips the snapshot
  · every fixture response's events[] conform to the EVENT-CONTRACT envelope (type/payload/source)

Then, against a second bridge instance configured with SEAT_BASE_URL/SEAT_API_KEY pointed at a
local mock upstream (spawned in-process, no network egress):
  · the mock upstream sees the injected Authorization: Bearer <key> header (key injection works)
  · the fake key string is ABSENT from every response body, every seat-costs.jsonl line, and
    every other file under .dm/ after the run (the hard safety gate — see CRITICAL SAFETY RULES)
  · the relayed SSE body matches the mock's canned stream byte-for-byte (passthrough fidelity)
  · the client actually receives the stream in the SSE `data: ...` framing (SSE relay)
  · one .dm/seat-costs.jsonl line got appended per call, with the right fields/model/lane
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

# ---- DM-SEAT mock upstream (docs/DM-SEAT.md §4.2) ----
# A tiny local stand-in for the OpenAI-compatible provider. Records the Authorization header it
# received (so the test can assert key injection) and streams back a canned SSE body with a
# trailing usage block. No network egress — 127.0.0.1 only, ephemeral port, in-process thread.
FAKE_SEAT_KEY = "sk-test-DO-NOT-LEAK-3f9a7c21"
CANNED_SSE = (
    b'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'
    b'data: {"choices":[{"delta":{"content":", traveler."}}]}\n\n'
    b'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":1000,"completion_tokens":200,'
    b'"prompt_tokens_details":{"cached_tokens":400}}}\n\n'
    b'data: [DONE]\n\n'
)

class _MockUpstreamHandler(http.server.BaseHTTPRequestHandler):
    seen_auth = []  # class-level: every Authorization header this mock ever received

    def log_message(self, fmt, *args):
        pass  # keep test output quiet

    def do_POST(self):
        if self.path != "/chat/completions":
            self.send_response(404); self.end_headers(); return
        n = int(self.headers.get("Content-Length") or 0)
        _ = self.rfile.read(n) if n else b""
        _MockUpstreamHandler.seen_auth.append(self.headers.get("Authorization", ""))
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.end_headers()
        self.wfile.write(CANNED_SSE)

class _MockUpstreamServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

def run_seat_checks():
    """Spawns its own bridge instance (SEAT_BASE_URL/SEAT_API_KEY pointed at a local mock
    upstream) plus a bridge instance with NO seat env, and runs the §4.2 cases against both.
    Both bridges bind ephemeral ports — never 5175."""
    mock_port = free_port()
    mock = _MockUpstreamServer(("127.0.0.1", mock_port), _MockUpstreamHandler)
    mock_thread = threading.Thread(target=mock.serve_forever, daemon=True)
    mock_thread.start()

    bridge_port = free_port()
    dm_dir = None
    env = dict(os.environ,
               GENESIS_PORT=str(bridge_port),
               SEAT_BASE_URL="http://127.0.0.1:%d" % mock_port,
               SEAT_API_KEY=FAKE_SEAT_KEY)
    proc = subprocess.Popen([sys.executable, os.path.join(ROOT, "dev", "dm-bridge.py")],
                            env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    base = "http://127.0.0.1:%d" % bridge_port
    try:
        for _ in range(50):
            try:
                st, _ = req_json("GET", base + "/dm/health")
                if st == 200: break
            except Exception: pass
            time.sleep(0.1)
        else:
            check("seat bridge came up", False, "did not start"); return
        req_json("POST", base + "/reset")
        dm_dir = os.path.join(ROOT, ".dm")

        seat_body = {
            "turnId": "seat-t1", "lane": "deep", "model": "glm-5.2",
            "messages": [{"role": "user", "content": "probe turn"}],
            "stream": True,
        }
        _MockUpstreamHandler.seen_auth.clear()
        st, raw, hdrs = req("POST", base + "/seat", seat_body)

        # key injection: the mock upstream must have seen the bearer key
        check("seat: key injected into upstream Authorization header",
              len(_MockUpstreamHandler.seen_auth) == 1 and
              _MockUpstreamHandler.seen_auth[0] == "Bearer " + FAKE_SEAT_KEY,
              "seen_auth=%r" % (_MockUpstreamHandler.seen_auth,))

        # passthrough fidelity + SSE relay: client got the mock's canned bytes back verbatim
        check("seat: passthrough fidelity (relayed SSE == mock's canned bytes)",
              raw == CANNED_SSE, "got %r" % (raw[:120],))
        check("seat: relay uses SSE framing (data: ... lines)",
              raw.startswith(b"data: ") and b"\n\ndata: " in raw, "got %r" % (raw[:80],))
        check("seat: response status 200", st == 200, "status %s" % st)

        # cost telemetry: exactly one line appended, with the right shape
        costs_path = os.path.join(dm_dir, "seat-costs.jsonl")
        with open(costs_path, encoding="utf-8") as f:
            cost_lines = [json.loads(l) for l in f if l.strip()]
        check("seat: one seat-costs.jsonl line appended", len(cost_lines) == 1, "got %d" % len(cost_lines))
        if cost_lines:
            c = cost_lines[0]
            check("seat: cost line has turnId/lane/model",
                  c.get("turnId") == "seat-t1" and c.get("lane") == "deep" and c.get("model") == "glm-5.2",
                  "got %s" % c)
            # usage block: prompt_tokens=1000, cached=400 -> tokensIn (non-cached) = 600
            check("seat: cost line tokens derived from usage block (tokensIn=600, cached=400, out=200)",
                  c.get("tokensIn") == 600 and c.get("tokensCached") == 400 and c.get("tokensOut") == 200,
                  "got %s" % c)
            # glm-5.2 sheet: 600*1.40 + 400*0.26 + 200*4.40, all /1e6
            expected_usd = round((600*1.40 + 400*0.26 + 200*4.40) / 1_000_000.0, 6)
            check("seat: cost line usd matches the dated price table",
                  c.get("usd") == expected_usd, "got %s want %s" % (c.get("usd"), expected_usd))

        # a second call appends a second line (never overwrites)
        seat_body2 = dict(seat_body, turnId="seat-t2", lane="fast", model="glm-4.7")
        req("POST", base + "/seat", seat_body2)
        with open(costs_path, encoding="utf-8") as f:
            cost_lines2 = [json.loads(l) for l in f if l.strip()]
        check("seat: costs file APPENDS (2 calls -> 2 lines)", len(cost_lines2) == 2, "got %d" % len(cost_lines2))

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
