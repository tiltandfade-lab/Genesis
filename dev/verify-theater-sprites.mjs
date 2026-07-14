/* Verify SPRITE-TRANSITION T4 (docs/SPRITE-TRANSITION.md T4) — the theater sprite-billboard channel
   in src/ui/theater-boot.js (figureFor's new sprite branch, buildSpriteBillboard, spriteEntryFor,
   spriteSizeScaleFor, the window.Theater.spriteChannel kill switch, the modelPathReport `sprite`
   counter).

   src/ui/theater-boot.js is the ONE ES-module boundary file in Genesis (CLAUDE.md; excluded from the
   classic-script jsdom concat every other verify-*.mjs uses) and carries a bare `import * as THREE
   from "three"` + `from "three/addons/loaders/GLTFLoader.js"` resolved via genesis.html's browser
   importmap only — Node has no importmap support, so this harness gives Node bare-specifier
   resolution the same way: `node_modules/three` and `node_modules/jsdom` shims at the repo root
   (created idempotently below if missing; node_modules/ is gitignored, so this is a per-run/per-
   environment bootstrap step, same spirit as "npm i jsdom in ~/.genesis-jsdom" per CLAUDE.md) — the
   three shim re-exports the REAL vendored vendor/three/three.module.js and
   vendor/three/addons/loaders/GLTFLoader.js, so every geometry/material call below runs the actual
   production three.js build, not a hand-rolled stub; the jsdom shim symlinks to the per-environment
   jsdom install at ~/.genesis-jsdom.

   PROCESS ISOLATION (load-bearing, found live building this harness): src/ui/theater-boot.js kicks
   off loadWholeObjectBuilders() at MODULE IMPORT TIME — an async dynamic-import sweep of ~73 creature
   modules whose completion callback fires later and reads the bare global `window` at THAT time, not
   at closure-creation time. Loading two theater-boot.js instances sequentially in the SAME Node
   process (reassigning `global.window` between them for two jsdom doms) races that stale callback
   against the second instance's now-current `global.window`, corrupting whichever instance is live
   when it fires (confirmed live building this harness: a real->buggy->real sequence in one process
   intermittently returned a 1-child figure instead of 9, and once threw "Cannot set properties of
   undefined (setting 'ready')" from the FIRST instance's callback firing after a later loadTheater()
   call had already reassigned `global.window`). Fix: each theater-boot.js instance (real source,
   buggy source) gets its OWN Node subprocess — a fresh V8 isolate has no shared global to race on,
   and each subprocess calls process.exit() unconditionally once its own checks are read off,
   discarding any of ITS OWN still-pending background promises rather than leaking them forward.

   FIXTURE SPRITE_REGISTRY (per the spec's explicit "use a FIXTURE registry in the harness ... do not
   depend on T3's branch" instruction): stamped onto the global before import, matching the shared
   data shape docs/SPRITE-TRANSITION.md locks (`{realm,kind,name,size,status,...}`).

   Texture loading is STUBBED per the spec ("stub texture loader"): rather than hitting a real
   network/file image load through THREE.TextureLoader (unreliable/slow under jsdom), each subprocess
   pre-seeds window.Theater._spriteTextureCache[slug] with a plain fake-Texture object BEFORE calling
   refFigure.build — the TEST-ONLY seam this unit exposes for exactly this purpose (see the seam's own
   header comment in theater-boot.js). No sprite PNGs, no data/sprite-registry.js dependency, no T2/T3
   integration — this unit is fully self-contained per its own OUT-OF-SCOPE line.

   Checks (T4.4):
     a. A cut-status creature (matching bestiary name via recipeSlug, texture pre-seeded) yields a
        billboard-tagged group (userData.sprite===true), carrying NO userData.wholeObject tag (so it
        falls through setUnits' EXISTING non-whole-object base-disc math, untouched by this unit).
     b. A pending-status entry (same-shape fixture, `status:"pending"`) falls through to the existing
        3D (archetype-cuboid) chain — RED-FIRST: a mutated copy of theater-boot.js with the
        `status !== "cut"` guard stubbed out is run in its own subprocess FIRST and proven to fail
        this exact assertion (the pending entry wrongly renders as a sprite), before the real,
        unmutated file is proven to pass it in a second, separate subprocess.
     c. A Gargantuan-size cut entry's billboard plane height is >= 4x a Medium-size cut entry's plane
        height (SPRITE_SIZE_SCALE: gargantuan=4, medium=1 -> exactly the floor of the requirement).
     d. window.Theater.spriteChannel = false forces the SAME cut-status creature that resolved (a)'s
        billboard back onto the 3D chain (structural: no userData.sprite, cuboid children present).

   Run:  node dev/verify-theater-sprites.mjs   (jsdom + real vendored three.js, per-env in
         ~/.genesis-jsdom — see CLAUDE.md; also needs node_modules/three + node_modules/jsdom shims
         at the repo root, created by this script if absent). */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// Bootstrap shims (idempotent — created once per environment; node_modules/ is gitignored).
