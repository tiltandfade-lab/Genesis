/* GENESIS MODULE — src/world/gap-wiring.js — GAP-WIRING (docs/TABLE-GAPS-070126.md §7,
   docs/BATCH3-GUARDRAILS.md J2). Classic <script>, shared global scope. Registered in
   manifest.json; validated by check-manifest.py.

   THE AUDIT'S BIG FIND: five wave-2a tables (chase-complications, distant-word, downtime-ledger,
   festival-and-holy-days, shrine-and-omen) shipped fully authored + compiled (tables.json/tables.js,
   100 rows each) with NO caller anywhere in the merged codebase — monster-tactics fires morale-flees
   with nothing to chase into, WORLD-TURN's rumor arm never rolls, and a week in town does nothing.
   This unit is the wiring: the chase gap-clock loop, the Distant-Word distortion-lens binder, the
   downtime intent+ledger+payout loop, festival surfacing off a drift row, and the shrine/omen
   dressing lane bound to the world's own rolled myth.

   §J2 CLOSURES (BATCH3-GUARDRAILS, FINAL):
   - the chase gap-clock lives in GS.chase (transient, like GS.combat) — this file's chase* functions
     are PURE (mirror engine.combat/engine.social: operate only on the passed chase object), the
     caller (world.dm applyEvent) owns creating/clearing GS.chase and committing ledger lines.
   - chase_start payload {targetFid|npcId, terrain}.
   - downtime intents are EXACTLY work · carouse · research · train · lie-low · seek-work (seek-work
     routes to JOB-WALKS — job-walks.js landed 2026-07-02 as its own batch-3 unit; downtimeIntent's
     seek-work branch now calls the real jobBoardRead, no longer a flagged no-op — see job-walks.js).
   - Distant-Word fact pick = salience-weighted over clock|outcome|drift ledger entries from
     NON-current nodes, most recent 30 days weighted double.

   NULL-SAFE posture: the five tables ARE compiled (verified against tables.json before this unit
   was built — chase-complications/distant-word/downtime-ledger/festival-and-holy-days/shrine-and-omen
   each carry 100 rows). Every rollTable() call here still degrades gracefully (returns null → the
   caller logs + no-ops) in case a future recompile ever drops one, matching WORLD-TURN's convention.

   Reads addLedger/ledgerOf/clockOf/nodeName (world.state), codexOf/codexAdd/codexUpdate/codexLinksOf
   (world.codex), rollTable (engine.compiled), rollDie/pick/uid/slug (engine.core), rollNPC
   (engine.codex-roll), lodgingPrice/nodeLodgingTier/nodeOwnerAttitude/nodeInhabited (world.prep +
   data.economy) at call-time.

   ✅ CALLER SEAMS LANDED (2026-07-03, the gap-wiring CALLER follow-up unit — BATCH3-PLAN.md unit 1's
   OPEN tracking line is now CLOSED). This file is still the PURE engine layer; the caller half now
   exists alongside it, so all five tables FIRE in-app:
   - chase-complications: world.dm applyEvent `chase_start`/`chase_round`/`chase_yield` drive a transient
     GS.chase gap clock (created/cleared by the caller, exactly as GS.combat is — these functions never
     touch GS). chase_start fires on a resolved morale-flee + declared pursuit (payload {targetFid|npcId, terrain}).
   - downtime-ledger: applyEvent `downtime` (fixed 6-intent vocab; seek-work routes to JOB-WALKS; gold
     rides item_changed, a contact rides the drift-contact path, a rumor rides distant_word).
   - distant-word: applyEvent `distant_word` (first-class DM seam) AND world.wiring-b applyDriftEffect's
     `rep` tag (fired from turnDriftOnRevisit) — two live seams.
   - festival-and-holy-days: world.wiring-b applyDriftEffect's `festival` tag (a Textured+ Place-Drift
     row chains to festivalRoll) — the seam TABLE-GAPS §4 describes; fired from turnDriftOnRevisit.
   - shrine-and-omen: applyEvent `shrine_omen`, its `[the myth]` bound to w.seed.myth.
   Asserted table-by-table by dev/verify-gap-callers.mjs (each table proven to fire from its seam, the
   wiring-sweep-A "wired table actually fires" standard). The PURE functions remain covered by
   dev/verify-gap-wiring.mjs. */

