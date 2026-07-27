---
type: operations
project: Genesis
status: BATCH-READY
created: 2026-07-25
owners:
  reference-direction: Codex
  reference-generation: Terra / Codex ImageGen lane
  meshy-operation: Adam
  intake-and-admission: Codex / local Blender foundry
budget:
  ceiling: 300 Meshy model jobs
  accepted: 5
  queued: 295
source:
  - "[[MESHY-PREMIUM-MONTH-1-MODEL-SLATE]]"
  - "[[ART-DIRECTION-CANON]]"
  - "[[FACETED-ART-REGENERATION-PRODUCTION-PLAN]]"
  - "[[BLENDER-MODEL-SPEC]]"
---

# Meshy Premium Month 1 — Batch Production Handoff

## 0. Outcome

The five-object cross-material calibration passed **5/5**:

```text
M001-A natural stone mass
M019-A repeated mechanical wagon
M035-A thin cloth shelter
M059-A mixed-material forge
M068-A open forged-metal light
```

These are five of the planned 300 jobs, not extra tests. The live month therefore has:

```text
300 total planned jobs
  5 accepted canonical-A donors
295 queued jobs remaining
```

The production recipe is approved. Reference images may be generated in batches; Meshy downloads
may be produced in small batches; **admission remains one model at a time** so a bad object cannot
contaminate the naming, cleanup, or acceptance record of its neighbors.

The definitive 300-job machine-readable queue is:

[`Reference/Meshy-Premium-Month-1/batch-production-manifest.csv`](../Reference/Meshy-Premium-Month-1/batch-production-manifest.csv)

It is generated from the 75-family slate by:

```text
node scripts/model-foundry/build-meshy-production-manifest.mjs
```

The slate remains the source of family identity, purpose, and A/B/C/D subjects. The manifest adds
wave order, settings, filenames, ownership, procedural replacements, acceptance focus, and an exact
short Meshy prompt for every row.

## 1. The two production lanes and shared admission stage

### Lane A — Terra / reference-image production

Terra receives one manifest row and this document. Terra:

1. generates exactly one reference image for exactly one job;
2. fills the row-specific facts into the locked prompt frame in §4;
3. preserves the exact quoted canon blocks without shortening or paraphrasing them;
4. saves the image to the row's `referenceImage` path;
5. checks the image against §5 before declaring it ready;
6. makes at most one targeted correction for one named failure;
7. never silently redesigns a family during correction.

Distinct jobs require distinct generation calls. A ten-image wave is ten one-image calls, never one
model sheet and never `n=10` variants of one prompt.

### Lane B — Adam / Meshy operation

Adam receives:

- the approved reference image;
- the row's exact `meshyPrompt`;
- `Image to 3D`;
- `Smart Topology`;
- the row's `targetPolygons`;
- texture off;
- image enhancement off;
- the canonical incoming filename.

Adam may save Meshy's download into `Reference/Meshy-Premium-Month-1/incoming/` under Meshy's
original filename. If several downloads are present, Adam identifies the model id when saying the
file is in. Codex performs the canonical rename only after inspecting the actual GLB.

### Shared post-lane stage — Codex / local intake and admission

Codex:

1. verifies the file is the intended model and topology stage;
2. records triangles, vertices, materials, textures, bounds, and loose islands;
3. renders neutral front, rear, and elevated evidence as needed;
4. compares geometry to the reference and row acceptance focus;
5. removes or replaces only deterministic defects;
6. consolidates useful islands into named ownership groups;
7. exports an untextured `clean-vN.glb`;
8. demonstrates the cleaned result;
9. updates the intake record and manifest builder's accepted map;
10. commits only that model's source, processed donor, proofs, script, and documentation.

## 2. Directory and filename contract

```text
Reference/Meshy-Premium-Month-1/
  reference-images/     approved ImageGen inputs
  incoming/             untouched Meshy downloads after canonical rename
  processed/            deterministic cleaned donors
  intake-previews/      neutral clay admission evidence
  batch-production-manifest.csv
  README.md             per-model provenance and acceptance record
```

Canonical patterns:

```text
reference-images/M###-V-short-family-name-v1.png
incoming/M###-V-short-family-name-smart-N.glb
processed/M###-V-short-family-name-clean-v1.glb
intake-previews/M###-V-clean-front.png
intake-previews/M###-V-clean-rear.png
```

`M###` is the family, `V` is A/B/C/D, and `N` is the requested Smart Topology target. The filename
records the requested target even when Meshy lands modestly above it. The intake record records the
actual count.

Never overwrite an accepted donor with a later attempt. A later accepted correction becomes
`clean-v2`; a rejected source retains its actual stage or receives a diagnostic filename.

## 3. Budget and wave order

### Canonical-A breadth first

