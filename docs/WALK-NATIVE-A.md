# WALK-NATIVE-A — the walk-native boundary, then A3/A4 (GRAPHICS-NORTH-STAR Stage A close)

type: system-spec
status: SPECCED (Opus 4.8, 2026-07-12 — Adam ruled "build Codex's boundary first, then A3." Executes
Codex's walk-native amendment (`ui-sketches/mock-frames/vq-battle-scenes/WALK-NATIVE-DIORAMA-CONTRACT.md`)
as the prerequisite to wiring the dormant A2 ShotPlan. Grounded against the 2026-07-12 tree — every
anchor below was grepped live; the stale ones from older notes are corrected inline.)

Read with: `docs/WALK-NATIVE-DIORAMA-CONTRACT.md` (§2 envelope, §4 taxonomy, §5-7 field maps, §10
ShotPlan amendment, §13 recommended units, §14 gates), `docs/STAGE-A.md` (A3/A4 originals),
`docs/GRAPHICS-NORTH-STAR.md` (the walk-native amendment atop it), and the target frames
`04-gloom-dungeon` + `11-fantasy-dungeon-occlusion-fade`.

## Why this wave exists (the diagnosis)
A2's ShotPlan (`src/ui/theater-shot.js`, `shotPlanFrom`/`composeShot`) is BUILT and green
(verify-theater-shot 94/0) but **has zero callers in `theater-boot.js`** — the composed camera never
reaches the screen; the interior still fits `data.focusRect`. That is the WIRING-LAW defect class
(verify-green ≠ wired). A3 closes it. But Codex's amendment (adopted, Adam-ruled) says the ShotPlan
must consume a **WalkScene** — a provenance-stamped projection of the stored walk — not raw tray
fields, so the graphics layer can never drift into a second content generator. So the boundary
(**WDV-1 `walkSceneFrom`**) lands first, then A3 wires it, then A4 finishes occlusion.

## The prime directive (binds every unit — do not re-litigate)
The stored walk + active segment + overlay are CANONICAL. Every unit here is a **projection**: it may
classify, position, frame, light, occlude, and choose a construction class for nouns the walk already
licensed. It may **never** roll content, call `Math.random()`/`Date.now()` at projection/render time,
reject an "incongruous" roll (§8.5 no-coherence-veto), mutate `walk`/`segment`/overlay, or invent a
neighbor room. A field with no visual binding stays prose-only and canonical — never deleted, never
rerolled. (Contract §0, §8.5; gates §14.)

## The queue (dependency-ordered; branches + vehicles)
```
WDV-1  feat/wdv1-walk-scene         new pure module + trayFrom hook      off master     ┐ parallel
WDV-2  feat/wdv2-stamped-provenance walkPickStamped + segment.rollRefs   off master     ┘ (disjoint files)
A3     feat/a3-shot-compose         wire ShotPlan→camera; consume walkScene   off WDV-1 tip
A4     feat/a4-occlusion-v2         dynamic occlusion v2 (STAGE-A.md §A4)     off A3 tip
```
WDV-1 ∥ WDV-2 are disjoint (WDV-1 = new file + `theater-data.js` hook; WDV-2 = `walk.js` + the 3
rollers) → parallel worktree Agents. A3 needs `tray.walkScene` (WDV-1) → stacks off WDV-1. A4 and A3
both touch `theater-boot.js` → serial, A4 off A3. WDV-2 is ADDITIVE and NOT on A3's critical path
(WDV-1 reads `segment.rollRefs` opportunistically, falls back to `{walkId,segmentNum,fieldPath}` when
absent) — it lands whenever green.

---

## WDV-1 — `walkSceneFrom` (the anti-drift boundary) [foundational]

**New module.** `src/engine/walk-scene.js`, a **classic script** (global-scope `function
walkSceneFrom(...)`, NOT an ES module — it is engine-pure like `place-projection.js`; the ES split on
`theater-shot.js` exists only for parallel-edit isolation from `theater-boot.js`, which does not apply
here). Register in `manifest.json` `type:"logic"`, `owns:["walkSceneFrom"]`, and place it in
`loadOrder` immediately AFTER `place-projection.js` (manifest loadOrder ~:76) and BEFORE
`theater-data.js` (~:97) so `trayFrom` can call it. No THREE, no DOM, no RNG, no world writes.

