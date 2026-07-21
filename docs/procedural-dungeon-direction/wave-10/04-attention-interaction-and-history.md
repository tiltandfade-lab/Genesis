---
type: design-study
status: OPEN
wave: 10
part: 4
legacy_sections: "11.42-11.56"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 10 — Attention, Interaction, and History

<!-- BEGIN VERBATIM MIGRATION: original lines 19056-20557 -->

### 11.42 F10.7a ruling and F10.7b expansion - restrained attention ladder accepted provisionally; bound visible history without erasing it

**Adam's ruling (2026-07-20):** choose Option B, with playtesting required.

> "This is a real fork in the design. I guess Disco Elysium kind of had B, so we'll go B. it will require some playtesting though"

The SceneTray therefore uses the restrained `ambient -> noticed -> relevant -> active -> historical` attention
ladder from section 11.41. Ordinary legal representations do not shimmer merely because an interaction exists.
Noticed/known state exposes only viewpoint-earned physical or sensory evidence. Context may strengthen an already
known tell when it becomes relevant. Strong outlines, rings, labels, paths, areas, or icons are reserved for active
selection/targeting, urgency, a player-invoked scan, or an equivalent attention aid. Changed places ordinarily
remember through their current physical state and residue rather than permanent completion UI. Missing bespoke art
uses the truthful marker/card/fallback lane and never makes a known interactable disappear.

This is a **provisional visual-language ruling**, not a claim that the five-state separation is already readable in
play. The future F10.7a playtest must include at least:

1. a dense room containing ambient dressing, several known interactables, one currently relevant mechanism, one
   active selection, and several old physical consequences without turning into an outline/icon field;
2. an undiscovered secret panel, a suspected panel with scratches/draft but no revealed-door cue, and a fully
   discovered panel, asking players what they believe is known at each stage;
3. an active known hazard beside a hidden hazard, proving that the former is unmistakable and the latter does not
   leak through glow, focus order, camera behavior, empty UI space, or scan results;
4. the same known object through physical, marker/card, and missing-art fallback representations;
5. click, keyboard/controller focus, player-invoked known-interactable scan, non-color/non-audio equivalents, and
   reduced-motion presentation as attention-specific checks; broad supported-device and accessibility-tier law
   remains owned by P10.10;
6. first visit, action, immediate aftermath, and later revisit, asking players to identify what can be used now,
   what changed, what is merely old evidence, and what remains unknown.

Reopen F10.7a if players routinely miss known useful objects, infer secrets from missing highlight language, mistake
historical residue for a current action prompt, require repetitive Gemini narration to operate the board, or find
that the scan/accessibility treatment recreates the same glow clutter Option B was selected to avoid. F10.7a closes
provisionally behind this playtest obligation.

#### F10.7b - when a place remembers many events, what must stay physically visible and what may be summarized?

In plain English: Genesis may preserve years of canonical world history, but one room cannot accumulate an
individually rendered decal, shard, footprint, dropped fragment, and UI marker for every event forever. Which
changes must remain visible as themselves, which minor residues may combine or become less prominent, and what may
age or disappear only because the world actually changed rather than because the renderer ran out of room?

- **Option A - mount every surviving trace literally and individually:** every blood drop, arrow, footprint,
  splinter, scorch, spill edge, broken fragment, dropped object, and prior interaction residue remains a separate
  visible citizen until a canonical cleanup or repair removes it. This maximizes literal continuity but eventually
  makes an old room illegible, expensive to render, and difficult to compose; the important Varka message or live
  oil hazard can disappear inside a museum of equally emphasized debris.
- **Option B - canonical history ledger plus a layered, bounded physical projection (recommended):** preserve the
  complete causal history and all still-consequential state in canonical owners/receipts. The board always mounts
  current mechanical state, identity-bearing objects, active hazards, topology, protected evidence, and meaningful
  scars. Repeated low-consequence homogeneous residue may coalesce into deterministic stain/debris/track fields or
  representative clusters while retaining its contributing causes. Age, cleaning, repair, weathering, decay, or
  removal occurs only through canonical world processes. Less salient known history remains available through the
  relevant object/place history and can be projected again if it becomes consequential.
- **Option C - keep current state and move most aftermath into narration/history cards:** after the immediate scene,
  retain open/broken/on/off object states and active mechanics but remove most stains, debris, tracks, and other
  residue from the board. Gemini and an inspection chronicle explain what happened. This is visually clean and
  cheapest to render, but revisited places feel reset, physical investigation becomes prose-dependent, and the game
  loses much of G10.2's promise that the world itself remembers.

Under Option B, **bounded projection never means bounded truth**. A semantic priority law decides representation:

1. **Current mechanical/topological truth stays explicit:** a blocked opening, broken door, moved cover, live fire,
   slippery oil, unsafe floor, available container state, occupied mount, or traversable route cannot be culled or
   visually merged into a different fact.
2. **Identity, custody, evidence, and promised callbacks stay individuated while material:** the dropped turtle
   communicator, a named weapon, Varka's scratched message, a murder trail, or an owed quest object cannot become
   anonymous clutter. A trace needed to formulate or prove an action is protected even when visually small.
3. **Only genuinely interchangeable low-consequence residue may coalesce:** seventeen anonymous blood flecks may
   render as one seeded stain field; many non-retrievable splinters may become a debris patch; repeated soot may
   deepen one scorch region. Distinct directions, owners, items, timing, or evidentiary meanings forbid a merge.
4. **Aging is world state, not an LOD trick:** blood darkens, tracks soften, remains decay, plants reclaim rubble,
   or custodians clean only when time, material, exposure, ecology, weather, labor, magic, repair, or another named
   owner licenses the transition. Lower visual detail may simplify a representation, but it cannot secretly clean
   the room or make Gemini forget what occurred.
5. **Projection is reversible and viewpoint-safe:** canonical contributors, state, provenance, and learned history
   survive coalescence. Inspection can expose the fuller known account, and a later mechanic can remount a relevant
   fact. Unknown causes or identities remain hidden even when their perceptible residue is visible.

Concrete dungeon/Gemini-DM example: after a fight in the prison gatehouse, the shattered gate, looted open chest,
extinguished brazier, still-slippery oil spill, dropped turtle communicator, and Varka's scratched warning remain
distinct because they affect topology, interaction, custody, danger, or evidence. Anonymous blood droplets and
splinters may render as seeded stain and debris fields whose ledger retains the fight's contributing receipts. A
directional blood trail cannot coalesce into generic grime while it is an investigatory handle. Days later Gemini
may describe old dark blood only if elapsed time and material behavior aged it; rain may wash exposed prints,
workers may clean the floor, and repairs may replace the gate only through committed world changes. Returning to a
lower-detail view may simplify the stain, but it cannot perform any of those events.

This also bounds AI invention. If Gemini narrates that survivors clean the gatehouse, the action must be validated
against time, actors, access, tools, obligations, and existing trace state before cleanup receipts change the
projection. Gemini cannot erase an inconvenient clue in prose, and the renderer cannot preserve a contradiction by
showing a pristine wall after canonical damage.

**Implementation/maintenance cost:** Option A is **very high recurring render/composition/QA cost** plus permanent
clutter growth. Option B is **high foundational but bounded systems work**: trace classes, consequence/evidence
priority, canonical contributor lists, deterministic coalescence, aging/cleanup/repair owners, reversible
projection summaries, remount rules, knowledge filtering, and long-revisit fixtures. Its recurring content cost is
medium because reusable residue families and honest card/marker fallbacks cover invented nouns. Option C is low
renderer cost but medium-high recurring Gemini/context/history-UI burden and weak physical continuity. Exact
frame/memory limits and device quality tiers remain P10.10; F10.7b chooses the semantic retention law they may not
violate.

**Codex recommendation: Option B.** It keeps Genesis's world history exact and available while allowing the visual
scene to compose old consequences into readable material history instead of either glowing everything or silently
resetting the room.

Does Adam accept Option B, prefer literal permanent accumulation under Option A, prefer chronicle-first cleanup
under Option C, or want to amend which facts are protected from coalescence? Follow every material durability,
aging, cleanup, evidence, and remount branch before advancing beyond P10.7. Wave 10 remains **OPEN**; no build is
authorized.

### 11.43 F10.7b ruling and F10.7c expansion - bounded projection never bounds truth; choose trace-lifecycle authority

**Adam's ruling (2026-07-20):** choose Option B.

The complete causal history and all still-consequential state remain canonical even when the SceneTray does not
mount every minor residue separately. Current mechanical/topological truth, identity and custody, protected
evidence, promised callbacks, active hazards, and meaningful scars remain distinct. Only genuinely interchangeable,
low-consequence residue may coalesce into deterministic fields or representative clusters, with its contributors,
provenance, learned history, and ability to remount preserved. Viewpoint filtering still applies. Lower visual
detail may simplify a projection but cannot clean, repair, age, forget, or otherwise change the world.

This accepts the section 11.42 protection order and closes F10.7b at the baseline level. It does not yet answer
which world process may change the underlying trace, whether a clue may be destroyed before discovery, or how a
coalesced contributor becomes individually relevant again. Those material branches remain in P10.7.

#### F10.7c - who decides when blood dries, tracks fade, debris is cleared, or damage is repaired?

In plain English: once a trace exists, should it remain frozen until a specifically authored action changes it,
should material and environment advance it through deterministic lifecycle rules, or may Gemini infer plausible
aging and cleanup when the party returns?

- **Option A - explicit-event-only lifecycle:** every trace keeps its exact current state until an actor, authored
  event, spell, repair, cleanup action, or system contract explicitly targets it. Blood never darkens merely because
  time passed; tracks never soften merely because it rained unless a rain event targets them. This is highly
  auditable and cheap to reason about, but old sites become physically frozen and Gemini or content authors must
  manually service ordinary aging that players expect the world to own.
- **Option B - typed deterministic lifecycle with lazy catch-up and event-driven exceptions (recommended):** every
  admitted trace family declares whether it is stable, time-aging, exposure-sensitive, actively propagating,
  maintained/repairable, or anomalous. Material, substrate, environment, elapsed canonical time, weather/site
  operations, and explicit actions advance it through named transitions. Cold sites compute bounded catch-up when
  reactivated and emit a typed summary/receipts; nothing relies on per-frame simulation or Gemini improvisation.
  Explicit cleaning, repair, magic, sabotage, or preservation may accelerate, halt, reverse, or replace the normal
  path when a legal owner acts.
- **Option C - Gemini-authored plausible lifecycle on revisit:** retain creation history, then let the DM decide
  that blood dried, servants cleaned, rain erased tracks, or a door was repaired when narratively suitable. This
  creates lively prose with little systems work, but identical seeds/revisits may disagree, clues can vanish by
  improvisation, site operations become decorative, and renderer/Gemini state can drift.

Option B uses a small lifecycle vocabulary rather than bespoke simulation for every noun:

| Lifecycle class | Default authority | Dungeon/Gemini-DM example |
|---|---|---|
| **Stable until acted upon** | An explicit damage, repair, movement, transfer, or transformation receipt. | A shattered stone gate stays shattered for years unless workers, magic, collapse, or another owned event changes it. Gemini cannot call it repaired for atmosphere. |
| **Time-aging** | Canonical elapsed-time thresholds plus material/substrate rule. | Indoor blood dries and darkens; a corpse advances through governed remains states. The visual and known description update together. |
| **Exposure-sensitive** | Time plus recorded weather, water, traffic, heat, vermin, vegetation, or realm condition. | Rain softens exposed tracks; dust slowly covers an untouched floor mark; traffic smears a stain. A roofed crypt does not receive outdoor rain cleanup. |
| **Active process/hazard** | Its existing system owner and bounded cadence. | Fire consumes fuel, oil spreads only under its admitted material law, and poison mist disperses through its owned process rather than a generic decal timer. |
| **Maintained or deliberately removed** | A capable actor/site operation with access, time, tools/resources, motive/obligation, and a committed receipt. | Prison workers sweep splinters and scrub blood during an actual maintenance cycle; a besieged abandoned prison does not clean itself. |
| **Preserved or anomalous** | A named magic, realm, material, evidence, or scenario rule. | A curse keeps blood fresh, stasis preserves footprints, or Chrome residue self-repairs only because the canonical effect says so. |

The catch-up result is deterministic from prior state plus named inputs. It records the lifecycle rule, elapsed
interval, environment/site-operation facts consumed, old/new trace state, any coalescence change, and what the
active viewpoint can perceive. Long inactive spans may jump across unobserved intermediate visual stages, but the
canonical summary must still explain the terminal state and any material consequence. Renderer LOD never invokes
this process.

Concrete example: the party leaves the prison gatehouse with a broken gate, wet blood, splinters, a live oil spill,
and exposed footprints. Three days later, the blood has dried under its indoor material rule. Rain recorded outside
has softened exterior prints but cannot reach the covered floor. The oil remains mechanically slippery until its
own evaporation/absorption or cleanup rule says otherwise. If functioning prison workers had time, access,
supplies, and a maintenance obligation, their site-operation receipts may remove loose splinters and scrub some
blood; if the prison was abandoned or under siege, no such cleanup occurs. Gemini narrates the resulting facts and
may propose an unusual cleanup, but cannot choose the state independently.

