#!/usr/bin/env python3
"""Genesis dev — stale-artifact guard for the compiled table pipeline (W3).

WHY THIS EXISTS: on 2026-07-27 a recompile revealed `tables.json`/`tables.js` at HEAD were
STALE — authored Engine table markdown had been edited without a follow-up `--emit`, and the
derived usage artifact was equally stale, so nothing in CI flagged the drift (docs/DESIGN.md
2026-07-27 entry). `tables.json`/`tables.js` are committed but GENERATED (CLAUDE.md
"edit-source -> compile-artifact") — this harness makes "the committed artifact matches its
source" a real, enforced fact instead of an assumption.

NO --check MODE: `Engine/00. _System/compile-tables.py` was read before writing this (its own
instruction). It has exactly two modes — bare (REPORT: prints coverage counts only, writes
nothing) and `--emit` (writes `tables.json`/`tables.js`). REPORT mode can't answer "does the
committed artifact match the source" — it never serializes the row data at all, so a pure
text-content edit to a table (dice range unchanged) is invisible to it. Only a real `--emit`
produces something byte-comparable, and the compiler hardcodes both output paths
(`os.path.join(BASE,'tables.json'/'tables.js')`) off `BASE`, which it derives from its own
`__file__` — there is no flag to point the output elsewhere.

THE TECHNIQUE: rather than hand-copy/reimplement the compiler (a copy WILL drift and silently
defeat this guard's own purpose the next time compile-tables.py changes), this reuses the
"monkeypatch via source-replace + exec" trick `dev/verify-table-lint.py` already established for
driving the real compiler against something other than its hardcoded paths. That harness
repoints ROOTS (the compiler's *input*); this one repoints the opposite end — the two literal
output-write expressions — leaving `BASE` (and therefore ROOTS, the safety denylist path, and
the `build/lint-tables.py` gate subprocess call) pointed at the REAL repo. So this is a
full-fidelity dry run of `--emit`: the safety gate and the lint gate both run for real against
the real current source; the ONLY thing redirected is where the two output files land (a fresh
`tempfile.mkdtemp()`, never the real `tables.json`/`tables.js`). A `src.count(...)==1` assertion
guards the redirect itself — if compile-tables.py's write lines ever change shape, this harness
fails loudly instead of silently falling through to writing the REAL committed files.

BYTE, NOT SEMANTIC, DIFF — AND WHY: compile-tables.py embeds no timestamp/random/uuid anywhere
in its output (grepped; there is no `time`/`datetime`/`random` import in the file at all). Every
input to the emitted JSON — file list, block order, row order — comes from `sorted(...)` or
in-order iteration, so two compiles of identical source should be byte-identical. This harness
doesn't just assert that in a comment: the "double-compile determinism" check below actually
runs the fresh compile TWICE, independently, and proves the two runs are byte-identical before
trusting the byte-diff gate against the committed files. TIMESTAMP-DIFF-ESCAPE-HATCH: if the
compiler is ever changed to embed something non-deterministic, that determinism check goes red
on its own (even on perfectly fresh, unstaged source) — the fix at that point is to replace the
committed-vs-fresh byte comparison below with a semantic (parsed-JSON, key-by-key) comparison;
`_print_semantic_summary()` already contains that logic and runs today as a diagnostic on top of
the byte gate, so promoting it to the actual gate is a small change, not a rewrite.

Run:  python3 dev/verify-compile-fresh.py
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import types

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPILER = os.path.join(REPO, "Engine", "00. _System", "compile-tables.py")
COMMITTED_JSON = os.path.join(REPO, "tables.json")
COMMITTED_JS = os.path.join(REPO, "tables.js")

PASS = []
FAIL = []


def check(name, cond, detail=""):
    if cond:
        PASS.append(name)
        print(f"  ok  - {name}")
    else:
        FAIL.append(name)
        print(f"  FAIL- {name}  {detail}")


# The exact literal expressions compile-tables.py's `if EMIT:` block writes its two output files
# with (verified against the file read above) — replaced, at runtime inside the subprocess, so
# they write into OUT_DIR instead of BASE. Everything else in the compiler (ROOTS, the safety
# denylist path, the build/lint-tables.py gate subprocess call) is untouched and still reads the
# real repo.
_COMPILE_SHIM = """
import sys
sys.argv = [COMPILER_PATH, "--emit"]
src = open(COMPILER_PATH, encoding="utf-8").read()
_json_write_old = "json.dump(out,open(os.path.join(BASE,'tables.json'),'w'),ensure_ascii=False,indent=0)"
_js_write_old = "open(os.path.join(BASE,'tables.js'),'w',encoding='utf-8').write("
assert src.count(_json_write_old) == 1, \\
    "compile-tables.py's tables.json write line changed shape — update this shim's replace target"
