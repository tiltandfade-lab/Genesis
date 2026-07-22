---
type: design-study
status: CLOSED
wave: 5
part: 1
legacy_sections: "14-14.9"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 5 — Full Questionnaire and First Discussion Batch

### 14 Wave 5 opening — preserve the complete bank before rulings

Wave 4 closes explicitly at section 13.10. The questionnaire advances to **Wave 5 — Furniture Assemblies,
Dressing, Clutter, and Empty Rooms**. The complete prospective/additive bank follows. Its presence is not acceptance.

#### Inherited laws Wave 5 may deepen but not silently contradict

- A furnishing assembly is subordinate to canonical purpose, operating obligations, room/child identity, structural
  geometry, reservations, connections, circulation, scale domains, culture/material history, and current use.
- The roll owns canonical nouns and obligations; the composition grammar owns lawful arrangement. Neither a
  renderer nor provider prose may invent a prop, container, clearance, support, or mechanic because the image looks
  empty or the narration wants a convenient tool.
- Functional support, historical/occupant evidence, tactical/interactable state, and optional visual texture are
  distinct layers. One attractive noun does not silently satisfy several unrelated obligations.
- Repeated rooms/children remain hierarchical assemblies with stable identities and controlled variance. They may
  be quiet on entry without being cloned, meaningless, or independently over-rolled.
- Search remains automatic read -> focused inspection -> systematic sweep. Interchangeable clutter is one search
  surface; identical retries do not reroll; every-room opportunity does not imply per-container loot or UI sparkle.
- Consequential unique items have exact identity/location/custody. Fungible holdings use conserved bounded envelopes
  with deterministic instantiation. Dressing cannot mint availability retroactively.
- Player/DM attention may promote only within seeded causal shape, finite capacity, exclusions, provenance, and a
  validated receipt. Unsupported free invention remains proposal, not canon.
- Canonical structure/material/connection truth owns mechanics. Visual assets, shader variation, sprites, faced
  boxes, kit parts, and fallback markers are replaceable projections with deterministic binding and honest absence.
- Broad break/burn/support/topology propagation remains Wave 8's owner. Wave 5 must retain stable prop/assembly ids,
  lightweight state/affordance seams, and a representative interaction path without pre-building universal physics.
- The first no-cash Mac proof stays narrow and real. Full prop catalogs, continuous simulation, exhaustive container
  inventories, broad realm art, and mature clutter density remain evidence-triggered breadth.

#### Assembly grammar and spatial composition

1. **P5.1 — assembly ontology:** What makes a bed area, workstation, shrine, kitchen line, cell, archive bay,
   market stall, guard post, laboratory, refuse point, or other furnishing cluster a functional assembly rather
   than unrelated props?
2. **P5.2 — function, evidence, and dressing layers:** Which placed elements fulfill operating obligations, which
   communicate use/history/occupants, which support tactics or interaction, and which are optional visual texture;
   how does the compiler prevent one attractive prop from falsely satisfying every layer?
3. **P5.3 — sockets, relations, and access:** How do wall/floor/ceiling/object sockets, adjacency, orientation,
   reachability, working clearance, circulation, visibility, ergonomic use, and support relations place assemblies
   sensibly within structural reservations?
4. **P5.4 — density and meaningful emptiness:** How are sparse, normal, crowded, stripped, abandoned, ceremonial,
   ruined, and intentionally empty rooms distinguished; what protects circulation and focal hierarchy; and what
   makes emptiness informative rather than unfinished?

#### Variation, materials, state, and interaction

5. **P5.5 — repeated-assembly variation:** How do correlated room families share institutional identity while
   varying layout, wear, ownership, contents, current use, failures, secrets, and focal props without procedural
   noise or cloned compositions?
6. **P5.6 — material and affordance grammar:** Which lightweight material, construction, contents, attachment,
   mobility, temperature, wetness, flammability, fragility, power, cleanliness, and condition tags support G5.1
   interactions without continuously simulating every object?
7. **P5.7 — containers, contents, and inventory boundary:** When are drawers, shelves, sacks, chests, barrels,
   corpses, racks, and hidden compartments real inventories versus aggregate holdings or dressing; how are search,
   custody, depletion, replenishment, and discovered emptiness handled?
8. **P5.8 — attention and DM-authored detail:** Under G5.2 and G2.1, when may player attention or DM synthesis
   promote dressing into a stable noun/state/affordance, and what transaction prevents contradiction, retroactive
   convenience, or invisible mechanical invention?

The master questionnaire accidentally duplicated the phrase `promote dressing into a stable noun/state/affordance`
across a line break in one snapshot. The semantic question above is preserved once; no second P5.8 exists.

#### Mutation ownership, visual realization, budgets, and proof

9. **P5.9 — movement, use, damage, and exhaustion:** Which owner handles moving, tipping, opening, burning,
   breaking, repairing, consuming, spilling, embedding, blocking, powering, or exhausting an assembly/prop, and
   when does the change escalate to Wave 8 topology or systemic mutation?
10. **P5.10 — asset realization and fallback:** How do semantic tags select approved sprites/models/faced boxes,
    compose kit parts, preserve scale/orientation/state readability, and fall back deterministically without
    changing object identity or mechanics?
11. **P5.11 — active-prop and clutter budget:** How many full interactables, latent promotable props, containers,
    state variants, visual dressings, and collision bodies may a room/site support; how are distant/irrelevant
    elements aggregated without erasing promised facts?
12. **P5.12 — Wave 5 acceptance corpus:** Which room families, densities, repeated assemblies, empty rooms,
    container/search traces, promoted props, mutations, realm skins, and gameplay-scale captures prove function,
    composition, readability, interaction honesty, variety, and performance?

#### Additive Gemini-reference questions

13. **G5.1 — touched-dressing state:** What lightweight composition and interaction grammar lets touched dressing
    acquire states such as wet, flammable, chilled, embedded, leaking, powered, blocked, or exhausted without
    turning every bottle, drawer, and snowflake into a continuously simulated object?
14. **G5.2 — validated physical improvisation:** How may the DM freestyle a plausible physical detail in response
    to player attention, while one transactional validation step prevents the invention from contradicting space,
    inventory, prior evidence, or available affordances?

No Wave 5 answer is accepted yet. Questions 1-10 form the first easy-numbered discussion batch; P5.11-P5.12 and
G5.1-G5.2 remain visibly queued rather than omitted. Wave 5 remains **OPEN**; no implementation is authorized.

### 14.1 Current-engine audit — preserve the scaffold, name the missing owner

The current engine is not starting from zero:

