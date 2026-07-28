---
type: production-machinery-spec
status: PROTOTYPE-TOOL-CONSOLIDATION-BUILT
created: 2026-07-27
owner: art-pipeline
first_implementation: build/assetforge.py
---

# Assetforge

## Purpose

Assetforge is the shared compiler protocol for turning generated visual material into reviewable,
repeatable Genesis assets. It is not an art generator, a second registry, or an automatic taste
authority.

The protocol is:

```text
canonical source + typed manifest
  -> exact generation packet
  -> generated return in quarantine
  -> deterministic extraction/assembly
  -> family-specific technical proof
  -> machine-readable receipt + visual proof board
  -> explicit art admission
```

Image generation owns appearance proposals. Deterministic code owns topology, slicing, naming,
alignment, packing, negative controls, and provenance. A technical `PASS` means that the artifact
obeys measurable contracts; it never means that the art director approved its taste or identity.

## Build classification

- **Execution:** build-time only.
- **Convergence:** principally C4 sprite citizenship; C6 when state variants make a named game
  state more legible.
- **Canonical inputs:** live source assets, semantic registries/manifests, exact realm style blocks,
  scale/grounding contracts, and family production format.
- **Protected boundary:** outputs remain under `dev/model-qa/` until explicitly admitted. A failed
  generation cannot remove or silently replace a live asset.
- **Determinism:** generation is reproducible by its prompt packet and provider receipt; every
  operation after generation is reproducible byte-for-byte from source hashes, manifest, algorithm
  version, and seed.
- **Fallback:** the canonical source asset remains live whenever generation, proof, or admission
  fails.

## Shared job envelope

Every Assetforge family uses a JSON job with these common fields:

```json
{
  "schemaVersion": 1,
  "family": "sprite-emote",
  "jobId": "emote-spr-pc-human-fighter-male-v001",
  "algorithmVersion": "sprite-emote-v1",
  "source": {
    "path": "assets/sprites/spr-pc-human-fighter-male.png",
    "sha256": "<hex>",
    "registryId": "spr-pc-human-fighter-male"
  },
  "generation": {
    "promptPath": "<job-id>.prompt.md",
    "provider": null,
    "model": null,
    "generationCallId": null,
    "seed": null
  },
  "admission": {
    "scope": "candidate-only",
    "tasteApproval": null,
    "approvedBy": null
  }
}
```

Family fields may extend this envelope but may not weaken it. The ingest receipt records actual
input and output hashes, not only paths.

## Shared commands

The CLI surface grows by family without changing the envelope:

```text
python3 build/assetforge.py emote init ...
python3 build/assetforge.py emote ingest ...
python3 build/assetforge.py emote review ...
python3 build/assetforge.py emote self-test ...

python3 build/assetforge.py boundary init MATERIAL --dialect enclosure --output JOB.json
python3 build/assetforge.py boundary init MATERIAL --outside-material OUTSIDE.png --dialect path --output JOB.json
python3 build/assetforge.py boundary compile JOB.json --output-dir DIR
python3 build/assetforge.py repeat compile JOB.json --output-dir DIR
python3 build/assetforge.py prop-kit compile JOB.json --output-dir DIR
python3 build/assetforge.py condition compile JOB.json --output-dir DIR
python3 build/assetforge.py palette compile JOB.json --output-dir DIR
python3 build/assetforge.py trim compile JOB.json --output-dir DIR
python3 build/assetforge.py decal compile JOB.json --output-dir DIR
python3 build/assetforge.py citizenship compile JOB.json --output-dir DIR
python3 build/assetforge.py atlas compile JOB.json --output-dir DIR
python3 build/assetforge.py material compile JOB.json --output-dir DIR
python3 build/assetforge.py regression compare JOB.json --output-dir DIR
python3 build/assetforge.py suite self-test --force
```

Each family must provide:

