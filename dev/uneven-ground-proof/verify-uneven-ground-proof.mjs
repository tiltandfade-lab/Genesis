#!/usr/bin/env node
/**
 * Verify deterministic generation, bounded relief, traversable approach lanes,
 * level encounter pads, semantic transitions, and real WebGL captures.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GROUND_PROOF_ID,
  GROUND_PROFILES,
  GRID,
  MAX_WALKABLE_SLOPE_DEG,
  generateGround
} from "./terrain-generator.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const receiptPath = path.join(here, "uneven-ground-proof-receipt.json");
const generatorPath = path.join(here, "terrain-generator.mjs");
const harnessPath = path.join(here, "uneven-ground-proof.html");
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
let passed = 0;

function check(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  passed += 1;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function close(a, b, epsilon = 1e-6) {
  return Math.abs(a - b) <= epsilon;
}

check(receipt.proofId === GROUND_PROOF_ID, "receipt proof id");
check(receipt.pageErrors.length === 0, "no browser errors");
check(receipt.generator.sha256 === sha256(generatorPath), "generator source hash");
check(receipt.harness.sha256 === sha256(harnessPath), "harness source hash");
check(
  receipt.standee.sha256 === sha256(path.join(repoRoot, receipt.standee.path)),
  "canonical standee source hash"
);
check(GROUND_PROFILES.length === 3, "three representative ground profiles");
check(JSON.stringify(GRID) === JSON.stringify({
  columns: 65,
  rows: 49,
  widthMeters: 12,
  depthMeters: 9
}), "declared proof grid");
check(MAX_WALKABLE_SLOPE_DEG === 30, "walkability slope limit");
check(!fs.readFileSync(generatorPath, "utf8").includes("Math.random"), "no unseeded random source");

const generated = [];
for (const profile of GROUND_PROFILES) {
  const first = generateGround(profile.id);
  const second = generateGround(profile.id);
  generated.push(first);
  check(first.proofId === GROUND_PROOF_ID, `${profile.id} proof id`);
  check(first.metrics.fingerprint === second.metrics.fingerprint, `${profile.id} stable fingerprint`);
  check(JSON.stringify(first.heights) === JSON.stringify(second.heights), `${profile.id} byte-stable heights`);
  check(first.heights.length === GRID.columns * GRID.rows, `${profile.id} vertex count`);
  check(first.slopes.length === first.heights.length, `${profile.id} slope count`);
  check(first.heights.every(Number.isFinite), `${profile.id} finite heights`);
  check(first.slopes.every(Number.isFinite), `${profile.id} finite slopes`);
  for (const [key, values] of Object.entries(first.masks)) {
    check(values.length === first.heights.length, `${profile.id} ${key} mask size`);
    check(values.every((value) => value >= 0 && value <= 1), `${profile.id} ${key} mask bounds`);
  }
  check(first.metrics.reliefMeters >= 0.45, `${profile.id} materially uneven`);
  check(
    first.metrics.reliefMeters <= first.metrics.maximumAllowedReliefMeters,
    `${profile.id} bounded vertical relief`
  );
  check(first.metrics.walkablePercent >= 90, `${profile.id} mostly walkable`);
  check(first.metrics.reservedPathPercent >= 1, `${profile.id} reserves a route`);
  check(
    first.metrics.reservedPathMaxSlopeDegrees <= 22,
    `${profile.id} route remains traversable`
  );
  check(first.metrics.encounterPadRangeMeters <= 0.01, `${profile.id} level encounter pad`);
  check(first.metrics.transitionAreaSquareMeters >= 4, `${profile.id} has a useful transition mask`);
}
check(new Set(generated.map((ground) => ground.metrics.fingerprint)).size === 3, "profile fingerprints differ");

const meadow = generated.find((ground) => ground.profile.id === "meadow-road");
const upland = generated.find((ground) => ground.profile.id === "upland-ruin");
const shore = generated.find((ground) => ground.profile.id === "shore-margin");
check(meadow.metrics.meanSlopeDegrees < 6, "meadow stays gently rolling");
check(upland.metrics.reliefMeters >= 1.1, "upland carries strong relief");
check(upland.metrics.maxSlopeDegrees > MAX_WALKABLE_SLOPE_DEG, "upland retains guarded steep ground");
check(shore.metrics.waterAreaSquareMeters >= 35, "shore includes a substantial submerged shelf");
check(shore.metrics.reliefMeters >= 0.8, "shore spans underwater shelf to dry bank");

check(receipt.captures.length === 2, "beauty and slope-audit captures");
check(receipt.renderReports.length === 2, "two browser render reports");
check(new Set(receipt.captures.map((capture) => capture.sha256)).size === 2, "capture modes differ");
for (const capture of receipt.captures) {
  check(sha256(path.join(repoRoot, capture.path)) === capture.sha256, `${capture.id} capture hash`);
}

const reports = Object.fromEntries(
  receipt.renderReports.map(({ id, report }) => [id, report])
);
for (const mode of ["beauty", "debug"]) {
  const report = reports[mode];
  check(report.mode === mode, `${mode} report mode`);
  check(report.proofId === GROUND_PROOF_ID, `${mode} proof id`);
  check(report.threeRevision === "166", `${mode} three.js r166`);
  check(report.renderer === "WebGLRenderer", `${mode} real WebGL`);
  check(report.material === "MeshStandardMaterial", `${mode} stock PBR material`);
  check(JSON.stringify(report.camera) === JSON.stringify({
    fovDegrees: 20,
    elevationDegrees: 35,
    yawDegrees: 45
  }), `${mode} governed gameplay camera`);
  check(JSON.stringify(report.grid) === JSON.stringify(GRID), `${mode} declared grid`);
  check(report.walkableSlopeLimitDegrees === MAX_WALKABLE_SLOPE_DEG, `${mode} slope contract`);
  check(report.profiles.length === 3, `${mode} renders all profiles`);
  for (const rendered of report.profiles) {
    const ground = generated.find((candidate) => candidate.profile.id === rendered.id);
    check(Boolean(ground), `${mode} ${rendered.id} resolves`);
    check(rendered.seed === ground.profile.seed, `${mode} ${rendered.id} seed`);
    check(rendered.fingerprint === ground.metrics.fingerprint, `${mode} ${rendered.id} fingerprint`);
    check(JSON.stringify(rendered.metrics) === JSON.stringify(ground.metrics), `${mode} ${rendered.id} metrics`);
    check(rendered.vertexCount === GRID.columns * GRID.rows, `${mode} ${rendered.id} vertices`);
    check(rendered.triangleCount === (GRID.columns - 1) * (GRID.rows - 1) * 2, `${mode} ${rendered.id} triangles`);
    check(rendered.semantics.includes("reserved-path"), `${mode} ${rendered.id} route semantics`);
    check(rendered.semantics.includes("encounter-pad"), `${mode} ${rendered.id} pad semantics`);
    check(rendered.semantics.includes("transition-mask"), `${mode} ${rendered.id} transition semantics`);
  }
}

for (const profile of GROUND_PROFILES) {
  const beauty = reports.beauty.profiles.find((item) => item.id === profile.id);
  const debug = reports.debug.profiles.find((item) => item.id === profile.id);
  check(JSON.stringify(beauty) === JSON.stringify(debug), `${profile.id} geometry is mode-invariant`);
}

console.log(`PASS: ${passed} uneven-ground proof checks.`);
