#!/usr/bin/env node
/* dev/geometry-research/bakeoff/run-correctness.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md
   §13.4, §4.3-4.4). Runs P0-P3 through every fixture in the G0 corpus (52 fixtures: 28 base + 24
   bakeoff-specific — corpus.mjs's own count) and writes the correctness scorecard.

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7):
     - Rung: C0->C1 decision input (does the geometry stack make topology+architecture reliable).
     - Canonical contracts preserved: spike-only (dev/geometry-research/bakeoff/), dev-only, NO
       production room-shell integration; src/ui/theater-room-mesh.js is READ-ONLY (imported for its
       pure exported functions, never edited); walk/cells never mutated (fixtures are frozen plain data).
     - Classification: research-only.
     - Negative control: B20 (the known S-hook octagon regression capture) + G0's legacy-defect
       fixtures (F18 row-101 sunken-arena collapse via the PRODUCTION shellCells path is G0's own
       negative control, not re-run here — see dev/verify-geometry-fixtures.mjs Section 5; this run
       instead shows which of P0-P3 pass/fail B20 and the acute/concave corner classes B01-B04).

   Run:  node dev/geometry-research/bakeoff/run-correctness.mjs
   Writes: dev/geometry-research/bakeoff/correctness-report.json */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import { PATHS } from "./adapters.mjs";
import { scoreFixture } from "./correctness.mjs";
import { loadLegacyMeshModule } from "./floor-backends.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

console.log("=== CHARTER STATEMENT ===");
console.log("  Rung: C0->C1 decision input (geometry stack selection)");
console.log("  Canonical contracts preserved: spike-only, dev-only, no production edits, no mutation");
console.log("  Classification: research-only");
console.log("  Negative controls: B20 S-hook octagon + B01-B04 corner classes\n");

const corpus = await import(pathToFileURL(join(ROOT, "dev/geometry-research/fixtures/corpus.mjs")).href);
const { FIXTURES } = corpus;
const mesh = await loadLegacyMeshModule();

console.log(`Corpus: ${FIXTURES.length} fixtures × ${PATHS.length} paths = ${FIXTURES.length * PATHS.length} runs\n`);

const report = {
  generatedAt: new Date().toISOString(),
  masterSha: null,
  fixtureCount: FIXTURES.length,
  paths: PATHS,
  results: {}, // results[path][fixtureId] = { checks, autoRejected, error }
  summary: {}, // summary[path] = { passedFixtures, failedFixtures, autoRejectedFixtures, checkPassRates }
};
try {
  report.masterSha = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf-8" }).trim();
} catch { /* non-fatal */ }

for (const pathId of PATHS) {
  report.results[pathId] = {};
  const checkTally = {};
  let passedFixtures = 0, failedFixtures = 0, autoRejectedFixtures = 0, threwFixtures = 0;
  process.stdout.write(`${pathId}: `);
  for (const fixture of FIXTURES) {
    let scored;
    try {
      scored = await scoreFixture(pathId, fixture, mesh);
    } catch (e) {
      threwFixtures++;
      report.results[pathId][fixture.fixtureId] = { threw: String((e && e.stack) || e).slice(0, 500) };
      process.stdout.write("T");
      continue;
    }
    const allPass = Object.values(scored.checks).every((c) => c.pass);
    if (allPass) passedFixtures++; else failedFixtures++;
    if (scored.autoRejected) autoRejectedFixtures++;
    Object.entries(scored.checks).forEach(([name, c]) => {
      if (!checkTally[name]) checkTally[name] = { pass: 0, fail: 0 };
      checkTally[name][c.pass ? "pass" : "fail"]++;
    });
    report.results[pathId][fixture.fixtureId] = {
      allPass, autoRejected: scored.autoRejected, skipped: scored.skipped || null,
      checks: Object.fromEntries(Object.entries(scored.checks).map(([k, v]) => [k, { pass: v.pass, detail: v.detail }])),
    };
    process.stdout.write(allPass ? "." : (scored.autoRejected ? "X" : "x"));
  }
  process.stdout.write("\n");
  report.summary[pathId] = {
    totalFixtures: FIXTURES.length, passedFixtures, failedFixtures, autoRejectedFixtures, threwFixtures,
    checkPassRates: Object.fromEntries(Object.entries(checkTally).map(([k, v]) => [k, `${v.pass}/${v.pass + v.fail}`])),
  };
  console.log(`  ${pathId}: ${passedFixtures}/${FIXTURES.length} fixtures fully pass, ${autoRejectedFixtures} auto-rejected, ${threwFixtures} threw\n`);
}

// negative controls, called out explicitly
console.log("=== Negative controls ===");
for (const fixId of ["B20-s-hook-octagon-regression-capture", "B02-acute-corner-near-miter-limit", "B03-concave-90-corner", "B04-concave-45-notch"]) {
  console.log(`  ${fixId}:`);
  for (const pathId of PATHS) {
    const r = report.results[pathId][fixId];
    console.log(`    ${pathId}: ${r ? (r.allPass ? "PASS" : "FAIL") : "missing"}`);
  }
}

const reportPath = join(ROOT, "dev/geometry-research/bakeoff/correctness-report.json");
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\nwrote ${reportPath}`);