1. an `init` or equivalent manifest authoring command;
2. a self-contained prompt packet when generation is involved;
3. an ingest/compile command which never writes directly into live asset directories;
4. a proof board at actual aspect ratio and at relevant play scale;
5. a JSON receipt with source/output hashes and individual gate results;
6. at least one preserved negative fixture which makes the verifier exit nonzero;
7. a separate, explicit promotion step if the family is ever allowed to enter production.

## Expansion map

The order below is based on reusable leverage, not visual novelty.

| Order | Factory | Converts | Deterministic proof | Status |
|---:|---|---|---|---|
| 1 | Sprite-emote factory | one registered sprite + state vocabulary -> discrete state atlas | identity locks, alpha/chroma, occupancy, baseline, scale, atlas and play-scale board | **V1 BUILT + PROVEN** |
| 2 | Boundary auto-tile compiler | paired material fields + enclosure/path/road/cliff dialect -> complete connected-boundary set | exhaustive masks, neighbor closure, topology/elevation renders | **V2 MULTI-DIALECT BUILT + PROVEN** |
| 3 | Modular repeat compiler | component sheet -> infinite course/field tile | toroidal closure, variant balance, seam/cadence board | **V1 BUILT + PROVEN** |
| 4 | Prop/kit sheet compiler | related prop sheet -> isolated, named, anchored prop kit | count/order, alpha, footprint, scale ladder, contact board | **V1 BUILT + PROVEN** |
| 5 | Condition-state factory | pristine asset -> damaged, burned, wet, frozen, corrupted variants | identity mask, damage locality, state ordering, no silhouette fraud | **V1 BUILT + PROVEN** |
| 6 | Palette harmonizer | admitted art + realm palette -> constrained candidate variants | CIEDE2000, hue/value hierarchy, protected semantic colors | **CANONICAL WRAPPER BUILT + PROVEN** |
| 7 | Trim and nine-slice compiler | ornament strips/corners -> stretch-safe UI/world trim | cap preservation, center repeat/stretch, every target dimension | **V1 BUILT + PROVEN** |
| 8 | Decal/stamp compiler | marks sheet -> rotation/scale-safe decal library | alpha fringe, mip/readability, surface bleed, density board | **V1 BUILT + PROVEN** |
| 9 | Sprite citizenship adapter | raw sprite -> canonical registry preflight + renderer contract | canonical metadata, canvas preservation, real low-light renderer A/B | **CANONICAL ADAPTER + RENDERER V2 PROVEN** |
| 10 | Atlas optimizer | approved loose assets -> runtime atlases | padding/extrusion, UV accuracy, mip bleed, byte budget, stable ids | **V1 BUILT + PROVEN** |
| 11 | Material-map baker | approved albedo -> normal/roughness/emissive proposals | channel ranges, seam preservation, light-rig boards | **V1 BUILT + PROVEN** |
| 12 | Visual regression foundry | any approved family -> stable comparison corpus | fixed camera, perceptual diff, semantic overlays, receipt diff | **V1 BUILT + PROVEN** |

### Useful factories that should remain separate

Some processes share the envelope but should not share algorithms:

- An emote verifier must not use a roof-seam score as a proxy for identity.
- Palette conformance must not repaint source art during technical proof.
- A condition-state factory may change local silhouette only when the state contract licenses it;
  an emote factory may not casually remove equipment or limbs.
- Atlas packing is lossless infrastructure. It cannot become an admission shortcut.
- Visual regression detects change. It cannot decide that the change is tasteful.

That separation keeps each tool narrow without duplicating provenance and receipt machinery.

## V1 suite proof

`build/assetforge_apps.py` implements the eleven non-emote vertical slices and is loaded by the
main `build/assetforge.py` command. The retained proof corpus lives at
`dev/model-qa/assetforge-suite/`.

The suite gate is:

```bash
python3 build/assetforge.py suite self-test --force
```

It must report all eleven positive fixtures as `PASS` and all eleven deliberately invalid fixtures
as `FAIL`. Each invalid fixture owns a specific bite:

