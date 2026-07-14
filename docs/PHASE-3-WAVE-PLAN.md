---
type: orchestration-plan
project: Genesis
status: ACTIVE — direction set by Fable 2026-07-13 (Adam delegated: "everything else, I am trusting you")
updated: 2026-07-13
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
composes: PHASE-3-DIRECTOR-BRIEF.md, GRAPHICS-PRODUCTION-RESEARCH-WAVE.md (GP-1..4), STAGE-C-ART-DIRECTION-REVIEW.md, GRAPHICS-NORTH-STAR.md (Stages B/D/E), FACETED-SPRITE-ART-MIGRATION.md (codex/extruded-prop-pilot), KENNEY-MESH-AUDIT.md (codex/kenney-mesh-audit)
audience: Claude orchestration sessions + Codex lanes
---

# Phase 3 Wave Plan — full integration & improvement

The director brief framed Phase 3 as GP-2..4; the art-direction review's Ordered Route is the
convergence truth. This plan merges them: GP waves interleave with the north-star route instead of
running as a separate track. Oracle deferred; watlas supersedes the xatlas pins; instancing is
adopt-first `@three.ez/instanced-mesh` (verified 2026-07-13 — r159+ floor covers r166, MIT,
one-command esbuild→IIFE). Full research verdicts: memory + the 2026-07-13 session transcript.

## Findings folded in (2026-07-13, Adam's eyeball round)

1. **Cutaway regression — REAL, not the oss kernel.** C4.1b (`8d1b94f5`) retired the whole-room
   camera-side parapet (BW2-5) when it replaced C4.1a's static near/far upper-hide with a ray-fade
   protecting only 4 ShotPlan anchors (player/primaryThreat/objective/focalLight —
   `theater-boot.js:9110`). Result: compiled rooms read as closed boxes; non-anchor figures hide
   behind full-height walls (see `dev/battle-gate/dungeon-loop/loop-02-room.png`). Legacy and oss
   render identically here — parity gates passed while the presentation regressed. **The §15
   stabilization hold is NOT implicated; the flip stands.** Fix = P3-1d below.
2. **Risers — NOT a regression.** The `side`-prose→tier chain is green end-to-end
   (verify-stage-c-terrain 57/0; riser mesh emission unconditional; signed tiers fixed under oss
   at `c6a3bbb7`). Tiers are prose-gated and rare; neither the shoebox captures nor the 5 loop
   dungeons rolled one. Fix = exposure, not code: P3-1e stages them in the eyeball set.
3. **The shoebox problem is the art review's P1 restated:** taste evidence must come from
   integrated production scenes, not bare shells. P3-1e is the standing correction.

## Wave queue

### W0 — singles (fan out immediately; independent)

| Unit | What | Gate |
|---|---|---|
| W0-a | **MF-3b hit-stop wiring** — thread `attackerId` + `crit` onto the hp ledger event at the `DM_EVENT_FIELDS` boundary so `play("hurt",{who})` carries `{attackerId,crit}`. Rides Adam's standing delegation; it is the smallest EVENT-CONTRACT addition and unblocks the felt hit-stop. | dm-events + dm-contract regen byte-checked; hit-stop fires in a live loop capture; no double-fire |
| W0-b | **PRNG dedup** — one `dev/lib/prng.mjs`, three harness call sites. | affected harnesses byte-identical results on fixed seeds |
| W0-c | **Open5e `srd-2024` cross-check** — `build/sync-open5e.py` validator for SRD-Data (CC-BY-4.0; filter `document=srd-2024` strictly). Data lane, non-graphics. | validator reports 339/339 spell join + field diffs; NEVER auto-rewrites SRD-Data |

### P3-1 — no-spend visual wave (composes with the §15 hold; no geometry-kernel contact)

