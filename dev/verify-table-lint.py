#!/usr/bin/env python3
"""Genesis dev — self-test for build/lint-tables.py.

Dependency-free. Builds SYNTHETIC fixture tables under a temp directory shaped exactly like
Engine/03. _Tables (same frontmatter, same pipe-table body format lint-tables.py/compile-tables.py
both parse), points a throwaway copy of the linter's ROOTS at that temp tree, and asserts red-first:
every seeded defect is CAUGHT, a clean fixture PASSES, and a format the real compiler accepts is
NOT flagged as malformed (the "never stricter than the compiler" contract).

Because build/lint-tables.py hardcodes its ROOTS relative to the real repo (BASE = one level up
from build/), this harness doesn't import it as a module — it invokes it as a subprocess with a
monkeypatched ROOTS via a small wrapper script that imports the real module's functions but drives
them at the temp path. This keeps the harness honest: it runs the REAL parsing/checking code in
build/lint-tables.py, not a reimplementation of it.

Enumerated assertions:
  1. A table with a GAP in its d100 roll-range coverage -> caught as a hard ERROR, exit 1.
  2. A table with an OVERLAP in its roll-range coverage -> caught as a hard ERROR, exit 1.
  3. A table with an out-of-order Band column (isolated single-row dip) -> caught as a hard
     ERROR, exit 1.
  4. A table with a DUPLICATE row (identical result text on two different rolls) -> caught as a
     WARNING (never a hard error — repeated text backing a weighted distribution is legitimate
     table-authoring, confirmed against the real corpus's npc-influence-weight table).
  5. A CLEAN fixture (gapless, non-overlapping, monotonic band, no dups) -> zero errors, zero
     warnings, exit 0.
  6. A table format the real compiler accepts without complaint — a row with FEWER cells than the
     header (ragged/optional trailing column, exactly like the real corpus's
     "Dungeon Loot - Outlandish.md") — is NOT flagged as a hard error (soft WARNING at most). This
     is the mirror-not-stricter contract: compile-tables.py never compares column counts (every
     cell access is length-guarded), so lint-tables.py must not hard-fail on it either.
  7. A legitimate multi-wave table (a clean two-cycle Grounded->Mythic->Grounded->Volatile shape,
     modeled on the real Realm Items d50 tables) is reported at most as a WARNING, not a hard
     ERROR — distinguishing an intentional sustained reset from a single-row authoring slip.
  8. --warn-only mode: the SAME gap-fixture that fails (exit 1) in default mode exits 0 under
     --warn-only, while still printing the finding (report-only mode never hides findings, only
     changes the exit code).
  9. compile-tables.py itself is UNBOTHERED by every fixture above except the true gap/overlap
     cases (i.e., the ragged-row and duplicate-row fixtures compile cleanly — proving lint's
     WARN-only calls on those are correctly calibrated, not over-strict guesses).

Run:  python3 dev/verify-table-lint.py
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINTER = os.path.join(REPO, "build", "lint-tables.py")
COMPILER = os.path.join(REPO, "Engine", "00. _System", "compile-tables.py")

PASS = []
FAIL = []


def check(name, cond, detail=""):
    if cond:
        PASS.append(name)
        print(f"  ok  - {name}")
    else:
        FAIL.append(name)
        print(f"  FAIL- {name}  {detail}")


def fm(id_, table_class="Fork"):
    return (
        "---\n"
        f"id: {id_}\n"
        "type: table\n"
        "domain: Session Mechanics\n"
        "status: source\n"
        f"table_class: {table_class}\n"
        "player_facing: reveal\n"
        "voice_critical: false\n"
        "---\n\n"
    )


def write_fixture(root, relpath, content):
    p = os.path.join(root, relpath)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    return p


_LINTER_SHIM = """
import sys
sys.argv = [LINTER_PATH] + EXTRA_ARGS
src = open(LINTER_PATH, encoding="utf-8").read()
src = src.replace(
    'ROOTS = [os.path.join(BASE, "Engine", "03. _Tables"), os.path.join(BASE, "Asset Library")]',
    "ROOTS = [" + repr(FIXTURE_ROOT) + "]"
)
ns = {"__name__": "__main__", "__file__": LINTER_PATH}
exec(compile(src, LINTER_PATH, "exec"), ns)
"""

_COMPILER_SHIM = """
import sys
sys.argv = [COMPILER_PATH]
src = open(COMPILER_PATH, encoding="utf-8").read()
src = src.replace(
    'ROOTS=[os.path.join(BASE,"Engine","03. _Tables"), os.path.join(BASE,"Asset Library")]',
    "ROOTS=[" + repr(FIXTURE_ROOT) + "]"
)
ns = {"__name__": "__main__", "__file__": COMPILER_PATH}
exec(compile(src, COMPILER_PATH, "exec"), ns)
"""


def _inject(shim_src, **consts):
    """Substitute Python-literal constants into a shim template by prepending real assignment
    statements (avoids any f-string/quote-nesting fragility — every value is repr()'d once,
    assigned as a real top-level name, never string-substituted into the middle of a literal)."""
    header = "\n".join(f"{k} = {v!r}" for k, v in consts.items())
    return header + "\n" + shim_src


def run_linter_against(root, extra_args=None):
    """Run build/lint-tables.py with its ROOTS pointed at `root` instead of the real corpus.
    Implemented by invoking python3 with a tiny -c shim that patches ROOTS then exec's the
    linter's own source — this runs the REAL check logic, not a copy of it."""
    shim = _inject(_LINTER_SHIM, LINTER_PATH=LINTER, EXTRA_ARGS=extra_args or [], FIXTURE_ROOT=root)
    proc = subprocess.run(
        [sys.executable, "-c", shim],
        capture_output=True, text=True, cwd=REPO,
    )
    return proc