/* ============================================================================
   §1 — CHASE: the gap-clock loop (TABLE-GAPS §1)
   ============================================================================
   Mechanics (thin, per the spec): a chase is a gap clock, 3 segments — the pursuer closes on a WON
   opposed check, the quarry opens on a LOST one. Each round rolls ONE chase-complications result
   (env-flavored inline — the table's own rows carry Wild:/Dungeon:/Urban: clauses, so one d100 roll
   serves all three envKinds; no per-env table split needed). Ends: gap CLOSED (contact — combat/
   parley) at 0, gap OPENED at gapSize×2 (away — the fled foe persists soft, recall fodder), or
   either side yields (caller-declared). Player always rolls their own dice; the foe side is
   script-rolled like enemy attacks (mirrors MONSTER-TACTICS' autoplay convention) — this file never
   rolls FOR the player; `pursuerWon` is a caller-supplied boolean from an already-resolved opposed
   check (the DM/dm.js applyEvent resolves the actual dice via resolveCheck, same as everywhere else). */

const CHASE_GAP_SIZE = 3;          // segments to CLOSE (contact) — mirrors the spec's "3-segment gap clock"
const CHASE_AWAY_MULT = 2;         // gap OPENS to gapSize*2 before the quarry is fully away

/* chaseInit(opts) — the transient GS.chase shape, PURE (returns a fresh object; the caller assigns
   it to GS.chase, mirroring how GS.combat.moraleFlags is caller-owned per MONSTER-TACTICS). opts:
   {targetFid, npcId, terrain} — targetFid (a live GS.combat foe fid) XOR npcId (a codex npc id,
   for a chase that isn't a combat foe — a fleeing witness, a pickpocket). terrain: "urban"|"wild"|
   "dungeon"|null (best-effort flavor tag for the DM's narration; the table needs no split on it). */
function chaseInit(opts){
  opts=opts||{};
  return {
    active:true,
    gap:Math.ceil(CHASE_GAP_SIZE/2),      // start at the midpoint — neither side has an opening lead
    gapSize:CHASE_GAP_SIZE,
    targetFid:opts.targetFid||null,
    npcId:opts.npcId||null,
    terrain:opts.terrain||null,
    rounds:[]
  };
}

/* chaseRound(chase, pursuerWon) — ONE round: shift the gap (closes toward 0 on a pursuer win, opens
   toward gapSize*CHASE_AWAY_MULT on a quarry win), roll chase-complications, and grade the end state.
   PURE: mutates+returns the PASSED chase object (caller owns persisting GS.chase); never touches w/GS
   directly (mirrors engine.combat/engine.social's contract). Returns:
     { chase, complication:{text,band,total}|null, ended:false }
     or on an end condition: { chase, complication, ended:true, outcome:"contact"|"away" } */
function chaseRound(chase, pursuerWon){
  if(!chase || !chase.active) return {chase, complication:null, ended:false};
  chase.gap += pursuerWon ? -1 : 1;
  const roll=(typeof rollTable==="function")?rollTable("chase-complications"):null;
  const complication=roll?{text:roll.text, band:roll.band, total:roll.total}:null;
  if(!roll) console.warn("[gap-wiring] chase-complications not compiled — round proceeds complication-less (null-safe)");
  chase.rounds.push({pursuerWon:!!pursuerWon, gap:chase.gap, complication});
  if(chase.gap<=0){
    chase.active=false;
    return {chase, complication, ended:true, outcome:"contact"};
  }
  if(chase.gap>=chase.gapSize*CHASE_AWAY_MULT){
    chase.active=false;
    return {chase, complication, ended:true, outcome:"away"};
  }
  return {chase, complication, ended:false};
}

/* chaseYield(chase, side) — either side yields outright (a caller-declared end, not a gap-clock
   resolution — e.g. the DM narrates the quarry surrendering, or the PC breaks off pursuit). PURE. */
function chaseYield(chase, side){
  if(!chase) return {chase, outcome:null};
  chase.active=false;
  return {chase, outcome: side==="pursuer" ? "away" : "contact"};
}

/* ============================================================================
   §2 — DISTANT WORD: the distortion-lens binder (TABLE-GAPS §2, WORLD-TURN §0/§5's rumor arm)
   ============================================================================
   ~60/40 lens-vs-color split lives IN the compiled table (verified: 70/30 Distortion/Color across
   the 100 rows — the table's own authored split, not re-derived here). A Distortion row (cells[1]
   === "Distortion") MUST bind to a REAL ledger fact (a salience-weighted pick over clock|outcome|
   drift entries from a NON-current node) — "let it invent a fact" is the spec's named mutation
   check (§7: "harness fails"). A Color row needs no fact — it's unverifiable atmospheric color by
   design (the spec's "~40% pure far-off color, unverifiable, atmospheric"). */