| family | red-first control |
|---|---|
| boundary | non-periodic source material |
| repeat | empty component sheet |
| prop kit | isolated-component/id count mismatch |
| condition | unlicensed silhouette growth |
| palette | protected semantic color absent from the destination palette |
| trim | target smaller than fixed caps |
| decal | a source mark bleeding off the sheet |
| citizenship | source silhouette touching the delivery boundary |
| atlas | duplicate stable ids |
| material | a required seamless albedo with mismatched edges |
| regression | changed current capture against a zero-difference budget |

The suite proof board shows each positive output at its actual aspect and labels the paired
`PASS/FAIL` result. It also proves that the workspace root and live asset tree are rejected as
destructive output targets. Receipts—not filenames or console prose—are the durable evidence.

These are first vertical slices, not final production breadth. They prove the shared compiler
architecture and the defining invariant of each family. Adding a new dialect, packing strategy,
condition vocabulary, channel derivation, or runtime adapter requires new manifests and negative
controls without weakening the V1 receipt.

## Real-asset qualification

The synthetic suite above is the fast contract regression. Production-shaped qualification is a
separate retained harness:

```bash
python3 build/qualify-assetforge-real.py --force
```

The harness requires hydrated, decodable Git LFS content and fails loudly on pointer text or a
source-hash mismatch. It runs all twelve families against named Genesis assets, including the real
fighter sprite/emote return, floor and plaque art, slate components, dirty dressing exports, crack
decals, the existing material-workbench condition maps, and tracked floor/grass/path/road/rock/scree
materials for the boundary dialect suite. It records:

- tracked leaf-source paths, byte sizes, SHA-256 hashes, and decode status in
  `dev/model-qa/assetforge-real/source-evidence.json`;
- exact lineage for the two explicit staging composites (the prop qualification sheet and
  aged-wet condition state);
- one manifest, receipt, and individual proof board per process;
- twelve expected passing candidate runs plus one deliberately changed real-image regression
  control which must fail;
- a combined navigation board which is explicitly not accepted as proof by itself.

The retained qualification receipt is
`dev/model-qa/assetforge-real/qualification-receipt.json`. The 2026-07-28 run met all 13
expectations. The separate hash-bound inspection ledger is
`dev/model-qa/assetforge-real/individual-visual-review.json`; rerunning the qualifier deliberately
removes it so changed outputs cannot inherit a stale visual verdict. Individual inspection exposed
and repaired three defects before that result was
accepted: nominal grid slicing clipped a crack branch, and loose distance-based prop cleanup kept
neighboring-sheet fragments. Decals now support anchor-assigned alpha-component groups with an
all-source-alpha-assigned gate; the prop qualification uses zero-gap component ownership and
records its cleanup ratio. The repeat compiler also rejects a visually repetitive selection policy
in favor of deterministic adjacency-aware variant selection.

This is a technical qualification boundary, not an art-admission boundary. Emote identity/taste,
material-channel authorship, and every production routing decision remain explicitly reviewable.

### Founder review correction — 2026-07-28

Adam's individual review rejected the current repeat output and the current prop proof, requested a
stronger age treatment, and required consolidation rather than parallel implementations for
palette, citizenship, and material maps. The durable review is
`dev/model-qa/assetforge-real/founder-review-2026-07-28.json`.

- **Repeat:** technical `PASS` is invalid as a production claim. The 512-pixel tile does not close
  the 82×72 course period; `forcePeriodic` launders the outermost pixels without closing placement
  phase.
- **Prop kit:** fragment cleanup works, but every selected leaf source already touches an image
  edge. Camera equivalence and production ground-depth behavior were not proved.
- **Condition:** Assetforge is the state registration/verifier layer. Stronger age generation
  belongs to the canonical material workbench.
- **Palette:** resolved. `build/unify-corpus.py` remains the only algorithm authority; Assetforge
  now wraps its shared defringe, Lab quantization, CIEDE2000, dominant-hue, forbidden-chroma, alpha,
  and semantic-color gates.
- **Citizenship:** resolved at the tool/schema boundary. Assetforge is a source-canvas-preserving
  single-asset adapter over `build/gen-sprite-registry.py`. The existing Theater renderer now owns
  the v2 low-light contract and its real Clayroom A/B proof.
