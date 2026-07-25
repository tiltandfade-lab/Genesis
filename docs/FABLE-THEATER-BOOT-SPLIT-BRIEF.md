---
type: agent-brief
project: Genesis
status: READY FOR FABLE
created: 2026-07-25
owner: Adam / Fable
scope: behavior-preserving decomposition of src/ui/theater-boot.js
governed_by:
  - docs/GRAPHICS-CONVERGENCE-CHARTER.md
  - docs/CLAYROOM-RESET-LADDER.md
  - docs/BATTLE-THEATER.md
  - docs/ART-DEPARTMENT.md
---

# Fable Brief — split `theater-boot.js` without redesigning the theater

## Adam's request, in plain English

`src/ui/theater-boot.js` has grown to roughly 17,100 lines and now contains several different
graphics systems. Split it into understandable modules so future work—especially the Guard
Post—does not keep making one file larger and riskier.

This is an architectural cleanup, not a visual redesign. The game should look and behave the same
when the split lands. Fable has authority to choose the exact module names, number of modules,
interfaces, extraction order, and reasonable internal cleanup needed to make the result coherent.

The Guard Post remains the important product proof. This refactor should make that work safer and
faster; it must not become a long engine-rewrite detour before the Guard Post can continue.

## Outcome

When this is done:

- `theater-boot.js` is the small composition root and classic-script facade, not the home of every
  renderer feature.
- Each major theater responsibility has one obvious home.
- Dependencies point inward toward explicit contracts rather than back toward `theater-boot.js`.
- State, GPU resources, timers, animation loops, and disposal ownership are unambiguous.
- `window.Theater` remains compatible with every current caller and verification harness.
- A future Guard Post feature can usually change one subsystem instead of reopening a 17,000-line
  file.
- The split does not claim to migrate Three.js, WebGL, shaders, post-processing, or art direction.

There is no pass condition based only on reducing the line count. A smaller file with hidden cycles,
duplicated state, or unclear cleanup is not an improvement.

## What is actually inside the file now

Treat this as orientation, not a mandatory set of cut lines. Fable should make the final dependency
census from the live file before moving code.

The current file broadly contains:

1. **Figure, sprite, texture, and material realization**
   - procedural figure materials and pixel skins;
   - whole-object and GLB conversion/caches;
   - sprite registry resolution, texture loading, billboards, bases, contact pools, and selection
     glow;
   - procedural fallback figures and weapons.
2. **Scene objects and interaction presentation**
   - interactable doors and donor-kit doors;
   - decals, effect cards, acting rings, floaters, and selection;
   - dressing cards, furniture, wall props, and extrusion props.
3. **Renderer runtime**
   - the private theater state record;
   - WebGL renderer, scene, cameras, render-on-demand scheduling, resize handling, and teardown;
   - post-processing composer, DoF, bloom, grade, and output handling.
4. **Camera and composition**
   - tabletop fit, interior fit, zoom, rotation, camera tweens;
   - shot-composer projection and framing;
   - occluder classification, cutaways, and fade hysteresis.
5. **Lighting and atmosphere**
   - tabletop profiles and celestial arcs;
   - interior key/fill/camera light;
   - practical fixtures, point-light placement, shadows, emitter geometry, flicker, and motes.
6. **Two scene realizers**
   - the flat tabletop path (`setBoard` / `setUnits`);
   - the interior path (`setInteriorBoard`), including instanced geometry, room shells, doors,
     pieces, dressing, combat grid, placement nudges, and camera/lighting orchestration.
7. **Animation and resource lifecycle**
   - the bridge into the already-separated theater/standee verb modules;
   - multiple deliberately separate animation schedulers;
   - cache disposal, remount, async asset-arrival replay, and render invalidation.
8. **Developer surfaces and diagnostics**
   - the large `window.Theater` diagnostic/test surface;
   - Lighting Lab;
   - the complete Clayroom workbench, picking, movement proof, lighting proof, and teardown.

The module header and the `manifest.json` description still emphasize an older, much smaller
Theater surface. They are useful history but are not a complete inventory of the live contract.
Inventory the runtime object and real call sites before deciding what is public.

