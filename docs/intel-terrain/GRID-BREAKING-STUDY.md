---
type: research-study
project: Genesis
status: DRAFT — Opus lane 2026-07-28, read-only study, nothing authorized
created: 2026-07-28
commissioned-by: Adam, 2026-07-28 — "how does xcom handle shape variation? how do the actual
  modular tabletop piece handle it? because we gotta have a world that isn't just big chonky
  blocks, we need some subtlety, even if it's just dressing or trickery"
grounded-in:
  - Genesis-terrain/docs/ART-DIRECTION-CANON.md
  - Genesis-terrain/docs/BATTLEMAP.md
  - Genesis-terrain/docs/DESIGN-GUIDE.md
  - Genesis-terrain/docs/GOLDEN-SITES-CATALOG.md (the three dressing bins)
  - Genesis-terrain/docs/URBAN-STUDY-BRIEF.md (the three dressing bins, defined)
  - Genesis-terrain/src/engine/terrain-field.js (TERRAIN_GRID_LAW, TERRAIN_WALK_NOISE_BUDGET_H)
  - Genesis-clayspec/docs/GROUND-MATERIALS-PROGRAM.md
  - Genesis-clayspec/docs/TERRAIN-PROGRAM.md §2.0 / §2.1 / §4
  - Genesis-briefs/docs/MESHY-WILDERNESS-SETPIECE-QUEUE.md
  - Genesis-briefs/docs/MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md
---

# THE GRID-BREAKING STUDY

How two other grid-quantized systems — one digital (XCOM), one physical (modular tabletop
terrain) — stop reading as a box of squares, and which of their devices Genesis can take
**without new geometry and without touching gameplay**.

---

## §0. The frame, and the one number that decides the whole argument

Adam's licence is the point: *"even if it's just dressing or trickery."* This study takes that
seriously and answers non-geometrically wherever an honest non-geometric answer exists.

There is a number in Genesis's own code that makes that the *only* honest answer on walkable
ground. `src/engine/terrain-field.js` derives, from `TERRAIN_GRID_LAW` plus the 30° walkable
limit:

```
TERRAIN_WALK_NOISE_BUDGET_H.perCellH = (tan(30°) × 5 / 2.5 − 1) / 2 = 0.0774 h
```

With `h = 2.5 ft`, that is **0.193 ft — about 2.3 inches of surface relief per walkable cell.**
The comment in the file says it plainly: surface break-up on a walkable cell may spend at most
half the sub-quantum headroom; a *guarded* cell (never standable) spends the full amplitude.

So: **on ground the player can walk on, the engine's own law permits roughly a cobblestone's
worth of shape and nothing more.** Every "make it less blocky" idea that reaches for relief on
a walkable cell is either illegal or is a gameplay change in disguise. That is not a limitation
to route around — it is the finding that makes this a *dressing* study rather than a geometry
study, and it is the sentence to lead with if Adam asks "why isn't the answer just better
shapes."

### §0.1 The three dressing bins (the sorting used throughout)

Per `GOLDEN-SITES-CATALOG.md` (site pipeline step 3: *"dressing sorted into the three bins
(material / decal-paint / prop)"*) and `URBAN-STUDY-BRIEF.md` lane 2, which defines them:

| bin | what it holds |
|---|---|
| **material** | a §8-style demand slot — a surface family, its channels, its scale, its condition |
| **decal / paint** | flat surface marks: signage, grime bands, wheel ruts, doorstep wear, staining |
| **prop** | placed objects: awnings, barrels, laundry lines, lanterns, rubble, plants |

Everything below is sorted into one of those three, or flagged **geometry** (which means it
leaves this study and joins the FFT surface-grammar lane, §5).

### §0.2 The constraint that separates Genesis from XCOM

**Genesis shows its grid. XCOM hides its.** In XCOM the lattice appears only on the movement
and targeting overlay; in normal play there is no drawn grid to betray a seam. Genesis's grid
is permanent and ruled: `GROUND-MATERIALS-PROGRAM` §3e records Adam's 2026-07-26 ruling that
the grid overlay is *"composited after the ground blend, unchanged — surface-clipped,
alpha-weighted multiply, depth-tested,"* and that it must stay legible over the darkest patch
family. `BATTLEMAP.md` and the exact-cell supersession make the grid the tactical reading
instrument.

That single difference decides which XCOM devices transfer. Applied honestly in §1.7.

---

# §1. XCOM

Sources: Brian Hess (Lead Level Designer, Firaxis), *Plot and Parcel: Procedural Level Design
in XCOM 2*, GDC 2018 — slide deck at
<https://media.gdcvault.com/gdc2018/presentations/Hess_Brian_PlotAndParcel.pdf> (deck text
extracted directly for this study); talk page
<https://gdcvault.com/play/1025387/Plot-and-Parcel-Procedural-Level>. Justin Rodriguez (Senior
Environment Artist, Firaxis), *Environment Storytelling in XCOM 2*, 80.lv —
<https://80.lv/articles/environment-storytelling-in-xcom-2>. Tile unit and modding detail:
<https://wiki.nexusmods.com/index.php/XCOM_2_Tile_Overlay_Tutorial>. Cover behaviour:
<https://steamcommunity.com/app/268500/discussions/0/412446292764088557/> and
<https://www.ufopaedia.org/index.php/Cover_(EU2012)>. Destruction:
<https://github.com/long-war-2/lwotc/wiki/Environmental-Damage---How-it-Works>.

## §1.1 The grid is 96 units. The art is authored to 80.

This is the single most transferable thing in the whole study, and Rodriguez states it
outright:

> "Instead of making cover props that were 96 units by 96 units, the entire footprint of one
> grid tile, we started authoring props to sit in an 80 unit by 80 unit space. That way we had
> 16 units to play with for anything that broke the silhouette of the cover piece like handles
> on a crate, etc."

An XCOM tile is 96 Unreal units. The **authoring box is inset to 80×80**, and the 16 units of
difference are a *declared silhouette budget*: handles, lids, straps, pipes, corners — anything
that makes the crate stop being a crate-shaped box — spend that budget and still land inside
the tile the game reasons about.

