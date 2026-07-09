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
    // ANY decisive lever auto-shifts — not just `type:"leverage"`. The §4.2 "buy-off" (handing the
    // creature its `What It Wants`) is naturally encoded `{type:"want", decisive:true}` and must also
    // bypass the roll (the lever IS the answer). Don't trap the caller on the lever's type string.
    if (l && typeof l === "object" && l.decisive) autoShift = true;
    if (SOCIAL_LEVER_MODS[t] != null) mod += SOCIAL_LEVER_MODS[t];
  }
  // A terminal attitude (Helpful/+2 → socialDC returns null: can't be talked higher) must PROPAGATE as
  // null, not silently coerce to 0 → DC 5 (which would make a maxed NPC trivially "passable"). The caller
  // checks `terminal` and skips the roll. Leverage mods are meaningless when there's no rung to climb.
  if (dc == null) return { dc: null, terminal: true, autoShift, mod };
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
      // the per-NPC floor BOUNDS terror (the clamp is sacred — a sworn-protected NPC's standing can't be
      // fear-dropped below its floor). `terrified` still flags (fear is real even when standing can't fall);
      // shift may legitimately be 0 if the NPC is already at its floor.
      const to = clamp(ATTITUDE_MIN);
      return { outcome:"terrified", from:value, to, shift:to - value, terrified:true, granted:true };
    }
    if (value >= ceiling){                            // at the cap — no further shift available
      // GRANTED only if the cap is cooperative (≥ Indifferent): a Helpful NPC (or one clamped at
      // Indifferent) complies. A clamped ENEMY (ceiling below 0 — "no charm makes him Friendly", §1.2)
      // is a telegraphed WALL the PC can't talk through: the check can't buy cooperation it'll never give.
      const cooperative = value >= 0;
      return { outcome: cooperative ? "capped" : "wall", from:value, to:value, shift:0, terrified:false, granted:cooperative };
    }
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

/* MONSTER-PARLEY §1 — which die the player rolls to move a creature's attitude (the resolver's math
   below is UNCHANGED either way; this ONLY picks the ability/skill). Beasts and other INT-null/low,
   non-sentient creatures resolve via Wisdom (Animal Handling) — the SRD-shaped "read the animal"
   path; everything else (npc records, and any creature with real speech/INT) uses the existing
   Charisma default. `rec` is a codex record (kind "npc"|"creature"); pure, reads only rec.fields.type. */
function socialCheckAbilityFor(rec){
  const type = (rec && rec.kind === "creature" && rec.fields && rec.fields.type)
    ? String(rec.fields.type).toLowerCase() : null;
  // ANIMAL-SOCIAL.md §3/§6 U3: an animal partial (rec.dm.partialKind==="animal" — minted via
  // rollPartial + prepCastEnvAnimals/prepCastAmbientScene, kind:"npc") reads the same as a Beast
  // creature — WIS (Animal Handling). Checked ALONGSIDE the creature/Beast branch, not instead of it.
  const partialKind = (rec && rec.dm && rec.dm.partialKind) || null;
  if(type === "beast" || partialKind === "animal") return { ability:"wis", skill:"Animal Handling" };
  return { ability:"cha", skill:"Persuasion" };
}

/* MONSTER-PARLEY §1 — derive the leverage array straight from a creature codex record's OWN story
   fields (habitat/activity/factionFit/treasure/displaced — MONSTER-STORY-WIRING's bestiary data,
   already riding the record). Pure derivation; the DM still narrates WHICH lever the fiction shows
   (this only tells the resolver what's THERE to use, mirroring applyLeverage's lever-type vocabulary):
     - fields.treasure !== "none"/null  -> {type:"want"}       (it guards/covets something tradable)
     - fields.displaced                 -> {type:"want"}       (it wants safe range/food)
     - fields.factionFit non-empty      -> {type:"leverage"}   (name its masters/rivals)
     - a hostile flavor roll (dm.flavor band Volatile/Mythic, or an explicit opts.hostileFlavor)
                                         -> {type:"fear", eligible:true} (Intimidation lands harder)
   `rec` is a codex record; opts:{hostileFlavor}. Never mutates rec. */
function creatureLevers(rec, opts){
  opts = opts || {};
  const f = (rec && rec.fields) || {};
  const levers = [];
  if(f.treasure != null && f.treasure !== "none") levers.push({ type:"want", note:"treasure" });
  if(f.displaced) levers.push({ type:"want", note:"displaced" });
  if(Array.isArray(f.factionFit) && f.factionFit.length) levers.push({ type:"leverage", note:"factionFit" });
  const flavorRows = (rec && rec.dm && Array.isArray(rec.dm.flavor)) ? rec.dm.flavor : [];
  const hostileBand = flavorRows.some(r => r && (r.band === "Volatile" || r.band === "Mythic"));
  if(opts.hostileFlavor || hostileBand) levers.push({ type:"fear", eligible:true });
  return levers;
}

/* ANIMAL-SOCIAL.md §3/§6 U3 — animal care levers, mirroring creatureLevers' posture: derived straight
   off the partial's OWN rolled `need` (dm.need — hungry/guarding/lost/loyal, minted by rollPartial),
   never invented at check-time. Pure; never mutates `rec`. Levers are CARE, not coin/leverage/fear —
   deliberately NOT SOCIAL_LEVER_MODS keys (an animal's want stack doesn't run the adult economy); the
   caller (dm.js's social_check) is the one that turns `advantage`/`disadvantage` flags into dice
   instructions, same division of labor as socialCheckAbilityFor only picking the skill.
     hungry   -> {type:"feeding",    advantage:true,  consumableSink:true}  (share rations = ADV, a sink)
     lost     -> {type:"guiding"}                                          (return it home/to its person)
     guarding -> {type:"threshold",  wrongApproachDisadvantage:true}       (approach wrong = DISADV)
     loyal    -> {type:"throughPerson"}                                    (win over its person instead)
   PLUS the universal lever every animal carries regardless of need: {type:"patience", revisit:true} —
   a kind revisit grants a fresh check (the codex is what persists that across prep re-entries, §3). */
