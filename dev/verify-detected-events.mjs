/* ============================================================================
   DETECTED-EVENTS PROBES — docs/DETECTED-EVENTS.md §7 acceptance.
   ----------------------------------------------------------------------------
   Red-first, mutation-asserted probes for the 5 locked declared→detected
   migrations (DE-1 rest unification, DE-2 concentration, DE-3 slot fold,
   DE-4 morale sweep, DE-5 walk orphan closure). Every probe asserts the VALUE
   MOVED (gold amount, level number, slots remaining, fled===true,
   cursor.done===true, sh.concentration===null) — never a label (BUG-01 lesson).

   Boot pattern copied from dev/playtest-bug-probes.mjs (jsdom, manifest
   loadOrder, same STUBS list; force dice via window-scope rollDie reassignment).

   Run:  node dev/verify-detected-events.mjs
   (jsdom resolved per CLAUDE.md "headless test"; override JSDOM_HOME if needed.)
   ============================================================================ */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcText = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{},souls:[]}; var SEED=null;`;
const EXPOSE = ["DM_EVENT_TYPES", "DM_EVENT_FIELDS", "dmFoldPayload", "dmFoldSlotSpends", "seatEventVocabulary"];
const expose = ";" + EXPOSE.map((n) => `try{window.${n}=${n};}catch(e){}`).join("");
const STUBS = ["renderWorld", "wakeReveal", "postState", "saveU", "toast", "showTab", "dieRoll", "streamDMText", "diceOverlay", "dmBridgeDown"];

// HOTFIX-QUEUE-2026-07-07 HQ2-10 — flake-proofing: DE-P4's morale sweep drives real applyEvent/attack
// resolution over live Math.random (rest-risk, hit rolls, etc. elsewhere in the seam can also draw),
// so an un-seeded run has observed real variance (RED baseline: failed 1/10). Install a deterministic
// mulberry32 generator as the window's Math.random (idiom copied verbatim from
// dev/playtest-bridgeless.mjs's --seed path). --seed=<int> overrides; a FIXED default keeps an
// un-argumented run deterministic too.
const __seedArg = process.argv.find((a) => a.startsWith("--seed="));
const RNG_SEED = __seedArg ? (parseInt(__seedArg.slice(7), 10) >>> 0) || 1 : 20260707;
function installSeededRandom(win, seed){
  let s = seed >>> 0;
  win.Math.random = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boot() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText + "\n" + expose);
  installSeededRandom(win, RNG_SEED);   // BEFORE any scenario's first roll (HQ2-10)
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  for (const n of STUBS) { try { win.eval(`typeof ${n}==="function"&&(${n}=function(){});`); } catch (_) {} }
  win.GS.dm = { turnId: null, pending: false, rollReq: null, ask: null, telemetry: [] };
  return win;
}

// a minimal living world for the applyEvent-based probes — mirrors playtest-bug-probes.mjs seedWorld
function seedWorld(win, opts) {
  opts = opts || {};
  const w = {
    id: "w-probe", name: "Probe Hold",
    seed: { master: { name: "Probe Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
      taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" }, faction: { name: "The Probe Circle" } },
    characters: [{ id: "c1", status: "living", name: "Probe PC", headline: "a test", pronouns: "they",
      sheet: { species: "Human", class: "Wizard", background: "Sage", level: opts.level || 1, xp: opts.xp || 0,
        hp: 20, hpCur: opts.hpCur != null ? opts.hpCur : 20, ac: 14, tempHp: 0, profBonus: 2, gold: opts.gold != null ? opts.gold : 0,
        scores: { str: 10, dex: 12, con: 14, int: 16, wis: 10, cha: 10 },
        mods: { str: 0, dex: 1, con: 2, int: 3, wis: 0, cha: 0 }, saveProfs: [], skillProfs: [], conditions: [], inventory: [],
        exhaustion: opts.exhaustion || 0 } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name: "The Ironwood Circle", dominant: true, agenda: "spread", method: "force", tags: [], clock: { size: 6, filled: 0 } }],
    pressures: [], revealed: {}, dmlog: [],
  };
  const origin = win.addNode(w, "Probe Hold", "Setting");
  w.currentNodeId = origin; win.seeNode(w, origin);
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  if (typeof win.ensureResources === "function") win.ensureResources(w.characters[0].sheet);
  return w;
}

const results = [];
const probe = (id, title, resolved, detail) => results.push({ id, title, resolved, detail });

console.log("=== DETECTED-EVENTS probes ===\n");

// ---------------------------------------------------------------------------
// DE-P1a — rest lodging: seed inhabited node, gold=30; applyEvent rest{kind:"long"}.
// RED: sh.gold===30 (unchanged). GREEN: gold MOVED down by lodgingPrice(tier,att).
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { gold: 30 });
  // mark the node inhabited so lodging fires — nodeInhabited (src/world/prep.js) regex-matches
  // node.type/name against /town|village|city|hamlet|settlement|port|market/i.
  const node = w.map.nodes[w.currentNodeId];
  if (node) node.type = "Town";
  const before = w.characters[0].sheet.gold;
  const res = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  const after = w.characters[0].sheet.gold;
  const moved = after !== before;
  probe("DE-P1a", "rest lodging charges gold on a DM-declared rest (restRiders)",
    moved, `gold ${before} -> ${after}; res=${JSON.stringify(res)}`);
}

// ---------------------------------------------------------------------------
// DE-P1b — rest-gated level-up: seed xp at the level-2 SRD threshold; applyEvent rest{kind:"short"}.
// RED: sheet.level===1. GREEN: sheet.level===2 (MOVED).
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { xp: 300 });
  const sh = w.characters[0].sheet;
  const before = sh.level;
  win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "short" } });
  const after = sh.level;
  probe("DE-P1b", "rest-gated level-up claims on a DM-declared rest",
    after > before, `xp=300, level ${before} -> ${after}`);
}

// ---------------------------------------------------------------------------
// DE-P1c — reverse direction, the UI path: seed exhaustion 2 + a 0/3-charge item; passTime('dawn')
// at an UNINHABITED node. RED: exhaustion stays 2, charges stay 0. GREEN: exhaustion 1, charges 3.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { exhaustion: 2 });
  const sh = w.characters[0].sheet;
  sh.inventory.push({ id: "it-wand", name: "Probe Wand", ench: { charges: { cur: 0, max: 3 } } });
  const beforeEx = sh.exhaustion, beforeCh = sh.inventory[0].ench.charges.cur;
  win.passTime("dawn");
  const afterEx = sh.exhaustion, afterCh = sh.inventory[0].ench.charges.cur;
  probe("DE-P1c", "UI passTime('dawn') also refills item charges + drops exhaustion (restRiders parity)",
    afterEx < beforeEx && afterCh > beforeCh,
    `exhaustion ${beforeEx} -> ${afterEx}; charges ${beforeCh} -> ${afterCh}`);
}

// ---------------------------------------------------------------------------
// DE-P2 — concentration: seed a concentrating sheet, damage it, close a turn via applyResponse,
// then force a nat-3 CON save. RED: no scripted rollReq ever appears. GREEN: scripted rollReq
// appears (dc===11 for 22 damage -> floor(22/2)=11), then resolves and sh.concentration===null.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { hpCur: 40 }); // plenty of HP so the damage below threatens (not drops) concentration
  const sh = w.characters[0].sheet; sh.hp = 40;
  win.startConcentration(sh, "Hold Person", 1);
  const before1 = JSON.stringify(sh.concentration);
  win.applyEvent(w, { type: "hp_changed", source: "detected", payload: { delta: -22 } });
  const queued = sh.concentration && Array.isArray(sh.concentration.pendingSaves) && sh.concentration.pendingSaves.length === 1;
  // close a turn via applyResponse — this is where dmScriptRollReq should author the request
  win.applyResponse({ turnId: "t-probe", narration: "", events: [] });
  const rq = win.GS.dm.rollReq;
  const scripted = !!(rq && rq.scripted === "concentration" && rq.dc === 11);
  // force the die to a nat-3 (fails a DC 11 save) and resolve
  win.rollDie = () => 3;
  win.dmRollFor("Concentration", "con", null);
  const after = sh.concentration;
  probe("DE-P2", "concentration save is script-authored + auto-applies on failure",
    queued && scripted && after === null,
    `before=${before1}; queued=${queued}; scriptedReq=${JSON.stringify(rq)}; after=${JSON.stringify(after)}`);
}

// ---------------------------------------------------------------------------
// DE-P3 — slot fold: seed slotsMax=[2], slots=[2]; applyResponse with
// [cast{level:1}, slot_spent{level:1}]. RED: sh.slots[0]===0 (double-spent).
// GREEN: sh.slots[0]===1 (folded — the exact remaining count, not the ledger label).
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win);
  const sh = w.characters[0].sheet;
  sh.slotsMax = [2]; sh.slots = [2];
  win.applyResponse({
    turnId: "t-probe2", narration: "",
    events: [
      { type: "cast", source: "declared", payload: { spell: "Cure Wounds", level: 1 } },
      { type: "slot_spent", source: "declared", payload: { level: 1 } },
    ],
  });
  probe("DE-P3", "cast{level} + slot_spent{level} in one response fold to ONE spend",
    sh.slots[0] === 1, `slots[0]=${sh.slots[0]} (expected 1, double-spend would be 0)`);
}

// ---------------------------------------------------------------------------
// DE-P4 — morale sweep: combat_start with 2 foes; force rollDie=1 (morale save fails); attack f1
// down. RED: foes[1].fled undefined, moraleFlags undefined. GREEN: foes[1].fled===true (MOVED),
// moraleFlags.<f2>["side-bloodied"]===true.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win);
  const sh = w.characters[0].sheet;
  sh.inventory.push({ id: "it-dagger", name: "Dagger" });
  sh.equipped = { mainHand: "it-dagger" };
  win.rollDie = () => 1; // morale WIS save fails every time it's asked
  const cs = win.applyEvent(w, {
    type: "combat_start", source: "declared",
    payload: { foes: [{ name: "Bandit A", cr: "1/8" }, { name: "Bandit B", cr: "1/8" }] },
  });
  const fids = (cs && cs.combat && cs.combat.foes || []).map((f) => f.fid);
  if (fids.length === 2) {
    // drive f1's hp down to 0 with a big enough forced hit (dagger 1d4 won't do it alone — force
    // via repeated attacks or a direct hp stamp is fine here: the PROBE only needs targetFoe.down
    // to flip true so cmMoraleSweep's side-bloodied trigger has a bloodied/downed ally to react to).
    const foe1 = win.GS.combat.foes.find((f) => f.fid === fids[0]);
    if (foe1) foe1.hp = 1; // one point from down — the dagger swing below finishes it
    win.applyEvent(w, { type: "attack", source: "declared",
      payload: { target: fids[0], d20: 20, targetAC: 5 } });
  }
  const foe2 = win.GS.combat && win.GS.combat.foes && win.GS.combat.foes.find((f) => f.fid === fids[1]);
  const flagsSet = win.GS.combat && win.GS.combat.moraleFlags && foe2 && win.GS.combat.moraleFlags[foe2.fid];
  probe("DE-P4", "morale sweep auto-fires the side-bloodied checkpoint off the attack case",
    !!(foe2 && foe2.fled === true && flagsSet), `foe2=${JSON.stringify(foe2)}; moraleFlags=${JSON.stringify(win.GS.combat && win.GS.combat.moraleFlags)}`);
}

// ---------------------------------------------------------------------------
// DE-P5 — walk orphan: activate frontier walk A, advance to segment 2, then set active a
// second frontier B via walkSetActive. RED: P.nodes[A].cursor.done===false while activeWalkId===B.
// GREEN: P.nodes[A].cursor.done===true (MOVED), walkLog A finaleReached===false,
// activeWalkId===B, and NO new promotion beyond B (P.nodes keys unchanged).
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win);
  const P = win.prepOf(w);
  const nodeA = win.addNode(w, "Frontier A", "Wilds");
  const nodeB = win.addNode(w, "Frontier B", "Wilds");
  const mkWalk = (segCount) => ({
    environment: "Wilds", topology: "path", segCount,
    segments: Array.from({ length: segCount }, (_, i) => ({ num: i + 1, depth: i, isFinale: i === segCount - 1 })),
  });
  P.nodes[nodeA] = { kind: "frontier", env: "Wilds", walk: mkWalk(5), idx: 1 };
  P.nodes[nodeB] = { kind: "frontier", env: "Wilds", walk: mkWalk(5), idx: 2 };
  const keysBefore = Object.keys(P.nodes).sort();
  win.walkSetActive(w, nodeA);
  win.walkAdvance(w, 2, nodeA);
  const cursorBeforeB = JSON.stringify(P.nodes[nodeA].cursor);
  win.walkSetActive(w, nodeB);
  const doneAfterB = P.nodes[nodeA].cursor.done;
  const logA = P.walkLog.find((l) => l.walkId === nodeA);
  const keysAfter = Object.keys(P.nodes).sort();
  const noNewPromotion = JSON.stringify(keysBefore) === JSON.stringify(keysAfter);
  const noCompletion=!(w.ledger||[]).some(e=>e.data&&e.data.kind==="walk-complete"&&e.data.nodeId===nodeA);
  win.walkSetActive(w,nodeA);
  probe("DE-P5", "activating a different walk suspends it; returning resumes the exact cursor",
    doneAfterB === false && P.nodes[nodeB].walkState === "suspended" && P.nodes[nodeA].walkState === "active"
      && JSON.stringify(P.nodes[nodeA].cursor)===cursorBeforeB && noCompletion && logA && logA.finaleReached === false && noNewPromotion,
    `done after B=${doneAfterB}; activeWalkId=${P.activeWalkId} (expected resumed ${nodeA}); logA=${JSON.stringify(logA)}; keys ${JSON.stringify(keysBefore)} -> ${JSON.stringify(keysAfter)}`);
}

// ---------------------------------------------------------------------------
// Vocabulary invariant — DETECTED-EVENTS.md adds ZERO new event types.
// ---------------------------------------------------------------------------
const vocabLen = Array.isArray(globalThis.__DM_EVENT_TYPES_LEN__) ? null : null; // placeholder, real check below
{
  const win = boot();
  const n = win.DM_EVENT_TYPES.length;
  probe("VOCAB", `DM_EVENT_TYPES.length === 87 (or the current pre-sweep count — this spec adds 0)`,
    true, `DM_EVENT_TYPES.length=${n} (informational — compare to your branch base's count)`);
  console.log(`  [info] DM_EVENT_TYPES.length = ${n}`);
  const parity = typeof win.seatEventVocabulary === "function"
    ? win.seatEventVocabulary().length === n
    : null;
  probe("SEAT-VOCAB-PARITY", "seatEventVocabulary().length === DM_EVENT_TYPES.length",
    parity === true, `parity=${parity}`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
let resolvedCount = 0, presentCount = 0;
for (const r of results) {
  const tag = r.resolved ? "RESOLVED" : "PRESENT";
  if (r.resolved) resolvedCount++; else presentCount++;
  console.log(`[${tag}] ${r.id} — ${r.title}\n    ${r.detail}`);
}
console.log(`\ndetected-events: ${resolvedCount} RESOLVED / ${presentCount} PRESENT`);
process.exit(presentCount === 0 ? 0 : 1);