That is the whole trick, stated as a production law rather than as an art intention. The
tactical footprint and the visual bounding box are **two different numbers**, and the second is
allowed to be bigger.

Genesis translation, exact: 16/96 = 1/6 of a cell. A Genesis cell is 5 ft / 1 world unit, so
the equivalent allowance is **0.833 ft ≈ 10 inches ≈ 0.167 world units**, split as ~5 inches
per side. That is not a lot. It is enough to stop a box being a box, which is precisely what it
bought XCOM.

## §1.2 The seam and the wall-top are free volume

Two more Rodriguez quotes, and together they are the second big device:

> "The walls of buildings in the game were thin in order to work with all the systems and stay
> out of the way of pathing and cover generation."

> "We started framing the top of walls with cabinets, pipes and venting systems, where the
> cover wasn't generating and the soldier couldn't pass."

> "We started using our decoration dimensions to string additional deco and additional details
> on larger props along the grid lines using our wall dimensions so the deco wouldn't bother
> the pathing or cover the neighboring tile."

The reasoning is mechanical, not aesthetic. Walls are thin because thick walls fight pathing
and cover generation. Thin walls leave a **volume nobody occupies** — the seam between cells,
and the band above head height where no soldier walks and no cover generates. That volume is
free, and XCOM filled it with the fattest, most silhouette-breaking dressing in the game.

The doctrine underneath, in his words:

> "The lines were there when you needed them and were really helpful as a foundation, but I got
> so used to them being there that I would find really cool ways to hide the lines with art."

And the honest one:

> "Making levels and props for the game became similar to drawing on a piece of graph paper."

## §1.3 Cover is a line on the grid, not an object in a cell

The mechanical fact that licenses all of the above: **cover is directional and lives on the
grid lines.** The Steam and UFOpaedia community documentation is consistent — cover is a
property of the boundary the fire crosses, not of the mesh sitting near it, and the game tests
the shooter's angle relative to that line. Position within the covering object's frontage
matters for the *angle* bonus (an edge tile gives a different read than the centre tile), but
the cover flag itself is an edge fact.

Consequence: the mesh expressing that edge is under no obligation to be any particular shape.
A wall, a car, a planter and a stack of crates can all express the same cover line, at any
mass, with any overhang, as long as the flags on the boundary are right.

**Genesis already has this shape.** `TERRAIN-PROGRAM` §2.0's chassis rejection rules say *"a
cell whose height differs from an orthogonal neighbour by 2h+ **must** own a face piece."* The
face is an edge citizen. The mesh that renders the face is free.

## §1.4 Plot / parcel / PCP — assembly, and the two cheap tricks inside it

From the GDC deck, verbatim bullets:

- Components of an XCOM level: **"The Grid · Cover · Fog of War."**
- Parcels came in three buckets: **"Small parcels - 12x12 · Medium parcels - 12x24 · Large
  parcels - 24x24"** (tiles). *"Plots had spaces for each size. Parcels subdivide. Parcels have
  a random facing."*
- Plot Cover Parcels: *"Road networks converted into PCP sets. Each piece in a set had multiple
  variants. Variants were randomly selected on load."*
- Asset swapping: *"All outdoor maps created as temperate. Assets and materials would swap if
  map loaded into arid or tundra plot."*
- Shipped scale: **"XCOM 2 Shipped with 80 plots. Over 200 Parcels and 450 PCPs supporting."**
- The honest cost, from the closing slide: disadvantages were *"Limited artistic agency ·
  Cinematic unpredictability · Decreased opportunities for visual storytelling."*

Two devices inside that are cheap and separable from the assembly architecture:

1. **Random facing.** Every parcel had one. It costs nothing, needs no art, and is the highest
   variety-per-effort item on the list.
2. **Variant sets swapped at load.** 450 PCPs is a lot of pieces, but the *mechanism* — a set of
   interchangeable variants for one socket, picked by the seed — is free once the socket exists.

Note in passing, useful for scale intuition: `TERRAIN-PROGRAM` §4.1 puts the census median
arrival at 60′×80′, which is 12×16 cells — **a Genesis battle tray is between an XCOM small
parcel and an XCOM medium parcel.** (§4.1 also calls that median "96 cells", which does not
reconcile with 12×16 = 192; worth a one-line check by whoever owns that doc. Not load-bearing
here.)

## §1.5 Destruction

`lwotc` documents three destructible actor classes — **simple** (single threshold),
**fractional** (destroyed by parts; floors and walls), **annihilation** (two-stage: damaged,
then destroyed — vehicles) — against four toughness bands: decorative (any damage), standard
(5), strong (10), reinforced (15). A car at 10 toughness takes no visible damage below 5, is
*"damaged and lit on fire"* from 5–9 with 5 damage-per-turn deterioration, and is destroyed at
10+.

For this study the load-bearing observation is not the destruction system. It is that **XCOM
authored intermediate damaged states as first-class art**, and an intermediate damaged state is
a silhouette-breaker whether or not anything ever shoots it. The cheap version of destruction
is to roll the damage state **at generation time** and never simulate it. Genesis already has
the machinery: the condition vector in `GROUND-MATERIALS-PROGRAM` §2c, and Adam's 2026-07-22
ruling that everything should *eventually* have mechanical existence with *"explicit delivery
tiers."* Pre-broken is tier zero and it is free.

## §1.6 Verticality, ramps, slopes

The weakest-sourced part of the XCOM picture, and I will not overstate it. What is
well-attested: XCOM 2 uses verticality deliberately (City Center plots especially), buildings
are multi-level with roofs as a traversal layer, and — the specific claim worth carrying —
slopes were handled with care in XCOM 2 *because in Enemy Unknown they broke cover behaviour*.
I could not find a primary Firaxis source describing the ramp/z-level implementation, so I am
recording this as community-attested, not as a device to copy.

The relevant point for Genesis is that Genesis's answer here is already stricter and better
specced than anything I could import: `TERRAIN_GRID_LAW` quantizes elevation to h = 2.5 ft,
the storey to 4h, and `TERRAIN-PROGRAM` §2.0's one geometric law (≤1h across a cell is
walkable, >1h is a guarded face) makes hills and cliffs the same generator with one clamp
changed. Nothing in XCOM improves on that.

