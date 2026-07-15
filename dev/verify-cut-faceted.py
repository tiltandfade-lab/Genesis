#!/usr/bin/env python3
"""Genesis dev — self-test for build/cut-faceted.py (VQ2-RESPEC.md S2).

Builds synthetic round fixtures entirely in code (no real harvest PNGs needed), runs
build/cut-faceted.py against them as a subprocess, and asserts the two RED-FIRST checks the
S2 spec calls out by name, plus the zero-residual-key-pixel gate:

  1. A synthetic 2-cell candidate yields exactly 2 cut PNGs with the right slugs.
  2. A candidate whose component count mismatches its cells[] is skipped + reported in the
     report's skipped[] section — never mis-assigned, never half-written — while a co-located
     GOOD file in the same round still succeeds (proves per-file isolation, not an all-or-
     nothing round failure).
  3. Zero residual key-color pixels in every output (sampled programmatically by the script
     itself and asserted here via the report's residualKeyPixels field).

Mirrors dev/verify-sprite-pipeline.py's discipline: synthetic magenta-background fixtures,
subprocess the real CLI, assert on exit code + on-disk output + the report JSON, tmp dirs only.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow (PIL) required for this self-test.", file=sys.stderr)
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUT_FACETED = os.path.join(ROOT, "build", "cut-faceted.py")

MAGENTA = (255, 0, 255)
CELL_W, CELL_H = 300, 600  # smaller than the real 887x1774 but same aspect family


def make_blob(draw_img, cx, cy, w, h, color):
    from PIL import ImageDraw
    d = ImageDraw.Draw(draw_img)
    d.ellipse([cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2], fill=color)


def make_two_cell_image(path):
    """One candidate file, 2 cells side by side (magenta bg), each cell holds one solid blob —
    mirrors the real corpus's 'one PNG, multiple identities left-to-right' shape."""
    img = Image.new("RGB", (CELL_W * 2, CELL_H), MAGENTA)
    make_blob(img, CELL_W // 2, CELL_H // 2, 120, 300, (120, 90, 60))
    make_blob(img, CELL_W + CELL_W // 2, CELL_H // 2, 120, 300, (60, 90, 120))
    img.save(path)


def make_mismatch_image(path):
    """cells[] will declare 2 slugs but this image only has ONE blob — a genuine component
    count mismatch that must be caught, not guessed past."""
    img = Image.new("RGB", (CELL_W * 2, CELL_H), MAGENTA)
    make_blob(img, CELL_W // 2, CELL_H // 2, 120, 300, (200, 60, 60))
    img.save(path)


def make_single_cell_image(path):
    img = Image.new("RGB", (CELL_W, CELL_H), MAGENTA)
    make_blob(img, CELL_W // 2, CELL_H // 2, 120, 300, (60, 200, 90))
    img.save(path)


def build_fixture(tmp):
    round_dir = os.path.join(tmp, "r3a-returns")
    raw_dir = os.path.join(round_dir, "raw-figures")
    prov_dir = os.path.join(round_dir, "provenance")
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(prov_dir, exist_ok=True)

    make_two_cell_image(os.path.join(raw_dir, "spr-fantasy-test-two-cell-candidate-001.png"))
    make_mismatch_image(os.path.join(raw_dir, "spr-fantasy-test-mismatch-candidate-001.png"))
    make_single_cell_image(os.path.join(raw_dir, "spr-fantasy-test-good-candidate-001.png"))

    provenance = [
        {
            "file": "raw-figures/spr-fantasy-test-two-cell-candidate-001.png",
            "callId": "selftest-001",
            "cells": ["spr-fantasy-test-alpha", "spr-fantasy-test-beta"],
        },
        {
            "file": "raw-figures/spr-fantasy-test-mismatch-candidate-001.png",
            "callId": "selftest-002",
            "cells": ["spr-fantasy-test-gamma", "spr-fantasy-test-delta"],
        },
        {
            "file": "raw-figures/spr-fantasy-test-good-candidate-001.png",
            "callId": "selftest-003",
            "cells": ["spr-fantasy-test-epsilon"],
        },
    ]
    with open(os.path.join(prov_dir, "r3a-generation-calls.json"), "w") as f:
        json.dump(provenance, f, indent=2)

    return round_dir


def run_cutter(sheets_root, out_dir, report_path):
    cmd = [
        sys.executable, CUT_FACETED,
        "--sheets-root", sheets_root,
        "--out", out_dir,
        "--report", report_path,
        "--rounds", "r3a",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    return proc


def main():
    tmp = tempfile.mkdtemp(prefix="genesis-cut-faceted-selftest-")
    failures = []
    try:
        build_fixture(tmp)
        out_dir = os.path.join(tmp, "out")
        report_path = os.path.join(tmp, "report.json")

        proc = run_cutter(tmp, out_dir, report_path)
        print("--- cut-faceted.py stdout ---")
        print(proc.stdout)
        if proc.returncode != 0:
            print("--- stderr ---")
            print(proc.stderr)

        if not os.path.exists(report_path):
            failures.append("report.json was not written")
            print("FAIL: no report.json written; aborting further checks.", file=sys.stderr)
            print_summary(failures)
            return

        with open(report_path) as f:
            report = json.load(f)

        # CHECK 1 (⊗ red-first #1): the 2-cell candidate yields exactly 2 cut PNGs with the
        # right slugs.
        expect_two_cell = {"spr-fantasy-test-alpha", "spr-fantasy-test-beta"}
        got_two_cell = expect_two_cell & set(report["slugs"].keys())
        if got_two_cell != expect_two_cell:
            failures.append(
                f"CHECK 1 FAILED: expected slugs {expect_two_cell} in report, got "
                f"{got_two_cell} (report.slugs keys: {sorted(report['slugs'].keys())})"
            )
        else:
            for slug in expect_two_cell:
                p = os.path.join(out_dir, f"{slug}.png")
                if not os.path.exists(p):
                    failures.append(f"CHECK 1 FAILED: {slug}.png not written to disk at {p}")
            print("CHECK 1 PASSED: 2-cell candidate -> exactly 2 cut PNGs "
                  f"({sorted(expect_two_cell)})")

        # CHECK 2 (⊗ red-first #2): the mismatched-count candidate is skipped + reported, and
        # its slugs never appear as outputs (never mis-assigned) — while the co-located GOOD
        # file still succeeds (per-file isolation).
        mismatch_slugs = {"spr-fantasy-test-gamma", "spr-fantasy-test-delta"}
        leaked = mismatch_slugs & set(report["slugs"].keys())
        if leaked:
            failures.append(
                f"CHECK 2 FAILED: mismatched-count file's slugs leaked into outputs: {leaked}"
            )
        skipped_files = {s.get("file") for s in report["skipped"]}
        if "spr-fantasy-test-mismatch-candidate-001.png" not in skipped_files:
            failures.append(
                "CHECK 2 FAILED: mismatch file not present in report.skipped[] "
                f"(skipped files seen: {skipped_files})"
            )
        mismatch_entry = next(
            (s for s in report["skipped"]
             if s.get("file") == "spr-fantasy-test-mismatch-candidate-001.png"), None
        )
        if mismatch_entry and "component count" not in mismatch_entry.get("reason", ""):
            failures.append(
                f"CHECK 2 FAILED: skip reason doesn't mention component-count mismatch: "
                f"{mismatch_entry.get('reason')}"
            )
        if "spr-fantasy-test-epsilon" not in report["slugs"]:
            failures.append(
                "CHECK 2 FAILED: the co-located GOOD single-cell file was not cut — one bad "
                "file in a round should not block the others"
            )
        if not leaked and mismatch_entry and "spr-fantasy-test-epsilon" in report["slugs"]:
            print("CHECK 2 PASSED: mismatched file skipped + reported (never mis-assigned); "
                  "good file in the same round still succeeded")

        # CHECK 3: zero residual key-color pixels in every output.
        residual_failures = {
            slug: info["residualKeyPixels"]
            for slug, info in report["slugs"].items()
            if info.get("residualKeyPixels")
        }
        if residual_failures:
            failures.append(f"CHECK 3 FAILED: residual key-color pixels found: {residual_failures}")
        else:
            print("CHECK 3 PASSED: zero residual key-color pixels across all outputs")

        # CHECK 4: report totals reconcile (candidates processed = outputs by slug + skipped
        # entries that correspond to actual candidate files, informational).
        totals = report["totals"]
        if totals["outputSlugs"] != len(report["slugs"]):
            failures.append(f"CHECK 4 FAILED: totals.outputSlugs {totals['outputSlugs']} != "
                             f"len(slugs) {len(report['slugs'])}")
        if totals["skipped"] != len(report["skipped"]):
            failures.append(f"CHECK 4 FAILED: totals.skipped {totals['skipped']} != "
                             f"len(skipped) {len(report['skipped'])}")
        if not any("CHECK 4 FAILED" in f for f in failures):
            print("CHECK 4 PASSED: report totals reconcile with the report's own arrays")

    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print_summary(failures)


def print_summary(failures):
    print("\n=== SUMMARY ===")
    if failures:
        for f in failures:
            print(f"FAIL: {f}")
        print(f"\n{len(failures)} check(s) FAILED.")
        sys.exit(1)
    print("All checks PASSED.")
    sys.exit(0)


if __name__ == "__main__":
    main()
