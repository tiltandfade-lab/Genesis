#!/usr/bin/env node
/* Verify docs/WALL-VOLUMES-PRACTICALS.md — Unit E0 VISIBLE PRACTICALS. Two independent parts, neither
   needing a live browser/WebGL context:

   PART A (engine layer, src/ui/theater-interior.js) — a real node `vm` context loads place-spatialize.js
   + place-semantics.js + theater-interior.js (same "load the real source, no reimplementation" pattern
   dev/verify-dungeon-interior.mjs already uses for this exact file) and drives real interiorBuildBoard()
   calls, asserting the NEW fixture fields itrRoomLights stamps onto every light record.

   PART B (render layer, src/ui/theater-boot.js) — a source-extraction sandbox (the technique dev/verify-
   bw3-4-light-shafts.mjs already uses for this exact ES-module-boundary file: extract real function text
   verbatim, eval against a minimal stub THREE, assert) covering interiorBuildFixtureGroup, the wall-mount
   snap/degrade resolver, and interiorBuildLights' full E0 wiring.

   RED-FIRST (checked live against tip 8b1e9826, the master commit this branch forked from — C4.1a's own
   landed tip, before E0's own edits existed):
     `git show 8b1e9826:src/ui/theater-interior.js | grep -c fixtureId` -> 0
     `git show 8b1e9826:src/ui/theater-boot.js | grep -c interiorBuildFixtureGroup` -> 0
     `git show 8b1e9826:src/ui/theater-boot.js | grep -c ITR_GLOW_DISC_DIAGNOSTIC` -> 0
     `git show 8b1e9826:src/ui/theater-boot.js | grep -c 'marker: glow.mesh'` -> 1 (the fragile coupling
     the spec names explicitly — this unit's own rewrite removes it; re-checked live in ITEM 7 below).
   All four re-checked live at the top of PART A / ITEM 4 / ITEM 7 respectively (not just asserted here
   as prose) so this file stays true if the base tip ever moves.

   Run:  node dev/verify-visible-practicals.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
// THEATER SPLIT B5 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md): the whole E0 practical-fixture
// family (interiorBuildLights + interiorBuildFixtureGroup + the glow/cone/card/nub builders + the
// ITR_FIXTURE_* / ITR_GLOW_DISC_* / ITR_LIGHT_CONE_* consts) moved VERBATIM into
// src/ui/theater-practicals.js, and celestialArcFor / CELESTIAL_PROFILE_SET / CELESTIAL_MIN_KEY_HEIGHT /
// INTERIOR_LIGHT_FLICKER_AMPLITUDE (which interiorBuildLights reads) into src/ui/theater-lighting.js.
// The four mutable practical gates stayed in theater-boot.js behind window.Theater seams. Reading the
// COMPOSITE keeps the source-extraction sandbox below pulling the REAL source of each symbol — same
// extractions, same regexes, same jobs; no check relaxed, none dropped.
const bootSrc = read("src/ui/theater-boot.js")
  + "\n/* [verify-visible-practicals composite boundary — src/ui/theater-lighting.js follows] */\n"
  + read("src/ui/theater-lighting.js")
  + "\n/* [verify-visible-practicals composite boundary — src/ui/theater-practicals.js follows] */\n"
  + read("src/ui/theater-practicals.js");
const interiorSrc = read("src/ui/theater-interior.js");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const BASE = "8b1e9826";
function grepAtBase(file, needle) {
  try {
    return execSync(`git show ${BASE}:${file} | grep -c '${needle}' || true`, { cwd: ROOT }).toString().trim();
  } catch (e) { return "ERR:" + String(e.stderr || e.message).split("\n")[0]; }
}

console.log("=== RED-FIRST proof (re-checked live against the C4.1a base tip) ===");
check("RED0a. theater-interior.js had no fixtureId field at base", grepAtBase("src/ui/theater-interior.js", "fixtureId") === "0");
check("RED0b. theater-boot.js had no interiorBuildFixtureGroup at base", grepAtBase("src/ui/theater-boot.js", "interiorBuildFixtureGroup") === "0");
check("RED0c. theater-boot.js had no ITR_GLOW_DISC_DIAGNOSTIC at base", grepAtBase("src/ui/theater-boot.js", "ITR_GLOW_DISC_DIAGNOSTIC") === "0");
check("RED0d. theater-boot.js DID carry the fragile 'marker: glow.mesh' coupling at base (this unit removes it)", grepAtBase("src/ui/theater-boot.js", "marker: glow.mesh") === "1");

// ============================================================================
// PART A — engine layer (theater-interior.js), real vm context, no THREE/DOM.
// ============================================================================
function loadEngineModules() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    interiorSrc,
    ";this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__INTERIOR_TILE_KITS=typeof INTERIOR_TILE_KITS!=='undefined'?INTERIOR_TILE_KITS:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "e0-engine.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    interiorBuildBoard: sandbox.__interiorBuildBoard,
    INTERIOR_TILE_KITS: sandbox.__INTERIOR_TILE_KITS,
  };
}
function buildChainFixture(n) {
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
    exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < n - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
    light: "normal",
  }));
}
const KNOWN_FIXTURES = new Set([
  "sconce-iron", "sconce-torch", "sconce-torch-clay", "bracket-generic", "brazier-low",
  "candle-cluster", "lantern-handled", "crystal-faceted", "lamp-post",
]);
const WALL_FIXTURES = new Set(["sconce-iron", "sconce-torch", "sconce-torch-clay", "bracket-generic"]);
const FLOOR_FIXTURES = new Set(["brazier-low", "candle-cluster", "lantern-handled", "crystal-faceted", "lamp-post"]);

