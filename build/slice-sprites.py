#!/usr/bin/env python3
"""Genesis build — slice a ChatGPT-generated sprite sheet PNG into game-ready sprites.

Companion to build/gen-sprite-manifests.py: that script writes the ChatGPT prompt (36
creatures/sheet, ordered row-major, flat magenta #FF00FF background — Adam's established
keying workflow); Adam pastes it into ChatGPT and drops the resulting PNG at
dev/sprite-sheets/incoming/sheet-NN.png; this script keys out the magenta, finds the 36
creature blobs, matches them (in row-major reading order) to the manifest's slug order for
that sheet, crops each with padding, and writes assets/sprites/<slug>.png (transparent bg).

Robust by design — this does NOT assume a perfect 6x6 pixel grid. ChatGPT sheets drift: cells
aren't identically sized/spaced, a creature's limb can poke into a neighboring cell's nominal
box, compression can fringe the magenta key with off-color halo pixels. So instead of slicing
fixed rectangles, this:
  1. Keys out magenta with a tolerance (Euclidean distance in RGB, catches JPEG/compression
     fringe near the pure #FF00FF key — the standard keying-tolerance approach).
  2. Finds connected non-magenta components (flood fill / union-find over the alpha mask).
  3. Merges fragments that are close together (a creature that keying split into 2-3 blobs
     because a limb nearly touched the key color) — proximity-based merge, not shape-based.
  4. Takes the N largest merged components (N = --expect, default 36).
  5. Sorts their centroids row-major (top-to-bottom bands first, by clustering centroid Y
     into rows, then left-to-right within each row) — the same reading order
     gen-sprite-manifests.py used to write the prompt.
  6. Matches sorted components 1:1 to the manifest's slug order for that sheet number.
  7. Crops each to its bounding box + padding, writes a trimmed transparent PNG.

Honest failure: if component count != --expect after merging, this is NOT silently patched
by guessing — it writes the review contact sheet (so the mismatch is visible), prints which
manifest slugs got no match / which extra blobs are unassigned, and exits nonzero. A human
(Adam) resolves it by hand (re-key tolerance, --expect override, or a targeted crop) rather
than the script inventing an assignment it can't justify.

Flags:
  --review        always write the contact-sheet HTML (dev/sprite-manifests/review/sheet-NN.html)
                   even on a clean run, so a mis-assignment can be caught by eye before commit.
  --expect N       override the expected creature count (partial sheets — the last sheet in
                   the current 15-sheet run only has 4 creatures, not 36).
  --tolerance N     magenta key-out tolerance (0-441, default 60). Raise if compression fringe
                   survives as opaque halo; lower if creature pixels near-magenta get eaten.
  --padding N      pixels of transparent padding kept around each crop (default 4).
  --out DIR        override assets/sprites/ output dir (mostly for the synthetic self-test).
  --single SLUG    hero-singles mode (dev/sprite-manifests/heroes.md): the image is ONE
                   creature, not a sheet — key out the magenta, trim to the creature's
                   bounding box (all non-noise content, so a key-split fragment is never
                   dropped), and save assets/sprites/<SLUG>.png. No sheet number, no
                   manifest order-matching; the slug is given, not inferred. The slug must
                   exist in manifest.json's "heroes" list (typo guard — a misspelled slug
                   would otherwise silently orphan the sprite).

Dependency: Pillow (PIL), stdlib otherwise. Not currently a repo-wide dependency (no other
build/ script uses it, no requirements.txt exists yet) — if `python3 -c "import PIL"` fails
in your environment, create a scratch venv first:
    python3 -m venv ~/.genesis-sprites-venv
    source ~/.genesis-sprites-venv/bin/activate
    pip install Pillow
    python3 build/slice-sprites.py ...
(Mirrors the CLAUDE.md jsdom convention: "npm i jsdom in a scratch dir... reinstall per
environment" — same idea, pip instead of npm.)

GENERATED OUTPUT — assets/sprites/<slug>.png files are build artifacts of the sheet PNGs at
dev/sprite-sheets/incoming/; the sheet PNGs are the source-ish (they're themselves generated
by ChatGPT from the manifest prompt, so re-running a generation is expected to change output).
"""
import argparse
import json
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print(
        "ERROR: Pillow (PIL) is required. Create a scratch venv and `pip install Pillow` —\n"
        "see the docstring at the top of this script for the exact commands.",
        file=sys.stderr,
    )
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(ROOT, "dev", "sprite-manifests", "manifest.json")
DEFAULT_OUT = os.path.join(ROOT, "assets", "sprites")
REVIEW_DIR = os.path.join(ROOT, "dev", "sprite-manifests", "review")

