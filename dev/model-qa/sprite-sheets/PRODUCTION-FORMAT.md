---
type: sprite-production-contract
status: ACTIVE — preferred format for every new sprite batch
created: 2026-07-24
owner: docs/ART-DEPARTMENT.md
formatVersion: 1
---

# Sprite Production Sheet Format

This is the formatting authority for new Genesis sprite-production packets. It takes the proven
document grammar from the realm packets in this directory—one exact style block, one explicit
mechanical block, named sheet sections, and numbered row-major subjects—and makes every production
decision visible enough for a lower-capability generation worker to follow without inference.

This file owns packet **format**, not roster truth or art style. `docs/ART-DEPARTMENT.md` owns the
live pixel register and style law. Each realm file owns its exact `Style block:` wording and subject
roster. Manifests own slugs and cell joins. If an older packet, generator, vision-quest guide, or
historical manifest disagrees about production formatting, this file wins for new work.

## Retired universal defaults

The following remain historical evidence but are not defaults for new generation:

- fixed 6 columns × 6 rows / 36 subjects for every sheet;
- fixed 5 columns × 5 rows / 25 subjects for every sheet;
- fixed 1 column × 4 rows or 4 columns × 1 row for every production sheet;
- square cells for every subject;
- 4:5 portrait cells for every subject;
- 4:6 portrait cells for every subject.

Old returned art and its exact prompt packet remain reproducible. Do not rewrite generated packets
to disguise what produced them. Retiring their authority means they cannot be copied forward as the
format for a new batch.

## Vocabulary — never mix these notations

- `gridColumns × gridRows` describes **how many cells** the sheet contains. Example:
  `gridColumns: 4`, `gridRows: 6` means 24 cells.
- `cellAspect W:H` describes **one cell's shape**. Example: `cellAspect: 4:5` means each cell is
  portrait.
- `canvasWidthPx × canvasHeightPx` describes the requested image dimensions. Example:
  `canvas: 1280 × 1600`.
- `cellWidthPx × cellHeightPx` describes the arithmetic allocation for one cell before slicing.

Never write bare `4×6` in a production instruction. Say `gridColumns: 4; gridRows: 6` or
`cellAspect: 4:6`. A 4-column × 6-row character grid and a 4:6 giant cell are different facts.

### Canvas arithmetic

Before generation, choose integer cell dimensions that express the requested aspect exactly:

```text
cellWidthPx : cellHeightPx = cellAspect W:H
requestedCanvasWidthPx = gridColumns × cellWidthPx
requestedCanvasHeightPx = gridRows × cellHeightPx
capacity = gridColumns × gridRows
```

The packet must state all five dimensions. Requested canvas width must divide evenly by
`gridColumns`; requested canvas height must divide evenly by `gridRows`. If a generation surface
cannot honor those exact pixels, do not alter the packet after the fact: record actual canvas and
derived actual cell dimensions in the receipt, then FAIL aspect QA when the deviation materially
squashes or crops the subject.

## Aspect law — subject first

Cell aspect is chosen for the subject's body plan, pose envelope, and important extremities.
Creature-size tier controls sheet density; it does not override anatomy.

| subject profile | starting cell aspect | status |
|---|---:|---|
| characters: PCs, NPCs, ordinary upright humanoids | `4:5` portrait | general default, not universal |
| giant and titanic subjects | `4:6` portrait | **PROVISIONAL TEST CANDIDATE**; exact ratio awaits comparative captures |
| other tall/upright creatures | `4:5` or a declared taller test | decide from the subject |
| long quadrupeds, serpents, vehicles, long weapons, wide wing poses | declared landscape ratio | decide from the subject |
| compact creatures, item icons, square props | `1:1` only when the silhouette genuinely fits | subject-authorized |
| flat signs, banners, decals, fog, streaks, and other dressing | declared from the asset's mounted shape | subject-authorized |

Rules:

1. Do not mix incompatible body plans on one sheet merely to fill cells. Split the batch.
2. Wings, tails, horns, weapons, mounts, swarms, and spell silhouettes count when choosing the
   aspect. The torso alone does not.
3. A character may depart from 4:5 when its actual silhouette needs it; record why.
4. Giant/titanic 4:6 is not locked. Until testing rules it, mark every use
   `aspectStatus: provisional-test` and retain the comparison receipt.
5. The biggest subjects still receive their own sheet. "Own sheet" determines density, not aspect.
6. If a generation surface cannot return the exact requested canvas dimensions, record both the
   requested and actual dimensions. Never report an exact ratio the returned image did not have.

## Density ladder

The existing size ladder remains the starting capacity:

| size band | starting gridColumns | starting gridRows | capacity |
|---|---:|---:|---:|
| titanic | 1 | 1 | 1 |
| gargantuan | 1 | 1 | 1 |
| huge | 2 | 1 | 2 |
| large | 2 | 2 | 4 |
| medium-large beasts | 3 | 3 | 9 |
| medium | 4 | 4 | 16 |
| small | 5 | 5 | 25 |
| tiny | 7 | 7 | 49 |
| tiniest | 8 | 8 | 64 |

