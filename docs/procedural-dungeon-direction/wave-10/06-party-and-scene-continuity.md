---
type: design-study
status: OPEN
wave: 10
part: 6
legacy_sections: "11.76-current"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 10 — Party and Scene Continuity

Continue the chronological Wave 10 record from
[Part 05](05-consequence-presentation.md). P10.9 and Wave 10 remain open; no build is authorized.

### 11.76 F10.9e.1 ruling and F10.9f expansion - cold separation accepted; same-scene autonomy precedes party splitting

**Adam's ruling (2026-07-22):** choose Option B. A forcibly and persistently separated pre-alpha companion becomes a
**cold canonical record with no self-directed advancement**. The record preserves actor identity, last/exact/known
location as legally available, holder/custody, condition, inventory, viewpoint knowledge, separation cause/time,
and legal remount/return handles. The companion owns no active child SceneLineage, takes no independent action,
discovers nothing, and cannot advance through Gemini prose. Ordinary site/world events owned elsewhere may still
affect them through canonical receipts. They remount only when the main-PC scene reaches them or another validated
transfer/reunion event returns them.

This is a **PLAYABLE PRE-ALPHA/MVP continuity obligation** and maps to C2G: one capture/separation receipt, one
externally owned consequence, save/load, and exact remount. It preserves capture, loss, collapse, and delayed rescue
without building split-party play. Option A's blanket content prohibition is rejected as too restrictive; Option C's
offscreen action menu is deferred because it would rebuild child-branch simulation under another name.

Adam also set a feature priority and new design requirement:

> "i do think that eventually I would like for the companions to be able to act on their own within the scene I think i would rather implement that before party splitting. That way if I am in a market scene the rogue could wander off and get into trouble if he wanted. This could be toggleable in settings, but it could make for interesting gameplay. Though we probably would need to define limits on the actions of the \"rogue\" PC"

This is accepted as a **same-scene autonomy feature goal that precedes split-party work**. It does not reopen the
single-main-PC premise: this record treats the quoted `rogue PC` as a companion/sidekick citizen rather than a second
human-controlled PC. If Adam meant a second directly controlled PC, that would reopen F10.9c's control law.

The distinction is architectural and experiential:

- **same-scene autonomy:** the rogue leaves formation but stays inside the currently mounted market SceneLineage;
  their movement, target, action, witnesses, custody changes, suspicion, and consequences use the ordinary scene
  clock and owners;
- **split-party play:** the rogue leaves for another independently advancing location with its own time, events,
  viewpoint, save state, and reconciliation. That remains later.

C4D now owns the feature ordering. It first proves one market companion wandering within the mounted scene and
committing one certified characterful action that can create trouble. It must reuse validated actions, identity,
knowledge, custody, relationships, attention, consequence receipts, and the player setting. Gemini may propose and
narrate intent but cannot commit mechanics. Exact companion tactics and personality remain coordinated with Waves
6-7; P10.9 owns continuity and cross-mode limits.

#### F10.9f - how much may an autonomous companion do inside the active scene without asking the player?

In plain English: the main PC is bargaining at a market stall. The rogue companion becomes interested in a merchant's
locked cashbox and drifts through the same visible market. The feature should create character and possible trouble,
not let an AI spend the player's treasured items, accept an oath for the party, murder a shopkeeper, or hijack the
campaign. What is the autonomy boundary?

**Option A - autonomous movement and intent, approval before every canonical action.** With autonomy enabled, a
companion may leave formation, choose a nearby focus, converse as color, and surface a proposed action. Any roll,
object interaction, custody change, resource spend, relationship change, secret search, lawbreaking, hostility risk,
or other committed consequence waits for player approval.

- **Dungeon/market example:** the rogue crosses to the cashbox and the DM says they are eyeing its lock. The player
  must approve `try to lift the purse` before an action receipt or roll exists.
- **Gemini-DM example:** Gemini can express temptation and personality, but its proposed intent stays a validated
  pending choice; silence or refusal returns the rogue to harmless behavior.
- **Cost:** **medium movement/focus/intent/UI work and low autonomy-policy risk**, but high interruption and novelty
  debt. The companion cannot truly get the party into trouble without the player choosing the trouble first.

**Option B - bounded autonomy with a player-set risk ceiling and hard red lines (recommended).** Each companion has
an engine-owned behavior profile, active-scene roaming envelope, small action budget/cooldown, and per-companion
setting such as `Off`, `Cautious`, or `Characterful`. The engine offers certified legal actions tagged by impact and
foreseeable risk. Within the selected ceiling, the companion may commit without advance approval; consequences may
still exceed expectations when an honestly low/moderate-risk act goes badly. Gemini may choose or phrase a semantic
intent only from those certified candidates; the validator commits the exact action and roll.

The initial hard red lines are:

1. cannot leave the active scene or create a child branch;
2. cannot move, speak for, spend the action, or make a binding personal choice for the main PC;
3. cannot spend, transfer, destroy, wager, or expose shared, unique, quest, or protected player resources;
4. cannot accept/reject a binding quest, oath, contract, faction allegiance, romance, recruitment, dismissal, or
   permanent party commitment;
5. cannot intentionally reveal protected PC secrets or consume knowledge the companion does not have;
6. cannot deliberately initiate lethal force or attack a nonhostile, although an honestly licensed lower-risk act
   may still be discovered and cause hostility or combat as a consequence;
7. cannot select an action certified above the player's risk ceiling, even though a legal lower-risk action may
   produce an unexpectedly severe consequence;
8. cannot invent a mechanic, target, object, relationship, secret, or permission merely because Gemini's prose wants
   it.

- **Dungeon/market example:** `Off` keeps the rogue in formation. `Cautious` permits browsing, conversation, public
  inspection, and reversible repositioning. `Characterful` may permit a certified low/moderate-risk pickpocket
  attempt against an ordinary purse inside the market. If caught, suspicion, pursuit, loss of trust, or even a fight
  may truthfully reconfigure the same scene. The rogue still cannot steal the PC's quest key, attack the merchant as
  an opening choice, or disappear into another district.
- **Gemini-DM example:** Gemini selects or voices `tempted by ordinary purse` only when the engine supplies that
  candidate from the rogue's traits, knowledge, risk setting, target, and scene law. The roll, custody transfer,
  witnesses, and consequences come from canonical resolution. Gemini cannot upgrade the purse into a crown jewel or
  conceal the committed trouble from the player-facing scene.
