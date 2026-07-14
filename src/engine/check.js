/* GENESIS MODULE — src/engine/check.js — the CHECK/SAVE SPINE (docs/SRD-MECHANIZATION.md §1).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   THE ONE PRIMITIVE the whole game routes a d20 through. Today saves resolve only inside combat
   (engine.combat resolveSave) and skill checks half-exist (world.dm dmRollFor); this unifies them:
   one pure `resolveCheck` + three thin callers (skill / save / ability) that read the sheet's already-
   present inputs (mods / profBonus / skillProfs / saveProfs). It also owns the two things the DM used
   to eyeball: the DIFFICULTY.md margin ladder (a COMPUTED `degree`, not a judgment) and the spell save
   DC (a named single-source helper, finally RESOLVED against — engine rolls the foe's save).

   DM-agency: the dice-bearing path ACCEPTS the player's open d20 (o.d20) and rolls only when omitted
   (a foe / a simulated roll) — mirrors resolveAttack/resolveSave (the engine never rolls FOR the player).

   PURE + DETERMINISTIC where the math is (mirrors engine.social/engine.combat): operates only on the
   passed args, never on w/U — EXCEPT the Heroic Inspiration flag mutators (grantInspiration/
   spendInspiration), the one stateful corner (explicit sheet writers).
   Reads SKILL_ABILITY (data/srd-creator) + cmRollD20 (engine.combat) at call-time. */

/* The DIFFICULTY.md margin ladder (locked 2026-06-30), mechanized. A check is not pass/fail — the
   margin (total − DC) sets the DEGREE. nat 20 / nat 1 override the band (the crit layer is orthogonal;
   here it just pins the degree to the extreme). The near-miss grace is TIGHT — margin −1..−2 ONLY
   (feedback-genesis-degrees-of-failure: a −5 is a real failure, never "you almost had it"). Returns:
     crit-success  — nat 20, OR margin ≥ +10 (resounding)
     success       — margin ≥ 0
     near-miss     — margin −1 or −2 (the ONLY wiggle band)
     failure       — margin −3..−9
     crit-failure  — nat 1, OR margin ≤ −10 (severe) */
function checkDegree(margin, natural){
  if(natural === 20) return "crit-success";
  if(natural === 1)  return "crit-failure";
  if(margin >= 10)   return "crit-success";
  if(margin >= 0)    return "success";
  if(margin >= -2)   return "near-miss";
  if(margin >= -9)   return "failure";
  return "crit-failure";
}

/* THE PRIMITIVE. Resolves one d20 check against a DC and grades it.
   { d20?, abilityMod?, proficient?, proficiency?, bonus?, dc?, advantage?, reroll? }
     d20        — the player's open roll (supplied) or engine-rolled (NPC/foe), via cmRollD20
     abilityMod — from sh.mods[ability]
     proficient — when true, adds `proficiency` (the sheet's profBonus)
     bonus      — situational net modifier (Guidance +1d4 pre-rolled, cover, exhaustion −2×level, …)
     dc         — the target number (DM fiction, or a spell save DC)
     advantage  — "adv" | "dis" (only used when the engine rolls; a supplied d20 already reflects it)
     reroll     — HEROIC INSPIRATION: a second d20 (the reroll) — RAW 2024, the new result STANDS
                  (the player commits to spend before seeing it), so it simply REPLACES the natural.
   → { total, natural, success, margin, degree, dc } */
function resolveCheck(o){
  o = o || {};
  let nat = cmRollD20({ d20: o.d20, advantage: o.advantage });
  if(o.reroll != null) nat = o.reroll;                  // Heroic Inspiration — the reroll replaces (RAW: new result stands)
  const proficiency = o.proficient ? (o.proficiency || 0) : 0;
  const total = nat + (o.abilityMod || 0) + proficiency + (o.bonus || 0);
  const dc = (o.dc != null) ? o.dc : 0;
  const margin = total - dc;
  const degree = checkDegree(margin, nat);
  const success = (nat === 20) ? true : (nat === 1 ? false : margin >= 0);
  // ABSURDITY (Adam's call — "1 fails, 20 succeeds; fun beats nerd; wire the magnitude of the absurdity"):
  // how far a natural 20/1 DEFIED the math — the amount by which the auto-result overrode what the total
  // alone would have produced. 0 when the natural merely confirmed the math (a 20 that would have hit
  // anyway isn't absurd). Feeds the CRIT-MAGNITUDE lens so the DM narrates proportionally-legendary /
  // proportionally-catastrophic outcomes: a 20 clearing a DC 15 above its reach = wildly improbable.
  const absurdity = (nat === 20 && margin < 0) ? -margin : ((nat === 1 && margin >= 0) ? margin : 0);
  return { total, natural: nat, success, margin, degree, dc, absurdity };
}

/* ---- the three thin callers — compose resolveCheck off the sheet, nothing special-cased ---- */

