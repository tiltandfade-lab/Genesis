/* Verify HQ3-C — REST-ECONOMY cluster (docs/HQ3-C-REST-CONCENTRATION.md, units C1-C5).
   jsdom full-app load (manifest.json loadOrder, real applyEvent/restRiders/dmDigest/applyResponse),
   same boot pattern as dev/verify-detected-events.mjs (STUBS list, seeded Math.random, seedWorld).

   Covers:
     C1 — sh.hitDice {cur,max,die} pool: spendHitDice heals (die+CON, floored 0), clamps to `cur`,
          refuses on an empty pool; a long rest regains floor(level/2) min 1 (capped at max);
          applyLevelUp grows the max 1-for-1 with level; resourceDigest ships {cur,max,die}.
     C2 — an INTERRUPTED rest advances a rolled partial window (120-360 long / 15-45 short), never
          the full duration; a non-interrupted rest still advances the full 480/60; restored stays
          null on interruption either way.
     C3 — a second long rest inside 1440 in-world minutes of the last COMPLETED one grants NO
          recovery (restored:"no-benefit-24h"), does not re-stamp lastLongRest, but still advances
          the clock and rolls risk.
     C4 — a severe/interrupted rest-risk sets w.dm.pendingSituation; dmDigest ships it top-level;
          applyResponse's w.dm rebuild carries a FRESH one (set this turn) and drops a SEEN one
          (acked on the next response) — the literal-rebuild silent-wipe trap this unit closes.
     C5 — all 20 rest-table rows have typed receipts; partial recovery and bonus resources are
          script-owned; exact disadvantage language is consumed once; segment riders activate and
          expire with the walk cursor; undefined Penalty/Insight/Boon language stays interpretive.

   Run:  node dev/verify-rest.mjs
   (jsdom resolved per CLAUDE.md "headless test"; override JSDOM_HOME if needed.) */
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
const STUBS = ["renderWorld", "wakeReveal", "postState", "saveU", "toast", "showTab", "dieRoll", "streamDMText", "diceOverlay", "dmBridgeDown", "logEvent", "reveal"];

function installSeededRandom(win, seed) {
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
  win.eval(harness + "\n" + srcText);
  installSeededRandom(win, 20260707);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  for (const n of STUBS) { try { win.eval(`typeof ${n}==="function"&&(${n}=function(){});`); } catch (_) {} }
  win.GS.dm = { turnId: null, pending: false, rollReq: null, ask: null, telemetry: [] };
  return win;
}

