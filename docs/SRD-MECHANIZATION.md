---
type: system-spec
branch: Genesis
status: built
created: 2026-07-01
updated: 2026-07-01
related:
  - "[[EVENT-CONTRACT]]"
  - "[[COMBAT]]"
  - "[[ADVANCEMENT]]"
  - "[[ITEMS]]"
  - "[[DIFFICULTY]]"
---

# SRD Mechanization — closing the last d20 gaps

**Status: spec (2026-07-01).** The engine's combat/items/progression spine is ~65% of the SRD
wired and clean. This spec covers the remaining mechanical surface — the *connective d20 tissue*
that today still forces the DM to freehand rules turn-to-turn. It is the direct continuation of the
anti-drift thesis (`EVENT-CONTRACT.md`): **every mechanic the DM currently adjudicates by hand is a
place the game can drift, and every one we mechanize tightens the container.** The audit that seeded
this spec ranked the gaps; this doc turns that ranking into a buildable, phased contract.

## The through-line — detected > declared, applied to the rules themselves

`EVENT-CONTRACT.md` §"detected > declared" is the whole design pressure: move consequence from *the
DM improvises it* to *the script computes it*. Combat/items already live there. What doesn't yet:
a Constitution save vs. a spell DC, whether two concentration spells can run at once, what "blinded"
actually *does* to the next roll, whether a PC at 0 HP lives or dies. Each is a number the DM
supplies by hand today — so each is a candidate to promote to script-owned. **This spec is that
promotion pass for the core rules.**