- **Atlas:** retained as a promising compiler, but must converge on the documented potpack/runtime
  atlas contract before later Clayroom proof.
- **Material maps:** the periodic normal companion, material workbench, and Material Maker lane
  remain canonical. The parallel Assetforge baker is slated for removal or wrapper conversion.

### Consolidation response — 2026-07-28

The palette and citizenship duplication findings are resolved in the prototype toolchain:

- `palette compile` dynamically loads `build/unify-corpus.py` and uses its shared defringe, Lab
  nearest-palette mapping, CIEDE2000 metrics, dominant-hue gate, and forbidden-chroma gate.
  Assetforge adds only the manifest/hash validation, semantic-color gate, quarantine, receipt, and
  proof board. The retained real result reports mean/p95 CIEDE2000 `4.1830`/`8.2468`, dominant-hue
  shift `3.6507°`, value-rank agreement `0.9549`, and zero forbidden pixels.
- `citizenship compile` dynamically loads `build/gen-sprite-registry.py` and delegates the
  `footX`, `footY`, `worldHeight`, `heightSource`, `contentBounds`, `alphaCutoff`, and
  `shadowProfile` contract. It preserves the source canvas rather than creating a second trimmed
  coordinate system.
- `lit-standee-v2` remains in the canonical renderer path. Minification uses trilinear mipmaps,
  standee materials use alpha-to-coverage, the low-light readability floor is `0.12`, and realm
  tint strength is `0.15`. The retained A/B compares real v1 and v2 production-renderer captures
  under moonlight, torchlight, magic glow, and a daylit negative control. It proves seven real
  registry textures and 63 standee materials:
  `dev/model-qa/assetforge-real/runs/citizenship/low-light-proof/citizenship-v2-before-after.png`.

This is a tool-quality response inside the prototype zone. It does not make any current sprite
final or admitted.

### Founder re-review — 2026-07-28

The consolidation is structurally correct, but two visual claims from the response above are
withdrawn:

- `lit-standee-v2` changed minification from single-level linear sampling to trilinear mipmapped
  sampling. Magnification remained nearest, but play-scale sprites are minified; the mip chain
  visibly softened them. Adam rejected the candidate as blurry. The canonical adapter remains, but
  the renderer recipe returns to `REVISE`.
- The wilderness-path proof uses Assetforge's continuous 2D field renderer over a repeated material
  canvas. It proves route topology, not production terrain presentation. Adam could not tell what it
  would look like in the engine, so it is not an accepted visual proof.
- The proof helper calls `periodic_material()` once and tiles that result across the field. This
  makes the source grass landmarks repeat brutally. Seam closure, per-cell tone jitter, and sparse
  cover splats do not constitute an anti-repetition system.

The next boundary proof must consume a deterministic anti-repeat ground field and run through the
production terrain renderer with the governed camera, standees, elevation/contact, and dressing.

## Non-emote V1 contracts

- **Modular repeat:** keys a component sheet, isolates connected components, places every component
  with a deterministic seed, wraps components across both axes, and emits an exact toroidal tile
  plus a 4×4 cadence proof.
- **Prop/kit:** keys and isolates a declared ordered component sheet, names every component, emits
  normalized foot anchors, packs a lossless atlas, and rejects count or id ambiguity.
- **Condition state:** compares every state to one source identity, locks dimensions, measures
  changed area, enforces declared severity order, and rejects alpha outside a dilated silhouette
  license.
- **Palette:** delegates to the canonical `build/unify-corpus.py` perceptual engine, preserves
  source alpha and protected semantic colors, and records CIEDE2000 mean/p95, dominant-hue shift,
  forbidden-chroma count, and value-rank agreement.
- **Trim/nine-slice:** preserves all four caps byte-for-byte while compiling every declared target
  dimension; targets too small for fixed caps reject.
- **Decal/stamp:** isolates source marks, defringes transparent pixels, builds the complete
  four-rotation/three-scale matrix, checks half-scale readability, and rejects source bleed.
