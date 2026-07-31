---
type: system-spec
project: Genesis
status: ACTIVE DIRECTION
created: 2026-07-30
authority: ART-DIRECTION-CANON.md
companions: MATERIAL-LANE.md, TRIM-SHEET-PIPELINE.md, GOLDEN-VIGNETTE-VISUAL-GUIDE.md
---

# Physical Texture Module Standard

## 1. Ruling

Genesis authors architectural textures against the same physical units used by architecture and
combat:

- every horizontal combat/grid square is `5 ft × 5 ft`;
- `1 cell edge = 1 world unit = 5 ft = 1.524 m`;
- `1 h = 2.5 ft = 0.762 m`;
- a common storey is `10 ft = 3.048 m`;
- coursed Guard Post masonry uses `1 ft = 0.3048 m` courses, therefore exactly five courses per
  5-ft wall and ten courses per 10-ft wall.

Pixels do not define scale. Every architectural material declares the physical size of its
construction units and the physical projection size of each texture axis.

## 2. Two compatible products

The material system distinguishes:

1. **Continuous parents.** Seamless stone, brick, plaster, timber, roof, and ground fields provide
   construction rhythm and can cover arbitrary legal geometry without stretching.
2. **Authored architectural sprite modules.** Feature panels, trims, condition responses, opening
   surrounds, repairs, ornament, and cultural signifiers are composed primarily as `5 ft wide ×
   5 ft tall` and `5 ft wide × 10 ft tall` wall-face tiles.

The parent may have a longer or shorter closed image period. Its physical unit grid must still
land exactly at each 5-ft and 10-ft boundary. A six-course seamless tile is legal when each course
is exactly 1 ft: a 5-ft wall samples five complete courses and a 10-ft wall samples ten complete
courses without stretching.

## 3. `TexturePhysicalModuleV1`

Every new architectural texture family records:

```text
{
  schema: "TexturePhysicalModuleV1",
  familyId,
  feetPerWorldUnit: 5,
  horizontal: {
    worldUnitsPerRepeat,
    metresPerRepeat?,
    constructionUnitWidthMeters?,
    phaseAnchor
  },
  vertical: {
    worldUnitsPerRepeat,
    metresPerRepeat?,
    constructionUnitHeightMeters,
    constructionUnitHeightWorldUnits,
    unitsPerSourceTile,
    phaseAnchor
  },
  wallFaceModules: [
    { id: "W5H5", widthFeet: 5, heightFeet: 5, aspect: "1:1" },
    { id: "W5H10", widthFeet: 5, heightFeet: 10, aspect: "1:2" }
  ],
  sockets[],
  stretchPolicy,
  remainderPolicy,
  mechanicalEffect: "none"
}
```

`phaseAnchor` is an engine-authored construction datum, not the camera, texture origin, or each
fragment's local minimum. Split wall bays, jambs, lintels, corners, repairs, and stacked storeys
that belong to one construction campaign share the same course datum.

Feet and world units are authoritative because the existing renderer still contains legacy
material metadata that labels one combat cell as `1.65 m`. That historical value is not exact SI
conversion and must not drive construction-unit arithmetic. One-foot courses are always `0.2 wu`;
five rows are exactly `1 wu / 5 ft`, and ten rows are exactly `2 wu / 10 ft`. Exact SI values may
also be recorded for documentation, but projection uses world units.

## 4. `W5H5` — 5-ft × 5-ft sprite tile

A `W5H5` module is one grid square wide and one grid square tall on a wall face. Its source sprite
is square at the family texel density. It may reserve:

- five one-foot masonry courses;
- base-course and cornice sockets;
- a lower condition-response band;
- one opening-foot, sill, plaque, narrow pilaster, drain, repair, or signifier socket;
- left/right continuation, corner, end-cap, and opening adjacency sockets.

Not every 5-ft panel contains a feature. Quiet panels are required to prevent wallpaper density.

## 5. `W5H10` — 5-ft × 10-ft sprite tile

A `W5H10` module is one grid square wide and one common storey tall. Its source sprite is 1:2 at
the same pixels-per-foot as `W5H5`. A 10-ft wall bay may use one `W5H10` tile or two compatible
stacked `W5H5` tiles. It can carry richer pixel-authored structure:

- complete door or window surrounds;
- arches and relieving courses;
- buttress or pilaster rhythms;
- base-to-cornice condition histories;
- repair patches that interrupt several courses;
- cultural paint, banners, reliefs, heraldry, or ritual marks;
- large stains, ivy routes, and water histories with causal sockets;
- grand-interior wall panels, stained-glass registers, and monumental ruin fragments.

The module owns presentation only. Openings, collision, cover, stairs, and wall silhouettes remain
engine geometry and must already exist before a matching visual module is selected.

