STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

# Lane 4 — What the engine already rolls for a dormant place

type: research-lane
date: 2026-07-27
status: COMPLETE for this pass
method: read the **Engine markdown sources** (never `tables.js` / `tables.json`) plus the
live roller files under `src/engine/` and `src/world/`; cross-checked against
`docs/GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md` status vocabulary.

This lane exists because the Site 3 concept doc was written before anybody counted what the
engine can already produce. The count changes the site's job.

## Method and honesty note

`src/engine/dungeon-walk.js` was read for its table ids (a literal string extraction, not a
guess). Engine table markdown was grepped for the rows quoted below. Where a table id appears
only in `data/table-usage.js` / `data/table-atlas.js` — which are *generated* artefacts — it
is recorded as `AUTHORED-UNWIRED`, because presence in a generated index is not a caller.

## Finding 1 — the dungeon walk already rolls the whole condition vocabulary

`rollDungeonWalk` consumes, among others: `dungeon-type`, `dungeon-origin`,
`dungeon-topology`, `dungeon-area-type`, `room-elevation-profile`, `dungeon-feature`,
`dungeon-interactable-object`, `dungeon-set-dressing`, **`dungeon-set-dressing-condition`**,
`dungeon-lighting`, `dungeon-sensory`, `dungeon-hazard`, `dungeon-empty-result`,
`dungeon-exit-state`, `dungeon-secret-*`, `dungeon-discovery-*`, `dungeon-lore-*`,
`dungeon-revelation`, `dungeon-narrative-device`, `dungeon-threat-identity-t1/t2`,
`dungeon-boss`, `dungeon-contact`, `dungeon-problem`, the loot family, and
`walk-skin-dungeon`.

`dungeon-set-dressing-condition` (d20) is already a **condition roller**, with families
Fresh / Decayed / Waterlogged / Burned-Scorched / Tampered / Uncanny and prompts like
"rot-softened; fibers flake off when touched", "swollen wood/cloth; seams bulge", "retied /
rebolted / resealed — tool marks are fresh", "staged as a marker: placed to be noticed (or to
mislead)".

Read that last pair again. **Tampered** is the engine already modelling *someone came back
and interfered* — which is the ROBBED / transient-claimant vector, live, today.

## Finding 2 — `dungeon-area-type` already contains the funerary and ruin room programs

Real rows, quoted from `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md`:

| row | program | why Site 3 cares |
|---:|---|---|
| 156 | **Crypt** — 30'×40' rectangle; 10'×20' charnel alcove at the far end; **twelve stone sarcophagi set into the walls in two tiers** | this is the loculus-tier grammar from image DA-10, already authored |
| 157 | **Tomb** — 20'×30'; a false tomb trap-room behind a concealed door; the main sarcophagus is a hinged access panel | the tomb's "getting in is the problem" inversion, already authored |
| 154 | **Temple** — with a 10'×10' crypt accessed via a floor hatch beneath the altar | the crypt as a *hosted* sub-volume under another host |
| 182 | **Flooded Chamber** — 2 ft standing water throughout; 10'×10' dry platform 3 ft above floor | the FLOODED vector with a datum and a dry island |
| 125 | Natural Passage with a 5'×5' side sump **dropping into a flooded lower chamber** | the water datum sorting the site by height |
| 130 / 140 | Cave/Cavern containing a **collapsed / ruined dungeon structure sitting partially intact**, walls still 8–10 ft high | an inherited built shell inside a natural void — the Site 3 × Site 7 seam |
| 136 | Reinforced Cave — timber and stone shoring, **5'×10' collapsed section where shoring has failed** | support failure as a located, causal event |
| 004 / 034 / 057 | corridors and chambers with **collapsed sections that narrow or block an exit** | the breach/blockage pair, already dimensioned |
| 065 / 075 | chambers with a hearth or fireplace, **flue collapsed, ash still present** | the surviving-hearth reading from image DA-3 |
| 148 | Barracks with **eight ruined bunk frames** | de facto refuse, already authored |
| 168 | Treasury whose inner room **shows signs of hasty looting** | exit mode expressed as evidence |
| 167 | Vault — main door iron-banded stone, **three locks, all intact** | the SEALED vector |
| 179 | Gallery Overlook, **two railing sections collapsed** | selective damage on a deck |

## Finding 3 — `dungeon-feature` already carries the tactical ruin kit, with numbers

From `Dungeon Feature.md` (d150), the **Crumbled Masonry** family alone gives: a collapsed
arch spilling 5'×15' of rubble at 3' high (difficult terrain, half cover); a 10' wall gap with
a climbable rough face; an unstable 5'×5' mound that collapses on a failed DC 10 Dex; a
10'×10' ceiling-collapse heap 5' high **whose top grants elevation for ranged attacks**; and
a 3'-wide, 8'-long rubble ramp rising 5'.

That last pair is the collapse-cone finding from Lane 2 and the Lair study's breakdown-ramp
rule, *already in the table with dimensions and a DC*.

