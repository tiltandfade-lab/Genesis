#!/usr/bin/env python3
"""Genesis dev — sprite review tool (server half).

Serves dev/sprite-review.html plus a tiny JSON API that acts DIRECTLY on the repo —
no copy-paste round-trips:

  GET  /                → the review UI
  GET  /sprites/<slug>.png → the cut (legacy v3) sprite from assets/sprites/
  GET  /sprites-faceted/<slug>.png → the faceted-wave candidate cut from assets/sprites-faceted/
                          (VQ2-RESPEC.md S6) — same slug namespace, both routes 403 on any
                          attempt to escape their root directory and 404 on an unknown/uncut slug.
  GET  /api/data        → { registry, overlay } — SPRITE_REGISTRY (parsed out of
                          data/sprite-registry.js via a node one-liner) deep-merged view,
                          plus the raw overlay. Registry entries already carry candidateAsset/
                          legacyAsset/artStyleVersion/qaStatus/worldHeight/heightSource (S3/B1).
  POST /api/overlay     → body {"slug": "...", "set": {...}, "clear": ["key", ...]}
                          merges into dev/model-qa/sprite-tags-overlay.json (atomic write).
                          Recognized keys: scale (number, per-slug billboard height multiplier
                          — the heads-line-up calibration), verdict ("pass"|"fail"), note,
                          tags (list), redlined (bool), footX/footY (normalized canonical
                          standee origin), contentBounds (normalized alpha bbox; floor remains
                          a readable legacy migration key), feet
                          (number, 0.1-100 — Adam's expected-height override; VQ2-RESPEC.md S6,
                          folds into worldHeight/heightSource:"overlay" at regen, top source in
                          the ladder ahead of measured/band-default). An entry emptied of every
                          key is removed.
  POST /api/regen       → runs build/gen-sprite-registry.py so the overlay folds into
                          data/sprite-registry.js (what the theater actually reads).

The overlay file is the ONLY thing this server writes (plus the regen side effect above).
Registry/manifest stay generated-only per the repo discipline.

Run:  python3 dev/sprite-review.py   → http://127.0.0.1:5179/
"""

import json
import os
import re
import subprocess
import sys
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY_JS = os.path.join(ROOT, "data", "sprite-registry.js")
OVERLAY = os.path.join(ROOT, "dev", "model-qa", "sprite-tags-overlay.json")
SPRITES_DIR = os.path.join(ROOT, "assets", "sprites")
# VQ2-RESPEC.md S6 — the faceted-wave candidate cuts (S2's build/cut-faceted.py output).
SPRITES_FACETED_DIR = os.path.join(ROOT, "assets", "sprites-faceted")
UI_HTML = os.path.join(ROOT, "dev", "sprite-review.html")
PORT = 5179

SLUG_RE = re.compile(r"^spr-[a-z0-9-]+$")


def parse_registry():
    """data/sprite-registry.js is a JS object literal (unquoted keys) — let node eval it
    and hand back JSON rather than half-parsing JS in Python."""
    script = (
        'const fs=require("fs");'
        f'const src=fs.readFileSync({json.dumps(REGISTRY_JS)},"utf8");'
        'eval(src.replace(/const SPRITE_REGISTRY=/,"globalThis.SPRITE_REGISTRY="));'
        "process.stdout.write(JSON.stringify(globalThis.SPRITE_REGISTRY));"
    )
    out = subprocess.run(["node", "-e", script], capture_output=True, text=True, cwd=ROOT)
    if out.returncode != 0:
        raise RuntimeError(f"node failed to parse {REGISTRY_JS}: {out.stderr[:500]}")
    return json.loads(out.stdout)


def load_overlay():
    if not os.path.exists(OVERLAY):
        return {}
    with open(OVERLAY, encoding="utf-8") as f:
        return json.load(f)


def save_overlay(data):
    """Atomic write (tmp + rename) so a mid-write crash never corrupts the redline surface."""
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(OVERLAY), suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, sort_keys=True)
            f.write("\n")
        os.replace(tmp, OVERLAY)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


ALLOWED_KEYS = {
    "scale", "verdict", "note", "tags", "redlined", "reusable",
    "floor", "footX", "footY", "contentBounds", "feet",
}


