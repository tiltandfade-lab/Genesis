/* GENESIS MODULE — src/engine/combat-actions.js — the COMBAT-ACTION LAYER
   (docs/SRD-MECHANIZATION.md §6) — the martial half. Classic <script>, shared global scope.
   Registered in manifest.json; validated by check-manifest.py.

   THE GAP THIS CLOSES: no turn budget (1 Action / 1 Bonus / 1 Reaction), no Extra Attack (martials get
   it at L5 — the biggest martial power spike in the game, previously unmodeled), no opportunity-attack
   trigger, no grapple/shove contest. §1-§5 lean caster/defense; this is where fighters live.

   ACTION ECONOMY on GS.combat: each combatant's turn carries a budget {action,bonus,reaction,moved}
   reset at turn start (resetTurnBudget). spendBudget refuses a second Action or a used Reaction — the
   script owns "you already acted," not the DM's memory.

   STANDARD_ACTIONS get real mechanical effect, not just narration:
     Dodge      → attacks against you have disadvantage until your next turn (a self-condition consumed
                  by engine.conditions' resolver via conditionAdvDis reading a "dodging" tag)
     Disengage  → suppresses opportunity attacks on your move this turn
     Dash       → the second band-move (moveBand's existing `dash` arg) — spends the Action
     Help       → grants an ally advantage on their next attack/check (a one-shot flag §1 consumes)
     Ready      → arms a reaction with a DM-narrated trigger
     Hide       → a Stealth check (§1) that sets `invisible`-for-attack-purposes until revealed
     Search/Study/Utilize → route to §1 checks (Perception/Investigation/tool-use) — the caller
                  (world/dm.js) supplies the check via resolveSkillCheck; standardAction just spends
                  the budget slot and returns the routing hint.

   EXTRA ATTACK — attacksPerAction(sh) is a DERIVED turn-budget read off CLASS_PROGRESSION's feature
   TEXT (there's no structured numeric field for it — the progression data is authored SRD feature
   prose, same as every other class feature). EXTRA_ATTACK_PROGRESSION is a canonical-constant-in-code
   lookup (mirrors CR_XP / XP_THRESHOLDS' pattern in engine.advancement: SRD numbers asserted directly,
   not parsed from prose at runtime) cross-checked against the SRD classes that grant it — Barbarian/
   Fighter/Monk/Paladin/Ranger all get "Extra Attack" at L5 (2 attacks); Fighter alone gets a second bump
   at L11 (3 attacks) and a third at L20 (4 attacks) — L11/L20 sit past this build's Tier-2 (L10) ceiling
   but are authored per the spec's "author the full curve" instruction (inert until the cap lifts,
   docs/TIER-SCOPE.md).

   OPPORTUNITY ATTACKS fire when a combatant LEAVES Melee band with a hostile who has a Reaction
   available (moveBand detects the leave — engine.combat's existing band model, no new position system).
   Disengage suppresses it. One reaction/round (spendBudget enforces).

   GRAPPLE/SHOVE — CONTESTED checks via §1: attacker's Athletics vs the target's Athletics-OR-Acrobatics
   (target's choice of the higher; a tie favors the DEFENDER — SRD 2024 contest rule). Success →
   condition_add{grappled} or a prone/pushed-a-band outcome (§3 supplies the condition machinery; this
   module only resolves the CONTEST and reports the verdict — the caller commits the condition_add).

   PURE on the passed combatants/sheet (mirrors engine.combat/engine.checks). Reads CLASS_PROGRESSION,
   resolveAttack (engine.combat), resolveSkillCheck (engine.checks), moveBand (engine.combat) at call-time. */

/* the standard actions this layer gives mechanical effect to (docs/SRD-MECHANIZATION.md §6's list). */
const STANDARD_ACTIONS = ["dodge", "disengage", "dash", "help", "ready", "hide", "search", "study", "utilize"];

/* THE SRD Extra-Attack progression, keyed by class → level → attacks-per-Action. A canonical-constant-
   in-code lookup (same pattern as engine.advancement's CR_XP/XP_THRESHOLDS) since CLASS_PROGRESSION
   carries the feature as prose, not a structured number. Only these 5 base classes grant it in the SRD;
   every other class implicitly stays at 1. L11/L20 entries are authored per the spec but sit past this
   build's Tier-2 (L10) ceiling — inert until docs/TIER-SCOPE.md's LEVEL_CEILING lifts. */
