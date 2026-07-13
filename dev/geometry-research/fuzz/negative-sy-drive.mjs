#!/usr/bin/env node
/* dev/geometry-research/fuzz/negative-sy-drive.mjs — UNIT R2 REQUIRED negative control #2
   (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §13.5, orchestrator instruction: "drive the tiers-heavy
   band / shapeTransform toward the known negative-sy production defect ... show fuzz shrinks to a
   minimal sunken-tier-collapse case, then promote it as a regression fixture").

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7):
     - Rung: C0 (topology correct).
     - Canonical contracts preserved: this script reuses adapters.mjs's productionShellCellsAdapter,
       itself a verbatim (never edited) replica of theater-boot.js:8887-8895's real shellCells builder
       -- same posture as G0's own row-101 negative control. NOTHING here fixes the production defect;
       R2's job is to prove and promote it, per the orchestrator's explicit instruction.
     - Classification: research-only negative control.
     - The defect: theater-boot.js:8888 `const sy = (typeof f.sy === 'number' && f.sy > 0) ? f.sy :
       ITR_FLOOR_HEIGHT_FALLBACK;` silently discards any NEGATIVE elevation and falls back to the flat
       floor height, so a legitimately sunken tile collapses onto the SAME quantized tier as the
       surrounding floor. G0's F18-row101-exact-canonical fixture proves this on ONE hand-authored
       shape (the Grand Octagon). This script's job is to show fast-check finds and SHRINKS a MINIMAL
       case of the same defect class, independent of that specific hand-authored geometry.

   Uses the tiers-heavy band's own `sunken` slot (shapeTransformArbitrary): the tier-minimum cell group
   in each generated scenario is tagged with a NEGATIVE sourceRef.rawSy (the "arena"); every other cell
   gets a plausible positive baseline rawSy (0.2, matching theater-boot.js's own ITR_FLOOR_HEIGHT_
   FALLBACK) -- exactly the row-101 shape, generalized to arbitrary generated tier topology. */

import { loadFastCheck } from "./require-tools.mjs";
import { makeBands } from "./bands.mjs";
import { productionShellCellsAdapter, PRODUCTION_SY_GUARD_NOTE, ROOM_SHELL_TIER_QUANTUM } from "./adapters.mjs";
import { promoteRegression } from "./promote-regression.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const ledger = JSON.parse(readFileSync(join(HERE, "seed-ledger.json"), "utf8"));

console.log("=== CHARTER STATEMENT ===");
console.log("  Convergence rung: C0 (topology correct)");
console.log("  Canonical contracts preserved: productionShellCellsAdapter is a read-only verbatim replica");
console.log("  Classification: research-only negative control. NOT fixing the defect -- proving + promoting it.");
console.log(`  Defect: ${PRODUCTION_SY_GUARD_NOTE}\n`);

const { fc, version } = await loadFastCheck();
console.log(`fast-check ${version} resolved from GEOMETRY_TOOLS_HOME\n`);

const bands = makeBands(fc);
const tiersHeavy = bands["tiers-heavy"];
const seed = ledger.redFirstDrivers["negative-sy-tiers-heavy"];
const numRuns = 500;

/** tagSunkenArena(scenario) -> scenario with sourceRef.rawSy populated: the LOWEST-tier cell group gets
    a NEGATIVE rawSy (the sunken arena, magnitude from scenario.sunken.depth), every other cell gets a
    plausible positive baseline rawSy (0.2). Returns null if scenario.sunken is absent or every cell
    shares one tier (no distinct "arena" group to sink) -- an honest no-op, not a forced failure. */
function tagSunkenArena(scenario) {
  if (!scenario.sunken) return null;
  const tiers = scenario.cells.map((c) => c.tier);
  const minTier = Math.min(...tiers);
  const maxTier = Math.max(...tiers);
  if (minTier === maxTier) return null; // only one tier present, nothing to sink relative to
  const depth = scenario.sunken.depth;
  const cells = scenario.cells.map((c) => ({
    ...c,
    sourceRef: c.tier === minTier ? { rawSy: -depth } : { rawSy: 0.2 },
  }));
  return { ...scenario, cells };
}

/** sunkenTierSurvivesProductionGuard(scenario) -> { ok, detail }
    ok === true means the arena's distinct tier SURVIVED the production shellCells path (no defect
    triggered for this case). ok === false means the arena collapsed onto the baseline tier -- the
    defect. This is the property fast-check searches for a violation of (ok===false IS the target). */
