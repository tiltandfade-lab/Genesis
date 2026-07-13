#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const here = path.dirname(new URL(import.meta.url).pathname);
const config = JSON.parse(fs.readFileSync(path.join(here, "toolchain.json"), "utf8"));
const root = process.env.GRAPHICS_RESEARCH_HOME || config.installRootDefault;
const req = createRequire(path.join(root, "package.json"));
const load = (name) => import(pathToFileURL(req.resolve(name)).href);

function rngFor(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const potpack = (await load("potpack")).default;
const PoissonDiskSampling = (await load("poisson-disk-sampling")).default;

const sources = [
  { slug: "banner", w: 196, h: 328 }, { slug: "knight", w: 244, h: 318 },
  { slug: "chest", w: 312, h: 206 }, { slug: "flame", w: 128, h: 224 },
  { slug: "mushrooms", w: 286, h: 180 }, { slug: "statue", w: 220, h: 356 }
];
const gutter = 4;
const boxes = sources.slice().sort((a, b) => a.slug.localeCompare(b.slug))
  .map((s) => ({ ...s, sourceW: s.w, sourceH: s.h, w: s.w + gutter * 2, h: s.h + gutter * 2 }));
const packed = potpack(boxes);
let overlap = false;
for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
  const a = boxes[i], b = boxes[j];
  if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) overlap = true;
}
const atlasProbe = {
  width: packed.w, height: packed.h, fill: packed.fill, overlap,
  deterministicKey: boxes.map((b) => `${b.slug}:${b.x},${b.y},${b.w},${b.h}`).join("|")
};

function sample(seed) {
  const sampler = new PoissonDiskSampling({ shape: [12, 9], minDistance: 0.7, maxDistance: 1.25, tries: 30 }, rngFor(seed));
  return sampler.fill().filter(([x, y]) => {
    const inCenterClear = x >= 5 && x <= 7 && y >= 3.5 && y <= 5.5;
    const inDoorApron = x <= 2 && y >= 3.5 && y <= 5.5;
    return !inCenterClear && !inDoorApron;
  }).slice(0, 24).map((p) => p.map((v) => Number(v.toFixed(5))));
}
const p1 = sample(0xC0FFEE), p2 = sample(0xC0FFEE), p3 = sample(0xC0FFEF);
let minDistance = Infinity;
for (let i = 0; i < p1.length; i++) for (let j = i + 1; j < p1.length; j++) {
  minDistance = Math.min(minDistance, Math.hypot(p1[i][0] - p1[j][0], p1[i][1] - p1[j][1]));
}
const poissonProbe = {
  count: p1.length, minDistance: Number(minDistance.toFixed(5)),
  sameSeedIdentical: JSON.stringify(p1) === JSON.stringify(p2),
  differentSeedDiffers: JSON.stringify(p1) !== JSON.stringify(p3),
  centerClear: p1.every(([x, y]) => !(x >= 5 && x <= 7 && y >= 3.5 && y <= 5.5)),
  doorApronClear: p1.every(([x, y]) => !(x <= 2 && y >= 3.5 && y <= 5.5))
};

const pass = !atlasProbe.overlap && atlasProbe.fill >= 0.65 && poissonProbe.sameSeedIdentical &&
  poissonProbe.differentSeedDiffers && poissonProbe.centerClear && poissonProbe.doorApronClear &&
  poissonProbe.minDistance >= 0.699;
console.log(JSON.stringify({ pass, atlasProbe, poissonProbe }, null, 2));
process.exitCode = pass ? 0 : 1;
