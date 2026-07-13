#!/usr/bin/env node
/* dev/geometry-research/fuzz/redfirst-faulty-adapter.mjs — UNIT R2 REQUIRED negative control #1
   (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §13.5: "at least one red-first demonstration against a
   deliberately faulty adapter or known legacy defect").

   Runs the SAME property suite (properties.mjs) and SAME bands (bands.mjs) this program uses for the
   real legacyAdapter, but against faulty-adapter.mjs's two deliberately-broken adapters instead. A
   property suite that can't fail is not evidence of anything -- this script proves the suite actually
   detects real, named, injected defects, and shows fast-check's own shrink output doing it.

   This is a PROOF script, not a gate: it is EXPECTED to fail (that's the point). It prints the
   fast-check shrunk counterexample for each fault and exits 0 if (and only if) both faults were
   correctly detected -- i.e. exit 0 here means "the negative control held," not "everything passed." */

import { loadFastCheck } from "./require-tools.mjs";
import { makeBands } from "./bands.mjs";
import { PROPERTIES } from "./properties.mjs";
import { faultyAdapterDropsCell, faultyAdapterFillsHole } from "./faulty-adapter.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ledger = JSON.parse(readFileSync(join(HERE, "seed-ledger.json"), "utf8"));

console.log("=== CHARTER STATEMENT ===");
console.log("  Convergence rung: C0 (topology correct)");
console.log("  Canonical contracts preserved: faulty-adapter.mjs never touches src/; it wraps legacyAdapter's own output");
console.log("  Classification: research-only negative control -- this script is EXPECTED to find failures");
console.log("  This IS the required red-first proof: a property suite that never fails proves nothing.\n");

const { fc, version } = await loadFastCheck();
console.log(`fast-check ${version} resolved from GEOMETRY_TOOLS_HOME\n`);

const bands = makeBands(fc);
// large-production is the richest band (biggest footprints, most likely to contain a hole for the
// fillHole fault, most likely to have a mapped triangle for the dropCell fault) so both faults get a
// fair chance to actually trigger their corruption (both adapters are honest no-ops when their target
// condition isn't present in a given generated case -- see faulty-adapter.mjs's own comments).
const band = bands["large-production"];
const numRuns = 300;

const faults = [
  {
    name: "faulty-adapter-drop-cell",
    adapter: faultyAdapterDropsCell,
    seed: ledger.redFirstDrivers["faulty-adapter-drop-cell"],
    // properties this fault SHOULD be caught by: it deletes one cell's triangles + its cellTriangleMap
    // entry, so totality/ownership/area properties should all trip on it.
    expectedToCatch: ["union-area-equals-unique-cells", "every-canonical-floor-cell-maps-to-bounded-triangle", "triangulated-area-equals-normalized-polygon-area"],
  },
  {
    name: "faulty-adapter-fill-hole",
    adapter: faultyAdapterFillsHole,
    seed: ledger.redFirstDrivers["faulty-adapter-fill-hole"],
    // this fault ADDS fan triangles across a hole -- area/centroid properties should catch it.
    expectedToCatch: ["union-area-equals-unique-cells", "triangulated-area-equals-normalized-polygon-area", "triangle-centroids-inside-outer-outside-holes"],
  },
];

let allCaught = true;
for (const fault of faults) {
  console.log(`=== negative control: ${fault.name} (seed=${fault.seed}, numRuns=${numRuns}) ===`);
  let caughtByAny = false;
  for (const propName of fault.expectedToCatch) {
    const prop = PROPERTIES.find((p) => p.name === propName);
    const result = fc.check(
      fc.property(band, (scenario) => prop.run(scenario, fault.adapter).ok),
      { numRuns, seed: fault.seed, endOnFailure: true }
    );
    if (result.failed) {
      caughtByAny = true;
      console.log(`  [CAUGHT] ${propName} -- fast-check found + shrank a counterexample:`);
      console.log(`    seed: ${result.seed}`);
      console.log(`    numRuns before failure: ${result.numRuns}`);
      console.log(`    counterexample path: ${result.counterexamplePath}`);
      const scenario = result.counterexample[0];
      console.log(`    shrunk cell count: ${scenario.cells.length}`);
      console.log(`    shrunk scenario (first 300 chars): ${JSON.stringify(scenario).slice(0, 300)}...`);
      const detail = prop.run(scenario, fault.adapter);
      console.log(`    property detail at shrunk case: ${JSON.stringify(detail.detail).slice(0, 300)}`);
    } else {
      console.log(`  [NOT CAUGHT] ${propName} -- ${numRuns} cases, no violation found by this property for this fault`);
    }
  }
  if (!caughtByAny) {
    allCaught = false;
    console.log(`  *** NEGATIVE CONTROL FAILED: no property caught ${fault.name} -- the suite has a real blind spot ***`);
  }
  console.log("");
}

console.log(allCaught
  ? "RED-FIRST NEGATIVE CONTROL HOLDS: both deliberately-injected faults were caught and shrunk by fast-check."
  : "RED-FIRST NEGATIVE CONTROL FAILED: see *** lines above -- the property suite has a real blind spot.");

process.exit(allCaught ? 0 : 1);
