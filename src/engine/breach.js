/* GENESIS MODULE — src/engine/breach.js — THE BREACH & THE NIGHTMARE, engine layer
   (docs/BREACH.md, docs/BATCH3-GUARDRAILS.md J2 "breach-core"). Classic <script>, shared global
   scope. Registered in manifest.json; validated by build/check-manifest.py.

   §0/§1/§2 DISTRIBUTION (BREACH.md §0): the walk-skin roll becomes a 2d10 BELL + a fray shift.
   Center mass (4..18, ~94%) resolves through the lane's EXISTING authored d100 skin table exactly
   as WALK-REFRESH shipped it (rollWalkSkin — untouched). The LOW tail (2..3, ~3%) reaches for the
   Nightmare table (this world, distilled); the HIGH tail (19..20, ~3%) reaches for the Breach table
   (another world entirely). `frayMod` (0 below FRAY_1, +1 to FRAY_2, +2 beyond — REGIONS-NAMES.md's
   own thresholds, reused verbatim, never re-declared) pushes the 2d10 result AWAY from center-11 in
   whichever direction it already leans (BATCH3-GUARDRAILS J2's EXACT shift rule): the rim widens
   BOTH tails; the center never gains ground.

   THIS UNIT ("breach-core") ships the PURE DISPATCH ENGINE + the physics-lens executors + the
   persistence/marooned bookkeeping — the breach/nightmare TABLES themselves (six d20s) are a
   separate batch-3 unit ("breach-tables", not yet landed). Every table read here degrades
   NULL-SAFE (uncompiled table -> the tail dispatch falls back to the center roll, never crashes,
   never invents table rows) — matching WORLD-TURN/GAP-WIRING's established convention.

   PURE where the math is (mirrors engine.combat/engine.social/world.gap-wiring): the dispatch and
   the physics executors operate only on their passed args; the one exception is
   breachPersistenceRoll's caller-supplied walk record (mutated + returned, same convention as
   src/engine/skin-grants.js's applySkinGrants) and breachMaroonedDebt, which is an explicit,
   single-purpose w.realm.debt setter (never touched by any other function in this file).

   Reads rollTable/rollExpr (engine.compiled), rollDie (engine.core), rollWalkSkin (engine.walk),
   frayLevel/FRAY_1/FRAY_2 (engine.region), slug (world.state) at call-time — every read is
   typeof-guarded (BATCH-GUARDRAILS G9: a lean/headless load order that omits any of them degrades
   to a no-op/fallback rather than throwing). */

/* ============================================================================
   §0 THE 2D10 BELL + FRAY SHIFT (BATCH3-GUARDRAILS J2 — the EXACT shift rule)
   ============================================================================ */

const BREACH_TAIL = 19;      // BREACH-tail floor on the shifted 2d10 (19..20)
const NIGHTMARE_TAIL = 3;    // NIGHTMARE-tail ceiling on the shifted 2d10 (2..3)
const BREACH_XP = 1.5;       // BREACH.md §1 — the danger-pays XP premium (init value, E(L) units)
const NIGHTMARE_XP = 1.5;    // BREACH.md §1 — same premium for nightmare walks

/* breachFrayMod(q, r) — J2: "0 below FRAY_1 * +1 to FRAY_2 * +2 beyond", read straight off
   REGIONS-NAMES.md's own FRAY_1/FRAY_2 thresholds (engine.region) — no second constant declared.
   No region module loaded / no coords -> 0 (center-of-the-map default, never assume rim-ward). */
function breachFrayMod(q, r){
  if(typeof frayBeyond2==="function" && q!=null && r!=null && frayBeyond2(q, r)) return 2;
  if(typeof frayBeyond1==="function" && q!=null && r!=null && frayBeyond1(q, r)) return 1;
  return 0;
}

/* breachShift2d10(frayMod) — the raw 2d10 roll (r: 2..20) plus the EXACT J2 shift rule:
     r>11  -> r+frayMod   (already leaning high -> pushed higher, toward Breach)
     r<11  -> r-frayMod   (already leaning low  -> pushed lower, toward Nightmare)
     r==11 -> unchanged   (dead center never moves)
   then clamp to [2,20] (a die can't roll off its own face). Returns {raw, shifted, frayMod}. */
function breachShift2d10(frayMod){
  const mod=frayMod||0;
  const raw=(typeof rollDie==="function") ? (rollDie(10)+rollDie(10)) : (1+Math.floor(Math.random()*10)+1+Math.floor(Math.random()*10));
  let shifted=raw;
  if(raw>11) shifted=raw+mod;
  else if(raw<11) shifted=raw-mod;
  shifted=Math.max(2, Math.min(20, shifted));
  return {raw, shifted, frayMod:mod};
}

