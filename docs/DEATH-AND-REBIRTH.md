---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-21
related:
  - "[[DESIGN]]"
  - "[[ADVANCEMENT]]"
  - "[[DIFFICULTY]]"
  - "[[CHAR-CREATION]]"
  - "[[NEW-GAME-FLOW]]"
  - "[[SPATIAL-MODEL]]"
---

# Death & Rebirth — the Bardo, the Connected Plane, and the Successor

How a character dies, what the world does in their absence, and how the next soul enters
a world that has moved on without them. This is the loop that makes Genesis a *roguelike-adjacent*
persistent sandbox: **death is expected, the world is the save file, and a new life is a new
vantage on the same living world.**

Death's mechanical container is `ADVANCEMENT.md` (you climb the SRD curve slowly, so most
lives end well short of L20) and `DIFFICULTY.md` (the world is fixed-difficulty and *must*
telegraph lethal danger). This spec owns what happens **at and after death.**

## Decisions (locked 2026-06-21)

- **Death is expected, not punished.** Brutal-but-fair: lethal only when the fiction has
  **telegraphed** it (corpses, warnings, danger-fragments per `DIFFICULTY.md`). A trap that
  one-shots an unwarned PC is a bug, not difficulty. The *joy* is starting again somewhere else
  in a world your last life already changed.
- **The successor is a brand-new character** (full creation), **not** the dead one resurrected.
  They inherit **no quests**, no items, no relationships by default.
- **The world persists exactly** as the dead PC left it — factions, clocks, ledger, map, the
  corpse — then **drifts forward** across the bardo gap (below). It does **not** reset.
- **All worlds share one connected plane** ("Universe v3"). Each rolled world is a *region*
  on one map; the successor may spawn anywhere on it — often far from the old drama, where no one
  has heard of it. Old worlds + characters from the current isolated-save model are **banked; we
  start fresh** on the connected schema (merging 0,0-origin saves retroactively is not worth it).
- **The bardo gap is a roll, not a constant.** Tibetan *Bardo Thodol* gives up to **49 days**
  (7×7) between death and rebirth → a **bell-curve roll, 0–49 in-world days**, most commonly
  ~3–4 weeks. The world clock advances by the result; faction/pressure drift runs over it.
- **The 14 vision-rolls shape the world's direction without the hero.** The *Chönyi Bardo*'s
  7 peaceful + 7 wrathful days become **14 fate rolls** (peaceful = a chance of good, wrathful =
  a chance of ill) against **the dead PC's 7 most significant entities** ("the Saga"). Each
  outcome is presented to the player **only as a Fragment** — a hint, not a readout — to bait a
  return visit. The truth goes to the ledger (DM-side).
- **Reincarnation memory is the player's call.** We can't force a player to forget, so it's
  diegetic: the successor *may* be "the chosen one who remembers past lives." Carrying knowledge
  forward is allowed and explained, not blocked.
- **Faction proximity is rolled at creation** (in *This Is Your Life*), **class-weighted**: most
  likely a **tie** to a nearby faction, less likely a **member**, with a real chance of **none** —
  and any class can roll any faction, just weighted toward its archetype. A separate roll sets
  **which factions are active near the spawn**, seeding the opening pressures. A successor can
  thus begin *inside a rival* of the dead PC's allies.
- **The corpse + its loot persist, and decay by clock + context.** Reach the body fast enough and
  it's lootable; too late, or it fell where people/monsters/scavengers would disturb it, and the
  loot is gone (carried off, looted, rotted, claimed).
- **Companions can rescue/revive in the moment** (DM-controlled for now). A PC with the right ally,
  pet, or item can be pulled out of a fatal situation; solo play forgoes that net for solo glory.
- **The dead PC becomes a Wandering Soul only if the player destroys that world.** Within a living
  world they stay a *fixed corpse + a legend in the ledger*; banking them into the portable
  `U.souls` roster happens **only on world-destroy** (supersedes the always-bank reading).

## The death moment

1. **Rescue window first.** Before death finalizes, the DM checks for an in-the-moment out:
   a companion with healing/the right item/the right skill, an environmental escape, a "miraculous
   out" the scene affords (`COMBAT.md`). Companions are **DM-driven** in v1. Solo characters have
   no net — by choice.
2. **If no rescue,** the character is `fallen`: record `fellWhere` (place) and `fellWhen` (the
   in-world clock — not wall-clock; `fate.js` currently stamps `Date.now()`, must change). Write a
   `canon` ledger entry: the death, the place, the cause, who/what witnessed it.
3. **Then the bardo begins.** No "spawn back into the same fight" — that old fate-d20 path is
   **retired** (see Reconciliation). Death always leads through the bardo to a new life.

## The bardo gap (49 days)

