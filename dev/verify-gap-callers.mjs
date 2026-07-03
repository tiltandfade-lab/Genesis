/* verify-gap-callers.mjs — headless test for the GAP-WIRING CALLER seams (docs/BATCH3-PLAN.md unit 1's
   OPEN tracking line; docs/BATCH3-GUARDRAILS.md J2 "gap-wiring"). The companion to verify-gap-wiring.mjs:
   that harness proves the PURE engine functions (chaseInit/…/shrineOmenRoll) are correct; THIS one proves
   each of the five wave-2a tables now actually FIRES from a real in-app call site (the same
   "wired table actually fires" standard wiring-sweep-A used) — via world.dm's applyEvent event seams and
   world.wiring-b's applyDriftEffect drift-tag seams. Full-app jsdom load, manifest.loadOrder (same
   "const-via-eval" convention as verify-gap-wiring.mjs).

   Enumerated assertions:
   §1 chase   1. chase_start creates GS.chase (the transient clock) + logs the opening.
              2. chase_round FIRES chase-complications from the seam (band+text present) + shifts the gap.
              3. chase_round to contact/away clears GS.chase (the caller owns the lifecycle).
              4. chase_yield clears GS.chase to the matching outcome.
              5. MUTATION: strip chase_start's GS.chase assignment → chase_round can't fire (RED), restore (GREEN).
   §2 distant 6. distant_word FIRES the distant-word table from the seam (ok+lensKind+text).
              7. a Distortion binds to a REAL non-current-node ledger fact; the true fact rides dmOnly only.
              8. distant-word ALSO fires from applyDriftEffect's `rep` drift tag (the second live seam).
   §3 downtime 9. downtime FIRES downtime-ledger for a valid intent (ok+band+text).
              10. a '+' gold row is applied through the SAME item_changed mutator (sheet.gold moves).
              11. bad-intent is refused; seek-work routes to JOB-WALKS postings (no payout roll).
   §4 festival 12. festival FIRES from applyDriftEffect's `festival` drift tag (Textured+ row → festivalRoll).
   §5 shrine  13. shrine_omen FIRES shrine-and-omen (ok+band+text) with its `[the myth]` bound to w.seed.myth.
   §6 tarot   14. every built tarot Major mutator `op` RESOLVES through tarotMajorVector (no throw; op carried) —
                  incl. the guardrail-licensed nearest-implementable `crackedLensBias` (The Moon).
   §7 null-safe 15. every caller seam degrades to a clean {ok:false}/no-op (never throws) with no compiled table.

   Run:  node dev/verify-gap-callers.mjs
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
    id: opts.id || "w-gapc", name: opts.name || "Test World", session: 1,
    startNodeId: "home", currentNodeId: opts.currentNodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 },
                                   far: { id: "far", name: "Farhaven", type: "Setting", x: 5, y: 5 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: opts.day != null ? opts.day : 40, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: opts.gold != null ? opts.gold : 100, mods:{str:1,dex:2}, scores: { str: 12 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: {}, codex: { records: {}, version: 1 },
    seed: opts.seed || {},
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// ============================================================================
// §1. CHASE — the gap-clock caller seams (chase_start / chase_round / chase_yield)
// ============================================================================
console.log("\n--- §1. Chase caller seams ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  win.GS.chase = null;
  win.GS.combat = { foes: [{ fid: "f1", name: "The Cutpurse" }] };   // a fled combat foe as the quarry
  const start = win.applyEvent(w, { type: "chase_start", payload: { targetFid: "f1", terrain: "urban" } });
  check("1. chase_start creates GS.chase and reports the quarry",
    start.ok === true && win.GS.chase && win.GS.chase.active === true && start.quarry === "The Cutpurse", JSON.stringify(start));
  const startGap = win.GS.chase.gap;
  const r1 = win.applyEvent(w, { type: "chase_round", payload: { pursuerWon: true } });
  check("2. chase_round FIRES chase-complications from the seam (band+text) and closes the gap by 1",
    r1.ok === true && r1.complication && typeof r1.complication.band === "string" && typeof r1.complication.text === "string" && r1.gap === startGap - 1,
    JSON.stringify(r1));
  // drive to an end condition (pursuer keeps winning → contact at gap 0)
  let end = r1;
  for (let i = 0; i < 10 && !end.ended; i++) end = win.applyEvent(w, { type: "chase_round", payload: { pursuerWon: true } });
  check("3. reaching an end (contact) clears GS.chase — the caller owns the lifecycle",
    end.ended === true && end.outcome === "contact" && win.GS.chase === null, JSON.stringify(end));
}
{
  const win = newWin();
  const w = mkWorld(win, {});
  win.GS.chase = null;
  const start = win.applyEvent(w, { type: "chase_start", payload: { npcId: "npc-thief" } });   // a non-combat quarry
  const y = win.applyEvent(w, { type: "chase_yield", payload: { side: "pursuer" } });
  check("4. chase_yield(pursuer) resolves to outcome:away and clears GS.chase",
    start.ok === true && y.ok === true && y.outcome === "away" && win.GS.chase === null, JSON.stringify({ start, y }));
  const noQuarry = win.applyEvent(w, { type: "chase_start", payload: {} });
  check("4b. chase_start with no quarry is refused (no-quarry)", noQuarry.ok === false && noQuarry.reason === "no-quarry", JSON.stringify(noQuarry));
  const noChase = win.applyEvent(w, { type: "chase_round", payload: { pursuerWon: true } });
  check("4c. chase_round with no active chase is a clean no-op (no-chase)", noChase.ok === false && noChase.reason === "no-chase", JSON.stringify(noChase));
}

// 5. MUTATION — strip chase_start's GS.chase assignment; the chase can never fire (RED), restore (GREEN).
console.log("\n--- mutation guard: chase_start must actually create GS.chase (else the chase-complications table never fires) ---");
const dmPath = join(ROOT, "src/world/dm.js");
const originalDm = readFileSync(dmPath, "utf-8");
const mutatedDm = originalDm.replace("      GS.chase=chaseInit(opts);\n", "      /* MUTATION: GS.chase assignment removed — the caller no longer opens the clock */\n");
if (mutatedDm === originalDm) throw new Error("mutation pattern (§1) didn't match src/world/dm.js — update the harness");
try {
  writeFileSync(dmPath, mutatedDm, "utf-8");
  const win = newWin();
  const w = mkWorld(win, {});
  win.GS.chase = null;
  let redOk = false, detail = "";
  try {
    win.applyEvent(w, { type: "chase_start", payload: { npcId: "n" } });
    const round = win.applyEvent(w, { type: "chase_round", payload: { pursuerWon: true } });
    redOk = round.ok === false && round.reason === "no-chase" && win.GS.chase == null;
    detail = JSON.stringify(round);
  } catch (e) { redOk = true; detail = "threw: " + e.message; }   // a throw is equally proof the seam is load-bearing — the chase never opened
  check("MUTATION RED: without GS.chase assignment, the chase can't fire (no-chase / throw)", redOk, detail);
} finally {
  writeFileSync(dmPath, originalDm, "utf-8");
}
{
  const win = newWin();
  const w = mkWorld(win, {});
  win.GS.chase = null;
  win.applyEvent(w, { type: "chase_start", payload: { npcId: "n" } });
  const round = win.applyEvent(w, { type: "chase_round", payload: { pursuerWon: true } });
  check("RESTORED: after reverting the mutation, chase_round fires again (ok + a complication)",
    round.ok === true && round.complication && typeof round.complication.text === "string", JSON.stringify(round));
}

