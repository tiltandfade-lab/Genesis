/* GENESIS MODULE — src/world/wiring-a.js — WIRING-SWEEP-A (docs/WIRING-MAP.md §B Wave A,
   docs/BATCH3-PLAN.md unit 10, docs/BATCH3-GUARDRAILS.md J1 "wiring-sweep-A"). Classic <script>,
   shared global scope. Registered in manifest.json; validated by build/check-manifest.py.

   The Wave-A wire-in queue MINUS `npc-job-board` (promoted to its own unit, docs/JOB-WALKS.md,
   landed as src/world/job-walks.js) — this unit closes the REMAINING seven true orphans:

   §1 REST-RISK — `urban-rest-complications`/`dungeon-rest-complications` (WIRING-MAP item 4,
      "rethought per Adam"): sleep is a resource with risk, SCALED BY SECURITY CLASS. restRiskRoll
      grades the node's security (paid inn > hamlet/rough-camp > wilderness camp > dungeon — the
      only per-node signals this codebase actually carries: nodeLodgingTier + nodeInhabited + the
      walk environment) and rolls the matching rest-complications table; a row whose OWN TEXT reads
      as a violent interruption ("violently interrupted" / "already inside" / "No recovery benefits")
      can INTERRUPT the rest (skip restRecover) — never a guessed Spice band, since neither table
      carries one (verified against tables.json: both column-2 bands are blank for all 20 rows).
      Composes with lodging: a paid bed (tier>=1, inhabited) rolls at the SAFEST class; unpaid/
      wilderness/dungeon rest rolls progressively riskier classes (higher chance of interrupt).

   §2 IF-IGNORED → WORLD-TURN ESCALATION — `npc-if-ignored` + `npc-if-ignored-regional-effects`
      (WIRING-MAP item 8, "no house still on fire 50 days later" — Adam's directive, time-honesty
      is the product): a codex thread record (dm.legs is "hook"|"thread-seed", !dm.resolved) that
      has sat untouched past a staleness threshold rolls ONE npc-if-ignored result (what the NPC
      DOES about being ignored) + regional-effects when the thread carries a region tag, ledgered
      as `drift`, and stamps dm.ignoredRolls (an escalating counter — the SAME thread never re-rolls
      the same day, and repeat ignoring escalates rather than repeating the exact same roll forever).
      Wired into worldTurn's montage branch (src/world/turn.js) — one sweep per montage, mirrors
      repuFadeTick/jobBoardTick's existing wiring shape.

   §3 CREATURE-PARLEY-WANTS → SOCIAL — `creature-parley-wants` (WIRING-MAP item 6): when
      monster-tactics' rollMorale breaks a foe to "surrender", the script ROLLS what the creature
      wants (never leaves it to the DM to invent) and stashes it on the foe (foe.parleyWant); SOCIAL's
      parley_open (src/world/dm.js) defaults p.want from the live combat foe's stashed want when the
      caller doesn't supply one explicitly — a real fact, not a DM guess, matching the anti-drift
      posture of every other mechanized system in this batch.

   §4 MONSTER-BEHAVIOR-IF-HUNTED — `monster-behavior-if-hunted` (WIRING-MAP item 7): when
      rollMorale breaks a foe to "flee"/"rout-panic", the script rolls the creature's hunted
      behavior (Flees immediately / Lures toward hazard / Splits using terrain / etc.) and stashes
      it on the foe (foe.huntedBehavior) + the morale ledger line. This is the "hunted's rolled
      behavior" the WIRING-MAP names; it feeds gap-wiring's chase engine (chaseInit/chaseRound) the
      moment a caller actually starts a chase — that caller (the `chase_start` applyEvent case) is
      OUT OF SCOPE for this unit (flagged open by gap-wiring's own STATUS SPLIT note, BATCH3-PLAN.md;
      building it here would silently re-open a boundary another unit explicitly owns). This unit's
      job is only the table roll + the surfaced fact — never inventing the chase seam itself (G9).

   §5 REGION-ENCOUNTER — `region-encounter` (WIRING-MAP item 10): regional walk bias for wilderness
      legs. The "malformed header" flag (docs/NEXT-STEPS.md) does NOT reproduce against the CURRENT
      source markdown (Engine/03. _Tables/03. Session Mechanics/encounters/Region Encounter.md
      carries a clean header row; tables.json's compiled region-encounter has all 20 rows present,
      row 1 "No Encounter" intact) — recompiled + hand-verified before writing this file (G9: never
      guess a gap that isn't real). Wired as an ADDITIVE per-leg regional-flavor roll (regionEncounterRoll),
      gated on a region actually being present (regionForNode/opts.region) — null-safe, no region ⇒
      no roll, byte-identical to today's behavior (matches every other region-optional call in this
      codebase, e.g. regionBiasedArchetypePool).

   §6 TAVERN-ENCOUNTERS — `tavern-encounters` (WIRING-MAP item 5): the tavern kit's ambient lane.
      tavernEncounterRoll fires ALONGSIDE tavernContactFire (src/world/urban.js's buildingContact,
      type==="tavern") — a chance-gated roll (ambient, not guaranteed every contact), reusing the
      d12+d8 bell table verbatim.

   §7 URBAN/WILDERNESS INTERACTABLES — `urban-interactable-object` + `wilderness-interactable-object`
      (WIRING-MAP item 9): the walk object lane, same slot dungeon-walk.js already wires
      (`dungeon-interactable-object` → segment.object). walkPickInteractable(envKind) is the shared
      picker both engine.walk (urban) and engine.wild-walk (wilderness) call per non-finale segment/
      leg — kept HERE (not duplicated in each roller) since it's pure table-pick logic with no
      environment-specific shape beyond the table id, mirroring how dwalkSecret/dwalkArea are kept
      local-but-shared-by-name inside dungeon-walk.js itself. Called from src/engine/walk.js and
      src/engine/wild-walk.js — those two small call-site edits are the only cross-file wiring this
      §7 needs (walkPick/walkRows load before this file in manifest order — see callTimeDeps).

   §8 SEED DISPATCH / ADAM'S RIDER (WIRING-MAP item 2 + JOB-WALKS.md §4) — VERIFIED, NOT REBUILT:
      `urban-rumor-intel` and `urban-catalyst` are ALREADY rolled inside rollUrbanWalk (src/engine/
      walk.js: the "Rumor" branch + `setup.catalyst`/finale `catalystCallback`) — the seed-dispatch
      requirement ("≥1 non-urban seed anchor guarantee") is ALREADY structurally satisfied by
      engine.prep-bundle's pbundlePlan, which ALWAYS assembles exactly [urban, dungeon, wilderness]
      — one of each, every prep, never urban-only. No code change was needed here; the harness
      verifies this distribution property directly against prep-bundle rather than re-deriving it.

   NULL-SAFE throughout (matches WORLD-TURN/JOB-WALKS/GAP-WIRING convention): every rollTable() call
   degrades to a logged no-op / flagged {ok:false,reason} if a table isn't compiled or a dependency
   isn't loaded — never a fabricated result.

   Reads addLedger/ledgerOf/clockOf/nodeName (world.state), codexOf/codexGet (world.codex),
   rollTable (engine.compiled), rollDie (engine.core), nodeLodgingTier/nodeInhabited (world.prep),
   regionForNode (engine.region), restRecover (engine.resources) at call-time. */