- `place-dressing.js` already supplies deterministic realm-aware rosters, role-based density, focal/filler classes,
  and some door-apron/center avoidance. Its selection is still generic rather than compiled from a room's functional
  obligations, and its legality model is essentially a local occupied-cell set.
- `ROOM-GRAMMAR.md` already has the right relational vocabulary: ALIGN, RHYTHM, PAIR, ROW, FLANK, FOCAL, and CLEAR.
  `room-grammar.js` currently refines only a narrow subset of already-bound interactables; it does not yet arrange
  full furnishing assemblies or govern all dressing.
- `walk-interactables.js` already separates semantic binding from realization and preserves stateful nouns. Its
  placement cannot yet negotiate one shared legality plan with doors, shells, furniture, and dressing.
- `place-projection.js` already distinguishes staged cards from narration and reserve. Its capacity estimate and
  visual-density decision are presentation approximations, not a functional room-capacity or clutter budget.
- The audited passes reserve against separate occupancies. No current owner can prove that a cell, forge, shrine,
  archive bay, or kitchen works as a whole assembly with support, access, clearance, and circulation intact.

The accepted direction should therefore evolve these pieces into the shared room compiler already called for by
Wave 3. It should not discard the deterministic rosters, relational grammar, interactable state, or reserve lane.
The choices below decide what semantic contract that future compiler must serve; they authorize no implementation.

### 14.2 First discussion batch — P5.1-P5.10

Each item identifies whether Adam's taste is materially needed. **Prototype** means the smallest no-cash MacBook Pro
proof; **MVP** means a narrow but honest playable feature; **ideal** means the retained long-term goal, not automatic
near-term scope.

1. **What makes several props one functional assembly? — P5.1**

   **Decision authority:** founder/product vision matters.

   **A — Independent prop bag:** a prison cell rolls a bed, bucket, chain, and stool separately. The picture may look
   plausible, but no owner can prove that a prisoner can sleep, be secured, use sanitation, and be reached by a
   guard. At the DM seat these remain four nouns with no reliable explanation of why they are there. Cheap, but it
   produces decorative rather than functional rooms.

   **B — Hierarchical functional assembly:** a `detention-cell` assembly owns an identity, required/optional roles,
   relations, access faces, clearances, shared state, and provenance. A cot can satisfy sleep support, a wall ring can
   satisfy restraint, and a bucket can satisfy sanitation only because those roles are explicit. The DM seat can say
   which obligations are satisfied, degraded, substituted, or absent without inventing furniture.

   **C — Fixed authored prefab:** each cell is a hand-authored prop layout stamped as a unit. It is reliable inside
   known rectangles but brittle across cultures, odd shells, damage histories, and procedural variation.

   **Recommendation: B.** Prototype one cell, shrine, and workstation recipe; MVP adds a small purpose-driven recipe
   library with deterministic degradation; ideal composes procedural assemblies from culture, institution, current
   use, history, and geometry. **Cost:** medium initially, high at ideal breadth.

2. **How separate are function, evidence, tactics, and visual dressing? — P5.2**

   **Decision authority:** product clarity matters; schema details are technical.

   **A — One attractive noun may imply everything:** a forge's anvil silently proves that the room operates, has
   fuel, bears smithing history, offers usable tools, and looks inhabited. This is inexpensive but lets art erase
   missing mechanics.

   **B — Explicit layered obligations:** the furnace/anvil may fulfill operation; soot and old slag may carry
   evidence; tongs, quench barrel, and loose coal may carry interaction/tactical affordances; dust and harmless
   scraps may be visual texture. One object may serve several layers only when each role is declared. The DM seat
   can distinguish “this was a forge” from “this forge can operate now.”

   **C — Renderer-authored storytelling:** the visual pass adds whatever implies the desired story, while mechanics
   remain elsewhere. It can be beautiful but makes screenshots and narration untrustworthy.

   **Recommendation: B.** Prototype four explicit role lanes in a few recipes; MVP validates required roles and
   reports lawful substitutions/degradation; ideal allows correlated history, culture, occupation, and tactical
   layers without conflation. **Cost:** medium; authoring/validation breadth is the main expense.

3. **How should sockets, relations, and working access govern placement? — P5.3**

   **Decision authority:** mostly a technical default once the desired room behavior is accepted.

   **A — Random legal floor cells:** keep objects off walls and doors, but do not model which side of a chest opens,
   where a scribe sits, or whether an altar has an approach. The DM may describe use that the geometry contradicts.

   **B — Typed sockets plus shared constraints:** floors, walls, ceilings, objects, and assemblies expose typed
   support sockets; placed nouns declare footprint, orientation, access face, adjacency, reach, visibility, working
   clearance, and hard circulation reservations. A shrine can require a supported altar, a clear worship approach,
   and candle sockets without prescribing exact coordinates. The DM seat receives the committed relation graph.

   **C — Exact coordinate templates:** every recipe prescribes positions. This is simpler to validate in fixed shells
   but fights irregular rooms and procedural architecture.

   **Recommendation: B.** Prototype only floor/wall/support plus one access face and hard aisle; MVP adds a compact
   socket/clearance vocabulary; ideal supports multi-object ergonomic, visibility, attachment, and service relations.
   **Cost:** medium-high solver work, mostly deferrable breadth rather than a new founder choice.

4. **What should sparse, crowded, stripped, and intentionally empty rooms feel like? — P5.4**

   **Decision authority:** high-value taste call.

   **A — A numeric clutter slider:** sparse gets fewer random props and crowded gets more. A stripped barracks and a
   ceremonial empty hall can therefore look equally unfinished, and the DM has no causal distinction to narrate.

   **B — Semantic density profiles:** density is subordinate to purpose, focal hierarchy, circulation, history, and
   current state. A stripped barracks preserves removal marks, gaps, or one abandoned obligation; a ceremonial hall
   protects deliberate open approach; an unused chamber can be truly quiet; a crowded store pinches optional space
   without blocking required routes. Emptiness is evidence, not a request for the renderer to fill the frame.

   **C — Beauty-first fullness:** every room receives enough set dressing to look rich, with “empty” expressed mainly
   in narration. It improves surface abundance but weakens quiet rooms, search honesty, and site history.

   **Recommendation: B.** Prototype four profiles—purposeful sparse, normal, crowded, and stripped/abandoned; MVP
   adds ceremonial, ruined, and intentionally empty causes; ideal derives profiles from site history, occupants,
   depletion, damage, and culture. **Cost:** low-medium for the first proof, high tuning/art breadth later.

