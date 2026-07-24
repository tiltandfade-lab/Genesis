# C1A-CLAY-ROOM — room truth and projection (Clay Pass 1)

type: build-spec
status: SPECCED (Fable, 2026-07-23 — Q12-B fired at wave-12 §20.9; execute exactly, all sections)
authority: CLAY-PROOF-LADDER §C1A · BATTLEMAP-TOWNTRAY-COMPOSITION §11.1 · SLICE-1-GATE-MATRIX
  (C1A row + standing gates) · wave-12 §20.9 founder riders (clay-lighting P12.12-R1)

## The pass (what it proves)

One canonical 5×5 clay room compiles and renders with exact cells, walls, one portal, one
interactive object (crate), one goblin citizen, stable ids, a playable tabletop visual floor,
and **no renderer-owned mechanics** — through the same owners the game uses. Composition is a
projection of canonical rolled facts (§11.1: "prove that composition remains a projection of
canonical rolls"); the greybox diagnostic reads over existing geometry paths. Deliberately
untextured grey; NOT the visual-quality claim (that is C1H+).

## Decisions (recorded with grounds — do NOT re-litigate)

- **D1 dev flag:** clone the Light Lab dormant pattern (theater-boot.js:14094-14116):
  activate on `?clayroom=1` or `GS.clayRoomEnabled === true`; zero DOM/listeners otherwise;
  polled once per frame like `lightLabMaybeAutoMount` (theater-boot.js:5134). Ground: the one
  proven dev-surface pattern in production; DEV-PORTAL is specced-only.
- **D2 placement:** the view code lives INSIDE `src/ui/theater-boot.js` as appended functions
  plus at most two hook lines (the poll call + any flag read). Ground: Light Lab precedent;
  internals (`S`, `applyLightProfile`, interior builders) are not exported. NOTE: theater-boot
  is a cross-lane file (sprite lane has uncommitted root-tree edits) — keep changes strictly
  additive/appended so the eventual 3-way merge is clean.
- **D3 camera/channel:** the volumetric interior channel (`setInteriorBoard`-style, persp
  composed camera) with the FIXED camera — no rotation, no orbit (W3 §12.13 law).
- **D4 lighting (founder rider P12.12-R1 — law):** two lights at two different color
  temperatures on OPPOSING sides of the room + one low-intensity ambient, through the
  PRODUCTION lighting system (`applyLightProfile` mechanism theater-boot.js:6314, or the
  interior light-build path if the interior channel demands it — report which). Profile data
  lives in the new engine module as `CLAY_C1A_LIGHT_PROFILE` (jsdom-checkable):
  warm point `0xffa04a` on the west side, cool point `0xaebfe8` on the east side (precedent
  hexes: torchlit 6241 / moonlit 6270), intensities of the same order as those profiles,
  ambient `{color:0xffffff, intensity:0.18}`. The EFFECTIVE ambient in the mounted scene must
  be ≤0.25 — if a readability floor (e.g. STAGE_AMBIENT_FLOOR, theater-boot.js:6302) clamps
  it, use the channel/config where the authored value lands, and report the mechanism +
  effective values. Never a bespoke one-off light rig.
- **D5 resolution:** clay mount uses the DEFAULT canvas path (`psxEnabled:false` →
  `applyPsxCanvasSize` gives CSS×min(DPR,2), theater-boot.js:7063-7065). Never pass
  `psx:true`; no new DPR code.
- **D6 record derivation (one-owner law):** `clayRoomRecordFrom(seed)` derives the room from
  production owners — preference order: (a) the real `walkSceneFrom` path
  (src/engine/walk-scene.js:343) with a pinned minimal input; (b) if (a) requires world state
  beyond harness reach, assemble the record from walk-scene's OWN structure-fact shape
  (`{role:"structure", sourceRef, value}`, walk-scene.js:172/327-333) with pinned fixture
  sourceRefs and a named `C1B-ROLL-INTEGRATION` seam comment. Either way: NO parallel room
  compiler; cells/grid semantics from the GRID LAW (1 cell = 5 ft, src/engine/combat.js:32-52).
  Report which path was achieved and why.
- **D7 cast (founder-confirmed):** citizen = goblin via `SPRITE_BY_BESTIARY_ID` →
  `SPRITE_REGISTRY` (data/sprite-registry.js); crate = the existing `crate` furniture recipe
  (src/ui/theater-interior.js:1005-1010); portal/door = the existing portal/door builders
  (ITR_PORTAL_* theater-interior.js:947-948; door leaf via interiorBuildInteractables,
  theater-boot.js:4340).
- **D8 BodyForm v1 (the Wave-6 seam):** `{version:1, bestiaryId:"goblin",
  sizeCategory:"Small", occupiedCells:1, worldHeight:<registry>, heightSource:<registry>}` —
  worldHeight/heightSource read from the goblin's SPRITE_REGISTRY entry (loud failure if
  absent, never a silent default). Projection assertion: staged figure height =
  `HUMAN_TRUE_HEIGHT × scaleTrue` (theater-boot.js:1371/3225-3230) must equal
  `worldHeight/5.5 × HUMAN_TRUE_HEIGHT` within 1%.
