# FFT SURFACE GRAMMAR — derived from the reference corpus

**Status: PROPOSED. Nothing here decides the look — Adam rules the art direction.** This is a
reading of what the 22 reference maps actually do, translated into Genesis's units, plus a slate of
candidate expression options to *prove*, not to adopt.

**Scope boundary.** Genesis's tactical grid is square, cells are 5 ft, the field is an integer
array of n×h with h = 2.5 ft (0.5 world units), the walkable step is 1h across one cell (26.565°),
the cap is 30°, and a 2h+ delta is a face (`TERRAIN_GRID_LAW`, `src/engine/terrain-field.js`;
`TERRAIN-PROGRAM.md` §2.0). Every option below survives that or says plainly where it doesn't.

**Corpus.** All 22 files in `Reference/FFT Battle Maps/` were materialized from LFS
(`git lfs pull`) and read. No other change was made to the worktree.

**Two provenance caveats, stated up front because they change what the evidence means:**

1. **Remaster vs PS1.** Six images are from the *Ivalice Chronicles* remaster
   (`image2`, `ivalice-chronicles-3`, `1999b53b…`, `FF-Tactics-PV`, `SHARE_2025…`, `Walled-City`).
   These show **continuously folded low-poly ground** the PS1 originals largely do not. The PS1
   maps are far more terrace-and-block, and earn their non-Minecraft read from texture, props and
   plan rather than from surface bending. Genesis should know which era it is copying. My reading:
   the PS1 devices are the cheap, high-yield ones; the remaster's surface bending is the expensive
   one — and it is the one Adam actually described.
2. **Four rips are FFT-*family*, not certainly PS1 FFT.** `9dddcffd…`, `46747cb0…`, `22860`,
   `24cab5b3…` carry spriters-resource watermarks and a brighter, hand-painted palette that reads
   more like Tactics Advance / A2 than PS1 FFT. The *shape language* is the same lineage, so I
   kept them, but every claim resting only on those four is tagged **[FAMILY]**.

Tags used below: **OBSERVED** = I can see it in the named image. **MEASURED** = I measured pixels.
**MODEL** = the documented FFT tile model (tile height + slope type + slope height; flat, four
single-direction inclines, convex/concave diagonal corners), asserted from general knowledge and
*not* verified against these images.

---

# 1. PER-IMAGE EVIDENCE LEDGER

Filenames are as they appear in `Reference/FFT Battle Maps/`.

### `Grog_Hill_1.webp` — PS1 map rip, no characters, transparent background
**The single most useful image in the corpus.** What I see:
- **Terrace benches** at 4–5 levels, each level change taken by a **thin reddish-brown riser
  stripe** whose material differs from both the grass above and the dirt below.
- The riser stripe **runs as a zig-zag polyline in plan** — down-right, 45° turn, down-left, turn.
  No terrace edge in the image is a long straight line.
- **Cream boulders straddle the riser**, sitting half above and half below, hiding the step
  entirely at those points. Roughly 40 boulders across the map, concentrated on edges.
- **Sloping wedge lobes**: the right-hand grass arm narrows to a point along a straight diagonal
  that is not axis-aligned, and its surface is tilted.
- **Free-form footprint** — the plan is a cross/star with arms, notches and 45° dog-legs, not a
  rectangle. The tray's cut edge is only ~½ cell deep on some arms.
- **Dry-grass clumps** (~2×2 cells of vertical stalks) placed so they occlude a riser and a corner.
- **Ruined stone walls** with a projecting cap course, laid *along* the terrace edges.
- Grass/dirt material boundaries are ragged and organic; they ignore the grid completely.

*Evidences:* riser-stripe device · edge-biased occluder placement · free-form footprint · sloped
non-axis-aligned lobes · plan-polyline dog-legs.

### `image2.webp` — remaster, tactical view, movement range highlighted
**The measurement image.** The blue move-range quads are drawn on the cell tops, so the cell
surface geometry is directly readable. **MEASURED** (16 quads segmented, bounding boxes and
extreme-corner positions extracted):
- Quad **width is constant at 156–168 px** across flat *and* sloped cells → **an incline preserves
  the cell footprint**. It is a heightfield tilt, not a rotated tile.
- Quad **height varies: 87, 90, 94 (flat) → 111, 123, 123 (mild) → 155, 156, 163 (steep)**.
- The diagnostic is the **screen-y difference between a quad's two side corners**:
  **≈0 px (flat), ≈33 px (mild), ≈60 px (steep)** — and it appears with **both signs**, so
  inclines run in at least four orientations.
- Cross-check: predicted quad height = flat height + side-corner Δy. 87+33 = 120 vs 123 measured;
  90+60 = 150 vs 155 measured. The model is self-consistent.
