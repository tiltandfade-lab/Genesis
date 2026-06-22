#!/usr/bin/env python3
"""Grid-slice the icon sheets into exact, named tiles (no fragmentation).
Detects the content bbox, divides it into cols×rows equal cells, magenta-keys + trims each cell.
big-icons → extracted/icons/<name>.png (named) + a labeled contact; micro-icons → extracted/micro/NN.png.
Run from this dir:  python3 slice-grid.py"""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFont

MAGENTA = np.array([255, 0, 255], float)
T_IN, T_OUT = 60.0, 130.0

BIG_NAMES = [  # reading order, 6 cols × 5 rows
    "book-arcane","helm","compass","scales","book-open","sun",
    "backpack","sword-shield","banner","quill","d20","wand",
    "tome","potion","anvil","hand","council","speech",
    "pin","hourglass","campfire","heart","shield","medallion",
    "key","eye","boot","paw","crown","temple",
]

def alpha_from_magenta(rgb):
    d = np.sqrt(((rgb.astype(float) - MAGENTA) ** 2).sum(axis=2))
    return (np.clip((d - T_IN) / (T_OUT - T_IN), 0, 1) * 255).astype(np.uint8)

def content_bbox(alpha):
    ys, xs = np.where(alpha > 40)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def slice_sheet(path, cols, rows, names=None, outdir="extracted/out"):
    im = Image.open(path).convert("RGBA"); arr = np.array(im)
    alpha = alpha_from_magenta(arr[:, :, :3]); arr[:, :, 3] = alpha
    x0, y0, x1, y1 = content_bbox(alpha)
    cw, ch = (x1 - x0) / cols, (y1 - y0) / rows
    os.makedirs(outdir, exist_ok=True)
    tiles = []
    for r in range(rows):
        for c in range(cols):
            i = r * cols + c
            cx0, cy0 = int(round(x0 + c * cw)), int(round(y0 + r * ch))
            cx1, cy1 = int(round(x0 + (c + 1) * cw)), int(round(y0 + (r + 1) * ch))
            cell = arr[cy0:cy1, cx0:cx1]
            ys, xs = np.where(cell[:, :, 3] > 40)
            if ys.size == 0: continue
            tile = Image.fromarray(cell[ys.min():ys.max()+1, xs.min():xs.max()+1])
            nm = (names[i] if names and i < len(names) else f"{i+1:03d}")
            tile.save(os.path.join(outdir, nm + ".png"))
            tiles.append((nm, tile))
    return tiles

def labeled_contact(tiles, path, cols=6, cell=170):
    rows = (len(tiles) + cols - 1) // cols
    canvas = Image.new("RGBA", (cols * cell, rows * cell), (38, 38, 44, 255))
    d = ImageDraw.Draw(canvas)
    try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
    except Exception: font = ImageFont.load_default()
    for i, (nm, t) in enumerate(tiles):
        s = t.copy(); s.thumbnail((cell - 28, cell - 40))
        cx = (i % cols) * cell + (cell - s.width)//2; cy = (i // cols) * cell + 8
        canvas.alpha_composite(s, (cx, cy))
        d.text(((i % cols) * cell + cell//2, (i // cols) * cell + cell - 16), nm, fill=(220,210,180,255), anchor="mm", font=font)
    canvas.convert("RGB").save(path)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    big = slice_sheet("big-icons_flat-magenta.png", 6, 5, BIG_NAMES, "extracted/icons")
    print(f"big-icons  → {len(big)} named tiles in extracted/icons/")
    labeled_contact(big, "extracted/icons_labeled.png")
    micro = slice_sheet("micro-icons_flat-magenta.png", 12, 9, None, "extracted/micro")
    print(f"micro-icons → {len(micro)} numbered tiles in extracted/micro/")
