/* U6 determinism diff — bestiaryResolve/bestiaryActivityOf refactor must not change encounter output.
   jsdom, full manifest.loadOrder module load (same convention as dev/verify-realm-wiring.mjs).

   Seeds Math.random with a deterministic LCG so N walk generations (dungeon + urban + wilderness)
   plus quest-hook threat resolution plus combat.resolveCreature produce byte-identical JSON
   pre-refactor and post-refactor. Run once on stashed (pre-fix) code and once on the fix, diff
   the two JSON blobs.

   Run:  node dev/verify-u6-determinism.mjs > /tmp/u6-<tag>.json   (jsdom per-env in ~/.genesis-jsdom) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const accessors = `
  function __bestiary(){ return (typeof BESTIARY!=="undefined") ? BESTIARY : null; }
  function __bestiaryResolve(n){ return (typeof bestiaryResolve==="function") ? bestiaryResolve(n) : undefined; }
  function __bestiaryActivityOf(e){ return (typeof bestiaryActivityOf==="function") ? bestiaryActivityOf(e) : undefined; }
`;
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null; var GS={};`;

// deterministic LCG so Math.random() is reproducible across separate JSDOM instances/processes
function makeLcg(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  win.Math.random = makeLcg(0xC0FFEE);
  return win;
}

const THREAT = { id: "Bandits", role: "raiders", low: "Bandit", mid: "Bandit Captain", boss: "Bandit Chief", scale: "", signs: "" };
const URBAN_THREAT = { id: "Cutthroats", role: "raiders", low: "Thug", mid: "Enforcer", boss: "Crime Boss", scale: "", signs: "" };

const out = { dungeon: [], urban: [], wild: [], qhook: [], resolveCreature: [] };

const win = freshWin();

// 1. dungeon encounters — force enemy branch heavily by sampling many draws
for (let i = 0; i < 60; i++) {
  try {
    const enc = win.dwalkEncounter(THREAT, false, {});
    out.dungeon.push(enc && enc.creatures ? enc.creatures.map(c => ({ slot: c.slot, creature: c.creature, activity: c.activity, displaced: !!c.displaced })) : (enc ? { type: enc.type } : null));
  } catch (e) { out.dungeon.push({ error: String(e) }); }
}

// 2. urban encounters
for (let i = 0; i < 60; i++) {
  try {
    const enc = win.walkEncounter("street", URBAN_THREAT, 2, {});
    out.urban.push(enc && enc.creatures ? enc.creatures.map(c => ({ slot: c.slot, creature: c.creature, activity: c.activity, displaced: !!c.displaced })) : (enc ? { type: enc.type } : null));
  } catch (e) { out.urban.push({ error: String(e) }); }
}

// 3. wilderness encounters
for (let i = 0; i < 60; i++) {
  try {
    const enc = win.wwalkEncounter(1, null, null, {});
    out.wild.push(enc ? { type: enc.type, creature: enc.creature, displaced: !!enc.displaced } : null);
  } catch (e) { out.wild.push({ error: String(e) }); }
}

// 4. qhookResolveThreatCreature — direct
const bestiaryIds = Object.keys(win.__bestiary() || {}).slice(0, 30);
for (const id of bestiaryIds) {
  try {
    const r = win.qhookResolveThreatCreature({ id, boss: win.__bestiary()[id].name });
    out.qhook.push(r ? { id: r.id, name: r.name } : null);
  } catch (e) { out.qhook.push({ error: String(e) }); }
}
// a few slug/name-only lookups too
for (const nm of ["Giant Rat", "the Giant Rat", "Bandit", "Skeleton", "Owlbear", "Not A Real Creature"]) {
  try {
    const r = win.qhookResolveThreatCreature({ id: nm });
    out.qhook.push(r ? { id: r.id, name: r.name } : null);
  } catch (e) { out.qhook.push({ error: String(e) }); }
}

// 5. combat.resolveCreature
for (const nm of ["Giant Rat", "the Giant Rat", "GIANT RAT", "Bandit", "Skeleton", "Owlbear", "Not A Real Creature"]) {
  try {
    const r = win.resolveCreature(nm, {});
    out.resolveCreature.push(r ? { name: r.name, hp: r.hp, ac: r.ac } : null);
  } catch (e) { out.resolveCreature.push({ error: String(e) }); }
}
for (const id of bestiaryIds.slice(0, 10)) {
  try {
    const r = win.resolveCreature(id, {});
    out.resolveCreature.push(r ? { name: r.name, hp: r.hp, ac: r.ac } : null);
  } catch (e) { out.resolveCreature.push({ error: String(e) }); }
}

// 6. sanity — bestiaryResolve equivalence spot check (only meaningful post-refactor; pre-refactor
// these are undefined and the harness reports that explicitly rather than failing)
const spot = [];
for (const nm of ["Giant Rat", "the Giant Rat", "Owlbear"]) {
  const viaResolve = win.__bestiaryResolve ? win.__bestiaryResolve(nm) : undefined;
  spot.push({ nm, id: viaResolve && viaResolve.id, name: viaResolve && viaResolve.name });
}
out.bestiaryResolveSpot = spot;

console.log(JSON.stringify(out, null, 2));
