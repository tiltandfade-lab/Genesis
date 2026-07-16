#!/usr/bin/env python3
"""MC-1 -- clean the magenta crud out of the LIVE pixel sprite corpus.

Adam's ruling (docs/DESIGN.md 2026-07-15 late): "we stick with the pixel art style" --
the faceted corpus reverts to reserve, assets/sprites/ (896 PNGs) is canonical again, and
it carries residual magenta-key contamination that reads as crud in-game: interior opaque
flecks in the magenta hue family (baked into dragon bodies, a ghost's wispy trailing shapes,
an angel's wing shadows...) plus edge fringe the original defringe pass missed.

PRIOR ART READ FIRST (per the standing instruction to build on it, not reinvent it):
  - build/slice-sprites.py's defringe() -- "the magenta-lane tech" (docs/SPRITE-GEN-V2.md
    10b: "the unmix/defringe pass ... runs on every cut, not as a rescue"). Two passes:
    erode strongly-contaminated edge pixels (min(r,b)-g > 60, "mostly background"), then
    despill the remaining edge band (any r>g-and-b>g pixel within 2px of transparency gets
    its r/b excess scaled to 25%). Proven safe as a ONE-TIME step run immediately after
    fresh magenta-keying.
  - build/unify-corpus.py's CIEDE2000 (rgb_to_lab / ciede2000) -- reused verbatim here for
    the ΔE reporting math. Its "forbidden zone" law (a Lab-quantized realm palette keeps a
    violet swatch just outside the pure-magenta forbid radius) explains WHY color alone
    cannot separate crud from art in this corpus: a genuinely crud pixel on spr-fantasy-ghost
    and a genuinely intentional pixel on spr-fantasy-violet-fungus round to the IDENTICAL
    RGB triplet post-quantization (verified empirically during calibration -- both
    (197,69,170)). The discriminator has to be CONTEXTUAL (shape + isolation + subject),
    never colorimetric alone.
  - docs/SPRITE-GEN-V2.md sec 7 (chroma-key law): green-keying was already the established
    mitigation for "magenta occurs in the art" subjects at GENERATION time (chrome, suburb,
    magenta-heavy sets). This script's subject-level exemption (below) is the equivalent
    mitigation for the LIVE corpus, after the fact.

A DOCUMENTED DEVIATION FROM THE PRIOR ART, AND WHY: the natural first instinct was to reuse
defringe() itself as the detector -- run it on a copy, diff, count changed pixels as
"fringe". Measured against the full corpus this produced a median of ~1,300 "changed" px
PER SPRITE (876/896 sprites over 50px), which is not a residual-contamination signal, it's
defringe()'s pass-2 despill re-triggering on almost any warm-purple-leaning edge pixel
(its trigger is bare "r>g and b>g", no magnitude floor) -- including perfectly ordinary
antialiasing that was never near a magenta key. defringe() was built to run ONCE on raw
post-keying output; it is not idempotent and is the wrong tool for a QA/detection pass on an
already-processed corpus. Confirmed by direct comparison (median dropped from ~1,300px to
0px per sprite, 841/896 sprites at exactly zero) once detection switched to the same
CONTEXTUAL test used for interior specks (below), just labeled by location. That test is
strict enough that it does NOT flag the same corpus's genuine edge-adjacent magic-effect
glows (verified by hand against spr-pc-orc-wizard-male's hand-conjured magic circle, a
600px non-compact ring shape sitting right at the sprite's silhouette boundary -- excluded
by the size+compactness caps exactly like a purple worm's body is, no special-casing).

THE CORE FINDING (empirical, from calibration against this exact corpus): a purely
colorimetric magenta-family test (hue window + saturation) flags ~3% of all opaque pixels,
and most of that is NOT crud -- it's legitimate rim-light dither, tiefling skin, warlock/
sorcerer arcane-glow particles, and inherently violet/magenta creatures (mind flayers,
displacer beasts, the purple worm, violet fungus, a genuinely fuchsia giant squid, a
wizard's conjured sigil). Same color, different intent. Two independent, subject-blind
signals separate them:

  1. SUBJECT-LEVEL EXEMPTION (protects "canonically-magenta subjects", generalized rather
     than hardcoded -- the corpus turned out to have ~44, not 2, once giant squids, mind
     flayers, liches, and every tiefling/warlock/sorcerer PC skin got counted): if a
     sprite's own dominant palette already sits substantially in the magenta/violet hue
     family (>18% of opaque pixels in a WIDE hue band at real saturation), the ENTIRE
     sprite -- edges included -- is exempt from crud detection. Its own canonical color
     cannot be crud.
  2. PER-COMPONENT GEOMETRY, for everything else: a magenta-family connected component only
     reads as crud if it is SMALL (absolute + area-relative caps -- this alone protects any
     coherent creature-body-sized or effect-sized region regardless of where it sits),
     COMPACT (not a thin trim stroke or a sparse ring-shaped glow -- aspect-ratio + fill-
     ratio caps), NEAR THE SPRITE'S OWN ALPHA BOUNDARY (crud cannot originate deep in the
     interior -- it enters where the art touched the chroma key during generation/
     compositing; this single signal alone roughly halved the false-positive rate during
     calibration), and ISOLATED (its dilated ring is mostly non-magenta -- i.e. it doesn't
     belong to a larger same-family region). A qualifying component is then labeled `fringe`
     if it touches the alpha boundary (matches class (a), edge fringe) or `speck` if it sits
     just inside it (class (b), interior speck) -- ONE detector, a location label, not two
     different heuristics.

Both signals were tuned AGAINST this corpus by eye (dev/model-qa/regen-v3/magenta-fails-r3.md's
own ANTI-MAGENTA fixture, spr-fantasy-ghost, was the positive control throughout;
spr-fantasy-purple-worm / spr-fantasy-violet-fungus / spr-pc-elf-warlock-female /
spr-fantasy-giant-squid / spr-pc-orc-wizard-male's magic circle as negative controls) --
see the worst-20 contact sheet for the honest before/after read.

A THIRD EXEMPTION, ADDED AFTER DIRECT VISUAL EVIDENCE OF DAMAGE (spr-pc-*): even with both
signals above in place, a targeted visual check of the PC (player-character) sprite sheet
set turned up two confirmed false positives -- spr-pc-gnome-sorcerer-female's held magic
orbs and spr-pc-elf-sorcerer-female's hand-conjured wisps both got their arcane-glow color
desaturated by the speck cleaner. A held magic-effect orb/wisp is SMALL, COMPACT (a sphere),
NEAR THE SPRITE'S EDGE (hands are held out from the body), and ISOLATED (surrounded by skin/
air, not other magenta) -- i.e. it satisfies every geometric crud signal simultaneously,
because a compact glowing orb and a compact contamination blob are the same shape. Widening
the check to the full spr-pc-* set (216 sprites) found 90 of them (42%) would be touched,
including non-caster classes (rogues, barbarians, fighters) -- this isn't a caster-only
effect, it's a systemic small-magenta-accent convention across the whole PC portrait lane
(matches the established defringe() docstring's own named protected class, "warlock
glows"). Rather than accept a demonstrated, widespread pattern of damaging real character
art, spr-pc-* is exempted from crud detection wholesale in this pass -- MC-1's paradigm
case (per the unit brief) is dragon-body/creature crud, and the PC lane needs its own
human-eyes pass rather than a geometry heuristic that cannot tell a spell effect from a
stain. This is the same "never bulldoze art" call as the subject-level exemption above,
just keyed on slug prefix instead of measured palette.

Pipeline per sprite:
  1. Load RGBA. opaque = alpha==255 (this corpus is confirmed binary-alpha, no partial
     transparency -- "crisp hard silhouette edges" per the generation law).
  2. EXEMPT test (wide magenta/violet hue-family share of opaque area). Exempt sprites get
     verdict clean unconditionally -- no fringe, no speck detection at all.
  3. Connected-component search over the strict magenta-family candidate mask; each
     qualifying component (size/aspect/compactness/edge-distance/isolation, see above) is
     labeled fringe or speck by whether it touches the alpha boundary.
  4. CLEAN: every qualifying component is replaced by the unweighted mean color of its own
     non-candidate opaque ring neighbors (never a transparency punch-through) -- an
     expanding-radius search is the defensive fallback; erosion to transparent is reserved
     for the (in practice unreached, detection already guarantees a real ring at radius 2)
     case where no real neighbor color exists at all, and ONLY for fringe-labeled
     components, never for interior specks (per spec: specks are never turned into holes).
  5. SAFETY RAILS:
       a. touch-budget -- if total touched px / opaque_area exceeds TOUCH_BUDGET_FRAC, the
          file is left untouched and the slug is listed under skippedForEyes (detector
          confidence too low relative to how much of the sprite it wants to touch --
          "never bulldoze art").
       b. outside-flagged identity assert -- pixels outside the touched-pixel mask MUST be
          byte-identical pre/post; this is a correctness assertion (by construction nothing
          else should move), not a tunable gate. A violation aborts the run.
       c. mean ΔE (CIEDE2000, reused from unify-corpus.py) over the touched region is
          recorded for the report -- informational (the point of touching is to change
          those pixels), not a skip gate.
  6. Untouched-verdict (clean) files are NEVER opened for writing -- byte-identity is
     structural, not a post-hoc check.

Emits dev/model-qa/magenta-crud-report.json and (unless --report-only)
dev/model-qa/magenta-crud-sheets/worst-20-before-after.png, and overwrites
assets/sprites/<slug>.png IN PLACE for every cleaned slug. Archives pre-clean originals to
quarantine-pack/pre-magenta-crud/originals.zip (additive law, matches unify-corpus.py r2).

Flags:
  --report-only   compute + write the report only; never touch assets/sprites/ or the zip.
  --verify        re-run detection against the CURRENT (possibly already-cleaned) corpus
                   and report whether any cleaned slug still shows fringe/speck detections
                   (determinism / fixed-point check). Never mutates.
"""
import argparse
import json
import os
import sys
import zipfile