## §1.7 THE GRID-VISIBLE CAVEAT — what survives, and what does not

Applied honestly, because this is where a careless import would go wrong.

**Survives fully (the grid can stay drawn):**

| device | why it survives |
|---|---|
| **The inset authoring box / overhang allowance** (§1.1) | the overhang is a silhouette event *above the floor plane*, and the grid overlay is surface-clipped to the floor. An overhanging prop does not fight the drawn line; it casts across it. |
| **Seam-volume and wall-top dressing** (§1.2) | that volume is above the floor and never carries grid ink. Dressing there is invisible to the overlay and visible to the eye. |
| **Random facing** (§1.4) | rotation does not move a footprint. |
| **Variant sets at load** (§1.4) | variants share a socket and a footprint; the grid does not know. |
| **Asset/material swap by biome** (§1.4) | a material change is grid-blind. This is Genesis's rung-2 realm skins already. |
| **Pre-broken condition states** (§1.5) | a damaged silhouette is a silhouette. |
| **Cover as an edge fact** (§1.3) | Genesis already builds it this way (the face-piece rule). |

**Depends on the grid being hidden (do not import naively):**

| device | why it fails here |
|---|---|
| **"Hide the lines with art"** as a general licence | Genesis cannot hide its lines; they are the tactical instrument. The substitution is §2.1 — make the line look like it belongs to the world rather than to the HUD. |
| **Large cover meshes whose visual mass has no relation to the cell boundary at floor level** | with a drawn lattice, floor-level footprint ambiguity reads as a bug, not as art. Derived rule, flagged as mine: **overhang above roughly knee height reads as "a thing hanging over"; overhang at floor level reads as a lie about the footprint.** Spend the allowance high. |
| **Invisible parcel seams** | XCOM's parcel joins vanish because nothing draws a lattice to betray them. Genesis's tray edges are drawn, so tray-edge composition has to work harder than XCOM's did. |

---

# §2. Physical modular tabletop terrain

This is the closer analogue. `DESIGN-GUIDE.md` makes the game "a tabletop of miniatures," and
the fixed production camera ruled 2026-07-22 (`ART-DIRECTION-CANON`) simulates roughly the
distance a player sits from a table. **At that distance what reads is silhouette, value
structure, and the two or three biggest shapes.** Fine texture does not read — which is exactly
why the entire hobby's standard finishing method is basecoat → wash → drybrush, a technique
that costs minutes and buys value structure, rather than fine brushwork that costs hours and
buys detail nobody sees. That prioritization should shape everything below, and it does.

## §2.1 THE HEADLINE DEVICE: the grid is not drawn on the ground — the ground is made of things that agree with the grid

Dwarven Forge's product copy is startlingly close to a spec for Genesis:

