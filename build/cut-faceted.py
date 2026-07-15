#!/usr/bin/env python3
"""Genesis build — S2: the faceted cut pipeline (VQ2-RESPEC.md §2 unit S2).

Companion to the faceted regeneration harvest landed at dev/model-qa/faceted-sheets/
(codex/faceted-f1-consolidation, S1). That harvest is 419 raw candidate PNGs across FIGURE
rounds (r3a/r3b/r3c/r7r8/r8b/r9/rqa/rqb/mix3) plus non-figure rounds (fx3/p1props/p2dress/
p3icons/p4items/pdecal*/t1tiles — explicitly OUT of scope here). This script keys out the
flat chroma background, splits each candidate into its provenance-declared identities, crops
each to its alpha bbox + padding, and writes assets/sprites-faceted/<slug>.png — additive,
NEVER touching assets/sprites/ (the v3 corpus stays the untouchable reserve, S1's §13 law).

Modeled on build/slice-sprites.py (the proven keyer) — same chroma-key / connected-component /
fragment-merge / crop-to-alpha-bbox / defringe semantics — adapted for this corpus's shape:

  - Key color is DETECTED per candidate, not assumed. Per docs/FACETED-ART-REGENERATION-
    PRODUCTION-PLAN.md §7.1, the chroma is #00ff00 by default and #ff00ff when green is
    materially important to the subject — so instead of a fixed key, this samples the
    candidate's border pixels and keys whichever of magenta/green dominates there.
  - Splitting is provenance-driven, not manifest-order: dev/model-qa/faceted-sheets/<round>-
    returns/provenance/<round>-generation-calls.json's cells[] is the authoritative
    candidate-file -> runtime-slug map (a JSON array OR line-delimited JSON — both formats
    occur in this corpus; see load_provenance). ONE PNG may hold MULTIPLE identities packed
    side by side, left to right — components are sorted by centroid X (not row-major; these
    are single-row cell packs, not sheets) and matched 1:1, in order, to cells[].
  - Honest failure, per file, never silent: a component-count mismatch against cells[] means
    that file is SKIPPED and logged to the report's skipped[] section — never guessed at, never
    quarantined-and-half-written. Same discipline for missing files, unparseable provenance,
    provenance with no matching file on disk, and files with no provenance entry at all.

Performance note: the keying/CC/defringe algorithms are the slice-sprites.py ones, but the
inner loops carry an optional numpy fast path (same semantics — row-RLE union-find IS
4-connectivity CC labeling; the defringe erode/despill conditions are ported condition-for-
condition). The corpus is 166 candidates at ~2.6 MP each; pure-Python per-pixel loops take
tens of minutes, the numpy path takes minutes. numpy is OPTIONAL — without it the pure-PIL/
stdlib fallbacks (slice-sprites.py's own dependency convention) run and produce identical
output, just slowly. `--pure` forces the fallbacks for equivalence testing.

GENERATED OUTPUT — assets/sprites-faceted/<slug>.png files and dev/model-qa/faceted-cut-
report.json are build artifacts of the harvested candidate PNGs; re-running this script is
expected to reproduce (or, if the harvest changes, change) their content. Never hand-edit
either.

Dependency: Pillow (PIL), stdlib otherwise (matches slice-sprites.py's own note); numpy used
opportunistically if importable. If `python3 -c "import PIL"` fails in your environment,
create a scratch venv first:
    python3 -m venv ~/.genesis-sprites-venv
    source ~/.genesis-sprites-venv/bin/activate
    pip install Pillow
    python3 build/cut-faceted.py ...
"""
import argparse
import json
import os
import re
import sys

try:
    from PIL import Image
except ImportError:
    print(
        "ERROR: Pillow (PIL) is required. Create a scratch venv and `pip install Pillow` —\n"
        "see the docstring at the top of this script for the exact commands.",
        file=sys.stderr,
    )
    sys.exit(1)

try:
    import numpy as np
    HAVE_NUMPY = True
except ImportError:
    np = None
    HAVE_NUMPY = False

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SHEETS_ROOT = os.path.join(ROOT, "dev", "model-qa", "faceted-sheets")
DEFAULT_OUT = os.path.join(ROOT, "assets", "sprites-faceted")
DEFAULT_REPORT = os.path.join(ROOT, "dev", "model-qa", "faceted-cut-report.json")

# The FIGURE rounds named in VQ2-RESPEC.md §2 unit S2, in the exact enumeration given —
# fx3/p1props/p2dress/p3icons/p4items/pdecal*/t1tiles are NOT figures and are never globbed.
# (r3c-returns-r2, r7r8-returns-v2, r9-returns-v2 exist on disk alongside these but are NOT
# named in the spec's round list — deliberately not processed; reported in notes, not folded
# in silently.)
FIGURE_ROUNDS = ["r3a", "r3b", "r3c", "r7r8", "r8b", "r9", "rqa", "rqb", "mix3"]

# The known non-figure round dirs (out of scope for S2 by spec) — used only to classify
# out-of-scope *-returns dirs in the report's notes, never to process them.
NON_FIGURE_ROUND_DIRS = {
    "fx3-returns", "p1props-returns", "p1props-returns-b", "p2dress-returns",
    "p3icons-returns", "p4items-returns", "pdecal-returns", "pdecalb-returns",
    "pdecalc-returns", "t1tiles-returns",
}

