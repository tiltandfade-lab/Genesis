#!/usr/bin/env python3
"""build/fold-textures.py — BEAUTY-WAVE-2 BW2-3 MATERIAL TEXEL fold gate.

Folds the PACKET-02 texture arrivals (ui-sketches/textures/<realm>-<surface>-<n>.png, generated
per dev/model-qa/mock-gen/PACKET-02-TEXTURES.md) into engine-texel assets under assets/textures/,
running the fold gate the spec names:

  * TILEABILITY — wrap-shift edge diff on both axes -> a grade (perfect / near / poor). The grade
    picks the wrap mode the JS registry consumes: perfect -> RepeatWrapping, near/poor ->
    MirroredRepeatWrapping (ping-pong hides the residual seam, per BW2-3 §2b WALLS law).
  * PALETTE BOUND (loose) — fraction of pixels within a loose RGB distance of the realm's master
    palette (dev/model-qa/realm-palettes/<realm>.json). Informational, never a hard reject.
  * CONTRAST CAP (subtle-texture law, §3) — luminance 2..98 percentile spread; flagged (not
    rejected) when it exceeds the cap. An honest red beats a mechanically-greened lie
    (CLAUDE.md validator discipline) — the taste loop grades VALUES down where a surface fights
    sprites, this just reports the number.
  * INTEGER-RATIO RESAMPLE — every tile/trim fold downsizes 512 -> engine texel by an INTEGER
    ratio (box filter), asserted; a non-integer ratio aborts the fold for that arrival.

crate-faces sheets are NOT tileable across faces (§2b FURNITURE law) — they are sliced into their
six self-contained face tiles (3x2 grid, each auto-trimmed to its non-dark bounding box) and folded
per-face for BW2-5's textureFaceFor seam.

Deterministic, no network. Writes assets/textures/*.png + build/fold-textures-report.json.

Usage:
  python3 build/fold-textures.py            # fold + write report
  python3 build/fold-textures.py --check    # gate only, no writes (report to stdout)
"""
import json
import os
import sys
from PIL import Image
import numpy as np

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, "ui-sketches", "textures")
DST = os.path.join(REPO, "assets", "textures")
PALDIR = os.path.join(REPO, "dev", "model-qa", "realm-palettes")
REPORT = os.path.join(REPO, "build", "fold-textures-report.json")

FLAGSHIPS = ["fantasy", "gloom", "chrome"]
TILE_SURFACES = ["wall", "floor", "floor-alt"]     # square tileable surfaces -> 256
TRIM_SURFACE = "trim"                               # 512x128 strip -> 256x64
CRATE_SURFACE = "crate-faces"                       # 512x512 sheet -> 6 sliced faces
SHARED = {
    "shared-dais-steps-stone-1.png": 256,
    "shared-rug-carpet-1.png": 256,
    "shared-wet-stain-decal-set-1.png": 256,
}

# engine texel targets (all INTEGER ratios of the 512/128 source)
TILE_TEXEL = 256      # 512 / 2
TRIM_TEXEL_W = 256    # 512 / 2
TRIM_TEXEL_H = 64     # 128 / 2
FACE_TEXEL = 128      # sliced face resample target

# the six furniture faces the crate-faces sheet carries (row-major, 3 cols x 2 rows), per
# PACKET-02 §5: crate side, crate top, cabinet door, panel-vents, panel-glow, plain reinforced side.
CRATE_FACE_NAMES = ["crate-side", "crate-top", "cabinet-door", "panel-vents", "panel-glow", "panel-plain"]

CONTRAST_CAP = 0.62        # luminance 2..98 pct spread (0..1); over this is flagged as "busy"
PALETTE_LOOSE_DIST = 95.0  # RGB euclidean; loose bound for "in palette"


def load_rgb(path):
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)


def tileability(arr):
    """Wrap-shift edge diff -> {ratioX, ratioY, gradeX, gradeY, grade, wrap}. ratio ~1 == seamless
    (the wrap seam is as smooth as the interior); high ratio == a visible seam."""
    h, w, _ = arr.shape
    eps = 1e-3
    edge_h = np.mean(np.abs(arr[:, 0, :] - arr[:, w - 1, :]))
    interior_h = np.mean(np.abs(arr[:, 1:, :] - arr[:, :-1, :]))
    ratio_x = float(edge_h / (interior_h + eps))
    edge_v = np.mean(np.abs(arr[0, :, :] - arr[h - 1, :, :]))
    interior_v = np.mean(np.abs(arr[1:, :, :] - arr[:-1, :, :]))
    ratio_y = float(edge_v / (interior_v + eps))

    def grade(r):
        if r <= 1.8:
            return "perfect"
        if r <= 3.5:
            return "near"
        return "poor"
    gx, gy = grade(ratio_x), grade(ratio_y)
    rank = {"perfect": 0, "near": 1, "poor": 2}
    overall = max([gx, gy], key=lambda g: rank[g])
    wrap = "RepeatWrapping" if overall == "perfect" else "MirroredRepeatWrapping"
    return {
        "ratioX": round(ratio_x, 3), "ratioY": round(ratio_y, 3),
        "gradeX": gx, "gradeY": gy, "grade": overall, "wrap": wrap,
        "edgeDiffH": round(float(edge_h), 2), "edgeDiffV": round(float(edge_v), 2),
    }


def contrast(arr):
    lum = (0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]) / 255.0
    lo, hi = np.percentile(lum, 2), np.percentile(lum, 98)
    spread = float(hi - lo)
    return {"spread": round(spread, 3), "std": round(float(np.std(lum)), 3),
            "overCap": spread > CONTRAST_CAP}


