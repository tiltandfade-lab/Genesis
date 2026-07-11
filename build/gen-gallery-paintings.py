#!/usr/bin/env python3
"""BEAUTY-WAVE VP2b (docs/BEAUTY-WAVE.md §VP2b) — frame gallery-candidate keepers into
wall-hang painting cards.

Reads dev/model-qa/gallery-candidates.json (produced + eyeball-culled via
build/detect-gallery-candidates.py), takes every candidate with verdict == "keep" whose realm
is a WIRED realm (chrome/gloom/fantasy — the only realms with an INTERIOR_TILE_KITS entry;
framing for an unwired realm would be dead REALM_DRESSING data), and composites each into a
realm-styled painting card:

  - fantasy -> gilt/wood frame (INTERIOR_TILE_KITS.fantasy trimColor #c9a85c gold on a dark
    wood-brown mat)
  - gloom   -> cracked-black frame, canted +/-2deg (INTERIOR_TILE_KITS.gloom trimColor #6b5878)
  - chrome  -> bezel holo-display frame (INTERIOR_TILE_KITS.chrome trimColor #d8f0f8)

deterministic per (realm, slug) — same inputs always produce the same frame (canted-angle seed
included), no per-run randomness.

Output: assets/dressing/<realm>-painting-<n>.png (n = 1-based index within that realm's
keepers, stable sort by slug). Also writes/refreshes
dev/model-qa/dressing-gen/manifests/<realm>-painting-dg.json — a manifest in the SAME shape
gen-realm-dressing.py already reads (cells: [{slug, tags:{primary}, size}]) PLUS a paintingOf
provenance field per cell, so build/gen-realm-dressing.py picks these up on its next --emit
without any hand-editing of the generated place-dressing.js block.

Run: python3 build/gen-gallery-paintings.py --emit
"""
import argparse
import json
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CANDIDATES = os.path.join(ROOT, "dev", "model-qa", "gallery-candidates.json")
DRESSING_DIR = os.path.join(ROOT, "assets", "dressing")
MANIFEST_DIR = os.path.join(ROOT, "dev", "model-qa", "dressing-gen", "manifests")

# trim colors pulled verbatim from src/ui/theater-interior.js INTERIOR_TILE_KITS (the same
# per-realm palette anchor REALM_MATERIALS itself defers to) — only the 3 WIRED realms get
# framed, per the gen-realm-dressing.py "no dead data for an unwired realm" rule.
WIRED_REALM_FRAME = {
    "fantasy": {"style": "gilt-wood", "trim": (201, 168, 92), "mat": (58, 42, 28), "canted": 0},
    "gloom": {"style": "cracked-black", "trim": (107, 88, 120), "mat": (18, 14, 22), "canted": -3},
    "chrome": {"style": "bezel-holo", "trim": (216, 240, 248), "mat": (20, 28, 32), "canted": 0},
}

CANVAS = 256
FRAME_W = 22
MAT_W = 12


def seeded_canted_angle(realm, slug):
    """Deterministic small tilt for gloom's 'canted' option — same slug always same angle."""
    if WIRED_REALM_FRAME[realm]["canted"] == 0:
        return 0
    h = sum(ord(c) for c in slug)
    # +/- up to 3 degrees, deterministic sign+magnitude from the slug hash
    return (h % 7) - 3