// a minimal living world — mirrors verify-detected-events.mjs's seedWorld
function seedWorld(win, opts) {
  opts = opts || {};
  const w = {
    id: "w-rest", name: "Rest Hold",
    seed: { master: { name: "Rest Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
      taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" }, faction: { name: "The Rest Circle" } },
    characters: [{ id: "c1", status: "living", name: "Rest PC", headline: "a test", pronouns: "they",
      sheet: { species: "Human", class: opts.cls || "Fighter", background: "Soldier", level: opts.level || 5, xp: opts.xp || 0,
        hp: opts.hp != null ? opts.hp : 40, hpCur: opts.hpCur != null ? opts.hpCur : 40, ac: 16, tempHp: 0, profBonus: 3,
        gold: opts.gold != null ? opts.gold : 0,
        scores: { str: 14, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
        mods: { str: 2, dex: 1, con: 2, int: 0, wis: 0, cha: 0 }, saveProfs: [], skillProfs: [], conditions: [], inventory: [] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 3, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null, factions: [], pressures: [], revealed: {}, dmlog: [],
  };
  const origin = win.addNode(w, "Rest Hold", "Wilds");
  w.currentNodeId = origin; win.seeNode(w, origin);
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  if (typeof win.ensureResources === "function") win.ensureResources(w.characters[0].sheet);
  return w;
}

const results = [];
const check = (id, title, ok, detail) => { results.push({ id, title, ok, detail }); };

console.log("=== HQ3-C rest-economy verification ===\n");

// =====================================================================================
// C1 — Hit-Dice spend on a short rest
// =====================================================================================
{
  const win = boot();
  const w = seedWorld(win, { hp: 40, hpCur: 20 });
  const sh = w.characters[0].sheet;
  const beforeHp = sh.hpCur, beforeCur = sh.hitDice.cur;
  const res = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "short", spendHitDice: 1, hdRolls: [5] } });
  const expectedHeal = 5 + sh.mods.con;   // literal roll 5 + CON mod (2) = 7
  check("C1-a", "short rest w/ spendHitDice:1 hdRolls:[5] heals exactly (roll+CON) and decrements the pool",
    sh.hpCur === beforeHp + expectedHeal && sh.hitDice.cur === beforeCur - 1 && res.ok && res.hitDice && res.hitDice.ok,
    `hp ${beforeHp}->${sh.hpCur} (expected +${expectedHeal}); hitDice.cur ${beforeCur}->${sh.hitDice.cur}; res.hitDice=${JSON.stringify(res.hitDice)}`);
}
{
  // ledger line emitted for a real spend
  const win = boot();
  const w = seedWorld(win, { hpCur: 10 });
  win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "short", spendHitDice: 1, hdRolls: [4] } });
  const hdLine = w.ledger.find((e) => e.data && e.data.kind === "hit-dice");
  check("C1-b", "a real hit-dice spend emits a ledger line (kind:hit-dice)",
    !!hdLine, `ledger=${JSON.stringify(w.ledger.map((e) => e.data && e.data.kind))}`);
}
{
  // clamp: spendHitDice beyond cur only spends what's left
  const win = boot();
  const w = seedWorld(win, { hpCur: 5 });
  const sh = w.characters[0].sheet;
  sh.hitDice.cur = 1;
  const res = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "short", spendHitDice: 3, hdRolls: [4, 4, 4] } });
  check("C1-c", "spendHitDice beyond cur clamps to what's left (spent===1, cur->0)",
    res.hitDice && res.hitDice.ok && res.hitDice.spent === 1 && sh.hitDice.cur === 0,
    `res.hitDice=${JSON.stringify(res.hitDice)}; sh.hitDice.cur=${sh.hitDice.cur}`);
}
{
  // empty pool refuses cleanly, HP unchanged, no false ledger heal
  const win = boot();
  const w = seedWorld(win, { hpCur: 5 });
  const sh = w.characters[0].sheet;
  sh.hitDice.cur = 0;
  const beforeHp = sh.hpCur, beforeLedgerLen = w.ledger.length;
  const res = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "short", spendHitDice: 1 } });
  const hitDiceLedgerLines = w.ledger.slice(beforeLedgerLen).filter((e) => e.data && e.data.kind === "hit-dice");
  check("C1-d", "an empty hit-dice pool refuses (ok:false reason:no-hit-dice), HP unchanged, no ledger heal",
    res.hitDice && res.hitDice.ok === false && res.hitDice.reason === "no-hit-dice" && sh.hpCur === beforeHp && hitDiceLedgerLines.length === 0,
    `res.hitDice=${JSON.stringify(res.hitDice)}; hp ${beforeHp}->${sh.hpCur}`);
}
{
  // long rest regains floor(level/2) min 1, capped at max
  const win = boot();
  const w = seedWorld(win, { level: 5, hpCur: 10 });
  const sh = w.characters[0].sheet;
  sh.hitDice.cur = 1;   // max is 5 (=level); depleted to 1
  win.restRiskRoll = () => ({ ok: true, class: "camp", text: "a quiet night.", band: null, severe: false, interrupted: false });
  const before = sh.hitDice.cur;
  const res = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  const expectedBack = Math.max(1, Math.floor(sh.level / 2));   // floor(5/2)=2
  check("C1-e", "a long rest regains floor(level/2) min 1 hit dice, capped at max",
    sh.hitDice.cur === Math.min(sh.hitDice.max, before + expectedBack) && res.restored && res.restored.indexOf("hit dice") >= 0,
    `hitDice.cur ${before}->${sh.hitDice.cur} (expected +${expectedBack}, max ${sh.hitDice.max}); restored=${res.restored}`);
}
{
  // digest ships pc.resources.hitDice {cur,max,die}
  const win = boot();
  const w = seedWorld(win, {});
  const sh = w.characters[0].sheet;
  const rd = win.resourceDigest(sh);
  check("C1-f", "resourceDigest ships hitDice {cur,max,die}",
    rd && rd.hitDice && typeof rd.hitDice.cur === "number" && rd.hitDice.max === sh.level && rd.hitDice.die === sh.hitDice.die,
    `resourceDigest.hitDice=${JSON.stringify(rd && rd.hitDice)}`);
}
{
  // applyLevelUp grows hitDice.max by the level delta
  const win = boot();
  const w = seedWorld(win, { level: 3, xp: 0 });
  const sh = w.characters[0].sheet;
  const beforeMax = sh.hitDice.max, beforeCur = sh.hitDice.cur;
  win.applyLevelUp(sh, 6);
  check("C1-g", "applyLevelUp grows hitDice.max (+3 for a 3->6 level-up) and cur alongside",
    sh.hitDice.max === beforeMax + 3 && sh.hitDice.cur === beforeCur + 3,
    `hitDice.max ${beforeMax}->${sh.hitDice.max}; cur ${beforeCur}->${sh.hitDice.cur}`);
}