/* distantWordFactPool(w) — every clock|outcome|drift ledger entry carrying a nodeId that is NOT the
   current node (an entry with no nodeId can't be verified non-current — excluded, never guessed,
   per G9). Recency weight: entries from the last 30 days weigh DOUBLE (§ J2: "most recent 30 days
   weighted double") — implemented as duplicate-in-pool (the same thin weighting trick turnLifeEvent
   uses for recency, no external randomness library needed). */
function distantWordFactPool(w){
  const log=ledgerOf(w);
  const day=clockOf(w).day;
  const candidates=log.filter(e=>(e.type==="clock"||e.type==="outcome"||e.type==="drift")
    && e.data && e.data.nodeId!=null && e.data.nodeId!==w.currentNodeId);
  const pool=[];
  candidates.forEach(e=>{
    pool.push(e);
    if((day-e.day)<=30) pool.push(e);   // recent (<=30d) entries weigh double
  });
  return pool;
}

/* distantWordPick(w) — one salience-weighted real fact from the pool above, or null (no eligible
   ledger entry yet — a young world). Returns the raw ledger entry so the caller/DM holds the TRUTH
   (dm carries the true fact per WORLD-TURN §2's "the DM knows both" framing). */
function distantWordPick(w){
  const pool=distantWordFactPool(w);
  // CROWNING §3.4 — other worlds' crowned/sundered legends widen the rumor pool (cross-region gossip
  // with a mechanical source). Each legend enters as a synthetic pool entry the distortion row can bind
  // to; a legend from THIS world is excluded (it isn't "distant"). Zero model calls — a deterministic pick.
  const legends=(U.legends||[]).filter(L=>L.worldId!==w.id).map(L=>({
    id:"legend:"+L.worldId, type:"legend", day:L.day,
    text:(L.kind==="crowned"?"A distant world was crowned — "+ (L.legend||"remembered")
      :"A distant world was sundered — "+(L.legend||"the Doom won"))+(L.hook?(" (of "+L.hook+")"):""),
    data:{ nodeId:null, legend:true } }));
  const full=pool.concat(legends);
  if(!full.length) return null;
  return full[rollDie(full.length)-1];
}

/* distantWordRoll(w, opts) — roll `distant-word`, bind a Distortion row to a REAL picked fact (never
   invents one — a Distortion row with no eligible fact degrades to reporting `boundFact:null` rather
   than fabricating canon, and the caller/DM should treat it as color-only that turn). A Color row
   never touches the ledger at all — it's flavor by design. NULL-SAFE: distant-word uncompiled →
   null (logged). Returns {text, band, lensKind:"Distortion"|"Color", fact:{...}|null, dm:{realFact}}
   — `dm` mirrors WORLD-TURN's dmOnly convention: the true fact text, for the DM's eyes, never the
   player's (the player hears the DISTORTED telling, i.e. `text`). */
function distantWordRoll(w, opts){
  opts=opts||{};
  const roll=(typeof rollTable==="function")?rollTable("distant-word"):null;
  if(!roll){ console.warn("[gap-wiring] distant-word not compiled — roll skipped (null-safe)"); return null; }
  const lensKind=(roll.cells&&roll.cells[1])||null;   // "Distortion" | "Color" (the table's own column)
  let fact=null;
  if(lensKind==="Distortion"){
    const picked=distantWordPick(w);
    if(picked) fact={ ledgerId:picked.id, type:picked.type, day:picked.day, text:picked.text, nodeId:picked.data&&picked.data.nodeId };
  }
  return { text:roll.text, band:roll.band, lensKind, fact, dm:{ realFact: fact?fact.text:null } };
}

/* ============================================================================
   §3 — DOWNTIME LEDGER: intent + the week roll + payout hooks (TABLE-GAPS §3)
   ============================================================================
   Fixed intent vocabulary (J2, FINAL): work · carouse · research · train · lie-low · seek-work.
   seek-work routes to JOB-WALKS (docs/JOB-WALKS.md — landed 2026-07-02 as its own batch-3 unit):
   downtimeIntent's seek-work branch calls the real jobBoardRead (a defensive {ok:false,reason:
   "seek-work-unbuilt"} guard remains only for the never-expected case of job-walks.js being unloaded).
   The other five intents bias INTERPRETATION only (the DM's
   framing of the same roll) — one table, not five, per the spec ("intent biases interpretation, not
   the die"). */