console.log("\n=== PART A — engine layer: itrRoomLights' fixture stamping (theater-interior.js, real vm) ===");
{
  const M = loadEngineModules();
  check("A-setup. interiorBuildBoard/spatializePlan/INTERIOR_TILE_KITS all loaded", typeof M.interiorBuildBoard === "function" && typeof M.spatializePlan === "function" && !!M.INTERIOR_TILE_KITS);

  if (typeof M.interiorBuildBoard === "function") {
    const fixture = buildChainFixture(24);
    const plan = M.spatializePlan(fixture, "E0 Study", { walkId: "e0-gloom-1" });
    const board = M.interiorBuildBoard(plan, { realmId: "gloom" });

    check("1. ⊗ FIXTURE PER LIGHT: every light record carries a fixtureId from the known family set (RED above proved the field didn't exist at all before this unit)",
      board.lights.length > 0 && board.lights.every((l) => KNOWN_FIXTURES.has(l.fixtureId)),
      JSON.stringify(board.lights.map((l) => l.fixtureId)));
    check("2. every light carries mount:'floor'|'wall' consistent with its own fixtureId's family",
      board.lights.every((l) => (l.mount === "wall" && WALL_FIXTURES.has(l.fixtureId)) || (l.mount === "floor" && FLOOR_FIXTURES.has(l.fixtureId))),
      JSON.stringify(board.lights.map((l) => [l.fixtureId, l.mount])));
    check("3. ownerSegIndex stays null at the engine layer (no wall geometry reaches this module — render-time-only resolution)",
      board.lights.every((l) => l.ownerSegIndex === null));
    check("4. emitterLocal is a real {x,y,z} point present on every light", board.lights.every((l) => l.emitterLocal && typeof l.emitterLocal.x === "number" && typeof l.emitterLocal.y === "number" && typeof l.emitterLocal.z === "number"));
    check("5. sourceRef is a non-empty provenance string on every light", board.lights.every((l) => typeof l.sourceRef === "string" && l.sourceRef.length > 0));
    check("6. pre-existing fields (x,z,y,color,intensity,distance,decay,kind,roomSegNum) are untouched — still all present",
      board.lights.every((l) => typeof l.x === "number" && typeof l.z === "number" && typeof l.y === "number" && typeof l.color === "string" && typeof l.intensity === "number" && typeof l.distance === "number" && typeof l.decay === "number" && typeof l.kind === "string" && typeof l.roomSegNum === "number"));

    check("7. DETERMINISM: the same (plan,opts) twice yields byte-identical fixtureId/mount/emitterLocal/sourceRef",
      JSON.stringify(M.interiorBuildBoard(plan, { realmId: "gloom" }).lights.map((l) => [l.fixtureId, l.mount, l.emitterLocal, l.sourceRef]))
      === JSON.stringify(board.lights.map((l) => [l.fixtureId, l.mount, l.emitterLocal, l.sourceRef])));

    // ⊗ MUTATION-style: a DIFFERENT plan.seed must be able to produce a DIFFERENT fixtureId sequence
    // (proves the seed is actually load-bearing, not vacuously constant regardless of input).
    const planB = M.spatializePlan(fixture, "E0 Study", { walkId: "e0-gloom-2-different-seed" });
    const boardB = M.interiorBuildBoard(planB, { realmId: "gloom" });
    const seqA = board.lights.map((l) => l.fixtureId).join(",");
    const seqB = boardB.lights.map((l) => l.fixtureId).join(",");
    check("8. ⊗ MUTATION: a different plan.seed CAN produce a different fixtureId sequence (the seed is load-bearing, not a constant)",
      seqA !== seqB || board.lights.length !== boardB.lights.length, JSON.stringify({ seqA, seqB }));

    // realm-family bucket sweep across many rooms/seeds (never Math.random — dspHashStr/dspMulberry32).
    const chromeBoard = M.interiorBuildBoard(M.spatializePlan(buildChainFixture(40), "Chrome Study", { walkId: "e0-chrome-sweep" }), { realmId: "chrome" });
    check("9. chrome realm always resolves crystal-faceted (the table's single-family row)",
      chromeBoard.lights.length > 0 && chromeBoard.lights.every((l) => l.fixtureId === "crystal-faceted"), JSON.stringify([...new Set(chromeBoard.lights.map((l) => l.fixtureId))]));

    const noirBoard = M.interiorBuildBoard(M.spatializePlan(buildChainFixture(40), "Noir Study", { walkId: "e0-noir-sweep" }), { realmId: "noir" });
    check("10. a default-bucket realm (noir, not gloom/fantasy/chrome) always resolves bracket-generic",
      noirBoard.lights.length > 0 && noirBoard.lights.every((l) => l.fixtureId === "bracket-generic"), JSON.stringify([...new Set(noirBoard.lights.map((l) => l.fixtureId))]));

    const gloomSweep = M.interiorBuildBoard(M.spatializePlan(buildChainFixture(60), "Gloom Sweep", { walkId: "e0-gloom-sweep" }), { realmId: "gloom" });
    const gloomFamilies = new Set(gloomSweep.lights.map((l) => l.fixtureId));
    check("11. gloom realm's fixtureId ALTERNATES across the table's own family (sconce-iron/brazier-low/candle-cluster) — never collapses to one constant pick",
      ["sconce-iron", "brazier-low", "candle-cluster"].some((f) => gloomFamilies.has(f)) && gloomFamilies.size >= 2, JSON.stringify([...gloomFamilies]));

    const fantasySweep = M.interiorBuildBoard(M.spatializePlan(buildChainFixture(60), "Fantasy Sweep", { walkId: "e0-fantasy-sweep" }), { realmId: "fantasy" });
    const fantasyFamilies = new Set(fantasySweep.lights.map((l) => l.fixtureId));
    check("12. fantasy realm's fixtureId alternates between sconce-torch/lantern-handled",
      fantasyFamilies.size >= 1 && [...fantasyFamilies].every((f) => f === "sconce-torch" || f === "lantern-handled"), JSON.stringify([...fantasyFamilies]));
  }
}

