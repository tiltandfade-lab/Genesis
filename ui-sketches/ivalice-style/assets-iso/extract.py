#!/usr/bin/env python3
"""Isolate individual elements from the flat-magenta asset sheets.
Feathered magenta chroma-key → transparency, connected-component isolation, trim, save each as a
transparent PNG in extracted/<sheet>/NN.png (reading order). Also writes extracted/<sheet>_contact.png
(all pieces on a dark checker) for visual verification.  Run from this dir:  python3 extract.py"""
import os, glob, numpy as np
from PIL import Image
from scipy import ndimage

MAGENTA = np.array([255, 0, 255], float)
T_IN, T_OUT = 60.0, 130.0      # dist<T_IN → fully bg(transparent); >T_OUT → fully opaque; between → feather
MIN_AREA = 220                  # drop noise specks
DILATE = 3                      # bridge anti-alias gaps / detached dots so one element labels as one piece
OUT = "extracted"

def alpha_from_magenta(rgb):
    d = np.sqrt(((rgb.astype(float) - MAGENTA) ** 2).sum(axis=2))
    a = np.clip((d - T_IN) / (T_OUT - T_IN), 0, 1)
    return (a * 255).astype(np.uint8)

def reading_order(boxes):
    # cluster by row (y-center within half the median height), then left-to-right
    if not boxes: return []
    hs = sorted(b[3] - b[1] for b in boxes); med = hs[len(hs)//2]
    rows, cur = [], []
    for b in sorted(boxes, key=lambda b: (b[1] + b[3]) / 2):
        cy = (b[1] + b[3]) / 2
        if cur and cy - ((cur[0][1] + cur[0][3]) / 2) > med * 0.6:
            rows.append(cur); cur = []
        cur.append(b)
    if cur: rows.append(cur)
    out = []
    for r in rows: out.extend(sorted(r, key=lambda b: b[0]))
    return out

def process(path):
    name = os.path.basename(path).replace("_flat-magenta", "").replace(".png", "")
    im = Image.open(path).convert("RGBA"); arr = np.array(im)
    rgb = arr[:, :, :3]
    alpha = alpha_from_magenta(rgb)
    fg = alpha > 40
    lbl, n = ndimage.label(ndimage.binary_dilation(fg, iterations=DILATE))
    boxes = []
    for i in range(1, n + 1):
        ys, xs = np.where(lbl == i)
        if ys.size < MIN_AREA: continue
        boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    boxes = reading_order(boxes)
    outdir = os.path.join(OUT, name); os.makedirs(outdir, exist_ok=True)
    out = arr.copy(); out[:, :, 3] = alpha           # apply the keyed alpha
    pieces = []
    for idx, (x0, y0, x1, y1) in enumerate(boxes, 1):
        tile = Image.fromarray(out[y0:y1, x0:x1], "RGBA")
        tile.save(os.path.join(outdir, f"{idx:02d}.png"))
        pieces.append(tile)
    contact(pieces, os.path.join(OUT, name + "_contact.png"))
    print(f"{name:16} {len(pieces):3d} pieces  → {outdir}/")
    return name, len(pieces)

def contact(pieces, path, cols=8, cell=150, pad=8):
    if not pieces: return
    rows = (len(pieces) + cols - 1) // cols
    W, H = cols * cell, rows * cell
    canvas = Image.new("RGBA", (W, H), (40, 40, 46, 255))
    for k in range(0, W, 24):           # checker so transparency is visible
        for j in range(0, H, 24):
            if (k // 24 + j // 24) % 2: Image.new("RGBA",(24,24),(54,54,62,255)) and canvas.paste((54,54,62,255),(k,j,k+24,j+24))
    for i, p in enumerate(pieces):
        s = p.copy(); s.thumbnail((cell - pad*2, cell - pad*2))
        cx = (i % cols) * cell + (cell - s.width)//2; cy = (i // cols) * cell + (cell - s.height)//2
        canvas.alpha_composite(s, (cx, cy))
    canvas.convert("RGB").save(path)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    total = 0
    for f in sorted(glob.glob("*_flat-magenta.png")):
        if "hex-tile" in f: continue   # a single tiled art piece on parchment, not magenta-keyed elements
        _, c = process(f); total += c
    print(f"\ntotal: {total} pieces extracted")
