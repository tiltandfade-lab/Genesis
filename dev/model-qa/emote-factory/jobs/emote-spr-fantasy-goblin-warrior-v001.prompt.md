# Assetforge sprite-emote generation packet

## Job

- jobId: `emote-spr-fantasy-goblin-warrior-v001`
- spriteSlug: `spr-fantasy-goblin-warrior`
- exact subject: **Goblin Warrior**
- registry kind: `monster`
- realm: `fantasy`
- source reference: `assets/sprites/spr-fantasy-goblin-warrior.png`
- source SHA-256: `d49935c34ebe4a3e3e97994c328754cfb0d20e7e1a805a3877d9d0399c819086`
- source cue: Small Fey (Goblinoid), Chaotic Neutral_ _The standard rank-and-file raider, armed with bows and rusted blades., CR 0.25 — signature move: Multiattack

Attach the source reference image to the generation call. It is the identity authority. Produce the
same individual in every cell.

## Production format

- sheetId: `emote-spr-fantasy-goblin-warrior-v001`
- gridColumns: 3
- gridRows: 2
- capacity: 6
- subjectCount: 6 discrete static states of one identity
- cellAspect: `1:1`
- aspectStatus: `subject-derived`
- aspectReason: Subject-derived: source visible silhouette is approximately square (1.046 width/height).
- cellWidthPx: 384
- cellHeightPx: 384
- requestedCanvas: `1152 × 768`
- chromaKey: `#FF00FF`
- camera: `Match the source sprite's ground-level/eye-level view, facing direction, and projection exactly.`
- order: left-to-right, then top-to-bottom

Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

## Family-specific mechanical instructions

This is a sprite-emote sheet. Repeating the exact same individual across cells is required and is a
family-specific exception to the ordinary distinct-subject sprite-sheet rule. These are discrete
static expression/state variants, **not animation frames**.

Use one complete full-body state per cell. Keep uniform cell boundaries. No subject, weapon, wing,
horn, tail, effect, or shadow may cross a cell boundary. Keep the entire subject visible with
padding: no cropped feet, head, equipment, limb, wing, horn, or tail. Match the reference's
ground-level/eye-level camera, facing direction, pixel density, apparent scale, lighting direction,
and ground line. Maintain a consistent baseline across all cells.

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
- Preserve camera, facing direction, apparent world scale, grounding, and foot/contact line.
- Do not add or remove limbs, horns, wings, tail sections, equipment, trophies, scenery, or replacement effects.
- Do not turn states into progressive action frames; each cell must stand alone as one readable portrayal.

Only expression, gesture, and the minimum pose change necessary to communicate the requested state
may change.

## States, one per cell in row-major order

1. **Idle / characteristic ready** (`idle`) — Characteristic ready or resting expression; alert and alive, never mannequin-neutral.
2. **Furious** (`furious`) — Anger or hostile intent at maximum readable clarity without changing equipment.
3. **Wounded** (`wounded`) — Pain and strain, still recognizably the same individual with the complete loadout.
4. **Grim** (`grim`) — Resolve, dread, or sorrow held under control; readable even at small play scale.
5. **Triumphant** (`triumphant`) — Relief, pride, or victory without adding trophies, props, or replacement gear.
6. **Afraid** (`afraid`) — Alarm or fear; non-humanoids communicate it through stance, eyes, ears, tail, wings, or compression.

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