## Suggested architecture, not a prescribed file list

The dependency shape matters more than these names:

```text
classic callers
      |
      v
theater-boot.js
  composition root + window.Theater facade
      |
      +--> runtime/state/lifecycle
      +--> renderer + post-processing
      +--> camera/shot composition
      +--> lighting/atmosphere
      +--> figures/standees/resources
      +--> tabletop realizer
      +--> interior realizer
      +--> optional dev labs and diagnostics
                  |
                  v
        existing pure/data modules
```

A reasonable result might use some or all of these responsibility families:

- **Runtime/state/lifecycle:** creates the one theater instance, owns mount/reattach/retire, resize,
  dirty rendering, scheduler coordination, and the renderer/canvas.
- **GPU resources/materials:** owns Three.js texture/material/geometry caches and their explicit
  disposal. This may remain several modules if figure resources and environment resources have
  meaningfully different lifecycles.
- **Figures/standees:** resolves and realizes figures, sprites, bases, contact treatment, selection,
  whole-object fallbacks, and billboarding. Preserve the pixel sprite register as canonical.
- **Camera/composition:** owns camera fit, rotation, zoom, camera tweens, shot projection, and the
  camera-facing half of occlusion.
- **Lighting/atmosphere:** owns profiles, practical fixtures, shadow casters, flicker, environment
  fill, celestial light, and motes. Fable may separate practicals from atmosphere if that produces a
  cleaner contract.
- **Post-processing:** owns composer/pass creation, resolution sync, enabled state, and disposal.
- **Tabletop realizer:** builds the flat tray, props, units, and tabletop presentation.
- **Interior realizer:** builds a room from already-compiled interior data and coordinates room
  shell, doors, pieces, dressing, collision-safe placement, cutaway, light, and camera services.
  Large leaf families such as doors or occlusion may remain separate modules.
- **Dev tools:** Lighting Lab and Clayroom can become optional clients/plugins of the production
  theater instead of living inside its implementation. With their flags off, they must retain their
  current near-zero runtime cost.
- **Facade/diagnostics:** publishes the stable `window.Theater` contract and attaches diagnostic
  accessors without giving the rest of the app direct access to internal mutable state.

Fable may combine families where separating them would create noisy pass-through wrappers. Fable may
also split a genuinely independent leaf—doors, occlusion, sprites, or practical lights—more finely.
The goal is a small number of coherent homes, not one file per function.

## State and dependency direction

The current shared private `S` object is both useful and heavily coupled. The split must not replace
it with several unsynchronized versions of the truth.

Fable may choose factories, controller objects, capability contexts, explicit state slices, or
dependency injection. The following outcomes are required:

- one authoritative theater-instance state;
- no subsystem imports `theater-boot.js`;
- no circular import graph hidden behind mutable module globals;
- no new direct `window` or `GS` reads in leaf rendering modules when a narrow input can be passed;
- caches name their owner and expose a reliable end-of-life path;
- timers and animation loops name the owner that starts and stops them;
- async asset completion cannot resurrect a retired theater;
- dev tooling observes or calls supported capabilities rather than reaching into duplicated state.

A factory shape such as the following is one possible approach, not a requirement:

```js
const runtime = createTheaterRuntime({
  THREE,
  addons,
  dataAdapters,
  devPlugins
});

window.Theater = runtime.publicApi;
```

Do not build an elaborate generic-engine abstraction merely to appear WebGPU-ready. It is enough to
concentrate renderer/context/composer construction and keep high-level scene inputs independent of
WebGL diagnostics where practical. A real WebGPU/TSL qualification is a separate future project.

## Protected contracts

These must survive the split:

- The live `window.Theater` production API and every currently used diagnostic/test key.
- Null-safe calls before mount and clean `mount() === false` degradation without WebGL.
- Vendored, offline-safe Three.js/addon loading; no runtime CDN or network dependency.
- The current tabletop/interior distinction and their correct replay routing.
- Render-on-demand while idle.
- The intentional separation between the dirty-frame scheduler, verb tween scheduler, practical
  flicker scheduler, mote scheduler, and dev readout timers. Fable may unify loops only with measured
  proof that cadence, smoothness, idling, and cleanup remain correct.