- Flat-quad h/w = 0.51–0.55 → **camera pitch ≈ 31–33°**.
- Several move-range quads are **bent hexagonal outlines, not plane rhombi** — consistent with a
  cell folded along a diagonal. *Honest alternative:* adjacent tiles merging visually. I cannot
  fully exclude it at this resolution.
- **Multi-cell ramps with no riser at all**: three tiles in a run share full edges, no vertical face.
- Units stand on inclined tiles. Rock outcrops sit as separate chamfered masses on the field.
- The UI reads **"Height 7.5"** — half-unit elevations exist in the game's own numbers.
- Map's far edge is a **plain unlit dark wedge** — the face is hidden by darkness, not detailed.

*Evidences:* inclines are real, walkable, standable, footprint-preserving · exactly two incline
magnitudes in a ~1:2 ratio · half-unit heights.

### `1999b53b86725-screenshotUrl.webp` — remaster, grassy hill
- The whole field is **one continuously folded low-poly turf surface**. **Zero vertical faces
  anywhere.** Every height change is taken by a slope.
- **Triangular facets are directly visible** in the shading — hard creases with a lighter facet on
  one side and a darker on the other, edges running along both the isometric cell axes *and* the
  cell diagonals. Facet size ≈ one cell, judged against the standees.
- ~15 **white rock slabs** push through the turf at assorted tilts, several rotated off-axis in
  plan. Their bases are buried — no seam, just a soft contact shadow.
- **Pebble decals** scattered flat on the grass; large soft mottled light/dark patches 2–3 cells
  across over a fine noise.
- The tray edge is a **wide dark beveled skirt**, not a vertical wall.

*Evidences:* **this is the image Adam was describing.** Per-cell varied surface angle, tri-split
folds, slope-as-the-rule.

### `FF-Tactics-PV_09-23-25.jpg` — remaster, waterfall gorge
- **Rock faces are low-poly faceted masses**, not flat cube faces — a cobble of irregular planes,
  each catching the key light differently.
- **The grass cap spills over the top edge and runs down the face in tongues.** The material
  boundary crosses the arris. This kills the "one colour on top, another on the side" cube read.
- Plank bridge spanning a 1-cell gap; waterfall sheets covering faces; unlit dark tray wedge.

### `final_fantasy_tactics_3d_geometry_battle_map.webp` — PS1, snow village
- **Long continuous sloped roof planes**, 4–6 cells of unbroken incline, meeting at ridges and
  gables. The largest single inclined surfaces in the corpus.
- Broad snow-covered street sloping through the middle of the map.
- Conifers at the tray edge **spill over the boundary**, breaking the silhouette.
- Tray edge itself is a **hard vertical cut into black** — FFT does not chamfer the tray edge here.

### `final_fantasy_tactics_3d_gameplay_potential.webp` — PS1, stone town
- **A stone staircase with roughly 8 treads over ~2 cells of run** — i.e. sub-cell decorative
  serration on what is logically a sloped run. (Contrast with `SHARE_2025…` below, which is a
  *cell-scale* stair. FFT uses both.)
- Coursed masonry with a **projecting cap band** that overhangs the face and casts a shadow line.
- **A curved sand/dirt material boundary in plan** drawn straight across the tile grid.
- Plank ramps; a curved retaining wall in plan; wooden crates — the only true cubes in frame, and
  they are props.

### `SHARE_20250913_0212440.webp` — remaster, castle in rain
**The stair answer.**
- A **timber stair whose tread is one full cell**. Units stand squarely on treads — three units on
  three different treads in one frame. **Treads are occupiable cells.**
- **MEASURED:** riser screen-height / tread-rhombus screen-height ≈ 0.83 → riser ≈ **0.5 cell edge
  = 2.5 ft over a 5-ft cell = 26.6°**. That is *exactly* Genesis's 1-quantum walkable step.
- **Every tread's nosing overhangs the riser below**, so the vertical face is set back and in
  shadow. This is why the run does not read as stacked cubes.
- Grass cap rolls over the edge as a dark hanging fringe; stone blocks carry a cap slab that
  projects past the body; thin white rock-vein slivers break diagonally through the turf.

### `final-fantasy-tactics-ivalice-chronicles-screenshot-3.avif` — remaster, aqueduct
- **Cell tops have rounded, beveled rims** — the top edge of every block is rolled over, not a
  knife-sharp arris.
- The **grass rolls over the arris as a drooping, irregular fringe** and in places runs down the
  face in tongues. The block's silhouette is: projecting plinth / coursed shaft / grass roll-over
  cap — three horizontal bands, never one uninterrupted plane.
- Wall **coping overhangs the face**; the bridge has a **true arch void** cut through it.
- The tray's plan **steps in and out cell by cell** — a castellated, notched boundary.

### `Walled-City.webp` — remaster, town gate on a hill
- **A wall built on a slope**: the coping steps down in stages while the courses stay horizontal —
  real masonry-on-a-hill behaviour.
