---
type: system-spec
project: Genesis
status: SPECCED — implementation-ready; build after the current graphics repair work lands
created: 2026-07-18
consumer: Adam (the only portal user) + production renderers/rigs that consume approved lock data
mock_root: ui-sketches/mock-frames/dev-portal/
---

# DEV PORTAL — implementation specification

The Genesis Dev Portal is the single localhost-only home for every visual editor and internal
reference app. It is not a game screen and it is not a second renderer. It boots the real Genesis
runtime, projects the real engine into tool-specific workspaces, and turns Adam's approved values
into versioned lock data that production and verification consume.

The governing mock is `portal-mock-01-d.png`: a dedicated 4×3 tool chooser with no engine preview,
fixture picker, recent-lock feed, or editor/reference shelf split. The page mocks are numbered
`02`–`14`. Mocks propose layout; repository law and real runtime contracts dispose.

## 1. Locked product rules

1. One launcher starts one localhost server and opens one portal URL. No tool gets its own launcher.
2. The home route is only a tool chooser. Editor viewports appear after a tool is opened.
3. Every editor viewport is the real `window.Theater` engine. No screenshot or parallel mock renderer.
4. Editors mutate only an in-memory preview until the one primary `SAVE … LOCK` action is used.
5. Save writes authored JSON lock data, validates it, recompiles the aggregate lock artifact, and
   refreshes the preview from the compiled result. Editors never rewrite JavaScript constants.
6. Bestiary, Table Atlas, Wiki, and Provenance Inspector are read-only. Their main affordance is a
   copy/open-source action, not SAVE.
7. Source sprites remain static. Bosses and PCs may have discrete emote sprites. Runtime combat,
   interaction, and DM-hand movement are procedural transform recipes, not sprite-frame animation.
8. Sprite retirement never deletes art. It records lifecycle state, reason, optional replacement,
   and provenance; retired sprites leave casting pools but remain addressable for old saves/audits.
9. Desktop only, minimum supported viewport 1280×800; acceptance capture is 1600×1000 at DPR 1.
10. Portal code is dormant unless `?devportal=1`; normal game boot builds no portal DOM/listeners.

## 2. Authoritative references

- Visual shell/home: `portal-mock-01-d.png`; icon source: `portal-dev-icons-c.png` (4×3,
  `#FF00FF`, cells read left-to-right/top-to-bottom in registry order).
- Editor pages: `portal-mock-02-a.png` through `portal-mock-10-a.png`.
- Sprite final: `portal-mock-04-c.png` (emotes + retirement; supersedes `04-a`/`04-b`).
- Reference pages: `portal-mock-11-a.png` (Bestiary), `12-a` (Table Atlas), `13-a` (Wiki).
- Motion: `portal-mock-14-a.png`.
- Pixel art/lifecycle: `docs/ART-DEPARTMENT.md`.
- Existing reference apps: `docs/BESTIARY-MANUAL.md`, `docs/TABLE-ATLAS.md`,
  `docs/REFERENCE-SHELF.md`, `src/ui/ref-{bestiary,atlas,wiki}.js`.
- Real motion recipes: `src/ui/standee-verbs.js`; general 3D verbs: `src/ui/theater-verbs.js`.
- Real lighting seam: `window.Theater._lightLab{Schema,GetTunable,SetTunable,Export}`.

## 3. Portal registry and routes

There are exactly twelve home cards. All cards use identical structure and stature; `kind` is only a
quiet micro-label and filter field.

