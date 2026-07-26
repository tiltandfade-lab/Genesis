---
type: agent-brief
status: READY FOR FABLE
created: 2026-07-25
owner: Adam / Fable
scope: CL-F01 structure bench, CL-F02 lighting bench, and shared production-renderer visual truth
worktree: worktrees/Genesis-clay-ladder
branch: clay/cl-r1-r3
starting_commit: a3dd41dd
---

# Fable Assignment — Make the Clayroom Visually Trustworthy

You are Fable. Take the completed CL-R1 through CL-R3 engineering candidate and correct the
visual and diagnostic problems exposed by Adam and Codex's live-browser review.

This is an implementation assignment, not another speculative audit. Diagnose each root cause,
make the smallest systemic correction that solves it, prove the result in the live browser, and
stop for Adam's visual verdict at each checkpoint below. Green harnesses remain necessary, but
they do not prove that the room looks right.

The current work is a useful systems proof. Preserve it. The problem is that its lighting,
composition, and overlays do not yet let a human reliably see or judge what those systems are
doing.

## Read first

Read these completely and in this order:

1. `CLAUDE.md`
2. The newest CL-R1, CL-R2, and CL-R3 blocks in `docs/HANDOFF.md`
3. `docs/canon/README.md`
4. `docs/ART-DIRECTION-CANON.md`
5. `docs/GRAPHICS-CONVERGENCE-CHARTER.md`
6. `docs/CLAYROOM-RESET-LADDER.md`
7. `docs/C1A-CLAY-ROOM.md`
8. `docs/STRUCTURE-KIT-CATALOG.md`
9. `docs/CODEX-CLAY-LADDER-BRIEF.md`
10. The existing evidence in:
    - `dev/clay-captures/cl-r1-lighting-bench/`
    - `dev/clay-captures/cl-r1-lighting-matrix/`
    - `dev/clay-captures/cl-r2-sprite-citizenship/`
    - `dev/clay-captures/cl-r3/`

Inspect the live fixtures through the production renderer before changing code:

- `CL-F02 lighting-bench`: neutral, warm/cool, day, moon, magic, fire, and lava
- `CL-F01 structure-bench`: assembled, sockets, access, bad join, all walls, staged/un-staged,
  and door states

## Adam's rulings

These are requirements, not suggestions:

> "we need lore native light sources for fantasy realm, right now we have two light bulbs, which
> are pretty cool but they aren't going to make sense in your average fantasy dungeon."

The visible calibration bulbs may remain in the explicitly diagnostic warm/cool studio. Rolled or
production-environment lighting must use sources that belong in the world: sunlight or skylight,
moonlight, magic or crystal light, a flame sconce/torch, lava, and similar realm-appropriate
sources.

> "always demonstrate the results for me"

Every checkpoint ends in a live-browser demonstration. Do not substitute unit-test output,
lighting numbers, or a contact sheet for the live result.

> "the warm and cool is simply diagnostic in the clay room, cool light is generally sunlight,
> moonlight, and magic lighting, and warm light is tungsten, fire, lava etc..."

Warm/cool is a diagnostic studio recipe, not a fantasy-room fiction. Preserve that distinction.

> "i do need to be able to make out some level of forms in the dark"

Shadow may remain dark and atmospheric, but it cannot collapse every unlit wall, stair, and
opening into one value.

> "is there any way we can get the contact shadows to actually be darker than the shadow value in
> the shadows? with a multiply effect?"

Contacts and creases must remain legible even when they occur inside an already shadowed area.

> "i think it is also clear that we need some level of ambient occlusion, i can't make out any of
> the edges that aren't in shadow"

The environment needs restrained ambient occlusion or an equally honest depth-aware solution.
Figure-only fake base darkening is not sufficient.

> "the biggest problem with the auto warm and cool lights is that the subjects are in the center
> of the room, out of reach of both lights"

> "ideally there is overlap betwee the two pools, that is the point"

The warm and cool pools must overlap substantially over the same central subjects. The overlap is
the experiment. Do not solve this by moving the subjects into separate warm-only and cool-only
groups.

## What is wrong now

Treat this as the starting diagnosis. Verify it yourself before editing.

### 1. The room does not describe its own forms

- There is no production environment AO pass. Wall/floor seams, stair tread/riser corners,
  retaining transitions, supports, openings, and geometry intersections disappear whenever their
  local values are similar.
- Existing figure-base darkening and study-only instance gradients are not environment AO and are
  not active for the structure fixture.
- Day and moon often produce pale, nearly uniform top planes with vertical planes falling almost
  to charcoal. Neutral makes the cube, stairs, and portions of the sphere disappear into the
  floor.
- Fire, magic, and lava crush most of the room to black. Adding AO without restoring a small
  amount of environment-form fill would make that worse.
