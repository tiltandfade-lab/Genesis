---
type: design-study
status: OPEN
wave: 10
part: 1
legacy_sections: "11-11.13"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 10 — Shell, Movement, and Labels

<!-- BEGIN VERBATIM MIGRATION: original lines 15646-16919 -->

## 11. Promoted Wave 10 - Interim Visual Engine and Release Scope

Wave 10 opens after Adam's explicit Wave 2 closure. It retains its original subject id despite executing before
Wave 3. The section 6 question bank remains the provenance authority: P10.0-P10.12 are prospective questions, and
G10.1-G10.2 are additive Gemini-reference questions rather than replacements.

### 11.SWEEP Full-wave rapid sweep - shared SceneTray and graphics-engine revision

Adam asks to continue the full-wave sweep method: show the whole category with understandable recommendations so
obvious agreements can clear quickly, then go deep wherever he flags uncertainty or the consequence audit exposes
a material missing rule. Nothing in this sweep authorizes code, asset generation, renderer switching, CI, or build
specification.

#### Evidence read before recommending

This sweep was grounded in:

- the closed Wave 1/2 semantic, roster, promotion, ownership, persistence, NPC-pooling, and DM-authority laws;
- Adam's verbatim interim preservation ruling in `ART-DIRECTION-CANON.md`: retain the lovely lighting, normal maps,
  useful sprites, and environmental beauty even if the presentation becomes top-down or smaller-scale;
- `GRAPHICS-CONVERGENCE-CHARTER.md`: graphics are a provenance-preserving compiler, not a world owner; rolled cards
  survive visual omission; no-human production and accepted mockup quality remain protected;
- `STAGE-C-ART-DIRECTION-REVIEW.md`: current geometry work is useful but the existing gate bypasses the composed
  production scene; small rooms must not enlarge for staging; walls need volume; light needs visible practicals;
  nouns need truthful construction/fallback classes; pixel standees need physical citizenship;
- the twenty VQ battle-scene targets and their walk-native/implementation contracts: one contained miniature stage,
  one action cluster, sparse truthful citizens, physical standees, one dominant light story, persistent traces,
  and deterministic shot/provenance laws;
- the first `interim-visual-engine-options.png`: its range strip was confusing, its exact schematic board was clear
  but close to a full tactical-system commitment, and its hybrid storyboard remained promising;
- `GRAPHICS-PRODUCTION-RESEARCH-WAVE.md`: path tracing is an offline oracle; current Three.js r166 remains the
  baseline; UV work is build-time; atlases do not by themselves reduce draw calls; performance needs real GPU
  telemetry; Poisson distribution may move only incidental visual representatives; transparency classes must not
  be conflated;
- the nine downloaded procedural-layout papers. They do not choose a renderer. They do support semantic intent
  compiled into legal realization (Tutenel), bounded graph summaries (Horswill/Foged), mixed-initiative candidate
  comparison (Merrell), architecture/furnishing separation (Green), explicit constraint cost (Henderson), and
  honest unsatisfied results (Whitehead). Those principles filter the projection contract without being falsely
  presented as visual-style evidence.

#### North-star recommendation for the sweep

Use one **lit shallow-oblique SceneTray with hybrid storyboard/card support** as the release-default family:

```text
canonical scene identity and state
  -> typed adapter: dungeon/interior | town/social | wilderness/exploration | travel/map | battle
  -> shared tray grammar:
       substrate/ground + boundaries/containment + connections/elevation
       cast/footprints + focal/interactable objects + hazards/conditions/traces
       source-backed context cards + viewpoint/precision metadata + presentation reserve
  -> controlled lit shallow-oblique view by default
  -> exact tactical overlay only where mechanics own exact positions
  -> range/relationship and text alternatives from the same state
```

“Shared” means stable scene identity, ownership, interaction language, transition law, and visual hierarchy—not
identical geometry in a prison cell, market negotiation, forest trail, regional journey, and battle. Dungeon rooms
may use bounded walls; towns may use a street/social stage and selective facades; wilderness uses an open mat and
landmark containment; travel uses route/relationship topology; battle increases tactical precision on the already
established scene.

This recommendation preserves the lighting/material/sprite wins but reduces the expensive breadth: fewer mounted
nouns, simpler architectural realization, controlled cameras, one active local substrate, truthful symbolic cards
for facts that should not become geometry, and no requirement that every ordinary scene reach the full VQ diorama
construction depth. The current composed Three.js theater remains feature-flagged as a graphics laboratory/future
projection and a source of reusable techniques. It is not deleted.

#### Full question sweep

| ID | Plain-English question | Baseline recommendation | Concrete example | Cost/risk and deep-dive trigger |
|---|---|---|---|---|
| **P10.0** | What must every scene tray have in common, and what is allowed to differ? | Adopt **one renderer-neutral `SceneTray` contract plus typed adapters**. Common fields own scene id/version, substrate, connections/elevation, cast/footprints, focal and interactive citizens, conditions/hazards/traces, precision/viewpoint, context cards, reserve reasons, and provenance. Adapters may change containment and spatial grammar but not identity or event law. Combat reconfigures the established tray instead of minting a new map. | The same market scene begins as social positioning around a stall; when blades come out, the battle adapter exposes cover, movement, and exact occupied cells already known. The merchant, stall, lantern, door, and dropped turtle communicator remain the same ids. | **High architecture, high leverage.** Deep-dive if “shared” feels visually monotonous, travel cannot fit the contract, or combat genuinely needs a separate authoritative board. |
| **P10.1** | What should the release presentation actually look like? | Make the controlled default a **lit shallow-oblique schematic/diorama with hybrid storyboard cards**. Use simplified real surfaces, normal/material response, visible practicals, shadows, pixel standees, major props, and selective depth. Keep range/relationship as reliable fallback/accessibility view; exact cells as tactical/workbench overlay; current full 3D as laboratory/future renderer. Do not use the first range strip as default and do not commit to the full exact schematic board before combat warrants it. | The Gloom octagon shows the sunken arena and raised ring as simple lit tiered volumes with standees and one brazier; a side card carries the named aqueduct clue. It need not build every wall course, bone pile, and arch at full VQ depth. | **Medium-high prototype/taste cost; expected deep dive.** Requires same-state A/B/C captures at gameplay size. Main risk is making the “interim” view either visually dead or almost as expensive as the current theater. |
| **P10.2** | How does canonical state become visible without the renderer inventing or losing things? | Add a pure deterministic **`SceneProjection`/`SceneTray` compiler**. Every visible noun and state resolves to a canonical owner/sourceRef; every intentionally unmounted fact receives a typed narrate/reserve/fallback reason; secrets remain reveal-gated. Renderer memory owns no gameplay state. | Varka's cell, open door, depleted lamp-oil cask, slippery threshold, and old scorch trace project from their owners. Missing goblin art yields a truthful goblin standee/fallback or prose card—not a random cabinet and not deletion. | **High data-integration cost.** Deep-dive if a mode requires visual facts with no owner, or projection metadata threatens DM/player context bloat. T10/G19/W20 strongly support this seam. |
| **G10.1** | How do moving and changing canonical things remain truthful in every representation? | Require a **dynamic-citizen projection guarantee** for current cast location, active props, conditions, damage, routes, moving vehicles/platforms, and realm transitions. Every adapter proves mount/update/unmount/rebuild behavior from the same event receipts; no mode may silently approximate an exact fact as a different fact. | A mace embedded in a vehicle remains attached while the vehicle moves; a passenger's zone/cell moves with it; fuel damage and a later realm crossing retain their ids and states in travel, chase, battle, and aftermath views. | **Medium-high QA/integration cost.** Deep-dive on moving reference frames, split parties, nested vehicles, and cross-realm transitions. |
| **P10.3** | Which positions are exact, approximate, relational, hidden, or unknown—and how can players tell? | Give every projected location/dimension a precision class such as `EXACT_CELL`, `EXACT_ZONE`, `RELATIONAL`, `ESTIMATED`, `HIDDEN`, or `UNKNOWN`. Only exact facts may support ruler-like distances. Use snapped bases/grid reveal for exact state, bounded region mats/halos for zones, connection lines/range bands for relations, softened/fogged boundaries for estimates, and no representation for unearned hidden facts. | In a tavern argument, two NPCs may be “at the bar” without exact five-foot cells. Once combat starts and placement is mechanically established, their bases snap into legal positions. A rumored tunnel never appears as a faint door merely because the renderer needs symmetry. | **Medium design/UX cost, high honesty value; likely deep dive.** Risk: uncertainty marks become clutter or players misread pretty spacing as tactical permission. H12/H19 favor the bounded vocabulary. |
| **P10.4** | How should the camera frame scenes without revealing secrets or rewriting space? | Use a deterministic bounded **`ViewPlan`** with a few legal shallow-oblique candidates plus top-down/relationship fallback. Default camera frames the active subject cluster and one stage edge; player may cycle/zoom among viewpoint-safe views. Occluding upper geometry fades/cuts away only as presentation state, while physical stems, doors, mounts, collision, and hidden knowledge remain canonical. | A wall-mounted lever causes the camera to choose a view where its known owning wall is readable. If the near wall blocks the party, its upper section fades while the capped wall stem and door remain. The camera never rotates through an undiscovered room. | **Medium-high camera/occlusion cost.** Deep-dive on free orbit versus controlled shots, split-party views, huge creatures, vertical shafts, and player preference. M11 supports bounded candidate comparison, not the aesthetic choice. |
| **P10.5** | What visual quality must survive the simplification? | Preserve the existing **lighting/material beauty stack**: normal and roughness response, motivated visible practicals, cast/contact shadows, realm palettes/grade, selective emissive bloom, atmosphere/weather, sprite readability, and dark stage framing. Reduce geometry complexity, scene breadth, mounted noun count, camera freedom, and spatial exactness where lawful—never beauty by default. Lock a gameplay-scale beauty floor against fixed references, not feature checklists. | The town market can use one facade fragment, stall assembly, lantern, lit street mat, and six standees rather than a modeled block; it still needs believable cloth/wood/stone response, grounded figures, warm lantern light, and controlled darkness. | **Medium-high art/renderer tuning cost; likely deep dive.** Main risk is paying nearly full-diorama cost or accepting an unlit board because it is fast. The path-traced oracle remains diagnostic only. |
| **P10.6** | How do creatures and props look physical, correctly scaled, and truthful when art coverage varies? | Keep the **pixel corpus as canonical live creature/NPC art**, mounted as physically grounded standees with registry scale, foot anchors, compact bases, contact/cast shadows, controlled light response, and licensed emote/warp/DM-hand motion. Route props through semantic construction classes (`EXTRUDE`, `FACED_BOX`, `LATHE`, `SWEEP`, `MODEL_RECIPE`, `DECAL`, `FX`); fallbacks preserve noun, footprint, orientation, state, and cover rather than substituting unrelated furniture. Crowds may use representative standees plus explicit group count/area only when identities are not consequential. | A Huge ogre and Small goblin retain true relative scale even when the camera zooms out. A rubble wall without hero art becomes a masonry-volume assembly that still blocks movement/cover; it never becomes a table. | **High metadata/asset-pipeline cost.** Deep-dive on small-screen sprite sizes, group abstraction, enormous creatures, edge-on views, art-generation scope, and which prop classes justify 3D. |
| **P10.7** | How should known interactables, evidence, damage, ownership, and affordances call attention to themselves? | Use a restrained **attention-state ladder**: ambient -> noticed/known -> relevant/available -> active/targeted -> changed/historical. Prefer source-backed animation, light/material response, sound cue, base/card treatment, and physical state change; reserve explicit outlines/icons for selection, accessibility, or urgency. Promotion may strengthen a tell, but cannot create an affordance. Unknown secrets receive only the evidence/tell their reveal rules license. | The punctured oil cask darkens and gains a glistening spill; targeting it adds a brief base/edge cue and action text. A secret panel remains ordinary wall until scratches, a draft, a map, or discovery makes suspicion canonical. | **Medium-high UI/content cost; likely deep dive with G10.2.** Risk: “everything glows,” secret leakage, or mechanics depending on bespoke art. |
| **G10.2** | How do promoted affordances and accumulated history stay legible without outlining every object? | Let **durable physical consequences do most of the remembering**: open/broken silhouettes, stains, scorch, debris, missing pieces, ownership marks, dropped items, corpse/remains states, and contextual cards on inspection. Use a small current-affordance focus layer, not permanent universal highlighting. Every tell carries viewpoint/reveal scope and a deterministic fallback. | The returned room shows the broken lever, open gate, blood trail, looted chest, and Varka's scratched message. Only the object currently inspected receives a high-contrast UI cue; the rest read through their state. | **Medium visual-language/QA cost.** Deep-dive on colorblind-safe cues, stacked histories, cleanup/decay, and how much history can remain mounted before the tray becomes noisy. |
| **P10.8** | How should actions and state changes animate while remaining faithful to event order? | Drive one **receipt-to-visual-cue queue** from canonical events: placement/reveal, DM-hand movement, attack/reaction, hurt/death, condition, object state, terrain/topology change, transfer, and transition. The event commits first; animation may interpolate, pause, skip, reduce, or rebuild from terminal state but never change outcome or reorder dependencies. Make interruption, revisit, save/load, and reduced-motion behavior explicit. | A door unlocks, opens, the fighter crosses, and the door is shattered by a reaction in that receipt order. Skipping animations lands on the same open/broken door, positions, spent reaction, and debris trace. | **High motion/state-machine cost.** Deep-dive on simultaneous crisis events, animation queues during fast play, interruptibility, and whether some verbs need staged emphasis. |
| **P10.9** | How do map, town, exploration, dungeon, battle, split-party, and aftermath views feel like one continuous world? | Preserve one **scene lineage and transition contract** across adapters. Mode changes retain ids, known connections, participants, carried/dropped objects, damage, traces, viewpoint, and a short visual memory of origin/destination. “Same tray” may morph, reframe, or crossfade between substrates; it need not pretend a regional map and jail cell share geometry. Combat only adds precision already owned or established by a placement transition. | A travel route focuses into a forest encounter mat; wolves already tracked on the route become the same standees; afterward their retreat direction and the party's dropped pack remain on the route/arrival record. A market parley becomes a fight and then returns to the damaged market, not a reset town card. | **High cross-mode architecture/UX cost; expected deep dive.** Risk: spectacular transitions consume production budget or adapters become unrelated visualizers joined only by a fade. |
| **P10.10** | What performance, device, input, and accessibility promises define release? | Establish measured **semantic-invariant quality tiers**. Initial targets remain 60 fps preferred/30 fps hard floor on the named reference machine, 1-2 shadow lights, bounded active citizens, and scene assembly hidden under a short controlled transition; exact budgets come from telemetry, not guesses. Lower tiers may reduce shadows, post, particles, representative multiplicity, surface resolution, and camera candidates—never cast identity, hazards, connections, state, or player knowledge. Ship keyboard/mouse and touch/controller-compatible focus, text equivalents, scalable UI, color+shape cues, reduced motion, screen-reader/live-region narration, and range/relationship/top-down alternatives. | A low-power device shows the same actors, burning doorway, reachable exit, and objective with one light, fewer crowd representatives, reduced particles, and no DoF. It does not remove the hazard or merge two NPCs because of GPU budget. | **High measurement/accessibility cost.** Deep-dive on supported devices, minimum resolution, latency, memory, input target, and whether 30 fps is acceptable outside combat. |
| **P10.11** | How do reusable assets, generated exact art, caches, fallbacks, and the old renderer stay safe and reversible? | Use **semantic slot contracts and versioned visual bindings** over approved libraries, procedural recipes, and cached governed generation. Generated images never establish geometry/state; folds validate scale, alpha, sockets, material channels, licenses, hashes, and fallbacks. No runtime network dependency. Feature flags preserve the current full 3D theater and candidate tray variants until capture gates choose; rollback changes visual bindings, not world truth. | The DM invents turtle communicators. The engine immediately uses a deterministic linked-item icon/standee fallback selected from legal tags; a later exact generated image may replace the visual binding while the two item ids, mechanics, custody, damage, and callbacks remain unchanged. | **High toolchain/storage/QA cost.** Deep-dive on exact-generation timing, cache ownership, player-local versus shipped art, licenses, version migrations, and when the old theater may cease being a supported release view. |
| **P10.12** | What evidence decides the release tray rather than taste or convenience alone? | Reuse the Wave 2 twelve golden sites/eight transitions and the twenty VQ frames to build a **same-state representation bakeoff**. Require dungeon, town/social, wilderness/exploration, travel/map, battle, secret reveal, CrisisChain, split party, tiny/huge scale, moving vehicle, destruction, persistent aftermath, missing-asset fallback, low-tier device, and accessibility cases. Compare candidate trays on deterministic projection/provenance, gameplay comprehension, beauty at gameplay size, transition continuity, performance/memory, accessibility, generation effort, and human preference. | One canonical market trace is captured as arrival, parley, fight, fire crisis, and aftermath in each candidate representation. The raw scene hash stays fixed; only the visual adapter/view changes. | **Medium-high QA/capture cost; likely deep dive.** Exact numeric gates may refine with prototypes, but the corpus and pass dimensions must lock before implementation selection. |

