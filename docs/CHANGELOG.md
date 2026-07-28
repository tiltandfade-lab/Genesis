# Genesis — Changelog

All notable changes to Genesis, newest first. Started 2026-06-21 (earlier history lives in `DESIGN.md` and git, not backfilled here). Add a dated entry each working session; group changes under **Added / Changed / Fixed / Deferred**.

**Auto-archive rule (2026-07-09):** this file keeps the newest 25 entries; older ones roll into
`CHANGELOG-ARCHIVE.md` via `python3 build/archive-docs.py --emit` (run it at session close when
`--check` complains). The two files read as one continuous newest-first history.

---

## 2026-07-28 — Assetforge real-asset qualification [Codex]

**Added**
- `build/qualify-assetforge-real.py` and retained
  `dev/model-qa/assetforge-real/` evidence: tracked/decodable source ledger, exact hashes, twelve
  real candidate runs, one changed-real-image negative control, per-process receipts/proofs, and a
  navigation-only aggregate board. Final technical result: 13/13 expectations met.

**Changed**
- Decal isolation can assign every nonzero source-alpha component to declared semantic anchors,
  preserving overlapping loose-sheet art without clipping it at nominal cell boundaries.
- Prop cleanup records pruned-alpha budgets and can enforce zero-gap ownership; repeat courses use
  deterministic adjacency-aware selection instead of a forever-repeating shuffled sequence.
- Real regression difference boards now visualize RGB change independently of transparent output
  alpha.

**Fixed**
- Repaired a clipped lower-right crack, removed neighboring chest/barrel fragments present in real
  dressing exports, and broke the obvious diagonal cadence found during individual roof-repeat
  inspection.

**Verified**
- Real qualification 13/13; synthetic non-emote suite 11/11 positive and 11/11 expected negative;
  sprite-emote suite 10/10 expected outcomes plus its live-output guard and rear-hand rejection.
  No candidate was admitted to runtime.

## 2026-07-27 — Assetforge twelve-family V1 [Codex]

**Added**
- `build/assetforge.py` + `build/assetforge_apps.py`: manifest-driven sprite-emote, boundary,
  modular-repeat, prop-kit, condition-state, palette, nine-slice, decal, sprite-citizenship, atlas,
  material-map, and visual-regression compilers. Every family writes quarantined outputs, a proof
  board, and a machine-readable receipt.
- Retained positive and red-first corpus under `dev/model-qa/assetforge-suite/`. The suite passes
  all 11 positive controls and rejects all 11 invalid controls. Boundary proof resolves 256 raw
  masks to 47 legal shapes, checks 2,312 compatible neighbor pairs, preserves eleven torture-map
  topologies, and covers all 47 shapes in one seeded field.
- Sprite-emote pilot corpus with exact ImageGen provenance, three PC iterations, one historical
  goblin pilot, runtime-ready candidate atlas/state metadata, and explicit visual-review receipts.

**Changed**
- Canonical emote pack is neutral, angry, happy, near-death, seated field-rest, and true rear view.
  Rear anatomy, hands, grip/contact, and equipment attachment are mandatory visual checks; the
  rejected v002 hand and corrected-but-still-unreviewed v003 remain honestly distinct.

**Deferred**
- No candidate is automatically admitted. PC v003 remains visual-review `INCOMPLETE`; the
  non-emote suite proves compiler invariants on fixtures, not production-art taste. The first
  production promotion begins with one admitted material/component sheet and Adam's verdict.

## 2026-07-27 — Integration close: four lanes landed; TIYL starts diversified; settled-life program ruled [Fable]