**Implementation/maintenance cost:** Option A is low-medium system work but creates high recurring author/DM
servicing and visibly frozen worlds. Option B is **high reusable simulation/state work**: trace-family metadata,
material/environment transitions, bounded cold-site catch-up, site-operation integration, exception authority,
receipts, projection variants, and time-jump fixtures. Its recurring content cost is medium because families share
rules. Option C is low initial code and high determinism, continuity, testing, and AI-context debt. Exact active
entity, frame, and device budgets remain P10.10; F10.7c decides only who may truthfully change history.

**Codex recommendation: Option B.** It makes ordinary aging feel like the world rather than a DM chore, keeps
maintenance and repair causally owned, and still gives Gemini freedom to narrate or propose exceptions without
letting prose erase evidence.

Does Adam accept Option B, prefer frozen explicit-event history under Option A, prefer Gemini-authored aging under
Option C, or want to amend a lifecycle class? If B is accepted, follow immediately into F10.7d: when a real aging,
cleanup, or destruction process may erase undiscovered or progression-relevant evidence without soft-locking the
player or protecting every clue with visible plot armor. Wave 10 remains **OPEN**; no build is authorized.

### 11.44 F10.7c ruling and F10.7d expansion - typed lifecycle catch-up accepted; clues receive causal resilience, not plot armor

**Adam's ruling (2026-07-20):** choose Option B.

Visible traces advance through typed deterministic lifecycle rules. Stable-until-acted, time-aging,
exposure-sensitive, active-process, maintained/removed, and preserved/anomalous families consume canonical time,
material/substrate, environment, site operations, and explicit actions. Cold sites perform bounded deterministic
catch-up when reactivated and record the old/new state, rule, inputs, elapsed interval, and viewpoint-visible
result. Gemini narrates the result and may propose a legally validated exception; it does not independently decide
that blood dried, tracks vanished, workers cleaned, or damage was repaired. F10.7c closes.

#### F10.7d - may the world destroy a clue before the player finds it?

In plain English: if rain should erase footprints, workers should scrub blood, fire should consume a letter, or a
wall repair should cover scratches, does Genesis preserve that evidence because the player has not seen it yet,
allow the clue and possibly its whole discovery to disappear, or protect the **opportunity** through a causal
network without protecting any particular prop?

- **Option A - plot-protect every undiscovered consequential clue:** a clue marked important cannot age, be cleaned,
  burn, move beyond reach, or become illegible until the player discovers it or abandons the owning objective. This
  prevents soft-locks and is simple to test, but weather and NPC behavior mysteriously spare exactly the facts the
  player needs. Persistent physical protection can leak importance through a conspicuously fresh stain, unburned
  note, or untouched footprint.
- **Option B - consequence-resilient discovery networks with honest clue loss (recommended):** individual evidence
  obeys the accepted lifecycle and may genuinely be destroyed. An owning discovery promise/network separately
  declares whether the opportunity is mandatory, serviced/promised, optional, or already learned; its causal graph
  tracks surviving alternate handles and explicit failure/transformation states. Critical continuation cannot
  become a silent unwinnable state; paid/promised service must deliver, transform, or fail visibly under its
  contract; optional secrets may be permanently lost. The engine never invents a replacement clue merely because
  the player needs one.
- **Option C - world-first clue mortality with no solvability contract:** every clue lives or dies only by physical
  simulation. If the sole exit clue, murder evidence, or promised lead disappears before discovery, the player may
  never know a path existed or why progress stopped. This is the purest simulation and cheapest system, but creates
  silent soft-locks, makes authored promises unreliable, and leaves Gemini guessing whether to cheat in a new hint.

Option B distinguishes four cases:

1. **Mandatory continuation or safety:** the world may destroy one physical handle, but the owning route/objective
   contract must already possess another causal legal route or commit an explicit changed-state transition that
   exposes a different way forward. This does not guarantee the easiest path or preserve a particular clue.
2. **Promised, purchased, or serviced discovery:** if the player paid an informant, accepted a guaranteed search
   service, or earned a due reveal, the service obligation survives loss of one prop. It may deliver another
   preexisting/sourced handle, report a material failure with its contracted remedy/consequence, or transform the
   service according to its accepted terms. Gemini cannot silently drop the promise or conjure unrelated evidence.
3. **Optional secret, advantage, or lore:** its last evidence may genuinely age, burn, be cleaned, leave with an
   actor, or otherwise become unreachable. The loss receives canonical provenance but no player-facing failure
   banner when the player never knew the opportunity. A later rediscovery requires a surviving causal edge, not a
   pity spawn.
4. **Already learned information:** destruction of the physical source does not erase viewpoint knowledge,
   inspection history, a copied map, a remembered code, or an established callback. The board stops showing the
   destroyed evidence; the known fact remains available at the scope its knowledge contract permits.

Concrete dungeon/Gemini-DM examples:

- Rain erases the only outdoor footprints that would have hinted at an **optional** smuggler door. The door still
  exists, but that clue path is gone. Gemini does not highlight the wall or generate a convenient new footprint.
- If the same hidden route is the party's only legal escape from a sealed prison, it cannot rely on one mortal clue
  with no contingency. The route contract must already own another causal handle—airflow, a prisoner's knowledge,
  a confiscated map, structural sound, a visible mechanism after the water rises—or an explicit crisis/failure
  transition that changes the situation and preserves play without pretending the footprints survived.
- The player paid Varka to find the route. Workers scrub his scratched marker before return. Varka's service
  obligation remains: he may use his remembered route, a copied note, or another already sourced handle; if the
  contract allowed failure, he reports it and its remedy/consequence. Gemini cannot simply forget the payment.
- The player already read Varka's message before the wall was replastered. The scratches disappear physically, but
  the learned message and its source history remain. If only one companion saw it, ordinary viewpoint/knowledge
  scope still applies.

The engine/DM-side projection may show the owning promise, remaining legal handles, expiry/loss reasons, and whether
the discovery is still serviceable. The player-facing board shows only perceptible residue and earned knowledge;
it never reserves empty highlight space, protects a clue with visible plot armor, or announces the loss of an
unknown optional secret. If all legal handles for a known objective are gone, the objective must enter a named
blocked, failed, transformed, or awaiting-new-cause state rather than remaining silently actionable.

**Implementation/maintenance cost:** Option A is medium protection/flag work but high simulation dishonesty,
leakage, and exception debt. Option B is **high semantic/QA work**: discovery-network ownership, criticality and
service classes, surviving-handle audits, learned-knowledge persistence, clue-loss receipts, explicit failure/
transformation states, DM digest projection, and adversarial time/weather/cleanup fixtures. It largely extends the
accepted Wave 1 discovery-promise and secret-network ontology rather than creating a second quest system. Option C
is low initial code and high player-frustration, support, diagnosis, and AI-cheating pressure.

**Codex recommendation: Option B.** Protect causal play and earned promises, not individual clues. The rain may
erase footprints; Genesis must simply know whether that was an optional loss, one branch of a resilient discovery,
or a world change that explicitly transformed what progress now means.

Does Adam accept Option B, prefer clue plot-protection under Option A, prefer uncompromising clue mortality under
Option C, or want to change which discovery classes receive resilience? If B is accepted, follow into F10.7e: how
a fact that was coalesced or visually unmounted becomes individually inspectable and physically remounted when a
later action makes it consequential. Wave 10 remains **OPEN**; no build is authorized.

### 11.45 F10.7d ruling and F10.7e expansion - causal opportunity survives when owed; remount without invented precision

**Adam's ruling (2026-07-20):** choose Option B.

Individual clues obey their physical lifecycle and may be destroyed. Genesis protects neither an important stain
nor an undiscovered note merely because the player might need it. The owning discovery network instead classifies
the opportunity as mandatory continuation/safety, promised or purchased service, optional secret/advantage/lore,
or already learned information. Mandatory play retains another causal legal route or enters an explicit transformed
state; owed service delivers, transforms, or fails visibly under its contract; an optional discovery may be lost;
and destruction of a source never erases knowledge already earned by a viewpoint. No replacement clue appears
without a surviving causal source. F10.7d closes.

#### F10.7e - how does one old fact come back out of a coalesced stain, debris field, or unmounted history?

In plain English: suppose seventeen blood marks became one visual stain field, old splinters became one debris
patch, or a minor known trace left the mounted scene. Later the player investigates one contributor, a spell makes
it relevant, or a callback depends on it. Does Genesis keep every contributor's exact hidden render transform,
reconstruct the best truthful representation from preserved semantic history, or let Gemini place the detail where
it makes narrative sense?

- **Option A - retain exact permanent micro-placement for every contributor:** coalescence hides drawables but every
  blood drop, footprint, splinter, ash fleck, and fragment keeps an exact transform ready to restore. Remounting is
  trivial and spatially stable, but the canonical model absorbs renderer-level precision even when the original
  fact was only zone-level or representative. Long histories retain much of the storage, migration, collision, and
  validation debt that bounded projection was meant to avoid.
- **Option B - deterministic relevance promotion from preserved semantic contributors (recommended):** every
  coalesced/unmounted contributor keeps stable identity, source/provenance, state, lifecycle, knowledge scope,
  precision class, and an exact location only when canon actually owned one. A relevance receipt promotes that same
  contributor into the strongest truthful physical/decal/marker/card representation. Exact facts remount at their
  valid exact support; zone/relational facts remount as bounded regions or relationships; unknown precision stays
  unknown. Current geometry and lifecycle are revalidated, and a missing visual binding uses the accepted fallback.
- **Option C - Gemini reconstructs and places the detail on demand:** the history tells Gemini that an old trace
  existed, and the DM chooses an evocative current location and appearance when it becomes important. This is
  flexible and cheap, but a coalesced blood drop can teleport across a room, an old splinter can acquire a crest it
  never had, and save/replay or different viewpoints may receive contradictory evidence.

Option B has five remount laws:

1. **Identity never changes:** promotion restores the same trace/object/evidence id and causal parents; it never
   mints a visually convenient replacement. Object cards, Gemini narration, receipts, and later coalescence all
   point to that identity.
2. **Precision cannot improve merely because attention increased:** `EXACT_CELL`/exact support may remount exactly;
   `EXACT_ZONE`, `RELATIONAL`, or `ESTIMATED` history receives a region, relation, uncertainty treatment, or card.
   Selecting a trace makes focus explicit but does not manufacture a forensic coordinate.
3. **Current physical truth wins over historical placement:** before remounting, validate the supporting surface,
   topology, occlusion, movement, cleanup, repair, and lifecycle. A surviving trace covered by new plaster remains
   physically hidden until the plaster is lawfully removed; a trace destroyed during repair cannot reappear; a
   carried fragment follows its current owner rather than its old floor coordinate.
4. **Promotion may replace aggregate detail rather than add clutter:** the selected contributor can temporarily
   split from or supersede its representative stain/debris field. Other low-salience contributors remain coalesced.
   When relevance ends, the detail may fold back into the aggregate without losing state or knowledge.
5. **Remount and new discovery are different operations:** if the contributor already existed, restore it under
   these laws. If the player asks whether a generic debris patch contains a previously unestablished crested shard,
   that is a SceneFact reveal/promotion or semantic-invention question requiring its own source, uncertainty,
   validation, and receipt—not permission to rewrite the aggregate's past.

Concrete examples:

- A dried blood field contains a preserved contributor sourced to Varka at an exact threshold cell. A forensic
  spell makes it relevant, so the same contributor receives a focused stain/decal/marker and card at that valid
  support. Other blood remains one field. If its original fact was only `EXACT_ZONE`, the spell can identify the
  bounded region unless its own mechanics truthfully earn greater precision.
- Old splinters from the shattered gate are coalesced as a debris patch. The player searches for one already
  recorded iron hinge fragment; its id remounts at its current exact/zone location. Asking for a royal crest on an
  otherwise generic splinter does not produce one unless the unresolved debris facts and the ordinary semantic
  reveal/invention contract lawfully establish it.
- Workers replaster Varka's scratched wall without destroying the underlying marked stone. The trace remains
  canonical but physically occluded. Gemini may remember or describe the known prior message, while the board does
  not draw scratches on top of pristine plaster. Breaking or removing the plaster may expose the same mark if its
  lifecycle and construction state still support it.
- The turtle communicator was picked up before scene coalescence. A later callback mounts or focuses it in its
  current holder/inventory projection, never back on the gatehouse floor because that was its historical location.

The relevance receipt records trigger, promoted id, prior projection/aggregate, current canonical support,
precision, viewpoint, selected representation/fallback, and any reason physical remount is impossible. Gemini may
explain the promoted fact and dramatize inspection, but it cannot choose a stronger precision or relocate it.

**Implementation/maintenance cost:** Option A is high permanent storage/migration/validation cost and encourages
false micro-precision. Option B is **medium-high reusable projection/state work**: stable contributor ids,
precision-bearing trace summaries, aggregate membership, relevance receipts, current-support validation,
temporary split/fold behavior, occlusion, fallbacks, and save/revisit fixtures. Option C is low initial system cost
and high continuity, fairness, replay, and AI-context debt. Numeric mount/draw budgets remain P10.10; this question
defines truthful restoration within whatever budgets are later measured.

**Codex recommendation: Option B.** Preserve enough semantic history to remount the same fact, but never preserve or
invent renderer precision that canon did not own. Attention may increase visual emphasis and expose licensed
information; it cannot move evidence or rewrite its past.

Does Adam accept Option B, prefer permanent exact micro-placement under Option A, prefer Gemini reconstruction
under Option C, or want to amend a remount law? If B is accepted, follow into F10.7f: when inspection of an aggregate
may reveal or create a detail that was not already an individual contributor, without turning every debris field
into an unlimited retroactive loot/clue generator. Wave 10 remains **OPEN**; no build is authorized.

