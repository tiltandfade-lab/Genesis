/* GENESIS MODULE — src/engine/tarot.js — THE SESSION DRAW (docs/TAROT-SESSION.md).
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reads data/tarot.js (TAROT_DECK/TAROT_SUITS/TAROT_MAJORS) at call-time — must load after it.

   §2 wiring: tarotDraw(w) fires once at beginSession (1 card, upright/reversed 50/50, true random)
   and stores the result on w.tarot — the session parameter vector. tarotVectorOf(w) reads that
   stored draw back into the small named multipliers the rollers consult (BATCH-GUARDRAILS-style
   "small multiplier read, default 1.0 — zero behavior change without a draw"). The vector is an
   INPUT the roller call sites pass through (region.js precedent: spiceTierAt/spiceBandPick
   (SPICE-RAISE)/regionEconBump are POST-PROCESSING biases applied at the caller, never inside the
   roller itself) — walkSpiceBand,
   resolveArchetypePool, rollShopStock, prepCastAmbient are all UNTOUCHED; every wired call site
   takes an optional final param that defaults to today's exact unbiased behavior.

   Card art is DEFERRED (BATCH2-GUARDRAILS H3) — tarotFrontispiece() renders a name + suit-glyph
   placeholder; assetKey rides null until the RWS scan batch lands. Reveal is card-shown/meaning-
   veiled (§0 fork): the player sees name+omen only, never `mutator`/`op`/`note` (DM-only). */

/* ============================================================
   TAROT-2 §2.1 — TAROT_OPS: the explicit op registry (docs/TAROT-2.md). Ends the old doc-vs-code
   drift (data/tarot.js's header long claimed ops lived in a "TAROT_MAJOR_OPS" symbol that never
   existed — the tarotMajorVector switch was the de-facto registry). `cls` is "numeric" (mechanized
   into the session vector) or "directive" (rides op/params(+target) through the digest; DM applies
   via typed events). `target` names which tarotResolveTarget branch (§2.5) picks the card's carrier. */
const TAROT_OPS = Object.freeze({
  // numeric class — mechanized into the session vector (tarotMajorVector)
  noNudge:{cls:"numeric"}, archetypeWeight:{cls:"numeric"}, spiceNudge:{cls:"numeric"},
  ambientPoolBonus:{cls:"numeric"}, stockBias:{cls:"numeric"}, stealthDcBump:{cls:"numeric"},
  alterWalkTexture:{cls:"numeric"},                      // mechanized via vector.walkMotif (§2.2)
  // directive class — ride op/opParams(+target) through the digest; DM applies via typed events
  advanceHottestClock:{cls:"directive", target:"clock"},
  nominateOldestThread:{cls:"directive", target:"thread"},
  revealSecretOnStrange:{cls:"directive"},
  crackedLensBias:{cls:"directive"},                     // legacy — card-orphaned after §2.3; stays legal
  spotlightThread:{cls:"directive", target:"thread"},
  surfaceHiddenFact:{cls:"directive", target:"codex"},
  markOmenTarget:{cls:"directive", target:"codex"},
  twistReward:{cls:"directive"},
  pressureFaction:{cls:"directive", target:"clock"},
  offerBargain:{cls:"directive"},
  echoPast:{cls:"directive", target:"echo"},
  openDoor:{cls:"directive"}, closeDoor:{cls:"directive"}
});
/* TAROT-2 §3.1 — the landing-receipt via vocabulary (the channels a card can land through). */
const TAROT_VIA = Object.freeze(["walk-skin","faction-clock","thread","codex","npc","loot","bargain","door","echo","dm"]);

/* ============================================================
   §2 THE DRAW — beginSession fires this once; the vector is an INPUT to seamProposeShape (not a
   second competing lean system) and dissolves at endSession (seamHarvest telemetry, forward ref).
   ============================================================ */
