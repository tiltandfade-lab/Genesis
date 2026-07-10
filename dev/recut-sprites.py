#!/usr/bin/env python3
"""Genesis dev — SPRITE-RESCUE U3: recut-from-parent-sheet lane.

docs/SPRITE-RESCUE.md, D3: the primary fix for a magenta-leak sprite is to re-slice it
from its ORIGINAL parent sheet with chroma-unmix at slice time (build/slice-sprites.py's
`unmix()`, run on the raw cell whose background is exactly #FF00FF — the cleanest
possible separation of art from key). Post-hoc `--unmix-file` on the already-cut PNG
(the D3 fallback) only runs when no parent-sheet cell can be VERIFIED as the true source
— this script never guesses a source; it pixel-matches every candidate crop against the
currently committed sprite and only trusts a match below a fixed threshold.

Pipeline per triage `class:"unmix"` slug:
  1. Look up slug -> sheet id + cell n (data/sprite-registry.js, parsed the way
     dev/sprite-review.py:parse_registry does — node evals the JS object literal).
  2. Look up the sheet's expected cell count + cell/slug order (dev/sprite-manifests/
     v2-manifest.json).
  3. Map the sheet id to its raw ChatGPT sheet PNG's base filename by the SPRITE-RESCUE
     U3 step-1 naming convention (fantasy-monsters-N -> fantasy-realm-NN.png, etc.).
     Sheet ids with no known convention (pc-pcs-N and friends) have no clean raw-PNG
     mapping at all — automatic FALLBACK, not an error (see SPRITE-RESCUE.md's resolver
     note).
  4. Gather every candidate raw PNG for that base (the base file itself + retake variants
     like -01b/-02c/-test-01) and, for EACH, re-run slice-sprites.py's own blob-detect +
     row-major assignment (build_mask/find_components/merge_fragments/assign_row_major)
     to get the candidate's crop for the target cell — but only if that candidate's
     component count matches the sheet's expected count (otherwise the row-major
     assignment for ANY cell on that candidate is untrustworthy, same honest-failure
     rule slice_v2_sheet applies to a full-sheet run).
  5. Score each verified-count candidate's crop against the CURRENTLY COMMITTED sprite:
     downscale both to 64x64, mean absolute RGB diff over mutually-opaque pixels. Accept
     the best-scoring candidate if its score is < 24; otherwise this slug has
     no-verified-source and falls back to post-hoc `--unmix-file`-equivalent unmixing of
     the sprite already on disk (still backing it up first).
  6. Back up the CURRENT `assets/sprites/<slug>.png` to
     `dev/sprite-manifests/review/prev/<slug>.png` (gitignored, .gitignore:54) BEFORE any
     overwrite — always, recut or fallback.
  7. Recut path: re-slice just the target cell from the chosen raw sheet WITH unmix at
     the triage's `strength`, overwrite `assets/sprites/<slug>.png`. Fallback path: unmix
     the backed-up copy in place at the triage's `strength`, write it back.

Fails loud (exit 2) if any processed slug resolves to NO action at all — recut
unverifiable AND no existing sprite file to fall back on. Report to stdout: per slug,
source PNG chosen (or FALLBACK), match score, recut|fallback outcome, before/after
interior-leak pixel counts.

NOTE (deviation from docs/SPRITE-RESCUE.md): U1 (`dev/scan-magenta.py`, the standalone
magenta-leak scanner) has not landed on this base yet — only U2 (unmix in
slice-sprites.py) and U6's triage output are present. Rather than import a module that
doesn't exist, `detect_magenta()` below reproduces U1's documented detector shape inline
(opaque/edge/interior/strong/pct per the "Shared data shapes" section of
docs/SPRITE-RESCUE.md) purely for this script's own before/after reporting. When U1
lands for real, this local copy should be replaced with an import of the real thing.

Run:
  python3 dev/recut-sprites.py --dry-run --slug spr-fantasy-ghost ...
  python3 dev/recut-sprites.py --triage dev/sprite-manifests/magenta-triage.json
"""

import argparse
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
from collections import deque

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPRITES_DIR = os.path.join(ROOT, "assets", "sprites")
SHEETS_DIR = os.path.join(ROOT, "ui-sketches", "sprite-sheets")
TRIAGE_PATH = os.path.join(ROOT, "dev", "sprite-manifests", "magenta-triage.json")
V2_MANIFEST_PATH = os.path.join(ROOT, "dev", "sprite-manifests", "v2-manifest.json")
REGISTRY_JS = os.path.join(ROOT, "data", "sprite-registry.js")
REVIEW_DIR = os.path.join(ROOT, "dev", "sprite-manifests", "review")
PREV_DIR = os.path.join(REVIEW_DIR, "prev")

