/* Genesis — verify the death → bardo passage → successor flow in a full-app jsdom load.
   Death & Rebirth build step 7 (docs/DEATH-AND-REBIRTH.md): the reworked src/world/fate.js routes a
   death through runBardo (gap drift + 14 visions) and renders the passage, then rolls a new soul.

   Loads EVERY module in manifest order into one global scope (the classic-script const-sharing
   pattern; see verify-dm-events.mjs), gives the DOM a real origin so localStorage works, stubs the
   app-tail globals the flow touches, then drives killCharacter → closeBardo and asserts the world
   mutated correctly and the passage rendered.

   Run: node dev/verify-rebirth-flow.mjs
   (jsdom installed per-environment in a scratch dir — JSDOM_HOME=/path or ~/.genesis-jsdom.) */
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
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;
  var STAGES=[],WORLDBEATS=[],GUIDE={},LIFE_STEP={};`;

const dom = new JSDOM(`<!doctype html><html><body>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(harness + "\n" + src);
win.eval(`window.prompt=function(){return 'The Drowned Mire';};
  rollCharacter=function(){window.__successor=true;};
  showTab=function(){};renderWorld=function(){};toast=function(){};`);

let pass = 0, fail = 0;
const ok = (c, m) => c ? pass++ : (fail++, console.log("  FAIL:", m));

// reworked symbols present; legacy spawn-back retired
ok(["killCharacter","openBardo","renderBardoPassage","closeBardo"].every(n => typeof win[n] === "function"), "reworked fate fns present");
ok(typeof win.FATE_THRESHOLD === "undefined", "legacy FATE_THRESHOLD retired");
ok(["openFate","rollFate","finishFate","closeFate"].every(n => typeof win[n] === "undefined"), "legacy spawn-back fns gone");

const result = win.eval(`(function(){
  var w={id:'w',name:'Saltmarsh',clock:{day:6,min:500},ledger:[],log:[],gazetteer:[],
    seed:{faction:{name:'The Tithe-Keepers'},master:{name:'Saltmarsh'}},factions:[],pressures:[],
    map:{nodes:{}},characters:[{id:'pc1',name:'Robin',status:'living',bornWhere:'Saltmarsh'}]};
  rollStartingState(w);
  U.worlds={w:w};U.activeWorldId='w';
  var clockBefore=w.clock.day;
  killCharacter('pc1');
  var c=w.characters[0];
  return {
    fallen: c.status==='fallen',
    fellWhenInWorld: !!(c.fellWhen&&typeof c.fellWhen.day==='number'),
    noLegacyFellAt: !('fellAt' in c),
    deathCanon: w.ledger.some(e=>e.type==='canon'&&e.data.kind==='death'),
    hasVisions: Array.isArray(c.visions)&&c.visions.length>0,
    clockAdvanced: w.clock.day>=clockBefore,
    modalShown: document.getElementById('bardoModal').classList.contains('show'),
    passageRendered: /The Bardo/.test(document.getElementById('bardoBody').textContent),
    fateText: typeof c.fate==='string'&&/bardo/i.test(c.fate),
  };
})()`);
ok(result.fallen, "character marked fallen");
ok(result.fellWhenInWorld, "fellWhen stamped in in-world time");
ok(result.noLegacyFellAt, "no legacy wall-clock fellAt");
ok(result.deathCanon, "death written to the ledger as canon");
ok(result.hasVisions, "the bardo dreamt visions onto c.visions");
ok(result.clockAdvanced, "the world clock advanced across the gap");
ok(result.modalShown, "the bardo passage modal is shown");
ok(result.passageRendered, "the passage rendered (The Bardo)");
ok(result.fateText, "the fallen character's fate records the bardo");

// corpse created at death + recoverable by a living PC at the fall site (step 5)
const corpse = win.eval(`(function(){
  var w=U.worlds.w, dead=w.characters[0];
  if(!dead.corpse) return {made:false};
  var taker={id:'succ',name:'Brunn',status:'living',sheet:{inventory:[],gold:0}};
  w.characters.push(taker);
  w.currentNodeId = slug(dead.fellWhere);
  var hereBefore = corpsesAt(w, w.currentNodeId).length;
  recoverFallen(dead.id);
  return { made:true, context:dead.corpse.context.tag, hereBefore:hereBefore,
           looted:dead.corpse.looted, hereAfter: corpsesAt(w, w.currentNodeId).length };
})()`);
ok(corpse.made, "a corpse is created at death");
ok(!!corpse.context, "the corpse carries an environmental context");
ok(corpse.hereBefore===1, "corpsesAt surfaces the body at the fall site");
ok(corpse.looted, "recoverFallen claims the corpse when a living PC stands there");
ok(corpse.hereAfter===0, "a claimed corpse no longer surfaces as recoverable");

const closed = win.eval(`(function(){closeBardo();
  return {hidden:!document.getElementById('bardoModal').classList.contains('show'),successor:!!window.__successor};})()`);
ok(closed.hidden, "closeBardo hides the passage");
ok(closed.successor, "closeBardo rolls a brand-new successor");

console.log(`\nverify-rebirth-flow: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
