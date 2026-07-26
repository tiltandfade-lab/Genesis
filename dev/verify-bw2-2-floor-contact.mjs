/* Verify BW2-2 EXPANDED — THE FLOOR CONTACT LAW + STANDEE BASES (docs/BEAUTY-WAVE-2.md unit BW2-2,
   expanded per Adam's live-play bug: "that wolf man was halfway in the floor" + the orchestrator's
   beauty-shot burial evidence, dev/battle-gate/beauty-shot/vp8-loop-02-hurt.png).

   PART A MECHANISM (checks 1-4, THREE/DOM-free data layer, mirrors dev/verify-dungeon-interior.mjs's
   own vm-sandbox convention): every interior floor tile is an InstancedMesh box whose bottom is pinned
   to y=-0.5 and whose TOP grows upward by the tile's own authored thickness `sy`
   (interiorBuildInstancedMesh's position.y = sy/2-0.5, so top = sy-0.5 — never -0.5 itself unless
   sy===0, which theater-interior.js's ITR_FLOOR_HEIGHT=0.2 default never emits). Checks 1-4 prove this
   against REAL interiorBuildBoard output (no theater-boot.js/THREE needed) — every floor cell's own
   derived top sits strictly ABOVE the pre-BW2-2 hardcoded -0.5, and VP3's micro-step channel makes that
   gap VARY per cell (the "varying depth by creature" the orchestrator's evidence named).

   PART B (checks 10-39, jsdom + vendored THREE, the SAME process-isolated subprocess pattern
   dev/verify-dungeon-interior.mjs's checks 22-32 established for this sealed ES-module file) proves the
   FIX: the derived law replaces every hardcoded -0.5/-0.4/-0.495/-0.49/-0.48 mount point (pieces, combat
   units, dressing, decals, contact pools, standee bases, the acting ring), standee bases exist with the
   spec'd radius/height, the contact pool is a soft multiplicative gradient (not a flat disc), the
   acting ring wraps the base rim, and fall-death's corpse tip keeps the base attached to the tipping
   standee (one group).

   RED-FIRST (checked against f03cd4ed, the master tip immediately before this unit): `grep -c
   "interiorFloorTopAt\|INTERIOR_BASE_HEIGHT" src/ui/theater-boot.js` -> 0 (neither the law nor the base
   existed); every piece/unit mount was the literal `-0.5 - floorFrac*height` this file's own git history
   shows. Checks 20/31 below re-derive that pre-fix formula's own arithmetic independently and prove it
   sits BELOW the fixed source's own floor top by exactly the cell's own sy — the measured burial.

   GL-layer checks this harness deliberately does NOT reimplement (no WebGLRenderer in jsdom): the
   gradient pool's actual PIXEL content (sampled in a live Chrome instead — see this unit's own report)
   and the loop-gate's re-shot beauty frames (dev/battle-gate/capture-dungeon-loop.mjs, re-run separately,
   pixel-scanned for zero sprite pixels below the floor seam).

   Run:  node dev/verify-bw2-2-floor-contact.mjs */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, execSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

// ============================================================================
// PART A — data-layer mechanism proof (vm sandbox, no THREE/jsdom needed)
// ============================================================================
function loadDataLayer() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/ui/theater-interior.js"),
    read("src/ui/theater-materials.js"),
    ";this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "bw2-2-data-layer.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    interiorBuildBoard: sandbox.__interiorBuildBoard,
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
// BEAUTY-WAVE-2.md BW2-5 (FINALE DAIS): a finale room's center cells now carry a SECOND, deliberate,
// much larger floor-height override (ITR_FLOOR_HEIGHT + ITR_DAIS_STEP*{1,2} = up to 0.6) — a real
// staged platform, not VP3's random micro-jitter. src/engine/place-semantics.js's dsmFindFinale ALWAYS
// names exactly one finale room per plan (falls back to the deepest room if no segment sets isFinale)
// — there is no such thing as a "no finale room" SpatialPlan, so checks 2/3 below (scoped to proving
// VP3's OWN mechanism/the pre-BW2-2 burial diagnosis specifically, both pre-dating BW2-5) filter the
// finale room's OWN cells out of their measurement instead — isolating VP3's step channel from BW2-5's
// separate, deliberately-larger dais feature (whose own structural/bound assertions live in
// dev/verify-bw2-5-silhouette.mjs) without either lying (widening the bound to silently swallow it) or
// wrongly red-flagging a real, separately-documented feature as a regression here.
function nonFinaleFloorCells(plan, board) {
  const finaleRoom = (plan.rooms || []).find((r) => r.role === "finale");
  if (!finaleRoom) return board.instances.floor; // degenerate/no-role plan — nothing to exclude
  return board.instances.floor.filter((f) => !(
    f.x >= finaleRoom.x && f.x < finaleRoom.x + finaleRoom.w &&
    f.z >= finaleRoom.y && f.z < finaleRoom.y + finaleRoom.d
  ));
}

const M = loadDataLayer();

group("1 — MECHANISM: every real floor cell's own derived top (sy-0.5) sits strictly ABOVE the pre-BW2-2 hardcoded y=-0.5 (sy is never 0)");
{
  const fixture = buildChainFixture(24);
  const plan = M.semanticizePlan(M.spatializePlan(fixture, "The Spine", { walkId: "bw2-2-mechanism" }), fixture, []);
  const board = M.interiorBuildBoard(plan, { realmId: "gloom" });
  ok(board.instances.floor.length > 0, `plan produced floor instances (${board.instances.floor.length})`);
  const zeroOrBelow = board.instances.floor.filter((f) => !(f.sy > 0));
  ok(zeroOrBelow.length === 0, `0 of ${board.instances.floor.length} floor instances carry sy<=0 (every real cell's top sits above -0.5)`);
  const tops = board.instances.floor.map((f) => f.sy - 0.5);
  ok(tops.every((t) => t > -0.5), "every derived floor top > -0.5 (the pre-BW2-2 hardcoded plane)");
  console.log(`  measured floor tops: min=${Math.min(...tops).toFixed(3)} max=${Math.max(...tops).toFixed(3)} (pre-BW2-2 hardcode was exactly -0.5 for every cell)`);
}

