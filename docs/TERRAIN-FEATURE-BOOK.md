---
type: working-build-spec
created: 2026-07-28
status: BUILT — CL-F08a authored baseline; visual verdict remains Adam's
owner: authored terrain features before procedural transformation
authority:
  - ART-DIRECTION-CANON.md
  - TERRAIN-PROGRAM.md
  - TERRAIN-EXPRESSION-R2.md
  - SITE-9-CONTESTED-FORTRESS-SPEC.md
evidence:
  - intel-terrain/FFT-SURFACE-GRAMMAR.md
  - ../Reference/Contested-Fortress-Study-0727/lane-3-fft-cohort.md
  - ../Reference/Contested-Fortress-Study-0727/synthesis.md
---

# THE AUTHORED TERRAIN FEATURE BOOK

## The decision

Terrain features are authored as recognizable compositions before the engine is allowed to
transform them procedurally.

This separates two questions that the first chassis pass conflated:

1. Is there a good hill, hollow, bank, ridge, ditch, bluff, or defended approach here?
2. Can a procedural system resize, bend, rotate, erode, combine, and realm-skin it without
   destroying what made it good?

CL-F08a answers the first question. Procedural transformation is deliberately deferred. Every
feature has a `qualityLock`: the relationship a later transform must retain.

This is not a return to hand-authored maps. Each feature is built entirely from the existing
terrain-field operations and retains the chassis's deterministic heightfield, slope, face,
support, and reachability laws. The authored object is the **relationship between operations**,
not a bespoke mesh.

## FFT lessons used

The feature book reads the local FFT studies directly during production.

- Natural ground is a continuous changing-angle surface. Adjacent tiles may be flat, inclined,
  convex, concave, saddled, or rolling, but shared terrain edges remain continuous.
- A curb belongs to a built tread, retaining edge, cliff, canyon wall, root undercut, or similar
  causal break. It is not the default answer to a one-step height difference.
- Igros and Riovanes share a gate grammar: **one gate mass, one committed approach, one water or
  void obstacle**, with the approach changing level.
- Maiden Castle, Marqab, and Beaumaris share a material-independent entrance idea: lengthen and
  turn the way in under observation.
- FFT fortress plates are mostly terrain and quiet ground. The fortification does not need to
  occupy the whole tactical plate.
- The same wall is two battlefields: an outside face across open terrain and an inside linear
  deck. CL-F08a starts with the outside terrain and gate-window cases; the wall-deck structure
  remains a later construction feature.

The rejected regular sedimentary face ridge is not reintroduced. Face strata remain absent from
the terrain renderer.

## The eight feature baselines

### Small

| id | feature | construction and tactical idea | quality lock |
|---|---|---|---|
| `AF-S01` | Root-lifted hummock | One root plate pushes up a shoulder while runoff undercuts the exposed root. Low rise, sheltered underside, readable route. | The undercut causally belongs to the rise. |
| `AF-S02` | Sunken runoff lane | Traffic and water lower one bending lane; uneven spoil shoulders remain on both sides. | Floor, shoulders, and exits read as one erosion event. |
| `AF-S03` | Impact hollow and spoil | A shallow bowl throws more spoil to one side than the other. | The asymmetrical lip belongs to the hollow. |
| `AF-S04` | Slumped bank crossing | An oblique compound shoulder loses one saturated patch, lengthening the grade without becoming a staircase. | Changing tile angles continue across the rise; only a real bank shoulder may curb. |

### Large

| id | feature | construction and tactical idea | quality lock |
|---|---|---|---|
| `AF-L01` | Compound hill shoulder | Overlapping swells and a spur create long and short flanks, a saddle, and an off-centre crest. | Convex rise, saddle, shoulder, and fall stay connected. |
| `AF-L02` | Reverse-slope ridge | A long attacking slope crests above a shallow protected hollow. | Approach, crest, and reverse slope remain one landform without repeated bands. |
| `AF-L03` | Breached ditch and rampart | A forward ditch supplies its adjacent spoil bank; two constructed runs leave one real breach. | Ditch, bank, and gap preserve their one-to-one construction logic. |
| `AF-L04` | Terraced bluff approach | A high rock shelf has one broad route cut into treads and one talus event at its foot. | Curbs belong to the built approach and bluff; surrounding earth remains natural. |

## The two defensive compositions

### `DF-01` — turning ridgeworks

Two ditch-and-bank lines have offset breaches. Entering through the outer gap does not point
directly at the inner gap, so the route turns under the ridge's observation.

This is the cheapest retained proof that a lengthened defensive entrance is not synonymous with
a castle gate. It can later become turf, snow, ash, packed refuse, roots, fieldstone, or masonry
without changing its tactical proposition.

### `DF-02` — rising gateworks

The retained gate window contains:

- one four-storey gatehouse mass with a true diagnostic passage void;
- two three-storey flank masses;
- one central rising tread sequence;
- one moat divided by the causeway;
- a large quiet-ground approach.

This is the Igros/Riovanes FFT grammar, not a complete fortress. Gate machinery, portcullis,
heraldry, practical fire, wall-walk interiors, and persistent multi-window identity remain owned
by the Site 9 structure/runtime program.

## Height and camera law

The Clayroom's common two-storey examples are not a height limit.

The production camera approaches from positive world X and positive world Z. For an authored
terrain field, local `(0, 0)` is therefore the camera-far corner. CL-F08a assigns every
three-storey-and-taller mass a normalized camera-depth value and requires:

```text
tall structure = storeys >= 3
cameraDepth01 <= 0.42
```

Depth is measured at each mass's **camera-nearest footprint edge**, not its more forgiving
centroid. The gatehouse is four storeys at depth `0.3737`; the two three-storey towers are at
`0.1793` and `0.4015`. A mutation that moves a tall mass toward the near corner fails the gate.

This is a compositional default, not a ban. A future foreground tower may be accepted when a
specific cutaway/camera composition proves it does not hide tactical ground.

## Engine and proof

- Engine registry: `src/engine/terrain-features.js`
- Shared renderer: `src/ui/theater-clay-room.js`
- Headless gate: `dev/verify-terrain-features.mjs`
- Capture rig: `dev/capture-clay-terrain-bench.cjs`
- Feature scene: `?clayroom=1&clayfixture=terrain&terrainscene=authored-feature-book&terrainframe=0`
- Defensive scenes: `terrainscene=defensive-ridgeworks` and
  `terrainscene=defensive-gateworks`

The headless gate requires:

- four small, four large, and two defensive builds;
- ten distinct heightfield fingerprints;
- no walkable cell over 30 degrees;
- no illegal walk edge;
- no unowned face;
- no standable surface unreachable without flight;
- at least 45% quiet datum ground on each defensive plate;
- continuous shared FFT-style surface boundaries;
- multiple responsive tile profiles and tangent planes;
- identical authored logical geometry across changed seeds;
- a real four-storey mass, with every tall mass inside the far-band rule.

Visual acceptance remains Adam's. A green engine gate says the feature is legal, continuous,
deterministic, and honestly placed; it does not say the feature looks good.
