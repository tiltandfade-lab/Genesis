#!/usr/bin/env python3
"""Verify the DM Bridge round-trip (spec: docs/DM-BRIDGE.md §"Build order" step 5).

Dependency-free. Spawns dev/dm-bridge.py on an ephemeral port, replays every fixture pair
through the real HTTP contract, and asserts:
  · POST /turn echoes the turnId and stores the turn
  · GET /response is 204 (pending) BEFORE the DM answers, 200 with the body AFTER
  · the static app is actually served (GET /genesis.html)
  · POST /state then GET /state round-trips the snapshot
  · every fixture response's events[] conform to the EVENT-CONTRACT envelope (type/payload/source)

This proves the transport + contract. The in-browser EVENT runtime (applyEvent through the real
mutators) is exercised separately — see dev/verify-dm-events.mjs (jsdom).

Run:  python3 dev/verify-bridge.py
"""
import json, os, sys, time, socket, subprocess, urllib.request, urllib.error, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIX  = os.path.join(ROOT, "dev", "fixtures")

def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p

def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method,
                               headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r, timeout=5) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, None

PASS = 0; FAIL = 0
def check(name, cond, detail=""):
    global PASS, FAIL
    if cond: PASS += 1; print("  ✓", name)
    else:    FAIL += 1; print("  ✗", name, "—", detail)

EVENT_TYPES = {"front_closed","clock_fired","clock_advanced","fact_canonized","discovery",
               "encounter_resolved","kill","choice_logged","inspiration_granted","level_applied","adjudication"}

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
                st, _ = req("GET", base + "/dm/health");
                if st == 200: break
            except Exception: pass
            time.sleep(0.1)
        else:
            print("bridge did not come up"); return 1

        print("bridge up on", base)
        req("POST", base + "/reset")

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
        st, _ = req("POST", base + "/state", {"worlds": {"w-x": {"name": "Probe"}}, "activeWorldId": "w-x"})
        check("POST /state ok", st == 200, "status %s" % st)
        st, body = req("GET", base + "/state")
        check("GET /state round-trips", st == 200 and body and body["activeWorldId"] == "w-x", "got %s" % (body,))

        # replay each fixture
        turns = sorted(glob.glob(os.path.join(FIX, "*.turn.json")))
        check("fixtures present", len(turns) >= 3, "found %d" % len(turns))
        for tp in turns:
            name = os.path.basename(tp)[:-len(".turn.json")]
            turn = json.load(open(tp))
            tid  = turn["turnId"]
            st, body = req("POST", base + "/turn", turn)
            check("[%s] POST /turn echoes id" % name, st == 200 and body.get("turnId") == tid, "got %s" % (body,))

            st, _ = req("GET", base + "/response?turnId=" + tid)
            check("[%s] /response 204 before DM answers" % name, st == 204, "got %s" % st)

            resp_path = os.path.join(FIX, name + ".response.json")
            resp = json.load(open(resp_path))
            st, _ = req("POST", base + "/response", resp)
            check("[%s] DM POST /response ok" % name, st == 200, "got %s" % st)

            st, got = req("GET", base + "/response?turnId=" + tid)
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

        print("\n%d passed, %d failed" % (PASS, FAIL))
        return 0 if FAIL == 0 else 1
    finally:
        proc.terminate()
        try: proc.wait(timeout=3)
        except Exception: proc.kill()

if __name__ == "__main__":
    sys.exit(main())