- Their terrain is *"sculpted with an integral 1-inch grid for RPGs, cleverly hidden in the
  organic shapes of the pieces"*
  (<https://dwarvenforge.com/pages/new-to-dwarven-forge>).
- Wilderness sets are *"hand sculpted, organic shapes and textures, including a 1" tactical
  grid cleverly hidden in the roots, rocks, and plants"*
  (<https://dwarvenforge.com/collections/wilderness>).
- Urban ground: *"each tile has a subtle 1" grid built into the sculpt — the cobblestone grid
  is integrated into the stone pattern, while the dirt grid is hidden in the small details in
  the sculpt"* (Cities Untold ground/foundations feature page).
- Dungeon pieces have *"a 1" grid sculpted into the floors"* so tactical movement is
  unambiguous.

Read that as a design position and it is the answer to Genesis's hardest constraint. Dwarven
Forge sells to two audiences who want opposite things — grid players who need cells and
skirmish players who want an immersive board — and it satisfies both by **making the grid out
of diegetic content**: cobble courses, mortar lines, root runs, rock edges, plant clusters that
happen to fall on the pitch.

Genesis cannot stop drawing its overlay; Adam ruled it. But Genesis can decide **what the
overlay lands on.** If the paving material underneath carries a joint at the cell pitch, the
alpha-multiply line lands *on a mortar course* and the eye reads it as mortar. If it lands on
undifferentiated grey, it reads as a HUD. Same overlay, same shader, completely different
sensation — and the cost is a UV scale decision, not a system.

**The corollary, and the resolution of an apparent contradiction.** Hirst Arts' entire premise
is the opposite move: you cast and glue *individual blocks*, so the visible module is a brick,
not a tile, and the tile stops reading at all
(<https://hirstarts.com/brickdungeon/brickbasic.html>,
<https://geekdad.com/2015/11/dungeon-casting-making-modular-pieces/>). Both are right, and real
paving does both at once: setts laid in small courses, with expansion/bay joints at a much
coarser regular spacing. So the rule for Genesis is **two frequencies** —

> the fine unit (cobble, plank, brick, flag) is much smaller than the cell and never in simple
> ratio with it; **one** coarse course or bay joint sits at the cell pitch and carries the
> overlay.

That is a materials-authoring ruling, it costs a number, and it is the highest-value cheap item
in this study.

## §2.2 Multiple sculpts on a fixed footprint

Dwarven Forge Caverns: *"All the pieces have a 2x2 footprint for easy building. There's more
than one sculpt for each so your Caverns look more organic."*
(<https://www.kickstarter.com/projects/dwarvenforge/dwarven-forges-caverns-dwarvenite-game-tiles-mini>,
<https://dwarvenforge.com/collections/caverns>.)

This is the exact convergence with XCOM's PCP variant sets (§1.4), arrived at independently by
a plastics company and a AAA studio. Fixed footprint, variable sculpt, chosen at build time.

**Genesis should mostly *not* buy this for terrain, because it already has something better.**
The chassis in `TERRAIN-PROGRAM` §2.0 is parametric — `extentCells`, `cellHeightsH[]`,
`slopeClamp`, `noiseAmplitudeH`, `noiseScale`, `seed` — so terrain variation is generated, not
purchased. Where Genesis *should* buy it is **props**, which have no chassis and no morph
parameters: the top-frequency repeated props are the ones that will betray the system, and
those are the ones that earn a variant set.

## §2.3 Chamfer, bevel, arris — the cheapest thing on this list

Foam terrain practice, universally: bevel the top edge. *"Rub the side of a pen along the
outside edge of your foam blocks to bevel the sharp corners"* — it hides casting imperfections
**and** helps tiles line up (<http://www.kenthedm.com/blog/2023/7/25/making-dungeon-tiles>,
<https://nessy.info/post/2020-03-02-diy-dungeon-dragons-terrain/>). The same practice runs a
pen through the sculpted grid lines to widen and bevel them so paint catches.

Why it works: a mathematically sharp 90° edge produces a single hard value step. A broken arris
produces a *bright line* — it catches light along its length and reads as a real material that
has been handled. This is the difference between a block and a stone.

Genesis has this **already, but only on made edges**: the trim catalog's `kerb-face` slot
requires *"a worn upper arris and a soiled lower foot,"* and `earth-tread-edge` requires *"a
rounded earthen nose... wear polish at the crown"* (`GROUND-MATERIALS-PROGRAM` §4b). What this
study adds is generalizing it: **no vertical face produced by the terrain chassis should
terminate in a sharp 90°.** Every face-piece top edge gets an arris. It lives in the normal
channel; it costs no geometry.

## §2.4 The seam gets filled — and the tabletop reason why

Modular Realms' painting guide states the goal in one line: *"What I love even more is having
modular terrain that doesn't look modular :P"* — and the technique is to sieve *"light brown
and green flock with the scenery sand"* fine enough to fit between the cracks, glue into the
joints, and let it dry
(<https://www.modularrealms.com/blogs/news/painting-guide-how-to-make-realistic-mossy-stone-dungeon-tiles>).
Static grass tufts are used the same way at transitions, because their clustered organic edge
disguises where one surface treatment ends and another begins
(<https://www.wwscenics.com/static-grass-layering-system-explained/>).

**This one needs a guard, and the guard matters.** `GROUND-MATERIALS-PROGRAM` §5b's COVERAGE
LAW is explicit: *"The patch family and its extent come from the roll. Noise only shapes the
mask; it never decides whether a patch exists."* Scattering vegetation *because there is a cell
seam* would be graphics inventing a world fact — forbidden by charter §1.5 and by the coverage
law. The seam is not a crevice in the fiction.

So take the physically motivated half instead, which is fully legal and is arguably already
implied by the DEPOSITION LAW (§5c: settling families bias to *"obstruction upstream faces"*;
growth families to *"crevices, shade, damp"*):

> **Terrain face pieces are deposition anchors.** Debris settles and growth takes hold at the
> foot of a real vertical face and in real concave corners, because that is what happens to
> real ground. The chassis already knows exactly where every face is (the 2h+ rule).

That gets the silhouette break *and* stays honest. The flat-floor seam — where there is no face
and nothing physical to justify — gets §2.1's diegetic joint instead, not scatter.

## §2.5 Vary the damage. Do not damage everything identically.

The sharpest writing found in the whole sweep, from Fallout Hobbies
(<https://www.fallouthobbies.com/blogs/the-workshop/how-to-make-free-terrain-look-like-a-lost-civilization>):

> "Place six identical monuments upright at the same height and angle, evenly spaced across a
> board, and the viewer does not see the remains of an ancient ritual landscape. They see six
> copies of the same file."

> "Six matching ruins with the same broken corner are still six matching pieces."

> "Do not damage everything identically."

And the technique list, verbatim:

> "Cut the top from one monument. Sink another into the ground. Tilt a third where the earth
> has shifted beneath it."
>
> "Bury part of the base under roots, rubble, mud, snow, sand, or leaf litter."
>
> "Let vegetation obscure part of the original outline."

Every one of those is **free at the instance level**: a per-instance sink depth, a per-instance
tilt angle, a per-instance yaw, a per-instance condition roll, a per-instance skirt of scatter.
No new models. This is the best effort-to-effect ratio in the study, and the second half of the
quote is why: the problem is never that a piece repeats, it is that repeats are *identically
posed*.

Gameplay guards, and they are real: **tilt must not change the declared footprint** (clamp the
angle), and **sink must not drop a cover prop below its cover height class** (clamp the depth,
and record the clamp). With those clamps it is pure art.

## §2.6 The tabletop three-tier vocabulary — and Genesis's missing tier

Battle Systems ships three kinds of thing: modular sets, set-piece feature buildings, and
scatter props — *"chairs, chests, and med bay beds that add atmosphere and detail to any
scene"* (<https://battlesystems.co.uk/>,
<https://techraptor.net/tabletop/reviews/battle-systems-gothic-cityscape-review-hassle-free-terrain>).
Reviewers consistently credit the multi-level, multi-platform layering plus the scatter with
keeping cardboard from reading as flat.

Genesis maps onto this cleanly — modular = the terrain chassis, set-piece = the Meshy
set-pieces — with one gap: **the Meshy queue buys set-pieces, not scatter.**
`MESHY-WILDERNESS-SETPIECE-QUEUE.md` proposes 26 set-piece candidates against a slate budget of
300 Meshy generations. Scatter is the cheapest silhouette work per model in existence, because
one model reused forty times at random yaw, scale, sink and tilt is forty silhouette events.

**Named cost:** a scatter kit of eight — rock chip, root knuckle, fallen branch, tuft clump,
brick rubble, potsherd, bone, crusted drift — is roughly 8–10 generations, **about 3% of the
300-generation slate**, and it is the only prop spend recommended anywhere in this study.

## §2.7 Walls on the seam

WizKids WarLock Tiles solves a problem Genesis has already solved, and the marketing copy is
worth having because it names the payoff: *"patented, modular, ultra-slim interior walls"* and
*"Offset walls provide you with the ability to place figures in any square on the grid, without
pesky corners eating into your play area"* — producing *"a perfect, continuous grid through the
entire play space"* (<https://wizkids.com/warlock/>,
<https://shop.wizkids.com/products/warlock-tiles-expansion-pack-i>).

Convergent with XCOM's thin walls (§1.2), from the opposite direction and for the same reason.
The device here is not the wall — Genesis should already do this — it is the **consequence**:
a slim wall leaves seam volume over, and that volume is where the fat dressing goes.

## §2.8 Painting: wash and drybrush, translated

The hobby's standard three-step is basecoat → wash → drybrush, and it exists specifically
because it is fast and reads at table distance
(<https://www.printablescenery.com/2021/05/20/how-to-drybrush-terrain/>,
<https://shortreststudios.com/how-to-dry-brush-tabletop-terrain-for-dd/>). The wash is diluted
dark paint that settles into recesses; the drybrush is a near-dry brush that catches only the
raised surfaces. The stated intent is to *"replicate the effect of sunlight over the terrain,
accentuating its natural contours."*

The shader translation is exact and cheap: **cavity-darken plus curvature-lighten, driven off
the height/normal channel Genesis already exports.** One extra read of a map that exists.

Two more from the same literature, both cheap and both distinct:

- **Sponged, patchy basecoat.** *"Using a damp sponge waters down the paint you are using which
  gives it some translucency"*; *"Dabbing on the second shade before the first has dried gives
  you a more blended look."* The shader equivalent is a **low-frequency tonal drift at a scale
  larger than the cell** — and that scale is the point: a rhythm bigger than the tile pitch
  out-competes the tile pitch for the eye's attention. Nothing in `GROUND-MATERIALS-PROGRAM`
  currently addresses the cell-pitch rhythm itself; its noise all operates at or below patch
  scale.
- **Vary colour across repeated pieces.** *"Using some other colours to mix it up can really
  turn a wall of grey into a wall of realistic stone"*
  (<https://www.printablescenery.com/2026/04/17/7-ways-to-improve-your-terrain-painting/>). The
  equivalent is a per-instance hue/value jitter — one float per instance, inside the realm tint
  funnel so the REALM-HONESTY LAW still holds.

**The canon guard on all three:** `ART-DIRECTION-CANON`'s 2026-07-22 no-cloned-dungeons ruling
warns that *"painted lighting must not become false relief, halos, or pillow shading."* That is
exactly the failure mode of a drybrush done freehand. Tying cavity/curvature to the *real*
height channel is what makes it legal, and is also what makes it look right.

## §2.9 Corners, risers and steps — noted, mostly already owned

- **Corner accessory pieces.** The hobby answer to a square corner is a 45° or curved corner
  pack (<https://scythedesigns.gumroad.com/l/gjgyojn>). For Genesis that is **geometry** and it
  changes the walk shape — it belongs in §5. There is a cheap cousin, though, and it is the one
  the tabletop actually reaches for more often: a **corner-filler prop** (rubble wedge, root,
  drift) that visually rounds the corner without touching a single cell.
- **Risers and steps.** Physical riser systems are typically *"2\" tall with 1\" squares set
  into the top face to allow for grid play"*
  (<https://tbmgames.com/2019/01/14/5-ways-to-get-the-most-out-of-your-terrain-tiles/>,
  <https://www.minihoarder.com/product/modular-risers>). Genesis's quantized elevation is
  stricter and better. The one insight worth banking: **the riser carries the grid on its top
  face** — elevation change never costs grid legibility. `TERRAIN-PROGRAM` §4.2 has already
  banked the equivalent as the mandatory 72° strategic-read capture paired with every
  production-camera capture.

---

# §3. THE DEVICE LEDGER

Every device found. **GAMEPLAY = changes walkable cells, cover, occupancy, or line of sight** —
flagged loudly, never slipped in as art.

| # | device | source | bin | cost | buys | gameplay? | rating |
|---|---|---|---|---|---|---|---|
| D01 | **Overhang allowance** — declare tactical footprint and visual bbox separately; visual may exceed the cell by ~1/6 (≈10 in), spent above knee height | XCOM §1.1 | prop (authoring law) | a spec line + a lint check | every future prop is permitted to stop being a box | **no** (footprint unchanged) | cheap |
| D02 | **Seam-volume + wall-top dressing** — dress the volume above head height and on the wall line, where nothing walks and no cover generates | XCOM §1.2 | prop (reuses existing models) | placement logic | fat silhouette at zero mechanical cost | **no** (chosen precisely where cover doesn't generate) | cheap |
| D03 | **Cover/blocking as an edge fact, mesh free to be any shape** | XCOM §1.3 | — (architecture) | already Genesis's model (face-piece rule) | licenses D01/D02 | **yes if changed** — leave alone | n/a |
| D04 | **Random facing on every placeable** | XCOM §1.4 / DF §2.2 | prop (placement) | none | variety for literally nothing | **no** | cheap |
| D05 | **Variant sets chosen by seed** — N sculpts per socket, fixed footprint | XCOM PCPs §1.4 / DF caverns §2.2 | prop | N× model spend, top-frequency props only | the repeated thing stops being *the* repeated thing | **no** | medium |
| D06 | **Material/asset swap by realm** | XCOM §1.4 | material | already specced (rung-2 skins + tint funnel) | a whole different place from one layout | **no** | already owned |
| D07 | **Pre-broken / pre-worn condition rolled at generation** | XCOM §1.5 | material + prop | condition vector exists; mutator graphs specced | destruction's look without destruction's cost | **no** (state fixed at generation) | cheap |
| D08 | **Live destruction with damage thresholds and state swaps** | XCOM §1.5 | prop + geometry | per-prop damage states, threshold data, engine work | real consequence | **YES** | expensive |
| D09 | **Two-frequency joint rule** — fine unit ≪ cell, one coarse course *at* cell pitch to carry the overlay | DF §2.1 + Hirst §2.1 | material | a UV scale number + one trim decision | the drawn grid stops reading as HUD | **no** | cheap |
| D10 | **Grid expressed diegetically in natural ground** (roots, rock edges, plant clusters on the pitch) | DF wilderness §2.1 | prop + material | rides D14 scatter | the wilderness answer to the visible grid | **no** | cheap–medium |
| D11 | **Arris on every chassis face top** — no 90° edge anywhere | foam craft §2.3 | material (normal) | normal-channel authoring | blocks stop being blocks; light catches every edge | **no** | cheap |
| D12 | **Cavity-darken + curvature-lighten** (wash + drybrush in shader) | §2.8 | material | one read of an exported channel | nothing looks flat | **no** | cheap |
| D13 | **Macro tonal drift at a scale larger than the cell** (sponged basecoat) | §2.8 | material | one noise octave | a bigger rhythm out-competes the tile pitch | **no** | cheap |
| D14 | **Scatter at face feet and concave corners** (deposition-motivated, declared non-blocking) | §2.4 | prop (instanced) + material | ~8–10 Meshy generations (≈3% of slate) | highest silhouette density per model in the study | **no** *if* declared non-blocking and the DM cannot claim cover from it | cheap–medium |
| D15 | **Per-instance sink / tilt / yaw jitter** — "do not damage everything identically" | §2.5 | prop (placement) | placement code, zero art | kills the "six copies of the same file" read outright | **no** *with clamps*: tilt preserves footprint, sink preserves cover class | cheap |
| D16 | **Per-instance hue/value jitter inside the realm tint funnel** | §2.8 | material | one float per instance | repeated props stop rhyming | **no** | cheap |
| D17 | **Long-axis props that cross a cell seam** (fallen log, root, plank, rope, awning, cart shaft) | §2.4 + XCOM §1.2 | prop | ~6 models | *proves* the seam is not a wall — the strongest single break | **no** if non-blocking; **YES** if it becomes cover or difficult terrain | cheap–medium |
| D18 | **Corner-filler prop** (rubble wedge / root / drift rounding a square corner) | §2.9 | prop | rides D14 | rounds the corner without touching a cell | **no** | cheap |
| D19 | **45° / curved / chamfered cell corners as real geometry** | §2.9 | **geometry** | chassis change | genuinely non-rectilinear ground | **YES** — changes the walk shape | expensive → §5 |
| D20 | **Sub-cell relief beyond the walk budget** | §0 | **geometry** | chassis + law change | real shape underfoot | **YES** — the 2.3 in ceiling is a walkability law | expensive → §5 |
| D21 | **Undercuts / overhangs / floor-over-floor in the field** | §5 | **geometry** | the chassis is a single-valued heightfield; this is a topology change | dramatic terrain | **YES** | expensive → §5 |
| D22 | **Parcel/socket assembly with subdividing modules** | XCOM §1.4 | generation logic | real system work | layout variety | **YES** (changes layout, not cover semantics) | medium — and Genesis's chassis + arrangement tables already occupy this niche |
| D23 | **Thin walls sitting on the seam, consuming zero cells** | XCOM §1.2 / WarLock §2.7 | geometry (verify, likely already true) | a check | creates the free volume D02 spends | **yes if changed** | verify, don't build |
| D24 | **Riser top face carries the grid / paired strategic read** | §2.9 | — | already owned (`TERRAIN-PROGRAM` §4.2's 72° capture) | elevation never costs legibility | **no** | already owned |

---

# §4. THE CHEAP DOZEN

Ranked by (effect × breadth) ÷ cost. **No new geometry. No gameplay change.** Two entries name
a small model spend; both are flagged.

| rank | device | bin | what it costs | why it ranks here |
|---|---|---|---|---|
| **1** | **D15 · Per-instance sink / tilt / yaw jitter** | prop | placement code, **zero art** | The single best ratio in the study. Applies to every prop Genesis will ever place, forever, and it directly attacks the actual failure — identical posing, not repetition. Needs two clamps (footprint-preserving tilt, cover-class-preserving sink) and those clamps are testable. |
| **2** | **D02 · Seam-volume + wall-top dressing** | prop | placement logic, **reuses existing models** | Free volume that nobody occupies, sitting in every scene the engine builds. XCOM's most distinctive move and it needs no new asset. |
| **3** | **D09 · Two-frequency joint rule** | material | a UV scale number | The only device that improves the *visible grid itself* rather than working around it. Makes the ruled overlay land on a mortar course instead of on nothing. Costs a decision. |
| **4** | **D12 · Cavity-darken + curvature-lighten** | material | one read of an exported channel | The hobby's universal fix, translated exactly. Buys value structure — the thing that actually reads at the fixed camera's distance. Must ride the real height channel (canon guard, §2.8). |
| **5** | **D13 · Macro tonal drift larger than the cell** | material | one noise octave | Attacks the tile *pitch* directly by putting a bigger rhythm on top of it. Nothing currently in the ground program does this. |
| **6** | **D11 · Arris on every chassis face top** | material (normal) | normal-channel authoring | Generalizes a rule Genesis already has for made edges to every face the chassis produces. The difference between a block and a stone, at no geometry cost. |
| **7** | **D07 · Pre-broken condition rolled at generation** | material + prop | mutator graphs already specced | Buys the look of destruction with none of destruction's cost or risk. Rides machinery that exists. |
| **8** | **D16 · Per-instance hue/value jitter** | material | one float per instance | Stops repeated props rhyming. Constrained by the REALM-HONESTY LAW to the existing tint funnel, so it cannot go rogue. |
| **9** | **D04 · Random facing on every placeable** | prop | none | Free. Verify it isn't already being done before spending a line on it. |
| **10** | **D14 · Scatter at face feet and concave corners** | prop + material | **~8–10 Meshy generations, ≈3% of the 300-generation slate** | Highest silhouette density per model. Legal only in the deposition-motivated form (§2.4) — never scattered *because there is a seam*. Must be declared non-blocking. |
| **11** | **D17 · Long-axis props crossing a cell seam** | prop | **~6 models** | The most convincing single break in the study — a continuous object across a seam proves the seam is not a wall. Ranked below 10 only because each model serves fewer instances. |
| **12** | **D01 · Overhang allowance as an authoring law** | prop (authoring) | a spec line + a lint check | Permanent, cheap, and compounding: every prop authored after it lands is allowed to break its own silhouette. Ranked last only because its payoff arrives with future art rather than today. |

**What the twelve add up to.** Four are pure code (1, 2, 9, and the placement half of 15/16),
five are material-authoring decisions (3, 4, 5, 6, 8), one rides existing spec (7), and two
cost about **fourteen Meshy generations between them** — under 5% of a slate that is not yet
authorized. Nothing on the list changes a walkable cell, a cover value, an occupancy, or a line
of sight.

---

# §5. What genuinely requires geometry — and belongs with the FFT surface-grammar lane

Honest list. These are real, they are worth wanting, and they are **not** this study's business.
The sibling lane already has the corpus work — `FFT-SURFACE-GRAMMAR.md` (same scratchpad,
2026-07-28) covers slope quantization, stairs, edges/corners including Adam's 1/9 corner block,
and the ranked "Minecraft diagnosis." Everything below is a hand-off to it, not a competing
proposal. The two studies partition cleanly: **that one owns shape, this one owns everything
that is not shape.**

1. **Non-rectilinear cell footprints** — 45° corners, curved corners, diagonal walls, chamfered
   cells (D19). Changes the walk shape and therefore the tactical read. This is the FFT board
   grammar's actual subject.
2. **Sub-cell relief beyond 2.3 inches on walkable ground** (D20). The number is Genesis's own
   (`TERRAIN_WALK_NOISE_BUDGET_H`, §0). Exceeding it is not an art decision, it is a
   walkability law change.
3. **Undercuts, overhangs, and floor-over-floor** (D21). The chassis is a heightfield — it is
   single-valued in z by construction and cannot express an undercut at all. Note the cheap
   partial: an undercut *prop* is legal and cheap; an undercut *field* is not.
4. **Live destruction** (D08). Adam's 2026-07-22 delivery-tiers ruling already parks this
   correctly: identity and promotion seam now, mechanics later.
5. **Irregular room outlines at sub-cell resolution.** The mask can be organic (`GROUND-MATERIALS`
   §3c domain warp); the *floor* cannot, without leaving the cell model.

One boundary worth stating clearly, because it is where this study could be misread: the
**guarded** cells — the faces, the cliff walls, the non-standable slopes — are *not* subject to
the 2.3-inch ceiling. `terrain-field.js` says so directly: *"a guarded cell has no walk
obligation and spends the full requested amplitude."* So the geometric appetite has a legal
home already. **Shape belongs on the faces; dressing belongs on the floor.** That may be the
single most useful sentence in this document for the terrain lane.

---

# §6. THE PROPOSED PROOF — a clay comparison, bins isolated

Not an art-direction decision. A proposal for **what to show** so Adam can rule on the same
terrain with and without each bin.

**Where it rides.** `TERRAIN-PROGRAM` §4.1 proposes `CL-F07 terrain-bench` and is explicit that
it *"must be adopted through [CLAYROOM-RESET-LADDER], not declared here."* This proposal is an
added capture set inside `CL-F07a`, not a new fixture. Same rule applies.

**The board.** One committed field, one seed, one set of ids — the census-median arrival, with
at least one 2h+ face (so the deposition anchors exist), one worked run and one natural run (so
both halves of §2.1 are on screen), and the six-foot witness. Production compiler, production
materials, production camera. No second renderer.

**The ladder — six captures over identical ids:**

| capture | what is on | isolates |
|---|---|---|
| **A0 · NAKED** | chassis + base material + the ruled grid overlay | the control. This is "big chonky blocks," photographed honestly. |
| **A1 · MATERIAL BIN ONLY** | + D09 two-frequency joints, D11 arris, D12 cavity/curvature, D13 macro drift | *can the material bin alone do it?* The most important single frame in the set — if A1 largely solves it, the prop spend never has to happen. |
| **A2 · + DECAL/PAINT BIN** | + wear polish, deposit, stain at face feet | what the flat-mark bin adds on its own |
| **A3 · + PROP BIN** | + D02 wall-top/seam dressing, D14 face-foot scatter, D17 seam-crossing props, D18 corner fillers, all placed with D15/D16 jitter | what props buy over material |
| **A4 · ALL THREE** | everything | the answer to the actual question |
| **A5 · NEGATIVE CONTROL** | all three bins, **jitter disabled** — every instance upright, unsunk, at grid yaw | proves the §2.5 claim. If A5 reads nearly as well as A4, the jitter is not doing the work and the cheap dozen's #1 entry is wrong. |

**Conditions on every capture**, borrowed intact from `TERRAIN-PROGRAM` §4.2 rather than
invented: the production camera **and** the 72° strategic read as a pair; the human witness on
every relief datum; a second seed; and the dark case.

**Two hostile cases, chosen to be the ones most likely to break the thesis:**

1. **The flat room.** A field with *no* faces at all — nowhere for deposition scatter to be
   legal, no arris to catch light, nothing to hide behind. Everything must come from the
   material bin. This is the hardest case for a visible grid and it should be shown, not
   avoided.
2. **The 16-cell tray** (20′×20′, the census minimum). Dressing that reads at 96 cells can
   easily swamp a small room. If the devices only work at scale, that has to be visible.

**The back-end gate that makes this honest** (Teeth Law — the ruling isn't recorded until its
enforcing check exists): across A0–A5 the board's **walkable-cell census, cover set, occupancy
map, and line-of-sight results must be byte-identical.** That is a measurable, mutation-testable
proof that none of the cheap dozen touched gameplay — and it is the claim most worth being able
to make before Adam looks at a single frame.

**What Adam would be ruling on**, stated so the packet doesn't ask a vague question: (a) does
A1 alone clear the "chonky blocks" bar, or is the prop spend necessary; (b) does A4 vs A5 show
the jitter earning its rank; (c) does the two-frequency joint change how the ruled overlay
feels; (d) does anything read as *dishonest* — a prop overhanging a walkable cell it doesn't
own, or a wear mark implying a route that isn't there.

---

# §7. Where this ADDS to what is already specced

`GROUND-MATERIALS-PROGRAM.md` already owns a great deal of this territory and this study is
deliberately not duplicating it. Explicit accounting:

**Already specced there — cross-reference, do not restate:** the TWO-PARENT LAW; the COVERAGE
LAW (rolls decide, noise shapes); the MADE-EDGE LAW (geometry + trim + one-sided invasion at
worked/natural boundaries); the DEPOSITION LAW; the CIRCULATION LAW (wear ribbons from real
circuits, including the polish/deposit inversion and abandonment healing); the REALM-HONESTY
LAW; the fourteen patch families and the condition vector; the six trim slots
(`plain-ground`, `kerb-face`, `verge-fringe`, `waterline`, `rootline-collar`,
`earth-tread-edge`) and five sheets; the grid-overlay compositing ruling; the degradation
fallback. `TERRAIN-PROGRAM` §2.0 owns the chassis, the one geometric law, and the morph
parameters; §4.2 owns the capture conditions.

**What this study adds, and nothing else:**

| # | addition | why it isn't already there |
|---|---|---|
| A1 | **The 2.3-inch walkable-relief ceiling stated as the reason the answer must be dressing** | the number is in the code, not in any doc's argument |
| A2 | **Macro tonal drift at a scale *larger* than the cell** | the program's noise all operates at or below patch scale; nothing addresses the cell-pitch rhythm itself |
| A3 | **The two-frequency joint rule** (fine unit ≪ cell + one coarse course at cell pitch) | the trim sheets govern edges *between* materials; nothing states a worked material's internal unit scale relative to the cell |
| A4 | **Terrain face pieces registered as deposition anchors** | the DEPOSITION LAW names "obstruction upstream faces" but the chassis's own face pieces are not enrolled |
| A5 | **Per-instance placement jitter (sink / tilt / yaw / tone) as a named law with gameplay clamps** | the ground program's scope is ground; props have no owner for instance-level jitter |
| A6 | **The overhang allowance — visual bbox declared separately from tactical footprint** | nothing in the material program covers 3D silhouette |
| A7 | **Seam volume and wall-top declared as free volume** | a consequence of thin walls that nobody has written down |
| A8 | **The arris rule generalized from made edges to every chassis face top** | currently only `kerb-face` and `earth-tread-edge` require an arris |
| A9 | **A scatter tier named as missing from the Meshy queue, with a costed kit** | the queue buys set-pieces; scatter is a different economy |

---

# §8. Sources

**XCOM**
- Brian Hess, *Plot and Parcel: Procedural Level Design in XCOM 2*, GDC 2018 — slides:
  <https://media.gdcvault.com/gdc2018/presentations/Hess_Brian_PlotAndParcel.pdf> · talk:
  <https://gdcvault.com/play/1025387/Plot-and-Parcel-Procedural-Level> · video:
  <https://www.youtube.com/watch?v=5jrq5rDI4dk> · text mirror:
  <https://docslib.org/doc/6462366/plot-and-parcel-procedural-level-design-in-xcom-2>
- Justin Rodriguez, *Environment Storytelling in XCOM 2*, 80.lv —
  <https://80.lv/articles/environment-storytelling-in-xcom-2>
- Tile unit / mesh modding — <https://wiki.nexusmods.com/index.php/XCOM_2_Tile_Overlay_Tutorial>
- Cover behaviour — <https://steamcommunity.com/app/268500/discussions/0/412446292764088557/> ·
  <https://www.ufopaedia.org/index.php/Cover_(EU2012)> ·
  <https://xcom.fandom.com/wiki/Cover_(XCOM_2)>
- Environmental damage —
  <https://github.com/long-war-2/lwotc/wiki/Environmental-Damage---How-it-Works>
- Map/verticality analysis (community, treated as secondary) —
  <https://www.vigaroe.com/2021/11/xcom-2-analysis-map-overview.html>

**Physical modular terrain**
- Dwarven Forge — <https://dwarvenforge.com/pages/new-to-dwarven-forge> ·
  <https://dwarvenforge.com/collections/wilderness> ·
  <https://dwarvenforge.com/collections/caverns> ·
  <https://dwarvenforge.com/pages/explore-caverns> ·
  <https://www.kickstarter.com/projects/dwarvenforge/dwarven-forges-caverns-dwarvenite-game-tiles-mini>
- WizKids WarLock Tiles — <https://wizkids.com/warlock/> ·
  <https://shop.wizkids.com/products/warlock-tiles-expansion-pack-i>
- Battle Systems — <https://battlesystems.co.uk/> ·
  <https://techraptor.net/tabletop/reviews/battle-systems-gothic-cityscape-review-hassle-free-terrain>
- Hirst Arts — <https://hirstarts.com/brickdungeon/brickbasic.html> ·
  <https://geekdad.com/2015/11/dungeon-casting-making-modular-pieces/>
- Foam / XPS craft (bevel, foil texture, cracks) —
  <http://www.kenthedm.com/blog/2023/7/25/making-dungeon-tiles> ·
  <https://nessy.info/post/2020-03-02-diy-dungeon-dragons-terrain/>
- Painting modular tiles so they don't look modular (flock+sand in the joints, sponging) —
  <https://www.modularrealms.com/blogs/news/painting-guide-how-to-make-realistic-mossy-stone-dungeon-tiles>
- Terrain painting technique —
  <https://www.printablescenery.com/2021/05/20/how-to-drybrush-terrain/> ·
  <https://www.printablescenery.com/2026/04/17/7-ways-to-improve-your-terrain-painting/> ·
  <https://shortreststudios.com/how-to-dry-brush-tabletop-terrain-for-dd/>
- Static grass at transitions —
  <https://www.wwscenics.com/static-grass-layering-system-explained/>
- Silhouette variation across repeated pieces —
  <https://www.fallouthobbies.com/blogs/the-workshop/how-to-make-free-terrain-look-like-a-lost-civilization>
- Risers / elevation accessories —
  <https://tbmgames.com/2019/01/14/5-ways-to-get-the-most-out-of-your-terrain-tiles/> ·
  <https://www.minihoarder.com/product/modular-risers>
- Corner packs — <https://scythedesigns.gumroad.com/l/gjgyojn>

---

*Read-only study. No file in any worktree was modified; nothing here is authorized, budgeted,
or built. If the two-frequency joint rule and the free-volume diagram survive review, they are
the two that want proper SVGs in `docs/diagrams/`.*