- The same dark-brown void/background persists through very different recipes and contaminates
  daylight, moonlight, and magic.

### 2. Warm/cool tests empty floor instead of the subjects

- The two wall-mounted pools leave their weakest perceptual region over the central sphere, cube,
  stairs, and sprite.
- Range circles may cross on the floor, but that is not proof that both lights contribute useful
  modeled illumination to the subjects.
- The intended result is a readable central blend with visibly different warm and cool
  directionality, not two isolated bright patches separated by a dark seam.

### 3. Lore-native recipes are not staged around what they must reveal

- The torch is far to one side and mostly lights empty floor.
- Magic reads as a small violet bulb rather than a crystal, spell, rune, or other believable
  source.
- Lava reads as a red point on the floor rather than an emissive fissure or molten surface.
- Day, moon, fire, magic, and lava need appropriate source placement, motivated source geometry,
  smooth falloff, real shadow casting, and enough non-shadow-casting environment fill to retain
  form.
- The lighting readout reports authored recipe values even where the interior mounting path later
  replaces part of the rig. The panel can therefore describe a different brightness from the
  final render.

### 4. The structure bench is a specimen pile, not an intelligible construction proof

- `ASSEMBLED` is mostly scattered parts around a large shell. It does not read as a coherent
  construction site or small assembled building.
- There is no clear mapping from each inspector label to its object in the room.
- The host shell dominates while stairs, supports, blocker, ramp, and human scale witness become
  visually incidental.
- The grid and elevation changes are hard to count, especially in dark recipes.
- The human witness is too small at the default review framing to do its scale-reference job.
- The inspector consumes roughly half of a narrow browser window, leaving a portrait-shaped
  renderer that is unsuitable for visual signoff.

### 5. Some geometry and overlays lie visually

- The ramp shares vertices across hard wedge faces and then averages their normals. It looks
  inflated or pillow-like instead of planar.
- Stairs often read as thin stripes rather than solid stepped volumes.
- The access overlay chooses one color for an entire object and draws a top bounding rectangle. It
  does not show each face's actual `walk`, `climb-cost`, `climb-dc`, or `none` data.
- Socket marks do not communicate type, facing direction, polarity/ownership, or valid candidate
  pairing clearly enough to understand a connection from the frame.
- `ALL WALLS` is poorly fitted in the narrow viewport, crops or flattens the scene, and does not
  read as a useful map.
- The fixture can report all uppers present while also saying camera-side omission is active.
  Reconcile the reporting authorities so one state produces one truthful answer.

## Required checkpoint sequence

Work in this order. After each checkpoint, leave the relevant fixture open in a clean live-browser
view, show Adam the result, and wait for his visual verdict. You may make ordinary corrections
within a checkpoint without asking about every value. Stop only for a genuine product/art fork,
a new dependency decision with meaningful cost, or a conflict with a locked contract.

### Checkpoint 0 — Reproduce and establish honest before evidence

1. Reproduce every diagnosis above on the current commit.
2. Capture clean, settled before frames with all debug overlays off.
3. Record the actual mounted lights, camera, background/fog, tone mapping, AO state, renderer size,
   DPR, and frame-time/FPS conditions used for the review.
4. Do not overwrite the existing CL-R1/2/3 evidence. Put this assignment's evidence under:
   `dev/clay-captures/clayroom-visual-correction/`.

Checkpoint output:

- one short root-cause note per diagnosed problem;
- a labeled before sheet;
- the live browser left on the warm/cool failure.

### Checkpoint 1 — Form readability, contact, and truthful neutral light

Implement a restrained environment AO/contact solution through the production rendering path.
Evaluate an appropriate depth-aware option rather than blindly adopting a library. If a
post-process AO pass is not viable on the no-cash Mac target, provide measured evidence and use
the smallest honest fallback that preserves real geometry relationships.

Required behavior:

- AO appears at wall/floor seams, stair corners, structural intersections, supports, door
  reveals, retaining transitions, and object contacts.
- AO has a short radius and controlled strength. It must not put broad dirty halos around objects,
  gray the whole room, or double-blacken large cast shadows.
- Contact detail remains darker than the surrounding shadow value where appropriate.
- Add only enough environment-form fill to distinguish shapes inside darkness. Preserve the
  direction and drama of the authored source lights.
- Neutral becomes a useful truth view: the sphere, cube, every stair tread/riser, and their
  contacts are immediately legible.
- Daylight and moonlight retain readable vertical faces and edges without becoming flat.
- Expose AO as a bounded diagnostic A/B control or comparison capture. Do not create an
  unrestricted production taste slider merely to pass review.
- Measure the performance cost at the normal production viewport and at the high-DPR review
  viewport. Do not accept a visually good result that makes interaction choppy.