MATCH_ACCEPT = 24.0
MATCH_SIZE = 64

# ---- load build/slice-sprites.py as a module (hyphen in the filename blocks a normal
# `import slice_sprites`) so this script reuses its EXACT blob-detect / crop / unmix
# machinery rather than re-implementing it. ----
_spec = importlib.util.spec_from_file_location(
    "slice_sprites", os.path.join(ROOT, "build", "slice-sprites.py")
)
slicer = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(slicer)


# ---------------------------------------------------------------------------
# registry / manifest lookups
# ---------------------------------------------------------------------------

def parse_registry():
    """Mirror dev/sprite-review.py:parse_registry — data/sprite-registry.js is a JS
    object literal (unquoted keys); let node eval it and hand back JSON."""
    script = (
        'const fs=require("fs");'
        f'const src=fs.readFileSync({json.dumps(REGISTRY_JS)},"utf8");'
        'eval(src.replace(/const SPRITE_REGISTRY=/,"globalThis.SPRITE_REGISTRY="));'
        "process.stdout.write(JSON.stringify(globalThis.SPRITE_REGISTRY));"
    )
    out = subprocess.run(["node", "-e", script], capture_output=True, text=True, cwd=ROOT)
    if out.returncode != 0:
        raise RuntimeError(f"node failed to parse {REGISTRY_JS}: {out.stderr[:500]}")
    return json.loads(out.stdout)


def load_v2_manifest():
    with open(V2_MANIFEST_PATH, encoding="utf-8") as f:
        return json.load(f)


def sheet_meta_for(v2_manifest, sheet_id):
    for sheet in v2_manifest["sheets"]:
        if sheet["id"] == sheet_id:
            return sheet
    return None


# ---------------------------------------------------------------------------
# raw sheet naming convention (SPRITE-RESCUE U3 step 1)
# ---------------------------------------------------------------------------

_RE_MONSTERS = re.compile(r"^fantasy-monsters-(\d+)$")
_RE_NPCS = re.compile(r"^fantasy-npcs-(\d+)$")
_RE_KIDS = re.compile(r"^fantasy-kids-(\d+)$")
_RE_ANIMALS = re.compile(r"^fantasy-(domestic|dungeon|wild)-animals-(\d+)$")
_ANIMAL_STEM = {"domestic": "domestic-animal", "dungeon": "dungeon-animals", "wild": "wild-animals"}


def base_sheet_stem(sheet_id):
    """Map a v2-manifest sheet id to its raw-PNG base filename stem (no extension) per
    the naming convention in docs/SPRITE-RESCUE.md U3 step 1. Returns None when the
    sheet id has no known raw-PNG convention (e.g. pc-pcs-N) — those are automatic
    FALLBACK cases, not errors (PC sprites / some kinds may not map cleanly)."""
    m = _RE_MONSTERS.match(sheet_id)
    if m:
        return f"fantasy-realm-{int(m.group(1)):02d}"
    m = _RE_NPCS.match(sheet_id)
    if m:
        return f"fantasy-realm-npc-{int(m.group(1)):02d}"
    m = _RE_KIDS.match(sheet_id)
    if m:
        return f"fantasy-realm-kids-{int(m.group(1)):02d}"
    m = _RE_ANIMALS.match(sheet_id)
    if m:
        return f"fantasy-realm-{_ANIMAL_STEM[m.group(1)]}-{int(m.group(2)):02d}"
    return None


def find_candidate_pngs(base_stem):
    """Every raw PNG for this base — the base file itself plus retake variants
    (-01b, -02c, -test-01, ...) — in ui-sketches/sprite-sheets/. Never guesses beyond
    what's actually on disk."""
    if not os.path.isdir(SHEETS_DIR):
        return []
    exact = base_stem + ".png"
    letter_re = re.compile(re.escape(base_stem) + r"[a-z]\.png$")
    test_names = set()
    m = re.match(r"^(.*-)(\d+)$", base_stem)
    if m:
        prefix, num = m.groups()
        test_names.add(f"{prefix}test-{num}.png")
    out = []
    for name in sorted(os.listdir(SHEETS_DIR)):
        if name == exact or letter_re.fullmatch(name) or name in test_names:
            out.append(os.path.join(SHEETS_DIR, name))
    return out