/* ============================================================================
   §1 — REST-RISK: security-class-scaled rest complications
   ============================================================================ */

/* restSecurityClass(w, nodeId, kind, env) — the coarse SECURITY CLASS this rest happens under, from
   the ONLY per-node signals this codebase carries (no bespoke "security" field exists — inventing
   one would violate G9; this derives the class from real, already-wired signals):
     "inn"     — dawn/montage, inhabited node, tier>=1 (a PAID bed — lodging was actually charged;
                 see play.js's passTime, which charges lodging at any inhabited node) — SAFEST.
     "camp"    — dawn/montage, inhabited node, tier 0 (hamlet — a roof but no real security) OR a
                 short rest anywhere inhabited.
     "wild"    — dawn/montage/short at a node that ISN'T inhabited and isn't inside a dungeon walk —
                 open-country camping.
     "dungeon" — env passed as "dungeon" (the caller is resting mid-dungeon-walk) — RISKIEST.
   `env` is an optional override (the caller's own walk environment, e.g. "dungeon"/"urban"/
   "wilderness") for when the rest happens mid-walk rather than at a settled node. */
function restSecurityClass(w, nodeId, kind, env){
  if(env==="dungeon") return "dungeon";
  const inhabited=(typeof nodeInhabited==="function") ? nodeInhabited(w, nodeId) : false;
  if(!inhabited) return "wild";
  if(kind==="short") return "camp";
  const tier=(typeof nodeLodgingTier==="function") ? nodeLodgingTier(w, nodeId) : 0;
  return tier>=1 ? "inn" : "camp";
}

