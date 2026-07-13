// dev/graphics-regression/lib.mjs — shared helpers for R4's capture-region regression tools.
// New path, imports pinned dev tools from ~/.genesis-geometry-tools only (never a runtime dependency,
// never vendored into the shipped app) -- same convention dev/geometry-tools/smoke-imports.mjs uses.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const toolHome = process.env.GEOMETRY_TOOLS_HOME || path.join(os.homedir(), ".genesis-geometry-tools");
const req = createRequire(path.join(toolHome, "package.json"));

export function loadPngjs() {
  const mod = req("pngjs");
  return mod.PNG || mod;
}
export function loadPixelmatch() {
  const mod = req("pixelmatch");
  return mod.default || mod;
}

export function newPng(width, height) {
  const PNG = loadPngjs();
  return new PNG({ width, height });
}

export function readPng(filePath) {
  const PNG = loadPngjs();
  return PNG.sync.read(fs.readFileSync(filePath));
}
export function writePng(png, filePath) {
  const PNG = loadPngjs();
  fs.writeFileSync(filePath, PNG.sync.write(png));
}

// crop(png, rect) -> a new pngjs PNG instance containing just rect = [x,y,w,h]. Clamps to bounds so a
// mask rect slightly larger than a smaller-than-expected capture never throws -- callers should still
// treat a clamped crop as a mismatch (see compare-regions.mjs's canvas-size guard).
export function crop(png, rect) {
  const PNG = loadPngjs();
  const [rx, ry, rw, rh] = rect;
  const x0 = Math.max(0, Math.min(rx, png.width));
  const y0 = Math.max(0, Math.min(ry, png.height));
  const x1 = Math.max(x0, Math.min(rx + rw, png.width));
  const y1 = Math.max(y0, Math.min(ry + rh, png.height));
  const w = Math.max(1, x1 - x0);
  const h = Math.max(1, y1 - y0);
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, x0, y0, w, h, 0, 0);
  return out;
}

export function loadMask(fixtureId, __dirname) {
  const p = path.join(__dirname, "region-masks", `${fixtureId}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
