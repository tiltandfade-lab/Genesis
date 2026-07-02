/* GENESIS MODULE — src/world/job-walks.js — JOB WALKS: the notice board that mints adventures
   (docs/JOB-WALKS.md, docs/BATCH3-GUARDRAILS.md J1/J2 "job-walks"). Classic <script>, shared global
   scope. Registered in manifest.json; validated by build/check-manifest.py.

   Adam's directive (JOB-WALKS §0): the 300-row npc-job-board (`npc-job-board`, d300, spice-graded)
   is L1-flavored by default. Jobs now SCALE (pay + threat by place tier) and ACCEPTING one GENERATES
   a walk — even a 1-2 segment errand. §1 the posting: rolled at a board read, carries the row text +
   a tier-scaled pay + a rolled env hint (urban/wilderness/dungeon — the row text carries no env tag,
   so this is a fresh uniform roll, never a guessed text-match, per G9) + a rolled NPC poster (soft
   codex, warms on recurrence). §2 accepting mints a REAL 1-3 segment walk via the existing rollers
   (rollUrbanWalk/rollWildernessWalk/rollDungeonWalk) — segments = 1 + tier, threat = tier, the walk's
   finale binds objectiveRef so the existing combat XP bonus (advancement.js's objBonus) applies.
   Completion pays gold (mirrors ECONOMY-SINKS' direct item_changed-shaped mutation, e.g. play.js's
   lodging charge) + warms the poster's attitude (codexSetAttitude — no faction exists for a bare
   rolled NPC, so this is NPC-level, not repuApplyDeed's faction ledger) + flags a follow-up (the
   employer's next posting reads warmer). §3: unclaimed postings persist a TTL then resolve WITHOUT
   the player (a ledger drift line) — never silently forgotten, never persisted forever (the spec's
   own mutation check).

   BATCH3-GUARDRAILS J2 rulings honored verbatim: TIER_PAY = [3,8,20,50] gp base by tier (provisional);
   posting TTL = 4 + 1d4 days; unclaimed resolution rolls 1d6: 1-3 someone-else-took-it (ledger line),
   4-6 it-got-worse (the relevant clock +1 — "the relevant clock" reconciled against merged reality:
   this codebase's only per-faction clock is w.factions[].clock, so "it got worse" bumps the POSTER's
   linked faction clock when one exists; no faction link on a bare rolled NPC → the bump is skipped,
   flagged, never invented, matching every other null-safe degrade in this codebase).

   NULL-SAFE throughout (matches WORLD-TURN/URBAN-FABRIC convention): an uncompiled npc-job-board, a
   missing walk roller, or a caller passing a bad posting id all degrade to a flagged {ok:false,reason}
   — never a fabricated result. Reads addLedger/clockOf/nodeName/addNode/addEdge/findEdge/rollRoute/slug
   (world.state), codexAdd/codexGet/codexSetAttitude/codexContact (world.codex), rollTable/rollDie/pick/
   uid (engine.core/compiled), rollNPC (engine.codex-roll), rollUrbanWalk (engine.walk),
   rollDungeonWalk (engine.dungeon-walk), rollWildernessWalk (engine.wild-walk), regionForNode/
   regionPeekNode/regionClampTier/regionEconBump (engine.region), nodeLodgingTier/nodeInhabited
   (world.prep), prepOf/walkSetActive (world.prep), livingSheet (world.dm) at call-time. */

/* TIER_PAY (J2, FINAL) — base gp by PLACE tier (PLACE_TIERS' 0..3 index — hamlet/village/town/city),
   NOT the PC-progression TIER_CAP (docs/TIER-SCOPE.md's level-10 cap is a different axis entirely).
   Provisional constants — the one file to retune after playtest, same posture as data/economy.js. */
const TIER_PAY = [3, 8, 20, 50];

/* posting TTL (J2, FINAL): 4 + 1d4 days — a fresh roll per posting at mint time. */
function jobPostingTtl(){ return 4 + rollDie(4); }

/* env hint vocabulary (§1) — the row text carries no env tag (verified against the compiled table);
   a uniform roll is the only non-guessing option (G9). Kept as a named const so a future authored
   env-weight table can replace the uniform pick without touching call sites. */
