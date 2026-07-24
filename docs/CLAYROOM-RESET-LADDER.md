---
type: system-spec
status: SPECCED — CL-R0 BUILT (2026-07-23); CL-R1 engineering/visual-review candidate BUILT
  (2026-07-24), close torch brightness accepted and expanded-falloff verdict pending; dedicated CL-F02
  display affordances + CL-R2…CL-R6 remain
created: 2026-07-23
owner: this file (the single owning specification for the Clayroom reset/proof ladder)
authority: subordinate to `procedural-dungeon-direction/CLAY-PROOF-LADDER.md` (clay-pass ids) and
  `GRAPHICS-CONVERGENCE-CHARTER.md` (graphics law); consumed by `BATTLEMAP-TOWNTRAY-COMPOSITION.md`
  (C1H), `TRIM-SHEET-PIPELINE.md` (C1I), `MATERIAL-LANE.md` (materials), `GOLDEN-SITES-CATALOG.md`
  (Guard Post entry gate)
sources: Desktop working packet `~/Desktop/Genesis FFT Guard Post Study/analysis/
  CLAYROOM-RESET-PROOF-LADDER-AND-DEV-WORKBENCH.md` (2026-07-23, source-backed live audit), folded
  into the repository this session. The Desktop packet remains intact and is NOT canon by itself.
---

# Clayroom Reset Ladder — CL-R0 … CL-R6

## What this document owns, and what it does not

**Owns:** the question *"is the Clayroom fixture itself trustworthy enough to judge anything else
through?"* — the reset ladder ids `CL-R0`…`CL-R6`, the retained fixture family `CL-F00`…`CL-F06`,
the diagnostic-clay surface contract, the capture/receipt law for clay fixtures, the Lighting Lab
2.0 recipe contract, the narrowly-scoped Sprite Editor delta, and the Clayroom Workbench boundary.

**Does not own:** clay-pass ids (`C1A`…`C5` stay with
[CLAY-PROOF-LADDER.md](procedural-dungeon-direction/CLAY-PROOF-LADDER.md)), composition quality
(C1H → [BATTLEMAP-TOWNTRAY-COMPOSITION.md](BATTLEMAP-TOWNTRAY-COMPOSITION.md)), trim contracts
(C1I → [TRIM-SHEET-PIPELINE.md](TRIM-SHEET-PIPELINE.md)), material authoring
([MATERIAL-LANE.md](MATERIAL-LANE.md)), dev-tool shell/lock transactions
([DEV-PORTAL.md](DEV-PORTAL.md)), the pixel-sprite register
([ART-DEPARTMENT.md](ART-DEPARTMENT.md)), or any art ruling
([ART-DIRECTION-CANON.md](ART-DIRECTION-CANON.md) is the verbatim authority; this file quotes and
routes, it never rules).

**Why a new file rather than an amendment.** The two adjacent candidates both already own a
different subject and would have been diluted by absorbing this one. CLAY-PROOF-LADDER owns
*vertical game-behaviour slices* — "can the player move," "can a canonical event reach the
BattleMat"; every one of its rungs assumes the fixture renders honestly. C1A-CLAY-ROOM.md owns
*one closed pass* (truth-arrived 2026-07-23) and is append-only history for that pass. The reset
ladder is a third thing: a **renderer/fixture-trust gate** that runs across passes and must pass
before C1H, C1I, or Guard Post 1 may consume the fixture. Folding it into either would have made a
closed record mutable or a behaviour ladder carry renderer invariants.

## The product ruling (Adam, 2026-07-23)

The Clayroom is a **deterministic procedural acceptance fixture** — not a miniature authored level,
not a freeform level editor. It exists to prove reusable renderer and construction rules *before*
those systems contaminate judgement of the Guard Post.

Consequences, binding:

- The Clayroom is a **retained family of small fixtures**, not one increasingly cluttered room.
  `CL-F00 room-truth` stays small forever; later benches join it, they never replace it.
- Every fixture uses the **production** compiler, geometry builders, materials, lights, camera,
  sprites, and cutaway path. A special-purpose display may author canonical test inputs; it may
  **never** invent a second renderer.
- The Guard Post proves **site composition** (road, terrain, defended threshold, observation,
  negative space, cultural construction). It must not be spent rediscovering whether a wall corner
  closes, a trim band maps, a sprite keeps its colour, or a light profile can be tuned.

## Founder redlines (verbatim, 2026-07-23)

Recorded in full, dated, in [ART-DIRECTION-CANON.md](ART-DIRECTION-CANON.md) per the CLAUDE.md
decision-capture rule. Restated here only as the acceptance targets each rung answers:

| Redline | Rung that discharges it |
|---|---|
| "The clay room in it's current state sucks." | the ladder as a whole |
| "It seems to have basic dungeon floor glued to it" | **CL-R0** |
| "it doesn't seem to have any ability to have my two temp lighting system in it." | **CL-R1** |
| "the sprite is back to an overexposed undersaturated crappy looking piece of paper that has been through the washing machine." | **CL-R1** → **CL-R2** |
| "I know for sure I still want the lighting lab and i want to be able to basically adjust the default settings for every type of light that could be rolled in the game" | **CL-R1** (Lighting Lab 2.0) |
| "i still want the vertical and horizontal baseline editor added to the sprite sheet" | Sprite Editor delta (§"Sprite Editor") |

## The fixture family

One URL may host these as selectable modes, but each mode is a small retained fixture with one
primary question.

| Fixture | Primary question | Content | Status |
|---|---|---|---|
| `CL-F00 room-truth` | Does the real production room stay honest after every rebuild? | 5×5 room, door, crate, one citizen, neutral clay, seam grid | **LIVE** (`?clayroom=1`) |
| `CL-F01 structure-bench` | Do generic construction atoms join and terminate correctly? | runs, corners, ends, openings, tiers, risers, connectors, blocker | unbuilt (CL-R3) |
| `CL-F02 lighting-bench` | Do diagnostic and rolled light recipes produce controlled, motivated light? | neutral stepped surfaces, one matte sphere/cube, visible fixtures, sprite | **core authoring/recipe system built; visual verdict pending**. Dedicated stepped bench + overlays remain (CL-R1) |
| `CL-F03 sprite-citizenship` | Does source pixel art remain a physical, correctly coloured standee? | representative sprites across size/alpha/value bands | unbuilt (CL-R2) |
| `CL-F04 material-bench` | Do material channels, scale, UVs, roles, and fallbacks work? | floor, wall, riser, trim skeleton, timber, iron, ground | unbuilt (CL-R4) |
| `CL-F05 trim-bench` | Does the `h6-v1` sheet project without hiding geometry defects? | straight/non-multiple runs, corners, endpoint, opening, stair, curb, T-junction | unbuilt (CL-R5) |
| `CL-F06 seed-stress` | Do bounded procedural variants remain legal and readable? | retained seed matrix plus adversarial dimensions/joins | unbuilt (CL-R6) |

