#!/usr/bin/env node
/**
 * Verify source identity, generated-map lineage, and the real-browser A/B
 * render contract for GENESIS-NORMAL-LAYER-AB-V001.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const metrics = JSON.parse(
  fs.readFileSync(path.join(here, "generated", "normal-layer-metrics.json"), "utf8")
);
const receipt = JSON.parse(
  fs.readFileSync(path.join(here, "normal-layer-proof-receipt.json"), "utf8")
);
let passed = 0;

function check(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  passed += 1;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

check(metrics.proofId === "GENESIS-NORMAL-LAYER-AB-V001", "metrics proof id");
check(receipt.proofId === metrics.proofId, "receipt proof id");
check(metrics.textures.length === 2, "exactly two proof textures");
check(receipt.captures.length === 2, "opposite-light capture pair");
check(receipt.captureHashes.length === 2, "capture hash pair");
check(receipt.pageErrors.length === 0, "no browser errors");
for (const [index, capture] of receipt.captures.entries()) {
  check(
    sha256(path.join(repoRoot, capture)) === receipt.captureHashes[index],
    `capture ${index + 1} hash`
  );
}
check(receipt.captureHashes[0] !== receipt.captureHashes[1], "opposed-light captures differ");

for (const texture of metrics.textures) {
  check(texture.dimensions[0] === 256 && texture.dimensions[1] === 256, `${texture.id} dimensions`);
  check(texture.albedo.byteIdenticalToSourceObject === true, `${texture.id} albedo identity`);
  check(texture.albedo.sha256 === texture.sourceStorage.oidSha256, `${texture.id} source hash identity`);
  check(sha256(path.join(repoRoot, texture.albedo.path)) === texture.albedo.sha256, `${texture.id} albedo hash`);
  check(sha256(path.join(repoRoot, texture.height.path)) === texture.height.sha256, `${texture.id} height hash`);
  check(texture.height.contrast === 0.8, `${texture.id} height contrast reduced 20%`);
  check(sha256(path.join(repoRoot, texture.normal.path)) === texture.normal.sha256, `${texture.id} normal hash`);
  check(texture.normal.meanZ > 0.75 && texture.normal.meanZ < 1, `${texture.id} plausible normal Z`);
  check(
    texture.normal.seamRms.verticalRelativeToInterior < 2.2,
    `${texture.id} vertical normal seam relative to local detail`
  );
  check(
    texture.normal.seamRms.horizontalRelativeToInterior < 2.2,
    `${texture.id} horizontal normal seam relative to local detail`
  );
}

const [reportA, reportB] = receipt.renderReports;
for (const report of [reportA, reportB]) {
  check(report.threeRevision === "166", "three.js r166");
  check(report.renderer === "WebGLRenderer", "real WebGL renderer");
  check(report.material === "MeshStandardMaterial", "normal-capable material");
  check(report.comparisons.length === 2, "floor and wall comparisons");
  for (const comparison of report.comparisons) {
    check(comparison.control.albedo === comparison.layered.albedo, `${comparison.id} identical albedo URL`);
    check(comparison.control.normalMap === null, `${comparison.id} control has no normal`);
    check(Boolean(comparison.layered.normalMap), `${comparison.id} layered normal present`);
    check(comparison.onlyMaterialDelta === "normalMap", `${comparison.id} isolated material delta`);
  }
}
const radiansA = reportA.light.azimuth * Math.PI / 180;
const radiansB = reportB.light.azimuth * Math.PI / 180;
check(Math.cos(radiansA) * Math.cos(radiansB) < 0, "light tangent directions oppose");
check(Math.abs(Math.sin(radiansA) - Math.sin(radiansB)) < 1e-8, "light front incidence matches");

console.log(`PASS: ${passed} normal-layer proof checks.`);