function tarotDraw(w){
  if(!w || typeof TAROT_DECK==="undefined" || !TAROT_DECK.length) return null;
  const card = TAROT_DECK[Math.floor(Math.random()*TAROT_DECK.length)];
  const reversed = Math.random() < 0.5;
  const pol = reversed ? card.rev : card.up;
  // TAROT-2 §4: minors carry COMPUTED metadata (never authored per-card).
  const minorMeta = card.major ? null : tarotMinorMeta(card.suit, card.rank, reversed);
  const draw = {
    session: w.session || 0,
    name: card.name, major: !!card.major, suit: card.suit, rank: card.rank, court: !!card.court,
    domain: card.domain, glyph: card.glyph, reversed,
    omen: pol.omen,                                            // player-facing (veiled mechanics)
    // TAROT-2 §1/§2.5 — Majors: the strict-schema mutator + a script-picked draw-time target.
    // `note` is a deprecated-but-present back-compat alias for `dmNote` (same string).
    mutator: card.major ? {
      op:pol.op, params:pol.params||{},
      dmNote:pol.dmNote||null, note:pol.dmNote||null,
      visibleTell:pol.visibleTell||null, payoff:pol.payoff||null,
      target:(typeof tarotResolveTarget==="function" && typeof TAROT_OPS!=="undefined" && TAROT_OPS[pol.op] && TAROT_OPS[pol.op].target)
               ? tarotResolveTarget(w, pol.op, pol.params||{}) : null,
    } : null,
    // TAROT-2 §4 — minors: computed tone/handle + rank/reversal sense (majors get sense only).
    tone:  minorMeta ? minorMeta.tone : null,
    handle:minorMeta ? minorMeta.handle : null,
    rankSense: card.major ? null : (typeof TAROT_RANK_GRAMMAR!=="undefined" ? (TAROT_RANK_GRAMMAR[card.rank]||null) : null),
    sense: (typeof TAROT_REVERSAL_SENSE!=="undefined") ? TAROT_REVERSAL_SENSE[reversed?"rev":"up"] : null,
    landed: [],                                                // §3 telemetry — capped at 8
    assetKey: card.assetKey || null,                            // deferred — always null until H3's asset batch
  };
  w.tarot = draw;
  return draw;
}

/* ============================================================
   §1 VECTOR — the session parameter vector the rollers consult. Pure read off w.tarot; a world with
   no draw (tarotDraw never ran, or the module load order regressed) gets the all-1.0/no-op default —
   the "zero behavior change without a draw" contract every hook below honors. ──
   ============================================================ */
const TAROT_DEFAULT_VECTOR = Object.freeze({
  hasDraw:false, domain:null, reversed:false, intensity:0, major:false,
  archetypeMult:1.0,     // §1 "Suit → domain weight": archetype-pool weight, keyed to the drawn suit's domain
  spiceDir:0,            // §1 "Reversal → valence" + Major spiceNudge ops: -1/0/+1 shifts the spice curve one step
  ambientBonus:0,        // ambient-pool size delta (Cups + a few Majors)
  stockMult:1.0,         // shop stock size / valuables-chance multiplier (Coins + a few Majors)
  stealthDcBump:0,       // Major-only: stealth-adjacent DC nudge (The Sun et al.)
  walkMotif:null,        // TAROT-2 §2.2 alterWalkTexture — session walk motif key, null = inert
  op:null, opParams:null,  // the raw Major directive (clock/thread ops — DM-applied, see §2's note)
});
/* RANK → INTENSITY (§1 "Rank → intensity: Ace…King scales the nudge") — Ace=1 .. King=14, normalized
   to a 0..1 scale so multiplier math stays bounded regardless of which rank landed. */