## The ladder

### CL-R0 — durable diagnostic-clay reset — **BUILT 2026-07-23**

**Primary question:** can the existing room remain diagnostic clay after asynchronous assets and
rebuilds settle?

Required:

- neutral grey on every intended structural/furniture role;
- no colour texture bound to diagnostic-clay materials;
- **same result before and after sprite/door/fixture async settlement**;
- role-ID diagnostic mode for floor, wall, riser, trim, portal, furniture, emitter, and sprite;
- zero ownerless mounted objects;
- zero mount-socket warnings in the accepted fixture;
- one known-bad replay mutation must visibly return the unwanted dungeon material and fail.

**The diagnostic-clay surface contract (built).** Diagnostic surface selection is a **named,
versioned recipe** (`CLAY_DIAGNOSTIC_SURFACE_RECIPE`, `src/engine/clay-room.js`) consumed by a
**replay-safe post-build override applied through the same mount lifecycle every rebuild uses**
(`clayRoomApplyDiagnosticSurfaces()`, invoked from the single `setInteriorBoard` tail hook
`clayRoomAfterInteriorBoardRebuild()` in `src/ui/theater-boot.js`). It is not a per-frame patch, not
a per-seed patch, and not hand-authored decoration:

1. **Recipe, not code constants.** The role→route table lives in the pure engine module as frozen
   data with an `id` and `version`. The renderer executes routes; it does not decide them.
