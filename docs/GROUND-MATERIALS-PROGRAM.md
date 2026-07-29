---
type: system-spec
project: Genesis
status: DRAFT
created: 2026-07-27
audience: Adam (founder rulings), Codex (MM authoring), Claude orchestration sessions
authority: the GROUND composition layer — what covers the ground between and around the architecture
companions: MATERIAL-LANE.md, ART-DIRECTION-CANON.md, TRIM-SHEET-PIPELINE.md,
  CLAYROOM-RESET-LADDER.md, GOLDEN-SITES-CATALOG.md, FLOOR-TEXTURES.md, REALM-SURFACES-WIRING.md
---

# GROUND-MATERIALS-PROGRAM

**STATUS: DRAFT — Opus lane 2026-07-27**

Adam's brief, verbatim (2026-07-27):

> "we should also begin testing ground materials, and figuring out how to patch materials in for
> ground textures that aren't flat and boring and mechanical, what kind of trim sheets do we need,
> how do we create dirt patches, mud patches, snow patches, flower patches, and how do they all
> seamlessly fit together to create believable ground that isn't just one repeated grass tile with a
> perfectly rectangular path tile cutting through it."

---

## §0 What this document owns, and what it does not

**Owns.** The ground composition layer: the patch-family roster, the seam/blend system, the ground
trim-sheet catalog, the procedural composition rules (including wear paths), and the ground proof
ladder.

**Does not own.** Material authoring authority stays with **[MATERIAL-LANE.md](MATERIAL-LANE.md)**
(a second material authority is forbidden — canon/SYSTEM-OWNERSHIP §4); every parent and mutator
named here is a *consumer registration* owed back to that file, exactly as MATERIAL-LANE §9 did for
the Guard Post roster. Trim contract authority stays with
**[TRIM-SHEET-PIPELINE.md](TRIM-SHEET-PIPELINE.md)** — this program adds a second *layout id* under
the same contract, never a second contract. Visual register authority stays with
**[ART-DIRECTION-CANON.md](ART-DIRECTION-CANON.md)**. Clay gates ride
**[CLAYROOM-RESET-LADDER.md](CLAYROOM-RESET-LADDER.md)**'s fixture family, capture law, and receipt
law unchanged.

**Boundary with the two adjacent lanes** (a same-day sibling lane produced
`docs/CLAYROOM-PROOF-BACKLOG.md`, which names both):

| lane | owns |
|---|---|
| the **terrain** program | ground *form* — cliffs, crevices, chasms, ponds, hills, slope |
| `CLAYROOM-PROOF-BACKLOG.md` **A14** | the structure/terrain **seam** — foundation descent, cut/fill, plinth, the `terrain-join` socket. **A11** owns openings in the ground plane |
| **this program** | what *covers* the ground — materials, patch families, material-to-material seams, ground trim, and composition |

Form, join, and cover. No overlap, and none of the three can be proved without the other two
eventually landing.

**No code, no commits, no canon edits in this lane.** §10 lists the registrations owed to a future
folding session.

**Proofs propose; they never declare.** Every visual verdict in this program is Adam's. Nothing here
promotes a material, a mask, an edge treatment, or a composed frame.

---

## §1 The problem, mechanized

The complaint is real, but the diagnosis is better than "we need more textures." **Genesis already
rolls the composed ground. The renderer throws the answer away at four call sites.**

### 1a. The engine rolls patch coverage today, and discards it

`wilderness-footing` is a **d200** table whose columns are `Surface Flavor | Coverage Area |
Mechanical Impact`. Tallying its own 200 rows (`Engine/03. _Tables/03. Session Mechanics/Dungeons/
Wilderness Footing.md`):

| coverage shape | rows | % of table |
|---|---|---|
| `100% of Area` | 77 | **38.5%** |
| discrete patches (`20x20 patch`, `1d4 10x10 patches`, `1d4 5x5 patches`, `One 10x10 patch`, `1d6 5x5 patches`, `One 5x5 patch`, `One 20x20 patch`, `Two 5x5 patches`, `10x20 patch`, `10x10 patch`, `Two 10x10 patches`) | 63 | **31.5%** |
| fractional (`50% of Area`, `25% of Area`) | 28 | 14.0% |
| linear (`10-foot wide strip`, `5-foot wide path`, `15-foot wide strip`) | 17 | 8.5% |
| `Outer Perimeter` | 15 | 7.5% |

**61.5% of the table is not full coverage.** 18 distinct coverage shapes.

`urban-footing` is a **d100** with the same three-column shape:

| coverage shape | rows | % |
|---|---|---|
| `100% of Area` (+ two qualified variants) | 39 | 39.0% |
| discrete patches (`10x10 patch` 18, `Scattered 5x5 patches` 14, `Single 5x5 patch` 4, `10x10 puddle` 1) | 37 | **37.0%** |
| `Outer Perimeter (5-foot edges)` | 7 | 7.0% |
| paths / strips / chokepoints / gaps / bridges / streams | 17 | 17.0% |

67 distinct footing types. Row **02** is literally *"Pristine Paving / 10-foot wide center path — the
center path is clear, but the edges are rough."* That is Adam's complaint, already authored, already
compiled, already rollable.

**The four discard sites:**

1. `src/engine/wild-walk.js:182` — `const [footing] = walkPick("wilderness-footing", 1);`
   `walkPick(id, ...cols)` (`src/engine/walk.js:148-153`) returns only the requested columns. Only
   column 1 (flavor) is requested. **Coverage Area and Mechanical Impact are rolled and dropped.**
2. `urban-footing` is compiled and reachable but **no walk builder rolls it at all** (grep of `src/`
   for `urban-footing` returns zero call sites). 100 rows, 61 of them patch-bearing, entirely dead.
3. `src/engine/wild-walk.js:45` and `src/engine/dungeon-walk.js:465` —
   `walkPick("wilderness-tactical-terrain", 1)` / `walkPick("tactical-terrain", 1)`. The wilderness
   table carries a **`Map Footprint`** column (`5' wide, 20' long`, `15'x15' area`, `10' wide, 30'
   long`) and its own header instruction — *"roll 1d4 times on this table and draw these elements
   onto the grid"* — and the footprint column is dropped.
4. `theaterFloorMaterial(segment, biome, env, opts)` (`REALM-SURFACES-WIRING.md` §3) returns **one**
   `{material, tint, surfaceName}` for the whole board; `theaterBoardFrom` stamps that one key onto
   every FLOOR and ELEVATED tile (`FLOOR-TEXTURES.md` §2). One board, one material, by construction.

**So the mechanical work is not "invent composition." It is: stop discarding the coverage column, and
give the renderer a way to express it.**

### 1b. "One repeated grass tile" understates it — grass is the rarest base we have

The world does not lean grass. `wilderness-biome-type` is a flat **d10** (`Engine/03. _Tables/03.
Session Mechanics/Dungeons/Wilderness Biome Type.md`) — every biome is 10% by design. The 1,050-walk
census (`docs/intel/walk-census.md`, `walk-census-tally.json`) confirms it empirically:

| biome | arrival (n=539) | per-leg (n=2112) |
|---|---|---|
| Forest | 14.29% | 11.93% |
| Mountain | 12.43% | 12.69% |
| **Arctic** | **12.24%** | **12.74%** |
| **Swamp** | **11.69%** | 11.22% |
| **Grassland** | **11.69%** | 11.08% |
| Hill | 11.13% | 10.70% |
| Desert | 10.95% | 11.46% |
| Coastal | 9.65% | 9.09% |
| Underwater | 2.97% | 5.16% |
| Deeplands | 2.97% | 3.93% |

**Arctic (snow) outranks Grassland at arrival. Swamp ties it.** Snow and mud are not garnish on a
grass baseline; each is as likely as grass. Desert (sand) is within a point.

And in the authored realm corpus it is worse. Tallying the 88 realm surfaces in
`docs/REALM-SURFACES-DRAFT.md` by their base material (80 rows resolve to one of the 12 keys; 8 are
flagged net-new):

`plank` 12 · `flagstone` 12 · `ash` 10 · `mud` 9 · `cave-rock` 7 · `scree` 7 · `cracked-earth` 6 ·
`cobble` 5 · `leaf-litter` 5 · `sand` 4 · `snow-ice` 2 · **`grass` 1**

