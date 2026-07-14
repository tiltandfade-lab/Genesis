---
type: system-spec
project: Genesis
status: SPECCED — teed up 2026-07-14 (Fable); GATED on sprite-QA coordination (see §Coordination)
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
composes: PHASE-3-WAVE-PLAN.md (P3-2), GRAPHICS-NORTH-STAR.md (Stage B §4.5), FACETED-SPRITE-ART-MIGRATION.md
audience: Sonnet executors (one section = one unit = one branch)
---

# Phase-3 Wave-2 — Stage B: sprite citizenship (B1–B4)

Standees stop being "a sprite on a plane" and become physical citizens of the diorama: a real
authored contract (foot point, world height, content bounds, shadow profile), physical geometry
(side thickness, beveled plinth, soft contact shadow, explicit shader), an in-engine acceptance
gallery, and NO runtime size guessing. The critical-path wave that lets every later material/light
pass treat sprites correctly.

## ⚠️ Coordination gate (READ BEFORE FIRING)
**B1 regenerates `data/sprite-registry.js`. A sprite-QA session is live in another worktree writing
registry rulings (via `dev/sprite-review.py` → "regen registry").** These collide on the same
generated file. **Do NOT fire B1 until the QA session's registry writes have landed on master.**
Serialize: QA lands its `data/sprite-registry.js` regen → orchestrator pulls master → THEN B1 runs
off that tip and regenerates on top. B2/B3/B4 do not touch the registry and may proceed once B1 lands.
Adam/orchestrator confirms QA-registry timing before dispatch.

## Sub-wave order
- **B1** (registry contract + schema) FIRST, gating — B2/B3/B4 consume its fields.
- **B2** (physical standee) ∥ **B3** (acceptance gallery) off B1's tip — independent files.
- **B4** (remove runtime size inference) after B1 (needs worldHeight authoritative in the registry).

Standard executor rules (see PHASE-3-WAVE-1-SPECS.md header): worktree-only git, classic globals,
check-manifest after any module edit, jsdom via `$HOME/.genesis-jsdom/node_modules`, red-first the
⊗ checks, regenerate generated files (NEVER hand-edit `data/sprite-registry.js` — edit
`build/gen-sprite-registry.py`), do not merge (orchestrator gates), report raw data.

---

## B1 — Standee contract + registry schema  ·  branch `feat/b1-standee-contract`

### Decision
The standee contract fields AND the faceted-migration art-admission fields are ONE schema, authored
into the registry via `build/gen-sprite-registry.py` (the generator that owns `SPRITE_REGISTRY`).
Runtime never infers size — `worldHeight` is authoritative from the registry.

### Fields (per registry entry — locate the current schema in `build/gen-sprite-registry.py`, extend it)
- **Contract:** `footX`, `footY` (the sprite-space foot/contact point, normalized), `worldHeight`
  (authoritative world-unit height — from the existing sizing data, `corpus-sizing.json`/`v3-sizing.json`,
  NOT computed at render), `contentBounds` (tight alpha bbox), `alphaCutoff`, `shadowProfile`.
- **Art-admission (extends the faceted migration — grep `FACETED-SPRITE-ART-MIGRATION.md` for the
  exact field names):** `legacyAsset`, `candidateAsset`, `artStyleVersion`, `qaStatus`,
  `runtimeAdmitted` (the flag the render path reads to decide legacy-vs-candidate; default admits
  legacy so nothing changes until QA promotes a candidate).
### Files
- `build/gen-sprite-registry.py` — add the fields (derive from existing sizing/tag sources; never
  invent a value that a source already holds). Regenerate `data/sprite-registry.js`.
- `dev/verify-sprite-registry.mjs` — extend to assert the new fields present + typed on ≥ the
  current join threshold; ⊗ RED FIRST against base (fields absent).
### Gate
`verify-sprite-registry.mjs` green with new-field assertions (red-first); `gen-sprite-registry.py --check`
clean; `check-manifest.py` OK; registry regenerated (not hand-edited); `runtimeAdmitted` default keeps
render byte-identical.
### Out of scope
Render-path consumption of the new fields (that's B2/B4); QA rulings (the other session's).

---

## B2 — Physical standee build  ·  branch `feat/b2-physical-standee`  (off B1)

### Decision
Give the standee real physicality in the theater build path (grep `figureFor`/`standeeWrap`/the
billboard build in `src/ui/theater-boot.js` + `standee-verbs.js`): **side thickness** (a thin
extruded card, not a zero-thickness plane, so edge-on it isn't invisible), a **beveled plinth base**
(the mini stands on a base, not floating), a **soft contact shadow** (radial-falloff pool, not a hard
disc or square), and an **explicit standee shader** (readable under the scene's own light/grade — no
reliance on ambient fill). Consume B1's `footX/footY`/`worldHeight`/`shadowProfile` — never re-infer.
### Gate (the 6 defect classes — must be ABSENT, proven in B3's gallery)
no square shadows · no floating feet · no tilted bases · no key halos · no edge-on-invisible cards ·
no full-bright sprites in a dark corner. Plus: `verify-theater-shot`, `verify-dungeon-interior`,
`verify-theater-sprites` (or the current sprite-render harness), `check-manifest` green; a red-first
assertion that edge-on a standee has nonzero projected width.
### Out of scope
The registry schema (B1); realm palette/texel work (UNIFICATION-WAVE).

---

## B3 — In-engine acceptance gallery  ·  branch `feat/b3-standee-gallery`  (off B1, ∥ B2)

### Decision
NEW capture harness `dev/battle-gate/standee-gallery/capture-standee-gallery.mjs` (model on
`dev/capture-oss-integrated.mjs`) that renders the **core-three realms** (fantasy/gloom/chrome)
standees under a **light × grade × yaw matrix**, emitting an acceptance contact sheet + `results.json`.
Dev-only (no product code). The artifact is Adam's taste gate for B2.
### Gate
Contact sheet + results.json exist; harness READS its own captures and reports, per realm/yaw,
whether each of the 6 B2 defect classes is present (honest — an image can't self-certify, so it
reports observations, orchestrator + Adam judge). `check-manifest` OK; strictly additive.
### Out of scope
Fixing defects (B2); non-core-three realms (expansion gate).

---

## B4 — Remove runtime size inference  ·  branch `feat/b4-kill-size-inference`  (off B1)

### Decision
With `worldHeight` authoritative in the registry (B1), PURGE the runtime size-inference code path in
the theater standee build (grep for the height/scale computation that today derives a standee's size
at render — the `figureFor`/billboard scale path). The registry value is the single source; no
computed fallback remains (a missing `worldHeight` is a loud registry error, not a silent guess —
the state-hygiene "truth over green" law).
### Gate
⊗ RED FIRST: a fixture with a stubbed-missing `worldHeight` throws/logs loudly (proves no silent
fallback) — fails before B4 (silent inference), passes after. `verify-theater-shot`,
`verify-dungeon-interior`, sprite-render harness, `check-manifest` green. Render byte-identical for
entries whose registry `worldHeight` equals what inference produced (prove the swap is lossless on a
sample).
### Out of scope
New sizing data (uses B1's); the registry schema (B1).

## Adam's ledger for this wave
1. Confirm **core-three scope** (fantasy/gloom/chrome) for B3's gallery, expansion later.
2. **Sprite-QA registry timing** — tell me when the QA session's `sprite-registry.js` regen has
   landed on master so B1 fires off a clean tip (the coordination gate above).
3. B3's acceptance sheet is a **taste gate** — you rule pass/fail on the standee look before B2 is
   considered done.
