#!/usr/bin/env node
/* dev/graphics-regression/compare-regions.mjs — R4: the region-diff comparator.

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md S7 + S5): pixel-region evidence is LAYER 2
   of a three-layer golden hierarchy (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md S7.1) -- structural
   metrics (layer 1, see structural.json/compare-structural.mjs) and art-direction reads (layer 3,
   human/Codex judgment against the mocks) are never replaced by this layer's pixelmatch numbers. This
   tool NEVER overwrites a golden -- it only ever writes into a fresh comparisons/<label> output
   directory. A changed golden requires a written reason + visual inspection (this script cannot do
   either for you -- see README.md's "replacing a golden" section).

   Compares two captures (each produced by capture-regions.mjs: a full.png + env.json) region-by-region
   against a region-mask file (region-masks/<fixtureId>.json, docs S7.2 format). Same-environment ONLY
   (docs S3.8) -- if the two captures' env.json report different canvasBackingSize, glInfo.renderer, or
   pixelmatchVersion, this script refuses to treat an exact-pixel verdict as authoritative and instead
   applies the CROSS-GPU POLICY (docs S7.3): wider thresholds, an explicit warning, never a silent pass.

   Per docs S3.8, every diff writes: actual PNG, expected PNG, diff PNG, region mask (rect), mismatched-
   pixel count and ratio, threshold/AA policy, renderer/browser/GPU metadata, and (folded in from the
   sibling structural.json files) the structural sidecar.

   RUN:
     node dev/graphics-regression/compare-regions.mjs --fixture octagon-row101 \
       --expected golden --actual rerun --out comparisons/rerun-vs-golden
   Exit code 0 = every region within tolerance (or same-env not established + warned). Exit code 1 =
   at least one region exceeded its maxRatio under same-environment conditions (a real RED).
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPng, writePng, newPng, crop, loadPixelmatch } from "./lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function argVal(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const FIXTURE = argVal("--fixture", "octagon-row101");
const EXPECTED_LABEL = argVal("--expected", "golden");
const ACTUAL_LABEL = argVal("--actual", "rerun");
const OUT = argVal("--out", `comparisons/${ACTUAL_LABEL}-vs-${EXPECTED_LABEL}`);
// --strict: diagnostic-only override that zeroes every region's maxRatio (mismatchedPixels must be
// exactly 0 to pass). Used ONLY by run-negative-control.mjs's one-pixel-sensitivity proof — never the
// production comparison mode, and always labeled as such in the written report.
const STRICT = process.argv.includes("--strict");

const capturesDir = path.join(__dirname, "captures");
const outDir = path.join(__dirname, OUT);
fs.mkdirSync(outDir, { recursive: true });

function loadCapture(label) {
  const dir = path.join(capturesDir, label);
  const full = path.join(dir, "full.png");
  const envPath = path.join(dir, "env.json");
  const structuralPath = path.join(dir, "structural.json");
  if (!fs.existsSync(full)) throw new Error(`capture '${label}' missing full.png at ${full}`);
  return {
    label,
    dir,
    png: readPng(full),
    env: fs.existsSync(envPath) ? JSON.parse(fs.readFileSync(envPath, "utf8")) : null,
    structural: fs.existsSync(structuralPath) ? JSON.parse(fs.readFileSync(structuralPath, "utf8")) : null,
  };
}

function sameEnvironment(a, b) {
  if (!a.env || !b.env) return { same: false, reason: "missing env.json on one or both captures" };
  const reasons = [];
  if (JSON.stringify(a.env.canvasBackingSize) !== JSON.stringify(b.env.canvasBackingSize)) reasons.push("canvasBackingSize differs");
  const ar = a.env.glInfo || {}, br = b.env.glInfo || {};
  if (ar.unmaskedRenderer !== br.unmaskedRenderer) reasons.push("GPU (unmaskedRenderer) differs");
  if (a.env.browserVersion !== b.env.browserVersion) reasons.push("browserVersion differs");
  if (a.env.pixelmatchVersion !== b.env.pixelmatchVersion) reasons.push("pixelmatch version differs");
  if (a.env.platform !== b.env.platform) reasons.push("platform differs");
  return { same: reasons.length === 0, reasons };
}

function main() {
  const maskPath = path.join(__dirname, "region-masks", `${FIXTURE}.json`);
  if (!fs.existsSync(maskPath)) throw new Error(`no region mask for fixture '${FIXTURE}' at ${maskPath}`);
  const mask = JSON.parse(fs.readFileSync(maskPath, "utf8"));

  const expected = loadCapture(EXPECTED_LABEL);
  const actual = loadCapture(ACTUAL_LABEL);
  const pixelmatch = loadPixelmatch();

  const envCheck = sameEnvironment(expected, actual);
  const crossGpuPolicyActive = !envCheck.same;

  if (mask.expectedCanvasSize) {
    for (const cap of [expected, actual]) {
      if (cap.png.width !== mask.expectedCanvasSize.width || cap.png.height !== mask.expectedCanvasSize.height) {
        console.warn(
          `[compare-regions] WARNING: capture '${cap.label}' canvas is ${cap.png.width}x${cap.png.height}, ` +
          `mask '${FIXTURE}' was authored against ${mask.expectedCanvasSize.width}x${mask.expectedCanvasSize.height}. ` +
          `Region rects may land on the wrong content. Treat this run's verdict as unreliable, not a real green.`
        );
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    fixtureId: FIXTURE,
    expectedLabel: EXPECTED_LABEL,
    actualLabel: ACTUAL_LABEL,
    sameEnvironment: envCheck.same,
    sameEnvironmentReasons: envCheck.reasons || [],
    crossGpuPolicyActive,
    strictDiagnosticMode: STRICT,
    expectedEnv: expected.env,
    actualEnv: actual.env,
    expectedStructural: expected.structural,
    actualStructural: actual.structural,
    regions: [],
  };

  let anyRedUnderSameEnv = false;

  for (const region of mask.regions) {
    // cross-GPU policy: widen the threshold/maxRatio (docs S7.3 "wider perceptual thresholds"), never
    // silently keep the tight same-env numbers when the environment itself is not proven identical.
    const threshold = crossGpuPolicyActive ? Math.min(0.35, region.threshold * 3) : region.threshold;
    const maxRatio = STRICT ? 0 : (crossGpuPolicyActive ? Math.min(0.5, region.maxRatio * 5) : region.maxRatio);

    const expCrop = crop(expected.png, region.rect);
    const actCrop = crop(actual.png, region.rect);

    const w = Math.min(expCrop.width, actCrop.width);
    const h = Math.min(expCrop.height, actCrop.height);
    const sizeMismatch = expCrop.width !== actCrop.width || expCrop.height !== actCrop.height;

    const diffPng = newPng(w, h);
    const mismatched = pixelmatch(expCrop.data, actCrop.data, diffPng.data, w, h, {
      threshold,
      includeAA: false,
    });
    const totalPixels = w * h;
    const ratio = mismatched / totalPixels;
    const pass = !sizeMismatch && ratio <= maxRatio;
    if (!pass && !crossGpuPolicyActive) anyRedUnderSameEnv = true;

    const regionOutDir = path.join(outDir, region.id);
    fs.mkdirSync(regionOutDir, { recursive: true });
    writePng(expCrop, path.join(regionOutDir, "expected.png"));
    writePng(actCrop, path.join(regionOutDir, "actual.png"));
    // wrap the raw diff buffer in a real PNG object via lib's PNG constructor path (writePng expects a
    // pngjs-shaped object with width/height/data — diffPng already matches that shape).
    writePng(diffPng, path.join(regionOutDir, "diff.png"));

    report.regions.push({
      id: region.id,
      label: region.label,
      rect: region.rect,
      threshold,
      maxRatio,
      thresholdSameEnv: region.threshold,
      maxRatioSameEnv: region.maxRatio,
      mismatchedPixels: mismatched,
      totalPixels,
      ratio,
      sizeMismatch,
      pass,
      antialiasPolicy: "includeAA:false (pixelmatch AA-pixel exclusion, docs S3.8 antialias policy)",
    });

    console.log(
      `[compare-regions] ${region.id}: ${mismatched}/${totalPixels} px (${(ratio * 100).toFixed(3)}%) ` +
      `threshold=${threshold} maxRatio=${maxRatio} -> ${pass ? "PASS" : "FAIL"}${crossGpuPolicyActive ? " (cross-GPU policy)" : ""}`
    );
  }

  report.verdict = crossGpuPolicyActive
    ? "WARNING-CROSS-ENV — structural + widened-perceptual only, not an authoritative same-env verdict"
    : (anyRedUnderSameEnv ? "RED" : "GREEN");

  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(`[compare-regions] verdict: ${report.verdict} (report: ${path.join(outDir, "report.json")})`);

  if (crossGpuPolicyActive) {
    console.warn(`[compare-regions] CROSS-GPU POLICY ACTIVE: ${(envCheck.reasons || []).join("; ")}`);
    process.exitCode = 0; // warning, not a hard fail — docs S7.3: "explicit warning rather than automatic golden replacement"
  } else {
    process.exitCode = anyRedUnderSameEnv ? 1 : 0;
  }
}

main();