- Coping overhang throughout; a true gate arch; conifers planted at the wall base breaking the
  line where wall meets ground.
- A dirt/gravel patch with a **wholly organic boundary** against the grass.
- Wide dark chamfered tray skirt.

### `Dorter-battlefield.webp` — PS1, Dorter Trade City
- Buildings **step diagonally in both plan axes** as they climb the hill.
- Sloped roof planes (gables and sheds) over ~2×2 cells each.
- Every mass carries cornices, string courses, jetties, awnings and chimneys; **the cap is always
  slightly wider than the body**.

### `a0db40af072a3e9ec069c76aa17e5dbf.jpg` — PS1, waterside town
- A **natural rock bank replaces a cube face** entirely: the drop from the town's ground to the
  water is a mass of irregular rounded rock lumps with grass tufts on top.
- **Barrel-vaulted (curved) roofs** — genuinely non-planar surfaces.
- The tray is a strict rectangle **with large black void cells inside it**. Void is a first-class
  device.
- Stone quay steps down to the water.

### `images.jpeg` — PS1, church map with deployment markers
- The **deploy markers are flat quads drawn on their cells, and they sit at visibly different
  tilts and heights** — direct evidence of per-cell varied surface angle in a PS1 map.
- The grass is a **continuous undulating surface** with tan rock veins showing through in irregular
  V and Y shapes; not one flat tile visible.
- Rectangular tray with black void and water; church tower with a true 4-sided pyramid roof plus a
  shallower shed roof.

### `images (3).jpeg` — PS1, castle gate with deployment markers
- **A deploy patch of 8 markers on a single tilted plane** — the clearest PS1 evidence of a sloped
  standable run.
- Rampart **cap course overhanging** the wall along its whole length.
- A free-standing **stone arch** with sky visible through it; a sub-cell stair; **large black void
  regions** inside a rectangular tray.
- Irregular ashlar in which no two stones are the same size.

### `images (2).jpeg` — PS1, blue-lit fortress
**The most cube-like PS1 map, and the best lesson in why it still isn't Minecraft:**
1. Blocks are **many different sizes, laid in a running bond that steps in and out** — no two
   adjacent block edges align.
2. Every block edge carries a **lighter highlight on top and a darker line beneath** — a rendered
   arris bevel.
3. **Moss and grass grow on block tops and hang over the edges** — organic material crossing the
   arris.
4. **Deep baked ambient occlusion in every inside corner.**
5. Glowing water pooling at the base; an arched buttress recess.

### `images (1).jpeg` — PS1, interior hall
- Three floor levels joined by a **sub-cell stair with a castellated stringer wall**.
- Floor **slab joints ignore the cell grid** entirely.
- The upper platform's edge carries a **cornice band** that projects.
- A true arch; extreme key/fill contrast — one wall near-black, the opposite wall lit.

### `03c0a2c50df2483ad9ba9c4a6993a19d.png` — PS1, church/village cluster
- The ground plate's **edge profile is a smooth curve that rises and falls** — the boundary
  undulates in elevation, it is not a level cut line.
- Continuous rolling grass; rubble scatter decals clustering into a path.
- Buildings with **jettied upper storeys** overhanging the storey below; **quoins alternating
  light/dark** which zipper the vertical arris into a broken line.

### `078_2_3.gif` — PS1, marsh
- A **near-flat field** whose entire relief is material change: grass islands and dark water half a
  step apart, with organic island edges.
- Two long organic log/rock ridges (~4 cells) as the only real relief; six bare dead trees.
- **Hard black vertical tray cut**; the plan has notches. *Slope is the exception here, not the rule.*

### `655bd60e9c25a98d4966fc2e122ee4f3.jpg` — desert block ruins
**The most literally cube-stacked map in the corpus.** It survives on texture alone:
- **Horizontal sedimentary strata banding on every vertical face** — faces never read as a tiled
  repeat.
- Soft wind-blown sand drifts pooling on the tops with vignetted edges, so no two tops match.
- Blocks at **many different sizes and offsets**; three giant carved stone heads as non-grid props;
  shrubs planted at block bases softening where block meets ground.
- **MEASURED (grid overlay, 10 native px):** cell-top rhombus ≈ 26 px × 13 px → **h/w = 0.50, a
  clean 2:1 isometric**.

### `24cab5b3d553e2d741bca4e6d61a54af.jpg` — ruins/temple **[FAMILY]**
- Multiple stairs: one broad ceremonial flight plus two narrow ones.
- **Sloped green ramps whose side wall slopes in parallel beneath them** — the sloped cell run
  carries its own sloped skirt.
- **Crumbled, ragged parapet** — the ruin's top silhouette is a broken line, never straight.
- Trees planted at the plate edge with canopies hanging into space; jigsaw plan with deep notches.

