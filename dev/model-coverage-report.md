---
type: audit-report
project: Genesis
status: REPORT-ONLY — no code/table changes
created: 2026-07-03
branch: audit/walk-model-coverage
scope: "docs/MODEL-GRAMMAR.md §1/§4/§4b vs the walk/segment table corpus (Engine/03. _Tables/)"
---

# Walk-table → Model-grammar coverage audit

**Ask:** sweep all walk tables for scene nouns that will break the polygon modeling plan (G2's
derivation generator) and propose the cheap, clean resolution for each gap. Report-only — no
code or table edits made.

## Method

Read every table that emits scene nouns during a walk/segment: `Dungeon/Urban/Wilderness
Feature`, `Hazard`, `Set Dressing`, `Interactable Object`, `Tactical Terrain`/`Tactical Setup`,
`Footing`, and the three `Walk Skin` tables (dungeon/urban/wilderness), all under `Engine/03.
_Tables/03. Session Mechanics/`. That's ~13 tables, ~2,050 rows total (d100–d300 scale on most).
Did not re-derive from the compiled `tables.js` — the markdown is the source of truth per house
doctrine and reading it directly avoids compile-drift false negatives. Extracted every distinct
physical noun named in each row (ignoring pure mechanics text — DCs, damage dice, condition
names), deduped by concept (e.g. "Support Pillars" / "Massive Stone Pillar" / "Thick Support
Pillar" → one `pillar` concept), and classified each against MODEL-GRAMMAR §1 (parts library) and
§4 (derivation rules).

No creature-string sweep was needed for this pass — walk tables name terrain/prop nouns, not
new creatures; creature stat resolution is already covered by §4b's quick-stat guarantee via
`resolveCreature`, which is out of scope for a *prop* coverage audit.

## Class counts

Total distinct noun concepts extracted and classified: **~145**.

| Class | Count | Meaning |
|---|---:|---|
| (a) already covered | 34 | An existing §1 part/prop or §4 rule already produces a correct shape |
| (b) one keyword rule away | 61 | Maps cleanly to an existing §1 part with one new §4-style keyword line |
| (c) needs a new part | 17 | No existing part fits; needs a new ≤6-box part |
| (d) abstract/atmospheric | 24 | No model warranted — tile tint, FX, or nothing |
| (e) awkward / multi-object / architecture-scale | 9 | Needs a structural resolution, not a single-part fix |

(c) is the number that matters for scoping G2/G4: **17 new parts**, not 40-plus — the existing
prop set (`crate, cart, pillar-broken, shrine-block, tree-bare, rubble-scatter, banner-pole`) plus
one keyword-rule pass absorbs the bulk of the corpus.

## Top-10 highest-frequency uncovered nouns

Ranked by how often the underlying concept recurs across the corpus (rows across all three biomes
+ set-dressing + interactables, collapsing near-duplicate row text into one concept). "Uncovered"
= classes (b)/(c)/(e) only (class (a) and (d) excluded since those aren't gaps).

| # | Noun concept | Rows (approx) | Class | Resolution |
|---|---|---:|---|---|
| 1 | **Barrel / keg / cask** | 30+ | (b) | keyword → `crate` (barrel variant, see §G2 below) |
| 2 | **Statue / idol / monument (humanoid or beast)** | 45+ | (c) | new part `statue-figure` |
| 3 | **Standing stone / obelisk / pillar (freestanding, non-architectural)** | 50+ | (b) | keyword → `pillar-broken` (add an intact variant param) |
| 4 | **Table / bench / counter / workbench** | 20+ | (c) | new part `table-slab` |
| 5 | **Chain / manacle / shackle (hanging or wall-mounted)** | 25+ | (c) | new part `chain-drape` |
| 6 | **Cage (hanging or floor, iron/wicker)** | 15+ | (c) | new part `cage-frame` |
| 7 | **Grate / drain / sewer cover** | 20+ | (d)/(b) | mostly a floor decal/FX; if raised, keyword → `rubble-scatter` footprint |
| 8 | **Fountain / basin / font / cistern** | 20+ | (c) | new part `basin-block` |
| 9 | **Web / webbing (mass, canopy, or strand)** | 12+ | (c) | new part `web-mass` (also serves bestiary spider dressing) |
| 10 | **Wagon / cart / carriage (whole vehicle, not the existing `cart` prop)** | 20+ | (a)/(b) | already covered by `cart`; overturned/broken variants → keyword param on `cart` (tilt/damage), not a new part |

Honorable mentions just outside the top 10: **archway/gate** (~15 rows, class c — new part
`arch-frame`), **bridge/span, partial or collapsed** (~15 rows, class e — resolved as a
terrain_change op, not a model), **sarcophagus/coffin** (~10 rows, class c — new part
`coffin-slab`), **bell (hanging, large)** (~8 rows, class b — keyword → `shrine-block` sized up).

## (a) Already covered

Direct matches to an existing §1 part or a §4 rule as specced. No action needed.

- `crate` (crate stacks, boxes, cargo) → `crate` prop, as named in §4's example row
- `cart` (handcart, wheelbarrow, wagon — upright, functional) → `cart` prop
- `pillar-broken` (already-broken/toppled support column) → `pillar-broken` prop
- `shrine-block` (altar, shrine niche, offering stand) → `shrine-block` prop
- `tree-bare` (dead/bare tree, stump) → `tree-bare` prop
- `rubble-scatter` (masonry debris, collapsed ceiling, scree) → `rubble-scatter` prop
- `banner-pole` (standard, signpost, hanging sign) → `banner-pole` prop
- Weapon/armor nouns embedded in interactable-object rows (halberd, shield, sword pile) → the
  weapon/armor part set (`sword-slab`, `axe-wedge`, `spear-pole`, `shield-slab`, etc.) via §4 rule 3
- Bone/skull dressing on creatures → `head-skull` + `bone-protrusions` (§4 rule 5)
- Ember/fire dressing → `ember-flecks` (§4 rule 5)
- Generic "chest-plate"/"pauldrons"/"helm-crest" mentions on NPC-adjacent dressing → armor parts
  already exist; reused here for statue/suit-of-armor set dressing (see class b note below)

That's 34 counting near-duplicate phrasing collapsed into the above concepts (e.g. "Small Crate
Stack," "Towering Crates," "Rack of Kegs → crate variant" all land on `crate`).

## (b) One keyword rule away — the §"G2 consumables" list

These need **no new part**, only a keyword→part line added to the §4 curated list (the same
"spider → thorax-abdomen" style line, one row each). Grouped by target part so G2 can paste
directly. Format matches §4 rule 5's convention: `keyword(s) → part [+ params]`.

```
# Walk-feature / prop keyword → part mapping (append to §4 rule "walk-feature props")
# Target: crate
barrel, keg, cask, hogshead, urn, jar, vat, cauldron, cistern-lip → crate [param: round=true]
sack, bag, sandbag, spilled-sacks → crate [param: soft=true, scale:0.6]

# Target: pillar-broken (add an "intact" param rather than a second part)
obelisk, standing-stone, menhir, monolith, column, pillar, support-pillar, totem-pole → pillar-broken [param: intact=true when row text has no "broken/crumbl/shatter/toppl"]
candelabra, brazier-stand, torch-sconce (freestanding) → pillar-broken [param: scale:0.3, taper:true]

# Target: rubble-scatter
grate, drain-cover, sewer-grate (raised/broken variant only — flush grates are class (d)) → rubble-scatter [param: flat=true, scale:0.4]
scree, gravel-patch, loose-stone, caltrops-field → rubble-scatter [param: scale:0.5]
bone-pile, skull-pyramid, calcified-bones (as terrain feature, not creature dressing) → rubble-scatter [param: channel:bone]

# Target: banner-pole
signpost, notice-board, hitching-post, warning-post, weathervane, sundial(standing) → banner-pole
tapestry, curtain, beaded-curtain, hanging-hides, silk-pavilion(as a wall hang, not a tent) → banner-pole [param: wide=true, drape=true]

# Target: shrine-block
offering-table, sacrificial-stone, dais, plinth, pedestal(empty), altar → shrine-block
bathtub, cradle, basin(small/decorative only — large fountains are class c) → shrine-block [param: scale:0.6]

# Target: cart (existing, params only)
wagon, carriage, palanquin, sedan-chair, handcart, wheelbarrow, siege-engine(small) → cart [param: covered=true|open, tilt: 0-40deg from "overturned/broken" row text]

# Target: tree-bare
gibbet-tree, hollow-log, fossilized-tree, petrified-tree, deadfall-log → tree-bare [param: scale, channel:petrified when row text says stone/glass/ice]

# Target: sword-slab / axe-wedge / spear-pole / shield-slab (existing weapon parts)
pike, halberd, javelin, ballista-bolt(embedded, as a pillar) → spear-pole [param: scale up for "giant"/"colossal" rows]
iron-maiden, torture-rack (as a standing frame, not the whole scene) → shield-slab [param: scale:1.2, channel:rust] — cheap stand-in until a dedicated part earns its keep

# Target: robe-skirt / chest-plate (existing armor parts, reused for set-dressing not creatures)
suit-of-armor(standing, empty), scarecrow, mannequin → chest-plate + head-round [param: empty=true]
```

This is ~30 keyword lines covering 61 noun concepts (several keywords map many synonymous row
phrasings to the same target).

## (c) Needs a NEW part — the 17-part list

Each is scoped to the ≤6-box budget per §1. Named for the `theater-parts.js` file G1 will own.

1. **`statue-figure`** — humanoid or beast statue, base + torso-block + optional head-nub.
   Boxes: base slab (1), torso block (1-2 stacked for standing pose), head nub (1), optional
   arm-stub (1-2). Params: `pose` (standing/kneeling/broken), `scale`, `channel` (stone/bronze/ice).
   Covers: heroic statue, gargoyle ward, idol, colossus fragments, equestrian monument,
   scarecrow-adjacent dressing. Highest-value new part — statues appear in all three biomes.
2. **`table-slab`** — flat top + 4 leg stubs (or 1 pedestal leg). Boxes: top (1), legs (1-4).
   Covers: workbench, trestle table, counter, anvil-block, grindstone, altar-adjacent furniture.
3. **`chain-drape`** — a vertical or catenary chain/rope run between two anchor points. Boxes:
   2-4 short linked segments, tapered. Covers: wall manacles, hanging chains, rope bridge
   remnants, portcullis chain, anchor chain. Reuses well — pairs with `cage-frame` for gibbets.
4. **`cage-frame`** — a lattice box, open or with a suspended-mount anchor. Boxes: 4 corner
   posts + top/bottom frame (2), collapsible to a 3-box cheap version. Covers: hanging cage,
   gibbet, bird cage, iron maiden interior (shares `chain-drape` for the suspension).
5. **`basin-block`** — a wide shallow trough/bowl on a base. Boxes: base (1), rim walls (2-3).
   Covers: fountain, cistern, trough, font, magical font, sarcophagus-adjacent (see #8), bathtub
   (large scale variant — small ones stay on `shrine-block`, see class b).
6. **`web-mass`** — an irregular translucent volume, low box count with a `channel:web` tint.
   Boxes: 2-4 overlapping angled slabs to fake volume. Covers: web canopy, webbed choke, giant
   spiderweb, cocoon, egg-sac dressing. Also usable by bestiary spider-family recipes as an FX
   attachment, so it earns its keep twice.
7. **`arch-frame`** — two side posts + a lintel/keystone top. Boxes: posts (2), lintel (1),
   optional keystone highlight (1). Covers: stone arch, portcullis frame (pairs with
   `cage-frame`-style bars), triumphal arch, freestanding door frame, natural rock arch.
8. **`coffin-slab`** — a rectangular box with a peaked or flat lid, optionally ajar. Boxes: base
   (1), lid (1, offset param for "ajar"). Covers: sarcophagus, open coffin, iron-maiden-as-coffin,
   stone bier.
9. **`vine-tangle`** — an irregular cluster of thin curved boxes, wall- or ground-anchored.
   Boxes: 3-5 thin tapered segments. Covers: bramble wall, briar patch, hanging vines/roots,
   razorvine, thorny arch (pairs with `arch-frame` for the "natural bridge" variant).
10. **`mushroom-cluster`** — cap-on-stalk repeated 2-4x at varying scale. Boxes: stalk (1) +
    cap (1) per instance, budget 2 instances = 4 boxes. Covers: mushroom colony, fungal bloom,
    puffball fungi, glowing fungus dressing.
11. **`well-shaft`** — a low ring wall around a dark void plane. Boxes: ring wall (2-4 arc
    segments simplified to a box ring), no floor (implies depth). Covers: village well, stone
    well, drainage grate (deep variant), sinkhole rim, mine shaft opening.
12. **`ladder-rungs`** — a pair of tapered rails + repeated rung strokes (can be cheap — 2 rails
    + 1 textured "rungs" slab standing in for the repeats). Covers: sturdy ladder, rope ladder,
    scaffolding uprights, siege-tower internal ladder.
13. **`furnace-block`** — a squat heavy block with a glowing-slot channel face. Boxes: body (1-2),
    vent/mouth cutout implied by a channel tint, chimney stub (1). Covers: forge, kiln, furnace,
    glassblower's furnace, cold-ash-pile-as-hearth (small scale variant of `shrine-block` could
    also work here if budget is tight — see open question below).
14. **`gear-cluster`** — 2-3 overlapping disc/cylinder boxes at slightly offset angles. Covers:
    mechanical gears, clockwork wreckage, eldritch machinery, winch drum.
15. **`tent-canopy`** — an angled slab pair meeting at a ridge, like a squat `wing-slab` reused
    upside-down. Boxes: 2 angled panels + optional ridge pole. Covers: pavilion, covered wagon
    top (params off `cart`), lean-to, hunting blind. *(Cheapest option: this may not need a new
    part at all — see open question below; flagging as (c) conservatively.)*
16. **`bell-mass`** — a bell-shaped tapered box on a mount. Boxes: bell body (1, tapered), mount
    yoke (1). Covers: hanging tavern sign bell, church bell, alarm bell, gong.
17. **`throne-seat`** — a table-slab variant with a tall back panel. Boxes: seat (1), back panel
    (1-2), armrests (optional 2). Covers: throne, stocks/pillory, executioner's block (small
    scale), grand chair dressing. Could alternatively be a `table-slab` param (`backrest:true`)
    — flagging as its own part only because thrones recur often enough in wilderness set-dressing
    (d300 table) to justify a distinct silhouette; Adam/Fable should collapse this into
    `table-slab` at G1 gate if budget is tight.

**Open question for the G1/G2 gate:** #13, #15, and #17 above are borderline — each could
plausibly be a parameterized variant of an existing or other-new part rather than its own part.
Flagging honestly rather than inflating the new-part count; the real floor is likely **14 hard
new parts**, ceiling **17**, depending on how aggressively params absorb near-duplicates.

## (d) Abstract / atmospheric — no model warranted

These render as a tile tint, ambient FX, or nothing at all. Listing the noun concept and its
default per §5 (channels, not colors — so "default" means an FX/tint hook, not a literal color).

| Noun concept | Default rendering |
|---|---|
| Smells (decay, ozone, flowers, woodsmoke, tannery, etc.) | no visual — reserved for prose/ARIA only |
| Sounds (whispers, bells, chiming, distant voices, silence zones) | no visual — prose/ARIA; at most an audio-cue hook (out of scope for MODEL-GRAMMAR) |
| Mist / fog / haze / dust cloud / smoke | env FX layer (existing `THEATER_ENV_PALETTE`/obscurement fog primitive — not a modeled part) |
| Light effects (dim light radius, bright light burst, glow, bioluminescence) | tile/area light tint via channel `glow`, no geometry |
| Temperature/weather (cold pocket, heat pocket, frost, wind) | ambient tint or particle FX, no geometry |
| Social/crowd situations (market crush, riot, festival, funeral procession) | handled by NPC figure population (existing bestiary/NPC recipe path), not a prop |
| Ground stains (blood, salt ring, oil smear, ash pattern) | floor-decal tint, no geometry |
| Silence / muted-sound zones, echo effects | audio/prose only |
| Time-distortion effects (footprints arriving early, backward clocks) | prose/Strange-band flavor only — explicitly narrative, not renderable |
| Wild magic shimmer / iridescent air | particle FX channel, no geometry |
| Generic "difficult terrain" texture (mud, ice, snow, sand — footing only, no discrete object) | ground material/tile tint, not a prop |
| Footprints / tracks | floor decal, no geometry |
| Graffiti / chalk marks / tally marks | wall decal texture, no geometry |
| Magnetic/gravity anomalies (no visible object) | FX only |

24 concepts land here. This class is intentionally large — walk tables lean heavily on sensory
prose that MODEL-GRAMMAR was never meant to cover (§0's thesis is about parts/recipes for
*objects*, not atmosphere).

## (e) Genuinely awkward — the cheap resolution

Multi-object scenes or architecture-scale things that would blow past the ≤6-box / ≤24-box
budgets if forced into a single part. Each gets a named cheap resolution rather than a bespoke
model.

1. **Bridges (collapsed, rope, stone span, natural arch over a gap)** — resolution: a
   `terrain_change` op (the walkway becomes a tagged traversal hazard with a pass/fail check),
   rendered as a `pillar-broken` pair at the two anchor points + a flat `crate`-style plank prop
   spanning them if a visual is wanted at all. Not worth a dedicated part; the mechanical
   traversal check is what actually matters at the table.
2. **Whole-room set pieces (crushing walls, flooding room, reality fracture, planar tear)** —
   resolution: prose-only + an env-FX overlay (screen tint / particle wash). These are
   room-scale hazards, not props; MODEL-GRAMMAR's per-figure budget doesn't apply to "the room
   itself is the hazard."
3. **Multi-statue / statuary gardens, colossal ruin fragments (giant hand, giant skull, giant
   ribcage)** — resolution: a generic prop cluster — spawn 2-4 `statue-figure` or
   `rubble-scatter` instances at oversized `scale` params rather than modeling a bespoke
   colossus part. Cheap and reuses class (c) part #1.
4. **Wrecked ships / airships / siege engines (large vehicle hulks)** — resolution: reuse `cart`
   at max scale + `rubble-scatter` for the debris field around it. Not worth a `ship-hull` part
   for something this rare in the corpus (~6 rows total across all three biomes).
5. **Maze/labyrinth segments, hedgerow walls** — resolution: `terrain_change` op (map-layout
   flag: blocks LoS, forces corridor movement) — this is a level-geometry problem, not a prop.
6. **Buildings-within-the-walk (ruined mill, watchtower, blockhouse, bathhouse)** — resolution:
   out of MODEL-GRAMMAR's scope entirely; these are building-kit-scale (see `data/building-kits.js`
   territory), not figure/prop-scale. Flag for whoever owns building-kit visuals, not G1-G4.