const EXTRA_ATTACK_PROGRESSION = {
  Barbarian: { 5: 2 },
  Fighter:   { 5: 2, 11: 3, 20: 4 },
  Monk:      { 5: 2 },
  Paladin:   { 5: 2 },
  Ranger:    { 5: 2 }
};

/* attacksPerAction(sh) — how many `attack`/`pcAttack` events the Attack action permits THIS turn.
   Reads the sheet's class+level against EXTRA_ATTACK_PROGRESSION, taking the highest threshold met.
   Defaults to 1 (no Extra Attack) for classes/levels not in the table. */
function attacksPerAction(sh){
  if(!sh) return 1;
  const table = EXTRA_ATTACK_PROGRESSION[sh.class];
  if(!table) return 1;
  const level = sh.level || 1;
  let n = 1;
  for(const lv in table){ if(level >= Number(lv)) n = Math.max(n, table[lv]); }
  return n;
}

/* ---- ACTION ECONOMY — a combatant's per-turn budget on GS.combat ---- */

/* RESET a combatant's turn budget — call at the start of their turn. `moved` tracks whether they've
   used their movement (relevant for the Dash-doubles-it interaction, tracked by the caller/moveBand).
   Mutates + returns the fresh budget object. */
function resetTurnBudget(c){
  if(!c) return null;
  c.budget = { action: true, bonus: true, reaction: true, moved: false };
  c.flags = {};   // per-turn flags (disengaged/readied) clear at the top of the combatant's turn — they only ever apply to THIS turn's move/reaction
  return c.budget;
}

/* SPEND one slot of the budget. `kind` ∈ action|bonus|reaction. Refuses (returns {ok:false}) when
   already spent — the script owns "you already acted," the DM can't re-grant a used Action/Reaction
   by forgetting. Auto-initializes a missing budget (defensive — a combatant who never got
   resetTurnBudget still can't double-spend an undefined budget silently). */
function spendBudget(c, kind){
  if(!c) return { ok: false, reason: "no-combatant" };
  if(!c.budget) resetTurnBudget(c);
  if(!c.budget[kind]) return { ok: false, reason: "already-spent", kind };
  c.budget[kind] = false;
  return { ok: true, kind };
}

/* STANDARD ACTIONS. `kind` ∈ STANDARD_ACTIONS. Spends the Action budget slot (all of these are Actions
   in the 2024 SRD) and applies the real mechanical effect where one exists, tagging the combatant's
   `conditions`-like flags. Returns {ok, kind, effect} — `effect` describes what mechanically happened,
   for the caller to fold into the ledger line. Unknown kinds are refused (the engine never invents a
   new standard action). */
function standardAction(c, kind, opts){
  opts = opts || {};
  if(STANDARD_ACTIONS.indexOf(kind) < 0) return { ok: false, reason: "unknown-action", kind };
  const spend = spendBudget(c, "action");
  if(!spend.ok) return spend;
  c.flags = c.flags || {};
  let effect = null;
  switch(kind){
    case "dodge":
      // Dodge is applied as a real `dodging` CONDITION (by the caller — world/dm.js — onto the PC's
      // condition holder, so resolveAttack's conditionAdvDis consult gives attackers disadvantage and
      // round_tick's ttl auto-expires it). standardAction just spends the Action + reports the intent.
      effect = { kind: "dodge", note: "attacks against them have disadvantage until their next turn; Dex saves at advantage" };
      break;
    case "disengage":
      c.flags.disengaged = true;                               // suppresses opportunityAttack on this turn's move
      effect = { kind: "disengage", note: "no opportunity attacks on this turn's move" };
      break;
    case "dash":
      if(typeof moveBand === "function" && opts.dir) moveBand(c, opts.dir, true);
      c.budget.moved = true;
      effect = { kind: "dash", band: c.band };
      break;
    case "help":
      effect = { kind: "help", note: "the named ally gains advantage on their next attack/check", ally: opts.ally || null };
      break;
    case "ready":
      c.flags.readied = { trigger: opts.trigger || null };      // the DM narrates the trigger + when it fires
      effect = { kind: "ready", trigger: opts.trigger || null };
      break;
    case "hide":
      effect = { kind: "hide", note: "resolve via resolveSkillCheck(sh,'Stealth',dc) — success sets invisible-for-attack" };
      break;
    case "search":
      effect = { kind: "search", note: "route to resolveSkillCheck(sh,'Perception'|'Investigation',dc)" };
      break;
    case "study":
      effect = { kind: "study", note: "route to resolveSkillCheck(sh,'Investigation',dc)" };
      break;
    case "utilize":
      effect = { kind: "utilize", note: "route to a tool-use resolveSkillCheck or an item_use event" };
      break;
  }
  return { ok: true, kind, effect };
}

