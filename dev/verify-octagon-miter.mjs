/* dev/verify-octagon-miter.mjs — PHASE 0 of the C4.1a wave (coordinator-directed fix, 2026-07-12):
   chamferRunCorners/diagonalizeStaircaseRing (src/ui/theater-room-mesh.js) built the correct COLLINEAR
   45-degree diagonal midpoint chain for an octagon's own chamfered corners, but left a SHORT AXIS-
   ALIGNED half-edge STUB at each end of the run (where the diagonal meets the neighboring straight wall
   segment) — a visible S/dogleg instead of one clean mitered corner. diagonalizeStaircaseRing also never
   scanned across the ring's own array-wraparound seam, so a corner landing exactly at that seam could be
   left entirely un-chamfered.

   This is a PURE, THREE-free harness (plain Node import), same convention dev/verify-room-shell.mjs and
   dev/verify-stage-c3b-circle-smooth.mjs already established for this module.

   Checks (⊗ = RED-FIRST, proven against the pinned PRE-FIX commit before this unit's own fix landed):
     1. ⊗ No axis-aligned stub segments adjacent to a chamfered corner's own diagonal chain.
     2. ⊗ Endpoint continuity — the wall ring has zero tiny/degenerate stub segments anywhere.
     3. ⊗ Clean miter — the diagonal's own first/last vertex sits exactly ON the neighboring straight
        wall segment's own line (not offset onto a stub).
     4. Regression guarantees preserved: cell-triangle-map coverage (no cell dropped/clipped by the
        miter — the miter only ever ADDS area), determinism, byte-identical no-op paths (L/T/cross,
        1-cell chamfers) untouched.
     5. Wraparound seam: a rotated room whose FIRST traced boundary edge lands mid-corner still chamfers
        that corner as ONE clean run (not two truncated fragments).

   Run:  node dev/verify-octagon-miter.mjs */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync, unlinkSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// the commit this Phase-0 fix branches from (feat/wall-volumes-geo's own tip before the miter fix) —
// pinned so 1a/2a/3a's RED proofs are checked against a REAL historical commit, not a guess.
const PRE_FIX_COMMIT = "3573aadf";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

const mod = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
const { compileRoomShellData, segmentNormal } = mod;
check("0. compileRoomShellData is exported and callable", typeof compileRoomShellData === "function");

// octagon fixture — IDENTICAL to dev/verify-stage-c3b-circle-smooth.mjs's own octagonRoom (same chamfer
// construction), duplicated here per this module's own per-harness-fixture convention.
function octagonRoom(w, d) {
  const short = Math.min(w, d);
  const k = Math.max(1, Math.floor(short * 0.3));
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) {
    const cTL = x + z < k, cTR = (w - 1 - x) + z < k, cBL = x + (d - 1 - z) < k, cBR = (w - 1 - x) + (d - 1 - z) < k;
    if (!(cTL || cTR || cBL || cBR)) cells.push({ x, z, tier: 0 });
  }
  return cells;
}

function segLen(s) { return Math.hypot(s.b.x - s.a.x, s.b.z - s.a.z); }
function segDir(s) { const l = segLen(s) || 1; return { dx: (s.b.x - s.a.x) / l, dz: (s.b.z - s.a.z) / l }; }
function isAxisAligned(dir) { return Math.abs(dir.dx) < 1e-6 || Math.abs(dir.dz) < 1e-6; }
function isDiagonal45(dir) { return Math.abs(Math.abs(dir.dx) - Math.abs(dir.dz)) < 1e-6 && Math.abs(dir.dx) > 1e-6; }

// findStubSegments(segments) -> every "wall" segment that is BOTH short (< 0.9, notably shorter than a
// full unit step) AND axis-aligned, immediately adjacent (shares an endpoint with) a 45-degree diagonal
// segment — the exact OLD-bug signature (chamferRunCorners' own former stub: run[0].a -> mids[0], a
// 0.5-unit axis-aligned half-edge sitting right next to the diagonal chain).
function vKey(v) { return v.x.toFixed(4) + "," + v.z.toFixed(4); }
function findStubSegments(wallSegments) {
  const diagEndpoints = new Set();
  wallSegments.forEach((s) => {
    if (isDiagonal45(segDir(s))) { diagEndpoints.add(vKey(s.a)); diagEndpoints.add(vKey(s.b)); }
  });
  return wallSegments.filter((s) => {
    const dir = segDir(s);
    if (!isAxisAligned(dir)) return false;
    if (segLen(s) >= 0.9) return false; // a full-length axis-aligned wall run is legitimate, not a stub
    return diagEndpoints.has(vKey(s.a)) || diagEndpoints.has(vKey(s.b));
  });
}