def palette_bound(arr, realm):
    path = os.path.join(PALDIR, realm + ".json")
    if not os.path.exists(path):
        return {"realm": realm, "available": False}
    cols = json.load(open(path)).get("colors", [])
    pal = np.array([[int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16)] for c in cols], dtype=np.float32)
    h, w, _ = arr.shape
    ys = np.linspace(0, h - 1, 64).astype(int)
    xs = np.linspace(0, w - 1, 64).astype(int)
    samp = arr[np.ix_(ys, xs)].reshape(-1, 3)
    d = np.sqrt(((samp[:, None, :] - pal[None, :, :]) ** 2).sum(-1)).min(1)
    frac = float((d < PALETTE_LOOSE_DIST).mean())
    return {"realm": realm, "available": True, "inPaletteFrac": round(frac, 3),
            "meanNearestDist": round(float(d.mean()), 1)}


def integer_resample(im, target_w, target_h):
    """Box-filter downscale by an INTEGER ratio. Asserts the ratio is integer on both axes."""
    w, h = im.size
    assert w % target_w == 0, f"non-integer width ratio {w}->{target_w}"
    assert h % target_h == 0, f"non-integer height ratio {h}->{target_h}"
    return im.resize((target_w, target_h), Image.BOX)


def slice_crate_faces(im):
    """3 cols x 2 rows -> 6 face tiles, each auto-trimmed to its non-dark bbox then square-fit."""
    w, h = im.size
    cw, ch = w // 3, h // 2
    faces = []
    arr = np.asarray(im.convert("RGB"))
    for r in range(2):
        for c in range(3):
            cell = arr[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]
            lum = 0.299 * cell[:, :, 0] + 0.587 * cell[:, :, 1] + 0.114 * cell[:, :, 2]
            mask = lum > 22
            ys, xs = np.where(mask)
            if len(xs) == 0:
                crop = cell
            else:
                y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
                side = max(y1 - y0, x1 - x0)
                cy, cx = (y0 + y1) // 2, (x0 + x1) // 2
                y0 = max(0, cy - side // 2); x0 = max(0, cx - side // 2)
                y1 = min(cell.shape[0], y0 + side); x1 = min(cell.shape[1], x0 + side)
                crop = cell[y0:y1, x0:x1]
            tile = Image.fromarray(crop).resize((FACE_TEXEL, FACE_TEXEL), Image.LANCZOS)
            faces.append(tile)
    return faces


def main():
    check_only = "--check" in sys.argv
    if not check_only:
        os.makedirs(DST, exist_ok=True)
    report = {"generatedBy": "build/fold-textures.py", "textures": {}, "faces": {}, "flags": []}

    for realm in FLAGSHIPS:
        for surface in TILE_SURFACES:
            name = f"{realm}-{surface}-1.png"
            src = os.path.join(SRC, name)
            if not os.path.exists(src):
                report["flags"].append(f"MISSING {name}")
                continue
            im = Image.open(src).convert("RGB")
            arr = load_rgb(src)
            til, con, pal = tileability(arr), contrast(arr), palette_bound(arr, realm)
            report["textures"][name] = {"src": name, "tileability": til, "contrast": con,
                                        "palette": pal, "texel": [TILE_TEXEL, TILE_TEXEL]}
            if con["overCap"]:
                report["flags"].append(f"CONTRAST {name} spread={con['spread']} > {CONTRAST_CAP}")
            if not check_only:
                integer_resample(im, TILE_TEXEL, TILE_TEXEL).save(os.path.join(DST, name))

        tname = f"{realm}-{TRIM_SURFACE}-1.png"
        tsrc = os.path.join(SRC, tname)
        if os.path.exists(tsrc):
            im = Image.open(tsrc).convert("RGB")
            arr = load_rgb(tsrc)
            report["textures"][tname] = {"src": tname, "tileability": tileability(arr),
                                         "contrast": contrast(arr), "palette": palette_bound(arr, realm),
                                         "texel": [TRIM_TEXEL_W, TRIM_TEXEL_H]}
            if not check_only:
                integer_resample(im, TRIM_TEXEL_W, TRIM_TEXEL_H).save(os.path.join(DST, tname))

        csrc = os.path.join(SRC, f"{realm}-{CRATE_SURFACE}-1.png")
        if os.path.exists(csrc):
            im = Image.open(csrc).convert("RGB")
            faces = slice_crate_faces(im)
            names = []
            for fn, tile in zip(CRATE_FACE_NAMES, faces):
                out = f"{realm}-face-{fn}-1.png"
                names.append(out)
                if not check_only:
                    tile.save(os.path.join(DST, out))
            report["faces"][realm] = names

    for fname, texel in SHARED.items():
        src = os.path.join(SRC, fname)
        if not os.path.exists(src):
            report["flags"].append(f"MISSING {fname}")
            continue
        im = Image.open(src).convert("RGB")
        arr = load_rgb(src)
        report["textures"][fname] = {"src": fname, "tileability": tileability(arr),
                                     "contrast": contrast(arr), "palette": {"available": False},
                                     "texel": [texel, texel]}
        if not check_only:
            integer_resample(im, texel, texel).save(os.path.join(DST, fname))

    if not check_only:
        json.dump(report, open(REPORT, "w"), indent=2)
    print(json.dumps(report, indent=2))
    print(f"\n{len(report['textures'])} textures, {sum(len(v) for v in report['faces'].values())} faces, "
          f"{len(report['flags'])} flags", file=sys.stderr)


if __name__ == "__main__":
    main()
