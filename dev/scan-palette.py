#!/usr/bin/env python3
"""Genesis dev — sheet palette-richness scanner (SPRITE-PALETTE P-C).

Port of the 2026-07-09 audit scan that measured the "monotone/duotone" complaint behind
SPRITE-PALETTE: most realms sit at hue-entropy 1.6-2.4 with the top-2 hues owning 60-83%
of chromatic pixels. This script re-runs that scan over a directory of un-sliced sheet
PNGs (ui-sketches/sprite-sheets/ by default — NOT the cut sprites in assets/sprites/,
which is scan-magenta.py's turf) and reports per-sheet + per-realm palette stats so the
next gen wave can be checked against SPRITE-PALETTE P4's advisory thresholds.

Per sheet: the magenta chroma-key background is excluded first (same "excess over green"
signature as scan-magenta.py, tuned wider for the flat #FF00FF-ish bg fill: `min(r, b) - g
> 60` AND `r > 150` AND `b > 150`), the sheet is downsampled to a 256px thumbnail (mean
stats don't need full-res, and 25-cell sheets are big), then every surviving pixel is
converted to HSV. Pixels with `s > 0.15` and `v > 0.12` count as "chromatic" — bright/inky
near-grays are excluded so hue stats aren't diluted by shading and linework. Chromatic
pixels are binned into 12 equal hue wedges (30 degrees each), each pixel's contribution
weighted by its own saturation ("chroma-weighted") so a wall of pale off-hue noise can't
outvote a smaller patch of a strong, deliberate color.

Per-sheet stats (all computed over the chromatic-pixel pool, post exclusion/filter):
  - `meanSat`    — mean saturation of chromatic pixels.
  - `hueEnt`     — Shannon entropy (bits) of the chroma-weighted hue-bin distribution.
                   Max = log2(12) = 3.58 bits (all 12 bins perfectly even).
  - `top2Share`  — the two heaviest hue bins' combined weight / total weight (duotone
                   read: high top2Share + low hueEnt = "two colors own the sheet").
  - `chromaticPct` — chromatic pixels / non-background pixels * 100.

Per-realm aggregate: sheets are grouped by filename prefix against the known realm list
(longest-prefix-first match, so the two-word realms `bright-kingdom`, `high-seas`,
`lost-world` aren't shadowed by a shorter false match), then each stat is the unweighted
mean across that realm's sheets.

`--targets` prints SPRITE-PALETTE P4's advisory thresholds beside each realm's aggregate,
with a per-realm PASS/FAIL mark. Default realms: hueEnt >= 2.6, top2Share <= 0.55,
chromaticPct >= 25. Chrome (P3's hyper-neon mandate) is stricter: hueEnt >= 2.9,
top2Share <= 0.45, chromaticPct >= 35. gloom + noir are P2-exempt — their restraint IS
the design, so they're marked EXEMPT instead of PASS/FAIL. This is advisory reporting
only (P4: "not a hard gate") — the script always exits 0.

Output: a plain-text table on stdout. No JSON is written (nothing downstream consumes
this scan yet; it's a taste instrument, not a build input).

Run:  python3 dev/scan-palette.py [DIR] [--targets]
  DIR         directory of sheet PNGs to scan (default: ui-sketches/sprite-sheets/)
  --targets   also print the P4 advisory-threshold table with per-realm PASS/FAIL/EXEMPT
"""

import argparse
import colorsys
import math
import os
import sys

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow (PIL) is required — pip install pillow", file=sys.stderr)
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SHEETS_DIR = os.path.join(ROOT, "ui-sketches", "sprite-sheets")

THUMB = 256
BG_MARGIN = 60      # min(r,b) - g threshold for the magenta chroma-key bg
BG_MIN_RB = 150     # r and b floor so a dark/desaturated pixel can't false-match
CHROMA_S_MIN = 0.15
CHROMA_V_MIN = 0.12
N_BINS = 12
MAX_ENTROPY = math.log2(N_BINS)  # 3.5849625... ~ 3.58

# Longest-prefix-first so two-word realms aren't shadowed by a shorter match
# (e.g. "bright-kingdom-..." must not be mistaken for a realm named "bright").
REALMS = [
    "bright-kingdom", "high-seas", "lost-world",
    "ash", "chrome", "cosmic", "fantasy", "frontier",
    "gloom", "noir", "suburb", "theater", "pc",
]
REALMS_BY_LEN = sorted(REALMS, key=len, reverse=True)

# P4 advisory thresholds. Chrome is the stricter hyper-neon row; gloom/noir are P2-exempt.
DEFAULT_TARGETS = {"hueEnt": 2.6, "top2Share": 0.55, "chromaticPct": 25.0}
CHROME_TARGETS = {"hueEnt": 2.9, "top2Share": 0.45, "chromaticPct": 35.0}
EXEMPT_REALMS = {"gloom", "noir"}


def realm_of(filename):
    """Match the known realm prefix off a sheet filename, longest prefix first."""
    stem = filename
    for realm in REALMS_BY_LEN:
        if stem == realm or stem.startswith(realm + "-"):
            return "pc-characters" if realm == "pc" else realm
    return None


