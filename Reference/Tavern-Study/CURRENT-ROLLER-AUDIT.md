# Tavern / Hospitality Venue — current roller audit

date: 2026-07-26  
status: implementation evidence; no live-engine changes authorized  
receipt set: `ROLL-RECEIPTS.json`

## 1. What was actually exercised

The capture uses the repository's full manifest load order in jsdom. Each retained
sample exercises:

```text
rollPlace({ realm, depth:true, archetypeBias:[2,11] })
  → codexAdd(place)
  → buildingApproach(world, "tavern", { realm })
  → buildingContact(world, buildingId)
```

The seed selector searches labels until the **first** `rollPlace` invocation produces
universal Place Spine key `2` Watering-hole or `11` Lodging. The receipt retains the
search nonce and 32-bit seed. No output atom is rerolled because it looks bad.

The harness separately calls the compiled Tavern 2.0 foundation, sensory, barkeep, and
in-media-res tables. That lane is labeled `compiledUnwiredDepthLane`; it is evidence of
preserved source capability, not a claim that the integrated path consumed it.

## 2. Current source-state map

| layer | status | what it currently contributes |
|---|---|---|
| Place Spine key 2 `Watering-hole` | `LIVE` | a roomy site, 2–4 staff expectation, trade/service/margin cast shape, and drink/food/talk/feud note |
| Place Spine key 11 `Lodging` | `LIVE` | a roomy site, guest/pass-through premise, realm-skinned label, staff/cast expectation |
| `PLACE_SKINS` | `LIVE` | Frontier/Chrome/Gloom labels, name-pattern hint, props/surfaces pointers |
| `BUILDING_KITS.tavern` | `LIVE` | Tavern/Noodle Bar/The Diner label, function line, role hint, patrons/economy/hook metadata, name table |
| `rollBuilding("tavern")` | `LIVE` | kit + realm label + one ungated row from the broad shared `building-interior` d300 + Tavern 2.0 name |
| `buildingApproach` | `LIVE` | soft codex building, rolled NPC, ambient population, guaranteed NPC hook |
| `buildingContact` | `LIVE` | hard-lock building and proprietor, Distant Word, chance tavern encounter |
| Tavern 2.0 name | `LIVE` | adjective + creature/object name |
| Tavern 2.0 foundation subtables | `COMPILED-UNWIRED` | type, scalar quality, primary clientele, known-for |
| Tavern 2.0 sensory/barkeep/in-media-res | `COMPILED-UNWIRED` | walk-in sensory triplet, staff quirk, immediate action |
| Tavern 2.0 exterior/layout/gatekeeping | `ARCHIVED-SOURCE` | not extracted, not compiled, not wired |
| Tavern 2.0 regular/transient volumes | `ARCHIVED-SOURCE` | not extracted, not compiled, not wired |
| Tavern 2.0 rumor/secret/food/drink/object | `ARCHIVED-SOURCE` | not extracted, not compiled, not wired |
| semantic hospitality plan / spatial compiler | `UNBUILT` | no operating or capacity reconciliation |

One maintainability wrinkle: `Tavern - Foundation.md` declares
`id: tavern-foundation` and `type: table-set`, but the callable child ids are generated
from the full heading text:

- `tavern-type-d20-source-dmg-p-113`;
- `quality-tier-d6-source-phb-lifestyle-expenses`;
- `who-it-serves-d10`; and
- `known-for-its-d20-source-adapted-from-dmg-p-114`.

`rollTable("tavern-foundation")` returns `null`. No live consumer currently depends on
the prose-derived child ids, but a future wiring pass should give the children stable
declared ids rather than canonizing heading slugs.

## 3. Twelve-receipt census

