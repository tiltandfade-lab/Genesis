#!/usr/bin/env python3
"""MC-2 -- interior key-magenta becomes TRANSPARENT (round 2, builds on MC-1's foundations).

Adam's ruling on MC-1's result, verbatim (decision-capture):
    "some of the magenta crud cleanup looks better, some of them are completely fixed, but
    others are clearly not, the magenta is alive and well and it should just be transparent,
    i know you are trying to preserve it on the inside of certain sprites and that's fair
    but i think more sprites are getting left with interior crud than should be. things with
    clouds still have magenta junk hanging around"

PRIOR ART READ FIRST (built on, not reinvented):
  - build/clean-magenta-crud.py (MC-1): rgb_to_hsv_arr() and wide_magenta_frac() are
    imported and reused verbatim; MC-1's worst-20 slug list (from its committed report) is
    re-shot on the same subjects for the direct before/after comparison; MC-1's committed
    report also supplies the ruled 31-subject "canonically-magenta" list used for the
    magenta-native accounting below.
  - build/slice-sprites.py's defringe(): the design template for the new-alpha-boundary
    cleanup pass (erode strongly-contaminated adjacent pixels, then despill the edge band).
    Not literally called: its BFS treats EVERY existing transparent pixel as a despill
    source, so a second whole-image run would re-touch already-clean silhouette edges (MC-1's
    docstring documented exactly this non-idempotence). The reimplementation below seeds
    distance-from-transparency from ONLY the pixels this run itself just punched.
  - build/unify-corpus.py: rgb_to_lab reused for the repair-recolor nearest-palette match.

WHY MC-1 LEFT THE CLOUD-CLASS CRUD (from its own constants, verified by measurement): MC-1
required min(r,b)>=110 brightness, <=120px area, and <=7px mean distance to the sprite's own
alpha boundary. The wispy/cloud-class residue (ghost, djinni/dao/marid/efreeti, cloud-giant,
air/water elemental, dust-mephit, pixies, merfolk-wavebender -- MC-1's worst-20 roster) fails
all three: it is darker (down to min(r,b)=89 post-quantization), bigger (single patches of
100-600px), and deeper interior (10-50px). Those gates existed to protect art; on this class
they protected the crud.

WHAT CALIBRATION AGAINST THE ACTUAL CORPUS REVEALED (this is where this script deviates from
the unit brief's single-source design, with evidence): the brief prescribed detecting
"flat/unshaded" key-color components in the current corpus, "per-component color variance as
the paint-vs-key discriminator." Measured against the live corpus that discriminator BREAKS,
in both directions, because build/unify-corpus.py's VP1.5 palette quantization (run 2026-07-10
over all 896 live sprites) rewrote both crud and art onto the same four fantasy-palette
entries -- (89,57,99), (116,16,108), (178,14,171), (197,69,170), which are the top-4
strict-magenta-window colors by cross-slug spread (each in 247-440 of 680 fantasy sprites,
every OTHER in-window color in exactly ONE sprite):
  - True holes are NOT flat post-quantization: spr-fantasy-ghost's main 601px crud patch
    measures per-channel std 40 (the quantizer dithered the key wash across all four
    entries). A flatness gate keeps the exact crud Adam is pointing at.
  - Flat is not always crud, and in-window is not always crud: the noble's purple coat, the
    faerie-dragon's pink wing membranes, the gas-spore-fungus's magenta cap, the
    performer-legend's purple costume all carry large in-window components (up to 1989px) --
    punching them makes holes in intentional art. Confirmed by eye on marked crops before any
    write.
So the discriminator CANNOT come from the current file alone. It comes from provenance: the
pre-unification originals (quarantine-pack/pre-unification/originals-r2.zip, the archive
unify-corpus.py wrote immediately before it overwrote the corpus -- 896 entries, alpha
byte-identical to the live files wherever shapes match, verified on a 25-sprite sample).
In the ORIGINAL, the classes separate cleanly:
  - True key spill/holes lean magenta there too: ghost patches median magenta-excess
    (min(r,b)-g) 25-66; solar's wing-rim spill 66-110; the excess was baked in at generation
    (these subjects are the ANTI-MAGENTA failure class -- Adam's ruled magenta-fail list in
    dev/model-qa/regen-v3/round3/magenta-fails-r3.md names cloud-giant, water-elemental,
    displacer-beast, archmage, aberrant-cultist... the same subjects this pass flags).
  - QUANTIZATION-MANUFACTURED "magenta": djinni's and will-o-wisp's biggest flagged patches
    were BLUE in the original (median hue 233-252, excess -8..+19) -- solid smoke/flame
    shading the quantizer mapped onto violet palette entries because the palette lacked a
    closer blue. That is pipeline damage wearing a magenta costume. Punching it would hole
    solid art; the correct treatment is COLOR REPAIR (below), and it is exactly why Adam
    still sees "magenta junk hanging around" on subjects MC-1 never touched.
  - Intentional pink/purple art is either coherent at the SUBJECT level in the original
    (lich 0.30, mind-thief 0.51, giant-squid 0.55, wight 0.21, pixie-wonderbringer 0.19
    original wide-magenta fraction -- vs ghost 0.12, djinni 0.04, cloud-giant 0.05) or, for
    the four art subjects that measure low because the purple element is a small share of
    the figure (noble 0.16, performer-legend 0.15, gas-spore 0.18, faerie-dragon 0.08), it
    was adjudicated BY EYE on marked crops and recorded in PROTECT_ART_SLUGS -- an explicit,
    red-pennable ruling list, same pattern as the sprite-review overlay, never a silent
    heuristic.

THE TREATMENT (three per-component outcomes, decided by original-pixel evidence):
  1. REPAIR (quantization damage; original was NOT magenta): component's original-pixel
     spill fraction < SPILL_FRAC_MIN. Recolor every component pixel to the nearest
     fantasy-palette entry (Lab distance) to its ORIGINAL color, with all strict-window
     palette entries EXCLUDED from candidacy -- the pixel gets the color the quantizer
     should have given it (djinni's smoke goes back to blue). Never transparent: it is
     solid art.
  2. PUNCH (true spill; original leans magenta): spill fraction >= SPILL_FRAC_MIN.
     - Unprotected sprite: punch the whole component to alpha 0, no area cap, no edge-
       distance cap, no flatness cap (the touch budget is LIFTED per the ruling -- the
       hue-strictness + the original-evidence spill test are the safety now).
     - Protected sprite (original wide-frac > 0.18, OR one of MC-1's ruled 31 magenta-native
       subjects -- their painted-magenta art, e.g. the astral-raider-dracomancer's purple
       lightning, is magenta in the ORIGINAL too, so the spill test alone cannot clear it --
       OR PROTECT_ART_SLUGS): punch ONLY if the component is FLAT in the current file
       (per-channel std <= FLAT_STD_MAX; a quantized pooled-key hole is a uniform palette
       step, e.g. the purple worm's std-0 specks) AND ring-ISOLATED in foreign-colored art
       (>= RING_NONMAG_FRAC_MIN of its 2px ring is outside MC-1's wide magenta family --
       without this second gate the lemure's smooth pink belly and the ultroloth's wing
       membranes, which quantize to flat single-entry patches surrounded by more pink, get
       punched into holes; confirmed by eye before the gate was added). Shaded or embedded
       in-window components on these subjects are their art (lich's robe folds measure std
       14-16) and are left untouched, listed as protectedArt. Per the ruling: natives are
       NOT exempt from the pass -- "even a purple worm can have enclosed flat-key holes" --
       but "the flatness discriminator must protect their shaded art." Protected-path
       repairs carry the same ring gate; unprotected spill punches do NOT (their legitimate
       targets -- the dust-mephit's clustered blobs -- would false-fail a ring test against
       their own sibling blobs).
  3. CONSERVATIVE FALLBACK (no usable original: slug missing from the r2 archive or
     re-generated at a different size since -- the XL/titan recuts): current-file evidence
     only, so only unambiguous residue is touched: flat (std <= FLAT_STD_MAX) strict-window
     components are punched; nothing is repaired; the sprite is listed under
     origUnavailable for the report.

After punching: the NEW alpha boundary (and only it) gets the established despill/erode
treatment -- erode x2 any adjacent opaque pixel with magenta excess > ERODE_EXCESS, then
despill r/b excess to 25% within DESPILL_BAND px of the punched region -- so no pink rim
survives around a new hole. Distance is measured from this run's punched pixels, never from
the sprite's pre-existing silhouette.

SAFETY RAILS:
  - sanity rail (NOT a budget): if punched+repaired area exceeds SANITY_MAX_TOUCH_FRAC of
    opaque area, leave the file untouched and list under skippedForEyes -- a detector that
    wants half the creature is wrong, a human looks first.
  - outside-identity assert: every pixel outside (punched | repaired | defringed) must be
    byte-identical pre/post; violation aborts the run.
  - PC lane (spr-pc-*) fully exempt -- Adam has not overruled MC-1's third exemption.
  - untouched files are never opened for writing (byte-identity structural).
  - determinism: repaired pixels land on non-strict-window palette entries by construction
    and punched pixels are transparent, so a second run detects zero punch/repair components
    on every touched sprite (--verify checks exactly this).

Emits dev/model-qa/magenta-holes-report.json, dev/model-qa/magenta-crud-sheets/
mc2-before-after-*.png (EVERY touched sprite, ~20 rows/sheet), and
dev/model-qa/magenta-crud-sheets/mc2-worst20-redo.png (MC-1's exact worst20Slugs, before =
the live post-MC-1 file, after = post-MC-2 -- the direct same-subject comparison). Archives
originals of every touched file to quarantine-pack/pre-mc2/originals.zip (additive law).

Flags:
  --report-only   detect/classify + write report + sheets only; never writes sprites or zip.
  --verify        re-run detection on the CURRENT corpus, report remaining detections
                   (the second-run-zero determinism gate). Never mutates.
"""
import argparse
import json
import os
import sys
import zipfile
import io