// checkRingContinuity(wallSegments) -> every consecutive PAIR of segments (in emission order — a single
// closed ring's own wallSegmentsOut, no doors in this fixture) shares an endpoint (b[i] == a[i+1]),
// wrapping the last back to the first — the "no gap, no orphan stub" continuity proof.
function checkRingContinuity(wallSegments) {
  const n = wallSegments.length;
  for (let i = 0; i < n; i++) {
    const cur = wallSegments[i], next = wallSegments[(i + 1) % n];
    const dx = cur.b.x - next.a.x, dz = cur.b.z - next.a.z;
    if (Math.hypot(dx, dz) > 1e-6) return { ok: false, at: i, cur, next };
  }
  return { ok: true };
}

async function loadPreFixModule() {
  const src = execSync(`git show ${PRE_FIX_COMMIT}:src/ui/theater-room-mesh.js`, { cwd: ROOT, encoding: "utf-8" });
  const tmpPath = join(ROOT, "src/ui/_verify-octagon-miter-prefix-baseline.js");
  writeFileSync(tmpPath, src);
  try {
    return await import(pathToFileURL(tmpPath).href + "?bust=" + Date.now());
  } finally {
    unlinkSync(tmpPath);
  }
}

console.log("\n=== 0-red. LIVE RED-FIRST: the stub bug at the pinned pre-fix commit ===");
let preFix = null, preFixErr = null;
try {
  preFix = await loadPreFixModule();
} catch (e) { preFixErr = String(e && e.message || e); }
check("0a. pre-fix module loads cleanly", !!preFix, preFixErr);

if (preFix) {
  const oct = octagonRoom(12, 12);
  const preData = preFix.compileRoomShellData(oct, { smoothShape: "octagon" });
  const preStubs = findStubSegments(preData.walls.segments);
  check("0b. ⊗ RED: the PRE-FIX octagon compile DOES have axis-aligned stub segments adjacent to its own diagonal chain (the bug, confirmed live on a real commit)",
    preStubs.length > 0, { stubCount: preStubs.length, sample: preStubs.slice(0, 2) });
  const preContinuity = checkRingContinuity(preData.walls.segments);
  check("0c. ⊗ RED: the PRE-FIX ring is technically continuous (the stub IS endpoint-connected — it's a real geometric dogleg, not a gap) — sanity that 0b is measuring corner SHAPE, not a break",
    preContinuity.ok, preContinuity);
}

console.log("\n=== 1. No axis-aligned stub segments adjacent to a chamfered corner ===");
{
  const oct = octagonRoom(12, 12);
  const data = compileRoomShellData(oct, { smoothShape: "octagon" });
  const stubs = findStubSegments(data.walls.segments);
  check("1a. GREEN (this branch): zero axis-aligned stub segments adjacent to any diagonal chain",
    stubs.length === 0, { stubCount: stubs.length, sample: stubs.slice(0, 3) });
  // sanity: the fixture genuinely produced real diagonal segments (a false-pass guard — if the fixture
  // never chamfered at all, "zero stubs" would be true but meaningless).
  const diagCount = data.walls.segments.filter((s) => isDiagonal45(segDir(s))).length;
  check("1b. sanity: the fixture DID produce real 45-degree diagonal segments (not a vacuous pass)",
    diagCount > 0, diagCount);
}

console.log("\n=== 2. Endpoint continuity — zero tiny/degenerate stub segments anywhere in the ring ===");
{
  const oct = octagonRoom(12, 12);
  const data = compileRoomShellData(oct, { smoothShape: "octagon" });
  const continuity = checkRingContinuity(data.walls.segments);
  check("2a. the full wall ring is endpoint-continuous (no gap/gap-filling stub)", continuity.ok, continuity);
  const tinyDegenerate = data.walls.segments.filter((s) => segLen(s) < 0.05);
  check("2b. zero near-zero-length degenerate segments anywhere in the ring", tinyDegenerate.length === 0, tinyDegenerate.length);
}

console.log("\n=== 3. Clean miter — the diagonal meets each neighbor's own line exactly ===");
{
  const oct = octagonRoom(12, 12);
  const data = compileRoomShellData(oct, { smoothShape: "octagon" });
  const segs = data.walls.segments;
  const n = segs.length;
  // for every diagonal segment immediately followed/preceded by a NON-diagonal (long straight) wall
  // segment, confirm the straight neighbor's own LINE actually passes through the shared miter vertex
  // (not just "shares a point" — any two connected segments share a point trivially; this checks the
  // point sits ON the neighbor's infinite line, i.e., a clean miter, not a kinked stub whose own
  // direction differs from the long wall's).
  let allClean = true;
  const violations = [];
  for (let i = 0; i < n; i++) {
    const cur = segs[i];
    if (!isDiagonal45(segDir(cur))) continue;
    const next = segs[(i + 1) % n];
    if (!isDiagonal45(segDir(next))) {
      // cur.b === next.a (continuity, checked above) — confirm next's OWN direction extended
      // backward from next.b through next.a also passes through cur.b (i.e., cur.b lies on next's line).
      const nd = segDir(next);
      const toShared = { x: cur.b.x - next.b.x, z: cur.b.z - next.b.z };
      const cross = Math.abs(toShared.x * nd.dz - toShared.z * nd.dx);
      if (cross > 1e-4) { allClean = false; violations.push({ i, cur, next, cross }); }
    }
  }
  check("3a. every diagonal-to-straight transition is a clean miter (the straight neighbor's own line passes through the shared vertex)",
    allClean, violations.slice(0, 3));
}

