---
type: system-spec
status: proposed-runtime-seam
created: 2026-07-12
related:
  - "[[DM-CHARTER]]"
  - "[[DUNGEON-GRAPH]]"
  - "[[GRAPHICS-ENGINE]]"
  - "[[BEAUTY-WAVE-5]]"
---

# Walk Card Dealing and Secret Networks

## 0. Ruling

A walk is generated like a deck being dealt into a graph.

The tables mint authored cards. The graph supplies possible homes and relationships. Before first
contact, a deterministic dealer assigns every card a meaningful home that improves intrigue,
narrative, tactical play, pacing, or player reward. Once contacted, the assignment is hard canon.

An overloaded room is not solved by deleting cards or shrinking every idea into illegibility. Cards
may be dealt into suitable empty rooms, secret spaces, connections, clue chains, or the staging
reserve. Empty encounter results are deliberate capacity and pacing beats, not failed generation.

## 1. Canonical Pipeline

```text
table rolls
  -> walk setup + graph
  -> card deck (unhomed facts)
  -> room capacities + topology roles
  -> deterministic deal
  -> secret network + clue distribution
  -> validation (every card has a meaningful home)
  -> soft generated walk
  -> first contact locks assignments
  -> DM digest + visual projection
```

The dealer runs before a generated walk is observed. Redistributing an unobserved soft card is
generation; moving an observed card is a world event and must use the normal Ledger/event contract.

## 2. Card Scopes

| Scope | Examples | Mobility before contact |
|---|---|---|
| `structural` | room dimensions, architecture, ordinary exits | fixed to room/edge |
| `walk` | encounter group, lore, active magic, discovery, centerpiece | deal to a compatible room |
| `relational` | clue chain, patrol, secret connection, foreshadow/answer pair | requires two or more homes |
| `runtime` | corpse, breach, fire, broken cover, NPC consequence | created and captured during play |

Cards retain both `sourceRef` and `originSegNum`. `homeSegNum` says where the final deal placed the
card; it never erases where the roll originated.

## 3. Data Contract

```js
walk.deck = {
  version: 1,
  cards: [
    {
      id: "npc-watchers",
      sourceRef: "roll:dungeon-contact:117",
      originSegNum: 3,
      scope: "walk",
      kind: "encounter",
      role: "cast",
      mechanical: true,
      count: 6,
      priority: 95,
      secretId: "watch-chamber",
      visual: {
        presentation: "group",
        size: "medium",
        maxRepresentatives: 3,
        groupFootprint: "2x2",
        slug: "fantasy-humanoid-watchers",
        position: {x: 18, y: 9}
      }
    }
  ],
  assignments: [
    {
      cardId: "npc-watchers",
      homeSegNum: 5,
      lane: "stageNow",
      reason: "secret-encounter-space"
    }
  ]
};
```

`visual.position` is authored by the spatial/card dealer in SpatialPlan cell coordinates. The
renderer never invents a coordinate for a canonical noun. A card without a compatible art binding
or valid socket remains narratable and source-referenced rather than receiving a misleading proxy.

## 4. Room Capacity

### Mechanical role and visual presentation are orthogonal

Never infer render channel solely from mechanical role. A creature may currently look like a prop,
architectural element, terrain, corpse, plant, or another creature. Conversely, an ordinary object
may become a combatant through animation.

```js
{
  id:"mimic-card-7",
  entityRef:"codex:mimic-7",
  presentationId:"room-object-7",
  sourceRef:"S2.encounter",
  publicSourceRef:"S2.object",
  role:"cast",
  visual:{position:{x:12,y:7}}
}

codexEntity.guise = {
  active:"chest",
  forms:[
    {formId:"chest",spriteSlug:"fantasy-chest-closed",kind:"object",
      sizeBand:"medium",scaleVsHuman:0.8,statFrame:null},
    {formId:"true",spriteSlug:"mimic",kind:"monstrosity",
      sizeBand:"medium",scaleVsHuman:1.0,statFrame:"mimic"}
  ],
  revealState:"hidden",
  driver:"innate"
};
```

This is the existing `docs/GUISE.md` contract, not a walk-local substitute. The walk card references
the entity; the projection receives a read-only `guiseByEntityId` snapshot and resolves only the
active form. While concealed or suspected, it emits the chest sprite and public object provenance,
never the inactive mimic form. After `{type:"guise_swap",payload:{npcId,toFormId,witnessed}}`, the
same entity resolves through its new active form and crosses from object presentation to cast/standee
presentation. The existing `guise-swap` verb already handles standee texture/scale crossfades; the
object-card to standee channel handoff remains GUISE G3's explicit build seam. This same contract covers animated armor, flying swords, rugs,
creatures resembling statues/stone/vegetation/corpses, and spell-created object transformations.

