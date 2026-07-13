#!/usr/bin/env node
/* dev/graphics-regression/mutate-capture.mjs — R4's NEGATIVE-CONTROL fixture generator.

   Produces a deliberately-broken COPY of an existing capture (never edits the source capture in
   place) so run-negative-control.mjs can prove compare-regions.mjs goes RED on a real defect before
   trusting any GREEN it reports. Two modes, matching the task's explicit menu ("shift a region by a
   few px, or perturb a fixture"):

     --mode one-pixel   flips exactly ONE pixel deep inside a named region to a maximally contrasting
                         color. Proves byte-level detection sensitivity (paired with compare-regions.mjs
                         --strict, which zeroes every region's maxRatio for this one diagnostic run —
                         see run-negative-control.mjs).
     --mode shift       copies a sub-block of the SAME image back into a region rect, offset by a few
                         pixels. This is the "small-topology mutation" case: a wall/floor boundary edge
                         line shifted a few px reads exactly like the class of regression this whole
                         unit exists to catch (a wall-shell/miter defect nudging a silhouette edge) —
                         evaluated against the region mask's REAL, unmodified production thresholds, not
                         a zeroed diagnostic override.

   Never touches region-masks/ or captures/golden itself — always writes a NEW captures/<out> directory
   (full.png + a copied env.json/structural.json + a mutation.json record of exactly what was changed,
   so the negative-control report is self-documenting).
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPng, writePng } from "./lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function argVal(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const SOURCE_LABEL = argVal("--source", "golden");
const OUT_LABEL = argVal("--out", "mutated");
const MODE = argVal("--mode", "shift");
const FIXTURE = argVal("--fixture", "octagon-row101");
const REGION_ID = argVal("--region", MODE === "one-pixel" ? "practical-fixture-region" : "wall-stem-silhouette");
const SHIFT_PX = parseInt(argVal("--shift-px", "6"), 10);

const capturesDir = path.join(__dirname, "captures");
const srcDir = path.join(capturesDir, SOURCE_LABEL);
const outDir = path.join(capturesDir, OUT_LABEL);
fs.mkdirSync(outDir, { recursive: true });

function setPixel(png, x, y, [r, g, b, a]) {
  const idx = (png.width * y + x) << 2;
  png.data[idx] = r; png.data[idx + 1] = g; png.data[idx + 2] = b; png.data[idx + 3] = a;
}
function getPixel(png, x, y) {
  const idx = (png.width * y + x) << 2;
  return [png.data[idx], png.data[idx + 1], png.data[idx + 2], png.data[idx + 3]];
}

function main() {
  const maskPath = path.join(__dirname, "region-masks", `${FIXTURE}.json`);
  const mask = JSON.parse(fs.readFileSync(maskPath, "utf8"));
  const region = mask.regions.find((r) => r.id === REGION_ID);
  if (!region) throw new Error(`region '${REGION_ID}' not found in mask '${FIXTURE}'`);

  const srcFull = path.join(srcDir, "full.png");
  if (!fs.existsSync(srcFull)) throw new Error(`source capture '${SOURCE_LABEL}' missing full.png`);
  const png = readPng(srcFull);

  const mutation = { mode: MODE, sourceLabel: SOURCE_LABEL, outLabel: OUT_LABEL, fixtureId: FIXTURE, regionId: REGION_ID, appliedAt: new Date().toISOString() };

  if (MODE === "one-pixel") {
    const [rx, ry, rw, rh] = region.rect;
    const x = Math.min(png.width - 1, rx + Math.floor(rw / 2));
    const y = Math.min(png.height - 1, ry + Math.floor(rh / 2));
    const before = getPixel(png, x, y);
    // maximally contrasting: pure magenta (never a color this dungeon palette produces) at full alpha.
    const after = [255, 0, 255, 255];
    setPixel(png, x, y, after);
    mutation.pixel = { x, y, before, after };
    console.log(`[mutate-capture] one-pixel: flipped (${x},${y}) inside '${REGION_ID}' from [${before}] to [${after}]`);
  } else if (MODE === "shift") {
    const [rx, ry, rw, rh] = region.rect;
    const x0 = Math.max(0, rx), y0 = Math.max(0, ry);
    const x1 = Math.min(png.width, rx + rw), y1 = Math.min(png.height, ry + rh);
    // read the ORIGINAL block first (never read-while-write over the same buffer we're mutating).
    const block = [];
    for (let y = y0; y < y1; y++) {
      const row = [];
      for (let x = x0; x < x1; x++) row.push(getPixel(png, x, y));
      block.push(row);
    }
    let changed = 0;
    for (let y = y0; y < y1; y++) {
      const srcY = y - y0;
      const shiftedSrcY = Math.max(0, Math.min(block.length - 1, srcY - SHIFT_PX));
      for (let x = x0; x < x1; x++) {
        const srcX = x - x0;
        const shiftedSrcX = Math.max(0, Math.min(block[0].length - 1, srcX - SHIFT_PX));
        const px = block[shiftedSrcY][shiftedSrcX];
        setPixel(png, x, y, px);
        changed++;
      }
    }
    mutation.shift = { rect: region.rect, shiftPx: SHIFT_PX, pixelsRewritten: changed };
    console.log(`[mutate-capture] shift: rewrote region '${REGION_ID}' (${changed} px) offset by ${SHIFT_PX}px (simulated wall/floor boundary drift)`);
  } else {
    throw new Error(`unknown --mode '${MODE}' (expected 'one-pixel' or 'shift')`);
  }

  writePng(png, path.join(outDir, "full.png"));
  // carry env.json/structural.json forward unmodified so compare-regions.mjs's same-environment check
  // still passes (the mutation is pixel-only — it never touches the recorded environment metadata,
  // which would be a lie: the render environment genuinely did not change, only the PNG bytes were
  // hand-perturbed afterward to manufacture a known defect).
  for (const f of ["env.json", "structural.json"]) {
    const p = path.join(srcDir, f);
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(outDir, f));
  }
  fs.writeFileSync(path.join(outDir, "mutation.json"), JSON.stringify(mutation, null, 2) + "\n");
  console.log(`[mutate-capture] wrote ${path.join(outDir, "full.png")}`);
}

main();