- **Cost:** **high but bounded behavior-policy, certified-action, risk-tag, setting, cooldown, attention, save/replay,
  secrecy, and adversarial QA work**. It reuses one active simulation and avoids branch time/reconciliation. Ongoing
  maintenance is concentrated in explicit action certification rather than arbitrary prompt behavior.

**Option C - broad goal-driven autonomy over any legal same-scene action.** With autonomy enabled, the companion may
choose from most actions available to an NPC or PC according to personality, goals, and current opportunity. The
engine validates legality but applies few player-specific red lines beyond not directly controlling the main PC and
not leaving the scene.

- **Dungeon/market example:** the rogue may attempt the cashbox, threaten a witness, spend personal or shared money,
  start a fight, promise a favor, or use a powerful carried item if those are legal actions and fit its current goal.
- **Gemini-DM example:** Gemini and the behavior system can create surprising character drama, but prompt/policy
  variation may repeatedly make irreversible party decisions the player experiences as sabotage rather than agency.
- **Cost:** **very high consent, balance, content certification, prompt, correction, save/replay, support, and player-
  trust cost**. A toggle does not repair campaigns already altered by an action whose authority was too broad.

**Codex recommendation: Option B.** It allows the rogue to cause genuine unscripted trouble inside the market while
keeping player ownership of the main PC, protected resources, binding commitments, lethal intent, secrets, and
scene boundaries. `Off` preserves the formation-only game; `Cautious` supplies visible personality with little risk;
`Characterful` licenses bounded risk. C4D must land and be playtested before any split-party feature begins.

If B is accepted, the next generated follow-up is **F10.9f.1: when does the player see an autonomous intention and
receive a chance to intervene—before commitment, during a readable attempt, or only through its consequences?** That
notice law must preserve surprise and character agency without making the companion feel like an invisible random
event or restoring approval prompts for every act.

Does Adam choose **A, B, or C**, or want to amend the settings, risk ceiling, or hard red lines? P10.9 and Wave 10
remain **OPEN**; no build is authorized.

### 11.77 F10.9f-F10.9h batch ruling - bounded companion autonomy; staged land travel; bounded towns first

Adam requested that questionnaire work proceed in batches of five rather than paying a documentation/checkpoint
cost after every answer. The following accepted rulings therefore close the five-question batch together while
leaving P10.9 and Wave 10 open.

#### F10.9f / F10.9f.1 / F10.9f.2 - bounded autonomy with readable, governed same-scene presentation

Adam chose **Option B** for all three companion-autonomy questions.

1. **Action boundary:** the accepted target is the bounded-autonomy profile and hard-red-line law in section 11.76.
   `Off`, `Cautious`, and `Characterful` remain player-owned settings. A certified action inside the selected risk
   ceiling may commit without advance approval, but a companion cannot leave the active scene, control the main PC,
   spend protected/shared resources, make binding party commitments, deliberately initiate lethal force against a
   nonhostile, leak unowned knowledge, or invent mechanics and permissions. C4D must be playtested before any
   independently advancing split-party feature.
2. **Notice and intervention:** a perceptible autonomous act receives a readable intention/attempt beat rather than
   a universal approval prompt or an invisible consequence lottery. The main PC may intervene only when viewpoint,
   time, reach, attention, and the action's actual interruptibility make that legal. A quiet act the main PC could not
   perceive does not expose itself merely to create a UI warning; its later consequences remain truthful. The
   resolver, not Gemini timing prose, owns commitment and any intervention window.
3. **Camera and attention:** the companion action uses the ordinary governed same-scene attention system. It may
   earn one bounded causal reframe, widen, or focus request and a recenter path; it does not require a hard cinematic
   cut, repeated camera theft, a second viewport, or a mechanical alert card. Exact action and consequence truth
   remains on the mounted scene and in Gemini/fallback prose. Player-owned focus remains the later target over the
   accepted automatic-focus scaffold.

These rulings complete the generated F10.9f family at the continuity/presentation level. Waves 6-7 still own the
companion behavior model, action scoring, personality breadth, and combat tactics. P10.10 still owns device,
performance, input, and broad accessibility budgets.

#### F10.9g - land travel is one staged TravelWalk contract before specialized mode assemblers

The repository audit found that the current engine already implements the most important spine described by Adam:
travel between canonical nodes becomes a `kind:"travel"` Wilderness Walk; the party remains at the origin until
`walk_complete`; approximate route time and distance are write-once edge facts; sampled per-leg biomes skin the
walk; clock time advances through the journey; turning back preserves partial elapsed time; and an established
route rerolls current events without minting a new edge. The existing Segmented Travel Kit also supplies source
tables for route type, scene geometry, event family, landmark, threat, complication, choice, and arrival. What does
not yet exist is a route-type/transport model, a road network, mount or wagon travel semantics, coherent macro-biome
generation, or active use of those segmented-travel tables by the land-travel compiler.

Adam accepted the following staged package:

1. **F10.9g.1 - Option B for the retained pre-alpha architecture; scoped Option A as the feature goal.** Foot,
   mounted, road, and wagon travel first share one TravelWalk transaction, persistence, cursor, consequence, and
   arrival contract parameterized by route, transport, pace, exposure, and biome. Later specialized wilderness,
   mounted, road, and vehicle **content assemblers** may generate materially different choices and segment families,
   but they continue to emit the common TravelWalk/SceneLineage contract rather than duplicating canon, save, clock,
   or handoff machinery.
2. **F10.9g.2 - Option B is the target.** A canonical route preserves endpoints, bearing, approximate baseline
   distance/effort, route class, biome corridor, and durable conditions. A particular journey derives elapsed time
   from that baseline plus mode, pace, compatibility, weather, and current route state. This is a **medium
   implementation change**, not a new travel engine: extend the edge schema; migrate old `travelMin` safely as a
   normal-foot baseline; add a pure journey-cost resolver; stop journey-specific overrides from rewriting the edge;
   carry route/journey provenance through walk, ledger, digest, save/load, and tests; and correct the current
   arrival-segment time-overrun debt. The costly horizon is a generated road topology and deep transport ecology,
   not this semantic separation.

   Adam said Option C could be an acceptable interim. The safe interpretation is deliberately narrower than
   rerolling an experienced road: an **uncommitted first-travel estimate** may remain provisional during development,
   and the current fixed-time edge plus prose-only transport may stand in until the resolver lands. Once a route has
   been experienced or otherwise committed, arbitrary journey rerolls would violate the anti-drift law and are not
   a safe scaffold. No interim overwrites an established route merely because the party later buys a horse.
