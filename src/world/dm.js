/* GENESIS MODULE — src/world/dm.js — the DM Bridge client + the EVENT-CONTRACT runtime.
   Spec: docs/DM-BRIDGE.md (+ docs/EVENT-CONTRACT.md). Established 2026-06-21.

   Two jobs, both squarely in the world/orchestration layer:

   1. THE BRIDGE CLIENT — dmDigest() builds the scoped state digest (the structured JSON twin of
      handToDM's prose); sendTurn() POSTs the player's action + open rolls + digest; pollResponse()
      polls /response (204 pending → 200 ready) with a "the DM is considering…" indicator;
      applyResponse() renders the narration + applies the returned events + handles rollRequest/ask.

   2. applyEvent(w,e) — THE EVENT-CONTRACT RUNTIME. A switch on the EVENT-CONTRACT.md event types
      that dispatches to the app's REAL mutators (addLedger / addNode / faction+front clocks). The
      DM never writes U; it returns typed events and the app applies them HERE. Unknown types log
      and no-op (forward-compatible). This runtime is the first piece of the event plumbing that
      ADVANCEMENT.md / DIFFICULTY.md reuse — two birds (DM-BRIDGE.md §"State ownership").

   Anti-drift: ONE implementation of the mutators (in-browser). The bridge is a dumb mailbox.
   Classic <script>, shared global scope. Reads U/GS + world.state mutators at call-time. */

const DM_BASE = "";          // same origin: dev/dm-bridge.py serves the app AND the mailbox
const DM_POLL_MS = 1200;     // /response poll cadence while the DM is considering
// TRANSITION-CONTRACT.md §2 — the ceiling on the DM's ONE hand-wave time lever (advance_clock);
// also the ceiling `downtime`/`walkAdvance` etc. clamp any derived tick against (never open-ended).
const TRANS_CLOCK_MAX_MIN = 10080;   // 7 days — a downtime week is the longest legal single tick
// ITEMS (docs/ITEMS.md): the three named equip slots. NOT a single pointer — two-weapon fighting
// needs mainHand + offHand equipped at once, which a single "equipped weapon" field can't represent.
const EQUIP_SLOTS = ["mainHand", "offHand", "armor"];
// BATTLE-THEATER T3 (docs/BATTLE-THEATER.md §4): the `stage_fx` event's own verb-validation fallback,
// used ONLY when window.Theater isn't available yet to ask directly (headless/jsdom, or the ES-module
// boundary hasn't finished loading in-browser) — see the "stage_fx" applyEvent case below. Kept in
// exact sync with src/ui/theater-verbs.js's own THEATER_VERBS export by convention/comment (this file
// is a classic script and can't `import` a sealed ES-module scope, §2); window.Theater.verbs — the
// REAL, live list — always wins when present, this is strictly the degrade path.
const STAGE_FX_VERBS = [
  "advance", "withdraw", "strike", "hurt", "down", "cast", "arc", "knockback",
  "sink", "burst", "flee", "absurdity", "obliterate",
  "fx:fire", "fx:frost", "fx:lightning", "fx:necrotic", "fx:radiant", "fx:poison"
];
// THEATER-NEXT §1.2 — locked default ledger lines, one per op (PROVISIONAL wording, build-ready).
const TERRAIN_PROSE = {
  break:    (zone) => "The cover at "+zone+" breaks apart — rubble now, not shelter",
  burn:     (zone) => "Fire scars the ground at "+zone,
  flood:    (zone) => "Water floods "+zone+" — the footing turns treacherous",
  collapse: (zone) => "The ground at "+zone+" gives way and drops",
  raise:    (zone) => "The ground at "+zone+" heaves upward",
  hole:     (zone) => "A hole tears open at "+zone+" — nothing below but the void"
};
// THEATER-NEXT §1.1 — `terrain_change`'s own second, narrow, frozen vocabulary. NOT added to
// STAGE_FX_VERBS/THEATER_VERBS (the whitelist stance §0 preserves): terrain ops mutate the board's
// mechanical state directly (the tile change IS the visual); a DM wanting spectacle pairs an
// explicit stage_fx in the same turn instead.
const TERRAIN_OPS = Object.keys(TERRAIN_PROSE); // HQ2-8b: derived, not hand-listed (was a 2nd source of truth)

/* ============================================================
   1. THE BRIDGE CLIENT
   ============================================================ */

/* WALK-CONSUMPTION (docs/WALK-CONSUMPTION.md, Step A) — the walk the party is ON, carried EVERY turn
   so the DM stops forgetting it until it's walked out. Compact (walks are 3–7 segs): a cursor (here /
   behind / ahead) + the pre-cast frontier cast. A SOFT prior — player intent and the live situation
   override it; the DM does not steer the party down it. Returns null when no walk is active (party in
   town / between walks).
   DIGEST-DIET §3: full segment detail (gist/reskin/isFinale/effectDie) rides ONLY on the "here" segment
   — the moment the DM actually plans from. Behind/ahead segments are `{num,label,state}` stubs; full
   detail rides again on walk start / promotion / needsReskin (those call sites already re-run this). */
function activeWalkDigest(w){
  if(typeof prepOf!=="function"||typeof walkOfFrontier!=="function") return null;
  const P=prepOf(w), id=P.activeWalkId; if(!id) return null;
  const pn=P.nodes&&P.nodes[id], walk=walkOfFrontier(w,id); if(!pn||!walk) return null;
  const ov=pn.segments||null;                            // the DM's Stage-2 reskin overlay (roll-keyed), if applied
  const cur=pn.cursor||{ current:1, touched:[], done:false };
  const stateOf=s=>(cur.touched||[]).indexOf(s.num)>=0 ? (s.num===cur.current?"here":"behind") : "ahead";
  return {
    nodeId:id, place:(mapOf(w).nodes[id]||{}).name||null,
    environment:walk.environment, topology:walk.topology||null, briefing:pn.briefing||null,
    // WALK-REFRESH §3: the rolled skin (null until tables-wave1 lands) — the DM colors WITHIN this
    // lens rather than inventing one (constrains Stage-2; SYNTHESIS-CONTRACT.md line, frontier-prose,
    // out of this unit's scope). Compact (text+band only) per DIGEST-DIET §3's size discipline.
    skin: walk.skin ? { text:walk.skin.text, band:walk.skin.band } : null,
    // SCENE-RISK-CONTRACT §5 — WHY this walk is dangerous, what the player saw before committing,
    // and which exits are real. Pure read of the mint-time stamp; null on pre-contract walks.
    risk: (walk.risk && typeof sceneRiskDigest==="function") ? sceneRiskDigest(walk.risk) : null,
    spiceTier: walk.spiceTier||null,   // SPICE-RAISE: the walk's region tier (baseline|fray1|fray2|rim) — sizes the DM's connective-weirdness license (DM-CHARTER §8.5c)
    cursor:{ current:cur.current, touched:cur.touched, done:!!cur.done, total:walk.segCount },
    segments:(walk.segments||[]).map(s=>{
      const state=stateOf(s);
      if(state!=="here") return { num:s.num, label:s.label, state };   // steady-state stub
      const reskin = ov ? (ov.find(o=>o.ref===("S"+s.num))||null) : null;
      return {
        num:s.num, label:s.label, isFinale:!!s.isFinale, state,
        gist:s.isFinale ? ((s.finale&&(s.finale.track||s.finale.revelation))||s.areaType||"arrival")
                        : [s.segType||s.areaType||s.biome, s.encounter&&s.encounter.type].filter(Boolean).join(" / "),
        reskin,
        // ON-DEMAND-GEN §4: the room die — surfaced ONLY on the "here" segment (ahead/behind stay veiled).
        // Captured via {type:"walk_update"} (BATCH-GUARDRAILS G4); rolledFace persisting means "narrate
        // the canon face, never re-roll" — the DM checks this before generating a fresh die.
        effectDie: (reskin&&reskin.effectDie)||null,
        // BATTLE-THEATER LIGHTING (Adam 2026-07-03): one additive line so the DM's narration knows the
        // room's ambient light without inventing it — the profile IS what theater-boot.js is rendering
        // right now (or will, the moment combat opens here). null when the walker didn't stamp one
        // (an older snapshot / narrow test harness), same graceful-until-authored discipline as `skin`.
        light: (s.light&&s.light.profile)||null,
        // DRESSING-WIRING.md §"Behavior" 4: dressing rides the walk slice exactly like `feature` does
        // (folded into `gist` above) — surfaced ONLY on the "here" segment (steady-state stubs above
        // stay bare), same DIGEST-DIET discipline. The DM narrates the rolled dressing, never invents
        // it. null when the walker didn't stamp one (an older snapshot / narrow test harness).
        dressing: s.dressing ? { text:s.dressing.text||null, condition:s.dressing.condition||null } : null,
        // DRESSING-ATMOSPHERE.md §"Data shapes": atmo rides the digest as the text string ONLY
        // (the {lane,text} pair persists on the walk segment itself, rolled once/immutable like
        // dressing/names) — surfaced ONLY on the "here" segment, same DIGEST-DIET discipline.
        atmo: s.atmo ? (s.atmo.text||null) : null,
        // REALM-STORY-WIRING §2.2: a preview of the segment's rolled encounter creatures (walk view
        // only — full `desc` arrives at combat, soft-until-contact rhythm). `summary`, not `desc`
        // (graceful-null today, per §0 decision 5). Capped at the slot list (≤4) — this is already
        // the whole slot roster (DWALK_SLOT_MAP never exceeds a handful), the cap just guards drift.
        // MONSTER-STORY-WIRING §1: displaced rides the preview too (one boolean, DIGEST-DIET safe) —
        // "this creature does not belong here; narrating WHY is yours" (docs/DM-BRIDGE.md).
        creatures: (s.encounter && Array.isArray(s.encounter.creatures))
          ? s.encounter.creatures.slice(0,4).map(c=>({ name:c.creature, realm:c.realm||null, summary:c.summary||null, displaced:c.displaced||undefined }))
          : null,
        // REALM-SURFACES-WIRING.md §3: the named floor surface (e.g. "Saloon Boards") for a breach/
        // marooned-realm room — BLIND-PLAYABLE FULLY doctrine's "the named floor is narratable, not
        // just visible" (decision 3). activeRealmsFor(walk.skin,w) is the SAME function + walk.skin
        // field the walk's own encounter path (dwalkEncounter's opts.realms) already derives from, so
        // this always agrees with what actually spawned here. null on a non-realm room (theaterFloor-
        // SurfaceInfo's own regression-safe default) — same graceful-until-relevant discipline as skin/
        // light/dressing above.
        surface: (typeof theaterFloorSurfaceInfo==="function" && typeof activeRealmsFor==="function")
          ? (theaterFloorSurfaceInfo(s, walk.environment, { realms: activeRealmsFor(walk.skin, w) }).surfaceName || null)
          : null
      };
    }),
    cast:pn.cast||null,
    // TABLETOP-UNITS.md §U3 / TABLETOP-VISION.md §2 co-location parity: soft/ambient NPCs at this
    // walk's node stage as blank meeples the moment the party enters — the digest must carry the
    // SAME aggregate presence line in this same turn (count/texture, no names). Shared derivation
    // (codexAmbientPresenceFor, src/world/codex.js) so the stage (later, U4) reads the identical fact.
    ambientPresence:(typeof codexAmbientPresenceFor==="function")?codexAmbientPresenceFor(w, id):null,
    rule:"The walk the party is ON. Narrate the CURRENT segment; the rest is the road ahead/behind. "+
         "Honor the rolls (reskin by ref, never rewrite). A SOFT prior — player intent and the live "+
         "situation override it; you track where they are, you don't steer them down it. Clear a "+
         "segment → emit {type:'walk_advance',payload:{toSeg:N}}; at the finale → {type:'walk_complete'}."+
         " risk is the fairness contract: voice at least one telegraph in narration BEFORE the party "+
         "commits to lethal danger, keep every listed escape genuinely reachable as world-fact (never "+
         "as tactics coaching), and never spring untelegraphed lethality — a one-shot unwarned trap "+
         "is a bug, not difficulty."
  };
}

/* BATTLE-THEATER LIGHTING — the active walk's environment + the "here" segment's rolled `light`, in the
   small {environment,light,realms} shape combat_start merges onto whatever `segment` the DM supplied
   (see that case above). Pure read, null-safe throughout (no active walk / no matching segment -> null,
   the caller's own Object.assign(...,null||{}) treats that as "contribute nothing"). Reuses the SAME
   prepOf/walkOfFrontier/cursor lookup activeWalkDigest already performs — kept as a separate small
   function (not folded into that one) since its caller wants raw walk/segment fields, not the digest's
   already-shaped stub.
   REALM-SURFACES-WIRING.md §3: `realms` is activeRealmsFor(walk.skin, w) — the SAME function + the
   SAME walk.skin field rollDungeonWalk's own encounter path (dwalkEncounter's opts.realms) already
   derives from, so a fight's floor and its spawned creatures always agree on which realm is active.
   [] outside a breach/marooned-realm walk (activeRealmsFor's own byte-compatible default). */
function theaterActiveRealmsFor(w){
  if(typeof prepOf!=="function"||typeof walkOfFrontier!=="function"||typeof activeRealmsFor!=="function") return [];
  const P=prepOf(w), id=P.activeWalkId; if(!id) return activeRealmsFor(null, w);
  const walk=walkOfFrontier(w,id);
  return activeRealmsFor(walk&&walk.skin, w);
}
function theaterEnvSegmentFor(w){
  if(typeof prepOf!=="function"||typeof walkOfFrontier!=="function") return null;
  const P=prepOf(w), id=P.activeWalkId; if(!id) return null;
  const pn=P.nodes&&P.nodes[id], walk=walkOfFrontier(w,id); if(!pn||!walk) return null;
  const cur=(pn.cursor&&pn.cursor.current)||1;
  const seg=(walk.segments||[]).find(s=>s.num===cur);
  return { environment:walk.environment||null, light:(seg&&seg.light)||null,
           realms:(typeof theaterActiveRealmsFor==="function") ? theaterActiveRealmsFor(w) : [] };
}

/* TABLETOP-UNITS.md §U6 (U5's overlay.traces LOCKED contract shape: overlay.traces=[{kind:"corpse",
   ref:statId,zone}] / removed:[pieceRef]) — combat_end's trace write. Corpse is the DEFAULT
   disposition (Adam's ruling, TABLETOP-VISION §3): every foe left `down` (and not obliterated) at
   the moment combat ends becomes a corpse trace; `obliterated` foes go to `removed` instead — never
   both. Accumulates onto whatever traces the segment ALREADY carries (a room a party fights in twice
   keeps every visit's dead, not just the latest) rather than overwriting wholesale: reads the
   existing reskin overlay entry first (the SAME pn.segments lookup activeWalkDigest/theaterHereSourceFor
   already do). `f.fid` is only unique WITHIN one combat (combatStart always numbers foes "f1","f2",…
   from 1, src/engine/combat.js:758) — a SECOND fight on the identical segment would collide with the
   first fight's own refs, which would silently drop its corpse as a false "already staged" duplicate.
   Guarded against by suffixing ("#2","#3",…) any candidate ref that already exists among this
   segment's ACCUMULATED traces/removed, so two separate fights' foes never collide while a single
   fight's own (already-unique) fids pass through unsuffixed. Returns null (no-op, nothing to persist)
   on a walk-less fight or when GS.combat carries no foes — the caller (combat_end, below) is
   null-safe about the return. Rides the EXISTING walk_update overlay write path (prep.js:499
   walkUpdateSegment) — no new event type, no new store (§U5's own law).
   NOTE (integration seam, U5 runs in parallel on its own branch and owns this same contract shape):
   this is U6's OWN implementation to the LOCKED shape so U6's flow is provable standalone; if U5's
   branch lands its own trace-write call site, the orchestrator reconciles the two at integration —
   they write to the identical {ref,zone,kind:"corpse"}/removed shape. */
function theaterCombatEndTraces(w,cm){
  if(!cm||!Array.isArray(cm.foes)||!cm.foes.length) return null;
  if(typeof prepOf!=="function"||typeof walkOfFrontier!=="function") return null;
  const P=prepOf(w), id=P.activeWalkId; if(!id) return null;
  const pn=P.nodes&&P.nodes[id], walk=walkOfFrontier(w,id); if(!pn||!walk) return null;
  const cur=(pn.cursor&&pn.cursor.current)||null; if(cur==null) return null;
  const ref="S"+cur;
  const existing=(pn.segments||[]).find(o=>o&&o.ref===ref);
  const traces=(existing&&Array.isArray(existing.traces))?existing.traces.slice():[];
  const removed=(existing&&Array.isArray(existing.removed))?existing.removed.slice():[];
  const usedKeys={};
  traces.forEach(t=>{ if(t&&t.ref) usedKeys[t.ref]=true; });
  removed.forEach(r=>{ if(r) usedKeys[r]=true; });
  const uniqueRef=(rawId)=>{
    let candidate=rawId, n=1;
    while(usedKeys[candidate]){ n++; candidate=rawId+"#"+n; }
    usedKeys[candidate]=true;
    return candidate;
  };
  let changed=false;
  cm.foes.forEach(f=>{
    if(!f) return;
    const rawId=f.fid||f.id||f.name; if(!rawId) return;
    const zone=f.zone||((f.band||f.lane)?((f.band||"melee")+":"+(f.lane||"C")):null);
    if(f.obliterated){
      removed.push(uniqueRef(rawId)); changed=true;
    } else if(f.down){
      traces.push({kind:"corpse",ref:uniqueRef(rawId),zone}); changed=true;
    }
  });
  return changed ? {traces,removed} : null;
}

/* DIGEST-DIET §1: the ids that ride the digest FULL this turn — the current node + the active walk's
   node + the active walk's pre-cast (pn.cast) + w.dm.mintQueue (ON-DEMAND-GEN's spotlight, forward
   ref — empty until that spec lands). Pulled into one call so dmDigest stays a straight-line read. */
function digestHereOpts(w){
  const P=(typeof prepOf==="function")?prepOf(w):null;
  const walkId=P&&P.activeWalkId||null;
  const pn=(P&&walkId)?(P.nodes&&P.nodes[walkId]):null;
  const cast=pn&&pn.cast||null;
  const castIds=cast?[cast.locId].concat(cast.npcIds||[],cast.itemIds||[],cast.artIds||[]).filter(Boolean):[];
  const mintIds=((w.dm&&w.dm.mintQueue)||[]).map(m=>m.id).filter(Boolean);
  // ackSeq defaults to 0, never -1: touchedSeq is minted starting at 1 (codexTouch pre-increments
  // C.seq), so a -1 default would make touchedSeq>ackSeq true for EVERY record ever touched — the
  // very first digest of a fresh world would ship the whole codex full, defeating the scope split
  // before any turn is ever acked.
  // HQ2-11 (PROVISIONAL, founding-digest-diet): the SAME "ackSeq defaults to 0" fact above is exactly
  // why the touchedSeq-delta rule (codexHereNowIds rule 4) can't be trusted on the founding turn —
  // every record minted during world-gen prep gets touchedSeq>0 (codexTouch stamps on every codexAdd),
  // so rule 4 with ackSeq=0 matches the ENTIRE just-generated prep codex, not just "here." `founding`
  // mirrors dmDigest()'s own `foundingTurn` predicate (no dmlog yet), narrowed by ackSeq still being
  // the untouched default: in real play the two facts always co-occur exactly on turn 1 (ackSeq is
  // only ever promoted inside applyResponse, which always pushes a dmlog "dm" line first — dmlog can't
  // still be empty once ackSeq has moved), so this is the SAME founding turn either way; the ackSeq
  // half just keeps this from misfiring against an isolated-unit-test world that stamps digestAckSeq
  // directly without also driving dmlog (dev/verify-digest-diet.mjs §7.1/§7.2/§7.5 simulate "already
  // acked" this way on purpose). codexHereNowIds suppresses rule 4 for this one turn only — see that
  // function's founding branch.
  const ackSeq=(w.dm&&w.dm.digestAckSeq)!=null?w.dm.digestAckSeq:0;
  const founding=!(w.dmlog && w.dmlog.length) && ackSeq===0;
  return { atNodeId:w.currentNodeId, walkNodeId:walkId, castIds, mintIds, ackSeq, founding };
}

/* The scoped state digest — the JSON twin of handToDM (anti-drift: relevance-scoped, not the
   whole universe). dmOnly fields carry the hidden layer the DM already gets in the prose handoff.
   DIGEST-DIET (docs/DIGEST-DIET.md): the 2026-07-01 live session showed the digest re-shipping a
   byte-identical 42.9 KB codex block every turn (88% of the payload) — this is the retrieval-layer
   fix: codex/codexRoster two-tier split (§1-2), send-once statics (§3). */
/* TIYL-DEEPENING §3.5 — "the biography rides the handoff ONCE": a compact step→result one-liner
   digest of the whole rolled life (origins + decisions + every event's summary), sent send-once on
   the founding turn exactly like `setting` above (same DIGEST-DIET discipline: zero marginal value
   after turn 1 — the DM already has it in-conversation; a loop restart re-reads it via bootstrap).
   Distinct from charHandoff (world/handoff.js), which is the manual clipboard export for players
   without a live bridge session — that path already carried the full life text; this is the ONE
   place the live per-turn digest carried only entry-bundle hook summaries (rollEntry's opening
   bundle) and never the life chain itself. Returns null for a legacy character with no .life. */
function tiylLifeDigest(c){
  if(!c||!c.life)return null;
  const L=c.life,O=L.origins||{};
  const lines=[];
  if(O.birthplace)lines.push("born "+(O.birthplace.text||"").toLowerCase());
  if(O.family)lines.push("raised by "+(O.family.text||"").toLowerCase());
  if(O.lifestyle)lines.push((O.lifestyle.text||"").toLowerCase()+" upbringing");
  if(L.decisions&&L.decisions.background)lines.push(L.decisions.background.text);
  if(L.decisions&&L.decisions.classTraining)lines.push(L.decisions.classTraining.text);
  (L.events||[]).forEach(e=>{ if(e&&e.summary) lines.push(e.summary+(e.detail?" ("+e.detail+")":"")); });
  return { age:L.age||null, steps:lines };
}

/* COMBAT-LIFECYCLE.md §4 — the combat block dmDigest() was missing entirely (docs/DM-BRIDGE.md:308
   referenced digest.combat.proposals[] but nothing built it). Present ONLY while GS.combat.active (zero
   bytes otherwise — the digest diet stands); foe HP stays coarse (cmFoeStateWord), never a number.
   proposals[] is ADVISORY (MONSTER-TACTICS §1) for every non-autoplay-eligible live foe only — the DM
   reads it, picks the verb, the script still owns every die via foe_action's p.action extension (§5). */
function combatDigest(w){
  const cm=GS.combat;
  if(!cm||!cm.active) return null;
  const t=(typeof livingSheet==="function")?livingSheet(w):null;
  const sh=t&&t.sh;
  const scene=cm.scene||{};
  // condition entries are strings or {condition,ttl,appliedRound} objects (engine.conditions) — the
  // digest carries NAMES only (condName's own shape; `.name` is not a condition-entry field).
  const condNames=list=>(list||[]).map(c=>(typeof condName==="function")?condName(c):(typeof c==="string"?c:(c&&c.condition)||null)).filter(Boolean);
  // a fled/surrendered foe is out of the tactical picture — no proposal for it (it isn't taking turns).
  const liveFoes=(cm.foes||[]).filter(f=>!f.down&&!f.fled&&!(f.surrendered||f.surrendering));
  return {
    round:cm.round, side:cm.side, first:cm.first,
    // CHASE-CONTRACT-FIX.md: surfaces cmMaybeAutoEnd's resolvable flag (set when every foe is fled/
    // surrendered but not all down) so the DM sees the fight is theirs to close without polling
    // GS.combat directly. Absent (key omitted, not null) when unset — keeps the digest diet honest.
    ...(cm.resolvable ? { resolvable:"all foes fled/surrendered — declare combat_end, or chase_start first if pursued" } : {}),
    pc:{ band:(cm.pc&&cm.pc.band)||"melee", lane:(cm.pc&&cm.pc.lane)||"C",
         hp:sh?((sh.hpCur!=null?sh.hpCur:"?")+"/"+(sh.hp!=null?sh.hp:"?")):null,
         // PC conditions live on the CHARACTER (t.c — conditionHolder's own convention), not the sheet
         conditions:t?condNames(t.c.conditions):[] },
    // REALM-STORY-WIRING §2.1: `realm` lets the DM narrate the realm creature (not the generic
    // chassis); `desc` rides ONCE per foe NAME per combat (digest-diet law: three identical wolf
    // descs is bloat) — the seenDescNames set below tracks which names have already carried theirs.
    foes:(()=>{ const seenDescNames=new Set();
      return (cm.foes||[]).map(f=>{
        const o={
          fid:f.fid, name:f.name, cr:(f.cr!=null?f.cr:null), band:f.band, lane:f.lane,
          state:(typeof cmFoeStateWord==="function")?cmFoeStateWord(f):"fresh",
          fled:!!f.fled, surrendered:!!(f.surrendered||f.surrendering),
          autoplay:(typeof autoplayEligible==="function")?autoplayEligible(f):false,
          conditions:condNames(f.conditions),
          realm:f.realm||null
        };
        if(f.desc && !seenDescNames.has(f.name)){ o.desc=f.desc; seenDescNames.add(f.name); }
        // REALM-TRAITS-APPLY §3 — traitNote is a one-line combat-relevant fact (no mechanics), same
        // once-per-name digest-diet law as desc/flavor above (a recurring foe doesn't repeat it).
        if(f.traitNote && !seenDescNames.has("trait:"+f.name)){ o.traitNote=f.traitNote; seenDescNames.add("trait:"+f.name); }
        // MONSTER-STORY-WIRING §1/§2: displaced = this creature does not belong here (DIGEST-DIET
        // safe, one boolean); doing = the ONE short behavior/activity string (combatFromEncounter
        // already picked behavior over activity when both exist).
        if(f.displaced) o.displaced=true;
        if(f.doing) o.doing=f.doing;
        // MONSTER-STORY-WIRING §3: once per foe NAME per combat (same digest-diet law as desc) —
        // Adam's 104 hand-authored d10 flavor rolls, surfaced ONLY on the foe's first combat
        // (fields.seenCount===1, stamped by encounter_resolved) so a recurring foe doesn't repeat it.
        if(f.codexId && typeof codexGet==="function"){
          const rec=codexGet(w,f.codexId);
          if(rec && rec.fields && rec.fields.seenCount===1 && rec.dm && rec.dm.flavor && rec.dm.flavor.length && !seenDescNames.has("flavor:"+f.name)){
            o.flavor=rec.dm.flavor; seenDescNames.add("flavor:"+f.name);
          }
          // MONSTER-FLAVOR-TABLES §4 — the spice-clamped d8 flavor row rides the same first-instance
          // block (once per foe NAME per combat), beside any custom-d10 flavor. The individual's
          // canon-locked truth, surfaced when the foe is first seen.
          if(rec && rec.fields && rec.fields.seenCount===1 && rec.dm && rec.dm.flavorD8 && !seenDescNames.has("flavorD8:"+f.name)){
            o.flavorD8=rec.dm.flavorD8; seenDescNames.add("flavorD8:"+f.name);
          }
        }
        return o;
      });
    })(),
    scene:{ cover:Object.keys(scene.cover||{}), hazards:scene.hazards||[], exits:scene.exits||[],
            ...( (scene.mods&&scene.mods.length) ? { terrain: scene.mods.slice(-3).map(m=>m.op+"@"+m.zone) } : {} ) },
    // BATTLE-THEATER LIGHTING: one additive line, mirroring activeWalkDigest's own `light` field — the
    // combat_start handler stamps cm.segment.{environment,light} off the active walk (theaterEnvSegmentFor,
    // above), so the same fact is available mid-fight without the DM having to cross-reference activeWalk.
    // null when the fight opened with no active-walk light (an older snapshot / a DM-declared ambush with
    // no walk behind it) — the DM narrates ambient light as it already does today in that case.
    light:(cm.segment&&cm.segment.light&&cm.segment.light.profile)||null,
    proposals:(typeof proposeTactic==="function")
      ? liveFoes.filter(f=>!(typeof autoplayEligible==="function"&&autoplayEligible(f)))
                .map(f=>Object.assign({fid:f.fid},proposeTactic(f,cm)||{}))
      : []
  };
}

// The digest's top-level shape — the declared twin of dmDigest()'s return literal (every key
// below is ALWAYS present in the return object; many are null on a common turn). Machine truth
// for build/gen-dm-contract.py; parity with the live return object is enforced by
// dev/verify-dm-contract.mjs (add a key to dmDigest ⇒ add it here, the guard fails otherwise).
const DM_DIGEST_KEYS = ["worldId","worldName","clock","location","setting","pc","powers","fronts","recentLedger","gazetteer","codex","codexRoster","minted","revealed","sessionLean","tarot","activeWalk","ambientPresence","combat","prepPending","levelUp","arrivalBrief","itemLegacy","bastion","pendingSituation"];

function dmDigest(){
  const w=activeWorld(); if(!w) return null;
  const s=w.seed, c=clockOf(w);
  const cur=w.characters.filter(x=>x.status==="living").slice(-1)[0]||null;
  const sh=cur&&cur.sheet;
  // §3: setting is 393 B every turn for zero marginal information after the first — ship it ONLY on
  // the world-founding turn (dmlog still empty at digest-build time, before sendTurn's pushDmLog runs)
  // or when the world has no codex/prep yet to lean on. Every other turn: the DM already has it (prep
  // handoff + in-conversation memory); a loop restart re-reads it via bootstrap (docs/DM-BRIDGE.md).
  const foundingTurn=!(w.dmlog && w.dmlog.length);
  return {
    worldId:w.id, worldName:w.name,
    clock:{ day:c.day, min:c.min, band:timeOfDay(c.min), exact:fmtTime(c.min), session:w.session||0, knowsTime:!!w.knowsTime },
    location:nodeName(w,w.currentNodeId),
    setting: foundingTurn ? { name:s.master.name, desc:s.master.desc,
              smell:s.smell.name, sound:s.sound.name, arch:s.arch.name,
              taboo:{name:s.taboo.name,desc:s.taboo.desc},
              myth:{name:s.myth.name,desc:s.myth.desc} } : null,
    pc: cur ? {
      name:cur.name, headline:cur.headline||cur.spark, pronouns:cur.pronouns,
      species:sh?sh.species:null, class:sh?sh.class:null, background:sh?sh.background:null,
      level:(sh&&sh.level)||1,
      // §S5 (BUG-03): hp is {cur,max} (+temp only when held); hpCur==null (pre-ensureResources
      // sheet) reads as full — same convention as applyHpDelta (resources.js:106).
      hp:sh?Object.assign({cur:(sh.hpCur!=null?sh.hpCur:sh.hp), max:(sh.hp||0)},(sh.tempHp>0?{temp:sh.tempHp}:{})):null,
      // HQ3-A2 (SET-04-F1): gold is the only coin the sheet models (economy v1 is gold-only). Ships
      // every turn like hp — a small int, and the seat MUST see the purse before adjudicating any
      // buy/afford beat. Single source of truth: NOT duplicated into resourceDigest.
      gold:sh?(sh.gold||0):null,
      // TRANSITION-CONTRACT.md §3.7 — omitted entirely when null (digest-diet: 0 bytes on the normal turn).
      ko:(sh&&sh.ko) ? { stable:true, wakeInMin:Math.max(0, (sh.ko.wakeDay-c.day)*1440 + sh.ko.wakeMin-c.min) } : undefined,
      ac:sh?sh.ac:null, profBonus:sh?sh.profBonus:null,
      scores:sh?sh.scores:null, mods:sh?sh.mods:null,
      saveProfs:sh?sh.saveProfs:[], skillProfs:sh?sh.skillProfs:[],
      conditions:cur.conditions||[], feat:sh?sh.feat:null,
      marks:sh?(sh.marks||[]):[],   // TIYL-DEEPENING §3.1 — permanent, DM-narratable (small; rides every turn like any other sheet fact)
      // TIYL-DEEPENING §3.5: the full rolled life, send-once (founding turn only — see tiylLifeDigest).
      life: foundingTurn ? (typeof tiylLifeDigest==="function"?tiylLifeDigest(cur):null) : null,
      resources:(sh&&typeof resourceDigest==="function")?resourceDigest(sh):null,
      // HQ3-C5 (SET-08-F3) — active concentration is a load-bearing PC fact the memoryless seat must
      // see (a stale flag rode unseen before this). Omitted entirely when not concentrating (digest
      // diet). expiresInMin is derived from the stamp when present (a legacy/un-stamped flag omits it).
      concentration:(sh&&sh.concentration&&sh.concentration.spell)?(function(){
        const cc=sh.concentration, out={spell:cc.spell};
        if(cc.sinceDay!=null){ out.sinceDay=cc.sinceDay; out.sinceMin=cc.sinceMin;
          if(cc.durationMin!=null){ const c=clockOf(w); out.expiresInMin=Math.max(0, cc.durationMin-((c.day-cc.sinceDay)*1440+(c.min-cc.sinceMin))); } }
        return out; })():undefined,
      // ITEMS (docs/ITEMS.md): identity only (id/name/qty/conditions) — the DM references an item by
      // id in condition_add/equip/item_split; it doesn't need the full mechanical lookup to narrate.
      inventory:sh?(sh.inventory||[]).map(it=>({id:it.id,name:it.name,qty:it.qty,conditions:it.conditions||[]})):[],
      equipped:sh?(sh.equipped||null):null,
      // the actual fix for "the DM has to recall the weapon's dice from memory" (docs/ITEMS.md): the
      // objective damage spec for whatever's equipped, resolved against data/items.js — narrate FROM
      // this, never invent a die. null per slot when nothing's equipped or it doesn't resolve.
      equippedWeapons:(sh&&typeof cmEquippedDamage==="function")?{
        mainHand:cmEquippedDamage(sh.equipped,sh.inventory,sh.mods,"mainHand"),
        offHand:cmEquippedDamage(sh.equipped,sh.inventory,sh.mods,"offHand")
      }:null,
      // LOOSE-ENDS §1: tool/DC/charm digest wiring — null when the sheet holds none (the common case
      // today; no toolProfs/charms/blessings data source exists yet, see socialToolCharmDigest).
      toolsCharms:(sh&&typeof socialToolCharmDigest==="function")?socialToolCharmDigest(sh):null,
      // SOCIAL-SPINE-FIXES §S3 — caster discoverability: known-spell NAME lists (cantrips/spells),
      // deduped w/ feat picks, sparse-key (martials ship NOTHING). Byte budget ≤600 B worst-case
      // L10 full caster, guarded in dev/verify-digest-diet.mjs. Names ride EVERY turn (like marks —
      // small, and the DM must verify knowledge before adjudicating any cast).
      ...((sh&&typeof spellDigest==="function")?(spellDigest(sh)||{}):{})
    } : null,
    powers:(w.factions||[]).map(f=>({
      clockId:slug(f.name), faction:f.name, dominant:!!f.dominant, agenda:f.agenda, method:f.method,
      tags:f.tags||[], clock:f.clock.filled+"/"+f.clock.size
    })),
    // ITEM-LEGACY §6 — the lost-toys slice: every storied item not in the PC's hand (looted/scavenged/
    // faction-held/trail-cold). null on the common turn (digest diet, zero bytes); cap 5. The DM weaves
    // the lost sword into rumor / a foe's hand / a vault from this, and never invents custody against it.
    itemLegacy:(typeof legacyDigest==="function")?legacyDigest(w):null,
    // CROWNING-BASTION.md §7.B1.8 — the bastion slice: null when no bastion exists (digest diet).
    // `atNow` tells the DM whether the living PC is standing at its node (gates the deposit/withdraw
    // narration); `vault` is the manifest of what's cached — the DM narrates from this, never invents.
    bastion:w.bastion?{ name:w.bastion.name, nodeId:w.bastion.nodeId, foundedDay:w.bastion.foundedDay,
      atNow:w.currentNodeId===w.bastion.nodeId,
      vault:(w.bastion._vaultNames || (w.bastion.vault||[]).map(id=>{const r=(typeof codexGet==="function")?codexGet(w,id):null;return r?r.name:id;})) }:null,
    fronts:(w.pressures||[]).map(p=>({
      clockId:slug(p.danger||p.kind), kind:p.kind, danger:p.danger, impersonal:p.impersonal||null,
      clock:p.clock.filled+"/"+p.clock.size, closed:!!p.closed,
      dmOnly:{ truth:p.real?p.real.text:null, doom:p.doom||null }
    })),
    recentLedger:ledgerOf(w).slice(-6).map(e=>({type:e.type, day:e.day, min:e.min, text:e.text})),
    gazetteer:w.gazetteer.slice(-8).map(g=>({type:g.type, name:g.name, desc:g.desc})),
    // DIGEST-DIET §1-2: the codex block, two-tier — `codex` is the here-and-now full set (bounded to
    // scene size, not world size), `codexRoster` is a one-liner for everything else (the DM pulls a
    // roster entry's full record on demand via dev/peek-state.py, never by re-reading state.json raw).
    ...((typeof codexDigest==="function") ? (ensureCodex(w), codexDigest(w, digestHereOpts(w))) : { codex:null, codexRoster:null }),
    // ON-DEMAND-GEN §2 (forward ref, may not exist yet): the mint spotlight — ids the DM should look up
    // in `codex` above (they're guaranteed full-tier by the here-opts mintIds wiring). Cleared only when
    // this turn's response arrives (applyResponse), so a crashed turn doesn't eat the spotlight.
    minted:((w.dm&&w.dm.mintQueue)||[]).slice(),
    revealed:REVEAL_KEYS.filter(k=>isRevealed(w,k)),
    // SESSION SEAM (CONSEQUENCE-LADDER §7.1–§7.2): the next-session LEAN + the weave plan. A SOFT prior,
    // never a mandate — the rule below is part of the payload so the DM can't read it as a railroad.
    // §3: the override-hierarchy prose is ~700 B of zero-marginal-value repetition — the full text lives
    // in the prep handoff + docs/DM-BRIDGE.md; per-turn we ship only the load-bearing lean/weave data.
    sessionLean:(w.carryForward && w.carryForward.nextShape) ? {
      lean:w.carryForward.nextShape,
      weave:(w.carryForward.weavePlan||[]).filter(p=>p&&p.decision!=="sustain")
              .map(p=>({ id:p.id, decision:p.decision, why:p.reason })),
      rule:"lean-for-lulls; player→situation→lean (see handoff)",
      // WORLD-TURN §5 "the lull nudge": ONE recall candidate, present only when this lull block itself
      // is present (the same gate — sessionLean's presence IS the lull-machinery-active signal).
      // Ignorable, never a mandate — "the world could rhyme here."
      echo:(typeof turnEcho==="function")?turnEcho(w,{excludeIds:digestHereOpts(w).mintIds.concat([w.currentNodeId])}):null,
      // TAROT-SESSION.md §2: "digest.sessionLean.card = {name,reversed,omen,mutator} — rides the
      // existing lean block". DM-only (mutator/op/note never render to the player — the frontispiece
      // is the player-facing twin, name+omen only).
      card: tarotDigestCard(w),
    } : null,
    // TAROT-SESSION.md §2: the session draw, DM-only ({name,reversed,omen,mutator}), shipped TOP-LEVEL
    // too — §2 says "rides the existing lean block", but that block only exists once a carryForward has
    // fired (never on a world's first session), and the draw happens every session. Nesting it under
    // sessionLean.card (above) satisfies the spec's literal wording; this top-level twin is the
    // reconciliation so session 1 isn't silently missing its card (flagged in the build's uncertainties).
    tarot: tarotDigestCard(w),
    activeWalk:(typeof activeWalkDigest==="function")?activeWalkDigest(w):null,  // WALK-CONSUMPTION (Step A)
    // TABLETOP-UNITS.md §U3: node-scene co-location parity — same fact as activeWalk's own
    // ambientPresence sibling above, but for the party's CURRENT node (the market/town-square case,
    // no active walk in progress). null when no soft ambients sit at this node (the common turn).
    ambientPresence:(typeof codexAmbientPresenceFor==="function")?codexAmbientPresenceFor(w, w.currentNodeId):null,
    // COMBAT-LIFECYCLE.md §4: present only mid-fight (GS.combat.active) — null the common turn.
    combat: combatDigest(w),
    // PREP-AUTOPILOT §1: absence is the all-clear; presence tells the DM loop to run the fan-out
    // workflow (docs/PREP-AUTOPILOT.md §2, landed in DM-BRIDGE.md) in the background and post
    // {type:"prep_applied"} when it returns. ~100 B when absent (the common case).
    prepPending:(typeof prepPendingDigest==="function")?prepPendingDigest(w):null,
    // LEVELUP-PICKER §1: null-safe presence signal — a pending interpretive-pick span on the living
    // PC's sheet, so the DM's narration knows a ceremony is imminent (the picker itself resolves it
    // in-app; this rides the digest for awareness only, never invented values). null the common turn.
    levelUp:(typeof levelUpDigest==="function")?levelUpDigest(w):null,
    // WORLD-TURN §2/§5: the current node's unrevealed drift entries (dmOnly until the DM narrates the
    // return) — the DM narrates the arrival FROM this, never invents it. null when nothing's pending
    // (the common case — most turns roll no drift).
    arrivalBrief:(typeof turnArrivalBrief==="function")?turnArrivalBrief(w,w.currentNodeId):null,
    // HQ3-C4 (SET-03-F1) — a severe/interrupted rest-risk obligation (restRiders, src/world/play.js)
    // the DM must honor THIS turn (e.g. a threat already inside the site when the PC wakes). Rides
    // the digest until the DM's response acks it (applyResponse's w.dm rebuild clears a SEEN one, not
    // a freshly-set one — same lifecycle as the mint spotlight). null the common turn.
    pendingSituation:(w.dm&&w.dm.pendingSituation)||null
  };
}

/* Post the player's action (+ any open rolls) as a turn; poll for the DM's reply.
   rolls travel INTO the turn — the DM narrates FROM them and never fabricates them. */
// DIGEST-DIET §3 (turn-envelope audit): tonight's `.dm/turn-*.json` "~14.8 KB outside the digest"
// (63,331 − 48,540) does NOT reproduce against the live turn shape below — 63,331 is the on-disk
// PRETTY-PRINTED byte count (dm-bridge.py writes `json.dump(...,indent=2)`), 48,540 is the COMPACT
// digest size; re-measuring both sides compact, the actual envelope (turnId/worldId/action/rolls/
// lane*) is ~200-350 B, not 14.8 KB. Nothing to trim here — the finding was an indent-vs-compact
// mismatch, not a stowaway field. Left as a comment (not a fix) per the executor note: reconcile
// against merged reality, record the difference.
function sendTurn(action,rolls,opts){
  const w=activeWorld(); if(!w) return Promise.reject("no world");
  // DM-SEAT (docs/DM-SEAT.md §5.1): the ONE branch point between the two transports. w.dm.transport
  // is the persisted per-world toggle (seat.js's seatEnabled/seatToggleTransport); absent/"mailbox"
  // takes the exact path below, UNCHANGED — this line is the entire diff the seat introduces into the
  // mailbox's own call site. "seat" hands off to seat.js's seatSend, which reuses dmTriage/dmDigest/
  // pushDmLog identically (DIET/ROLL-BRANCHES/ON-DEMAND-GEN transfer unchanged, §1) but assembles+POSTs
  // messages per §2 and streams+validates per §3 instead of mailbox polling.
  if(typeof seatEnabled==="function" && seatEnabled(w) && typeof seatSend==="function") return seatSend(action,rolls,opts);
  // HYBRID FAST-LANE TRIAGE (docs/DM-BRIDGE.md): stamp the script-owned lane so the DM loop routes
  // routine beats to the fast model and memorable ones to Opus — without re-deciding per turn.
  const tri=(typeof dmTriage==="function")?dmTriage(w,action):null;
  // ROLL-BRANCHES §2/§4 step 4: the NEXT sendTurn after a local branch resolution carries lastResolution
  // top-level, once — so the DM re-enters the conversation knowing exactly what the dice already decided.
  const lastRes=(w.dm&&w.dm.lastResolution)||null;
  const turn={ turnId:"t-"+uid(), worldId:w.id, action:action, rolls:rolls||[], digest:dmDigest(),
               lane:tri?tri.lane:null, laneModel:tri?tri.model:null, laneReasons:tri?tri.reasons:null,
               lastResolution:lastRes };
  // §4b: stamp turnId onto the dmlog line so session-cost-report.py can join dmlog↔.dm/turn-*.json
  // for lane distribution (tonight's ad-hoc audit found this join broken — dmlog carried no turnId).
  if(!(opts&&opts.hidden)) pushDmLog(w,"player",action,{rolls:rolls||[],turnId:turn.turnId});   // hidden = meta turns (e.g. the auto-opening) don't show as a player line
  // DIGEST-DIET §2: the max touchedSeq the just-built digest actually shipped — codexOf's `seq` counter
  // is shared with touchedSeq (codexTouch), so every record the digest could show has touchedSeq <= this
  // snapshot. Stashed as PENDING (not yet the watermark — applyResponse promotes it only once the DM has
  // demonstrably seen this turn; a crashed/unanswered turn must not advance digestAckSeq).
  w.dm=w.dm||{}; w.dm.rollReq=null; w.dm.ask=null; w.dm.pendingTurnId=turn.turnId; w.dm.lastResolution=null;   // rode this turn — clear so it never repeats
  w.dm.pendingAckSeq=(typeof codexOf==="function")?(codexOf(w).seq||0):(w.dm.pendingAckSeq||0);
  saveU(U);
  postState();                                   // so the DM can read full state if the digest isn't enough
  // DM-SEAM telemetry: stash the send-side metrics the completed-turn row needs (measured now, while
  // we hold the assembled turn) — applyResponse reads these back to close out the DMTurnTelemetry row.
  GS.dm.lastTurnMeta={ turnId:turn.turnId, lane:turn.lane, laneModel:turn.laneModel,
    digestBytes:jsonBytes(turn.digest), turnBytes:jsonBytes(turn) };
  GS.dm.pending=true; GS.dm.turnId=turn.turnId; GS.dm.turnStart=Date.now(); GS.dm.rollReq=null; GS.dm.ask=null; renderWorld();
  return fetch(DM_BASE+"/turn",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(turn)})
    .then(r=>{ if(!r.ok) throw new Error("bridge "+r.status); return r.json(); })
    .then(j=>{ GS.dm.turnId=j.turnId; pollResponse(j.turnId); return j.turnId; })
    .catch(e=>{ dmBridgeDown(e); throw e; });
}

const DM_POLL_TIMEOUT = 300000;  // wait up to 5 min — a live DM (Claude) composing a turn can take a while; only give up if truly no one's watching
const DM_LONGPOLL_S = 25;        // how long the bridge holds each /response open before returning 204 (then we re-issue)

/* LONG-POLL: each /response request blocks server-side until the DM answers (or DM_LONGPOLL_S elapses),
   so the reply surfaces the instant it lands — not on the next fixed poll tick. We re-issue immediately
   after a 204, tracking wall-clock for the give-up timeout. */
function pollResponse(turnId){
  if(GS.dm.poll){clearTimeout(GS.dm.poll);GS.dm.poll=null;}
  const started=Date.now();
  const tick=()=>{
    fetch(DM_BASE+"/response?turnId="+encodeURIComponent(turnId)+"&wait="+DM_LONGPOLL_S).then(r=>{
      if(r.status===204){
        if(Date.now()-started>=DM_POLL_TIMEOUT){ dmNoAnswer(); return null; }   // bridge up, but nobody is playing DM
        GS.dm.poll=setTimeout(tick,120); return null;                           // long-poll lapsed → re-arm at once
      }
      if(!r.ok) throw new Error("bridge "+r.status);
      return r.json().then(applyResponse);
    }).catch(dmBridgeDown);
  };
  tick();   // fire immediately — the request itself holds open until the answer is ready
}

/* The bridge served the turn, but no DM session answered within the window — don't spin forever
   on "considering". Surface what's wrong + the fallbacks. (The mailbox being up ≠ a DM watching it.) */
function dmNoAnswer(){
  const w=activeWorld(); GS.dm.pending=false; GS.dm.poll=null; GS.dm.turnId=null;
  if(w) pushDmLog(w,"dm","(No DM answered. The bridge is running, but a DM session needs to be watching it — start one per docs/DM-BRIDGE.md, ideally on Sonnet for speed. Or use ✦ Copy world for the clipboard hand-off.)",{system:true});
  if(w&&w.dm) w.dm.pendingTurnId=null;            // gave up on this turn — don't resume it on reload
  saveU(U); renderWorld(); wakeReveal();          // never strand the player on the prep cinematic
}

/* Render the narration + APPLY the events through the real mutators + surface rollRequest/ask. */
function applyResponse(r){
  const w=activeWorld(); if(!w||!r) return;
  GS.dm.pending=false; GS.dm.poll=null; GS.dm.turnId=null;
  // FIX (opening-overlay-teardown): the event-apply/render chain below runs a large amount of DM-supplied,
  // event-contract-dispatched, and gen-pipeline code (applyEvent's switch, genApply, pushDmLog, ...) with
  // no per-step guard. Any single throw in there used to abort applyResponse BEFORE renderWorld()/wakeReveal()
  // ever ran — which stranded the player behind the "The DM is dreaming your arrival…" prep cinematic
  // (never lifted — wakeReveal only fires past this point) AND left the send button showing its stale
  // disabled render from sendTurn (GS.dm.pending was already cleared above, but nothing re-rendered to
  // show it — shakedown SD-001/SD-002's "second sendTurn never fires" was this: the click handler never
  // ran because the DOM never updated, not because sendTurn itself was gated). Wrapping in try/finally
  // makes the render + overlay-dismiss unconditional — happy-path or not, the player is never stranded.
  try{
    // HQ3-C4 — snapshot the pendingSituation object identity BEFORE events apply. A rest applied
    // THIS turn (below) assigns w.dm.pendingSituation a FRESH object; one already sitting there from
    // a PRIOR turn (the one the DM just answered) is the SAME object reference — the rebuild below
    // tells "fresh" from "seen" by `!==` against this capture, never by clearing unconditionally.
    const _hadPending = (w.dm && w.dm.pendingSituation) || null;
    // TYPED CONTRACT (docs/EVENT-CONTRACT.md): machine-check the whole response before applying it.
    // Non-blocking — we log violations and still apply what's valid (each event is re-checked in
    // applyEvent), so one malformed field never strands a turn behind the prep overlay.
    const contract=validateTurnResponse(r);
    if(!contract.ok) console.warn("[dm-seam] turn-response contract violations:",contract.errors);
    // DE-3: fold any slot_spent that rides a same-level cast in this same response — cast{level}
    // already spends the slot (dm.js "cast" case), so the paired slot_spent must NOT double-apply.
    const _foldedSlots=(typeof dmFoldSlotSpends==="function")?dmFoldSlotSpends(r.events||[]):new Set();
    const applied=(r.events||[]).map((e,ei)=>{
      if(e && e.type==="slot_spent" && _foldedSlots.has(ei)){
        if(typeof addLedger==="function") addLedger(w,"outcome",{kind:"slot-fold",source:"detected"},
          "◇ the slot spend rides the cast — not double-charged.");
        return {type:e.type, res:{ok:true, folded:"rides-cast"}};
      }
      return {type:e.type, res:applyEvent(w,e)};
    });
    const latencyMs=(GS.dm.turnStart?Date.now()-GS.dm.turnStart:null); GS.dm.turnStart=null;   // turn round-trip (player send → DM answer)
    // DM-SEAM structured telemetry: one row per completed turn (latency/lane/bytes/events/est. cost).
    const _m=(GS.dm&&GS.dm.lastTurnMeta)||{}; const _rb=jsonBytes(r);
    const _etypes=(r.events||[]).map(e=>e&&e.type).filter(Boolean);
    logDmTurn(w,{ turnId:r.turnId||_m.turnId||null, worldId:w.id, t:Date.now(), session:w.session||0,
      lane:_m.lane||null, laneModel:_m.laneModel||null, latencyMs,
      digestBytes:_m.digestBytes||0, turnBytes:_m.turnBytes||0, responseBytes:_rb,
      narrationChars:(r.narration||"").length, eventCount:_etypes.length, eventTypes:_etypes,
      mintCount:Array.isArray(r.gen)?r.gen.length:0,
      cost:dmEstimateCost(_m.laneModel||null, _m.turnBytes||0, _rb), ok:contract.ok });
    GS.dm.lastTurnMeta=null;
    // §4b: turnId rides the dm line too (r.turnId — the TurnResponse's own id) — same join key as the
    // player line, so session-cost-report.py can match a dmlog latency/lane pair to its .dm/turn-*.json.
    pushDmLog(w,"dm",r.narration||"(the DM was silent)",{events:r.events||[], applied, dmNotes:r.dmNotes||null, latencyMs, turnId:r.turnId||null});
    GS.dm.animate=true;   // stream this fresh narration word-by-word (renderWorld → streamDMText)
    GS.dm.rollReq=sanitizeRollRequest(r.rollRequest||null);
    GS.dm.ask=r.ask||null;
    // turn answered — persist pending roll-request/ask, clear the in-flight turn (GS is transient). Mark
    // the current node "narrated" so triage only deep-lanes the FIRST contact with a place — but ONLY when
    // the scene was actually delivered: a response that hands back a rollRequest is mid-beat (the reveal
    // rides the roll-submit turn), so we KEEP the old marker and let that turn deep-lane the real arrival.
    const sceneDelivered=!GS.dm.rollReq;
    const narratedNode=sceneDelivered?w.currentNodeId:((w.dm&&w.dm.lastNarratedNodeId)||null);
    // WORLD-TURN §2/§5: the DM has now narrated this node's arrival — its arrivalBrief drift entries
    // won't ride the digest again (same "cleared only on a real, scene-delivered response" posture as
    // the mint spotlight below).
    if(sceneDelivered && typeof turnRevealDrift==="function") turnRevealDrift(w, w.currentNodeId);
    // DETECTED-EVENTS.md DE-2: a scripted concentration-save request must NOT mark the scene
    // undelivered (triage would wrongly deep-lane the next turn), and the DM's own rollRequest
    // ALWAYS wins the slot (the queue simply waits one turn) — hence the `!GS.dm.rollReq` guard.
    if(!GS.dm.rollReq && typeof dmScriptRollReq==="function"){
      const sr=dmScriptRollReq(w); if(sr) GS.dm.rollReq=sr;
    }
    // DIGEST-DIET §2: the DM demonstrably saw this turn (a response arrived) — promote the pending
    // watermark to digestAckSeq now, so the next digest's delta (touchedSeq>ackSeq) starts from here.
    // ON-DEMAND-GEN §2 (forward ref): mintQueue is cleared here too — same "only on a real response"
    // rule as the ack watermark, so a crashed turn loses neither the spotlight nor the delta.
    const ackSeq=(w.dm&&w.dm.pendingAckSeq!=null)?w.dm.pendingAckSeq:((w.dm&&w.dm.digestAckSeq)||0);
    // ON-DEMAND-GEN §8: carry the session-provenance watermark (captured once per session by startPrep)
    // through this reassignment — it must survive every turn, not just the mintQueue.
    const sessionSeqWatermark=(w.dm&&w.dm.sessionSeqWatermark)||0;
    // ON-DEMAND-GEN §2: mintQueue is cleared here (a fresh queue for genApply to fill) — the spotlight
    // persists across the whole prior turn (including a crashed/unanswered one) and is replaced only now
    // that a real response has demonstrably arrived. genApply pushes onto w.dm.mintQueue itself, so it
    // must run while w.dm still exists, and its results are folded into the fresh w.dm object below
    // rather than being clobbered by that reassignment.
    w.dm=w.dm||{}; w.dm.mintQueue=[];
    if(typeof genApply==="function") genApply(w, r.gen);
    const mintQueue=w.dm.mintQueue||[];
    // HQ3-C4 — carry a FRESH pendingSituation (set by a rest event applied THIS turn — a NEW object,
    // `!==` the turn-start capture) forward into next digest; drop a SEEN one (the same object the DM
    // just answered — acked, same "cleared only on a real, scene-delivered response" rule as the mint
    // spotlight). CRITICAL: this literal rebuild drops any key not listed here — omitting
    // pendingSituation would silently wipe it before the digest ever ships it.
    // HQ3-D3 — a delivered response is also the natural clear point for a carried crit
    // fall-through: the follow-up turn just resolved it, so pendingRoll never persists stale.
    const _newPending = (w.dm && w.dm.pendingSituation && w.dm.pendingSituation !== _hadPending)
      ? w.dm.pendingSituation : null;
    w.dm={rollReq:GS.dm.rollReq, ask:GS.dm.ask, pendingTurnId:null, lastNarratedNodeId:narratedNode,
          digestAckSeq:ackSeq, mintQueue, sessionSeqWatermark, pendingSituation:_newPending, pendingRoll:null};
    saveU(U); postState();          // the DM sees post-event state next turn
    // §7: top up the reserve in the idle window (player is reading) — after the world is saved.
    if(typeof genReserveTopUp==="function"){ genReserveTopUp(w); saveU(U); }
  }catch(e){
    console.error("[dm] applyResponse mid-apply failure — narration/events may be partially applied; tearing down the prep overlay + re-rendering regardless",e);
  }finally{
    renderWorld();      // ALWAYS re-render — the send button + any stale "pending" chrome must reflect GS.dm.pending=false
    wakeReveal();        // ALWAYS lift the prep cinematic — first words landed (or we gave up trying); never strand the player behind it
  }
}

/* ============================================================
   ON-DEMAND-GEN (docs/ON-DEMAND-GEN.md) — the noun supply chain. The DM's `gen[]` rides the response
   (§1); the app rolls instantly BEHIND THE SCREEN (no dice overlay — generation is plumbing, player
   dice keep the theater), mints a SOFT codex record, pushes one feed chip, and queues the mint for
   next turn's digest spotlight (§2, drained by dmDigest via w.dm.mintQueue). §7's deterministic
   reserve (P1) sits in front of the live rollers so a draw is instant when a matching payload exists.
   ============================================================ */

// kind → roller (opts pass through verbatim, §1). "place" is reserved for prep/frontier machinery (§10).
const GEN_ROLLERS = { npc:"rollNPC", interior:"rollBuildingInterior", item:"rollItem", loot:"rollLoot" };
const GEN_CAP = 4;                 // BATCH-GUARDRAILS G4: 5th+ gen entry in one response logs + no-ops
const GEN_RESERVE_CAP = 2;         // §7: 2 pre-rolled payloads per kind

/* the persisted P1 reserve — pre-rolled ROLLER PAYLOADS, not codex records (§7: outside the codex, so
   codexDigest never ships un-fictional entities, and an unused slot has nothing to recycle). */
function genReserveOf(w){ return w.prefetch || (w.prefetch={ reserve:{ npc:[], interior:[], item:[], loot:[] } }); }

/* top up every kind to GEN_RESERVE_CAP by firing the rollers live (synchronous — rollers are instant;
   §7 defers requestIdleCallback until it's ever felt). Called after applyResponse (idle window) and
   after every draw. */
function genReserveTopUp(w){
  const R=genReserveOf(w).reserve;
  Object.keys(GEN_ROLLERS).forEach(kind=>{
    const fn=window[GEN_ROLLERS[kind]];
    if(typeof fn!=="function") return;
    R[kind]=R[kind]||[];
    while(R[kind].length<GEN_RESERVE_CAP) R[kind].push(fn({}));
  });
}

/* pop a matching reserved payload, or null (caller rolls live instead). loot only matches when the
   reserved slot's rarity equals opts.rarity (§7 draw rule) — a tiered/no-opts loot ask always rolls
   live rather than risk handing back the wrong budget. */
function genReserveDraw(w, kind, opts){
  const R=genReserveOf(w).reserve; const arr=R[kind]; if(!arr||!arr.length) return null;
  if(kind==="loot"){
    if(!opts||!opts.rarity) return null;
    const i=arr.findIndex(p=>p.rolled&&p.rolled.rarity && p.rolled.rarity.toLowerCase().replace(/\s+/g,"-")===String(opts.rarity).toLowerCase());
    if(i<0) return null;
    return arr.splice(i,1)[0];
  }
  return arr.shift();
}

/* §1 — apply the DM's gen[] requests: draw-or-roll, mint SOFT, chip, queue the spotlight. Capped at
   GEN_CAP; unknown kind or overflow logs + no-ops (forward-compatible, same posture as applyEvent). */
function genApply(w, gen){
  if(!Array.isArray(gen) || !gen.length) return;
  gen.forEach((g,i)=>{
    if(!g || !g.kind){ console.warn("[gen] malformed gen entry — no-op:",g); return; }
    if(i>=GEN_CAP){ console.warn("[gen] gen-overflow — entry",i,"no-op (cap "+GEN_CAP+"):",g); return; }
    const kind=g.kind, opts=g.opts||{};
    // WORLD-TURN §5 — the reincorporation oracle: the mirror of minting. A GUARD CLAUSE ahead of the
    // GEN_ROLLERS check (recall doesn't roll a fresh payload, it draws an EXISTING known/hard record) —
    // never returns soft/unknown records or anything already on stage this scene (mintIds+current node).
    if(kind==="recall"){
      if(typeof turnRecall!=="function") return;
      const excludeIds=((w.dm&&w.dm.mintQueue)||[]).map(m=>m.id).filter(Boolean).concat([w.currentNodeId]);
      const r=turnRecall(w, Object.assign({excludeIds}, opts.tag?{tag:opts.tag}:{}));
      if(!r) return;
      pushDmLog(w,"dm","⚙ the world rhymes with itself — recall: "+r.name,{system:true,gen:true,kind:"recall",id:r.id});
      w.dm=w.dm||{}; w.dm.mintQueue=w.dm.mintQueue||[];
      w.dm.mintQueue.push({ id:r.id, kind:r.kind, name:r.name, genRef:r.genRef });
      return;
    }
    if(!GEN_ROLLERS[kind]){ console.warn("[gen] unknown gen kind — no-op (forward-compatible):",kind); return; }
    let payload=genReserveDraw(w,kind,opts);
    if(!payload){ const fn=window[GEN_ROLLERS[kind]]; if(typeof fn!=="function") return; payload=fn(opts); }
    // PLOT-ITEM-RECURRENCE (dev/top-band-uniqueness-report.md, class-(iii) #53/#54): a Mythic plot-item
    // fire carries `origin:"plot-item:<row>"` (codex-roll.js). If a codex item record from that SAME row
    // already exists in THIS world, this is the legendary thing resurfacing, not a fresh mint — hand back
    // the EXISTING record flagged recurrence:true and STOP before codexAdd (no duplicate, no reserve churn
    // for a draw that never happened). Ungated for every other kind/row: only a payload carrying `origin`
    // (today, only Mythic plot-item/plot-lock) is ever checked, so ordinary gen mints are untouched.
    if(payload && payload.origin && typeof codexFindByOrigin==="function"){
      const existing=codexFindByOrigin(w, payload.origin, kind);
      if(existing){
        pushDmLog(w,"dm","⚙ the world remembers — "+kind+" resurfaces: "+existing.name,
          {system:true,gen:true,kind,id:existing.id,recurrence:true});
        w.dm=w.dm||{}; w.dm.mintQueue=w.dm.mintQueue||[];
        w.dm.mintQueue.push({ id:existing.id, kind, name:existing.name, genRef:w.dm.pendingTurnId||null,
          recurrence:true,
          note:"this legendary item already exists in this world — it RESURFACES; narrate its return, never a duplicate." });
        return;
      }
    }
    if(opts.name) payload=Object.assign({},payload,{name:opts.name});   // DM name-in-a-bind, matched to real rolled atoms
    const status=Object.assign({ soft:true }, (kind!=="loot"&&w.currentNodeId)?{ at:w.currentNodeId }:{});
    // interiors carry the §4 room-die request flag on mint — the DM generates the bespoke die (dm.effectDie
    // round-trips via codex_update); other kinds don't need one.
    const dm=(kind==="interior")?Object.assign({},payload.dm,{needsEffectDie:true}):payload.dm;
    const rec=(typeof codexAdd==="function") ? codexAdd(w, Object.assign({}, payload, { status, dm })) : null;
    if(!rec) return;
    pushDmLog(w,"dm","⚙ the world provides — "+kind+" rolled",{system:true,gen:true,kind,id:rec.id});
    w.dm=w.dm||{}; w.dm.mintQueue=w.dm.mintQueue||[];
    w.dm.mintQueue.push({ id:rec.id, kind, name:rec.name, genRef:w.dm.pendingTurnId||null });
    genReserveTopUp(w);   // §7: refill the slot this draw just emptied (no-op if it was a live roll)
  });
}

/* ROLL-BRANCHES §1/§4 step 1: validate rollRequest.branches shape before it's ever trusted by dmRollFor.
   A branch set needs a numeric `dc` (the app resolves locally — no dc, nothing to resolve against) and
   at least a `success` branch (the minimum viable set; `nearMiss`/`fail` degrade gracefully at resolve
   time per §2). Each present branch must be an object with a string `narration` and an array `events`
   (a missing/malformed field on an individual branch is repaired in place — narration defaults to "",
   events to [] — rather than discarding the whole set over one bad key). Anything unsalvageable (no dc,
   no success branch, branches not an object) logs and STRIPS to a bare rollRequest — never blocks the
   check (§4 step 1: "a malformed branch set logs + strips to a bare rollRequest"). `rollRequest.dice`
   requests never carry branches (§1: "never branches — no DC, nothing to resolve against") so they pass
   through untouched. */
function sanitizeRollRequest(rq){
  if(!rq || !rq.branches) return rq;
  if(rq.dice){ const {branches,...rest}=rq; console.warn("[roll-branches] dice request carried branches — stripped"); return rest; }
  const br=rq.branches;
  if(typeof br!=="object" || Array.isArray(br) || typeof rq.dc!=="number" || !br.success || typeof br.success!=="object"){
    console.warn("[roll-branches] malformed branch set — stripped to bare rollRequest", rq);
    const {branches,...rest}=rq; return rest;
  }
  const clean={};
  ["success","nearMiss","fail"].forEach(k=>{
    const b=br[k]; if(!b||typeof b!=="object") return;
    clean[k]={ narration:(typeof b.narration==="string")?b.narration:"", events:Array.isArray(b.events)?b.events:[] };
  });
  return Object.assign({},rq,{branches:clean});
}

/* The app posts a fresh state snapshot the DM can consult (read-only; never mutated by the bridge).
   Scoped to the world IN PLAY — the DM never needs the other saved worlds, so we don't ship them
   (smaller payload to read if the DM consults /state beyond the digest). */
function postState(){
  const w=activeWorld();
  const snap=w?Object.assign({},U,{worlds:{[w.id]:w}}):U;
  fetch(DM_BASE+"/state",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(snap)}).catch(()=>{});
}

function dmBridgeDown(e){
  GS.dm.pending=false; if(GS.dm.poll){clearTimeout(GS.dm.poll);GS.dm.poll=null;}
  toast("DM bridge unreachable — run: python3 dev/dm-bridge.py");
  renderWorld(); wakeReveal();                     // never strand the player on the prep cinematic
}

/* ---------- player-facing actions (wired to inline handlers in the World view) ---------- */

/* Send a free-text action. `forced` lets an `ask` option button submit its own text. */
function dmSend(forced){
  const ta=document.getElementById("dmAction");
  const action=(forced!=null?forced:(ta?ta.value:"")||"").trim();
  if(!action){ toast("Say or do something first."); return; }
  if(ta&&forced==null) ta.value="";
  GS.dm.ask=null;
  sendTurn(action,[]).catch(()=>{});
}

/* The roll handshake: the DM REQUESTED a check, so the player rolls openly here, and the result
   rides the NEXT turn. We never let the DM resolve it. d20 + ability mod + (prof if skill-proficient).
   `adv` is the DM-declared circumstance ("advantage"/"disadvantage") — we roll 2d20 keep highest/lowest,
   so the dice actually reflect the call (the script owns the mechanic; the DM owns whether it applies). */
function dmRollFor(skill,ability,adv){
  const w=activeWorld(); if(!w) return;
  const rq=GS.dm.rollReq;   // ROLL-BRANCHES: snapshot BEFORE it's cleared below — dc/branches live here
  const cur=w.characters.filter(c=>c.status==="living").slice(-1)[0]; const sh=cur&&cur.sheet;
  const aMod=(sh&&sh.mods&&ability&&typeof sh.mods[ability]==="number")?sh.mods[ability]:0;
  const prof=(sh&&sh.skillProfs&&skill&&sh.skillProfs.indexOf(skill)>=0)?(sh.profBonus||0):0;
  const mode=(adv==="advantage"||adv==="disadvantage")?adv:null;
  const d1=rollDie(20), d2=mode?rollDie(20):null;
  const die=mode==="advantage"?Math.max(d1,d2):mode==="disadvantage"?Math.min(d1,d2):d1;
  const pair=mode?[d1,d2]:null, total=die+aMod+prof;
  const advTag=mode==="advantage"?" (adv)":mode==="disadvantage"?" (disadv)":"";
  const mods=(aMod>=0?"+":"")+aMod+(prof?(" +"+prof+" prof"):"");
  GS.dm.rollReq=null;
  // DETECTED-EVENTS.md DE-2: this scripted request resolves — shift its queue entry off the sheet
  // NOW (before the branch resolves) so a chained save (queued by this very resolution) sees an
  // accurate remaining queue length.
  if(rq && rq.scripted==="concentration"){
    const t2=(typeof livingSheet==="function")?livingSheet(w):null;
    if(t2 && t2.sh.concentration && Array.isArray(t2.sh.concentration.pendingSaves)) t2.sh.concentration.pendingSaves.shift();
  }
  const rolls=[{label:skill+advTag,die:"d20",result:die,mods:mods,total:total,adv:mode,pair:pair}];
  // CRIT-MAGNITUDE (§5 dice are open): a nat 20/1 demands a second open d20 — the magnitude die. The
  // engine maps it to a lens vector the DM narrates FROM; we never let the DM fabricate the spike.
  let crit=null;
  if((die===20||die===1) && typeof rollCritMagnitude==="function"){
    crit=rollCritMagnitude(die,{magnitude:rollDie(20)});
    if(crit) rolls.push({label:(crit.success?"crit-magnitude":"fumble-magnitude"),die:"d20",result:crit.magnitude,total:crit.magnitude,crit});
  }
  // the board overlay (docs/DICE-OVERLAY.md) — theater on the ALREADY-rolled numbers; adv/dis shows
  // the pair with the discarded die marked; a crit chains the magnitude die as stage 2.
  if(typeof diceOverlay==="function"){
    let odice;
    if(pair){ const keep=(pair[0]===die)?0:1; odice=pair.map((r,i)=>({sides:20,result:r,dropped:i!==keep})); }
    else odice=[{sides:20,result:die}];
    if(crit) odice[pair?((pair[0]===die)?0:1):0].crit=crit.success?"crit":"fumble";
    diceOverlay({ title:skill+advTag, dice:odice,
      resultLine:skill+": "+die+" "+mods+" = "+total,
      stage2:crit?{dice:[{sides:20,result:crit.magnitude}],resultLine:"magnitude "+crit.magnitude+" → "+crit.tier}:null });
  }
  const pairStr=pair?` [${pair.join(",")}]${mode==="advantage"?"↑":"↓"}`:"";
  // one toast — always shows the base check math; appends the spike when a crit fired (base info stays
  // visible exactly on the most dramatic rolls).
  toast(crit
    ? (crit.success?"CRIT! ":"FUMBLE! ")+skill+advTag+" d20="+die+" ("+total+") · magnitude "+crit.magnitude+" → "+crit.tier+(crit.lensCount?(" — "+crit.lensCount+" lens"+(crit.lensCount===1?"":"es")):"")
    : skill+advTag+": d20="+die+pairStr+" "+mods+" = "+total);
  // ROLL-BRANCHES §2/BATCH-GUARDRAILS G3: a GUARD CLAUSE after the dice are rolled, before sendTurn.
  // Nat 20/1 (die===20||die===1) ALWAYS falls through to the live two-turn flow (crit-magnitude demands
  // the second d20 + the DM's lens narration — §1: "rare, and those beats deserve the inference").
  const br=rq&&rq.branches;
  // DE-2 E7: a scripted concentration save resolves LOCALLY even on a natural 20/1 — no crit-magnitude
  // theater beat on a bookkeeping save (decided). Every OTHER branched request keeps the existing
  // "nat 20/1 always falls through to the live two-turn flow" guard.
  if(br && (rq.scripted==="concentration" || (die!==20 && die!==1)) && typeof resolveCheck==="function" && typeof rq.dc==="number"){
    resolveBranch(w,rq,rolls,total);   // renders DM-voice entry + applies events + sets lastResolution; NO sendTurn
  } else {
    // BUG-08: clear the PERSISTED request here too (mirror resolveBranch below) — sendTurn also
    // clears it (~line 409), but a throw/process boundary in between leaves w.dm.rollReq set and
    // render.js re-hydration re-fires the branch.
    // HQ3-D3: persist the fall-through itself — {action,rolls} otherwise live ONLY in this call's
    // stdout/sendTurn payload and are lost across a process boundary (SET-01-F2/SET-05-NOTE-A).
    // Cleared at the natural point: applyResponse's w.dm rebuild, once the follow-up turn lands.
    if(w.dm){ w.dm.rollReq=null; w.dm.pendingRoll={ action:"(I roll "+skill+advTag+": "+total+")", rolls:rolls, ts:Date.now() }; }
    sendTurn("(I roll "+skill+advTag+": "+total+")",rolls).catch(()=>{});
  }
}

/* ROLL-BRANCHES §2 — the app-side resolution path. Called ONLY when a natural 2–19 landed against a
   branched rollRequest (dmRollFor's guard clause above). Resolves the SAME resolveCheck margin ladder
   the rest of the engine uses (checkDegree, engine.check), maps its degree onto the branch's three keys
   (BATCH-GUARDRAILS G3: collapse toward success/nearMiss/fail — never invent a fourth), renders the
   branch narration as a DM-voice feed entry with the "⚄ resolved by the dice" marker, applies the
   branch's events through the REAL applyEvent runtime (stamped source:"branch" — G3: set e.source, don't
   add a new envelope field), and stamps lastResolution for the next sendTurn to carry. NO turn is posted
   — GS.dm.rollReq already cleared by the caller; the player acts next as usual (§2 step 5). */
function resolveBranch(w,rq,rolls,total){
  const skill=rq.skill||"", dc=rq.dc;
  const chk=resolveCheck({ d20:rolls[0].result, dc, bonus:total-rolls[0].result });   // reconstitute the SAME total (nat + already-applied mods) against dc; margin/degree come from resolveCheck itself
  // degree→branch: resolveCheck's ladder has 5 degrees (crit-success/success/near-miss/failure/crit-failure);
  // collapse toward the 3 declared keys — crit-success counts as success, failure counts as fail. nat 20/1
  // never reach here (dmRollFor's guard already filtered them), so crit-success/crit-failure only arise
  // here off margin (≥+10 / ≤−10), which still maps sensibly onto the 3-key set.
  let branchKey=(chk.degree==="crit-success"||chk.degree==="success")?"success"
                  :(chk.degree==="near-miss")?"nearMiss":"fail";
  // DE-2 E7: SRD 2024 d20-Test auto-fail/auto-succeed on saves — a scripted concentration save's
  // natural 1/20 overrides the margin-based degree (dmRollFor's guard now lets nat 20/1 reach here
  // ONLY for scripted saves).
  if(rq.scripted==="concentration"){
    if(rolls[0].result===1) branchKey="fail";
    if(rolls[0].result===20) branchKey="success";
  }
  // missing-branch fall-through (§5 assertion 4): nearMiss absent → fall to fail's branch; if THAT'S
  // absent too (or the picked key has no branch at all), there's nothing declared for this outcome —
  // fall through to the live two-turn flow rather than inventing narration.
  const br=rq.branches||{};
  const branch=br[branchKey] || (branchKey==="nearMiss" ? br.fail : null);
  if(!branch){ if(w.dm){ w.dm.rollReq=null; w.dm.pendingRoll={ action:"(I roll "+skill+": "+total+")", rolls:rolls, ts:Date.now() }; } sendTurn("(I roll "+skill+": "+total+")",rolls).catch(()=>{}); return; }   // BUG-08: same fall-through, same clear; HQ3-D3: same persistence
  const _liveNat=(rolls&&rolls[0]&&rolls[0].result)|0;
  const events=(branch.events||[]).map(e=>{
    const ev=Object.assign({},e,{source:"branch"});
    if(ev.type==="social_check"){
      // HQ3-B3: the branch was SELECTED by the live d20 — grade the committed attitude shift against
      // that die, not the DM's blind literal. Clone the payload (never mutate the authored branch),
      // override total + natural; leave dc/skill/target/levers as authored.
      ev.payload=Object.assign({}, ev.payload, { total: total, natural: _liveNat });
    }
    return ev;
  });
  // DE-3: same fold, branch-resolution apply path (one implementation, two call sites).
  const _foldedSlotsB=(typeof dmFoldSlotSpends==="function")?dmFoldSlotSpends(events):new Set();
  const applied=events.map((e,ei)=>{
    if(e && e.type==="slot_spent" && _foldedSlotsB.has(ei)){
      if(typeof addLedger==="function") addLedger(w,"outcome",{kind:"slot-fold",source:"detected"},
        "◇ the slot spend rides the cast — not double-charged.");
      return {type:e.type, res:{ok:true, folded:"rides-cast"}};
    }
    return {type:e.type, res:applyEvent(w,e)};
  });
  pushDmLog(w,"dm",branch.narration||"",{events, applied, branchResolved:true, turnId:null});
  GS.dm.animate=true;   // stream the branch narration exactly like a live DM reply
  const turnId="t-"+uid();
  w.dm=w.dm||{}; w.dm.rollReq=null; w.dm.ask=null;   // clear the PERSISTED request too — renderWorld's re-hydration guard (render.js) would otherwise restore it from w.dm and re-fire the branch
  w.dm.lastResolution={ turnId, skill, total, degree:chk.degree, branch:branchKey };
  // DETECTED-EVENTS.md DE-2: a branch's own events (e.g. hp_changed) may have just queued a NEW
  // concentration save — mirror the same script-authored-request seam here so chained saves drain
  // one per resolution instead of needing a live DM turn in between.
  if(!GS.dm.rollReq && typeof dmScriptRollReq==="function"){
    const sr=dmScriptRollReq(w); if(sr){ GS.dm.rollReq=sr; w.dm.rollReq=sr; }
  }
  saveU(U); renderWorld(); postState();
}

/* Free-dice roll: the player rolls an arbitrary expression (damage, healing, a wild die — "2d6+3",
   "1d8", "4d6") openly and it rides the next turn, exactly like a check. Used by a DM `rollRequest.dice`
   prompt AND the player's own dice tray. `label` is the flavor ("fire damage"); defaults to the expr. */
function dmRollDice(expr,label){
  const w=activeWorld(); if(!w) return;
  const r=(typeof rollDiceExpr==="function")?rollDiceExpr(expr):null;
  if(!r||!r.ok){ toast("Couldn't read those dice: "+expr); return; }
  const lab=(label&&String(label).trim())||r.expr;
  // the board overlay — one physical die per rolled die, each settling on its true face
  if(typeof diceOverlay==="function"){
    const odice=[]; (r.terms||[]).forEach(t=>{ if(t.rolls) t.rolls.forEach(v=>odice.push({sides:t.sides,result:v})); });
    diceOverlay({ title:lab, dice:odice, resultLine:r.show });
  }
  GS.dm.rollReq=null; if(w.dm) w.dm.rollReq=null;   // BUG-08: same persisted-request clear as dmRollFor's fall-through
  const rolls=[{label:lab,die:r.expr,result:r.total,total:r.total,expr:r.expr,breakdown:r.show}];
  // HQ3-D3: persist this fall-through the same way dmRollFor does — a free-dice roll rides the
  // same live-flow seam and must survive a process boundary too.
  if(w.dm) w.dm.pendingRoll={ action:"(I roll "+lab+": "+r.show+")", rolls:rolls, ts:Date.now() };
  toast(lab+": "+r.show);
  sendTurn("(I roll "+lab+": "+r.show+")",rolls).catch(()=>{});
}

/* Roll the expression typed into the dice-tray input (the free-roll path). */
function dmRollExprInput(){
  const el=document.getElementById("diceExpr"); if(!el) return;
  const v=(el.value||"").trim(); if(!v){ toast("Type some dice — e.g. 2d6+3"); return; }
  el.value=""; dmRollDice(v,v);
}

/* ============================================================
   2. THE EVENT-CONTRACT RUNTIME — applyEvent(w,e)
   Dispatch a typed DM event to the app's real mutators. Reused by ADVANCEMENT/DIFFICULTY later.
   ============================================================ */

/* Fuzzy-match a clockId to a faction or a front (v1 declared events; no stable ids on the web yet).
   clockId is a slug like "tide-wardens" or "tide-wardens:recover-ledger" or a front's danger slug. */
function findClockTarget(w,clockId){
  const id=slug(clockId||""); if(!id) return null;
  // Exact slug first; fall back to a prefix match ONLY when it's unambiguous (exactly one). A both-ways
  // prefix test that returns the FIRST hit can silently land a clock advance on the wrong front when two
  // powers share a name-stem — so an ambiguous prefix resolves to null (untracked) rather than a guess.
  const resolve=(arr,keyOf,wrap)=>{
    const exact=arr.find(x=>keyOf(x)===id); if(exact) return wrap(exact);
    const pre=arr.filter(x=>{const s=keyOf(x); return s && (id.indexOf(s)===0||s.indexOf(id)===0);});
    return pre.length===1 ? wrap(pre[0]) : null;
  };
  const fac=resolve(w.factions||[], f=>slug(f.name), f=>({kind:"faction", obj:f, label:f.name, clock:f.clock}));
  if(fac) return fac;
  return resolve(w.pressures||[], p=>slug(p.danger||p.kind), p=>({kind:"front", obj:p, label:p.danger||p.kind, clock:p.clock}));
}

/* The current living PC's sheet — the subject of resource events (HP / slots / pools). */
function livingSheet(w){const c=(w.characters||[]).filter(x=>x.status==="living").slice(-1)[0];return c&&c.sheet?{c:c,sh:c.sheet}:null;}

// HQ3-D1: sheet.marks[] is UNIFIED on the object shape {id,text,kind,sinceDay,mechanical?}.
// markText() reads either shape tolerantly (legacy string marks in already-saved worlds are
// never migrated — see mark_added/mark_removed below and src/creator/life.js).
const MARK_KINDS=["injury","curse","debt","other"];
function markText(m){ return (m&&typeof m==="object")?(m.text||""):String(m||""); }

/* TRANSITION-CONTRACT.md §3.7 — KNOCKOUT. ONE implementation behind two thin entrances (the
   hp_changed{nonlethal:true} 0-HP branch, and the dedicated `knockout` event for a no-damage-math
   KO). Sets hpCur=0, clears any death-save tracker (non-lethal never kills — CAL-1), stamps a
   wake time (SRD: stable at 0, wakes at 1 HP after 1d4 hours), and pushes the "unconscious"
   condition (guarded by indexOf, capture.js's exact string-condition precedent). Never touches
   killCharacter/the bardo (E26) — KO and death are disjoint paths. */
function applyKnockout(w, t, cause){
  const sh=t.sh;
  sh.hpCur=0;
  if(typeof clearDeathSaves==="function") clearDeathSaves(sh);
  const c=clockOf(w);
  const wakeIn=(typeof rollDie==="function"?rollDie(4):1)*60;
  const total=c.day*1440+c.min+wakeIn;
  const wakeDay=Math.floor(total/1440), wakeMin=((total%1440)+1440)%1440;
  sh.ko={ stable:true, cause:cause||null, at:{day:c.day,min:c.min}, wakeDay, wakeMin };
  t.c.conditions=t.c.conditions||[];
  if(t.c.conditions.indexOf("unconscious")<0) t.c.conditions.push("unconscious");
  addLedger(w,"outcome",{kind:"knockout",pc:t.c.name,cause:cause||null,wakeDay,wakeMin,source:"detected"},
    "✦ "+t.c.name+" goes down — out cold, breathing. (non-lethal)");
  return {ok:true, ko:true, wakeInMin:wakeIn};
}

/* TRANSITION-CONTRACT.md §3.7 — lazy KO-wake check (no tick loop exists, by design; called from
   every clock-advancing site). Wakes a KO'd living PC once the clock has reached/passed their
   stamped wakeDay/wakeMin (E21 — a montage that jumps far past wakeAt still wakes exactly once). */
function koCheckWake(w){
  const t=(typeof livingSheet==="function")?livingSheet(w):null; if(!t) return;
  const sh=t.sh; if(!sh.ko) return;
  const c=clockOf(w);
  const now=c.day*1440+c.min, wakeAt=sh.ko.wakeDay*1440+sh.ko.wakeMin;
  if(now<wakeAt) return;
  sh.hpCur=Math.max(sh.hpCur||0,1);
  sh.ko=null;
  const idx=(t.c.conditions||[]).indexOf("unconscious");
  if(idx>=0) t.c.conditions.splice(idx,1);
  if(typeof clearDeathSaves==="function") clearDeathSaves(sh);
  addLedger(w,"outcome",{kind:"ko-wake",pc:t.c.name,source:"detected"},
    "✦ "+t.c.name+" comes to — 1 HP, the world still turning.");
}

/* Resolve a §3 condition TARGET to the object whose `conditions` array we mutate + a display label.
   "pc" (or omitted) → the living character (conditions live on the character, per dmDigest's cur.conditions);
   a combat foe fid ("f1") → the matching GS.combat foe. Returns {obj, label} or null. */
function conditionHolder(w,target){
  if(target==null || target==="pc"){ const t=livingSheet(w); if(!t) return null; t.c.conditions=t.c.conditions||[]; return {obj:t.c, label:t.c.name}; }
  const foes=(GS.combat&&GS.combat.foes)||[];
  const foe=foes.find(f=>f.fid===target || f.codexId===target || f.name===target);
  if(foe){ foe.conditions=foe.conditions||[]; return {obj:foe, label:foe.name||target}; }
  return null;
}
/* Build a resolveSkillCheck-shaped defender from a combat foe for a grapple/shove CONTEST (§6): the foe's
   REAL ability modifiers (Athletics=STR, Acrobatics=DEX) + its proficiency bonus. Bestiary foes carry
   abilities as {str:{score,mod},…}; cmFoeFrom doesn't propagate skill proficiencies, so the foe is treated
   as non-proficient in the contest skill — but its ability mod now counts (an ogre defends at its real
   +STR, no longer a mods:{} +0 pushover). A missing foe → a flat +0 defender (degenerate no-target). */
function foeContestSheet(foe){
  const mods={},ab=(foe&&foe.abilities)||{};
  ["str","dex","con","int","wis","cha"].forEach(k=>{ mods[k]=(ab[k]&&typeof ab[k].mod==="number")?ab[k].mod:0; });
  return { mods, profBonus:(foe&&foe.pb)||0, skillProfs:[] };
}
/* a compact human label for a structured condition ttl (for the ledger line). */
function conditionTtlLabel(ttl){
  if(!ttl) return "";
  if(typeof ttl.rounds==="number") return ttl.rounds+" round"+(ttl.rounds===1?"":"s");
  if(ttl.untilSave) return "save "+(ttl.untilSave.ability||"?")+" DC "+(ttl.untilSave.dc||"?");
  if(ttl.endOfNextTurn) return "end of next turn";
  if(ttl.concentration) return "while concentration holds";
  if(ttl.indefinite) return "until cured";
  return "";
}

/* DETECTED XP (ADVANCEMENT.md): price a resolved-tension event + accrue it on the living sheet. XP is
   never DM-declared — it's a side effect of the events the script already applies. Flags a pending
   level-up (claimed on the next rest, in world.play passTime). No-op if advancement isn't loaded. */
function grantXp(w, type, p, extra){
  if(typeof awardXp!=="function" || typeof xpForEvent!=="function") return null;
  const t=livingSheet(w); if(!t) return null;
  let n;
  if(type==="encounter_resolved" && typeof encounterResolvedXp==="function"){
    // ADVANCEMENT-RETUNE.md §4 instrument: encounterResolvedXp exposes {paid,full,lost} so the decay
    // TAX (what farming would have cost) feeds xpReport.decayLost — a plain xpForEvent call can't see
    // it (single-scalar contract) and calling both would double-mutate the decay store.
    const d=encounterResolvedXp(p, t.sh.level||1, extra||{});
    n=d.paid;
    if(d.lost){ if(!w.xpDecay) w.xpDecay={}; w.xpDecay.lost=(w.xpDecay.lost||0)+d.lost; }
  } else {
    n=xpForEvent(type, p, t.sh.level||1, extra);
  }
  if(!n) return null;
  // The discovery side-channel (per narrated fact) is the one award the DM can spam, so the script
  // BOUNDS it: discovery/fact_canonized XP is capped per in-world day; past the ceiling it pays $0
  // (no XP, no ledger line) no matter how many facts get canonized. Resolved tension is the real
  // level-driver (front_closed / clock_fired), which is uncapped. See docs/ADVANCEMENT.md.
  if(type==="discovery" || type==="fact_canonized"){
    const day=(typeof clockOf==="function" ? clockOf(w).day : 0);
    if(!w.xpDiscovery || w.xpDiscovery.day!==day) w.xpDiscovery={day, used:0};
    const cap=(typeof DISCOVERY_XP_PER_DAY!=="undefined") ? DISCOVERY_XP_PER_DAY : 30;
    n=Math.min(n, Math.max(0, cap - w.xpDiscovery.used));
    if(!n) return null;                       // daily discovery ceiling hit — pay nothing further today
    w.xpDiscovery.used += n;
  }
  const r=awardXp(t.sh, n);
  addLedger(w,"outcome",{kind:"xp",amount:n,reason:type,xp:r.xp,pending:r.pending,source:"detected"},
    `✦ +${n} XP — ${r.xp} total${r.pending?" · a level waits to be claimed on your next rest":""}.`);
  return r;
}

/* COMBAT-LIFECYCLE.md §3b — the anti-drift half: DETECT "the fight is over" instead of leaving it to the
   DM to notice. Called from the three sites that can change a foe's down/fled/surrendered state (the
   `attack` case, `foe_action`'s self-damage path, `foe_morale`'s flee/surrender/rout application) — NOT
   a render-time check. When every foe is down, auto-fires a detected `combat_end{outcome:"resolved"}` —
   UNCHANGED. CHASE-CONTRACT-FIX.md (docs/CHASE-CONTRACT-FIX.md): when every foe is merely resolved
   (≥1 fled/surrendered, none still up) but NOT all down, do NOT auto-fire — a solo foe breaking morale
   and fleeing is the single most common chase trigger, and firing combat_end here raced §3d's own
   "chase_start BEFORE combat_end" contract (GS.combat was already null by the DM's next turn — the
   playtest's finding #1/#2). Instead set GS.combat.resolvable (idempotent — never re-set once present;
   cleared for free when GS.combat=null at combat_end disposes the whole object) so the foe stays live
   in GS.combat until the DM declares chase_start and/or combat_end per the existing §3a contract. Script
   owns detection; DM owns the end decision (doctrine, locked). */
function cmMaybeAutoEnd(w){
  if(!GS.combat||!GS.combat.active) return null;
  const foes=GS.combat.foes||[];
  if(!foes.length) return null;
  const allResolved=foes.every(f=>f.down||f.fled||f.surrendered);
  if(!allResolved) return null;
  const allDown=foes.every(f=>f.down);
  if(!allDown){
    if(!GS.combat.resolvable){
      GS.combat.resolvable={outcome:"fled", since:GS.combat.round};
      addLedger(w,"outcome",{kind:"resolvable",outcome:"fled",source:"detected"},
        "— The fight is yours to end: every foe is fled or yielded.");
    }
    return null;
  }
  return applyEvent(w,{type:"combat_end",source:"detected",payload:{outcome:"resolved"}});
}

/* DETECTED-EVENTS.md DE-4 — the morale CHECKPOINT firing becomes detected; the engine already owns
   the trigger (moraleTrigger) and the once-per-fight-per-trigger flags (moraleAlreadyFired /
   markMoraleFired, src/engine/monster-tactics.js) — only the "remember to check" burden moves off
   the DM. Sweeps every live (not down/fled/surrendering/surrendered) foe for a NEWLY-true checkpoint
   and fires the existing `foe_morale` case for each (re-using its guard/flag-mark/WIS-save/flee
   logic verbatim — no recursion risk, that case damages nothing). The DM may still declare
   `foe_morale`/`morale_check` for fear beats it initiates — the flags make any overlap a clean
   `{ok:false, reason:"already-fired"}` no-op (E11). */
function cmMoraleSweep(w){
  if(!GS.combat || !GS.combat.active) return [];
  if(typeof moraleTrigger!=="function") return [];
  const fired=[];
  (GS.combat.foes||[]).forEach(f=>{
    if(f.down||f.fled||f.surrendering||f.surrendered) return;
    const trig=moraleTrigger(f,GS.combat);
    if(!trig || moraleAlreadyFired(GS.combat.moraleFlags||{}, f.fid, trig)) return;
    fired.push({fid:f.fid, trigger:trig,
      res:applyEvent(w,{type:"foe_morale", payload:{foe:f.fid, trigger:trig}, source:"detected"})});
  });
  return fired;
}

/* DETECTED-EVENTS.md DE-2 — script-AUTHORED branched rollRequest for a queued concentration save.
   The d20 stays the player's (DM-agency law) — this only removes the DM's duty to remember to ASK
   for it. If the living sheet has a pending concentration save and no rollRequest is already
   pending, author one whose `fail` branch applies `concentration_broken{cause:"damage"}` through
   the real event contract. Returns null when there's nothing to script. */
function dmScriptRollReq(w){
  const t=(typeof livingSheet==="function")?livingSheet(w):null;
  const ps=t && t.sh && t.sh.concentration && t.sh.concentration.pendingSaves;
  if(!ps || !ps.length) return null;
  const p=ps[0];
  return { scripted:"concentration", skill:"Concentration", ability:"con", dc:p.dc, adv:null,
    why:"You took damage while concentrating on "+p.spell+" — DC "+p.dc+" CON save to hold it.",
    branches:{
      success:{ narration:"(You keep your grip on "+p.spell+".)", events:[] },
      fail:{ narration:"(The weave slips — your concentration on "+p.spell+" breaks.)",
             events:[{type:"concentration_broken", payload:{cause:"damage"}}] } } };
}

/* CHASE-SOFT-RECALL (docs/CHASE-SOFT-RECALL.md) — an "away" chase ending must leave a codex handle,
   not just a static ledger line (finding #7: TABLE-GAPS-070126.md §1 promised "the fled foe persists
   soft, recall fodder"; the built chase wrote only prose — turnRecall (turn.js:414) only ever draws
   known+hard records, and a bare combat-foe object was never a record at all). Called from BOTH away
   sites (chase_round's ended-away branch and chase_yield's side:"pursuer" branch) before GS.chase is
   cleared. Resolution order (first hit wins), shape precedent = turnMintSuccessorThread (turn.js:380):
     a. GS.chase.npcId or quarry.codexId -> codexUpdate (an existing codex npc quarry — re-escape or
        the npcId path) — merge semantics, codexTouch rides the DIGEST-DIET delta for free.
     b. codexFindByOrigin("chase-escaped:"+slug(name)) -> same codexUpdate (a SECOND escape by a
        quarry minted on a prior chase — PLOT-ITEM-RECURRENCE discipline: update, never duplicate).
     c. quarry.significant -> mint (codexAdd + guarded codexLink + mintQueue push).
     d. else -> null (a generic mook; ledger prose only, byte-identical to pre-existing behavior).
   Returns the touched/minted record, or null. Null-safe throughout: every codex call is function-
   guarded so a missing codex module never blocks the chase end. */
function chaseEscapeRecall(w, src, wkStamp){
  const q=GS.chase&&GS.chase.quarry;
  if(!q || !q.name) return null;
  const escape={ nodeId:w.currentNodeId, day:(typeof clockOf==="function"?clockOf(w).day:null),
    terrain:GS.chase.terrain, walk:wkStamp };
  // a. an existing codex npc quarry (npcId path or a codexId captured at chase_start)
  const directId=(GS.chase&&GS.chase.npcId)||q.codexId;
  if(directId && typeof codexGet==="function" && typeof codexUpdate==="function"){
    const ex=codexGet(w,directId);
    if(ex) return codexUpdate(w,directId,{status:{condition:"fled",at:w.currentNodeId},
      dm:{chaseEscaped:true,escape}});
  }
  // b. re-escape: the same quarry minted on a prior chase, resolved by its origin tag
  if(typeof codexFindByOrigin==="function"){
    const origin="chase-escaped:"+(typeof slug==="function"?slug(q.name):q.name);
    const again=codexFindByOrigin(w,origin,"npc");
    if(again && typeof codexUpdate==="function")
      return codexUpdate(w,again.id,{status:{condition:"fled",at:w.currentNodeId},dm:{chaseEscaped:true,escape}});
  }
  // c. significant, unminted quarry -> mint
  if(q.significant && typeof codexAdd==="function"){
    const id=(typeof prepCastId==="function")?prepCastId(w,"npc",q.name):("npc:"+(typeof slug==="function"?slug(q.name):q.name)+"-"+uid());
    const rec=codexAdd(w,{
      id, kind:"npc", name:q.name,
      provenance: q.statId ? "rolled" : "authored",
      rolled: q.statId ? { statId:q.statId, cr:q.cr } : null,
      fields:{ role:"escaped quarry" },
      dm:{ chaseEscaped:true, escape },
      origin:"chase-escaped:"+(typeof slug==="function"?slug(q.name):q.name),
      status:{ known:true, soft:false, at:w.currentNodeId, condition:"fled" }
    });
    if(rec && q.factionId && typeof codexLink==="function" && typeof codexGet==="function"){
      const factionRecId="faction:"+(typeof slug==="function"?slug(q.factionId):q.factionId);
      if(codexGet(w,factionRecId)) codexLink(w,rec.id,"member-of",factionRecId);
    }
    if(rec){
      w.dm=w.dm||{}; w.dm.mintQueue=w.dm.mintQueue||[];
      w.dm.mintQueue.push({ id:rec.id, kind:"npc", name:rec.name, genRef:null,
        note:"escaped quarry — persists; recallable" });
    }
    return rec;
  }
  // d. a generic mook — no codex touch
  return null;
}

/* MONSTER-STORY-WIRING §3 — roll ONE row from EACH of a bestiary entry's customTables (Adam's 104
   hand-authored d10s), verbatim, at FIRST mint only. Returns [] when the entry has no customTables
   or BESTIARY isn't loaded (graceful). The engine rolls the row; the DM interprets it — the tables'
   content stays un-mechanized (data/bestiary.js header's law). */
function monsterRollFlavor(statId){
  if(!statId || typeof BESTIARY==="undefined") return [];
  const entry=BESTIARY[statId];
  if(!entry || !Array.isArray(entry.customTables) || !entry.customTables.length) return [];
  return entry.customTables.map(t=>{
    const dataRows=(t.rows||[]).slice(2);        // row 0=header, row 1=separator (markdown table)
    if(!dataRows.length) return null;
    const idx=Math.floor(Math.random()*dataRows.length);
    return { table:t.heading, roll:idx+1, text:dataRows[idx] };
  }).filter(Boolean);
}

/* MONSTER-FLAVOR-TABLES §4 — find a realm creature's own REALM_BESTIARY entry by (realm, name).
   Realm creatures carry their flavorTable on the compiled REALM_BESTIARY row (not on BESTIARY,
   which is the shared stat chassis). Case-insensitive name match to mirror the rest of the wiring.
   Returns the entry or null (graceful when REALM_BESTIARY isn't loaded / the name isn't found). */
function realmCreatureEntry(realm, name){
  if(!realm || !name || typeof REALM_BESTIARY==="undefined") return null;
  const pool=REALM_BESTIARY[realm];
  if(!Array.isArray(pool)) return null;
  const lower=String(name).toLowerCase();
  return pool.find(rc=>rc && String(rc.name).toLowerCase()===lower) || null;
}

/* MONSTER-FLAVOR-TABLES §4 — roll ONE row from a creature's d8 flavorTable, SPICE-CLAMPED to the
   live context band, at FIRST mint only. The flat d8's ceiling follows the context (Adam's "spice
   curve engaged"):
     - Grounded context (a quiet world, no breach): a raw 7-8 re-rolls on d6 — the table's quiet
       rows. Soft-until-contact: quiet worlds meet quiet monsters.
     - Strange+ context (walkIsStrangePlus at the mint site): r7 opens.
     - Volatile+/breach context: r8 opens (its Mythic apex row included).
   A realm-tagged foe is by construction a breach/marooned-realm foe (realm creatures only surface
   in a breach) → that IS the Volatile+/breach context, so its full table (incl. r8) is open. A
   regular monster reads the live walk band via walkIsStrangePlus(). Returns
   {table:"flavor-d8", mode, roll:n, band, text} or null (no table / malformed). */
function monsterRollFlavorD8(ft, ctx){
  if(!ft || ft.die!=="d8" || !Array.isArray(ft.rows) || ft.rows.length!==8) return null;
  const byN={}; ft.rows.forEach(r=>{ if(r && r.n!=null) byN[r.n]=r; });
  // context ceiling: breach -> 8, strange+ -> 7, else -> 6 (the reroll cap)
  const ceiling = (ctx && ctx.breach) ? 8 : ((ctx && ctx.strangePlus) ? 7 : 6);
  let n = 1 + Math.floor(Math.random()*8);
  if(n>ceiling && ceiling<8){
    // raw over-ceiling re-rolls within the allowed quiet band (d6 for Grounded, d7 for Strange+).
    n = 1 + Math.floor(Math.random()*ceiling);
  }
  const row=byN[n];
  if(!row) return null;
  return { table:"flavor-d8", mode:ft.mode||null, roll:n, band:row.band||null, text:row.text||null };
}

/* REALM-STORY-WIRING §3 / MONSTER-STORY-WIRING §3 — mint-or-touch a codex "creature" record for
   every SIGNIFICANT foe in a just-started fight (script-owned threshold, no DM judgment: realm role
   high/apex, OR any realm-tagged foe at CR>=1, OR (MONSTER-STORY-WIRING) a non-realm foe stamped
   bossSlot:true, OR any foe at CR>=3, OR (ANOMALY LAW §2b) a rare `spawnDisposition`-flagged friendly
   spawn — a friendly spawn IS significant regardless of CR/role, the intended recruitment path can't
   silently skip minting just because it rolled on a mook-tier slot — mooks otherwise don't mint, codex
   = handles not a zoo, Consequence-Ladder law). Idempotent by codexKeyId("creature", name) — a second
   Coyote-Thing encounter TOUCHES the same record (codexAdd's own merge path), so recurrence is the
   point, not a bug. Called right after combatStart() populates GS.combat.foes (still live foe objects
   with realm/desc/role/cr). Best-effort: no-ops entirely if codexAdd isn't loaded (a narrow test harness). */
function codexMintSignificantFoes(w, foes){
  if(typeof codexAdd!=="function") return;
  (foes||[]).forEach(f=>{
    if(!f || !f.name) return;
    const significant = f.realmRole==="high" || f.realmRole==="apex" || (f.realm!=null && f.cr!=null && f.cr>=1)
      || f.bossSlot===true || (f.cr!=null && f.cr>=3) || !!f.spawnDisposition;
    if(!significant) return;
    // MONSTER-STORY-WIRING §3 — canon-lock: only roll customTables flavor on the record's FIRST ever
    // mint (mirrors codexAdd's own shape canon-lock pattern above) — a re-encountered Animated Armor
    // still follows the same Last Order. Checked BEFORE codexAdd so a re-mint's payload simply omits
    // dm.flavor (codexAdd's merge path would otherwise Object.assign a fresh roll over the canon one).
    const existingId=codexKeyId("creature", f.name);
    const alreadyMinted=!!(typeof codexGet==="function" && codexGet(w, existingId));
    const flavor=(!alreadyMinted && f.statId) ? monsterRollFlavor(f.statId) : null;
    // MONSTER-FLAVOR-TABLES §4 — the spice-clamped d8 flavor roll, ONCE at first mint, canon-locked
    // beside any custom-d10 rolls. A realm-tagged foe reads its flavorTable off REALM_BESTIARY (its
    // own row); a regular monster off MONSTER_FLAVOR[statId]. A realm foe is a breach foe by
    // construction (Volatile+/breach context, full table open); a regular foe reads the live walk
    // band via walkIsStrangePlus(). Rolled only on first mint — the individual's truth forever.
    const rEntry = f.realm ? realmCreatureEntry(f.realm, f.name) : null;
    const flavorTableFor = rEntry ? rEntry.flavorTable
      : (f.statId && typeof MONSTER_FLAVOR!=="undefined" && MONSTER_FLAVOR[f.statId]
          ? MONSTER_FLAVOR[f.statId].flavorTable : null);
    const flavorCtx = {
      breach: (f.realm!=null),
      strangePlus: (f.realm!=null) || (typeof walkIsStrangePlus==="function" && walkIsStrangePlus())
    };
    const flavorD8 = (!alreadyMinted && flavorTableFor)
      ? monsterRollFlavorD8(flavorTableFor, flavorCtx) : null;
    // realm creatures carry their OWN treasure/habitat/activity (frame inheritance is wrong fiction,
    // MONSTER-FLAVOR-TABLES §2/§6) — prefer the realm row, fall back to the BESTIARY chassis.
    const bEntry = (typeof BESTIARY!=="undefined" && f.statId) ? BESTIARY[f.statId] : null;
    const storyHabitat = (rEntry && rEntry.habitat) || (bEntry && bEntry.habitat) || null;
    const storyActivity = (rEntry && rEntry.activity) || (bEntry && bEntry.activity) || null;
    const storyTreasure = (rEntry && rEntry.treasure) || (bEntry && bEntry.treasure) || null;
    const dmPayload = { desc:f.desc||null, frame:f.statId||null };
    if(flavor && flavor.length) dmPayload.flavor = flavor;
    if(flavorD8) dmPayload.flavorD8 = flavorD8;
    const mintFields = { realm:f.realm||null, cr:(f.cr!=null?f.cr:null), size:f.size||null,
      type:f.creatureType||null, summary:f.summary||null,
      // MONSTER-STORY-WIRING §3 / MONSTER-FLAVOR-TABLES §2 — story data, realm row preferred.
      habitat:storyHabitat,
      activity:storyActivity,
      factionFit:(bEntry && bEntry.factionFit) || null,
      treasure:storyTreasure,
      displaced:f.displaced||undefined };
    // REVIEW-FIXES-0705 U1 — seed seenCount at mint: the first *sighting* IS the first encounter,
    // so combatDigest's seenCount===1 flavor gate (below, ~:243/:249) fires on the FIRST fight
    // instead of surfacing one encounter late. encounter_resolved's (rec.fields.seenCount||0)+1
    // bump (~:2391) is untouched — this only seeds the initial value. Guarded by !alreadyMinted
    // (same canon-lock pattern as flavor/flavorD8 above) and set via key OMISSION rather than
    // `undefined`: codexAdd's merge path does Object.assign(ex.fields, rec.fields), which copies
    // an explicit `undefined` value too — that would silently stomp the real bumped count back to
    // 1 on every re-mint/re-touch of a recurring foe. Omitting the key entirely leaves it alone.
    if(!alreadyMinted) mintFields.seenCount = 1;
    const rec=codexAdd(w,{
      id:existingId, kind:"creature", name:f.name, provenance:"rolled",
      fields: mintFields,
      // REALM-TRAITS-APPLY §3 (recovery-merge union) — the individual's own mechanical identity
      // (traits blob) rides the 2b dmPayload alongside desc/flavor/flavorD8, so a re-encountered
      // named foe's overrides are on record.
      dm: Object.assign(dmPayload, { traits: f.traits||null }),
      status:{ known:true, soft:false, at:w.currentNodeId||null, condition:"active" }
    });
    // stash the fid so encounter_resolved (still inside the SAME combat, before GS.combat=null)
    // can find this exact record back without re-deriving codexKeyId per foe again there.
    if(rec) f.codexId = rec.id;
    // MONSTER-PARLEY §1 — stamp the DEFAULT opening attitude from the record's OWN story data, once,
    // on first mint only (codexAttitudeOpen already refuses to re-set without force — a re-encountered
    // creature keeps whatever the world did to its standing since). Script sets the default; the DM
    // narrates within it (never invents a stance from scratch): displaced OR a hunting/raiding activity
    // reads as guarded -> Wary(-1); everything else (ambient/neutral/no signal) opens Indifferent(0).
    if(rec && !alreadyMinted && typeof codexAttitudeOpen==="function"){
      // ANOMALY LAW §2b — the friendly-spawn channel: a script-rolled `spawnDisposition` ("neutral"
      // or "friendly") opens the creature NOT hostile (0 for neutral, +1 for friendly) and stamps
      // bondEligible — born eligible, the intended recruitment path (the bullywug crocodile hunter).
      // Checked BEFORE the ordinary displaced/hunting-activity guarded-opening default below, since a
      // friendly spawn's disposition overrides the normal activity-derived read entirely.
      if(f.spawnDisposition==="friendly" || f.spawnDisposition==="neutral"){
        const opening=(f.spawnDisposition==="friendly") ? 1 : 0;
        codexAttitudeOpen(w, rec.id, opening, { cause:"friendly-spawn", clock:(typeof clockOf==="function")?clockOf(w).day:null });
        rec.fields = rec.fields || {};
        rec.fields.bondEligible = true;
      } else {
        const acts=(rec.fields && rec.fields.activity) || [];
        const guardedActivity=Array.isArray(acts) && acts.some(a=>/hunt|raid/i.test(String(a)));
        const opening=(rec.fields && rec.fields.displaced) || guardedActivity ? -1 : 0;
        codexAttitudeOpen(w, rec.id, opening, { cause:"creature-mint", clock:(typeof clockOf==="function")?clockOf(w).day:null });
      }
    }
    // §3 faction tie (cheap, additive, data-only — the DM decides meaning, not this code): if any
    // faction's own tags[] name-match this foe's realm, link the record to that faction. No faction
    // in this codebase is tagged by realm today (world-gen.js's fTag rows are archetype descriptors —
    // "well-armed"/"ancient"/etc, never a realm name) — this stays a graceful no-op until a future
    // faction IS tagged that way; it costs nothing to check and nothing invents a new tagging scheme.
    if(rec && f.realm && Array.isArray(w.factions) && typeof codexLink==="function"){
      const hit=w.factions.find(fac=>Array.isArray(fac.tags) &&
        fac.tags.some(t=>String(t).toLowerCase()===String(f.realm).toLowerCase()));
      if(hit){
        const facRecId="faction:"+(typeof slug==="function"?slug(hit.name):hit.name);
        if(typeof codexGet==="function" && codexGet(w,facRecId)) codexLink(w,rec.id,"near",facRecId);
      }
    }
  });
}

/* ============================================================
   DM SEAM — TYPED CONTRACTS + STRUCTURED TELEMETRY
   (docs/EVENT-CONTRACT.md · docs/POSITIONING.md: "typed contracts at the seams" +
    "structured logging on the DM seat")

   The two guards on the ONE interface where the AI DM meets the deterministic engine:

   1. TYPED CONTRACTS — validateEvent / validateTurnResponse machine-check the two INBOUND
      shapes (the DM's typed events; the DM's whole turn response) against the contract before
      the engine trusts them. Forward-compatible by design: a structurally-sound event with an
      unknown `type` still PASSES (applyEvent's switch no-ops it) — we reject only malformed
      ENVELOPES, never unknown vocabulary, so the taxonomy can grow without a lockstep change.

   2. STRUCTURED TELEMETRY — logDmTurn records ONE structured row per completed turn (latency,
      lane+model, payload bytes in/out, events applied, mints, an ESTIMATED token/$ cost off
      measured bytes). Turns the SPEED-DOCTRINE cost/latency DISCIPLINE into cost/latency
      EVIDENCE — a bad turn becomes a replayable row, not an anecdote. Held in a per-session
      ring buffer (GS.dm.telemetry) AND shipped to the bridge (.dm/telemetry.jsonl) when it's
      up. This is the MAILBOX-path twin of the /seat proxy's seat-costs.jsonl (dm-bridge.py):
      the loop-era DM never touches /seat, so without this its turns carried no consolidated
      cost/latency row at all.
   ============================================================ */

/**
 * @typedef {Object} DMEvent  One typed event the DM reports (docs/EVENT-CONTRACT.md §"envelope").
 * @property {string} type                        one of DM_EVENT_TYPES (unknown ⇒ forward-compatible no-op)
 * @property {Object} [payload]                   type-specific fields
 * @property {"detected"|"declared"|"player"|"branch"} [source]  provenance; defaults "declared" (one of DM_EVENT_SOURCES)
 * @property {string[]} [ledgerRefs]              affected ledger ids
 */
/**
 * @typedef {Object} TurnResponse  The DM's reply to one turn (consumed by applyResponse).
 * @property {string}   [narration]               player-facing prose
 * @property {DMEvent[]} [events]                 typed events to apply (the anti-drift spine)
 * @property {Object}   [rollRequest]             a dice/branch ask back to the player
 * @property {Object}   [ask]                     a free-text ask back to the player
 * @property {Object[]} [gen]                     on-demand noun requests (ON-DEMAND-GEN)
 * @property {string}   [dmNotes]                 DM-only scratch (never rendered)
 * @property {string}   [turnId]                  echoes the turn it answers
 */
/**
 * @typedef {Object} DMTurnTelemetry  One structured row per completed turn (the logDmTurn record).
 * @property {string}        turnId
 * @property {string}        worldId
 * @property {number}        t                    client wall-clock ms (Date.now)
 * @property {number}        session
 * @property {string|null}   lane                 triage lane that routed this turn
 * @property {string|null}   laneModel            model the lane selected
 * @property {number|null}   latencyMs            player-send → DM-answer round-trip
 * @property {number}        digestBytes          compact digest shipped
 * @property {number}        turnBytes            whole turn envelope in
 * @property {number}        responseBytes        narration+events out
 * @property {number}        narrationChars
 * @property {number}        eventCount
 * @property {string[]}      eventTypes
 * @property {number}        mintCount            on-demand gen requests this turn
 * @property {Object}        cost                 ESTIMATED {model,inTok,outTok,usd,estimated:true}
 * @property {boolean}       ok                   turn-response contract passed
 */

// The known event vocabulary — the full typed-contract surface, kept in lockstep with applyEvent's
// switch below (dev/verify-dm-seam.mjs asserts parity against the switch's top-level cases, so this
// list can't silently drift from the code that consumes it). An event whose type is NOT here still
// applies if well-formed (validateEvent flags unknownType but passes it; the switch no-ops it) —
// forward-compatible by design. Add a new case to the switch AND a line here (the test enforces both).
const DM_EVENT_TYPES = ["hp_changed","death_save","temp_hp","combat_start","combat_end","attack","action","opportunity_attack","move_zone","grapple","shove","hazard_tick","slot_spent","cast","concentration_start","concentration_broken","resource_spent","rest","item_changed","item_split","item_use","charge_spend","charge_restore","condition_add","condition_remove","item_rust_exposure","item_claimed","condition_expired","round_tick","foe_morale","foe_action","equip","unequip","set_grip","attune","unattune","fact_canonized","codex_add","codex_link","codex_update","codex_reveal","codex_contact","social_check","attitude_shift","animal_interview","animal_care","morale_check","parley_open","insight_read","discovery","clock_advanced","clock_fired","front_closed","encounter_resolved","kill","claim_deed","gift","epithet_grant","hire","dismiss","tend_pet","companion_update","recruit_creature","choice_logged","inspiration_granted","inspiration_spend","check","crit_outcome","stage_fx","terrain_change","adjudication","level_applied","prep_applied","prep_contact","walk_advance","walk_update","walk_complete","capture","chase_start","chase_round","chase_yield","downtime","distant_word","shrine_omen","xp_granted","open_shop","district_mint","building_approach","building_contact","job_board_read","job_accept","tarot_landed","advance_clock","move_node","start_walk","travel_start","knockout","bastion_claim","mark_added","mark_removed"];

// The known provenance vocabulary — who asserted this event. "detected" = the engine derived it
// from observed state (prefer); "declared" = the DM reported it (the default when omitted);
// "player" = a direct player UI action on their own sheet (inventory panel, level-up claim —
// world/inventory.js, creator/levelup.js); "branch" = a pre-declared roll-branch resolved
// app-side (resolveBranch, ROLL-BRANCHES §2). Kept a HARD allow-list (not coerce-and-warn) so a
// typo'd source still fails loud — dev/verify-dm-seam.mjs "bad source" depends on that.
const DM_EVENT_SOURCES = ["detected","declared","player","branch"];

/* ROOT-B (payload vocabulary drift): the per-event ACCEPTED-FIELDS + ALIAS map. Folded ONCE in
   applyEvent (dmFoldPayload below) — never per-case. Aliases rewrite the DM's natural field name
   into the canonical one the handler reads (canonical wins when both are present). Keys that are
   neither accepted nor aliased are KEPT (warn-only — never dropped; an under-censused row must
   degrade to a spurious warning, not a broken handler) but console.warn + ONE `drift` ledger line
   per event so a silent no-op is impossible to miss. Events NOT listed here (and unknown types)
   pass through untouched — the whole-payload-pass handlers (hire/capture/downtime/…) and
   forward-compatible types stay unjudged. Every key here MUST be a member of DM_EVENT_TYPES
   (the ROOT-B probe enforces it). Doc twin: docs/EVENT-CONTRACT.md §"Payload aliases".

   `num:[…]` (HQ2-1, HOTFIX-QUEUE 07-07 keystone) — the per-field NUMERIC-COERCION tag: the payload
   fields the handler does MATH on. dmFoldPayload runs each PRESENT tagged field through dmNum ONCE
   (repairs a string "-1"/"2" to a number AND emits the loud payload-coercion drift line), so a
   handler never string-concats a d20/bonus/delta again — retiring the hand-called dmNum sites. Only
   accept fields are tagged (the fold has already dropped anything else); an absent field stays absent
   (never injected as null). Metadata only — the DM contract generator reads accept/alias, ignores num. */
const DM_EVENT_FIELDS = {
  hp_changed:        { accept:["delta","crit","meleeAdjacent","nonlethal"], num:["delta"] },
  death_save:        { accept:["d20"], num:["d20"] },
  temp_hp:           { accept:["n"], num:["n"] },
  combat_start:      { accept:["foes","objectiveRef","scene","segment","segmentId"] },
  combat_end:        { accept:["method","outcome","reason"], alias:{ note:"reason" } },
  attack:            { accept:["advantage","attackIndex","cover","crit","d20","magnitude","slot","target","targetAC"], num:["d20","targetAC","magnitude","attackIndex"] },
  action:            { accept:["ally","dir","kind","target","trigger"] },
  opportunity_attack:{ accept:["d20","foe"], num:["d20"] },
  move_zone:         { accept:["band","dash","lane","who"] },
  grapple:           { accept:["bonus","d20","defenderD20","target"], num:["bonus","d20","defenderD20"] },
  shove:             { accept:["bonus","d20","defenderD20","intent","target"], num:["bonus","d20","defenderD20"] },
  hazard_tick:       { accept:["feet","holdRounds","kind","roundsHeld"] },
  slot_spent:        { accept:["level"] },
  cast:              { accept:["concentration","level","name","ritual","spell"] },
  concentration_start:{ accept:["spell"] },
  concentration_broken:{ accept:["cause","spell"] },
  resource_spent:    { accept:["key","n"], num:["n"] },
  // HQ3-C1: hdRolls is an array — NOT num-coerced (dmNum would NaN it, same trap as
  // condition_add.ttl); only spendHitDice (a plain count) is numeric.
  rest:              { accept:["kind","spendHitDice","hdRolls"], num:["spendHitDice"] },
  item_changed:      { accept:["add","force","gold","note","remove","removeAll","removeIds","takenBy"], num:["gold"] },
  item_split:        { accept:["itemId","qty"], num:["qty"] },
  item_use:          { accept:["itemId","roll"] },
  charge_spend:      { accept:["itemId","n"], num:["n"] },
  charge_restore:    { accept:["itemId","n","target"], num:["n"] },
  // condition_add.ttl is DELIBERATELY UNTAGGED (HQ2-1-TOPUP deviation from the HOTFIX-QUEUE spec,
  // which lists num:["n","ttl"]): addCondition (src/engine/conditions.js:126-134) stores ttl as an
  // OBJECT shape — {rounds:n} | {untilSave:{...}} | {endOfNextTurn:true} | {concentration:true} |
  // {indefinite:true} — never a bare number (conditionTtlLabel, dm.js, reads ttl.rounds/.untilSave/
  // etc). Running dmNum(ttl) would Number()-coerce that object to NaN and silently null it out,
  // destroying a legitimate {rounds:3} payload. Only `n` (the exhaustion-level int) is purely numeric.
  condition_add:     { accept:["condition","itemId","n","target","ttl"], num:["n"] },
  condition_remove:  { accept:["condition","itemId","target"] },
  // HQ3-D1: no num/alias — id/sinceDay are engine-stamped (never DM-supplied), kind is a domain
  // enum-clamp inside the handler (like condition_add lowercasing cond), not payload normalization.
  mark_added:        { accept:["text","kind","mechanical"] },
  mark_removed:      { accept:["id","text"] },
  item_rust_exposure:{ accept:["itemId","kind"] },
  item_claimed:      { accept:["codexId","by","lossState","at","note","factionInterest"], alias:{ id:"codexId", item:"codexId" } },
  condition_expired: { accept:["condition","target"] },
  round_tick:        { accept:["phase","round"] },
  foe_morale:        { accept:["d20","dispositionRoll","foe","trigger","want"], num:["d20","dispositionRoll"] },
  foe_action:        { accept:["action","foe"] },
  equip:             { accept:["itemId","slot"] },
  unequip:           { accept:["slot"] },
  set_grip:          { accept:["grip"] },
  attune:            { accept:["itemId"] },
  unattune:          { accept:["itemId"] },
  fact_canonized:    { accept:["factId","what"], alias:{ text:"what" } },
  codex_add:         { accept:["id","kind","name","rolled","fields","dm","links","status","provenance","source","shape","origin","ledgerRefs"] },
  codex_link:        { accept:["from","rel","to"] },
  codex_update:      { accept:["id","name","shape","fields","dm","status","note","supersedes"] },   // HQ3-D2: supersedes flags the pushed note as a correction (codexUpdate)
  codex_reveal:      { accept:["id"] },
  // NPC-PRESENCE-AND-HOOKS.md Component 4's "engage threshold": `engaged` (bool) is the DM's declared
  // signal that the player accepted/acted on/meaningfully pursued this NPC's hook (a second
  // in-character question counts; a passing glance does not) — registered at the contract boundary
  // (CLAUDE.md "normalization lives at the contract boundary, not in handlers"), never a per-handler guess.
  codex_contact:     { accept:["id","engaged"] },
  // ANIMAL-SOCIAL.md §2/§6 U4 — opens/closes the witness-packet channel on an animal partial record
  // (Speak with Animals active, or the DM declaring the channel open some other way). `open` (bool)
  // is a flag, never arithmetic — same "flag, not a number" posture as social_check's overshoot.
  animal_interview:  { accept:["id","open"] },
  // social_check.overshoot is DELIBERATELY UNTAGGED (HQ2-1-TOPUP deviation from the HOTFIX-QUEUE
  // spec, which lists num:["dc","total","natural","overshoot"]): resolveSocialCheck (src/engine/
  // social.js:64) reads it as a plain boolean truthiness gate (`if(skill==="intimidation" &&
  // input.overshoot)`), never in arithmetic — it is a flag, not a number. dc/total/natural ARE
  // genuinely numeric (dc: Math.round(Number(...)) + `>=` compare; total: `>=` compare, was the
  // ad-hoc Number()||0 site; natural: strict `===20` compare) — tagged.
  // ANIMAL-SOCIAL.md §3/§6 U3 RESOLVED ruling-2 bypass fields: animalFriendshipSpell/strongCha are
  // plain booleans (flag gates in animalHelpfulAllowed, never arithmetic) — same "flag, not a number"
  // posture as overshoot above, so deliberately left OUT of `num`.
  social_check:      { accept:["animalFriendshipSpell","caughtLie","cause","dc","lever","levers","natural","overshoot","skill","strongCha","target","total"], num:["dc","total","natural"] },
  attitude_shift:    { accept:["cause","target","to"], alias:{ id:"target", npc:"target" } },
  // ANIMAL-SOCIAL.md §3/§6 U3 — the sustained-care event (feeding/tending/defending an animal partial).
  // `event` is free text (informational — the handler doesn't branch on it, §3's flat feed/tend/defend
  // list); `target` is the codex id.
  animal_care:       { accept:["event","target"] },
  morale_check:      { accept:["creature","dc","mods","outcome","save","trigger"], num:["dc"] },
  parley_open:       { accept:["ceiling","creature","floor","npc","openingAttitude","target","want"] },
  insight_read:      { accept:["bestMentalMod","dc","guarded","masking","mentalMods","target","total"], num:["bestMentalMod","dc","total"] },
  discovery:         { accept:["makeNode","nodeId","reveal","what","enter","travelMin"], alias:{ name:"what" } },
  clock_advanced:    { accept:["clockId","delta"], num:["delta"], alias:{ id:"clockId", faction:"clockId", by:"delta" } },
  clock_fired:       { accept:["clockId","factionId","forPlayer"], alias:{ id:"clockId", faction:"clockId", by:"delta" } },
  front_closed:      { accept:["factionId","frontId","how","ledgerId"], alias:{ clockId:"ledgerId", id:"ledgerId" } },
  encounter_resolved:{ accept:["foes","method","nodeId","objectiveRef","outcome"] },
  kill:              { accept:["at","cr","factionId","victimClass","victimId"] },
  claim_deed:        { accept:["deedRef","factionKey","ledgerRef","regionId","weight"], num:["weight"] },
  gift:              { accept:["at","day","deedRef","factionKey","from","given","regionId","target","weight","what","witnessed"], alias:{ to:"target", item:"what" }, num:["weight"] },
  epithet_grant:     { accept:["text"], alias:{ epithet:"text" } },
  dismiss:           { accept:["hirelingId"] },
  tend_pet:          { accept:["target"] },
  companion_update:  { accept:["action","cause","delta","hirelingId","pcLevel"], num:["delta"] },
  recruit_creature:  { accept:["className","codexId","cr","role","shares","statBase","tier","wage","wageNote"] },
  // choice_logged.weight is DELIBERATELY UNTAGGED (HQ2-1-TOPUP deviation from the HOTFIX-QUEUE spec,
  // which lists num:["weight"] with the note "weight sum" — that note describes claim_deed/gift's
  // numeric weight, mis-applied to this row). choice_logged.weight is a CATEGORICAL STRING enum
  // ("minor"|"major") — xpForEvent (src/engine/advancement.js:136) grades it via strict string
  // equality `p.weight==="major"`, and DM-CHARTER §"the firing ladder" + EVENT-CONTRACT.md +
  // SEAT-PROMPT.md all document the payload as `{weight:"major"}`. Running dmNum on it would
  // Number("major")→NaN→null, destroying the string and silently zeroing every major-choice XP award.
  choice_logged:     { accept:["forecloses","weight"] },
  inspiration_granted:{ accept:["pc","reason"] },
  // d20b is currently unread by the handler (only d20 rides the reroll through); tagged anyway per
  // spec — it is evidently the sibling advantage/disadvantage die (paired naming with d20), purely
  // numeric in intent, and tagging an absent/unused field is a no-op (dmFoldPayload only touches
  // PRESENT keys) so there is no downside to keeping it future-proofed.
  inspiration_spend: { accept:["d20","d20b","o","on"], num:["d20","d20b"] },
  check:             { accept:["advantage","bonus","d20","dc","key","kind","reroll"], num:["d20","bonus","reroll","dc"] },
  crit_outcome:      { accept:["cascade","lenses","magnitude","mythSeed","natural","placeHandoff","scope","target","tier"], num:["magnitude","natural"] },
  stage_fx:          { accept:["from","note","to","verb","who"] },
  terrain_change:    { accept:["note","op","zone"], alias:{ at:"zone", kind:"op" } },
  adjudication:      { accept:["precedentId","ruling","situation"] },
  level_applied:     { accept:["from","pc","to"] },
  prep_contact:      { accept:["enter","nodeId"] },
  tarot_landed:      { accept:["via","ref"] },     // TAROT-2 §3.3 — DM-declared interpretive landing (telemetry; quiet)
  walk_advance:      { accept:["nodeId","toSeg"] },
  walk_update:       { accept:["nodeId","overlay","seg"] },
  walk_complete:     { accept:["abandoned","nodeId"] },
  open_shop:         { accept:["archetype","codexId","name","nodeId","shopId","tier"] },
  // CROWNING-BASTION.md §7.B1.1 — the bastion claim. EITHER-gated (Q5: a closed front OR a
  // tier-scaled gold price); one per world (Q6). `payGold` is the player's ACK that gold will be
  // spent when no deed is on the books — the handler spends the actual `bastionPrice(w)`, never
  // haggles on this value.
  bastion_claim:     { accept:["nodeId","name","note","payGold"], alias:{ id:"nodeId" } },
  district_mint:     { accept:["nodeId","tier"] },
  building_approach: { accept:["buildingType","name","nodeId","tier"] },
  building_contact:  { accept:["id"] },
  job_board_read:    { accept:["nodeId","tier"] },
  job_accept:        { accept:["postingId"] },
  chase_start:       { accept:["npcId","targetFid","terrain"] },
  chase_round:       { accept:["pursuerWon"] },
  chase_yield:       { accept:["side"] },
  distant_word:      { accept:[] },   // WAI — payload is {} by design (anti-invention); a supplied `text` now warns loud instead of vanishing (BUG-07 ruling)
  // TRANSITION-CONTRACT.md §3 — first-class time/location/state transitions.
  advance_clock:     { accept:["minutes","hours","days","cause"], alias:{ mins:"minutes", min:"minutes" } },
  move_node:         { accept:["nodeId","travelMin","cause"], alias:{ to:"nodeId", node:"nodeId", id:"nodeId" } },
  start_walk:        { accept:["nodeId","enter"], alias:{ id:"nodeId", node:"nodeId" } },
  travel_start:      { accept:["toNodeId","travelMin","cause"], alias:{ nodeId:"toNodeId", to:"toNodeId", dest:"toNodeId" } },
  knockout:          { accept:["cause"] }
};

/* Fold ONE event's payload through DM_EVENT_FIELDS: rewrite aliases to canonical (canonical wins
   when both present; the alias key is consumed either way), keep everything else, and make any
   unrecognized key LOUD (console.warn + one `drift` ledger line per event). Unmapped/unknown types
   pass through untouched. Returns the folded payload object (a copy — never mutates e.payload). */
function dmFoldPayload(w,e){
  const spec=DM_EVENT_FIELDS[e.type], raw=e.payload||{};
  if(!spec) return raw;
  const alias=spec.alias||{}, accept=spec.accept||[];
  const p={}, drifted=[];
  Object.keys(raw).forEach(k=>{
    const to=alias[k];
    if(to){ if(p[to]==null && raw[to]==null) p[to]=raw[k]; return; }
    p[k]=raw[k];
    if(accept.indexOf(k)<0) drifted.push(k);
  });
  if(drifted.length){
    console.warn("[dm-seam] payload drift — unrecognized key(s) on "+e.type+":",drifted.join(","),e);
    if(typeof addLedger==="function")
      addLedger(w,"drift",{kind:"payload-drift",type:e.type,keys:drifted,source:e.source||"declared"},
        "◇ payload drift — "+e.type+" carried unrecognized field"+(drifted.length===1?"":"s")+" ("+drifted.join(", ")+") the engine does not read.");
  }
  // HQ2-1 (07-07 keystone): coerce the MATH fields ONCE, here — dmNum repairs a stringly-typed
  // number ("-1"/"2") and emits the loud payload-coercion drift line. Present fields only (an absent
  // field stays absent — dmNum(null) is a no-op and injecting null would change key presence). This
  // is the single seam that used to be N hand-called dmNum sites inside the switch.
  if(spec.num) spec.num.forEach(k=>{ if(p[k]!=null) p[k]=dmNum(w,e.type,k,p[k]); });
  return p;
}

/* DETECTED-EVENTS.md DE-3 — `cast {spell,level}` ALREADY spends the slot (the `cast` case below);
   a DM that also fires a matching `slot_spent` for the same level would double-spend. Scan one
   TurnResponse's events[] and pair each `cast` carrying a numeric payload.level with the first
   UNPAIRED `slot_spent` of the SAME level anywhere in the array (either order). A paired
   slot_spent is skipped by the caller (recorded as a folded no-op + one ledger line) instead of
   applied. Pairing is 1:1 — two casts + two slot_spents at the same level = two pairs. Mismatched
   levels, or a slot_spent with no same-level cast, are NOT paired (E9/E10 — apply as declared,
   the engine can't prove it's spurious). Pure function — never mutates `events`; returns a Set of
   the (0-based) indices into `events` that are folded. */
function dmFoldSlotSpends(events){
  const arr=events||[];
  const foldedIdx=new Set();
  const usedCast=new Set();
  arr.forEach((e,si)=>{
    if(!e || e.type!=="slot_spent") return;
    const lvl=e.payload && e.payload.level;
    if(typeof lvl!=="number") return;
    const ci=arr.findIndex((c,i)=>c && c.type==="cast" && typeof c.payload==="object" && c.payload
      && typeof c.payload.level==="number" && c.payload.level===lvl && !usedCast.has(i));
    if(ci<0) return;
    usedCast.add(ci); foldedIdx.add(si);
  });
  return foldedIdx;
}

/* dmNum — coerce a payload field the handlers do MATH on (HOTFIX-QUEUE-2026-07-06 H3; folded to a
   single call site by HQ2-1 07-07 — dmFoldPayload drives it off each event's `num:[…]` tag).
   null/undefined pass through as null (callers keep their own "absent" semantics — e.g. an
   absent d20 means "engine rolls"). A clean number passes silently. A coercible string
   ("-4", "18") is repaired to a number AND flagged: console.warn + ONE drift ledger line
   (kind:"payload-coercion") so vocabulary drift is loud, mirroring dmFoldPayload's
   payload-drift discipline. A non-coercible value returns null (caller's absent-path). */
function dmNum(w, type, key, v){
  if(v == null) return null;
  if(typeof v === "number") return (Number.isFinite(v) ? v : null);
  const n = Number(v);
  const ok = Number.isFinite(n);
  console.warn("[dm-seam] payload coercion — "+type+"."+key+" was "+(typeof v)+":", v);
  addLedger(w,"drift",{kind:"payload-coercion",type:type,key:key,raw:String(v),repaired:ok,source:"declared"},
    "⚠ payload drift — "+type+"."+key+" arrived as a "+(typeof v)+(ok?" (repaired)":" (dropped)")+".");
  return ok ? n : null;
}

/* Validate ONE event's envelope against the contract. Returns {ok, errors[], unknownType}.
   Structural failure (not an object / no type / bad payload / bad source / bad ledgerRefs) ⇒
   ok:false (the engine skips it). An unknown-but-well-formed type ⇒ ok:true, unknownType:true. */
function validateEvent(e){
  const errors=[];
  if(!e || typeof e!=="object") return {ok:false, errors:["event is not an object"], unknownType:false};
  if(typeof e.type!=="string" || !e.type) errors.push("missing/invalid type");
  if(e.payload!=null && (typeof e.payload!=="object" || Array.isArray(e.payload))) errors.push("payload must be an object");
  if(e.source!=null && DM_EVENT_SOURCES.indexOf(e.source)<0) errors.push('source must be one of: '+DM_EVENT_SOURCES.join(" | "));
  if(e.ledgerRefs!=null && !Array.isArray(e.ledgerRefs)) errors.push("ledgerRefs must be an array");
  const unknownType = typeof e.type==="string" && !!e.type && DM_EVENT_TYPES.indexOf(e.type)<0;
  return { ok:errors.length===0, errors, unknownType };
}

/* Validate a whole TurnResponse. NON-BLOCKING by design — applyResponse applies what's valid and
   logs the rest (resilience > rejection at the narration seam). Returns {ok, errors[]}. */
function validateTurnResponse(r){
  const errors=[];
  if(!r || typeof r!=="object") return {ok:false, errors:["response is not an object"]};
  if(r.narration!=null && typeof r.narration!=="string") errors.push("narration must be a string");
  if(r.events!=null && !Array.isArray(r.events)) errors.push("events must be an array");
  if(Array.isArray(r.events)) r.events.forEach((e,i)=>{ const v=validateEvent(e); if(!v.ok) errors.push("events["+i+"]: "+v.errors.join("; ")); });
  if(r.gen!=null && !Array.isArray(r.gen)) errors.push("gen must be an array");
  if(r.dmNotes!=null && typeof r.dmNotes!=="string") errors.push("dmNotes must be a string");
  return { ok:errors.length===0, errors };
}

/* Per-model $/token rates (USD per single token) for the ESTIMATED turn cost — order-of-magnitude
   only (SPEED-DOCTRINE tracks the SHAPE of the cost curve, not the invoice; the exact bill for the
   /seat path is metered from real `usage` in dm-bridge.py). Keyed by the lane model string;
   DM_RATE_DEFAULT covers anything unmapped. Rates as of 2026-07; edit here when pricing moves. */
const DM_MODEL_RATES = {
  //  model:             [ inPerTok,   outPerTok ]
  "claude-opus-4-8":     [ 15/1e6,     75/1e6 ],
  "claude-sonnet-5":     [ 3/1e6,      15/1e6 ],
  "claude-haiku-4-5":    [ 1/1e6,       5/1e6 ],
  "glm-5.2":             [ 1.4/1e6,    4.4/1e6 ],
  "glm-4.7":             [ 1.4/1e6,    4.4/1e6 ]
};
const DM_RATE_DEFAULT = [ 3/1e6, 15/1e6 ];
const DM_TELEMETRY_CAP = 200;   // per-session ring-buffer size (older rows drop off the front)

/* Compact JSON byte length, crash-proof (a cyclic/oversized value yields 0 rather than throwing a
   turn). The telemetry byte counts are all measured through this. */
function jsonBytes(v){ try{ return JSON.stringify(v).length; }catch(_){ return 0; } }

/* Estimate one turn's token/$ cost from measured payload bytes (≈ bytes/4, the standard rough
   char→token ratio). Always flagged estimated:true — never confuse this with a metered figure. */
function dmEstimateCost(model, inBytes, outBytes){
  const rate=DM_MODEL_RATES[model]||DM_RATE_DEFAULT;
  const inTok=Math.round((inBytes||0)/4), outTok=Math.round((outBytes||0)/4);
  return { estimated:true, model:model||null, inTok, outTok, usd:+(inTok*rate[0]+outTok*rate[1]).toFixed(5) };
}

/* Record ONE telemetry row for a completed turn: push to the per-session ring buffer and fire it at
   the bridge (.dm/telemetry.jsonl) — fire-and-forget, silent when the bridge is down (the plain
   http.server has no /telemetry route; that's fine — the ring buffer still holds the session's rows
   for in-app inspection + the one-turn-walkthrough artifact). Must NEVER throw a turn. */
function logDmTurn(w, rec){
  try{
    GS.dm=GS.dm||{}; const buf=GS.dm.telemetry=GS.dm.telemetry||[];
    buf.push(rec); if(buf.length>DM_TELEMETRY_CAP) buf.splice(0, buf.length-DM_TELEMETRY_CAP);
    if(typeof DM_BASE==="string") fetch(DM_BASE+"/telemetry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(rec)}).catch(()=>{});
  }catch(_){/* telemetry is never load-bearing on a turn */}
  return rec;
}

/* CROWNING-BASTION.md §7.B1.3 — the tier-scaled gold sink for a bastion claimed by coin rather than
   deed (Q5's either-gate). PROVISIONAL — the three integers are Adam's taste dial; the shape (scales
   with tier, no shop-item flatness) is locked. L1-2 -> 250, L3-4 -> 500, ... L9-10 -> 1250. */
function bastionPrice(w){
  const t=(typeof livingSheet==="function")?livingSheet(w):null;
  const lvl=(t&&t.sh&&t.sh.level)||1;
  return 250*Math.max(1, Math.ceil(lvl/2));
}

function applyEvent(w,e){
  if(!w) return {ok:false, reason:"no-world"};
  // TYPED CONTRACT (docs/EVENT-CONTRACT.md): machine-check the envelope before the engine trusts it.
  // A structural failure no-ops with a structured reason; an unknown-but-well-formed type falls through
  // to the switch's forward-compatible default (never blocked here — the taxonomy can grow).
  const _v=validateEvent(e);
  if(!_v.ok){ console.warn("[dm-seam] invalid event envelope — no-op:",_v.errors,e); return {ok:false, reason:"invalid-envelope", errors:_v.errors}; }
  const p=dmFoldPayload(w,e), src=e.source||"declared";   // ROOT-B: aliases folded, drift keys warned — ONCE, before the switch
  // TAROT-2 §3.2 — detected-first landing capture (quiet; reads only, plus tarotMarkLanded). One
  // guarded line, never per-case: an id-match against a script-picked target IS the evidence the card
  // entered play, so it runs before the handler (a failing handler with a matching id is rare/tolerable).
  try{ if(typeof tarotDetectFromEvent==="function") tarotDetectFromEvent(w, e.type, p); }catch(err){ console.warn("[tarot] detect failed", err); }
  const wkStamp=(typeof walkStamp==="function")?walkStamp(w):null;   // WALK-CONSUMPTION (Step C): which walk/segment this beat came from
  switch(e.type){

    case "hp_changed":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const delta=(p.delta==null)?0:p.delta;   // HQ2-1: coerced in dmFoldPayload (num:["delta"])
      const wasDown=(t.sh.hpCur!=null && t.sh.hpCur<=0);
      let r, absorbed=0, overkill=0;
      if(delta<0 && typeof applyDamageWithTemp==="function"){
        // TEMP HP (§4): damage spends sh.tempHp FIRST, then hpCur (applyDamageWithTemp routes through
        // applyHpDelta internally — do NOT double-apply here). It also reports the overkill (how far a
        // single hit carried the PC below 0) for the massive-damage instant-death check.
        const a=applyDamageWithTemp(t.sh,-delta); r=a.hpResult||applyHpDelta(t.sh,0); absorbed=a.tempSpent||0; overkill=a.overkill||0;
      } else {
        r=applyHpDelta(t.sh,delta);
      }
      const dmgToHp=(delta<0)?Math.max(0,(-delta)-absorbed):0;   // damage that actually reached HP (post-temp)
      const sign=r.delta>0?"healed "+r.delta:(delta<0?"took "+(-delta)+" damage"+(absorbed?(" ("+absorbed+" soaked by temp HP)"):""):"unchanged");
      addLedger(w,"outcome",{kind:"hp",pc:t.c.name,delta:r.delta,tempAbsorbed:absorbed,from:r.from,to:r.to,max:r.max,dropped:r.dropped,source:src},
        "✦ "+t.c.name+" "+sign+" — HP "+r.from+"→"+r.to+"/"+r.max+(r.dropped?" (down)":"")+".");
      const out={ok:true,hp:r.to+"/"+r.max,dropped:r.dropped,tempAbsorbed:absorbed};

      // A HEAL above 0 clears any death-save tracker (SRD: healing wakes/stabilizes the PC — §4).
      // TRANSITION-CONTRACT.md §3.7 E18: healing also wakes a KO'd PC (clears sh.ko + "unconscious").
      if(delta>0 && r.to>0){
        if(typeof clearDeathSaves==="function") clearDeathSaves(t.sh);
        if(t.sh.ko){ t.sh.ko=null; const kIdx=(t.c.conditions||[]).indexOf("unconscious"); if(kIdx>=0) t.c.conditions.splice(kIdx,1); }
      }

      // CONCENTRATION (§2): damage that reached HP threatens a concentrating PC's spell. 0 HP → auto-break;
      // else surface the REQUIRED CON save (the player rolls it openly — dice transparency; the DM emits
      // concentration_broken on a failed save).
      if(dmgToHp>0 && typeof isConcentrating==="function" && isConcentrating(t.sh)){
        if(r.to<=0 && typeof breakConcentration==="function"){
          const b=breakConcentration(t.sh,"0-hp");
          if(b.broken){ addLedger(w,"outcome",{kind:"concentration",pc:t.c.name,spell:b.spell,cause:"0-hp",broken:true,source:"detected"},
            "✦ "+t.c.name+"'s concentration on "+b.spell+" breaks — dropped to 0 HP."); out.concentrationBroken={spell:b.spell,cause:"0-hp"}; }
        } else if(typeof concentrationSaveDC==="function"){
          const dc=concentrationSaveDC(dmgToHp);
          out.concentrationSave={dc,spell:t.sh.concentration.spell,ability:"con"};
          addLedger(w,"outcome",{kind:"concentration",pc:t.c.name,spell:t.sh.concentration.spell,saveDC:dc,required:true,source:"detected"},
            "✦ "+t.c.name+" must make a DC "+dc+" Constitution save or lose concentration on "+t.sh.concentration.spell+".");
          // DETECTED-EVENTS.md DE-2: queue the pending save so the NEXT response-apply can script-author
          // a branched rollRequest for it (dmScriptRollReq) — the DM no longer has to remember to ask.
          // One entry per damage instance (SRD); persisted on the sheet (reload-safe); the whole queue
          // dies with sh.concentration=null on any break (free cleanup, E8).
          t.sh.concentration.pendingSaves=(t.sh.concentration.pendingSaves||[]).concat([{dc,spell:t.sh.concentration.spell}]);
        }
      }

      // DEATH (§4): a LIVING PC dropped to 0 → death-save tracker; MASSIVE damage (overkill ≥ max HP) →
      // instant death, skipping the saves entirely. Damage taken WHILE already at 0 → an auto-fail
      // (two on a crit / melee-in-5ft). All route into the existing Death & Rebirth flow at 3 fails / massive.
      // TRANSITION-CONTRACT.md §3.7 (BUG-04): non-lethal composes as hp_changed{nonlethal:true} — a drop
      // to 0 (or already at 0, overkill included, E15) KOs INSTEAD of entering the death-save ladder,
      // UNLESS the PC was already actively dying (wasDown && sh.deathSaves truthy) — E16, non-lethal
      // damage cannot convert dying→stable. Lethal damage on an already KO-stable PC (E17) clears the
      // KO and re-enters the auto-fail ladder — the mercy was the non-lethal choice; CAL-1 holds.
      const alreadyDying=wasDown && !!t.sh.deathSaves;
      if(delta<0 && r.to<=0 && p.nonlethal && !alreadyDying){
        const ko=applyKnockout(w,t,p.cause||null);
        out.ko=true; out.wakeInMin=ko.wakeInMin;
      } else if(delta<0 && r.to<=0){
        if(wasDown && t.sh.ko && !p.nonlethal){
          t.sh.ko=null; const kIdx=(t.c.conditions||[]).indexOf("unconscious"); if(kIdx>=0) t.c.conditions.splice(kIdx,1);
        }
        if(typeof isMassiveDamage==="function" && isMassiveDamage(overkill, t.sh.hp) && typeof killCharacter==="function"){
          out.instantDeath=true; addLedger(w,"outcome",{kind:"death",pc:t.c.name,cause:"massive-damage",overkill,source:"detected"},
            "☠ "+t.c.name+" is slain outright — massive damage ("+overkill+" past 0, ≥ max HP "+t.sh.hp+").");
          killCharacter(t.c.id);
        } else if(wasDown && typeof autoFailDeathSave==="function"){
          const df=autoFailDeathSave(t.sh,{crit:!!p.crit,meleeAdjacent:!!p.meleeAdjacent});
          out.deathSave=df;
          addLedger(w,"outcome",{kind:"death",pc:t.c.name,auto:true,succ:df.succ,fail:df.fail,outcome:df.outcome,source:"detected"},
            "☠ "+t.c.name+" — damage at 0 HP: "+df.fail+"/3 death-save failures"+(df.outcome==="dead"?" — DEAD":"")+".");
          if(df.outcome==="dead" && typeof killCharacter==="function") killCharacter(t.c.id);
        } else if(!wasDown && typeof startDeathSaves==="function"){
          startDeathSaves(t.sh); out.deathSavesStarted=true;
          addLedger(w,"outcome",{kind:"death",pc:t.c.name,dying:true,source:"detected"},
            "☠ "+t.c.name+" falls to 0 HP — dying. Roll death saves.");
        }
      }
      return out;
    }

    /* DEATH SAVE (§4) — the player's OPEN d20 (dice transparency), declared each round they're dying.
       resolveDeathSave grades it: 10+ success, <10 fail, nat20 revive+1hp+clear, nat1=2 fails; 3
       succ→stable, 3 fail→dead (routes into the existing Death & Rebirth flow via killCharacter). */
    case "death_save":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      if(typeof resolveDeathSave!=="function")return {ok:false,reason:"death-unavailable"};
      const r=resolveDeathSave(t.sh,(p.d20==null?null:p.d20));   // HQ2-1: coerced in dmFoldPayload (num:["d20"])
      if(!r.ok)return r;
      const line=r.outcome==="revived"?(t.c.name+" rolls a natural 20 — surges back to "+r.hpCur+" HP, conscious!")
        :r.outcome==="stable"?(t.c.name+" stabilizes — 3 successes.")
        :r.outcome==="dead"?(t.c.name+" fails their third death save — dead."):
        (t.c.name+" rolls "+r.natural+" — "+(r.outcome==="success"?"a success":"a failure")+" ("+r.succ+" succ / "+r.fail+" fail).");
      addLedger(w,"outcome",{kind:"death-save",pc:t.c.name,natural:r.natural,succ:r.succ,fail:r.fail,outcome:r.outcome,source:src},
        "☠ "+line);
      if(r.outcome==="dead" && typeof killCharacter==="function") killCharacter(t.c.id);
      return Object.assign({ok:true},r);
    }

    /* TEMP HP (§4) — a separate pool that absorbs damage first, doesn't stack (takes the HIGHER), lost
       on a long rest. grantTempHp mirrors applyHpDelta's mutator convention. */
    case "temp_hp":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      if(typeof grantTempHp!=="function")return {ok:false,reason:"death-unavailable"};
      const r=grantTempHp(t.sh,p.n);
      addLedger(w,"outcome",{kind:"temp-hp",pc:t.c.name,from:r.from,to:r.to,source:src},
        "✦ "+t.c.name+" gains temporary HP — "+r.to+(r.to===r.from?" (unchanged, already higher)":"")+".");
      return {ok:true,tempHp:r.to};
    }

    /* COMBAT-LIFECYCLE.md §1 — transition IN. The DM emits this the moment violence opens; expands
       count:N foe specs BEFORE calling the engine (combatStart fids them f1..fn in order), builds the
       pc arg off the living sheet, stashes the result in GS.combat (the engine is PURE — it never
       writes app state; the caller/here does). ONE fight at a time, mirrors the GS.chase pattern. */
    case "combat_start":{
      if(typeof combatStart!=="function")return {ok:false,reason:"combat-unavailable"};
      if(GS.combat&&GS.combat.active)return {ok:false,reason:"combat-already-active"};
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const rawFoes=p.foes||[];
      const foes=[];
      rawFoes.forEach(f=>{
        const n=(f&&f.count>1)?f.count:1;
        for(let i=0;i<n;i++){ const spec=Object.assign({},f); delete spec.count; foes.push(spec); }
      });
      // BATTLE-THEATER §3 archetype pass 2: `class` rides along so theaterUnitsFrom (src/engine/
      // theater-data.js) can pick the PC's class silhouette (martial/ranger/caster/cleric) for the
      // theater figure — combatStart's pcRef is stashed verbatim as GS.combat.pcRef, so this is the
      // one place the sheet's class string needs to be threaded in.
      // MODEL-GRAMMAR G3 §2 (the loadout mirror): `equipped`/`inventory` are threaded through as the
      // SAME live references (t.sh.equipped, t.sh.inventory — not a copy) so a mid-combat equip swap
      // (the `equip`/`unequip` cases above, which mutate t.sh.equipped[slot] IN PLACE) is visible to
      // theaterUnitsFrom on the very next render pass with zero extra bookkeeping — theaterStageSync
      // (src/world/render.js) calls theaterUnitsFrom(GS.combat) fresh every render, so pcRef.equipped
      // being a live reference is what makes "equip the greataxe and the mini holds the axe" true
      // without this file re-snapshotting on every equip event.
      // `sheetRef` (NOT a copy of .conditions) is threaded through instead of a snapshotted
      // conditions array: engine.conditions' removeCondition REASSIGNS holder.conditions to a new
      // filtered array (conditions.js:142, `holder.conditions = list.filter(...)`) rather than
      // mutating in place, so capturing `t.c.conditions` here would go stale the first time a
      // condition lifts mid-fight. Threading the CHARACTER object itself (t.c — conditions live on
      // the character, not the sheet, per conditionHolder's convention) means theaterConditionModsFrom
      // always reads sheetRef.conditions live, however that property gets updated.
      const pc={ name:t.c.name, class:t.sh.class, mods:t.sh.mods, ac:t.sh.ac, hp:t.sh.hp, hpCur:t.sh.hpCur,
        equipped:t.sh.equipped||null, inventory:t.sh.inventory||[], conditionsRef:t.c };
      // BATTLE-THEATER LIGHTING (+ REALM-SURFACES-WIRING.md §3): the DM's own `p.segment` payload is a
      // hand-picked subset ({id,dims,feature,hazard} per docs/COMBAT-LIFECYCLE.md §"segment") — it
      // rarely carries `environment`/`light`/`realms` since the DM has no reason to know those fields
      // exist. Fill all three in from the app's OWN live tracking (the active walk this fight is
      // happening ON) rather than relying on the DM to pass them: theaterEnvSegmentFor(w) reads the
      // SAME walkOfFrontier/cursor state activeWalkDigest already surfaces (+ the SAME activeRealmsFor
      // the walk's own encounter path used), so a fight opened mid-walk always gets the walk's real
      // environment + the "here" segment's own rolled light + its active realm list, additive and
      // null-safe (no active walk -> all three stay undefined/[], theaterBoardFrom's own defaults take
      // over exactly as before this unit).
      const envSeg=(typeof theaterEnvSegmentFor==="function") ? theaterEnvSegmentFor(w) : null;
      const segment=Object.assign({}, envSeg||{}, p.segment||{});
      GS.combat=combatStart({ pc, foes, objectiveRef:p.objectiveRef||null, segment,
        segmentId:p.segmentId||null, scene:p.scene||null });
      // REALM-STORY-WIRING §3: mint/touch codex "creature" records for significant foes — script-owned,
      // fires unconditionally (idempotent no-op for a mook-only fight — codexMintSignificantFoes'
      // own significance guard drops those before ever calling codexAdd).
      if(typeof codexMintSignificantFoes==="function") codexMintSignificantFoes(w, GS.combat.foes);
      const foeList=GS.combat.foes.map(f=>f.name+" ("+(typeof cmFoeStateWord==="function"?cmFoeStateWord(f):"fresh")+")").join(", ");
      const wonInit=GS.combat.first==="pc"?"You won initiative.":"The foes won initiative.";
      addLedger(w,"outcome",{kind:"combat-start",foes:GS.combat.foes.map(f=>({fid:f.fid,name:f.name,cr:f.cr})),first:GS.combat.first,source:src},
        "⚔ Combat — "+GS.combat.foes.length+" foe"+(GS.combat.foes.length===1?"":"s")+": "+foeList+". "+wonInit);
      renderWorld();
      return {ok:true, combat:{ round:GS.combat.round, first:GS.combat.first,
        foes:GS.combat.foes.map(f=>({fid:f.fid,name:f.name,band:f.band,lane:f.lane})) } };
    }

    /* COMBAT-LIFECYCLE.md §3 — transition OUT. DETECTED for the common "last foe drops" case (via
       cmMaybeAutoEnd, §3b) or DECLARED by the DM for every other outcome (fled/surrender/negotiated/
       pc-dead/aborted). combatOutcomeEvents prices only DOWNED foes (fled/surrendered foes pay zero XP,
       by design) — the encounter_resolved + kill events ride the SAME applyEvent cases every other
       caller uses (XP grant, faction escalation), even on pc-dead (downed foes still died). */
    case "combat_end":{
      if(!GS.combat)return {ok:false,reason:"no-combat"};
      if(typeof combatOutcomeEvents!=="function")return {ok:false,reason:"combat-unavailable"};
      const outcome=p.outcome||"resolved", method=p.method||"combat";
      const ev=combatOutcomeEvents(GS.combat,{outcome,method});
      applyEvent(w,ev.encounter);
      ev.kills.forEach(k=>applyEvent(w,k));
      const downCount=ev.kills.length;
      const foes=GS.combat.foes||[];
      const fledCount=foes.filter(f=>f.fled&&!f.down).length;
      const outcomePhrase={resolved:"resolved",fled:"the foes flee",surrender:"the foes surrender",
        negotiated:"talked down","pc-dead":"you fall","aborted":"broken off"}[outcome]||outcome;
      // TRANSITION-CONTRACT.md §3.8 — combat ticks the clock off the round count (>=6s/round, min 1
      // min/fight). Ticks on EVERY outcome incl. pc-dead (time passed regardless). Captured BEFORE
      // GS.combat=null below.
      const combatMin=Math.max(1,Math.round(((GS.combat.round||1)*6)/60));
      if(typeof advanceClock==="function") advanceClock(w,combatMin);
      addLedger(w,"outcome",{kind:"combat-end",outcome,method,downed:downCount,fled:fledCount,minutes:combatMin,
        ...(p.reason?{reason:String(p.reason)}:{}),source:src},
        "⚔ The fight ends — "+outcomePhrase+". "+downCount+" foe"+(downCount===1?"":"s")+" down"+(fledCount?(", "+fledCount+" fled"):"")+".");
      // BATTLE-THEATER §4 hook site: combat_end itself maps to silence (theaterFxFromLedger returns
      // null for "combat-end" — no single subject to animate) but the call site is still wired here
      // per the spec's "≤8 call sites, each one line" so a future richer end-of-fight beat (e.g. a
      // victory flourish) has a hook already in place to key off. Called BEFORE GS.combat=null so a
      // verb reading live combat state (none currently do) still could.
      if(typeof cmTheaterNotify==="function") cmTheaterNotify("combat-end",{outcome,method});
      // TABLETOP-UNITS.md §U6: the trace write (U5's overlay.traces contract) — BEFORE GS.combat=null
      // clears the foe roster this reads. No-op (null) on a walk-less fight/no downed foes; never
      // throws (theaterCombatEndTraces is itself fully null-safe).
      if(typeof theaterCombatEndTraces==="function" && typeof walkUpdateSegment==="function"){
        const traceOverlay=theaterCombatEndTraces(w,GS.combat);
        if(traceOverlay) walkUpdateSegment(w,undefined,traceOverlay,undefined);
      }
      GS.combat=null;
      renderWorld();   // render.js:206's prevPanel restore handles the panel teardown
      return {ok:true, outcome, downed:downCount, minutes:combatMin, xpEvents:{encounter:ev.encounter, kills:ev.kills}};
    }

    case "attack":{                                  // THE LIVE ATTACK PATH (docs/ITEMS.md) — resolve a PC swing
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};        // with the EQUIPPED weapon (pcAttack → resolveAttack).
      if(typeof pcAttack!=="function")return {ok:false,reason:"combat-unavailable"};  // p.d20 = the player's open roll (dice transparency).
      // EXTRA ATTACK (§6): attackIndex (0-based) is the Nth swing this Action — the caller/DM checks it
      // against attacksPerAction(sh) before emitting a second+ attack event; we don't re-gate here (the
      // budget check lives in the `action` event's Attack-action bookkeeping) to keep this event a pure
      // resolve-and-report, matching its pre-existing contract.
      // BATTLEMAP.md §1: an optional p.target (a GS.combat foe fid) threads the flank/elevation rule
      // into the PC's own swing — p.target absent (the pre-existing contract) behaves identically.
      // Zone cover (cmZoneCover) folds in with an explicit p.cover — the STRONGER of the two wins
      // (cover never stacks past the best single source, SRD 2024).
      const targetFoe=(p.target&&GS.combat)?(GS.combat.foes||[]).find(f=>f.fid===p.target):null;
      const zoneCov=(targetFoe&&typeof cmZoneCover==="function")?cmZoneCover(GS.combat,GS.combat.pc,targetFoe):0;
      const covRank={full:3,"three-quarters":2,half:1};
      const effCover=(covRank[zoneCov]||0)>(covRank[p.cover]||0)?zoneCov:p.cover;
      // CRIT-MAGNITUDE (2026-07-03 Adam's ruling): p.magnitude threads the player's OPEN second d20
      // (rolled client-side, same dice-transparency contract as p.d20) into resolveAttack — omitted
      // is fine, resolveAttack rolls its own when a nat 20/1 lands with no magnitude supplied.
      // HQ2-1: p.d20 / p.targetAC / p.magnitude coerced in dmFoldPayload (num:["d20","targetAC","magnitude"]).
      const res=pcAttack(t.sh,{d20:p.d20,targetAC:p.targetAC,slot:p.slot,cover:effCover,advantage:p.advantage,crit:p.crit,
        magnitude:p.magnitude,attacker:(GS.combat&&GS.combat.pc)||null,target:targetFoe,allies:(GS.combat&&GS.combat.pc)?[GS.combat.pc]:null});
      if(!res)return {ok:false,reason:"no-weapon"};   // no INDEXED weapon in the slot — the DM resolves manually (o.dmg), by design
      const idxTag=(p.attackIndex!=null && p.attackIndex>0)?(" (swing "+(p.attackIndex+1)+")"):"";
      // COMBAT-LIFECYCLE.md §2: on a hit against a live GS.combat foe, actually apply the damage
      // (applyDamage is the ONLY place resist/immune/vuln + foe.down live) — p.target absent stays the
      // pre-existing theater-of-mind contract, byte-for-byte (targetFoe is null, this block no-ops).
      let foeStateSuffix="";
      if(res.hit && res.damage>0 && targetFoe && typeof applyDamage==="function"){
        const dmgType=(res.breakdown&&res.breakdown[0]&&res.breakdown[0].type)||undefined;
        const wasUp=!targetFoe.down;
        applyDamage(targetFoe,res.damage,dmgType);
        // MONSTER-PARLEY §2 harm-by-kind — "DOWN HARD if the PC harms its kind." Guarded once per
        // kind per COMBAT (not per attack) so a multi-hit round doesn't shred a pet's loyalty; the
        // guard lives on the live combat container (GS.combat), reset naturally when combat ends/
        // restarts (a fresh GS.combat object). Non-blocking — best-effort like the wage/lodging sinks.
        if(GS.combat && typeof companionPetHarmedByKind==="function"){
          const kindKey=(targetFoe.statBase && targetFoe.statBase.id) || targetFoe.creatureType || null;
          if(kindKey){
            GS.combat.petHarmFired = GS.combat.petHarmFired || {};
            if(!GS.combat.petHarmFired[kindKey]){
              GS.combat.petHarmFired[kindKey] = true;
              companionPetHarmedByKind(w, kindKey);
            }
          }
        }
        // DEAD-STATE (2026-07-03, Adam's ruling) — OBLITERATION SOURCE 2/3: "a kill from fire/lightning/
        // necrotic/radiant/acid spell damage." GAP, honestly noted: NO spell-vs-foe damage path exists
        // in applyEvent at all — `applyDamage` on a GS.combat foe is called from exactly this ONE site
        // (a PC weapon swing, pcAttack→resolveAttack), never from `cast`/a spell-damage event (the
        // `cast` case above only marks the spell as cast — slot/concentration bookkeeping — it never
        // resolves damage against a foe; that's DM-narrated prose today, outside the event contract).
        // What IS reachable: THIS site's own `dmgType` (an elementally-enchanted weapon's damage type
        // — e.g. a +1 Flame Tongue Longsword — is the one place a foe-damaging swing legitimately
        // carries fire/lightning/necrotic/radiant/acid through applyDamage). A killing blow of one of
        // those types obliterates rather than leaving a corpse — reusing the SAME elemental vocabulary
        // BATTLE-THEATER §4's fx:<type> table already recognizes, so a future spell-damage event only
        // has to reuse this exact check, not invent a new one.
        const elemental=/^(fire|lightning|necrotic|radiant|acid)$/i.test(dmgType||"");
        if(wasUp && targetFoe.down && elemental){
          targetFoe.obliterated=true;
          if(typeof window!=="undefined" && window.Theater && typeof window.Theater.play==="function"){
            try{ window.Theater.play("obliterate",{who:targetFoe.fid}); }catch(e){ /* best-effort */ }
          }
        }
        // computed AFTER the obliteration stamp above so a killing elemental blow's own ledger line
        // reads "is obliterated" (the prose twin), not the weaker "is down" cmFoeStateWord would have
        // reported one statement earlier — the DEAD-STATE distinction the ledger line must carry.
        if(typeof cmFoeStateWord==="function") foeStateSuffix=" — "+targetFoe.name+" is "+cmFoeStateWord(targetFoe)+".";
      }
      // CRIT-MAGNITUDE (2026-07-03 Adam's ruling): res.magnitude is the crit-outcome atom off the
      // NATURAL 20/1 (null on a non-crit or a forced o.crit with no natural spike — see resolveAttack).
      // The ledger line names the magnitude alongside "CRITICAL" so the DM narrates from the number the
      // player actually rolled, not a bare boolean.
      const critTag=res.crit&&res.magnitude?(" — CRITICAL (magnitude "+res.magnitude.magnitude+")")
        :res.crit?" — CRITICAL":"";
      const line=res.fullCover?(t.c.name+" — no line to the target (full cover)")
        :res.hit?(t.c.name+" hits with "+res.weaponName+idxTag+critTag+" for "+res.damage+" damage")
        :(t.c.name+" misses with "+res.weaponName+idxTag+(res.magnitude?(" — magnitude "+res.magnitude.magnitude):"")+" ("+res.natural+"+"+res.atkBonus+"="+res.total+" vs AC "+res.targetAC+")");
      addLedger(w,"outcome",{kind:"attack",pc:t.c.name,weapon:res.weaponName,attackIndex:p.attackIndex||0,hit:res.hit,crit:res.crit,damage:res.damage,
        natural:res.natural,total:res.total,targetAC:res.targetAC,breakdown:res.breakdown,target:p.target||null,
        magnitude:res.magnitude?res.magnitude.magnitude:null,tier:res.magnitude?res.magnitude.tier:null,
        foeState:targetFoe&&typeof cmFoeStateWord==="function"?cmFoeStateWord(targetFoe):null,source:src},
        "⚔ "+line+"."+foeStateSuffix);
      // BATTLE-THEATER §4 hook site 1/6: the PC's own swing — theaterFxFromLedger maps kind:"attack" to
      // `strike` (miss=overshoot per §4's letter); magnitude rides through so a big crit's FX scales
      // past the old flat crit?3:1.
      if(typeof cmTheaterNotify==="function") cmTheaterNotify("attack",{hit:res.hit,crit:res.crit,target:p.target,magnitude:res.magnitude?res.magnitude.magnitude:null});
      // CRIT-MAGNITUDE §3/dead-state — a natural-20/1 spike on THIS swing auto-emits crit_outcome (the
      // SAME event the skill-check crit path already writes to the Ledger as canon on Mythic), carrying
      // p.target through so a magnitude>=8 KILLING blow auto-stamps `obliterated` via crit_outcome's own
      // existing gate (target confirmed down, magnitude>=8) — zero DM action needed, exactly Adam's
      // "obliterated by a crit." A fumble (natural 1) rides the SAME event so its lens vector/ledger line
      // exist for DM narration too — crit_outcome itself does nothing mechanical for a non-mythic tier.
      if(res.magnitude && typeof applyEvent==="function"){
        applyEvent(w, {type:"crit_outcome", payload:Object.assign({target:p.target||null}, res.magnitude), source:src});
      }
      // DE-4: morale sweep FIRST (a swept flee can complete the "all foes resolved" picture), THEN
      // auto-end detection — this is the only site where a PC damages/downs a foe, i.e. the only
      // place checkpoint state can newly become true.
      if(targetFoe && typeof cmMoraleSweep==="function") cmMoraleSweep(w);
      // COMBAT-LIFECYCLE.md §3b: auto-end detection — this is one of the three sites that can change a
      // foe's down/fled/surrendered state.
      if(targetFoe && typeof cmMaybeAutoEnd==="function") cmMaybeAutoEnd(w);
      return {ok:true,result:res};
    }

    /* §6 THE COMBAT-ACTION LAYER — action economy + standard actions + Extra Attack budget + opportunity
       attacks + grapple/shove. All read/write GS.combat's per-combatant `budget`/`flags` (reset each turn
       by the caller via resetTurnBudget — the walk/turn loop calls this at the top of each side's turn). */

    /* `action{kind, target?, dir?, ally?, trigger?}` — a STANDARD action (Dodge/Disengage/Dash/Help/Ready/
       Hide/Search/Study/Utilize). Spends the Action budget slot on the current PC's GS.combat entry (or a
       bare tracker on the sheet outside combat, so Dodge/Help etc. still work as a narrative beat). */
    case "action":{
      if(typeof standardAction!=="function")return {ok:false,reason:"combat-actions-unavailable"};
      // the ACTOR carrying the turn budget: GS.combat.pc (in a fight) or a bare fallback tracker on the
      // sheet (out-of-combat Help/Ready reads oddly, but Dodge/Hide are still meaningful outside a fight).
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const actor=(GS.combat&&GS.combat.pc)?GS.combat.pc:(t.sh.__actionBudget=t.sh.__actionBudget||{});
      const round=(GS.combat&&GS.combat.round)||0;
      const r=standardAction(actor,p.kind,{dir:p.dir,ally:p.ally,trigger:p.trigger,round});
      if(!r.ok)return r;
      // Dodge lands as a real `dodging` CONDITION on the PC's condition holder (t.c) — so resolveAttack's
      // conditionAdvDis consult gives ATTACKERS disadvantage, and round_tick's ttl auto-expires it. (The
      // budget lives on GS.combat.pc; the condition lives on t.c — two objects, per conditionHolder.)
      if(p.kind==="dodge" && typeof addCondition==="function"){ const h=conditionHolder(w,"pc"); if(h) addCondition(h.obj,"dodging",{endOfNextTurn:true},round); }
      addLedger(w,"outcome",{kind:"action",pc:t.c.name,action:p.kind,effect:r.effect,source:src},
        "⚔ "+t.c.name+" — "+p.kind+(r.effect&&r.effect.note?(": "+r.effect.note):"")+".");
      return Object.assign({ok:true},r);
    }

    /* `opportunity_attack{foe, d20}` — DETECTED off an undefended Melee-leave (the caller/DM notices the
       PC's moveBand call left Melee without Disengage and a foe with a Reaction available; this event
       resolves THAT foe's swing). `foe` = the GS.combat fid; `d20` omitted → the engine rolls the foe's
       attack (foes' dice are always engine-rolled, per COMBAT.md). */
    case "opportunity_attack":{
      if(!GS.combat)return {ok:false,reason:"no-combat"};
      const foe=(GS.combat.foes||[]).find(f=>f.fid===p.foe);
      if(!foe)return {ok:false,reason:"no-such-foe"};
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      // §6: Disengage suppresses the OA entirely; a foe needs an AVAILABLE Reaction (one per round). These
      // are the two gates opportunityAttack() enforces on the pure side — wired into the event path here
      // (the earlier build resolved the swing unconditionally, so Disengage was inert + the cap unenforced).
      const mover=(GS.combat&&GS.combat.pc)||null;
      if(mover&&mover.flags&&mover.flags.disengaged)return {ok:false,reason:"disengaged"};
      if(typeof spendBudget==="function"){ const rx=spendBudget(foe,"reaction"); if(!rx.ok)return {ok:false,reason:"no-reaction"}; }
      const atkAction=(foe.actions||[]).find(a=>a.kind==="melee")||(foe.actions||[])[0]||null;
      const atkBonus=(atkAction&&atkAction.atk)||0;
      const dmg=(atkAction&&atkAction.dmg)||[{n:0,die:0,bonus:1,type:null}];
      const targetAC=(t.sh.ac!=null)?t.sh.ac:10;
      // pass the PC's condition holder as the TARGET so a dodging/prone/restrained PC shapes the foe's
      // swing (conditionAdvDis) — the wire that makes Dodge mechanically matter against an OA.
      const pcHolder=conditionHolder(w,"pc");
      const res=resolveAttack({d20:p.d20,atkBonus,targetAC,dmg,attacker:foe,target:pcHolder?pcHolder.obj:null,range:"melee"});
      addLedger(w,"outcome",{kind:"opportunity-attack",foe:foe.name,fid:foe.fid,hit:res.hit,damage:res.damage,
        natural:res.natural,total:res.total,targetAC:res.targetAC,source:src},
        "⚔ "+foe.name+" gets an opportunity attack — "+(res.hit?("hits for "+res.damage+" damage"):"misses")+".");
      if(res.hit && res.damage>0) applyEvent(w,{type:"hp_changed",payload:{delta:-res.damage,crit:res.crit},source:"detected"});
      return Object.assign({ok:true},res);
    }

    /* `move_zone{who,band?,lane?,dash?}` — BATTLEMAP.md §2: the DM (or the foe autoplay/tactics engine)
       emits this for a declared move; the script VALIDATES legality (moveZoneValidate: within this
       move's zone-step budget — 1, or 2 with Dash — and inside the room's actual grid) and REJECTS an
       illegal move `{ok:false,reason}` rather than silently clamping it — the DM narrates motion, the
       script owns the board. `who` = "pc" or a GS.combat foe's fid. A PC leaving Melee band fires the
       EXISTING opportunity-attack event AUTOMATICALLY, once per live/undisengaged foe who was sharing
       the vacated melee zone — the `opportunity_attack` case itself is the single place that spends
       the foe's Reaction budget + checks Disengage (its existing gates), so this call site only DETECTS
       the candidates and re-emits the pre-existing event per foe (no double-spend). Lane-only moves
       within a band never provoke (BATTLEMAP.md §1) — this block only ever runs on an actual melee exit.
       A foe's own move provoking an OA is a documented gap (unchanged from the pre-existing event's
       PC-centric contract — only the PC's melee-leave is detected here).
       PER-TURN MOVEMENT BUDGET (code-review fix): moveZoneValidate's own comment says "the caller
       (world/dm.js) tracks whether this combatant already spent a move this round" — this call site is
       that caller. A mover who already spent this turn's movement (`mover.budget.moved`, the SAME flag
       combat-actions.js's Dash standardAction sets) is rejected with `{ok:false,reason:"already-moved"}`
       BEFORE moveZoneValidate runs (so a spent budget always wins over "is this move geometrically
       legal") — without this a combatant could emit unlimited move_zone events in one turn and cross
       the whole map. A zero-step re-declaration (stepsNeeded===0 — the mover isn't actually going
       anywhere, e.g. a same-zone lane no-op) never spends the budget; only a real step does, and it
       spends the WHOLE turn's movement even under Dash (Dash's 2-step budget is still one move action,
       not two separate moves — mirrors standardAction's dash case setting budget.moved unconditionally). */
    case "move_zone":{
      if(typeof moveZoneValidate!=="function")return {ok:false,reason:"battlemap-unavailable"};
      if(!GS.combat||!GS.combat.active)return {ok:false,reason:"no-combat"};
      const cm=GS.combat;
      const mover=(p.who==="pc")?cm.pc:(cm.foes||[]).find(f=>f.fid===p.who);
      if(!mover)return {ok:false,reason:"no-such-combatant"};
      if(mover.budget && mover.budget.moved)return {ok:false,reason:"already-moved"};
      const grid=cm.grid||{bands:CM_BANDS.slice(),lanes:CM_LANES.slice()};
      const v=moveZoneValidate(mover,grid,{band:p.band,lane:p.lane,dash:!!p.dash});
      if(!v.ok)return v;
      const fromBand=mover.band, fromLane=mover.lane||"C";
      let oaCandidates=[];
      if(p.who==="pc" && v.leftMelee && !(mover.flags&&mover.flags.disengaged)){
        oaCandidates=(cm.foes||[]).filter(f=>!f.down && (f.band||"melee")===fromBand);
      }
      mover.band=v.band; mover.lane=v.lane;
      if((v.bandSteps>0||v.laneSteps>0)){ mover.budget=mover.budget||{}; mover.budget.moved=true; }
      if(typeof cmStampElev==="function") cmStampElev(cm, mover);
      const label=(p.who==="pc")?"you":(mover.name||p.who);
      const bandLbl=(typeof CMB_BAND_LABEL!=="undefined"&&CMB_BAND_LABEL[v.band])||v.band;
      addLedger(w,"outcome",{kind:"move-zone",who:p.who,from:fromBand+":"+fromLane,to:v.band+":"+v.lane,leftMelee:v.leftMelee,source:src},
        "⟲ "+label+" move"+(p.who==="pc"?"":"s")+" to "+bandLbl+"-"+v.lane+".");
      // BATTLE-THEATER §4 hook site 2/6: theaterFxFromLedger maps kind:"move-zone" to `advance` (the
      // glide-between-zone-centers tween — fired by move_zone per §4's own table).
      if(typeof cmTheaterNotify==="function") cmTheaterNotify("move-zone",{who:p.who,to:v.band+":"+v.lane});
      const oaResults=oaCandidates.map(f=>applyEvent(w,{type:"opportunity_attack",payload:{foe:f.fid},source:"detected"}));
      return Object.assign({ok:true,opportunityAttacks:oaResults},v);
    }

    /* `grapple{d20,bonus?,defenderSkill?}` / `shove{d20,bonus?,intent?}` — CONTESTED checks (§6 Decision:
       CONTESTED). The PC is always the attacker in these two events (a foe's grapple/shove attempt against
       the PC is DM-narrated via the same resolveGrapple/resolveShove primitives but isn't wired as a typed
       event yet — the PC-initiated direction is the common case this build covers). Success → the caller
       still emits condition_add{grappled} (or a prone/push condition) separately; this event only resolves
       the CONTEST + reports the verdict (mirrors resolveContest's pure convention). */
    case "grapple":{
      if(typeof resolveGrapple!=="function")return {ok:false,reason:"combat-actions-unavailable"};
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const foe=GS.combat?(GS.combat.foes||[]).find(f=>f.fid===p.target):null;
      const defenderSh=foeContestSheet(foe);   // the foe's REAL ability mods (Athletics/Acrobatics) — not a +0 pushover
      const r=resolveGrapple(t.sh,{d20:p.d20,bonus:p.bonus},defenderSh,{d20:p.defenderD20});
      if(!r.ok)return r;
      addLedger(w,"outcome",{kind:"grapple",pc:t.c.name,target:p.target,success:r.success,
        attackerTotal:r.attackerTotal,defenderTotal:r.defenderTotal,source:src},
        "⚔ "+t.c.name+" attempts to grapple — "+(r.success?"succeeds":"fails")+" ("+r.attackerTotal+" vs "+r.defenderTotal+").");
      return Object.assign({ok:true},r);
    }

    case "shove":{
      if(typeof resolveShove!=="function")return {ok:false,reason:"combat-actions-unavailable"};
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const foe=GS.combat?(GS.combat.foes||[]).find(f=>f.fid===p.target):null;
      const defenderSh=foeContestSheet(foe);
      const r=resolveShove(t.sh,{d20:p.d20,bonus:p.bonus},defenderSh,{d20:p.defenderD20},p.intent);
      if(!r.ok)return r;
      addLedger(w,"outcome",{kind:"shove",pc:t.c.name,target:p.target,intent:r.intent,success:r.success,
        attackerTotal:r.attackerTotal,defenderTotal:r.defenderTotal,source:src},
        "⚔ "+t.c.name+" attempts to shove ("+r.intent+") — "+(r.success?"succeeds":"fails")+" ("+r.attackerTotal+" vs "+r.defenderTotal+").");
      return Object.assign({ok:true},r);
    }

    /* `hazard_tick{kind, feet?, holdRounds?, roundsHeld?}` (§5) — a thin formula pass-through: falling
       (kind:"fall", feet) rolls the SRD bludgeoning formula and applies it as damage; on-fire/suffocating/
       drowning route through hazardTick (engine.hazards) and, for on-fire, apply the rolled damage the
       same way. One hazard vocabulary shared with ITEMS.md §D's elemental-effects map.
       DEAD-STATE (2026-07-03, Adam's ruling) — OBLITERATION SOURCE 3/3: "terrain/hazard kills." GAP,
       honestly noted: this event is PC-ONLY end to end — `livingSheet(w)` above resolves the PC's own
       sheet, `hazardTick`/`resolveFall` apply against it, and the resulting damage always lands via a
       PC-scoped `hp_changed` (never touches GS.combat.foes). There is no event in this switch that
       applies a hazard/terrain tick against a FOE at all — a foe standing in a hazard zone (theater-
       data.js's own hazardZones — water/pit/scorch tiles) never takes hazard damage through the event
       contract today; that stays DM-narrated prose outside applyEvent's reach. Wiring "hazard kills a
       foe -> obliterated" here would require inventing a foe-hazard-damage path this codebase doesn't
       have — left unwired rather than faked. A PC hazard death also isn't in scope for THIS flag: a
       downed PC runs the separate Death & Rebirth flow (src/world/dm.js's hp_changed massive-damage
       branch, docs/DEATH-AND-REBIRTH.md), not the theater corpse/obliteration read this unit builds for
       foes/allies on the battle board. */
    case "hazard_tick":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      if(p.kind==="fall"){
        if(typeof resolveFall!=="function")return {ok:false,reason:"hazards-unavailable"};
        const r=resolveFall(p.feet);
        addLedger(w,"outcome",{kind:"hazard",pc:t.c.name,hazard:"fall",feet:p.feet,damage:r.total,source:src},
          "☠ "+t.c.name+" falls "+p.feet+" ft — "+r.total+" bludgeoning damage.");
        if(r.total>0) applyEvent(w,{type:"hp_changed",payload:{delta:-r.total},source:"detected"});
        return {ok:true,damage:r.total};
      }
      if(typeof hazardTick!=="function")return {ok:false,reason:"hazards-unavailable"};
      const r=hazardTick(p.kind,{holdRounds:p.holdRounds,roundsHeld:p.roundsHeld});
      if(!r.ok)return r;
      if(r.damage){
        addLedger(w,"outcome",{kind:"hazard",pc:t.c.name,hazard:p.kind,damage:r.damage,source:src},
          "☠ "+t.c.name+" — "+p.kind+" — "+r.damage+" "+(r.type||"")+" damage.");
        applyEvent(w,{type:"hp_changed",payload:{delta:-r.damage},source:"detected"});
      } else if(r.dropTo0){
        addLedger(w,"outcome",{kind:"hazard",pc:t.c.name,hazard:p.kind,dropTo0:true,source:src},
          "☠ "+t.c.name+" — "+p.kind+" — drops to 0 HP.");
        applyEvent(w,{type:"hp_changed",payload:{delta:-(t.sh.hpCur||0)},source:"detected"});
      } else {
        addLedger(w,"outcome",{kind:"hazard",pc:t.c.name,hazard:p.kind,breathing:true,source:src},
          "✦ "+t.c.name+" holds their breath ("+r.roundsHeld+"/"+r.holdRounds+" rounds).");
      }
      return Object.assign({ok:true},r);
    }

    case "slot_spent":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const r=spendSlot(t.sh,p.level||1);
      if(!r.ok){addLedger(w,"outcome",{kind:"slot",pc:t.c.name,level:r.level,empty:true,source:src},
        "✦ "+t.c.name+" has no level-"+r.level+" slot to spend.");return r;}
      addLedger(w,"outcome",{kind:"slot",pc:t.c.name,level:r.level,slotKind:r.kind,remaining:r.remaining,max:r.max,source:src},
        "✦ "+t.c.name+" spends a "+(r.kind==="pact"?"pact ":"")+"level-"+r.level+" slot — "+r.remaining+"/"+r.max+" left.");
      return {ok:true,remaining:r.remaining+"/"+r.max};
    }

    case "cast":{                                    // CAST a spell (docs/SRD-MECHANIZATION.md §2) — the marker that owns
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // concentration + ritual. Slot spending stays slot_spent (the DM
      const name=p.spell||p.name||"a spell";                                 // emits it alongside), EXCEPT a ritual cast, which SKIPS the slot.
      const rec=(typeof spellIndexByName==="function")?spellIndexByName(name):null;
      const isRitual=!!p.ritual && ((typeof ritualEligible==="function")?ritualEligible(name):true);
      const isConc=(p.concentration!=null)?!!p.concentration:!!(rec&&rec.concentration);
      const out={ok:true,spell:name,ritual:isRitual,concentration:isConc};
      // RITUAL FLOW: +10 minutes (advanceClock — passTime takes a rest-KIND, not minutes) and NO slot
      // spend for a ritual-tagged spell.
      if(isRitual){
        if(typeof advanceClock==="function") advanceClock(w,10);
        out.ritualMinutes=10;
      } else if(p.level && typeof spendSlot==="function"){
        const r=spendSlot(t.sh,p.level); out.slot=r;                         // a non-ritual leveled cast spends a slot (a cantrip has no p.level)
      }
      // CONCENTRATION: casting a concentration spell auto-drops any prior (concentration_broken cause:recast).
      let broken=null;
      if(isConc && typeof startConcentration==="function"){
        const round=(GS.combat&&GS.combat.round)||0;
        // HQ3-C5: stamp the clock the spell was cast at so concentrationTick can check expiry later.
        const cc=(typeof clockOf==="function")?clockOf(w):null;
        const s=startConcentration(t.sh,name,round,cc?{day:cc.day,min:cc.min}:null);
        if(s.dropped){ broken=s.dropped;
          addLedger(w,"outcome",{kind:"concentration",pc:t.c.name,spell:s.dropped,cause:"recast",broken:true,source:"detected"},
            "✦ "+t.c.name+"'s concentration on "+s.dropped+" ends — recasting "+name+"."); out.droppedConcentration=s.dropped; }
      }
      addLedger(w,"outcome",{kind:"cast",pc:t.c.name,spell:name,ritual:isRitual,concentration:isConc,source:src},
        "✦ "+t.c.name+" casts "+name+(isRitual?" as a ritual (10 min, no slot)":"")+(isConc?" — concentrating":"")+".");
      return out;
    }

    case "concentration_start":{                     // explicit concentration start (usually rides `cast`; here for a direct set)
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      if(typeof startConcentration!=="function")return {ok:false,reason:"concentration-unavailable"};
      const round=(GS.combat&&GS.combat.round)||0;
      // HQ3-C5: stamp the clock so concentrationTick can check expiry later.
      const cc=(typeof clockOf==="function")?clockOf(w):null;
      const s=startConcentration(t.sh,p.spell,round,cc?{day:cc.day,min:cc.min}:null);
      if(s.dropped) addLedger(w,"outcome",{kind:"concentration",pc:t.c.name,spell:s.dropped,cause:"recast",broken:true,source:"detected"},
        "✦ "+t.c.name+"'s concentration on "+s.dropped+" ends.");
      addLedger(w,"outcome",{kind:"concentration",pc:t.c.name,spell:p.spell,started:true,source:src},
        "✦ "+t.c.name+" concentrates on "+p.spell+".");
      return {ok:true,started:s.started,dropped:s.dropped};
    }

    case "concentration_broken":{                    // a failed damage-save / condition / the DM's explicit drop (§2)
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      if(typeof breakConcentration!=="function")return {ok:false,reason:"concentration-unavailable"};
      const b=breakConcentration(t.sh,p.cause||"dm");
      if(!b.broken)return {ok:false,reason:"not-concentrating"};
      // §2↔§3 wire: lift any condition tagged {concentration:<pc>} that this spell was sustaining. In v1
      // the PC's own concentration doesn't typically hold conditions on itself; foes it charmed live in
      // GS.combat — sweep them so a broken hold/charm actually releases the target.
      if(typeof removeCondition==="function" && GS.combat){
        (GS.combat.foes||[]).forEach(f=>{ (f.conditions||[]).slice().forEach(e=>{
          const ttl=(e&&e.ttl)||{}; if(ttl.concentration==="pc"||ttl.concentration===b.spell) removeCondition(f,e.condition); }); });
      }
      addLedger(w,"outcome",{kind:"concentration",pc:t.c.name,spell:b.spell,cause:b.cause,broken:true,source:src},
        "✦ "+t.c.name+"'s concentration on "+b.spell+" breaks ("+b.cause+").");
      return {ok:true,broken:true,spell:b.spell,cause:b.cause};
    }

    case "resource_spent":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const r=spendResource(t.sh,p.key,p.n);
      if(!r.ok){const msg=(r.reason==="insufficient")
          ? "✦ "+t.c.name+" can't spend "+r.want+" "+r.label+" — only "+r.have+" left."
          : "✦ "+t.c.name+" has no "+(p.key||"resource")+" pool.";
        addLedger(w,"outcome",{kind:"resource",pc:t.c.name,key:p.key,reason:r.reason,have:r.have,want:r.want,source:src},msg);return r;}
      addLedger(w,"outcome",{kind:"resource",pc:t.c.name,key:r.key,label:r.label,spent:r.spent,remaining:r.remaining,max:r.max,source:src},
        "✦ "+t.c.name+" spends "+r.spent+" "+r.label+" — "+r.remaining+"/"+r.max+" left.");
      return {ok:true,remaining:r.remaining+"/"+r.max};
    }

    case "rest":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      // DETECTED-EVENTS.md DE-1: no resting mid-fight (a DM-declared rest used to be a free-rest
      // exploit path — "the exact hard/dangerous gap Adam ruled against").
      if(GS.combat && GS.combat.active) return {ok:false, reason:"combat-active"};
      const kind=(p.kind==="long")?"long":"short";
      // HQ3-C1 (SET-07-F2) — a short rest heals ONLY by spending Hit Dice; do this BEFORE restRiders
      // so its own ledger line lands ahead of the rest-risk/recovery lines. No-op on a long rest (a
      // long rest already heals to full) or when no spend was requested.
      let hd=null;
      if(kind==="short" && p.spendHitDice && typeof spendHitDice==="function"){
        hd=spendHitDice(t.sh, p.spendHitDice, p.hdRolls);
        if(hd.ok) addLedger(w,"outcome",{kind:"hit-dice",pc:t.c.name,spent:hd.spent,healed:hd.healed,hp:hd.hp,source:src},
          "✦ "+t.c.name+" spends "+hd.spent+" Hit "+(hd.spent===1?"Die":"Dice")+" — heals "+hd.healed+" ("+hd.hp+").");
      }
      // COMPOSED at the 2026-07-07 spine integration — both specs planned for each other:
      // TRANSITION-CONTRACT §3.8 ticks the clock (+480 long / +60 short, or a partial window on an
      // INTERRUPTED rest — HQ3-C2, SET-07-F1: the double-penalty fix) and wakes a KO'd PC; DETECTED-
      // EVENTS DE-1's restRiders is the ONE shared cost/rider/recovery stack (lodging, camp-cooking,
      // wages, pet tick, rest-risk, recovery, charge refill, −1 exhaustion, temp-HP clear, rust
      // maintenance, level-up claim, ledger) for both callers. dayScale:1 only for "long" — a
      // DM-declared short rest owes no lodging/wages, same as the UI's short-rest button. restRiders
      // now rolls risk and returns the minutes to advance — the clock advances AFTER it returns (both
      // callers no longer pre-advance), so an interrupted rest burns only a rolled partial window.
      const restMin=(kind==="long")?480:60;
      const rr=(typeof restRiders==="function")?restRiders(w,{restKind:kind, dayScale:(kind==="long")?1:0, fullMinutes:restMin, via:"dm"}):{};
      const advanced=(typeof rr.clockMinutes==="number")?rr.clockMinutes:restMin;
      if(typeof advanceClock==="function") advanceClock(w,advanced);
      return {ok:true, rest:kind, restored:rr.restored, hitDice:hd, interrupted:!!rr.interrupted,
        interruptedMinutes:rr.interruptedMinutes||null, exhaustion:rr.exhaustionAfter,
        lodging:rr.lodging||null, leveled:rr.leveled||null, minutes:advanced};
    }

    case "item_changed":{                            // INVENTORY mutation — the ONE event that touches gear/coin
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // (confiscation / loot / buy-sell / consume). Removed items are
      const sh=t.sh; sh.inventory=sh.inventory||[];                          // RECOVERABLE: the ledger records exactly what left, so a later add[] restores it.
      // ENCUMBRANCE HARD CAP (docs/ITEMS.md Decision 4 — "no barrelmancers"): a pickup that would push the
      // load past STR×30 is refused outright (surfaced, not silent). Skipped when the DM forces it (p.force)
      // or when the item's weight is unknown (unindexed → 0, never invents). Removes/confiscation are never blocked.
      if((p.add||[]).length && !p.force && typeof carryState==="function" && typeof itemDef==="function" && typeof instWeight==="function"){
        const cur=carryState(sh), hard=cur.hard;
        const addW=(p.add||[]).reduce((s,spec)=>{ const nm=String((spec&&spec.name!=null?spec.name:spec)||"").trim();
          const q=(spec&&typeof spec.qty==="number"&&spec.qty>0)?spec.qty:1;
          return s+((typeof instWeight==="function")?instWeight({base:(spec&&spec.base)||undefined,name:nm,qty:q}):0); },0);
        if(cur.weight+addW>hard){
          addLedger(w,"drift",{kind:"over-capacity",pc:t.c.name,weight:cur.weight,add:addW,hard:hard,source:src},
            "◇ "+t.c.name+" can't carry that — "+Math.round(cur.weight+addW)+" lb would exceed the "+hard+" lb hard cap. The pickup is refused.");
          return {ok:false,reason:"over-capacity",weight:cur.weight,add:addW,hard:hard,
            note:t.c.name+" can't carry that much — over the "+hard+" lb hard cap."};
        }
      }
      // AFFORDABILITY (HQ3-A3 / SET-04-F2): a PURCHASE (non-empty add[]) whose negative gold would
      // overdraw the purse is REFUSED atomically — neither item nor coin moves — mirroring
      // bastion_claim's cannot-afford guard. A gold-ONLY negative (no add[]: a fine/theft/bribe) still
      // clamps at the Math.max(0,…) below (a DM-narrated deduction, not a purchase to "afford").
      // force:true overrides (DM's call). p.gold is a number-or-null (coerced in dmFoldPayload,
      // num:["gold"]) — NO handler-side coercion (boundary law).
      if((p.add||[]).length && typeof p.gold==="number" && p.gold<0 && !p.force){
        const have=sh.gold||0, need=-p.gold;
        if(have + p.gold < 0){
          addLedger(w,"drift",{kind:"cannot-afford",pc:t.c.name,have,need,source:src},
            "◇ "+t.c.name+" can't afford that — "+need+" gp needed, "+have+" in purse. The purchase is refused.");
          return {ok:false,reason:"cannot-afford:"+need,have,need};
        }
      }
      const removed=[], added=[];
      if(p.removeAll){ removed.push.apply(removed, sh.inventory.splice(0)); }   // strip everything (a searched/bound prisoner, a total loss)
      // removeIds (not name-matched — docs/ITEMS.md): a flat name string can't disambiguate two of the
      // same item or target "the cursed one" specifically; the instance id can.
      (p.removeIds||[]).forEach(id=>{ const i=sh.inventory.findIndex(it=>it.id===id); if(i>=0){ removed.push(sh.inventory[i]); sh.inventory.splice(i,1); } });
      // DEPRECATED back-compat: the pre-instance shape removed by NAME (p.remove:[name]). A live DM that
      // learned the old vocabulary would otherwise SILENTLY no-op a confiscation (the exact failure this
      // system was built to fix). Honor it — first instance whose name matches — so a stale emitter still
      // removes something rather than nothing. New emitters use removeIds.
      (p.remove||[]).forEach(name=>{ const n=String(name||"").trim().toLowerCase();
        const i=sh.inventory.findIndex(it=>String(it.name||"").trim().toLowerCase()===n);
        if(i>=0){ removed.push(sh.inventory[i]); sh.inventory.splice(i,1); } });
      (p.add||[]).forEach(spec=>{
        const name=String((spec&&spec.name!=null?spec.name:spec)||"").trim(); if(!name)return;
        const inst={id:uid(),name,conditions:[]};
        if(spec&&typeof spec.qty==="number"&&spec.qty>0)inst.qty=spec.qty;
        // CONGRUENCE (docs/ITEMS.md §E): a magic item mints with a base pointer + an enchantment overlay
        // + an optional codex link. Explicit spec fields win; else the overlay defaults from the magic
        // catalog (MAGIC_ITEMS_BY_NAME). `spec.bonus` is shorthand for choosing a generic +N template's
        // value. Charges initialize full (cur=max) on mint. A mundane item stays a bare {id,name,...}.
        const md=(typeof magicDef==="function")?magicDef(name):null;
        if(spec&&spec.base)inst.base=spec.base;
        let ench=(spec&&spec.ench)?JSON.parse(JSON.stringify(spec.ench)):((md&&md.ench)?JSON.parse(JSON.stringify(md.ench)):null);
        if(spec&&typeof spec.bonus==="number"){ ench=ench||{}; ench.bonus=spec.bonus; delete ench.bonusOptions; }
        if(ench){ if(ench.charges&&ench.charges.cur==null)ench.charges.cur=ench.charges.max; inst.ench=ench; }
        if(spec&&spec.codexId)inst.codexId=spec.codexId;
        // ITEM-LEGACY §2.2 (overlay restore): re-granting a storied item whose lifecycle says it left
        // the PC (lossState≠"held") must not silently strip its +1/rider/charges. If the add spec carried
        // NO ench/base of its own, deep-copy them from the record's instSnapshot (the truth of what the
        // thing IS). Charges return at their last-witnessed cur (the world didn't refill the wand).
        if(inst.codexId && typeof codexGet==="function"){
          const lr=codexGet(w,inst.codexId);
          if(lr && lr.legacy && lr.legacy.lossState!=="held" && lr.legacy.instSnapshot){
            const snap=lr.legacy.instSnapshot;
            if(!inst.ench && snap.ench) inst.ench=JSON.parse(JSON.stringify(snap.ench));
            if(!inst.base && snap.base) inst.base=snap.base;
          }
        }
        // CROWNING-BASTION.md §7.B1.4 — a cached item withdrawn from the vault leaves the vault list
        // (ITEM-LEGACY's overlay-restore above already brought its true ench/base back).
        if(w.bastion && inst.codexId){ const vi=(w.bastion.vault||[]).indexOf(inst.codexId);
          if(vi>=0){ w.bastion.vault.splice(vi,1);
            // §9b — keep the resolved-name cache in lockstep with the one array it mirrors.
            w.bastion._vaultNames=w.bastion.vault.map(id=>{const rr=(typeof codexGet==="function")?codexGet(w,id):null;return rr?rr.name:id;});
          } }
        sh.inventory.push(inst); added.push(inst);
        // LOOSE-ENDS §2 — Outlandish diegetic intrusion: spec.outlandish (the shape dwalkOutlandish()
        // hands the caller, {band,intrusion:{note,hookBand}}) rides IN on the add[] entry when this
        // pickup is an Outlandish-band surface. The item's mechanical row (inst above) is UNTOUCHED by
        // this — additive only. hookBand (high-power/reality-breaking) mints a companion thread handle
        // (the CONSEQUENCE-LADDER thread-seed sink, reused verbatim per companions.js's grievance-thread
        // pattern); utility/combat intrude quietly — no thread, per §2's explicit spice gate.
        if(spec&&spec.outlandish&&spec.outlandish.intrusion&&spec.outlandish.intrusion.hookBand&&typeof codexAdd==="function"){
          const tid=(typeof prepCastId==="function")?prepCastId(w,"thread",name+" — where it fell from")
            :("thread:"+slug(name)+"-provenance-"+uid());
          const thread=codexAdd(w,{ id:tid, kind:"thread", provenance:"rolled",
            name:name+" — where it fell from",
            fields:{ desc:"Something else out there remembers "+name+", and who is carrying it now.", itemId:inst.id, band:spec.outlandish.band||null },
            dm:{ legs:"thread-seed", pool:"outlandish-intrusion", inherits:null },
            status:{ known:false, soft:true, at:w.currentNodeId||null } });
          if(thread&&spec.codexId&&typeof codexLink==="function") codexLink(w,thread.id,"part-of",spec.codexId);
          inst.intrusionThreadId=thread?thread.id:null;
        }
      });
      // ITEM-LEGACY §2.2 — fold custody transitions into the ONE inventory event (no second event).
      // Removes: each legacy-grade removed instance with a codexId emits a detected item_claimed.
      // takenBy present (kind npc|creature|faction) → claimed-<kind>, by:takenBy; else a DROP (the item
      // lies where the PC stands — an un-attributed removal is a drop, not a mystery). Adds: a re-granted
      // storied item whose record says it was gone returns to the PC's hand (lossState "held").
      if(typeof legacyGrade==="function" && typeof applyEvent==="function"){
        const tb=p.takenBy;
        const tbKind=(tb && ["npc","creature","faction"].indexOf(tb.kind)>=0)?tb.kind:null;
        removed.forEach(it=>{
          if(!legacyGrade(it) || !it.codexId) return;
          const payload=tbKind
            ? { codexId:it.codexId, by:tb, lossState:"claimed-"+tbKind }
            : { codexId:it.codexId, by:{ kind:"none", ref:null, name:null }, lossState:"dropped", at:w.currentNodeId||null };
          if(tbKind && tb.name!=null) payload.factionInterest=(tbKind==="faction")?tb.name:undefined;
          applyEvent(w,{ type:"item_claimed", source:"detected", payload });
        });
        added.forEach(it=>{
          if(!it.codexId) return;
          const lr=(typeof codexGet==="function")?codexGet(w,it.codexId):null;
          if(!lr || !lr.legacy || lr.legacy.lossState==="held") return;
          applyEvent(w,{ type:"item_claimed", source:"detected", payload:{
            codexId:it.codexId, by:{ kind:"pc", ref:t.c.id, name:t.c.name }, lossState:"held", at:w.currentNodeId||null } });
        });
      }
      let gold=0;
      if(p.gold){ const before=sh.gold||0; sh.gold=Math.max(0, before+p.gold); gold=sh.gold-before; }   // p.gold is now a number or null (coerced in dmFoldPayload, num:["gold"]) — HQ2-1-TOPUP retirement
      const label=it=>it.name+(it.qty?(" ×"+it.qty):"");
      const parts=[];
      if(removed.length) parts.push("lost "+removed.map(label).join(", "));
      if(added.length) parts.push("gained "+added.map(label).join(", "));
      if(gold) parts.push((gold>0?"+":"")+gold+" gp");
      addLedger(w,"outcome",{kind:"inventory",pc:t.c.name,removed,added,gold,source:src},
        p.note||("◆ "+t.c.name+" — "+(parts.join("; ")||"inventory unchanged")+"."));
      return {ok:true,removed,added,gold,inventory:sh.inventory.slice()};
    }

    case "item_split":{                              // split `qty` off a stackable instance into a new one
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // (e.g. "drop 5 of my 20 arrows")
      const sh=t.sh; sh.inventory=sh.inventory||[];
      const from=sh.inventory.find(it=>it.id===p.itemId);
      if(!from)return {ok:false,reason:"no-such-item"};
      // Math.floor (not |0): a bitwise OR 32-bit-overflows a huge qty to garbage; reject a non-positive-
      // integer request outright instead of silently splitting 1.
      const have=from.qty||1, want=Math.floor(Number(p.qty));
      if(!(want>=1))return {ok:false,reason:"bad-qty",qty:p.qty};
      if(want>=have)return {ok:false,reason:"insufficient",have};            // splitting "all of it" is removeIds, not a split
      from.qty=have-want;
      const split={id:uid(),name:from.name,qty:want,conditions:(from.conditions||[]).slice()};
      sh.inventory.push(split);
      addLedger(w,"outcome",{kind:"inventory-split",pc:t.c.name,fromId:from.id,toId:split.id,name:from.name,qty:want,source:src},
        "◆ "+t.c.name+" splits "+want+" "+from.name+" off the stack ("+from.qty+" remain).");
      return {ok:true,newId:split.id,remaining:from.qty,inventory:sh.inventory.slice()};
    }

    case "item_use":{                                // CONSUME a consumable (docs/ITEMS.md Decision 2) — a potion/oil.
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // healing tiers heal numerically in-engine;
      const sh=t.sh; const it=(sh.inventory||[]).find(x=>x.id===p.itemId);  // every other potion stamps a structured buff the DM honors.
      if(!it)return {ok:false,reason:"no-such-item"};
      const md=(typeof magicDef==="function")?magicDef(it.name):null;
      const cons=(it.consumable)||(md&&md.consumable)||null;
      if(!cons||!cons.effect)return {ok:false,reason:"not-consumable",name:it.name};
      const eff=cons.effect; const outcome={kind:eff.kind};
      if(eff.kind==="heal"){
        // roll the heal (a potion isn't an attack; p.roll lets a transparent client pass the player's own roll)
        const rolled=(typeof p.roll==="number")?p.roll
          :((typeof cmRollDamage==="function")?cmRollDamage([{n:eff.dice.n,die:eff.dice.die,bonus:eff.dice.bonus,type:null}]).total
            :(eff.dice.n*Math.floor((eff.dice.die+1)/2)+(eff.dice.bonus||0)));
        const r=applyHpDelta(sh,rolled); outcome.healed=r.delta; outcome.roll=rolled; outcome.hp=r.to+"/"+r.max;
      } else if(eff.kind==="buff"){
        sh.buffs=sh.buffs||[];
        const buff={name:eff.name,duration:eff.duration||null,source:it.name}; if(eff.setStr)buff.setStr=true;
        sh.buffs.push(buff); outcome.buff=buff;
      } else if(eff.kind==="harm"){ outcome.harm=eff.note; }          // a trap potion — the DM adjudicates the save/damage
      // consume one: decrement a stack, else remove the instance
      let consumed=false;
      if(it.qty&&it.qty>1){ it.qty-=1; consumed=true; }
      else { const i=sh.inventory.indexOf(it); if(i>=0){ sh.inventory.splice(i,1); consumed=true; } }
      const desc=(eff.kind==="heal")?("heals "+outcome.healed+" — HP "+outcome.hp)
        :(eff.kind==="buff")?("gains "+eff.name+(eff.duration?(" ("+eff.duration+")"):"")):("triggers "+it.name);
      addLedger(w,"outcome",{kind:"item-use",pc:t.c.name,itemId:p.itemId,name:it.name,effect:outcome,consumed,source:src},
        "✦ "+t.c.name+" uses "+it.name+" — "+desc+".");
      return {ok:true,effect:outcome,consumed,inventory:sh.inventory.slice()};
    }

    case "charge_spend":{                            // spend N charges off a magic item's per-instance pool (docs/ITEMS.md §E)
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      const ench=it.ench||null;
      if(!ench||!ench.charges)return {ok:false,reason:"no-charges",name:it.name};
      if(ench.charges.cur==null)ench.charges.cur=ench.charges.max;
      const n=Math.max(1,Math.floor(Number(p.n)||1));
      if(ench.charges.cur<n)return {ok:false,reason:"insufficient-charges",have:ench.charges.cur,want:n};
      ench.charges.cur-=n;
      addLedger(w,"outcome",{kind:"charges",pc:t.c.name,itemId:it.id,name:it.name,spent:n,remaining:ench.charges.cur,max:ench.charges.max,source:src},
        "✦ "+t.c.name+"'s "+it.name+" — "+n+" charge"+(n>1?"s":"")+" spent ("+ench.charges.cur+"/"+ench.charges.max+" left).");
      return {ok:true,charges:Object.assign({},ench.charges)};
    }

    case "charge_restore":{                          // restore charges (a specific N, or omit to refill to max)
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      const ench=it.ench||null;
      if(!ench||!ench.charges)return {ok:false,reason:"no-charges",name:it.name};
      const max=ench.charges.max, cur=(ench.charges.cur==null?max:ench.charges.cur);
      const _n=(p.n==null?null:p.n);   // HQ2-1: coerced in dmFoldPayload (num:["n"])
      ench.charges.cur=(_n!=null)?Math.min(max,cur+Math.max(0,Math.floor(_n))):max;
      addLedger(w,"outcome",{kind:"charges",pc:t.c.name,itemId:it.id,name:it.name,restored:true,remaining:ench.charges.cur,max:max,source:src},
        "✦ "+t.c.name+"'s "+it.name+" recovers charges ("+ench.charges.cur+"/"+max+").");
      return {ok:true,charges:Object.assign({},ench.charges)};
    }

    /* condition_add / condition_remove are WIDENED (docs/SRD-MECHANIZATION.md §3): they still tag an
       inventory INSTANCE when p.itemId is given (ITEM_CONDITIONS vocab, data/items.js), and now ALSO tag
       a CREATURE / the PC when p.target is given ("pc" | a combat foe fid) — the mechanized §3 conditions
       (blinded/restrained/paralyzed/… with a structured ttl the script owns expiry for). One event name,
       two holder kinds. */
    case "condition_add":{
      const cond=String(p.condition||"").trim().toLowerCase();
      // EXHAUSTION (§5) is tracked as its OWN numeric field (sh.exhaustion, 0-6), not through the §3
      // CONDITIONS table (it has levels, not a flat effect row) — condition_add{condition:"exhaustion"}
      // routes here instead. Level 6 is death (SRD) — routed into the existing Death & Rebirth flow.
      if(cond==="exhaustion" && !p.itemId){
        const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
        if(typeof addExhaustion!=="function")return {ok:false,reason:"hazards-unavailable"};
        const n=(typeof p.n==="number")?p.n:1;
        const level=addExhaustion(t.sh,n);
        addLedger(w,"outcome",{kind:"exhaustion",pc:t.c.name,level,source:src},
          "☠ "+t.c.name+" gains exhaustion — level "+level+"/6"+(level>=6?" — DEAD (exhaustion 6)":"")+".");
        if(level>=6 && typeof killCharacter==="function"){ killCharacter(t.c.id); return {ok:true,level,dead:true}; }
        return {ok:true,level};
      }
      if(p.itemId){                                     // --- INSTANCE path (unchanged) ---
        const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
        const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
        if(!it)return {ok:false,reason:"no-such-item"};
        if(typeof ITEM_CONDITIONS!=="undefined" && ITEM_CONDITIONS.indexOf(cond)<0)return {ok:false,reason:"unknown-condition",cond};
        it.conditions=it.conditions||[];
        if(it.conditions.indexOf(cond)<0)it.conditions.push(cond);
        addLedger(w,"outcome",{kind:"item-condition",pc:t.c.name,itemId:it.id,name:it.name,condition:cond,added:true,source:src},
          "◆ "+t.c.name+"'s "+it.name+" is now "+cond+".");
        return {ok:true,conditions:it.conditions.slice()};
      }
      // --- CREATURE / PC path (§3) ---
      const holder=conditionHolder(w,p.target); if(!holder)return {ok:false,reason:"no-target:"+(p.target||"?")};
      if(typeof addCondition!=="function")return {ok:false,reason:"conditions-unavailable"};
      const round=(GS.combat&&GS.combat.round)||0;
      const entry=addCondition(holder.obj,cond,p.ttl||null,round);
      if(!entry)return {ok:false,reason:"unknown-condition",cond};              // engine never invents a condition ontology
      addLedger(w,"outcome",{kind:"condition",target:p.target,name:holder.label,condition:cond,ttl:p.ttl||null,added:true,source:src},
        "◈ "+holder.label+" is now "+cond+(p.ttl?(" ("+conditionTtlLabel(p.ttl)+")"):"")+".");
      const out={ok:true,condition:cond,ttl:entry.ttl};
      // DETECTED-EVENTS.md DE-2b: an INCAPACITATING condition landing on the PC auto-breaks any
      // running concentration (SRD §3) — direct break + ledger, same posture as the 0-HP break above,
      // no recursive event. Only fires when the target IS the PC (p.target null/"pc").
      if((p.target==null || p.target==="pc") && typeof concentrationAutoBreak==="function"){
        const t3=(typeof livingSheet==="function")?livingSheet(w):null;
        if(t3){
          const cb=concentrationAutoBreak(t3.sh, holder.obj);
          if(cb.broken){
            addLedger(w,"outcome",{kind:"concentration",pc:t3.c.name,spell:cb.spell,cause:"incapacitated",broken:true,source:"detected"},
              "✦ "+t3.c.name+"'s concentration on "+cb.spell+" breaks — incapacitated.");
            out.concentrationBroken={spell:cb.spell,cause:"incapacitated"};
          }
        }
      }
      return out;
    }

    case "condition_remove":{
      const cond=String(p.condition||"").trim().toLowerCase();
      if(p.itemId){                                     // --- INSTANCE path (unchanged) ---
        const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
        const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
        if(!it)return {ok:false,reason:"no-such-item"};
        it.conditions=(it.conditions||[]).filter(c=>c!==cond);
        addLedger(w,"outcome",{kind:"item-condition",pc:t.c.name,itemId:it.id,name:it.name,condition:cond,added:false,source:src},
          "◆ "+t.c.name+"'s "+it.name+" is no longer "+cond+".");
        return {ok:true,conditions:it.conditions.slice()};
      }
      // --- CREATURE / PC path (§3) ---
      const holder=conditionHolder(w,p.target); if(!holder)return {ok:false,reason:"no-target:"+(p.target||"?")};
      if(typeof removeCondition!=="function")return {ok:false,reason:"conditions-unavailable"};
      const had=removeCondition(holder.obj,cond);
      addLedger(w,"outcome",{kind:"condition",target:p.target,name:holder.label,condition:cond,added:false,source:src},
        "◈ "+holder.label+" is no longer "+cond+".");
      return {ok:true,removed:had};
    }

    // HQ3-D1: durable PC-sheet marks (maims/curses/debts) — id/sinceDay are engine-stamped, never
    // DM-supplied; kind is a domain enum-clamp (unknown/omitted → "injury", the common fresh-wound
    // case), mirroring condition_add's cond-lowercasing posture. mechanical is a narrated-only hint,
    // never auto-enforced (v1's DM-narrated-picks posture).
    case "mark_added":{
      const t=livingSheet(w); if(!t) return {ok:false,reason:"no-pc"};
      const text=String(p.text||"").trim(); if(!text) return {ok:false,reason:"no-text"};
      const kind=(MARK_KINDS.indexOf(p.kind)>=0)?p.kind:"injury";
      const mk={ id:"mk-"+uid(), text, kind, sinceDay:clockOf(w).day };
      if(p.mechanical!=null && String(p.mechanical).trim()!=="") mk.mechanical=String(p.mechanical);
      t.sh.marks=t.sh.marks||[]; t.sh.marks.push(mk);
      addLedger(w,"outcome",{kind:"mark",pc:t.c.name,markId:mk.id,markKind:kind,text,source:src},
        "✦ "+t.c.name+" bears a lasting mark — "+text+(kind!=="injury"?(" ("+kind+")"):"")+".");
      return {ok:true, mark:mk};
    }

    case "mark_removed":{
      const t=livingSheet(w); if(!t) return {ok:false,reason:"no-pc"};
      const arr=t.sh.marks||[]; const before=arr.length;
      const gone=p.id ? arr.find(m=>m&&m.id===p.id)
                      : arr.find(m=>markText(m)===String(p.text||""));
      t.sh.marks=arr.filter(m=>m!==gone);
      if(t.sh.marks.length===before) return {ok:false,reason:"no-such-mark"};
      addLedger(w,"outcome",{kind:"mark",pc:t.c.name,removed:true,text:markText(gone),source:src},
        "✦ "+t.c.name+" is free of — "+markText(gone)+".");
      return {ok:true, removed:markText(gone)};
    }

    /* DURABILITY-TRIO.md §2 — environmental rust. `itemId` omitted rolls exposure against every carried
       instance (the DM narrates "the storm breaks over the fight" once, not per item); `itemId` given
       targets one instance. `kind` ∈ rain-combat|submersion|acid (rustQualifyingExposure). This is the
       DECLARED path for the two exposure kinds this codebase has no auto-detection signal for yet (no
       weather system exists — CLAUDE.md gotchas; no acid/slime hazard events exist either); submersion
       ALSO has a DETECTED path (world.prep's walkComplete, off a completed travel walk's rolled "water"
       leg) that calls applyRustExposure directly without this event. */
    case "item_rust_exposure":{
      if(typeof applyRustExposure!=="function")return {ok:false,reason:"durability-unavailable"};
      const kind=p.kind;
      if(typeof rustQualifyingExposure==="function" && !rustQualifyingExposure(kind))
        return {ok:false,reason:"non-qualifying-exposure",kind};
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const ids=p.itemId ? [p.itemId] : (t.sh.inventory||[]).map(it=>it.id);
      const results=ids.map(id=>applyRustExposure(w,id,kind));
      return {ok:true,results};
    }

    case "item_claimed":{                               // ITEM-LEGACY §2.1 — the single custody-transition event.
      if(typeof codexGet!=="function")return {ok:false,reason:"codex-unavailable"};
      const r=codexGet(w,p.codexId);
      if(!r || r.kind!=="item")return {ok:false,reason:"no-item-record:"+p.codexId};
      if(typeof LEGACY_LOSS_STATES==="undefined" || LEGACY_LOSS_STATES.indexOf(p.lossState)<0)
        return {ok:false,reason:"bad-loss-state:"+p.lossState};
      // §7.2 — an item_claimed on a record with no r.legacy defaults it in place first (a declared
      // claim on a plot item the PC never held is legal — a faction seizes the macguffin). Moved
      // ahead of the "cached" branch (§7.B1.4) so legacyStamp always has a record to write onto.
      if(!r.legacy){
        r.legacy={ origin:{ how:"unknown", ref:null }, claimant:{ kind:"none", ref:null, name:null },
          lastSeen:{ nodeId:null, day:(typeof clockOf==="function")?clockOf(w).day:0 }, lossState:"held",
          recoveryHookId:null, factionInterest:null, decayRef:null, instSnapshot:{ name:r.name } };
      }
      // CROWNING-BASTION.md §7.B1.4 — the Bastion unparks "cached": deposit into the world's vault.
      // Claimant becomes the bastion itself (the "bastion" claimant kind — legacyStamp writes
      // claimant whole, no enum guard exists to widen). No bastion on the books yet → refused for a
      // real reason (not the old parked-stub "bastion-parked").
      if(p.lossState==="cached"){
        if(!w.bastion) return {ok:false, reason:"no-bastion"};
        legacyStamp(w, r, { claimant:{kind:"bastion", ref:w.bastion.nodeId, name:w.bastion.name},
          lossState:"cached", lastSeen:{nodeId:w.bastion.nodeId, day:clockOf(w).day} },
          "⌂ "+r.name+" is laid up in "+w.bastion.name+"'s vault — safe, and waiting.");
        if((w.bastion.vault||[]).indexOf(r.id)<0) w.bastion.vault.push(r.id);
        // §9b — keep the resolved-name cache in lockstep with the one array it mirrors.
        w.bastion._vaultNames=w.bastion.vault.map(id=>{const rr=(typeof codexGet==="function")?codexGet(w,id):null;return rr?rr.name:id;});
        return {ok:true, codexId:r.id, lossState:"cached", cached:true, bastion:w.bastion.name};
      }
      const by=p.by||{ kind:"none", ref:null, name:null };
      // idempotence — a re-declared identical claim must not bury the drift lane (no ledger line).
      if(r.legacy.lossState===p.lossState && ((r.legacy.claimant&&r.legacy.claimant.ref)||null)===((by&&by.ref)||null))
        return {ok:true,unchanged:true};
      const at=p.at||w.currentNodeId||null;
      const day=(typeof clockOf==="function")?clockOf(w).day:0;
      // §4.3 — refresh the snapshot ONLY if the item is currently in a living sheet (else the last
      // snapshot stands — the world does not refill your wand while a goblin holds it).
      let snap=null;
      const lt=livingSheet(w);
      if(lt && lt.sh && Array.isArray(lt.sh.inventory)){
        const live=lt.sh.inventory.find(it=>it.codexId===r.id);
        if(live && typeof legacySnapshot==="function") snap=legacySnapshot(live);
      }
      // §7.4 — destroyed: claimant becomes none, hook resolves with a note, the record persists (legend).
      const destroyed=(p.lossState==="destroyed");
      const patch={ lossState:p.lossState,
        claimant: destroyed ? { kind:"none", ref:null, name:null } : { kind:by.kind||"none", ref:by.ref!=null?by.ref:null, name:by.name!=null?by.name:null },
        lastSeen:{ nodeId:at, day } };
      if(p.factionInterest!=null) patch.factionInterest=p.factionInterest;
      if(snap) patch.instSnapshot=snap;
      const prose="⚑ "+r.name+" — "+p.lossState+
        (patch.claimant.name?(" ("+patch.claimant.name+")"):(patch.claimant.kind&&patch.claimant.kind!=="none"?(" ("+patch.claimant.kind+")"):""))+".";
      if(typeof legacyStamp==="function") legacyStamp(w,r,patch,p.note||prose);
      // §2.1 step 5 — hook lifecycle. Out of "held" to a non-PC holder with no open hook → mint one;
      // to "held" by a PC with an open hook → resolve it; destroyed → resolve with a loss note.
      if(typeof legacyMintHook==="function" && typeof legacyHookWhy==="function"){
        if(destroyed){
          if(r.legacy.recoveryHookId && typeof codexUpdate==="function")
            codexUpdate(w,r.legacy.recoveryHookId,{ status:{ condition:"resolved" }, note:"lost with the item" });
        } else if(p.lossState==="held" && by.kind==="pc"){
          if(r.legacy.recoveryHookId && typeof codexUpdate==="function")
            codexUpdate(w,r.legacy.recoveryHookId,{ status:{ condition:"resolved" } });
        } else if(p.lossState!=="held" && by.kind!=="pc" && p.lossState!=="on-corpse"){
          const faction=r.legacy.factionInterest||(by.kind==="faction"?by.name:null);
          legacyMintHook(w,r,legacyHookWhy(p.lossState,r,null,faction));
        }
      }
      return {ok:true,codexId:r.id,lossState:p.lossState,claimant:r.legacy.claimant,hookId:r.legacy.recoveryHookId};
    }

    case "condition_expired":{                          // DETECTED off a round_tick — the DM narrates the lift (§3)
      const holder=conditionHolder(w,p.target); if(!holder)return {ok:false,reason:"no-target:"+(p.target||"?")};
      const cond=String(p.condition||"").trim().toLowerCase();
      if(typeof removeCondition==="function") removeCondition(holder.obj,cond);
      addLedger(w,"outcome",{kind:"condition",target:p.target,name:holder.label,condition:cond,expired:true,source:src},
        "◈ "+holder.label+" — "+cond+" ends.");
      return {ok:true};
    }

    case "round_tick":{                                 // §3: advance every combatant's condition counters at a
      if(typeof tickConditions!=="function")return {ok:false,reason:"conditions-unavailable"};   // turn boundary and
      const round=(p.round!=null)?p.round:((GS.combat&&GS.combat.round)||1), phase=p.phase||"end";  // AUTO-emit condition_expired
      const expiredAll=[];                                 // (the container the DM can't forget to close).
      const holders=[];
      const t=livingSheet(w); if(t){ t.c.conditions=t.c.conditions||[]; holders.push({obj:t.c,target:"pc",label:t.c.name}); }
      (GS.combat?(GS.combat.foes||[]):[]).forEach(f=>{ f.conditions=f.conditions||[]; holders.push({obj:f,target:f.fid,label:f.name}); });
      holders.forEach(h=>{
        const exp=tickConditions(h.obj,round,phase);
        exp.forEach(cond=>{ expiredAll.push({target:h.target,condition:cond,name:h.label});
          addLedger(w,"outcome",{kind:"condition",target:h.target,name:h.label,condition:cond,expired:true,source:"detected"},
            "◈ "+h.label+" — "+cond+" ends."); });
      });
      // §6: per-turn combat flags (disengaged/readied) clear at the turn boundary too — so Disengage
      // suppresses OAs for THIS turn's move only, never permanently (the reset hook in the no-turn-loop model).
      if(GS.combat){ [GS.combat.pc].concat(GS.combat.foes||[]).forEach(c=>{ if(c&&c.flags){ delete c.flags.disengaged; delete c.flags.readied; } }); }
      // COMBAT-LIFECYCLE.md §3e — closing finding #5 (nothing incremented GS.combat.round). Only on the
      // END of a round, and only while a fight is live: the TTL sweep above ran against the CLOSING round
      // (unchanged); a new round opens with the initiative winner acting first.
      if(GS.combat && GS.combat.active && phase==="end"){
        GS.combat.round=round+1;
        GS.combat.side=GS.combat.first;
        addLedger(w,"outcome",{kind:"round-flip",round:GS.combat.round,side:GS.combat.side,source:"detected"},
          "— Round "+GS.combat.round+"; "+(GS.combat.side==="pc"?"you act.":"the foes act."));
      }
      return {ok:true,expired:expiredAll,round,phase};
    }

    /* MONSTER-TACTICS §2 — morale: BINDING, script-rolled. `foe` = the GS.combat fid. Detects the trigger
       (moraleTrigger), refuses a re-fire of the SAME trigger for the SAME foe this fight (GS.combat.moraleFlags,
       the once-per-fight-per-side/foe memory §2), rolls the WIS save OPEN (rollMorale — undead/constructs
       auto-pass per foe.creatureType), and on a fail MECHANICALLY moves the foe: flee/rout-panic disengage the
       foe a band toward "out" (moveBand) + mark it `fled`/`routed`; surrender marks `surrendering` (opens the
       parley door — SOCIAL's parley_open is the DM's next move, not auto-fired here, so the DM still narrates
       the ask). The DM narrates HOW; the outcome itself is mechanical fact (§0 fork, LOCKED). */
    case "foe_morale":{
      if(!GS.combat)return {ok:false,reason:"no-combat"};
      if(typeof moraleTrigger!=="function"||typeof rollMorale!=="function")return {ok:false,reason:"monster-tactics-unavailable"};
      const foe=(GS.combat.foes||[]).find(f=>f.fid===p.foe); if(!foe)return {ok:false,reason:"no-such-foe"};
      const trigger=p.trigger||moraleTrigger(foe,GS.combat); if(!trigger)return {ok:false,reason:"no-trigger"};
      GS.combat.moraleFlags=GS.combat.moraleFlags||{};
      if(moraleAlreadyFired(GS.combat.moraleFlags,foe.fid,trigger))return {ok:false,reason:"already-fired"};
      GS.combat.moraleFlags=markMoraleFired(GS.combat.moraleFlags,foe.fid,trigger);
      const v=rollMorale(foe,{d20:p.d20,dispositionRoll:p.dispositionRoll});
      // WIRING-SWEEP-A §3/§4 (docs/WIRING-MAP.md items 6-7): the script ROLLS what a broken foe does
      // next — never leaves it to the DM to invent. "surrender" rolls creature-parley-wants (stashed
      // foe.parleyWant — SOCIAL's parley_open defaults p.want from this); "flee"/"rout-panic" rolls
      // monster-behavior-if-hunted (stashed foe.huntedBehavior — feeds a future chase_start caller,
      // out of this unit's scope per gap-wiring's own flagged-open STATUS SPLIT). Both null-safe.
      let parleyWant=null, huntedBehavior=null;
      if(!v.held){
        if(v.disposition==="flee"||v.disposition==="rout-panic"){
          if(typeof moveBand==="function") moveBand(foe,"farther",true); foe.fled=true; if(v.disposition==="rout-panic") foe.routed=true;
          if(typeof huntedBehaviorRoll==="function"){ const hb=huntedBehaviorRoll(); if(hb){ foe.huntedBehavior=hb.behavior; huntedBehavior=hb.behavior; } }
        }
        else if(v.disposition==="surrender"){
          foe.surrendering=true;
          if(typeof parleyWantRoll==="function"){ const pw=parleyWantRoll(); if(pw){ foe.parleyWant=pw.want; parleyWant=pw.want; } }
        }
      }
      // WIRING-SWEEP-B reconcile (docs/WIRING-MAP.md §B RECONCILES): morale-outcome's richer flavor
      // text for the same bucket (v.flavor — engine.monster-tactics' moraleOutcomeFlavor; the d6
      // bucket itself is UNCHANGED, see that function's header note). Null-safe: no flavor -> the
      // ledger line reads exactly as it did before this unit.
      addLedger(w,"outcome",{kind:"morale",foe:foe.fid,name:foe.name,trigger,dc:v.dc,autoPass:v.autoPass,natural:v.natural,total:v.total,held:v.held,disposition:v.disposition,flavor:v.flavor?v.flavor.text:null,parleyWant,huntedBehavior,source:src},
        v.autoPass?`✦ Morale (${trigger}): ${foe.name} — no fear to break (auto-passes).`
        :`✦ Morale (${trigger}, DC ${v.dc}): ${foe.name}'s nerve — ${v.natural}+... = ${v.total} — ${v.held?"holds, fights on":(v.flavor?v.flavor.text:("breaks → "+v.disposition))}${parleyWant?(" — wants: "+parleyWant):""}${huntedBehavior?(" — "+huntedBehavior):""}.`);
      // BATTLE-THEATER §4 hook site 4/6: theaterFxFromLedger maps kind:"morale" with a flee/rout-panic
      // disposition to the `flee` verb (sprint to board edge + fade) — a held/surrender morale roll
      // stays silent (the mapping function itself decides that, this call site just always fires).
      if(typeof cmTheaterNotify==="function") cmTheaterNotify("morale",{foe:foe.fid,disposition:v.disposition,held:v.held});
      // COMBAT-LIFECYCLE.md §3b: a flee/surrender/rout application is one of the three sites that can
      // change a foe's down/fled/surrendered state — check for auto-end here too.
      if(!v.held && typeof cmMaybeAutoEnd==="function") cmMaybeAutoEnd(w);
      return {ok:true, held:v.held, dc:v.dc, disposition:v.disposition, autoPass:v.autoPass, flavor:v.flavor?v.flavor.text:null, parleyWant, huntedBehavior};
    }

    /* MONSTER-TACTICS §3 — trash autoplay. `foe` = the GS.combat fid. Refuses a foe that isn't
       autoplayEligible (boss / custom-table / dm.noAutoplay / CR too high) so the DM never gets a silent
       no-op mistaken for a resolved turn. Composes resolveFoeTurn (proposeTactic + the built resolver) into
       ONE open-rolled result and, on a hit, routes the damage through the SAME hp_changed event a PC-received
       hit uses (concentration/death-save wiring stays consistent). */
    case "foe_action":{
      if(!GS.combat)return {ok:false,reason:"no-combat"};
      if(typeof autoplayEligible!=="function"||typeof resolveFoeTurn!=="function")return {ok:false,reason:"monster-tactics-unavailable"};
      const foe=(GS.combat.foes||[]).find(f=>f.fid===p.foe); if(!foe)return {ok:false,reason:"no-such-foe"};
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const targetAC=(t.sh.ac!=null)?t.sh.ac:10;
      // COMBAT-LIFECYCLE.md §5: p.action (a name or 0-based index from the foe's stat block) BYPASSES the
      // autoplay-eligibility gate — the DM picks the VERB for a non-trash foe (reading digest.combat.
      // proposals), the script still owns every die (resolveAttack, same math autoplay uses). Without
      // p.action, behavior stays byte-identical to the pre-existing not-autoplay-eligible contract.
      if(p.action!=null){
        const actions=foe.actions||[];
        const chosen=(typeof p.action==="number")?actions[p.action]
          :actions.find(a=>a&&a.name&&a.name.toLowerCase()===String(p.action).toLowerCase());
        if(!chosen||!chosen.dmg)return {ok:false,reason:"no-resolvable-action"};
        const res=resolveAttack({atkBonus:chosen.atk||0,targetAC,dmg:chosen.dmg,attacker:foe,target:GS.combat.pc,
          range:chosen.kind==="ranged"?"ranged":"melee"});
        // CRIT-MAGNITUDE (2026-07-03): a foe's own natural 20/1 spikes the same magnitude die — the ledger
        // line names it so a nasty foe crit reads as dangerous as it is.
        const critTag=res.crit&&res.magnitude?(" (magnitude "+res.magnitude.magnitude+")"):"";
        addLedger(w,"outcome",{kind:"foe-turn",foe:foe.fid,name:foe.name,action:chosen.name||null,hit:res.hit,damage:res.damage,
          natural:res.natural,total:res.total,targetAC:res.targetAC,crit:res.crit,
          magnitude:res.magnitude?res.magnitude.magnitude:null,tier:res.magnitude?res.magnitude.tier:null,source:src},
          "⚔ "+foe.name+" — "+(res.hit?("hits with "+(chosen.name||"an attack")+critTag+" for "+res.damage+" damage"):"misses"+critTag)+".");
        // BATTLE-THEATER §4 hook site 3a/6: theaterFxFromLedger maps kind:"foe-turn" to `strike` (the
        // foe swinging at the PC — miss=overshoot per §4's letter, same as the PC's own `attack`).
        if(typeof cmTheaterNotify==="function") cmTheaterNotify("foe-turn",{fid:foe.fid,hit:res.hit,crit:res.crit,magnitude:res.magnitude?res.magnitude.magnitude:null});
        if(res.hit && res.damage>0) applyEvent(w,{type:"hp_changed",payload:{delta:-res.damage,crit:res.crit},source:"detected"});
        // a foe crit's magnitude rides crit_outcome too — target:"pc" so a magnitude>=8 killing blow
        // against the PC resolves through the SAME obliteration gate (confirmed down + magnitude>=8).
        if(res.magnitude && typeof applyEvent==="function"){
          applyEvent(w, {type:"crit_outcome", payload:Object.assign({target:"pc"}, res.magnitude), source:src});
        }
        // COMBAT-LIFECYCLE.md §3b: foe_action is one of the three named auto-end detection sites — a
        // future self-damage path (a reckless/risky action that can down its own actor) routes through
        // here too. No-op today (no such path exists yet), matches every foe's own attack never harming
        // itself, but the check is cheap and keeps this site wired per the spec's letter.
        if(typeof cmMaybeAutoEnd==="function") cmMaybeAutoEnd(w);
        return {ok:true, attack:res, actionName:chosen.name||null};
      }
      if(!autoplayEligible(foe))return {ok:false,reason:"not-autoplay-eligible"};
      const r=resolveFoeTurn(foe,GS.combat,{ac:targetAC});
      if(!r.attack){
        addLedger(w,"outcome",{kind:"foe-turn",foe:foe.fid,name:foe.name,resolvable:false,proposal:r.proposal,source:src},
          `⚔ ${foe.name} — ${(r.proposal&&r.proposal.rationale)||"acts"} (no resolvable attack — the DM narrates).`);
        return {ok:true, proposal:r.proposal, attack:null};
      }
      const res=r.attack;
      // CRIT-MAGNITUDE (2026-07-03): same magnitude threading as the p.action-bypass branch above —
      // resolveFoeTurn calls resolveAttack directly, so res.magnitude is already populated.
      const critTag=res.crit&&res.magnitude?(" (magnitude "+res.magnitude.magnitude+")"):"";
      addLedger(w,"outcome",{kind:"foe-turn",foe:foe.fid,name:foe.name,action:r.actionName,hit:res.hit,damage:res.damage,
        natural:res.natural,total:res.total,targetAC:res.targetAC,proposal:r.proposal,crit:res.crit,
        magnitude:res.magnitude?res.magnitude.magnitude:null,tier:res.magnitude?res.magnitude.tier:null,source:src},
        "⚔ "+foe.name+" — "+(res.hit?("hits with "+(r.actionName||"an attack")+critTag+" for "+res.damage+" damage"):"misses"+critTag)+".");
      // BATTLE-THEATER §4 hook site 3b/6: same mapping as the p.action-bypass path above, for the
      // autoplay resolution branch.
      if(typeof cmTheaterNotify==="function") cmTheaterNotify("foe-turn",{fid:foe.fid,hit:res.hit,crit:res.crit,magnitude:res.magnitude?res.magnitude.magnitude:null});
      if(res.hit && res.damage>0) applyEvent(w,{type:"hp_changed",payload:{delta:-res.damage,crit:res.crit},source:"detected"});
      if(res.magnitude && typeof applyEvent==="function"){
        applyEvent(w, {type:"crit_outcome", payload:Object.assign({target:"pc"}, res.magnitude), source:src});
      }
      return {ok:true, proposal:r.proposal, attack:res};
    }

    case "equip":{                                    // sheet.equipped = {mainHand,offHand,armor} — NAMED
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // slots, not a single pointer, so dual-wield (main+off) is real
      if(EQUIP_SLOTS.indexOf(p.slot)<0)return {ok:false,reason:"bad-slot"};
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      // the slot must fit the item KIND so the slot can't hold nonsense (armor in a hand, a sword as
      // body armor) — checked only for INDEXED items; an unindexed/flavor item is allowed anywhere
      // (we don't know its kind, and refusing it would block legit improvised gear).
      const def=(typeof baseDef==="function")?baseDef(it):((typeof itemDef==="function")?itemDef(it.name):null);  // CONGRUENCE: a magic weapon validates off its base kind
      if(def){ const k=def.kind;
        const ok=(p.slot==="armor")?(k==="armor"||k==="shield"):(k==="weapon"||k==="shield"); // hands take weapons (or a shield off-hand)
        if(!ok)return {ok:false,reason:"slot-kind-mismatch",kind:k,slot:p.slot}; }
      t.sh.equipped=t.sh.equipped||{mainHand:null,offHand:null,armor:null};
      t.sh.equipped[p.slot]=it.id;
      const ac=(typeof cmSheetAC==="function")?(t.sh.ac=cmSheetAC(t.sh)):null;  // re-derive AC from armor + bonuses (docs/ITEMS.md)
      addLedger(w,"outcome",{kind:"equip",pc:t.c.name,slot:p.slot,itemId:it.id,name:it.name,ac:ac,source:src},
        "◆ "+t.c.name+" equips "+it.name+" ("+p.slot+")"+(ac!=null?" — AC "+ac:"")+".");
      return {ok:true,equipped:Object.assign({},t.sh.equipped),ac:ac};
    }

    case "unequip":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      if(EQUIP_SLOTS.indexOf(p.slot)<0)return {ok:false,reason:"bad-slot"};
      t.sh.equipped=t.sh.equipped||{mainHand:null,offHand:null,armor:null};
      const hadId=t.sh.equipped[p.slot]; t.sh.equipped[p.slot]=null;
      const ac=(typeof cmSheetAC==="function")?(t.sh.ac=cmSheetAC(t.sh)):null;
      if(hadId){ const it=(t.sh.inventory||[]).find(x=>x.id===hadId);
        addLedger(w,"outcome",{kind:"equip",pc:t.c.name,slot:p.slot,itemId:hadId,name:it?it.name:null,ac:ac,source:src},
          "◆ "+t.c.name+" unequips "+(it?it.name:"something")+" ("+p.slot+")"+(ac!=null?" — AC "+ac:"")+"."); }
      return {ok:true,equipped:Object.assign({},t.sh.equipped),ac:ac};
    }

    case "set_grip":{                                // VERSATILE GRIP (docs/ITEMS.md Decision 1) — the player's
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // explicit one-/two-handed wield choice for a Versatile main-hand.
      const grip=(p.grip==="1h")?"1h":"2h";
      t.sh.equipped=t.sh.equipped||{mainHand:null,offHand:null,armor:null};
      if(grip==="2h" && t.sh.equipped.offHand)return {ok:false,reason:"off-hand-occupied"};  // can't two-hand with a full off-hand
      t.sh.equipped.grip=grip;
      const mainId=t.sh.equipped.mainHand, main=mainId&&(t.sh.inventory||[]).find(x=>x.id===mainId);
      addLedger(w,"outcome",{kind:"grip",pc:t.c.name,grip:grip,name:main?main.name:null,source:src},
        "◆ "+t.c.name+" grips "+(main?main.name:"the weapon")+" "+(grip==="2h"?"in both hands":"one-handed")+".");
      return {ok:true,grip:grip};
    }

    case "attune":{                                  // ATTUNEMENT (docs/ITEMS.md §E) — bind to a magic item; the
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // SRD max-3 cap is enforced here. An item's magic is dormant until attuned.
      const sh=t.sh; const it=(sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      const ench=(typeof enchOf==="function")?enchOf(it):(it.ench||null);
      if(!ench||!ench.attunement)return {ok:false,reason:"no-attunement-needed",name:it.name};  // mundane / non-attunement item
      if(it.attuned)return {ok:true,already:true,attuned:true};
      const count=(typeof attunedCount==="function")?attunedCount(sh.inventory):(sh.inventory||[]).filter(x=>x.attuned).length;
      if(count>=3)return {ok:false,reason:"attunement-cap",cap:3,attuned:count};                // the anti-Christmas-tree rule
      it.ench=it.ench||Object.assign({},ench); it.attuned=true;    // materialize the overlay on the instance so the state sticks
      const ac=(typeof cmSheetAC==="function")?(sh.ac=cmSheetAC(sh)):null;    // an attuned +AC item changes the sheet AC
      addLedger(w,"outcome",{kind:"attune",pc:t.c.name,itemId:it.id,name:it.name,attuned:true,ac:ac,source:src},
        "◈ "+t.c.name+" attunes to "+it.name+((count+1>=3)?" (3/3 — attunement is full)":"")+(ac!=null?" — AC "+ac:"")+".");
      return {ok:true,attuned:true,slotsUsed:count+1};
    }

    case "unattune":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      it.attuned=false;
      const ac=(typeof cmSheetAC==="function")?(t.sh.ac=cmSheetAC(t.sh)):null;
      addLedger(w,"outcome",{kind:"attune",pc:t.c.name,itemId:it.id,name:it.name,attuned:false,ac:ac,source:src},
        "◈ "+t.c.name+" ends attunement to "+it.name+(ac!=null?" — AC "+ac:"")+".");
      return {ok:true,attuned:false};
    }

    case "fact_canonized":
      addLedger(w,"canon",{factId:p.factId,what:p.what,source:src},
        p.what?("◆ "+p.what):("Canon fact recorded: "+(p.factId||"?")));
      grantXp(w,"fact_canonized",p);
      return {ok:true};

    /* ---- CODEX (docs/CODEX.md): the relational entity store. The script owns it; the DM only emits. ---- */
    case "codex_add":{                               // mint/merge an NPC/Location/Item/Faction record
      if(typeof codexAdd!=="function") return {ok:false,reason:"codex-unavailable"};
      // ROOT-C (F-07/BUG-11): an id-less mint whose derived id lands on an ESTABLISHED record
      // (known to the player, or hard canon) is REFUSED, never silently merged — a warm DM minting
      // a new "Ospra" must not overwrite the established one. The structured `existing` makes the
      // fix a one-turn self-correction: merge intent → codex_update {id}; a distinct entity →
      // a distinguishing name or an explicit id. Soft+unknown records still merge (the designed
      // recontextualizable pool). Explicit-id adds still merge (explicit id = explicit intent);
      // codexAdd itself now drift-ledgers any content-bearing merge onto an established record.
      if(!p.id && typeof codexGet==="function" && typeof codexKeyId==="function"){
        const ex=codexGet(w, codexKeyId(p.kind, p.name));
        if(ex && (ex.status.known || ex.status.soft===false))
          return {ok:false, reason:"id-collision", existing:{id:ex.id, kind:ex.kind, name:ex.name, known:!!ex.status.known}};
      }
      const r=codexAdd(w,p); return {ok:true, id:r.id};
    }
    case "codex_link":{                              // typed relationship (wikilink)
      if(typeof codexLink!=="function") return {ok:false,reason:"codex-unavailable"};
      codexLink(w,p.from,p.rel,p.to); return {ok:true};
    }
    case "codex_update":{                            // revise interpreted fields / status (condition, at, …)
      if(typeof codexUpdate!=="function") return {ok:false,reason:"codex-unavailable"};
      const r=codexUpdate(w,p.id,p);
      return r?{ok:true, id:r.id}:{ok:false, reason:"no-record:"+(p.id||"?")};   // ROOT-C (BUG-13): a bare {ok:false} read as an ordinary refusal is how this class hid
    }
    case "animal_interview":{                         // ANIMAL-SOCIAL.md §2/§6 U4 — open/close the witness channel
      const r=codexGet(w,p.id);
      if(!r || r.kind!=="npc" || !(r.dm && r.dm.partialKind==="animal")) return {ok:false, reason:"not-an-animal:"+(p.id||"?")};
      r.dm.interviewOpen = !!p.open;
      return {ok:true, id:r.id, interviewOpen:r.dm.interviewOpen};
    }
    case "codex_reveal":{                            // slow drip — the player now knows of this entity
      if(typeof codexReveal!=="function") return {ok:false,reason:"codex-unavailable"};
      codexReveal(w,p.id); reveal(w,'gaz'); return {ok:true};
    }
    case "codex_contact":{                           // player TOUCHED it → lock to canon forever (§8b)
      if(typeof codexContact!=="function") return {ok:false,reason:"codex-unavailable"};
      const r=codexContact(w,p.id);
      if(r) addLedger(w,"canon",{kind:"codex-contact",id:p.id,source:"play"},`◆ ${r.name} — encountered; locked to canon.`);
      // NPC-PRESENCE-AND-HOOKS.md Component 3.2 — demand-driven hook discovery, fired on this real
      // "player touched an ambient NPC" seam (never pre-rolled at mint). ONE attempt ever per record
      // (r.dm.discoveryRolled), so a repeat contact call never re-rolls; a hook already present
      // (guaranteed-scene-hook beat discovery to it) reports found:true/preExisting instead of
      // double-hooking. Partials (children/animals — r.dm.partial) are OUT OF SCOPE here: their own
      // hook-analogs (dm.saw/dm.tell) were already resolved at rollPartial() mint time, per
      // NPC-PARTIALS.md — never a second, unrelated npc-hook d300 draw on top.
      let discovery=null;
      if(r && r.kind==="npc" && !r.dm.partial){
        r.dm=r.dm||{};
        if(!r.dm.discoveryRolled){
          r.dm.discoveryRolled=true;
          discovery=(typeof hookDiscoveryRoll==="function") ? hookDiscoveryRoll(w, r) : {found:false};
        }
      }
      // Component 4's "engage threshold" — the DM-declared signal (accepted/acted on/pursued the
      // hook) that promotes a touched NPC from "discovered-not-engaged" to "touched & kept" for
      // world.wiring-a's turnIgnoredCheck (ignoredTierOf). Settable regardless of whether a hook
      // exists (the doc's own "HOOKLESS tracked thread" case) — never gated on discovery's outcome.
      if(r && r.kind==="npc" && p.engaged){ r.dm=r.dm||{}; r.dm.engaged=true; }
      // ANIMAL-SOCIAL.md §4/§6 U5 — "engaged twice" is one of the three promotion triggers. Every
      // real codex_contact on an animal partial counts as one engagement (this IS the "player
      // touched it" seam the whole promotion track hangs off), regardless of the p.engaged flag —
      // animalMaybePromote is the single gate that decides whether count>=2 actually promotes.
      if(r && r.kind==="npc" && r.dm && r.dm.partialKind==="animal"){
        r.dm.animalContactCount=(r.dm.animalContactCount||0)+1;
        if(typeof animalMaybePromote==="function") animalMaybePromote(w, r, "engaged-twice");
      }
      const out={ok:!!r};
      if(discovery) out.discovery=discovery;
      return out;
    }

    /* ---- SOCIAL (docs/SOCIAL.md §5): attitude / parley / morale — the social analog of combat. The DM
       DECLARES the open roll (skill + total + visible levers); the SCRIPT prices the DC from CURRENT
       attitude (§2) and COMPUTES the shift — the DM can only report the dice, never inflate the result
       (§5 anti-drift). Committed only through the codex writers; the DM narrates TO the returned delta. ---- */
    case "social_check":{                            // declared open roll → resolver → committed attitude shift
      if(typeof resolveSocialCheck!=="function"||typeof codexGetAttitude!=="function") return {ok:false,reason:"social-unavailable"};
      const a=codexGetAttitude(w,p.target); if(!a) return {ok:false,reason:"no-target:"+(p.target||"?")};
      const rec0=codexGet(w,p.target);
      const levers=(p.levers||(p.lever?[p.lever]:[])).slice();
      // MONSTER-PARLEY §1 (REVIEW-FIXES-0705 U4) — auto-merge the creature's OWN story-derived levers
      // (its intrinsic want/fear, a table-rolled fact) into the DM-declared ones. Engine owns the noun;
      // the DM still owns the roll (§5 anti-drift — this is advisory, never an enforcement gate). Dedupe
      // by the lever key applyLeverage actually prices (SOCIAL_LEVER_MODS' `type`) — a DM-declared lever
      // of the same key wins (no double-pricing); only NEW derived keys get appended. NPCs are untouched.
      let leversDerivedKeys=[];
      if(rec0 && rec0.kind==="creature" && typeof creatureLevers==="function"){
        const declaredKeys=new Set(levers.map(l=>(typeof l==="string")?l:(l&&l.type)));
        const derived=creatureLevers(rec0);
        derived.forEach(d=>{ if(d && d.type && !declaredKeys.has(d.type)){ levers.push(d); declaredKeys.add(d.type); leversDerivedKeys.push(d.type); } });
      }
      // §S2 FICTION-DC THREADING (BUG-18): when the DM supplies the DC it narrated, that DC is
      // FINAL for grading — no leverage re-pricing on top (the narrated DC already priced the scene;
      // re-discounting is how 18-vs-20 promoted a sergeant, Run 4 T6). Declared/derived DECISIVE levers
      // still auto-shift (the lever IS the answer — independent of any DC, social.js §2.1). Terminal
      // attitude (+2 → socialDC null) still wins over everything. Absent/garbled dc → the internal
      // ladder exactly as before.
      const baseDC=socialDC(a.value);
      // p.dc is now a number or null (coerced in dmFoldPayload, num:["dc"]) — the clamp is social_check's
      // own business, stays (HQ2-1-TOPUP retirement of the hand-rolled isFinite(Number(...)) coercion).
      const fdc=(p.dc!=null) ? Math.max(SOCIAL_DC_FLOOR, Math.min(SOCIAL_DC_CEIL, Math.round(p.dc))) : null;
      const lev=(fdc!=null && baseDC!=null)
        ? { dc:fdc, autoShift:levers.some(l=>l&&typeof l==="object"&&!!l.decisive), mod:0, dcSource:"dm" }
        : applyLeverage(baseDC, levers);
      const clk=clockOf(w).day;
      let res;
      if(lev.terminal && !lev.autoShift){            // already at max friendliness — no rung to climb (§2)
        res={outcome:"already-max", from:a.value, to:a.value, shift:0, terrified:false, granted:true};
      } else if(lev.autoShift){                       // decisive leverage — the lever IS the answer, no roll (§2.1)
        const to=attitudeClampInt(a.value+1, a.floor, a.ceiling);
        res={outcome:"auto-shift", from:a.value, to, shift:to-a.value, terrified:false, granted:true};
      } else {
        res=resolveSocialCheck({ value:a.value, floor:a.floor, ceiling:a.ceiling, skill:p.skill,
          total:p.total, dc:lev.dc, caughtLie:p.caughtLie, overshoot:p.overshoot });
      }
      // ANOMALY LAW §2b.1 — THE GRIND CEILING: for kind:"creature" records, an attitude shift earned by
      // ORDINARY means (plain resolveSocialCheck success, OR the decisive-lever auto-shift) clamps at +1
      // (Friendly) — +2 (Helpful, the recruit_creature gate) is unreachable by plain check-grinding or
      // leverage alone, whatever the rolls say. The ONLY way past the clamp for that one shift is a nat-20
      // (declared via p.natural===20, checked below — the crit-magnitude "the wolf decides about you"
      // moment) — that anomaly both lifts the clamp for this shift AND stamps bondEligible. A decisive
      // lever landing exactly on +1 also stamps bondEligible (the lever WAS the bond) but does NOT itself
      // lift the clamp past +1 (only nat-20 does that) — see the bondEligible stamps below. NPCs are
      // completely untouched (this whole block is gated on rec0.kind==="creature"); the resolver math in
      // engine.social stays byte-identical either way (Adam, 2026-07-05: "difficult af").
      const isCreature = !!(rec0 && rec0.kind==="creature");
      const natAnomaly = isCreature && p.natural===20;
      if(isCreature && !natAnomaly && res.to>1 && res.to>res.from){
        res.to = 1;
        res.shift = res.to - res.from;
      }
      // ANIMAL-SOCIAL.md §3/§6 U3 — the Helpful (+2) gate for animal partials (kind:"npc",
      // rec0.dm.partialKind==="animal", minted by rollPartial/prepCastEnvAnimals). Same SHAPE as the
      // Anomaly Law's creature grind-ceiling directly above (ordinary shifts clamp at +1/Friendly) but a
      // DIFFERENT unlock channel: no nat-20, only the sustained-care track (fields.care, ticked by the
      // `animal_care` event below) OR the RESOLVED ruling-2 bypass (a declared animal-friendship-class
      // spell, or a caller-flagged strong-Charisma result — p.animalFriendshipSpell / p.strongCha).
      // animalHelpfulAllowed is pure (src/engine/social.js); this block only reads/clamps, never writes
      // fields.care itself (that's the dedicated event's job, so care is never inflated by a social win).
      // MUST run before the codexSetAttitude commit below — a clamp applied after the write is a no-op.
      const isAnimalPartial = !!(rec0 && rec0.dm && rec0.dm.partialKind==="animal");
      if(isAnimalPartial && typeof animalHelpfulAllowed==="function"){
        const careCount = (rec0.fields && rec0.fields.care) || 0;
        const allowed = animalHelpfulAllowed(careCount, { animalFriendshipSpell:p.animalFriendshipSpell, strongCha:p.strongCha });
        if(!allowed && res.to>1 && res.to>res.from){
          res.to = 1;
          res.shift = res.to - res.from;
        }
      }
      if(res.terrified) codexSetTerrified(w,p.target,true,clk);
      else if(res.to!==res.from) codexSetAttitude(w,p.target,res.to,p.cause||p.skill||"social",clk);
      // ANIMAL-SOCIAL.md §3/§4/§6 U5 — Terrified-overshoot cruelty memory: the node itself remembers
      // (§3 "the farm dogs talk") — mark it so every animal MINTED at this node from now on opens
      // one step colder (prepCastEnvAnimals/prepCastAmbientScene read `node.animalCruelty`). Animal-
      // only; NPCs/creatures untouched.
      if(res.terrified && isAnimalPartial){
        const atNode=rec0.status && rec0.status.at;
        const nn=(atNode && typeof mapOf==="function") ? mapOf(w).nodes[atNode] : null;
        if(nn) nn.animalCruelty=true;
      }
      // ANIMAL-SOCIAL.md §4/§6 U5 — the +2 (Helpful) ally gate: stamp dm.ally + promote to a full
      // codex record (attitude>0 is itself a promotion trigger — animalMaybePromote reads the
      // just-committed attitude). Only fires on the SHIFT that actually LANDS on +2, never re-stamps.
      if(isAnimalPartial && res.to===2 && res.to!==res.from){
        rec0.dm=rec0.dm||{}; rec0.dm.ally=true;
      }
      if(isAnimalPartial && res.to!==res.from && res.to>0 && typeof animalMaybePromote==="function"){
        animalMaybePromote(w, rec0, "attitude-past-zero");
      }
      // ANIMAL-SOCIAL.md §5/§6 U6 — pack-tag shared attitude: propagate this shift to every OTHER
      // pack-tagged animal at the same node (never cross-node). No-op for solitary-tagged/non-animal
      // records (animalPropagatePackAttitude's own packTag guard).
      if(isAnimalPartial && res.to!==res.from && typeof animalPropagatePackAttitude==="function"){
        animalPropagatePackAttitude(w, rec0, res.to, p.cause||p.skill||"pack-attitude");
      }
      // ANOMALY LAW §2b.2 — bondEligible is stamped ONLY by the anomaly channels: a nat-20 on this check,
      // or a decisive lever that just cashed the shift to +1 (Friendly) exactly. Never by ordinary
      // grinding. NPCs never carry/consult this field (recruit_creature's own gate is creature-only).
      if(isCreature && rec0){
        rec0.fields = rec0.fields || {};
        if(natAnomaly && res.to!==res.from) rec0.fields.bondEligible = true;
        else if(lev.autoShift && res.to===1 && res.to!==res.from) rec0.fields.bondEligible = true;
      }
      const rec=codexGet(w,p.target), nm=rec?rec.name:p.target;
      const verb = res.terrified?"is cowed by fear"
        : res.outcome==="wall"?"will not be moved — a wall"
        : res.shift>0?"warms":(res.shift<0?"hardens":"holds");
      addLedger(w,"outcome",Object.assign({kind:"social",target:p.target,name:nm,skill:p.skill,from:res.from,to:res.to,
        outcome:res.outcome,granted:res.granted,leverMod:lev.mod,dc:lev.dc,source:src},
        // U4: surface the engine's auto-merged creature levers so playtests can see its contribution;
        // sparse-key convention (omit when empty — the overwhelming common case, NPCs and lever-less creatures).
        leversDerivedKeys.length?{leversDerived:leversDerivedKeys}:null,
        // §S2: DC provenance — absent on the engine-DC path, "dm" on the fiction path (playtest
        // ledgers can now tell which DC graded a shift).
        lev.dcSource?{dcSource:lev.dcSource}:null),
        `✦ ${nm} ${verb} — ${attitudeLabel(res.from)} → ${attitudeLabel(res.to)}${res.granted?" (ask granted)":" (refused)"}.`);
      // REPUTATION.md §1: a DECISIVE social outcome (fully won-over to the ceiling, fully turned to the
      // floor, or terrified) is a small deed — attributed to the target's own faction (repuFactionOf), a
      // fraction of the combat unit (social stakes read lighter than a fight). Ordinary rung-shifts don't
      // price renown — only the decisive endpoints. The ceiling/floor legs additionally require
      // `res.shift!==0` (an actual movement TO that endpoint this roll) — a review caught the
      // "already-max"/already-at-floor no-op (shift:0, outcome "already-max"/"capped"/"wall") pricing a
      // conversation that changed nothing. `terrified` is intentionally exempt from that gate: per
      // resolveSocialCheck's own contract, fear is real even when the NPC's floor keeps shift at 0.
      if(typeof repuApplyDeed==="function" && (res.terrified || (res.shift!==0 && (res.to===a.ceiling || res.to===a.floor)))){
        const fk=(typeof repuFactionOf==="function")?repuFactionOf(w,p.target):null;
        if(fk){
          const sign=res.terrified?-1:(res.to===a.ceiling?1:-1);
          repuApplyDeed(w,{ weight:sign*0.25*repuUnit(w), factionKey:fk,
            deedRef:"social_check:"+p.target, source:"social_check" });
        }
      }
      return {ok:true, from:res.from, to:res.to, shift:res.shift, outcome:res.outcome, granted:res.granted, terrified:res.terrified, dc:lev.dc};
    }
    case "attitude_shift":{                          // a DECLARED shift (group cascade / story beat) or a DETECTED one — absolute set
      if(typeof codexSetAttitude!=="function"||typeof codexGetAttitude!=="function") return {ok:false,reason:"social-unavailable"};
      const a=codexGetAttitude(w,p.target); if(!a) return {ok:false,reason:"no-target:"+(p.target||"?")};
      if(p.to==null) return {ok:false,reason:"no-target-attitude"};   // a shift with no destination is malformed — don't echo a no-op canon line
      const toInt=(typeof attitudeParse==="function")?attitudeParse(p.to):p.to;   // §S1: strings→ints; raw ints pass
      if(toInt==null) return {ok:false,reason:"bad-attitude:"+p.to};              // unknown word refuses LOUD, never silent-0
      const r=codexSetAttitude(w,p.target,toInt,p.cause||"shift",clockOf(w).day);
      const rec=codexGet(w,p.target), nm=rec?rec.name:p.target;
      addLedger(w,"outcome",{kind:"social",target:p.target,name:nm,from:a.value,to:r.value,cause:p.cause||null,source:src},
        `✦ ${nm} — ${attitudeLabel(a.value)} → ${attitudeLabel(r.value)}${p.cause?(" ("+p.cause+")"):""}.`);
      // ANIMAL-SOCIAL.md §4/§6 U5 — a DECLARED shift (group cascade / story beat) can also cross the
      // promotion/ally thresholds for an animal partial, same as an ordinary social_check.
      if(rec && rec.kind==="npc" && rec.dm && rec.dm.partialKind==="animal" && r.value!==a.value){
        if(r.value===2) rec.dm.ally=true;
        if(r.value>0 && typeof animalMaybePromote==="function") animalMaybePromote(w, rec, "attitude-past-zero");
        // ANIMAL-SOCIAL.md §5/§6 U6 — same pack-tag propagation as social_check, for a DECLARED shift.
        if(typeof animalPropagatePackAttitude==="function") animalPropagatePackAttitude(w, rec, r.value, p.cause||"pack-attitude");
      }
      return {ok:true, from:a.value, to:r.value};
    }
    /* ANIMAL-SOCIAL.md §3/§6 U3 — the sustained-care track: fields.care is a DISTINCT-VISIT counter
       (never a per-check tick — feeding an animal three times in one scene is still ONE visit; a
       "visit" is deduped by in-world DAY, the same grain codex/clock already use). Only fed/tended/
       defended events tick it (p.event names the care kind, informational — the counter doesn't
       branch on WHICH care event, per §3's flat "feed/tend/defend" list). This is the ONLY writer of
       fields.care — the social_check Helpful-gate above only READS it, so a social win never inflates
       the counter on its own. Null-safe: no codex/target -> {ok:false}. */
    case "animal_care":{
      if(typeof codexGet!=="function") return {ok:false,reason:"codex-unavailable"};
      const r=codexGet(w,p.target); if(!r) return {ok:false,reason:"no-target:"+(p.target||"?")};
      r.fields=r.fields||{};
      r.fields.careLog=r.fields.careLog||[];
      const day=clockOf(w).day;
      const already=r.fields.careLog.indexOf(day)!==-1;
      if(!already){ r.fields.careLog.push(day); r.fields.care=r.fields.careLog.length; }
      else { r.fields.care=r.fields.careLog.length; }
      addLedger(w,"outcome",{kind:"animal-care",target:p.target,event:p.event||null,day,care:r.fields.care,distinct:!already,source:src},
        `✦ ${r.name||p.target} — cared for (${p.event||"tended"}); ${r.fields.care} distinct visit(s) so far.`);
      return {ok:true, care:r.fields.care, distinct:!already};
    }
    case "morale_check":{                            // the DM rolls the creature's Wis save in the OPEN; the script verdicts held/broke
      if(typeof resolveMorale!=="function") return {ok:false,reason:"social-unavailable"};
      const dc=(p.dc!=null)?p.dc:moraleDC(p.trigger,p.mods);
      const v=resolveMorale({save:p.save,dc});
      const route=v.held?"fights-on":(p.outcome||null);   // broke → DM supplies the Morale Outcome route (flee/surrender/parley)
      addLedger(w,"outcome",{kind:"morale",creature:p.creature||null,trigger:p.trigger,dc,save:p.save,held:v.held,outcome:route,source:src},
        `✦ Morale (${p.trigger||"?"}, DC ${dc}): ${p.creature||"the creature"} ${v.held?"holds — fights on":("breaks → "+(route||"routs"))}.`);
      return {ok:true, held:v.held, dc, outcome:route};
    }
    case "parley_open":{                             // open the §2 loop on a creature/NPC — stamp the rolled opening ONCE (§1.1)
      if(typeof codexAttitudeOpen!=="function") return {ok:false,reason:"social-unavailable"};
      const target=p.target||p.npc||p.creature;
      // REPUTATION.md §3: renown seeds the opening — a faction member's opening attitude shifts by
      // repuOpeningAttitudeShift (caps +-2), clamped back into the DM-declared/default open. Pure read;
      // never overrides an already-open attitude (codexAttitudeOpen's own refuse-to-overwrite guards that).
      let opening=(p.openingAttitude!=null?p.openingAttitude:0);
      if(typeof repuFactionOf==="function" && typeof repuOpeningAttitudeShift==="function"){
        const fk=repuFactionOf(w,target);
        if(fk) opening=attitudeClampInt(opening+repuOpeningAttitudeShift(w,fk), ATTITUDE_MIN, ATTITUDE_MAX);
      }
      const a=codexAttitudeOpen(w,target,opening,
        {cause:"parley",clock:clockOf(w).day,floor:p.floor,ceiling:p.ceiling});
      if(!a) return {ok:false,reason:"no-target:"+(target||"?")};
      // WIRING-SWEEP-A §3 (docs/WIRING-MAP.md item 6): a want the DM doesn't explicitly supply
      // defaults from the SCRIPT's own rolled fact — the live GS.combat foe's stashed parleyWant
      // (set by foe_morale the instant this foe broke to "surrender") — never a DM-invented want.
      // Byte-identical to before when p.want IS supplied, or when no matching live foe carries one.
      // `target` here is a CODEX id (it feeds codexAttitudeOpen/codexGet/repuFactionOf above), not
      // necessarily the raw combat fid — mirror the established multi-key match at dm.js:616 so a
      // foe parleyed by codex id (the normal path) still resolves its stashed want.
      let want=p.want;
      if(want==null && GS.combat){
        const foe=(GS.combat.foes||[]).find(f=>f.fid===target || f.codexId===target || f.name===target);
        if(foe && foe.parleyWant) want=foe.parleyWant;
      }
      const rec=codexGet(w,target), nm=rec?rec.name:target;
      addLedger(w,"outcome",{kind:"parley",target,name:nm,want:want||null,opening:a.value,source:src},
        `✦ Parley — ${nm} opens ${attitudeLabel(a.value)}${want?(", wants: "+want):""}.`);
      return {ok:true, opening:a.value, want:want||null};
    }
    case "insight_read":{                            // §6 — the PLAYER's open Insight roll vs the (hidden) scaled DC reveals current attitude
      if(typeof insightReadDC!=="function"||typeof codexMarkAttitudeRead!=="function") return {ok:false,reason:"social-unavailable"};
      const a=codexGetAttitude(w,p.target); if(!a) return {ok:false,reason:"no-target:"+(p.target||"?")};
      // p.dc/p.total/p.bestMentalMod are now numbers or null (coerced in dmFoldPayload, num:["dc","total",
      // "bestMentalMod"]) — HQ2-1-TOPUP retirement of the ad-hoc Number(p.total)||0.
      const dc=(p.dc!=null)?p.dc:insightReadDC({guarded:p.guarded,masking:p.masking,mentalMods:p.mentalMods,bestMentalMod:p.bestMentalMod});
      const read=(p.total||0)>=dc;
      if(read) codexMarkAttitudeRead(w,p.target,true);       // flips the player-view tell on (codexPlayerView gates on known && read)
      const rec=codexGet(w,p.target), nm=rec?rec.name:p.target;
      addLedger(w,"outcome",{kind:"insight",target:p.target,name:nm,dc,total:p.total,read,source:src},
        read?`✦ ${nm} — you read their disposition: ${attitudeLabel(a.value)}.`:`✦ ${nm} — you can't get a clear read on them.`);
      return {ok:true, read, dc, attitude: read?{value:a.value, label:attitudeLabel(a.value)}:null};
    }

    case "discovery":{
      let nodeId=p.nodeId||null;
      if(p.makeNode&&p.what){ nodeId=addNode(w,p.what,"Place"); reveal(w,'map'); }
      addLedger(w,"canon",{kind:"discovery",what:p.what,nodeId:nodeId,walk:wkStamp,source:src},"Discovered: "+(p.what||"something new"));
      reveal(w,'gaz');
      grantXp(w,"discovery",p);
      // slow drip: flip Powers/Pressures the player has now LEARNED of from hidden → known (player-facing
      // gating in render.initKnown). payload.reveal = { factions:[name|id…], pressures:[danger|id…] }.
      const rv=p.reveal||{};
      (rv.factions||[]).forEach(nm=>{const f=(w.factions||[]).find(x=>x.name===nm||x.id===nm); if(f){f.known=true; reveal(w,'powers');}});
      (rv.pressures||[]).forEach(nm=>{const x=(w.pressures||[]).find(y=>y.danger===nm||y.dangerFrag===nm||y.id===nm); if(x){x.known=true; reveal(w,'powers');}});
      // TRANSITION-CONTRACT.md §3.3 (BUG-05) — enter:true actually relocates the PC to the discovered
      // node. A mid-walk discovery mints but does NOT move (E9) — finish/abandon the walk first.
      if(nodeId && p.enter){
        if(prepOf(w).activeWalkId) return {ok:true, nodeId:nodeId, moved:false, reason:"walk-active"};
        const moveRes=pcMoveTo(w,nodeId,{travelMin:(typeof p.travelMin==="number")?p.travelMin:60,cause:"discovery",src});
        return Object.assign({ok:true, nodeId:nodeId, moved:true}, moveRes);
      }
      return {ok:true, nodeId:nodeId};
    }

    case "clock_advanced":{
      // p.delta is now a number or null (coerced in dmFoldPayload, num:["delta"]); absent still means "+1 tick" (HQ2-1-TOPUP retirement)
      const tgt=findClockTarget(w,p.clockId), d=(p.delta==null?1:p.delta);
      if(tgt){
        const wasFull=(tgt.clock.filled||0)>=tgt.clock.size;
        tgt.clock.filled=Math.max(0,Math.min(tgt.clock.size,(tgt.clock.filled||0)+d));
        const fired=tgt.clock.filled>=tgt.clock.size;
        addLedger(w,"clock",{clockId:p.clockId,delta:d,filled:tgt.clock.filled,size:tgt.clock.size,fired:fired,source:src},
          "☼ "+tgt.label+": clock "+tgt.clock.filled+"/"+tgt.clock.size+(fired?" — FILLED":"")+".");
        reveal(w,'powers');
        // WORLD-TURN §3: a FACTION agenda clock's fresh transition to full rolls the real outcome
        // (splinter/merge/takeover/… mutate w.factions) — a front/pressure clock isn't a faction, and
        // an already-full clock re-declared full doesn't re-fire (wasFull guards the transition).
        if(fired && !wasFull && tgt.kind==="faction" && typeof turnFactionOutcome==="function") turnFactionOutcome(w, tgt.obj.name);
        return {ok:true, fired:fired, clock:tgt.clock.filled+"/"+tgt.clock.size};
      }
      addLedger(w,"clock",{clockId:p.clockId,delta:d,untracked:true,source:src},
        "☼ Clock "+(p.clockId||"?")+" advanced "+d+" (untracked — no matching faction/front).");
      return {ok:true, untracked:true};
    }

    case "clock_fired":{
      const tgt=findClockTarget(w,p.clockId);
      const wasFull=!!(tgt&&(tgt.clock.filled||0)>=tgt.clock.size);
      if(tgt) tgt.clock.filled=tgt.clock.size;
      addLedger(w,"clock",{clockId:p.clockId,fired:true,factionId:p.factionId,forPlayer:!!p.forPlayer,source:src},
        "☼ "+((tgt&&tgt.label)||p.clockId||"A clock")+": the clock fills — its agenda comes due.");
      reveal(w,'powers');
      // ADVANCEMENT-RETUNE.md §2: a clock fired AGAINST the PC (forPlayer:false) now pays 0.5×E(L) IF
      // the PC survived it — "the world hit you and you're still here." `survived` = a living PC exists.
      const survived = typeof livingSheet==="function" && !!livingSheet(w);
      grantXp(w,"clock_fired",p,{survived});
      // WORLD-TURN §3: same faction-outcome roll as clock_advanced's fired transition (kept in sync).
      if(!wasFull && tgt && tgt.kind==="faction" && typeof turnFactionOutcome==="function") turnFactionOutcome(w, tgt.obj.name);
      // CROWNING §3.5 — the Doom front's clock filling (a fresh transition, wasFull-guarded) SUNDERS
      // the world: the dark twin of the Crowning. Flag only in C1 (the testament pass rides C2's
      // crownWorld path via markSundered — see §7.C2). Uncrownable forever (crownEligible reads it).
      if(!wasFull && tgt && tgt.kind==="front" && tgt.obj && tgt.obj.isDoom && !w.sundered && !w.crowned){
        w.sundered = { day:(typeof clockOf==="function"?clockOf(w).day:null), frontId:p.clockId||null };
        addLedger(w,"canon",{kind:"sundered",frontId:p.clockId||null,day:w.sundered.day,source:src},
          "✧✦ The Doom came due. The world is sundered — its ending was lost.");
        if(typeof reveal==="function") reveal(w,'powers');
        if(typeof markSundered==="function") markSundered(w);   // CROWNING §3.5 — the cautionary legend pass (C2)
      }
      // REPUTATION.md §1: a clock_fired the PC SURVIVED is a deed too — "the world hit you and you're
      // still here" earns renown same as XP (0.5×E(L), same survived gate). forPlayer:true clocks (a
      // PC-favoring clock) don't price renown here — that's not a deed against a faction.
      if(survived && !p.forPlayer && typeof repuApplyDeed==="function"){
        const region=(typeof regionPeekNode==="function")?regionPeekNode(w,w.currentNodeId):null;
        repuApplyDeed(w,{ weight:0.5*repuUnit(w), factionKey:p.factionId||null, regionId:region&&region.key,
          deedRef:"clock_fired:"+(p.clockId||"?"), source:"clock_fired" });
      }
      return {ok:true};
    }

    case "front_closed":{
      const tgt=findClockTarget(w,p.ledgerId||p.frontId);
      if(tgt&&tgt.kind==="front") tgt.obj.closed=true;
      addLedger(w,"outcome",{kind:"front_closed",ledgerId:p.ledgerId||p.frontId,how:p.how,walk:wkStamp,source:src},
        "✦ A front closes"+((tgt&&tgt.label)?(" — "+tgt.label):"")+(p.how?(" ("+p.how+")"):"")+".");
      const frontSize=(tgt&&tgt.clock&&tgt.clock.size)||6;
      grantXp(w,"front_closed",p,{size:frontSize});   // stake = front clock size, priced off E(L) (ADVANCEMENT-RETUNE.md §2)
      // REPUTATION.md §1: front_closed is a deed weighted by front size (same stake XP uses).
      if(typeof repuApplyDeed==="function"){
        const region=(typeof regionPeekNode==="function")?regionPeekNode(w,w.currentNodeId):null;
        repuApplyDeed(w,{ weight:frontSize*repuUnit(w)/6, factionKey:p.factionId||null, regionId:region&&region.key,
          deedRef:"front_closed:"+(p.ledgerId||p.frontId||"?"), source:"front_closed" });
      }
      return {ok:true};
    }

    case "encounter_resolved":{
      const foes=p.foes||[];
      addLedger(w,"outcome",{kind:"encounter",foes:foes,method:p.method,objectiveRef:p.objectiveRef||null,outcome:p.outcome||null,walk:wkStamp,source:src},
        "✦ Encounter "+(p.outcome||"resolved")+" ("+(p.method||"?")+") — "+foes.length+" foe"+(foes.length===1?"":"s")+".");
      // ADVANCEMENT-RETUNE.md §0/§1: UN-GATED — every real fight pays; objectiveRef is now a BONUS
      // (not a gate). The decay guard keys off (crBand, nodeId), tracked per-session on w.xpDecay
      // (world-side; cleared at beginSession — see world/play.js).
      if(!w.xpDecay) w.xpDecay={};
      grantXp(w,"encounter_resolved",p,{decayStore:w.xpDecay, nodeId:(p.nodeId!=null?p.nodeId:w.currentNodeId)});
      // REALM-STORY-WIRING §3 — stamp the outcome onto any codex "creature" record minted for this
      // fight's foes, so the codex carries history the DM can reincorporate ("the pack that ran at
      // Copper's Marsh"). Reads GS.combat.foes (still live here — combat_end's own handler calls this
      // BEFORE GS.combat=null, per its own comment) rather than p.foes (which carries only cr/
      // victimClass, no name/codexId to look the record back up by).
      if(GS.combat && Array.isArray(GS.combat.foes) && typeof codexUpdate==="function"){
        GS.combat.foes.forEach(f=>{
          const id=f.codexId || (typeof codexKeyId==="function" ? codexKeyId("creature", f.name) : null);
          const rec=(typeof codexGet==="function") ? codexGet(w, id) : null;
          if(!rec || rec.kind!=="creature") return;   // only touch records THIS unit minted
          const outcome = f.down ? "slain" : (f.fled ? "fled" : "resolved");
          codexUpdate(w, rec.id, { fields:{ lastOutcome:outcome, seenCount:(rec.fields.seenCount||0)+1 } });
        });
      }
      return {ok:true};
    }

    case "kill":{
      // HQ-5 (docs/ANIMAL-SOCIAL-HQ.md): stamp the node the kill happened at so
      // animalWitnessSeen (a location-scoped filter) can ever match this entry — prefer an
      // explicit payload node (p.at, already DM_EVENT_FIELDS-accepted for this event) over the
      // party's current node, same payload->fallback idiom this case already uses below for the
      // witness cascade (p.at!=null?p.at:w.currentNodeId).
      const killAt=(p.at!=null)?p.at:w.currentNodeId;
      addLedger(w,"outcome",{kind:"kill",victimClass:p.victimClass,factionId:p.factionId||null,nodeId:killAt,walk:wkStamp,source:src},
        "✦ A "+(p.victimClass||"being")+" was slain"+(p.factionId?(" — "+p.factionId+" will remember"):"")+".");
      // DETECTED social cost (SOCIAL §5 / DIFFICULTY murder-hobo answer): a CIVILIAN kill near witnesses
      // turns every co-located codex NPC Hostile — no DM report; the script remembers who saw. (The
      // faction-member GROUP cascade stays DECLARED via attitude_shift for now — §7 scope guard.)
      if(typeof codexWitnessesAt==="function" && typeof codexSetAttitude==="function"
         && /civilian|innocent|bystander|commoner|noncombatant/i.test(p.victimClass||"")){
        const at=(p.at!=null)?p.at:w.currentNodeId;
        const witnesses=codexWitnessesAt(w,at,p.victimId);
        witnesses.forEach(id=>codexSetAttitude(w,id,ATTITUDE_MIN,"witnessed a killing",clockOf(w).day));
        if(witnesses.length) addLedger(w,"outcome",{kind:"social",detected:true,witnesses:witnesses.length,at,source:"detected"},
          `✦ ${witnesses.length} witness${witnesses.length===1?"":"es"} turn Hostile — the killing was seen.`);
      }
      // DETECTED escalation (DIFFICULTY.md): killing a faction's person advances THAT faction's clock
      // against the PC by 1 — the spine to clock_fired → an authored named response (bounty / inquisitor /
      // nemesis), never stat-scaled super-guards. A monster kill carries no factionId → no escalation.
      // p.factionId must be a key findClockTarget resolves (faction name / front danger); an unmatched id
      // logs as an untracked advance + no-ops, never a false escalation.
      if(p.factionId){
        const tgt=findClockTarget(w,p.factionId);
        const wasFull=!!(tgt&&tgt.clock&&(tgt.clock.filled||0)>=tgt.clock.size);
        const r=applyEvent(w,{type:"clock_advanced",payload:{clockId:p.factionId,delta:1},source:"detected"});
        // ONLY on the transition to full (not every subsequent kill) promote to clock_fired so the agenda
        // comes due once. forPlayer:false → no PC XP (this clock fills AGAINST the PC).
        if(r&&r.fired&&!wasFull)
          applyEvent(w,{type:"clock_fired",payload:{clockId:p.factionId,factionId:p.factionId,forPlayer:false},source:"detected"});
      }
      // REPUTATION.md §1: price the deed's renown — weight from CR (encounter-unit fallback when the
      // kill carries no CR, e.g. a civilian/authority kill), witnessed-or-claimed gated INSIDE repuApplyDeed
      // (repuWitnessed's script-default inference — never applies to an unwitnessed, unclaimed deed).
      // NEGATIVE weight: "killing a faction's people = negative with them" (§1) — repuFactionTargets
      // flips the sign for rivals (positive at half weight) off this same signed magnitude.
      if(typeof repuApplyDeed==="function"){
        const at=(p.at!=null)?p.at:w.currentNodeId;
        const mag=(p.cr!=null && typeof crXp==="function") ? crXp(p.cr) : repuUnit(w);
        const region=(typeof regionPeekNode==="function")?regionPeekNode(w,at):null;
        repuApplyDeed(w,{ weight:-mag, factionKey:p.factionId||null, regionId:region&&region.key, at,
          exceptId:p.victimId||null, deedRef:"kill:"+(p.victimId||p.victimClass||"?"), source:"kill" });
      }
      return {ok:true};
    }

    /* ---- REPUTATION (docs/REPUTATION.md): the world remembers what it SAW. Pure ledger math — the
       script prices every deed; the DM only declares/claims/gifts. ---- */
    case "claim_deed":{                               // §2 the CLAIM verb — the player announces authorship
      if(typeof repuClaimDeed!=="function") return {ok:false,reason:"reputation-unavailable"};
      const r=repuClaimDeed(w,{ weight:p.weight, factionKey:p.factionKey||null, regionId:p.regionId||null,
        deedRef:p.ledgerRef||p.deedRef||null, source:"claim_deed" });
      return Object.assign({ok:true}, r);
    }
    case "gift":{                                      // §1 deed source: a gift given/received prices renown
      if(typeof repuApplyDeed!=="function") return {ok:false,reason:"reputation-unavailable"};
      const weight=(typeof p.weight==="number")?p.weight:0.25*repuUnit(w)*(p.given===false?-1:1);
      const r=repuApplyDeed(w,{ weight, factionKey:p.factionKey||null, regionId:p.regionId||null,
        at:p.at, witnessed:p.witnessed, deedRef:p.deedRef||"gift", source:"gift" });
      // LOOSE-ENDS §1: codex.gifts[] — the NPC record remembers a standing gift TO them (p.target,
      // p.given!==false). Given = remembered, not automatically leveraged: this only WRITES the
      // memory; the DM still declares {type:"trustLever"} on a later social_check to spend it (the
      // reconciled lever key — applyLeverage already prices "trustLever", SOCIAL.md's existing ladder).
      // Gifts RECEIVED (p.given===false) or gifts with no p.target aren't a standing NPC memory —
      // codex-unavailable/no-target both no-op here without failing the reputation half above.
      if(p.target && p.given!==false && typeof codexGift==="function")
        codexGift(w, p.target, { what:p.what||null, from:p.from||null, day:p.day });
      return Object.assign({ok:true}, r);
    }
    case "epithet_grant":{                             // §2 the epithet capture — DM supplies the text the
      // script requested (dm.needsEpithet); mirrors codex_update's {dm:{effectDie}} round trip but writes
      // to the living PC (repuGrantEpithet), since the PC carries no codex record.
      if(typeof repuGrantEpithet!=="function") return {ok:false,reason:"reputation-unavailable"};
      const r=repuGrantEpithet(w,p.text);
      return r?{ok:true,epithet:r}:{ok:false,reason:"no-living-pc-or-text"};
    }

    /* ---- COMPANIONS (docs/COMPANIONS.md): hirelings + the one sidekick. src/world/companions.js owns
       the ledger/state math; these three cases are the event-contract door onto it. ---- */
    case "hire":{                                     // §1 mint a hireling off an existing rolled codex NPC
      if(typeof hireCompanion!=="function") return {ok:false,reason:"companions-unavailable"};
      return hireCompanion(w,p);
    }
    case "dismiss":{                                  // release a hireling (no death, no grief thread)
      if(typeof dismissCompanion!=="function") return {ok:false,reason:"companions-unavailable"};
      return dismissCompanion(w,p.hirelingId);
    }
    /* MONSTER-PARLEY §2 the "tend" beat — DM-declared (Charter §8.3b: the DM judges WHEN an interpretive
       beat lands, the script owns the number). Stamps `pet.tendedDay` so companionTickAllPets' rest-gate
       neglect tick (play.js) holds loyalty steady for this pet on any tick within 1 day of tendedDay. */
    case "tend_pet":{
      const C=(typeof companionsOf==="function")?companionsOf(w):null;
      if(!C) return {ok:false,reason:"companions-unavailable"};
      const pet=(C.pets||[]).find(x=>x.codexId===p.target);
      if(!pet) return {ok:false,reason:"no-pet:"+p.target};
      pet.tendedDay=(typeof clockOf==="function")?clockOf(w).day:pet.tendedDay;
      if(typeof addLedger==="function")
        addLedger(w,"outcome",{kind:"pet-tended",codexId:pet.codexId,name:pet.name,day:pet.tendedDay},
          "✦ "+pet.name+" is tended — the bond holds.");
      return {ok:true,pet};
    }

    case "companion_update":{                          // §1/§3 loyalty nudge (gift/danger) or sidekick promotion/level
      if(typeof companionAdjustLoyalty!=="function") return {ok:false,reason:"companions-unavailable"};
      if(p.action==="promote-sidekick"){
        if(typeof promoteSidekick!=="function") return {ok:false,reason:"companions-unavailable"};
        return promoteSidekick(w,p);
      }
      if(p.action==="sidekick-level"){
        if(typeof companionSidekickLevelWith!=="function") return {ok:false,reason:"companions-unavailable"};
        const r=companionSidekickLevelWith(w,p.pcLevel);
        return r?{ok:true,sidekick:r}:{ok:false,reason:"no-sidekick"};
      }
      if(p.action==="sidekick-loyalty"){
        if(typeof companionSidekickAdjustLoyalty!=="function") return {ok:false,reason:"companions-unavailable"};
        const r=companionSidekickAdjustLoyalty(w,p.delta||0,p.cause||"a moment shared");
        return r!=null?{ok:true,loyalty:r}:{ok:false,reason:"no-sidekick"};
      }
      if(p.action==="sidekick-death"){
        if(typeof companionSidekickDies!=="function") return {ok:false,reason:"companions-unavailable"};
        return {ok:companionSidekickDies(w,p.cause||null)};
      }
      // default: a hireling loyalty nudge (gift / danger-beyond-the-bargain) targeted by hirelingId
      const C=(typeof companionsOf==="function")?companionsOf(w):null;
      const h=C&&C.hirelings.find(x=>x.id===p.hirelingId);
      if(!h) return {ok:false,reason:"no-hireling"};
      const r=companionAdjustLoyalty(w,h,p.delta||0,p.cause||"a moment shared");
      return {ok:true,loyalty:r};
    }

    /* MONSTER-PARLEY §2 / ANOMALY LAW §2b — recruit_creature{codexId, tier}: the ladder's top rungs.
       Gate is SCRIPT-OWNED and absolute: kind:"creature", attitude===+2 (Helpful), alive/active, AND
       (§2b) rec.fields.bondEligible===true. Ordinary persuasion NEVER produces a companion monster —
       the grind ceiling (social_check, above) keeps plain check-grinding from ever reaching +2 at all,
       and this SECOND, independent gate additionally refuses even a +2 reached by some other route
       (an attitude_shift declared beat, a future caller) unless bondEligible was stamped by one of the
       three anomaly channels (nat-20, decisive lever at +1, friendly spawn). Anything below +2 refuses
       "not-helpful"; +2 without bondEligible refuses "no-bond" — no partial credit, no DM override,
       MUTATION-CHECKED, never relax either gate independently of the other. tier routes to whichever
       existing (or new, pet) mint path. */
    case "recruit_creature":{
      if(typeof codexGet!=="function"||typeof codexGetAttitude!=="function") return {ok:false,reason:"social-unavailable"};
      const rec=codexGet(w,p.codexId);
      if(!rec || rec.kind!=="creature") return {ok:false,reason:"not-a-creature"};
      if(rec.status && rec.status.condition && rec.status.condition!=="active") return {ok:false,reason:"not-active"};
      const a=codexGetAttitude(w,p.codexId);
      if(!a || a.value!==2) return {ok:false,reason:"not-helpful"};       // the +2 gate — MUTATION-CHECKED, never relax
      if(!rec.fields || rec.fields.bondEligible!==true) return {ok:false,reason:"no-bond"};  // §2b's SECOND gate — MUTATION-CHECKED, never relax
      const tier=p.tier||"hireling";
      if(tier==="pet"){
        if(typeof mintPetCompanion!=="function") return {ok:false,reason:"companions-unavailable"};
        return mintPetCompanion(w,{ codexId:p.codexId, statBase:p.statBase||null });
      }
      if(tier==="sidekick"){
        if(typeof promoteSidekick!=="function") return {ok:false,reason:"companions-unavailable"};
        return promoteSidekick(w,{ codexId:p.codexId, className:p.className, cr:p.cr });
      }
      // default: "hireling" — an intelligent creature's wage may be non-coin (its own want, stored as
      // wageNote — the economy stays untouched, this is a label only, never a second price system).
      if(typeof hireCompanion!=="function") return {ok:false,reason:"companions-unavailable"};
      const r=hireCompanion(w,{ codexId:p.codexId, role:p.role||"skilled", wage:p.wage, shares:p.shares });
      if(r && r.ok && r.hireling && p.wageNote) r.hireling.wageNote=p.wageNote;
      return r;
    }

    case "choice_logged":
      addLedger(w,"canon",{kind:"choice",weight:p.weight,forecloses:p.forecloses||[],source:src},
        "◆ Choice ("+(p.weight||"minor")+") logged"+(p.forecloses&&p.forecloses.length?(" — forecloses: "+p.forecloses.join(", ")):"")+".");
      grantXp(w,"choice_logged",p);                // pays only on a major choice (ADVANCEMENT.md)
      return {ok:true};

    case "inspiration_granted":{                      // HEROIC INSPIRATION (docs/SRD-MECHANIZATION.md §1) — now SETS the
      const t=livingSheet(w);                         // spendable reroll flag (was a play-quality no-op). Bool, no-stack.
      const wasNew=(t&&typeof grantInspiration==="function")?grantInspiration(t.sh):false;
      addLedger(w,"outcome",{kind:"inspiration",pc:p.pc||(t&&t.c.name),reason:p.reason,held:!!(t&&t.sh.inspiration),source:src},
        "✦ Heroic Inspiration — "+(p.reason||"a moment of brilliance")+(wasNew?" (you now hold it)":" (already held)")+".");
      return {ok:true, held:!!(t&&t.sh.inspiration)};
    }

    case "inspiration_spend":{                        // spend the token → reroll the just-resolved check/save/attack (§1)
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      if(typeof spendInspiration!=="function")return {ok:false,reason:"check-unavailable"};
      if(!spendInspiration(t.sh))return {ok:false,reason:"no-inspiration"};   // nothing held to spend
      // the reroll d20 rides IN on the payload (the player's open reroll — dice transparency); the caller/UI
      // re-resolves the check with {reroll:p.d20}. Here we just clear the flag + record the spend.
      addLedger(w,"outcome",{kind:"inspiration",pc:t.c.name,on:p.on||null,reroll:p.d20!=null?p.d20:null,spent:true,source:src},
        "✦ "+t.c.name+" spends Heroic Inspiration"+(p.on?(" on the "+p.on):"")+(p.d20!=null?(" — reroll "+p.d20):"")+".");
      return {ok:true, spent:true, reroll:(p.d20!=null?p.d20:null)};
    }

    case "check":{                                    // THE CHECK/SAVE SPINE (docs/SRD-MECHANIZATION.md §1) — the DM
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // DECLARES the player's open roll; the script GRADES it.
      if(typeof resolveCheck!=="function")return {ok:false,reason:"check-unavailable"};
      const kind=(p.kind==="save")?"save":(p.kind==="ability")?"ability":"skill";  // default skill
      const opts={d20:p.d20,advantage:p.advantage,bonus:p.bonus,reroll:p.reroll};   // HQ2-1: d20/bonus/reroll coerced in dmFoldPayload (num:["d20","bonus","reroll"])
      let res;
      if(kind==="save") res=resolveSaveCheck(t.sh,p.key,p.dc,opts);
      else if(kind==="ability") res=resolveAbilityCheck(t.sh,p.key,p.dc,opts);
      else res=resolveSkillCheck(t.sh,p.key,p.dc,opts);
      const absurdNote=(res.absurdity>0)?(" — against all odds! (absurdity "+res.absurdity+")"):"";
      addLedger(w,"outcome",{kind:"check",pc:t.c.name,checkKind:kind,key:p.key,dc:res.dc,total:res.total,
        natural:res.natural,success:res.success,margin:res.margin,degree:res.degree,absurdity:res.absurdity,source:src},
        "✦ "+t.c.name+" — "+kind+" "+(p.key||"")+" DC "+res.dc+": "+res.total+" ("+res.degree+", "+(res.success?"success":"fail")+")"+absurdNote+".");
      return {ok:true, result:res};
    }

    case "crit_outcome":{                            // CRIT-MAGNITUDE §3 — a Mythic spike persists as canon
      const tier=p.tier||"standard", canon=(tier==="mythic");
      const lensTxt=(p.lenses||[]).map(l=>(l&&(l.lens||l))||null).filter(Boolean).join("; ");
      const head = canon
        ? (p.natural===1 ? "A mythic disaster scars the world" : "A mythic triumph is woven into the world")
        : (p.natural===1 ? "A crit failure leaves its mark" : "A crit success leaves its mark");
      addLedger(w, canon?"canon":"outcome",
        {kind:"crit", natural:p.natural, magnitude:p.magnitude, tier, scope:p.scope||null,
         lenses:p.lenses||[], placeHandoff:!!p.placeHandoff, mythSeed:p.mythSeed||null, source:src},
        (canon?"◆ ":"✦ ")+head+(lensTxt?(" — "+lensTxt):"")+".");
      // BATTLE-THEATER §4 hook site 5/6: a Mythic-magnitude spike is exactly what `absurdity` (the
      // reality-tear verb) is for — theaterFxFromLedger gates on tier/magnitude itself (a low-magnitude
      // crit stays silent), this call site only ever needs to fire unconditionally per kind.
      if(typeof cmTheaterNotify==="function") cmTheaterNotify("crit",{natural:p.natural,magnitude:p.magnitude,tier});
      // DEAD-STATE (2026-07-03, Adam's ruling) — OBLITERATION SOURCE 1/3: "a killing blow that is a
      // CRIT with magnitude >= 8." GAP, honestly noted: CRIT-MAGNITUDE (this event) is rolled off
      // resolveCheck's skill-check crit path (rollCritMagnitude, above in this file) — it has NO
      // structural link to a GS.combat foe today; the `attack` event's own crit (resolveAttack's plain
      // nat-20 boolean) never carries a magnitude die at all, so there is no existing call site where
      // "this foe just died to a magnitude>=8 crit" is mechanically derivable. What IS reachable: this
      // event's payload additively accepts an optional `target` (a GS.combat foe fid) — a DM narrating
      // a killing crit can supply it (mirroring how `attack`'s own p.target already threads a foe
      // reference through the SAME event contract). When present, AND magnitude clears 8, AND that foe
      // is confirmed down (HP<=0 — never obliterates a foe still standing), stamp `obliterated` and
      // stage the vaporization FX — never invents a link the data doesn't carry.
      if(p.target && (p.magnitude||0)>=8 && GS.combat){
        const victim=(GS.combat.foes||[]).find(f=>f.fid===p.target) || (GS.combat.allies||[]).find(a=>a.id===p.target)
          || ((GS.combat.pc && p.target==="pc")?GS.combat.pc:null);
        if(victim && victim.down){
          victim.obliterated=true;
          if(typeof window!=="undefined" && window.Theater && typeof window.Theater.play==="function"){
            try{ window.Theater.play("obliterate",{who:p.target}); }catch(e){ /* best-effort */ }
          }
        }
      }
      return {ok:true, canon, tier};
    }

    /* `stage_fx{verb,who?,from?,to?,note?}` — BATTLE-THEATER.md §4: "the DM's hand for improvised
       beats the fixed events don't carry (the grappling swing)." Validates `verb` against the verb
       library's OWN exported list (window.Theater.verbs, src/ui/theater-verbs.js's THEATER_VERBS —
       the single source of truth both this validation and the library's dispatch table read from, so
       they can never drift apart) before ledgering — an unknown verb is REJECTED (never silently
       ledgered as if it played), matching the spec's "Unknown verbs no-op safely" at the Theater.play
       layer while still surfacing a clear ok:false here so the DM knows the verb name didn't land.
       Ledgers a prose line (the twin — `note` if the DM supplied one, else a generated fallback reading
       the verb name) unconditionally on a KNOWN verb, THEN forwards to window.Theater?.play — additive,
       headless/jsdom-safe (the forward is itself inside cmTheaterNotify's own null-safe/try-catch, so
       a missing window.Theater here is just "no animation happened," never a validation failure). */
    case "stage_fx":{
      // window.Theater.verbs (the REAL, live list from src/ui/theater-verbs.js) wins when the ES-module
      // boundary has mounted; STAGE_FX_VERBS (this file's own kept-in-sync constant, above) is the
      // degrade path for headless/jsdom or a not-yet-loaded module — either way, an unknown verb name
      // is validated and REJECTED before anything is ledgered.
      const verbList=(typeof window!=="undefined" && window.Theater && Array.isArray(window.Theater.verbs))
        ? window.Theater.verbs : STAGE_FX_VERBS;
      if(!p.verb || verbList.indexOf(p.verb)<0) return {ok:false, reason:"unknown-verb"};
      // DEAD-STATE (2026-07-03, Adam's ruling) — the DM-DECLARED vaporization source: "stage_fx
      // {verb:"obliterate", who} for DM-declared vaporization." Unlike the other two sources
      // (crit_outcome/attack above), stage_fx already carries EXACTLY the unit reference the DM
      // intends (p.who), no target-resolution ambiguity — stamp `obliterated` on the matching
      // GS.combat unit BEFORE the ledger/animation below so a subsequent setUnits refresh renders the
      // settled scorch-marker state, not a lingering corpse. Silently no-ops if `who` doesn't resolve
      // to a live combat unit (a DM narrating pure environmental flavor with no GS.combat unit tag —
      // never a throw, matching every other best-effort branch in this event).
      if(p.verb==="obliterate" && p.who && GS.combat){
        const victim=(GS.combat.foes||[]).find(f=>f.fid===p.who) || (GS.combat.allies||[]).find(a=>a.id===p.who)
          || ((GS.combat.pc && p.who==="pc")?GS.combat.pc:null);
        if(victim){ victim.down=true; victim.obliterated=true; }
      }
      const note=p.note||("stages "+p.verb);
      addLedger(w,"outcome",{kind:"stage-fx",verb:p.verb,who:p.who||null,from:p.from||null,to:p.to||null,note:p.note||null,source:src},
        "✦ "+note+".");
      // stage_fx already carries the exact verb the DM asked for (unlike the EXISTING-event hook sites,
      // which need theaterFxFromLedger's ledger-kind->verb mapping) — forward straight to
      // window.Theater.play, no mapping layer involved. Still fully null-safe/best-effort: a missing
      // window.Theater (headless/jsdom/no-WebGL) or a play() throw never invalidates the ledger write
      // above, which has already committed by this point.
      if(typeof window!=="undefined" && window.Theater && typeof window.Theater.play==="function"){
        try{ window.Theater.play(p.verb,{who:p.who,from:p.from,to:p.to}); }catch(e){ /* best-effort */ }
      }
      return {ok:true, verb:p.verb};
    }

    /* THEATER-NEXT §1 — `terrain_change`: BATTLE-THEATER §5's T4, finally payload-exact. A second,
       narrow, frozen vocabulary (TERRAIN_OPS, above) that mutates cm.scene directly — the board tile
       change IS the visual; no Theater.play call, no cmTheaterNotify, no auto-FX here. Zone-scoped
       only (the `tiles` addressing option is REJECTED — the engine owns nouns, zone is the noun every
       other combat event already speaks). Guard order: first failure returns and nothing mutates,
       nothing ledgers. */
    case "terrain_change":{
      if(!GS.combat || !GS.combat.active) return {ok:false, reason:"no-combat"};
      if(!p.op || TERRAIN_OPS.indexOf(p.op) < 0) return {ok:false, reason:"unknown-op"};
      const cm=GS.combat;
      const grid=cm.grid||{bands:CM_BANDS.slice(),lanes:CM_LANES.slice()};
      const zoneParts=String(p.zone||"").split(":");
      if(zoneParts.length!==2 || (grid.bands||[]).indexOf(zoneParts[0])<0 || (grid.lanes||[]).indexOf(zoneParts[1])<0){
        return {ok:false, reason:"bad-zone"};
      }
      cm.scene=cm.scene||{};
      const mods=(cm.scene.mods=cm.scene.mods||[]);
      // holed-zone lockout: any op (including a second hole) on a previously-holed zone is rejected —
      // a voided patch is terminally voided for this fight.
      if(mods.some(m=>m.op==="hole" && m.zone===p.zone)) return {ok:false, reason:"zone-holed"};
      if(mods.length>=24) return {ok:false, reason:"mods-cap"};
      const round=cm.round||1, note=p.note||null;
      if(p.op==="raise" && (cm.scene.elevZones||[]).indexOf(p.zone)>=0){
        return {ok:false, reason:"already-elevated"};
      }
      if(p.op==="break"){
        if(cm.scene.zoneCover) delete cm.scene.zoneCover[p.zone];
        if(cm.scene.cover) delete cm.scene.cover[p.zone];
        mods.push({op:"break", zone:p.zone, note, round});
      } else if(p.op==="burn"){
        mods.push({op:"burn", zone:p.zone, note, round});
      } else if(p.op==="flood"){
        cm.scene.hazardZones=(cm.scene.hazardZones||[]).filter(hz=>hz.zone!==p.zone);
        cm.scene.hazardZones.push({zone:p.zone, kind:(p.note||"flood water"), revealed:true});
        mods.push({op:"flood", zone:p.zone, note, round});
      } else if(p.op==="collapse"){
        cm.scene.elevZones=cm.scene.elevZones||[];
        const wasElev=cm.scene.elevZones.indexOf(p.zone)>=0;
        let sunk;
        if(wasElev){
          cm.scene.elevZones=cm.scene.elevZones.filter(z=>z!==p.zone);
          if(typeof cmStampElev==="function"){
            cmStampElev(cm, cm.pc);
            (cm.allies||[]).forEach(a=>cmStampElev(cm,a));
            (cm.foes||[]).forEach(f=>cmStampElev(cm,f));
          }
          sunk=false;
        } else {
          sunk=true;
          // sunk collapse stamps a passive hazard marker (mirrors flood/hole; DM adjudicates
          // damage via hazard_tick — the engine never auto-damages). HOTFIX-QUEUE-2026-07-07 HQ2-3.
          cm.scene.hazardZones=(cm.scene.hazardZones||[]).filter(hz=>hz.zone!==p.zone);
          cm.scene.hazardZones.push({zone:p.zone, kind:(p.note||"broken ground"), revealed:true});
        }
        mods.push({op:"collapse", zone:p.zone, note, round, sunk});
      } else if(p.op==="raise"){
        cm.scene.elevZones=cm.scene.elevZones||[];
        cm.scene.elevZones.push(p.zone);
        if(typeof cmStampElev==="function"){
          cmStampElev(cm, cm.pc);
          (cm.allies||[]).forEach(a=>cmStampElev(cm,a));
          (cm.foes||[]).forEach(f=>cmStampElev(cm,f));
        }
        mods.push({op:"raise", zone:p.zone, note, round});
      } else if(p.op==="hole"){
        cm.scene.hazardZones=(cm.scene.hazardZones||[]).filter(hz=>hz.zone!==p.zone);
        cm.scene.hazardZones.push({zone:p.zone, kind:(p.note||"open pit"), revealed:true});
        mods.push({op:"hole", zone:p.zone, note, round});
      }
      const line=p.note || TERRAIN_PROSE[p.op](p.zone);
      addLedger(w,"outcome",{kind:"terrain",op:p.op,zone:p.zone,note:p.note||null,source:src},
        "✦ "+line+".");
      return {ok:true, op:p.op, zone:p.zone};
    }

    case "adjudication":
      addLedger(w,"canon",{kind:"adjudication",situation:p.situation,ruling:p.ruling,precedentId:p.precedentId||slug(p.situation||"")||uid(),source:src},
        "⚖ Ruling — "+(p.situation||"?")+" → "+(p.ruling||"?")+".");
      return {ok:true};

    case "level_applied":{                          // ADVANCEMENT.md: the mechanical recompute (capped at the ceiling)
      const t=livingSheet(w); if(!t) return {ok:false,reason:"no-pc"};
      if(typeof applyLevelUp!=="function") return {ok:false,reason:"advancement-unavailable"};
      const r=applyLevelUp(t.sh, typeof p.to==="number"?p.to:(t.sh.level||1)+1);
      if(!r.ok) return r;
      // interpretive-picks marker (docs/ADVANCEMENT.md): applyLevelUp grew the numbers + (via
      // ensureResources) seeded choicesLevel at the OLD level, so the choicesLevel→to span is now the
      // owed picks. Auto-finalize a pure-feature span (no spells/ASI to choose) so it leaves no false
      // "pending"; an interactive span stays pending until the player finalizes (persistent — the
      // picker can't be accidentally skipped).
      if(t.sh.choicesLevel==null) t.sh.choicesLevel=r.from;
      if(typeof levelUpPlan==="function" && !levelUpPlan(t.sh, t.sh.choicesLevel, r.to).interactive)
        t.sh.choicesLevel=r.to;
      addLedger(w,"outcome",{kind:"level",pc:t.c.name,from:r.from,to:r.to,hpGain:r.hpGain,pb:r.pb,source:src},
        `✦ ${t.c.name} advances ${r.from}→${r.to} — +${r.hpGain} HP (now ${t.sh.hp}), proficiency +${r.pb}. New spells / feat / subclass: choose with your DM.`);
      return {ok:true, from:r.from, to:r.to};
    }

    case "prep_applied":                            // DM's synthesis result → enrich the soft frontiers (SESSION-PREP)
      return (typeof applyPrep==="function") ? applyPrep(w,p) : {ok:false, reason:"prep-unavailable"};

    case "prep_contact":{                           // player enters a rumored frontier → lock it to canon
      if(typeof lockOnContact!=="function") return {ok:false, reason:"prep-unavailable"};
      const r=lockOnContact(w,p.nodeId);
      if(r.ok&&p.enter){
        // TRANSITION-CONTRACT.md §3.4 — the approach now ticks (soft edges mint with travelMin:0, so
        // this resolves to 60 today). pcMoveTo subsumes the exact turnStampVisit/seeNode/worldTurn
        // sequence this block used to do inline — behavior change is ONLY the +60 tick.
        const edge=(typeof findEdge==="function")?findEdge(w,w.currentNodeId,p.nodeId):null;
        const approachMin=(edge&&edge.travelMin>0)?edge.travelMin:60;
        // merge pcMoveTo's {minutes,day,band} like move_node/discovery do (HOTFIX HQ2-4) — r first
        // so lockOnContact's ok/node/walk/overlay win; moveRes adds minutes/day/band on top.
        const moveRes=pcMoveTo(w,p.nodeId,{travelMin:approachMin,cause:"prep-contact",src});
        return Object.assign({}, r, moveRes);
      }
      return r;
    }

    case "walk_advance":                            // WALK-CONSUMPTION (Step A): the party clears a segment → move the cursor
      return (typeof walkAdvance==="function") ? walkAdvance(w,p.toSeg,p.nodeId) : {ok:false, reason:"walk-unavailable"};

    case "walk_update":                             // ON-DEMAND-GEN §4: capture a segment's room-die (effectDie/rolledFace)
      return (typeof walkUpdateSegment==="function") ? walkUpdateSegment(w,p.seg,p.overlay,p.nodeId) : {ok:false, reason:"walk-unavailable"};

    case "walk_complete":                           // WALK-CONSUMPTION (Step B): the walk is walked out → promote+reskin the next
      return (typeof walkComplete==="function") ? walkComplete(w,{nodeId:p.nodeId,abandoned:!!p.abandoned}) : {ok:false, reason:"walk-unavailable"};

    case "capture":                                 // WALK-CONSUMPTION (Step E): subdual → re-entry into the active walk's holding
      return (typeof applyCapture==="function") ? applyCapture(w,p) : {ok:false, reason:"capture-unavailable"};

    /* ---- GAP-WIRING CALLERS (docs/TABLE-GAPS-070126.md §1-5, docs/BATCH3-GUARDRAILS.md J2
       "gap-wiring") — the invocation seams for the five wave-2a tables gap-wiring.js authored as PURE
       engine functions with no call site. This is the caller half BATCH3-PLAN.md unit 1's tracking
       line held OPEN: the script owns the mechanics (chaseInit/chaseRound/chaseYield/downtimeIntent/
       distantWordRoll/shrineOmenRoll, src/world/gap-wiring.js); the DM only declares intent (start a
       chase, spend a downtime week, let word drift in, dress a shrine). GS.chase is the transient chase
       clock, created/cleared HERE (the caller owns it, exactly like GS.combat — gap-wiring's functions
       never touch GS). festival's own seam is applyDriftEffect's `festival` tag (world.wiring-b, fired
       from turnDriftOnRevisit); distant-word ALSO rides the drift `rep` tag — both already live, so this
       adds only the seams that had none, plus a first-class distant_word DM event. ---- */
    case "chase_start":{                              // §1 — a resolved morale-flee + declared pursuit → open the gap clock
      if(typeof chaseInit!=="function") return {ok:false,reason:"gap-wiring-unavailable"};
      if(GS.chase&&GS.chase.active) return {ok:false,reason:"chase-already-active"};   // one chase at a time (mirrors one GS.combat)
      const opts={ targetFid:p.targetFid||null, npcId:p.npcId||null, terrain:p.terrain||null };
      if(!opts.targetFid && !opts.npcId) return {ok:false,reason:"no-quarry"};         // must name the quarry (a combat foe fid XOR a codex npc id)
      GS.chase=chaseInit(opts);
      const foe=opts.targetFid&&GS.combat?(GS.combat.foes||[]).find(f=>f.fid===opts.targetFid):null;
      const rec=(!foe&&opts.npcId&&typeof codexGet==="function")?codexGet(w,opts.npcId):null;
      // CHASE-CONTRACT-FIX.md item 3: #1's fix keeps GS.combat alive through the canonical solo-flee
      // path, so `foe` above resolves in the ordinary case now. This fallback only guards the race
      // the playtest's finding #2 exposed (targetFid resolves nothing — e.g. a stale fid from a
      // combat that already tore down): fall back to the SINGLE fled foe's name when exactly one
      // foe on record is fled, rather than silently degrading to the generic "the quarry" label.
      const fledFoes=(GS.combat&&GS.combat.foes||[]).filter(f=>f.fled);
      const fallbackName=(!foe && fledFoes.length===1) ? fledFoes[0].name : null;
      const quarry=(foe&&foe.name)||(rec&&rec.name)||fallbackName||"the quarry";
      // CHASE-SOFT-RECALL: snapshot the quarry's identity NOW, while GS.combat (or the codexGet
      // record) is still resolvable — by the "away" end GS.combat is legally torn down
      // (COMBAT-LIFECYCLE §3d), so this stamp is the only place the escape-time signals survive.
      // Significance ladder mirrors the kill-event escalation gate (docs/DIFFICULTY.md:60-62 /
      // dm.js victimClass): a foe whose display name is exactly its bestiary entry with no
      // factionId/codexId is a generic mook — ledger prose only, no codex mint on escape.
      const qName=(foe&&foe.name)||(rec&&rec.name)||fallbackName||null;
      const qSignificant=!!( qName && qName!=="the quarry" && (
        (foe&&(foe.codexId||foe.factionId)) || (rec&&rec.id) ||
        (foe&&foe.name && foe.name!=="Walk-on" &&
          (!foe.statId || typeof BESTIARY==="undefined" || !BESTIARY[foe.statId] || foe.name!==BESTIARY[foe.statId].name))
      ));
      GS.chase.quarry={
        name:qName, statId:(foe&&foe.statId)||null, cr:(foe&&foe.cr!=null)?foe.cr:null,
        factionId:(foe&&foe.factionId)||null, codexId:(rec&&rec.id)||opts.npcId||null,
        victimClass:(foe&&foe.victimClass)||null, significant:qSignificant
      };
      addLedger(w,"outcome",{kind:"chase-start",targetFid:opts.targetFid,npcId:opts.npcId,terrain:opts.terrain,gap:GS.chase.gap,source:src},
        "» The chase is on — "+quarry+" runs; the gap holds at "+GS.chase.gap+".");
      return {ok:true, gap:GS.chase.gap, gapSize:GS.chase.gapSize, terrain:GS.chase.terrain, quarry};
    }

    case "chase_round":{                              // §1 — ONE round: caller-supplied pursuerWon from an already-resolved opposed check
      if(!GS.chase||!GS.chase.active) return {ok:false,reason:"no-chase"};
      if(typeof chaseRound!=="function") return {ok:false,reason:"gap-wiring-unavailable"};
      // TRANSITION-CONTRACT.md §3.8 — a chase round ticks the clock +1 minute.
      if(typeof advanceClock==="function") advanceClock(w,1);
      const r=chaseRound(GS.chase, !!p.pursuerWon);
      const comp=r.complication, compLine=comp?(" — "+comp.text):"";
      if(r.ended){
        addLedger(w,"outcome",{kind:"chase-end",outcome:r.outcome,complication:comp?comp.text:null,band:comp?comp.band:null,min:1,source:src},
          (r.outcome==="contact"?"» The gap closes to nothing — contact":"» The quarry slips the leash and is gone")+compLine+".");
        let escRec=null;
        if(r.outcome==="away"){
          escRec=chaseEscapeRecall(w,src,wkStamp);
          if(escRec){
            const q=GS.chase.quarry;
            addLedger(w,"outcome",{kind:"chase-escaped",codexId:escRec.id,name:q.name,source:src},
              "◆ "+q.name+" got away — the world remembers.");
          }
        }
        GS.chase=null;
        return {ok:true, ended:true, outcome:r.outcome, complication:comp};
      }
      addLedger(w,"outcome",{kind:"chase-round",pursuerWon:!!p.pursuerWon,gap:r.chase.gap,complication:comp?comp.text:null,band:comp?comp.band:null,min:1,source:src},
        "» The chase "+(p.pursuerWon?"tightens":"stretches")+" — gap "+r.chase.gap+compLine+".");
      return {ok:true, ended:false, gap:r.chase.gap, complication:comp};
    }

    case "chase_yield":{                              // §1 — either side breaks off (a caller-declared end, not a gap resolution)
      if(!GS.chase) return {ok:false,reason:"no-chase"};
      if(typeof chaseYield!=="function") return {ok:false,reason:"gap-wiring-unavailable"};
      const r=chaseYield(GS.chase, p.side);
      addLedger(w,"outcome",{kind:"chase-yield",side:p.side,outcome:r.outcome,source:src},
        "» "+(p.side==="pursuer"?"The pursuit is broken off":"The quarry gives up the run")+" — "+(r.outcome==="contact"?"contact":"away")+".");
      let escRec=null;
      if(r.outcome==="away"){
        escRec=chaseEscapeRecall(w,src,wkStamp);
        if(escRec){
          const q=GS.chase.quarry;
          addLedger(w,"outcome",{kind:"chase-escaped",codexId:escRec.id,name:q.name,source:src},
            "◆ "+q.name+" got away — the world remembers.");
        }
      }
      GS.chase=null;
      return {ok:true, outcome:r.outcome};
    }

    case "downtime":{                                 // §3 — spend a montage week on a fixed intent; ONE downtime-ledger roll, tier-scaled payout
      if(typeof downtimeIntent!=="function") return {ok:false,reason:"gap-wiring-unavailable"};
      const r=downtimeIntent(w, p);                    // {ok:false} for bad-intent / no-table / seek-work-unbuilt passes straight through
      if(!r.ok) return r;
      // TRANSITION-CONTRACT.md §3.8/§2 — a downtime week ALWAYS ticks the full week (incl. seek-work,
      // E25), BEFORE the yield lands (distant-word salience reads the post-week day). ONE montage turn,
      // not seven (ruling — WORLD-TURN T1 fires per long elapse, not per day).
      if(typeof advanceClock==="function"){ advanceClock(w,TRANS_CLOCK_MAX_MIN); if(typeof worldTurn==="function") worldTurn(w,"montage"); }
      if(r.intent==="seek-work"){                      // routed to JOB-WALKS (postings, no payout roll) — the board IS the yield
        addLedger(w,"outcome",{kind:"downtime",intent:r.intent,postings:(r.postings||[]).length,source:src},
          "…a week seeking work — "+((r.postings||[]).length)+" posting"+((r.postings||[]).length===1?"":"s")+" on the board.");
        return r;
      }
      const payout=r.payout||{};
      // gold rides the SAME item_changed mutator loot/buy-sell uses — never a bespoke coin write (anti-drift).
      let goldApplied=0;
      if(payout.gold){ const gr=applyEvent(w,{type:"item_changed",payload:{gold:payout.gold},source:"detected"}); goldApplied=(gr&&typeof gr.gold==="number")?gr.gold:0; }
      // a fresh face rides the SAME drift-contact path (rollNPC soft-mint at the node) — no bespoke mint.
      let contactId=null;
      if(payout.mintContact && typeof driftEffectContact==="function"){ const c=driftEffectContact(w,w.currentNodeId); contactId=(c&&c.id)||null; }
      // a rumor chains through the real distant-word binder (a real ledger fact, DM holds the truth).
      let distant=null;
      if(payout.distantWord){ const dr=applyEvent(w,{type:"distant_word",payload:{},source:"detected"}); distant=(dr&&dr.ok)?{lensKind:dr.lensKind,text:dr.text}:null; }
      // condition/thread stay FLAGS for the DM to narrate — the parser knows THAT a thread/condition is owed,
      // never WHICH one; inventing a specific condition/thread name here would be the exact G9 guess we forbid.
      addLedger(w,"outcome",{kind:"downtime",intent:r.intent,band:r.band,gold:goldApplied,contactId,
        distantWord:!!distant,condition:!!payout.condition,thread:!!payout.thread,threadMajor:!!payout.threadMajor,source:src},
        "…a week of "+r.intent+" — "+r.text+(goldApplied?(" ("+(goldApplied>0?"+":"")+goldApplied+" gp)"):""));
      return {ok:true, intent:r.intent, text:r.text, band:r.band, gold:goldApplied, contactId, distant,
              flags:{condition:!!payout.condition, thread:!!payout.thread, threadMajor:!!payout.threadMajor}};
    }

    case "distant_word":{                             // §2 — word of a far-off place drifts in (a distortion LENS over a REAL ledger fact)
      if(typeof distantWordRoll!=="function") return {ok:false,reason:"gap-wiring-unavailable"};
      const d=distantWordRoll(w, p);
      if(!d) return {ok:false,reason:"no-table"};
      // the PLAYER hears the (possibly distorted) telling `d.text`; the TRUE fact rides dmOnly, never shown.
      addLedger(w,"drift",{kind:"distant-word",lensKind:d.lensKind,boundLedgerId:d.fact?d.fact.ledgerId:null,
        fromNodeId:d.fact?d.fact.nodeId:null,dmOnly:{realFact:d.dm?d.dm.realFact:null},source:src},
        "…word drifts in — "+d.text);
      return {ok:true, lensKind:d.lensKind, text:d.text, fact:d.fact, dm:d.dm};
    }

    /* TRANSITION-CONTRACT.md §3.1 — the ONE DM hand-wave time lever. Every mechanical path auto-ticks
       (the tick table, §2); this is the sanity-clamped escape hatch for everything else ("a week
       passes", "the crossing takes a day"). Never fires inside live combat — rounds own combat time. */
    case "advance_clock":{
      let min=(typeof p.minutes==="number")?p.minutes:(typeof p.hours==="number"?p.hours*60:(typeof p.days==="number"?p.days*1440:null));
      if(min==null) return {ok:false, reason:"no-minutes"};
      min=Math.round(min);
      if(min<1) return {ok:false, reason:"bad-minutes:"+min};
      if(GS.combat && GS.combat.active) return {ok:false, reason:"combat-active"};
      const clamped=Math.min(min, TRANS_CLOCK_MAX_MIN), wasClamped=clamped!==min;
      const c=advanceClock(w, clamped);
      if(clamped>=1440 && typeof worldTurn==="function") worldTurn(w,"montage");
      addLedger(w,"transition",{kind:"dm-clock",advanceMin:clamped,cause:p.cause||null,clamped:wasClamped,source:src},
        "⌛ "+(p.cause||"Time passes")+" — now Day "+c.day+", "+timeOfDay(c.min)+".");
      return {ok:true, minutes:clamped, clamped:wasClamped, day:c.day, min:c.min, band:timeOfDay(c.min)};
    }

    /* TRANSITION-CONTRACT.md §3.2 — the narrative jump (no walk, no encounters). move_node NEVER
       mints (that's discovery's job); refuses onto the current node, an unknown node, or mid-walk. */
    case "move_node":{
      if(!p.nodeId || !mapOf(w).nodes[p.nodeId]) return {ok:false, reason:"no-node:"+p.nodeId};
      if(p.nodeId===w.currentNodeId) return {ok:false, reason:"already-there"};
      if(prepOf(w).activeWalkId) return {ok:false, reason:"walk-active"};
      const min=(typeof p.travelMin==="number")?p.travelMin:((typeof findEdge==="function" && findEdge(w,w.currentNodeId,p.nodeId))?findEdge(w,w.currentNodeId,p.nodeId).travelMin:60);
      return Object.assign({ok:true}, pcMoveTo(w,p.nodeId,{travelMin:min,cause:p.cause||null,src}));
    }

    /* TRANSITION-CONTRACT.md §3.5 — sugar over prep_contact, enter defaults TRUE. The player/DM-facing
       wrapper for setting out toward a rumored (soft) or already-locked frontier. */
    case "start_walk":{
      if(!p.nodeId) return {ok:false, reason:"no-node"};
      const P=(typeof prepOf==="function")?prepOf(w):null;
      if(!(P&&P.nodes&&P.nodes[p.nodeId])) return {ok:false, reason:"no-prepped-walk:"+p.nodeId};
      return applyEvent(w,{type:"prep_contact",payload:{nodeId:p.nodeId,enter:(p.enter!=null?!!p.enter:true)},source:src});
    }

    /* TRANSITION-CONTRACT.md §3.6 — "play the road" (as opposed to move_node's narrative jump).
       No travel_arrive event — arrival is walk_complete on a kind:"travel" walk. */
    case "travel_start":{
      if(!p.toNodeId) return {ok:false, reason:"no-node"};
      if(typeof travelDepart!=="function") return {ok:false, reason:"travel-unavailable"};
      return travelDepart(w,p.toNodeId,{travelMin:p.travelMin,cause:p.cause||null});
    }

    /* TRANSITION-CONTRACT.md §3.7 — the no-damage-math KO (sap, sleep, narrative subdual). Applies the
       drop as a detected ledgered fact INSIDE applyKnockout (do NOT recurse into hp_changed). */
    case "knockout":{
      const t=livingSheet(w); if(!t) return {ok:false, reason:"no-pc"};
      if(t.sh.deathSaves) return {ok:false, reason:"already-dying"};
      const ko=applyKnockout(w,t,p.cause||null);
      return {ok:true, ko:true, wakeInMin:ko.wakeInMin};
    }

    case "shrine_omen":{                              // §5 — dress a shrine/omen, its `[the myth]` bound to the world's OWN rolled myth
      if(typeof shrineOmenRoll!=="function") return {ok:false,reason:"gap-wiring-unavailable"};
      const s=shrineOmenRoll(w);
      if(!s) return {ok:false,reason:"no-table"};
      addLedger(w,"outcome",{kind:"shrine-omen",band:s.band,mythBound:!!s.myth,source:src}, "✧ "+s.text);
      return {ok:true, text:s.text, band:s.band, myth:s.myth};
    }

    case "tarot_landed":{                             // TAROT-2 §3.3 — the DM judges an interpretive landing real
      if(typeof tarotMarkLanded!=="function") return {ok:false, reason:"tarot-unavailable"};
      if(!w.tarot) return {ok:false, reason:"no-draw"};
      const rec = tarotMarkLanded(w, { via:p.via, ref:p.ref||null, detected:false });
      return { ok:true, landed:(w.tarot.landed||[]).length, deduped:!rec };
    }

    case "xp_granted":                               // the DM does NOT grant XP (DM-CHARTER §8.3b)
      // XP is detected from the priced beat-events, never DM-declared. The DM judges WHEN a beat
      // lands (emits front_closed / clock_fired / choice_logged / encounter_resolved); the script
      // owns the NUMBER. A raw xp_granted is intentionally a no-op so the door we closed in the
      // 2026-06-28 rebalance can't be re-opened. Surfaced (not silent) so a stray emit is visible.
      console.warn("[dm] xp_granted ignored — XP is detected, not DM-declared (DM-CHARTER §8.3b):",e);
      return {ok:false, reason:"xp-not-dm-granted"};

    case "open_shop":{                               // docs/SHOP-UI.md §2b — the DM opens a merchant in-fiction
      w.shops=w.shops||{};                            // (or the dev "Open test shop" affordance, no live DM needed)
      let shop=p.shopId ? w.shops[p.shopId] : null;    // re-visiting a known merchant → its depleted coin/stock persist
      if(!shop){
        const id=p.shopId || p.codexId || (typeof slug==="function" ? slug(p.name||"shop-"+uid()) : "shop-"+uid());
        // REGIONS-NAMES.md §1: econTilt nudges the shop's tier by up to +/-1 (PLACE_TIERS-clamped) —
        // "econTilt nudges shop stock" (a higher tier both stocks more AND unlocks higher rarities).
        // regionPeekNode is READ-ONLY (never mints/rolls as a side effect of opening a shop) — the
        // nudge only applies once the node's region was genuinely established through real play.
        const shopNodeId=p.nodeId||w.currentNodeId;
        const region=(typeof regionPeekNode==="function")?regionPeekNode(w,shopNodeId):null;
        const tier=(typeof regionClampTier==="function")
          ? regionClampTier(p.tier, (typeof regionEconBump==="function")?regionEconBump(region):0) : p.tier;
        // TAROT-SESSION.md §1: a Coins-domain draw (or a few Majors) multiplies THIS shop's stock qty
        // — tarotStockMult defaults to 1.0 (no-op) without a draw.
        const stockMult=(typeof tarotStockMult==="function" && typeof tarotVectorOf==="function") ? tarotStockMult(tarotVectorOf(w)) : 1.0;
        shop=(typeof makeShop==="function") ? makeShop({tier, archetype:p.archetype, nodeId:shopNodeId, name:p.name, id, codexId:p.codexId, stockMult}) : {id, stock:[], coin:0};
        shop.id=id;
        w.shops[id]=shop;
      }
      GS.activeShopId=shop.id; GS.gamePanel="shop"; GS.shopTab="buy"; GS.shopSel=null;
      renderWorld();
      return {ok:true, shopId:shop.id};
    }

    /* CROWNING-BASTION.md §7.B1.2 — the bastion claim (player/declared source — a decision, not a
       DM invention). Legality is engine-checked: the node must be known, currently safe (no live
       combat), and CLAIM-PRICED (Q5 either-gate: a closed front on the books OR a tier-scaled gold
       price — never free). ONE bastion per world (Q6). */
    case "bastion_claim":{
      const t=livingSheet(w); if(!t) return {ok:false,reason:"no-pc"};
      if(w.bastion) return {ok:false,reason:"bastion-exists"};                 // Q6 — one per world
      if(!p.nodeId || !p.name) return {ok:false,reason:"need-node-and-name"};
      const known=!!(mapOf(w).nodes[p.nodeId] && mapOf(w).nodes[p.nodeId].seen); // node must be known
      if(!known) return {ok:false,reason:"unknown-node"};
      // safety: no live combat at the node (a bastion is claimed in peace)
      if(GS.combat && GS.combat.active) return {ok:false,reason:"unsafe-combat"};
      // Q5 EITHER-gate: a closed front on the books OR a gold price (tier-scaled). Deed OR coin.
      const hasDeed=(w.pressures||[]).some(pr=>pr.closed);
      const price=bastionPrice(w);
      let paid=false;
      if(!hasDeed){
        const gold=(t.sh.gold||0);
        if(gold<price) return {ok:false,reason:"cannot-afford:"+price};
        t.sh.gold=gold-price; paid=true;                                      // the economy's missing large sink
      }
      w.bastion={ nodeId:p.nodeId, name:String(p.name).trim(), foundedDay:(clockOf(w).day),
        foundedBy:{pcId:t.c.id,name:t.c.name}, vault:[], note:p.note||null,
        claimedBy:hasDeed?"deed":"gold", pricePaid:paid?price:0 };
      // codex location record so the relational layer sees it (origin:"bastion")
      if(typeof codexAdd==="function") codexAdd(w,{ id:"location:bastion-"+slug(p.name), kind:"location",
        name:w.bastion.name, provenance:"declared", origin:"bastion",
        fields:{ nodeId:p.nodeId }, status:{known:true, at:p.nodeId} });
      addLedger(w,"canon",{kind:"bastion-claimed",name:w.bastion.name,nodeId:p.nodeId,by:t.c.name,via:w.bastion.claimedBy},
        "⌂ "+t.c.name+" claims "+w.bastion.name+" as a bastion"+(hasDeed?" (by deed)":" (for "+price+" gp)")+".");
      return {ok:true, bastion:{name:w.bastion.name,nodeId:p.nodeId,via:w.bastion.claimedBy}};
    }

    /* ---- URBAN FABRIC (docs/URBAN-FABRIC.md) — districts mint once per node on first entry;
       typed buildings mint SOFT on approach and lock on contact. The script owns the mint/lock
       mechanics (mintDistricts/buildingApproach/buildingContact, src/world/urban.js); the DM only
       declares intent (which node, which building type). ---- */
    case "district_mint":{                            // §2 — mint this node's districts (idempotent)
      if(typeof mintDistricts!=="function") return {ok:false,reason:"urban-unavailable"};
      const r=mintDistricts(w, p.nodeId||w.currentNodeId, {tier:p.tier});
      return {ok:true, ids:r.ids, minted:r.minted};
    }
    case "building_approach":{                         // §1/§3 — mint a typed building, SOFT, at a node
      if(typeof buildingApproach!=="function") return {ok:false,reason:"urban-unavailable"};
      const r=buildingApproach(w, p.buildingType, {nodeId:p.nodeId||w.currentNodeId, name:p.name, tier:p.tier});
      if(!r.ok) return r;
      addLedger(w,"outcome",{kind:"building-approach",id:r.id,buildingType:p.buildingType,nodeId:p.nodeId||w.currentNodeId,source:src},
        `A ${p.buildingType} comes into view — ${r.record.name}.`);
      return {ok:true, id:r.id, proprietorId:r.proprietorId, shopId:r.shop?r.shop.id:null};
    }
    case "building_contact":{                          // §3/§4 — the player TOUCHES it → lock + tavern surface
      if(typeof buildingContact!=="function") return {ok:false,reason:"urban-unavailable"};
      const r=buildingContact(w, p.id);
      if(!r.ok) return r;
      const rec=(typeof codexGet==="function")?codexGet(w,p.id):null;
      addLedger(w,"canon",{kind:"building-contact",id:p.id,buildingType:r.type,source:"play"},
        `◆ ${(rec&&rec.name)||r.type} — entered; locked to canon.`);
      return r;
    }

    /* ---- JOB WALKS (docs/JOB-WALKS.md, docs/BATCH3-GUARDRAILS.md J2 "job-walks") — the tier-scaled
       notice board. The script owns the mint/mint-walk/payout mechanics (jobBoardRead/jobWalkAccept,
       src/world/job-walks.js); the DM only declares intent (read the board, accept a posting). ---- */
    case "job_board_read":{                            // §1 — a board read: 2-3 tier-scaled postings
      if(typeof jobBoardRead!=="function") return {ok:false,reason:"job-walks-unavailable"};
      const postings=jobBoardRead(w, {nodeId:p.nodeId||w.currentNodeId, tier:p.tier});
      return {ok:true, postings};
    }
    case "job_accept":{                                // §2 — accepting mints a real 1-3 segment walk
      if(typeof jobWalkAccept!=="function") return {ok:false,reason:"job-walks-unavailable"};
      const r=jobWalkAccept(w, p.postingId);
      return r;
    }

    default:
      console.warn("[dm] unknown event type — no-op (forward-compatible):",e.type,e);
      return {ok:false, reason:"unknown-type:"+e.type};
  }
}
