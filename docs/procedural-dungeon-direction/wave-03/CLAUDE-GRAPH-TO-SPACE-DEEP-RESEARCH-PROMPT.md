# Claude prompt — modern graph-to-space and tactical-composition solver research

Continue the Genesis procedural-dungeon redesign as a **research-only Wave 3 investigation**. Do not implement
code, create a worktree, materialize LFS assets, merge, push, or run full CI. Do not touch or stage
`Reference/FFT Battle Maps/`; it must remain untracked. Return the research report in chat so the active design
record can reconcile it later without parallel-file edits.

Read, in order:

1. `CLAUDE.md`
2. the newest block of `docs/HANDOFF.md`
3. `docs/PROCEDURAL-DUNGEON-DIRECTION.md`
4. `docs/procedural-dungeon-direction/FOUNDATION.md`
5. `docs/BATTLEMAP-TOWNTRAY-COMPOSITION.md`
6. `docs/PROCEDURAL-DUNGEON-RESEARCH.md` section 13, especially the GaneshaDx addendum
7. `docs/procedural-dungeon-direction/wave-03/README.md`
8. `docs/procedural-dungeon-direction/wave-03/01-questionnaire-and-triage.md`, especially sections 12.3 and
   12.5-12.7
9. `docs/ROOM-GRAMMAR.md`
10. `Reference/Procedural-Dungeon-Research/SOURCE-INDEX.md` and especially local source S10,
    `Reference/Procedural-Dungeon-Research/papers/10-mueller-2006-procedural-modeling-buildings.pdf`

## Research question

Find the best modern, existing algorithms, solvers, libraries, representations, and production precedents for
turning Genesis's canonical functional/connectivity graph plus room/region area, adjacency, depth, circulation,
scale, portal, elevation, support, tactical, history, and site-boundary constraints into coherent, beautiful,
deterministic 2.5D/3D dungeon geometry **without inventing or losing graph edges**.

We are not trying to emulate Final Fantasy Tactics technologically. FFT is a visual and level-design reference for
coherent elevation masses, strong landmarks, shaped negative space, readable approaches, sparse structural
dressing, tactical terrain, sprite/material application, and four-diagonal-view composition. GaneshaDx offers a
useful terrain-versus-decorative-data boundary and greybox proof, but it does not supply Genesis's generator.
Genesis should use the best appropriate modern techniques while retaining its own rolls, exact mechanics, hybrid
pixel/3D art direction, trim/material pipeline, and provider-neutral DM seat.

## Baseline architecture to test, not assume

```text
rolls / walk facts / place or venue program
  -> SpatialIntent
  -> SpatialPlanV2 legality
  -> TacticalCompositionPlan
  -> SurfaceAssemblyPlan
  -> BattleMap / SceneTray / TownTray
  -> governed shots, materials, sprites, and DM-seat facts
```

Current recommendation B is a staged, constraint-preserving embedding: stable graph-edge ids; bounded candidate
generation; hard rejection before transparent soft scoring; bounded backtracking; explicit degradation; and
plain-language unsatisfied output. Determine whether research should refine, hybridize, or replace any part of that
vision.

## Required research breadth

Investigate at least these families and find any important missing family:

1. constraint programming and optimization: CP-SAT, SAT/SMT, answer-set programming, mixed-integer programming,
   exact cover, difference constraints, and current usable solvers;
2. graph realization and floorplanning: orthogonal graph drawing, rectangular dual/layout methods, slicing and
   non-slicing floorplans, VLSI floorplanning analogies, contact graphs, visibility representations, cartograms,
   constrained triangulation, and polygon/volume packing;
3. procedural level-design systems: mission/space graph grammars, shape grammars, split grammars, L-systems,
   model synthesis/Wave Function Collapse, BSP/Voronoi/maze families, agent/turtle methods, evolutionary and
   search-based PCG, MAP-Elites/quality-diversity, MCTS, and mixed-initiative precedents;
4. modern scene and geometry representations: grids/voxels, signed distance fields, navigation meshes, half-edge
   or cell complexes, layered heightfields, stacked surfaces, portals, constructive solid geometry, geometry nodes,
   and hybrid semantic graph plus mesh arrangements;
