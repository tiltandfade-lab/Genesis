/* Verify dev/dm-eval/ — the DM-CHARTER regression scorer (BATCH3-PLAN unit 12, BATCH3-GUARDRAILS J1/J2).
   No jsdom needed — the scorer is pure Node over fixture JSON, no app modules loaded.

   Asserts:
     1. exactly 10 fixtures exist, covering the BATCH3-PLAN-named kinds (combat, social, walk,
        arrival-drift, morale, branch, gen-tease, lull) plus the extra mythic-crit + negative-control.
     2. scoreAll() runs clean: every fixture's declared `expect` matches what its detectors found
        (0 expectMismatches) — this is what proves the negative-control fixture is load-bearing.
     3. the 9 non-negative-control fixtures all score `pass:true`; the negative control scores
        `pass:false` with all of its designed-to-fail dimensions actually failing.
     4. baseline.json is written by a scorer run and is valid JSON with the expected shape.
     5. MUTATION CHECKS (shown RED then restored) — temporarily corrupt each of the three prose-
        bearing detector regexes (coaching / rolls-for-player / speaks-as-PC) by monkeypatching the
        scorer's exported regex source is not possible (they're module-local consts), so instead we
        mutate the FIXTURE the detector is supposed to catch — feed the negative-control's violating
        phrase into a "clean" fixture's narration copy in-memory and confirm the same detector that
        passed the clean original now fires red on the mutated copy. Restores nothing on disk (all
        mutation happens on in-memory clones); the on-disk fixtures are never touched.

   Run:  node dev/verify-dm-eval.mjs
*/
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadFixtures, scoreFixture, scoreAll } from "./dm-eval/score.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const fixtures = loadFixtures();

// === 1. fixture inventory ===
check("exactly 10 fixtures present", fixtures.length === 10, `found ${fixtures.length}`);

const NAMED_KINDS = ["combat", "social", "walk", "arrival-drift", "morale", "branch", "gen-tease", "lull"];
const kinds = fixtures.map((f) => f.data.kind);
for (const k of NAMED_KINDS) {
  check(`fixture kind '${k}' present (BATCH3-PLAN #12's named list)`, kinds.includes(k), kinds.join(","));
}
check("extra mythic-crit fixture present", kinds.includes("mythic-crit"));
check("negative-control fixture present", kinds.includes("negative-control"));

// === 2. scorer runs clean against its own fixtures' declared expectations ===
const scored = scoreAll(fixtures);
const gatingDims = ["neverRollsPlayerDice", "narratesFromRolls", "noCoaching", "budget", "secondPersonPcOnly", "honorsBindingMechanics"];
let expectMismatches = 0;
fixtures.forEach(({ data }) => {
  const s = scored.find((x) => x.id === data.id);
  if (!data.expect) return;
  for (const [dim, expected] of Object.entries(data.expect)) {
    if (s.results[dim].clean !== expected) expectMismatches++;
  }
});
check("0 expect-mismatches across all fixtures (detectors match declared expectations)", expectMismatches === 0, `${expectMismatches} mismatches`);

// === 3. pass/fail shape ===
const clean = scored.filter((s) => s.kind !== "negative-control");
const negControl = scored.find((s) => s.kind === "negative-control");
check("all 9 non-negative-control fixtures score pass:true", clean.every((s) => s.pass), clean.filter((s) => !s.pass).map((s) => s.id).join(","));
check("negative-control fixture scores pass:false", negControl && negControl.pass === false);
check("negative-control fails neverRollsPlayerDice", negControl && negControl.failedDims.includes("neverRollsPlayerDice"));
check("negative-control fails noCoaching", negControl && negControl.failedDims.includes("noCoaching"));
check("negative-control fails secondPersonPcOnly", negControl && negControl.failedDims.includes("secondPersonPcOnly"));
check("negative-control fails narratesFromRolls", negControl && negControl.failedDims.includes("narratesFromRolls"));

// === 4. baseline.json written ===
const baselinePath = join(ROOT, "dev/dm-eval/baseline.json");
check("baseline.json exists after a scorer run", existsSync(baselinePath));
if (existsSync(baselinePath)) {
  const baseline = JSON.parse(readFileSync(baselinePath, "utf-8"));
  check("baseline.json has fixtureCount:10", baseline.fixtureCount === 10, baseline.fixtureCount);
  check("baseline.json records passCount/failCount", typeof baseline.passCount === "number" && typeof baseline.failCount === "number");
}

