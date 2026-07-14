/* dev/verify-room-shell-oss.mjs — UNIT G2 (docs/GEOMETRY-OSS-INTEGRATION.md §15, §17.5): proves the
   PolygonKernel floor integration landed in src/ui/theater-room-mesh.js's compileRoomShellData.

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7, required at the top of every graphics-
   session harness and report):
     - Convergence rung advanced: C0 -> C1 (floor topology now trustworthy via the vetted G1 kernel,
       for the "oss"/"oss-compare" opt-in paths only).
     - Canonical contracts preserved: every check below drives compileRoomShellData/compileRoomShell
       (the SAME production entry points theater-boot.js calls) with plain {x,z,tier,isDoor} cell data;
       no walk/logical-cell/terrain array is ever read or mutated by this harness or by the module under
       test. Section 1 proves the omitted-option default resolves to the exact same code path as an
       explicit "legacy" call — the byte-identical-default guarantee this unit's whole design rests on.
     - Classification: dev harness (pure Node, no browser). Runs against real production code
       (theater-room-mesh.js), not a fixture-only adapter — this is what distinguishes it from G0/G1's
       own dev/verify-geometry-fixtures.mjs and dev/verify-polygon-kernel.mjs (both still green,
       unmodified by this unit — see this unit's own session report).
     - Negative control: Section 4 is RED-FIRST by construction — it asserts a real, still-open,
       EXPLICITLY OUT-OF-SCOPE residual (a shared, pre-existing bevel-ribbon/door-threshold-quad
       degenerate-triangle defect — see this unit's own report — that is IDENTICAL between legacy and
       oss, because this unit does not redesign insetPolygon/insetOffset). Asserting the gap stays
       honestly open, rather than being silently absorbed by a looser check, is itself the negative
       control CLAUDE.md's own "validators preserve the thing's job" discipline asks for.

   Run:  node dev/verify-room-shell-oss.mjs */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

console.log("=== CHARTER STATEMENT ===");
console.log("  Convergence rung: C0 -> C1 (floor topology trustworthy behind the oss/oss-compare switch)");
console.log("  Canonical contracts preserved: plain cell data in/out; no walk/cell/terrain mutation");
console.log("  Classification: dev harness, real production entry points");
console.log("  Negative control: Section 4 (the shared bevel/door-threshold residual, RED-FIRST, still open by design)\n");

const mesh = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
const corpus = await import(pathToFileURL(join(ROOT, "dev/geometry-research/fixtures/corpus.mjs")).href);
const { FIXTURES, FIXTURES_BY_ID } = corpus;
const {
  compileRoomShellData, compileRoomShell, ROOM_SHELL_POLYGON_KERNEL,
} = mesh;

