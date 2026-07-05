---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — the engine apply-step for per-creature `traits` (Adam's 100%-traits
  ruling). Without this, authored traits are inert data. Sonnet-executable. QUEUED behind
  feat/monster-story-wiring (shares combat.js) — stack off its tip or master after it lands.
created: 2026-07-04
related:
  - "[[REALM-ENRICHMENT-WRITING]]"
  - "[[REALM-STORY-WIRING]]"
  - "[[REALM-WIRING]]"
---

# REALM-TRAITS-APPLY — the Coyote-Thing stops fighting like a labeled wolf

## §0 The gap

REALM-ENRICHMENT-WRITING now authors `traits` on every realm creature
(`{hp?, ac?, note?, actions?:[{name,text,replaces?}]}` in `data/realm-bestiary.js`), but nothing
consumes them: `cmFoeFrom(BESTIARY[frame], name)` builds the foe purely from the chassis. The
realm creature's own actions/overrides must reach the live foe object, the combat digest, and the
codex record.

## §1 Carry (the desc pattern, again)

- All three encounter builders' realm branches (dungeon-walk.js ~:363, walk.js ~:268,
  wild-walk.js ~:58): add `traits: rc.traits || null` to the creature spec.
- `combatFromEncounter` (combat.js, the `n.desc`/`n.realmRole` idiom ~:713): `if(n.traits)
  f.traits = n.traits;` — BEFORE the apply step below.

## §2 Apply — `cmApplyTraits(f, traits)` (combat.js, pure, called from combatFromEncounter)

Order of operations, all null-safe:
1. `traits.hp` → set `f.hp` AND `f.hpMax` (a fresh foe; never resurrect a damaged one — apply
   only at construction). `traits.ac` → `f.ac`.
2. `traits.actions`: for each entry with `replaces`, find the chassis action on `f.actions` by
   case-insensitive name match and REPLACE it — `name`/`text` always; and when the entry's own
   text parses to mechanics (toHit/damage dice/DC/rider) via the SAME regex gen-bestiary/
   cmFoeFrom already uses (reuse that parser, never a new one), the parsed mechanics REPLACE the
   chassis's too (divergence is licensed — the authored data is the law; the CR budget was
   enforced at authoring time, [[REALM-ENRICHMENT-WRITING]] §3.2). Text that parses to nothing →
   keep the chassis mechanics under the new name. No match → treat as additive. Entries WITHOUT
   `replaces` → append as additional actions (capped: total actions ≤ chassis + 2).
3. `traits.note` → `f.traitNote` (a one-line combat-relevant fact the DM reads; no mechanics).
4. Stamp `f.traitsApplied = true` (harness hook).

## §3 Surface

- `combatDigest` foes: first-instance-per-name (the existing `seenDescNames` discipline) also
  carries `traitNote` and the RENAMED action names ride automatically via the foe's own actions
  (verify the digest's action serialization reads `f.actions` post-apply, not the chassis).
- Codex mint (`codexMintSignificantFoes`): `dm.traits = f.traits || null` on the record —
  the individual's mechanical identity persists with its desc/flavor.

## §4 Build + verify

Branch `feat/realm-traits-apply` (base: master AFTER feat/monster-story-wiring lands — both
touch combat.js; coordinate with the orchestrator). Extend `dev/verify-realm-wiring.mjs`:
a fixture realm creature with `traits:{hp:30, actions:[{name:"Snap of Wrong Teeth",
replaces:"Bite", text:"..."}]}` → the live foe has hp/hpMax 30, an action named "Snap of Wrong
Teeth", NO action named "Bite", damage mechanics preserved from the chassis Bite; an additive
action appends; the cap holds; a traits-less creature is byte-identical to today (regression).
MUTATION (red-first): stub the apply call → the fixture foe still shows "Bite" → fail.
Regression: verify-combat, verify-realm-wiring, verify-dm-events; gauntlet-fuzz + monkey.

## §5 Decisions (flag to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | Apply at construction only, hp→hp+hpMax | never mutate a live fight |
| 2 | `replaces` renames in place, mechanics preserved unless text re-parses | fiction changes, chassis math stays the law (SPEED doctrine) |
| 3 | Action cap = chassis + 2 | traits sharpen, never bloat the action economy |
| 4 | Reuse the existing action-text parser | one damage-dice grammar in the codebase |
