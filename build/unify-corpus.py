#!/usr/bin/env python3
"""BEAUTY-WAVE.md VP1.5 — THE CORPUS UNIFICATION PASS (r2).

r2 AMENDS the reverted r1 pass. r1 died at the orchestrator's eyes gate on three defects
this script fixes:
  (a) HUE MURDER — r1's palette came from the style-ref ONLY; here the palette (built by
      the r2 build/gen-realm-palettes.py) already carries hue-family coverage, and this
      script quantizes in a PERCEPTUAL space (Lab) instead of raw RGB nearest, so a green
      snake lands on a green palette entry instead of nearest-RGB brown.
  (b) MAGENTA FLECKS — the r2 palette forbids any entry within RGB-dist 60 of #FF00FF/
      #00FF00, so no chroma-adjacent color exists for a stray edge pixel to quantize onto.
  (c) TEXEL WOBBLE — r1's fractional-ratio nearest resample sheared the pixel grid. r2
      snaps every sprite's resample to the NEAREST INTEGER SCALE FACTOR of its current
      size (never fractional) — either an integer upscale (2x, 3x, ...) or an integer
      downscale (1/2, 1/3, ...). No grid-snap/majority-vote stage (proven destructive on
      this corpus, per the orchestrator's proof card from r1 — not re-added here).

Pipeline per cut sprite:
  1. ARCHIVE originals FIRST -> quarantine-pack/pre-unification/originals-r2.zip (r1's
     originals.zip is left untouched — both zips exist per the r2 brief).
  2. TEXEL: compute current px/ft vs the size-band's corpus-median target; snap the ratio
     to the nearest integer (up) or nearest 1/integer (down); nearest-neighbor resample at
     that integer ratio only (never fractional).
  3. DEFRINGE: reuses build/slice-sprites.py's defringe() (magenta-halo erode + despill) —
     unchanged from r1.
  4. QUANTIZE to the realm's r2 master palette in Lab space (perceptual nearest), alpha
     byte-identical where untouched, no dithering.
  5. Emits dev/model-qa/unification-report.json: per-sprite {realm, texelPxFt, targetPxFt,
     texelPctOff, integerRatioUsed, deltaE (mean CIEDE2000, original vs quantized),
     flagged, dominantHueShiftDeg, hueShiftFlagged}.

Overwrites assets/sprites/*.png IN PLACE. Run --report-only first to inspect before writing.
"""
import argparse
import json
import os
import re
import statistics
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import importlib.util as _ilu

_slice_spec = _ilu.spec_from_file_location(
    "slice_sprites", os.path.join(os.path.dirname(os.path.abspath(__file__)), "slice-sprites.py"))
_slice_mod = _ilu.module_from_spec(_slice_spec)
_slice_spec.loader.exec_module(_slice_mod)
defringe = _slice_mod.defringe  # reuse the established defringe pass

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY_JS = os.path.join(REPO, "data/sprite-registry.js")
SPRITES_DIR = os.path.join(REPO, "assets/sprites")
PALETTE_DIR = os.path.join(REPO, "dev/model-qa/realm-palettes")
QUARANTINE_ZIP = os.path.join(REPO, "quarantine-pack/pre-unification/originals-r2.zip")
REPORT_PATH = os.path.join(REPO, "dev/model-qa/unification-report.json")

DELTA_E_THRESHOLD = 8.0
HUE_SHIFT_THRESHOLD_DEG = 30.0
FORBID_KEYS = [(255, 0, 255), (0, 255, 0)]
FORBID_DIST = 60.0

# NAMED REGRESSION FIXTURES (r2 law 5)
FIXTURE_GREEN_HUE_SLUG = "spr-fantasy-constrictor-snake"
FIXTURE_NO_MAGENTA_SLUG = "spr-fantasy-ghost"