For character-heavy batches, `gridColumns: 4; gridRows: 6` remains a proven density option. It is
not a 4:6 cell-aspect instruction. Reduce density when silhouettes need more room.

The no-blank-slots law still applies. Use an `altOf` subject only when the alternate belongs to the
same body-plan/aspect class. Otherwise choose a smaller truthful grid; never add an incompatible
subject to fill a slot.

## Required packet anatomy

Every new production packet uses this order:

1. frontmatter;
2. scope and source provenance;
3. the exact realm `Style block:`;
4. the shared mechanical instructions;
5. a batch plan table;
6. one self-contained section per generated sheet;
7. generation, inspection, and save rules;
8. an output receipt table.

### Required frontmatter

```yaml
---
type: sprite-production-packet
status: READY
formatVersion: 1
realm: <realm>
family: <monster|npc|pc|kid|animal|item|dressing|other>
sourceRoster: <path>
styleSource: dev/model-qa/sprite-sheets/<realm>.md
manifestPath: <path or PENDING>
created: YYYY-MM-DD
---
```

### Required batch-plan row

Every sheet gets one row before any prompt:

```text
sheetId
outputFilename
subjectClass
sizeBand
bodyPlan
subjectCount
gridColumns
gridRows
capacity
cellAspect
aspectStatus: locked | default | provisional-test
aspectReason
cellWidthPx
cellHeightPx
requestedCanvasWidthPx
requestedCanvasHeightPx
chromaKey
camera
order: left-to-right, then top-to-bottom
```

`subjectCount` must equal the numbered roster. `capacity` must equal
`gridColumns × gridRows`. Any unused capacity must be explained and resolved before generation.

### Required self-contained sheet section

Use this exact skeleton:

```md
## `<outputFilename>` — <subjectCount> subjects

Production format:
- sheetId: `<sheetId>`
- gridColumns: <integer>
- gridRows: <integer>
- capacity: <integer>
- cellAspect: `<W:H>`
- aspectStatus: `<locked|default|provisional-test>`
- aspectReason: <one plain-English sentence>
- cellWidthPx: <integer>
- cellHeightPx: <integer>
- requestedCanvas: `<widthPx> × <heightPx>`
- chromaKey: `<hex>`
- camera: `<exact camera instruction>`
- order: left-to-right, then top-to-bottom

Style block: <copy the realm's exact Style block verbatim>

Shared mechanical instructions: <the complete applicable mechanical block; do not say
"same as above" or require the generation worker to reconstruct it>

Subjects, one per cell, in row-major order:

1. **<Exact subject name>** — <identity, anatomy, equipment, and expressive pose cue>
2. **<Exact subject name>** — <identity, anatomy, equipment, and expressive pose cue>
...
```

Every cue must distinguish the subject from its neighbors and state the intended silhouette or
action. Do not rely on a lower-capability worker to invent missing equipment, body plan, pose,
orientation, or identity.

## Shared mechanical minimum

Each self-contained prompt must explicitly state:

- one distinct static subject per cell, not animation frames;
- uniform cell boundaries and no subject crossing a boundary;
- the exact grid, cell aspect, cell dimensions, requested canvas, and row-major order;
- complete subject inside the cell with padding—no cropped feet, head, weapon, wing, horn, or tail;
- full-body ground/eye-level presentation for figures unless the subject contract says otherwise;
- expressive intent, never an accidental neutral mannequin pose;
- flat chroma background using the declared key, with no scenery, floor plane, labels, borders,
  watermark, background shadow, haze, or key-color contamination;
- consistent scale and baseline among comparable subjects on that sheet;
- the exact realm style block;
- any family-specific exception, such as flat-icon items or front-on mounted dressing.

## Generation-worker contract

For each sheet, in order:

1. Read only that sheet's self-contained section plus the named style authority.
2. Submit one generation call using the exact prompt. Do not paraphrase, substitute, reorder, or
   add subjects.
3. Save immediately under the exact output filename.
4. Re-open the returned image and inspect: dimensions, cell count, subject count, row-major
   identity, aspect, camera, complete silhouettes, chroma purity, and style.
5. A failure may be regenerated once with the violated clause repeated exactly. Do not silently
   repair the roster.
6. Record the result honestly. Generated does not mean passed.

## Required receipt

```text
sheetId
outputPath
requestedCanvas
actualCanvas
requestedCellAspect
requestedCellDimensions
actualDerivedCellDimensions
aspectStatus
generationCallId
subjectCountExpected
subjectCountObserved
inspection: PASS | FAIL
failureReasons[]
regenerationCount
```

For a provisional aspect test, also record the comparison subject, comparison ratio, capture path,
and Adam's ruling. Only that ruling may promote a candidate ratio to `locked`.

## Historical-source handling

The realm files in this directory remain valuable because their presentation grammar is proven and
their `Style block:` lines are canonical prompt sources. Their old fixed 5×5/25 numeric clauses
describe the batches that were actually made; they are not erased. New packets copy the grammar,
not those numbers. Generated round-4 and legacy 6×6 prompt files likewise remain reproducibility
records, not formatting authorities.
