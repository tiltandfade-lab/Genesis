/* GENESIS MODULE — src/engine/hazards.js — EXHAUSTION + ENVIRONMENTAL HAZARDS
   (docs/SRD-MECHANIZATION.md §5). Classic <script>, shared global scope. Registered in manifest.json;
   validated by check-manifest.py.

   THE GAP THIS CLOSES: exhaustion was named in bestiary condImmune but never tracked; falling/
   suffocation/on-fire had no formulas (ITEMS.md §D already defined on-fire = Burning 1d4/turn — reused
   here rather than re-authored).

   EXHAUSTION — a 6-level counter on the sheet (sh.exhaustion, 0-6). SRD 2024 model:
     -2 to d20 rolls PER LEVEL     — folds into engine.checks' resolveCheck as a `bonus` term
                                      (the caller composes the -2/level d20 penalty via
                                      exhaustionCheckPenalty, fed as `bonus`)
     -5 ft speed PER LEVEL         — exhaustionSpeedPenalty(sh) returns the flat feet to subtract
     level 6                      — death (the caller routes into Death & Rebirth, same as 3-failed
                                      death saves)
   Sources: a condition_add{condition:"exhaustion"} increments (world/dm.js wires this — addExhaustion is
   the mutator); a long rest DECREMENTS 1 (wired into restRecover's caller, or called directly).

   HAZARDS — thin formula helpers emitting hp_changed-shaped deltas (the caller wraps them in the actual
   event). resolveFall(feet) is the SRD bludgeoning formula. hazardTick(kind, ctx) covers on-fire (reuses
   the ITEMS.md §D Burning rate: 1d4 fire at the start of each turn) / suffocation / drowning off the
   HAZARDS table below — one hazard vocabulary, script-owned, shared with the items elemental-effects map. */

const EXHAUSTION_MAX = 6;

/* current exhaustion level (0 if untracked). */
function exhaustionLevel(sh){ return (sh && typeof sh.exhaustion === "number") ? sh.exhaustion : 0; }

/* increment exhaustion by `n` (default 1), clamped [0,6]. Level 6 is death — the caller (world/dm.js)
   checks the returned level and routes to Death & Rebirth when it hits the ceiling; this module only
   tracks the number, per the engine/DM split (the script owns the state, the DM owns what "you die of
   exhaustion" means in the fiction). Returns the new level. */
function addExhaustion(sh, n){
  if(!sh) return 0;
  sh.exhaustion = Math.min(EXHAUSTION_MAX, exhaustionLevel(sh) + (n || 1));
  return sh.exhaustion;
}

/* decrement exhaustion by `n` (default 1), floored at 0 — wired into a long rest (SRD 2024: a long rest
   with adequate food/water reduces exhaustion by 1). Returns the new level. */
function removeExhaustion(sh, n){
  if(!sh) return 0;
  sh.exhaustion = Math.max(0, exhaustionLevel(sh) - (n || 1));
  return sh.exhaustion;
}

/* -5 ft speed PER LEVEL (SRD 2024) — a flat feet-to-subtract the movement/combat layer reads. */
function exhaustionSpeedPenalty(sh){ return exhaustionLevel(sh) * 5; }

/* the -2-per-level d20 PENALTY term, ready to feed as engine.checks' resolveCheck `bonus` (negative). */
function exhaustionCheckPenalty(sh){ return -2 * exhaustionLevel(sh); }

/* FALLING — SRD 2024: 1d6 bludgeoning per 10 feet fallen, capped at 20d6 (a fall doesn't get worse past
   200 ft). Returns {dice:{n,die}, total, breakdown} via cmRollDamage (engine.combat) so a single roll
   convention is shared app-wide; falls back to an average-roll estimate if combat.js isn't loaded. */
function resolveFall(feet){
  const n = Math.min(20, Math.floor(Math.max(0, feet || 0) / 10));
  if(n <= 0) return { dice: { n: 0, die: 6 }, total: 0, breakdown: [] };
  if(typeof cmRollDamage === "function"){
    const r = cmRollDamage([{ n, die: 6, bonus: 0, type: "bludgeoning" }]);
    return { dice: { n, die: 6 }, total: r.total, breakdown: r.breakdown };
  }
  const avg = n * 3.5;                                    // average-of-d6 fallback (no engine.combat loaded)
  return { dice: { n, die: 6 }, total: Math.round(avg), breakdown: [{ type: "bludgeoning", amount: Math.round(avg) }] };
}

/* HAZARDS — the shared vocabulary (docs/ITEMS.md §D's elemental-effects map, reused not re-authored).
   Each entry is a per-tick formula; hazardTick reads it. `on-fire` mirrors the item Burning state
   exactly (1d4 fire at the start of each turn) so a PC and an item degrade under the same rate. */
const HAZARDS = {
  "on-fire":     { type: "fire",        dice: { n: 1, die: 4 } },       // ITEMS.md §D Burning — 1d4/turn
  "suffocating": { type: null,          dice: null },                    // no damage — see hazardTick's hold-breath timer
  "drowning":    { type: null,          dice: null }                     // same timer; the "drop to 0" step is a DM/rebirth hand-off
};

/* one tick of a hazard. `kind` ∈ HAZARDS keys. For on-fire: rolls the 1d4 fire (via cmRollDamage when
   available). For suffocating/drowning: SRD hold-breath-then-drop timer — a creature can hold its breath
   for a grace period, then it starts suffocating each round it doesn't breathe. Returns a tick result the
   caller turns into an hp_changed/condition event; never mutates state directly (mirrors resolveFall/
   resolveAttack's pure convention — the caller commits). */
function hazardTick(kind, ctx){
  ctx = ctx || {};
  const def = HAZARDS[kind];
  if(!def) return { ok: false, reason: "unknown-hazard" };
  if(kind === "on-fire"){
    const r = (typeof cmRollDamage === "function")
      ? cmRollDamage([{ n: def.dice.n, die: def.dice.die, bonus: 0, type: def.type }])
      : { total: 2, breakdown: [{ type: def.type, amount: 2 }] };   // average-of-1d4 fallback
    return { ok: true, kind, type: def.type, damage: r.total, breakdown: r.breakdown };
  }
  // suffocating/drowning: a round-based hold-breath-then-drop timer. `roundsHeld` = how many rounds the
  // creature has already gone without air; `holdRounds` = its grace period (the caller supplies the grace
  // it computed from 1+CON mod; default 1 for "no grace tracked yet" — a fast theater-of-the-mind fight
  // runs in rounds, not the SRD's real-time minutes scale).
  const holdRounds = (ctx.holdRounds != null) ? ctx.holdRounds : 1;
  const roundsHeld = (ctx.roundsHeld || 0) + 1;
  if(roundsHeld <= holdRounds) return { ok: true, kind, breathing: true, roundsHeld, holdRounds };
  // past the grace period: SRD 2024 — you drop to 0 HP and are dying (unconscious), not instant death.
  return { ok: true, kind, breathing: false, roundsHeld, holdRounds, dropTo0: true };
}