#### Recommended batch disposition

The strongest current recommendation is:

```text
ACCEPT BASELINE: P10.0, P10.2, G10.1, P10.3-P10.12, G10.2
DEEP DIVE FIRST: P10.1 target representation portfolio
```

That response is not presumed. Adam may accept any obvious baselines, flag several deep dives, or amend the north
star. Even if every row is accepted, the follow-up audit must still test whether the lit shallow-oblique hybrid is
actually cheaper than the current theater, whether “same tray” survives travel and social play, whether precision
changes feel honest in combat, and whether the beauty floor can be measured without making the VQ frames an
unaffordable universal requirement.

#### Fable status at Wave 10 opening

The closed Waves 1-2 document remains safe for a read-only Fable review. This sweep does **not** yet trigger the
first design-to-spec gate: the representation portfolio, shared adapter contract, cross-mode continuity, and
acceptance corpus have recommendations but no Adam rulings. Codex must notify Adam when Wave 10 survives its full
follow-up/contradiction audit and closes.

### 11.1 First batch disposition - PreAlpha BattleMat and derived EngagementLens

**Adam's ruling (2026-07-20):** P10.0 is accepted. P10.8, P10.10, and P10.11 are accepted. P10.12's proposed
same-state acceptance corpus is accepted as a baseline and remains open for its requested deep dive. G10.1 is
accepted pending the concrete example below. G10.2 is accepted as a baseline and remains open for discussion.
P10.9 is accepted as a baseline and remains open for its requested deep dive. P10.1, P10.3-P10.7, and the material
parts of P10.2 remain in active deep dive. Silence closes nothing.

Adam amends the interim visual target substantially. The release-direction candidate is no longer merely a vague
“lit shallow-oblique schematic.” Its first concrete form is a **PreAlpha BattleMat**:

- the central tactical scene is an attractive nearly top-down 3D square grid;
- raised and depressed square cells carry elevation;
- rectangular blocks carry wall runs, hard boundaries, and cover volumes;
- cylinders carry columns and other round structural blockers;
- the engine spends its visual budget first on tile form, material response, lovely lighting, normal maps,
  practicals, contact/cast shadows, sprite citizenship, and overall composition—not exhaustive integrated props;
- creatures and NPCs remain canonical pixel sprites grounded on the board;
- a mechanically important object's footprint, blocking, cover, hazard, or traversal geometry must remain honest,
  but an ordinary location-bearing noun without a suitable integrated model may appear as a small semantic marker;
- hovering, focusing, or selecting that marker may reveal the noun's large canonical sprite/card, current state,
  ownership, evidence, and licensed interactions without pretending that the sprite is full 3D geometry;
- unknown or unrevealed nouns receive no marker merely to decorate or balance the board.

This creates four initial visual construction levels without changing canonical identity:

```text
structural/tactical volume  -> tile, block, cylinder, opening, pit, hazard footprint
live actor citizen          -> grounded canonical pixel sprite with scale/footprint
semantic object marker      -> exact or bounded location + hover/focus sprite/card
context/reserve projection  -> relational card, narration, or explicit unmounted reason
```

The exact routing law between those levels is not yet closed; it is the central P10.6/P10.7 follow-up. A marker may
never hide a tactically relevant footprint. A chest that is only searchable may be a marker; a portcullis that
blocks passage needs honest boundary geometry; a toppled wardrobe used as full cover needs a cover volume even if
its visual identity still comes from a sprite/card.

#### Derived side-view EngagementLens - plausible, but never a second combat owner

Adam also proposes a classic side-view engagement tableau: the selected PC appears on the right, materially
engaged enemies appear on the left at melee/near-or-ranged/far relationships, and simple plinths or recessed bands
show elevation. Cycling the selected PC may recompose the tableau.

This is technically and architecturally plausible if it is a **derived `EngagementLens`**, never an independent
map or second action-resolution system:

```text
canonical battle state + selected actor
  -> exact BattleMat projection owns cells, reach, paths, cover, line of sight, areas, and collisions
  -> EngagementLens derives relevant cast, qualitative relationship bands, elevation class, and current states
  -> choosing a different PC recomputes the lens from the same battle receipts
```

The lens may dramatize and clarify one actor's immediate problem. It may not independently decide movement,
flanking, reach, cover, line of sight, area of effect, or exact distance. That prevents the two views from becoming
contradictory games. It also solves the weakness of the first global range-strip mockup: the strip becomes
contextual—“who matters to this PC now?”—rather than trying to flatten the whole battlefield at once.

**Implementation/maintenance cost:** the PreAlpha BattleMat is still a real renderer project. It needs a legal
height/footprint compiler, structural primitive recipes, controlled camera, materials/lights/shadows, sprite scale
and anchoring, marker focus/inspection, state cues, responsive layout, and exact fallback rules. It is materially
cheaper than demanding bespoke 3D construction for every noun, but not a cheap unlit diagram. The optional
EngagementLens adds a moderate responsive-UI and projection cost: selected-actor relevance, crowd collapse,
qualitative range bands, elevation plinths, multi-PC cycling, transitions, and strict same-id/same-state tests. Its
largest maintenance risk is visual divergence from the board, so it must consume the same projected citizens and
receipts rather than maintaining a parallel cast list.

#### G10.1 concrete example - the moving lift and the turtle communicator

Suppose a goblin carrying one of the DM-invented turtle communicators jumps onto a descending freight lift:

1. On the BattleMat, the goblin's exact cell is stored relative to the lift's moving reference frame, not faked as
   a permanently fixed floor cell. The communicator remains the same item id attached to the goblin's custody.
2. When combat selects the fighter, the EngagementLens shows that goblin in the appropriate relationship band and
   on a lower or descending plinth. It does not invent a new goblin or a duplicate communicator.
3. The fighter knocks the communicator loose. The engine commits the transfer/drop receipt first; the board then
   moves the same item id from the goblin to an object marker on the lift cell, and its inspector uses the same
   canonical sprite/card and damaged/working state.
4. The lift crashes to the pit floor. Rebuilding either view places the goblin, lift, and dropped communicator from
   their current owners and attachment/location facts. Returning later shows the communicator at the crash site or
   in whoever subsequently took custody—not back at its first room and not silently erased.

In plain English: every view asks the world state **where this exact thing is now and what happened to it**. Views
may simplify how that answer looks, but they may not keep their own competing answer.

