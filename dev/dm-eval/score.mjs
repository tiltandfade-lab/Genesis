/* dev/dm-eval/score.mjs — the DM-CHARTER regression scorer (BATCH3-PLAN unit 12 / BATCH3-GUARDRAILS J2).
   Spec: docs/BATCH3-PLAN.md #12, docs/BATCH3-GUARDRAILS.md J1/J2, docs/DM-CHARTER.md (read-only —
   never edited by this unit; frontier-prose docs are the orchestrator's landing, not this build's).

   A CHECKLIST evaluator over recorded (fixture) DM turns — NOT a live model call. Per J2's ruling:
   "the scorer is a CHECKLIST evaluator (string/shape assertions where possible, a model-graded rubric
   ONLY for voice items, clearly separated so the deterministic part never flakes)." This file is the
   deterministic half. Voice-quality dimensions (tone, tension, "is it good prose") are NOT scored here
   — they need a model reader and are explicitly out of scope for this harness; they're listed in
   `VOICE_ONLY_DIMENSIONS` below so the gap is visible, not silently skipped.

   Scored dimensions (docs/BATCH3-PLAN.md #12's named list, verbatim):
     - neverRollsPlayerDice   — the DM narration never claims to roll dice on the player's behalf.
     - narratesFromRolls      — when the turn carried rolls[], the narration doesn't contradict them
                                 (no fabricated success/fail language the numbers don't support).
     - noCoaching             — no tactical-advice verbs telling the player what to do (DM-CHARTER §3).
     - budget                 — narration length stays inside a sane per-kind ceiling (cost-shape proxy;
                                 real $/token accounting is AUTOMATED-PLAYTEST.md's job, not this one's).
     - secondPersonPcOnly     — narration addresses "you" (the PC); it never speaks the PC's line as
                                 already said/decided, and never free-floats into a second character's
                                 private interior thought (DM-CHARTER §3's "never act/speak AS the PC").
     - honorsBindingMechanics — where the fixture stamps a resolved roll-branch, the DM's rendered text
                                 must match that pre-authored branch text verbatim (ROLL-BRANCHES.md —
                                 the app resolved it locally; the DM does not re-litigate the die).

   Run:  node dev/dm-eval/score.mjs                    → human-readable table + JSON summary written
         node dev/dm-eval/score.mjs --json              → JSON only, to stdout
   Baseline: dev/dm-eval/baseline.json is written (not read) on a normal run; verify-dm-eval.mjs reads
   it back to assert the recorded baseline reproduces exactly (a regression guard on the scorer itself).
*/
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FIXTURE_DIR = join(HERE, "fixtures");

// Dimensions this file does NOT score (needs a model reader) — kept visible, not silently dropped.
export const VOICE_ONLY_DIMENSIONS = [
  "toneRegister",        // grim/severe/hilarious braid, DM-CHARTER §1/§9
  "slowDripPacing",      // §4 revelation chain discipline
  "sensoryQuality",      // §2 show-don't-tell craft
];

// ---- detectors (pure functions: response text/shape -> boolean "clean", + why) ----------------

// Coaching verbs DM-CHARTER §3 explicitly bans ("no 'you could cast X,' no 'try intimidating him'").
const COACH_RE = /\byou should\b|\byou could (cast|try|use)\b|\bi (recommend|suggest)\b|\bbest (move|option|bet) (is|would be)\b|\btry (casting|using|intimidating|persuading)\b|\bwould work best\b/i;

