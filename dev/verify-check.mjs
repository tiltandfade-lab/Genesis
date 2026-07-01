/* Verify the CHECK/SAVE SPINE (docs/SRD-MECHANIZATION.md §1) — pure Node (no DOM needed; the module is
   math over plain args). Evals the real engine files in a shared scope so the top-level consts/functions
   resolve exactly as in-app.
     - margin-ladder boundaries (nat1 / nat20, −1/−2 near-miss, ≥+10 resounding, −10 severe)
     - proficiency application from skillProfs / saveProfs; ability check has none
     - dmRollFor PARITY (same aMod + prof inputs → same total, so the Bridge path doesn't regress)
     - spellSaveDC math (8 + pb + spellAbility mod)
     - Heroic Inspiration: grant sets the flag (no-stack), spend clears + authorizes, reroll replaces (RAW)
     - exhaustion penalty folds into every caller (−2 × level)

   Run:  node dev/verify-check.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

// SKILL_ABILITY lives in data/srd-creator.js (which pulls in other creator data). For a pure-math
// harness we only need that one const — lift it verbatim from the source so it can never drift.
const SKILL_ABILITY_SRC = "const " + read("data/srd-creator.js").match(/SKILL_ABILITY=\{[^}]*\};/)[0];

const ctx = { console };
vm.createContext(ctx);
// core.js gives rollDie/pick; combat.js gives cmRollD20; check.js is the SUT.
vm.runInContext(SKILL_ABILITY_SRC + "\n" + read("src/engine/core.js") + "\n" +
  read("src/engine/combat.js") + "\n" + read("src/engine/check.js") +
  "\n;globalThis.__api={resolveCheck,checkDegree,resolveSkillCheck,resolveSaveCheck,resolveAbilityCheck," +
  "spellSaveDC,spellAttackBonus,grantInspiration,hasInspiration,spendInspiration};", ctx);
const A = ctx.__api;

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── A. margin ladder (checkDegree pure) ─────────────────────────────────────────
check("degree: nat 20 → crit-success (even on a big miss margin)", A.checkDegree(-30, 20) === "crit-success");
check("degree: nat 1 → crit-failure (even on a big hit margin)", A.checkDegree(30, 1) === "crit-failure");
check("degree: margin +10 → crit-success (resounding)", A.checkDegree(10, 14) === "crit-success");
check("degree: margin +9 → success (not yet resounding)", A.checkDegree(9, 14) === "success");
check("degree: margin 0 → success", A.checkDegree(0, 10) === "success");
check("degree: margin −1 → near-miss (tight grace)", A.checkDegree(-1, 10) === "near-miss");
check("degree: margin −2 → near-miss (tight grace edge)", A.checkDegree(-2, 10) === "near-miss");
check("degree: margin −3 → failure (NOT near-miss — a −3 bites)", A.checkDegree(-3, 10) === "failure");
check("degree: margin −5 → failure (the calibration rule: a −5 is a real miss)", A.checkDegree(-5, 10) === "failure");
check("degree: margin −9 → failure", A.checkDegree(-9, 10) === "failure");
check("degree: margin −10 → crit-failure (severe)", A.checkDegree(-10, 10) === "crit-failure");

// ── B. resolveCheck math + success flag ─────────────────────────────────────────
const r1 = A.resolveCheck({ d20: 12, abilityMod: 3, proficient: true, proficiency: 2, dc: 15 });
check("resolveCheck: 12+3+2 = 17 vs DC 15 → success, margin +2", r1.total === 17 && r1.success && r1.margin === 2 && r1.degree === "success");
const r2 = A.resolveCheck({ d20: 5, abilityMod: 0, dc: 15 });
check("resolveCheck: 5 vs DC 15 → fail, margin −10 → crit-failure", r2.success === false && r2.margin === -10 && r2.degree === "crit-failure");
check("resolveCheck: nat 20 always succeeds (total < DC)", A.resolveCheck({ d20: 20, abilityMod: -20, dc: 15 }).success === true);
check("resolveCheck: nat 1 always fails (total ≥ DC)", A.resolveCheck({ d20: 1, abilityMod: 40, dc: 15 }).success === false);
check("resolveCheck: proficient:false ignores proficiency", A.resolveCheck({ d20: 10, proficient: false, proficiency: 5, dc: 10 }).total === 10);

// ── C. thin callers — proficiency from the sheet ────────────────────────────────
const sh = { mods: { str: 3, dex: 1, con: 2, int: 0, wis: 2, cha: -1 }, profBonus: 3,
  skillProfs: ["Athletics", "Perception"], saveProfs: ["str", "con"], spellAbility: "wis" };
check("skill check: Athletics (str+prof) 10+3+3 = 16", A.resolveSkillCheck(sh, "Athletics", 10, { d20: 10 }).total === 16);
check("skill check: Stealth (dex, NOT proficient) 10+1 = 11", A.resolveSkillCheck(sh, "Stealth", 10, { d20: 10 }).total === 11);
check("save check: CON (proficient) 10+2+3 = 15", A.resolveSaveCheck(sh, "con", 10, { d20: 10 }).total === 15);
check("save check: DEX (NOT proficient) 10+1 = 11", A.resolveSaveCheck(sh, "dex", 10, { d20: 10 }).total === 11);
check("ability check: raw STR 10+3 = 13 (no prof even though it exists)", A.resolveAbilityCheck(sh, "str", 10, { d20: 10 }).total === 13);

// ── D. dmRollFor PARITY (same inputs → same modifier total) ──────────────────────
// dmRollFor computes: aMod + (prof if skill-proficient). Mirror it and assert resolveSkillCheck agrees.
const dmRollForTotal = (skill, ability, die) => {
  const aMod = (sh.mods && ability && typeof sh.mods[ability] === "number") ? sh.mods[ability] : 0;
  const prof = (sh.skillProfs && sh.skillProfs.indexOf(skill) >= 0) ? (sh.profBonus || 0) : 0;
  return die + aMod + prof;
};
check("parity: dmRollFor(Athletics) total == resolveSkillCheck total",
  dmRollForTotal("Athletics", "str", 13) === A.resolveSkillCheck(sh, "Athletics", 10, { d20: 13 }).total);
check("parity: dmRollFor(Perception) total == resolveSkillCheck total",
  dmRollForTotal("Perception", "wis", 7) === A.resolveSkillCheck(sh, "Perception", 10, { d20: 7 }).total);
check("parity: dmRollFor(Deception, non-prof) total == resolveSkillCheck total",
  dmRollForTotal("Deception", "cha", 15) === A.resolveSkillCheck(sh, "Deception", 10, { d20: 15 }).total);

// ── E. spell save DC ─────────────────────────────────────────────────────────────
check("spellSaveDC: 8 + pb 3 + wis 2 = 13", A.spellSaveDC(sh) === 13);
check("spellAttackBonus: pb 3 + wis 2 = 5", A.spellAttackBonus(sh) === 5);
check("spellSaveDC: non-caster (no spellAbility) → 8 + pb", A.spellSaveDC({ profBonus: 2, mods: {} }) === 10);

// ── F. Heroic Inspiration — grant / spend / reroll ──────────────────────────────
const ih = {};
check("inspiration: grant sets the flag (returns true — newly granted)", A.grantInspiration(ih) === true && A.hasInspiration(ih) === true);
check("inspiration: grant again does NOT stack (returns false — already held)", A.grantInspiration(ih) === false && ih.inspiration === true);
check("inspiration: spend clears + authorizes (returns true once)", A.spendInspiration(ih) === true && A.hasInspiration(ih) === false);
check("inspiration: spend with none held → false", A.spendInspiration(ih) === false);
// reroll REPLACES the natural (RAW — the new result stands, even if worse)
const orig = A.resolveCheck({ d20: 3, abilityMod: 0, dc: 15 });
const rr = A.resolveCheck({ d20: 3, reroll: 18, abilityMod: 0, dc: 15 });
check("inspiration: reroll replaces the natural (3 → 18 succeeds)", orig.success === false && rr.success === true && rr.natural === 18);
const rrWorse = A.resolveCheck({ d20: 19, reroll: 2, abilityMod: 0, dc: 15 });
check("inspiration: reroll stands even when WORSE (19 → 2 fails, RAW)", rrWorse.natural === 2 && rrWorse.success === false);

// ── G. exhaustion folds into every caller (−2 × level) ──────────────────────────
const she = { mods: { str: 3 }, profBonus: 3, skillProfs: ["Athletics"], saveProfs: ["str"], exhaustion: 2 };
check("exhaustion: −2×2 = −4 into a skill check (10+3+3−4 = 12)", A.resolveSkillCheck(she, "Athletics", 10, { d20: 10 }).total === 12);
check("exhaustion: −4 into a save (10+3+3−4 = 12)", A.resolveSaveCheck(she, "str", 10, { d20: 10 }).total === 12);
check("exhaustion: −4 into a raw ability check (10+3−4 = 9)", A.resolveAbilityCheck(she, "str", 10, { d20: 10 }).total === 9);
check("exhaustion: level 0 → no penalty", A.resolveSkillCheck({ mods: { str: 3 }, profBonus: 3, skillProfs: ["Athletics"], exhaustion: 0 }, "Athletics", 10, { d20: 10 }).total === 16);

// ── H. absurdity magnitude (Adam's call — "1 fails, 20 succeeds; wire the magnitude of the absurdity") ──
const nat20up = A.resolveCheck({ d20: 20, abilityMod: 0, dc: 25 });   // total 20 < DC 25: a 20 clearing a DC 5 above its reach
check("absurdity: nat 20 succeeding a DC 5 over its total → absurdity 5 (against all odds)", nat20up.success === true && nat20up.absurdity === 5);
const nat1down = A.resolveCheck({ d20: 1, abilityMod: 10, dc: 5 });   // total 11 ≥ DC 5: a 1 fumbling a make-by-6
check("absurdity: nat 1 fumbling a make-by-6 → absurdity 6 (catastrophic upset)", nat1down.success === false && nat1down.absurdity === 6);
check("absurdity: a nat 20 that would have hit ANYWAY is not absurd (absurdity 0)", A.resolveCheck({ d20: 20, abilityMod: 5, dc: 15 }).absurdity === 0);
check("absurdity: an ordinary roll carries no absurdity", A.resolveCheck({ d20: 12, abilityMod: 3, dc: 10 }).absurdity === 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