/* REST_RISK_CLASS (J2-style provisional constants, tunable): per security class, which table to
   roll (urban-rest-complications reads naturally as a settled-node table; dungeon-rest-complications
   for mid-dungeon rests; wilderness gets the urban table too — WIRING-MAP names no dedicated
   wilderness-rest table, and inventing a THIRD table id would be a guess, so "wild" reuses the
   authored urban set, same posture as jobPosting reusing PLACE_TIERS rather than a bespoke scale)
   + the INTERRUPT CHANCE (a paid inn bed is the safest; open wilderness/dungeon riskiest). */
const REST_RISK_CLASS={
  inn:     { table:"urban-rest-complications",   interruptChance:0.05 },
  camp:    { table:"urban-rest-complications",   interruptChance:0.20 },
  wild:    { table:"urban-rest-complications",   interruptChance:0.35 },
  dungeon: { table:"dungeon-rest-complications", interruptChance:0.50 },
};

/* restRiskSevere(text) — does this row's OWN TEXT read as a violent/threat interruption? Evidenced
   from the row itself (mirrors gap-wiring's downtimePayoutFromText convention — never a guessed
   Spice band, since neither rest-complications table carries one). Rows 1/2/3/4 of BOTH tables are
   the "a Threat is here" cluster (verified against tables.json: "violently interrupted", "Threat has
   set up an ambush", "you are being tracked", "already inside... having slipped past the sentry"). */
function restRiskSevere(text){
  const t=(text||"").toLowerCase();
  return /violently interrupted|no recovery benefits|ambush|blockade|already (?:inside|in the)|slipped past the sentry|cordon/.test(t);
}

/* restRiskRoll(w, opts) — opts:{nodeId, kind ("short"|"dawn"|"montage"), env}. Returns:
     { ok:true, class, text, band, severe, interrupted }
   or {ok:false, reason:"no-table"} (uncompiled — null-safe). `interrupted` is TRUE only when the row
   reads severe AND the class's interruptChance roll hits — the caller (play.js's passTime) then
   skips restRecover for that rest (the SRD interruption rule: the benefit is threatened, not just
   flavored, per WIRING-MAP item 4). A non-severe / non-interrupted roll is flavor-only, same as
   every other dressing lane in this codebase — the caller still grants the rest normally. */
function restRiskRoll(w, opts){
  opts=opts||{};
  const nodeId=opts.nodeId, kind=opts.kind||"dawn", env=opts.env||null;
  const cls=restSecurityClass(w, nodeId, kind, env);
  const cfg=REST_RISK_CLASS[cls]||REST_RISK_CLASS.camp;
  const roll=(typeof rollTable==="function") ? rollTable(cfg.table) : null;
  if(!roll){ console.warn("[wiring-a] "+cfg.table+" not compiled — rest-risk skipped (null-safe)"); return {ok:false, reason:"no-table"}; }
  const severe=restRiskSevere(roll.text);
  const interrupted=severe && Math.random()<cfg.interruptChance;
  return { ok:true, class:cls, text:roll.text, band:roll.band, severe, interrupted };
}

/* ============================================================================
   §2 — IF-IGNORED: World-Turn escalation ("no house still on fire 50 days later")
   ============================================================================ */

// staleness threshold (days) before a dropped thread rolls what its NPC does about being ignored —
// deliberately the SAME order of magnitude as turnDriftOnRevisit's "14-89d" normal-curve band
// (src/world/turn.js §2), since an ignored thread and a re-visited node are the same "the world kept
// moving without you" fact, just keyed off a codex record's own clock instead of a node's.
const IGNORED_STALE_DAYS = 14;