// === 5. MUTATION CHECKS — shown RED then restored (in-memory clones only; on-disk fixtures untouched) ===
// 5a. coaching detector: take a clean fixture (01-combat), inject a coaching phrase, confirm it now fails.
{
  const cleanFx = JSON.parse(JSON.stringify(fixtures.find((f) => f.data.id === "01-combat").data));
  const before = scoreFixture(cleanFx);
  check("[pre-mutation] 01-combat noCoaching is clean", before.results.noCoaching.clean === true);
  cleanFx.response.narration += " You should probably cast Bless now.";
  const mutated = scoreFixture(cleanFx);
  check("[MUTATION RED] injecting a coaching phrase flips noCoaching to dirty", mutated.results.noCoaching.clean === false, JSON.stringify(mutated.results.noCoaching));
  // "restore": re-score the untouched original object (no on-disk mutation ever happened) to confirm clean again
  const restored = scoreFixture(fixtures.find((f) => f.data.id === "01-combat").data);
  check("[restored] 01-combat noCoaching clean again from the untouched fixture", restored.results.noCoaching.clean === true);
}

// 5b. rolls-for-player detector: take 02-social, inject "I roll for you", confirm it now fails.
{
  const cleanFx = JSON.parse(JSON.stringify(fixtures.find((f) => f.data.id === "02-social").data));
  const before = scoreFixture(cleanFx);
  check("[pre-mutation] 02-social neverRollsPlayerDice is clean", before.results.neverRollsPlayerDice.clean === true);
  cleanFx.response.narration = "I roll for you: 17. " + cleanFx.response.narration;
  const mutated = scoreFixture(cleanFx);
  check("[MUTATION RED] injecting 'I roll for you' flips neverRollsPlayerDice to dirty", mutated.results.neverRollsPlayerDice.clean === false, JSON.stringify(mutated.results.neverRollsPlayerDice));
  const restored = scoreFixture(fixtures.find((f) => f.data.id === "02-social").data);
  check("[restored] 02-social neverRollsPlayerDice clean again from the untouched fixture", restored.results.neverRollsPlayerDice.clean === true);
}

// 5c. speaks-as-PC detector: take 08-lull, inject "you tell her", confirm it now fails.
{
  const cleanFx = JSON.parse(JSON.stringify(fixtures.find((f) => f.data.id === "08-lull").data));
  const before = scoreFixture(cleanFx);
  check("[pre-mutation] 08-lull secondPersonPcOnly is clean", before.results.secondPersonPcOnly.clean === true);
  cleanFx.response.narration += " You tell her everything will be fine.";
  const mutated = scoreFixture(cleanFx);
  check("[MUTATION RED] injecting 'you tell her' flips secondPersonPcOnly to dirty", mutated.results.secondPersonPcOnly.clean === false, JSON.stringify(mutated.results.secondPersonPcOnly));
  const restored = scoreFixture(fixtures.find((f) => f.data.id === "08-lull").data);
  check("[restored] 08-lull secondPersonPcOnly clean again from the untouched fixture", restored.results.secondPersonPcOnly.clean === true);
}

// 5d. honorsBindingMechanics detector: take 06-branch, diverge the rendered text from the branch, confirm dirty.
{
  const cleanFx = JSON.parse(JSON.stringify(fixtures.find((f) => f.data.id === "06-branch").data));
  const before = scoreFixture(cleanFx);
  check("[pre-mutation] 06-branch honorsBindingMechanics is clean", before.results.honorsBindingMechanics.clean === true);
  cleanFx.response.narration = "You haul yourself up cleanly, no trouble at all.";
  const mutated = scoreFixture(cleanFx);
  check("[MUTATION RED] diverging from the pre-authored branch text flips honorsBindingMechanics to dirty", mutated.results.honorsBindingMechanics.clean === false, JSON.stringify(mutated.results.honorsBindingMechanics));
  const restored = scoreFixture(fixtures.find((f) => f.data.id === "06-branch").data);
  check("[restored] 06-branch honorsBindingMechanics clean again from the untouched fixture", restored.results.honorsBindingMechanics.clean === true);
}

// 5e. budget detector: take 08-lull, inflate narration past the ceiling, confirm dirty.
{
  const cleanFx = JSON.parse(JSON.stringify(fixtures.find((f) => f.data.id === "08-lull").data));
  const before = scoreFixture(cleanFx);
  check("[pre-mutation] 08-lull budget is clean", before.results.budget.clean === true);
  cleanFx.response.narration += (" filler word").repeat(250);
  const mutated = scoreFixture(cleanFx);
  check("[MUTATION RED] inflating narration past the word ceiling flips budget to dirty", mutated.results.budget.clean === false, JSON.stringify(mutated.results.budget));
  const restored = scoreFixture(fixtures.find((f) => f.data.id === "08-lull").data);
  check("[restored] 08-lull budget clean again from the untouched fixture", restored.results.budget.clean === true);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
