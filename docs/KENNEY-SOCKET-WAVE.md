---
type: system-spec
project: Genesis
status: SPECCED — 2026-07-15 evening (Adam's design-meeting rulings; DESIGN.md 2026-07-15 evening entry)
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md (§5 adoption doctrine, §3.4 foundry contract), ART-DIRECTION-CANON.md
composes: DESIGN-REVIEW-2026-07-15.md (H1/H2/H3), SOL-SOLUTIONS.md P-B, KENNEY-MESH-AUDIT.md (branch), dev/play-lens/DEMAND-LEDGER.md
audience: Sonnet executors (one section = one unit = one branch)
---

# THE KENNEY-SOCKET WAVE — "let's socket these babies and go"

Adam's rulings (verbatim intent, DESIGN.md 2026-07-15 evening): build on the whole Kenney suite;
sockets = the key component of the procedural engine, adopt the kits' own conventions; rollers are
rebuildable in service of assembly (structural side; his authored table CONTENT keeps
propose-and-archive); the bar is Wildermyth and the measured gap is COMPOSITION ("rooms LOOK like
a computer is randomly generating stuff" — target is the codex-mock staging); the tactical north
star is XCOM/FFT-class encounters on these maps (registered, sequenced AFTER assembly works).

The door lesson anchors everything: a door stops being bespoke prism math and becomes a FRAME
piece with a hinge SOCKET plus a LEAF that mounts it. Interactables inherit correctness from
assembly conventions, not per-object geometry code.

Wave posture: `something that works, customized slowly` — kit assembly becomes the DEFAULT look
behind one flag; every prism path survives as fallback. Beauty-wave lineage continues (Adam:
"it absolutely has been working — it just needs more passes") — LIGHT-LAB + Stage E ride parallel.

## KS-1 — The donor adapter + THE SOCKET SCHEMA  ·  branch `feat/ks1-kenney-adapter`

**The pilot set (master-resident packs only):** kenney-modular-dungeon-kit (39) + kenney-mini-dungeon
(25) STRUCTURAL pieces — walls, wall-corners, doorways/gates, doors, arches, floors, stairs —
NOT decor first. (Graveyard/decor admits later through the same lane; the 13 unbanked packs land
per Adam's ruling behind this gate, a separate banking chore.)

**The adapter (one module, e.g. `src/ui/theater-donor.js` + build-time normalizer
`build/normalize-donors.py`):** keyed `{pack, slug, admissionClass, semanticParts, sockets,
canonicalScale}` per Sol P-B + KENNEY-MESH-AUDIT admission classes (DIRECT_MODULATED / CHASSIS /
PART_DONOR):
- Discard authored materials wholesale. Classify node/material names → `stone|wood|iron|roof|
  glass|cloth`; rebuild with Genesis recipes: roughness 0.82–0.94, metalness 0 (iron 0.35),
  five-band albedo through `gradeColorLocal`, nearest-filtered 32×32 grain via
  `interiorMaterialTexture`, per-realm outline law. Grime/wear via the decal lane (naturalistic —
  the decal exemption, NEVER faceted noise).
- **Sockets (the point):** every admitted piece gets socket nodes stamped in its normalized GLTF —
  `floor-mount`, `wall-mount`, `top-surface`, `hinge`, `butt-join-{n|s|e|w}` — derived from the
  kits' own grid conventions (piece bounds snap to the kit's module size; butt-joins at module
  faces; hinges where the kit's own door/gate pieces pivot). Adam's ruling: adopt their
  conventions, don't invent a schema. Socket metadata rides `userData` (classic-script friendly).
- **Scale law:** every piece normalized to the 5-ft cell grid (GRID LAW) at import — one
  `canonicalScale` per pack, measured not guessed; a piece that can't map to the grid is
  PART_DONOR, not DIRECT.
- Deterministic: normalized output cached by recipe hash; source packs byte-untouched; provenance
  per §6 no-human contract (license/attribution already in ATTRIBUTION.md conventions).

**Gate (the three-card bridge, Sol P-B, LOOSE strictness per Adam's Q-answers — kit silhouettes
fine, "no pastel/toy read" is the bar):** per donor family, one card: RAW kit render /
DIRECT_MODULATED under our grade in a real interior / grey-silhouette at gameplay size. REJECT to
CHASSIS only if the modulated card still reads toy/pastel or fights the realm palette. Plus:
`dev/verify-kenney-adapter.mjs` — sockets present+typed on every admitted piece, scale sane vs the
grid (±2%), determinism (byte-identical re-run), material families resolve (zero mottle), manifest
registration. Cards READ by the orchestrator, banked for Adam.

## KS-2 — THE DOOR IS AN ASSEMBLY  ·  branch `feat/ks2-door-assembly`  ·  after KS-1

The doorway becomes: kit doorframe piece socketed into the wall run + kit leaf mounted on the
frame's `hinge` socket. Stage-D door STATES (shut/ajar/open/broken, D4c variants) map to leaf
rotation/removal on that hinge — the state machine is UNCHANGED, only its geometry supplier swaps.
Where kit coverage is missing (squeeze crawls, odd widths), the prism path remains — WITH the
QF-D1 fix folded in here: the prism frame's width axis derives from the LOCAL WALL RUN at the door
cell (wall-neighbor scan), room-rect membership demoted to tiebreak. ⊗ red-first: a corner door +
an octagon-notch door render wrong today (the sideways-frame column Adam flagged), correct after —
BOTH paths (kit + prism fallback). The floating-leaf class (ledger P0 #3) closes structurally:
a leaf cannot float when it mounts a socket.

## KS-3 — ROOM SHELLS FROM THE KIT  ·  branch `feat/ks3-kit-shells`  ·  after KS-1, ∥ KS-2

Rolled room shells assemble from kit wall/floor modules butt-joined on the cell grid: rect rooms
first, then the Stage-C shapes (octagon/L/cave keep prism walls where modules can't turn the
corner — mixed shells are legal and expected). Behind `KIT_SHELL_ENABLED` (default ON after the
gate; one-flag revert to prism shells). Deterministic off walkId+segNum. **Roller alignment
(Adam's authorization):** where rolled dims fight module increments, snap PRESENTATION dims to the
nearest module multiple (the roll stays canonical in the record; the walk-native law holds — this
is a projection rule, not a reroll). If a genuine roller change becomes the honest path, it goes
to Adam as a per-table proposal first. Gate: the C1-class fixtures (rect/L/octagon/tiered) render
kit-shelled with zero gaps/z-fighting at joins (join-seam assert), theater-shot + dungeon-interior
harnesses green, capture cards per shape READ.

## LL-1 — LIGHT-LAB + the Stage-E mechanisms  ·  branch `feat/ll1-light-lab`  ·  ∥ KS-1 (disjoint files)

Adam: control over the environment AND how sprites react to light. Two halves, one unit:
- **The mechanisms (Stage E's core, pulled forward):** exposure floor (interior crush fix, ledger
  #12) + emissive-masked bloom (stop re-blowing what AgX compressed — the B3 daylit Large-creature
  blow-out is the red fixture) + the P-A luminance gates as *measured readouts* (tray-edge %, PC-face
  %, profile medians).
- **The lab:** dev-only overlay (plain DOM, no deps, `?lightlab=1` or a const flag) binding the
  EXISTING named-const tables live — LIGHT_PROFILES per-profile key/fill/ambient, CELESTIAL_ARC
  keyframes, STAGE_AMBIENT_FLOOR / EXTERIOR_AMBIENT_FLOOR, bloom threshold/strength, per-realm
  grade strength, sprite emissive-readability floor (the BW2-4b brightness-law consts — the
  "how sprites react" half). Live re-render on drag; the P-A gate readouts displayed live; EXPORT
  button downloads the current values as JSON; `build/fold-lightlab.py` folds an exported JSON
  back into the named consts (edit-source→artifact preserved — sliders never write code).
  Gate: every slider provably bound (change → measurable frame delta), export→fold→byte-stable
  round-trip, zero production-path cost when disabled.

## CR-1 — review-pass cleanup (the 2026-07-15 adversarial review's confirmed items)  ·  branch `fix/cr1-review-cleanup`  ·  independent, small

(1) `gen-sprite-registry.py:346` orphan fold-in passes `{}` instead of `overlay.get(slug,{})` to
`standee_contract_for` — Adam's editor `floor` override would be dropped on transparent-crop
orphans. (2) `SPRITE_BY_BESTIARY_ID` collision tie-break: prefer qaStatus/candidate over
alphabetical; persist collisions to a report; drive `build_bestiary_id_map` directly in a harness.
(3) `--check` returns before the S4/S6 code paths — extend it to exercise them dry. (4) De-dupe
the TIER2 `console.warn` (once per slug per session). (5) The three stale red harnesses repaired
as FIXTURE updates with why-comments: dressing 6c re-tuned to QF-A3's filtered contract,
diegetic-light P-1a baseline re-derived under AgX, seam-softening 7b fixture densified so the
mutation bites. Validators keep their jobs — no gate weakening.

## Sequencing + what stays frozen

```text
KS-1 (fires now — Adam's explicit go)      LL-1 ∥ KS-1      CR-1 ∥ anything (small)
KS-2, KS-3 stack after KS-1's bridge gate
ST-1 (staging intelligence — the "arranged, not random" dealer pass) specs AFTER KS-3 exists to stage
Tactical combat AI (XCOM/FFT north star) sequences after assembly works — registered, not specced
F1 combat-in-room / F2 staging beats REMAIN QUEUED — they now inherit kit rooms instead of voids
Playtests re-aim at walk generation + assembly edge cases once KS-2/KS-3 are live
```

## ADDENDUM — the meeting's Part II (Adam's Q3–Q20 answers, DESIGN.md 2026-07-15 evening Part II)

The questionnaire is CLOSED. Deltas to this wave:
- **All 16 packs are on master** (merge `ea03e353`) — KS-1's future family sweeps draw from the
  full corpus; "we are building a full kenney engine and we will reskin it."
- **Archive-not-fight:** any procedural system that conflicts with kit-based arrangement retires
  via propose-and-archive (Adam pre-authorized the class; each retirement still gets named).
- **Camera ruling:** cinematic composed angles beat free orbit everywhere they buy beauty; combat
  may adopt FFT quarter-turn. A COMPOSED-CAMERA lane opens after KS-3 (composeShot already exists;
  this licenses locking angles per scene kind).
- **LL-1 disposition:** mechanisms land, lab parks dormant, light lane frozen until Kenney
  environments prove (Q11 supersedes Part I's "critical" — logged transparently in DESIGN.md).
- **ELEV-0 (discussion, NOT build):** rolled elevation convention — Adam: flat maps should not be
  the rule; "let's discuss before just jumping right in." Proposal drafts on Stage C's existing
  dais/pit tier parsing + the kits' stair/platform pieces + a walk-roller elevation field; goes to
  Adam as options, nothing fires without his pick.
- **Flip verdicts:** per-creature, by Adam, over the flip-verdict-sheets (chore in flight);
  mixed corpus is the standing state. **Heights:** Fable estimates the 81 gaps
  (heightSource:"estimated"), Adam re-rules in the editor.
- **B2 later adopts the SMOOTH-contour extrusion register** (the codex-render depth — "minor
  amount of depth… smooth edged extrusions even with rough edged pixel art"; choppy = reject).
- **Scope:** FANTASY-ONLY to pre-alpha; gloom/chrome art tranches parked. Playtest + latency wait
  for Kenney walk-scenes. Promo window: late Sept/Oct 2026.
- Open item for a future pass: the capture rig's DPR (Adam reads test renders as low-res —
  distinguish rig resolution from real canvas quality next lens run).
- **UV unwrap (Adam's 2026-07-15 question):** NOT installed — xatlas-web was ruled "build-time
  spike," xatlas-three DEFERRED (worker capture unsolved), and the 2026-07-13 direction moved the
  pin to watlas; P3-4 (its carrier wave) never fired. Not needed for KS-1's DIRECT_MODULATED path
  (procedural materials on the kits' authored UVs); it becomes load-bearing at the FIRST CHASSIS
  family (ImageGen paint-overs need clean unwraps to bake onto). Ruling: pull the watlas spike
  forward WHEN the first CHASSIS verdict lands, not before.
- **ELEV-1 (Adam picked Option B, 2026-07-15 late):** a rolled per-room elevation-profile table
  (Engine markdown — HIS authoring surface; Fable drafts PROPOSED rows/weights, Adam red-pens
  before any build). Render + cell data first (per-cell ft elevation, 5-ft multiples), mechanics
  ride the tactical wave later. No-clip law: tiers snap to cell groups; stair/ramp cells are their
  own cells; door-aperture cells stay flat; the CONNECTION owns any room-to-room delta (the
  reserved vertical-stair two-slot contract) so rooms never reconcile absolute heights. Depth-bias
  rider (C's flavor cheaply): deeper graph rooms bias toward sunken/chasm rows; true global
  elevation coherence stays deferred until a feature needs it.