const JOB_ENV_HINTS = ["urban", "wilderness", "dungeon"];
function jobEnvHint(){ return JOB_ENV_HINTS[rollDie(3)-1]; }

/* jobBoardOf(w) — the transient-but-persisted board state (postings ride the world, not GS — a
   board read that outlives the session is the whole point of "infinite quests", unlike GS.chase
   which is genuinely combat-transient). */
function jobBoardOf(w){
  if(!w.jobBoard) w.jobBoard={ postings:[], nextSeq:1 };
  if(!Array.isArray(w.jobBoard.postings)) w.jobBoard.postings=[];
  if(typeof w.jobBoard.nextSeq!=="number") w.jobBoard.nextSeq=1;
  return w.jobBoard;
}

/* the place tier a board read scales against: the current node's shop-derived lodging tier (the
   same signal ECONOMY-SINKS reuses — no second per-node tier heuristic), region econTilt-nudged the
   same bounded way open_shop nudges shop tier (regionPeekNode is READ-ONLY, no surprise mint). */
function jobBoardTier(w, nodeId){
  const base=(typeof nodeLodgingTier==="function")?nodeLodgingTier(w,nodeId):0;
  const region=(typeof regionPeekNode==="function")?regionPeekNode(w,nodeId):null;
  const bump=(typeof regionEconBump==="function")?regionEconBump(region):0;
  return (typeof regionClampTier==="function")?regionClampTier(base,bump):Math.max(0,Math.min(3,base));
}

/* §1 THE POSTING — roll ONE posting off npc-job-board, tier-scaled. Returns null (logged) if the
   table isn't compiled (null-safe — matches gap-wiring's convention for every other roll in this
   batch). The poster is a rolled NPC, minted SOFT into the codex (the ambient-pool convention:
   recurring employers become contacts on repeat postings — see jobPosterReuse). */
function jobPosting(w, opts){
  opts=opts||{};
  const roll=(typeof rollTable==="function")?rollTable("npc-job-board"):null;
  if(!roll){ console.warn("[job-walks] npc-job-board not compiled — posting skipped (null-safe)"); return null; }
  const nodeId=opts.nodeId||w.currentNodeId;
  const tier=(opts.tier!=null)?opts.tier:jobBoardTier(w,nodeId);
  const base=TIER_PAY[Math.max(0,Math.min(TIER_PAY.length-1,tier))];
  const pay=Math.round(base*(1+0.15*tier));   // the row's stakes "re-read at tier" — a mild tier-compounding lean, not a second table
  const envHint=jobEnvHint();
  const region=(typeof regionForNode==="function")?regionForNode(w,nodeId):null;
  const poster=(typeof rollNPC==="function")?rollNPC({region, roleHint:"employer"}):null;
  let posterId=null;
  if(poster && typeof codexAdd==="function"){
    const rec=codexAdd(w, Object.assign({}, poster, { status:{ at:nodeId } }));
    posterId=rec.id;
  }
  const B=jobBoardOf(w);
  const posting={
    id:"job"+(B.nextSeq++), row:roll.text, band:roll.band, tier, pay, envHint,
    posterId, nodeId, createdDay:(typeof clockOf==="function")?clockOf(w).day:0,
    ttlDays:jobPostingTtl(), claimed:false, resolved:false, followUp:false,
  };
  B.postings.push(posting);
  if(typeof addLedger==="function") addLedger(w,"canon",{kind:"job-posting",id:posting.id,tier,pay,envHint,posterId,source:"play"},
    `A posting goes up — ${posting.row}`);
  return posting;
}

/* jobBoardRead(w, opts) — a board read mints 2-3 postings (§1: "2-3 postings per board read"). */
function jobBoardRead(w, opts){
  opts=opts||{};
  const n=2+rollDie(2)-1;   // 2-3, uniform
  const out=[];
  for(let i=0;i<n;i++){ const p=jobPosting(w,opts); if(p) out.push(p); }
  return out;
}

function jobPostingGet(w, postingId){
  return jobBoardOf(w).postings.find(p=>p.id===postingId) || null;
}