| measure | observed result |
|---|---:|
| samples | 12 |
| realms | Frontier 4 · Chrome 4 · Gloom 4 |
| Watering-hole / Lodging contexts | 7 / 5 |
| place footprint bands | every sample 3–4 × 3–4 current cells |
| ambient cast | min 2 · max 4 · mean 3 |
| Distant Word results | 12/12 |
| chance ambient encounters | 4/12 |
| ungated typed calls selecting a row explicitly describing a tavern | **1/12** |
| proprietor roles explicitly describing a hospitality operator | **0/12** |
| Chrome/Gloom names using a realm-specific naming grammar | **0/8** |

The 3–4 × 3–4 values are Place Spine `roomy` dimensions. They are not derived from
tables, seats, staff routes, beds, kitchen throughput, accessibility, or tactical
capacity.

## 4. Receipt summary

| receipt | context | typed label/name | generic interior result | immediate contact |
|---|---|---|---|---|
| Frontier-01 | saloon | Tavern / The Prancing Pony | warehouse floor + loading dock | no encounter |
| Frontier-02 | saloon | Tavern / The Leering Demon | post office branch | protest |
| Frontier-03 | boarding house | Tavern / The Lonely Mountain | furrier with cold room and drained basement | no encounter |
| Frontier-04 | boarding house | Tavern / The Leering Demon | tavern with two cellars and correspondence archive | no encounter |
| Chrome-01 | capsule flophouse | Noodle Bar / The Wandering Eagle | street banking deposit office | no encounter |
| Chrome-02 | noodle bar under rail | Noodle Bar / The Leaping Spirit | mill floor, grain store, miller's quarters | mistaken-rival drunk |
| Chrome-03 | capsule flophouse | Noodle Bar / The Staggering Dwarf | temple with impossible secondary shrine | pickpocket |
| Chrome-04 | noodle bar under rail | Noodle Bar / The Golden Dolphin | self-working workshop | no encounter |
| Gloom-01 | diner closing at nine | The Diner / The Lonely Mountain | speaking-portrait great hall | no encounter |
| Gloom-02 | diner closing at nine | The Diner / The Gilded Rose | chandler's warehouse outlet | corpse |
| Gloom-03 | motel off county route | The Diner / The Barking Dog | translator's office | no encounter |
| Gloom-04 | diner closing at nine | The Diner / The Roaring Horde | shopfront, back stall, cellar | no encounter |

The table records the output literally. These results demonstrate the general
interior roller's breadth; they are not eleven defective interior rows. A future
adapter may establish that a diner occupies a former chandler or a noodle bar operates
in a haunted workshop, but that relationship does not exist in the current receipt.
Calling every unresolved combination “adaptive reuse” after the roll would simply hide
the missing typed-selection and reconciliation steps.

## 5. What is working

### 5.1 The scene has social mass

The live venue is not an empty room. A responsible-person record, two to four other
people, and at least one hook are present. That is a meaningful engine strength.

### 5.2 The codex lifecycle is honest

The building and proprietor mint soft and lock hard on contact. The fixture can retain
identity across SceneTray, later exploration, and BattleMap promotion.

### 5.3 Distant Word is better than a free-floating rumor table

Most sampled results transformed a specific ledger fact about a bridge closure through
a named lens while retaining the real fact in DM data. Even the color results visibly
identify that no bound fact exists. That is stronger canon discipline than Tavern
2.0's three independent high-fantasy rumor rolls.

### 5.4 Realm place labels can carry a useful host premise

`The noodle bar under the rail line`, `The diner that closes at 9 sharp`, `The capsule
flophouse`, and `The motel off the county route` are materially suggestive. They should
become inputs to spatial and operating decisions, not remain labels.

### 5.5 Tavern 2.0's staged depth is worth preserving

The archived procedure correctly recognizes that an arrival scene needs less depth
than a venue the players investigate. Its Foundation → Layout → Population → Details
sequence remains a good disclosure and cost-control strategy.

### 5.6 The general interior roller is a strength

The d300 binds a connected layout, notable feature, present occupant/object/trace, and
spice band into one authored row. Its Grounded-through-Mythic breadth includes direct
hospitality rows—taprooms, inns, hostelries, alehouses, guesthouses, shared lodging,
cellars, and transformed taverns—as well as the many other hosts seen in the receipts.

