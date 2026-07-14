---
type: system-spec
project: Genesis
status: SPECCED
created: 2026-07-13
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
composes: PHASE-3-WAVE-PLAN.md, GRAPHICS-PRODUCTION-RESEARCH-WAVE.md
audience: Sonnet executors (one section = one unit = one branch)
---

# Phase-3 Wave-1 — locked execution specs

Six units off `docs/PHASE-3-WAVE-PLAN.md` (W0 + P3-1), spec-locked to the Sonnet-ready rubric so
each fans as a background worktree-isolated executor. Two sub-waves:

- **Sub-wave 1 (parallel, no file collisions):** P3-1a · P3-1b · W0-c
- **Sub-wave 2 (serialized — all touch `src/ui/theater-boot.js`):** P3-1d → W0-a → P3-1e

**Every executor, read first:** `CLAUDE.md`, then your section here. Repo constraints you WILL trip
on: classic `<script>` globals, NOT ES modules (top-level `const`/`function` are intentionally
global); all transient mutable state in `GS`; events only through `applyEvent`; run
`python3 build/check-manifest.py` after ANY module edit (must end `RESULT: OK`) and register new
`src/` or `data/` modules in `manifest.json`; jsdom harnesses bootstrap by loading the real
`genesis.html` module set — copy the pattern from the sibling harness each unit names. NEVER run
`dev/verify-bridge.py`. Do NOT re-litigate a spec decision. Execute your ENTIRE unit YOURSELF — do
NOT spawn sub-agents, do NOT use the Agent tool. Work on the named branch off `master`; commit
there; do NOT merge — the orchestrator gates and merges. Report raw data (branch + SHAs, files
touched, per-check pass/fail, which checks you proved RED FIRST, full harness output tails,
deviations); never claim green you didn't personally run.

W0-b (PRNG dedup) is DEFERRED from this wave: its real surface is 20+ harness files, not the "three
call sites" the wave plan estimated — re-scope before executing. Note in the close.

---

## P3-1a — GP-3a Poisson `place-distribution.js`  ·  branch `feat/p3-1a-poisson-distribution`

### Decision (do not re-litigate)
A seeded Poisson realization pass repositions **incidental filler dressing only** inside a room's legal
region, and distributes representatives around a group anchor. It is pure/no-RNG-outside-its-own-seed,
runs at the frozen seam after projected dressing is concatenated, and NEVER moves canonical anchors or
changes noun selection/counts. Source of truth: `GRAPHICS-PRODUCTION-RESEARCH-WAVE.md` §6.

### Files & functions
- NEW `src/engine/place-distribution.js` — owns `placeDistribute` (+ any helpers it needs, all
  declared `const`/`function` at top level = intentionally global). Register in `manifest.json`
  (`owns: ["placeDistribute"]`, `layer` = engine, `path`, add its `<script>` tag to `genesis.html`
  in engine load-order **before** `src/engine/theater-data.js` and update the `loadOrder`).
- EDIT `src/engine/theater-data.js` — the interior branch of `trayFrom`. Exact seam: after the
  `projectedDressing` concat block (currently ends `theater-data.js:1131`, the closing `}` of
  `if(projectedDessing.length){…}`) and BEFORE the `interiorBuildBoard(dressedPlan, …)` call
  (currently `theater-data.js:1132`). Insert:
  ```js
  if(typeof placeDistribute === "function"){
    dressedPlan = placeDistribute(dressedPlan, {
      walkId: source.record?.id ?? source.walkId ?? null,
      focusSegNum: source.focusSegNum
    });
  }
  ```
  Guard on `ROOM_PLACE_DISTRIBUTE` flag — see Decision/flag below.

### `placeDistribute(dressedPlan, opts)` — contract
- Pure. Returns a shallow-cloned plan `Object.assign({}, dressedPlan, { dressing: nextDressing })`.
  Same cells/rooms/mandatory references; only the `dressing` array is rebuilt.
- Input dressing entries carry (see `theater-data.js:1124-1131`): `{slug, x, y, primary, cardKind,
  renderStrategy, roomSegNum, sourceRef, projected, count, representativeCount}` (projected) plus
  `dressPlan`'s own incidental entries (from `src/engine/place-dressing.js`).
