#!/usr/bin/env python3
"""gen-face-tokens.py — crop creature faces out of the sprite register into
circular tokens.

Deterministic head-finding heuristic (no ML, no network), exploiting what the
register guarantees: transparent background, full-body creature, 3/4 view
facing left, consistent framing.

  1. Alpha-threshold -> opaque bounding box.
  2. Body-plan switch on bbox aspect: upright (head = top slice, full width)
     vs wide/quadruped (head = upper-LEFT zone, since sprites face left).
  3. Alpha-weighted centroid of the head zone = face center.
  4. Square crop around it -> dark disc + circular mask + gold ring token.

Honest-failure doctrine: each token gets a confidence flag; low-confidence
slugs are listed for eyeball review (or a vision-model fallback lane).

Usage:
  python3 build/gen-face-tokens.py <out_dir> [--size 160] [--montage] <slug|png> ...
  python3 build/gen-face-tokens.py <out_dir> --all          # whole register
"""
import sys, os, csv, math
import numpy as np
from PIL import Image, ImageDraw

SPRITE_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sprites")
ALPHA_T = 40           # opacity threshold
UPRIGHT_ZONE = 0.34    # top fraction of bbox holding the head (upright plan)
WIDE_ASPECT = 1.25     # bbox w/h beyond which we treat as wide/quadruped
WIDE_ZONE_H = 0.55     # wide plan: top fraction...
WIDE_ZONE_W = 0.45     # ...and left fraction (sprites face left)
RING = "#c9a84c"       # vision-quest gold
DISC = "#2a2118"       # board umber


def find_face(im):
    """Return (cx, cy, side, confidence) in source-image pixels."""
    a = np.asarray(im.convert("RGBA"))[:, :, 3]
    ys, xs = np.nonzero(a > ALPHA_T)
    if len(xs) == 0:
        return None
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    bw, bh = x1 - x0 + 1, y1 - y0 + 1
    wide = (bw / bh) > WIDE_ASPECT
    if wide:
        # quadrupeds/long bodies face LEFT: the head is the leftmost mass,
        # at any height (wolves carry it low) — not the upper-left centroid,
        # which lands on shoulder fur.
        zx1 = x0 + int(bw * 0.30)
        zone = a[y0:y1 + 1, x0:zx1]
        zoff = (x0, y0)
        side = max(int(bh * 0.62), 40)
    else:
        zy1 = y0 + int(bh * UPRIGHT_ZONE)
        zone = a[y0:zy1, x0:x1 + 1]
        zoff = (x0, y0)
        side = max(int(bh * 0.55), 40)
    m = (zone > ALPHA_T).astype(np.float64)
    total = m.sum()
    if total < 20:
        return None
    zys, zxs = np.nonzero(m)
    cx = zoff[0] + zxs.mean()
    cy = zoff[1] + zys.mean()
    # confidence: how much of the zone is actually occupied, and how central
    # the centroid sits inside the zone (edge-hugging centroids smell wrong)
    coverage = total / m.size
    conf = "ok" if coverage > 0.10 else "low"
    return (cx, cy, side, conf, "wide" if wide else "upright")