### Signature + envelope (contract §2, verbatim keys)
```js
walkSceneFrom({
  walkId,        // string node id
  walk,          // stored raw walk (walkOfFrontier(w, id))
  segment,       // exact raw segment at cursor.current
  overlay,       // matching pn.segments entry ({ref:"S<num>",...}) or null
  spatialRoom,   // matching pn.spatial.rooms entry (has segNum,w,d) or null
  live: { combat, codex, cast, discoveredSecrets, inventory, viewState }
}) -> WalkScene
```
```js
WalkScene = {
  walkRef:   { id, environment, topology },
  segmentRef:{ id, num, label },
  register:  { setup, skin, spiceTier, posture, depth, isFinale },
  structure:[], connections:[], surfaces:[], practicals:[], citizens:[],
  interactables:[], dressing:[], conditions:[], atmosphere:[], hidden:[],
  traces:[], removals:[], fieldRefs:[]
}
```
Every entry in every lane is `{ role, sourceRef, ...roleFields }`. `sourceRef` (contract §3):
```js
sourceRef = { walkId, segmentNum, fieldPath, tableId:null, roll:null, overlayRef:null }
```
When `segment.rollRefs[<fieldKey>]` exists (WDV-2), copy `tableId`/`total`→`roll` into the sourceRef;
otherwise leave them null. `fieldRefs[]` is the flat index of every sourceRef emitted (one per staged
or reserved noun) — the provenance-completeness gate reads it.

### Ordered behavior
1. **Envelope + register** from `walk`/`segment` (exact keys, per the seam map): `walkRef` from
   `walk.environment`/`walk.topology`; `segmentRef` from `segment.id`/`segment.num`/`segment.label`;
   `register.setup=walk.setup`, `.skin=walk.skin`, `.spiceTier=walk.spiceTier??null`,
   `.posture=walk.posture??null`, `.depth=segment.depth??null`, `.isFinale=!!segment.isFinale`.
2. **Reuse the card lane for dealt content.** Call `walkSceneProjectionFrom(walk, segment, plan,
   {overlay, viewer:"player"})` where `plan` = `{rooms:[spatialRoom]}` when `spatialRoom` else null.
   Map its output:
   - `stageNow`+`reserve` cards with `role` ∈ {`cast`} → `citizens[]`; {`interactable`} →
     `interactables[]`; {`centerpiece`,`feature`} → the DOMINANT `structure`/`citizen` per its
     `centerpiece` flag; {`dressing`,`cover`} → `dressing[]`; {`trace`} → `traces[]`.
   - `concealed` (DM-only) and any `hidden`-tagged card → `hidden[]` (no player role fields; §14 gate 4).
   - Preserve each card's existing `sourceRef` verbatim (do not re-derive).
   - Reserve-lane cards keep a `deferred:true` + their `reason` so nothing is lost (§8.3).
   Do NOT re-deal or re-roll — `walkSceneFrom` is a classifier over the dealer's output plus the
   non-card fields the dealer ignores.
3. **Classify the non-card structural/environmental fields** the card lane does not cover, per the
   field maps below. These are the fields that make a room a *staged place*, not just a cast list:
   structure (areaType/dims/side/footing/arrival shape), connections (exits + door state), surfaces
   (biome/skin/material register), practicals (light sources), conditions (dressing.condition),
   atmosphere (sensory/atmo → **prose-only, zero geometry**), direction (scene/sceneFrame/topology
   labels). Each gets its `{role, sourceRef, ...}` entry.
4. **Overlay-derived** `traces`/`removals`: from `overlay.traces`/`overlay.removed`/`overlay.decals`
   when present → `traces[]`/`removals[]` (persistent aftermath; §14 gate 7).
