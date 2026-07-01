/* GENESIS MODULE — src/engine/conditions.js — the CONDITIONS ENGINE (docs/SRD-MECHANIZATION.md §3).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   THE GAP THIS CLOSES: conditions were inert strings except prone/restrained (hardcoded special-cases
   in engine.combat's comments) — every other condition (blinded, charmed, frightened, grappled,
   incapacitated, paralyzed, poisoned, restrained, stunned, unconscious, invisible) was DM-adjudicated
   EACH occurrence, the single largest per-turn drift surface in combat.

   THE DESIGN: a script-owned condition→effect table (CONDITIONS) the resolver consults. Prone/
   restrained move from combat.js hardcoded special-cases into this table (no behavior change, less
   code — combat.js's resolveAttack callers should read conditionAdvDis from here rather than re-deriving
   prone/restrained locally; this module doesn't reach into combat.js, it's read the other direction).

   DURATIONS ARE MECHANIZED (Adam's call — DECIDED, not DM judgment): condition_add carries a
   STRUCTURED ttl the script owns expiry for:
     {rounds:n}                          — counted down at the end of the holder's turn (tickConditions)
     {untilSave:{ability,dc,when}}        — a repeat save each turn; success lifts it (checked by caller
                                            via resolveSaveCheck/resolveSave, then tickUntilSaveResult)
     {endOfNextTurn}                      — lifts at the end of the holder's NEXT turn (tickConditions)
     {concentration:casterId}             — auto-lifts when that caster's sh.concentration drops (the
                                            §2↔§3 wire; engine.concentration's breakConcentration calls
                                            back into removeCondition for every condition tagged with it)
     {indefinite}                         — a curse/disease until cured (no tick, no auto-lift)
   tickConditions(holder, round, phase) advances all counters at a turn boundary and returns the list
   of conditions that expired THIS tick (the caller — world/dm.js — emits condition_expired per entry,
   detected, so the DM narrates the lift without deciding when).

   `incapacitated` COMPOSITION (stunned/paralyzed/unconscious set it) is load-bearing: it's what lets
   §2 auto-break concentration (a concentrating caster who's stunned can't maintain it) and §6 auto-fail
   actions. isIncapacitated(holder) is the ONE check other modules call. */

/* CONDITIONS — the script-owned condition→effect table (docs/SRD-MECHANIZATION.md §3, verbatim from
   the spec). Consulted by conditionAdvDis/isIncapacitated/conditionAutoFail — never hand-special-cased
   per-condition elsewhere. */
const CONDITIONS = {
  blinded:       { attacksDisadvantage:true, attackedAdvantage:true, autofailSight:true },
  poisoned:      { attacksDisadvantage:true, checksDisadvantage:true },
  frightened:    { attacksDisadvantage:true, checksDisadvantage:true, cantApproachSource:true },
  restrained:    { attacksDisadvantage:true, attackedAdvantage:true, dexSaveDisadvantage:true, speed0:true },
  prone:         { attacksDisadvantage:true, meleeAttackedAdvantage:true, rangedAttackedDisadvantage:true },
  paralyzed:     { incapacitated:true, speed0:true, autofailStrDex:true, attackedAdvantage:true, critIn5ft:true },
  stunned:       { incapacitated:true, autofailStrDex:true, attackedAdvantage:true },
  unconscious:   { incapacitated:true, prone:true, speed0:true, autofailStrDex:true, attackedAdvantage:true, critIn5ft:true },
  grappled:      { speed0:true },
  incapacitated: { noActions:true, noReactions:true },
  invisible:     { attacksAdvantage:true, attackedDisadvantage:true },
  charmed:       { cantAttackCharmer:true, socialAdvantageForCharmer:true }
};

/* holder shape convention: any combatant/PC-sheet-like object carrying `conditions` as an array of
   EITHER a bare condition-name string (back-compat: today's inert item-conditions-style tagging) OR a
   structured {condition, ttl, appliedRound?} entry (the new mechanized shape). Every reader normalizes both. */
function condName(entry){ return (typeof entry === "string") ? entry : (entry && entry.condition) || null; }

/* the effect-table row for one condition name (or null if unknown/uncataloged). */
function conditionEffects(name){ return CONDITIONS[name] || null; }

/* does `holder` currently carry `name` (either shape)? */
function hasCondition(holder, name){
  const list = (holder && holder.conditions) || [];
  return list.some(e => condName(e) === name);
}

/* COMPOSITION: incapacitated is set directly OR via stunned/paralyzed/unconscious (each of which sets
   `incapacitated:true` in its own row) — so this checks the holder's conditions against the table, not
   just a literal "incapacitated" tag (a stunned holder IS incapacitated even if never tagged so). */
function isIncapacitated(holder){
  const list = (holder && holder.conditions) || [];
  return list.some(e => { const n = condName(e); const eff = conditionEffects(n);
    return n === "incapacitated" || (eff && eff.incapacitated); });   // the literal condition IS incapacitation, plus its composers
}

/* Derive the ATTACK/CHECK advantage-or-disadvantage the ATTACKER's and the TARGET's live conditions
   impose, per the CONDITIONS table — the mechanization of "the DM no longer states 'you have
   disadvantage,' the engine returns it in the breakdown." `kind` = "attack" | "check" (checks read
   checksDisadvantage; attacks read attacksDisadvantage/attacksAdvantage on the ACTOR and
   attackedAdvantage/attackedDisadvantage/meleeAttackedAdvantage/rangedAttackedDisadvantage on the
   TARGET). `range` = "melee" | "ranged" (only matters for prone's asymmetry). Ties (one adv + one dis
   source) cancel per RAW — SRD 2024 doesn't stack same-type advantage/disadvantage and a simultaneous
   adv+dis source nets to a flat roll. Returns {advantage:"adv"|"dis"|null, sources:{adv:[...],dis:[...]}}. */
