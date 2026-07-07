/* scene-risk.js — THE SCENE RISK CONTRACT (docs/SCENE-RISK-CONTRACT.md, SPEC-LOCKED 2026-07-06).

   The fairness contract for danger: every minted walk (dungeon/urban/wilderness, travel included)
   gets a typed, validated shape — {dangerBand, rewardBand, telegraphs, escapeModes, pressureClock,
   deathStakes, promisedReward, persistentTrace, entry, derived} — stamped ONCE at mint time
   (sceneRiskOf, called from the tail of each walk roller, AFTER applySkinGrants). Zero model calls,
   zero new dice (SPEED doctrine): this module is a pure deterministic derivation over already-rolled
   walk facts. The ruling this mechanizes: deadly-or-above content is allowed ONLY when telegraphed
   with ≥1 real escape mode — a one-shot unwarned trap is a bug, not difficulty (§0.1).

   Storage seam (§2): generated metadata stamped onto the walk record (walk.risk) — NOT table
   frontmatter (danger is a property of the assembled walk, not any one row), NOT digest-computed
   (the digest is a pure read; recomputing per turn invites drift). Idempotent (a walk already
   carrying walk.risk is returned untouched, mirroring breachPersistenceRoll) and deterministic (no
   RNG anywhere in this file — fallback telegraph text is a fixed template).

   callTimeDeps: [] — this module reads only its own arguments (the purest module in the tree). */

const SCENE_RISK_VOCAB = Object.freeze({
  dangerBand:  ["safe","risky","deadly","nightmare","mythic"],
  rewardBand:  ["ordinary","good","rare","strange","legendary"],
  telegraph:   ["rumor","corpse","sign","scout","map","survivor"],   // GPT README §Difficulty, verbatim
  escapeModes: ["flee","bargain","stealth","environment","sacrifice"],
  deathStakes: ["loot-risk","corpse-hard-to-recover","bardo-only","world-shift"],
  persistentTrace: ["story","clock","map","world-shift"],
});

// ruling 3 (§0): danger IS the reward ladder — 1:1, no fork.
const SCENE_RISK_LADDER = Object.freeze({
  safe:"ordinary", risky:"good", deadly:"rare", nightmare:"strange", mythic:"legendary"
});

// deathStakes per band — total map, no fork.
const SCENE_RISK_STAKES = Object.freeze({
  safe:"loot-risk", risky:"loot-risk", deadly:"loot-risk",
  nightmare:"corpse-hard-to-recover", mythic:"world-shift"
});

// §3.4.5 — by construction sceneRiskOf can NEVER emit an untelegraphed deadly+ scene.
const SCENE_RISK_FALLBACK_TELEGRAPH = Object.freeze({
  kind:"rumor",
  text:"Grim word travels ahead of this place: those who pressed on came back wrong, or not at all.",
  source:"scene-risk-fallback",
  minted:true
});

/* §3.1 sceneRiskEnemyShare(walk) -> number 0..1
   numerator = count of segments with encounter.isEnemy===true, PLUS 1 if a finale segment exists
   and (walk.finaleTrack==="Combat" [urban] OR the finale segment carries finale.bossCreature
   [dungeon]). denominator = walk.segments.length. Empty/absent segments -> 0. */
function sceneRiskEnemyShare(walk){
  const segs = (walk && Array.isArray(walk.segments)) ? walk.segments : [];
  if(!segs.length) return 0;
  let numerator = 0;
  for(const s of segs){ if(s && s.encounter && s.encounter.isEnemy===true) numerator++; }
  const finaleSeg = segs.find(s=>s && s.isFinale);
  if(finaleSeg){
    const finaleCombat = (walk.finaleTrack==="Combat") || !!(finaleSeg.finale && finaleSeg.finale.bossCreature);
    if(finaleCombat) numerator++;
  }
  return numerator / segs.length;
}

/* §3.2 sceneRiskDangerBand(walk, ctx) -> dangerBand
   ctx = { marooned, physics, tail, skinBand, tier, enemyShare, heatStart } — built ONCE by the
   assembler (§3.8); sub-helpers never touch `w` directly. First match wins. */
function sceneRiskDangerBand(walk, ctx){
  ctx = ctx || {};
  if(ctx.marooned) return "mythic";                                   // rule 1: deep breach
  if(ctx.tail==="breach" || ctx.tail==="nightmare") return "nightmare"; // rule 2
  const bandScore = ({strange:1, volatile:2, mythic:3})[String(ctx.skinBand||"").toLowerCase()] || 0;
  const score = (ctx.tier===2 ? 1:0) + (ctx.enemyShare>=0.5 ? 1:0) + (ctx.heatStart>=2 ? 1:0) + bandScore;
  if(score>=3) return "deadly";
  if(score>=1) return "risky";
  return "safe";
}

/* §3.4 sceneRiskTelegraphs(walk, dangerBand) -> array (collection order fixed; ALWAYS collect —
   the >=1 requirement applies only at deadly+). */
