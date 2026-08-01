---
type: research-sweep
project: Genesis
status: EVIDENCE FOR FOUNDER DECISION — no rulings made here
created: 2026-07-31
owner: spatial-compiler research lane
serves:
  - GOLDEN-SITE-SPATIAL-COMPILER-PLAN.md
question: >
  Is WFC the right solver for the assembly layer of the spatial compiler, versus shape
  grammars, graph grammars, ASP/constraint solving, template/chassis libraries, or
  LLM-authored offline module libraries with deterministic runtime assembly?
---

# SPATIAL COMPILER METHOD SWEEP

A breadth sweep of how program-bearing procedural architecture and site generation has actually
shipped and been published. Every factual claim carries a numbered source [Sn]; anything that is
my own reading rather than a documented fact is marked **inference**. Scores use the plan's nine
missing capabilities (GOLDEN-SITE-SPATIAL-COMPILER-PLAN.md §1), abbreviated:

- **C1** macro landform skeleton — **C2** typed parcel partition — **C3** plot negotiation
  (host program ↔ eligible land) — **C4** earthwork plan — **C5** compatible-module solving —
  **C6** scale-aware eligibility — **C7** governed completion of walls/roofs/stairs/terrain
  joins — **C8** structural-diversity guarantees — **C9** cheap proof ladder.

"Program-bearing" throughout means: the generated structure must satisfy functional obligations
(a working post, a controlled route, legal retreat), not merely look coherent.

## 1. Method dossiers

### 1.1 Townscaper and Bad North (Oskar Stålberg's tile solvers)

Townscaper runs a real-time WFC-derived tile solver on an irregular quad grid (a hex grid
recursively split into quads, then relaxed for organic shape); when the player places a block,
the solver picks the tile modules whose adjacency constraints fit that cell, using
marching-cubes-style corner logic so building pieces meet across irregular cells [S1][S2][S3].
The player controls only block placement and color; everything else is the solver. Critically,
Townscaper is explicitly "more of a toy than a game": generated buildings carry **zero**
functional obligations — no navigation, no interiors, no gameplay constraints of any kind [S1].
Bad North (shipped 2018) uses WFC over a grid of handcrafted 3D tiles to assemble whole island
dioramas; there the structures DO matter to gameplay (houses to defend, unit movement), and
Stålberg's answer was not to make the solver program-aware but to attach navigability data at
tile level and **validate-and-restart**: islands failing playability checks are thrown away and
regenerated [S1][S4][S5]. Authoring cost is a handcrafted tileset plus per-tile metadata —
modest for one artist-programmer, and the variety ceiling is the tileset. So the strongest
shipped WFC showcases prove exactly the boundary the plan draws: the solver owns local
coherence, and program truth is enforced only by post-hoc filtering, never negotiated.

### 1.2 Unexplored — cyclic graph grammars (Joris Dormans)

Unexplored (shipped 2017) generates each level in three broad phases: a dungeon-level plan (20
level requests with required exits, items, bosses), a floorplan phase that turns a request into
an abstract graph of rooms and encounters, and a tilemap-refinement phase that converts the
graph to a playable grid [S6]. The signature move is cyclic generation: start from a circular
loop between entrance and goal, then pick one of **24 major cycle types** (lock-and-key, hidden
shortcut, etc.) that use the loop's two arcs differently; cycles are deliberately abstract and
only fix the main flow [S6][S7]. The grammar **owns** topology and obligations — lock/key pairs,
hints, and patrol areas are typed graph edges that persist through every later rewrite, so the
runtime can even diagnose blockers ("Pray For Help") from the preserved structure [S6]. What
fills in later: biome theming, exact puzzles/enemies/rooms mid-generation, then grid expansion
(5×5 node grid ×2 for corridors ×5 for tiles) with per-block shaping rules and pattern-matched
set pieces [S6]. Authoring cost is the honest headline: roughly **50 modules and ~5,000
hand-written find-replace rules** in the custom PhantomGrammar language — Boris's summary is
that much of the "secret" is "a ton of different manually coded cases," feasible for one
developer only because the Ludoscope tooling made iteration fast [S6][S8]. Ludomotion carried
the same architecture into Unexplored 2 [S9]. This is the strongest shipped proof that a graph
layer can carry program obligations through refinement — at heavy, tool-dependent authoring
cost.

