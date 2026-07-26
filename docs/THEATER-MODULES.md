---
type: architecture
project: Genesis
updated: 2026-07-25
owner: Fable (split program, docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md)
---

# The Theater Module Map — after the theater-boot split

`src/ui/theater-boot.js` went from a 21,555-line monolith to a **7,518-line composition root**
plus **16 extracted ES modules** (B1–B9, branch `refactor/theater-boot-split`). This page is the
brief's "Architecture proof": each module's responsibility, inputs/outputs, state/resource
ownership, disposal, and who may import it. The import graph is **acyclic**; the root is the only
importer of leaves that carry root capabilities back in via `<name>Init(ctx)`.

## The shape

```text
classic callers (inline onclick, world/render.js, dm.js)
      │
      ▼
src/ui/theater-boot.js — COMPOSITION ROOT + window.Theater FACADE (7,518)
  owns: S (the one theater-state record), mount/reattach/retire, the dirty-frame + verb-tween
  schedulers, play/findUnit/rotate/zoom, the DOOR/KIT family (harness-pinned), the MF-2 grace
  glue, LIGHT_TUNABLES + its seed consts, all facade-settable flags, the two eval-time async
  preloads, buildTheaterCtx, and the ~219-key facade published in one place
      │ imports (and wires ctx into)
      ├── theater-clay-room.js      (5,248) — ?clayroom=1 workbench; clayRoomInit/SyncState
      ├── theater-light-lab.js        (769) — LL-1 lab UI; lightLabInit/SyncState/PublishSeams
      ├── theater-skins.js            (633) — pixel-skin family + FLOOR_MATERIAL_RECIPES
      ├── theater-whole-object.js     (528) — whole-object geometry/material caches, GLB path
      ├── theater-figure-build.js     (303) — figureFor/weaponMeshFor
      ├── theater-post.js             (765) — DoF/grade/bloom/AGX/EnvironmentAO suite
      ├── theater-dispose.js           (68) — pure disposal helpers
      ├── theater-lighting.js         (926) — profiles/celestial arc/flicker/camera key
      ├── theater-practicals.js       (865) — fixtures/glow/cones/emitters/placement
      ├── theater-motes.js            (199) — mote scheduler (own rAF)
      ├── theater-camera.js           (818) — placeCamera/fits/shot projection
      ├── theater-occlusion.js        (663) — sight/cutaway/bearing/clip-margin (THREE-free)
      ├── theater-sprites.js          (647) — sprite textures/billboards/depth-bias
      ├── theater-standee-mount.js    (469) — bases/contact pools/support metrics
      ├── theater-overlays.js         (437) — decals/effect cards/acting ring/floaters
      ├── theater-interior-mesh.js    (386) — instanced builders/texture caches
      ├── theater-dressing.js         (758) — dressing cards/furniture/wall props
      ├── theater-tabletop.js       (1,019) — setBoard/setUnits (flat realizer)
      └── theater-interior-realize.js (1,964) — setInteriorBoard as a 17-phase orchestrator
                  │ leaf→leaf imports (censused acyclic, identical specifiers)
                  ▼
   pre-split siblings: theater-parts, theater-figures, theater-verbs, standee-verbs,
   theater-shot, theater-room-mesh, theater-donor, spawn-grace, polygon-kernel
   + classic-script globals (theater-interior.js, theater-materials.js, clay-room.js,
     light-recipes.js, state.js)
```

## The completion-test answers (the brief's own questions)

- **Where is the renderer created and destroyed?** `theater-boot.js` — `mount()` / `retire()`.
- **Who owns the theater's state?** `theater-boot.js`'s `S` (every field declared in
  `createTheaterState()` since B0); S-reading modules hold a mirror re-synced by
  `<name>SyncState(S)` at both reassignment sites.
- **Camera framing / shot composition?** `theater-camera.js` (+ the pure planner in the
  pre-split `theater-shot.js`).
