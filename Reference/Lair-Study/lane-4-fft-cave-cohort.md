# Lane 4 — The FFT cave cohort

type: research-lane
date: 2026-07-24
status: COMPLETE
corpus: `genesis/Reference/FFT-Guard-Post-Study/study-archive/maps/five-angle/`
(121 map ids × 5 views = 605 GIFs, 280 px–640 px, read **in place**; nothing copied,
nothing committed, no contact sheet derived)

**Binding boundary restated.** This is comparative map morphology and grammar induction. No
FFT layout is reproduced, transcribed, or converted. The output below is *relations*, and
several of the relations are stated as anti-rules precisely so that nobody mistakes them for
a map. No FFT mesh, texture, map, or screenshot is or becomes a Genesis asset.

## Method

**View convention (established by inspection, not assumed).** For every map id, `_0` is an
orthographic **top-down plan**; `_1` … `_4` are the four **isometric rotations**. The plan
view is the fastest classifier because unwalkable void renders as GIF transparency, so the
footprint's *holes* are visible directly.

**Classification aid.** The corpus is indexed by raw map id with no names. The authoritative
map-id → name table is already in-repo at
`study-archive/tools/heretic/src/map.c` (lines 116–245). I used it as the prior, then
**verified the numbering empirically** before trusting it: map 49 rendered as a snowy stone
fort with a timber bridge (= "Fort Zeakden"), 76 as a mesa desert with cacti (= "Zeklaus
Desert"), 17 as a stone undercroft with gravestones and green standing water (= "Underground
Cemetery of Limberry Castle"), 39 as a timbered gallery with lamps (= "Underground Passage in
Goland"). Four independent hits — the archive's ids are FFT map ids.

**Sampling.** ~56 images viewed: view-0 and/or view-1 for every name-flagged underground /
rock-interior / volcanic candidate plus a boundary sample of exterior rock maps and the
"Unknown" ids; then matched views (0/1/2/3/4) across the seven richest cave maps. Not all 605
were opened, by design.

## The classification (checkable)

### A — Natural cave / rock interior (the core cohort, 10 maps)

The FFT **Deep Dungeon**. These are the only maps in the corpus that are unambiguously
natural rock interiors with no builder culture.

| id | name | one-line read |
|---|---|---|
| 105 | TERMINATE | mossy stepped terraces, tan flowstone risers |
| 106 | DELTA | fragmented floor plates over void — a labyrinth cut by *removing* tiles |
| 107 | NOGIAS | dripstone-striped terraces, cobble-textured risers, breakdown pocket |
| 108 | VOYAGE | mossy dome mass with a painted boulder-field bay |
| 109 | BRIDGE | the dripstone forest; heaviest stalactite striping in the corpus |
| 110 | VALKYRIES | a serpentine corridor footprint on tall undercut columns |
| 111 | MLAPAN | water channels threading the floor + a central column with a boulder niche |
| 112 | TIGER | dark spire/stalagmite field on a cobble floor |
| 113 | HORROR | pale pink flowstone masses, vertical drip striping, terraced |
| 114 | END | a ring of striated rock enclosing an open void — the rim-chamber |

### B — Adopted void / mine (4 maps)

| id | name | note |
|---|---|---|
| 28 | Colliery Underground First Floor | pale mine-rock palette, heavy timber frames |
| 29 | Colliery Underground Second Floor | same family, cut ledges + timber |
| 30 | Colliery Underground Third Floor | same family |
| 39 | Underground Passage in Goland | **models an overhead rock mass** (see finding 4); lamps |

*Honest caveat on 28/29/30:* their palette is near-white and could at a glance be read as
snow. I classify them as pale mine rock because (a) the name table is authoritative and the
three are consecutive, (b) every one carries continuous timber shoring, and (c) none shows
sky, vegetation, or a horizon. Flagged so the classification stays checkable.

### C — Built underground (interior-craft evidence, not cave grammar; 6 maps)

17 Underground Cemetery of Limberry Castle · 57 / 58 / 59 / 60 / 61 Underground Book Storage
First–Fifth Floor. Included in the study because they show how FFT solves an *interior* under
a fixed camera (findings 4 and 5), not because they are lairs.

### D — Volcanic / molten (1 map)

75 Bervenia Volcano — a rock field with a glowing lava channel. The "nature provides light"
case, rendered.

### E — Exterior rock mass (boundary; rock grammar without an interior)

83 Zirekile Falls · 86 Doguola Pass · 87 Bariaus Valley · 90 Germinas Peak · 115 Banished
Fort. Looked at to define the edge of the cohort; not part of it.

### F — Checked and excluded

34 Cellar of Sand Mouse (reads as an exterior ruin/courtyard) · 53 Entrance to Death City
(built) · 54 Lost Sacred Precincts (built ruin) · 69 Murond Death City (built ruin) ·
70 Nelveska Temple (exterior ruin) · 91 Thieves Fort (built) · 116 Arena (flat ritual disc) ·
**117 / 118 / 119 / 125 — developer test maps** (cyan-and-yellow checkerboard geometry;
worth knowing the corpus contains them).

### Not opened

59 was opened; 60 and 61 were opened; the remaining unopened ids are ordinary town, castle,
plains, woods and swamp maps whose names carry no underground signal. If Adam wants the
classification exhaustive rather than name-primed, the residual risk is an unnamed cave
hiding inside an outdoor map id — low, but real, and stated.

## The ten-rule candidate grammar (guard-post format)

Induced relations. **Current design defaults awaiting Adam's promotion or named exceptions** —
this is not a lock.

**LC-1 — Cave irregularity lives in the RISER TEXTURE, not in the mesh.** Across 105, 107,
109, 110, 111, 113 the geometry is the *same* blocky terraced tile stack FFT uses outdoors.
What makes it read as cave is that every vertical face carries dense vertical dripstone/
flowstone striping while the horizontal tops stay comparatively plain. The lair shell should
buy its organic read from a **riser-role material**, not from sculpting.

**LC-2 — There is no ceiling.** Not one map in cohort A models an overhead surface. Under a
fixed high-angle camera a ceiling can only occlude, so FFT deletes it and lets the black
background be "not-cave." Enclosure is instead produced by *tall terrain masses at the back
of frame* (109, 113) or by a *rim of tall blocks around the floor* (114). Genesis's ceiling
question has a clean precedent answer: **imply the ceiling with a back mass; never model a
lid.**

**LC-3 — The chamber wall is terrain height, not architecture.** Map 114 (END) is the proof:
a closed ring of tall striated rock blocks around an open floor. There is no wall object —
the "wall" is simply terrain that is tall. Whatever kit Genesis mints, the cave chamber's
enclosure should be emitted by the same mass system as the floor, not by a wall run.

**LC-4 — When a ceiling IS needed, it is a black silhouette mass, and only in the built/mine
case.** Map 39 is the exception that proves LC-2: the Goland mine models a large overhead
rock mass, rendered as an unlit black vault hanging over a lit gallery. Cohort A never does
this. So: **natural = no ceiling; dug-by-culture = an unlit overburden mass.** That is also a
second free discriminator alongside Lane 3's flat-ceiling finding.

**LC-5 — Interiors are opened on two sides.** Maps 57 / 58 / 59 / 60 keep tall back walls on
the two far sides and open the two camera-facing sides completely. Map 59 goes further and
models **barrel-vault arcades as free-standing arch masses rising off the floor** — a ceiling
*implied by its springings* while the camera looks down between them. If Genesis ever wants a
modelled cave arch, this is the shape: an arch mass, not a lid.

**LC-6 — Cave labyrinths are cut by REMOVING tiles, not by adding walls.** Map 106 (DELTA)
in plan is a field of filled tiles pierced by voids; the voids are the walls. Map 110
(VALKYRIES) in plan is a serpentine ribbon cut from a rectangle. The whole navigational
structure of these maps is **subtractive**. This is a directly buildable generator posture
for the lair and it is very cheap.

**LC-7 — Water and lava are the same noun: a threading channel across the floor.** Map 111
(MLAPAN) plan shows teal water as a dendritic network winding through the rock floor; map 75
(Bervenia Volcano) plan shows lava as an almost identical dendritic network in red. Neither
is a pond. This matches Lane 1's "water is a thread or a datum" finding exactly, from a
completely independent direction.

**LC-8 — Breakdown is painted, not modelled.** Maps 108 and 111 both place a bay or niche of
stacked boulders — and it is a *texture region* on flat or low tiles, plus at most one raised
block. FFT never scatters boulder meshes. Genesis's breakdown cone/ramp should be **geometry
where it is a route (a ramp) and paint where it is only a look (a field)**.

**LC-9 — Vertical relief carries the whole composition; the floor plan is often trivial.**
Map 109's plan is a nearly solid rectangle — all of its drama is in the height field. Map
114's plan is a ring. In both cases the *interesting* fact is the elevation, not the
footprint. For the lair, spend the generator's budget on the height field and keep the
footprint simple.

**LC-10 — These maps are authored for ONE camera rotation, and this is deliberate.** Map
107 at rotation 3 is ~80% black backfaces; map 102's family behaves the same. Two of the four
rotations of a typical cave map are near-unreadable. FFT accepts that because it ships a
preferred view. **Genesis inherits an obligation FFT does not have** — if the walk/theater
camera can orbit, a cave built this way will fall apart at the unfavoured angles. This is the
single most important transfer-risk in the lane.

## Anti-rules (what the cohort refuses to do)

- **No even scatter.** No cave map scatters stalagmites uniformly; 112's spires cluster and
  leave large clean floors.
- **No modelled small rock.** Rubble, cobble, boulder fields are all texture.
- **No ambient interior light.** Where light exists it is a hard bright patch (39's lamp
  blooms; 75's lava) against otherwise unlit rock. There is no soft global fill.
- **No wall objects indoors.** Enclosure is always terrain.
- **No symmetric chamber.** Even 114's ring is broken and asymmetric.
- **No decorative connector.** Every visible step/ledge in the cohort is on a route.
- **No busy floor.** The floors in 105–114 are conspicuously *empty*; all interest is at the
  risers and the silhouette. This is the same "quiet ground is active composition" rule the
  guard-post study induced, and it survives the move indoors unchanged.

## Cross-check against the guard-post ten

Of the guard post's ten induced rules, **seven transfer unchanged** to the cave cohort:
one primary spatial sentence · broad masses before cells · elevation hierarchy · relational
rock clusters · quiet ground as active composition · sparse objects with rich surface ·
camera visibility is grammatical. Three need restating indoors:

| Guard-post rule | Indoor restatement |
|---|---|
| "Roads are regions, not centerlines" | **Passages are regions** — 110's serpentine ribbon is a corridor with width, not a line |
| "Architecture occupies a transition" | **The nest occupies the defensible end** — the far, high, or enclosed terminus of the chain |
| "Composed edges imply a larger world" | **Black implies a larger world** — the composed edge indoors is the unlit void, and it does the same job for free |