Mandatory live proof:

1. Neutral AO off/on
2. Daylight AO off/on
3. Moonlight AO off/on
4. A close view of stairs, wall/floor contact, an opening, and a support inside shadow
5. A clean beauty view with the diagnostic controls hidden

### Checkpoint 2 — Correct overlap and lighting truth

Rebuild the diagnostic warm/cool composition so both lights make substantial, visible
contributions to the same central subjects.

Required behavior:

- The sphere, cube, stairs, and sprite sit inside the strong overlap of both pools.
- Warm-only leaves those subjects readable and clearly modeled.
- Cool-only leaves the same subjects readable and clearly modeled.
- Both together show an intentional warm/cool blend, with enough directional separation to reveal
  form. Neither source may simply overpower the other into a nearly single-color result.
- There is no dark seam over the subjects.
- Position/range overlays accurately explain the result but default off for ordinary review.
- The live readout must describe the lights and ambient/fill energy that actually reach the final
  renderer. Remove or clearly label authored values that are subsequently replaced.
- Warm/cool remains explicitly `DIAGNOSTIC ONLY`; its calibration bulbs do not leak into
  lore-native rooms.

Mandatory live proof, without moving the subjects between frames:

1. Warm only
2. Cool only
3. Warm and cool together
4. Both lights plus AO, with overlays off
5. The same four states on the sprite as well as the clay primitives

### Checkpoint 3 — Lore-native light sources and dark-environment readability

Correct day, moon, magic, fire, and lava as production-environment recipes.

Required behavior:

- Sun/day and moon/night read as environmental illumination, not studio bulbs.
- Fire uses a recognizable flame sconce/torch source, keeps the approved broad smooth falloff,
  casts shadows, and preserves the existing passable high-FPS dancing-flame behavior.
- Magic has believable fantasy source geometry such as a crystal, rune, spell, or equivalent
  realm-appropriate emitter.
- Lava uses visibly emissive molten geometry or fissures rather than a red point-light marker.
- The sources illuminate the subjects and useful construction, not primarily empty floor.
- Dark regions keep slight form separation; they do not become uniformly lifted gray.
- The background/void/fog responds appropriately to the active environment instead of remaining
  the same warm brown under every recipe.
- The gentle camera-side sprite fill remains non-shadow-casting and subtle. It may reveal the
  sprite face but must not make sprites look pasted into a differently exposed scene.
- Cast shadows must use the sprite silhouette/alpha contract. Do not regress to floating
  rectangular cards.

Mandatory live proof:

- one stable, clean frame each for day, moon, magic, fire, and lava;
- one comparison sheet using identical camera and subject positions;
- a short live fire demonstration at the measured production FPS;
- overlays hidden in all beauty frames.

### Checkpoint 4 — Make CL-F01 an honest construction workbench

Recompose the structure fixture so a human can understand the grammar without reverse-engineering
the readout.

Required behavior:

- Keep an orderly diagnostic lane for wall runs, corners/T-junctions, ends/caps, openings, stairs,
  ramp, retaining/elevation pieces, blocker, and supports.
- Add or reorganize one coherent assembled construction-site/building example that shows how the
  same generic pieces form a believable whole.
- Make object labels and selections visually map to the relevant piece.
- Keep a useful human scale witness and readable 5-ft grid/elevation information at the default
  framing.
- Give visual signoff enough viewport area. The inspector may collapse, float, resize, or use
  another restrained responsive treatment, but it may not consume half the frame at normal review
  size.
- Fix the ramp to use crisp hard-face normals. Make stair masses readable.
- Show access data per relevant face rather than assigning one summary color to an entire object.
- Make socket type and direction understandable with restrained symbols, arrows, labels, or a
  legend. Preserve the visible wrong-axis rejection.
- Fit and center the all-walls strategic camera so the complete construction is readable.
- Make staged/all-walls/door state reporting internally consistent and sourced from the state that
  actually built the mounted geometry.

Mandatory live proof:

1. Clean assembled construction view
2. Ordered specimen view
3. Socket view
4. Per-face access view
5. Wrong-axis rejection
6. Strategic all-walls view
7. Staged versus un-staged wall comparison
8. Door open/shut behavior
9. Narrow and wide browser layouts

## Protected behavior — do not regress

This assignment does not reopen accepted sprite and lighting decisions. Preserve:

- natural standee bases rather than a forced circular-plinth look;
- presentation-scale creature handling and the existing scale-spectrum proof;
- deep zoom;
- collision prevention/forced slight relocation between occupied bases;
- sprite-alpha silhouette cast shadows;
- the selected base's emissive vertical-face halo, which should read as glowing material rather
  than a point light at the center;