The five accepted A jobs are Wave `C0`. The remaining 70 A jobs run in six waves:

| wave | jobs | purpose |
|---|---:|---|
| `A1` | 10 | deferred calibration breadth plus the complete lore-native light kit |
| `A2` | 14 | remaining transport and mechanisms |
| `A3` | 16 | remaining natural and organic formations |
| `A4` | 8 | remaining shelters and service assemblies |
| `A5` | 9 | remaining civic, market, and ritual equipment |
| `A6` | 13 | remaining defensive, industrial, and stateful trace families |

No B/C/D Meshy generation begins until all viable A jobs have an accepted donor or a recorded
family-routing failure. This creates broad world coverage before variants consume the month.

### Variant value order

After canonical A coverage:

```text
V1  M019–M034  transport and mechanisms
V2  M068–M075  lore-native lights
V3  M001–M018  natural formations
V4  M035–M043  shelters and service
V5  M044–M053  civic and ritual
V6  M054–M067  defensive, industrial, and trace clusters
```

Within each group, run B, then C, then D. A model retry consumes real monthly capacity. If a second
Meshy attempt is approved, retire the lowest-priority unstarted D row from the back of `V6`, then
`V5`, and continue backward through the value order. Record the substitution; never pretend the
ceiling grew.

## 4. Terra's locked reference-image prompt

Terra fills only the bracketed fields. The three canon blocks below are quoted verbatim from
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §7 and must remain exact.

```text
Use case: stylized-concept
Asset type: Genesis Fantasy volumetric donor-model reference for Meshy Image-to-3D

Primary request: Create exactly one isolated [VARIANT SUBJECT] for the [FAMILY NAME] donor family.
Functional purpose: [PURPOSE].

Donor geometry must own: [DONOR OWNS].
The engine and local tools own instead: [ENGINE OWNS].
Expected procedural replacements: [EXPECTED PROCEDURAL REPLACEMENTS].

Construction and scale: [ROW-SPECIFIC DIMENSIONS OR TACTICAL FOOTPRINT WHEN KNOWN]. Build the
subject from a few large mechanically or geologically meaningful volumes. Make moving, removable,
repeating, or independently deep major parts visually separable without exploding or floating the
assembly. Additional geometry must earn itself through silhouette, articulation, shadow,
collision, walkability, fixture ownership, or important multi-angle recognition.

Visual language: mature, restrained, high-tier polygonal fantasy art. Construct the visible design
with fewer, larger, deliberate triangular planes. Large facets must follow silhouette, construction,
material boundaries, carving, folds, forging, anatomy, or fracture logic. Use smaller facets only at
important transitions such as hinges, sockets, clasps, relief borders, damage, or other semantic
landmarks. The result must read as sculpted low-poly form, not a triangle filter or cracked glass.
Preserve ornate identity and believable wear. Avoid cute, toy-like, glossy, generic starter-tier art.

Projection: controlled orthographic front-three-quarter view, approximately 45-degree yaw and
25-degree elevation unless the row declares a different evidence-bearing view. No lens distortion,
foreshortening, or perspective convergence. Show the complete silhouette, real openings, and every
major separable part with generous padding.

Geometry ownership: source art owns silhouette, broad albedo regions, polygonal material facets,
paint, carving marks, wear, and damage marks. Real runtime geometry will own thickness, bevels,
side faces, true relief, shadows, and directional lighting. Do not paint those into the source.

Volumetric donor clarification: this image is source evidence for provisional Meshy volume, not an
extruded sprite or final runtime object. Show the major parts as simple visible solid forms required
for reconstruction, but do not fake thickness, bevel, relief, or depth with painted shadow or
surface texture. Meshy output remains a donor that will be rescaled, segmented, re-materialed, and
validated locally.

Material language: [BROAD MUTED MATERIAL REGIONS]. Use large material zones with restrained wear
only at constructionally meaningful transitions. No photoreal grain, tiny fasteners, soot flecks,
individual pebbles, dense brickwork, or other surface noise.

Backdrop: perfectly flat solid warm light-gray #E8E3DB, uniform edge to edge and visible through
every required opening. No floor, horizon, gradient, texture, vignette, reflection, contact shadow,
cast shadow, or lighting variation. Neutral diffuse form description only.

Single-render hard constraint: exactly one isolated object or intentionally fused cluster;
exactly one orthographic front-three-quarter view; no model sheet, turnaround, alternate angle,
inset, underside, duplicate, exploded layout, part catalog, neighboring prop, floor, horizon,
label, dimension, arrow, border, or watermark.

Avoid: pixel art, fake pixels, voxel art, micro-triangulation, dense tessellation, cracked-glass
pattern, random polygon noise, poster illustration, baked directional light, rim light, cast shadow,
perspective painting, scene dressing, or generic mobile-game loot.

Row-specific avoid list: [CATEGORY AND SUBJECT-SPECIFIC AVOIDS]. No character, unrelated prop,
ground base, scenery, text, label, or watermark.
```

