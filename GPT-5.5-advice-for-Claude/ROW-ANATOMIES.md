# Table Row Anatomies

This note is the clear version of the table-row writing advice.

## Core Rule

Every runtime table row should be a small machine for play.

It should put something on screen, invite a choice, create pressure, and leave a mark somewhere in state if the players touch it or ignore it.

## The Six-Question Row Test

Every runtime row is checked against these questions:

1. What is visible now?
2. What can the player do?
3. What does it cost or threaten?
4. What can be gained?
5. What persists if ignored, used, broken, stolen, or survived?
6. Which state bucket remembers it?

Rows do not need to answer all six questions, but a runtime row should answer at least two. A row that only says what would be cool is hook-food, not play-food.

The usual state buckets are:

- `codex`
- `ledger`
- `clock`
- `faction`
- `item`
- `map`
- `walk`
- `none`

## The Five Runtime Row Families

These five anatomies cover the main rows the DM or player experiences directly.

| Family | Use For | Authoring Anatomy |
|---|---|---|
| `situation` | NPCs, social conflict, problems, pressure scenes, active complications | `Band | Seen Now | Wants | Pressure/Clock | Leverage/Payoff | If Ignored` |
| `item` | Objects, loot, relics, tools, rewards, legacy gear | `Band | Object | Frame | Use/Ranks | Tell | DM Ripple` |
| `place` | Locations, rooms, landmarks, districts, local discoveries | `Band | Place | What Is Happening Now | Local Pressure | Player Handle | If Ignored` |
| `journey` | Travel beats, walk beats, hazards in motion, chase-like movement pressure | `Band | Beat | Immediate Check/Cost | Environmental Lens | Persistent Trace` |
| `rumor` | Claims, hooks, omens, secrets, intel, warnings | `Band | Claim | Concrete Evidence | Who Benefits | What Happens Tonight` |

## Family Details

### Situation

Use when the row creates a live social or problem scene.

The row should answer: who/what is present, what they want, what pressure is already moving, what the player can exploit, and what gets worse if ignored.

Good fit:

- NPC Hook
- NPC Want
- NPC Leverage
- NPC If Ignored
- urban pressure
- tavern in-media-res
- quest complications

Weak shape:

- "Authority - afraid of punishment."

Playable shape:

- "A junior magistrate is burning records behind the courthouse. He wants one name erased before dawn; the watch captain is already looking for smoke. Help him and he owes a legal favor, expose him and a faction clock advances."

### Item

Use when the row creates an object the player can inspect, use, keep, lose, break, sell, steal, or inherit.

The row should answer: what the object is, why it matters, how it can be used, what reveals its nature, and what changes if it enters play.

Good fit:

- realm items
- trinkets
- loot oddities
- legacy items
- magical or charged objects

Weak shape:

- "Ancient sword - mysterious power."

Playable shape:

- "A nicked officer's saber with three names scratched from the grip. It cuts cleanly through rope and uniforms, never flesh; any guard who sees it recognizes one erased regiment and asks why you have it."

### Place

Use when the row creates a location or local condition.

The row should answer: where the players are, what is happening there now, what pressure belongs to this place, what handle the player can grab, and what changes if they leave it alone.

Good fit:

- place nearby
- place secret
- building interior
- place drift
- rooms and landmarks

Weak shape:

- "Old shrine - forgotten god."

Playable shape:

- "A roofless shrine where rain falls upward from the altar bowl. The local shepherds still leave salt here, because the bowl shows a missing animal's last footprint when fed a drop of blood."

### Journey

Use when the row creates a beat in motion: travel, chase, walk, camp, hazard, route pressure, or an environmental obstacle.

The row should answer: what beat interrupts movement, what immediate check/cost it asks for, what environmental lens colors it, and what trace remains after the party passes.

Good fit:

- travel complications
- travel threats
- camp complications
- rest complications
- walk beats
- chase complications

Weak shape:

- "Bad weather slows travel."

Playable shape:

- "A sleet band turns the road into black glass. Crossing at speed costs a group Dex check or a pack animal goes down; waiting gives the rival caravan a one-watch lead and leaves the party's tracks sealed under ice."

### Rumor

Use when the row creates information: a claim, omen, warning, secret, or hook that points toward action.