- **Sprite citizenship:** delegates bounds, foot anchor, world height, alpha cutoff, and shadow
  profile to `build/gen-sprite-registry.py`, preserves the original source canvas, and emits a
  preflight card. Renderer proof separately exercises canonical metadata under real light recipes.
- **Atlas optimizer:** sorts stable ids, shelf-packs with payload-preserving extrusion, emits
  normalized UVs and source hashes, proves byte-exact payload round trips, and enforces a byte
  budget.
- **Material-map baker:** preserves the admitted albedo, emits explicitly noncanonical height,
  normal, roughness, and emissive proposals, checks channel ranges and periodic seams, and never
  promotes inferred relief to geometry truth.
- **Visual regression foundry:** compares fixed baseline/current captures, emits ordinary and
  amplified diffs, records both hashes and a normalized difference score, and applies a declared
  threshold without making a taste decision.

# Sprite-emote factory

## Scope

The factory accepts any registered `monster`, `npc`, or `pc` source sprite. This is broader than
default runtime admission. Genesis still budgets emotes primarily for PCs and bosses; an ordinary
NPC or monster bundle remains a candidate until separately licensed.

An emote is one discrete static portrayal of the same identity. It is not:

- an animation frame;
- a different individual in the same role;
- a costume or equipment swap;
- an unlicensed scale or camera change;
- a replacement for procedural standee warps or DM-hand movement.

The default `genesis-core` state pack is:

| id | semantic cue |
|---|---|
| `neutral` | characteristic baseline expression and ready stance without a strong emotion |
| `angry` | anger or hostile intent at maximum readable clarity |
| `happy` | warmth, delight, or relieved happiness |
| `near-death` | severe exhaustion and pain; slumped but still a complete grounded standee |
| `resting` | a quiet seated field-rest pose, contemplative and momentarily unguarded |
| `rear-view` | the same individual turned 180° and viewed from behind; never a mirrored front |

Jobs may supply a different ordered state list. Runtime code must address state ids, never atlas
cell numbers.

## Identity locks

Every generation packet locks:

- the exact individual represented by the supplied source image;
- body plan, apparent age, face/head anatomy, skin/fur/scales, and major markings;
- clothing, armor, weapons, carried equipment, and which side carries them;
- realm palette, pixel density, outline language, lighting direction, camera, and scale;
- the source silhouette's grounding and apparent world height.

Only expression, gesture, and the minimum pose change needed to communicate the requested state may
change. `rear-view` is the sole default viewpoint exception: camera height/projection, scale, and
ground line remain locked while the same individual turns 180° to reveal true back anatomy and
physical equipment attachment. A rear view may not be manufactured by mirroring front artwork.
Creatures without readable human faces use ears, eyes, hackles, tail, wings, stance, compression,
reach, and signature effects. The full body and every identity-bearing component must remain
visible.

## Generation format

- Six states default to a `3 x 2` row-major sheet.
- Cell aspect follows the source silhouette rather than assuming a square.
- The exact realm `Style block:` is copied verbatim from its authority file.
- The source sprite is supplied to the generation worker as the identity reference.
- Background is flat `#FF00FF`.
- Repeating the same identity is a family-specific exception to the ordinary sprite-sheet
  distinct-subject rule. The cells are discrete state variants, explicitly **not animation
  frames**.
- No labels, dividers, scenery, floor planes, cast shadows, or state-to-state overlap.

## Mechanical proof

The v1 compiler proves:

- the job still resolves to the same source path and SHA-256;
- actual sheet dimensions are divisible by the declared grid;
- every required cell contains non-background content;
- every cell has chroma/transparent clearance on all four outer borders;
- keyed output has alpha and no excessive magenta edge residue;
- normalized content scale remains within the declared occupancy tolerance;
- deliberately seated/compressed states remain inside their separate licensed scale envelope;
- ground contact remains within the declared normalized baseline tolerance;
- coarse state palette coverage remains within the source-identity budget;
- atlas rectangles, UVs, state paths, hashes, and dimensions agree;
- the proof board renders the source, every labeled state, baseline guides, and a reduced
  play-scale row without distortion.