#### Procedural-research filter on the amendment

The downloaded papers support the seams, not the taste verdict:

- Tutenel supports compiling semantic intent into a legal realization rather than letting geometry create canon.
- Green's architecture/furnishing separation supports spending exact geometry on board structure while routing
  nonstructural nouns through marker/card/fallback representations.
- Horswill and Foged support bounded graph/relationship summaries, which is the right role for EngagementLens.
- Merrell supports comparing bounded candidate representations rather than committing from one attractive frame.
- Henderson and Whitehead support explicit constraint cost and honest unsatisfied/fallback states; a missing prop
  model must not produce a false substitute or erase the noun.

None of those papers proves that a nearly top-down board or side-view lens is beautiful. That decision still needs
same-state taste cards, gameplay-scale captures, and the P10.12 comprehension/beauty/performance bakeoff.

#### First taste-card family - discussion evidence, not a renderer selection

Four preview cards were generated from the same proposed visual grammar and saved as durable design references:

| Card | Question it tests | Initial read |
|---|---|---|
| [A - PreAlpha BattleMat](../ui-sketches/mock-frames/procedural-dungeon/taste-card-a-prealpha-battlemat.png) | Can elevation, walls, cover, columns, actors, and markers make a beautiful central scene without integrated props? | **Yes.** Strongest minimum viable renderer statement. |
| [B - Object Inspector](../ui-sketches/mock-frames/procedural-dungeon/taste-card-b-object-inspector.png) | Can a small exact marker hand off identity/state/interaction to a large sprite/card cleanly? | **Yes, provisionally.** Strong P10.2/P10.6 candidate; the interaction rows are illustrative, not rules. |
| [C - Board + EngagementLens](../ui-sketches/mock-frames/procedural-dungeon/taste-card-c-board-engagement-lens.png) | Can the board stay authoritative while one PC receives a readable side-view relationship tableau? | **Recommended combined default candidate.** It keeps board truth primary and makes the lens contextual. |
| [D - Expanded Engagement Focus](../ui-sketches/mock-frames/procedural-dungeon/taste-card-d-expanded-engagement-focus.png) | Should the side view temporarily dominate during the selected turn? | **Plausible optional focus mode, not recommended always-on.** It adds drama but gives up board context. |

These cards are taste/architecture probes. They do not authorize their invented room layout, combatants, labels,
action difficulties, UI proportions, or exact art. Card C is Codex's recommendation for the next iteration: board
as the stable widescreen field, lens as a collapsible horizontal band, and Card B's inspector appearing only when a
marker/object is focused.

#### Generated follow-ups opened by the first batch

- **F10.1 - default composition:** Is Card C the correct default family—BattleMat always primary, object inspector
  contextual, EngagementLens collapsible—or should A/B remain default and the lens appear only on demand?
- **F10.2 - exact-grid scope:** Which noncombat scenes deserve the exact 3D grid, and which should use a looser
  zone/relationship substrate while preserving the same SceneTray identity?
- **F10.3 - volume/marker/card routing:** Which mechanical properties force honest 3D volume, which permit a
  marker plus sprite inspector, and which belong only in cards/reserve?
- **F10.4 - lens population:** For several PCs, summons, swarms, and many enemies, who appears in the selected
  actor's lens, how are groups collapsed, and when must the lens decline to simplify?
- **F10.5 - honest precision language:** What exact visual grammar distinguishes exact cells, zones, relations,
  estimates, unknowns, and hidden facts without turning the tray into a statistical dashboard?
- **F10.6 - camera and beauty floor:** Which nearly top-down angle, zoom bounds, light/material stack, and gameplay-
  size reference cards define the acceptable compromise?
- **F10.7 - attention and history:** Which marker, physical trace, card, animation, sound, and accessibility cues
  distinguish current affordance from durable history without “everything glows” clutter?
- **F10.8 - continuity and proof:** Which cross-mode transitions and same-state captures prove that adapters and
  EngagementLens preserve identity, state, knowledge, and performance rather than merely sharing a skin?

Wave 10 remains **OPEN**. Resume at **F10.1**, then follow every material branch through P10.3-P10.7, G10.2,
P10.9, and P10.12. Do not declare Wave 10 complete, begin Wave 3, or invoke the Fable design-to-spec gate until all
P10.0-P10.12, G10.1-G10.2, and generated follow-ups are exhausted and Adam explicitly closes the wave.

### 11.2 Full-shell correction - chat right, icon rail left, compact information drawers

**Adam's ruling (2026-07-20):** isolated renderer cards are insufficient. Wave 10 must evaluate every candidate
inside Genesis's real in-session shell. The game favors Disco Elysium's persistent, highly legible conversation
over the BG1/BG2 model: chat belongs on the right in a translucent container; character-information icons belong
on the left; opening character information must not replace the whole screen; and the primary design target is a
desktop or horizontal-tablet aspect ratio.

This changes the shell direction that Wave 10 must eventually hand to a build spec:

```text
default wide shell
  left:   narrow character/action/map/journal/menu icon rail
  center: SceneTray / PreAlpha BattleMat as the visual hero
  right:  persistent DM conversation + pinned composer

character-reference state
  left:   icon rail + compact Character drawer
  center: reframed SceneTray; EngagementLens collapses if necessary
  right:  unchanged readable conversation
```

The older built `IN-SESSION-UI.md` three-zone orientation—persistent status sidebar, narration as center hero,
slide-in information panel on the right—remains an honest record of the current implementation. It is **not the
future Wave 10 target**. No code changes are authorized while this design wave remains open.

#### Chest correction - cheap geometry before symbolic fallback

Adam correctly identifies the ordinary chest as a poor marker-only example. It belongs in the inexpensive
`FACED_BOX` construction class:

- a rectangular body and simple lid own footprint, scale, collision, cover if applicable, world light, and shadow;
- sprite-derived face textures supply identity on the visible front, side, and top/lid surfaces;
- stateful geometry may rotate the lid for open, separate it for broken, and apply a looted/damaged binding without
  minting a new object;
- the prototype may derive the side/top treatment from one sprite, but an eventual tiny face atlas avoids stamping
  a front latch or perspective cue identically onto every face.

This does not abolish semantic markers. It sharpens F10.3's routing law: **if a noun has an honest cheap primitive
recipe, use it.** Reserve markers for objects whose shape, state, or scale cannot be represented cheaply without
lying, and reserve cards/narration for nonlocal or relational facts. A chest is cheap; a coiled astrolabe made of
moving rings may begin as a marker plus sprite inspector; a portcullis needs blocking geometry regardless of art.

#### Wide-shell candidate proportions and behavior

The first candidate proportions are taste targets, not final numeric gates:

| State | Rail | Character drawer | Central scene | Right chat |
|---|---:|---:|---:|---:|
| Default | about 5% | closed | about 64-66% | about 29-31% |
| Character open | about 5% | about 20-22% | about 43-45% | about 29-31% |

The right surface interprets “15% transparency” as approximately **85% opaque / 15% translucent**, not 15%
opaque. A smoked near-black vellum fill plus a local text scrim lets scene light breathe through without placing
variable map contrast directly behind letters. Large comfortable narration, relaxed line height, short measure,
internal feed scrolling, and a pinned composer are non-negotiable. Avoid expensive glossy backdrop blur unless a
measured prototype proves it necessary; opacity and a subtle gradient are cheaper and more predictable.

The board camera owns a **safe presentation rectangle** for every shell state. Opening chat or a drawer must refit
or reframe the projected scene so no usable tactical cell, selected citizen, known exit, or current hazard sits
under UI. Large maps may zoom or pan within that safe rectangle, but transparency is never permission to make the
player play through text.

The left rail provides compact character identity/status plus Character, Actions, Map, Journal, and Menu access.
The open Character drawer is a field dossier rather than a replacement screen: concise identity, HP/AC/conditions,
compact abilities and key resources, plus Sheet/Inventory/History tabs with internal scrolling. Full detail can
remain available inside those tabs, but the drawer does not try to show every proficiency, possession, spell, and
history paragraph simultaneously.

On constrained landscape widths, only one secondary information surface should expand at once. Opening Character
collapses EngagementLens to a slim reopenable handle before shrinking the map or chat below readability. Closing
the drawer restores the previous lens state. Exact minimum resolutions, pixel widths, and tablet breakpoints remain
P10.10/P10.12 measurements rather than guessed law.

#### Full-shell taste cards - still discussion evidence

| Card | State tested | Initial read |
|---|---|---|
| [E - Full shell, chat right](../ui-sketches/mock-frames/procedural-dungeon/taste-card-e-full-shell-chat-right.png) | Left icon rail + authoritative board + expanded EngagementLens + persistent translucent right chat; textured-box chest on the map. | **Recommended default-shell candidate.** The game reads as conversation with a living tactical scene rather than an isolated map or dashboard. |
| [F - Compact Character drawer](../ui-sketches/mock-frames/procedural-dungeon/taste-card-f-compact-character-drawer.png) | Character selected; compact dossier opens left of the reframed board; chat persists; EngagementLens collapses. | **Recommended information-state candidate.** It preserves play context, though exact drawer density and duplicate portrait treatment need refinement. |

The cards' invented fighter, statistics, prose layout, icon art, combatants, and dungeon remain noncanonical. The
chest demonstrates a representation class, not final chest art. Card F deliberately exposes a likely refinement:
the rail portrait and drawer portrait need not both remain prominent.

#### Implementation and maintenance cost

- **Chest `FACED_BOX`: low per-class runtime cost, medium content-contract cost.** One reusable geometry recipe is
  cheap; consistent dimensions, pivots, face mappings, state bindings, anchors, and fallback validation require a
  governed asset contract.
- **Persistent right chat: medium layout/accessibility cost.** It needs stable text measure, contrast testing over
  every realm/light state, internal scrolling, streaming stability, focus order, and a pinned input across resizes.
- **Safe-rectangle board reflow: medium-high renderer/UI integration cost.** Every rail/drawer/lens state changes
  the legal camera rectangle and must preserve selection, viewpoint safety, and readable cell scale.
- **Compact drawers: medium responsive-content cost.** Character, Actions, Map, and object inspection need
  progressive disclosure, internal scrolling, controller/touch focus, and mutual-exclusion rules without losing
  handlers or canonical state.
- **Maintenance risk:** independently hard-coded percentages will drift. One shell layout state should publish the
  current safe rectangle to the renderer and use shared minimum-width/priority laws; the renderer must not infer
  layout by reading arbitrary DOM dimensions as game state.

The downloaded procedural-layout papers do not decide whether chat belongs on the right or how transparent it
should be. They do reinforce the semantic/construction split behind the chest correction and the requirement that
presentation compile canonical state without deleting or falsifying it. The shell proportions remain a taste,
legibility, device, and gameplay-capture decision for P10.12.

#### Follow-ups refined by the shell correction

- **F10.1a - full-shell baseline:** Are Cards E/F the correct family—left rail, central scene, persistent right
  chat, compact left drawers, and automatic EngagementLens collapse while a drawer is open?
- **F10.1b - persistent lens behavior:** With no drawer open, is EngagementLens normally expanded in combat as in
  Card E, or normally collapsed and opened only when the player wants the selected-actor tableau?
- **F10.3a - cheap primitive threshold:** Accept the rule “use honest cheap geometry before a marker,” then define
  the first primitive classes after chest/body/lid, wall/block, column/cylinder, door/plane, and hazard/decal.
- **F10.3b - object-inspector home:** Because chat now owns the right column, should marker/object inspection use
  a small board-anchored card, a compact left drawer, or a temporary structured segment inside the chat flow?
- **F10.6a - wide-device proof:** Capture default, drawer-open, large-map, split-party, and enlarged-text states at
  the chosen desktop and minimum horizontal-tablet viewports before locking ratios or breakpoints.