/* pull the ability key for a skill from SKILL_ABILITY (data/srd-creator). */
function skillAbility(skill){
  return (typeof SKILL_ABILITY !== "undefined") ? (SKILL_ABILITY[skill] || null) : null;
}

/* SKILL check: ability resolved from SKILL_ABILITY, proficiency from sh.skillProfs. ABSORBS dmRollFor's
   modifier logic (reconcile, not duplicate) — same aMod + prof inputs → same total, so the Bridge path
   is unchanged. opts carries { d20, advantage, bonus, reroll }. Exhaustion (§5) folds in automatically. */
function resolveSkillCheck(sh, skill, dc, opts){
  opts = opts || {}; sh = sh || {};
  const ability = skillAbility(skill);
  const abilityMod = (ability && sh.mods && typeof sh.mods[ability] === "number") ? sh.mods[ability] : 0;
  const proficient = !!(sh.skillProfs && sh.skillProfs.indexOf(skill) >= 0);
  return resolveCheck({ d20: opts.d20, abilityMod, proficient, proficiency: sh.profBonus || 0,
    bonus: exhaustionBonus(sh) + (opts.bonus || 0), dc, advantage: opts.advantage, reroll: opts.reroll });
}

/* SAVING THROW: proficiency from sh.saveProfs. The missing half of the spine (saves only lived in combat). */
function resolveSaveCheck(sh, ability, dc, opts){
  opts = opts || {}; sh = sh || {};
  const abilityMod = (sh.mods && typeof sh.mods[ability] === "number") ? sh.mods[ability] : 0;
  const proficient = !!(sh.saveProfs && sh.saveProfs.indexOf(ability) >= 0);
  return resolveCheck({ d20: opts.d20, abilityMod, proficient, proficiency: sh.profBonus || 0,
    bonus: exhaustionBonus(sh) + (opts.bonus || 0), dc, advantage: opts.advantage, reroll: opts.reroll });
}

/* RAW ABILITY check: no proficiency. */
function resolveAbilityCheck(sh, ability, dc, opts){
  opts = opts || {}; sh = sh || {};
  const abilityMod = (sh.mods && typeof sh.mods[ability] === "number") ? sh.mods[ability] : 0;
  return resolveCheck({ d20: opts.d20, abilityMod, proficient: false,
    bonus: exhaustionBonus(sh) + (opts.bonus || 0), dc, advantage: opts.advantage, reroll: opts.reroll });
}

/* EXHAUSTION penalty (§5) folded into every check as a bonus term: −2 × exhaustion level (SRD 2024).
   Lives here so the penalty is COMPUTED into every resolveCheck caller, never remembered (anti-drift).
   Guarded so §1 stands alone before §5's field is populated (absent → 0). */
function exhaustionBonus(sh){
  const lvl = (sh && typeof sh.exhaustion === "number") ? sh.exhaustion : 0;
  return lvl > 0 ? -2 * lvl : 0;
}

/* SPELL SAVE DC — the single-source helper (was display-only in render.js:402, never resolved against).
   8 + profBonus + mods[spellAbility]. When the PC casts a save-spell, the FOE's save routes through
   resolveSave against this (engine rolls the foe's d20 — §2/§6). Falls back gracefully if spellAbility
   is unset (a non-caster) → 8 + profBonus. */
function spellSaveDC(sh){
  if(!sh) return 8;
  const ab = sh.spellAbility || sh.featSpellAbility || null;
  const mod = (ab && sh.mods && typeof sh.mods[ab] === "number") ? sh.mods[ab] : 0;
  return 8 + (sh.profBonus || 0) + mod;
}
/* the spell attack bonus (mirror of the save DC, for a spell that ATTACKS rather than forces a save). */
function spellAttackBonus(sh){
  if(!sh) return 0;
  const ab = sh.spellAbility || sh.featSpellAbility || null;
  const mod = (ab && sh.mods && typeof sh.mods[ab] === "number") ? sh.mods[ab] : 0;
  return (sh.profBonus || 0) + mod;
}

/* ---- HEROIC INSPIRATION (SRD 2024) — a spendable reroll token (docs/SRD-MECHANIZATION.md §1) ----
   sh.inspiration is a bool (you hold it or you don't — it does NOT stack). grantInspiration sets the
   flag (the existing inspiration_granted event now calls this); spendInspiration clears it and returns
   whether it WAS held (so the caller knows a reroll is authorized). The reroll itself is a fresh open
   d20 fed back into resolveCheck/resolveAttack as `reroll` — RAW: the new result stands. */
function grantInspiration(sh){ if(!sh) return false; const had = !!sh.inspiration; sh.inspiration = true; return !had; }
function hasInspiration(sh){ return !!(sh && sh.inspiration); }
function spendInspiration(sh){ if(!sh || !sh.inspiration) return false; sh.inspiration = false; return true; }