3. **F10.9g.3 - Option B.** Travel uses a bounded opportunity budget rather than a visible check every exact hex.
   Approximate length/exposure provides the initial number of opportunities; a probability-and-gate matrix combines
   route class, biome, pace, transport, time/weather, regional pressure, Fray/Spice, and durable route condition to
   determine which opportunities become quiet passage, landmark, contact, problem, hazard, discovery, or enemy.
   Current `roughly one opportunity per two leagues` behavior is acceptable scaffolding, not final balance.
4. **F10.9g.4 - Option B for pre-alpha, with Option A acceptable during development.** Early development may give
   Gemini a fact-locked prose plan over the current walk while transport has no full mechanical expression. The
   playable pre-alpha requires typed transport capability, elapsed-time/pace effects, terrain and route
   compatibility, and the wagon's capacity/road-dependency distinction. **Mount possession and rider/driver ability
   must become canonical early**, before the polished travel matrix: Gemini cannot grant a horse, rider competence,
   draft team, or wagon merely because it improves a scene. Detailed feed, fatigue, stabling, damage, repair, animal
   bonds, and hire-economy behavior may promote later unless another system requires them sooner.
5. **F10.9g.5 - Option B, expanded into a spatial-foundation requirement.** Genesis should begin from a small,
   low-resolution but climatically and geographically plausible macro-world: connected mountain chains, drainage,
   rain shadows, coasts, temperature bands, and coherent biome provinces. Deterministic local refinement increases
   resolution where play approaches while preserving every committed macro fact. Distance toward the world's Fray
   progressively relaxes those rational constraints so biome adjacency becomes stranger in controlled correlation
   with stronger Spice, richer loot, and greater danger. Independent per-hex biome scatter is retained only as a
   far-Fray failure mode, not the ordinary inhabited world.

Every selected journey endpoint remains a canonical node. A transient roadside event may remain a travel segment;
if the player adopts it as a destination, or its outcome changes future traversal, the system promotes an
appropriate canonical node or durable edge condition. Urban Walk remains the right substrate for movement within a
settlement; it is not the long-road system.

The accepted small-pass mapping is now:

- **C2H:** retain and audit one canonical foot journey between two nodes using the current common TravelWalk seam;
- **C2I:** promote a coherent macro-biome/refinement fixture and baseline-route versus journey-cost distinction;
- **C2J:** prove early transport possession/eligibility, then one mounted-wilderness and one road/wagon trace over
  the same route contract; and
- **C4E:** promote specialized per-mode content assemblers, richer road topology/conditions, and deeper mount/vehicle
  ecology only after the common contract is retained.

These pass names record dependencies and acceptance questions; they do not authorize implementation.

#### F10.9h - bounded canonical town fabric first; scoped richer continuity on the horizon

Adam chose **Option B with a scoped version of Option C on the horizon**. Pre-alpha towns are bounded canonical
district/venue fabric rather than one menu card or a fully continuous city simulation. A town node may mount a small
Urban Walk or district scene; entering a relevant venue, market conflict, chase, or battle preserves the same cast,
objects, damage, route/threshold, knowledge, and consequence cursor through ordinary SceneLineage handoffs. The
first proof needs only a compact market/district trace, not every street.

The scoped Option C goal later allows selected contiguous town slices, ambient citizens, companion roaming, and
cross-venue events where they materially improve play. It does not imply seamless simulation of every building,
resident, or offscreen street, and it remains downstream of the retained bounded-town contract.

### 11.78 F10.9g.6-F10.9g.10 batch - world substrate, refinement, Fray, route choice, and early transport records

The accepted travel direction creates five material generated follow-ups before F10.9g can close. They are asked as
one batch; no documentation/checkpoint pass occurs between individual answers.

#### F10.9g.6 - what generates the initial low-resolution world?

**Option A - independent biome cells with local smoothing.** Cheap and close to current hashing, but smoothing does
not create drainage, mountain chains, coasts, rain shadows, or believable regional identity.

**Option B - deterministic macro geography and climate fields, refined locally (recommended).** Generate a small
coarse elevation/plate/coast field, broad temperature and moisture flow, connected watersheds/mountain barriers,
and biome provinces; refine a macrocell deterministically only when play or map resolution needs it. The far Fray
adds bounded distortions to these fields. Cost is medium-high worldgen design and invariant testing, but storage and
runtime stay bounded because only seeds, macro facts, and canon deltas persist.

**Option C - full high-resolution physical world simulation at world creation.** Strong global coherence, but high
startup, tuning, save, migration, and unused-generation cost; it works against the lazy-world premise.

#### F10.9g.7 - what may change when a coarse region gains resolution?

**Option A - anything unvisited may move until first physical entry.** Flexible, but a visible mountain, known road,
or promised snowy destination can drift before arrival.

**Option B - refinement is constraint-preserving (recommended).** Committed/observed nodes, bearings, approximate
route costs, biome identities, coasts, rivers, ranges, and known relations are fixed constraints. Refinement adds
tributaries, passes, local cells, and scene-scale detail inside honest uncertainty; it never contradicts what was
already shown or narrated. Cost is medium constraint/provenance work and high long-term anti-drift value.

**Option C - resolve the entire world to final resolution before showing any part.** Simple canonically, but forfeits
lazy expansion and spends work on places play may never approach.

#### F10.9g.8 - how tightly are Fray, biome disorder, Spice, loot, and danger coupled?

**Option A - one shared scalar directly increases all five together.** Easy to read, but mechanically predictable:
every strange biome guarantees proportionally better treasure and worse enemies.

**Option B - one Fray field feeds separate capped curves and probability matrices (recommended).** Distance/coherence
supplies a common pressure, but biome irregularity, Spice tails, loot opportunity, encounter severity, and world
instability respond through different bands and caps. They correlate without becoming a guaranteed lockstep reward
formula. Cost is medium tuning and simulation evidence; it preserves surprise and prevents obvious Fray farming.

**Option C - every subsystem rolls its own unrelated outward chaos.** High variety, but no learnable world law and
no reliable sense that the map is actually fraying.

#### F10.9g.9 - how much may an en-route player choice alter the journey?