The row should answer: what is claimed, what concrete evidence exists, who benefits if people believe it, and what happens tonight if no one acts.

Good fit:

- urban rumor intel
- urban secrets
- distant word
- shrine and omen
- hook rumors

Weak shape:

- "People whisper of a monster."

Playable shape:

- "Three fishwives swear the bell under the harbor rang at low tide. The proof is a wet rope-burn on the dry bell tower rail; the dock guild profits if boats stay moored, and tonight the youngest bell-ringer plans to dive for the sound."

## What The Five Families Do Not Cover

The five families cover runtime content rows. They do not cover every table in the repo, and they should not be forced onto tables that feed another system.

### Lens Or Motif Tables

Use for tables that modify another roll instead of becoming a beat by themselves.

Examples:

- Walk Skin
- Walk Breach
- Walk Nightmare
- tone, color, texture, motif, atmosphere lens tables

Why exempt: these are adjectives or physics overlays for another result. Calling them `journey` can make the linter lie, because they are not beats with a cost and trace.

Possible later mini-family:

`lens`: `Band | Motif/Lens | Sensory Tell | Rule Of Use | Compatible Context | Escalation`

### Pointer Or Key Tables

Use for rows whose job is to point, unlock, block, reveal, or connect.

Examples:

- Plot Item
- Plot Lock
- keys, seals, wards, clue pointers

Why exempt: these are doer/pointer rows. Their anatomy is about what it opens or prevents, not item use or place pressure.

Possible later mini-family:

`pointer`: `Band | Pointer | Opens/Blocks | Evidence | Holder/Location | If Misused`

### Mechanic Or Result Tables

Use for rows that resolve a rules trigger.

Examples:

- crit outcomes
- morale outcomes
- rest results
- check consequences
- consequence ladders

Why exempt: these are closer to `trigger -> result -> state change` than to a scene/place/item/rumor.

Possible later mini-family:

`result`: `Band | Trigger | Immediate Result | Cost/Benefit | State Event | Follow-On`

### Generator Grammar Tables

Use for tables that provide ingredients, names, fragments, visual parts, traits, or syntax.

Examples:

- names
- fragments
- species traits
- model recipes
- visual part tables

Why exempt: the row is not intended to be playable alone. It becomes meaningful only after composition.

Possible later mini-family:

`grammar`: `Slot | Token | Constraint | Register | Combines With`

### Contract Or Vocabulary Tables

Use for infrastructure tables and machine-facing taxonomies.

Examples:

- event contracts
- schema tables
- provider/model recipes
- state-shape vocabularies

Why exempt: these are not authored play content. They are system truth or documentation.

Possible later mini-family:

`contract`: `Key | Meaning | Accepted Shape | Owner | Test`

## Spice And Band Guidance

The spicy-world distribution changes how often bands are rolled in play. It does not mean every row should become weird.

Each row should honestly live in its band:

| Band | Meaning |
|---|---|
| Grounded | Mundane, concrete, human pressure. Never filler. |
| Textured | The world tilts; something is off but nameable. |
| Strange | Uncanny and consequential; reality tilts. |
| Volatile | Local reality strains; consequences escalate. |
| Mythic | Reality breaks or becomes world-marking; ledger-worthy. |

Grounded rows must still be playable. Use scarcity, law, debt, weather, injury, jealousy, witnesses, deadlines, custody, bargains, blocked routes, and material stakes.

High-band rows should not just add spooky adjectives. They should introduce a reframe, a clock, a cost, a concrete cosmic image, or a state change the world remembers.

## Lint Stance

The linter should enforce structure, not taste.

Good structural checks:

- table has an explicit `table_family`
- table has `row_contract: draft` or `row_contract: enforced`
- table has a valid `remembers:` bucket
- required family roles are present
- required cells are non-empty

Bad checks:

- banning vague words
- judging prose quality
- pretending a lens/grammar/contract table is a runtime content row

Use `draft` as the worklist state. Flip to `enforced` only after the table earns its anatomy.

## Short Version

Use the five anatomies for rows the DM/player experiences directly.

Exempt or add small later families for rows that feed another system.

Every playable row should show something concrete, invite action, create pressure, and leave a mark.