// ============================================================================
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");

function ensureThreeShim(){
  const base = join(ROOT, "node_modules", "three");
  const loaderDir = join(base, "addons", "loaders");
  // BEAUTY-WAVE-3 BW3-0 (THE COMPOSER SEAM): theater-boot.js now also imports EffectComposer/
  // RenderPass/ShaderPass from "three/addons/postprocessing/" — this shim needs a re-export for each
  // or Node's ESM resolver 404s on them exactly like it would have for GLTFLoader pre-T2. Re-checked
  // (not just early-returned) on every run via a version marker file, since the ORIGINAL early-return
  // (`if package.json exists, return`) would silently keep serving a pre-BW3-0 shim missing these
  // forever on any environment that already had a GLTFLoader-only shim on disk from a prior unit.
  const postDir = join(base, "addons", "postprocessing");
  // BW3-2/3/6 THE POST SUITE: theater-boot.js now ALSO imports UnrealBloomPass + OutputPass from
  // "three/addons/postprocessing/" — the shim needs a re-export for each (their own transitive deps —
  // Pass/CopyShader/LuminosityHighPassShader/OutputShader — resolve inside the real vendor/ tree the
  // re-export points at, so only the two new top-level entry files are added here). Version bumped so
  // any environment carrying the older bw3-0 shim rewrites instead of 404ing on the two new files.
  const shimVersion = "bw3-post-suite";
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
    // symlink can fail on some filesystems/permissions — fall back to a thin re-export shim pointing
    // main at the real install (still resolves the real package, just not via a directory symlink).
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
// FIXTURE SPRITE_REGISTRY (per docs/SPRITE-TRANSITION.md's shared data shape) — one cut Tiny, one
// cut Medium, one cut Gargantuan, one pending Medium whose name never collides with a cut entry (a
// clean pending-only miss — T4 doesn't implement the realm/type/size fallback tier, so no ambiguous-
// collision fixture is needed here — see this unit's own deviation note in the handoff report).
// ============================================================================
const FIXTURE_REGISTRY = {
  "spr-gloom-grinning-poppet": { realm: "gloom", kind: "monster", name: "Grinning Poppet", size: "Tiny", status: "cut" },
  "spr-gloom-town-guard": { realm: "gloom", kind: "npc", name: "Town Guard", size: "Medium", status: "cut" },
  "spr-gloom-bog-wyrm": { realm: "gloom", kind: "monster", name: "Bog Wyrm", size: "Gargantuan", status: "cut" },
  "spr-gloom-half-cut-horror": { realm: "gloom", kind: "monster", name: "Half-Cut Horror", size: "Medium", status: "pending" },
  // Sprite-review overlay keys (dev/sprite-review.py): scale = heads-line-up calibration
  // multiplier on the billboard plane height; verdict:"fail" = review-failed art that must
  // fall through to the 3D chain even though its PNG is cut.
  "spr-gloom-scaled-guard": { realm: "gloom", kind: "npc", name: "Scaled Guard", size: "Medium", status: "cut", scale: 1.5 },
  "spr-gloom-botched-wretch": { realm: "gloom", kind: "monster", name: "Botched Wretch", size: "Medium", status: "cut", verdict: "fail" },
};

// The one-off subprocess runner: imports whatever boot module path it's handed (argv[2]) inside a
// fresh jsdom window, exercises checks (a)/(c)/(d) plus the (b) pending-falls-through assertion, and
// prints ONE JSON line to stdout as its result — then exits unconditionally (see the header note on
// why: a still-pending loadWholeObjectBuilders background promise must never survive past this).
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
global.SPRITE_REGISTRY = registry; // theater-boot.js reads the bare global, not window.-qualified
global.window.SPRITE_REGISTRY = registry;

function fakeTexture(){ return { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true }; }

const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;

  T._spriteTextureCache["spr-gloom-grinning-poppet"] = fakeTexture();
  T._spriteTextureCache["spr-gloom-town-guard"] = fakeTexture();
  T._spriteTextureCache["spr-gloom-bog-wyrm"] = fakeTexture();
  T._spriteTextureCache["spr-gloom-half-cut-horror"] = fakeTexture(); // seeded even for the pending entry: proves a bug would render it, not just "no texture yet"
  T._spriteTextureCache["spr-gloom-scaled-guard"] = fakeTexture();
  T._spriteTextureCache["spr-gloom-botched-wretch"] = fakeTexture(); // seeded so a fail-verdict render would be a real bug, not a texture miss

  const cutFig = T.refFigure.build({ recipeSlug: "grinning-poppet" });
  result.cutIsSprite = !!(cutFig && cutFig.userData && cutFig.userData.sprite === true);
  result.cutSlug = cutFig && cutFig.userData && cutFig.userData.spriteSlug;
  result.cutHasWholeObjectTag = !!(cutFig && cutFig.userData && cutFig.userData.wholeObject);
  result.cutChildCount = cutFig ? cutFig.children.length : -1;
  // BW2-2b: children[0] is now the sprite's own inner camera-tilt wrap (buildSpriteBillboardMesh's own
  // header), not the mesh directly — reach the mesh via the stable userData handle instead of assuming
  // a fixed children[] depth.
  result.cutChildType = cutFig && cutFig.userData && cutFig.userData.spriteBillboardMesh
    && cutFig.userData.spriteBillboardMesh.geometry && cutFig.userData.spriteBillboardMesh.geometry.type;

  const pendFig = T.refFigure.build({ recipeSlug: "half-cut-horror" });
  result.pendingIsSprite = !!(pendFig && pendFig.userData && pendFig.userData.sprite === true);
  result.pendingChildCount = pendFig ? pendFig.children.length : -1;
  result.pendingFallsThrough3D = !result.pendingIsSprite && result.pendingChildCount > 1;

  const medFig = T.refFigure.build({ recipeSlug: "town-guard" });
  const gigFig = T.refFigure.build({ recipeSlug: "bog-wyrm" });
  result.medHeight = medFig.userData.spriteBillboardMesh.geometry.parameters.height;
  result.gigHeight = gigFig.userData.spriteBillboardMesh.geometry.parameters.height;

  const scaledFig = T.refFigure.build({ recipeSlug: "scaled-guard" });
  result.scaledHeight = scaledFig && scaledFig.userData.spriteBillboardMesh
    && scaledFig.userData.spriteBillboardMesh.geometry.parameters.height;

  const failFig = T.refFigure.build({ recipeSlug: "botched-wretch" });
  result.failIsSprite = !!(failFig && failFig.userData && failFig.userData.sprite === true);
  result.failChildCount = failFig ? failFig.children.length : -1;
  result.failFallsThrough3D = !result.failIsSprite && result.failChildCount > 1;

  T.spriteChannel = false;
  const killedFig = T.refFigure.build({ recipeSlug: "grinning-poppet" });
  result.killedIsSprite = !!(killedFig && killedFig.userData && killedFig.userData.sprite === true);
  result.killedChildCount = killedFig ? killedFig.children.length : -1;
  T.spriteChannel = true;
  result.spriteChannelRestored = T.spriteChannel === true;

  const report = T.modelPathReport();
  result.reportSprite = report.sprite;
  result.reportTotal = report.total;

  result.ok = true;
} catch(e){
  result.error = String((e && e.stack) || e);
}
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