def make_token(src_path, out_path, size=160, override=None):
    im = Image.open(src_path).convert("RGBA")
    if override:
        conf, plan = "override", "override"
        if "x0" in override:
            # head BOUNDING BOX (normalized) — circle fits the whole box + margin
            x0, y0 = override["x0"] * im.width, override["y0"] * im.height
            x1, y1 = override["x1"] * im.width, override["y1"] * im.height
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            # CIRCLE-GEOMETRY LAW: the token is a circular mask over a square
            # crop, and a circle inscribed on the box CLIPS ITS CORNERS —
            # plume tips, hat points, ears, and horns live in corners. The
            # circle must cover the box DIAGONAL, so nothing boxed is ever
            # rim-cut. margin is applied on top of the diagonal.
            side = int(math.hypot(x1 - x0, y1 - y0) * override.get("margin", 1.06))
        else:
            # legacy center-point form
            cx = override["cx"] * im.width
            cy = override["cy"] * im.height
            side = int(override.get("side", 0.35) * im.height)
    else:
        hit = find_face(im)
        if hit is None:
            return None
        cx, cy, side, conf, plan = hit
    half = side // 2
    # square crop, padded with transparency where it overruns the image
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sx0, sy0 = int(cx - half), int(cy - half)
    sx1, sy1 = sx0 + side, sy0 + side
    px0, py0 = max(0, -sx0), max(0, -sy0)
    crop = im.crop((max(0, sx0), max(0, sy0), min(im.width, sx1), min(im.height, sy1)))
    canvas.paste(crop, (px0, py0))
    face = canvas.resize((size, size), Image.NEAREST)  # keep the pixel crunch

    token = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(token)
    d.ellipse([2, 2, size - 3, size - 3], fill=DISC)
    masked = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([4, 4, size - 5, size - 5], fill=255)
    masked.paste(face, (0, 0), mask)
    token.alpha_composite(masked)
    ImageDraw.Draw(token).ellipse([2, 2, size - 3, size - 3], outline=RING, width=5)
    token.save(out_path)
    return conf, plan


def montage(entries, out_path, size=160, cols=6):
    from PIL import ImageFont
    rows = math.ceil(len(entries) / cols)
    pad, label_h = 12, 26
    W = cols * (size + pad) + pad
    H = rows * (size + label_h + pad) + pad
    sheet = Image.new("RGBA", (W, H), "#1a1410")
    d = ImageDraw.Draw(sheet)
    for i, (name, tok_path, conf) in enumerate(entries):
        r, c = divmod(i, cols)
        x = pad + c * (size + pad)
        y = pad + r * (size + label_h + pad)
        sheet.alpha_composite(Image.open(tok_path).convert("RGBA"), (x, y))
        label = name + ("  ⚠" if conf == "low" else "")
        d.text((x + 4, y + size + 4), label[:24], fill="#e8ddc8")
    sheet.convert("RGB").save(out_path)


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    out_dir = args.pop(0)
    os.makedirs(out_dir, exist_ok=True)
    size = 160
    want_montage = False
    if "--size" in args:
        i = args.index("--size"); size = int(args[i + 1]); del args[i:i + 2]
    if "--montage" in args:
        args.remove("--montage"); want_montage = True
    overrides = {}
    if "--overrides" in args:
        import json
        i = args.index("--overrides")
        with open(args[i + 1]) as f:
            overrides = json.load(f)
        del args[i:i + 2]
    if args == ["--all"]:
        args = sorted(f[:-4] for f in os.listdir(SPRITE_DIR) if f.endswith(".png"))
    entries, report = [], []
    for name in args:
        slug = name[:-4] if name.endswith(".png") else name
        src = os.path.join(SPRITE_DIR, slug + ".png")
        if not os.path.exists(src):
            print(f"  MISSING {slug}"); continue
        out = os.path.join(out_dir, slug.replace("spr-fantasy-", "tok-") + ".png")
        res = make_token(src, out, size, override=overrides.get(slug))
        if res is None:
            print(f"  EMPTY   {slug}"); report.append((slug, "empty", "-")); continue
        conf, plan = res
        short = slug.replace("spr-fantasy-", "")
        entries.append((short, out, conf))
        report.append((slug, conf, plan))
    with open(os.path.join(out_dir, "report.csv"), "w", newline="") as f:
        csv.writer(f).writerows([("slug", "confidence", "plan")] + report)
    lows = [r for r in report if r[1] not in ("ok", "override")]
    print(f"{len(entries)} tokens -> {out_dir}  ({len(lows)} flagged for review)")
    if want_montage and entries:
        mp = os.path.join(out_dir, "_montage.png")
        montage(entries, mp, size)
        print(f"montage -> {mp}")


if __name__ == "__main__":
    main()