const DOWNTIME_INTENTS=["work","carouse","research","train","lie-low","seek-work"];

/* downtimePayoutFromText(text) — best-effort text→structured-hook parser (mirrors WORLD-TURN's
   turnOutcomeFromText/turnFateFromText convention: never invents a hook not evidenced in the row's
   own text). Extracts: gold sign (+/-/neutral) + a coarse qualifier (for tier-scaling the amount —
   the actual gp number is the caller's job, tier-scaled per TABLE-GAPS §3), a contact-mint flag, a
   Distant-Word-roll flag, a condition flag, and a thread flag (+ whether the spec calls it "major"). */
function downtimePayoutFromText(text){
  const t=text||"";
  const tl=t.toLowerCase();
  let goldSign=null;
  if(/gold\s*[+]/i.test(t)) goldSign="+";
  else if(/gold\s*[−-]/i.test(t)) goldSign="-";
  else if(/gold\s*neutral/i.test(tl)) goldSign="neutral";
  let goldQualifier=null;
  const qm=/gold[^;.]*?\(([^)]*)\)/i.exec(t);
  if(qm) goldQualifier=qm[1].trim();
  return {
    goldSign, goldQualifier,
    mintContact:/mint (?:one |a )?ambient contact/i.test(tl) || /contact/i.test(tl) && /mint/i.test(tl),
    distantWord:/distant word/i.test(tl),
    condition:/condition/i.test(tl),
    thread:/thread/i.test(tl),
    threadMajor:/thread\b[^.]*\(major\)/i.test(tl) || /major\)/i.test(tl) && /thread/i.test(tl),
    flavorOnly:/flavor only/i.test(tl)
  };
}

/* downtimeGoldAmount(sign, qualifier, tier) — TABLE-GAPS §3: "gold ± scaled by place tier". Thin,
   provisional scaling (tuned like ECONOMY-SINKS' LODGING_GP — a small tunable table, not a formula
   pulled from nowhere): a tier-scaled BASE (mirrors LODGING_GP's own tier curve so a downtime week's
   take is in the same monetary universe as a night's lodging), nudged by the row's own qualifier
   (below-average/average/above-average/modest/minimum/moderate/small/exact-match) when present.
   `sign` "-" returns a negative (a cost, e.g. a carouse debt); "neutral"/null → 0. */
const DOWNTIME_BASE_BY_TIER={0:4,1:6,2:10,3:16};
function downtimeGoldAmount(sign, qualifier, tier){
  if(sign==null || sign==="neutral") return 0;
  const base=DOWNTIME_BASE_BY_TIER[tier]!=null?DOWNTIME_BASE_BY_TIER[tier]:DOWNTIME_BASE_BY_TIER[1];
  const q=(qualifier||"").toLowerCase();
  let mult=1;
  if(/below|modest|minimum|small/.test(q)) mult=0.5;
  else if(/above|moderate/.test(q)) mult=1.5;
  const amt=Math.max(1,Math.round(base*mult));
  return sign==="-" ? -amt : amt;
}

/* downtimeIntent(w, opts) — THE WEEK-UNIT (§3): validate intent → ONE downtime-ledger roll → parsed
   payout hooks, tier-scaled. Does NOT itself charge lodging or advance the clock (passTime already
   owns both — ECONOMY-SINKS' montage lodging hook fires from the SAME passTime("montage") call the
   caller makes; this function is the "what did the week actually YIELD" roll layered on top, per the
   spec's sequence: "player declares intent → montage passes the week (lodging charged) → ONE roll
   here"). opts:{intent, tier} — tier defaults to nodeLodgingTier(w,w.currentNodeId) when available.
   Returns {ok:false,reason:"bad-intent"} for anything outside the fixed vocabulary (never invents a
   6th intent) · seek-work now ROUTES to JOB-WALKS (docs/JOB-WALKS.md — landed as its own batch-3 unit,
   closing the gap this function used to flag): {ok:true, intent:"seek-work", postings:[...]} from a
   real jobBoardRead call (a board read, per JOB-WALKS §1 — 2-3 postings), or the same
   {ok:false,reason:"seek-work-unbuilt"} degrade if job-walks.js somehow isn't loaded (defensive only —
   never expected once this unit ships; matches every other typeof-guarded call in this file) ·
   {ok:true, text, band, payout:{gold, mintContact, distantWord, condition, thread, threadMajor}}
   on any other resolved roll. NULL-SAFE: downtime-ledger uncompiled → {ok:false,reason:"no-table"}. */
