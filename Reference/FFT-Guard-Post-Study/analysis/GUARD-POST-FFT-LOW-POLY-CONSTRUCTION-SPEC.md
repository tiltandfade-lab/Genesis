---
type: working-visual-construction-spec
status: FOUNDER-DIRECTION-LOCKED; dimensions and budgets remain clay-calibrated
created: 2026-07-23
scope: Guard Post FFT-style low-poly translation, procedural geometry kit, and narrative-furnishing boundary
---

# Guard Post — FFT-Style Low-Poly Construction Spec

## The translation in one sentence

The Guard Post is not a miniature realistic building made from hundreds of little modeled parts.
It is a legible tactical diorama made from a few broad terrain masses, a road that is real geometry,
continuous architectural runs, deep readable openings, and a handful of large silhouette pieces;
the material system supplies construction rhythm and age without pretending to be geometry.

This is a translation of FFT's economical map language into Genesis's own procedural construction
grammar. It is not a copied FFT map, mesh, texture, palette, or exact arrangement.

## Founder rulings captured for later canon migration

Adam, 2026-07-23:

> "ok, well remember we are expressing these things in the very low poly language of the FFT map
> construction. So can you make that translation?"

> "for now, we are going to keep the majority of furnishings narrative, the DM can talk about
> them, they can affect the scene and the world, but they are essentially imaginary until we can
> prove the architectural soundness and tactical juiciness of the scene itself"

These rulings are recorded here because this work is intentionally being kept on the Desktop during
the Genesis repository move. They still need to be folded into the repository art authority after
the move.

## The three-layer visual law

| Layer | Must carry | Must not carry |
|---|---|---|
| Low-poly geometry | silhouette, elevation, road width and grade, wall thickness, apertures, cover, route connectors, support, roof mass, collision, cutaway | modeled masonry units, roof tiles, grass blades, small cracks, surface grime |
| Material and trim | stone-unit rhythm, joints, grain, broad geological strata, restrained wear, roughness, moisture/growth affinity, declared physical scale | doors/openings, mechanical steps, fake parapets, fake collision, invented damage or repair |
| Narrative furnishing facts | work, storage, rest, readiness, supply, records, culture, and history not yet needed for architectural proof | invisible blockers, invisible cover, invisible line-of-sight obstruction, or invisible interaction reach |

The scene must remain architecturally intelligible and tactically interesting in neutral clay.
Materials may strengthen the read; furnishings may not rescue it.

## FFT-economy construction laws

1. **Broad masses first.** Establish the dominant upper shoulder/post mass, supporting road/
   retaining mass, and quiet lower approach before emitting small pieces.
2. **Every visible plane has a job.** It explains elevation, route, support, weather protection,
   construction, or a tactical promise. Decorative tessellation is removed.
3. **The road is a ribbon, not paint.** It has a real boundary, width, grade, narrowing, apron, and
   relation to the hill and threshold.
4. **Walls are continuous runs, not piles of blocks.** Masonry units live in the material. Only
   dressed silhouette pieces—caps, sills, thresholds, drain mouths, and load-bearing corners—may
   become separate simple geometry.
5. **Openings have depth.** A window, slit, door, or gate is a hole/reveal with wall thickness,
   not a dark rectangle on a wall texture.
6. **Tactical elevation is geometric.** A climb, drop, stair, ramp, ledge, or wall walk is emitted
   from the same typed connector used by mechanics.
7. **Rocks are landmarks or supports.** They occur in causal clusters at a bend, tier edge, wall
   end, cut, route opportunity, or composed boundary; never as even scatter.
8. **Grass is a quiet field.** The ground material supplies the broad grass read. Sparse tufts may
   later accent boundaries, but the first scene does not model a lawn.
9. **Roofs are planes, not tile collections.** Eave thickness and major support are geometry;
   boards, shingles, or slate rhythm are material/trim.
10. **The production camera is the judge.** A detail that cannot be read at gameplay scale is
    deleted, enlarged into a proper construction feature, or moved into the material.
11. **Cutaway is a deterministic derivative.** It may hide or ghost licensed occluders and cap the
    resulting sections; it may not redesign the building.
12. **No seed-specific art patch.** Every piece is emitted from a typed recipe that survives
    changed road, terrain, post, and culture seeds.

## Low-poly primitive vocabulary

These are the preferred geometric moves:

- extruded boundary polygon;
- planar ribbon between two typed edge chains;
- straight or gently segmented run with a small cross-section profile;
- rectangular prism for beams, posts, lintels, and barrier members;
- wedge for a shoulder cut, buttress, or roof;
- two- or four-plane roof mass;
- six- or eight-sided cylinder only where a round member materially matters;
- one-ring or two-ring irregular polyhedron for rock;
- shared stepped mesh for tactical stairs;
- shallow U- or V-profile for drainage;
- one-segment bevel only on silhouette-critical or contact-critical edges.