- **Eligible for repositioning:** entries whose role/primary marks them incidental filler — `primary
  === "floor"` AND NOT a canonical anchor. **Never touch:** `primary === "setPiece"`/centerpiece,
  doors, columns, paintings, torches, rugs, pew rows, focal pieces, furniture, cover, blockers,
  hazards, interaction sockets, mandatory cards. When in doubt, LEAVE IT (identity-preserving default).
- **Legal region** (§6.2): start from `room.cells` for `roomSegNum` (find it in `dressedPlan.rooms`),
  intersect floor cells, erode by half the object footprint + 0.08 cell; subtract door/swing/apron
  cells, template aisles, focal approaches, canonical footprints, combat occupants, columns,
  furniture, hazards, pits, sockets, and the generic center 2×2 CLEAR. If room geometry needed is not
  on `dressedPlan` here, degrade to leaving the entry at its input position (never invent geometry).
- **Per-entry seed** (§6, verbatim string):
  `hash("place-realize:v1:" + walkId + ":" + roomSegNum + ":" + (sourceRef || slug + ":" + originalOrdinal))`.
  Use a small deterministic string hash + a seeded PRNG (copy the mulberry32/xmur3 pattern already
  used under `dev/`); do NOT consume any global RNG stream.
- Suggested min radii: small 0.28, medium 0.42, large 0.70 cells, increased by footprint. Never
  collapse radius until objects overlap — insufficient fit ⇒ fewer representatives, canonical card
  stays.
- Stamp each realized entry: `sourceRef, realizationIndex, realizationSeed, algorithmVersion:"v1",
  anchor:{x,z}, regionKind`. Additive fields — existing consumers ignore them.

### Flag
`ROOM_PLACE_DISTRIBUTE` — a module-level `const` in `place-distribution.js`, default `false`
(identity/byte-stable). The `theater-data.js` guard reads it. Landing OFF keeps the render byte-
identical; a follow-up flip is a separate unit. (Mirrors the `ROOM_SHELL_POLYGON_KERNEL` legacy/oss
staging discipline.)

### Verification — NEW harness `dev/verify-place-distribution.mjs`
Model bootstrap on `dev/verify-dungeon-dressing.mjs` (loads the module set, builds a real dressedPlan).
Numbered checks (⊗ = prove RED FIRST by stubbing the behavior off / feeding a mutated fixture):
1. Noun/count/home identity: multiset of `{slug, roomSegNum}` and total count byte-stable before/after.
2. ⊗ Determinism: same `(plan, walkId)` ⇒ byte-identical realized positions across 2 runs.
3. ⊗ Seed sensitivity: changed walkId ⇒ different positions, SAME nouns/counts.
4. ⊗ Containment: every realized `{x,y}` inside its room's eroded legal polygon.
5. ⊗ Clearance: pairwise distance ≥ min radius for the size class.
6. ⊗ CLEAR intact: zero realizations in the center 2×2 CLEAR or any subtracted cell.
7. Anchor immunity: canonical/setPiece/door/column/etc. positions byte-identical before/after.
8. Flag OFF (default) ⇒ `placeDistribute` returns a plan whose `dressing` is deep-equal to input.
9. Perf: active-room realize p95 < 2 ms over 200 runs (report the number).
Regression harnesses to re-run green: `dev/verify-dungeon-dressing.mjs`, `dev/verify-dungeon-interior.mjs`
(287-class), `check-manifest.py`.

### Out of scope
Wiring the flag ON in production; area-derived counts; moving any canonical/blocker/interactable;
touching `interiorBuildBoard`; any render/`theater-boot.js` change.

---

## P3-1b — GP-4a depth-state defect audit (diagnostic)  ·  branch `feat/p3-1b-depth-audit`

### Decision
Diagnostic ONLY — **no engine/render source change**. Produce a written, reproducible defect table
classifying live transparency artifacts per `GRAPHICS-PRODUCTION-RESEARCH-WAVE.md` §7.1 into: (a)
alpha-tested cutouts, (b) additive FX, (c) true normal-alpha solids, and flag the ones that are
simpler **depth-state defects** (transparent without `depthWrite=false`; coplanar rings/decals needing
layer height / polygon offset / bounded render order). This audit is the input to P3-3 GP-4b (the
fixes); it does not fix anything.

