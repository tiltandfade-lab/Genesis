#!/usr/bin/env node
/* dev/geometry-research/fuzz/run-fuzz.mjs — UNIT R2 main runner (docs/GEOMETRY-ACCELERATION-
   TOOLCHAIN.md §5.3, §13.5).

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7):
     - Rung: C0 (topology correct) -- this harness stresses it with generated cases fast fixtures
       can't reach, beyond G0's 52 hand-authored fixtures.
     - Canonical contracts preserved: every generator here builds plain-data cell scenarios; nothing
       rolls game content, nothing touches src/ except a READ-ONLY import of theater-room-mesh.js
       (via adapters.mjs, same posture as G0). No production file is ever edited by this unit.
     - Classification: research-only, dev-only. Never imported by genesis.html or manifest.json.
     - Negative control: see dev/geometry-research/fuzz/redfirst-faulty-adapter.mjs and
       dev/geometry-research/fuzz/negative-sy-drive.mjs -- both required companions to this runner,
       not optional extras.

   Run modes (docs S5.3):
     PR smoke       (default): fixed seeds, 500 generated cases per band, PLUS a replay of every
                                promoted regression fixture as an ordinary deterministic check.
     nightly/local  (--mode nightly): fixed seed ledger, 25,000 cases per band. NOT run by default --
                                this unit documents the mode and wires the flag; it does not execute a
                                25k run as part of landing R2 (that's a standing local/CI job, not a
                                one-time research deliverable).
     release gate   (--mode release): 100,000 cases per band. Same posture as nightly -- flag exists,
                                not executed here.
     bug hunt       (--mode bug-hunt --band <name> --seed <n>): verbose single-band/single-seed replay.

   Usage:
     node dev/geometry-research/fuzz/run-fuzz.mjs                       # PR-smoke, all bands
     node dev/geometry-research/fuzz/run-fuzz.mjs --band tiers-heavy    # PR-smoke, one band
     node dev/geometry-research/fuzz/run-fuzz.mjs --mode nightly        # 25k/band (slow -- opt in)
     node dev/geometry-research/fuzz/run-fuzz.mjs --mode release        # 100k/band (slow -- opt in) */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadFastCheck } from "./require-tools.mjs";
import { makeBands, BAND_NAMES } from "./bands.mjs";
import { PROPERTIES, SKIPPED_AMBIGUOUS_PROPERTIES } from "./properties.mjs";
import { legacyAdapter } from "./adapters.mjs";
import { listPromotedRegressions } from "./promote-regression.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ledger = JSON.parse(readFileSync(join(HERE, "seed-ledger.json"), "utf8"));

function parseArgs(argv) {
  const args = { mode: "pr-smoke", band: null, seed: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--mode") args.mode = argv[++i];
    else if (argv[i] === "--band") args.band = argv[++i];
    else if (argv[i] === "--seed") args.seed = Number(argv[++i]);
  }
  return args;
}

console.log("=== CHARTER STATEMENT ===");
console.log("  Convergence rung: C0 (topology correct), stressed beyond hand fixtures");
console.log("  Canonical contracts preserved: plain-data scenarios only; theater-room-mesh.js read-only");
console.log("  Classification: research-only, dev-only");
console.log("  Negative control: see redfirst-faulty-adapter.mjs + negative-sy-drive.mjs (companion scripts)\n");

const args = parseArgs(process.argv.slice(2));
if (!ledger.modes[args.mode]) {
  console.error(`unknown --mode ${args.mode}; expected one of ${Object.keys(ledger.modes).join(", ")}`);
  process.exit(2);
}

const { fc, version: fcVersion } = await loadFastCheck();
console.log(`fast-check ${fcVersion} resolved from GEOMETRY_TOOLS_HOME\n`);

const bands = makeBands(fc);
const modeSpec = ledger.modes[args.mode];
const numRuns = modeSpec.numRuns;
const bandNames = args.band ? [args.band] : BAND_NAMES;

if (SKIPPED_AMBIGUOUS_PROPERTIES.length) {
  console.log("=== SKIPPED_AMBIGUOUS properties (flagged for orchestrator, not silently green) ===");
  SKIPPED_AMBIGUOUS_PROPERTIES.forEach((p) => console.log(`  - ${p.name}: ${p.reason}`));
  console.log("");
}