import numpy as np
from PIL import Image
from scipy import ndimage
import importlib.util as _ilu

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

_unify_spec = _ilu.spec_from_file_location("unify_corpus", os.path.join(HERE, "unify-corpus.py"))
_unify_mod = _ilu.module_from_spec(_unify_spec)
_unify_spec.loader.exec_module(_unify_mod)
rgb_to_lab = _unify_mod.rgb_to_lab
ciede2000 = _unify_mod.ciede2000  # reuse the established CIEDE2000 math verbatim

SPRITES_DIR = os.path.join(REPO, "assets", "sprites")
REPORT_PATH = os.path.join(REPO, "dev", "model-qa", "magenta-crud-report.json")
SHEETS_DIR = os.path.join(REPO, "dev", "model-qa", "magenta-crud-sheets")
SHEET_PATH = os.path.join(SHEETS_DIR, "worst-20-before-after.png")
QUARANTINE_ZIP = os.path.join(REPO, "quarantine-pack", "pre-magenta-crud", "originals.zip")

# ---- calibrated constants (see module docstring for how these were derived) ----
EXEMPT_WIDE_HUE_LO, EXEMPT_WIDE_HUE_HI = 260.0, 340.0
EXEMPT_WIDE_SAT_MIN, EXEMPT_WIDE_VAL_MIN = 0.25, 0.15
EXEMPT_WIDE_FRAC = 0.18  # subject-level canonically-magenta/violet exemption
EXEMPT_SLUG_PREFIXES = ("spr-pc-",)  # PC portrait lane -- see module docstring "THIRD EXEMPTION"