### Files & functions
- NEW `dev/audit-depth-state.mjs` — captures live oss scenes at **four fixed yaws** and emits a
  report. Model bootstrap + capture on `dev/capture-oss-integrated.mjs` (product-camera, oss flag on).
  Reuse its scene setup; only vary yaw and dump per-pass material depth-state.
- NEW `dev/depth-audit/report.md` (+ the four capture PNGs under `dev/depth-audit/`) — the deliverable.
- MAY read-only introspect materials in `src/ui/theater-boot.js` / `standee-verbs.js` to classify;
  do NOT edit them.

### Report contract
A table, one row per proven defect: `artifact` (what pops/vanishes), `class` (cutout/additive/
true-alpha), `is_depth_state_defect` (bool + why), `material/pass` (where it lives, `file:line`),
`repro` (which yaw + what to look for in which PNG). **Proven defects only** — if you cannot
reproduce an artifact in a capture, do not list it. If the scene shows ZERO defects at the four yaws,
say so explicitly (an honest empty table beats invented findings).

### Verification
- The four PNGs exist and the report's every `repro` line is reproducible by re-running the harness.
- `check-manifest.py` (no `src/`/`data/` edits ⇒ trivially OK; confirm).
- No production harness regresses (you changed no product code): run the full sweep by exit code,
  confirm your branch's failures ⊆ master's.

### Out of scope
Any fix; WBOIT experimentation (§7.2 is a later, gated call); editing product materials.

---

## W0-c — Open5e `srd-2024` cross-check validator (data lane)  ·  branch `feat/w0c-open5e-crosscheck`

### Decision
A read-only validator that cross-checks `Reference/SRD-Data/spells.json` against Open5e's `srd-2024`
document (CC-BY-4.0). It REPORTS a join + field-diff; it NEVER auto-rewrites SRD-Data (that stays
Adam's hand-curated source of truth per CLAUDE.md).

### Files & functions
- NEW `build/sync-open5e.py` — despite the name, a **validator/reporter**, not a writer. Source of
  truth it checks: `Reference/SRD-Data/spells.json` (the file `build/gen-spells.py` reads at
  `build/gen-spells.py:26`).
- Data source: Open5e. Prefer a pinned local copy if one is already vendored; otherwise the Open5e API
  (`https://api.open5e.com/v2/spells/?document__key=srd-2024` or the `srd-2024` document key exposed
  by the API), filtering STRICTLY to `document = srd-2024`. If no network is available in the executor
  environment, the script must degrade cleanly: print a clear "Open5e source unreachable — validator
  ran zero comparisons" and exit non-zero WITHOUT touching any file. Do not fabricate a comparison.

### Report contract
Print to stdout (and optionally `dev/open5e-crosscheck-report.json`): spell-name join count
(`N/339` expected — 339 SRD spells), names present in one source but not the other, and per-spell
field diffs for a chosen key set (level, school, casting_time, range, duration, concentration,
ritual). `--check` exit code 0 iff the join is complete AND no diffs in the pinned field set; else 1
with the diffs listed. NEVER writes to `Reference/SRD-Data/`.

### Verification
- Run `python3 build/sync-open5e.py --check`; capture the exact stdout tail in the report.
- Prove the "never writes SRD-Data" guarantee: `git status` clean under `Reference/SRD-Data/` after
  a run.
- `check-manifest.py` OK (no module edits).

### Out of scope
Editing SRD-Data; regenerating `data/spells-slim.js`; any gameplay wiring; adding a non-`srd-2024`
document.

---

## P3-1d — Diorama cutaway restoration  ·  branch `feat/p3-1d-cutaway-restore`  ·  SUB-WAVE 2 (first)

### Context (the regression, from PHASE-3-WAVE-PLAN.md §"Findings folded in" #1)
C4.1b (`8d1b94f5`) retired the whole-room camera-side upper-band suppression (BW2-5) when it replaced
C4.1a's static near/far upper-hide with a ray-fade that protects only **4 ShotPlan anchors**
(player/primaryThreat/objective/focalLight — `theater-boot.js:9110`). Result: compiled rooms read as
closed boxes; non-anchor figures hide behind full-height walls
(`dev/battle-gate/dungeon-loop/loop-02-room.png`). Legacy and oss render identically — the flip is NOT
implicated. This unit restores the open-diorama read.

### Decision
1. **Base treatment:** camera-side upper-band suppression on compiled walls, driven per segment
   through the EXISTING `itrOcclusionClassify` tween engine (the same engine the wall-upper fade
   block at `theater-boot.js:9142-9174` already uses) with a build-time yaw test carrying BW2-5's
   semantics, applied to `wallUpperMeshes[].mesh` opacity. The compiler's unused
   `upperVisibleForSegment` seam (`theater-boot.js:9087-9089`) stays the escape hatch — do NOT
   re-introduce compiler-level geometry omission.
2. **Compose with C4.1b's ray-fade** for lateral occluders — the two treatments coexist (camera-side
   band suppression ∪ ray-occlusion of specific occluders); a segment fades if EITHER says fade.