function tarotRankIntensity(rank){
  if(typeof TAROT_RANKS==="undefined") return 0.5;
  const i=TAROT_RANKS.indexOf(rank);
  return i<0 ? 0.5 : (i+1)/TAROT_RANKS.length;
}
function tarotVectorOf(w){
  const d = w && w.tarot;
  if(!d) return TAROT_DEFAULT_VECTOR;
  if(d.major){
    return tarotMajorVector(d);
  }
  // MINORS (§1): suit -> domain weight, rank -> intensity, reversal -> valence (trouble vs opportunity).
  const intensity = tarotRankIntensity(d.rank);           // 0..1
  const nudge = 1 + intensity*0.5;                        // Ace≈1.07x .. King≈1.5x on the domain's own weight
  const v = Object.assign({}, TAROT_DEFAULT_VECTOR, { hasDraw:true, domain:d.domain, reversed:d.reversed, intensity, major:false });
  if(d.domain==="threat")  v.archetypeMult = d.reversed ? 1.0 : nudge;                 // Swords: threat/combat weight up (upright only — reversed Swords is a social/self-inflicted read, not more monsters)
  if(d.domain==="social")  v.ambientBonus  = d.reversed ? 0 : (d.court ? 2 : 1);        // Cups: ambient pool +1 (court cards embody the domain, +2)
  if(d.domain==="economy") v.stockMult     = d.reversed ? Math.max(0.5, 1-intensity*0.5) : 1+intensity*0.5;  // Coins: opportunity swells stock, trouble shrinks it
  if(d.domain==="magic")   v.spiceDir      = d.reversed ? -1 : 1;                       // Wands: spice-tail weight on skins/drift
  return v;
}
/* MAJORS (§1 "the authored mutator"): the op/params ride straight through; the numeric ops
   (archetypeWeight/spiceNudge/ambientPoolBonus/stockBias/stealthDcBump) ALSO populate the same
   named multipliers the minors use, so every roller hook only ever reads ONE vector shape. Clock/
   thread ops (advanceHottestClock/nominateOldestThread/revealSecretOnStrange/crackedLensBias) carry
   no numeric nudge — they ride op/opParams for the DM/digest layer (§2's note: narrative-judgment
   moves are DM-applied, never auto-executed by script). noNudge is the all-defaults case. */
function tarotMajorVector(d){
  const v = Object.assign({}, TAROT_DEFAULT_VECTOR, { hasDraw:true, domain:d.domain, reversed:d.reversed, major:true, op:d.mutator&&d.mutator.op||null, opParams:d.mutator&&d.mutator.params||{} });
  const p = (d.mutator&&d.mutator.params)||{};
  switch(v.op){
    case "archetypeWeight": v.archetypeMult = typeof p.mult==="number" ? p.mult : 1.0; break;
    case "spiceNudge":      v.spiceDir = typeof p.dir==="number" ? Math.max(-1,Math.min(1,p.dir)) : 0; break;
    case "ambientPoolBonus":v.ambientBonus = typeof p.n==="number" ? p.n : 0; break;
    case "stockBias":       v.stockMult = typeof p.mult==="number" ? p.mult : 1.0; break;
    case "stealthDcBump":   v.stealthDcBump = typeof p.dc==="number" ? p.dc : 0; break;
    case "alterWalkTexture":  // TAROT-2 §2.2/§2.6 — the ONE fully script-owned new op; validate against the real motif kits (H3: degrade, never invent)
      v.walkMotif = (typeof SKIN_MOTIF_KITS!=="undefined" && p.motif && p.motif!=="none" && (p.motif in SKIN_MOTIF_KITS)) ? p.motif : null;
      break;
    default: break;   // noNudge + the clock/thread ops: no numeric change, op/opParams still ride for the DM layer
  }
  return v;
}

/* ============================================================
   ROLLER HOOKS — small multiplier reads, default-inert without a draw (BATCH-GUARDRAILS mutation
   contract: leak a nudge with no card, the harness fails). Every hook below takes the VECTOR
   (tarotVectorOf(w)'s return) as its param — same calling convention as region.js's wrappers, which
   take `region` (a w.regions[] record), not `w`. None touch the roller functions themselves
   (region.js's spiceTierAt/spiceBandPick (SPICE-RAISE)/regionEconBump precedent — post-process at
   the caller, optional final param, today's-exact-behavior default). A null/undefined vector is
   treated as TAROT_DEFAULT_VECTOR
   everywhere below — every hook is safe to call with no draw at all.
   ============================================================ */

/* tarotArchetypeBias(vector, domain) -> multiplier for a roller's archetype-pool pick. `domain` is
   the roller's own domain tag (e.g. "threat" for a combat archetype pool) — only a vector whose
   drawn card matches this domain nudges it; anything else is 1.0 (no-op). */
function tarotArchetypeBias(vector, domain){
  const v = vector || TAROT_DEFAULT_VECTOR;
  if(!v.hasDraw || !domain || v.domain!==domain) return 1.0;
  return v.archetypeMult;
}
/* tarotBiasedArchetypePool(vector, domain, region, archetypeName, opts, authoredPoolStr) — thin
   wrapper mirroring region.js's regionBiasedArchetypePool exactly (roll-twice-prefer-weighted, never
   a hard override), composed with an OPTIONAL region bias so a call site doesn't need both wrappers
   wired side by side. No vector/off-domain/resolveArchetypePool missing → identical to a bare
   resolveArchetypePool call (byte-compatible fallback, same as the region-only wrapper). */
