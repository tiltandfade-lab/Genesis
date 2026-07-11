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
const bootSrc = read("src/ui/theater-boot.js");

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
  return {
    Group: function(){ return { children: [], userData: {}, position: makeVec3(0, 0, 0), add(o){ this.children.push(o); return this; } }; },
    PlaneGeometry: function(w, h){ return { parameters: { width: w, height: h } }; },
    MeshBasicMaterial: function(opts){ return Object.assign({ userData: {} }, opts); },
    Mesh: function(geo, mat){ return { geometry: geo, material: mat, userData: {}, position: makeVec3(0, 0, 0), castShadow: false, receiveShadow: false }; },
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
// ITEM 2 — interiorBuildLights wiring: one cone per light, apex-to-floor math, flicker-target
// collection (marker+cone riding the same channel).
// ============================================================================
console.log("\n=== ITEM 2 — interiorBuildLights wiring (theater-boot.js source extraction) ===");
{
  const fnNames = [
    "interiorConeTexture", "interiorBuildLightCone", "interiorAssignShadowCasters",
    "interiorGlowTexture", "interiorBuildGlowDisc", "interiorFloorTopAt", "interiorBuildLights"
  ];
  const fns = fnNames.map((n) => extractFn(bootSrc, n));
  check("2a-setup. all 7 dependencies extracted from the real source", fns.every(Boolean), fnNames.filter((_, i) => !fns[i]));

  const constLines = [
    extractConstLine(bootSrc, "ITR_LIGHT_CONE_WIDTH_RATIO"),
    extractConstLine(bootSrc, "ITR_LIGHT_CONE_MIN_HEIGHT"),
    (bootSrc.match(/const ITR_LIGHT_CONE_OPACITY = \{[^}]*\};/) || [null])[0],
    extractConstLine(bootSrc, "ITR_LIGHT_RENDER_GAIN"),
    extractConstLine(bootSrc, "INTERIOR_SHADOW_CASTER_CAP"),
    extractConstLine(bootSrc, "INTERIOR_SHADOW_MAP_SIZE"),
    (bootSrc.match(/const INTERIOR_LIGHT_CARD = \{[^}]*\};/) || [null])[0],
    extractConstLine(bootSrc, "ITR_FLOOR_BASE_Y"),
    extractConstLine(bootSrc, "ITR_FLOOR_HEIGHT_FALLBACK"),
    extractConstLine(bootSrc, "INTERIOR_LIGHT_FLICKER_AMPLITUDE"),
  ];
  check("2b-setup. all supporting consts present", constLines.every(Boolean), constLines.map((c) => !!c));

  if(fns.every(Boolean) && constLines.every(Boolean)){
    const src = "const THREE = arguments[0]; const document = arguments[1];\n"
      + "let INTERIOR_CONE_TEXTURE = null; let INTERIOR_GLOW_TEXTURE = null;\n"
      + constLines.join("\n") + "\n"
      + fns.join("\n")
      + "\nreturn { interiorBuildLights };";
    const factory = new Function(src);
    const THREE = makeStubTHREE();
    const doc = makeFakeDocument();
    const { interiorBuildLights } = factory(THREE, doc);

    const torch = { x: 2, z: 3, y: 2.5, color: "#ff9a44", intensity: 1.2, distance: 6, decay: 2, kind: "torch" };
    const lamp = { x: 5, z: 1, y: 2.6, color: "#cfe8ff", intensity: 1.2, distance: 6.5, decay: 2, kind: "lamp" };
    // realmId=null -> cardSlug resolves null (INTERIOR_LIGHT_CARD lookup misses) -> no light-card
    // children, keeping this sandbox's dependency surface to exactly what's stubbed above.
    const built = interiorBuildLights([torch, lamp], 0, 0, null, null);

    check("2c. no light-card realm -> exactly {PointLight, glow, cone} per light (3 children x 2 lights = 6)",
      built.group.children.length === 6, built.group.children.length);

    const torchConeGroup = built.group.children[2];
    const torchConeMesh = torchConeGroup.children[0];
    // floorTopMap=null -> interiorFloorTopAt's own fallback = ITR_FLOOR_BASE_Y + ITR_FLOOR_HEIGHT_FALLBACK = -0.3
    // torch glow sits 0.15 below its light point (the sconce offset) -> apex = 2.5 - 0.15 = 2.35
    // cone height = apex - floorTop = 2.35 - (-0.3) = 2.65
    check("2d. FLOOR-BRIDGING: the torch cone's height spans EXACTLY apex(=light.y-0.15sconce)->floorTop (never a fixed generic drop)",
      Math.abs(torchConeMesh.geometry.parameters.height - 2.65) < 1e-9, torchConeMesh.geometry.parameters.height);
    check("2e. the cone's group position matches the glow marker's own position (same apex point — shaft and marker read as one light)",
      Math.abs(torchConeGroup.position.y - 2.35) < 1e-9 && torchConeGroup.position.x === 2 && torchConeGroup.position.z === 3,
      JSON.stringify(torchConeGroup.position));

    const lampConeGroup = built.group.children[5];
    const lampConeMesh = lampConeGroup.children[0];
    // lamp carries NO sconce offset -> apex = 2.6; cone height = 2.6 - (-0.3) = 2.9
    check("2f. a LAMP light (no sconce offset) spans apex(=light.y)->floorTop", Math.abs(lampConeMesh.geometry.parameters.height - 2.9) < 1e-9, lampConeMesh.geometry.parameters.height);

    check("2g. flickerTargets carries exactly one entry per light, each wiring BOTH marker and cone",
      built.flickerTargets.length === 2 && built.flickerTargets.every((t) => t.marker && t.cone), JSON.stringify(built.flickerTargets.map((t) => ({ hasMarker: !!t.marker, hasCone: !!t.cone }))));
    check("2h. each flickerTarget's baseConeOpacity matches its own cone mesh's built opacity",
      built.flickerTargets[0].baseConeOpacity === torchConeMesh.material.opacity
      && built.flickerTargets[1].baseConeOpacity === lampConeMesh.material.opacity);

    // MUTATION: a lightless board must not throw and must produce zero cones/targets (proves the
    // per-light forEach is the source of the count, not a hardcoded "always 6" stub).
    const empty = interiorBuildLights([], 0, 0, null, null);
    check("2i. ⊗ MUTATION: an empty lights array yields zero children / zero flickerTargets (never throws)",
      empty.group.children.length === 0 && empty.flickerTargets.length === 0);
  }
}