function downtimeIntent(w, opts){
  opts=opts||{};
  const intent=opts.intent;
  if(DOWNTIME_INTENTS.indexOf(intent)<0) return {ok:false, reason:"bad-intent"};
  if(intent==="seek-work"){
    if(typeof jobBoardRead!=="function") return {ok:false, reason:"seek-work-unbuilt", note:"src/world/job-walks.js not loaded."};
    const postings=jobBoardRead(w, opts);
    return {ok:true, intent, postings};
  }
  const roll=(typeof rollTable==="function")?rollTable("downtime-ledger"):null;
  if(!roll) return {ok:false, reason:"no-table"};
  const hookText=(roll.cells&&roll.cells[3])||"";
  const parsed=downtimePayoutFromText(hookText);
  const tier=(opts.tier!=null)?opts.tier:((typeof nodeLodgingTier==="function")?nodeLodgingTier(w,w.currentNodeId):1);
  const gold=downtimeGoldAmount(parsed.goldSign, parsed.goldQualifier, tier);
  return {
    ok:true, intent, text:roll.text, band:roll.band, hookText,
    payout:{ gold, mintContact:parsed.mintContact, distantWord:parsed.distantWord,
             condition:parsed.condition, thread:parsed.thread, threadMajor:parsed.threadMajor, flavorOnly:parsed.flavorOnly }
  };
}

/* ============================================================================
   §4 — FESTIVAL / HOLY-DAY: drift-chain surfacing + market effects (TABLE-GAPS §4)
   ============================================================================
   "A Textured+ drift row can BE a festival" (WORLD-TURN §2 chains here) OR downtime rolls one via
   `payout.flavorHook` calling this directly. Market effects live in the table's own cells[3]
   ("Prices dip for a week after." / "All prices suspend for the day…") — this file surfaces the
   roll + the raw effect text; applying an actual price multiplier to a live shop is
   ECONOMY/SHOP-UI's job (out of this unit's scope — the hook is the text, not a shop mutator, same
   posture as WORLD-TURN's place-drift leaving codex mutation to its own call site). */

/* festivalEligibleFromDrift(driftBand) — TABLE-GAPS §4: a Textured+ drift row MAY chain to a
   festival roll (never must — the caller/DM decides whether to actually chain; this just reports
   eligibility so the decision isn't a guess about what "Textured+" means). */
function festivalEligibleFromDrift(driftBand){
  const i=SPICE_ORDER.indexOf(driftBand);
  return i>=SPICE_ORDER.indexOf("Textured");
}

/* festivalRoll(w) — roll `festival-and-holy-days`; returns {text, band, marketEffect, complication}
   (cells: [Band, headline, desc, marketEffect, complication] per the compiled columns) or null
   (uncompiled, logged). */
function festivalRoll(w){
  const roll=(typeof rollTable==="function")?rollTable("festival-and-holy-days"):null;
  if(!roll){ console.warn("[gap-wiring] festival-and-holy-days not compiled — roll skipped (null-safe)"); return null; }
  const cells=roll.cells||[];
  return { text:roll.text, band:roll.band, marketEffect:cells[3]||null, complication:cells[4]||null };
}

/* ============================================================================
   §5 — SHRINE & OMEN: the dressing lane bound to the world's OWN myth (TABLE-GAPS §5)
   ============================================================================
   Every one of the 100 compiled rows carries a literal `[the myth]` placeholder (verified against
   tables.json) — the row is a FRAME; the world's own rolled myth (w.seed.myth) fills it. Never
   invents a myth of its own; a world with no seed.myth degrades to leaving the placeholder in the
   dm-only raw text (flagged, never fabricated — the caller/DM can still narrate around it, same
   posture as every other null-safe degrade in this file). */

function shrineOmenRoll(w){
  const roll=(typeof rollTable==="function")?rollTable("shrine-and-omen"):null;
  if(!roll){ console.warn("[gap-wiring] shrine-and-omen not compiled — roll skipped (null-safe)"); return null; }
  const myth=(w&&w.seed&&w.seed.myth)?w.seed.myth:null;
  const bound=myth ? roll.text.split("`[the myth]`").join(myth.name+" ("+myth.desc+")") : roll.text;
  return { text:bound, band:roll.band, raw:roll.text, myth:myth?{name:myth.name,desc:myth.desc}:null };
}