function tarotBiasedArchetypePool(vector, domain, region, archetypeName, opts, authoredPoolStr){
  if(typeof resolveArchetypePool!=="function") return authoredPoolStr;
  const roll=()=>(typeof regionBiasedArchetypePool==="function")
    ? regionBiasedArchetypePool(region, archetypeName, opts, authoredPoolStr)
    : resolveArchetypePool(archetypeName, opts, authoredPoolStr);
  const mult=tarotArchetypeBias(vector, domain);
  const first=roll();
  if(mult<=1 || Math.random()>=(1-1/mult)) return first;
  return roll();   // biased re-roll: keep the second draw, same "prefer the weighted side" nudge as region.js
}
/* tarotSpiceDir(vector) -> -1/0/+1, the session's spice-curve lean (Wands + a few Majors). Consumed
   as a REROLL-TOWARD bias (region.js's spiceTierAt/spiceBandPick (SPICE-RAISE) discipline: re-roll-
   and-prefer, never clamp/rename the band that landed) — never mechanized inside walkSpiceBand itself. */
function tarotSpiceDir(vector){ return (vector||TAROT_DEFAULT_VECTOR).spiceDir; }
/* tarotSpiceLean(band, dir) -> the SPICE_ORDER-adjacent band one step toward dir (0 = band unchanged).
   Pure helper; callers still re-roll-and-prefer per the region.js discipline, this just resolves the
   target band to prefer. Null-safe if SPICE_ORDER (world.turn) hasn't loaded yet. */
function tarotSpiceLean(band, dir){
  if(!dir || typeof SPICE_ORDER==="undefined") return band;
  const order=SPICE_ORDER, i=order.indexOf(band);
  if(i<0) return band;
  return order[Math.max(0, Math.min(order.length-1, i+dir))];
}
/* tarotSpiceBiasedSkin(vector, envKind, region) — WALK-REFRESH §3's rollWalkSkin, composed with BOTH
   the region skinBias (regionBiasedWalkSkin, if present) AND the tarot spice lean: when the vector
   carries a nonzero spiceDir, rolls twice and keeps whichever candidate's band sits closer to
   tarotSpiceLean(firstBand,dir) — ties keep the region-biased first roll (no forced re-roll). No
   vector/no spiceDir/rollWalkSkin missing → identical to calling regionBiasedWalkSkin (byte-
   compatible fallback all the way down to a plain rollWalkSkin call, exactly like region.js). */
function tarotSpiceBiasedSkin(vector, envKind, region){
  const first=(typeof regionBiasedWalkSkin==="function") ? regionBiasedWalkSkin(region, envKind)
            : ((typeof rollWalkSkin==="function") ? rollWalkSkin(envKind) : null);
  const dir=tarotSpiceDir(vector);
  if(!dir || !first || typeof SPICE_ORDER==="undefined") return first;
  const target=tarotSpiceLean(first.band, dir);
  if(target===first.band) return first;
  const second=(typeof rollWalkSkin==="function") ? rollWalkSkin(envKind) : null;
  if(!second) return first;
  const distTo=b=>Math.abs(SPICE_ORDER.indexOf(b)-SPICE_ORDER.indexOf(target));
  return (distTo(second.band) < distTo(first.band)) ? second : first;
}
/* tarotAmbientBonus(vector) -> integer delta to AMBIENT_POOL_SIZE for THIS session's casts (Cups +
   a few Majors). Wired at prepCastAmbient's call site (world.prep), never inside AMBIENT_POOL_SIZE. */
function tarotAmbientBonus(vector){ return (vector||TAROT_DEFAULT_VECTOR).ambientBonus|0; }
/* tarotStockMult(vector) -> multiplier on rolled shop-stock SIZE (Coins + a few Majors). Wired at
   makeShop's call site (open_shop, world.dm) — rollShopStock's own signature is untouched. */