- Roll the gap: **bell curve over 0–49 in-world days** (e.g. `7d7` floored to that range, or a
  triangular roll — tune for a fat ~21–28 day middle, rare instant/full-49 tails). Presented to
  the player as the *passage of the bardo*, diegetic.
- **Advance the world clock by the result.** Then run the existing **drift machinery over the
  gap**: `ssFactionTurn` ticks (factions press agendas, fill clocks, splinter, merge, fire Grim
  Portents), pressures worsen, the change-over-time layer (`NEXT-STEPS` 10–13) runs. The world the
  successor wakes into is genuinely *later*.
- This is the spine that makes a successor feel like a **new era**, not a reload: 3–4 weeks of
  faction motion have happened off-screen, keyed to the very fronts the dead PC was tangled in.

## The 14 vision-rolls — "the Saga"

The 7×7 peaceful/wrathful structure of the *Chönyi Bardo* drives the world's direction during the
gap, focused on what mattered to the dead life.

- **The Saga = the 7 most significant entities in the PC's life** — drawn from the ledger:
  NPCs, companions, factions, towns/places, enemies, threads. This is **new tracked state** —
  maintain a per-character `saga[]` (ranked significant entities) updated through play, so at death
  there's a real list to roll against. (If fewer than 7 exist, pad from the world's dominant
  factions/places.)
- **14 rolls** = 7 **peaceful** (a chance of good befalling that entity / the world bending kindly
  around it) + 7 **wrathful** (a chance of ill). Each roll targets one Saga entity (or a fate roll
  per the 7+7 cadence over the gap). Outcomes mutate the ledger: a faction the PC broke recovers
  or collapses; an ally rises to power or is murdered; a saved town prospers or is razed; the
  enemy the PC died fighting becomes a legend or a tyrant.
- **The player sees only Fragments.** During the successor's bardo passage, these surface as
  6–10 word sensory hints — *"smoke over a valley you once knew," "a banner you fought rises again"* —
  never the literal outcome. The truth is canon in the ledger; the DM reveals it only if the
  successor travels there or hears the stirrings. This is the **return-visit hook**: your past life
  echoes, and finding the echo is a reward.
- **Your past self can become** a legend, a villain, a forgotten nobody, or a looted corpse in a
  cave — decided by these rolls + whether anyone reached the body.

## Reincarnation & memory

- The successor is fully new (`CHAR-CREATION.md` ritual). By default they know nothing of the
  past life.
- **Optional "chosen one" framing:** the player may choose a successor who *remembers* — past-life
  recall as a diegetic trait. Since we can't enforce player amnesia anyway, we **name and bless**
  it rather than pretend it isn't happening. (Possible creation toggle / rare creation roll;
  flavor, not a mechanical bonus in v1.)

## The successor's entry

The new character is created normally, then **placed and tied** into the connected plane:

- **Spawn placement:** a new region/node on the shared plane, **usually distant** from the dead
  PC's drama — its own hex coordinates, its own local factions. The old world is *reachable by
  travel*, not adjacent.
- **Faction proximity (new, in *This Is Your Life*):** a class-weighted roll giving the successor
  a relationship to a local faction — **tie > member > none**, with cross-class chance. This can
  plant them *inside a rival of the dead PC's allies* — the explicit "start as the enemy faction"
  case. Feeds the opening Standing + pressures (`rollEntry`, the Entry bridge).
- **Active-factions roll:** which factions operate near the spawn — seeds the local Starting State
  (`rollStartingState`) for this region, distinct from the dead PC's region.
- **Echoes:** if the spawn is near (or the PC travels toward) the old drama, the DM surfaces the
  Saga outcomes as rumor/stirring → optional reconnection with the past life's legend.

## The corpse & its loot

- On death, the body + its carried loot become a **fixed canon object** at `fellWhere` with a
  `fellWhen` timestamp and an **environmental-context tag** (remote/wild vs. trafficked/inhabited
  vs. monster-den, etc. — derivable from the place + nearby pressures).
- **Recoverability decays by clock + context.** A roll/check at the time of recovery weighs
  *elapsed in-world days since `fellWhen`* against *context*: a corpse in a sealed remote cave may
  hold for a long time; one on a road or in a monster lair is stripped/dragged off fast. Past the
  threshold, the loot is **gone** (carried off, looted by a faction, rotted, claimed by a beast) —
  and *that* itself can be a Saga/ledger outcome (an enemy now wields your old blade).

## Companions

- Companions/pets/sidekicks travel with the PC; in v1 **the DM controls them.** They can **revive
  or rescue** the PC in a fatal moment if they have the skill/item to do so (the death-moment
  rescue window above).