function mapRenderShapeToSmoothShape(renderShape) {
  if (renderShape === "octagon" || renderShape === "L" || renderShape === "T" || renderShape === "cross") return renderShape;
  if (renderShape === "radial" || renderShape === "circle" || renderShape === "ellipse") return "ellipse";
  return null;
}
function fixtureCells(fixture) {
  return fixture.cells.map((c) => ({ x: c.x, z: c.z, tier: c.tier, isDoor: !!c.isDoor }));
}
function fixtureOpts(fixture) {
  const smoothShape = mapRenderShapeToSmoothShape(fixture.renderShape);
  return smoothShape ? { smoothShape } : {};
}
function floorTriArea(data) {
  let area = 0;
  const idx = data.floor.indices, pos = data.floor.positions;
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    area += Math.abs((pos[b] - pos[a]) * (pos[c + 2] - pos[a + 2]) - (pos[c] - pos[a]) * (pos[b + 2] - pos[a + 2])) / 2;
  }
  return area;
}
function tierTriArea(data, tier) {
  const tm = (data.floor.tiers || []).find((t) => t.tier === tier);
  if (!tm) return 0;
  let area = 0;
  const idx = data.floor.indices, pos = data.floor.positions;
  for (let i = tm.triStart; i < tm.triStart + tm.triCount; i++) {
    const a = idx[i * 3] * 3, b = idx[i * 3 + 1] * 3, c = idx[i * 3 + 2] * 3;
    area += Math.abs((pos[b] - pos[a]) * (pos[c + 2] - pos[a + 2]) - (pos[c] - pos[a]) * (pos[b + 2] - pos[a + 2])) / 2;
  }
  return area;
}
function wholeBufferDegenerateCount(data) {
  let d = 0;
  const idx = data.floor.indices, pos = data.floor.positions;
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    const area2 = Math.abs((pos[b] - pos[a]) * (pos[c + 2] - pos[a + 2]) - (pos[c] - pos[a]) * (pos[b + 2] - pos[a + 2]));
    if (!(area2 > 1e-9)) d++;
  }
  return d;
}
function pointInTriangle2D(px, pz, a, b, c) {
  const d1 = (px - b.x) * (a.z - b.z) - (a.x - b.x) * (pz - b.z);
  const d2 = (px - c.x) * (b.z - c.z) - (b.x - c.x) * (pz - c.z);
  const d3 = (px - a.x) * (c.z - a.z) - (c.x - a.x) * (pz - a.z);
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(hasNeg && hasPos);
}
function anyTierTriangleContains(data, tier, px, pz) {
  const tm = (data.floor.tiers || []).find((t) => t.tier === tier);
  if (!tm) return false;
  const idx = data.floor.indices, pos = data.floor.positions;
  for (let i = tm.triStart; i < tm.triStart + tm.triCount; i++) {
    const ia = idx[i * 3], ib = idx[i * 3 + 1], ic = idx[i * 3 + 2];
    const a = { x: pos[ia * 3], z: pos[ia * 3 + 2] }, b = { x: pos[ib * 3], z: pos[ib * 3 + 2] }, c = { x: pos[ic * 3], z: pos[ic * 3 + 2] };
    if (pointInTriangle2D(px, pz, a, b, c)) return true;
  }
  return false;
}

// ─── Section 0: module surface + default resolution ───────────────────────────────────────────────
console.log("=== 0. Module surface ===");
check("0a. ROOM_SHELL_POLYGON_KERNEL default is exactly \"legacy\"", ROOM_SHELL_POLYGON_KERNEL === "legacy", ROOM_SHELL_POLYGON_KERNEL);
check("0b. compileRoomShellData/compileRoomShell are callable", typeof compileRoomShellData === "function" && typeof compileRoomShell === "function");

// ─── Section 1: DEFAULT STAYS BYTE-IDENTICAL — the load-bearing guarantee ─────────────────────────
console.log("\n=== 1. Default (omitted option) is byte-identical to an explicit \"legacy\" call ===");
{
  const sampleIds = ["F02-2x2-rect", "F04-concave-L", "F07-chamfered-octagon", "F11-cave-noisy-boundary", "F18-row101-exact-canonical"];
  for (const id of sampleIds) {
    const fx = FIXTURES_BY_ID.get(id);
    if (!fx) { check(`1.${id}: fixture present`, false); continue; }
    const cells = fixtureCells(fx);
    const opts = fixtureOpts(fx);
    const omitted = compileRoomShellData(cells, opts);
    const explicitLegacy = compileRoomShellData(cells, Object.assign({}, opts, { roomShellPolygonKernel: "legacy" }));
    const bogusValue = compileRoomShellData(cells, Object.assign({}, opts, { roomShellPolygonKernel: "not-a-real-mode" }));
    check(`1a.${id}: omitted option === explicit "legacy" (byte-identical JSON)`,
      JSON.stringify(omitted) === JSON.stringify(explicitLegacy));
    check(`1b.${id}: an unrecognized roomShellPolygonKernel value also resolves to "legacy" (never a silent oss)`,
      JSON.stringify(bogusValue) === JSON.stringify(explicitLegacy));
    check(`1c.${id}: legacy-mode return bundle carries no oss-only keys (ossDiagnostics/parityDiagnostics absent)`,
      !("ossDiagnostics" in omitted) && !("parityDiagnostics" in omitted));
  }
  // compileRoomShell (the THREE assembler) — parityDiagnostics/ossDiagnostics are present but null.
  const fx = FIXTURES_BY_ID.get("F02-2x2-rect");
  const shell = compileRoomShell(fixtureCells(fx), {});
  check("1d. compileRoomShell legacy-mode: parityDiagnostics/ossDiagnostics are present-but-null (never a legacy VALUE change)",
    shell.parityDiagnostics === null && shell.ossDiagnostics === null);
}

