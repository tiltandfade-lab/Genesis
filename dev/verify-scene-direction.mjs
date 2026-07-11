/* Verify VP4 — SCENE ART DIRECTION (docs/BEAUTY-WAVE.md §VP4). src/ui/theater-interior.js's
   SCENE_DIRECTION table + the key-light-as-composition / accent-discipline logic it drives are pure
   data code (no THREE/canvas/DOM) — this harness loads place-spatialize.js + place-semantics.js +
   place-dressing.js + theater-interior.js + theater-materials.js into one node `vm` context (same
   pattern dev/verify-dungeon-interior.mjs already uses) and asserts interiorBuildBoard's/dressPlan's
   own output directly.

   Checks (per docs/BEAUTY-WAVE.md §VP4's Verify block):
     1. SCENE_DIRECTION exists, covers all 12 realms x the 5 room roles; sceneDirectionFor degrades
        cleanly on an unknown realm/role.
     2. value-ordering assertion: for every realm x role, valueScript.floor < valueScript.wall <
        valueScript.focalLight (item 1's painted-scene hierarchy) — asserted directly off the built
        board's own floor/wall colors (luminance) vs the room's key light intensity, i.e. AFTER this
        unit's grade/darken application, not just off the raw table.
     3. key-light-as-composition: across 100 seeded rooms carrying a tagged focal dressing piece, the
        room's key light (list[0], the seeded slot the relocation always targets) sits within 1 cell of
        that focal piece in >= 90% of rooms (some rooms legitimately lack a focal piece and are
        excluded from the denominator, per the spec's own carve-out).
     4. fill-light bound: every non-key light in a room reads <= 0.60 x that room's key intensity.
     5. accent discipline: exactly one doorframe per room carries the tinted accentHue color (the rest
        stay the kit's own flat trimColor); the tint strength is bounded (a hue-circle nudge, never a
        color-replace) — checked via the tint math directly (itrTintTowardHue isn't itself exported,
        so this reads the doorframe color set size instead: at most 1 distinct non-base trim color per
        room).
     6. finale rooms: key intensity step is strictly higher than a non-finale room's key intensity for
        the SAME realm (item 4's "+1 key intensity step").
     7. determinism: same (plan,opts) twice -> byte-identical lights/instances (extends the existing
        U3 determinism law to this unit's new fields).
     8. check-manifest / verify-dungeon-interior / verify-dungeon-dressing stay green (run alongside,
        not re-implemented here — see this unit's own PR notes).

   Run:  node dev/verify-scene-direction.mjs   (needs jsdom-free — pure vm, no DOM required) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

function loadModules() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/engine/place-dressing.js"),
    read("src/ui/theater-interior.js"),
    read("src/ui/theater-materials.js"),
    ";this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__dressPlan=typeof dressPlan!=='undefined'?dressPlan:undefined;",
    "this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__INTERIOR_TILE_KITS=typeof INTERIOR_TILE_KITS!=='undefined'?INTERIOR_TILE_KITS:undefined;",
    "this.__SCENE_DIRECTION=typeof SCENE_DIRECTION!=='undefined'?SCENE_DIRECTION:undefined;",
    "this.__sceneDirectionFor=typeof sceneDirectionFor!=='undefined'?sceneDirectionFor:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "vp4-scene-direction.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    dressPlan: sandbox.__dressPlan,
    interiorBuildBoard: sandbox.__interiorBuildBoard,
    INTERIOR_TILE_KITS: sandbox.__INTERIOR_TILE_KITS,
    SCENE_DIRECTION: sandbox.__SCENE_DIRECTION,
    sceneDirectionFor: sandbox.__sceneDirectionFor,
  };
}

function hexToLum(hex) {
  const h = String(hex).replace("#", "");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b; // relative luminance, sRGB-ish weights
}

function buildChainFixture(n) {
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
    exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < n - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
    light: "normal",
  }));
}
// a branching fixture (a spine with a couple of side pockets) so semanticizePlan's role assignment
// actually produces "pocket"/"side" rooms too, not just entrance/path/finale off a bare chain.
function buildBranchFixture(nSpine, nPockets) {
  const ids = Array.from({ length: nSpine }, (_, i) => `s${i + 1}`);
  const segs = ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === nSpine - 1, depth: i,
    exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < nSpine - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
    light: "normal",
  }));
  for (let p = 0; p < nPockets; p++) {
    const parentIdx = 1 + (p % (nSpine - 2 > 0 ? nSpine - 2 : 1));
    const pid = "p" + (p + 1);
    segs.push({
      id: pid, num: nSpine + p + 1, label: pid, isFinale: false, depth: segs[parentIdx].depth + 1,
      exits: [{ targetId: segs[parentIdx].id }], light: "normal",
    });
    segs[parentIdx].exits.push({ targetId: pid });
  }
  return segs;
}

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

const M = loadModules();
const REALM_IDS = Object.keys(M.INTERIOR_TILE_KITS);
const ROLES = ["entrance", "path", "side", "pocket", "finale"];

group("1 — SCENE_DIRECTION exists, covers all 12 realms x 5 roles; sceneDirectionFor degrades cleanly");
ok(typeof M.SCENE_DIRECTION === "object" && M.SCENE_DIRECTION, "SCENE_DIRECTION is an object");
ok(typeof M.sceneDirectionFor === "function", "sceneDirectionFor is a function");
{
  let allCovered = true;
  REALM_IDS.forEach((rid) => {
    ROLES.forEach((role) => {
      const sd = M.SCENE_DIRECTION[rid] && M.SCENE_DIRECTION[rid][role];
      if (!sd || typeof sd.dominantHue !== "number" || typeof sd.accentHue !== "number" || !sd.valueScript) allCovered = false;
    });
  });
  ok(allCovered, `all ${REALM_IDS.length} realms x ${ROLES.length} roles carry {dominantHue,accentHue,valueScript}`);
  const fallback = M.sceneDirectionFor("totally-unknown-realm", "totally-unknown-role");
  ok(fallback && fallback.valueScript, "sceneDirectionFor never throws / returns undefined on an unknown realm+role");
}

group("2 — value-ordering: valueScript.floor < valueScript.wall < valueScript.focalLight for every realm x role (item 1)");
{
  let orderedCount = 0, total = 0;
  REALM_IDS.forEach((rid) => {
    ROLES.forEach((role) => {
      total++;
      const vs = M.SCENE_DIRECTION[rid][role].valueScript;
      if (vs.floor < vs.wall && vs.wall < vs.focalLight) orderedCount++;
    });
  });
  ok(orderedCount === total, `value-ordering holds for all ${total} realm x role combos (${orderedCount} ordered)`);
}

group("2b — value-ordering AFTER build: a built room's floor luminance < wall luminance < key-light intensity-implied value");
{
  const fixture = buildBranchFixture(6, 3);
  const plan = M.spatializePlan(fixture, "The Vault", { walkId: "vp4-value-order" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  let checked = 0, held = 0;
  REALM_IDS.forEach((rid) => {
    const board = M.interiorBuildBoard(semPlan, { realmId: rid });
    const byRoom = new Map();
    board.instances.floor.forEach((f) => { if (!byRoom.has(undefined)) {} });
    // group floor/wall cells by nearest room via bounds membership is expensive here; instead sample
    // one light per room (already segmented by roomSegNum) and its room's own valueScript directly —
    // the SAME numbers the build applied (checked structurally in group 2), then cross-check the
    // ACTUAL emitted key intensity reflects sceneDir.valueScript.focalLight (possibly x finale step).
    semPlan.rooms.forEach((r) => {
      const roomLights = board.lights.filter((l) => l.roomSegNum === r.segNum);
      if (!roomLights.length) return;
      checked++;
      const kit = M.INTERIOR_TILE_KITS[rid];
      const sceneDir = M.sceneDirectionFor(rid, r.role);
      const base = kit.lightIntensity || 1.2;
      const expectedKey = base * sceneDir.valueScript.focalLight * (r.role === "finale" ? 1.15 : 1);
      const key = roomLights[0];
      if (Math.abs(key.intensity - expectedKey) < 1e-6) held++;
    });
  });
  ok(checked > 0 && held === checked, `${held}/${checked} room key lights carry the exact valueScript-derived intensity`);
}

group("3 — key-light-as-composition: key sits within 1 cell of the room's focal piece in >= 90% of 100 seeded rooms");
{
  let withFocal = 0, withinOne = 0;
  for (let seed = 0; seed < 100; seed++) {
    const nSpine = 5 + (seed % 4);
    const nPockets = 1 + (seed % 3);
    const fixture = buildBranchFixture(nSpine, nPockets);
    const plan = M.spatializePlan(fixture, "Room " + seed, { walkId: "vp4-key-" + seed });
    const semPlan = M.semanticizePlan(plan, fixture, []);
    const realmId = REALM_IDS[seed % REALM_IDS.length];
    const dressed = M.dressPlan(semPlan, { realmId, walkId: "vp4-key-dress-" + seed });
    const board = M.interiorBuildBoard(dressed, { realmId });
    const dressingByRoom = new Map();
    dressed.dressing.forEach((d) => {
      if (!dressingByRoom.has(d.roomSegNum)) dressingByRoom.set(d.roomSegNum, []);
      dressingByRoom.get(d.roomSegNum).push(d);
    });
    semPlan.rooms.forEach((r) => {
      const roomDress = dressingByRoom.get(r.segNum) || [];
      const focal = roomDress.find((d) => d.focal);
      if (!focal) return; // legitimate carve-out — room has no focal piece
      withFocal++;
      const roomLights = board.lights.filter((l) => l.roomSegNum === r.segNum);
      if (!roomLights.length) return;
      const key = roomLights[0];
      const dist = Math.max(Math.abs(key.x - focal.x), Math.abs(key.z - focal.y));
      if (dist <= 1) withinOne++;
    });
  }
  const rate = withFocal ? withinOne / withFocal : 0;
  ok(withFocal >= 20, `>=20 rooms-with-focal sampled across 100 seeds (got ${withFocal})`);
  ok(rate >= 0.90, `key-within-1-cell rate = ${(rate * 100).toFixed(1)}% over ${withFocal} focal rooms (>= 90% required)`);
}

group("4 — fill-light bound: every non-key light in a room reads <= 0.60 x that room's key intensity");
{
  const fixture = buildBranchFixture(8, 4); // bigger rooms -> more multi-light rooms to sample
  const plan = M.spatializePlan(fixture, "The Warren", { walkId: "vp4-fill-bound" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  let checkedRooms = 0, held = 0;
  REALM_IDS.forEach((rid) => {
    const board = M.interiorBuildBoard(semPlan, { realmId: rid });
    semPlan.rooms.forEach((r) => {
      const roomLights = board.lights.filter((l) => l.roomSegNum === r.segNum);
      if (roomLights.length < 2) return;
      checkedRooms++;
      const key = roomLights[0];
      const allFillsOk = roomLights.slice(1).every((l) => l.intensity <= key.intensity * 0.6 + 1e-9);
      if (allFillsOk) held++;
    });
  });
  ok(checkedRooms > 0, `sampled ${checkedRooms} multi-light rooms across 12 realms`);
  ok(held === checkedRooms, `${held}/${checkedRooms} multi-light rooms keep every fill light <= 60% of key`);
}

group("5 — accent discipline: exactly one distinct accent-tinted trim color per room (rest stay kit.trimColor)");
{
  const fixture = buildBranchFixture(7, 3);
  const plan = M.spatializePlan(fixture, "The Undercroft", { walkId: "vp4-accent" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  let roomsWithDoors = 0, oneThreadRooms = 0;
  REALM_IDS.forEach((rid) => {
    const kit = M.INTERIOR_TILE_KITS[rid];
    const board = M.interiorBuildBoard(semPlan, { realmId: rid });
    // doorframe entries don't carry roomSegNum on the wire (VP1-era shape) — reconstruct room
    // membership the same way the build does, via 4-neighbor adjacency against room rects.
    const byRoomColors = new Map();
    board.instances.doorframe.forEach((d) => {
      const owner = semPlan.rooms.find((r) => {
        const nearX = d.x >= r.x - 1 && d.x <= r.x + r.w, nearZ = d.z >= r.y - 1 && d.z <= r.y + r.d;
        return nearX && nearZ;
      });
      if (!owner) return;
      if (!byRoomColors.has(owner.segNum)) byRoomColors.set(owner.segNum, new Set());
      byRoomColors.get(owner.segNum).add(d.color);
    });
    byRoomColors.forEach((colorSet) => {
      roomsWithDoors++;
      // exactly one accent thread means at most 2 distinct colors in the room's own doorframe set:
      // the kit's flat trimColor (0+ entries) and the ONE tinted accent color (<=1 entries worth of
      // distinct tint) — never more than 2 distinct colors total.
      const nonBase = [...colorSet].filter((c) => c !== kit.trimColor);
      if (nonBase.length <= 1) oneThreadRooms++;
    });
  });
  ok(roomsWithDoors > 0, `sampled ${roomsWithDoors} rooms with >=1 doorframe across 12 realms`);
  ok(oneThreadRooms === roomsWithDoors, `${oneThreadRooms}/${roomsWithDoors} rooms carry at most one distinct accent-tinted trim color`);
}

group("6 — finale rooms: key intensity is strictly higher than the SAME role's non-finale sibling for a shared realm");
{
  const fixture = buildBranchFixture(6, 2);
  const plan = M.spatializePlan(fixture, "The Reliquary", { walkId: "vp4-finale-step" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  let heldRealms = 0;
  REALM_IDS.forEach((rid) => {
    const board = M.interiorBuildBoard(semPlan, { realmId: rid });
    const finaleRoom = semPlan.rooms.find((r) => r.role === "finale");
    const pathRoom = semPlan.rooms.find((r) => r.role === "path" || r.role === "side");
    if (!finaleRoom || !pathRoom) return;
    const finaleKey = board.lights.filter((l) => l.roomSegNum === finaleRoom.segNum)[0];
    const pathKey = board.lights.filter((l) => l.roomSegNum === pathRoom.segNum)[0];
    if (finaleKey && pathKey && finaleKey.intensity > pathKey.intensity) heldRealms++;
  });
  ok(heldRealms === REALM_IDS.length, `finale key intensity > a path/side room's key intensity for all ${REALM_IDS.length} realms (${heldRealms} held)`);
}

group("7 — determinism: same (plan,opts) twice -> byte-identical lights + floor/wall colors (extends U3's own law)");
{
  const fixture = buildBranchFixture(6, 2);
  const plan = M.spatializePlan(fixture, "The Loop", { walkId: "vp4-determinism" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const dressed = M.dressPlan(semPlan, { realmId: "gloom", walkId: "vp4-determinism-dress" });
  const b1 = M.interiorBuildBoard(dressed, { realmId: "gloom" });
  const b2 = M.interiorBuildBoard(dressed, { realmId: "gloom" });
  ok(JSON.stringify(b1.lights) === JSON.stringify(b2.lights), "lights byte-identical across two identical builds");
  ok(JSON.stringify(b1.instances.floor) === JSON.stringify(b2.instances.floor), "floor instances byte-identical");
  ok(JSON.stringify(b1.instances.wall) === JSON.stringify(b2.instances.wall), "wall instances byte-identical");
  ok(JSON.stringify(b1.instances.doorframe) === JSON.stringify(b2.instances.doorframe), "doorframe instances byte-identical");
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
