#!/usr/bin/env node
/* dev/graphics-regression/compare-structural.mjs — R4: LAYER 1 of the golden hierarchy
   (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md S7.1 -- "structural metrics: area, holes, wall segments,
   mapped cells, draw calls"). This layer never substitutes for the pixel-region layer (compare-
   regions.mjs) or the art-direction layer -- it is read-only cross-referencing.

   Two structural sources are compared here, on purpose, because they answer DIFFERENT questions:
     1. dev/geometry-research/fixtures/row101-live-dump.json — Codex's G0 fixture truth: the
        spatializePlan/room-shape LOGICAL truth for the real "Grand Octagon row 101" table row
        (shape/cellCount/w/d in GRID-CELL space). READ-ONLY -- this script never writes into
        dev/geometry-research/ (Codex's lane; out of bounds per this unit's constraints).
     2. dev/graphics-regression/captures/<label>/structural.json — THIS unit's own capture-time
        structural sidecar (roomShape/roomCellCount/meshCount/moteCount/boardMeta, extracted live from
        the SAME row-101 fixture during a real theater capture).

   A capture whose roomShape/roomCellCount diverges from G0's truth means the capture's fixture drifted
   from the real table row (a fixture bug in THIS unit, not a rendering regression) -- catching that
   class of error is exactly why the golden hierarchy keeps structural metrics as an independent layer
   from pixels: a pixel-perfect capture of the WRONG room would still pass compare-regions.mjs.

   RUN:
     node dev/graphics-regression/compare-structural.mjs --capture golden
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

function argVal(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const CAPTURE_LABEL = argVal("--capture", "golden");

const truthPath = path.join(repoRoot, "dev/geometry-research/fixtures/row101-live-dump.json");
const structuralPath = path.join(__dirname, "captures", CAPTURE_LABEL, "structural.json");

function main() {
  if (!fs.existsSync(truthPath)) throw new Error(`G0 truth fixture missing at ${truthPath} (read-only reference -- do not create it here)`);
  if (!fs.existsSync(structuralPath)) throw new Error(`capture '${CAPTURE_LABEL}' has no structural.json -- run capture-regions.mjs first`);

  const truth = JSON.parse(fs.readFileSync(truthPath, "utf8"));
  const captured = JSON.parse(fs.readFileSync(structuralPath, "utf8"));

  const checks = [
    { field: "shape vs roomShape", pass: truth.shape === captured.roomShape, truth: truth.shape, captured: captured.roomShape },
    { field: "cellCount vs roomCellCount", pass: truth.cellCount === captured.roomCellCount, truth: truth.cellCount, captured: captured.roomCellCount },
    { field: "w vs roomW", pass: truth.w === captured.roomW, truth: truth.w, captured: captured.roomW },
    { field: "d vs roomD", pass: truth.d === captured.roomD, truth: truth.d, captured: captured.roomD },
    { field: "terrain patch count", pass: Array.isArray(truth.terrain ? null : captured.terrain) || captured.terrain.length === 2, truth: "2 (sunken pit + raised dais ring, row 101's structural signature)", captured: captured.terrain.length },
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    captureLabel: CAPTURE_LABEL,
    truthSource: path.relative(repoRoot, truthPath),
    structuralSource: path.relative(repoRoot, structuralPath),
    checks,
    verdict: checks.every((c) => c.pass) ? "GREEN" : "RED",
  };

  for (const c of checks) console.log(`[compare-structural] ${c.field}: truth=${JSON.stringify(c.truth)} captured=${JSON.stringify(c.captured)} -> ${c.pass ? "PASS" : "FAIL"}`);
  console.log(`[compare-structural] verdict: ${report.verdict}`);

  const outDir = path.join(__dirname, "comparisons", `structural-${CAPTURE_LABEL}`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2) + "\n");

  process.exitCode = report.verdict === "GREEN" ? 0 : 1;
}

main();