5. **Hidden gating:** `segment.secret`, unrevealed `loot`, hidden traps → `hidden[]` ONLY; emit NO
   player-visible role entry until `live.discoveredSecrets`/`overlay.revealedSecrets` says revealed
   (§14 gate 4). A revealed secret/loot promotes to its real role lane.
6. **Return** the WalkScene. Never mutate the inputs (freeze-check in the harness; §14 gate 1).

### Field map — dungeon (source `rollDungeonWalk`, dungeon-walk.js; shapes per seam map)
| field | shape | role → lane | note |
|---|---|---|---|
| `areaType`,`dims`,`side` | strings | structure | polygon/footprint/side-terrain; never replaced |
| `exits[].door.type/.state` | `{name,desc}` objects | connection (+interactable if `state`) | one exit → one aperture; door state is an interactable candidate |
| `scene` | string | direction | shot/arrangement register only |
| `lighting`,`lightFlavor`,`light` | strings + `light` object | practical | visible source + falloff; `light` is the structured one |
| `object` | `{name,flavor}` | interactable | keep name+flavor in the entry |
| `feature` | `{name,flavor,dims}` | structure/citizen (dominant) | strongest centerpiece candidate |
| `dressing.text` | string | dressing | one licensed prop/assembly |
| `dressing.condition` | string | condition | material/decal modifier on a surface/object |
| `sensory`,`atmo` | string / `{lane,text}` | atmosphere | **prose-only, zero geometry** |
| `encounter`,`finale` | objects | citizen/direction | cast + boss/objective/exit state |
| `secret`,`loot` | objects | hidden | reveal-gated |

### Field map — urban (source `rollUrbanWalk`, walk.js)
`segType`,`description`→structure/direction; `transition`→connection; `sceneFrame.frame/dims/tactical`
→structure/direction (**it is `sceneFrame`, not `scene`**); `light`→practical; `dressing{text,condition}`
→dressing+condition; `interactable`→interactable; `backgroundEvent`→direction/citizen (only its
explicitly-licensed visible participants); `encounter`→citizen; `atmo`→atmosphere (prose-only);
`loot`,`finale`→hidden/citizen (reveal-gated). Do NOT force an urban segment into a dungeon polygon
(§6): a street slice/threshold/square is a valid stage.

### Field map — wilderness (source `rollWildernessWalk`, wild-walk.js)
`biome`→surface/structure; `feature` `{name,flavor}`→structure/citizen; `signOfPassage` `{name,effect}`
→dressing/direction; `footing`→structure/surface; `dressing{text,condition}`→dressing+condition;
`interactable`→interactable; `regionEncounter`→citizen (only when its field names a present thing);
`activeMagic`→practical/condition (explicit visible effect only — no generic particles);
`artFind`→hidden (reveal-gated); `encounter`→citizen; `light`→practical/sky; `sensory`/`atmo`
→atmosphere (prose-only); arrival `areaType/dims/side`→structure; `exits[]`→connection;
`loot`→hidden. Wilderness containment is mat+scatter+light+crop, not walls (§7).

### trayFrom hook
In `theater-data.js` `trayFrom`, interior branch (the `source.kind === "interior"` path, ~:1093–1139):
after the existing `walkSceneProjectionFrom` call (~:1110), also build
`const walkScene = (typeof walkSceneFrom === "function" && source.segment) ? walkSceneFrom({walkId:
source.record?.id ?? source.walkId ?? null, walk:source.walk||null, segment:source.segment,
overlay:source.overlay||null, spatialRoom:(source.plan?.rooms||[]).find(r=>r.segNum===source.focusSegNum)||null,
live:{combat:opts?.combat||null, viewState:null}}) : null;` and stamp `board.walkScene = walkScene`.
Do NOT remove `board.projection` (A3 and back-compat still read it). This is the ONLY renderer-side
touch; `walkSceneFrom` itself stays pure.

### Out of scope (WDV-1)
- Coordinates/meshes/camera/shaders (WalkScene classifies facts, never places them — §2).
- Any change to `theater-shot.js`/`theater-boot.js` (A3 owns ShotPlan consumption).
- Re-dealing or altering `walkSceneProjectionFrom` (reuse it as-is).
- WDV-2's `rollRefs` (read opportunistically; do not add them here).