**Added**
- **The Opening Register** (`feat/opening-register`): minute-zero d100 band roll — settled 25 / arrival-with-edge 25 / in-medias-res 30 / wrong 15 / mythic 5, all four founder questions RULED (weights locked; no player lean for now; WRONG realm-honest; MYTHIC may permanently mark the world). New `SS.eRegister` + `eNowMedias/eNowWrong/eNowMythic` (Engine md source + inline mirror), `rollEntry` wiring, `renderOpening`/`charHandoff` surfacing. `verify-opening-register` 15/15 red-first; acceptance rerun: 9/12 hot openings vs the prior 12/12 settled monoculture. Spec: `TIYL-START-DIVERSITY.md`; unit spec: `OPENING-REGISTER-BUILD.md`.
- **Settled-life sites program** (`SETTLED-LIFE-SITES-PROGRAM.md`, §7 all four RULED: dwelling folds into the Manor's low end; working quay first; ONE persistent returnable home settlement; curiosities silhouette-grade + small usable subset) + **Meshy wilderness set-piece queue** (26 models / 14 families proposed) + `docs/intel/` evidence bank (marathon spatial mining · 1,050-walk census · 12-start TIYL batch).
- **Codex lane complete** (`docs/golden-site-thin-briefs`): Site-6 Prison/Custody brief + study packets, Tavern + Building-Type roll studies, Meshy Batch-4 runtime pack + `theater-procedural-kit.js` (additive, verified), building-program table families, urban fabric. Internal review: safe-to-land, 4 edit-needs routed to a follow-up Codex session.
- **Clay lane capture** (`feat/clay-rounds-capture`): CL-R3→R5 capture rounds (44 dirs) + theater/clay module state + re-baselined light locks; parked `SHOP-SIM-CONCEPT.md`.

**Changed**
- **Hometown = where you're from** (Adam 2026-07-26): `bornWhere` resolves the bardo hometown roll; the world-seed start place is now "Starting location" in all player-facing language (the two rolls are two facts, no longer a contradiction).

**Fixed**
- Gazetteer places forward their descriptions into the entry bundle; the spice-graded `EB.places` fresh-archetype table is live again (2 canon + 1 fresh composition — PROPOSED default pending Adam). `verify-tiyl-entry` 19/19 red-first.

**Verification** — full CI-equivalent sweep on the integrated master: 20 dep-skips (the CI render/paint skip set), one documented flake (`verify-coherence-dial` — 51/0 in isolation under both envs twice; red only under concurrent-gate load), zero other reds; check-manifest OK; bridge 64/0; table-lint 37/0; bug-probes 2/32 known-open.

## 2026-07-26 — THE SINGULAR FRESH START [Fable]

**Changed**
- Repo collapsed to one canonical line before work branches back out: worktrees pruned to the
  root + `Genesis-briefs` (Codex's live Meshy/prison lane — untouched); clay-ladder,
  materials-2, production-contracts, theater-split worktrees removed, branches deleted.
- `docs/golden-site-thin-briefs` committed tip merged (`9c099fc6`): golden-site working-spec
  retrofit + four-gate status law, the Meshy donor-model lane ruling + slate,
  M001/M035/M059/M068 admitted, Camp-Study corpus. Four both-append doc conflicts resolved by
  union; no entry lost, archive roll reconciled.
- Light-lab review evidence banked to git (`62a1244a`) so the LIGHT_LAB_SHOTS_DIR-guarded bytes
  survive worktree removal. Adam's open visual-verdict ledger restated in HANDOFF (C2/C3/C4,
  AO contact fix, split equivalence + torchlit expectation, CL-F02).
- Branch prune: 59 merged local + 58 merged origin branches deleted (origin verified clean);
  65 unmerged survivors inventoried for future triage.
- `Reference/FFT-Guard-Post-Study/study-archive/` (346 MB raw acquisition with embedded .git
  repos) gitignored as local research cache.
- Theater-split worktree's stray uncommitted churn discarded: a malformed wiki `livesIn` edit
  master had already fixed properly, plus regenerated gauntlet/geometry reports (generated
  artifacts, per the never-hand-merge law).

## 2026-07-25 (later) — VISUAL CORRECTION CLOSED + AO CONTACT FIX + THE THEATER-BOOT SPLIT [Fable]

**Added**
- `docs/THEATER-MODULES.md` — the 16-module theater map + decision record (the split's architecture proof).
- `dev/verify-theater-surface.mjs` + `dev/fixtures/theater-surface-baseline.json` — the 219-key
  window.Theater contract, frozen and gated in real Chrome at every step.
- `dev/fixtures/theater-split-b0-baseline.md` — the 19-puppeteer-by-hand census law + honest baseline.
- 16 extracted ES modules (`src/ui/theater-{clay-room,light-lab,skins,whole-object,figure-build,post,
  dispose,lighting,practicals,motes,camera,occlusion,sprites,standee-mount,overlays,interior-mesh,
  dressing,tabletop,interior-realize}.js`) — theater-boot.js 21,555 → 7,518 lines; setInteriorBoard
  is a 17-phase orchestrator; everything else verbatim (multiset-proven per step).

**Changed**
- ENV_AO_DENOISE re-weighted from a 9-candidate measured sweep (Adam's "gap of light at every planar
  contact"): creaseLift vs raw 5.38 → 1.59 luma; receipts in `dev/clay-captures/ao-contact-diag/`.
  VISUAL VERDICT: PENDING ADAM.
- Visual-correction Checkpoints 2–4 landed on the clay lane (warm/cool overlap + readout truth;
  lore-native fixtures + recipe-responsive void; honest CL-F01 workbench). PENDING ADAM.

**Fixed**
- Six harness runners resurrected from the CL-R1 registry-merge import failure (bw2-1b, s5-flip,
  sprite-join, l2-census, env3-town + qfb-tray via dev/theater-preview.html's missing classic
  scripts); env1*/l2 scratch builders pin base-commit genesis.html so their RED proofs survive the
  split; several checks re-anchored on their true subjects. Zero checks weakened.

**Deferred**
- Door-family extraction (d4-doors option-b recipe recorded), the AO A/B rig's clip-box
  nondeterminism, material-contract re-baseline, torchlit pinned-look expectation (awaits Adam's
  C3 verdict) — the full ledger in THEATER-MODULES.md §Follow-ups.

## 2026-07-25 — CL-R2 MULTIPLY CONTACT + SILHOUETTE SHADOWS + BASE NEON [Codex]

### Changed

- Soft standee contact pools now use a true multiply texture: opaque white at the identity rim,
  dark gray at contact, and `toneMapped:false`. They proportionally darken both lit floor and
  already-shadowed floor values instead of alpha-painting a replacement black value.
- The 1–30-foot presentation view is now the working default; true scale remains a canonical size
  check. Neither mode mutates registry `worldHeight` or tactical occupancy.
- The selected cyan sidewall now reads as neon through one support-shaped additive spill seated
  beneath the base. The center PointLight was removed; selection handoff hides the prior spill before
  exactly one new base emits.
- Sprite planes now cast their alpha-tested artwork silhouette in both depth and distance shadow
  passes. The visible rectangular edge shell no longer casts, removing floating card shadows in
  daylight and moonlight with one fewer caster.
- The CL-R2 receipt and sheet were regenerated. New assertions prove all seven contact pools use
  the multiply contract, every cast shadow uses the alpha silhouette, presentation is the default,
  and the base neon is linked, exclusive, support-shaped, center-bulb-free, and shadowless.

### Fixed

- Updated the optional real-Chrome floor-contact harness for CL-R2's natural rounded-strip support
  rather than its retired circular-base geometry. The live map/material check now passes 79/79;
  Clayroom passes 208/208 and the manifest remains OK. **FULL CI PENDING.**

## 2026-07-25 — GOLDEN SITE STUDY AUDIT + CONGRUENCE CORRECTION [Codex]

### Added

- Added `GOLDEN-SITE-CONCEPTING-GUIDELINES.md` as the default generator-first,
  plain-English, visually demonstrated session method for every remaining Golden Site.
- Added the binding strategic-gameplay law: every built level must create readable,
  meaningfully different plans and site-specific consequences; beauty, realism, and
  simulation cannot rescue a strategically flat scene.
- Added the Site 5 Mine/Workshop research packet and working specification: six
  operating circuits, broad/narrow/conditional route promises, deterministic
  generation/rejection/fallback rules, culture/organization axes, provisional
  clearances, asset ownership, proof receipt, and a top-down strategy diagram.
- Added Mine-standard working specs for Guard Post, Camp, Lair, Monastery, and Urban:
  each now defines its family boundary, identity/culture/circumstance split, five
  expressions, learning-first build, required zones, route promises, site-specific
  operating circuits, strategic plans/levers, generator inputs and semantic blueprint,
  ordered generation, typed rejection, deterministic fallback, culture/occupant logic,
  runtime facts, retained proof receipt, and exact first visual demonstration.
- Added a cross-site five-expression board so the retrofit can be judged as a family
  system rather than as five isolated hero scenes.

### Changed

- Separated Golden Site completion into four honest gates: researched,
  founder-ruled, brief-congruent, and clay-proved. Retired “served” as a status word;
  none of the six working-spec sites currently claims a rendered clay proof.
- Corrected the founder queue: six nonblocking proposals remain. Added
  `GOLDEN-SITES-PROOF-QUEUE.md` for evidence and rendered-proof obligations so
  research debt cannot masquerade as a taste decision.
- Normalized overbroad recommendations: tent form is selected from concrete
  climate/material/mobility/status facts rather than culture labels; one dominant
  center claimant may contain coherent subordinate pieces; descending lair chains and
  broken ledges are defaults; bolt-holes are licensed; cave ceilings remain world facts
  under cutaway; palette is supporting culture evidence, never the whole identity.
- Narrowed the institutional-chassis claim to reusable massing/parts with real
  circulation, outward-face, access, and court mutations per institution. Added explicit
  Proof/MVP/Ideal sections and acceptance requirements for Camp, Lair, Monastery, and
  Urban.
- Renamed the cross-cutting `makeshift/tribal` vernacular to
  `makeshift/scavenged`; construction condition is no longer equated with culture,
  poverty, species, or monstrosity.
- Advanced Site 5 to honest `PARTIAL / PARTIAL / PARTIAL / OPEN` gates: the accepted
  active-upper/flooding-lower foundation is now spec-grade, while the missing direct
  tactical-map cohort, thin measured cultural breadth, unselected mechanism cards, and
  absent clay fixture remain explicit.
- Adopted the Mine working spec as the generator-grade standard for every Golden Site.
  The ten-section catalog brief remains the portfolio summary; the dedicated spec is
  now required before implementation. Existing founder, research, and clay gate values
  were preserved during the retrofit.

### Fixed

- Reconciled the Guard Post import audit with the actual lean in-repo packet; the
  local 346 MB `study-archive/` remains evidence-only and untracked rather than part of
  the source-controlled reference packet.
- Updated the Lair section drawing to the hard mouth-light boundary, broken shelf, and
  cutaway-ceiling rule; repaired clipped Guard Post roof labels; updated the Monastery
  seed to the level-court first build and its roof sheet to gable + spire.

## 2026-07-24 (latest) — CL-R2 COMPLETE SPRITE CITIZENSHIP CANDIDATE [Codex]

### Added

- **`CL-F03 sprite-citizenship`** — seven real registry sprites spanning 0.25–60 canonical feet now
  share one production lineup, with true-scale/capped A/B, tactical-footprint overlays, source
  metadata, width flags, and neutral/dark/warm/cool/day production-light controls.
- **Natural stair-fit standees** — shallow rounded supports replace visible circular plinths.
  Medium support depth is one 1/3-cell tread; Tiny/Small may be shallower. A thin side shell and
  retained face/three-quarter/edge stair samples prove physical citizenship from every view.
- **Sprite Editor crosshair completion** — independent draggable `footX` and `footY`, click
  placement, source-pixel keyboard nudges, alpha-contact reset, compiled reset, content bounds, and
  overlay-to-registry compilation.
- **Reproducible CL-R2 evidence** — `dev/clay-captures/cl-r2-sprite-citizenship/` banks early/
  settled true scale, cap/edge/deep-zoom live UI, five lighting contexts, a composed sheet, live
  JSON receipt, and a separate geometry/scale measurement artifact.
- **Physical standee follow-up** — governed Clayroom zoom now reaches roughly 8.3× closer;
  deterministic oriented-support separation prevents visible bases from overlapping; contact
  shadows stay linked to relocation/yaw and feather visibly outside the support.
- **Sprite-only face fill and base-ring selection** — one camera-side, shadowless spotlight affects
  only sprite faces with gentle falloff. Selection emits from only the base's vertical sidewall,
  with no character outline and no glowing base top.
- **Shadow-form environment floor** — diagnostic darkness now retains a 0.06 shadowless hemisphere
  bounce. Strong key shadows remain photographic, while treads, risers, and wall turns hold slightly
  different dark values instead of collapsing into one flat shadow tone.

### Changed

- Interior billboard origin now consumes canonical `footX`/`footY` once; legacy `floor` values
  migrate in the registry generator rather than double-offsetting the runtime.
- Diagnostic scale overrides can temporarily cap presentation without changing canonical
  `worldHeight`. The comparison cap is now 1–30 feet; true scale remains canonical, and Treant and
  Kraken remain loudly flagged for taller/more-upright regeneration.

### Deferred

- Final production policy for exceptional encounter scale domains. The 30-foot cap remains a
  diagnostic comparison; a canonical 60-foot Kraken still requires an environment built to contain
  it. Fable owns full re-gate/landing; **FULL CI PENDING**.

## 2026-07-24 (later) — CL-R1 LIGHTING BENCH ACCEPTANCE SURFACE COMPLETED [Codex]

### Added
- **Live final-pixel diagnostics on CL-F02** — the Clayroom now places the admitted authored goblin
  PNG beside its rendered screen crop and reports median/p95 brightness, white/black clipping,
  chroma spread, and sprite-vs-local-surround readability deltas. The recurring readout samples a
  small same-frame canvas copy only when the view changes or the user refreshes it; full-resolution
  readback is reserved for explicit capture, so measurement adds no recurring animation hitch.
- **Lore-native preview strip + deterministic seed preview** — sun/day, moon/night, arcane crystal,
  torch flame, and lava reuse the existing compiled renderer recipes; A/B/C seeds affect only a
  disposable cloned flicker sequence and never mutate the authored light lock.
- **One-click seven-recipe comparison sheet** — neutral, diagnostic warm/cool, day, moon, magic,
  torch, and lava are composed into one downloadable PNG with a JSON receipt. Animated stills use
  deterministic sample 2, the prior live recipe is restored, and the capture rejects a lore-native
  card with no real mounted renderer light. Evidence is in
  `dev/clay-captures/cl-r1-lighting-matrix/`; the capture recorded zero console errors/warnings.

### Changed
- `dev/verify-clay-room.mjs` now carries CL-F02 checks 32j–32m (189/189 total), covering real pixel
  measurement, source/render comparison, the shared lore recipe set, disposable seed clones, and
  deterministic PNG/receipt capture.

## 2026-07-24 (latest) — THE CONSOLIDATION CLOSE — five lanes merged to a singular canonical master [Claude Fable 5]

### Added
- **`docs/STRUCTURE-KIT-CATALOG.md`** — the structure-kit spec for the twelve golden sites,
  closed through three founder ruling rounds in one session: tone laws (fun over realism ·
  FFT masterclass rule · near-universal access · stairs/rocks/terracing over ladders), grid
  law (5-ft cell, h=2.5 ft, storey 4h, ≤30° slopes), two-tier grain (pieces + assemblies),
  socket schema reconciled onto CL-S08, geometry/paint split by gameplay legibility,
  SRD-native access classes (walk / climb-cost / climb-DC banded 12/15/17, one check per
  storey, DC climbs never a sole route) with gear as PLANNED access-graph verbs, roof order
  parapet→shed→gable→hip, the corrected growth ladder (open-top guard room first, tower
  LAST — the atalaya finding), the full material possibility roster, six vernaculars incl.
  makeshift/tribal, the **OCCUPANCY AXIS** (invariant functional topology × rolled
  who-runs-it-now), the **ARRIVAL HOOK LAW** (no site arrival without an active
  band-appropriate hook — enforcing check owed), and the LOCKED roof posture (flat deck
  both cultures; cover promise invariant, edge pattern culture-expressive). The guard-post
  founder queue is EMPTY — everything else is deliberately card-time or clay-deferred.
- **`docs/diagrams/`** — new standing home for design diagrams (Adam's ruling: save keepers
  to docs so Adam + Codex can use them): roof/parapet/terracing vocabulary · GP-SHAPE-01
  anchor-layout plan · roof postures sheet.
- **`Reference/FFT-Guard-Post-Study/`** — the Desktop study imported (analysis specs, lock
  audit, cohort overview, reference index, verbatim Desktop catalog snapshot); ~335 MB of
  app/map/reference binaries deliberately stay Desktop-local per IMPORT-NOTE.md.
- **`Reference/FFT Battle Maps/` + border-stray tools** — untracked root artifacts rescued
  (the 22-image taste corpus, bleed-audit kit, Q12-B session prompt).
- **GP-MM-STONE-V001** (Codex lane merged) — four deterministic MM 1.3 stone parents
  (M01 coursed = Institutional / M02 fitted rubble = Upland ×2 tastes each), byte-identical
  dual exports re-proven independently at close, plus the normal-layer, condition-workbench,
  trim-sheet-layout, and uneven-ground proofs.
- **Prototype sprite admission path** (merged) — previously fail-ruled sprites render via
  `prototypeAdmitted` flags (`dev/model-qa/prototype-admissions.json`); prototype-only
  pending the full sprite review.

### Changed
- **Catalog authority resolved:** `docs/GOLDEN-SITES-CATALOG.md` (door-lane 2026-07-23
  fold) is the living golden-sites authority; the verbatim Desktop record moved to
  `Reference/FFT-Guard-Post-Study/DESKTOP-CATALOG-SNAPSHOT.md`.
- **CL-R0 clayroom reset + C1B door/movement lanes merged** (their own 2026-07-23/24
  entries below/above stand as written; Codex's FULL CI PENDING marker is discharged by
  this close's gate run).

## 2026-07-23 — CL-R0 CLAYROOM RESET BUILT · DESKTOP RESEARCH PACKET FOLDED [Claude]

### Added
- **`docs/CLAYROOM-RESET-LADDER.md`** — the single owning specification for the Clayroom reset/proof
  ladder **CL-R0…CL-R6**, the retained fixture family CL-F00…CL-F06, the diagnostic-clay surface
  contract, the clay capture/receipt law, Lighting Lab 2.0's recipe contract, the bounded Sprite
  Editor crosshair delta, and the Clayroom Workbench boundary. Subordinate to CLAY-PROOF-LADDER
  (which keeps the C1A…C5 ids) — a renderer-trust gate across passes, not a rival ladder.
- **`docs/GOLDEN-SITES-CATALOG.md`** — golden-site structure/material catalog + the Guard Post brief:
  FFT relational shape grammar and anti-rules, `GP-SHAPE-01`, the low-poly construction translation,
  cultural-mutation MVP/Ideal and acceptance gate, lock audit, seed law, and the binding FFT/import
  boundary with a per-asset not-vendored rationale.
- **`CLAY_DIAGNOSTIC_SURFACE_RECIPE`** (`src/engine/clay-room.js`) — versioned role→route table
  (`diagnostic-clay` | `passthrough` | `unclaimed`; modes `clay` | `role-id`) plus
  `clayDiagnosticRoleForKind` / `clayDiagnosticRouteFor` / `clayDiagnosticModeFrom`.
- **`clayRoomSurfaceCensus()`** + a `Surfaces` overlay tab + `window.Theater._claySurfaceCensusForTest`
  / `_clayProvenanceAuditForTest` / `_clayCameraPoseForTest` — machine-answerable "which system owns
  every visible surface".
- **`dev/capture-clayroom-fixture.cjs`** (gameplay-scale before/after captures with a full receipt:
  fixture + recipe identity, camera, runtime path, light values, surface census, settle timeline, and
  a panel-hidden clean frame) and **`dev/measure-clay-capture.py`** (luma/clipping/chroma over
  declared regions). Evidence in `dev/clay-captures/cl-r0/`.
- **`dev/verify-clay-room.mjs` check 18** — the CL-R0 durability invariant (97 checks total).

### Added (later the same session)
- **Camera-side wall-omission ruling (RULED FOR TEST) + CL-R3a BUILT** — Adam's FFT wall-grammar
  ruling captured verbatim in ART-DIRECTION-CANON; compile-time omission (camera-facing ∧ occludes
  staged floor → stem only) live in the clay fixture through the production shell compiler, decision
  set as versioned receipt data, harness check 21, A/B captures in `dev/clay-captures/cl-r3a/`.
  Cascades: clay shell default ON (17b2 rewritten red-first), mount-socket warning discharged,
  fade-aware material swap (check 20) keeps the remaining cutaway linkage intact.
- **Sprite sRGB root-cause fix** — `spriteTextureFor` never tagged colour space (three r166 outputs
  sRGB); proven by A/B (`dev/clay-captures/cl-r1-sprite-ab/`), ON by default, check 19.

### Changed
- **Diagnostic clay is now durable.** Deleted `clayRoomFlattenStructure`/`clayRoomFlattenFurniture`
  (a one-shot sweep over a hardcoded four-kind whitelist) and the per-frame light-reassert patch;
  replaced by one post-rebuild hook `clayRoomAfterInteriorBoardRebuild()` at `setInteriorBoard`'s
  tail — the single funnel all five async replay sites pass through.
- `docs/ART-DIRECTION-CANON.md` — Adam's 2026-07-23 rulings appended verbatim (six Clayroom reset
  redlines; FFT low-poly construction language; the narrative-furnishing boundary; Material Maker 1.3
  and every-material-is-a-fertile-seed).
- `docs/TRIM-SHEET-PIPELINE.md` §15 (proposed `genesis-architecture-core-h6-v1` realization) and
  `docs/MATERIAL-LANE.md` §9 (Guard Post parent-seed roster + lineage law) — amendments to the
  existing owners, never a parallel authority.
- `docs/C1A-CLAY-ROOM.md` addendum D17 — records which mechanism CL-R0 superseded and why.

### Fixed
- **CR-1** the settled Clayroom frame showed the realm's textured dungeon floor (floor-region mean
  saturation 175.4 → 29.2; whole-frame near-black 46.8% → 0.04%).
- **CR-6** the D12a seam grid had never rendered — it was built in the record's local frame and
  mounted (3, 13) cells away from the room, off-camera, while auditing "owned". The provenance audit
  now reports a world bbox per owned root.
- **CR-7** per-instance `setColorAt` tint defeated the clay material swap; claimed instances are now
  neutralized (recorded in the census).
- **CR-8** the census was scoped to `S.interiorGroup`; it now walks `S.scene` and attributes each
  mesh to its owning group.
- **CR-9** a module-eval-time read of the engine recipe broke every harness that loads
  `theater-boot.js` alone; recipe reads are call-time only, asserted by the harness.

### Deferred
- **CL-R0 is not fully clean and this is not hidden:** the `bracket-generic` mount-socket warning
  still fires (CR-3 → CL-R1); the door still renders as an open gap while the record and prose twin
  both say closed (RL-1, now a visible TEXT-FIRST contradiction, not a wiring chore); the room-shell
  construction path is still bypassed (`?clayshell=1` makes the A/B reproducible; default unmoved →
  CL-R3). The washed-out sprite (CR-4) and the unreadable two-temperature rig (CR-2) are CL-R1/CL-R2.
- **FULL CI PENDING** — fast checkpoint, not an evening close. No merge, no push.
- **Sweep honesty correction:** an earlier report in this session said the full verify sweep was
  clean apart from one red. That was read from a still-running sweep and was wrong. Full `dev/verify-*.mjs` sweep: **12 reds, all baseline-identical** — the same 12 fail with
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

---

## 2026-07-23 (latest) — Q12-B FIRED · C1A CLAY ROOM ON THE REAL PIPELINE · RECOVERY→DRIVE [Fable, Adam ruling]

### Added
- **Q12-B gate FIRED** (wave-12 §20.9) — implementation hold lifts for Stage 1 (C1A→C1G) only;
  Adam's eight pre-build answers verbatim, incl. the clay-lighting rider (production lighting,
  full native resolution, two-temp opposing + low ambient).
- **C1A clay room — TRUTH-ARRIVED** (`src/engine/clay-room.js`, theater-boot.js CLAY-ROOM region,
  `dev/verify-clay-room.mjs` 79 checks): one canonical 5×5 room compiled + rendered through the
  REAL `spatializePlan`→`interiorBuildBoard`→`setInteriorBoard` chain; dev-flag `?clayroom=1`,
  boot self-mount, Facts/Explain/edit-refusal overlay, D13 provenance audit (0 orphans), seam grid.
- **`.claude/skills/genesis-clay-pass`** — the front-end/back-end gate-split skill (Claude owns the
  measurable back-end gate; Adam gates the visual) + THE TEETH LAW (rulings recorded only with
  enforcing checks) + the plain-English capture-packet law.
- **Material lane folded into canon** (`docs/MATERIAL-LANE.md` + `docs/CODEX-MATERIAL-BRIEF.md`):
  Material Maker 1.3 pinned + headless-proven; SUBTLE-TEXTURE split; Codex Wave-1 authoring brief.
- **TEETH-AUDIT-2026-07-23** — 57 Stage-1 laws classified (28 need teeth / 20 have / 9 stay prose).
- **Stage-0 recovery package** — tag `pre-redesign-2026-07-23`, verified bundle + LFS-complete zip,
  restore drill PASSED, migrated to Google Drive (double cloud copies), zero durable local residue.

### Changed
- **Repo relocated** into a parent container: `~/Desktop/Work/projects/Genesis/genesis` (worktree
  convention + launchers + skill paths updated); the sprite lane's uncommitted prototype-admission
  work parked on `feat/sprite-prototype-admission` (preserved, not merged — its lane's call).

### Deferred
- **C1A → C1B redlines:** RL-1 door leaf (wire `bindWalkInteractables`), RL-2 clay lighting over
  the interior dimming. Door catalog + swing-clearance + socket schema authored into the C1B/C1H
  specs (D14; structure-kit catalog is the C1H-opener writing task).

## 2026-07-23 (later) — FEATURE-PRIORITIZATION VIEW + CLEAN CLOSE [Fable]

**Added**
- `docs/FEATURE-PRIORITIZATION.md` (type: build-plan, Adam's request) — the readable answer to "what do
  we build, in what order, what's prototype vs MVP, how tested, when declared arrived": the arrival law
  (4 conditions for prototype-arrived, 5 for MVP-arrived), stages 0-7 in dependency order (visual proof
  = Stage 2 per Adam's guard's-post priority), 21 per-feature prototype/MVP test rows, and every parked
  feature with its named trigger. Derived view — ledger/ladder/wave records stay authoritative;
  authorizes no build (Q12-B gates). Indexed in `docs/README.md`.

**Changed**
- Clean close (Adam: "clean close ... with a CI check"): full CI-equivalent gate run locally
  (check-manifest OK · verify-*.mjs sweep with CI dep-skip emulation · verify-bridge 64/0 ·
  verify-table-lint 37/0 · playtest-bug-probes) — the one working-tree red (`verify-geometry-fixtures`
  scope-guard 7a/7b) is the co-resident sprite lane's dirty `src/ui/theater-boot.js`, not this branch
  (branch diff vs master carries zero src/data files; all 52 geometry fixtures pass, 0 regressions).
  Merged `docs/procedural-dungeon-waves-3-6-checkpoint` --no-ff to master, pushed, GitHub CI confirmed
  green. NEXT-STEPS gained the 2026-07-23 Do-next block; HANDOFF's FULL-CI-PENDING marker discharged.

## 2026-07-23 — FOUNDER REVIEW: ALL TWELVE WAVES DESIGN-CLOSED [Fable chairing, Adam ruling]

**Added**
- Ran the staged founder-review session (2026-07-22/23, interactive, docs-only): Adam answered all six Batch-1
  founder questions (Q7-A B · Q8-A B · Q9-A B · Q9-B B · Q11-A B · Q12-A A), then swept waves 7/8/9/11/12 in
  plain language and explicitly closed each (§16.6-7 · §17.6-7 · §18.6-7 · §19.6-7 · §20.6-7). The procedural-
  dungeon design program is complete; the implementation hold stands; Q12-B is the single reserved gate.
- New decision-index ids GEN-CBT-9, GEN-WLD-10, GEN-DM-11/12, GEN-PROD-5/6, and the BINDING **GEN-PROD-7
  no-dark-patterns law**. Ten follow-ups tracked (F7.1-3, F8.1-2, F9.1-3, F11.1, F12.1) including the DM
  rule-bend-and-reconcile vision, the player-rolled physical dice mode, the playable-DM-seat product vision, and
  the cozy/peaceful register.
- Sweep riders recorded as law: hand floor, performance-layer freedom, harness-first/loosen-by-evidence,
  no-plot-armor offscreen, no-unexplained-reversion, organic-regrowth-on-ecology-clocks, DMG-sourced material
  catalog, heated-metal conduction, DC reveal-at-commit, three-tier worlds, never-brick essential.

**Changed**
- Applied every pending ladder/ledger addition (now BOUND): W7 tactical corpus + refinements, F8.1 breakable door
  + W8 mutation row, W9 hand/cadence row, W11 workbench row, W12 persistence row + F12.1 instrument. Flipped
  QUESTION-COVERAGE, the questionnaire live bookmark, the program front door, and OPEN-QUESTIONS (Batch 1
  discharged; Batch 2 gained #11 realm-introduction order — Adam leaning Lost World). MODULE-PHASING is ACTIVE:
  ship-travel deferral confirmed and promoted to a prototype→ideal sketch ("we do want it").

**Deferred**
- DOCS-INDEX tooling (DI-1/2/3): deferred with a mandatory re-scope precondition before execution. Gemini-
  transcript gather, FOREVER-STORAGE wiring verify, and sidekick-data gather remain queued mechanical follow-ups.
  FULL CI PENDING — fast checkpoint only, no push.

## 2026-07-22 — WAVE 10 PHASED THROUGH BOUNDED TOWN CONTINUITY [Codex]

**Added**
- Split the oversized procedural-dungeon direction into an immutable stable index, preservation/protocol files,
  bounded wave indexes, and bounded chronological wave parts without deleting the original record. Added the Clay
  Proof Ladder and Feature-Promotion Ledger so every accepted ideal can retain an explicit scaffold, MVP gate,
  feature goal, and promotion test.
- Added the high-priority shared BattleMap/TownTray composition study derived from FFT-map and GaneshaDx analysis:
  semantic plan before geometry, exact-cell authority, navigable elevation, landmarked encounter spaces, measured
  composition diagnostics, C1H clay proof, and procedural UV/surface-frame requirements without copying FFT assets,
  layouts, or code.
- Added the accepted architectural trim-sheet pipeline: stable manifest, horizontal multi-band base-color sheets,
  canonical-material-first variant selection, independently sourced/deterministically packed strips, run-aware UV
  segmentation and fallback, plus a separate C1I proof after composition-first C1H.

**Changed**
- Reframed implementation around small retained proofs rather than same-sized design/build waves. The first playable
  spine is canonical mechanics -> exact BattleMat plus mandatory EngagementLens -> provider-neutral DM seat and
  fallback -> persistence/recovery; a single small clay room precedes multi-room, site/cold, relational, travel,
  town, and portfolio modules. Borderline features remain in the MVP with narrowed breadth.
- Closed F10.9g on staged land travel: deterministic rational macro-biomes, existing Fray/Spice edge authority,
  persistent grid/node-owned journeys, route choices, encounter/remount continuity, and minimal transport identity
  and capability before later horse/wagon integration. Bespoke generated choice imagery is not a pre-alpha
  dependency.
- Closed F10.9h and h.1-h.15 on bounded town continuity. C2M retains one canonical district/venue chain through
  arrival, Urban Walk, real-roll venue, social/exploration, battle, aftermath, remount, pursuit, civic response,
  transport anchoring, schedule/access gates, departure, and return.
- Advanced the live Wave 10 record to the five-question F10.9i-F10.9m batch at section 11.95. P10.9 and Wave 10
  remain open; performance/device/accessibility stays P10.10.

**Deferred**
- No procedural-dungeon, BattleMap/TownTray, trim-sheet, travel, town, companion-autonomy, or information-layer code
  was implemented. C1H, C1I, C2M, the remaining P10.9 cases, P10.10-P10.12, and explicit Wave 10 closure remain
  future work.
- `Reference/FFT Battle Maps/` remains local and untracked pending production-rights/provenance review.

**Verified**
- Full local CI-equivalent close gate: manifest `RESULT: OK`; 223 verifier harnesses with 0 real reds and 17
  expected optional-dependency skips; bridge 64/64; table lint 37/37; playtest probes green with only the two
  already documented/WAI present cases.

## 2026-07-19 (later) — CI GREENED + WAVE 1 DESIGN LANE LANDED [Claude Code]

**Fixed**
- The master CI red (4 straight failures since 2026-07-18): the one surviving real failure after
  PR #1's LFS repairs was `dev/verify-wiring-a.mjs` §13c — a fixed six-montage count can't
  guarantee crossing a 5-day-out wakeAt now that HQ3-C2 makes an interrupted rest burn a rolled
  partial window (`restInterruptMinutes`: 360–1080 of 1440). Node 20 (CI) consumed the seeded
  rest-risk stream differently than node 22 (local), interrupting enough montages that the KO'd
  PC *correctly* stayed down. §13c now montages until the clock has actually crossed wakeAt
  (bounded ×40) and asserts the crossing wakes exactly once — E21's real claim; the exactly-once
  + no-refire assertions stay load-bearing. 10/10 green at the CI default seed + a 13-seed sweep.

**Changed**
- Landed `docs/procedural-dungeon-wave1-checkpoint` to master as one --no-ff merge (79 docs
  commits): `PROCEDURAL-DUNGEON-DIRECTION.md` grew to 9,872 lines of settled Wave 1 rulings and
  `PROCEDURAL-DUNGEON-ARCHITECTURE-SKETCH.md` (1,155 lines) was born. The lane's own HANDOFF
  pointer ("resume at question 12") was stale — the file actually runs through question 20, a
  Wave 1 audit, roster/light-sim/realization design, and ends at **open decision 3C** (typed
  TerminalDisposition vs the `obliterated` boolean), awaiting Adam.
- Discharged Codex's `FULL CI PENDING` marker: this close ran the full CI-equivalent gate
  (check-manifest, the whole verify-*.mjs sweep with CI's dep-skip posture + seed shim,
  verify-bridge, verify-table-lint, playtest-bug-probes) and pushed with the GitHub run watched
  to green. Pruned the two merged dungeon worktrees (`Genesis-dungeon-wave1`,
  `Genesis-procedural-dungeon`) + their branches.

## 2026-07-19 - PROCEDURAL DUNGEON WAVE 1 CHECKPOINT + FAST-COMMIT MODE [Codex]

**Added**
- Wave 1 questions 1-10 and follow-ups to `PROCEDURAL-DUNGEON-DIRECTION.md`: lore-first purpose
  authority, operator/doctrine/construction identity, resource ecology and occupancy, historical
  lineage, misunderstood rooms, and the bounded-place extension for manors/castles/other sites.
- A two-mode git close policy in `CLAUDE.md`, `AGENTS.md`, and both Genesis clean-close skill variants:
  proportional fast checkpoints versus the single full final/evening close.

**Changed**
- Purpose now gates a coherent whole-site roster without absolutely blacklisting rooms. The working
  affinity vocabulary is core/supporting/compatible/exceptional/conflicting; culture and history can
  make a sacrificial chamber native to a military fort.
- The clean-close skill no longer triggers for docs checkpoints, local-only merges, or explicit
  no-CI/no-push requests. Existing worktrees must be reused; genuinely new worktrees use
  `GIT_LFS_SKIP_SMUDGE=1` unless the task needs binary assets.

**Deferred**
- Wave 1 remains open at question 11; exact purpose profiles/weights, questions 12-20, and all
  follow-ups remain discussion work. No dungeon implementation is authorized.
- `FULL CI PENDING - Opus owns the next full gate`; Codex intentionally ran no CI and did not push.

## 2026-07-18 (later) — PROCEDURAL DUNGEON DISCOVERY: research corpus + direction captured [Codex]

**Added**
- `PROCEDURAL-DUNGEON-DIRECTION.md`: the accepted high-level room-compiler direction, open design
  forks, implementation boundary, and a twelve-wave discussion map with a strict closure gate.
- A deep technical research package: long-form synthesis, audited engine crosswalk, verified 22-page
  report PDF, nine primary-source PDFs, and a checksum/source index under
  `Reference/Procedural-Dungeon-Research/`.
- A three-option interim visual-engine comparison covering range-strip, schematic-board, and hybrid
  storyboard presentations.

**Changed**
- Recorded the procedural-room shift from independent decorative/structural rolls toward function-led
  recipes compiled through tile/slot legality, portal-first placement, assemblies, degradation, and
  persistent diagnostics—without authorizing implementation yet.
- Added Adam's verbatim interim-visualizer ruling to `ART-DIRECTION-CANON.md`: lighting, normal maps,
  useful existing sprites, and environmental beauty remain required even if the room view simplifies.
- Opened Wave 1 (Dungeon Function, History, and Strange Compatibility) in `NEXT-STEPS.md`; later waves
  cannot begin until all material follow-ups are exhausted and Adam explicitly closes the current wave.

**Deferred**
- No room compiler, table rebuild, walk mutation, renderer cutover, or final A/B/C visualizer choice.
- Push is deliberately deferred until Adam calls for the before-bed backup.

## 2026-07-18 — COME-HOME: repo back on the internal SSD + Git LFS live [Claude Opus 4.8, scheduled task]

**Changed**
- Repo migrated from the external `/Volumes/Genesis/Genesis` back to `~/Desktop/Work/projects/Genesis` (internal SSD). `git status` ~25 s → **0.16 s** warm. The external copy is left untouched as the cold backup (delete nothing there).
- **Git LFS adopted** (git-lfs 3.7.1). History rewritten via `git lfs migrate import --everything`; all binaries now globally tracked (`*.png,*.jpg,*.psd,*.mov,*.zip`, …). **6.3 GB / 11,222 objects on GitHub LFS** (of the 10 GiB free tier). The 134 MB `quarantine-pack/pre-unification/originals-r2.zip` push blocker dissolved into an LFS pointer; rewritten history force-pushed for all 122 branches (Adam pre-authorized). master `3aa59f88` → **`e5511e98`**.
- Launchers (`~/Desktop/Launchers/Open Genesis*.command`, Model QA, Light Lab) + `.claude/launch.json` rerouted home. After a fresh checkout, run `git lfs checkout` to smudge pointers to real content (the game needs it).

**Added**
- Cold shelf on Google Drive (`My Drive/Genesis Cold Shelf/`): Reference/*.pdf scans, quarantine-pack zips, faceted-harvest-2026-07-14, the sprite-r4 discarded round — restorable via `dev/cold-shelf/fetch-cold.mjs` (reads `dev/cold-shelf/manifest.json`). Reference/SRD-Data + _Index stayed in-repo.

**Deferred**
- ~8.5 GB orphan worktree dirs on `/Volumes/Genesis` (`…-spec.incomplete-20260716`, `…-kgr7-texture-readiness`, `…-kgr4c-promote`) left in place pending Adam's delete confirmation (possibly-unique generated art).

## 2026-07-16 — THE KENNEY-SOCKET WAVE LANDS + PIXEL-FIRST + the design meeting executed [Claude Fable 5, orchestrated]

The 2026-07-15 design meeting's rulings (DESIGN.md, three entries) executed end-to-end overnight.
Every unit executor-built, orchestrator-re-gated (harnesses re-run, every card READ), landed
--no-ff, pushed per landing.

**Added — THE KIT ENGINE:** all 16 Kenney packs banked · KS-1 donor adapter + THE SOCKET SCHEMA
(47 structural pieces normalized to the 5-ft grid; floor/butt-join/top/hinge sockets; three-card
bridge gate, all DIRECT_MODULATED) · KS-2 THE DOOR IS AN ASSEMBLY (kit frame + hinge-socket leaf;
4 states as hinge rotations; QF-D1 wall-run axis fix kills the sideways-frame "hollow column";
floating leaves structurally impossible) · KS-3 kit room shells (rect/octagon/L assemble from
socketed modules, mixed kit+prism legal, realm-graded, KIT_SHELL_ENABLED one-flag revert) ·
KS-3b look pass (the checkerboard floor was Z-FIGHTING — hull-on-flat-quad — killed; kit walls
join the camera-side cutaway; gate-door "defect" DISPROVEN honestly; corners ruled
prism-permanent on measurement).

**Added — CONTINUITY + LIGHT + ELEVATION:** F1 combat is a STATE of the explored room (ledger
#10 CLOSED; identical scene recipe across explore→fight→end on all 5 shapes; every combatant on
its own real cell — the stacked-invisible-rat fixed) · F2 staging-beat registry (ledger #11
CLOSED; shop_open/closed/long_rest/walk_complete micro-stages, stable ids, provenance-stamped,
zero boot edits) · LL-1 Stage-E mechanisms (exposure floor + emissive-masked bloom — the daylit
blow-out killed: 3.4%→0.0% clipped) + LIGHT-LAB (18 live tunables, export→fold round-trip;
parked dormant per Adam's Q11) + "Open Genesis Light Lab.command" launcher · ELEV-1 rolled room
elevation (Adam's d100 table live in Engine markdown; weighted roller + min-dims walk-down +
depth bias; shape-generic tiers ±3; ELEV-1b render-polish before-state banked).

**Changed — PIXEL-FIRST (Adam's sheets verdict):** the faceted flip RETREATED — registry
all-legacy, faceted = per-creature-re-admissible reserve; docs/ART-DEPARTMENT.md = the pixel
register's canonical home + regeneration runbook (CLAUDE.md mandate updated; ART-DIRECTION-CANON
carries the ruling verbatim) · MC-1+MC-2 magenta crud killed (148 fleck-cleans + 372
hole-punches adjudicated against originals; cloud class verified clean by eye; PC lane + 33
orig-unavailable slugs deferred to eyes) · flip-verdict sheets (21, all 252 pairs) + faceted
mismatch audit (206/252 sound; two pipeline bugs — r3a off-by-one file-save + 4 byte-dup PC
files; 22 salvageable by re-cut) · the washout evidence stack (PAL-AB + retina card 4): palette
quantization = hue-specific loss (blue dragon −47% sat) AND manufactured magenta from blue
(djinni); AgX = dominant chain lever. **Adam's originals restoration ruling PENDING — one word.**

**Fixed:** F1 harness red-first baseline pinned (the HEAD-staleness class, 3rd occurrence — now
a named pattern); stray root-tree palette regen reverted (lane violation caught by the dirty-file
check).

**Deferred:** KS-3c sawtooth on far-wall top rims (same hull class, orchestrator-flagged) ·
ELEV-1b risers/stairs + gallery/chasm seam gaps · rest-prop collision-awareness · occlusion-aware
combat cell pick · LL-1b light-lab live-replay for 2 tunables · the proving run + playtest (next
wave head, per the meeting).

## 2026-07-15 (later) — THE VQ2/FLIP PASS: Sol's laws folded · THE SPRITE FLIP LIVE · the demand census + ledger [Claude Fable 5, orchestrated]

Adam's directives (VQ2 as suggestions-for-law · sprite flip w/ v3 reserve · faceted inventory ·
gameplay rounds → demand-vs-null · extrusion plan · re-spec + orchestrate) executed end-to-end.
Re-spec = `docs/VQ2-RESPEC.md` (Sol dispositions §1 + Waves S/L/F/X); every unit executor-built in
an isolated worktree, orchestrator-re-gated (harnesses re-run personally, captures READ), landed
`--no-ff`, pushed per landing.

**Added**
- **WAVE S COMPLETE — THE SPRITE FLIP IS LIVE.** S1 faceted corpus landed (419 candidates, F2–F15
  packets) · S2 `build/cut-faceted.py` (252 figures cut to `assets/sprites-faceted/`, 47 loud
  skips; multi-cell splits via provenance `cells[]`) · S3 B1 standee contract + admission schema +
  the tags/heights INVENTORY (`faceted-inventory-report.json`) · S4 bestiary-id map join
  (`SPRITE_BY_BESTIARY_ID`, ledger P0 #1 class killed) + 60 orphan fold-ins (registry 4316→4376,
  252/252 joined) · S5 THE FLIP (252 `runtimeAdmitted:"candidate"`; `FACETED_FLIP_ENABLED` =
  one-flag revert; `assets/sprites/` v3 = untouched reserve) · S6 sprite editor serves faceted,
  legacy-vs-candidate side-by-side, editable `feet` (overlay > measured > band-default ladder).
- **WAVE L COMPLETE — the demand instrument exists.** L1 rig extensions (the bot FIGHTS ·
  transition camera · shop-render verdict · record-less settlement leg · `--force-realm` ·
  `--route`) · L2 the census (5 seams instrumented, `census.json` per run, byte-identical-render
  proof) · L3 **PL-4: 4 realms × routes, 96 shots, 65/65 legs → `dev/play-lens/DEMAND-LEDGER.md`**.
- **B3 standee acceptance gallery** (core-three × light × yaw + flip pairs) — the P3-2 Stage B
  taste artifact; **X1** extrusion spec + pilot artifacts landed (EXTRUDED-SPRITE-PROP-LIBRARY +
  proofs + 42 library GLBs).

**Ledger verdicts (PL-4, evidence-graded):** P0 #2 vanishing-PC **FIXED** (9 frames, 3 realms) ·
P0 #1 rat-miscast **NOT-REPRO/reclassified** (faceted texture resolves every time; the rat is
lane-STACKED invisible — F1 side-effect expected) · **null-facade root cause found**: settlement
mint always degrades to realm key `frontier` which `REALM_TEXTURES` never defines (key-routing
bug, not just missing art) · **shop panel never renders under the battle stage** (new wiring gap;
chip filed) · 21 NPC role-portrait slugs = the measured art-packet demand list · daylit Large-
creature blow-out across all realms (B3) = Stage E evidence.

**Changed** — DESIGN.md 2026-07-15 entry (Sol dispositions + the flip ruling); NEXT-STEPS new
Do-next; Sol's P-A..P-F folded per §1 (P-A gates→Stage E; P-B/C/D/E/F → F-wave units; cut list
wholesale).

**Deferred** — F1 combat-in-room + F2 staging beats (specced, next session's top; now with
sharper evidence) · B2 physical standee + B4 kill size-inference (B2 is Adam's B3-gated taste
build) · r*-v2 return dirs (56 files) unprocessed pending ruling · 21 fantasy orphan heights =
`missing` (Adam's editor pass) · gloom/chrome faceted tranches (all 252 candidates are
fantasy/pc).

## 2026-07-15 — THE AUTONOMOUS ARC: quick-fix wave + ENV/EXTERIOR (daytime · sun/moon · biomes · town) + PL-3 [Claude Opus 4.8, autonomous per Adam's delegation]

Adam delegated ("take your direction on the wave order, work autonomously"); the ledger ordered the
waves. Every unit orchestrator-re-gated (own harness runs, every card READ + shared in-chat per
Adam's ask), landed `--no-ff`, pushed. Master tip `c0a60b77`.

**Fixed (QUICK-FIX WAVE, ledger P0):**
- QF-B: the "wireframe cage" = buildWebMass (spider web, baked ghost-silk vertex colors) reused as
  placeholder for ~15 props → luma-preserving `retint` authored in realm-props.json (generator-
  threaded); head-clip + arrival-blob shared one root (tabletop camera carried no figure height) →
  TABLETOP_CAMERA_HEADROOM. QF-A: class-wide scoping bug — the active-room render mounted the WHOLE
  plan's doors+dressing in the current room's frame (also explains ledger P2 #14) + the door
  cell-pick could land on the neighbor's paired entry; 8/8 rooms now at the 0.5u wall offset.
  Rat-miscast + vanishing-PC honestly could-not-reproduce (leads documented; lens re-tests).

**Added (ENV/EXTERIOR WAVE — Adam's "we don't even have daytime! or a town scene", measured then built):**
- **ENV-1 light profiles differentiate everywhere** (root: void tint env-keyed never profile-keyed +
  STAGE_AMBIENT_FLOOR clamping; daylit-vs-moonlit luma 0.0254 → 0.528; TABLETOP_EXTERIOR_LOOK = the
  re-tune table). **ENV-1b cast shadows on the tabletop** (Adam's ruling; the fake "no shadow maps"
  law retired — see DESIGN.md 2026-07-14; darkening 0.154 proven; fps floor ~660). **ENV-1c the
  sun and moon MOVE** (Adam's ruling; continuous clock → celestial arc; key travels 11.25u dawn→noon,
  shadows flip sides morning/dusk; CELESTIAL_ARC keyframes; manual 3-way merge composed with ENV-3 —
  towns carry the clock). **ENV-2 travel legs project their ROLLED biome** (wild-walk already rolled
  one per leg — the tray discarded it; BIOME_DRESSING 10 biomes → existing-asset pools; ground-map
  fix for Deeplands/Underwater; the "missing PC" = arrangeTableau centering (0,0) on corner-anchored
  boards). **ENV-3 the settlement tray** (root: settlements deliberately bind no place record →
  fell to idle; nodeIsSettlementKind routes them; diner-class proven untouched) + **ENV-3b the
  composition** (orchestrator bounced round 1: monolith cubes/maze camera/fused lots/toast/mirrored
  cards — all 5 root-caused, incl. one race with two symptoms: the async art-arrival replay dropped
  the height-fit AND rebuilt cards unfaced).

**PL-3 (the composed-stack lens re-run):** same route, 26 shots, 0 breaks — **6 ledger items
verified FIXED in real play** (travel biomes under a morning sky; the PC casting a morning-direction
shadow; profiles distinct; PC centered/framed; no wireframes; arrival real). Deltas appended to
dev/play-lens/ledger.md.

**Deferred / Adam's red-pen packet:** facade art (doors/windows/roofs) + NPC card art (ImageGen/kit
lane) · daylit soft-shadow + arc keyframe tuning (one table each) · Stage E exposure/bloom (next in
ledger order) · combat-leg delta read next audit · town lens-read at a record-less settlement node.

## 2026-07-14 (later) — STAGE D STATEFUL NOUNS + AgX LIVE + the door package + PLAY-LENS [Claude Opus 4.8, orchestrated]

The evening block: the whole Stage D spine, AgX as the production look, the door package driven by
Adam's live taste rulings, and PLAY-LENS — the bot-play visual audit that now ORDERS the waves.
Master tip `67566b6a`, all pushed. Every unit orchestrator-re-gated (own harness runs, frames READ).

**Added**
- **STAGE D — STATEFUL NOUNS, complete (D0–D4)**: `state_transition` at the contract boundary (D0,
  fuzz 0/530) · `data/interactables.js` registry `slug@state` + extrudeDepth/location/renderStrategy
  authoring (D1) · `plan.interactables[]` walk binding, raw segment byte-canon (D2, 89/0) ·
  ROOM-GRAMMAR placement ALIGN/PAIR/FOCAL/RHYTHM/CLEAR-last (D3, 38/0) · the DOORS-FIRST keystone
  (D4, 61/0 + 102/0): trayFrom wiring (WIRING LAW closed), persisted state in the prep node (a door
  opened last turn STAYS open), shaped-aperture stateful door on the BW4 tween + MF-2 crossfade.
  D0+D1 integration cross-check caught a real fixture red (lexical-const shadowing) — fixed red-first.
- **The door package (Adam's rulings)**: D4b hinge-edge axis (jamb pivot, deterministic side; broken
  grounded) + the PRODUCTION apron fix (dpPlaceRoom dressing could legally squat in doorways — the
  vine-arch bug, harness-locked) · D4c broken-variant family {flopped, hanging, shattered} — seeded
  visual flavor inside ONE contract state (202/0) · D4d doorframes are FRAMES (2 slim jambs + header;
  old geometry proven a light-proof column via stash A/B; bw2-5 fixtures synced honestly, 110/0).
- **P3-3a AgX filmic tone-curve**: verbatim three r166 GLSL in makeGradePass behind GRADE_TONEMAP;
  none≡master proven byte-identical; A/B set shot on the eyeball fixtures; **Adam ruled "agx looks
  awesome" → default FLIPPED live** (baseline pinned to 074cf05d so the proofs hold forever).
- **PLAY-LENS (Adam's direction)**: `dev/play-lens.mjs` — the bot plays a REAL 14-leg session
  (TIYL → settlement → 7-leg travel → 7-room dungeon + combat + live state_transition → shop →
  rest), 26 shots; PL-2 audit (3 vision auditors + synthesis) → **`dev/play-lens/ledger.md`** ranked
  BROKEN/UGLY/MISSING/WORKING. Standing law: the lens re-runs after every visual wave.

**Ledger verdict (the new wave order):** 1) QUICK-FIX (rat-as-humanoid casting bug, PC token vanishes
in combat rounds 2–3, door leaves unanchored in real rooms, wireframe fallback, degenerate arrival
frame, tray head-clip) → 2) ENV/EXTERIOR (all 6 travel legs are an empty plane; daylit≡moonlit≡
overcast pixel-identical — light profiles unwired outside interiors; no town tray) → 3) Stage E
exposure/bloom → 4) combat-in-room + staging beats → 5) P3-2 (auto-fires when sprite-QA lands).

**Changed** — loop-gate evidence refreshed on today's stack (5/5 clean, AgX + open dioramas).
**Deferred** — shattered shards have no prop-avoidance (2/3 occluded in the card — taste-pass item);
PL-1b rig improvements (bot should fight; transition captures focus the right room; shop-panel check).

## 2026-07-14 — PHASE-3 WAVE-1: no-spend visual wave + diorama cutaway restore + repo migration [Claude Opus 4.8, orchestrated]

Phase-3 Wave-1 executed as background worktree-isolated Sonnet executors, each personally re-gated
(harnesses re-run by me, visual units' PNGs READ, never self-report), landed `--no-ff`. Master tip
after the wave: `a23d2eb2`.

**Added**
- **P3-1a Poisson dressing** (`src/engine/place-distribution.js`, `placeDistribute`) — seeded
  Poisson-disk realization of incidental floor dressing behind `ROOM_PLACE_DISTRIBUTE=false`
  (byte-identical until a follow-up flip). 27/27 (5 red-first), dungeon-dressing 655/0, interior
  287/0, active-room p95 0.53ms.
- **W0-c Open5e cross-check** (`build/sync-open5e.py`) — read-only SRD-Data validator vs Open5e
  `srd-2024` (339/339 name join, 223 representation-format field diffs surfaced); NEVER writes SRD-Data.
- **E0-1 wall-fixture occlusion-fade** — wall-mounted practicals fade with their occluded wall
  segment (per-wall-mount body-material clone; append into the `ownerSegIndex` fadeEntry, never
  overwrite). 32/0 + 3-way isolation proof; capture confirms suppressed torch dims, non-suppressed
  stays lit. (Grew from a P3-1d out-of-scope finding.)
- **P3-1e eyeball fixtures** (`dev/battle-gate/eyeball-fixtures/`) — legacy-vs-oss capture pairs
  (tiered / aperture / dressed room), same scene/camera/crop taste-gate set; frames READ (tiers
  render under both kernels — a staging gap, not a code defect).
- **P3-1b depth-state audit** (`dev/audit-depth-state.mjs`) — four-yaw oss capture + material census;
  PROVEN defect table EMPTY (renderer transparency clean), one latent wall-upper condition flagged for P3-3.

**Fixed**
- **P3-1d diorama cutaway restoration** — compiled rooms read as OPEN dioramas again, not closed
  boxes (the C4.1b regression). Camera-side wall-upper band suppression restored via
  `itrOcclusionClassify` (`wallUpperCameraSideBlockingSet`, `theater-shot.js`); occlusion subjects
  extended anchors→all mounted figures (`OCCLUSION_SUBJECT_CAP=24`, loud warn). 14/14 red-first,
  wall-occlusion 23/0, theater-shot 107/0, interior 287/0; before/after loop-gate PNGs READ.

**Changed**
- **CI scoped to master + PRs** (`.github/workflows/ci.yml`) — a blanket `on: push` (all branches)
  turned a `git push --all` backup into ~100 failing CI runs (inbox flood); branch backups no longer
  each trigger a run. Cancelled the active runs; deleted 81 junk `worktree-*` branches from origin.
- **Repo migrated to an APFS sparsebundle on the Work Drive** (`/Volumes/Genesis/Genesis`) — off the
  97%-full boot drive. exec bits preserved (git clean, no fileMode churn), all branches + Cowork
  memory carried over, verified (check-manifest OK, harnesses green, app serves). Launchers +
  `.claude/launch.json` rerouted; old copy removed (corrupt zip discarded — origin is the backup).
- **P3-2 Stage B teed up** (`docs/PHASE-3-WAVE-2-SPECS.md`, B1–B4) — GATED on sprite-QA registry
  coordination (B1 regenerates `sprite-registry.js`).

**Deferred**
- W0-b PRNG dedup — real surface is 20+ harness files, not 3; re-scope before executing.
- W0-a struck — MF-3b hit-stop already shipped in BW4B (`17474b45`); wave plan listed a stale unit.
## 2026-07-14 — Faceted regeneration: generation complete (fantasy realm), canon promoted, salvage + QA

**Added**
- `dev/model-qa/faceted-sheets/` — the sheet-doc batch architecture that replaced the F-packet lane
  format: STYLE-CANON.md (Adam's verbatim art direction + decal exemption + prop canon), SHEET-TEMPLATE,
  refire/redo batch docs, 15+ session prompts, qa-ledger.json (510-file QA verdicts).
- ~650 raw candidates committed across rounds 1–3 + P/T-series: all 901 figure identities minus a
  10-identity gap-fill (`session-prompts/gapfill-final.md`, fireable), 56 fx + 43 decal masters
  (3 sets incl. condition/trace library), 20 extrude item props, 37 dressing components (construction-
  class routed), 20 icons, 375-item universe (15 sheets), 10-slot floor/wall/trim/face tileset.
- `salvage-2026-07-14/` — 149 disk-only sprites rescued from broken F10/F11/F7/F3 worktrees.
- Master (via merge 8a1eb3c4): `docs/ART-DIRECTION-CANON.md` + `docs/FACETED-ART-REGENERATION-
  PRODUCTION-PLAN.md` + `docs/FACETED-SHEET-TEMPLATE.md`; CLAUDE.md + AGENTS.md both mandate them
  (the Claude/Codex shared-authority fix + decision-capture rule).

**Changed**
- Decals are naturalistic surface marks, never triangulated (Adam's ruling, in canon).
- Props: per-state door/lever/trap generation dropped — §4.1 kit contract enforced (isolated
  components; engine owns states); §7 master prop prompt restored un-shortened.

**Fixed**
- F2–F15 audit: F3/F7 fabricated returns, F4/F8 misrouted content, F10/F11 lost to worktree
  corruption — all salvaged or re-fired; 5+1 crop rejects quarantined (`crop-rejects/`).
- Volume swept: 20 stale worktrees/dirs removed after salvage; every sprite now lives in git.

**Deferred**
- Gap-fill session (10 identities) → then Step-E → slice → §9 admission → Adam's sprite-review
  height pass (5179) → registry regen → engine swap of the 896 pixel sprites.
- 88 procedural realm-surfaces vs textured floors decision; 11 other realms (~3,420 refs); kit-sheet
  K1 QA (11 alpha-passed sheets on codex/extruded-prop-pilot).

## 2026-07-13 (later) — OSS adoption research pass + Phase-3 brief + oss stabilization evidence

Closed out the geometry-flip session. Adam asked whether Genesis is "rebuilding the wheel" on open-source;
answered with a three-agent research pass (reference data · three.js graphics · procgen/infra).

**Added.**
- **`docs/PHASE-3-DIRECTOR-BRIEF.md`** — Fable's handoff into Phase 3 (flip evidence, a linked path to the
  full Codex plugin-rec suite + plan, GP-2..4 terrain, the oracle/spend calls that are his, and a
  smallest-correction-first recommendation). Now with a **§6 OSS-adoption findings** table folded in.
- **Loop-gate captures regenerated under the oss default** (`dev/battle-gate/dungeon-loop/`) — 5 real
  dungeons + combat, 5/5 clean, 0 breaks; the committed evidence for the §15 stabilization hold. (The
  oss PNGs are notably *smaller* than the legacy ones they replace — consistent with the Δ−286-triangle
  perf finding.)

**Findings (headline: mostly NOT rebuilding the wheel).** Genesis already adopted the non-obvious infra
(IndexedDB via `store.js`; vendored earcut/polygon-clipping/clipper2; the Codex graphics pin-table), and its
bespoke systems are correct-by-design (script-owns-rolls, no-stored-terrain, band×lane combat; `postprocessing`
already correctly rejected). Four genuine adoption candidates surfaced, detailed in the brief §6:
(1) **`@three.ez/instanced-mesh`** (MIT) for the unbuilt/bespoke R3 sprite-atlas instancing — the big one,
Fable's Phase-3 call; (2) **Open5e `srd-2024`** (CC-BY-4.0) as a build-time cross-check for the PDF-parsed
`Reference/SRD-Data/`; (3) **AgX tone-curve** (free, already in vendored three) for the grade pass;
(4) dedup a triplicated test-seed PRNG into `dev/lib/prng.mjs`.

**Deferred.** Fable weighs in on Phase 3, potentially expands/orchestrates the next waves. All four adoption
candidates are recommendations, not decisions.