Avoid:

- a cube per tactical cell;
- a mesh per stone, brick, shingle, plank, or grass tuft;
- multi-segment bevel stacks;
- smooth subdivision;
- cylinders with more sides than the production view can distinguish;
- texture-displacement silhouettes;
- random vertex noise on architectural runs;
- micro-triangulation or cracked-glass faceting.

## Atomic low-poly bill of materials

### Terrain and approach

| ID | Atomic family | Low-poly emission | Required parameters | Surface/material sockets |
|---|---|---|---|---|
| `GP-LP-T01` | Composed stage | One bounded top polygon, outer skirt, optional underside/cap; edge profiles chosen by typed boundary role | boundary loop, height datum, edge-role runs, visible-side flags | quiet ground, cliff/riser, stage cap |
| `GP-LP-T02` | Elevation mass | One top region plus vertical or sloped transition faces; triangulated from the meaningful boundary only | footprint, tier id, top height, transition profile, connector exclusions | grass/soil, road, rock, riser |
| `GP-LP-T03` | Shoulder cut/wedge | Coarse wedge or stepped cut where the road and hill causally meet | cut axis, top/bottom chains, slope class, rock/soil exposure | geological rock, soil, retaining interface |
| `GP-LP-T04` | Road ribbon | Segment chain with left/right edges, top surface, grade transitions, and exposed side only where required | entry/exit sockets, center path, width profile, grade profile, surface role | packed road, edge soil, optional curb |
| `GP-LP-T05` | Road event | Widening, narrowing, bend pad, threshold apron, drainage crossing, or turnout attached to `T04` | event id, station along road, width delta, edge ownership | road, dressed threshold, drain |
| `GP-LP-T06` | Tactical connector | Shared stair, ramp, step, or climb mesh generated from the mechanics connector | connector id, endpoints, rise/run, width, accessibility tags | tread, riser, cap/nosing |
| `GP-LP-T07` | Retaining run | Continuous extruded run with straight, corner, end, height-change, abutment, and optional cap handling | control chain, height samples, profile id, end conditions | old stone field, dressed cap, damp affinity |
| `GP-LP-T08` | Drain/channel | Shallow U/V run, culvert mouth, scupper, or dressed outlet tied to water/slope facts | flow direction, source/outlet, width/depth class, blocked/clear state | dressed stone, damp affinity, iron only if licensed |
| `GP-LP-T09` | Rock individual | One- or two-ring irregular polyhedron with broad planar faces and a flat/contact-aware base | rock seed, footprint, height, lean, facet count, buried fraction | geological rock |
| `GP-LP-T10` | Rock cluster | Two to five `T09` members composed around a named relation; one primary and subordinate fragments | cluster role, anchor, clearance envelope, scale hierarchy | geological rock, soil/grass transition |
| `GP-LP-T11` | Quiet ground field | A declared low-event region on `T01/T02`; normally no additional mesh | region polygon, quietness reservation, traffic exclusion | grass/soil with restrained variation |

### Architecture and control

| ID | Atomic family | Low-poly emission | Required parameters | Surface/material sockets |
|---|---|---|---|---|
| `GP-LP-A01` | Embedded foundation/plinth | Extruded footprint or stepped plinth that honestly meets the shoulder and retaining system | footprint, bearing heights, embed faces, drainage clearances | old stone, dressed base course |
| `GP-LP-A02` | Room-shell wall run | Continuous thick wall runs with stable corners and top closure; no modeled masonry units | center/boundary run, thickness, height/batter profile, opening reservations | wall field, base course, cap |
| `GP-LP-A03` | Operational edge kit | Simple sill, jamb, lintel, corner quoin, cap, threshold, drain rim, or bearing course | owning run, role, cross-section, start/end, culture profile | dressed operational stone/trim |
| `GP-LP-A04` | Opening/reveal | True void or wall-run split plus jamb, head, sill, and interior reveal surfaces | opening family, width/height, sill, depth, shutter/closure socket | dressed edge, interior reveal, closure |
| `GP-LP-A05` | Threshold/gate supports | Two supports or one wall-to-post assembly aligned to the road-control threshold | threshold id, clear width/height, support profile, barrier sockets | dressed stone, structural timber, iron |
| `GP-LP-A06` | Road barrier | Two or three rectangular members: leaf/beam, pivot/bearing, and optional counter/support member | barrier type, open/closed transform, clearances, pivot, break state | structural timber, forged iron |
| `GP-LP-A07` | Lookout platform | One deck slab, necessary supports, access socket, and simple parapet/rail where licensed | observation id, deck polygon, height, access link, cover promise | timber or stone deck, supports, edge material |
| `GP-LP-A08` | Roof/weather mass | Two or four broad planes, visible thickness/eave, ridge or high edge, and only necessary supports | roof profile, pitch, overhang, drainage side, cutaway group | roof face, eave/edge strip, support timber |
| `GP-LP-A09` | Defensive edge | Continuous half-wall, parapet, or sparse rail run derived from a real cover/edge obligation | owning boundary, cover class, height, openings/endpoints | stone field/cap or timber/iron |
| `GP-LP-A10` | Structural timber kit | Rectangular posts, beams, braces, lintels, and simple cribs; six/eight sides only for a truly round member | endpoints, section profile, join role, culture profile | timber face/end, iron fastener |
| `GP-LP-A11` | Repair assembly | Buttress wedge, replaced dressed unit, timber crib/brace, drain insert, or patched run tied to one canonical repair event | repair event id, failed pressure relation, culture repair grammar, date/age band | fresh/less-aged stone, timber, iron, condition masks |
| `GP-LP-A12` | Cutaway/section cap | Deterministic cap or ghost material over the surfaces exposed by production-view cutting | cut plane, cutaway group, mechanical visibility obligations | subdued interior/section material |