function runScenario(bootSourceText){
  const tag = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const bootPath = join(ROOT, "src", "ui", `.verify-sprite-boot-${tag}.mjs`);
  const runnerPath = join(ROOT, "dev", `.verify-sprite-runner-${tag}.mjs`);
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

const REAL_SOURCE = read("src/ui/theater-boot.js");
const GUARD_LINE = `if(!e || !e.name || e.status !== "cut") continue;`;
const BUGGY_LINE = `if(!e || !e.name) continue;`; // status check removed -> a pending match now "resolves"

console.log("=== T4.4 sprite-billboard channel (GREEN — real theater-boot.js) ===");
const green = runScenario(REAL_SOURCE);
if(!green.ok){
  fail++;
  console.log("  ✗ GREEN scenario threw:", green.error);
} else {
  check("(a) cut-status entry yields a sprite-tagged billboard group",
    green.cutIsSprite && green.cutSlug === "spr-gloom-grinning-poppet",
    `cutIsSprite=${green.cutIsSprite} cutSlug=${green.cutSlug}`);
  check("(a) billboard group carries NO wholeObject tag (falls into setUnits' existing non-whole-object disc branch, untouched)",
    green.cutHasWholeObjectTag === false, `cutHasWholeObjectTag=${green.cutHasWholeObjectTag}`);
  check("(a) billboard group holds exactly one textured plane mesh",
    green.cutChildCount === 1 && green.cutChildType === "PlaneGeometry",
    `cutChildCount=${green.cutChildCount} cutChildType=${green.cutChildType}`);
  check("(b) GREEN: pending-status entry falls through to the 3D chain (no sprite tag)",
    green.pendingFallsThrough3D === true,
    `pendingIsSprite=${green.pendingIsSprite} pendingChildCount=${green.pendingChildCount}`);
  check("(c) Gargantuan billboard plane height >= 4x Medium billboard plane height",
    green.gigHeight >= green.medHeight * 4 - 1e-9,
    `medium=${green.medHeight} gargantuan=${green.gigHeight} ratio=${green.gigHeight / green.medHeight}`);
  check("(e) overlay scale multiplies the billboard plane height (Medium x1.5 = 1.5x the plain Medium plane)",
    Math.abs(green.scaledHeight - green.medHeight * 1.5) < 1e-9,
    `medium=${green.medHeight} scaled=${green.scaledHeight}`);
  check("(f) verdict:\"fail\" cut entry falls through to the 3D chain (review-failed art never renders)",
    green.failFallsThrough3D === true,
    `failIsSprite=${green.failIsSprite} failChildCount=${green.failChildCount}`);
  check("(d) spriteChannel=false forces the 3D chain for a cut-status entry that otherwise resolves as a sprite",
    green.killedIsSprite === false && green.killedChildCount > 1,
    `killedIsSprite=${green.killedIsSprite} killedChildCount=${green.killedChildCount}`);
  check("(d) spriteChannel restored to true (default-on, per the spec's own kill-switch convention)",
    green.spriteChannelRestored === true, "");
  check("modelPathReport() exposes a `sprite` counter and folds it into `total`",
    typeof green.reportSprite === "number" && green.reportSprite >= 1 && green.reportTotal >= green.reportSprite,
    `reportSprite=${green.reportSprite} reportTotal=${green.reportTotal}`);
}

// ----------------------------------------------------------------------------------------------
// RED-FIRST for check (b): stub the `status !== "cut"` guard out of spriteEntryFor — simulating the
// bug class where the sprite branch wrongly swallows a pending entry — and prove check (b)'s own
// assertion FAILS against that mutated source, in a fully separate subprocess from the GREEN run
// above (see the header note on why process isolation is required here).
// ----------------------------------------------------------------------------------------------
console.log("=== RED-FIRST: (b) pending-falls-through guard ===");
if(!REAL_SOURCE.includes(GUARD_LINE)){
  fail++;
  console.log("  ✗ RED-FIRST setup: guard line not found verbatim in theater-boot.js — cannot stub it");
} else {
  const buggySource = REAL_SOURCE.replace(GUARD_LINE, BUGGY_LINE);
  const red = runScenario(buggySource);
  if(!red.ok){
    fail++;
    console.log("  ✗ RED scenario threw (expected to run, just to render WRONG):", red.error);
  } else {
    console.log(`  RED run result (expected to be WRONG — the guard is stubbed out): pendingIsSprite=${red.pendingIsSprite} pendingChildCount=${red.pendingChildCount} pendingFallsThrough3D=${red.pendingFallsThrough3D}`);
    check("(b) RED: with the status-guard stubbed out, the pending entry WRONGLY renders as a sprite (assertion (b) fails, proving the guard is load-bearing)",
      red.pendingFallsThrough3D === false,
      `expected pendingFallsThrough3D=false (i.e. the entry DID wrongly resolve as a sprite) — got ${red.pendingFallsThrough3D}`);
  }
}

// GREEN re-proof: the SAME assertion, already captured above from the real, unmutated source's own run.
check("(b) GREEN re-proof: with the real guard in place, the same pending entry correctly falls through to the 3D chain",
  green.ok && green.pendingFallsThrough3D === true,
  `pendingFallsThrough3D=${green.ok && green.pendingFallsThrough3D}`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