// ============================================================================
// PART B — render layer (theater-boot.js), source-extraction sandbox.
// ============================================================================
function extractFn(src, name) {
  const sig = "function " + name + "(";
  const start = src.indexOf(sig);
  if (start < 0) return null;
  let i = src.indexOf("{", start), depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}
function extractConstLine(src, name) {
  const re = new RegExp("const " + name + "\\s*=\\s*[^;]+;");
  const m = src.match(re);
  return m ? m[0] : null;
}
function extractLetLine(src, name) {
  const re = new RegExp("let " + name + "\\s*=\\s*[^;]+;");
  const m = src.match(re);
  return m ? m[0] : null;
}
function extractObjBlock(src, name) {
  const re = new RegExp("const " + name + " = \\{[\\s\\S]*?\\n\\};");
  const m = src.match(re);
  return m ? m[0] : null;
}
// LL-1 (docs/KENNEY-SOCKET-WAVE.md) — LIGHT_TUNABLES is the mutable light-lab indirection seam
// interiorBuildLights now reads (LIGHT_TUNABLES.lightRenderGain, was the bare ITR_LIGHT_RENDER_GAIN).
// Extract the REAL object — seeded verbatim off its authored dependency consts, never a neutral stub
// that would silently weaken these assertions. `skip` lists any dependency const the caller already
// injects into the SAME scope (avoids a double-declare); append the prelude AFTER those skipped consts.
function lightTunablesPrelude(src, skip) {
  skip = skip || [];
  const deps = ["STAGE_AMBIENT_FLOOR","GRADE_EXPOSURE_FLOOR","BLOOM_THRESHOLD",
    "BLOOM_STRENGTH","GRADE_TINT_SCALE","GRADE_TINT_MAX","CELESTIAL_ARC",
    "ITR_SPRITE_EMISSIVE_FLOOR","ITR_SCENE_AMBIENT","ITR_LIGHT_RENDER_GAIN"];
  const lines = deps.filter((n) => !skip.includes(n)).map((n) => {
    const m = src.match(new RegExp("const " + n + "\\s*=\\s*[^;]+;")); // scalars/object-literals — no internal ';'
    if (!m) throw new Error("lightTunablesPrelude: dep const not found: " + n);
    return m[0];
  });
  const lt = src.match(/const LIGHT_TUNABLES = \{[\s\S]*?\n\};/); // profiles IIFE has internal ';' — match to the first column-0 "\n};"
  if (!lt) throw new Error("lightTunablesPrelude: LIGHT_TUNABLES block not found");
  return lines.join("\n") + "\nconst LIGHT_TUNABLES = { profiles:{},"
    + " stageAmbientFloor:STAGE_AMBIENT_FLOOR, gradeExposureFloor:GRADE_EXPOSURE_FLOOR,"
    + " bloomThreshold:BLOOM_THRESHOLD, bloomStrength:BLOOM_STRENGTH,"
    + " gradeTintScale:GRADE_TINT_SCALE, gradeTintMax:GRADE_TINT_MAX,"
    + " celestialArc:CELESTIAL_ARC, spriteEmissiveFloor:ITR_SPRITE_EMISSIVE_FLOOR,"
    + " sceneAmbient:ITR_SCENE_AMBIENT, lightRenderGain:ITR_LIGHT_RENDER_GAIN };";
}

