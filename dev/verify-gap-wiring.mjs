/* verify-gap-wiring.mjs — headless test for GAP-WIRING (docs/TABLE-GAPS-070126.md §7,
   docs/BATCH3-GUARDRAILS.md J1/J2: gap-wiring ≥10/0). Full-app jsdom load, manifest.loadOrder
   (same "const-via-eval" convention as dev/verify-durability.mjs / dev/verify-world-turn.mjs).

   Enumerated assertions (TABLE-GAPS §7.2 + BATCH3-GUARDRAILS J2):
   1. chase: gap-clock math — a pursuer win closes the gap by 1, a quarry win opens it by 1.
   2. chase: gap reaching 0 ends the chase with outcome:"contact".
   3. chase: gap reaching gapSize*CHASE_AWAY_MULT ends the chase with outcome:"away".
   4. chase: chaseYield resolves either side's declared yield to the matching outcome.
   5. chase: every round rolls exactly one chase-complications result (band+text present).
   6. distant-word: a Distortion row binds to a REAL non-current-node ledger fact (never invents one).
   7. distant-word: recency weighting — an entry within the last 30 days appears twice in the fact pool.
   8. distant-word: a Color row carries no fact (unverifiable atmospheric color, by design).
   9. distant-word MUTATION CHECK: strip the non-current-node filter, confirm a same-node/no-nodeId
      entry gets fabricated into the pool (RED), restore, confirm filtered again (GREEN).
   10. downtime: the fixed 6-intent vocabulary — a 7th invented intent is refused (bad-intent).
   11. downtime: seek-work degrades to a flagged no-op (never fakes a JOB-WALKS posting).
   12. downtime: gold scales by place tier (higher tier -> higher magnitude base for a "+" row).
   13. festival: festivalEligibleFromDrift is Textured+ only (Grounded excluded).
   14. festival: festivalRoll surfaces band/marketEffect/complication from the compiled table.
   15. shrine & omen: a `[the myth] ` placeholder row binds to the world's own rolled myth text.
   16. shrine & omen: a myth-less world leaves the placeholder untouched (never fabricates a myth).
   17. NULL-SAFE regression: every roller degrades to null/false/no-op (never throws) when its table
       isn't compiled (simulated by wiping window.GENESIS_TABLES for that call).

   Run:  node dev/verify-gap-wiring.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

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
  dom.window.eval(harness + "\n" + full);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts){
  opts = opts || {};
  const w = {
    id: opts.id || "w-gap", name: opts.name || "Test World", session: 1,
    startNodeId: "home", currentNodeId: opts.currentNodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 },
                                   far: { id: "far", name: "Farhaven", type: "Setting", x: 5, y: 5 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: opts.day != null ? opts.day : 40, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
    seed: opts.seed || {},
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// ============================================================================
// §1. CHASE — the gap-clock loop
// ============================================================================
console.log("\n--- §1. Chase gap-clock ---");
{
  const win = newWin();
  const chase = win.chaseInit({ targetFid: "foe1", terrain: "urban" });
  const startGap = chase.gap;
  const r1 = win.chaseRound(chase, true);   // pursuer wins -> gap closes by 1
  check("1. a pursuer win closes the gap by 1", r1.chase.gap === startGap - 1, "gap=" + r1.chase.gap);
  const r2 = win.chaseRound(r1.chase, false); // quarry wins -> gap opens by 1
  check("1b. a quarry win opens the gap by 1", r2.chase.gap === startGap, "gap=" + r2.chase.gap);
  check("5. every round rolls one chase-complications result (band+text present)",
    r1.complication && typeof r1.complication.band === "string" && typeof r1.complication.text === "string",
    JSON.stringify(r1.complication));
}
{
  const win = newWin();
  let chase = win.chaseInit({ npcId: "npc1" });
  let res;
  for (let i = 0; i < 10 && (!res || !res.ended); i++) res = win.chaseRound(chase, true);
  check("2. the gap reaching 0 ends the chase with outcome:contact",
    res.ended === true && res.outcome === "contact" && res.chase.active === false, JSON.stringify(res));
}
{
  const win = newWin();
  let chase = win.chaseInit({ npcId: "npc2" });
  let res;
  for (let i = 0; i < 10 && (!res || !res.ended); i++) res = win.chaseRound(chase, false);
  check("3. the gap reaching gapSize*CHASE_AWAY_MULT ends the chase with outcome:away",
    res.ended === true && res.outcome === "away" && res.chase.active === false, JSON.stringify(res));
}
{
  const win = newWin();
  const chase = win.chaseInit({ npcId: "npc3" });
  const y1 = win.chaseYield(chase, "pursuer");
  check("4. chaseYield(pursuer) resolves to outcome:away", y1.outcome === "away" && y1.chase.active === false, JSON.stringify(y1));
  const chase2 = win.chaseInit({ npcId: "npc4" });
  const y2 = win.chaseYield(chase2, "quarry");
  check("4b. chaseYield(quarry) resolves to outcome:contact", y2.outcome === "contact" && y2.chase.active === false, JSON.stringify(y2));
}

// ============================================================================
// §2. DISTANT WORD — the distortion-lens binder
// ============================================================================
console.log("\n--- §2. Distant Word ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 40, currentNodeId: "home", ledger: [
    { id: "e1", type: "outcome", day: 35, data: { nodeId: "far" }, text: "The bridge at Farhaven collapsed." },   // recent (<=30d), non-current -> eligible, double-weighted
    { id: "e2", type: "clock", day: 2, data: { nodeId: "far" }, text: "Old fact from Farhaven." },                // eligible, not recent
    { id: "e3", type: "outcome", day: 39, data: { nodeId: "home" }, text: "Something happened right here." },     // same node -> excluded
    { id: "e4", type: "session", day: 39, data: { nodeId: "far" }, text: "A session marker, wrong type." },       // wrong type -> excluded
  ]});
  const pool = win.distantWordFactPool(w);
  const ids = pool.map(e => e.id);
  const e1Count = ids.filter(x => x === "e1").length;
  const e2Count = ids.filter(x => x === "e2").length;
  check("7. recency weighting — a <=30-day-old non-current entry appears twice in the fact pool",
    e1Count === 2, "e1Count=" + e1Count);
  check("7b. an older (>30d) eligible entry appears once", e2Count === 1, "e2Count=" + e2Count);
  check("distant-word fact pool excludes same-node and wrong-type entries",
    ids.indexOf("e3") === -1 && ids.indexOf("e4") === -1, JSON.stringify(ids));

  // Force many rolls to see both a Distortion and a Color row surface (100-row d100 table, 70/30 split)
  let sawDistortionWithFact = false, sawColorNoFact = false;
  for (let i = 0; i < 60; i++) {
    const r = win.distantWordRoll(w);
    if (!r) continue;
    if (r.lensKind === "Distortion" && r.fact) sawDistortionWithFact = true;
    if (r.lensKind === "Color" && r.fact === null) sawColorNoFact = true;
  }
  check("6. a Distortion row binds to a REAL non-current-node ledger fact", sawDistortionWithFact);
  check("8. a Color row carries no fact (unverifiable atmospheric color, by design)", sawColorNoFact);
}

// 9. MUTATION CHECK — strip the non-current-node filter, confirm RED, restore, confirm GREEN
console.log("\n--- mutation guard: distant-word must NEVER invent a fact (always bind to a REAL ledger entry) ---");
const gapWiringPath = join(ROOT, "src/world/gap-wiring.js");
const originalGapWiring = readFileSync(gapWiringPath, "utf-8");
const mutatedNoFilter = originalGapWiring.replace(
  `  const candidates=log.filter(e=>(e.type==="clock"||e.type==="outcome"||e.type==="drift")
    && e.data && e.data.nodeId!=null && e.data.nodeId!==w.currentNodeId);`,
  `  const candidates=log.filter(e=>(e.type==="clock"||e.type==="outcome"||e.type==="drift"));
  /* MUTATION: non-current-node filter removed — a same-node/no-nodeId entry can now leak into the pool */`
);
if (mutatedNoFilter === originalGapWiring) throw new Error("mutation pattern (§2) didn't match src/world/gap-wiring.js — update the harness");
try {
  writeFileSync(gapWiringPath, mutatedNoFilter, "utf-8");
  const win = newWin();
  const w = mkWorld(win, { day: 40, currentNodeId: "home", ledger: [
    { id: "same-node", type: "outcome", day: 39, data: { nodeId: "home" }, text: "This should never be pickable — same node as the player." },
  ]});
  const pool = win.distantWordFactPool(w);
  check("MUTATION RED: without the non-current-node filter, a same-node entry leaks into the fact pool",
    pool.some(e => e.id === "same-node"), JSON.stringify(pool.map(e=>e.id)));
} finally {
  writeFileSync(gapWiringPath, originalGapWiring, "utf-8");
}
{
  const win = newWin();
  const w = mkWorld(win, { day: 40, currentNodeId: "home", ledger: [
    { id: "same-node", type: "outcome", day: 39, data: { nodeId: "home" }, text: "This should never be pickable — same node as the player." },
  ]});
  const pool = win.distantWordFactPool(w);
  check("RESTORED: after reverting the mutation, the same-node entry is excluded again",
    !pool.some(e => e.id === "same-node"), JSON.stringify(pool.map(e=>e.id)));
}

// ============================================================================
// §3. DOWNTIME LEDGER — intent + week roll + payout hooks
// ============================================================================
console.log("\n--- §3. Downtime Ledger ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const bad = win.downtimeIntent(w, { intent: "gamble" });
  check("10. an invented 7th intent ('gamble') is refused as bad-intent",
    bad.ok === false && bad.reason === "bad-intent", JSON.stringify(bad));
  const seek = win.downtimeIntent(w, { intent: "seek-work" });
  check("11. seek-work degrades to a flagged no-op (never fakes a JOB-WALKS posting)",
    seek.ok === false && seek.reason === "seek-work-unbuilt", JSON.stringify(seek));
  // all five real intents resolve ok
  const okIntents = ["work","carouse","research","train","lie-low"];
  const allOk = okIntents.every(intent => win.downtimeIntent(w, { intent, tier: 1 }).ok === true);
  check("downtime: all five real intents resolve a roll", allOk);
}
{
  const win = newWin();
  const w = mkWorld(win, {});
  // downtimeGoldAmount is deterministic given sign/qualifier/tier — direct unit check, no dice noise
  const lowTier = win.downtimeGoldAmount("+", null, 0);
  const highTier = win.downtimeGoldAmount("+", null, 3);
  check("12. gold scales by place tier — a higher tier yields a higher magnitude base for a '+' row",
    highTier > lowTier, "lowTier=" + lowTier + " highTier=" + highTier);
  const neg = win.downtimeGoldAmount("-", null, 1);
  check("downtime: a '-' sign yields a negative amount (a cost)", neg < 0, "neg=" + neg);
  const neutral = win.downtimeGoldAmount("neutral", null, 1);
  check("downtime: a 'neutral' sign yields exactly 0", neutral === 0, "neutral=" + neutral);
}

// ============================================================================
// §4. FESTIVAL / HOLY-DAY — drift-chain surfacing + market effects
// ============================================================================
console.log("\n--- §4. Festival / Holy-Day ---");
{
  const win = newWin();
  check("13. festivalEligibleFromDrift excludes Grounded", win.festivalEligibleFromDrift("Grounded") === false);
  check("13b. festivalEligibleFromDrift includes Textured+",
    win.festivalEligibleFromDrift("Textured") === true &&
    win.festivalEligibleFromDrift("Strange") === true &&
    win.festivalEligibleFromDrift("Volatile") === true &&
    win.festivalEligibleFromDrift("Mythic") === true);
  const w = mkWorld(win, {});
  const r = win.festivalRoll(w);
  check("14. festivalRoll surfaces band/marketEffect/complication from the compiled table",
    r && typeof r.band === "string" && typeof r.text === "string" && typeof r.marketEffect === "string" && typeof r.complication === "string",
    JSON.stringify(r));
}

// ============================================================================
// §5. SHRINE & OMEN — the dressing lane bound to the world's own myth
// ============================================================================
console.log("\n--- §5. Shrine & Omen ---");
{
  const win = newWin();
  const w = mkWorld(win, { seed: { myth: { name: "The Drowned Bell", desc: "a bell that tolls underwater and is never heard by the living" } } });
  let sawBound = false;
  for (let i = 0; i < 40 && !sawBound; i++) {
    const r = win.shrineOmenRoll(w);
    if (r && r.raw.indexOf("`[the myth]`") >= 0) {
      check("15. a `[the myth]` placeholder row binds to the world's own rolled myth text",
        r.text.indexOf("The Drowned Bell") >= 0 && r.text.indexOf("`[the myth]`") === -1, r.text);
      sawBound = true;
    }
  }
  check("15b. at least one placeholder row was observed and bound in the sample", sawBound);
}
{
  const win = newWin();
  const w = mkWorld(win, { seed: {} });   // no myth
  let sawUnbound = false;
  for (let i = 0; i < 40 && !sawUnbound; i++) {
    const r = win.shrineOmenRoll(w);
    if (r && r.raw.indexOf("`[the myth]`") >= 0) {
      check("16. a myth-less world leaves the placeholder untouched (never fabricates a myth)",
        r.text.indexOf("`[the myth]`") >= 0 && r.myth === null, r.text);
      sawUnbound = true;
    }
  }
  check("16b. at least one placeholder row was observed unbound in the sample", sawUnbound);
}

// ============================================================================
// §6. NULL-SAFE regression — every roller degrades gracefully with no compiled table
// ============================================================================
console.log("\n--- §6. Null-safe degrade (tables not compiled) ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  win.window.GENESIS_TABLES = {};   // simulate the tables not being compiled
  let threw = false;
  let chaseRes, distantRes, downtimeRes, festivalRes, shrineRes;
  try {
    const chase = win.chaseInit({ npcId: "n" });
    chaseRes = win.chaseRound(chase, true);
    distantRes = win.distantWordRoll(w);
    downtimeRes = win.downtimeIntent(w, { intent: "work" });
    festivalRes = win.festivalRoll(w);
    shrineRes = win.shrineOmenRoll(w);
  } catch (e) { threw = true; }
  check("17. every roller degrades to null/false/no-op (never throws) when its table isn't compiled",
    !threw &&
    chaseRes.complication === null &&
    distantRes === null &&
    downtimeRes.ok === false && downtimeRes.reason === "no-table" &&
    festivalRes === null &&
    shrineRes === null,
    JSON.stringify({ threw, chaseRes, distantRes, downtimeRes, festivalRes, shrineRes }));
}

// ============================================================================
console.log(`\n${fail ? "✗" : "✓"} GAP-WIRING: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