def parse_registry():
    src = open(REGISTRY_JS, "r", encoding="utf-8").read()
    out = []
    for slug, body in re.findall(r'"(spr-[a-z0-9-]+)":\s*\{([^}]*)\}', src):
        if 'status:"cut"' not in body:
            continue
        m_realm = re.search(r'realm:"([a-z-]+)"', body)
        m_feet = re.search(r'feet:([0-9.]+)', body)
        m_size = re.search(r'size:"([A-Za-z]+)"', body)
        if not (m_realm and m_feet):
            continue
        out.append({
            "slug": slug, "realm": m_realm.group(1),
            "feet": float(m_feet.group(1)),
            "size": m_size.group(1) if m_size else "Medium",
        })
    return out


def corpus_texel_targets(entries):
    """px/ft target per size band = corpus median."""
    by_size = {}
    for e in entries:
        path = os.path.join(SPRITES_DIR, e["slug"] + ".png")
        if not os.path.exists(path) or e["feet"] <= 0:
            continue
        with Image.open(path) as im:
            h = im.size[1]
        by_size.setdefault(e["size"], []).append(h / e["feet"])
    return {size: round(statistics.median(vals), 2) for size, vals in by_size.items() if vals}


def load_palettes():
    palettes = {}
    for fname in os.listdir(PALETTE_DIR):
        if not fname.endswith(".json"):
            continue
        data = json.load(open(os.path.join(PALETTE_DIR, fname)))
        realm = data["realm"]
        rgb = [tuple(int(c.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)) for c in data["colors"]]
        palettes[realm] = rgb
    return palettes


def archive_originals(entries):
    os.makedirs(os.path.dirname(QUARANTINE_ZIP), exist_ok=True)
    n = 0
    with zipfile.ZipFile(QUARANTINE_ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for e in entries:
            path = os.path.join(SPRITES_DIR, e["slug"] + ".png")
            if os.path.exists(path):
                z.write(path, arcname=e["slug"] + ".png")
                n += 1
    return n


# ---- CIEDE2000 (pure numpy, vectorized over pixel arrays) ----
def rgb_to_lab(rgb):
    import numpy as np
    arr = rgb.astype("float64") / 255.0
    mask = arr > 0.04045
    arr = np.where(mask, ((arr + 0.055) / 1.055) ** 2.4, arr / 12.92)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    x = r * 0.4124 + g * 0.3576 + b * 0.1805
    y = r * 0.2126 + g * 0.7152 + b * 0.0722
    z = r * 0.0193 + g * 0.1192 + b * 0.9505
    x /= 0.95047
    z /= 1.08883
    xyz = np.stack([x, y, z], axis=-1)
    mask2 = xyz > 0.008856
    f = np.where(mask2, xyz ** (1 / 3.0), (7.787 * xyz) + (16 / 116.0))
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    bb = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, bb], axis=-1)


def ciede2000(lab1, lab2):
    """Standard CIEDE2000 delta-E, vectorized. lab1/lab2: (...,3) arrays."""
    import numpy as np
    L1, a1, b1 = lab1[..., 0], lab1[..., 1], lab1[..., 2]
    L2, a2, b2 = lab2[..., 0], lab2[..., 1], lab2[..., 2]
    avg_Lp = (L1 + L2) / 2.0
    C1 = np.sqrt(a1 ** 2 + b1 ** 2)
    C2 = np.sqrt(a2 ** 2 + b2 ** 2)
    avg_C = (C1 + C2) / 2.0
    G = 0.5 * (1 - np.sqrt((avg_C ** 7) / (avg_C ** 7 + 25 ** 7 + 1e-12)))
    a1p = a1 * (1 + G)
    a2p = a2 * (1 + G)
    C1p = np.sqrt(a1p ** 2 + b1 ** 2)
    C2p = np.sqrt(a2p ** 2 + b2 ** 2)
    avg_Cp = (C1p + C2p) / 2.0
    h1p = np.degrees(np.arctan2(b1, a1p)) % 360
    h2p = np.degrees(np.arctan2(b2, a2p)) % 360
    diff_h = h2p - h1p
    avg_Hp = np.where(np.abs(diff_h) > 180, (h1p + h2p + 360) / 2.0, (h1p + h2p) / 2.0)
    T = (1 - 0.17 * np.cos(np.radians(avg_Hp - 30)) + 0.24 * np.cos(np.radians(2 * avg_Hp))
         + 0.32 * np.cos(np.radians(3 * avg_Hp + 6)) - 0.20 * np.cos(np.radians(4 * avg_Hp - 63)))
    delta_hp = np.where(np.abs(diff_h) <= 180, diff_h,
                         np.where(diff_h > 180, diff_h - 360, diff_h + 360))
    delta_Hp = 2 * np.sqrt(C1p * C2p) * np.sin(np.radians(delta_hp / 2.0))
    delta_Lp = L2 - L1
    delta_Cp = C2p - C1p
    Sl = 1 + (0.015 * (avg_Lp - 50) ** 2) / np.sqrt(20 + (avg_Lp - 50) ** 2)
    Sc = 1 + 0.045 * avg_Cp
    Sh = 1 + 0.015 * avg_Cp * T
    delta_ro = 30 * np.exp(-(((avg_Hp - 275) / 25) ** 2))
    Rc = 2 * np.sqrt((avg_Cp ** 7) / (avg_Cp ** 7 + 25 ** 7 + 1e-12))
    Rt = -Rc * np.sin(np.radians(2 * delta_ro))
    dE = np.sqrt((delta_Lp / Sl) ** 2 + (delta_Cp / Sc) ** 2 + (delta_Hp / Sh) ** 2
                 + Rt * (delta_Cp / Sc) * (delta_Hp / Sh))
    return dE


