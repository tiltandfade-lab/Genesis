#!/usr/bin/env python3
"""Before/after contact sheets for the VP1.5 unification pass (r2), per flagship realm.

Reads originals from quarantine-pack/pre-unification/originals-r2.zip (pre-pass) and the
current assets/sprites/*.png (post-pass), pairs by slug, and writes a grid contact sheet
to dev/model-qa/unification-cards/<realm>-before-after.png. Also emits dedicated close-up
crops for the two named regression fixtures (snake, ghost) so they're unmissable on read.

NOTE (logged, not faked): only `fantasy` has any status:"cut" sprites in the corpus today
(pc borrows fantasy's palette) — `gloom` and `chrome` (the other two flagships) have ZERO
cut sprites, so no before/after card can be produced for them yet. This script emits a
MISSING-FLAGSHIPS.txt note instead of synthesizing a card, per "never fake it."
"""
import io
import os
import random
import zipfile

from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIP_PATH = os.path.join(REPO, "quarantine-pack/pre-unification/originals-r2.zip")
SPRITES_DIR = os.path.join(REPO, "assets/sprites")
OUT_DIR = os.path.join(REPO, "dev/model-qa/unification-cards")
FLAGSHIPS = ["fantasy", "gloom", "chrome"]
SAMPLE_N = 12
CELL = 160

NAMED_FIXTURES = ["spr-fantasy-constrictor-snake", "spr-fantasy-ghost"]
FIXTURE_CELL = 320


def make_card(realm, names, zf):
    random.Random(11).shuffle(names)
    sample = names[:SAMPLE_N]
    cols = 6
    rows = (len(sample) * 2 + cols - 1) // cols  # before+after pairs, 2 rows per pair set
    rows = max(rows, 2)
    sheet = Image.new("RGBA", (cols * CELL, rows * CELL), (30, 30, 30, 255))
    for i, name in enumerate(sample):
        col = i % cols
        row_pair = (i // cols) * 2
        try:
            before = Image.open(io.BytesIO(zf.read(name))).convert("RGBA")
        except KeyError:
            continue
        after = Image.open(os.path.join(SPRITES_DIR, name)).convert("RGBA")
        for im, row in ((before, row_pair), (after, row_pair + 1)):
            im.thumbnail((CELL - 8, CELL - 8))
            x = col * CELL + (CELL - im.width) // 2
            y = row * CELL + (CELL - im.height) // 2
            sheet.paste(im, (x, y), im)
    out_path = os.path.join(OUT_DIR, f"{realm}-before-after.png")
    sheet.save(out_path)
    return out_path, len(sample)


def make_fixture_card(zf):
    """Dedicated close-up card for the two named regression fixtures."""
    names = [f"{slug}.png" for slug in NAMED_FIXTURES]
    zip_names = set(zf.namelist())
    present = [n for n in names if n in zip_names and
               os.path.exists(os.path.join(SPRITES_DIR, n))]
    if not present:
        return None, 0
    sheet = Image.new("RGBA", (len(present) * FIXTURE_CELL, FIXTURE_CELL * 2), (30, 30, 30, 255))
    for i, name in enumerate(present):
        before = Image.open(io.BytesIO(zf.read(name))).convert("RGBA")
        after = Image.open(os.path.join(SPRITES_DIR, name)).convert("RGBA")
        for im, row in ((before, 0), (after, 1)):
            im2 = im.copy()
            im2.thumbnail((FIXTURE_CELL - 12, FIXTURE_CELL - 12))
            x = i * FIXTURE_CELL + (FIXTURE_CELL - im2.width) // 2
            y = row * FIXTURE_CELL + (FIXTURE_CELL - im2.height) // 2
            sheet.paste(im2, (x, y), im2)
    out_path = os.path.join(OUT_DIR, "named-fixtures-before-after.png")
    sheet.save(out_path)
    return out_path, len(present)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    zf = zipfile.ZipFile(ZIP_PATH)
    zip_names = set(zf.namelist())
    missing = []
    for realm in FLAGSHIPS:
        realm_names = sorted(n for n in zip_names if n.startswith(f"spr-{realm}-"))
        if not realm_names:
            missing.append(realm)
            continue
        path, n = make_card(realm, realm_names, zf)
        print(f"OK: {realm} contact sheet -> {os.path.relpath(path, REPO)} ({n} pairs)")
    if missing:
        note_path = os.path.join(OUT_DIR, "MISSING-FLAGSHIPS.txt")
        with open(note_path, "w") as f:
            f.write(
                "Flagship realms with ZERO status:\"cut\" sprites in the corpus as of this "
                "unification pass (no before/after card possible — not faked):\n"
                + "\n".join(missing) + "\n"
            )
        print(f"LOGGED (not faked): no cut sprites for {missing} -> "
              f"{os.path.relpath(note_path, REPO)}")

    fx_path, fx_n = make_fixture_card(zf)
    if fx_path:
        print(f"OK: named-fixtures card -> {os.path.relpath(fx_path, REPO)} ({fx_n} sprites)")


if __name__ == "__main__":
    main()