function sceneRiskTelegraphs(walk, dangerBand){
  const out = [];
  const skin = walk && walk.skin;
  const tail = skin && skin.tail;
  // 1. Tail walk — the threshold IS visible; the world going wrong at the door is the tell.
  if(tail==="breach" || tail==="nightmare"){
    out.push({ kind:"sign", text: String((skin && skin.text)||"").slice(0,140), source: skin && skin.ref });
  }
  // 2. Wilderness — first segment ascending by num with encounter.isEnemy && encounter.signal.
  if(walk && walk.environment==="wilderness" && Array.isArray(walk.segments)){
    const cand = walk.segments
      .filter(s=>s && s.encounter && s.encounter.isEnemy && s.encounter.signal)
      .sort((a,b)=>(a.num||0)-(b.num||0))[0];
    if(cand) out.push({ kind:"sign", text: cand.encounter.signal, source:"wilderness-sign-of-passage" });
  }
  // 3. Dungeon — walk.threat.signs truthy (the 7-col threat identity).
  if(walk && walk.environment==="dungeon" && walk.threat && walk.threat.signs){
    out.push({ kind:"sign", text: walk.threat.signs, source:"dungeon-threat-identity" });
  }
  // 4. Urban — walk.threat present (always).
  if(walk && walk.environment==="urban" && walk.threat){
    out.push({ kind:"rumor", text:"Word on the street: " + walk.threat.id + " holds this ground.",
      source:"urban-threat-identity", minted:true });
  }
  // 5. Fallback guarantee — deadly+ and nothing collected yet.
  if((dangerBand==="deadly" || dangerBand==="nightmare" || dangerBand==="mythic") && out.length===0){
    out.push(Object.assign({}, SCENE_RISK_FALLBACK_TELEGRAPH));
  }
  return out;
}

/* §3.5 sceneRiskHasSocial — DELIBERATE local twin of breachHasSocialSegment (src/engine/breach.js:
   295-298). Superset: also true when walk.finaleTrack==="Social" (an urban Social finale is a track
   flag, not a segment `type`, and it absolutely affords bargaining). Implemented locally (not called
   cross-module) so lean/headless load orders that omit engine.breach derive identically — do NOT
   dedupe this into a load-order coupling with breach.js. */
function sceneRiskHasSocial(walk){
  const segs = (walk && Array.isArray(walk.segments)) ? walk.segments : [];
  const segSocial = segs.some(s => s && ((s.encounter && s.encounter.type==="Social") || s.type==="Social"));
  return segSocial || (walk && walk.finaleTrack==="Social");
}

/* §3.6 sceneRiskEscapes(walk, dangerBand) -> array (fixed order, filtered). The emitted array IS
   SCENE_RISK_VOCAB.escapeModes filtered by membership — implemented as exactly that filter so the
   two can never diverge. */
function sceneRiskEscapes(walk, dangerBand){
  const membership = {
    flee: true,   // always — chase machinery + soft-recall + CHASE-BITE exist; fleeing is a decision.
    bargain: sceneRiskHasSocial(walk),
    stealth: !(walk && walk.posture==="Reactive"),
    environment: (Array.isArray(walk && walk.segments)) && walk.segments.some(s=>
      s && (s.interactable!=null || s.object!=null || s.feature!=null ||
            (s.sceneFrame && s.sceneFrame.detail==="full"))),
    sacrifice: (dangerBand==="nightmare" || dangerBand==="mythic"),
  };
  return SCENE_RISK_VOCAB.escapeModes.filter(mode=>membership[mode]);
}

/* §3.7 sceneRiskClock(walk, ctx) -> pressureClock|null. ctx rides §3.2's ctx — this helper never
   sees `w` directly (physics arrives on ctx.physics). */
function sceneRiskClock(walk, ctx){
  ctx = ctx || {};
  if(ctx.marooned && Array.isArray(ctx.physics) && ctx.physics.indexOf("huntRules")>=0){
    return { kind:"hunt", note:"apex threat stalks between segments" };
  }
  if(walk && walk.environment==="urban" && (walk.heatStart||0) > 0){
    return { kind:"heat", start: walk.heatStart, note: walk.heatGuidance||null };
  }
  return null;
}

/* §3.8(part) sceneRiskPromise(walk, rewardBand) -> promisedReward. hint = first match over the
   finale segment, else null; truncated at 80 chars. */
function sceneRiskPromise(walk, rewardBand){
  const segs = (walk && Array.isArray(walk.segments)) ? walk.segments : [];
  const finaleSeg = segs.find(s=>s && s.isFinale);
  let hint = null;
  const finale = finaleSeg && finaleSeg.finale;
  const loot = finaleSeg && finaleSeg.loot;
  if(finale && finale.macguffin && finale.macguffin.name) hint = finale.macguffin.name;
  else if(loot && loot.magic) hint = `${loot.magic.rarity}: ${loot.magic.name}`;
  else if(loot && loot.valuable && loot.valuable.name) hint = loot.valuable.name;
  else if(loot && loot.coin) hint = loot.coin;
  if(typeof hint==="string" && hint.length>80) hint = hint.slice(0,80);
  return { band: rewardBand, hint: hint==null?null:hint };
}

