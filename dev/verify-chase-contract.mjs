/* Verify CHASE-CONTRACT-FIX (docs/CHASE-CONTRACT-FIX.md) — the solo-foe auto-end race that broke
   COMBAT-LIFECYCLE.md §3d's "chase_start before combat_end" contract (dev/playtest-chase-0704-findings.md
   finding #1/#2, finding #5). jsdom over the real genesis.html modules (same bootstrap convention as
   dev/verify-combat-lifecycle.mjs — nearest neighbor: it already drives combat via applyEvent).

   Implements the checks from CHASE-CONTRACT-FIX.md "Verification" verbatim:
     1. ⊗ RED-FIRST: solo foe driven to flee via foe_morale -> GS.combat still non-null, resolvable set,
        NO combat_end in the ledger. Red on pre-fix master (auto-end fires today).
     2. All-down path unchanged: two foes both driven to down via attack -> detected combat_end still
        auto-fires with outcome "resolved".
     3. Contract sequence: after check 1's state, chase_start{targetFid} then combat_end{outcome:"fled"}
        -> chase carries the foe's REAL name; combat tears down; panel restore honors a null pre-fight
        panel (finding #5).
     4. ⊗ MUTATION: (run separately by the caller, reverting the cmMaybeAutoEnd split) -> checks 1 and 3
        go red; re-apply -> green. Both runs recorded in the session report, not in this file.
     5. Digest: dmDigest().combat.resolvable present when flagged, absent otherwise.

   Run:  node dev/verify-chase-contract.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const DOM_HTML = `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`;

function freshWin() {
  const dom = new JSDOM(DOM_HTML, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

function makeWorld(win, opts = {}) {
  const sheetOverrides = opts.sheet || {};
  const world = {
    id: "w-chase", name: "The Chase Contract Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting the seam" },
            smell:{name:"smoke"}, sound:{name:"wind"}, arch:{name:"stone"},
            taboo:{name:"t",desc:"d"}, myth:{name:"m",desc:"d"} },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: Object.assign({
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16, dex: 12 }, mods: { str: 4, con: 3, dex: 1 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [{ id:"w1", name:"Dagger", qty:1, conditions:[] }],
        equipped: { mainHand:"w1", offHand:null, armor:null }, pools: {},
      }, sheetOverrides) }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name:"Copper Hand", dominant:false, agenda:"a", method:"b", tags:[], clock:{filled:0,size:6} }],
    pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = opts.gamePanel!==undefined ? opts.gamePanel : null;
  win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  return world;
}

// force a solo foe to flee via foe_morale: supply p.trigger by hand (finding #3's documented DM
// workaround — moraleTrigger can't auto-derive a trigger for foes.length===1), neutralize
// creatureType so MORALE_MODS never auto-passes it (CR-fallback resolution is non-deterministic —
// finding #4 — and can land on an undead/construct type that always auto-passes its save), and pin
// d20:1 (a guaranteed-fail wis save against the fixed MORALE_DC) + dispositionRoll:1 (-> "flee",
// the d6<=3 bucket) so the outcome resolves to "flee" deterministically every run.
function forceSoloFlee(win, world, fid) {
  const foe = (win.GS.combat.foes || []).find(f => f.fid === fid);
  if (foe) foe.creatureType = "humanoid";
  return win.applyEvent(world, { type: "foe_morale", payload: { foe: fid, trigger: "first-blood", d20: 1, dispositionRoll: 1 } });
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") => {
  if (cond) { pass++; console.log("  ✓", name); }
  else { fail++; console.log("  ✗", name, "—", detail); }
};

// ============================================================================
// CHECK 1 (⊗ RED-FIRST): solo foe morale-flee must NOT auto-end combat
// ============================================================================
function runCheck1() {
  const win = freshWin();
  const world = makeWorld(win);
  const r0 = win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  check("1a. combat_start ok", r0 && r0.ok === true, JSON.stringify(r0));
  const preLedgerLen = world.ledger.length;
  const mr = forceSoloFlee(win, world, fid);
  check("1b. foe_morale resolves ok, disposition flee", mr && mr.ok === true && mr.disposition === "flee", JSON.stringify(mr));
  check("1c. GS.combat is STILL non-null after the lone foe flees (no auto-end race)", win.GS.combat !== null, JSON.stringify(win.GS.combat));
  check("1d. GS.combat.resolvable is set", win.GS.combat && win.GS.combat.resolvable && win.GS.combat.resolvable.outcome === "fled",
    win.GS.combat && JSON.stringify(win.GS.combat.resolvable));
  const newLedgerEntries = world.ledger.slice(preLedgerLen);
  check("1e. NO combat-end entry rode in on the foe_morale pass", !newLedgerEntries.some(e => e.data && e.data.kind === "combat-end"),
    JSON.stringify(newLedgerEntries.map(e=>e.data&&e.data.kind)));
  return { win, world, fid };
}

// ============================================================================
// CHECK 2: all-down path unchanged — detected combat_end still auto-fires "resolved"
// ============================================================================
function runCheck2() {
  const win = freshWin();
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25 }, { name:"Goblin", cr:0.25 }] } });
  const foes = win.GS.combat.foes;
  let guard = 0;
  while (win.GS.combat && !foes.every(f=>f.down) && guard < 100) {
    for (const f of foes) { if (!f.down) win.applyEvent(world, { type:"attack", payload:{ d20:20, target:f.fid } }); }
    guard++;
  }
  check("2a. both foes driven down", foes.every(f=>f.down), "guard="+guard);
  check("2b. GS.combat is null (detected combat_end auto-fired)", win.GS.combat === null);
  const lastClose = world.ledger.slice().reverse().find(e=>e.data && e.data.kind === "combat-end");
  check("2c. the close ledger entry reflects a resolved (all-down) outcome", lastClose && lastClose.data.outcome === "resolved",
    lastClose && JSON.stringify(lastClose.data));
}

// ============================================================================
// CHECK 3: contract sequence off check 1's state — chase_start (real name) then combat_end;
// panel restore honors a null pre-fight panel (finding #5)
// ============================================================================
function runCheck3() {
  const win = freshWin();
  const world = makeWorld(win, { gamePanel: null });
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25 }] } });
  win.renderWorld(); // opens the combat panel, stashes prevPanel = null (pre-fight panel was null)
  const fid = win.GS.combat.foes[0].fid;
  forceSoloFlee(win, world, fid);
  check("3a. (setup) GS.combat still alive post-flee", win.GS.combat !== null);

  const rc = win.applyEvent(world, { type: "chase_start", payload: { targetFid: fid } });
  check("3b. chase_start succeeds", rc && rc.ok === true, JSON.stringify(rc));
  check("3c. chase_start carries the foe's REAL name, not 'the quarry'", rc.quarry === "Cartel Lookout", rc.quarry);
  const chaseLedger = world.ledger[world.ledger.length-1];
  check("3d. the ledger line names the real foe", chaseLedger && chaseLedger.text.indexOf("Cartel Lookout") >= 0, chaseLedger && chaseLedger.text);

  const re = win.applyEvent(world, { type: "combat_end", payload: { outcome: "fled" } });
  check("3e. combat_end ok", re && re.ok === true, JSON.stringify(re));
  check("3f. GS.combat is null after teardown", win.GS.combat === null);
  check("3g. GS.chase survives combat teardown", win.GS.chase && win.GS.chase.active === true, JSON.stringify(win.GS.chase));

  win.renderWorld();
  check("3h. finding #5: a null pre-fight panel restores to null, not 'map'", win.GS.gamePanel === null, win.GS.gamePanel);
}

// ============================================================================
// CHECK 5: dmDigest().combat.resolvable present when flagged, absent otherwise
// ============================================================================
function runCheck5() {
  const win = freshWin();
  const world = makeWorld(win);
  win.U.activeWorldId = world.id;
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  const dBefore = win.dmDigest();
  check("5a. digest.combat.resolvable is ABSENT before any foe resolves", dBefore && dBefore.combat && dBefore.combat.resolvable == null, JSON.stringify(dBefore.combat && dBefore.combat.resolvable));

  forceSoloFlee(win, world, fid);
  const dAfter = win.dmDigest();
  check("5b. digest.combat.resolvable is PRESENT (a string) once every foe is fled/surrendered", dAfter && dAfter.combat && typeof dAfter.combat.resolvable === "string", JSON.stringify(dAfter && dAfter.combat && dAfter.combat.resolvable));
  const resolvableStr = dAfter && dAfter.combat && dAfter.combat.resolvable;
  check("5c. the resolvable string names the DM's choice (combat_end or chase_start)", typeof resolvableStr === "string" && /combat_end/.test(resolvableStr) && /chase_start/.test(resolvableStr), resolvableStr);
}

console.log("=== CHECK 1 (RED-FIRST): solo foe flee must not auto-end ===");
runCheck1();
console.log("\n=== CHECK 2: all-down path unchanged ===");
runCheck2();
console.log("\n=== CHECK 3: contract sequence + finding #5 panel restore ===");
runCheck3();
console.log("\n=== CHECK 5: digest.combat.resolvable ===");
runCheck5();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