MAGENTA = (255, 0, 255)
DEFAULT_TOLERANCE = 60  # Euclidean RGB distance; ~60 catches JPEG fringe without eating limbs
DEFAULT_EXPECT = 36
DEFAULT_PADDING = 4


def is_magenta(px, tolerance):
    r, g, b = px[0], px[1], px[2]
    dr, dg, db = r - MAGENTA[0], g - MAGENTA[1], b - MAGENTA[2]
    return (dr * dr + dg * dg + db * db) ** 0.5 <= tolerance


def build_mask(img, tolerance):
    """Return a 2D list[bool] (row-major, [y][x]) of "is creature pixel" (i.e. NOT magenta)."""
    w, h = img.size
    px = img.load()
    mask = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if not is_magenta(px[x, y], tolerance):
                mask[y][x] = True
    return mask


def find_components(mask, w, h):
    """Connected-component labeling over the mask (4-connectivity, iterative flood fill —
    stdlib only, no scipy/skimage). Returns a list of components, each a list of (x,y)."""
    visited = [[False] * w for _ in range(h)]
    components = []
    for y0 in range(h):
        row = mask[y0]
        for x0 in range(w):
            if not row[x0] or visited[y0][x0]:
                continue
            # BFS
            stack = [(x0, y0)]
            visited[y0][x0] = True
            pixels = []
            while stack:
                x, y = stack.pop()
                pixels.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not visited[ny][nx]:
                        visited[ny][nx] = True
                        stack.append((nx, ny))
            components.append(pixels)
    return components


def bbox(pixels):
    xs = [p[0] for p in pixels]
    ys = [p[1] for p in pixels]
    return min(xs), min(ys), max(xs), max(ys)


def centroid(pixels):
    n = len(pixels)
    return sum(p[0] for p in pixels) / n, sum(p[1] for p in pixels) / n


def bbox_distance(b1, b2):
    """0 if bboxes overlap/touch; else the gap between their nearest edges (Chebyshev-ish,
    good enough for 'is this a stray limb fragment of the neighboring blob')."""
    x1a, y1a, x2a, y2a = b1
    x1b, y1b, x2b, y2b = b2
    dx = max(x1a - x2b, x1b - x2a, 0)
    dy = max(y1a - y2b, y1b - y2a, 0)
    return (dx * dx + dy * dy) ** 0.5