**The boundary holds** (`COMBAT.md` automation split): the script owns the *number and the state
transition*; the DM still owns *when a check is called for, the DC's fiction, and the narration*.
Mechanizing "blinded → attacks have disadvantage" does not mean the script decides *who* gets
blinded — the DM rules that (or a spell's save-failure triggers it), and the script enforces the
consequence. We are not building an auto-battler; we are removing the DM's ability to *forget or
fudge* a rule it already meant to apply.

---

## Current state (grounded — read before building)

What exists today, cited, so the wiring plan is precise and no gap is double-built:

- **The d20 primitive exists.** `cmRollD20(o)` (`src/engine/combat.js:20`) rolls with adv/dis
  (`"adv"`→kh, `"dis"`→kl). Shared by `resolveAttack` and `resolveSave`.
- **Saves resolve — but only inside combat.** `resolveSave({d20?, saveMod, dc, advantage})`
  (`src/engine/combat.js:321`) → `{success, total}`. Correct math; only ever called from the combat
  resolver. There is **no general "roll a save vs a DC" path** outside a fight, and no `attack`/`save`
  event wraps it for the DM.
- **Skill checks half-exist.** `dmRollFor(skill, ability, adv)` (`src/world/dm.js:223`) computes the
  player's skill-check modifier — pulls `sh.profBonus` when `sh.skillProfs` includes the skill. This is
  the **player-side d20 flow** the Bridge uses. What's missing: (a) it's skill-only — a raw ability
  check or a **saving throw vs a DC** has no equivalent; (b) it returns a modifier for the *player's
  open roll* but there's no unified `resolveCheck` the engine owns; (c) no success/margin grading is
  returned (the margin-ladder in `DIFFICULTY.md` is applied by DM judgment, not computed).
- **The sheet already carries every input a check needs:** `scores`, `mods`, `profBonus`, `saveProfs`
  (array of ability keys), `skillProfs` (array of skill names), `passivePerception`, `spellAbility`,
  `hitDie` (`src/creator/sheet.js:51`). **No new sheet authoring is required to resolve any check.**
- **Spell save DC is displayed, never used.** `render.js:402` computes `spellAbility` mod + `profBonus`
  for display; nothing *resolves a save against it*.
- **Concentration/ritual DATA exists at source, stripped in the generated file.**
  `Reference/SRD-Data/spells.json` (339 spells) carries `ritual`, `concentration`, `duration`,
  `castingTime`, `range`, `components`, `atHigherLevels`. The generated `data/spells-slim.js` keeps only
  `name/level/school/classes/flavor/text` — so the app has **no concentration flag today**. This is a
  **generator + regen** problem, not authoring.
- **Resources are owned and clean.** `src/engine/resources.js`: `sh.slots`/`slotsMax`, `sh.pact`,
  `sh.pools`, `applyHpDelta`, `spendSlot`, `spendResource`, `restRecover`. No `concentration` slot, no
  `exhaustion`, no death-save state. `restRecover(sh,"long"|"short")` is the recovery hook.
- **Damage/HP/down exist; death saves don't.** `applyDamage(c, amount, type)`
  (`src/engine/combat.js:331`) clamps `0..maxHp`, applies resist/immune/vuln, sets `down` at 0. On the
  PC it routes through `hp_changed`. **No death-save loop** — `COMBAT.md` explicitly defers it.
- **Conditions are strings.** Combatants carry `conditions:[]`; only prone→advantage and
  restrained→disadvantage have mechanical effect (`combat.js:176` comment). The rest are surfaced for DM
  adjudication. `data/items.js:ITEM_CONDITIONS` is a *separate* item-durability vocab — not creature
  conditions.
- **Extra Attack is text, not behavior.** `CLASS_PROGRESSION` carries feature *text*; nothing executes
  "attack twice."

---

## The build, in six subsystems (ranked by felt impact in L1–10 play)

Each subsystem is independently shippable, verifier-gated, and adds only to the `EVENT-CONTRACT.md`
surface — no existing event changes shape.

### 1. The check/save spine — one primitive, three callers  ⭐ highest value-per-effort

**The gap:** saves resolve only in combat; a raw ability check or an out-of-combat save has no engine
path; spell-save DC is never used; margin isn't computed.

**The design — a single pure primitive the whole game routes through:**

```
resolveCheck({
  d20?,                 // the player's open roll (supplied) or engine-rolled (NPC/foe)
  abilityMod,           // from sh.mods[ability]
  proficient?,          // adds sh.profBonus
  bonus?,               // situational (Guidance +1d4 pre-rolled, cover, etc.)
  dc,                   // the target number the DM sets (fiction) or a spell save DC (computed)
  advantage?            // "adv" | "dis"
}) → { total, natural, success, margin, degree }
```

- `degree` grades by the `DIFFICULTY.md` **margin ladder** (script-owned, not DM-eyeballed):
  `crit-success` (nat 20 / margin ≥ 10), `success`, `near-miss` (margin −1..−2 — the *tight* grace
  band, per `feedback-genesis-degrees-of-failure`), `failure`, `crit-failure` (nat 1 / margin ≤ −10).
  This makes the graded-outcome memory a **computed** value the DM honors, not a judgment it can drift.
- **Three thin callers** compose it, so nothing is special-cased:
  - `resolveSkillCheck(sh, skill, dc, opts)` — resolves `ability` from a `SKILL_ABILITY` map, `proficient`
    from `sh.skillProfs`. **Absorbs `dmRollFor`'s logic** (reconcile, don't duplicate).
  - `resolveSaveCheck(sh, ability, dc, opts)` — `proficient` from `sh.saveProfs`. The missing half.
  - `resolveAbilityCheck(sh, ability, dc, opts)` — raw, no proficiency.
