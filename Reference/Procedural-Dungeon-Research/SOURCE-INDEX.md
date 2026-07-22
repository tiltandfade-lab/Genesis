---
type: reference-index
status: VERIFIED
created: 2026-07-18
updated: 2026-07-22
---

# Source Index

The original collection was retrieved 2026-07-18; S10 and supplemental research input R1 were added 2026-07-22.
Local PDF page numbers below refer to the page sequence reported by `pdfinfo`, not necessarily a venue's printed
folio. All ten PDF files passed `pdfinfo` and text-extraction checks.

## Primary article and implementation documentation

1. **Archmage Rises, "How to Procedurally Generate and Decorate 3D Dungeon Rooms in Unity C#" (2021).** The practical starting point: four implementation families, a tile-space model, layered wall/door placement, decorative versus practical objects, blocked tiles, object slots, and builder ordering. Live source: https://www.archmagerises.com/news/2021/6/12/how-to-procedurally-generate-and-decorate-3d-dungeon-rooms-in-unity-c
2. **Edgar documentation, "Room templates."** Current technical documentation for polygonal room templates, door modes, door sockets, allowed door lines, transformations, and repeat modes. Live source: https://ondrejnepozitek.github.io/Edgar-Unity/docs/next/basics/room-templates/

These two publishers do not provide official standalone PDFs for these pages. They are cited rather than republished.

## Included research papers

| ID | Local PDF | Work | Why it matters to Genesis | Original URL | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| S1 | `papers/01-tutenel-2009-rule-based-layout-solving.pdf` | Tutenel, Bidarra, Smelik, and de Kraker, "Rule-based layout solving and its application to procedural interior generation" (2009), 10 pages | The closest match to the proposed room compiler: semantic object classes, tagged spatial features, legal-region construction, attractors/detractors, hierarchical blocks, ordered plans, backtracking, and diagnostic visualization. | https://publications.tno.nl/publication/16406495/SpoKBV/tutenel-2009-rulebased.pdf | `1a0b479aa7e417f92f6825db3574408d57b960b5f00f0013e1c9bf8401bce296` |
| S2 | `papers/02-tutenel-2010-semantic-scene-description.pdf` | Tutenel, Smelik, Bidarra, and de Kraker, "A Semantic Scene Description Language for Procedural Layout Solving Problems" (2010), 6 pages | Shows how designer intent can be expressed as a high-level scene description and compiled into a placement procedure. This is the right model for reshaping Genesis rollers. | https://publications.tno.nl/publication/104068/QKyXAK/tutenel-2010-semantic.pdf | `8ad385a8419691238a710cf0cb4ad149e4f5bd93009037af4b38f998b8e7d888` |
| S3 | `papers/03-yu-2011-make-it-home.pdf` | Yu et al., "Make it Home: Automatic Optimization of Furniture Arrangement" (2011), 11 pages | Treats accessibility, visibility, door-to-door pathways, and pairwise relations as terms in a whole-layout objective. The key lesson is that circulation is generated, not checked at the end. | https://web.cs.ucla.edu/~dt/papers/siggraph11/siggraph11.pdf | `ce3f531c61bebb995d881dab53b4bd869b55b6d5221ec77e1b4e302d4db10751` |
| S4 | `papers/04-merrell-2011-interactive-furniture-layout.pdf` | Merrell, Schkufza, Li, Agrawala, and Koltun, "Interactive Furniture Layout Using Interior Design Guidelines" (2011), 9 pages | Supplies useful functional and compositional score terms: clearance, connected free space, conversation, balance, alignment, focal emphasis, and symmetry. | https://graphics.stanford.edu/~pmerrell/furnitureLayout2.pdf | `d7f776158316b6f21d36d375c5eef73bae5795e36a70b47ac47f4bf9dee09612` |
| S5 | `papers/05-horswill-2012-playability-constraints.pdf` | Horswill and Foged, "Fast Procedural Level Population with Playability Constraints" (2012), 6 pages | Demonstrates fast constraint propagation over portal graphs and path constraints for keys, locks, enemies, health, and other gameplay invariants. | https://ojs.aaai.org/index.php/AIIDE/article/download/12511/12364 | `45323ca39748aad06461230f80c700d8e8ecf7d9173d397e2a2a540e3488f36c` |
| S6 | `papers/06-nepozitek-2018-tile-based-dungeon-generator.pdf` | Nepozitek and Gemrot, "Fast Configurable Tile-Based Dungeon Level Generator" (2018), 5 pages | Technical foundation for graph-driven room-template layout: compatible boundary segments, configuration spaces, chains, incremental placement, and backtracking. | https://artemis.ms.mff.cuni.cz/main/papers/Fast_Configurable_Tile_Based_Dungeon_Level_Generator.pdf | `89efa5ef2d4ea786b852caf713ee2b4cb389eae1f4effe854b3fe5fb6befaafd` |
| S7 | `papers/07-green-2019-two-step-dungeon-generation.pdf` | Green et al., "Two-step Constructive Approaches for Dungeon Generation" (2019), 7 pages | Empirically supports separating architecture creation from furnishing and combining independent generators; adds expressivity metrics and persona-based playability evaluation. | https://pcgworkshop.com/archive/green2019constructive.pdf | `4bc679acedb55a0554ed00b14c778d6e921c48037028e1c9d42e1ec52daea524` |
| S8 | `papers/08-henderson-2019-constrained-furniture-layouts.pdf` | Henderson, Subr, and Ferrari, "Automatic Generation of Constrained Furniture Layouts" (2019), 11 pages | A learned, data-driven alternative for class, count, location, orientation, motif, and abutment sampling with explicit traversability rejection. Useful later for priors, not as the first implementation. | https://arxiv.org/pdf/1711.10939 | `be05d973f42f9398c67ef0cb4698adf416ea4c3df201b090ca7b6821c2278ea6` |
| S9 | `papers/09-whitehead-2020-smt-dungeon-layout.pdf` | Whitehead, "Spatial Layout of Procedural Dungeons Using Linear Constraints and SMT Solvers" (2020), 9 pages | Shows that declarative integer constraints can solve room bounds, separation, adjacency preferences, and designer control lines quickly. A plausible escalation path for structural layout. | https://pcgworkshop.com/archive/whitehead2020spatial.pdf | `72b818aaa54a0e3e185f796e2d7ea608933510e8883fa2ec01f41c3203a60d79` |
| S10 | `papers/10-mueller-2006-procedural-modeling-buildings.pdf` | Müller, Wonka, Haegler, Ulmer, and Van Gool, "Procedural Modeling of Buildings" (2006), 10 pages | Introduces CGA shape: context-sensitive volumetric and surface shape grammar with scope subdivision, repetition, component insertion, occlusion/snap awareness, and rules that preserve architectural relationships. It supports Wave 3's procedural culture constitution, stamp/trim grammar, and geometry-assembly research, but it does not solve Genesis's canonical functional-graph embedding or tactical composition problem by itself. | https://peterwonka.net/Publications/pdfs/2006.SG.Mueller.ProceduralModelingOfBuildings.final.pdf | `d1658331d7936be4e5d0edddd5d3f30ab46e950a809ec8b7cb426e9ebdde0c85` |