### Furnishing representation

| ID | Family | MVP representation |
|---|---|---|
| `GP-NF-00` | Narrative furnishing record | Stable semantic fact attached to a room-relative zone or support role; DM-visible and world-persistent, but no mesh or exact coordinate |
| `GP-NF-01` | Tactical necessity proxy | The smallest truthful low-poly blocker, cover mass, light body, or interaction marker needed only when mechanics require an exact footprint, sight effect, collision, or reach point |

`GP-NF-00` is the default. `GP-NF-01` is an exception licensed by mechanics, not an invitation to
begin the furnishing catalog.

### Trim/profile binding

`GP-LP-A03`, the fascia faces of `A07/A09`, the front edges of `T06`, and compatible cap/curb faces
bind named low-poly profile geometry to the stable six-band trim layout specified in
`GUARD-POST-TRIM-SHEET-MM1.3-SPEC.md`.

The profile owns the physical step, lip, cap, nosing, corner, endpoint, and occlusion. The trim slot
owns only the reusable surface response. Opening surrounds and thresholds remain dressed base
material/plain-band roles in layout v1; no trim image is allowed to invent their geometry.

## Culture realization on the same low-poly skeleton

MVP culture changes correlated construction while preserving the road graph, threshold, room,
observation obligation, access, cover promises, and tactical reservations.

| Shared slot | Institutional Frontier Works | Upland Vernacular Station |
|---|---|---|
| `A01/A02` | low rectilinear plinth and repeatable wall lifts | compact wall mass fitted into retaining/shoulder geometry |
| `A03` | repeated, squared operational edges with regular section families | dressed edges concentrated only at load, opening, drain, cap, and wear roles |
| `A04` | narrow modular deep opening | deep shuttered opening inside the same licensed sight envelope |
| `A05/A06` | squared supports and standardized replaceable barrier sections | heavy local timber barrier and adapted fittings inside the same clearance |
| `A07/A09` | standardized deck/parapet assembly | roof-protected observation edge or heavier fitted platform |
| `A08` | low drained deck/roof posture within the roof envelope | compact pitched or strong shed posture within the same envelope |
| `A11` | measured replacement, dressed drain, standardized brace | packed local-stone buttress, cribbing, adapted drainage |

This is intentionally readable in clay. Materials confirm the construction systems but cannot be
the only reason the cultures differ.

## Provisional art-direction geometry budget

These are first-clay discipline bands, not performance ceilings and not yet canonical measurements:

| Scope | First target |
|---|---:|
| Full static Guard Post stage, excluding grid, figures, and foliage | roughly 3,000–8,000 triangles |
| Terrain, road, elevation, retaining, and stage edges | roughly 1,500–4,500 triangles |
| Guardroom, threshold, barrier, lookout, and roof | roughly 500–1,500 triangles |
| All rock clusters | roughly 150–600 triangles |
| One simple architectural member | 12 triangles before a justified silhouette bevel |
| One rock | commonly 12–40 triangles |
| One round post | 6–8 radial sides |

The stronger veto is screen-space:

- do not spend triangles on a feature that is sub-pixel or only reads in an editor close-up;
- do not add tessellation solely to support a texture;
- preserve enough vertices for the route/elevation silhouette, contact, and cutaway to remain true;
- prefer a readable large plane over a smoother but less deliberate contour.

If the clay capture is visually crude because the broad silhouette is wrong, add or move meaningful
planes. If it is crude only in a zoomed inspection, leave it alone.

## Procedural recipe contract

Every emitted family uses a stable recipe row or structured record:

```text
shapeRecipeId
shapeRecipeVersion
semanticRole
sourceCanonicalFactIds[]
cultureProfileId?
constructionProfileId
footprintOrControlChain
heightBandIds[]
crossSectionProfileId?
openingAndSocketReservations[]
materialRoleBindings[]
collisionAndCoverPromise
cutawayGroup
seedStream
fallbackRecipeId
validationProfileId
```