- **Lights, fixtures, flicker, shadows?** `theater-lighting.js` (profiles/arc/flicker/keys),
  `theater-practicals.js` (fixtures), `theater-post.js` (AO), shadow-caster budget in
  practicals; the tunable seed set stays in the root (the lab's scrape surface).
- **Sprites and bases/contact?** `theater-sprites.js` + `theater-standee-mount.js`.
- **A tabletop?** `theater-tabletop.js`. **An interior room?** `theater-interior-realize.js`
  (its header carries the 17-phase map with original line ranges).
- **Doors, dressing, occlusion, post?** Doors: the ROOT (deliberate — see decisions).
  Dressing: `theater-dressing.js`. Occlusion: `theater-occlusion.js`. Post: `theater-post.js`.
- **How does Clayroom observe/control production?** `theater-clay-room.js` receives every
  capability through `clayRoomInit(ctx)` from the root; it imports no production module except
  the four pre-split pure libs. The realizer fires `clayRoomAfterInteriorBoardRebuild` from its
  tail phase.
- **Which one file publishes the stable API?** `theater-boot.js` — the facade's ~219 keys are
  assembled there and ONLY there (verify-theater-surface pins the key set + per-key shape).

## Decision record (Fable's boundaries, alternatives rejected, retained coupling)

1. **No `theater-facade.js`.** The facade references root-only symbols (doors, mount/retire,
   play/findUnit, every flag) plus every leaf import; a facade module would need the whole root
   handed in as ctx — a second place for seams to hide, the exact cost the brief's own adapter
   caution names. The root = composition + publication IS "one place".
2. **Doors stay in the root.** dev/verify-d4-doors.mjs text-extracts 53 door/floor symbols from
   root source and sandbox-evals them; it is a genuinely good gate. Option (b) — rewrite it to
   import a `theater-doors.js` — is recorded in the B8 report with the full requirements
   (3 more floor-const harnesses + ctx→import conversions) as a follow-up, not smuggled in here.
3. **Tunables stay with their subsystems or the root** (B2's law) — no tunables module; the
   Light Lab scrapes, fold-lightlab.py round-trips, and capture-s5-flip-card mutates root text.
4. **The five schedulers stay separate** (dirty-frame, verb tween, flicker, mote, dev readout) —
   proven separate by census at B5, per the brief's measured-proof requirement.
5. **No transitional adapters anywhere** — every extraction was a clean move + import in one
   commit (the recon's own recommendation held up).
6. **Retained coupling, named:** the MF-2 grace glue stays root (shared by both realizer
   channels; moving it would invert the two-realizer peer law); `spriteAssetPathFor` +
   `spriteEntryFor` stay root (RED-FIRST harnesses mutate their bodies in root text);
   `mountLightProp` stays root (whole-object gate + grounding blob callers);
   `applyPsxShaderTweaks` — the file's only `onBeforeCompile` — never moved.
7. **The flag law:** every facade-settable `let` stays a root declaration; moved readers go
   through ctx accessors (13 accessor swaps across B4–B9 — the ONLY production-line changes in
   the whole split besides the sanctioned B9 decomposition; each carries an inline note).

## Proof surfaces (where the receipts live)

- Contract: `dev/fixtures/theater-surface-baseline.json` (219 keys) + `dev/verify-theater-surface.mjs`.
- Baseline census + the 19-by-hand law: `dev/fixtures/theater-split-b0-baseline.md`.
- Shader identity: the WebGL shaderSource fingerprint (59 unique GLSL, SHA pinned in every
  split commit message B4+) — byte-identical across the entire program.
- Visual equivalence: `dev/clay-captures/split-equivalence/` — 4 before/after pairs vs the
  pre-split tip; P1 bit-identical, P2–P4 at/below the instrument's same-code A/A noise floor.
- Lifecycle: B9's 3-cycle live probe (zero page errors, no canvas drift, stable mesh counts,
  A/A-controlled at HEAD).
- Performance: raw-loop FPS distributions overlap fully (±40% instrument spread both sides);
  memory parity; identical canvas count; the production-viewport vsync target unchanged.

## Follow-ups (recorded, not smuggled)

1. d4-doors option-b rewrite → then a `theater-doors.js` extraction (B8 report has the recipe).
2. `dev/capture-clayroom-ao-ab.cjs` clip-box nondeterminism (B4 finding) — pin the canvas size.
3. `dev/battle-gate/material-contract/contract.json` re-baseline (stale 07-13 bank; proven
   pre-existing).
4. The 16 pre-existing dead import bindings in the root.
5. verify-dungeon-interior §18's negative clause is structurally false-passing in composite
   (pre-existing) — rescope.
6. The env1*/torchlit pinned-look expectation — awaits Adam's verdict on the C3 torchlit change
   (clay lane owns the update).
7. verify-diegetic-light's 7 LFS-env reds — environmental; materialize assets or scope the check.
