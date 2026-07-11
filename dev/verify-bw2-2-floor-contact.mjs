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
   spec'd radius/height, the contact pool is a soft gradient (not a flat disc), the acting ring wraps the
   base rim, and fall-death's corpse tip keeps the base attached to the tipping standee (one group).

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
import { execFileSync } from "node:child_process";
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
    const sys = board.instances.floor.map((f) => f.sy);
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
  const burials = board.instances.floor.map((f) => (f.sy - 0.5) - OLD_Y);
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

// ============================================================================
// PART B — the FIX, exercised against the real theater-boot.js (jsdom + vendored THREE subprocess,
// dev/verify-dungeon-interior.mjs's own established pattern for this sealed ES-module file).
// ============================================================================
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");

function ensureThreeShim(){
  const base = join(ROOT, "node_modules", "three");
  const loaderDir = join(base, "addons", "loaders");
  if(existsSync(join(base, "package.json"))) return;
  mkdirSync(loaderDir, { recursive: true });
  writeFileSync(join(base, "package.json"),
    JSON.stringify({ name: "three", version: "0.0.0-vendor-shim", type: "module", main: "./three.module.js" }, null, 2));
  writeFileSync(join(base, "three.module.js"), `export * from "../../vendor/three/three.module.js";\n`);
  writeFileSync(join(loaderDir, "GLTFLoader.js"), `export * from "../../../../vendor/three/addons/loaders/GLTFLoader.js";\n`);
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
  // BW2-2 base: children[0]=sprite mesh (byte-identical index to pre-BW2-2), children[1]=plinth base.
  result.baseCount = g[0].children.filter((c) => c.userData && c.userData.standeeBase).length;
  const base = g[0].children[1];
  result.baseRadius = base.geometry.parameters.radiusTop;
  result.baseHeight = base.geometry.parameters.height;
  result.baseMatCount = Array.isArray(base.material) ? base.material.length : 0;
  result.baseSideColor = base.material[0].color.getHex();
  result.baseTopColor = base.material[1].color.getHex();
  result.spriteWidth = g[0].children[0].geometry.parameters.width;
  // blob/pool group is the LAST child of built.group, one pool per piece.
  const blobGroup = built.group.children[built.group.children.length - 1];
  const pools = blobGroup.children.filter((c) => c.userData && c.userData.contactBlob);
  result.poolCount = pools.length;
  result.poolYA = pools[0].position.y;
  result.expectedPoolYA = expectedTopA + law.INTERIOR_POOL_Y_OFFSET;
  result.poolRadiusA = pools[0].geometry.parameters.width / 2;
  result.footprintA = result.spriteWidth * 0.4;
  result.ok = true;
} catch(e){ result.error = String((e && e.stack) || e); }
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

