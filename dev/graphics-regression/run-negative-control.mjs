#!/usr/bin/env node
/* dev/graphics-regression/run-negative-control.mjs — R4's REQUIRED negative-control proof, driven
   end-to-end: captures golden + a stability rerun, mutates two deliberate defects off the golden, and
   asserts the exact RED/GREEN pattern the task demands:

     1. structural layer (compare-structural.mjs) on the golden capture      -> must be GREEN
     2. pixel layer, rerun vs golden (unchanged recapture)                   -> must be GREEN
     3. pixel layer, one-pixel mutation vs golden, --strict (zero tolerance) -> must be RED
     4. pixel layer, small-topology shift mutation vs golden, PRODUCTION
        thresholds (no --strict)                                            -> must be RED

   Any deviation from that pattern is a FAIL for this script itself (exit 1) -- this is the harness
   proving itself, not a suite that reports its own opinion of its correctness.

   RUN: node dev/graphics-regression/run-negative-control.mjs
   (assumes captures/golden already exists -- run capture-regions.mjs --out golden first, or this
   script will do it for you.)
*/

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const node = process.execPath;

function run(label, scriptArgs, expectExit) {
  console.log(`\n=== ${label} ===`);
  let exitCode = 0;
  try {
    execFileSync(node, scriptArgs, { cwd: __dirname, stdio: "inherit" });
  } catch (e) {
    exitCode = typeof e.status === "number" ? e.status : 1;
  }
  const pass = exitCode === expectExit;
  console.log(`--- ${label}: exit=${exitCode} (expected ${expectExit}) -> ${pass ? "AS EXPECTED" : "UNEXPECTED"} ---`);
  return { label, exitCode, expectExit, pass };
}

const results = [];

const goldenFull = path.join(__dirname, "captures", "golden", "full.png");
if (!fs.existsSync(goldenFull)) {
  results.push(run("capture golden", ["capture-regions.mjs", "--out", "golden"], 0));
}
results.push(run("capture rerun (stability check)", ["capture-regions.mjs", "--out", "rerun"], 0));

results.push(run("LAYER 1 structural: golden vs G0 truth (expect GREEN)", ["compare-structural.mjs", "--capture", "golden"], 0));

results.push(run(
  "LAYER 2 pixel: rerun vs golden, unchanged recapture (expect GREEN)",
  ["compare-regions.mjs", "--fixture", "octagon-row101", "--expected", "golden", "--actual", "rerun", "--out", "comparisons/rerun-vs-golden"],
  0
));

results.push(run(
  "mutate: one-pixel flip inside practical-fixture-region",
  ["mutate-capture.mjs", "--source", "golden", "--out", "mutated-one-pixel", "--mode", "one-pixel", "--fixture", "octagon-row101", "--region", "practical-fixture-region"],
  0
));
results.push(run(
  "LAYER 2 pixel: one-pixel mutation vs golden, --strict zero-tolerance (expect RED)",
  ["compare-regions.mjs", "--fixture", "octagon-row101", "--expected", "golden", "--actual", "mutated-one-pixel", "--out", "comparisons/mutated-one-pixel-vs-golden-strict", "--strict"],
  1
));

results.push(run(
  "mutate: 6px topology shift inside wall-stem-silhouette",
  ["mutate-capture.mjs", "--source", "golden", "--out", "mutated-shift", "--mode", "shift", "--fixture", "octagon-row101", "--region", "wall-stem-silhouette", "--shift-px", "6"],
  0
));
results.push(run(
  "LAYER 2 pixel: small-topology shift vs golden, PRODUCTION thresholds (expect RED)",
  ["compare-regions.mjs", "--fixture", "octagon-row101", "--expected", "golden", "--actual", "mutated-shift", "--out", "comparisons/mutated-shift-vs-golden"],
  1
));

console.log("\n=== NEGATIVE-CONTROL SUMMARY ===");
let allPass = true;
for (const r of results) {
  console.log(`${r.pass ? "OK  " : "FAIL"}  ${r.label} (exit=${r.exitCode}, expected=${r.expectExit})`);
  if (!r.pass) allPass = false;
}

const summaryPath = path.join(__dirname, "comparisons", "negative-control-summary.json");
fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
fs.writeFileSync(summaryPath, JSON.stringify({ generatedAt: new Date().toISOString(), allPass, results }, null, 2) + "\n");
console.log(`\noverall: ${allPass ? "PASS -- harness proves itself red-first and stable" : "FAIL -- harness did not behave as required"}`);
console.log(`summary written to ${summaryPath}`);
process.exitCode = allPass ? 0 : 1;
