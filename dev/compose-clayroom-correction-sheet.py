#!/usr/bin/env python3
"""Compose a labeled evidence sheet for the Clayroom visual-correction packet.

Usage:
  python3 dev/compose-clayroom-correction-sheet.py <spec.json> <out.png>

spec.json:
  { "title": "...", "subtitle": "...", "columns": 3,
    "panels": [ { "image": "path.png", "label": "...", "note": "..." }, ... ] }

Presentation only — it never edits or re-renders a capture; every pixel inside a panel is the
banked capture file, downscaled uniformly. Labels live in the chrome around the panels.
"""
import json
import sys
from PIL import Image, ImageDraw, ImageFont

BG = (16, 17, 20)
PANEL_BG = (24, 25, 30)
BORDER = (58, 60, 70)
TITLE_C = (235, 236, 240)
LABEL_C = (222, 224, 230)
NOTE_C = (156, 160, 172)


def font(size, bold=False):
    names = (["/System/Library/Fonts/Menlo.ttc"] if not bold
             else ["/System/Library/Fonts/Menlo.ttc"])
    for n in names:
        try:
            return ImageFont.truetype(n, size, index=1 if bold else 0)
        except Exception:
            continue
    return ImageFont.load_default()


def main():
    spec = json.load(open(sys.argv[1]))
    out_path = sys.argv[2]
    cols = spec.get("columns", 3)
    cell_w = spec.get("cellWidth", 840)
    pad = 18
    label_h = 64
    title_h = 96

    panels = []
    for p in spec["panels"]:
        im = Image.open(p["image"]).convert("RGB")
        scale = cell_w / im.width
        im = im.resize((cell_w, max(1, round(im.height * scale))), Image.LANCZOS)
        panels.append((im, p.get("label", ""), p.get("note", "")))

    rows = [panels[i:i + cols] for i in range(0, len(panels), cols)]
    row_heights = [max(im.height for im, _, _ in row) + label_h + pad for row in rows]
    W = cols * (cell_w + pad) + pad
    H = title_h + sum(row_heights) + pad

    sheet = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(sheet)
    f_title = font(34, bold=True)
    f_sub = font(15)
    f_label = font(17, bold=True)
    f_note = font(13)

    d.text((pad + 4, 18), spec.get("title", ""), fill=TITLE_C, font=f_title)
    d.text((pad + 6, 62), spec.get("subtitle", ""), fill=NOTE_C, font=f_sub)

    y = title_h
    idx = 0
    for r, row in enumerate(rows):
        x = pad
        for im, label, note in row:
            d.rectangle([x - 2, y - 2, x + cell_w + 2, y + row_heights[r] - pad + 2],
                        outline=BORDER, width=1, fill=PANEL_BG)
            d.text((x + 8, y + 8), label, fill=LABEL_C, font=f_label)
            if note:
                d.text((x + 8, y + 32), note, fill=NOTE_C, font=f_note)
            sheet.paste(im, (x, y + label_h))
            x += cell_w + pad
            idx += 1
        y += row_heights[r]

    sheet.save(out_path)
    print("SHEET_DONE", out_path, f"{W}x{H}", f"panels={idx}")


if __name__ == "__main__":
    main()