### 11.46 F10.7e ruling and F10.7f expansion - relevance remounts the same fact at honest precision; bound new detail

**Adam's ruling (2026-07-20):** choose Option B.

A coalesced or visually unmounted contributor retains stable identity, source/provenance, current state, lifecycle,
knowledge scope, aggregate membership, and the precision canon actually owned. A relevance receipt restores that
same fact through the strongest truthful physical, decal, marker, region, relation, or card representation. It
revalidates current support, topology, occlusion, movement, cleanup, repair, and destruction; exact history may
remount exactly, while zone/relational/estimated history never gains forensic coordinates merely because the
player selected it. Promotion may temporarily split one contributor from its aggregate and fold it back later.
Missing art uses the accepted fallback. F10.7e closes.

#### F10.7f - may searching generic residue establish a new specific detail that was never an individual fact?

In plain English: remounting can restore an already known contributor, but players will also search rubble, ash,
blood, shelves, tracks, wreckage, and other aggregates for details Genesis has not eagerly individualized. Must the
engine pre-create every possible fragment, may a bounded inspection resolve previously open detail, or may Gemini
invent whatever fits the player's question?

- **Option A - eagerly instantiate every potentially discoverable detail:** when the aggregate is created, roll and
  store every retrievable shard, material clue, ownership mark, salvage unit, track distinction, blood source, and
  search result. Later inspection only reveals existing citizens. This is maximally explicit, but recreates the
  eager-simulation and storage problem at a finer scale, spends generation on facts nobody touches, and requires an
  enormous corpus to make every rubble/debris family interesting.
- **Option B - bounded unresolved-detail envelopes with transactional reveal/promotion (recommended):** an
  aggregate records source materials, causes, contributors already known, physical/semantic capacity, possible
  detail families, exclusions, rarity/quality bounds, remaining unresolved slots or quantities, prior inspection
  coverage, and a stable reveal seed. A material action may `REPLAY` an existing fact, `DERIVE` a necessary
  consequence, `ROLL` an allowed unresolved detail, or enter the governed `PROPOSE`/`SYNTHESIZE` semantic lane. The
  result validates once, consumes or narrows capacity, receives stable identity/provenance/precision/lifecycle, and
  cannot be rerolled by asking Gemini again.
- **Option C - Gemini invents a plausible detail whenever inspection calls for one:** the DM responds freely to
  “is there a crested shard?”, “any usable oil?”, or “does this blood belong to Varka?” and the system records the
  answer afterward. This maximizes conversational flexibility with little up-front schema, but player wording can
  manufacture treasure/evidence, repeated searches become crit fishing, and the same debris acquires contradictory
  contents across turns or context compaction.

Option B preserves staged canon without turning uncertainty into a blank cheque:

1. **The action declares intent and method, not the desired fact:** “search for usable metal with thieves' tools”
   is valid; “find the royal key I need” does not force the key to exist. Skill, time, tools, magic, access, danger,
   and cost determine the legal inspection and what precision or detail it can earn.
2. **The envelope is causal and finite:** gate wreckage may own wood, iron hardware, paint, masonry dust, and
   fragments within its recorded mass/count/quality bounds. It cannot yield a potion, a unique royal seal, a second
   turtle communicator, or unlimited saleable iron unless a source row, prior owner, event, or governed invention
   contract licensed that possibility.
3. **Resolution is provenance-bearing and deterministic:** stable aggregate identity, query/detail family, reveal
   seed/slot, source table or derivation, validation, and consumed/narrowed capacity are receipted. Save/replay and a
   differently worded equivalent request reach the committed result rather than rerolling the aggregate.
4. **Prior observation constrains backfill:** a resolved detail may become canonically preexisting within the
   aggregate's unresolved envelope only when prior exhaustive views, counts, material tests, custody, or spatial
   facts did not exclude it. Record both commitment time and its licensed world-effective origin. A player-created
   transformation begins now rather than masquerading as an old hidden fact.
5. **Failure and partial inspection change future truth honestly:** an attempt may reveal a result, rule out a
   detail family, reduce uncertainty, consume fragile material, disturb the aggregate, or leave unsearched capacity
   when the method was limited. Repeating the same method against the same coverage does not mint a fresh roll;
   further resolution requires remaining scope, a materially stronger method, changed access, or new causal input.
6. **Every admitted detail joins the ordinary laws:** it receives a stable id, current precision/location,
   viewpoint knowledge, ownership/custody where applicable, lifecycle, visual binding/fallback, aggregate relation,
   and future remount behavior. A newly established clue cannot live only in Gemini's prose.

Concrete examples:

- The shattered gate's debris envelope includes a bounded amount of ordinary iron hardware. Searching with tools
  may resolve one usable hinge pin and consume one hardware slot. Asking again with the same method does not yield
  infinite pins. A royal-crested fragment is impossible unless the gate's construction/ownership or another source
  admitted heraldic material.
- A coalesced blood field already records contributors but not every forensic attribute. A mundane inspection may
  narrow age and direction; a suitable spell may derive or reveal source identity from existing contributors. It
  cannot add a new victim because that answer would be useful to the mystery.
- Ash from a burned desk may contain an unresolved document-fragment family only if the desk's prior contents,
  fire/material survival, and remaining mass allow it. A successful reveal commits one fragment with provenance;
  repeated prompting cannot assemble a full letter beyond the surviving capacity.
- Generic rubble can become an improvised wedge if the player physically selects and shapes a suitable fragment.
  That object is an action-created fact beginning now, sourced from consumed rubble material—not a claim that a
  finished wedge was always hidden there.

This contract does not require the renderer to show unresolved slots or future rolls. The player sees perceptible
material and any earned indication that inspection remains plausible; Gemini receives the bounded legal envelope,
not a list of guaranteed desirable outcomes. The next follow-up must decide how remaining searchability,
exhaustion, and a materially stronger second method become legible without adding a magnifying-glass icon to every
aggregate.

**Implementation/maintenance cost:** Option A is very high eager generation/storage/migration/content cost. Option
B is **high but reusable semantic-resolution work**: aggregate envelopes, capacity/exclusion schemas, stable reveal
streams, inspection coverage/method strength, REPLAY/DERIVE/ROLL/PROPOSE/SYNTHESIZE routing, validation, consumption,
backfill audit, receipts, and anti-reroll fixtures. It extends the accepted SceneFact promotion boundary rather than
creating a debris-only generator. Option C is low initial code and very high balance, continuity, exploit,
provenance, and Gemini-context debt.

**Codex recommendation: Option B.** Genesis should leave low-value detail unresolved until attention makes it
matter, but the unresolved space must already have causal shape, finite capacity, and deterministic commitment.
This preserves Gemini-era responsiveness without letting questions write unlimited treasure or evidence backward
into history.

Does Adam accept Option B, prefer eager detail under Option A, prefer Gemini-first invention under Option C, or
want to amend the unresolved-envelope laws? If B is accepted, follow into F10.7g: how the board and Gemini show that
an aggregate is plausibly searchable, exhausted, or worth revisiting with a stronger method without reintroducing
universal interaction glow. Wave 10 remains **OPEN**; no build is authorized.

### 11.47 F10.7f ruling and F10.7g expansion - unresolved detail has finite causal shape; show search state without completion clutter

**Adam's ruling (2026-07-20):** choose Option B.

Aggregates may retain bounded unresolved detail instead of eagerly instantiating every minor fragment. Each
envelope records causal sources/materials, admitted detail families, exclusions, rarity/quality and mass/count
bounds, remaining capacity, prior inspection coverage, and stable reveal routing. A material action may replay,
derive, roll, propose, or synthesize only within the accepted semantic lanes; one validated result consumes or
narrows capacity, receives stable identity/provenance/precision/lifecycle, and cannot be rerolled by rephrasing the
request. Prior observation constrains backfill, and action-created transformations begin now rather than pretending
to have been hidden history. F10.7f closes.

#### F10.7g - how does the player know whether residue is worth inspecting, already searched, or exhausted?

In plain English: the system may know that rubble, ash, blood, shelves, wreckage, or tracks have unresolved detail,
but showing a magnifying glass, progress bar, or `2 clues remaining` badge over every aggregate would expose hidden
content and recreate Option A's glow clutter. Should search state be explicit everywhere, remain entirely in
narration, or appear only through earned evidence and the focused object/scene interaction?

- **Option A - universal searchable/progress/exhausted UI:** every aggregate with remaining detail receives an
  inspect icon; opening it shows search percentage or remaining slots; full exhaustion adds a persistent check or
  dimmed badge. This is exceptionally clear and prevents repeated actions, but turns natural material into a loot-
  container dashboard, leaks that hidden detail exists, exposes implementation capacity as world truth, and leaves
  every old stain or rubble patch wearing completion UI.
- **Option B - evidence-led inspection state with focused method/coverage feedback (recommended):** ordinary
  material advertises only perceptible search plausibility under the accepted attention ladder. Once noticed or
  deliberately focused, its card/action response states what this viewpoint has examined, by which method, what was
  found or ruled out, and whether repeating the **same known method** can do more. It exposes a stronger method only
  when the player/character knows and can formulate it. No remaining-slot count, guaranteed-content icon, or
  permanent completion halo appears; natural-language inspection of any plausible surface remains possible.
- **Option C - board remains silent and Gemini manages all search memory:** the player asks whether each thing can
  be searched and Gemini says whether prior attempts were enough. This keeps the image pure and has low UI cost,
  but encourages repeated prompting, makes method coverage hard to remember, burdens context compaction, and lets
  “you find nothing” ambiguously mean failed roll, exhausted method, no remaining detail, or DM omission.

Under Option B, player-facing search state is epistemic rather than a view into the envelope:

| Known inspection state | Board/card/Gemini treatment |
|---|---|
| **Ambient or not yet singled out** | Material looks like itself. No search icon appears merely because unresolved slots exist. A player may still inspect any plausible noun through direct focus or natural language. |
| **Noticed and plausibly inspectable** | Earned physical tells and ordinary focus semantics allow inspection. The action says what can be attempted now—look, sift, pry, test, smell, cast, question—not what desirable result waits inside. |
| **Partially examined** | Focused card/history states the committed method and known result/limitation: `surface examined`, `hand-sifted`, `upper layer disturbed`, `mundane inspection found…`. Physical disturbance appears only when the action actually caused it. |
| **No more from this method** | Repeating an equivalent method is disabled, consolidated, or answered without a new roll: `You have exhausted what ordinary sight can establish here.` This is not a claim that no stronger method or future change could matter. |
| **Known stronger method available** | A stronger action appears only when character knowledge, equipment, spell, relationship, or changed access makes it formulable and legal. The UI does not tease unknown spells, secret tools, or hidden content. |
| **Fully resolved under current known scope** | The focused card summarizes known findings and state. On defocus the aggregate returns to its ordinary physical/historical presentation; no permanent checkmark, grey loot glow, or `100%` badge remains. |

Gemini and structured feedback must distinguish truthful statements:

- `You find nothing with this attempt` means the attempt resolved without the desired result and its receipt states
  what, if anything, changed or was learned;
- `You have learned all ordinary visual inspection can establish` means equivalent mundane looking cannot reroll;
- `Nothing recoverable remains` is legal only when the viewpoint has earned an exhaustive material conclusion;
- `You cannot currently tell` preserves uncertainty rather than implying empty or secretly full;
- silence or generic atmospheric prose never substitutes for updating committed inspection coverage.

Concrete examples:

- Gate debris looks like gate debris. After a hand search finds one hinge pin, the focused card may say `Hand-
  searched; loose accessible hardware examined` and prevent an equivalent hand-search reroll. It does not display
  the envelope's remaining slots. If the character later has a pry bar and knows embedded hardware may remain, that
  stronger legal method appears; otherwise Gemini does not advertise it.
- A blood field carries its earned visible age/direction clues. Ordinary inspection may become exhausted while a
  known forensic spell remains available. The board does not reveal that magic would succeed, how many sources
  exist, or an unknown caster's option.
- Ash may be visibly siftable after the player notices surviving paper texture. Sifting changes the ash physically
  and records coverage. If fragile material was consumed, Gemini and the card say so; a repeat does not regenerate
  document fragments.
- An undiscovered secret wall receives no `searchable` state from its hidden mechanism. The player can still say
  “inspect the east wall.” Focus/search language strengthens only after scratches, draft, map evidence, or another
  viewpoint-legal tell exists.

Player-invoked known-interactable scan and attention-specific accessibility projection may include an aggregate
only when the viewpoint already knows it as a relevant/available inspection target. They never expose unresolved
capacity, a secret stronger method, or unknown completion. Non-color, non-audio, and reduced-motion equivalents
remain required for the shown state; broad accessibility/device tier design remains P10.10.

**Implementation/maintenance cost:** Option A is medium UI/state work and high visual, leakage, and content-
dashboard debt. Option B is **medium-high interaction/knowledge work**: method-equivalence classes, inspection
coverage summaries, focused card/action copy, earned stronger-method projection, no-reroll responses, physical
disturbance bindings, Gemini digest phrasing, focus/scan parity, and comprehension fixtures. Option C is low initial
UI work and high repeated-interaction, AI-memory, ambiguity, accessibility, and support cost.

**Codex recommendation: Option B.** Let the world suggest that ash can be sifted and a stain can be examined; let
focus explain what this character has already tried and can truthfully try now. Never turn the hidden envelope into
a checklist the player clears from the board.