### `9dddcffd52ea58a6a169a3a8d779d67e.jpg` — terrace garden, 4 rotations **[FAMILY]**
- Stepped terraces with stone retaining risers and light coping.
- Stairs cut into terraces.
- **The plan outline is a jigsaw** — steps in and out, with notches and tabs.
- Hedge/bush strips running along every terrace lip, breaking the corner.
- **Tray edge textured as exposed rock strata**, not a flat colour.
- A tan flagstone path meandering diagonally, off-grid.

### `46747cb01da69ee6b1bb4e125bdb5183.jpg` — forest/stream, 4 rotations **[FAMILY]**
- Near-flat field; **vegetation carries the whole anti-grid load** — dark shrub masses along every
  boundary, tufts at cell corners, trees at the perimeter.
- Stream trench one block down with a plank across it; an organic stump-mesa with its own
  irregular grass-capped silhouette.
- **Tray edge = a thick band of layered cream rock over dark soil with a ragged, bumpy bottom.**

### `22860.png` — forest/mushroom **[FAMILY]**
- **The clearest roll-over edge in the corpus**: the grass wraps the top arris and hangs down as a
  dark green fringe over a cream cobble side wall whose own bottom edge is ragged.
- Subtle alternating per-tile grass tint — **the grid is visible, but as tone, softly**.
- Multi-lobe plan joined by a neck; a 1-cell water slot; five mushroom props big enough to hide a
  cell corner; trees overhanging the plate edge.

---

# 2. THE DERIVED SURFACE VOCABULARY, IN GENESIS UNITS

## 2.1 How many distinct per-cell surface types

**MEASURED (from `image2`):** three distinct surface classes appear, distinguished by the
side-corner screen-y difference of the move-range quad: **flat (Δy ≈ 0)**, **mild incline
(Δy ≈ 33 px)**, **steep incline (Δy ≈ 60 px)** — the mild and steep in a **~1 : 1.8 ratio**, which
within measurement error is **1 : 2**. Both signs of Δy appear, so each incline exists in at least
the four cardinal orientations.

**MODEL (not verified here):** the documented FFT tile record carries a tile height, a *slope type*
and a *slope height*, where slope type enumerates flat, four single-direction inclines, and
four convex plus four concave diagonal-corner tiles — thirteen types. **I did not confirm the
convex/concave corner tiles in this corpus.** The bent hexagonal move-range outlines in `image2`
are consistent with them, and the `images.jpeg` / `images (3).jpeg` tilted deploy quads confirm
non-flat standable cells, but a diagonal-corner tile is not something I can positively identify at
these resolutions. **Treat the 4+4 corner tiles as MODEL, and the flat + 4 inclines as OBSERVED.**

## 2.2 Slope quantization — the number Adam asked for

Camera pitch **≈31–33°** (MEASURED, from flat-quad h/w = 0.51–0.55; corroborated by the desert-map
grid overlay at a clean 2:1). Converting the side-corner Δy to a world rise per cell:

| class | rise per cell (cell edges) | pitch | in Genesis units (cell 5 ft) |
|---|---|---|---|
| flat | 0 | 0° | 0 |
| **mild incline** | **≈0.32–0.34** | **≈18–19°** | **≈1.6–1.7 ft per cell ≈ 0.65 h** |
| **steep incline** | **≈0.58–0.62** | **≈30–32°** | **≈2.9–3.1 ft per cell ≈ 1.2 h** |
| cell-scale stair riser (`SHARE_2025…`) | **≈0.5** | **26.6°** | **2.5 ft = exactly 1 h** |

Error band is roughly ±10% on the rise, driven by the glow bleed on the highlight quads and by
uncertainty in the camera pitch.

**Two readings are compatible with the measurement, and I will not pretend to choose between them:**

- **Reading A — half-step and full step.** FFT's height quantum h_FFT ≈ 0.6 cell edges, and slopes
  come in ½h and 1h flavours. Supported by the game's own "Height 7.5" half-unit readout.
- **Reading B — one step and two steps.** h_FFT ≈ 0.3 cell edges, and slopes rise 1h or 2h across
  a cell. Supported by the PS1 rips, where the riser stripe reads as roughly ¼–⅓ of a cell edge —
  visibly *shallower* than Genesis's h.

**What is robust either way, and is the finding that matters:**

> **FFT's common slope is ≈18°. Genesis's *only* legal slope is 26.565°. FFT's steepest walkable
> slope is ≈31°, i.e. right at or just past Genesis's 30° cap.**
>
> Genesis's slope vocabulary is **too coarse at the shallow end**. Its integer field cannot express
> a rise of less than one full quantum across one cell, and the shallow, long, ≈18° grade — the
> most common inclined surface in the corpus — is exactly what it cannot say.

## 2.3 Where FFT slopes and where it stays flat

**Sloped ground is the exception on the PS1 maps and closer to the rule on the remaster.**