def run_compiler_against(root):
    """Same monkeypatch trick, against the real compiler, REPORT mode only (no --emit, so it
    never writes tables.json — this harness must never touch the real compiled artifact)."""
    shim = _inject(_COMPILER_SHIM, COMPILER_PATH=COMPILER, FIXTURE_ROOT=root)
    proc = subprocess.run(
        [sys.executable, "-c", shim],
        capture_output=True, text=True, cwd=REPO,
    )
    return proc


def main():
    tmp = tempfile.mkdtemp(prefix="genesis-lint-fixtures-")
    try:
        # ---- Fixture 1: GAP in coverage (d10, rows 1-6 then 8-10; roll 7 missing) ----
        gap_tid = "fixture-gap-table"
        write_fixture(tmp, "gap.md", fm(gap_tid) + (
            "| d10 | Band | Result |\n"
            "|---|---|---|\n"
            "| 1 | Grounded | one |\n"
            "| 2 | Grounded | two |\n"
            "| 3 | Grounded | three |\n"
            "| 4 | Grounded | four |\n"
            "| 5 | Grounded | five |\n"
            "| 6 | Grounded | six |\n"
            "| 8 | Textured | eight |\n"
            "| 9 | Textured | nine |\n"
            "| 10 | Textured | ten |\n"
        ))

        # ---- Fixture 2: OVERLAP in coverage (rows 4-5 and 5-6 both claim roll 5) ----
        overlap_tid = "fixture-overlap-table"
        write_fixture(tmp, "overlap.md", fm(overlap_tid) + (
            "| d6 | Band | Result |\n"
            "|---|---|---|\n"
            "| 1 | Grounded | one |\n"
            "| 2 | Grounded | two |\n"
            "| 3 | Grounded | three |\n"
            "| 4-5 | Textured | four-five |\n"
            "| 5-6 | Textured | five-six |\n"
        ))

        # ---- Fixture 3: out-of-order BAND (isolated single-row dip, roll 4 drops) ----
        band_tid = "fixture-band-dip-table"
        write_fixture(tmp, "band-dip.md", fm(band_tid) + (
            "| d6 | Band | Result |\n"
            "|---|---|---|\n"
            "| 1 | Grounded | one |\n"
            "| 2 | Grounded | two |\n"
            "| 3 | Textured | three |\n"
            "| 4 | Grounded | four-should-not-drop |\n"
            "| 5 | Strange | five |\n"
            "| 6 | Mythic | six |\n"
        ))

        # ---- Fixture 4: DUPLICATE row text (rolls 2 and 5 identical) ----
        dup_tid = "fixture-dup-table"
        write_fixture(tmp, "dup.md", fm(dup_tid) + (
            "| d6 | Band | Result |\n"
            "|---|---|---|\n"
            "| 1 | Grounded | alpha |\n"
            "| 2 | Grounded | beta |\n"
            "| 3 | Grounded | gamma |\n"
            "| 4 | Textured | delta |\n"
            "| 5 | Textured | beta |\n"
            "| 6 | Strange | epsilon |\n"
        ))

        # ---- Fixture 5: CLEAN table (gapless, non-overlapping, monotonic band, no dups) ----
        clean_tid = "fixture-clean-table"
        write_fixture(tmp, "clean.md", fm(clean_tid) + (
            "| d6 | Band | Result |\n"
            "|---|---|---|\n"
            "| 1 | Grounded | alpha |\n"
            "| 2 | Grounded | beta |\n"
            "| 3 | Textured | gamma |\n"
            "| 4 | Textured | delta |\n"
            "| 5 | Strange | epsilon |\n"
            "| 6 | Mythic | zeta |\n"
        ))

        # ---- Fixture 6: ragged row (fewer cells than header) — compiler-tolerated format ----
        ragged_tid = "fixture-ragged-table"
        write_fixture(tmp, "ragged.md", fm(ragged_tid) + (
            "|d6|Item|Origin|Effect|Band|Ranks|\n"
            "|---|---|---|---|---|---|\n"
            "|1|Thing One|reality|does a thing|Grounded||\n"
            "|2|Thing Two|reality|does another thing|Grounded|\n"  # trailing cell OMITTED entirely
            "|3|Thing Three|reality|third thing|Textured||\n"
            "|4|Thing Four|reality|fourth thing|Textured||\n"
            "|5|Thing Five|reality|fifth thing|Strange||\n"
            "|6|Thing Six|reality|sixth thing|Mythic||\n"
        ))

        # ---- Fixture 7: legitimate multi-wave table (two clean escalation cycles, d10) ----
        wave_tid = "fixture-multiwave-table"
        write_fixture(tmp, "multiwave.md", fm(wave_tid, table_class="Commitment") + (
            "> Modeled on the real Realm Items d50 tables: two deliberate escalation waves in one\n"
            "> roll range, sustained resets rather than scattered dips.\n\n"
            "| d10 | Band | Result |\n"
            "|---|---|---|\n"
            "| 1 | Grounded | a1 |\n"
            "| 2 | Textured | a2 |\n"
            "| 3 | Strange | a3 |\n"
            "| 4 | Volatile | a4 |\n"
            "| 5 | Mythic | a5 |\n"
            "| 6 | Grounded | b1 |\n"
            "| 7 | Textured | b2 |\n"
            "| 8 | Strange | b3 |\n"
            "| 9 | Volatile | b4 |\n"
            "| 10 | Mythic | b5 |\n"
        ))

        print("Fixtures written to", tmp)
        print()

        # ============================================================
        # Run the linter (default / hard-fail mode) against each fixture individually so exit
        # codes are unambiguous per-defect (a shared directory would OR all exit codes together).
        # ============================================================
        def isolate(name):
            d = tempfile.mkdtemp(prefix=f"genesis-lint-iso-{name}-", dir=tmp)
            return d

        gap_dir = isolate("gap")
        shutil.copy(os.path.join(tmp, "gap.md"), os.path.join(gap_dir, "gap.md"))
        overlap_dir = isolate("overlap")
        shutil.copy(os.path.join(tmp, "overlap.md"), os.path.join(overlap_dir, "overlap.md"))
        band_dir = isolate("band")
        shutil.copy(os.path.join(tmp, "band-dip.md"), os.path.join(band_dir, "band-dip.md"))
        dup_dir = isolate("dup")
        shutil.copy(os.path.join(tmp, "dup.md"), os.path.join(dup_dir, "dup.md"))
        clean_dir = isolate("clean")
        shutil.copy(os.path.join(tmp, "clean.md"), os.path.join(clean_dir, "clean.md"))
        ragged_dir = isolate("ragged")
        shutil.copy(os.path.join(tmp, "ragged.md"), os.path.join(ragged_dir, "ragged.md"))
        wave_dir = isolate("wave")
        shutil.copy(os.path.join(tmp, "multiwave.md"), os.path.join(wave_dir, "multiwave.md"))

        # ---- 1. gap caught, hard error, exit 1 ----
        r = run_linter_against(gap_dir)
        check("1. GAP fixture -> nonzero exit (hard error)", r.returncode != 0, r.stdout[-400:])
        check("1b. GAP fixture -> finding names the missing roll (7)",
              "gap" in r.stdout.lower() and "7" in r.stdout, r.stdout[-400:])

        # ---- 2. overlap caught, hard error, exit 1 ----
        r = run_linter_against(overlap_dir)
        check("2. OVERLAP fixture -> nonzero exit (hard error)", r.returncode != 0, r.stdout[-400:])
        check("2b. OVERLAP fixture -> finding names overlapping ranges",
              "overlap" in r.stdout.lower(), r.stdout[-400:])

        # ---- 3. out-of-order band caught, hard error, exit 1 ----
        r = run_linter_against(band_dir)
        check("3. BAND-DIP fixture -> nonzero exit (hard error)", r.returncode != 0, r.stdout[-400:])
        check("3b. BAND-DIP fixture -> finding cites roll 4's regression",
              "band regression" in r.stdout.lower() and "roll 4" in r.stdout.lower(), r.stdout[-500:])

        # ---- 4. duplicate row caught as WARNING only, exit 0 ----
        r = run_linter_against(dup_dir)
        check("4. DUP fixture -> exit 0 (never a hard error)", r.returncode == 0, r.stdout[-400:])
        check("4b. DUP fixture -> finding present as a WARNING",
              "duplicate row" in r.stdout.lower() and "[WARN" in r.stdout, r.stdout[-400:])

        # ---- 5. clean fixture -> zero findings, exit 0 ----
        r = run_linter_against(clean_dir)
        check("5. CLEAN fixture -> exit 0", r.returncode == 0, r.stdout[-400:])
        check("5b. CLEAN fixture -> zero errors and zero warnings reported",
              "errors: 0" in r.stdout and "warnings: 0" in r.stdout, r.stdout[-400:])

        # ---- 6. ragged row (compiler-tolerated) -> not a hard error ----
        r = run_linter_against(ragged_dir)
        check("6. RAGGED-ROW fixture -> exit 0 (compiler-tolerated format, not malformed)",
              r.returncode == 0, r.stdout[-400:])

        # ---- 7. multi-wave table -> at most a WARNING, never a hard ERROR ----
        r = run_linter_against(wave_dir)
        check("7. MULTI-WAVE fixture -> exit 0 (sustained reset, not flagged as hard error)",
              r.returncode == 0, r.stdout[-400:])

        # ---- 8. --warn-only flips the gap fixture's exit code but keeps the finding ----
        r = run_linter_against(gap_dir, extra_args=["--warn-only"])
        check("8. GAP fixture under --warn-only -> exit 0", r.returncode == 0, r.stdout[-400:])
        check("8b. GAP fixture under --warn-only -> finding STILL printed",
              "gap" in r.stdout.lower() and "7" in r.stdout, r.stdout[-400:])

        # ============================================================
        # 9. Cross-check against the REAL compiler: ragged-row and duplicate-row fixtures must
        #    compile cleanly (report mode, no --emit) — proving lint's WARN-only calibration on
        #    those two checks isn't guessing, it matches the compiler's own tolerance.
        # ============================================================
        rc = run_compiler_against(ragged_dir)
        check("9. compile-tables.py REPORT mode is clean on the ragged-row fixture (no crash)",
              rc.returncode == 0 and "Traceback" not in rc.stderr, rc.stdout[-400:] + rc.stderr[-400:])

        rc = run_compiler_against(dup_dir)
        check("9b. compile-tables.py REPORT mode is clean on the duplicate-row fixture (no crash)",
              rc.returncode == 0 and "Traceback" not in rc.stderr, rc.stdout[-400:] + rc.stderr[-400:])

        rc = run_compiler_against(gap_dir)
        check("9c. compile-tables.py itself ALSO flags the gap fixture (REAL bugs: 1) — "
              "confirms lint and compiler agree on the true-defect case",
              rc.returncode == 0 and "REAL bugs: 1" in rc.stdout, rc.stdout[-600:])

    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print()
    print(f"{len(PASS)} passed, {len(FAIL)} failed")
    if FAIL:
        print("FAILED:")
        for f in FAIL:
            print(" -", f)
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