function conditionAdvDis(o){
  o = o || {};
  const actor = o.actor || null, target = o.target || null, kind = o.kind || "attack", range = o.range || "melee";
  const advSrc = [], disSrc = [];
  const actorConds = ((actor && actor.conditions) || []).map(condName);
  const targetConds = ((target && target.conditions) || []).map(condName);
  actorConds.forEach(name => {
    const eff = conditionEffects(name); if(!eff) return;
    if(kind === "attack" && eff.attacksDisadvantage) disSrc.push(name);
    if(kind === "attack" && eff.attacksAdvantage) advSrc.push(name);
    if(kind === "check" && eff.checksDisadvantage) disSrc.push(name);
  });
  if(kind === "attack"){
    targetConds.forEach(name => {
      const eff = conditionEffects(name); if(!eff) return;
      if(eff.attackedAdvantage) advSrc.push("target:" + name);
      if(eff.attackedDisadvantage) disSrc.push("target:" + name);
      if(eff.meleeAttackedAdvantage && range === "melee") advSrc.push("target:" + name);
      if(eff.rangedAttackedDisadvantage && range === "ranged") disSrc.push("target:" + name);
    });
  }
  const hasAdv = advSrc.length > 0, hasDis = disSrc.length > 0;
  const advantage = (hasAdv && hasDis) ? null : (hasAdv ? "adv" : (hasDis ? "dis" : null));
  return { advantage, sources: { adv: advSrc, dis: disSrc } };
}

/* Does this holder AUTO-FAIL a save of the given ability, per its conditions? (paralyzed/stunned/
   unconscious → autofailStrDex on Str/Dex saves; blinded → autofailSight is a perception/sight-check
   concern, not a saving throw, so it's excluded here — callers checking a sight-based CHECK should
   consult conditionEffects(...).autofailSight directly.) */
function conditionAutoFail(holder, ability){
  const list = (holder && holder.conditions) || [];
  const strDex = (ability === "str" || ability === "dex");
  return list.some(e => { const eff = conditionEffects(condName(e)); return eff && eff.autofailStrDex && strDex; });
}

/* ---- mutators: the only writers of holder.conditions ---- */

/* add ONE condition with a structured ttl (docs/SRD-MECHANIZATION.md §3's duration shapes). No-ops
   (returns null) on an unrecognized name — the engine never invents a new condition ontology; applying
   one is still a DM/spell-triggered call, the engine just owns the consequence + the clock afterward.
   Re-adding an already-held condition REFRESHES its ttl (a re-application resets the clock rather than
   stacking two independent timers). `appliedRound` stamps the round it landed (for {rounds:n} countdown
   math). Returns the entry. */
function addCondition(holder, name, ttl, appliedRound){
  if(!holder || !CONDITIONS[name]) return null;
  holder.conditions = holder.conditions || [];
  const existingIdx = holder.conditions.findIndex(e => condName(e) === name);
  const entry = { condition: name, ttl: ttl || { indefinite: true }, appliedRound: appliedRound || 0 };
  if(existingIdx >= 0) holder.conditions[existingIdx] = entry;
  else holder.conditions.push(entry);
  return entry;
}

/* remove ONE condition unconditionally (an explicit DM lift, a cure, a save success the caller already
   graded). Returns true if it was present. */
function removeCondition(holder, name){
  if(!holder) return false;
  const list = holder.conditions || [];
  const before = list.length;
  holder.conditions = list.filter(e => condName(e) !== name);
  return holder.conditions.length !== before;
}

/* TICK all of holder's structured-ttl conditions at a turn boundary. `round` = the CURRENT round number;
   `phase` = "end"|"start" of the holder's OWN turn (only {rounds:n} and {endOfNextTurn} advance off a
   bare tick — {untilSave} needs an actual save result the caller supplies via tickUntilSaveResult;
   {concentration} lifts via engine.concentration calling removeCondition directly, not this tick).
   Returns the list of condition NAMES that expired this call (the caller emits condition_expired per
   entry — detected, so the DM narrates the lift without deciding when). Mutates holder.conditions. */
function tickConditions(holder, round, phase){
  if(!holder || !Array.isArray(holder.conditions)) return [];
  const expired = [];
  const keep = [];
  holder.conditions.forEach(e => {
    if(typeof e === "string"){ keep.push(e); return; }         // legacy bare-string tag — no ttl, never auto-expires
    const ttl = e.ttl || {};
    if(ttl.rounds != null){
      // count down only at the END of the holder's own turn (the SRD convention: "at the end of each
      // of its turns"). A fresh application (appliedRound===round) doesn't tick on the SAME end-of-turn.
      if(phase === "end" && round > (e.appliedRound || 0)){
        const remaining = ttl.rounds - (round - (e.appliedRound || 0));
        if(remaining <= 0){ expired.push(e.condition); return; }
      }
      keep.push(e);
    } else if(ttl.endOfNextTurn){
      // lifts at the end of the holder's turn FOLLOWING the one it was applied on.
      if(phase === "end" && round > (e.appliedRound || 0)){ expired.push(e.condition); return; }
      keep.push(e);
    } else {
      keep.push(e);   // untilSave / concentration / indefinite — no bare-tick expiry
    }
  });
  holder.conditions = keep;
  return expired;
}

/* Grade a repeat {untilSave} condition's save THIS turn and lift it on success. Caller supplies the
   already-resolved check result (from resolveSaveCheck/resolveSave) — this module never rolls a save
   itself (dice transparency holds even for condition-lift saves). Returns true if it lifted. */
function tickUntilSaveResult(holder, name, success){
  if(!success) return false;
  return removeCondition(holder, name);
}
