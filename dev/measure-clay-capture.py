#!/usr/bin/env python3
"""Measure a Clayroom capture PNG (docs/CLAYROOM-RESET-LADDER.md, "Capture and receipt law").

Green unit tests do not prove colour. This turns a banked capture into the small set of NUMBERS
CL-R0/CL-R1 actually argue about — clipped highlights, luma distribution, chroma retention — over
deterministic normalized regions (the same rectangles dev/capture-clayroom-fixture.cjs declares in
its receipt), so a before/after pair is a measurement, not two impressions.

    python3 dev/measure-clay-capture.py <png> [<png> ...] [--json out.json]

Metrics per region:
  meanLuma / medianLuma / p05Luma / p95Luma  Rec.709 luma, 0-255
  clippedHighlightPct                        % of pixels with all three channels >= 250
  crushedShadowPct                           % of pixels with all three channels <= 5
  meanSaturation                             HSV S, 0-255 (chroma retention proxy)
  meanChromaSpread                           mean(max(RGB) - min(RGB)); a neutral clay surface
                                             should sit LOW here, a coloured sprite HIGH
  neutralPct                                 % of pixels with chroma spread <= 6 (how much of the
                                             region is genuinely achromatic clay)

No verdicts: this script reports, it never passes or fails a capture.
"""
import json
import sys

from PIL import Image

# KEEP IN SYNC with dev/capture-clayroom-fixture.cjs's own REGIONS (it echoes them into every
# receipt, so a receipt always records the rectangles its numbers were taken over).
REGIONS = {
    "full": (0.00, 0.00, 1.00, 1.00),
    "floor": (0.42, 0.73, 0.58, 0.86),
    "sprite": (0.25, 0.37, 0.35, 0.60),
    "crate": (0.53, 0.38, 0.69, 0.75),
    "doorframe": (0.84, 0.38, 0.95, 0.62),
}


def measure_region(img, box):
    w, h = img.size
    x0, y0, x1, y1 = box
    crop = img.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))).convert("RGB")
    px = list(crop.getdata())
    n = len(px)
    if not n:
        return None
    lumas, sats, spreads = [], [], []
    clipped = crushed = neutral = 0
    for r, g, b in px:
        lumas.append(0.2126 * r + 0.7152 * g + 0.0722 * b)
        mx, mn = max(r, g, b), min(r, g, b)
        spread = mx - mn
        spreads.append(spread)
        sats.append(0 if mx == 0 else 255 * spread / mx)
        if r >= 250 and g >= 250 and b >= 250:
            clipped += 1
        if r <= 5 and g <= 5 and b <= 5:
            crushed += 1
        if spread <= 6:
            neutral += 1
    lumas.sort()
    return {
        "pixels": n,
        "meanLuma": round(sum(lumas) / n, 2),
        "medianLuma": round(lumas[n // 2], 2),
        "p05Luma": round(lumas[int(n * 0.05)], 2),
        "p95Luma": round(lumas[int(n * 0.95)], 2),
        "clippedHighlightPct": round(100.0 * clipped / n, 3),
        "crushedShadowPct": round(100.0 * crushed / n, 3),
        "meanSaturation": round(sum(sats) / n, 2),
        "meanChromaSpread": round(sum(spreads) / n, 2),
        "neutralPct": round(100.0 * neutral / n, 2),
    }


def main(argv):
    out_path = None
    if "--json" in argv:
        i = argv.index("--json")
        out_path = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    if not argv:
        print(__doc__)
        return 2
    results = {}
    for p in argv:
        img = Image.open(p)
        results[p] = {"size": list(img.size), "regions": {k: measure_region(img, v) for k, v in REGIONS.items()}}
        print(f"\n== {p}  ({img.size[0]}x{img.size[1]})")
        for name, m in results[p]["regions"].items():
            print(f"  {name:7s} luma mean {m['meanLuma']:6.2f} med {m['medianLuma']:6.2f} "
                  f"p95 {m['p95Luma']:6.2f} | clipped {m['clippedHighlightPct']:6.3f}% "
                  f"crushed {m['crushedShadowPct']:6.3f}% | sat {m['meanSaturation']:6.2f} "
                  f"spread {m['meanChromaSpread']:5.2f} neutral {m['neutralPct']:6.2f}%")
    if out_path:
        with open(out_path, "w") as fh:
            json.dump(results, fh, indent=2)
        print(f"\nwrote {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