- Deterministic seeds, placement, visual provenance, and unchanged consumption of canonical scene
  facts.
- Pixel sprites as the canonical live figure register, including scale, alpha/depth behavior,
  billboarding, base/contact treatment, selection feedback, and fallbacks.
- Existing camera framing, zoom range, rotation behavior, shot composition, cutaway, and occlusion.
- Existing practical-light placement, light/emitter parity, smooth shadowing, flicker, environment
  fill, post-processing, and color-space behavior.
- Collision-safe standee placement and current movement/door projection.
- All current teardown guarantees: GPU disposal, canvas removal, event-listener removal, timer/rAF
  cancellation, tween completion cleanup, and clean remount.
- Clayroom and Lighting Lab cold boot, flag-off cost, live proofs, and unmount behavior.
- The graphics charter: graphics consume canonical facts and never become their owner.

Before extraction, capture the exact live `window.Theater` key set and all repo call sites. The
source header is not sufficient evidence.

## Explicit non-goals

Do not combine this refactor with:

- a Three.js version upgrade;
- a WebGPU renderer migration;
- a TSL or shader rewrite;
- new visual features or art-direction tuning;
- changed light values, shadow softness, AO, materials, camera values, sprite scale, or post grade;
- Guard Post construction;
- a classic-script-to-ES-module migration for the rest of Genesis;
- a new bundler or required build step;
- new external dependencies;
- removal or weakening of diagnostic seams because they make the file look smaller.

If the split exposes a real defect, record it. Fable may repair it in a separate, clearly labeled
commit only when it blocks safe ownership or verification. Do not hide a visual or gameplay change
inside a move-only commit.

## Fable's decision room

Fable owns:

- exact filenames and module count;
- the order of extraction;
- factory/controller/function style;
- whether Three.js is imported by a subsystem or supplied through a capability object;
- whether state is passed as a whole private instance or through narrow services;
- which caches belong together;
- which large leaf systems deserve their own module;
- whether transitional compatibility adapters make the migration safer;
- how much code remains in `theater-boot.js` when keeping it there is clearer;
- internal naming cleanup and deduplication that can be proven behavior-neutral;
- whether the work lands as several small commits or a short sequence of branch checkpoints.

Fable does not need Adam to approve ordinary technical choices within those boundaries. Stop and ask
only if the work would change a visible result, public behavior, canonical fact, supported workflow,
dependency policy, or the Guard Post schedule materially.

## Suggested migration method

This ordering is intentionally flexible:

1. **Census and freeze the contract**
   - Record the current import graph, live `window.Theater` keys, module-scope mutable caches/flags,
     state fields, schedulers, event listeners, async replay sites, and disposal sites.
   - Run and record the relevant baseline harnesses and fixed-camera captures on the same machine.
   - Identify baseline failures honestly, including missing-LFS failures; never convert them into
     exemptions merely to make the refactor green.
2. **Establish the composition seam**
   - Introduce the minimum dependency/context shape needed for leaf modules.
   - Keep `window.Theater` assembled in one place.
3. **Extract low-risk leaves**
   - Prefer cohesive helpers with obvious inputs and explicit cache lifecycle.
   - Keep each extraction runnable and reviewable.
4. **Extract stateful controllers**
   - Camera, post, lighting, figures/resources, and animation bridges should receive the capabilities
     they need rather than finding the facade.
5. **Separate the two scene realizers**
   - Preserve the flat tabletop and interior paths as distinct consumers of shared capabilities.
   - Keep `setInteriorBoard` orchestration readable; do not merely move a single 5,000-line function
     unchanged and call the split complete.
6. **Move dev surfaces behind supported hooks**
   - Preserve Clayroom and Lighting Lab exactly, including cold boot and teardown.
