---
type: working-build-spec
created: 2026-07-28
status: BUILT — CL-F08a form-language baseline + CL-F09 vertical FFT battlefield proof
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

## Form target learned from the Golden Site renders

The active Golden Site concept renders clarified the intended hierarchy:

1. **Calm field:** most of the tactical plate remains readable datum ground.
2. **Macro silhouette:** one connected hill, ridge, bank, hollow, bluff, ditch system, or defensive
   seat organizes the frame.
3. **Meso explanation:** shoulders, saddles, cuts, spoil, talus, slumps, and route transitions
   explain why that silhouette changes.
4. **Localized break:** a cliff, curb, trench, root undercut, stair, or wall occurs only where its
   cause is visible.
5. **Dressing:** material, debris, roots, water, and vegetation reinforce the authored form after
   the terrain itself already reads.

This is a form-language reference, not permission to copy concept-render cheats into the tactical
mesh. Walk, collision, shared-edge, and support receipts remain authoritative.

Version 2 of CL-F08a therefore lowers and broadens the natural features, replaces circular masses
with rotated elliptical ones, and lets ridge/channel width, height, and depth vary along a run.
Runs can fade at their ends. This gives an authored feature a beginning, continuation, and
termination instead of a constant-width ribbon or a pile of independently randomized cells.

CL-F09 removes the mistaken assumption that those isolated-study dimensions are terrain ceilings.
It adds a battlefield-scale sparse control surface and a graded-corridor operation, then proves
them together on a tall map before any procedural deformation is introduced.

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

## `FFT-H01` — vertical hillside and switchback proof

The retained battlefield is a `20 × 24`-cell mountainside with `12h / 30 ft` of vertical travel.
It is organized as five named tactical zones: lower approach, lower fighting bench, middle bench,
saddle, and high overlook.

Two reusable chassis operations author it:

- `control-surface` bilinearly interpolates a sparse, asymmetric survey grid into one macro
  heightfield. This prevents a pile of isolated peak stamps while retaining local FFT-style flat,
  incline, convex, concave, and rolling tile responses after quantization.
- `graded-path` assigns tactical heights along a polyline and blends the tread back into the prior
  terrain through a cut/fill shoulder. A three-hairpin primary route connects `0h → 12h`; a
  narrower direct gully connects `0h → 10h`.

One broken middle-shoulder scarp gives the switchback a reason to round the open right flank. It is
localized to one height band and may not repeat as parallel strata. The rest of the massif uses
walkable continuous slope. At the retained seed the field has 480 standable cells, zero illegal
walk edges, zero unowned faces, zero unreachable standable cells, and calm fighting surfaces in
all five macro zones.

The render cap is an indexed centre/edge/corner topology: eight broad facets share the nine
responsive nodes inside a cell while real cliff skirts duplicate their vertices. This preserves
the varying tile angles without exposing the former alternating micro-quad diagonal as a zipper.
Natural tactical seams are lighter than relief boundaries, and the marked route material remains
visible in the Clayroom proof so the switchback can be judged as a route rather than inferred from
a receipt.

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
- Vertical battlefield: `terrainscene=fft-hillside-proof&terrainrung=all`

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
- no hard faces on natural ground except the explicitly authored bluff;
- at least half of every feature study retained as calm datum ground;
- no global relief ceiling inferred from the isolated small/large feature studies;
- a bounded summit share so the reverse-slope ridge cannot regress into a broad flat slab;
- actual use of rotated directional masses and tapered or fading authored runs.
- `12h / 30 ft` of battlefield relief with a connected legal switchback and alternate gully;
- calm fighting ground in all five macro elevation zones;
- one localized scarp rather than parallel sedimentary bands;
- shared-edge continuity and varied tile tangents across the full tall field;
- an indexed eight-facet cap with no alternating diagonal micro-grid.

Visual acceptance remains Adam's. A green engine gate says the feature is legal, continuous,
deterministic, and honestly placed; it does not say the feature looks good.
