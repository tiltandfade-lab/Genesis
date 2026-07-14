---
type: system-spec
project: Genesis
status: SPECCED — 2026-07-14 (Fable). Reconciles BEAUTY-WAVE-5 v2 against everything landed since 2026-07-11.
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
composes: BEAUTY-WAVE-5.md (the source spec — its LAWS govern), GRAPHICS-ENGINE.md §H, GRAPHICS-NORTH-STAR.md (Stage D), PHASE-3-WAVE-PLAN.md
audience: Sonnet executors (one section = one unit = one branch)
---

# Stage D — STATEFUL NOUNS (the reconciled cut)

`docs/BEAUTY-WAVE-5.md` (SPECCED v2, 2026-07-11) is the source doctrine — its 9 INTEGRATION LAWS and
its unit detail govern wherever this doc doesn't override. But it predates Stage A/C, P3-1d, E0-1 and
the Codex kit/Kenney lanes, so several of its seams have ALREADY SHIPPED. This doc is the reconciled
execution cut: what's left, in what order, with current anchors.

## Reconciliation (what already shipped — do NOT rebuild)

| BW5 seam/unit | Status |
|---|---|
| SEAM 2 (RM-1 size fidelity / RM-2 terrain / RM-3 real shapes) | ✅ SHIPPED — Stage C (C1/C2/C3/C3b, master `388a4c7b`) |
| S0-2 occlusion-fade + camera | ✅ SHIPPED — Stage A A3/A4 + P3-1d cutaway restore + E0-1 fixture fade |
| SEAM 3 (materials & conditions MC-1/2/3) | → Stage E's wave (do not pull in here) |
| S0-4 extrusion *grammar* | ✅ folded into GRAPHICS-ENGINE.md §H (`:232`) — the doctrine exists; the AUTHORING PASS (per-object `extrudeDepth` values) has not run → rides D1 below |
| IA-4 prop *geometry* (chest/lever/door construction) | ⚠️ overlaps the Codex kit lane (P3-K K1–K4, `codex/extruded-prop-pilot`) + the Kenney donor lane — see the CONSTRUCTION SEAM law below |

## What Stage D actually builds (the un-built core)

The state spine (engine) + the doors-first render keystone:

- **D0 — the state primitive** (BW5 S0-3): `state` field + `state_transition` event, engine-general.
- **D1 — interactables fold & registry** (BW5 IA-1 + the S0-4 authoring pass): objects-dg-03 art →
  `slug@state` registry + per-archetype `location` + `extrudeDepth` + `renderStrategy`.
- **D2 — walk→coordinate binding** (BW5 IA-2): `plan.interactables[]` — the roll becomes a placed thing.
- **D3 — placement grammar** (BW5 IA-3 = ROOM-GRAMMAR).
- **D4 — DOORS-FIRST render keystone** (BW5 IA-4 core + S0-1's transition slice): one placed,
  shaped-aperture, stateful door you can walk through; room transition under the MF-2 crossfade.
- **D5+ (LATER, not this wave):** the full one-room render conversion (S0-1 whole-hog), remaining
  archetypes' render (chest/lever/shrine/…), archway-glimpse, vertical slots. D4 proves the stack;
  D5 scales it after Adam's taste gate + the kit/Kenney red-pens land.

## THE CONSTRUCTION SEAM LAW (the Kenney/kit reconciliation — Adam ruled 2026-07-14)

The state spine (D0–D3) is **renderer-agnostic**. Construction is a **per-asset registry field**
(`renderStrategy`: `extrude` | `faced-box` | `model` | `full-3d-prop` (Kenney donor) | `kit`), so a
donor mesh or kit assembly can replace a bespoke construction later with ZERO upstream rework.
D1's registry carries a `donorCandidate` note column per archetype (from KENNEY-MESH-AUDIT's
149-candidate manifest) but **no Stage-D unit waits on the Kenney red-pen or the kit lane**. Doors
ship first as shaped-aperture extrusions; donors upgrade archetypes in place later.

## Ordering & collision notes

- **D0 → D1 → D2 → D3 → D4** is the dependency spine; D0∥D1 are independent of each other (different
  files) and may run in parallel.
- **D0/D1/D2/D3 never touch `src/ui/theater-boot.js`** — safe to run while P3-3a (AgX) is in flight.
  **D4 touches theater-boot.js — it fires only after AgX lands.**