**Option A - prose and check flavor only.** The next segment, time, exposure, and route state do not change.

**Option B - certified bounded route/pace choices alter the journey plan (recommended).** A sheltered cut, exposed
ridge, fast road, horse push, camp, detour, or ford may change elapsed time, next opportunity weights/gates,
resources, visibility, position on the route, and durable route conditions. It changes destination only when the
player chooses an existing or legally promoted canonical node. Cost is medium plan-overlay, validation, and replay
work; it makes travel choices mechanically real without building a literal hex crawl.

**Option C - every choice branches onto a newly simulated high-resolution physical route.** Maximum spatial agency,
but high pathfinding, worldgen, node-promotion, camera/map, save, and combinatorial content cost.

#### F10.9g.10 - what is the earliest canonical form of a horse, draft team, or wagon?

**Option A - an inventory tag such as `hasHorse`.** Cheap, but cannot express custody, hiring, loss, rider ability,
seats, draft requirements, or the difference between a named horse and a borrowed wagon.

**Option B - a canonical transport asset with capability references (recommended).** The party owns, hires, borrows,
or is entrusted with an asset record carrying identity/provenance, custody, availability, seats/capacity, required
operator ability, route/terrain compatibility, and optional links to named animal/vehicle citizens. It need not yet
simulate feed, fatigue, injury, repair, or personality continuously. Cost is medium schema/custody/eligibility work
and supplies the stable seam those later systems need.

**Option C - every mount, draft animal, and vehicle is a full independently simulated actor from first proof.** Rich
and future-complete, but high party, inventory, AI, condition, economy, combat, rendering, and save cost before land
travel itself is proved.

**Codex recommends Option B for all five.** P10.9 and Wave 10 remain open; F10.9g has additional route-event and
matrix questions after this batch, and F10.9h's bounded-town ruling still requires its own generated follow-ups.
Performance/device/accessibility remains P10.10; no build is authorized.

### 11.79 F10.9g.6-F10.9g.10 ruling and authority reconciliation - existing Fray and animal systems govern

Adam answered the full batch and required an authority search before travel invented either a second Fray curve or
a second animal/horse model.

#### F10.9g.6 / F10.9g.7 - rational macro-world and constraint-preserving refinement accepted

Adam chose **Option B** for both questions. The initial low-resolution world uses deterministic macro geography and
climate fields rather than independent biome cells or eager full-resolution generation. Local refinement is
constraint-preserving: committed or observed nodes, routes, bearings, approximate costs, biomes, coasts, rivers,
ranges, and relations cannot move or contradict prior narration merely because their surrounding cells gain detail.
This confirms C2I's rational macro-region/refinement obligation.

#### F10.9g.8 - Option B already exists as the Fray/Spice authority; extend it, never duplicate it

Adam recalled correctly. The existing authority is distributed across four retained systems:

1. `REGIONS-NAMES.md` and `src/engine/region.js` own one geographic `frayLevel(q,r)` plus the `FRAY_1`, `FRAY_2`,
   and `FRAY_D` thresholds. External pressures bias rim-ward and each region exposes one `spiceTier`.
2. `SPICE-RAISE.md` owns the accepted band-first distributions:
   `baseline 25/25/25/17/8`, `fray1 10/20/35/25/10`, `fray2 0/10/35/35/20`, and
   `rim 0/5/25/45/25` across Grounded/Textured/Strange/Volatile/Mythic. Walks and their DM digests already carry
   this tier. The implementation harness passes **14/14**.
3. The same accepted system already ratchets discovery-item opportunity through a separately gated Volatile+
   threshold: the documented target rates are 25% baseline, 35% fray1, 55% fray2, and 70% rim. This is a loot curve
   fed by the shared Fray authority, not a second outward-temperature system.
4. `BREACH.md` owns a separate risk/reward tail: the same Fray thresholds widen Nightmare/Breach odds; those walks
   carry top-of-band danger, special bounded lenses, Outlandish loot access, and reward premiums. Ordinary encounter
   severity remains bounded by its normal tier/scene-risk owners rather than being silently restatted by Spice.

Therefore F10.9g.8 accepts **Option B by reference**, not by creating new `travelFray`, `biomeSpice`, or
`dangerTemperature` state. Macro-biome disorder, travel encounter gates, loot opportunities, and future route
instability consume the existing `frayLevel`/`spiceTierAt` signals through their own capped matrices. The retained
`SPICE-CURVE.md` anti-railroad law also remains binding: this is a geographic gradient, not world-age escalation or
a timer that forces the campaign darker. What remains open is the travel-specific encounter/severity matrix and the
new macro-biome distortion response, not the Fray or Spice distribution itself.

#### F10.9g.9 - bounded mechanical choices first; physical route branching is the ideal

Adam chose **Option B with Option C as the eventual ideal**. The first retained journey uses certified bounded
choices that can alter time, exposure gates, resources, visibility, upcoming segments, and durable route conditions
without turning the hidden substrate into a literal hex crawl. Later, once constraint-preserving local refinement
and route promotion are proved, materially spatial choices may branch onto newly resolved physical corridors and
rejoin, divert to, discover, or promote canonical nodes. The common TravelWalk/SceneLineage transaction remains the
continuity owner at both horizons.

This is a promotion target, not permission for every flavor choice to generate an unlimited high-resolution branch.
The generated F10.9g.12 question will choose the first bounded branch shape that keeps the ideal reachable.

#### F10.9g.10 - minimal capability first; existing animal citizen/card next; transport module later; full sim rejected

Adam revised the phasing to **Option A first and Option B later**, explicitly rejecting Option C as an unnecessary
goal. The first transport seam is the smallest canonical travel capability: the party truthfully has access to a
horse, draft team, cart, or wagon and has the required rider/driver ability. It does not pretend to own custody,
capacity, condition, upkeep, or hire-contract detail that has not been implemented.

The authority audit found the existing horse/animal home that must not be duplicated:

- `NPC-PARTIALS.md` and `rollPartial('animal')` already mint a lightweight animal citizen with realm-flavored kind,
  a hook-pointing tell, a concrete need (`hungry`, `guarding`, `lost`, or `loyal`), Archetype coherence, and no
  inappropriate adult moral/lever stack.
- `ANIMAL-SOCIAL.md` promotes an animal that is named, repeatedly engaged, or befriended into a persistent codex
  citizen with home/territory, attitude/care, witness knowledge, recurring presence, and the same retained partial
  stack. Its focused promotion harness passes **44/44**; environment/realm/class minting passes **16/16**.