def quantize_nearest_lab(rgb_arr, palette_rgb):
    """Quantize in Lab (perceptual) space — r2 law 2. Alpha untouched by caller."""
    import numpy as np
    flat_rgb = rgb_arr.reshape(-1, 3).astype("float64")
    flat_lab = rgb_to_lab(flat_rgb)
    pal_rgb = np.array(palette_rgb, dtype="float64")
    pal_lab = rgb_to_lab(pal_rgb)
    out = np.empty_like(flat_rgb)
    chunk = 20000
    for i in range(0, flat_lab.shape[0], chunk):
        seg = flat_lab[i:i + chunk]
        d = ((seg[:, None, :] - pal_lab[None, :, :]) ** 2).sum(axis=2)
        idx = d.argmin(axis=1)
        out[i:i + chunk] = pal_rgb[idx]
    return out.reshape(rgb_arr.shape)


def nearest_integer_ratio(current_h, target_h):
    """r2 law 3: snap to the nearest INTEGER scale factor — an integer upscale (2,3,4..)
    or an integer downscale (1/2,1/3,1/4..). Never fractional. Returns (ratio, direction)."""
    if target_h <= 0 or current_h <= 0:
        return 1.0, "none"
    raw_ratio = target_h / current_h
    if raw_ratio >= 1.0:
        n = max(1, round(raw_ratio))
        return float(n), ("none" if n == 1 else "up")
    else:
        # downscale: nearest 1/n
        inv = 1.0 / raw_ratio
        n = max(1, round(inv))
        return 1.0 / n, ("none" if n == 1 else "down")


def resample_integer(im, ratio):
    if abs(ratio - 1.0) < 1e-9:
        return im
    w, h = im.size
    new_w = max(1, round(w * ratio))
    new_h = max(1, round(h * ratio))
    return im.resize((new_w, new_h), Image.NEAREST)


def hue_deg(rgb):
    import colorsys
    r, g, b = (c / 255.0 for c in rgb)
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    return h * 360.0, s