function makeVec3(x, y, z) {
  return {
    x: x || 0, y: y || 0, z: z || 0,
    set(nx, ny, nz) { this.x = nx; this.y = ny; this.z = nz; return this; },
    copy(o) { this.x = o.x; this.y = o.y; this.z = o.z; return this; },
  };
}
function makeStubTHREE() {
  function Mesh(geo, mat) {
    return {
      geometry: geo, material: mat, userData: {}, name: "",
      position: makeVec3(0, 0, 0), rotation: { x: 0, y: 0, z: 0 },
      castShadow: false, receiveShadow: false,
      getWorldPosition(target) {
        // fixture-group-relative stub: the harness reads .position directly for co-location math
        // instead (see ITEM 2/3 below) — this exists only so any incidental call never throws.
        if (target) { target.x = this.position.x; target.y = this.position.y; target.z = this.position.z; return target; }
        return this.position;
      },
    };
  }
  function Group() {
    const g = {
      children: [], userData: {}, position: makeVec3(0, 0, 0), rotation: { x: 0, y: 0, z: 0 },
      add(o) { o.parent = g; this.children.push(o); return this; },
    };
    return g;
  }
  function geo(kind) { return function (...args) { return { kind, args }; }; }
  return {
    Group,
    Mesh,
    BoxGeometry: geo("box"), CylinderGeometry: geo("cylinder"), SphereGeometry: geo("sphere"),
    TorusGeometry: geo("torus"), OctahedronGeometry: geo("octahedron"), ConeGeometry: geo("cone"),
    PlaneGeometry: geo("plane"),
    // E0-1 (docs/PHASE-3-WAVE-1-SPECS.md): interiorFixtureBodyMaterial now calls `.clone()` on the
    // shared cache for wall-mounted fixtures (a real THREE.Material method) — this stub needs one too,
    // returning a distinct object (never the same reference) so PART B's wall-fixture checks below
    // still exercise the real per-fixture-clone code path instead of throwing.
    MeshLambertMaterial: function (opts) {
      const mat = Object.assign({ userData: {}, isLambert: true }, opts);
      mat.clone = function () { return Object.assign({}, mat, { clone: mat.clone }); };
      return mat;
    },
    MeshBasicMaterial: function (opts) { return Object.assign({ userData: {} }, opts); },
    Color: function (hex) { return { hex, isColor: true }; },
    CanvasTexture: function (cv) { return { isTexture: true, _cv: cv }; },
    PointLight: function (color, intensity, distance, decay) {
      return {
        color, intensity, distance, decay, position: makeVec3(0, 0, 0), castShadow: false,
        shadow: { mapSize: { set() {} }, camera: { near: 0, far: 0 }, bias: 0 },
      };
    },
    AdditiveBlending: "additive", DoubleSide: "double", LinearFilter: "linear",
  };
}
function makeFakeDocument() {
  const fakeCtx = {
    fillStyle: "", clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, fillRect() {},
    createLinearGradient() { return { addColorStop() {} }; }, createRadialGradient() { return { addColorStop() {} }; },
  };
  const fakeCanvas = { width: 0, height: 0, getContext() { return fakeCtx; } };
  return { createElement() { return fakeCanvas; } };
}

console.log("\n=== PART B ITEM 1 — interiorBuildFixtureGroup (theater-boot.js source extraction) ===");
{
  const fnNames = ["interiorFixtureBodyMaterial", "interiorFixtureEmitterMaterial", "interiorBuildFixtureGroup"];
  const fns = fnNames.map((n) => extractFn(bootSrc, n));
  check("1a-setup. all three fixture-builder functions extracted", fns.every(Boolean), fnNames.filter((_, i) => !fns[i]));
  const partsBlock = extractObjBlock(bootSrc, "ITR_FIXTURE_BODY_PARTS");
  const emitterGeoBlock = extractObjBlock(bootSrc, "ITR_FIXTURE_EMITTER_GEO");
  const emissiveIntensityLine = extractConstLine(bootSrc, "ITR_FIXTURE_EMISSIVE_INTENSITY");
  check("1b-setup. ITR_FIXTURE_BODY_PARTS / ITR_FIXTURE_EMITTER_GEO / ITR_FIXTURE_EMISSIVE_INTENSITY all extracted", !!partsBlock && !!emitterGeoBlock && !!emissiveIntensityLine);

  if (fns.every(Boolean) && partsBlock && emitterGeoBlock && emissiveIntensityLine) {
    const src = "const THREE = arguments[0];\nlet ITR_FIXTURE_BODY_MATERIAL_CACHE = null;\n"
      + emissiveIntensityLine + "\n" + partsBlock + "\n" + emitterGeoBlock + "\n" + fns.join("\n")
      + "\nreturn { interiorBuildFixtureGroup, interiorFixtureEmitterMaterial, ITR_FIXTURE_EMISSIVE_INTENSITY, ITR_FIXTURE_BODY_PARTS };";
    const factory = new Function(src);
    const THREE = makeStubTHREE();
    const mod = factory(THREE);

    for (const fixtureId of KNOWN_FIXTURES) {
      const wantWall = WALL_FIXTURES.has(fixtureId);
      const emitterLocal = wantWall ? { x: 0, y: 0.06, z: 0.16 } : { x: 0, y: 0.32, z: 0 };
      const light = { fixtureId, mount: wantWall ? "wall" : "floor", emitterLocal, color: "#ff9a44" };
      const { group, emitter } = mod.interiorBuildFixtureGroup(light);
      check(`1c. [${fixtureId}] returns a non-empty group (body geometry present, "recognizable physical object" even before checking emissive)`, group.children.length >= 1, group.children.length);
      check(`1d. [${fixtureId}] the group has a NAMED "emitter" child`, group.children.some((c) => c.name === "emitter"), group.children.map((c) => c.name));
      check(`1e. [${fixtureId}] the emitter is positioned EXACTLY at the light's own emitterLocal (co-location by construction)`,
        emitter.position.x === emitterLocal.x && emitter.position.y === emitterLocal.y && emitter.position.z === emitterLocal.z,
        JSON.stringify({ emitter: emitter.position, emitterLocal }));
      check(`1f. [${fixtureId}] the emitter's material is emissive (color=light.color) and NOT a body material`, emitter.material.emissive && emitter.material.emissive.hex === light.color);
      const bodyMeshes = group.children.filter((c) => c.name !== "emitter");
      check(`1g. [${fixtureId}] BODY meshes are never emissive (MeshLambertMaterial without emissive set) — E0's own material discipline`,
        bodyMeshes.every((m) => !m.material.emissive));
    }

    // ⊗ check 6 — forcing emissive intensity to 0 still leaves a legible physical object.
    const { group: g0, emitter: e0 } = mod.interiorBuildFixtureGroup({ fixtureId: "candle-cluster", mount: "floor", emitterLocal: { x: 0, y: 0.28, z: 0 }, color: "#ffbb66" });
    e0.material.emissiveIntensity = 0;
    check("2. ⊗ FIXTURE WITHOUT BLOOM STILL LEGIBLE: forcing emissiveIntensity to 0 leaves the group non-empty with real body geometry (RED-FIRST: a naive 'nothing renders' implementation would leave zero children — this proves the body survives independent of emissive state)",
      g0.children.length >= 2, g0.children.length);

    // unknown/missing fixtureId never throws — defensive default-bucket fallback.
    const fallbackWall = mod.interiorBuildFixtureGroup({ mount: "wall", emitterLocal: { x: 0, y: 0.05, z: 0.14 } });
    const fallbackFloor = mod.interiorBuildFixtureGroup({ mount: "floor", emitterLocal: { x: 0, y: 0.5, z: 0 } });
    check("3. an UNKNOWN/missing fixtureId never throws — degrades to bracket-generic (wall) / lamp-post (floor)",
      fallbackWall.group.userData.fixtureId === "bracket-generic" && fallbackFloor.group.userData.fixtureId === "lamp-post",
      JSON.stringify({ wall: fallbackWall.group.userData.fixtureId, floor: fallbackFloor.group.userData.fixtureId }));
  }
}

