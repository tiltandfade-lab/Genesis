# Assetforge sprite-emote generation packet

## Job

- jobId: `emote-spr-fantasy-dire-wolf-v001`
- spriteSlug: `spr-fantasy-dire-wolf`
- exact subject: **Dire Wolf**
- registry kind: `monster`
- realm: `fantasy`
- source reference: `assets/sprites/spr-fantasy-dire-wolf.png`
- source SHA-256: `a6c0c07da09316fbf34e5d8fd4a4b6389e5897887a107482841ef9328c047484`
- source cue: Large Beast, Unaligned, CR 1 — signature move: Bite

Attach the source reference image to the generation call. It is the identity authority. Produce the
same individual in every cell.

## Production format

- sheetId: `emote-spr-fantasy-dire-wolf-v001`
- gridColumns: 3
- gridRows: 2
- capacity: 6
- subjectCount: 6 discrete static states of one identity
- cellAspect: `5:4`
- aspectStatus: `subject-derived`
- aspectReason: Subject-derived: source visible silhouette is wide (1.209 width/height).
- cellWidthPx: 400
- cellHeightPx: 320
- requestedCanvas: `1200 × 640`
- chromaKey: `#FF00FF`
- camera: `Match the source ground-level/eye-level projection; source-facing for states 1–5 and a true 180-degree back view for rear-view.`
- order: left-to-right, then top-to-bottom

Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

## Family-specific mechanical instructions

This is a sprite-emote sheet. Repeating the exact same individual across cells is required and is a
family-specific exception to the ordinary distinct-subject sprite-sheet rule. These are discrete
static expression/state variants, **not animation frames**.

Use one complete full-body state per cell. Keep uniform cell boundaries. No subject, weapon, wing,
horn, tail, effect, or shadow may cross a cell boundary. Keep the entire subject visible with
padding: no cropped feet, head, equipment, limb, wing, horn, or tail. Match the reference's
ground-level/eye-level camera, pixel density, apparent scale, lighting direction, and ground line.
Match its facing direction in cells 1–5. Cell 6 (`rear-view`) is the sole viewpoint exception:
rotate the same individual 180 degrees and show the true back, without mirroring the front art or
changing scale. Maintain a consistent baseline across all cells.

Background must be solid `#FF00FF` filling every non-subject pixel. No
transparency, scenery, floor plane, labels, dividers, watermark, background shadow, haze, or
key-color contamination. The state must read through the subject itself.

For humanoids, facial expression and body language must both read at cell resolution. For
non-humanoids, communicate state through the anatomy the subject actually has—eyes, ears, hackles,
tail, wings, stance, compression, reach, silhouette, and licensed signature effects. Do not force a
human face onto a creature.

## Identity locks

- Preserve the exact individual: apparent age, face/head anatomy, body plan, proportions, skin/fur/scales, and major markings.
- Preserve every clothing, armor, weapon, and carried-equipment identity; keep them on the same side of the body.
- Preserve realm palette, pixel grid/density, outline language, value hierarchy, and lighting direction.
- Preserve camera, apparent world scale, grounding, and foot/contact line; preserve source facing in all states except the explicitly licensed rear-view.
- For rear-view only, rotate the same individual 180 degrees and reveal the true back; preserve physical equipment attachment and never mirror the front artwork.
- Do not add or remove limbs, horns, wings, tail sections, equipment, trophies, scenery, or replacement effects.
- Do not turn states into progressive action frames; each cell must stand alone as one readable portrayal.

Only expression, gesture, and the minimum pose change necessary to communicate the requested state
may change.

## States, one per cell in row-major order

1. **Neutral** (`neutral`) — Characteristic baseline expression and ready stance; alive and specific, but not signaling a strong emotion.
2. **Angry** (`angry`) — Anger or hostile intent at maximum readable clarity without changing equipment.
3. **Happy** (`happy`) — Unmistakable warmth, delight, or relieved happiness while remaining the same individual.
4. **Near death** (`near-death`) — Severe exhaustion and pain, slumped but still a complete grounded standee with the full loadout.
5. **Resting** (`resting`) — A quiet seated field-rest pose, contemplative and momentarily unguarded, with the weapon safely settled; no grass, scenery, or added prop.
6. **Rear view** (`rear-view`) — The same individual viewed from directly behind after a 180-degree turn; reveal true back anatomy and equipment attachment, never a mirrored front.

## Return inspection

Re-open the returned image and record actual canvas, six occupied cells, row-major state order,
complete silhouettes, chroma purity, source identity, equipment continuity, camera, scale,
baseline, and style. A generation may be regenerated once with the violated clause repeated
exactly. Generated does not mean passed.

Receipt fields:

```text
jobId
outputPath
requestedCanvas
actualCanvas
requestedCellAspect
actualDerivedCellDimensions
generationProvider
generationModel
generationCallId
seed
stateCountExpected
stateCountObserved
inspection: PASS | FAIL
failureReasons[]
regenerationCount
```
