#!/usr/bin/env python3
"""Genesis dev — self-test for the sprite-sheet slicing pipeline (build/slice-sprites.py).

Builds two synthetic sheet-01-sized PNGs entirely in code (no real ChatGPT art needed):
  - a CLEAN sheet: 36 colored blobs on flat magenta, positioned per dev/sprite-manifests
    manifest's sheet-01 slug order, each with a small near-touching "limb" fragment (so the
    fragment-merge path is exercised too) and mild position jitter (so it isn't a suspiciously
    perfect grid).
  - a BROKEN sheet: the same but only 35 blobs (one dropped), proving the honest-failure path.

Then runs build/slice-sprites.py against both and asserts:
  clean sheet  -> exit 0, exactly 36 crops written, crop set == manifest slug set, each crop's
                  average color matches the source sheet's pixel at its predicted grid cell
                  (proves row-major assignment is correct, not just "36 files exist"), and each
                  crop is RGBA with transparent corners + opaque center (proves the magenta
                  key-out actually produced transparency, not just a color crop).
  broken sheet -> exit 1 (nonzero), review HTML written, the correct missing slug reported.

Also exercises hero-singles mode (--single SLUG, the heroes.md pipeline):
  - a synthetic single-hero PNG (one blob + detached fragment on magenta) -> exit 0, one
    trimmed transparent <slug>.png whose bbox covers BOTH pieces (union-trim, fragment kept).
  - the same image with a slug NOT in manifest.json's heroes list -> nonzero exit (typo guard).

Run: python3 dev/verify-sprite-pipeline.py
Requires: Pillow (see build/slice-sprites.py's docstring for the scratch-venv note if
`python3 -c "import PIL"` fails in your environment).

Not wired into check-manifest.py (this is a build/ pipeline test, not an app-module test) —
run it by hand after touching build/slice-sprites.py or build/gen-sprite-manifests.py.
"""
import json
import os
import random
import shutil
import subprocess
import sys
import tempfile

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("ERROR: Pillow (PIL) required — see build/slice-sprites.py docstring for the venv note.",
          file=sys.stderr)
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(ROOT, "dev", "sprite-manifests", "manifest.json")
SLICER = os.path.join(ROOT, "build", "slice-sprites.py")

CELL = 100
GRID = 6
W = H = CELL * GRID
MAGENTA = (255, 0, 255)


def make_sheet(path, n_blobs, seed=42):
    img = Image.new("RGB", (W, H), MAGENTA)
    draw = ImageDraw.Draw(img)
    rnd = random.Random(seed)
    count = 0
    for row in range(GRID):
        for col in range(GRID):
            if count >= n_blobs:
                break
            cx = col * CELL + CELL // 2 + rnd.randint(-6, 6)
            cy = row * CELL + CELL // 2 + rnd.randint(-6, 6)
            r = CELL // 2 - 14
            color = ((30 + count * 5) % 200 + 20, (60 + count * 7) % 200 + 20, (90 + count * 3) % 200 + 20)
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
            draw.ellipse([cx + r - 5, cy + r - 9, cx + r + 5, cy + r + 3], fill=color)  # limb fragment
            count += 1
        if count >= n_blobs:
            break
    img.save(path)
    return count


def run_slicer(sheet_path, sheet_num, out_dir, extra_args=None):
    cmd = [sys.executable, SLICER, sheet_path, str(sheet_num), "--out", out_dir, "--review"]
    if extra_args:
        cmd += extra_args
    proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    return proc