### Table/config ownership

Keep in human-readable tables/config:

- route-control archetype;
- culture construction profile;
- wall, roof, observation, barrier, retaining, repair, and rock-cluster families;
- meaningful road events;
- compatibility tags and forbidden combinations;
- allowed parameter bands;
- material-role bindings;
- named fallback order;
- validation obligations.

Keep in the seeded engine:

- road candidate coordinates and exact grade sequence;
- mass-region boundaries;
- wall control points and triangulation;
- exact rock transforms inside legal cluster envelopes;
- bounded parameter sampling;
- candidate scoring and relaxation;
- mesh emission and stable surface ids.

The renderer consumes the committed plan. It may choose deterministic LOD or projection details
from stable ids, but it does not reroll layout, culture, construction, condition, or object count.

## Narrative-furnishing boundary

The architectural proving ground contains furnishing **facts**, not a furnishing art dependency.

A narrative furnishing record may contain:

```text
furnishingFactId
semanticRole
roomId
relativeZone
supportRole
canonicalState
contentsOrUseFacts
cultureBinding
historyBinding
mechanicalMateriality: narrative
promotionSocket?
```

The DM may describe it, remember it, search it, damage it narratively, or use it in world logic
within the authority of the canonical fact. It need not have a selected model or exact transform.

Promotion to a physical proxy is mandatory if any mechanic asks the furnishing to:

- block a cell or route;
- provide or remove cover;
- block sight or projectile travel;
- carry a climbable/support surface;
- emit a practical light whose position matters;
- define exact interaction reach;
- become a target with spatial consequences.

Until promoted, it may not produce invisible collision or a secret tactical advantage. The MVP
cultural comparison must remain legible with all narrative furnishings hidden.

## Generation and validation order

1. Commit the canonical Guard Post meaning, culture profile, and relational archetype.
2. Emit composed stage edges and broad elevation masses.
3. Solve and emit the real road ribbon and its narrowing/apron.
4. Place the post anchor because of the road/terrain relation.
5. Emit foundation, wall runs, threshold, barrier, observation, and required roof/edge mass.
6. Derive retaining, drainage, tactical connectors, and repair assembly.
7. Place relational rock clusters and preserve quiet ground.
8. Validate path, clearance, cover, sight, deployment, flank/opportunity, retreat, and cutaway.
9. Capture neutral clay under the fixed production camera.
10. Only after the clay scene passes, bind the Material Maker surface recipes.
11. Keep narrative furnishings invisible; introduce only licensed tactical proxies.
12. Replay the same recipe across changed seeds and the paired culture profiles.

## Clayroom admissions before the golden Guard Post

Prove these generic atoms first:

- `T02` elevation mass;
- `T04` road ribbon;
- `T06` tactical connector;
- `T07` retaining run;
- `T09/T10` low-poly rock and relational cluster;
- `A02` continuous thick wall run;
- `A03` operational edge/trim geometry;
- `A04` deep opening/reveal;
- `A05/A06` threshold and barrier;
- `A08` broad roof planes and cutaway;
- `A12` deterministic section cap.

The complete hill-shoulder composition, culture-specific assemblies, and shared repair fixture
belong to the Guard Post recipe rather than the generic Clayroom.

## Acceptance gate

The low-poly translation passes only when:

1. a clay capture reads immediately as a guarded pass-through road at a hill-shoulder narrowing;
2. road, elevation, threshold, lookout, flank/opportunity, and retreat remain mechanically true;
3. the post appears built **because of** the terrain/road relation, not placed on a decorated pad;
4. broad planes create a composed diorama without looking like disconnected cell cubes;
5. material removal does not destroy the architectural or tactical sentence;
6. furnishing removal does not destroy the scene identity or cultural A/B;
7. no material creates fake steps, openings, wall thickness, cover, or structural damage;
8. no narrative-only furnishing creates invisible collision, cover, sight, or reach effects;
9. changed seeds produce different legal road, terrain, post, retaining, and rock arrangements;
10. the two MVP cultures remain distinguishable in clay while preserving equivalent mechanics;
11. the fixed production camera and cutaway preserve all required gameplay information;
12. every accepted capture can be reproduced from a receipt without a seed-specific patch.

## Related working documents

- `FFT-TO-GENESIS-RELATIONAL-SHAPE-GRAMMAR-STUDY.md`
- `GUARD-POST-CULTURAL-MUTATION-MVP.md`
- `GUARD-POST-LOCK-AUDIT.md`
- `GUARD-POST-MATERIAL-MAKER-1.3-SEED-GRAPH-SPEC.md`
- `GUARD-POST-TRIM-SHEET-MM1.3-SPEC.md`