### 1.3 CGA shape grammars (Müller et al. 2006) and CGA++

CGA shape (SIGGRAPH 2006) is a split grammar: rules successively subdivide a building footprint
into mass model, then facades, then floors, bays, windows, and ornament, producing detailed
building **shells** of high visual quality; it demonstrated whole-city output (a virtual
Pompeii) and was commercialized as CityEngine (later an Esri product) [S10][S11][S12]. Rules
are context-sensitive enough for occlusion and snapping (e.g., suppress a window where a
neighboring volume occludes it), and derivation with seeded stochastic rule choice is
deterministic and fast — replayable given seed plus grammar (determinism per seed: standard
grammar-derivation behavior; **inference** from the papers' method, not a quoted benchmark).
Split grammars achieve closure by construction: walls meet roofs because one parent rule
produced both, which is why grammar cities don't have open seams — but plain CGA rules cannot
see other shapes, so coordinated multi-shape decisions were largely out of reach until CGA++
(Schwarz & Müller, TOG 2015) added first-class shapes, operations over multiple shapes, and
"events" for synchronization across the derivation [S13][S14]. Authoring cost is real
programming: a rule file per architectural style, written by someone fluent in the grammar; the
academic follow-on literature (layered grammars, proceduralization from exemplars) exists
largely because hand-writing grammars is expensive [S14][S15]. And CGA generates shells, not
programs: it never guarantees a functioning interior, circulation, or site obligation — the lot
is an input, and the grammar decorates downward from it [S10].

### 1.4 Answer Set Programming for PCG (Smith & Mateas)

The design-space approach (Smith & Mateas, TCIAIG 2011) encodes a generator as an AnsProlog
program: choice rules say what might exist, integrity constraints say what must not, and an
off-the-shelf solver (Clingo) enumerates artifacts; global properties like "the maze must be
completable" are literally one line (`:- not victory.`) and are enforced during search, not by
post-filtering [S16]. Measured performance in the paper: a complete chromatic-maze generator is
**49 lines**; one 6×6 maze with bounded solution length solves in ~250 ms; 10,000 distinct
desirable mazes in ~1 s; a globally optimal 6×6 in 2.5 s — but pushing global *optimization* to
21×21 found only a 114-step maze after two hours, and continuous/floating-point properties are
off-limits entirely [S16]. The shipped-adjacent proof is DIORAMA, an open-source Warzone 2100
map generator that solves coarse terrain heights, cliffs, player bases, and oil wells **in one
design space** — joint negotiation of program and land under layered global optimization — then
hands off to imperative, non-backtracking passes for smoothing and beautification [S16]. For
Refraction (the UW educational puzzle game), FDG 2012 work built three level-design automation
tools in two independent implementations, all **guaranteeing** key properties of output
(solvability, required concepts), and found even emergent aesthetic properties directly
constrainable [S17]. Tanagra (G. Smith, Whitehead, Mateas) similarly buried a numerical
constraint solver (Choco) inside a mixed-initiative platformer tool [S16][S18]. Authoring cost
is low in lines and high in paradigm: the 2011 paper reports an experienced ASP programmer
building three generators in under four hours, but solver behavior near phase transitions and
grounding blowup at scale are the standing risks [S16].

### 1.5 Template/chassis approaches in shipped roguelikes

**Spelunky** (2008/2012) generates each level on a 4×4 room grid: a solution path is drawn
first with typed rooms (types 1/2/3 guarantee left/right/down/up connectivity; type 0 is
off-path), each room then instantiated from hand-authored 10×8-tile templates whose marked
chunks are swapped for randomized obstacle variants [S19][S20][S21]. **Enter the Gungeon**
(2016) starts from an authored flow graph, decomposes it into loop and tree "composites," and
places hand-built rooms one at a time by pairing predefined exits with overlap rejection —
functional rooms (boss, shop, hub) are typed nodes in the flow, so program obligations are
honored by construction [S22][S23]. **Caves of Qud** layers methods: multi-pass zone building
where early passes lay coarse structure from hand-authored templates and procedural culture
facts, middle passes run WFC on **subdivided regions** with region-specific template sets
(ruins vs. city) to fill texture-scale detail, and final passes restore connectivity and
populate the map with functional content [S24][S25][S26]. Authoring cost across all three is
per-template hand work with near-zero solver risk: templates are pre-validated offline, runtime
assembly is cheap and almost fail-safe, and diversity is exactly as wide as the library — the
known failure mode being template recognition after many hours of play (**inference** from the
structure; widely reported by players but not benchmarked here).

### 1.6 WFC in practice: what the record actually says

Karth & Smith (FDG 2017) showed that Gumin's WFC is constraint *propagation* with greedy
observation and minimal-to-no backtracking, reformulated it declaratively in an ASP solver, and
thereby placed it inside the constraint-solving family — meaning anything WFC does, a full
solver can do with backtracking and global constraints added [S27]. (WFC itself descends from
Merrell's model synthesis, which already handled large outputs by re-solving in blocks [S28].)
The documented core weakness is global structure: WFC "doesn't have any global structure to it"
— it only makes output locally resemble input — so connectivity/reachability need bolted-on
global machinery like Boris's path constraint, design-level constraint extensions (FDG 2019),
or upstream planning [S5][S29]; the 2025 literature still lists "lack of non-local constraints"
as a defining limitation [S30]. The 2023–2026 response is consistently hierarchical/hybrid:
Hierarchical Semantic WFC gives the tileset a taxonomy so designers sketch with abstract tiles
that later collapse concretely [S31]; nested WFC decomposes generation into subproblems for
scale [S32]; and CG-WFC (Voisard et al., 2025) puts a Dormans-style cyclic mission-graph
grammar above WFC fill — mission graph in ~100 ms, WFC consuming 9–10 s of a ~10 s pipeline
[S33]. CG-WFC's own limitations section is the sharpest available statement of the open
problem: semantic metadata (room functions, encounter types, key–lock relations) "is not
currently propagated into the final WFC-generated environment," so outputs have structural
rhythm but "lack gameplay elements that would make them functionally meaningful," and
inter-region connectivity "can become brittle for dense graphs" [S33]. In 2026 there is still
no published case of a WFC layer *carrying* program obligations itself — every working system
puts them upstream or checks them afterward (**inference** from the sweep; no counterexample
found).

### 1.7 LLM-authored libraries / LLM-as-offline-designer (2024–2026)

The published LLM work splits into two camps. Instance generators: Word2World (Nasir, James,
Togelius 2024) has an LLM write a story, extract tiles/goals/characters, and compose a playable
2D world, with Word2Minecraft (2025) extending to 3D, and dual-agent LLM pipelines generating
3D maps zero-shot (Dec 2025) [S34][S35][S36]; surveys catalogue this direct-generation wave
[S37]. Planner-over-solver systems: TileGPT (Gaier, Stoddart, Villaggi, Sudhakaran — Autodesk
Research, 2024) has the LLM produce a high-level conceptual layout from a natural-language
prompt (distribution of buildings, green space), then WFC refines it into a detailed site plan
over a real modular-construction tile library (FactoryOS units), with all adjacency legality
enforced by the solver, not the model [S38]. TileGPT is the closest published relative of the
plan's shape — semantic intent above, deterministic constraint fill below — though its LLM runs
interactively at design time, not as a runtime component. What I did **not** find, anywhere in
2024–2026: a published system where an LLM authors a reusable, taste-gated *module library*
offline (chassis, sockets, completion operators) that a deterministic solver then assembles at
runtime with no model in the loop. That configuration — the one Genesis already uses for
sprites and Meshy props — appears to be unclaimed territory rather than a rejected idea
(**inference from absence**; absence of publication is weak evidence, but the adjacent
publications all stop short of it).

## 2. Scoring matrix

Scores: **OWNS** = the method as published/shipped directly provides the capability. **HELPS** =
supports it with added engineering. **NEUTRAL** = silent on it. **FIGHTS** = its natural grain
works against it. Clause justifications follow in §3.

| Capability | Stålberg WFC | Cyclic graph grammar | CGA split grammar | ASP / constraint | Template chassis | Hybrid plan+WFC | LLM offline library |
|---|---|---|---|---|---|---|---|
| C1 landform skeleton | FIGHTS | HELPS | NEUTRAL | HELPS | NEUTRAL | HELPS | HELPS |
| C2 typed parcels | NEUTRAL | HELPS | HELPS | HELPS | HELPS | HELPS | HELPS |
| C3 plot negotiation | FIGHTS | HELPS | NEUTRAL | OWNS | HELPS | NEUTRAL | NEUTRAL |
| C4 earthwork plan | NEUTRAL | NEUTRAL | NEUTRAL | NEUTRAL | NEUTRAL | NEUTRAL | NEUTRAL |
| C5 module solving | OWNS | HELPS | HELPS | OWNS | HELPS | OWNS | NEUTRAL |
| C6 scale eligibility | NEUTRAL | HELPS | HELPS | HELPS | HELPS | HELPS | HELPS |
| C7 governed completion | HELPS | HELPS | OWNS | HELPS | HELPS | HELPS | NEUTRAL |
| C8 diversity guarantees | FIGHTS | OWNS | NEUTRAL | OWNS | HELPS | HELPS | HELPS |
| C9 cheap proof ladder | HELPS | HELPS | HELPS | HELPS | HELPS | HELPS | HELPS |

The one row that is NEUTRAL across the board is C4: **no surveyed method has ever planned
earthworks** — cut/fill/retain as negotiated, receipted operations on a landform. Diorama's
cliffs and Bad North's cliff tiles are appearance-and-passability facts, not earth-moving
plans. C4 is original work whichever solver is chosen (**inference** from the sweep).

## 3. Per-method justifications (one clause each)

**Stålberg WFC** — C1 FIGHTS: invents macro landform cell-by-cell, the exact NC-WFC-NATURAL-MACRO
failure. C2 NEUTRAL: no region typing beyond per-level tile masking. C3 FIGHTS: no host↔land
dialogue, only generate-and-restart filtering [S1]. C4 NEUTRAL: terrain is just more tiles.
C5 OWNS: adjacency-legal module assembly, shipped twice. C6 NEUTRAL: one tile scale, no
eligibility logic. C7 HELPS: corner/edge tiles are a completion vocabulary, but holes mean
restart, not governed fallback. C8 FIGHTS: locally-similar-everywhere output gives texture
variety, not categorical composition axes [S27]. C9 HELPS: contradictions and playability
filters fail fast and pre-render.

**Cyclic graph grammar** — C1 HELPS: relational node/edge planning matches the skeleton schema,
though Dormans never applied it to terrain (**inference**). C2 HELPS: typed annotated nodes
(biomes, room types) are parcel-like and survive refinement. C3 HELPS: lock/key/patrol
obligations ride the graph through every phase [S6]. C4 NEUTRAL: nothing comparable. C5 HELPS:
local legality by ~5,000 hand-authored rewrite cases, not solving [S6]. C6 HELPS: staged
abstract-to-specific refinement is inherently multi-scale. C7 HELPS: grow-then-cleanup rule
phases are an authored completion grammar. C8 OWNS: 24 cycle types are categorical diversity by
construction — pick a different cycle, get a different composition [S6][S7]. C9 HELPS: cheap
inspectable graph artifacts exist before any tile is placed.

**CGA split grammar** — C1 NEUTRAL: terrain and streets are inputs, not products [S10].
C2 HELPS: block-to-lot subdivision is a real but rectangular-leaning parcel pass. C3 NEUTRAL:
the lot is given; occlusion queries give only local context awareness. C4 NEUTRAL: buildings
sit on their lot. C5 HELPS: derivation, not solving — compatibility holds because a parent rule
emitted both mates. C6 HELPS: rules condition on shape dimensions, so detail adapts to extent.
C7 OWNS: closed shells with handled corners/eaves/edges are the method's entire shipped trade
[S10][S12]. C8 NEUTRAL: stochastic rule choice varies within a style; categorical difference
requires new grammars. C9 HELPS: explicit coarse-to-fine order (mass model before facade
detail) gives cheap early artifacts.

**ASP / constraint solving** — C1 HELPS: Diorama solved coarse terrain with global feature
constraints, leaving continuous smoothing imperative — exactly the plan's skeleton/emitter
split [S16]. C2 HELPS: typed regions with adjacency/coverage constraints are natural facts,
though unshipped at parcel richness (**inference**). C3 OWNS: Diorama solves terrain, bases,
and wells in one design space — genuine program↔land negotiation [S16]. C4 NEUTRAL: no
precedent; integer volume budgets are expressible but floats are off-limits [S16]. C5 OWNS: WFC
is a special case of what these solvers do, with backtracking and global constraints included
[S27]. C6 HELPS: eligibility predicates are one-line integrity constraints. C7 HELPS:
guarantees no illegal boundary survives, but gives rejection rather than named fallback
operators. C8 OWNS: enumerate distinct answer sets, constrain candidates apart, even prove
nonexistence [S16]. C9 HELPS: machine-checked plan-stage proof in milliseconds-to-seconds on
realistic instances, with grounding blowup as the scale caveat [S16].

**Template chassis** — C1 NEUTRAL: macro is a tiny authored grid or flow graph, no landform.
C2 HELPS: typed room systems with obligations shipped three times [S19][S22][S24]. C3 HELPS:
obligations honored by construction (solution path, exit pairing, typed special rooms), though
land never pushes back. C4 NEUTRAL: nothing. C5 HELPS: mating via fixed exits/door sockets — a
small hand-checked compatibility system needing no solver. C6 HELPS: authored size/shape
classes with placement rules are crude scale eligibility. C7 HELPS: chunk substitution and
final connectivity passes close seams [S20][S24]. C8 HELPS: categorical difference is
authorable per template class but guaranteed only by library breadth, not by a gate. C9 HELPS:
validation amortized into offline template authoring; runtime assembly is near fail-safe.

**Hybrid plan+WFC** — C1 HELPS: the pattern demotes WFC below a macro plan but brings no
landform machinery of its own [S24][S33]. C2 HELPS: region-scoped tilesets and abstract-tile
regions condition local fill [S24][S31]. C3 NEUTRAL: CG-WFC's own admission — program metadata
is not propagated into the fill; outputs "not yet fully playable" [S33]. C4 NEUTRAL: nothing.
C5 OWNS: constrained fill under fixed cells/painted rooms is exactly compatible-module solving
[S5][S33]. C6 HELPS: hierarchical taxonomies and nested decomposition are research-grade scale
control [S31][S32]. C7 HELPS: local seams close within regions; cross-region joins are the
documented brittle point [S33]. C8 HELPS: categorical diversity lives in the macro recipe; WFC
adds micro variety beneath it [S33]. C9 HELPS: two-layer split yields a ~100 ms inspectable
plan before ~10 s of fill [S33].

**LLM offline library** — C1 HELPS: models can draft skeleton families/annotations offline, but
published systems draft instances, not vetted libraries (**inference**) [S38]. C2 HELPS:
natural-language plans express typed regions directly (TileGPT's buildings/green-space
distributions) [S38]. C3 NEUTRAL: no published negotiation; plans are suggestions the solver
satisfies or fails. C4 NEUTRAL: nothing. C5 NEUTRAL: assembly is delegated to the deterministic
layer by design [S38]. C6 HELPS: cheap offline annotation of modules with scale/eligibility
metadata (**inference**, mirrors Genesis's existing sprite/prop pipelines). C7 NEUTRAL: no
precedent; completion must stay deterministic. C8 HELPS: breadth of proposed families is the
model's strength, but guarantees still need deterministic gates. C9 HELPS: all model cost and
review moves to library-build time; runtime stays deterministic and cheap.

## 4. What this implies for the Genesis P3 wave

Nothing in the shipped or published record supports fine-tile WFC as the *owner* of a
program-bearing assembly layer. Every success demotes it: Bad North filters after the fact,
Qud confines it to texture patches inside typed regions, and the 2025 hybrid frontier still
cannot push room functions through the collapse — CG-WFC says so in print. Meanwhile the
plan's §6 solver is already described as a bounded deterministic constraint solver with
domains, propagation, budgeted backtracking, and receipts. Karth & Smith show that is not
"WFC plus patches" — it is general constraint solving, of which WFC is the weakest special
case. The evidence therefore points to keeping the P3 kernel as a *constraint solver over
authored modules* and dropping the WFC framing except as ancestry: ASP-style declarative
global constraints are the only surveyed mechanism that ever jointly negotiated program and
land (Diorama) and the only one with built-in diversity guarantees (enumerate-and-constrain,
provable nonexistence). Chassis selection should lean on the template/chassis precedent —
three shipped roguelikes prove typed, pre-validated assemblies carry obligations cheaply.
The completion grammar should lean on the CGA lesson: closure comes from authored top-down
rules, not from hoping tiles meet. Categorical diversity should copy Unexplored's cycle-type
move: enumerate composition families first (the plan's three Guard compositions already do
this), and let the diversity gate compare receipts, not silhouettes. The LLM lane is
genuinely open ground: no one has published offline model-authored module libraries with
deterministic runtime assembly, and TileGPT stops one step short — Genesis's signature-kit
pipeline would be first, provided every kit passes deterministic validators and the taste
gate. Earthworks (C4) have no precedent anywhere; budget original design time there, because
no literature will carry it.

## 5. Sources

- [S1] How Townscaper Works: A Story Four Games in the Making — Game Developer.
  https://www.gamedeveloper.com/game-platforms/how-townscaper-works-a-story-four-games-in-the-making
- [S2] Townscaper Grid — BorisTheBrave (Sylves docs).
  https://boristhebrave.com/docs/sylves/1/articles/tutorials/townscaper.html
- [S3] Generating an organic grid — andersource.
  https://andersource.dev/2020/11/06/organic-grid.html
- [S4] EPC2018 — Oskar Stålberg, "Wave Function Collapse in Bad North" (talk video).
  https://www.youtube.com/watch?v=0bcZb-SsnrA
- [S5] Wave Function Collapse tips and tricks — BorisTheBrave.
  https://www.boristhebrave.com/2020/02/08/wave-function-collapse-tips-and-tricks/
- [S6] Dungeon Generation in Unexplored — BorisTheBrave.
  https://www.boristhebrave.com/2021/04/10/dungeon-generation-in-unexplored/
- [S7] Unexplored's Secret: 'Cyclic Dungeon Generation' — Game Developer.
  https://www.gamedeveloper.com/design/unexplored-s-secret-cyclic-dungeon-generation-
- [S8] Graph Rewriting for Procedural Level Generation — BorisTheBrave.
  https://www.boristhebrave.com/2021/04/02/graph-rewriting/
- [S9] Unexplored 2 Dev Blog — Level Generation — Ludomotion.
  https://www.ludomotion.com/blogs/level-generation/index.html
- [S10] Müller, Wonka, Haegler, Ulmer, Van Gool, "Procedural Modeling of Buildings,"
  ACM TOG 25(3) / SIGGRAPH 2006. https://dl.acm.org/doi/10.1145/1141911.1141931
- [S11] Same paper, alternate record. https://dl.acm.org/doi/10.1145/1179352.1141931
- [S12] CGA Shape grammar lecture notes (Andujar, UPC, 2014).
  https://www.cs.upc.edu/~virtual/SGI/docs/1.%20Theory/Unit%2011.%20Procedural%20modeling/CGA%20shape%20grammar.pdf
- [S13] Schwarz & Müller, "Advanced Procedural Modeling of Architecture" (CGA++), ACM TOG 2015.
  https://dl.acm.org/doi/10.1145/2766956
- [S14] SIGGRAPH history note on CGA++.
  https://history.siggraph.org/learning/advanced-procedural-modeling-of-architecture-by-schwarz-and-muller/
- [S15] Jesus et al., "Layered Shape Grammars for Procedural Modelling of Buildings."
  https://scispace.com/pdf/layered-shape-grammars-for-procedural-modelling-of-buildings-2fd7z6s0mf.pdf
- [S16] Smith & Mateas, "Answer Set Programming for Procedural Content Generation: A Design
  Space Approach," IEEE TCIAIG 3(3), 2011. https://adamsmith.as/papers/tciaig-asp4pcg.pdf
  (read in full for this sweep; performance and case-study numbers quoted from the PDF)
- [S17] Smith, Andersen, Mateas, Popović, "A case study of expressively constrainable level
  design automation tools for a puzzle game," FDG 2012.
  https://dl.acm.org/doi/10.1145/2282338.2282370
- [S18] Smith, Whitehead, Mateas, "Tanagra: A mixed-initiative level design tool," FDG 2010
  (cited via [S16] reference list). https://www.semanticscholar.org/paper/05c720785233f1368915908a75e7b54f7a5a7dfe
- [S19] Spelunky — Procedural Content Generation Wiki.
  https://procedural-content-generation.fandom.com/wiki/Spelunky
- [S20] Darius Kazemi, "Spelunky Generator Lessons" (interactive).
  http://tinysubversions.com/spelunkyGen/
- [S21] Shaker, Togelius, Nelson — PCG Book chapter, "Constructive generation methods for
  dungeons and levels." https://antoniosliapis.com/articles/pcgbook_dungeons.php
- [S22] Dungeon Generation in Enter The Gungeon — BorisTheBrave.
  https://www.boristhebrave.com/2019/07/28/dungeon-generation-in-enter-the-gungeon/
- [S23] Studying Dungeon Generation in Enter The Gungeon — 80.lv.
  https://80.lv/articles/studying-dungeon-generation-in-enter-the-gungeon
- [S24] Grinblat & Bucklew, "End-to-End Procedural Generation in Caves of Qud," GDC 2019 slides.
  https://media.gdcvault.com/gdc2019/presentations/Grinblat_Jason_End-to-End_Procedural_Generation.pdf
- [S25] Bucklew, "Tile-Based Map Generation using Wave Function Collapse in Caves of Qud,"
  GDC Vault. https://gdcvault.com/play/1026263/Math-for-Game-Developers-Tile
- [S26] Caves of Qud wiki — Zone Procedural Generation (modding).
  https://wiki.cavesofqud.com/wiki/Modding:Zone_Procedural_Generation
- [S27] Karth & Smith, "WaveFunctionCollapse is Constraint Solving in the Wild," FDG 2017.
  https://adamsmith.as/papers/wfc_is_constraint_solving_in_the_wild.pdf
  (also https://dl.acm.org/doi/10.1145/3102071.3110566)
- [S28] Model synthesis (Merrell) — Wikipedia overview of the WFC lineage.
  https://en.wikipedia.org/wiki/Model_synthesis
- [S29] "Enhancing wave function collapse with design-level constraints," FDG 2019.
  https://dl.acm.org/doi/10.1145/3337722.3337752
- [S30] "A Markovian Framing of WaveFunctionCollapse for Procedurally Generating Aesthetically
  Complex Environments," arXiv 2025. https://arxiv.org/html/2509.09919
- [S31] Alaka & Bidarra, "Hierarchical Semantic Wave Function Collapse," FDG 2023.
  https://dl.acm.org/doi/10.1145/3582437.3587209
  (PDF: https://pcgworkshop.com/archive/alaka2023hierarchical.pdf)
- [S32] "Extend Wave Function Collapse to Large-Scale Content Generation" (nested WFC), arXiv.
  https://arxiv.org/pdf/2308.07307
- [S33] Voisard, Politowski, Petrillo, Géhéneuc, "CG-WFC: A Hybrid Cyclic-Graph & WFC Method
  for Designer-Guided and Replayable Procedural Content Generation," 2025 workshop paper.
  https://blog.ptidej.net/content/files/2025/11/_ICSE_GAS_Laurent____Graph_WFC_Procedural_Gen-1_compressed.pdf
  (read in full for this sweep; timings and limitation quotes from the PDF)
- [S34] Nasir, James, Togelius, "Word2World: Generating Stories and Worlds through Large
  Language Models," arXiv 2024. https://arxiv.org/abs/2405.06686
- [S35] "Word2Minecraft: Generating 3D Game Levels through Large Language Models," arXiv 2025.
  https://arxiv.org/abs/2503.16536
- [S36] "Zero-shot 3D Map Generation with LLM Agents: A Dual-Agent Architecture for Procedural
  Content Generation," arXiv Dec 2025. https://arxiv.org/pdf/2512.10501
- [S37] "Procedural Content Generation in Games: A Survey with Insights on Emerging LLM
  Integration," 2024. https://www.researchgate.net/publication/385888613_Procedural_Content_Generation_in_Games_A_Survey_with_Insights_on_Emerging_LLM_Integration
- [S38] TileGPT — Autodesk Research, 2024 (Gaier, Stoddart, Villaggi, Sudhakaran).
  https://tilegpt.github.io/