def main():
    if not os.path.exists(MANIFEST_PATH):
        print("ERROR: dev/sprite-manifests/manifest.json missing — run build/gen-sprite-manifests.py first.",
              file=sys.stderr)
        sys.exit(1)
    with open(MANIFEST_PATH) as f:
        manifest = json.load(f)
    slugs = manifest["sheets"]["sheet-01"]["slugs"]
    assert len(slugs) == 36, f"expected sheet-01 to have 36 slugs, got {len(slugs)}"

    tmp = tempfile.mkdtemp(prefix="genesis-sprite-selftest-")
    failures = []
    try:
        clean_png = os.path.join(tmp, "sheet-01.png")
        broken_png = os.path.join(tmp, "sheet-01-broken.png")
        make_sheet(clean_png, 36)
        make_sheet(broken_png, 35)

        # --- clean sheet: expect success ---
        clean_out = os.path.join(tmp, "out-clean")
        proc = run_slicer(clean_png, 1, clean_out)
        print("--- clean sheet run ---")
        print(proc.stdout)
        if proc.returncode != 0:
            failures.append(f"clean sheet: expected exit 0, got {proc.returncode}\n{proc.stderr}")
        else:
            files = sorted(f for f in os.listdir(clean_out) if f.endswith(".png"))
            if len(files) != 36:
                failures.append(f"clean sheet: expected 36 crop files, got {len(files)}")
            got_slugs = set(f[:-4] for f in files)
            if got_slugs != set(slugs):
                failures.append(f"clean sheet: crop slug set mismatch. missing={set(slugs)-got_slugs} extra={got_slugs-set(slugs)}")

            # row-major correctness: crop[i]'s avg color should match the sheet's known cell i
            sheet_rgb = Image.open(clean_png).convert("RGB")
            mismatches = []
            for i, slug in enumerate(slugs):
                crop_path = os.path.join(clean_out, f"{slug}.png")
                if not os.path.exists(crop_path):
                    continue
                crop = Image.open(crop_path)
                if crop.mode != "RGBA":
                    failures.append(f"clean sheet: {slug}.png is mode {crop.mode}, expected RGBA")
                    continue
                px = crop.load()
                w, h = crop.size
                # transparency check
                corner_a = px[0, 0][3]
                center_a = px[w // 2, h // 2][3]
                if corner_a != 0:
                    mismatches.append(f"{slug}: corner alpha {corner_a} != 0 (expected transparent)")
                if center_a != 255:
                    mismatches.append(f"{slug}: center alpha {center_a} != 255 (expected opaque)")
                # row-major position check
                rs = gs = bs = n = 0
                for yy in range(h):
                    for xx in range(w):
                        r, g, b, a = px[xx, yy]
                        if a > 0:
                            rs += r; gs += g; bs += b; n += 1
                avg = (rs // n, gs // n, bs // n) if n else None
                erow, ecol = divmod(i, 6)
                ecx, ecy = ecol * CELL + CELL // 2, erow * CELL + CELL // 2
                expected_px = sheet_rgb.getpixel((ecx, ecy))
                dist = sum((a - b) ** 2 for a, b in zip(avg, expected_px)) ** 0.5 if avg else 9999
                if dist > 40:
                    mismatches.append(f"{slug}: expected cell ({erow},{ecol}) color {expected_px}, crop avg {avg} (dist {dist:.1f})")
            if mismatches:
                failures.append("clean sheet: row-major/transparency mismatches:\n  " + "\n  ".join(mismatches))
            else:
                print(f"OK: all 36 crops correctly assigned in row-major order, transparent bg confirmed.")

        # --- broken sheet: expect honest failure ---
        broken_out = os.path.join(tmp, "out-broken")
        proc2 = run_slicer(broken_png, 1, broken_out, extra_args=["--expect", "36"])
        print("--- broken (35-blob) sheet run ---")
        print(proc2.stdout)
        print(proc2.stderr)
        if proc2.returncode == 0:
            failures.append("broken sheet: expected nonzero exit, got 0")
        else:
            if "swamp-shadow" not in proc2.stderr and "swamp-shadow" not in proc2.stdout:
                failures.append("broken sheet: expected missing slug 'swamp-shadow' reported, not found in output")
            review_path = os.path.join(ROOT, "dev", "sprite-manifests", "review", "sheet-01.html")
            if not os.path.exists(review_path):
                failures.append(f"broken sheet: expected review HTML at {review_path}, not found")
            else:
                print(f"OK: honest failure — exit {proc2.returncode}, review sheet written, missing slug reported.")

        # --- single-hero mode: expect success ---
        heroes = manifest.get("heroes", [])
        if not heroes:
            failures.append("manifest.json has no heroes list — gen-sprite-manifests.py out of date?")
        else:
            hero_slug = heroes[0]
            single_png = os.path.join(tmp, "hero.png")
            img = Image.new("RGB", (300, 300), MAGENTA)
            d = ImageDraw.Draw(img)
            d.ellipse([80, 60, 220, 240], fill=(90, 70, 60))       # body
            d.ellipse([235, 200, 265, 230], fill=(90, 70, 60))     # detached fragment (tail)
            img.save(single_png)

            single_out = os.path.join(tmp, "out-single")
            proc3 = subprocess.run(
                [sys.executable, SLICER, single_png, "--single", hero_slug, "--out", single_out],
                cwd=ROOT, capture_output=True, text=True)
            print("--- single-hero run ---")
            print(proc3.stdout)
            if proc3.returncode != 0:
                failures.append(f"single: expected exit 0, got {proc3.returncode}\n{proc3.stderr}")
            else:
                sp = os.path.join(single_out, f"{hero_slug}.png")
                if not os.path.exists(sp):
                    failures.append(f"single: {sp} not written")
                else:
                    crop = Image.open(sp)
                    ok_single = True
                    if crop.mode != "RGBA":
                        failures.append(f"single: mode {crop.mode}, expected RGBA"); ok_single = False
                    # union-trim must span body left edge (~80) to fragment right edge (~265):
                    # width must exceed the body alone (140px + padding) because the fragment counts.
                    if crop.width < 265 - 80:
                        failures.append(f"single: crop width {crop.width} too small — detached fragment dropped from trim")
                        ok_single = False
                    if crop.getpixel((0, 0))[3] != 0:
                        failures.append("single: corner not transparent"); ok_single = False
                    if ok_single:
                        print(f"OK: single-hero mode — {hero_slug}.png trimmed to union bbox (fragment kept), transparent bg.")

            # typo-slug guard: nonzero exit
            proc4 = subprocess.run(
                [sys.executable, SLICER, single_png, "--single", "not-a-real-slug", "--out", single_out],
                cwd=ROOT, capture_output=True, text=True)
            if proc4.returncode == 0:
                failures.append("single typo-guard: expected nonzero exit for a slug not in heroes, got 0")
            else:
                print(f"OK: single-hero typo guard — unknown slug rejected (exit {proc4.returncode}).")

    finally:
        shutil.rmtree(tmp, ignore_errors=True)
        review_dir = os.path.join(ROOT, "dev", "sprite-manifests", "review")
        shutil.rmtree(review_dir, ignore_errors=True)

    print()
    if failures:
        print(f"FAILED ({len(failures)} issue(s)):")
        for f in failures:
            print(" -", f)
        sys.exit(1)
    print("ALL CHECKS PASSED: clean 36/36 round-trip + honest failure on the broken 35-blob sheet "
          "+ single-hero mode (union-trim, transparency, typo guard).")
    sys.exit(0)


if __name__ == "__main__":
    main()