import numpy as np
from PIL import Image
from scipy import ndimage
import importlib.util as _ilu

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

_mc1_spec = _ilu.spec_from_file_location("clean_magenta_crud", os.path.join(HERE, "clean-magenta-crud.py"))
_mc1_mod = _ilu.module_from_spec(_mc1_spec)
_mc1_spec.loader.exec_module(_mc1_mod)
rgb_to_hsv_arr = _mc1_mod.rgb_to_hsv_arr
wide_magenta_frac = _mc1_mod.wide_magenta_frac

_unify_spec = _ilu.spec_from_file_location("unify_corpus", os.path.join(HERE, "unify-corpus.py"))
_unify_mod = _ilu.module_from_spec(_unify_spec)
_unify_spec.loader.exec_module(_unify_mod)
rgb_to_lab = _unify_mod.rgb_to_lab

SPRITES_DIR = os.path.join(REPO, "assets", "sprites")
REPORT_PATH = os.path.join(REPO, "dev", "model-qa", "magenta-holes-report.json")
VERIFY_REPORT_PATH = os.path.join(REPO, "dev", "model-qa", "magenta-holes-verify.json")
SHEETS_DIR = os.path.join(REPO, "dev", "model-qa", "magenta-crud-sheets")
WORST20_REDO_PATH = os.path.join(SHEETS_DIR, "mc2-worst20-redo.png")
MC1_REPORT_PATH = os.path.join(REPO, "dev", "model-qa", "magenta-crud-report.json")
ORIGINALS_ZIP = os.path.join(REPO, "quarantine-pack", "pre-unification", "originals-r2.zip")
QUARANTINE_ZIP = os.path.join(REPO, "quarantine-pack", "pre-mc2", "originals.zip")
PALETTE_PATH = os.path.join(REPO, "dev", "model-qa", "realm-palettes", "fantasy.json")