5. **How should repeated assemblies vary without becoming clones or noise? — P5.5**

   **Decision authority:** founder taste matters for the acceptable balance of institutional unity and individuality.

   **A — Reroll every child independently:** six barracks bays get unrelated beds, lockers, wear, ownership, and
   clutter. There are no literal clones, but the institution loses visual and causal identity.

   **B — Shared parent constitution plus caused variation:** the barracks establishes common construction, spacing,
   issue furniture, orientation, and maintenance regime. Each bay then varies on bounded axes such as occupant,
   current use, wear, contents, failure, secret, or replacement history. Correlated causes can affect several bays.
   The DM seat knows both the family invariant and each child's stable differences.

   **C — Identical prefab with cosmetic seeds:** layout stays cloned while color, grime, and small decals vary. This
   is a useful rendering technique but cannot supply the semantic variation by itself.

   **Recommendation: B**, with C's material/decal mutation used beneath it. Prototype one parent assembly and three
   children with two caused differences; MVP supports a small bounded variation grammar; ideal derives assembly
   families from institution, culture, occupants, repairs, and changing world state. **Cost:** medium; content breadth
   and coherence testing dominate later.

6. **How much material and affordance state should ordinary props carry? — P5.6**

   **Decision authority:** mainly technical; Adam needs to confirm the intended physicality, not design every tag.

   **A — Continuous miniature physics:** every bottle, drawer, and chair continuously simulates mass, heat, moisture,
   combustion, support, and damage. It pursues literalism at prohibitive CPU, authoring, persistence, and QA cost.

   **B — Sparse capability/state grammar evaluated on demand:** canonical props declare only relevant construction,
   contents, attachment, mobility, and capability tags; interactions add discrete states such as wet, leaking,
   burning, embedded, powered, blocked, or exhausted. An oil barrel need not simulate molecules, but when pierced it
   can produce a conserved leak and a flammable surface. Normal maps and material effects project the state; they do
   not decide it. The DM seat reasons from the same tags and committed receipts.

   **C — Prose-only physicality:** the provider decides whether something burns, breaks, or spills each time. This is
   flexible but unstable and can contradict prior rulings or the visible board.

   **Recommendation: B.** Prototype a tiny vocabulary on a barrel, light, door, and movable furnishing; MVP covers
   common dungeon improvisation with event-driven state; ideal expands tested material combinations and systemic
   propagation under Wave 8. **Cost:** low-medium narrowly, very high if breadth outruns evidence.

7. **When is a container a real inventory rather than dressing? — P5.7**

   **Decision authority:** meaningful product/economy decision; storage details are technical.

   **A — Every container has a full inventory:** every drawer, sack, shelf, corpse, and barrel is an individually
   rolled loot surface. This is exhaustive but creates search chores, save bloat, and retroactive treasure pressure.

   **B — Tiered container truth:** unique consequential holdings have exact identity and custody; fungible stock uses
   a conserved bounded envelope; interchangeable clutter may remain one aggregate search surface. Opening a named
   evidence chest reveals its exact seeded contents; searching routine kitchen drawers spends from a bounded kitchen
   holding rather than minting independent loot. Once discovered empty, a container stays empty unless a real owner
   replenishes it. The DM seat can expose which tier answers the query.

   **C — Containers are visual until investigated:** the DM invents plausible contents on demand. Fast, but player
   attention becomes a loot generator and prior absence has no force.

   **Recommendation: B.** Prototype one exact container, one fungible holding, and one aggregate clutter surface;
   MVP adds custody/depletion/search receipts across a small site; ideal supports logistics, replenishment, faction
   ownership, hidden compartments, and broad persistent economies. **Cost:** medium; ideal economy breadth is high.

8. **When may attention or DM synthesis make dressing mechanically real? — P5.8**

   **Decision authority:** important AI-DM authority and player-trust call.

   **A — Seed every possible detail eagerly:** all loose nails, iron pins, curtain rods, and shards exist before play.
   This maximizes prior canon but is combinatorially expensive and still cannot anticipate every sensible question.

   **B — Bounded latent causal envelope plus transactional promotion:** an abandoned cart may reserve finite plausible
   salvage classes, exclusions, and capacity. If the player asks for a loose iron pin, the DM proposes one; a neutral
   validator checks culture/material/history, space, prior evidence, holdings, exclusions, and remaining capacity;
   acceptance creates a stable noun/state/provenance receipt. Failure is explained honestly or offers a lawful
   substitute. Attention discovers or resolves bounded possibility—it does not receive retroactive convenience.

   **C — Free provider improvisation:** if the detail sounds plausible, narration makes it true. This is responsive
   but gives different providers different mechanical worlds and makes contradictions difficult to repair.

   **Recommendation: B.** Prototype with explicit latent slots and deterministic validation, not autonomous prose;
   MVP permits a narrow provider-neutral proposal/validation transaction; ideal supports rich physical improvisation
   with conserved capacity, contradiction repair, and strong receipts. **Cost:** medium-high and safety-critical.

9. **Who owns moving, using, damaging, and exhausting a prop? — P5.9**

   **Decision authority:** mostly an architecture boundary; the desired consequence depth is a product call.

   **A — Send every change to universal environment simulation:** tipping a table and collapsing a load-bearing
   column use the same broad system. Conceptually pure, but it makes ordinary interaction wait for Wave 8.

   **B — Local assembly/prop transaction with explicit escalation:** opening a chest, moving a chair, consuming fuel,
   tipping a table, or exhausting a winch commits local state, custody, position, and affordance receipts. If the
   tipped table blocks the only door, a dependency check updates circulation; if damage threatens structure,
   topology, fire propagation, or broad support, the transaction escalates to Wave 8's owner. The DM seat narrates
   only the committed result and dependencies.

   **C — Narrative change until a major scene:** the DM says the table moved, but canonical position and later pathing
   may not change. Cheap, but it makes physical improvisation cosmetic.

   **Recommendation: B.** Prototype open/move/consume plus one doorway-block dependency; MVP adds common local
   mutations and stable receipts; ideal connects a broad action grammar to structural, fire, support, topology, and
   economy owners without duplicating them. **Cost:** medium narrowly, high integration cost later.