- **Flat is the default for anything built or occupied.** Streets, courtyards, terrace tops,
  rampart walks, quay decks, interior floors, roof-adjacent platforms: flat, every time
  (`Dorter`, `images (1)`, `images (3)`, `a0db40af…`, `Grog_Hill`).
- **Whole maps stay essentially flat** when the interest is material rather than relief —
  `078_2_3` (marsh) and `46747cb0…` (forest/stream) carry almost no height at all and are still
  good maps. *A flat map is not a failed map in FFT.*
- **A slope is earned by three things and I could not find a fourth:**
  1. **Natural ground under no built discipline** — hillside turf, riverbank, gorge flank
     (`1999b53b…`, `FF-Tactics-PV`, `Grog_Hill`'s wedge lobes).
  2. **A roof.** The largest continuous inclines in the corpus are roofs
     (`…3d_geometry_battle_map`, `Dorter`, `images.jpeg`).
  3. **A deliberate route between two levels** — the ramp, the stair, the graded approach
     (`image2`'s multi-cell ramp, `24cab5b3…`'s green ramps).
- **A slope is never used to take up a large elevation change.** Big drops are always a *face* —
  a cliff, a retaining wall, a rock bank — with a route around or through it. This matches
  Genesis's existing law exactly and is worth saying: **FFT would not have built a walkable 45°
  hillside either.**

## 2.4 Stairs

**Both scales are used, and the distinction is legible:**

- **Cell-scale stairs** (`SHARE_2025…`, and the stepped runs in `images (3)`, `24cab5b3…`):
  **one tread = one cell**, riser **≈0.5 cell edge = 1 Genesis quantum = 26.6°**, and **units
  stand on the treads** — three units on three treads in one frame. These are ordinary walkable
  cells that happen to be drawn as timber or stone steps.
- **Sub-cell stairs** (`…3d_gameplay_potential` at ~8 treads over ~2 cells; `images (1)`;
  `9dddcffd…`): fine serration on what is logically a sloped or stepped run. Decorative geometry
  over quantized cells.

**The device that makes a stair not read as stacked cubes is the NOSING.** Every tread overhangs
its riser, so the vertical face is set back and falls into shadow, and the silhouette is a saw-tooth
of *horizontal* shadow lines rather than a stack of block corners. The stringer is also expressive:
`images (1)` gives it a castellated profile, `SHARE_2025…` gives it exposed timber ends.

## 2.5 Edges and corners — and Adam's 1/9 corner block

**FFT does not soften corners by subdividing the cell. I found no instance of a fractional corner
block anywhere in the corpus.** What it does instead, in descending order of how often it appears:

1. **Material roll-over.** The top surface's material wraps the arris and hangs down the face as an
   irregular, drooping fringe — and in places runs *down* the face in tongues. Seen in
   `ivalice-chronicles-3`, `22860`, `FF-Tactics-PV`, `SHARE_2025…`, `Grog_Hill`. **There is no
   two-tone arris to read as a cube edge, because the two tones interpenetrate.**
2. **Horizontal banding on the face.** Every block is plinth / shaft / cap, or bedded strata, or
   coursed masonry. The face is never one uninterrupted plane
   (`ivalice-chronicles-3`, `655bd60e…`, `images (2)`, `Dorter`).
3. **The cap overhangs the body.** A coping or cornice projecting past the face below, casting a
   continuous shadow line, appears on nearly every built edge in the corpus.
4. **Occluders sitting on the corner.** Boulders straddling a riser, tufts at a cell corner,
   shrubs at a block base, trees at a plate edge, mushrooms mid-field. `Grog_Hill` uses this
   harder than any other device.
5. **Rendered edge highlight + baked AO.** A light line along the top arris, a dark line beneath,
   and deep occlusion in every inside corner (`images (2)`).
6. **Irregular coursing that breaks the vertical arris** — quoins alternating light/dark
   (`03c0a2c5…`), running-bond blocks stepping in and out (`images (2)`).
7. **Free-form plan.** The tray footprint is a notched, lobed, dog-legged polygon
   (`Grog_Hill`, `22860`, `24cab5b3…`, `9dddcffd…`, `a0db40af…`, `images (3)`, `078_2_3`).
   A rectangle reads as a board; a lobed polygon reads as a place.
8. **Rounded top-edge bevel.** Genuinely present in the remaster (`ivalice-chronicles-3`,
   `image2`), where the cell top's rim is visibly rolled over. This is the closest thing in the
   corpus to Adam's instinct — but it is a **uniform small chamfer on the top arris**, not a
   subdivision of the cell into ninths.

---

# 3. THE MINECRAFT DIAGNOSIS — ranked

What actually stops FFT reading as stacked cubes, ranked by **contribution × cheapness for a
cell-quantized integer heightfield engine**. "Cheap" is judged against Genesis's chassis: the
Lipschitz clamp, `declaredCellTops`, and the coverage gate.

| # | device | contribution | cost to Genesis | net |
|---|---|---|---|---|
| **1** | **Material roll-over at the arris** — top material wraps ~15% down the face with a noisy, per-cell-varied lower edge | **very high** | **very low** — render-only, no field change, no walk change | **best ratio in the study** |
| **2** | **Edge-biased occluders** — boulders/tufts/rubble placed *on* the risers and corners, not scattered at random | **very high** | **low** — R1-10/R1-11 already exist; the new thing is a placement law | **near-best** |
| **3** | **Surface bending — the cell top stops being horizontal** | **highest single contribution** | **medium** — no new geometry, but it touches the render/walk boundary and needs a gate proof | **the big one** |
| **4** | **Riser stripe** — an exposed face gets its own material, distinct from top and from ground below | high | very low | excellent |
| **5** | **Free-form footprint** — notched, lobed, dog-legged plan with void cells | high, and *structural* | low — voids already modelled | excellent |
| **6** | **Cap overhang** on built edges (coping/cornice projecting past the face) | high on built terrain, nil on natural | low | good, but scoped |
| **7** | **Face banding** — strata / coursing / plinth-shaft-cap on every vertical face | high | low–medium (material work, not geometry) | good |
| **8** | **Baked AO + a hard key light** with deep inside-corner occlusion | high | medium — lighting work already in flight | good |
| **9** | **Plan-polyline dog-legs** — no terrace edge runs straight for more than a few cells | medium-high | low | good |
| **10** | **Nosing overhang on stairs** | medium (scoped to stairs) | low | good |
| **11** | **Uniform rounded bevel on the top arris** | medium | low–medium — 4 quads per exposed cell | fair |
| **12** | **Sub-cell corner subdivision (the 1/9 block)** | low *given 1–3 are done* | **high** — 9× top faces, a second field, gate rework | **poor — see §4 D** |

**The top three, stated plainly:**

1. **The arris is the tell, and material roll-over kills it.** A cube is legible because a hard
   line separates one flat colour on top from another on the side. FFT never lets that line exist.
2. **The grid is broken best by things that are not on the grid.** Boulders straddling a step do
   more work per unit of cost than any change to the step itself.
3. **A horizontal cell top is what makes a cell a cube.** Bending the surface is the most expensive
   of the three and the most transformative — it is the one Adam actually named, and the one that
   converts a 1h riser into a ramp.

---

# 4. CANDIDATE EXPRESSION OPTIONS

Six candidates. **None is a decision.** Each states what changes geometrically, what it costs, what
it buys, and how it survives a square tactical grid with a standee that must stand on the cell.

---

### **A — CORNER-HEIGHT RENDERING (the "bent cell top")**

**Geometry.** The field stays exactly as it is: integers, `n×h`, Lipschitz-clamped. What changes is
the *render*. Today a cell's top is a horizontal quad at `n·h`. Under A the renderer derives a
**vertex height field** — each grid *corner* takes the average of the (up to) four cells meeting
there — and draws the cell top as the plane through its four corners. The cell **centre stays at
`n·h`**, so the standee's foot height, the walk graph, occupancy, cover and reach are all untouched.

```
  today                          option A
  ┌────┐                              ╱▔▔╲
  │ n+1│──┐                        ╱▔▔      ╲▔▔╲
  └────┘  │  ← 1h riser        ▁╱                 ╲▁▁
     ┌────┴┐                    cell centres still at n·h;
     │  n  │                    corners at the neighbour mean
     └─────┘
```
A 1h step between two cells becomes a **26.565° ramp across the shared edge** instead of a vertical
riser. A run of `n, n, n+1, n+1` becomes a gentle S-curve. Cell interiors that are locally flat stay
flat, so a courtyard is still a courtyard.

**Cost.** *Geometry:* nil — same two triangles per cell, different vertex Y. *Generation:* nil —
purely derived, deterministic, no new parameters, no new seed draws. *Gate risk:* **medium.**
`declaredCellTops` emits one world point per cell; that point is the centre and is unchanged, so the
coverage gate survives as written. But `TERRAIN_WALK_NOISE_BUDGET_H` — which caps rendered surface
break-up at half of the 0.1547h headroom — was written assuming a flat top, and corner averaging
introduces a *rendered* deviation of up to ½h at a corner. That is not noise; it is structure, and
the budget needs re-deriving with a proof rather than a waiver. **This is the honest risk in A.**

**Buys.** The largest visual change available, and precisely the thing Adam described. It also
unlocks the ≈18° shallow grade that §2.2 identified as Genesis's missing register: a 1h step spread
over two cells reads as ~14°, over one cell as ~26.6°.

**Grid interaction.** Excellent. Footprint, centre height, occupancy, reach and cover unchanged.
**The one thing it costs is legibility** — a folded surface hides the cell boundaries, which is
exactly why FFT draws its move-range highlight *on* the tilted surface (`image2`). Genesis must do
the same or the tactical read degrades. That coupling should be part of the proof, not a follow-up.

---

### **B — THE DIAGONAL FOLD (per-cell tri-split choice)**

**Geometry.** Once A gives a cell four independent corner heights, the quad is generally
**non-planar and *must* be split into two triangles** — and *which diagonal* is chosen changes the
surface materially: one split makes a convex ridge across the cell, the other a concave valley.
Today that choice is implicit and uniform. Under B it becomes a deterministic per-cell bit, chosen
to serve the piece (ridge-following on a spur, valley-following in a gully).

```
   split NE–SW                split NW–SE
   ╱│╲   convex ridge         ╲│╱   concave valley
```

**Cost.** *Geometry:* nil. *Generation:* one bit per cell from the existing seed stream. *Gate
risk:* **low** — deterministic, and the fingerprint already covers the field.

**Buys.** Exactly Adam's "a single piece of a grid might have a varied angle to its surface". It is
also what makes A *look right* rather than mushy: an arbitrary split direction at a saddle cell
produces the characteristic wrong-way crease, and B is the fix.

**Grid interaction.** None — invisible to the walk layer.

**A and B are one change, not two.** A without B has a visible defect class. They should be proved
together.

---

### **C — MATERIAL ROLL-OVER + RISER STRIPE**

**Geometry.** Two render-layer additions, no field change:
1. **Roll-over skirt** — every exposed top edge grows a short band (~15% of a face) carrying the
   *top's* material, with a noisy, per-cell-varied, occasionally-tongued lower boundary.
2. **Riser stripe** — every exposed face is given a material distinct from both the surface above
   and the ground below, so a step reads as a *retaining edge* rather than as a cut cube.

**Cost.** *Geometry:* one extra quad strip per exposed edge (or a texture-space band, cheaper).
*Generation:* one material-routing rule; `materialRouting` already exists on the chassis.
*Gate risk:* **very low** — no field change, no walk change, no `declaredCellTops` change.

**Buys.** The #1 and #4 devices in the diagnosis, together, for the least money in the study. This
is the change that would make the *current* clay field stop reading as cubes without touching a
single height.

**Grid interaction.** None.

---

### **D — ADAM'S 1/9 CORNER BLOCK (sub-cell corner subdivision)** *— honestly assessed*

**Geometry.** Each 5-ft cell subdivides into a 3×3 of ~1.67-ft sub-cells. The four corner sub-cells
(and optionally the four edge sub-cells) may take an intermediate height, so a convex corner loses a
1/9 nib and a concave corner gains one, stepping the corner down or in rather than cutting it square.

**Cost.** *Geometry:* **9× the top-face triangles** minimum (a 24×24 field goes 576 → 5,184 top
quads) plus new face quads at every internal sub-step. *Generation:* **medium-high** — a second,
finer field derived from the coarse one, with its own consistency rules, plus an explicit
instruction to the walk/occupancy layer to ignore it. *Gate risk:* **high**, and specifically:
- `declaredCellTops` is one row per non-void cell; a 3×3 subdivision creates nine candidate tops and
  the coverage gate's occlusion ray-march would need reworking. The round-4 lesson was *"a rendered
  footprint must be gate-compared to a declared extent"* — subdivision breaks the correspondence
  that lesson depends on.
- The Lipschitz clamp is defined on the coarse lattice. A 1h drop across one sub-cell is **56°** —
  far past the 30° cap — so the sub-field needs its own clamp or the "cannot emit an illegal slope"
  guarantee becomes a "cannot emit an illegal slope *between cell centres*" guarantee, which is a
  weaker claim than the one currently in the spec.

**Buys.** Corner softening — which A + B + C already deliver, by other means, for a fraction of the
cost.

**Corpus verdict, stated plainly:** **no image in the corpus shows FFT doing this.** The one place
FFT subdivides a cell is a stair, and there it subdivides in *one* direction (fine treads), not into
a 3×3. FFT's corner softening is material roll-over, micro-profile banding, occluders and baked AO.

**A cheap variant worth keeping in the back pocket — D′.** A **uniform, fixed chamfer on the top
arris**: a constant ~1/8-cell bevel band around every exposed cell top. Four extra quads per exposed
cell, no second field, no clamp problem, no gate rework. This is what the remaster actually appears
to do (`ivalice-chronicles-3`, `image2`). If A+B+C land and Adam still reads the corners as too
sharp, **D′ is the answer, not D.**

---

### **E — THE OCCLUDER PASS (edge-biased scatter)**

**Geometry.** No change to the field. A deterministic scatter that places boulders, tufts, log
ridges and rubble **biased toward the discontinuities** — straddling risers, sitting on cell
corners, banked at the foot of faces — rather than distributed over the field. The rule is the
product, not the props: *"an exposed face's edge earns an occluder every N cells; a convex corner is
the preferred site."*

**Cost.** *Geometry:* low–medium; reuses R1-10 scree, R1-11 boulder cluster, and the vegetation
table M5 names as missing. *Generation:* one placement law. *Gate risk:* **low–medium**, with one
named interaction: the coverage gate's occlusion march *"does not march volumes"*, so a boulder
sitting over a cell top could make that cell read as not-drawn. That is a handleable, already-known
gate shape, but it must be handled rather than discovered.

**Buys.** The #2 device. In `Grog_Hill` this is doing more work than everything else combined, and
it is the only device that breaks the grid with something that is not itself on the grid.

**Grid interaction.** Needs one rule: **an occluder never occupies a walkable cell's standing
point.** Straddling a riser is fine — that cell is a face, and faces are not walked.

---

### **F — THE FREE-FORM FOOTPRINT**

**Geometry.** Deliberately author the tray's plan as an irregular polygon — notches, tabs, lobes,
arms, 45° dog-legs — using void cells, rather than filling the rectangle. Present in seven corpus
maps and in both eras.

**Cost.** *Geometry:* negative — fewer cells drawn. *Generation:* low; `declaredCellTops` already
says "one row per non-void cell", so voids are modelled. *Gate risk:* **low.**

**Buys.** A structural change in what the tray *is*. A rectangle reads as a board; a lobed polygon
reads as a place, and it buys a great deal of silhouette per unit of geometry.

**Grid interaction.** Unaffected, with one check: the chassis rejection rule that *"every arrival's
named entries must resolve to a walkable cell at the tray edge"* has more edge to satisfy and fewer
cells to satisfy it with. Worth a countable check rather than an assumption.

---

# 5. RECOMMENDATION — what belongs in a clay proof pass

**Prove four, in this order. Grounds for each.**

### 1. **A + B together — corner-height rendering with the per-cell diagonal fold**
*Grounds:* it is the largest single visual change available; it is precisely what Adam described
("not every surface is flat… split into tris so a single piece of a grid might have a varied angle
to its surface"); it costs no geometry and no generation complexity; and it is the only option that
unlocks the shallow ≈18° grade the corpus uses most and Genesis's integer field cannot currently
express. A must be proved *with* B because A alone has a visible saddle-cell defect. **It carries
the only real gate risk in the slate — the `TERRAIN_WALK_NOISE_BUDGET_H` re-derivation — which is
exactly why it should be proved rather than adopted.** The proof must include the move-range /
tile-highlight read on a bent surface, because that is what the change costs.

### 2. **C — material roll-over + riser stripe**
*Grounds:* the best cost-to-effect ratio in the entire study; zero gate risk; render-only; and it is
the device that appears in more corpus images than any other. It would improve the *existing* banked
CL-F07a frames without touching a single height value. If only one thing ships, this is it.

### 3. **E — the edge-biased occluder pass**
*Grounds:* the device `Grog_Hill` leans on hardest, and the only one that breaks the grid with
something that is not on the grid. It is mostly a **placement law** over pieces rung 1 already has,
so it tests the composition story (R1-10 + R1-11 + the missing M5 vegetation) at the same time. Its
one gate interaction — volumes are not marched by the occlusion check — is named and handleable.

### 4. **F — the free-form footprint**
*Grounds:* cheapest of the four, structural rather than cosmetic, already modelled (voids exist),
and it is the difference between a board and a place. Include it because it is nearly free and
because it changes the *silhouette*, which is the first thing the eye reads and the one thing A, C
and E do not touch.

### **Defer: D (the 1/9 corner block).**
*Grounds:* highest geometry cost (9× top faces), highest generation complexity (a second field with
its own clamp), highest gate risk (it breaks the declared-extent ↔ rendered-footprint correspondence
that the round-4 coverage gate rests on, and it weakens the "cannot emit an illegal slope"
guarantee from a lattice-wide claim to a cell-centre claim) — and **no support in the corpus.** FFT
does not soften corners by subdividing them. A + B + C deliver the corner softening D is meant to
buy, at a fraction of the cost.

**Keep D′ in reserve:** if A+B+C land and Adam's eye still reads the corners as too sharp, a
**uniform ~1/8-cell chamfer on the top arris** — four quads per exposed cell, no second field, no
clamp problem — is the remaster's own answer and is cheap enough to add late.

---

## One closing observation, offered rather than argued

The corpus splits cleanly. The **PS1 devices** — riser stripe, occluders on the edge, free-form
plan, face banding, cap overhang, void cells — are all *cheap* and all *render-* or *placement-*
layer. The **remaster device** — continuously bent ground — is the expensive one and the one that
touches the engine's contract.

Genesis could take the whole PS1 kit (options C, E, F) for very little and would stop reading as
Minecraft. Option A+B is a bigger bet: it buys the most, it is what Adam actually asked about, and
it is the only one that changes what the terrain *is* rather than how it is dressed. That is a
taste call and a risk call, and both are Adam's.