// The DM claiming to roll FOR the player. The app's own synthesized action text is
// "(I roll <skill>: <n>)" — that's the PLAYER's line, not the DM's, so this only inspects `response`.
const DM_ROLLS_FOR_PLAYER_RE = /\bi roll\b.*\bfor you\b|\brolling for you\b|\bi('ll| will) roll\b.*\byou\b/i;

// Narration asserting the PC already said/decided something (violates "never act/speak AS the PC").
// Distinguish from a plain second-person description: this flags the narrator NARRATING the PC's own
// speech/decision as already-done ("you tell the guard...", "you say...", "you decide to...") rather
// than describing what's around them or handing off ("what do you do", "you see/hear/feel").
const SPEAKS_AS_PC_RE = /\byou (tell|say|ask|reply|answer|decide|choose|agree|promise|swear|shout|whisper)\b/i;
// Narrating a claim about the PC's internal feeling as a fact the DM is asserting (vs. describing
// sensation, which is fine) — "I think you feel relieved" / "you feel confident that" is 2nd-guessing
// the player's interiority, not describing environment.
const ASSERTS_PC_INTERIORITY_RE = /\bi think you feel\b|\byou feel (relieved|confident|certain|sure) that\b/i;

function detectNeverRollsPlayerDice(fx) {
  const text = fx.response.narration || "";
  const clean = !DM_ROLLS_FOR_PLAYER_RE.test(text);
  return { clean, why: clean ? null : "narration claims to roll dice on the player's behalf" };
}

function detectNarratesFromRolls(fx) {
  const rolls = fx.turn.rolls || [];
  if (rolls.length === 0) return { clean: true, why: null, skipped: true }; // nothing to contradict
  const text = (fx.response.narration || "").toLowerCase();
  // Crude but deterministic contradiction check: a roll fixture stamped natural:1 (fumble) or a very
  // low total narrated as an unambiguous clean success (or vice versa for a very high total narrated
  // as failure) is a contradiction. We only flag the unambiguous cases — anything else needs a human.
  const worstRoll = rolls.reduce((min, r) => (typeof r.total === "number" && r.total < min ? r.total : min), Infinity);
  const bestNat = rolls.some((r) => r.natural === 20);
  const worstNat = rolls.some((r) => r.natural === 1);
  const claimsCleanSuccess = /\bclean(ly)?\b|\bwithout (a hitch|trouble)\b|\bperfectly\b/i.test(text);
  const claimsCleanFailure = /\bfail(s|ed)? outright\b|\bnothing happens\b|\bfumble(s|d)?\b/i.test(text);
  let clean = true, why = null;
  if (worstNat && claimsCleanSuccess && !bestNat) { clean = false; why = "a natural 1 was narrated as a clean success"; }
  if (bestNat && claimsCleanFailure && !worstNat) { clean = false; why = "a natural 20 was narrated as a clean failure"; }
  return { clean, why };
}

function detectNoCoaching(fx) {
  const text = fx.response.narration || "";
  const clean = !COACH_RE.test(text);
  return { clean, why: clean ? null : "narration coaches the player's tactics/method (DM-CHARTER §3)" };
}

// Budget: a sane per-kind word-count ceiling — a cost/latency SHAPE proxy for this static harness.
// Real $ /token measurement is AUTOMATED-PLAYTEST.md's job (a live-session instrument); this is just
// "did the fixture's DM turn stay in a plausible beat-length band," per DM-CHARTER §2 ("no default
// beat length... never pad to a template") — so the ceiling is generous, catching only a runaway wall
// of text, not judging prose quality.
const BUDGET_WORD_CEILING = 220;
function detectBudget(fx) {
  const words = (fx.response.narration || "").trim().split(/\s+/).filter(Boolean).length;
  const clean = words <= BUDGET_WORD_CEILING;
  return { clean, why: clean ? null : `narration ran ${words} words (ceiling ${BUDGET_WORD_CEILING})`, words };
}

function detectSecondPersonPcOnly(fx) {
  const text = fx.response.narration || "";
  const speaksAsPc = SPEAKS_AS_PC_RE.test(text);
  const assertsInteriority = ASSERTS_PC_INTERIORITY_RE.test(text);
  const clean = !speaksAsPc && !assertsInteriority;
  const why = clean ? null
    : speaksAsPc ? "narration speaks/decides AS the PC instead of handing off (DM-CHARTER §3)"
    : "narration asserts the PC's interior feeling as settled fact instead of describing sensation";
  return { clean, why };
}

// Closed-menu detector, tied to the same clause family (§3's "default OFF" three-option rule) — folded
// into secondPersonPcOnly's "never decide FOR the player" spirit via a companion check surfaced in the
// per-fixture report (not a separate top-level dimension — BATCH3-PLAN names exactly 6 dimensions).
function detectClosedMenu(fx) {
  const ask = fx.response.ask;
  if (!ask) return { clean: true, why: null, skipped: true };
  const isClosedMenu = Array.isArray(ask.options) && ask.options.length > 0 && ask.orElse !== true;
  return { clean: !isClosedMenu, why: isClosedMenu ? "closed option menu with no 'or something else' (default OFF per DM-CHARTER §3)" : null };
}

function detectHonorsBindingMechanics(fx) {
  if (!fx.resolvedBranch) return { clean: true, why: null, skipped: true };
  const clean = (fx.response.narration || "").trim() === fx.resolvedBranch.branchText.trim();
  return { clean, why: clean ? null : "rendered narration does not match the pre-authored roll-branch text verbatim" };
}

const DETECTORS = {
  neverRollsPlayerDice: detectNeverRollsPlayerDice,
  narratesFromRolls: detectNarratesFromRolls,
  noCoaching: detectNoCoaching,
  budget: detectBudget,
  secondPersonPcOnly: detectSecondPersonPcOnly,
  honorsBindingMechanics: detectHonorsBindingMechanics,
};

// companion (non-gating today, surfaced for visibility — see detectClosedMenu comment)
const COMPANION_DETECTORS = { closedMenu: detectClosedMenu };

export function loadFixtures() {
  return readdirSync(FIXTURE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(FIXTURE_DIR, f), "utf-8")) }));
}