7. **Remove transitional glue**
   - Check for cycles, duplicate state, duplicate disposal, stale descriptions, dead compatibility
     exports, and features that accidentally still require edits in the old file.

Fable may reorder these steps after the dependency census. One coherent extraction per checkpoint is
safer than a single mechanical cut-and-paste diff.

## Required proof

### 1. Public-contract proof

- Before/after snapshots of `Object.keys(window.Theater).sort()` match.
- Every actual repo call site still resolves.
- Production API methods retain their pre-mount, mounted, retired, and remounted behavior.
- Diagnostic accessors may be internally delegated but may not disappear or change shape silently.

### 2. Lifecycle proof

Exercise at least three complete mount → render → retire cycles and prove:

- one intended canvas/context per theater;
- no duplicate resize/pointer listeners;
- no live theater rAF, interval, or timeout chain after retirement;
- no async replay resurrects retired state;
- no disposed cache object is reused after remount;
- no duplicate scene lights, post passes, figures, or dev panels accumulate.

### 3. Engineering regression proof

Build the exact relevant harness census before beginning. At minimum, include the live gates for:

- battle stage and theater API/data;
- tabletop and interior rendering;
- figures, sprites, sprite joins, and standee verbs;
- camera fit/tweens, shot composition, and frustum;
- lighting profiles, practical lights, shadows, flicker, and Lighting Lab;
- room shell, doors, dressing, occlusion/cutaway, and combat-in-room;
- Clayroom movement, lighting, provenance, and teardown;
- manifest integrity.

Run `python3 build/check-manifest.py` after every module change. Run the broader relevant theater
sweep at each coherent checkpoint and at branch close. A baseline red remains a red with an explicit
unchanged explanation; validators must never be weakened to accept the split.

### 4. Visual proof for Adam

Always demonstrate the result. Produce paired before/after fixed-camera captures on the same machine,
same seed, same viewport, and same settled asset state:

1. flat tabletop with several unit sizes;
2. an ordinary interior with doors, occlusion, dressing, and practical light;
3. the Clayroom sprite/lighting fixture;
4. a dark interior exercising environment fill, contact, cast shadows, and post-processing.

The intended result is visual equivalence. Any measurable pixel difference must be explained and
either proven harmless or treated as a separate visual change for Adam to review.

### 5. Performance proof

- No new continuously running loop while the theater is idle.
- No additional WebGL contexts.
- No material/geometry/light multiplication from imports or remounts.
- Representative frame time, draw calls, and memory/resource counts remain within baseline noise.
- Dev flags remain practically free when disabled.

### 6. Architecture proof

Provide a final one-page module map showing:

- each module's responsibility;
- its inputs and outputs;
- its state/resource ownership;
- its disposal responsibility;
- which other theater modules may import it.

The import graph must be acyclic. `theater-boot.js` is the root; leaf modules do not import the root
or reach around it to mutate the facade.

## Deliverables

1. The behavior-preserving module split.
2. Updated `manifest.json` entries/descriptions for every new module.
3. Updated architecture documentation describing the landed module map.
4. A contract snapshot and relevant harness census.
5. Before/after visual capture packet for Adam.
6. Lifecycle and performance receipts.
7. A short Fable decision record explaining the boundaries chosen, alternatives rejected, and any
   deliberately retained coupling.
8. A separate follow-up list for genuine defects or visual improvements discovered but not smuggled
   into the refactor.

## Completion test

The split is ready when a new graphics contributor can answer these questions without reading a
17,000-line file:

- Where is the renderer created and destroyed?
- Who owns the theater's state?
- Where do camera framing and shot composition live?
- Where are lights, practical fixtures, flicker, and shadows controlled?
- Where are sprites and their bases/contact behavior built?
- Where is a tabletop constructed?
- Where is an interior room constructed?
- Where do doors, dressing, occlusion, and post-processing live?
- How does Clayroom observe and control the real production systems?
- Which one file publishes the stable API to the rest of Genesis?

If those answers are clear, the captures match, the lifecycle is clean, and the Guard Post can
continue without routing every graphics change through `theater-boot.js`, the assignment has
succeeded.
