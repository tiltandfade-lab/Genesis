# Genesis — Scaling Architecture Audit (2026-06-20)

Written after the Step-3 modular carve (monolith 2047 → 668 lines, 21 modules). Focus: **does the current architecture hold up as modules multiply and a graphics engine eventually lands — and what's the migration path?** Grounded in the actual code, not theory.

## The reframe: two separate questions

"Classic scripts vs. ES modules" gets conflated with "does this scale." They're different axes:

- **A. The module *mechanism*** — classic `<script>` files sharing one global scope (today) vs. ES modules (`import`/`export`, private per-file scope).
- **B. The *state model*** — global mutable variables (`CGEN`, `BARDO`, `U`, …) that any module can read and write.

**B is the sharper scaling risk. A is healthier than it looks and its ceiling is distant.**

## Evidence (measured)

- **Modules are pure declarations.** Zero top-level executable code in any of the 21 modules (only function/const/let declarations). No load-order execution fragility; the shared-global-scope model is clean.
- **Inline event handlers: 59 total** — 10 in static HTML, 49 generated inside module HTML-strings (bardo 18, render 17, sheet 9, oracle 3, roster 1). These *require* their functions to be global → they are the hard lock-in to classic scripts and the thing that breaks first under ES modules.
- **Global mutable state references:** `CGEN` 193, `BARDO` 42, `SEED` 25, `CG_DRAG` 11, `ORC` 8, `FATE_CTX` 3 (≈282 excluding `U`). `U` (persistent universe) ≈55, but it already has a disciplined accessor layer (`loadU`/`saveU`/`activeWorld` in `world.state`).
- **Module sizes** are healthy: largest are `genesis.html` (668, the app core), `world.render` (201), `creator.bardo` (197); nothing pathological.

## Findings — real coupling the carve exposed

1. **`engine.core` ↔ `engine.tables` cycle.** `core.lookup` calls `fragAt` (tables); `tables.rollTbl` calls `rollDie` (core). Harmless intra-"engine" cycle, but a cycle.
2. **`world.state` calls *up* into UI/render.** `reveal()` → `toast` (ui.chrome); `showAllPanels()` → `renderWorld` (world.render). State triggering its own UI is a layering inversion — in a cleaner design state would emit an event the UI listens for.
3. **`engine.world-gen` writes to `world.state`** (`addLedger`/`ledgerOf`). Reasonable (generators log to the ledger), but it means "engine" sits above "state," so the dependency graph isn't a clean directory-ordered stack.
4. **Flat global namespace** — 163 owned symbols and climbing. `check-manifest` prevents *duplicate definitions*, but it's still one namespace; collision pressure rises with module count.

None of these break anything today. They're the load-bearing cracks to watch as the module count grows.

## Verdict

**A. The classic-script mechanism holds up — keep it for now.** Pure-declaration modules + the manifest index + `check-manifest` single-definition enforcement make adding modules cheap and safe. The ceiling is the flat namespace and the lack of dependency-direction enforcement (a `data/` module *could* call a UI function and nothing stops it). The trigger to leave classic scripts is **bundling/encapsulation pressure** — i.e., when you pull in npm libraries (a graphics engine) and want a build step. Not before; ES modules buy nothing until then, and cost the 59-handler rebind.

**B. The global mutable state is the thing to discipline.** `U` is fine (it has accessors and is the authoritative persistent store — consistent with the anti-drift thesis). The *transient* state (`CGEN`/`BARDO`/…) is mutated implicitly from ~282 sites across many modules; "who changed `CGEN`?" gets harder as features land. This is independent of the script mechanism.

**Graphics-engine readiness is already good structurally.** Render is separated from state (`world.render` reads, `world.state` holds, `engine.hexmap` does geometry). A graphics engine is a new render backend over the same state — the seam is correctly placed. The catch: `renderHexMap` returns SVG *strings*; a real canvas/WebGL/Three.js layer needs a retained scene graph + animation loop + a bundler. So **the graphics engine is the natural trigger for the ES-module migration** — do them together, and rebind the 59 inline handlers via event delegation in that same pass.

## Recommended sequencing (the "when to migrate" answer)

**Now — cheap and enforcing:**
- **Layer-direction check** in `check-manifest`: declare each module's layer; flag any call into a higher layer. Catches architectural drift as a build step. (Implemented in warn-mode 2026-06-20 — see findings #1–3 as the current known warnings; flip to hard-error once they're cleaned.)

**Soon:**
- ✅ **`GS` state namespace — DONE 2026-06-20.** All transient globals (`CGEN`/`BARDO`/`CG_DRAG`/`FATE_CTX`/`SEED`/`ORC`) moved into one `GS` object in `src/state.js` (~270 refs, AST-rewritten + jsdom-verified incl. a live inline-handler firing). `GS` is declared `var` so it lands on `window` — required so inline `on*` handlers can reach it. `U` left as-is (already has its accessor layer). It's *organizational, not enforcing* (any module can still write `GS.CGEN`) — true enforcement waits for ES-module encapsulation. New mutable state now goes in `GS`.
- Finish carving the ~668-line app core (play/flow, death/fate, DM-handoff) into `src/world/`; relocate `STAGES`, then pull the bardo data consts (`GUIDE`/`LIFE_STEP`/`WORLDBEATS`) into a data module.

**At the graphics engine — the trigger, not before:**
- Migrate to ES modules + a bundler; convert the 59 inline handlers to event delegation; let real encapsulation enforce the state discipline that `GS` only organizes.

## One-line summary

The architecture scales further than it looks **if** you add the layer-check now and discipline transient state before it sprawls; the ES-module migration is real but should ride in *with* the graphics engine, not ahead of it.