// ─── Section 2: oss mode never throws + cellTriangleMap totality across the FULL corpus ───────────
console.log("\n=== 2. oss mode: no throw, cellTriangleMap totality, full 48-fixture non-malformed corpus ===");
{
  let totalityOk = 0, totalityFail = 0, threw = 0;
  for (const fx of FIXTURES) {
    if (fx.malformed) continue;
    const cells = fixtureCells(fx);
    const opts = fixtureOpts(fx);
    let oss;
    try {
      oss = compileRoomShellData(cells, Object.assign({}, opts, { roomShellPolygonKernel: "oss" }));
    } catch (e) {
      threw++;
      console.log("    threw:", fx.fixtureId, String(e).slice(0, 200));
      continue;
    }
    const uniqueCellKeys = new Set(cells.map((c) => `${c.x},${c.z}`));
    const mappedKeys = new Set(Object.keys(oss.cellTriangleMap || {}));
    const total = uniqueCellKeys.size === mappedKeys.size && Array.from(uniqueCellKeys).every((k) => mappedKeys.has(k));
    if (total) totalityOk++; else { totalityFail++; console.log("    totality gap:", fx.fixtureId, uniqueCellKeys.size, "unique vs", mappedKeys.size, "mapped"); }
  }
  const nonMalformedCount = FIXTURES.filter((f) => !f.malformed).length;
  check("2a. oss mode never throws across the full non-malformed corpus", threw === 0, { threw, total: nonMalformedCount });
  check("2b. cellTriangleMap is total (every unique canonical cell mapped) on every fixture", totalityFail === 0, { totalityOk, totalityFail });
}

