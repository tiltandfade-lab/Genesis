#!/usr/bin/env node
/* dev/geometry-research/fuzz/promote-bonus-findings.mjs — UNIT R2, BONUS findings beyond the two
   REQUIRED negative controls (redfirst-faulty-adapter.mjs, negative-sy-drive.mjs).

   Two additional real, reproducible defects surfaced by the PR-smoke run across bands (see README.md's
   "PR-smoke results" + "bonus findings" sections) are promoted here as ordinary regression fixtures,
   each confirmed OUTSIDE fast-check first (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §5.4 step 3) before
   being written. R2 does not fix either -- it proves and promotes, per the same posture as the two
   required negative controls.

   1. union-idempotent / concave-shape cell duplication: a highly irregular (concave/branching)
      connected cell set, when the ENTIRE input array is duplicated (every cell appears twice), does
      NOT dedupe correctly -- floor area and triangle count literally double. Confirmed NOT to happen
      for simple convex footprints (a plain filled rectangle dedupes correctly even fully duplicated) --
      this is specifically a concave/complex-topology-triggered defect, exactly the class property-based
      fuzzing targets (docs S3.5: "a geometry function works for hand-authored fixtures and fails on a
      rare generated combination").

   2. typed-invalid-input / NaN tier silent corruption: a single cell with `tier: NaN` produces NaN
      floor VERTEX COORDINATES in compileRoomShellData's output, with zero diagnostics and no thrown
      error -- worse than a clean crash, since a consumer (the renderer) would silently draw a corrupted
      mesh. The docs S5.1 property is "typed invalid input never causes an unclassified crash OR BLANK
      result" -- a NaN-poisoned non-blank result slips between those two named failure modes; flagged as
      a real robustness gap either way. */

import { legacyAdapter } from "./adapters.mjs";
import { promoteRegression } from "./promote-regression.mjs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
let masterSha = null;
try { masterSha = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf-8" }).trim(); } catch { /* non-fatal */ }

function totalArea(out) {
  if (!out.raw) return null;
  const idx = out.raw.floor.indices, pos = out.raw.floor.positions;
  let s = 0;
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    s += Math.abs((pos[b] - pos[a]) * (pos[c + 2] - pos[a + 2]) - (pos[c] - pos[a]) * (pos[b + 2] - pos[a + 2])) / 2;
  }
  return s;
}

console.log("=== bonus finding #1: union-idempotent fails on a concave/branching cell set when the input is fully duplicated ===");
{
  // fast-check's own shrink of this defect (concavity-heavy band, seed 100002) -- reproduced here
  // OUTSIDE fast-check, deterministically, with no fast-check involvement in this block.
  const cells = [
    { x: 0, z: 0, tier: 0 }, { x: -1, z: 0, tier: 0 }, { x: -1, z: 1, tier: 0 }, { x: -1, z: -1, tier: 0 },
    { x: -1, z: 2, tier: 0 }, { x: -2, z: -1, tier: 0 }, { x: 1, z: 0, tier: 0 }, { x: 1, z: -1, tier: 0 },
    { x: 2, z: 0, tier: 0 }, { x: 2, z: -1, tier: 0 }, { x: -2, z: 0, tier: 0 }, { x: 1, z: 1, tier: 0 },
    { x: 1, z: 2, tier: 0 }, { x: -2, z: 1, tier: 0 }, { x: 0, z: 2, tier: 0 }, { x: -1, z: 3, tier: 0 },
    { x: 3, z: -1, tier: 0 }, { x: 0, z: 3, tier: 0 }, { x: 2, z: 1, tier: 0 }, { x: -2, z: 2, tier: 0 },
    { x: 0, z: 4, tier: 0 }, { x: 1, z: 4, tier: 0 }, { x: 4, z: -1, tier: 0 }, { x: 4, z: -2, tier: 0 },
    { x: -3, z: 2, tier: 0 },
  ];
  const scenario = { cells, apertures: [], terrain: [], renderShape: "identity", wallProfile: null };
  const dup = { ...scenario, cells: [...cells, ...cells] };
  const plain = legacyAdapter(scenario), duped = legacyAdapter(dup);
  const plainArea = totalArea(plain), dupedArea = totalArea(duped);
  const reproduced = Math.abs(dupedArea - plainArea * 2) < 1e-6 && Math.abs(dupedArea - plainArea) > 1;
  console.log(`  plain area: ${plainArea}, fully-duplicated-input area: ${dupedArea} (expected identical if idempotent)`);
  console.log(`  reproduced outside fast-check: ${reproduced}`);
  if (!reproduced) { console.error("  refusing to promote -- did not reproduce"); process.exit(1); }
  const { record, wasNew } = promoteRegression({
    property: "union-idempotent",
    seed: 100002,
    path: "26 (concavity-heavy band, PR-smoke run)",
    foundBy: "fast-check",
    cells,
    tiers: { 0: cells.length },
    apertures: [],
    profile: {},
    expected: {
      knownRed: true,
      reason: "compileRoomShellData does not dedupe a fully-duplicated concave/branching cell-set input; " +
        "area and triangle count double. A simple filled rectangle dedupes correctly under the same " +
        "duplication, so this is concavity/topology-triggered, not a blanket duplicate-handling absence.",
      plainArea, dupedArea,
    },
    firstSeenCommit: masterSha,
    notes: "R2 bonus finding beyond the two required negative controls -- see README.md.",
    scenario,
  });
  console.log(`  promoted: ${record.id} (${wasNew ? "new" : "already existed"})\n`);
}

console.log("=== bonus finding #2: a single NaN tier silently produces NaN floor vertices (no throw, no diagnostic) ===");
{
  const cells = [{ x: 0, z: 0, tier: 0 }, { x: 1, z: 0, tier: NaN }, { x: 2, z: 0, tier: 0 }];
  const scenario = { cells, apertures: [], terrain: [], renderShape: "identity", wallProfile: null };
  const out = legacyAdapter(scenario);
  const hasNaN = out.raw && out.raw.floor.positions.some((v) => !Number.isFinite(v));
  const hasDiagnostic = out.diagnostics && out.diagnostics.length > 0;
  const reproduced = hasNaN && !hasDiagnostic;
  console.log(`  NaN in output positions: ${hasNaN}, diagnostic present: ${hasDiagnostic}`);
  console.log(`  reproduced outside fast-check: ${reproduced}`);
  if (!reproduced) { console.error("  refusing to promote -- did not reproduce"); process.exit(1); }
  const { record, wasNew } = promoteRegression({
    property: "all-vertices-finite",
    seed: 100008,
    path: "2 (invalid-input band, PR-smoke run)",
    foundBy: "fast-check",
    cells,
    tiers: { 0: 2, NaN: 1 },
    apertures: [],
    profile: {},
    expected: {
      knownRed: true,
      reason: "a single cell with tier:NaN produces NaN vertex coordinates in compileRoomShellData's " +
        "floor.positions buffer, with zero diagnostics and no thrown error -- a nonempty input that " +
        "silently corrupts rather than either cleanly failing or cleanly diagnosing.",
    },
    firstSeenCommit: masterSha,
    notes: "R2 bonus finding beyond the two required negative controls -- see README.md.",
    scenario,
  });
  console.log(`  promoted: ${record.id} (${wasNew ? "new" : "already existed"})`);
}
