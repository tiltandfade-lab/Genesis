/* Verify the SESSION SEAM (docs/CONSEQUENCE-LADDER.md §7.1–§7.2) — full-app jsdom load.
   Asserts: salience-from-interaction scoring; clock proximity; seamHarvest reads codex handles +
   faction/pressure clocks + last shape; the session-shape PROPOSER heuristics (contrast the last shape,
   fire near clocks, pay off the salient thread, breather when nothing's hot) + determinism; and seamWeave
   classifies trivialize/sustain/escalate. Pure model — no world mutation.

   Run:  node dev/verify-seam.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── globals ─────────────────────────────────────────────────────────────────────
for (const f of ["seamSalienceOf","seamProximity","seamHarvest","seamProposeShape","seamShapeFavors","seamWeave"])
  check(`global ${f}`, typeof win[f] === "function");

// ── salience-from-interaction (§7.1) ───────────────────────────────────────────────
check("salience: untouched soft handle = 0", win.seamSalienceOf({ soft:true }) === 0);
check("salience: locked + known + examined climbs", win.seamSalienceOf({ hard:true, known:true, examined:true }) === 5);
check("salience: rolling the effect die counts", win.seamSalienceOf({ effectRolled:true }) === 2);

// ── clock proximity ───────────────────────────────────────────────────────────────
check("proximity: 5/6 ≈ .83", Math.abs(win.seamProximity({ filled:5, size:6 }) - 0.833) < 0.01);
check("proximity: no clock = 0", win.seamProximity({}) === 0);

// ── harvest (§7.1) ──────────────────────────────────────────────────────────────────
const w = {
  session: 2,
  carryForward: { nextShape: "rest" },
  codex: { records: { a: { id:"a", legs:"thread-seed", pool:"Watcher", hard:true, known:true } } },
  factions: [ { name:"The Knot", dominant:true, clock:{ filled:4, size:6 } } ],
  pressures: [ { kind:"flood", danger:"the rising mere", clock:{ filled:2, size:8 } } ],
};
const cf = win.seamHarvest(w);
check("harvest: lastShape carried from prior nextShape", cf.lastShape === "rest");
check("harvest: open codex handle picked up with salience", cf.openThreads.length===1 && cf.openThreads[0].id==="a" && cf.openThreads[0].salience===3);
check("harvest: faction + pressure clocks become fronts", cf.fronts.length===2 && cf.fronts.some(f=>f.label==="The Knot") && cf.fronts.some(f=>f.label==="the rising mere"));
check("harvest: never mutates w", w.openThreads===undefined && w.fronts===undefined);
// art handles store their tags in `dm` (codexAdd drops unknown top-level fields) — harvest must read there
const wArt = { session:1, codex:{ records:{
  art1:{ id:"art1", kind:"art", status:{soft:true,known:false}, dm:{ legs:"thread-seed", pool:"Watcher" } },
  flav:{ id:"flav", kind:"art", status:{soft:true}, dm:{ legs:"dead-end" } } } }, factions:[], pressures:[] };
const cfArt = win.seamHarvest(wArt);
check("harvest: art handle (tags in dm) picked up as a thread", cfArt.openThreads.length===1 && cfArt.openThreads[0].id==="art1" && cfArt.openThreads[0].kind==="Watcher");
check("harvest: dead-end art is NOT a thread (narrate & forget)", !cfArt.openThreads.some(t=>t.id==="flav"));
check("salience: a hard (locked-to-canon) codex record scores", win.seamSalienceOf({ status:{ soft:false, known:true } }) === 3);

// ── the shape proposer (§7.2) ───────────────────────────────────────────────────────
// 1) contrast the last shape — nothing hot, lastShape=battle → must NOT pick battle again
const pContrast = win.seamProposeShape({ lastShape:"battle", fronts:[], openThreads:[] });
check("propose: contrasts the last shape (no repeat battle)", pContrast.shape !== "battle");
check("propose: nothing hot → a breather (rest/mystery)", ["rest","mystery"].includes(pContrast.shape), pContrast.shape);
// 2) fire near clocks → a decisive shape
const pHot = win.seamProposeShape({ lastShape:null, fronts:[{ id:"f", label:"siege", filled:5, size:6 }], openThreads:[] });
check("propose: a near-firing clock → decisive shape", ["turn","battle","conflict"].includes(pHot.shape), pHot.shape);
// 3) pay off the salient thread by its kind (predation → battle)
const pPay = win.seamProposeShape({ lastShape:null, fronts:[], openThreads:[{ id:"x", kind:"Predation", salience:3 }] });
check("propose: pays off a salient Predation thread → battle", pPay.shape === "battle", pPay.shape);
// 4) deterministic
check("propose: deterministic (same cf → same shape)", win.seamProposeShape({lastShape:"rest",fronts:[],openThreads:[]}).shape === win.seamProposeShape({lastShape:"rest",fronts:[],openThreads:[]}).shape);
// 5) REVEALED PREFERENCE dominates contrast — a battle-every-session player gets battle (no forced variety)
const pPref = win.seamProposeShape({ lastShape:"battle", pref:"battle", fronts:[], openThreads:[] });
check("propose: revealed preference beats the contrast nudge (no forced variety)", pPref.shape === "battle", pPref.shape);
check("propose: output is a soft prior (a ranked distribution + lean flag)", Array.isArray(pPref.ranked) && pPref.ranked.length===6 && pPref.lean===true);

// ── the weave (§7.1) ─────────────────────────────────────────────────────────────────
const plan = win.seamWeave({
  openThreads:[
    { id:"hot",   kind:"Predation", salience:3, clock:0, clockMax:0 },   // invested + battle shape → escalate
    { id:"cold",  kind:"Oracle",    salience:0, clock:0, clockMax:0 },   // untouched, cold → trivialize
    { id:"warm",  kind:"Omen",      salience:1, clock:0, clockMax:0 },   // some interest → sustain
  ],
  fronts:[ { id:"near", label:"siege", filled:5, size:6, salience:0 } ], // near firing → escalate
}, "battle");
const dec = (id) => (plan.find(p=>p.id===id)||{}).decision;
check("weave: salient + shape-fit → escalate", dec("hot")==="escalate", dec("hot"));
check("weave: near-firing clock → escalate", dec("near")==="escalate", dec("near"));
check("weave: untouched + cold → trivialize", dec("cold")==="trivialize", dec("cold"));
check("weave: moderate → sustain", dec("warm")==="sustain", dec("warm"));

console.log(`\nverify-seam: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