3. **Extend occlusion subjects** beyond the 4 anchors to **all mounted figures** (perf-capped) so
   non-anchor combatants become readable. The subject list is built at `theater-boot.js:9110-9116`
   (`["player","primaryThreat","objective","focalLight"].map(...)`); add the live mounted-figure
   ground positions (cap N — pick a documented cap, e.g. 24, and log when exceeded per the
   no-silent-caps law).

### Files & functions
- EDIT `src/ui/theater-boot.js` — the wall-upper occlusion block (subject build `9110`, raw-blocking
  `wallUpperRawBlocking` `9174`, and the camera-side band-suppression logic to add). Reuse
  `wallUpperBlockingSet` / `itrOcclusionClassify`; add the camera-side yaw suppression as an
  additional raw-blocking source OR'd into `wallUpperRawBlocking` before the classify tween.
- Named consts (no magic numbers): e.g. `WALL_UPPER_CAMERA_SIDE_SUPPRESS`, `OCCLUSION_SUBJECT_CAP`.

### E0 interaction
E0 physical practicals parent wall-mounted fixtures to `mountSlots` (`theater-boot.js:9198-9203`). A
suppressed upper segment must fade its mounted practicals WITH the wall (they share the segment's
opacity tween) — verify a mounted practical on a suppressed segment fades, does not float lit.

### Verification
- NEW/updated harness assertions: at least one compiled room segment on the camera side reads
  suppressed (opacity < 1) at the default product yaw; a non-anchor mounted figure behind a camera-
  side wall is not fully occluded. Prove ⊗ RED FIRST by asserting against the current closed-box
  behavior before the fix.
- Re-run green: `dev/verify-theater-shot.mjs` (107-class), the A4/occlusion harness
  (`dev/verify-*occlusion*.mjs` — find it), `dev/verify-dungeon-interior.mjs`, `check-manifest.py`.
- **RE-SHOOT the dungeon loop gate** (`dev/battle-gate/capture-dungeon-loop.mjs`) and confirm in the
  PNG (art-review metric: at least one stage edge visible; open-diorama read; non-anchor figures
  readable). Include the before/after PNG paths in the report — SAME scene/camera/light/crop (banked
  re-gate lesson).

### Out of scope
Compiler-level geometry omission; changing the geometry kernel/flag; material/light finish (Stage E);
E0's fixture authoring (only its fade-with-wall behavior).

---

## W0-a — MF-3b hit-stop production wiring  ·  ~~branch `feat/w0a-mf3b-hitstop`~~  ·  ✅ ALREADY LANDED

> **STRUCK 2026-07-13 — no work needed.** MF-3b was already wired in BW4B (commit `17474b45`,
> 2026-07-11), which landed AFTER the handoff that flagged it open — so the wave plan listed a
> unit that had already shipped. Verified on master: `dm.js:1595` `hp_changed` carries `crit` +
> `attacker`; `theater-verbs.js:943` (`theaterFxFromLedger` hp case — note it lives in
> theater-verbs.js, not theater-boot.js as the anchor below guessed) emits `attackerId`/`crit`;
> `standee-verbs.js:400` consumes them; `verify-mf3b-hitstop-wiring.mjs` 35/0; dm-contract clean.
> Left below for the record; do not re-dispatch.

### Context
MF-3's hit-stop/recoil/crit-response are built + tested but DORMANT: production plays `hit-damage`
(via the `{hurt:"hit-damage"}` remap in `theater-boot.js` `play()`), firing base shake+flash — but
the hit-stop freeze + directional recoil are gated on `opts.attackerId`
(`standee-verbs.js:370-375`), and crit-response needs the `hit-crit` verb — neither of which
`theaterFxFromLedger`'s hp case emits. This threads them.

