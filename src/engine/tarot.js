/* GENESIS MODULE — src/engine/tarot.js — THE SESSION DRAW (docs/TAROT-SESSION.md).
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reads data/tarot.js (TAROT_DECK/TAROT_SUITS/TAROT_MAJORS) at call-time — must load after it.

   §2 wiring: tarotDraw(w) fires once at beginSession (1 card, upright/reversed 50/50, true random)
   and stores the result on w.tarot — the session parameter vector. tarotVectorOf(w) reads that
   stored draw back into the small named multipliers the rollers consult (BATCH-GUARDRAILS-style
   "small multiplier read, default 1.0 — zero behavior change without a draw"). The vector is an
   INPUT the roller call sites pass through (region.js precedent: fraySpiceFloor/regionEconBump are
   POST-PROCESSING biases applied at the caller, never inside the roller itself) — walkSpiceBand,
   resolveArchetypePool, rollShopStock, prepCastAmbient are all UNTOUCHED; every wired call site
   takes an optional final param that defaults to today's exact unbiased behavior.

   Card art is DEFERRED (BATCH2-GUARDRAILS H3) — tarotFrontispiece() renders a name + suit-glyph
   placeholder; assetKey rides null until the RWS scan batch lands. Reveal is card-shown/meaning-
   veiled (§0 fork): the player sees name+omen only, never `mutator`/`op`/`note` (DM-only). */

/* ============================================================
   §2 THE DRAW — beginSession fires this once; the vector is an INPUT to seamProposeShape (not a
   second competing lean system) and dissolves at endSession (seamHarvest telemetry, forward ref).
   ============================================================ */
function tarotDraw(w){
  if(!w || typeof TAROT_DECK==="undefined" || !TAROT_DECK.length) return null;
  const card = TAROT_DECK[Math.floor(Math.random()*TAROT_DECK.length)];
  const reversed = Math.random() < 0.5;
  const pol = reversed ? card.rev : card.up;
  const draw = {
    session: w.session || 0,
    name: card.name, major: !!card.major, suit: card.suit, rank: card.rank, court: !!card.court,
    domain: card.domain, glyph: card.glyph, reversed,
    omen: pol.omen,                                            // player-facing (veiled mechanics)
    mutator: card.major ? { op:pol.op, params:pol.params||{}, note:pol.note||null } : null,  // DM-only
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
    default: break;   // noNudge + the clock/thread ops: no numeric change, op/opParams still ride for the DM layer
  }
  return v;
}

/* ============================================================
   ROLLER HOOKS — small multiplier reads, default-inert without a draw (BATCH-GUARDRAILS mutation
   contract: leak a nudge with no card, the harness fails). Every hook below takes the VECTOR
   (tarotVectorOf(w)'s return) as its param — same calling convention as region.js's wrappers, which
   take `region` (a w.regions[] record), not `w`. None touch the roller functions themselves
   (region.js's fraySpiceFloor/regionEconBump precedent — post-process at the caller, optional final
   param, today's-exact-behavior default). A null/undefined vector is treated as TAROT_DEFAULT_VECTOR
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
   as a REROLL-TOWARD bias (region.js's fraySpiceFloor discipline: re-roll-and-prefer, never clamp/
   rename the band that landed) — never mechanized inside walkSpiceBand itself. */
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

/* tarotDigestCard(w) -> {name,reversed,omen,mutator} DM-only (docs/DM-BRIDGE.md digest twin of §2's
   "digest.sessionLean.card"). mutator is null for a minor draw (minors carry no bespoke directive —
   §1 "math where it scales"); for a Major it's {op,params,note}. null when no draw this session. */
function tarotDigestCard(w){
  const d = w && w.tarot;
  if(!d) return null;
  return { name:d.name, reversed:d.reversed, omen:d.omen, mutator:d.mutator||null };
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