EXEMPT_SLUG_PREFIXES = ("spr-pc-",)   # PC lane stays exempt (Adam has not overruled it)

# ---- strict key-hue window (current-file detection; calibrated -- catches the four
#      quantized residue entries, excludes every darker/duller violet family) ----
HOLE_HUE_LO, HOLE_HUE_HI = 283.0, 317.0    # #FF00FF is hue 300
HOLE_SAT_MIN = 0.34
HOLE_VAL_MIN = 0.28
MIN_COMP_PX = 4

# ---- original-evidence spill test (see docstring) ----
SPILL_EXCESS_MIN = 30       # min(r,b)-g in the ORIGINAL for a pixel to count as key spill.
                            # 30 (not lower) keeps borderline lavender art -- e.g. the plain
                            # pixie's wing panels, excess ~20 -- on the repair path, never
                            # punched.
SPILL_FRAC_MIN = 0.5        # component majority vote: >=50% spill pixels => spill

# ---- protection (sprite-level) ----
PROTECT_WIDE_FRAC = _mc1_mod.EXEMPT_WIDE_FRAC   # 0.18, MC-1's own threshold, computed on the
                                                 # ORIGINAL (pre-quantization) pixels here
# Eyeball-adjudicated intentional-magenta art whose purple/pink element is too small a share
# of the figure for the 0.18 test but was confirmed art on marked crops (2026-07-15, this
# unit): the noble's coat, the performer-legend's costume, the faerie-dragon's wing
# membranes, the gas-spore-fungus's cap (a beholder-mimic: the cap IS the creature's face).
# Red-pennable: remove a slug and rerun to have the detector treat it like any other sprite.
PROTECT_ART_SLUGS = {
    "spr-fantasy-noble",
    "spr-fantasy-performer-legend",
    "spr-fantasy-the-faerie-dragon",
    "spr-fantasy-gas-spore-fungus",
}

FLAT_STD_MAX = 3.0          # flat-key signature post-quantization (purple-worm specks: std 0)
SANITY_MAX_TOUCH_FRAC = 0.40  # correctness backstop, NOT a budget (the 5% budget is lifted)

