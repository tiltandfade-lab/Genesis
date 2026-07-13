---
type: orchestration-plan
project: Genesis
status: HANDOFF — awaiting Fable's direction
updated: 2026-07-13
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
composes: GRAPHICS-CONVERGENCE-PLAN.md, GRAPHICS-PRODUCTION-RESEARCH-WAVE.md, OFFLINE-ART-FOUNDRY-RESEARCH.md, EXTRUDED-SPRITE-PROP-LIBRARY.md
audience: Fable (director seat) — read before opening Phase 3
author: Claude Opus 4.8 (orchestrator this session)
---

# Phase 3 Director Brief — for Fable

**Why this exists.** Adam delegated the geometry `legacy→oss` flip decision to Claude (Opus) conditional
on sound evidence; that's landed. But **Phase 3 (visual production) is direction-laden, and Adam ruled
Fable should set its trajectory before anyone goes deep.** This brief hands you a de-risked flip, a clear
path to the full Codex research suite, the Phase-3 terrain, and the open calls that are yours. Nothing
below has been started — Phase 3 is greenfield in the codebase.

---

## 1. What landed while you were out (the flip — DONE, stabilization-clean)

The geometry default is now `oss` in production. Detail: `HANDOFF.md` DECISION STATUS + CHANGELOG
2026-07-13. In one line: `ROOM_SHELL_POLYGON_KERNEL_FLAG` (theater-boot.js) `legacy→oss`; the module
const `ROOM_SHELL_POLYGON_KERNEL` stays `legacy` as the bare-call/dev fallback, retaining the legacy
path for the §15 step-9 **stabilization hold** (step 10 = remove legacy, deferred until the hold passes).

**Evidence (all re-gated by Claude, captures READ):**
- Numeric: wall-runs-oss 92/0 (corner gap 0 at stem/cap/footing, both cap lips, 100% provenance) ·
  wall-runs-oss-fuzz over **5000 randomized rooms** (zero join-gap, full provenance, acute-bevel +
  red-first control) · geometry-fixtures 28/0 (7 legacy defects fixed, 0 regressions) · parity 48/0.
- Perf (`dev/capture-oss-integrated.mjs`): draw calls **Δ0**, triangles **Δ−286** (oss cheaper),
  geometries/programs **Δ0**, textures +2 one-time.
- Full 197-harness sweep: 4 reds, **ALL verified pre-existing on master** (render-flake/CI-auto-skip).

**Eyeball artifacts (worth 2 minutes before you direct):**
- `dev/battle-gate/dungeon-loop/contact-sheet.png` — 5 REAL rolled dungeons (gloom/fantasy/chrome) + combat,
  rendered under the new oss default. 5/5 clean, 0 breaks, fps 60–170. Walls read as solid capped volumes,
  no gaps/holes/dropouts. (Chrome loops are dark — realm exposure, a pre-existing recalibration item, not oss.)
- `dev/oss-integrated-shots/` — product-camera legacy-vs-oss (visually ≡, no regression) + `perf.json`.
- `dev/wall-runs-oss-shots/` — outside-low grazing legacy-vs-oss (oss closes the corner with a continuous
  mitered cap lip). This is the pathological angle SOL flagged; it's the clearest "before/after."

*Housekeeping:* the loop-gate captures are regenerated (now oss) but **uncommitted** — not landed to master
directly. Commit them on a branch at the stabilization-close if you want them in history; your call.

---

## 2. The full Codex research suite — your path to check it out

Adam asked that you have a clear path to **the full suite of plugin recs from Codex** and **the Codex plan**.
Everything below is already on `master` (the codex worktrees carry no unique docs). Division of labor is
locked: **Codex researches, Claude/Fable orchestrate** (`GRAPHICS-CONVERGENCE-CHARTER.md`).

> Disambiguation: `docs/CODEX.md` is the in-game **relational entity layer** (NPCs/items), NOT the Codex
> coding-agent's plan. The Codex agent's front door is `AGENTS.md`; its plan is the research docs below.

### 2a. The plugin recs (tool/library adopt·defer·reject) — Codex's measured rulings