Does Adam accept Option B, prefer universal search UI under Option A, prefer narration-only memory under Option C,
or want to amend one inspection-state treatment? If B is accepted, follow into F10.7h: what exact new cause—new
method, changed access, elapsed time, new deposit, new knowledge, or world event—may reopen an exhausted inspection
without disguising a reroll as progress. Wave 10 remains **OPEN**; no build is authorized.

### 11.48 F10.7g ruling and F10.7h expansion - focused inspection state without completion UI; reopening requires a new cause

**Adam's ruling (2026-07-20):** choose Option B.

Searchability and exhaustion remain evidence-led and viewpoint-bounded. Ambient aggregates wear no universal
inspect icon, slot count, progress bar, completion check, or permanent exhausted halo. Once noticed or deliberately
focused, the board card and Gemini state which method this viewpoint used, what was learned or changed, and whether
an equivalent repetition can do more. A stronger method appears only when known and legally formulable. Structured
feedback distinguishes failed attempt, same-method exhaustion, earned proof that nothing recoverable remains, and
continued uncertainty. Defocus returns the aggregate to its ordinary physical/history presentation. F10.7g closes.

#### F10.7h - what makes an exhausted inspection honestly searchable again?

In plain English: after ordinary sight, a hand search, or another method has exhausted what it can establish, may
the player try again because a different character asks, time passed, wording changed, a better tool appeared, the
room changed, or new material arrived? Genesis needs to reward genuinely new approaches without permitting save-
scummed or Gemini-mediated rerolls of the same uncertainty.

- **Option A - exhaustion is permanent for the target:** once any method reports no further result, that aggregate
  never reopens. Later tools, removed barriers, new deposits, changed lighting, specialist knowledge, and lifecycle
  changes cannot create another inspection opportunity. This is simple and exploit-resistant but makes world
  change inert and punishes players for inspecting before obtaining better capabilities.
- **Option B - versioned coverage epochs reopened only by a causal delta (recommended):** inspection coverage is
  keyed to target/aggregate version, method family and strength, accessed region/layer, physical conditions, query
  family, and knowledge scope. Equivalent wording or another ordinary attempt against the same coverage cannot
  reroll. A materially stronger method, newly exposed region, changed relevant condition, new deposited material,
  new causal knowledge, or explicit world event opens only the delta it actually affects; all prior findings,
  exclusions, consumption, and damage remain committed.
- **Option C - Gemini judges whether the player's new approach sounds different enough:** the DM may grant another
  attempt when the phrasing, roleplay, character, or tool feels meaningfully distinct. This is conversational and
  low-schema, but rewards synonym fishing, varies across context windows, and makes anti-reroll law a matter of AI
  taste rather than world state.

Under Option B, reopening causes are explicit:

| Claimed new cause | Reopening law |
|---|---|
| **Different wording, same intended evidence and method** | No reopening. `I search again`, `look more carefully`, and an equivalent Gemini paraphrase reuse the committed coverage/result. |
| **Another actor repeats the same physical method** | No new physical coverage merely because a different sheet supplies another roll. The actor may receive shared or newly communicated knowledge, and a genuinely different expertise/tool can enter its own method family. Exact party/viewpoint sharing is the next follow-up. |
| **Materially stronger method** | Reopens only evidence classes the stronger method can reach: magnification after naked sight, alchemical testing after sight/smell, `Detect Magic` after mundane inspection, or a proper pry tool after a hand search. A larger bonus alone does not automatically create new physical scope. |
| **Changed access or support** | Moving rubble, opening a sealed compartment, draining water, removing plaster, restoring light, or safely entering a hazard may expose a new region/layer. Prior searched regions stay exhausted. |
| **Changed material/lifecycle state** | Drying, thawing, corrosion, growth, a receding tide, damage, cleanup, or magical transition may reveal, alter, consume, or destroy evidence only according to its typed lifecycle. Elapsed time by itself is not a free reroll. |
| **New deposit, actor, object, or world event** | Creates a new target version or contributor set. The new delta may be inspected; old exhausted material does not refill. Unknown additions do not announce themselves through a new icon unless the viewpoint perceives a tell. |
| **New knowledge or question family** | A sourced code, heraldry lesson, witness statement, recipe, map, or specialist concept may license reinterpretation of recorded observations or a newly formulated test. It does not change the old object or reroll unrelated facts. |
| **Changed stakes or more time** | More time matters only when it changes allowed coverage, method thoroughness, danger, resource use, or precision under the original action contract. Removing time pressure can open previously unsearched scope; merely waiting and rolling again cannot. |

The coverage receipt therefore preserves target/aggregate id and version, method family/strength, actor and tools,
query/evidence family, accessed region/layer, conditions, time/resource cost, result, exclusions, remaining lawful
scope, disturbance/consumption, and knowledge recipients. A reopening receipt names the causal delta and derives
the new scope; it never resets the target wholesale.

Concrete examples:

- A hand search exhausts loose gate hardware. Returning with another character's bare hands does not roll a second
  hinge pin. A pry bar can open the embedded-hardware layer if such capacity remains; removing the collapsed lintel
  can expose a previously inaccessible region. Both preserve the first pin and all prior disturbance.
- Ordinary sight exhausts what the blood field can reveal. `Detect Magic` may open an arcane-residue evidence family;
  forensic alchemy may test age/species; a higher Perception modifier alone does not reconstitute a new mundane
  visual search unless the original action had explicitly limited coverage under pressure.
- The party fully searches the ash. Later a surviving enemy throws a new letter into the same brazier. That receipt
  creates a new ash contributor/version; the new material may be investigated if any survives. The prior ash does
  not regain unresolved document capacity.
- Varka explains the gate's heraldry after the player already sketched a fragment. The new knowledge may derive a
  recognized crest from the recorded sketch if its captured detail supports it. If the sketch omitted the relevant
  marks and the fragment was destroyed, knowledge alone cannot invent them.
- Workers replaster a searched wall. The new surface is a new layer; it may be inspected as plaster. The old wall
  behind it stays exhausted under prior mundane inspection and physically occluded until access changes.

Player-facing feedback names only the known cause and newly legal action: `With the pry bar, you can reach embedded
hardware`, `Varka's explanation gives the copied mark new meaning`, or `The receding water exposes an unsearched
ledge`. It never announces an unseen new deposit, promises success, shows hidden remaining capacity, or restores a
permanent search icon. Gemini receives the exact legal delta and prior committed coverage rather than deciding
that the player's description is clever enough for another roll.

**Implementation/maintenance cost:** Option A is low state/QA work and high rigidity/design frustration. Option B
is **medium-high reusable interaction-state work**: target versioning, method-family/strength lattice, region/layer
coverage, causal-delta derivation, prior-result carry-forward, changed-condition hooks, query-family routing,
knowledge reinterpretation, UI/Gemini explanations, and adversarial anti-reroll fixtures. Option C is low initial
code and high exploit, fairness, determinism, replay, and prompt-maintenance cost.

**Codex recommendation: Option B.** A better tool, exposed layer, new evidence deposit, or genuinely new knowledge
should matter; a different actor, higher bonus, elapsed time, or clever paraphrase should matter only when it
changes the method's actual reach. Reopen the delta, never reset the scene.

Does Adam accept Option B, prefer permanent exhaustion under Option A, prefer Gemini discretion under Option C, or
want to amend one reopening cause? If B is accepted, follow into F10.7i: which inspection coverage and learned
results are physical world state versus character-, party-, player-, or Gemini-side knowledge, especially when a
different actor takes over. Wave 10 remains **OPEN**; no build is authorized.

### 11.49 F10.7h ruling and F10.7i expansion - reopen only a causal delta; separate physical coverage from knowledge

**Adam's ruling (2026-07-20):** choose Option B.

Inspection coverage is versioned by target/aggregate, method family and strength, accessed region/layer, relevant
conditions, query/evidence family, and knowledge scope. Equivalent wording, a different actor's same physical
method, a larger bonus, or elapsed time alone never resets a committed result. A materially stronger method,
newly exposed layer, lifecycle change, new deposit/event, sourced new knowledge, or changed action contract opens
only the scope its causal delta actually reaches; prior findings, exclusions, consumption, disturbance, and damage
remain committed. Player-facing feedback names only a viewpoint-known cause and legal new action. F10.7h closes.

#### F10.7i - who owns the fact that something was searched, and who owns what the search discovered?

In plain English: if the rogue sifts the ash, the ash is physically disturbed for everyone—but perhaps only the
rogue saw the coded fragment. If Varka witnesses a private crest, the human player may see that scene while the PC
does not know it. Should all player-controlled characters share one knowledge pool, should every fact remain
strictly isolated by actor, or should physical coverage be global while knowledge travels through explicit
viewpoints and ordinary communication?

- **Option A - one player-global party knowledge and inspection pool:** if the human saw a result or any controlled
  actor learned it, every party member and action validator may use it immediately. Physical coverage and knowledge
  are simple, object cards never need holder labels, and switching characters is frictionless. But split parties,
  private scenes, secret motives, unconscious/absent characters, language barriers, specialist interpretations,
  and meaningful communication collapse into metagame omniscience.
- **Option B - world-global physical coverage plus scoped knowledge and governed sharing (recommended):** physical
  changes, consumed capacity, searched regions, exposed layers, and target versions belong to the world. Perceived
  results belong first to the observing viewpoint(s); interpretation may belong to a specific knower. Ordinary
  co-present party communication can share routine non-secret findings without dialogue bookkeeping, while
  separation, incapacity, privacy, language, secrecy, contested trust, or a holder-specific experience requires a
  real communication/transfer. The human may receive perspective-gated dramatic irony without silently teaching
  every character.
- **Option C - strict actor-local knowledge and presentation:** only the acting citizen sees and remembers an
  inspection result; every other character must be explicitly told, shown, or repeat a legal analysis. The human UI
  hides or heavily partitions facts the active character does not know. This maximizes role separation, but creates
  constant “I tell the party” chores, makes character switching cumbersome, and fights the accepted single-player
  dramatic-irony posture.

Option B separates five layers:

1. **Physical world state:** target version, disturbed geometry/material, consumed or narrowed envelope capacity,
   searched region/layer, removed items, damage, residue, and method-caused changes are globally canonical. Another
   actor cannot restore ash, unbreak a seal, or reroll a hand search merely because they did not witness it.
2. **Perception/observation:** record who was present, conscious, able to sense the event, within range/occlusion,
   and not excluded by viewpoint rules. Those citizens may learn the observable result; absent or blocked actors do
   not.
3. **Interpretation/competence:** recognizing heraldry, reading a language, identifying poison, understanding arcane
   residue, or inferring a mechanism may belong only to a capable observer or later analyst. Everyone can share the
   same physical sketch while deriving different facts from it.
4. **Communication/shared knowledge:** a report, speech, gesture, shown object, copied note, journal, telepathy,
   spell, or ordinary co-present party debrief transfers only what the source knows and can express, with source,
   recipients, fidelity, timing, secrecy, and interruption recorded where material.
5. **Human-player and Gemini projection:** the human may see a perspective-gated private PC/companion scene for
   dramatic irony, with a clear holder/knower label. Action legality, automatic focus, scan results, and character-
   voiced Gemini narration still consume the acting viewpoint's knowledge. Gemini retains full canonical truth in
   its governed side but may not hint from it across the player/character boundary.

The system should avoid communication busywork. When the active party is co-present, cooperative, able to
communicate, and no secrecy/private-holder rule applies, ordinary actionable findings may enter a party-common
knowledge scope as part of the same receipt or a bounded automatic debrief. That default does not apply across a
split party, active combat interruption, silence/telepathy restrictions, unconsciousness, unknown language,
deliberate withholding, mistrust, domination, private journals, hidden motives, or facts a character cannot
articulate. The exact auto-share boundary is a material follow-up rather than an invitation for Gemini to assume
that everyone always tells everyone everything.

Concrete examples:

- The rogue hand-sifts gate debris while the party watches, removes a hinge pin, and says what she found. The
  physical coverage and missing pin are world state; the routine result becomes party-common. The wizard cannot
  reroll the same hand search, but may apply a genuinely different arcane/material analysis.
- The rogue searches alone beyond a sealed door and finds a coded fragment. The human may see the private scene,
  but the remote party does not gain the code, board focus, or action prompt. On reunion, showing the fragment
  shares its visible marks; reading it may still require the wizard's language/competence.
- Varka privately recognizes a royal crest and deliberately withholds it. The human may know `Varka knows` if the
  perspective contract showed his scene; the PC cannot target the hidden passage from that knowledge. Persuading,
  observing, reading his notes, telepathy, or another causal route may transfer or independently establish it.
- An unconscious companion is present when the brazier explodes but does not learn the visual clue. The changed
  brazier and ash are still world state. Later inspection begins from the current physical scene, not an untouched
  copy, and prior destructive coverage remains committed.
- Gemini knows an unseen enemy added a poisoned shard to searched rubble. Until a legal viewpoint perceives a tell,
  the board, scan order, card state, and narration do not announce that the target version changed. Gemini may use
  the hidden fact only through its licensed world/NPC authority.

When an uninformed character repeats an already exhausted physical action, the system does not expose secret
knowledge merely to explain the denial. It may show perceptible disturbance, allow the character to discover that
someone searched it, consolidate the redundant action, or resolve only any genuinely unvisited scope. The DM-side
receipt retains the exact reason. When the human acts on dramatic irony, Genesis permits any independently
plausible action the character could choose but does not surface hidden coordinates, names, or guaranteed outcomes
as though the character knew them.