# ---------------------------------------------------------------------------
# candidate slicing + scoring (per-candidate blob-detect cached across slugs that
# share the same raw sheet, since 135 unmix slugs land on only ~27 sheets)
# ---------------------------------------------------------------------------

_sheet_cache = {}


def _sliced_candidate(png_path, expected, tolerance=60):
    """Blob-detect + row-major-assign a raw sheet PNG the same way
    slice_sprites.slice_v2_sheet does. Cached per (path, expected, tolerance). Returns
    (img, ordered_components) or (img, None) if the component count doesn't match
    `expected` (untrustworthy assignment — same honest-failure rule as the production
    slicer)."""
    key = (png_path, expected, tolerance)
    if key in _sheet_cache:
        return _sheet_cache[key]
    img = Image.open(png_path).convert("RGB")
    w, h = img.size
    mask = slicer.build_mask(img, tolerance)
    raw = slicer.find_components(mask, w, h)
    merged = slicer.merge_fragments(raw, w, h)
    merged.sort(key=len, reverse=True)
    ordered = None
    if len(merged) == expected:
        ordered = slicer.assign_row_major(merged[:expected])
    result = (img, ordered)
    _sheet_cache[key] = result
    return result


def crop_for_cell(png_path, expected, cell_n, tolerance=60, padding=4, unmix_strength=None):
    """The cell_n'th (1-indexed) crop from a raw sheet PNG, or None if the candidate's
    component count doesn't match `expected` or the index is out of range."""
    img, ordered = _sliced_candidate(png_path, expected, tolerance)
    if ordered is None or cell_n - 1 >= len(ordered):
        return None
    item = ordered[cell_n - 1]
    return slicer.crop_transparent(img, item, tolerance, padding, unmix_strength=unmix_strength)


def match_score(crop_a, crop_b, size=MATCH_SIZE):
    """Mean absolute RGB diff between two RGBA crops, downscaled to size x size, over
    pixels that are opaque (alpha > 0) in BOTH after the resize. None if there are no
    mutually-opaque pixels at all (can't verify)."""
    a = crop_a.convert("RGBA").resize((size, size))
    b = crop_b.convert("RGBA").resize((size, size))
    pa, pb = a.load(), b.load()
    total = 0.0
    n = 0
    for y in range(size):
        for x in range(size):
            ra, ga, ba, aa = pa[x, y]
            rb, gb, bb, ab = pb[x, y]
            if aa > 0 and ab > 0:
                total += (abs(ra - rb) + abs(ga - gb) + abs(ba - bb)) / 3.0
                n += 1
    if n == 0:
        return None
    return total / n


# ---------------------------------------------------------------------------
# U1-equivalent interior magenta-leak detector (U1 itself not landed on this base —
# see module docstring deviation note). Shape matches docs/SPRITE-RESCUE.md's
# "Shared data shapes" section for dev/sprite-manifests/magenta-scan.json.
# ---------------------------------------------------------------------------

def detect_magenta(img, margin=50, strong_excess=110):
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()

    # multi-source BFS distance-to-transparency (crop border counts as transparency too,
    # same convention slice-sprites.py's defringe() edge_pixels() uses).
    dist = [[None] * w for _ in range(h)]
    dq = deque()
    for y in range(h):
        for x in range(w):
            if px[x, y][3] == 0 or x == 0 or y == 0 or x == w - 1 or y == h - 1:
                dist[y][x] = 0
                dq.append((x, y))
    while dq:
        x, y = dq.popleft()
        d = dist[y][x]
        if d >= 2:
            continue
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and dist[ny][nx] is None:
                dist[ny][nx] = d + 1
                dq.append((nx, ny))

    opaque = edge = interior = strong = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            opaque += 1
            m = min(r, b) - g
            if m > margin:
                if dist[y][x] is not None and dist[y][x] <= 2:
                    edge += 1
                else:
                    interior += 1
                    if m > strong_excess:
                        strong += 1
    pct = round((edge + interior) / opaque * 100, 1) if opaque else 0.0
    return {"opaque": opaque, "edge": edge, "interior": interior, "strong": strong, "pct": pct}


# ---------------------------------------------------------------------------
# per-slug resolution
# ---------------------------------------------------------------------------

