---
type: system-spec
project: Genesis
status: ACTIVE IMPLEMENTATION — Golden Site 1 visual goal
created: 2026-07-30
authority: ART-DIRECTION-CANON.md, GOLDEN-VIGNETTE-VISUAL-GUIDE.md, MATERIAL-LANE.md
companions: SITE-1-GUARD-POST-SPEC.md, GROUND-MATERIALS-PROGRAM.md, TRIM-SHEET-PIPELINE.md
---

# Guard Post Visual Synthesis

## 1. Purpose

This specification turns a committed route-control Guard Post plan into a dressed presentation
without creating a second terrain engine, architecture engine, battle map, or one-seed hero-map
recipe.

The target is:

- FFT composition economy: one spatial sentence, a few ranked masses, readable first decisions,
  substantial quiet ground, and geometry only where affordance or silhouette needs it;
- Triangle Strategy material discipline: sprite-authored pixel DNA on the world, a small coherent
  material family, full but controlled value range, motivated light, and a sharp playable floor;
- Genesis consequence: state, repair, traffic, moisture, occupation, and culture remain causal,
  deterministic, persistent, and mechanically honest.

The synthesis target is deliberately pixelated 2.5D, not realism: visible authored albedo clusters
survive at gameplay distance; PBR depth remains restrained; 5×5/5×10 sprite modules carry most
face richness; geometry remains selective and mechanically meaningful.

The system dresses the already committed plan. It may not move a road, cell, zone, objective,
deployment area, access edge, support, opening, stair, or cover fact.

## 2. Starting-parent law

The material state machine is:

`technical-candidate -> best-starting-parent -> admitted-for-context`

These states are not aliases.

- `technical-candidate` passed source, seam, channel, and determinism checks.
- `best-starting-parent` is the strongest available lineage for a demanded role.
- `admitted-for-context` requires a governed in-scene verdict for this culture, face role, scale,
  condition, light case, and mutation family.

Prior approval remains provenance. It never propagates automatically to a Guard Post or from one
Guard Post profile to another.

## 3. `GuardPostVisualProfileV1`

The engine emits one immutable presentation record:

```text
{
  schema, version, profileId, cultureId, seed, planRef, mechanicsRef,
  materialPackRef,
  materialBindings: {
    architectureRole -> materialId,
    terrainSurfaceRole -> materialId
  },
  materialDefinitions: {
    materialId -> {
      state, family, albedo, normal?, orm?, tint, roughness,
      normalScale, aoIntensity,
      metersPerRepeatX, metersPerRepeatY, masonryCourse?, projection
    }
  },
  conditionLayers[],
  accentFamily,
  propDemands[],
  spriteDemands[],
  lightIntent,
  contextIntent,
  fallbackLadder,
  fingerprint
}
```

`planRef` and `mechanicsRef` are mandatory. A profile compiled against a different plan must be
refused rather than stretched over it.

## 4. Material family and projection

Each dressed Guard Post uses three to six dominant material families:

1. natural substrate;
2. traffic surface;
3. primary construction;
4. supporting timber;
5. roof/weather surface;
6. one restrained accent family.

Repair is normally a controlled variant of primary construction, not a seventh unrelated family.
Metal is a small roughness/value accent unless it becomes a genuine program material.

Every material starts with a sprite-derived albedo. Relief is derived from a separate semantic
depth guide. Painted highlights, dither, color variation, grain, and illustration noise do not
automatically become height.

Projection rules:

- construction uses face-local/world-locked planar projection;
- adjacent wall fragments share world phase;
- natural connected terrain shares world phase across responsive slopes;
- roof courses follow the roof’s construction direction;
- timber grain follows the member’s long axis;
- top and vertical faces may bind different families when their material truth differs;
- camera bearing never changes UVs, material selection, or condition placement.

Scale follows `PHYSICAL-TEXTURE-MODULE-STANDARD.md`. The combat grid remains the reference, but a
construction material declares independent physical X/Y repeats and its real construction units.
The selected Guard Post rough stone uses the reviewed large-defensive horizontal scale
(`1.6666667 wu/repeat`, inherited from the selected `2.75` taste-card scale) and six exact 1-ft
courses per `1.2 wu` vertical repeat. Dressed ashlar uses twelve exact 1-ft courses per `2.4 wu`
vertical repeat. One course is exactly `0.2 wu`; five-foot and ten-foot walls therefore terminate
on exact course boundaries while retaining their reviewed horizontal block proportion. Legacy
`1.65 m/cell` material metadata is not used for this arithmetic.

