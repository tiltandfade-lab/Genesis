#!/usr/bin/env python3
"""BEAUTY-WAVE VP2b (docs/BEAUTY-WAVE.md §VP2b) — detect bottom-clipped sprites.

Mechanical detector: a sprite whose alpha channel touches the BOTTOM image edge across
>= BOTTOM_CLIP_THRESHOLD of the image width is a "bottom-clipped candidate" — its art was cut
off mid-figure, so it's a defective standee but often a well-composed framed portrait (the
GALLERY PASS reclaims it as wall-hang painting art instead of throwing it away).

Sweeps:
  - assets/sprites/*.png                         (the sliced single-sprite corpus)
  - dev/model-qa/quarantine-pack/**/*.png         (quarantined/rejected sprites)
  - ui-sketches/sprite-sheets/*-take2*.png,
    ui-sketches/sprite-sheets/*-take3*.png        (paid-for reject takes)
  - dev/model-qa/sprite-tags-overlay.json entries whose `tags` mention clipping words
    (redlined review notes) — unioned in by slug if the source png still resolves.

Emits dev/model-qa/gallery-candidates.json for a one-pass human eyeball cull. Never applies a
verdict itself — `verdict` starts null; the cull step (Read a contact sheet, judge, edit this
file) fills it in as "keep" or "reject".

Run: python3 build/detect-gallery-candidates.py --emit
"""
import argparse
import glob
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "dev", "model-qa", "gallery-candidates.json")

BOTTOM_CLIP_THRESHOLD = 0.30  # >= 30% of width must have alpha at the very bottom row
ALPHA_MIN = 8  # near-zero alpha rounding noise floor

CLIP_NOTE_WORDS = ("clip", "clipped", "clipping", "cut off", "cut-off")

REALM_PREFIXES = [
    "fantasy", "gloom", "chrome", "cosmic", "ash", "bright-kingdom", "frontier",
    "high-seas", "lost-world", "noir", "suburb", "theater",
]


def guess_realm(stem):
    low = stem.lower()
    for r in REALM_PREFIXES:
        if low.startswith(r + "-") or low.startswith("spr-" + r + "-") or ("-" + r + "-") in low:
            return r
    return "unknown"


def bottom_clip_fraction(img):
    """Fraction of the bottom row's width that has non-negligible alpha.

    Returns None for images with no real alpha channel (opaque RGB/JPEG-style reference
    sheets) — those aren't cutout sprites, so "touches the bottom edge" is meaningless (every
    opaque rectangle would trivially read as 100% clipped). Only true cutouts (a real alpha
    channel with SOME transparency somewhere in the image) are eligible.
    """
    has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
    if not has_alpha:
        return None
    rgba = img.convert("RGBA")
    w, h = rgba.size
    if w == 0 or h == 0:
        return None
    alpha = rgba.getchannel("A")
    lo, hi = alpha.getextrema()
    if lo > ALPHA_MIN:
        # no real transparency anywhere — an opaque reference sheet, not a cutout
        return None
    row = alpha.crop((0, h - 1, w, h))
    px = row.load()
    hit = sum(1 for x in range(w) if px[x, 0] > ALPHA_MIN)
    return hit / w


def scan_file(path, source):
    try:
        with Image.open(path) as img:
            frac = bottom_clip_fraction(img)
            w, h = img.size
    except Exception as e:
        print(f"WARNING: could not read {path}: {e}", file=sys.stderr)
        return None
    if frac is None or frac < BOTTOM_CLIP_THRESHOLD:
        return None
    stem = os.path.splitext(os.path.basename(path))[0]
    return {
        "path": os.path.relpath(path, ROOT),
        "slug": stem,
        "realm": guess_realm(stem),
        "source": source,
        "width": w,
        "height": h,
        "bottomClipFraction": round(frac, 3),
        "verdict": None,  # filled by the human eyeball cull: "keep" | "reject"
        "cullNote": "",
    }


def sweep():
    candidates = []
    seen_paths = set()

    def add(path, source):
        if path in seen_paths:
            return
        seen_paths.add(path)
        cand = scan_file(path, source)
        if cand:
            candidates.append(cand)

    for p in sorted(glob.glob(os.path.join(ROOT, "assets", "sprites", "*.png"))):
        add(p, "corpus")
    for p in sorted(glob.glob(os.path.join(ROOT, "dev", "model-qa", "quarantine-pack", "**", "*.png"), recursive=True)):
        add(p, "quarantine")
    for pattern in ("*-take2*.png", "*-take3*.png"):
        for p in sorted(glob.glob(os.path.join(ROOT, "ui-sketches", "sprite-sheets", pattern))):
            add(p, "reject-take")

    # union: review-overlay redlined notes that mention clipping, if the slug resolves to a
    # real corpus png not already swept (rare — overlay currently carries no clip notes yet,
    # but the union must exist per spec so a future redline is picked up automatically).
    overlay_path = os.path.join(ROOT, "dev", "model-qa", "sprite-tags-overlay.json")
    if os.path.exists(overlay_path):
        with open(overlay_path) as f:
            overlay = json.load(f)
        for slug, entry in overlay.items():
            if slug.startswith("_") or not isinstance(entry, dict):
                continue
            tags = entry.get("tags") or []
            note = " ".join(tags).lower() if isinstance(tags, list) else str(tags).lower()
            if not any(w in note for w in CLIP_NOTE_WORDS):
                continue
            candidate_path = os.path.join(ROOT, "assets", "sprites", slug + ".png")
            if os.path.exists(candidate_path):
                add(candidate_path, "review-flag")

    return candidates


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--emit", action="store_true", help="write dev/model-qa/gallery-candidates.json")
    args = ap.parse_args()

    candidates = sweep()
    by_realm = {}
    for c in candidates:
        by_realm[c["realm"]] = by_realm.get(c["realm"], 0) + 1
    print(f"Found {len(candidates)} bottom-clipped candidates. By realm: {by_realm}")

    if not args.emit:
        print("(dry run — pass --emit to write gallery-candidates.json)")
        return

    payload = {
        "_comment": (
            "BEAUTY-WAVE VP2b gallery-candidates — bottom-clipped sprite/reject-take detector "
            "output. `verdict` is null until the human eyeball cull sets it to keep|reject; "
            "cullNote records why. Regenerate detection with "
            "python3 build/detect-gallery-candidates.py --emit (this OVERWRITES verdicts — cull "
            "AFTER the final regen, or preserve verdicts across reruns by hand before landing)."
        ),
        "threshold": BOTTOM_CLIP_THRESHOLD,
        "candidates": candidates,
    }
    with open(OUT, "w") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")
    print(f"OK: wrote {OUT}")


if __name__ == "__main__":
    main()
