---
type: system-spec
branch: Genesis
status: sketch
created: 2026-06-21
---

# Combat — Theater-of-the-Mind 5.5 Engine

**Status: sketch.** Combat is the subsystem most entangled with Fable; this captures the agreed
model so the rest of the system (advancement, difficulty) can design against its *event surface*
now, while the engine itself firms up later. Award values are deferred (see `ADVANCEMENT.md`).
Emits `encounter_resolved` / `kill` events per `EVENT-CONTRACT.md`.

## Decisions (sketched 2026-06-21)

- **Stick to 5.5e rules as closely as possible.** WotC balanced 5.5 combat well — don't reinvent
  it. Attack rolls, saves, conditions, action economy, damage all resolve by the book.
- **Theater of the mind, zone-banded** — no grid. Position is tracked as discrete range bands, not
  coordinates.
- **The scene is objectified from generator output**, not improvised. Dungeon/encounter generators
  already emit terrain specs; those become the scene's cover, hazards, and exits.

## Range bands

Discrete bands, each mapping to a 5.5 distance so spell ranges and movement still resolve cleanly:

| band | ~5.5 distance | meaning |
|---|---|---|
| **Melee** | ≤ 5 ft | in reach; melee attacks |
| **Near** | ~ 30 ft (one move) | one Move closes to Melee |
| **Far** | 60 ft+ | two+ moves, or ranged/spell territory |
| **Out of the fight** | — | fled / disengaged / not yet engaged |

Movement = changing band (a Move shifts one band closer/farther, Dash two). Spell/weapon ranges
check against the band's distance. This keeps tactical positioning meaningful without grid math.

## Cover (from terrain specs)

Terrain specs from the generator define cover objects in the scene, resolved by 5.5:

- **Half cover** → +2 AC and +2 Dex saves.
- **Three-quarters cover** → +5 AC and +5 Dex saves.
- **Full cover** → can't be targeted directly.
- Plus **advantage/disadvantage** from position, lighting, hazards as the 5.5 rules dictate.

Where a generator doesn't emit terrain specs, port the spec format from the generators that do
(most dungeon generators already produce them) — don't hand-improvise scene geometry.

## Scene objectification serves three things at once

The same objectified scene — terrain, cover, hazards, exits, present NPCs and their motivations —
simultaneously provides: **tactics** (cover, positioning), **the escape routes** that make
`DIFFICULTY.md`'s "flee" real, and **the environmental/social levers** that make the "miraculous
out" mechanically reachable instead of DM fiat. The richer the scene objectification, the more
real all three become. This is the single highest-leverage thing the combat engine gives the rest
of the game.

## Event surface (what combat emits)

- `encounter_resolved {foes:[{cr,victimClass}], method, objectiveRef?, outcome}` — `method` records
  *how* it ended (combat / stealth / social / environmental / avoided), which `ADVANCEMENT.md`
  prices and `DIFFICULTY.md` reacts to.
- `kill {victimClass, factionId?}` — per defeated foe; feeds difficulty/escalation.

Designing this surface now is the whole point of writing the sketch early: advancement and
difficulty can be built and tuned against these event shapes before the combat engine exists.

## Open questions (most deferred to/with Fable)

- Initiative model (per-creature 5.5 initiative vs a simpler banded order for solo pace).
- How much the script automates (rolls, monster turns) vs the DM narrates — the
  script-default / DM-exception split applies, but the line for combat is unset.
- Companion action in combat (autonomy vs player-directed).
- Combat XP award values (with `ADVANCEMENT.md`, once foes reliably emit CR + objective linkage).
- Monster stat-block source: the `Asset Library/Monsters & Enemies/` files (~379) already carry
  the stats + custom tables — wire combat to read them, never duplicate.
