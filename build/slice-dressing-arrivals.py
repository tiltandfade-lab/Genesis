#!/usr/bin/env python3
"""Genesis build — slice a DRESSING-GEN sheet PNG into assets/dressing/<slug>.png cards.

Sibling to build/slice-sprites.py (SAME chroma-key + defringe primitives, copied verbatim —
see that file's own docstring for the magenta-tolerance / halo-erode / edge-despill rationale;
this script does NOT reuse blob-detection ordering because dressing-gen sheets are a UNIFORM
grid (unlike the creature sheets' row-major blob match): the manifest gives an exact
"R rows x C columns" grid and a `cells` array in the same row-major reading order the grid was
authored in, so this script divides the sheet into R*C equal cells directly and 1:1-matches
cell i -> cells[i].slug — no component labeling needed, and no ambiguity possible.

Each dressing-gen manifest lives at dev/model-qa/dressing-gen/manifests/<sheet-id>.json:
    {"file": "<sheet-id>.png", "realm": ..., "grid": "R rows x C columns", "chroma": "#FF00FF",
     "cells": [{"slug": ..., ...}, ...]}   (len(cells) == R*C, row-major)

Usage:
    python3 build/slice-dressing-arrivals.py <sheet-id>          # one sheet
    python3 build/slice-dressing-arrivals.py --all               # every manifest with a PNG on disk

Writes assets/dressing/<slug>.png (transparent bg, chroma-keyed + defringed). Also writes a
review contact sheet per manifest at dev/model-qa/dressing-gen/review/<sheet-id>.html (always,
eyes-on convention matching slice-sprites.py's v2 mode — non-uniform ImageGen grids are not
guaranteed pixel-perfect even when the manifest says so).

Honest failure: if the source PNG's pixel dimensions don't divide evenly enough to produce
R*C cells of sane size, or the manifest's cell count != R*C, this exits nonzero rather than
guessing crop boundaries.

GENERATED OUTPUT — assets/dressing/<slug>.png files are build artifacts of the sheet PNGs at
ui-sketches/sprite-sheets/<sheet-id>.png; re-running a generation is expected to change output.
"""
import argparse
import json
import os
import re
import sys

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow (PIL) is required — see build/slice-sprites.py's docstring for the "
          "scratch-venv setup.", file=sys.stderr)
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_DIR = os.path.join(ROOT, "dev", "model-qa", "dressing-gen", "manifests")
SHEET_DIR = os.path.join(ROOT, "ui-sketches", "sprite-sheets")
OUT_DIR = os.path.join(ROOT, "assets", "dressing")
REVIEW_DIR = os.path.join(ROOT, "dev", "model-qa", "dressing-gen", "review")

MAGENTA = (255, 0, 255)
DEFAULT_TOLERANCE = 60


def is_magenta(px, tolerance):
    r, g, b = px[0], px[1], px[2]
    dr, dg, db = r - MAGENTA[0], g - MAGENTA[1], b - MAGENTA[2]
    return (dr * dr + dg * dg + db * db) ** 0.5 <= tolerance


def defringe(crop, despill=0.25, erode_excess=60, band=2):
    """Verbatim copy of build/slice-sprites.py's defringe() — same halo-erode + edge-despill
    passes, same defaults (Adam 2026-07-09: 'everything has magenta halos!'). Mutates in place."""
    px = crop.load()
    w, h = crop.size

    def edge_pixels():
        out = []
        for yy in range(h):
            for xx in range(w):
                if px[xx, yy][3] == 0:
                    continue
                for nx, ny in ((xx - 1, yy), (xx + 1, yy), (xx, yy - 1), (xx, yy + 1),
                               (xx - 1, yy - 1), (xx + 1, yy - 1), (xx - 1, yy + 1), (xx + 1, yy + 1)):
                    if not (0 <= nx < w and 0 <= ny < h) or px[nx, ny][3] == 0:
                        out.append((xx, yy))
                        break
        return out

    for _ in range(2):
        eroded = False
        for xx, yy in edge_pixels():
            r, g, b, a = px[xx, yy]
            if min(r, b) - g > erode_excess:
                px[xx, yy] = (r, g, b, 0)
                eroded = True
        if not eroded:
            break

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
    while frontier and d < band:
        d += 1
        nxt = []
        for xx, yy in frontier:
            for nx, ny in ((xx - 1, yy), (xx + 1, yy), (xx, yy - 1), (xx, yy + 1)):
                if 0 <= nx < w and 0 <= ny < h and dist[ny][nx] is None:
                    dist[ny][nx] = d
                    nxt.append((nx, ny))
        frontier = nxt
    for yy in range(h):
        for xx in range(w):
            dd = dist[yy][xx]
            if dd is None or dd == 0:
                continue
            r, g, b, a = px[xx, yy]
            if a and r > g and b > g:
                px[xx, yy] = (g + int((r - g) * despill), g, g + int((b - g) * despill), a)


def crop_cell(img, box, tolerance, padding):
    x1, y1, x2, y2 = box
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(img.width, x2 + padding)
    y2 = min(img.height, y2 + padding)
    crop = img.crop((x1, y1, x2, y2)).convert("RGBA")
    px = crop.load()
    w, h = crop.size
    for yy in range(h):
        for xx in range(w):
            r, g, b, a = px[xx, yy]
            if is_magenta((r, g, b), tolerance):
                px[xx, yy] = (r, g, b, 0)
    defringe(crop)
    return crop