const ANIMAL_NEED_LEVERS = {
  hungry:   { type:"feeding",    advantage:true, consumableSink:true },
  lost:     { type:"guiding" },
  guarding: { type:"threshold",  wrongApproachDisadvantage:true },
  loyal:    { type:"throughPerson" },
};
function animalLevers(rec){
  const need = rec && rec.dm && rec.dm.need;
  const levers = [];
  const needLever = ANIMAL_NEED_LEVERS[need];
  if(needLever) levers.push(Object.assign({}, needLever));
  levers.push({ type:"patience", revisit:true });
  return levers;
}

/* ANIMAL-SOCIAL.md §3 — class-native flat mechanical bonuses (no DM judgment, per the DM-CHARTER
   anti-drift rule — these are script-owned rules, not narrated calls).
     - animalOpeningStep(base, pcClass): Rangers/Druids read every animal's OPENING attitude one step
       friendlier (clamped to ATTITUDE_MAX) — applied ONCE, at mint/first-contact, never re-applied on
       every check (opening is rolled/stamped once, SOCIAL.md §1.1's own law).
     - animalCheckAdvantage(pcClass, swaActive): Speak with Animals ACTIVE grants advantage on the
       Animal Handling check against the target ("you can negotiate") — independent of class; a
       ranger/druid gets BOTH the opening bump (mint-time) and, only while the spell is up, advantage
       (check-time) — two separate flat rules, not stacked into one. */
const ANIMAL_OPENING_CLASSES = { ranger:true, druid:true };
function animalOpeningStep(base, pcClass){
  const b = Math.round(Number(base) || 0);
  const cls = pcClass ? String(pcClass).toLowerCase() : null;
  if(cls && ANIMAL_OPENING_CLASSES[cls]) return Math.min(ATTITUDE_MAX, b + 1);
  return b;
}
function animalCheckAdvantage(pcClass, swaActive){
  return !!swaActive;   // SwA grants advantage regardless of class — any caster/source that has it active
}

/* ANIMAL-SOCIAL.md §3 — the Helpful (+2) gate. Ordinary checks clamp at +1 (Friendly), mirroring the
   Anomaly Law's grind ceiling (dm.js's kind:"creature" block) — the SAME shape, applied to
   kind:"npc" animal partials (rec.dm.partialKind==="animal") instead of kind:"creature" records, since
   animals mint as codex `npc` records (NPC-PARTIALS.md). +2 is reachable ONLY by:
     (a) the sustained-care track — fields.care (a distinct-visit counter ticked by dm.js's
         `animal_care` event) has reached ANIMAL_HELPFUL_CARE_VISITS (3), OR
     (b) the RESOLVED ruling-2 bypass — an animal-friendship-class spell declared on the check
         (opts.animalFriendshipSpell truthy) OR a STRONG Charisma result for a class built for it
         (opts.strongCha truthy — the caller's own threshold call, e.g. total>=20 Persuasion/Animal
         Handling; this function does not invent the threshold, it only honors the caller's flag).
   Pure; takes the counter + bypass flags, returns whether an Helpful (+2) shift may stand THIS check —
   never mutates anything. */
const ANIMAL_HELPFUL_CARE_VISITS = 3;
function animalHelpfulAllowed(careCount, opts){
  opts = opts || {};
  if(opts.animalFriendshipSpell || opts.strongCha) return true;
  return (Number(careCount) || 0) >= ANIMAL_HELPFUL_CARE_VISITS;
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

/* LOOSE-ENDS §1 — tool/DC/charm digest wiring: DESIGN.md's XGtE-tool-uses + Supernatural Charms/
   Blessings references the SOCIAL build authored but never surfaced to the DM (the DM had to price
   these checks from memory). NULL-SAFE ship: the sheet carries no `toolProfs`/`charms`/`blessings`
   fields yet (no compiled tool→DC lookup table exists either — DESIGN.md §"XGtE + Tasha's anti-drift
   source map" flags it a confirmed gap, still open), so this reads whatever the sheet already has
   and degrades to an empty array rather than inventing data. The moment a `TOOL_DC_TABLE` lookup or
   `sh.charms`/`sh.blessings` lands, this starts populating with zero further digest-side changes.
   PURE — takes the sheet, returns {tools, charms}; the caller (dmDigest) attaches it to the PC block
   ONLY when at least one entry exists (§1 "attach... only when held"). */
function socialToolCharmDigest(sh){
  if (!sh) return null;
  const toolLookup = (typeof TOOL_DC_TABLE === "object" && TOOL_DC_TABLE) ? TOOL_DC_TABLE : {};
  const tools = (sh.toolProfs || []).map(name => {
    const row = toolLookup[name];
    return row ? { name, tasks:row.tasks||null, ability:row.ability||null, dc:row.dc!=null?row.dc:null }
                : { name, tasks:null, ability:null, dc:null };
  });
  const charms = (sh.charms || []).map(c => (typeof c === "string") ? { name:c, effect:null } : { name:c.name||null, effect:c.effect||null });
  const blessings = (sh.blessings || []).map(b => (typeof b === "string") ? { name:b, effect:null } : { name:b.name||null, effect:b.effect||null });
  if (!tools.length && !charms.length && !blessings.length) return null;
  const out = {};
  if (tools.length) out.tools = tools;
  if (charms.length) out.charms = charms;
  if (blessings.length) out.blessings = blessings;
  return out;
}