- **D1 regenerates NO file the sprite-QA session writes** (interactables registry is a NEW file, not
  `data/sprite-registry.js`) — no QA collision.
- Standard executor rules per `docs/PHASE-3-WAVE-1-SPECS.md` header (worktree-only git, classic
  globals, check-manifest, red-first ⊗ checks, orchestrator gates/merges, raw-data reports).

---

## D0 — The state primitive  ·  branch `feat/d0-state-primitive`

### Decision (BW5 S0-3 + Law 6; do not re-litigate)
Placed entities generally (interactables now; fixtures/fires/surfaces later) carry a mutable `state`
field + a `state_transition` event. Designed broad; interactables are merely the first consumer.
Safe defaults; deterministic where rolled; the transition event is the hook BW4's tween channel
animates (never a teleport).

### Files & functions
- `src/world/dm.js` — register `state_transition` in `DM_EVENT_TYPES` (`dm.js:1565`) + its
  `DM_EVENT_FIELDS` entry (`dm.js:1591`): accept `{entityRef, from, to, cause}` (strings; normalize
  aliases at the boundary ONLY — the HQ2-1 rule). `applyEvent` (`dm.js:1884`) case: validate the
  entity exists + the `to` state is in the entity's archetype state list; write the new state into
  the entity's record; unknown entity/state ⇒ forward-compatible no-op (matches the contract's
  existing degrade convention).
- State storage: on the placed entry itself (the `plan.interactables[]` record once D2 lands; until
  then the harness drives synthetic entities) + whatever persistent home the walk overlay already
  gives segment-scoped facts — locate the overlay write path in `src/engine/walk-scene.js`/the
  overlay module and follow ITS convention; do NOT invent a new store.
- Regenerate `dm-contract.json` via `python3 build/gen-dm-contract.py` (never hand-edit).

### Verification (new `dev/verify-state-primitive.mjs`, model on `dev/verify-dm-events.mjs`)
⊗ RED FIRST: unregistered event type is a no-op before; applies after. Transition fires exactly once
(fake-clock testable); invalid `to` state rejected loudly (no silent write); default state resolves
safely for an entity with none; determinism where rolled. Re-run green: `verify-dm-events` (70),
`verify-dm-contract` (115), `verify-dm-seam` (47), `gauntlet-fuzz-events` (0 findings — the new
event must survive hostile payloads), `gauntlet-monkey` (0 aborted), `check-manifest`.

### Out of scope
Animating transitions (BW4 channel exists); any render; promoting states to codex.

---

## D1 — Interactables fold & registry  ·  branch `feat/d1-interactables-registry`  (∥ D0)

