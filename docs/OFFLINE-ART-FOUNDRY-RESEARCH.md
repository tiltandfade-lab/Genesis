---
type: research
project: Genesis
status: RESEARCH COMPLETE 2026-07-12; implementation waves SPECCED, not started
created: 2026-07-12
related:
  - "[[GRAPHICS-CONVERGENCE-CHARTER]]"
  - "[[GRAPHICS-CONVERGENCE-PLAN]]"
  - "[[MODEL-GRAMMAR]]"
  - "[[TABLETOP-VISION]]"
  - "[[GRAPHICS-PRODUCTION-RESEARCH-WAVE]]"
---

# OFFLINE ART FOUNDRY: a donor grammar, not an asset dump

## 0. Ruling

Genesis has **not** exhausted Kenney. The repository contains 3 of the 49 current official 3D
packs: 155 GLBs and roughly 11 MB. This audit downloaded 13 additional high-value packs into
scratch only, verified CC0 both on every source page and inside every archive, and loaded all
1,752 GLBs without failure. Those candidates occupy only about 36 MB as extracted GLBs.

The useful discovery is not the raw count. The corpus is already a low-complexity visual language:

- median mesh: 114 faces; 90th percentile: 380 faces;
- 343 filename-derived variant families;
- explicit modifiers include `corner`, `inner`, `outer`, `half`, `low`, `wide`, `open`, `closed`,
  `broken`, `damaged`, `wood`, `stone`, `round`, `square`, and `diagonal`;
- strong families include fantasy walls/doorways/windows, cliffs, paths/rivers, bridges, stairs,
  rocks, containers, furniture, mechanisms, and practical lights.

**Adopt Kenney as a CC0 donor grammar and structural textbook. Do not make it Genesis's visual
identity and do not import the full corpus into the runtime.** Genesis becomes bespoke through
selection, recombination, proportion, material language, weathering, realm treatment, interaction
logic, lighting, and composition. A recognizable untouched pack asset is a fallback, not the goal.

This extends `MODEL-GRAMMAR.md`; it does not replace it. Creature figures and scene props should
share anchors, channels, deterministic recipes, validation, and gap ledgers. Box primitives remain
the universal fallback. Donor meshes are higher-fidelity implementations behind the same semantic
part names.

## 1. The no-human production contract

There is no production artist selecting vertices. Therefore the interface must be semantic.

The DM may say what the rolled object **is**, what it does, and how it relates to the scene:

> a low, broken observatory console; conceals two watchers; brass lever on the camera-facing side;
> active cold magic; difficult cover

The DM may not request a specific source mesh, prescribe arbitrary coordinates, or invent a prop
to replace a rolled noun. The visual compiler turns that request and the persisted walk facts into
a deterministic recipe. The compiler owns geometry, collision, sockets, orientation, material
channels, budgets, and visibility. Unknown requests resolve to the nearest valid grammar and enter
a gap ledger; they never become invisible.

The walk remains sovereign:

1. Roll cards are immutable semantic facts.
2. Walk-wide composition assigns every card a meaningful home, including overflow into empty rooms,
   secrets, hidden encounters, and secret connections.
3. A room projection asks the prop compiler to realize the cards assigned to that room.
4. The prop compiler may change representation, scale within bounds, combine compatible cards, or
   choose a variant. It may not reroll, delete, duplicate, or narratively reinterpret a card.
5. A single `sourceCardRefs[]` trail runs from mesh instance back to the walk results.

## 2. Candidate corpus