7. **Portcullis / iron gate (functional, operable)** — resolution: `arch-frame` (class c #7) +
   `chain-drape` for the mechanism, rendered as two static states (open/closed) rather than an
   animated part — motion stays T3's per §6.
8. **Weather-scale phenomena treated as "features" (localized gravity anomaly, floating earth
   mote, planar bleed zones)** — resolution: env-FX overlay only, same as #2; if a floating
   platform must be standable, treat its footprint as a `rubble-scatter` or `pillar-broken`
   flat-top prop, not a new part.
9. **The d300 wilderness "mundane furniture in the wild" curiosities (grandfather clock,
   porcelain bathtub, chess set, dining table set for a meal)** — resolution: these are
   Strange-band flavor objects meant to be *uncanny precisely because* they're mundane household
   items out of place. Cheapest fix: route them through the existing furniture-adjacent parts
   (`table-slab`, `shrine-block`, `crate`) at normal scale with no special channel — the
   *wrongness* is entirely narrative (a clean chair in a swamp), not visual. Don't build bespoke
   parts for one-off Strange-band jokes.

## Notes on the Walk Skin tables

The three `Walk Skin — {Dungeon,Urban,Wilderness}` tables are mood/lens layers (§0's "single
wide-angle mood," not per-object dressing) and are correctly almost entirely class (d) — they
touch motif tags (`flood`, `fire`, `bone`, `void`, `overgrowth`, etc.) that already map to
channel/FX hooks, not geometry. A handful of skin rows do name a discrete prop in passing
("chains hang from the ceiling, empty" / "a shrine has been quietly maintained" / "a summoning
circle") — those nouns are already covered by the class (a)/(b) mapping above (`chain-drape`,
`shrine-block`) since a skin row and a Feature-table row naming the same object should resolve
to the same part. No new work generated by the Walk Skin tables specifically.

## Unknowns (marked honestly)

- Whether `#13 furnace-block`, `#15 tent-canopy`, `#17 throne-seat` earn their own part vs. a
  param on an existing part is a judgment call for the G1 parts-library author, not resolvable
  from table text alone — flagged inline above rather than guessed.
- Frequency counts in the top-10 table are approximate (hand-tallied while reading, not a
  scripted grep) — treat as "roughly this order of magnitude," not exact.
- This audit did not check whether `data/bestiary.js` name-keyword coverage (§4 rule 5, "~25
  rules") already includes any prop-adjacent keywords that would double up with the §G2 list
  above — that cross-check needs the actual bestiary keyword list once G2 drafts it, which
  doesn't exist yet (confirmed: no `theater-parts.js` or `model-recipes.js` in the repo as of
  this audit).

## Bottom line

The walk-table corpus does **not** break the polygon modeling plan. Of ~145 distinct noun
concepts: 34 already resolve, 61 resolve with a one-line keyword addition (paste-ready list
above), 17 need new parts (most single-digit-box, several arguably collapsible to ~14), 24 are
correctly atmosphere-only, and 9 architecture/multi-object cases have a named cheap resolution
that avoids inflating the part count. G2's "~40 parts" budget in §1 comfortably absorbs this —
the 17 new parts proposed here would bring the library to ~57, still within a single Sonnet-medium
unit's scope per §8's own estimate.