// ============================================================================
// ITEM 3 — FLICKER SYNC: lightFlickerStep (pure tick function), fake-clock (mocked Math.random).
// ============================================================================
console.log("\n=== ITEM 3 — flicker sync (theater-boot.js source extraction, fake-clock) ===");
{
  const fn = extractFn(bootSrc, "lightFlickerStep");
  check("3a-setup. lightFlickerStep extracted from the real source", !!fn);

  if(fn){
    const factory = new Function(fn + "\nreturn lightFlickerStep;");
    const lightFlickerStep = factory();

    function makeTarget(baseIntensity, baseOpacity, baseConeOpacity){
      return {
        pl: { intensity: baseIntensity },
        marker: { material: { opacity: baseOpacity } },
        cone: { material: { opacity: baseConeOpacity } },
        baseIntensity, baseOpacity, baseConeOpacity,
        amplitude: 0.06
      };
    }

    const origRandom = Math.random;
    function withFakeRandom(seqOrConst, fn2){
      let i = 0;
      const seq = Array.isArray(seqOrConst) ? seqOrConst : [seqOrConst];
      Math.random = () => { const v = seq[i % seq.length]; i++; return v; };
      try { return fn2(); } finally { Math.random = origRandom; }
    }

    // 3b/3c: a single controlled tick (Math.random pinned to 0.9 for every draw) — marker and cone
    // must move by the IDENTICAL raw delta off their own (different) bases: proves the cone rides the
    // marker's own swing rather than an independently-rolled random of its own.
    let t1;
    withFakeRandom(0.9, () => {
      t1 = makeTarget(1.0, 0.85, 0.3);
      lightFlickerStep([], [], [t1], t1.amplitude);
    });
    const deltaMarker1 = t1.marker.material.opacity - t1.baseOpacity;
    const deltaCone1 = t1.cone.material.opacity - t1.baseConeOpacity;
    check("3b. FLICKER SYNC: marker and cone opacity move by the IDENTICAL delta off their own bases (tick 1)",
      Math.abs(deltaMarker1 - deltaCone1) < 1e-9, JSON.stringify({ deltaMarker1, deltaCone1 }));
    check("3c. tick 1 actually moved opacity away from base (not a vacuous zero-delta tick)",
      Math.abs(deltaMarker1) > 1e-6, deltaMarker1);

    // 3d: a SECOND, DIFFERENT controlled draw (0.1) reproduces the same "identical delta" property in
    // the OPPOSITE direction — proves 3b isn't a coincidence of one particular random draw.
    let t2;
    withFakeRandom(0.1, () => {
      t2 = makeTarget(1.0, 0.85, 0.3);
      lightFlickerStep([], [], [t2], t2.amplitude);
    });
    const deltaMarker2 = t2.marker.material.opacity - t2.baseOpacity;
    const deltaCone2 = t2.cone.material.opacity - t2.baseConeOpacity;
    check("3d. FLICKER SYNC holds on a second, oppositely-signed random draw too", Math.abs(deltaMarker2 - deltaCone2) < 1e-9, JSON.stringify({ deltaMarker2, deltaCone2 }));
    check("3e. the two controlled draws produced opposite-signed swings (0.9 vs 0.1 really drove different deltas)",
      Math.sign(deltaMarker1) !== Math.sign(deltaMarker2), JSON.stringify({ deltaMarker1, deltaMarker2 }));

    // 3f: determinism — the SAME fake-clock sequence reproduces byte-identical opacities.
    let t3;
    withFakeRandom(0.9, () => {
      t3 = makeTarget(1.0, 0.85, 0.3);
      lightFlickerStep([], [], [t3], t3.amplitude);
    });
    check("3f. DETERMINISM: the same fake-clock draw (0.9) reproduces the identical marker+cone opacity as tick 1",
      t3.marker.material.opacity === t1.marker.material.opacity && t3.cone.material.opacity === t1.cone.material.opacity);

    // 3g: null-safe — a target with no cone (pre-unit shape) must not throw, marker still updates.
    let t4;
    withFakeRandom(0.9, () => {
      t4 = { pl: { intensity: 1.0 }, marker: { material: { opacity: 0.85 } }, baseIntensity: 1.0, baseOpacity: 0.85, amplitude: 0.06 };
      lightFlickerStep([], [], [t4], t4.amplitude);
    });
    check("3g. ⊗ MUTATION/null-safety: a target with NO cone field never throws, and its marker still updates",
      t4.marker.material.opacity !== 0.85);

    // 3h: pl.intensity (the actual PointLight) rides the SAME raw per-tick delta the marker/cone are
    // derived from — the light itself takes the full delta, marker/cone take delta*0.5 (source's own
    // "the marker's own opacity is nudged by the same delta*0.5" convention) — so this asserts the
    // 2x proportionality, not a bare equality.
    const deltaIntensity1 = t1.pl.intensity - t1.baseIntensity;
    check("3h. the light's own pl.intensity moves by 2x the marker/cone swing (all three ride ONE underlying delta, marker/cone at half rate)",
      Math.abs(deltaIntensity1 - deltaMarker1 * 2) < 1e-9, JSON.stringify({ deltaIntensity1, deltaMarker1 }));
  }
}

// ============================================================================
// ITEM 4 — MOTE COUPLING: pool-bias measurement, the coordinate-shift fix, backward-compat.
// ============================================================================
console.log("\n=== ITEM 4 — mote coupling (theater-boot.js source-extraction sandbox) ===");
{
  const fns = ["moteHash32", "moteRng", "interiorMoteKindFor", "interiorBuildMotes"].map((n) => extractFn(bootSrc, n));
  check("4a-setup. all 4 mote functions extracted from the real source", fns.every(Boolean));
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
    const src = "const THREE = arguments[0];\n" + countMinLine + "\n" + sizeLine + "\n"
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