The quoted `Geometry ownership` paragraph comes from the component-sheet law and remains unchanged
as required by art canon. The following `Volumetric donor clarification` is the approved Meshy-lane
extension: it permits visible simple volume as reconstruction evidence without treating the image as
final geometry.

## 5. Reference-image acceptance

Before a reference is shown to Adam or uploaded to Meshy, Terra/Codex verifies:

- exactly one object or intentional cluster and one view;
- no model sheet, duplicate, inset, or exploded parts;
- complete uncropped silhouette with generous padding;
- orthographic or visibly low-distortion projection;
- flat `#E8E3DB` background without floor, horizon, shadow, or gradient;
- large deliberate planes rather than photoreal or triangle-filter noise;
- the subject performs the row's functional purpose;
- required openings are visibly open and show the background;
- moving or removable major parts are separable but mechanically connected;
- no engine-owned flame, light, water, text, cargo, contents, decals, or collision proxy;
- no cheap procedural primitive is being purchased unnecessarily;
- no direct reproduction of another game's asset, map, texture, or arrangement.

If one item fails, make one precise correction that names the defect and preserves every approved
invariant. If the correction repeats the same structural error, reject it and regenerate from a new
construction description. The M068 centered-cradle correction is the precedent.

## 6. Adam's Meshy recipe

For every queued row:

```text
mode: Image to 3D
topology: Smart Topology
target: use targetPolygons from the manifest as the target triangle count
texture: NO TEXTURE by default; TEXTURED only when material differentiation is needed
image enhancement: off
```

Paste the exact `meshyPrompt` cell from the row, prefixed with one of these opening sentences after
replacing `N` with the row's `targetPolygons` value:

```text
SMART TOPOLOGY — TARGET N TRIANGLES — NO TEXTURE.
```

```text
SMART TOPOLOGY — TARGET N TRIANGLES — TEXTURED, WITH CLEARLY DIFFERENTIATED MATERIAL REGIONS.
```

Use **NO TEXTURE** for single-material assets and for assets whose physical parts are already
unambiguous from geometry. Use **TEXTURED** when wood, metal, stone, cloth, ceramic, cargo, or other
regions would otherwise be difficult to identify during intake. A textured result is a temporary
material diagram; Genesis still replaces its baked appearance with local semantic materials.

Smart Topology currently produces triangle output. Meshy's separate Quad Remesh operation is not
part of this production recipe and must not be implied by prompt wording. If an accepted donor later
needs editable quad-like construction in Blender, Genesis selectively flattens intended planar
triangle pairs, rebuilds simple primitives, or performs local retopology without paying for a global
quad remesh. Do not ask Meshy for flame, smoke, liquid, lighting, labels, or background removal.

When presenting Meshy jobs to Adam in chat, use this locked format:

1. show one approved reference image directly in chat;
2. place exactly one copyable prompt immediately below that image;
3. begin the prompt with Smart Topology, target triangle count, and either NO TEXTURE or TEXTURED;
4. do not place paths, setup checklists, commentary, fill-in fields, or other prose between the image
   and its prompt;
5. repeat once per model, preserving manifest order.

One approved reference image may produce one planned model. A material-only recolor, mirrored copy,
ordinary rescale, LOD, open/closed transform, or procedural attachment does not earn another Meshy
job.

## 7. Intake decision tree

```text
download arrives
  -> wrong stage / textured high-poly
       -> remesh existing result when possible; do not repay Image-to-3D
  -> correct Smart Topology stage
       -> neutral clay proof + loose-island census
          -> useful silhouette, deterministic repair possible
               -> local cleanup script -> processed donor -> proof -> accept
          -> useful silhouette, no repair needed
               -> ownership grouping only -> processed donor -> proof -> accept
          -> structural failure caused by reference
               -> one targeted reference correction -> one approved Meshy retry
          -> same structural failure twice
               -> stop family; route noun to native/procedural construction or reallocate slot
```

Reference-image corrections do not consume Meshy capacity. Exhaust those cheap corrections before
buying another model. A Meshy retry is never automatic.

## 8. Admission and cleanup contract

A result passes only when:

- silhouette and functional purpose read in neutral clay at the fixed-game-camera family;
- real openings, recesses, sockets, thresholds, and frame gaps remain actual geometry;
- triangle count is proportionate to visible semantic form rather than smoothing;
- no accepted result depends on generated textures;
- loose islands are useful parts or can be deterministically classified;
- duplicate shells, mirrored treatments, or dirty repeated parts can be repaired locally;
- cleanup is faster and more reusable than rebuilding the donor natively;
- runtime ownership is explicit;
- the processed model has stable named groups;
- front/rear/elevated proof shows no leak, floating part, hidden rectangle, or false closure.