That shared range remains useful for untyped discovery and authored source mining. The
later 42-roll audit proved that filtering it is not enough for typed programs. Typed
Tavern now routes to a coherent Public-Service chassis and Hospitality-specific
arrangement/current-scene/Spice layers; reviewed d300 relationships may migrate with
lineage, and whole rows require explicit adaptive reuse.

## 6. Failure causes

### 6.1 Ungated use of the general interior roller

`rollBuilding` calls:

```js
rollBuildingInterior({ kind: type })
```

`kind` is descriptive only; it does not route to a tavern plan. The function therefore
draws from the entire generic `building-interior` table. The existing typed delegation
seam is `opts.type`, but calling it from `rollBuilding` would recurse back through
`rollBuilding`; it is not a ready fix. A host-compatible spatialization step is
missing.

This is a caller/control failure, not a reason to delete the d300. The accepted
successor keeps raw untyped access to every row while removing the flat d300 from
typed primary selection. Family/program tables provide coherent typed layering; a
sidecar remains useful for legacy lineage and explicit adaptive reuse.

### 6.2 The proprietor hint is not an occupation constraint

`BUILDING_KITS.tavern.proprietorRoleHint` is `tavern-keeper`.
`buildingApproach` passes it as `rollNPC({ roleHint: ... })`, but `rollNPC` uses
`roleHint` to alter coherence only. The actual role still comes from the realm role
pool. That is why the samples produced laborers, miners, a railroad agent, cult
recruiter, caravan guard, herbalists, farmers, artisan, and servant.

This does not mean those people cannot operate venues. It means the current engine
does not establish whether they are owner, tenant, manager, cook, host, porter, server,
supplier, household member, or merely the person found at the counter.

### 6.3 Culture is currently a shallow relabel

The kit can become Noodle Bar or The Diner, and the place skin provides strong setting
phrases, but:

- the name remains The Prancing Pony / Golden Dolphin / Barking Dog vocabulary;
- Tavern 2.0 sensory results still presume tankards, bar brightness, ale, mead,
  pipeweed, bards, and medieval-fantasy events;
- seating, ordering, sharing, payment, tipping, cover, etiquette, service vessels,
  hours, and public/private behavior do not change; and
- the layout has no culture/doctrine input.

### 6.4 Capacity is not causal

The current live cast uses a scene bucket and the archived procedure rolls regulars
and transients independently. Neither is constrained by:

- usable floor area;
- seats or standing zones;
- service throughput;
- fire/egress;
- beds;
- staff;
- event schedule;
- animal/cargo space; or
- the public/private/service division.

The archived tables can produce up to 100 regulars and 60 transients without asking
whether the plan can hold them.

### 6.5 Service is prose, not an operating model

The kit says “drink, gossip, a room for the night,” but nothing commits:

- which services are actually active;
- whether alcohol is present;
- where food comes from;
- who works;
- when it opens;
- how guests order and pay;
- how credit, tabs, or records work;
- how supplies, water, waste, laundry, and sanitation move;
- whether lodging is public, private, shared, or offsite; or
- what happens at closing, shift change, or a private event.

### 6.6 Story atoms do not negotiate

The place, generic interior, proprietor role, proprietor hook, ambient cast,
Distant Word, Tavern 2.0 foundation, sensory triplet, and action beat all roll
independently. Contradiction can be productive, but there is no step that:

1. binds compatible atoms;
2. explains licensed adaptive reuse;
3. rejects impossible combinations;
4. creates a provider/route for external obligations; or
5. reports relaxation/fallback.

### 6.7 Archived detail creates orphan canon

Tavern 2.0's rumor and owner-secret tables can invent a local lord, guild, cellar,
portal, sewer tunnel, cult, crime syndicate, noble owner, family, or hidden object
without resolving an existing world entity. Its layout table can likewise mint secret
rooms and a labyrinth directly. Those are useful prompts, but they cannot be wired
verbatim into the story-first engine.

