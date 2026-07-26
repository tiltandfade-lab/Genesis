/* Verify docs/BEAUTY-WAVE-3.md unit BW3-4 — LIGHT SHAFTS + MOTE COUPLING. Three independent parts,
   each exercised against the REAL source via source-extraction sandboxes (the same technique
   dev/verify-vp6-life-pass.mjs's own ITEM 2/3 already use for this exact sealed-ES-module file —
   theater-boot.js is the one ES-MODULE BOUNDARY FILE in Genesis, see its own header) — no jsdom/
   WebGL mount needed, since none of the functions under test touch S.renderer.

   RED-FIRST (checked live against tip 1e053190, the master commit this branch forked from, before
   this unit's own edits existed):
     `git show 1e053190:src/ui/theater-boot.js | grep -c interiorBuildLightCone` -> 0
     `git show 1e053190:src/ui/theater-boot.js | grep -c ITR_LIGHT_CONE_OPACITY` -> 0
     `git show 1e053190:src/ui/theater-boot.js | grep -c lightFlickerStep` -> 0
     `git show 1e053190:src/ui/theater-boot.js | grep -c MOTE_POOL_BIAS_FRACTION` -> 0
   All four now present.

   Run:  node dev/verify-bw3-4-light-shafts.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
// THEATER SPLIT B5 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md): this file's three subjects now
// live in three homes — interiorConeTexture/interiorBuildLightCone/interiorBuildLights (+ the
// ITR_LIGHT_CONE_* consts) in src/ui/theater-practicals.js, the lightFlicker* family and
// startLightFlicker's rAF loop in src/ui/theater-lighting.js, and the mote family in
// src/ui/theater-motes.js. Reading the COMPOSITE keeps every extraction and every source guard below
// pulling the REAL source of its own symbol — no check relaxed, none dropped.
const bootSrc = read("src/ui/theater-boot.js")
  + "\n/* [verify-bw3-4 composite boundary \u2014 src/ui/theater-lighting.js follows] */\n"
  + read("src/ui/theater-lighting.js")
  + "\n/* [verify-bw3-4 composite boundary \u2014 src/ui/theater-practicals.js follows] */\n"
  + read("src/ui/theater-practicals.js")
  + "\n/* [verify-bw3-4 composite boundary \u2014 src/ui/theater-motes.js follows] */\n"
  + read("src/ui/theater-motes.js");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

console.log("=== RED-FIRST proof (re-checked live) ===");
{
  const BASE = "1e053190";
  const grepAtBase = (file, needle) => {
    try {
      return execSync(`git show ${BASE}:${file} | grep -c ${needle} || true`, { cwd: ROOT }).toString().trim();
    } catch (e) { return "ERR:" + String(e.stderr || e.message).split("\n")[0]; }
  };
  check("RED0a. theater-boot.js had no interiorBuildLightCone at base", grepAtBase("src/ui/theater-boot.js", "interiorBuildLightCone") === "0");
  check("RED0b. theater-boot.js had no ITR_LIGHT_CONE_OPACITY at base", grepAtBase("src/ui/theater-boot.js", "ITR_LIGHT_CONE_OPACITY") === "0");
  check("RED0c. theater-boot.js had no lightFlickerStep at base", grepAtBase("src/ui/theater-boot.js", "lightFlickerStep") === "0");
  check("RED0d. theater-boot.js had no MOTE_POOL_BIAS_FRACTION at base", grepAtBase("src/ui/theater-boot.js", "MOTE_POOL_BIAS_FRACTION") === "0");
}