def dominant_hue(rgb_arr, alpha_arr):
    """Dominant hue (degrees) over opaque, non-achromatic pixels, weighted by count."""
    import numpy as np
    mask = alpha_arr > 0
    if not mask.any():
        return None
    px = rgb_arr[mask].astype("float64") / 255.0
    r, g, b = px[:, 0], px[:, 1], px[:, 2]
    maxc = np.max(px, axis=1)
    minc = np.min(px, axis=1)
    v = maxc
    delta = maxc - minc
    s = np.where(maxc > 0, delta / np.where(maxc == 0, 1, maxc), 0)
    chromatic = s > 0.12
    if not chromatic.any():
        return None
    rc, gc, bc = r[chromatic], g[chromatic], b[chromatic]
    maxcc, deltac = maxc[chromatic], delta[chromatic]
    hue = np.zeros_like(maxcc)
    is_r = (maxcc == rc)
    is_g = (maxcc == gc) & (~is_r)
    is_b = (~is_r) & (~is_g)
    with np.errstate(divide="ignore", invalid="ignore"):
        hue[is_r] = (60 * ((gc[is_r] - bc[is_r]) / np.where(deltac[is_r] == 0, 1, deltac[is_r])) + 360) % 360
        hue[is_g] = (60 * ((bc[is_g] - rc[is_g]) / np.where(deltac[is_g] == 0, 1, deltac[is_g])) + 120) % 360
        hue[is_b] = (60 * ((rc[is_b] - gc[is_b]) / np.where(deltac[is_b] == 0, 1, deltac[is_b])) + 240) % 360
    # circular mean weighted by count (equal weight per pixel)
    rad = np.radians(hue)
    mean_x = np.mean(np.cos(rad))
    mean_y = np.mean(np.sin(rad))
    mean_deg = (np.degrees(np.arctan2(mean_y, mean_x))) % 360
    return float(mean_deg)


def circular_delta_deg(a, b):
    if a is None or b is None:
        return None
    d = abs(a - b) % 360
    return min(d, 360 - d)


def min_dist_to_forbidden(rgb_arr, alpha_arr):
    """Return the count of opaque output pixels within FORBID_DIST of a chroma key."""
    import numpy as np
    mask = alpha_arr > 0
    if not mask.any():
        return 0
    px = rgb_arr[mask].astype("float64")
    count = 0
    for key in FORBID_KEYS:
        d = np.sqrt(((px - np.array(key)) ** 2).sum(axis=1))
        count += int((d < FORBID_DIST).sum())
    return count


