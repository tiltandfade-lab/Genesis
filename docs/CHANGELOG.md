# Genesis — Changelog

All notable changes to Genesis, newest first. Started 2026-06-21 (earlier history lives in `DESIGN.md` and git, not backfilled here). Add a dated entry each working session; group changes under **Added / Changed / Fixed / Deferred**.

**Auto-archive rule (2026-07-09):** this file keeps the newest 25 entries; older ones roll into
`CHANGELOG-ARCHIVE.md` via `python3 build/archive-docs.py --emit` (run it at session close when
`--check` complains). The two files read as one continuous newest-first history.

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

## 2026-07-13 — GEOMETRY DEFAULT FLIPPED legacy→oss (§15 step 8) + stabilization hold opened (orchestrated)

Adam **delegated the flip verdict to Claude conditional on sound pre-flip evidence** ("run the pre-flip
evidence wave, then if evidence is sound, authorize the flip, and continue fleshing out all visual
engine changes as specified"). Branch `feat/geometry-oss-flip`, landed `--no-ff`, gates re-run by me.

**Changed.**
- **`ROOM_SHELL_POLYGON_KERNEL_FLAG` (theater-boot.js) `legacy`→`oss`** — production now renders the
  PolygonKernel floor + aperture-delimited wall-run path (G1/G2/G3). The module-level
  `ROOM_SHELL_POLYGON_KERNEL` const (theater-room-mesh.js) **stays `legacy`** as the bare-call/dev
  fallback, retaining the legacy path for the §15 step-9 stabilization hold; the flag is still
  seam-settable back via `window.Theater._setRoomShellPolygonKernel`.

**Added.**
- **`dev/capture-oss-integrated.mjs`** — filled OSS §15 promotion steps 6–7 (the only genuine pre-flip
  gap; F1 outside-low grazing capture + F2 5000-room gap/provenance fuzz already existed and re-gated
  green). Boots a real in-session room, mounts it under legacy then oss at the product camera, reads
  `renderer.info` full-chain draw submissions + resource census. Output committed to
  `dev/oss-integrated-shots/` for review.

**Evidence (all re-run/read by me).** Numeric: verify-wall-runs-oss **92/0** (corner gap 0 at
stem/cap/footing, both cap lips, 100% provenance), verify-wall-runs-oss-fuzz over **5000 randomized
rooms** (zero join-gap, full segment provenance, acute-bevel + red-first negative control),
verify-geometry-fixtures **28/0** (7 legacy defects fixed, 0 regressions), room-shell parity **48/0**.
Visual: outside-low grazing — oss closes the corner with a continuous mitered cap lip; product-camera
integrated — oss ≡ legacy at the player-visible shot. Perf: draw calls **Δ0**, triangles **Δ−286**
(oss cheaper), geometries/programs **Δ0**, textures **+2** one-time. **Full 197-harness sweep: 4 reds,
ALL verified pre-existing on master** (verify-{room-shell-render,diegetic-light,occlusion-fade,
gallery-pass} — render-flake/CI-auto-skip, fail identically pre-flip). check-manifest OK.

**Deferred.** §15 step 10 (remove the legacy triangulation path) waits until the stabilization hold
passes with no rollback-worthy defect. Phase 3 (GP-2..4 visual production) now rides on the flipped
geometry, gated on Codex research + charter tool-adoption/spend gates.

## 2026-07-13 (overnight) — GRAPHICS CONVERGENCE: wall-volumes wave + Phase 0/1/2 geometry (orchestrated)

Codex researches, Claude orchestrates (`docs/GRAPHICS-CONVERGENCE-CHARTER.md` governs; execution spine
`docs/GRAPHICS-CONVERGENCE-PLAN.md`). 14 units, each personally re-gated (harnesses re-run + captures
READ, never self-report), landed `--no-ff`. Master tip after the run: `4da62a9d`.

**Added.**
- **Wall-volumes wave** — C4.1a wall volumes + Phase-0 octagon miter · C4.1b segment ray-occlusion ·
  E0 physical practicals (glow-disc retired) · C4.1c floor+riser congruence.
- **Phase 0 instrumentation (dev-only)** — R0 pinned tool bootstrap (`dev/geometry-tools/`) · G0 52
  ground-truth fixtures + injected-adapter harness (row-101 sunken-collapse red-first) · R2 fast-check
  fuzz · R3 webgl-lint/Spector diagnostics · R4 pixelmatch capture-regression · GP-1 GPU telemetry +
  material census.
- **Phase 1** — R1 four-path geometry bakeoff → ruling (`dev/geometry-research/bakeoff/ruling.json`):
  floors = polygon-clipping + Earcut; walls = clipper2-ts Strategy-A offset; clipper2 booleans + its CDT
  triangulator rejected (CDT silently wrong, reproduced). Measured a real ~0.31u corner-gap defect.
- **Phase 2 (behind `ROOM_SHELL_POLYGON_KERNEL = legacy|oss-compare|oss`, DEFAULT legacy)** — G1
  `src/ui/geometry/polygon-kernel.js` + vendored earcut/polygon-clipping (fixes 7 legacy floor defects,
  0 regressions) · G2 floor integration (oss unions+triangulates-with-holes; row-101 3-tier hole
  recovered; F08/F11 corrected) · G3 aperture-delimited wall runs + vendored clipper2-ts (corner gap
  0.3111u→0 at stem/cap/footing separately, 100% provenance, 0 unintended joins; verify-wall-runs-oss 71/0).

**Changed.**
- Fixed the incorrect "never a gap" comment at `theater-room-mesh.js:904` (per SOL — the per-segment
  construction *does* gap at ordinary convex corners).

**Deferred (Adam's morning decisions — both change the DEFAULT render).**
- negative-`sy` fix (`theater-boot.js:8888` `f.sy > 0` → `isFinite`) so sunken arenas render sunken
  (red-first in G0, promoted `geo-regression-be825c9cc76b` in R2) — parked tier-height domain.
- Flip the geometry default `legacy → oss` after a stabilization hold (OSS §15); optionally broaden G3
  fuzz + shoot an outside-low grazing capture first.

## 2026-07-12 (later) — STAGE C: REAL ROOM SHAPES — rooms stop being rectangles (C1/C2/C3/C3b, orchestrated)

**The wave.** `docs/STAGE-C.md` (GRAPHICS-NORTH-STAR Stage C) — consume the walk's rolled
`areaType/dims/side` (previously discarded by `spatializePlan`) into real room geometry feeding the
landed C4 room-shell compiler. Stacked pipeline, each unit personally re-gated (harnesses + **captures
READ by the orchestrator** + the loop gate on real dungeons) and landed `--no-ff`. Master tip after the
wave: `388a4c7b`.

**Added.**
- **C1 SIZE FIDELITY** (`0ab01533`) — `dspDimsToCells` parses `segment.dims` (feet/5, clamp `[4,24]` =
  the real d200 ceiling) into the room footprint behind `SPATIAL_SHAPES` (default ON); the two `rng()`
  draws stay in sequence so determinism + the missing-dims fallback are byte-identical. A "60×60 Grand
  Octagon" is now a 12×12 room, not a random 4–7 rect.
- **C2 STRUCTURAL TERRAIN** (`06d31fb8`) — parses `segment.side` prose (raised/dais/platform → +1,
  sunken/pit/pool → −1) into a `plan.tiers` buffer; `interiorBuildBoard` folds the tier into per-cell
  `sy`, feeding the compiler's riser render (finale-dais still wins). Placement via a separate hash
  chain, never the rng stream.
- **C3 REAL SHAPES** (`bfb5a49f`) — `shapeForArchetype` → `rasterizeShape` emits non-rect FLOOR cells
  (rotunda→circle, octagon, oval→ellipse, L/T/cross, cave) + `rooms[].shape/cells`; exits derived from
  the polygon boundary faces (`door.toSeg` binding). `interiorBuildBoard`'s rect-assumption loops now
  iterate the room's actual cell set (byte-identical for rects). Behind `SPATIAL_SHAPES`.
- **C3b CLEAN GEOMETRY + cellTriangleMap ROOT FIX** (`388a4c7b`, Adam's "half shapes" catch) —
  render-only in the C4 compiler (logical cell grid byte-identical, so combat/determinism untouched):
  circle/ellipse vertices pulled toward the fitted ellipse (roundness deviation 0.099→0.006, ~15×);
  octagon/L/T/cross staircase runs chamfered to true **45° diagonal wall faces**. PLUS the pre-existing
  `cellTriangleMap` dropped-cell bug fixed at ROOT: a nearest-triangle fallback (point-to-triangle
  distance) so no floor cell is ever left unmapped for any shape (bare octagon 76/76, was 74/76).

**Also landed (same session).**
- **Codex sprite-implementation-strategy** (`74848a3a`, Adam-directed) — the per-asset `renderStrategy`
  pipeline + decal assets + map/figurine vision-quest docs, committed by this session to clear the
  shared `theater-interior.js` so Stage C could land; verified green first (dressing 655/0).
- **`AGENTS.md`** (`22807504`) — the Codex/agent onboarding front door (auto-loaded like CLAUDE.md);
  points to CLAUDE.md + the reading order + the parallel-session/worktree discipline.

**Fixed.** The C3-shapes taste call surfaced on real pixels: Adam ruled land-then-refine, and C3b's
diagonals + round rotundas closed it; the `cellTriangleMap` float-epsilon drop (render/hit-test only,
never combat) fixed at root with a red-first regression (`verify-room-shell` check 8f).

**Battlefield note.** Combat is unchanged — cells are included by cell-CENTER coverage (already true in
C3), so the partial/half-cell shaping lives entirely in the wall mesh; a mini stands on its full cell,
the wall clips its corner on the diagonal/curve (FFT-style).

**Gates (all personally re-run).** verify-stage-c-size 25/0, verify-stage-c-terrain 49/0,
verify-stage-c-shapes 88/0, verify-stage-c3b-circle-smooth 43/0, verify-room-shell 32/0,
verify-dungeon-interior 287/0, verify-combat-cells 13/0, verify-dungeon-walkbind 20/0,
verify-dungeon-spatialize 9/0, check-manifest OK; loop gate 5/5 on real dungeons at each unit; captures
READ (octagon diagonals, round rotunda, L notch).

## 2026-07-12 — WALK-NATIVE BOUNDARY + STAGE A CLOSED: the composed camera goes live (4 units, orchestrated)

**The wave.** `docs/WALK-NATIVE-A.md` — Adam ruled "build Codex's walk-native boundary first, then
A3." Executes Codex's walk-native amendment (`WALK-NATIVE-DIORAMA-CONTRACT.md`) as the prerequisite
to wiring the dormant A2 ShotPlan, then closes GRAPHICS-NORTH-STAR Stage A. Four background Sonnet
executors in isolated worktrees, each personally re-gated on its branch tip (captures READ by the
orchestrator, never self-report) and landed `--no-ff`; WDV-1 ∥ WDV-2 first, then A3 off WDV-1, A4
off A3. Master tip after the wave: `00b775f8`.

**Added.**
- **WDV-1 `walkSceneFrom`** (new pure module `src/engine/walk-scene.js`, owns `walkSceneFrom`) —
  Codex's anti-drift boundary: consumes the stored walk + active segment + overlay + spatial + live
  state and classifies every walk fact into visual roles (structure/connection/surface/practical/
  citizen/interactable/dressing/condition/atmosphere/hidden/trace) each with field provenance
  (`sourceRef {walkId,segmentNum,fieldPath,tableId,roll}`). **Wraps** the existing card-dealer
  (`walkSceneProjectionFrom`) — never re-deals or re-rolls. `trayFrom` stamps `board.walkScene`
  (additive; `board.projection` kept). Pure — no THREE/DOM/RNG/world-writes. 32/0, three checks
  (provenance completeness / atmo isolation / hidden gating) red-first proven; raw-immutability +
  determinism + graph-fidelity green.
- **WDV-2 stamped provenance** — `walkPickStamped(tableId,...cols)` + a `segment.rollRefs` sibling
  map on the graphics-critical tables (area/feature/dressing/door/light/object/scene/sceneFrame/
  signOfPassage). Byte-additive: every existing field shape identical (the same single roll is
  reused, no second roll). Optional `provOut` params on `dwalkDoorRoll`/`walkPickInteractable` for
  door/interactable provenance. 34/0, byte-compat red-first proven.
- **A3 shot-compose** — **the composed camera is now live in production.** `setInteriorBoard` builds
  `shotPlanFrom` + `composeShot` and drives the composed camera behind `ITR_SHOT_COMPOSE` (default
  ON, focusRect fallback). New scratch-`THREE.Camera` 2-arg projector (`shotProjectFor`) for
  composeShot's multi-pose scoring. `shotPlanFrom` consumes `tray.walkScene` for anchors/provenance
  (+ `walkRef/segmentRef/fieldRefs/register` on the ShotPlan). Framing crops to the action cluster
  via the `interiorCameraFitFor` beat branch — medium standee **0.208** frame height (Stage-A gate
  0.18–0.25), tighter than the focusRect fit's 0.134. 29/0 incl. a red-first figure-height check.
- **A4 dynamic occlusion v2** — blockers from the live `ShotPlan.occlusionTargets` (walls/pillars/
  furniture); per-instance ghost + own material (never a shared batch); named consts (upper opacity
  **0.08** [0.05–0.10], stem **0.18u** [0.12–0.25], fades 150/220ms, hysteresis 3°) replacing the
  flat 0.2; tween on the MF-1 channel; interruption-safe retargeting + reclassify hold.

**Changed.**
- Stage A is CLOSED: the interior no longer fits the raw room rect — it composes on the action
  cluster and occludes dynamically. Frames `04`/`11` approximated, read as staged encounters.

**Fixed.**
- **A3 round-1 framing regression, caught at the capture gate** — the first A3 build re-centered the
  cluster but zoomed *wider* (medium standee ~0.13, void-heavy). The orchestrator read the PNG,
  flagged it, and a bounded corrective (`fitFromComposedShot` crops the action-cluster extent via the
  proven beat branch instead of the composed camera's full frustum half-height) landed it at 0.208.
- **A4 tapered-column occlusion aliasing** — a column's shaft + cap share one `(x,z)` cell; the
  occlusion id aliased them onto one fade-state so the wrong instance faded. Fixed by folding `yBase`
  into `itrOcclusionIdFor`.

**Fixed (occlusion-fade hotfix, same day — merge `07d2f733`).** The two pre-existing render-only
reds A4 surfaced (both verified pre-existing on master 46289a45, auto-skip in CI) — fixed at the
root, not masked:
- Ghost bloom halo: the occlusion ankle-**stub** (no shadow/AO) tripped UnrealBloom in dark rooms →
  darken JUST the stub's own per-instance color (`itrScaleHexValue`, the `ITR_ROOM_SHELL_RISER_DARKEN`
  convention), scoped to occluding instances. `verify-occlusion-fade` 39/1 → **40/0**; harness
  assertion untouched (code-only fix).
- Doorframe classify gap: doorframes (+ BW2-5 arch-header prisms) were never wired into the occlusion
  classify pass → wired into the SAME per-instance `itrOcclusionClassify`+ghost pattern. Also found +
  fixed a real harness bug (checks read raycasts against the stale pre-MF-1-tween camera →
  `settleCameraTween`) and, after instrumenting 100 seeds (0 over-fires), replaced check 32's unsound
  seed-lottery `anyFullHeight` with a **constructed control (32b)** — an ON-sightline pillar stubs
  while a self-checked OFF-sightline control stays full. `verify-bw2-1b --with-render` 39/4 → **49/0**.
- **Stage-A production diff reviewed clean** (low-effort Opus pass over WDV-1/2 + A3 + A4 + hotfix):
  no correctness bugs; walk-native project-only law, A3 fallback safety, scratch-camera non-leak, A4
  determinism all confirmed. Two non-blocking awareness notes on record: `feature` cards fold into the
  citizens lane as `living:true` (framing-only, never rendered); `walkSceneFrom` re-runs the projector
  with a single-room plan.

**Deferred.**
- Codex's WDV-3 (table visual metadata), WDV-4 (overlay/state key unification), WDV-5 (cross-env
  diorama gate) remain as the later walk-native recommendations (`WALK-NATIVE-DIORAMA-CONTRACT.md`).

**Gates (all personally re-run by the orchestrator).** check-manifest OK; verify-walk-scene 32/0,
verify-walk-stamped-provenance 34/0, verify-shot-compose 29/0, verify-occlusion-fade (render;
1 pre-existing pixel red), verify-theater-shot **107/0** (94 + 13 new WalkScene checks),
verify-dungeon-interior 287/0, verify-mf1-camera-tweens 24/0, verify-interior-camera-frustum 14/0,
verify-walk-card-projection 29/0, verify-bw2-1b (jsdom) 24/0. Capture PNGs READ: A3 after-composed
reads as a staged diorama (void gone); A4 on/off shows the pillar fade to reveal the standee behind.

## 2026-07-11 — BW4 MOTION & FEEL: the stills became footage (4 units landed, hit-stop wiring deferred to MF-3b)

**The wave.** BEAUTY-WAVE-4 (docs/BEAUTY-WAVE-4.md) — the space between verbs. Orchestrated as
4 background Sonnet executors in isolated worktrees, each personally re-gated on its branch tip
and landed `--no-ff`; MF-1 first (gating — everything is judged through the camera), then
MF-2/3/4 in parallel off its tip.

**Added.**
- **MF-1 CAMERA TWEENS** (`c067276a`) — beat/room/move-step camera refits glide position+target
  over 320ms ease-out instead of snapping; interruptible retarget from the live interpolated
  pose; player zoom/rotate stay instant (Feel Law 3). Reuses the `S.tweens`/`tickTweens` channel.
  The executor found+fixed two real interruption bugs (preview `placeCamera` snapping;
  `drainTweens` force-completing) by capturing the pre-fit pose at the top of `setInteriorBoard`.
- **MF-4 TURN & ROUND PRESENTATION** (`f606d14b`) — acting-ring 300ms slide between single-actor
  handoffs (instant path kept for every other shape); round header 250ms dip-and-return + chip
  strip single pulse off a one-shot `GS.cmbLastRoundSeen` flag (mirrors `cmbDamageFlashed`); VP5
  damage floater 60ms pop-in scale. Transform/opacity only — no reflow storms.
- **MF-3 IMPACT FEEL — mechanism** (`3a245c6b`) — hit-stop freeze (attacker+target verb tweens
  stall `t` at contact; world + camera-pose tween keep ticking, doubly guarded against freezing
  an `isCameraPoseTween`), directional recoil, crit white-flash + 2px single-bounce camera nudge,
  fall-death 80ms hold. Freeze resumes start-shifted (no jump).
- **MF-2 SPAWN/DESPAWN GRACE** (`fa27aff7`) — standee mount 150ms fade + 4% scale settle
  (base-first); despawn 200ms fade-into-base (base lifts last); seeded ≤400ms dressing/furniture
  cascade; room-transition 200ms crossfade. New theater-layer ES module `src/ui/spawn-grace.js`.

**Deferred.**
- **MF-3b (hit-stop production wiring)** — MF-3's hit-stop/recoil/crit-response are built + tested
  but DORMANT in real play: production plays `hit-damage` (via the `{hurt:"hit-damage"}` remap) so
  base shake+flash fire, but the hit-stop freeze + recoil are gated on `opts.attackerId` and
  crit-response on a `hit-crit` verb, neither of which `theaterFxFromLedger`'s hp case emits.
  Wiring = thread `attackerId` + a crit flag onto the hp ledger event (an EVENT-CONTRACT addition
  at the `DM_EVENT_FIELDS` boundary) — flagged for Adam's design call. fall-death's hold IS live.
- **MF-5 feel gate** — the interactive "does it feel like moving miniatures?" play session (Adam
  at the keyboard) + the instrumented turn-burst, best shot after MF-3b so the burst can show the
  hit-stop centerpiece. Interim evidence: the loop-gate contact sheet + `loop-01-camera-mid-tween.png`
  regenerated on the integrated tree, plus the fake-clock harnesses proving every tween curve.

**Fixed.**
- `verify-mf1-camera-tweens` settle-await 5s→15s (`978d1402`) — MF-1's own on-mount camera tween
  needs longer to settle on a cold/contended headless Chrome (matched the frustum harness).

**Gates (all personally re-run by the orchestrator, never self-reports).** check-manifest OK;
verify-mf1 24/0, verify-mf4 36/0, verify-mf3 47/0, verify-mf2 61/0; the integration gate on the
merged tree (all four MF harnesses + standee 71/0, theater-verbs 100/0, dungeon-interior 287/0);
loop gate 5/5 clean, fps 72–253.

## 2026-07-11 — BW3 + THE FULL VISUAL CAMPAIGN CLOSED: three waves in one sitting; the engine converged on the mocks

**The arc.** Adam's mock frames became the reference model; three waves landed end to end:
BW2 (10 units: crisp channel/PS1 retired game-wide, beat camera, floor contact + bases +
kilter, occlusion + clip margin, textures + variant roll, value plunge, silhouette + furniture
+ extrusion props, gallery, UI) → BW3 (composer seam byte-identical, light shafts + mote
coupling, seam-softening, LIT SPRITES + THE BRIGHTNESS LAW, post suite: tilt-shift DoF +
emissive bloom + filmic grade + the OutputPass sRGB fix). BW4 MOTION & FEEL specced + queued.

**Laws ruled this session (DESIGN registered):** PS1 RETIRED GAME-WIDE · FLOOR CONTACT ·
OCCLUSION + CLIP MARGIN · PROP PERSPECTIVE (flat art on contextual-depth extrusions,
edge-sampled sides, tier ladder box/silhouette/card) · THE KILTER · THE BRIGHTNESS LAW
(full-bright only in full white light) · SPRITE PURITY AMENDMENT (purity = no distortion,
lighting REQUIRED) · UV MAPPING LAWS (floor 1:1/cell — grout aligns with the combat grid) ·
COLUMN DEMOTION (furniture is cover) · THE FEEL LAWS (BW4).

**Also:** MOCK-GEN reference loop (PACKET-01 frames = the targets; PACKET-02 textures folded,
18/18; PACKET-03 flat-props authored + style-rider v2) · grid-snap (spritefusion) proven
destructive, reconstruction gate kept · corpus unification r2 (hue-safe; r1 reverted at the
eyes gate) · ROOM-GRAMMAR + BEAUTY-WAVE-4 specced · 6 real pre-existing bugs fixed by
executors in passing (mote origin-shift, preview importmap, stale shims, kaiju leak).

**Verification at close:** every unit orchestrator re-gated; interior 287/0 · dressing 451/0 ·
scene-direction 17/0 · floor-contact 48/0 · occlusion 24/0 · silhouette 87/0 · texel 116/0 ·
shafts 44/0 · seams 146/0 · crisp 37/0 · sprites 12/0 · manifest OK · loop gate 5/5 at every
landing · fps 124-164 with all passes. Deferred: BW2-4b's quiet camera-key shadow (taste
call), wall-hang axis 7b (unreproduced), trim GL-wiring, gallery-pass harness side effect,
GIT-LFS (tomorrow, Adam), audio design night.

## 2026-07-10 (later night) — THE BEAUTY WAVE EXECUTED: all 11 units + VP8 landed, the diorama transformed

**Context.** Adam delegated the taste verdicts to Fable ("you've been outsmarting me") and said
"orchestrate this wave now." One session: spec re-review (6 gaps found+folded), verdicts ruled,
3 execution stages (2 + 6 + 5 executors, Workflow-throttled, worktree-isolated), every unit
personally re-gated, every visual gate READ.

**Ruled (delegated verdict seat; DESIGN.md registered)**
- CAMERA = perspective ~20° ON · PSX dither+snap OFF world (VP0 4-cell card shot WITH standees,
  confirmed on pixels). §G closed: corpses persist FOREVER · weather defers to UW1 riding VP6's
  mote channel · blood full-grim applies to visuals, children carve-out MECHANICAL.

**Added**
- VP0 camera/world-PSX flags + defaults flip; VP1+VP1b TRUE-SCALE (registry feet/scaleTrue on
  896 slugs; interior pieces + combat standees) · VP2 dressing fold (14 dg sheets → assets/dressing,
  REALM_DRESSING generated) · VP2b GALLERY PASS (4 paintings reclaimed: dragon/colossus/kraken/
  tarrasque; one already hangs in a rolled dungeon) · VP3 ground design · VP4 SCENE_DIRECTION
  (17/0 harness; study card taste-gated: four distinct room moods) · VP5 battle UI off the stage
  (chip strip, acting ring, floaters) · VP6 life pass (idle-breathe, flicker, motes, VISIBLE
  HISTORY decals cap 12/room FIFO in pn.spatial.decals, child carve-out mechanical, effect seam)
  · VP7 contact blobs · VP8 beauty shot (5 full-res frames + gap caption).
- MOCK-GEN reference-model loop (Adam's idea): dev/model-qa/mock-gen/PACKET-01.md — 8 target-frame
  prompts, ChatGPT as our own reference model; mocks propose, laws dispose.

**Fixed**
- **THE KAIJU ROOT CAUSE (VP1c):** three fixes deep — sizing math was never broken; production's
  theaterStageSync pushed flat-tabletop units into S.unitGroup and `setInteriorBoard` never cleared
  it, so pre-VP1 kaiju meshes rendered OVER correct interior pieces. Two clearGroup calls, red-first.
- VP1.5 corpus unification REVERTED at the orchestrator's eyes gate (green snake→brown = hue
  murder; magenta flecks) and REBUILT as r2: union-histogram palettes w/ hue-family floor (executor
  self-corrected 2%→0.5% when its own card read caught a second snake), Lab quantize, integer-ratio
  texel, magenta exclusion. 42 flagged vs r1's 206; snake/ghost regression fixtures now permanent.
- Sweep fixture drift: VP1's red-first merge-base self-invalidation (pinned 63d3073), model-grammar
  figure-Y pattern widened for VP1b's posY (x/z-identity invariant intact).
- **Grid-snap verdict:** Adam's spritefusion-pixel-snapper lead PROVEN DESTRUCTIVE on our art
  (3-sprite + raw-arrival proof cards; detector locks onto texture rhythm, majority-vote eats
  sub-cell detail). Kept: the reconstruction-error validity gate as a future slicer option.

**Deferred**
- VP8 gap queue: combat BEAT FRAMING (law 2c not yet driving the camera), light-marker quads need
  emissive art, chrome creature sprites (realm dressed but uninhabited), gloom/chrome density tune.
- GIT-LFS now urgent: GitHub warns on the two 79MB pre-unification zips.
- Executor scar for the ledger: two narrator-deaths on VP1.5-r2 (zero commits, caught by disk-truth
  both times; one corrective SendMessage revived it — the babysitting protocol worked).

**Verification.** check-manifest OK · interior 282/0 · dressing 379/0 · scene-direction 17/0 ·
vp6 49/0 · standee-verbs 69/0 · gallery 22/0 · vp1c-leak 6/0 (red-first) · battle-stage 42/0 ·
combat suite green · full sweep = only the pre-existing table-usage-data red · loop gate 5/5
re-shot and READ at every landing (one stale-capture-server incident caught: identical pixels
to the prior tree = the server was serving stale code; kill-before-capture is now in every prompt).

## 2026-07-10 (late night) — ART DIRECTION CLOSED: 13 rulings, two armed waves, dressing art landing

**Added (specs — build is Adam's word)**
- docs/BEAUTY-WAVE.md (VP0-VP8 + VP1.5 + VP2b): VP0 two-flag study card (ortho-vs-perspective ×
  PSX-on/off, Adam's pixel-verdict), VP1 true-scale piece fix + registry sizing fold (the kaiju
  defect), VP1.5 corpus unification pass (realm master palettes + texel density + defringe, one
  batch, no codex spend), VP2 dressing fold, VP2b THE GALLERY PASS (clipped/reject sprites → framed
  realm paintings, paintingOf provenance, mimic-guise legal), VP3 ground design, VP4 scene art
  direction, VP5 battle-UI redesign, VP6 life pass + visible-history scars, VP7 contact grounding,
  VP8 the beauty-shot gate (side-by-side vs a real Wildermyth frame).
- docs/UNIFICATION-WAVE.md (UW1-UW4): ONE CHANNEL (diorama; flat table → legacy → retirement),
  exterior + settlement dioramas, PORTRAITS (busts w/ 3-expression sets — expressionSet law's
  production surface — + dialogue lower-third).
- 13 art-direction rulings registered in DESIGN.md: clean-shapes, PS1-scope-cut, perspective camera,
  framing law, value law, FLAGSHIP REALMS (fantasy/gloom/chrome; realm = expansion pack, ~6-mo
  drops), master palettes, texel density, portraits, outline law, defringe-standard, visible history,
  gallery pass. CLEAN-SHAPES + outline clauses patched into all pending codex packets.

**Added (art)**
- 25 DRESSING-GEN codex sheets landed + backed up UNGATED (flagships flora/clutter/objects +
  effects core + all accents + ash). VP2 gate/slice/fold is next session's first move.

## 2026-07-10 (evening) — WILDERMYTH GRAMMAR: engine marriage BUILT + dressing-gen packets + finale loop gate 5/5

**Added**
- North star: docs/GRAPHICS-ENGINE.md (Part I recipe + Part II research-grounded marriage;
  Wildermyth research digests committed). Identity: DF sim × Daggerfall breadth × Wildermyth
  presentation.
- ENGINE WAVE (all landed, each --no-ff + orchestrator re-gate): STANDEE VERBS
  (src/ui/standee-verbs.js, 61 checks; combat hurt/down routes sprites); GR2 dressing
  channel (src/engine/place-dressing.js dressPlan + card render w/ placeholders, 371);
  GR1 REALM_MATERIALS (12 realms, seeded low-contrast painters, 187); GR3+GR4 hemisphere
  key + per-realm grade + whisper fog + diorama skirt (254).
- FINALE LOOP GATE 5/5 (dev/battle-gate/dungeon-loop/): five REAL rolled dungeons
  (Web/Ruin/Figure-8/Loop topologies, chrome/gloom/fantasy) end-to-end — roll → prep →
  combat_start → volumetric render → standee verbs — zero fixture, zero breaks. Caught+
  fixed 2 verify-green-but-not-wired bugs (trayFrom interior never called dressPlan;
  findUnit blind to interior pieces).
- Sprite queue: DRESSING-GEN packets (50 sheets/852 cells, flora+clutter+objects×12 +
  effects core/accents, Wildermyth construction rules in every prompt) + round-3
  magenta-fails addendum (12 Adam-failed sprites, ANTI-MAGENTA clause).
- sprite-review floor-line setter; interior camera focusRect + CUTAWAY WALLS; sprite
  standee tilt (squash killed); SPRITE PURITY (billboards exempt from PSX).

**Known open**
- Interior PIECE SCALE misreads (mediums render giant in rooms — loop-gate contact sheet);
  fix rides the registry sizing fold. AO knob off by default (Adam pending final word).
- Codex waves pending: round-3 + dressing-gen (packets ready, RUN-NOTES order).

## 2026-07-10 (afternoon) — corpus retro-tagged, DUNGEON-GRAPH U1/U2/U4 live, codex packets hardened, floor-line tool

**Added**
- `dev/model-qa/corpus-tags.json` — casting-grade SPRITE-TAGS for all 896 committed sprites
  (28 vision agents, text-first/image-wins) + `corpus-sizing.json` (true scale, feet/5.5) +
  `ash-drift-report.json`. FINDING: sheet fantasy-npcs-2 = systemic label/art misassignment
  (14/18 mismatches); 13 sprites relabeled-to-art via new overlay `name` override in
  gen-sprite-registry.py; orphaned roles re-queued.
- **DUNGEON-GRAPH built (U1/U2/U4)**: `src/engine/place-spatialize.js` (walk graph → verified
  cell-grid SpatialPlan, 12 topologies, deterministic, 9/9), `src/engine/place-semantics.js`
  (roles, depth=difficulty bands, SCALE DOMAINS + prison-rule regrowth, 26/26),
  walk binding in prep.js/dm.js (pn.spatial, cursor→room, combat cellDims from the real room,
  time-pass repositioning seam, 20/20; fuzz 0, monkey 0-aborted). U3 (volumetric renderer +
  study card) IN FLIGHT on feat/dungeon-u3-render at close.
- Specs: docs/DUNGEON-GRAPH.md (SPECCED, anchors verified), docs/GUISE.md (universal
  sprite-swap: lycanthropes→synths→dragons), docs/GIT-LFS-MIGRATION.md (runbook, Adam priority).
- Round-3 codex packet (`dev/model-qa/regen-v3/round3/`, 10 sheets/184 cells incl. 46 alt
  fills) + RUN-NOTES run order; ALL round-2+3 packets hardened: expression fail-check,
  worm's-eye BUG COROLLARY in every camera line, 3-attempt cap, never-discard-takes,
  chat-recovery step 0.
- sprite-review tool: click-to-set FLOOR line (overlay `floor` → registry fold-through).

**Changed**
- SPRITE-GEN-V2: §10 expression clause → the FFVI EXPRESSIVE CREATURE LAW; new §10b ADDITIVE
  FOLD LAW + §10c NO-BLANK-SLOTS LAW; perspective clause BUG COROLLARY.
- Codex round-2 arrivals folded additively: 4 sheets PASS re-sliced (9 sprites);
  cosmic-large-v3-09 REJECTED (content regression) — old art kept, redo queued.
- Painterly-ash confirmed (9 npc/kids/animal sheets) → quarantine-pack/painterly-ash + Desktop
  zip; rosters re-authored under ash grit in round 3.

**Fixed**
- Recovered this worktree's deleted .git/worktrees admin dir (disk-cleanup collateral).
- Disk: worktrees pruned 6→3, magenta lane's 58 parked sheets committed+pushed before removal.

**Deferred**
- U3 gate + task "battle scene in a real dungeon room + loop test" (hands off with U3).
- Registry sizing fold (corpus-sizing + v3-sizing → sprite-registry), GUISE G1-G4, LFS
  migration (runbook ready), upscale decision (xBRZ candidate; card on Desktop).

## 2026-07-10 — SPRITE-GEN-V2: the great sprite cleanup, perspective law, V3 regen wave (650 gated sprites), casting-grade tags

**Added**
- `docs/SPRITE-GEN-V2.md` — the regen-wave law book: eye-level perspective law (front/side/¾ compatible;
  high-angle/top-down quarantined), size-tier grid ladder (titanic 1x1 → tiniest 8x8; humanoids ALWAYS 4x6),
  per-realm finish law (grim realms grimy-dithered, bright realms cleaner), chroma-key law (magenta default,
  pure green for chrome/suburb), Armed Toons Law, expression requirement, swarm pile-style law.
- `docs/SPRITE-TAGS.md` — casting-grade tag schema: BINDING LAW (sprite fixed to its NPC once assigned),
  EXPRESSION-VARIANT LAW (same form + different expression = same character, `expressionSet` ids),
  CASTING LAW (DM casts sprites onto surprise-play characters via kind/role/age/build/mood/portability;
  castability tiers unique/named/generic/crowd).
- **Perspective survey** (`dev/model-qa/perspective-survey/`) — 9 vision agents classified all 2,431
  uncommitted sprites per cell; contact sheets A/B/Q; final-verdicts.csv; Adam failed 80 in the new
  review tool (`dev/perspective-review.py` → :5181, click-to-fail, writes rulings.json).
- **REGEN-V3 packets** (`dev/model-qa/regen-v3/`) — 161 sheets / 755 sprites of exact codex prompts,
  per-realm, with pre-generated slug manifests; style-refs/ (12 sweep-rated exemplar sheets); realm
  expansions ruled + authored same day: cosmic tarot arcana (37), frontier tribal (34, dignity register),
  suburb Amblin/Earthbound (34), gloom VHS-horror canon (34), bright-kingdom armed toons (Zelda+Mario grammar).
- **V3 wave gated + sliced**: Adam's codex sessions delivered 143/161 sheets; 11 gate agents passed
  142/143 on style; all 650 sprites sliced to transparent PNGs at `dev/sprite-sheets/incoming/v3/<realm>/`
  with `v3-sizing.json` (pxHeight, band scale, qaFlags) and `v3-tags.json` (full casting schema, 650/650).
- **Off-angle giveaway pack** — 78 quarantined sprites keyed to transparency, sorted by angle, CC0 README
  (`dev/model-qa/quarantine-pack/` + zip on Desktop). Nothing deleted.
- Round-2 codex packets (`regen-v3/round2/`): cosmic-r2 (15 missing), gloom-r2 (3), fixes-r2 (9).

**Changed**
- Worktrees pruned 21 → 1 (only the sprite-gen lane remains); 37 dead worktree-agent branches deleted
  (each verified merged); parked WIP banked as commits on feat/craft-npc-situation +
  claude/fantasy-sprite-slicing; all live branches pushed to origin.

**Fixed**
- The 2026-07-09 overnight codex blast (41 sheets straight onto master, no perspective lock) is fully
  triaged: 78% usable under the eye-level law, rejects regenerated in V3, off-angle quarantined.

**Deferred**
- Round-2 codex run (18 missing + 9 fix sheets — packets ready for Adam's 3PM window); registry fold-in of
  v3 sizing/tags; committed-corpus retro-tag + ash painterly check; NPC expression pass (law 2 wiring);
  sprite lane's 59 uncommitted round-2 sheets still parked in its worktree.