// =====================================================================================
// C2 — interrupted rest burns only a partial clock
// =====================================================================================
{
  const win = boot();
  const w = seedWorld(win, {});
  win.restRiskRoll = () => ({ ok: true, class: "wild", text: "you are ambushed — no recovery benefits.", band: null, severe: true, interrupted: true });
  const beforeMin = w.clock.day * 1440 + w.clock.min;
  const res = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  const afterMin = w.clock.day * 1440 + w.clock.min;
  const delta = afterMin - beforeMin;
  check("C2-a", "an INTERRUPTED long rest advances the clock by a partial window (120<=delta<=360, <480) and restored===null",
    delta >= 120 && delta <= 360 && delta < 480 && res.restored === null && res.interrupted === true && res.interruptedMinutes === delta,
    `clock delta=${delta}; res=${JSON.stringify({ restored: res.restored, interrupted: res.interrupted, interruptedMinutes: res.interruptedMinutes, minutes: res.minutes })}`);
}
{
  const win = boot();
  const w = seedWorld(win, {});
  win.restRiskRoll = () => ({ ok: true, class: "inn", text: "a quiet night.", band: null, severe: false, interrupted: false });
  const beforeMin = w.clock.day * 1440 + w.clock.min;
  const res = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  const afterMin = w.clock.day * 1440 + w.clock.min;
  check("C2-b", "a NON-interrupted long rest still advances exactly 480",
    afterMin - beforeMin === 480 && res.minutes === 480 && res.interrupted === false,
    `clock delta=${afterMin - beforeMin}; res.minutes=${res.minutes}`);
}
{
  const win = boot();
  const w = seedWorld(win, {});
  win.restRiskRoll = () => ({ ok: true, class: "inn", text: "a quiet night.", band: null, severe: false, interrupted: false });
  const beforeMin = w.clock.day * 1440 + w.clock.min;
  const res = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "short" } });
  const afterMin = w.clock.day * 1440 + w.clock.min;
  check("C2-c", "a NON-interrupted short rest advances exactly 60",
    afterMin - beforeMin === 60 && res.minutes === 60,
    `clock delta=${afterMin - beforeMin}; res.minutes=${res.minutes}`);
}
{
  // UI passTime('dawn') path — same partial-window behavior on an interrupted rest
  const win = boot();
  const w = seedWorld(win, {});
  win.restRiskRoll = () => ({ ok: true, class: "wild", text: "ambush — no recovery benefits.", band: null, severe: true, interrupted: true });
  const fullMinutes = ((360 - w.clock.min) + 1440) % 1440 || 1440;
  const beforeMin = w.clock.day * 1440 + w.clock.min;
  win.passTime("dawn");
  const afterMin = w.clock.day * 1440 + w.clock.min;
  const delta = afterMin - beforeMin;
  const lo = Math.max(1, Math.floor(fullMinutes / 4)), hi = Math.max(lo, Math.floor(fullMinutes * 3 / 4));
  check("C2-d", "UI passTime('dawn') also advances only a partial window on an interrupted rest",
    delta >= lo && delta <= hi && delta < fullMinutes,
    `fullMinutes=${fullMinutes}, band=[${lo},${hi}], delta=${delta}`);
}