The observation-chamber case remains different: hidden occupants have no public guise in the active
room, so they emit no geometry until revealed. Concealment is not one universal rendering behavior.

Capacity is multidimensional:

```js
room.capacity = {
  mechanical: 8,   // pathing, cover, hazards, occupied footprint
  visual: 6,       // silhouettes that remain legible in one composition
  narrative: 3,    // immediate sensory ideas before prose becomes a dump
  secret: 2        // concealed payload complexity
};
```

Mechanical truth always wins. Visual and narrative capacities control presentation, not canon.

An `Empty` encounter means no immediate primary encounter. It grants additional visual/secret
capacity, but the cadence solver protects truly quiet rooms:

- at most one promoted major visible card by default;
- any number of low-density clues if they remain one coherent beat;
- substantial hidden payload is allowed;
- the room must still read as quiet on first entry unless a promoted card deliberately changes it;
- at least one quiet room remains in walks long enough to support one.

## 5. Dealing Order

1. Place structural cards and real graph edges.
2. Place finale, objective, fairness telegraphs, and mandatory mechanics.
3. Place encounters and hazards with footprint constraints.
4. Place reward-budget cards by depth/risk.
5. Build secret payloads and secret graph edges.
6. Deal overloaded movable cards into compatible empty/low-density homes.
7. Distribute lore fragments, tells, contradictions, and confirmations.
8. Place dressing and atmosphere around the resulting scene register.
9. Validate every card's home, provenance, reveal state, and reward cost.

Suggested deterministic score:

```text
homeScore(card, room) =
    semanticAffinity
  + topologyAffinity
  + capacityFit
  + pacingValue
  + foreshadowDistance
  + secretSynergy
  + rewardCurveFit
  - visualOverload
  - mechanicalOverload
  - repetition
```

Use a stable walk/card hash only to break equal scores. Never call render-time RNG.

## 6. Secret Network

Every dungeon room may keep its current secret opportunity. Opportunities are not required to be
independent payloads. They may be tells, clue homes, entrances, observation points, or fragments of
a smaller number of richer secrets.

```js
walk.secretNetwork = [
  {
    id: "watch-chamber",
    kind: "encounter",
    sourceRef: "S3.secret",
    fromSegNum: 3,
    toSegNum: 5,
    state: "hidden",
    payloadRefs: ["npc-watchers"],
    clueRefs: [
      {roomSegNum: 2, sourceRef: "card:extra-tracks"},
      {roomSegNum: 3, sourceRef: "card:muffled-counting"}
    ],
    reveal: {
      vector: "Acoustic Tell",
      skills: ["Perception", "Investigation"]
    }
  }
];
```

Supported kinds should include `compartment`, `connection`, `chamber`, `encounter`, `lore`,
`reward`, `bypass`, `observation-point`, `false-room`, `origin-system`, and `external-route`.

A secret connection is a graph fact, not suggestive prose. It needs endpoints, spatial binding,
state, traversal rules, and an optional edge record. Hidden connections produce no aperture,
neighbor preview, pathing, or ShotPlan provenance. `noticed` produces only its authored tell.
`revealed` may produce the opening, destination hint, occupants, and traversal edge.

## 7. Worked Example: The Observation Chamber

Room 3 initially receives too many cards:

- six faction watchers;
- a large shrine centerpiece;
- an active ward;
- crate-and-balustrade cover;
- a spreading floor hazard.

Room 5 rolled `Empty` and has a standard secret-encounter opportunity. The dealer resolves the hand:

| Card | Home | Presentation |
|---|---|---|
| spreading hazard | Room 3 | mandatory stage geometry |
| tactical cover | Room 3 | compressed into two coherent cover assemblies |
| shrine | Room 3 | dominant centerpiece/objective anchor |
| active ward | Rooms 3/5 relation | effect originates behind shrine and threads through wall |
| two visible watchers | Room 3 | immediate social/combat cast |
| four watchers | secret Room 5 observation chamber | concealed encounter payload |
| extra tracks | Room 2 | clue: more occupants than have appeared |
| muffled counting | Room 3 | clue/tell, no hidden geometry |

Before discovery, Room 3 shows two watchers and the honest tactical situation. The DM can mention
tracks and a barely audible cadence without dumping the chamber. The board does not render four
hidden standees, a secret aperture, or Room 5.