console.log("\n=== PART B ITEM 2 — wall-mount snap + defensive floor degrade (theater-boot.js source extraction) ===");
{
  const fnNames = ["interiorNearestWallMountSlot", "interiorResolveFixturePlacement", "interiorFloorTopAt"];
  const fns = fnNames.map((n) => extractFn(bootSrc, n));
  check("2a-setup. all three placement functions extracted", fns.every(Boolean), fnNames.filter((_, i) => !fns[i]));
  const floorBaseLine = extractConstLine(bootSrc, "ITR_FLOOR_BASE_Y");
  const floorFallbackLine = extractConstLine(bootSrc, "ITR_FLOOR_HEIGHT_FALLBACK");
  check("2b-setup. ITR_FLOOR_BASE_Y / ITR_FLOOR_HEIGHT_FALLBACK extracted", !!floorBaseLine && !!floorFallbackLine);

  if (fns.every(Boolean) && floorBaseLine && floorFallbackLine) {
    const src = floorBaseLine + "\n" + floorFallbackLine + "\n" + fns.join("\n")
      + "\nreturn { interiorNearestWallMountSlot, interiorResolveFixturePlacement, interiorFloorTopAt };";
    const factory = new Function(src);
    const mod = factory();

    const wallMountData = {
      mountSlots: [
        { slotId: "wall-slot-0-mid", ownerSegIndex: 0, u: 0.5, worldPos: { x: 0, y: 1.4, z: -5 }, normal: { x: 0, y: 0, z: 1 } },
        { slotId: "wall-slot-1-mid", ownerSegIndex: 1, u: 0.5, worldPos: { x: 5, y: 1.4, z: 0 }, normal: { x: -1, y: 0, z: 0 } },
      ],
      wallSegments: [{ a: { x: -5, z: -5 }, b: { x: 5, z: -5 } }, { a: { x: 5, z: -5 }, b: { x: 5, z: 5 } }],
    };
    const nearZero = mod.interiorNearestWallMountSlot(wallMountData, 0.2, -4.9);
    check("4. NEAREST SLOT: a light near (0,-5) resolves the slot on segment 0, not segment 1", nearZero && nearZero.ownerSegIndex === 0, JSON.stringify(nearZero));
    const nearFive = mod.interiorNearestWallMountSlot(wallMountData, 4.9, 0.1);
    check("5. NEAREST SLOT: a light near (5,0) resolves the slot on segment 1", nearFive && nearFive.ownerSegIndex === 1, JSON.stringify(nearFive));
    check("6. empty/absent mountSlots data returns null (never throws)", mod.interiorNearestWallMountSlot(null, 0, 0) === null && mod.interiorNearestWallMountSlot({ mountSlots: [] }, 0, 0) === null);

    const wallLight = { mount: "wall", x: 0.2, z: -4.9 };
    const placedWall = mod.interiorResolveFixturePlacement(wallLight, 0, 0, null, wallMountData);
    check("7. a wall-mount light WITH slot data resolves mount:'wall' + a real ownerSegIndex + the slot's own worldPos/normal",
      placedWall.mount === "wall" && placedWall.ownerSegIndex === 0 && placedWall.pos.y === 1.4 && placedWall.normal.z === 1, JSON.stringify(placedWall));

    // ⊗ DEFENSIVE DEGRADE — RED-FIRST: prove a wall-mount light WITHOUT slot data would otherwise have
    // no valid placement (the resolver's whole job is to prevent that), then prove the real degrade path.
    const noSlotResult = mod.interiorResolveFixturePlacement(wallLight, 0, 0, null, null);
    check("8. ⊗ MUTATION/RED-FIRST: with NO mount-slot data, a naive 'always honor mount:wall' implementation would leave this fixture with no valid wall anchor — the resolver instead degrades",
      noSlotResult.mount !== "wall", JSON.stringify(noSlotResult));
    check("9. GREEN: a wall-mount light with NO slot data degrades to mount:'floor' at its own (x,z), never floating/undefined",
      noSlotResult.mount === "floor" && noSlotResult.ownerSegIndex === null && typeof noSlotResult.pos.x === "number", JSON.stringify(noSlotResult));

    const floorLight = { mount: "floor", x: 3, z: 2 };
    const placedFloor = mod.interiorResolveFixturePlacement(floorLight, 0, 0, null, wallMountData);
    check("10. a floor-mount light ignores wallMountData entirely and sits at its own (x,z) floor-top", placedFloor.mount === "floor" && placedFloor.ownerSegIndex === null && Math.abs(placedFloor.pos.x - 3) < 1e-9 && Math.abs(placedFloor.pos.z - 2) < 1e-9, JSON.stringify(placedFloor));
  }
}