// ============================================================================
// §2. DISTANT WORD — the distant_word event seam + the drift `rep` tag seam
// ============================================================================
console.log("\n--- §2. Distant Word caller seams ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 40, currentNodeId: "home", ledger: [
    { id: "e1", type: "outcome", day: 35, data: { nodeId: "far" }, text: "The bridge at Farhaven collapsed." },
  ]});
  let firedText = false, boundDistortion = false, dmOnlyHeld = false, everColorNoFact = false;
  for (let i = 0; i < 80; i++) {
    const r = win.applyEvent(w, { type: "distant_word", payload: {} });
    if (r.ok && typeof r.text === "string" && typeof r.lensKind === "string") firedText = true;
    if (r.ok && r.lensKind === "Distortion" && r.fact && r.fact.ledgerId === "e1") {
      boundDistortion = true;
      // the last ledger line's dmOnly carries the true fact; the player-facing text is the distortion
      const last = w.ledger[w.ledger.length - 1];
      if (last && last.data && last.data.dmOnly && last.data.dmOnly.realFact === "The bridge at Farhaven collapsed.") dmOnlyHeld = true;
    }
    if (r.ok && r.lensKind === "Color" && r.fact === null) everColorNoFact = true;
  }
  check("6. distant_word FIRES the distant-word table from the seam (ok + lensKind + text)", firedText);
  check("7. a Distortion binds to a REAL non-current-node ledger fact (never invents one)", boundDistortion);
  check("7b. the true fact rides dmOnly only (the player hears the distorted telling)", dmOnlyHeld);
  check("7c. a Color row carries no bound fact (unverifiable color, by design)", everColorNoFact);
}
{
  const win = newWin();
  const w = mkWorld(win, { ledger: [ { id: "e1", type: "outcome", day: 35, data: { nodeId: "far" }, text: "A far fact." } ] });
  // applyDriftEffect's `rep` tag (docs/wiring-b §1) is the second live seam for distant-word.
  const driftRoll = { text: "a rumor about you", band: "Textured", cells: ["Textured", "a rumor", "desc", "rep"] };
  const eff = win.applyDriftEffect(w, driftRoll, "home", { data: {} });
  check("8. distant-word ALSO fires from applyDriftEffect's `rep` drift tag",
    eff.tag === "rep" && eff.applied === true && eff.distantWord && typeof eff.distantWord.lensKind === "string", JSON.stringify(eff));
}

