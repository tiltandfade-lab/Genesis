#!/usr/bin/env node
/* dev/geometry-research/bakeoff/run-performance.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md
   §13.4, §4.5). Performance-only run, deliberately separate from run-correctness.mjs (the doc: "Run
   timing in a process separate from lint/fuzz instrumentation. Do not compare one warmed path with
   another cold path.") — every path gets its own warm-up phase before its own 200+ timed iterations.

   Fixture CLASSES (not all 52 individual fixtures — the doc's own §4.5 unit is "per fixture class"):
   representative small/medium/large, hole-bearing, and octagon fixtures spanning the corpus's own
   complexity range, so the report reflects real scaling behavior without an unbounded runtime.

   Run:  node dev/geometry-research/bakeoff/run-performance.mjs
   Writes: dev/geometry-research/bakeoff/performance-report.json */

import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import os from "node:os";
import zlib from "node:zlib";
import { runAdapter, PATHS } from "./adapters.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const corpus = await import(pathToFileURL(join(ROOT, "dev/geometry-research/fixtures/corpus.mjs")).href);
const { FIXTURES_BY_ID } = corpus;

// representative fixture classes — id -> human label (matches GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.3's
// own class vocabulary: small/large room, hole-bearing, octagon-at-scale, shuffled-order stress).
const CLASSES = [
  ["F01-one-cell", "minimal (1 cell)"],
  ["F02-2x2-rect", "tiny rect (4 cells)"],
  ["F25-tiny-room-canonical-minimum", "small rect (16 cells)"],
  ["F15-donut-one-hole", "hole-bearing (72 cells, 1 hole)"],
  ["F16-outer-two-holes", "hole-bearing (151 cells, 2 holes)"],
  ["F07-chamfered-octagon", "octagon mid (120 cells)"],
  ["B12-octagon-grand-room-size", "octagon grand (316 cells)"],
  ["F27-large-room-near-max", "large rect (576 cells)"],
  ["F18-row101-exact-canonical", "row-101 multi-tier (120 cells, 3 tiers)"],
];

const ITERATIONS = 200;
const WARMUP = 20;

function vendorBytes(pkgDirRel) {
  const toolHome = process.env.GEOMETRY_TOOLS_HOME || join(os.homedir(), ".genesis-geometry-tools");
  const dir = join(toolHome, "node_modules", pkgDirRel);
  try {
    const out = execSync(`du -sk "${dir}"`, { encoding: "utf-8" }).trim();
    const kb = parseInt(out.split(/\s+/)[0], 10);
    return kb * 1024;
  } catch { return null; }
}

function gzipSize(filePath) {
  try {
    const buf = readFileSync(filePath);
    return zlib.gzipSync(buf, { level: 9 }).length;
  } catch { return null; }
}

const toolHome = process.env.GEOMETRY_TOOLS_HOME || join(os.homedir(), ".genesis-geometry-tools");
const vendorInfo = {
  "polygon-clipping": {
    rawBytes: vendorBytes("polygon-clipping"),
    gzipEntryBytes: gzipSize(join(toolHome, "node_modules/polygon-clipping/dist/polygon-clipping.cjs.js")),
  },
  "earcut": {
    rawBytes: vendorBytes("earcut"),
    gzipEntryBytes: gzipSize(join(toolHome, "node_modules/earcut/dist/earcut.min.js")),
  },
  "clipper2-ts": {
    rawBytes: vendorBytes("clipper2-ts"),
    gzipEntryBytes: gzipSize(join(toolHome, "node_modules/clipper2-ts/dist/clipper2.min.mjs")),
  },
  "robust-predicates": {
    rawBytes: vendorBytes("robust-predicates"),
    gzipEntryBytes: gzipSize(join(toolHome, "node_modules/robust-predicates/index.js")),
  },
};

console.log("=== CHARTER STATEMENT ===");
console.log("  Rung: C0->C1 decision input (geometry stack selection) — performance half of R1");
console.log("  Canonical contracts preserved: spike-only, dev-only, no production edits");
console.log("  Classification: research-only\n");
console.log("Machine:", os.cpus()[0]?.model, `x${os.cpus().length}`, os.platform(), os.arch());
console.log("Node:", process.version);

let gitSha = null;
try { gitSha = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf-8" }).trim(); } catch { /* non-fatal */ }
console.log("Commit:", gitSha, "\n");

const report = {
  generatedAt: new Date().toISOString(),
  machine: { cpu: os.cpus()[0]?.model, cpuCount: os.cpus().length, platform: os.platform(), arch: os.arch(), totalMemBytes: os.totalmem() },
  node: process.version,
  gitSha,
  iterations: ITERATIONS,
  warmup: WARMUP,
  vendorInfo,
  results: [], // flat array of {path, fixture, iterations, inputCells, outputVertices, outputTriangles, medianMs, p95Ms, maxMs, heapDeltaBytes}
};

function percentile(sorted, p) {
  const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
  return sorted[idx];
}

for (const pathId of PATHS) {
  for (const [fixtureId, label] of CLASSES) {
    const fixture = FIXTURES_BY_ID.get(fixtureId);
    if (!fixture) { console.log(`  SKIP ${pathId}/${fixtureId}: not found in corpus`); continue; }
    // warm-up (separate from timed loop; JIT + first-import cost absorbed here)
    for (let i = 0; i < WARMUP; i++) await runAdapter(pathId, fixture);
    if (global.gc) global.gc();
    const heapBefore = process.memoryUsage().heapUsed;
    const timings = [];
    let lastOut = null;
    for (let i = 0; i < ITERATIONS; i++) {
      const t0 = performance.now();
      lastOut = await runAdapter(pathId, fixture);
      timings.push(performance.now() - t0);
    }
    if (global.gc) global.gc();
    const heapAfter = process.memoryUsage().heapUsed;
    const sorted = timings.slice().sort((a, b) => a - b);
    const outputVertices = lastOut.surfaces.reduce((s, sf) => s + sf.vertices.length, 0);
    const outputTriangles = lastOut.surfaces.reduce((s, sf) => s + sf.indices.length / 3, 0);
    const row = {
      path: pathId, fixture: fixtureId, label, iterations: ITERATIONS,
      inputCells: fixture.cells.length, outputVertices, outputTriangles,
      medianMs: percentile(sorted, 0.5), p95Ms: percentile(sorted, 0.95), maxMs: sorted[sorted.length - 1],
      minMs: sorted[0], heapDeltaBytes: heapAfter - heapBefore,
    };
    report.results.push(row);
    console.log(`  ${pathId} / ${fixtureId} (${label}): median=${row.medianMs.toFixed(3)}ms p95=${row.p95Ms.toFixed(3)}ms max=${row.maxMs.toFixed(3)}ms cells=${row.inputCells} verts=${row.outputVertices} tris=${row.outputTriangles}`);
  }
}

const reportPath = join(ROOT, "dev/geometry-research/bakeoff/performance-report.json");
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\nwrote ${reportPath}`);
console.log("\nNOTE: run with --expose-gc for cleaner heapDeltaBytes readings (node --expose-gc run-performance.mjs); without it, heapDeltaBytes includes normal GC noise.");