/* turnIgnoredCandidates(w, today) — every codex record carrying an open thread (dm.legs is
   "hook"|"thread-seed", !dm.resolved) whose dm.lastIgnoredCheck (or, absent that, its mint-time
   touchedSeq-adjacent day — see below) is at least IGNORED_STALE_DAYS in the past. Never invents a
   creation day the record doesn't carry: a thread with no ignoredSinceDay stamp yet is stamped NOW
   (first observation) rather than assumed instantly stale — so a thread minted THIS session never
   fires on its very first montage. */
function turnIgnoredCandidates(w, today){
  if(typeof codexOf!=="function") return [];
  const recs=Object.values(codexOf(w).records||{});
  return recs.filter(r=>{
    if(!r.dm || (r.dm.legs!=="hook" && r.dm.legs!=="thread-seed")) return false;
    if(r.dm.resolved) return false;
    if(r.dm.ignoredSinceDay==null){ r.dm.ignoredSinceDay=today; return false; }   // first observation — stamp, don't fire
    return (today - r.dm.ignoredSinceDay) >= IGNORED_STALE_DAYS;
  });
}

/* turnIgnoredCheck(w) — THE SWEEP (called from worldTurn's montage branch, mirrors repuFadeTick/
   jobBoardTick's existing wiring shape). For each stale candidate: roll ONE npc-if-ignored result
   (what the NPC does about being ignored) + npc-if-ignored-regional-effects when the record carries
   a region tag (r.fields.region / r.dm.region — best-effort, read-only, never guessed if absent).
   Ledgers a `drift` entry per thread, advances dm.ignoredRolls (an escalating counter so repeat
   ignoring is VISIBLE — the digest/DM can read "this is the 3rd time nothing happened" rather than
   the exact same flavor forever) and resets ignoredSinceDay so the NEXT check waits another full
   staleness window (time-honesty: the world doesn't re-fire on the same thread every single montage,
   it fires once per window — same posture as jobBoardTick firing once per elapsed TTL, not every
   montage regardless). Returns the list of {id,name,text,regionalText} fired this sweep. */
function turnIgnoredCheck(w){
  const today=(typeof clockOf==="function") ? clockOf(w).day : 0;
  const candidates=turnIgnoredCandidates(w, today);
  const fired=[];
  candidates.forEach(r=>{
    const roll=(typeof rollTable==="function") ? rollTable("npc-if-ignored") : null;
    if(!roll){ console.warn("[wiring-a] npc-if-ignored not compiled — if-ignored check skipped (null-safe)"); return; }
    const region=(r.fields && r.fields.region) || (r.dm && r.dm.region) || null;
    let regionalText=null;
    if(region){
      const rroll=(typeof rollTable==="function") ? rollTable("npc-if-ignored-regional-effects") : null;
      if(rroll) regionalText=rroll.text;
    }
    r.dm.ignoredRolls=(r.dm.ignoredRolls||0)+1;
    r.dm.ignoredSinceDay=today;   // reset the window — the NEXT fire waits another full IGNORED_STALE_DAYS
    if(typeof addLedger==="function") addLedger(w,"drift",
      { kind:"if-ignored", id:r.id, name:r.name, text:roll.text, regionalText, rolls:r.dm.ignoredRolls, source:"world-turn" },
      `While ignored, ${r.name} — ${roll.text}${regionalText?" ("+regionalText+")":""}`);
    fired.push({ id:r.id, name:r.name, text:roll.text, regionalText });
  });
  return fired;
}

/* ============================================================================
   §3 — CREATURE-PARLEY-WANTS: the surrendering foe's rolled want
   ============================================================================ */

/* parleyWantRoll() — ONE creature-parley-wants roll: {want, band} or null (uncompiled, logged).
   Called by monster-tactics' morale seam (src/world/dm.js's foe_morale case) the instant a foe
   breaks to "surrender" — the script rolls the want, never leaves it to DM invention. */
function parleyWantRoll(){
  const roll=(typeof rollTable==="function") ? rollTable("creature-parley-wants") : null;
  if(!roll){ console.warn("[wiring-a] creature-parley-wants not compiled — want roll skipped (null-safe)"); return null; }
  return { want:roll.text, band:roll.band };
}

/* ============================================================================
   §4 — MONSTER-BEHAVIOR-IF-HUNTED: the fled foe's rolled behavior
   ============================================================================ */