assert src.count(_js_write_old) == 1, \\
    "compile-tables.py's tables.js write line changed shape — update this shim's replace target"
src = src.replace(_json_write_old,
    "json.dump(out,open(os.path.join(" + repr(OUT_DIR) + ",'tables.json'),'w'),ensure_ascii=False,indent=0)")
src = src.replace(_js_write_old,
    "open(os.path.join(" + repr(OUT_DIR) + ",'tables.js'),'w',encoding='utf-8').write(")
ns = {"__name__": "__main__", "__file__": COMPILER_PATH}
exec(compile(src, COMPILER_PATH, "exec"), ns)
"""


def _inject(shim_src, **consts):
    """Prepend real Python assignment statements (each value repr()'d once) ahead of the shim
    body, instead of string-formatting values into the middle of a literal — same helper
    dev/verify-table-lint.py uses for the identical reason (no quote-nesting fragility)."""
    header = "\n".join(f"{k} = {v!r}" for k, v in consts.items())
    return header + "\n" + shim_src


def run_fresh_compile(out_dir):
    """Runs the REAL compile-tables.py --emit with ONLY its two output paths redirected into
    out_dir. Returns an object with .returncode/.stdout/.stderr (a real CompletedProcess, or a
    synthesized one on timeout)."""
    shim = _inject(_COMPILE_SHIM, COMPILER_PATH=COMPILER, OUT_DIR=out_dir)
    try:
        return subprocess.run([sys.executable, "-c", shim], capture_output=True, text=True,
                               cwd=REPO, timeout=180)
    except subprocess.TimeoutExpired as e:
        return types.SimpleNamespace(returncode=1, stdout=(e.stdout or ""),
                                      stderr=f"TIMEOUT after {e.timeout}s waiting on the fresh compile")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _tail(proc):
    return (proc.stdout or "")[-1200:] + (proc.stderr or "")[-800:]


def _load_table_dict(path):
    """tables.json is raw JSON; tables.js wraps the SAME payload as `window.GENESIS_TABLES=<json>;`
    (see compile-tables.py's EMIT block — both files are written from the identical `payload`
    string). Strip the JS wrapper so the semantic diff below works on either file."""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    if path.endswith(".js"):
        marker = "window.GENESIS_TABLES="
        i = text.index(marker) + len(marker)
        text = text[i:].rstrip()
        if text.endswith(";"):
            text = text[:-1]
    return json.loads(text)


def _print_semantic_summary(committed_path, fresh_path):
    """Diagnostic only (never the gate itself — see the module docstring's escape hatch): which
    table ids differ, not their row content, so a stale-artifact failure is actionable without
    ever printing megabytes of table rows to CI logs."""
    try:
        c = _load_table_dict(committed_path)
        fr = _load_table_dict(fresh_path)
    except Exception as e:
        print(f"    (semantic breakdown unavailable: {e})")
        return
    c_keys, f_keys = set(c), set(fr)
    added = sorted(f_keys - c_keys)
    removed = sorted(c_keys - f_keys)
    changed = sorted(k for k in (c_keys & f_keys) if c[k] != fr[k])
    print(f"    semantic breakdown: {len(added)} table(s) added, {len(removed)} removed, "
          f"{len(changed)} changed (of {len(c_keys)} committed / {len(f_keys)} fresh table ids)")
    for label, ids in (("added", added), ("removed", removed), ("changed", changed)):
        if ids:
            shown = ids[:10]
            more = f" …(+{len(ids) - 10} more)" if len(ids) > 10 else ""
            print(f"      {label}: {', '.join(shown)}{more}")


def _finish():
    print()
    print(f"{len(PASS)} passed, {len(FAIL)} failed")
    if FAIL:
        print("FAILED:")
        for f in FAIL:
            print(" -", f)
        sys.exit(1)
    sys.exit(0)


def main():
    committed_ok = True
    for p, label in ((COMMITTED_JSON, "tables.json"), (COMMITTED_JS, "tables.js")):
        exists = os.path.isfile(p)
        check(f"committed {label} exists at repo root", exists, p)
        committed_ok = committed_ok and exists
    if not committed_ok:
        _finish()
        return

    tmp = tempfile.mkdtemp(prefix="genesis-compile-fresh-")
    try:
        r1 = run_fresh_compile(tmp)
        check("fresh --emit compile of the current Engine table source exits 0 "
              "(safety gate + lint gate both pass)", r1.returncode == 0, _tail(r1))
        fresh_json = os.path.join(tmp, "tables.json")
        fresh_js = os.path.join(tmp, "tables.js")
        json_emitted = os.path.isfile(fresh_json)
        js_emitted = os.path.isfile(fresh_js)
        check("fresh compile emitted tables.json", json_emitted, _tail(r1))
        check("fresh compile emitted tables.js", js_emitted, _tail(r1))

        if json_emitted and js_emitted:
            tmp2 = tempfile.mkdtemp(prefix="genesis-compile-fresh-2-")
            try:
                r2 = run_fresh_compile(tmp2)
                fresh_json2 = os.path.join(tmp2, "tables.json")
                fresh_js2 = os.path.join(tmp2, "tables.js")
                det_json = (r2.returncode == 0 and os.path.isfile(fresh_json2)
                            and sha256(fresh_json2) == sha256(fresh_json))
                det_js = (r2.returncode == 0 and os.path.isfile(fresh_js2)
                          and sha256(fresh_js2) == sha256(fresh_js))
                check("double-compile determinism (tables.json): two independent fresh compiles "
                      "of the SAME source are byte-identical — proves the byte-diff gate below "
                      "is valid (see TIMESTAMP-DIFF-ESCAPE-HATCH in the module docstring)",
                      det_json, _tail(r2))
                check("double-compile determinism (tables.js): same, for the window-global file",
                      det_js, _tail(r2))
            finally:
                shutil.rmtree(tmp2, ignore_errors=True)
        else:
            check("double-compile determinism (tables.json)", False,
                  "skipped — fresh compile produced no output to compare (see the exit-0 check above)")
            check("double-compile determinism (tables.js)", False,
                  "skipped — fresh compile produced no output to compare (see the exit-0 check above)")

        for committed, fresh, emitted, label in (
            (COMMITTED_JSON, fresh_json, json_emitted, "tables.json"),
            (COMMITTED_JS, fresh_js, js_emitted, "tables.js"),
        ):
            name = f"committed {label} matches a FRESH compile of the current Engine table source (byte-identical)"
            if not emitted:
                check(name, False, "fresh compile produced no output — see the exit-0 check above")
                continue
            c_hash, f_hash = sha256(committed), sha256(fresh)
            same = c_hash == f_hash
            detail = "" if same else (
                f"committed sha256={c_hash[:16]} fresh sha256={f_hash[:16]} "
                f"committed_size={os.path.getsize(committed)}B fresh_size={os.path.getsize(fresh)}B "
                f"— STALE. Recompile with: python3 \"Engine/00. _System/compile-tables.py\" --emit"
            )
            check(name, same, detail)
            if not same:
                _print_semantic_summary(committed, fresh)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    _finish()


if __name__ == "__main__":
    main()