- **D9 prose twin (GEN-LAW-3/TEXT-FIRST):** pure `clayRoomProse(record)` in the engine module
  renders every canonical fact (dims, cell count, wall edges, portal id+edge, crate id+cell,
  citizen id+height+source, seed, tier) as plain text; the overlay's Facts tab shows exactly
  this string. Same-facts equivalence by construction.
- **D10 tier leak gate:** `record.tier === "test"`; the surface never reads or writes `U` /
  world saves; record is `Object.freeze`d.
- **D11 workbench floor v0:** overlay Explain tab renders `clayRoomExplain(record)` (what the
  record is, its provenance/sourceRefs, what consumes it, "generated sources are never
  hand-edited"); one `edit` affordance on the BodyForm fields returns the typed refusal
  `{refused:true, reason:"generated-artifact", source:"data/sprite-registry.js"}` from pure
  `clayRoomEditRefusal(field)`. No other workbench scope.

## New module: `src/engine/clay-room.js` (classic script — NOT an ES module)

Owns (manifest `owns`): `clayRoomRecordFrom`, `clayRoomProse`, `clayRoomExplain`,
`clayRoomEditRefusal`, `CLAY_C1A_LIGHT_PROFILE`. Pure data + strings; no THREE, no DOM.
Record shape (exact):

```js
{
  id: "clay-c1a", version: 1, tier: "test", seed: <number>,
  dims: { w: 5, d: 5 },                       // cells; 1 cell = 5 ft (GRID LAW)
  cells: [ { id: "c-<x>-<z>", x, z } × 25 ],
  walls: [ { id: "w-<edge>-<i>", edge: "n|s|e|w", cells: [...] } ],  // full perimeter
  portal: { id: "portal-c1a", edge: "n", cell: "c-2-0" },
  object: { id: "obj-crate-c1a", kind: "crate", cell: "c-3-2" },
  citizen: { id: "cit-goblin-c1a", bestiaryId: "goblin", cell: "c-1-3",
             bodyForm: { version:1, bestiaryId:"goblin", sizeCategory:"Small",
                         occupiedCells:1, worldHeight:<registry>, heightSource:<registry> } },
  provenance: { pass: "C1A", derivation: "walk-scene|structure-fact-shape",
                sourceRefs: [...], created: "2026-07-23" }
}
```

Register in `manifest.json` (entry keys: id `engine.clay-room`, path, type `"logic"`, owns,
callTimeDeps `["data.sprite-registry"]`, desc; ordering via `mustFollow` if the validator asks)
and add the `<script>` tag in `genesis.html` AFTER `data/sprite-registry.js` (line ~1331) and
before the ES-module block (~1470). Run `python3 build/check-manifest.py` after.

## Wire-in (`src/ui/theater-boot.js` — additive only)

Appended functions `clayRoomShouldEnable()`, `clayRoomMaybeAutoMount()` (+ poll hook beside
lightLabMaybeAutoMount in renderTheaterFrame), `mountClayRoom()`:
1. Build the record (`clayRoomRecordFrom(0x6c0ffee)` — the CI seed as the pinned default).
2. Mount the theater into a full-viewport host; interior channel; fixed camera per D3.
3. Project the record through the EXISTING interior board/room builders (instanced floor/wall
   boxes, portal/doorframe, crate recipe) with a flat untextured clay-grey Lambert material
   override (Blockwright-style; one grey, no textures) — geometry/material routing through
   production builders, never bespoke meshes.
4. Stage the goblin via the existing figure path (`figureFor`/staging, D8 assertion).
5. Apply CLAY_C1A_LIGHT_PROFILE per D4.
6. Overlay panel (dormant-built, Light-Lab style): tabs Facts (D9) · Explain (D11) · a line
   showing `renderer size <w>×<h> @ dpr <n>` (countable for the capture packet).
The surface reads the frozen record only; it computes NO mechanics (no rules verbs, no dice,
no pathing).

## Execution order

U1 `src/engine/clay-room.js` + manifest + script tag + harness (red-first) → U2 the theater
wire-in → U3 overlay tabs (Facts/Explain/refusal). One branch, ordered commits (U1 its own
commit before U2 starts).

## Verification (run every one yourself; ⊗ = prove RED first)

New harness `dev/verify-clay-room.mjs` — copy the bootstrap of
`dev/verify-theater-lighting.mjs:31-62` exactly (jsdom from `~/.genesis-jsdom`, manifest
loadOrder classic scripts only, `check(name, cond, detail)` convention). Checks:
1. ⊗ Determinism: two fresh windows, same seed → `JSON.stringify` of the two records is
   byte-identical; different seed → differs. (Prove red by running the harness before U1
   exists — module-missing red counts — then green.)
2. ⊗ Truth shape: 25 cells with stable ids; full perimeter walls; portal on the north edge at
   a wall cell; crate cell ≠ portal cell ≠ citizen cell; `record.tier === "test"`;
   `Object.isFrozen(record)`; `version === 1`.
3. ⊗ BodyForm provenance: bodyForm.worldHeight/heightSource strictly equal the goblin's
   SPRITE_REGISTRY values (resolve via SPRITE_BY_BESTIARY_ID); mutation check — stub the
   registry entry's worldHeight to null in an override window → harness must go RED (loud
   failure, no silent default).