# Ring-isolation gate for PROTECTED sprites (MC-1's RING_NONMAG_FRAC_MIN concept, reused at
# the same 0.70 value): on a protected subject, a flat in-window component only counts as a
# hole if the art AROUND it is mostly NOT magenta-family -- a true hole sits in
# foreign-colored art (the purple worm's specks sit in dark-red hide), while a smooth pink
# body region that quantized to a flat patch sits in MORE pink (the lemure's belly, the
# ultroloth's wing membrane -- both confirmed by eye as would-be holes without this gate).
# Ring context uses a WIDER-than-MC-1 magenta family: same hue span but sat/val floors
# dropped to 0.12/0.10, because the lemure's body reads as DESATURATED grey-mauve (sat
# 0.15-0.25) -- under MC-1's 0.25 sat floor its own body failed to count as magenta context
# and the gate still let body patches through (confirmed by eye). Grey-BLUE surroundings
# (ghost shroud, kraken tentacles, hue ~220-250) stay outside the hue span, so true crud in
# blue/grey art still punches. Applies to protected-path punches AND protected-path repairs;
# unprotected spill punches are already evidence-gated and their targets (dust-mephit's
# clustered blobs) would false-fail a ring test against their own sibling blobs.
# 0.85 not 0.70: at 0.70 the lemure's forehead (752px, ring 0.725) and foot (396px, 0.716)
# still punched -- its dark-plum body shading reads just non-magenta enough to squeak past a
# 70% bar. True foreign-ground crud (the shadow-dragon's flecks on its BLACK body) rings
# 0.9+. Confirmed by eye on marked crops at both values.
RING_NONMAG_FRAC_MIN = 0.85
RING_DILATE_ITERS = 2
RING_CTX_HUE_LO, RING_CTX_HUE_HI = 255.0, 345.0
RING_CTX_SAT_MIN = 0.12
RING_CTX_VAL_MIN = 0.10

# ---- new-boundary defringe (template: slice-sprites.py defringe(), scoped to new edge) ----
ERODE_EXCESS = 60
DESPILL = 0.25
DESPILL_BAND = 2


def strict_key_mask(rgb_u8, opaque):
    h, s, v = rgb_to_hsv_arr(rgb_u8.astype("float64") / 255.0)
    return opaque & (h >= HOLE_HUE_LO) & (h <= HOLE_HUE_HI) & (s >= HOLE_SAT_MIN) & (v >= HOLE_VAL_MIN)


def load_palette_lab():
    """Fantasy realm palette as (rgb array, lab array), STRICT-WINDOW ENTRIES EXCLUDED --
    the repair recolor can never land back inside the detection window (determinism)."""
    with open(PALETTE_PATH) as f:
        pal = json.load(f)
    cols = np.array([[int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16)] for c in pal["colors"]],
                    dtype="float64")
    ones = np.ones((1, cols.shape[0]), dtype=bool)
    window = strict_key_mask(cols.reshape(1, -1, 3).astype("uint8"), ones)[0]
    keep = cols[~window]
    return keep, rgb_to_lab(keep)


def defringe_new_boundary(rgb_i32, alpha, new_transparent):
    """Erode (x2) then despill, distances measured from THIS RUN's punched pixels only.
    Mutates rgb_i32/alpha in place; returns the touched mask."""
    r, g, b = rgb_i32[..., 0], rgb_i32[..., 1], rgb_i32[..., 2]
    touched = np.zeros(alpha.shape, dtype=bool)
    frontier = new_transparent.copy()

    for _ in range(2):
        if not frontier.any():
            break
        dist = ndimage.distance_transform_edt(~frontier)
        adjacent = (dist <= 1.5) & (alpha == 255)
        erode_now = adjacent & ((np.minimum(r, b) - g) > ERODE_EXCESS)
        if not erode_now.any():
            break
        alpha[erode_now] = 0
        frontier |= erode_now
        touched |= erode_now

    if frontier.any():
        dist = ndimage.distance_transform_edt(~frontier)
        band = (dist > 0) & (dist <= DESPILL_BAND) & (alpha == 255)
        despill_now = band & (r > g) & (b > g)
        if despill_now.any():
            newr = g + ((r - g) * DESPILL).astype(np.int32)
            newb = g + ((b - g) * DESPILL).astype(np.int32)
            r[despill_now] = newr[despill_now]
            b[despill_now] = newb[despill_now]
            touched |= despill_now
    return touched


def repair_colors(orig_rgb_comp, pal_rgb, pal_lab):
    """Nearest non-magenta palette entry (Lab distance) for each ORIGINAL pixel color."""
    uniq, inv = np.unique(orig_rgb_comp.reshape(-1, 3), axis=0, return_inverse=True)
    uniq_lab = rgb_to_lab(uniq.astype("float64"))
    d = np.linalg.norm(uniq_lab[:, None, :] - pal_lab[None, :, :], axis=2)
    nearest = pal_rgb[np.argmin(d, axis=1)]
    return nearest[inv].astype("uint8")