### Decision (BW5 IA-1 + the S0-4 authoring pass)
Mirror `build/gen-realm-dressing.py` (reads `dev/model-qa/dressing-gen/manifests/<realm>-*.json`):
a NEW `build/gen-interactables.py` reads the **objects-dg-03** manifests
(`dev/model-qa/dressing-gen/manifests/<realm>-objects-dg-03.json`, art at
`ui-sketches/sprite-sheets/<realm>-objects-dg-03.png`) → a NEW generated `data/interactables.js`
(classic global, e.g. `INTERACTABLES_REGISTRY`), keyed **`slug@state`**, CORE-3 realms first
(fantasy/gloom/chrome — BW5's scope ruling) with the other realms' data folded but flagged inert.
Three authoring passes ride the fold (per BW5): **location** (per-archetype floor/wall/door-cell —
no `location:"both"` survives), **`extrudeDepth`** (authored once per object per §H's type bands:
flush < standard < hero), **`renderStrategy`** (per the CONSTRUCTION SEAM LAW; default per archetype:
door/lever/banner=`extrude`, container/bench=`faced-box`, chest/portal=`model`; plus a
`donorCandidate` informational field from `docs/KENNEY-MESH-AUDIT.md`'s manifest where one matches).
The archetype state lists (door: shut·ajar·open·broken, chest: closed·open·looted, … — BW5's table
at `BEAUTY-WAVE-5.md:134-143`) live HERE as the single source D0's applyEvent validates against
(export alongside the registry).

### Verification (new `dev/verify-interactables-registry.mjs`, model on the REALM_DRESSING harness)
⊗ deterministic fold (two runs byte-identical); every rostered slug resolves art + `extrudeDepth` +
`location` + `renderStrategy` at EVERY state in its archetype list; type→depth bands assert
(grate < crate < chest); no `location:"both"`; core-3 complete, others present-but-inert;
`gen-interactables.py --check` mode; `check-manifest` (register `data/interactables.js` in
manifest.json + genesis.html loadOrder).

### Out of scope
Placement (D3); render (D4); regenerating `data/sprite-registry.js` (NOT this file — no QA collision);
kit-lane sheet slicing (Codex's).

---

## D2 — Walk→coordinate binding  ·  branch `feat/d2-walk-binding`  (after D0+D1)

### Decision (BW5 IA-2 verbatim — its riders are law)
`plan.interactables[]` sibling to `plan.dressing[]` (shape at `place-dressing.js:8/:576` is the
model): a deterministic projection `{archetype, slug, state, extrudeDepth, name, flavor, x, y,
roomSegNum, sourceRef}` from the walk's already-rolled object/feature/door fields (the rollRefs
provenance seam in `src/engine/dungeon-walk.js` — WDV-2's stamps — is the source). The canonical
noun REMAINS the raw segment field (Law 5: the frame is selective; the walk record is canon).
Default-empty screen budget; over-budget rolls become source-referenced STAGING-RESERVE entries
(never discarded/rerolled); starting state from a rolled field when present else the archetype-safe
default (spice biases the upstream roll, the renderer never re-rolls); no codex promotion merely for
placement. Seed per entry off walkId+segNum+sourceRef (follow `placeDistribute`'s hash convention,
`src/engine/place-distribution.js`).

### Verification (new `dev/verify-walk-binding.mjs`)
⊗ a fixture walk yields a source-referenced coordinate in `plan.interactables[]`; ⊗ the raw segment
is byte-unchanged; ⊗ reduced budget changes only the projection, never the segment/digest; same
segment+overlay+seed rebuilds byte-identical; reserve entries carry sourceRefs. Re-run:
`verify-walk-scene` (32), `verify-stamped` (34), `verify-dungeon-interior` (287),
`verify-place-distribution` (27), `check-manifest`.

### Out of scope
WHERE in the room things go beyond the deterministic seed positions (D3 refines); render (D4).

---

## D3 — Placement grammar (= build ROOM-GRAMMAR)  ·  branch `feat/d3-room-grammar`  (after D2)

### Decision (BW5 IA-3)
ROOM-GRAMMAR promoted to code: ALIGN (levers to walls) · PAIR/FLANK (braziers to doors) · FOCAL
(shrine to the anchor; dais when terrain has one) · RHYTHM (torch cadence) · CLEAR vetoes LAST
(door-swings, aisles, center 2×2 — Law 8: tactical protections are load-bearing fun). Interactables
place BEFORE decorative dressing; NO camera-side bias (occlusion handles visibility — Stage A/P3-1d
law); light-affine entries seed real practicals (E0's mount path); traps → chokepoints;
portals/levers → finale/back-wall bias. Operates on D2's `plan.interactables[]`; deterministic.

### Verification (new `dev/verify-room-grammar.mjs`)
⊗ rhythm uniformity, ⊗ pairs mirror, ⊗ CLEAR veto (red-first each); nothing on a CLEAR cell or the
center 2×2; wall-mount entries land on wall cells per D1 `location`; determinism byte-check;
regressions: `verify-walk-binding`, `verify-dungeon-interior`, `verify-place-distribution`,
`check-manifest`.

### Out of scope
Typology art direction beyond the primitives (taste pass later); render.

---

## D4 — DOORS-FIRST render keystone  ·  branch `feat/d4-doors-first`  (after D3 AND after P3-3a AgX lands — touches theater-boot.js)

### Decision (BW5 IA-4's thin vertical slice — proves the whole stack)
ONE archetype rendered end-to-end: the door. The wall **aperture is cut to the rolled door's
silhouette** (arched → arched opening — the compiler's aperture path already exists from C4.1;
never a flat quad), the door renders as a shaped extrusion at its authored `extrudeDepth`, carrying
its rolled type + D0 `state` (shut/ajar/open/broken read visibly); a `state_transition` (shut→open)
animates on the BW4 tween channel; walking through fires the room transition under MF-2's crossfade
(the S0-1 slice: the ACTIVE room swaps — scoped to the transition itself, not the full one-room
conversion). E0-1's fade law applies (a door on a suppressed segment fades with it).

### Verification
⊗ RED FIRST: aperture matches the rolled silhouette (fails on the pre-D4 rectangular cut); door
state visibly distinct per state in captures; transition tween fires once (fake-clock); crossfade
room swap; fps ≥ current. Re-run the full graphics suite (`theater-shot` 107, `dungeon-interior`
287, `wall-occlusion` 23, `p3-1d-cutaway` 14, `e0-1-fixture-fade` 32, AgX's harness, loop gate 5/5)
+ `check-manifest`. **Visual: a study card per door state + a walk-through capture sequence — the
orchestrator READS them; Adam's taste gate before D5 scales to other archetypes.**

### Out of scope
Other archetypes' render (D5, after the taste gate + kit/Kenney red-pens); full one-room conversion;
archway glimpse; vertical slots.

## Adam's ledger
1. **D4 taste gate — FAILED 2026-07-14 (three rulings, now D4b's law).** The machinery (wiring/
   persistence/events/crossfade) is landed and sound; the door PRESENTATION failed.
2. **Kenney red-pen** (149 candidates) upgrades archetypes in place afterward — never blocks.
3. BW5's SEAM 3 (materials/conditions) rides Stage E, unchanged.

---

## D4b — Door presentation fix (Adam's taste-gate rulings)  ·  branch `fix/d4b-door-presentation`

### Adam's rulings (2026-07-14 — these ARE the decisions; do not re-litigate)
1. **"There's a big ass column right in front of the door, so I can't really even see it."** The
   study card must show the door with an UNOBSTRUCTED sightline: no pillar mass, no dressing piece
   (the vine arch sat in the door approach), nothing between camera and leaf. Also diagnose WHY the
   sightline was blocked: (a) is the chunky masonry mass around the door the doorframe/wall geometry
   itself rendering too massive? (b) can production dressing legally sit in a door's approach/apron
   (if dressPlan/scene pieces don't respect door aprons, file it as a finding — fix here only if it's
   a one-line apron check; else report for its own unit)?
2. **"There's a frame where the door is diagonal."** No state may read as a floating/diagonal slab.
   Ajar must read as a door CRACKED OPEN; broken must read as a door FALLEN OFF ITS HINGES (leaning
   against the jamb or flat on the floor at the threshold — grounded, in contact with named geometry,
   never floating mid-wall).
3. **"A door opens on hinges — a fixed point of rotation on a single axis, and that axis usually
   isn't the center of the door."** Retire the centerline pivot. The leaf rotates about a FIXED
   VERTICAL AXIS AT ONE JAMB EDGE. Hinge side: deterministic per sourceRef (hash-pick a jamb) until
   a rolled hinge fact exists — document the seam. All states derive from that axis: shut=0°,
   ajar≈20-25°, open≈100-110° (swung toward the wall, leaf face visible edge-on to the aperture),
   broken=detached from the axis, grounded per ruling 2. The BW4 tween animates rotation about the
   SAME hinge axis (never a teleport, never a centerline spin).

### Files
`src/ui/theater-boot.js` (the D4 door build + tween path — do NOT touch makeGradePass);
`dev/battle-gate/capture-d4-doors.mjs` (stage a clean-sightline scene: door on a fully visible wall,
apron clear, camera yaw chosen so the leaf and swing read); `dev/verify-d4-doors.mjs` (extend:
hinge-axis checks red-first).

### Verification
⊗ RED FIRST: leaf vertices at ajar/open rotate about the jamb edge (the hinge-edge vertex column is
INVARIANT under the state change; the far edge sweeps) — fails on the landed centerline pivot.
Broken leaf is grounded (min-Y at floor / leaning contact), never mid-wall. Tween rotates about the
same axis (fake-clock mid-pose check). Hinge side deterministic per sourceRef. Re-run the D4 suite
(verify-d4-doors extended, room-grammar 38, dungeon-interior 287, theater-shot 107, e0-1 32,
dm-events 70, manifest OK). RE-SHOOT the full study card + walk-through with the clean staging —
every state legible at a glance; this goes back to Adam's taste gate.

### Out of scope
Door art/texture (kit/Kenney lane); other archetypes (D5, still gated on the re-shot card); the
persisted-state/wiring machinery (landed, untouched).
