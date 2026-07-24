#!/usr/bin/env node
/**
 * Verify packing, source lineage, UV confinement, repeat segmentation,
 * corner phase continuity, and real-browser captures for trim-sheet proof V001.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const manifestPath = path.join(here, "generated", "trim-sheet-manifest.json");
const receiptPath = path.join(here, "trim-sheet-proof-receipt.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
let passed = 0;

function check(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  passed += 1;
}

function close(a, b, epsilon = 1e-5) {
  return Math.abs(a - b) <= epsilon;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

check(manifest.proofId === "GENESIS-TRIM-SHEET-PROOF-V001", "manifest proof id");
check(receipt.proofId === manifest.proofId, "receipt proof id");
check(manifest.layoutId === "architecture-core-v1", "stable layout id");
check(JSON.stringify(manifest.authoringSize) === "[512,512]", "512 square authoring sheet");
check(JSON.stringify(manifest.runtimeSize) === "[512,512]", "512 square runtime sheet");
check(manifest.colorSpace === "srgb", "sRGB base color contract");
check(JSON.stringify(manifest.channels) === '["baseColor"]', "base-color-only V001");
check(manifest.gutterPx === 8, "eight pixel gutters");
check(manifest.repeatContract.includes("repeat-boundary run segmentation"), "segmentation contract");
check(manifest.claimBoundary.includes("not final independently authored"), "honest claim boundary");
check(manifest.variants.length === 3, "three interchangeable material variants");
check(receipt.pageErrors.length === 0, "no browser errors");
check(receipt.manifest.sha256 === sha256(manifestPath), "captured manifest hash");

const variantIds = new Set(manifest.variants.map((variant) => variant.id));
for (const expected of ["fantasy-masonry", "gloom-crypt", "chrome-industrial"]) {
  check(variantIds.has(expected), `${expected} variant present`);
}

const canonicalSlots = manifest.variants[0].slots.map((slot) => ({
  slotId: slot.slotId,
  semanticRole: slot.semanticRole,
  rectPx: slot.rectPx,
  repeatWorldLength: slot.repeatWorldLength,
  physicalBandHeight: slot.physicalBandHeight
}));
check(canonicalSlots.length === 6, "six semantic slots");
const roles = new Set(canonicalSlots.map((slot) => slot.semanticRole));
for (const expected of [
  "PLAIN_FALLBACK", "BASE_COURSE", "CORNICE", "COPING", "NOSING", "CURB"
]) {
  check(roles.has(expected), `${expected} role present`);
}

const slotsByY = [...canonicalSlots].sort((a, b) => a.rectPx[1] - b.rectPx[1]);
for (const [index, slot] of slotsByY.entries()) {
  const [x, y, width, height] = slot.rectPx;
  check(x === 0 && width === 512, `${slot.slotId} spans full atlas width`);
  check(y >= 0 && y + height <= 512, `${slot.slotId} is in atlas bounds`);
  check(slot.repeatWorldLength > 0, `${slot.slotId} has world repeat scale`);
  check(slot.physicalBandHeight > 0, `${slot.slotId} has physical height`);
  if (index > 0) {
    const previous = slotsByY[index - 1].rectPx;
    const gap = y - (previous[1] + previous[3]);
    check(gap >= manifest.gutterPx, `${slot.slotId} has a dilated gutter`);
  }
}

for (const variant of manifest.variants) {
  const layout = variant.slots.map((slot) => ({
    slotId: slot.slotId,
    semanticRole: slot.semanticRole,
    rectPx: slot.rectPx,
    repeatWorldLength: slot.repeatWorldLength,
    physicalBandHeight: slot.physicalBandHeight
  }));
  check(JSON.stringify(layout) === JSON.stringify(canonicalSlots), `${variant.id} uses canonical slots`);
  check(variant.derivedRoleBands === true, `${variant.id} derivation is disclosed`);
  check(variant.sourceDimensions[0] === 256 && variant.sourceDimensions[1] === 64, `${variant.id} source size`);
  check(variant.sourceStorage.kind === "lfs", `${variant.id} source is a shipped LFS asset`);
  check(variant.sourceStorage.oidSha256 === variant.sourceSha256, `${variant.id} source lineage hash`);
  const pointer = fs.readFileSync(path.join(repoRoot, variant.source), "utf8");
  check(pointer.includes(`oid sha256:${variant.sourceSha256}`), `${variant.id} checkout pointer matches source`);
  check(sha256(path.join(repoRoot, variant.output.path)) === variant.output.sha256, `${variant.id} packed sheet hash`);
  check(JSON.stringify(variant.output.dimensions) === "[512,512]", `${variant.id} packed sheet size`);
}
check(
  sha256(path.join(repoRoot, manifest.debugSheet.path)) === manifest.debugSheet.sha256,
  "diagnostic sheet hash"
);

check(receipt.captures.length === 2, "beauty and diagnostic captures");
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
  check(report.proofId === manifest.proofId, `${mode} proof id`);
  check(report.layoutId === manifest.layoutId, `${mode} layout id`);
  check(report.threeRevision === "166", `${mode} three.js r166`);
  check(report.renderer === "WebGLRenderer", `${mode} real WebGL renderer`);
  check(report.material === "MeshStandardMaterial", `${mode} stock PBR material`);
  check(report.colorSpace === "SRGBColorSpace", `${mode} renderer color space`);
  check(report.wrap === "ClampToEdgeWrapping", `${mode} atlas clamp`);
  check(report.variants.length === 3, `${mode} renders three variants`);

  for (const rendered of report.variants) {
    const variant = manifest.variants.find((item) => item.id === rendered.id);
    check(Boolean(variant), `${mode} ${rendered.id} resolves to manifest`);
    const expectedSheet = mode === "debug"
      ? "./generated/architecture-core-v1-debug.png"
      : `./generated/${variant.id}-trim-sheet.png`;
    check(rendered.sourceSheet === expectedSheet, `${mode} ${rendered.id} selected sheet`);
    check(rendered.slots.length === 6, `${mode} ${rendered.id} exposes six slots`);
    check(rendered.runs.length === 8, `${mode} ${rendered.id} mapped run count`);
    check(
      new Set(rendered.runs.map((run) => run.semanticRole)).size === 6,
      `${mode} ${rendered.id} maps every semantic role`
    );

    for (const run of rendered.runs) {
      const slot = variant.slots.find((item) => item.slotId === run.slotId);
      check(Boolean(slot), `${mode} ${rendered.id} ${run.id} slot resolves`);
      check(run.segmentCount === run.chunks.length, `${mode} ${rendered.id} ${run.id} segment count`);
      check(run.nonExactRepeat === true, `${mode} ${rendered.id} ${run.id} tests an odd run length`);
      check(
        run.maxSegmentLength <= run.repeatWorldLength + 1e-6,
        `${mode} ${rendered.id} ${run.id} never stretches a repeat`
      );
      check(
        close(run.chunks.reduce((sum, chunk) => sum + chunk.length, 0), run.length),
        `${mode} ${rendered.id} ${run.id} chunks cover the run`
      );
      check(
        run.chunks.every((chunk) => (
          chunk.u0 >= -1e-6
          && chunk.u1 <= 1 + 1e-6
          && chunk.u1 >= chunk.u0
          && chunk.length <= run.repeatWorldLength + 1e-6
        )),
        `${mode} ${rendered.id} ${run.id} U remains inside the selected band`
      );
      check(
        run.uvRange.v[0] >= run.slotVRange[0]
          && run.uvRange.v[1] <= run.slotVRange[1],
        `${mode} ${rendered.id} ${run.id} V remains inside the selected slot`
      );
    }

    for (const role of ["base", "cornice"]) {
      const back = rendered.runs.find((run) => run.id === `${role}-back`);
      const side = rendered.runs.find((run) => run.id === `${role}-side`);
      check(close(back.phaseEnd, side.phaseStart), `${mode} ${rendered.id} ${role} corner phase continuity`);
    }
  }
}

for (const variant of manifest.variants) {
  const beauty = reports.beauty.variants.find((item) => item.id === variant.id);
  const debug = reports.debug.variants.find((item) => item.id === variant.id);
  check(JSON.stringify(beauty.runs) === JSON.stringify(debug.runs), `${variant.id} geometry is mode-invariant`);
}

for (const lineage of receipt.sourceLineage) {
  const variant = manifest.variants.find((item) => item.id === lineage.id);
  check(lineage.sourceObjectSha256 === variant.sourceSha256, `${lineage.id} receipt source lineage`);
  check(lineage.packedSheetSha256 === variant.output.sha256, `${lineage.id} receipt packed lineage`);
  check(lineage.derivedRoleBands === true, `${lineage.id} receipt derivation disclosure`);
}

console.log(`PASS: ${passed} trim-sheet proof checks.`);