def scan_one(path):
    """Return {meanSat, hueEnt, top2Share, chromaticPct} for one sheet PNG."""
    img = Image.open(path).convert("RGB")
    img.thumbnail((THUMB, THUMB))
    w, h = img.size
    px = img.load()

    bins = [0.0] * N_BINS
    sat_sum = 0.0
    chromatic = 0
    non_bg = 0

    for yy in range(h):
        for xx in range(w):
            r, g, b = px[xx, yy]
            if (min(r, b) - g) > BG_MARGIN and r > BG_MIN_RB and b > BG_MIN_RB:
                continue  # magenta chroma-key background
            non_bg += 1
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
            if ss > CHROMA_S_MIN and vv > CHROMA_V_MIN:
                chromatic += 1
                sat_sum += ss
                idx = min(int(hh * N_BINS), N_BINS - 1)
                bins[idx] += ss  # chroma-weighted

    if chromatic == 0 or non_bg == 0:
        return {"meanSat": 0.0, "hueEnt": 0.0, "top2Share": 0.0, "chromaticPct": 0.0}

    total_weight = sum(bins)
    if total_weight <= 0:
        hue_ent = 0.0
        top2_share = 0.0
    else:
        probs = [wgt / total_weight for wgt in bins if wgt > 0]
        hue_ent = -sum(p * math.log2(p) for p in probs)
        top2_share = sum(sorted(bins, reverse=True)[:2]) / total_weight

    return {
        "meanSat": sat_sum / chromatic,
        "hueEnt": hue_ent,
        "top2Share": top2_share,
        "chromaticPct": chromatic / non_bg * 100.0,
    }


def scan_dir(sheets_dir):
    """Return (per_sheet, per_realm) — per_sheet keyed by filename, per_realm aggregated."""
    per_sheet = {}
    names = sorted(n for n in os.listdir(sheets_dir) if n.lower().endswith(".png"))
    for name in names:
        stem = name[:-4]
        per_sheet[name] = {"realm": realm_of(stem), "stats": scan_one(os.path.join(sheets_dir, name))}

    per_realm = {}
    for name, entry in per_sheet.items():
        realm = entry["realm"] or "(unrecognized)"
        per_realm.setdefault(realm, []).append(entry["stats"])

    aggregate = {}
    for realm, stats_list in per_realm.items():
        n = len(stats_list)
        aggregate[realm] = {
            "n": n,
            "meanSat": sum(s["meanSat"] for s in stats_list) / n,
            "hueEnt": sum(s["hueEnt"] for s in stats_list) / n,
            "top2Share": sum(s["top2Share"] for s in stats_list) / n,
            "chromaticPct": sum(s["chromaticPct"] for s in stats_list) / n,
        }
    return per_sheet, aggregate


def print_table(aggregate):
    print(f"per-realm palette aggregate (max hue entropy = {MAX_ENTROPY:.2f} bits)")
    header = f"{'realm':<18}{'sheets':>7}{'meanSat':>10}{'hueEnt':>9}{'top2Share':>11}{'chromatic%':>12}"
    print(header)
    print("-" * len(header))
    for realm in sorted(aggregate):
        a = aggregate[realm]
        print(f"{realm:<18}{a['n']:>7}{a['meanSat']:>10.2f}{a['hueEnt']:>9.2f}"
              f"{a['top2Share']:>11.2f}{a['chromaticPct']:>12.1f}")


def print_targets(aggregate):
    print()
    print("P4 advisory thresholds (not a hard gate — Adam's eye rules):")
    header = f"{'realm':<18}{'hueEnt>=':>10}{'top2<=':>9}{'chrom%>=':>10}{'  verdict':<10}"
    print(header)
    print("-" * len(header))
    for realm in sorted(aggregate):
        if realm == "(unrecognized)":
            continue
        a = aggregate[realm]
        targets = CHROME_TARGETS if realm == "chrome" else DEFAULT_TARGETS
        if realm in EXEMPT_REALMS:
            verdict = "EXEMPT"
        else:
            ok = (a["hueEnt"] >= targets["hueEnt"]
                  and a["top2Share"] <= targets["top2Share"]
                  and a["chromaticPct"] >= targets["chromaticPct"])
            verdict = "PASS ✓" if ok else "FAIL ✗"
        print(f"{realm:<18}{targets['hueEnt']:>10.2f}{targets['top2Share']:>9.2f}"
              f"{targets['chromaticPct']:>10.1f}  {verdict}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dir", nargs="?", default=DEFAULT_SHEETS_DIR,
                     help="directory of sheet PNGs (default: ui-sketches/sprite-sheets/)")
    ap.add_argument("--targets", action="store_true",
                     help="also print the P4 advisory-threshold table with PASS/FAIL/EXEMPT")
    args = ap.parse_args()

    if not os.path.isdir(args.dir):
        print(f"ERROR: no such directory: {args.dir}", file=sys.stderr)
        sys.exit(0)  # advisory tool — never fail the build

    per_sheet, aggregate = scan_dir(args.dir)
    print(f"scanned {len(per_sheet)} sheets across {len(aggregate)} realms")
    print_table(aggregate)
    if args.targets:
        print_targets(aggregate)

    sys.exit(0)


if __name__ == "__main__":
    main()
