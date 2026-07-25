# B06 — Condition Toolkit + `h6-v1` Trim Production Sheet

Status: production complete  
Visible-material law: **ImageGen sprite first, Material Maker second**  
Condition-mask exception: masks are procedural control data, not visible albedo materials.

## Delivered set

- 12 independent ImageGen trim sources: 2 cultures × 6 functional roles.
- Institutional and Upland culture sheets.
- Roles: plain band, base course, cornice belt, coping cap, stair nosing, curb/retaining.
- 7 reusable condition-affinity/suppression masks.
- MM 1.3 output: albedo, height, normal, Godot 4 ORM.
- Packed output: base color, normal, ORM, affinity.
- 1024 authoring masters plus deterministic 512 runtime folds.

## Required source sequence

1. Generate one visible source sprite per role with built-in ImageGen.
2. Require a full-frame, front-on, orthographic albedo source.
3. Exclude perspective, directional illumination, cast shadows, AO, damage, vegetation, labels, borders, and scene context.
4. Preserve natural bounded variation in stone color, block width, and joint placement.
5. Treat the source as repeat-U/clamp-V. Do not force a vertical repeat.
6. Normalize the selected source to 1024 square.
7. Run the autonomous U seam gate.
8. Only after the source passes, generate the MM depth/normal/ORM layer.
9. Compile twice and require byte-identical channel output.
10. Pack verified role strips into `genesis-architecture-core-h6-v1`.

The earlier derived trim attempts `b06-trim-h6-mm-v001` and `b06-trim-h6-mm-v002`
are rejected experiments. They are not production assets and do not establish
precedent. Their flaw was replacing independent ImageGen role authorship with
derived B04 masonry.

## ImageGen prompt contract

Each role prompt must explicitly state:

- one material source sprite;
- square and full-frame;
- front-on orthographic;
- flat albedo only;
- role named in functional architectural language;
- geometry will own the physical profile;
- horizontal/U tiling only;
- vertical/V crop and clamp;
- matching left/right edge structure and color;
- bounded variation without an obvious cadence;
- no background, perspective, lighting, AO, bevel shading, damage, vegetation,
  labels, floor, or scene.

Institutional uses pale, regular dressed limestone. Upland uses heavier selected
local stone with warmer gray/brown variation and deliberately bounded
irregularity.

## Autonomous seam machinery

Implementation:
[`prepare-b06-imagegen-trim.py`](./prepare-b06-imagegen-trim.py)

For each ImageGen source:

1. Measure the wrapped left/right RGB RMS discontinuity.
2. Measure the 95th percentile of ordinary internal horizontal pixel jumps.
3. Compute `wrapped boundary / internal p95`.
4. Apply a U-only 64-pixel symmetric cosine feather to the opposite edge pair.
5. Re-measure the selected source.
6. Pass only when the wrapped U boundary is no greater than `1.10 ×` the
   ordinary internal p95 jump.
7. Never alter or gate the V boundary because these bands clamp in V.

This is topology-aware repair: it locks only the circular U boundary and avoids
the stretching introduced by fitting a square image to a shallow band. The raw
ImageGen file, selected file, before/after metrics, SHA-256 values, and repair
method are recorded in the source receipt.

Source receipt:
`proofs/b06-trim-imagegen-v001/b06-trim-imagegen-source-receipt-v001.json`

## MM and deterministic pack gates

- MM graph resolution: 1024.
- Target: Material Maker 1.3, Godot 4 ORM.
- Albedo must preserve the selected ImageGen source.
- Height and normal must contain measurable broad depth signal.
- ORM requires nonmetal and the authored roughness byte.
- Two independent exports must be byte-identical.
- The `h6-v1` packer crops a native-aspect central strip for each slot.
- Sixteen-pixel top/bottom dilation gutters fill each padded rectangle.
- U remains repeat; V remains clamp.
- Base color, normal, ORM, affinity, metadata, and 512 folds must pack
  byte-identically from both MM runs.

MM verification:
`receipts/b06-trim-imagegen-mm-v001-verification.json`

Pack receipt:
`receipts/b06-trim-packed-v001-receipt.json`

## Condition-mask exception

The seven condition images encode reusable potential or suppression:
damp-darkening, moss, lichen, crevice growth, deposits/grime, cleared-use
suppression, and repair suppression. They are procedurally periodic because
runtime cavities, exposure, traffic, repairs, and canonical condition intensity
must remain authoritative. They are never substituted for the visible
sprite-first material source.

## Review

- Review card: `dev/material-cards/b06-condition-trim-mm-v001.html`
- Static proof: `proofs/b06-trim-packed-v001/b06-trim-packed-proof-board-v001.png`
- Review law: square packed sheets and native-aspect repeat bands only; no
  wall-fit squashing.
