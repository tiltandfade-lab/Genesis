/* GENESIS MODULE — src/engine/social.js — the Attitude / Parley / Morale RESOLVER (docs/SOCIAL.md §2–§4,§6).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   PURE + DETERMINISTIC. Every function takes plain numbers/flags and RETURNS A DELTA — it never reads or
   writes the world/codex. The Phase-3 event layer (applyEvent) calls these, then commits the result via
   codexSetAttitude / codexSetTerrified (engine owns the math; the script owns state; the DM never decides
   whether persuasion worked — the dice + these rules do, SOCIAL.md §5). The social analog of combat:
   Attitude is HP, a Cha check vs. an attitude-derived DC is the attack roll, Morale is the bridge from a
   fight into words. Reuses the codex attitude ladder bounds (ATTITUDE_MIN/MAX) at call time. */

/* §2 — the DC to shift attitude ONE STEP friendlier, keyed to the CURRENT attitude (the consistency spine,
   anchored on the standard DC ladder 5/10/15/20/25/30). Helpful (+2) is terminal → null (can't talk higher).
   Making someone MORE hostile (deliberate provocation) is the inverse and generally easier — handled by the
   DM as a declared move, not this friendlier-direction table. */
const SOCIAL_DC_BY_ATTITUDE = { "-2":25, "-1":20, "0":15, "1":10, "2":null };
const SOCIAL_DC_FLOOR = 5;
const SOCIAL_DC_CEIL = 30;
function socialDC(value){
  const v = Math.max(ATTITUDE_MIN, Math.min(ATTITUDE_MAX, Math.round(Number(value) || 0)));
  return SOCIAL_DC_BY_ATTITUDE[String(v)];
}

/* §2.1 — leverage adjusts the DC (the existing NPC Want/Fear/Leverage/Trust-Lever tables finally bite).
   `levers` = array of lever types (strings) or {type, decisive?}. Returns {dc (clamped 5..30), autoShift, mod}.
   A DECISIVE leverage (the PC can literally GIVE the thing / holds a choke point) AUTO-SHIFTS one step with
   no roll — the lever IS the answer (SOCIAL.md §2.1, §4.2 buy-off). */
const SOCIAL_LEVER_MODS = { want:-5, fear:-5, leverage:-5, trustLever:-5, wrongLever:5 };
function applyLeverage(dc, levers){
  levers = levers || [];
  let mod = 0, autoShift = false;
  for (const l of levers){
    const t = (typeof l === "string") ? l : (l && l.type);
    if (t === "leverage" && l && l.decisive) autoShift = true;
    if (SOCIAL_LEVER_MODS[t] != null) mod += SOCIAL_LEVER_MODS[t];
  }
  const out = Math.max(SOCIAL_DC_FLOOR, Math.min(SOCIAL_DC_CEIL, (Number(dc) || 0) + mod));
  return { dc: out, autoShift, mod };
}

/* §2 — resolve ONE social check (one exchange = one check = at most one step). Pure: returns the delta the
   event layer applies. Inputs: {value (current attitude), floor, ceiling (per-NPC clamps),
   skill ("persuasion"|"deception"|"intimidation"), total (PC's open roll + mods), dc (post-leverage),
   caughtLie (a Deception that failed vs. the NPC's Insight), overshoot (an Intimidation crit / threat-to-
   life → Terrified)}. Returns {outcome, from, to, shift, terrified, granted}.
   Failure cost (§2.4 reconciled with §2.1): caught lie = −2 (worst) · miss by 5+ = −1 · flat miss = 0. */
function resolveSocialCheck(input){
  input = input || {};
  const floor   = (input.floor   != null) ? input.floor   : ATTITUDE_MIN;
  const ceiling = (input.ceiling != null) ? input.ceiling : ATTITUDE_MAX;
  const clamp = v => Math.max(floor, Math.min(ceiling, v));
  const value = clamp(Math.round(Number(input.value) || 0));
  const skill = input.skill || "persuasion";
  const total = Number(input.total) || 0;
  const dc    = Number(input.dc) || 0;

  if (total >= dc){                                   // SUCCESS
    if (skill === "intimidation" && input.overshoot){ // overshoot → Terrified (comply now, Hostile underneath, §1)
      const to = clamp(ATTITUDE_MIN);
      return { outcome:"terrified", from:value, to, shift:to - value, terrified:true, granted:true };
    }
    if (value >= ceiling)                             // at the cap (Helpful, or a clamped enemy) — granted, no further shift
      return { outcome:"capped", from:value, to:value, shift:0, terrified:false, granted:true };
    const to = clamp(value + 1);
    return { outcome:"success", from:value, to, shift:to - value, terrified:false, granted:true };
  }
  // FAILURE
  const drop = (skill === "deception" && input.caughtLie) ? 2 : (((dc - total) >= 5) ? 1 : 0);
  const to = clamp(value - drop);
  return { outcome: drop ? "backfire" : "no-shift", from:value, to, shift:to - value, terrified:false, granted:false };
}

/* §3 — morale / fight-or-flight. moraleDC(trigger, mods): the will-to-keep-fighting Wis-save DC by trigger
   severity, on the standard ladder. mods: {defending} +5 (lair/young/leader present) · {desperate} −5
   (already routed / cornered / Motivation now impossible). */
const MORALE_DC_BY_TRIGGER = { bloodied:10, "ally-down":10, "leader-fell":15, outnumbered:15, losing:15,
  overwhelming:20, terror:20, mythic:20, hopeless:20 };
function moraleDC(trigger, mods){
  mods = mods || {};
  let dc = MORALE_DC_BY_TRIGGER[trigger];
  if (dc == null) dc = 15;                            // unknown trigger → Medium
  if (mods.defending) dc += 5;
  if (mods.desperate) dc -= 5;
  return Math.max(SOCIAL_DC_FLOOR, Math.min(SOCIAL_DC_CEIL, dc));
}
/* resolve the morale Wis save: held → fights on; broke → the caller rolls the `Morale Outcome` table for the
   route (flee / surrender / parley / fights-on-desperate). Pure — returns the verdict, not the table roll. */
function resolveMorale(input){
  input = input || {};
  const held = (Number(input.save) || 0) >= (Number(input.dc) || 0);
  return { held, outcome: held ? "fights-on" : "broke" };
}

/* §6 — Insight DC to READ an NPC's current attitude (decided 2026-06-28): base 10, +5 if guarded/closed,
   + the NPC's best of (WIS,INT,CHA) modifier WHEN DELIBERATELY masking; clamped to the ladder (≤30). An
   open person is an easy read regardless of stats; a sharp, guarded one who chooses to mask is hard. */
function insightReadDC(input){
  input = input || {};
  let dc = 10;
  if (input.guarded) dc += 5;
  if (input.masking){
    const mods = input.mentalMods || [];
    const best = mods.length ? Math.max.apply(null, mods.map(Number)) : (Number(input.bestMentalMod) || 0);
    if (best > 0) dc += best;
  }
  return Math.max(SOCIAL_DC_FLOOR, Math.min(SOCIAL_DC_CEIL, dc));
}
