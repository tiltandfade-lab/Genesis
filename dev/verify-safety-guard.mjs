/* verify-safety-guard.mjs — headless test for the SAFETY-GUARD compile gate
   (docs/BREACH.md §2e.9, docs/BATCH3-PLAN.md unit 7, docs/BATCH3-GUARDRAILS.md J1:
   "safety-guard: the denylist gate FAILS a seeded test fixture (shown red)").

   The gate lives in `Engine/00. _System/compile-tables.py` (safety_scan(), run before any table
   parsing) + its denylist file `build/safety-denylist.json`. A hit on any denylisted term ABORTS
   the compile (non-zero exit, tables.json/tables.js NOT written), regardless of --emit.

   This harness drives the REAL compiler as a subprocess (python3) against REAL source roots
   (Engine/03. _Tables) with a planted, then-removed fixture file — never a mock of the gate logic.

   Enumerated assertions:
   1. Clean compile (no fixture) exits 0 — the gate is silent on real source (no false positive).
   2. Clean compile does NOT print "SAFETY GATE FAILED".
   3. Planting a denylisted term in a fixture table under the real scan root -> compile exits
      NON-ZERO ("REPORT" mode too, not just --emit).
   4. The failing run's stdout names the offending file + term ("SAFETY GATE FAILED").
   5. --emit with the fixture planted does NOT write/modify tables.json (mtime/hash unchanged) —
      the abort happens before any write.
   6. Removing the fixture (RESTORE) -> compile exits 0 again — the gate is state-based on
      CURRENT source, not sticky.
   7. A term appearing only as a substring of another word (no word-boundary match) does NOT
      trip the gate — false-positive guard on the word-boundary regex.
   8. MUTATION CHECK (shown RED then restored): point the gate at a denylist file with an EMPTY
      terms list (simulating "denylist check removed/neutered") — confirm the same planted
      fixture now compiles CLEAN (the gate's absence is observably dangerous == the guard is
      load-bearing); restore the real denylist, confirm the fixture (still planted) fails again;
      remove the fixture, confirm clean.
   9. Missing denylist file entirely -> compiler does not crash (loads empty list, gate no-ops) —
      the null-safe path a repo clone without the file would hit.
   10. Regression: `python3 build/check-manifest.py` still exits 0 (the gate lives in the
       compiler, not the manifest checker — no cross-wiring regression).

   Run:  node dev/verify-safety-guard.mjs   (no jsdom needed — this is a Python subprocess harness) */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMPILER = join(ROOT, "Engine", "00. _System", "compile-tables.py");