/* §3 UNCLAIMED-POSTING TTL SWEEP — resolves any posting whose TTL has elapsed WITHOUT the player
   (mutation check per J1/JOB-WALKS §3: "persist forever, fails" — this function existing and being
   CALLED is what makes that check pass; call it every montage, mirroring repuFadeTick's wiring in
   worldTurn). 1d6: 1-3 someone-else-took-it (ledger line only), 4-6 it-got-worse (bumps the poster's
   linked faction clock +1 IF one is resolvable — a bare rolled NPC carries no faction link in this
   codebase, so that half degrades to a flagged no-op rather than inventing a faction attribution).
   Resolved/claimed postings are left alone (a claimed posting is walked, not swept). Returns the list
   of postings resolved this sweep. */
function jobBoardTick(w){
  const B=jobBoardOf(w);
  const today=(typeof clockOf==="function")?clockOf(w).day:0;
  const resolved=[];
  B.postings.forEach(p=>{
    if(p.claimed||p.resolved) return;
    const age=today-p.createdDay;
    if(age<p.ttlDays) return;
    p.resolved=true;
    const roll=rollDie(6);
    const gotWorse=roll>=4;
    let clockBumped=false;
    if(gotWorse){
      const posterRec=(typeof codexGet==="function"&&p.posterId)?codexGet(w,p.posterId):null;
      const facKey=(typeof repuFactionOf==="function"&&posterRec)?repuFactionOf(w,posterRec.id):null;
      const fac=facKey?(w.factions||[]).find(f=>typeof slug==="function"&&slug(f.name)===facKey):null;
      if(fac && fac.clock){ fac.clock.filled=Math.min(fac.clock.size,(fac.clock.filled||0)+1); clockBumped=true; }
    }
    const text=gotWorse
      ? `The posting for "${p.row.slice(0,60)}${p.row.length>60?"…":""}" went unanswered — it got worse.`
      : `The posting for "${p.row.slice(0,60)}${p.row.length>60?"…":""}" is gone — someone else took it.`;
    if(typeof addLedger==="function") addLedger(w,"drift",{kind:"job-posting-expired",id:p.id,outcome:gotWorse?"worse":"taken",clockBumped,source:"world-turn"},text);
    resolved.push(p);
  });
  return resolved;
}

/* §2 ACCEPTING MINTS A WALK. segments = 1 + tier (§2: "1+floor(pay tier)" — pay tier IS the posting's
   place-tier index, already an integer 0-3, so floor is a no-op; kept explicit for the spec's own
   wording). threat = tier. env = the posting's envHint. Urban jobs stay AT the current node (an
   in-town errand); wilderness/dungeon jobs anchor OFF-city (§3's "a road out of town as often as an
   errand inside it") — a fresh destination node is minted + a route rolled, same machinery explore()
   uses, so the job walk is a REAL walk with real provenance (no bespoke transport). */
function jobWalkSegCount(tier){ return 1+Math.max(0,Math.min(3,tier|0)); }

