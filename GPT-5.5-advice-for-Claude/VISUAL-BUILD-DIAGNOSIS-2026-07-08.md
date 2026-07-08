---
type: advice
project: Genesis
status: fresh diagnosis after overnight tabletop/visual build
created: 2026-07-08
scope: visual build wiring, tabletop stage, combat model integration
---

# VISUAL BUILD DIAGNOSIS - 2026-07-08

## TL;DR

The build is not simply "unwired." The main theater mount/sync path is present and the focused
JS harnesses are green. The mess is that several visual systems are now layered together with
soft-fallback behavior, so failures become "looks generic / cuboid / empty / stale" instead of
hard errors.

The biggest risks are:

1. Real-browser standing-table behavior still needs verification. The overnight report says the
   non-combat tableau did not paint because the visible `#theaterStage` host was missing outside
   combat. Current `src/world/render.js` now appears patched with a mount probe and non-combat
   tray/cast sync, but that must be proved in Chrome, not jsdom.
2. Combat model selection is brittle but not absent. `theaterUnitsFrom` passes `f.modelKey ||
   f.statId` into the renderer, and all realm model values currently resolve. But 573 of 1,307
   realm `model` values resolve through aliases, not exact bespoke models, so a lot of realm foes
   will still look like generic stand-ins by design.
3. Cuboids are still an intentional fallback path. Any missing builder, async-not-loaded builder,
   thrown geometry build, or no render key drops into recipe/cuboid rendering. That protects the
   game from blank pieces, but it also masks broken or delayed whole-object models.
4. The current docs and comments disagree in places. `genesis.html` still says theater panel wiring
   is a later pass, while `render.js` now mounts and syncs it. The doc drift makes it easy for the
   next executor to "fix" the wrong layer.

## What I Verified

- `node dev/verify-theater-figures.mjs` passes: 38 passed, 0 failed.
- `node dev/verify-battle-stage.mjs` passes: 42 passed, 0 failed.
- `node dev/verify-model-grammar.mjs` passes: 87 passed, 0 failed.
- `python3 build/check-manifest.py` returns `RESULT: OK` with existing layer warnings.
- Core bestiary model coverage audit:
  - 510 bestiary IDs total.
  - 117 exact whole-object registry hits.
  - 393 alias hits through `NEAREST_SUB`.
  - 0 unresolved.
- Realm model coverage audit:
  - 1,307 realm entries with `model`.
  - 734 exact whole-object registry hits.
  - 573 alias hits.
  - 0 unresolved.

Those numbers mean the data is "wired enough to resolve," but not "every foe has its own visual."

## Main Wiring Facts

`src/world/render.js` now tries to mount the theater once a session is live, not only in combat.
The mount probe is emitted when `inSession && !stageMode`, and `theaterStageSync` mounts to
`#theaterStage`. Once mounted, it pushes combat boards/units during combat and tray/cast boards
outside combat.

Key seams:

- `src/world/render.js:357` emits the hidden mount probe.
- `src/world/render.js:369` renders the stage/feed two-column body when `showStage` is true.
- `src/world/render.js:474` owns `theaterStageSync`.
- `src/world/render.js:496` pushes combat board/units.
- `src/world/render.js:517` pushes non-combat tray/cast board/units.

So if the standing tableau is still blank in the browser, the bug is probably one of:

- `w.sessionLive` false when the user expects the stage.
- mount succeeds on the hidden probe but reattach/layout produces a zero-size or detached canvas.
- `theaterStageHtml` still returns empty/non-host markup for the non-combat visible branch.
- `castFrom` produces units, but model builders are not settled yet or the render dirty-key skips a needed rebuild.

## Combat Model Wiring Diagnosis

Combat units are stamped in `src/engine/theater-data.js`.

- PC/ally figures prefer `className`, so they resolve to `class:<class>`.
- Foes use `recipeSlug: f.modelKey || f.statId || null`.
- Realm-reskinned foes therefore can render from their realm `model` instead of their stat frame.

The renderer then resolves whole-object figures before recipe/cuboid figures:

- `src/ui/theater-boot.js:2240` maps PC/ally classes to `class:*`; foes keep `recipeSlug`.
- `src/ui/theater-boot.js:2251` resolves whole-object figures first.
- `src/ui/theater-boot.js:1067` returns null if the entry has no loaded builder.
- null falls through to recipe/cuboid rendering instead of crashing.