| order | id / route | label | kind | mock | lifecycle |
|---:|---|---|---|---|---|
| 1 | `object` / `#/object` | Object Workbench | editor | 02 | mount real fixture viewport; teardown |
| 2 | `sprite` / `#/sprite` | Sprite Editor | editor | 04-c | sprite canvas; no Three context |
| 3 | `lighting` / `#/lighting` | Lighting Lab | editor | 03 | real viewport; teardown |
| 4 | `extrusion` / `#/extrusion` | Extrusion Lab | editor | 05 | real viewport; teardown |
| 5 | `decal` / `#/decal` | Decal Lab | editor | 06 | real viewport; teardown |
| 6 | `time` / `#/time` | Time-of-Day | editor | 07 | real viewport; teardown |
| 7 | `shot` / `#/shot` | Shot Tuner | editor | 08 | real viewport; teardown |
| 8 | `provenance` / `#/provenance` | Provenance Inspector | reference | 09 | real viewport; read-only |
| 9 | `motion` / `#/motion` | Warp & Motion Workshop | editor | 14 | real viewport; cancel tweens on teardown |
| 10 | `bestiary` / `#/bestiary` | Bestiary | reference | 11 | reuse Reference Shelf mount/teardown |
| 11 | `atlas` / `#/atlas` | Table Atlas | reference | 12 | reuse Reference Shelf mount/teardown |
| 12 | `wiki` / `#/wiki` | Wiki | reference | 13 | reuse Reference Shelf mount/teardown |

Implement `DEV_PORTAL_APPS` as the single frozen registry:

```js
{ id, label, kind, description, iconCell, order, route, mount(ctx), teardown(ctx) }
```

`iconCell` is integer `0..11`, indexing `portal-dev-icons-c.png`. The home screen renders a 4×3
CSS grid from this registry; it must contain no per-card hard-coded markup. Search filters label +
description. Arrow keys move spatially through the grid, Enter opens, Escape returns home. URL hash
is authoritative so reload restores the tool route.

## 4. Runtime topology and file plan

### 4.1 Boot

`python3 dev/dev-portal.py` serves the repo on `127.0.0.1:5178` and opens:

```
http://127.0.0.1:5178/genesis.html?devportal=1#/home
```

The portal deliberately runs inside `genesis.html`: this reuses the actual data load order, Three.js
instance, `window.Theater`, sprite registry, compiled tables, Wiki index, and Reference Shelf apps.
There is no duplicated script list to drift.

Add:

- `src/ui/dev-portal.js` — dormant ES-module shell, registry, routing, page mounts, dirty state.
- `src/ui/dev-portal-adapters.js` — pure adapters/schemas for locks, fixtures, and runtime seams.
- `dev/dev-portal.py` — static server plus narrow authenticated-by-localhost write API.
- `dev/portal-locks/schema-v1.json` — lock envelope and per-kind schemas.
- `dev/portal-locks/<kind>/<id>.json` — authored lock sources.
- `dev/portal-locks/history/` — ignored local timestamped pre-save backups.
- `build/gen-dev-portal-locks.py` — deterministic compiler.
- `data/dev-portal-locks.js` — generated `DEV_PORTAL_LOCKS`; never hand-edit.
- `dev/verify-dev-portal.mjs`, `dev/verify-dev-portal-locks.py`, and page-specific harnesses.

Register the two `src/ui` modules and generated data artifact in `manifest.json`; load
`data/dev-portal-locks.js` before the portal module. The module performs one URL-flag check and returns
immediately when absent. In normal game mode it must create zero nodes, listeners, timers, or fetches.

### 4.2 Shared engine ownership

Only one portal app is mounted at once. `switchTool()` always calls the current page's teardown first.
Pages using Three call `Theater.retire()` only through the shared portal viewport adapter, never from
individual page code. Bestiary keeps its existing two-context discipline and its own teardown.

The fixture adapter exposes:

```js
portalFixtures() -> [{id,label,kind,load()}]
portalMountFixture(id, host) -> {board, sceneRef, dispose()}
```

Required fixtures are `clay-room` (deterministic 5×5 room), `ivory-pit`, and saved-world records.
`load()` must route through the same tray/interior builders production uses. Fixture data may be
hand-authored, but rendered geometry/materials/lights may not be.

### 4.3 Save transaction

Every editor uses the same state machine:

```
clean -> dirty preview -> validating -> saved | validation-error
```

`SAVE … LOCK` is disabled while clean/validating. A successful save:

1. POSTs one complete lock envelope to `/dev-portal-api/locks/validate`.
2. Server validates kind/id/path/value ranges, rejects unknown keys and non-finite numbers.
3. Server copies the previous file to ignored `history/`, writes a sibling temporary file, `fsync`s,
   then `os.replace`s the explicit target (atomic; never a partial JSON file).
