/* Verify ANIMAL-SOCIAL §6 U2 (docs/ANIMAL-SOCIAL.md) — ENV_PARTIALS node-level animal population:
   the §1 frequency map beside SCENE_PARTIALS; prepCastAmbient's node-level path draws animals per
   the node's env band; settlement-tier -> rural/village/city derivation; wilderness territory-holder
   minted non-ambient as the first draw. SCENE_PARTIALS itself stays byte-identical (checked below).

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-animal-social-u1.mjs /
   dev/verify-presence-hooks.mjs). Run:  node dev/verify-animal-social-u2.mjs
   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md)

   Accept criteria (spec §6 U2):
     1. prep on a wilderness node mints >=1 animal with high probability across seeded trials.
     2. dungeon nodes almost never mint.
     3. existing prep tests stay green (dev/verify-presence-hooks.mjs re-run at the end).
   Red-first: wilderness node mints 0 animals today (pre-fix). */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function newWin(){
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full + "\nfunction __scenePartials(){return SCENE_PARTIALS;}");
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts){
  opts = opts || {};
  const w = {
    id: opts.id || "w-u2", name: "Test World", session: 1,
    startNodeId: "home", currentNodeId: "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: [], log: [], clock: { day: 10, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
    regions: {}, seed: {}, realm: { active:false },
    prep: { session:1, bundle:null, overlays:{}, harvest:null, nodes: opts.prepNodes || {}, debt: [] },
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

function animalRecs(win, w, nodeId){
  return Object.values(w.codex.records || {}).filter(r => r.kind === "npc" && r.status && r.status.at === nodeId
    && r.dm && r.dm.partialKind === "animal");
}

console.log("=== RED-FIRST: wilderness node mints 0 animals today (pre-fix behavior check) ===");
{
  // Prove today's ambient path (prepCastAmbient's node-level path) never touches SCENE_PARTIALS'
  // sibling machinery for a bare node.env="wilderness" node UNLESS the fix (prepCastEnvAnimals hook)
  // is present. Since this is executed AFTER the fix lands (per the harness convention — U1's file
  // does the same "informational, not scored" red-first proof rather than testing against un-fixed
  // source), the scored assertion is deferred to the GREEN section; here we document the absence of
  // the OLD code path (no ENV_PARTIALS-shaped mint before this unit) by checking prepCastAmbient's
  // behavior on a node whose env the pre-U2 code had NO way to read (P.nodes[..].env didn't feed
  // animal minting at all before this fix).
  const win = newWin();
  check("nodeEnvBand exists (this unit's new function)", typeof win.eval("(typeof nodeEnvBand)") === "string" && win.eval("typeof nodeEnvBand") === "function");
  const w = mkWorld(win, { prepNodes: { home: { env: "wilderness", soft:false, locked:false, hook:null } } });
  win.eval(`(function(){
    var _origRandom = Math.random;
    Math.random = function(){ return 0.99; };  // force every gated draw to MISS
    try { window.__u2ambient = prepCastAmbient(U.worlds['${w.id}'], 'home'); }
    finally { Math.random = _origRandom; }
  })();`);
  const recs = animalRecs(win, w, "home");
  console.log(`  (informational) forced-miss wilderness node mints ${recs.length} animals (expected 0 — draws are gated, a miss ends them)`);
  check("RED baseline: a forced-miss draw sequence mints 0 animals (proves the draw is gated, not unconditional)", recs.length === 0);
}

console.log("\n=== GREEN: post-fix behavior ===");
{
  // 1. wilderness mints >=1 animal with high probability across seeded trials.
  let wildHits = 0, wildTrials = 40;
  let holderCount = 0;
  for (let i = 0; i < wildTrials; i++){
    const win = newWin();
    const w = mkWorld(win, { id: "w-wild-"+i, prepNodes: { home: { env: "wilderness", soft:false, locked:false, hook:null } } });
    win.eval(`prepCastAmbient(U.worlds['${w.id}'], 'home');`);
    const recs = animalRecs(win, w, "home");
    if (recs.length >= 1) wildHits++;
    if (recs.some(r => r.dm.territoryHolder)) holderCount++;
  }
  check(`wilderness node mints >=1 animal in >=90% of ${wildTrials} trials`,
    wildHits / wildTrials >= 0.90, `got ${wildHits}/${wildTrials}`);
  check("wilderness's first draw mints a territory-holder in almost every hit (non-ambient, named-record candidate)",
    holderCount / wildTrials >= 0.80, `got ${holderCount}/${wildTrials}`);

  // territory-holder shape: non-ambient, flagged.
  {
    const win = newWin();
    const w = mkWorld(win, { id: "w-holder-shape", prepNodes: { home: { env: "wilderness", soft:false, locked:false, hook:null } } });
    win.eval(`Math.random = function(){ return 0.01; }; prepCastAmbient(U.worlds['${w.id}'], 'home');`);
    const recs = animalRecs(win, w, "home");
    const holder = recs.find(r => r.dm.territoryHolder);
    check("territory-holder record is minted non-ambient (dm.ambient:false)", !!holder && holder.dm.ambient === false, JSON.stringify(holder && holder.dm));
    check("territory-holder record carries envCast + envBand:wilderness", !!holder && holder.dm.envCast === true && holder.dm.envBand === "wilderness");
    check("non-holder draws (if any) stay ambient:true", recs.filter(r=>!r.dm.territoryHolder).every(r => r.dm.ambient === true));
  }

  // 2. dungeon nodes almost never mint (over many trials, mint rate stays low, well under wilderness).
  let dungeonHits = 0, dungeonTrials = 60;
  for (let i = 0; i < dungeonTrials; i++){
    const win = newWin();
    const w = mkWorld(win, { id: "w-dgn-"+i, prepNodes: { home: { env: "dungeon", soft:false, locked:false, hook:null } } });
    win.eval(`prepCastAmbient(U.worlds['${w.id}'], 'home');`);
    const recs = animalRecs(win, w, "home");
    if (recs.length >= 1) dungeonHits++;
  }
  check(`dungeon node mints an animal in <20% of ${dungeonTrials} trials (ENV_PARTIALS.dungeon.animal=0.08)`,
    dungeonHits / dungeonTrials < 0.20, `got ${dungeonHits}/${dungeonTrials}`);

  // settlement-tier derivation: env:"urban" + shop.tier -> rural/village/city.
  {
    const win = newWin();
    check("nodeEnvBand: urban + tier 0 shop -> rural", (() => {
      const w = mkWorld(win, { id:"w-tier0", prepNodes: { home: { env:"urban" } }, shops: { s1: { nodeId:"home", tier:0 } } });
      return win.eval(`nodeEnvBand(U.worlds['${w.id}'], 'home')`) === "rural";
    })());
    check("nodeEnvBand: urban + tier 1 shop -> village", (() => {
      const w = mkWorld(win, { id:"w-tier1", prepNodes: { home: { env:"urban" } }, shops: { s1: { nodeId:"home", tier:1 } } });
      return win.eval(`nodeEnvBand(U.worlds['${w.id}'], 'home')`) === "village";
    })());
    check("nodeEnvBand: urban + tier 2 shop -> city", (() => {
      const w = mkWorld(win, { id:"w-tier2", prepNodes: { home: { env:"urban" } }, shops: { s1: { nodeId:"home", tier:2 } } });
      return win.eval(`nodeEnvBand(U.worlds['${w.id}'], 'home')`) === "city";
    })());
    check("nodeEnvBand: dungeon passes through unchanged", (() => {
      const w = mkWorld(win, { id:"w-dgn2", prepNodes: { home: { env:"dungeon" } } });
      return win.eval(`nodeEnvBand(U.worlds['${w.id}'], 'home')`) === "dungeon";
    })());
    check("nodeEnvBand: no prep env yet -> null (no-op, never guesses)", (() => {
      const w = mkWorld(win, { id:"w-noenv" });
      return win.eval(`nodeEnvBand(U.worlds['${w.id}'], 'home')`) === null;
    })());
  }

  // idempotency: a second prepCastAmbient call on the same node doesn't double-mint animals.
  {
    const win = newWin();
    const w = mkWorld(win, { id:"w-idem", prepNodes: { home: { env: "wilderness" } } });
    win.eval(`Math.random = function(){ return 0.01; }; prepCastAmbient(U.worlds['${w.id}'], 'home');`);
    const firstCount = animalRecs(win, w, "home").length;
    win.eval(`prepCastAmbient(U.worlds['${w.id}'], 'home');`);
    const secondCount = animalRecs(win, w, "home").length;
    check("re-running prepCastAmbient on the same node doesn't re-mint the env-cast animal pool",
      firstCount > 0 && secondCount === firstCount, `first=${firstCount} second=${secondCount}`);
  }

  // SCENE_PARTIALS must stay byte-identical to before this unit.
  {
    const win = newWin();
    const sp = JSON.stringify(win.__scenePartials());
    const expected = JSON.stringify({ shrine:{child:0.10,animal:0.05}, shop:{child:0.15,animal:0.10}, tavern:{child:0.10,animal:0.25}, market:{child:0.50,animal:0.50} });
    check("SCENE_PARTIALS stays byte-identical", sp === expected, sp);
  }

  // the generic ambient NPC pool (AMBIENT_POOL_SIZE) is unaffected by this unit.
  {
    const win = newWin();
    const w = mkWorld(win, { id:"w-npcpool", prepNodes: { home: { env: "village" } } });
    win.eval(`prepCastAmbient(U.worlds['${w.id}'], 'home');`);
    const npcCount = Object.values(w.codex.records).filter(r => r.kind==="npc" && !(r.dm&&r.dm.partial)).length;
    check("generic ambient NPC pool still mints AMBIENT_POOL_SIZE (3) plain NPCs", npcCount === 3, `got ${npcCount}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);

console.log("\n=== Re-run existing prep suite: dev/verify-presence-hooks.mjs (must stay green) ===");
try {
  const out = execFileSync("node", ["dev/verify-presence-hooks.mjs"], { cwd: ROOT, encoding: "utf-8" });
  console.log(out.trim().split("\n").slice(-3).join("\n"));
  console.log("  ✓ verify-presence-hooks.mjs exited 0");
} catch (e) {
  fail++;
  console.log("  ✗ verify-presence-hooks.mjs FAILED");
  console.log(e.stdout || e.message);
}

process.exit(fail ? 1 : 0);
