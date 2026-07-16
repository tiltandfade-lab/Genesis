/* Verify BEAUTY-WAVE-3.md unit BW3-5 — SEAM-SOFTENING. src/engine/place-dressing.js's dressPlan()
   gains a seeded seam-filler sub-pass (dpPlaceRoom step 6): small filler cards along the wall-base
   line (RHYTHM-sampled at intervals), at column/furniture feet, and in doorway-adjacent corners —
   marked {seam:true, seamKind} on the emitted dressing entry. Same vm-load pattern as dev/verify-
   dungeon-dressing.mjs (pure DATA layer, no GL) — this harness covers the checks THAT harness
   doesn't (seam-specific placement/density/logging), while re-running dev/verify-dungeon-dressing.mjs
   itself proves the pre-existing checks (FLOOR-only, center-2x2, blocker wall-adjacency, focal cap,
   art-readiness join, production wiring) still hold with seam entries mixed into plan.dressing.

   Checks (this unit's own task brief):
     1. seam entries actually appear (non-empty) for a realistic Hub fixture, across chrome/gloom/
        fantasy, each carrying a real REALM_DRESSING slug (never invented).
     2. HUGS SEAMS: every seamKind:"wallBase" entry is wall-adjacent (re-derived independently, not
        calling dpAdjacentToWall); every "columnFoot"/"furnitureFoot" entry is within 1 cell (Chebyshev
        via the 4-neighbor rule) of a real anchor (a pillar-formula corner cell / a blocker|setPiece
        dressing entry in the SAME room); every "doorCorner" entry is adjacent to BOTH a DOOR cell and
        a WALL cell.
     3. CLEAR law: no seam entry ever sits on a DOOR cell or inside its room's own center 2x2
        (re-derived independently).
     4. density bounded by role: per-room seam-entry count never exceeds DRESSING_DENSITY_BY_ROLE's
        own `seam` budget for that room's role (chrome/gloom/fantasy, Hub fixture w/ mixed roles).
     5. determinism per walkId: same (plan,walkId) -> byte-identical seam entries; a different walkId
        yields a different seam array (not a constant-function false positive).
     6. realms without filler pools are LOGGED, not invented: stub REALM_DRESSING with a realm whose
        roster has zero small floor-primary entries -> dressPlan logs a console.warn AND emits zero
        seam entries for that realm (never fabricates a slug outside the roster).
     7. RED-FIRST / MUTATION — the CLEAR law is load-bearing for seam entries specifically:
        (a) disabling DP_CENTER_EXCLUDE_ENABLED (the SAME guard dev/verify-dungeon-dressing.mjs's own
            mutation flips) lets a seam entry land in its room's center 2x2 too — proving seam entries
            inherit the shared `placeable` guard rather than bypassing it via a separate code path.
        (b) widening dpRoomFloorCells' own FLOOR check to also accept DOOR cells lets a seam entry
            (a wallBase/doorCorner card) land directly ON a door cell — proving the FLOOR-only law,
            not luck, is what keeps seam cards off doors ("a template that would block a door -> veto
            fires" reads here as: remove the veto, and a door-blocking placement appears).

   Run:  node dev/verify-bw3-5-seam-softening.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

function loadModules(dressingSrcOverride) {
  const warnings = [];
  const sandbox = {
    console: Object.assign({}, console, { warn: (...args) => { warnings.push(args.join(" ")); } }),
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    dressingSrcOverride || read("src/engine/place-dressing.js"),
    "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__dressPlan=typeof dressPlan!=='undefined'?dressPlan:undefined;",
    "this.__REALM_DRESSING=typeof REALM_DRESSING!=='undefined'?REALM_DRESSING:undefined;",
    "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;",
    "this.__DRESSING_DENSITY_BY_ROLE=typeof DRESSING_DENSITY_BY_ROLE!=='undefined'?DRESSING_DENSITY_BY_ROLE:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "bw3-5-seam-softening.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    dressPlan: sandbox.__dressPlan,
    REALM_DRESSING: sandbox.__REALM_DRESSING,
    SPATIAL_CELL: sandbox.__SPATIAL_CELL,
    DRESSING_DENSITY_BY_ROLE: sandbox.__DRESSING_DENSITY_BY_ROLE,
    warnings,
  };
}

// same Hub fixture dev/verify-dungeon-dressing.mjs uses (mixed roles: entrance/finale/pocket/side).
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
// a few BIGGER rooms (>=6x6) so DP_PILLAR_MIN_DIM columns can actually roll — exercises the
// columnFoot path, which the plain Hub fixture (small rooms) may never reach.
function buildBigHubFixture() {
  const ids = ["b1", "b2", "b3", "b4"];
  const exitsFor = { b1: ["b2"], b2: ["b1", "b3", "b4"], b3: ["b2"], b4: ["b2"] };
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: id === "b4", depth: i,
    exits: exitsFor[id].map((t) => ({ targetId: t })),
    light: "normal",
  }));
}

// CR-1 item 5c (2026-07-15 adversarial review) — check 7b's fixture, investigated: buildBigHubFixture's
// b2 (the 3-exit hub node) is the ONLY room in that fixture whose own dpWallBaseCells() candidate list
// (confirmed by direct instrumentation) contains a literal DOOR cell, i.e. a cell that IS wall-adjacent
// under place-dressing.js's own geometry — every other room's doors sit on a floor-floor threshold, not
// wall-adjacent, so widening dpRoomFloorCells' FLOOR check to also accept DOOR (the 7b mutation) can
// never surface THEM via wallBase at all, mutated or not. columnFoot/furnitureFoot are structurally
// immune to this mutation regardless of fixture (dpAdjacentCellsWithin1 runs its own independent
// SPATIAL_CELL.FLOOR check, never delegating to dpRoomFloorCells), and doorCorner's own filter
// (dpAdjacentToDoor) requires a NEIGHBORING door cell, which a lone door practically never has — so
// wallBase is the only seam kind the mutation can ever move, and only on the ONE room where a door is
// wall-adjacent. The bug: that room (b2) carries role:"path" (DRAGGING_DENSITY_BY_ROLE.path.seam = 3),
// and its OWN doorCorner candidates alone (4, from its 2 real doors) already exhaust that budget before
// dpPlaceRoom's step 6 ever reaches its `if (remaining > 0)` wallBase branch — so the mutated wallBase
// list, even though it DOES contain the door cell, was NEVER ONCE CONSULTED. Same topology, ONE change:
// b2 (not b4) is the finale, raising ITS OWN budget to 6 (DRESSING_DENSITY_BY_ROLE.finale.seam) — enough
// headroom after doorCorner+furnitureFoot for the wallBase branch to actually run. Confirmed by direct
// sweep (dev-only, not committed): realm "chrome", walkId "bw35-7b-chrome-door" deterministically lands
// a wallBase seam entry AT (11,6), the real DOOR cell, under the mutated source — and confirmed the SAME
// fixture+walkId never does under the real, unmutated source (33 seam entries across all 3 realms, zero
// on a door cell) — the "mutation-red vs restored-green" pair item 5c calls for.
function buildDoorAdjacentSeamFixture() {
  const ids = ["b1", "b2", "b3", "b4"];
  const exitsFor = { b1: ["b2"], b2: ["b1", "b3", "b4"], b3: ["b2"], b4: ["b2"] };
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: id === "b2", depth: i,
    exits: exitsFor[id].map((t) => ({ targetId: t })),
    light: "normal",
  }));
}

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

const M = loadModules();

group("1 — seam entries appear, real slugs, across chrome/gloom/fantasy");
{
  const fixture = buildHubFixture();
  const plan = M.spatializePlan(fixture, "The Hub", { walkId: "bw35-1" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  ["chrome", "gloom", "fantasy"].forEach((realm) => {
    const dressed = M.dressPlan(semPlan, { realmId: realm, walkId: "bw35-1-" + realm });
    const seamEntries = dressed.dressing.filter((d) => d.seam === true);
    ok(seamEntries.length > 0, `${realm}: at least one seam entry rolled (got ${seamEntries.length})`);
    ok(seamEntries.every((d) => typeof d.slug === "string" && d.slug.startsWith(realm + "-")),
      `${realm}: every seam entry's slug is a real "${realm}-..." roster slug`);
    ok(seamEntries.every((d) => M.REALM_DRESSING[realm].some((e) => e.slug === d.slug && e.primary === "floor" && e.size === "small")),
      `${realm}: every seam entry's slug maps back to a primary:"floor"/size:"small" roster entry (never invented)`);
    ok(seamEntries.every((d) => ["doorCorner", "columnFoot", "furnitureFoot", "wallBase"].includes(d.seamKind)),
      `${realm}: every seam entry carries a known seamKind`);
  });
  console.log(`  ✓ ${pass} passed so far`);
}

group("2 — HUGS SEAMS: wallBase wall-adjacent; column/furniture feet within 1 of a real anchor; doorCorner adjacent to both DOOR and WALL");
{
  const fixture = buildBigHubFixture();
  const plan = M.spatializePlan(fixture, "The Big Hub", { walkId: "bw35-2" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const SPATIAL_CELL = M.SPATIAL_CELL;
  const adjTo = (x, y, code, cells, cellW, cellD) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= cellW || ny >= cellD) return false;
    return cells[ny * cellW + nx] === code;
  });

  let sawColumnFoot = false, sawFurnitureFoot = false, sawDoorCorner = false, sawWallBase = false;
  ["chrome", "gloom", "fantasy"].forEach((realm) => {
    const dressed = M.dressPlan(semPlan, { realmId: realm, walkId: "bw35-2-" + realm });
    const roomBySeg = {}; dressed.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
    const byRoom = {};
    dressed.dressing.forEach((d) => { (byRoom[d.roomSegNum] = byRoom[d.roomSegNum] || []).push(d); });

    dressed.dressing.filter((d) => d.seam).forEach((d) => {
      const cellW = dressed.cellW, cellD = dressed.cellD, cells = dressed.cells;
      if (d.seamKind === "wallBase") {
        sawWallBase = true;
        ok(adjTo(d.x, d.y, SPATIAL_CELL.WALL, cells, cellW, cellD), `${realm}: wallBase seam "${d.slug}" @ (${d.x},${d.y}) is wall-adjacent`);
      } else if (d.seamKind === "doorCorner") {
        sawDoorCorner = true;
        ok(adjTo(d.x, d.y, SPATIAL_CELL.DOOR, cells, cellW, cellD) && adjTo(d.x, d.y, SPATIAL_CELL.WALL, cells, cellW, cellD),
          `${realm}: doorCorner seam "${d.slug}" @ (${d.x},${d.y}) is adjacent to BOTH a DOOR and a WALL cell`);
      } else if (d.seamKind === "columnFoot") {
        sawColumnFoot = true;
        // re-derive independently: is (d.x,d.y) a 4-neighbor of one of this room's own 4 pillar-formula
        // corner candidates? (never trusting dpRoomColumnCell's own internal pick directly.)
        const r = roomBySeg[d.roomSegNum];
        const corners = [
          { x: r.x + 1, y: r.y + 1 }, { x: r.x + r.w - 2, y: r.y + 1 },
          { x: r.x + 1, y: r.y + r.d - 2 }, { x: r.x + r.w - 2, y: r.y + r.d - 2 },
        ];
        const nearACorner = corners.some((c) => Math.abs(c.x - d.x) + Math.abs(c.y - d.y) === 1);
        ok(nearACorner, `${realm}: columnFoot seam "${d.slug}" @ (${d.x},${d.y}) sits 1 cell from one of room ${d.roomSegNum}'s own pillar-corner candidates`);
      } else if (d.seamKind === "furnitureFoot") {
        sawFurnitureFoot = true;
        const anchors = (byRoom[d.roomSegNum] || []).filter((e) => (e.primary === "blocker" || e.primary === "setPiece") && !(e.x === d.x && e.y === d.y));
        const near = anchors.some((a) => Math.abs(a.x - d.x) + Math.abs(a.y - d.y) === 1);
        ok(near, `${realm}: furnitureFoot seam "${d.slug}" @ (${d.x},${d.y}) sits 1 cell from a blocker/setPiece piece in room ${d.roomSegNum}`);
      }
    });
  });
  ok(sawWallBase, "sanity: at least one wallBase seam entry was exercised across realms/rooms");
  ok(sawDoorCorner || sawColumnFoot || sawFurnitureFoot, "sanity: at least one anchor-type (doorCorner/columnFoot/furnitureFoot) seam entry was exercised");
  console.log(`  seamKinds seen: wallBase=${sawWallBase} doorCorner=${sawDoorCorner} columnFoot=${sawColumnFoot} furnitureFoot=${sawFurnitureFoot}`);
  console.log(`  ✓ ${pass} passed so far`);
}

group("3 — CLEAR law: no seam entry on a DOOR cell or inside its room's own center 2x2 (re-derived independently)");
{
  const fixture = buildBigHubFixture();
  const plan = M.spatializePlan(fixture, "The Big Hub", { walkId: "bw35-3" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  ["chrome", "gloom", "fantasy"].forEach((realm) => {
    const dressed = M.dressPlan(semPlan, { realmId: realm, walkId: "bw35-3-" + realm });
    const roomBySeg = {}; dressed.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
    dressed.dressing.filter((d) => d.seam).forEach((d) => {
      const cellCode = dressed.cells[d.y * dressed.cellW + d.x];
      ok(cellCode !== M.SPATIAL_CELL.DOOR, `${realm}: seam "${d.slug}" @ (${d.x},${d.y}) is NOT on a DOOR cell (code ${cellCode})`);
      ok(cellCode === M.SPATIAL_CELL.FLOOR, `${realm}: seam "${d.slug}" @ (${d.x},${d.y}) sits on a FLOOR cell (code ${cellCode})`);
      const r = roomBySeg[d.roomSegNum];
      if (!r) return;
      const cx0 = r.x + Math.max(0, Math.floor((r.w - 2) / 2));
      const cy0 = r.y + Math.max(0, Math.floor((r.d - 2) / 2));
      const inCenter = d.x >= cx0 && d.x < cx0 + 2 && d.y >= cy0 && d.y < cy0 + 2;
      ok(!inCenter, `${realm}: seam "${d.slug}" @ (${d.x},${d.y}) is NOT inside room ${r.segNum}'s center 2x2`);
    });
  });
  console.log(`  ✓ ${pass} passed so far`);
}

group("4 — density bounded by role: per-room seam count <= DRESSING_DENSITY_BY_ROLE[role].seam");
{
  const fixture = buildHubFixture();
  const plan = M.spatializePlan(fixture, "The Hub", { walkId: "bw35-4" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  ["chrome", "gloom", "fantasy"].forEach((realm) => {
    const dressed = M.dressPlan(semPlan, { realmId: realm, walkId: "bw35-4-" + realm });
    const roomBySeg = {}; dressed.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
    const seamByRoom = {};
    dressed.dressing.filter((d) => d.seam).forEach((d) => { seamByRoom[d.roomSegNum] = (seamByRoom[d.roomSegNum] || 0) + 1; });
    Object.entries(seamByRoom).forEach(([segNum, count]) => {
      const role = roomBySeg[segNum] && roomBySeg[segNum].role;
      const budget = (M.DRESSING_DENSITY_BY_ROLE[role] || M.DRESSING_DENSITY_BY_ROLE.side).seam;
      ok(count <= budget, `${realm}: room ${segNum} (role=${role}) seam count ${count} <= budget ${budget}`);
    });
    ok(Object.keys(seamByRoom).length > 0, `${realm}: at least one room carries seam entries to bound-check`);
  });
  console.log(`  ✓ ${pass} passed so far`);
}

group("5 — determinism per walkId: same (plan,walkId) -> byte-identical seam array; different walkId diverges");
{
  const fixture = buildHubFixture();
  const plan = M.spatializePlan(fixture, "The Hub", { walkId: "bw35-5" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const d1 = M.dressPlan(semPlan, { realmId: "fantasy", walkId: "bw35-5-a" });
  const d2 = M.dressPlan(semPlan, { realmId: "fantasy", walkId: "bw35-5-a" });
  const seam1 = JSON.stringify(d1.dressing.filter((d) => d.seam));
  const seam2 = JSON.stringify(d2.dressing.filter((d) => d.seam));
  ok(seam1 === seam2, "seam sub-array byte-identical across two calls with the same (plan,walkId)");
  const d3 = M.dressPlan(semPlan, { realmId: "fantasy", walkId: "bw35-5-DIFFERENT" });
  const seam3 = JSON.stringify(d3.dressing.filter((d) => d.seam));
  ok(seam3 !== seam1, "a different walkId yields a DIFFERENT seam array (not a constant-function false positive)");
}

group("6 — realms without filler pools are LOGGED, never invented");
{
  // REALM_DRESSING is Object.freeze()'d (non-extensible) — can't add a new realm key to it. Instead
  // override `dressingRosterFor` (an ordinary function binding, not frozen) to always hand back a
  // roster with focal/blocker entries but ZERO primary:"floor"/size:"small" entries, simulating a
  // realm whose pool genuinely lacks seam-appropriate fillers.
  const src = read("src/engine/place-dressing.js") + `
;dressingRosterFor = function(realmId){
  return Object.freeze([
    Object.freeze({ slug: "no-seam-realm-focal-thing", primary: "focal", size: "small" }),
    Object.freeze({ slug: "no-seam-realm-blocker-thing", primary: "blocker", size: "medium" }),
  ]);
};
this.__dressPlan = dressPlan;
this.__REALM_DRESSING = REALM_DRESSING;
`;
  const M2 = loadModules(src);
  const fixture = buildHubFixture();
  const plan = M2.spatializePlan(fixture, "The Hub", { walkId: "bw35-6" });
  const semPlan = M2.semanticizePlan(plan, fixture, []);
  const dressed = M2.dressPlan(semPlan, { realmId: "no-seam-realm", walkId: "bw35-6" });
  const seamEntries = dressed.dressing.filter((d) => d.seam);
  ok(seamEntries.length === 0, `realm with no small floor-primary entries emits ZERO seam entries (got ${seamEntries.length})`);
  ok(M2.warnings.some((w) => w.includes("no-seam-realm") && w.includes("seam")), `dressPlan logged a warning naming the realm (warnings: ${JSON.stringify(M2.warnings)})`);
  // sanity: the realm's OTHER dressing (focal/blocker) still rolls fine — only the seam sub-pass is skipped.
  ok(dressed.dressing.some((d) => !d.seam), "the realm's non-seam dressing (focal/blocker) still rolled normally");
}

group("7a — MUTATION: disable DP_CENTER_EXCLUDE_ENABLED -> a seam entry can land in its room's center 2x2 too");
{
  const originalSrc = read("src/engine/place-dressing.js");
  const mutatedSrc = originalSrc.replace("const DP_CENTER_EXCLUDE_ENABLED = true;", "const DP_CENTER_EXCLUDE_ENABLED = false;");
  ok(mutatedSrc !== originalSrc, "mutation rewrote the DP_CENTER_EXCLUDE_ENABLED literal");
  const MM = loadModules(mutatedSrc);
  const fixture = buildBigHubFixture();
  const plan = MM.spatializePlan(fixture, "The Big Hub", { walkId: "bw35-7a" });
  const semPlan = MM.semanticizePlan(plan, fixture, []);
  let anySeamInCenter = false;
  ["chrome", "gloom", "fantasy"].forEach((realm) => {
    const dressed = MM.dressPlan(semPlan, { realmId: realm, walkId: "bw35-7a-" + realm });
    const roomBySeg = {}; dressed.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
    dressed.dressing.filter((d) => d.seam).forEach((d) => {
      const r = roomBySeg[d.roomSegNum]; if (!r) return;
      const cx0 = r.x + Math.max(0, Math.floor((r.w - 2) / 2));
      const cy0 = r.y + Math.max(0, Math.floor((r.d - 2) / 2));
      if (d.x >= cx0 && d.x < cx0 + 2 && d.y >= cy0 && d.y < cy0 + 2) anySeamInCenter = true;
    });
  });
  if (anySeamInCenter) { pass++; console.log("  ✓ with the exclusion disabled, at least one SEAM entry lands in its room's center 2x2 (seam inherits the shared guard, doesn't bypass it)"); }
  else { fail++; console.error("  FAIL: mutation did not surface a center-2x2 seam placement — fixture may need to be denser"); }
}

group("7b — MUTATION: widen dpRoomFloorCells' FLOOR check to also accept DOOR -> a seam entry can land ON a door cell");
{
  // CR-1 item 5c: densified/reshaped fixture (buildDoorAdjacentSeamFixture, see its own header
  // comment above for the full investigation) — same star topology as buildBigHubFixture, but the
  // room whose door IS wall-adjacent (b2) is now the finale (seam budget 6, not path's 3), so its
  // own doorCorner candidates no longer exhaust the seam budget before the wallBase branch runs.
  // walkId pinned to "bw35-7b-<realm>-door" (confirmed by direct sweep — see comment above); only
  // "chrome" is required to hit for `ok()` below (matches the ORIGINAL check's own "any of the 3
  // realms" discipline), all 3 are still exercised so a future roster/rng change that shifts WHICH
  // realm hits doesn't quietly break this check.
  const originalSrc = read("src/engine/place-dressing.js");
  const needle = "if (plan.cells[yy * plan.cellW + xx] === SPATIAL_CELL.FLOOR) cells.push({ x: xx, y: yy });";
  ok(originalSrc.includes(needle), "sanity: dpRoomFloorCells' exact FLOOR-check line found (mutation target exists)");
  const mutatedSrc = originalSrc.replace(
    needle,
    "if (plan.cells[yy * plan.cellW + xx] === SPATIAL_CELL.FLOOR || plan.cells[yy * plan.cellW + xx] === SPATIAL_CELL.DOOR) cells.push({ x: xx, y: yy });"
  );
  ok(mutatedSrc !== originalSrc, "mutation rewrote the FLOOR-only check");

  const fixture = buildDoorAdjacentSeamFixture();

  // RED — the mutated module.
  const MM = loadModules(mutatedSrc);
  const planRed = MM.spatializePlan(fixture, "The Big Hub V2", { walkId: "bw35-7b" });
  const semPlanRed = MM.semanticizePlan(planRed, fixture, []);
  let anyOnDoorRed = false;
  const onDoorDetail = [];
  ["chrome", "gloom", "fantasy"].forEach((realm) => {
    const dressed = MM.dressPlan(semPlanRed, { realmId: realm, walkId: "bw35-7b-" + realm + "-door" });
    dressed.dressing.forEach((d) => {
      if (dressed.cells[d.y * dressed.cellW + d.x] === MM.SPATIAL_CELL.DOOR) {
        anyOnDoorRed = true;
        onDoorDetail.push({ realm, x: d.x, y: d.y, seamKind: d.seamKind });
      }
    });
  });
  if (anyOnDoorRed) { pass++; console.log("  ✓ RED: with the FLOOR-only veto widened to also accept DOOR, a dressing entry lands ON a door cell (proves the veto — not luck — keeps cards off doors)", JSON.stringify(onDoorDetail)); }
  else { fail++; console.error("  FAIL: mutation did not surface a door-cell placement — fixture may need to be denser/differently shaped"); }

  // restored-GREEN — the SAME fixture + SAME walkIds, real unmutated src/engine/place-dressing.js.
  // Proves 7b isn't vacuous the other direction too: the mutation, not the fixture/walkId choice, is
  // what put a card on a door.
  const MG = loadModules(originalSrc);
  const planGreen = MG.spatializePlan(fixture, "The Big Hub V2", { walkId: "bw35-7b" });
  const semPlanGreen = MG.semanticizePlan(planGreen, fixture, []);
  let anyOnDoorGreen = false, greenSeamTotal = 0;
  ["chrome", "gloom", "fantasy"].forEach((realm) => {
    const dressed = MG.dressPlan(semPlanGreen, { realmId: realm, walkId: "bw35-7b-" + realm + "-door" });
    greenSeamTotal += dressed.dressing.filter((d) => d.seam).length;
    dressed.dressing.forEach((d) => {
      if (dressed.cells[d.y * dressed.cellW + d.x] === MG.SPATIAL_CELL.DOOR) anyOnDoorGreen = true;
    });
  });
  ok(greenSeamTotal > 0, `restored-GREEN sanity: this fixture+walkId set still rolls real seam entries (${greenSeamTotal}), not a degenerate empty case`);
  ok(!anyOnDoorGreen, `restored-GREEN: the SAME fixture+walkIds, real unmutated code, place ZERO entries on a door cell (${greenSeamTotal} seam entries checked)`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