`W5H5` (5-ft wide × 5-ft tall) and `W5H10` (5-ft wide × 10-ft tall) sprite tiles are a
visual-module layer above the seamless parent. They may carry arches, surrounds, repairs, trims,
ornament, culture, and condition compositions only when compatible engine-authored sockets exist.
They never stretch to fit and never invent mechanical geometry.

## 5. Ground field requirement

Per-cell material randomness is forbidden. The ground system compiles connected fields:

- one quiet substrate field;
- a traffic ribbon derived from the committed road circuit;
- broadened shoulders at merges and work zones;
- sparse semantic overlays tied to causes;
- an orientation-neutral tiling albedo with no baked camera-facing grass tufts;
- sparse grass-tuft dressing as separately placed multi-bearing sprites or shallow extrusions;
- macro color variation larger than one tile;
- no rectangular path cut, repeated single-tile cadence, orphan ribbon, or decoration on reserved
  quiet ground.

V1 may project one world-locked candidate parent as an integration control. Family-quality
admission requires the compiled ground field and changed-seed proof.

## 6. Culture profiles

The first pair proves that one tactical plan supports visibly different construction logic.

### Institutional Frontier Works

- measured coursing and dressed corners;
- rough-hewn wall field with pale ashlar at base, coping, jamb, sill, stair edge, and drainage
  repair;
- dark slate weather roof;
- standardized timber dimensions and restrained iron;
- one maintained signal accent;
- wear concentrated at threshold, barrier, stair, deck, and drain.

### Upland Vernacular Station

- terrain-fitted construction and fewer imposed straight finish lines;
- broad old stone on load faces, dressed stone only where wear or load requires it;
- heavier darker timber, cribbing, and deep-eave roof language;
- timber shingles as the first roof candidate;
- condition caught in joints and downhill faces while active circulation remains suppressed.

Culture may change material, trim, support expression, and props. It may not change tactical
obligations unless a separately committed structural mutation does so.

## 7. Condition and repair

Condition is a set of causal masks, never a random grunge pass:

- `traffic`: door, road, barrier, stair, and deck circuits;
- `runoff`: downhill faces, drain source, drain channel, and outfall;
- `growth`: crevices, shaded retaining faces, and quiet margins;
- `repair`: the drainage splice and any later authored intervention;
- `occupation`: work apron, signal station, store, and lookout;
- `damage`: only when physical state owns it.

Repair suppresses age/growth locally and may change unit scale or finish. Ruin is a physical state,
not an operating-state synonym.

## 8. Props, sprites, and accent

Props are relational and sparse. Every prop must answer at least one of:

- what is controlled here;
- how the post operates;
- who occupies it;
- what was recently repaired;
- where the player can act.

Required sockets take priority over filler. Quiet ground remains quiet. A Guard Post normally needs
no more than one signal cluster, one work cluster, and one supply cluster in the materialization
window.

Generated sprites are allowed when no admitted asset satisfies a semantic demand. They follow the
Genesis sprite canon, carry provenance, pass contact/facing/scale tests, and remain candidates until
the governed site view approves them.

One saturated accent family must sit between the terrain and the actor sprites in prominence. It
cannot outshine the actors or replace program legibility with decoration.

## 9. Lighting and context

Base art must carry the daylight frame under a neutral key. Post effects may amplify but may not
rescue unreadable materials.

- daylight uses one directional key and readable shadow floor;
- night adds only motivated practicals attached to real supports;
- playable ground stays sharp;
- near context depicts real adjacency;
- far context communicates premise without promising a traversable route;
- atmosphere may not hide contact, route, cover, or elevation.

## 10. Fallback ladder

For every demanded role:

1. admitted material for this exact context;
2. best starting parent with explicit `candidate` receipt;
3. sprite albedo plus scalar roughness;
4. role-colored truthful proxy;
5. omission only when the role is explicitly optional.

Missing normal or ORM maps may fall back independently. Missing albedo may not silently substitute
an unrelated texture.

## 11. Proof and acceptance

Every candidate family banks:

- neutral clay;
- dressed daylight at four quarter-turn bearings;
- gameplay scale and 50% contact sheet;
- grayscale/value and chroma report;
- material/face identity overlay;
- the Golden seed plus at least two changed seeds;
- Institutional and Upland profiles;
- before/after state when a condition channel is active;
- one motivated night after daylight passes;
- immutable plan/mechanics fingerprints and a visual-profile fingerprint.

Hard rejection:

- mechanics or plan changed by dressing;
- independent per-tile material choice;
- UV seams or diagonal zipper;
- one-tile texture cadence across the field;
- condition without cause;
- unowned hard face;
- lost quiet ground;
- material/sprite scale conflict;
- a bearing that hides the program or breaks the material;
- missing fallback receipt;
- context that implies a false route.

Soft review scores, each 0–4:

- tactical readability;
- ranked-mass composition;
- terrain/building separation;
- material family coherence;
- pixel-DNA coherence;
- value hierarchy;
- sprite priority;
- causal condition;
- culture legibility;
- beauty at four bearings.

No profile is `admitted-for-context` below 32/40, with no category below 2 and no hard rejection.
The score is an audit aid; founder judgment remains the visual authority.

## 12. V1 implementation boundary

V1 proves:

- deterministic culture profile selection;
- role-to-material bindings;
- world/face-consistent UV projection;
- sprite-derived starting parents;
- truthful per-channel fallback;
- unchanged mechanics and four bearings;
- an inspectable runtime material receipt.

V1 does not claim:

- that any candidate material is approved for the Guard Post;
- that the flat source fields solve ground anti-repetition;
- final condition masks;
- final prop/sprite kit;
- final Upland construction morphology;
- family-quality admission before the full proof in §11.

## 13. Causal condition overlays

Water, algae, soot, wear, salt, and grime are not independent material families scattered over a
site. A condition projection must name:

- its physical source and direction;
- the parent surface it modifies;
- where the condition collects, tapers, or is interrupted;
- which clean/new/covered faces remain unaffected;
- its mechanical effect, normally `none`;
- its mutation law, derived from the same facts that move the source geometry.

Condition sprites are parent-independent overlays. They may own color and coverage alpha only.
They may not bake brick bonds, plank seams, stone shadows, parent normals, or parent ORM into their
pixels. Source-over-parent composition leaves the parent responsible for construction rhythm,
normal, ORM, and lighting response. Broad planar grime is evaluated as a parent-fragment
modulation over engine-authored receiver bands. It is not a second wall prism and does not cast or
receive an independent shadow.

Placement has a second, independent obligation: it must bind to the receiving contact topology.
The default origins are wall/ground seam, inside corner, opening foot, drain lip, curb return, or
shaded stair/wall junction. Origin does not impose footprint. The required TS hierarchy is:

1. broad low-frequency grime/damp accumulating across older lower walls;
2. mid-scale unequal moss/algae islands spreading visibly from seams and wet corners;
3. large silhouette-bearing ivy rooted at wall-floor plus wall-wall/column contacts.

A centered unrelated face sticker remains a negative control. A broad lower-wall band is not a
centered patch when its alpha grows upward from continuous ground contact. At least one relevant
condition cluster must read at gameplay scale.

Projection is receiver-specific:

- repeatable planar wall bases: a manifest-driven condition trim slot with continuous physical
  distance along the receiver, blended into the parent fragment;
- discrete planar construction junctions: `receiver-local-decal`;
- responsive angled terrain: `mesh-conformal-shared-vertex-field`;
- large ivy: a paired two-face corner slot on shallow or crossed contact-rooted growth geometry.

The root for a ground-contact receiver band is sampled from the committed terrain along each
receiving member. It is not the member's nominal base, the top of a gravel platform, or one flat
datum shared by a sloped run. Before any condition is admitted, the architecture must also pass a
support test: every constructed wall meeting responsive terrain either penetrates below the local
terrain envelope or bears on a continuous terrain-embedded footing that overlaps the wall in
section. Grime and ivy cannot be used to disguise unsupported geometry.

Condition trim is not a Material Maker mutation. The trim sheet owns reusable RGBA mids, endcaps,
corner pairs, column/drain junctions, and their stable slot ids. The engine owns contact curves,
corners, endpoints, flow, maintenance interruption, and mutation. Material Maker is optional and
downstream: it may derive restrained roughness, shallow relief, or affinity variants after the
visible sprite/trim vocabulary passes.

Golden Site 1 applies all three construction scales, keeps new drain coping cleaner, and emits a
separate downhill terrain field from the drain. The terrain field chooses a least-uphill route,
favors concavity, suppresses maintained traffic, interpolates continuously across real terrain
triangles, and has `mechanicalEffect:none`. V005 (masonry baked into algae RGB), V006 (regular
diagonal cadence), V007's centered-face application, V007's nearly invisible junction-only
application, and V008's first narrow decorative grime tuning are retained as explicit rejected
evidence. V008 is a technical-candidate system pack, not final condition admission. The Guard Post
retaining run now bears on one continuous `foundation-gravel` footing embedded below the responsive
terrain; the three retaining wall members name that support in their receipts. This solves
construction contact but does not by itself admit the current grime art.

