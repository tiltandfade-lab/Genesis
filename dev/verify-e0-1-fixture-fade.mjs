#!/usr/bin/env node
/* dev/verify-e0-1-fixture-fade.mjs — docs/PHASE-3-WAVE-1-SPECS.md E0-1 (WALL-FIXTURE OCCLUSION-FADE
   LINKAGE). src/ui/theater-boot.js is the sealed ES-module boundary file (real THREE, real WebGL at
   runtime) — this harness uses the SAME source-extraction sandbox technique dev/verify-visible-
   practicals.mjs's own PART B already established for this exact file (extract real function text
   verbatim via string search, eval against a minimal stub THREE, assert) rather than jsdom+WebGL
   (mount() needs a real GL context this environment can't cheaply fake) or a full headless-Chrome
   capture (reserved for the visual read, run separately).

   RED-FIRST (checked live against BASE_COMMIT d316abf8, the master tip this branch forked from —
   before this unit's own edits existed):
     `git show d316abf8:src/ui/theater-boot.js | grep -c wallFixtureFadeTargets` -> 0 — interiorBuildLights
     had no per-fixture wall-fade registration at all.
     `git show d316abf8:src/ui/theater-boot.js | grep -c "fadeEntry });"` -> 0 (search string
     "wallUpperMeshList.push({ mesh: m, ownerSegIndex: entry.ownerSegIndex, fadeEntry" instead, see
     check 0c) — wallUpperMeshList entries never carried their own fadeEntry, so no call site could
     ever have appended into it.
     interiorFixtureBodyMaterial() at base took NO argument and ALWAYS returned the one shared cache —
     every fixture (wall or floor) shared ONE THREE.MeshLambertMaterial instance (see check 0d/1).
   Both re-checked live below (section 0), not just asserted as prose.

   Sections:
     0. RED-FIRST proof (symbol/behavior absence at base commit, re-checked live).
     1. Wall-mounted fixtures get a per-fixture CLONED body material (transparent=true); non-wall
        fixtures keep sharing the ONE cache instance — proves the "no perf regression for the common
        case" decision as well as the "independent fade capability" one.
     2. interiorBuildLights' new `wallFixtureFadeTargets` output: a fixture that actually LANDS on a
        real wall segment registers {ownerSegIndex, materials:[bodyClone, emitterMat]}; a floor fixture
        and a wall-mount fixture that DEGRADES to floor (no slot data) register nothing.
     3. ⊗ RED-FIRST / GREEN — the setInteriorBoard call-site append block (extracted verbatim): a torch
        on a wallUpperRawBlocking-suppressed segment (fadeEntry.opacity already < 1) has its appended
        body+emitter materials synced to that opacity immediately (RED baseline: before this unit, no
        such append existed at all, so the materials would still read their construction-time opacity 1
        forever, floating fully lit against a faded wall — reproduced below as the "no append" control).
     4. ISOLATION PROOF (the real test the shared-material bug is fixed, not papered over) — ONE
        simulated scene, three wall segments' fadeEntries (A suppressed/fading, B not suppressed, C
        elsewhere/untouched) plus two fixtures (one on A, one on B). Asserts, in the SAME run:
          (a) the fixture on the suppressed segment (A) fades when A's fadeEntry tween ticks.
          (b) the fixture on the non-suppressed segment (B) stays fully lit (opacity 1) even while A's
              tween is actively running — never a cross-segment leak.
          (c) segment C (registered but never targeted by any fixture, and never touched by the tick)
              never moves — proves the fix isn't just "everything fades together" repainted as
              per-fixture (the ORIGINAL shared-cache bug's exact failure shape).
     5. APPEND-NEVER-OVERWRITE: the wall segment's own upper-mesh material (already occupying
        fadeEntry.materials before any fixture registers) survives untouched after a fixture appends —
        array length grows, first entry unchanged, never replaced.
     6. A fixture with no matching owner entry (room-shell-less board) is simply not registered/never
        throws.
     7. check-manifest.py OK (run live, not just cited).

   Run:  node dev/verify-e0-1-fixture-fade.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const bootSrc = read("src/ui/theater-boot.js");
const BASE_COMMIT = "d316abf8";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

function grepAtBase(needle) {
  try {
    return execSync(`git show ${BASE_COMMIT}:src/ui/theater-boot.js | grep -c '${needle}' || true`,
      { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] }).toString().trim();
  } catch (e) { return "ERR:" + String(e.stderr || e.message).split("\n")[0]; }
}

// ============================================================================
// Extraction helpers (verbatim from dev/verify-visible-practicals.mjs's own PART B convention).
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
let MAT_ID_SEQ = 0;
function makeStubTHREE() {
  function Mesh(geo, mat) {
    return {
      geometry: geo, material: mat, userData: {}, name: "",
      position: makeVec3(0, 0, 0), rotation: { x: 0, y: 0, z: 0 },
      castShadow: false, receiveShadow: false,
      getWorldPosition(target) {
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
  // E0-1: the real THREE.Material.clone() semantics we depend on — a NEW object, independent identity
  // (mat2 !== mat1), copying the SAME property values at clone time (three.js's own `.clone()` contract).
  function MeshLambertMaterial(opts) {
    const mat = Object.assign({ userData: {}, isLambert: true, opacity: 1, transparent: false, _matId: MAT_ID_SEQ++ }, opts);
    mat.clone = function () {
      const copy = Object.assign({}, mat, { _matId: MAT_ID_SEQ++ });
      copy.clone = mat.clone;
      return copy;
    };
    return mat;
  }
  return {
    Group,
    Mesh,
    BoxGeometry: geo("box"), CylinderGeometry: geo("cylinder"), SphereGeometry: geo("sphere"),
    TorusGeometry: geo("torus"), OctahedronGeometry: geo("octahedron"), ConeGeometry: geo("cone"),
    PlaneGeometry: geo("plane"),
    MeshLambertMaterial,
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

console.log("=== 0. RED-FIRST proof (re-checked live against base commit " + BASE_COMMIT + ") ===");
{
  check("0a. wallFixtureFadeTargets did NOT exist in theater-boot.js at base", grepAtBase("wallFixtureFadeTargets") === "0", grepAtBase("wallFixtureFadeTargets"));
  const baseHadFadeEntryPush = grepAtBase("ownerSegIndex: entry.ownerSegIndex, fadeEntry");
  check("0b. wallUpperMeshList entries did NOT carry their own fadeEntry at base (no append target existed)", baseHadFadeEntryPush === "0", baseHadFadeEntryPush);
  let baseBodyMatFn = "1";
  try {
    baseBodyMatFn = execSync(`git show ${BASE_COMMIT}:src/ui/theater-boot.js`, { cwd: ROOT }).toString();
  } catch (e) { baseBodyMatFn = ""; }
  const m = baseBodyMatFn.match(/function interiorFixtureBodyMaterial\(([^)]*)\)/);
  check("0c. interiorFixtureBodyMaterial took NO argument at base (always returned the one shared cache — the exact bug this unit fixes)",
    !!m && m[1].trim() === "", m && m[1]);
}

// ============================================================================
// Extract the real, current (post-fix) source.
// ============================================================================
const fnNames = [
  "interiorAssignShadowCasters", "interiorFloorTopAt", "interiorFixtureBodyMaterial",
  "interiorFixtureEmitterMaterial", "interiorBuildFixtureGroup", "interiorNearestWallMountSlot",
  "interiorResolveFixturePlacement", "interiorGlowTexture", "interiorBuildGlowDisc",
  "interiorConeTexture", "interiorBuildLightCone", "interiorBuildLights",
];
const fns = fnNames.map((n) => extractFn(bootSrc, n));
const fnsOk = fns.every(Boolean);
check("setup. all interiorBuildLights dependencies extracted from the real (post-fix) source", fnsOk, fnNames.filter((_, i) => !fns[i]));

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
const constsOk = constLines.every(Boolean);
check("setup. all supporting consts extracted", constsOk, constLines.map((c) => !!c));
const coneEnabledLine = extractLetLine(bootSrc, "ITR_LIGHT_CONE_ENABLED");
const brightSuppressLine = extractLetLine(bootSrc, "ITR_BRIGHT_SUPPRESS_PRACTICALS");
const glowDiagLine = extractLetLine(bootSrc, "ITR_GLOW_DISC_DIAGNOSTIC");
const partsBlock = extractObjBlock(bootSrc, "ITR_FIXTURE_BODY_PARTS");
const emitterGeoBlock = extractObjBlock(bootSrc, "ITR_FIXTURE_EMITTER_GEO");
check("setup. gate lets + ITR_FIXTURE_BODY_PARTS/EMITTER_GEO extracted", !!coneEnabledLine && !!brightSuppressLine && !!glowDiagLine && !!partsBlock && !!emitterGeoBlock);

let mod = null;
if (fnsOk && constsOk && coneEnabledLine && brightSuppressLine && glowDiagLine && partsBlock && emitterGeoBlock) {
  const src = "const THREE = arguments[0]; const document = arguments[1];\n"
    + "let INTERIOR_CONE_TEXTURE = null; let INTERIOR_GLOW_TEXTURE = null; let ITR_FIXTURE_BODY_MATERIAL_CACHE = null;\n"
    + coneEnabledLine + "\n" + brightSuppressLine + "\n" + glowDiagLine + "\n"
    + constLines.join("\n") + "\n" + partsBlock + "\n" + emitterGeoBlock + "\n"
    // LL-1: interiorBuildLights reads LIGHT_TUNABLES.lightRenderGain; ITR_LIGHT_RENDER_GAIN is already in
    // constLines above, so skip it here (the prelude reuses that same declaration — no double-declare).
    + lightTunablesPrelude(bootSrc, ["ITR_LIGHT_RENDER_GAIN"]) + "\n" + fns.join("\n")
    + "\nreturn { interiorBuildLights, interiorBuildFixtureGroup, interiorFixtureBodyMaterial, "
    + "setConeEnabled: function(v){ ITR_LIGHT_CONE_ENABLED = !!v; }, "
    + "getFixtureBodyCache: function(){ return ITR_FIXTURE_BODY_MATERIAL_CACHE; } };";
  const factory = new Function(src);
  const THREE = makeStubTHREE();
  const doc = makeFakeDocument();
  mod = factory(THREE, doc);
}

console.log("\n=== 1. Per-fixture body-material clone (wall) vs shared cache (floor) ===");
if (mod) {
  const floorLight1 = { fixtureId: "lamp-post", mount: "floor", emitterLocal: { x: 0, y: 0.5, z: 0 }, color: "#ffbb66" };
  const floorLight2 = { fixtureId: "candle-cluster", mount: "floor", emitterLocal: { x: 0, y: 0.28, z: 0 }, color: "#ffbb66" };
  const wallLight1 = { fixtureId: "sconce-iron", mount: "wall", emitterLocal: { x: 0, y: 0.06, z: 0.16 }, color: "#ff8844" };
  const wallLight2 = { fixtureId: "bracket-generic", mount: "wall", emitterLocal: { x: 0, y: 0.05, z: 0.14 }, color: "#ff8844" };

  const f1 = mod.interiorBuildFixtureGroup(floorLight1);
  const f2 = mod.interiorBuildFixtureGroup(floorLight2);
  const w1 = mod.interiorBuildFixtureGroup(wallLight1);
  const w2 = mod.interiorBuildFixtureGroup(wallLight2);

  check("1a. two FLOOR fixtures share the IDENTICAL cached body material instance (no perf regression for the common case)",
    f1.bodyMat === f2.bodyMat, { id1: f1.bodyMat._matId, id2: f2.bodyMat._matId });
  check("1b. a WALL fixture's body material is NOT the shared cache instance",
    w1.bodyMat !== mod.getFixtureBodyCache(), { wallMatId: w1.bodyMat._matId, cacheId: mod.getFixtureBodyCache()._matId });
  check("1c. two WALL fixtures get DISTINCT clones from each other (per-fixture, not a second shared instance)",
    w1.bodyMat !== w2.bodyMat, { id1: w1.bodyMat._matId, id2: w2.bodyMat._matId });
  check("1d. a wall fixture's cloned body material is transparent=true (required for the opacity tween to show)",
    w1.bodyMat.transparent === true, w1.bodyMat.transparent);
  check("1e. a floor fixture's (shared) body material is untouched — never forced transparent as a side effect",
    f1.bodyMat.transparent !== true, f1.bodyMat.transparent);
  check("1f. a wall fixture's EMITTER material is transparent=true (also appended to a fadeEntry)",
    w1.emitter.material.transparent === true, w1.emitter.material.transparent);
  check("1g. a floor fixture's emitter material stays opaque (never appended to any fadeEntry)",
    f1.emitter.material.transparent !== true, f1.emitter.material.transparent);
} else { fail += 7; console.log("  ✗ SKIPPED — extraction failed"); }

console.log("\n=== 2. interiorBuildLights' wallFixtureFadeTargets registration ===");
let built = null, wallMountData = null;
if (mod) {
  wallMountData = {
    mountSlots: [{ slotId: "s0", ownerSegIndex: 0, u: 0.5, worldPos: { x: 1, y: 1.4, z: -3 }, normal: { x: 0, y: 0, z: 1 } }],
    wallSegments: [{ a: { x: -3, z: -3 }, b: { x: 3, z: -3 } }],
  };
  const floorTorch = { x: 2, z: 3, y: 2.5, color: "#ff9a44", intensity: 1.2, distance: 6, decay: 2, kind: "torch", fixtureId: "brazier-low", mount: "floor", emitterLocal: { x: 0, y: 0.32, z: 0 } };
  const landedSconce = { x: 1.1, z: -2.9, y: 2.5, color: "#ff8844", intensity: 0.7, distance: 6, decay: 2, kind: "torch", fixtureId: "sconce-iron", mount: "wall", emitterLocal: { x: 0, y: 0.06, z: 0.16 } };
  // a wall-mount request with NO matching slot (its (x,z) is far from the only mountSlot's worldPos,
  // but interiorNearestWallMountSlot always returns the NEAREST slot when mountSlots is non-empty — to
  // genuinely exercise the degrade path we hand a wallMountData with an EMPTY mountSlots array instead).
  const degradedSconce = { x: 50, z: 50, y: 2.5, color: "#ff8844", intensity: 0.7, distance: 6, decay: 2, kind: "torch", fixtureId: "sconce-iron", mount: "wall", emitterLocal: { x: 0, y: 0.06, z: 0.16 } };

  built = mod.interiorBuildLights([floorTorch, landedSconce], 0, 0, "gloom", null, [], false, wallMountData);
  check("2a. exactly ONE wallFixtureFadeTarget for 2 lights (1 floor + 1 landed wall)", built.wallFixtureFadeTargets.length === 1, built.wallFixtureFadeTargets.length);
  check("2b. the registered target's ownerSegIndex matches the sconce's resolved wall segment (0)", built.wallFixtureFadeTargets[0].ownerSegIndex === 0, built.wallFixtureFadeTargets[0].ownerSegIndex);
  check("2c. the registered target carries exactly 2 materials: [bodyClone, emitterMat]", built.wallFixtureFadeTargets[0].materials.length === 2, built.wallFixtureFadeTargets[0].materials.length);

  const builtDegraded = mod.interiorBuildLights([degradedSconce], 0, 0, "gloom", null, [], false, { mountSlots: [], wallSegments: [] });
  check("2d. a wall-mount fixture that DEGRADES to floor (empty mountSlots) registers ZERO fade targets — 'unaffected' per the spec's own defensive case",
    builtDegraded.wallFixtureFadeTargets.length === 0, builtDegraded.wallFixtureFadeTargets.length);

  const builtNoWallData = mod.interiorBuildLights([floorTorch], 0, 0, "gloom", null, [], false, null);
  check("2e. a board with wallMountData=null (ITR_ROOM_SHELL off / shell-less) never throws and registers zero targets",
    builtNoWallData.wallFixtureFadeTargets.length === 0, builtNoWallData.wallFixtureFadeTargets.length);
} else { fail += 5; console.log("  ✗ SKIPPED — extraction failed"); }

// ============================================================================
// The setInteriorBoard call-site append block, extracted VERBATIM (the exact code landed at the real
// call site, theater-boot.js — see the interiorBuildLights call site comment there) — proves the ACTUAL
// wiring, not a re-implementation of its intent.
// ============================================================================
function extractCallSiteBlock(src) {
  const startMarker = "const wallUpperFadeEntries = (S.interiorLastRoomShell";
  const start = src.indexOf(startMarker);
  if (start < 0) return null;
  // find the matching close of the `.forEach((target) => { ... });` statement that follows the
  // wallUpperFadeEntries line, by paren-depth counting from its own opening "(" (never a naive
  // first-"});" string search — the inner `target.materials.forEach(...)` closes with its OWN "});"
  // first).
  const forEachStart = src.indexOf(".forEach((target)", start);
  if (forEachStart < 0) return null;
  const openParen = src.indexOf("(", forEachStart);
  let depth = 0, i = openParen;
  for (; i < src.length; i++) {
    if (src[i] === "(") depth++;
    else if (src[i] === ")") { depth--; if (depth === 0) break; }
  }
  // i now sits on the outer forEach's closing ")"; the statement ends with the following ";".
  const semiIdx = src.indexOf(";", i);
  if (semiIdx < 0) return null;
  return src.slice(start, semiIdx + 1);
}
const callSiteBlock = extractCallSiteBlock(bootSrc);
check("setup. the setInteriorBoard call-site append block extracted verbatim", !!callSiteBlock);

function runCallSite(S, lightsBuilt) {
  // eslint-disable-next-line no-new-func
  const fn = new Function("S", "lightsBuilt", callSiteBlock + "\nreturn wallUpperFadeEntries;");
  fn(S, lightsBuilt);
}

console.log("\n=== 3. ⊗ RED-FIRST / GREEN — append syncs a fresh fixture material to the CURRENT (already-faded) opacity ===");
if (callSiteBlock) {
  // fadeEntry already mid-fade (opacity 0.42, simulating a segment that started fading BEFORE this
  // fixture was built) — the wall segment's own upper mesh material already occupies index 0.
  const segAUpperMat = { opacity: 0.42, _tag: "segA-upper" };
  const fadeEntryA = { opacity: 0.42, materials: [segAUpperMat] };
  const S = { interiorLastRoomShell: { wallUpperMeshes: [{ ownerSegIndex: 0, fadeEntry: fadeEntryA }] } };
  const bodyClone = { opacity: 1, _tag: "torch-body" };
  const emitterMat = { opacity: 1, _tag: "torch-emitter" };
  const lightsBuilt = { wallFixtureFadeTargets: [{ ownerSegIndex: 0, materials: [bodyClone, emitterMat] }] };

  // RED baseline (pre-unit reality): with NO append block run at all, a freshly-built fixture's
  // materials sit at their construction-time opacity (1) forever, regardless of the segment's real
  // fade state — exactly the bug report ("a torch on that segment keeps rendering fully lit").
  check("3a. RED baseline: before any wiring runs, the fixture's materials read opacity=1 while the wall is already at 0.42 (the exact floating-torch bug)",
    bodyClone.opacity === 1 && emitterMat.opacity === 1 && fadeEntryA.opacity === 0.42);

  runCallSite(S, lightsBuilt);
  check("3b. GREEN: after the real append block runs, the fixture's body+emitter materials are synced to the segment's CURRENT opacity (0.42) immediately — never floats at 1 for a frame",
    bodyClone.opacity === 0.42 && emitterMat.opacity === 0.42, { body: bodyClone.opacity, emitter: emitterMat.opacity });
  check("3c. the wall segment's OWN upper-mesh material is untouched by the append (still 0.42, still the same object)",
    segAUpperMat.opacity === 0.42 && fadeEntryA.materials[0] === segAUpperMat);
  check("3d. APPEND not overwrite: fadeEntry.materials now holds all 3 (upper mesh + body clone + emitter), in order",
    fadeEntryA.materials.length === 3 && fadeEntryA.materials[0] === segAUpperMat && fadeEntryA.materials[1] === bodyClone && fadeEntryA.materials[2] === emitterMat,
    fadeEntryA.materials.map((m) => m._tag));
} else { fail += 4; console.log("  ✗ SKIPPED — call-site block not found"); }

console.log("\n=== 4. ISOLATION PROOF — three segments, one tick, no cross-segment leak ===");
if (callSiteBlock) {
  // Segment A: suppressed/fading (will tick toward 0.15). Segment B: not suppressed, stays at 1.
  // Segment C: registered (has its own fadeEntry + upper mesh material) but NO fixture ever targets
  // it — the "elsewhere" segment the spec's isolation clause (c) names explicitly.
  const segAUpper = { opacity: 1, _tag: "segA-upper" };
  const segBUpper = { opacity: 1, _tag: "segB-upper" };
  const segCUpper = { opacity: 1, _tag: "segC-upper" };
  const fadeEntryA = { opacity: 1, materials: [segAUpper] };
  const fadeEntryB = { opacity: 1, materials: [segBUpper] };
  const fadeEntryC = { opacity: 1, materials: [segCUpper] };
  const S = {
    interiorLastRoomShell: {
      wallUpperMeshes: [
        { ownerSegIndex: 0, fadeEntry: fadeEntryA },
        { ownerSegIndex: 1, fadeEntry: fadeEntryB },
        { ownerSegIndex: 2, fadeEntry: fadeEntryC },
      ],
    },
  };
  const torchA_body = { opacity: 1, _tag: "torchA-body" };
  const torchA_emitter = { opacity: 1, _tag: "torchA-emitter" };
  const torchB_body = { opacity: 1, _tag: "torchB-body" };
  const torchB_emitter = { opacity: 1, _tag: "torchB-emitter" };
  const lightsBuilt = {
    wallFixtureFadeTargets: [
      { ownerSegIndex: 0, materials: [torchA_body, torchA_emitter] }, // torch on the segment that WILL suppress
      { ownerSegIndex: 1, materials: [torchB_body, torchB_emitter] }, // torch on the segment that stays visible
    ],
  };
  runCallSite(S, lightsBuilt);

  check("4-setup. both fixtures registered into their own segment's fadeEntry (own upper mesh mat + 2 appended = 3; segC's untouched — 1 material still)",
    fadeEntryA.materials.length === 3 && fadeEntryB.materials.length === 3 && fadeEntryC.materials.length === 1,
    { a: fadeEntryA.materials.length, b: fadeEntryB.materials.length, c: fadeEntryC.materials.length });

  // simulate itrOcclusionClassify's own tween.update — "(entry.materials || []).forEach((m) => { if(m) m.opacity = v; });"
  // — the EXACT mutation shape that production code performs on a live tween tick (theater-boot.js's
  // own itrOcclusionClassify, unmodified by this unit). Only segment A's tween ticks; B and C never do.
  const TICK_OPACITY_A = 0.15; // ITR_OCCLUSION_UPPER_OPACITY-shaped target, simulated
  fadeEntryA.opacity = TICK_OPACITY_A;
  (fadeEntryA.materials || []).forEach((m) => { if (m) m.opacity = TICK_OPACITY_A; });

  check("4a. (a) the fixture on the SUPPRESSED segment (A) fades: both its body+emitter materials now read the tween's target opacity",
    torchA_body.opacity === TICK_OPACITY_A && torchA_emitter.opacity === TICK_OPACITY_A,
    { body: torchA_body.opacity, emitter: torchA_emitter.opacity });
  check("4b. (b) the fixture on the NON-suppressed segment (B) stays fully lit — untouched by A's tween tick, no cross-segment leak",
    torchB_body.opacity === 1 && torchB_emitter.opacity === 1,
    { body: torchB_body.opacity, emitter: torchB_emitter.opacity });
  check("4c. (c) segment C (elsewhere, never targeted by any fixture) never moves — the fix is genuinely PER-SEGMENT, not 'everything shares one material' repainted",
    segCUpper.opacity === 1 && fadeEntryC.opacity === 1);
  check("4d. segment A's OWN upper-wall mesh material also reads the same faded opacity (fixture tracks the wall, not a second independent number)",
    segAUpper.opacity === TICK_OPACITY_A);
  check("4e. segment B's own upper-wall mesh material is untouched (still 1)", segBUpper.opacity === 1);
} else { fail += 5; console.log("  ✗ SKIPPED — call-site block not found"); }

console.log("\n=== 5. A fixture with no matching owner (room-shell-less board) never throws, never registers ===");
if (callSiteBlock) {
  const S = { interiorLastRoomShell: null }; // ITR_ROOM_SHELL off, or a shell-less board
  const lightsBuilt = { wallFixtureFadeTargets: [{ ownerSegIndex: 0, materials: [{ opacity: 1 }, { opacity: 1 }] }] };
  let threw = false;
  try { runCallSite(S, lightsBuilt); } catch (e) { threw = true; }
  check("5a. no throw when S.interiorLastRoomShell is null", !threw);

  const S2 = { interiorLastRoomShell: { wallUpperMeshes: [{ ownerSegIndex: 7, fadeEntry: { opacity: 1, materials: [] } }] } };
  const lightsBuilt2 = { wallFixtureFadeTargets: [{ ownerSegIndex: 3, materials: [{ opacity: 1 }] }] }; // no owner has ownerSegIndex 3
  let threw2 = false;
  try { runCallSite(S2, lightsBuilt2); } catch (e) { threw2 = true; }
  check("5b. no throw + no registration when the fixture's ownerSegIndex has no matching wallUpperMeshes entry",
    !threw2 && S2.interiorLastRoomShell.wallUpperMeshes[0].fadeEntry.materials.length === 0);
} else { fail += 2; console.log("  ✗ SKIPPED — call-site block not found"); }

console.log("\n=== 6. check-manifest.py OK ===");
{
  let out = "", okc = false;
  try {
    out = execSync("python3 build/check-manifest.py", { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] }).toString();
    okc = /RESULT:\s*OK/.test(out);
  } catch (e) { out = String(e.stdout || e.stderr || e.message); okc = false; }
  check("6a. check-manifest.py ends RESULT: OK", okc, out.split("\n").slice(-3).join(" | "));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