def merge_fragments(components, img_w, img_h, min_area_frac=0.0008, merge_dist_frac=0.02,
                     small_frac=0.35):
    """Drop noise-speck components (compression artifacts, stray magenta-adjacent pixels),
    then merge remaining SMALL components into the nearest large one within merge_dist — this
    absorbs a creature that keying split into a body blob + a separated limb/tail fragment.

    Deliberately asymmetric (small-into-large only, not large-into-large): a real sheet's
    36 creature bodies sit in their own cells with real gutters between them, so two full-size
    bodies should never be closer to each other than a stray fragment is to its parent body.
    Merging any two components regardless of relative size (a naive proximity union-find) is
    fragile — on a tightly-packed sheet it can transitively chain neighboring *bodies* together
    through a short gap, which is exactly the kind of silent wrong-merge this script is meant
    to avoid (better to under-merge and let --review / the honest-failure count check catch it
    than to fuse two creatures and mis-detect 35 blobs as correct).

    A component only qualifies as "small" (fragment candidate) if its area is under
    small_frac of the largest kept component's area — so within a same-size cast (e.g. all
    36 bodies roughly equal area) nothing merges into anything, only genuinely tiny stray
    fragments get absorbed. Fractions are relative to sheet size so this scales across
    sheet resolutions."""
    img_diag = (img_w ** 2 + img_h ** 2) ** 0.5
    min_area = min_area_frac * img_w * img_h
    merge_dist = merge_dist_frac * img_diag

    kept = [c for c in components if len(c) >= min_area]
    if not kept:
        return []

    boxes = [bbox(c) for c in kept]
    areas = [len(c) for c in kept]
    max_area = max(areas)
    is_small = [a < small_frac * max_area for a in areas]

    parent = list(range(len(kept)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def union(i, j):
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[ri] = rj

    # Each small fragment merges into its single nearest neighbor within merge_dist (whether
    # that neighbor is large or itself small) — greedy nearest-match, not "merge everything
    # within range," so a fragment can't bridge two unrelated large blobs together.
    for i in range(len(kept)):
        if not is_small[i]:
            continue
        best_j, best_d = None, merge_dist
        for j in range(len(kept)):
            if j == i:
                continue
            d = bbox_distance(boxes[i], boxes[j])
            if d <= best_d:
                best_d = d
                best_j = j
        if best_j is not None:
            union(i, best_j)

    groups = {}
    for i in range(len(kept)):
        groups.setdefault(find(i), []).extend(kept[i])

    return list(groups.values())


def assign_row_major(components, row_tolerance_frac=0.5):
    """Sort component centroids into row-major reading order: cluster centroids into rows by
    Y (a 'row' = centroids within row_tolerance_frac * median-component-height of each other),
    then sort each row left-to-right by X. Matches the order gen-sprite-manifests.py used to
    write the prompt (Row 1 left-to-right, Row 2 left-to-right, ...)."""
    if not components:
        return []
    items = []
    heights = []
    for c in components:
        x1, y1, x2, y2 = bbox(c)
        cx, cy = centroid(c)
        items.append({"pixels": c, "bbox": (x1, y1, x2, y2), "cx": cx, "cy": cy})
        heights.append(y2 - y1)
    heights.sort()
    median_h = heights[len(heights) // 2] or 1
    row_tol = median_h * row_tolerance_frac

    items.sort(key=lambda it: it["cy"])
    rows = []
    for it in items:
        placed = False
        for row in rows:
            if abs(row[-1]["cy"] - it["cy"]) <= row_tol or abs(row[0]["cy"] - it["cy"]) <= row_tol:
                row.append(it)
                placed = True
                break
        if not placed:
            rows.append([it])
    # re-sort rows top-to-bottom by mean cy (rows list may not already be ordered since we
    # appended by nearest-neighbor growth, not by starting cy)
    rows.sort(key=lambda row: sum(it["cy"] for it in row) / len(row))
    ordered = []
    for row in rows:
        row.sort(key=lambda it: it["cx"])
        ordered.extend(row)
    return ordered


def crop_transparent(img, item, tolerance, padding):
    x1, y1, x2, y2 = item["bbox"]
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(img.width - 1, x2 + padding)
    y2 = min(img.height - 1, y2 + padding)
    crop = img.crop((x1, y1, x2 + 1, y2 + 1)).convert("RGBA")
    px = crop.load()
    w, h = crop.size
    for yy in range(h):
        for xx in range(w):
            r, g, b, a = px[xx, yy]
            if is_magenta((r, g, b), tolerance):
                px[xx, yy] = (r, g, b, 0)
    return crop


def load_manifest():
    if not os.path.exists(MANIFEST_PATH):
        print(f"ERROR: manifest not found at {MANIFEST_PATH}. Run build/gen-sprite-manifests.py first.",
              file=sys.stderr)
        sys.exit(1)
    with open(MANIFEST_PATH) as f:
        return json.load(f)


def sheet_key_for(sheet_num, manifest):
    digits = max(2, len(str(manifest["sheetCount"])))
    key = f"sheet-{sheet_num:0{digits}d}"
    if key not in manifest["sheets"]:
        # tolerate a different zero-pad width than the manifest's
        matches = [k for k in manifest["sheets"] if k.endswith(f"-{sheet_num}") or k == f"sheet-{sheet_num}"]
        if matches:
            return matches[0]
        print(f"ERROR: sheet {sheet_num} not found in manifest.json (keys: "
              f"{list(manifest['sheets'].keys())[:3]}...)", file=sys.stderr)
        sys.exit(1)
    return key


def write_review_html(sheet_num, crops, unassigned_extra, missing_slugs, out_path, sheet_png_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    rows_html = []
    for slug, crop_path in crops:
        rel = os.path.relpath(crop_path, os.path.dirname(out_path))
        rows_html.append(
            f'<div class="cell"><img src="{rel}" alt="{slug}"><div class="label">{slug}</div></div>'
        )
    extra_html = ""
    if unassigned_extra:
        extra_html = "<h2>Unassigned extra components</h2><p>" + ", ".join(
            f"blob@({b[0]},{b[1]})-({b[2]},{b[3]})" for b in unassigned_extra
        ) + "</p>"
    missing_html = ""
    if missing_slugs:
        missing_html = "<h2>Manifest slugs with no matched component</h2><p>" + ", ".join(missing_slugs) + "</p>"
    html = f"""<!doctype html><html><head><meta charset="utf-8">
<title>sheet-{sheet_num:02d} review</title>
<style>
body {{ font-family: -apple-system, sans-serif; background:#222; color:#eee; padding:16px; }}
.grid {{ display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; }}
.cell {{ background:#333; padding:6px; text-align:center; border-radius:4px; }}
.cell img {{ max-width:100%; background:
  repeating-conic-gradient(#444 0% 25%, #555 0% 50%) 50% / 16px 16px; }}
.label {{ font-size:11px; margin-top:4px; word-break:break-all; }}
h1,h2 {{ font-weight:600; }}
</style></head><body>
<h1>sheet-{sheet_num:02d} review — {len(crops)} crops assigned</h1>
<p>Source: {sheet_png_path}</p>
<div class="grid">{''.join(rows_html)}</div>
{extra_html}
{missing_html}
</body></html>
"""
    with open(out_path, "w") as f:
        f.write(html)


def slice_single(args, manifest):
    """Hero-singles mode (--single SLUG): the whole image is one creature on magenta. Key
    out, drop noise specks, trim to the union bounding box of ALL remaining content (union,
    not largest-component — a key-split fragment like a detached tail must never be cropped
    away), save <out>/<slug>.png. Honest failure: no non-noise content -> exit nonzero."""
    slug = args.single
    heroes = manifest.get("heroes", [])
    if slug not in heroes:
        # typo guard, not a hard wall — a slug outside the heroes list is almost always a
        # misspelling that would silently orphan the sprite file.
        print(f"ERROR: --single slug '{slug}' is not in manifest.json's heroes list "
              f"({len(heroes)} entries). Check dev/sprite-manifests/heroes.md for the exact slug.",
              file=sys.stderr)
        sys.exit(1)

    img = Image.open(args.sheet_png).convert("RGB")
    w, h = img.size
    print(f"Loaded {args.sheet_png} ({w}x{h}), single-sprite mode, slug={slug}")

    mask = build_mask(img, args.tolerance)
    raw_components = find_components(mask, w, h)
    min_area = 0.0008 * w * h
    kept = [c for c in raw_components if len(c) >= min_area]
    print(f"Found {len(raw_components)} raw components, {len(kept)} after noise filter")

    if not kept:
        print("FAIL: no non-magenta content found — wrong image, or --tolerance ate everything.",
              file=sys.stderr)
        sys.exit(1)

    boxes = [bbox(c) for c in kept]
    x1 = min(b[0] for b in boxes)
    y1 = min(b[1] for b in boxes)
    x2 = max(b[2] for b in boxes)
    y2 = max(b[3] for b in boxes)

    os.makedirs(args.out, exist_ok=True)
    item = {"bbox": (x1, y1, x2, y2)}
    crop = crop_transparent(img, item, args.tolerance, args.padding)
    out_path = os.path.join(args.out, f"{slug}.png")
    crop.save(out_path)
    print(f"OK: wrote {out_path} ({crop.width}x{crop.height}, transparent background).")
    sys.exit(0)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sheet_png", help="path to the input PNG (a 6x6 sheet, or one hero image with --single)")
    ap.add_argument("sheet_num", type=int, nargs="?", default=None,
                    help="sheet number (matches dev/sprite-manifests/manifest.json); omit with --single")
    ap.add_argument("--review", action="store_true", help="always write the contact-sheet HTML")
    ap.add_argument("--expect", type=int, default=None, help="expected creature count (default 36, or manifest count)")
    ap.add_argument("--tolerance", type=int, default=DEFAULT_TOLERANCE, help="magenta key-out tolerance")
    ap.add_argument("--padding", type=int, default=DEFAULT_PADDING, help="crop padding in px")
    ap.add_argument("--out", default=DEFAULT_OUT, help="output dir for sliced sprites")
    ap.add_argument("--single", metavar="SLUG", default=None,
                    help="hero-singles mode: the image is ONE creature; save it as <out>/<SLUG>.png")
    args = ap.parse_args()

    if not os.path.exists(args.sheet_png):
        print(f"ERROR: sheet PNG not found: {args.sheet_png}", file=sys.stderr)
        sys.exit(1)

    manifest = load_manifest()

    if args.single is not None:
        slice_single(args, manifest)
        return  # slice_single exits

    if args.sheet_num is None:
        print("ERROR: sheet_num is required unless --single SLUG is given.", file=sys.stderr)
        sys.exit(2)
    sheet_key = sheet_key_for(args.sheet_num, manifest)
    slugs = manifest["sheets"][sheet_key]["slugs"]
    expect = args.expect if args.expect is not None else manifest["sheets"][sheet_key].get("count", DEFAULT_EXPECT)

    img = Image.open(args.sheet_png).convert("RGB")
    w, h = img.size
    print(f"Loaded {args.sheet_png} ({w}x{h}), sheet={sheet_key}, expect={expect} creatures")

    mask = build_mask(img, args.tolerance)
    raw_components = find_components(mask, w, h)
    merged = merge_fragments(raw_components, w, h)
    merged.sort(key=len, reverse=True)

    print(f"Found {len(raw_components)} raw components -> {len(merged)} after fragment-merge")

    ok = len(merged) == expect
    top = merged[:expect]
    extra = merged[expect:]

    ordered = assign_row_major(top)

    os.makedirs(args.out, exist_ok=True)
    crops = []
    n_match = min(len(ordered), len(slugs))
    for i in range(n_match):
        slug = slugs[i]
        item = ordered[i]
        crop = crop_transparent(img, item, args.tolerance, args.padding)
        out_path = os.path.join(args.out, f"{slug}.png")
        crop.save(out_path)
        crops.append((slug, out_path))

    missing_slugs = slugs[n_match:] if len(slugs) > n_match else []
    unassigned_components = ordered[n_match:] if len(ordered) > n_match else []
    unassigned_extra_bboxes = [it["bbox"] for it in unassigned_components] + [bbox(c) for c in extra]

    print(f"Wrote {len(crops)} sprites to {args.out}")

    review_written = False
    if args.review or not ok or missing_slugs or unassigned_extra_bboxes:
        review_path = os.path.join(REVIEW_DIR, f"{sheet_key}.html")
        write_review_html(args.sheet_num, crops, unassigned_extra_bboxes, missing_slugs, review_path, args.sheet_png)
        review_written = True
        print(f"Review contact sheet: {review_path}")

    if not ok:
        print(
            f"FAIL: found {len(merged)} components, expected {expect} "
            f"(after merge; {len(extra)} extra unassigned, "
            f"{max(0, expect - len(merged))} short).",
            file=sys.stderr,
        )
        if missing_slugs:
            print(f"Slugs with no matched component: {missing_slugs}", file=sys.stderr)
        sys.exit(1)

    if missing_slugs or unassigned_extra_bboxes:
        print("FAIL: component count matched expect, but assignment is incomplete "
              "(should not happen — investigate).", file=sys.stderr)
        sys.exit(1)

    print(f"OK: {len(crops)}/{expect} creatures sliced and assigned in row-major order.")
    if review_written:
        print("(--review requested a contact sheet even though the run was clean.)")
    sys.exit(0)


if __name__ == "__main__":
    main()