// ============================================================================
// §3. DOWNTIME — the downtime event seam
// ============================================================================
console.log("\n--- §3. Downtime caller seam ---");
{
  const win = newWin();
  const w = mkWorld(win, { gold: 500 });
  const r = win.applyEvent(w, { type: "downtime", payload: { intent: "work", tier: 1 } });
  check("9. downtime FIRES downtime-ledger for a valid intent (ok + band + text)",
    r.ok === true && typeof r.band === "string" && typeof r.text === "string", JSON.stringify(r));
  // 10. gold-wire: run many weeks; whenever a row pays gold, the SAME item_changed mutator moves sheet.gold.
  const sh = w.characters[0].sheet;
  let sumApplied = 0, sawGold = false;
  const before = sh.gold;
  for (let i = 0; i < 80; i++) {
    const rr = win.applyEvent(w, { type: "downtime", payload: { intent: "work", tier: 2 } });
    if (rr.ok && typeof rr.gold === "number" && rr.gold !== 0) { sawGold = true; sumApplied += rr.gold; }
  }
  check("10. a gold-bearing week is applied through the SAME item_changed mutator (sheet.gold moves by exactly the sum)",
    sawGold && sh.gold === Math.max(0, before + sumApplied), "before=" + before + " after=" + sh.gold + " sum=" + sumApplied + " sawGold=" + sawGold);
  const bad = win.applyEvent(w, { type: "downtime", payload: { intent: "gamble" } });
  check("11. an invented intent is refused (bad-intent)", bad.ok === false && bad.reason === "bad-intent", JSON.stringify(bad));
  const seek = win.applyEvent(w, { type: "downtime", payload: { intent: "seek-work" } });
  check("11b. seek-work routes to JOB-WALKS postings (no payout roll)",
    seek.ok === true && seek.intent === "seek-work" && Array.isArray(seek.postings) && seek.postings.length >= 2, JSON.stringify(seek));
}

// ============================================================================
// §4. FESTIVAL — the applyDriftEffect `festival` drift-tag seam (a Textured+ drift row chains here)
// ============================================================================
console.log("\n--- §4. Festival caller seam (drift `festival` tag) ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const driftRoll = { text: "the streets are hung with garlands", band: "Textured", cells: ["Textured", "a festival dawns", "desc", "festival"] };
  const eff = win.applyDriftEffect(w, driftRoll, "home", { data: {} });
  check("12. festival FIRES from applyDriftEffect's `festival` drift tag (festivalRoll surfaces band+marketEffect)",
    eff.tag === "festival" && eff.applied === true && eff.festival && typeof eff.festival.band === "string" && typeof eff.festival.marketEffect === "string",
    JSON.stringify(eff));
}