- Solo play is fully supported — "a quest of solo glory" forgoes the safety net.
- Open: can a companion **survive the PC's death** and persist into the world (findable by a
  successor)? Compelling, deferred — see Open questions.

## The connected plane (Universe v3)

- Today: each world is an isolated save (own node-graph, all origins at 0,0; `genesis-universe-v2`).
- Target: **one shared plane.** Each rolled world becomes a **region** — a node-cluster placed at
  distinct coordinates on the one global hex substrate (`SPATIAL-MODEL.md` — the hex layer is
  *already* one global deterministic surface; this connects the node-graph layer on top).
- **Migration: bank-and-restart.** Existing v2 worlds/characters are archived to the roster, not
  merged. New schema `genesis-universe-v3`; `migrateAll` writes a one-time bank record, doesn't
  attempt geometric merge. (Heaviest lift in this spec — see Build order; do it deliberately.)
- The Wandering Souls roster (`U.souls`) stays a **universe-level** portable pool — but is now fed
  **only by world-destroy**, not by every death.

## What persists vs. resets (summary)

| Thing | On PC death |
|---|---|
| World state (factions, clocks, ledger, map) | **Persists**, then drifts over the bardo gap |
| The PC's quests / items / relationships | **Not inherited** by the successor |
| The corpse + carried loot | **Persists as canon**; recoverable until clock+context says gone |
| The PC themselves | A **legend in the ledger**; a Wandering Soul **only if the world is destroyed** |
| Faction standing / opening | **Re-rolled** for the successor (class-weighted proximity, new region) |
| World clock | **Advances** by the 0–49 day bardo roll |
| Past-life memory | Player's choice (chosen-one framing) |

## Reconciliation with existing systems

- **`src/world/fate.js` — reworked.** The current d20≥11 "successor spawns back into the same
  adventure at `fellWhere`" is **superseded**: death now always routes death → bardo (gap roll +
  14 visions) → full new creation → placement on the connected plane. The fate *modal* machinery
  and `dieRoll` FX can be **repurposed** for the bardo gap roll + the 14 vision rolls. `fellAt`
  must become an **in-world** clock stamp, not `Date.now()`.
- **`ssFactionTurn` (`src/engine/world-gen.js`) — reused** as the bardo-gap drift engine (run N
  ticks over the gap). No new faction generator needed — the existing one is solid.
- **`rollEntry` / `entrySeeds` / `pickTension` (the Entry bridge)** — extended to consume the new
  faction-proximity + active-factions rolls for successor placement.
- **The Saga (`saga[]`)** — new per-character tracked state; populate from the ledger through play.
- **Wandering Souls (`roster.js`, `data/souls-canon.js`)** — banking trigger narrows to
  world-destroy; canon souls unaffected.

## Open questions

- **Bardo gap dice:** exact bell shape (`7d7`-floored vs triangular vs custom) — tune for the
  ~3–4 week mode.
- **Saga maintenance:** auto-rank the 7 from ledger heuristics (frequency × recency × stake), let
  the player pin, or a hybrid? And what fills the list early (before 7 significant entities exist)?
- **Companion survival:** can a companion outlive the PC and be found by a successor (a loyal hound
  wandering 49 days, an old retainer)? Strong flavor; deferred.
- **Memory mechanics:** is "chosen one" pure flavor, or does it ever grant a mechanical hook
  (a creation roll, a rare trait)? Leaning flavor-only for v1.
- **v3 migration UX:** how is the bank-and-restart presented to a player with existing v2 worlds —
  silent archive, or a framed "the planes converge" moment?
- **Corpse-recovery roll:** exact formula (elapsed-days × context tag → DC or table) and whether
  the player sees the odds.

## Build order (proposed)

1. **Saga tracking** — add `saga[]` to the character model + a populate-from-ledger pass. Cheap,
   load-bearing for the visions. Buildable now.
2. **Bardo gap + drift** — the 0–49 bell roll, advance the clock, run `ssFactionTurn` over the gap.
   Reuses existing drift. Buildable now.
3. **The 14 vision-rolls + Fragments** — peaceful/wrathful against the Saga → ledger mutations →
   Fragment surfacing in the bardo passage. Needs Saga (1) + the Fragment layer.
4. **Faction proximity at creation** — the class-weighted *This Is Your Life* table + the
   active-factions roll; wire into `rollEntry`. Net-new table + creation beat.
5. **Corpse & loot decay** — canon corpse object + the clock×context recovery roll.
6. **Connected plane (Universe v3)** — the schema migration + region placement on the shared hex
   plane. **Heaviest; do last, deliberately.** Until it lands, steps 1–5 work within the current
   per-world model (successor in the same world, placed at a distant node).
7. **`fate.js` rework** — retire spawn-back; route death → bardo; repurpose the modal/FX.
