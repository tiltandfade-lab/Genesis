#!/usr/bin/env node
/**
 * Verify source lineage, deterministic condition maps, isolated channel behavior,
 * save semantics, and real-browser rendering for the Material Workbench proof.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const metrics = JSON.parse(
  fs.readFileSync(path.join(here, "generated", "condition-map-metrics.json"), "utf8")
);
const receipt = JSON.parse(
  fs.readFileSync(path.join(here, "condition-workbench-receipt.json"), "utf8")
);
let passed = 0;

function check(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  passed += 1;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

check(metrics.proofId === "GENESIS-MATERIAL-CONDITION-WORKBENCH-V001", "metrics proof id");
check(receipt.proofId === metrics.proofId, "receipt proof id");
check(metrics.textures.length === 2, "floor and wall source pair");
check(receipt.captures.length === 4, "four isolated condition captures");
check(receipt.renderReports.length === 4, "four browser reports");
check(receipt.pageErrors.length === 0, "no browser errors");

const captureIds = new Set(receipt.captures.map((capture) => capture.id));
for (const expected of ["age-only", "erosion-only", "wetness-only", "combined"]) {
  check(captureIds.has(expected), `${expected} capture present`);
}
for (const capture of receipt.captures) {
  check(sha256(path.join(repoRoot, capture.path)) === capture.sha256, `${capture.id} capture hash`);
}
check(new Set(receipt.captures.map((capture) => capture.sha256)).size === 4, "capture states differ");

for (const texture of metrics.textures) {
  check(texture.dimensions[0] === 256 && texture.dimensions[1] === 256, `${texture.id} dimensions`);
  check(texture.albedo.byteIdenticalToSourceObject === true, `${texture.id} source art preserved`);
  check(texture.albedo.sha256 === texture.sourceStorage.oidSha256, `${texture.id} source hash identity`);
  check(sha256(path.join(repoRoot, texture.albedo.path)) === texture.albedo.sha256, `${texture.id} albedo hash`);
  check(texture.structureContract.faceDiscolorationHeightGain === 0, `${texture.id} no discoloration height`);
  for (const [role, output] of Object.entries(texture.maps)) {
    check(sha256(path.join(repoRoot, output.path)) === output.sha256, `${texture.id} ${role} hash`);
    check(output.range[1] > output.range[0], `${texture.id} ${role} non-flat`);
  }
  for (const role of ["structure-mask", "age-mask", "erosion-mask", "wetness-mask"]) {
    check(texture.maps[role].mean > 5 && texture.maps[role].mean < 180, `${texture.id} ${role} bounded coverage`);
  }
  check(
    texture.maps["albedo-aged"].sha256 !== texture.albedo.sha256,
    `${texture.id} aged albedo is a derived artifact`
  );
  check(
    texture.maps["normal-eroded"].sha256 !== texture.maps["normal-base"].sha256,
    `${texture.id} erosion changes semantic normal`
  );
}

const floor = metrics.textures.find((texture) => texture.id === "fantasy-floor");
const wall = metrics.textures.find((texture) => texture.id === "fantasy-wall");
check(floor.structureContract.jointDepth > wall.structureContract.jointDepth * 2, "floor joints deeper than wall");
check(floor.structureContract.faceRelief > wall.structureContract.faceRelief * 3, "floor face relief exceeds wall");
check(
  floor.structureContract.normalBakeStrength > wall.structureContract.normalBakeStrength * 2,
  "floor normal response exceeds wall"
);

const reports = Object.fromEntries(receipt.renderReports.map(({ id, report }) => [id, report]));
const expectedControls = {
  "age-only": { age: .85, erosion: 0, wetness: 0, normal: 1.2 },
  "erosion-only": { age: 0, erosion: .85, wetness: 0, normal: 1.2 },
  "wetness-only": { age: 0, erosion: 0, wetness: .85, normal: 1.2 },
  combined: { age: .65, erosion: .55, wetness: .65, normal: 1.2 }
};
for (const [id, report] of Object.entries(reports)) {
  check(report.threeRevision === "166", `${id} three.js r166`);
  check(report.renderer === "WebGLRenderer", `${id} real WebGL`);
  check(report.material === "MeshStandardMaterial", `${id} PBR material`);
  check(JSON.stringify(report.controls) === JSON.stringify(expectedControls[id]), `${id} control isolation`);
  check(report.comparisons.length === 2, `${id} floor and wall`);
  check(report.saveContract.sourceMutation === false, `${id} source mutation forbidden`);
  check(report.saveContract.bakeExportSeparate === true, `${id} bake/export separate`);
  for (const comparison of report.comparisons) {
    check(comparison.faceDiscolorationHeightGain === 0, `${id} ${comparison.id} semantic height contract`);
  }
}

for (const comparison of reports["age-only"].comparisons) {
  check(comparison.compositeMetrics.meanAlbedoDelta > 2, `${comparison.id} age changes finish`);
  check(comparison.compositeMetrics.meanNormalDelta < .01, `${comparison.id} age does not erode`);
  check(comparison.compositeMetrics.meanAppliedWetness === 0, `${comparison.id} age is dry`);
}
for (const comparison of reports["erosion-only"].comparisons) {
  check(comparison.compositeMetrics.meanAlbedoDelta === 0, `${comparison.id} erosion preserves albedo`);
  check(comparison.compositeMetrics.meanNormalDelta > .5, `${comparison.id} erosion changes normal`);
  check(comparison.compositeMetrics.meanAppliedWetness === 0, `${comparison.id} erosion is dry`);
}
for (const comparison of reports["wetness-only"].comparisons) {
  const dry = reports["erosion-only"].comparisons.find((item) => item.id === comparison.id);
  check(comparison.compositeMetrics.meanAlbedoDelta > 4, `${comparison.id} wetness darkens selectively`);
  check(comparison.compositeMetrics.meanNormalDelta > .05, `${comparison.id} wetness softens micro-normal`);
  check(
    comparison.compositeMetrics.meanRoughness < dry.compositeMetrics.meanRoughness - .1,
    `${comparison.id} wetness lowers roughness`
  );
  check(comparison.compositeMetrics.meanAppliedWetness > .1, `${comparison.id} wetness mask applied`);
}
for (const comparison of reports.combined.comparisons) {
  check(comparison.compositeMetrics.meanAlbedoDelta > 4, `${comparison.id} combined albedo response`);
  check(comparison.compositeMetrics.meanNormalDelta > .5, `${comparison.id} combined normal response`);
  check(comparison.compositeMetrics.meanAppliedWetness > .1, `${comparison.id} combined wetness response`);
}

console.log(`PASS: ${passed} material-condition workbench checks.`);