/* ---- OPPORTUNITY ATTACKS ---- */

/* Does a Melee→farther move by `mover` (against `threats`, an array of combatants who were in Melee
   band with them) provoke an opportunity attack? Fires when: mover WAS in melee band, is moving to a
   farther band, hasn't Disengaged this turn, and at least one threatening foe has a Reaction available.
   Returns the list of foes that get to swing (each spends their Reaction budget here) — the caller
   (world/dm.js) resolves each via resolveAttack and applies damage. Does NOT itself move the combatant
   (the caller still calls moveBand) — this only detects the trigger + reserves the reactions. */
function opportunityAttack(mover, threats){
  threats = threats || [];
  if(!mover || mover.band !== "melee") return [];               // only leaving MELEE provokes
  if(mover.flags && mover.flags.disengaged) return [];           // Disengage suppresses it entirely
  const attackers = [];
  threats.forEach(foe => {
    if(!foe || foe.down) return;
    const spend = spendBudget(foe, "reaction");
    if(spend.ok) attackers.push(foe);                            // one reaction/round — spendBudget enforces
  });
  return attackers;
}

/* ---- GRAPPLE / SHOVE — contested checks (docs/SRD-MECHANIZATION.md §6 Decision: CONTESTED) ---- */

/* Generic CONTESTED check: attacker's check vs the defender's (the higher of two possible skills, when
   `defenderSkills` names more than one — the target's CHOICE per SRD 2024). A TIE favors the DEFENDER.
   `resolveSkillCheck`-shaped opts (attackerOpts/defenderOpts: {d20, bonus, advantage}) let both sides'
   OPEN rolls ride in (dice transparency — the engine never rolls for either side when a d20 is supplied;
   a foe's contest omits d20 and the engine rolls it). Returns {attackerTotal, defenderTotal, attackerWins,
   defenderSkillUsed}. */
function resolveContest(attackerSh, attackerSkill, attackerOpts, defenderSh, defenderSkills, defenderOpts){
  if(typeof resolveSkillCheck !== "function") return { ok: false, reason: "checks-unavailable" };
  const atk = resolveSkillCheck(attackerSh, attackerSkill, 0, attackerOpts || {});   // dc=0: only the TOTAL matters in a contest
  const skills = Array.isArray(defenderSkills) ? defenderSkills : [defenderSkills];
  let best = null, bestSkill = null;
  skills.forEach(sk => {
    const r = resolveSkillCheck(defenderSh, sk, 0, defenderOpts || {});
    if(!best || r.total > best.total){ best = r; bestSkill = sk; }
  });
  const attackerWins = atk.total > (best ? best.total : 0);      // strictly greater — a TIE favors the defender
  return { ok: true, attackerTotal: atk.total, defenderTotal: best ? best.total : 0,
    attackerWins, defenderSkillUsed: bestSkill, attackerCheck: atk, defenderCheck: best };
}

/* GRAPPLE: attacker's Athletics vs the target's Athletics-or-Acrobatics (target's choice of the higher).
   Success → the caller applies condition_add{grappled} (engine.conditions' CONDITIONS.grappled = speed0).
   Returns the resolveContest shape plus {success}. */
function resolveGrapple(attackerSh, attackerOpts, defenderSh, defenderOpts){
  const r = resolveContest(attackerSh, "Athletics", attackerOpts, defenderSh, ["Athletics", "Acrobatics"], defenderOpts);
  if(!r.ok) return r;
  return Object.assign({ success: r.attackerWins }, r);
}

/* SHOVE: same contest shape; success is the caller's cue to apply EITHER prone OR push the target one
   band farther (the attacker's declared intent — `opts.intent` ∈ "prone"|"push", surfaced back so the
   caller knows which the DM/player chose without this module deciding the fiction). */
function resolveShove(attackerSh, attackerOpts, defenderSh, defenderOpts, intent){
  const r = resolveContest(attackerSh, "Athletics", attackerOpts, defenderSh, ["Athletics", "Acrobatics"], defenderOpts);
  if(!r.ok) return r;
  return Object.assign({ success: r.attackerWins, intent: intent || "prone" }, r);
}
