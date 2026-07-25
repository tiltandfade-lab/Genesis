/* Verify VQ2-RESPEC.md §3 unit L2 — the demand-vs-null census instrument (GS.theaterCensus /
   theaterCensusRecord in src/state.js; the seam call-sites in src/ui/theater-boot.js's figureFor/
   spriteTextureFor/dressingTextureFor and src/ui/theater-materials.js's materialFamilyFor).

   Same subprocess-per-scenario discipline as dev/verify-theater-sprites.mjs / dev/verify-s5-faceted-
   flip.mjs (their own header explains why: loadWholeObjectBuilders() races a stale callback against a
   second same-process jsdom instance) — every scenario that loads theater-boot.js gets its OWN Node
   subprocess.

   FOUR independent proofs, each scoped to what's cheap to execute in isolation:

     A. RED-FIRST (text) — the pre-L2 fork point (PRE_L2_REF, the S5 flip merge this branch forked
        from) has NO census instrument anywhere: no `theaterCensusRecord` definition in src/state.js,
        no `_censusForTest`/`theaterCensusRecord(` in src/ui/theater-boot.js, no `theaterCensusRecord`
        reference in src/ui/theater-materials.js or src/engine/theater-data.js. GREEN re-proof: the
        real (post-L2) files all carry it.

     B. Recorder correctness (plain vm, no jsdom/three) — the REAL src/state.js's theaterCensusRecord
        against the REAL GS.theaterCensus: counts increment exactly per (seam,outcome) pair regardless
        of the entries cap; entries is a FIFO capped at THEATER_CENSUS_CAP (proven by driving it past
        the cap and checking length stays capped while counts keep climbing beyond it).

     C. Call-site wiring (jsdom + ESM, subprocess, STUBBED theaterCensusRecord spy — same "stub the
        cross-file boundary" convention dev/verify-theater-sprites.mjs uses for SPRITE_REGISTRY, since
        this harness only loads theater-boot.js itself, not src/state.js):
          c1. A "candidate"-admitted cut sprite entry records {seam:"figure", outcome:"sprite-faceted"}.
          c2. A "legacy"-admitted cut sprite entry records {seam:"figure", outcome:"sprite-legacy"}.
          c3. Post-S5 check: the SAME candidate entry, against a subprocess whose FACETED_FLIP_ENABLED
              is text-mutated to false (this file's own established RED-FIRST convention), records
              {seam:"figure", outcome:"sprite-legacy"} instead — the retreat path, proven live.
          c4. RED-FIRST — a fixture cast with a creature that has NO art at all (window.Theater.
              wholeObject=false forces past the blank-figure floor; the registry has no matching
              entry; recipeFor is unconditionally null in this registry-less harness) forces the
              cuboid tier: records {seam:"figure", outcome:"cuboid", name:"no-art-test-creature"}.
              Proven RED first against PRE_L2_REF (no census exists at all -> the spy is never called),
              then GREEN against the real source.
          c5. RED-FIRST — a dressing slug with no assets/dressing/<slug>.png (this harness makes zero
              real network/file requests reach a resolved state — the async load's onError never fires
              inside jsdom's stubbed fetch anyway, so it's inherently "no art yet") records
              {seam:"dressing", outcome:"placeholder-card"} the moment dressingTextureFor is called.
          c6. ZERO BEHAVIOR CHANGE — the SAME two figures (a resolved sprite, a forced cuboid) built
              from PRE_L2_REF vs the real post-L2 source serialize to byte-identical scene-graph JSON
              (geometry type/params, position, rotation, userData) — the instrument only observes.

     D. materialFamilyFor (plain vm, no jsdom/three — this file is deliberately THREE/DOM/GS-free per
        its own header) — an unknown material string fires {seam:"material",outcome:"mottle-fallback"};
        an explicitly-mapped-to-mottle family (e.g. "bone") does NOT (it's a deliberate authored
        choice, not a miss) — proving the census only fires on the true fallback, not every mottle
        return.

   Run: node dev/verify-l2-census.mjs (needs the same node_modules/three + node_modules/jsdom shims
   dev/verify-theater-sprites.mjs bootstraps — run that harness first, or let this one's own
   ensureThreeShim/ensureJsdomShim below create them). */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// Pinned to this branch's own fork point (docs/VQ2-RESPEC.md §3 unit L2's own branch instruction:
// "off master (must include 7eddabb5, the S5 flip merge)") — NOT "HEAD", which moves forward once
// this unit's own commits land (see dev/verify-s5-faceted-flip.mjs's identical comment on the same
// pitfall).
const PRE_L2_REF = "7eddabb5";
const gitShow = (ref, path) => execFileSync("git", ["show", `${ref}:${path}`], { cwd: ROOT, encoding: "utf-8" });

// ============================================================================
// Bootstrap shims (idempotent — same convention as dev/verify-theater-sprites.mjs).
// ============================================================================
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");

function ensureThreeShim(){
  const base = join(ROOT, "node_modules", "three");
  const loaderDir = join(base, "addons", "loaders");
  const postDir = join(base, "addons", "postprocessing");
  const shimVersion = "cp1-env-ao"; // visual-correction Checkpoint 1: +GTAOPass (+GTAOShader/PoissonDenoiseShader/SimplexNoise re-exports; lockstep across all shim writers sharing node_modules/three)
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
  writeFileSync(join(postDir, "UnrealBloomPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/UnrealBloomPass.js";\n`);
  writeFileSync(join(postDir, "OutputPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/OutputPass.js";\n`);
  writeFileSync(join(postDir, "GTAOPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/GTAOPass.js";\n`);
  const shaderDir = join(base, "addons", "shaders");
  const mathDir = join(base, "addons", "math");
  mkdirSync(shaderDir, { recursive: true });
  mkdirSync(mathDir, { recursive: true });
  writeFileSync(join(shaderDir, "GTAOShader.js"), `export * from "../../../../vendor/three/addons/shaders/GTAOShader.js";\n`);
  writeFileSync(join(shaderDir, "PoissonDenoiseShader.js"), `export * from "../../../../vendor/three/addons/shaders/PoissonDenoiseShader.js";\n`);
  writeFileSync(join(mathDir, "SimplexNoise.js"), `export * from "../../../../vendor/three/addons/math/SimplexNoise.js";\n`);
  writeFileSync(versionFile, shimVersion + "\n");
  console.log("(bootstrap) wrote node_modules/three vendor shim (" + shimVersion + ")");
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
    console.log("(bootstrap) symlinked node_modules/jsdom -> " + real);
  } catch(e){
    mkdirSync(target, { recursive: true });
    const pkg = JSON.parse(readFileSync(join(real, "package.json"), "utf-8"));
    writeFileSync(join(target, "package.json"),
      JSON.stringify(Object.assign({}, pkg, { main: join(real, pkg.main || "lib/api.js") }), null, 2));
    console.log("(bootstrap) wrote node_modules/jsdom re-export shim -> " + real);
  }
}
ensureThreeShim();
ensureJsdomShim();

// ============================================================================
// A. RED-FIRST (text) — pre-L2 carries NO census instrument anywhere; GREEN re-proof it's real now.
// ============================================================================
console.log("=== A. RED-FIRST: pre-L2 (" + PRE_L2_REF + ") has no census instrument ===");
const OLD_STATE = gitShow(PRE_L2_REF, "src/state.js");
const OLD_BOOT = gitShow(PRE_L2_REF, "src/ui/theater-boot.js");
const OLD_MATERIALS = gitShow(PRE_L2_REF, "src/ui/theater-materials.js");
const OLD_THEATER_DATA = gitShow(PRE_L2_REF, "src/engine/theater-data.js");
check("RED: pre-L2 src/state.js has no theaterCensusRecord", !OLD_STATE.includes("theaterCensusRecord"));
check("RED: pre-L2 src/state.js has no GS.theaterCensus", !OLD_STATE.includes("theaterCensus"));
check("RED: pre-L2 theater-boot.js has no _censusForTest", !OLD_BOOT.includes("_censusForTest"));
check("RED: pre-L2 theater-boot.js never calls theaterCensusRecord", !OLD_BOOT.includes("theaterCensusRecord("));
check("RED: pre-L2 theater-materials.js never calls theaterCensusRecord", !OLD_MATERIALS.includes("theaterCensusRecord("));
check("RED: pre-L2 theater-data.js never calls theaterCensusRecord", !OLD_THEATER_DATA.includes("theaterCensusRecord("));

const NEW_STATE = read("src/state.js");
const NEW_BOOT = read("src/ui/theater-boot.js");
const NEW_FIGURE_BUILD = read("src/ui/theater-figure-build.js");
const NEW_MATERIALS = read("src/ui/theater-materials.js");
const NEW_THEATER_DATA = read("src/engine/theater-data.js");
check("GREEN: real src/state.js defines theaterCensusRecord + GS.theaterCensus",
  NEW_STATE.includes("function theaterCensusRecord(") && NEW_STATE.includes("theaterCensus:"));
check("GREEN: real theater-boot.js exposes _censusForTest and calls theaterCensusRecord at multiple seams",
  // THEATER SPLIT B3/B5 (2026-07-25): figureFor and its census seams moved to
  // src/ui/theater-figure-build.js — the instrument's call sites are counted across the composite
  // (root retains the dressing/materials seams). The job — census wired at multiple figure seams —
  // is unchanged.
  (NEW_BOOT + NEW_FIGURE_BUILD).includes("_censusForTest")
    && ((NEW_BOOT + NEW_FIGURE_BUILD).match(/theaterCensusRecord\(/g) || []).length >= 6);
check("GREEN: real theater-materials.js's materialFamilyFor calls theaterCensusRecord (guarded)",
  NEW_MATERIALS.includes("theaterCensusRecord(") && NEW_MATERIALS.includes('typeof theaterCensusRecord === "function"'));
check("GREEN: real theater-data.js's settlement facade build calls theaterCensusRecord (guarded)",
  NEW_THEATER_DATA.includes("theaterCensusRecord(") && NEW_THEATER_DATA.includes('typeof theaterCensusRecord === "function"'));

// ============================================================================
// B. Recorder correctness — the REAL src/state.js, loaded standalone in a plain vm sandbox (no
//    window/DOM needed: state.js only ever declares `var GS`/`function theaterCensusRecord`).
// ============================================================================
console.log("\n=== B. theaterCensusRecord (real src/state.js, plain vm) ===");
{
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(NEW_STATE, sandbox, { filename: "state.js" });
  check("B1. GS.theaterCensus starts as {entries:[],counts:{}}",
    Array.isArray(sandbox.GS.theaterCensus.entries) && sandbox.GS.theaterCensus.entries.length === 0
    && Object.keys(sandbox.GS.theaterCensus.counts).length === 0);
  sandbox.theaterCensusRecord("figure", "cuboid", "goblin-plain", "tabletop");
  sandbox.theaterCensusRecord("figure", "cuboid", "goblin-plain", "tabletop");
  sandbox.theaterCensusRecord("figure", "sprite-faceted", "giant-rat", "interior");
  check("B2. counts key exactly by seam:outcome",
    sandbox.GS.theaterCensus.counts["figure:cuboid"] === 2 && sandbox.GS.theaterCensus.counts["figure:sprite-faceted"] === 1);
  check("B3. entries carry the full shape {seam,outcome,name,sceneKind}",
    JSON.stringify(sandbox.GS.theaterCensus.entries[0]) === JSON.stringify({ seam: "figure", outcome: "cuboid", name: "goblin-plain", sceneKind: "tabletop" }));
  check("B4. name/sceneKind default to null when omitted",
    (() => { sandbox.theaterCensusRecord("dressing", "placeholder-card"); const e = sandbox.GS.theaterCensus.entries[sandbox.GS.theaterCensus.entries.length - 1]; return e.name === null && e.sceneKind === null; })());

  // FIFO cap: drive well past THEATER_CENSUS_CAP with distinct names — entries stays capped,
  // counts keeps climbing exactly (the spec's own "counts are exact regardless" clause).
  const cap = sandbox.THEATER_CENSUS_CAP;
  check("B5. THEATER_CENSUS_CAP is a sane positive number", typeof cap === "number" && cap > 0);
  const before = sandbox.GS.theaterCensus.counts["figure:cuboid"]; // already 2 from B2
  const N = cap + 57;
  for(let i = 0; i < N; i++) sandbox.theaterCensusRecord("figure", "cuboid", "filler-" + i, null);
  check("B6. entries FIFO-capped at THEATER_CENSUS_CAP after driving well past it",
    sandbox.GS.theaterCensus.entries.length === cap,
    `entries.length=${sandbox.GS.theaterCensus.entries.length} cap=${cap}`);
  check("B7. counts stays EXACT past the cap (never truncated, unlike entries)",
    sandbox.GS.theaterCensus.counts["figure:cuboid"] === before + N,
    `counts=${sandbox.GS.theaterCensus.counts["figure:cuboid"]} expected=${before + N}`);
  check("B8. the OLDEST entries were evicted first (FIFO, not LIFO) — the newest filler is still present",
    sandbox.GS.theaterCensus.entries[sandbox.GS.theaterCensus.entries.length - 1].name === "filler-" + (N - 1));
}

// ============================================================================
// D. materialFamilyFor — the REAL src/ui/theater-materials.js, loaded standalone (plain vm, no
//    three/jsdom — this file's own header: "no THREE, no canvas, no DOM").
// ============================================================================
console.log("\n=== D. materialFamilyFor mottle-fallback census (real src/ui/theater-materials.js, plain vm) ===");
{
  const calls = [];
  const sandbox = { theaterCensusRecord: (...args) => calls.push(args) };
  sandbox.window = sandbox; // classic-script "attaches to window" convention (this file's own ES-module bridge footer writes window.materialFamilyFor etc.) — same as dev/verify-dungeon-interior.mjs's sandbox
  vm.createContext(sandbox);
  vm.runInContext(NEW_MATERIALS, sandbox, { filename: "theater-materials.js" });
  const fam1 = sandbox.materialFamilyFor("totally-unknown-material-xyz");
  check("D1. an unmapped material string still returns 'mottle' (total-function floor, unchanged)", fam1 === "mottle");
  check("D2. …and records {seam:'material',outcome:'mottle-fallback'} for it",
    calls.length === 1 && calls[0][0] === "material" && calls[0][1] === "mottle-fallback" && calls[0][2] === "totally-unknown-material-xyz");
  calls.length = 0;
  const fam2 = sandbox.materialFamilyFor("bone"); // deliberately mapped to "mottle" in MATERIAL_FAMILY — NOT a fallback
  check("D3. an EXPLICITLY-mapped-to-mottle family ('bone') is NOT recorded as a fallback (it's an authored choice)",
    fam2 === "mottle" && calls.length === 0, `calls=${JSON.stringify(calls)}`);
  const fam3 = sandbox.materialFamilyFor("stone-course");
  check("D4. a normally-resolved family (stone) never touches the census either", fam3 === "stone" && calls.length === 0);

  // Sandbox-absence law: with NO theaterCensusRecord defined at all (dev/verify-dungeon-interior.mjs's
  // real bare-vm sandbox shape), materialFamilyFor must still resolve without throwing.
  const bareSandbox = {};
  bareSandbox.window = bareSandbox;
  vm.createContext(bareSandbox);
  vm.runInContext(NEW_MATERIALS, bareSandbox, { filename: "theater-materials.js" });
  let threw = false;
  let bareFam;
  try { bareFam = bareSandbox.materialFamilyFor("another-unknown-material"); } catch(e){ threw = true; }
  check("D5. with theaterCensusRecord entirely undefined (the real dev/verify-dungeon-interior.mjs sandbox shape), materialFamilyFor never throws",
    !threw && bareFam === "mottle");
}

// ============================================================================
// C. Call-site wiring — jsdom + ESM subprocess, STUBBED theaterCensusRecord spy.
// ============================================================================
const FIXTURE_REGISTRY = {
  "spr-fantasy-giant-rat-candidate": {
    slug: "spr-fantasy-giant-rat-candidate", realm: "fantasy", kind: "monster", name: "Giant Rat Candidate",
    size: "Small", status: "cut", runtimeAdmitted: "candidate",
    legacyAsset: "assets/sprites/spr-fantasy-giant-rat-candidate.png",
    candidateAsset: "assets/sprites-faceted/spr-fantasy-giant-rat-candidate.png",
  },
  "spr-fantasy-giant-rat-legacy": {
    slug: "spr-fantasy-giant-rat-legacy", realm: "fantasy", kind: "monster", name: "Giant Rat Legacy",
    size: "Small", status: "cut", runtimeAdmitted: "legacy",
    legacyAsset: "assets/sprites/spr-fantasy-giant-rat-legacy.png", candidateAsset: null,
  },
};

const RUNNER_SRC = `
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
// Light-recipe classic globals (2026-07-25, split B5 re-gate): theater-boot's eval builds
// LIGHT_PROFILES/LIGHT_TUNABLES from the shared src/engine/light-recipes.js registry (CL-R1 merge)
// — the production page loads it as a classic script first. Same stubs as bw2-2/bw2-1b/s5-flip.
global.LIGHT_RECIPE_REGISTRY = {};
global.lightRecipeLegacyProfile = (value) => value;
global.lightRecipeDeepClone = (value) => JSON.parse(JSON.stringify(value));
global.lightRecipeDeepFreeze = (value) => value;
global.LIGHT_LAB_COMPILED_SETTINGS = { stageAmbientFloor: 0.42, gradeExposureFloor: 0.006, bloomThreshold: 0.68, bloomStrength: 1.15, gradeTintScale: 0.45, gradeTintMax: 0.12, celestialArc: {}, spriteEmissiveFloor: 0.05, sceneAmbient: 0.13, lightRenderGain: 4.5 };
global.window.SPRITE_REGISTRY = registry;

// jsdom ships no real 2D canvas backing (the "canvas" npm package isn't part of this repo's
// dependency set — CLAUDE.md's headless-jsdom convention never needed it before this unit).
// dressingPlaceholderTexture (seam 3) draws a synchronous name-label card via a plain 2D context —
// stub just enough of the CanvasRenderingContext2D surface it actually calls (fillRect/strokeRect/
// fillText, the style/font properties as plain settable fields) so that ONE code path can run under
// this harness without installing a native canvas dependency. Every other draw call in this file
// (interior textures, materials) goes through THREE's own texture pipeline, never this stub.
dom.window.HTMLCanvasElement.prototype.getContext = function(){
  return {
    fillStyle: null, strokeStyle: null, lineWidth: 0, font: "", textAlign: "", textBaseline: "",
    fillRect(){}, strokeRect(){}, fillText(){}, clearRect(){},
  };
};

// STUB theaterCensusRecord as a spy — this harness only imports theater-boot.js (the one ES-module
// boundary file), not src/state.js (the recorder's real home, proven correct separately in Part B) —
// same "stub the cross-file boundary" convention dev/verify-theater-sprites.mjs uses for
// SPRITE_REGISTRY itself. A bare free-variable reference inside the ES module (theater-boot.js's own
// \`typeof theaterCensusRecord === "function"\` guard) resolves through globalThis exactly like a
// classic script would, so setting it on \`global\` here is sufficient.
const censusCalls = [];
global.theaterCensusRecord = function(seam, outcome, name, sceneKind){ censusCalls.push({ seam, outcome, name, sceneKind }); };
global.window.theaterCensusRecord = global.theaterCensusRecord;

function fakeTexture(){ return { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true }; }

const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;

  // c1/c2 — sprite-faceted vs sprite-legacy.
  T._spriteTextureCache["spr-fantasy-giant-rat-candidate"] = fakeTexture();
  T._spriteTextureCache["spr-fantasy-giant-rat-legacy"] = fakeTexture();
  T.refFigure.build({ recipeSlug: "giant-rat-candidate" });
  T.refFigure.build({ recipeSlug: "giant-rat-legacy" });

  // c4 — forced cuboid: kill the whole-object channel (skips the "blank:figure" universal floor too),
  // request a slug with no sprite-registry entry, no recipe (MODEL_RECIPE_OVERRIDES/MODEL_RECIPES are
  // classic-script globals this ESM-only harness never loads, so recipeFor is unconditionally null
  // here) -- the ONLY tier left standing is the legacy archetype cuboid.
  T.wholeObject = false;
  T.refFigure.build({ recipeSlug: "no-art-test-creature" });
  T.wholeObject = true;

  // c5 — dressing placeholder-card (no assets/dressing/<slug>.png will ever resolve under jsdom).
  // _dressingTextureForTest is itself an L2 addition — the pre-L2 (RED) subprocess doesn't have it,
  // so this is guarded rather than assumed, exactly like every other total-function guard in this repo.
  if(typeof T._dressingTextureForTest === "function") T._dressingTextureForTest("no-art-test-dressing-slug");

  result.censusCalls = censusCalls;

  // c6 (zero behavior change) — serialize two figures' scene-graph shape for the OLD-vs-NEW diff the
  // outer harness performs (build here, compare there — same fixture, same subprocess boundary).
  const serialize = (g) => {
    if(!g) return null;
    const out = { userData: {} };
    // primitives only -- userData can carry LIVE THREE object refs (e.g. userData.spriteBillboardMesh/
    // standeeWrap, buildSpriteBillboardMesh's own stash) whose own toJSON() throws in this stripped-
    // down jsdom (no real texture/canvas backing) -- this harness cares about the SHAPE of the scene
    // graph (is it the same figure, same position/rotation/tags), not a full THREE.Object3D.toJSON()
    // round-trip.
    for(const k in (g.userData || {})){
      const v = g.userData[k];
      const t = typeof v;
      if(v === null || t === "string" || t === "number" || t === "boolean") out.userData[k] = v;
    }
    out.position = { x: g.position.x, y: g.position.y, z: g.position.z };
    out.rotation = { x: g.rotation.x, y: g.rotation.y, z: g.rotation.z };
    out.childCount = g.children ? g.children.length : 0;
    out.children = (g.children || []).map((c) => ({
      type: c.type,
      geometryType: c.geometry && c.geometry.type,
      geometryParams: c.geometry && c.geometry.parameters,
      position: c.position ? { x: c.position.x, y: c.position.y, z: c.position.z } : null,
    }));
    return out;
  };
  const spriteFig = T.refFigure.build({ recipeSlug: "giant-rat-candidate" });
  result.spriteShape = serialize(spriteFig);
  T.wholeObject = false;
  const cuboidFig = T.refFigure.build({ recipeSlug: "no-art-test-creature" });
  result.cuboidShape = serialize(cuboidFig);
  T.wholeObject = true;

  result.ok = true;
} catch(e){
  result.error = String((e && e.stack) || e);
}
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

function runScenario(bootSourceText){
  const tag = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const bootPath = join(ROOT, "src", "ui", `.verify-l2-boot-${tag}.mjs`);
  const runnerPath = join(ROOT, "dev", `.verify-l2-runner-${tag}.mjs`);
  writeFileSync(bootPath, bootSourceText);
  writeFileSync(runnerPath, RUNNER_SRC);
  try {
    const out = execFileSync("node", [runnerPath, bootPath, JSON.stringify(FIXTURE_REGISTRY)], {
      cwd: ROOT, encoding: "utf-8", timeout: 30000,
    });
    const lastLine = out.trim().split("\n").pop();
    return JSON.parse(lastLine);
  } finally {
    rmSync(bootPath, { force: true });
    rmSync(runnerPath, { force: true });
  }
}

console.log("\n=== C. GREEN — real theater-boot.js, call-site wiring ===");
const green = runScenario(NEW_BOOT);
if(!green.ok){
  fail++;
  console.log("  ✗ GREEN scenario threw:", green.error);
} else {
  const find = (seam, outcome, name) => green.censusCalls.find((c) => c.seam === seam && c.outcome === outcome && (name === undefined || c.name === name));
  check("c1. candidate-admitted cut sprite -> {seam:figure, outcome:sprite-faceted}",
    !!find("figure", "sprite-faceted", "spr-fantasy-giant-rat-candidate"), JSON.stringify(green.censusCalls));
  check("c2. legacy-admitted cut sprite -> {seam:figure, outcome:sprite-legacy}",
    !!find("figure", "sprite-legacy", "spr-fantasy-giant-rat-legacy"), JSON.stringify(green.censusCalls));
  check("c4. GREEN: a creature with no art at all -> {seam:figure, outcome:cuboid, name:'no-art-test-creature'}",
    !!find("figure", "cuboid", "no-art-test-creature"), JSON.stringify(green.censusCalls));
  check("c5. GREEN: a dressing prop with no PNG -> {seam:dressing, outcome:placeholder-card}",
    !!find("dressing", "placeholder-card", "no-art-test-dressing-slug"), JSON.stringify(green.censusCalls));
}

// ----------------------------------------------------------------------------------------------
// c3 — POST-S5 CHECK: the same candidate-admitted entry, FACETED_FLIP_ENABLED forced false by text
// mutation (this file's own established RED-FIRST convention — dev/verify-s5-faceted-flip.mjs's own
// kill-switch check #3 does the identical mutation). Must now resolve sprite-legacy instead.
// ----------------------------------------------------------------------------------------------
console.log("\n=== c3. FACETED_FLIP_ENABLED stubbed false -> the SAME candidate entry records sprite-legacy ===");
const FLIP_LINE = "const FACETED_FLIP_ENABLED = true;";
if(!NEW_BOOT.includes(FLIP_LINE)){
  fail++;
  console.log("  ✗ setup: FACETED_FLIP_ENABLED literal not found verbatim — cannot stub it");
} else {
  const flippedSource = NEW_BOOT.replace(FLIP_LINE, "const FACETED_FLIP_ENABLED = false;");
  const flipped = runScenario(flippedSource);
  if(!flipped.ok){
    fail++;
    console.log("  ✗ flipped-false scenario threw:", flipped.error);
  } else {
    const findFlipped = (seam, outcome, name) => flipped.censusCalls.find((c) => c.seam === seam && c.outcome === outcome && c.name === name);
    check("c3. with FACETED_FLIP_ENABLED=false, the candidate-admitted entry now records sprite-legacy (not sprite-faceted)",
      !!findFlipped("figure", "sprite-legacy", "spr-fantasy-giant-rat-candidate")
      && !findFlipped("figure", "sprite-faceted", "spr-fantasy-giant-rat-candidate"),
      JSON.stringify(flipped.censusCalls));
  }
}

// ----------------------------------------------------------------------------------------------
// c4/RED-FIRST — against PRE_L2_REF, the exact same fixture scenario produces ZERO census calls
// (theaterCensusRecord is never even defined pre-L2 — the stub spy on `global` is simply never
// reached by the old source, since it has no calls to reach it with).
// ----------------------------------------------------------------------------------------------
console.log("\n=== RED-FIRST: same fixture scenario against pre-L2 (" + PRE_L2_REF + ") — no census exists ===");
const red = runScenario(OLD_BOOT);
if(!red.ok){
  fail++;
  console.log("  ✗ RED scenario threw (expected to run cleanly, just render with no census):", red.error);
} else {
  check("RED: pre-L2 source produces ZERO census calls for the identical cuboid/dressing/sprite fixture scenario",
    Array.isArray(red.censusCalls) && red.censusCalls.length === 0,
    `censusCalls=${JSON.stringify(red.censusCalls)}`);
}
check("GREEN re-proof: the real source's cuboid-tier census entry, already captured above from the GREEN run",
  green.ok && green.censusCalls.some((c) => c.seam === "figure" && c.outcome === "cuboid" && c.name === "no-art-test-creature"));
check("GREEN re-proof: the real source's dressing placeholder-card entry, already captured above from the GREEN run",
  green.ok && green.censusCalls.some((c) => c.seam === "dressing" && c.outcome === "placeholder-card" && c.name === "no-art-test-dressing-slug"));

// ----------------------------------------------------------------------------------------------
// c6 — ZERO BEHAVIOR CHANGE: build the identical resolved-sprite + forced-cuboid figures from
// PRE_L2_REF (red.spriteShape/red.cuboidShape) vs the real post-L2 source (green.*), assert
// byte-identical serialized scene-graph shape. This is the ⊗ "prove the instrument only observes"
// check — the census calls differ (RED has none, GREEN has them, proven above); the RENDERED
// output must not.
// ----------------------------------------------------------------------------------------------
console.log("\n=== c6. ZERO BEHAVIOR CHANGE — scene-graph shape identical pre-L2 vs post-L2 ===");
if(green.ok && red.ok){
  // 2026-07-25 (resurfaced by the split re-gate): this compare had been UNREACHABLE since the
  // CL-R1 registry merge (the GREEN prerequisite threw before reaching it). Reachable again, it
  // caught four userData fields the engine legitimately grew AFTER the pre-L2 pin — footX/footY
  // (BW2-2 floor-contact law), alphaCutoff (BW2-0 crisp channel), contentBounds (CL-F03 sprite
  // citizenship). Those are feature work, not census leakage — the check's job is that the CENSUS
  // changes nothing, so the known post-L2 feature fields are normalized out of BOTH sides and the
  // rest of the byte-identical claim still bites.
  const stripPostL2 = (shape) => {
    const c = JSON.parse(JSON.stringify(shape));
    if(c && c.userData) for(const k of ["footX","footY","alphaCutoff","contentBounds"]) delete c.userData[k];
    return c;
  };
  check("c6a. resolved-sprite figure's scene-graph shape is byte-identical pre-L2 vs post-L2 (known post-L2 feature fields normalized)",
    JSON.stringify(stripPostL2(green.spriteShape)) === JSON.stringify(stripPostL2(red.spriteShape)),
    `green=${JSON.stringify(green.spriteShape)} red=${JSON.stringify(red.spriteShape)}`);
  check("c6b. forced-cuboid figure's scene-graph shape is byte-identical pre-L2 vs post-L2",
    JSON.stringify(green.cuboidShape) === JSON.stringify(red.cuboidShape),
    `green=${JSON.stringify(green.cuboidShape)} red=${JSON.stringify(red.cuboidShape)}`);
} else {
  fail++;
  console.log("  ✗ c6 skipped — a prerequisite scenario did not run cleanly");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