- **Spell save DC becomes real:** `spellSaveDC(sh) = 8 + profBonus + mods[spellAbility]` (a named
  helper, single source). When the PC casts a save-spell, the *foe's* save routes through
  `resolveSave` against `spellSaveDC(sh)` (engine rolls the foe's d20) — closing gap #6. When a foe's
  spell targets the PC, the PC rolls open and `resolveSaveCheck` grades it.
- **Heroic Inspiration — mechanized reroll (DECIDED: IN).** SRD 2024 Heroic Inspiration is a spendable
  token that lets you **reroll any d20 and take the new result**. State: `sh.inspiration` (bool — you
  hold it or you don't; it doesn't stack). The existing `inspiration_granted{reason}` event (today a
  play-quality no-op, `EVENT-CONTRACT.md`) now **sets the flag**; a new `inspiration_spend{on}` event
  triggers a reroll on the just-resolved check/attack/save — `resolveCheck`/`resolveAttack` accept a
  `reroll:d20b` second roll and take the higher-*intent* result (new result stands, per RAW — the player
  chooses to spend *before* seeing the reroll). Clears the flag. This is the one place the check spine
  reaches back into an already-rolled result, so it lives here with §1 rather than §6.
```
check { kind: skill|save|ability, key, dc, d20, advantage?, bonus? }
  → resolves via resolveCheck; returns { success, margin, degree } as the honored delta
```
Declared by the DM (the player's open roll), detected-graded by the script. The DM sets `dc` and the
fiction; the script owns the verdict + degree.

**Verifier:** `dev/verify-check.mjs` — margin-ladder boundaries (nat1/nat20, −1/−2 near-miss, ≥10),
prof application from `skillProfs`/`saveProfs`, spell-save-DC math, `dmRollFor` parity (same inputs →
same modifier, so nothing regresses on the Bridge), Heroic Inspiration reroll (grant sets flag, spend
rerolls + clears, no-stack).

### 2. Concentration — the highest-impact *correctness* gap

**The gap:** zero enforcement. Two concentration spells can run at once; damage never threatens
concentration; nothing ends the prior spell. This silently breaks caster balance and the DM won't
reliably catch it.

**The design:**
- **Data first (regen, not authoring) — DECIDED: promote to the full index.** Extend
  `build/gen-spells-slim.py` (or a new `build/gen-spells.py`) to emit a **full 339-spell
  `data/spells.js`** carrying `concentration` (bool), `ritual` (bool), `duration`, `castingTime`,
  `range`, `components`, `atHigherLevels`, and the save/attack shape — for **every spell at every
  level, including spells beyond the T1/T2 cast ceiling** (Adam's call: high-level spells the PC can't
  yet cast are still valuable *narrative* content — scrolls, NPC casters, foreshadowed magic, the DM's
  fiction). The L1+cantrip picker surface (`spells-slim.js`) stays as the creator's filtered view *onto*
  the full index. Concentration enforcement needs the flag on every castable spell, so the full index is
  a hard prerequisite here — and a standalone win (the DM finally has complete spell data in-app).
- **Ritual casting ships with the data.** The `ritual` flag lands in the index for free; the flow —
  a `cast{ritual:true}` that adds 10 minutes (a `passTime` tick) and **skips `slot_spent`** for a
  ritual-tagged prepared spell — is a thin handler, IN scope (T1/T2 clerics/wizards ritual-cast
  routinely). Non-ritual casts are unaffected.
- **State:** one field on the sheet — `sh.concentration = { spell, castRound } | null`. Lives with the
  resource layer (`ensureResources` backfills `null`).
- **Flow, script-owned:**
  - Casting a concentration spell (`slot_spent` or a new `cast` marker carrying `concentration:true`)
    **auto-drops** any existing `sh.concentration` (emits a `concentration_broken{spell, cause:"recast"}`
    the DM narrates) and sets the new one.
  - **Damage → save:** when the concentrating PC takes damage, the script computes the SRD save
    (`DC = max(10, ⌊damage/2⌋)`, Constitution) and surfaces a **required `check{kind:save, key:con,
    dc}`**; on failure → `concentration_broken`. On the foe side, the engine rolls it.
  - Ends on: 0 HP / unconscious (auto), incapacitating conditions (§3), a new concentration cast, or the
    DM's explicit drop.

**Event surface:** `concentration_start{spell}` (usually detected off the cast), `concentration_broken
{spell, cause}` (detected off damage-save / condition / recast). Both anti-drift: the DM *cannot* keep a
concentration spell running through a failed save.

**Verifier:** `dev/verify-concentration.mjs` — recast drops prior; damage-save DC math (the `max(10,…)`
boundary); 0-HP auto-break; long-rest/condition interactions.

### 3. Conditions engine — the DM stops re-ruling "blinded" every time

**The gap:** conditions are inert strings except prone/restrained. Every other condition
(blinded, charmed, frightened, grappled, incapacitated, paralyzed, poisoned, restrained, stunned,
unconscious, invisible) is DM-adjudicated *each occurrence* — the single largest per-turn drift
surface in combat.

**The design — a script-owned condition→effect table the resolver consults:**
```
CONDITIONS = {
  blinded:      { attacksDisadvantage:true, attackedAdvantage:true, autofailSight:true },
  poisoned:     { attacksDisadvantage:true, checksDisadvantage:true },
  frightened:   { attacksDisadvantage:true, checksDisadvantage:true, cantApproachSource:true },
  restrained:   { attacksDisadvantage:true, attackedAdvantage:true, dexSaveDisadvantage:true, speed0:true },
  prone:        { attacksDisadvantage:true, meleeAttackedAdvantage:true, rangedAttackedDisadvantage:true },
  paralyzed:    { incapacitated:true, speed0:true, autofailStrDex:true, attackedAdvantage:true, critIn5ft:true },
  stunned:      { incapacitated:true, autofailStrDex:true, attackedAdvantage:true },
  unconscious:  { incapacitated:true, prone:true, speed0:true, autofailStrDex:true, attackedAdvantage:true, critIn5ft:true },
  grappled:     { speed0:true },
  incapacitated:{ noActions:true, noReactions:true },
  invisible:    { attacksAdvantage:true, attackedDisadvantage:true },
  charmed:      { cantAttackCharmer:true, socialAdvantageForCharmer:true }
}
```
- `resolveAttack`/`resolveCheck` consult the attacker's and target's `conditions` and **auto-derive
  advantage/disadvantage/auto-fail** from this table — the DM no longer states "you have disadvantage,"
  the engine returns it in the `breakdown`. (Prone/restrained move from hardcoded special-cases into the
  table; no behavior change, less code.)
- **Durations are mechanized (Adam's call — DECIDED).** `condition_add{target, condition, ttl}` carries
  a **structured duration**, and the script owns expiry. `ttl` is one of the SRD duration shapes:
  `{rounds:n}` (counted down at the end of the holder's turn), `{untilSave:{ability,dc,when:"end"|"start"}}`
  (the script surfaces the repeat save each turn and lifts the condition on success), `{endOfNextTurn}`,
  `{concentration:casterId}` (auto-lifts when that caster's `sh.concentration` drops — wires §2↔§3), or
  `{indefinite}` (a curse/disease until cured). A `roundTick` advances all counters at turn boundaries and
  emits `condition_expired{target, condition}` (detected) so the DM narrates the lift without deciding
  *when* — the container the DM can't forget to close. **What stays DM-owned:** *applying* a condition (a
  spell's failed save, a net, a fear effect) is still DM/spell-triggered — the engine owns the consequence
  *and now the clock*, not the ontology of when it first lands.
- **`incapacitated` composition** (stunned/paralyzed/unconscious set it) is what lets §2 auto-break
  concentration and §1 auto-fail actions — the conditions engine is load-bearing for the others.

**Event surface:** extend the existing item-oriented `condition_add`/`condition_remove` to accept
**creature/PC targets** (today they tag inventory instances only) — `condition_add{target:"pc"|fid,
condition, ttl}` with the structured duration above; new `condition_expired{target, condition}`
(detected, off `roundTick`). Reuse the event name; widen the handler.

**Verifier:** `dev/verify-conditions.mjs` — each condition's derived adv/dis on attack + check; the
incapacitated composition; prone melee-vs-ranged asymmetry; auto-fail Str/Dex saves under paralysis;
`ttl` expiry for each duration shape (rounds countdown, repeat-save lift, concentration-linked lift,
end-of-next-turn).

### 4. Death saves — 0 HP stops being ambiguous

**The gap:** at 0 HP the PC is `down`; the DM narrates the 3-success/3-fail sequence by hand — so death
is a DM call, not a computed state.

**The design:** a tracker on the sheet — `sh.deathSaves = { succ, fail } | null`, set when `hpCur`
hits 0 (living PC), cleared on any healing > 0 or a long rest.
- A `death_save{d20}` event (player's open roll): 10+ → success; <10 → fail; **nat 20 → regain 1 HP +
  clear** (up and conscious); **nat 1 → two fails**. 3 succ → stable (clear, unconscious); 3 fail →
  dead → routes into the existing **Death & Rebirth** flow (`project-genesis-death-rebirth`).
- **Damage at 0 HP** = one auto-fail (two if a crit / melee within 5 ft) — the script applies it off the
  `hp_changed`/`attack` path, no DM arithmetic.
- **Massive-damage instant death (T1/T2 SRD, currently unmodeled):** if a single hit's *remaining*
  damage after dropping to 0 ≥ the PC's HP maximum, the PC dies outright — `applyDamage` computes it and
  routes straight to the rebirth flow, skipping death saves. The script owns this threshold check.
- Stabilizing (a heal, *Spare the Dying*, a Medicine check via §1) clears the tracker.

**Temp HP (folded in — a real T1/T2 gap the audit flagged):** `applyDamage` clamps `0..maxHp` today
with **no temp-HP pool**, so *Aid*, *False Life*, a Fiend warlock's kill-heal, and a dozen features have
nowhere to land. Add `sh.tempHp` (a separate pool that absorbs damage first, doesn't stack — takes the
higher, per SRD, doesn't heal, lost on a long rest). `applyHpDelta`/`applyDamage` deplete `tempHp`
before `hpCur`. Small change, high reach — it's an input to death saves (damage that only eats temp HP
never triggers 0 HP).

**Event surface:** `death_save{d20, result}` (declared roll → detected result); `temp_hp{n}` (grant,
declared). Both compose with existing `hp_changed` + the rebirth flow; no new subsystem.

**Verifier:** `dev/verify-death-saves.mjs` — 3/3 boundaries, nat1=2fails, nat20=revive, damage-at-0
auto-fail + crit-double, heal clears, 3-fail → rebirth hand-off fires, massive-damage instant death,
temp-HP absorb-before-HP + no-stack + long-rest-clear.

### 5. Exhaustion + environmental hazards — the orphaned resources

**The gap:** exhaustion is named in bestiary `condImmune` but never tracked; falling/suffocation/
on-fire have no formulas (the ITEMS elemental map already did on-fire = Burning 1d4/turn — reuse it).

**The design (smallest subsystem — mostly formulas):**
- **Exhaustion** as a 6-level counter `sh.exhaustion` (0–6). SRD 2024 model: **−2 to d20 rolls per
  level** (folds cleanly into `resolveCheck.bonus` as `−2×level`) and **−5 ft speed per level**; level 6
  = death. Sources: a `condition_add{condition:"exhaustion"}` increments; a long rest decrements 1 (wire
  into `restRecover`). Anti-drift win: the penalty is *computed into every check*, not remembered.
- **Falling:** `resolveFall(feet) → ⌊feet/10⌋d6 bludgeoning` (cap 20d6), emitted as `hp_changed`.
- **Suffocation / on-fire / drowning:** thin `hazardTick` helpers emitting `hp_changed` on the schedule
  (on-fire = the existing Burning 1d4; drowning/suffocation = the SRD hold-breath-then-drop timer). These
  pair with the ITEMS §D elemental-effects map — one hazard vocabulary, script-owned.

**Event surface:** none new — all route through `hp_changed` and `condition_add`. Exhaustion is just a
condition with a computed penalty.

**Verifier:** `dev/verify-hazards.mjs` — exhaustion penalty into `resolveCheck`, speed cap, level-6
death, fall-damage formula + cap, on-fire tick reuse.

### 6. The combat-action layer — action economy, Extra Attack, opportunity attacks, grapple/shove

**The gap (all core T1/T2, all currently DM-freehanded):** there's no turn budget (1 Action / 1 Bonus /
1 Reaction), no Extra Attack (martials get it at **L5** — squarely Tier 2, and the biggest martial
power spike in the game goes unmodeled), no opportunity-attack trigger, and no grapple/shove contest.
This is the martial half of "mechanize the SRD" — §1–§5 lean caster/defense; this is where fighters live.

**The design:**

- **Action economy on `GS.combat`.** Each combatant's turn carries a budget `{action, bonus, reaction,
  moved}` reset at turn start. Actions decrement it; the resolver refuses a second Action (or a used
  Reaction) — the script owns "you already acted." The **standard actions** get mechanical effect, not
  just narration:
  - **Dodge** → attacks against you have disadvantage until your next turn (a self-condition consumed by
    §3's resolver), Dex saves with advantage.
  - **Disengage** → suppresses opportunity attacks on your move this turn (see below).
  - **Dash** → the second band-move (already in `moveBand(c,dir,dash)` — wire it to spend the Action).
  - **Help** → grants the ally advantage on their next attack/check (a one-shot flag §1 consumes).
  - **Ready** → arms a reaction with a trigger the DM narrates; fires on the condition.
  - **Hide** → a Stealth check (§1) that sets `invisible`-for-attack-purposes until revealed.
  - **Search / Study / Utilize** → route to §1 checks (Perception/Investigation/tool-use).

- **Extra Attack — a derived turn-budget, not prose.** `attacksPerAction(sh)` reads class + level
  against the SRD extra-attack progression (Fighter/Barbarian/Paladin/Ranger/Monk → 2 at L5; Fighter → 3
  at L11 — inside Tier 2's ceiling only the L5 tier fires, but author the full curve). The Attack action
  then permits N `attack`/`pcAttack` events before the budget closes; the DM/UI knows it can swing again.
  Reads from `CLASS_PROGRESSION` level data — **derivation, not authoring** (same discipline as the rest).
  *This is the fix for "a L5 fighter hits as often as a L1 fighter" — the single most-felt martial gap.*

- **Opportunity attacks — they fit the band model cleanly (I was wrong to call them superseded).** An OA
  triggers when a combatant **leaves Melee** with a hostile (a `moveBand` from `melee`→`near`/`far` away
  from a foe who is in Melee with them) **without** Disengaging. `moveBand` detects the leave, and if the
  foe has a Reaction available, surfaces an OA — the foe's melee `resolveAttack` at the moment of
  departure. Disengage (or a Dash-as-flee where the fiction warrants) suppresses it. Bands abstract
  *position*, not *reach-triggers* — the trigger is "left the threatened band," which is exactly
  representable. Reactions come from the `{reaction}` budget, so a foe gets **one** per round.

- **Grapple & Shove — contested checks via §1 (DECIDED: contested).** A `grapple`/`shove` action
  resolves as the attacker's **Athletics vs. the target's Athletics-or-Acrobatics** (the SRD 2024
  contest — the target chooses the higher of the two; §1 resolves both sides and compares totals, a
  tie favoring the defender). Success → `condition_add{grappled}` (speed 0, from §3's table) or
  `prone`/pushed-a-band. This is where §3 (conditions), §1 (contests), and §6 (actions) compose — the
  conditions engine finally has a *mechanical source* for grappled/prone, not just DM fiat.

**Event surface:** `action{kind, target?}` (declared — the standard actions, decrements the budget +
applies the mechanical effect); `opportunity_attack{foe, d20}` (detected on an undefended Melee-leave);
`attack` gains an optional `attackIndex` for Extra Attack's Nth swing. Grapple/shove ride `action` +
`check` + `condition_add`.

**Verifier:** `dev/verify-combat-actions.mjs` — turn-budget refusal (second Action / used Reaction);
Dodge→disadvantage, Disengage→no-OA, Help→advantage; `attacksPerAction` curve by class/level; OA
trigger on undefended Melee-leave + suppression by Disengage + one-per-round reaction cap; grapple/shove
contest → condition.

---

## Deferred (still a priority — not this pass)

Not rejected — **deferred**. Each of these is real, wanted, and will get built; it's just not in *this*
mechanization pass. Ordered roughly by when it comes due. (Adam, 2026-07-01: "anything that is OUT is
actually just deferred — a deferred priority.")

- **Full script-driven monster-AI tactics** — the DM owns foe *turn decisions* (targeting, when to
  flee/parley) in v1, per the `COMBAT.md` automation split; the script already owns the foe's *math*.
  **Note the distinction:** opportunity attacks and Extra Attack *for foes* are *mechanics* (IN this pass
  — the engine resolves them); *which* target a foe dashes toward is *tactics* (deferred to Fable). This
  is the biggest deferred item and the natural next combat track after this pass.
- **T3/T4 class-feature executors** — epic boons, L11–20 capstones, CR 11+ legendary/lair-action
  *economies* as a driven system (data authored-but-inert per `TIER-SCOPE.md`). Comes due when the level
  cap lifts. *(Individual high-level spells are already IN this pass as narrative content — §2's full
  index.)*
- **Multiclassing** — a character-build system, deferred with the T3/T4 expansion (Adam's explicit call
  to hold for now).
- **Mounted / underwater / vehicle combat sub-rules** — thin formula add-ons (like §5's hazards);
  deferred until a specific scene needs one.

---

## Build order & dependencies

```
§1 check/save spine ──┬──> §3 conditions (feed adv/dis into resolveCheck; §3 durations wire to §2)
                      ├──> §2 concentration (damage-save uses resolveSave; needs full spell index)
                      ├──> §5 exhaustion (penalty into resolveCheck)
                      └──> §6 combat actions (grapple/shove contests use §1; OA uses resolveAttack;
                                              Dodge/Help set §3-style flags)
§4 death saves ── independent (hp_changed + rebirth + temp HP) — buildable in parallel
spell-index regen ── prerequisite for §2 (and a standalone win: full spell data in-app)
```

**Recommended sequence:** ① §1 (the spine everything composes on) → ② §3 (conditions + durations, since
§2/§5/§6 lean on it) → ③ spell-index regen + §2 (concentration + ritual) → ④ §6 (combat actions / Extra
Attack / OA / grapple — the martial half) → ⑤ §4 (death saves + temp HP + massive damage,
parallelizable) → ⑥ §5 (exhaustion/hazards). Each merges independently, `--no-ff`, verifier-gated, per
the git workflow.

**Estimated shape:** §1/§4/§5 are small (a primitive + a table + formulas); §2/§3/§6 are medium (data
regen + state + the damage-save/condition/action-budget composition). No phase touches the world-gen or
prep layers — this is all `src/engine/` + `data/` + the event handler in `src/world/dm.js`. Extra Attack
reads `CLASS_PROGRESSION` (derivation, no hand-edit).

---

## Decisions — RESOLVED (Adam, 2026-07-01)

1. **Spell index scope → ✅ FULL.** Promote to a full 339-spell `data/spells.js` (all levels, including
   spells beyond the T1/T2 cast ceiling) — high-level spells are valuable *narrative* content (scrolls,
   NPC casters, foreshadowing) even when the PC can't cast them. (§2 updated.)
2. **Margin grading → ✅ COMPUTED.** `resolveCheck` returns a `degree` off the `DIFFICULTY.md` ladder as a
   value the DM must honor — the direct mechanization of the degrees-of-failure ruling (near-miss = miss
   by 1–2 only). (§1.)
3. **Extra Attack → ✅ IN** (and opportunity attacks, action economy, grapple/shove — the whole martial
   layer). Now §6. The scope line is Tier 1–2 play, not "d20 tissue only."
4. **Condition durations → ✅ MECHANIZED.** The script owns expiry via structured `ttl` (rounds / repeat-
   save / end-of-turn / concentration-linked / indefinite) + `condition_expired`. (§3 updated.)
5. **Grapple/shove model → ✅ CONTESTED.** Athletics vs. Athletics-or-Acrobatics, target's choice, tie to
   the defender. (§6 updated.)
6. **Heroic Inspiration → ✅ IN.** Mechanized spend-to-reroll token, folded into §1.

**All decisions resolved — the spec is build-ready.** No blocking forks remain.

## Open questions (implementation-level, non-blocking — the builder resolves these in code)

- Whether `check` should subsume the combat `attack` event or sit beside it (both call `resolveCheck`/
  `resolveAttack` — likely beside, to keep the weapon-composition path in `pcAttack` intact).
- Whether exhaustion's −2/level, temp-HP, and held Inspiration should surface as visible sheet badges
  (likely yes — all easy-to-forget modifiers the player should see). Ties into the UI design pass.
- Foe reactions/OA under the side-based initiative model (§6 gives foes one Reaction/round — confirm that
  reads right before per-creature initiative arrives in Fable).