function jobWalkAccept(w, postingId){
  const posting=jobPostingGet(w, postingId);
  if(!posting) return {ok:false, reason:"no-posting"};
  if(posting.claimed) return {ok:false, reason:"already-claimed"};
  if(posting.resolved) return {ok:false, reason:"already-resolved"};
  const segCount=jobWalkSegCount(posting.tier);
  const region=(typeof regionForNode==="function")?regionForNode(w,posting.nodeId):null;
  let destNodeId=posting.nodeId, originNodeId=null, travelMin=0;
  let walk=null;
  if(posting.envHint==="urban"){
    walk=(typeof rollUrbanWalk==="function")?rollUrbanWalk({segCount, tier:posting.tier, region}):null;
  } else if(posting.envHint==="dungeon"){
    walk=(typeof rollDungeonWalk==="function")?rollDungeonWalk({segCount, tier:posting.tier, region}):null;
    // dungeons anchor off-city: mint a destination node the same way explore() does.
    originNodeId=w.currentNodeId;
    destNodeId=(typeof addNode==="function")?addNode(w, "Job Site — "+posting.id, "Place"):posting.nodeId;
  } else {
    const legBiomes=(originNodeId=w.currentNodeId, destNodeId=(typeof addNode==="function")?addNode(w,"Job Site — "+posting.id,"Place"):posting.nodeId,
      (typeof travelLegBiomes==="function")?travelLegBiomes(w,originNodeId,destNodeId,segCount):null);
    walk=(typeof rollWildernessWalk==="function")?rollWildernessWalk({legCount:segCount, biomes:legBiomes, tier:posting.tier, region}):null;
  }
  if(!walk) return {ok:false, reason:"walk-unavailable"};
  walk.kind="job";
  if(originNodeId && originNodeId!==destNodeId){
    const route=(typeof rollRoute==="function")?rollRoute():{bearing:"?",travelMin:0,leagues:0};
    if(typeof addEdge==="function") addEdge(w, originNodeId, destNodeId, route);
    travelMin=route.travelMin;
  }
  const P=(typeof prepOf==="function")?prepOf(w):null;
  if(!P) return {ok:false, reason:"prep-unavailable"};
  P.nodes[destNodeId]={ env:walk.environment, soft:false, locked:false, hook:null,
    kind:"job", postingId:posting.id, originNodeId, destNodeId, travelMin,
    walk, cursor:null };
  const r=(typeof walkSetActive==="function")?walkSetActive(w,destNodeId):{ok:false};
  posting.claimed=true; posting.walkNodeId=destNodeId; posting.objectiveRef="job:"+posting.id;
  if(typeof addLedger==="function") addLedger(w,"outcome",{kind:"job-accept",id:posting.id,envHint:posting.envHint,segCount,tier:posting.tier,source:"play"},
    `The job is taken — ${segCount} leg${segCount>1?"s":""} of ${posting.envHint} work ahead.`);
  return {ok:!!r.ok, walk, current:r.current, nodeId:destNodeId, objectiveRef:posting.objectiveRef};
}

/* §2 COMPLETION PAYOUT — called from the walkComplete kind:"job" branch (src/world/prep.js). Pays
   gold DIRECTLY onto the living sheet (mirrors play.js's lodging charge — a direct sheet mutation
   rather than routing through applyEvent's item_changed, since this fires from inside the engine
   layer, not a DM-emitted event) + warms the poster's attitude on completion (recurring employers
   become contacts, §2) + flags a follow-up (a warmer next posting from the same poster — read, not
   auto-minted, so a later jobPosting call from this poster can lean on it; kept minimal per G9: no
   invented "warmer row" text exists to draw from). Never applies twice (idempotent on an
   already-resolved posting). */
function jobWalkPayout(w, posting, opts){
  opts=opts||{};
  if(!posting || posting.resolved) return {ok:false, reason:"no-posting-or-already-resolved"};
  posting.resolved=true;
  const abandoned=!!opts.abandoned;
  const t=(typeof livingSheet==="function")?livingSheet(w):null;
  let gold=0;
  if(!abandoned && t){
    const before=t.sh.gold||0;
    t.sh.gold=Math.max(0, before+posting.pay);
    gold=t.sh.gold-before;
  }
  if(!abandoned && posting.posterId && typeof codexSetAttitude==="function" && typeof codexGetAttitude==="function"){
    const cur=codexGetAttitude(w, posting.posterId);
    const val=(cur&&typeof cur.value==="number")?cur.value:0;
    codexSetAttitude(w, posting.posterId, val+1, "job completed — "+posting.id, (typeof clockOf==="function")?clockOf(w).day:null);
    if(typeof codexContact==="function") codexContact(w, posting.posterId);   // a repeat employer becomes a real contact
    posting.followUp=true;
  }
  if(typeof addLedger==="function") addLedger(w, abandoned?"drift":"outcome",
    {kind:"job-complete",id:posting.id,gold,abandoned,posterId:posting.posterId,source:"play"},
    abandoned ? `The job for "${posting.row.slice(0,60)}${posting.row.length>60?"…":""}" is abandoned — word will spread.`
              : `Job done — ${posting.row.slice(0,60)}${posting.row.length>60?"…":""} (+${gold} gp).`);
  return {ok:true, gold, abandoned, followUp:posting.followUp};
}
