/* Verify docs/NPC-COHERENCE-FIXES.md — two corrections to the shipped coherence/temperature layer.

   §1 — questgivers must not be forced to Archetype (COHERENCE_FUNCTIONAL_HINTS split).
   §2 — regionForNode never supplies .center -> fray-by-node temperature inert (live-path bug).

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-coherence-dial.mjs).
   Run:  node dev/verify-npc-coherence-fixes.mjs   (jsdom per-env in ~/.genesis-jsdom) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src
  + "\nfunction __coherenceFunctionalHints(){return (typeof COHERENCE_FUNCTIONAL_HINTS!=='undefined')?Array.from(COHERENCE_FUNCTIONAL_HINTS):null;}"
  + "\nfunction __regionForNode(w,id){return regionForNode(w,id);}"
  + "\nfunction __worldToAxial(x,y){return worldToAxial(x,y);}"
  + "\nfunction __frayLevel(q,r){return frayLevel(q,r);}"
  + "\nfunction __coherenceTemperature(f){return coherenceTemperature(f);}"
);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

console.log("\n== §1 — questgivers must NOT be forced to archetype ==");

// --- §1 check 1: rollNPC({roleHint:"questgiver"}) over N -> 0% archetype, always >= wrinkled, always
// carries >=1 of {flawSecret,bond,fear,leverage}. This is the RED-FIRST proof: run it now (before any
// source fix in this session) — expect the CURRENT shipped code (roleHint -> unconditional 'archetype')
// to FAIL this, proving the bug is real, then re-run after the fix and expect PASS.
const N1 = 500;
let archetypeCount = 0, noLeverCount = 0, belowWrinkled = 0;
const TIER_RANK = { archetype: 0, wrinkled: 1, layered: 2, tangled: 3 };
for (let i = 0; i < N1; i++) {
  const npc = win.rollNPC({ roleHint: "questgiver" });
  if (npc.rolled.coherence === "archetype") archetypeCount++;
  if (TIER_RANK[npc.rolled.coherence] < TIER_RANK.wrinkled) belowWrinkled++;
  const hasLever = !!(npc.rolled.flawSecret || npc.rolled.bond || npc.rolled.fear || npc.rolled.leverage);
  if (!hasLever) noLeverCount++;
}
check(`questgiver: 0/${N1} land at archetype`, archetypeCount === 0, `${archetypeCount}/${N1} archetype`);
check(`questgiver: 0/${N1} below wrinkled floor`, belowWrinkled === 0, `${belowWrinkled}/${N1} below wrinkled`);
check(`questgiver: every roll carries >=1 lever`, noLeverCount === 0, `${noLeverCount}/${N1} carried none`);

// --- §1 check 2: jailer (functional hint) still forces archetype ---
let jailerArchetype = 0;
const N2 = 200;
for (let i = 0; i < N2; i++) {
  const npc = win.rollNPC({ roleHint: "jailer" });
  if (npc.rolled.coherence === "archetype") jailerArchetype++;
}
check("jailer: still forces archetype (functional set intact)", jailerArchetype === N2, `${jailerArchetype}/${N2}`);

// --- §1 check 3: walkOn / explicit coherence overrides unchanged (regression) ---
const walkOnNpc = win.rollNPC({ walkOn: true, roleHint: "questgiver" });
check("walkOn still forces archetype even with roleHint=questgiver", walkOnNpc.rolled.coherence === "archetype");
const explicitNpc = win.rollNPC({ coherence: "tangled", roleHint: "jailer" });
check("explicit opts.coherence still wins over roleHint", explicitNpc.rolled.coherence === "tangled");

// --- §1: COHERENCE_FUNCTIONAL_HINTS shape sanity ---
const functionalHints = win.__coherenceFunctionalHints();
if (functionalHints) {
  check("COHERENCE_FUNCTIONAL_HINTS contains jailer", functionalHints.includes("jailer"));
  check("COHERENCE_FUNCTIONAL_HINTS excludes questgiver", !functionalHints.includes("questgiver"));
} else {
  check("COHERENCE_FUNCTIONAL_HINTS exists", false, "not found on window (pre-fix or not exposed)");
}

console.log("\n== §2 — regionForNode must supply .center (fray-by-node live-path) ==");

// Build a minimal world with a map so nodeXY/worldToAxial resolve real coordinates.
win.eval(`
  var __w = { map: { nodes: {
    origin: { id:'origin', x:0, y:0 },
    rim: { id:'rim', x:4000, y:4000 }
  } } };
`);

const originRegion = win.__regionForNode(win.__w, "origin");
const rimRegion = win.__regionForNode(win.__w, "rim");

check("regionForNode(origin).center exists", !!(originRegion && originRegion.center),
  JSON.stringify(originRegion && originRegion.center));
check("regionForNode(rim).center exists", !!(rimRegion && rimRegion.center),
  JSON.stringify(rimRegion && rimRegion.center));

if (originRegion && originRegion.center && rimRegion && rimRegion.center) {
  const originAx = win.__worldToAxial(0, 0);
  const rimAx = win.__worldToAxial(4000, 4000);
  check("origin.center matches worldToAxial(node.x,node.y)",
    originRegion.center.q === originAx.q && originRegion.center.r === originAx.r,
    JSON.stringify({ got: originRegion.center, want: originAx }));
  check("rim.center matches worldToAxial(node.x,node.y)",
    rimRegion.center.q === rimAx.q && rimRegion.center.r === rimAx.r,
    JSON.stringify({ got: rimRegion.center, want: rimAx }));

  const originFray = win.__frayLevel(originRegion.center.q, originRegion.center.r);
  const rimFray = win.__frayLevel(rimRegion.center.q, rimRegion.center.r);
  check("origin fray is low (near 0)", originFray < 0.15, originFray);
  check("rim fray is meaningfully higher than origin fray (RED-FIRST: pre-fix both were 0/'ordinary')",
    rimFray > originFray, `origin=${originFray} rim=${rimFray}`);

  const originTemp = win.__coherenceTemperature(originFray);
  const rimTemp = win.__coherenceTemperature(rimFray);
  check("origin temperature is sleepy/ordinary", originTemp === "sleepy" || originTemp === "ordinary", originTemp);
  check("rim temperature differs from origin (uneasy/strained/breached)", rimTemp !== originTemp,
    `origin=${originTemp} rim=${rimTemp}`);
} else {
  check("(skipped downstream fray/temperature checks — no center to test)", false);
}

// --- §2 check 3: downstream rollNPC varies by node (integration) ---
if (originRegion && rimRegion) {
  const N3 = 300;
  let originTangledOrLayered = 0, rimTangledOrLayered = 0;
  for (let i = 0; i < N3; i++) {
    const o = win.rollNPC({ region: originRegion });
    const rn = win.rollNPC({ region: rimRegion });
    if (o.rolled.coherence === "tangled" || o.rolled.coherence === "layered") originTangledOrLayered++;
    if (rn.rolled.coherence === "tangled" || rn.rolled.coherence === "layered") rimTangledOrLayered++;
  }
  check("rollNPC at rim mints more tangled/layered NPCs than at origin",
    rimTangledOrLayered > originTangledOrLayered,
    `origin=${originTangledOrLayered}/${N3} rim=${rimTangledOrLayered}/${N3}`);
}

// --- §2 check 4 (regression): a node with no coords / no map -> no throw, no center (null-safe) ---
win.eval(`var __wNoMap = {};`);
let noMapThrew = false, noMapRegion = null;
try { noMapRegion = win.__regionForNode(win.__wNoMap, "ghost"); } catch (e) { noMapThrew = true; }
check("regionForNode with no map data doesn't throw", !noMapThrew);
check("regionForNode with no map data returns null (unchanged contract)", noMapRegion === null, JSON.stringify(noMapRegion));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