- `MONSTER-PARLEY.md` and `src/world/companions.js` already own the optional travelling-pet tier for unusual
  recruited creatures: loyalty/bond, neglect, harmed-by-kind response, wandering, and a stat chassis when needed.
  Its focused harness passes **83/83**. An ordinary bought/domesticated horse does not need to pass the anomaly-law
  monster recruitment gate merely to pull a wagon or carry a rider.

Accordingly, the early Option A capability should reference the existing animal codex id when a living mount has
individual identity, or the existing inventory/ownership fact for a simple vehicle. The basic animal NPC card—not a
new transport-personality schema—owns the horse's name, kind, tell, need, attitude, and later personality growth.
The later Option B **transport expansion/integration module** may add custody/hire, capacity/seats/load, operator
eligibility, route compatibility, condition, feed/stabling, injury, repair, and vehicle/mount-specific interaction
by extending those retained identities. A horse need not become an independently advancing full simulation to have
a personality, card, bond, injuries, or meaningful behavior.

The corrected pass mapping is:

- **C2J:** minimal canonical possession/access and rider/driver capability, linked to the existing animal citizen or
  vehicle/item identity; enough typed truth for Gemini and the journey-cost/encounter seams;
- **C4E:** specialized travel assemblers and selected physically refined route branches over the common walk
  contract; and
- **C4F:** the later horse/wagon transport expansion and integration module, extending animal/custody/inventory
  owners without replacing or duplicating them. Full independent simulation is not the destination.

### 11.80 F10.9g.11-F10.9g.15 batch - journey commitment, bounded branches, persistence, gates, and camp days

The authority reconciliation settles the Fray and animal-model questions but leaves five material travel mechanics
before F10.9g can close. They are asked as one batch.

#### F10.9g.11 - when does the engine commit upcoming travel segments?

**Option A - roll the complete TravelWalk at departure.** This is today's retained behavior and the cheapest
development scaffold. Later choices must modify, suppress, or replace already-rolled hidden segments.

**Option B - deterministic staged commitment (recommended).** Departure commits the route, journey seed, known
conditions, and first opportunity. Each later segment is derived and committed only after the preceding certified
choice, keyed by journey/segment/choice provenance so save/load or retry cannot reroll it. Cost is medium cursor,
seed, digest, and replay work; it supports real route choices without pre-canonizing futures the player invalidates.

**Option C - Gemini invents the next segment when narration reaches it.** Flexible, but loses deterministic nouns,
probability gates, replay, and route truth.

#### F10.9g.12 - what is the first retained physical branch toward F10.9g.9's Option C ideal?

**Option A - weights only, no corridor branch.** Choices alter probabilities and time but never create two spatially
different ways forward.

**Option B - one bounded fork and reconvergence (recommended).** A refined local corridor may offer two certified
alternatives—road versus ridge, ford versus bridge, pass versus tunnel—with distinct biome/route cells, costs, and
opportunity gates. They rejoin the same journey unless one legally discovers or promotes a different canonical
node. Cost is medium-high refinement, path, preview, and compaction work; the retained fixture is small and proves
the future arbitrary-route seam.

**Option C - arbitrary player-drawn routing through every refined cell.** This is the far ideal's maximal form, with
high pathfinding, map UX, encounter-density, node-promotion, save, and exploit cost.

#### F10.9g.13 - which travel events remain true on a later trip?

**Option A - every event is journey-local and rerolls away.** Simple, but a burned bridge, cleared bandit camp, or
bargained toll keeper inexplicably resets.

**Option B - material outcomes promote; incidental passage rerolls (recommended).** Weather, travelers, and an
uneventful view remain journey-local unless another system persists them. A destroyed bridge, opened pass, claimed
camp, discovered shrine, hostile patrol base, changed toll, or established relationship writes a durable edge
condition, linked owner, or canonical node through validated receipts. Cost is medium promotion-schema and return-
trip QA; it matches Genesis's ordinary candidate-to-canon law.

**Option C - every segment and encountered detail becomes permanent map state.** Maximum memory, but rapidly fills
the world, save, DM context, and map with irrelevant historical clutter.

#### F10.9g.14 - how is the travel probability matrix evaluated?

**Option A - one flat encounter-type roll per opportunity.** Cheap, but cannot distinguish a mandatory washed-out
bridge from time exposure, severity, or Spice without overloading one table.

**Option B - ordered gated matrix (recommended).** For each opportunity: resolve mandatory route/geography and
durable conditions first; then exposure occurrence; then event family; then existing Fray/Spice band and ordinary
tier/scene-risk severity gates; then biome/route/transport-compatible content. Each layer owns one decision and
records provenance, preventing double danger/loot rolls. Cost is medium-high table design, simulation, and tuning,
but it composes with the already-built Fray authority.

**Option C - Gemini chooses which kind of event best fits the prose.** Natural sounding, but no enforceable cadence,
fairness, rarity, or transport/route compatibility.

#### F10.9g.15 - how do multi-day travel and camping enter the walk?

**Option A - one uninterrupted journey; overnight rest is narration.** Cheapest, but food, rest risk, watch,
weather, mount tending, and time-of-day owners cannot participate honestly.

**Option B - explicit day-boundary/camp opportunities reuse existing rest machinery (recommended).** When elapsed
travel crosses a day/rest threshold, the walk offers continue/push/camp as certified choices. Camping invokes the
ordinary rest, watch/risk, resource, world-turn, companion/pet-tending, and time owners; the next travel segment
resumes the same journey. A camp becomes a node only if it is claimed, revisitable, or materially changed. Cost is
medium integration and strong reuse.

**Option C - every overnight camp becomes a fully simulated canonical settlement/node.** Rich persistence, but
creates map and simulation clutter for routine sleep stops.

**Codex recommends Option B for all five.** P10.9 and Wave 10 remain open. F10.9g still requires at least one final
audit after these answers; F10.9h's town follow-ups remain pending. Performance/device/accessibility stays P10.10;
no build is authorized.

### 11.81 F10.9g.11-F10.9g.15 ruling - staged journeys, material persistence, real rest under a simple camp, and BattleMat-first modules

Adam accepted the batch with two important phase corrections and reframed implementation around a connected core
followed by independently gated modules.