/* §3.8 sceneRiskOf(walk, w) — the assembler. Computes ctx ONCE (the ONLY function that reads `w`),
   runs §3.1-3.7, stamps walk.risk, returns walk. Idempotent + null-safe (never throws — G9). */
function sceneRiskOf(walk, w){
  if(!walk || !Array.isArray(walk.segments)) return walk;
  if(walk.risk) return walk;   // idempotent — first stamp wins, rolled-facts-are-canon.

  const marooned = !!(w && w.realm && w.realm.active);
  const physics = (w && w.realm && Array.isArray(w.realm.physics)) ? w.realm.physics : [];
  const tail = walk.skin && walk.skin.tail;
  const skinBand = walk.skin && walk.skin.band;
  const tier = walk.tier;
  const enemyShare = sceneRiskEnemyShare(walk);
  const heatStart = walk.heatStart || 0;
  const ctx = { marooned, physics, tail, skinBand, tier, enemyShare, heatStart };

  const dangerBand = sceneRiskDangerBand(walk, ctx);
  const rewardBand = SCENE_RISK_LADDER[dangerBand];
  const deathStakes = SCENE_RISK_STAKES[dangerBand];
  const persistentTrace = marooned ? "world-shift"
    : (tail==="breach" || tail==="nightmare") ? "map"
    : (heatStart>0) ? "clock"
    : "story";
  const telegraphs = sceneRiskTelegraphs(walk, dangerBand);
  const escapeModes = sceneRiskEscapes(walk, dangerBand);
  const pressureClock = sceneRiskClock(walk, ctx);
  const promisedReward = sceneRiskPromise(walk, rewardBand);
  const entry = (walk.skin && walk.skin.entry!=null) ? walk.skin.entry : null;

  walk.risk = {
    schema: "scene-risk/v1",
    dangerBand, rewardBand, telegraphs, escapeModes, pressureClock, deathStakes,
    promisedReward, persistentTrace, entry,
    derived: { tier, enemyShare, heatStart, skinBand, tail }
  };
  return walk;
}

/* §3.9 sceneRiskValidate(risk) -> {ok, errors:[]} — THE fairness validator. */
function sceneRiskValidate(risk){
  const errors = [];
  if(!risk || typeof risk!=="object") return { ok:false, errors:["risk:missing"] };

  if(SCENE_RISK_VOCAB.dangerBand.indexOf(risk.dangerBand)<0) errors.push("dangerBand:invalid");
  if(SCENE_RISK_VOCAB.rewardBand.indexOf(risk.rewardBand)<0) errors.push("rewardBand:invalid");
  if(SCENE_RISK_VOCAB.deathStakes.indexOf(risk.deathStakes)<0) errors.push("deathStakes:invalid");
  if(SCENE_RISK_VOCAB.persistentTrace.indexOf(risk.persistentTrace)<0) errors.push("persistentTrace:invalid");

  if(SCENE_RISK_VOCAB.dangerBand.indexOf(risk.dangerBand)>=0 &&
     risk.rewardBand !== SCENE_RISK_LADDER[risk.dangerBand]) errors.push("ladder:broken");

  if(SCENE_RISK_VOCAB.dangerBand.indexOf(risk.dangerBand)>=0 &&
     risk.deathStakes !== SCENE_RISK_STAKES[risk.dangerBand] &&
     risk.deathStakes !== "bardo-only") errors.push("stakes:broken");

  const telegraphs = Array.isArray(risk.telegraphs) ? risk.telegraphs : [];
  if(telegraphs.some(t=>!t || SCENE_RISK_VOCAB.telegraph.indexOf(t.kind)<0)) errors.push("telegraph:kind-invalid");

  const escapeModes = Array.isArray(risk.escapeModes) ? risk.escapeModes : [];
  if(escapeModes.some(m=>SCENE_RISK_VOCAB.escapeModes.indexOf(m)<0)) errors.push("escape:invalid");

  if((risk.dangerBand==="deadly" || risk.dangerBand==="nightmare" || risk.dangerBand==="mythic")
     && telegraphs.length===0) errors.push("deadly-untelegraphed");

  if(escapeModes.length===0) errors.push("no-escape");

  return { ok: errors.length===0, errors };
}

/* §3.10 sceneRiskDigest(risk) — the compact digest projection (DIGEST-DIET-safe, <=~450 bytes
   worst case; full telegraphs/derived stay on the walk record, never ship). */
function sceneRiskDigest(risk){
  return {
    danger: risk.dangerBand, reward: risk.rewardBand, stakes: risk.deathStakes, trace: risk.persistentTrace,
    escapes: risk.escapeModes,
    clock: risk.pressureClock ? { kind: risk.pressureClock.kind, note: risk.pressureClock.note } : null,
    promise: risk.promisedReward ? risk.promisedReward.hint : null,
    telegraphs: (risk.telegraphs||[]).slice(0,2).map(t=>({ kind:t.kind, text:(t.text||"").slice(0,140) }))
  };
}