export function scoreFixture(fx) {
  const results = {};
  for (const [dim, fn] of Object.entries(DETECTORS)) results[dim] = fn(fx);
  const companion = {};
  for (const [dim, fn] of Object.entries(COMPANION_DETECTORS)) companion[dim] = fn(fx);
  const gatingDims = Object.keys(DETECTORS);
  const failedDims = gatingDims.filter((d) => results[d].clean === false);
  return { id: fx.id, kind: fx.kind, results, companion, failedDims, pass: failedDims.length === 0 };
}

export function scoreAll(fixtures) {
  return fixtures.map(({ data }) => scoreFixture(data));
}

function main() {
  const asJson = process.argv.includes("--json");
  const fixtures = loadFixtures();
  const scored = scoreAll(fixtures);

  // cross-check each fixture's own `expect` block against what the detectors actually found — this is
  // what makes the negative-control fixture (#10) load-bearing: if a detector's regex regresses to a
  // no-op, fixture #10's expect:false claims stop matching and THIS check goes red.
  const expectMismatches = [];
  fixtures.forEach(({ data }) => {
    const s = scored.find((x) => x.id === data.id);
    if (!data.expect) return;
    for (const [dim, expected] of Object.entries(data.expect)) {
      const got = s.results[dim] ? s.results[dim].clean : null;
      if (got !== expected) expectMismatches.push({ id: data.id, dim, expected, got });
    }
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    fixtureCount: fixtures.length,
    passCount: scored.filter((s) => s.pass).length,
    failCount: scored.filter((s) => !s.pass).length,
    expectMismatchCount: expectMismatches.length,
    expectMismatches,
    fixtures: scored,
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
  } else {
    console.log(`DM-EVAL — ${fixtures.length} fixtures scored\n`);
    for (const s of scored) {
      const mark = s.pass ? "PASS" : "FAIL";
      console.log(`  [${mark}] ${s.id} (${s.kind})`);
      if (!s.pass) for (const d of s.failedDims) console.log(`         ✗ ${d}: ${s.results[d].why}`);
    }
    console.log(`\n${summary.passCount}/${summary.fixtureCount} clean; expect-mismatches: ${summary.expectMismatchCount}`);
    if (expectMismatches.length) {
      console.log("\nEXPECT MISMATCHES (fixture's declared `expect` vs. detector output — a scorer regression):");
      for (const m of expectMismatches) console.log(`  ${m.id}.${m.dim}: expected clean=${m.expected}, detector said clean=${m.got}`);
    }
  }

  writeFileSync(join(HERE, "baseline.json"), JSON.stringify(summary, null, 2));
  return summary;
}

// only run main() when invoked directly (so verify-dm-eval.mjs can import the pure functions)
if (import.meta.url === `file://${process.argv[1]}`) {
  const summary = main();
  process.exit(summary.expectMismatchCount === 0 ? 0 : 1);
}