10. **How should a canonical prop survive missing or imperfect art? — P5.10**

    **Decision authority:** visual/product quality matters; fallback selection mechanics are technical.

    **A — Require an exact bespoke asset:** a culture-specific shrine or damaged bed cannot appear until its final
    sprite/model exists. This protects fidelity but blocks procedural breadth and no-budget iteration.

    **B — Semantic realization contract with deterministic admitted fallbacks:** canonical identity and mechanics
    bind first to semantic slots such as footprint, scale, orientation, access face, state, material family, culture
    imprint, and silhouette role. Realization tries an approved exact sprite/model, then compatible kit composition,
    faced box/card, and finally an honest labeled marker. Generative art and procedural material mutation may fill
    exact slots later without changing the noun or save. The DM seat knows the canonical prop and the current visual
    fidelity tier; it never infers mechanics from prettier art.

    **C — Generic art or prose substitution:** show any bed-like object or mention it only in narration, without an
    explicit compatibility/fallback receipt. Fast, but scale, state, and interaction readability drift.

    **Recommendation: B.** Prototype one bed/chest/shrine across exact and fallback tiers on the MacBook Pro; MVP
    requires deterministic manifests, state readability, and honest fallback for the narrow corpus; ideal adds the
    no-human generative foundry, procedural culture identity, material variants, damage/state families, and broad
    admitted assets. **Cost:** medium for the contract, very high for ideal asset breadth—but it can grow with funding.

**Recommended slate:** Option **B** for all ten. Questions **1, 4, 5, 7, 8, and 10** benefit most from Adam's taste or
trust judgment. Questions **2 and 9** need confirmation of the product behavior but not low-level schema design.
Questions **3 and 6** are legitimate technical defaults that can be accepted provisionally and tuned through the
clay corpus. Nothing in this batch commits ideal breadth to the prototype or MVP.

Wave 5 remains **OPEN**. No answer above is accepted until Adam responds, and P5.11-P5.12/G5.1-G5.2 remain queued.

### 14.3 Adam's first-batch response, recovered authorities, and amended dispositions

Adam answers:

> 1. we did some research on procedural furnishings, that might be of use here, but yes essentailly I want a recipe library for the most common room types and a plan for rooms that don't fall into those categories, we'll start with the 12 sites for this choosing the smallest and easiest and decide what to do with the props for that, some will be legit 3d, some will be sprite extrusions, most will probably be primitives with a solid material applied
> 2. B is good
> 3. B we most definitely start with the basic geometry before we get any furniture in the rooms at all, and then i think we will visit each of the 12 golden sites and make determinations on scope by judgements about those rooms, those scope decisions should define the rest of the game's scope after that
> 4. B
> 5. what is C style material mutation? the cultural overlay? B sounds good otherwise
> 6. B
> 7. yeah, we have made rulings on this already, please find that
> 8. B, but C for the prototype
> 9. B
> 10. B

#### Procedural-furnishing research recovered for P5.1/P5.3

The indexed local research is genuinely applicable and already points in Adam's requested order:

- Yu et al. and Merrell et al. treat circulation, access/clearance, visibility, door-to-door paths, pairwise
  orientation, alignment, focal emphasis, balance, and symmetry as whole-layout concerns rather than cleanup after
  furniture placement ([research sections 2.3-2.4](../../PROCEDURAL-DUNGEON-RESEARCH.md#23-circulation-as-generated-geometry)).
- Green et al. explicitly support architecture and furnishing as separate staged generators whose contracts remain
  connected ([section 2.6](../../PROCEDURAL-DUNGEON-RESEARCH.md#26-architecture-and-furnishing-as-separate-generators)).
- Henderson et al. provide a later learned-prior/rejection-sampling option for class, count, position, orientation,
  motif, abutment, and traversability. The accepted research synthesis explicitly says it is **not** Genesis's first
  move; structured representation and validity tests come first.
- The current `ROOM-GRAMMAR.md` recipes—shop, shrine, library, barracks, crypt, throne room, and camp—and ALIGN,
  RHYTHM, PAIR, ROW, FLANK, FOCAL, and CLEAR vocabulary remain useful recipe/compiler inputs.
- Current implementation already contains six renderer-only multi-prism recipes—crate, cabinet, barrel cluster,
  table, bench, and shelf unit. They are implementation evidence and possible primitive building blocks, not the
  canonical functional recipe library: current realization may choose one of them as a seeded silhouette beneath a
  generic blocker noun and cannot prove room purpose, access, or assembly obligations.

The research therefore supports the accepted Option B without deciding that Genesis needs a particular optimizer.
The retained first implementation order is:

```text
canonical room purpose and obligations
  -> basic shell, elevations, portals, reservations, and circulation in clay
  -> one selected functional assembly recipe and lawful placement/degradation
  -> primitive/sprite-extrusion/full-3D realization chosen from semantic needs
  -> gameplay-scale and provider-neutral DM-seat proof
  -> retain the fixture; admit the next golden site only for a named uncovered risk
```

The existing one-small-room Clay Proof law and Adam's twelve-site instruction are compatible. The first retained
room should belong to or explicitly represent the smallest suitable named golden-site case; Genesis does not build
all twelve sites up front. Each later site becomes a scope tribunal: only furniture families, realization tiers,
relations, and mechanics actually required to make that site honest enter the supported slice. After the twelve
retained sites pass, their accumulated breadth defines the proved game scope rather than a speculative universal
furniture catalog.

For a room outside the common recipe library, the intended fallback is not random generic furniture and not a
provider-authored prefab. Its `RoomProgram` supplies purpose, operating obligations, occupants, current use,
history, culture/material constitution, geometry, and reservations. The compiler assembles the closest lawful
solution from reusable micro-assemblies and relations, records substitutions/degradation, or reports an unsatisfied
room program. A later accepted room can become a named reusable recipe; one-off rooms can remain a traced composed
result without forcing a permanent bespoke category.

#### Earlier container/search/custody rulings recovered for P5.7

P5.7 is not a fresh principle decision. Its local Option B is the Wave 5 projection of already accepted laws whose
letters differed in their original questionnaires:

1. **Wave 1 section 8.13.2:** optimal play must not become inspection of every box, drawer, barrel, corpse, shelf,
   and cell. Search uses automatic room read -> focused inspection -> systematic sweep. Interchangeable containers
   normally form one assembly-level search surface; stable independent identity appears only when purpose, state,
   clue, inhabitant, resource record, history, Spice, or player action distinguishes an object. Repeated identical
   searches do not mint new rolls.
2. **Wave 1 section 8.13.3:** a systematic sweep produces a stable method-aware opportunity list. It finds routine
   facts the declared method can reveal without making concealed, locked, encoded, magical, social, or other gated
   truth automatically available.
3. **Wave 2 P2.16, accepted as its local Option C at section 10.SWEEP.2:** unique, plot, key, magic, limited, and
   relationship items commit exactly before reveal. Ordinary fungible supplies use owned bounded holdings/envelopes;
   their container/location allocation is committed before discovery and exact stable copies instantiate only when
   interaction requires them. Custody and quantity remain conserved, and catalog presence never creates inventory.
4. **Wave 2 section 10.11.3:** DM dressing improvisation may not refill exhausted surfaces or create treasure,
   topology, named evidence, or strategic advantages outside a prevalidated latent authority. Manipulable nouns
   require stable existence/legality/persistence and consequential promotion.

P5.7 therefore accepts B as an inherited consequence, not a new competing inventory model. Wave 5 still owns the
furniture-facing projection—what appears as a drawer, shelf, barrel, corpse, rack, hidden compartment, aggregate
surface, or exact container—but it may not redesign search, holdings, custody, or conservation.

#### “C-style material mutation” clarified for P5.5

The phrase meant the useful technique inside P5.5's rejected clone-plus-cosmetics Option C, not acceptance of that
whole option. **Material mutation is not itself the cultural overlay.** It is deterministic variation applied
beneath a stable prop/assembly identity: palette and material-instance parameters, restrained hue/value variation,
roughness, normal response, stains, discoloration, edge wear/grime masks, decals, ownership/repair marks, and minor
surface overlays. It changes how one admitted construction reads without silently changing its footprint,
affordances, owner, mechanics, or assembly relations.

The procedural cultural overlay is upstream and more semantic. A culture's constitution can select construction
logic, proportions, material families, motifs, trim/emblem language, joinery, maintenance norms, and permitted
variation ranges. Site history and current condition then drive wear, grime, repair, replacement, damage, and
occupation layers. Material mutation realizes part of that result cheaply. It cannot make six cloned semantic rooms
meaningfully different by itself, but it can multiply visible variation beneath accepted P5.5 Option B without a
new sprite for every state.

#### P5.8 prototype exception exposes an inherited-boundary collision

Adam accepts B as the ideal but requests C for the prototype. Literal P5.8 Option C—provider narration becoming
physical truth solely because it sounds plausible—would contradict the accepted Wave 2 section 10.11.3 ruling and
Adam's earlier requirement that an interim representation not be prose without mechanical state. It could also
create provider-dependent topology, loot, clues, or tactical conveniences and then lose them on reload.

The smallest compatible prototype can nevertheless **feel like C at the DM seat** without installing the ideal
latent-envelope validator. The provider may freely propose an ordinary room-appropriate detail. Before the detail
is presented as established or used mechanically, a tiny prototype authority records at least its stable assertion
id, class, quantity band, approximate location/support, apparent material/condition, ownership/access, and whether
it is merely observed or promoted. The prototype may use a human-reviewed fixture rule or a very small deterministic
allowlist instead of the ideal contextual reserve/validator. It cannot originate topology, scarce/valuable stock,
named evidence, required solutions, secrets, or high-Spice causes. Any action against it resolves through actual
mechanical state, and the assertion persists on revisit.

That is a **C-shaped prototype over a retained B seam**, not prose-only C. Adam's intended prototype exception must
be confirmed before P5.8's phased disposition is final.

#### First-batch disposition table

| Question | Current disposition |
|---|---|
| **P5.1** | Option B accepted with a common-room recipe library, obligation-driven fallback composition for uncategorized rooms, incremental twelve-site scope judgment, and the hybrid prop realization ladder |
| **P5.2** | Option B accepted |
| **P5.3** | Option B accepted; basic structural geometry/circulation precedes furniture, and each admitted golden site bounds the next supported breadth |
| **P5.4** | Option B accepted |
| **P5.5** | Option B accepted; material mutation is retained only as a subordinate visual-variation technique, with clarification confirmation pending |
| **P5.6** | Option B accepted |
| **P5.7** | Option B confirmed as inherited Wave 1/Wave 2 law rather than reopened |
| **P5.8** | Ideal Option B accepted; prototype exception pending confirmation of the C-shaped/B-seam reconciliation |
| **P5.9** | Option B accepted |
| **P5.10** | Option B accepted; first corpus may choose true 3D, sprite extrusion, or primitive-plus-material per semantic/readability need |

### 14.4 Generated material follow-ups before the second batch

These four short decisions are material consequences of Adam's answers. They must close before P5.11-P5.12/G5.1-
G5.2 advance.

1. **F5.1a — Which named golden-site case should anchor the first furnishing fixture?**

   **A — Small externally supplied guard post:** one small guard room can prove a workstation/observation post,
   rest/storage support, a portal/circulation spine, and a bounded supply holding without requiring a self-sustaining
   economy. It is the smallest option that still proves a room can function.

   **B — Small transient camp or service site:** fewer architectural obligations and easy movable primitives, but it
   tests an exterior/temporary assembly more than the interior room compiler.

   **C — Small dormant/abandoned place:** easiest to render sparsely, but missing operation can hide whether recipes
   actually satisfy function.

   **Recommendation: A.** Use one small guard-post room as the retained clay-to-furnished fixture, not the full site.
   Prototype cost is low-medium; the site grows only when a named risk requires it.

2. **F5.1b — What happens when a rolled room has no named library recipe?**

   **A — Nearest-recipe reskin:** choose the most similar room recipe and swap nouns. Cheap, but a laboratory can
   become a cosmetically renamed kitchen without its actual obligations.

   **B — Obligation-driven composition:** compile purpose, operators/occupants, current use, history, culture,
   geometry, and reservations into reusable micro-assemblies/relations; record lawful substitution, degradation, or
   explicit unsatisfied state. Promote a recurring successful pattern to the library only when evidence justifies
   it.

   **C — No furniture until a bespoke recipe exists:** honest but makes unusual rooms empty and turns the library
   into an authoring bottleneck.

   **Recommendation: B.** Prototype may support only a few micro-assemblies and loud failure; MVP grows from admitted
   golden-site needs; ideal supports broad procedural composition. Cost is medium narrowly, high at broad coverage.

3. **F5.5a — How should cultural identity and material mutation relate?**

   **A — Independent cosmetic randomization:** apply grime, color, decals, and wear without culture/history causes.
   Visually varied but semantically noisy.

   **B — Causally layered mutation:** culture chooses construction, material, motif, trim, and variation ranges;
   institution/site history/current condition choose repair, wear, grime, damage, replacement, and ownership layers;
   deterministic material mutation realizes those facts without changing mechanics.

   **C — Exact new art for every variation:** highest potential specificity and highest cost; unnecessary for most
   surface variation.

   **Recommendation: B.** Prototype uses solid/procedural material parameters and a few overlays; MVP adds admitted
   masks/decals/normals; ideal couples the generative foundry and culture constitution. Cost grows from low to high.

4. **F5.8a — What does “C for the prototype” authorize?**

   **A — Literal free provider canon:** a plausible narrated prop immediately exists with no state gate. This is the
   cheapest path but contradicts accepted persistence, provider-neutrality, and mechanical-state laws.

   **B — C-shaped UX, minimal B authority:** the provider freely proposes ordinary dressing, while a tiny allowlist
   or human-reviewed fixture step commits minimum identity/location/material/ownership/state before establishment or
   action. No ideal latent-envelope solver is required yet; forbidden high-impact classes remain blocked.

   **C — Full ideal B immediately:** build the contextual latent reserve, validator, transactions, persistence, and
   projection path in the prototype. Honest but far too broad for the first proof.

   **Recommendation: B.** It preserves the fast improvisational feel Adam wants while ensuring the prototype is not
   prose with no mechanical state. Cost is low-medium for the bounded fixture and high only when promoted.

Wave 5 remains **OPEN**. P5.11-P5.12/G5.1-G5.2 remain queued until F5.1a/F5.1b/F5.5a/F5.8a are answered.

### 14.5 Generated follow-ups accepted — culture arrivals and evidence-gated DM breadth

Adam answers:

> 1. A
> 2. B
> 3. B - we can also build culture rollers to help determine this stuff, that way it isn't pure material invention there can be an index of arrival textures/colors etc...
> 4. tiny allowlist at first until we can get the DM seat to prove itself. if the DM seat can prove itself then we can open up broader improvisation for the DM

All four generated follow-ups close:

1. **F5.1a — Option A accepted.** The first furniture fixture is one small room belonging to or explicitly
   representing the **small operating externally supplied guard-post** golden-site case. It extends the retained
   clay fixture; it does not require building the entire guard post or a second test-only room pipeline.
2. **F5.1b — Option B accepted.** Uncatalogued rooms compose from obligations, reusable micro-assemblies, relations,
   and legal substitutions/degradation before recurring proved patterns earn named recipes. Nearest-recipe reskinning
   and provider-authored repair remain rejected.
3. **F5.5a — Option B accepted and extended.** Culture, site history, and condition causally drive material mutation.
   A culture roller and admitted arrival index prevent arbitrary material invention.
4. **F5.8a — Option B accepted.** The first prototype exposes a C-shaped improvisational experience through a tiny
   allowlist while retaining minimum identity, location/support, material/condition, ownership/access, state,
   persistence, and mechanical resolution. Broader improvisation is promotion-gated by DM-seat evidence.

#### Culture rollers consume admitted arrival indices; they do not invent a second culture authority

Wave 3 section 12.7-12.8 already accepted the exact upstream owner Adam is describing:

```text
causal culture/world facts + bounded rolls
  -> persisted CultureVisualConstitution
  -> typed SiteCultureImprint by builder/occupant/repairer/trader/epoch
  -> furniture/material/motif obligations
  -> admitted arrival indices and procedural parameter ranges
  -> deterministic realization, receipt, and fallback
```

Wave 5 therefore does not create an independent furniture-culture roller. It adds furniture-facing outputs to the
accepted constitution. A conceptual `CultureMaterialArrivalIndex` may enumerate admitted texture/material families,
palette/value-role ranges, motif/trim operators, construction/joinery families, repair and wear behaviors, decal/
normal/roughness capabilities, compatible prop roles, realization tiers, exclusions, hashes/provenance, and honest
fallbacks. The culture roller selects or parameterizes within those indexed arrivals according to causal culture
facts and bounded rolls. Site history then layers occupation, replacement, damage, repair, grime, and ownership.

An arrival index may point to a solid/procedural material, Material Maker graph/output, sprite-extrusion surface,
trim/decal/mask family, generated admitted payload, or compatible primitive/full-3D asset. New generated art can
fill a real uncovered slot after admission; its mere existence cannot retroactively change a culture constitution.
This preserves recognizable procedural identity while preventing pure per-room material invention.

#### “The DM seat proves itself” is a system gate, not unconditional provider trust

The promoted object is the **provider-neutral DM-seat protocol**—proposal schema, bounded authority, validator,
commit/reject transaction, canonical state, projection, persistence, and fallback—not one provider or model's
reputation. Breadth expands one affordance/object class at a time only after retained traces show:

- same canonical scene, proposal class, and seed produce the same accepted assertion or rejection across reload and
  supported-provider phrasing variation;
- synonymous/repeated queries inspect the same finite opportunity and cannot refill the allowlist or mint variants;
- a manipulable noun is never presented as established before its minimum assertion commits;
- rejected, late, missing, or invalid proposals produce an honest fiction-first fallback without narrating success;
- accepted details preserve stable identity, location/support, quantity band, material/condition, ownership/access,
  observer knowledge, and touched state through pickup, use, damage, depletion, revisit, save/load, and projection;
- no proposal class creates topology, scarce stock, treasure, named evidence, required solutions, secrets, or high-
  Spice causes outside their existing owners;
- the BattleMat, inspector/accessibility path, canonical event record, and DM/fallback narration agree; and
- false acceptance, false rejection, correction burden, latency, save/digest growth, and provider variance are
  recorded rather than hidden. Exact numeric promotion thresholds remain Wave 11/12 evidence work.

Passing one class admits the next bounded class; it does not unlock universal free invention. The prototype may
start with ordinary fixture-specific items such as a stool, rag, cup, loose paper, or mundane tool compatible with
the guard room. The ideal still offers broad conversational improvisation, but every consequential result stays
under canonical validation and mechanical state.

### 14.6 Remaining Wave 5 batch — P5.11-P5.12/G5.1-G5.2

1. **How should active props and visual clutter be budgeted? — P5.11**

   **Decision authority:** mainly technical, with later taste judgment on whether retained rooms feel rich enough.

   **A — One fixed object count per room:** every room receives the same cap regardless of size, purpose, device,
   focal hierarchy, or interaction. Easy to reason about, but a cell and warehouse use the budget badly.

   **B — Tiered semantic budget with truthful aggregation:** separately budget full interactables, exact visible
   canonical props, latent promotable slots, containers/search surfaces, collision bodies, assembly members, and
   nonmechanical visual dressing. Protect required facts, circulation, focal hierarchy, and touched/promised state;
   aggregate or visually reserve distant/interchangeable matter without erasing its canonical holding. In the guard
   room, the door, lantern, desk/workstation, weapon rack, and any touched stool may be exact while loose papers,
   shelf stock, and repeated cups use bounded surface/holding representation until attention promotes them.

   **C — Realize every named item independently:** richest literal scene, but mesh/draw/save/context and search-noise
   costs scale with narration.

   **Recommendation: B.** Prototype measures one guard room without freezing arbitrary universal counts; MVP sets
   outcome-named budgets from retained Mac evidence; ideal supports scale/device-aware aggregation and promotion
   without semantic loss. **Cost:** medium architecture/measurement work; tuning continues with the corpus.

2. **What evidence proves Wave 5 rather than merely showing attractive furniture? — P5.12**

   **Decision authority:** the evidence structure is technical; Adam judges actual gameplay-scale composition and
   whether room function/culture read correctly.

   **A — Screenshot review:** capture a few furnished rooms and approve their look. Useful for taste, but it cannot
   prove obligations, search, persistence, fallback, or mutation.

   **B — Incremental retained functional corpus:** begin with the small guard-post room in clay, then compare its
   furnished, touched, fallback, reload, and DM-seat forms under one canonical envelope. Prove recipe satisfaction,
   clearance/circulation, meaningful emptiness, exact-versus-aggregate containers, culture arrivals, deterministic
   variation, one promoted allowlist prop, local mutation, honest degradation, Mac budget, and provider/fallback
   parity. Admit later golden sites one at a time only for uncovered room-family, density, culture, state, scale, or
   interaction risks; accumulate toward all twelve rather than building them at once.

   **C — Require all twelve sites before judging the system:** broad evidence, but delays learning and confounds many
   failures in one giant milestone.

   **Recommendation: B.** Prototype is one retained room and adversarial traces; MVP accumulates representative
   supported breadth; ideal reaches the twelve-site/eight-transition destination plus statistical/property and
   funded human evidence. **Cost:** low-medium first fixture, high total corpus investment grown incrementally.

3. **How does touched dressing gain physical state without simulating everything? — G5.1**

   **Decision authority:** mostly technical, provided the result supports honest player improvisation.

   **A — Dressing remains stateless until converted into a heavyweight object:** cheap for untouched scenes, but a
   spilled cup, wet rag, scorched paper pile, or embedded axe can vanish or require a discontinuous identity swap.

   **B — Event-driven lightweight assertion and promotion:** untouched interchangeable dressing stays aggregate or
   re-derivable. Touch creates or resolves a stable assertion under its assembly/search surface with only relevant
   identity, location/support, quantity, material/capabilities, state, custody, and provenance. States such as wet,
   leaking, burning, chilled, embedded, blocked, powered, or exhausted change only through typed events; the same id
   promotes to a full interactable if tactics, inventory, damage, promises, or cross-scene persistence require it.
   The guard-room ink spill can wet the desk's paper surface and exhaust the ink holding without creating a physics
   entity for every sheet.

   **C — Continuously simulate every visible dressing item:** maximally systemic and financially/technically
   disproportionate.

   **Recommendation: B.** Prototype uses a tiny state vocabulary on one surface and one movable prop; MVP covers
   common dungeon interactions; ideal connects broader material reactions to Wave 8 without changing ownership.
   **Cost:** medium cross-system work narrowly, high only as the interaction vocabulary expands.

4. **How does the allowlist grow into broader validated DM improvisation? — G5.2**

   **Decision authority:** this is the material trust boundary implied by Adam's DM-seat promotion condition.

   **A — Keep a permanent authored allowlist:** safe and predictable, but eventually too rigid for a tabletop-style
   DM and unusual cultures/rooms.

   **B — Evidence-gated contextual class expansion:** the prototype allows a few ordinary guard-room classes. Once
   the full proposal -> validate -> commit/reject -> narrate -> use/mutate -> revisit/reload trace passes the gates
   in section 14.5, add a bounded contextual class/reserve with explicit capacity, exclusions, properties, and
   fallback. Repeat class by class across retained sites. The DM gains broader freedom to select, combine, and
   describe lawful details, while the engine continues to own existence, mechanics, custody, exhaustion, and
   persistence.

   **C — After a good pilot, trust the provider to establish any plausible ordinary object:** maximizes freedom but
   abandons provider neutrality and recreates synonym, convenience, contradiction, and save-state failures.

   **Recommendation: B.** Prototype is the tiny allowlist Adam selected; MVP has several proved contextual classes;
   ideal feels broadly improvisational while remaining transactionally validated. **Cost:** low-medium per narrow
   class, high cumulative ontology/fixture work, promoted only by demonstrated play value.

Wave 5 remains **OPEN**. P5.1-P5.10 and F5.1a/F5.1b/F5.5a/F5.8a now have accepted dispositions. P5.11-P5.12/G5.1-
G5.2 await Adam's answers; any material responses they generate must be resolved before the closure audit.

### 14.7 Remaining batch accepted — tiered budgets, retained corpus, touched state, and class promotion

Adam accepts Option B across the remaining batch:

> 1. B
> 2. B
> 3. B
> 4. B

The accepted dispositions are:

1. **P5.11:** use tiered semantic budgets for full interactables, exact visible props, latent promotable slots,
   containers/search surfaces, collision bodies, assembly members, and optional visual dressing. Required, touched,
   promised, circulation, and focal truth is protected; only interchangeable representation aggregates. Exact counts
   remain measured Mac/corpus tuning rather than a universal design number.
2. **P5.12:** begin with one retained small guard-post room and compare clay, furnished, touched, fallback, reload,
   and DM-seat forms under one canonical envelope. Admit later golden sites only for named uncovered risks and grow
   toward the twelve-site/eight-transition destination rather than making it an up-front batch.
3. **G5.1:** untouched interchangeable dressing may remain aggregate or re-derivable. Touch creates/resolves a
   stable lightweight assertion with only relevant identity, location/support, quantity, material/capabilities,
   state, custody, and provenance; the same id promotes when tactics, inventory, damage, promises, or persistence
   require it. Typed events own state; Wave 8 owns broad propagation.
4. **G5.2:** the tiny prototype allowlist grows through evidence-gated contextual class/reserve admission. The DM
   gains wider lawful selection, combination, and performance; the engine continues to own existence, mechanics,
   custody, exhaustion, persistence, validation, and rejection.

No new founder-choice question is generated by these answers. Exact budget values, state/tag vocabulary, candidate
scores, provider pass thresholds, and later fixture order are technical evidence/specification work under accepted
behavior. They cannot be answered responsibly before the retained guard-room and provider traces exist.

### 14.8 Generated-follow-up, coverage, contradiction, and phasing audit — ready for explicit closure decision

#### Generated material follow-ups

All generated material branches are exhausted:

- **F5.1a** selects the small operating externally supplied guard-post case for the first room fixture;
- **F5.1b** gives uncatalogued rooms obligation-driven micro-assembly composition plus traceable degradation/failure;
- **F5.5a** binds culture-driven material mutation to Wave 3's persisted constitution and admitted arrival indices;
  and
- **F5.8a** uses a tiny prototype allowlist with minimum mechanical assertion and class-by-class evidence promotion.

The remaining implementation questions are bounded and assigned rather than hidden: exact recipe schemas, socket/
relation vocabularies, density parameters, prop/state catalogs, visual-tier rules, clutter budgets, provider
thresholds, and corpus measurements belong to later specification, retained captures/play, Wave 11 workbench, and
Wave 12 release/migration gates. They do not alter the accepted behavior or require present taste rulings.

#### Original/additive coverage

| Family | Disposition |
|---|---|
| **P5.1** | Hierarchical functional assemblies with explicit roles/relations/state/provenance; F5.1a selects the first guard-room fixture and F5.1b supplies uncatalogued-room composition |
| **P5.2** | Function, history/evidence, tactics/interaction, and optional dressing remain explicit layers; multi-role objects declare every satisfied role |
| **P5.3** | Architecture/circulation commits first; typed sockets, support, orientation, access, clearance, visibility, and shared reservations govern furniture |
| **P5.4** | Causal semantic density profiles preserve meaningful sparse/crowded/stripped/ceremonial/ruined/empty rooms, circulation, and focal hierarchy |
| **P5.5** | Parent assembly constitutions produce caused child variation; F5.5a adds culture/history/condition-driven material mutation without clone semantics |
| **P5.6 + G5.1** | Sparse relevant capabilities and typed event-driven touched states replace continuous simulation while preserving identity and Wave 8 escalation |
| **P5.7** | Wave 5 projects inherited exact unique custody, bounded fungible holdings, finite aggregate search surfaces, stable depletion/emptiness, and method-aware closure |
| **P5.8 + G5.2** | Bounded proposal/validation/commit authority protects canon; F5.8a starts with a tiny allowlist and admits broader contextual classes only through provider-neutral evidence |
| **P5.9** | Local prop/assembly transactions own ordinary movement/use/state; affected circulation/dependencies update and structural/topological/propagating change escalates to Wave 8 |
| **P5.10** | Stable semantic slots deterministically choose admitted full-3D, sprite-extrusion, primitive/material, faced-card, or marker tiers without changing identity/mechanics |
| **P5.11** | Tiered semantic budgets protect required/touched/promised truth and aggregate only interchangeable visual/collision/context cost; numeric values wait for evidence |
| **P5.12** | One retained guard room first; later golden sites enter by uncovered risk and accumulate toward the accepted twelve-site/eight-transition corpus |

#### Authority and contradiction audit

- Wave 5 is the detailed furnishing/dressing authority but does not fork Wave 1 search, Wave 2 holdings/custody,
  Wave 3 geometry/culture/material, Wave 4 circulation/secret, Wave 8 propagation, or Wave 10 projection/performance/
  accessibility/provider law.
- The indexed furniture research supports architecture-before-furnishing, explicit hard/soft constraints,
  circulation as planned geometry, candidate comparison, and staged generation. It does not choose an optimizer,
  authorize a learned solver, or solve Genesis's AI-DM canon policy.
- The first guard room extends the one-small-room Clay law rather than requiring a whole golden site. Each later
  retained site bounds additional recipe/prop/interaction scope; passing all twelve demonstrates accumulated
  pre-alpha/system breadth, not automatic release readiness.
- The Wave 3 culture constitution remains the sole culture owner. Furniture consumes its causal rolls, site
  imprints, admitted arrival indices, and history layers; it cannot invent or repaint culture independently.
- Literal prototype Option C prose authority remains rejected. The accepted C-shaped experience uses a tiny
  allowlist and minimum mechanical assertion before establishment. “DM-seat proof” evaluates the full provider-
  neutral protocol and expands bounded classes; it never makes one model a mechanics or canon owner.
- The current renderer's six multi-prism furniture recipes, deterministic dressing roster, partial room grammar,
  interactable binding, and projection reserve are useful implementation evidence. Their generic silhouette choice,
  separate occupancies, limited grammar scope, and approximate capacity cannot be mistaken for accepted Wave 5
  completion.

#### Phasing and traceability audit

The proposed [Wave 5 phasing audit](PHASING-AUDIT.md) distinguishes the smallest proofs from playable MVP and ideal
breadth. The Clay Proof Ladder gains two retained Stage 1 passes:

- **C1J** furnishes one small externally supplied guard room after clay geometry, proving one functional assembly,
  shared placement legality, explicit layers, density/degradation, culture-indexed realization/fallback, one exact
  container allocation, one aggregate search surface, Mac capture, and provider-neutral DM facts; and
- **C1K** proves one accepted, one rejected, and one synonym-safe allowlisted physical-detail proposal, then carries
  minimum assertion and one touched state through real use, projection, custody, revisit, save/load, and fallback.

The Feature-Promotion Ledger now has explicit rows for functional assemblies/density/repetition, container/search/
holdings projection, touched dressing/local mutation, evidence-gated DM physical improvisation, and culture-aware
realization/budgets. C3A/C3C grow representative operating/repeated/cultural breadth; C2C/C2D prove cross-room/mode
state continuity; C4B retains validated invention/custody; C5/Waves 11-12 own the accumulated corpus, workbench,
measurements, migrations, and release gates. Wave 8 retains broad destruction and propagation.

Every P5.1-P5.12, G5.1-G5.2, and F5.1a/F5.1b/F5.5a/F5.8a question therefore has a phased disposition and no
accepted ideal is mapped only to anonymous `later` work. Wave 5 remains **OPEN solely pending Adam's explicit
closure agreement**. No implementation, dependency admission, worktree, LFS operation, CI, merge, or push is
authorized.

### 14.9 Explicit Wave 5 closure — advance to Creature Scale, Capacity, Squeezing, and Party Participation

Adam explicitly closes Wave 5:

> "yes, let's close and move to the next wave"

Wave 5 is **CLOSED** on the complete phased basis audited in section 14.8. This closure means its design questions
and generated material follow-ups have accepted dispositions, retained proof/MVP/ideal mappings, named later owners,
and promotion triggers. It does **not** claim implementation, dependency admission, passing evidence, CI, release
readiness, or completion of the broader procedural-dungeon redesign.

The questionnaire advances to **Wave 6 — Creature Scale, Capacity, Squeezing, and Party Participation**. Wave 6
inherits Wave 5's assembly, container, touched-state, and validated-improvisation truth; it may refine who fits,
occupies, reaches, carries, witnesses, participates, or changes form without making renderer scale, party prose, or
aggregation overwrite canonical identity and location. No build is authorized.