## Supplemental research inputs

| ID | Local file | Work | Why it matters to Genesis | Authority | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| R1 | `claude-wave-03-graph-to-space-solver-research-2026-07-22.md` | Claude, "Genesis Wave 3 — Graph-to-Space & Tactical-Composition Solver Research" (supplied by Adam, 2026-07-22) | Broad modern solver/floorplanning/PCG/geometry survey. It adds rectangular-dual and minimum-bends floorplanning, a rectangular -> orthogonal -> irregular representation ladder, candidate diagnostic metrics, a concrete eight-edge prototype fixture, and library/license leads. | Retained research input, **unverified in part**. Its packages, performance claims, algorithms, and recommendations require task-specific verification; it is not an accepted design ruling or dependency admission. | `96a03f1291916ec4fb2ece0a6eafa42cca38981b87b3aea7e2d843606421131a` |

R1 preserves the supplied synopsis verbatim after a repository retention note. The original attachment content had
SHA-256 `313d453c71bf43f931b0e156ff444ac6324ea9287f299d7ec34960de1d3ff2d5`; the retained file's different hash reflects
only the added metadata and cautionary preface.

## Reading order

For Genesis implementation decisions, read S1, S2, S10, S6, S3, S4, S7, S5, S9, then S8. This order moves from
the exact semantic compiler model through context-sensitive architecture grammar, doors and topology, circulation
and composition, gameplay constraints, and optional future solvers.

S10 is an author-hosted research copy of a published paper. Its local presence grants no permission to redistribute
it as a game asset or to import third-party implementation code. Genesis uses its described concepts as research;
all production grammar, code, data, and art remain independently created and governed by their own licenses.

## Citation convention in the report

`[S1 p. 4]` means local PDF S1, PDF page 4. Section names are included where they are more stable than a page number. Web citations are named `Archmage` and `Edgar`.
