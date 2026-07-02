/* verify-reputation.mjs — headless test for REPUTATION (docs/REPUTATION.md,
   BATCH2-GUARDRAILS H1: reputation ≥8/0):

   Enumerated assertions (spec §4 + H1):
   1. an unwitnessed wilderness kill with no survivors moves NOTHING (the load-bearing gate).
      MUTATION check: break the witness gate, harness fails, then RESTORE.
   2. a fled foe (MONSTER-TACTICS morale-flee) makes the same kill count as witnessed.
   3. claim_deed retro-applies renown for an unwitnessed deed the player claims authorship of.
   4. fade math (repuFadeTick) decays scores toward 0 by RENOWN_FADE/month, snaps under RENOWN_ZERO.
   5. epithet permanence: a fade tick never touches epithets; a big-enough deed requests one
      (dm.needsEpithet) and epithet_grant captures it onto the living PC, permanently.
   6. opening-attitude shift caps at +-2 (repuOpeningAttitudeShift), wired into parley_open.
   7. hunted flag flips at score <= HUNTED_AT (repuHunted/repuHuntedBy).
   8. the character sheet never renders the raw renown score (only epithets/standing words).
   9. regressions: verify-social / verify-dm-events counts unchanged (this file is added to the
      full sweep; those files themselves stay green — see gateSummary).

   Loads EVERY module in manifest load order into one jsdom global scope — the "const-via-eval"
   pattern (CLAUDE.md "headless test").
   Run: node dev/verify-reputation.mjs   (from repo root) */
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
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshDom(){
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + moduleSrc);
  return dom.window;
}