/* breachTailOf(shifted) -> "nightmare" | "breach" | "center". Pure classification, no side effects —
   the constants above are the single source the whole file (and its harness) reads. */
function breachTailOf(shifted){
  if(shifted<=NIGHTMARE_TAIL) return "nightmare";
  if(shifted>=BREACH_TAIL) return "breach";
  return "center";
}

/* ============================================================================
   §1 THE DISPATCH — rollWalkSkinBreach(envKind, opts) wraps the CENTER resolver (default
   rollWalkSkin, engine.walk — untouched)
   ============================================================================
   opts: { q, r, centerFn } — q/r: the walk's hex position, for frayMod (absent -> frayMod 0, the
   safe default). centerFn: an optional zero-arg override for the center resolver — callers that
   already compose region-bias/tarot-spice-lean over rollWalkSkin (regionBiasedWalkSkin /
   tarotSpiceBiasedSkin, engine.region / engine.tarot) pass THEIR chain here so a center result is
   still their fully-biased roll, not a plain rollWalkSkin bypassing it; omitted -> plain
   rollWalkSkin(envKind), byte-identical to pre-breach behavior.
   Center tail: returns the center resolver's result EXACTLY (the existing d100 tables/bias chain
   are untouched, per BREACH.md §0's own framing). Nightmare/Breach tail: rolls the compiled
   `walk-nightmare-<envKind>` / `walk-breach-<envKind>` table (breach-tables' six d20s — a LATER
   unit); uncompiled today, so this degrades to the CENTER roll (never a hard fail, never a
   fabricated row — BATCH-GUARDRAILS G9). Every result carries `{tail, roll:{raw,shifted,frayMod}}`
   so callers/DM/harness can see which lane actually fired, even on a graceful fallback. */
function rollWalkSkinBreach(envKind, opts){
  opts=opts||{};
  const frayMod=breachFrayMod(opts.q, opts.r);
  const roll=breachShift2d10(frayMod);
  const tail=breachTailOf(roll.shifted);
  const resolveCenter=(typeof opts.centerFn==="function") ? opts.centerFn
      : ((typeof rollWalkSkin==="function") ? (()=>rollWalkSkin(envKind)) : (()=>null));
  const centerSkin=resolveCenter();
  if(tail==="center" || typeof rollTable!=="function"){
    return centerSkin ? Object.assign({}, centerSkin, {tail:"center", roll}) : null;
  }
  const tableId = (tail==="breach" ? "walk-breach-" : "walk-nightmare-") + envKind;
  const tRoll=rollTable(tableId);
  if(!tRoll || !tRoll.text){
    // NULL-SAFE fallback (breach-tables not yet landed / this envKind not yet authored): the tail
    // WANTED to fire but has nowhere to land yet — the center roll still ships, tagged so callers
    // can tell a graceful fallback from an actual center result.
    return centerSkin ? Object.assign({}, centerSkin, {tail:"center", tailWanted:tail, roll}) : null;
  }
  return {
    text:tRoll.text, band:tRoll.band||null, ref:tableId+"#"+tRoll.total,
    grants:tRoll.grants||"", motif:tRoll.motif||"",
    tail, roll,
    entry: breachEntryOf(tRoll), realms: breachRealmsOf(tRoll)
  };
}

/* breachEntryOf(tRoll)/breachRealmsOf(tRoll) — BREACH.md §1's "Entry (threshold/ambush)" column and
   §2c's "realms:[...]" tag, read off rollTable's `.cells` when the breach-tables unit lands columns
   for them (graceful null today — no column yet). Kept as named accessors (not inlined) so the
   breach-tables unit's landing needs no change here, only a populated cells array. */
function breachEntryOf(tRoll){
  const c=(tRoll&&tRoll.cells)||null;
  if(!c) return null;
  const raw=(c.find(x=>/threshold|ambush/i.test(x||""))||"").toLowerCase();
  if(raw.indexOf("ambush")>=0) return "ambush";
  if(raw.indexOf("threshold")>=0) return "threshold";
  return null;
}
function breachRealmsOf(tRoll){
  const c=(tRoll&&tRoll.cells)||null;
  if(!c) return [];
  const raw=c.find(x=>/^realms?:/i.test(x||""));
  if(!raw) return [];
  return raw.replace(/^realms?:/i,"").split(/[,;]\s*/).map(s=>s.trim()).filter(Boolean);
}