def resolve_slug(slug, registry, v2_manifest):
    """Figure out what to do for one slug. Returns a dict (never raises for an
    ordinary unresolvable-source case — that's a FALLBACK, not an exception)."""
    res = {"slug": slug, "candidates": []}

    entry = registry.get(slug)
    sheet_id = entry.get("sheet") if entry else None
    cell_n = entry.get("cell") if entry else None

    committed_path = os.path.join(SPRITES_DIR, f"{slug}.png")
    if not os.path.exists(committed_path):
        res["action"] = "hard-fail"
        res["reason"] = f"no committed sprite at {committed_path} — no recut AND no fallback possible"
        return res
    res["committed_path"] = committed_path

    if not sheet_id or cell_n is None:
        res["action"] = "fallback"
        res["reason"] = f"registry entry for {slug} has no sheet/cell ({entry})"
        return res

    sheet_meta = sheet_meta_for(v2_manifest, sheet_id)
    if sheet_meta is None:
        res["action"] = "fallback"
        res["reason"] = f"sheet id '{sheet_id}' not found in v2-manifest.json"
        return res

    base_stem = base_sheet_stem(sheet_id)
    if base_stem is None:
        res["action"] = "fallback"
        res["reason"] = f"sheet id '{sheet_id}' has no raw-PNG naming convention (auto-fallback, e.g. pc-*)"
        return res

    candidates = find_candidate_pngs(base_stem)
    if not candidates:
        res["action"] = "fallback"
        res["reason"] = f"no candidate raw PNG found on disk for base '{base_stem}'"
        return res

    committed = Image.open(committed_path).convert("RGBA")
    expected = sheet_meta["expected"]

    best = None  # (score, path)
    for cand in candidates:
        crop = crop_for_cell(cand, expected, cell_n, unmix_strength=None)
        entry_report = {"path": os.path.relpath(cand, ROOT)}
        if crop is None:
            entry_report["ok"] = False
            entry_report["note"] = "component count mismatch or cell out of range — assignment untrustworthy"
        else:
            score = match_score(crop, committed)
            entry_report["ok"] = True
            entry_report["score"] = round(score, 2) if score is not None else None
            if score is not None and (best is None or score < best[0]):
                best = (score, cand)
        res["candidates"].append(entry_report)

    if best is not None and best[0] < MATCH_ACCEPT:
        res["action"] = "recut"
        res["source"] = os.path.relpath(best[1], ROOT)
        res["score"] = round(best[0], 2)
        res["expected"] = expected
        res["cell_n"] = cell_n
    else:
        res["action"] = "fallback"
        if best is not None:
            res["reason"] = f"no-verified-source (best score {best[0]:.2f} >= {MATCH_ACCEPT})"
        else:
            res["reason"] = "no-verified-source (no candidate had a matching component count / mutually-opaque pixels)"

    return res