4. ⊗ Prose twin completeness: `clayRoomProse(record)` contains every id, the dims, the seed,
   the tier, the citizen height + heightSource (string-containment checks, one per fact).
5. Light profile shape: two points; `points[0].color !== points[1].color`; positions on
   opposing x sides (sign differs); ambient intensity ≤ 0.25 as authored.
6. Refusal: `clayRoomEditRefusal("worldHeight")` deep-equals the D11 shape.
7. Renderer-owns-zero-mechanics grep-gate (in the harness via readFileSync of the theater-boot
   additions region or the whole file's appended functions): the new clay functions contain no
   `d20|roll|applyEvent|attack` tokens.
8. Telemetry leak grep-gate: new/changed files contain no `fetch(|XMLHttpRequest|WebSocket`.
9. `python3 build/check-manifest.py` → `RESULT: OK`.
10. Full sweep: `for f in dev/verify-*.mjs; do node "$f" >/dev/null 2>&1 || echo "❌ $f"; done`
    → no NEW reds vs. the branch-base baseline (record the baseline first; the known
    co-resident red `verify-geometry-fixtures` in the ROOT tree is not yours — your worktree
    must be clean of it or match baseline).
11. Manual GL proof is the ORCHESTRATOR'S re-gate (browser captures) — do NOT claim visual
    results; report only that the surface mounts without console errors if you can serve it
    (python3 -m http.server in YOUR worktree; do not touch other servers/ports in use).

## Out of scope (executors do not expand scope)

Movement/pathing/preview-commit (C1B) · ActionIntent/receipts (C1B/C1C) · combat/lens (C1D) ·
saves/schema (C1F) · DM seat (C1G) · any player-flow wiring (the game boots identically with
the flag off) · Stage-C shape breadth (rect 5×5 only) · texture/material families (one flat
grey) · any edit to LIGHT_PROFILES, existing profiles, walk surfaces, or sprite assets · any
push to origin · any edit to generated artifacts (sprite-registry.js, tables.js, …).

## Report format (raw data, not prose)

Branch + SHAs · files touched with line ranges · D6 derivation path achieved (a or b) + why ·
D4 mechanism + effective ambient/light values · per-check pass/fail with the harness output
tail · which checks you proved red first (with the red output) · full-sweep baseline vs after ·
deviations/uncertainties explicitly. Do not claim green you did not personally run; do not
claim any visual quality.

## Addendum D12 — founder redlines from capture packet #1 (Adam, 2026-07-23; law)

Adam's packet-#1 ruling, verbatim: "i need a semi-transparent grid overlaying the seams of the
tiles" · "i can't tell if that door is supposed to be open or closed or if it's just janky and
completely broken."

- **D12a seam grid:** semi-transparent grid (opacity 0.25–0.35, neutral, just above the floor)
  at every cell boundary, derived from `record.dims` + the floor's own cell math — never
  hardcoded counts. Permanent fixture of the clay surface.
- **D12b legible closed door (CORRECTED same-day):** `portal.state: "closed"` joins the
  record; prose twin says "— the door is closed." Render MUST route through the EXISTING
  production door path (doorframe kit + hinged leaf via interiorBuildInteractables) by
  ADAPTING the input shape — never bespoke/stubbed door geometry (the packet-#1 stub was the
  WIRING-LAW defect class, accepted at re-gate in error). A wiring grep-gate in the harness
  now asserts the production door-builder call. **THE DOOR CONTRACT (Adam, verbatim,
  2026-07-23):** "at it's root it is an extruded rectangle exactly the same way a wall is,
  except it hinges outward on a fixed axis on one of it's corner vertices, double doors are
  the same except they hinge on opposite sides, mirroring each other." A glance must read
  "closed door," never "broken geometry."
- **D12c packet format law (process):** every capture packet leads with plain-English
  "what this proves" per image — no registry-speak, no untranslated ids. Adopted into
  `.claude/skills/genesis-clay-pass/SKILL.md` the same day.

## Addendum D16 — C1A TRUTH-ARRIVED + two deferred redlines (Adam, 2026-07-23)

Adam's ruling on capture packet #2, verbatim: **"let's bank the truth."** C1A is **truth-arrived**:
the clay room now renders through the REAL production pipeline (`spatializePlan` →
`interiorBuildBoard` → `setInteriorBoard`; the hand-assembled shim is deleted), the D13 provenance
audit reports **0 orphans** (every scene object owner-tagged), 79/79 harness green on a fresh
personal re-gate, manifest OK, and Adam eyeballed the packet. Evidence: `2b9e30b6`,
`dev/clay-captures/c1a/c1a-05..07`. The answer to the door saga, recorded: **the production door
was never broken — the door FRAME is real production output; the LEAF simply wasn't wired.**

**Two redlines deferred to C1B (named mechanisms, not mysteries — the teeth-law framing):**
- **RL-1 door leaf.** The swinging leaf renders only when the pipeline stage `bindWalkInteractables`
  (theater-boot.js) runs to populate `board.interactables`; the clay mount doesn't call it. C1B
  (which makes doors first-class per D14) wires it. Production-pipeline finding, not a clay patch.
- **RL-2 clay lighting.** Routing through `interiorBuildBoard` brought its own dim interior rig
  (ITR_SCENE_* dimming) which overpowers the CLAY_C1A_LIGHT_PROFILE two-temp profile — the room
  reads dark. The clay light profile must reassert over the interior channel's dimming (extend the
  per-frame reassert already covering the async replay to also override the interior rig values).