**Implementation/maintenance cost:** Option A is low-medium knowledge/state work and high narrative, split-party,
companion, and mystery damage. Option B is **high reusable knowledge-boundary work**: physical-versus-epistemic
state separation, observer capture, competence-gated interpretation, transfer/debrief receipts, party-common scope,
holder labels, acting-viewpoint action/scan filtering, Gemini prompt partitioning, dramatic-irony UI, and split-
party/privacy/adversarial fixtures. Option C is high per-action/UX and communication maintenance despite simpler
conceptual isolation.

**Codex recommendation: Option B.** The rubble should remember that it was searched even when a witness does not;
characters should remember only what they perceived, inferred, or were told; and the human can enjoy private-scene
dramatic irony without the board converting it into character omniscience.

Does Adam accept Option B, prefer player-global knowledge under Option A, prefer strict actor isolation under
Option C, or want to amend one knowledge layer? If B is accepted, follow into F10.7j: exactly when co-present party
findings auto-share versus requiring an explicit communication act, so scoped knowledge does not become either
metagame leakage or repetitive dialogue bookkeeping. Wave 10 remains **OPEN**; no build is authorized.

### 11.50 F10.7i ruling and F10.7j expansion - the world owns coverage; viewpoints own knowledge; choose the auto-share boundary

**Adam's ruling (2026-07-20):** choose Option B.

Physical inspection state is world-global: target versions, disturbed material, consumed capacity, searched
regions/layers, removed objects, damage, and other action consequences do not reset for an absent actor. Perception
belongs to capable witnesses; interpretation may belong to a specialist; communication transfers only what a
source knows and can express. Gemini holds governed canonical truth but filters board focus, scan, action support,
and narration through the legal viewpoint. The human may see holder-labeled private scenes for dramatic irony
without granting that knowledge to an uninformed character. F10.7i closes.

#### F10.7j - when does the party learn a finding automatically, and when must someone actually communicate it?

In plain English: Genesis should not require “I tell everyone” after every ordinary search, but it also cannot make
party members psychically share a private glance, specialist conclusion, secret motive, or split-party discovery.
Does co-presence create instant shared knowledge, does every transfer require an explicit action, or can direct
observation and a bounded debrief protocol remove busywork without inventing character speech?

- **Option A - instant co-present party synchronization:** every non-hidden fact learned by any cooperative party
  member becomes party-common immediately whenever the party shares a scene. This is frictionless and easy to
  project, but treats proximity as telepathy: a rogue's tiny mark, a wizard's private inference, a whispered name,
  or a companion's reluctant recognition silently reaches everyone even during chaos.
- **Option B - shared perception plus low-friction governed callout/debrief windows (recommended):** citizens who
  directly perceive the same event learn it independently. Obvious public results need no speech. Holder-private
  observations and interpretations remain scoped until a legal callout, showing, report, journal/telepathy transfer,
  or bounded safe debrief occurs. The human player may adopt a default protocol that shares routine, non-sensitive
  findings among controlled cooperative PCs at eligible debrief windows, with visible exceptions; NPC companions
  retain agency, trust, motive, and explicit withholding.
- **Option C - every non-shared observation requires an explicit communication act:** even adjacent allies do not
  gain a finding unless the player chooses a recipient and performs speech, showing, writing, or another transfer.
  This protects agency precisely, but turns ordinary exploration into repetitive clerical dialogue and makes party
  switching feel like operating isolated save files.

Option B distinguishes observation from communication:

1. **Direct shared perception is not auto-speech:** if everyone sees the gate collapse, chest open empty, oil spill,
   or rogue lift a hinge pin in clear view, each eligible witness learns the observable event. No character is
   deemed to have narrated anything.
2. **Private sensory detail stays with its holder:** a mark visible only inside the chest, a whispered phrase, a
   smell only one form can detect, a private vision, or a thought learned through telepathy does not become common
   merely because allies stand nearby.
3. **Interpretation stays distinct from the shared observation:** several characters may see the same rune; only
   the wizard recognizes it. Showing or copying the rune can transfer its perceivable form, while the conclusion,
   confidence, source, and uncertainty transfer through a report.
4. **Immediate callouts use the existing communication contract:** an urgent warning, target call, shouted code,
   gesture, or telepathic message may share a fact during action only when range, language, silence, consciousness,
   timing, secrecy, and any relevant turn/action law permit it. Wave 10 does not create a new free-action loophole
   merely to synchronize UI.
5. **Safe debrief removes routine busywork:** at a quiet exploration beat, rest, reunion, post-combat aftermath, or
   another legal debrief boundary, controlled cooperative PCs may share routine actionable findings under the
   player's current party protocol. The receipt names source, recipients, facts, fidelity, and any excluded private,
   inexpressible, time-critical, or deliberately withheld material. No invented dialogue is required.
6. **Companion/NPC agency is never automated away:** an allied NPC may openly report routine mission facts when role,
   trust, promise, and motive support it; deliberate withholding, shame, fear, divided loyalty, domination, secret
   contract, or private motive prevents automatic transfer. Gemini cannot mark the information party-common merely
   because sharing would help pacing.
7. **The player can direct controlled-character privacy without constant prompts:** a standing/default protocol may
   share routine non-sensitive findings, while an explicit `keep private`/holder-scoped choice on a material fact
   prevents the next debrief transfer. The UI asks only when secrecy, holder conflict, or consequence is material,
   not after every hinge pin.

Concrete examples:

- The whole party watches the rogue pull a hinge pin from gate debris. Every capable witness knows the pin exists
  and who holds it; no `Tell Party` step appears.
- The rogue notices a tiny coded mark on the pin while the others watch the extraction but cannot see the mark.
  The object and custody are shared observation; the mark remains rogue-held. At the next safe debrief, the player's
  routine-share protocol may have the rogue show it to controlled PCs unless marked private. The wizard can then
  inspect/interpret the actual mark rather than inheriting the rogue's nonexistent arcane expertise.
- During combat the rogue discovers that the oil smells enchanted. The acting wizard does not silently receive a
  new spell target. The rogue must use whatever brief callout/telepathy law combat permits, or the information
  waits for a safe window. The physical oil state remains global.
- A split scout finds a secret door. The human may see the scene, but the remote group gains no focus cue or route.
  Reunion creates an eligible debrief; a message spell or returned map may share it sooner.
- Varka privately recognizes the royal mark and withholds it. No automatic controlled-PC protocol speaks for him.
  If he later reports it, the transfer preserves that Varka is the source; if he lies or omits, the report and
  canonical truth remain distinct.
- An unconscious companion directly occupies the scene but is not an eligible witness. Waking during the aftermath
  does not backfill perception; a report or visible current evidence may teach the result.

Party-common knowledge is therefore a derived shared scope with provenance, not a destructive merge. The source
fact and each holder remain available so later lying, forgetting mechanics, contradictory reports, private
knowledge, trust, and viewpoint-safe narration can resolve honestly. The human-facing UI may suppress routine
holder detail when everything is genuinely party-common, but material private knowledge must remain legible
without exposing its content to an uninformed active character. That exact visual treatment is the next follow-up.

**Implementation/maintenance cost:** Option A is low-medium transfer work and high agency/mystery/companion damage.
Option B is **high but reusable party-knowledge work**: witness derivation, shared-observation receipts, fact versus
interpretation separation, communication validation, safe-window/debrief events, controlled-PC sharing protocol,
material privacy exceptions, companion trust/motive hooks, provenance-preserving party-common scope, and combat/
split-party fixtures. Option C is high recurring UI/dialogue/action friction and save-state verbosity.

**Codex recommendation: Option B.** Let everyone learn what they genuinely witnessed. Let routine controlled-PC
findings flow at safe debriefs without scripted chatter. Require actual communication for private, urgent, split,
specialist, secret, or NPC-held knowledge. That protects both player time and character agency.

Does Adam accept Option B, prefer instant co-present synchronization under Option A, prefer explicit transfer for
everything under Option C, or want to amend one sharing boundary? If B is accepted, follow into F10.7k: how holder,
party-common, private, uncertain, and conflicting knowledge appear in the board card/history/scan without exposing
secret content or filling the UI with badges. Wave 10 remains **OPEN**; no build is authorized.

### 11.51 F10.7j ruling and F10.7k expansion - shared perception and safe debrief accepted; show knowledge without badge leakage

**Adam's ruling (2026-07-20):** choose Option B.

Eligible citizens learn obvious events they directly perceive without invented speech. Private sensory details and
specialist interpretations remain holder-scoped until a legal callout, showing, report, journal/telepathy transfer,
or safe debrief. Controlled cooperative PCs may share routine non-sensitive findings under the player's standing
protocol at quiet exploration, reunion, rest, aftermath, or another legal window, with material privacy exceptions.
Urgent transfer obeys existing communication/timing law. NPC/companion trust, motive, promises, secrecy, and agency
remain authoritative; Gemini never auto-shares their knowledge for pacing. Party-common scope preserves source and
holders rather than destructively merging them. F10.7j closes.

#### F10.7k - how does the UI show who knows what without leaking secrets or covering objects in knowledge badges?

In plain English: the human may control several PCs, know a private dramatic-irony fact, and hold conflicting
reports from Varka and a guard. Should every board object display portrait chips, locks, confidence meters, and
private-knowledge badges; should all knowledge live only in Gemini narration; or should the physical board remain
viewpoint-clean while the clicked card/history progressively discloses provenance the human has lawfully earned?

- **Option A - badge-rich board and card ledger:** every object/trace displays party-common, holder portraits,
  private locks, uncertainty bars, conflict symbols, and unread counts. This makes knowledge topology explicit and
  easy to manage, but overlays the world with database state, turns every mystery into a metadata puzzle, and leaks
  that an unseen holder or conflict exists even when the player has not earned its existence.
- **Option B - active-viewpoint board plus progressively disclosed holder-aware card/history (recommended):** the
  board, focus order, scan, and action treatments show only what the active acting viewpoint and applicable party-
  common scope license. Clicking opens the accepted ephemeral scrollable board card with a clear viewpoint header,
  ordinary common facts first, and source/holder/uncertainty/conflict detail only when material and human-visible.
  Private perspective content appears in a separate clearly labeled section or perspective view only if the human
  actually witnessed/earned it; no empty tab, lock, portrait, `???`, or count advertises unknown knowledge.
- **Option C - narration/journal-only knowledge provenance:** the board/card show only the current object state;
  Gemini prose and a general journal remember who learned or claimed what. This keeps object UI minimal, but makes
  contradictory reports, scoped knowledge, inspection method, confidence, and communication eligibility difficult
  to recover during play and burdens Gemini context with presentation memory.

Option B uses a small progressive hierarchy:

1. **Board/default focus:** only active-viewpoint and party-common physical evidence, attention state, legal focus,
   and actions. No portraits or knowledge badges orbit the object. Selecting another controlled character may
   lawfully change available cues/actions without reserving space for hidden ones.
2. **Card primary face:** current perceptible identity/state, common known description, custody, and primary legal
   actions under the selected viewpoint. A concise `Viewing as Mira` or equivalent header appears only when the
   viewpoint distinction matters; routine party-common cards need no repetitive label.
3. **Known provenance on inspection/history:** source labels appear where they affect trust or interpretation:
   `Observed by Mira`, `Varka reported`, `Copied from the prison map`, `Rogue's estimate`, or `Party witnessed`.
   Ordinary uncontroversial common facts may suppress verbose provenance until expanded.
4. **Human-earned private perspective:** if the human saw Varka privately recognize a crest, a clearly separated
   `Varka's private knowledge`/portrait-labeled perspective may be available to the human. It does not enter the
   selected PC's action rows, scan, target cues, Gemini character-voiced narration, or auto-focus. If the human never
   earned that scene, no UI element reveals that the section or holder fact exists.
5. **Uncertainty and conflicts:** express bounded natural-language confidence/source—`roughly two to three days
   old`, `Mira suspects`, `Varka claims`, `the guard denies`—rather than a fabricated 72% truth meter. Preserve
   claims side by side when their contradiction is known; do not merge them into an authoritative conclusion or
   reveal which hidden source is true.
6. **Transfer affordance:** `Share`, `Show`, `Report`, or another communication action appears only on a selected
   fact when there is a legal recipient/window and a material holder distinction. Routine debrief sharing needs no
   button. The control states what will transfer and never exposes facts the selected source does not know.
7. **Accessibility and text equivalence:** holder/source/private/uncertain/conflicting state uses explicit text and
   stable structure rather than color, portrait art, hover, or motion alone. Screen-reader order follows active
   viewpoint first, then lawful expanded human perspectives; broad accessibility-tier design remains P10.10.

Concrete examples:

- The party-common hinge pin card simply shows the pin, current holder, known state, and actions. It does not list
  every witness. Expanding history may show `Recovered by Mira from the shattered gate`.
- Mira privately noticed a coded mark. With another PC selected, the physical pin remains selectable because its
  existence/custody are common, but the mark and code-driven actions do not appear. If the human earned Mira's
  perspective, the card can separately show `Mira noticed a coded mark`; switching to or legally sharing from Mira
  makes the appropriate inspect/report action available.