4. Server runs `python3 build/gen-dev-portal-locks.py` and the lock-kind verifier.
5. Failure restores the previous source and aggregate; response includes stderr and no success state.
6. Success returns `{ok:true, lock, aggregateHash}`; page reloads the compiled lock and becomes clean.

No endpoint accepts an arbitrary path. The server binds only `127.0.0.1`, verifies `Origin`, limits
request bodies to 1 MiB, and allowlists lock kinds/ids. It has no delete endpoint.

### 4.4 Lock envelope

```json
{
  "schemaVersion": 1,
  "kind": "motion",
  "id": "act-attack",
  "scope": "class|noun|fixture|global",
  "fixtureId": "clay-room",
  "baseRevision": "<git sha or dirty:<content hash>>",
  "recipeVersion": 1,
  "values": {},
  "provenance": {"mock":"portal-mock-14-a.png","source":"src/ui/standee-verbs.js"},
  "savedAt": "ISO-8601",
  "savedBy": "art-director",
  "status": "active"
}
```

The compiler sorts by `kind,id`, rejects duplicate active locks, emits byte-identical output for
identical sources, and includes the SHA-256 of every source lock. Specificity is:
`noun override > class/fixture lock > global lock > authored runtime default`.

## 5. Shared page shell

Editor routes use: compact portal header; page title; fixture/source selector; hero viewport/canvas;
one inspector rail; bottom diagnostics/timeline when required; one primary lock button. The viewport
receives at least 65% of page area at 1600×1000. Every adjustable number has a range control and an
editable numeric input using the same value model. Invalid input never reaches the runtime preview.

Common controls: Undo/Redo (session-only, 50 snapshots), Reset to compiled lock, Reset to authored
default, dirty indicator, exact units, copy current recipe, and reduced-motion preview. Navigating
away while dirty requires Discard/Stay; the portal never silently saves.

Reference routes replace SAVE with `COPY … BUNDLE` / `OPEN SOURCE`. They inherit portal chrome but
reuse their real application mount/teardown functions.

## 6. Page contracts

### 6.1 Object Workbench

Selected objects expose anchor-relative values, never raw arbitrary world transforms:

```js
{depthInWallM, sideLapM, heightM, sillM, offsetXM, offsetYM, offsetZM,
 yawDeg, pitchDeg, rollDeg, scaleX, scaleY, scaleZ, anchorId, mount}
```

Arrow keys nudge X/Z by 0.01; Shift = 0.001; Alt = 0.10. Page shows anchor axes, owning
wall/floor/socket, collision box, and request queue. Doorway Dolly temporarily aligns the camera with
the selected aperture. Save writes `kind:object-mount`, id = object class/slug; consumer applies the
lock after anchor derivation and before collision/provenance stamping. Gate: locked and previewed
transform match within `1e-6`; door aperture remains traversable; no object loses owner provenance.