- darker contact shadow under standees;
- subtle non-shadow-casting camera fill on sprite faces;
- the expanded torch range, smooth falloff, real shadows, and current passable flicker;
- production geometry, socket, access, staging-latch, and wrong-axis data contracts;
- the front/back gate: automated evidence proves measurable behavior; Adam owns the visual verdict.

Do not use saturation, exposure, or blanket ambient increases as a shortcut around wrong light
placement, missing AO, bad normals, or unreadable composition.

## Implementation boundaries

- Work only in the existing `worktrees/Genesis-clay-ladder` worktree on `clay/cl-r1-r3`.
- Do not create another worktree.
- Preserve the unrelated modified files under `dev/light-lab-shots/`. Do not stage, overwrite, or
  revert them.
- Inspect current shared ownership before editing `src/ui/theater-boot.js`. Keep changes bounded to
  Clayroom/shared production-renderer causes required by this assignment.
- Prefer existing Three.js/vendor capabilities. A new AO dependency requires a measured
  compatibility, bundle, performance, and fallback case before adoption.
- Do not fork a Clayroom-only fake renderer. The benches must exercise the production renderer and
  the same light/material/geometry contracts the game will use.
- Do not silently weaken an existing validator or change its threshold to obtain green output.
- Do not merge, push, or land the branch. Adam or the designated closing session owns that step.
- Do not declare any visual checkpoint accepted. Hand Adam the live result and evidence.

## Verification

Run the focused checks after the relevant edits:

```text
node dev/verify-clay-room.mjs
node dev/verify-light-lab.mjs
node dev/verify-diegetic-light.mjs
node dev/verify-dungeon-interior.mjs
node dev/verify-room-shell.mjs
node dev/verify-tactical-query.mjs
node dev/verify-interior-camera-frustum.mjs
node dev/verify-occlusion-fade.mjs
python3 build/check-manifest.py
git diff --check
```

Add or extend focused regression coverage for:

- environment AO enabled/disabled state and bounded settings;
- AO surviving fixture rebuilds without leaking between recipes;
- warm-only, cool-only, and both-light contribution to the central subject area;
- readout/live-mounted lighting parity;
- ramp hard normals;
- per-face access overlay truth;
- strategic camera fit and omission-report parity;
- preservation of sprite silhouette shadows and selection/base behavior.

Do not hide the three previously reported broad-harness reds by weakening tests. If they remain
unrelated and unchanged, report them exactly as inherited.

## Capture packet

Create `dev/clay-captures/clayroom-visual-correction/` with:

- `00-before-sheet.png`
- `01-neutral-ao-ab.png`
- `02-shadow-form-closeups.png`
- `03-warm-only.png`
- `04-cool-only.png`
- `05-warm-cool-overlap.png`
- `06-lore-lighting-sheet.png`
- `07-construction-site.png`
- `08-structure-diagnostics-sheet.png`
- `09-responsive-layouts.png`
- a machine-readable receipt containing fixture, camera, viewport, DPR, recipe, mounted light
  positions/intensities/ranges/decay, ambient/hemi/key/fill/camera-fill values, AO implementation
  and settings, shadow settings, measured FPS/frame time, and harness results.

Every beauty capture must be settled, use the production renderer, and hide position/range/shadow
debug overlays. Keep separate labeled technical captures when an overlay is evidence.

## Definition of done

This assignment is ready for final re-gate only when:

1. Neutral clearly reveals every primitive and contact.
2. Restrained environment AO makes seams and corners readable without dirty halos.
3. Shadowed construction retains slight form separation.
4. Warm and cool visibly overlap over the same central subjects, in isolation and together.
5. Day, moon, magic, fire, and lava use believable sources and light useful subjects.
6. The lighting panel truthfully describes the final mounted/rendered state.
7. CL-F01 reads as both an organized grammar test and a coherent construction example.
8. Ramp, stairs, access overlays, sockets, strategic camera, and state reporting tell the truth
   visually.
9. Narrow and wide layouts both leave a useful review viewport.
10. Protected sprite, shadow, base, zoom, collision, scale, and torch behavior remains intact.
11. Focused harnesses and manifest checks are green, with inherited unrelated reds reported
    honestly.
12. Adam has seen every checkpoint live and supplied the visual verdict.

## Fable's checkpoint report format

For each checkpoint report:

- branch and commit SHA;
- the visual problem in plain English;
- the actual root cause;
- what changed systemically;
- live-browser state left open for Adam;
- before/after capture paths;
- measured performance impact;
- harness counts and any inherited red;
- remaining taste questions, batched and written in plain English;
- explicit `VISUAL VERDICT: PENDING ADAM`.

At the end, provide a single correction sheet and do not merge or push. Mark `FULL CI PENDING`
unless Adam separately authorizes the final clean close.