The local cleanup script must be source-signature guarded. It refuses a GLB whose triangle count,
island count, or expected part signature changed instead of blindly cutting an unrelated file.

No accepted donor is a runtime asset yet. Runtime citizenship still needs:

```text
stable scale and bottom-centered origin
footprint and mounting class
collision / cover / walkability policy
Genesis materials
allowed scaling axes and variation bounds
sockets and state ownership
locally derived LODs
fixed-camera and clay-room proof
provenance
```

## 9. Category ownership and target bands

| category | families | normal target | donor emphasis | never buy from Meshy |
|---|---|---:|---|---|
| natural | M001–M018 | 700–1,200 | authored masses, entrances, ledges, growth silhouette | exact terrain holes, gravel, decals, water, walkability |
| mechanisms | M019–M034 | 900–1,800 | chassis, frames, major working volumes | rope, chain, standard wheels, pivots, animation, fasteners |
| shelters | M035–M043 | 700–1,200 | broad cloth/service shell and useful supports | stakes, guy lines, exact footprint, furniture, materials |
| civic | M044–M053 | 700–1,400 | institutional silhouette and major sockets | water, paper, text, offerings, contents, culture state |
| defensive | M054–M059 | 800–1,200 | blocker/industrial frame and major fittings | exact collision, flame, tools, force state, repeated hardware |
| trace | M060–M067 | 700–1,200 | a few large causal cluster parts | micro-clutter, decals, gore, custody, random scatter |
| lights | M068–M075 | 500–900 | fixture, mount, hood, open emitter socket | flame, glow, light, smoke, fuel, glass, chain |

The precise first target for every family is in the generated manifest. Raise a target only when a
fixed-camera proof identifies a missing contour that matters.

## 10. Launch wave A1

Wave A1 intentionally combines the three deferred original calibration families with the complete
lore-native light vocabulary:

| order | job | subject | target | reference filename |
|---:|---|---|---:|---|
| 1 | `M005-A` | arched karst cave mouth with real reveal | 1,200 | `M005-A-wide-cave-mouth-with-reveal-v1.png` |
| 2 | `M025-A` | horizontal hand windlass | 1,200 | `M025-A-hand-windlass-and-winch-v1.png` |
| 3 | `M047-A` | narrow empty street-stall chassis | 1,000 | `M047-A-market-stall-chassis-v1.png` |
| 4 | `M069-A` | low freestanding brazier | 600 | `M069-A-freestanding-brazier-basket-v1.png` |
| 5 | `M070-A` | thick open iron cage lantern | 600 | `M070-A-hanging-lantern-v1.png` |
| 6 | `M071-A` | hooded oil mine lamp | 500 | `M071-A-hooded-mine-work-lamp-v1.png` |
| 7 | `M072-A` | squat portable oil lantern | 500 | `M072-A-portable-table-and-hand-lantern-v1.png` |
| 8 | `M073-A` | crystal reliquary cold-light cup | 600 | `M073-A-ritual-cold-light-vessel-v1.png` |
| 9 | `M074-A` | shelf-fungus cool-light cluster | 700 | `M074-A-living-or-mineral-cool-light-cluster-v1.png` |
| 10 | `M075-A` | raised signal-fire basket | 900 | `M075-A-beacon-and-signal-fire-basket-v1.png` |

Terra may generate all ten reference calls as one supervised wave, but Codex reviews each image
individually before it becomes a Meshy input. Adam should upload no more than five uninspected
downloads at once and identify their job ids when reporting that they are in.

## 11. Operator commands

Rebuild and validate the 300-row queue:

```text
node scripts/model-foundry/build-meshy-production-manifest.mjs
node scripts/model-foundry/build-meshy-production-manifest.mjs --check
```

Inspect one job as readable JSON:

```text
node scripts/model-foundry/build-meshy-production-manifest.mjs --job M005-A
```

The one-job output contains every row-specific field, including the exact short Meshy prompt.

## 12. Production completion rule

The month is successful when:

- all viable A families are represented;
- later variants concentrate on the highest-reuse successful families;
- every accepted donor has source, prompt, settings, proof, cleanup, and ownership provenance;
- no retry hides a repeated family-level failure;
- no procedural/extrusion/faced-box/decal/FX noun is purchased merely to fill the quota;
- the final count remains at or below the real Meshy ceiling after retries and reallocations.

The goal is not 300 files. The goal is a high-reuse procedural vocabulary whose 3D donors make
Genesis's generated sites more legible, distinctive, and strategically useful.