Also live: **Support Pillars** with explicit collapse thresholds ("cracked one collapses at
15+ damage"; "Thunder damage causes partial collapse"); **Sarcophagus** with six distinct
seal states — carved lid, sealed tight with mortar, lid slightly ajar, **chisel marks suggest
recent tampering**, relief carvings identifying the occupant, cracked corner revealing the
interior; **Collapsed Bridge** in four variants with gaps, stubs and decline angles;
**Drainage Grate** with a 10–15 ft drop to a water channel; **Stagnant Pool**; **Refuse Pile**
with a hideable crate interior.

The sarcophagus seal states are precisely the "one swappable panel per void" state machine
that image DA-10 induced — the engine authored it first.

## Finding 4 — `dungeon-empty-result` is already an abandonment-reading table

The d20 has, verbatim: **Faded Wall Markings** ("peeling designs hint at original purpose —
gain a minor piece of local lore"), **Abandoned Debris** ("broken wood, rusted iron, old rope
— gain 1 mundane supply"), **Natural Overgrowth** ("pale lichen or vines claim the corner —
nature sign points toward water/airflow/hidden cavity"), **Inert Machinery** ("seized
gears/pipes/vents — indicates the dungeon's function"), **Dust Shadows**, **Loose Masonry**,
**Draft of Fresh Air** ("a faint breeze suggests a crack or route"), **Hollow Footfalls**.

Every one of those is *reading the remains of a working place*. The invariant "former purpose
remains readable" is not a new build — it is a table that already exists and is already live
on the empty branch, which is 10.0 % of dungeon segments per the census.

## Finding 5 — `dungeon-lighting` already supports the causal light law

Rows include four distinct **Pitch Black** variants ("total darkness — sound becomes your
map"; "the dark has gradients — barely — like deep water"), **Shadow-Heavy** ("shadows pool
in dips like dark liquid"), **Lantern Cones** ("hard cone of light; beyond it is velvet
dark") and **Torchlit Warmth** ("warm light pools in *islands* between dark gaps").

The "islands between dark gaps" phrasing is the same composition my read of image D5-01
produced independently. The table is already Diablo-1-shaped.

## Finding 6 — hazards already model the dormant failure modes

`Dungeon Hazard.md`: **Brittle Masonry** (ceiling section, DC 13 Investigation to notice
first), **Structural Groan** ("10'×10' area below unstable ceiling … heavy impact or Thunder
damage → collapse, Restrained under rubble"), **Collapsing Ceiling**, **Flash Flood** ("crack
failure; sudden roar as warning"), **Slick Lichen**, **Yellow Mold**, **Corrosive Seepage**,
**Soot-Haze**, **Light-Eater Mist**.

Structural gambling — one of the four strategic levers the spec proposes — already has its
mechanics.

## Finding 7 — the condition axis exists in the other two walks too

- urban: `urban-set-dressing-condition` is consumed in `src/engine/walk.js`; `urban-type` has
  the **Ruined Quarter** district (9.3 % of urban rolls);
- wilderness: `wilderness-set-dressing-condition` and `wilderness-sign-of-passage` are
  consumed in `src/engine/wild-walk.js`;
- world/place: `place-drift` is consumed in `src/world/turn.js` (`LIVE`); `place-history` and
  `place-secret` are consumed in `src/engine/codex-roll.js` (the codex/oracle path);
- `dungeon-door-state` is referenced in `src/world/wiring-b.js` — reference verified, caller
  path **not** confirmed in this pass; the spawn-audit lane should resolve it;
- `art-condition` (d100) and `dungeon-secret-type` appear only in the generated
  `data/table-atlas.js` / `data/table-usage.js` → `AUTHORED-UNWIRED`.

## The verdict, and what it changes

**Site 3's shopping list is mostly already bought.** The engine can already roll a crypt with
tiered sarcophagi, a flooded chamber with a dry island, a collapsed arch that grants ranged
elevation, a cracked pillar with a damage threshold, a sarcophagus with tool marks on the
lid, a pitch-black room, a structural groan, and a wall marking that tells you what the place
used to be.

**What it cannot do is make those rolls agree with each other.** There is no fact in the
walk that says *why this place stopped*, *how the people left*, *how long ago*, *how far the
decay has gone in this particular zone*, or *who has been through since* — so a segment can
legally produce a freshly-tampered sarcophagus in a room with an intact triple-locked vault
door next to a chamber where the shoring failed, and nothing connects them.

That reframes the site's real job:

> Site 3 is not a geometry program. It is a **coherence layer**: a small set of committed
> causal facts (cause · exit mode · elapsed band · per-zone rung · vectors · reclaimer) that
> the existing live rollers are *biased by* and *validated against*, so that the condition
> content the engine already produces tells one story instead of twenty.

That is a much cheaper and much more valuable build than a ruin kit, and it is the reason the
spec's first proof is a *comparison pair* rather than a pretty ruin.
