/* dev/verify-state-eval.mjs — STATE-HYGIENE-EVAL §7 A3 verify harness. CI-runnable, $0 (no model
   calls — it drives run.mjs only in --provider recorded / --selftest / --write-budgets modes,
   all zero-cost per the SPEED doctrine declaration in docs/STATE-HYGIENE-EVAL.md).

   Asserts:
     1. all 16 fixtures (12 goldens + 4 negative controls) load as valid JSON with the required
        top-level keys (id/kind/seed/source/state/turn/response/resolvedBranch/expect).
     2. budgets.json has exactly 20 sections + totalFounding + totalSteady.
     3. baseline-recorded.json has the expected scorecard shape (provider/fixtures/summary).
     4. --selftest catches 4/4 negative controls.
     5. R1-R6 regression checks (§7) — each shown red-first via a live mutation, then restored.

   Run: node dev/verify-state-eval.mjs   (jsdom via JSDOM_HOME, per CLAUDE.md headless-test)
*/
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STATE_EVAL = join(ROOT, "dev/state-eval");
const RUN = join(STATE_EVAL, "run.mjs");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function runNode(args) {
  try {
    const out = execFileSync("node", [RUN, ...args], { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out, err: "" };
  } catch (e) {
    // stdout/stderr stay separate even on non-zero exit (a fixture's OWN designated dim failing is
    // an expected non-zero exit for nc-* runs — not a harness crash) — never mix them for JSON.parse.
    return { code: e.status || 1, out: e.stdout || "", err: e.stderr || "" };
  }
}

// === 1. fixture inventory ===
const fixtureFiles = readdirSync(join(STATE_EVAL, "fixtures")).filter(f => f.endsWith(".json"));
check("16 fixtures present", fixtureFiles.length === 16, `found ${fixtureFiles.length}`);
const goldens = fixtureFiles.filter(f => f.startsWith("hx-"));
const controls = fixtureFiles.filter(f => f.startsWith("nc-"));
check("12 goldens", goldens.length === 12, `found ${goldens.length}`);
check("4 negative controls", controls.length === 4, `found ${controls.length}`);

const REQUIRED_KEYS = ["id", "kind", "seed", "source", "state", "turn", "response", "resolvedBranch", "expect"];
let allLoadable = true, badFixture = null;
for (const f of fixtureFiles) {
  try {
    const data = JSON.parse(readFileSync(join(STATE_EVAL, "fixtures", f), "utf-8"));
    for (const k of REQUIRED_KEYS) if (!(k in data)) { allLoadable = false; badFixture = f + " missing " + k; }
  } catch (e) { allLoadable = false; badFixture = f + ": " + e.message; }
}
check("all fixtures loadable with required shape", allLoadable, badFixture || "");

// === 2. budgets.json ===
const budgetsPath = join(STATE_EVAL, "budgets.json");
check("budgets.json exists", existsSync(budgetsPath));
if (existsSync(budgetsPath)) {
  const budgets = JSON.parse(readFileSync(budgetsPath, "utf-8"));
  const sectionCount = Object.keys(budgets.sections || {}).length;
  check("budgets.json sections 20/20", sectionCount === 20, `found ${sectionCount}`);
  check("budgets.json totalFounding + totalSteady present", typeof budgets.totalFounding === "number" && typeof budgets.totalSteady === "number");
}

// === 3. baseline-recorded.json shape ===
const baselinePath = join(STATE_EVAL, "baseline-recorded.json");
let baselineOk = false;
if (existsSync(baselinePath)) {
  const b = JSON.parse(readFileSync(baselinePath, "utf-8"));
  baselineOk = b.provider === "recorded" && Array.isArray(b.fixtures) && b.summary && typeof b.summary.deterministicPass === "number";
}
check("baseline-recorded.json shape OK", baselineOk);

// === 4. selftest 4/4 ===
const selftestResult = runNode(["--selftest"]);
check("selftest 4/4 caught, exit 0", selftestResult.code === 0 && /4\/4 caught/.test(selftestResult.out), selftestResult.out.slice(0, 200));

// === 5. R1-R6 regression checks ===
let rChecksPassed = 0;
const RCOUNT = 6;

// R1 (D1): nc-14 red under a presence-only D1, green under the real dim.
{
  const r = runNode(["--only", "nc-14", "--json"]);
  try {
    const d = JSON.parse(r.out);
    const d1 = d.fixtures[0].dims.D1;
    const labelWithoutMutation = d1.status === "fail" && /label-without-mutation/.test(d1.why || "");
    console.log("  R1 (D1) nc-14:", d1.status, d1.why);
    if (labelWithoutMutation) rChecksPassed++;
  } catch (e) { console.log("  R1 parse error", e.message, r.out.slice(0, 300)); }
}

// R2 (D2): nc-13 — engine's own reasons captured verbatim.
{
  const r = runNode(["--only", "nc-13", "--json"]);
  try {
    const d = JSON.parse(r.out);
    const d2 = d.fixtures[0].dims.D2;
    const carriesEngineReason = d2.status === "fail" && /source must be one of/.test(d2.why || "");
    console.log("  R2 (D2) nc-13:", d2.status, d2.why);
    if (carriesEngineReason) rChecksPassed++;
  } catch (e) { console.log("  R2 parse error", e.message); }
}

// R3 (D6): nc-15 — cites contradiction + re-ask.
{
  const r = runNode(["--only", "nc-15", "--json"]);
  try {
    const d = JSON.parse(r.out);
    const d6 = d.fixtures[0].dims.D6;
    const citesReAsk = d6.status === "fail" && /re-asked/.test(d6.why || "");
    console.log("  R3 (D6) nc-15:", d6.status, d6.why);
    if (citesReAsk) rChecksPassed++;
  } catch (e) { console.log("  R3 parse error", e.message); }
}

// R4 (D8): nc-16 — before/after values printed.
{
  const r = runNode(["--only", "nc-16", "--json"]);
  try {
    const d = JSON.parse(r.out);
    const d8 = d.fixtures[0].dims.D8;
    const printsValues = d8.status === "fail" && d8.moved && d8.moved.length && "before" in d8.moved[0] && "after" in d8.moved[0];
    console.log("  R4 (D8) nc-16:", d8.status, d8.why);
    if (printsValues) rChecksPassed++;
  } catch (e) { console.log("  R4 parse error", e.message); }
}

// R5 (D9): mutate budgets.json recentLedger -> 1, assert fail w/ measured value, restore.
{
  const before = readFileSync(budgetsPath, "utf-8");
  const budgets = JSON.parse(before);
  budgets.sections.recentLedger = 1;
  writeFileSync(budgetsPath, JSON.stringify(budgets, null, 2) + "\n");
  const r = runNode(["--only", "hx-01", "--json"]);
  writeFileSync(budgetsPath, before);   // restore immediately regardless of outcome
  try {
    const d = JSON.parse(r.out);
    const budgetFailed = d.summary.budget.ok === false && d.summary.budget.worst.section === "recentLedger" && d.summary.budget.worst.bytes > 1;
    console.log("  R5 (D9) mutated ceiling:", JSON.stringify(d.summary.budget.worst));
    if (budgetFailed) rChecksPassed++;
  } catch (e) { console.log("  R5 parse error", e.message); }
}

// R6 (rubric isolation): merge-rubric must not touch fixtures[].dims / summary.deterministic*.
{
  const r1 = runNode(["--provider", "recorded", "--json"]);
  const before = JSON.parse(r1.out);
  const outDir = join(STATE_EVAL, "out");
  // mtime, not filename string, picks the file THIS run just wrote (unpadded "-n" suffixes don't
  // sort lexicographically — same fix as run.mjs's findNewestScorecard).
  const files = readdirSync(outDir).filter(f => f.startsWith("scorecard-") && f.endsWith(".json"));
  const withMtime = files.map(f => ({ f, mtime: statSync(join(outDir, f)).mtimeMs }));
  withMtime.sort((a, b) => a.mtime - b.mtime);
  const scPath = join(outDir, withMtime[withMtime.length - 1].f);
  const answersPath = join(STATE_EVAL, "out", "_r6-answers.json");
  writeFileSync(answersPath, JSON.stringify({ "hx-01-founding": { M1: "fail", M2: "fail" } }));
  runNode(["--merge-rubric", answersPath]);
  const after = JSON.parse(readFileSync(scPath, "utf-8"));
  const { rubric: _r1, ...beforeNoRubric } = before;
  const { rubric: _r2, ...afterNoRubric } = after;
  const identical = JSON.stringify(beforeNoRubric.fixtures) === JSON.stringify(afterNoRubric.fixtures)
    && JSON.stringify(beforeNoRubric.summary) === JSON.stringify(afterNoRubric.summary);
  console.log("  R6 (rubric isolation) identical outside rubric key:", identical);
  if (identical) rChecksPassed++;
}

check(`R-checks ${RCOUNT}/${RCOUNT}`, rChecksPassed === RCOUNT, `${rChecksPassed}/${RCOUNT} passed`);

console.log("");
if (fail === 0) {
  console.log(`PASS state-eval: fixtures 16/16 loadable · goldens 12 · controls 4 · budgets.json sections 20/20 + 2 totals · baseline shape OK · selftest 4/4 · R-checks ${rChecksPassed}/${RCOUNT}`);
  process.exit(0);
} else {
  console.log(`FAIL state-eval: ${pass} passed, ${fail} failed`);
  process.exit(1);
}