def process_sprite(path, orig_zip, pal_rgb, pal_lab, native_slugs):
    slug = os.path.basename(path)[:-4]
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    opaque = arr[..., 3] == 255
    opaque_area = int(opaque.sum())
    orig_bytes = open(path, "rb").read()

    base = {"slug": slug, "opaqueAreaPx": opaque_area, "isNative": slug in native_slugs,
            "_origBytes": orig_bytes, "_origArr": arr, "_cleanImage": None}

    if opaque_area == 0:
        return {**base, "verdict": "clean", "punchedPx": 0, "repairedPx": 0,
                "protectedArtPx": 0, "components": [], "origUnavailable": False,
                "protected": False, "origWideMagentaFrac": None, "protectReason": None,
                "touchedFrac": 0.0}

    strict = strict_key_mask(arr[..., :3], opaque)
    if not strict.any():
        return {**base, "verdict": "clean", "punchedPx": 0, "repairedPx": 0,
                "protectedArtPx": 0, "components": [], "origUnavailable": False,
                "protected": False, "origWideMagentaFrac": None, "protectReason": None,
                "touchedFrac": 0.0}

    # ---- original (pre-unification) evidence ----
    orig_arr = None
    try:
        with orig_zip.open(slug + ".png") as f:
            orig_arr = np.array(Image.open(io.BytesIO(f.read())).convert("RGBA"))
        if orig_arr.shape != arr.shape:
            orig_arr = None
    except KeyError:
        orig_arr = None
    orig_unavailable = orig_arr is None

    # Protection: original wide-frac, OR MC-1's ruled 31-subject canonically-magenta list
    # (their painted-magenta art -- e.g. the astral-raider-dracomancer's purple lightning --
    # is magenta in the ORIGINAL too, so the spill test alone cannot clear it; per Adam's
    # clause "the flatness discriminator must protect their shaded art", natives get the
    # flat-only punch tier, never the unconditional one), OR the eyeball-adjudicated list.
    if orig_arr is not None:
        ro = orig_arr[..., :3].astype("int32")
        orig_excess = np.minimum(ro[..., 0], ro[..., 2]) - ro[..., 1]
        owf = wide_magenta_frac(orig_arr[..., :3], opaque)
        protected = (owf > PROTECT_WIDE_FRAC) or (slug in native_slugs) \
            or (slug in PROTECT_ART_SLUGS)
    else:
        orig_excess = None
        owf = None
        protected = True  # conservative: flat-only punching, no repair

    lbl, n = ndimage.label(strict, structure=np.ones((3, 3)))
    sizes = ndimage.sum(strict, lbl, index=range(1, n + 1))
    objs = ndimage.find_objects(lbl)
    r = arr[..., 0].astype("int32")
    g = arr[..., 1].astype("int32")
    b = arr[..., 2].astype("int32")

    # magenta-FAMILY context mask for the ring-isolation gate (see RING_CTX_* comment)
    hh, ss, vv = rgb_to_hsv_arr(arr[..., :3].astype("float64") / 255.0)
    wide_family = opaque & (hh >= RING_CTX_HUE_LO) & (hh <= RING_CTX_HUE_HI) \
        & (ss >= RING_CTX_SAT_MIN) & (vv >= RING_CTX_VAL_MIN)

    def ring_nonmag_frac(sl_padded, local_padded):
        dil = ndimage.binary_dilation(local_padded, iterations=RING_DILATE_ITERS)
        ring = dil & (~local_padded) & opaque[sl_padded]
        rn = int(ring.sum())
        if rn == 0:
            return 1.0
        return 1.0 - int((wide_family[sl_padded] & ring).sum()) / rn

    punch_mask = np.zeros(arr.shape[:2], dtype=bool)
    repair_mask = np.zeros(arr.shape[:2], dtype=bool)
    comps_report = []
    protected_art_px = 0

    H, W = arr.shape[:2]
    for ci, sz in enumerate(sizes, start=1):
        sz = int(sz)
        if sz < MIN_COMP_PX:
            continue
        sl = objs[ci - 1]
        local = lbl[sl] == ci
        rs, gs, bs = r[sl][local], g[sl][local], b[sl][local]
        stdmax = float(np.std(np.stack([rs, gs, bs], axis=1), axis=0).max())
        flat = stdmax <= FLAT_STD_MAX

        pad = RING_DILATE_ITERS + 1
        slp = (slice(max(0, sl[0].start - pad), min(H, sl[0].stop + pad)),
               slice(max(0, sl[1].start - pad), min(W, sl[1].stop + pad)))
        local_padded = lbl[slp] == ci

        if orig_excess is not None:
            spill_frac = float((orig_excess[sl][local] >= SPILL_EXCESS_MIN).mean())
        else:
            spill_frac = None

        ring_nonmag = None
        if orig_unavailable:
            if flat:
                ring_nonmag = ring_nonmag_frac(slp, local_padded)
                action = "punch" if ring_nonmag >= RING_NONMAG_FRAC_MIN else "protected-art"
            else:
                action = "protected-art"
        elif spill_frac < SPILL_FRAC_MIN:
            if protected:
                ring_nonmag = ring_nonmag_frac(slp, local_padded)
                action = "repair" if ring_nonmag >= RING_NONMAG_FRAC_MIN else "protected-art"
            else:
                action = "repair"
        elif not protected:
            action = "punch"
        elif flat:
            ring_nonmag = ring_nonmag_frac(slp, local_padded)
            # flat-key hole inside protected/native art -- only if isolated in
            # foreign-colored surroundings (see RING_NONMAG_FRAC_MIN comment)
            action = "punch" if ring_nonmag >= RING_NONMAG_FRAC_MIN else "protected-art"
        else:
            action = "protected-art"

        if action == "punch":
            view = punch_mask[sl]
            view[local] = True
            punch_mask[sl] = view
        elif action == "repair":
            view = repair_mask[sl]
            view[local] = True
            repair_mask[sl] = view
        else:
            protected_art_px += sz

        comps_report.append({
            "sizePx": sz, "stdMax": round(stdmax, 2),
            "spillFrac": round(spill_frac, 3) if spill_frac is not None else None,
            "ringNonMagFrac": round(ring_nonmag, 3) if ring_nonmag is not None else None,
            "action": action,
        })

    punched_px = int(punch_mask.sum())
    repaired_px = int(repair_mask.sum())
    touched_frac = (punched_px + repaired_px) / opaque_area

    entry = {**base,
             "origWideMagentaFrac": round(float(owf), 4) if owf is not None else None,
             "protected": bool(protected),
             "protectReason": ("orig-wide-frac" if (owf is not None and owf > PROTECT_WIDE_FRAC)
                                else "magenta-native" if slug in native_slugs
                                else "protect-art-slug" if slug in PROTECT_ART_SLUGS
                                else "orig-unavailable" if orig_unavailable else None),
             "origUnavailable": orig_unavailable,
             "punchedPx": punched_px, "repairedPx": repaired_px,
             "protectedArtPx": protected_art_px,
             "touchedFrac": round(touched_frac, 5),
             "components": comps_report}

    if punched_px == 0 and repaired_px == 0:
        entry["verdict"] = "clean" if protected_art_px == 0 else "protected-only"
        return entry

    if touched_frac > SANITY_MAX_TOUCH_FRAC:
        entry["verdict"] = "skipped-for-eyes"
        entry["skipReason"] = (f"touched fraction {touched_frac:.3f} exceeds sanity rail "
                                f"{SANITY_MAX_TOUCH_FRAC}")
        return entry

    final_arr = arr.copy()
    final_alpha = final_arr[..., 3].copy()

    if repaired_px:
        orig_cols = orig_arr[..., :3][repair_mask]
        final_arr[..., :3][repair_mask] = repair_colors(orig_cols, pal_rgb, pal_lab)

    final_rgb = final_arr[..., :3].astype("int32")
    defringe_touched = np.zeros(arr.shape[:2], dtype=bool)
    if punched_px:
        final_alpha[punch_mask] = 0
        defringe_touched = defringe_new_boundary(final_rgb, final_alpha, punch_mask)
        final_arr[..., :3] = final_rgb.astype("uint8")
    final_arr[..., 3] = final_alpha

    all_touched = punch_mask | repair_mask | defringe_touched
    outside_ok = bool(np.array_equal(arr[~all_touched], final_arr[~all_touched]))

    entry["verdict"] = "cleaned"
    entry["defringePx"] = int(defringe_touched.sum())
    entry["outsideFlaggedIdentical"] = outside_ok
    entry["_cleanImage"] = final_arr
    return entry