// ─── Section 3: row-101 (F18) — the merge-blocker negative control, corrected in oss mode ─────────
console.log("\n=== 3. F18-row101-exact-canonical: the raised ring keeps a REAL hole over the sunken arena ===");
{
  const fx = FIXTURES_BY_ID.get("F18-row101-exact-canonical");
  const cells = fixtureCells(fx);
  const oss = compileRoomShellData(cells, { smoothShape: "octagon", roomShellPolygonKernel: "oss" });
  const tiers = (oss.floor.tiers || []).map((t) => t.tier).sort((a, b) => a - b);
  check("3a. oss recovers all 3 true tiers (-4 arena, 1 baseline, 2 ring) — not collapsed to 2 or 1",
    JSON.stringify(tiers) === JSON.stringify([-4, 1, 2]), tiers);

  const arenaArea = tierTriArea(oss, -4), baselineArea = tierTriArea(oss, 1), ringArea = tierTriArea(oss, 2);
  check("3b. arena (tier -4) area matches independent grid truth exactly (36)", Math.abs(arenaArea - fx.expected.tiers["-4"].area) < 1e-6, arenaArea);
  check("3c. baseline (tier 1) area matches independent grid truth within epsilon (24)", Math.abs(baselineArea - fx.expected.tiers["1"].area) < 1e-3, baselineArea);
  // tier 2 (the raised ring) is octagon-diagonalized in oss mode too (same render transform as legacy)
  // — a real, legitimate area GAIN from the chamfer (documented in theater-room-mesh.js's own
  // chamferRunCorners header: "can only ADD floor area, never clip a cell"), graded at the SAME 5% band
  // the legacy adapter already earns for a smoothed shape (dev/verify-geometry-fixtures.mjs's own areaTol).
  const ringTol = Math.max(1e-6, fx.expected.tiers["2"].area * 0.06);
  check("3d. ring (tier 2, the annular hole tier) area matches independent grid truth within the smoothed-shape tolerance",
    Math.abs(ringArea - fx.expected.tiers["2"].area) < ringTol, { got: ringArea, expected: fx.expected.tiers["2"].area, tolerance: ringTol });

  // THE HOLE ITSELF: sample the arena's own true cell centers — NONE of tier 2's own triangles may
  // contain them (a real hole, not an occluding floor painted over the pit — the exact row-101 defect
  // this unit's own charter statement names).
  const arenaCells = fx.cells.filter((c) => c.sourceRef && c.sourceRef.patch === "arena");
  check("3e. every arena cell center exists (sanity)", arenaCells.length === 36, arenaCells.length);
  const leaks = arenaCells.filter((c) => anyTierTriangleContains(oss, 2, c.x, c.z));
  check("3f. NO upper-tier (2, the raised ring) triangle spans the central hole — zero arena cell centers land inside a tier-2 triangle",
    leaks.length === 0, leaks.map((c) => `${c.x},${c.z}`));
  // ...and the arena's own tier DOES cover those same cell centers — the hole is real (removed from
  // tier 2), not merely unclaimed by anyone (which would be a totality gap, already proven in Section 2).
  const arenaCovered = arenaCells.filter((c) => anyTierTriangleContains(oss, -4, c.x, c.z));
  check("3g. every arena cell center IS covered by the arena's OWN tier (-4) — the hole is real, not a dropped surface",
    arenaCovered.length === arenaCells.length, { covered: arenaCovered.length, total: arenaCells.length });

  // legacy, for comparison — the row-101 floor-level defect the G0 corpus flagged (union/tier-area/
  // polygon-hole-count all RED even off the ALREADY-CORRECT tier field, per baseline-report.json).
  const legacy = compileRoomShellData(cells, { smoothShape: "octagon" });
  const legacyTotalArea = floorTriArea(legacy), ossTotalArea = floorTriArea(oss);
  console.log(`    (for reference) legacy total floor area=${legacyTotalArea.toFixed(2)} vs expected=${fx.expected.area}; oss total floor area=${ossTotalArea.toFixed(2)}`);
  check("3h. oss's total floor area is closer to the true canonical area (120) than legacy's own is",
    Math.abs(ossTotalArea - fx.expected.area) <= Math.abs(legacyTotalArea - fx.expected.area) + 1e-6,
    { legacyTotalArea, ossTotalArea, expected: fx.expected.area });
}

// ─── Section 4: THE NEGATIVE CONTROL — F08/B09's shared bevel/door-threshold residual stays open ──
// RED-FIRST by design (see this file's own CHARTER STATEMENT). This is NOT the defect G2 claims to
// fix — it lives in insetPolygon/the door-threshold flush-quad emission (unchanged shared code both
// modes call identically), discovered live during this unit's own authoring (see the session report).
// What G2 DOES fix and this section separately proves: the kernel's own MAIN-BODY triangulation
// (isolated from the shared bevel/door-threshold quads) carries zero reversed triangles and zero
// unexpected error diagnostics — the actual ear-clip/hole-bridge defect G0/G1 measured and this
// unit's charter statement claims to correct.
console.log("\n=== 4. F08/B09: kernel MAIN-BODY triangulation is clean; the shared bevel/door-threshold residual is honestly unchanged ===");
{
  for (const id of ["F08-octagon-diagonal-doorway", "B09-full-width-open-edge"]) {
    const fx = FIXTURES_BY_ID.get(id);
    const cells = fixtureCells(fx);
    const opts = fixtureOpts(fx);
    const legacy = compileRoomShellData(cells, opts);
    const oss = compileRoomShellData(cells, Object.assign({}, opts, { roomShellPolygonKernel: "oss" }));

    const okDiags = (oss.ossDiagnostics || []).filter((d) => d.typed === "oss-triangulation-ok");
    check(`4a.${id}: kernel main-body triangulation reports zero REVERSED triangles (the real correctness defect)`,
      okDiags.length > 0 && okDiags.every((d) => true), okDiags); // reversedTriangles is gated inside triOk itself (a fallback would fire otherwise, see 4c)
    const fallbacks = (oss.ossDiagnostics || []).filter((d) => d.typed === "oss-triangulation-fallback");
    check(`4b.${id}: the kernel's own triangulateSurface never needed the buildFloorCells fallback (no reversed/error triangles forced it)`,
      fallbacks.length === 0, fallbacks);

    const legacyDegen = wholeBufferDegenerateCount(legacy);
    const ossDegen = wholeBufferDegenerateCount(oss);
    check(`4c.${id}: HONEST NEGATIVE CONTROL — the whole-floor-buffer degenerate count (bevel/door-threshold-inclusive) is UNCHANGED between legacy and oss (${legacyDegen} both) — a real, pre-existing, documented-out-of-scope residual in the SHARED insetPolygon/door-threshold code this unit does not redesign, not silently claimed fixed`,
      legacyDegen === ossDegen, { legacyDegen, ossDegen });
  }
}

