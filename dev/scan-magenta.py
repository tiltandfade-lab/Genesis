#!/usr/bin/env python3
"""Genesis dev — magenta-leak scanner (SPRITE-RESCUE U1).

Scans every cut sprite in assets/sprites/ for magenta-cast pixels left behind by the
slicer's edge-only defringe() (build/slice-sprites.py:283, which only treats a 2px band
by design — interior purples are intentionally spared there). This script measures BOTH
edge and interior contamination so the U6 vision triage + U2/U3 unmix lanes know which
sprites need repair.

A pixel counts as magenta-cast when it is opaque (alpha > 0) AND
`min(r, b) - g > margin` (excess over green). Among cast pixels:
  - `edge`     — within 2px of transparency, BFS distance, same convention as
                 build/slice-sprites.py:defringe() (the crop border counts as
                 transparency too, since sprites at the bbox edge have none).
  - `interior` — every other cast pixel (dist > 2 or unreached by the BFS).
  - `strong`   — interior pixels whose excess exceeds `strong` (severe leak).
  - `pct`      — (edge + interior) / opaque * 100, rounded to one decimal.

Output: dev/sprite-manifests/magenta-scan.json (generated, committed) —
  { "_generated_by": "dev/scan-magenta.py",
    "_thresholds": {"margin": 50, "strong": 110},
    "<slug>": {"opaque": N, "edge": N, "interior": N, "strong": N, "pct": N.N},
    ... }

Run:  python3 dev/scan-magenta.py [--sprites-dir assets/sprites] [--out PATH] [--check]
  --check   verify the file on disk matches a fresh scan (drift-guard); exits 2 on
            mismatch, never writes. Without --check, (re)writes the file atomically.
"""

import argparse
import json
import os
import re
import sys
import tempfile

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow (PIL) is required — pip install pillow", file=sys.stderr)
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SPRITES_DIR = os.path.join(ROOT, "assets", "sprites")
DEFAULT_OUT = os.path.join(ROOT, "dev", "sprite-manifests", "magenta-scan.json")

MARGIN = 50
STRONG = 110
BAND = 2  # edge-vs-interior cutoff, matches defringe()'s edge-band radius

SLUG_RE = re.compile(r"^spr-[a-z0-9-]+$")


def scan_one(path):
    """Return {opaque, edge, interior, strong, pct} for one PNG."""
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    px = img.load()

    opaque = 0
    cast = []  # list of (x, y, excess)
    for yy in range(h):
        for xx in range(w):
            r, g, b, a = px[xx, yy]
            if a == 0:
                continue
            opaque += 1
            excess = min(r, b) - g
            if excess > MARGIN:
                cast.append((xx, yy, excess))

    if not cast:
        return {"opaque": opaque, "edge": 0, "interior": 0, "strong": 0, "pct": 0.0}

    # BFS distance-from-transparency, crop border counts as transparency too —
    # same convention as build/slice-sprites.py:defringe().
    dist = [[None] * w for _ in range(h)]
    frontier = []
    for yy in range(h):
        for xx in range(w):
            if px[xx, yy][3] == 0:
                dist[yy][xx] = 0
                frontier.append((xx, yy))
    for xx in range(w):
        for yy in (0, h - 1):
            if dist[yy][xx] is None:
                dist[yy][xx] = 1
                frontier.append((xx, yy))
    for yy in range(h):
        for xx in (0, w - 1):
            if dist[yy][xx] is None:
                dist[yy][xx] = 1
                frontier.append((xx, yy))
    d = 0
    while frontier and d < BAND:
        d += 1
        nxt = []
        for xx, yy in frontier:
            for nx, ny in ((xx - 1, yy), (xx + 1, yy), (xx, yy - 1), (xx, yy + 1)):
                if 0 <= nx < w and 0 <= ny < h and dist[ny][nx] is None:
                    dist[ny][nx] = d
                    nxt.append((nx, ny))
        frontier = nxt

    edge = interior = strong = 0
    for xx, yy, excess in cast:
        dd = dist[yy][xx]
        if dd is not None and 0 < dd <= BAND:
            edge += 1
        else:
            interior += 1
            if excess > STRONG:
                strong += 1

    pct = round((edge + interior) / opaque * 100, 1) if opaque else 0.0
    return {"opaque": opaque, "edge": edge, "interior": interior, "strong": strong, "pct": pct}


def scan_dir(sprites_dir):
    result = {"_generated_by": "dev/scan-magenta.py",
              "_thresholds": {"margin": MARGIN, "strong": STRONG}}
    names = sorted(n for n in os.listdir(sprites_dir) if n.lower().endswith(".png"))
    for name in names:
        slug = name[:-4]
        if not SLUG_RE.match(slug):
            continue
        result[slug] = scan_one(os.path.join(sprites_dir, name))
    return result


def atomic_write(path, data):
    """Atomic write (tmp + rename) — mirrors dev/sprite-review.py:save_overlay."""
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, sort_keys=True)
            f.write("\n")
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


def histogram(scan):
    buckets = [("0", lambda n: n == 0), ("1-20", lambda n: 1 <= n <= 20),
               ("21-100", lambda n: 21 <= n <= 100), ("101-500", lambda n: 101 <= n <= 500),
               (">500", lambda n: n > 500)]
    counts = {label: 0 for label, _ in buckets}
    entries = [v for k, v in scan.items() if not k.startswith("_")]
    for e in entries:
        n = e["interior"]
        for label, pred in buckets:
            if pred(n):
                counts[label] += 1
                break
    flagged = sum(1 for e in entries if (e["edge"] + e["interior"]) > 20)
    print(f"scanned {len(entries)} sprites")
    print("interior-leak histogram: " +
          ", ".join(f"{label}={counts[label]}" for label, _ in buckets))
    print(f"flagged (edge+interior > 20px): {flagged}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--sprites-dir", default=DEFAULT_SPRITES_DIR)
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--check", action="store_true",
                     help="verify the file on disk matches a fresh scan; never write")
    args = ap.parse_args()

    fresh = scan_dir(args.sprites_dir)

    if args.check:
        if not os.path.exists(args.out):
            print(f"DRIFT: {args.out} does not exist", file=sys.stderr)
            sys.exit(2)
        with open(args.out, encoding="utf-8") as f:
            on_disk = json.load(f)
        if on_disk != fresh:
            print(f"DRIFT: {args.out} does not match a fresh scan", file=sys.stderr)
            sys.exit(2)
        histogram(fresh)
        sys.exit(0)

    atomic_write(args.out, fresh)
    histogram(fresh)
    sys.exit(0)


if __name__ == "__main__":
    main()