def build_contact_sheet(rows, out_path, header_fn):
    if not rows:
        return
    cell, label_h, pad = 160, 18, 6
    sheet_w = pad + 2 * (cell + pad)
    sheet_h = pad + len(rows) * (cell + label_h + pad)
    sheet = Image.new("RGB", (sheet_w, sheet_h), (40, 40, 40))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(sheet)
    for i, w in enumerate(rows):
        y0 = pad + i * (cell + label_h + pad)
        before_im = Image.fromarray(w["_origArr"]).convert("RGBA")
        after_arr = w["_cleanImage"] if w["_cleanImage"] is not None else w["_origArr"]
        after_im = Image.fromarray(after_arr).convert("RGBA")
        for j, art in enumerate((before_im, after_im)):
            bg = Image.new("RGBA", art.size, (70, 70, 70, 255))
            comp = Image.alpha_composite(bg, art).convert("RGB")
            scale = min(cell / comp.width, cell / comp.height)
            nw, nh = max(1, int(comp.width * scale)), max(1, int(comp.height * scale))
            comp = comp.resize((nw, nh), Image.NEAREST)
            x0 = pad + j * (cell + pad)
            sheet.paste(comp, (x0 + (cell - nw) // 2, y0 + label_h + (cell - nh) // 2))
        draw.text((pad, y0), header_fn(w)[:110], fill=(230, 230, 230))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    sheet.save(out_path)


def apply_entries(entries, touched_slugs):
    """Archive originals (append, never overwrite an existing archive member -- the deepest
    original wins) and write cleaned files in place."""
    os.makedirs(os.path.dirname(QUARANTINE_ZIP), exist_ok=True)
    zmode = "a" if os.path.exists(QUARANTINE_ZIP) else "w"
    with zipfile.ZipFile(QUARANTINE_ZIP, zmode, zipfile.ZIP_DEFLATED) as z:
        existing = set(z.namelist()) if zmode == "a" else set()
        for e in entries:
            if e["slug"] in touched_slugs and e["slug"] + ".png" not in existing:
                z.writestr(e["slug"] + ".png", e["_origBytes"])
    for e in entries:
        if e["slug"] in touched_slugs:
            Image.fromarray(e["_cleanImage"]).save(
                os.path.join(SPRITES_DIR, e["slug"] + ".png"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report-only", action="store_true")
    ap.add_argument("--verify", action="store_true")
    args = ap.parse_args()
    write_files = not (args.report_only or args.verify)

    pal_rgb, pal_lab = load_palette_lab()
    orig_zip = zipfile.ZipFile(ORIGINALS_ZIP)

    mc1 = {}
    native_slugs = set()
    if os.path.exists(MC1_REPORT_PATH):
        with open(MC1_REPORT_PATH) as f:
            mc1 = json.load(f)
        native_slugs = {s["slug"] for s in mc1.get("sprites", [])
                        if s.get("exemptReason") == "canonically-magenta-subject"}

    all_paths = sorted(os.path.join(SPRITES_DIR, f)
                       for f in os.listdir(SPRITES_DIR) if f.endswith(".png"))
    scan_paths = [p for p in all_paths
                  if not os.path.basename(p).startswith(EXEMPT_SLUG_PREFIXES)]
    print(f"scanning {len(scan_paths)} sprites "
          f"({len(all_paths) - len(scan_paths)} pc-lane exempt)")

    entries = [process_sprite(p, orig_zip, pal_rgb, pal_lab, native_slugs)
               for p in scan_paths]

    counts = {"clean": 0, "protected-only": 0, "cleaned": 0, "skipped-for-eyes": 0}
    touched_slugs, identity_failures = [], []
    native_touched, orig_unavailable_slugs = [], []
    for e in entries:
        counts[e["verdict"]] += 1
        if e["origUnavailable"] and e["verdict"] != "clean":
            orig_unavailable_slugs.append(e["slug"])
        if e["verdict"] == "cleaned":
            touched_slugs.append(e["slug"])
            if not e.get("outsideFlaggedIdentical", True):
                identity_failures.append(e["slug"])
            if e["isNative"]:
                native_touched.append({
                    "slug": e["slug"], "punchedPx": e["punchedPx"],
                    "repairedPx": e["repairedPx"], "protectedArtPx": e["protectedArtPx"],
                    "touchedFrac": e["touchedFrac"]})

    if identity_failures:
        print("FATAL: outside-flagged pixels changed on:", identity_failures, file=sys.stderr)
        sys.exit(1)
    assert sum(counts.values()) == len(entries), \
        f"verdict reconciliation failed: {sum(counts.values())} != {len(entries)}"

    # Fixed-point iteration (write mode): punching + new-boundary defringe around one
    # component can shift a neighboring, previously sub-threshold or ring-blocked component
    # into eligibility on re-scan (observed: 24px across 2 sprites on the first corpus run).
    # Every action strictly shrinks the strict-window pixel population (punch -> transparent,
    # repair -> non-window palette entry, despill -> out-of-window color), so iterating
    # terminates; cap defensively anyway. Later passes append to the SAME quarantine zip
    # (existing members never overwritten -- the pass-1 original is the one preserved).
    iterations = []
    ever_touched = set(touched_slugs)
    if write_files and touched_slugs:
        apply_entries(entries, touched_slugs)
        iterations.append({"pass": 1, "touched": len(touched_slugs),
                           "punchedPx": sum(e["punchedPx"] for e in entries),
                           "repairedPx": sum(e["repairedPx"] for e in entries)})
        print(f"OK: pass 1 cleaned {len(touched_slugs)} sprites in place, originals -> "
              f"{os.path.relpath(QUARANTINE_ZIP, REPO)}")
        for it in range(2, 6):
            entries_k = [process_sprite(p, orig_zip, pal_rgb, pal_lab, native_slugs)
                         for p in scan_paths]
            touched_k = [e["slug"] for e in entries_k if e["verdict"] == "cleaned"]
            if not touched_k:
                print(f"OK: pass {it} found zero detections -- fixed point reached")
                break
            apply_entries(entries_k, touched_k)
            ever_touched.update(touched_k)
            iterations.append({"pass": it, "touched": len(touched_k),
                               "punchedPx": sum(e["punchedPx"] for e in entries_k),
                               "repairedPx": sum(e["repairedPx"] for e in entries_k)})
            print(f"OK: pass {it} cleaned {len(touched_k)} more sprite(s): {touched_k}")

    if not args.verify:
        # In write mode the AFTER image is reloaded from disk (the true final state after
        # every fixed-point pass); in --report-only it is pass-1's in-memory clean image.
        def final_after(e):
            if write_files and e["slug"] in ever_touched:
                return np.array(Image.open(
                    os.path.join(SPRITES_DIR, e["slug"] + ".png")).convert("RGBA"))
            return e["_cleanImage"] if e["_cleanImage"] is not None else e["_origArr"]

        touched_rows = sorted((e for e in entries if e["slug"] in ever_touched),
                              key=lambda e: -(e["punchedPx"] + e["repairedPx"]))
        touched_rows = [{**e, "_cleanImage": final_after(e)} for e in touched_rows]

        def header(w):
            tag = "native" if w["isNative"] else ("prot" if w["protected"] else "open")
            return (f'{w["slug"]} [{tag}] punch={w["punchedPx"]} repair={w["repairedPx"]}'
                    f'  BEFORE | AFTER')

        for p in range(0, len(touched_rows), 20):
            build_contact_sheet(
                touched_rows[p:p + 20],
                os.path.join(SHEETS_DIR, f"mc2-before-after-{p // 20 + 1:02d}.png"), header)
        n_sheets = (len(touched_rows) + 19) // 20
        print(f"OK: {n_sheets} before/after sheet(s) -> "
              f"{os.path.relpath(SHEETS_DIR, REPO)}/mc2-before-after-*.png")

        worst20 = mc1.get("worst20Slugs", [])
        if worst20:
            by_slug = {e["slug"]: e for e in entries}
            redo = []
            for slug in worst20:
                e = by_slug.get(slug)
                if e is None:
                    continue
                redo.append({**e, "_cleanImage": final_after(e)})

            def header2(w):
                return (f'{w["slug"]} mc2={w["verdict"]} punch={w["punchedPx"]} '
                        f'repair={w["repairedPx"]}  BEFORE(post-MC1) | AFTER(post-MC2)')

            build_contact_sheet(redo, WORST20_REDO_PATH, header2)
            print(f"OK: worst-20 redo -> {os.path.relpath(WORST20_REDO_PATH, REPO)}")

    report = {
        "corpusScanned": len(entries),
        "pcLaneExempt": len(all_paths) - len(scan_paths),
        "verdictCounts": counts,
        "constants": {
            "holeHueWindow": [HOLE_HUE_LO, HOLE_HUE_HI], "holeSatMin": HOLE_SAT_MIN,
            "holeValMin": HOLE_VAL_MIN, "minCompPx": MIN_COMP_PX,
            "spillExcessMin": SPILL_EXCESS_MIN, "spillFracMin": SPILL_FRAC_MIN,
            "protectWideFrac": PROTECT_WIDE_FRAC, "flatStdMax": FLAT_STD_MAX,
            "sanityMaxTouchFrac": SANITY_MAX_TOUCH_FRAC,
            "ringNonMagFracMin": RING_NONMAG_FRAC_MIN,
            "ringDilateIters": RING_DILATE_ITERS,
        },
        "protectArtSlugs": sorted(PROTECT_ART_SLUGS),
        "iterations": iterations,
        "touchedCount": len(ever_touched) if write_files else len(touched_slugs),
        "touchedSlugs": sorted(ever_touched) if write_files else sorted(touched_slugs),
        "totalPunchedPx": sum(e["punchedPx"] for e in entries),
        "totalRepairedPx": sum(e["repairedPx"] for e in entries),
        "totalProtectedArtPx": sum(e["protectedArtPx"] for e in entries),
        "magentaNativeTouchedCount": len(native_touched),
        "magentaNativeTouched": sorted(native_touched, key=lambda x: -x["punchedPx"]),
        "origUnavailableTouched": sorted(orig_unavailable_slugs),
        "skippedForEyes": [{"slug": e["slug"], "reason": e.get("skipReason")}
                            for e in entries if e["verdict"] == "skipped-for-eyes"],
        "sprites": [{k: v for k, v in e.items() if not k.startswith("_")} for e in entries],
    }
    # --verify must never clobber the run's real report (learned the hard way on the first
    # corpus run) -- it writes its own sibling file.
    report_path = VERIFY_REPORT_PATH if args.verify else REPORT_PATH
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"OK: report -> {os.path.relpath(report_path, REPO)}")
    print(f"  verdicts: {counts}")
    print(f"  punched {report['totalPunchedPx']}px / repaired {report['totalRepairedPx']}px "
          f"/ protected-art {report['totalProtectedArtPx']}px")
    print(f"  touched: {len(touched_slugs)}  native touched: {len(native_touched)}  "
          f"orig-unavailable touched: {len(orig_unavailable_slugs)}  "
          f"skipped-for-eyes: {len(report['skippedForEyes'])}")

    if args.verify:
        offenders = [e["slug"] for e in entries
                     if e["punchedPx"] + e["repairedPx"] > 0]
        print(f"  VERIFY: {len(offenders)} sprites still show punch/repair-class detections")
        if offenders:
            print("   ", offenders[:40])


if __name__ == "__main__":
    sys.exit(main())