**`grass` is the base for exactly one of the 88 authored realm surfaces** (suburb's Manicured Turf).
The mechanical read Adam is seeing is mostly flagstone, plank, ash and mud — the flaw is not the
*choice* of tile, it is that **any** single tile covers the whole board.

Recorded consequence: **this program is not "add a grass system." It is a composition layer that any
base material passes through.**

### 1c. The biome map collapses 10 biomes into 7 materials (and one doc is stale)

`THEATER_FLOOR_BIOME_MAP` (`src/engine/theater-data.js:735`) is healthier than the spec doc suggests
— **it does cover all ten rolled biomes**, including `Deeplands` and `Underwater`. But it collapses
them hard:

```
Grassland→grass · Forest→leaf-litter · Jungle→leaf-litter · Desert→sand · Coastal→sand
Arctic→snow-ice · Mountain→scree · Hill→cracked-earth · Swamp→mud
Underdark→cave-rock · Deeplands→cave-rock · Underwater→cave-rock
```

**Ten biomes, seven distinct materials.** `Desert` and `Coastal` are identical. `Deeplands`,
`Underwater` and `Underdark` are all `cave-rock` — an ocean-floor kelp forest and a sunless cavern
render the same. `Underdark` and `Jungle` are dead keys retained from the hardcoded fallback array
`WILDERNESS_BIOMES` (`src/engine/wild-walk.js:16-18`), which still disagrees with the compiled table
(the table's last two rows are `Deeplands` and `Underwater`); they can only ever fire from the
fallback path.

Separately: **`FLOOR-TEXTURES.md` §2's published biome map is stale** — it lists the fallback array's
names, not the shipped map, and omits `Deeplands`/`Underwater` entirely. The code is fine; the doc
misleads anyone reading it for the contract. Flagged, not fixed (no code in this lane); registered in
§10.

### 1d. What the clay actually shows — and what the grey slab really is

Read at the production camera: `dev/clay-captures/cl-r4b-two-material-grid-v001/
cl-r4b-final-02-settled.png` and `dev/clay-captures/cl-r5-trimmed-structures-v005/
cl-r5-pbr-02-settled.png` (real bytes under `.../Genesis/genesis/`; the clayspec worktree holds LFS
pointers).

The masonry has arrived — both CL-R4b parents approved (Adam, 2026-07-27), trim reading, grid
multiplying through the material, stubs and contact honest — and the assembly stands on a flat
untextured grey slab.

**Correction to the obvious reading: that grey is contractual, not a placeholder oversight.** The
Clayroom compiles a real board and then deliberately repaints every surface flat clay-grey
(`CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor = "#8a8a8a"`, `src/engine/clay-room.js:74`;
`clayRoomApplyDiagnosticSurfaces()`, `src/ui/theater-clay-room.js:879`), with an enforced invariant
that `texturedClayCount` **must be 0** (`clayRoomSurfaceCensus`, `theater-clay-room.js:951`). A
textured floor in the diagnostic router is by definition the CR-1 regression.

**Consequence for this program: every ground material must be proved through a BENCH** (the CL-F04
material bench / CL-F05 trim bench pattern, `clayStructureMaterial` at `theater-clay-room.js:1016`),
never through the diagnostic surface router. §7's rungs are written that way.

### 1e. There is no ground

The hardest finding of the survey, and it reframes the whole program: **no mesh anywhere in `src/`
represents outdoor ground, terrain, a site plane, or a base slab.** No `groundPlane`, no
`terrainMesh`, no `buildGround`, no `siteGround`. Every `PlaneGeometry` in the renderer is a
billboard, light card, mote, decal, pool, or grid quad.

What reads as "ground" is:

- **tabletop channel** — a tray of individual tile columns, `BoxGeometry(TILE_SIZE - TILE_GAP, h,
  TILE_SIZE - TILE_GAP)` (`src/ui/theater-tabletop.js:385`), `TILE_SIZE = 1`, `TILE_GAP = 0.04`; the
  0.04 void seam *is* the grid read since the checker was retired 2026-07-08. Only face index 2 (+y)
  is ever textured (`tileMaterialsFor`, `src/ui/theater-boot.js:4037-4085`); sides stay flat-tinted
  by design. A default board is 12×9 tiles and nothing exists beyond that rect.
- **interior-3D channel** — an `InstancedMesh` of floor prisms pinned to `ITR_FLOOR_BASE_Y = -0.5`,
  plus the GR4 diorama **edge skirt** (`itrBuildSkirtRing`, `src/ui/theater-interior.js:1306`) which
  grows *downward*, is darkened, and casts and receives nothing. It is a bevel band, not ground.

And this is doctrine, not omission — `GRAPHICS-ENGINE.md:62`, **STAGE LAW**: *"Every scene floats —
diorama edges visible, skirt faces darkened … void-tinted backdrop per realm."*

**Consequence: the ground is BOUNDED by construction.** There is no open terrain to splat, no
horizon, no LOD ring, no streaming. That is a gift to this program's cost model (§3) and it is why
an open-world technique would be both unaffordable and unnecessary here. The composed ground lives
inside a diorama-sized rect that the board already knows the extents of.

### 1f. Two disjoint floor vocabularies, and a data shape with nowhere to put a patch

| | flat tabletop realizer | interior-3D realizer |
|---|---|---|
| realizer | `src/ui/theater-tabletop.js` (`setBoard`) | `src/ui/theater-interior-realize.js` (`setInteriorBoard`) |
| vocabulary | `FLOOR_MATERIAL_RECIPES` — **17 keys** (`src/ui/theater-skins.js:344`) | `REALM_MATERIALS` → **4 painter families** |
| painter | `buildFloorMaterialCanvas` (`theater-skins.js:487`) | `materialTexturePixels` (`theater-materials.js:201`) |

They share no texture, no recipe, no cache. And a `FLOOR_MATERIAL_RECIPES` entry is **not a params
object** — it is a per-texel draw function `recipe(c) -> {r,g,b}` over a 64×64 canvas
(`FLOOR_TEX_SIZE = 64`, `theater-skins.js:323`), `NearestFilter`, no mipmaps. **There is no
roughness, normal, height, scale, tiling, or UV field anywhere in the shape.** `REALM_SURFACES`'
88 entries carry only `base` + `baseTint` (plus prose).

**So a patch, a coverage, a mask, a second parent, and a wear ribbon have literally nowhere to live
in today's data.** §5a's ground fact record is therefore a genuine new data home, not a rename.

**Ruling: this program targets the interior-3D realizer.** Grounds: it is the channel the production
camera, the Clayroom, CL-F04/CL-F05, the PBR bench, the traversability grid, and the golden-site
program all run through. The tabletop tray keeps its 64px painter path unchanged as the declared
fallback (the SUBTLE-TEXTURE implementation clause's surviving role), and inherits nothing from this
program until it is promoted separately.

### 1g. Two doors that just opened

**(i) The parents are unblocked.** CL-R4's scope named *"neutral old-stone, structural timber, forged
iron, and **quiet earth/ground** parent seeds"*, and CL-R4a closed with *"timber/iron/ground family
expansion remains blocked until the first stone parent's scale and taste are accepted or replaced."*
**Adam accepted both masonry parents on 2026-07-27.** Ground expansion is unblocked as of today.

**(ii) Five ground materials already exist, authored and unwired.** `dev/material-lane/` holds a
complete **B03 exterior-ground** batch at v003 — graphs, seam-locked source sprites, depth guides,
export receipts and verification receipts:

| slug | graph |
|---|---|
| `grass-meadow` | `dev/material-lane/graphs/b03-exterior-ground-mm-v003/b03-grass-meadow-v003.ptex` |
| `mud` | `…/b03-mud-v003.ptex` |
| `gravel-scree` | `…/b03-gravel-scree-v003.ptex` |
| `marsh-bog` | `…/b03-marsh-bog-v003.ptex` |
| `worn-path` | `…/b03-worn-path-v003.ptex` |

Plus a `packed-earth` seam repair in the B04 masonry batch. **`src/` references none of them**, and
`dev/material-lane/exports/` is gitignored so the compiled maps are not in the tree.

`worn-path` is worth naming twice: **the wear-path material this program's §5d needs is already
authored and sitting unused.**

---

## §2 Patch families

Each family declares: its **bin** (per the three-bin dressing contract that every golden-site brief
already uses — material / decal-paint / prop), its **parent** derivation, its **mutators** (the
MATERIAL-LANE §5a library), its **mask bias** (§3d), and its **grounding**.

### 2a. Ground parents — three new, five promoted, five absorbed

**Law: a new parent only where a family genuinely cannot derive from an existing one.** The test is
*structural*, not palette: two families need different parents when their **unit structure** differs
(grain vs. discrete clast vs. fiber mat vs. flake litter vs. plastic mass vs. vitreous sheet).
Palette, wetness, wear, and growth are mutators, never parents.

Applied against what §1g(ii) found on disk, the authoring ask shrinks sharply.

**Already authored — B03 exterior-ground v003 (promote and verify, do not re-author):**

| id | parent | existing graph | unit structure |
|---|---|---|---|
| `GM-P02` | **Cohesive earth** | `b03-mud-v003` + `b03-worn-path-v003` + B04's `packed-earth` | plastic mass; holds a rut, cracks when dry |
| `GM-P03` | **Loose clast field** | `b03-gravel-scree-v003` | discrete hard fragments with a size distribution |
| `GM-P04` | **Low organic mat** | `b03-grass-meadow-v003` | dense fine vertical fiber, continuous |
| — | *(composite reference)* | `b03-marsh-bog-v003` | a `P02`+`P04` wet composite — retained as the **calibration reference** for the two-parent blend, since it is what the blend should be able to *reproduce* from its two parents |

**Genuinely new — three:**

| id | parent | unit structure | why it cannot derive from another |
|---|---|---|---|
| `GM-P01` | **Fine granular** (sand · ash · dry snow · dust) | sub-visible grain, no discrete units, wind-formable | ripple and drift are *formations*, not noise; grain-scale specular exists in no other parent. Covers three families (`GF-04`, `GF-06`, `GF-07`) that together outrank grass in the census. |
| `GM-P05` | **Coarse organic litter** (leaf · needle · duff · straw) | discrete flat flakes over a dark substrate | two-layer flake+gap structure; not a grain, not a clast. Forest is the single most-rolled biome (14.29% of arrivals). |
| `GM-P06` | **Crystalline / vitreous sheet** (ice · obsidian · glass · salt crust) | continuous low-roughness with sub-surface scatter | the only parent whose **specular** is its identity — the one thing a 64px albedo painter structurally cannot fake |

**Absorbed, no authoring:**

| existing | role here |
|---|---|
| the two CL-R4b masonry parents (**approved 2026-07-27**) | worked paving: flagstone, cobble, brick, plaza, courtyard |
| `GP-MM-M07` structural timber | boardwalk, duckboard, deck |
| `GP-MM-M06` geological outcrop rock | bedrock, cave floor, tide-pool shelf, lava sheet |
| `GP-MM-M04` packed road and working apron | the *made* road surface — a worked earth, distinct from `GM-P02` |
| `GP-MM-M11` maintained-overgrowth toolkit | the growth mutator set consumed by `GF-09`/`GF-10`/`GF-12` |

**Decision — `GP-MM-M05` "quiet grass/soil ground" resolves as `GM-P02` + `GM-P04`, which is what
B03 already authored separately.** Soil and sward respond *oppositely* to the two mutators that
matter most: wet turns soil into mud (mass loss, gloss, rut retention) and turns sward merely dark;
wear strips sward **to** soil. That sward→soil transition is the single most common real-world ground
boundary and the mechanical backbone of §5d's wear paths. Fused into one parent it is
unrepresentable. The B03 batch already split them — this ruling ratifies the split rather than
inventing it.

> **Three new parents. Five promotions. That is the whole authoring ask at the parent tier** — and
> the promotion half is verification work (channel routing, declared scale, seam-lock, taste card),
> not graph authoring.

### 2b. The fourteen patch families

| id | family | bin | parent | mutators | mask bias | grounding |
|---|---|---|---|---|---|---|
| `GF-01` | **Bare-earth / worn-to-soil** | material | `GM-P02` | wear, dust | traffic | the terminal state of every wear path; `Packed Dirt`, `Rutted Dirt Road`, `Deep Ruts / Gouged Wagon Trails` |
| `GF-02` | **Mud / churn** | material | `GM-P02` | wet, churn, rot | **low** (settles) | 24/200 wilderness footing rows (12.0%); `Thick Mud`, `Deep Mud`, `Deep Bog / Pool`; Swamp = 11.7% of arrivals |
| `GF-03` | **Standing-water edge** | material + geometry + decal | host parent + a water plane | wet, mineral-rim | **low** | `Puddles`, `Flooded Street`, `10x10 puddle`, `Shallow Water`; 14/200 wilderness rows are water/wet |
| `GF-04` | **Snow patch / drift** | material | `GM-P01` (snow palette) | drift, crust, refreeze | **high + leeward** | Arctic = 12.24% of arrivals, **above Grassland**; `Fresh Snow`, `Deep Snow`, `Sleet & Slush` |
| `GF-05` | **Ice / verglas** | material | `GM-P06` | thin, refreeze, crack | low + shaded | `Slippery Ice`, `Thin Ice`, `Smooth Bedrock / Polished Ice`, `Frost-Hardened Earth` |
| `GF-06` | **Sand / drift** | material | `GM-P01` | ripple, drift, sun-bleach | **high + leeward** | Desert = 10.95% of arrivals; `Sun-Baked Hardpan / Salt Flat`, `Damp Loam / Firm Wet Sand` |
| `GF-07` | **Ash / cinder** | material | `GM-P01` (soot palette) | scorch, ember, settle | high, then low when wet | 10 of 88 realm surfaces use `ash` (3rd-most-used base); `Ash & Cinder`, `Coal Dust` |
| `GF-08` | **Gravel / scree spill** | material | `GM-P03` | spill, sort, embed | slope-foot | 25/200 wilderness rows (12.5%); `Scree (Loose Gravel)`, `Dense Rubble`, `Light Debris / Rubble` |
| `GF-09` | **Flower / bloom** | material + prop (cards) | `GM-P04` | bloom, sward-thicken | shade/moisture, **not** traffic | `Petal Carpet / Fallen Blossoms`, `Low-Growing Creeping Ivy`; only 2/200 rows — see §5f |
| `GF-10` | **Moss / lichen creep** | material | `GM-P04` + `GP-MM-M11` | moss, damp, crevice-growth | **crevice + shade** | 28/200 wilderness rows (14.0%, the largest family); `Moss-Slicked Stone`, `Springy Turf / Tundra Moss`; the Guard Post's locked "maintained overgrown" headline |
| `GF-11` | **Leaf-litter / duff drift** | material | `GM-P05` | drift, rot, compact | **low + leeward** | `Dry Leaf Litter / Shed Pine Needles`, `Pinecone Blanket / Seed Pods`, `Thick Straw / Sawdust`; Forest = 14.29% of arrivals |
| `GF-12` | **Fungal bloom** | material + prop (cards) | `GM-P04`/`GM-P05` | fungal, damp, spore | crevice + dark + damp | 12/200 wilderness rows (6.0%); `Yellow Mold`, `Death Mold`, `Sturdy Fungi Caps`, `Cave Slime`; the `fungal-glow` light recipe already exists |
| `GF-13` | **Spoil / tailings / refuse** | material + prop | `GM-P03` + `GM-P02` | deposit, sort, rot | **deposit anchor** (a dump point, not noise) | Site 5's own bill of materials names `spoil/tailings/slag`; `Refuse & Slops`, `Broken Glass` |
| `GF-14` | **Stain / scorch / track** | **decal-paint — NOT a material patch** | n/a | n/a | host-driven | ART-DIRECTION-CANON's decal exemption (2026-07-14) governs; `Oil Spill`, `Blood & Viscera`, `Slick Gore`, `5-foot wide drag mark` |

**`GF-14` is listed deliberately.** It is the bin-discipline control: the temptation is to solve
scorch/blood/oil as another blended material, which costs a parent, a blend slot, and a mask for
something that is *by canon* a flat naturalistic surface mark with strict top projection. Every
candidate that arrives later gets sorted through the same three-bin test before it is allowed a
parent. **A family that does not change footing, roughness, or silhouette is a decal, not a ground
material.**

**Fourteen families, across three new parents and eight existing/promoted ones.** Ten of the fourteen
carry a mask bias other than "traffic" —
which is exactly why noise-driven placement fails (§5).

### 2c. The condition vector, extended for ground

MATERIAL-LANE §5b's rolled condition vector (age / moisture / overgrowth / damage) gains **two ground
axes**, derived deterministically from already-rolled facts, never invented downstream:

- **`exposure`** — wind and sun incidence at this ground rect. Drives which side of an obstruction
  `GF-04`/`GF-06`/`GF-11` accumulate on, and whether `GF-05`/`GF-10` survive. Derived from biome +
  the site's rolled aspect/slope + weather/time-of-day where present.
- **`traffic`** — per **circuit edge**, not per room. Drives `GF-01` and the polish/deposit inversion
  (§5e). Derived from the site's operating circuits (§5d), which are already a required golden-site
  fact.

Both obey the standing law (MATERIAL-LANE §9.1): **condition masks consume canonical inputs and never
invent history.** A renderer-side "add some wear" roll is a parallel authority and is forbidden.

---

## §3 Seams — the blend system

This is the load-bearing technical decision. It gets the most argument because the wrong choice here
is either invisible or unaffordable.

### 3a. What was considered, and why each was rejected

| approach | why not |
|---|---|
| **Hard tile swap** (today) | this *is* the complaint. Boundaries are cell-quantized, therefore axis-aligned, therefore mechanical. |
| **Decal quads over the base** | works for `GF-14`, fails for materials: a decal cannot honestly change **roughness or normal**, so a "mud patch" stays dry-looking under a raking practical — the exact light the LIGHT RIG LAW puts on it. Also N extra transparent draws with sorting risk. |
| **N-way runtime splat (4+ materials, weight texture)** | the industry answer, unaffordable here. MATERIAL-LANE §1d: *fragment cost × resolution is the real gate*, `MeshStandardMaterial` already costs 2–3× Lambert, and the ground is the largest-area surface in frame. 4 materials × 3 maps = 12 fetches/fragment on the biggest surface, plus 12 of the 16 guaranteed texture units before the grid, shadow map and env. It eats the entire DPR 1 dividend the material lane bought. |
| **Vertex-colour blending on the floor mesh** | free, and wrong: floor-mesh vertex density **is** the tactical cell grid. Blend resolution = cell resolution = the blocky rectangles we are trying to kill. Subdividing to fix it trades fragment cost for geometry cost and still quantizes. |
| **Full per-room bake to one texture set** | seductive (one draw, one texture, perfect provenance, hashable receipt), but it destroys texel density: CL-R4b's declared scale is **1.65 m/tile**; a 512² parent is ~94 px/ft, so a 60-ft room baked at native density is a 5,600 px texture. Baking at an affordable size means a visibly softer ground than the walls beside it. Rejected as the primary path; retained as the **beauty-sandbox** path (§3f). |
| **Dithered / ordered-threshold transition at the pixel register** | tempting because the sprite corpus is pixel art — and wrong by canon. ART-DIRECTION-CANON's **decal exemption** (2026-07-14) already rules that flat surface marks are *naturalistic organic* — matte, irregular natural edges, realistic spread for the material — with **no** faceting or quantization. A ground patch is a surface mark at scale. Dither would put a rejected register on the largest surface in frame. |

### 3b. THE TWO-PARENT LAW — the chosen approach

> **A ground surface blends at most TWO parent material sets — a base and a patch — weighted by a
> single-channel mask. All three PBR channels blend. Everything beyond the second parent resolves as
> a mutator variant of one of the two, or demotes to the decal bin, or takes geometry.**

Cost: 3 + 3 + 1 = **7 texture fetches per ground fragment** against 3 today. Roughly 2× fragment cost
on the ground plane only, comfortably inside the DPR 2→1 dividend MATERIAL-LANE §1d measured (DPR 1 +
Standard ≈ 0.5–0.75× today's DPR 2 + Lambert). Texture units: 7 of 16, leaving room for the grid
overlay, shadow map, and a future PMREM.

**Why two is not a compromise but the honest number.** The footing roll produces exactly one surface
flavor and one coverage per segment — *base plus one patch* is the shape of the data. The
`wilderness-tactical-terrain` footprints that could add a third are **cover, trench, log, canopy** —
geometry and props, not ground materials. And Adam's own CL-R4b ruling already made "two materials,
same test, matched bays" the proof grammar; this law is its runtime twin.

**And STAGE LAW makes it sufficient.** Because every scene floats inside a bounded diorama
(§1e) there is no horizon, no streaming, no LOD ring, and no unbounded terrain demanding an
open-world technique. A composed ground here is a *set dressing problem at room scale*, and two
parents plus geometry covers room scale.

**Declared cost: this is the engine's first custom surface shader.** The survey is unambiguous —
there is no shader-level surface machinery in Genesis today. No `ShaderMaterial` for floors, no
splat, no blend weights, no height-blend, no triplanar; the only `onBeforeCompile` hooks are the
legacy PSX dither/vertex-snap tweaks, and every surface variation is currently baked into a CPU
canvas before it reaches the GPU. MATERIAL-LANE §5b said so plainly: *"runtime map blending is
deferred shader work — buckets first."*

So the two-parent blend is a **protected-core-adjacent renderer change** and gets treated like one,
on the same terms the charter granted render-scale/DPR: evidence-gated, measured on the gate machine,
its own charter §5 adoption entry, never hot-patched. It also needs a second UV set and an `aoMap`
on production floor meshes, which today exist **only** in the Clayroom benches
(`theater-clay-room.js:2616`, `:3039` — `uv1` cloned from `uv0` to satisfy three.js's AO channel);
no production floor carries `uv1`, `aoMap`, or a lightmap. CL-G1 measures before anything lands.

**The fallback is already law.** Missing blend support, missing maps, or a refused composition
degrades to the single-material painter path — the SUBTLE-TEXTURE implementation clause's surviving
role — exactly as `interiorTextureVariantFor(…) || <procedural>` already does.

**Escape valves, in priority order** (a third demand takes the first that applies):

1. **Mutator variant** — a second wet region on a muddy base is the same parent at a different
   condition bucket, expressed in the mask's *value*, not a new slot.
2. **Geometry** — a puddle is a water plane; a gravel spill can be a shallow lens; a snow drift can
   be a low mass. These already have geometry recipes in the `GP-LP-*` bill of materials.
3. **Decal bin** — per §2b's `GF-14` test.
4. **Refuse, loudly.** Per the CL-R5 preventive-invariant ruling: illegal compositions reject with a
   typed receipt rather than rendering a curated exception.

### 3c. The mask — where the shape comes from

The mask is generated at mount, deterministically, seeded from the segment id — **and its silhouette
is a direct function of the coverage column the engine already rolls (§1a).**

| rolled coverage | mask generator |
|---|---|
| `100% of Area` | mask ≡ 1 → the patch parent *becomes* the base. **Degenerate case is byte-identical to today's single-material behaviour** — the regression law is satisfied by construction. |
| `20x20 patch`, `One 10x10 patch`, `10x20 patch` | one blob, radius from the stated footprint, centre at a seeded legal cell |
| `1d4 10x10 patches`, `1d6 5x5 patches`, `Scattered 5x5 patches` | n blobs, n from the stated dice, Poisson-disc placement so they neither clump nor grid |
| `50% of Area`, `25% of Area` | large-scale value-noise thresholded at the stated fraction — the **only** case where noise decides *extent*, and even then the fraction is rolled |
| `10-foot wide strip`, `15-foot wide strip` | a warped ribbon across the rect, orientation seeded, width stated |
| `5-foot wide path`, `10-foot wide center path` | **not a ribbon — a wear path.** Routed through §5d's circuit graph. A path that connects nothing is refused. |
| `Outer Perimeter (5-foot edges)` | inset ring at the stated inset, following the *real* rect boundary including reveals and alcoves |
| `Chokepoint`, `gap dividing area`, `bridge`, `stream` | geometry obligations, not masks — escalate to §3b valve 2 |

**Three stacked mechanisms make the boundary organic:**

1. **Domain warp.** The mask edge is displaced by seeded fBm at two octaves — a coarse octave at
   roughly the patch's own scale (so the blob is not a circle) and a fine octave at roughly the
   material's unit scale (so the edge is not a smooth curve either). **No natural/natural boundary
   may be axis-aligned** — an enforceable invariant, tested by sampling boundary-normal orientation
   histograms in the receipt.
2. **Pair-declared transition width.** Every parent pair declares how wide its blend is and what
   *kind* of edge it is (see §3d's table). This is what stops "everything cross-fades over 3 feet,"
   the tell of a splat map.
3. **Height-aware modulation.** The mask is modulated by the **host parent's own height/AO channel**
   before it is applied — MATERIAL-LANE §5a's "texture-space knows where the crevices are," lifted
   from texture scale to composition scale. Deposit families bias low, wind-lain families bias high
   and leeward, growth families bias crevice and shade (§2b's mask-bias column). This is why
   noise-only placement reads fake: real ground is a *record of forces*, and the forces have
   direction.

**Filtering ruling.** The mask is **linear-filtered even where albedo is `NearestFilter`.** A
nearest-filtered mask produces texel-stair boundaries — which is a re-derivation of the mechanical
look at a smaller scale. Mixed per-map filtering is already the established pattern (MATERIAL-LANE
§1d: albedo nearest, normal/ORM linear); the mask joins the linear set. Mask resolution is
clay-calibrated at CL-G0, not taste-locked here.

### 3d. THE MADE-EDGE LAW — the direct answer to the "rectangular path tile"

> **The rectangle is not the error. The missing kerb, the missing invasion, and the missing offset
> are.**

Real paths *do* have hard, straight, made edges — that is what makes them read as built. What Genesis
is missing is that a made edge is a **built object**, not a texture boundary:

> Any boundary between a **worked** family (paving, timber deck, made road/apron) and a **natural**
> family is a MADE EDGE. It must carry (a) real geometry — a kerb, verge, or revetment lip; (b) a
> ground trim band on that geometry (§4); and (c) **one-sided invasion**: the soft material drifts,
> creeps, and stains ONTO the hard one; the hard one never fades into the soft one. Stone does not
> cross-fade into soil, and the moment it does, the frame reads as a video game.
>
> Any boundary between two **natural** families is a BLENDED EDGE with the pair's declared width and
> kind. It may not be axis-aligned.

Pair table (widths clay-calibrated at CL-G1/CL-G3, kinds are the ruling):

| pair | kind | behaviour |
|---|---|---|
| granular ↔ granular (`P01`↔`P01`) | soft | widest blend; sand into ash into dust genuinely interpenetrate |
| granular ↔ cohesive (`P01`↔`P02`) | soft | medium; the granular rides on top |
| cohesive ↔ organic mat (`P02`↔`P04`) | **fringe** | narrow blend + a *torn* sward edge — turf does not fade, it tears and overhangs. The single highest-value edge in the game (it is every wear path's boundary). |
| clast ↔ anything (`P03`↔`*`) | **scatter** | no blend at all — individual clasts scatter outward past the mask edge with falling density. A gravel edge is a *population gradient*, not an alpha ramp. |
| organic litter ↔ anything (`P05`↔`*`) | **drift** | asymmetric: piles against obstructions, thins on the windward side |
| vitreous ↔ anything (`P06`↔`*`) | hard + rim | ice has a real melt rim; a blend here reads as fog |
| **worked ↔ anything** | **MADE** | geometry + trim + one-sided invasion. No blend. |

### 3e. What blends, exactly

**All three channels, always.** The most common failure mode in this class of system is blending
albedo and leaving one flat normal and one roughness across the seam — the patch looks painted on.
CL-G1 carries an explicit negative control for it (§7). Roughness in particular is the *entire* read
of `GF-02`/`GF-03`/`GF-05` under a raking practical.

The **grid overlay is composited after the ground blend, unchanged** — surface-clipped,
alpha-weighted multiply, depth-tested, per Adam's 2026-07-26 ruling. The ground blend must not
brighten or bleach beneath it, and the grid must stay legible over the darkest patch family. That is
a measured gate at CL-G5, not an assumption.

### 3f. The beauty-sandbox path (declared, not adopted)

The rejected full-bake is retained as the **beauty-shot** path only: at 2048² parents in the
higher-end sandbox, a per-room composed bake is affordable and gives a perfect single-draw ground.
Quality tiers are a re-export, not a re-author (MATERIAL-LANE §4), so the same `.ptex` graphs and the
same masks serve both. **The gate machine ships the two-parent blend.**

---

## §4 Trim-sheet catalog

### 4a. Why ground needs its own layout

`genesis-architecture-core-h6-v1` — plain, base-course, cornice-belt, coping-cap, stair-nosing,
curb-retaining — is a **wall-band** layout: its slots run along vertical faces at declared band
heights. Ground trim runs along *horizontal boundaries* and is seen mostly from above at the fixed
production camera. Its physical scales, repeat lengths, and corner behaviours differ. Forcing ground
roles into wall slots would violate TRIM-SHEET-PIPELINE §6.3's texel-density law (a motif sized for a
cornice is wrong on a verge).

**Decision: one new layout id, `genesis-ground-edge-h6-v1`, under the existing contract.** Same
full-width horizontal bands, same deterministic manifest-owned packer, same gutters, same clamped-V
sampling, same run segmentation, same geometry-owns-profile split, same truthful fallback chain. A
second layout, never a second contract.

### 4b. The six slots

| slot | role | must contain | serves |
|---|---|---|---|
| `plain-ground` | fallback band | the compatible plain band the contract requires | every missing-art path |
| `kerb-face` | the vertical face of a raised made edge | stone/timber/earth kerb face at ground-edge scale, with a worn upper arris and a soiled lower foot | **the made-edge law's geometry** — path, road, apron, plaza, terrace |
| `verge-fringe` | the soft-to-hard transition strip | turf overhanging and tearing onto stone; gravel scattered off a road shoulder; soil wash. Directional: one side soft, one side hard. | **the single highest-value band in this program** — it is the answer to "rectangular path tile" |
| `waterline` | the wet/dry band | mineral rim, algae line, saturation step, a stain above and a slick below | `GF-03`, ditches, flooded lower galleries, tide lines, drainage |
| `rootline-collar` | growth meeting a vertical foot | moss collar, leaf drift, splash-back stain, crevice growth at a wall base or rock foot | wall-base transitions, `GF-10`, `GP-MM-M11`'s toolkit, the Guard Post's "maintained overgrown" headline |
| `earth-tread-edge` | the worn lip of an unbuilt step | rounded earthen nose, exposed root or stone in the tread face, wear polish at the crown | terrace edges, cut steps, revetment tops, `stair-nosing`'s natural sibling |

Feature promotions, explicitly **not** MVP: `drain-channel`, `field-boundary/hedge-base`,
`threshold-sill`, `cart-rut-pair`. Named so the plan does not lose them.

### 4c. The sheets

Per TRIM-SHEET-PIPELINE's own law and the CL-R5 precedent (which shipped two atlases against one
layout), sheets vary by **material family of the hard side**, not by culture:

| # | sheet | status |
|---|---|---|
| 1 | `ground-edge-diag-h6` — six-colour diagnostic with ids, arrows, repeat markers, scale ticks | **mandatory first**, per CL-R5's "diagnostic sheet before beauty art" law |
| 2 | `ground-edge-worked-stone-h6` | paving/plaza/kerb edges — rides the two approved CL-R4b parents |
| 3 | `ground-edge-packed-road-h6` | road/apron edges — rides `GP-MM-M04` |
| 4 | `ground-edge-timber-h6` | boardwalk/deck/duckboard edges — rides `GP-MM-M07` |
| 5 | `ground-edge-outcrop-h6` | rock-foot and natural-shelf edges — rides `GP-MM-M06` |

**Five sheets, one new layout, six named slots.** Every sheet implements the same slot ids and
meanings; a sheet swap is a material-family swap, never a layout change. Source strips are authored
independently (generation may help make each strip; it never owns the atlas layout), then normalized,
proven for horizontal repeat, and packed deterministically — TRIM-SHEET-PIPELINE §5 steps 1–5
unchanged.

---

## §5 Composition — how the engine decides placement

### 5a. The ground fact record

Per §1f there is **nowhere in today's data to put any of this** — `REALM_SURFACES` entries carry only
`base` + `baseTint`, and a `FLOOR_MATERIAL_RECIPES` entry is a per-texel draw function with no
scale, tiling, roughness, or UV field at all. So this is a genuine new record, not a rename.

It is built at board assembly (alongside `theaterBoardBuild` / `interiorBuildBoard`), it is
deterministic, and it carries provenance:

```text
ground: {
  base:      { parent, mutators[], condition, surfaceName },   // from theaterFloorMaterial, unchanged
  patch:     { family, parent, mutators[], coverage, maskSeed } | null,
  wear:      [ { circuitEdgeId, fromAnchor, toAnchor, trafficClass, width } ],
  edges:     [ { kind: MADE|BLENDED, pair, trimSlot, geometryRef } ],
  condition: { age, moisture, overgrowth, damage, exposure, traffic },
  provenance:{ tableIds[], rolledTotals[], seed, recipeVersion }
}
```

Everything in it derives from facts the walk already rolls. Nothing downstream may add to it.

### 5b. THE COVERAGE LAW — rolls decide, noise shapes

> **The patch family and its extent come from the roll. Noise only shapes the mask; it never decides
> whether a patch exists, what it is, or how much ground it takes.**

This is the anti-drift mechanization pattern applied to ground: the script owns the noun. It answers
the brief's "noise-driven? roll-driven?" directly — **roll-driven placement, noise-driven shape.** A
purely noise-driven ground is a parallel authority over world state and is forbidden by charter §1.5
(*graphics consume facts; graphics never become the source of those facts*).

It also means the honest work order is **recover the discarded columns first, render second.** A
beautiful blend fed by invented noise would be a worse outcome than today's flat tile, because it
would look right and be lying.

### 5c. THE DEPOSITION LAW — every family knows which way the forces run

> **A patch family's mask is biased by the physical process that puts it there, read off the host
> parent's own height channel plus the `exposure` axis. A family with no declared bias is not
> admitted.**

| process | families | bias |
|---|---|---|
| settles / pools | `GF-02`, `GF-03`, `GF-11` | low ground, host height minima, obstruction upstream faces |
| wind-lain | `GF-04`, `GF-06`, `GF-07` | high ground and **leeward** of obstructions; scoured on the windward side |
| grows | `GF-09`, `GF-10`, `GF-12` | crevices, shade, damp, north faces; **suppressed by traffic and by repair** |
| worn | `GF-01` | circuit edges only (§5d) |
| spilled by hands | `GF-13` | a real deposit anchor — a mouth, a door, a cart stand — never scattered noise |
| gravity-sorted | `GF-08` | slope feet, with clast size sorting *down* the run |

This is the difference between a ground that looks composed and one that looks noised. It is also the
cheapest realism available: it costs one extra texture read of a channel we already export.

### 5d. THE CIRCULATION LAW — wear paths come from circuits, not from noise

Every golden-site brief already requires **operating circuits** as canonical facts — real routes
between real anchors (approach → threshold → guardroom → lookout; workstation ↔ store ↔ water;
public vs. staff vs. prisoner circulation). `GOLDEN-SITES-CATALOG.md` states it plainly: *"Every hook
touches a real operating circuit and at least one map lever,"* and the Guard Post's own acceptance
list names *"a working approach/apron connects road to post threshold"* and *"no decorative stair
disconnected from the route."*

> **Wear is the visible record of a circuit. The composer walks the circuit graph and lays a wear
> ribbon on every edge with a declared traffic class. A wear path that does not connect two canonical
> anchors is illegal and is refused, loudly.**

Rules:

- **Route, don't draw.** The ribbon follows a real path between the two anchors — around obstructions,
  through the legal threshold, on the walkable surface census — with seeded lateral wander. Never a
  straight line, never grid-aligned, never a rectangle. (A straight run *is* legal when the built
  geometry is straight — a walled corridor — because then it is the architecture, not the mask.)
- **Terminal state is `GF-01`.** Wear does not add dirt; it *removes* the base toward its bare-earth
  derivative. Sward → soil. This is exactly why `GP-MM-M05` had to split (§2a).
- **Width from traffic class, not from taste.** Foot / handcart / draft / herd. Widths
  clay-calibrated.
- **Merges widen.** Where two circuit edges converge the ribbon widens and its centre deepens — the
  real property that makes desire lines read as used rather than drawn.
- **The polish/deposit inversion.** Where a wear ribbon crosses a **worked** run it does not wear the
  stone. It *polishes* it (roughness down along the walked line, one of the truest and cheapest
  effects available) and it *deposits* onto it (soil tracked from the soft side, thinning with
  distance from the boundary). This single rule kills the "path tile cutting through grass" read from
  the other direction: the paving is no longer a clean rectangle sitting in a clean field, it is a
  stone run with mud walked onto its first two feet.
- **Abandonment heals.** When a circuit is blocked or disused, the wear ribbon's mask erodes from the
  edges inward at a rate set by `age`, and the growth families invade it. Same fact, opposite sign.
- **Suppression is a fact, not a look.** A maintained path stays clear because maintenance is
  canonical (the Guard Post's locked "maintained overgrowth" headline). Growth families are
  suppressed on active circuits *because the site is operating*, and the DM can say so.

Two enforceable invariants fall out, in the CL-R5 preventive style (pre-mount check + negative
regression, not a screenshot patch): **(i)** every wear ribbon references two canonical anchors;
**(ii)** every MADE edge in `ground.edges` has real geometry and a trim slot, or the composition is
refused.

### 5e. Where §5c and §5d disagree

Deposition says mud settles low; circulation says the path goes where the route goes; the two collide
when the route runs through the low ground. **Circulation wins on the ribbon, deposition wins beside
it** — which is the true answer: a path through a hollow is a *muddy* path, and that is the most
characteristic ground in fantasy fiction. Encoding the collision rather than picking a winner is the
point.

### 5f. THE REALM-HONESTY LAW

> **A patch family expresses through its realm's own register, or it does not exist in that realm.
> There is no realm-agnostic flower.**

Mechanism — **no new colour authority.** Every realm surface already carries an authored `baseTint`
resolved by `theaterApplySurfaceTint` and graded by the realm render profile (REALM-SURFACES-WIRING
§3 decision 2, landed 2026-07-08). Patch families route through **that same funnel**. Palette is
already solved; what is missing is the allow/deny/express axis:

| verdict | meaning | example |
|---|---|---|
| **express** | the family exists, in the realm's own vocabulary | `GF-09` in the swamp/bog register = bog-cotton and marsh-marigold on a **peat** base with `GF-02`'s wet mutator at floor level — sparse, low, in the realm's muted palette. Not a meadow. |
| **substitute** | the family resolves to the realm's nearest legal expression | `GF-09` in `ash` (post-apocalyptic) → volunteer weeds in a crack, not blossoms |
| **deny** | the family does not exist here; a roll demanding it refuses and falls back | `GF-09` in `chrome` or `cosmic`'s void reaches |

The per-realm verdict table across 11 realms × 14 families is authorable data, not code — and its
**deny column is a founder question** (§9.3), because it is pure taste.

Grounding: `GF-09` is only 2/200 rows in the wilderness footing table (1.0%). Flowers are rare by the
dice, and that rarity is correct — which makes "when they *do* fire, they must be honest to the
realm" a cheap law to keep and an expensive one to break.

### 5g. Budget

Per board, clay-calibrated at CL-G6, declared here as shape:

- **≤ 2 parent material sets** (the two-parent law — hard).
- **≤ 1 patch family** from the footing roll; additional demands take §3b's escape valves in order.
- **≤ N wear ribbons** — one per circuit edge with a traffic class, and circuits are already bounded
  by the site brief.
- **≤ M discrete blobs** in a scattered-patch mask, from the rolled dice, capped.
- Remainder refuses with a typed receipt. **An honest refusal beats a curated exception.**

---

## §6 In-engine vs. offline vs. external

| lane | owns |
|---|---|
| **Runtime (three.js, in-engine)** | mask generation from the coverage fact · domain warp · wear-path routing over the circuit graph · the two-parent blend (the engine's first custom surface shader, §3b) · grid compositing (unchanged) · foliage-card placement from the mask · fallback to the painter recipes |
| **Offline (Material Maker 1.3, headless)** | **3 new** ground parents · **5 promotions** of the existing B03 batch · the ground mutator subgraphs · the 5 ground trim sheets · quality-tier re-exports. Pinned binary, `--export-material --target "Godot/Godot 4 ORM"`, deterministic, `.ptex` authored as JSON by Codex. Unchanged contract. |
| **Generation (Codex/ImageGen)** | trim-sheet **source strips** (TRIM-SHEET-PIPELINE §5 step 2 — never the atlas layout) · per-realm foliage card sheets for `GF-09`/`GF-12` |
| **Meshy** | **nothing.** |

### 6a. Three build facts the survey turned up that change the estimate

1. **`dev/material-lane/exports/` is gitignored** (`.gitignore:74`), while `src/engine/clay-room.js:284`
   points into it. Compiled ground maps therefore do not exist on a fresh checkout, and the ground
   program needs an explicit **export/regeneration command + cache-invalidation law** in its own
   receipt (no-human-production contract items 8 and 10). That is a real work item, not paperwork.
2. **Foliage cards are 100% spec, 0% built.** CARD LAW is written (`GRAPHICS-ENGINE.md:65`,
   MATERIAL-LANE §5c) but a grep of `src/` returns **zero** hits for `grassCard`, `tuft`, or any
   cross-pair/cross-quad construct; there is no instanced foliage renderer and no mask-driven spawn.
   Today's dressing is single billboard quads placed by slug (`buildDressingCard`,
   `src/ui/theater-dressing.js:414`). So `GF-09`'s and `GF-12`'s prop half is a **net-new build**,
   and the honest sequencing is: **prove the material half first; the cards are a separate unit.**
   Recorded so the flower patch is not quietly scoped as "one more sprite sheet."
3. **The decal art already exists and is unwired.** `assets/decals/` holds 34 PNGs — including
   `shared-moss`, `shared-water`, `shared-grime`, `shared-wear`, `shared-crack`, `shared-rust`,
   `shared-scorch` sets — with **zero code references**, while the runtime decal system
   (`interiorBuildDecals`, `src/ui/theater-overlays.js:104`) renders flat tinted `CircleGeometry`
   discs with no map at all. `GF-14`'s art is on disk waiting for its seam. Cheapest visible win in
   the whole program, and it is a *connection* job, not an art job.

**Zero Meshy requests from this program**, and that is a ruling with grounds, not an omission.
ART-DIRECTION-CANON's Meshy lane (2026-07-25) explicitly withholds permission *"to send an entire
site, room, building, wall kit, roof kit, stair, floor, or **terrain plan** to Meshy."* Ground is
procedural composition over procedural materials; there is no donor-model shape in it. The props that
*sit* on ground (drain covers, mounting blocks, bollards, wheel chocks) already ride the existing
premium-month slate and are not this program's ask. Worth stating loudly because it is a **cost**
fact: this entire program spends zero model slots.

**One genuinely open external question**, resolved by measurement not taste: whether the mask's noise
basis is runtime JS (deterministic, seeded, zero assets — the proposal) or a baked MM noise atlas
(one more texture unit, possibly cheaper per fragment). Decided at CL-G0 on measured numbers.

---

## §7 The proof ladder

A **sibling ladder**, `CL-G0 … CL-G6`, hanging off a prerequisite rung in the existing reset ladder.
It inherits `CLAYROOM-RESET-LADDER.md`'s fixture family, capture law (production renderer via
`?clayroom=1`, 1280×720 @ dpr 2, **early + settled** frames, full receipt), measurement law
(`dev/measure-clay-capture.py` over declared regions), and the table/engine/renderer boundary
unchanged. It does not fork them.

**Every rung runs through a BENCH, never the diagnostic surface router** (§1d): `texturedClayCount`
must stay 0 in the diagnostic path, and PBR ground is mounted the CL-F04/CL-F05 way.

**Prerequisite — `CL-R4c` ground parents.** *Unblocked 2026-07-27* by Adam's approval of both masonry
parents (CL-R4a's stated block was on ground/timber/iron expansion). Two halves, and the first half
is nearly free:

- **`CL-R4c-i` — promote the five B03 materials that already exist** (`grass-meadow`, `mud`,
  `gravel-scree`, `marsh-bog`, `worn-path`). Re-export from the banked v003 graphs, route through the
  `CL-F04` matched-bay rig — same eight specimens, same physical tile scale (1.65 m/tile), same UV
  phase law, same camera, same light, same four comparison modes (PBR / albedo-only / clay /
  too-much-normal) — and card them. This is verification work against existing art. **It is the
  cheapest capture packet available in this program and should be the first thing Adam sees.**
- **`CL-R4c-ii` — author the three new parents** (`GM-P01` fine granular, `GM-P05` coarse organic
  litter, `GM-P06` crystalline/vitreous), same rig, same cards.

Taste cards per MATERIAL-LANE §2 in both halves, **including the sprite-context strip**: a ground
material that upstages the standee FAILS regardless of how good it looks alone. Ground is the largest
surface in frame and is therefore the SUBTLE-TEXTURE principle's hardest test in the whole game.

| rung | primary question | proves | negative control |
|---|---|---|---|
| **CL-G0** — diagnostic ground bench | can we see the mask before the art? | a fixture whose only subject is the ground: bounded ground rect at the production camera, six-colour diagnostic mask, mask↔world scale ticks, mask resolution and filtering, no texel-stair at any zoom, receipt records mask res / filter / seed / coverage fact | a nearest-filtered mask, shown as an intentional rejection (it is exactly the mechanical look) |
| **CL-G1** — two-parent blend truth | do all three channels blend? | base + one patch, one blob, at the governed camera; albedo **and** normal **and** ORM continuous across the seam under a raking practical; the two-parent law's measured fragment cost on the gate machine | **albedo-only blend** — the flat-normal seam that betrays every splat map, banked as a labelled rejection alongside the pass |
| **CL-G2** — the coverage census | is the discarded column now expressed? | all 18 wilderness coverage shapes + the urban shapes, from **real rolls**, one contact sheet, production camera; boundary-normal orientation histogram in every receipt proving **no axis-aligned natural boundary**; `100% of Area` degrades byte-identically to today | a cell-quantized mask (today's behaviour) rendered beside it as the before |
| **CL-G3** — made edges | does stone stop being a rectangle in a field? | paving↔turf, road↔verge, deck↔mud, wall-base rootline, waterline — each with real kerb/lip geometry, the correct `genesis-ground-edge-h6-v1` slot, and one-sided invasion; the six-colour role debug over the same geometry | a **cross-faded** worked↔natural edge, banked as the rejection that names the failure |
| **CL-G4** — wear from circuits | is circulation legible as ground? | a guard-post-shaped circuit graph routed by the composer: ribbons connecting real anchors, widening at merges, polishing + depositing where they cross paving, healing on an abandoned leg | an **orphan ribbon** (connects nothing) must be **REFUSED with a typed receipt**, not rendered — the CL-R5 preventive-invariant pattern, with a mutation regression that reproduces and rejects it |
| **CL-G5** — the dark case | does composed ground survive the light? | the full composed ground under `dark`, `torchlit`, and `moonlit` recipes at the governed camera. Declared measurement regions: **lit pool · mid-falloff · far dark**. Reports per region: mean luminance, patch-boundary contrast ratio, grid legibility over the darkest family, and the standee's contact read. Gates under the **BRIGHTNESS LAW**: ground never becomes the brightest thing in frame; nowhere indoors ≥0.9; far-dark boundary contrast holds a floor (**number clay-calibrated at this rung, not asserted here**) | an over-lit ground that reads at full brightness in a torch room — the exact BRIGHTNESS LAW violation, banked labelled |
| **CL-G6** — seed resilience | do the rules survive variation? | rides CL-R6's law: one retained golden seed + ≥8 changed seeds per admitted ground fixture; same seed + recipe version byte-identical; adversarial smallest/largest ground rect; a patch whose blob falls entirely under a wall; a wear ribbon whose anchors are adjacent; `100% of Area` regression | **no seed-specific branches, no hand-placed coordinates** — a grep-level gate, plus a typed rejection receipt on every failure rather than broken geometry |

**Seven rungs**, plus the `CL-R4c` prerequisite. Execution order is the table order; `CL-G0` and
`CL-R4c-i` can run in parallel (one is tooling, the other is re-export + carding of existing art).

**One migration this ladder must not skip.** The alpha-weighted-multiply grid Adam ruled for
2026-07-26 exists **only in the Clayroom** — `clayRoomBuildSeamGrid` (`theater-clay-room.js:4583`,
`CustomBlending`, `DstColorFactor`/`OneMinusSrcAlphaFactor`, world-space strips at `gridStripWidth
0.025`, `gridOpacity 0.34`). The **production** grid is a different, older function —
`f1BuildCombatGrid` (`theater-interior-realize.js:262`) — using standard alpha blend at
`F1_GRID_OPACITY 0.16` with per-cell `PlaneGeometry`. Adam's ruling was that the grid must read *on
top of the material*; the moment production floors carry composed ground, the production grid inherits
the same problem the Clayroom already solved. **CL-G5 measures both**, and the migration is named here
so it is not discovered at ship time.

**Every rung banks its packet for Adam and stops.** Claude re-gates the measurable back end; the
visual verdict is Adam's, per the front/back gate split.

---

## §8 Decisions register

| # | decision | grounds |
|---|---|---|
| 1 | **THE TWO-PARENT LAW** — a ground surface blends at most two parent sets, all three channels | fragment cost is the gate (MATERIAL-LANE §1d); 7 fetches/fragment fits the DPR dividend, 12+ does not; and *base + one patch* is the literal shape of the footing roll |
| 2 | **THE COVERAGE LAW** — rolls decide placement, noise only shapes | charter §1.5 (graphics consume facts, never source them); the coverage column already exists and is discarded at four sites |
| 3 | **THE MADE-EDGE LAW** — worked↔natural boundaries get geometry + trim + one-sided invasion; they do not blend | the hard edge is *correct*; the missing kerb and missing invasion are the actual defect. Cross-fading stone into soil is the tell that reads as a video game |
| 4 | **THE DEPOSITION LAW** — every family declares a physical bias read off the host height channel | lifts MATERIAL-LANE §5a's crevice-aware masking from texture scale to composition scale; costs one read of a channel already exported |
| 5 | **THE CIRCULATION LAW** — wear comes from operating circuits; an orphan path is refused | circuits are already canonical golden-site facts; makes wear a *record* rather than decoration, and yields a free anti-drift invariant |
| 6 | **THE REALM-HONESTY LAW** — express / substitute / deny per realm, through the existing tint funnel | `theaterApplySurfaceTint` + `baseTint` already landed 2026-07-08; adding a second colour authority is forbidden. Deny is the honest option a palette-only system cannot offer |
| 7 | **No dithered / faceted ground transitions** | ART-DIRECTION-CANON's decal exemption already rules flat surface marks naturalistic-organic with no faceting; a ground patch is a surface mark at scale |
| 8 | **Mask is linear-filtered even where albedo is nearest** | a nearest mask re-derives the mechanical staircase at a smaller scale; mixed per-map filtering is the established pattern |
| 9 | **`GP-MM-M05` resolves as `GM-P02` cohesive earth + `GM-P04` organic mat** | soil and sward respond oppositely to wet and to wear; fused, the sward→soil transition — the backbone of every wear path — is unrepresentable. B03 already authored them separately; this ratifies rather than invents |
| 10 | **Three new ground parents, five promotions, no more** | the structural test (grain / clast / mat / flake / plastic mass / vitreous sheet), applied against what is already on disk. `grass-meadow`, `mud`, `gravel-scree`, `marsh-bog`, `worn-path` exist at v003 with graphs, seam-locked sprites, depth guides and receipts — re-authoring them would be waste |
| 11 | **One new trim layout `genesis-ground-edge-h6-v1`, five sheets, six slots** | ground trim is horizontal-boundary trim at different physical scale; TRIM-SHEET-PIPELINE §6.3's texel-density law forbids reusing wall bands. Second layout, same contract |
| 12 | **`GF-14` (stain/scorch/track) is decal bin, not a material patch** | bin discipline: a family that changes neither footing, roughness, nor silhouette is a decal by canon |
| 13 | **Full per-room bake rejected for the gate machine, retained for the beauty sandbox** | 1.65 m/tile × 512² parents = ~94 px/ft; a 60-ft room at native density is a 5,600 px texture. Quality tiers are a re-export, not a re-author |
| 14 | **Zero Meshy slots** | ART-DIRECTION-CANON's Meshy ruling withholds terrain plans explicitly; there is no donor-model shape in procedural ground |
| 15 | **A sibling `CL-G` ladder, not an edit to `CL-R0…CL-R6`** | ground composition is not a linear extension of trim projection; a sibling ladder inherits every law without forking the reset ladder's numbering |
| 16 | **Target the interior-3D realizer; the tabletop tray keeps its painter path unchanged** | the interior channel is what the production camera, the Clayroom, CL-F04/CL-F05, the traversability grid and the golden-site program all run through. Two disjoint vocabularies exist (§1f); widening both at once doubles the work and halves the proof |
| 17 | **The two-parent blend is treated as a protected-core-adjacent renderer change** | Genesis has *no* shader-level surface machinery today; this is the first custom surface shader. Same terms the charter granted DPR/render-scale: evidence-gated, measured on the gate machine, its own §5 adoption entry, never hot-patched |
| 18 | **Promote before authoring: `CL-R4c-i` (existing B03 art) precedes `CL-R4c-ii` (new parents)** | five ground materials already exist unwired; the cheapest capture packet in the program is a re-export away, and it de-risks the three new parents by proving the channel routing first |
| 19 | **Foliage cards are a separate unit; the material half of `GF-09`/`GF-12` proves alone** | CARD LAW is 100% spec and 0% built — no cross-pair, no instanced foliage, no mask-driven spawn exists. Bundling them would hide a net-new renderer build inside a material program |
| 20 | **`CL-G` rungs mount through benches, never the diagnostic surface router** | the Clayroom's flat grey is a hard-enforced contract (`texturedClayCount` must be 0); a textured floor in the diagnostic path *is* the CR-1 regression |

---

## §9 Founder questions

Genuine taste and direction only. Everything else in this document is ruled with grounds.

1. **The made-edge ruling (§3d) is the load-bearing taste call.** I have ruled that a path's edge
   *should* be hard and straight where it is built — a kerb, a lip, a made line — with the soft
   material invading it, rather than everything cross-fading. The alternative reading of your brief
   is that you want every boundary soft. Which is it?

2. **How loud should circulation read?** A whisper (a faint polish and a slight colour shift along the
   route) or a visibly beaten track (bare soil, ruts, a real depression)? This sets the wear-ribbon
   strength for the whole game and it is not measurable — it is a look.

3. **The deny column (§5f).** Which realms simply have no bloom or growth expression at all? My
   instinct: `chrome`, `cosmic`'s void reaches, and `bright-kingdom` (whose "growth" would be
   confection, not flowers) — but that is taste, and getting it wrong makes a realm read soft.

4. **Does snow get a seasonal axis in v1, or only where the biome rolls Arctic?** Arctic is 12.24% of
   arrivals — *higher than Grassland*. A seasonal axis makes snow available everywhere and roughly
   doubles the patch-condition space; biome-only keeps it at one-tenth of the world. Real scope
   question, not a detail.

5. **Should `urban-footing` be wired?** It is 100 authored rows, 61 of them patch-bearing, compiled
   and completely unread by any walk builder. Turning it on gives urban boards the same composed
   ground wilderness would get — and adds a rolled fact to a place that currently has none. It is
   also new roll consumption in a shipped path, which is a design decision, not a bug fix.

6. **Do you want the five already-authored B03 ground materials carded now, ahead of everything
   else?** `grass-meadow`, `mud`, `gravel-scree`, `marsh-bog`, `worn-path` exist at v003 with graphs,
   seam-locked sprites and receipts, and have never been rendered. A re-export plus a CL-F04 pass
   would put five ground taste cards in front of you within one work unit, before any of this
   program's harder machinery is built. My recommendation is yes — but it spends your review
   attention, which is the scarcest thing here, so it is your call.

---

## §10 Registrations owed (for a future folding session)

New file only; nothing below was touched in this lane.

- [ ] `MATERIAL-LANE.md` — register the three new `GM-P**` parents, the five B03 promotions, and the
      ground mutator additions as a **consumer roster** (the §9 pattern); record the `GP-MM-M05`
      resolution with its grounds; note that the B03 exterior-ground batch exists at v003 with zero
      consumers in `src/`.
- [ ] `MATERIAL-LANE.md` §3 Wave 1 — the "drop-in demand" ordering should follow the real usage tally
      (`plank` 12 / `flagstone` 12 / `ash` 10 / `mud` 9 lead; **`grass` is 1 of 88**), not intuition.
- [ ] `MATERIAL-LANE.md` §5b — this program supplies the runtime-blend answer that section deferred
      ("buckets first"); record the two-parent law as its successor with the cost grounds.
- [ ] `CLAYROOM-RESET-LADDER.md` — add `CL-R4c-i`/`CL-R4c-ii` (unblocked 2026-07-27) and a pointer to
      the `CL-G0…CL-G6` sibling ladder; note the bench-not-router requirement.
- [ ] `TRIM-SHEET-PIPELINE.md` §4.2 — register `genesis-ground-edge-h6-v1` as a second layout id with
      its six slot ids and semantic roles.
- [ ] `GRAPHICS-CONVERGENCE-CHARTER.md` §5 — adoption entry for the two-parent ground blend as a
      protected-core-adjacent renderer change (the DPR/render-scale precedent).
- [ ] `ART-DIRECTION-CANON.md` — decision-capture for whichever of §9's questions Adam rules, verbatim.
- [ ] `FLOOR-TEXTURES.md` §2 — the published biome map is **stale**: it lists the `WILDERNESS_BIOMES`
      fallback names and omits `Deeplands`/`Underwater`. The shipped `THEATER_FLOOR_BIOME_MAP`
      (`theater-data.js:735`) covers all ten; correct the doc to match, and record the 10→7 collapse.
- [ ] `GOLDEN-SITES-CATALOG.md` — Guard Post consumer view: point `M04`/`M05`/`M11` at this program's
      parent resolution and the ground trim layout.
- [ ] `GRAPHICS-ENGINE.md` — CARD LAW is spec-only; mark it explicitly unbuilt so it is not read as
      landed (grep of `src/` returns zero cross-pair / tuft / grass-card implementations).
- [ ] `NEXT-STEPS.md` — register `CL-R4c-i`/`-ii` + the `CL-G` rungs in the visual-proof track.
- [ ] `CLAYROOM-PROOF-BACKLOG.md` **A14** — cross-reference this program as the "cover" third of the
      form/join/cover split (§0), so the two same-day lanes resolve as siblings rather than rivals.
- [ ] Cowork memory — record the ground-materials program's existence and the five named laws.

---

## §11 The five named laws, in one place

For quoting into briefs and executor specs without re-reading the document:

1. **THE TWO-PARENT LAW** — a ground surface blends at most two parent material sets, base and patch,
   all three PBR channels, weighted by one mask. Everything beyond becomes a mutator variant,
   geometry, a decal, or a loud refusal.
2. **THE COVERAGE LAW** — the roll decides the patch family and its extent; noise only shapes the
   mask. Placement is roll-driven; shape is noise-driven.
3. **THE MADE-EDGE LAW** — worked-to-natural boundaries get geometry, a trim band, and one-sided
   invasion; they never blend. Natural-to-natural boundaries blend at the pair's declared width and
   may never be axis-aligned.
4. **THE DEPOSITION LAW** — every family declares the physical process that puts it there, read off
   the host parent's own height channel plus the exposure axis. A family with no declared bias is not
   admitted.
5. **THE CIRCULATION LAW** — wear is the visible record of an operating circuit. A wear path that does
   not connect two canonical anchors is illegal and is refused.

Plus the standing constraint that governs all five: **THE REALM-HONESTY LAW** — express, substitute,
or deny, per realm, through the existing tint funnel. There is no realm-agnostic flower.
