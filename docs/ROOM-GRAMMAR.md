# ROOM-GRAMMAR — architectural composition rules (the arrangement layer)

type: system-spec
status: SPECCED (Adam 2026-07-11 night, verbatim direction: paintings in certain places,
columns in patterns, braziers in pairs near corners/walkways, torches evenly spaced near
corners in patterns, benches/pews rollable as simple polys, shops easy because constrained.
Builds AFTER BEAUTY-WAVE-2; consumes PACKET-02 textures + BW2-5's furniture channel.)

## The law

**The roll owns the nouns; the GRAMMAR owns the arrangement.** dressPlan keeps rolling WHAT
appears (realm-true, seeded, deterministic); a new composition pass owns WHERE — humans read
rooms by rhythm, symmetry, and alignment, and random scatter reads as noise no matter how
good the art is. (The DM still only NAMES what the engine placed — nouns law unchanged.)

## §1 The composition primitives (the whole vocabulary — everything below composes these)

- **ALIGN** — snap to wall / to a room axis / centered on a wall segment.
- **RHYTHM** — repeat at a fixed interval along a wall or axis (torch every N cells,
  colonnade bay spacing). Interval derives from room dims so it divides evenly — no orphan gap.
- **PAIR** — mirror two identical pieces across an axis (braziers flanking a door, statues
  flanking a dais).
- **ROW** — ranks facing a focal, with a preserved center aisle (pews, benches, shelving runs,
  barracks cots).
- **FLANK** — at the sides of an opening/transition (door guards, gate braziers).
- **FOCAL/CENTER** — exists (dressPlan focal + VP4 key-light); grammar adds: the focal sits at
  a composition anchor (wall-segment center, dais top, room center), never a random cell.
- **CLEAR** — inviolable: door swing cells, aisle cells, and the walkable path between doors
  stay empty. Runs LAST, vetoes everything.

## §2 Element rules (Adam's rulings, mechanized)

- **Torches:** RHYTHM along walls (interval ~3 cells, derived to divide the wall), plus one
  near each corner; always ≥1 flanking each doorway. Never mid-floor.
- **Braziers:** PAIRs only — flanking doors, dais steps, or aisle ends. A lone brazier is a
  roll downgrade to torch.
- **Columns (extends BW2-5's COLUMN DEMOTION):** when a room earns columns at all, they come
  as a COLONNADE — a RHYTHM row (or mirrored pair of rows) aligned to the room's long axis,
  bay spacing uniform; or a perimeter ring inset 1 cell. NEVER scattered singles.
- **Paintings/wall-hangs:** centered on an unbroken wall segment ≥3 cells, eye-line height,
  max one per wall face; never beside a door frame (the frame is its own composition).
- **Benches/pews:** ROWs facing the room's focal (shrine altar, dais, hearth), center aisle
  preserved; count from room depth. Benches also legal as single ALIGN-to-wall pieces in
  non-assembly rooms (taverns, corridors).
- **Rugs/runners:** centered on aisle or under the focal approach (the shop mock's rug).
- **Doors (the walk side):** the spatializer's door placement gains a preference pass —
  centered on a wall face or symmetric across the room axis when the graph allows; a door
  jammed in a corner is legal only when the topology forces it.

## §3 Room typologies (the template layer — "shops are easy because they're constrained")

A room with a station/role resolves a LAYOUT TEMPLATE: named slots + grammar calls, then the
roll fills slots with realm-true content (engine nouns, realm skins as ever):
- **shop** (the mock is the blueprint): counter ALIGNed facing the door + rug runner between,
  shelf ROWs against side walls (stocked via the loot/goods tables), storage corner (barrels/
  crates cluster), one focal curio (the shrine/oddity slot), torch rhythm.
- **shrine/chapel:** altar FOCAL on the far wall-center or dais, pew ROWs + aisle, brazier
  PAIR flanking the altar, wall-hangs behind.
- **library/study:** shelf ROWs, reading table CENTER, single focal painting.
- **barracks:** cot ROWs, footlocker per cot, weapon rack ALIGN.
- **crypt:** niche RHYTHM along walls, sarcophagus FOCAL/CENTER, the gloom register.
- **throne/finale:** dais (BW2-5) + FLANK pairs + colonnade approach — the finale mock is
  literally this template.
- **camp/rest:** hearth FOCAL, bedroll ring, the camp mock's register.
Untemplated rooms (generic pocket/path) use bare grammar: torch rhythm + CLEAR + at most one
focal + scatter DOWNGRADED to edges (scatter is a texture, not a composition).

## §4 The poly-furniture roster (BW2-5's channel; "so simple to create with polys — yeah")

Bench, pew, table, counter, shelf-unit, cot, altar, weapon rack, sarcophagus, niche insert —
each 2-6 prisms wearing PACKET-02 faces (wood/stone/metal per realm). One shared builder
(`furnitureFor(kind, realm)`), instanced per kind, faces from the texture atlas. Braziers/
torches stay in the existing light-prop channel; this roster is the FURNITURE channel.

## §5 Seams (all existing — this spec adds NO new generation systems)

dressPlan (place-dressing.js) gains the composition pass between roll and emit; room
roles/stations already exist (place spine, walk semantics); door data lives in the
spatializer; VP4's focal export + key-light law compose with FOCAL; CLEAR reads the combat
grid's walkable set (BW2-2's floor contact + VP3's exclusions already query it). Determinism
law binds: same walkId → same arrangement, forever.

## Verify sketch (per-unit harnesses at build time)

Rhythm intervals uniform ±0 cells; pairs mirror exactly; rows face the focal with aisle
intact; CLEAR veto proven red-first (template tries to block a door → veto fires); painting
wall-segment rule; colonnade alignment; per-typology template asserts (shop counter faces the
door in 100/100 seeds); determinism byte-checks; loop-gate + a per-typology study card READ.