// ============================================================================
// §5. SHRINE & OMEN — the shrine_omen event seam, myth-bound
// ============================================================================
console.log("\n--- §5. Shrine & Omen caller seam ---");
{
  const win = newWin();
  const w = mkWorld(win, { seed: { myth: { name: "The Drowned Bell", desc: "a bell that tolls underwater" } } });
  let fired = false, mythBound = false;
  for (let i = 0; i < 60 && !mythBound; i++) {
    const r = win.applyEvent(w, { type: "shrine_omen", payload: {} });
    if (r.ok && typeof r.band === "string" && typeof r.text === "string") fired = true;
    if (r.ok && r.myth && r.text.indexOf("The Drowned Bell") >= 0) mythBound = true;
  }
  check("13. shrine_omen FIRES shrine-and-omen from the seam (ok + band + text)", fired);
  check("13b. a `[the myth]` row is bound to the world's OWN rolled myth through the seam", mythBound);
}

// ============================================================================
// §6. TAROT re-check — every built Major mutator op RESOLVES now the real systems exist
// ============================================================================
console.log("\n--- §6. Tarot Major mutator ops resolve ---");
{
  const win = newWin();
  const tarotSrc = read("data/tarot.js");
  const ops = [...new Set([...tarotSrc.matchAll(/\bop:"([^"]+)"/g)].map(m => m[1]))];
  check("tarot: at least one Major op was discovered to re-check", ops.length >= 5, "ops=" + JSON.stringify(ops));
  let allResolve = true, bad = [];
  for (const op of ops) {
    let v = null;
    try { v = win.tarotMajorVector({ major: true, domain: "magic", reversed: false, mutator: { op, params: {} } }); }
    catch (e) { v = null; }
    if (!v || v.op !== op) { allResolve = false; bad.push(op); }
  }
  check("14. every built tarot Major op resolves through tarotMajorVector (no throw; op carried for the DM layer)",
    allResolve, "unresolved=" + JSON.stringify(bad));
  // the guardrail-licensed nearest-implementable ref (The Moon → crackedLensBias): confirm it now resolves.
  const moon = win.tarotMajorVector({ major: true, domain: "magic", mutator: { op: "crackedLensBias", params: { extra: 1 } } });
  check("14b. the nearest-implementable `crackedLensBias` (The Moon) resolves — rides op/opParams for the DM layer",
    !!moon && moon.op === "crackedLensBias" && moon.opParams && moon.opParams.extra === 1, JSON.stringify(moon));
}

// ============================================================================
// §7. NULL-SAFE — every caller seam degrades cleanly (never throws) with no compiled table
// ============================================================================
console.log("\n--- §7. Null-safe caller degrade (tables not compiled) ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  win.window.GENESIS_TABLES = {};   // simulate the tables not being compiled
  win.GS.chase = null;
  let threw = false, results = {};
  try {
    win.applyEvent(w, { type: "chase_start", payload: { npcId: "n" } });
    results.chaseRound = win.applyEvent(w, { type: "chase_round", payload: { pursuerWon: true } });   // complication:null, still resolves
    results.distant = win.applyEvent(w, { type: "distant_word", payload: {} });
    results.downtime = win.applyEvent(w, { type: "downtime", payload: { intent: "work" } });
    results.shrine = win.applyEvent(w, { type: "shrine_omen", payload: {} });
  } catch (e) { threw = true; results.err = String(e); }
  check("15. every caller seam degrades cleanly (never throws) when its table isn't compiled",
    !threw &&
    results.chaseRound.ok === true && results.chaseRound.complication === null &&
    results.distant.ok === false && results.distant.reason === "no-table" &&
    results.downtime.ok === false && results.downtime.reason === "no-table" &&
    results.shrine.ok === false && results.shrine.reason === "no-table",
    JSON.stringify(results));
}

// ============================================================================
console.log(`\n${fail ? "✗" : "✓"} GAP-CALLERS: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