function extractFn(src, name){
  const sig = "function " + name + "(";
  const start = src.indexOf(sig);
  if(start < 0) return null;
  let i = src.indexOf("{", start), depth = 0;
  for(; i < src.length; i++){
    if(src[i] === "{") depth++;
    else if(src[i] === "}"){ depth--; if(depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}
function extractConstLine(src, name){
  const re = new RegExp("const " + name + "\\s*=\\s*[^;]+;");
  const m = src.match(re);
  return m ? m[0] : null;
}
function extractConstBlock(src, name){
  // for object-literal consts that may span... actually all of ours are single-line; kept separate
  // from extractConstLine purely for readability at the call site below.
  return extractConstLine(src, name);
}
// docs/DIEGETIC-LIGHT.md L-1 — ITR_LIGHT_CONE_ENABLED is a `let` (reversible at runtime via
// window.Theater.setLightConeEnabled), not a `const` — extractConstLine's regex only matches "const
// NAME = ...;", so this is the same technique with "let" instead.
function extractLetLine(src, name){
  const re = new RegExp("let " + name + "\\s*=\\s*[^;]+;");
  const m = src.match(re);
  return m ? m[0] : null;
}
// E0 — extracts a multi-line `const NAME = { ... };` object-literal block (the fixture recipe grammar's
// own ITR_FIXTURE_BODY_PARTS/ITR_FIXTURE_EMITTER_GEO tables) verbatim from the real source.
function extractObjBlock(src, name){
  const re = new RegExp("const " + name + " = \\{[\\s\\S]*?\\n\\};");
  const m = src.match(re);
  return m ? m[0] : null;
}
// LL-1 (docs/KENNEY-SOCKET-WAVE.md) — LIGHT_TUNABLES is the mutable light-lab indirection seam every
// render fn this file source-extracts (interiorBuildLights/applyLightProfile/celestial*/makeGradePass/
// updatePostSuiteGrade/sprite-emissive) now reads INSTEAD of the bare consts. This prelude extracts the
// REAL object — seeded verbatim off its authored dependency consts (LIGHT_PROFILES, the floor/bloom/tint
// scalars, CELESTIAL_ARC, the ITR sprite/scene/gain consts), never a neutral stub that would silently
// weaken these assertions — so the sandbox reads production's own values. `skip` lists any dependency
// const the caller already injects into the SAME sandbox scope (avoids a double-declare); the prelude
// must be appended AFTER those skipped consts so its LIGHT_TUNABLES sees them in scope.
function lightTunablesPrelude(src, skip){
  skip = skip || [];
  const deps = ["STAGE_AMBIENT_FLOOR","GRADE_EXPOSURE_FLOOR","BLOOM_THRESHOLD",
    "BLOOM_STRENGTH","GRADE_TINT_SCALE","GRADE_TINT_MAX","CELESTIAL_ARC",
    "ITR_SPRITE_EMISSIVE_FLOOR","ITR_SCENE_AMBIENT","ITR_LIGHT_RENDER_GAIN"];
  const lines = deps.filter((n) => !skip.includes(n)).map((n) => {
    const m = src.match(new RegExp("const " + n + "\\s*=\\s*[^;]+;")); // these dep consts are scalars/object-literals — no internal ';'
    if(!m) throw new Error("lightTunablesPrelude: dep const not found: " + n);
    return m[0];
  });
  // LIGHT_TUNABLES' own profiles IIFE DOES carry internal ';' — match to the first column-0 "\n};" instead.
  const lt = src.match(/const LIGHT_TUNABLES = \{[\s\S]*?\n\};/);
  if(!lt) throw new Error("lightTunablesPrelude: LIGHT_TUNABLES block not found");
  return lines.join("\n") + "\nconst LIGHT_TUNABLES = { profiles:{},"
    + " stageAmbientFloor:STAGE_AMBIENT_FLOOR, gradeExposureFloor:GRADE_EXPOSURE_FLOOR,"
    + " bloomThreshold:BLOOM_THRESHOLD, bloomStrength:BLOOM_STRENGTH,"
    + " gradeTintScale:GRADE_TINT_SCALE, gradeTintMax:GRADE_TINT_MAX,"
    + " celestialArc:CELESTIAL_ARC, spriteEmissiveFloor:ITR_SPRITE_EMISSIVE_FLOOR,"
    + " sceneAmbient:ITR_SCENE_AMBIENT, lightRenderGain:ITR_LIGHT_RENDER_GAIN };";
}

// ============================================================================
// STUBS shared by ITEM 1/2 — a minimal real-enough THREE + document, same "just enough to run the
// real function, not a parallel reimplementation" posture as verify-vp6-life-pass.mjs's own stubs.
// ============================================================================
function makeVec3(x, y, z){
  return { x: x || 0, y: y || 0, z: z || 0,
    set(nx, ny, nz){ this.x = nx; this.y = ny; this.z = nz; return this; },
    copy(o){ this.x = o.x; this.y = o.y; this.z = o.z; return this; } };
}
function makeStubTHREE(){
  function Group(){
    const g = { children: [], userData: {}, position: makeVec3(0, 0, 0), rotation: { x: 0, y: 0, z: 0 },
      add(o){ o.parent = g; this.children.push(o); return this; } };
    return g;
  }
  function geo(kind){ return function(...args){ return { kind, args }; }; } // marker-only stub — this file never reads .parameters off these (Box/Sphere/Torus/Octahedron/Cone), unlike Cylinder/Plane above
  return {
    Group,
    PlaneGeometry: function(w, h){ return { parameters: { width: w, height: h } }; },
    CylinderGeometry: function(rTop, rBottom, h, seg){ return { parameters: { radiusTop: rTop, radiusBottom: rBottom, height: h, radialSegments: seg } }; }, // P-1 emitter nub
    // E0 — the fixture recipe grammar's own additional primitives (body + emitter shapes).
    BoxGeometry: geo("box"), SphereGeometry: geo("sphere"), TorusGeometry: geo("torus"),
    OctahedronGeometry: geo("octahedron"), ConeGeometry: geo("cone"),
    MeshBasicMaterial: function(opts){ return Object.assign({ userData: {} }, opts); },
    MeshLambertMaterial: function(opts){ return Object.assign({ userData: {}, isLambert: true }, opts); },
    Color: function(hex){ return { hex, isColor: true }; },
    Mesh: function(geo, mat){ return { geometry: geo, material: mat, userData: {}, name: "", position: makeVec3(0, 0, 0), rotation: { x: 0, y: 0, z: 0 }, castShadow: false, receiveShadow: false }; },
    CanvasTexture: function(cv){ return { isTexture: true, _cv: cv }; },
    PointLight: function(color, intensity, distance, decay){
      return { color, intensity, distance, decay, position: makeVec3(0, 0, 0), castShadow: false,
        shadow: { mapSize: { set(){} }, camera: { near: 0, far: 0 }, bias: 0 } };
    },
    AdditiveBlending: "additive", DoubleSide: "double", LinearFilter: "linear"
  };
}
function makeFakeDocument(){
  const fakeCtx = {
    fillStyle: "",
    clearRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, closePath(){}, fill(){}, fillRect(){},
    createLinearGradient(){ return { addColorStop(){} }; },
    createRadialGradient(){ return { addColorStop(){} }; },
  };
  const fakeCanvas = { width: 0, height: 0, getContext(){ return fakeCtx; } };
  return { createElement(){ return fakeCanvas; } };
}

// ============================================================================
// ITEM 1 — LIGHT-CONE geometry (interiorConeTexture + interiorBuildLightCone), source-extracted.
// ============================================================================
console.log("\n=== ITEM 1 — light-cone geometry (theater-boot.js source extraction) ===");
{
  const fnNames = ["interiorConeTexture", "interiorBuildLightCone"];
  const fns = fnNames.map((n) => extractFn(bootSrc, n));
  check("1a-setup. interiorConeTexture + interiorBuildLightCone both extracted from the real source", fns.every(Boolean), fnNames.filter((_, i) => !fns[i]));

  const widthRatioLine = extractConstLine(bootSrc, "ITR_LIGHT_CONE_WIDTH_RATIO");
  const minHeightLine = extractConstLine(bootSrc, "ITR_LIGHT_CONE_MIN_HEIGHT");
  const opacityLine = (bootSrc.match(/const ITR_LIGHT_CONE_OPACITY = \{[^}]*\};/) || [null])[0];
  check("1b-setup. cone tuning consts present", !!widthRatioLine && !!minHeightLine && !!opacityLine,
    { widthRatioLine, minHeightLine, opacityLine });

  if(fns.every(Boolean) && widthRatioLine && minHeightLine && opacityLine){
    const src = "const THREE = arguments[0]; const document = arguments[1];\n"
      + "let INTERIOR_CONE_TEXTURE = null;\n"
      + widthRatioLine + "\n" + minHeightLine + "\n" + opacityLine + "\n"
      + fns.join("\n")
      + "\nreturn { interiorBuildLightCone, interiorConeTexture, ITR_LIGHT_CONE_WIDTH_RATIO, ITR_LIGHT_CONE_MIN_HEIGHT, ITR_LIGHT_CONE_OPACITY };";
    const factory = new Function(src);
    const THREE = makeStubTHREE();
    const doc = makeFakeDocument();
    const mod = factory(THREE, doc);

    // torch, a normal apex-to-floor span well above the min-height floor
    const torchCone = mod.interiorBuildLightCone({ kind: "torch", color: "#ff9a44" }, 2.65);
    const mesh = torchCone.group.children[0];
    check("1c. cone height matches the requested apex->floor span (no clamp needed above the floor)",
      Math.abs(mesh.geometry.parameters.height - 2.65) < 1e-9, mesh.geometry.parameters.height);
    check("1d. cone base width is height * ITR_LIGHT_CONE_WIDTH_RATIO",
      Math.abs(mesh.geometry.parameters.width - 2.65 * mod.ITR_LIGHT_CONE_WIDTH_RATIO) < 1e-9, mesh.geometry.parameters.width);
    check("1e. mesh is shifted DOWN by half its own height (apex sits at the group's own origin, base descends)",
      Math.abs(mesh.position.y - (-2.65 / 2)) < 1e-9, mesh.position.y);
    check("1f. torch cone opacity uses ITR_LIGHT_CONE_OPACITY.torch", mesh.material.opacity === mod.ITR_LIGHT_CONE_OPACITY.torch, mesh.material.opacity);
    check("1g. ADDITIVE NEVER OCCLUDES: cone material is additive-blended with depthWrite off",
      mesh.material.blending === "additive" && mesh.material.depthWrite === false, JSON.stringify({ blending: mesh.material.blending, depthWrite: mesh.material.depthWrite }));
    check("1h. cone material is transparent (never a solid occluder)", mesh.material.transparent === true);
    check("1i. cone group is tagged userData.sprite (camera-yaw-facing billboard, same convention as the glow disc/light card)",
      torchCone.group.userData.sprite === true);

    // lamp uses its own opacity tuning
    const lampCone = mod.interiorBuildLightCone({ kind: "lamp", color: "#cfe8ff" }, 2.9);
    check("1j. lamp cone opacity uses ITR_LIGHT_CONE_OPACITY.lamp (distinct from torch)",
      lampCone.group.children[0].material.opacity === mod.ITR_LIGHT_CONE_OPACITY.lamp
      && mod.ITR_LIGHT_CONE_OPACITY.lamp !== mod.ITR_LIGHT_CONE_OPACITY.torch);

    // MIN_HEIGHT floor — a light sitting almost on the floor must not degenerate to a near-zero shaft
    const tinyCone = mod.interiorBuildLightCone({ kind: "torch" }, 0.02);
    check("1k. MIN-HEIGHT FLOOR: a near-zero apex->floor span clamps up to ITR_LIGHT_CONE_MIN_HEIGHT",
      tinyCone.group.children[0].geometry.parameters.height === mod.ITR_LIGHT_CONE_MIN_HEIGHT,
      tinyCone.group.children[0].geometry.parameters.height);

    // determinism — pure function of (light,height), no randomness
    const torchCone2 = mod.interiorBuildLightCone({ kind: "torch", color: "#ff9a44" }, 2.65);
    check("1l. determinism: the SAME (light,height) input builds byte-identical geometry twice",
      torchCone2.group.children[0].geometry.parameters.height === mesh.geometry.parameters.height
      && torchCone2.group.children[0].geometry.parameters.width === mesh.geometry.parameters.width);

    // MUTATION: a negative height must not invert into a negative-size geometry (proves the Math.max
    // floor is load-bearing, not vacuously satisfied by every-input-happens-to-be-positive test data)
    const negCone = mod.interiorBuildLightCone({ kind: "torch" }, -5);
    check("1m. ⊗ MUTATION: a NEGATIVE apex->floor span still clamps to the positive MIN_HEIGHT floor (never a negative-size plane)",
      negCone.group.children[0].geometry.parameters.height === mod.ITR_LIGHT_CONE_MIN_HEIGHT);
  }
}

// ============================================================================
// ITEM 2 — interiorBuildLights wiring: one cone per light (WHEN THE L-1 GATE IS ON), apex-to-floor
// math, flicker-target collection.
//
// REWRITTEN for docs/WALL-VOLUMES-PRACTICALS.md Unit E0 (2026-07-12) — WHY: interiorBuildLights no
// longer mounts a bare {PointLight, glow-disc} pair per light; every light now resolves ONE physical
// FIXTURE GROUP (interiorBuildFixtureGroup) that nests the PointLight + emitter submesh INSIDE it, so
// the old "N children per light == N sibling meshes at the top level" claim (the `{PointLight, glow}`
// child-count checks this ITEM used to assert) no longer holds — it's now `{fixtureGroup}` per light,
// with `{PointLight, emitter}` nested inside. The diagnostics-only glow disc (ITR_GLOW_DISC_DIAGNOSTIC,
// default off) is ALSO nested inside the fixture group when enabled, never a top-level sibling. The
// light-cone (BW3-4, unrelated to E0, still gated off by default) stays a TOP-LEVEL sibling, unchanged.
// RED-FIRST (re-checked live against tip 8b1e9826, the master commit this branch forked from — C4.1a's
// own landed tip, before E0's edits existed):
//   `git show 8b1e9826:src/ui/theater-boot.js | grep -c interiorBuildFixtureGroup` -> 0
// The block below re-proves this dynamically: the OLD "{PointLight, glow} = 2 children per light" claim
// now FAILS (every light is 1 top-level child, the fixture group) — proving the NEW claim isn't vacuous.
// ============================================================================
console.log("\n=== ITEM 2 — interiorBuildLights wiring, E0 fixtures + gated cone (theater-boot.js source extraction) ===");
{
  const fnNames = [
    "interiorConeTexture", "interiorBuildLightCone", "interiorAssignShadowCasters",
    "interiorGlowTexture", "interiorBuildGlowDisc", "interiorFloorTopAt",
    "interiorFixtureBodyMaterial", "interiorFixtureEmitterMaterial", "interiorBuildFixtureGroup",
    "interiorNearestWallMountSlot", "interiorResolveFixturePlacement",
    "interiorBuildLights"
  ];
  const fns = fnNames.map((n) => extractFn(bootSrc, n));
  check("2a-setup. all dependencies extracted from the real source", fns.every(Boolean), fnNames.filter((_, i) => !fns[i]));

  const constLines = [
    extractConstLine(bootSrc, "ITR_LIGHT_CONE_WIDTH_RATIO"),
    extractConstLine(bootSrc, "ITR_LIGHT_CONE_MIN_HEIGHT"),
    (bootSrc.match(/const ITR_LIGHT_CONE_OPACITY = \{[^}]*\};/) || [null])[0],
    extractConstLine(bootSrc, "ITR_LIGHT_RENDER_GAIN"),
    extractConstLine(bootSrc, "ITR_LIGHT_DISTANCE_CAP"), // BW2-4b item 1: interiorBuildLights now clamps range to this
    extractConstLine(bootSrc, "INTERIOR_SHADOW_CASTER_CAP"),
    extractConstLine(bootSrc, "INTERIOR_SHADOW_MAP_SIZE"),
    extractConstLine(bootSrc, "ITR_FLOOR_BASE_Y"),
    extractConstLine(bootSrc, "ITR_FLOOR_HEIGHT_FALLBACK"),
    extractConstLine(bootSrc, "INTERIOR_LIGHT_FLICKER_AMPLITUDE"),
    // LIGHT-CLOSE unit: interiorBuildLights now also reads ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE (the
    // bright/sky-lit practical dim-to factor) — a `const`, injected here like every other supporting
    // const on this list.
    extractConstLine(bootSrc, "ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE"),
    // GLOW-DISC SHRINK unit: interiorBuildGlowDisc now reads these named size/opacity consts (the disc
    // shrank to a flame-glow after the cone was removed) — inject them like every other supporting const.
    extractConstLine(bootSrc, "ITR_GLOW_DISC_SIZE"),
    extractConstLine(bootSrc, "ITR_GLOW_DISC_SIZE_LAMP"),
    extractConstLine(bootSrc, "ITR_GLOW_DISC_OPACITY"),
    // E0 — the fixture recipe grammar's own supporting data/const.
    extractConstLine(bootSrc, "ITR_FIXTURE_EMISSIVE_INTENSITY"),
  ];
  const partsBlock = extractObjBlock(bootSrc, "ITR_FIXTURE_BODY_PARTS");
  const emitterGeoBlock = extractObjBlock(bootSrc, "ITR_FIXTURE_EMITTER_GEO");
  check("2b-setup. all supporting consts present", constLines.every(Boolean) && !!partsBlock && !!emitterGeoBlock, constLines.map((c) => !!c));
  const coneEnabledLine = extractLetLine(bootSrc, "ITR_LIGHT_CONE_ENABLED");
  check("2b2-setup. L-1's ITR_LIGHT_CONE_ENABLED gate (a `let`, runtime-reversible) is present", !!coneEnabledLine, coneEnabledLine);
  // LIGHT-CLOSE unit: interiorBuildLights now also reads ITR_BRIGHT_SUPPRESS_PRACTICALS (a `let`,
  // runtime-reversible like the cone gate above) to decide whether a bright/sky-lit profile's
  // torch/lamp practicals (the fixture's own emitter emissive intensity + the point light's own hot
  // pool) suppress — inject it too, same convention.
  const brightSuppressLine = extractLetLine(bootSrc, "ITR_BRIGHT_SUPPRESS_PRACTICALS");
  check("2b5-setup. LIGHT-CLOSE's ITR_BRIGHT_SUPPRESS_PRACTICALS gate is present", !!brightSuppressLine, brightSuppressLine);
  // E0 — the diagnostics-only glow-disc gate (default off, production glowCount stays 0).
  const glowDiagLine = extractLetLine(bootSrc, "ITR_GLOW_DISC_DIAGNOSTIC");
  check("2b6-setup. E0's ITR_GLOW_DISC_DIAGNOSTIC gate is present", !!glowDiagLine, glowDiagLine);

  if(fns.every(Boolean) && constLines.every(Boolean) && partsBlock && emitterGeoBlock && coneEnabledLine && brightSuppressLine && glowDiagLine){
    // the gates are declared OUTSIDE the returned factory function body but shared by closure — the
    // setter exports let this sandbox flip the SAME `let`s interiorBuildLights itself reads, exactly
    // like window.Theater.setLightConeEnabled/etc. do against the real module scope.
    const src = "const THREE = arguments[0]; const document = arguments[1];\n"
      + "let INTERIOR_CONE_TEXTURE = null; let INTERIOR_GLOW_TEXTURE = null; let ITR_FIXTURE_BODY_MATERIAL_CACHE = null;\n"
      + coneEnabledLine + "\n"
      + brightSuppressLine + "\n"
      + glowDiagLine + "\n"
      // THEATER SPLIT B5 (2026-07-25): interiorBuildLights now lives in src/ui/theater-practicals.js and
      // reads these three root-owned gate `let`s through ctx accessors (an import binding is read-only;
      // a copied mirror would go stale the moment a window.Theater seam flips one). Defining the
      // accessors over THIS sandbox's own pinned `let`s — the exact three lines extracted from
      // theater-boot.js just above — reproduces precisely what theater-boot.js supplies at runtime, so
      // the setConeEnabled/setBrightSuppressPracticals/setGlowDiagnostic flips below still drive the
      // real function. Same shim as B4's dev/verify-agx-tonecurve.mjs.
      + "function practicalsCtxLightConeEnabled(){ return ITR_LIGHT_CONE_ENABLED; }\n"
      + "function practicalsCtxBrightSuppressPracticals(){ return ITR_BRIGHT_SUPPRESS_PRACTICALS; }\n"
      + "function practicalsCtxGlowDiscDiagnostic(){ return ITR_GLOW_DISC_DIAGNOSTIC; }\n"
      + constLines.join("\n") + "\n" + partsBlock + "\n" + emitterGeoBlock + "\n"
      // LL-1: interiorBuildLights now reads LIGHT_TUNABLES.lightRenderGain (was the bare ITR_LIGHT_RENDER_GAIN,
      // already in constLines above — so skip it here to avoid a double-declare; the prelude reuses it).
      + lightTunablesPrelude(bootSrc, ["ITR_LIGHT_RENDER_GAIN"]) + "\n"
      + fns.join("\n")
      + "\nreturn { interiorBuildLights, setConeEnabled: function(v){ ITR_LIGHT_CONE_ENABLED = !!v; }, coneEnabled: function(){ return ITR_LIGHT_CONE_ENABLED; }, setBrightSuppressPracticals: function(v){ ITR_BRIGHT_SUPPRESS_PRACTICALS = !!v; }, brightSuppressPracticals: function(){ return ITR_BRIGHT_SUPPRESS_PRACTICALS; }, setGlowDiagnostic: function(v){ ITR_GLOW_DISC_DIAGNOSTIC = !!v; }, ITR_LIGHT_RENDER_GAIN: ITR_LIGHT_RENDER_GAIN, ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE: ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE };";
    const factory = new Function(src);
    const THREE = makeStubTHREE();
    const doc = makeFakeDocument();
    const mod = factory(THREE, doc);
    const { interiorBuildLights } = mod;

    // real production-shaped records (fixtureId/mount/emitterLocal, as itrRoomLights actually stamps
    // them) — a bare pre-E0 literal is covered separately below (2o, defensive-fallback coverage).
    // `torch` uses lamp-post's own (taller) emitterLocal.y=0.90 so its bridged cone height clears
    // ITR_LIGHT_CONE_MIN_HEIGHT (0.6) UNCLAMPED — proves the real bridging formula, not just the floor.
    // `lamp` uses a shorter emitterLocal.y=0.30, deliberately landing UNDER the 0.6 floor — E0's own
    // floor-hugging fixture heights mean the min-height clamp is now the COMMON case for floor
    // practicals, a real (documented) consequence worth asserting explicitly, not silently glossing.
    const torch = { x: 2, z: 3, y: 2.5, color: "#ff9a44", intensity: 1.2, distance: 6, decay: 2, kind: "torch", fixtureId: "lamp-post", mount: "floor", emitterLocal: { x: 0, y: 0.90, z: 0 } };
    const lamp = { x: 5, z: 1, y: 2.6, color: "#cfe8ff", intensity: 1.2, distance: 6.5, decay: 2, kind: "lamp", fixtureId: "lantern-handled", mount: "floor", emitterLocal: { x: 0, y: 0.30, z: 0 } };

    check("2b3-setup. the extracted gate's REAL default is OFF (matches ITR_LIGHT_CONE_ENABLED's own source default)", mod.coneEnabled() === false, mod.coneEnabled());

    // ---- RED-FIRST: the OLD "{PointLight,glow} = 2 children per light" claim ----
    const builtOff = interiorBuildLights([torch, lamp], 0, 0, null, null);
    check("2c-RED. the OLD pre-E0 claim (\"4 top-level children for 2 lights — {PointLight,glow} each\") now FAILS — proves 2c-GREEN below isn't vacuous",
      builtOff.group.children.length !== 4, builtOff.group.children.length);
    check("2c-GREEN. E0: exactly ONE top-level child per light (its own fixture GROUP, nesting {PointLight, emitter} inside) — 2 lights = 2 top-level children",
      builtOff.group.children.length === 2, builtOff.group.children.length);
    check("2c2. every top-level child IS a fixture group carrying exactly one PointLight + one named 'emitter' child nested inside",
      builtOff.group.children.every((fg) => fg.children.some((c) => c.color !== undefined && c.intensity !== undefined) && fg.children.some((c) => c.name === "emitter")),
      JSON.stringify(builtOff.group.children.map((fg) => fg.children.map((c) => c.name || "PointLight"))));
    check("2c3. GATE OFF (default): NO cone mesh anywhere — flickerTargets carry a marker (the emitter) but no cone",
      builtOff.flickerTargets.length === 2 && builtOff.flickerTargets.every((t) => t.marker && !t.cone),
      JSON.stringify(builtOff.flickerTargets.map((t) => ({ hasMarker: !!t.marker, hasCone: !!t.cone }))));
    check("2c4. GATE OFF: baseConeOpacity still falls back to ITR_LIGHT_CONE_OPACITY[kind] per light (torch != lamp) even with no cone mesh to read it off",
      builtOff.flickerTargets[0].baseConeOpacity !== builtOff.flickerTargets[1].baseConeOpacity,
      JSON.stringify(builtOff.flickerTargets.map((t) => t.baseConeOpacity)));

    // ---- GREEN: flip the cone gate on -> ONE extra TOP-LEVEL sibling per light (the cone itself is
    // still a top-level group, never nested in the fixture — only the fixture's OWN internals changed).
    mod.setConeEnabled(true);
    const built = interiorBuildLights([torch, lamp], 0, 0, null, null);
    check("2c-reversible. GATE ON: each light now contributes 2 top-level children (fixture group + cone group) — 2 lights = 4",
      built.group.children.length === 4, built.group.children.length);

    const torchConeGroup = built.group.children[1];
    const torchConeMesh = torchConeGroup.children[0];
    // floorTopMap=null -> interiorFloorTopAt's own fallback = ITR_FLOOR_BASE_Y + ITR_FLOOR_HEIGHT_FALLBACK = -0.3
    // E0 — the cone now bridges from the FIXTURE's own physical emitter world position (floorTop + its
    // own emitterLocal.y), not the old abstract "light.y - 0.15 sconce offset" head-height apex:
    // torch (lamp-post, el.y=0.90): emitterWorldY = -0.3 + 0.90 = 0.60  ->  coneHeight = 0.60 - (-0.3) = 0.90 (clears the 0.6 MIN_HEIGHT floor, unclamped)
    check("2d. FLOOR-BRIDGING (gate on): the torch cone's height spans EXACTLY the fixture's own physical emitter height -> floorTop, UNCLAMPED (never a fixed generic drop, never the old head-height apex)",
      Math.abs(torchConeMesh.geometry.parameters.height - 0.90) < 1e-9, torchConeMesh.geometry.parameters.height);
    check("2e. the cone's group position matches the fixture's own emitter WORLD position (same apex point — shaft and fixture read as one light)",
      Math.abs(torchConeGroup.position.y - 0.60) < 1e-9 && torchConeGroup.position.x === 2 && torchConeGroup.position.z === 3,
      JSON.stringify(torchConeGroup.position));

    const lampConeGroup = built.group.children[3];
    const lampConeMesh = lampConeGroup.children[0];
    // lamp (lantern-handled, el.y=0.30): raw coneHeight = 0.00 - (-0.3) = 0.30, UNDER the 0.6 floor —
    // clamps up to ITR_LIGHT_CONE_MIN_HEIGHT. A documented E0 consequence: floor-hugging fixture heights
    // make the min-height clamp the COMMON case for floor practicals now, not the rare edge case it
    // guarded against pre-E0 (when apexes sat near head height).
    check("2f. a SHORTER fixture's own raw bridged height (0.30) is UNDER ITR_LIGHT_CONE_MIN_HEIGHT and clamps to 0.6 — the floor-guard is load-bearing far more often post-E0",
      Math.abs(lampConeMesh.geometry.parameters.height - 0.6) < 1e-9, lampConeMesh.geometry.parameters.height);

    check("2g. flickerTargets carries exactly one entry per light, each wiring BOTH marker (the fixture's own emitter) and cone",
      built.flickerTargets.length === 2 && built.flickerTargets.every((t) => t.marker && t.marker.name === "emitter" && t.cone), JSON.stringify(built.flickerTargets.map((t) => ({ hasMarker: !!t.marker, hasCone: !!t.cone }))));
    check("2h. each flickerTarget's baseConeOpacity matches its own cone mesh's built opacity",
      built.flickerTargets[0].baseConeOpacity === torchConeMesh.material.opacity
      && built.flickerTargets[1].baseConeOpacity === lampConeMesh.material.opacity);

    // MUTATION: a lightless board must not throw and must produce zero fixtures/cones/targets (proves
    // the per-light forEach is the source of the count, not a hardcoded stub) — checked with the gate ON
    // (the stricter shape) so a regression that re-hardcodes children can't hide behind gate-off.
    const empty = interiorBuildLights([], 0, 0, null, null);
    check("2i. ⊗ MUTATION: an empty lights array yields zero children / zero flickerTargets (never throws)",
      empty.group.children.length === 0 && empty.flickerTargets.length === 0);

    // ---- LIGHT-CLOSE unit — bright-realm practical suppression (the 7th `isBrightRealm` param) ----
    // E0's own Decision ("keep the fixture, drop the glow") means the TOP-LEVEL child count no longer
    // distinguishes suppressed vs unsuppressed (the fixture group mounts either way) — the real signal
    // moved INSIDE the fixture (emitter emissiveIntensity, flickerTargets membership, PointLight
    // intensity). Deeper coverage of this exact scenario lives in dev/verify-visible-practicals.mjs
    // (checks 23-24); this ITEM keeps just enough non-vacuous coverage to prove the shape actually
    // changed from the old behavior, not a silent no-op.
    mod.setConeEnabled(false);
    check("2j-setup. the extracted gate's REAL default is ON (matches ITR_BRIGHT_SUPPRESS_PRACTICALS' own source default)",
      mod.brightSuppressPracticals() === true, mod.brightSuppressPracticals());

    const notBright = interiorBuildLights([torch], 0, 0, null, null, [], false);
    check("2j. isBrightRealm=false: the practical mounts unaffected — 1 fixture group, 1 flickerTarget, a full-intensity PointLight",
      notBright.group.children.length === 1 && notBright.flickerTargets.length === 1 && notBright.flickerTargets[0].pl.intensity > 0,
      JSON.stringify({ children: notBright.group.children.length, targets: notBright.flickerTargets.length, intensity: notBright.flickerTargets[0] && notBright.flickerTargets[0].pl.intensity }));

    const bright = interiorBuildLights([torch], 0, 0, null, null, [], true);
    check("2k-RED. the OLD 'suppression drops the top-level child count' claim no longer holds — E0 keeps the fixture body either way (still 1 top-level child), proving 2k-GREEN below tests the REAL new signal, not a stale count",
      bright.group.children.length === notBright.group.children.length, JSON.stringify({ bright: bright.group.children.length, notBright: notBright.group.children.length }));
    check("2k-GREEN. isBrightRealm=true (gate on, default): the fixture body STILL mounts (§E0 'keep the fixture, drop the glow'), but zero flickerTargets and the PointLight itself is suppressed",
      bright.group.children.length === 1 && bright.flickerTargets.length === 0,
      JSON.stringify({ children: bright.group.children.length, targets: bright.flickerTargets.length }));
    const brightPl = bright.group.children[0].children.find((c) => c.color !== undefined && c.intensity !== undefined);
    const brightEmitter = bright.group.children[0].children.find((c) => c.name === "emitter");
    check("2l. the suppressed PointLight's own intensity actually scaled DOWN by ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE, AND the emitter's own emissiveIntensity dropped to 0 (never just a zero-flicker illusion with a still-hot/still-glowing fixture)",
      brightPl.intensity === torch.intensity * mod.ITR_LIGHT_RENDER_GAIN * mod.ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE && brightEmitter.material.emissiveIntensity === 0,
      JSON.stringify({ actualIntensity: brightPl.intensity, expectedIntensity: torch.intensity * mod.ITR_LIGHT_RENDER_GAIN * mod.ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE, emissiveIntensity: brightEmitter.material.emissiveIntensity }));

    // reversibility: flip the SAME extracted gate off -> a bright realm's lights mount exactly like
    // notBright above (the flag is a true toggle, not a one-way migration).
    mod.setBrightSuppressPracticals(false);
    const brightGateOff = interiorBuildLights([torch], 0, 0, null, null, [], true);
    check("2m-reversible. GATE OFF: a bright realm's practicals mount unaffected again (byte-identical shape to isBrightRealm=false)",
      brightGateOff.group.children.length === notBright.group.children.length && brightGateOff.flickerTargets.length === notBright.flickerTargets.length,
      JSON.stringify({ children: brightGateOff.group.children.length, targets: brightGateOff.flickerTargets.length }));
    mod.setBrightSuppressPracticals(true);

    // per-light escape hatch: `light.forceVisiblePractical` keeps a single light's practical mounted
    // even under a bright, suppression-on profile (a future realm declaring a genuine outdoor source).
    const campfire = Object.assign({}, torch, { forceVisiblePractical: true });
    const forced = interiorBuildLights([campfire], 0, 0, null, null, [], true);
    check("2n. light.forceVisiblePractical=true escapes bright-profile suppression even with the gate on (fixture mounts, PointLight stays full-intensity, joins the flicker channel) — 1 top-level child",
      forced.group.children.length === 1 && forced.flickerTargets.length === 1,
      JSON.stringify({ children: forced.group.children.length, targets: forced.flickerTargets.length }));

    // E0 — a bare pre-E0-shaped light record (no fixtureId/mount/emitterLocal) must never throw; it
    // degrades to the default-bucket fixture family (defensive fallback, interiorBuildFixtureGroup).
    const bareLight = { x: 0, z: 0, y: 2.5, color: "#ffbb66", intensity: 1, distance: 6, decay: 2, kind: "lamp" };
    let bareThrew = false;
    try { interiorBuildLights([bareLight], 0, 0, null, null); } catch (e) { bareThrew = true; }
    check("2o. a bare pre-E0 light literal (missing fixtureId/mount/emitterLocal) never throws (defensive fallback)", !bareThrew);

    // reset the shared gate back off — this sandbox's own `let` is scoped to this factory instance only
    // (never touches the real module), but resetting keeps this block's own local state tidy/explicit.
    mod.setConeEnabled(false);
  }
}

// ============================================================================
// ITEM 3 — LOCAL FLICKER SYNC: deterministic seeded sample, per-light state, exact mesh/light parity.
// ============================================================================
console.log("\n=== ITEM 3 — local deterministic flicker sync (theater-boot.js source extraction) ===");
{
  const flickerFns = [
    "lightFlickerHash32", "lightFlickerNormalizedSample",
    "lightFlickerIntervalMs", "lightFlickerDirectionSample",
    "lightFlickerSmoothProgress", "lightFlickerInterpolatedState",
    "lightFlickerApplySample", "lightFlickerStep"
  ].map((name) => extractFn(bootSrc, name));
  check("3a-setup. deterministic flicker helpers extracted from the real source", flickerFns.every(Boolean));

  if(flickerFns.every(Boolean)){
    const factory = new Function(flickerFns.join("\n")
      + "\nreturn { lightFlickerNormalizedSample, lightFlickerIntervalMs, lightFlickerDirectionSample, lightFlickerSmoothProgress, lightFlickerInterpolatedState, lightFlickerApplySample, lightFlickerStep };");
    const {
      lightFlickerNormalizedSample,
      lightFlickerIntervalMs,
      lightFlickerDirectionSample,
      lightFlickerSmoothProgress,
      lightFlickerInterpolatedState,
      lightFlickerApplySample,
      lightFlickerStep
    } = factory();

    function makeTarget(id, state, baseIntensity, baseEmissiveIntensity, baseConeOpacity){
      function vec(x, y, z){
        return { x, y, z, set(nx, ny, nz){ this.x = nx; this.y = ny; this.z = nz; } };
      }
      return {
        id, sourceRef: id, state, seed: "seed:" + id, sampleIndex: 0, normalizedSample: 1,
        pl: { intensity: baseIntensity, position: vec(0, 0.08, 0.18), userData: {} },
        marker: {
          material: { emissiveIntensity: baseEmissiveIntensity },
          position: vec(0, 0.08, 0.18),
          rotation: { x: 0, y: 0, z: 0 },
          userData: {}
        },
        cone: { material: { opacity: baseConeOpacity } },
        emissiveFlicker: true,
        baseIntensity, baseEmissiveIntensity, baseOpacity: 1, baseConeOpacity,
        basePointPosition: { x: 0, y: 0.08, z: 0.18 },
        baseMarkerPosition: { x: 0, y: 0.08, z: 0.18 },
        baseMarkerRotation: { x: 0, y: 0, z: 0 },
        cadenceMs: 420, intervalJitter: 0.55,
        amplitude: 0.12, directionAmplitude: 0.025
      };
    }

    const flickering = makeTarget("west", "flickering", 16, 1.6, 0.3);
    const steady = makeTarget("east", "steady", 9, 1.6, 0.2);
    lightFlickerStep([], [], [flickering, steady], 0, 1);
    const emittedNorm = flickering.pl.intensity / flickering.baseIntensity;
    const meshNorm = flickering.marker.material.emissiveIntensity / flickering.baseEmissiveIntensity;
    const coneNorm = flickering.cone.material.opacity / flickering.baseConeOpacity;
    check("3b. one deterministic normalized sample drives emitted light + visible emitter on the same tick",
      Math.abs(emittedNorm - meshNorm) < 1e-9 && Math.abs(emittedNorm - flickering.normalizedSample) < 1e-9,
      JSON.stringify({ emittedNorm, meshNorm, sample: flickering.normalizedSample }));
    check("3c. the optional cone rides that exact normalized sample too",
      Math.abs(coneNorm - emittedNorm) < 1e-9, JSON.stringify({ coneNorm, emittedNorm }));
    check("3d. a steady sibling is photometrically and visibly untouched by another light's flicker",
      steady.pl.intensity === steady.baseIntensity
      && steady.marker.material.emissiveIntensity === steady.baseEmissiveIntensity
      && steady.normalizedSample === 1,
      JSON.stringify(steady));
    check("3e. the flickering target actually moved away from baseline",
      Math.abs(flickering.normalizedSample - 1) > 1e-6, flickering.normalizedSample);

    const replay = makeTarget("west", "flickering", 16, 1.6, 0.3);
    lightFlickerStep([], [], [replay], 0, 1);
    check("3f. DETERMINISM: identical seed + sample index reproduces byte-identical light/material values",
      replay.pl.intensity === flickering.pl.intensity
      && replay.marker.material.emissiveIntensity === flickering.marker.material.emissiveIntensity
      && replay.normalizedSample === flickering.normalizedSample);
    check("3g. per-light seeds are load-bearing (same tick, different light id -> different sample)",
      lightFlickerNormalizedSample("seed:west", 1, 0.12)
      !== lightFlickerNormalizedSample("seed:east", 1, 0.12));

    const noCone = makeTarget("no-cone", "flickering", 5, 1.2, 0.1);
    noCone.cone = null;
    let noConeThrew = false;
    try { lightFlickerStep([], [], [noCone], 0, 2); } catch(e) { noConeThrew = true; }
    check("3h. ⊗ MUTATION/null-safety: a flickering target with no cone still updates light + emitter",
      !noConeThrew && noCone.pl.intensity !== noCone.baseIntensity
      && noCone.marker.material.emissiveIntensity !== noCone.baseEmissiveIntensity);

    lightFlickerApplySample(flickering, 1);
    check("3i. disabling flicker can restore the exact authored light + material baseline in one write",
      flickering.pl.intensity === flickering.baseIntensity
      && flickering.marker.material.emissiveIntensity === flickering.baseEmissiveIntensity
      && flickering.normalizedSample === 1);
    const danced = makeTarget("dance", "flickering", 16, 1.6, 0.3);
    lightFlickerStep([], [], [danced], 0, 3);
    const danceRadius = Math.hypot(
      danced.directionSample.x,
      danced.directionSample.y,
      danced.directionSample.z
    );
    check("3j. a flickering flame moves the real light origin and visible emitter together",
      danceRadius > 0
      && danced.pl.position.x === danced.marker.position.x
      && danced.pl.position.y === danced.marker.position.y
      && danced.pl.position.z === danced.marker.position.z,
      JSON.stringify({ direction: danced.directionSample, point: danced.pl.position, marker: danced.marker.position }));
    check("3k. directional dance stays inside the authored flame-volume bound",
      danceRadius <= danced.directionAmplitude * 1.05,
      JSON.stringify({ danceRadius, bound: danced.directionAmplitude }));
    const intervals = [1, 2, 3, 4, 5, 6].map((index) =>
      lightFlickerIntervalMs(danced.seed, index, danced.cadenceMs, danced.intervalJitter)
    );
    const replayedIntervals = [1, 2, 3, 4, 5, 6].map((index) =>
      lightFlickerIntervalMs(danced.seed, index, danced.cadenceMs, danced.intervalJitter)
    );
    check("3l. seeded interval variation is irregular, bounded, and exactly reproducible",
      new Set(intervals).size > 1
      && intervals.every((ms) => ms >= 120 && ms <= 651)
      && JSON.stringify(intervals) === JSON.stringify(replayedIntervals),
      JSON.stringify(intervals));
    lightFlickerApplySample(danced, 1);
    check("3m. steady/reset returns intensity, flame lean, and co-located positions to authored baseline",
      danced.pl.intensity === danced.baseIntensity
      && danced.marker.material.emissiveIntensity === danced.baseEmissiveIntensity
      && danced.pl.position.x === danced.basePointPosition.x
      && danced.pl.position.y === danced.basePointPosition.y
      && danced.pl.position.z === danced.basePointPosition.z
      && danced.marker.position.x === danced.baseMarkerPosition.x
      && danced.marker.rotation.x === danced.baseMarkerRotation.x
      && danced.marker.rotation.z === danced.baseMarkerRotation.z);
    const fromDirection = { x: -0.02, y: 0.001, z: 0.01 };
    const toDirection = { x: 0.02, y: -0.001, z: -0.01 };
    const middle = lightFlickerInterpolatedState(
      0.9, 1.1, fromDirection, toDirection, 0.5
    );
    check("3n. frame interpolation glides through the exact midpoint instead of stepping target-to-target",
      Math.abs(middle.sample - 1) < 1e-12
      && Math.abs(middle.direction.x) < 1e-12
      && Math.abs(middle.direction.y) < 1e-12
      && Math.abs(middle.direction.z) < 1e-12,
      JSON.stringify(middle));
    check("3o. the easing curve is bounded, monotonic at representative frame positions, and exact at both ends",
      lightFlickerSmoothProgress(0) === 0
      && lightFlickerSmoothProgress(1) === 1
      && lightFlickerSmoothProgress(0.25) > 0
      && lightFlickerSmoothProgress(0.25) < lightFlickerSmoothProgress(0.5)
      && lightFlickerSmoothProgress(0.5) < lightFlickerSmoothProgress(0.75)
      && lightFlickerSmoothProgress(0.75) < 1);
  }
  const liveLoop = extractFn(bootSrc, "startLightFlicker") || "";
  const stopLoop = extractFn(bootSrc, "stopLightFlicker") || "";
  check("3p. production flame animation is display-rate rAF interpolation, not a stepped interval",
    liveLoop.includes("requestAnimationFrame(frame)")
    && !liveLoop.includes("setInterval")
    && stopLoop.includes("cancelAnimationFrame"));
}

// ============================================================================
// ITEM 4 — MOTE COUPLING: pool-bias measurement, the coordinate-shift fix, backward-compat.
// ============================================================================
console.log("\n=== ITEM 4 — mote coupling (theater-boot.js source-extraction sandbox) ===");
{
  const fns = ["moteHash32", "moteRng", "interiorMoteKindFor", "moteSoftTexture", "interiorBuildMotes"].map((n) => extractFn(bootSrc, n));
  check("4a-setup. all mote functions extracted from the real source", fns.every(Boolean));
  const countMinLine = (bootSrc.match(/const MOTE_COUNT_MIN[^;]+;/) || [null])[0];
  const sizeLine = (bootSrc.match(/const MOTE_SIZE_MIN[^;]+;/) || [null])[0];
  const tintLine = bootSrc.match(/const MOTE_TINT = \{[^}]*\};/);
  const biasFractionLine = extractConstLine(bootSrc, "MOTE_POOL_BIAS_FRACTION");
  const radiusLine = extractConstLine(bootSrc, "MOTE_POOL_RADIUS");
  check("4a2-setup. MOTE_POOL_BIAS_FRACTION + MOTE_POOL_RADIUS present", !!biasFractionLine && !!radiusLine);

  function makeStubTHREE(){
    return {
      Group: function(){ return { children: [], add(o){ this.children.push(o); return this; } }; },
      PlaneGeometry: function(w, h){ return { w, h }; },
      MeshBasicMaterial: function(opts){ return Object.assign({}, opts); },
      Mesh: function(geo, mat){ return { geometry: geo, material: mat, userData: {},
        position: { x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; } } }; },
      AdditiveBlending: "additive", DoubleSide: "double"
    };
  }

  if(fns.every(Boolean) && countMinLine && sizeLine && biasFractionLine && radiusLine){
    // P-1/mote-softdot: interiorBuildMotes now calls moteSoftTexture(), which reads a module-scope
    // `let MOTE_SOFT_TEX` cache and returns null under headless (no `document`) — declare the cache so
    // the extracted function resolves; it short-circuits to null before ever touching CanvasTexture.
    const src = "const THREE = arguments[0];\nlet MOTE_SOFT_TEX = null;\n" + countMinLine + "\n" + sizeLine + "\n"
      + (tintLine ? tintLine[0] : "const MOTE_TINT={};") + "\n" + biasFractionLine + "\n" + radiusLine + "\n"
      + fns.join("\n") + "\nreturn { interiorBuildMotes, interiorMoteKindFor, moteHash32 };";
    const THREE = makeStubTHREE();
    const factory = new Function(src);
    const mod = factory(THREE);

    // ---- 4b: BACKWARD-COMPAT — the pre-unit 3-arg call shape (no lights/cx/cz) must behave exactly
    // as before (regression against verify-vp6-life-pass.mjs's own ITEM 3, re-run here against the
    // NEW source to prove this unit didn't perturb the old contract).
    const bounds = { minX: -3, maxX: 3, minZ: -2, maxZ: 2 };
    const group = mod.interiorBuildMotes("room-seed-1", bounds, "ember");
    check("4b. BACKWARD-COMPAT: a 3-arg call (no lights/cx/cz) still returns [4,8] motes within bounds",
      group.children.length >= 4 && group.children.length <= 8
      && group.children.every((m) => m.position.x >= bounds.minX - 1e-9 && m.position.x <= bounds.maxX + 1e-9
        && m.position.z >= bounds.minZ - 1e-9 && m.position.z <= bounds.maxZ + 1e-9),
      group.children.length);

    // ---- 4c: COORDINATE-SHIFT FIX — bounds shifted by (cx,cz) must translate every mote by
    // EXACTLY (-cx,-cz) relative to the unshifted build (same seed, no lights so the bias branch
    // never triggers — a clean, deterministic pure-translation proof).
    const rawBounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
    const unshifted = mod.interiorBuildMotes("shift-seed", rawBounds, "ember", [], 0, 0);
    const shifted = mod.interiorBuildMotes("shift-seed", rawBounds, "ember", [], 4, 6);
    check("4c-setup. shifted/unshifted builds have the same mote count (same seed -> same count)",
      unshifted.children.length === shifted.children.length, JSON.stringify([unshifted.children.length, shifted.children.length]));
    const allShiftedByExactOffset = unshifted.children.every((m, i) =>
      Math.abs(shifted.children[i].position.x - (m.position.x - 4)) < 1e-9 &&
      Math.abs(shifted.children[i].position.z - (m.position.z - 6)) < 1e-9);
    check("4c. COORDINATE FIX: every mote translates by EXACTLY (-cx,-cz) — proves the shift is real, matching the SAME (rawX-cx,rawZ-cz) convention every other interior mesh (lights/pieces/dressing) already uses",
      allShiftedByExactOffset, JSON.stringify({ unshifted: unshifted.children.map((m) => [m.position.x, m.position.z]), shifted: shifted.children.map((m) => [m.position.x, m.position.z]) }));
    // and the shifted build actually lands inside the SHIFTED bounds (not the raw ones)
    const shiftedBoundsOk = shifted.children.every((m) => m.position.x >= -4 - 1e-9 && m.position.x <= 6 + 1e-9 && m.position.z >= -6 - 1e-9 && m.position.z <= 4 + 1e-9);
    check("4c2. the shifted build's motes sit inside the SHIFTED bounds [minX-cx,maxX-cx]x[minZ-cz,maxZ-cz]", shiftedBoundsOk);

    // ---- 4d: POOL-BIAS MEASUREMENT — across many seeds, >=60% of motes land within MOTE_POOL_RADIUS
    // of SOME light (the spec's own "60-70% ... within pool radii" acceptance). Room sized generously
    // (40x40, lights well clear of the edges) so the clamp-to-bounds branch never fires and doesn't
    // suppress the measured fraction.
    const poolBounds = { minX: -20, maxX: 20, minZ: -20, maxZ: 20 };
    const lights = [{ x: -5, z: 3, kind: "torch" }, { x: 6, z: -4, kind: "torch" }];
    const RADIUS = mod.MOTE_POOL_RADIUS != null ? mod.MOTE_POOL_RADIUS : 1.8; // factory doesn't re-export it; re-derive from the extracted const line text below if needed
    const radiusVal = Number((radiusLine.match(/=\s*([\d.]+)/) || [null, "1.8"])[1]);
    const N_SEEDS = 200;
    let total = 0, inside = 0;
    for(let s = 0; s < N_SEEDS; s++){
      const g = mod.interiorBuildMotes("pool-seed-" + s, poolBounds, "ember", lights, 0, 0);
      g.children.forEach((m) => {
        total++;
        const nearest = Math.min(...lights.map((l) => Math.hypot(m.position.x - l.x, m.position.z - l.z)));
        if(nearest <= radiusVal + 1e-9) inside++;
      });
    }
    const fraction = inside / total;
    check("4d. MOTE COUPLING MEASURED: >=60% of motes (across " + N_SEEDS + " seeds, " + total + " motes total) land within MOTE_POOL_RADIUS of a light pool",
      fraction >= 0.60, `fraction=${fraction.toFixed(3)}`);

    // ---- 4e: MUTATION — the SAME seeds/bounds with NO lights must show a MEASURABLY lower fraction
    // (proves 4d isn't vacuously satisfied by the room geometry alone — the bias mechanism is doing
    // real work).
    let totalNoLights = 0, insideNoLights = 0;
    for(let s = 0; s < N_SEEDS; s++){
      const g = mod.interiorBuildMotes("pool-seed-" + s, poolBounds, "ember", [], 0, 0);
      g.children.forEach((m) => {
        totalNoLights++;
        const nearest = Math.min(...lights.map((l) => Math.hypot(m.position.x - l.x, m.position.z - l.z)));
        if(nearest <= radiusVal + 1e-9) insideNoLights++;
      });
    }
    const fractionNoLights = insideNoLights / totalNoLights;
    check("4e. ⊗ MUTATION: the IDENTICAL seeds with NO lights land near those same points MUCH less often (bias is load-bearing, not a room-geometry coincidence)",
      fraction - fractionNoLights >= 0.30, `withLights=${fraction.toFixed(3)} withoutLights=${fractionNoLights.toFixed(3)}`);

    // ---- 4f: determinism — same seed + same lights -> identical mote field.
    const d1 = mod.interiorBuildMotes("det-seed", poolBounds, "ember", lights, 0, 0);
    const d2 = mod.interiorBuildMotes("det-seed", poolBounds, "ember", lights, 0, 0);
    check("4f. DETERMINISM: the same (seed,bounds,lights,cx,cz) builds a byte-identical mote field",
      JSON.stringify(d1.children.map((m) => m.position)) === JSON.stringify(d2.children.map((m) => m.position)));

    // ---- 4g: every mote (biased or not) still clamps inside the room bounds (the pre-unit "MOTES
    // WITHIN ROOM BOUNDS" law must survive bias — a pool near the wall must never push a mote outside).
    const edgeBounds = { minX: -2, maxX: 2, minZ: -2, maxZ: 2 };
    const edgeLights = [{ x: 1.9, z: -1.9, kind: "torch" }]; // pool center pinned near a corner
    let edgeOk = true;
    for(let s = 0; s < 30; s++){
      const g = mod.interiorBuildMotes("edge-seed-" + s, edgeBounds, "ember", edgeLights, 0, 0);
      g.children.forEach((m) => {
        if(m.position.x < edgeBounds.minX - 1e-9 || m.position.x > edgeBounds.maxX + 1e-9
          || m.position.z < edgeBounds.minZ - 1e-9 || m.position.z > edgeBounds.maxZ + 1e-9) edgeOk = false;
      });
    }
    check("4g. a light pool pinned near a room corner still clamps every mote inside the room bounds", edgeOk);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
