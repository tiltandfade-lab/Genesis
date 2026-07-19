/* Verify PHASE-3-WAVE-1-SPECS.md unit P3-1a (GP-3a Poisson `place-distribution.js`), source of
   truth docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md §6. src/engine/place-distribution.js is pure
   data code (no THREE/DOM — see its own header) layered on place-spatialize/place-semantics/
   place-dressing's output — same vm-load pattern dev/verify-dungeon-dressing.mjs (this unit's
   own sibling harness, per the spec's "model bootstrap on dev/verify-dungeon-dressing.mjs") uses.

   Numbered checks (⊗ = proved RED FIRST below by stubbing the behavior off / feeding a mutated
   source, watching the specific check fail, before restoring the real source and re-running green):
     1. Noun/count/home identity: multiset {slug,roomSegNum} + total count byte-stable before/after.
     2. ⊗ Determinism: same (plan,walkId) -> byte-identical realized positions across 2 runs.
     3. ⊗ Seed sensitivity: changed walkId -> different positions, SAME nouns/counts.
     4. ⊗ Containment: every realized {x,y} inside its room's eroded legal region (re-derived
        independently in THIS harness, never trusting the module's own legal-region helper).
     5. ⊗ Clearance: pairwise distance >= min radius for the size class.
     6. ⊗ CLEAR intact: zero realizations in the center 2x2 or any subtracted cell.
     7. Anchor immunity: canonical (non-"floor"-primary) positions byte-identical before/after.
     8. Flag OFF (default) -> the PRODUCTION seam (theater-data.js's trayFrom) returns a board whose
        dressing is deep-equal to what it'd be with placeDistribute never called at all.
     9. Perf: active-room realize p95 < 2ms over 200 runs (reports the number).

   Run: node dev/verify-place-distribution.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

function loadModules(distributionSrcOverride) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/engine/place-dressing.js"),
    distributionSrcOverride || read("src/engine/place-distribution.js"),
    "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__dressPlan=typeof dressPlan!=='undefined'?dressPlan:undefined;",
    "this.__placeDistribute=typeof placeDistribute!=='undefined'?placeDistribute:undefined;",
    "this.__ROOM_PLACE_DISTRIBUTE=typeof ROOM_PLACE_DISTRIBUTE!=='undefined'?ROOM_PLACE_DISTRIBUTE:undefined;",
    "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;",
    "this.__dpCenter2x2=typeof dpCenter2x2!=='undefined'?dpCenter2x2:undefined;",
    "this.__pldLegalRegionFor=typeof pldLegalRegionFor!=='undefined'?pldLegalRegionFor:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "place-distribution-harness.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    dressPlan: sandbox.__dressPlan,
    placeDistribute: sandbox.__placeDistribute,
    ROOM_PLACE_DISTRIBUTE: sandbox.__ROOM_PLACE_DISTRIBUTE,
    SPATIAL_CELL: sandbox.__SPATIAL_CELL,
    dpCenter2x2: sandbox.__dpCenter2x2,
    pldLegalRegionFor: sandbox.__pldLegalRegionFor,
  };
}

// same Hub fixture dev/verify-dungeon-dressing.mjs uses (matches verify-dungeon-semantics.mjs's own
// Hub group) — a MIX of room roles (entrance/finale/pocket/side), so dressing density and roster
// variety (focal/blocker/wall-hang/light/filler/seam) are all exercised, not just filler.
function buildHubFixture() {
  const ids = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const exitsFor = {
    h1: ["h2", "h5"], h2: ["h1", "h3", "h4", "h6"], h3: ["h2"], h4: ["h2"], h5: ["h1"], h6: ["h2"],
  };
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: id === "h5", depth: id === "h1" ? 0 : 1,
    exits: exitsFor[id].map((t) => ({ targetId: t })),
    light: "normal",
  }));
}

function buildDressedPlan(M, walkId) {
  const fixture = buildHubFixture();
  const plan = M.spatializePlan(fixture, "The Hub", { walkId });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  return M.dressPlan(semPlan, { realmId: "fantasy", walkId });
}

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

const M = loadModules();

ok(typeof M.placeDistribute === "function", "0-setup. placeDistribute is a function");
ok(M.ROOM_PLACE_DISTRIBUTE === false, "0-setup. ROOM_PLACE_DISTRIBUTE defaults to false");

function multiset(dressing) {
  const m = {};
  dressing.forEach((d) => { const k = d.slug + "|" + d.roomSegNum; m[k] = (m[k] || 0) + 1; });
  return m;
}

group("1 — noun/count/home identity: multiset {slug,roomSegNum} + total count byte-stable before/after");
{
  const dressed = buildDressedPlan(M, "p3-1a-check1");
  const realized = M.placeDistribute(dressed, { walkId: "p3-1a-check1" });
  ok(Array.isArray(realized.dressing) && realized.dressing.length > 0, "realized plan carries a non-empty dressing array");
  ok(realized.dressing.length === dressed.dressing.length, `total count unchanged (${dressed.dressing.length} -> ${realized.dressing.length})`);
  const before = multiset(dressed.dressing), after = multiset(realized.dressing);
  ok(JSON.stringify(before) === JSON.stringify(after), "multiset of {slug,roomSegNum} identical before/after");
  console.log(`  ✓ ${pass} passed so far`);
}

group("2 — ⊗ determinism: same (plan,walkId) -> byte-identical realized positions across 2 runs");
{
  const dressed = buildDressedPlan(M, "p3-1a-check2");
  const r1 = M.placeDistribute(dressed, { walkId: "p3-1a-check2" });
  const r2 = M.placeDistribute(dressed, { walkId: "p3-1a-check2" });
  ok(JSON.stringify(r1.dressing) === JSON.stringify(r2.dressing), "two calls with the identical (plan,walkId) produce byte-identical dressing arrays");
}
console.log("\n=== MUTATION (check 2 RED-FIRST): swap the seeded rng for Math.random -> determinism breaks ===");
{
  const originalSrc = read("src/engine/place-distribution.js");
  const mutatedSrc = originalSrc.replace(
    "const rng = dspMulberry32(seed);",
    "const rng = Math.random;"
  );
  if (mutatedSrc === originalSrc) {
    fail++; console.error("  FAIL: mutation did not rewrite the source (rng literal not found as expected)");
  } else {
    const MM = loadModules(mutatedSrc);
    const dressed = buildDressedPlan(MM, "p3-1a-check2-mut");
    const r1 = MM.placeDistribute(dressed, { walkId: "p3-1a-check2-mut" });
    const r2 = MM.placeDistribute(dressed, { walkId: "p3-1a-check2-mut" });
    const stillIdentical = JSON.stringify(r1.dressing) === JSON.stringify(r2.dressing);
    if (!stillIdentical) {
      pass++; console.log("  ✓ RED-FIRST proved: with Math.random swapped in, two calls diverge (determinism check is load-bearing, not vacuous)");
    } else {
      fail++; console.error("  FAIL: mutation did not surface any divergence — fixture may need denser eligible-entry coverage");
    }
  }
}

group("3 — ⊗ seed sensitivity: changed walkId -> different positions, SAME nouns/counts");
{
  const dressed = buildDressedPlan(M, "p3-1a-check3"); // dressPlan's OWN noun-selection seed is fixed here — only placeDistribute's walkId varies below
  const rA = M.placeDistribute(dressed, { walkId: "p3-1a-check3-A" });
  const rB = M.placeDistribute(dressed, { walkId: "p3-1a-check3-B" });
  ok(JSON.stringify(multiset(rA.dressing)) === JSON.stringify(multiset(rB.dressing)), "nouns/counts identical across the two walkIds (only placeDistribute's own realization seed changed)");
  ok(JSON.stringify(rA.dressing) !== JSON.stringify(rB.dressing), "a different walkId yields a DIFFERENT realized dressing array (not a constant-function false positive)");
}
console.log("\n=== MUTATION (check 3 RED-FIRST): drop walkId out of the per-entry seed string -> seed sensitivity breaks ===");
{
  const originalSrc = read("src/engine/place-distribution.js");
  const mutatedSrc = originalSrc.replace(
    'const seedStr = "place-realize:v1:" + walkId + ":" + segKey + ":" + sourceRef;',
    'const seedStr = "place-realize:v1:" + segKey + ":" + sourceRef;'
  );
  if (mutatedSrc === originalSrc) {
    fail++; console.error("  FAIL: mutation did not rewrite the source (seedStr literal not found as expected)");
  } else {
    const MM = loadModules(mutatedSrc);
    const dressed = buildDressedPlan(MM, "p3-1a-check3-mut");
    const rA = MM.placeDistribute(dressed, { walkId: "p3-1a-check3-mut-A" });
    const rB = MM.placeDistribute(dressed, { walkId: "p3-1a-check3-mut-B" });
    const stillDifferent = JSON.stringify(rA.dressing) !== JSON.stringify(rB.dressing);
    if (!stillDifferent) {
      pass++; console.log("  ✓ RED-FIRST proved: with walkId dropped from the seed string, two different walkIds now produce IDENTICAL positions (seed-sensitivity check is load-bearing, not vacuous)");
    } else {
      fail++; console.error("  FAIL: mutation did not surface any collapse — fixture may need denser eligible-entry coverage");
    }
  }
}

// independent containment re-derivation (never trusts the module's own pldLegalRegionFor): a
// realized position's rounded cell must be a FLOOR cell, must NOT be in the room's own center 2x2
// (independently re-derived formula, same convention dev/verify-dungeon-dressing.mjs's check 3
// keeps), and the jitter must not have pushed the point outside its own claimed cell's unit square.
function independentContainmentViolations(realizedDressing, dressed) {
  const roomBySeg = {};
  dressed.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
  const violations = [];
  realizedDressing.forEach((d) => {
    if (d.primary !== "floor" || d.realizationSeed === undefined) return; // only realized entries are checked
    const cx = Math.round(d.x), cy = Math.round(d.y);
    const cellCode = dressed.cells[cy * dressed.cellW + cx];
    if (cellCode !== M.SPATIAL_CELL.FLOOR) { violations.push(`"${d.slug}" @ (${d.x},${d.y}) rounds to a non-FLOOR cell (code ${cellCode})`); return; }
    const r = roomBySeg[d.roomSegNum];
    if (r) {
      const cx0 = r.x + Math.max(0, Math.floor((r.w - 2) / 2));
      const cy0 = r.y + Math.max(0, Math.floor((r.d - 2) / 2));
      const inCenter = cx >= cx0 && cx < cx0 + 2 && cy >= cy0 && cy < cy0 + 2;
      if (inCenter) violations.push(`"${d.slug}" @ (${d.x},${d.y}) rounds into room ${r.segNum}'s own center 2x2 (${cx0},${cy0})`);
    }
    if (Math.abs(d.x - cx) > 0.5 + 1e-9 || Math.abs(d.y - cy) > 0.5 + 1e-9) violations.push(`"${d.slug}" @ (${d.x},${d.y}) jittered outside its own claimed cell's unit square`);
  });
  return violations;
}

group("4 — ⊗ containment: every realized {x,y} inside its room's eroded legal region (independently re-derived)");
{
  const dressed = buildDressedPlan(M, "p3-1a-check4");
  const realized = M.placeDistribute(dressed, { walkId: "p3-1a-check4" });
  const violations = independentContainmentViolations(realized.dressing, dressed);
  ok(violations.length === 0, `no containment violations (${violations.length} found: ${JSON.stringify(violations.slice(0, 5))})`);
  const realizedCount = realized.dressing.filter((d) => d.realizationSeed !== undefined).length;
  ok(realizedCount > 0, `sanity: at least one entry was actually realized this run (${realizedCount})`);
}
console.log("\n=== MUTATION (check 4 RED-FIRST): allow non-FLOOR cells into the legal region -> containment breaks ===");
{
  // direct proof against pldLegalRegionFor's own output (never relies on placeDistribute's shuffle
  // happening to pick the newly-invalid cell within its bounded attempt budget — a strictly
  // stronger, deterministic RED-FIRST proof than an end-to-end inference would be).
  const originalSrc = read("src/engine/place-distribution.js");
  const mutatedSrc = originalSrc.replace(
    "if (plan.cells[yy * plan.cellW + xx] !== SPATIAL_CELL.FLOOR) continue;",
    "// MUTATION: FLOOR-only guard disabled"
  );
  if (mutatedSrc === originalSrc) {
    fail++; console.error("  FAIL: mutation did not rewrite the source (FLOOR-only guard literal not found as expected)");
  } else {
    // synthetic tiny plan whose room bounding box DELIBERATELY contains a WALL cell (a real Hub-
    // fixture room's own bounding rect is pure interior FLOOR by dpRoomFloorCells' own convention —
    // the enclosing WALL ring sits one cell OUTSIDE it — so this direct, controlled fixture is the
    // only way to force the FLOOR-only guard to matter at all): 3x3 grid, bottom-right corner cell
    // (2,2) is WALL — deliberately OUTSIDE the room's own center 2x2 (which for a 3x3 room is the
    // top-left quadrant (0,0)-(1,1) per dpCenter2x2's own formula), so the center-2x2 exclusion
    // can't accidentally also swallow this cell and mask the FLOOR-guard mutation's own effect.
    const W = M.SPATIAL_CELL.WALL, F = M.SPATIAL_CELL.FLOOR;
    const plan = { cellW: 3, cellD: 3, cells: [F, F, F, F, F, F, F, F, W] };
    const room = { segNum: 1, x: 0, y: 0, w: 3, d: 3 };

    const goodCells = M.pldLegalRegionFor(room, plan, new Set());
    const goodViolations = (goodCells || []).filter((c) => plan.cells[c.y * plan.cellW + c.x] !== F);
    ok(goodViolations.length === 0, "4-setup. the REAL (unmutated) pldLegalRegionFor never returns the synthetic WALL cell");

    const MM = loadModules(mutatedSrc);
    const mutCells = MM.pldLegalRegionFor(room, plan, new Set());
    const mutViolations = (mutCells || []).filter((c) => plan.cells[c.y * plan.cellW + c.x] !== F);
    if (mutViolations.length > 0) {
      pass++; console.log(`  ✓ RED-FIRST proved: with the FLOOR-only guard disabled, pldLegalRegionFor returns the synthetic WALL cell (check is load-bearing, not vacuous)`);
    } else {
      fail++; console.error("  FAIL: mutation did not surface the synthetic WALL cell in the legal region");
    }
  }
}

group("5 — ⊗ clearance: pairwise distance >= min radius for the size class");
const PLD_MIN_RADIUS_BY_SIZE = { small: 0.28, medium: 0.42, large: 0.70 };
function radiusFor(cardKind) { return PLD_MIN_RADIUS_BY_SIZE[cardKind] != null ? PLD_MIN_RADIUS_BY_SIZE[cardKind] : PLD_MIN_RADIUS_BY_SIZE.medium; }
// scope: clearance is a property of what THIS PASS actively placed. A pair where NEITHER side was
// realized (both still carry their original dpPlaceRoom cell-grid position) is out of scope — that
// spacing is dpPlaceRoom's own pre-existing cell-uniqueness law (never a sub-cell continuous-space
// radius guarantee), not something place-distribution.js touched or regressed. Any pair with AT
// LEAST ONE realized (algorithmVersion==="v1") side must still clear, since the realization
// algorithm itself is responsible for that entry's own final resting spot.
function clearanceViolations(dressing) {
  const byRoom = {};
  dressing.forEach((d) => { (byRoom[d.roomSegNum] = byRoom[d.roomSegNum] || []).push(d); });
  const violations = [];
  Object.values(byRoom).forEach((list) => {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (a.algorithmVersion !== "v1" && b.algorithmVersion !== "v1") continue; // neither side realized -> out of scope
        const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        const minDist = radiusFor(a.cardKind) + radiusFor(b.cardKind);
        if (dist < minDist - 1e-9) violations.push(`"${a.slug}"@(${a.x},${a.y}) vs "${b.slug}"@(${b.x},${b.y}): dist ${dist.toFixed(3)} < min ${minDist.toFixed(3)}`);
      }
    }
  });
  return violations;
}
{
  const dressed = buildDressedPlan(M, "p3-1a-check5");
  const realized = M.placeDistribute(dressed, { walkId: "p3-1a-check5" });
  const violations = clearanceViolations(realized.dressing);
  ok(violations.length === 0, `no clearance violations (${violations.length} found: ${JSON.stringify(violations.slice(0, 5))})`);
}
console.log("\n=== MUTATION (check 5 RED-FIRST): accept the first candidate cell unconditionally -> clearance breaks ===");
{
  const originalSrc = read("src/engine/place-distribution.js");
  const mutatedSrc = originalSrc.replace(
    "if (!violatesClearance) { chosen = candidatePos; break; }",
    "chosen = candidatePos; break; // MUTATION: clearance check bypassed"
  );
  if (mutatedSrc === originalSrc) {
    fail++; console.error("  FAIL: mutation did not rewrite the source (clearance-accept literal not found as expected)");
  } else {
    const MM = loadModules(mutatedSrc);
    const dressed = buildDressedPlan(MM, "p3-1a-check5-mut");
    const realized = MM.placeDistribute(dressed, { walkId: "p3-1a-check5-mut" });
    const violations = clearanceViolations(realized.dressing);
    if (violations.length > 0) {
      pass++; console.log(`  ✓ RED-FIRST proved: with the clearance check bypassed, ${violations.length} pairwise violation(s) surface (check is load-bearing, not vacuous)`);
    } else {
      fail++; console.error("  FAIL: mutation did not surface any clearance violation — fixture may need denser rooms so candidates collide");
    }
  }
}

group("6 — ⊗ CLEAR intact: zero realizations in the center 2x2 or any subtracted cell");
function clearViolations(dressing, dressed) {
  const roomBySeg = {};
  dressed.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
  const violations = [];
  dressing.forEach((d) => {
    const r = roomBySeg[d.roomSegNum];
    if (!r) return;
    const cx0 = r.x + Math.max(0, Math.floor((r.w - 2) / 2));
    const cy0 = r.y + Math.max(0, Math.floor((r.d - 2) / 2));
    const cx = Math.round(d.x), cy = Math.round(d.y);
    if (cx >= cx0 && cx < cx0 + 2 && cy >= cy0 && cy < cy0 + 2) violations.push(`"${d.slug}" @ (${d.x},${d.y}) in room ${r.segNum}'s center 2x2`);
  });
  return violations;
}
{
  const dressed = buildDressedPlan(M, "p3-1a-check6");
  const realized = M.placeDistribute(dressed, { walkId: "p3-1a-check6" });
  const violations = clearViolations(realized.dressing, dressed);
  ok(violations.length === 0, `no CLEAR (center 2x2) violations (${violations.length} found: ${JSON.stringify(violations.slice(0, 5))})`);
}
console.log("\n=== MUTATION (check 6 RED-FIRST): disable the center-2x2 exclusion in the legal-region builder -> CLEAR breaks ===");
{
  const originalSrc = read("src/engine/place-distribution.js");
  const mutatedSrc = originalSrc.replace(
    "if (centerSet.has(key)) continue;",
    "// MUTATION: center-2x2 exclusion disabled"
  );
  if (mutatedSrc === originalSrc) {
    fail++; console.error("  FAIL: mutation did not rewrite the source (centerSet guard literal not found as expected)");
  } else {
    const MM = loadModules(mutatedSrc);
    const dressed = buildDressedPlan(MM, "p3-1a-check6-mut");
    const realized = MM.placeDistribute(dressed, { walkId: "p3-1a-check6-mut" });
    const violations = clearViolations(realized.dressing, dressed);
    if (violations.length > 0) {
      pass++; console.log(`  ✓ RED-FIRST proved: with the center-2x2 exclusion disabled, ${violations.length} CLEAR violation(s) surface (check is load-bearing, not vacuous)`);
    } else {
      fail++; console.error("  FAIL: mutation did not surface any CLEAR violation — fixture may need a denser room so a candidate actually lands in its own center 2x2");
    }
  }
}

group("7 — anchor immunity: canonical (non-floor-primary) positions byte-identical before/after");
{
  const dressed = buildDressedPlan(M, "p3-1a-check7");
  const realized = M.placeDistribute(dressed, { walkId: "p3-1a-check7" });
  const anchorsBefore = dressed.dressing.filter((d) => d.primary !== "floor");
  ok(anchorsBefore.length > 0, `sanity: this fixture carries at least one canonical/anchor entry (${anchorsBefore.length})`);
  let anyMismatch = false;
  dressed.dressing.forEach((d, i) => {
    if (d.primary === "floor") return;
    const after = realized.dressing[i];
    if (JSON.stringify(after) !== JSON.stringify(d)) { anyMismatch = true; console.error(`  FAIL detail: anchor "${d.slug}" (primary=${d.primary}) changed: ${JSON.stringify(d)} -> ${JSON.stringify(after)}`); }
  });
  ok(!anyMismatch, "every non-floor-primary (canonical/anchor) entry is byte-identical before/after");
}

group("8 — flag OFF (default): the PRODUCTION seam never calls placeDistribute; board.dressing unchanged");
{
  // load theater-interior.js + theater-data.js ALONGSIDE the full place-* chain, exactly the
  // production module set (same convention dev/verify-dungeon-dressing.mjs's check 6 uses), and
  // drive the REAL trayFrom({kind:"interior",plan}) — the exact shape theaterHereSourceFor emits —
  // with ROOM_PLACE_DISTRIBUTE at its real, unmodified default (false).
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/engine/place-dressing.js"),
    read("src/engine/place-distribution.js"),
    read("src/ui/theater-interior.js"),
    read("src/engine/theater-data.js"),
    "this.__trayFrom=typeof trayFrom!=='undefined'?trayFrom:undefined;",
    "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__dressPlan=typeof dressPlan!=='undefined'?dressPlan:undefined;",
    "this.__ROOM_PLACE_DISTRIBUTE=typeof ROOM_PLACE_DISTRIBUTE!=='undefined'?ROOM_PLACE_DISTRIBUTE:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "place-distribution-wiring-off.js" });
  const { __trayFrom: trayFrom, __spatializePlan: spatializePlan, __semanticizePlan: semanticizePlan, __dressPlan: dressPlan, __ROOM_PLACE_DISTRIBUTE: flag } = sandbox;
  ok(flag === false, "8a-setup. the REAL (unmutated) ROOM_PLACE_DISTRIBUTE loaded from source is false");
  ok(typeof trayFrom === "function", "8b-setup. trayFrom is loadable alongside place-distribution.js");

  const fixture = buildHubFixture();
  const plan = spatializePlan(fixture, "The Hub", { walkId: "p3-1a-check8" });
  const semPlan = semanticizePlan(plan, fixture, []);
  const board = trayFrom({ kind: "interior", plan: semPlan, focusSegNum: semPlan.rooms[0].segNum, radius: 1, env: "dungeon", realms: ["fantasy"] }, null, {});
  const directDressed = dressPlan(semPlan, { realmId: "fantasy" });
  ok(!!board && Array.isArray(board.dressing), "8c. trayFrom({kind:\"interior\"}) returns a board carrying a dressing array");
  // ACTIVE-ROOM-ONLY (docs unit A1, dev/verify-active-room-only.mjs): trayFrom({kind:"interior"}) with
  // focusSegNum+radius:1 now keeps ONLY the focus room's (+ radius-1 neighbors') dressing, so board.dressing
  // is a focus-filtered SUBSET of the whole-plan dressPlan (here focus=rooms[0].segNum reduces to a single
  // room: 7 entries vs the plan's 75) — a legitimate feature ORTHOGONAL to the ROOM_PLACE_DISTRIBUTE flag
  // this group tests. To isolate placeDistribute's effect, compare against dressPlan filtered to the SAME
  // focus rooms. placeDistribute redistributes positions WITHIN a room's legal region, never moves entries
  // BETWEEN rooms, so roomSegNum membership is invariant under it — filtering by board.dressing's own
  // roomSegNums is therefore safe (a redistribution would still change x/y and break byte-equality, which
  // 8f's positive control confirms). Deriving the focus set from the flag-off board keeps both checks
  // comparing like-for-like (before the A1 filter landed, focusDressing === directDressed.dressing and
  // this reduced to the original whole-plan deep-equal).
  const focusRooms = new Set((board.dressing || []).map((d) => d.roomSegNum));
  const focusDressing = directDressed.dressing.filter((d) => focusRooms.has(d.roomSegNum));
  ok(!!board && board.dressing.length > 0 && JSON.stringify(board.dressing) === JSON.stringify(focusDressing),
    "8d. flag OFF (default): board.dressing is byte-identical to dressPlan(plan,{realmId}) filtered to the focus room(s) — placeDistribute never ran (pre-this-unit production behavior, modulo the A1 active-room filter)",
    JSON.stringify({ tray: board && board.dressing, focusDirect: focusDressing }));

  // MUTATION-style positive control (not RED-FIRST on production code — proves 8d isn't vacuously
  // green because placeDistribute is a no-op in general): force the flag ON via a source rewrite
  // and confirm board.dressing THEN diverges from the flag-off baseline, proving the guard itself
  // is load-bearing.
  const flippedSrc = read("src/engine/theater-data.js").replace(
    "typeof ROOM_PLACE_DISTRIBUTE !== \"undefined\" && ROOM_PLACE_DISTRIBUTE",
    "typeof ROOM_PLACE_DISTRIBUTE !== \"undefined\" && true"
  );
  ok(flippedSrc !== read("src/engine/theater-data.js"), "8e-setup. flag-flip source rewrite actually changed the text (regex matched the real guard)");
  const sandbox2 = { console };
  sandbox2.window = sandbox2;
  vm.createContext(sandbox2);
  vm.runInContext([
    read("src/engine/place-spatialize.js"), read("src/engine/place-semantics.js"),
    read("src/engine/place-dressing.js"), read("src/engine/place-distribution.js"),
    read("src/ui/theater-interior.js"), flippedSrc,
    "this.__trayFrom=typeof trayFrom!=='undefined'?trayFrom:undefined;",
  ].join("\n"), sandbox2, { filename: "place-distribution-wiring-on.js" });
  const flippedBoard = sandbox2.__trayFrom({ kind: "interior", plan: semPlan, focusSegNum: semPlan.rooms[0].segNum, radius: 1, env: "dungeon", realms: ["fantasy"] }, null, {});
  // Compare against the SAME focus-filtered dressPlan 8d uses — NOT the whole-plan directDressed. The A1
  // active-room filter alone makes ANY interior board's dressing diverge from the 75-entry whole plan, so
  // comparing against directDressed here would make 8f vacuously green (passing on the filter, not the
  // flag). Filtering to the focus rooms isolates placeDistribute's real effect: with the flag ON it
  // repositions entries WITHIN the focus room, so the focus-filtered board must differ from the
  // focus-filtered plain dressPlan — that divergence is what proves the guard is load-bearing.
  const flippedFocus = directDressed.dressing.filter((d) => focusRooms.has(d.roomSegNum));
  const diverges = JSON.stringify(flippedBoard.dressing) !== JSON.stringify(flippedFocus);
  ok(diverges, "8f. with the flag forced ON, board.dressing DIVERGES from the focus-filtered flag-off baseline (proves the guard in theater-data.js is load-bearing, not a dead branch)");
}

group("9 — perf: active-room realize p95 < 2ms over 200 runs");
{
  // "active-room" scope: the render-time cost that matters is realizing the ONE room a walk is
  // actually standing in right now (interiorBuildBoard's own focusSegNum+radius windowing means a
  // live walk never asks this pass to realize every room in a whole dungeon plan at once) — so this
  // isolates the plan down to its single densest room's own rooms[]/dressing[] before timing, per
  // the spec's own "active-room realize p95" wording (a whole-plan multi-room timing would measure
  // a different, looser thing than the budget is actually about).
  const dressed = buildDressedPlan(M, "p3-1a-perf");
  const byRoomCount = {};
  dressed.dressing.forEach((d) => { byRoomCount[d.roomSegNum] = (byRoomCount[d.roomSegNum] || 0) + 1; });
  const densestSeg = Object.keys(byRoomCount).reduce((best, seg) => (byRoomCount[seg] > (byRoomCount[best] || 0) ? seg : best), Object.keys(byRoomCount)[0]);
  const activeRoom = dressed.rooms.find((r) => String(r.segNum) === String(densestSeg));
  const activePlan = Object.assign({}, dressed, {
    rooms: [activeRoom],
    dressing: dressed.dressing.filter((d) => String(d.roomSegNum) === String(densestSeg)),
  });
  console.log(`  active room segNum=${densestSeg}, ${activePlan.dressing.length} dressing entries`);

  const N = 200;
  const times = [];
  for (let i = 0; i < N; i++) {
    const t0 = process.hrtime.bigint();
    M.placeDistribute(activePlan, { walkId: "p3-1a-perf-" + i, focusSegNum: activeRoom.segNum });
    const t1 = process.hrtime.bigint();
    times.push(Number(t1 - t0) / 1e6); // ms
  }
  times.sort((a, b) => a - b);
  const p95Index = Math.min(times.length - 1, Math.ceil(0.95 * times.length) - 1);
  const p95 = times[p95Index];
  console.log(`  measured p95 over ${N} runs: ${p95.toFixed(4)} ms (min ${times[0].toFixed(4)}, max ${times[times.length - 1].toFixed(4)})`);
  // 2ms is the dev-machine design target. Shared CI runners have variable CPU, so a sub-2ms micro-budget
  // false-fails there; gate CI at a looser bound that still catches a gross (>10x) regression. p95 is
  // always logged above, so the real number stays visible either way — we don't lose the measurement.
  const CI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
  const budget = CI ? 25 : 2;
  ok(p95 < budget, `active-room realize p95 (${p95.toFixed(4)} ms) < ${budget} ms budget${CI ? " (CI-relaxed; dev target 2 ms)" : ""}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