5. existing open-source or commercial libraries/tools that might provide reusable solving components rather than
   inspiration only—including JavaScript/WebAssembly feasibility for Genesis;
6. current research or tools for authored-feeling tactical composition, landmark/route/elevation/negative-space
   scoring, occlusion/readability evaluation, and generation under four governed camera yaws; and
7. production lessons from FFT/GaneshaDx and more modern tactics, immersive-sim, roguelike, city/floorplan, and
   procedural-architecture systems, while distinguishing observed facts, published developer claims, and our
   inference.

Search broadly and currently. Prefer primary sources: papers, official documentation, official repositories,
maintainer documentation, and direct developer talks/postmortems. Verify current maintenance, versions, licenses,
platforms, determinism, and dependency weight. Do not rely on roundup articles when a primary source exists. Do
not recommend importing GPL code into Genesis; GPL projects may remain research references. Do not assume an
academic method has production-ready code.

## Genesis-specific evaluation criteria

Evaluate every serious candidate against:

- preserves canonical nouns and every required graph edge;
- supports disconnected-looking but legally connected forms, loops, secrets, vertical connectors, multiple scale
  domains, builder/current-occupant mismatch, natural/constructed hybrids, and historical transformations;
- separates hard canon, arrangeable canon, derived support, and decorative opportunity;
- produces stable ids, provenance, deterministic replay, saved compiled sites, and incremental mutations;
- supports exact five-foot tactical cells while allowing continuous visual geometry and local surface frames;
- handles stacked surfaces, bridges, water/void, slopes, stairs, ramps, lifts, drops, apertures, supports, and
  destructible structures without making rendering the authority;
- integrates typed reservations, structural stamp sockets, legal transforms, and explicit failure/degradation;
- can generate several bounded candidates and explain rejection/score tradeoffs;
- can be prototyped on Adam's Intel MacBook Pro with effectively no tool budget;
- can eventually reach 2026-quality composition without requiring runtime cloud solving;
- has acceptable licensing, bundle size, performance, maintenance, debuggability, and JavaScript/WebAssembly or
  offline-tool integration potential; and
- preserves a no-human production pipeline with reproducible diagnostics and four-yaw captures.

## Required deliverable

Return a structured report with:

1. **Executive finding:** whether staged `SpatialPlanV2 -> TacticalCompositionPlan -> SurfaceAssemblyPlan` remains
   the best architecture and the strongest refinements research suggests.
2. **Problem decomposition:** separate topology preservation, geometric embedding, elevation/connector realization,
   structural/stamp assembly, tactical composition scoring, material/surface assembly, and visual validation.
3. **Evidence matrix:** method/tool, primary source, what it solves, what it does not, dimensionality, deterministic
   behavior, license, language/runtime, maintenance, Mac feasibility, Web/JS feasibility, integration cost, and
   Genesis fit/risk.
4. **Shortlist:** rank the best three to five solver or hybrid approaches. Include the best no-budget prototype
   option and any later funded/compiled/WASM option.
5. **Pre-existing implementations:** identify exact libraries/repositories worth read-only inspection. State
   clearly whether each is reusable, research-only, abandoned, GPL-contaminating, or unsuitable.
6. **Recommended prototype experiment:** one retained small dungeon fixture, exact inputs/outputs, candidate count,
   constraints, diagnostics, success/failure criteria, and what result would falsify the recommendation. Do not
   implement it.
7. **MVP and ideal path:** explain which solver machinery belongs in the first Mac proof, playable MVP, and mature
   feature goal, including costs and promotion triggers.
8. **FFT translation:** list the visual/compositional lessons to retain and the 1990s representation/technology
   constraints Genesis should not inherit.
9. **Risks and honest unknowns:** especially authored-feeling composition metrics, three-dimensional packing,
   solver brittleness, content/grammar cost, performance, and explainability.
10. **Decision delta:** identify exactly which Wave 3 question 5 conclusions can be accepted now, which need a
    narrow prototype, and which genuinely require Adam's taste after real captures. Do not turn technical choices
    into founder rubber stamps.

Use concrete dungeon examples throughout. Separate evidence, inference, and recommendation. Cite links directly
beside claims. Preserve provider-neutral DM-seat and canonical-versus-render-only authority. Wave 3 must remain
open, and the report must not claim implementation or wave completion.