## Addendum D13/D14 — the generalized guards (Adam's door review, 2026-07-23)

- **D13 provenance audit (charter protected-core #6, made executable):** every object in the
  clay scene graph must carry `{builder, recordRef}` provenance; the harness/diagnostic lists
  any ownerless mesh and FAILS the pass on one. Lands with the wiring-audit re-wire unit; from
  then on "is anything in this frame made up?" is machine-answered. Applies to every later
  clay pass by inheritance.
- **D14 door catalog → C1B (founder framing, verbatim):** "there are probably 10 types of
  basic doors if not less, that should be something we just have a library of that get put in
  it's actual graphed place at a graphed position that serves as a portal to the next room,
  previous room, side room, secret room etc..." → This IS W4's canonical-connection owner +
  W8's DMG door/material catalog; the C1B spec builds the typed door catalog (data) + the
  connection record owning placement/state, renderer as pure projection, hinge law per THE
  DOOR CONTRACT (D12b). Catalog entries additionally carry a **swing-clearance volume**
  (the door's 90-180° arc) consumed by furnishing/prop placement as a blocked zone (mechanism:
  `Box3.intersectsBox()` against the frame+sweep volume at placement time)
  (rides C1J's protected-circulation contract; adopted 2026-07-23 from Adam's
  architecture review). **NO-CSG law (same review, confirming existing practice):** wall openings are made by
  omitting cell tiles, never by boolean subtraction — no CSG library ever enters the render
  pipeline. C1B interaction note (same review): door picking detects the leaf
  PANEL mesh but applies rotation to its parent HINGE group (raycast descendants, rotate the
  parent) — never rotate the panel mesh directly; and swing state changes route through the
  connection record (ActionIntent → receipt), the hinge merely projects it.

## Addendum D17 — the D2-step-3 material mechanism is superseded by CL-R0 (2026-07-23)

C1A remains **truth-arrived** and this record stays closed. One mechanism inside it was replaced,
and the replacement is owned elsewhere:

- **Superseded:** `clayRoomFlattenFurniture` + `clayRoomFlattenStructure` (D2 step 3's two
  hand-written material sweeps over the hardcoded whitelist `{floor, wall, doorframe, pillar}`,
  applied once from `mountClayRoom`), and `clayRoomMaybeAutoMount`'s per-frame light reassert.
  Both are **deleted**.
- **By:** `CLAY_DIAGNOSTIC_SURFACE_RECIPE` (a versioned role→route table in
  `src/engine/clay-room.js`) executed by `clayRoomApplyDiagnosticSurfaces()` from a single
  post-rebuild lifecycle hook, `clayRoomAfterInteriorBoardRebuild()`, at `setInteriorBoard`'s tail.
- **Why:** `setInteriorBoard` is re-entered from five asynchronous production replay sites outside
  `mountClayRoom`. A one-shot sweep could not survive any of them, which is what produced Adam's
  "It seems to have basic dungeon floor glued to it." D4's light profile and D12a's seam grid are
  unchanged in intent; both now reassert through the same hook, and the grid's coordinate frame was
  corrected (it had been building in the record's local frame after D15 moved render geometry onto
  the spatializer — see CR-6).

**Owner going forward: [CLAYROOM-RESET-LADDER.md](CLAYROOM-RESET-LADDER.md) §CL-R0.** RL-1 (door
leaf) and RL-2 (clay lighting over the interior rig) remain C1B's, and RL-1 is now recorded there as
a *visible* remaining failure rather than a deferred note — the frame contradicts the prose twin.

## Addendum D18 — THE DOOR TRANCHE: RL-1 discharged + three more defects (2026-07-23 evening)

Adam: "now let's fix the door once and for all." Four defects, each proven red-first in
`dev/verify-clay-room.mjs` and visually in `dev/clay-captures/door/`:

1. **The cell lie (new — nobody had caught it).** The record and prose twin say the portal is at
   `c-2-0`; the attempt-11 pinned fixture carved the door at plan (7,13) = local `c-4-0`, and the
   EDGE-only assert let prose and render disagree about WHERE the door is for the fixture's whole
   life. Fixed: attempt 60 (first walkId in 1-200 whose carved door lands at the record's exact
   cell) + the assert upgraded to exact-cell (check 23a red→green).
2. **RL-1, the missing leaf.** `clayRoomBoardFrom` now derives `board.interactables` FROM the record
   (the same way it stages the crate and citizen): state mapped through production vocabulary
   (prose "closed" → state "shut", per walk-interactables' own word list), slug/extrudeDepth from
   `INTERACTABLES_REGISTRY`, position = the carved cell the exact-cell assert just proved. The
   closed leaf mounts through the UNCHANGED production hinge builder — an extruded rectangle hinged
   on its corner edge (THE DOOR CONTRACT verbatim). Supersedes D15 point 1's "left empty" (its ban
   on hand-built RENDER-layer literals stands; this is canonical board data in the engine layer).
   Checks 15i (rewritten red-first), 23b/23c.
3. **The perpendicular leaf (found by the new placement census).** The leaf first mounted 90° wrong —
   a monolith jutting into the room — because the consumer re-derived orientation from an east-west
   floor-neighbor heuristic that misfires for any door on a room's own edge row. Fixed at the
   authority level: `theater-interior` now emits `board.doorAxes` (its own `itrDoorWidthAxisIsZ`
   multi-cell wall-run scan — the SAME answer that orients the frame) and the leaf consumes it;
   the old heuristic survives only as the axes-less-caller fallback. Check 24a red→green;
   `verify-d4-doors` 203/203 confirms production doors unbroken.
4. **The arch overshoot.** Corbel step 2 topped out at h+0.52 = 2.56 against the 2.4 wall (Adam:
   "taller than the wall"). Each stacked frame element now takes only the height budget below the
   wall top; at default dims step 1 lands flush and step 2 is not emitted; taller-scaled walls
   regain both automatically. Check 23d red→green; production-wide, `verify-dungeon-interior`
   288/288.

**Cascade:** the attempt re-pin re-rolled the room's torch onto the omission-ruled south wall — a
floating fixture, the exact edge case Adam's wall ruling deferred to placement. Its clause 5 is now
implemented: mount slots on omitted segments are filtered before nearest-slot resolution (receipt:
fixture on west seg 4, built; zero warnings). The TEXT-FIRST contradiction (prose "the door is
closed." over an open gap) is discharged: record, prose, and render now agree on the door's cell,
state, and pose.

## Addendum D19 — the door SOCKET + the §6.1 mount tuner (2026-07-23, late)

Adam on the D18 result: "the door is still not correct, it is not socketed into the wall, it is
floating out in front of the wall. Here's the part where i need the dev tool to just do it myself,
make sure there is some kind of snapping and individual axis control."

**Measured cause (census bb probe):** the whole door assembly was authored at the door CELL's centre
(leaf z −2.0) while the shell wall system stands at the room BOUNDARY (wall body centre z −2.61,
inner face −2.465) — 0.61 world units of daylight. A wall-SYSTEM-dependent projection fact, so it is
resolved in the renderer: `theater-interior` emits pure outward edge signs on `doorAxes`;
`itrDoorMountFor` (theater-boot) computes the mount — shell-aware default
`ITR_DOOR_MOUNT_ALONG_SHELL = 0.5` (cell centre → boundary) plus the live tune — and ONE offset is
applied to the frame rows, the portal-card rows, and the leaf hinge (clone-patched, never mutated,
so replays cannot compound). Applied mounts are reported (`S.doorMountReport`) and ride every
capture receipt.

**The tool was NOT reinvented.** DEV-PORTAL.md §6.1 (Object Workbench) already specs it: the door-
mount cluster landed early as that section's first slice, in the clay overlay's Mount tab, conformant
to the spec — per-axis control (depthInWall/sideLap/sill), the §6.1 nudge ladder verbatim (0.01 /
shift 0.001 / alt 0.10), three named snap candidates (cell-centre / boundary / wall-centre, the last
MEASURED off the built wall live), and a lock-shaped `kind:object-mount` export as the save surrogate
until the portal's lock compiler exists. The spec carries the units amendment (world units, not
meters), the snap amendment, and the implementation-status note.

**Live-proven round trip** (`/tmp` probe, receipts in `dev/clay-captures/door/`): default socketed
z −2.5 → two +0.01 nudges → −2.52 → snap wall-centre → **−2.61 exactly (the measured wall centre)**
→ snap boundary → −2.5. Harness 127/127 (checks 25a-h; 25a executed through the real compile chain).
Evidence: `socketed-04-clean-no-overlay.png`, `tuner-panel.png`.

## Addendum D20 — THE KINDERGARTEN DOOR (2026-07-23, night)

Adam's rulings verbatim in ART-DIRECTION-CANON ("THE KINDERGARTEN DOOR" block). What changed,
production-wide: the frame ornament (jambs/header/arch — D18's "fixed" door still carried it) and
the reveal slabs are DELETED; a door cell now emits exactly three pieces of plain wall shaping a
0.61 × 1.35 rectangle opening (two full-height sides + one band above), and the leaf is the 36"×80"
prototype rectangle (0.6 × 4/3 u) filling it, hinged at its corner edge, socketed at the wall plane
via the D19 mount (receipt: leaf world (0, 0.367, −2.5), size 0.6 × 1.333 × 0.32, zero warnings).
`squeeze`/`transition` fields preserved on the new pieces (the dungeon-interior harness caught the
silent data-contract break). Gates: clay 137/137 · d4-doors 203/203 (sandbox extended with the
mount helper) · ks2 40/40 + dungeon-interior 288/288 (both rewritten red-first: same real
properties, new grammar). Evidence: `dev/clay-captures/door/kindergarten-*`.

## Addendum D21 — THE DOORWAY IS THE WALL (Codex lane close, 2026-07-23)

Adam's correction, verbatim in ART-DIRECTION-CANON "THE DOOR / DOOR-FRAME SPLIT": "the door and
door frame are two separate objects, the door frame should generally be constructed as a piece of
the wall, and the door is an object that goes in the hole in the wall."

D20's three plain wall prisms survive only as the non-compiled/kit fallback. On the production
Clayroom compiled-shell path, the door boundary is now a real `kind:"doorway"` wall owner:
`compileRoomShellData` subdivides that one wall volume around a 0.61 × 1.35 clear rectangular
socket, preserving the same inner plane, outer plane, thickness, material, cap, footing, trim,
upper-omission handle, and wall-owner index as the surrounding shell. No wall face crosses the
opening below the lintel; the hole-facing wall-thickness faces and lintel underside are the reveal
surfaces. The renderer suppresses all fallback frame instances when that compiled shell owns the
socket and derives the aperture from `board.doorAxes`, while the accepted 36"×80" hinged leaf,
darkness card, state behavior, and D19 mount tuner remain separate and unchanged.

Gates personally run on the Codex lane: room-shell 48/48 · wall-volumes 35/35 · clay 138/138 ·
d4-doors 203/203 · ks2-door-assembly 40/40 · dungeon-interior 288/288 · room-shell-oss 48/48 ·
wall-runs-oss 92/92 · manifest `RESULT: OK`. Production headless evidence:
`dev/clay-captures/door/codex-wall-socket-*` and the role-ID structural pass
`dev/clay-captures/door/codex-wall-socket-role-id-*`.

## Addendum D22 — flush means the FACE, and the socket must be clean (2026-07-23)

Adam's live correction:

> "where i put the door is where it should sit, with the front nearly flush with the front face of
> the wall. still not sure why you and claude both want to just the door out, it makes no sense. are
> you centering the center of the door to the front face of the wall or something?"

Yes: D19's shell default put the centred leaf's **centre plane** on the wall boundary, leaving half
of its 0.32 depth in the room. The accepted live tune was `depthInWall +0.140`: half-depth (0.16)
minus a 0.02 face projection. That is now the derived default, not a hidden correction; the Mount
tab opens at +0.140 and reports applied dz −0.64.

The first D21 shell carve also reused the complete wall-box builder for each jamb and lintel. Each
sub-box brought its own cap, footing, and unconditional end closures, producing overlapping hidden
faces and the visible fragments behind/inside the doorway. The socket now uses clean wall prisms:
one continuous owner cap, only exposed end closures, explicit reveals to opening height, and one
lintel underside. There is no doorway trim and no independent frame object.

The same browser pass corrected the tool's grab-pan contract. It was empirically inverted on both
axes; the camera offset now makes the rendered room follow the pointer (right→right, down→down).
Teeth: `verify-room-shell` asserts one top cap, no hidden jamb/lintel end caps, and no doorway trim;
`verify-clay-room` asserts the face projection and pan signs. Gates: room-shell 51/51 ·
wall-volumes 35/35 · clay 140/140 · d4-doors 205/205 · ks2-door-assembly 40/40 ·
dungeon-interior 288/288 · room-shell-oss 48/48 · wall-runs-oss 92/92 · manifest `RESULT: OK`.
Evidence: `dev/clay-captures/door/codex-wall-socket-clean-flush-*`.

## Addendum D23 — executable door proof (2026-07-24)

Adam: "can you prove that the door works?"

The first live attempt found a real Clayroom-only failure: `clayRoomAfterInteriorBoardRebuild`
called the global `drainTweens(S)` to settle the camera fit, which also force-finished the newly
queued door-state tween. The production hinge formulas existed, but this fixture could only show
their endpoints as snaps. The hook now settles only `isCameraPoseTween` entries and preserves every
other animation channel; door transitions also start their own render loop instead of depending on
an unrelated camera/fade tween.

The overlay now has a **State** proof tab. Its shut/ajar/open buttons clone-patch
`S.lastBoard.interactables` and replay the normal `setInteriorBoard` →
`interiorBuildInteractables` path; it does not mutate the frozen clay record or mount a demonstration
mesh. The tab measures the real mounted leaf. Browser proof, closed→open→closed→ajar→open:

- shut: 0.0°, settled, mount dz −0.64;
- ajar: 22.0°, settled, same mount;
- open: 105.0°, settled, same mount;
- both directions reported `tween ACTIVE` during the governed 320 ms transition.

The browser is left on the open 105° endpoint with the State tab active so the sequence remains
directly repeatable. Gates: clay 145/145 · d4-doors 206/206 · ks2-door-assembly 40/40 ·
dungeon-interior 288/288 · manifest `RESULT: OK`.

## Addendum D24 — the scene-tray wall crown (2026-07-24)

Adam: "ok, the easiest solution for the stray geometry is to actually render the top of the walls,
you're only rendering the vertical faces but not the top horizontal face that would give it the
full \"scene tray\" or tabletop module feel"

The crown geometry already existed in the wall buffers, but its vertex order wound every horizontal
top triangle downward while its stored normals pointed +Y. Back-face culling therefore removed the
wall tops from the governed camera above and left the vertical faces reading as stray, open shell
fragments.

All three crown paths now wind counter-clockwise from above: complete wall boxes, clean doorway
prisms, and the continuous doorway-owner top cap. UVs remain world-projected; only vertex order
changed. The shell gate now computes each nominal +Y triangle's actual cross-product and rejects
downward or degenerate winding, so a fake "up" normal can no longer conceal the construction error.

Gates: room-shell 52/52 · wall-volumes 35/35 · clay 145/145 · room-shell-oss · wall-runs-oss ·
d4-doors · dungeon-interior · manifest `RESULT: OK`.