// =====================================================================================
// C3 — once-per-24h long-rest benefit gate
// =====================================================================================
{
  const win = boot();
  const w = seedWorld(win, { hpCur: 5 });
  const sh = w.characters[0].sheet;
  win.restRiskRoll = () => ({ ok: true, class: "inn", text: "a quiet night.", band: null, severe: false, interrupted: false });
  const r1 = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  const stampedAfterFirst = JSON.stringify(sh.lastLongRest);
  const hpAfterFirst = sh.hpCur;
  // a second long rest immediately after (elapsed ~0 < 1440)
  sh.hpCur = 5;   // re-wound so a false "refill" would be visible
  const r2 = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  check("C3-a", "back-to-back long rests: 1st refills HP + stamps lastLongRest; 2nd = no-benefit-24h, HP unchanged, no re-stamp",
    hpAfterFirst === sh.hp && r1.restored !== "no-benefit-24h" && sh.lastLongRest &&
    r2.restored === "no-benefit-24h" && sh.hpCur === 5 && JSON.stringify(sh.lastLongRest) === stampedAfterFirst,
    `r1.restored=${r1.restored}; hpAfterFirst=${hpAfterFirst}/${sh.hp}; r2.restored=${r2.restored}; hpAfterSecond=${sh.hpCur}; stamp unchanged=${JSON.stringify(sh.lastLongRest) === stampedAfterFirst}`);
}
{
  const win = boot();
  const w = seedWorld(win, { hpCur: 5 });
  const sh = w.characters[0].sheet;
  win.restRiskRoll = () => ({ ok: true, class: "inn", text: "a quiet night.", band: null, severe: false, interrupted: false });
  win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  sh.hpCur = 5;
  w.clock.day += 1; w.clock.min += 1;   // >=1440 minutes later
  const r2 = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  check("C3-b", "a long rest >=24h after the last one recovers normally and re-stamps",
    r2.restored !== "no-benefit-24h" && sh.hpCur === sh.hp,
    `r2.restored=${r2.restored}; hp=${sh.hpCur}/${sh.hp}`);
}
{
  const win = boot();
  const w = seedWorld(win, {});
  const sh = w.characters[0].sheet;
  win.restRiskRoll = () => ({ ok: true, class: "wild", text: "ambushed — no recovery benefits.", band: null, severe: true, interrupted: true });
  win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  check("C3-c", "an interrupted long rest never stamps lastLongRest (you didn't benefit)",
    sh.lastLongRest == null, `sh.lastLongRest=${JSON.stringify(sh.lastLongRest)}`);
}
{
  // short rests entirely unaffected by the gate
  const win = boot();
  const w = seedWorld(win, { hpCur: 10 });
  const sh = w.characters[0].sheet;
  win.restRiskRoll = () => ({ ok: true, class: "inn", text: "a quiet night.", band: null, severe: false, interrupted: false });
  win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  sh.hpCur = 5;
  const res = win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "short", spendHitDice: 1, hdRolls: [6] } });
  check("C3-d", "short rests are unaffected by the 24h gate (spend still heals right after a long rest)",
    res.hitDice && res.hitDice.ok && res.restored !== "no-benefit-24h",
    `res.hitDice=${JSON.stringify(res.hitDice)}; res.restored=${res.restored}`);
}