These gates prove technical identity invariants, not artistic sameness. The receipt therefore
reports:

```text
mechanicalIdentity: PASS | FAIL
visualIdentity: REVIEW_REQUIRED | APPROVED | REJECTED
```

No metric may silently promote `visualIdentity` to `APPROVED`.

Every ingest also emits `visual-review.json`. It requires a per-state verdict plus explicit checks
for state read, identity continuity, limb/hand anatomy, equipment presence and attachment,
grip/contact plausibility, silhouette continuity, and play-scale readability. Rear view adds true
back-construction and rear-equipment-attachment checks. Compile a filled checklist with:

```bash
python3 build/assetforge.py emote review <visual-review.json>
```

Any failed check produces `visualIdentity: FAIL`; any blank check produces `INCOMPLETE`. Only a
fully filled all-pass checklist can produce a visual `PASS`, and even that remains a candidate until
the separate runtime-admission boundary.

## Negative controls

The self-test must reject all of:

1. one blank required state;
2. a state shifted far enough off the shared ground line;
3. a state with source-palette identity replaced by an unrelated palette;
4. non-key contamination touching a cell boundary.

The self-test itself exits nonzero if a bad fixture passes or a valid fixture fails.

# Boundary auto-tile compiler

## Why this is separate from seamless tiling

A seamless material answers “can this field repeat forever?” A boundary set answers “what happens
where that field stops, turns inward, forms an island, touches itself diagonally, or meets another
material?” A perfect seamless center tile can still produce broken corners, doubled outlines,
phase resets, and one-cell holes when used as an auto-tile family.

The boundary compiler consumes admitted repeatable fields; it does not replace the repeat compiler.

## V2 dialect matrix

The compiler does not force every boundary problem through Blob47. The manifest declares one of
four named dialects, each with its own topology and proof:

| Dialect | Runtime grammar | Visual job | Exhaustive proof |
|---|---|---|---|
| `enclosure` | sanitized eight-neighbor Blob47 | room, manor, church, courtyard, bounded floor field | 256 raw masks -> 47 shapes; 2,312 compatible pairs; topology torture maps |
| `path` | full eight-neighbor 256 network | narrow wilderness paths, game trails, diagonal ridges, loops, forks | all 256 masks; 49,152 compatible pairs; four real field renders |
| `road` | cardinal 16 network | wide roads with shoulders, paired ruts, crossings, dead ends | all 16 masks; 128 compatible pairs; four real field renders |
| `cliff` | cardinal 16 transitions + integer elevation | escarpments, terraces, mesas, outcrops, ravines | all 16 transitions; four elevation bands; four dimetric height-field renders |

`path` and `road` are intentionally different dialects. A road is not a path with a larger brush:
it owns shoulder width and paired track detail. A cliff is not a material outline: it owns integer
height and exposes shaded/striated faces between elevation bands.

The real multi-dialect manifest is
`dev/model-qa/assetforge-real/manifests/boundary-real.json`. Its individual proof boards are:

- `dev/model-qa/assetforge-real/runs/boundary/candidate/dialects/architectural-enclosure/proof-board.png`
- `dev/model-qa/assetforge-real/runs/boundary/candidate/dialects/wilderness-path/proof-board.png`
- `dev/model-qa/assetforge-real/runs/boundary/candidate/dialects/wilderness-road/proof-board.png`
- `dev/model-qa/assetforge-real/runs/boundary/candidate/dialects/cliff-elevation/proof-board.png`

The combined board at `dev/model-qa/assetforge-real/runs/boundary/candidate/proof-board.png` is a
navigation surface only.

## Blob47 enclosure semantic neighbor model

The enclosure dialect's canonical source key is an eight-neighbor mask:

```text
N E S W NE SE SW NW
```

