/* GENESIS MODULE — src/engine/concentration.js — CONCENTRATION enforcement (docs/SRD-MECHANIZATION.md §2).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The highest-impact CORRECTNESS gap: today there is zero enforcement — two concentration spells can run
   at once, damage never threatens concentration, nothing ends the prior spell. This silently breaks caster
   balance and the DM won't reliably catch it. The script now owns it: one field (sh.concentration), auto-
   drop on recast, the SRD damage-save (DC = max(10, ⌊damage/2⌋) CON), and the auto-break on 0-HP /
   incapacitating condition.

   PURE on the passed sheet (mirrors engine.resources' sheet mutators): startConcentration/breakConcentration
   write sh.concentration; concentrationDamageSave routes the CON save through §1 resolveSaveCheck (the
   PLAYER's open d20 rides in — dice transparency). The world layer (applyEvent) emits concentration_start /
   concentration_broken and, on a break, lifts any §3 condition tagged {concentration:<casterId>}.

   Reads SPELLS_BY_NAME (data/spells), resolveSaveCheck (engine.check), isIncapacitated (engine.conditions)
   at call-time. */

/* look a spell up in the full index by name (normalized like engine.combat itemKey). Returns the record
   or null (an unindexed/homebrew name degrades gracefully — the DM narrates, no crash). */
function spellIndexByName(name){
  if(typeof SPELLS_BY_NAME === "undefined") return null;
  const key = String(name || "").replace(/’/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
  return SPELLS_BY_NAME[key] || null;
}

/* does this spell require concentration? (reads the index; an unindexed name → false, since we can't
   assert it does — the DM can still hand-flag via the event's explicit `concentration:true`). */
function spellIsConcentration(name){ const s = spellIndexByName(name); return !!(s && s.concentration); }

/* is the sheet currently concentrating? */
function isConcentrating(sh){ return !!(sh && sh.concentration && sh.concentration.spell); }

/* START concentration on a spell. Auto-DROPS any existing concentration first (SRD: you can concentrate
   on only one thing) and returns { started, dropped } — `dropped` names the prior spell so the world layer
   emits concentration_broken{cause:"recast"} for it. `castRound` stamps when it began (for duration math /
   the ledger). No-op-safe: a non-concentration spell just clears nothing and starts nothing. */
function startConcentration(sh, spell, castRound){
  if(!sh) return { started: null, dropped: null };
  const dropped = (sh.concentration && sh.concentration.spell) ? sh.concentration.spell : null;
  sh.concentration = { spell, castRound: (castRound == null ? 0 : castRound) };
  return { started: spell, dropped };
}

/* BREAK concentration (a failed damage-save, 0 HP, an incapacitating condition, a recast, or the DM's
   explicit drop). Returns { broken, spell, cause } — `broken` false if nothing was running. */
function breakConcentration(sh, cause){
  if(!sh || !sh.concentration || !sh.concentration.spell) return { broken: false, spell: null, cause: cause || null };
  const spell = sh.concentration.spell;
  sh.concentration = null;
  return { broken: true, spell, cause: cause || "unknown" };
}

/* the SRD concentration damage-save DC: max(10, floor(damage/2)), a Constitution save. */
function concentrationSaveDC(damage){ return Math.max(10, Math.floor((damage || 0) / 2)); }

/* DAMAGE → the CON save. When a concentrating PC takes `damage`, resolve the CON save via §1 (the player's
   open d20 rides in on opts.d20). On failure → break. Returns { required, dc, save?, broken, spell }.
   `required:false` when the sheet wasn't concentrating (no save needed). The FOE side rolls in the engine
   (opts.d20 omitted → resolveSaveCheck engine-rolls). */
function concentrationDamageSave(sh, damage, opts){
  if(!isConcentrating(sh)) return { required: false, broken: false, spell: null };
  const dc = concentrationSaveDC(damage);
  const spell = sh.concentration.spell;
  if(typeof resolveSaveCheck !== "function") return { required: true, dc, broken: false, spell, note: "check-unavailable" };
  const save = resolveSaveCheck(sh, "con", dc, opts || {});
  if(!save.success){ breakConcentration(sh, "damage"); return { required: true, dc, save, broken: true, spell }; }
  return { required: true, dc, save, broken: false, spell };
}

/* AUTO-BREAK check for 0-HP / an incapacitating condition (§3). Call after HP hits 0 or a condition lands.
   Returns { broken, spell, cause } — breaks if concentrating AND (hpCur<=0 OR isIncapacitated(holder)). */
function concentrationAutoBreak(sh, holder){
  if(!isConcentrating(sh)) return { broken: false, spell: null, cause: null };
  const at0 = (sh.hpCur != null && sh.hpCur <= 0);
  const incap = (typeof isIncapacitated === "function") && isIncapacitated(holder || sh);
  if(at0) return breakConcentration(sh, "0-hp");
  if(incap) return breakConcentration(sh, "incapacitated");
  return { broken: false, spell: sh.concentration.spell, cause: null };
}

/* RITUAL casting (docs/SRD-MECHANIZATION.md §2) — is this spell ritual-tagged in the index? The ritual
   flow (a cast that adds 10 minutes and SKIPS the slot spend) is applied by the world layer; this is the
   eligibility gate it reads. An unindexed name → false. */
function ritualEligible(name){ const s = spellIndexByName(name); return !!(s && s.ritual); }