## 6. Feature representation modes

Authored wall sprites do not force every feature into geometry or every feature into paint:

- `SURFACE_FEATURE`: blind windows, sealed niches, plaques, murals, stains, repairs, carved panels,
  painted signs, and other non-mechanical face detail may live entirely in the sprite tile.
- `APERTURE_SKIN`: a window, door, arrow slit, drain, or breach with tactical meaning binds to a
  real engine-authored opening. The sprite supplies surround, mullions, glazing, shutters, joints,
  and adjacent block composition around the aperture mask.
- `HYBRID_RELIEF`: the sprite carries most pixel detail while shallow geometry supplies a sill,
  lintel, hood mould, pilaster, balcony bracket, cornice, or other silhouette/contact cue.
- `FULL_GEOMETRY`: features whose depth, traversal, collision, cover, or silhouette matter remain
  geometry; their material still follows the same module grid.

A surface-only feature may not imply a traversable or sight-bearing aperture.

## 7. Assembly law

The procedural architecture engine selects visual modules using compatible sockets:

- `plain`, `feature`, `opening-left`, `opening-right`, `base`, `cornice`, `corner-in`,
  `corner-out`, `end`, `repair`, `wet`, `culture-signifier`, and `quiet`;
- wall length and height determine the available `W5H5`/`W5H10` envelopes;
- world truth, culture, construction campaign, operation state, water, traffic, and repair facts
  constrain candidates;
- deterministic weighted selection supplies variation only among compatible candidates;
- adjacent modules share course phase, palette family, texel density, and construction datum;
- 2.5-ft parapets and remainders use explicit half-height/cap modules or the continuous parent.
  They are never produced by stretching a 5-ft feature panel.

## 8. Standard sprite-envelope ladder

The core ladder is deliberately small:

| ID | Physical envelope | Pixel aspect | Primary use |
|---|---:|---:|---|
| `F5D5` | 5 ft × 5 ft horizontal | 1:1 | one tactical floor/ground/ceiling cell |
| `F5D10` | 5 ft × 10 ft horizontal | 1:2 | corridor, road, carpet, drainage or floor-direction strip |
| `F10D10` | 10 ft × 10 ft horizontal | 1:1 | macro floor composition, mosaic, courtyard feature, wear field |
| `W5H2_5` | 5 ft wide × 2.5 ft tall | 2:1 | parapet, plinth, foundation band, riser, low wall, exposed constructed face |
| `W5H5` | 5 ft wide × 5 ft tall | 1:1 | ordinary wall register and small authored feature |
| `W5H10` | 5 ft wide × 10 ft tall | 1:2 | one-storey wall bay, door/window surround, tall feature |
| `W10H5` | 10 ft wide × 5 ft tall | 2:1 | broad frieze, paired opening, retaining-wall episode |
| `W10H10` | 10 ft wide × 10 ft tall | 1:1 | gate/arch bay, mural, large window, grand authored composition |

`W10H5` and `W10H10` are compound feature envelopes, not the default wall fill. A solver may use
them only when two adjacent 5-ft bays are available and the feature merits one continuous authored
composition.

Additional representations reuse the same dimensions:

- `C5H5` and `C5H10` are **linked two-face corner modules**: two sprites share one corner anchor,
  course phase, culture/history record, and outer/inner corner socket.
- `E5H5` and `E5H10` are wall **end/cap modules** with a front face plus a narrow termination skin.
- `T5` and `T10` are trim runs 5 ft or 10 ft long with semantic physical height, usually 0.5 ft,
  1 ft, or 2.5 ft. They do not pretend to be full wall tiles.
- `P2_5H5` and `P2_5H10` are optional narrow pilaster/post skins when a half-cell-wide authored
  vertical element is visually useful. Collision-bearing columns remain geometry.

Monumental 10×20-ft, 15×20-ft, or giant-scale compositions are legal as **declared compounds** of
the core grid. They retain the same pixels-per-foot, course datum, and socket language; they do
not establish a new texel scale.

Natural responsive terrain is not forced into this wall-tile ladder. Its continuous material and
condition fields follow the real triangles. Only constructed risers, curbs, retaining faces, and
presentation cut faces may use the relevant `W5H2_5`/`W5H5` envelopes.

### Pixels-per-foot

Every member of one family shares one pixels-per-foot value. The first taste review should compare
several densities; the useful authoring arithmetic is:

| Density | F5D5 / W5H5 | W5H10 | W10H10 | One-foot masonry course |
|---:|---:|---:|---:|---:|
| 16 px/ft | 80×80 | 80×160 | 160×160 | 16 px |
| 24 px/ft | 120×120 | 120×240 | 240×240 | 24 px |
| 32 px/ft | 160×160 | 160×320 | 320×320 | 32 px |
| 48 px/ft | 240×240 | 240×480 | 480×480 | 48 px |