## 7. Tavern 2.0 content verdict

| content | disposition | reason |
|---|---|---|
| progressive disclosure | `PRESERVE` | excellent table-use rhythm |
| name | `PRESERVE-AS-ONE-CULTURE-POOL` | useful Frontier-like grammar, not universal |
| type | `DECOMPOSE` | mixes service, clientele, claim, crime, class, and sexual service |
| scalar quality | `DECOMPOSE` | condition, price, comfort, prestige, cleanliness, and care should not collapse into one class ladder |
| clientele | `PRESERVE-REFINE` | retain mix and recognition; avoid one-exclusive-category default |
| known-for | `PRESERVE-REFINE` | useful reputation surface; several rows stereotype people rather than venue practice |
| exterior tells | `PRESERVE-RECONCILE` | require host/material/culture/condition compatibility |
| layout combos | `RECIPE-SEEDS` | use only after obligations; remove automatic secret/extra spaces |
| gatekeeping | `DECOMPOSE` | derive from ownership, law, recognition, hours, event, price, safety, and claim |
| regular/transient volumes | `REPLACE` | attendance must follow capacity, schedule, event, and catchment |
| rumor | `REPLACE-WITH-WORLD-BINDING` | Distant Word is the stronger model |
| owner secret | `REFRAME` | use bound debt, claim, concealment, relationship, or evidence |
| food/drink | `PRESERVE-AS-CULTURE/SUPPLY OUTPUT` | route through ecology, trade, season, equipment, price, and practice |
| distinct object | `PRESERVE-WITH-OWNERSHIP` | give object identity, location, owner, evidence value, and movement |
| sensory | `PRESERVE-REFINE` | derive from active service, crowd, heat/light, sanitation, culture, and current beat |
| barkeep quirk | `PRESERVE-AS-PERSON ATOM` | do not substitute a quirk for an operator role |
| in media res | `PRESERVE-REFINE` | bind participants and consequences to current cast/world |

Particular craft-pass flags:

- “caters to specific race” should not remain a generic fantasy ethnicity switch;
- brothel, thieves' guild, secret society, and gambling are claim/service/current-use
  possibilities, not equivalent architectural tavern types;
- disability-coded speech/body traits need the same respectful character-writing pass
  as other NPC content;
- high-fantasy food and drink should not be the default cross-realm cuisine; and
- “no secret; owner is paranoid” is a good corrective row, but it does not solve the
  table's unbound-canon problem.

## 8. Replay boundary

The capture harness makes the current global `Math.random` surface deterministic. The
public tavern call chain does not yet expose one complete seeded receipt:

- `placeForRealm` accepts an rng, but `rollPlace` does not forward one;
- `rollBuilding` accepts `opts.rng`, but its name and generic interior use global
  randomness; and
- the ambient, NPC, hook, Distant Word, and encounter paths use global randomness.

The JSON is reproducible through the included harness, but a future product-grade
receipt should own and thread a seed without replacing these existing rollers.

## 9. Minimum pre-implementation gates

Before the live tavern path is deepened:

1. define the `HospitalityVenueProfile` semantic output;
2. freeze the d300 source rows for untyped discovery and legacy lineage;
3. author the Public-Service family chassis plus Tavern arrangement,
   current-scene, Spice, and realm-doctrine layers;
4. define stable table ids for extracted foundation children;
5. separate operator role from generic NPC coherence/occupation;
6. require an explicit transform before any whole d300 adaptive-reuse row enters the
   typed path;
7. derive attendance from capacity and schedule;
8. bind source-row occupants, secrets, rumors, debts, claims, and objects to
   codex/ledger entities;
9. establish culture/doctrine cards as behavioral/spatial rules;
10. retain the twelve baseline receipts; and
11. prove the chosen Golden Venue seed without editing away its source contradictions.

The accepted typed architecture is in
`../../docs/BUILDING-PROGRAM-TABLE-FAMILIES.md`.
`INTERIOR-GATING-PROPOSAL.md` is superseded for typed primary selection.