const DENYLIST = join(ROOT, "build", "safety-denylist.json");
const FIXTURE_DIR = join(ROOT, "Engine", "03. _Tables", "99. _Scratch-Safety-Guard-Test");
const FIXTURE = join(FIXTURE_DIR, "fixture.md");
const TABLES_JSON = join(ROOT, "tables.json");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function runCompiler(args = []) {
  try {
    const out = execFileSync("python3", [COMPILER, ...args], { cwd: ROOT, encoding: "utf-8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status == null ? 1 : e.status, out: (e.stdout || "") + (e.stderr || "") };
  }
}
function plantFixture(term) {
  mkdirSync(FIXTURE_DIR, { recursive: true });
  writeFileSync(FIXTURE, `---\ntype: table\nid: safety-fixture-test\n---\n| d2 | Text |\n| --- | --- |\n| 1-2 | this row contains ${term} and should trip the gate |\n`, "utf-8");
}
function removeFixture() {
  rmSync(FIXTURE_DIR, { recursive: true, force: true });
}
function readDenylist() { return JSON.parse(readFileSync(DENYLIST, "utf-8")); }
function writeDenylist(obj) { writeFileSync(DENYLIST, JSON.stringify(obj, null, 2), "utf-8"); }

const originalDenylist = readFileSync(DENYLIST, "utf-8");
const realTerms = readDenylist().terms;
if (!realTerms || !realTerms.length) {
  console.log("  ✗ setup — build/safety-denylist.json has no terms to test against; aborting harness");
  process.exit(2);
}
const FIXTURE_TERM = realTerms[0];

try {
  // ---- 1/2: clean baseline (no fixture) ----
  removeFixture();
  {
    const r = runCompiler([]);
    check("1. clean compile (no fixture) exits 0", r.code === 0, "code=" + r.code + " out=" + r.out.slice(0, 200));
    check("2. clean compile prints no SAFETY GATE FAILED", !r.out.includes("SAFETY GATE FAILED"));
  }

  // ---- 3/4: plant fixture, expect fail ----
  plantFixture(FIXTURE_TERM);
  {
    const r = runCompiler([]); // report mode, not just --emit
    check("3. compile with a planted denylisted term exits NON-ZERO (report mode too)", r.code !== 0, "code=" + r.code);
    check("4. failing stdout names the offending file + term", r.out.includes("SAFETY GATE FAILED") && r.out.includes(FIXTURE_TERM) && r.out.includes("fixture.md"), r.out.slice(0, 300));
  }

  // ---- 5: --emit with fixture planted must not write tables.json ----
  {
    const before = existsSync(TABLES_JSON) ? statSync(TABLES_JSON).mtimeMs : null;
    const r = runCompiler(["--emit"]);
    const after = existsSync(TABLES_JSON) ? statSync(TABLES_JSON).mtimeMs : null;
    check("5. --emit with fixture planted does not touch tables.json (abort before write)",
      r.code !== 0 && before === after, "before=" + before + " after=" + after + " code=" + r.code);
  }

  // ---- 6: restore, expect clean ----
  removeFixture();
  {
    const r = runCompiler([]);
    check("6. removing the fixture restores a clean (exit 0) compile", r.code === 0, "code=" + r.code);
  }

  // ---- 7: substring (no word boundary) must NOT trip the gate ----
  plantFixture("xx" + FIXTURE_TERM + "yy");
  {
    const r = runCompiler([]);
    check("7. a term only present as a substring (no word boundary) does not trip the gate", r.code === 0 && !r.out.includes("SAFETY GATE FAILED"), "code=" + r.code);
  }
  removeFixture();

  // ---- 8: MUTATION CHECK — neuter the denylist (empty terms), confirm the fixture now compiles
  // clean (RED — the guard's absence is dangerous), then restore + reconfirm it fails, then clean up ----
  plantFixture(FIXTURE_TERM);
  {
    const parsed = readDenylist();
    writeDenylist({ ...parsed, terms: [] }); // neuter
    const rNeutered = runCompiler([]);
    check("8a. MUTATION (denylist neutered) — planted fixture now compiles CLEAN (RED: the guard was load-bearing)",
      rNeutered.code === 0, "code=" + rNeutered.code + " — expected 0 while neutered");

    writeFileSync(DENYLIST, originalDenylist, "utf-8"); // restore
    const rRestored = runCompiler([]);
    check("8b. RESTORED denylist — the same still-planted fixture fails again (GREEN)",
      rRestored.code !== 0, "code=" + rRestored.code);
  }
  removeFixture();
  {
    const r = runCompiler([]);
    check("8c. cleanup — fixture removed, compile clean again", r.code === 0);
  }

  // ---- 9: missing denylist file entirely -> no crash, gate no-ops ----
  {
    const backup = readFileSync(DENYLIST, "utf-8");
    rmSync(DENYLIST);
    const r = runCompiler([]);
    writeFileSync(DENYLIST, backup, "utf-8"); // restore immediately regardless of outcome
    check("9. missing denylist file -> compiler does not crash, gate no-ops (exit 0)", r.code === 0, "code=" + r.code + " out=" + r.out.slice(0, 200));
  }

  // ---- 10: regression — check-manifest.py still exits 0 ----
  {
    let code = 0;
    try { execFileSync("python3", [join(ROOT, "build", "check-manifest.py")], { cwd: ROOT, encoding: "utf-8" }); }
    catch (e) { code = e.status == null ? 1 : e.status; }
    check("10. regression: python3 build/check-manifest.py still exits 0", code === 0, "code=" + code);
  }

} finally {
  // belt-and-suspenders cleanup no matter what failed above
  removeFixture();
  if (readFileSync(DENYLIST, "utf-8") !== originalDenylist) writeFileSync(DENYLIST, originalDenylist, "utf-8");
}

console.log(`\nSAFETY-GUARD: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