def draw_frame(realm, subject_img, slug):
    style = WIRED_REALM_FRAME[realm]
    trim = style["trim"]
    mat = style["mat"]

    card = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)

    # outer frame rect
    draw.rectangle([0, 0, CANVAS - 1, CANVAS - 1], fill=trim + (255,))
    # bevel highlight/shadow for a carved-frame read
    hi = tuple(min(255, c + 35) for c in trim)
    lo = tuple(max(0, c - 45) for c in trim)
    draw.rectangle([0, 0, CANVAS - 1, 3], fill=hi + (255,))
    draw.rectangle([0, 0, 3, CANVAS - 1], fill=hi + (255,))
    draw.rectangle([CANVAS - 4, 0, CANVAS - 1, CANVAS - 1], fill=lo + (255,))
    draw.rectangle([0, CANVAS - 4, CANVAS - 1, CANVAS - 1], fill=lo + (255,))

    if style["style"] == "cracked-black":
        # crackle texture: deterministic hairline cracks across the frame band
        h = sum(ord(c) for c in slug)
        for i in range(6):
            x0 = (h * (i + 3)) % CANVAS
            y0 = (h * (i + 7)) % FRAME_W
            x1 = (x0 + (h % 17) - 8) % CANVAS
            draw.line([(x0, y0), (x1, FRAME_W)], fill=(0, 0, 0, 200), width=1)

    if style["style"] == "bezel-holo":
        # thin inner holo scanline ring
        draw.rectangle(
            [FRAME_W - 4, FRAME_W - 4, CANVAS - FRAME_W + 3, CANVAS - FRAME_W + 3],
            outline=(120, 230, 255, 220), width=2,
        )

    # mat inset
    inner = FRAME_W
    draw.rectangle([inner, inner, CANVAS - inner - 1, CANVAS - inner - 1], fill=mat + (255,))

    subj_box = (
        inner + MAT_W, inner + MAT_W,
        CANVAS - inner - MAT_W, CANVAS - inner - MAT_W,
    )
    subj_w = subj_box[2] - subj_box[0]
    subj_h = subj_box[3] - subj_box[1]

    subject = subject_img.convert("RGBA")
    subject.thumbnail((subj_w, subj_h), Image.LANCZOS)
    # canvas-texture inset behind the subject (soft mottled noise, deterministic per slug)
    canvas_tex = Image.new("RGBA", (subj_w, subj_h), mat + (255,))
    tex_draw = ImageDraw.Draw(canvas_tex)
    h = sum(ord(c) for c in slug) or 1
    for i in range(40):
        x = (h * (i * 13 + 1)) % subj_w
        y = (h * (i * 7 + 3)) % subj_h
        shade = mat[0] + ((h * i) % 15) - 7
        tex_draw.point((x, y), fill=(shade, shade, shade, 60))
    canvas_tex = canvas_tex.filter(ImageFilter.GaussianBlur(1))

    paste_x = subj_box[0] + (subj_w - subject.width) // 2
    paste_y = subj_box[1] + (subj_h - subject.height) // 2
    card.paste(canvas_tex, (subj_box[0], subj_box[1]), canvas_tex)
    card.paste(subject, (paste_x, paste_y), subject)

    angle = seeded_canted_angle(realm, slug)
    if angle:
        card = card.rotate(angle, resample=Image.BICUBIC, expand=False, fillcolor=(0, 0, 0, 0))

    return card


def load_candidates():
    with open(CANDIDATES) as f:
        return json.load(f)["candidates"]


def build():
    candidates = load_candidates()
    keepers = [c for c in candidates if c.get("verdict") == "keep" and c["realm"] in WIRED_REALM_FRAME]
    keepers.sort(key=lambda c: (c["realm"], c["slug"]))

    by_realm = {}
    for c in keepers:
        by_realm.setdefault(c["realm"], []).append(c)

    manifests_written = []
    cards_written = []
    for realm, items in by_realm.items():
        cells = []
        for idx, cand in enumerate(items, start=1):
            out_slug = f"{realm}-painting-{idx}"
            out_path = os.path.join(DRESSING_DIR, out_slug + ".png")
            subject_path = os.path.join(ROOT, cand["path"])
            with Image.open(subject_path) as subj:
                card = draw_frame(realm, subj, cand["slug"])
            card.save(out_path)
            cards_written.append(out_path)
            cells.append({
                "slug": out_slug,
                "tags": {"primary": "wall-hang"},
                "size": "medium",
                "paintingOf": cand["slug"],
            })
        manifest_path = os.path.join(MANIFEST_DIR, f"{realm}-painting-dg.json")
        with open(manifest_path, "w") as f:
            json.dump({
                "_comment": (
                    "BEAUTY-WAVE VP2b (GALLERY PASS) manifest — generated by "
                    "build/gen-gallery-paintings.py from dev/model-qa/gallery-candidates.json "
                    "keepers. Same {slug,tags.primary,size} shape build/gen-realm-dressing.py "
                    "already reads, plus paintingOf provenance. Never hand-edit; rerun the "
                    "gallery-paintings + realm-dressing scripts."
                ),
                "cells": cells,
            }, f, indent=2)
            f.write("\n")
        manifests_written.append(manifest_path)

    return cards_written, manifests_written, by_realm


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--emit", action="store_true", help="write painting PNGs + manifests")
    args = ap.parse_args()

    candidates = load_candidates()
    keepers = [c for c in candidates if c.get("verdict") == "keep" and c["realm"] in WIRED_REALM_FRAME]
    print(f"{len(keepers)} keeper(s) in wired realms: {[c['slug'] for c in keepers]}")

    if not args.emit:
        print("(dry run — pass --emit to write)")
        return

    cards, manifests, by_realm = build()
    print(f"Wrote {len(cards)} painting card(s): {cards}")
    print(f"Wrote {len(manifests)} manifest(s): {manifests}")


if __name__ == "__main__":
    main()
