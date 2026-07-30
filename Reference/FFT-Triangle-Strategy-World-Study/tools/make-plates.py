#!/usr/bin/env python3
"""Analytical-plate generator for the FFT × Triangle Strategy world study.

Renders, for one packet frame, the eight §9.3 analytical views as a single
composite sheet written to local-analysis-plates/ (gitignored — plates may
contain copyrighted pixels; this script contains none).

Panels:
  1 full frame            5 elevation/route markup   (from annotation JSON)
  2 playable-floor mask   6 fg/mg/ff band markup     (from annotation JSON)
  3 grayscale value       7 material-family swatches (from annotation JSON)
  4 silhouette/major-mass 8 focal-hierarchy markup   (from annotation JSON)

Annotation JSON shape (all coordinates normalized 0..1 on the frame):
{
  "routes":   [{"pts": [[x,y],...], "kind": "primary|secondary", "label": "..."}],
  "bands":    [{"poly": [[x,y],...], "tier": 0, "label": "low approach"}],
  "depth":    {"fg": y0, "mg": y1},          # horizontal band split lines
  "materials":[{"xy": [x,y], "label": "grass"}],
  "focal":    [{"xy": [x,y], "r": 0.06, "rank": 1, "label": "gate"}],
  "floorMask":"auto-nonblack" | "none"       # FFT renders sit on black void
}
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageOps, ImageFilter

TIER_COLORS = [(70, 110, 200), (90, 170, 120), (210, 180, 80), (200, 110, 70), (180, 80, 160)]
ROUTE_COLORS = {"primary": (255, 80, 40), "secondary": (60, 200, 255)}


def nn(img, w):
    h = round(img.height * w / img.width)
    return img.resize((w, h), Image.NEAREST)


def floor_mask(img, mode):
    g = img.convert("L")
    if mode == "auto-nonblack":
        m = g.point(lambda p: 255 if p > 14 else 0)
        return ImageOps.colorize(m, (20, 20, 30), (90, 220, 120))
    return Image.new("RGB", img.size, (40, 40, 48))


def silhouette(img):
    g = img.convert("L").filter(ImageFilter.GaussianBlur(1))
    return ImageOps.colorize(ImageOps.posterize(g, 2), (10, 10, 14), (235, 235, 225))


def denorm(pts, w, h):
    return [(x * w, y * h) for x, y in pts]


def overlay_routes_bands(img, ann):
    out = img.convert("RGB").copy()
    d = ImageDraw.Draw(out, "RGBA")
    w, h = out.size
    for b in ann.get("bands", []):
        col = TIER_COLORS[b.get("tier", 0) % len(TIER_COLORS)]
        d.polygon(denorm(b["poly"], w, h), fill=col + (70,), outline=col + (200,))
        xs = [p[0] for p in denorm(b["poly"], w, h)]; ys = [p[1] for p in denorm(b["poly"], w, h)]
        d.text((min(xs) + 3, min(ys) + 2), f"T{b.get('tier',0)} {b.get('label','')}", fill=(255, 255, 255, 230))
    for r in ann.get("routes", []):
        col = ROUTE_COLORS.get(r.get("kind", "primary"), (255, 80, 40))
        d.line(denorm(r["pts"], w, h), fill=col + (255,), width=max(3, w // 160))
        d.text(denorm(r["pts"][:1], w, h)[0], r.get("label", ""), fill=col + (255,))
    return out


def overlay_depth(img, ann):
    out = img.convert("RGB").copy()
    d = ImageDraw.Draw(out, "RGBA")
    w, h = out.size
    dep = ann.get("depth")
    if dep:
        fg, mg = dep.get("fg"), dep.get("mg")
        if fg is not None:
            d.rectangle([0, fg * h, w, h], fill=(200, 80, 60, 60)); d.text((6, fg * h + 4), "FOREGROUND", fill=(255, 200, 190, 255))
        if mg is not None:
            d.rectangle([0, mg * h, w, (fg if fg else 1) * h], fill=(80, 160, 220, 50)); d.text((6, mg * h + 4), "MIDGROUND", fill=(200, 230, 255, 255))
            d.rectangle([0, 0, w, mg * h], fill=(240, 220, 120, 40)); d.text((6, 6), "FAR FIELD", fill=(255, 250, 200, 255))
    else:
        d.text((6, 6), "single-band diorama: no fg/ff (see notes)", fill=(255, 255, 255, 240))
    return out


def overlay_materials(img, ann):
    out = img.convert("RGB").copy()
    d = ImageDraw.Draw(out, "RGBA")
    w, h = out.size
    for i, m in enumerate(ann.get("materials", [])):
        x, y = m["xy"][0] * w, m["xy"][1] * h
        px = out.getpixel((int(min(x, w - 1)), int(min(y, h - 1))))
        d.ellipse([x - 7, y - 7, x + 7, y + 7], outline=(255, 255, 255, 255), width=2)
        sy = 8 + i * 20
        d.rectangle([w - 150, sy, w - 132, sy + 14], fill=px, outline=(255, 255, 255, 200))
        d.text((w - 126, sy), m["label"], fill=(255, 255, 255, 240))
    return out


def overlay_focal(img, ann):
    out = img.convert("RGB").copy()
    d = ImageDraw.Draw(out, "RGBA")
    w, h = out.size
    for f in ann.get("focal", []):
        x, y, r = f["xy"][0] * w, f["xy"][1] * h, f.get("r", 0.05) * w
        d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 210, 60, 255), width=3)
        d.text((x - r, y - r - 14), f"#{f.get('rank','?')} {f.get('label','')}", fill=(255, 220, 120, 255))
    return out


def make_sheet(frame_path, ann_path, out_path, title):
    img = Image.open(frame_path).convert("RGB")
    ann = json.load(open(ann_path)) if ann_path and os.path.exists(ann_path) else {}
    pw = 640
    panels = [
        ("1 full frame", nn(img, pw)),
        ("2 playable-floor mask", nn(floor_mask(img, ann.get("floorMask", "none")), pw)),
        ("3 grayscale value", nn(ImageOps.colorize(img.convert("L"), (0, 0, 0), (255, 255, 255)), pw)),
        ("4 silhouette / major mass", nn(silhouette(img), pw)),
        ("5 elevation + routes", nn(overlay_routes_bands(img, ann), pw)),
        ("6 fg / mg / far field", nn(overlay_depth(img, ann), pw)),
        ("7 material families", nn(overlay_materials(img, ann), pw)),
        ("8 focal hierarchy", nn(overlay_focal(img, ann), pw)),
    ]
    ph = max(p.height for _, p in panels) + 26
    sheet = Image.new("RGB", (pw * 4 + 50, ph * 2 + 60), (14, 14, 18))
    d = ImageDraw.Draw(sheet)
    d.text((10, 8), title, fill=(240, 240, 240))
    for k, (lbl, p) in enumerate(panels):
        x, y = 10 + (k % 4) * (pw + 10), 30 + (k // 4) * ph
        sheet.paste(p, (x, y + 20))
        d.text((x, y + 4), lbl, fill=(200, 200, 210))
    sheet.save(out_path)
    return out_path


if __name__ == "__main__":
    frame, ann, out, title = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    print(make_sheet(frame, ann if ann != "-" else None, out, title))