When the secret is noticed, the wall may receive only the authored tell: airflow, a seam, moving
shadow, or sound. When revealed, the graph edge activates, the doorway enters the room shell, and the
four hidden watchers become eligible for staging. They may be represented by three standees plus a
canonical count/footprint if six individual silhouettes would make the composition unreadable.

This is not overflow disposal. The overloaded NPC roll created evidence, suspense, an alternate
approach, and a materially different encounter.

## 8. Lore Restoration

The current dungeon walker rolls a secret opportunity in every room, but lore payloads only occur
when the ordinary encounter branch lands on `Lore`. Restore the paired `Dungeon Lore Content` and
`Dungeon Lore Art` tables as a walk-wide lore spine.

Recommended cadence:

- 1-3 rooms: one lore spine card;
- 4-7 rooms: one primary card plus one corroboration/contradiction;
- 8-13 rooms: two primary cards, each with distributed fragments;
- Major/Mythic secret opportunities strongly prefer hosting the physical revelation;
- Micro/Minor opportunities prefer clue fragments, symbols, tools, or partial depictions.

The same-number Content/Art pairing remains atomic. Distribute its revelation chain, not its truth:

```text
early room: sensory fragment or motif
middle room: contradiction or practical consequence
secret home: physical art/revelation
later room/finale: confirmation or larger implication
```

This directly implements DM Charter section 4. A lore card is not automatically player knowledge;
its fragments and reveal state determine what the relevance-scoped digest serves.

## 9. Reward Accounting

Every secret may feel rewarding, but not every secret may mint unbudgeted treasure. Secret rewards
must consume, relocate, or transform the walk's reward budget unless a source table explicitly grants
an additional reward.

Valid non-inflationary rewards include information, leverage, shortcut, safe rest, tactical advantage,
hazard avoidance, access to already-budgeted loot, and persistent discovery. Reward assignment and
secret placement must be validated together.

## 10. DM Digest Contract

The DM receives three relevance-scoped lanes:

- `stageNow`: mechanically present and visibly legible facts;
- `narrateNow`: 1-3 sensory/narrative anchors for the current beat;
- `reserve`: a small ranked slice of additional canonical cards available for slow-drip promotion.

The DM-only digest may know concealed payloads needed for adjudication. Player UI and visual
projection must not. Persistent connective invention follows DM Charter section 8.5: invent freely
at the edges, capture always, never contradict a dealt card.

## 11. Visual Engine Contract

`walkSceneProjectionFrom(walk, segment, plan, opts)` is the player-safe projection boundary.

`opts.guiseByEntityId` is a read-only snapshot of the existing `codexEntity.guise` records referenced
by dealt cards. The projection never owns or mutates forms and never defines a second guise schema.

- Mandatory cards stage before decorative cards.
- Explicit `stageNow`/`narrateNow`/`reserve` assignments are honored.
- Empty encounter rooms receive extra projection capacity.
- Canonical group count survives representative-standee compression.
- Authored `visual.slug + visual.position` cards join the ordinary dressing construction path.
- Overloaded explicit deals suppress incidental random dressing, not authored/mechanical citizens.
- ShotPlan receives source references and uses room framing for overloaded compositions.
- Hidden cards and connections emit no player geometry or provenance.
- Noticed secrets emit only an authored tell.
- Revealed connections become eligible for spatial aperture binding.

The current runtime seam is additive. Legacy walks without `walk.deck` derive a conservative
projection from their existing segment fields and keep current dressing behavior.

## 12. Required Follow-On Units

1. `WCD-1`: roll stamped cards and preserve table provenance.
2. `WCD-2`: deterministic graph-wide dealer and room capacity model.
3. `WCD-3`: secret-network builder with real hidden edges and spatial wall sockets.
4. `WCD-4`: lore-spine restoration using paired Content/Art rolls.
5. `WCD-5`: DM digest lanes plus typed promotion/reveal overlay events.
6. `WCD-6`: visual bindings, group standees, revealed apertures, and capture gates.

## 13. Acceptance Gates

1. Every rolled card has exactly one meaningful home or relational assignment before contact.
2. Same walk snapshot produces byte-identical deal and player projection.
3. Player projection serialization contains no concealed payload text, identity, count, or position.
4. A noticed secret emits its tell but not payload or destination.
5. A revealed secret connection activates exactly one authored edge/aperture.
6. Empty-room promotion never eliminates the walk's required quiet cadence.
7. Mechanical footprints survive group/assembly compression.
8. Reward totals remain within the walk budget.
9. Lower visual capacity changes lanes/representation only, never card canon.
10. The observation-chamber fixture passes hidden, noticed, and revealed snapshots.