Wave 10 remains **OPEN at F10.1a**. These shell cards refine rather than close P10.1/P10.4-P10.6/P10.10/P10.12.

### 11.3 Corrected hybrid-renderer suite - high-resolution 3D substrate, pixel-art layer

**Adam's correction (2026-07-20):** Cards E/F drifted toward rendering the entire product as pixel art. Genesis's
visual system is instead 3D with a pixel-art layer. The scene substrate should retain real volume, smooth
high-resolution edges, lights, cast shadows, contact/drop shadows, and material response. Adam also corrected the
record: normal maps were never implemented. They may be simulated in these taste cards so the intended material
future can be judged, but they cannot be counted as a preserved built win. The earlier QA captures also run below
the intended product resolution and are references rather than a resolution target.

The corrected visual boundary is:

```text
high-resolution 3D substrate
  volumetric floor/wall/step cells, pits, blocks, cylinders, faced boxes
  smooth rasterized geometry rather than a globally pixelated framebuffer
  motivated practical lights and real cast shadows
  restrained simulated normal response in taste cards only - NOT built
  floating-stage darkness, selective atmosphere, strong readable silhouettes

canonical pixel-art layer
  actor sprites and available object/face/texture art
  crisp texels rather than smeared bilinear filtering
  thin physical shell or plinth when the sprite must exist in 3D
  alpha-respecting cast shadow plus separate compact contact/drop shadow

game shell
  narrow left icon rail
  central UI-safe SceneTray / PreAlpha BattleMat
  persistent readable right conversation and composer
  compact temporary drawers/lenses/inspectors, never unrelated full screens
```

This is a register boundary, not an instruction to make the 3D substrate look sterile. The simulated surface
relief, bevel response, grime, practical-light falloff, and shadowing are there to make simple grid primitives feel
like a beautiful dungeon. Nor does “high resolution” mean that sprite pixels should be cosmetically smoothed; the
world and UI can be cleanly sampled while the canonical sprite register stays intentionally crisp.

#### Actual Genesis evidence used

The cards were generated with real Genesis captures and assets as image references where the generation limit
allowed, including the golden full engine capture, BattleGate stage/composition frames, elevation and diegetic-light
captures, the canonical human-fighter/goblin/skeleton sprites, fantasy floor/wall textures, chest sprites, and chest/
crate face textures. The principal source paths are:

- `dev/graphics-regression/captures/golden/full.png`, `dev/battle-gate/round3/stage-1440.png`,
  `dev/elev1-profile-shots/elev1-dais.png`, and `dev/diegetic-light-shots/l4-torchlit-gloom.png`;
- `assets/sprites-r4b/spr-pc-human-fighter-male.png`, `spr-fantasy-goblin-warrior.png`, and
  `spr-fantasy-skeleton-archer.png`;
- `assets/dressing/fantasy-obj-chest-closed.png` and `fantasy-obj-chest-open.png`;
- `assets/textures/fantasy-floor-1.png`, `fantasy-wall-1.png`, and the fantasy crate face textures.

Image generation does not perform a deterministic engine composite. These are therefore **asset-informed concept
renders**, useful for composition and register judgments but not proof that exact sprites, UVs, normal maps, shadow
passes, text rendering, or safe-rectangle behavior already run in Genesis.

#### Full integrated-UI suite

| Card | State tested | Initial read and recommendation |
|---|---|---|
| [G - Hybrid stage-first baseline](../ui-sketches/mock-frames/procedural-dungeon/taste-card-g-hybrid-stage-first.png) | Default left rail / high-resolution 3D BattleMat / right chat; lens collapsed. | **Recommended visual-substrate and default-shell baseline.** The map remains the visual hero, while the pixel citizens clearly belong to a lit physical stage. |
| [H - Expanded EngagementLens](../ui-sketches/mock-frames/procedural-dungeon/taste-card-h-hybrid-expanded-engagement-lens.png) | Same substrate and shell; selected-PC side-view lens occupies roughly the lower quarter of the central scene. | Strong combat drama and sprite legibility, but it spends meaningful board height. **Recommend contextual/on-demand expansion, not permanent default.** |
| [I - Compact Character drawer](../ui-sketches/mock-frames/procedural-dungeon/taste-card-i-hybrid-character-drawer.png) | Character dossier opens between rail and reframed map; lens remains collapsed; chat persists. | Validates the shell law and exposes the real cost in central width. **Recommend as the character-reference state**, with compact fields and internal tabs rather than a full replacement screen. |
| [J - Board-anchored object inspector](../ui-sketches/mock-frames/procedural-dungeon/taste-card-j-hybrid-board-object-inspector.png) | A small structured card points directly to the selected 3D chest. | Spatially immediate, but can occlude map evidence and requires collision-aware placement. **Recommend only as a tiny preview or for sparse boards**, not the only full inspector. |
| [K - Chat-embedded object inspector](../ui-sketches/mock-frames/procedural-dungeon/taste-card-k-hybrid-chat-object-inspector.png) | Chest focus becomes a structured segment in the right conversation surface; board remains unobstructed. | **Recommended primary object-inspection home.** It treats inspection as conversation with the world and preserves every tactical cell; cost is temporary transcript height. |
| [L - Large battlefield mode](../ui-sketches/mock-frames/procedural-dungeon/taste-card-l-hybrid-large-battlefield.png) | Icon-first rail, slightly narrower chat, no lens, and a much larger multilevel field. | Confirms the shell can favor spatial scale without a dashboard. **Recommend a layout/camera state of the same SceneTray**, not another renderer. Chat and type minima must remain fixed while the stage absorbs the variation. |

Cards G-L use generated example prose, stats, dungeon dressing, geometry, and iconography. None of those invented
nouns or exact ratios are canon. The reusable icons visible inside the mockups are not delivered sprite assets;
any icons promoted into production must still receive the separate `#FF00FF` sprite-sheet treatment required by
`ART-DIRECTION-CANON.md`.

#### Implementation and maintenance consequences

- **Mixed-resolution compositing: medium-high.** The renderer must keep 3D edges, light, and UI typography clean
  while sampling canonical sprite texels crisply. Camera zoom and device scaling cannot accidentally blur sprites
  or make them crawl against the smooth stage.
- **Real cast shadow + compact contact shadow: medium.** They solve different jobs and need separate dials. Sprite
  alpha must shape the cast shadow; the contact mark must stay short and dark enough to ground the standee without
  becoming a second fake sun.
- **Future normal-map lane: medium engineering/QA, low-to-medium runtime if the spike succeeds.** The existing
  `MATERIAL-IDENTITY.md` proposal still needs its material-compatibility spike, derived-map pipeline, bindings,
  budget, realm tuning, A/B flag, performance measurement, and real captures. Taste-card relief cannot skip them.
- **Higher-resolution release target: medium-high fill-rate and capture-corpus cost.** Shadow-map resolution,
  transparent sprite edges, post effects, text, and large-board legibility all need proof at native desktop and
  horizontal-tablet targets, not inference from historical low-resolution tests.
- **Asset fidelity: medium production-contract cost.** Existing assets buy continuity, but every primitive class
  still needs deterministic scale, anchoring, face mapping, filtering, state, and fallback rules. Generated mockups
  are not a substitute for an actual-asset engine bakeoff.

#### Refined open follow-ups

- **F10.1c - hybrid visual substrate:** Is Card G the correct renderer boundary and default-shell family: smooth
  high-resolution 3D substrate, crisp mounted pixel-art citizens, persistent right chat, and a normally collapsed
  EngagementLens?
- **F10.1b - lens behavior, now shown directly:** Should the lens remain contextual/on demand as recommended, or
  should Card H's expanded state become the normal combat composition despite consuming about a quarter of the
  board height?
- **F10.3b - object-inspector home, now shown directly:** Should Card K's chat-embedded full inspector be primary,
  with Card J reduced to a small spatial preview, or does direct board anchoring deserve the full interaction set?
- **F10.6b - resolution proof:** Which native desktop and minimum horizontal-tablet sizes join P10.12's capture
  corpus? Candidate proof sizes must include at least a high-resolution desktop frame and one minimum landscape
  tablet frame; the final values remain unruled.
- **F10.6c - material and shadow truth:** Later engine proof must show flat-versus-normal-mapped A/B captures and
  separately controllable cast/contact shadows using the same scene, rather than treating these concepts as built.

Wave 10 remains **OPEN at F10.1c**. Cards G-L supersede E/F only as renderer-register evidence; E/F remain useful
historical evidence for the shell correction. No implementation, renderer selection, or Fable design-to-spec gate
is authorized by these cards.

### 11.4 F10.1c ruling - working visual goal accepted; map-generator lineage confirmed

**Adam's ruling (2026-07-20):** Cards G-L are good enough to establish the working visual goal. Their shared
high-resolution hybrid target is now accepted as the convergence family for continued Wave 10 discussion. This is
not yet final UI, interaction, performance, or acceptance-corpus approval, and it does not authorize a build.

#### Yes - the map-generating rebuild is part of this questionnaire

The procedural-redesign questionnaire began because Genesis had already built a surprisingly capable low-level
roll-to-room pipeline, while its higher-level room/site rolls and expensive renderer did not yet compose that power
into consistently coherent, legible places. The thread did not abandon the map generator. It moved upstream long
enough to decide what the generator must mean and downstream long enough to decide what its release projection must
show before more tables, rolls, and renderer branches harden around the wrong contract.

The existing built path is substantial:

```text
rollDungeonWalk()
  graph topology + per-segment rolls/provenance
    -> spatializePlan()
       graph -> deterministic walkable SpatialPlan cells/rooms/doors
    -> semanticizePlan()
       roles, depth bands, scale domains, transition/squeeze meaning
    -> dressPlan() / optional placeDistribute()
       generated dressing and coordinate realization
    -> interiorBuildBoard() / trayFrom({ kind: "interior" })
       volumetric room shell, citizens, lights, shadows, active-room projection
```

Already-built ingredients materially close to Cards G-L include:

- all twelve dungeon-walk graph topologies and the walk-to-`SpatialPlan` spatializer;
- deterministic cell grids, room roles, depth/difficulty bands, scale domains, room-focus binding, and combat cells;
- rolled dimensions, nonrectangular room shapes, exits derived from those shapes, structural dais/pit tiers, and
  the later per-room elevation-profile roll;
- volumetric prism/mesh floors, walls, pillars, doors, elevation surfaces, dressing coordinates, active-room
  rendering, pixel standees, practical lights, alpha-aware cast shadows, contact grounding, and staged camera work;
- a production `trayFrom` seam already capable of consuming interior plans, node/place records, settlements,
  ordinary segments, and idle/exterior states.

This makes the goal credible rather than speculative. It does **not** mean the cards are one polish pass away. The
major remaining convergence gaps are:

- Waves 1-2's new purpose/history/operating-model, functional-roster, repetition, Spice, population, flow,
  promotion, callback, and ecology rulings have not been compiled back into revised generation tables and passes;
- the release left-rail/central-tray/right-chat shell, safe-rectangle reflow, compact drawers, EngagementLens, and
  object-inspection behavior are not built;
- normal maps are not built, the cheap-primitive object library is incomplete, and asset binding still needs
  deterministic scale/face/state/fallback contracts;
- the current renderer contains more breadth and historical branches than the working goal requires; convergence
  must preserve useful machinery while making one controlled path reliable;
- no native high-resolution desktop/tablet capture corpus yet proves Card G-like composition, performance,
  typography, sprite sampling, shadow quality, or cross-mode continuity.

#### Where the remaining questionnaire leads

- **Closed Wave 1** defines why a bounded place exists, its obligations, history, transformations, discovery,
  scale/capacity, and story commitments—the semantic inputs the rebuilt site generator must roll and preserve.