group("2 — MECHANISM: VP3's micro-step channel makes the floor top VARY per cell (the 'varying depth by creature' evidence) — swept across seeds so this isn't a lucky single roll");
{
  let sawVariation = false;
  let sampleMinSy = Infinity, sampleMaxSy = -Infinity;
  for (let seed = 0; seed < 12 && !sawVariation; seed++) {
    const fixture = buildChainFixture(30);
    const plan = M.semanticizePlan(M.spatializePlan(fixture, "The Spine", { walkId: "bw2-2-variation-" + seed }), fixture, []);
    const board = M.interiorBuildBoard(plan, { realmId: seed % 2 ? "fantasy" : "chrome" });
    const sys = nonFinaleFloorCells(plan, board).map((f) => f.sy); // BW2-5: excludes the finale room's own dais cells
    const mn = Math.min(...sys), mx = Math.max(...sys);
    if (mx - mn > 1e-9) { sawVariation = true; sampleMinSy = mn; sampleMaxSy = mx; }
  }
  ok(sawVariation, "at least one of 12 seeded plans shows floor sy variation across its own cells (VP3's step channel is live, not dead code)");
  if (sawVariation) {
    console.log(`  sample variation: sy in [${sampleMinSy.toFixed(3)}, ${sampleMaxSy.toFixed(3)}] -> floor top in [${(sampleMinSy - 0.5).toFixed(3)}, ${(sampleMaxSy - 0.5).toFixed(3)}]`);
    ok(sampleMinSy >= 0.2 - 0.08 - 1e-9 && sampleMaxSy <= 0.2 + 0.08 + 1e-9, `variation stays within the documented ITR_FLOOR_HEIGHT(0.2) +/- ITR_STEP_MAX(0.08) bounds`);
  }
}

group("3 — RED-FIRST NUMBERS: re-deriving the pre-BW2-2 mount formula's own arithmetic proves the measured burial matches the diagnosis (0.12-0.28 world units, nominal 0.2)");
{
  const fixture = buildChainFixture(24);
  const plan = M.semanticizePlan(M.spatializePlan(fixture, "The Spine", { walkId: "bw2-2-burial-numbers" }), fixture, []);
  const board = M.interiorBuildBoard(plan, { realmId: "gloom" });
  // pre-BW2-2: every standee's feet planted at OLD_Y = -0.5 (floorFrac=0 fixture, the common case).
  // burial = (this cell's real floor top) - OLD_Y = (sy-0.5) - (-0.5) = sy.
  const OLD_Y = -0.5;
  const burials = nonFinaleFloorCells(plan, board).map((f) => (f.sy - 0.5) - OLD_Y); // BW2-5: excludes the finale room's own dais cells
  ok(burials.every((b) => b > 0), "every cell's pre-BW2-2 burial (floor top minus the old fixed -0.5 mount) is strictly positive");
  ok(Math.min(...burials) >= 0.12 - 1e-9 && Math.max(...burials) <= 0.28 + 1e-9,
    `burial range [${Math.min(...burials).toFixed(3)}, ${Math.max(...burials).toFixed(3)}] matches the diagnosed 0.12-0.28 world-unit band (ITR_FLOOR_HEIGHT 0.2 +/- ITR_STEP_MAX 0.08)`);
}

group("4 — determinism: the mechanism numbers are stable (same plan,opts -> byte-identical floor sy array)");
{
  const fixture = buildChainFixture(16);
  const planA = M.semanticizePlan(M.spatializePlan(fixture, "The Spine", { walkId: "bw2-2-det" }), fixture, []);
  const planB = M.semanticizePlan(M.spatializePlan(fixture, "The Spine", { walkId: "bw2-2-det" }), fixture, []);
  const boardA = M.interiorBuildBoard(planA, { realmId: "ash" });
  const boardB = M.interiorBuildBoard(planB, { realmId: "ash" });
  ok(JSON.stringify(boardA.instances.floor) === JSON.stringify(boardB.instances.floor), "floor sy array is byte-identical across two independent builds of the same (plan,opts)");
}

group("5 — RED-FIRST/GREEN (BW2-2b item 1, text-proof): today's face() tilts the sprite's inner wrap, never the outer group directly — a base mounted as the outer group's own sibling child stays floor-flat");
{
  // RED-FIRST: the merge tip immediately before this unit (d22e4d73, 'Merge docs/bw2-2b-spec' — the
  // BW2-2b SPEC landing without any code yet) had the bug this unit fixes: updateSpriteBillboardYaw's
  // face() stamped the camera-pitch tilt straight onto the OUTER group, which a plinth base (a plain
  // CHILD of that same group, per BW2-2's own buildInteriorBase call sites) inherited wholesale.
  let preFixFace = "";
  try {
    preFixFace = execSync("git show d22e4d73:src/ui/theater-boot.js", { cwd: ROOT, maxBuffer: 1024 * 1024 * 64 }).toString();
  } catch (e) { preFixFace = ""; }
  const preFixMatch = preFixFace.match(/function face\(fig\)\{[^}]*\}/);
  ok(!!preFixMatch, "RED-FIRST: could extract the pre-fix face() body from d22e4d73");
  ok(!!preFixMatch && /fig\.rotation\.x\s*=\s*tilt/.test(preFixMatch[0]),
    `RED-FIRST: the pre-fix face() body directly wrote fig.rotation.x = tilt on the OUTER group (the bug) — body: ${preFixMatch && preFixMatch[0]}`);

  // GREEN: today's real source splits the tilt onto the wrap; the outer group's rotation.x is never
  // unconditionally assigned `tilt` inside face() anymore.
  // THEATER SPLIT B7 (2026-07-25): updateSpriteBillboardYaw — and with it the inner face(fig) body
  // this GREEN half reads — moved VERBATIM to src/ui/theater-sprites.js. Read the composite of both so
  // the extraction still finds it; the RED half above still reads the pinned pre-fix git ref of
  // theater-boot.js, so the red/green pair is unchanged.
  const bootSrcNow = read("src/ui/theater-boot.js")
    + "\n/* [verify-bw2-2 composite boundary — src/ui/theater-sprites.js follows] */\n"
    + read("src/ui/theater-sprites.js");
  const nowMatch = bootSrcNow.match(/function face\(fig\)\{[\s\S]*?\n  \}/);
  ok(!!nowMatch, "GREEN: could extract the CURRENT face() body from the working tree");
  ok(!!nowMatch && /wrap\.rotation\.x\s*=\s*tilt/.test(nowMatch[0]),
    "GREEN: the current face() body writes the camera tilt to `wrap.rotation.x` (the inner sprite-only wrapper)");
  ok(!!nowMatch && /\}\s*else\s*\{\s*fig\.rotation\.x\s*=\s*tilt;\s*\}/.test(nowMatch[0]),
    "GREEN: the ONLY `fig.rotation.x = tilt` assignment left in face() is inside the defensive `else` fallback (no wrap present) — the wrap branch (the normal path for every real sprite) never touches the outer group's rotation.x");
  ok(!!nowMatch && /fig\.rotation\.y\s*=\s*facing/.test(nowMatch[0]),
    "GREEN: the current face() body still drives the OUTER group's yaw (facing + kilter) — unaffected by the tilt split");
}

