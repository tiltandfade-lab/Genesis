/* GENESIS MODULE — src/engine/death.js — DEATH SAVES + TEMP HP + MASSIVE DAMAGE
   (docs/SRD-MECHANIZATION.md §4). Classic <script>, shared global scope. Registered in manifest.json;
   validated by check-manifest.py.

   THE GAP THIS CLOSES: at 0 HP the PC was `down` and the DM narrated the 3-success/3-fail sequence by
   hand — death was a DM call, not a computed state. Temp HP had nowhere to land (Aid/False Life/a Fiend
   warlock's kill-heal all had no pool). Massive-damage instant death (T1/T2 SRD) was unmodeled.

   sh.deathSaves = {succ,fail} | null — set when hpCur hits 0 (a LIVING PC only — see startDeathSaves),
   cleared on any heal>0 or a long rest (the caller wires the clear; restRecover/applyHpDelta call sites
   in world/dm.js do this). resolveDeathSave grades the OPEN d20 the player rolls (dice transparency):
     10+           → success
     <10           → fail
     nat 20        → regain 1 HP, clear the tracker (up and conscious)
     nat 1         → counts as TWO fails
     3 successes   → stable (tracker clears, PC stays unconscious at 0 HP)
     3 failures    → dead (caller routes into the Death & Rebirth flow)

   MASSIVE DAMAGE (SRD, currently unmodeled): if a single hit's REMAINING damage after dropping to 0 HP
   is ≥ the PC's max HP, the PC dies outright — isMassiveDamage computes the threshold check; the caller
   (world/dm.js's hp_changed handler) skips death saves and routes straight to rebirth when true.

   TEMP HP (sh.tempHp): a separate pool that absorbs damage FIRST, does NOT stack (a new grant takes the
   HIGHER of current-vs-new, never adds), doesn't heal HP, and is lost on a long rest. applyDamageWithTemp
   deducts tempHp before hpCur, calling through to applyHpDelta (engine.resources) for the HP portion so
   the existing hpCur clamp/dropped semantics are reused rather than duplicated.

   PURE where the math is: operates on the passed sheet, mirroring engine.resources' mutator convention
   (the only writers of the current layer). Reads applyHpDelta (engine.resources) at call-time. */

/* START the death-save tracker — call when a LIVING PC's hpCur hits 0 (world/dm.js's hp_changed handler,
   after applyHpDelta/applyDamageWithTemp report hpCur===0 && the PC wasn't already at 0). No-ops if
   already tracking (repeated 0-HP hits don't reset an in-progress sequence — only damage-at-0 auto-fails
   do, via resolveDeathSave's caller feeding synthetic fails). Returns the tracker. */
function startDeathSaves(sh){
  if(!sh) return null;
  if(!sh.deathSaves) sh.deathSaves = { succ: 0, fail: 0 };
  return sh.deathSaves;
}

/* CLEAR the tracker — any heal>0 while down, or a long rest (SRD: stabilizing/waking clears it). */
function clearDeathSaves(sh){
  if(!sh) return;
  sh.deathSaves = null;
}

/* Resolve ONE death save off the player's OPEN d20 (dice transparency — never rolled by the engine).
   Returns {ok, natural, succ, fail, outcome, hpCur?} where outcome ∈ "success"|"fail"|"revived"|"stable"|"dead"|"continue".
   `continue` = the sequence isn't resolved yet (still under 3/3 either way). Mutates sh.deathSaves (and
   sh.hpCur on a nat-20 revive) — the caller (world/dm.js) commits the ledger line + routes "dead" into
   the existing Death & Rebirth flow. */