/* ============================================================================
   §2 PERSISTENCE — the d6 roll AT walk exit, once, stored on the walk record (J2, EXACT)
   ============================================================================
   1-4 SEALED (the district becomes an unverifiable story once the walk ends — BREACH.md §2c: sealing
   never strands, it seals BEHIND you) * 5 UNSTABLE (a return trip is a gamble) * 6 STABLE (map canon
   — a write-once weird door). PURE: mutates+returns the passed walk (mirrors applySkinGrants'
   contract); rolls ONCE — a walk that already carries `walk.persistence` is left untouched (the
   idempotency half of "AT exit, once" — the caller decides WHEN exit happens, this just never
   double-rolls if called twice for the same walk). */
const BREACH_PERSISTENCE = { SEALED:"sealed", UNSTABLE:"unstable", STABLE:"stable" };
function breachPersistenceRoll(walk){
  if(!walk) return null;
  if(walk.persistence) return walk.persistence;   // idempotent — never re-rolled once stamped
  const d=(typeof rollDie==="function") ? rollDie(6) : (1+Math.floor(Math.random()*6));
  const outcome = d<=4 ? BREACH_PERSISTENCE.SEALED : d===5 ? BREACH_PERSISTENCE.UNSTABLE : BREACH_PERSISTENCE.STABLE;
  walk.persistence = { d, outcome };
  return walk.persistence;
}

/* breachStableDoor(w, walk, nodeId) — BREACH.md §3: "a stable door writes a map node/edge flag
   (write-once, like every route)". Only fires for outcome==="stable"; write-once via the SAME
   idempotency discipline addEdge/addNode already use elsewhere in this codebase (never re-flag an
   already-flagged node). w/nodeId absent (headless/lean caller, no live world) -> no-op, the
   persistence roll itself is still valid and returned by breachPersistenceRoll above regardless. */
function breachStableDoor(w, walk, nodeId){
  if(!w || !nodeId) return false;
  const n=(typeof mapOf==="function") ? (mapOf(w).nodes||{})[nodeId] : null;
  if(!n) return false;
  if(n.breachDoor) return false;                 // write-once — an already-flagged door never re-flags
  n.breachDoor = { stable:true, realm:(walk&&walk.skin&&walk.skin.motif)||null, at:(w.clock&&w.clock.day)||null };
  return true;
}

/* ============================================================================
   §3 MAROONED — the 1d2-walk debt counter (J2: "lives on w.realm.debt and ONLY the original roll
   sets it" — a mutation-checked invariant: a second call for an already-active realm must NEVER
   re-roll or extend the debt, even if invoked again mid-maroon)
   ============================================================================ */

/* breachMarkRealmActive(w, realmTag) — enters (or re-enters, idempotently) a marooned realm. w.realm
   is created fresh ONLY if absent; an already-active w.realm (any debt, including 0) is returned
   untouched — this is the ONE guarded write site for w.realm.debt, per J2's mutation check. */
function breachMarkRealmActive(w, realmTag, physics){
  if(!w) return null;
  if(w.realm && w.realm.active) return w.realm;   // already marooned — never re-roll/extend the debt
  const debt=1+((typeof rollDie==="function") ? (rollDie(2)-1) : Math.floor(Math.random()*2)); // 1d2
  w.realm = { active:true, name:realmTag||null, physics:Array.isArray(physics)?physics.slice():[], debt, motif:null };
  return w.realm;
}
/* breachRealmWalkTaken(w) — one chained walk consumed (§2c wandering: nested breaches re-route the
   journey but the debt counter itself is untouched by this call — it only decrements toward home).
   Returns the remaining debt (0 -> the next walk's finale is home, per §2c "the final walk's finale
   is ALWAYS home" — that promotion is the caller/prep layer's job, this just reports the count). */
function breachRealmWalkTaken(w){
  if(!w || !w.realm || !w.realm.active) return null;
  w.realm.debt = Math.max(0, (w.realm.debt||0) - 1);
  return w.realm.debt;
}
/* breachRealmClear(w) — homecoming: the realm closes. Idempotent (a non-active realm is a no-op). */
function breachRealmClear(w){
  if(!w || !w.realm) return false;
  if(!w.realm.active) return false;
  w.realm.active=false;
  return true;
}