// ============================================================================
// PART B — the FIX, exercised against the real theater-boot.js (jsdom + vendored THREE subprocess,
// dev/verify-dungeon-interior.mjs's own established pattern for this sealed ES-module file).
// ============================================================================
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");

function ensureThreeShim(){
  const base = join(ROOT, "node_modules", "three");
  const loaderDir = join(base, "addons", "loaders");
  // BEAUTY-WAVE-3 BW3-0 (THE COMPOSER SEAM) — same shim-completeness fix as dev/verify-dungeon-
  // interior.mjs / dev/verify-theater-sprites.mjs's own ensureThreeShim: theater-boot.js now also
  // imports EffectComposer/RenderPass/ShaderPass from "three/addons/postprocessing/", which the
  // ORIGINAL early-return (`if package.json exists, return`) would never add on an environment (or a
  // shared CI checkout) whose shim was already written by an earlier-running verify-*.mjs. A version
  // marker file forces a re-write when the shim's own contents are stale, instead of trusting
  // package.json's mere existence as "already complete."
  const postDir = join(base, "addons", "postprocessing");
  const shimVersion = "cp1-env-ao"; // visual-correction Checkpoint 1: +GTAOPass/+GTAOShader/+PoissonDenoiseShader/+SimplexNoise (lockstep across all shim writers sharing node_modules/three)
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

const REGISTRY = {
  "spr-gloom-medium-thing": { realm: "gloom", kind: "monster", name: "Medium Thing", size: "Medium", status: "cut", scaleTrue: 1.0 },
  "spr-gloom-knight": { realm: "gloom", kind: "npc", name: "Knight", size: "Medium", status: "cut", scaleTrue: 1.0 },
};

function runScenario(runnerSrc, extraArgs){
  const tag = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const runnerPath = join(ROOT, "dev", `.verify-bw2-2-runner-${tag}.mjs`);
  writeFileSync(runnerPath, runnerSrc);
  try {
    const out = execFileSync("node", [runnerPath, join(ROOT, "src", "ui", "theater-boot.js"), JSON.stringify(REGISTRY), ...extraArgs], {
      cwd: ROOT, encoding: "utf-8", timeout: 30000,
    });
    const lastLine = out.trim().split("\n").pop();
    return JSON.parse(lastLine);
  } finally {
    rmSync(runnerPath, { force: true });
  }
}

const PIECES_RUNNER = `
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";
const bootPath = process.argv[2];
const registry = JSON.parse(process.argv[3]);
const dom = new JSDOM(\`<!doctype html><html><body><div id="stage" style="width:400px;height:300px"></div></body></html>\`, { runScripts: "dangerously", url: "http://localhost/" });
global.window = dom.window; global.document = dom.window.document;
global.SPRITE_REGISTRY = registry; global.window.SPRITE_REGISTRY = registry;
global.LIGHT_RECIPE_REGISTRY = {};
global.lightRecipeLegacyProfile = (value) => value;
global.lightRecipeDeepClone = (value) => JSON.parse(JSON.stringify(value));
global.lightRecipeDeepFreeze = (value) => value;
global.LIGHT_LAB_COMPILED_SETTINGS = { stageAmbientFloor: 0.42, gradeExposureFloor: 0.006, bloomThreshold: 0.68, bloomStrength: 1.15, gradeTintScale: 0.45, gradeTintMax: 0.12, celestialArc: {}, spriteEmissiveFloor: 0.05, sceneAmbient: 0.13, lightRenderGain: 4.5 };
function fakeTexture(){ return { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true, image: { width: 100, height: 200 } }; }
const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;
  for(const slug of Object.keys(registry)) T._spriteTextureCache[slug] = fakeTexture();
  const law = T._floorContactLawForTest;
  // two cells: A at (0,0) with nominal sy=0.2, B at (5,5) with a raised VP3 step sy=0.28.
  const floorInstances = [ { x: 0, z: 0, sy: 0.2 }, { x: 5, z: 5, sy: 0.28 } ];
  const floorTopMap = law.interiorFloorTopMapFrom(floorInstances);
  const pieces = [
    { slug: "medium-thing", cellX: 0, cellY: 0 },
    { slug: "medium-thing", cellX: 5, cellY: 5 },
  ];
  const built = T._interiorBuildPiecesForTest(pieces, 0, 0, null, floorTopMap, "#7a6a55");
  const g = built.group.children;
  const expectedTopA = law.ITR_FLOOR_BASE_Y + 0.2, expectedTopB = law.ITR_FLOOR_BASE_Y + 0.28;
  result.contactA = g[0].position.y;
  result.contactB = g[1].position.y;
  result.expectedContactA = law.interiorStandeeContactY(expectedTopA);
  result.expectedContactB = law.interiorStandeeContactY(expectedTopB);
  // CL-R2: children[0]=the sprite's own inner camera-tilt wrap (thin side shell + alpha plane),
  // children[1]=natural support (a plain SIBLING of the wrap, not
  // inside it — the whole point of the BW2-2b split). Use the stable userData handle for the mesh
  // itself rather than assuming a fixed children[] depth.
  result.baseCount = g[0].children.filter((c) => c.userData && c.userData.standeeBase).length;
  const base = g[0].userData.standeeBaseMesh;
  result.baseForm = base.userData.supportForm;
  result.baseWidth = base.userData.supportWidth;
  result.baseDepth = base.userData.supportDepth;
  result.baseHeight = base.userData.supportHeight;
  result.baseMatCount = Array.isArray(base.material) ? base.material.length : 0;
  result.baseTopColor = base.material[0].color.getHex();
  result.baseSideColor = base.material[1].color.getHex();
  result.spriteWidth = g[0].userData.spriteBillboardMesh.geometry.parameters.width;
  // BW2-2b item 1 (FLOOR-ALIGNED BASES): the wrap exists, is a DIRECT child of the figure (not nested
  // inside the base, nor vice versa), and holds ONLY the sprite mesh — the base is never inside it.
  result.wrapExists = !!g[0].userData.standeeWrap;
  result.wrapIsChild0 = g[0].children[0] === g[0].userData.standeeWrap;
  result.wrapHoldsShellAndMesh = g[0].userData.standeeWrap.children.length === 2
    && g[0].userData.standeeWrap.children.includes(g[0].userData.spriteBillboardMesh)
    && g[0].userData.standeeWrap.children.includes(g[0].userData.standeeSideShell);
  result.baseIsSiblingOfWrap = base !== g[0].userData.standeeWrap && base.parent === g[0];
  // blob/pool group is the LAST child of built.group, one pool per piece.
  const blobGroup = built.group.children[built.group.children.length - 1];
  const pools = blobGroup.children.filter((c) => c.userData && c.userData.contactBlob);
  result.poolCount = pools.length;
  result.poolYA = pools[0].position.y;
  result.expectedPoolYA = expectedTopA + law.INTERIOR_POOL_Y_OFFSET;
  result.poolHalfWidthA = pools[0].geometry.parameters.width * pools[0].scale.x / 2;
  result.poolHalfDepthA = pools[0].geometry.parameters.height * pools[0].scale.y / 2;

  // BW2-2b item 4 (THE KILTER): deterministic + bounded, and actually reaches the mounted piece's own
  // position/yaw — re-derive the SAME seed key interiorBuildPieces uses (slug+cell) and confirm g[0]'s
  // stamped position/userData match it exactly.
  const kilterA = T._kilterForTest("medium-thing:0,0");
  result.kilterAyawDeg = kilterA.yawDeg;
  result.kilterAdx = kilterA.dx;
  result.kilterAdz = kilterA.dz;
  result.gYawDegA = g[0].userData.kilterYawDeg;
  result.gPosXA = g[0].position.x; // === (cellX - cx) + kilter.dx === 0 + kilterA.dx
  result.gPosZA = g[0].position.z;
  const kilterA2 = T._kilterForTest("medium-thing:0,0"); // same seed key again — must reproduce byte-identical
  result.kilterDeterministic = kilterA2.yawDeg === kilterA.yawDeg && kilterA2.dx === kilterA.dx && kilterA2.dz === kilterA.dz;
  const kilterB = T._kilterForTest("medium-thing:5,5");
  result.kilterDiffersAcrossSeeds = kilterB.yawDeg !== kilterA.yawDeg || kilterB.dx !== kilterA.dx;
  result.kilterYawBounded = Math.abs(kilterA.yawDeg) <= 4 + 1e-9 && Math.abs(kilterB.yawDeg) <= 4 + 1e-9;
  result.kilterPosBounded = Math.abs(kilterA.dx) <= 0.06 + 1e-9 && Math.abs(kilterA.dz) <= 0.06 + 1e-9
    && Math.abs(kilterB.dx) <= 0.06 + 1e-9 && Math.abs(kilterB.dz) <= 0.06 + 1e-9;

  // BW2-2b item 3 (TURN GLOW) — SHARED-MATERIAL ISOLATION: two pieces mounted with the SAME trim color
  // (both pieces above used "#7a6a55") each get their OWN cloned base materials (buildInteriorBase's own
  // header) — glowing piece A's base must NOT bleed onto piece B's base even though both were built from
  // the identical cached template.
  const baseA = g[0].userData.standeeBaseMesh, baseB = g[1].userData.standeeBaseMesh;
  result.baseAEmissiveBefore = baseA.material[0].emissive.getHex();
  result.baseBEmissiveBefore = baseB.material[0].emissive.getHex();
  T._setBaseGlowForTest(baseA, true);
  result.baseAEmissiveGlowing = baseA.material[0].emissive.getHex();
  result.baseBEmissiveStillOff = baseB.material[0].emissive.getHex();
  T._setBaseGlowForTest(baseA, false);
  result.baseAEmissiveReverted = baseA.material[0].emissive.getHex();

  result.ok = true;
} catch(e){ result.error = String((e && e.stack) || e); }
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

group("10 — GREEN: interiorBuildPieces mounts every cell through the derived law with one tread-fit natural support per piece");
{
  const r = runScenario(PIECES_RUNNER, []);
  if(!r.ok){ fail++; console.error("  FAIL: pieces scenario threw: " + r.error); }
  else {
    ok(Math.abs(r.contactA - r.expectedContactA) < 1e-9, `piece A (nominal cell, sy=0.2) contact Y=${r.contactA} matches the law's own derivation ${r.expectedContactA}`);
    ok(Math.abs(r.contactB - r.expectedContactB) < 1e-9, `piece B (raised cell, sy=0.28) contact Y=${r.contactB} matches the law's own derivation ${r.expectedContactB}`);
    ok(Math.abs(r.contactB - r.contactA - 0.08) < 1e-9, `raised cell B sits exactly 0.08 world units ABOVE nominal cell A (the VP3 step delta reaching the standee mount, not just the floor mesh)`);
    ok(r.contactA > -0.5 && r.contactB > -0.5, `both contact lines sit ABOVE the pre-BW2-2 hardcoded -0.5 (proving the fix, not just a different wrong number)`);
    ok(r.baseCount === 1, `exactly one base mesh per piece (found ${r.baseCount})`);
    ok(r.baseForm === "shallow-rounded-strip", `visible support is the CL-R2 shallow rounded strip (${r.baseForm}), not a circular token`);
    ok(Math.abs(r.baseHeight - 0.09) < 1e-9, `support height ${r.baseHeight} === the physical-plinth height 0.09`);
    ok(Math.abs(r.baseDepth - 1 / 3) < 1e-9, `Medium support depth ${r.baseDepth} exactly matches one stair tread (1/3 cell)`);
    ok(r.baseWidth <= 0.82 + 1e-9, `Medium support width ${r.baseWidth} stays inside its 1-cell tactical footprint`);
    ok(r.baseMatCount === 2, `support carries distinct top/side materials, found ${r.baseMatCount}`);
    ok(r.baseTopColor !== r.baseSideColor, `base top face color (${r.baseTopColor.toString(16)}) differs from the side wall color (${r.baseSideColor.toString(16)}) — a lit-from-above plinth read, not a flat tint`);
    ok(r.poolCount === 2, `exactly one contact pool per piece — 2 pieces, found ${r.poolCount} pools`);
    ok(Math.abs(r.poolYA - r.expectedPoolYA) < 1e-9, `pool A y=${r.poolYA} matches floor-top+offset (${r.expectedPoolYA}), not the old hardcoded -0.495`);
    ok(Math.abs(r.poolHalfWidthA - r.baseWidth * 0.744) < 1e-6, `contact pool half-width (${r.poolHalfWidthA}) follows support width x 0.744 so its feather stays visible`);
    ok(Math.abs(r.poolHalfDepthA - r.baseDepth * 0.744) < 1e-6, `contact pool half-depth (${r.poolHalfDepthA}) follows support depth x 0.744 rather than restoring a circle`);
    ok(r.wrapExists, `BW2-2b item 1: the figure's own inner camera-tilt wrap exists (g.userData.standeeWrap)`);
    ok(r.wrapIsChild0, `the wrap is a direct child of the figure group (children[0])`);
    ok(r.wrapHoldsShellAndMesh, `the wrap holds the alpha plane plus its thin side shell — never the support — so the support stays floor-flat`);
    ok(r.baseIsSiblingOfWrap, `the base is a plain SIBLING of the wrap on the figure group, never nested inside it`);

    ok(Math.abs(r.gYawDegA - r.kilterAyawDeg) < 1e-9, `BW2-2b item 4: the mounted piece's own kilterYawDeg (${r.gYawDegA}) matches kilterFor's independently-recomputed value (${r.kilterAyawDeg}) for the SAME seed key`);
    ok(Math.abs(r.gPosXA - r.kilterAdx) < 1e-9 && Math.abs(r.gPosZA - r.kilterAdz) < 1e-9,
      `the mounted piece's own position (x=${r.gPosXA}, z=${r.gPosZA}) reflects the SAME kilter dx/dz (${r.kilterAdx}, ${r.kilterAdz}) added at mount time`);
    ok(r.kilterDeterministic, `kilterFor is DETERMINISTIC — the same seed key returns byte-identical yaw/dx/dz on a second call`);
    ok(r.kilterDiffersAcrossSeeds, `kilterFor gives a DIFFERENT result for a different seed key (not a constant offset masquerading as "seeded")`);
    ok(r.kilterYawBounded, `kilter yaw stays within the spec's +/-4deg bound for both sampled seeds`);
    ok(r.kilterPosBounded, `kilter position offset stays within the spec's <=6% of a cell (0.06 world units) bound for both sampled seeds`);

    ok(r.baseAEmissiveBefore === 0, `BW2-2b item 3: a freshly-built base starts un-glowing (emissive black)`);
    ok(r.baseAEmissiveGlowing === 0xd4af6e, `setBaseGlow(true) turns the base's top-face emissive to the accent gold (0xd4af6e)`);
    ok(r.baseBEmissiveStillOff === 0, `SHARED-MATERIAL ISOLATION: glowing piece A's base does NOT bleed onto piece B's base, even though both share the identical cached (pre-clone) trim template`);
    ok(r.baseAEmissiveReverted === 0, `setBaseGlow(false) reverts the base's emissive back to black`);
  }
}

