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

   GR1 ADDITIONS (docs/GRAPHICS-ENGINE.md build unit GR1, §E TEXTURE-PER-REALM — checks 11-15 below):
   RED-FIRST, checked 2026-07-10 against origin/claude/genesis-sprite-corpus-tags-edeaac tip cd84f7685:
     `git show cd84f7685:src/ui/theater-interior.js | grep -c REALM_MATERIALS` -> 0; src/ui/theater-
     materials.js did not exist at that tip at all (`git cat-file -e` fails). Both now exist (this unit).
   11. REALM_MATERIALS exists and every one of the 12 realms (INTERIOR_TILE_KITS' own key set) resolves
       a full material kit — floor/wall/trim each carry a material string + numeric grainIntensity.
   12. determinism — materialTexturePixels(material,baseColor,seedStr,size,grain) called twice with the
       IDENTICAL 5 args produces a byte-identical pixel buffer (Buffer.compare === 0); a different
       seedStr (same material/color) produces a DIFFERENT buffer (the boot-time-seeded, not constant,
       claim).
   13. contrast bound — every sampled pixel's per-channel deviation from the base color stays within
       the declared grainIntensity (plus a small byte-rounding epsilon) — the SUBTLE-TEXTURE LAW's own
       "low contrast ALWAYS" instruction, asserted on REAL painted pixels, not just the painter's
       by-construction argument.
   14. texel density — for every realm, the floor and wall material textures bake at the SAME pixel
       dimensions (MATERIAL_TEXEL_PX, shared, never a per-surface override) — "one texel density across
       a kit" (the law's own words).
   15. an unknown material name degrades to the mottle painter rather than throwing (interiorTileKitFor/
       realmMaterialFor's own "never throws" discipline, mirrored one layer down).

   BEAUTY-WAVE.md VP1 ADDITIONS (checks 22-27 below) — the kaiju-scale-bug fix: interiorBuildPieces
   (theater-boot.js) sized creature billboards through the TABLETOP render-height-multiplier
   convention (spriteSizeScaleFor(size) x GLB_TARGET_HEIGHT x entry.scale) while interior space is
   TRUE-SCALE (cellSize: 1 world unit = 5ft) — a medium creature inherited several world units of
   table height instead of ~1.1. theater-boot.js is the sealed ES-module boundary file (import THREE
   directly), so these checks borrow dev/verify-theater-sprites.mjs's own process-isolated
   jsdom+vendored-three subprocess pattern (its header comment explains why: loadWholeObjectBuilders'
   async callback races a shared `global.window` across sequential in-process loads) rather than the
   vm-sandbox this file uses for the THREE-free data layer above.
   RED-FIRST (checked 2026-07-10, before this unit's fix): interiorBuildPieces called buildSpriteBillboard
   directly (`const g = buildSpriteBillboard(entry); ... g.position.set(..., (base.floor||0)-0.4, ...)`) —
   the SAME tabletop sizing math figureFor() uses for a combat unit. Check 22 proves that TODAY (pre-fix)
   a medium piece's built height is provably > 2 world units by re-deriving the old formula's own
   arithmetic (spriteSizeScaleFor("medium")=1 x GLB_TARGET_HEIGHT=1.5 = 1.5 world units MINIMUM before any
   entry.scale > 1 calibration multiplies it further — already inside "several world units" territory
   for anything with a >1.33 calibration, and every Large+ creature clears 2 units outright via the SRD
   size ladder alone), then checks 23-27 assert the FIXED theater-boot.js produces true-scale heights via
   a live subprocess build of interiorBuildPieces itself.
   Checks 22-27:
     22. RED-FIRST — the OLD formula (spriteSizeScaleFor x GLB_TARGET_HEIGHT x calib), independently
         re-derived here off the size ladder + GLB_TARGET_HEIGHT constants, proves a medium/large piece
         would have exceeded 2 world units under the pre-fix code path.
     23. medium piece (scaleTrue=1.0) builds to 1.05-1.15 world units; large (scaleTrue~2.0) to ~2.0-2.4.
     24. the loop-gate's knight-type piece (scaleVsHuman override, no registry scaleTrue) stays <= 1.3.
     25. floor-line offset math: a nonzero entry.floor fixture's group.position.y sits at
         -0.5 - floor*height (the floor-CONTACT line, not the image's raw bottom edge, lands on the
         y=-0.5 floor plane).
     26. an oversize piece (scaleTrue forced huge) clamps to wallHeightBase*0.95 and logs
         "qa: oversize-clamped".
     27. registry fold — data/sprite-registry.js emits feet/scaleTrue for >= 800 cut slugs (grep count);
         MUTATION: stubbing the fold's sizing_for() call out of build/gen-sprite-registry.py and
         regenerating into a scratch --out file reds this same count check, then the real file is
         restored and re-proven green.

   Run:  node dev/verify-dungeon-interior.mjs */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
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
    read("src/ui/theater-materials.js"),
    ";this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__INTERIOR_TILE_KITS=typeof INTERIOR_TILE_KITS!=='undefined'?INTERIOR_TILE_KITS:undefined;",
    "this.__REALM_MATERIALS=typeof REALM_MATERIALS!=='undefined'?REALM_MATERIALS:undefined;",
    "this.__realmMaterialFor=typeof realmMaterialFor!=='undefined'?realmMaterialFor:undefined;",
    "this.__materialTexturePixels=typeof materialTexturePixels!=='undefined'?materialTexturePixels:undefined;",
    "this.__MATERIAL_TEXEL_PX=typeof MATERIAL_TEXEL_PX!=='undefined'?MATERIAL_TEXEL_PX:undefined;",
    "this.__materialFamilyFor=typeof materialFamilyFor!=='undefined'?materialFamilyFor:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "dungeon-graph-u3.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    interiorBuildBoard: sandbox.__interiorBuildBoard,
    INTERIOR_TILE_KITS: sandbox.__INTERIOR_TILE_KITS,
    REALM_MATERIALS: sandbox.__REALM_MATERIALS,
    realmMaterialFor: sandbox.__realmMaterialFor,
    materialTexturePixels: sandbox.__materialTexturePixels,
    MATERIAL_TEXEL_PX: sandbox.__MATERIAL_TEXEL_PX,
    materialFamilyFor: sandbox.__materialFamilyFor,
  };
}

// #ffabcd -> {r,g,b} (test-side only — independent of theater-materials.js's own mtHexToRgb, so a bug
// in that internal helper can't silently cancel out against this check's own parsing).
function hexToRgb(hex) {
  const h = String(hex).replace("#", "");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
// node's Buffer is available without an import (global) — used for byte-identical buffer comparisons.

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
  // GR3 (docs/GRAPHICS-ENGINE.md build unit GR3): kit.fog.density (the old ad-hoc per-kit number,
  // 0.02-0.035) is RETIRED — the interior fog default is now kit.grade.fogWhisper (checks 16-21,
  // below). fog keeps only its color (still the void/fog backdrop's base tint).
  ok(kit && kit.fog && typeof kit.fog.color === "string",
    `kit "${k}" carries fog {color}`);
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

// ═══ GR1 (docs/GRAPHICS-ENGINE.md build unit GR1, §E TEXTURE-PER-REALM) — this file's own header
// comment documents the RED-FIRST proof for these 5 groups. ══════════════════════════════════════════

group("11 — REALM_MATERIALS: all 12 realms resolve a full material kit (floor/wall/trim)");
{
  ok(typeof M.REALM_MATERIALS === "object" && M.REALM_MATERIALS, "REALM_MATERIALS is an object");
  ok(typeof M.realmMaterialFor === "function", "realmMaterialFor is a function");
  const realmIds = Object.keys(M.INTERIOR_TILE_KITS);
  ok(realmIds.length === 12, `INTERIOR_TILE_KITS carries exactly 12 realms (got ${realmIds.length}: ${realmIds.join(",")})`);
  realmIds.forEach((realmId) => {
    ["floor", "wall", "trim"].forEach((surface) => {
      const entry = M.realmMaterialFor(realmId, surface);
      ok(entry && typeof entry.material === "string" && entry.material.length > 0,
        `realm "${realmId}" surface "${surface}" carries a material string`);
      ok(entry && typeof entry.grainIntensity === "number" && entry.grainIntensity > 0 && entry.grainIntensity <= 0.14,
        `realm "${realmId}" surface "${surface}" carries a LOW grainIntensity in (0, 0.14] (got ${entry && entry.grainIntensity})`);
      ok(entry && typeof entry.color === "string" && /^#[0-9a-fA-F]{6}$/.test(entry.color),
        `realm "${realmId}" surface "${surface}" resolves a real hex color anchor (got ${entry && entry.color})`);
    });
  });
  console.log(`  ✓ all 12 realms x 3 surfaces resolve a full {material,grainIntensity,color} kit`);
}

group("12 — determinism: materialTexturePixels(same args) -> byte-identical buffer; a different seed differs");
{
  const a1 = M.materialTexturePixels("stone-course", "#453b4d", "gloom:floor", 64, 0.12);
  const a2 = M.materialTexturePixels("stone-course", "#453b4d", "gloom:floor", 64, 0.12);
  ok(Buffer.compare(Buffer.from(a1.data), Buffer.from(a2.data)) === 0, "identical (material,color,seed,size,grain) -> byte-identical pixel buffer");
  const b1 = M.materialTexturePixels("stone-course", "#453b4d", "gloom:wall", 64, 0.12);
  ok(Buffer.compare(Buffer.from(a1.data), Buffer.from(b1.data)) !== 0, "a DIFFERENT seedStr (same material/color) paints a different buffer — boot-time SEEDED, not a constant texture");
  const c1 = M.materialTexturePixels("metal-panel", "#8fa6b0", "chrome:floor", 64, 0.09);
  const c2 = M.materialTexturePixels("metal-panel", "#8fa6b0", "chrome:floor", 64, 0.09);
  ok(Buffer.compare(Buffer.from(c1.data), Buffer.from(c2.data)) === 0, "determinism holds for a second (material,realm,surface) combo too (metal-panel/chrome)");
}

group("13 — contrast bound: sampled pixels stay within the declared grainIntensity of the base color (SUBTLE-TEXTURE LAW)");
{
  const CASES = [
    ["stone-course", "#453b4d", "gloom:floor", 0.12],
    ["plank", "#a9865c", "frontier:floor", 0.11],
    ["metal-panel", "#3d525d", "chrome:wall", 0.09],
    ["moss-stone", "#3d4a2e", "lost-world:floor", 0.12],
    ["mottle", "#3a3530", "noir:floor", 0.1],
  ];
  const EPS = 0.02; // byte-rounding slack — mtClampByte rounds to the nearest integer channel value
  CASES.forEach(([material, baseHex, seedStr, grain]) => {
    const px = M.materialTexturePixels(material, baseHex, seedStr, 64, grain);
    const base = hexToRgb(baseHex);
    let maxDev = 0;
    for (let i = 0; i < px.data.length; i += 4) {
      [["r", 0], ["g", 1], ["b", 2]].forEach(([ch, off]) => {
        const baseByte = base[ch];
        if (baseByte === 0) return; // a 0 base channel can only paint 0 (factor x 0 = 0) — no ratio to check
        const dev = Math.abs(px.data[i + off] - baseByte) / baseByte;
        if (dev > maxDev) maxDev = dev;
      });
    }
    ok(maxDev <= grain + EPS, `${material} @ "${seedStr}": max sampled channel deviation ${maxDev.toFixed(4)} <= declared grainIntensity ${grain} (+${EPS} rounding slack)`);
  });
  console.log(`  ✓ ${CASES.length} material/realm combos sampled, all within their LOW-contrast band`);
}

group("14 — texel density: floor and wall bake at the SAME pixel dimensions for every realm (one texel density per kit)");
{
  ok(typeof M.MATERIAL_TEXEL_PX === "number" && M.MATERIAL_TEXEL_PX > 0, "MATERIAL_TEXEL_PX is a positive number");
  const realmIds = Object.keys(M.INTERIOR_TILE_KITS);
  realmIds.forEach((realmId) => {
    const floorEntry = M.realmMaterialFor(realmId, "floor");
    const wallEntry = M.realmMaterialFor(realmId, "wall");
    const floorPx = M.materialTexturePixels(floorEntry.material, floorEntry.color, realmId + ":floor", undefined, floorEntry.grainIntensity);
    const wallPx = M.materialTexturePixels(wallEntry.material, wallEntry.color, realmId + ":wall", undefined, wallEntry.grainIntensity);
    ok(floorPx.width === M.MATERIAL_TEXEL_PX && floorPx.height === M.MATERIAL_TEXEL_PX, `realm "${realmId}" floor texture bakes at MATERIAL_TEXEL_PX (${M.MATERIAL_TEXEL_PX}) — got ${floorPx.width}x${floorPx.height}`);
    ok(floorPx.width === wallPx.width && floorPx.height === wallPx.height, `realm "${realmId}" floor (${floorPx.width}x${floorPx.height}) and wall (${wallPx.width}x${wallPx.height}) bake at IDENTICAL texel density`);
  });
  console.log(`  ✓ ${realmIds.length} realms: floor/wall texel density matches (all at ${M.MATERIAL_TEXEL_PX}px)`);
}

group("15 — an unknown/typo'd material name degrades to the mottle painter rather than throwing");
{
  let threw = false, px = null;
  try { px = M.materialTexturePixels("not-a-real-material", "#8fa6b0", "test:unknown", 64, 0.1); } catch (e) { threw = true; }
  ok(!threw, "materialTexturePixels never throws on an unknown material name");
  ok(px && px.width === 64 && px.height === 64, "unknown material still paints a full-size buffer (mottle fallback)");
  // the fallback ROUTES to the mottle family (materialFamilyFor's own job) — checked directly, rather
  // than expecting byte-identity with an explicit "mottle" call: the pixel seed folds in the material
  // NAME itself ("not-a-real-material" vs "mottle"), so the two buffers differing is expected and
  // correct (still boot-time-seeded per name), not a sign the fallback failed.
  ok(typeof M.materialFamilyFor === "function" && M.materialFamilyFor("not-a-real-material") === "mottle",
    "materialFamilyFor routes an unknown material name to the \"mottle\" family");
  const base = hexToRgb("#8fa6b0");
  let maxDev = 0;
  for (let i = 0; i < px.data.length; i += 4) {
    [["r", 0], ["g", 1], ["b", 2]].forEach(([ch, off]) => {
      if (base[ch] === 0) return;
      const dev = Math.abs(px.data[i + off] - base[ch]) / base[ch];
      if (dev > maxDev) maxDev = dev;
    });
  }
  ok(maxDev <= 0.1 + 0.02, `unknown-material fallback still paints within a LOW-contrast band (mottle's own bilinear-bounded output) — max deviation ${maxDev.toFixed(4)}`);
}

// ============================================================================
// GR3+GR4 ADDITIONS (docs/GRAPHICS-ENGINE.md build units GR3 LIGHT RIG LAW + GR4 STAGE LAW —
// checks 16-21 below).
//
// RED-FIRST (checked 2026-07-10 against origin/claude/genesis-sprite-corpus-tags-edeaac tip 51b6d85,
// BEFORE this unit's edits):
//   `git show 51b6d85:src/ui/theater-boot.js | grep -c HemisphereLight` -> 0 (no hemisphere key existed
//   at all — mount() built only a key+fill DirectionalLight pair, applyLightProfile's ambient/points).
//   `git show 51b6d85:src/ui/theater-boot.js | grep -n 'skirt'` -> 5 hits, ALL "robe-skirt" (a character
//   CLOTHING part name, theaterFigures' cloth-material dispatch) — zero hits for a diorama-edge/board-
//   perimeter skirt group; `git show 51b6d85:src/ui/theater-interior.js | grep -c
//   'gradeTint\|gradeStrength\|fogWhisper'` -> 0 (kits carried only an ad-hoc per-kit `fog.density`
//   number, 0.02-0.035, no shared per-realm grade concept at all). Both are now real (this unit) — see
//   theater-boot.js's `new THREE.HemisphereLight(...)` in mount() and its `shadowKind==="skirt"` branch
//   in interiorBuildInstancedMesh/setInteriorBoard, and theater-interior.js's per-kit `grade` field +
//   `itrBuildSkirtRing`.
//
//   16. structural (text-scan theater-boot.js, the ES-module GL boundary file excluded from this
//       harness's own vm sandbox — same "text-scan cross-reference" discipline dev/verify-theater-
//       light-props.mjs already established for GL-layer facts a pure-data harness can't exercise
//       without a browser): a HemisphereLight is constructed exactly once, inside mount() (so BOTH
//       render channels — setBoard's flat table AND setInteriorBoard's volumetric tray — inherit the
//       SAME rig instance by construction by sharing S.scene, never a per-channel duplicate wired
//       separately that could drift out of parity); its intensity literal stays <= the GR3 bound.
//   17. regression (text-scan): setBoard's existing "restore shadowMap.enabled=false whenever a
//       COMBAT/tabletop board mounts" line (U3-era, unchanged by this unit) is still present and still
//       the ONLY place shadow-mapping turns back off — the tabletop "no shadow maps" ruling (§2) stays
//       intact even though mount() now shares a light (HemisphereLight, which per the three.js API has
//       no castShadow property at all — incapable of reopening that ruling by construction).
//   18. structural (text-scan): setInteriorBoard wires the skirt InstancedMesh (data.skirt through
//       interiorBuildInstancedMesh(..., "skirt")) and grades its own void/fog backdrop through the
//       kit's own gradeTint/gradeStrength via gradeColorLocal (GR4's "route voidTintFor through the kit
//       grade" + GR3's "same grade function as the table's own void-tint line").
//   19. GR3 grade data: INTERIOR_TILE_KITS' `grade` field exists for all 12 realms; every strength stays
//       <= INTERIOR_GRADE_STRENGTH_MAX (0.15, the GR3 acceptance bound); fogWhisper is 0 for every realm
//       EXCEPT gloom (the taste ruling: "fog off by default except a whisper where the realm earns it —
//       gloom keeps a whisper, others 0"), and interiorBuildBoard's own tileKit output threads all three
//       fields through verbatim (never re-derived, never dropped).
//   20. GR4 skirt data: interiorBuildBoard's `skirt` array rings the FULL board-bounds perimeter (count
//       matches the plain w*h-minus-interior formula for the fixture's own tracked bounds) and — via the
//       SAME y-formula theater-boot.js's interiorBuildInstancedMesh uses for shadowKind==="skirt"
//       (y = -0.5 - sy/2) — sits strictly below y=-0.5, never overlapping the shared floor plane.
//   21. determinism: same (plan,opts) twice -> skirt array byte-identical (JSON-equal), same law as
//       check 7 (instances) / check 10 (lights), extended to the skirt channel.
// ============================================================================
const bootSrc = read("src/ui/theater-boot.js");

group("16 — GR3: a shared HemisphereLight is built once in mount() (table+interior parity by construction)");
{
  const mountMatch = bootSrc.match(/function mount\(el, opts\)\{[\s\S]*?\n\}\n/);
  ok(!!mountMatch, "mount(el, opts) function body is found in theater-boot.js");
  const mountBody = mountMatch ? mountMatch[0] : "";
  const hemiCallsInMount = (mountBody.match(/new THREE\.HemisphereLight\(/g) || []).length;
  ok(hemiCallsInMount === 1, `exactly one HemisphereLight is constructed inside mount() — found ${hemiCallsInMount}`);
  const hemiCallsWhole = (bootSrc.match(/new THREE\.HemisphereLight\(/g) || []).length;
  ok(hemiCallsWhole === 1, `HemisphereLight is constructed in exactly ONE place in the whole file (no per-channel duplicate) — found ${hemiCallsWhole}`);
  ok(/new THREE\.HemisphereLight\(HEMI_SKY, HEMI_GROUND, HEMI_INTENSITY_DEFAULT\)/.test(mountBody),
    "mount() constructs the hemisphere off the named HEMI_SKY/HEMI_GROUND/HEMI_INTENSITY_DEFAULT constants (not an untraceable inline literal)");
  const intensityMatch = bootSrc.match(/const HEMI_SKY = 0x[0-9a-f]+, HEMI_GROUND = 0x[0-9a-f]+, HEMI_INTENSITY_DEFAULT = ([0-9.]+);/);
  const intensity = intensityMatch ? parseFloat(intensityMatch[1]) : NaN;
  const HEMI_INTENSITY_BOUND = 0.35;
  ok(Number.isFinite(intensity) && intensity > 0 && intensity <= HEMI_INTENSITY_BOUND,
    `HEMI_INTENSITY_DEFAULT (${intensity}) is a positive number <= ${HEMI_INTENSITY_BOUND} (low-intensity key — the scene's own torches/lamps stay the drama)`);
  ok(/scene\.add\(hemi\)/.test(mountBody), "the hemisphere light is added to the scene inside mount() (persists for every board mounted after)");
}

group("17 — REGRESSION: the tabletop's own shadowMap-off restore (U3, unchanged) still stands");
{
  ok(/if\(S\.renderer\) S\.renderer\.shadowMap\.enabled = false;/.test(bootSrc),
    "setBoard still restores renderer.shadowMap.enabled=false whenever a combat/tabletop board mounts");
  const onCount = (bootSrc.match(/S\.renderer\.shadowMap\.enabled = true;/g) || []).length;
  ok(onCount === 1, `shadow-mapping is turned ON in exactly one place (setInteriorBoard) — found ${onCount}`);
}

group("18 — GR4/GR3 wiring: skirt InstancedMesh + kit-graded void/fog backdrop in setInteriorBoard");
{
  ok(/interiorBuildInstancedMesh\(data\.skirt, cx, cz, null, variant, "skirt"\)/.test(bootSrc),
    "setInteriorBoard builds a skirt InstancedMesh off data.skirt");
  ok(/gradeColorLocal\(\s*\n?\s*\(data\.fog && data\.fog\.color\) \? hexStrToNum\(data\.fog\.color\) : voidTintFor\(env\),/.test(bootSrc),
    "setInteriorBoard grades its void/fog backdrop color through gradeColorLocal (routes voidTintFor through the kit grade)");
  ok(/const fogWhisper = \(typeof kit\.fogWhisper === "number"/.test(bootSrc),
    "setInteriorBoard's fog-density default reads kit.fogWhisper (not the old ad-hoc 0.05 literal)");
  ok(!/\(data\.fog && data\.fog\.density\) \|\| 0\.05/.test(bootSrc),
    "the old ad-hoc `(data.fog && data.fog.density) || 0.05` fog-density default is gone");
}

group("19 — GR3 grade data: all 12 realms carry {tint,strength<=0.15,fogWhisper}; only gloom whispers");
{
  const realmIds = Object.keys(M.INTERIOR_TILE_KITS);
  ok(realmIds.length === 12, `INTERIOR_TILE_KITS carries all 12 realms — found ${realmIds.length}`);
  let whisperRealms = [];
  realmIds.forEach((realmId) => {
    const kit = M.INTERIOR_TILE_KITS[realmId];
    const grade = kit && kit.grade;
    ok(grade && typeof grade.tint === "string" && typeof grade.strength === "number" && typeof grade.fogWhisper === "number",
      `realm "${realmId}" kit carries a full grade {tint,strength,fogWhisper}`);
    ok(grade && grade.strength >= 0 && grade.strength <= 0.15,
      `realm "${realmId}" grade.strength (${grade && grade.strength}) stays within [0, 0.15] (GR3 acceptance bound)`);
    if (grade && grade.fogWhisper > 0) whisperRealms.push(realmId);
    // interiorBuildBoard's own tileKit output threads these three fields through verbatim off a real
    // built board (never just reading the raw kit table) — proves the wiring, not just the source data.
    const fixture = buildChainFixture(3);
    const plan = M.semanticizePlan(M.spatializePlan(fixture, { seed: fixtureHash(realmId) }));
    const board = M.interiorBuildBoard(plan, { realmId });
    ok(board.tileKit.gradeTint === grade.tint && board.tileKit.gradeStrength === grade.strength && board.tileKit.fogWhisper === grade.fogWhisper,
      `realm "${realmId}": interiorBuildBoard's tileKit.{gradeTint,gradeStrength,fogWhisper} match the kit's own grade verbatim`);
  });
  ok(whisperRealms.length === 1 && whisperRealms[0] === "gloom",
    `exactly gloom keeps a nonzero fogWhisper (others 0) — found [${whisperRealms.join(", ")}]`);
}

group("20 — GR4 skirt data: rings the full board-bounds perimeter, sits below y=-0.5");
{
  [3, 8, 20].forEach((n) => {
    const fixture = buildChainFixture(n);
    const plan = M.semanticizePlan(M.spatializePlan(fixture, { seed: fixtureHash("skirt:" + n) }));
    const board = M.interiorBuildBoard(plan, { realmId: "gloom" });
    const b = board.bounds;
    const w = b.maxX - b.minX + 1, d = b.maxZ - b.minZ + 1;
    const expected = (w <= 1 || d <= 1) ? Math.max(0, w * d) : (2 * w + 2 * d - 4);
    ok(board.skirt.length === expected,
      `n=${n} plan: skirt count (${board.skirt.length}) matches the board-bounds perimeter formula (expected ${expected}, bounds ${w}x${d})`);
    ok(board.meta.skirtCount === board.skirt.length, `n=${n} plan: meta.skirtCount matches skirt.length`);
    // independent check: every skirt cell sits on the bounds' own outer ring (never an interior cell).
    const offRing = board.skirt.filter((s) => s.x !== b.minX && s.x !== b.maxX && s.z !== b.minZ && s.z !== b.maxZ);
    ok(offRing.length === 0, `n=${n} plan: every skirt instance sits on the bounds' outer ring (0 interior leaks, found ${offRing.length})`);
    // the SAME y-formula theater-boot.js's interiorBuildInstancedMesh applies for shadowKind==="skirt"
    // (y = -0.5 - sy/2) — computed independently here, off the plain data shape, never trusting a GL
    // render to prove it.
    const belowFloor = board.skirt.every((s) => (-0.5 - (s.sy || 1) / 2) < -0.5);
    ok(belowFloor, `n=${n} plan: every skirt instance's own GL-formula y sits strictly below the shared y=-0.5 floor plane`);
    ok(board.skirt.every((s) => s.sy === 0.4), `n=${n} plan: every skirt instance carries the GR4 0.4-cell depth`);
  });
}

group("21 — determinism: same (plan,opts) twice -> skirt array byte-identical (extends checks 7/10)");
{
  const fixture = buildChainFixture(12);
  const plan1 = M.semanticizePlan(M.spatializePlan(fixture, { seed: 424242 }));
  const plan2 = M.semanticizePlan(M.spatializePlan(fixture, { seed: 424242 }));
  const boardA = M.interiorBuildBoard(plan1, { realmId: "ash" });
  const boardB = M.interiorBuildBoard(plan2, { realmId: "ash" });
  ok(JSON.stringify(boardA.skirt) === JSON.stringify(boardB.skirt), "skirt array is byte-identical across two independent builds of the same (plan,opts)");
  ok(boardA.skirt.length > 0, "the fixture actually produced skirt instances (a non-vacuous determinism check)");
}

// ============================================================================
// BEAUTY-WAVE.md VP1 — checks 22-27 (the kaiju-scale-bug fix). theater-boot.js is the sealed
// ES-module boundary file (bare `import * as THREE`), so these run through the SAME process-isolated
// jsdom+vendored-three subprocess pattern dev/verify-theater-sprites.mjs established (its header
// comment: loadWholeObjectBuilders' async completion callback races a shared `global.window` across
// sequential in-process loads — each scenario gets its own subprocess).
// ============================================================================
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");

function ensureThreeShim(){
  const base = join(ROOT, "node_modules", "three");
  const loaderDir = join(base, "addons", "loaders");
  // BEAUTY-WAVE-3 BW3-0 (THE COMPOSER SEAM) — same shim-completeness fix as dev/verify-theater-
  // sprites.mjs's own ensureThreeShim: theater-boot.js now also imports EffectComposer/RenderPass/
  // ShaderPass from "three/addons/postprocessing/", which the ORIGINAL early-return (`if package.json
  // exists, return`) would never add on an environment whose shim predates this unit. A version
  // marker file forces a re-write when the shim's own contents are stale, instead of trusting
  // package.json's mere existence as "already complete."
  const postDir = join(base, "addons", "postprocessing");
  const shimVersion = "bw3-0-postprocessing";
  const versionFile = join(base, ".shim-version");
  if(existsSync(join(base, "package.json")) && existsSync(versionFile) && readFileSync(versionFile, "utf-8").trim() === shimVersion) return;
  mkdirSync(loaderDir, { recursive: true });
  mkdirSync(postDir, { recursive: true });
  writeFileSync(join(base, "package.json"),
    JSON.stringify({ name: "three", version: "0.0.0-vendor-shim", type: "module", main: "./three.module.js" }, null, 2));
  writeFileSync(join(base, "three.module.js"), `export * from "../../vendor/three/three.module.js";\n`);
  writeFileSync(join(loaderDir, "GLTFLoader.js"), `export * from "../../../../vendor/three/addons/loaders/GLTFLoader.js";\n`);
  writeFileSync(join(postDir, "EffectComposer.js"), `export * from "../../../../vendor/three/addons/postprocessing/EffectComposer.js";\n`);
  writeFileSync(join(postDir, "RenderPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/RenderPass.js";\n`);
  writeFileSync(join(postDir, "ShaderPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/ShaderPass.js";\n`);
  writeFileSync(versionFile, shimVersion + "\n");
}

function ensureJsdomShim(){
  const target = join(ROOT, "node_modules", "jsdom");
  if(existsSync(join(target, "package.json")) || existsSync(target)) return;
  const real = join(JSDOM_HOME, "node_modules", "jsdom");
  if(!existsSync(join(real, "package.json"))){
    throw new Error(`jsdom not found at ${real} — run "npm i jsdom" in ${JSDOM_HOME} first (CLAUDE.md convention)`);
  }
  mkdirSync(join(ROOT, "node_modules"), { recursive: true });
  try {
    symlinkSync(real, target, "dir");
  } catch(e){
    mkdirSync(target, { recursive: true });
    const pkg = JSON.parse(readFileSync(join(real, "package.json"), "utf-8"));
    writeFileSync(join(target, "package.json"),
      JSON.stringify(Object.assign({}, pkg, { main: join(real, pkg.main || "lib/api.js") }), null, 2));
  }
}

ensureThreeShim();
ensureJsdomShim();

// VP1 fixture registry — cut, TRUE-SCALE entries. `medium`/`large` carry entry.scaleTrue (the
// registry fold this unit adds); `knight` carries NO scaleTrue (simulating a piece the fold hasn't
// reached yet) and instead relies on a piece-level scaleVsHuman override, same as combat-foe pieces
// already pass today; `floored` carries a nonzero entry.floor; `oversize` carries a huge scaleTrue to
// exercise the wall-height clamp. `scaledMedium` mirrors the REAL overlay convention (scale:1.5, seen
// on live registry entries) — used only by the OLD-source RED-FIRST run below, via the EXISTING
// refFigure.build seam (byte-identical to what interiorBuildPieces called before this unit's fix).
const VP1_REGISTRY = {
  "spr-gloom-medium-thing": { realm: "gloom", kind: "monster", name: "Medium Thing", size: "Medium", status: "cut", scaleTrue: 1.0 },
  "spr-gloom-large-thing": { realm: "gloom", kind: "monster", name: "Large Thing", size: "Large", status: "cut", scaleTrue: 2.0 },
  "spr-gloom-knight": { realm: "gloom", kind: "npc", name: "Knight", size: "Medium", status: "cut" },
  "spr-gloom-floored-thing": { realm: "gloom", kind: "monster", name: "Floored Thing", size: "Medium", status: "cut", scaleTrue: 1.0, floor: 0.1 },
  "spr-gloom-titan-thing": { realm: "gloom", kind: "monster", name: "Titan Thing", size: "Gargantuan", status: "cut", scaleTrue: 100.0 },
  "spr-gloom-scaled-medium": { realm: "gloom", kind: "monster", name: "Scaled Medium", size: "Medium", status: "cut", scale: 1.5 },
};

const NEW_RUNNER_SRC = `
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";

const bootPath = process.argv[2];
const registry = JSON.parse(process.argv[3]);
const wallHeightBase = Number(process.argv[4]);

const dom = new JSDOM(
  \`<!doctype html><html><body><div id="stage" style="width:400px;height:300px"></div></body></html>\`,
  { runScripts: "dangerously", url: "http://localhost/" }
);
global.window = dom.window;
global.document = dom.window.document;
global.SPRITE_REGISTRY = registry;
global.window.SPRITE_REGISTRY = registry;

function fakeTexture(){ return { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true, image: { width: 100, height: 200 } }; }

const warnings = [];
const origWarn = console.warn;
console.warn = function(...args){ warnings.push(args.map(String).join(" ")); origWarn.apply(console, args); };

const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;
  for(const slug of Object.keys(registry)) T._spriteTextureCache[slug] = fakeTexture();

  const pieces = [
    { slug: "medium-thing", cellX: 0, cellY: 0 },
    { slug: "large-thing", cellX: 0, cellY: 0 },
    { slug: "knight", cellX: 0, cellY: 0, scaleVsHuman: 1.0 },
    { slug: "floored-thing", cellX: 2, cellY: 3 },
    { slug: "titan-thing", cellX: 0, cellY: 0 },
  ];
  const built = T._interiorBuildPiecesForTest(pieces, 0, 0, wallHeightBase);
  result.resolvedCount = built.resolved;
  result.requestedCount = built.requested;
  const g = built.group.children; // same order as the pieces array (forEach preserves order)
  // BW2-2b: children[0] is now each piece's own inner camera-tilt wrap (buildSpriteBillboardMesh's own
  // header), not the mesh directly — reach the mesh via the stable userData handle.
  result.medHeight = g[0] && g[0].userData.spriteBillboardMesh.geometry.parameters.height;
  result.medWidth = g[0] && g[0].userData.spriteBillboardMesh.geometry.parameters.width;
  result.largeHeight = g[1] && g[1].userData.spriteBillboardMesh.geometry.parameters.height;
  result.knightHeight = g[2] && g[2].userData.spriteBillboardMesh.geometry.parameters.height;
  result.flooredHeight = g[3] && g[3].userData.spriteBillboardMesh.geometry.parameters.height;
  result.flooredY = g[3] && g[3].position.y;
  result.flooredX = g[3] && g[3].position.x;
  result.flooredZ = g[3] && g[3].position.z;
  // BW2-2b item 4 (THE KILTER): independent re-derivation of the SAME seed key interiorBuildPieces
  // uses (slug+cell) — flooredX/Z above now carry a tiny seeded offset on top of the raw cell coords,
  // never an exact integer match anymore.
  result.flooredKilter = T._kilterForTest("floored-thing:2,3");
  result.titanHeight = g[4] && g[4].userData.spriteBillboardMesh.geometry.parameters.height;
  // BW2-2: independent-recompute material for check 25 below — the raw FLOOR CONTACT LAW constants
  // (never the law's own functions, so the outer assertion isn't just re-running the code under test).
  result.floorContactLaw = Object.assign({}, T._floorContactLawForTest);
  delete result.floorContactLaw.interiorFloorTopMapFrom; // functions don't JSON-serialize meaningfully — drop, the outer test only wants the numeric constants
  delete result.floorContactLaw.interiorFloorTopAt;
  delete result.floorContactLaw.interiorStandeeContactY;
  // BW2-2: standee base mesh — children[1] of the piece group (children[0] is now the sprite's own
  // inner camera-tilt wrap, BW2-2b — the base is still APPENDED as a plain sibling, never inserted
  // into the wrap, so the index is unchanged).
  result.medBaseRadius = g[0] && g[0].children[1] && g[0].children[1].geometry.parameters.radiusTop;
  result.medBaseHeight = g[0] && g[0].children[1] && g[0].children[1].geometry.parameters.height;

  result.oversizeWarned = warnings.some((w) => w.includes("qa: oversize-clamped"));
  result.ok = true;
} catch(e){
  result.error = String((e && e.stack) || e);
}
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

const OLD_RUNNER_SRC = `
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";

const bootPath = process.argv[2];
const registry = JSON.parse(process.argv[3]);

const dom = new JSDOM(
  \`<!doctype html><html><body><div id="stage" style="width:400px;height:300px"></div></body></html>\`,
  { runScripts: "dangerously", url: "http://localhost/" }
);
global.window = dom.window;
global.document = dom.window.document;
global.SPRITE_REGISTRY = registry;
global.window.SPRITE_REGISTRY = registry;

function fakeTexture(){ return { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true }; }

const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;
  T._spriteTextureCache["spr-gloom-scaled-medium"] = fakeTexture();
  // OLD interiorBuildPieces delegated STRAIGHT to buildSpriteBillboard (the tabletop render-height-
  // multiplier convention) — refFigure.build's sprite branch calls the exact same function, so this
  // is a byte-identical stand-in for "what interiorBuildPieces built before this unit's fix" without
  // needing interiorBuildPieces itself to exist on the pre-fix source (it doesn't take a
  // wallHeightBase param pre-fix, and had no test seam at all).
  const fig = T.refFigure.build({ recipeSlug: "scaled-medium" });
  result.medHeight = fig && fig.children[0] && fig.children[0].geometry.parameters.height;
  result.ok = true;
} catch(e){
  result.error = String((e && e.stack) || e);
}
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

function runVP1Scenario(bootSourceText, runnerSrc, extraArgs){
  const tag = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const bootPath = join(ROOT, "src", "ui", `.verify-vp1-boot-${tag}.mjs`);
  const runnerPath = join(ROOT, "dev", `.verify-vp1-runner-${tag}.mjs`);
  writeFileSync(bootPath, bootSourceText);
  writeFileSync(runnerPath, runnerSrc);
  try {
    const out = execFileSync("node", [runnerPath, bootPath, JSON.stringify(VP1_REGISTRY), ...extraArgs], {
      cwd: ROOT, encoding: "utf-8", timeout: 30000,
    });
    const lastLine = out.trim().split("\n").pop();
    return JSON.parse(lastLine);
  } finally {
    rmSync(bootPath, { force: true });
    rmSync(runnerPath, { force: true });
  }
}

group("22 — RED-FIRST: pre-fix theater-boot.js (merge-base with master, before this unit's edits) built a medium piece's tabletop billboard WELL over 2 world units");
{
  // The pre-fix source is PINNED to the last master tip before VP1 landed (63d3073). A derived
  // ref (bare HEAD, or merge-base with master) self-invalidates the moment the unit merges INTO
  // master — merge-base then resolves to a post-fix commit and the sanity check below reds
  // (caught live at the 2026-07-10 VP0+VP1 integration gate). A red-first proof is historical
  // by nature; the pin is the honest fixture.
  const preFixRef = "63d3073";
  const OLD_SOURCE = execFileSync("git", ["show", `${preFixRef}:src/ui/theater-boot.js`], { cwd: ROOT, encoding: "utf-8" });
  ok(!OLD_SOURCE.includes("_interiorBuildPiecesForTest"), `sanity: the pre-fix tip (${preFixRef}) theater-boot.js predates this unit's test seam (proves this is really the pre-fix source, not an accidental re-read of the working tree)`);
  const red = runVP1Scenario(OLD_SOURCE, OLD_RUNNER_SRC, []);
  if(!red.ok){
    fail++; console.error("  FAIL: pre-fix scenario threw: " + red.error);
  } else {
    console.log(`  pre-fix medium+scale1.5 tabletop billboard height = ${red.medHeight} world units (spriteSizeScaleFor("medium")=1 x GLB_TARGET_HEIGHT=1.5 x calib=1.5 = 2.25)`);
    ok(red.medHeight > 2, `RED-FIRST proven: pre-fix height (${red.medHeight}) > 2 world units for a MEDIUM creature standing in a room where 1 unit = 5ft (the bug)`);
  }
}

group("23 — FIXED: interiorBuildPieces sizes through TRUE-SCALE (HUMAN_TRUE_HEIGHT x scaleTrue), not the tabletop convention");
{
  const REAL_SOURCE = read("src/ui/theater-boot.js");
  const green = runVP1Scenario(REAL_SOURCE, NEW_RUNNER_SRC, ["2.4"]);
  if(!green.ok){
    fail++; console.error("  FAIL: fixed-source scenario threw: " + green.error);
  } else {
    ok(green.resolvedCount === 5 && green.requestedCount === 5, `all 5 VP1 fixture pieces resolved through the fixed interiorBuildPieces (resolved=${green.resolvedCount} requested=${green.requestedCount})`);
    ok(green.medHeight >= 1.05 && green.medHeight <= 1.15, `medium (scaleTrue=1.0) height ${green.medHeight} in [1.05, 1.15]`);
    ok(green.largeHeight >= 2.0 && green.largeHeight <= 2.4, `large (scaleTrue=2.0) height ${green.largeHeight} in [2.0, 2.4]`);
    ok(green.knightHeight <= 1.3, `loop-gate knight (piece-level scaleVsHuman override, no registry scaleTrue) height ${green.knightHeight} <= 1.3`);

    group("25 — BW2-2 FLOOR CONTACT LAW: ground-contact line (not raw image-bottom) sits on the cell's own derived floor top + its plinth base, never the pre-BW2-2 hardcoded y=-0.5");
    // independent recompute off the raw exposed constants (never the law's own functions) — this test
    // seam call passes no floorTopMap, so every cell falls back to ITR_FLOOR_BASE_Y+ITR_FLOOR_HEIGHT_FALLBACK.
    const law = green.floorContactLaw;
    ok(law && typeof law.ITR_FLOOR_BASE_Y === "number" && typeof law.INTERIOR_BASE_HEIGHT === "number",
      "the floor-contact-law constants are exposed on window.Theater._floorContactLawForTest");
    const fallbackFloorTop = law.ITR_FLOOR_BASE_Y + law.ITR_FLOOR_HEIGHT_FALLBACK;
    const contactY = fallbackFloorTop + law.INTERIOR_BASE_Y_OFFSET + law.INTERIOR_BASE_HEIGHT;
    const expectedY = contactY - 0.1 * green.flooredHeight;
    ok(Math.abs(green.flooredY - expectedY) < 1e-9,
      `floored piece (entry.floor=0.1, height=${green.flooredHeight}): group.position.y=${green.flooredY} matches (floorTop=${fallbackFloorTop} + baseOffset+baseHeight) - floor*height = ${expectedY}`);
    ok(expectedY > -0.5, `RED-FIRST proof: the new contact line (${expectedY}) sits ABOVE the pre-BW2-2 hardcoded -0.5 — the old convention buried every standee by (fallback-derivation) ${(expectedY - (-0.5 - 0.1 * green.flooredHeight)).toFixed(3)} world units`);
    // BW2-2b item 4 (THE KILTER): the origin-shifted cellX/cellY placement now carries a tiny seeded
    // offset on top of the raw integer cell coords — assert against the INDEPENDENTLY re-derived
    // kilter for this exact seed key, not a bare integer equality.
    const fk = green.flooredKilter || { dx: 0, dz: 0 };
    ok(Math.abs(green.flooredX - (2 + fk.dx)) < 1e-9 && Math.abs(green.flooredZ - (3 + fk.dz)) < 1e-9,
      `floored piece keeps the origin-shifted cellX/cellY placement plus its own seeded kilter offset (x=${green.flooredX} z=${green.flooredZ}, expected 2+${fk.dx}=${2+fk.dx} / 3+${fk.dz}=${3+fk.dz})`);
    ok(Math.abs(green.flooredX - 2) <= 0.06 + 1e-9 && Math.abs(green.flooredZ - 3) <= 0.06 + 1e-9,
      `the kilter offset itself stays within the spec's <=6% of a cell bound (dx=${(green.flooredX-2).toFixed(4)}, dz=${(green.flooredZ-3).toFixed(4)})`);

    group("25b — BW2-2b STANDEE BASES: a plinth cylinder under every piece, radius 0.42x rendered width, height ~0.09 (bumped from BW2-2's 0.04)");
    ok(Math.abs(green.medBaseHeight - 0.09) < 1e-9, `medium piece's base cylinder height ${green.medBaseHeight} === BW2-2b's INTERIOR_BASE_HEIGHT (~0.09)`);
    const expectedBaseRadius = green.medWidth * 0.42;
    ok(Math.abs(green.medBaseRadius - expectedBaseRadius) < 1e-9,
      `medium piece's base cylinder radius ${green.medBaseRadius} === rendered width (${green.medWidth}) x 0.42 = ${expectedBaseRadius}`);

    group("26 — oversize clamp: wallHeightBase*0.95 cap + qa:oversize-clamped console.warn");
    ok(Math.abs(green.titanHeight - 2.4 * 0.95) < 1e-9, `titan (scaleTrue=100) clamps to wallHeightBase(2.4)*0.95=${2.4 * 0.95} (got ${green.titanHeight})`);
    ok(green.oversizeWarned === true, "console.warn fired with the qa:oversize-clamped tag");
  }
}

group("27 — registry fold: data/sprite-registry.js emits feet/scaleTrue for >= 800 cut slugs (+ mutation: stubbing the fold reds this count)");
{
  const registrySrc = read("data/sprite-registry.js");
  const scaleTrueCount = (registrySrc.match(/scaleTrue:/g) || []).length;
  ok(scaleTrueCount >= 800, `data/sprite-registry.js carries scaleTrue on >= 800 cut slugs (found ${scaleTrueCount})`);

  // MUTATION: stub build/gen-sprite-registry.py's sizing_for() to always return null (the fold
  // "turned off"), regenerate into a scratch --out file, and prove the count check REDS — then
  // discard the scratch file (the real data/sprite-registry.js on disk is never touched by this
  // block; --out points at a throwaway path the whole time).
  const genSrc = read("build/gen-sprite-registry.py");
  const STUB_MARK = "def sizing_for(slug, sheet, cell, corpus_sizing, v3_by_sheet_cell):";
  ok(genSrc.includes(STUB_MARK), "sanity: sizing_for() found verbatim in build/gen-sprite-registry.py — can stub it");
  const stubbedSrc = genSrc.replace(
    STUB_MARK,
    STUB_MARK + "\n    return None  # MUTATION STUB (verify-dungeon-interior.mjs check 27) — fold disabled"
  );
  // NOTE: gen-sprite-registry.py derives ROOT as dirname(dirname(__file__)) — the stubbed copy must
  // sit AT THE SAME DEPTH as the real build/gen-sprite-registry.py (directly in build/, not a
  // subdirectory of it) or its own ROOT resolves one level too deep.
  const tag = `.vp1-mutation-${process.pid}-${Date.now()}`;
  const stubbedGenPath = join(ROOT, "build", `gen-sprite-registry-stubbed-${tag}.py`);
  const scratchOut = join(ROOT, "build", `sprite-registry-scratch-${tag}.js`);
  writeFileSync(stubbedGenPath, stubbedSrc);
  try {
    execFileSync("python3", [stubbedGenPath, "--manifest", "dev/sprite-manifests/v2-manifest.json", "--out", scratchOut], { cwd: ROOT, encoding: "utf-8" });
    const scratchSrc = readFileSync(scratchOut, "utf-8");
    const scratchCount = (scratchSrc.match(/scaleTrue:/g) || []).length;
    ok(scratchCount === 0, `MUTATION: with sizing_for() stubbed to always return null, the regenerated registry carries scaleTrue on 0 slugs (found ${scratchCount}) — the count->=800 check would RED against this output`);
    ok(scaleTrueCount >= 800 && scratchCount === 0, "the real (unstubbed) registry stays green while the stubbed mutant reds — the check is load-bearing");
  } finally {
    rmSync(stubbedGenPath, { force: true });
    rmSync(scratchOut, { force: true });
  }
}

// BEAUTY-WAVE.md VP1b ADDITIONS (checks 28-31 below) — the combat-standee kaiju-scale defect: VP1
// (checks 22-27 above) fixed interiorBuildPieces (non-combat pieces) ONLY; combat units mount through
// a completely different path (setUnits -> figureFor's sprite branch -> buildSpriteBillboard, the
// tabletop render-height-multiplier convention) that VP1 never touched, so a combat foe standing in a
// dungeon room still built kaiju-scaled (dev/battle-gate/dungeon-loop/contact-sheet.png loops 04/05).
// RED-FIRST (checked 2026-07-10 against tip ce609da, the last master tip before this unit's fix — the
// SAME PINNED-ref discipline check 22 uses and for the identical reason: a derived ref self-invalidates
// the moment this unit merges into master): `git show ce609da:src/ui/theater-boot.js | grep -c
// interiorTrueScale` is 0 — figureFor had no interior-aware branch at all, so ANY combat sprite figure,
// on ANY board (flat tabletop or interior3d alike), always built through the tabletop convention.
// Checks 28-31:
//   28. RED-FIRST — pre-fix (ce609da) figureFor (exercised via the EXISTING refFigure.build test seam,
//       the same entry point setUnits' figureFor call routes every combat unit through) builds a
//       medium/scale-1.5 combat foe's sprite standee to 2.25 world units regardless of any
//       interior-intent flag passed in (the flag doesn't exist pre-fix) — provably > 2 world units in
//       a room where 1 unit = 5ft.
//   29. FIXED — figureFor's interior branch (refFigure.build({..., interiorMode:true})) sizes THROUGH
//       interiorSpriteBillboard (HUMAN_TRUE_HEIGHT x scaleTrue) same as VP1's non-combat pieces:
//       medium (no scaleTrue/scaleVsHuman -> default 1.0) in [1.05,1.15]; large (scaleTrue=2.0) in
//       [2.0,2.4]; an oversize figure clamps to wallHeightCap.
//   30. REGRESSION — the SAME recipeSlug through figureFor with interiorMode OMITTED (the flat
//       TABLETOP combat path) stays BYTE-IDENTICAL to the pre-fix height (2.25) — untouched, per this
//       unit's own OUT-OF-SCOPE line.
//   31. WIRING text-scan — setUnits derives interiorMode from the SAME `S.lastBoard.kind ===
//       "interior3d"` discriminator setInteriorBoard/setBoard already establish, threads it (+
//       wallHeightCap) into its figureFor call, and the interiorSpriteFig branch sets figScale=1 (never
//       re-applying FIGURE_SCALE x sizeScaleFor on top of an already-world-unit-baked plane — the
//       double-scale reproduction of the same kaiju bug one line later).
const VP1B_RUNNER_SRC = `
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";

const bootPath = process.argv[2];
const registry = JSON.parse(process.argv[3]);
const scenarios = JSON.parse(process.argv[4]); // [{recipeSlug, interiorMode, wallHeightCap}]

const dom = new JSDOM(
  \`<!doctype html><html><body><div id="stage" style="width:400px;height:300px"></div></body></html>\`,
  { runScripts: "dangerously", url: "http://localhost/" }
);
global.window = dom.window;
global.document = dom.window.document;
global.SPRITE_REGISTRY = registry;
global.window.SPRITE_REGISTRY = registry;

function fakeTexture(){ return { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true, image: { width: 100, height: 200 } }; }

const result = { ok: false, error: null, heights: [] };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;
  for(const slug of Object.keys(registry)) T._spriteTextureCache[slug] = fakeTexture();
  for(const s of scenarios){
    const fig = T.refFigure.build({ recipeSlug: s.recipeSlug, interiorMode: s.interiorMode, wallHeightCap: s.wallHeightCap });
    // BW2-2b wraps the sprite mesh in its own inner camera-tilt group (children[0] on current source);
    // the stable userData handle works identically against BOTH the current source and the pre-VP1b
    // historical source this same runner also drives (RED-FIRST, below) — that source already tagged
    // userData.spriteBillboardMesh too (VP1's own convention), just with no wrap around it yet.
    const mesh = fig && (fig.userData.spriteBillboardMesh || fig.children[0]);
    const h = mesh && mesh.geometry.parameters.height;
    result.heights.push(h);
  }
  result.ok = true;
} catch(e){
  result.error = String((e && e.stack) || e);
}
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

function runVP1bScenario(bootSourceText, scenarios){
  const tag = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const bootPath = join(ROOT, "src", "ui", `.verify-vp1b-boot-${tag}.mjs`);
  const runnerPath = join(ROOT, "dev", `.verify-vp1b-runner-${tag}.mjs`);
  writeFileSync(bootPath, bootSourceText);
  writeFileSync(runnerPath, VP1B_RUNNER_SRC);
  try {
    const out = execFileSync("node", [runnerPath, bootPath, JSON.stringify(VP1_REGISTRY), JSON.stringify(scenarios)], {
      cwd: ROOT, encoding: "utf-8", timeout: 30000,
    });
    const lastLine = out.trim().split("\n").pop();
    return JSON.parse(lastLine);
  } finally {
    rmSync(bootPath, { force: true });
    rmSync(runnerPath, { force: true });
  }
}

group("28 — RED-FIRST: pre-fix theater-boot.js (pinned ce609da, the last master tip before VP1b) builds a combat-foe sprite standee kaiju-scaled regardless of interior intent");
{
  const preFixRef = "ce609da";
  const OLD_SOURCE = execFileSync("git", ["show", `${preFixRef}:src/ui/theater-boot.js`], { cwd: ROOT, encoding: "utf-8" });
  ok(!OLD_SOURCE.includes("interiorTrueScale"), `sanity: the pre-fix tip (${preFixRef}) theater-boot.js predates this unit's interior-aware figureFor branch (proves this is really the pre-fix source)`);
  const red = runVP1bScenario(OLD_SOURCE, [{ recipeSlug: "Scaled Medium", interiorMode: true, wallHeightCap: 2.4 }]);
  if(!red.ok){
    fail++; console.error("  FAIL: pre-fix scenario threw: " + red.error);
  } else {
    console.log(`  pre-fix combat-foe standee height (interiorMode requested but not honored pre-fix) = ${red.heights[0]} world units`);
    ok(red.heights[0] > 2, `RED-FIRST proven: pre-fix height (${red.heights[0]}) > 2 world units for a medium combat foe standing in a room where 1 unit = 5ft (the bug — VP1 never touched this path)`);
  }
}

group("29 — FIXED: figureFor's interior branch sizes a combat-foe standee THROUGH interiorSpriteBillboard (TRUE-SCALE), reusing VP1's own math");
{
  const REAL_SOURCE = read("src/ui/theater-boot.js");
  const green = runVP1bScenario(REAL_SOURCE, [
    { recipeSlug: "Scaled Medium", interiorMode: true, wallHeightCap: 2.4 },
    { recipeSlug: "Large Thing", interiorMode: true, wallHeightCap: 2.4 },
    { recipeSlug: "Titan Thing", interiorMode: true, wallHeightCap: 2.4 },
  ]);
  if(!green.ok){
    fail++; console.error("  FAIL: fixed-source interior scenario threw: " + green.error);
  } else {
    ok(green.heights[0] >= 1.05 && green.heights[0] <= 1.15, `medium combat foe (no scaleTrue -> default 1.0) interior height ${green.heights[0]} in [1.05, 1.15]`);
    ok(green.heights[1] >= 2.0 && green.heights[1] <= 2.4, `large combat foe (scaleTrue=2.0) interior height ${green.heights[1]} in [2.0, 2.4]`);
    // NOTE: refFigure.build passes wallHeightCap straight to figureFor -> interiorSpriteBillboard,
    // which caps at the value it's GIVEN (the *0.95 shave lives in setUnits, computed once off
    // S.lastBoard.wallHeightBase, before it ever reaches figureFor — check 31's text-scan proves that
    // wiring). This scenario passes 2.4 as the already-shaved cap, so the expected clamp is 2.4 itself.
    ok(Math.abs(green.heights[2] - 2.4) < 1e-9, `oversize combat foe (scaleTrue=100) clamps to the given wallHeightCap=2.4 (got ${green.heights[2]})`);
  }

  group("30 — REGRESSION: the flat TABLETOP combat path (interiorMode omitted) stays byte-identical to the pre-fix height — OUT OF SCOPE line honored");
  const tabletop = runVP1bScenario(REAL_SOURCE, [{ recipeSlug: "Scaled Medium" }]);
  if(!tabletop.ok){
    fail++; console.error("  FAIL: fixed-source tabletop scenario threw: " + tabletop.error);
  } else {
    ok(Math.abs(tabletop.heights[0] - 2.25) < 1e-9, `tabletop combat foe (interiorMode omitted) height ${tabletop.heights[0]} === pre-fix 2.25 (spriteSizeScaleFor("medium")=1 x GLB_TARGET_HEIGHT=1.5 x calib=1.5), UNCHANGED by this unit`);
  }
}

group("31 — WIRING text-scan: setUnits derives interiorMode from S.lastBoard.kind===\"interior3d\", threads it + wallHeightCap into figureFor, and never double-scales the true-scale plane");
{
  const src = read("src/ui/theater-boot.js");
  ok(/const interiorMode = !!\(S\.lastBoard && S\.lastBoard\.kind === "interior3d"\)/.test(src),
    "setUnits computes interiorMode off the SAME discriminator setInteriorBoard/setBoard establish (S.lastBoard.kind)");
  ok(/figureFor\(u\.archetype, seed, tint, u\.silhouette, u\.weapon, u\.recipeSlug, u\.pcRecipe, u\.kind, u\.className, null, interiorMode, wallHeightCap\)/.test(src),
    "setUnits threads interiorMode + wallHeightCap into its figureFor call site");
  ok(/\} else if\(interiorSpriteFig\)\{[\s\S]{0,600}?figScale = 1;/.test(src),
    "the interiorSpriteFig branch sets figScale=1 — no re-applying FIGURE_SCALE x sizeScaleFor on top of the already-world-unit-baked plane (the double-scale reproduction of the kaiju bug)");
}

// ============================================================================
// BEAUTY-WAVE.md VP7 — checks 32-34 (CONTACT GROUNDING; renumbered from 28-30 at the VP1b/VP7 integration merge). Reuses the exact VP1 jsdom+subprocess
// scaffolding above (runVP1Scenario/VP1_REGISTRY/fakeTexture) — the same sealed-ES-module boundary
// applies (theater-boot.js's bare `import * as THREE`).
// ============================================================================
const VP7_RUNNER_SRC = `
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";

const bootPath = process.argv[2];
const registry = JSON.parse(process.argv[3]);
const wallHeightBase = Number(process.argv[4]);

const dom = new JSDOM(
  \`<!doctype html><html><body><div id="stage" style="width:400px;height:300px"></div></body></html>\`,
  { runScripts: "dangerously", url: "http://localhost/" }
);
global.window = dom.window;
global.document = dom.window.document;
global.SPRITE_REGISTRY = registry;
global.window.SPRITE_REGISTRY = registry;

// jsdom ships no canvas 2D backend (no "canvas" npm package installed) — buildDressingCard's
// placeholder texture (dressingPlaceholderTexture) draws to a real 2d context, which this harness
// doesn't need pixel-accurate (it only inspects mesh/group structure, never canvas pixels). Stub a
// minimal no-op 2d context so that draw path runs without throwing.
const FAKE_2D_CTX = {
  fillRect(){}, strokeRect(){}, fillText(){}, measureText(){ return { width: 0 }; },
  fillStyle: "", strokeStyle: "", lineWidth: 0, font: "", textAlign: "", textBaseline: "",
};
global.window.HTMLCanvasElement.prototype.getContext = function(){ return FAKE_2D_CTX; };

function fakeTexture(){ return { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true, image: { width: 100, height: 200 } }; }

const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;
  for(const slug of Object.keys(registry)) T._spriteTextureCache[slug] = fakeTexture();

  const pieces = [
    { slug: "medium-thing", cellX: 0, cellY: 0 },
    { slug: "large-thing", cellX: 1, cellY: 1 },
    { slug: "knight", cellX: 2, cellY: 2, scaleVsHuman: 1.0 },
  ];
  const piecesBuilt = T._interiorBuildPiecesForTest(pieces, 0, 0, wallHeightBase);
  // count 28: blobs live in their OWN sibling sub-group (blobGroup, always the LAST child of
  // piecesBuilt.group — theater-boot.js's interiorBuildPieces adds it once after the forEach),
  // tagged userData.contactBlob — one per piece, no more, no less.
  const blobGroup = piecesBuilt.group.children[piecesBuilt.group.children.length - 1];
  const blobMeshes = blobGroup.children.filter((c) => c.userData && c.userData.contactBlob);
  result.pieceCount = pieces.length;
  result.blobCount = blobMeshes.length;
  result.blobY = blobMeshes[0] && blobMeshes[0].position.y;
  // BW2-2 addendum: the contact blob is now a soft-gradient PlaneGeometry (radius encoded as half its
  // width/height, a square quad), not the old flat CircleGeometry — parameters.radius no longer exists.
  result.blobRadius = blobMeshes[0] && blobMeshes[0].geometry.parameters.width / 2;
  result.floorContactLaw = Object.assign({}, T._floorContactLawForTest);
  delete result.floorContactLaw.interiorFloorTopMapFrom;
  delete result.floorContactLaw.interiorFloorTopAt;
  delete result.floorContactLaw.interiorStandeeContactY;

  const dressing = [
    { slug: "crate", x: 0, y: 0, cardKind: "small" },
    { slug: "shrine", x: 1, y: 1, cardKind: "medium" },
    { slug: "statue", x: 2, y: 2, cardKind: "large" },
  ];
  const dressingBuilt = T._interiorBuildDressingForTest(dressing, 0, 0);
  const dressingBlobGroup = dressingBuilt.children[dressingBuilt.children.length - 1];
  const dressingBlobs = dressingBlobGroup.children.filter((c) => c.userData && c.userData.contactBlob);
  result.dressingCardCount = dressing.length;
  result.dressingBlobCount = dressingBlobs.length; // only the 1 "large" entry should carry a blob

  // fall-death persistence: the blob is a SIBLING of the piece's own group (not a descendant), so
  // tilting the piece's inner wrapper (fall-death's own rotation.x, standee-verbs.js) never moves
  // the blob's world position — assert directly by rotating the piece group as fall-death would
  // and confirming the blob mesh (a different object entirely) is untouched.
  const pieceGroup = piecesBuilt.group.children[0]; // medium-thing's own group
  pieceGroup.rotation.x = 1.2; // simulate fall-death's tip-over
  result.blobYAfterTip = blobMeshes[0] && blobMeshes[0].position.y;

  result.ok = true;
} catch(e){
  result.error = String((e && e.stack) || e);
}
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

group("32 — every interior piece has exactly one contact blob (VP7)");
{
  const REAL_SOURCE = read("src/ui/theater-boot.js");
  const green = runVP1Scenario(REAL_SOURCE, VP7_RUNNER_SRC, ["2.4"]);
  if(!green.ok){
    fail++; console.error("  FAIL: VP7 scenario threw: " + green.error);
  } else {
    ok(green.blobCount === green.pieceCount, `blob count (${green.blobCount}) === piece count (${green.pieceCount}) — exactly one blob per piece`);
    // BW2-2: the pool sits off THIS cell's own real floor top (independent recompute from the raw
    // exposed constants — no floorTopMap passed in this scenario, so every cell falls back), not the
    // pre-BW2-2 hardcoded -0.495.
    const law2 = green.floorContactLaw;
    const expectedBlobY = (law2.ITR_FLOOR_BASE_Y + law2.ITR_FLOOR_HEIGHT_FALLBACK) + law2.INTERIOR_POOL_Y_OFFSET;
    ok(Math.abs(green.blobY - expectedBlobY) < 1e-9, `blob y=${green.blobY} matches the FLOOR CONTACT LAW's derived floor top + pool offset (${expectedBlobY}), not the pre-BW2-2 hardcoded -0.495`);
    ok(green.blobRadius > 0, `blob radius (${green.blobRadius}) derived from the piece's rendered texture width x 0.4 x 1.6 (footprint x feather), positive`);

    group("33 — blob under corpse persists (fall-death tip-over never moves the blob)");
    ok(green.blobYAfterTip === green.blobY, `blob y unchanged after simulated fall-death tip (${green.blobYAfterTip} === ${green.blobY}) — the blob is a sibling of the piece group, not a descendant of its tilting wrapper`);

    group("34 — large dressing cards get a blob, small/medium don't");
    ok(green.dressingCardCount === 3 && green.dressingBlobCount === 1, `3 dressing cards (small/medium/large) mounted, only 1 blob (the large one) — found ${green.dressingBlobCount}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