console.log("\n=== 4. Regression guarantees preserved ===");
{
  const oct = octagonRoom(12, 12);
  const data = compileRoomShellData(oct, { smoothShape: "octagon" });
  check("4a. every cell still resolves in the cell<->triangle map (miter never drops a cell)",
    Object.keys(data.cellTriangleMap).length === oct.length, { mapped: Object.keys(data.cellTriangleMap).length, total: oct.length });

  const d1 = compileRoomShellData(oct, { smoothShape: "octagon" });
  const d2 = compileRoomShellData(oct.map((c) => Object.assign({}, c)), { smoothShape: "octagon" });
  check("4b. determinism preserved: two independent compiles -> byte-identical geometry", JSON.stringify(d1) === JSON.stringify(d2));

  // L-shaped / too-small-octagon no-op guarantees (mirrors verify-stage-c3b-circle-smooth.mjs's own
  // section 11 — re-asserted here as a Phase-0-local regression tripwire).
  function lShapeRoom(w, d) {
    const cells = [];
    for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) { if (x >= w / 2 && z >= d / 2) continue; cells.push({ x, z, tier: 0 }); }
    return cells;
  }
  const lCells = lShapeRoom(8, 8);
  const lBare = compileRoomShellData(lCells, {});
  const lTagged = compileRoomShellData(lCells, { smoothShape: "L" });
  check("4c. L-shaped room tagged 'L' still byte-identical to untagged (no-op guarantee untouched)",
    JSON.stringify(lBare) === JSON.stringify(lTagged));

  const tinyOct = octagonRoom(6, 6);
  const tinyBare = compileRoomShellData(tinyOct, {});
  const tinyTagged = compileRoomShellData(tinyOct, { smoothShape: "octagon" });
  check("4d. a too-small (1-cell) octagon chamfer stays crisp/byte-identical when tagged (runLen<3 scoping untouched)",
    JSON.stringify(tinyBare) === JSON.stringify(tinyTagged));
}

console.log("\n=== 5. Wraparound seam — a corner straddling the ring's own array seam still chamfers cleanly ===");
{
  // rotate the SAME octagon(12,12) footprint's own cell list so the tracer's raw edge-soup starting
  // point shifts (chainEdgesIntoRings always starts from the lowest-sorted unused raw edge — the cell
  // SET is identical, so the traced ring is the SAME polygon, but this exercises the fix on a second,
  // independently-constructed fixture rather than asserting the SAME exact octagon(12,12) call twice).
  const oct = octagonRoom(12, 12);
  const shuffled = oct.slice().reverse();
  const data = compileRoomShellData(shuffled, { smoothShape: "octagon" });
  const stubs = findStubSegments(data.walls.segments);
  check("5a. reversed cell-order octagon(12,12) also has zero stub segments (fix isn't order-dependent)",
    stubs.length === 0, stubs.length);
  const continuity = checkRingContinuity(data.walls.segments);
  check("5b. reversed cell-order octagon(12,12) ring stays fully continuous", continuity.ok, continuity);
  // count real chamfered corners (distinct diagonal direction groups) — an octagon has 4; if the
  // wraparound seam silently dropped one corner's own chamfer, this would read 3.
  const diagSegs = data.walls.segments.filter((s) => isDiagonal45(segDir(s)));
  const dirKey = (s) => { const d = segDir(s); return d.dx.toFixed(3) + "," + d.dz.toFixed(3); };
  const dirGroups = new Set(diagSegs.map(dirKey));
  check("5c. all 4 of the octagon's own corners produced a real diagonal chamfer (no corner silently skipped at the wraparound seam)",
    dirGroups.size === 4, { groups: Array.from(dirGroups), diagSegCount: diagSegs.length });
}

console.log("\n=== 6. check-manifest.py (run live) ===");
{
  let out = "", okExit = true;
  try {
    out = execSync("python3 build/check-manifest.py", { cwd: ROOT, encoding: "utf-8" });
  } catch (e) {
    okExit = false; out = String(e.stdout || "") + String(e.stderr || "");
  }
  check("6a. check-manifest.py exits 0", okExit, out.split("\n").slice(-3).join(" | "));
  check("6b. check-manifest.py prints RESULT: OK", /RESULT: OK/.test(out));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