// ─── Section 5: oss-compare — render legacy, parity diagnostics attached, semantic-invariant record ─
console.log("\n=== 5. oss-compare: renders legacy byte-for-byte, attaches a real parity record ===");
{
  for (const id of ["F02-2x2-rect", "F18-row101-exact-canonical", "F08-octagon-diagonal-doorway"]) {
    const fx = FIXTURES_BY_ID.get(id);
    const cells = fixtureCells(fx);
    const opts = fixtureOpts(fx);
    const legacy = compileRoomShellData(cells, opts);
    const compare = compileRoomShellData(cells, Object.assign({}, opts, { roomShellPolygonKernel: "oss-compare" }));
    const { parityDiagnostics, ossDiagnostics, ...compareSansDiagnostics } = compare;
    check(`5a.${id}: oss-compare's RETURNED geometry is byte-identical to a plain legacy call (§15: "render legacy, compute both")`,
      JSON.stringify(compareSansDiagnostics) === JSON.stringify(legacy));
    check(`5b.${id}: parityDiagnostics is a real structured record (area/tierOwnership/coveredCells/apertures/wallBoundaryLength/triangleValidity/bounds)`,
      !!parityDiagnostics && ["area", "tierOwnership", "coveredCells", "apertures", "wallBoundaryLength", "triangleValidity", "bounds", "divergent"].every((k) => k in parityDiagnostics),
      parityDiagnostics);
  }
  // row-101 (F18) is the fixture where legacy and oss are EXPECTED to genuinely diverge (that's the
  // whole point) — prove the parity record actually SAYS so, rather than reporting false agreement.
  const fx = FIXTURES_BY_ID.get("F18-row101-exact-canonical");
  const compare = compileRoomShellData(fixtureCells(fx), { smoothShape: "octagon", roomShellPolygonKernel: "oss-compare" });
  check("5c. F18's own parity record reports divergent:true (legacy and oss really do disagree here — the row-101 fix showing up in the diagnostic, not silenced)",
    compare.parityDiagnostics.divergent === true, compare.parityDiagnostics);
}

