---
type: research-input
status: RETAINED-UNVERIFIED-IN-PART
created: 2026-07-22
source: Claude research synopsis supplied by Adam
authority: Research evidence only; not an accepted design ruling, dependency admission, implementation spec, or license approval
---

# Retention note

This file preserves the complete Claude research synopsis Adam supplied during the Wave 3 P3.5 discussion. The
report is valuable research input, but its recommendations and package claims do not become Genesis canon merely
by being retained. The reconciled decision delta belongs in the chronological Wave 3 record. In particular:

- rectangular-dual methods apply to qualifying planar/triangulated graph classes and are a candidate generator or
  feasibility family, not proof that every canonical Genesis graph has a rectangle-exact realization;
- the rectangular -> orthogonal -> irregular ladder is a promising ordered representation fallback, not permission
  to invent/drop graph edges or silently convert a functional edge into physical room contact;
- clingo-wasm, Z3, MiniZinc/Gecode, Manifold, Recast, and every other named library remain candidates pending a
  task-specific runtime, determinism, license, bundle, maintenance, and authority audit;
- the six composition metrics are explainable diagnostic/score hypotheses whose weights and usefulness require
  retained captures; and
- the user-supplied report remains verbatim below, including duplicated Markdown-link syntax and any claims that
  later verification may refine.

---

# Genesis Wave 3 — Graph-to-Space & Tactical-Composition Solver Research

**Status:** Research-only investigation answering P3.5 ("graph-to-space realization"). Wave 3 remains OPEN. No implementation, worktree, asset, merge, push, or CI is claimed or authorized. `Reference/FFT Battle Maps/` was not read or staged. This report is a chat deliverable for the active design record to reconcile, not a parallel design file.

**Method:** Seven parallel primary-source web-research passes (constraint/optimization solvers; graph realization & floorplanning; PCG level-design systems; scene/geometry representations; shippable JS/WASM solver libraries; tactical-composition scoring; FFT/production lessons) plus one grounding pass over the nine specified internal docs. Claims are tagged **[E]** evidence (fetched primary source), **[D]** developer/author claim (stated, not independently re-derived), **[I]** inference/synthesis. Links sit beside claims.

**Authority note carried throughout:** rollers author intent/constraints/provenance and never coordinates; the compiler solves geometry; the renderer consumes and may refine mesh but never decides legality; the **provider-neutral DM-seat** receives semantic facts and committed results only. Nothing below promotes render-only detail to canon or lets a solver invent a noun.

---

## 1. Executive finding