Do not assume a power-of-two tile. Atlas pages may remain power-of-two while their padded semantic
slots use exact physical dimensions. A density is admitted only after gameplay-distance,
close-up, nearest-neighbour, memory, and atlas-gutter proof.

The density review is a style review, not a search for maximum resolution. Positive evidence must
retain visible intentional pixels in the governed gameplay frame. Reject a density or material
response when:

- blocks become smooth quasi-photoreal surfaces;
- normal/ORM noise is more legible than the authored albedo clusters;
- mipmapping or linear albedo filtering softens sprite edges;
- procedural micro-noise fills quiet illustrated color regions;
- every feature is displaced or modelled merely because a depth channel exists.

The desired register is rich authored pixelated 2.5D: graphic enough to retain FFT-like economy,
texturally rich enough to approach Triangle Strategy's face treatment, and specific enough to form
a distinct Genesis style.

### Character and creature sprites

`32 px/ft` is the shared **world pixel density**, including live character and creature art. It
describes the physical subject inside a sprite, not the outer transparent canvas and not the number
of screen pixels produced by one camera frame.

- a 5-ft subject occupies 160 authored pixels on its declared physical axis;
- a 5.5-ft human occupies 176 authored pixels;
- a 6-ft human occupies 192 authored pixels;
- a 10-ft giant occupies 320 authored pixels;
- a 1-ft creature occupies 32 authored pixels.

The registry's authoritative `worldHeight`/`feet` remains the physical truth. The authored content
height should equal `round(worldHeight × 32)` after excluding transparent padding. Canvas dimensions
may be larger and may use convenient atlas pages; they must not rescale the subject.

Character production follows these rules:

1. **No universal canvas.** Width follows anatomy, equipment, pose, wings, tails, and silhouette.
   A 192-pixel-tall human may live in a 224- or 256-pixel-tall padded frame.
2. **Shared scale across poses.** Idle, attack, hurt, and death frames retain the same pixels per
   foot and foot/contact datum. A larger action frame expands its canvas instead of shrinking the
   actor.
3. **True aspect.** Wide and non-humanoid creatures are not forced into square cards. Their declared
   physical height governs vertical density; future length/width metadata governs other axes.
4. **Tiny legibility is explicit.** Very small creatures remain true-scale by default. If an
   encounter needs a presentation exaggeration, that multiplier is recorded separately and never
   changes collision, reach, occupancy, or the canonical physical dimensions.
5. **Huge art is not capped to Medium resolution.** Large creatures use larger sources or a
   governed segmented/streamed atlas; they are not downscaled to fit a human sheet.
6. **Attachments share the grid.** Weapons, held props, equipment overlays, shadows, extrusion
   contours, and contact effects use the same subject scale and anchor contract.
7. **Sampling stays crisp.** Nearest magnification, no mip pyramid, alpha-safe gutters, and
   camera-neutral authored pixels remain mandatory. Minification policy may prevent shimmer, but
   may not redefine source density or dissolve the silhouette.

Existing sprites do not become approved merely because the renderer displays them at a true
world-space height. Their opaque/content bounds must be censused against `32 px/ft`; mismatches are
legacy re-authoring candidates, not permission to scale the texture until it appears compliant.

## 9. Texture responsibilities

| Layer | Owns | Does not own |
|---|---|---|
| continuous parent | material identity, construction-unit rhythm, microdetail, normal/ORM | openings, damage history, culture |
| W5H5/W5H10 sprite module | pixel-authored composition inside declared sockets | undeclared collision or silhouette |
| trim sheet | base, cornice, coping, jamb, sill, nosing and end/corner roles | broad wall identity |
| condition response | grime, damp, moss, algae, soot, salt and growth coverage | parent construction pattern |
| geometry | silhouette, thickness, openings, support, cover and movement truth | painted microdetail |

## 10. Current capability census

Genesis already has:

- continuous sprite-derived parent materials;
- nearest-sampled sprite texture loading;
- face-local/world-locked projection;
- real aperture, wall, trim, corner, and shallow-relief geometry;
- named trim-atlas roles and condition receivers;
- deterministic WFC-compatible geometry junctions.

Genesis does **not** yet have one integrated wall-face module compiler that:

- registers alternate `W5H5` and `W5H10` sprite tiles;
- validates edge/course/material continuity and pixels-per-foot;
- binds aperture masks to real openings;
- selects variants from culture, condition, repair, and world-truth sockets;
- solves stacked and adjacent face tiles deterministically;
- emits UV/atlas geometry and a selection receipt.