- The human witnessed Varka recognize the crest and withhold it. A holder-labeled private perspective may remind
  the human of that dramatic irony, but the board does not highlight the secret door and the PC-facing card does
  not say `Varka knows something`. A human who never saw the private scene receives no badge or empty section.
- Varka says the blood is fresh while the rogue estimates it is several days old. The known-history expansion keeps
  both attributed claims. Gemini speaking from the PC viewpoint says that the accounts conflict; it does not expose
  a hidden canonical timestamp unless another legal method establishes it.
- A split scout discovers a route. The scout's perspective can show it; the remote party view does not. After a
  legal message/debrief transfer, provenance changes to a known report rather than pretending the remote PCs
  witnessed the door themselves.

The UI must not use the existence, absence, ordering, disabled state, or animation of a perspective tab as a secret
tell. Human-earned private material may remain available for dramatic irony, but an acting character's interaction
surface is generated independently from that human-visible layer. Gemini receives separate canonical, human-seen,
party-common, and acting-viewpoint digests so prose cannot collapse them accidentally.

**Implementation/maintenance cost:** Option A is medium-high badge/layout work and very high clutter/leakage/design-
language debt. Option B is **high but bounded projection/UI work**: viewpoint-filtered board/card/action models,
conditional headers, progressive provenance, human-earned private perspective routing, attributed uncertainty and
conflict, legal transfer controls, Gemini digest partitioning, accessible structure, and secret-leak fixtures.
Option C is low card work and high journal retrieval, ambiguity, AI-context, and player-memory cost.

**Codex recommendation: Option B.** Keep the board about the world the active character can act on. Let the focused
card reveal source and holder only as deeply as the human has earned and the decision requires. Never represent an
unknown secret with a lock, blank portrait, missing slot, or mysterious badge.

Does Adam accept Option B, prefer badge-rich Option A, prefer narration/journal-only Option C, or want to amend one
projection layer? If B is accepted, follow into F10.7l: how a long known object/place history condenses into a
readable causal account with expandable turning points rather than either an exhaustive event log or Gemini-only
summary. Wave 10 remains **OPEN**; no build is authorized.

### 11.52 F10.7k ruling and F10.7l expansion - progressive holder-aware cards accepted provisionally; review is mandatory

**Adam's ruling (2026-07-20):** choose Option B, but flag the feature for review.

> "B but should be flagged as a feature that needs review"

The active SceneTray board, scan, focus, and action treatments remain restricted to the acting viewpoint plus
applicable party-common knowledge. The clicked ephemeral board card may progressively disclose material source,
holder, uncertainty, conflict, and human-earned private perspective. Unknown knowledge receives no lock, empty tab,
portrait, `???`, count, layout reservation, focus change, or animation. Human-visible dramatic irony stays separate
from character action support. F10.7k is **provisionally accepted behind mandatory visual/interaction review**;
its exact card layout, perspective control, labels, disclosure depth, and transfer affordance are not yet approved.

The review gate must include at least:

1. the same object in party-common, one-PC-private, companion-private-but-human-seen, companion-private-and-human-
   unseen, uncertain, and conflicting-report states;
2. active-character switching, split-party switching, card open/close, focus order, known-interactable scan,
   Share/Show/Report eligibility, and Gemini narration generated from each relevant viewpoint;
3. a dense card with current state, actions, inspection coverage, custody, history, two holders, uncertainty, and a
   known conflict at the accepted 2560x1440, 1920x1080, and 1194x834 shells;
4. comparison against a genuinely clean common-knowledge card to prove progressive disclosure does not make every
   ordinary object feel like a case-management screen;
5. adversarial secret-leak checks for empty space, tab count/order, disabled controls, portrait presence, focus/
   scan order, card height, animation, screen-reader order, and Gemini wording;
6. comprehension questions: what does the selected PC know, what does the human know only through dramatic irony,
   what is merely claimed, what conflicts, what can legally be acted on now, and what could be shared;
7. non-color, text, keyboard/controller/touch, screen-reader, and reduced-motion equivalents for this feature's
   own states, while broad supported-device/accessibility tiers remain P10.10.

Reopen F10.7k if players confuse human knowledge with acting-character knowledge, private perspective content
creates actionable hints, ordinary cards accumulate badge clutter, source/uncertainty becomes unreadable, changing
characters causes surprise content jumps without orientation, or any unseen fact changes measurable UI structure.
Do not silently fix a failed review during implementation or treat this provisional ruling as acceptance of one
mockup.

#### F10.7l - how should years of known object and place history fit inside a readable card?

In plain English: the canonical ledger may contain hundreds of receipts for a gatehouse, chest, weapon, blood
field, or town square. Should the card expose the whole chronological log, let Gemini summarize it from memory, or
derive a compact causal account whose turning points can be expanded into exact known provenance?

- **Option A - exhaustive chronological event log:** every known receipt appears in time order: each movement,
  inspection, failed attempt, stain contribution, cleanup stage, ownership transfer, damage tick, claim, and UI-
  relevant state change. This is complete and auditable, but overwhelms the accepted object card, hides important
  causes among routine events, and makes “what happened here?” require database archaeology.
- **Option B - deterministic causal turning-point summary with expandable known provenance (recommended):** the
  primary card leads with current state, current consequence/affordance, and the small set of known events that
  explain why it is now this way. Creation/arrival, identity/custody, topology/mechanical state, important damage/
  repair, discoveries/claims, lifecycle transformations, and unresolved promises become turning points. Repeated
  routine receipts coalesce under typed summaries. Expanding a turning point exposes its lawful time, source,
  actors, receipts, confidence, knowledge scope, and linked object/place history without revealing hidden canon.
- **Option C - Gemini-written narrative recap only:** the card shows current state while the player asks the DM what
  happened. Gemini composes a readable story from available context. This is elegant when it works and requires
  little timeline UI, but context compaction, salience judgment, conflicting claims, and long campaigns can omit or
  rewrite causes; the player cannot reliably inspect provenance behind the prose.

Option B uses a deterministic reading order rather than one global importance score:

1. **Current truth and handles:** what the object/place is now, its current owner/location, active hazard or
   obstruction, available interaction, unresolved promise, and any known uncertainty that affects a decision.
2. **Why it is this way:** the minimal known causal spine connecting prior state to the current condition—`gate
   shattered by the ogre`, `hinge pin removed by Mira`, `workers cleared loose debris`, `royal mark later recognized
   from the recovered pin`.
3. **Identity, custody, and topology turning points:** creation/arrival, naming/recognition, transfer/loss/recovery,
   attachment/removal, opening/closing/breakage/repair, route creation/destruction, or another change that alters
   what the citizen is, where it is, who controls it, or what it permits.
4. **Discovery and claim turning points:** first observation, material reinterpretation, communication, promised
   reveal, contradiction, correction, or loss of evidence. Claims remain attributed; a later contradiction does not
   rewrite the earlier report into truth.
5. **Lifecycle and representative summaries:** many blood-darkening stages, ordinary weather exposure, routine
   sweeps, repeated minor damage, or coalesced trace contributions may appear as `Blood dried over three days` or
   `Loose debris was cleared during two maintenance cycles`, expandable to the known receipts when material.
6. **Earlier known history:** older resolved turning points fold behind an explicit known-history expansion or
   timeline/filter inside the card's scroll container. The existence and count of **known** entries are safe; hidden
   events, holders, conflicts, and gaps never create blank rows or unread counts.

The summary is a pure projection from typed state/events and viewpoint knowledge, not a new canonical narration.
Gemini may turn the same structured causal spine into prose, answer follow-up questions, or dramatize a revisit,
but the card and DM share the same selected turning points and source links. If the deterministic summary cannot
explain the current state, that is a provenance/contract failure rather than permission for Gemini to invent a
bridge.

Concrete example: after several visits, the gatehouse card begins with `Gate shattered; passage open; loose debris
cleared; royal hinge pin held by Mira`. Its causal spine shows the ogre's strike, Mira's pin recovery, the prison
maintenance cycle, and Varka's later recognition. Seventeen blood contributors and three ordinary darkening stages
do not occupy twenty rows; they appear as a known `Blood from the gatehouse fight dried over three days` turning
point, expandable to contributor/source detail when the investigation makes that material. An optional smuggler
clue erased before discovery never creates a mysterious gap. Varka's disputed claim and the guard's denial remain
separate attributed history until lawfully resolved.

Object and place accounts link rather than duplicate each other. The pin card may link to its recovery from the
gate; the gatehouse card may cite the pin as a turning point. Expanding either follows the same canonical receipt,
not two summaries that can drift. Current physical state remains primary; history never becomes a permanent overlay
on the board.

**Implementation/maintenance cost:** Option A is medium log/UI work and very high readability, performance-at-
interaction, and support debt over long campaigns. Option B is **medium-high reusable history-projection work**:
turning-point taxonomy, causal-spine derivation, typed coalescing, viewpoint-safe known-entry expansion, attributed
claims/conflicts, linked object/place receipts, deterministic Gemini digest parity, and long-history fixtures.
Option C is low initial UI and high AI-context, recap drift, provenance, testing, and player-trust cost.

**Codex recommendation: Option B.** Preserve the full ledger for truth and audit, but let the player read the
current state, the few events that caused it, and expandable known turning points. Gemini should narrate that spine,
not become its only keeper.

Does Adam accept Option B, prefer an exhaustive log under Option A, prefer Gemini recap under Option C, or want to
amend the turning-point hierarchy? If B is accepted, F10.7m will perform the P10.7/G10.2/generated-follow-up audit,
assemble the mandatory review/playtest corpus, identify any remaining material attention/history branch, and ask
whether P10.7 may close provisionally behind those gates before advancing to P10.8. Wave 10 remains **OPEN**; no
build is authorized.

### 11.53 F10.7l provisional ruling and F10.7l.1 expansion - causal spine accepted for now; it must not flatten Gemini's voice

**Adam's ruling (2026-07-20):** choose Option B for now, conditional on the result not producing dry storytelling.

> "B for now, as long as this doesn't result in dry storytelling"

The card may therefore use the deterministic current-truth/causal-turning-point/expandable-known-provenance
hierarchy from section 11.52, provisionally. That structure is an interaction and truth surface, not the required
voice of Gemini's narration. F10.7l does not close until the following follow-up establishes how expressive
retelling stays varied and alive without becoming a second, drifting history owner.

#### F10.7l.1 - should Gemini read the causal ledger literally, retell it expressively inside hard anchors, or own the recap freely?

In plain English: `Ogre shattered gate; Mira removed pin; workers cleared debris; Varka recognized crest` is a good
machine spine and bad finished storytelling. Should Genesis accept that terse register everywhere, let Gemini turn
the exact spine into scene-appropriate prose without changing its facts, or let Gemini write the history freely and
treat the ledger as optional background?

- **Option A - one literal structured register for card and narration:** Gemini closely reads or lightly joins the
  deterministic turning-point sentences. Accuracy, accessibility, testing, and localization are straightforward,
  but revisits become report-like, every object sounds written by the same database, and the AI DM loses much of
  the timing, mood, personality, humor, horror, and callback work the product exists to provide.
- **Option B - fact-locked causal spine plus an expressive narrative envelope (recommended):** the card keeps its
  concise deterministic account and expandable provenance. Gemini receives required factual/epistemic anchors plus
  a bounded freedom envelope for diction, cadence, imagery, emphasis, emotional framing, known motifs/callbacks,
  scene voice, and length. It may shape a compelling recap or revisit beat, but cannot add, resolve, relocate,
  reorder, or conceal a material fact beyond what the requested narrative moment and viewpoint law permit.
- **Option C - free Gemini recap with ledger available only for correction:** Gemini writes what feels dramatically
  right from the broader context and the structured history is consulted only when challenged. This maximizes
  immediate prose freedom, but long campaigns and context compaction will omit custody, smooth over conflicts,
  invent connective tissue, promote guesses into truth, and eventually make the beautiful recap disagree with the
  board.

Option B separates **required anchors** from **expressive freedoms**:

| Required narrative anchors | Gemini may vary freely |
|---|---|
| Current object/place state, location, custody, and active consequence. | Sentence structure, rhythm, paragraph length, ordering of non-causal descriptive clauses, and degree of compression appropriate to the moment. |
| Material causal order and dependencies: what changed what, and which results still matter. | Voice, tone, tension, humor, dread, tenderness, irony, and realm/site-specific diction. |
| Stable identities, source attribution, known time/order, and whether a detail is observed, inferred, reported, disputed, or unknown. | Which known sensory details receive emphasis and how they are described, provided no new sensory fact is invented. |
| Viewpoint/holder boundaries, secrets, uncertainty, contradictions, and unresolved promises. | Player-authored phrases, established motifs/callbacks, relationship texture, and character-aware framing within their existing recurrence/permission rules. |
| Requested scope: brief reminder, arrival/revisit beat, forensic explanation, object history, or full recap. | Metaphor and imagery that do not establish new materials, actors, motives, magic, evidence, mechanics, or history. |

Gemini may omit routine or already understood turning points from a **brief dramatic beat** when the current state
and requested scope remain clear; it may not omit a material cause in an answer that claims to explain the current
state. The card remains available as the concise stable reference. If the human asks “how did the gate end up this
way?”, the response must cover the causal spine appropriate to that question. If the scene only needs an arrival
line, it may select one or two resonant anchors rather than reciting the timeline.

Concrete example from the same accepted facts:

```text
Dry machine spine:
Ogre shattered gate. Mira recovered hinge pin. Workers cleared debris.
Varka recognized royal mark.

Legal expressive revisit:
The gate still hangs open from the ogre's blow, but the prison hands have swept
most of the wreckage away. Mira kept the one piece that mattered: the hinge pin
Varka later named as royal work.
```

The expressive version may change cadence and emphasis, but it preserves current open/broken state, causal actor,
cleanup, custody, and recognition. It may not add that Mira left pry marks, that Varka lied, that the blood smells
of almonds, or that royal magic still hums in the pin unless those facts are separately canonical and known to the
active viewpoint.

For conflicting history, Gemini dramatizes attribution without adjudicating it: `Varka insists the blood was
fresh; Mira's estimate puts it days older.` It cannot choose the more vivid speaker as truth. For private dramatic
irony, a human-facing recap may acknowledge a private scene only within a clearly held perspective; character-
voiced narration remains bound to the character's knowledge.

The narrative envelope should provide several governed output shapes from the same spine:

1. **glance/reminder:** one vivid sentence anchored in current state;
2. **revisit beat:** a short atmospheric paragraph emphasizing what visibly changed since the last legal viewpoint;
3. **interaction explanation:** concise causal prose explaining why an action is available, blocked, or changed;
4. **history answer:** fuller chronological/causal retelling with attribution and uncertainty intact;
5. **forensic or disputed account:** source-conscious comparison that preserves evidence, claims, gaps, and
   confidence without turning analysis into omniscience.

Dryness and factual drift must be reviewed together. The future gate uses the same fixed histories across Gloom,
Chrome, and Fantasy; mundane and dramatic objects; quiet revisit, combat aftermath, mystery, and social dispute;
brief and extended outputs; context-compacted restore; and several established player motifs. Reviewers judge
whether prose is varied, emotionally/tonally appropriate, non-repetitive, and worth reading **and** whether every
material statement maps to a lawful anchor. A colorful narration that invents history fails; a perfect narration
that sounds like a receipt dump also fails.

**Implementation/maintenance cost:** Option A is low-medium templating/localization work and high product-voice
damage. Option B is **medium-high prompt/projection/review work**: anchor schema, requested-scope/output-shape
routing, expressive-permission envelope, motif/voice context, viewpoint partitioning, fact-to-prose audit,
compaction parity, variation corpus, and combined taste/accuracy review. Option C is low initial constraint work
and very high continuity, correction, trust, regression, and AI-context cost.

**Codex recommendation: Option B.** The ledger should guarantee that Gemini knows what story it is telling, not
dictate the sentences. Keep facts, causality, custody, uncertainty, and viewpoint hard; give voice, pacing, imagery,
emphasis, motif, and emotional framing real room to breathe.

Does Adam accept Option B, prefer literal structured narration under Option A, prefer free recap under Option C, or
want to amend the expressive envelope? If B is accepted, F10.7l closes provisionally behind the combined dryness/
accuracy review and F10.7m proceeds to the full P10.7/G10.2/generated-follow-up audit before any advance to P10.8.
Wave 10 remains **OPEN**; no build is authorized.

### 11.54 F10.7l/F10.7l.1 ruling and F10.7m audit - causal cards plus expressive retelling accepted; contested ownership remains

**Adam's ruling (2026-07-20):** choose Option B.

The deterministic card projection preserves current truth, the minimal causal spine, typed known turning points,
attributed claims/conflicts, and expandable lawful provenance. Gemini receives the same hard factual, causal,
custody, uncertainty, and viewpoint anchors, but may vary diction, cadence, imagery, emphasis, emotional framing,
known motifs/callbacks, scene voice, and output length inside the accepted expressive envelope. Brief dramatic beats
may select resonant anchors; an answer claiming to explain the current state must cover its material causes. The
combined review fails both invented colorful history and dry receipt-dump prose. F10.7l and F10.7l.1 close
provisionally behind that accuracy/taste gate.

#### F10.7m - P10.7/G10.2/generated-follow-up audit

The original P10.7 and additive G10.2 obligations now map as follows:

| Required subject | Settled branch | Audit result |
|---|---|---|
| Known interactables and attention | F10.7a, F10.7g | Restrained ambient/noticed/relevant/active/historical ladder; evidence-led focused inspection; provisional behind playtest. |
| Promotion and arbitrary new detail | F10.6e, F10.7e-F10.7h | Same-id physical/marker promotion, precision-honest remount, finite unresolved envelopes, no prompt rerolls, causal-delta reopening. |
| Secret tells and clue durability | F10.7a, F10.7c-F10.7d | Viewpoint-earned evidence only; deterministic lifecycle; causal opportunity rather than clue plot armor. |
| Evidence, damage, and active hazards | F10.3 feedback spine, F10.7a-F10.7c | Receipt-driven state/sound/card feedback plus persistent physical current state and lifecycle-owned traces. |
| Accumulated history | F10.7b-F10.7l.1 | Bounded projection never bounds truth; coalescence, aging, cleanup, remount, history cards, and expressive retelling are specified. |
| Knowledge, privacy, and contradictory accounts | F10.7i-F10.7l.1 | World-global coverage, scoped knowledge, governed sharing, review-gated holder-aware cards, attributed conflicts. |
| Missing bespoke art | F10.6e, F10.7a, F10.7e | Truthful physical proxy/marker/card/reserve/fallback preserves interaction and focus without substituting false art. |
| Performance/device/accessibility tiers | P10.10 | Correctly deferred; F10.7 specifies only non-color/non-audio/reduced-motion equivalents for its own attention states. |

The audit finds one material original word only partially answered: **ownership**. Current custody/holder is explicit,
visible heraldry may be evidence, and card history preserves transfer provenance. But Genesis has not yet decided
what the player sees when current holder, legal owner, maker's mark, faction claim, operational controller, thief,
borrower, disputed claimant, and secret true owner are different. Collapsing them into one `Owner` label would leak
canon and make theft, permission, loyalty, and contested property visually dishonest.

#### F10.7m.1 - how does ownership call attention to itself when possession, title, marks, and claims disagree?

In plain English: the PC may hold the turtle communicator, Varka may claim it, a royal crest may mark its origin,
the prison may legally control it, and a hidden faction may be its true maker. Should the board choose one owner
badge, leave ownership entirely to Gemini, or show only physical custody/marks on the board while the focused card
separates the ownership facts and claims this viewpoint actually knows?

- **Option A - one authoritative owner/faction treatment per object:** every relevant object receives a color,
  crest, portrait, or `Owned by X` label chosen from canonical truth. This makes theft and allegiance immediately
  legible, but collapses possession, control, title, origin, claim, permission, and belief; it can expose a secret
  faction or legal owner the character has no way to know and adds another permanent badge language.
- **Option B - physical custody and marks on the board; viewpoint-known ownership roles and claims in focus
  (recommended):** the scene shows who physically holds, wears, occupies, guards, attaches, or controls the object
  and any actually visible crest, tag, seal, wear pattern, container context, or posted restriction. The focused
  card distinguishes current holder/custodian, known controller, visible marking/origin, claimed owner, known title/
  permission, and disputed or uncertain reports only when material and earned. Transfer changes custody immediately;
  ownership/title changes only through its own legal, social, faction, gift, sale, theft-resolution, or other
  canonical receipt. Unknown ownership has no reserved badge or hidden truth label.
- **Option C - ownership exists only in Gemini narration and NPC reaction:** the board/card show location, holder,
  and generic actions, while the DM explains whether touching, taking, borrowing, or using something is permitted.
  This avoids UI taxonomy, but makes routine custody/permission hard to inspect, forces repeated AI questions, and
  lets narration drift between holder, claimant, and legal owner.

Option B separates roles instead of manufacturing one owner field:

| Role | Player-facing treatment when known/material |
|---|---|
| **Physical holder/custodian** | Shown by the object being held, worn, carried, contained, mounted, or listed in current custody. This is physical state, not proof of title. |
| **Operational controller** | Shown through current control/permission state when it affects use: keyed mechanism, attuned user, assigned operator, guarded station, leased room, or faction-controlled gate. |
| **Visible mark or apparent origin** | The board may show an earned readable crest, seal, maker's mark, uniform pattern, tag, damage/wear, or contextual placement. The card says `marked with the royal crest`, not `royally owned`, unless title is separately known. |
| **Claimed owner** | Attributed in the card/history: `Varka claims this`, `the prison inventory lists it`, `Mira says it was abandoned`. Conflicts remain side by side. |
| **Known title/permission** | A known sale, gift, loan, duty issue, seizure, salvage ruling, theft judgment, faction law, or contract may establish title or licensed use at its proper scope. It never follows custody automatically. |
| **Unknown or secret truth** | No badge, empty field, disabled row, scan ordering, or Gemini hint. It enters presentation only through lawful evidence/reveal. |

Concrete examples:

- Mira picks up the dropped turtle communicator. The board and card update `Held by Mira`. If Varka claims it, the
  history shows his attributed claim; custody does not settle title. A known gift can later change title. A secret
  Chrome maker receives no logo/label unless a viewpoint has actually recognized the construction.
- A chest in an occupied prison sits inside a guarded evidence room under visible prison seals. The scene and card
  can communicate `sealed/controlled by the prison` and known permission consequences. If the chest was stolen from
  a merchant, that hidden history does not glow through the seal; a learned ledger entry can later add the
  merchant's claim without erasing current prison custody.
- A royal crest on the hinge pin is physical evidence of marking/origin, not automatic proof that the crown
  presently owns the pin. Varka and a guard may disagree; the card preserves both claims. Gemini may warn of known
  social/legal risk but cannot announce the hidden correct claimant.
- An unattended sword may be physically unheld while still visibly marked and known to belong to an ally. `Take`,
  `Return`, `Borrow`, or `Steal` wording depends on acting-viewpoint knowledge and legal/social contracts. Unknown
  ownership cannot silently change the mechanics of pickup, though later NPC/world consequences may follow their
  own knowledge and authority.
- A dominated companion physically holds an item and may operationally control it while title remains unchanged.
  Current allegiance glow never becomes an ownership color.

Strong attention treatment remains reserved for active selection, known urgency, or a player-invoked relevant
focus. Ownership does not add a permanent aura around every prop. A visible seal, guard behavior, storage context,
holder animation, or object-card wording ordinarily carries it. If taking an object has a **known material
consequence**, the accepted known-consequence warning law applies; unknown witnesses, secret title, and hidden
faction response do not leak into the prompt.

**Implementation/maintenance cost:** Option A is medium badge/data work and high leakage, legal-model, and visual-
clutter debt. Option B is **medium-high reusable custody/claim projection work**: distinct role fields/relations,
visible-mark evidence, transfer versus title receipts, viewpoint knowledge, attributed claims/conflicts, permission/
action wording, physical bindings, Gemini digest separation, and theft/gift/loan/seizure/salvage fixtures. Option C
is low UI work and high repeated-AI, ambiguity, continuity, and player-trust cost.

**Codex recommendation: Option B.** Show possession and visible marks as physical facts. Treat ownership, title,
permission, origin, and claims as separate knowledge-bearing relations. Let the player inspect what is known without
turning the board into a property-label overlay or revealing the hidden answer.

Does Adam accept Option B, prefer one authoritative owner treatment under Option A, prefer narration-only
ownership under Option C, or want to amend one role? If B is accepted, F10.7n will re-audit the complete branch,
assemble its mandatory review/playtest corpus, and ask for provisional P10.7 closure before P10.8. Wave 10 remains
**OPEN**; no build is authorized.

### 11.55 F10.7m.1 ruling and F10.7n closure audit - physical possession, attributed ownership; P10.7 awaits explicit closure

**Adam's ruling (2026-07-20):** choose Option B.

The SceneTray shows current custody/control and genuinely visible marks/context as physical facts. The focused card
separates holder/custodian, operational controller, visible mark/apparent origin, attributed claimant, known title,
and licensed use/permission only when material and viewpoint-earned. Pickup/transfer changes custody; gift, sale,
loan, seizure, salvage, theft resolution, faction law, or another owned receipt changes title/permission. A crest
does not prove current ownership, a claim does not become truth, allegiance glow is never ownership color, and
unknown ownership creates no badge, field, ordering, or hint. F10.7m.1 closes.

#### F10.7n - complete P10.7/G10.2/generated-follow-up closure audit

The F10.7m audit's ownership gap is now resolved. Rechecking the original question, G10.2, and every generated
branch finds no remaining **principle-level** P10.7 question:

1. **Interaction and known affordances:** restrained ambient/noticed/relevant/active/historical attention;
   focused card/action state; no universal glow or completion UI.
2. **Promotion and arbitrary detail:** same-id physical/marker promotion; precision-honest remount; bounded
   unresolved-detail envelopes; deterministic commitment; no prompt rerolls; causal-delta reopening.
3. **Secret tells and evidence:** viewpoint-earned evidence only; no hidden affordance cues; deterministic trace
   lifecycle; causal discovery resilience rather than clue plot armor; optional secrets may be lost honestly.
4. **Damage, hazards, and state:** current mechanical/topological truth remains explicit; receipts drive physical,
   sound/caption, card, and fallback feedback; history/LOD never changes the world.
5. **Accumulated history:** bounded layered projection over complete canonical truth; typed coalescence; lifecycle-
   owned aging/cleanup/repair; reversible remount; known causal turning-point card; expressive fact-locked Gemini
   retelling.
6. **Inspection:** evidence-led focus; method/coverage state; exact meanings for failure/exhaustion/uncertainty;
   finite causal detail; stronger methods expose only new scope; equivalent retries do not reroll.
