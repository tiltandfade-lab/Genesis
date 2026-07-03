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
// ITEMS (docs/ITEMS.md): the three named equip slots. NOT a single pointer — two-weapon fighting
// needs mainHand + offHand equipped at once, which a single "equipped weapon" field can't represent.
const EQUIP_SLOTS = ["mainHand", "offHand", "armor"];

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
        effectDie: (reskin&&reskin.effectDie)||null
      };
    }),
    cast:pn.cast||null,
    rule:"The walk the party is ON. Narrate the CURRENT segment; the rest is the road ahead/behind. "+
         "Honor the rolls (reskin by ref, never rewrite). A SOFT prior — player intent and the live "+
         "situation override it; you track where they are, you don't steer them down it. Clear a "+
         "segment → emit {type:'walk_advance',payload:{toSeg:N}}; at the finale → {type:'walk_complete'}."
  };
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
  return { atNodeId:w.currentNodeId, walkNodeId:walkId, castIds, mintIds, ackSeq:(w.dm&&w.dm.digestAckSeq)!=null?w.dm.digestAckSeq:0 };
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
      level:(sh&&sh.level)||1, hp:sh?sh.hp:null, ac:sh?sh.ac:null, profBonus:sh?sh.profBonus:null,
      scores:sh?sh.scores:null, mods:sh?sh.mods:null,
      saveProfs:sh?sh.saveProfs:[], skillProfs:sh?sh.skillProfs:[],
      conditions:cur.conditions||[], feat:sh?sh.feat:null,
      marks:sh?(sh.marks||[]):[],   // TIYL-DEEPENING §3.1 — permanent, DM-narratable (small; rides every turn like any other sheet fact)
      // TIYL-DEEPENING §3.5: the full rolled life, send-once (founding turn only — see tiylLifeDigest).
      life: foundingTurn ? (typeof tiylLifeDigest==="function"?tiylLifeDigest(cur):null) : null,
      resources:(sh&&typeof resourceDigest==="function")?resourceDigest(sh):null,
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
      toolsCharms:(sh&&typeof socialToolCharmDigest==="function")?socialToolCharmDigest(sh):null
    } : null,
    powers:(w.factions||[]).map(f=>({
      id:slug(f.name), faction:f.name, dominant:!!f.dominant, agenda:f.agenda, method:f.method,
      tags:f.tags||[], clock:f.clock.filled+"/"+f.clock.size
    })),
    fronts:(w.pressures||[]).map(p=>({
      id:slug(p.danger||p.kind), kind:p.kind, danger:p.danger, impersonal:p.impersonal||null,
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
    arrivalBrief:(typeof turnArrivalBrief==="function")?turnArrivalBrief(w,w.currentNodeId):null
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
  const applied=(r.events||[]).map(e=>({type:e.type, res:applyEvent(w,e)}));
  const latencyMs=(GS.dm.turnStart?Date.now()-GS.dm.turnStart:null); GS.dm.turnStart=null;   // turn round-trip (player send → DM answer)
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
  w.dm={rollReq:GS.dm.rollReq, ask:GS.dm.ask, pendingTurnId:null, lastNarratedNodeId:narratedNode,
        digestAckSeq:ackSeq, mintQueue, sessionSeqWatermark};
  saveU(U); renderWorld(); postState();          // the DM sees post-event state next turn
  wakeReveal();                                  // first words have landed — lift the prep cinematic
  // §7: top up the reserve in the idle window (player is reading) — after the world is saved/rendered.
  if(typeof genReserveTopUp==="function"){ genReserveTopUp(w); saveU(U); }
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
  if(br && die!==20 && die!==1 && typeof resolveCheck==="function" && typeof rq.dc==="number"){
    resolveBranch(w,rq,rolls,total);   // renders DM-voice entry + applies events + sets lastResolution; NO sendTurn
  } else {
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
  const branchKey=(chk.degree==="crit-success"||chk.degree==="success")?"success"
                  :(chk.degree==="near-miss")?"nearMiss":"fail";
  // missing-branch fall-through (§5 assertion 4): nearMiss absent → fall to fail's branch; if THAT'S
  // absent too (or the picked key has no branch at all), there's nothing declared for this outcome —
  // fall through to the live two-turn flow rather than inventing narration.
  const br=rq.branches||{};
  const branch=br[branchKey] || (branchKey==="nearMiss" ? br.fail : null);
  if(!branch){ sendTurn("(I roll "+skill+": "+total+")",rolls).catch(()=>{}); return; }
  const events=(branch.events||[]).map(e=>Object.assign({},e,{source:"branch"}));
  const applied=events.map(e=>({type:e.type, res:applyEvent(w,e)}));
  pushDmLog(w,"dm",branch.narration||"",{events, applied, branchResolved:true, turnId:null});
  GS.dm.animate=true;   // stream the branch narration exactly like a live DM reply
  const turnId="t-"+uid();
  w.dm=w.dm||{}; w.dm.rollReq=null; w.dm.ask=null;   // clear the PERSISTED request too — renderWorld's re-hydration guard (render.js) would otherwise restore it from w.dm and re-fire the branch
  w.dm.lastResolution={ turnId, skill, total, degree:chk.degree, branch:branchKey };
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
  GS.dm.rollReq=null;
  const rolls=[{label:lab,die:r.expr,result:r.total,total:r.total,expr:r.expr,breakdown:r.show}];
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

function applyEvent(w,e){
  if(!w||!e||!e.type) return {ok:false, reason:"malformed"};
  const p=e.payload||{}, src=e.source||"declared";
  const wkStamp=(typeof walkStamp==="function")?walkStamp(w):null;   // WALK-CONSUMPTION (Step C): which walk/segment this beat came from
  switch(e.type){

    case "hp_changed":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const delta=(typeof p.delta==="number")?p.delta:0;
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
      if(delta>0 && r.to>0 && typeof clearDeathSaves==="function") clearDeathSaves(t.sh);

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
        }
      }

      // DEATH (§4): a LIVING PC dropped to 0 → death-save tracker; MASSIVE damage (overkill ≥ max HP) →
      // instant death, skipping the saves entirely. Damage taken WHILE already at 0 → an auto-fail
      // (two on a crit / melee-in-5ft). All route into the existing Death & Rebirth flow at 3 fails / massive.
      if(delta<0 && r.to<=0){
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
      const r=resolveDeathSave(t.sh,p.d20);
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
      const res=pcAttack(t.sh,{d20:p.d20,targetAC:p.targetAC,slot:p.slot,cover:effCover,advantage:p.advantage,crit:p.crit,
        attacker:(GS.combat&&GS.combat.pc)||null,target:targetFoe,allies:(GS.combat&&GS.combat.pc)?[GS.combat.pc]:null});
      if(!res)return {ok:false,reason:"no-weapon"};   // no INDEXED weapon in the slot — the DM resolves manually (o.dmg), by design
      const idxTag=(p.attackIndex!=null && p.attackIndex>0)?(" (swing "+(p.attackIndex+1)+")"):"";
      const line=res.fullCover?(t.c.name+" — no line to the target (full cover)")
        :res.hit?(t.c.name+" hits with "+res.weaponName+idxTag+(res.crit?" — CRITICAL":"")+" for "+res.damage+" damage")
        :(t.c.name+" misses with "+res.weaponName+idxTag+" ("+res.natural+"+"+res.atkBonus+"="+res.total+" vs AC "+res.targetAC+")");
      addLedger(w,"outcome",{kind:"attack",pc:t.c.name,weapon:res.weaponName,attackIndex:p.attackIndex||0,hit:res.hit,crit:res.crit,damage:res.damage,
        natural:res.natural,total:res.total,targetAC:res.targetAC,breakdown:res.breakdown,source:src},"⚔ "+line+".");
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
       same way. One hazard vocabulary shared with ITEMS.md §D's elemental-effects map. */
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
        const s=startConcentration(t.sh,name,round);
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
      const s=startConcentration(t.sh,p.spell,round);
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
      const kind=(p.kind==="long")?"long":"short";
      const summary=restRecover(t.sh,kind);
      // a long rest also refills magic-item charges to max (docs/ITEMS.md §E — the canonical dawn recharge,
      // simplified to "full on a long rest"; per-item recharge dice are a DM call via charge_restore).
      let recharged=0;
      if(kind==="long"){ (t.sh.inventory||[]).forEach(it=>{ if(it.ench&&it.ench.charges&&it.ench.charges.cur!==it.ench.charges.max){ it.ench.charges.cur=it.ench.charges.max; recharged++; } }); }
      // EXHAUSTION (§5): a long rest with adequate food/water reduces exhaustion by 1 (SRD 2024).
      // TEMP HP (§4): lost on a long rest (never persists past it).
      let exhaustionAfter=null;
      if(kind==="long"){
        if(typeof removeExhaustion==="function") exhaustionAfter=removeExhaustion(t.sh,1);
        if(typeof clearTempHp==="function") clearTempHp(t.sh);
      }
      addLedger(w,"outcome",{kind:"rest",pc:t.c.name,rest:kind,restored:summary,recharged:recharged,
        exhaustion:exhaustionAfter,source:src},
        "✦ "+t.c.name+" takes a "+kind+" rest — restored: "+summary+
        (recharged?("; "+recharged+" item"+(recharged>1?"s":"")+" recharged"):"")+
        (exhaustionAfter!=null?("; exhaustion "+exhaustionAfter+"/6"):"")+".");
      return {ok:true,rest:kind,restored:summary,exhaustion:exhaustionAfter};
    }

    case "item_changed":{                            // INVENTORY mutation — the ONE event that touches gear/coin
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // (confiscation / loot / buy-sell / consume). Removed items are
      const sh=t.sh; sh.inventory=sh.inventory||[];                          // RECOVERABLE: the ledger records exactly what left, so a later add[] restores it.
      // ENCUMBRANCE HARD CAP (docs/ITEMS.md Decision 4 — "no barrelmancers"): a pickup that would push the
      // load past STR×30 is refused outright (surfaced, not silent). Skipped when the DM forces it (p.force)
      // or when the item's weight is unknown (unindexed → 0, never invents). Removes/confiscation are never blocked.
      if((p.add||[]).length && !p.force && typeof carryState==="function" && typeof itemDef==="function"){
        const cur=carryState(sh), hard=cur.hard;
        const addW=(p.add||[]).reduce((s,spec)=>{ const nm=String((spec&&spec.name!=null?spec.name:spec)||"").trim();
          const d=itemDef((spec&&spec.base)||nm); const q=(spec&&typeof spec.qty==="number"&&spec.qty>0)?spec.qty:1;
          return s+((d&&d.weight)||0)*q; },0);
        if(cur.weight+addW>hard) return {ok:false,reason:"over-capacity",weight:cur.weight,add:addW,hard:hard,
          note:t.c.name+" can't carry that much — over the "+hard+" lb hard cap."};
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
      let gold=0;
      if(typeof p.gold==="number" && p.gold){ const before=sh.gold||0; sh.gold=Math.max(0, before+p.gold); gold=sh.gold-before; }   // signed delta, clamped at 0
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
      ench.charges.cur=(typeof p.n==="number")?Math.min(max,cur+Math.max(0,Math.floor(p.n))):max;
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
      return {ok:true,condition:cond,ttl:entry.ttl};
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
      addLedger(w,"outcome",{kind:"morale",foe:foe.fid,name:foe.name,trigger,dc:v.dc,autoPass:v.autoPass,natural:v.natural,total:v.total,held:v.held,disposition:v.disposition,parleyWant,huntedBehavior,source:src},
        v.autoPass?`✦ Morale (${trigger}): ${foe.name} — no fear to break (auto-passes).`
        :`✦ Morale (${trigger}, DC ${v.dc}): ${foe.name}'s nerve — ${v.natural}+... = ${v.total} — ${v.held?"holds, fights on":("breaks → "+v.disposition)}${parleyWant?(" — wants: "+parleyWant):""}${huntedBehavior?(" — "+huntedBehavior):""}.`);
      return {ok:true, held:v.held, dc:v.dc, disposition:v.disposition, autoPass:v.autoPass, parleyWant, huntedBehavior};
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
      if(!autoplayEligible(foe))return {ok:false,reason:"not-autoplay-eligible"};
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const targetAC=(t.sh.ac!=null)?t.sh.ac:10;
      const r=resolveFoeTurn(foe,GS.combat,{ac:targetAC});
      if(!r.attack){
        addLedger(w,"outcome",{kind:"foe-turn",foe:foe.fid,name:foe.name,resolvable:false,proposal:r.proposal,source:src},
          `⚔ ${foe.name} — ${(r.proposal&&r.proposal.rationale)||"acts"} (no resolvable attack — the DM narrates).`);
        return {ok:true, proposal:r.proposal, attack:null};
      }
      const res=r.attack;
      addLedger(w,"outcome",{kind:"foe-turn",foe:foe.fid,name:foe.name,action:r.actionName,hit:res.hit,damage:res.damage,
        natural:res.natural,total:res.total,targetAC:res.targetAC,proposal:r.proposal,source:src},
        "⚔ "+foe.name+" — "+(res.hit?("hits with "+(r.actionName||"an attack")+" for "+res.damage+" damage"):"misses")+".");
      if(res.hit && res.damage>0) applyEvent(w,{type:"hp_changed",payload:{delta:-res.damage,crit:res.crit},source:"detected"});
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
      const r=codexAdd(w,p); return {ok:true, id:r.id};
    }
    case "codex_link":{                              // typed relationship (wikilink)
      if(typeof codexLink!=="function") return {ok:false,reason:"codex-unavailable"};
      codexLink(w,p.from,p.rel,p.to); return {ok:true};
    }
    case "codex_update":{                            // revise interpreted fields / status (condition, at, …)
      if(typeof codexUpdate!=="function") return {ok:false,reason:"codex-unavailable"};
      const r=codexUpdate(w,p.id,p); return {ok:!!r};
    }
    case "codex_reveal":{                            // slow drip — the player now knows of this entity
      if(typeof codexReveal!=="function") return {ok:false,reason:"codex-unavailable"};
      codexReveal(w,p.id); reveal(w,'gaz'); return {ok:true};
    }
    case "codex_contact":{                           // player TOUCHED it → lock to canon forever (§8b)
      if(typeof codexContact!=="function") return {ok:false,reason:"codex-unavailable"};
      const r=codexContact(w,p.id);
      if(r) addLedger(w,"canon",{kind:"codex-contact",id:p.id,source:"play"},`◆ ${r.name} — encountered; locked to canon.`);
      return {ok:!!r};
    }

    /* ---- SOCIAL (docs/SOCIAL.md §5): attitude / parley / morale — the social analog of combat. The DM
       DECLARES the open roll (skill + total + visible levers); the SCRIPT prices the DC from CURRENT
       attitude (§2) and COMPUTES the shift — the DM can only report the dice, never inflate the result
       (§5 anti-drift). Committed only through the codex writers; the DM narrates TO the returned delta. ---- */
    case "social_check":{                            // declared open roll → resolver → committed attitude shift
      if(typeof resolveSocialCheck!=="function"||typeof codexGetAttitude!=="function") return {ok:false,reason:"social-unavailable"};
      const a=codexGetAttitude(w,p.target); if(!a) return {ok:false,reason:"no-target:"+(p.target||"?")};
      const levers=p.levers||(p.lever?[p.lever]:[]);
      const lev=applyLeverage(socialDC(a.value), levers);
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
      if(res.terrified) codexSetTerrified(w,p.target,true,clk);
      else if(res.to!==res.from) codexSetAttitude(w,p.target,res.to,p.cause||p.skill||"social",clk);
      const rec=codexGet(w,p.target), nm=rec?rec.name:p.target;
      const verb = res.terrified?"is cowed by fear"
        : res.outcome==="wall"?"will not be moved — a wall"
        : res.shift>0?"warms":(res.shift<0?"hardens":"holds");
      addLedger(w,"outcome",{kind:"social",target:p.target,name:nm,skill:p.skill,from:res.from,to:res.to,
        outcome:res.outcome,granted:res.granted,leverMod:lev.mod,dc:lev.dc,source:src},
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
      const r=codexSetAttitude(w,p.target,p.to,p.cause||"shift",clockOf(w).day);
      const rec=codexGet(w,p.target), nm=rec?rec.name:p.target;
      addLedger(w,"outcome",{kind:"social",target:p.target,name:nm,from:a.value,to:r.value,cause:p.cause||null,source:src},
        `✦ ${nm} — ${attitudeLabel(a.value)} → ${attitudeLabel(r.value)}${p.cause?(" ("+p.cause+")"):""}.`);
      return {ok:true, from:a.value, to:r.value};
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
      const dc=(p.dc!=null)?p.dc:insightReadDC({guarded:p.guarded,masking:p.masking,mentalMods:p.mentalMods,bestMentalMod:p.bestMentalMod});
      const read=(Number(p.total)||0)>=dc;
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
      return {ok:true, nodeId:nodeId};
    }

    case "clock_advanced":{
      const tgt=findClockTarget(w,p.clockId), d=(typeof p.delta==="number"?p.delta:1);
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
      return {ok:true};
    }

    case "kill":{
      addLedger(w,"outcome",{kind:"kill",victimClass:p.victimClass,factionId:p.factionId||null,walk:wkStamp,source:src},
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
      const opts={d20:p.d20,advantage:p.advantage,bonus:p.bonus,reroll:p.reroll};
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
      return {ok:true, canon, tier};
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
        // WORLD-TURN §1 T3: stamp the DEPARTURE day at the node the party is leaving, before the move.
        if(typeof turnStampVisit==="function"&&w.currentNodeId) turnStampVisit(w,w.currentNodeId);
        w.currentNodeId=p.nodeId; seeNode(w,p.nodeId);
        // WORLD-TURN §1/§3 T3: the core revisit trigger — resolve drift lazily, right on arrival.
        if(typeof worldTurn==="function") worldTurn(w,"revisit",{nodeId:p.nodeId});
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