### Decision (Adam's standing delegation; smallest EVENT-CONTRACT addition)
Thread `attackerId` (+ a `crit` flag) onto the hp ledger event at the `DM_EVENT_FIELDS` boundary
(`src/world/dm.js:1591`) so `theaterFxFromLedger`'s hp case can carry them into `play("hurt", {who,
attackerId, crit})`, and `play` selects `hit-crit` when `crit` is true. Normalization lives ONCE at
the contract boundary (`dmFoldPayload`/`DM_EVENT_FIELDS`) — NOT per-handler (the HQ2-1 rule).

### Files & functions
- EDIT `src/world/dm.js` — add `attackerId` + `crit` to the hp event's `DM_EVENT_FIELDS` entry
  (canonical fields, with any alias coercion at the boundary). Regenerate `dm-contract.json` via the
  repo's contract generator (do NOT hand-edit it).
- EDIT `src/ui/theater-boot.js` — `theaterFxFromLedger` hp case: read `attackerId`/`crit` off the
  event, pass into the `play("hurt", …)` opts; make `play`'s hurt→verb remap choose `hit-crit` when
  `crit`.
- Reuse the existing `standee-verbs.js` hooks (`370-375`) unchanged — they already consume
  `opts.attackerId` and the `hit-crit` verb.

### Verification
- ⊗ RED FIRST: assert `play("hurt", {who, attackerId})` triggers the hit-stop freeze on the
  attacker's tween in a live loop capture — fails before the wiring (attackerId never arrives), passes
  after. Same for `crit` ⇒ `hit-crit` squash-stretch.
- No double-fire: base shake+flash still fire exactly once (regression guard).
- Re-run green: `dev/verify-dm-events.mjs` (70-class), `dev/verify-dm-contract.mjs`,
  `dev/verify-dm-seam.mjs`, `node dev/gauntlet-fuzz-events.mjs` (hostile payloads — new fields must
  survive), `node dev/gauntlet-monkey.mjs` (0 aborted), `check-manifest.py`, and confirm
  `dm-contract.json` regenerated (not hand-edited).
- Capture: a live loop frame showing the hit-stop freeze / crit squash firing.

### Out of scope
New verbs beyond `hit-crit` (exists); changing shake/flash magnitudes; MF-5 feel gate (Adam's, after
this lands); per-handler coercion.

---

## P3-1e — Integrated eyeball fixtures  ·  branch `feat/p3-1e-eyeball-fixtures`  ·  SUB-WAVE 2 (after P3-1d)

### Decision
Add the product-camera eyeball set (the art review's first C-art fixtures): one tiered room
(dais+pit, terrain-fixture prose), one aperture-heavy room, one dressed room through production
`trayFrom` — EACH a legacy-vs-oss PAIR at the SAME scene/camera/light/crop (the banked re-gate
lesson). Purpose: taste evidence from integrated production scenes, not bare shells (the "shoebox
problem", wave-plan finding #3), and to visibly stage the rare tiers/risers (finding #2 — exposure,
not a code fix).

### Files & functions
- NEW `dev/battle-gate/eyeball-fixtures/capture-eyeball-fixtures.mjs` — model on
  `dev/capture-oss-integrated.mjs`; drive real walk fixtures whose prose rolls a tiered room / an
  aperture-heavy room / a dressed room. For each, capture legacy and oss with identical camera/light/
  crop (toggle `_setRoomShellPolygonKernel`). Output PNG pairs under `dev/battle-gate/eyeball-fixtures/`.
- NEW `dev/battle-gate/eyeball-fixtures/README.md` — what each fixture proves + how to re-shoot.
- Runs AFTER P3-1d so the dressed/tiered captures show the restored open diorama.

### Verification
- The PNG pairs exist; each pair is confirmed same scene/camera/light/crop (assert the two captures
  differ ONLY by kernel — same board seed, same camera transform).
- Tiers/risers visibly render in the tiered-room capture under oss (proves finding #2 is exposure).
- `check-manifest.py` OK (dev-only, no `src/` edits); full sweep failures ⊆ master's.

### Out of scope
Any product-code change; judging the captures (that's Adam's taste gate); geometry-kernel changes.

---

## E0-1 — Wall-fixture occlusion-fade linkage  ·  branch `feat/e0-1-fixture-fade`  ·  SUB-WAVE 2 (after P3-1d)

### Context (the gap P3-1d widened, flagged out-of-scope by P3-1d itself)
Wall-mounted E0 practicals (torches/lamps from `interiorBuildFixtureGroup`, `theater-boot.js:6589`)
never fade in lockstep with their owning wall segment's occlusion opacity tween. When P3-1d suppresses
a camera-side wall's upper band to near-invisible, a torch mounted on that segment keeps rendering
fully lit — it floats against a faded/near-gone wall. This predates P3-1d (C4.1b never wired it), but
P3-1d's WIDER suppression coverage makes the gap far more likely to manifest on screen.

Root cause: (1) the fixture BODY material (`interiorFixtureBodyMaterial`, `theater-boot.js:6571`)
returns ONE shared `THREE.MeshLambertMaterial` cached in `ITR_FIXTURE_BODY_MATERIAL_CACHE` (:6570)
across every fixture — mutating its opacity to match one segment's fade would wrongly fade ALL
fixtures, so it cannot be pushed into a segment's `fadeEntry.materials` as-is. (2) The emitter material
IS per-fixture (`interiorFixtureEmitterMaterial`, :6577) but its only suppression today is the
`suppressPractical`/`isBrightRealm` gate (:6682) — never tied to wall occlusion state.

### Decision (do not re-litigate)
Give wall-mounted fixtures a NON-SHARED body material (clone per fixture whose `light.mount === "wall"`
— non-wall fixtures keep the shared cache, no perf regression for the common case), then APPEND both
that fixture's body-clone + emitter materials into the SAME `ownerSegIndex` `wallUpperMeshList`
`fadeEntry` P3-1d builds (`theater-boot.js:9179-9217`; the `fadeEntry` is created at :9212 via
`itrOcclusionClassify(id, wallUpperRawBlocking.has(entry.ownerSegIndex), …)`). APPEND — never
overwrite: the wall segment's own upper mesh material already occupies `fadeEntry.materials` (see how
`fadeEntry.materials` is populated for the instanced/pillar meshes at :6261/:6276). Wire this where
`interiorBuildLights` is called (grep the call site — it shifted post-P3-1d), where both the fixtures
and the per-segment `wallUpperMeshList`/`fadeEntry` map are in scope. Materials appended must be
`transparent=true` so opacity tweening actually shows.

### Files & functions (all `src/ui/theater-boot.js` — locate FRESH; P3-1d shifted line numbers)
`interiorFixtureBodyMaterial`/`ITR_FIXTURE_BODY_MATERIAL_CACHE` (per-wall-mount clone path, keep shared
cache for non-wall) · `interiorBuildFixtureGroup` (`wantWall`/`light.mount==="wall"` at :6590/:6637 —
surface body+emitter materials + owning wall `segIndex`) · the `interiorBuildLights` call site (append
each wall fixture's [bodyClone, emitterMat] into its `ownerSegIndex` `fadeEntry.materials`; a fixture on
a segment with no fadeEntry is simply not registered — unaffected).

### Verification
- ⊗ RED FIRST: a torch on a `wallUpperRawBlocking`-suppressed segment has its body+emitter opacity
  driven toward the segment's fade opacity (< 1) — fails before the wiring (stays 1), passes after.
- Isolation proof (proves the shared-material bug is truly fixed, not papered over): assert in ONE
  scene that (a) a fixture on a suppressed segment fades, (b) a fixture on a NON-suppressed segment
  stays fully lit, (c) a fixture elsewhere does NOT fade as a side effect of one segment's fade.
- Re-run green: `dev/verify-theater-shot.mjs`, `dev/verify-wall-occlusion.mjs`, `dev/verify-p3-1d-cutaway.mjs`,
  `dev/verify-dungeon-interior.mjs`, `check-manifest.py`.
- Visual: re-shoot a fixture-on-suppressed-near-wall scene and READ the PNG — the torch dims with its
  wall, never floats lit.

### Out of scope
Which segments suppress (P3-1d); the bright-realm `suppressPractical` gate (unchanged — composes with
this); cone/glow-disc fading unless trivially in the same fadeEntry; non-wall fixtures (keep shared cache).