The reproducible audit is `dev/offline-art-lab/kenney_catalog_audit.py`. It parses all four current
[official Kenney 3D catalog pages](https://kenney.nl/assets/category:3D), records source and direct
archive URLs, and optionally downloads to scratch. `kenney_grammar_probe.py` then loads every GLB
and derives a first-pass role/family/modifier census.

| pack | GLBs | best use in Genesis |
| --- | ---: | --- |
| [Fantasy Town](https://kenney.nl/assets/fantasy-town-kit) | 167 | walls with actual thickness, doors, windows, stairs, roofs, fountains, lanterns |
| [Castle](https://kenney.nl/assets/castle-kit) | 76 | battlements, narrow/half walls, towers, gates |
| [Modular Cave](https://kenney.nl/assets/modular-cave-kit) | 40 | cave shells and corridor topology reference |
| [Nature](https://kenney.nl/assets/nature-kit) | 329 | cliffs, rocks, trees, paths, rivers, bridges, crops |
| [Furniture](https://kenney.nl/assets/furniture-kit) | 140 | chassis and proportions for domestic/urban props |
| [Survival](https://kenney.nl/assets/survival-kit) | 80 | tools, containers, camp dressing, construction parts |
| [Pirate](https://kenney.nl/assets/pirate-kit) | 72 | crates, ropes, docks, ship parts, tavern dressing |
| [Factory](https://kenney.nl/assets/factory-kit) | 143 | levers, pipes, conveyors, modular mechanisms |
| [Building](https://kenney.nl/assets/building-kit) | 79 | extremely simple walls, floors, doors, borders, rails |
| [Brick](https://kenney.nl/assets/brick-kit) | 296 | procedural construction primitives and bevel studies |
| [Food](https://kenney.nl/assets/food-kit) | 200 | table dressing and market/feast storytelling |
| [Retro Fantasy](https://kenney.nl/assets/retro-fantasy-kit) | 105 | direct scale/style comparator and very cheap props |
| [Industrial City](https://kenney.nl/assets/city-kit-industrial) | 25 | silhouette/proportion donors for outlandish realms |

The 13 official archives total 55,098,875 bytes. Exact versions and SHA-256 hashes are committed in
`dev/offline-art-lab/baseline-findings.json`. The downloads are intentionally not committed.

### 2.1 Admission classes

Every source object receives exactly one review status:

| class | meaning | permitted use |
| --- | --- | --- |
| `DIRECT_MODULATED` | silhouette already fits Genesis | normalized mesh plus mandatory Genesis material/condition pass |
| `PART_DONOR` | useful subassembly | extract named components and sockets; do not expose original whole asset |
| `GRAMMAR_REFERENCE` | teaches dimensions/topology/variants | measurements and tests only; no shipped geometry |
| `FALLBACK_DIRECT` | broad coverage is more valuable than novelty | untouched geometry allowed behind a debug/fallback marker |
| `REJECT` | wrong silhouette, cost, topology, or semantic ambiguity | audit record only |

CC0 answers permission, not fitness. Every admitted file keeps `sourcePack`, `sourcePage`, version,
archive hash, original filename, transformation recipe, and output hash.

## 3. Prop Assembly IR

The build-time interchange format is data, serializable and diffable:

```json
{
  "schema": "genesis.prop-recipe.v1",
  "id": "observatory-console/cold-broken",
  "noun": "observatory console",
  "sourceCardRefs": ["walk:marrow-vault/S3:feature", "walk:marrow-vault/S5:npc-overflow"],
  "seed": "world-17/marrow-vault/S3/feature/0",
  "footprint": {"shape":"box", "sizeZones":[1,1], "cover":"difficult"},
  "chassis": {"part":"console-low", "implementation":"kenney/factory/box-wide"},
  "modules": [
    {"part":"lever-single", "socket":"interaction.front", "state":"active"},
    {"part":"lens-array", "socket":"top.0", "repeat":3},
    {"part":"concealment-cavity", "socket":"inside", "reveals":["npc:watcher-a","npc:watcher-b"]}
  ],
  "operations": [
    {"op":"scale-axis", "axis":"y", "factor":0.72},
    {"op":"damage", "amount":0.35, "side":"camera-away"},
    {"op":"bevel", "widthClass":"small"}
  ],
  "channels": {"body":"realm-stone", "trim":"aged-brass", "accent":"faction", "glow":"cold-magic"},
  "condition": ["dusty", "chipped", "frost-rimed"],
  "presentation": {"importance":"centerpiece", "preferredFacing":"camera", "lightRole":"secondary"}
}
```

### 3.1 Closed operation vocabulary

Initial legal geometry operations are deliberately modest:

- `scale-uniform`, `scale-axis` within per-part bounds;
- `mirror`, `rotate-quarter`, `repeat-linear`, `repeat-radial`;
- `attach`, `replace`, `omit`, `open-state`, `closed-state`;
- `bevel` from a small fixed width set;
- `damage` using deterministic removal/chip masks and authored break candidates;
- `combine` only across declared compatible parts;
- `cap`, `thicken`, and `ground` as normalization/repair operations.

No arbitrary boolean operation runs at game runtime. Offline booleans must produce a cached GLB,
pass topology and silhouette gates, and retain their recipe. Runtime assembly should be transformed
instances or prebuilt composites so a rich room does not become a draw-call accident.

### 3.2 Sockets

All normalized parts expose a subset of a closed socket vocabulary:

`ground`, `top[]`, `inside`, `front`, `back`, `side.left`, `side.right`, `wall.mount`, `ceiling.mount`,
`hand`, `interaction.front`, `interaction.top`, `light.emitter`, `fx.origin`, `concealment`, and
`loot.origin`.

Each socket is a local transform plus constraints: accepted roles, maximum bounds, facing policy,
occupancy, and whether repetition is legal. Socket inference may propose transforms from bounds and
principal axes, but admission requires an automated render/contact test. A prop touching the wrong
surface is a failed build, not “close enough.”

### 3.3 Semantic channels

Imported RGB values are not Genesis identity. Geometry resolves semantic channels through the
existing palette stack: construction (`stone`, `wood`, `metal`, `cloth`, `bone`, `glass`), realm,
faction accent, age, condition, and magic. The same assembled shrine can therefore belong to a
Gloom crypt or Verdant sanctuary without changing its narrative identity or recipe topology.

The minimum material response is albedo value grouping, roughness variation, stable normals,
edge wear, crevice grime, and motivated emissive. Large architecture keeps world/triplanar mapping.
Recognizable reusable props may receive generated UV atlases. Emissive geometry must be housed in a
physical practical (lantern, brazier, crystal, aperture); a floating light orb is an error state.

## 4. Geometry normalization contract

Do not load arbitrary donor GLBs directly in the theater. An offline importer must:

1. verify archive/file hash and provenance;
2. parse scenes and preserve intentional named submeshes;
3. map to Genesis Y-up, camera-forward convention;
4. set origin at ground-contact center or declared mount socket;
5. normalize scale to semantic units and record original transform;
6. merge only vertices safe to merge; preserve UV/material seams;
7. remove degenerate and duplicate faces and unreferenced vertices;
8. fix winding where unambiguous, generate normals/tangents as required;
9. identify open sheets versus intended solids; use `thicken` for walls that require gameplay
   volume, never a blanket watertight repair;
10. derive bounds, footprint, interaction proxy, cover class, occlusion proxy, and LOD budget;
11. retain or generate UVs and validate alpha-gutter dilation;
12. emit canonical GLB + metadata + deterministic output hash.

The mesh probe found all representative Kenney assets UV-complete, but most remained non-watertight
even after conservative vertex canonicalization. This is expected for separate boards, trim, lids,
and material surfaces. **Watertightness is diagnostic, not a universal gate.** Correct winding,
zero accidental degenerates/duplicates, plausible component count, ground contact, finite bounds,
valid UVs, and correct rendered silhouette are stronger gates. A solid collision/occlusion proxy may
be generated separately from decorative render geometry.

## 5. Texture and generated-atlas lane

The OpenCV probe reduced opposite-edge seam error on `fantasy-wall-1.png` by 75.88% and produced
deterministic nearest-opaque RGB dilation while preserving alpha. It also found that Telea and
Navier-Stokes inpainting both lost to a trivial mean fill on the deliberately low-frequency wall
hole. Therefore:

- adopt OpenCV narrowly for seam repair, alpha gutters, masks, channel derivation, and diagnostics;
- do not treat generic inpainting as a texture author;
- use ImageGen for semantic surface painting and authored damage motifs;
- use automatic UV unwrap/packing offline, then give ImageGen a color-coded UV guide, canonical
  turntable, material brief, and strict “do not move islands” instruction;
- post-process generated atlases with mask confinement, gutter dilation, mip-safe padding, and PBR
  channel derivation; reject any result that paints across unrelated islands;
- keep triplanar/world projection for walls, floors, cliffs, and disposable procedural mass.

`texture-synthesis` is an interesting seeded CLI for stochastic fill/tiling but is archived; pin it
only for an isolated A/B experiment. Material Maker remains attractive but must prove stable
headless macOS batch execution before joining the toolchain.

## 6. Open-source tool rulings

| candidate | license / requirement | ruling |
| --- | --- | --- |
| [Trimesh](https://github.com/mikedh/trimesh) | MIT, Python | adopt for census, normalization probes, bounds, repair diagnostics |
| [OpenCV](https://github.com/opencv/opencv) | Apache-2.0 | adopt narrowly for image/mask operations |
| [FastNoiseLite](https://github.com/Auburn/FastNoiseLite) | MIT, JS/GLSL and other ports | adopt as deterministic build-time/material noise primitive |
| [texture-synthesis](https://github.com/EmbarkStudios/texture-synthesis) | MIT/Apache-2.0; archived | pinned optional CLI experiment only; one thread for determinism |
| [Material Maker](https://github.com/RodZill4/material-maker) | MIT | defer pending macOS headless proof |
| [rembg](https://github.com/danielgatis/rembg) | MIT | sprite segmentation/negative-control research only |
| [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) | BSD-3-Clause | defer until controlled sprite-regeneration A/B |
| [TripoSR](https://github.com/VAST-AI-Research/TripoSR) | MIT; roughly 6 GB VRAM | optional NVIDIA/remote geometry draft, never unreviewed production output |
| [TRELLIS](https://github.com/microsoft/TRELLIS) | MIT; Linux/NVIDIA, about 16 GB VRAM | defer for current hardware mismatch |
| [TRELLIS.2](https://github.com/microsoft/TRELLIS.2) | MIT; Linux/NVIDIA, about 24 GB VRAM | defer; future PBR foundry candidate |
| [Hunyuan3D-2](https://github.com/Tencent-Hunyuan/Hunyuan3D-2) | community license with territory/usage terms | reject as a Genesis foundation |
| [LPIPS](https://github.com/richzhang/PerceptualSimilarity), [PIQ](https://github.com/photosynthesis-team/piq) | BSD-2 / Apache-2.0 | diagnostics only; never mockup-convergence authority |

Version pins and machine rulings live in `dev/offline-art-lab/toolchain.json`. Nothing in this
table becomes a browser/runtime dependency by implication.

## 7. Implementation waves

These waves are the **prop-foundry subtrack**, not a second global graphics roadmap.
`GRAPHICS-CONVERGENCE-PLAN.md` remains the execution spine and owns global order. Map this subtrack
onto it as follows:

| foundry wave | convergence-plan owner |
| --- | --- |
| OF-1 source manifest | may proceed offline after R0; informs R5/R8 fixtures |
| OF-2 normalization | R8 glTF pipeline |
| OF-3 parts/sockets/modulation | R5/G6 prop-foundry bakeoff, after R1 selects geometry ownership |
| OF-4 prop compiler | selected R5/G6 backend, integrated only after its bakeoff gate |
| OF-5 surfaces/UV | GP-2 and GP-4 |
| OF-6 distribution/gallery/convergence | GP-3 and GP-4 |

`dev/geometry-tools/pins.json` and `LEDGER.md` are authoritative for shared JavaScript geometry and
glTF dependencies. This lab's `toolchain.json` records the Python/image candidates exercised by
these probes; it must not repin packages owned by the geometry or graphics-research ledgers.

Within that execution spine, the foundry waves remain ordered. Parallel agents may research
separate packs, but they must not invent incompatible schemas or merge competing asset roots.

### OF-1: reproducible source cache and donor manifest

- Promote the scratch auditor into a pinned fetch command with archive hashes and retry policy.
- Create a hand-reviewed manifest selecting approximately 80-150 donors, not all 1,752.
- Prioritize: thick wall/door/window grammar; practical lights; containers; furniture chassis;
  levers/mechanisms; cliffs/rocks/bridges; simple food/table dressing.
- Record admission class and intended semantic part for every selection.
- Resolve Git LFS policy before committing binaries. Until then, archives and extracted packs stay
  outside Git and generated output remains reproducible from the manifest.

Acceptance: fresh scratch fetch reproduces hashes; license evidence is retained; no runtime change.

### OF-2: normalizer, census, and canonical donor registry

- Implement the §4 importer using Trimesh or glTF-native tooling.
- Emit canonical GLB, metadata JSON, contact/collision proxy, and four-view thumbnail.
- Add raw versus canonical topology reports so material-split exports do not false-fail.
- Reject non-finite geometry, implausible extents, accidental zero thickness, bad ground contact,
  missing required UVs, and output nondeterminism.

Acceptance: at least one wall, doorway, table, container, lever, lantern, cliff, and bridge pass;
the same source+recipe yields byte-identical metadata and visually identical captures.

### OF-3: parts, sockets, and modulation

- Map selected donors behind existing `MODEL-GRAMMAR` part names where possible.
- Add prop-specific anchors without forking the anchor philosophy.
- Implement closed operations, compatibility declarations, per-axis scale bounds, and gap logging.
- Build a contact-sheet lab showing each base, legal modifications, sockets, and failure cases.

Acceptance: automated assembly produces at least 50 distinct readable props from no more than 20
donor chassis, with zero floating parts and no out-of-footprint interaction sockets.

### OF-4: deterministic prop compiler

- Compile semantic `PropRecipe` records to canonical composites/instance graphs offline.
- Resolve noun/tag requests through curated maps first, validated DM shape hints second, generic
  chassis fallback last.
- Cache by normalized recipe hash. Cache geometry results, never narrative rolls.
- Expose `sourceCardRefs`, footprint, cover, reveal, light, and interaction metadata to staging.

Acceptance: changing only a realm changes material channels, not geometry or gameplay; reloading a
walk produces the same prop; overflow cards staged elsewhere retain their original references.

### OF-5: Genesis surface foundry

- Establish 6-10 semantic construction material families and condition layers.
- Implement world/triplanar architecture materials first.
- Run an auto-UV + ImageGen atlas proof on three identifiable props: chest, shrine, mechanism.
- Add alpha-gutter, seam, PBR-range, and atlas-bleed tests.

Acceptance: unlit albedo remains readable; roughness/normal response adds form without noise;
practicals have housings; no floating emissive spheres; realm variants remain one geometry recipe.

### OF-6: DM assembly proof and scene convergence

- Add an offline browser gallery, not an in-game modeling UI.
- Feed it persisted walk fixtures including empty rooms, overloaded rooms, centerpiece, hazard,
  active magic, hidden NPCs, secret connection, and ordinary dressing.
- Render canonical camera views and compare against approved mockups using overlays plus a fresh
  blind visual review. Metrics flag regressions but cannot pass a frame by themselves.
- Admit only assets/recipes used by passing fixtures into the browser bundle.

Acceptance: a DM semantic request compiles without manual mesh work; all rolled cards have traceable
homes; walls read as volumes; props touch the tray; hidden content remains visually concealed until
reveal; the result approaches the mockups through general rules rather than fixture exceptions.

## 8. Multi-agent execution notes for Claude

Claude should treat this document as art-foundry authority beneath the graphics convergence
charter. Before dispatching agents, designate one schema owner and one integration worktree.

Permitted parallel lanes after OF-1 locks the manifest schema:

- **architecture scout:** Fantasy Town, Castle, Building, Modular Cave;
- **prop scout:** Furniture, Food, Pirate, Survival;
- **terrain scout:** Nature and selected Brick primitives;
- **mechanism scout:** Factory and Industrial City;
- **tooling executor:** normalizer/tests only, consuming fixtures chosen by scouts;
- **visual gate:** renders contact sheets and reports failures; does not change source recipes.

Each scout returns manifest proposals and evidence, not copied production folders. The integrator
deduplicates semantic parts across packs. One `wall.low` abstraction may have several implementations;
four agents must not create four wall schemas. Merge waves in order and run the relevant harnesses
plus `python3 build/check-manifest.py` after any module edit.

Do not let research overwrite the current theater while Wave C work is in flight. The first three
waves can remain entirely offline. Runtime integration begins only after canonical artifacts and
metadata pass their gates.

## 9. Measured visual baseline

`visual_metrics.py` compares compositions without assuming pixel registration and emits saliency/
grid overlays for inspection. Current measured gaps support the existing art direction:

- Gloom current edge density is 0.01144 versus 0.03514 in the reference; entropy is 0.4761 versus
  0.5949. The scene lacks enough deliberate form/value events, not polygon count.
- The octagon debug capture is 97.22% negative-space proxy and has edge density 0.00192 versus
  0.05256. Its room is barely visually present; adding ornamental complexity before restoring
  wall volume, floor form, props, and light hierarchy would waste effort.
- The bright wall-volume capture is a debug view, not a fair beauty match. It remains useful for
  geometry acceptance but must not tune the final palette.

The implication is pleasantly strict: **simple geometry is sufficient, but invisible geometry is
not.** Spend complexity on silhouette, thickness, contact, focal hierarchy, meaningful props,
material separation, and motivated light before adding fine detail.

## 10. Decisions Claude must preserve

1. Kenney is a donor grammar, not the game's identity.
2. Full packs remain scratch inputs; production admits exact reviewed files only.
3. Prop recipes are data; deterministic compilers own geometry.
4. The DM specifies meaning and relationships, never mesh minutiae.
5. Walk cards are preserved and traceable; visual caching never becomes narrative caching.
6. Empty rooms may host overflow and secrets when walk-wide composition assigns them.
7. Practical light requires a physical source; raw floating orbs fail.
8. Wall gameplay requires thickness/occlusion proxies even if decorative faces are open meshes.
9. UV/ImageGen is for identifiable reusable props; architecture defaults to world mapping.
10. Metrics diagnose; canonical captures and blind visual review decide.