function sunkenTierSurvivesProductionGuard(scenario) {
  const tagged = tagSunkenArena(scenario);
  if (!tagged) return { ok: true, detail: "no distinct arena group in this case (honest no-op)" };
  const prod = productionShellCellsAdapter(tagged);
  if (prod.threw) return { ok: true, detail: `adapter threw (${prod.threw}) -- not the sunken-collapse defect, a different issue` };
  const minTier = Math.min(...tagged.cells.map((c) => c.tier));
  const arenaCells = prod.shellCells.filter((sc, i) => tagged.cells[i].tier === minTier);
  const baselineCells = prod.shellCells.filter((sc, i) => tagged.cells[i].tier !== minTier);
  if (!arenaCells.length || !baselineCells.length) return { ok: true, detail: "empty group after mapping (honest no-op)" };
  const arenaTiers = new Set(arenaCells.map((c) => c.tier));
  const baselineTiers = new Set(baselineCells.map((c) => c.tier));
  const collapsed = arenaTiers.size === 1 && baselineTiers.size === 1 && [...arenaTiers][0] === [...baselineTiers][0];
  return {
    ok: !collapsed,
    detail: { collapsed, arenaTiers: [...arenaTiers], baselineTiers: [...baselineTiers], arenaCellCount: arenaCells.length },
  };
}

console.log(`=== driving tiers-heavy toward the negative-sy defect (seed=${seed}, numRuns=${numRuns}) ===`);
const result = fc.check(
  fc.property(tiersHeavy, (scenario) => sunkenTierSurvivesProductionGuard(scenario).ok),
  { numRuns, seed, endOnFailure: true }
);

if (!result.failed) {
  console.log("  NOT REPRODUCED in this seed/numRuns budget -- see README for how to widen the search.");
  process.exit(1);
}

console.log("  [SHRUNK] fast-check found and shrank a minimal sunken-tier-collapse case:");
console.log(`    seed: ${result.seed}`);
console.log(`    numRuns before failure: ${result.numRuns}`);
console.log(`    counterexample path: ${result.counterexamplePath}`);
const scenario = result.counterexample[0];
console.log(`    shrunk cell count: ${scenario.cells.length}`);
console.log(`    shrunk scenario cells: ${JSON.stringify(scenario.cells)}`);
console.log(`    shrunk scenario sunken: ${JSON.stringify(scenario.sunken)}`);
const detail = sunkenTierSurvivesProductionGuard(scenario);
console.log(`    property detail: ${JSON.stringify(detail.detail)}`);

// ─── §5.4 step 3: confirm it fails OUTSIDE fast-check, in a deterministic one-case harness ─────────
console.log("\n=== confirming outside fast-check (deterministic one-case replay) ===");
const tagged = tagSunkenArena(scenario);
const replay = sunkenTierSurvivesProductionGuard(scenario);
const reproducedOutsideFastCheck = replay.ok === false;
console.log(`  reproduced outside fast-check: ${reproducedOutsideFastCheck} (ran the exact same shrunk scenario through the SAME function, zero fast-check involvement in this block)`);
if (!reproducedOutsideFastCheck) {
  console.error("  FAILED to reproduce outside fast-check -- refusing to promote an unconfirmed case.");
  process.exit(1);
}

// ─── §5.4 step 5: promote as a regression fixture ───────────────────────────────────────────────
let masterSha = null;
try { masterSha = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf-8" }).trim(); } catch { /* non-fatal */ }

const { record, filePath, wasNew } = promoteRegression({
  property: "sunken-tier-survives-production-guard",
  seed: result.seed,
  path: result.counterexamplePath,
  foundBy: "fast-check",
  cells: scenario.cells,
  tiers: Object.fromEntries(
    [...new Set(scenario.cells.map((c) => c.tier))].map((t) => [t, scenario.cells.filter((c) => c.tier === t).length])
  ),
  apertures: scenario.apertures || [],
  profile: scenario.wallProfile || {},
  expected: {
    knownRed: true,
    reason: PRODUCTION_SY_GUARD_NOTE,
    // what SHOULD happen once a fix lands: the arena's own tier must stay distinct from baseline.
    shouldNotCollapse: true,
  },
  firstSeenCommit: masterSha,
  notes: "R2 property-fuzz shrink of the negative-sy sunken-tier-collapse defect (theater-boot.js:8888), " +
    "independent of G0's hand-authored F18-row101-exact-canonical fixture. R2 does not fix this -- " +
    "promoted so it becomes an ordinary deterministic regression case for whichever unit (G2/G3) fixes " +
    "theater-boot.js's own f.sy>0 guard.",
  scenario,
});

console.log(`\n  promoted: ${record.id} (${wasNew ? "new" : "already existed, rewritten identically"})`);
console.log(`  file: ${filePath}`);
console.log("\nNEGATIVE CONTROL #2 HOLDS: fast-check found + shrank a minimal sunken-tier-collapse case, confirmed outside fast-check, and promoted it.");
process.exit(0);