function tarotStockMult(vector){ return (vector||TAROT_DEFAULT_VECTOR).stockMult; }
/* tarotStealthDcBump(vector) -> integer DC delta for stealth-adjacent checks (Major-only: The Sun/
   High Priestess/Strength). 0 without a Major draw carrying a stealthDcBump op — minors never touch DC. */
function tarotStealthDcBump(vector){ return (vector||TAROT_DEFAULT_VECTOR).stealthDcBump|0; }
/* tarotWalkMotif(vector) -> the session's walk-motif key (TAROT-2 §2.2 alterWalkTexture: The Moon
   et al.) or null. Consumed by applySkinGrants' gap-fill seam (§2.7): a motif-less walk takes it. */
function tarotWalkMotif(vector){ return (vector||TAROT_DEFAULT_VECTOR).walkMotif || null; }

/* tarotDigestCard(w) -> {name,reversed,omen,mutator} DM-only (docs/DM-BRIDGE.md digest twin of §2's
   "digest.sessionLean.card"). mutator is null for a minor draw (minors carry no bespoke directive —
   §1 "math where it scales"); for a Major it's {op,params,note}. null when no draw this session. */
function tarotDigestCard(w){
  const d = w && w.tarot;
  if(!d) return null;
  const c = { name:d.name, reversed:d.reversed, omen:d.omen, sense:d.sense||null, mutator:d.mutator||null };
  if(!d.major){ c.tone=d.tone||null; c.handle=d.handle||null; c.rankSense=d.rankSense||null; }
  return c;
}

/* ============================================================
   TAROT-2 §4 — MINORS METADATA (computed at draw time, never authored per-card). tarotMinorMeta
   returns {tone, handle}: `handle` = what the omen points at (suit × rank-class matrix); `tone` =
   the emotional read (upright/reversed × suit, with a pressure override). Matrix cell VALUES are
   PROVISIONAL (taste — Adam may retune); the mechanism/signature/enums are LOCKED
   (tone ∈ threat|offer|loss|reveal|pressure, handle ∈ person|place|item|clock|cost).
   ============================================================ */
function tarotRankClass(rank){
  switch(rank){
    case "Ace": return "seed";
    case "Two": case "Five": case "Seven": return "tension";
    case "Three": case "Four": case "Six": return "structure";
    case "Eight": case "Nine": case "Ten": return "pressure";
    case "Page": case "Knight": case "Queen": case "King": return "court";
    default: return "seed";
  }
}
const TAROT_HANDLE_MATRIX = Object.freeze({
  Swords:{ seed:"cost",   tension:"person", structure:"clock", pressure:"clock", court:"person" },
  Cups:  { seed:"person", tension:"person", structure:"place", pressure:"cost",  court:"person" },
  Coins: { seed:"item",   tension:"cost",   structure:"place", pressure:"item",  court:"person" },
  Wands: { seed:"place",  tension:"cost",   structure:"place", pressure:"clock", court:"person" },
});
const TAROT_TONE_UP = Object.freeze({ Swords:"threat", Cups:"offer", Coins:"offer", Wands:"reveal" });
const TAROT_TONE_REV = Object.freeze({ Swords:"loss", Cups:"loss", Coins:"pressure", Wands:"threat" });
function tarotMinorMeta(suit, rank, reversed){
  const cls = tarotRankClass(rank);
  const row = TAROT_HANDLE_MATRIX[suit];
  const handle = (row && row[cls]) || "cost";
  let tone;
  if(!reversed && cls==="pressure") tone = "pressure";
  else tone = reversed ? (TAROT_TONE_REV[suit]||"loss") : (TAROT_TONE_UP[suit]||"reveal");
  return { tone, handle };
}

/* ============================================================
   TAROT-2 §2.5 — tarotResolveTarget(w, op, params): the draw-time noun picker. Pure read, no world
   mutation. Returns {kind, id, label} or null. Ties break deterministically: higher score wins;
   tie → earlier in iteration order. All external symbols guarded (classic-script call-time deps).
   ============================================================ */