Until that compiler exists, the renderer relies mainly on repeating parents plus 3D features. That
is the capability gap this standard is intended to close.

## 11. Recommended first implementation

Build one deterministic `WallFaceModuleCompiler`, not a second architecture engine.

1. The architecture engine emits a `WallFaceModulePlan` for each real wall face:
   dimensions in feet/world units, construction datum, parent material, real aperture masks, and
   a grid of `W5H5` slots. A `W5H10` candidate occupies two vertically adjacent slots.
2. The compiler selects compatible module variants from engine-authored sockets and world facts.
   It does not choose wall shape, openings, collision, or mechanics.
3. A CPU compositor assembles wall-local albedo, normal, and ORM textures at one governed
   pixels-per-foot density:
   - tile the continuous parent;
   - composite selected full-replacement or RGBA feature modules;
   - cut only engine-declared aperture masks;
   - composite optional condition/culture layers in declared order;
   - preserve nearest-neighbour albedo sampling.
4. The composed maps bind to the existing wall geometry. This avoids a second coplanar wall,
   duplicate shadows, decal z-fighting, and one draw object per 5-ft tile.
5. Shallow relief and full geometry remain separate optional companions addressed by the same
   module/socket id.
6. Cache output by parent hashes, module hashes, wall-face plan fingerprint, pixels-per-foot,
   culture/world-truth refs, and condition fingerprint.

The first Guard Post proof needs only:

- `plain-W5H5`;
- `quiet-W5H10`;
- `window-surround-W5H10` bound to the real observation aperture;
- `repair-W5H5`;
- `lower-condition-W5H5`;
- one Institutional and one Upland cultural feature alternate;
- straight, corner-adjacent, and aperture-adjacent sockets.

This small vocabulary is enough to prove the technology before expanding into large authored
libraries.

## 12. Rejection rules

Reject a candidate when:

- scale is inferred from image resolution;
- a wall face stretches one image to fit;
- five feet does not land on a construction-unit boundary;
- split wall members reset course phase;
- an opening or corner cuts through a painted feature without a compatible socket;
- 5-ft and 10-ft modules change texel density;
- a condition or cultural layer bakes one parent's block shadows into reusable art;
- a feature panel invents a mechanical opening, ledge, stair, or cover object.

## 13. Proof

Admission requires:

1. a labeled physical card beside a Medium standee and 5-ft ruler;
2. exact unit arithmetic in the manifest;
3. 5-ft and 10-ft wall renders with no partial vertical construction unit at either boundary;
4. straight, split, corner, opening, and remainder assemblies;
5. four camera bearings;
6. at least two changed dimensions and two changed seeds;
7. receipt evidence that material projection has no mechanical effect.

## 14. Implementation checkpoint — WallFaceModuleCompilerV1

The first Guard Post slice is live:

- the architecture engine emits four deterministic `WallFaceModulePlanV1` records for the
  guardroom wall runs;
- the Guard Post family requests `authored-pixel-bold`, preserving deterministic placement while
  increasing pixel-cluster size and value separation enough to read at gameplay zoom;
- every plan carries an exact start/axis/base construction datum, feet and world-unit dimensions,
  a 5-ft slot grid, 32 pixels per foot, and the committed mechanics fingerprint;
- real doors and observation apertures enter the plan by exact engine dimensions and stable ids;
- the renderer composites quiet variation, physically aligned aperture surrounds, and a
  noncanonical culture/world-truth placeholder onto existing wall receivers;
- the composed layer uses nearest sampling without mipmaps and adds no geometry, shadows,
  collision, openings, cover, or movement;
- authored albedo alpha derives a restrained tangent-space edge normal and roughness response
  while retaining the parent's normal/ORM construction signal;
- linked records explicitly bind quiet `W5H10` thoughts and aperture-spanning `W10H10` thoughts
  across their underlying `W5H5` solver cells;
- Institutional and Upland plans select different expression media while retaining identical
  physical wall and aperture truth.
- `dev/verify-golden-vignette-wave2.mjs` now exercises exact 5×5-ft, 5×10-ft, aperture-bearing
  10×10-ft, 25×15-ft, 17.5×12.5-ft remainder, and floating-point near-boundary faces through the
  generic compiler. The labeled runtime-compositor proof is
  `artifacts/golden-site-1-wall-modules-v004/dimension-ladder/guard-wall-module-dimension-ladder.png`.

This is an admitted **albedo compiler slice**, not completion of the wall system. The following
remain required:

- dedicated authored feature normal/ORM assets beyond the current alpha-derived companion;
- corner-, end-, remainder-, repair-, and stacked-storey proofs;
- changed-dimension mutation proofs in addition to changed seeds;
- a production asset library that replaces the renderer's first fixed pixel motifs without
  changing the engine/compiler contract.