const report = { mode: args.mode, numRuns, fcVersion, bands: {}, promotedRegressionReplay: [] };
let anyPropertyFailed = false;

for (const bandName of bandNames) {
  const bandArb = bands[bandName];
  if (!bandArb) { console.error(`unknown band ${bandName}`); process.exit(2); }
  const seed = args.seed ?? modeSpec.seeds[bandName];
  console.log(`=== band: ${bandName} (seed=${seed}, numRuns=${numRuns}) ===`);
  report.bands[bandName] = { seed, properties: {} };

  for (const prop of PROPERTIES) {
    const result = fc.check(
      fc.property(bandArb, (scenario) => prop.run(scenario, legacyAdapter).ok),
      { numRuns, seed, endOnFailure: true }
    );
    const status = result.failed ? "FAIL" : "PASS";
    if (result.failed) anyPropertyFailed = true;
    console.log(`  [${status}] ${prop.name}${result.failed ? ` -- seed=${result.seed} path=${result.counterexamplePath}` : ""}`);
    report.bands[bandName].properties[prop.name] = {
      status,
      numRuns: result.numRuns,
      seed: result.seed,
      counterexamplePath: result.failed ? result.counterexamplePath : null,
      counterexample: result.failed ? result.counterexample : null,
      skippedAmbiguous: !!prop.skippedAmbiguous,
    };
  }
  console.log("");
}

// ── promoted-regression replay (PR-smoke's other half per docs S5.3) ────────────────────────────
console.log("=== promoted regression replay ===");
const promoted = listPromotedRegressions();
if (!promoted.length) {
  console.log("  (none promoted yet)");
} else {
  // NOTE (documented, not silently patched around): JSON has no NaN literal -- Number.NaN round-trips
  // through JSON.stringify/parse as `null`. A promoted regression whose defect IS an invalid `tier`
  // value can only carry that intent as `tier: null` in the committed JSON; this replay rehydrates it
  // back to NaN (the one value this program's own invalid-input generator ever produces for `tier`)
  // before re-running the property, so the replay actually re-exercises the SAME defect rather than a
  // silently-different "tier: null" case.
  const rehydrateTier = (cells) => (cells || []).map((c) => (c.tier === null ? { ...c, tier: NaN } : c));

  for (const reg of promoted) {
    const scenario = reg.scenario
      ? { ...reg.scenario, cells: rehydrateTier(reg.scenario.cells) }
      : { cells: rehydrateTier(reg.cells), apertures: reg.apertures, terrain: [], renderShape: "identity", wallProfile: reg.profile || null };
    const propDef = PROPERTIES.find((p) => p.name === reg.property);
    let outcome;
    if (!propDef) {
      // Not every promoted property lives in the standard legacyAdapter suite -- e.g. the negative-sy
      // driver's "sunken-tier-survives-production-guard" is productionShellCellsAdapter-specific and is
      // replayed by negative-sy-drive.mjs itself, not here. That is expected, not drift.
      outcome = "NOT_IN_STANDARD_SUITE";
    } else {
      const { ok } = propDef.run(scenario, legacyAdapter);
      outcome = ok ? "GREEN" : "RED";
    }
    const expectedKnownRed = reg.expected && reg.expected.knownRed;
    const consistent = outcome === "NOT_IN_STANDARD_SUITE" ? true : expectedKnownRed ? outcome === "RED" : outcome === "GREEN";
    console.log(`  [${consistent ? "OK" : "DRIFT"}] ${reg.id} (${reg.property}) -> ${outcome}${expectedKnownRed && outcome !== "NOT_IN_STANDARD_SUITE" ? " (expected RED -- known unfixed production defect)" : ""}`);
    report.promotedRegressionReplay.push({ id: reg.id, property: reg.property, outcome, expectedKnownRed: !!expectedKnownRed, consistent });
  }
}

console.log(`\n${anyPropertyFailed ? "AT LEAST ONE PROPERTY FAILED against legacyAdapter (see above)" : "all properties held against legacyAdapter for the requested bands"}`);
console.log("(this is the standard-adapter run -- see redfirst-faulty-adapter.mjs for the required negative control)");

const reportPath = join(HERE, `run-report.${args.mode}.json`);
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\nreport written: ${reportPath}`);

process.exit(anyPropertyFailed ? 1 : 0);