CAND_EXCESS_MIN = 55      # min(r,b) - g;  same "magenta excess" metric slice-sprites.py's
                           # defringe() uses for its edge erode pass (erode_excess=60), at a
                           # slightly lower bar because this test ALSO carries the balance +
                           # brightness + geometry + isolation gates below (defringe() had
                           # none of those, so it needed the metric alone to be stricter).
CAND_RB_BALANCE_MAX = 40  # |r-b|; true magenta-family leans balanced, not one-sided
CAND_MIN_BRIGHT = 110     # min(r,b); excludes dark muted-purple dither shading

COMP_MIN_PX = 8
COMP_ABS_MAX_PX = 120
COMP_AREA_FRAC_MAX = 0.008
COMP_ASPECT_MAX = 2.4
COMP_COMPACT_MIN = 0.40
COMP_EDGE_DIST_MAX = 7.0       # mean distance-to-alpha-boundary cap for ANY qualifying comp
FRINGE_TOUCH_DIST = 2          # min distance-to-alpha-boundary <= this => labeled "fringe"
RING_ITERS_START = 2
RING_ITERS_MAX = 6             # expanding-radius fallback for the neighbor-blend
RING_NONMAG_FRAC_MIN = 0.70

TOUCH_BUDGET_FRAC = 0.05  # global per-sprite safety rail (touched px / opaque area)