Cardinal bits say whether the same connected material occupies that neighbor. A diagonal bit is
meaningful only when both adjacent cardinal bits are present. Sanitizing the 256 possible raw
eight-bit masks under that rule produces the standard 47 connected “blob” shapes.

The enclosure compiler emits both:

- all 47 canonical shapes, named by semantic mask rather than atlas position; and
- a deterministic lookup mapping every raw mask `0..255` to one canonical shape id.

Runtime consumers ask for a semantic mask. They never know that a particular corner happens to be
atlas cell 19.

Example id:

```text
n1-e1-s0-w0-ne1-se0-sw0-nw0
```

## Family manifest

`boundary init` can author a single dialect:

```bash
python3 build/assetforge.py boundary init assets/material.png \
  --dialect enclosure \
  --output dev/model-qa/jobs/enclosure.json

python3 build/assetforge.py boundary init assets/path.png \
  --outside-material assets/grass.png \
  --dialect path \
  --output dev/model-qa/jobs/path.json
```

`--outside-material` is required for `path`, `road`, and `cliff`. The real qualification manifest
uses a suite wrapper whose `dialects` array points to four compiled child manifests, so every
dialect retains its own receipt and proof.

```json
{
  "schemaVersion": 1,
  "family": "boundary-autotile",
  "familyId": "fantasy-packed-earth-to-void-v001",
  "algorithmVersion": "boundary-blob47-v1",
  "insideMaterial": {
    "tile": "assets/<approved-seamless-inside>.png",
    "sha256": "<hex>"
  },
  "outsideMaterial": {
    "mode": "transparent"
  },
  "edgeLanguage": {
    "sourceSheet": "dev/model-qa/<edge-components>.png",
    "sourceHash": "<hex>",
    "borderWidthPx": 12,
    "cornerRadiusPx": 8,
    "orientationPolicy": "rotatable-organic",
    "phasePolicy": "world-locked"
  },
  "tileSizePx": 128,
  "atlasColumns": 8,
  "seed": 73129,
  "admission": {
    "scope": "candidate-only"
  }
}
```

`outsideMaterial.mode` may be `transparent`, `solid`, or a second admitted repeatable material. A
two-material transition records both source hashes and declares which material owns the edge.

`orientationPolicy` is one of:

- `rotatable-organic`: rotations are allowed and are mechanically proven equivalent;
- `authored-cardinals`: north/east/south/west pieces must be supplied separately;
- `directional-construction`: rotation/flip is forbidden; roof courses, grain, writing, and gravity
  retain their authored direction.

## Enclosure compilation algorithm

1. Validate source hashes, dimensions, licenses, alpha mode, and declared orientation policy.
2. Enumerate all raw masks `0..255`.
3. Sanitize illegal diagonals and reduce them to the 47 canonical semantic masks.
4. For each canonical mask, rasterize the connected-cell occupancy shape at a higher internal
   resolution.
5. Sample the inside material in world-locked phase. Neighboring cells must sample the same
   infinite field coordinates; restarting texture phase in every tile is forbidden.
6. Construct convex and concave boundary bands from the semantic occupancy mask.
7. Apply supplied edge/corner components according to their orientation license. Generated
   components may propose appearance; mask topology remains deterministic.
8. Downsample with the declared pixel-art policy and cut each exact tile rectangle.
9. Pack canonical shapes into an atlas with padding/extrusion and emit stable semantic ids, pixel
   rects, normalized UVs, and the full 256-entry lookup.
10. Render exhaustive pair proofs and topology torture maps.

`boundary-blob47-v1` remains the named enclosure dialect; it was not broadened into a vague
universal algorithm. Path, road, and cliff use separate named topology compilers and gates.

## Enclosure proof maps

Every family renders, at minimum:

1. a one-cell island;
2. a solid rectangle large enough to expose material repetition;
3. a one-cell hole inside a solid field;
4. a donut with both convex and concave corners;
5. an L and mirrored L;
6. a one-cell-wide neck joining two masses;
7. a staircase diagonal;
8. disconnected diagonal kisses;
9. an S-curve/snake one cell wide;
10. a randomized seeded field containing every canonical shape;
11. for two-material families, reciprocal A/B regions and a closed A island inside B.