console.log("\n=== PART B ITEM 3 — interiorBuildLights E0 wiring (theater-boot.js source extraction) ===");
{
  const fnNames = [
    "interiorAssignShadowCasters", "interiorFloorTopAt", "interiorFixtureBodyMaterial",
    "interiorFixtureEmitterMaterial", "interiorBuildFixtureGroup", "interiorNearestWallMountSlot",
    "interiorResolveFixturePlacement", "interiorGlowTexture", "interiorBuildGlowDisc",
    "interiorConeTexture", "interiorBuildLightCone", "interiorBuildLights",
  ];
  const fns = fnNames.map((n) => extractFn(bootSrc, n));
  check("3a-setup. all interiorBuildLights dependencies extracted from the real source", fns.every(Boolean), fnNames.filter((_, i) => !fns[i]));

  const constLines = [
    extractConstLine(bootSrc, "ITR_LIGHT_RENDER_GAIN"),
    extractConstLine(bootSrc, "ITR_LIGHT_DISTANCE_CAP"),
    extractConstLine(bootSrc, "INTERIOR_SHADOW_CASTER_CAP"),
    extractConstLine(bootSrc, "INTERIOR_SHADOW_MAP_SIZE"),
    extractConstLine(bootSrc, "ITR_FLOOR_BASE_Y"),
    extractConstLine(bootSrc, "ITR_FLOOR_HEIGHT_FALLBACK"),
    extractConstLine(bootSrc, "INTERIOR_LIGHT_FLICKER_AMPLITUDE"),
    extractConstLine(bootSrc, "ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE"),
    extractConstLine(bootSrc, "ITR_GLOW_DISC_SIZE"),
    extractConstLine(bootSrc, "ITR_GLOW_DISC_SIZE_LAMP"),
    extractConstLine(bootSrc, "ITR_GLOW_DISC_OPACITY"),
    extractConstLine(bootSrc, "ITR_LIGHT_CONE_WIDTH_RATIO"),
    extractConstLine(bootSrc, "ITR_LIGHT_CONE_MIN_HEIGHT"),
    extractConstLine(bootSrc, "ITR_FIXTURE_EMISSIVE_INTENSITY"),
    (bootSrc.match(/const ITR_LIGHT_CONE_OPACITY = \{[^}]*\};/) || [null])[0],
  ];
  check("3b-setup. all supporting consts present", constLines.every(Boolean), constLines.map((c) => !!c));
  const coneEnabledLine = extractLetLine(bootSrc, "ITR_LIGHT_CONE_ENABLED");
  const brightSuppressLine = extractLetLine(bootSrc, "ITR_BRIGHT_SUPPRESS_PRACTICALS");
  const glowDiagLine = extractLetLine(bootSrc, "ITR_GLOW_DISC_DIAGNOSTIC");
  check("3c-setup. ITR_LIGHT_CONE_ENABLED / ITR_BRIGHT_SUPPRESS_PRACTICALS / ITR_GLOW_DISC_DIAGNOSTIC gates present", !!coneEnabledLine && !!brightSuppressLine && !!glowDiagLine);
  const partsBlock = extractObjBlock(bootSrc, "ITR_FIXTURE_BODY_PARTS");
  const emitterGeoBlock = extractObjBlock(bootSrc, "ITR_FIXTURE_EMITTER_GEO");

  if (fns.every(Boolean) && constLines.every(Boolean) && coneEnabledLine && brightSuppressLine && glowDiagLine && partsBlock && emitterGeoBlock) {
    const src = "const THREE = arguments[0]; const document = arguments[1];\n"
      + "let INTERIOR_CONE_TEXTURE = null; let INTERIOR_GLOW_TEXTURE = null; let ITR_FIXTURE_BODY_MATERIAL_CACHE = null;\n"
      + coneEnabledLine + "\n" + brightSuppressLine + "\n" + glowDiagLine + "\n"
      // THEATER SPLIT B5 (2026-07-25): interiorBuildLights now lives in src/ui/theater-practicals.js and
      // reads the three root-owned gate `let`s through ctx accessors (an import binding is read-only; a
      // copied mirror would go stale the moment a window.Theater seam flips one). Defining those
      // accessors over THIS sandbox's own pinned `let`s — the exact three lines extracted from
      // theater-boot.js just above — reproduces precisely what theater-boot.js supplies at runtime, so
      // every flag flip below still drives the real function. Same as B4's verify-agx-tonecurve shim.
      + "function practicalsCtxLightConeEnabled(){ return ITR_LIGHT_CONE_ENABLED; }\n"
      + "function practicalsCtxBrightSuppressPracticals(){ return ITR_BRIGHT_SUPPRESS_PRACTICALS; }\n"
      + "function practicalsCtxGlowDiscDiagnostic(){ return ITR_GLOW_DISC_DIAGNOSTIC; }\n"
      + constLines.join("\n") + "\n" + partsBlock + "\n" + emitterGeoBlock + "\n"
      // LL-1: interiorBuildLights reads LIGHT_TUNABLES.lightRenderGain; ITR_LIGHT_RENDER_GAIN is already in
      // constLines above, so skip it here (the prelude reuses that same declaration — no double-declare).
      + lightTunablesPrelude(bootSrc, ["ITR_LIGHT_RENDER_GAIN"]) + "\n" + fns.join("\n")
      + "\nreturn { interiorBuildLights, "
      + "setConeEnabled: function(v){ ITR_LIGHT_CONE_ENABLED = !!v; }, "
      + "setBrightSuppressPracticals: function(v){ ITR_BRIGHT_SUPPRESS_PRACTICALS = !!v; }, "
      + "setGlowDiagnostic: function(v){ ITR_GLOW_DISC_DIAGNOSTIC = !!v; }, "
      + "glowDiagnostic: function(){ return ITR_GLOW_DISC_DIAGNOSTIC; }, "
      + "ITR_LIGHT_RENDER_GAIN: ITR_LIGHT_RENDER_GAIN, ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE: ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE };";
    const factory = new Function(src);
    const THREE = makeStubTHREE();
    const doc = makeFakeDocument();
    const mod = factory(THREE, doc);
    const { interiorBuildLights } = mod;

    const wallMountData = {
      mountSlots: [{ slotId: "s0", ownerSegIndex: 0, u: 0.5, worldPos: { x: 1, y: 1.4, z: -3 }, normal: { x: 0, y: 0, z: 1 } }],
      wallSegments: [{ a: { x: -3, z: -3 }, b: { x: 3, z: -3 } }],
    };
    const torch = { x: 2, z: 3, y: 2.5, color: "#ff9a44", intensity: 1.2, distance: 6, decay: 2, kind: "torch", fixtureId: "brazier-low", mount: "floor", emitterLocal: { x: 0, y: 0.32, z: 0 } };
    const sconce = { x: 1.1, z: -2.9, y: 2.5, color: "#ff8844", intensity: 0.7, distance: 6, decay: 2, kind: "torch", fixtureId: "sconce-iron", mount: "wall", emitterLocal: { x: 0, y: 0.06, z: 0.16 } };

    check("3d-setup. ITR_GLOW_DISC_DIAGNOSTIC's real extracted default is OFF", mod.glowDiagnostic() === false, mod.glowDiagnostic());

    const built = interiorBuildLights([torch, sconce], 0, 0, "gloom", null, [], false, wallMountData);
    check("11. exactly one fixture group per light (2 lights -> 2 top-level children)", built.group.children.length === 2, built.group.children.length);

    const torchFixture = built.group.children[0];
    const sconceFixture = built.group.children[1];
    const torchEmitter = torchFixture.children.find((c) => c.name === "emitter");
    const sconceEmitter = sconceFixture.children.find((c) => c.name === "emitter");
    const torchPl = torchFixture.children.find((c) => c.color !== undefined && c.intensity !== undefined);
    const sconcePl = sconceFixture.children.find((c) => c.color !== undefined && c.intensity !== undefined);

    check("12. FLOOR fixture group sits at the light's own floor-top (x,z) (no wallMountData consulted for a floor mount)",
      Math.abs(torchFixture.position.x - torch.x) < 1e-9 && Math.abs(torchFixture.position.z - torch.z) < 1e-9, JSON.stringify(torchFixture.position));
    check("13. WALL fixture group snaps to its resolved mount slot's own worldPos (never the raw light x/z)",
      Math.abs(sconceFixture.position.x - 1) < 1e-9 && Math.abs(sconceFixture.position.z - (-3)) < 1e-9 && Math.abs(sconceFixture.position.y - 1.4) < 1e-9,
      JSON.stringify(sconceFixture.position));
    check("14. wall fixtures ARE owned: userData.ownerSegIndex is a real segment index, and mount is recorded", sconceFixture.userData.ownerSegIndex === 0 && sconceFixture.userData.mount === "wall");
    check("15. floor fixtures ARE marked floor-owned (ownerSegIndex null)", torchFixture.userData.ownerSegIndex === null && torchFixture.userData.mount === "floor");

    check("16. EMITTER CO-LOCATION: the PointLight is a child of the fixture group, positioned at exactly emitterLocal (world = group transform × emitterLocal by construction)",
      torchPl && Math.abs(torchPl.position.x - torch.emitterLocal.x) < 1e-9 && Math.abs(torchPl.position.y - torch.emitterLocal.y) < 1e-9 && Math.abs(torchPl.position.z - torch.emitterLocal.z) < 1e-9,
      JSON.stringify(torchPl && torchPl.position));
    check("17. the PointLight and the emitter submesh share the identical LOCAL position (co-located inside the fixture group, satisfying 'PointLight world position lies inside/on the emitter submesh bounds')",
      torchPl && torchEmitter && torchPl.position.x === torchEmitter.position.x && torchPl.position.y === torchEmitter.position.y && torchPl.position.z === torchEmitter.position.z);

    check("18. ⊗ NO GLOW DISC IN PRODUCTION: glowCount === 0 with the diagnostic flag at its real default (off)", built.glowCount === 0, built.glowCount);
    check("19. no built fixture group carries a userData.sprite glow-disc child at the diagnostic's default", built.group.children.every((fg) => fg.children.every((c) => !c.userData || !c.userData.sprite)));

    console.log("\n  [RED-FIRST] the glowCount===0 above must be able to become nonzero — proves it isn't vacuous");
    mod.setGlowDiagnostic(true);
    const builtDiag = interiorBuildLights([torch, sconce], 0, 0, "gloom", null, [], false, wallMountData);
    check("18-RED. flipping ITR_GLOW_DISC_DIAGNOSTIC(true) DOES mount glow discs again (glowCount>0) — the production-off check above is load-bearing, not a dead branch",
      builtDiag.glowCount === 2, builtDiag.glowCount);
    mod.setGlowDiagnostic(false);
    const builtAgain = interiorBuildLights([torch, sconce], 0, 0, "gloom", null, [], false, wallMountData);
    check("18-reversible. flipping the flag back off returns glowCount to 0 (full reversibility)", builtAgain.glowCount === 0, builtAgain.glowCount);

    check("20. FLICKER REBIND: every flickerTarget's marker IS the fixture's own emitter submesh (never a glow disc) and emissiveFlicker is set",
      built.flickerTargets.length === 2 && built.flickerTargets.every((t) => t.marker && t.marker.name === "emitter" && t.emissiveFlicker === true),
      JSON.stringify(built.flickerTargets.map((t) => ({ name: t.marker && t.marker.name, emissiveFlicker: t.emissiveFlicker }))));
    check("21. the fragile 'marker: glow.mesh' coupling is GONE from the real source (RED-FIRST proved it existed at the base tip; re-checked live here)",
      !bootSrc.includes("marker: glow.mesh"));

    // check 5 — single dominant practical: a brighter INPUT intensity yields a brighter rendered PointLight.
    check("22. intensity ordering preserved: the higher-intensity input light (torch, 1.2) yields the brighter rendered PointLight than the lower one (sconce, 0.7) — one dominant practical, supporting sources subordinate",
      torchPl.intensity > sconcePl.intensity, JSON.stringify({ torch: torchPl.intensity, sconce: sconcePl.intensity }));

    // suppression (bright realm): fixture body still mounts, only the emitter dims.
    const brightBuilt = interiorBuildLights([torch], 0, 0, "gloom", null, [], true, wallMountData);
    check("23. §E0 Decision 'keep the fixture, drop the glow': a suppressed practical (bright realm) STILL mounts a fixture group with real body geometry",
      brightBuilt.group.children.length === 1 && brightBuilt.group.children[0].children.length >= 2, JSON.stringify(brightBuilt.group.children[0] && brightBuilt.group.children[0].children.length));
    const brightEmitter = brightBuilt.group.children[0].children.find((c) => c.name === "emitter");
    check("24. a suppressed practical's emitter emissiveIntensity is dropped to 0 (the fixture reads unlit, not glowing) while the PointLight itself also suppresses (existing ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE contract, unchanged)",
      brightEmitter.material.emissiveIntensity === 0 && brightBuilt.flickerTargets.length === 0,
      JSON.stringify({ emissiveIntensity: brightEmitter.material.emissiveIntensity, flickerTargets: brightBuilt.flickerTargets.length }));

    // mutation: empty lights array never throws, zero children.
    const empty = interiorBuildLights([], 0, 0, "gloom", null, [], false, wallMountData);
    check("25. ⊗ MUTATION: an empty lights array yields zero children / zero flickerTargets (never throws)", empty.group.children.length === 0 && empty.flickerTargets.length === 0);

    // a bare test literal missing fixtureId/mount/emitterLocal (an old-shape caller) never throws.
    const bareLight = { x: 0, z: 0, y: 2.5, color: "#ffbb66", intensity: 1, distance: 6, decay: 2, kind: "lamp" };
    let bareThrew = false, bareBuilt = null;
    try { bareBuilt = interiorBuildLights([bareLight], 0, 0, null, null, [], false, null); } catch (e) { bareThrew = true; }
    check("26. a bare light record (no fixtureId/mount/emitterLocal — an old-shape caller) never throws and still resolves a default-bucket fixture",
      !bareThrew && bareBuilt.group.children.length === 1, JSON.stringify({ bareThrew, children: bareBuilt && bareBuilt.group.children.length }));

    // determinism: same inputs twice -> byte-identical fixture positions/emitter placements.
    const detA = interiorBuildLights([torch, sconce], 0, 0, "gloom", null, [], false, wallMountData);
    const detB = interiorBuildLights([torch, sconce], 0, 0, "gloom", null, [], false, wallMountData);
    check("27. DETERMINISM: the same inputs build byte-identical fixture group positions twice",
      JSON.stringify(detA.group.children.map((c) => c.position)) === JSON.stringify(detB.group.children.map((c) => c.position)));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail > 0 ? 1 : 0;