- **Closed Wave 2** defines the room/occupant roster, repeated families, Spice, operational state, stocks/flows,
  casting/promotion, ecology pressure, and cold-state ownership—the systemic inputs behind the room rolls.
- **Current Wave 10** fixes the shared visual output contract early so later generator detail serves an achievable
  release tray rather than another renderer dead end.
- **Waves 3-5** return directly to architecture/structural stamps, portals/circulation, and furniture/dressing. This
  is where the accepted semantic rulings become concrete table schemas, compiler passes, reservations, placement
  laws, and degradation behavior.
- **Waves 6-9** then add scale/party capacity, tactical affordances, mutable environments, and DM strategic cards
  without changing the settled visual substrate by convenience.
- **Waves 11-12** define the teaching corpus, migration, persistence, acceptance gates, and executable build order.

The practical answer is therefore: **Genesis is close in raw spatial/rendering ingredients and far enough away in
semantic integration, UI convergence, and acceptance proof that the questionnaire is still doing necessary work.**
The old pipeline should be treated as valuable foundation and clay, not discarded and not mistaken for the finished
procedural engine.

F10.1c is closed at the **working-goal** level. Wave 10 remains **OPEN at F10.1b**: settle whether Card H's
EngagementLens is contextual/on demand as recommended, then F10.3b's Card J/K inspection split and the remaining
F10/P10/G10 follow-ups. No implementation or Fable design-to-spec handoff is authorized yet.

### 11.5 F10.1b ruling - selected-PC EngagementLens with speakable target labels

**Adam's ruling (2026-07-20):** the EngagementLens remains collapsed until the player selects a PC. Selection opens
the lens and shows characters in range for that PC, with a readable label beneath every character. The purpose is
not merely spectacle: the labels give the player unambiguous natural-language handles such as “cast firebolt on
Goblin 2” or “charge in and bash Goblin 1 in the face.”

This closes the default-visibility branch of F10.1b:

- no selected PC -> lens collapsed to its unobtrusive reopenable state;
- selected PC -> lens expands without replacing or becoming independent of the authoritative BattleMat;
- the selected PC remains visually anchored, while relevant cast members are composed into readable relationship/
  elevation positions derived from their current board citizens;
- every figure in the lens receives a legible speakable label beneath it;
- a generic label such as `Goblin 2` is a scene reference that resolves to a stable canonical entity id. It is not
  a new NPC name and must not change because figures reorder, move, enter another range band, or the lens reclusters;
- a real name known to the viewpoint may replace the generic descriptor, while hidden identity and knowledge gates
  remain intact;
- the DM/parser resolves the player's wording to that entity id and validates the requested action against the
  authoritative combat/map state. The lens never makes an illegal action legal.

The decision fits the research-derived projection law: one canonical state may have a task-specific derived view,
provided the projection retains identity/provenance and does not become a competing simulation. The EngagementLens
is therefore an index into the same citizens and receipts, not a new encounter roster.

#### Implementation and maintenance consequences

- **Selection/lens state: low-medium.** PC selection, deselection, character switching, drawer opening, turn
  changes, death/incapacitation, and scene exit need deterministic open/collapse transitions without camera churn.
- **Target projection: medium-high.** Relevant cast, distance/reach, movement, line of sight, elevation, cover,
  hidden state, allegiance, and action economy already have owners; the lens must consume their answers rather than
  reimplement approximations.
- **Speakable labels: medium.** Labels need scene-stable numbering, known-name substitution, collision avoidance,
  enlarged-text behavior, controller/touch focus, screen-reader equivalents, and parser aliases. Save/load and
  callbacks must preserve entity identity without falsely making a scene-local number part of world canon.
- **Dynamic updates: medium.** Movement, summoning, transformation/guise changes, death, escape, reinforcements,
  and range changes must update composition without relabeling surviving citizens or visually teleporting the
  player's referent.

#### F10.1d - what does “in range” mean before the action is named?

Selecting only the PC does not identify one range rule. From the same square, a fighter might reach Goblin 1 with
a melee attack, reach Goblin 2 only after moving/charging, target Goblin 3 with a bow, and target Goblin 4 with
firebolt but not with a shorter spell. Three viable interpretations remain:

1. **Show every currently perceived relevant character, with truthful relationship tags.** Labels might read
   `Goblin 1 · engaged`, `Goblin 2 · move + melee`, `Goblin 3 · 60 ft`, and `Goblin 4 · beyond movement`. After the
   player states an intent, the engine validates the exact action and can highlight legal targets or explain the
   blocker. This preserves natural-language-first play and is the recommendation.
2. **Show only targets for a selected action.** The player must choose Firebolt, Longbow, Charge, or another action
   before the lens knows whom to display. This produces the cleanest legal target list but quietly adds a conventional
   action-menu workflow in front of speaking to the DM.
3. **Show anyone reachable by at least one currently legal action.** This opens immediately and filters more than
   option 1, but “in range” may imply that the player's intended action works when only some unrelated action does.

**Recommendation:** option 1. On PC selection, open a stable speakable cast view with concise truthful relation/
distance tags. When the player's action becomes known—through an optional action hover or the submitted natural-
language intent—the engine changes emphasis, not identity: legal targets brighten; illegal targets remain visible
but dim with a short reason. That supports “firebolt on Goblin 2” without forcing an action-menu detour and without
allowing the lens to promise legality before it knows the verb.

Wave 10 remains **OPEN at F10.1d**. After the pre-action range population is ruled, audit label numbering across
reinforcements, transformations, hidden identities, and scene re-entry before returning to F10.3b's Card J/K object-
inspection split. No implementation is authorized.

### 11.6 F10.1d expansion - dual input, exact movement candidate, and honest scope

**Adam's ruling and concern (2026-07-20):** the selected PC should occupy the **left** side of the FF6-style
EngagementLens, aligned with the left-side character UI, while enemies/targets occupy the right. Lens labels should
include the distance in feet from the selected PC. Genesis should offer both interfaces in reality: the player may
speak an intent to the DM or click an action and a legal target. On the PC's turn, the authoritative battlefield
should show available movement FFT-style, with an XCOM-like second movement tier that can produce a Dash when the
player chooses a farther destination. Adam questions whether a merely representational battlefield is competitive
enough and asks for honest feedback and work scale.

#### Feedback - exact tactics is justified, but it changes the combat model

Codex agrees with the concern **for combat**. A purely representational view is sufficient for travel, many social
scenes, and low-precision exploration. It is a weak default for a D&D-derived tactical battle once the engine owns
5-foot movement, weapon/spell ranges, areas, cover, line of sight, elevation, hazards, reactions, creature
footprints, and destructible routes. Hiding those facts behind repeated DM questions makes the AI feel less
trustworthy and turns engine-owned information into interface friction.

The recommendation is therefore a hybrid with one authority, not two competing games:

```text
combat authority
  exact SpatialPlan cells + elevation + occupancy + path/range/target kernel
  rendered directly by the high-resolution PreAlpha BattleMat

derived combat presentations
  EngagementLens: cinematic, speakable cast/distance view
  zone/range view: accessibility, small-screen, prose, and degraded fallback
  chat: natural-language action route

non-combat adapters
  may remain representational wherever exact cells are not owned or useful
```

This is a controlled return to a more exact battle adapter, not a return to the discarded requirement that every
town, journey, conversation, and dungeon prop receive BG3-grade integrated 3D treatment. Spend the budget on
**tactical truth, readable feedback, and deterministic procedural geometry**. Keep simple blocks, textured boxes,
sprite citizens, and the lighting/shadow/material stack rather than taking on AAA animation and bespoke-model scope.

The market references support the expectation without proving that exact grids alone sell a game:

- the [XCOM 2 manual](https://www.feralinteractive.com/en/manuals/xcom2/latest/steam/) explicitly teaches a blue
  one-action movement boundary, a yellow two-action Dash boundary, route waypoints, sight exposure, and hazards;
- Larian's [BG3 HUD account](https://baldursgate3.game/news/community-update-15-absolute-frenzy_49) describes
  hideable/filterable action decks intended to keep combat depth available without leaving every control onscreen,
  while its official controller account preserves a quickly accessible tactical view;
- Solasta made exact 3D-grid position and verticality a product pillar because flight, climbing, pushing, and
  height must remain mechanically accurate ([developer account](https://www.solasta-game.com/solasta-crown-of-the-magister/news/9-dev-diary-2-what-is-verticality)).

As of this review, the relevant Steam pages still show large positive audiences for exact/turn-based tactical
reference points—[XCOM 2](https://store.steampowered.com/app/268500/XCOM_2/),
[Baldur's Gate 3](https://store.steampowered.com/app/1086940/view/), and
[Solasta](https://store.steampowered.com/app/1096530)—but review counts are not a causal market study. The useful
inference is narrower: direct movement/target feedback is familiar genre language, not an exotic feature players
must be persuaded to understand.

The downloaded procedural-generation papers do not choose between zone and cell combat UI. Their relevant
constraint is that generated presentation remain traceable to the generator's actual topology, constraints, and
content rather than painting a tactically persuasive fiction. Exact combat cells are unusually well aligned with
that principle because `SpatialPlan` already owns the walkable room geometry; the new work is to make combat consume
that truth instead of compressing it to zones.

#### What exists today - and why this is not merely a UI overlay

The graphics/spatial pipeline already owns exact 5-foot `SpatialPlan` cells and elevation. Combat does **not**.
Current `BATTLEMAP.md` and `combat.js` deliberately collapse a room into at most twelve positions:
`Melee/Near/Far/Distant × left/center/right`. `cellDims` only decides how many of those zones fit. Movement, Dash,
flanking, cover, attacks, and AoE helpers resolve in zone space. The spell corpus carries range strings and prose,
but not a complete structured target/shape grammar; the current `cast` event primarily records the spell,
concentration, time, and slot cost rather than validating an exact target and area against the room.

Therefore:

- drawing blue/yellow cells over the current room is **small-to-medium visual work but would be a lie** if combat
  still stores only a band and lane;
- promoting each combatant to an exact cell/elevation/footprint and making movement/targeting consume those records
  is a **large core-system change**;
- the existing room grid, elevation meshes, action budget, Dash action, reaction machinery, spell records,
  citizens, and renderer make it materially cheaper than starting a tactics engine from nothing.

#### Recommended interaction contract

Both interaction styles compile into one `ActionIntent`; neither directly mutates combat:

```text
click route
  select Fire Bolt -> select Goblin 2

conversation route
  "Cast fire bolt on Goblin 2"

shared engine route
  ActionIntent(actorId, actionId, targetDomain, targetRefs, chosenPath?)
    -> validate range / sight / cover / resources / action economy / target rules
    -> preview or typed refusal
    -> commit receipt
    -> DM narrates the same resolved event
```

The selected PC appears on the lens's left. Candidate figures appear on the right with a stable label and direct
range, for example `Goblin 2 · 35 ft`. The BattleMat owns route and area precision. A distance label is the direct
attack/effect distance; a movement hover separately reports path cost, because walking around a pit may cost 45 ft
even when the target is 30 ft away in a straight line.

Action targeting needs typed domains rather than “click the target” as a universal assumption:

- Fire **Bolt** targets an entity/object;
- Fire**ball** targets a point/cell, then previews the affected sphere and every citizen caught;
- other actions require self, willing ally, object, cell, line, cone, cylinder/sphere/cube, path/wall, or
  multi-target selection.

On the PC's turn, the board should show two reachable sets:

- **normal movement:** cells reachable with remaining Speed while preserving the Action;
- **Dash movement:** a second color for cells requiring a legal Dash source.

Hovering a cell previews the path, distance cost, destination elevation/cover, known hazards, and opportunity-
attack exposure. Clicking a second-tier cell may automatically select Dash only when its cost source is
unambiguous; if Action Dash, Cunning Action, Step of the Wind, or another resource can pay, a tiny cost chooser
should prevent the interface from silently spending the wrong resource.

#### Honest implementation scale

This is not “make the overlay prettier.” A production version is a program of coherent units:

1. **Exact combat citizens:** canonical cell/elevation/footprint occupancy for PCs, companions, foes, summons,
   large creatures, and objects; migration/derived fallback from current zones.
2. **Traversal kernel:** walkability, occupancy, pathfinding, speed budgets, difficult terrain, squeeze, climb,
   jump, flight, doors, hazards, normal/Dash reachability, and deterministic preview/commit.
3. **Target kernel:** structured action/spell target domains, exact ranges, visibility/line of effect, cover,
   reach, areas, multi-targeting, and affected-citizen previews.
4. **Combat-law migration:** flanking, opportunity attacks, reactions, elevation, cover, pushes, grapples,
   hazards, creature sizes, AI tactics, and areas move from zone assumptions to the new kernel.
5. **Dual-input interface:** action palettes, clickable figures/cells, lens labels/distances, hover explanations,
   keyboard/controller/touch access, and natural-language alias parsing all submit the same proposals.
6. **Continuity and proof:** save/load, re-entry, reinforcements, transformations, hidden citizens, split parties,
   DM receipts, fallback zone projection, mutation tests, fuzz/property tests, and native-resolution visual gates.

A narrow pre-alpha slice is much smaller: one selected PC; exact ground movement; normal/Dash coloring; one melee
attack; Fire Bolt entity targeting; Fireball point/radius targeting; a few enemies; path/range labels; and the same
action issued by click or chat. Flight, climbing, large-creature routing, every spell shape, destructible topology,
and full enemy AI can follow. Even that slice is several coordinated engine/UI units, but it would prove the hard
contract and exercise most of the eventual architecture.

#### F10.1e - exact-cell combat authority

**Recommendation:** promote exact `SpatialPlan` cells to combat authority for the release BattleMat. Keep the
current band/lane system as a derived accessibility/text/small-screen fallback and migration seam, not a second
source of truth. The EngagementLens remains cinematic and speakable. Non-combat SceneTray adapters may stay
representational where exact geometry is unavailable or pointless.

This reverses the earlier tentative posture that treated exact cells as a tactical/workbench overlay and zones as
the ordinary combat authority. It is justified only if Adam accepts the larger core-system scope after seeing the
audit above. If accepted, Wave 7 must deeply specify the tactical laws, while current Wave 10 locks the projection,
input, fallback, and acceptance obligations without prematurely implementing them.

Wave 10 remains **OPEN at F10.1e**. If exact cells are accepted, immediately follow with F10.1f: whether an
unambiguous second-tier destination auto-spends Dash without a confirmation, and how the chooser behaves when
multiple Dash sources or hazards/reactions make the cost consequential. Then return to label lifecycle and F10.3b.
No implementation is authorized.

### 11.7 F10.1e ruling and F10.1f expansion - exact cells accepted; movement stays mechanical

**Adam's ruling (2026-07-20):** exact-cell combat is worth the larger program. Requiring the player to ask the DM
to approve every ordinary position and move would make battle unacceptably slow when the engine can resolve those
facts mechanically. The exact BattleMat should therefore own ordinary movement and tactical legality. Adam also
corrects the proposed XCOM-like auto-Dash behavior after comparing it to *Baldur's Gate 3*: the player may spend
the character's normal movement allotment, but continuing beyond it requires explicitly selecting a legal Action
or Bonus Action source first. The interface may not silently choose or spend that source.

This **closes F10.1e** at the Wave 10 design level:

- exact `SpatialPlan` cells, elevation, occupancy, and footprints become the intended release combat authority;
- the built band/lane model remains current code until the replacement lands, then becomes a derived
  accessibility/text/small-screen/degraded projection rather than a competing source of truth;
- the selected-PC EngagementLens remains a cinematic, speakable, distance-labelled projection;
- non-combat SceneTray adapters may remain representational where exact geometry has no player-facing value;
- routine movement, routes, range, line of sight/effect, cover, target legality, and ordinary resource payment
  resolve locally through deterministic mechanics and receipts. The DM need not approve each square;
- the DM remains essential for open-ended intent, authored inventions, ambiguous semantic compilation, contextual
  rulings, consequences, opposition, and narration. Mechanical tactical truth creates a firm surface for the DM's
  invention rather than replacing the DM seat.

#### F10.1f movement-payment ruling

Movement is an incrementally spendable allowance, not itself an Action. At turn start, every cell reachable with
the actor's remaining Speed is mechanically available. Moving partway reduces the remaining allowance and
recomputes reachability. Crossing beyond that allowance requires the player to choose a legal extension source,
for example `Dash - Action`, `Cunning Action: Dash - Bonus Action`, or another feature with its actual resource
cost. Only after that explicit choice does the engine enlarge the spendable movement budget. A destination click
must never auto-select among those sources or silently consume the only Action/Bonus Action.

This closes the **payment** half of F10.1f. It deliberately leaves one presentation question open: whether cells
that would become reachable after a legal Dash should be hidden until the player selects Dash, or shown beforehand
as a dim locked planning preview that opens the source chooser without committing movement.

#### Existing-system research - borrow primitives and contracts, not another game's engine

The July 20 repository scan considered direct adoption, selective borrowing, schema study, and behavioral
reference separately:

| Candidate | What it offers | Genesis disposition |
| --- | --- | --- |
| [`mourner/tinyqueue`](https://github.com/mourner/tinyqueue) | A very small ESM binary-heap priority queue; ISC license; no runtime dependency tree. | **Best direct-adoption candidate** beneath a Genesis-owned bounded Dijkstra/A* kernel. The queue is generic and does not compete with `SpatialPlan` or combat law. Pin/vendor only after a build spec and license notice review. |
| [`prettymuchbryce/easystarjs`](https://github.com/prettymuchbryce/easystarjs) | MIT browser-oriented A* with weighted tiles, per-point costs, avoided cells, directional entry rules, diagonals, and optional sliced calculation. | **Prototype/bakeoff candidate**, especially for route-to-hover-cell behavior. It is endpoint pathfinding over a 2D numeric grid, not a complete reachable-area, elevation, footprint, reaction, or action-economy kernel. Its old package architecture and extra heap dependency make direct adoption less attractive than the concepts. |
| [`qiao/PathFinding.js`](https://github.com/qiao/PathFinding.js) | MIT grid library with A*, Dijkstra, breadth-first, bidirectional, and jump-point variants. | **Algorithm oracle/reference**, not the default runtime choice. Its broad fixture set is useful, but searches mutate grid node state and require cloning/reset discipline; its packaging and published-release cadence are old. |
| [`ondras/rot.js`](https://github.com/ondras/rot.js) | BSD-3-Clause roguelike toolkit with A*/Dijkstra and several 2D field-of-view algorithms in classic-browser and module builds. | **Visibility/path reference and bakeoff candidate.** Its current path implementations assume unit edge cost, and its FOV models do not by themselves establish 3D line of effect through Genesis volumes. Do not import the whole toolkit merely to obtain one algorithm. |
| [`foundryvtt/dnd5e`](https://github.com/foundryvtt/dnd5e) | A mature structured 5e item/spell data model, including separate affected-target and geometric-template records for entities, allies/enemies, points, cones, lines, spheres, cylinders, cubes, emanations, and distances. Software is MIT; SRD content is CC BY 4.0, with other assets carrying their own notices. | **Strong schema/reference candidate**, not a runtime dependency. Adapt the separation of `target.affects` from `target.template` to Genesis vocabulary and provenance, with an explicit license/attribution audit before copying any implementation or data. |
| [`donmccurdy/three-pathfinding`](https://github.com/donmccurdy/three-pathfinding), [`isaac-mason/recast-navigation-js`](https://github.com/isaac-mason/recast-navigation-js), and [`Mugen87/yuka`](https://github.com/Mugen87/yuka) | Active MIT navigation-mesh and agent-AI tooling. | **Defer for the exact-cell core.** A navmesh generated beside `SpatialPlan` would create a second geometric authority and complicate deterministic cells, areas, and save state. Yuka may later inform enemy decision layers after tactical law exists. |
| [`OpenXcom/OpenXcom`](https://github.com/OpenXcom/OpenXcom) and [`wesnoth/wesnoth`](https://github.com/wesnoth/wesnoth) | Mature turn-based movement, path-cost, occupancy, visibility, turn-resource, and AI behavior in shipped games. | **Behavioral research only.** Their GPL C++ code and different spatial/rules models make code adoption inappropriate. Study interaction laws and fixtures; do not lift implementation. |

The research recommendation is a Genesis-owned **`TacticalGridKernel`** compiled from `SpatialPlan`, with no
parallel navmesh or imported combat state. A bounded weighted Dijkstra flood should produce the exact reachable
set and predecessor map for the current movement budget; route preview may use the same predecessor data or a
deterministic A* query. A tiny generic priority queue is the only likely direct dependency. The kernel's adapters
must own elevation transitions, difficult terrain, occupancy/footprints, doors, known hazards, diagonal policy,
and movement modes. Visibility and line of effect need Genesis volume/elevation fixtures rather than an unmodified
2D roguelike FOV rule. Foundry's target/template separation is the clearest existing model for the missing action
target grammar, but Genesis remains the canonical owner.

The relevant source was archived on July 20 under
`Reference/Tactical-Combat-Research/` with immutable upstream commit ids, licenses, selected tests, an explicit
source index, and a SHA-256 manifest. The archive includes the four core queue/path/FOV candidates, source-only
copies of three deferred nav/agent references, and only five schema-relevant Foundry dnd5e files. GPL full-game
references and Foundry's large content tree were deliberately not copied. These are research inputs only: no
package was installed, imported, built, or selected as a production dependency.

This also filters cleanly through the nine downloaded procedural-layout papers. Tutenel et al.'s semantic
description/procedure split supports compiling canonical cell meaning into traversal rules; Horswill and Foged
support explicit graph/path constraints and bounded summaries; Nepozitek and Gemrot support preserving the owned
connectivity graph while solving a realization; Green et al. warn against collapsing architecture and furnishing
into one stage. None of the papers supplies a D&D tactical engine or chooses a UI. Their useful constraint is that
pathfinding and visibility consume the real generated topology and declared affordances rather than introducing a
second persuasive-but-false map.

#### Recommended future bakeoff - design evidence, not current build authority

When a later spec authorizes implementation, compare a small Genesis-owned Dijkstra/A* implementation using
`tinyqueue` against targeted EasyStar.js and rot.js prototypes on the same fixtures: flat room, difficult terrain,
pit and door, elevation transition, occupied destination, large footprint, diagonal corner, 30-foot normal range,
and explicit Dash expansion. Measure deterministic reachable sets, chosen routes, frame-time tails, bundle cost,
save/replay stability, and ease of expressing Genesis-specific edge laws. The winner must fit the canonical
contract; library convenience may not weaken it.

**F10.1g - extended-range preview:** before Dash is chosen, should the board (A) show only cells affordable now,
or (B, recommended) also show Dash-reachable cells as a dim locked planning outline whose selection opens the
legal source chooser but cannot move or spend anything yet? After that ruling, follow the remaining consequential-
movement warning/undo branch, stable label lifecycle, and F10.3b. Wave 10 remains **OPEN**. No implementation,
dependency installation, CI, worktree, LFS checkout, merge, or push is authorized.

### 11.8 F10.1g ruling - dim locked extension preview accepted

**Adam's ruling (2026-07-20):** accept Option B. The board should show where an additional movement source could
let the character finish before the player spends anything. This is preferable to revealing the expanded range
only after Dash is chosen: the player should not consume ordinary movement and discover too late that they are a
few feet short of engaging an enemy, reaching treasure, or getting to an important object.

The accepted presentation contract is:

- cells affordable with the actor's **currently remaining** movement are fully active;
- cells that one or more currently legal movement-extension sources could unlock appear as a dim, outlined or
  hatched locked region. Color alone may not carry the distinction;
- the locked region is the union of actually legal hypothetical results, not a generic second ring. Each cell
  knows which sources can pay for that exact destination;
- selecting a locked cell opens a chooser filtered to those sources and shows the route, total movement cost,
  Action/Bonus Action/other resource payment, and what resources remain afterward;
- nothing moves, spends, rolls, reveals, or commits until the player explicitly chooses a source and confirms the
  validated route;
- after partial movement or any state change, both active and locked regions recompute from the new canonical
  position and remaining resources;
- hidden traps, unseen enemies, and unknown terrain properties do not leak through the preview. It may warn only
  from facts the player's viewpoint or rules engine is allowed to expose.

The treasure example adds a necessary action-economy truth. “Can stand beside the chest” is not always “can open
the chest this turn.” If the only route requires `Dash - Action` and opening the chest also costs an Action, the
destination preview should say `Reachable with Action Dash; Open Chest unavailable this turn`. If `Cunning Action:
Dash - Bonus Action` is legal, that source may truthfully show that the Action remains available. The same rule
applies to reaching melee range, pulling a lever, picking up a governed object, administering aid, or any other
destination affordance. The board forecasts only mechanics already known and does not promise narrative success.

The incremental cost beyond the accepted tactical kernel is **moderate**: compute a bounded hypothetical
reachable set for each distinct legal extension budget, merge them for presentation, retain source eligibility per
cell, and keep the chooser/resource-after-state legible. The maintenance burden is concentrated in a typed
movement-extension registry and destination-affordance cost queries rather than special-case UI rules for each
class. Fixture coverage must include equal and unequal Dash sources, a source becoming unavailable after partial
movement, and a reachable destination whose intended interaction cannot be paid afterward.

This closes **F10.1g** and completes F10.1f's movement-tier/payment presentation branch. It does not authorize a
build.

#### F10.1h - known route consequences

The next material question is what happens when an otherwise legal route is known to provoke an opportunity
attack, cross visible fire or acid, risk a fall, break concealment, leave a protective aura, or consume a resource
needed for the apparent destination interaction:

- **Option A - confirm every move:** safest against misclicks, but battle becomes dialog-heavy and recreates the
  friction exact mechanics are intended to remove.
- **Option B - warn only on known material consequences (recommended):** safe movement commits normally. Route
  hover always marks known exposure; selecting a materially risky route opens one concise confirmation showing
  the trigger cells and likely mechanical consequences. Unknown hazards remain unknown.
- **Option C - never confirm; rely on undo:** fastest initially, but post-reaction or post-reveal undo creates
  canon, information, and save-scumming problems.

Does Adam accept Option B as the warning baseline? If so, immediately follow into the narrower undo boundary:
whether a movement receipt may be reversed only before it causes a roll, reaction, reveal, resource change, or
other external consequence. Then continue to stable label lifecycle and F10.3b. Wave 10 remains **OPEN**.

### 11.9 F10.1h ruling - interrupt only for known material route consequences

**Adam's ruling (2026-07-20):** accept Option B. A safe legal route should commit without another dialog. When the
chosen route has a known material consequence, the interface gives one concise warning before commitment rather
than asking the DM or confirming every ordinary move.

The warning baseline is:

- route hover and focus mark known consequence cells before selection, using shape/icon/text as well as color;
- a safe route needs no confirmation beyond the ordinary destination commit;
- a materially risky route receives one summary identifying the trigger location and consequence class—for
  example opportunity-attack exposure, visible damaging terrain, known fall risk, broken concealment, departure
  from a protective aura, or a payment that prevents the apparent destination interaction;
- the summary offers `Continue` and `Choose Another Route`; it does not make the player clear each cell;
- a warning states only rules-visible certainty. It may say that a known enemy **can attempt** an opportunity
  attack or that visible fire has a known damage rule; it may not promise an attack result or reveal a hidden
  reaction choice;
- hidden traps, unseen creatures, undiscovered hazards, and secret consequences do not appear merely because the
  path kernel evaluated the route internally;
- the same consequence summary feeds direct input, controller/touch focus, accessibility text, and a natural-
  language proposal. The DM receives the resulting receipt rather than performing routine route validation.

Example:

```text
Route to Brass Chest · 45 ft · Dash (Action)
Known exposure: Goblin 2 may make an opportunity attack when you leave this cell.
Known terrain: crosses burning oil for 5 ft.
Arrival: no Action remains to open the chest this turn.

[Continue] [Choose Another Route]
```

This costs **moderate rule/UI integration** beyond pathfinding itself. Traversal edges need player-visible
consequence annotations; the proposal compiler needs a typed summary; every warning must pass the viewpoint filter;
and tests must prove that safe routes do not create modal fatigue while secret facts never leak. The maintenance
cost belongs in shared consequence classes, not bespoke warnings per map or monster.

This closes F10.1h's **warning baseline**. Two generated movement follow-ups remain material: the undo boundary and
how the route solver ranks a shorter risky path against a longer safe path.

#### F10.1i - conditional movement undo

In plain English: after a movement click has committed, when may the player take it back?

- **Option A - no undo after commitment:** strongest canonical simplicity, but a harmless misclick remains
  punitive even when nothing observed or reacted to the move.
- **Option B - bounded undo until an external consequence (recommended):** the current turn may roll back the most
  recent movement segment, including its own movement/Dash payment, only while it has caused no roll, reaction,
  reveal, hazard resolution, newly observed fact, other actor-state change, or subsequent committed action. Preview
  is always cancelable. Once an external consequence occurs, the receipt is sealed and ordinary play continues.
- **Option C - rewind the whole turn:** convenient, but requires broad state rollback and invites information gain,
  reaction fishing, and save-scumming.

Under Option B, moving ten harmless feet and noticing a misclick can be undone. Moving out of Goblin 2's reach and
causing an opportunity-attack roll cannot be undone even if the attack misses. Entering a cell that reveals a
previously unseen enemy cannot be undone. Selecting Action Dash and moving through an entirely consequence-free
route may undo the movement and its Dash payment together, provided no later action has committed.

Does Adam accept Option B? If so, follow with the shorter-risky versus longer-safe route-ranking question before
returning to stable label lifecycle and F10.3b. Wave 10 remains **OPEN**; no build is authorized.

### 11.10 F10.1i ruling - bounded movement undo accepted

**Adam's ruling (2026-07-20):** accept Option B. The newer *Final Fantasy Tactics* interaction used this kind of
bounded undo and worked well. Genesis should likewise forgive a harmless movement misclick without permitting
players to rewind reactions, rolls, discoveries, or consequences.

The accepted undo contract is:

- preview, route inspection, locked-cell inspection, and payment-source comparison are freely cancelable because
  they have not changed canon;
- after commitment, the current turn retains a bounded stack of the player's most recent reversible movement
  segments rather than a snapshot of the entire turn or world;
- a reversible segment may restore the actor's prior cell/elevation, movement allowance, and a movement-extension
  payment such as Action Dash when those changes formed one transaction;
- a segment seals as soon as it causes or is followed by a roll, reaction opportunity/choice/resolution, hazard
  resolution, newly observed fact or citizen, other actor-state change, committed interaction/action, or another
  external consequence;
- a miss still seals an opportunity-attack route because the roll and reaction happened; learning that a hidden
  enemy exists still seals movement even if no damage occurred;
- any external mutation whose reversibility class has not been declared **seals by default**. A new subsystem must
  opt into rollback with tests; UI convenience cannot guess that canon is safe to rewind;
- the player sees why Undo is unavailable—`Sealed: Goblin 2 reaction resolved`, not a disabled control with no
  explanation;
- undo itself is a typed rollback receipt linked to the original movement receipt. The DM receives the surviving
  state and does not need to narrate a preview or harmless reverted misclick as if it occurred in canon.

This is a **moderate transactional/state cost**: reversible self-owned deltas, segment ids, seal reasons, a bounded
current-turn stack, save/load treatment, animation reconciliation, and tests for every sealing class. It is far
smaller and safer than whole-turn rewind. Memory is bounded by the number of unsealed movement segments in the
active turn and is discarded when the turn advances or a segment seals; it is not a persistent history clone.

This closes F10.1i. The newer FFT example is useful interaction evidence, not an imported rules authority.

#### F10.1j - shorter risky route versus longer safe route

In plain English: when the same destination has multiple legal paths, which one should a click choose by default?

- **Option A - shortest path always:** deterministic and cheap, but may walk past an enemy or through fire when a
  harmless route costs only five more feet.
- **Option B - safest known path always:** protects the player, but can silently consume scarce movement or make a
  destination appear to require Dash when a shorter exposed route does not.
- **Option C - resource-bounded safe default with explicit material alternatives (recommended):** among routes
  affordable with the movement budget the player has already authorized, default to the route with the fewest
  known material consequences, then lowest movement cost. If avoiding danger crosses into a new payment tier—such
  as requiring Action Dash while the risky route fits normal movement—show both as explicit route choices rather
  than silently spending or silently accepting danger.

Examples under Option C:

- `20 ft through Goblin 2's reach` versus `30 ft around`, with 30 ft remaining: default to the safe 30-foot route
  and keep the exposed shortcut selectable and clearly marked;
- `25 ft exposed` versus `40 ft safe`, with 30 ft remaining: show `Fast · 25 ft · Opportunity attack possible`
  and `Safe · 40 ft · Dash required`; neither the extra risk nor Dash is silently chosen;
- two equally safe/equal-cost routes: use a stable deterministic tie-break so save/replay and spoken receipts do
  not drift.

The implementation cost is **moderate-high path-query work**, but bounded. The kernel need not enumerate every
possible path: solve the least-exposure path within the authorized budget and the least-cost path, retain a second
candidate only when their consequence/resource profiles materially differ, and cap alternatives. Maintenance
depends on shared consequence severity classes and stable tie-breaks rather than authored route preferences.

Does Adam accept Option C? After this, the exact-movement branch can return to stable EngagementLens label
lifecycle and then F10.3b. Wave 10 remains **OPEN**; no build is authorized.

### 11.11 F10.1j ruling - resource-bounded safe route with material alternatives

**Adam's ruling (2026-07-20):** accept Option C. A destination click defaults to the safest known route available
within the movement budget the player has already authorized, then to the lowest-cost route among equally safe
candidates. The engine must not silently cross into Dash or silently accept a known danger merely because one path
is shorter.

The accepted route-ranking contract is:

1. reject illegal paths and paths outside the currently authorized movement budget;
2. among the remaining paths, prefer one with no known material consequence over one with known exposure;
3. among consequence-equivalent paths, prefer lower movement cost;
4. break exact ties deterministically from canonical cell/edge ids so save, replay, UI, prose, and DM receipts agree;
5. compute a least-cost candidate separately and retain it only when its risk/resource profile materially differs
   from the default;
6. if a safer route needs a new payment tier—Action Dash, Bonus Action Dash, flight activation, or another resource—
   present it beside the affordable risky route as an explicit choice. Neither route commits through display alone.

“Safest” is not one opaque universal score. Consequence-free dominates known exposure within the same authorized
budget. When two routes expose the actor to **different, non-dominating** known consequences—such as one possible
opportunity attack versus breaking concealment and crossing fire—the interface shows the capped alternatives and
their typed summaries rather than pretending the engine knows the player's tactical values. Wave 7 may later own
rules-specific comparable magnitudes where the system genuinely has them; Wave 10 forbids hiding value judgments
behind an unexplained route score.

Examples:

- with 30 feet remaining, `20 ft · Goblin 2 opportunity attack` versus `30 ft · no known exposure` defaults to the
  safe 30-foot route and keeps the shortcut selectable;
- with 30 feet remaining, `25 ft · exposed` versus `40 ft · no known exposure · Dash required` displays both and
  requires the player to choose danger or a payment source;
- equal risk and equal cost resolve through a stable tie-break, never animation timing or object iteration order.

The implementation cost remains **moderate-high but bounded**: a least-exposure constrained search, a least-cost
search, typed profile comparison, stable tie-breaks, and a small alternative cap. It does not authorize enumerating
all paths or importing an external combat authority. This closes F10.1j and the current exact-movement follow-up
branch.

#### F10.1k - stable speakable-label lifecycle

The deferred label question now returns. In plain English: how should handles such as `Goblin 2` behave when
citizens die, reinforce, hide, transform, flee, and return?

- **Option A - renumber the visible cast continuously:** compact, but “Goblin 2” may refer to a different creature
  after a death or camera change and makes both click/prose commands unsafe.
- **Option B - permanent world-global type numbers:** maximally persistent, but produces labels such as `Goblin 47`,
  turns a UI handle into unintended world identity, and burdens saves forever.
- **Option C - monotonic encounter/continuity-scope handles mapped to canonical ids (recommended):** assign a
  visible citizen the next local handle when first revealed; never renumber or reuse a retired number inside that
  scope. The same canonical citizen keeps its handle if it leaves and returns during the same encounter/site
  continuity. A later unrelated scene may open a new label scope without changing the citizen's canonical identity.

Under Option C:

- `Goblin 1` dies; surviving `Goblin 2` stays `Goblin 2`; reinforcements become `Goblin 3` and `Goblin 4`;
- a hidden goblin receives its handle only when revealed, so invisible reservations cannot leak enemy count;
- if `Goblin 2` flees and returns during the encounter/continuous site episode, it remains `Goblin 2`;
- if the player learns Goblin 2 is Varka, the display may become `Varka` while `Goblin 2` remains a valid parser
  alias for the active scope;
- a witnessed transformation may display `Wolf (Goblin 2)` or another truthful descriptor while preserving the
  handle. A secret disguise or replacement never leaks canonical identity through the label;
- rooted NPC identity, callbacks, and persistence belong to canonical entity records, not to preservation of a
  generic combat number across the entire world.

The implementation/maintenance cost is **moderate**: a saved `LabelScope`, monotonic per-descriptor counters,
entity-id/alias maps, tombstones for retired handles, reveal-gated assignment, transformation/display rules, and
parser tests. Runtime cost is tiny; most risk lies in visibility, save/re-entry, and alias correctness.

Does Adam accept Option C? If so, exhaust any remaining label edge cases, then return to F10.3b's Card J/K object-
inspection split. Wave 10 remains **OPEN**; no build is authorized.

### 11.12 F10.1k ruling - monotonic local speakable handles accepted

**Adam's ruling (2026-07-20):** accept Option C. Generic tactical labels are stable monotonic handles within an
encounter or continuous-site continuity scope, mapped through the viewpoint projection to canonical entity ids.
They are not continuously renumbered and are not permanent world-global creature numbers.

The accepted label lifecycle is:

- a revealed citizen receives the next unused local number for its truthful perceived descriptor; numbers are
  never reassigned within the scope, even after death, departure, disappearance, or transformation;
- surviving labels do not change when another citizen leaves the visible cast. `Goblin 2` stays `Goblin 2`;
- reinforcements and newly revealed citizens take new numbers. Hidden reservations may not create visible gaps or
  otherwise leak undiscovered population;
- a canonical citizen leaving and returning within the same encounter/continuous-site scope recovers the same
  handle from the saved entity/alias map;
- when a proper name becomes known, it may replace the generic display label while the old handle remains an
  accepted alias for the active scope;
- a witnessed transformation preserves reference explicitly—for example `Wolf (Goblin 2)`—without allocating the
  transformed citizen as an unrelated `Wolf 1`. Secret disguises, replacements, and mistaken identities project
  only viewpoint-safe labels and never disclose the hidden canonical mapping;
- summons, duplicates, or split citizens that become separately targetable receive separate handles with
  provenance to their source. Merging or despawning them retires rather than recycles those handles;
- label scope, counters, aliases, and tombstones survive save/load and deterministic replay. The generic display
  numbers may end with the scope; canonical identity and history do not.

This requires **moderate identity/projection work**: a saved `LabelScope`, per-descriptor monotonic counters,
canonical-id and perceived-referent alias maps, retired-handle tombstones, reveal-gated assignment, transformation
and split/merge events, parser resolution, and accessibility parity. Runtime/memory cost is small and bounded by
the citizens surfaced in the active continuity scope. The system may compact closed-scope display metadata while
retaining historical aliases only for canonical citizens whose continuity actually persists.

This closes F10.1k's local-label policy. One material edge remains because of the already accepted NPC rooting,
callback-stub, and provisional-card laws.

#### F10.1l - an unnamed local handle returns in a later story

Suppose `Goblin 2` bargains with the party, escapes, becomes continuity-bearing canon, and returns several sessions
later before the player learns a proper name. What should the player-facing label do?

- **Option A - keep `Goblin 2` forever:** recognition is easy, but a temporary combat handle becomes an awkward
  world-global name and can collide with later label scopes.
- **Option B - assign a fresh local number:** keeps scopes pure but throws away the exact callback recognition the
  canonical identity earned.
- **Option C - promote only rooted continuity-bearing citizens to a stable viewpoint-safe callback label
  (recommended):** use a known distinguishing description such as `Scarred Goblin` or `Aqueduct Envoy`, chosen
  from facts the player actually observed. Preserve `Goblin 2` as a historical/contextual alias for parser and
  recap resolution, but do not keep it as the primary display name. Once a proper name is learned, that becomes the
  display label while both prior aliases remain historical.

Ordinary unrooted combatants never receive this promotion merely because a local number existed. The promotion
occurs only when the citizen crossed the existing continuity-rooting boundary through meaningful contact, action,
relationship, obligation, evidence, lore, or later callback selection. The callback label cannot invent a scar,
rank, location, or relationship the player did not perceive, and it must disambiguate if two rooted citizens share
the same description.

The implementation cost is **moderate but shared with already accepted identity/callback work**: viewpoint-safe
descriptor selection, uniqueness checks, alias history, rooting event integration, recap/parser resolution, and
renaming migration. It prevents both permanent `Goblin 47` clutter and continuity loss.

Does Adam accept Option C? If so, test the final label edge cases for same-description collisions and secret
identity changes; if no new policy choice appears, close the label branch and return to F10.3b. Wave 10 remains
**OPEN**; no build is authorized.

### 11.13 F10.1l ruling and label audit - rooted callbacks earn observed names, jokes remain aliases

**Adam's ruling (2026-07-20):** accept Option C. A rooted unnamed citizen returning after its local combat-label
scope receives a stable viewpoint-safe callback descriptor drawn only from observed facts. The old combat handle
remains a historical/contextual alias. After a proper name is learned, the player may still jokingly call Varka
`Goblin 2`; resolving the reference is mechanical, while interpreting the joke and Varka's response is the DM's
social/narrative job.

The cross-scope promotion contract is:

- only a citizen that crossed the accepted continuity-rooting boundary earns a durable callback label; an ordinary
  unrooted mook's local number expires with its label scope;
- the callback descriptor uses known distinguishing evidence, role, action, relationship, or provenance—such as
  `Aqueduct Envoy`. It never invents an unseen scar, secret rank, true species, or hidden allegiance;
- if a learned proper name becomes available, it becomes the primary display label. Callback descriptors and old
  local handles remain historical aliases for parser, recap, journal, and DM context;
- player-coined nicknames may also resolve as contextual/party-language aliases when the DM or an explicit party
  naming event establishes them. They never silently replace the canonical proper name or prove a hidden fact;
- the semantic resolver identifies the referent first. The DM then decides whether using `Goblin 2` for Varka is
  affectionate, teasing, dismissive, insulting, confusing, or irrelevant in the current relationship and scene;
- if aliases collide across old scopes, current scene, recent discourse, selected target, and explicit qualifiers
  may disambiguate. If more than one live referent remains plausible, the interface asks a short clarification
  rather than guessing;
- if two rooted unnamed citizens lack unique observed traits, use honest known provenance plus the historical
  handle where needed—`Aqueduct Goblin (formerly Goblin 2)`—until play supplies a better distinction. Do not
  fabricate one for elegance;
- a secret replacement/disguise preserves the player's perceived label without transferring omniscient identity.
  An intent addressed to `Varka` targets the visible referent the player believes to be Varka; the UI and DM may
  not confirm whether the canonical Varka is actually present.

These rules reuse the accepted canonical identity, rooting, callback-deck, viewpoint-knowledge, and semantic-
resolver owners. The additional implementation cost is **moderate**: promoted display aliases, scoped historical
aliases, collision/discourse resolution, party-nickname receipts, and belief-safe target mapping. They do not
require permanent generic numbering or eager persistence of unrooted actors.

The label audit finds no remaining material policy fork. Reinforcements, hidden reveal, flee/return,
transformation, summon/split/merge, learned names, recurring unnamed callbacks, player jokes, collisions, and
secret replacements all follow the same identity/viewpoint/alias law. F10.1k-F10.1l and the speakable-label branch
are **closed** at Wave 10 design level. No build is authorized.

#### F10.3b - where does full object inspection live?

The deferred Card J/K decision now returns. In plain English: when the player selects a chest, lever, corpse,
evidence trace, turtle communicator, or other scene object, should its full state and interaction controls cover
part of the board or live in the persistent right conversation rail?

- **Option A - Card J full board-anchored inspector:** identity and object remain spatially immediate, but the card
  can cover tactical cells, routes, enemies, and evidence; collision-aware placement becomes difficult across
  large fields, drawers, lens states, tablet widths, and clustered objects.
- **Option B - Card K only in the right rail:** preserves every board cell and gives large readable content, but
  the object can feel spatially detached and simple hover/focus questions must travel across the screen.
- **Option C - tiny Card J spatial preview plus Card K full inspector (recommended):** hover/focus shows a small
  collision-aware board tag with object name, obvious state, distance, and selection link. Selection opens the
  complete inspector in a pinned focus slot in the right conversation rail. Only a resulting inspection/action
  receipt enters the scrolling transcript; changing focus does not pollute conversation history.

Chest example under Option C:

```text
board tag
IRON CHEST · Closed · 5 ft

right-rail focus inspector
[canonical chest sprite]
Closed · Heavy iron · Belongs to the watch
Visible evidence: corroded lock; fresh drag marks
[Examine] [Open] [Pick Lock]
```

Unknown traps, contents, ownership, or evidence remain absent until viewpoint knowledge permits them. Both
surfaces derive from one canonical `ObjectFocusProjection`; neither owns object state, and every interaction emits
the same validated `ActionIntent`/receipt used by prose input. On a small horizontal tablet, the board tag may
collapse to icon/name while the right-rail inspector remains the accessible full surface.

Option A has **high spatial-layout maintenance** and repeated occlusion QA. Option B has **medium shell/scroll
cost** but weaker board linkage. Option C has **medium-high initial UI integration** because two coordinated
projections exist, but lower long-term ambiguity: the preview stays intentionally tiny, the full controls have one
stable home, and a single projection contract prevents drift.

Does Adam accept Option C? If so, follow into inspector persistence, simultaneous object/character focus, and
interaction-vs-conversation behavior until no material F10.3b branch remains. Wave 10 remains **OPEN**; no build is
authorized.


<!-- END VERBATIM MIGRATION: original lines 15646-16919 -->
