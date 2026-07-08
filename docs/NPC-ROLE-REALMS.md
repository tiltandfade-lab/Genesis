---
type: system-spec
project: Genesis
status: SPEC (spine authored; realm skins + engine wiring pending) — Adam ruled approach C 2026-07-08
created: 2026-07-08
origin: NPC-PRESENCE-AND-HOOKS follow-on — ambient population exposed npc-role's realm-blindness
related:
  - "[[NPC-PRESENCE-AND-HOOKS]]"
  - "[[NPC-COHERENCE-DIAL]]"
  - "docs/table-registry.md"
---

# NPC-ROLE-REALMS — one archetype spine, per-realm skins

## The problem

`npc-role` is a well-built table (characterful play-angle notes, smart role-shape tail, realistic
weighting) but **frontier-coast-only**. Under the ambient-population architecture
([[NPC-PRESENCE-AND-HOOKS]]) it's the skeleton of *every NPC in every realm* — so a Noir world's
docks, a Theater world's wings, and Toon Town's market all get frontier farmers. Its **soul (the
play-angles) is universal**; only its **labels** are frontier-locked.

## The model — approach C (Adam, 2026-07-08): spine + realm skins with reskin / drop / add / reweight

**The realm edge-cases are the whole point** — a Cosmic realm *has* star-readers and *has no*
dockworkers; a Toon realm has no one sane. So drop/add are first-class, not afterthoughts.

- **Spine** (`npc-role-spine`, AUTHORED) — 35 universal role-archetypes, each with its universal
  play-angle note, a class tag, and a default `Weight`. The engine **weighted-picks** an archetype.
- **Realm skin** (`npc-role-skin-<realm>`, per realm) — an overlay that, for a given world's realm:
  1. **Relabels** each spine archetype with a realm job-name (soul/note inherited from the spine).
  2. **Drops** archetypes that can't exist there (skin gives no label → weight 0 for that world).
  3. **Adds** realm-unique roles that exist *nowhere else* (own label + note + weight + class).
  4. **Reweights** to match the realm's demography (Toon reweights toward mayhem; Cosmic thins labor).

The spine is authored once; a new realm costs a skin (a label-list + a handful of adds/drops), not a
fresh d100. This mirrors the engine's existing **Walk Skin** lens pattern (Dungeon/Urban/Wilderness
= one structure reskinned per context).

## Skin format (craft-authorable)

```
| Archetype key | Realm label | Weight (blank = spine default; 0 = drop) |
...reskin rows...
| [ADD] | <realm-unique role> | <weight> | <class> | <note> |   ← rows with no spine archetype
```

Illustration — same three archetypes, three realms (soul constant, label reskinned):

| Spine archetype (universal play-angle) | Frontier | Noir | Theater |
|---|---|---|---|
| Enforcer — *authority-adjacent, limited power* | City Guard | Beat cop | House bouncer |
| Servant — *invisible; hears every secret* | Maid | Hotel bellhop | Dresser |
| Performer — *craves attention, hides the feeling* | Bard | Torch singer | The leading act |

…and the **edge-cases** (the point of C):

- **Noir** — DROP: Wild-provider, Outfitter (no frontier wilds/shipwrights). ADD: *Private eye · Femme
  fatale · Crooked D.A. · Stool-pigeon informant · Torch singer* (Noir-only shapes).
- **Theater** — DROP: Delver, Land-worker. ADD: *Prompter · Understudy · Impresario · Critic ·
  Wardrobe mistress.*
- **Cosmic** — DROP most labor. ADD: *Star-reader · Void-touched pilgrim · Silence-keeper.*
- **Toon** — REWEIGHT hard toward chaos; ADD: *Anvil-fated bystander · Perpetual schemer · The straight man.*

## Engine wiring (unit — NOT craft-lane)

`rollNPC` role step becomes: **weighted-pick** a spine archetype (skin weights override defaults;
weight-0 archetypes excluded) → **label** from the world's realm skin (or the picked ADD's label) →
**note** inherited from the spine (or the ADD's note) → existing `[Faction]`/templating unchanged.
Store `{archetypeKey, label, note}` on the record. **Migration:** current `npc-role` stays the live
frontier table until this lands; then it seeds `npc-role-skin-frontier`. Default when no realm
context → frontier skin (no regression).

## Test / acceptance

- Weighted pick honors spine weights (and skin overrides); dropped archetypes never appear in that realm.
- Every realm skin covers every non-dropped archetype with a label; ADD rows carry their own note/weight/class.
- A frontier world reproduces today's `npc-role` distribution (migration parity).
- Ambient NPCs in a Noir/Theater/Cosmic/Toon world draw realm-correct labels; no frontier farmers leak in.

## Status / next

- ✅ **Spine authored** (`NPC Role Spine.md`, 35 archetypes) — this doc's backbone.
- ⏭ **Realm skins** — author per realm (Frontier = current labels; then Noir, Theater, … as reference
  pair first to prove the drop/add pattern, then the rest). Craft-lane.
- ⏭ **Engine reskin-lookup + weighted pick + migration** — engine session.
- Register in DESIGN.md/NEXT-STEPS at build time (deferred — parallel graphics session on shared docs).