| Unit | What | Gate |
|---|---|---|
| P3-1a | **GP-3a Poisson `place-distribution.js`** per research-wave §6 (seam after dressPlan+projection, before interiorBuildBoard; seeded per-entry; legal-region erosion; counts from role budgets). | §6.2 gates: noun/count/home identity byte-stable, determinism, containment, clearance, CLEAR intact, p95 < 2ms |
| P3-1b | **GP-4a depth-state defect audit** — capture live oss scenes at four yaws; classify per research-wave §7.1 (cutout / additive / true-alpha); report proven defects only. Diagnostic — no engine change. | a written defect table w/ captures; each entry reproducible |
| P3-1c | *(reserved — folded into P3-1d)* | |
| P3-1d | **Diorama cutaway restoration.** Base treatment: camera-side upper-band suppression on compiled walls, driven per segment through the existing `itrOcclusionClassify` tween engine (build-time yaw test, BW2-5's semantics, applied to `wallUpperMeshes` opacity — the compiler's unused `upperVisibleForSegment` seam stays the escape hatch). Composed with C4.1b's ray-fade for lateral occluders. Extend occlusion subjects: all mounted figures (perf-capped), not 4 anchors. | loop gate re-shot: open-diorama read, non-anchor figures readable; A4/occlusion harnesses green; art-review metric "at least one stage edge visible"; E0 mounted practicals on suppressed segments handled (fade with their wall) |
| P3-1e | **Integrated eyeball fixtures** — the product-camera eyeball set gains: one tiered room (dais+pit, terrain-fixture prose), one aperture-heavy room, one dressed room through production `trayFrom` — each a legacy-vs-oss pair, same scene/camera/light/crop (the banked re-gate lesson). First step of the art review's C-art fixtures. | captures exist + READ; tiers/risers visibly render under oss |

### P3-2 — Stage B sprite citizenship (B1–B4, pulled forward — critical path)

Standee contract (footX/Y, worldHeight, contentBounds, alphaCutoff, shadowProfile…), physical
standee (side thickness, beveled plinth, soft contact shadow, explicit shader), in-engine
acceptance gallery under the light/grade/yaw matrix, remove runtime size inference. **B1's
registry metadata IS the seam the faceted migration's art-admission fields extend — build them
as one schema** (`legacyAsset`/`candidateAsset`/`artStyleVersion`/`qaStatus`/`runtimeAdmitted`).
Coordinate with Codex BUG-14/15; regenerate `data/sprite-registry.js`, never hand-edit.
Gate: no square shadows / floating feet / tilted bases / key halos / edge-on invisible cards /
full-bright dark-corner sprites across the core-three gallery.

### P3-3 — corrections + first semantics

GP-4b: fix each defect P3-1b proved (one visual variable per A/B gate). **AgX tone-curve port**
into `makeGradePass` — verbatim GLSL from vendored three r166 (`tonemapping_pars_fragment.glsl.js`,
includes the r161 gamut fix); A/B on P3-2's gallery matrix; `tony-mc-mapface` (MIT) as the
comparison LUT. **D0 semantic-construction first slice** (role-only billboards → truthful
construction classes, art review item 5) — scope to the core-three realms' top construction nouns.

### P3-4 — delivery + decision checkpoint

Atlas Phase A (Pillow — already installed, build-time only, CI keeps dep-aware skip; research-wave
§4.2 contract; measurement-gated, no draw-call claims). Then the **instancing decision**: spike
`@three.ez/instanced-mesh` 0.3.15 against R3 Phase B needs before any bespoke spec (the ~150-line
`onBeforeCompile` patch is the documented fallback). Then the **oracle checkpoint**: inherit from
Codex's art-foundry if one exists; else pin `three-gpu-pathtracer@0.0.23` + `three-mesh-bvh@0.7.8`
(0.0.24 needs three≥0.180; the 0.7.8 npm deprecation is about pre-r158 — ignorable) behind
explicit SwiftShader/ANGLE puppeteer flags. potpack is **ISC, not MIT** — needs Adam's license nod
(else `maxrects-packer`, MIT).

### Stabilization hold exit