// =====================================================================================
// C4 — rest-risk pendingSituation: first-class digest field + ack lifecycle
// =====================================================================================
{
  const win = boot();
  const w = seedWorld(win, {});
  win.restRiskRoll = () => ({ ok: true, class: "camp", text: "a Threat is already inside the site when you wake.", band: null, severe: true, interrupted: false });
  win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  const digest = win.dmDigest();
  check("C4-a", "a severe rest-risk sets w.dm.pendingSituation and the NEXT dmDigest() ships it top-level",
    w.dm && w.dm.pendingSituation && w.dm.pendingSituation.kind === "rest-risk" && w.dm.pendingSituation.severe === true &&
    digest && digest.pendingSituation && digest.pendingSituation.text === w.dm.pendingSituation.text,
    `w.dm.pendingSituation=${JSON.stringify(w.dm && w.dm.pendingSituation)}; digest.pendingSituation=${JSON.stringify(digest && digest.pendingSituation)}`);
}
{
  const win = boot();
  const w = seedWorld(win, {});
  win.restRiskRoll = () => ({ ok: true, class: "camp", text: "a Threat is already inside the site.", band: null, severe: true, interrupted: false });
  win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  check("C4-precheck", "(setup) pendingSituation is present before the DM answers", w.dm && !!w.dm.pendingSituation, "");
  win.applyResponse({ narration: "The camp is calm.", events: [] });
  check("C4-b", "after the DM answers that turn (applyResponse), w.dm.pendingSituation is acked (null again)",
    w.dm && w.dm.pendingSituation === null, `w.dm.pendingSituation=${JSON.stringify(w.dm && w.dm.pendingSituation)}`);
}
{
  // a rest APPLIED WITHIN the answered turn sets a fresh one that survives the w.dm rebuild
  const win = boot();
  const w = seedWorld(win, {});
  win.restRiskRoll = () => ({ ok: true, class: "camp", text: "a Threat is already inside the site.", band: null, severe: true, interrupted: false });
  win.applyResponse({ narration: "You make camp.", events: [{ type: "rest", payload: { kind: "long" } }] });
  const survivedRebuild = w.dm && !!w.dm.pendingSituation;
  const digestAfter = win.dmDigest();
  check("C4-c", "a rest event applied INSIDE applyResponse sets a fresh pendingSituation that survives the w.dm rebuild + rides the following digest",
    survivedRebuild && digestAfter && !!digestAfter.pendingSituation,
    `w.dm.pendingSituation=${JSON.stringify(w.dm && w.dm.pendingSituation)}; digest.pendingSituation=${JSON.stringify(digestAfter && digestAfter.pendingSituation)}`);
  // and it acks on the NEXT plain response
  win.applyResponse({ narration: "Dawn comes quiet after all.", events: [] });
  check("C4-d", "…and it clears (acked) on the NEXT applyResponse with no new rest event",
    w.dm && w.dm.pendingSituation === null, `w.dm.pendingSituation=${JSON.stringify(w.dm && w.dm.pendingSituation)}`);
}
{
  // non-severe flavor roll sets nothing
  const win = boot();
  const w = seedWorld(win, {});
  win.restRiskRoll = () => ({ ok: true, class: "inn", text: "a quiet, uneventful night.", band: null, severe: false, interrupted: false });
  win.applyEvent(w, { type: "rest", source: "declared", payload: { kind: "long" } });
  check("C4-e", "a non-severe (flavor-only) rest-risk sets nothing", !(w.dm && w.dm.pendingSituation), `w.dm=${JSON.stringify(w.dm)}`);
}