MAGENTA = (255, 0, 255)
GREEN = (0, 255, 0)
KEY_TOLERANCE = 60  # Euclidean RGB distance; matches slice-sprites.py's DEFAULT_TOLERANCE
BORDER_MATCH_TOLERANCE = 60  # how close the dominant border color must be to count as "that key"
DEFAULT_PADDING = 4  # matches slice-sprites.py's DEFAULT_PADDING

# qa-ledger.json verdicts observed in this corpus: ADMIT-CANDIDATE, REVIEW, REDO (see the run
# report's qaLedger.verdictsObserved for what a given run actually found). REDO is a QA
# rejection of that specific file — treated as the reject class. ADMIT-CANDIDATE/REVIEW pass.
QA_LEDGER_REJECT_VERDICTS = {"REDO", "REJECT", "REJECTED"}

# A figure slug always starts with "spr-" (spr-fantasy-..., spr-pc-...). Anything else found
# inside a figure round's raw-figures/ (observed: "fx-" effects sheets misrouted into rqa-
# returns/raw-figures/, per dev/model-qa/faceted-sheets/INDEX.md's "F4/F8 misroutes" note) is
# categorically out of scope for this figure-only unit, the same way the fx3 round itself is.
FIGURE_SLUG_PREFIX = "spr-"

CANDIDATE_NUM_RE = re.compile(r"-candidate-(\d+)\.png$")


# ---------------------------------------------------------------------------
# Provenance loading — handles both JSON-array and line-delimited-JSON forms
# (both occur in this corpus: r8b-returns' file is JSONL, the rest are arrays).
# ---------------------------------------------------------------------------

def load_provenance(path):
    with open(path) as f:
        txt = f.read()
    try:
        return json.loads(txt)
    except json.JSONDecodeError:
        items = []
        for line in txt.splitlines():
            line = line.strip()
            if not line:
                continue
            items.append(json.loads(line))
        return items


def basename_of(file_field):
    """Provenance 'file' values appear as bare 'raw-figures/x.png', round-prefixed
    '<round>-returns/raw-figures/x.png', or None (a safety-blocked generation call with no
    output). Normalize to just the filename; None stays None."""
    if not file_field:
        return None
    return os.path.basename(file_field)


# ---------------------------------------------------------------------------
# Keying / connected components / fragment merge / crop — algorithm ported from
# build/slice-sprites.py, parametrized on key color instead of hardcoded magenta.
# Components are carried as stats dicts {area, bbox, cx, cy} (all any downstream
# step needs) rather than raw pixel lists, so the numpy fast path and the pure
# fallback share one interface.
# ---------------------------------------------------------------------------