Each wave's loop gate doubles as soak evidence. After two waves' loop gates clean + one live
playtest with zero geometry-attributable defects → **§15 step 10 (remove the legacy triangulation
path)** as its own unit.

## Parallel lanes (not waves of this plan; tracked here for composition)

- **Sprite factory (Adam's Codex windows):** `dev/model-qa/faceted/PACKET-F1.md` — anchors + kits
  first, 2-minute eyeball rule, then 4 disjoint parallel lanes over the priority queue. Admission
  machinery per FACETED-SPRITE-ART-MIGRATION (blind judge; `in-game-pass` required; legacy
  fallback retained). Fantasy only until the pilot passes + Adam expands.
- **P3-K — THE KIT LANE (resumed 2026-07-13; Adam's ruling: runs SEPARATE from and is never
  preempted by the figure lanes).** The component-kit work (props broken into functional parts)
  stalled when figure sheets took over the pilot ledger — 11 kit/prop source sheets are already
  banked WITH alpha passes on `codex/extruded-prop-pilot` (`fantasy-pilot/raw-sheets/`: 4-part
  switch kit · arched + rectangular door kits · floor-trap kit · wall-trap flat-props ·
  shrine/portal components · chest faced-box · container · practical light · banner/sign ·
  portable items), all at "candidate for cleanup/cropping". Continuation, in order:
  **K1** crop + component QA the 11 banked sheets per production plan §4.1/§9 Steps E–H (a kit
  passes only on component FIT — the leaf must fit the frame aperture at authored scale); regen
  only what K1 rejects (the arched-door mismatch is the known reject; PACKET-F1 Lane 6 is the
  fill-in budget, not a fresh generation pass).
  **K2** deterministic assembly per §4 construction routing (extrusion for true front elevations;
  faced-box/lathe/procedural for chest/container/fixtures — never contour-extrude those).
  **K3** the acceptance image: one deterministic in-engine Fantasy room capture, licensed by a
  real Walk fixture, containing the 6–8 asset sample (door state-pair, lever state-pair, shield,
  tablet, floor trap plate, banner, faced-box chest, physical practical) — Adam's yes/no:
  "a beautiful physical diorama, or 2D icons pushed into 3D space?"
  **K4** only after K3 passes: the 32-candidate flat-prop queue, then the realm-expansion gate.
- **Kenney donor lane (Codex research → orchestrated integration):** corpus banked+pushed on
  `codex/kenney-mesh-audit` (1,752 GLBs CC0, census 1752/0, 149-candidate admission manifest).
  Path: Codex finishes contact sheets → Adam red-pens the 149 → **reskin pipeline** (procedural
  retexture: strip Kenney's toy albedo, apply realm-material palettes + facet-preserving normals;
  the donor taxonomy DIRECT_MODULATED/CHASSIS/PART_DONOR is the law) → normalization/sockets →
  registry entries behind `renderStrategy: full-3d-prop` with per-asset provenance. Charter §5
  constraint standing: donors and part-libraries, never catalog-dependence; procedural breadth
  stays generator-owned. These GLBs are also the **geometry classroom** — census fields
  (vertices/faces/bounds/UV/winding) are reference answers for our own prop grammar (D1).
- **Audio night ($0 path, when Adam calls it):** Sonniss GDC (royalty-free, NO redistribution —
  keep raw files out of git), freesound CC0 filter, OpenGameArt CC0 packs; Kenney audio for UI.
- **Blue-noise (GP-4, only if P3-1b proves banding):** Peters CC0 set via the pinned
  `Calinou/free-blue-noise-textures` mirror; NVIDIA STBN rejected (non-commercial).

## Adam's open ledger

1. potpack ISC license nod (or swap to maxrects-packer). 2. MF-5 feel gate after W0-a lands.
3. The 149-candidate Kenney red-pen when Codex's contact sheets are ready. 4. PACKET-F1 anchor
eyeball (the 2-minute rule) before firing the parallel lanes. 5. Oracle spend checkpoint at P3-4.