// =====================================================================================
// C5 — typed rest-table effects: exact mechanics owned, undefined meaning preserved
// =====================================================================================
{
  const win=boot();
  const rows=Array.from({length:20},(_,i)=>win.restRiskEffectFor("urban-rest-complications",i+1));
  check("C5-a","all 20 shared-semantics rest rows produce typed receipts with table+roll provenance",
    rows.every((e,i)=>e&&e.kind&&e.scope&&e.source.table==="urban-rest-complications"&&e.source.roll===i+1),JSON.stringify(rows));
  check("C5-b","row 6 exposes the missing Spatial/Temporal dependency instead of fabricating a roll",
    rows[5].kind==="temporal-drag"&&rows[5].missingTable==="spatial-temporal",JSON.stringify(rows[5]));
}
{
  const win=boot(),w=seedWorld(win,{hp:40,hpCur:10,level:5}),sh=w.characters[0].sheet;
  sh.hitDice.cur=1;
  win.restRiskRoll=()=>({ok:true,class:"wild",table:"urban-rest-complications",roll:7,text:"half recovery",severe:false,interrupted:false,
    effect:win.restRiskEffectFor("urban-rest-complications",7)});
  const res=win.applyEvent(w,{type:"rest",source:"declared",payload:{kind:"long"}});
  check("C5-c","half-recovery row restores exactly half missing HP and half the normal long-rest Hit Dice",
    sh.hpCur===25&&sh.hitDice.cur===2&&res.recoveryFraction===0.5,`hp=${sh.hpCur}; hitDice=${JSON.stringify(sh.hitDice)}; res=${JSON.stringify(res)}`);
}
{
  const win=boot(),w=seedWorld(win,{hp:40,hpCur:10}),sh=w.characters[0].sheet;
  win.restRiskRoll=()=>({ok:true,class:"camp",table:"urban-rest-complications",roll:9,text:"partial recovery",severe:false,interrupted:false,
    effect:win.restRiskEffectFor("urban-rest-complications",9)});
  const res=win.applyEvent(w,{type:"rest",source:"declared",payload:{kind:"short",spendHitDice:1,hdRolls:[6]}});
  check("C5-d","partial short rest scales Hit-Dice healing inside the shared transaction (8 usual -> 4)",
    res.hitDice&&res.hitDice.healed===4&&sh.hpCur===14,`hp=${sh.hpCur}; hitDice=${JSON.stringify(res.hitDice)}`);
}
{
  const win=boot(),w=seedWorld(win,{}),sh=w.characters[0].sheet;
  win.restRiskRoll=()=>({ok:true,class:"inn",table:"urban-rest-complications",roll:8,text:"next check disadvantage",severe:false,interrupted:false,
    effect:win.restRiskEffectFor("urban-rest-complications",8)});
  win.applyEvent(w,{type:"rest",source:"declared",payload:{kind:"short"}});
  const before=win.resourceDigest(sh),first=win.restEffectCheckMode(sh,"Perception","wis","check"),second=win.restEffectCheckMode(sh,"Perception","wis","check");
  check("C5-e","next-check disadvantage is digest-visible, applies once, then is consumed",
    before.restEffects&&before.restEffects[0].kind==="next-check-disadvantage"&&first.mode==="disadvantage"&&second.mode===null,
    JSON.stringify({before,first,second}));
}
{
  const win=boot(),w=seedWorld(win,{}),sh=w.characters[0].sheet;
  win.restEffectTrack(sh,win.restRiskEffectFor("urban-rest-complications",11));
  const a=win.restEffectsAdvanceSegment(sh,"walk-1",3),active=JSON.stringify(win.resourceDigest(sh).restEffects);
  const b=win.restEffectsAdvanceSegment(sh,"walk-1",4);
  check("C5-f","next-segment rider activates on entry and expires on the following real segment",
    a.activated[0]==="surprise-immunity"&&/\"status\":\"active\"/.test(active)&&b.expired[0]==="surprise-immunity"&&!win.resourceDigest(sh).restEffects,
    JSON.stringify({a,active,b,now:win.resourceDigest(sh)}));
}
{
  const win=boot(),w=seedWorld(win,{level:5}),sh=w.characters[0].sheet;
  sh.hitDice.cur=1;
  win.restRiskRoll=()=>({ok:true,class:"inn",table:"urban-rest-complications",roll:18,text:"extra resource",severe:false,interrupted:false,
    effect:win.restRiskEffectFor("urban-rest-complications",18)});
  const res=win.applyEvent(w,{type:"rest",source:"declared",payload:{kind:"long"}});
  check("C5-g","extra-resource row restores one additional Hit Die after normal long-rest recovery",
    sh.hitDice.cur===4&&res.bonusResource&&res.bonusResource.kind==="hit-die",`hitDice=${JSON.stringify(sh.hitDice)}; bonus=${JSON.stringify(res.bonusResource)}`);
}
{
  const win=boot(),w=seedWorld(win,{hp:40,hpCur:10}),sh=w.characters[0].sheet,before=sh.hitDice.cur;
  win.restRiskRoll=()=>({ok:true,class:"wild",table:"dungeon-rest-complications",roll:1,text:"assaulted",severe:true,interrupted:true,
    effect:win.restRiskEffectFor("dungeon-rest-complications",1)});
  const res=win.applyEvent(w,{type:"rest",source:"declared",payload:{kind:"short",spendHitDice:1,hdRolls:[8]}});
  check("C5-h","an interrupted short rest spends no Hit Die and heals no HP",
    res.hitDice===null&&sh.hitDice.cur===before&&sh.hpCur===10,JSON.stringify({res,hitDice:sh.hitDice,hp:sh.hpCur}));
}
{
  const win=boot(),w=seedWorld(win,{}),sh=w.characters[0].sheet;
  win.restEffectTrack(sh,win.restRiskEffectFor("urban-rest-complications",14));
  const boon=win.restEffectTrack(sh,win.restRiskEffectFor("urban-rest-complications",20));
  win.restEffectTrack(sh,win.restRiskEffectFor("urban-rest-complications",10));
  const generic=win.restEffectCheckMode(sh,"Athletics","str","check");
  check("C5-i","boon debt cancels the next rest Boon, while undefined physical Penalty stays interpretive",
    boon&&boon.cancelled===true&&generic.mode===null&&sh.restEffects.some(e=>e.kind==="next-physical-action-penalty"),
    JSON.stringify({boon,generic,effects:sh.restEffects}));
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
let pass = 0, fail = 0;
for (const r of results) {
  console.log(`  ${r.ok ? "✓" : "✗"} [${r.id}] ${r.title}${r.ok ? "" : "\n      " + r.detail}`);
  if (r.ok) pass++; else fail++;
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