**Keep the staged pipeline. Recommendation B is confirmed, and the research sharpens it rather than replacing it.** `SpatialIntent -> SpatialPlanV2 (legality) -> TacticalCompositionPlan -> SurfaceAssemblyPlan -> BattleMap/SceneTray/TownTray` is the correct spine. Every serious precedent found either fixes a graph and does no geometry (Smith & Padget's ASP graph generator, [[pcgworkshop.com/archive/smith2018graphbased.pdf](https://www.pcgworkshop.com/archive/smith2018graphbased.pdf)](https://www.pcgworkshop.com/archive/smith2018graphbased.pdf)) or fixes geometry and *derives* the graph afterward (Whitehead's SMT dungeon, layout then Delaunay/MST, [[pcgworkshop.com/archive/whitehead2020spatial.pdf](https://www.pcgworkshop.com/archive/whitehead2020spatial.pdf)](https://www.pcgworkshop.com/archive/whitehead2020spatial.pdf)). **No off-the-shelf system does "preserve this exact edge set while composing coherent geometry" end-to-end** [E, convergent across all seven passes]. The staged separation of legality from composition is therefore not a shortcut around a solved problem; it *is* the architecture the field points to. [I]

The research strengthens three things:

1. **It confirms your own §11 instinct.** `PROCEDURAL-DUNGEON-RESEARCH §11` already answered "SMT, simulated annealing, or ML for the first implementation? No. Start with bounded constructive search, configuration-space masks, backtracking, and candidate scoring; keep SMT and learned priors as measured escalation paths." Independent research lands in the same place: at your scale (tens of rooms) a **hand-rolled deterministic constructive+backtracking realizer in a few hundred lines of pure JS will match or beat every heavyweight solver dependency**, all of which carry determinism, bundle-weight, or licensing costs [E, JS/WASM library pass]. The escalation ladder is real but should stay an escalation, not a v1 dependency.

2. **It names the missing family your docs had not named: graph drawing / floorplanning.** The mathematically correct answer to "graph -> rectangular rooms, zero lost or invented edges" is the **rectangular-dual** literature (Bhasker & Sahni, linear time, [[epubs.siam.org/doi/10.1137/0222072](https://epubs.siam.org/doi/10.1137/0222072)](https://epubs.siam.org/doi/10.1137/0222072)) and the 2025 minimum-bends floorplan synthesis that bridges it to architecture with an explicit **rectangular -> orthogonal -> irregular degradation ladder** ([[cambridge.org/core/journals/ai-edam/article/automated-generation-of-floor-plans-with-minimum-bends](https://www.cambridge.org/core/journals/ai-edam/article/automated-generation-of-floor-plans-with-minimum-bends/214D14B8D2D263DE4B2D5C97103165F0)](https://www.cambridge.org/core/journals/ai-edam/article/automated-generation-of-floor-plans-with-minimum-bends/214D14B8D2D263DE4B2D5C97103165F0)). That ladder is a direct formalization of your P3.8 rule "hard invariants never relax; soft preferences degrade in an ordered trace." These are papers, not libraries — you implement them, which is *good* for a no-GPL, no-budget, deterministic product. [E/I]

3. **It supplies a concrete, deterministic TacticalCompositionPlan scoring set.** The field has *no* standard aesthetic PCG metric ([[arxiv.org/html/2404.18657v1](https://arxiv.org/html/2404.18657v1)](https://arxiv.org/html/2404.18657v1)), which validates your "no universal black-box FFT score" law. In its place, six computable, explainable heuristics assemble cleanly from existing primitives (detailed in §2E and §6). [E/I]

**Resolution offered for P3.5:** Accept B, with the embedding stage (SpatialPlanV2 legality) built as a **bounded constructive rectangular-dual / floorplan realizer with stable edge ids and an ordered rectangular->orthogonal->irregular degradation ladder**, deterministic and pure-JS; with a **constraint solver (clingo-wasm, MIT) reserved as an in-browser satisfiability/repair backstop** and **MiniZinc+Gecode (MIT stack) as an optional offline build-time escalation**; and with TacticalCompositionPlan as a **bounded generate-and-score pass** over the six named heuristics. This is B, refined, not A or C.

---

## 2. Problem decomposition

The single word "embedding" hides seven separable sub-problems. Keeping them separate is what lets you use the right, smallest tool for each and keep every stage deterministic and auditable.

**A. Topology preservation** — guarantee every canonical edge survives and no edge is invented. This is a *combinatorial* problem, not a geometric one. Best tools: stable edge-ids threaded end to end; a constructive realizer that is edge-exact by construction (rectangular dual) or a satisfiability check that is UNSAT rather than lossy (ASP/SAT). This is the non-negotiable core of P3.5.

**B. Geometric embedding** — assign each node a footprint on the 5-ft grid honoring area/adjacency/scale/site-boundary. Rectangular-dual + area-weighting (squarified treemap for tree backbones, [[d3js.org/d3-hierarchy/treemap](https://d3js.org/d3-hierarchy/treemap)](https://d3js.org/d3-hierarchy/treemap)) for the fast first draft; VLSI non-slicing packing (B*-tree / sequence-pair / corner-block-list, the last carrying explicit boundary constraints) when rooms must pack without a slicing structure.

**C. Elevation & connector realization** — depth bands, vertical connectors (stairs/ramps/lifts/shafts/drops), loops, secret edges. Depth/elevation min-max offsets between connected nodes are textbook **difference constraints** (x_j − x_i ≤ c), solvable by a ~40-line deterministic Bellman-Ford feasibility pass, no dependency [I]. Loops and secret/vertical edges that fall outside the spanning tree are realized as explicit typed connector nodes, never as silent footprint edits (§6 worked example).

**D. Structural / stamp assembly** — placing typed structural stamps into legal sockets (your P3.7). Exact-cover (Dancing Links / Algorithm X) is deterministic by construction and tiny ([[en.wikipedia.org/wiki/Dancing_Links](https://en.wikipedia.org/wiki/Dancing_Links)](https://en.wikipedia.org/wiki/Dancing_Links)); it produces *feasible* stamp coverings that your soft-scoring ranks afterward — which is exactly your "hard rejection before soft scoring" order.

**E. Tactical composition scoring** — choosing one authored-feeling arrangement among legal candidates. Bounded generate-and-score over six deterministic heuristics (§6): elevation coherence, chokepoint legibility, isovist sightlines, landmark salience, negative-space shaping, four-yaw viewpoint entropy.

**F. Material / surface assembly** — SurfaceAssemblyPlan converts a chosen composition to surface frames, material routes, mesh recipes, mount sockets, UV methods. Representation is a stacked-heightfield multi-surface graph (§4); destructible boolean edits via a manifold-guaranteed CSG kernel; decorative mesh authored offline and id-linked, never authoritative.

**G. Visual validation** — the four-yaw QA gate. Deterministic offscreen capture at the four governed yaws feeding the viewpoint-entropy and occlusion checks; this is the GaneshaDx lesson used as diagnostic, never as authority.

Each of A–G is independently testable, independently degradable, and (critically for determinism) has a fixed evaluation order with a seeded RNG stream for tie-breaking only.

---

## 3. Evidence matrix

Compressed to the load-bearing columns. Dim = dimensionality. Det = deterministic. JS/WASM = real in-browser reality. Fit tags Genesis role. Full per-candidate detail with dev-vs-inference tags lives in the seven source passes; this is the decision surface.

### Constraint / optimization solvers

| Tool | Primary source | Solves / not | Det | License | JS/WASM reality | Maint. | Genesis fit |
|---|---|---|---|---|---|---|---|
| **clingo / ASP** | [[potassco.org/clingo](https://potassco.org/clingo/)](https://potassco.org/clingo/); [[clingo-wasm](https://github.com/domoritz/clingo-wasm)](https://github.com/domoritz/clingo-wasm) | Declarative combinatorial legality/assignment; not continuous geometry | Yes, single-thread [I] | **MIT** (wasm wrapper Apache) [E] | Official-ish `clingo-wasm` **2.5 MB**, Web Worker, `restart()` kill-switch, **no COOP/COEP** reported [E] | clingo 5.8.0 Apr 2025; wrapper Feb 2025 [E] | **Top backstop.** License+precedent+browser story all clean; ASP is a different authoring paradigm [risk] |
| **Z3 / SMT** | [[z3-solver npm](https://www.npmjs.com/package/z3-solver)](https://www.npmjs.com/package/z3-solver) | Linear-arithmetic room placement; strongest layout precedent (Whitehead) | Yes if tactic/version pinned, single-thread [D] | **MIT** [E] | Official WASM but **34.6 MB** and needs **SharedArrayBuffer + COOP/COEP** [E] | v5.0.0 Jul 2026 [E] | Powerful verify layer; heavy + header burden; use surgically |
| **CP-SAT / OR-Tools** | [[or-tools-wasm](https://github.com/Axelwickm/or-tools-wasm)](https://github.com/Axelwickm/or-tools-wasm) | Best general discrete optimizer; overkill at tens of rooms | **Documented non-determinism even at 1 worker** ([[#3943](https://github.com/google/or-tools/issues/3943)](https://github.com/google/or-tools/issues/3943)) [E] | Apache-2.0 [E] | Unofficial WASM, CP-SAT **7.4 MB+**, COOP/COEP [E] | wrapper Jun 2026 [E] | Break-glass / offline only; determinism gaps conflict with replay |
| **MiniZinc + Gecode** | [[minizinc.org](https://www.minizinc.org/)](https://www.minizinc.org/) | High-level CP modeling; finite-domain CP | Yes | MPL-2.0 + **Gecode/Chuffed MIT, HiGHS MIT** [E] | **Offline CLI only**, no browser | Active | **Best offline build-time solver**, all-permissive backend, DSL to learn |
| **HiGHS (highs-js)** | [[lovasoa/highs-js](https://github.com/lovasoa/highs-js)](https://github.com/lovasoa/highs-js) | LP/MIP continuous sub-optimization | Yes [D] | **MIT** [E] | WASM **3.4 MB, no special headers** [E] | v1.15 Jul 2026 [E] | Clean in-browser numeric fallback; LP framing awkward for adjacency |
| **YALPS / jsLPSolver** | [[Ivordir/YALPS](https://github.com/Ivordir/YALPS)](https://github.com/Ivordir/YALPS) | Pure-JS LP/MIP, hundreds of vars | Yes, by construction | **MIT / Unlicense** [E] | **Pure JS, no WASM, tiny** [E] | Dec 2025 [E] | Zero-ceremony numeric sub-steps; not a combinatorial engine |
| **Bellman-Ford diff-constraints** | textbook | Depth/elevation min-max offsets | Yes | in-house | ~40 lines JS | n/a | **Lowest-risk tool for the elevation/depth constraint class** |
| **DLX / exact cover** | [[dlxlibjs](https://github.com/taylorjg/dlxlibjs)](https://github.com/taylorjg/dlxlibjs) | Exact-cover stamp/template placement; not weighted | Yes, by construction | MIT / hand-roll | Pure JS, KB | n/a | Clean fit for P3.7 socket coverage; pair with soft scoring |
| **@lume/kiwi (Cassowary)** | [[lume/kiwi](https://github.com/lume/kiwi)](https://github.com/lume/kiwi) | Continuous alignment/snap refinement; not discrete | Yes | **BSD-3** [E] | Pure TS, <100 KB | Sep 2024 [E] | Final continuous 5-ft snap/alignment after topology fixed |
| glpk.js | [[jvail/glpk.js](https://github.com/jvail/glpk.js)](https://github.com/jvail/glpk.js) | LP/MIP, smallest wasm | Yes | **GPL-3.0** [E] | 294 KB wasm | Dec 2025 | **DISQUALIFIED for shipping** (GPL); reference-only |

### Graph realization / floorplanning (mostly papers to implement)

| Method | Primary source | Role for Genesis | Det | License | Fit |
|---|---|---|---|---|---|
| **Rectangular duals** (Bhasker-Sahni; Kant-He) | [[SIAM 1988](https://epubs.siam.org/doi/10.1137/0222072)](https://epubs.siam.org/doi/10.1137/0222072) | Graph -> rectangle partition, adjacency = input exactly, linear time | Yes | N/A (implement) | **Strongest topology-exact realizer** |
| **Min-bends floorplan (2025)** | [[Cambridge AI EDAM](https://www.cambridge.org/core/journals/ai-edam/article/automated-generation-of-floor-plans-with-minimum-bends/214D14B8D2D263DE4B2D5C97103165F0)](https://www.cambridge.org/core/journals/ai-edam/article/automated-generation-of-floor-plans-with-minimum-bends/214D14B8D2D263DE4B2D5C97103165F0) | TSM bend-min + **RFP->OFP->IFP degradation ladder** | Yes | N/A (G-Drawer app, repo unconfirmed) | **Most on-point recent hit**; ladder = your P3.8 |
| **Schnyder woods** (Felsner) | [[tu-berlin PDF](https://page.math.tu-berlin.de/~felsner/Paper/geom-rep.pdf)](https://page.math.tu-berlin.de/~felsner/Paper/geom-rep.pdf) | Lattice of *all* valid realizations -> seeded variety, same edges | Yes | N/A | Deterministic-but-seeded candidate variety |
| **Contact graphs / feasibility** (Buchsbaum et al.) | [[ACM TALG](http://adambuchsbaum.com/papers/rectlay.pdf)](http://adambuchsbaum.com/papers/rectlay.pdf) | *When* an exact rectangular layout is impossible (fallback design) | Yes | N/A | Informs the degradation ladder |
| **B*-tree / sequence-pair / corner-block-list** | VLSI floorplanning lit | Non-slicing packing; CBL carries **site-boundary** constraints | Yes (seeded SA) | N/A | Packing scale-domains; adjacency must be hard-constrained |
| **elkjs** | [[kieler/elkjs](https://github.com/kieler/elkjs)](https://github.com/kieler/elkjs) | `rectpacking` box pre-layout; debug graph viz | Yes | **EPL-2.0** (not GPL) [E] | v0.11 2026 [E] | Auxiliary/debug only, not floorplan-exact |
| **cdt2d / ghx_constrained_delaunay** | [[cdt2d](https://github.com/mikolalysenko/cdt2d)](https://github.com/mikolalysenko/cdt2d) | Triangulate irregular sites before dual construction | Yes | **MIT / MIT+Apache** [E] | small | Clean CDT; **avoid Shewchuk Triangle (non-commercial license)** [E] |
| **d3-hierarchy squarified treemap** | [[d3js.org](https://d3js.org/d3-hierarchy/treemap)](https://d3js.org/d3-hierarchy/treemap) | Area-proportional tree backbone; loops need overlay | Yes | **ISC** [E] | maintained | Cheap area-exact building block |
| OGDF / ogdf.js / yFiles | — | Richest orthogonal TSM engine / commercial | — | **GPL / GPL-linked / proprietary** [E] | — | **Excluded**: license or budget |

### Scene / geometry representation

| Tool | Source | Role | License | JS/WASM | Fit |
|---|---|---|---|---|---|
| **Stacked-heightfield multi-surface graph** | pattern (no lib) | Canonical tactical layer: surfaces=supernodes w/ 5-ft grid+local frame, connectors=typed edges | in-house | pure data | **Primary representation** |
| **Portals / sectors** | [[Portal rendering](https://en.wikipedia.org/wiki/Portal_rendering)](https://en.wikipedia.org/wiki/Portal_rendering) | Your graph + geometry payload per node/edge | in-house | pure JS | Free to adopt; keep it *data* not culling |
| **Manifold (manifold-3d)** | [[elalish/manifold](https://github.com/elalish/manifold)](https://github.com/elalish/manifold) | Destructible CSG, **manifold-guaranteed** | **Apache-2.0** [E] | WASM v3.4.1 Mar 2026 [E] | **Best CSG** for canonical destructibles |
| **three-bvh-csg** | [[gkjohnson/three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg)](https://github.com/gkjohnson/three-bvh-csg) | Fast preview CSG, not manifold-guaranteed | **MIT** [E] | pure JS, Feb 2026 [E] | Non-canonical preview only |
| **three-mesh-halfedge** | [[LokiResearch/three-mesh-halfedge](https://github.com/LokiResearch/three-mesh-halfedge)](https://github.com/LokiResearch/three-mesh-halfedge) | Per-surface boundary/aperture topology | **MIT**, pure TS [E] | native | License-clean half-edge |
| **recast-navigation-js** | [[isaac-mason/recast-navigation-js](https://github.com/isaac-mason/recast-navigation-js)](https://github.com/isaac-mason/recast-navigation-js) | Derived navmesh for AI pathing; off-mesh links = stairs/lifts | **MIT / zlib** [E] | WASM v0.43 Sep 2025 [E] | Derived, non-authoritative; lock params for replay |
| **Blender Geometry Nodes** | [[blender.org](https://www.blender.org/)](https://www.blender.org/) | **Offline** decorative-mesh authoring, baked to glTF | GPL (offline tool, output untainted) [I] | none (offline) | Decorative pieces only |
| CGAL arrangement-2d-js | [[LokiResearch/arrangement-2d-js](https://github.com/LokiResearch/arrangement-2d-js)](https://github.com/LokiResearch/arrangement-2d-js) | Exact planar arrangements | **GPL trap** (MIT wrapper over GPL CGAL) [E/I] | WASM | **Reference-only**; do not ship |
| SDF | three.js TSL | Decorative shader effects only | technique | shader | Not canonical (rendering-not-authority) |

### PCG systems (mostly method/reference, not shippable code)

| System | Source | Role | License/reuse | Fit |
|---|---|---|---|---|
| **Mission/space graph grammars** (Dormans/Ludoscope) | [[Adventures in Level Design](https://pcgworkshop.com/archive/dormans2010adventures.pdf)](https://pcgworkshop.com/archive/dormans2010adventures.pdf) | "Space follows mission"; validated in production by **Unexplored cyclic dungeons** ([[gamedeveloper.com](https://www.gamedeveloper.com/design/unexplored-s-secret-cyclic-dungeon-generation-)](https://www.gamedeveloper.com/design/unexplored-s-secret-cyclic-dungeon-generation-)) | No licensed JS embedder | **Conceptual ancestor**; reference |
| **Sturgeon (SAT tile+graph)** | [[crowdgames/sturgeon-pub](https://github.com/crowdgames/sturgeon-pub)](https://github.com/crowdgames/sturgeon-pub) | Constraints as SAT clauses; UNSAT not lossy; closest to hard-constraint graph preservation | **MIT**, Python/PySAT (no JS) | Borrow the *encoding pattern* |
| **WFC family** (mxgmn; DeBroglie; HWFC) | [[mxgmn/WaveFunctionCollapse](https://github.com/mxgmn/WaveFunctionCollapse)](https://github.com/mxgmn/WaveFunctionCollapse) | Local coherence; **no global graph awareness** | MIT (JS port [[kchapelier](https://github.com/kchapelier/wavefunctioncollapse)](https://github.com/kchapelier/wavefunctioncollapse)) | **In-room decorator only** |
| **MAP-Elites / QD** | [[Alvarez CoG 2019](https://ieee-cog.org/2019/papers/paper_101.pdf)](https://ieee-cog.org/2019/papers/paper_101.pdf) | Named feature axes (symmetry, meso-pattern density, linearity) | formulas reusable | **Borrow feature formulas as scorers**, not the search |
| BSP / Voronoi / drunkard-walk / L-system / MCTS | various | Invent-from-noise; opposite of graph-preservation | mostly MIT | **Anti-pattern for topology**; in-cell texture at most |

### Tactical composition & viewpoint

| Metric / method | Source | Computes | Fit |
|---|---|---|---|
| **Viewpoint entropy** | [[Vázquez 2003](https://vccimaging.org/Publications/Vazquez2003AVS/Vazquez2003AVS.pdf)](https://vccimaging.org/Publications/Vazquez2003AVS/Vazquez2003AVS.pdf) | `I = −Σ(Aᵢ/Aₜ)log(Aᵢ/Aₜ)` per camera | **Near-perfect fit for four-yaw readability** |
| **Isovist / VGA** | [[Turner 2001](https://journals.sagepub.com/doi/10.1068/b2684)](https://journals.sagepub.com/doi/10.1068/b2684) | Visible-area/compactness at key tiles | Sightlines / readable approaches |
| **Recursive/symmetric shadowcasting** | [[albertford.com/shadowcasting](https://www.albertford.com/shadowcasting/)](https://www.albertford.com/shadowcasting/) | Exact grid FOV/LOS, symmetric | Core deterministic sightline primitive |
| **Voronoi chokepoint detection** | [[Perkins AIIDE 2010](https://cdn.aaai.org/ojs/12405/12405-52-15933-1-2-20201228.pdf)](https://cdn.aaai.org/ojs/12405/12405-52-15933-1-2-20201228.pdf) | Region decomposition + chokepoint graph | Chokepoint legibility (or distance-transform ridge as cheaper proxy) |
| **Expressive Range Analysis** | [[AIIDE-18](https://ojs.aaai.org/index.php/AIIDE/article/view/13012)](https://ojs.aaai.org/index.php/AIIDE/article/view/13012) | Coverage/diversity of a generator | **Offline dev tuning**, not runtime |

---

## 4. Shortlist (top hybrid approaches, ranked)

**#1 — Constructive rectangular-dual/floorplan realizer + deterministic scoring (RECOMMENDED, and the best no-budget prototype).**
In-house pure-JS: triangulate the graph if needed (cdt2d, MIT), build a rectangular dual (Bhasker-Sahni) for the first legal layout, area-weight tree sections with squarified treemap, restore loops/secret/vertical edges as explicit typed connector nodes, snap to the 5-ft grid, then run the six-heuristic scoring pass over a bounded candidate set. Bellman-Ford for depth/elevation, DLX for stamp sockets, @lume/kiwi for continuous alignment. **Everything here is MIT/BSD/ISC or hand-rolled, deterministic by construction, zero WASM weight, runs in a browser tab on an Intel MacBook Pro, and matches your §11 ruling exactly.** Risk: you own ~a few hundred to low-thousand lines of well-specified geometry code, and the rectangular-dual approach needs a reversible triangulation so loop/dead-end preprocessing never leaks spurious adjacency into gameplay. [I]

**#2 — Add clingo-wasm (ASP) as an in-browser satisfiability/repair backstop.** When the constructive realizer cannot place a hard edge set, encode the graph as fixed facts plus your constraint taxonomy as integrity constraints; clingo returns a legal region assignment or reports no stable model (your explicit-degradation trigger, never a silent drop). MIT, 2.5 MB, no COOP/COEP, worker `restart()` maps onto "bounded backtracking." Strongest hierarchical-dungeon precedent (Smith & Bryson, ~6 s for a 6×6 region dungeon on 2011 hardware, i.e. sub-second today at your scale). Risk: ASP is a genuinely different authoring/debugging paradigm; keep it as an escalation the constructive path rarely needs. [E/I]

**#3 — MiniZinc + Gecode as an offline build-time escalation (funded/compiled path).** If constraints get genuinely hard and you want a mature modeling language rather than hand-rolled search, MiniZinc with the all-MIT Gecode backend runs as a build step and emits compiled sites — zero runtime bundle weight, purpose-built for finite-domain CP. Risk: a second toolchain/DSL and a non-npm binary in the build environment. [E]

**#4 — Z3/SMT (z3-solver) as a surgical verifier, later.** Strongest layout-specific academic precedent (Whitehead's linear-constraint room placement, 0.013 s for 10 rooms, 0.126 s for 30). MIT and an official WASM package, but 34.6 MB and a SharedArrayBuffer/COOP-COEP requirement make it a "break glass to *verify/patch* a hard edge case," never the primary generator or a static-host-friendly default. [E]

**#5 — CP-SAT / OR-Tools, offline only, if #1–#4 ever prove too weak.** The most powerful discrete optimizer available, but its documented non-determinism even at a single worker directly conflicts with deterministic replay, so it belongs only in an offline precompute where output is hashed and pinned. [E]

**Best in-browser numeric fallback across all shortlist tiers:** HiGHS (highs-js, MIT, 3.4 MB, no headers) for any LP/MIP continuous sub-optimization. **Never ship glpk.js (GPL-3.0).**

---

## 5. Pre-existing implementations worth read-only inspection

**Reusable (permissive, shippable, maintained) — candidates to actually prototype with:**
- [[clingo-wasm](https://github.com/domoritz/clingo-wasm)](https://github.com/domoritz/clingo-wasm) — MIT ASP in-browser. Reusable.
- [[highs-js / ](https://github.com/lovasoa/highs-js)`[highs](https://github.com/lovasoa/highs-js)`](https://github.com/lovasoa/highs-js) — MIT LP/MIP WASM. Reusable.
- [[Ivordir/YALPS](https://github.com/Ivordir/YALPS)](https://github.com/Ivordir/YALPS) — MIT pure-JS LP/MIP. Reusable.
- [[lume/kiwi](https://github.com/lume/kiwi)](https://github.com/lume/kiwi) — BSD Cassowary. Reusable.
- [[manifold-3d](https://github.com/elalish/manifold)](https://github.com/elalish/manifold) — Apache CSG, manifold-guaranteed. Reusable.
- [[three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg)](https://github.com/gkjohnson/three-bvh-csg) — MIT preview CSG. Reusable (non-canonical).
- [[three-mesh-halfedge](https://github.com/LokiResearch/three-mesh-halfedge)](https://github.com/LokiResearch/three-mesh-halfedge) — MIT half-edge. Reusable.
- [[recast-navigation-js](https://github.com/isaac-mason/recast-navigation-js)](https://github.com/isaac-mason/recast-navigation-js) — MIT/zlib navmesh. Reusable (derived layer).
- [[cdt2d](https://github.com/mikolalysenko/cdt2d)](https://github.com/mikolalysenko/cdt2d) / [[ghx_constrained_delaunay](https://github.com/Henauxg/ghx_constrained_delaunay)](https://github.com/Henauxg/ghx_constrained_delaunay) — MIT/Apache CDT. Reusable.
- [[kchapelier/wavefunctioncollapse](https://github.com/kchapelier/wavefunctioncollapse)](https://github.com/kchapelier/wavefunctioncollapse) — MIT WFC (in-room decorator). Reusable.
- [[d3-hierarchy](https://github.com/d3/d3-hierarchy)](https://github.com/d3/d3-hierarchy) — ISC treemap. Reusable.
- [[elkjs](https://github.com/kieler/elkjs)](https://github.com/kieler/elkjs) — EPL-2.0 (not GPL) box layout / debug viz. Reusable with EPL review.

**Research-only (study the method or data model; do not import code):**
- [[crowdgames/sturgeon-pub](https://github.com/crowdgames/sturgeon-pub)](https://github.com/crowdgames/sturgeon-pub) — MIT but Python; port the SAT-encoding *pattern*, not the code.
- [[JimWhiteheadUCSC/smt_dungeon](https://github.com/JimWhiteheadUCSC/smt_dungeon)](https://github.com/JimWhiteheadUCSC/smt_dungeon) — Z3 room-placement reference (no license file, "quickly written research code").
- [[BorisTheBrave/DeBroglie](https://github.com/BorisTheBrave/DeBroglie)](https://github.com/BorisTheBrave/DeBroglie) + Tessera paper — MIT but C#; the non-local-constraint WFC ideas.
- [[Michael-Beukman/HWFC](https://github.com/Michael-Beukman/HWFC)](https://github.com/Michael-Beukman/HWFC) — hierarchical WFC method (no license found).
- GaneshaDx / [[rainbowbismuth/fft-map-json](https://github.com/rainbowbismuth/fft-map-json)](https://github.com/rainbowbismuth/fft-map-json) — the terrain-vs-decoration data-model proof (GaneshaDx is GPL-3.0; already your standing research-only ruling).
- Rectangular-dual / min-bends-floorplan / Schnyder-wood / Perkins-chokepoint / Vázquez-viewpoint-entropy papers — algorithms to implement in-house.

**Abandoned / unsuitable (know why, avoid):**
- [[meteor/logic-solver](https://github.com/meteor/logic-solver)](https://github.com/meteor/logic-solver) — MIT, deterministic-by-design, but last published 2016 (decade stale).
- kiwi.js (original), voxel.js, csp.js/csps, yuka (for this purpose), ogdf.js — stale/toy/wrong-tool.

**GPL-contaminating / proprietary (reference only, never link):**
- [[jvail/glpk.js](https://github.com/jvail/glpk.js)](https://github.com/jvail/glpk.js) (GPL-3.0), [[OGDF](https://github.com/ogdf/ogdf)](https://github.com/ogdf/ogdf) (GPL), CGAL Arrangements incl. arrangement-2d-js's compiled WASM (GPL trap despite MIT glue), Shewchuk **Triangle** (commercial-use-restricted, not OSI), yFiles (proprietary, budget-gated).

---

## 6. Recommended prototype experiment (do not implement — spec only)

Aligns with `BATTLEMAP-TOWNTRAY §10.2` acceptance ladder step C1H ("one high-priority composed clay battlefield") and the P3.5 Prototype-B framing ("annotate one existing room without moving cells, then compose one retained room").

**Retained fixture:** one small dungeon graph — 8 room nodes, 1 loop, 1 secret vertical connector, 1 dead-end branch — chosen from the `§10.3` archetypes, e.g. a **switchback ascent + basin** site:
`Gate — Nave(flooded) — Reliquary`, with `Nave — (stair, +1 level) — Choir`, a loop `Nave — SideChapel — Reliquary`, a secret return edge `Reliquary — (secret, vertical drop) — Gate`, and a dead-end `Choir — Belfry`. Edge ids `e1..e8`, each tagged `{horizontal|vertical, open|secret}`.

**Inputs:** the fixed graph (nodes + the 8 edge-ids, none addable/droppable); per-node area target and scale domain; depth intent (Reliquary deepest); site-boundary polygon; the constraint taxonomy (area, adjacency, depth, circulation, scale, portal, elevation, support, tactical, history, site-boundary) as declared facts.

**Outputs:** a `TacticalCompositionPlan` per candidate (using the doc's existing shape — envelope/regions/surfaces/connectors/routes/anchors/reservations/placementSlots/relaxations/diagnostics), with every one of `e1..e8` traceable from input id to a realized connector, plus a `diagnostics` block of transparent measures (never one opaque score) and a plain-language `unsatisfied` list when a hard edge cannot be placed.

**Candidate count:** generate **N = 6** legal candidates (bounded), score each on the six heuristics, surface the top 2 with full score breakdowns.

**The six deterministic scoring heuristics** (all pure-JS, explainable):
1. **Elevation coherence** — flood-fill connected-component count/size over the heightfield; reward few large masses over scattered bumps.
2. **Chokepoint legibility** — distance-transform ridge (or Perkins Voronoi) count and spacing of narrow passages between regions.
3. **Sightline / isovist** — recursive-shadowcasting isovist area and variance sampled at spawn tiles, high ground, and chokepoints; reward tactical cover without total-visibility goldfish bowls.
4. **Landmark salience** — Alvarez meso-pattern density `D_mesoP = min(#MesoP/MaxChambers, 1.0)`; reward distinct, well-spaced landmarks.
5. **Negative-space shaping** — ratio and clustering of reachable-but-unoccupied cells; penalize both empty flatness and clutter (enforces "sparse structural dressing").
6. **Four-yaw readability** — Vázquez viewpoint entropy at the four governed yaws; penalize any yaw with degenerate entropy or high variance across the four.

**Diagnostics to emit:** per-candidate the six scores with sub-terms; the ordered relaxation trace if any soft rule degraded; the rectangular->orthogonal->irregular ladder step reached; timings; the edge-id -> connector map.

**Success criteria:** all 8 edges realized in every retained candidate; zero invented adjacency (no two graph-non-adjacent rooms share a wall); deterministic byte-identical replay across two runs on the same seed and across save/load; sub-second generation on the Intel Mac; and at least one candidate that a human reads as "authored-feeling" at a four-yaw capture.

**What would falsify the recommendation:** if the constructive rectangular-dual realizer cannot embed this 8-edge graph without either dropping the loop/secret edge or inventing an adjacency, *and* clingo-wasm cannot repair it in bounded time — that would push toward SMT/CP-SAT as the primary generator rather than a backstop (i.e. flip the escalation ladder). If the six heuristics cannot separate an obviously-good from an obviously-bad layout in the retained fixture, the scoring approach (not the embedding approach) needs rework.

---

## 7. MVP and ideal path

**First Mac proof (C1H, no cash, deterministic):** heuristic + constructive only. Rectangular-dual/treemap realizer + Bellman-Ford elevation + six-heuristic scoring + four-yaw capture, all pure-JS/MIT, on the one retained fixture. No solver dependency, no WASM. This is the cheapest path and the one your §11 ruling already endorses. Promotion trigger to the next tier: a captured fixture that is *technically valid but reads flat/unauthored* (your own stated return trigger for P3.5).

**Playable MVP (small multi-room graphs, bounded backtracking):** add clingo-wasm (MIT, 2.5 MB) as the in-browser satisfiability/repair backstop for edge sets the constructive realizer can't place, plus DLX stamp placement and @lume/kiwi continuous snap. Add Manifold for destructible CSG and recast-navigation-js for AI pathing as SurfaceAssemblyPlan matures. Promotion trigger: multi-room relational growth (ladder step 8) and destructibles becoming gameplay-load-bearing.

**Mature goal (2026-quality composition, still no runtime cloud):** richer stacked surfaces (`surfaces[].layer` > 0), MiniZinc+Gecode offline precompute for hard sites baked to compiled saved sites, Blender-Geometry-Nodes-authored decorative libraries, and — only if diagnostics justify it — a *learned ranker trained solely on your own accepted captures/diagnostics* to order candidates, never to author geometry (exactly your `§11` "measured escalation, never opaque unreviewed map authority"). Z3/CP-SAT stay break-glass offline verifiers.

Cost profile: tier 1 is engineering time only (no license, no compute, no bundle). Tier 2 adds ~2.5 MB WASM and modest complexity. Tier 3 adds an offline build toolchain and, optionally, a small training pipeline — all still inside the ~$200/month ceiling because nothing requires runtime cloud solving.

---

## 8. FFT translation

**Retain (visual / compositional lessons):**
- Coherent, *few large* elevation masses over scattered bumps; strong landmarks; shaped negative space; readable approaches; sparse structural dressing; tactical terrain (cover, high ground, chokepoints, sightlines) — the FFT-grade target as your own `BATTLEMAP-TOWNTRAY §1` defines it.
- **The terrain-vs-decoration data boundary**, confirmed across the Ganesha editor docs, the FFHacktics wiki, and the `fft-map-json` extraction: a small serializable numeric terrain grid (height, depth, slope kind/height, surface class, passability flags) is *alone sufficient* to run all tactical logic, with the visual mesh loosely coupled by spatial coincidence only. `fft-map-json` losslessly extracting just the gameplay layer is the proof this split is load-bearing. This maps directly onto your canonical-vs-render authority law.
- Four-diagonal-view composition as a *QA discipline* (test every board from the four yaws) — the GaneshaDx `StageCamera` lesson, used as diagnostic, never as authored per-direction visibility flags (you already have a stronger dynamic ShotPlan).
- Production-pipeline lessons from beyond FFT: loop-topology-from-a-template-library-then-reify (Unexplored), hand-author the tactically load-bearing skeleton and procedurally vary only decoration (Into the Breach), standardize a socket/grid contract before generating (XCOM 2 Plot & Parcel), room-accretion guarantees connectivity for free (Brogue), predictable macro-massing + varied micro-detail (Townscaper), discretized legible space as a readability feature (Bad North), layered abstraction->concrete with clean stage I/O ("reify!", Caves of Qud).

**Do NOT inherit (1990s representation/technology constraints):**
- Fixed four-diagonal isometric projection baked into the *asset/geometry* pipeline; treat isometric presentation as a camera choice over a full data model, not a constraint on the terrain schema.
- Small-integer hardware-forced height quantization and a fixed four-type slope taxonomy; keep a small human-legible vocabulary sized for design clarity, not PSX word limits.
- The GNS mechanism of swapping whole pre-baked mesh files to fake weather/time-of-day; parameterize lighting/weather procedurally.
- The upper/lower dual-height hack for overhangs; use a true multi-surface/stacked representation where warranted.
- Restart-the-whole-generation-on-failure (superseded even within Stalberg's own lineage by graceful partial-failure); your bounded-backtracking + ordered-degradation is the modern replacement.
- Bespoke, non-composable, per-map hand authoring as the *production model* (FFT's visual result is the reference, not its authoring economics); compose hand-authored stamps into a standardized socket/grid contract instead.
- ASCII/tile-only substrate and multi-minute worldgen runtimes (Dwarf Fortress / Caves of Qud); keep the layering discipline, shed the cost profile.

---

## 9. Risks and honest unknowns

- **Authored-feeling composition is the deepest unknown.** The field has no validated aesthetic metric ([[arxiv.org/html/2404.18657v1](https://arxiv.org/html/2404.18657v1)](https://arxiv.org/html/2404.18657v1)); the six heuristics are principled and computable but *unproven to correlate with your taste* until you score real captures. This is the single most likely place the plan needs iteration, and it is inherently a taste-after-captures item, not a solver choice.
- **Three-dimensional / stacked packing** is materially harder than the 2D floorplanning literature. The rectangular-dual guarantees are 2D-per-floor; stacking, bridges, and vertical connectors are handled as separate typed edges, which is sound but under-precedented as an integrated whole — expect this to be where the constructive realizer first strains.
- **Solver brittleness & determinism.** CP-SAT's documented non-determinism ([[#3943](https://github.com/google/or-tools/issues/3943)](https://github.com/google/or-tools/issues/3943)) and Z3's configuration-sensitivity mean any solver you adopt must be version-pinned, single-threaded, and output-hashed in a regression harness before it can back deterministic replay. clingo/ASP appears cleanest here but its threading requirement under Emscripten pthreads is unconfirmed and worth a spike.
- **Content/grammar cost.** Every technique that "feels authored" (stamps, room-grammar templates, decorative libraries) is content you author; the solver reduces combinatorial risk, not authoring volume. XCOM 2's own postmortem names the tradeoff: procedural assembly costs "limited artistic agency."
- **Performance on the Intel Mac** is not in doubt for the constructive path (sub-second at tens of rooms per every precedent), but WASM solver payloads (Z3 34.6 MB, CP-SAT 7.4 MB+) and their COOP/COEP header requirements are a real static-hosting friction if you reach for them in-browser.
- **Explainability under degradation.** Your no-black-box-score law is right and the heuristics support it, but an ordered relaxation trace that a human can actually read (not just a rule count) is its own design problem, especially when several soft rules degrade together.
- **Reversibility of graph preprocessing.** Triangulating a non-triangulated input graph for the rectangular dual can add dummy edges; if the removal isn't perfectly reversible, spurious adjacency leaks into gameplay — a correctness risk, not just an aesthetic one.

---

## 10. Decision delta

Mapping research conclusions onto your own triage (§12.1), keeping technical calls off your desk and taste calls on it.

**Acceptable now (engineering defaults, no founder sign-off needed):**
- P3.5 architecture: **accept B**, refined — staged constructive rectangular-dual/floorplan embedding with stable edge-ids and an ordered rectangular->orthogonal->irregular degradation ladder, deterministic and pure-JS, with clingo-wasm reserved as a backstop. This resolves the one open Wave-3 item at the architecture level; it is a §12.1 "Codex technical default" and the research it was waiting on is now in hand.
- The tool exclusions: **no GPL in the product** (glpk.js, OGDF, CGAL arrangements), **no non-OSI Triangle**, **no budget-gated yFiles** — these are licensing facts, decided.
- The supporting-cast tool picks (Bellman-Ford for elevation, DLX for stamps, @lume/kiwi for snap, Manifold for CSG, recast-navigation-js for navmesh, HiGHS over glpk.js) are technical defaults.

**Need a narrow prototype before accepting (the falsifiable questions):**
- Whether the constructive realizer alone can embed a real 8-edge loop+secret+vertical fixture without dropping or inventing an edge, or whether clingo-wasm backstopping is needed from the start (the §6 experiment answers this).
- Whether ASP/clingo-wasm's threading and determinism hold up under a browser spike.
- Whether the six heuristics separate good from bad layouts on the retained fixture.
These are engineering spikes, not taste calls; run the §6 experiment before committing the escalation ladder's shape.

**Genuinely need Adam's taste, and only after real four-yaw captures (do not rubber-stamp early):**
- Whether a technically valid, edge-preserving layout actually *reads* as FFT-grade authored composition — the P3.5 return trigger, and inherently a captures-first judgment.
- The weights and thresholds of the six heuristics (what "too flat," "too cluttered," "enough verticality" mean for your eye) — tunable only against captured output.
- The P3.8-adjacent product question of when a failed/degraded site becomes *exciting playable catastrophe* versus a bug — your stated "product rule over technical machinery."
- Everything already spun out as still-open in §12.7 (culture/identity, visible aging) is untouched by this research and remains yours.

**Wave 3 stays OPEN.** This report resolves the *technology* question P3.5 was blocked on and gives the §6 experiment to de-risk it; it does not close Wave 3, does not authorize a build (the `IMPLEMENTATION UNAUTHORIZED` / global hold stands), and does not convert the taste-gated items into technical rubber stamps.

---

<!-- End of verbatim supplied synopsis. -->