// GL-layer checks (mount()/setInteriorBoard/setUnits/play all gate on S.mounted, which only becomes
// true after a REAL THREE.WebGLRenderer boots — jsdom has no GPU/WebGL backend at all, so unlike the
// pure-data-construction checks above (interiorBuildPieces/interiorBuildDressing/interiorBuildDecals,
// which are plain THREE.Group/Geometry allocation with no renderer involved), this integration slice
// needs a REAL Chrome — same boundary dev/verify-dungeon-interior.mjs's own header draws ("GL-layer
// checks... are NOT reimplemented here... those live in dev/battle-gate/capture-interior-study.mjs"),
// and the same --with-render convention dev/verify-dungeon-dressing.mjs's check 4 already established.
async function runRenderCheck(){
  group("20 — GREEN (live Chrome): a real setInteriorBoard mount caches the floor-top map off the board's OWN floor instances; setUnits mounts a combat standee through the SAME law + its own base; the acting ring+base glow; fall-death's corpse tip (BW2-2b: no reparenting, verb-tilt on the outer group) keeps the base attached");
  const { createRequire } = await import("node:module");
  const { spawn } = await import("node:child_process");
  const net = await import("node:net");
  const require = createRequire(import.meta.url);
  let puppeteer;
  try {
    puppeteer = require(join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
  } catch(e){
    fail++; console.error("  FAIL: puppeteer-core not available at ~/.genesis-jsdom — cannot run the live-Chrome render check");
    return;
  }
  const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5221, 5222, 5223, 5224, 5225];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function portInUse(port){
    return new Promise((resolve) => {
      const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
      sock.on("error", () => resolve(false));
      sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
    });
  }
  async function probeRoot(port){
    try {
      const r = await fetch(`http://127.0.0.1:${port}/genesis.html`, { cache: "no-store" });
      if(!r.ok) return false;
      const body = await r.text();
      return body.includes("Genesis");
    } catch(e){ return false; }
  }
  async function startServer(){
    for(const port of PORT_CANDIDATES){
      if(await portInUse(port)){ if(await probeRoot(port)) return { proc: null, port }; continue; }
      const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: ["ignore", "ignore", "ignore"] });
      for(let i = 0; i < 40; i++){
        if(await portInUse(port)){ if(await probeRoot(port)) return { proc, port }; break; }
        await sleep(150);
      }
      try { proc.kill("SIGTERM"); } catch(e){}
    }
    throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
  }

  let server = null, browser = null;
  try {
    server = await startServer();
    const BASE = `http://127.0.0.1:${server.port}`;
    const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=800,600"];
    browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 800, height: 600, deviceScaleFactor: 1 } });
    const page = await browser.newPage();
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "load", timeout: 30000 });
    for(let i = 0; i < 40; i++){
      const ready = await page.evaluate(() => !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"));
      if(ready) break;
      await sleep(150);
    }

    const result = await page.evaluate(async () => {
      const el = document.createElement("div");
      el.style.width = "800px"; el.style.height = "600px";
      document.body.appendChild(el);
      const T = window.Theater;
      const mounted = T.mount(el);
      if(!mounted) return { ok: false, stage: "mount-failed" };
      // extend the REAL (const-bound, but mutable OBJECT) SPRITE_REGISTRY with two synthetic entries —
      // never touching the thousands of real cut entries already loaded, and stubbing their texture
      // cache entries so interiorSpriteBillboard resolves without a network image round-trip.
      SPRITE_REGISTRY["bw2-2-test-medium"] = { name: "BW2-2 Test Medium", status: "cut", scaleTrue: 1.0, size: "Medium" };
      T._spriteTextureCache["bw2-2-test-medium"] = { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true, image: { width: 100, height: 200 } };

      const board = {
        kind: "interior3d", env: "dungeon", realmId: "gloom", wallHeightBase: 3,
        tileKit: { floorColor: "#33302f", wallColor: "#26221f", trimColor: "#7a6a55" },
        instances: { floor: [ { x: 0, z: 0, sx: 1, sy: 0.2, sz: 1, color: "#33302f" }, { x: 1, z: 0, sx: 1, sy: 0.28, sz: 1, color: "#33302f" } ], wall: [], doorframe: [], pillar: [] },
        skirt: [], lights: [], bounds: { minX: 0, maxX: 1, minZ: 0, maxZ: 0 }, pieces: [], dressing: [], decals: [],
      };
      T.setInteriorBoard(board);
      const floorTopMap = T._interiorFloorTopMapForTest();
      const r = { ok: true, mapTopA: floorTopMap.get("0,0"), mapTopB: floorTopMap.get("1,0") };

      T.setUnits({ units: [ { id: "u1", x: 0, z: 0, archetype: "monster", kind: "foe", recipeSlug: "BW2-2 Test Medium" } ] });
      const fig = T._findUnitForTest("u1");
      r.figFound = !!fig;
      r.figY = fig && fig.position.y;
      const law = T._floorContactLawForTest;
      r.expectedY = law.interiorStandeeContactY(r.mapTopA);
      r.baseCount = fig ? fig.children.filter((c) => c.userData && c.userData.standeeBase).length : 0;
      // CL-R2 replaced the legacy circular CylinderGeometry with a shallow rounded strip. The
      // retained `interiorBaseRadius` is now only the selection-ring half-width contract.
      r.baseRadius = fig && fig.userData.interiorBaseRadius;
      r.baseWidth = fig && fig.userData.interiorBaseWidth;
      r.spriteWidth = fig && fig.userData.spriteBillboardMesh.geometry.parameters.width;

      // BW2-2b item 1 (RED-FIRST -> GREEN, LIVE VALUES): run the REAL per-frame facing/tilt pass and
      // read the SPLIT it produces — the base's own local frame (a plain sibling of the wrap, identity
      // rotation of its own) has a world "up" normal that is only ever tilted by the OUTER group's own
      // rotation.x; today that must read 0 (world +Y, floor-flat) while the sprite's inner wrap alone
      // carries the camera-pitch tilt.
      T._updateSpriteBillboardYawForTest();
      r.figRotationXBeforeTip = fig.rotation.x;         // expect 0 — the base's own world-up stays +Y
      r.wrapRotationXBeforeTip = fig.userData.standeeWrap.rotation.x; // expect the nonzero camera tilt
      r.figRotationYBeforeTip = fig.rotation.y;          // facing (+ this unit's own kilter offset)

      const mountedRing = T.setActingUnit("u1");
      r.ringMounted = mountedRing;
      const ring = fig.children[fig.children.length - 1];
      r.ringIsRing = !!(ring && ring.geometry && ring.geometry.type === "RingGeometry");
      r.ringLocalY = ring && ring.position.y;
      r.ringOuterRadius = ring && ring.geometry.parameters.outerRadius;
      // BW2-2b item 3 (TURN GLOW): the acting standee's OWN base material glows gold alongside the ring.
      const actingBase = fig.userData.standeeBaseMesh;
      r.actingBaseEmissive = actingBase && actingBase.material[1].emissive.getHex();

      T.setActingUnit(null); // clears both the ring AND the glow (BW2-2b) before the corpse-tip check below
      r.baseEmissiveAfterClear = actingBase && actingBase.material[1].emissive.getHex();
      r.preTipChildren = fig.children.length;
      T.play("down", { who: "u1" });
      // BW2-2b item 1: NO reparenting happens anymore (verb-tilt writes the OUTER group's rotation.x
      // directly) — the child structure must be COMPLETELY UNCHANGED by fall-death.
      r.postTipChildCountImmediate = fig.children.length;
      r.wrapStillChild0Immediate = fig.children[0] === fig.userData.standeeWrap;
      r.baseStillSiblingImmediate = fig.children[1] === actingBase;
      // let the real tween ticker (rAF + wall-clock Date.now()) actually run fall-death's 480ms duration
      // to completion, then re-run the facing pass once more (a corpse still renders every frame).
      await new Promise((res) => setTimeout(res, 1000));
      T._updateSpriteBillboardYawForTest();
      r.postTipChildCountFinal = fig.children.length;
      r.figRotationXAfterTip = fig.rotation.x;              // expect PI/2 — the corpse tip, on the OUTER group
      r.wrapRotationXAfterTip = fig.userData.standeeWrap.rotation.x; // expect UNCHANGED — still the plain camera tilt

      // CL-R2 follow-up: sample the shared contact-pool multiplier directly off its own backing
      // <canvas> in a REAL browser. The center must be darker than the rim, while the rim must be
      // opaque white—the exact multiply identity—so the quad disappears without alpha compositing.
      const poolTex = T._interiorPoolTextureForTest();
      const poolMat = T._interiorPoolMaterialForTest();
      const pctx = poolTex.image.getContext("2d");
      const size = poolTex.image.width;
      const center = pctx.getImageData(size / 2, size / 2, 1, 1).data;
      const edge = pctx.getImageData(1, size / 2, 1, 1).data;
      r.poolCenterRGB = [center[0], center[1], center[2]];
      r.poolEdgeRGB = [edge[0], edge[1], edge[2]];
      r.poolCenterAlpha = center[3];
      r.poolEdgeAlpha = edge[3];
      r.poolUsesMultiplyBlending = poolMat.userData.contactBlendMode === "multiply";
      r.poolToneMapped = poolMat.toneMapped;
      return r;
    });

    ok(result.ok, "boot + mount + setInteriorBoard succeeded: " + JSON.stringify(result.stage || result));
    if(result.ok){
      ok(Math.abs(result.mapTopA - (-0.3)) < 1e-9, `cell (0,0) sy=0.2 -> cached floor top ${result.mapTopA} === -0.3`);
      ok(Math.abs(result.mapTopB - (-0.22)) < 1e-9, `cell (1,0) sy=0.28 -> cached floor top ${result.mapTopB} === -0.22`);

      group("21 — GREEN: setUnits mounts a combat standee through the SAME law + gets its own base");
      ok(result.figFound, "setUnits mounted a findable unit u1");
      ok(Math.abs(result.figY - result.expectedY) < 1e-9, `combat unit contact Y=${result.figY} matches the law's own derivation (${result.expectedY}) off the LIVE cached floor-top map — not the pre-BW2-2 hardcoded -0.5`);
      ok(result.baseCount === 1, `exactly one base mesh on the combat standee (found ${result.baseCount})`);
      ok(Math.abs(result.baseRadius - result.baseWidth * 0.5) < 1e-6,
        `combat standee selection-ring radius (${result.baseRadius}) === the natural support width (${result.baseWidth}) / 2`);

      group("21b — GREEN (live values, BW2-2b item 1): under a REAL render pass, the base's world-up stays +Y (outer group rotation.x === 0) while the sprite's inner wrap alone carries the nonzero camera-pitch tilt");
      ok(result.figRotationXBeforeTip === 0, `BEFORE any verb plays, the OUTER group's rotation.x (what the base/ring inherit as plain siblings) is exactly 0 — floor-flat — found ${result.figRotationXBeforeTip}`);
      ok(typeof result.wrapRotationXBeforeTip === "number" && Math.abs(result.wrapRotationXBeforeTip) > 0.01,
        `the sprite's OWN inner wrap carries the nonzero camera-pitch tilt (${result.wrapRotationXBeforeTip}) — the split is real, not just "nothing rotates"`);

      group("22 — GREEN: the acting ring relocates to wrap the base rim (BW2-2 item 2)");
      ok(result.ringMounted === 1, "setActingUnit mounted exactly one ring");
      ok(result.ringIsRing, "the mounted mesh is a RingGeometry (unchanged primitive)");
      ok(Math.abs(result.ringLocalY - 0.003) < 1e-9, `ring local Y (${result.ringLocalY}) sits at the interior convention (0.003 above local y=0, the base's own top face) — not the tabletop's -0.48`);
      ok(Math.abs(result.ringOuterRadius - result.baseRadius * 1.2) < 1e-6, `ring outer radius (${result.ringOuterRadius}) === base radius (${result.baseRadius}) x 1.2 (slightly larger than the base rim, per spec)`);

      group("22b — GREEN (BW2-2b item 3, TURN GLOW): the acting standee's own base glows gold alongside the ring, and reverts when the turn clears");
      ok(result.actingBaseEmissive === 0xd4af6e, `the acting standee's base top-face emissive reads the accent gold (0xd4af6e) while it's acting — found 0x${(result.actingBaseEmissive || 0).toString(16)}`);
      ok(result.baseEmissiveAfterClear === 0, `clearing the acting unit (setActingUnit(null)) reverts the base's emissive back to black — found 0x${(result.baseEmissiveAfterClear || 0).toString(16)}`);

      group("23 — GREEN (BW2-2b REVISION): fall-death tips the whole miniature-with-base as ONE group by writing the OUTER group's rotation.x directly — NO reparenting happens at all (the base was already a permanent sibling)");
      ok(result.preTipChildren >= 2, `before the tip, the figure group holds >=2 direct children (wrap + base) — found ${result.preTipChildren}`);
      ok(result.postTipChildCountImmediate === result.preTipChildren, `immediately after play("down"), the child count is UNCHANGED (${result.postTipChildCountImmediate} === ${result.preTipChildren}) — no reparenting/collapsing, unlike the pre-BW2-2b ensureWrap behavior`);
      ok(result.wrapStillChild0Immediate, `the sprite's own camera-tilt wrap is STILL children[0] immediately after the verb starts (never moved)`);
      ok(result.baseStillSiblingImmediate, `the base mesh is STILL a plain sibling at children[1] immediately after the verb starts (never moved into any wrapper)`);
      ok(result.postTipChildCountFinal === result.preTipChildren, `the child count is STILL unchanged once the tween has actually run to completion (${result.postTipChildCountFinal})`);
      ok(Math.abs(result.figRotationXAfterTip - Math.PI / 2) < 0.05, `the OUTER group's rotation.x reaches the floor plane (PI/2=${(Math.PI/2).toFixed(4)}) once fall-death's tween completes — found ${result.figRotationXAfterTip} — tipping \`fig\` tips the base (a plain sibling) right along with it`);
      ok(Math.abs(result.wrapRotationXAfterTip - result.wrapRotationXBeforeTip) < 1e-9, `the sprite's inner wrap's OWN rotation.x is UNCHANGED by the corpse tip (still just the plain camera-pitch tilt, ${result.wrapRotationXAfterTip}) — verb-tilt and camera-tilt never fight over the same field`);

      group("24 — GREEN (live Chrome): the contact pool is a true multiply gradient — dark center, opaque-white identity rim, no tone-map remap");
      ok(result.poolUsesMultiplyBlending, "pool material uses THREE.MultiplyBlending");
      ok(result.poolToneMapped === false, "pool multiplier bypasses material tone mapping so white remains the exact identity");
      ok(result.poolCenterRGB.every((v) => v <= 70), `pool center RGB (${result.poolCenterRGB.join(",")}) reads near the authored 64/255 multiplier`);
      ok(result.poolEdgeRGB.every((v) => v >= 245), `pool rim RGB (${result.poolEdgeRGB.join(",")}) reads within filtered-edge tolerance of white multiply identity`);
      ok(result.poolCenterRGB[0] < result.poolEdgeRGB[0], `center multiplier (${result.poolCenterRGB[0]}) is darker than rim (${result.poolEdgeRGB[0]}) — a real radial occlusion gradient`);
      ok(result.poolCenterAlpha === 255 && result.poolEdgeAlpha === 255,
        `center/rim alpha stay fully opaque (${result.poolCenterAlpha}/${result.poolEdgeAlpha}); RGB owns multiply strength`);
    }
  } catch(e){
    fail++; console.error("  FAIL: live-Chrome render check threw: " + (e && e.message));
  } finally {
    if(browser){ try { await browser.close(); } catch(e){} }
    if(server && server.proc){ try { server.proc.kill("SIGTERM"); } catch(e){} }
  }
}