group("10 — GREEN: interiorBuildPieces mounts EVERY cell through the derived law (not the old hardcoded -0.5), one base per piece, base radius/height match spec");
{
  const r = runScenario(PIECES_RUNNER, []);
  if(!r.ok){ fail++; console.error("  FAIL: pieces scenario threw: " + r.error); }
  else {
    ok(Math.abs(r.contactA - r.expectedContactA) < 1e-9, `piece A (nominal cell, sy=0.2) contact Y=${r.contactA} matches the law's own derivation ${r.expectedContactA}`);
    ok(Math.abs(r.contactB - r.expectedContactB) < 1e-9, `piece B (raised cell, sy=0.28) contact Y=${r.contactB} matches the law's own derivation ${r.expectedContactB}`);
    ok(Math.abs(r.contactB - r.contactA - 0.08) < 1e-9, `raised cell B sits exactly 0.08 world units ABOVE nominal cell A (the VP3 step delta reaching the standee mount, not just the floor mesh)`);
    ok(r.contactA > -0.5 && r.contactB > -0.5, `both contact lines sit ABOVE the pre-BW2-2 hardcoded -0.5 (proving the fix, not just a different wrong number)`);
    ok(r.baseCount === 1, `exactly one base mesh per piece (found ${r.baseCount})`);
    ok(Math.abs(r.baseHeight - 0.04) < 1e-9, `base cylinder height ${r.baseHeight} === spec's 0.04`);
    ok(Math.abs(r.baseRadius - r.spriteWidth * 0.42) < 1e-9, `base radius ${r.baseRadius} === sprite width (${r.spriteWidth}) x 0.42 (spec)`);
    ok(r.baseMatCount === 3, `base carries 3 materials (CylinderGeometry side/top/bottom groups), found ${r.baseMatCount}`);
    ok(r.baseTopColor !== r.baseSideColor, `base top face color (${r.baseTopColor.toString(16)}) differs from the side wall color (${r.baseSideColor.toString(16)}) — a lit-from-above plinth read, not a flat tint`);
    ok(r.poolCount === 2, `exactly one contact pool per piece — 2 pieces, found ${r.poolCount} pools`);
    ok(Math.abs(r.poolYA - r.expectedPoolYA) < 1e-9, `pool A y=${r.poolYA} matches floor-top+offset (${r.expectedPoolYA}), not the old hardcoded -0.495`);
    ok(Math.abs(r.poolRadiusA - r.footprintA * 1.6) < 1e-6, `pool radius (${r.poolRadiusA}) === footprint (width*0.4=${r.footprintA}) x 1.6 (the addendum's feather-extent spec)`);
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
  group("20 — GREEN (live Chrome): a real setInteriorBoard mount caches the floor-top map off the board's OWN floor instances; setUnits mounts a combat standee through the SAME law + its own base; the acting ring wraps the base rim; fall-death's corpse tip keeps the base attached");
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

    const result = await page.evaluate(() => {
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
      r.baseRadius = fig && fig.children[1] && fig.children[1].geometry.parameters.radiusTop;
      r.spriteWidth = fig && fig.children[0].geometry.parameters.width;

      const mountedRing = T.setActingUnit("u1");
      r.ringMounted = mountedRing;
      const ring = fig.children[fig.children.length - 1];
      r.ringIsRing = !!(ring && ring.geometry && ring.geometry.type === "RingGeometry");
      r.ringLocalY = ring && ring.position.y;
      r.ringOuterRadius = ring && ring.geometry.parameters.outerRadius;

      T.setActingUnit(null); // clear the ring first so the corpse-tip child-count check below is clean
      r.preTipChildren = fig.children.length;
      T.play("down", { who: "u1" });
      r.postTipChildCount = fig.children.length;
      const wrap = fig.children[0];
      r.wrapChildCount = wrap && wrap.children.length;
      r.wrapHasBase = !!(wrap && wrap.children.some((c) => c.userData && c.userData.standeeBase));
      r.wrapHasMesh = !!(wrap && wrap.children.some((c) => c === fig.userData.spriteBillboardMesh));

      // BW2-2 addendum: the shared contact-pool gradient texture, sampled directly off its own backing
      // <canvas> in a REAL browser (ctx.createRadialGradient exists here, unlike jsdom) — center alpha
      // must read denser than the rim, which must read essentially transparent.
      const poolTex = T._interiorPoolTextureForTest();
      const pctx = poolTex.image.getContext("2d");
      const size = poolTex.image.width;
      const centerA = pctx.getImageData(size / 2, size / 2, 1, 1).data[3];
      const edgeA = pctx.getImageData(1, size / 2, 1, 1).data[3];
      r.poolCenterAlpha = centerA;
      r.poolEdgeAlpha = edgeA;
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
      ok(Math.abs(result.baseRadius - result.spriteWidth * 0.42) < 1e-6, `combat standee base radius (${result.baseRadius}) === its own rendered width (${result.spriteWidth}) x 0.42`);

      group("22 — GREEN: the acting ring relocates to wrap the base rim (BW2-2 item 2)");
      ok(result.ringMounted === 1, "setActingUnit mounted exactly one ring");
      ok(result.ringIsRing, "the mounted mesh is a RingGeometry (unchanged primitive)");
      ok(Math.abs(result.ringLocalY - 0.003) < 1e-9, `ring local Y (${result.ringLocalY}) sits at the interior convention (0.003 above local y=0, the base's own top face) — not the tabletop's -0.48`);
      ok(Math.abs(result.ringOuterRadius - result.baseRadius * 1.2) < 1e-6, `ring outer radius (${result.ringOuterRadius}) === base radius (${result.baseRadius}) x 1.2 (slightly larger than the base rim, per spec)`);

      group("23 — GREEN: fall-death corpse tip keeps the whole miniature-with-base as ONE group (BW2-2 item 4)");
      ok(result.preTipChildren >= 2, `before the tip, the figure group holds >=2 direct children (mesh + base) — found ${result.preTipChildren}`);
      ok(result.postTipChildCount === 1, `after fall-death, the figure group collapses to its single tilt wrapper (standee-verbs.js's ensureWrap) — found ${result.postTipChildCount}`);
      ok(result.wrapChildCount === 2, `the wrap holds exactly the sprite mesh + the base (${result.wrapChildCount}) — the base tips WITH the corpse, never left standing upright on its own`);
      ok(result.wrapHasBase, "the base mesh is inside the tilt wrapper (tips as one with the corpse)");
      ok(result.wrapHasMesh, "the sprite mesh is inside the tilt wrapper (unchanged fall-death behavior)");

      group("24 — GREEN (live Chrome): the contact pool is a real soft gradient — center alpha > edge alpha (BW2-2 addendum)");
      ok(result.poolCenterAlpha > 100, `pool texture center alpha (${result.poolCenterAlpha}/255) reads as a dense core (spec: ~0.5 opacity)`);
      ok(result.poolEdgeAlpha < 10, `pool texture edge alpha (${result.poolEdgeAlpha}/255) reads as fully feathered/transparent`);
      ok(result.poolCenterAlpha > result.poolEdgeAlpha, `center alpha (${result.poolCenterAlpha}) > edge alpha (${result.poolEdgeAlpha}) — a real gradient, not a flat disc`);
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