**Units amendment (2026-07-23):** offsets are WORLD UNITS (1 unit = 1 cell = 5 ft, the GRID LAW),
not meters — the engine has no meter anywhere; the original `M` suffixes read as meters and are
retired. **Snap amendment (Adam's ask, same day: "make sure there is some kind of snapping and
individual axis control"):** each axis carries named snap candidates computed from the live anchor —
for a door mount: `cell-centre` (the authored cell), `boundary` (the room-rect line, the anchor
derivation's own default), `wall-centre` (the built wall body's measured centre). Snapping sets the
offset to a candidate; it never bypasses the value pipeline.

**Implementation status (2026-07-23, door-mount slice landed EARLY):** the clay fixture's door
tranche shipped the first §6.1 increment ahead of the portal shell, inside the clay overlay
(`?clayroom=1` → "Mount" tab): the door-mount cluster with this section's nudge ladder, per-axis
control (`depthInWall` / `sideLap` / `sill` — mapped to the runtime's along/lateral/vertical), the
three snap candidates above, live world-pos readout, and a lock-SHAPED JSON export
(`kind:object-mount`, id `door`). The live tune rides `GS.doorMountTune`, consumed at board build by
`itrDoorMountFor` (theater-boot.js — the anchor-derivation seam this section's consumer contract
names). The export is the save surrogate until this spec's lock compiler/write API exist; the portal
build absorbs this cluster as the §6.1 page's first control group, it does not rebuild it.

### 6.2 Sprite Editor

Reuse `dev/sprite-review.py` data and the real `assets/sprites/` file. Editable values:

```js
{feet, floorLinePx, anchorXPx, anchorYPx, offsetXPx, offsetYPx,
 emotes:{idle?,furious?,wounded?,grim?,triumphant?},
 lifecycle:{status:"live"|"retired",reason?,replacementId?}}
```

Emote controls appear only for `pc` or `boss`-tagged entries. They bind discrete sprite ids; there is
no frame/timeline UI. Save updates the source overlay through the server, regenerates
`data/sprite-registry.js`, and writes an audit lock. `RETIRE SPRITE` is a separate red outlined action
requiring reason and typed confirmation of the stable id. Retirement keeps the PNG and registry row,
sets `status:"retired"`, removes it from casting pools, and preserves direct old-save resolution.
Verification proves an ordinary NPC cannot receive an emote set, a retired sprite is not cast, and
its stable id/replacement/provenance still resolve.

### 6.3 Lighting Lab

The portal adapter must call the existing `_lightLabSchema`, `_lightLabGetTunable`,
`_lightLabSetTunable`, and `_lightLabExport` seams; it may not duplicate `LIGHT_TUNABLES` math.
Add per-physical-fixture controls only where the live light record owns them:

```js
{intensity, color, rangeM, heightM, falloff, emitterLocal, enabled}
```

Preview replays the last real board exactly as `lightLabApplyTunables()` already does. Before/After
uses one immutable baseline snapshot. Save writes `light-profile` or `light-fixture` locks. Production
seeds the mutable indirection from compiled locks, then authored defaults. Gates retain the existing
luma assertions and require every non-environment point light to remain co-located with visible
fixture geometry.

### 6.4 Extrusion Lab

Two synchronized panes show the source sprite and live manufactured piece. Editable recipe:

```js
{class, thicknessM, bevelWidthM, bevelAngleDeg, contourEpsilon,
 smoothing, sideShellTone, sideDarken, backFace:"mirrored"|"authored",
 anchorLine, previewYawDeg}
```

Save writes `extrusion` lock at class scope by default; noun overrides are explicit. The classifier
applies class recipes to new non-decal noun sprites after admission. Decals and effects remain exempt.
Every manufactured piece stamps recipe id/version, classifier decision/confidence, source sprite,
and anchor derivation. Rebuild is deterministic; same sprite+recipe yields byte-identical geometry.

### 6.5 Decal Lab

The viewport uses real decal PNGs on real floor/wall surfaces. Per noun:

```js
{minFt,maxFt,freeRotation,allowOverlap,density,opacity,projection:"top"|"front"}
```

Roll Preview accepts an explicit seed, re-scatters without persistence, and displays rolled sizes.
Save writes `decal-band` locks consumed before `interiorBuildDecals`. `minFt <= maxFt`; naturalistic
decal art stays flat and never enters extrusion. Tests prove seed determinism, range compliance,
surface contact, allowed projection, and overlap policy.

### 6.6 Time-of-Day

This is a focused view over the existing celestial portion of `LIGHT_TUNABLES`. Controls include
current minute, sunrise/sunset, elevation arc, overcast desaturation/damp, and ordered lighting
keyframes. Scrubbing changes preview time only. Save writes `celestial-arc` lock. Keyframes are sorted,
unique by minute, within `0..1439`, and interpolate deterministically. Existing dawn/noon/dusk/night
captures are re-run; indoor rooms must not incorrectly acquire the outdoor celestial key.

### 6.7 Shot Tuner

Camera pitch displays `28° LOCKED` and has no input. Editable values are named production seams:

```js
{occlusionUpperOpacity, stemHeightU, targetHeightM, horizonOffset,
 safeFramePct, focalBoundsPct, yawDeg, zoom}
```

Overlays show safe frame, center, focal bounds, occlusion masks, and candidate score/constraints from
`composeShot`. Save writes `shot-profile` lock. Re-run `verify-theater-shot`, occlusion-fade, and
shot-compose captures. A mutation that makes pitch editable or permits neighbor-room content is red.

### 6.8 Provenance Inspector

Read-only chain:

```
walk fact -> table roll -> chosen asset -> manufacturing recipe/version -> anchor derivation
```

Every link shows stable id, value, source path, source hash, and Open Source/Copy Link. Selection must
come from clicked real `Object3D.userData`, then join to `ShotPlan.provenance`/walk fieldRefs; the page
must never infer a missing link from display text. Missing provenance is a loud typed gap, not a
fabricated chain.

### 6.9 Warp & Motion Workshop

The source registry is `STANDEE_VERBS` in `src/ui/standee-verbs.js`. Modes:

- Warp Verbs: `act-attack`, `act-cast`, `move-step`, `hit-damage`, `hit-crit`, `fall-death`,
  `heal`, `buff`, `debuff`, `guise-swap`.
- DM Hand: `lift`, `carry`, `hover`, `place`, `cancel-return`. `move-step` remains the production
  mechanical reposition; DM-hand phases are its presentation envelope and may not commit game state.

Editable recipe fields match the real keyframe schema exactly:

```js
{durMs, persist, holdMs?, keyframes:[{
 at, along, dy, jx, tiltX, scale, scaleY, tintMix, tintColor, opacity
}], easing, interruption:"retarget"|"finish"|"cancel-return"}
```

The timeline is labeled `PROCEDURAL TRANSFORM — NO SPRITE FRAMES`. Preview uses a cloned standee,
fake clock, explicit target, and seed. Ghosts are diagnostic samples only. Add a mutable runtime
indirection seeded from authored `STANDEE_VERBS` plus compiled locks; expose a portal-only schema/get/
set/export/preview adapter on `window.Theater.motionLab`. Do not unfreeze or mutate the exported
registry. Save writes `motion` lock.

Invariants: `at` starts 0, ends 1, strictly increases; finite values; `tintMix`/`opacity` in `0..1`;
positive duration/scale; non-persistent verbs restore exact transform/material identity; persistent
verbs reach the last keyframe; texture identity never changes except `guise-swap`; group rotation.y
remains camera-owned; interruption never stacks competing tweens; reduced-motion maps transforms to
the documented minimal preset. `dev/verify-standee-verbs.mjs` remains the phase-boundary authority.

### 6.10 Bestiary

Reuse the registered `bestiary` Reference Shelf entry's `mount(container)` and `teardown(container)`;
do not fork `manualEntries()` or the renderer. Portal chrome adds only search/filter placement and
`COPY EDIT BUNDLE`. Counts are computed from live data, not hard-coded from the mock. Preserve the one
shared offscreen grid renderer + one detail renderer discipline, live-canvas cap, stable ids, QA/model
tier filters, full stats/actions/traits/flavor/narrative, and explicit model provenance.

### 6.11 Table Atlas

Reuse the registered `atlas` app and `TABLE_ATLAS_DATA`, `TABLE_USAGE`, `ROLL_COUNTS`, and
`GENESIS_TABLES`. Portal styling may present columns as mock 12, but filtering/sorting/band logic stays
owned by `ref-atlas.js`. Add `COPY EDIT BUNDLE` through a pure adapter and optional `ROLL ONCE` preview
using `rollTable(id)`; preview never increments committed telemetry or writes source. Table count is
live. Edit target is always the Engine markdown source, never `tables.js/json`.

### 6.12 Wiki

Reuse registered `wiki` app and generated `WIKI_INDEX`. Portal styling adds source status, stable slug,
copy bundle, Open Spec, and related-system chips derived only from shared `livesIn`/spec references.
Source remains `docs/ARCHITECTURE.md` -> `build/gen-wiki.py` -> `data/wiki.js`; portal never edits the
generated artifact. Counts/layers are live, not mock literals.

## 7. Accessibility and keyboard contract

- Portal root is an application landmark; tool grid is a labeled list; each card exposes title,
  description, and type in text independent of its icon.
- Every canvas/visual has a prose diagnostics twin. Color never carries status alone.
- Slider keyboard behavior follows native range controls; numeric boxes have unit-aware labels.
- Focus is restored to the originating card on return; app teardown happens before focus transfer.
- Reduced-motion preference defaults from `prefers-reduced-motion` but can be overridden for preview.
- `Escape` returns home unless a confirmation/dialog is open; then it closes only that dialog.

## 8. Verification and acceptance

### Automated

```
python3 build/gen-dev-portal-locks.py
python3 build/check-manifest.py
python3 dev/verify-dev-portal-locks.py
node dev/verify-dev-portal.mjs
node dev/verify-standee-verbs.mjs
node dev/verify-light-lab.mjs
node dev/verify-table-atlas.mjs
node dev/verify-wiki.mjs
```

`verify-dev-portal.mjs` must assert:

1. no portal DOM/listeners/fetches without `?devportal=1`;
2. exactly 12 registry cards, unique routes/icon cells, correct 4×3 keyboard navigation;
3. every route mount/teardown pair returns DOM/RAF/WebGL counts to baseline;
4. editor dirty/validate/save/error transitions and navigation guard;
5. read-only routes expose no save/write control;
6. fixture pages use real production builders;
7. late Reference Shelf registration still mounts successfully;
8. invalid lock/path/non-finite/unknown-key POSTs are rejected without file changes;
9. save rollback restores the exact previous source and aggregate when compile/verify fails;
10. negative controls make at least one assertion red per editor family.

### Visual

Capture every route at 1600×1000, DPR 1. Acceptance is compositional rather than pixel-diffing the
AI mock: home is a calm 4×3 chooser with no preview; editor viewport is hero; inspector values are
legible; only one primary lock action; reference apps are dense but readable; no overflow at 1280×800.
Motion capture includes samples at exact phase boundaries; lighting/time include before/after; object/
extrusion/decal include diagnostic overlays; reference pages show real current counts.

### Close gate

Any module edit requires `check-manifest.py` plus the relevant harness. Before landing the whole portal,
run the repository's full `dev/verify-*.mjs` sweep and existing bridge/table-lint gates per
`CLAUDE.md`; a portal-green subset is not sufficient evidence for master.

## 9. Build units and mandatory delivery order

This order is chosen to retire architectural risk before expanding the number of portal surfaces. It
is the governing delivery sequence, not merely a suggested grouping:

1. `DP-0` lock schemas/compiler/server security + verifier (no UI).
2. `DP-1` dormant shell, 4×3 home, routing, lifecycle, accessibility.
3. `DP-2` shared real-engine fixture adapter + Object Workbench.
4. `DP-3` Provenance Inspector, using the same fixture adapter and remaining read-only.
5. `DP-4` Lighting Lab only. Do not bundle Time-of-Day into this unit.
6. **Kenney-to-mapping integration gate (external to this spec).** Pause new portal tool surfaces and
   marry the Kenney asset suite to the existing mapping architecture. Object Workbench, Provenance
   Inspector, and Lighting Lab are deliberately available first so this integration can be inspected,
   traced, and tuned against the real renderer. The mapping work remains governed by its own canonical
   architecture/spec and acceptance gates; this portal document does not redefine them.
7. `DP-5` Sprite Editor (discrete boss/PC emotes, retirement, registry regeneration).
8. `DP-6` Extrusion Lab + Decal Lab.
9. `DP-7` Time-of-Day + Shot Tuner.
10. `DP-8` Warp & Motion Workshop + runtime lock indirection.
11. `DP-9` mount existing Bestiary/Table Atlas/Wiki into portal chrome; no forks.
12. `DP-10` integrated captures, rollback/mutation gates, full CI-equivalent sweep.

`DP-1` lands before page units; each page registers itself rather than adding bespoke shell branches.
Units after the Kenney-to-mapping gate may be parallel only where they do not edit the same portal
registry/shell files, but parallel execution must not move any of them ahead of that gate.