let win = freshDom();

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function freshWorld(win){
  const w = {
    id: "w-rep", name: "Test World",
    seed: { master:{name:"Test",desc:"desc"}, smell:{name:"x"}, sound:{name:"x"}, arch:{name:"x"},
            taboo:{name:"x",desc:"x"}, myth:{name:"x",desc:"x"} },
    characters: [{ status: "living", name: "Ren", headline: "a wanderer", spark: "a wanderer", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: 3, hp: "20/20", ac: 15,
               profBonus: 2, scores: {}, mods: {}, saveProfs: [], skillProfs: [] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 10, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [
      { name: "Ashgate Company", dominant: true, agenda: "control the pass", method: "coin and steel",
        tags: [], clock: { filled: 0, size: 6 }, known: true },
      { name: "The Verdant Circle", dominant: false, agenda: "protect the wood", method: "old law",
        tags: [], rel: "at odds with Ashgate", clock: { filled: 0, size: 6 }, known: true }
    ],
    pressures: [],
    revealed: { powers: 1, map: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(w, "Wilderness Camp", "Place");
  w.currentNodeId = originId;
  w.startNodeId = null;   // NOT the start node — keeps nodeInhabited false for the wilderness gate test
  win.U.worlds[w.id] = w;
  win.U.activeWorldId = w.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null };
  win.GS.combat = null;
  return { w, originId };
}

const need = ["repuOf","repuUnit","repuEpithetMin","repuWitnessed","repuFactionTargets",
  "repuRequestEpithet","repuGrantEpithet","repuApplyDeed","repuClaimDeed","repuFadeTick",
  "repuOpeningAttitudeShift","repuHunted","repuHuntedBy","repuStandingWord","repuEpithetsOf","repuFactionOf"];
check("all reputation globals present after full load", need.every((n) => typeof win[n] === "function"),
      need.filter((n) => typeof win[n] !== "function").join(", "));

// ── 1. THE LOAD-BEARING GATE: unwitnessed wilderness kill with no survivors moves NOTHING ──
{
  const { w } = freshWorld(win);
  const before = JSON.stringify(w.renown || {});
  const r = win.applyEvent(w, { type: "kill", payload: { victimClass: "monster", factionId: "Ashgate Company", cr: "1" }, source: "declared" });
  check("kill: applyEvent still returns ok:true (renown gate is silent, never blocks the event)", r.ok === true);
  check("unwitnessed wilderness kill (no survivors) moves NOTHING", JSON.stringify(w.renown || {}) === before, JSON.stringify(w.renown));
  check("repuWitnessed itself returns false for this scene (no witnesses, uninhabited, no fled foe)",
        win.repuWitnessed(w, { at: w.currentNodeId }) === false);
}

// ── MUTATION: break the witness gate (repuApplyDeed no longer checks it) — must FAIL, then restore ──
{
  const { w } = freshWorld(win);
  const original = win.repuApplyDeed;
  win.eval(`repuApplyDeed = function(w, opts){
    opts=opts||{};
    const R=repuOf(w);
    const weight=(typeof opts.weight==="number")?opts.weight:0;
    if(!weight) return {applied:false};
    const sign=weight>0?1:-1, mag=Math.abs(weight);
    const out={applied:false, factions:[], region:null};
    if(opts.factionKey){
      repuFactionTargets(w, opts.factionKey, sign).forEach(t=>{
        const b=repuBucket(R.factions, t.key); if(!b) return;
        b.score += t.sign*mag*t.mult; out.factions.push({key:t.key});
      });
    }
    out.applied = out.factions.length>0;
    return out;
  };`);
  const before = JSON.stringify(w.renown || {});
  win.applyEvent(w, { type: "kill", payload: { victimClass: "monster", factionId: "Ashgate Company", cr: "1" }, source: "declared" });
  const mutatedBroke = JSON.stringify(w.renown || {}) !== before;
  console.log("  [MUTATION shown RED]", mutatedBroke ? "✓ gate removal DOES leak renown on an unwitnessed kill (as expected of the broken build)" : "✗ mutation had no effect — test is not exercising the gate");
  check("MUTATION CONFIRMED: removing the witness gate lets an unwitnessed kill leak renown", mutatedBroke);
  win.repuApplyDeed = original;   // restore
}
// restore via a fresh DOM (the eval mutation persists in `win` otherwise)
win = freshDom();

// ── 2. a fled foe makes the same kill COUNT (witnessed via GS.combat.foes[].fled) ──
{
  const { w } = freshWorld(win);
  win.GS.combat = { foes: [{ id: "f1", fled: true }] };
  const before = JSON.stringify(w.renown || {});
  win.applyEvent(w, { type: "kill", payload: { victimClass: "monster", factionId: "Ashgate Company", cr: "1" }, source: "declared" });
  check("a fled foe survivor makes the kill WITNESSED (renown applies)", JSON.stringify(w.renown || {}) !== before, JSON.stringify(w.renown));
  check("renown moved AGAINST Ashgate Company (killing their person)", w.renown.factions["ashgate-company"] && w.renown.factions["ashgate-company"].score < 0);
  check("the rival (Verdant Circle) moved the OPPOSITE sign at half weight", w.renown.factions["the-verdant-circle"] && w.renown.factions["the-verdant-circle"].score > 0
    && Math.abs(w.renown.factions["the-verdant-circle"].score) === Math.abs(w.renown.factions["ashgate-company"].score) / 2);
  win.GS.combat = null;
}

// ── 3. claim_deed retro-applies renown for an unwitnessed deed ──
{
  const { w } = freshWorld(win);
  const before = JSON.stringify(w.renown || {});
  const r1 = win.applyEvent(w, { type: "kill", payload: { victimClass: "monster", factionId: "Ashgate Company", cr: "1" }, source: "declared" });
  check("plain unwitnessed kill still moves nothing (sanity re-check before claim)", JSON.stringify(w.renown || {}) === before);
  const r2 = win.applyEvent(w, { type: "claim_deed", payload: { ledgerRef: "kill:test", weight: win.crXp("1"), factionKey: "Ashgate Company" }, source: "declared" });
  check("claim_deed applies renown despite no witnesses", r2.applied === true);
  check("claim_deed moved the faction's score", w.renown.factions["ashgate-company"] && w.renown.factions["ashgate-company"].score !== 0);
}

// ── 4. fade math: repuFadeTick decays toward 0, snaps under RENOWN_ZERO ──
{
  const { w } = freshWorld(win);
  // weight scaled to repuUnit(w) (the reputation deed-weight normalization — a review caught
  // repuApplyDeed storing raw XP-scale weights straight into `score`, saturating every §3
  // consumer on one ordinary deed; weights are now normalized by repuUnit(w) before storage, so
  // fixture weights here are expressed as a multiple of repuUnit(w) rather than a bare number).
  win.repuApplyDeed(w, { weight: 5 * win.repuUnit(w), factionKey: "Ashgate Company", witnessed: true });
  const scoreBefore = w.renown.factions["ashgate-company"].score;
  const r = win.repuFadeTick(w, 1);
  const scoreAfter = w.renown.factions["ashgate-company"].score;
  check("fade tick shrinks the score toward 0 (×RENOWN_FADE)", Math.abs(scoreAfter) < Math.abs(scoreBefore) && scoreAfter > 0);
  // the same deed also moved the rival (repuFactionTargets' half-weight proxy) — fade touches BOTH
  // buckets, so the report counts 2 here (not a bug: this is why the test checks >=1, the load-bearing
  // behavior, rather than an exact count that's an accident of how many factions exist).
  check("fade report counts at least the one faded bucket we're tracking", r.faded >= 1, "faded=" + r.faded);
  // drive it near zero with many ticks, confirm the snap-to-0 floor
  for (let i = 0; i < 200; i++) win.repuFadeTick(w, 1);
  check("repeated fade ticks snap a small score to exactly 0 (RENOWN_ZERO floor)", w.renown.factions["ashgate-company"].score === 0);
}

// ── 5. epithet: fade never touches epithets; a big deed requests one; epithet_grant captures it ──
{
  const { w } = freshWorld(win);
  const unit = win.repuUnit(w);   // level-appropriate E(L)
  win.GS.combat = { foes: [{ id: "f1", fled: true }] };
  const r = win.applyEvent(w, { type: "kill", payload: { victimClass: "monster", factionId: "Ashgate Company", cr: "30" }, source: "declared" });
  // CR 30 -> crXp = 155000, comfortably >= 2x any level-appropriate unit -> epithet requested
  check("a big enough deed requests an epithet (dm.needsEpithet set)", !!(w.dm && w.dm.needsEpithet));
  const grant = win.applyEvent(w, { type: "epithet_grant", payload: { text: "the Pass-Breaker" }, source: "declared" });
  check("epithet_grant captures the DM-supplied text onto the living PC", grant.ok === true && grant.epithet.text === "the Pass-Breaker");
  check("repuEpithetsOf reads it back", win.repuEpithetsOf(w).some(e => e.text === "the Pass-Breaker"));
  check("the request flag is cleared after capture", !w.dm.needsEpithet);
  win.repuFadeTick(w, 12);   // a full year of fade
  check("epithets NEVER fade — still present after aggressive fade ticks", win.repuEpithetsOf(w).some(e => e.text === "the Pass-Breaker"));
  win.GS.combat = null;
}

// ── 6. opening-attitude shift caps at +-2, wired into parley_open ──
{
  const { w } = freshWorld(win);
  // huge positive renown — scaled to repuUnit(w) (see the normalization note in block 4); several
  // multiples of repuUnit(w) comfortably clears RENOWN_STEP*2 on the normalized score scale.
  win.repuApplyDeed(w, { weight: 10 * win.repuUnit(w), factionKey: "Ashgate Company", witnessed: true });
  const shift = win.repuOpeningAttitudeShift(w, "ashgate-company");
  check("repuOpeningAttitudeShift caps at +2 for a huge positive score", shift === 2, "shift=" + shift);
  win.codexAdd(w, { kind: "npc", name: "Guard Captain", provenance: "rolled" });
  win.codexLink(w, "npc:guard-captain", "member-of", "faction:ashgate-company");
  const po = win.applyEvent(w, { type: "parley_open", payload: { target: "npc:guard-captain", openingAttitude: 0 }, source: "declared" });
  check("parley_open's opening is biased by renown (clamped 0+2=2, Helpful)", po.opening === 2, "opening=" + po.opening);
}

// ── 7. hunted flag: score <= HUNTED_AT marks the PC hunted ──
{
  const { w } = freshWorld(win);
  check("not hunted before any deed", win.repuHunted(w, "ashgate-company") === false);
  // deep negative — scaled to repuUnit(w) (see the normalization note in block 4); several
  // multiples of repuUnit(w) comfortably clears HUNTED_AT on the normalized score scale.
  win.repuApplyDeed(w, { weight: -10 * win.repuUnit(w), factionKey: "Ashgate Company", witnessed: true });
  check("hunted flag flips once score <= HUNTED_AT", win.repuHunted(w, "ashgate-company") === true);
  check("repuHuntedBy lists the hunting faction", win.repuHuntedBy(w).includes("ashgate-company"));
}

// ── 8. the character sheet never renders the raw renown score ──
{
  const { w } = freshWorld(win);
  win.repuApplyDeed(w, { weight: -1234.5, factionKey: "Ashgate Company", witnessed: true });
  win.applyEvent(w, { type: "epithet_grant", payload: { text: "the Quiet Debt" }, source: "declared" });
  const cur = w.characters[0];
  const html = win.charSheetBody(w, cur);
  check("standing word (not a number) renders for a known faction", /Standing/.test(html) && /Ashgate Company/.test(html));
  check("epithet renders on the sheet", /the Quiet Debt/.test(html));
  const rawScore = w.renown.factions["ashgate-company"].score;
  check("the raw score never appears literally in the rendered sheet HTML",
        !html.includes(String(rawScore)) && !html.includes(rawScore.toFixed(1)));
}

// ── 9. regressions: verify-social / verify-dm-events stay green (run inline as a spot-check) ──
{
  const { w } = freshWorld(win);
  // dm-events-style fixture kill (civilian, unwitnessed in this fresh headless world) must still
  // append exactly the same ledger shape it did before reputation landed (no renown line leaks in).
  const before = w.ledger.length;
  win.applyEvent(w, { type: "kill", payload: { victimClass: "civilian", factionId: "eel-fishers" }, source: "declared" });
  const killLines = w.ledger.filter(x => x.type === "outcome" && x.data && x.data.kind === "kill");
  check("kill still logs exactly one kill ledger line (unwitnessed -> no extra renown line)", killLines.length === 1);
  const renownLines = w.ledger.filter(x => x.data && x.data.kind === "renown");
  check("no renown ledger line leaked for an unwitnessed civilian kill", renownLines.length === 0);
}

// ── 10. REVIEW FIX: one ordinary CR-appropriate deed does NOT saturate every §3 consumer
// (the scale-reconciliation bug — weight was landing straight into `score` unnormalized, so a
// single CR-1 kill at level 3 hit the opening-attitude cap AND the hunted threshold at once). ──
{
  const { w } = freshWorld(win);
  win.GS.combat = { foes: [{ id: "f1", fled: true }] };
  win.applyEvent(w, { type: "kill", payload: { victimClass: "monster", factionId: "Ashgate Company", cr: "1" }, source: "declared" });
  const score = w.renown.factions["ashgate-company"].score;
  check("one ordinary CR-1 kill moves score by roughly 1 renown unit, not the raw ~-crXp(1) XP value",
        Math.abs(score) < 2, "score=" + score);
  check("one ordinary CR-1 kill does NOT hit the hunted threshold by itself", win.repuHunted(w, "ashgate-company") === false);
  check("one ordinary CR-1 kill does NOT cap opening-attitude shift by itself", Math.abs(win.repuOpeningAttitudeShift(w, "ashgate-company")) < 2);
  win.GS.combat = null;
}

// ── 11. REVIEW FIX: a montage tick fades renown by ~1 day's worth, not a full in-world month
// (play.js's "montage" is mechanically ONE DAY — worldTurn's montage trigger over-faded 30x). ──
{
  const { w } = freshWorld(win);
  win.repuApplyDeed(w, { weight: 10 * win.repuUnit(w), factionKey: "Ashgate Company", witnessed: true });
  const before = w.renown.factions["ashgate-company"].score;
  win.worldTurn(w, "montage");
  const afterOneMontage = w.renown.factions["ashgate-company"].score;
  const oneDayFactor = Math.pow(0.9, 1 / 30);
  check("worldTurn('montage') fades renown by ~1 day (1/30 month), not a full month",
        Math.abs(afterOneMontage - before * oneDayFactor) < 1e-6,
        "before=" + before + " after=" + afterOneMontage + " expected=" + (before * oneDayFactor));
  const fullMonthFactor = 0.9;
  check("a single montage tick is NOT a full month's fade", Math.abs(afterOneMontage - before * fullMonthFactor) > 1e-6);
}

// ── 12. REVIEW FIX: social_check prices renown only on a DECISIVE endpoint that actually moved
// (the "already-max" no-op — already at the ceiling before the roll — must not price a deed).
// The NPC is stamped co-located (status.at) so repuWitnessed's inference reads it as witnessed —
// otherwise the witness gate (not the shift gate) is what blocks the deed, and this assertion
// would pass even against the unfixed code (confirmed: without the `status.at` stamp, the
// pre-fix code ALSO shows no renown movement here, purely because it's unwitnessed — a false
// green). ──
{
  const { w } = freshWorld(win);
  win.codexAdd(w, { kind: "npc", name: "Trade Envoy", provenance: "rolled", status: { at: w.currentNodeId } });
  win.codexLink(w, "npc:trade-envoy", "member-of", "faction:ashgate-company");
  win.codexSetAttitude(w, "npc:trade-envoy", 2, "setup", w.clock.day);   // 2 == ATTITUDE_MAX (a top-level `const`, not a `window` property in jsdom eval)
  check("sanity: the envoy reads as witnessed at this node (co-located NPC)", win.repuWitnessed(w, { at: w.currentNodeId }) === true);
  const before = JSON.stringify(w.renown || {});
  const r = win.applyEvent(w, { type: "social_check", payload: { target: "npc:trade-envoy", skill: "persuasion", total: 99 }, source: "declared" });
  check("social_check at an already-maxed ceiling returns shift:0 (already-max, no rung to climb)", r.shift === 0, "outcome=" + r.outcome + " shift=" + r.shift);
  check("an already-max social_check (no real movement) prices NO renown deed, even though the deed IS witnessed",
        JSON.stringify(w.renown || {}) === before, JSON.stringify(w.renown));
}

console.log(`\nREPUTATION: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