def apply_action(res, strength, dry_run):
    """Execute the resolved action (recut or fallback): backup, then overwrite. Returns
    the report dict extended with before/after interior-leak counts.

    Caller (main()) has already skipped slugs with a pre-existing prev/ backup — this
    always runs on a slug being touched for the first time, so the backup below is the
    ONE true pre-rescue original (never overwritten by a later run)."""
    slug = res["slug"]
    committed_path = res["committed_path"]
    prev_path = os.path.join(PREV_DIR, f"{slug}.png")

    before_img = Image.open(committed_path).convert("RGBA")
    res["before"] = detect_magenta(before_img)

    if res["action"] == "recut":
        final_crop = crop_for_cell(
            os.path.join(ROOT, res["source"]), res["expected"], res["cell_n"], unmix_strength=strength
        )
        res["after"] = detect_magenta(final_crop)
        if not dry_run:
            os.makedirs(PREV_DIR, exist_ok=True)
            shutil.copy2(committed_path, prev_path)
            final_crop.save(committed_path)
    elif res["action"] == "fallback":
        after_crop = before_img.copy()
        slicer.unmix(after_crop, strength=strength)
        res["after"] = detect_magenta(after_crop)
        if not dry_run:
            os.makedirs(PREV_DIR, exist_ok=True)
            shutil.copy2(committed_path, prev_path)
            after_crop.save(committed_path)
    # hard-fail: nothing to apply.
    return res


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--triage", default=TRIAGE_PATH, help="path to magenta-triage.json")
    ap.add_argument("--slug", action="append", default=None,
                    help="process only this slug (repeatable); overrides the triage class:\"unmix\" population")
    ap.add_argument("--dry-run", action="store_true", help="resolve + report only; touch nothing on disk")
    args = ap.parse_args()

    with open(args.triage, encoding="utf-8") as f:
        triage = json.load(f)

    if args.slug:
        slugs = args.slug
    else:
        slugs = sorted(s for s, v in triage.items() if isinstance(v, dict) and v.get("class") == "unmix")

    registry = parse_registry()
    v2_manifest = load_v2_manifest()

    results = []
    hard_fails = []
    for slug in slugs:
        triage_entry = triage.get(slug) or {}
        strength = triage_entry.get("strength", 1.0)

        # Idempotency guard (checked BEFORE the expensive candidate-matching pass, not
        # just before the write): a slug that already has a prev/ backup was rescued by
        # an earlier run of this script. Reprocessing it would score candidates against
        # the ALREADY-FIXED committed art (not the true original) and, on a write, would
        # overwrite the one true backup with that already-fixed intermediate state.
        prev_path = os.path.join(PREV_DIR, f"{slug}.png")
        committed_path = os.path.join(SPRITES_DIR, f"{slug}.png")
        if os.path.exists(prev_path):
            res = {
                "slug": slug,
                "strength": strength,
                "action": "already-rescued",
                "candidates": [],
                "reason": f"prev/ backup already exists at {os.path.relpath(prev_path, ROOT)} — skipping re-processing",
            }
            if os.path.exists(committed_path):
                res["before"] = detect_magenta(Image.open(prev_path).convert("RGBA"))
                res["after"] = detect_magenta(Image.open(committed_path).convert("RGBA"))
            results.append(res)
            continue

        res = resolve_slug(slug, registry, v2_manifest)
        res["strength"] = strength
        if res["action"] == "hard-fail":
            hard_fails.append(res)
        else:
            res = apply_action(res, strength, args.dry_run)
        results.append(res)

    # ---- report ----
    print(f"{'DRY-RUN — ' if args.dry_run else ''}SPRITE-RESCUE U3 recut report — {len(slugs)} slug(s)")
    print("=" * 100)
    n_recut = sum(1 for r in results if r["action"] == "recut")
    n_fallback = sum(1 for r in results if r["action"] == "fallback")
    n_already = sum(1 for r in results if r["action"] == "already-rescued")
    n_hardfail = len(hard_fails)
    for r in results:
        print(f"\n{r['slug']}  [{r['action'].upper()}]  strength={r['strength']}")
        for c in r.get("candidates", []):
            tag = "ok" if c.get("ok") else "REJECTED"
            score_s = f" score={c['score']}" if c.get("score") is not None else ""
            note = f" ({c['note']})" if c.get("note") else ""
            print(f"    candidate {c['path']}: {tag}{score_s}{note}")
        if r["action"] == "recut":
            print(f"    -> source={r['source']} cell={r['cell_n']} score={r['score']} (< {MATCH_ACCEPT})")
        elif r["action"] == "fallback":
            print(f"    -> FALLBACK (unmix-file in place): {r.get('reason', '')}")
        elif r["action"] == "hard-fail":
            print(f"    -> HARD FAIL: {r.get('reason', '')}")
        elif r["action"] == "already-rescued":
            print(f"    -> ALREADY-RESCUED (skipped): {r.get('reason', '')}")
        if "before" in r and "after" in r:
            print(f"    before: opaque={r['before']['opaque']} edge={r['before']['edge']} "
                  f"interior={r['before']['interior']} strong={r['before']['strong']} pct={r['before']['pct']}")
            print(f"    after:  opaque={r['after']['opaque']} edge={r['after']['edge']} "
                  f"interior={r['after']['interior']} strong={r['after']['strong']} pct={r['after']['pct']}")

    print("\n" + "=" * 100)
    print(f"SUMMARY: {n_recut} recut, {n_fallback} fallback, {n_already} already-rescued (skipped), "
          f"{n_hardfail} hard-fail (of {len(slugs)})")
    if args.dry_run:
        print("(dry-run: nothing written to disk)")

    if hard_fails:
        print(f"\nFAIL: {len(hard_fails)} slug(s) resolved to no action at all:", file=sys.stderr)
        for r in hard_fails:
            print(f"  {r['slug']}: {r['reason']}", file=sys.stderr)
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