The Guard Post turf macro authority is v011: a bounded same-parent quilting pass removes the v010
camera-facing fan tufts while preserving every pixel outside reviewed toroidal masks. Adam's
governed 3/4/5/6-cell comparison selected 9.90 metres/six cells because its broad moss/soil masses
read more naturally across the complete field and repeat less like wallpaper.

V011 is only 512 px across that 30-foot envelope (~17.1 source px/ft), so it cannot itself satisfy
the shared 32 px/ft world-density rule. V016 and v017 are retained rejects: v016 introduced a beige
micro-pattern and weakened the olive macro masses; v017 became a uniform moss carpet. V018 keeps
v011 as macro authority, adds only a bounded 28% high-frequency contribution from the authored
v017 source, and packages exact 960×960 albedo/normal/ORM channels for the same 30-foot/six-cell
envelope. The identical-runtime and physical ten-foot comparison is
`artifacts/golden-site-1-ground-density-v018/01-v011-v018-ground-density-comparison.png`.

V018 is therefore the default **technical parent pending family proof**, not automatically approved
art. Separate semantic, camera-neutral tuft dressing remains required.

## 14. Corner continuity and cultural expression

A corner is both an envelope obligation and a high-value cultural expression site. These concerns
must remain separate:

- neutral construction guarantees a closed support/weather envelope before culture is applied;
- culture selects the visible junction profile, construction rhythm, sheath, and ornament;
- world truth selects any symbolic content carried by a gargoyle, guardian, glyph, paint, banner,
  blood mark, or comparable signifier;
- presentation may never reopen the underlying envelope or change mechanics.

Every concentric layer closes independently. A closed wall shell does not excuse an open cornice,
flashing course, fascia, parapet, coping, foundation return, or condition receiver. Independent
perpendicular run prisms are insufficient when their outer quadrants remain empty or their
overlapping internal faces create false black AO seams. Mutating visible courses use straight-run
modules that terminate on exact shared miter planes. WFC may join only compatible miter sockets.
Intentionally open access sides are named and each exposed run end receives one four-vertex cap.
Non-mutating hidden flashing may remain a manifold ring.

The Institutional demonstration now uses a warm dressed-stone attachment family: six alternating
quoin courses at each neutral structural corner, one closed cornice loop, opening-specific hoods,
and a three-sided mid-wall string course. The string course is intentionally absent from the
door/shutter elevation; its two returns are four-vertex caps, so culture never paints or extrudes
through a real aperture. Upland retains timber posts, belt, heavy eaves, cribwork, and brackets over
the same mechanics. These are noncanonical culture-language demonstrations, not faction truth.

Acceptance requires a layer-isolation proof: hide the roof field and outer fascia, then hide inner
flashing, cultural cornice, and cultural corner dressings in turn. A corner that passes only when a
higher layer occludes it has failed. Closed walls terminate against corner solids without overlap;
closed fascia/cornice courses use four exactly mated run modules; open balcony/parapet perimeters
use three mitered run modules and two quad terminal caps. Independent boxes plus corner patches are
a negative control.

Corner expression families include square mitres, rounded returns, swept or upturned eaves,
corbels, gargoyles/guardians, finials, painted bindings, monolithic packed joins, and other
culture-derived profiles. Golden Site 1's Institutional proof uses a restrained dressed return;
Upland may use fitted timber binding. These are procedural sockets, not canon for the fixture seed.

Hip roofs retain four semantic facets for pitch, drainage, mutation, and cultural treatment but
compile as one closed roof shell. Four separately extruded facet solids are a negative control:
their hidden internal walls converge at the eave and can render as a false open cavity under AO.

## 15. Authored wall-face modules

`WallFaceModuleCompilerV1` is the first implementation of the physical wall-module law in
`docs/PHYSICAL-TEXTURE-MODULE-STANDARD.md`. It binds nearest-sampled albedo features to
engine-owned construction datums and real aperture ids. The first Guard proof demonstrates quiet
`W5H5` variation, linked `W5H10`/`W10H10` thoughts, exact aperture surrounds, restrained
alpha-derived feature normal/roughness, and different Institutional/Upland surface-expression media
without changing wall solids or mechanics.

This does not yet admit the complete wall system. Dedicated authored feature normal/ORM assets,
repair/corner/remainder libraries, and changed-dimension proofs remain open. The compiler receipt
is evidence of correct ownership and first-slice execution, not automatic approval of every
authored motif.
