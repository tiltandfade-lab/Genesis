# SPRITE-TAGS — the casting-grade tag schema (Adam's rulings, 2026-07-10)

type: system-spec

The old tagging (realm + vague descriptor) can't answer the DM's real question:
*"a character just emerged from play — which sprite can I put on them?"* This spec
upgrades tags from labels to a CASTING SYSTEM.

## The three laws

1. **BINDING LAW** — a sprite, once assigned to an NPC, is FIXED to that NPC.
   No reuse for other characters in the same world, few exceptions (see
   `castability: crowd`). The sprite IS the character's face.
2. **EXPRESSION-VARIANT LAW** — sprites identical in style and form that differ
   only in expression are THE SAME CHARACTER at different moments. They share an
   `expressionSet` id, and each variant carries a `mood`. Once sprite assignments
   settle, an NPC pass can wire expression swaps (calm → alarmed → wounded) off
   these sets. Variants are never cast as separate people.
3. **CASTING LAW** — every sprite carries enough tags for the DM (or engine) to
   cast it onto an improvised character — one born from surprise play, not a
   mechanical world roll. Casting = filter by tags, take the best unbound match,
   then BIND (law 1).

## Schema (per sprite, in the registry)

| field | values | what it answers |
|---|---|---|
| `slug` | unique id | join key (registry ↔ bestiary ↔ tables) |
| `realm` | home realm | where it was generated for |
| `portability` | list of realms | where it could pass unnoticed (a plain farmer travels; a chrome cyborg doesn't) |
| `family` | npc / kid / monster / animal / item / arcana | broad class |
| `kind` | human, weasel-folk, robot, undead, dog, spirit… | what it IS |
| `role` | smith, medic, gunslinger, priest, raider, elder… | the job/archetype a DM would ask for |
| `ageBand` | child / young / adult / elder | |
| `presentation` | masc / femme / ambiguous / n-a | |
| `build` | slight / average / heavy / hulking / n-a | |
| `attire` | short phrase (apron+tools, pinstripe vest, rags…) | costume tells |
| `props` | list (tommy gun, lantern, ledger…) | what it's holding |
| `mood` | calm / warm / grim / menacing / manic / afraid / neutral | expression read |
| `pose` | active / idle / static | static = the mannequin flag |
| `sizeBand` | tiny→titanic | the grid-ladder band |
| `castability` | **unique** / **named** / **generic** / **crowd** | see below |
| `expressionSet` | shared id or null | law 2 grouping |
| `bound` | npc id or null | runtime: who wears this face (law 1) |

### Castability tiers

- **unique** — one-of-one entities. Never randomly cast (arcana majors, the
  neighborhood thing, named-grade bosses). The DM may *introduce* them; the
  engine never deals them out.
- **named** — strong enough identity to carry a named NPC (the crowned smith
  king, the plague-doctor raider). Cast deliberately, bind immediately.
- **generic** — the workhorses: farmers, guards, cooks, wolves. Castable onto
  any matching improvised character; bind on assign.
- **crowd** — the binding-law exceptions: swarms, background groups, generic
  livestock. May appear multiple times, never bound to an identity.

## DM casting flow (surprise-play characters)

1. Play produces a character the tables didn't roll (the DM invents a ferryman).
2. Engine filters: realm/portability → family+kind → role (nearest) → ageBand/
   presentation/build if the fiction specified them → mood as tiebreaker.
3. Best UNBOUND generic/named match wins; `bound` is stamped with the NPC id;
   the codex records sprite↔NPC permanently (names immutable once revealed —
   same law as [engine owns the nouns]).
4. No match above threshold → DM narrates without a sprite and the miss is
   logged as a gen-queue want (feeds the next sheet wave).

## Where tags live

- `dev/sprite-sheets/incoming/v3/v3-tags.json` — this wave's enrichment (2026-07-10).
- Fold into `data/sprite-registry.js` at integration (regenerated, never hand-edited).
- Tag enrichment is a TEXT pass over manifest labels first, vision spot-checks
  second; `mood`/`pose` may be refined by vision at review time.

## Open

- The NPC expression pass (law 2 wiring) — after Adam settles sprite assignments.
- Retro-tagging the pre-v3 committed corpus to the same schema.