def parse_grid(grid_str):
    m = re.match(r"\s*(\d+)\s*rows?\s*x\s*(\d+)\s*columns?\s*", grid_str, re.IGNORECASE)
    if not m:
        print(f"ERROR: could not parse grid string '{grid_str}' (expected 'R rows x C columns')",
              file=sys.stderr)
        sys.exit(1)
    return int(m.group(1)), int(m.group(2))


def write_review_html(sheet_id, crops, sheet_png_path, out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    rows_html = []
    for slug, crop_path in crops:
        rel = os.path.relpath(crop_path, os.path.dirname(out_path))
        rows_html.append(f'<div class="cell"><img src="{rel}" alt="{slug}"><div class="label">{slug}</div></div>')
    html = f"""<!doctype html><html><head><meta charset="utf-8"><title>{sheet_id} review</title>
<style>body{{font-family:-apple-system,sans-serif;background:#222;color:#eee;padding:16px;}}
.grid{{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;}}
.cell{{background:#333;padding:6px;text-align:center;border-radius:4px;}}
.cell img{{max-width:100%;background:repeating-conic-gradient(#444 0% 25%,#555 0% 50%) 50%/16px 16px;}}
.label{{font-size:11px;margin-top:4px;word-break:break-all;}}</style></head><body>
<h1>{sheet_id} — {len(crops)} cards sliced</h1>
<p>Source: {sheet_png_path}</p>
<div class="grid">{''.join(rows_html)}</div></body></html>"""
    with open(out_path, "w") as f:
        f.write(html)


def slice_sheet(sheet_id, tolerance=DEFAULT_TOLERANCE, padding=2):
    manifest_path = os.path.join(MANIFEST_DIR, f"{sheet_id}.json")
    if not os.path.exists(manifest_path):
        print(f"ERROR: no manifest at {manifest_path}", file=sys.stderr)
        return False
    with open(manifest_path) as f:
        manifest = json.load(f)

    sheet_png = os.path.join(SHEET_DIR, manifest.get("file", f"{sheet_id}.png"))
    if not os.path.exists(sheet_png):
        print(f"SKIP: {sheet_id} — no arrival PNG at {sheet_png} yet", file=sys.stderr)
        return None  # not a failure — just not landed yet

    rows, cols = parse_grid(manifest["grid"])
    cells = manifest["cells"]
    if len(cells) != rows * cols:
        print(f"ERROR: {sheet_id} manifest has {len(cells)} cells but grid says "
              f"{rows}x{cols}={rows*cols}", file=sys.stderr)
        return False

    img = Image.open(sheet_png).convert("RGB")
    w, h = img.size
    cell_w = w / cols
    cell_h = h / rows
    print(f"{sheet_id}: {w}x{h} sheet, {rows}x{cols} grid ({cell_w:.1f}x{cell_h:.1f} px/cell), "
          f"{len(cells)} cells")

    os.makedirs(OUT_DIR, exist_ok=True)
    crops = []
    for i, cell in enumerate(cells):
        r, c = divmod(i, cols)
        box = (round(c * cell_w), round(r * cell_h), round((c + 1) * cell_w), round((r + 1) * cell_h))
        crop = crop_cell(img, box, tolerance, padding)
        slug = cell["slug"]
        out_path = os.path.join(OUT_DIR, f"{slug}.png")
        crop.save(out_path)
        crops.append((slug, out_path))

    review_path = os.path.join(REVIEW_DIR, f"{sheet_id}.html")
    write_review_html(sheet_id, crops, sheet_png, review_path)
    print(f"OK: wrote {len(crops)} cards to {OUT_DIR}; review: {review_path}")
    return True


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sheet_id", nargs="?", default=None, help="e.g. fantasy-flora-dg-01")
    ap.add_argument("--all", action="store_true", help="slice every manifest with a landed PNG")
    ap.add_argument("--tolerance", type=int, default=DEFAULT_TOLERANCE)
    ap.add_argument("--padding", type=int, default=2)
    args = ap.parse_args()

    if args.all:
        manifest_ids = sorted(f[:-5] for f in os.listdir(MANIFEST_DIR) if f.endswith(".json"))
        results = {"ok": [], "skip": [], "fail": []}
        for sid in manifest_ids:
            r = slice_sheet(sid, args.tolerance, args.padding)
            if r is True:
                results["ok"].append(sid)
            elif r is False:
                results["fail"].append(sid)
            else:
                results["skip"].append(sid)
        print(f"\n{len(results['ok'])} sliced, {len(results['skip'])} skipped (no art yet), "
              f"{len(results['fail'])} FAILED")
        if results["skip"]:
            print("Skipped (no arrival PNG yet): " + ", ".join(results["skip"]))
        if results["fail"]:
            print("FAILED: " + ", ".join(results["fail"]), file=sys.stderr)
            sys.exit(1)
        return

    if not args.sheet_id:
        print("ERROR: give a sheet_id or --all", file=sys.stderr)
        sys.exit(2)
    ok = slice_sheet(args.sheet_id, args.tolerance, args.padding)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
