/* Verify DUNGEON-GRAPH U3 — the volumetric interior renderer's DATA layer (docs/DUNGEON-GRAPH.md
   "Build units" U3). src/ui/theater-interior.js is pure data code (no THREE/canvas/DOM — see its own
   header comment) that turns a U1/U2 SpatialPlan into per-tile-kind INSTANCE-TRANSFORM data
   (interiorBuildBoard). This harness loads place-spatialize.js + place-semantics.js + theater-interior.js
   into one node `vm` context (same pattern dev/verify-dungeon-semantics.mjs already uses for U1+U2),
   builds real SpatialPlans off synthetic walk fixtures, and asserts interiorBuildBoard's OWN output
   directly — never trusting a screenshot for the geometry-shape claims a headless-browser capture
   script can't cheaply assert per-instance.

   RED-FIRST (checked 2026-07-10 against tip eb747cd, before this unit's files existed):
     `git show eb747cd:src/engine/theater-data.js | grep 'source.kind === "interior"'` shows trayFrom's
     ONLY interior-kind branch was `const segment = source.kind==="interior" ? source.record : source.segment;
     return theaterBoardBuild(segment, scene, opts);` — it reads `source.record`, never a `plan` field,
     so handing it a SpatialPlan today does nothing (silently ignored, routed through the flat combat-
     zone-grid board builder). `grep -c setInteriorBoard src/ui/theater-boot.js` was 0. Both are now
     wired (this unit) — see src/engine/theater-data.js's trayFrom {kind:"interior",plan} branch and
     src/ui/theater-boot.js's window.Theater.setInteriorBoard.

   Checks (docs/DUNGEON-GRAPH.md U3 acceptance + the orchestrator's numbered verification list):
     1. interiorBuildBoard is a function; INTERIOR_TILE_KITS carries chrome/gloom/fantasy (law 3).
     2. an 80-room plan's board never emits more than the 4 known instance KINDS (floor/wall/
        doorframe/pillar) regardless of room/cell count — the data-layer proxy for "draw calls <= 1
        InstancedMesh per tile kind" (the GL layer, theater-boot.js, builds exactly one InstancedMesh
        per non-empty kind array — this harness proves the ARRAY shape that guarantee rests on).
     3. every wall instance has nonzero height (sy > 0) — VOLUMETRIC WALL LAW, never a flat plane.
     4. a scaleDomain-4.0 room's wall instances read height === 4x a scaleDomain-1.0 room's wall
        instances (same wallHeightBase, only the multiplier differs) — the semantic scale-domain
        signal actually reaches the geometry.
     5. a transition/squeeze door instance is narrower+lower than a plain door instance.
     6. focusSegNum+radius trims to a strict subset of the whole-plan instance count (never MORE).
     7. determinism — same (plan,opts) twice -> byte-identical instances (JSON-equal).
     8. degrades cleanly on a bare U1 plan (no U2 semantics: no role/scaleDomain/band fields) — never
        throws, every room defaults scaleDomain 1.0.

   ITERATION 2 (Adam's 2026-07-10 evening taste-gate feedback, ruling 2 — real light sources):
     9. every kept room emits ≥1 light entry ({x,z,y,color,intensity,kind,roomSegNum}); a chrome-kit
        board's lights are all kind:"lamp", a gloom/fantasy-kit board's are all kind:"torch" (law 3's
        realm-flavor split reaching the light layer, not just the tile colors).
    10. light count per room stays in [1,3] (the spec's own "1-3 per room" bound); determinism — same
        (plan,opts) twice -> byte-identical lights array (same law as check 7, extended to lights).

   NOTE — GL-layer checks (rulings 1 sprite-purity flags, 2 shadow-map enable/restore + cast-shadow
   caps, 3 piece-sprite resolution) are NOT re-implemented here: this harness is deliberately THREE/
   DOM-free (this file's own header). Those live in dev/battle-gate/capture-interior-study.mjs, which
   boots a real Chrome + THREE.WebGLRenderer and asserts window.Theater.interiorPsxAudit() /
   .shadowMapEnabled() / .interiorPiecesResolved() against the LIVE mounted scene graph (its own header
   comment documents the check-to-ruling mapping) — the only place those flags physically exist.

   Run:  node dev/verify-dungeon-interior.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

function loadModules() {
  const sandbox = { console };
  sandbox.window = sandbox; // classic-script "attaches to window" convention — sandbox IS global scope here
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/ui/theater-interior.js"),
    ";this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__INTERIOR_TILE_KITS=typeof INTERIOR_TILE_KITS!=='undefined'?INTERIOR_TILE_KITS:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "dungeon-graph-u3.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    interiorBuildBoard: sandbox.__interiorBuildBoard,
    INTERIOR_TILE_KITS: sandbox.__INTERIOR_TILE_KITS,
  };
}

function fixtureHash(s) {
  let h = 5381;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}
function fixtureRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a simple chain fixture (linear topology, matches place-spatialize's "linear" group default) —
// n segments, s1->s2->...->sn, depth = index.
function buildChainFixture(n) {
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
    exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < n - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
    light: "normal",
  }));
}

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

const M = loadModules();

group("1 — interiorBuildBoard/INTERIOR_TILE_KITS exist, chrome/gloom/fantasy kits present");
ok(typeof M.interiorBuildBoard === "function", "interiorBuildBoard is a function");
ok(typeof M.INTERIOR_TILE_KITS === "object" && M.INTERIOR_TILE_KITS, "INTERIOR_TILE_KITS is an object");
["chrome", "gloom", "fantasy"].forEach((k) => {
  const kit = M.INTERIOR_TILE_KITS[k];
  ok(kit && typeof kit.floorColor === "string" && typeof kit.wallColor === "string" && typeof kit.trimColor === "string",
    `kit "${k}" carries floor/wall/trim colors`);
  ok(kit && kit.fog && typeof kit.fog.color === "string" && typeof kit.fog.density === "number",
    `kit "${k}" carries fog {color,density}`);
});
console.log(`  ✓ ${pass} passed so far`);

group("2 — an 80-room plan's board never emits more than the 4 known instance kinds");
{
  const fixture = buildChainFixture(80);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "u3-80room" });
  const board = M.interiorBuildBoard(plan, { realmId: "chrome" });
  const kinds = Object.keys(board.instances);
  ok(kinds.length === 4 && ["floor", "wall", "doorframe", "pillar"].every((k) => kinds.includes(k)),
    `exactly the 4 known kinds present (got: ${kinds.join(",")})`);
  ok(board.meta.roomCount === 80, `meta.roomCount === 80 (got ${board.meta.roomCount})`);
  ok(board.instances.floor.length > 0, "floor instances emitted for an 80-room plan");
  console.log(`  ✓ 80-room plan: ${board.instances.floor.length} floor / ${board.instances.wall.length} wall / ${board.instances.doorframe.length} door / ${board.instances.pillar.length} pillar instances, 4 InstancedMesh kinds total`);
}

group("3 — every wall instance has nonzero height (VOLUMETRIC WALL LAW — never a flat plane)");
{
  const fixture = buildChainFixture(10);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "u3-wall-height" });
  const board = M.interiorBuildBoard(plan, { realmId: "gloom" });
  ok(board.instances.wall.length > 0, "at least one wall instance exists");
  ok(board.instances.wall.every((w) => w.sy > 0), "every wall instance sy > 0");
  ok(board.instances.wall.every((w) => w.sx > 0 && w.sz > 0), "every wall instance has real x/z footprint too (a real prism, not a plane)");
  console.log(`  ✓ ${board.instances.wall.length} wall instances, all sy>0`);
}

group("4 — scaleDomain 4.0 room walls render 4x the height of a scaleDomain 1.0 room's walls");
{
  const fixture = buildChainFixture(6);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "u3-scale-domain" });
  const semPlan = M.semanticizePlan(plan, fixture, [{ segNum: 1, scaleVsHuman: 4.0, apex: false }]);
  const board = M.interiorBuildBoard(semPlan, { realmId: "fantasy" });
  const scaledWalls = board.instances.wall.filter((w) => w.scaleDomain === 4.0);
  const humanWalls = board.instances.wall.filter((w) => w.scaleDomain === 1.0);
  ok(scaledWalls.length > 0, "at least one wall instance at scaleDomain 4.0 exists");
  ok(humanWalls.length > 0, "at least one wall instance at scaleDomain 1.0 exists (control group)");
  if (scaledWalls.length && humanWalls.length) {
    const scaledH = scaledWalls[0].sy, humanH = humanWalls[0].sy;
    ok(Math.abs(scaledH / humanH - 4.0) < 1e-9, `scaled wall height / human wall height === 4.0 (got ${scaledH}/${humanH}=${(scaledH/humanH).toFixed(4)})`);
  }
}

group("5 — a transition/squeeze door instance is narrower+lower than a plain door");
{
  const fixture = buildChainFixture(6);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "u3-squeeze-door" });
  const semPlan = M.semanticizePlan(plan, fixture, [{ segNum: 1, scaleVsHuman: 3.0, apex: false }]);
  const board = M.interiorBuildBoard(semPlan, { realmId: "chrome" });
  const squeeze = board.instances.doorframe.filter((d) => d.squeeze);
  const plainDoors = board.instances.doorframe.filter((d) => !d.squeeze);
  ok(squeeze.length > 0, "at least one squeeze doorframe instance exists (mixed-domain fixture)");
  if (squeeze.length && plainDoors.length) {
    ok(squeeze[0].sy < plainDoors[0].sy, `squeeze door sy (${squeeze[0].sy}) < plain door sy (${plainDoors[0].sy})`);
    ok(squeeze[0].sx < plainDoors[0].sx, `squeeze door sx (${squeeze[0].sx}) < plain door sx (${plainDoors[0].sx})`);
  } else {
    console.log("  (no plain door in this fixture to compare against — squeeze-vs-squeeze check skipped, not a failure)");
  }
}

group("6 — focusSegNum+radius trims to a strict subset of the whole-plan instance count");
{
  const fixture = buildChainFixture(12);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "u3-focus-trim" });
  const whole = M.interiorBuildBoard(plan, { realmId: "chrome" });
  const trimmed = M.interiorBuildBoard(plan, { realmId: "chrome", focusSegNum: 1, radius: 1 });
  const wholeTotal = whole.instances.floor.length + whole.instances.wall.length;
  const trimmedTotal = trimmed.instances.floor.length + trimmed.instances.wall.length;
  ok(trimmedTotal <= wholeTotal, `trimmed instance count (${trimmedTotal}) <= whole-plan count (${wholeTotal})`);
  ok(trimmedTotal < wholeTotal, `trimmed instance count is a STRICT subset on a 12-room chain (${trimmedTotal} < ${wholeTotal})`);
  ok(trimmed.meta.roomCount < whole.meta.roomCount, `trimmed roomCount (${trimmed.meta.roomCount}) < whole roomCount (${whole.meta.roomCount})`);
}

group("7 — determinism: same (plan,opts) twice -> byte-identical instances");
{
  const fixture = buildChainFixture(8);
  const plan = M.spatializePlan(fixture, "The Hub", { walkId: "u3-determinism" });
  const b1 = M.interiorBuildBoard(plan, { realmId: "gloom", focusSegNum: 2, radius: 2 });
  const b2 = M.interiorBuildBoard(plan, { realmId: "gloom", focusSegNum: 2, radius: 2 });
  ok(JSON.stringify(b1.instances) === JSON.stringify(b2.instances), "instances byte-identical across two calls with the same inputs");
}

group("8 — degrades cleanly on a bare U1 plan (no U2 semantics)");
{
  const fixture = buildChainFixture(5);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "u3-bare-u1" });
  ok(plan.rooms.every((r) => r.scaleDomain === 1.0), "bare U1 plan rooms already default scaleDomain 1.0 (sanity)");
  let threw = false, board = null;
  try { board = M.interiorBuildBoard(plan, { realmId: "chrome" }); } catch (e) { threw = true; }
  ok(!threw, "interiorBuildBoard never throws on a bare (non-U2) plan");
  ok(board && board.instances.wall.every((w) => w.sy === board.wallHeightBase), "every wall at the base height (scaleDomain 1.0 default, no U2 fields needed)");
}

group("9 — every kept room emits >=1 light; realm-flavored kind (chrome=lamp, gloom/fantasy=torch)");
{
  const fixture = buildChainFixture(6);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "u3-lights-chrome" });
  const chromeBoard = M.interiorBuildBoard(plan, { realmId: "chrome" });
  ok(chromeBoard.instances.floor.length > 0, "sanity: chrome board has floor instances");
  ok(Array.isArray(chromeBoard.lights) && chromeBoard.lights.length > 0, "chrome board emits >=1 light");
  ok(chromeBoard.lights.every((l) => l.kind === "lamp"), "every chrome-kit light is kind:\"lamp\"");
  ok(chromeBoard.lights.every((l) => typeof l.color === "string" && typeof l.intensity === "number"), "every light carries color+intensity");
  ok(chromeBoard.lights.every((l) => typeof l.roomSegNum === "number"), "every light is attributed to a roomSegNum");

  const roomSegNums = new Set(chromeBoard.rooms ? chromeBoard.rooms.map((r) => r.segNum) : plan.rooms.map((r) => r.segNum));
  const litSegNums = new Set(chromeBoard.lights.map((l) => l.roomSegNum));
  ok([...roomSegNums].every((s) => litSegNums.has(s)), "every room in the plan has at least one light attributed to it");

  const gloomBoard = M.interiorBuildBoard(plan, { realmId: "gloom" });
  ok(gloomBoard.lights.length > 0 && gloomBoard.lights.every((l) => l.kind === "torch"), "every gloom-kit light is kind:\"torch\"");
  const fantasyBoard = M.interiorBuildBoard(plan, { realmId: "fantasy" });
  ok(fantasyBoard.lights.length > 0 && fantasyBoard.lights.every((l) => l.kind === "torch"), "every fantasy-kit light is kind:\"torch\"");
  console.log(`  ✓ chrome ${chromeBoard.lights.length} lamp lights / gloom ${gloomBoard.lights.length} torch lights / fantasy ${fantasyBoard.lights.length} torch lights`);
}

group("10 — light count per room in [1,3]; determinism (same plan,opts -> byte-identical lights)");
{
  const fixture = buildChainFixture(8);
  const plan = M.spatializePlan(fixture, "The Hub", { walkId: "u3-lights-bounds" });
  const board = M.interiorBuildBoard(plan, { realmId: "gloom" });
  const perRoom = {};
  board.lights.forEach((l) => { perRoom[l.roomSegNum] = (perRoom[l.roomSegNum] || 0) + 1; });
  const counts = Object.values(perRoom);
  ok(counts.length > 0, "at least one room carries lights");
  ok(counts.every((c) => c >= 1 && c <= 3), `every room's light count is in [1,3] (got: ${counts.join(",")})`);

  const b1 = M.interiorBuildBoard(plan, { realmId: "gloom", focusSegNum: 2, radius: 2 });
  const b2 = M.interiorBuildBoard(plan, { realmId: "gloom", focusSegNum: 2, radius: 2 });
  ok(JSON.stringify(b1.lights) === JSON.stringify(b2.lights), "lights array byte-identical across two calls with the same inputs");

  const trimmed = M.interiorBuildBoard(plan, { realmId: "gloom", focusSegNum: 2, radius: 1 });
  ok(trimmed.lights.length <= board.lights.length, `focus-trimmed lights (${trimmed.lights.length}) <= whole-plan lights (${board.lights.length})`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
