#!/usr/bin/env python3
"""Genesis DM Bridge — the dev integration harness (spec: docs/DM-BRIDGE.md).

A tiny local server that does TWO jobs at once:
  1. serves the static app (replaces `python3 -m http.server` — one command runs everything), and
  2. acts as a DUMB MAILBOX between the browser app and the Claude Code DM.

NO GAME LOGIC LIVES HERE. The app remains the sole owner + applier of state (the anti-drift
cardinal rule: one implementation of the mutators, in-browser). The bridge only relays
turn/response files and stores a read-only `U` snapshot the DM can consult. See DM-BRIDGE.md
§"State ownership".

Mailbox layout (all under .dm/, git-ignored):
  turn-<turnId>.json      the app's TurnRequest          (app writes via POST /turn)
  response-<turnId>.json  the DM's TurnResponse           (DM writes via file or POST /response)
  state.json              latest full `U` snapshot         (app writes via POST /state)

Run:
    python3 dev/dm-bridge.py              # -> http://127.0.0.1:5175/genesis.html
    GENESIS_PORT=8080 python3 dev/dm-bridge.py

Then drive the DM with a `/loop` watch on the mailbox — see docs/DM-BRIDGE.md §"Runbook".
"""
import json, os, sys, time, glob, http.server, socketserver
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DM   = os.path.join(ROOT, ".dm")
PORT = int(os.environ.get("GENESIS_PORT", "5175"))
os.makedirs(DM, exist_ok=True)


def _read(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except OSError:
        return None


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
            txt = _read(os.path.join(DM, "response-%s.json" % tid))
            if txt is None:
                return self._nobody(204)            # pending — the DM hasn't answered yet
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
            body["turnId"] = tid
            body["_received"] = time.time()
            with open(os.path.join(DM, "turn-%s.json" % tid), "w", encoding="utf-8") as f:
                json.dump(body, f, indent=2)
            return self._json(200, {"turnId": tid})
        if u.path == "/response":                   # DM may POST instead of writing the file
            body = self._body()
            tid = (body or {}).get("turnId")
            if not tid:
                return self._json(400, {"error": "turnId required"})
            with open(os.path.join(DM, "response-%s.json" % tid), "w", encoding="utf-8") as f:
                json.dump(body, f, indent=2)
            return self._json(200, {"ok": True})
        if u.path == "/state":
            body = self._body()
            with open(os.path.join(DM, "state.json"), "w", encoding="utf-8") as f:
                json.dump(body if body is not None else {}, f, indent=2)
            return self._json(200, {"ok": True})
        if u.path == "/reset":                       # test: clear the mailbox
            for f in glob.glob(os.path.join(DM, "*.json")):
                os.remove(f)
            return self._json(200, {"ok": True, "cleared": True})
        return self._json(404, {"error": "no route: " + u.path})


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    os.chdir(ROOT)
    with Server(("127.0.0.1", PORT), Handler) as httpd:
        print("Genesis DM Bridge  ->  http://127.0.0.1:%d/genesis.html" % PORT)
        print("  mailbox:  %s" % DM)
        print("  routes:   POST /turn · GET /response?turnId · POST/GET /state · GET /dm/turns · POST /reset")
        print("  (Ctrl-C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nbridge down.")