#### F10.9g.11 - Option B; the Wilderness Walk already supplies much of the right skeleton

Adam chose **Option B**. Departure commits the canonical route, journey seed, known conditions, and first segment;
later segments commit deterministically after the preceding choice. The intuition that Wilderness Walk was designed
for this is substantially right: it already models a journey as segments, keeps a canonical cursor and provenance,
veils ahead-of-here content, and distinguishes walked truth from unwalked possibility. The retained implementation
still rolls a whole linear segment array eagerly, so a future pass must move derivation behind the cursor without
changing the existing walk contract. This is adaptation of the intended seam, not a replacement travel engine.

#### F10.9g.12 - Option A is an acceptable scaffold; bounded physical Option B remains desired; pre-alpha timing open

Adam chose **Option B as the desired branch**, allowed **Option A in the meantime**, and asked why B was estimated
medium-high before deciding whether it earns pre-alpha scope.

The cost is not the choice text or two encounter rolls. `rollWildernessWalk` explicitly produces a **linear route
with no topology**, while the current cursor accepts a segment number but does not validate branching adjacency.
The broad version of Option B would therefore need all of the following to agree:

1. a stable fork/reconvergence topology and two corridor identities rather than only weighted future content;
2. constraint-preserving local geography for both visible alternatives;
3. deterministic staged commitment so choosing one branch cannot reroll, leak, or pre-canonize the other's events;
4. truthful preview of known time, exposure, terrain, access, and route consequences without revealing hidden
   content;
5. save/load, turnback, durable edge-condition, map/visualizer, Gemini, and arrival behavior at the fork and merge;
6. branch-aware tests that prevent duplicate time, events, destinations, and consequences.

That general system is medium-high. A **bounded branch capsule** is smaller: one reusable fork grammar inserts two
certified alternatives such as bridge/ford or road/ridge into the linear TravelWalk, shows only viewpoint-known
tradeoffs, commits the selected segment packet, and reconverges on the same destination. It needs no arbitrary
player-drawn path, general pathfinder, eagerly refined regional map, or unique authored map. This can be a medium
post-core module and is the version Codex recommends considering for pre-alpha. Its value is not travel ornament:
it is the smallest noncombat proof that a player choice changes canonical physical space, the visualizer projects
the selected truth, Gemini narrates the same choice, and save/return preserve it. It should not block the first
BattleMat/EngagementLens proof. F10.9g.12a below asks whether it enters pre-alpha after that core is green.

#### F10.9g.13 / F10.9g.14 - Options B accepted

Adam chose **Option B** for both. Material travel outcomes promote through ordinary candidate-to-canon law while
incidental passage may reroll. A destroyed bridge, opened pass, changed toll, claimed camp, established
relationship, or discovered shrine remains a durable edge condition, owner fact, or node; transient weather and
travelers do not become permanent by default.

The travel opportunity matrix uses ordered gates: mandatory geography/durable route condition, exposure occurrence,
event family, the retained Fray/Spice band plus ordinary tier/scene-risk severity, and finally biome/route/transport-
compatible content. Each layer owns one decision and provenance field so travel never double-rolls danger or loot.
This is a later travel module over the connected spine, not a prerequisite for first BattleMat proof.

#### F10.9g.15 - simple camp presentation first, but short/long rest mechanics are real; Option B remains ideal

Adam accepted a phased answer: an **Option A-like presentation may remain for a while**, but stopping to rest must
invoke the existing canonical short- or long-rest mechanic; **Option B's explicit day-boundary and camp choices
remain the ideal**. This is not permission for Gemini prose to say the party rested while mechanics remain untouched.

The authority audit confirms that `restRiders`/`restRecover` already provide the correct reusable owner for both UI-
and DM-declared rest. The current focused harness passes **21/21** and covers hit-dice spending, short-rest resource
recovery, long-rest recovery, partial time on interruption, the 24-hour benefit gate, and rest-risk obligations.
The same gate also owns the established long-rest riders such as item recharge, exhaustion, concentration, temporary
HP, camp cooking/lodging, wages, pet tending, rust maintenance, level-up claims, clock, ledger, and DM digest effects.

The interim travel integration may therefore present one uninterrupted journey and let Gemini write the camp, but a
certified stop/rest action must pause the same TravelWalk, call that canonical rest gate, advance the real clock,
honor interruption/no-benefit outcomes, and resume the same cursor. The later camp module adds explicit
continue/push/camp choices, watch/resource strategy, richer scene projection, and selective camp promotion. It does
not create a second rest system.

#### BattleMat-first connected spine, then modules

Adam identified the implementation form now emerging: prove the bare connected game first, then realize deeper
systems as bounded modules. The **first dominant uncertainty is the BattleMat system**, not whether every accepted
travel, world, town, transport, history, or relational ideal can launch together.

The connected proof must carry one canonical action and consequence through mechanics, BattleMat plus mandatory
EngagementLens, Gemini/fallback prose, persistence, and recovery. It may use existing generators, restrained visual
fixtures, generic truthful projection, and Gemini improvisation to bridge breadth. It may not use prose to invent or
silently replace mechanical truth. Once that spine is green, modules add travel-to-combat continuity, staged
journeys, rest/camp integration, ordered encounter gates, route branches, macro-world refinement, transport, towns,
and deeper simulations one at a time. Every module extends the shared SceneLineage/receipt/owner seams, retains its
fixture and gate, and can be scheduled with other small passes without becoming another engine-wide redesign.

This phasing changes order and initial breadth, not the accepted feature destination. Critical and borderline MVP
behavior remains mapped; mature systems gain explicit module owners instead of becoming prerequisites for proving
that the game can render its central physical events at all.

### 11.82 Final F10.9g travel audit batch - fork timing, travel-to-battle truth, first visualization, turnback, and DM improvisation

These five questions close the material gaps exposed by the module reframe. If their answers generate no new
travel-specific ambiguity, the next step will be an explicit F10.9g closure audit before advancing to F10.9h's town
follow-ups.

#### F10.9g.12a - when should the bounded physical branch capsule be built?

**Option A - after pre-alpha.** Pre-alpha keeps weight/time choices only; physical fork/reconvergence waits for a
later travel expansion. Cheapest, but the first playable build never proves noncombat spatial choice beyond a
linear walk.