def color_distance(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def is_key(px, key, tolerance):
    return color_distance(px[:3], key) <= tolerance


def detect_key_color(img):
    """Sample border pixels, find the dominant color, and report which of magenta/green it's
    closest to. Per docs/FACETED-ART-REGENERATION-PRODUCTION-PLAN.md §7.1 the corpus mixes
    both (green default, magenta when green is materially important to the subject) — so this
    NEVER assumes one, it measures per candidate. Returns (name, rgb) or (None, dominant) if
    the border isn't conclusively close to either — callers must treat that as a hard failure,
    never a guess."""
    from collections import Counter
    w, h = img.size
    px = img.load()
    samples = Counter()
    step_x = max(1, w // 100)
    step_y = max(1, h // 100)
    for x in range(0, w, step_x):
        samples[px[x, 0]] += 1
        samples[px[x, h - 1]] += 1
    for y in range(0, h, step_y):
        samples[px[0, y]] += 1
        samples[px[w - 1, y]] += 1
    dominant, _ = samples.most_common(1)[0]
    dmag = color_distance(dominant, MAGENTA)
    dgrn = color_distance(dominant, GREEN)
    if dmag <= BORDER_MATCH_TOLERANCE and dmag <= dgrn:
        return "magenta", MAGENTA
    if dgrn <= BORDER_MATCH_TOLERANCE:
        return "green", GREEN
    return None, dominant


# --- component extraction: numpy fast path ---------------------------------

def _components_numpy(img, key, tolerance):
    """Mask + 4-connectivity connected components via row-RLE union-find (exactly the
    components slice-sprites.py's flood fill finds — merging vertically-overlapping row runs
    IS 4-connectivity CC labeling), returning stats dicts."""
    arr = np.asarray(img, dtype=np.int32)
    diff = arr - np.array(key, dtype=np.int32)
    mask = (diff * diff).sum(axis=2) > tolerance * tolerance  # True = creature pixel
    h, w = mask.shape

    runs = []          # (y, x0, x1) inclusive
    parent = []

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def union(i, j):
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[ri] = rj

    prev_row_runs = []  # list of (run_idx, x0, x1) for the previous row
    m8 = mask.astype(np.int8)
    for y in range(h):
        d = np.diff(np.concatenate(([0], m8[y], [0])))
        x0s = np.flatnonzero(d == 1)
        x1s = np.flatnonzero(d == -1) - 1
        cur = []
        for x0, x1 in zip(x0s.tolist(), x1s.tolist()):
            idx = len(runs)
            runs.append((y, x0, x1))
            parent.append(idx)
            cur.append((idx, x0, x1))
        # union with column-overlapping runs of the previous row (4-connectivity)
        pi = 0
        for idx, x0, x1 in cur:
            while pi < len(prev_row_runs) and prev_row_runs[pi][2] < x0:
                pi += 1
            pj = pi
            while pj < len(prev_row_runs) and prev_row_runs[pj][1] <= x1:
                union(idx, prev_row_runs[pj][0])
                pj += 1
        prev_row_runs = cur

    groups = {}
    for i, (y, x0, x1) in enumerate(runs):
        r = find(i)
        n = x1 - x0 + 1
        sx = (x0 + x1) * n / 2.0
        g = groups.get(r)
        if g is None:
            groups[r] = {"area": n, "bbox": [x0, y, x1, y], "sumx": sx, "sumy": float(y) * n}
        else:
            g["area"] += n
            g["sumx"] += sx
            g["sumy"] += float(y) * n
            bb = g["bbox"]
            if x0 < bb[0]:
                bb[0] = x0
            if x1 > bb[2]:
                bb[2] = x1
            if y < bb[1]:
                bb[1] = y
            if y > bb[3]:
                bb[3] = y

    comps = []
    for g in groups.values():
        comps.append({
            "area": g["area"],
            "bbox": tuple(g["bbox"]),
            "cx": g["sumx"] / g["area"],
            "cy": g["sumy"] / g["area"],
        })
    return comps


# --- component extraction: pure fallback (slice-sprites.py verbatim approach) ---

def _components_pure(img, key, tolerance):
    """slice-sprites.py's build_mask + find_components (4-connectivity iterative flood fill),
    reduced to stats dicts."""
    w, h = img.size
    px = img.load()
    mask = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if not is_key(px[x, y], key, tolerance):
                mask[y][x] = True

    visited = [[False] * w for _ in range(h)]
    comps = []
    for y0 in range(h):
        row = mask[y0]
        for x0 in range(w):
            if not row[x0] or visited[y0][x0]:
                continue
            stack = [(x0, y0)]
            visited[y0][x0] = True
            n = 0
            sx = sy = 0.0
            bx1, by1, bx2, by2 = x0, y0, x0, y0
            while stack:
                x, y = stack.pop()
                n += 1
                sx += x
                sy += y
                if x < bx1:
                    bx1 = x
                if x > bx2:
                    bx2 = x
                if y < by1:
                    by1 = y
                if y > by2:
                    by2 = y
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not visited[ny][nx]:
                        visited[ny][nx] = True
                        stack.append((nx, ny))
            comps.append({"area": n, "bbox": (bx1, by1, bx2, by2), "cx": sx / n, "cy": sy / n})
    return comps


def extract_components(img, key, tolerance):
    if HAVE_NUMPY:
        return _components_numpy(img, key, tolerance)
    return _components_pure(img, key, tolerance)


def bbox_distance(b1, b2):
    x1a, y1a, x2a, y2a = b1
    x1b, y1b, x2b, y2b = b2
    dx = max(x1a - x2b, x1b - x2a, 0)
    dy = max(y1a - y2b, y1b - y2a, 0)
    return (dx * dx + dy * dy) ** 0.5


def merge_fragments(comps, img_w, img_h, min_area_frac=0.0008, merge_dist_frac=0.02,
                     small_frac=0.35):
    """Drop noise-speck components, merge small fragments (a limb/tail that keying split off)
    into their nearest large neighbor. Verbatim algorithm from slice-sprites.py — see that
    file's docstring for the full rationale (asymmetric small-into-large merge only, so two
    real full-size bodies never get fused through a short gap) — operating on stats dicts."""
    img_diag = (img_w ** 2 + img_h ** 2) ** 0.5
    min_area = min_area_frac * img_w * img_h
    merge_dist = merge_dist_frac * img_diag

    kept = [c for c in comps if c["area"] >= min_area]
    if not kept:
        return []

    areas = [c["area"] for c in kept]
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

    for i in range(len(kept)):
        if not is_small[i]:
            continue
        best_j, best_d = None, merge_dist
        for j in range(len(kept)):
            if j == i:
                continue
            d = bbox_distance(kept[i]["bbox"], kept[j]["bbox"])
            if d <= best_d:
                best_d = d
                best_j = j
        if best_j is not None:
            union(i, best_j)

    groups = {}
    for i in range(len(kept)):
        r = find(i)
        c = kept[i]
        g = groups.get(r)
        if g is None:
            groups[r] = {
                "area": c["area"],
                "bbox": list(c["bbox"]),
                "sumx": c["cx"] * c["area"],
                "sumy": c["cy"] * c["area"],
            }
        else:
            g["area"] += c["area"]
            g["sumx"] += c["cx"] * c["area"]
            g["sumy"] += c["cy"] * c["area"]
            bb = g["bbox"]
            ob = c["bbox"]
            bb[0] = min(bb[0], ob[0])
            bb[1] = min(bb[1], ob[1])
            bb[2] = max(bb[2], ob[2])
            bb[3] = max(bb[3], ob[3])

    merged = []
    for g in groups.values():
        merged.append({
            "area": g["area"],
            "bbox": tuple(g["bbox"]),
            "cx": g["sumx"] / g["area"],
            "cy": g["sumy"] / g["area"],
        })
    return merged


# --- crop + key-out + defringe ----------------------------------------------

def _defringe_pure(crop, despill=0.25, erode_excess=60, band=2):
    """Kill the key-color halo on anti-aliased edges. Verbatim from slice-sprites.py (it
    operates on whatever's already been keyed to alpha=0, not a specific color)."""
    px = crop.load()
    w, h = crop.size

    def edge_pixels():
        out = []
        for yy in range(h):
            for xx in range(w):
                if px[xx, yy][3] == 0:
                    continue
                for nx, ny in ((xx - 1, yy), (xx + 1, yy), (xx, yy - 1), (xx, yy + 1),
                               (xx - 1, yy - 1), (xx + 1, yy - 1), (xx - 1, yy + 1), (xx + 1, yy + 1)):
                    if not (0 <= nx < w and 0 <= ny < h) or px[nx, ny][3] == 0:
                        out.append((xx, yy))
                        break
        return out

    for _ in range(2):
        eroded = False
        for xx, yy in edge_pixels():
            r, g, b, a = px[xx, yy]
            if min(r, b) - g > erode_excess:
                px[xx, yy] = (r, g, b, 0)
                eroded = True
        if not eroded:
            break

    dist = [[None] * w for _ in range(h)]
    frontier = []
    for yy in range(h):
        for xx in range(w):
            if px[xx, yy][3] == 0:
                dist[yy][xx] = 0
                frontier.append((xx, yy))
    for xx in range(w):
        for yy in (0, h - 1):
            if dist[yy][xx] is None:
                dist[yy][xx] = 1
                frontier.append((xx, yy))
    for yy in range(h):
        for xx in (0, w - 1):
            if dist[yy][xx] is None:
                dist[yy][xx] = 1
                frontier.append((xx, yy))
    d = 0
    while frontier and d < band:
        d += 1
        nxt = []
        for xx, yy in frontier:
            for nx, ny in ((xx - 1, yy), (xx + 1, yy), (xx, yy - 1), (xx, yy + 1)):
                if 0 <= nx < w and 0 <= ny < h and dist[ny][nx] is None:
                    dist[ny][nx] = d
                    nxt.append((nx, ny))
        frontier = nxt
    for yy in range(h):
        for xx in range(w):
            dd = dist[yy][xx]
            if dd is None or dd == 0:
                continue
            r, g, b, a = px[xx, yy]
            if a and r > g and b > g:
                px[xx, yy] = (g + int((r - g) * despill), g, g + int((b - g) * despill), a)


def _shift_or_4(m):
    """OR of the four 4-neighbor shifts of a boolean array (out-of-bounds contributes False)."""
    out = np.zeros_like(m)
    out[1:, :] |= m[:-1, :]
    out[:-1, :] |= m[1:, :]
    out[:, 1:] |= m[:, :-1]
    out[:, :-1] |= m[:, 1:]
    return out


def _defringe_numpy(arr, despill=0.25, erode_excess=60, band=2):
    """Numpy port of _defringe_pure — condition-for-condition identical.

    Erode pass: an opaque pixel with any 8-neighbor transparent-or-out-of-bounds whose
    min(r,b)-g > erode_excess goes transparent. (The pure version precomputes the edge list
    then mutates alpha only; the color test reads r/g/b which the pass never touches, so a
    batch apply equals its sequential apply.) Up to 2 iterations, stopping early when an
    iteration erodes nothing.

    Despill pass: the pure version's BFS assigns dist 0 to transparency, dist 1 to
    non-transparent image-border pixels, then 4-conn expands: iteration 1 gives dist 1 to
    unset neighbors of ALL of that frontier, iteration 2 gives dist 2 — replicated exactly.
    Pixels with dist>=1, a>0, r>g, b>g get their r/b excess over g scaled to despill
    (int() truncation on a positive value == floor). Mutates arr in place."""
    h, w = arr.shape[:2]
    r = arr[:, :, 0].astype(np.int32)
    g = arr[:, :, 1].astype(np.int32)
    b = arr[:, :, 2].astype(np.int32)

    for _ in range(2):
        a = arr[:, :, 3]
        opaque = a > 0
        padded = np.zeros((h + 2, w + 2), dtype=bool)
        padded[1:-1, 1:-1] = opaque
        all8 = np.ones((h, w), dtype=bool)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0:
                    continue
                all8 &= padded[1 + dy:h + 1 + dy, 1 + dx:w + 1 + dx]
        edge = opaque & ~all8
        cond = edge & (np.minimum(r, b) - g > erode_excess)
        if not cond.any():
            break
        arr[:, :, 3][cond] = 0

    a = arr[:, :, 3]
    trans = a == 0
    dist = np.full((h, w), -1, dtype=np.int8)
    dist[trans] = 0
    border = np.zeros((h, w), dtype=bool)
    border[0, :] = True
    border[-1, :] = True
    border[:, 0] = True
    border[:, -1] = True
    dist[border & ~trans] = 1
    frontier = dist >= 0
    for d in range(1, band + 1):
        newly = _shift_or_4(frontier) & (dist == -1)
        if not newly.any():
            break
        dist[newly] = d
        frontier = newly

    sel = (dist >= 1) & (a > 0) & (r > g) & (b > g)
    if sel.any():
        new_r = g + np.floor((r - g) * despill).astype(np.int32)
        new_b = g + np.floor((b - g) * despill).astype(np.int32)
        arr[:, :, 0][sel] = new_r[sel].astype(np.uint8)
        arr[:, :, 1][sel] = g[sel].astype(np.uint8)
        arr[:, :, 2][sel] = new_b[sel].astype(np.uint8)


def crop_component(img, comp_bbox, key, tolerance, padding):
    x1, y1, x2, y2 = comp_bbox
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(img.width - 1, x2 + padding)
    y2 = min(img.height - 1, y2 + padding)
    crop = img.crop((x1, y1, x2 + 1, y2 + 1)).convert("RGBA")
    if HAVE_NUMPY:
        arr = np.array(crop)
        diff = arr[:, :, :3].astype(np.int32) - np.array(key, dtype=np.int32)
        keyed = (diff * diff).sum(axis=2) <= tolerance * tolerance
        arr[:, :, 3][keyed] = 0
        _defringe_numpy(arr)
        return Image.fromarray(arr)  # uint8 HxWx4 infers RGBA; explicit mode arg is deprecated
    px = crop.load()
    w, h = crop.size
    for yy in range(h):
        for xx in range(w):
            r, g, b, a = px[xx, yy]
            if is_key((r, g, b), key, tolerance):
                px[xx, yy] = (r, g, b, 0)
    _defringe_pure(crop)
    return crop


# --- output measurements -----------------------------------------------------

def alpha_bbox(img):
    """Tight bbox of visible (alpha > 0) content in an RGBA image, or None if fully
    transparent."""
    if HAVE_NUMPY:
        a = np.asarray(img)[:, :, 3]
        ys, xs = np.nonzero(a > 0)
        if len(xs) == 0:
            return None
        return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())
    w, h = img.size
    px = img.load()
    xs_min, ys_min, xs_max, ys_max = w, h, -1, -1
    found = False
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 0:
                found = True
                if x < xs_min:
                    xs_min = x
                if x > xs_max:
                    xs_max = x
                if y < ys_min:
                    ys_min = y
                if y > ys_max:
                    ys_max = y
    if not found:
        return None
    return xs_min, ys_min, xs_max, ys_max


def foot_contact_x(img):
    """Lowest opaque row's x-center, normalized 0-1 by width — a first-pass ground-contact
    estimate for the registry's footX (S3 consumes/refines this; this unit just measures it)."""
    w, h = img.size
    if HAVE_NUMPY:
        a = np.asarray(img)[:, :, 3]
        rows = np.nonzero((a > 0).any(axis=1))[0]
        if len(rows) == 0:
            return None
        y = int(rows[-1])
        xs = np.nonzero(a[y] > 0)[0]
        return ((int(xs[0]) + int(xs[-1])) / 2.0) / w
    px = img.load()
    for y in range(h - 1, -1, -1):
        xs = [x for x in range(w) if px[x, y][3] > 0]
        if xs:
            return ((min(xs) + max(xs)) / 2.0) / w
    return None


def residual_key_pixels(img, key, tolerance):
    """Count visible pixels that still fall within key-color tolerance — the zero-residue
    verification gate. A properly keyed+defringed crop should have none."""
    if HAVE_NUMPY:
        arr = np.asarray(img).astype(np.int32)
        diff = arr[:, :, :3] - np.array(key, dtype=np.int32)
        keyed = (diff * diff).sum(axis=2) <= tolerance * tolerance
        return int((keyed & (arr[:, :, 3] > 0)).sum())
    w, h = img.size
    px = img.load()
    n = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and is_key((r, g, b), key, tolerance):
                n += 1
    return n


# ---------------------------------------------------------------------------
# Exclusion sources
# ---------------------------------------------------------------------------

def load_qa_ledger(sheets_root):
    path = os.path.join(sheets_root, "qa-ledger.json")
    if not os.path.exists(path):
        return {}, []
    with open(path) as f:
        d = json.load(f)
    verdicts = sorted({(v.get("verdict") if isinstance(v, dict) else str(v)) for v in d.values()})
    return d, verdicts


def load_final_crop_fails(sheets_root):
    path = os.path.join(sheets_root, "final-crop-fails.json")
    if not os.path.exists(path):
        return set()
    with open(path) as f:
        return set(json.load(f))


def qa_ledger_verdict_for(qa_ledger, round_name, basename):
    """Exact-path lookup only — qa-ledger.json's keys use a pre-reorg packet-directory
    convention (e.g. 'F10/spr-fantasy-...png') that predates the round-based raw-figures/
    layout this script processes; see the run report's qaLedger.note for what this run found.
    Never guessed via basename-only crosswalk: 'candidate-001.png' is a generic filename reused
    across unrelated identities/rounds, so a basename match is not a reliable same-asset
    signal — matching on it would risk excluding a legitimate redo delivery that happens to
    share a filename with an old, unrelated rejected packet entry."""
    for key in (
        f"{round_name}-returns/raw-figures/{basename}",
        f"{round_name}-returns/{basename}",
        f"raw-figures/{basename}",
        basename,
    ):
        if key in qa_ledger:
            v = qa_ledger[key]
            return v.get("verdict") if isinstance(v, dict) else v
    return None


def final_crop_fails_match(final_crop_fails, round_name, basename):
    for key in (
        f"{round_name}-returns/raw-figures/{basename}",
        f"{round_name}-returns/{basename}",
        f"raw-figures/{basename}",
        basename,
    ):
        if key in final_crop_fails:
            return key
    return None


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def candidate_number(basename):
    m = CANDIDATE_NUM_RE.search(basename)
    return int(m.group(1)) if m else 0


def process_round(round_name, sheets_root, qa_ledger, final_crop_fails, tolerance, padding,
                   skipped, notes):
    """Returns a list of successfully cut candidates: dicts with slug, round, file, cellIndex,
    candidateNum, cropImage (PIL RGBA), keyColorName, rawComponentCount, mergedComponentCount."""
    round_dir = os.path.join(sheets_root, f"{round_name}-returns")
    prov_path = os.path.join(round_dir, "provenance", f"{round_name}-generation-calls.json")
    raw_dir = os.path.join(round_dir, "raw-figures")

    if not os.path.isdir(raw_dir):
        notes.append(f"{round_name}: raw-figures/ directory not found at {raw_dir} — round skipped entirely.")
        return []
    if not os.path.exists(prov_path):
        notes.append(f"{round_name}: provenance file not found at {prov_path} — round skipped entirely.")
        return []

    entries = load_provenance(prov_path)

    # Group provenance entries by basename (a file can be referenced more than once, e.g.
    # r8b-returns has an exact duplicate entry for one file — same cells, different callId).
    by_basename = {}
    conflict_basenames = set()
    for entry in entries:
        b = basename_of(entry.get("file"))
        if b is None:
            skipped.append({
                "round": round_name,
                "file": None,
                "callId": entry.get("callId"),
                "reason": "generation call has no output file (safety-blocked or otherwise "
                          "unfulfilled) — nothing to cut",
                "cells": entry.get("cells", []),
            })
            continue
        if b in by_basename:
            if by_basename[b]["cells"] != entry.get("cells", []):
                conflict_basenames.add(b)
            # else: identical duplicate entry, dedupe silently (same file, same cells, a
            # retried/duplicated generation-call record) — not a data problem worth reporting.
        else:
            by_basename[b] = {"cells": entry.get("cells", []), "callIds": []}
        by_basename[b]["callIds"].append(entry.get("callId"))

    for b in conflict_basenames:
        skipped.append({
            "round": round_name,
            "file": b,
            "reason": "conflicting provenance entries for the same file (different cells[] "
                      "lists under the same filename) — cannot determine the authoritative "
                      "slug mapping, not guessed",
        })
        del by_basename[b]

    disk_files = set(f for f in os.listdir(raw_dir) if f.endswith(".png"))

    # Provenance entries whose file isn't on disk (observed cause in this corpus: the file was
    # later crop-rejected and physically relocated to crop-rejects/, per
    # dev/model-qa/faceted-sheets/crop-rejects/ + final-crop-fails.json — the provenance record
    # is stale, not wrong).
    for b, info in list(by_basename.items()):
        if b not in disk_files:
            skipped.append({
                "round": round_name,
                "file": b,
                "reason": "provenance references this file but it is not present in "
                          "raw-figures/ (consistent with a crop-reject relocation to "
                          "crop-rejects/ — see final-crop-fails.json)",
                "cells": info["cells"],
            })
            del by_basename[b]

    # Disk files with no provenance entry at all — genuinely unprovenanced, never guessed.
    for b in sorted(disk_files - set(by_basename)):
        skipped.append({
            "round": round_name,
            "file": b,
            "reason": "no provenance entry found for this file in "
                      f"{round_name}-generation-calls.json — cannot determine its slug(s), "
                      "not guessed",
        })

    results = []
    for basename, info in sorted(by_basename.items()):
        cells = info["cells"]
        rel_for_report = f"{round_name}-returns/raw-figures/{basename}"

        if not basename.startswith(FIGURE_SLUG_PREFIX):
            skipped.append({
                "round": round_name,
                "file": basename,
                "reason": "non-figure asset (does not start with 'spr-') misrouted into a "
                          "figure round's raw-figures/ — categorically out of scope for S2, "
                          "same as the excluded fx3/p1props/etc rounds",
                "cells": cells,
            })
            continue

        fcf_key = final_crop_fails_match(final_crop_fails, round_name, basename)
        if fcf_key:
            skipped.append({
                "round": round_name,
                "file": basename,
                "reason": f"listed in final-crop-fails.json (key: {fcf_key})",
                "cells": cells,
            })
            continue

        verdict = qa_ledger_verdict_for(qa_ledger, round_name, basename)
        if verdict in QA_LEDGER_REJECT_VERDICTS:
            skipped.append({
                "round": round_name,
                "file": basename,
                "reason": f"qa-ledger.json verdict '{verdict}' is a reject class",
                "cells": cells,
            })
            continue

        path = os.path.join(raw_dir, basename)
        img = Image.open(path).convert("RGB")
        w, h = img.size

        key_name, key_rgb = detect_key_color(img)
        if key_name is None:
            skipped.append({
                "round": round_name,
                "file": basename,
                "reason": f"border color is not conclusively magenta or green (dominant "
                          f"sampled border pixel {key_rgb}) — refusing to guess a key color",
                "cells": cells,
            })
            continue

        raw_components = extract_components(img, key_rgb, tolerance)
        merged = merge_fragments(raw_components, w, h)

        if len(merged) != len(cells):
            skipped.append({
                "round": round_name,
                "file": basename,
                "reason": f"component count ({len(merged)} after fragment-merge, "
                          f"{len(raw_components)} raw) does not match cells[] count "
                          f"({len(cells)}) — FAIL LOUD, not guessed",
                "cells": cells,
                "mergedComponentCount": len(merged),
                "rawComponentCount": len(raw_components),
            })
            continue

        # Sort left-to-right by centroid X (these are single-row cell packs, left-to-right —
        # not row-major sheets) and match 1:1, in order, to cells[].
        items = sorted(merged, key=lambda c: c["cx"])

        for cell_index, (item, slug) in enumerate(zip(items, cells)):
            crop = crop_component(img, item["bbox"], key_rgb, tolerance, padding)
            results.append({
                "slug": slug,
                "round": round_name,
                "file": basename,
                "relFile": rel_for_report,
                "cellIndex": cell_index,
                "cellsProvenance": cells,
                "candidateNum": candidate_number(basename),
                "cropImage": crop,
                "keyColorName": key_name,
                "rawComponentCount": len(raw_components),
                "mergedComponentCount": len(merged),
                "qaLedgerVerdict": verdict,
            })

    return results


def select_winners(all_candidates, skipped):
    """When the same slug has multiple valid candidates (different candidate-NNN files, or a
    slug appearing on more than one round's file), prefer a qa-ledger-marked preference if one
    exists, else the highest candidate number. Losing candidates are recorded, not silently
    dropped."""
    by_slug = {}
    for c in all_candidates:
        by_slug.setdefault(c["slug"], []).append(c)

    winners = {}
    for slug, cands in by_slug.items():
        if len(cands) == 1:
            winners[slug] = cands[0]
            continue

        # Preference tier 1: an explicit qa-ledger "preferred"-style verdict. This corpus's
        # ledger only carries ADMIT-CANDIDATE/REVIEW/REDO (REDO already excluded upstream) —
        # ADMIT-CANDIDATE is the closest analog to "marked preferred" and wins over REVIEW/None
        # when they compete for the same slug.
        def ledger_rank(c):
            v = c.get("qaLedgerVerdict")
            return {"ADMIT-CANDIDATE": 0, "REVIEW": 1}.get(v, 2)

        best_rank = min(ledger_rank(c) for c in cands)
        tier1 = [c for c in cands if ledger_rank(c) == best_rank]

        # Preference tier 2: highest embedded candidate number.
        tier1.sort(key=lambda c: c["candidateNum"], reverse=True)
        winner = tier1[0]
        winners[slug] = winner

        for c in cands:
            if c is winner:
                continue
            skipped.append({
                "round": c["round"],
                "file": c["file"],
                "slug": slug,
                "reason": f"slug '{slug}' has multiple valid candidates; "
                          f"{winner['round']}/{winner['file']} (candidate "
                          f"{winner['candidateNum']}) was preferred "
                          f"({'qa-ledger rank' if ledger_rank(winner) < 2 else 'highest candidate number'})"
                          f" over this one (candidate {c['candidateNum']})",
            })

    return winners


def out_of_scope_round_notes(sheets_root, rounds):
    """Report *-returns dirs on disk that this run did not process — the S2 spec names an
    exact round list, so anything outside it is surfaced as a deviation note rather than
    silently folded in or silently ignored."""
    processed_dirs = {f"{r}-returns" for r in rounds}
    try:
        # "-returns" anywhere in the name, not just the suffix — the corpus carries variant
        # dirs like r3c-returns-r2 / r7r8-returns-v2 / r9-returns-v2 / p1props-returns-b.
        found = sorted(
            d for d in os.listdir(sheets_root)
            if "-returns" in d and os.path.isdir(os.path.join(sheets_root, d))
            and d not in processed_dirs
        )
    except FileNotFoundError:
        return []
    notes = []
    figure_like = [d for d in found if d not in NON_FIGURE_ROUND_DIRS]
    non_figure = [d for d in found if d in NON_FIGURE_ROUND_DIRS]
    if figure_like:
        notes.append(
            "Round dirs on disk but NOT in the S2 round list and therefore NOT processed "
            f"(deliberate — flagged for a follow-up ruling, not silently folded in): {figure_like}"
        )
    if non_figure:
        notes.append(
            f"Non-figure round dirs present and out of S2 scope by spec (not processed): {non_figure}"
        )
    return notes


def main():
    global HAVE_NUMPY
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--sheets-root", default=DEFAULT_SHEETS_ROOT,
                    help="dev/model-qa/faceted-sheets/ (override for tests)")
    ap.add_argument("--out", default=DEFAULT_OUT, help="output dir (default assets/sprites-faceted/)")
    ap.add_argument("--report", default=DEFAULT_REPORT, help="report JSON path")
    ap.add_argument("--rounds", default=None,
                    help="comma-separated round names to process (default: the 9 FIGURE_ROUNDS "
                         "named in VQ2-RESPEC.md S2)")
    ap.add_argument("--tolerance", type=int, default=KEY_TOLERANCE, help="chroma key-out tolerance")
    ap.add_argument("--padding", type=int, default=DEFAULT_PADDING, help="crop padding in px")
    ap.add_argument("--pure", action="store_true",
                    help="force the pure-PIL/stdlib code paths even when numpy is importable "
                         "(equivalence testing)")
    ap.add_argument("--dry-run", action="store_true",
                    help="compute + report but do not write PNGs (report is still written)")
    args = ap.parse_args()

    if args.pure:
        HAVE_NUMPY = False

    rounds = args.rounds.split(",") if args.rounds else FIGURE_ROUNDS

    qa_ledger, ledger_verdicts = load_qa_ledger(args.sheets_root)
    final_crop_fails = load_final_crop_fails(args.sheets_root)

    print(f"numpy fast path: {'ON' if HAVE_NUMPY else 'OFF (pure PIL/stdlib)'}")
    print(f"qa-ledger.json: {len(qa_ledger)} entries, verdicts observed: {ledger_verdicts}")
    print(f"final-crop-fails.json: {len(final_crop_fails)} listed paths")
    print(f"Processing rounds: {rounds}")

    skipped = []
    notes = out_of_scope_round_notes(args.sheets_root, rounds)
    all_candidates = []
    for r in rounds:
        results = process_round(r, args.sheets_root, qa_ledger, final_crop_fails,
                                 args.tolerance, args.padding, skipped, notes)
        all_candidates.extend(results)
        print(f"  {r}: {len(results)} cut identities from this round's valid candidates")

    winners = select_winners(all_candidates, skipped)

    os.makedirs(args.out, exist_ok=True)
    report_slugs = {}
    multi_cell_splits = 0
    residual_key_failures = []

    for slug, c in sorted(winners.items()):
        crop = c["cropImage"]
        out_path = os.path.join(args.out, f"{slug}.png")
        if not args.dry_run:
            crop.save(out_path)

        ab = alpha_bbox(crop)
        w, h = crop.size
        content_bounds = None
        if ab:
            content_bounds = [ab[0] / w, ab[1] / h, (ab[2] + 1) / w, (ab[3] + 1) / h]

        key_rgb = MAGENTA if c["keyColorName"] == "magenta" else GREEN
        residue = residual_key_pixels(crop, key_rgb, args.tolerance)
        if residue:
            residual_key_failures.append({"slug": slug, "residualPixels": residue})

        if len(c["cellsProvenance"]) > 1:
            multi_cell_splits += 1

        report_slugs[slug] = {
            "sourceFile": c["relFile"],
            "round": c["round"],
            "cellIndex": c["cellIndex"],
            "cellsProvenance": c["cellsProvenance"],
            "candidateNum": c["candidateNum"],
            "contentBounds": content_bounds,
            "pxWidth": w,
            "pxHeight": h,
            "footContact": foot_contact_x(crop),
            "keyColor": c["keyColorName"],
            "qaLedgerVerdict": c["qaLedgerVerdict"],
            "residualKeyPixels": residue,
        }

    report = {
        "generatedBy": "build/cut-faceted.py",
        "sheetsRoot": os.path.relpath(args.sheets_root, ROOT),
        "outDir": os.path.relpath(args.out, ROOT),
        "roundsProcessed": rounds,
        "qaLedger": {
            "entryCount": len(qa_ledger),
            "verdictsObserved": ledger_verdicts,
            "rejectClass": sorted(QA_LEDGER_REJECT_VERDICTS),
            "note": "qa-ledger.json keys use a pre-reorg packet-directory convention "
                    "(e.g. 'F10/spr-fantasy-...png') disjoint from this corpus's round-based "
                    "raw-figures/ paths — exact-path lookups only (a basename crosswalk would "
                    "risk excluding a legitimate redo that shares a filename with an old, "
                    "unrelated packet entry). See exactMatchesThisRun for what this run found.",
            "exactMatchesThisRun": sum(1 for s in skipped if "qa-ledger.json verdict" in s.get("reason", "")),
        },
        "finalCropFails": {
            "listedCount": len(final_crop_fails),
            "matchedThisRun": sum(1 for s in skipped if "final-crop-fails.json" in s.get("reason", "")),
        },
        "cropRejectsDir": {
            "note": "dev/model-qa/faceted-sheets/crop-rejects/ is never globbed by this script "
                    "(only <round>-returns/raw-figures/ is) so files physically inside it are "
                    "inherently excluded, not cross-referenced by basename.",
        },
        "totals": {
            "candidatesValid": len(all_candidates),
            "outputSlugs": len(report_slugs),
            "multiCellSplits": multi_cell_splits,
            "skipped": len(skipped),
        },
        "slugs": report_slugs,
        "skipped": skipped,
        "notes": notes,
    }

    os.makedirs(os.path.dirname(args.report), exist_ok=True)
    with open(args.report, "w") as f:
        json.dump(report, f, indent=2, sort_keys=False)

    print(f"\nOK: {len(report_slugs)} slugs cut ({multi_cell_splits} from multi-cell candidates), "
          f"{len(skipped)} skipped. Report: {args.report}")
    if residual_key_failures:
        print(f"FAIL: {len(residual_key_failures)} outputs have residual key-color pixels: "
              f"{residual_key_failures}", file=sys.stderr)
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