This is why "some old cuboid models are still there" can happen even when the model data is present:
the cuboid path is the safety net, and the system does not visibly report when it used that safety net.

## Likely Problems

### 1. Browser-only stage bugs are under-tested

The overnight report explicitly says real Chrome found combat painting but the standing tableau empty.
The jsdom harness passed because it stubs Theater and mostly checks DOM/data calls. Current `render.js`
looks patched after that report, but this needs a real WebGL check:

1. Start a live session.
2. Verify non-combat stage has a visible `#theaterStage` host.
3. Verify `Theater.setBoard` and `Theater.setUnits` receive non-empty standing data.
4. Enter combat.
5. End combat.
6. Verify the same canvas relaxes back to the standing tableau.

### 2. "Resolved" does not mean "specific"

573 realm model values resolve through aliases. That is not broken wiring, but it is visually weak.
Examples from the audit include many realm entries whose `model` is a base stat/body key such as
`scarecrow`, `scout`, `bandit-enforcer`, `giant-vulture`, `specter`, `rhinoceros`, etc. If the alias
target is visually generic, combat will look generic.

Recommended next audit: produce a ranked list of the most common alias targets in live realm combat
and upgrade only the top 20-40, rather than trying to polish all 573 at once.

### 3. Whole-object load failures are invisible

`loadWholeObjectBuilders` catches every dynamic import failure and leaves that entry without `build`.
`figureFor` then silently falls back. This is correct for play safety, but bad for diagnosing visual
coverage.

Add a dev-only counter/report:

- requested whole-object key
- exact vs alias vs blank
- builder loaded vs not loaded
- geometry built vs threw
- final renderer path: whole-object, recipe, archetype cuboid, blank

Expose it as `window.Theater.stats.modelPaths` or a debug overlay. Without that, every visual miss
looks like taste rather than a traceable pipeline decision.

### 4. Model identity competes with stat-frame identity

Realm combat carries both `statId` and `modelKey`. The renderer prefers `modelKey`, which is good.
But flavor/actions/conditions still come from the stat frame. This is a sane architecture, but it
needs a visual contract:

- `frame` owns mechanics.
- `model` owns appearance.
- if `model` aliases to a base frame, the piece is a substitute, not a bespoke realm model.

Document this in the combat debug view so the user can see "Dust-Broke Drifter rendered as bandit."

### 5. Comments are stale enough to mislead

`genesis.html` still contains a comment saying panel mount wiring is a later integration pass. That
was true for the original theater boot module, but not true after `render.js` gained `theaterStageSync`.
Stale comments are not a runtime bug, but they are hazardous in this repo because the build is already
split across classic scripts and ES modules.

## Recommended Repair Order

1. Real-browser QA first. Do not write more visual systems until the current stage is observed in Chrome
   across idle/walk/combat/end-combat.
2. Add model-path instrumentation. This will immediately tell us whether a cuboid is caused by no key,
   alias, unloaded builder, thrown geometry, or intentional recipe fallback.
3. Fix any non-combat host/reattach issue found by Chrome. Treat the overnight standing-table report as
   "reported, possibly patched, unverified."
4. Make a realm alias heatmap. Upgrade exact models only where they will actually show up often.
5. Rescope parked U5 to overlays-only. Do not reintroduce its corpse channel unless you deliberately
   replace the landed U6 unit-based corpse model.

## Things Not To Do Yet

- Do not refactor the whole theater module boundary just to chase this. The ES-module island is messy
  but functioning.
- Do not delete the cuboid fallback. It is the reason the app keeps rendering when models miss.
- Do not merge U5's corpse plumbing over U6 without a design ruling. The overnight report says those
  two approaches conflict.
- Do not trust only jsdom for this surface. The failure class is canvas/layout/WebGL, so browser proof
  is mandatory.

## Bottom Line

The stage is partially wired and mostly test-green, but the product can still look unwired because the
fallbacks are quiet and many "model" values are aliases rather than bespoke appearances. The next best
move is not a big rewrite. It is a real browser proof plus a model-path debug report so the visual
pipeline stops being a black box.