function resolveDeathSave(sh, d20){
  if(!sh) return { ok: false, reason: "no-sheet" };
  const tracker = startDeathSaves(sh);          // idempotent — ensures the tracker exists
  const nat = d20;
  if(nat === 20){
    clearDeathSaves(sh);
    sh.hpCur = Math.min(sh.hp || 1, (sh.hpCur || 0) + 1);
    return { ok: true, natural: nat, succ: tracker.succ, fail: tracker.fail, outcome: "revived", hpCur: sh.hpCur };
  }
  if(nat === 1){
    tracker.fail = Math.min(3, tracker.fail + 2);         // nat 1 = TWO fails
  } else if(nat >= 10){
    tracker.succ = Math.min(3, tracker.succ + 1);
  } else {
    tracker.fail = Math.min(3, tracker.fail + 1);
  }
  if(tracker.fail >= 3) return { ok: true, natural: nat, succ: tracker.succ, fail: tracker.fail, outcome: "dead" };
  if(tracker.succ >= 3){ clearDeathSaves(sh); return { ok: true, natural: nat, succ: 3, fail: tracker.fail, outcome: "stable" }; }
  return { ok: true, natural: nat, succ: tracker.succ, fail: tracker.fail, outcome: (nat === 1 || nat < 10) ? "fail" : "success" };
}

/* Damage taken WHILE at 0 HP is an auto-fail (two if a crit or a melee hit within 5 ft — SRD). Caller
   determines `crit`/`meleeAdjacent`; this just applies the auto-fail(s) to the tracker and reports the
   same outcome shape as resolveDeathSave (minus `natural`, since no d20 was rolled). */
function autoFailDeathSave(sh, opts){
  if(!sh) return { ok: false, reason: "no-sheet" };
  opts = opts || {};
  const tracker = startDeathSaves(sh);
  const n = (opts.crit || opts.meleeAdjacent) ? 2 : 1;
  tracker.fail = Math.min(3, tracker.fail + n);
  if(tracker.fail >= 3) return { ok: true, succ: tracker.succ, fail: tracker.fail, outcome: "dead", auto: true };
  return { ok: true, succ: tracker.succ, fail: tracker.fail, outcome: "fail", auto: true };
}

/* MASSIVE DAMAGE instant death (SRD, T1/T2 currently unmodeled): true when a single hit's damage
   REMAINING after the PC would be dropped to 0 is ≥ their max HP. `overkill` = the damage amount minus
   whatever HP was left before the hit (i.e. how far below 0 the raw damage would have taken them) —
   the caller computes this from the pre-hit hpCur and the incoming damage total. `maxHp` = sh.hp. */
function isMassiveDamage(overkill, maxHp){
  return (overkill || 0) >= (maxHp || 0) && (maxHp || 0) > 0;
}

/* GRANT temp HP (sh.tempHp). SRD: doesn't stack — a new grant takes the HIGHER of current-vs-new, never
   adds two pools together. Returns {from,to}. */
function grantTempHp(sh, n){
  if(!sh) return { from: 0, to: 0 };
  const from = sh.tempHp || 0;
  const to = Math.max(from, Math.max(0, n || 0));
  sh.tempHp = to;
  return { from, to };
}

/* CLEAR temp HP (a long rest — SRD: temp HP doesn't persist a long rest). */
function clearTempHp(sh){ if(sh) sh.tempHp = 0; }

/* APPLY damage, spending TEMP HP FIRST, then hpCur via applyHpDelta (engine.resources) — the ONE call
   site death saves' 0-HP detection should route through instead of a bare applyHpDelta(sh,-n), so temp
   HP actually shields the sheet's real HP. Returns {tempSpent, hpResult, droppedTo0, overkill} where
   hpResult mirrors applyHpDelta's {from,to,max,delta,dropped} and overkill is the damage that would have
   carried the PC BELOW 0 (the isMassiveDamage input) — 0 when the hit didn't overshoot 0. */
function applyDamageWithTemp(sh, amount){
  if(!sh) return { tempSpent: 0, hpResult: null, droppedTo0: false, overkill: 0 };
  let remaining = Math.max(0, amount || 0);
  const tempBefore = sh.tempHp || 0;
  const tempSpent = Math.min(tempBefore, remaining);
  sh.tempHp = tempBefore - tempSpent;
  remaining -= tempSpent;
  const hpBefore = (sh.hpCur == null ? (sh.hp || 0) : sh.hpCur);
  const overkill = Math.max(0, remaining - hpBefore);          // how far below 0 the raw hit would have gone
  const hpResult = (typeof applyHpDelta === "function") ? applyHpDelta(sh, -remaining) : null;
  const droppedTo0 = !!(hpResult && hpResult.dropped);
  return { tempSpent, hpResult, droppedTo0, overkill };
}