2. **One lifecycle hook.** Every rebuild — the initial mount and every asynchronous replay
   (`spriteTextureFor`'s texture-settle replay, the kit-door template warm) — passes through
   `setInteriorBoard`, so the override cannot be skipped by a code path nobody remembered.
3. **Production renderer path.** The override swaps materials on already-built production geometry.
   No duplicate test renderer, no bespoke meshes, no second material authority.
4. **Deterministic identity.** Fixture identity (`record.id`/`version`/`seed`) and recipe identity
   (`recipe.id`/`version`) are both carried into every capture receipt.
5. **Provenance is machine-answerable.** `clayRoomSurfaceCensus()` reports, per visible surface,
   which builder made it, which route claimed it, and whether a texture map is still bound — so
   "which system owns this surface?" is answered by the tool, not by reading source.
6. **A named diagnostic mode.** `role-id` colours each structural role distinctly so a surface that
   the recipe *did not* claim is visible as itself rather than hiding inside a field of grey.

**Executable invariant (the teeth):** `dev/verify-clay-room.mjs` check 18 asserts that diagnostic
Clayroom surfaces cannot silently route through dungeon/site materials — an unknown or unresolvable
role resolves to the loud `unclaimed` route and **never** to clay; every structural role routes to
clay; sprite/emitter stay passthrough; every live `interiorKind` (including the room-shell/kit-shell
kinds the old whitelist could not reach) normalizes to a recipe role; and the hook is actually called
from inside `setInteriorBoard`. **Mutation-proven twice:** deleting that one call turns 18j RED
(`96 passed, 1 failed`) *and* returns the dungeon material in a live capture
(`mutation-no-hook-receipt.json`: `texturedSurfaces early=3 settled=3`, floor region collapses to
`neutralPct 100%` at luma 3 because the light profile stops reasserting too — one lifecycle now owns
both).

**Measured result at gameplay scale** (1280×720 @ dpr 2, `dev/clay-captures/cl-r0/`):

| | before | after |
|---|---|---|
| textured diagnostic-clay surfaces (early / settled) | 3 / 3 | **0 / 0** |
| unclaimed surfaces | *(no census existed)* | **0** |
| provenance-audit orphans | 0 | 0 |
| interior rebuilds during capture | 3 | 3 |
| floor region — mean saturation | 175.4 | **29.2** |
| floor region — mean luma | 28.1 | 154.1 |
| whole frame — % crushed to near-black | 46.8% | **0.04%** |

**Sweep state, stated honestly.** Full `dev/verify-*.mjs` sweep: **12 reds, all baseline-identical** — the same 12 fail with
this branch's code and with `master`'s code in the same tree, so **zero new reds**. Cause is
environmental, not a regression: this worktree was created with `GIT_LFS_SKIP_SMUDGE=1`, so every
sprite/texture PNG except the one goblin asset materialized for this work is an LFS pointer file.
Chrome is present, so these render/measure harnesses actually run rather than dep-skipping, and then
measure null/zero standee and texture patches. The 12: `verify-bw2-3-material-texel`,
`verify-diegetic-light`, `verify-env1-light-profiles`, `verify-env1b-tabletop-shadows`,
`verify-env1c-celestial-arc`, `verify-gallery-pass`, `verify-interior-camera-frustum`,
`verify-light-lab`, `verify-mf4-turn-rhythm`, `verify-occlusion-fade`, `verify-room-shell-render`,
`verify-shot-compose`. A full-LFS tree is required to gate them honestly — that belongs to the CI
close, not to this checkpoint.

**Not yet passing in CL-R0** — see "Remaining CL-R0 failures" below. The reset is durable; the
fixture is not yet clean.

#### Remaining CL-R0 failures (2026-07-23 — open, not hidden behind a green test)

CL-R0's own required list is not fully discharged. These are the items still red:

1. **Zero mount-socket warnings — RESOLVED 2026-07-23 by CL-R3a's shell default.** The warning
   only ever fired on the instanced path, which carries no mount-slot data; with the clay fixture on
   the production shell compiler the torch wall-mounts correctly and no capture warns (three
   receipts: omit NONE · fade-only NONE · instanced WARNS). The deeper CR-3 question — labelling
   the diagnostic rig vs a rolled practical so the two are never conflated — remains **CL-R1**'s.
2. **RESOLVED 2026-07-23 evening — see C1A-CLAY-ROOM.md addendum D18** (the door tranche: cell-lie
   fix + record-derived leaf through the production hinge builder + axis authority + arch clamp +
   the placement-bias clause). Evidence `dev/clay-captures/door/`; checks 23/24 red-first; original
   finding text preserved below.
   **The door does not read as a door — and now contradicts the prose twin in plain sight.** The
   record carries `portal.state: "closed"` and `clayRoomProse` says "the door is closed."; the frame
   shows an open black gap between jambs. RL-1 (the leaf renders only when `bindWalkInteractables`
   populates `board.interactables`, which the clay mount never calls) was deferred to C1B — but with
   clay applied and the overlay out of the way, the *frame itself* also reads as questionable
   geometry: two thick jamb slabs, a floating cap, and a fourth free-standing member. This is a live
   TEXT-FIRST/GEN-LAW-3 contradiction between the text channel and the render channel and it is
   Adam's original D12b redline, not a new one. **Do not let C1B treat this as "just wire the leaf."**
   Evidence: `before-04-clean-no-overlay.png` / `after-04-clean-no-overlay.png`, right edge.
3. **The room-shell construction path is still bypassed.** `ITR_ROOM_SHELL` defaults OFF for the clay
   mount, so the fixture is not yet proving production's own room-shell wall/floor construction. The
   diagnostic recipe now routes room-shell/kit-shell kinds, so `?clayshell=1` makes the A/B a
   reproducible capture — but the A/B has not been run and the default has not moved. Owner:
   **CL-R3**.

Two things CL-R0 deliberately did **not** touch, recorded so they are not mistaken for oversights:
the sprite still reads washed out (CR-4 → CL-R1/CL-R2, to be diagnosed causally, never with a
saturation slider), and the two-temperature rig still does not read as two temperatures in the frame
(CR-2 → CL-R1).

**Adam's review of the CL-R0 packet (2026-07-23) — three findings, verbatim:**

> "also now seems like the walls are in the way again, though it's hard to tell at that zoom level"

> "even from what i can see of the door i can already see it looks more like a popsicle than a door"

> "sprite looks awful, i thought we had sprite citizenship nailed down like 10 days ago what happened,
> not it just looks flat and sickly"

4. **The walls are in the frame — ROOT CAUSE FOUND, MECHANISM RESTORED, DEFAULT AWAITS ADAM.**
   Answered by A/B, not by guess. Production keeps near walls out of the frame with a **camera-side
   upper-band suppression** (`wallUpperCameraSideBlockingSet`, P3-1d restoring BW2-5): camera-side
   wall segments drop their opaque upper volume *regardless of any specific occluded subject*. That
   mechanism lives in the ROOM-SHELL wall path (always-opaque low stem + per-segment fading uppers) —
   and the clay mount forces `ITR_ROOM_SHELL = false`, an accommodation for the OLD flatten sweep
   (which could not touch non-instanced meshes) that CL-R0 deleted. So the fixture had opted out of
   the very wall construction that carries the near-wall treatment; the sight-line fade that remained
   was working correctly and had nothing to do (probe: `{total: 28, blocking: 0}` — no wall blocked
   the goblin).

   Running the A/B (`?clayshell=1`) exposed a second, real CL-R0 bug: the clay material swap SEVERED
   the cutaway's fade linkage. Probe with the shell on: `{blocking: 2, faded: 2}` — the two near
   wall-uppers correctly classified and tweened to opacity 0.08 **on their old materials**, while the
   meshes rendered the shared clay material at 1.0 (opaque dark slabs; the cutaway "visibly broken"
   while its state machine ran perfectly). Fixed with a fade-aware swap: a fade-linked mesh gets a
   per-mesh clay CLONE carrying the entry's current opacity, and the fade entry's materials array is
   re-pointed at the clone. Teeth: harness check 20. Evidence:
   `shell-ab-04-clean-no-overlay.png` — near walls ghosted, room fully readable, stems intact.

   This also settles the previously-open `materials: 0` question for the shell path: it WAS a wiring
   gap, mine, now fixed. For the InstancedMesh path, `materials: 0` on non-blocking entries is
   consistent with lazy ghost-mesh creation (ghosts built only when a wall actually blocks) and has
   not been proven to be a defect.

   **RULED 2026-07-23 and DISCHARGED by CL-R3a the same day** (ART-DIRECTION-CANON,
   "Camera-side wall omission", RULED FOR TEST; build evidence in §CL-R3a above). The shell-default question is MOOT: under the
   ruling, a wall segment that is camera-facing and occludes staged floor is not built as an upper
   at all — compile-time omission with the stem retained, replacing the render-time camera-side
   fade for the fixed camera. The clay fixture adopts the shell path WITH omission in the CL-R3a
   test tranche.
5. **The door reads as a popsicle — CONFIRMED, and worse than "the leaf isn't wired".** In `role-id`
   the "doorframe" resolves to two thin flat planks and a cap, with **no reveal depth**, and the
   members stand **taller than the surrounding wall**. This violates the construction law that
   openings have depth (a hole/reveal with wall thickness, never a dark rectangle) and it is what
   Adam's original D12b redline was pointing at. RL-1 must not be closed by wiring a leaf into a
   frame that is itself wrong. Owner: **the next tranche**, ahead of CL-R1.
6. **The sprite — ROOT CAUSE FOUND AND FIXED (CL-R1 item 4).** `spriteTextureFor()` never tagged the
   loaded PNG's colour space, while every other authored colour texture in `theater-boot.js` does
   (~891, ~944, ~13930). three r166 defaults `WebGLRenderer.outputColorSpace` to `SRGBColorSpace` and
   this codebase never overrides it, so an untagged texture is sampled as if its sRGB bytes were
   already linear and then gamma-encoded a **second** time on output: midtones lifted, chroma
   collapsed. This is why the goblin rendered bone-white with its green skin and ochre leather gone.
   **It is not a regression from ten days ago — the sprite path never tagged it.** What was proven
   ten days ago was the art, the registry, and the review tool (`dev/sprite-review.html` shows raw
   PNGs through the browser's own correct sRGB pipeline, so the art looked right there and wrong in
   the engine).

   Proven **causally**, not asserted: an A/B capture with the identical scene, identical lighting and
   colour space as the only variable (`dev/clay-captures/cl-r1-sprite-ab/`). Measured over
   non-neutral pixels — untagged `meanSat 42.2 / meanSpread 19.8`; tagged `60.2 / 25.1`; source art
   `145.7 / 44.7`. Fixed, ON by default, with `?spritesrgb=0` retained so the A/B stays reproducible,
   and harness check 19 as its teeth. **No saturation slider was involved.**

   Still open after the fix: the render remains brighter than the source art. That is the *separate*
   lighting-energy variable (two non-attenuating point lights, `distance:0, decay:0`, combined
   authored intensity 25, plus the emissive readability floor) and stays CL-R1's, tested on its own.
   **`dressingTextureFor()` (`theater-boot.js` ~9160) carries the identical untagged defect** and is
   not fixed here — no fixture covers it, so it gets its own capture rather than a blind edit.

**"Did we lose sprite citizenship and the wall cutaway?" — measured answers (Adam, 2026-07-23).**
Neither was lost. Both claims were tested, not asserted.

*Sprite colour was never held in the first place.* Every commit that has ever touched
`src/ui/theater-boot.js` was scanned: `spriteTextureFor()` **never** tagged colour space in any of
them. No verify harness ever gated sprite colour either — `colorSpace` appears zero times across
every `dev/verify-*.mjs` at `master`. And the bone-white goblin is present in the **pre-change**
`before-04-clean-no-overlay.png`, so nothing in this session caused it. What landed as "citizenship"
(`f917617f`, BW2-4b — "lit sprites + the BRIGHTNESS LAW") made sprites *respond to light* and gated
that with luminance ratios; colour fidelity was never in its scope and never had a test. The defect
was masked because a dark dungeon interior hides a midtone lift — put the same sprite in a bright
clay room and it is glaring. Fixed and proven; harness check 19 is the gate that should have existed.

*The cutaway is alive and running in the clay fixture.* Live probe of the mounted room:
`{total: 28, blocking: 0, faded: 0, disabledForTest: false}` — 28 wall occluders classified through
the production `itrOcclusionClassify` path, on the same `setInteriorBoard` call the clay room makes.
It is not bypassed, disabled, or lost. **Zero classify as blocking, which is correct**: the system
fades occluders that block the camera→piece sight line, the camera sits above the near walls, and no
wall actually blocks the goblin. So the walls Adam sees are not an occlusion failure — they are a
*composition* problem (near walls rendered full height, eating the bottom third of the frame) that
the cutaway system was never designed to solve. Correct owner: **CL-R3** wall construction plus the
production camera, not a cutaway repair.

One genuine gap surfaced by the probe was left open here and is now SETTLED — see finding 4 below:
in the room-shell path it was a real wiring gap (the clay swap severed the fade tween's material
linkage; fixed, harness check 20), and in the InstancedMesh path `materials: 0` on non-blocking
entries is consistent with lazy ghost-mesh creation and has not been shown to be a defect.

**Capture framing note (Adam, 2026-07-23).** Adam asked whether the door was being framed behind the
overlay console. It was not deliberate, but the overlay is anchored top-right, which is exactly where
the north portal sits under the fixed production camera — so packet frames were partially occluding
the one element with a known deferred defect. **Every capture now also banks a panel-hidden
`-04-clean-no-overlay.png` frame at the same instant**, and that is the frame the evidence table above
and every future packet is read from. Evidence must never be framed so the known-broken thing is
behind the HUD.

### CL-R1 — colour, light, and tone-response truth

**Primary question:** can the renderer preserve authored colour while allowing light to shape value?

Three separately labelled modes, never conflated in UI or in a capture receipt:

1. **diagnostic neutral truth** — flat neutral reference; no mood.
2. **the explicit opposing-pair development rig** — low white ambient, bounded warm and cool sources
   on opposite sides, tunable through the same recipe registry as the Lab; a comparison rig only.
3. **real rolled production light recipes** — selected from the renderer light catalog, with an
   explicit environmental source or physical fixture; shadows, range, decay, emitter body, and mount
   are real; the semantic table row → renderer recipe mapping is visible.

Required work:

- Route the existing opposing warm/cool two-temperature rig through the generalized Lighting Lab
  recipe system. **BUILT in the 2026-07-24 candidate:** the pair is
  `clay-opposing-pair` in the same persistent lock registry as every rolled recipe; the Clayroom
  compiles it into `board.lights` and builds it through `interiorBuildLights()`.
- Generalize the tunable recipe from a single key point to a bounded `lights[]` array, and admit the
  Clayroom diagnostic pair as a **named test recipe**. **BUILT:** zero-to-four validated entries;
  no Clayroom-only light values remain.
- Every gameplay light family's default recipe becomes editable through **structured, validated lock
  data**. Temporary UI state must not be the only authority. **BUILT:** authored JSON →
  deterministic compiled classic-script registry → shared engine/renderer/Lab consumers.

**CL-R1 engineering candidate — BUILT 2026-07-24; close torch brightness accepted, expanded-falloff
visual verdict pending.**

- `data/light-profile-locks.json` is the one authored recipe authority: ten rolled world recipes plus
  two unrolled diagnostic recipes. `build/compile-light-locks.py` expands defaults, validates the
  complete schema, rejects a fifth light, rejects an unmounted practical, rejects a non-lore world
  practical, and rejects physical intensity above the declared Lab bound of 30.
- The Lighting Lab edits the complete structured recipe in place: ambient, exposure, tone response,
  bloom, sprite-readability floor, every bounded light's type/temperature/exact colour/intensity and
  units/position/range/falloff/direction/spot/shadow/flicker/fixture/mount/emitter. Undo, redo,
  authored reset, deterministic export, and compile/fold use that same shape.
- The Clayroom exposes three honest buttons and receipts: neutral measurement, explicitly
  non-diegetic warm/cool calibration bulbs, and a lore-native wall torch. The bulbs say `TEST ONLY`;
  the torch says `LORE-NATIVE LIGHT`, owns a wall socket and visible flame/haft/cup, and does not
  reuse the bulb body. Sun/moon/magic/environment sources remain fixtureless only when their recipe
  explicitly says they are environmental.
- Adam accepted the torch room's close brightness and ruled that its reach should expand so grounded
  fantasy rooms do not require torches everywhere. After the first 30 → 60-foot capture still read
  too restrained, he doubled it again: the current authored maximum is 120 feet (`rangeM` 36.576;
  renderer distance 24). The 120-foot result still concentrated too much energy near the flame, so
  the current falloff broadens from decay 2.0 to 1.75; source brightness and shadow casting remain
  unchanged. The exception is torch-specific. The Lighting Lab range control reaches 60 metres so
  this value remains directly editable. Original, 2×, 4×, and expanded-falloff captures plus
  measured comparisons live in the CL-R1 lighting evidence directory.
- The washed-out sprite diagnosis is now a production-renderer causal matrix, not a taste guess:
  colour space, material response, sampling, tone mapping, compositing, and light energy change one
  at a time. The known-bad untagged-sRGB and intensity-31 mutations fail. There is still **no
  saturation slider**.
- Final gameplay-scale frames, receipts, and measurements are in
  `dev/clay-captures/cl-r1-lighting/`; the 13-card source-plus-six-pair comparison is
  `dev/clay-captures/cl-r1-causality/causality-contact-sheet.png`.

This is not a claim that every literal CL-F02 presentation affordance is finished. The dedicated
stepped sphere/cube bench, seed/time-of-day preview, position/range/cone/shadow overlays, and
one-click whole-matrix capture remain open. They do not create a second recipe or renderer
authority when added.

**CL-R1 lifecycle/local-state slice — BUILT 2026-07-24.** Every generated production practical now
declares local state `steady` by default and owns deterministic flicker seed/amplitude data.
`flickering` is a per-light opt-in. One normalized sample drives the real `PointLight`, emitter
emissive intensity, and optional cone; steady siblings are untouched, and disabling returns the
authored baseline exactly. Clayroom preserves the actual ambient/rig/fixture/material identities
across unchanged-lighting door/camera/fade/board rebuilds and records before/during/after proof.
The stale scheduler root cause and movable/clamped/resettable diagnostic panel are specified in
`C1A-CLAY-ROOM.md` D25. This lifecycle slice is now consumed by the shared persistent authoring
system above.

Required measurements (see §"Capture and receipt law"):

- source-sprite vs unlit-render vs lit-render comparison;
- clipped-highlight percentage; median and percentile luma;
- chroma/saturation retention by a simple declared metric;
- dark-corner, pool, and daylight sprite brightness bands;
- material grey-card values;
- no practical point/spot without a visible valid emitter;
- a deliberately wrong colour-space mutation and an overpowered-light mutation both FAIL.

**Causality law.** The washed-out/overexposed/undersaturated sprite is diagnosed **causally**:
colour-space tagging, texture sampling, tone mapping, light energy, material response, and
compositing are tested **separately**. It is not "fixed" with an arbitrary saturation slider.
Colour space, alpha mode, and authored sprite saturation are **invariants, not taste sliders**.

### CL-R2 — complete sprite citizenship

**Primary question:** does a sprite read as a physical citizen rather than printed paper?

sRGB colour-texture invariant · nearest magnification and governed minification · registry `footX`
and `footY` as the only contact/rotation anchors · authoritative `worldHeight`, honest width/aspect,
occupied-cell relation · alpha cutoff from the registry · content bounds available or loudly marked
missing · thin side shell so the card does not vanish edge-on · stable floor-flat bevelled plinth ·
soft contact plus diegetic cast shadow · controlled standee shader response and readability floor ·
no arbitrary full-bright exception indoors · fixed-camera billboard behaviour, deterministic kilter,
cutaway/occlusion citizenship · source-art / isolated-standee / neutral-Clayroom / dark-corner /
warm-pool / cool-pool / full-daylight cards for the same sprite.

Minimum representative matrix: small dark fantasy creature · medium PC/humanoid with skin and cloth ·
pale/bright creature vulnerable to highlight clipping · very dark creature vulnerable to black crush ·
Large or Huge silhouette · translucent/FX-like alpha edge case if the live corpus licenses one.
**The current goblin alone is not a citizenship gate.**

### CL-R3 — basic construction grammar

**Primary question:** can the Guard Post inherit trustworthy geometric atoms?

Prove in neutral clay: floor field and exposed slab sides · straight wall with honest thickness, cap,
inner and outer faces · convex and concave corners · endpoint and T-junction ownership ·
opening/aperture, frame, threshold, hinged leaf, and swing clearance · broad raised and sunken
region · riser/retaining run with inside/outside corner, endpoint, cap · one-cell and wide stair with
landings · shallow ramp · half-height blocker/parapet base · square and round support · **camera-side wall omission per the
2026-07-23 wall-grammar ruling** (compile-time: camera-facing ∧ occludes staged floor → stem only;
staged+latched trigger; structural-mass/aperture/strategic-view carve-outs — ART-DIRECTION-CANON is
the verbatim authority) · deterministic cutaway/ghosting for what remains (dynamic piece-occlusion
only) · mount/join sockets and provenance.

**CL-R3a — BUILT 2026-07-23.** The wall-omission ruling tested in `CL-F00`, all through the
production shell compiler (now the clay default; `?clayshell=0` restores the instanced A/B):

- `wallUpperCameraSideBlockingSet`'s static output is promoted from fade TARGET to compile-time
  build decision: an omitted segment builds **no upper at all** (stem retained). One geometry
  authority — the omission keys on the exact set the fade used.
- Decision recorded as deterministic versioned board data (`S.wallOmissionReport`, ruleId
  `camera-side-wall-omission` v1) and echoed into every capture receipt. The banked `omit` receipt:
  `omitted: [seg 1 (east, mid 7.5/15.5), seg 2 (south, mid 5/17.5)] · built: [0 (north/door),
  3 (west/torch)]` — exactly the two camera-side walls, nothing else.
- Gate: ON by default in the clay fixture only (`clayWallOmissionOn()`); `?wallomit=1/0` overrides
  both ways; production keeps the render-time fade until Adam promotes the ruling game-wide.
- Evidence at gameplay scale: `dev/clay-captures/cl-r3a/` — `omit` (stems only, clean), `fade-only`
  (?wallomit=0 — uppers built + faded to 0.08; visually near-identical in the bright clay room, but
  the invisible walls still cast full shadows and cost mesh+tween), `instanced` (?clayshell=0 — the
  old full-height wall frame). Teeth: harness check 21 (109/109).
- **Cascade finding:** adopting the shell default also discharged the `bracket-generic`
  mount-socket warning — it only ever fired on the instanced path, which has no mount-slot data.
  Confirmed across the three receipts: omit NONE · fade-only NONE · instanced WARNS.

**CL-R3a proof ledger (Adam's standing instruction, 2026-07-23: "please make sure you prove
everything you do" — every claim above, with its evidence):**

| Claim | Proof |
|---|---|
| The omission selects exactly the camera-side walls | Executed, not grepped: harness check 22 imports `wallUpperCameraSideBlockingSet` (plain-Node, per its manifest contract) and runs it on the clay room's own rect at the REAL production yaw (45° — `CAM_YAW_OFFSET_DEG=45`, rotationStep 0): east+south in, north+west out, out-of-band out. Matches the live receipt (`omitted` mids 7.5/15.5 + 5/17.5). Arithmetic: seg1 dot +2.12, seg2 +1.77, seg0 −2.12, seg3 −1.77 against the camera direction from the receipt's own pose. |
| The decision is deterministic | `omit-receipt.json` early == settled (byte-equal JSON); an independent page load in a separate probe reproduced the identical set. |
| The torch genuinely wall-mounts under the shell | Live probe: `{fixtureId: "bracket-generic", mount: "wall", ownerSegIndex: 3}` in both omit and fade modes; the instanced probe shows `mount: "floor"` + the warning. |
| Mechanics are untouched by omission | `grep wallUpper src/engine/ src/world/` → 0 hits; the mesh list is consumed only by render + harness code. Walls' mechanical existence never derived from upper meshes. |
| Omit vs fade is visually near-identical here | Pixel diff of the two clean frames: mean 2.74/channel, 0.027% of pixels differ >10/channel, and the diff clusters are mote particles + torch flicker, not walls. |
| **CORRECTION — the shadow argument was overstated.** | The PROPERTY is proven (uppers set `castShadow = true`, theater-boot.js:11389, and exist at 0.08 opacity in fade mode; THREE's shadow pass ignores opacity), but in THIS fixture the interior light throws wall shadows outward, so the visible difference is nil (the pixel diff above bounds it). In this scene, omission's real advantages over fade are **determinism** (receipt data, not render state) and **cost** (no mesh/material/tween). The shadow benefit becomes visible only in fixtures where a faded wall sits between a light and staged floor — untested, and claimed as nothing more. |
| Region measurements banked | `dev/clay-captures/cl-r3a/measure.json` (omit / fade-only / instanced, declared regions). |

Still open in CL-R3a's scope: the staged+latched trigger's executable test (rides C1B's door state
machine) · aperture carve-out (CL-F01 bench) · strategic-view all-walls (the toggle does not exist
yet) · promotion of the omission to production (Adam's call, after he eyeballs the capture).

Crenellations, arrow slits, roof silhouette, signalling devices, and guard-specific defences stay
**out** of this gate unless a generic construction need independently licenses them.

### CL-R4 — material and surface routing

**Primary question:** can reusable Material Maker 1.3 seeds arrive in the renderer correctly?

Base colour / normal / ORM channel interpretation · declared physical scale and 3×3 repeat · stable
UV frame on floor, wall, riser, cap, opening · semantic material family separated from surface-role
selection · missing normal/ORM fallback to the same base family · neutral old-stone, structural
timber, forged iron, and quiet earth/ground **parent** seeds · condition masks consume canonical
inputs and never invent history · source graph, exported maps, manifest, binding, and capture receipt
share one version/hash lineage.

The Clayroom proves the seed **parents** and the routing. The Guard Post proves the selected
maintained-overgrown-stone combination, road/ground relation, chronological repair story, and
cultural selection. Authoring authority stays with [MATERIAL-LANE.md](MATERIAL-LANE.md).

### CL-R5 — trim-sheet projection

**Primary question:** does trim infrastructure work before aesthetic trim enters the Guard Post?

First use a **diagnostic six-colour `h6-v1` sheet**. Prove: stable band manifest · full-width strips
with gutter/mip safety · base course, cornice/belt, cap, stair nosing, curb/retaining routing to the
correct geometry · repeat phase, non-multiple lengths, run segmentation, clamped sampling · corners,
acute bevels, endpoints, openings, T-junction fallback · cutaway ownership · base-only and
geometry-only fallbacks · zero tactical/collision change.

Only after the diagnostic sheet passes are Material Maker stone strips packed and judged. Contract
authority stays with [TRIM-SHEET-PIPELINE.md](TRIM-SHEET-PIPELINE.md); this rung is its clay gate.

### CL-R6 — deterministic seed resilience

**Primary question:** do admitted rules survive variation rather than one curated fixture?

One retained ordinary golden seed · at least eight changed seeds per admitted procedural fixture ·
adversarial smallest/largest legal dimensions · inside/outside corners, odd run lengths, openings
near corners, elevation transitions, connector adjacency · same seed + recipe version is
byte-identical · different seeds vary only licensed fields · **no seed-specific branches or
hand-placed coordinates** · failure yields a typed rejection/fallback receipt, never broken geometry.

## The table / engine / renderer boundary

This split is load-bearing for every rung above and for the whole Guard Post program. It is restated
here because the reset ladder is where it is first *enforced by a tool*.

| Belongs in table/catalog data | Belongs in the deterministic engine roller | Belongs in renderer/tool |
|---|---|---|
| structure family, corner/end profile, connector type, material family, surface role, light semantic, renderer recipe id, fixture class, culture construction choice, condition/history fact | coordinates, bounded candidates, run segmentation, join resolution, UV phase, socket matching, light placement from mounts, seed variation, validation/scoring, fallback selection | projection, material/light/shader execution, diagnostics, temporary preview, measurement, capture |

**Every saved workbench change must become a table/catalog row, a versioned recipe/lock, or an
explicit renderer invariant.** If it cannot be represented that way, it is hand-authored decoration
and does not enter the procedural pipeline.

## Capture and receipt law

- Captures use the **production renderer** (`genesis.html` + the real `?clayroom=1` mount), never a
  harness-only draw path. Rig: `dev/capture-clayroom-fixture.cjs`.
- Captures are inspected at **real gameplay scale** (1280×720 @ dpr 2, declared in the receipt).
- Every capture banks **two frames**: `early` (right after mount) and `settled` (after every async
  rebuild the mount can trigger). CR-1-class regressions live in the *difference* between them, so
  the pretty frame alone is never the evidence.
- Every capture writes a receipt carrying: fixture id/version/seed, surface-recipe id/version,
  runtime path, camera pose, renderer size/dpr, effective light values, the per-surface census, the
  provenance audit, and console errors/warnings.
- Measurement is a separate, declared step: `dev/measure-clay-capture.py` over the receipt's own
  normalized regions. **Green tests alone do not prove sprite citizenship or beauty.**
- Do not claim "fixed" unless the before/after evidence proves the relevant visual **and** procedural
  contract.

## Lighting Lab 2.0 (CL-R1 tool contract)

The Lighting Lab remains worth building and becomes the **visual-default authoring surface for the
renderer's bounded light recipes**. It edits **recipes and defaults**, never arbitrary scene patches.

**Three levels of lighting truth** — do not create one independent renderer preset per prose row:

1. **Semantic roll** (table-owned meaning/visibility/flavour) — e.g. Torchlit Warmth, Lantern Cones,
   Pitch Black, Moon-Sick Blue, Green Lichen Glow, Urban Filtered, Wilderness Overcast. Edited in the
   Table Atlas, displayed by the Lab.
2. **Renderer recipe** — the current bounded set `dark`, `torchlit`, `lavalit`, `fungal-glow`,
   `magic-glow`, `lamplit`, `moonlit`, `daylit`, `overcast`, `voidlit`. A recipe may support a
   bounded `lights[]`, not only one point.
3. **Physical/environmental realization** — environment key (sun, moon, sky/overcast, diagnostic
   key/fill) or practical fixture (torch, brazier, lantern/lamp, fungus, magical source, lava/ember).
   **Every practical owns housing, emitter, mount, range, shadows, and optional flicker.**

The Lab edits levels 2 and 3 and displays the level-1 mapping.

**Editable recipe fields.** Scene: ambient colour/temperature, ambient intensity, exposure floor,
tone-map/grade profile + bounded strength, bloom threshold/strength, fog/obscurement only when owned
by a separate canonical atmosphere fact. Each `lights[]` entry: enabled ·
`environment|directional|point|spot` · colour temperature in Kelvin with derived hex plus exact hex
override · intensity with explicit units · board-relative or socket-relative position strategy ·
azimuth/elevation for environment/directional · range and decay · spot cone and penumbra · cast
shadow, bias, normal bias, map size, budget priority · flicker recipe id/amplitude/rate where
licensed · physical fixture id, emitter-local offset, and mount socket for practicals. Sprite
response: emissive readability floor · declared standee material/shader recipe · read-only
colour-space/filter/alpha invariants · dark-corner, warm-pool, cool-pool, daylight measured outputs.

**Required behaviours.** Fixture selector defaults to `CL-F02 lighting-bench` · choose a semantic roll
and see its renderer mapping · choose a renderer recipe and inspect every light/fixture · opposing
warm/cool diagnostic preset · before/after immutable baseline · reset to authored default · reset to
compiled lock · undo/redo · seed and time-of-day preview · source-sprite vs rendered-sprite card ·
diagnostic overlays for light position/range/cone/shadow frustum · live luma/chroma/clipping/
readability values · capture the whole acceptance matrix · export one validated versioned lock/receipt
· **no direct JavaScript-constant mutation from the browser**.

**Save model.** The already-specified [DEV-PORTAL.md](DEV-PORTAL.md) lock transaction:
`dirty preview → validate → authored JSON lock → deterministic compile → relevant verifier → reload
compiled lock`. `build/fold-lightlab.py` is useful evidence but must eventually fold or compile the
**same** structured lock format. Do not maintain two permanent save authorities.

**Physical-emitter honesty (finding CR-3).** A *diagnostic studio rig* may use explicitly labelled
non-diegetic test lights. A *production rolled practical* must remain co-located with a visible
housing/emitter and a valid mount socket. The UI and the capture receipt must say which mode is
active; the two may never be visually or semantically conflated.

## Sprite Editor — extend, do not replace

**Do not build a replacement editor.** The working tool exists and keeps its whole workflow:
`dev/sprite-review.py` + `dev/sprite-review.html` (filtering, lineup/pinning, scale and height
review, horizontal floor placement, pass/fail/redlines, notes/tags, overlays, registry
regeneration). Run it from the repo: `python3 dev/sprite-review.py` → <http://127.0.0.1:5179/>.

Canonical naming, to end the terminology ambiguity:

```text
footX      vertical guide   — the horizontal image coordinate of the planted contact/rotation axis
footY      horizontal guide — the vertical image coordinate of the floor-contact line
           (their crossing point is the standee origin)
offsetX/Y  rare renderer presentation correction, separately justified
worldHeight canonical physical height
```

**The narrowly-scoped delta — nothing more:**

- add a visible draggable **vertical** guide that writes canonical `footX`;
- make the existing **horizontal** arm write canonical `footY`;
- allow dragging either arm or the crossing point;
- preserve or migrate the existing overlay `floor` data;
- show pixel **and** normalized coordinates;
- preserve every existing editor capability;
- make the runtime consume `footX`/`footY` consistently.

Supporting behaviours when the delta lands: arrow-key nudge 1 px, Shift for a larger declared step ·
reset to measured alpha-contact candidate · reset to compiled registry value · show tight content
bounds and alpha cutoff · show the source cut over transparency · show the standee on its real plinth
in `CL-F03` · side/front/fixed-production views · floor plane, shadow, occupied-cell footprint,
declared world height · pin a 6-foot reference and same-size neighbours · save to the authored
overlay/lock, regenerate the registry, verify · preserve old stable ids and **never** rewrite PNG
pixels from anchor edits.

**Do not use offsets to hide a wrong crop, wrong anchor, or wrong world height.** An optional
full-sheet contact view may overlay every cell's saved crosshair for batch review, but the data
remains per stable sprite id; these guides are not destructive slicer boundaries.

Sequencing: the crosshair change may land after the Clayroom's diagnostic route and lighting/colour
causality are stable, or as its own explicitly bounded tranche. It is **not** part of CL-R0.

## Clayroom Workbench — a procedural acceptance workbench, not a builder

Adam changes bounded defaults and recipe parameters, sees production output immediately, compares
against accepted states, and exports a versioned candidate. **It must not allow hand-authoring the
Guard Post one cell at a time.**

It preserves the Dev Portal's governing law (one real renderer, one fixture adapter, one mounted tool
at a time, validated lock data, no direct constant edits) and **links or mounts the existing
dedicated tools** rather than duplicating them:

- **Lighting Lab** — renderer recipes and fixture defaults;
- **existing sprite-review editor** — contact/height/citizenship, extended not replaced;
- **Object/Construction Workbench** — anchor-relative geometry and sockets;
- **Provenance Inspector** — source-to-render ownership;
- **Shot Tuner** — diagnostics, with production camera pitch still locked.

Clayroom-specific controls — *fixture:* retained fixture/mode selector, seed and recipe-version
selector, rebuild/reset, accepted baseline vs candidate, capture matrix and receipt export.
*Structure:* catalog part/assembly selector, table-backed profile choice, legal dimensions/run
length/height/thickness/connector variant, join/corner/endpoint/aperture cases, socket
visualization, cutaway/ghost state, custom-procedural vs Kenney-fallback vs geometry-only A/B.
*Surface:* diagnostic clay, role-ID colours, normals, UV checker and repeat phase,
material-id/trim-band view, albedo/normal/roughness/metallic/AO isolation, fallback and
missing-channel state. *QA:* grid/collision/blocked volume, owner/provenance, object bounds and mount
axes, light fixtures/ranges/cones/shadow frusta, sprite origin/plinth/shadow, luma/chroma/clipping/
draw calls/triangles/texture memory/frame time, visible failed assertions and rejected-candidate
receipts.

**Controls that must not exist:** free cell painting · arbitrary prop placement · arbitrary world
transforms as the primary save format · per-seed patching · culture or realm painting · direct
table-fact edits · direct generated-artifact edits · unlocked production camera pitch · a saturation
slider that compensates for incorrect colour management · a "make pretty" control with no
reproducible recipe.

### Selected shell — Concept 1 / Docked Studio (Adam, 2026-07-24)

The selected workbench shell is a persistent left Catalog/Scene rail, room-dominant center
production viewport, and dedicated right Inspector rail. The inspector can undock by title drag and
returns through **dock right**. This is a navigation/edit-scope shell over the existing tools, not a
new builder.

Selection is by the live Scene list or raycast against the real production object tree. Each
selection declares one of four scopes:

- `INSTANCE` — default, session-only Clayroom placement/tuning;
- `STATE` — named state on the selected production object;
- `SOCKET` — protected construction authority, reached only through the anchor-relative Object
  Workbench/lock path;
- `DEFAULT` — protected recipe/catalog authority; promotion applies to future rolls.

Catalog admission is existing approved production content only. All character sprites are approved
for selection, but their identities/measurements still come from the registry. Materials route to
the shared Material Editor and admitted MM graphs; Clayroom does not create a parallel material
editor or fabricate normal maps. The selected concept image is
`dev/clay-captures/workbench-concepts/concept-1-docked-studio.png`.

## Guard Post entry gate

Guard Post 1 may begin its real composition pass when:

1. CL-R0 diagnostic clay survives every rebuild;
2. CL-R1 has a tunable opposing-pair rig plus a real rolled-recipe mode;
3. CL-R2 passes the sprite citizenship matrix;
4. CL-R3 admits the generic wall/opening/elevation/riser/connector/blocker atoms the selected
   composition needs;
5. CL-R4 proves the material channel and MM 1.3 seed-parent pipeline;
6. CL-R5 proves the diagnostic trim sheet before beauty strips;
7. CL-R6 changed-seed and adversarial cases produce no broken geometry.

The Guard Post then owns road/terrain relation, defended threshold, observation and operational
silhouette, maintained-overgrown-stone selection and history, culture A/B construction expression,
tactical negative space/approach/flank/objective/retreat, and final gameplay-scale taste — see
[GOLDEN-SITES-CATALOG.md](GOLDEN-SITES-CATALOG.md).

## Recommended execution order

1. Bank the current bad Clayroom frame as the red baseline. *(done 2026-07-23)*
2. Repair replay-safe diagnostic-clay routing. *(CL-R0, done 2026-07-23)*
3. A/B sprite sRGB tagging and bounded light energy; bank the causal result.
4. Route the opposing pair through a generalized light-recipe registry.
5. Extend the existing Sprite Editor with the authoritative crosshair; consume `footX`/`footY` at
   runtime.
6. Complete the physical standee contract and citizenship matrix.
7. Build the small structure bench.
8. Prove MM 1.3 material routing on neutral parent seeds.
9. Prove the diagnostic `h6-v1` trim sheet.
10. Run changed-seed/adversarial sheets.
11. Resume Guard Post composition.

## Live findings this ladder was written against (2026-07-23)

Recorded so a later reader can tell which claims were measured and which were inferred. Full
evidence in `dev/clay-captures/cl-r0/`.

- **CR-1 — the clay surface is not durable.** `MEASURED.` `mountClayRoom()` applies the clay
  material swap exactly once. `spriteTextureFor()`'s texture-settle callback then replays
  `setInteriorBoard(S.lastBoard)` from outside the mount, which rebuilds interior geometry and
  materials; `clayRoomMaybeAutoMount()`'s per-frame reassert covered only
  `clayRoomApplyLightProfile()`, not the material routing. The repeated dungeon-like floor is that
  rebuilt production material, not a new floor. **Disposition: REGRESSION — fixed in CL-R0.**
- **CR-2 — the two-temperature rig bypasses the Lighting Lab.** `MEASURED (source).`
  `CLAY_C1A_LIGHT_PROFILE` carries the opposing pair (west warm `0xffa04a` @16, east cool `0xaebfe8`
  @9, white ambient 0.18) but `clayRoomApplyLightProfile()` constructs the lights directly, bypassing
  `applyLightProfile()`/`LIGHT_TUNABLES` to escape `STAGE_AMBIENT_FLOOR`. `LIGHT_TUNABLES.profiles`
  exposes exactly one key point per profile, so the pair cannot be edited **as a pair** anywhere.
  **Disposition: FIXED IN CL-R1 CANDIDATE — one named diagnostic recipe in the shared registry.**
- **CR-3 — physical emitter truth is unclear.** `MEASURED (console).` The live mount logs
  `[interiorBuildLights] wall-mount fixture had no mount slot data — degrading to floor:
  bracket-generic 1`, and the private opposing pair is not linked to visible fixture geometry.
  **Disposition: FIXED IN CL-R1 CANDIDATE — diagnostic bulbs and lore-native world practicals are
  separately labelled, validated, rendered, and receipted.**
- **CR-4 — sprite citizenship is incomplete.** `PARTLY MEASURED.` `spriteTextureFor()` sets filtering
  but does **not** set `THREE.SRGBColorSpace` on the loaded PNG, while other authored colour textures
  in the same renderer explicitly do (`theater-boot.js` lines 891, 944, 13893) — a strong,
  A/B-testable candidate for the pale/high-value result. The clay pair uses two non-attenuating point
  lights (`distance:0, decay:0`) with combined authored intensity 25 — a second strong candidate. The
  live interior sprite branch still stores `interiorFloorFrac` from the older optional `entry.floor`
  field, so the registry's two-axis `footX`/`footY` contract is not the live anchoring authority.
  `buildSpriteBillboardMesh()` still builds one `PlaneGeometry`; the specified thin side shell is
  absent. **Disposition: colour-space cause fixed and light energy bounded in CL-R1; complete
  standee form/scale/footprint citizenship remains CL-R2 and still requires Adam's visual ruling.**
- **CR-5 — the fixture gate proved truth, not beauty.** `MEASURED.` The C1A harness is strong on
  deterministic records, ids, provenance, production wiring, and light-profile shape; it did not
  establish a durable accepted visual baseline or a mutation-sensitive visual gate. **This is why the
  code could be 79/79 green while the frame visibly regressed.** Disposition: retain the truth gate,
  add visual-system gates; never weaken the truth gate to make a picture pass.

### Additional defects found by the CL-R0 work itself (not in the source packet)

- **CR-6 — the D12a seam grid had never rendered.** `MEASURED.` D15's re-wire moved render geometry
  onto the real spatializer, which places the room at the plan rect `(room.x, room.y) = (3, 13)`.
  `clayRoomBuildSeamGrid` kept computing in the record's local `0..4` frame, so the grid mounted a
  full (3, 13) cells away from the room — audited bbox `x[-5.5,-0.5] z[-15.5,-10.5]` against a board
  of `x[-3.5,3.5] z[-3.5,3.5]` — and drew off-camera. It also sampled the floor-top map at plan
  `(0,0)`, outside the room, silently taking the fallback height. **It audited "owned" the entire
  time**, which is why D13's provenance audit never caught it, and nobody saw it because the
  regressed floor was near-black. Fixed: the grid is built in the spatialized room's frame, and the
  provenance audit now reports a world bbox per owned root so a correctly-tagged object in the wrong
  coordinate frame is machine-visible. Its colour also moved into the recipe — white-on-near-black
  became white-on-clay the moment CL-R0 restored a legible floor.
- **CR-7 — per-instance colour defeated the clay swap.** `MEASURED.` `interiorBuildInstancedMesh`
  tints each instance via `setColorAt`, and THREE multiplies `instanceColor` into the material
  colour. Swapping the material alone produced clay *tinted by the kit's per-cell palette*, never
  flat clay — so the fixture was never uniform even before a replay landed. The route now writes
  every claimed instance colour to white and records `instanceColorNeutralized` in the census.
- **CR-8 — the census was scoped to one group.** `MEASURED.` The first routed capture reported every
  surface flat and claimed while a dark textured panel still stood in the room, because the walk
  started at `S.interiorGroup`. A provenance answer scoped to one group cannot honour "which system
  owns every visible surface". The walk now starts at `S.scene` and attributes each mesh to its
  owning top-level group. (The panel turned out to be the crate's own unlit face — but the census
  could not have told us that, which was the point.)
- **CR-9 — theater-boot must not read the engine recipe at module-eval time.** `MEASURED.` The first
  implementation put `const CLAY_GREY = CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor` at module scope.
  Several harnesses legitimately load `theater-boot.js` alone, without the engine module, and a
  top-level read of a declared `callTimeDep` throws `ReferenceError` before a single test runs — the
  full verify sweep went red across `verify-agx-tonecurve` and friends. Recipe reads now happen at
  call time only, and the harness asserts no module-scope read exists.