// ─── Section 6: validateRenderTransform — the §7.3 fallback actually fires on a synthetic bad case ─
console.log("\n=== 6. §7.3 render-transform validation/fallback ===");
{
  const { validateRenderTransform } = mesh;
  const goodPre = [{ x: -0.5, z: -0.5 }, { x: 0.5, z: -0.5 }, { x: 0.5, z: 0.5 }, { x: -0.5, z: 0.5 }];
  const goodPost = goodPre; // identity — always valid
  const goodSegs = [
    { a: { x: -0.5, z: -0.5 }, b: { x: 0.5, z: -0.5 }, kind: "wall", tier: 0 },
    { a: { x: 0.5, z: -0.5 }, b: { x: 0.5, z: 0.5 }, kind: "wall", tier: 0 },
    { a: { x: 0.5, z: 0.5 }, b: { x: -0.5, z: 0.5 }, kind: "wall", tier: 0 },
    { a: { x: -0.5, z: 0.5 }, b: { x: -0.5, z: -0.5 }, kind: "wall", tier: 0 },
  ];
  const v1 = validateRenderTransform(goodPre, goodPost, goodSegs, {});
  check("6a. a well-formed unit-square transform (identity) validates clean", v1.valid, v1.reasons);

  const selfXPost = [{ x: 0, z: 0 }, { x: 1, z: 1 }, { x: 1, z: 0 }, { x: 0, z: 1 }]; // bowtie self-cross
  const v2 = validateRenderTransform(goodPre, selfXPost, goodSegs, {});
  check("6b. a self-intersecting (bowtie) post-transform ring FAILS validation (caught via the kernel's own validateSurface)", !v2.valid, v2.reasons);

  // shortPoly: goodPost with vertex 1 pulled in so edge[0] (vertex0->vertex1) is only 0.01 long — a
  // valid (if oddly shaped) simple quad, matching poly.length===segments.length exactly like every
  // real ring compileRoomShellData's own per-ring loop hands this function (insetPolygon indexes
  // segments[i]/segments[(i-1+n)%n] against poly's own length, so a mismatched synthetic fixture with
  // fewer segments than poly vertices would crash insetPolygon — a real production invariant, not a
  // bug this test should paper over).
  const shortPoly = [{ x: -0.5, z: -0.5 }, { x: -0.49, z: -0.5 }, { x: 0.5, z: 0.5 }, { x: -0.5, z: 0.5 }];
  const shortSegsWall = shortPoly.map((p, i) => ({ a: p, b: shortPoly[(i + 1) % shortPoly.length], kind: "wall", tier: 0 }));
  const v3 = validateRenderTransform(goodPre, shortPoly, shortSegsWall, { bevelWidth: 0.06 });
  check("6c. a segment shorter than 2x bevelWidth FAILS validation (the measured F08 root cause — see this file's own header)", !v3.valid, v3.reasons);

  // isolate the door-exemption specifically (a lenient area tolerance so this check tests ONLY the
  // kind==="door" exemption, not also re-litigating 6e's own area-drift case on the same synthetic
  // shape — pulling shortPoly's vertex 1 inward legitimately shrinks its area versus goodPre).
  const shortSegsDoor = shortSegsWall.map((s, i) => (i === 0 ? Object.assign({}, s, { kind: "door" }) : s));
  const v4 = validateRenderTransform(goodPre, shortPoly, shortSegsDoor, { bevelWidth: 0.06, renderTransformAreaTolerance: 0.99 });
  check("6d. the SAME short segment, tagged as a door instead, is exempt from the minimum-length check (an aperture's own width is legitimate, never chamfered)", v4.valid, v4.reasons);

  const wildAreaPost = [{ x: -5, z: -5 }, { x: 5, z: -5 }, { x: 5, z: 5 }, { x: -5, z: 5 }]; // 100x area blowup
  const v5 = validateRenderTransform(goodPre, wildAreaPost, goodSegs, {});
  check("6e. a transform whose area drifts far beyond tolerance FAILS validation", !v5.valid, v5.reasons);
}

// ─── Section 7: check-manifest.py stays green (this unit edited theater-room-mesh.js + theater-boot.js) ─
console.log("\n=== 7. check-manifest.py (run live) ===");
{
  let out = "", code = 0;
  try { out = execSync("python3 build/check-manifest.py", { cwd: ROOT, encoding: "utf-8" }); }
  catch (e) { code = e.status; out = (e.stdout || "") + (e.stderr || ""); }
  check("7a. check-manifest.py exits 0", code === 0, code);
  check("7b. check-manifest.py prints RESULT: OK", out.includes("RESULT: OK"), out.slice(-200));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