### Verify — `dev/verify-walk-scene.mjs` (plain Node, jsdom bootstrap copying `verify-walk-card-projection.mjs`)
Load the real modules in document order; roll a real dungeon + urban + wilderness walk (reuse the
card-projection harness's walk-minting helpers). Numbered checks:
1. ⊗ RED-FIRST **provenance completeness (gate §14.3):** every entry in `citizens/interactables/
   structure/connections/practicals/dressing/conditions/traces` has a `sourceRef` with a non-empty
   `fieldPath`, and each appears in `fieldRefs`. (Prove red first: stub one lane to emit an entry
   with no sourceRef → check fails.)
2. ⊗ RED-FIRST **atmo isolation (gate §14.5):** `sensory`/`atmo` fields produce entries ONLY in
   `atmosphere[]` and ZERO in structure/citizen/interactable/dressing. (Red-first: temporarily route
   atmo to dressing → check fails.)
3. ⊗ RED-FIRST **hidden gating (gate §14.4):** an unrevealed `secret`/`loot` yields entries only in
   `hidden[]` and no player-visible role; flip a `discoveredSecrets` entry → it promotes to its real
   lane. (Red-first: emit the secret into `interactables` while unrevealed → check fails.)
4. **determinism (gate §14.2):** same inputs → deep-equal WalkScene across two calls, incl. an
   input whose lane arrays are shuffled (no order dependence).
5. **raw immutability (gate §14.1):** `Object.freeze`(deep) the walk + segment before the call;
   `walkSceneFrom` completes without throwing and mutates nothing.
6. **graph fidelity (gate §14.6):** N `exits` → exactly N `connections`, no invented neighbor room.
7. **card-lane parity:** every `walkSceneProjectionFrom` `stageNow` card of a mapped role appears in
   the corresponding WalkScene lane with its sourceRef preserved (no dropped cast/interactable).
8. check-manifest RESULT: OK (new module registered, loadOrder placement correct).
Regression: `verify-walk-card-projection` (unchanged count), `verify-dungeon-interior` 287/0,
`verify-theater-shot` 94/0 (trayFrom now stamps `board.walkScene` — assert shotPlan still builds).

---

## WDV-2 — stamped roll provenance [additive, parallel, off master]

Make a walk field's table origin recoverable after minting (contract §3, §13 WDV-2). ADDITIVE — every
existing public field shape stays byte-identical; `rollRefs` is a NEW sibling map.

### Behavior
1. Add `walkPickStamped(tableId, ...cols)` beside `walkPick` in `walk.js` (~:148). Returns
   `{ values:[...trimmedCells], source:{ tableId, total, band } }` where `total` is the rolled d-total
   and `band` the spice band when the table exposes one (else null). `walkPick` stays exactly as-is.
2. In each roller (dungeon-walk.js / walk.js / wild-walk.js), for the GRAPHICS-CRITICAL tables only —
   dungeon: area, feature, dressing, door, light, object, scene; urban: sceneFrame, dressing, light,
   interactable; wilderness: area(arrival), feature, dressing, signOfPassage, light — attach a compact
   sibling `segment.rollRefs = { <fieldKey>: { tableId, total } , ... }` (band optional). Use
   `walkPickStamped` where the roller already rolls that table; do NOT change the field's own value
   shape. Fields the roller derives without a single table roll may be omitted.
3. `walkSceneFrom` (WDV-1) already reads `segment.rollRefs[fieldKey]` opportunistically — no coupling.

### Out of scope
- Changing any existing field value shape; adding rollRefs to non-graphics-critical tables; any
  renderer/DOM/UI change; putting rollRefs into row narration text.

### Verify — `dev/verify-walk-stamped-provenance.mjs` (plain Node)
1. ⊗ RED-FIRST **byte-compat:** roll a walk; every pre-existing segment field (areaType, dims, exits,
   dressing.text, etc.) is IDENTICAL to a walk minted with `rollRefs` stripped — the sibling map is
   purely additive. (Red-first: temporarily overwrite a field's value from the stamped return → check
   fails.)
2. **rollRefs present:** each graphics-critical field listed above has a `rollRefs[key]` with a
   `tableId` matching the source table and an integer `total`.
3. `walkPickStamped` returns the same `values` array `walkPick` would for the same cols.
4. determinism preserved: the walk minting harness (`verify-walk-*` / whatever seeds the rollers)
   stays green — same seed → same walk (incl. rollRefs).
Regression: `verify-walk-card-projection`, `verify-dungeon-interior`, and any `verify-*walk*.mjs`
determinism/byte harness that mints walks — all unchanged counts. check-manifest OK (no new module;
if the roller files are already registered, no manifest change — confirm).

---

## A3 — wire the ShotPlan into the render + consume the WalkScene [off WDV-1 tip]

Close the dormancy: `theater-boot.js` builds the ShotPlan and drives the composed camera. Consume
`tray.walkScene` for the anchors/provenance where present (contract §10), falling back to
`tray.projection`. This is the STAGE-A.md §A3 unit, amended to be WalkScene-fed.

### Behavior
1. **Supply the 2-arg projector composeShot needs.** `composeShot(shotPlan, candidates, project)`
   requires `project(worldPt, cameraPose) -> {ndcX,ndcY}|null` (theater-shot.js header; the seam-map
   confirms today's `window.Theater.projectWorldPoint` is 3-arg single-camera and product-unused). In
   `theater-boot.js`, implement a `shotProjectFor(cameraPose)` that positions a SCRATCH `THREE.Camera`
   (never the live `S.camera`) per candidate pose (yaw/pitch/fov/target/distance → position+lookAt),
   updates its matrices, and projects the world point through it → NDC. Reuse the existing projection
   math; do not attach the scratch camera to the scene.
2. **Build + compose at the fit seam.** In `setInteriorBoard` at the fit block (theater-boot.js:7733–
   7757), behind a new reversible flag `ITR_SHOT_COMPOSE` (default ON): build
   `shotPlanFrom(data /* the tray */, GS.combat||null, {orbit,zoom})`; run
   `composeShot(shotPlan, defaultCameraCandidates(shotPlan, currentOrbit), shotProjectFor)`; drive
   `S.boardCenter`/`S.boardHalfX`/`S.boardHalfZ` (and the fit-max-height) from the chosen `camera`
   (target→center; distance/fov→half-extents via the existing fit helpers), REUSING the MF-1 camera
   tween (`placeCameraTweened(preFit)`) so it glides, never snaps. When `ITR_SHOT_COMPOSE` is OFF, or
   `composeShot` returns no valid candidate (all hard-constraints failed), FALL BACK to the current
   `data.focusRect` + `interiorCameraFitFor` path unchanged.
3. **WalkScene provenance (contract §10).** In `theater-shot.js` `shotPlanFrom`, prefer
   `tray.walkScene.citizens`/`.interactables`/`.structure` (which carry `sourceRef`) for anchor
   resolution + the `provenance` field where present; fall back to `tray.projection.stageNow` when
   `tray.walkScene` is absent (idle/node/segment trays). Keep the ShotPlan output shape identical
   (same top-level keys); this only enriches anchors/provenance, it does not add keys. Add `walkRef`/
   `segmentRef`/`fieldRefs`/`register` from `tray.walkScene` to the ShotPlan when present (contract §10).
4. Player zoom/rotate stay direct (Feel Law 3) — compose only refits the beat/room pose, never the
   player's live orbit input.

### Out of scope
- Room-shape/polygon changes (Stage C); occlusion (A4); material/light finish (Stage E).
- Changing `composeShot`'s scoring/constraints (A2 owns them; A3 only supplies the projector + wires).
- Any content roll or walk mutation.

### Verify — `dev/verify-shot-compose.mjs` (real Chrome, copy `verify-interior-camera-frustum.mjs` bootstrap)
1. ⊗ RED-FIRST **the composed camera is actually driven:** with `ITR_SHOT_COMPOSE` ON, after
   `setInteriorBoard` the action cluster sits inside the 7% safe frame and a medium figure is 18–25%
   of frame height (reuse the sprite screen-rect diagnostics). (Red-first: force the flag OFF → the
   focusRect fit does NOT meet the composed framing on a known off-center-cluster fixture → check
   fails, proving compose changed the frame.)
2. **projector correctness:** `shotProjectFor(pose)` projects a known world point to the expected NDC
   for a hand-computed camera pose (unit-style assertion against the scratch camera).
3. **fallback safety:** flag OFF → byte-identical camera to today's focusRect path (no regression when
   disabled); `composeShot` returning zero valid candidates → focusRect fallback fires (no black frame).
4. **provenance flows:** the built ShotPlan carries `walkRef`/`fieldRefs` from `tray.walkScene`, and
   every anchor's `provenance` resolves to a WalkScene sourceRef (interior fixture).
5. frustum green; fps ≥30; the loop gate (`dev/battle-gate/dungeon-loop`) stays green (settle-await).
Regression: `verify-mf1-camera-tweens` 24/0, `verify-interior-camera-frustum` 14/0,
`verify-theater-shot` 94/0, `verify-active-room-only`. check-manifest OK. READ a before/after capture
(focusRect fit vs composed) and give the paths.

---

## A4 — dynamic occlusion v2 [off A3 tip] — execute `docs/STAGE-A.md` §A4 verbatim

No amendment. Blockers from `ShotPlan.occlusionTargets` (now populated + reachable via the A3 wiring);
fade ONLY the blocking segment/instance; upper opacity 0.05–0.10 (named const from the current 0.2) +
solid 0.12–0.25u stem; tween 120–180ms in / 180–260ms out with interruption-safe retargeting (reuse
the MF-1/verbs tween channel); 2–4° hysteresis / short hold before re-classifying; transparent
occluders `depthWrite:false`; keep the small ghost mesh. Verify per STAGE-A.md §A4
(`dev/verify-occlusion-fade.mjs` + `capture-occlusion-real.mjs`, red-first the read-through +
only-blocker-fades + tween + hysteresis), regression `verify-dungeon-interior` 287/0 +
`verify-bw2-1b-occlusion`, check-manifest OK, READ on/off captures.

---

## Decisions (grounds recorded — executors must not re-litigate)
- **WDV-1 is a classic script, not an ES module** — it is engine-pure; the ES split on theater-shot.js
  exists only for parallel-edit isolation from theater-boot.js, which does not apply. (Seam map §7.)
- **WDV-1 wraps `walkSceneProjectionFrom`, never re-deals** — the dealer is the single source for
  cast/interactable/dressing/hidden cards; WDV-1 adds the structure/connection/surface/practical/
  condition/atmosphere/direction classification the dealer ignores. Prevents a second content path.
- **WDV-2 is off the A3 critical path** — WDV-1 reads `rollRefs` opportunistically; provenance is
  complete with `{walkId,segmentNum,fieldPath}` alone (contract §3 "visuals can initially use" that).
- **A3 keeps `board.projection`** — do not delete it; `tray.walkScene` is additive and the fallback
  path + non-interior trays still read `projection`.
- **A3 supplies the projector; A2 keeps the scoring** — the compose formula/constraints are A2's and
  frozen; A3 only feeds them a real multi-pose projector and wires the result to the camera.
- **Fallback everywhere reversible** — `ITR_SHOT_COMPOSE` (A3) + the occlusion consts (A4) + WDV-1's
  additive `board.walkScene` all leave the pre-wave behavior one flag/field away during migration.

## Wave close
After A4: re-shoot + read frames `04`/`11` approximations, run the composition objective gates
(neighbor-room mesh 0, medium standee 18–25% frame height, 0 living-subject pixels outside the 7%
safe frame, one dominant bright region, 35–55% indoor dark band). Then `/genesis-clean-close`
(CHANGELOG + HANDOFF + NEXT-STEPS together; mark GRAPHICS-NORTH-STAR Stage A complete + the
walk-native boundary landed; note WDV-3/4/5 remain as Codex's later recommendations).