/* huntedBehaviorRoll() — ONE monster-behavior-if-hunted roll: {behavior, band} or null. Called by
   the same foe_morale seam the instant a foe breaks to "flee"/"rout-panic" — stashed on the foe
   (foe.huntedBehavior) for the DM to narrate from and for a future chase_start caller to consume
   (that caller is out of this unit's scope — see the file header). */
function huntedBehaviorRoll(){
  const roll=(typeof rollTable==="function") ? rollTable("monster-behavior-if-hunted") : null;
  if(!roll){ console.warn("[wiring-a] monster-behavior-if-hunted not compiled — behavior roll skipped (null-safe)"); return null; }
  return { behavior:roll.text, band:roll.band };
}

/* ============================================================================
   §5 — REGION-ENCOUNTER: regional walk bias for wilderness legs
   ============================================================================ */

/* regionEncounterRoll(region) — ONE region-encounter roll, gated on a region actually being present
   (null region ⇒ null return, byte-identical to today's behavior — matches regionBiasedArchetypePool's
   own null-region fallback convention). Additive regional-flavor field only; never replaces the
   leg's own wilderness-encounter-type roll (WIRING-MAP: "regional walk bias", a bias/dressing lane,
   not a second encounter engine). */
function regionEncounterRoll(region){
  if(!region) return null;
  const roll=(typeof rollTable==="function") ? rollTable("region-encounter") : null;
  if(!roll){ console.warn("[wiring-a] region-encounter not compiled — regional bias skipped (null-safe)"); return null; }
  return { text:roll.text, band:roll.band };
}

/* ============================================================================
   §6 — TAVERN-ENCOUNTERS: the tavern kit's ambient lane
   ============================================================================ */

// ambient-lane gate — a ROLL doesn't fire every single contact (an ambient ROOM, not a guaranteed
// event); mirrors the wilderness-walk survival-constraint's own ambient-chance convention (0.35).
const TAVERN_ENCOUNTER_CHANCE = 0.35;

/* tavernEncounterRoll() — ONE tavern-encounters roll, chance-gated (ambient lane, not guaranteed).
   Returns {text, band} or null (chance missed, or the table's uncompiled — both null-safe, the
   caller (urban.js's buildingContact) treats either the same way: no ambient beat this contact). */
function tavernEncounterRoll(){
  if(Math.random()>=TAVERN_ENCOUNTER_CHANCE) return null;
  const roll=(typeof rollTable==="function") ? rollTable("tavern-encounters") : null;
  if(!roll){ console.warn("[wiring-a] tavern-encounters not compiled — ambient beat skipped (null-safe)"); return null; }
  return { text:roll.text, band:roll.band };
}

/* ============================================================================
   §7 — URBAN/WILDERNESS INTERACTABLES: the shared walk-object picker
   ============================================================================ */

// envKind -> table id (dungeon's own dungeon-interactable-object stays wired directly in
// dungeon-walk.js, unchanged — this map only covers the two orphans this unit closes).
const WALK_INTERACTABLE_TABLE={ urban:"urban-interactable-object", wilderness:"wilderness-interactable-object" };

/* walkPickInteractable(envKind) — ONE interactable-object roll for a urban segment or wilderness
   leg, same {name,flavor} shape dungeon-walk.js's `object` field already uses (segment.object /
   segment.interactable — kept as a DISTINCT field name, `interactable`, so a segment can carry both
   a dungeon-style object AND this without a name collision; today only one or the other ever fires
   per environment). Returns null (never a fabricated object) if envKind is unrecognized or the
   table isn't compiled. Reads walkRows/walkRnd (engine.walk — MUST load before this file; see
   manifest callTimeDeps) so a single implementation serves both callers, matching engine.walk's own
   walkPick/walkRows sharing pattern. */
function walkPickInteractable(envKind){
  const id=WALK_INTERACTABLE_TABLE[envKind];
  if(!id) return null;
  const rows=(typeof walkRows==="function") ? walkRows(id) : [];
  if(!rows.length){ console.warn("[wiring-a] "+id+" not compiled — interactable skipped (null-safe)"); return null; }
  const c=(typeof walkRnd==="function") ? (walkRnd(rows)[5]||[]) : (rows[0][5]||[]);
  return { name:(c[0]||"").trim(), flavor:(c[1]||"").trim() };
}