/* ============================================================================
   §4 PHYSICS LENSES — pure executors, closed vocabulary (BREACH.md §1/§2b: techWorks * magicDim *
   lowGrav * timeSlip * huntRules * stageRules * dreamRules — J2 wires the founding list; dreamRules
   ships from outlandish-realms, kept here as a no-op-safe stub for forward compatibility). ≤15 lines
   each, per BREACH.md §3.3. NEVER touch HP/damage dice/AC/XP pricing (BREACH.md §2b's no-break
   invariant #2 — the harness's mutation check breaks this rule on purpose and confirms the guard). */

const BREACH_PHYSICS_VOCAB = ["techWorks","magicDim","lowGrav","timeSlip","huntRules","stageRules","dreamRules"];

/* breachPhysicsDcBump(physics) -> integer DC delta for spell-save/spell-related DCs ONLY (magicDim:
   "DC +2, slots feel expensive" — BREACH.md §2b). Callers add this to their own `o.dc`/bonus at a
   resolveCheck call site (engine.check) — this file never patches resolveCheck itself ("never
   patched globals", J2). Absent magicDim -> 0 (no change). */
function breachPhysicsDcBump(physics){
  return (Array.isArray(physics) && physics.indexOf("magicDim")>=0) ? 2 : 0;
}
/* breachPhysicsZoneStep(physics) -> +1 zone-step BOTH sides (lowGrav — BREACH.md §2b "+1 zone-step
   BOTH sides"). Callers fold this into their own zone-movement budget (engine.combat cmZoneGrid
   territory) — this file only reports the delta, never mutates a combat object directly. */
function breachPhysicsZoneStep(physics){
  return (Array.isArray(physics) && physics.indexOf("lowGrav")>=0) ? 1 : 0;
}
/* breachPhysicsTechGate(physics) -> is the Outlandish tech-band gate OPEN (techWorks — BREACH.md
   §1: "the outlandish gate open + tech items function"). Callers use this to relax dungeon-walk.js's
   DWALK_OUTLANDISH_GATE for THIS walk only (never mutates the shared gate constant itself). */
function breachPhysicsTechGate(physics){
  return Array.isArray(physics) && physics.indexOf("techWorks")>=0;
}
/* breachPhysicsHuntClock(physics) -> is a stalking apex-threat clock active for this walk (huntRules
   — "the walk's apex threat stalks BETWEEN segments, a moving clock"). Pure boolean flag; the actual
   clock object is the caller's (mirrors gap-wiring's chase* contract — this file never owns GS/w
   state, only reports what the physics vocabulary implies). */
function breachPhysicsHuntClock(physics){
  return Array.isArray(physics) && physics.indexOf("huntRules")>=0;
}
/* breachPhysicsStageVoice(physics) -> is stageRules/timeSlip active (narrative + social-DC lenses
   ONLY, per BREACH.md §2b invariant #2 — "narrative + social-DC lenses only", never combat numbers).
   Reported as a set so a caller can check either independently. */
function breachPhysicsStageVoice(physics){
  const p=Array.isArray(physics)?physics:[];
  return { stageRules:p.indexOf("stageRules")>=0, timeSlip:p.indexOf("timeSlip")>=0, dreamRules:p.indexOf("dreamRules")>=0 };
}

/* breachApplyPhysicsToCombat(combat, physics) — the ONE combatStart-adjacent touch point named in
   J2 ("applied at combatStart/check-time reads"). PURE: returns a NEW plain object carrying the
   lens deltas (never mutates `combat` itself, never writes HP/damage/AC/XP — BREACH.md §2b's
   no-break invariant #1/#2). A caller that wants the lens live folds these fields in at its own
   combatStart call site; this file stops at reporting them. */
function breachApplyPhysicsToCombat(combat, physics){
  return {
    dcBump: breachPhysicsDcBump(physics),
    zoneStep: breachPhysicsZoneStep(physics),
    techGate: breachPhysicsTechGate(physics),
    huntClock: breachPhysicsHuntClock(physics),
    voice: breachPhysicsStageVoice(physics)
  };
}

/* ============================================================================
   §5 PREMIUMS — BREACH_XP/NIGHTMARE_XP multipliers in E(L) units (J2e §8: "xpReport gains a
   breach/nightmare bucket so the premium is tunable from evidence"). breachXpMultiplier(tail) is the
   single source both grantXp-adjacent callers and the xpReport bucket should read — never a second
   hardcoded 1.5 anywhere else in the codebase. */
function breachXpMultiplier(tail){
  if(tail==="breach") return BREACH_XP;
  if(tail==="nightmare") return NIGHTMARE_XP;
  return 1;
}