**Option B - a post-core pre-alpha module (recommended).** First prove the small-room BattleMat/EngagementLens spine.
Then add exactly one reusable bridge/ford or road/ridge capsule over the staged TravelWalk: two visible certified
alternatives, one committed choice, one reconvergence, no arbitrary routing. This adds a medium bounded module, not
a medium-high general route system, and proves canonical choice -> visualizer -> Gemini -> persistence outside
combat.

**Option C - foundational before BattleMat proof.** Build general branch/refinement support into the first connected
spine. Architecturally ambitious, but reverses Adam's stated risk order.

#### F10.9g.16 - what happens when a travel segment becomes a battle?

**Option A - start a generic fresh battle.** The DM carries flavor across, but route objects, footing, cast, and
damage do not share exact identity. Cheap and precisely the adapter discontinuity P10.9 exists to prevent.

**Option B - pause and remount the same segment through SceneLineage (recommended and pre-alpha-critical).** The
travel cursor pauses. Its biome, footing, visible route features, encounter actors, objects/custody, knowledge, and
provenance feed the legal BattleMat placement. After combat, retreat direction, dead/wounded actors, dropped items,
damage, route conditions, elapsed time, and obligations return to that same segment before the journey resumes.
Gemini bridges the mode change but cannot substitute different nouns.

**Option C - resolve travel combat abstractly in prose.** Avoids the adapter, but fails the central BattleMat proof
for one of wilderness travel's most important events.

#### F10.9g.17 - what is the first visual form of an ordinary noncombat travel segment?

**Option A - prose over a neutral holding view.** Mechanically possible, but does not prove that rolled wilderness
facts reach the visualizer.

**Option B - one generic but truthful Wilderness Walk scene grammar (recommended).** Reuse a small scene/board
fixture whose biome, route or crossing, footing/elevation, one rolled feature, relevant object, weather/light, and
present actors are populated from the segment's real fields. Unsupported specificity falls back to honest simple
terrain or props. It need not create unique geometry, a full regional map, or bespoke art for every segment.

**Option C - unique locally refined geography for every segment.** Rich target, but makes worldgen and visual breadth
prerequisites for proving the projection seam.

#### F10.9g.18 - what survives when the player turns back or changes course mid-journey?

**Option A - snap back to the origin and discard the partial trip.** Simple, but erases elapsed time, rests,
encounters, discoveries, spent resources, and changed route state.

**Option B - preserve resolved truth and stage the return/reroute (recommended).** Resolved segments, time, resource
changes, rest outcomes, promoted facts, and durable route conditions remain. Turning back derives return
opportunities from current journey progress; rerouting begins from a legal reached fork/node/route position. It may
compact incidental scenery, but never refunds or rerolls the outward journey.

**Option C - maintain an exact continuous hex coordinate for every travel minute.** Maximum fidelity, with much
higher world, path, recovery, and UI cost than the bounded opportunity model requires.

#### F10.9g.19 - what may Gemini improvise while a deeper travel module is still absent?

**Option A - fiction and soft connective choices inside certified facts (recommended).** Gemini may describe the
camp, weather, passage, local behavior, and consequences of committed facts, and may offer choices whose mechanical
effect is either none or an existing validated action. Canonical time, rest, damage, resources, route changes,
encounters, possession, and durable discoveries still pass through their owners. Missing mechanics stay missing
rather than being disguised as prose authority.

**Option B - temporary mechanical rulings that are captured afterward.** Flexible tabletop behavior, but risks
contradictory state, retroactive capture, save/load gaps, and an invisible second rules engine.

**Option C - no improvisation beyond templated fallback text.** Maximally enforceable but discards the AI DM's
useful ability to make a sparse scaffold feel like fiction.

**Codex recommends B, B, B, B, A.** The branch capsule is optional until its timing is answered; travel-to-battle
identity is not optional because it directly exercises the declared BattleMat priority. P10.9 and Wave 10 remain
open; performance/device/accessibility stays P10.10 and no build is authorized.

### 11.83 Final F10.9g rulings and closure audit - grid-owned travel projection; provider-neutral DM seat

Adam accepted **B, B, B, B, A**, then corrected the generated visual examples so the implementation target could
not be mistaken for bespoke per-choice illustration.

#### F10.9g.12a - bounded fork capsule is a post-core pre-alpha module

The small-room BattleMat/EngagementLens spine remains first. Once it is green, pre-alpha adds one reusable fork and
reconvergence grammar—bridge/ford or road/ridge—over the staged TravelWalk. It has real certified route cells or
nodes, viewpoint-known tradeoffs, one committed choice, one convergence, exact save/return behavior, and no
arbitrary routing. This creates **C2K**, a bounded module rather than a general regional-pathfinding prerequisite.

#### F10.9g.16 - travel combat remounts the same segment

Option B is accepted and is pre-alpha-critical. The active travel cursor pauses; segment biome, footing, route
features, cast, objects, custody, knowledge, and provenance legally place the encounter on BattleMat. After combat,
the same segment receives wounded/dead/retreated actor state, dropped items, damage, changed route conditions,
elapsed time, and obligations before travel resumes. This creates **C2L** as the travel-specific SceneLineage trace;
the DM-seat model bridges it in prose but cannot substitute different nouns or mechanics.

#### F10.9g.17 - reusable real-grid Wilderness Walk projection; bespoke imagery is later and optional

Adam first accepted Option B, then rejected the image-generation mockups' apparent dependency on unique scenic art:

> "ok, i have some feedback on those images already, because generally everything should be built on our grid system. that looks like a bespoke graphic, not a procedurally generated scene basic on a real grid and a real roll. Now these screens can be built from nodes, or vector art overlaying some biome art that we generate for background images, but we aren't going to be able to generate bespoke imagery per travel choice by pre-alpha. that might be it's own module later once image gen or if image gen becomes cheaper and faster"

The correction is binding. Pre-alpha travel projection consumes real rolled fields and real spatial owners. Its
primary path uses the shared square grid: reusable biome cells, elevation/depression, route/crossing cells,
blockers, simple physical props or truthful markers, and canonical pixel citizens. A coarser travel screen may use
canonical nodes/edges or vector routes over a **reusable** generated biome background, provided every displayed
relation still comes from real rolls and no painted detail pretends to be mechanical geometry. The renderer never
requests or requires a bespoke image for a segment, fork, or player choice.