**The canonical table: `GRAPHICS-PRODUCTION-RESEARCH-WAVE.md §3.** Ten pinned candidates, each with a
measured compatibility result + an initial ruling. Reproduced here so you have it at a glance:

| Candidate | Pin | Role | Codex's initial ruling |
|---|---|---|---|
| three.js | 0.166.0 | runtime baseline | Required baseline |
| three-gpu-pathtracer | 0.0.23 | offline visual **oracle** | **Adopt** spike with adapter |
| three-mesh-bvh | 0.7.4 | path-tracer acceleration | Dev-only transitive pin |
| xatlas-web | 0.1.0 | UV unwrap engine | **Build-time spike** |
| xatlas-three | 0.2.1 | Three geometry adapter | **Defer** — worker capture unsolved |
| stats-gl | 4.2.3 | frame telemetry cross-check | Dev harness only |
| potpack | 2.1.0 | deterministic atlas layout | **Adopt** prototype |
| poisson-disk-sampling | 2.3.1 | spatial distribution | **Adopt** realization spike |
| three-wboit | 1.0.15 | transparent FX | **Defer** — never whole-scene |
| sharp | 0.35.3 | image assembly | **Reject** for now; keep Pillow |

Backing evidence + how to re-run the proofs yourself:
- Pins: `dev/graphics-research/toolchain.json` · Re-run: `node dev/graphics-research/verify-toolchain.mjs`
  and `node dev/graphics-research/verify-layout-probes.mjs`.
- Geometry bakeoff rulings (already consumed by the landed G1/G2/G3): `dev/geometry-research/bakeoff/ruling.json`
  (floors = polygon-clipping+Earcut; walls = clipper2-ts Strategy-A; clipper2 booleans + CDT **rejected**).
- Geometry tool ledger (licenses/pins): `dev/geometry-tools/LEDGER.md`.

### 2b. The Codex plan (the research/production docs)

- `AGENTS.md` — Codex onboarding front door (same contract as CLAUDE.md).
- `GRAPHICS-CONVERGENCE-CHARTER.md` — **governing** authority (walk canonical; graphics = provenance-
  preserving visual compiler; C0–C8 ladder; §5 open-source adoption law; §7 session protocol).
- `GRAPHICS-CONVERGENCE-PLAN.md` — Claude's execution spine composing the three research waves into phases.
- `GRAPHICS-PRODUCTION-RESEARCH-WAVE.md` — **GP-1..4** (Phase 3 itself): path-traced oracle, xatlas UV,
  atlases, GPU telemetry, Poisson distribution, WBOIT classification, + the multi-agent execution gates.
- `GEOMETRY-ACCELERATION-TOOLCHAIN.md` (R0–R9 bakeoff) + `GEOMETRY-OSS-INTEGRATION.md` (G0–G6) — the
  now-LANDED geometry lane (context for how the flip was won).
- `OFFLINE-ART-FOUNDRY-RESEARCH.md` — Codex's offline art-foundry (feeds GP-3 distribution/atlas + props).
- `EXTRUDED-SPRITE-PROP-LIBRARY.md` — Codex's realm-prop-library spec (the R5 prop-foundry feed).

Active codex worktrees (research in flight, behind master — nothing to merge yet):
`codex/extruded-prop-pilot`, `codex/kenney-mesh-audit`, `codex/art-direct-wave-c`.

---

## 3. Phase 3 scope (GP-2..4) — the terrain

Goal (research-wave §8): *procedural content acquires coherent shape, contact, material, light,
atmosphere, and legibility until the shipped raster frames approach the vision renders* — a taste target.

| Wave | What it is | Cost / gate | Dependency |
|---|---|---|---|
| **GP-2** | offline path-traced **oracle** (a reference render to tune raster toward) + **xatlas** WASM UV unwrap | **spend + tool pins**; xatlas worker-unwrap is unsolved research | Codex-flavored; overlaps its art-foundry lane |
| **GP-3** | Poisson `place-distribution.js` (organic prop/dressing scatter) + **Pillow** atlas builder | Poisson = pure JS, none; Pillow = package install (§9 stop condition) | none |
| **GP-4** | fix proven depth-state defects → blue-noise microvariation *if* captures show banding → WBOIT *if* a real sort defect | first slice pure engine; rest conditional | none (blue-noise/WBOIT gated on evidence) |

**The research-wave prescribes its own sequencing — smallest-correction-first:** GP-4 says *"First fix
proven depth-state defects,"* and §9 forbids broadening renderer ownership *before a smaller depth/material
correction is tested*; blue-noise/WBOIT only fire *if captures show* the defect.

---

## 4. The calls that are yours (Fable)

1. **The oracle (GP-2).** Do we build a real path-traced reference (three-gpu-pathtracer, Codex "adopt"),
   **wait for Codex's art-foundry** to produce it, or **skip the path-tracer and use Adam's MOCK-GEN
   frames as the reference target**? This decides everything downstream — it's the measuring stick.
2. **Spend / install gate.** Green-light a Pillow install + xatlas WASM pin later, or keep Phase 3
   install-free for now? (Charter §5 adoption law + Adam holds the spend ruling.)
3. **Sequencing.** Lead with the no-spend slices (§5 below), or a different order?
4. **Stabilization vs. proceed.** Sit in the flip's §15 hold longer, or run Phase-3 no-spend work
   alongside it (they don't touch the geometry kernel, so they compose)?

---

## 5. Claude's recommendation (a starting position, not a decision)

Follow the research-wave's own law: **start the no-spend slices, prove defects before adopting heavy tools.**

- **GP-3a — Poisson `place-distribution.js`** (pure JS; `poisson-disk-sampling` "adopt" + the R5 fixture
  already exists at min-sep 0.70094, CLEAR/apron preserved). Organic scatter is a real, visible win with
  zero adoption risk.
- **GP-4a — depth-state defect audit** (pure diagnostic: capture the live oss scene at four yaws, look for
  transparency/sort defects, report). No engine change; hands you evidence to direct GP-4 from.

Both run **alongside the stabilization hold** (they don't touch the geometry kernel) and need no spend,
no install, no Codex dependency. Park the oracle + xatlas + Pillow behind your call #1/#2 — the oracle
especially, since it overlaps Codex's art-foundry and may be cheaper to inherit than to build.

If you agree, these two are spec-ready to fan out immediately; if you'd rather set the oracle direction
first, everything waits on that with no wasted work.

---

## 6. "Not rebuilding the wheel" — OSS adoption findings (2026-07-13 research pass)

A three-agent research pass (reference data · three.js graphics · procgen/infra) asked whether Genesis is
reinventing anything a mature public repo already solves. **Headline: mostly no.** The non-obvious infra
wins are already adopted (IndexedDB via `store.js`/`FOREVER-STORAGE.md`; vendored earcut/polygon-clipping/
clipper2; the Codex graphics pin-table), and the deliberately-bespoke systems are correct-by-design — keep
them: **script-owns-rolls** (so `rpg-dice-roller` would fork the pipeline), **no-stored-terrain** (so
mapgen4/donjon assume state `SPATIAL-MODEL.md` forbids), **band×lane combat** (so `rot.js` FOV/pathfinding
has nothing to map to), and `postprocessing` was already *correctly rejected* (swapping a working DoF/bloom/
grade chain is pure risk). Four genuine finds surfaced — the first two are Phase-3 graphics, in your lane:

| # | Adopt | What / where it lands | License | Owner |
|---|---|---|---|---|
| **1** | **`@three.ez/instanced-mesh`** | **The big one — fold into GP-3/R3 before speccing bespoke.** R3 "Phase B" sprite-atlas instancing (per-instance transform/UV-rect/tint/opacity/visibility + alpha-tested depth + LOD + frustum cull + BVH raycast) is scoped **fully bespoke + unbuilt** (`GRAPHICS-PRODUCTION-RESEARCH-WAVE.md §4.3`). potpack packs the atlas layout; **nothing pinned RENDERS it** — this library is exactly that seam, solved. Narrower alt: `three-instanced-uniforms-mesh` (Troika) if only per-instance UV-rect/tint/opacity is wanted. | MIT | **Fable — Phase 3** |
| **2** | **Open5e `srd-2024` dataset** ([open5e/open5e-api](https://github.com/open5e/open5e-api), `data/v2/wizards-of-the-coast/srd-2024/`) | Build-time **cross-check** for the PDF-parsed `Reference/SRD-Data/` — spell count matches exactly (339, validates the parse), and it can catch 5.2.1 errata + backfill structured fields (`saving_throw_ability`, `damage_roll`, `shape_type`) currently parsed from prose. A `build/sync-open5e.py` validator, **not** a replacement. **Filter strictly to `document=srd-2024`** (the repo aggregates CC-BY + OGL + ORC); **avoid 5etools-derived sets** (Product Identity); **skip 5e-bits/dnd5eapi** (still 2014 SRD 5.1 — would regress rules). | CC-BY-4.0 (matches `docs/ATTRIBUTION.md`) | data lane (non-graphics) |
| **3** | **AgX tone-curve** | **Free** — already inside vendored `three@0.166`. Port just the tone-curve math into the existing per-realm grade pass (BW3-6 `makeGradePass`) for cleaner highlight rolloff on bloom-heavy emissive (chrome glow, flame apex). **Don't** touch `renderer.toneMapping`/`NoToneMapping` — that fights the per-realm-grade architecture. | MIT (three core) | Fable — Phase 3 (GP-4 grade) |
| **4** | **Dedup the test-seed PRNG** | Free hygiene: three copies of a seeded RNG (2× `mulberry32` + 1 divergent LCG) across `dev/gauntlet-monkey.mjs:51`, `dev/gauntlet-fuzz-events.mjs:54`, `dev/verify-u6-determinism.mjs:32` → extract one `dev/lib/prng.mjs`. Silent-drift risk between harnesses; ~5-min dev-only cleanup. | n/a (8-line fn) | any wave |

Explicitly **skip** (researched + ruled out): pmndrs `postprocessing` (rejected), IBL/PMREM (no PBR materials
in production), particle libs (v1 rules them out), soft-shadow libs (shadows disabled on the tabletop path),
WebGPU/TSL migration (charter forbids without a forcing bottleneck), `graphology` (~100× overkill for 6–20-node
topologies). Full per-item evidence + URLs are in this session's research transcript.