function tarotResolveTarget(w, op, params){
  if(!w) return null;
  params = params || {};
  const tgt = (typeof TAROT_OPS!=="undefined" && TAROT_OPS[op] && TAROT_OPS[op].target) || null;
  if(!tgt) return null;
  const recs = (w.codex && w.codex.records) ? Object.keys(w.codex.records).map(k=>w.codex.records[k]) : [];
  const legsOf = (e)=> (e && (e.legs || (e.dm && e.dm.legs))) || "";
  const salOf = (e)=> (typeof seamSalienceOf==="function") ? (seamSalienceOf(e)||0) : 0;
  const slugOf = (s)=> (typeof slug==="function") ? slug(s||"") : String(s||"");

  if(tgt==="thread"){
    // same filter as seamHarvest (src/world/seam.js:60-63): open hook/thread-seed records.
    const cands = recs.filter(e => { const l=legsOf(e); return e && (l==="hook"||l==="thread-seed") && !e.resolved; });
    if(!cands.length) return null;
    let thPick;
    if(params.order==="oldest"){
      thPick = cands[0];   // first by insertion order
    } else {
      // "salient" (nominateOldestThread maps to oldest-semantics per its name, but comes in as its own op)
      let best=cands[0], bestScore=salOf(cands[0]), bestClock=((cands[0].clock&&cands[0].clock.val)||0)/((cands[0].clock&&cands[0].clock.max)||1);
      for(let i=1;i<cands.length;i++){
        const e=cands[i], sc=salOf(e), ck=((e.clock&&e.clock.val)||0)/((e.clock&&e.clock.max)||1);
        if(sc>bestScore || (sc===bestScore && ck>bestClock)){ best=e; bestScore=sc; bestClock=ck; }
      }
      thPick=best;
    }
    return thPick ? { kind:"thread", id:thPick.id, label:thPick.name||thPick.id } : null;
  }

  if(tgt==="clock"){
    const cands = [];
    (w.factions||[]).forEach(f => cands.push({ id:slugOf(f.name), label:f.name,
      filled:(f.clock&&f.clock.filled)|0, size:(f.clock&&f.clock.size)|0, fkind:"faction" }));
    (w.pressures||[]).forEach(p => cands.push({ id:slugOf(p.danger||p.kind||""), label:p.danger||p.kind,
      filled:(p.clock&&p.clock.filled)|0, size:(p.clock&&p.clock.size)|0, fkind:"front" }));
    // exclude size<=0 and already-full (filled>=size)
    const live = cands.filter(c => c.size>0 && c.filled<c.size);
    if(!live.length) return null;
    let best=live[0], bestScore=live[0].filled/live[0].size;
    for(let i=1;i<live.length;i++){
      const c=live[i], sc=c.filled/c.size;
      if(sc>bestScore){ best=c; bestScore=sc; }   // strict > keeps earlier (faction-before-front, then array order) on ties
    }
    return { kind:best.fkind, id:best.id, label:best.label };
  }

  if(tgt==="codex"){
    let cands = recs.filter(e => e && !e.resolved);
    if(op==="surfaceHiddenFact"){
      cands = cands.filter(e => e.dm && (e.dm.secret || e.dm.fear || e.dm.leverage));
    } else if(op==="markOmenTarget" && params.prefer){
      const pref = String(params.prefer).toLowerCase();
      const preferred = cands.filter(e => String(e.kind||"").toLowerCase()===pref);
      if(preferred.length) cands = preferred;   // else fall back to any-kind
    }
    if(!cands.length) return null;
    const scoreOf = (e)=> salOf(e) + ((e.status && e.status.at===w.currentNodeId) ? 3 : 0);
    let best=cands[0], bestScore=scoreOf(cands[0]);
    for(let i=1;i<cands.length;i++){
      const sc=scoreOf(cands[i]);
      if(sc>bestScore){ best=cands[i]; bestScore=sc; }
    }
    return { kind:String(best.kind||"thing").toLowerCase(), id:best.id, label:best.name||best.id };
  }

  if(tgt==="echo"){
    const chars = w.characters||[];
    let c = chars.filter(x=>x.status==="living").slice(-1)[0] || chars.slice(-1)[0] || null;
    if(c && typeof computeSaga==="function"){
      let saga=[];
      try{ saga=computeSaga(w,c)||[]; }catch(e){ saga=[]; }
      const nonPlace = saga.filter(s=>s && s.type!=="place");
      const echoPick = nonPlace[0] || saga[0] || null;
      if(echoPick) return { kind:"echo", id:echoPick.key, label:echoPick.name };
    }
    // fallback: the most recent non-living character
    const dead = chars.filter(x=>x.status!=="living").slice(-1)[0];
    if(dead) return { kind:"echo", id:"char:"+slugOf(dead.name), label:dead.name };
    return null;
  }
  return null;
}