const DRESSING_RUNNER = `
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";
const bootPath = process.argv[2];
const registry = JSON.parse(process.argv[3]);
const dom = new JSDOM(\`<!doctype html><html><body><div id="stage" style="width:400px;height:300px"></div></body></html>\`, { runScripts: "dangerously", url: "http://localhost/" });
global.window = dom.window; global.document = dom.window.document;
global.SPRITE_REGISTRY = registry; global.window.SPRITE_REGISTRY = registry;
global.LIGHT_RECIPE_REGISTRY = {};
global.lightRecipeLegacyProfile = (value) => value;
global.lightRecipeDeepClone = (value) => JSON.parse(JSON.stringify(value));
global.lightRecipeDeepFreeze = (value) => value;
global.LIGHT_LAB_COMPILED_SETTINGS = { stageAmbientFloor: 0.42, gradeExposureFloor: 0.006, bloomThreshold: 0.68, bloomStrength: 1.15, gradeTintScale: 0.45, gradeTintMax: 0.12, celestialArc: {}, spriteEmissiveFloor: 0.05, sceneAmbient: 0.13, lightRenderGain: 4.5 };
const FAKE_2D_CTX = { fillRect(){}, strokeRect(){}, fillText(){}, measureText(){ return { width: 0 }; }, fillStyle: "", strokeStyle: "", lineWidth: 0, font: "", textAlign: "", textBaseline: "" };
global.window.HTMLCanvasElement.prototype.getContext = function(){ return FAKE_2D_CTX; };
const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;
  const law = T._floorContactLawForTest;
  const floorInstances = [ { x: 0, z: 0, sy: 0.2 }, { x: 3, z: 3, sy: 0.12 } ];
  const floorTopMap = law.interiorFloorTopMapFrom(floorInstances);
  const dressing = [
    { slug: "tombstone", x: 0, y: 0, cardKind: "medium" },
    { slug: "statue", x: 3, y: 3, cardKind: "large" },
    { slug: "fantasy-painting-1", x: 6, y: 6, cardKind: "medium", primary: "wall-hang" },
  ];
  const built = T._interiorBuildDressingForTest(dressing, 0, 0, floorTopMap);
  result.cardAY = built.children[0].position.y;
  result.expectedCardAY = law.ITR_FLOOR_BASE_Y + 0.2; // NO base — flush with the raw floor top
  result.cardBY = built.children[1].position.y;
  result.expectedCardBY = law.ITR_FLOOR_BASE_Y + 0.12;
  const decals = [ { x: 0, y: 0, kind: "blood" } ];
  const decalsGroup = T._interiorBuildDecalsForTest(decals, 0, 0, floorTopMap);
  result.decalY = decalsGroup.children[0].position.y;
  result.expectedDecalY = law.ITR_FLOOR_BASE_Y + 0.2 + law.INTERIOR_DECAL_Y_OFFSET;

  // BW2-2b item 5b (WALL-CONTACT AO) — INTEGRATION-MERGE RESCOPE (red-first: the original in-loop
  // assertion went red the moment BW2-5's reroute landed — wall-hangs SKIP interiorBuildDressing and
  // mount as extrusions via interiorBuildWallProps, so the AO now attaches to the EXTRUSION group at
  // POSITIVE local z (+0.005, in front of the wall plane the prop's back face sits on), not the old
  // flat-card negative-z. Non-wall-hang cards still get none.
  const cardTombstone = built.children[0], cardStatue = built.children[1];
  result.tombstoneAOCount = cardTombstone.children.filter((c) => c.userData && c.userData.wallContactAO).length;
  result.statueAOCount = cardStatue.children.filter((c) => c.userData && c.userData.wallContactAO).length;
  const wallPropsBuilt = T._interiorBuildWallPropsForTest(
    [{ slug: "fantasy-painting-1", primary: "wall-hang", cardKind: "medium", x: 3, y: 0 }], 0, 0, floorTopMap);
  const prop = wallPropsBuilt.children[0];
  const paintingAO = prop ? prop.children.filter((c) => c.userData && c.userData.wallContactAO) : [];
  result.paintingAOCount = paintingAO.length;
  if(paintingAO.length){
    result.aoRadius = paintingAO[0].geometry.parameters.width / 2;
    result.aoZ = paintingAO[0].position.z;
    result.expectedAORadius = ((prop.userData && prop.userData.extrusionHeight) || 1) * 0.5 * 1.6;
  }
  result.ok = true;
} catch(e){ result.error = String((e && e.stack) || e); }
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

group("30 — GREEN: dressing cards sit flush on the derived floor top with NO base (per the mock — only combat standees get a plinth)");
{
  const r = runScenario(DRESSING_RUNNER, []);
  if(!r.ok){ fail++; console.error("  FAIL: dressing scenario threw: " + r.error); }
  else {
    ok(Math.abs(r.cardAY - r.expectedCardAY) < 1e-9, `dressing card A (sy=0.2) Y=${r.cardAY} matches the derived floor top ${r.expectedCardAY}, not the old hardcoded -0.4`);
    ok(Math.abs(r.cardBY - r.expectedCardBY) < 1e-9, `dressing card B (sy=0.12) Y=${r.cardBY} matches the derived floor top ${r.expectedCardBY} — dressing follows the SAME per-cell law as standees`);
    ok(Math.abs(r.decalY - r.expectedDecalY) < 1e-9, `decal Y=${r.decalY} matches floor-top+0.010 (${r.expectedDecalY}), not the old hardcoded -0.49`);

    ok(r.tombstoneAOCount === 0, `BW2-2b item 5b: a non-wall-hang card (tombstone, primary unset) gets NO wall-contact AO quad`);
    ok(r.statueAOCount === 0, `a non-wall-hang card (statue, primary unset) gets NO wall-contact AO quad either`);
    ok(r.paintingAOCount === 1, `a wall-hang entry (fantasy-painting-1) mounted through the EXTRUSION path gets EXACTLY one wall-contact AO quad — found ${r.paintingAOCount}`);
    ok(Math.abs(r.aoRadius - r.expectedAORadius) < 1e-6, `the AO quad's radius (${r.aoRadius}) === extrusionHeight x 0.5 x 1.6 (${r.expectedAORadius}) — same feather multiplier as the floor pool`);
    ok(r.aoZ > 0 && r.aoZ < 0.02, `the AO quad sits at a small POSITIVE local Z (${r.aoZ}) — a hair in FRONT of the wall plane the extrusion's back face sits on, visible around the prop's silhouette`);
  }
}

const withRender = process.argv.includes("--with-render");
if(withRender){
  await runRenderCheck();
} else {
  console.log("\n(skipping checks 20-23 — live-Chrome mount/setUnits/ring/corpse-tip integration: pass --with-render to boot real headless Chrome + THREE and exercise it)");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