The board overlays optional semantic-mask labels outside the beauty capture. It also emits a clean
capture with no debug marks.

## Dialect-specific mechanical gates

### Exhaustive lookup

- all 256 raw masks resolve;
- exactly 47 canonical shapes exist for the blob-47 dialect;
- no atlas rect overlaps another;
- every canonical shape is referenced by at least one raw mask;
- mapping is stable across repeated builds.

### Neighbor closure

For every horizontally and vertically compatible pair:

- the binary inside/outside occupancy agrees along the shared edge;
- border thickness agrees within one delivery pixel;
- no double border, pinhole, or transparent crack exists;
- inside-material sampling has continuous world phase;
- outside-material sampling has continuous world phase when present.

### Topology preservation

For every torture map:

- connected-component count matches the semantic input;
- hole count/Euler characteristic matches the semantic input;
- no output pixel crosses outside its licensed occupancy plus border band;
- every input cell remains addressable and no one-cell neck disappears.

### Visual integrity

- boundary colors remain inside the declared palette budget;
- pixel density and outline language match the family source;
- proof captures preserve exact tile aspect and nearest-neighbor scale;
- clean and debug boards hash the same compiled tile atlas.

### Path and road networks

- every legal mask has an atlas entry and appears in the seeded stress field;
- every shared cardinal or diagonal connection agrees across both participating cells;
- the whole-field renderer remains continuous through turns, forks, loops, crossings, dead ends,
  switchbacks, and shortcuts;
- path diagonal joins do not pinch into separated dashes;
- road shoulders and paired ruts remain distinct from the narrow path language.

### Cliff elevation

- all 16 cardinal transition masks resolve;
- integer height bands remain stable across repeated compilation;
- every height discontinuity produces an exposed face with consistent shade and striation;
- the dimetric proof covers escarpment, terraced switchback, mesa/outcrop, and ravine layouts;
- at least four elevation bands appear in the retained stress set.

## Boundary negative controls

The verifier must preserve and reject at least these mutations:

- swap convex and concave corner components;
- ignore the diagonal-suppression rule;
- reset material phase at every tile origin;
- delete one canonical shape from the lookup;
- offset one edge by one or more delivery pixels;
- rotate a `directional-construction` component;
- relabel two atlas cells while leaving their pixels untouched.

These controls catch the common failure where an atlas looks plausible as a sheet but lies to the
runtime lookup.

## Boundary outputs and receipt

```text
<family-id>-atlas.png
<family-id>-atlas.json
<family-id>-lookup-256.json
<family-id>-proof-clean.png
<family-id>-proof-debug.png
<family-id>-pair-matrix.png
<family-id>-receipt.json
```

The V2 suite additionally emits `dialect-index.json`, a suite receipt, one child directory per
dialect, one atlas/receipt per child, and four individual field renders per path/road/cliff child.

The receipt records source hashes, dialect/version, seed, orientation policy, all 47 semantic
shapes, the 256-entry lookup hash, per-gate metrics, torture-map topology results, output hashes,
and:

```text
technicalStatus: PASS | FAIL
tasteStatus: REVIEW_REQUIRED | APPROVED | REJECTED
runtimeAdmission: CANDIDATE | ADMITTED
```

## Historical V1 delivery order

1. Land and use the sprite-emote factory as the shared-envelope proving ground.
2. Extract common hashing, path, receipt, and proof-board helpers only after the second family shows
   which abstractions are genuinely shared.
3. Implement `boundary-blob47-v1` with synthetic flat-color fixtures first.
4. Make every boundary negative control fail before ingesting generated edge art.
5. Adapt one already-approved seamless Genesis material.
6. Review the torture maps at play scale.
7. Only then add two-material transitions or alternate dialects.

That sequence is now complete for the first four dialects. The current next gate is Adam's
individual visual review of the real path, road, and cliff boards, followed by a separate runtime
routing decision if any dialect is accepted.