def rgb_to_hsv_arr(rgb):
    """Vectorized rgb->hsv, rgb in [0,1]. Validated exact (max err 0) against colorsys
    over 20k random samples during calibration."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    v = maxc
    delta = maxc - minc
    s = np.where(maxc > 0, delta / np.where(maxc == 0, 1, maxc), 0)
    with np.errstate(divide="ignore", invalid="ignore"):
        rc = np.where(delta == 0, 0, (maxc - r) / np.where(delta == 0, 1, delta))
        gc = np.where(delta == 0, 0, (maxc - g) / np.where(delta == 0, 1, delta))
        bc = np.where(delta == 0, 0, (maxc - b) / np.where(delta == 0, 1, delta))
    is_r = maxc == r
    is_g = (maxc == g) & (~is_r)
    is_b = (~is_r) & (~is_g)
    h = np.zeros_like(maxc)
    h = np.where(is_r, bc - gc, h)
    h = np.where(is_g, 2.0 + rc - bc, h)
    h = np.where(is_b, 4.0 + gc - rc, h)
    h = (h / 6.0) % 1.0
    h = np.where(delta > 1e-12, h, 0.0)
    return h * 360.0, s, v


def wide_magenta_frac(rgb_u8, opaque):
    """Share of opaque pixels sitting in the WIDE magenta/violet hue family at real
    saturation -- the subject-level exemption signal. rgb_u8: (H,W,3) uint8."""
    oc = int(opaque.sum())
    if oc == 0:
        return 0.0
    h, s, v = rgb_to_hsv_arr(rgb_u8.astype("float64") / 255.0)
    wide = opaque & (h >= EXEMPT_WIDE_HUE_LO) & (h <= EXEMPT_WIDE_HUE_HI) \
        & (s >= EXEMPT_WIDE_SAT_MIN) & (v >= EXEMPT_WIDE_VAL_MIN)
    return float(wide.sum()) / oc


def candidate_mask(rgb_i32, opaque):
    """Magenta-family CANDIDATE pixels (not yet a crud verdict -- just eligible). Reuses
    the same min(r,b)-g 'magenta excess' metric build/slice-sprites.py's defringe() already
    uses for its edge-band erode pass."""
    r, g, b = rgb_i32[..., 0], rgb_i32[..., 1], rgb_i32[..., 2]
    excess = np.minimum(r, b) - g
    rb_balance = np.abs(r - b) <= CAND_RB_BALANCE_MAX
    bright = np.minimum(r, b) >= CAND_MIN_BRIGHT
    return opaque & (excess >= CAND_EXCESS_MIN) & rb_balance & bright


def find_crud_components(rgb_i32, opaque):
    """Unified detector for BOTH crud classes. Returns a list of dicts
    {mask, size, cx, cy, cls, ringNonMagentaFrac} where cls is 'fringe' (touches the alpha
    boundary) or 'speck' (interior), plus the union mask. Same geometry filters for both --
    only the resulting location label differs. See module docstring for how each threshold
    was calibrated against this corpus."""
    opaque_area = int(opaque.sum())
    union_mask = np.zeros(opaque.shape, dtype=bool)
    comps = []
    if opaque_area == 0:
        return comps, union_mask
    magcand = candidate_mask(rgb_i32, opaque)
    if not magcand.any():
        return comps, union_mask
    dist_to_edge = ndimage.distance_transform_edt(opaque)
    lbl, n = ndimage.label(magcand, structure=np.ones((3, 3)))
    comp_sizes = ndimage.sum(magcand, lbl, index=range(1, n + 1))
    objs = ndimage.find_objects(lbl)
    area_cap = min(COMP_ABS_MAX_PX, COMP_AREA_FRAC_MAX * opaque_area)
    for ci, sz in enumerate(comp_sizes, start=1):
        sz = int(sz)
        if sz < COMP_MIN_PX or sz > area_cap:
            continue
        sl = objs[ci - 1]
        bh = sl[0].stop - sl[0].start
        bw = sl[1].stop - sl[1].start
        aspect = max(bh, bw) / max(1, min(bh, bw))
        compactness = sz / (bh * bw)
        if aspect > COMP_ASPECT_MAX or compactness < COMP_COMPACT_MIN:
            continue
        comp_mask = lbl == ci
        comp_dists = dist_to_edge[comp_mask]
        if float(comp_dists.mean()) > COMP_EDGE_DIST_MAX:
            continue
        dil = ndimage.binary_dilation(comp_mask, iterations=RING_ITERS_START)
        ring = dil & (~comp_mask) & opaque
        ring_n = int(ring.sum())
        if ring_n == 0:
            continue
        ring_magenta = int((magcand & ring).sum())
        nonmag_frac = 1.0 - (ring_magenta / ring_n)
        if nonmag_frac < RING_NONMAG_FRAC_MIN:
            continue
        cls = "fringe" if float(comp_dists.min()) <= FRINGE_TOUCH_DIST else "speck"
        ys, xs = np.where(comp_mask)
        comps.append({
            "mask": comp_mask, "size": sz, "cls": cls,
            "cx": float(xs.mean()), "cy": float(ys.mean()),
            "ringNonMagentaFrac": round(nonmag_frac, 3),
        })
        union_mask |= comp_mask
    return comps, union_mask


def clean_components(rgb_i32, opaque, comps):
    """Replaces each qualifying component with the mean color of its own non-magenta ring
    neighbors (expanding-radius fallback). Interior 'speck' components are ALWAYS
    color-blended (never punched to transparent, per spec). Edge-'fringe' components fall
    back to erosion (alpha=0) only if no real neighbor color can be found at all -- in
    practice unreached, since detection already guarantees a ring at radius 2. Returns the
    cleaned rgb array (uint8), a boolean alpha-erase mask, and the union touched mask."""
    out = rgb_i32.copy()
    magcand = candidate_mask(rgb_i32, opaque)
    touched = np.zeros(opaque.shape, dtype=bool)
    erased = np.zeros(opaque.shape, dtype=bool)
    for c in comps:
        comp_mask = c["mask"]
        ring = None
        for iters in range(RING_ITERS_START, RING_ITERS_MAX + 1):
            dil = ndimage.binary_dilation(comp_mask, iterations=iters)
            cand_ring = dil & (~comp_mask) & opaque & (~magcand)
            if cand_ring.sum() >= 4:
                ring = cand_ring
                break
        if ring is None:
            if c["cls"] == "fringe":
                erased |= comp_mask
                touched |= comp_mask
            # interior specks: never erase; if truly no neighbor exists (should not happen
            # given the >=0.70 ring-isolation gate at detect time) leave untouched rather
            # than risk a wrong-color blend from candidate pixels.
            continue
        mean_color = out[ring].mean(axis=0)
        out[comp_mask] = mean_color
        touched |= comp_mask
    return out.astype("uint8"), erased, touched


def process_sprite(path):
    """Returns a dict entry for the report, plus enough working data to clean/write."""
    slug = os.path.basename(path)[:-4]
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    opaque = arr[..., 3] == 255
    opaque_area = int(opaque.sum())
    orig_bytes = open(path, "rb").read()

    if opaque_area == 0:
        return {"slug": slug, "verdict": "clean", "opaqueAreaPx": 0, "fringePx": 0,
                "speckPx": 0, "speckComponents": [], "exempt": False,
                "_cleanImage": None, "_touchedFrac": 0.0, "_origBytes": orig_bytes}

    rgb_i32 = arr[..., :3].astype("int32")
    is_pc = slug.startswith(EXEMPT_SLUG_PREFIXES)
    exempt = is_pc or wide_magenta_frac(arr[..., :3], opaque) > EXEMPT_WIDE_FRAC

    if exempt:
        comps, union_mask = [], np.zeros(opaque.shape, dtype=bool)
    else:
        comps, union_mask = find_crud_components(rgb_i32, opaque)

    fringe_px = sum(c["size"] for c in comps if c["cls"] == "fringe")
    speck_px = sum(c["size"] for c in comps if c["cls"] == "speck")
    if fringe_px > 0 and speck_px > 0:
        verdict = "both"
    elif fringe_px > 0:
        verdict = "fringe"
    elif speck_px > 0:
        verdict = "specks"
    else:
        verdict = "clean"

    touched_frac = (fringe_px + speck_px) / opaque_area

    clean_arr = None
    outside_ok = True
    delta_e_touched = None
    if verdict != "clean":
        cleaned_rgb, erased, comp_touched = clean_components(rgb_i32, opaque, comps)
        final_arr = arr.copy()
        final_arr[..., :3] = cleaned_rgb
        if erased.any():
            final_arr[..., 3][erased] = 0
        all_touched = comp_touched | erased
        outside_mask = ~all_touched
        outside_ok = bool(np.array_equal(arr[outside_mask], final_arr[outside_mask]))
        if all_touched.any():
            orig_lab = rgb_to_lab(arr[..., :3][all_touched].astype("float64"))
            new_lab = rgb_to_lab(final_arr[..., :3][all_touched].astype("float64"))
            delta_e_touched = float(np.mean(ciede2000(orig_lab, new_lab)))
        clean_arr = final_arr

    entry = {
        "slug": slug,
        "opaqueAreaPx": opaque_area,
        "exempt": exempt,
        "exemptReason": ("pc-lane" if is_pc else "canonically-magenta-subject") if exempt else None,
        "fringePx": fringe_px,
        "speckPx": speck_px,
        "speckComponents": [
            {"sizePx": c["size"], "cls": c["cls"], "cx": round(c["cx"], 1),
             "cy": round(c["cy"], 1), "ringNonMagentaFrac": c["ringNonMagentaFrac"]}
            for c in comps
        ],
        "verdict": verdict,
        "touchedFrac": round(touched_frac, 5),
        "outsideFlaggedIdentical": outside_ok,
        "deltaETouchedMean": round(delta_e_touched, 3) if delta_e_touched is not None else None,
        "_cleanImage": clean_arr,
        "_touchedFrac": touched_frac,
        "_origBytes": orig_bytes,
        "_origArr": arr,
    }
    return entry


def build_contact_sheet(worst, out_path):
    """Before/after contact sheet for the worst-N offenders by touched-px count. Each row:
    slug label, BEFORE (original, upscaled), AFTER (cleaned, upscaled)."""
    if not worst:
        return
    cell = 160
    label_h = 18
    rows = len(worst)
    cols = 2
    pad = 6
    sheet_w = pad + cols * (cell + pad)
    sheet_h = pad + rows * (cell + label_h + pad)
    sheet = Image.new("RGB", (sheet_w, sheet_h), (40, 40, 40))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(sheet)
    for i, w in enumerate(worst):
        y0 = pad + i * (cell + label_h + pad)
        before_im = Image.fromarray(w["_origArr"]).convert("RGBA")
        after_arr = w["_cleanImage"] if w["_cleanImage"] is not None else w["_origArr"]
        after_im = Image.fromarray(after_arr).convert("RGBA")
        for j, art in enumerate((before_im, after_im)):
            bg = Image.new("RGBA", art.size, (70, 70, 70, 255))
            comp = Image.alpha_composite(bg, art).convert("RGB")
            scale = min(cell / comp.width, cell / comp.height)
            new_w, new_h = max(1, int(comp.width * scale)), max(1, int(comp.height * scale))
            comp = comp.resize((new_w, new_h), Image.NEAREST)
            x0 = pad + j * (cell + pad)
            ox = x0 + (cell - new_w) // 2
            oy = y0 + label_h + (cell - new_h) // 2
            sheet.paste(comp, (ox, oy))
        label = f'{w["slug"]}  fringe={w["fringePx"]} specks={w["speckPx"]}  BEFORE | AFTER'
        draw.text((pad, y0), label[:110], fill=(230, 230, 230))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    sheet.save(out_path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report-only", action="store_true",
                     help="detect + write the report only; never touch assets/sprites/")
    ap.add_argument("--verify", action="store_true",
                     help="determinism check against the current corpus; never mutates")
    args = ap.parse_args()
    write_files = not (args.report_only or args.verify)

    paths = sorted(
        os.path.join(SPRITES_DIR, f) for f in os.listdir(SPRITES_DIR) if f.endswith(".png")
    )
    print(f"scanning {len(paths)} sprites in assets/sprites/")

    entries = [process_sprite(p) for p in paths]

    counts = {"clean": 0, "fringe": 0, "specks": 0, "both": 0}
    exempt_count = 0
    exempt_pc_count = 0
    exempt_subject_count = 0
    skipped_for_eyes = []
    cleaned_slugs = []
    identity_failures = []

    for e in entries:
        if e["opaqueAreaPx"] == 0:
            counts["clean"] += 1
            continue
        if e["exempt"]:
            exempt_count += 1
            if e["exemptReason"] == "pc-lane":
                exempt_pc_count += 1
            else:
                exempt_subject_count += 1
        v = e["verdict"]
        if v == "clean":
            counts["clean"] += 1
            continue
        if not e["outsideFlaggedIdentical"]:
            identity_failures.append(e["slug"])
        if e["_touchedFrac"] > TOUCH_BUDGET_FRAC:
            skipped_for_eyes.append({
                "slug": e["slug"], "verdict": v, "touchedFrac": e["touchedFrac"],
                "reason": f"touched fraction {e['touchedFrac']:.3f} exceeds "
                          f"TOUCH_BUDGET_FRAC={TOUCH_BUDGET_FRAC}",
            })
            counts[v] += 1  # still counted under its detected verdict class
            continue
        counts[v] += 1
        cleaned_slugs.append(e["slug"])

    if identity_failures:
        print("FATAL: outside-flagged pixels changed on:", identity_failures, file=sys.stderr)
        sys.exit(1)

    total = sum(counts.values())
    assert total == len(entries), f"verdict reconciliation failed: {total} != {len(entries)}"

    if write_files:
        os.makedirs(os.path.dirname(QUARANTINE_ZIP), exist_ok=True)
        zmode = "a" if os.path.exists(QUARANTINE_ZIP) else "w"
        with zipfile.ZipFile(QUARANTINE_ZIP, zmode, zipfile.ZIP_DEFLATED) as z:
            existing = set(z.namelist()) if zmode == "a" else set()
            for e in entries:
                if e["slug"] not in cleaned_slugs:
                    continue
                arcname = e["slug"] + ".png"
                if arcname not in existing:
                    z.writestr(arcname, e["_origBytes"])
        for e in entries:
            if e["slug"] not in cleaned_slugs:
                continue
            out_im = Image.fromarray(e["_cleanImage"])
            out_path = os.path.join(SPRITES_DIR, e["slug"] + ".png")
            out_im.save(out_path)
        print(f"OK: cleaned {len(cleaned_slugs)} sprites in place, "
              f"archived originals -> {os.path.relpath(QUARANTINE_ZIP, REPO)}")

    # worst-20 by total touched px, among sprites that were actually cleaned
    worst = sorted(
        (e for e in entries if e["slug"] in cleaned_slugs),
        key=lambda e: -(e["fringePx"] + e["speckPx"]),
    )[:20]
    if not args.verify:
        build_contact_sheet(worst, SHEET_PATH)

    report = {
        "corpusCount": len(entries),
        "verdictCounts": counts,
        "reconciles": total == len(entries),
        "exemptTotalCount": exempt_count,
        "exemptPcLaneCount": exempt_pc_count,
        "exemptCanonicallyMagentaSubjectCount": exempt_subject_count,
        "exemptWideMagentaFracThreshold": EXEMPT_WIDE_FRAC,
        "touchBudgetFrac": TOUCH_BUDGET_FRAC,
        "skippedForEyesCount": len(skipped_for_eyes),
        "skippedForEyes": skipped_for_eyes,
        "cleanedCount": len(cleaned_slugs),
        "cleanedSlugs": sorted(cleaned_slugs),
        "worst20Slugs": [w["slug"] for w in worst],
        "sprites": [
            {k: v for k, v in e.items() if not k.startswith("_")}
            for e in entries
        ],
    }
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"OK: report -> {os.path.relpath(REPORT_PATH, REPO)}")
    print(f"  verdicts: {counts}  (reconciles={report['reconciles']})")
    print(f"  exempt: {exempt_count} total "
          f"({exempt_subject_count} canonically-magenta/violet subjects, "
          f"{exempt_pc_count} pc-lane)")
    print(f"  cleaned: {len(cleaned_slugs)}  skipped-for-eyes: {len(skipped_for_eyes)}")

    if args.verify:
        offenders = [e["slug"] for e in entries if e["verdict"] != "clean"]
        print(f"  VERIFY: {len(offenders)} sprites still show fringe/speck detections")
        if offenders:
            print("   ", offenders[:40])


if __name__ == "__main__":
    sys.exit(main())