/* ============================================================
   TAROT-2 §3 — the landing receipt (tarotLanded[] telemetry). tarotMarkLanded writes one capped,
   deduped entry per (via|ref); a detected capture upgrades a prior DM-declared one in place.
   tarotDetectFromEvent is the ONE detected-capture insertion point (called at top-of-applyEvent).
   tarotReceiptOf is the end-of-session read. All quiet (no per-capture ledger line).
   ============================================================ */
function tarotMarkLanded(w, entry){
  const d = w && w.tarot;
  if(!d || !entry || !entry.via) return null;
  const via = (typeof TAROT_VIA!=="undefined" && TAROT_VIA.indexOf(entry.via)>=0) ? entry.via : "dm";
  if(via!==entry.via) console.warn("[tarot] unknown landing via, coerced to 'dm':", entry.via);
  d.landed = d.landed || [];
  const key = via+"|"+(entry.ref||"");
  const hit = d.landed.find(x => (x.via+"|"+(x.ref||""))===key);
  if(hit){ if(entry.detected && !hit.detected) hit.detected = true; return hit; }  // detected upgrades declared
  if(d.landed.length >= 8) return null;                              // cap — quiet drop
  const rec = { card:d.name, via, ref:entry.ref||null, detected:!!entry.detected };
  d.landed.push(rec); return rec;
}

function tarotDetectFromEvent(w, type, p){
  const d = w && w.tarot; if(!d || !type) return;
  p = p || {};
  const m = d.mutator, op = m && m.op, t = m && m.target;
  // D1 — alterWalkTexture: a tarot-textured walk actually walked THIS session
  if(type==="walk_advance" || type==="walk_complete"){
    if(typeof prepOf==="function" && typeof walkOfFrontier==="function"){
      const P = prepOf(w), wk = P && P.activeWalkId ? walkOfFrontier(w, P.activeWalkId) : null;
      if(wk && wk.motifSource==="tarot" && wk.motifSession===(w.session||0))
        tarotMarkLanded(w, { via:"walk-skin", ref:wk.motif||null, detected:true });
    }
    return;
  }
  if(!t) return;   // remaining detections all need a script-picked target
  // D2 — clock ops
  if((type==="clock_advanced" || type==="clock_fired") &&
     (op==="pressureFaction" || op==="advanceHottestClock") && p.clockId===t.id){
    tarotMarkLanded(w, { via:"faction-clock", ref:t.id, detected:true }); return;
  }
  // D3 — thread/codex ops: any codex-family event referencing the target id.
  if(["codex_update","codex_reveal","codex_contact","fact_canonized","prep_contact","front_closed"].indexOf(type)>=0){
    const id = p.id || p.factId || p.ledgerId || p.frontId || p.nodeId || null;
    if(id && id===t.id){
      const via = (op==="spotlightThread" || op==="nominateOldestThread") ? "thread"
                : (op==="markOmenTarget") ? (t.kind==="npc" ? "npc" : "codex")
                : "codex";                                    // surfaceHiddenFact + anything else targeted
      tarotMarkLanded(w, { via, ref:t.id, detected:true });
    }
  }
}

function tarotReceiptOf(w){
  const d = w && w.tarot;
  if(!d) return null;
  return { card:d.name, reversed:!!d.reversed, major:!!d.major, landed:(d.landed||[]).slice() };
}

/* ============================================================
   §4 THE FRONTISPIECE — asset-light chrome (name + suit-glyph placeholder; card art deferred H3).
   Player-facing: name + omen ONLY — mechanics (mutator/op/note) never render here. ──
   ============================================================ */
function tarotFrontispiece(w){
  const d = w && w.tarot;
  if(!d) return null;
  return {
    name: d.name, reversed: d.reversed, omen: d.omen,
    glyph: d.glyph||"✦", suit: d.suit||null, major: !!d.major,
    assetKey: d.assetKey || null,   // deferred — placeholder chrome renders on null
  };
}