7. **Knowledge and privacy:** world-global physical coverage; scoped perception/interpretation; governed sharing and
   safe debriefs; NPC agency; holder-aware progressive disclosure; human dramatic irony never becomes character
   action knowledge.
8. **Ownership:** physical possession/visible marks on the board; custody, controller, origin, claim, title, and
   permission separated and viewpoint-filtered in focus/history.
9. **Missing art and equivalents:** truthful proxy/marker/card/reserve fallback; no known interactable disappears;
   attention-specific non-color/non-audio/reduced-motion equivalents remain mandatory.

The following are **named later implementation/detail owners**, not skipped P10.7 decisions:

- P10.8 owns receipt-to-animation sequencing for all accepted interaction/history state changes;
- P10.10 owns numeric frame/memory/load budgets, quality/device tiers, complete input targets, and broad
  accessibility promises;
- P10.12 owns fixed same-state cross-mode captures and final acceptance evidence;
- Wave 8 owns the detailed material damage/propagation/repair physics beneath the accepted lifecycle boundary;
- Wave 9 owns full Gemini strategic context/hand policy and Motif/Callback scheduling beneath the accepted
  expressive-history envelope;
- Wave 12 owns canonical-ledger persistence, compaction, migration, storage, and replay mechanics while preserving
  the P10.7 semantic invariants.

#### Mandatory F10.7 review/playtest corpus

P10.7 may close at questionnaire level only **behind** this future evidence gate. The corpus must reuse stable
canonical state and compare the same truth across accepted representations/fallbacks rather than inventing a
friendlier scene for each test.

**Attention, interaction, and secret leakage**

1. A dense room with ambient dressing, several known interactables, one relevant mechanism, one active selection,
   old history, one known hazard, and one hidden hazard. No icon field; known things remain discoverable.
2. The same secret panel as undiscovered, evidence-suspected, discovered, opened, damaged, repaired/covered, and
   revisited. Test board, camera/focus, scan, card, narration, and accessible ordering for leakage.
3. Physical integrated object, precise marker/card, missing-art fallback, and promoted proxy versions of the same
   known interactable. Comprehension and action availability remain equivalent.
4. Open/looted chest, punctured cask, active oil/fire, moved cover, extinguished practical, dropped item, broken
   portal, and optional clue lost before discovery.

**Durable history, lifecycle, and inspection**

5. The prison gatehouse across first visit, battle, immediate aftermath, three-day catch-up, maintenance/no-
   maintenance branches, rain/exposure split, repair, cleanup, lower-detail projection, and later forensic remount.
6. Coalesced blood/debris with exact, zone-level, moved, covered, destroyed, and current-holder contributors. No
   contributor teleports or gains false precision when promoted.
7. Finite rubble/ash envelopes with success, failure, partial coverage, consumed fragile detail, equivalent repeat,
   stronger method, exposed new layer, new deposit/version, knowledge reinterpretation, and action-created object.
8. Optional clue mortality, mandatory-route resilience, promised/paid discovery service, already learned evidence,
   and explicit blocked/failed/transformed objective states.

**Knowledge, ownership, and card review**

9. Party-common observation; private PC detail; split scout; unconscious witness; specialist interpretation;
   safe debrief; urgent combat callout; unknown language; controlled-PC privacy; companion withholding; deliberate
   lie; telepathy/report transfer; and human-earned dramatic irony.
10. The same card in common, one-PC-private, companion-private-human-seen, companion-private-human-unseen,
    uncertain, and conflicting states. No hidden fact changes layout, tabs, spacing, disabled controls, focus order,
    scan, animation, screen-reader order, or Gemini language.
11. Custody/title/claim cases: held-but-not-owned, borrowed, gifted, stolen, seized, salvaged, faction-marked,
    disputed, secretly made, unattended-but-known-owned, dominated holder, and operational control without title.
12. A dense long-history card and a simple ordinary card at 2560x1440, 1920x1080, and 1194x834, including
    click/off-click lifecycle, scrolling, character switching, share eligibility, and no case-management clutter.

**Storytelling and comprehension**

13. One fixed causal history rendered as glance, revisit beat, interaction explanation, full history, and forensic/
    disputed account across Gloom, Chrome, and Fantasy; mundane and dramatic subjects; fresh and context-compacted
    sessions; several licensed player motifs/callbacks.
14. Dual review: every material narrative claim maps to a lawful anchor, and prose is varied, vivid, tonally apt,
    non-repetitive, and worth reading. Invented history and receipt-dump dryness both fail.
15. Player questions after each relevant state: What can I interact with now? What is merely old evidence? What is
    hidden/unknown? What was searched and by whom? Can the same method do more? What new cause reopened it? Who
    knows this? What is only claimed? Who holds it? Who is known to own/control it? What can this character legally
    act on or share?
16. Click, keyboard/controller/touch, player-invoked known-interactable scan, non-color/non-audio cues, reduced
    motion, captions/text, and screen-reader equivalents for the P10.7-specific states. P10.10 later broadens and
    measures the release accessibility/device contract.

Reopen the specific owning branch—not P10.7 vaguely—if the tests show missed known interactables, secret leakage,
glow/badge clutter, historical residue mistaken for a prompt, renderer-caused cleanup, false precision, clue plot
armor, silent soft-lock, prompt rerolls, physical/knowledge collapse, unwanted auto-disclosure, ownership confusion,
unreadable cards, fact-drifting narration, or dry storytelling. A failed gate cannot be repaired silently during
implementation.

**Codex audit recommendation:** accept this as the complete design-level P10.7/G10.2 settlement and close P10.7
**provisionally behind the named review/playtest gates**. This does not mark Wave 10 complete. It authorizes the
questionnaire to advance next to original **P10.8 - transitions and verbs**, while P10.9 remains mandatory after it
and performance/device/accessibility stays at P10.10.

Does Adam explicitly accept this audit and close P10.7 provisionally behind its mandatory gates, or is there a
specific attention, promotion, secret, history, inspection, knowledge, ownership, or storytelling branch that must
reopen first? Wave 10 remains **OPEN**; no build is authorized.

### 11.56 Explicit P10.7 closure and F10.8a expansion - attention/history closes behind review; schedule crowded receipts

**Adam's ruling (2026-07-20):** explicitly accept the F10.7n audit and close P10.7 provisionally behind all named
mandatory review/playtest gates.

P10.7/G10.2 and every generated F10.7 branch are closed at design-questionnaire level. A failed future gate reopens
the specific owning branch under section 11.55; it does not permit silent drift. This closure does **not** close Wave
10. The questionnaire now advances to preserved original **P10.8 - transitions and verbs**. P10.9 remains mandatory
after P10.8, and performance/device/accessibility remains P10.10.

P10.8's section 11.1 baseline remains accepted and is not being re-asked: canonical events commit first; one
receipt-to-visual-cue system projects placement/reveal, movement, attack/reaction, damage/death, condition,
transformation, object state, terrain/topology, pickup/transfer, and scene transition. Presentation may interpolate,
pause, skip, reduce, or rebuild terminal state, but never changes mechanics or reorders causal dependencies. The
material open branches are simultaneous/crowded events, input and queue backpressure, interruption/skip/rebuild,
staged emphasis, cross-mode handoff, and executable proof.

#### F10.8a - when many receipts arrive together or faster than animations can play, what stays serial and what may overlap?

In plain English: a door may unlock, open, admit a fighter, trigger a reaction, shatter, spill oil, ignite, damage
six creatures, and collapse a platform while Gemini is still narrating the first beat. Should Genesis play every cue
one at a time, snap rapidly to the final state, or preserve causal dependencies while safely overlapping independent
effects and compressing repetition?

- **Option A - strict complete serial playback:** every visual/audio/caption cue plays to completion in canonical
  receipt order before the next cue begins. This makes chronology obvious and the scheduler simple, but large
  battles and CrisisChains accumulate long queues, simultaneous events look artificially turn-taking, repeated
  damage becomes tedious, and player input waits behind presentation that cannot change the outcome.
- **Option B - dependency-preserving transactional cue scheduler with typed parallelism/compression
  (recommended):** receipts retain canonical total order, while each committed transaction exposes cue dependencies
  and typed presentation groups. Causes and consequences that must be understood remain serial; independent or
  genuinely simultaneous cues may overlap within a governed group; repeated homogeneous feedback may coalesce or
  accelerate without losing affected identities, amounts/states, sources, or terminal truth. Skip/reduced motion/
  rebuild consume the same dependency graph and land on the same state.
- **Option C - terminal-state-first snap with only headline animation:** mechanics commit and the board immediately
  rebuilds final state; one selected “important” cue receives animation while the rest become card/narration log.
  This is fast and cheap, but hides trigger order, reactions, movement interruption, custody changes, and why a
  room changed; subjective headline selection can also turn presentation into an opaque importance judgment.

Option B treats a committed action/effect as a **transactional cue graph**, not a second mechanics graph:

1. **Canonical receipt order is immutable:** cue scheduling reads receipt ids, transaction ids, parents, targets,
   committed states, and dependencies. It never decides whether an attack hit, a reaction fired, a door broke, or
   oil ignited.
2. **Hard causal edges serialize:** unlock before open; open before crossing; entry into the reaction trigger before
   the reaction; damage before death/remains; pickup before transfer/custody display; support failure before fall;
   reveal before a newly visible citizen acts.
3. **Independent/simultaneous siblings may overlap:** several targets damaged by one fireball may react together;
   passengers and attached objects descend with the same lift; separate lights extinguished by one pulse may fade
   as a group. Each affected citizen remains individually receipted and recoverable in card/caption/history.
4. **Typed repetition may compress, never disappear:** ten identical minor damage flinches may share one bounded
   impact window, but every target's damage/down/death/condition truth, speakable identity, and accessible result
   remains available. A named boss transformation, route closure, PC downing, custody change, or topology mutation
   cannot be swallowed by a generic crowd beat.
5. **Board truth is the minimum lane:** the BattleMat always shows exact movement/path/trigger, target/area, current
   state, topology, hazard, and custody consequences required to follow play. EngagementLens, camera emphasis,
   particles, sound, and Gemini prose may add drama but never become the only record.
6. **Presentation clocks are independent of mechanics clocks:** speed-up, pause, skip, reduced motion, collapsed
   lens, backgrounded tab, or missed frames alter cue realization only. A rebuild from committed terminal state
   cancels obsolete drawables cleanly and cannot replay mechanics.
7. **Backpressure is visible and bounded:** if committed transactions outpace presentation, the scheduler may
   accelerate typed durations, overlap legal siblings, compress repeated families, or offer Catch Up/Skip to
   Current. It never silently reorder causes, drop a material state change, or let Gemini narration hold the queue
   hostage.

Concrete dungeon/Gemini-DM examples:

- The fighter unlocks and opens a door, crosses the threshold, and a reaction shatters it behind her. Those beats
  remain serial because later legality and comprehension depend on earlier state. Skipping lands on the fighter's
  committed cell, spent reaction, broken/open passage state, and debris trace.
- A fireball damages six goblins. Impact/area appears once; six hit responses may overlap in one window. Goblin 2's
  death, Goblin 4's concentration loss, and Goblin 6's newly exposed carried communicator remain individually
  readable and accessible rather than becoming `six enemies affected`.
- A freight lift descends with Varka, two prisoners, and the dropped communicator attached to its reference frame.
  Their shared descent animates concurrently. The crash must precede its damage, knock-loose, topology, and remains
  consequences; a later rebuild reads current attachments/custody rather than replaying the fall.
- Oil spills, then ignites, then fire reaches two adjacent cells. Spill and ignition serialize; simultaneous damage
  siblings may overlap. Gemini may narrate the blaze expressively from the committed graph, but prose does not delay
  the board or choose which target mattered.
- Three independent guards reveal at once. Their placement/reveal cues may form one staged group; any guard action
  waits until reveal and accepted initiative/opening authority make it legal. No hidden portrait or placeholder
  appears early.

The scheduler's compression policy is typed and reviewable rather than a black-box salience score. Cue families
declare required anchors, legal sibling overlap, minimum readable duration or static equivalent, compressibility,
terminal rebuild behavior, sound/caption grouping, and whether a named/current-PC/topology/custody consequence
forces individual emphasis. Exact duration values and performance thresholds remain evidence-driven P10.10/P10.12
work; P10.8 decides ordering and semantic preservation.

**Implementation/maintenance cost:** Option A is medium queue/state-machine work and high pacing/backlog debt.
Option B is **high reusable motion orchestration work**: transaction/cue dependency graphs, typed family policies,
parallel groups, compression, board/lens/audio/caption synchronization, cancellation/rebuild, pause/skip/catch-up,
save/revisit state, and crowded-event fixtures. Option C is low-medium animation work and high comprehension,
causality, accessibility, and trust debt.

**Codex recommendation: Option B.** Preserve causes in order, let genuinely simultaneous consequences feel
simultaneous, and compress repetition only through explicit family law. The player should understand what happened
without waiting for every goblin to perform a solo flinch.

Does Adam accept Option B, prefer strict serial playback under Option A, prefer terminal-snap presentation under
Option C, or want to amend a scheduler law? If B is accepted, follow into F10.8b: whether new player declarations
may be accepted while prior committed cues are still playing, and which presentation/input states pause, queue,
preview, or reject them. Wave 10 remains **OPEN**; no build is authorized.


<!-- END VERBATIM MIGRATION: original lines 19056-20557 -->