def apply_patch(slug, set_keys, clear_keys):
    if not SLUG_RE.match(slug or ""):
        raise ValueError(f"bad slug: {slug!r}")
    data = load_overlay()
    entry = dict(data.get(slug) or {})
    for k, v in (set_keys or {}).items():
        if k not in ALLOWED_KEYS:
            raise ValueError(f"unknown overlay key: {k}")
        if k == "scale":
            v = float(v)
            if not (0.05 <= v <= 10):
                raise ValueError(f"scale out of range: {v}")
            if abs(v - 1.0) < 1e-9:  # scale 1 = no calibration; keep the overlay sparse
                entry.pop("scale", None)
                continue
        if k == "floor":
            # ground-contact line: fraction of the sprite image's height measured UP from
            # its bottom edge (0 = the bottom edge IS the floor). The theater mounts the
            # figurine disc at this line. LEGACY migration input only; new edits write the
            # canonical top-down footY coordinate below.
            v = float(v)
            if not (0.0 <= v <= 0.9):
                raise ValueError(f"floor out of range (0..0.9): {v}")
            if v < 1e-9:
                entry.pop("floor", None)
                continue
            v = round(v, 4)
        if k in ("footX", "footY"):
            v = float(v)
            if not (0.0 <= v <= 1.0):
                raise ValueError(f"{k} out of range (0..1): {v}")
            v = round(v, 6)
        if k == "contentBounds":
            if not (isinstance(v, list) and len(v) == 4
                    and all(isinstance(n, (int, float)) for n in v)):
                raise ValueError("contentBounds must be four normalized numbers")
            v = [round(float(n), 6) for n in v]
            if not all(0.0 <= n <= 1.0 for n in v) or v[0] > v[2] or v[1] > v[3]:
                raise ValueError(f"contentBounds invalid normalized bbox: {v}")
        if k == "feet":
            # Adam's expected-height override (VQ2-RESPEC.md S6) — the TOP source in
            # build/gen-sprite-registry.py's worldHeight ladder (overlay > measured > SRD
            # band-default > loud null). Sane range only; no "sparse" no-op value here (unlike
            # scale/floor) since there's no default height to elide against — clear it via the
            # "clear" list instead.
            v = float(v)
            if not (0.1 <= v <= 100):
                raise ValueError(f"feet out of range (0.1..100): {v}")
            v = round(v, 3)
        if k == "verdict" and v not in ("pass", "fail"):
            raise ValueError(f"verdict must be pass|fail, got {v!r}")
        if k == "tags" and not (isinstance(v, list) and all(isinstance(t, str) for t in v)):
            raise ValueError("tags must be a list of strings")
        if k == "note" and not isinstance(v, str):
            raise ValueError("note must be a string")
        entry[k] = v
    for k in clear_keys or []:
        entry.pop(k, None)
    if entry:
        data[slug] = entry
    else:
        data.pop(slug, None)
    save_overlay(data)
    return entry


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        payload = body if isinstance(body, bytes) else json.dumps(body).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, fmt, *args):  # keep the console readable
        if "/sprites/" not in (args[0] if args else "") and "/sprites-faceted/" not in (args[0] if args else ""):
            sys.stderr.write("[review] " + (fmt % args) + "\n")

    def _serve_sprite(self, prefix, dir_root):
        """Serve <dir_root>/<slug>.png for a route mounted at `prefix` (e.g. "/sprites/").
        Belt-and-suspenders traversal guard: decode the raw suffix BEFORE any filesystem join
        so an encoded "..", "/" or "\\" is caught as a 403 explicitly, then re-confirm the
        resolved path never leaves dir_root (403 too) before falling back to slug-shape/
        existence 404s. SLUG_RE alone already blocks this (a traversal payload never matches
        ^spr-[a-z0-9-]+$), but VQ2-RESPEC.md S6 asks for the 403 explicitly, not a 404."""
        from urllib.parse import unquote
        raw = unquote(self.path[len(prefix):])
        if "/" in raw or "\\" in raw or ".." in raw:
            self._send(403, {"error": "forbidden"})
            return
        name = raw
        if not (name.endswith(".png") and SLUG_RE.match(name[:-4])):
            self._send(404, {"error": "bad sprite path"})
            return
        root_real = os.path.realpath(dir_root)
        p = os.path.realpath(os.path.join(dir_root, name))
        if not (p == root_real or p.startswith(root_real + os.sep)):
            self._send(403, {"error": "forbidden"})
            return
        if not os.path.exists(p):
            self._send(404, {"error": "no such sprite"})
            return
        with open(p, "rb") as f:
            self._send(200, f.read(), "image/png")

    def do_GET(self):
        try:
            request_path = urlsplit(self.path).path
            if request_path in ("/", "/index.html"):
                with open(UI_HTML, "rb") as f:
                    self._send(200, f.read(), "text/html; charset=utf-8")
            elif request_path.startswith("/sprites-faceted/"):
                self._serve_sprite("/sprites-faceted/", SPRITES_FACETED_DIR)
            elif request_path.startswith("/sprites/"):
                self._serve_sprite("/sprites/", SPRITES_DIR)
            elif request_path == "/api/data":
                self._send(200, {"registry": parse_registry(), "overlay": load_overlay()})
            elif request_path == "/rejects":
                p = os.path.join(ROOT, "dev", "sprite-manifests", "REJECTS.md")
                body = open(p, "rb").read() if os.path.exists(p) else \
                    b"No REJECTS.md yet - hit 'regen registry' after failing something."
                self._send(200, body, "text/plain; charset=utf-8")
            else:
                self._send(404, {"error": "not found"})
        except Exception as e:  # dev tool: surface the error to the UI, don't die
            self._send(500, {"error": str(e)})

    def do_POST(self):
        try:
            n = int(self.headers.get("Content-Length") or 0)
            body = json.loads(self.rfile.read(n) or b"{}")
            if self.path == "/api/overlay":
                entry = apply_patch(body.get("slug"), body.get("set"), body.get("clear"))
                self._send(200, {"ok": True, "slug": body.get("slug"), "entry": entry})
            elif self.path == "/api/regen":
                out = subprocess.run(
                    [sys.executable, os.path.join(ROOT, "build", "gen-sprite-registry.py")],
                    capture_output=True, text=True, cwd=ROOT, timeout=120,
                )
                self._send(200 if out.returncode == 0 else 500, {
                    "ok": out.returncode == 0,
                    "stdout": out.stdout[-2000:], "stderr": out.stderr[-2000:],
                })
            else:
                self._send(404, {"error": "not found"})
        except Exception as e:
            self._send(500, {"error": str(e)})


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    parse_registry()  # fail fast if node/registry is broken, before claiming the port
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"sprite review → http://127.0.0.1:{port}/  (overlay: {os.path.relpath(OVERLAY, ROOT)})")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