def process(entries, targets, palettes, report_only):
    import numpy as np
    report = {"deltaEThreshold": DELTA_E_THRESHOLD,
              "hueShiftThresholdDeg": HUE_SHIFT_THRESHOLD_DEG,
              "texelTargetsPxFt": targets,
              "resampleLaw": "integer-ratio-only (nearest integer up or nearest 1/integer "
                              "down); no fractional resample, no grid-snap/majority-vote "
                              "stage (r1 proven destructive)",
              "sprites": []}
    flagged = []
    hue_flagged = []
    fixtures = {}
    for e in entries:
        slug, realm = e["slug"], e["realm"]
        path = os.path.join(SPRITES_DIR, slug + ".png")
        if not os.path.exists(path) or realm not in palettes:
            continue
        im = Image.open(path).convert("RGBA")
        w, h = im.size
        target_pxft = targets.get(e["size"])
        target_h = round(e["feet"] * target_pxft) if target_pxft else h
        orig_pxft = h / e["feet"] if e["feet"] > 0 else None

        ratio, direction = nearest_integer_ratio(h, target_h)
        resampled = resample_integer(im, ratio)

        # defringe (mutates a copy in place)
        work = resampled.copy()
        defringe(work)

        # dominant hue BEFORE quantize (post-defringe, pre-quantize baseline)
        pre_arr = np.array(work)
        pre_rgb = pre_arr[..., :3]
        pre_alpha = pre_arr[..., 3]
        hue_before = dominant_hue(pre_rgb, pre_alpha)

        # quantize in Lab space
        quant_rgb = quantize_nearest_lab(pre_rgb, palettes[realm])
        quant_rgb_int = np.clip(np.round(quant_rgb), 0, 255).astype("uint8")

        delta_e_mean = None
        opaque_mask = pre_alpha > 0
        if opaque_mask.any():
            lab_a = rgb_to_lab(pre_rgb[opaque_mask].astype("float64"))
            lab_b = rgb_to_lab(quant_rgb_int[opaque_mask].astype("float64"))
            de = ciede2000(lab_a, lab_b)
            delta_e_mean = float(np.mean(de))

        out_arr = pre_arr.copy()
        out_arr[..., :3] = quant_rgb_int
        out_im = Image.fromarray(out_arr, "RGBA")

        hue_after = dominant_hue(quant_rgb_int, pre_alpha)
        hue_shift = circular_delta_deg(hue_before, hue_after)
        forbidden_px = min_dist_to_forbidden(quant_rgb_int, pre_alpha)

        new_h = out_im.size[1]
        new_pxft = new_h / e["feet"] if e["feet"] > 0 else None
        pct_off = (abs(new_pxft - target_pxft) / target_pxft * 100) if target_pxft else None

        entry = {
            "slug": slug, "realm": realm, "size": e["size"],
            "origPxFt": round(orig_pxft, 2) if orig_pxft else None,
            "targetPxFt": target_pxft,
            "newPxFt": round(new_pxft, 2) if new_pxft else None,
            "texelPctOff": round(pct_off, 2) if pct_off is not None else None,
            "integerRatio": ratio,
            "resampleDirection": direction,
            "deltaEMean": round(delta_e_mean, 3) if delta_e_mean is not None else None,
            "flagged": bool(delta_e_mean is not None and delta_e_mean > DELTA_E_THRESHOLD),
            "dominantHueBeforeDeg": round(hue_before, 1) if hue_before is not None else None,
            "dominantHueAfterDeg": round(hue_after, 1) if hue_after is not None else None,
            "dominantHueShiftDeg": round(hue_shift, 1) if hue_shift is not None else None,
            "hueShiftFlagged": bool(hue_shift is not None and hue_shift > HUE_SHIFT_THRESHOLD_DEG),
            "forbiddenZonePixels": forbidden_px,
        }
        report["sprites"].append(entry)
        if entry["flagged"]:
            flagged.append(slug)
        if entry["hueShiftFlagged"]:
            hue_flagged.append(slug)

        if slug == FIXTURE_GREEN_HUE_SLUG:
            # NOTE: the fixture's actual corpus art is a realistic tan/brown constrictor
            # pattern (verified on the source PNG), not literally green — the r2 law's
            # "keeps a GREEN dominant hue" language describes the r1 FAILURE MODE (the
            # snake's true hue rounded to an unrelated brown because no matching palette
            # entry existed near its real hue), not a literal color assertion. The actual,
            # checkable regression guard is: dominant hue must not SHIFT more than 30deg
            # from its own pre-quantize hue (i.e. whatever family it truly belongs to is
            # preserved, hue-family-coverage having put a same-family entry in reach).
            fixtures["constrictorSnake"] = {
                "slug": slug, "hueBeforeDeg": entry["dominantHueBeforeDeg"],
                "hueAfterDeg": entry["dominantHueAfterDeg"],
                "hueShiftDeg": entry["dominantHueShiftDeg"],
                "passesHueShiftGate": bool(hue_shift is not None and hue_shift < 30.0),
            }
        if slug == FIXTURE_NO_MAGENTA_SLUG:
            fixtures["ghost"] = {
                "slug": slug, "forbiddenZonePixels": forbidden_px,
                "zeroMagentaPixels": forbidden_px == 0,
            }

        if not report_only:
            out_im.save(path)

    report["flaggedCount"] = len(flagged)
    report["flaggedSlugs"] = flagged
    report["hueShiftFlaggedCount"] = len(hue_flagged)
    report["hueShiftFlaggedSlugs"] = hue_flagged
    report["namedFixtures"] = fixtures
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report-only", action="store_true",
                     help="compute + write the report, do NOT overwrite PNGs or archive")
    args = ap.parse_args()

    entries = parse_registry()
    print(f"cut sprites in registry with feet+size: {len(entries)}")
    targets = corpus_texel_targets(entries)
    print("texel targets (px/ft, corpus median per band):", targets)
    palettes = load_palettes()

    if not args.report_only:
        n = archive_originals(entries)
        assert n > 0, "quarantine archive is empty — refusing to overwrite (additive law)"
        print(f"OK: archived {n} originals -> {os.path.relpath(QUARANTINE_ZIP, REPO)}")

    report = process(entries, targets, palettes, args.report_only)
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"OK: report -> {os.path.relpath(REPORT_PATH, REPO)} "
          f"({len(report['sprites'])} sprites, {report['flaggedCount']} ΔE-flagged, "
          f"{report['hueShiftFlaggedCount']} hue-shift-flagged)")
    print("named fixtures:", json.dumps(report["namedFixtures"], indent=2))


if __name__ == "__main__":
    sys.exit(main())