Runtime or per-choice image generation becomes a separately owned optional presentation module only if latency,
price, determinism, rights, safety, continuity, offline behavior, and provider availability later make it practical.
It may enrich a retained grid/node truth but cannot become the only map, invent collision, or replace canonical
route state. The first two scenic image-generation mockups are therefore rejected as pre-alpha implementation
targets; the corrected visible-grid mockups are discussion evidence, not acceptance captures.

#### F10.9g.18 - partial journeys remain true

Option B is accepted. Turning back or rerouting never refunds time, rests, resource changes, resolved encounters,
discoveries, custody, or promoted route conditions. Return opportunities derive from current progress; a reroute
starts only at a legally reached fork, node, or route position. Continuous per-minute hex tracking is unnecessary.

#### F10.9g.19 - fact-bound improvisation through a provider-neutral DM seat

Adam accepted Option A with an architectural correction:

> "A as long is gemini is bound to as many mechanics as we have implemented and it knows how to use them, then we are ok with this. Gemini does a great job already in the raw chat with only a couple of PDFs as reference. Just remember it's not gemini exclusively. The DM seat is for any LLM the user wants. I think ultimately we are going to sell the game with a built in LLM like Llama, and offer either premium DMs at a data rate or monthly charge, or just open it up to gamers to put their own LLM API key in there and pay whatever they want for whichever they want."

`Gemini` in earlier discussion names the current proving model, not the product boundary. The durable boundary is a
**provider-neutral DM seat**. Any supported local, bundled, hosted, premium, or player-keyed model receives the same
viewpoint-safe digest, canonical facts, available mechanics/actions, tool/event schemas, refusal contracts, and
forward-only narration obligations. A model may improvise fiction and soft connective choices from those materials;
implemented mechanical effects use certified actions and owners. A weaker or differently trained model does not
gain permission to invent state merely because another model might infer the rules from prose.

A bundled local model, metered or subscription premium DMs, and bring-your-own API keys are retained product and
distribution candidates rather than locked pricing promises. Later architecture/product owners must decide model
capability conformance, privacy, key custody, offline behavior, cost/rate display, fallback, licensing, and vendor
failure. The core shell and documentation say **DM seat**, not `Gemini UI`; provider selection cannot fork world or
mechanics contracts.

#### F10.9g closure audit

F10.9g now answers the shared TravelWalk transaction, endpoints/nodes, route baseline versus journey time,
opportunity cadence and ordered gates, mode specialization, macro geography/refinement, existing Fray/Spice reuse,
bounded choice and the first physical fork, staged commitment, persistence, transport phasing, real rest under a
simple camp, travel visualization, combat remount, turnback/reroute, and DM-seat authority. Every accepted MVP and
feature goal has a pass or later owner. No travel-specific generated question remains open. **F10.9g is closed at
the design-questionnaire level on this phased basis.** P10.9 remains open for town and the remaining adapter cases;
Wave 10 remains open and no build is authorized.

### 11.84 F10.9h.1-F10.9h.5 batch - bounded town substrate, projection, battle continuity, offscreen life, and movement

F10.9h already accepts a bounded canonical district/venue fabric before any more continuous town ideal. These five
questions define the first retained town module.

#### F10.9h.1 - what is the canonical substrate of the first playable town slice?

**Option A - venue menu only.** Shops, tavern, gate, and market are independent destinations with no retained
district adjacency or thresholds.

**Option B - a bounded district graph with mounted venue grids (recommended).** A small canonical district owns
venue nodes, thresholds, short route edges, known access, and one shared cast/object/condition fabric. Entering a
venue or conflict mounts only the required grid scene; the graph preserves the surrounding town. Cost is medium and
reuses node, Urban Walk, grid, and SceneLineage owners.

**Option C - one continuous whole-town grid.** Maximum spatial continuity, with high generation, population,
camera, save, and inactive-space cost.

#### F10.9h.2 - how is an ordinary town/social venue first shown?

**Option A - prose and cards over a neutral holding view.** Cheap, but does not prove that Urban Walk rolls reach
the visualizer.

**Option B - reusable urban grid/node scene grammar from real rolls (recommended).** Street, market, tavern, shop,
gate, or courtyard scenes use reusable floor/threshold/elevation/blocker/prop families, canonical pixel citizens,
and truthful marker/card fallback. A node/vector overlay may use reusable district or realm background art, but no
venue requires bespoke generated imagery.

**Option C - a unique generated illustration or bespoke map for every venue.** Attractive when successful, but not
an acceptable pre-alpha content dependency.

#### F10.9h.3 - what happens when a social or exploration scene becomes a town battle?

**Option A - rebuild a generic combat arena.** Characters and broad flavor carry over; exact stalls, doors, items,
and positions do not.

**Option B - remount the same venue through SceneLineage (recommended and pre-alpha-critical).** The mounted town
scene gains legal exact placement; citizens, thresholds, stalls, doors, hazards, custody, knowledge, and companion
participation persist. After battle, bodies, damage, fire, dropped goods, flight routes, relationships, and
obligations remain in the same market/tavern/street.

**Option C - town combat occurs only in dedicated arena locations.** Simpler technically, but makes ordinary town
violence discontinuous or impossible.

#### F10.9h.4 - what may happen elsewhere in the bounded town while one venue is active?

**Option A - everything outside the mounted venue freezes.** Deterministic, but town clocks, factions, shops, and
known obligations cannot move.

**Option B - bounded owner-driven updates without continuous spatial simulation (recommended).** World/site clocks,
scheduled obligations, stocks, relationships, factions, and externally owned events may update through receipts.
Unseen citizens do not walk simulated streets or discover things merely because the venue is offscreen. Returning
mounts the resulting canonical state.

**Option C - continuously simulate every street, venue, and citizen.** Expensive and contrary to the active/site/
cold ownership model.

#### F10.9h.5 - how does movement between town venues work first?

**Option A - instantaneous venue jumps.** Fast, but erases travel burden, district events, access, and companion
same-scene opportunities.

**Option B - short Urban Walk transitions over canonical edges (recommended).** Moving between venue nodes consumes
a bounded one-or-few-segment Urban Walk or a certified direct threshold. It can host a street beat, obstruction,
companion action, or conflict without requiring every street cell to exist. Repeated trivial edges may compact once
known and safe.

**Option C - manually walk every continuous street tile.** Strong spatial presence, with high scale, camera,
content-density, and inactive-town cost.

**Codex recommends Option B for all five.** P10.9 remains open; performance/device/accessibility stays P10.10 and no
build is authorized.
