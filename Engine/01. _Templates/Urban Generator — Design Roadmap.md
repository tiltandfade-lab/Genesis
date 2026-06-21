---
type: design-doc
system: dnd5e
scope: urban-generator
status: active
version-current: 3.1
version-target: 3.5
tags:
  - urban
  - generator
  - design
  - topology
  - arcana-engine
---

# Urban Generator — Design Roadmap

> **Current Release:** v3.1 (2026-04-04) — Prep Roster. **Target:** v3.5 — Pen-and-Paper Derivation.
> This document is the single source of truth for what's been decided, what's been deferred, and why. Versions are additive — each release ships one coherent capability layer.

> **Design Philosophy:** First-pass creative tool. Generates one-shot adventures or adventure components that can be dropped into urban settings. Not for DMs with strict maps — for DMs who want a sketch they can react to, reshape, and plant into a district. The generator should produce coherent adventure shapes, not random encounter rolls.

> **Pen-and-Paper Constraint:** Every system must ultimately translate to dice rolls and sub-tables. No affinity tags, no computational logic that can't be replicated with physical dice at a table. If it can't be done with a d20 and some nested d6s, it doesn't ship.

---

# I. Generation Cascade

The generator produces content in a strict order. Each layer informs the next.

```
1. TOPOLOGY       → Picks the adventure structure (d20 or choose)
2. GRAPH          → Builds the node map with structural labels
3. SEGMENT TYPES  → Populate per-node, filtered by topology + position (sub-tables)
4. TRANSITIONS    → Generate conditionally, baked into segment type rows (sub-tables)
5. ENCOUNTERS     → Per-segment, encounter content fills each node
6. SETUP IDENTITY → Roll-once table defining the adventure's DNA
7. HEAT SYSTEM    → Integrated pressure mechanic (first-class, not separate file)
8. FINALE         → Final segment procedure (boss, revelation, exit state)
```

Steps 1–4 are the structural skeleton. Steps 5–8 are the content layers.

---

# Ia. The Spice Curve

## Design Principle

Tables use a **weighted probability curve**: low numbers produce standard, instantly-usable results; high numbers produce increasingly wild, creative, campaign-defining results. This allows every table to contain spicy entries without risking incoherent adventures on most rolls. The DM internalizes the curve once and it works everywhere: **low = safe, high = wild.**

The curve scales with die size. Bigger dice have more room for a weirdness gradient. Smaller dice keep it simple.

## Curve by Die Size

### d20 — Full Five-Band Curve *(Setup tables)*

| d20 | Band | Weight | Register |
|:---:|:-----|:------:|:---------|
| 1–8 | Standard | 40% | Bread and butter. Instantly usable, no head-scratching. |
| 9–14 | Unusual | 30% | Interesting twist. DM goes "oh, that's cool" and runs with it. |
| 15–17 | Strange | 15% | Requires creative thinking to integrate. Memorable. |
| 18–19 | Volatile | 10% | The adventure just got weird. Players will talk about this. |
| 20 | Mythic | 5% | Completely unhinged. Campaign-defining if the DM commits. |

### d12 — Four-Band Curve *(larger sub-tables)*

| d12 | Band | Weight | Register |
|:---:|:-----|:------:|:---------|
| 1–5 | Standard | 42% | Reliable, grounded results. |
| 6–8 | Unusual | 25% | A twist that adds texture. |
| 9–10 | Strange | 17% | Creative territory — the DM has to work a bit. |
| 11–12 | Volatile | 17% | Things just got interesting. |

### d10 — Three-Band Curve *(mid-size sub-tables)*

| d10 | Band | Weight | Register |
|:---:|:-----|:------:|:---------|
| 1–5 | Standard | 50% | Solid, expected results. |
| 6–8 | Unusual | 30% | A welcome surprise. |
| 9–10 | Strange | 20% | The DM leans forward. |

### d8 — Three-Band Curve *(common sub-tables)*

| d8 | Band | Weight | Register |
|:--:|:-----|:------:|:---------|
| 1–4 | Standard | 50% | Safe, coherent results. |
| 5–6 | Unusual | 25% | Adds flavor without friction. |
| 7–8 | Strange | 25% | The segment just got memorable. |

### d6 — Two-Band Split *(small sub-tables)*

| d6 | Band | Weight | Register |
|:--:|:-----|:------:|:---------|
| 1–4 | Standard | 67% | The workhorse results. |
| 5–6 | Spicy | 33% | A little heat — interesting, not insane. |

### d4 — No Curve *(tiny sub-tables)*

All four entries are standard. The d4 is too small to risk a wild entry — every result must be immediately usable. If a sub-table only needs four entries, none of them should require creative gymnastics.

## Applying the Curve

When writing table entries:
- **Fill the Standard band first.** These are the entries that make the table work 90% of the time.
- **Then write the top end.** These are the entries that make the table *memorable* 10% of the time.
- **The number itself communicates the register.** A DM who rolls a 19 on a d20 knows to buckle up before reading the entry. A DM who rolls a 3 knows they got something solid.
- **Wild collisions are a feature.** A Mythic Catalyst paired with a Standard Power Structure creates *interesting* tension. The DM's job is to make the collision make sense — and that's where the best adventures come from.

## Die Assignment Guidance

The die assigned to a sub-table communicates its creative range:
- **d4** — Every option is grounded and interchangeable. Use for tiny lists where all results are equally valid.
- **d6** — Mostly grounded with a touch of spice. Use for transition sub-tables and small segment lists.
- **d8** — The default workhorse. Use for most segment type sub-tables.
- **d10** — Room for some creative entries. Use when a label has natural variety.
- **d12** — Solid creative range. Use for labels that span a wide spectrum (e.g., Faction Scenes in a Tightrope).
- **d20** — Full curve. Reserved for Setup tables and the Topology table.

---

# II. Topology (d20)

## Design Principle

In a dungeon, topology IS the adventure — physical layout and narrative structure are the same thing. In a city, topology is the **adventure structure, not the physical space**. Players can walk anywhere. The "connections" between segments aren't hallways — they're narrative threads: a clue points here, a contact sends you there, a commotion draws you somewhere else.

Urban topology types describe **how the adventure flows**. The DM skins the nodes onto whatever physical locations make sense in their city.

## The 16 Types

Each topology belongs to one of four **player posture** families, describing what the players are primarily doing during the adventure.

---

### Investigative Posture *(the party seeks answers)*

**1. The Trail**
Linear investigation, scene to scene. A lead takes you to a witness, who points to a warehouse, which reveals the hideout. Classic noir structure.
- **Graph Shape:** Spine
- **Structural Labels:** Opening → Lead → Lead → … → Finale
- **Player Experience:** Follow the thread. Each scene gates the next through information.
- **Best For:** Murder mysteries, missing persons, simple investigations

**2. The Web**
Main investigation thread with side-leads branching off. The primary path drives the plot, but tangential scenes offer allies, loot, context, or red herrings.
- **Graph Shape:** Branch
- **Structural Labels:** Opening → Core Lead → Core Lead → Finale + Branch nodes labeled "Side Lead"
- **Player Experience:** Follow the main thread or get distracted by interesting tangents.
- **Best For:** Complex investigations, faction-rich districts, adventures with optional depth

**3. The Mosaic**
Seemingly unrelated scenes that gradually reveal a hidden pattern. Each segment is a self-contained urban vignette — a crime, a disappearance, an oddity. They appear disconnected until the party connects them.
- **Graph Shape:** Isolated nodes that gain edges during play (emergent graph)
- **Structural Labels:** Fragment → Fragment → Fragment → … → Revelation (finale)
- **Player Experience:** Confusion that becomes clarity. The "wait — are these connected?" moment.
- **Best For:** Conspiracy unveiling, cult activity patterns, slow-burn horror

**4. The Shell Game**
The objective keeps moving. The party is always one step behind — or tries to get ahead. Each segment is a location where the target was or will be.
- **Graph Shape:** Node set with shifting "hot" node; linear if following, branching if predicting
- **Structural Labels:** Cold Scene → Cold Scene → Warm Scene → Hot Scene → Finale
- **Player Experience:** Chase through deduction, not athletics. Can they outthink the pattern?
- **Best For:** Pursuing a fleeing suspect, tracking a moving prisoner, following a black market exchange chain

---

### Navigational Posture *(the party moves through a structure)*

**5. The Turf**
Central location (tavern, safehouse, guild hall) with spokes to surrounding scenes. The party keeps returning to home base between excursions.
- **Graph Shape:** Hub and Spoke
- **Structural Labels:** Hub (central) → Excursion → Excursion → … → Finale (spoke or beyond)
- **Player Experience:** Safe base, dangerous forays. Gather intel at hub, act on it at spokes.
- **Best For:** Investigation with a quest-giver, establishing a base of operations, district exploration with an anchor

**6. The Layer Cake**
Surface-level scenes gate access to deeper, hidden scenes. Street level → back rooms → underground. Each layer peels back a facade.
- **Graph Shape:** Onion
- **Structural Labels:** Surface → Surface → Threshold → Inner → Inner → Core (finale)
- **Player Experience:** Peeling back layers. Each depth reveals something the surface concealed.
- **Best For:** Crime syndicates, social strata exploration, corruption investigations, underground networks

**7. The Stronghold**
Approach scenes leading to a fortified or guarded position. The party needs to get through outer defenses — physical, social, or political — to reach the target.
- **Graph Shape:** Fortified Hub
- **Structural Labels:** Approach → Approach → Outer Ring → Inner Ring → Sanctum (finale)
- **Player Experience:** Escalating resistance. Each layer is harder to penetrate.
- **Best For:** Assaulting a guild hall, reaching a corrupt official, infiltrating a noble estate, breaking into a prison

**8. The Gauntlet**
The party has something everyone wants — an object, a prisoner, knowledge — and must navigate from point A to safety while threats close in.
- **Graph Shape:** Inverted Convergence (tree fanning from start, converging on exits)
- **Structural Labels:** Start → Waypoint → Waypoint → … → Haven (finale)
- **Player Experience:** Reactive, not proactive. Every segment is something to survive or dodge.
- **Best For:** Escort missions, fleeing with a MacGuffin, getting out of a hostile district, the "escape" act of a heist

---

### Reactive Posture *(the world acts on the party)*

**9. The Rundown**
Each scene escalates and pushes forward with urgency. No time to backtrack. The pace is relentless.
- **Graph Shape:** Cascade
- **Structural Labels:** Spark → Escalation → Escalation → … → Breaking Point (finale)
- **Player Experience:** Forward momentum. Things keep getting worse. No safe harbor.
- **Best For:** Chase sequences, ticking clock scenarios, cascading disasters, "the building is on fire"

**10. The Carousel**
A large-scale public event is the backdrop. Segments are scenes happening within or around that event, connected by the event's own momentum. The event moves forward whether the players act or not.
- **Graph Shape:** Loop with Tail
- **Structural Labels:** Arrival → Event Scene → Event Scene → Event Scene → Climax (finale)
- **Player Experience:** The world moves with or without you. The event is the clock.
- **Best For:** Festivals, riots, parades, public executions, auction nights, tournaments

**11. The Stakeout**
The party holds a position. Segments are incidents that arrive over time — a suspicious visitor, a distraction, a complication, a false alarm, then the real move.
- **Graph Shape:** Timeline Spine with branching decision points
- **Structural Labels:** Setup → Watch → Watch → Incident → … → Payoff (finale)
- **Player Experience:** Restraint tested. Every segment tempts early action or inaction.
- **Best For:** Sting operations, guard duty, surveillance, waiting for a contact, ambush setup

**12. The Crucible**
The party is confined to a bounded urban space with other people and rising tension. They cannot leave until a condition is met.
- **Graph Shape:** Dense Cluster (small, heavily interconnected, no exit until finale triggers)
- **Structural Labels:** Containment → Pressure → Pressure → Pressure → Release (finale)
- **Player Experience:** Claustrophobic. The map is tiny. The pressure comes from people, not places.
- **Best For:** Locked-room mysteries, quarantine zones, prison scenarios, snowed-in taverns, siege holdouts

---

### Competitive Posture *(the party contests with rivals)*

**13. The Double Cross**
Two parallel paths to the objective — one overt, one covert. Players choose or stumble into one.
- **Graph Shape:** Loop
- **Structural Labels:** Opening → Path A / Path B (parallel) → Convergence → Finale
- **Player Experience:** Strategic choice. Social approach vs. infiltration. Diplomacy vs. force.
- **Best For:** Heists with multiple entry plans, diplomatic vs. violent solutions, "front door or back door" scenarios

**14. The Tightrope**
Multiple factions, the party in the middle. Choices in one scene change reception in the next. There is no clean path.
- **Graph Shape:** Weighted Mesh
- **Structural Labels:** Introduction → Faction Scene → Faction Scene → … → Reckoning (finale)
- **Player Experience:** Political navigation. Every yes is a no to someone else.
- **Best For:** Faction diplomacy, gang wars, political campaigns, neighborhood disputes, merchant guild rivalries

**15. The Ratchet**
The net tightens. Early segments have many connections and options. Each segment closes something off — an ally arrested, a safe house raided, a bridge blockaded.
- **Graph Shape:** Contracting Graph (many connections early, few late)
- **Structural Labels:** Open → Open → Narrowing → Narrowing → Cornered (finale)
- **Player Experience:** Shrinking freedom. Start generous, end claustrophobic.
- **Best For:** Being hunted, framed for a crime, operating under martial law, working against a deadline while resources drain

**16. The Fracture**
Shared opening, then an event splits the adventure into two simultaneous threads. The threads reconnect before the finale.
- **Graph Shape:** Figure-8
- **Structural Labels:** Opening → Split Point → Thread A / Thread B (parallel) → Reunion → Finale
- **Player Experience:** Party splits or handles two fronts. "Meanwhile, across town…"
- **Best For:** Party-split sessions, dual objectives, social + physical parallel tracks, "two things must happen at once"

---

### Topology Quick Reference (d20)

| d20 | Topology | Posture | Graph |
|:---:|:---------|:--------|:------|
| 1 | The Trail | Investigative | Spine |
| 2 | The Web | Investigative | Branch |
| 3 | The Mosaic | Investigative | Emergent |
| 4 | The Shell Game | Investigative | Shifting Nodes |
| 5 | The Turf | Navigational | Hub & Spoke |
| 6 | The Layer Cake | Navigational | Onion |
| 7 | The Stronghold | Navigational | Fortified Hub |
| 8 | The Gauntlet | Navigational | Inverted Convergence |
| 9 | The Rundown | Reactive | Cascade |
| 10 | The Carousel | Reactive | Loop + Tail |
| 11 | The Stakeout | Reactive | Timeline Spine |
| 12 | The Crucible | Reactive | Dense Cluster |
| 13 | The Double Cross | Competitive | Loop |
| 14 | The Tightrope | Competitive | Weighted Mesh |
| 15 | The Ratchet | Competitive | Contracting |
| 16 | The Fracture | Competitive | Figure-8 |
| 17–18 | Reroll or DM chooses | — | — |
| 19–20 | Roll twice, combine elements | — | — |

> **17–20 Note:** Rolling 17–18 lets the DM override with a topology that fits their prep. Rolling 19–20 is the wild card — combine the structural shape of one topology with the player posture of another. Example: a Layer Cake graph with Carousel pacing (a multi-layered conspiracy unfolding during a public festival).

---

# III. Graph Building

## Structural Labels by Topology

Each topology produces a graph of nodes. Each node gets a **structural label** that determines what kind of segment it generates. Labels are assigned during graph construction, before any content is rolled.

| Topology | Structural Labels Used |
|:---------|:----------------------|
| Trail | Opening, Lead, Finale |
| Web | Opening, Core Lead, Side Lead, Finale |
| Mosaic | Fragment, Revelation (finale) |
| Shell Game | Cold Scene, Warm Scene, Hot Scene, Finale |
| Turf | Hub, Excursion, Finale |
| Layer Cake | Surface, Threshold, Inner, Core (finale) |
| Stronghold | Approach, Outer Ring, Inner Ring, Sanctum (finale) |
| Gauntlet | Start, Waypoint, Haven (finale) |
| Rundown | Spark, Escalation, Breaking Point (finale) |
| Carousel | Arrival, Event Scene, Climax (finale) |
| Stakeout | Setup, Watch, Incident, Payoff (finale) |
| Crucible | Containment, Pressure, Release (finale) |
| Double Cross | Opening, Path A, Path B, Convergence, Finale |
| Tightrope | Introduction, Faction Scene, Reckoning (finale) |
| Ratchet | Open, Narrowing, Cornered (finale) |
| Fracture | Opening, Split Point, Thread A, Thread B, Reunion, Finale |

## Segment Count

DM chooses segment count (not counting the finale), same as dungeon generator.

**Suggested ranges by topology:**

| Topology | Min Segs | Sweet Spot | Max Before Bloat |
|:---------|:--------:|:----------:|:----------------:|
| Trail | 2 | 3–4 | 6 |
| Web | 3 | 4–6 | 8 |
| Mosaic | 3 | 4–5 | 7 |
| Shell Game | 2 | 3–4 | 5 |
| Turf | 3 | 4–5 | 7 |
| Layer Cake | 3 | 4–5 | 6 |
| Stronghold | 3 | 4–5 | 6 |
| Gauntlet | 3 | 4–5 | 6 |
| Rundown | 2 | 3–4 | 5 |
| Carousel | 3 | 4–5 | 6 |
| Stakeout | 3 | 4–6 | 7 |
| Crucible | 2 | 3–4 | 5 |
| Double Cross | 3 | 4–5 | 6 |
| Tightrope | 3 | 5–6 | 8 |
| Ratchet | 3 | 4–5 | 7 |
| Fracture | 4 | 5–6 | 7 |

---

# IV. Segment Types (Sub-Tables)

## Architecture

Each **structural label** has its own segment type sub-table. The DM rolls on the sub-table for that node's label to determine what kind of urban location/scene the segment is.

Sub-tables use standard dice increments: d4, d6, d8, d10, d12, or d20 — chosen based on how many realistic options exist for that label. A "Surface" node in a Layer Cake might have a d8 sub-table (8 types of public-facing urban locations). A "Threshold" might only need a d4 (fewer transition-point types).

**Shared Labels:** Many topologies share structural labels (e.g., multiple topologies use "Finale"). Where labels overlap meaningfully, sub-tables can be shared. Where the context differs enough, the topology gets its own version.

## Sub-Table Format

Each row of a segment type sub-table includes:

| Die | Segment Type | Description | Transition Options (d4/d6) |
|:---:|:-------------|:------------|:---------------------------|
| 1 | Busy Market Square | Open-air market, stalls, crowds, noise | 1–2: Back alley 3: Unmarked door 4: Vendor introduction |
| 2 | Harbor Dockfront | Piers, cargo, sailors, salt air | 1: Warehouse bay 2: Gangplank 3: Bribed docker 4: Sewer grate |
| … | … | … | … |

The **Transition Options** column is the nested sub-table. When the DM needs to determine how this segment connects to the next, they roll on the small die embedded in that row. This produces transitions that are always contextually plausible for the segment type — no rooftop crossings between basements.

## Sub-Tables to Build (deferred to implementation)

Each of the following structural labels needs a sub-table. Labels are grouped where sharing makes sense.

### Shared Labels
- **Opening / Arrival / Start / Setup** — how the adventure begins (shared across many topologies)
- **Finale / Climax / Payoff / Release / Reckoning / Haven / Sanctum / Breaking Point / Revelation / Cornered / Reunion** — how the adventure ends (may need 2–3 variants: combat finale, social finale, discovery finale)

### Investigative Labels
- Lead / Core Lead
- Side Lead
- Fragment
- Cold Scene / Warm Scene / Hot Scene

### Navigational Labels
- Hub
- Excursion
- Surface
- Threshold
- Inner / Core
- Approach
- Outer Ring / Inner Ring
- Waypoint

### Reactive Labels
- Escalation / Spark
- Event Scene
- Watch / Incident
- Containment / Pressure

### Competitive Labels
- Path A / Path B
- Faction Scene
- Introduction
- Open / Narrowing
- Split Point / Thread A / Thread B

> **Implementation Note:** Many of these can be consolidated. "Lead" and "Core Lead" probably share a table. "Escalation" and "Pressure" might share a table with different flavor text. The goal is: enough variety to feel alive, not so many tables that the system collapses under its own weight. Target ~15–20 unique sub-tables total, with some reuse across topologies.

---

# V. Transitions

## Design Principle

Transitions are **not a separate global roll**. They are **baked into the segment type sub-table** as a nested column. When you roll your segment type, you get the location AND a short list of plausible exits from that kind of place. The DM rolls the small nested die or picks the one that best connects to the next segment.

This is pen-and-paper native. The DM reads across the row.

For the Templater generator, the code can pick intelligently from the transition column based on what the next segment is. Best of both worlds.

## Transition Categories

Transitions fall into five movement modes. Each segment type's transition sub-table draws from whichever modes make sense for that location.

### Street-Level Movement
Main road, side street, back alley, market crowd, bridge/canal crossing, tunnel under road.
*Public, visible, fast but exposed.*

### Vertical Movement
Rooftop crossing, fire escape, balcony climb, bell tower, sewer access, basement stairs, ladder.
*Hidden but risky — physical skill checks, falling hazards.*

### Social Movement
Introduction required, password or sign, faction reputation gate, bribe, disguise check, invitation.
*No physical barrier — social currency is the key.*

### Information Movement
Clue reveals location, NPC drops a name, document points to next lead, overheard conversation.
*Knowledge gate — the next segment doesn't exist until you learn about it.*

### Temporal Movement
Nightfall, shift change, event timing, "come back at dawn," waiting for a signal.
*Time gate — you can't go there yet.*

## Transition State (Optional Roll)

If the DM wants additional texture, a separate **Transition State** roll adds a complication to any transition:

| d8 | State |
|:--:|:------|
| 1 | Clear — no complications |
| 2 | Watched — you'll be seen |
| 3 | Crowded — Stealth disadvantage, but can blend in |
| 4 | Blocked — requires alternate route or force |
| 5 | Trapped — someone set this up |
| 6 | Decaying — structurally unsafe, risk of collapse |
| 7 | Guarded — NPCs control access |
| 8 | Hidden — must be discovered first |

This is a standalone d8, optional, and universal across all segment types.

---

# VI. Setup Identity (Roll Once)

## Design Principle

Setup rolls define the adventure's DNA before any segments generate. In the dungeon generator, Setup establishes what the dungeon *is* physically (tomb, mine, temple). In the urban generator, Setup establishes what's *happening* socially — who controls this place, what it feels like, what kind of danger lurks here, and why the adventure is happening *right now*.

All Setup tables are **d20**, using the full five-band Spice Curve.

## The Eight Setup Categories

### 1. Urban Context *(the where)*
What kind of settlement or district is this set in? Trade port, temple district, slum quarter, noble ward, frontier outpost, university quarter, market hub, garrison town, etc.
- Establishes the physical and social environment.
- Informs segment type rolls downstream (a "Lead" in a temple district is different from a "Lead" in a slum quarter).

### 2. Power Structure *(the who)*
Who runs this place, and how? Replaces dungeon "Origin/Owner." A dungeon was built by someone in the past. An urban area is *controlled* by someone in the present.
- Merchant council, crime boss, religious order, military garrison, feuding families, absentee lord, nobody (power vacuum), puppet government, guild coalition, secret cabal.
- Defines the political landscape the adventure operates within.

### 3. Urban Skin *(the feel)*
The sensory identity of the area. Equivalent to Dungeon Environment Skin. What does this place look, sound, smell, and feel like?
- Fog-choked and damp, sun-baked and dusty, lantern-lit and perfumed, smoke-stained and industrial, overgrown and reclaimed, salt-crusted and maritime, torch-lit and shadowed, etc.
- Colors every description the DM gives. This is the atmospheric filter.

### 4. Cultural Motif *(the texture)*
What cultural flavor pervades the area? Replaces dungeon Art Motif. This isn't just decorative — it informs architecture, clothing, food, speech patterns, and NPC behavior.
- Maritime traditions, religious iconography, merchant opulence, military austerity, folk superstition, arcane academia, pastoral heritage, artisan craftsmanship, nomadic roots, etc.

### 5. Motif Modifier *(the twist)*
Same concept as the dungeon Motif Modifier. How is the cultural motif bent, stressed, or complicated?
- Fading, corrupted, newly arrived, in conflict with a rival motif, hidden beneath a facade, thriving, under siege, commercialized, revived after a long decline, etc.
- Prevents the motif from feeling static. "Maritime traditions, commercialized" is very different from "maritime traditions, fading."

### 6. Threat Profile *(the danger)*
What kind of danger defines this adventure? Ties directly to creature/NPC pools (low/mid/boss) the same way the dungeon Threat Identity does.
- Must cover **both human and monstrous threats**, because urban adventures swing between both.
- Examples: Guild Enforcers (thugs / lieutenant / guild master), Undead Infestation (zombies / wight / necromancer), Corrupt Watch (crooked guards / watch captain / magistrate), Cult Cell (cultists / fanatic / cult priest), Smuggler Ring (dockworkers / fence / crime lord), etc.
- Each entry should specify or imply a Low CR pool, Mid CR pool, and Boss CR pool.

### 7. Catalyst *(the spark)* — NEW, no dungeon equivalent
Why is this adventure happening *right now?* Dungeons just exist — they're always there waiting. Urban adventures need a triggering event.
- A murder, a theft, an arrival, a disappearance, a deadline, an accusation, a natural disaster, a festival, a power vacuum, a betrayal, a declaration, an escape, a discovery, a collapse, etc.
- **This is the single most important urban-specific addition.** It answers "why tonight?" and gives the DM the hook that makes the whole adventure click.

### 8. Rest Pressure *(the grind)*
What makes resting difficult in this urban area? Same concept as dungeon Rest Pressure, different flavor.
- Not cave-ins and wandering monsters — instead: noise and disruption, patrols, social obligations, time pressure, nowhere safe to sleep, being hunted, curfew, the problem gets worse if you wait, informants report your location, etc.

## Setup Identity Output Format

The Setup Identity should be presented as a compact reference block at the top of the generated adventure, similar to the dungeon's Setup table:

```
| | |
|:--|:--|
| **Context** | [result] |
| **Power** | [result] |
| **Skin** | [result] |
| **Motif** | [result + modifier] |
| **Threat** | [result] — Low: [pool] | Mid: [pool] | Boss: [pool] |
| **Catalyst** | [result] |
| **Rest Pressure** | [result] |
```

---

# VI-B. Scene Frame System — NEW, no dungeon equivalent

## Design Principle

Dungeons have room dimensions baked into every room via the Area Type d200. Urban adventures need the same objectivity — enough spatial data to sketch a battlemap — but the existing Urban Area Type d200 is almost entirely *interior* spaces (rooms, corridors, halls). Urban adventures happen on streets, rooftops, docks, and in the liminal spaces between buildings. The Scene Frame system fills this gap.

## Architecture

**Scene Frame = single d400 roll. Every segment rolls on the same table regardless of label.**

The original design routed labels to spatial categories (Street, Open, Vertical, Threshold, Interior) via a mapping table. This was replaced with a unified d400 because most urban movement crosses spatial types fluidly — a chase might go from a rooftop to a canal to a market stall. Fixed routing produced monotone spatial types within topologies. The d400 gives every segment an equal chance at any spatial type, creating natural variety.

| Table | Entries | What it covers |
|:------|:--------|:---------------|
| **Urban Scene Frame** (d400) | 001–100 Street, 101–200 Open, 201–300 Vertical, 301–400 Threshold | All outdoor/transitional urban spaces: alleys, plazas, rooftops, bridges, gates, docks, ruins, markets, sewers |
| **Urban Area Type** (d200, exists) | Interior rooms | Enclosed built spaces — used only when a scene is explicitly indoors |

No label-to-category mapping. No routing logic. One roll per segment.

## Encounter-Type Detail Filter

Not every scene needs a full battlemap. The encounter type controls how much spatial detail is generated:

| Encounter Type | Detail Level | What's shown |
|:---------------|:-------------|:-------------|
| Enemy, Hazard, Problem | **Full** | Scene frame name + base dimensions + tactical feature |
| Social, Commerce, Spectacle | **Light** | Scene frame name + base dimensions only |
| Rumor, Empty, Boon | **Skip** | No scene frame (narrative space, not physical space) |

## Entry Format

Each entry provides three fields matching the dungeon Area Type format:

| Field | Example | Purpose |
|:------|:--------|:--------|
| Scene Frame | Narrow Alley | What the DM says: "You're in a narrow alley..." |
| Base Dimensions | 5' x 40' straight | Battlemap footprint — all dimensions in 5' increments |
| Tactical Feature | 10' x 10' recessed doorway alcove providing full cover | The thing that makes this space *this* space — cover, elevation, hazards, chokepoints |

## Tables

- [x] `Urban Scene Frame.md` (d400) — `03. _Tables/03. Session Mechanics/Dungeons/`
- [x] `Urban Area Type.md` (d200, already exists) — available for explicit interior scenes
- [x] Old category tables archived: Street, Open, Vertical, Threshold (superseded by d400)

---

# VII. Encounter Types

## Design Principle

Every segment gets an encounter type roll that determines what happens there. The encounter type branches into one of eight paths, each of which fires its own sub-tables to produce the scene content.

Urban encounters differ from dungeon encounters in three key ways:
1. **Cities have commerce** — buying, selling, trading, fencing, being swindled, rare finds.
2. **Cities have spectacle** — public events, performances, accidents, brawls, celebrations that the party *witnesses* and chooses whether to engage.
3. **Cities have ambient information** — rumors, overheard conversations, posted notices, gossip networks.

## The Eight Encounter Branches

### 1. Enemy / Faction
Combat or hostile NPC encounters. Faction-aligned threats tied to the Threat Profile from Setup.
- **Tables:** Urban Enemy Category (d200, exists) + Urban Enemy Composition (d20, exists) + Tactical setup (new — urban-native terrain/positioning)
- **Covers:** Ambushes, patrols, faction enforcers, hired thugs, monsters loose in the city, guard confrontations

### 2. Social / Contact
NPC interaction — negotiation, tension, aid, betrayal, requests.
- **Tables:** Urban Contact (d200, exists) + Narrative Device (d36 — adapt from dungeon or build urban version)
- **Covers:** Meeting informants, confronting suspects, faction representatives, desperate citizens, old rivals, new allies

### 3. Problem / Obstacle
Non-combat challenge blocking progress. Requires creative problem-solving.
- **Tables:** Urban Problem (d200, exists)
- **Covers:** Locked gates, collapsed passages, bureaucratic red tape, magical wards, crowds blocking passage, broken bridges, social barriers

### 4. Hazard
Environmental danger — structural, magical, or situational.
- **Tables:** Urban Hazard (d100, exists)
- **Covers:** Building collapse, fire spread, toxic fumes, flooded streets, unstable ground, magical residue, plague zone, stampede

### 5. Commerce
Trade, economic pressure, rare finds, swindles. No dungeon equivalent.
- **Tables:** NEW — Urban Commerce table needed (recommend d100 with Spice Curve)
- **Covers:** Rare item for sale, merchant in distress, black market opportunity, price gouging, fence offering stolen goods, economic disaster, trade dispute, debt collector, auction, con artist

### 6. Spectacle
Public event the party witnesses. They choose whether to engage. Absorbs the existing Urban Foreground Event and Urban Art tables.
- **Tables:** Urban Foreground Event (exists, needs review) + Urban Art (exists, needs review) — merge into single Spectacle table or keep as paired sub-rolls
- **Covers:** Street performances, public executions, brawls, protests, celebrations, accidents, processions, duels, arrivals of important figures, magical phenomena

### 7. Rumor / Intel
Information gained through urban channels. Replaces dungeon Discovery/Lore with something social and ambient.
- **Tables:** NEW — Urban Rumor table needed (recommend d100 with Spice Curve)
- **Covers:** Overheard conversation, posted notice, graffiti message, tavern gossip, newspaper crier, informant drops intel, coded message found, drunk guard spills secrets, street urchin offers information for coin

### 8. Empty
Atmosphere, texture, breathing room. The calm between storms.
- **Tables:** Urban Empty Result (d20, exists — consider expanding to d50 for more variety)
- **Covers:** Quiet moment, environmental description, foreshadowing detail, sensory texture, the city just being a city

## Per-Topology Encounter Weight Distributions

The Templater generator uses topology-specific weights to determine encounter type probability. This ensures that a Tightrope adventure feels different from a Gauntlet without the DM having to manually adjust. The pen-and-paper version will flatten this to a single universal table with a "DM adjusts to taste" note.

### Investigative Posture

| Branch | Trail | Web | Mosaic | Shell Game |
|:---|:---:|:---:|:---:|:---:|
| Enemy / Faction | 10% | 15% | 10% | 15% |
| Social / Contact | 20% | 20% | 15% | 20% |
| Problem / Obstacle | 15% | 10% | 10% | 15% |
| Hazard | 5% | 5% | 10% | 5% |
| Commerce | 5% | 10% | 10% | 10% |
| Spectacle | 5% | 10% | 15% | 5% |
| Rumor / Intel | 30% | 20% | 25% | 20% |
| Empty | 10% | 10% | 5% | 10% |

> Trail is dominated by Rumor/Intel — the whole adventure is following information threads. Mosaic spreads wider because each fragment is a different kind of scene. Shell Game leans Social because you're constantly talking to people who saw the target.

### Navigational Posture

| Branch | Turf | Layer Cake | Stronghold | Gauntlet |
|:---|:---:|:---:|:---:|:---:|
| Enemy / Faction | 15% | 15% | 25% | 30% |
| Social / Contact | 20% | 15% | 10% | 5% |
| Problem / Obstacle | 10% | 20% | 20% | 15% |
| Hazard | 5% | 10% | 15% | 20% |
| Commerce | 15% | 5% | 5% | 0% |
| Spectacle | 10% | 5% | 0% | 5% |
| Rumor / Intel | 15% | 15% | 10% | 5% |
| Empty | 10% | 15% | 15% | 20% |

> Turf is the most balanced — it's a hub, everything happens there. Stronghold and Gauntlet ramp Enemy and Hazard because those adventures are about getting through resistance. Gauntlet has 0% Commerce — nobody's shopping during an escape.

### Reactive Posture

| Branch | Rundown | Carousel | Stakeout | Crucible |
|:---|:---:|:---:|:---:|:---:|
| Enemy / Faction | 25% | 15% | 20% | 20% |
| Social / Contact | 5% | 15% | 15% | 25% |
| Problem / Obstacle | 15% | 10% | 10% | 15% |
| Hazard | 20% | 10% | 10% | 10% |
| Commerce | 0% | 10% | 5% | 5% |
| Spectacle | 10% | 25% | 5% | 5% |
| Rumor / Intel | 10% | 10% | 25% | 10% |
| Empty | 15% | 5% | 10% | 10% |

> Carousel is spectacle-heavy — the public event IS the adventure. Stakeout is Rumor/Intel heavy — you're watching and learning. Crucible is Social-heavy — you're trapped with people. Rundown has 0% Commerce — you're running.

### Competitive Posture

| Branch | Double Cross | Tightrope | Ratchet | Fracture |
|:---|:---:|:---:|:---:|:---:|
| Enemy / Faction | 20% | 15% | 25% | 20% |
| Social / Contact | 15% | 30% | 10% | 15% |
| Problem / Obstacle | 15% | 5% | 15% | 15% |
| Hazard | 10% | 5% | 15% | 10% |
| Commerce | 10% | 15% | 5% | 10% |
| Spectacle | 5% | 10% | 5% | 5% |
| Rumor / Intel | 15% | 15% | 10% | 15% |
| Empty | 10% | 5% | 15% | 10% |

> Tightrope is 30% Social — the entire adventure is talking to faction representatives. Ratchet is heavy on Enemy and Hazard because things are closing in.

## Tables Inventory: What Exists vs. What Needs Building

| Table | Status | Size | Notes |
|:------|:-------|:----:|:------|
| Urban Enemy Category | ✅ Exists | d200 | Wire directly into generator |
| Urban Enemy Composition | ✅ Exists | d20 | Wire directly |
| Urban Contact | ✅ Exists | d200 | Wire directly |
| Urban Problem | ✅ Exists | d200 | Wire directly |
| Urban Hazard | ✅ Exists | d100 | Wire directly |
| Urban Foreground Event | ✅ Exists | Review | May merge into Spectacle |
| Urban Art | ✅ Exists | Review | May merge into Spectacle |
| Urban Empty Result | ✅ Exists | d20 | Consider expanding to d50 |
| Urban Sensory | ✅ Exists | d50 | Used for dressing, not encounter branch |
| Urban Set Dressing | ✅ Exists | d100 | Used for dressing, not encounter branch |
| Urban Commerce | 🔨 NEW | d100 | Needs building. Spice Curve. |
| Urban Rumor / Intel | 🔨 NEW | d100 | Needs building. Spice Curve. |
| Urban Spectacle | 🔨 NEW or merged | d100 | Merge Foreground Event + Art, or build fresh |
| Urban Narrative Device | 🔨 NEW or adapted | d36 | Adapt from Dungeon Narrative Device or build urban version |
| Urban Tactical Setup | 🔨 NEW | TBD | Urban-native combat terrain/positioning — replaces Dungeon Tactical Terrain |
| Catalyst | 🔨 NEW | d200 | Showcase table. Spice Curve. |
| Urban Threat Identity T1 | 🔨 NEW | d30 | Creature pools: Low/Mid/Boss with composition scale |
| Urban Threat Identity T2 | 🔨 NEW | d50 | Creature pools: Low/Mid/Boss with composition scale |

---

# VIII. Heat System

## Design Principle

Heat is a **play-time mechanic**, not a generation-time mechanic. The generator can't predict what the party will do, so it presents the Heat rules and flags likely pressure points rather than pre-assigning Heat states.

## Heat Rules (ported from Urban Set Up v1.0)

| Heat Level | State | Urban Behavior |
|:----------:|:------|:---------------|
| 0 | Cold | Normal activity. No adjustments. |
| 1 | Warm | Word is spreading. Locals watch more closely; enemies reposition cautiously. |
| 2 | Hot | Patrols, rivals, or locals are actively looking. +1 creature to future combat. Defensive repositioning. |
| 3 | Burning | The block is mobilized. Boss fortifies, relocates, or prepares an ambush. Reinforcement roll. |

**Heat Increases When:** Combat 3+ rounds, loud magic, enemy escapes, alarm triggered, public disturbance. → Heat +1 (max 3).

**Heat 3 Reinforcements:** Roll on Urban Reinforcements table (exists).

**Heat Resets When:** Long rest outside urban area, area cleared, narrative justification.

## Generator Integration

- **Index note** includes the full Heat rules block (above).
- **Segment notes** with Enemy/Faction encounters are flagged: `⚠ Likely Heat +1`
- **Topology-aware Heat guidance** — one-line note per topology:

| Topology | Heat Guidance |
|:---------|:-------------|
| Trail | Heat represents exposure — the target learns you're asking questions. |
| Web | Side leads don't generate Heat; core leads do. |
| Mosaic | Heat is fragmented — different fragments may have independent Heat tracks. |
| Shell Game | Heat means the target knows you're following. They move faster. |
| Turf | Heat accumulates in the district. The Hub becomes less safe. |
| Layer Cake | Each layer has its own Heat awareness. Surface Heat doesn't reach Inner. |
| Stronghold | Heat is expected. Starts at 1. Reaching 3 triggers lockdown. |
| Gauntlet | Starts at Heat 2. Every segment risks +1. This is a pressure cooker. |
| Rundown | Heat is the default state. You're already Burning — Heat 3 from the start. |
| Carousel | Heat = attention during a public event. Burning means the crowd turns on you. |
| Stakeout | Heat = blown cover. Heat 1 means the target is suspicious. Heat 3, they know. |
| Crucible | Heat = tension between trapped NPCs. Burning means someone snaps. |
| Double Cross | Heat on one path doesn't affect the other — unless the paths converge. |
| Tightrope | Heat is faction-specific. Angering one faction raises Heat with them only. |
| Ratchet | Heat only goes up. No resets. This is the whole point of the topology. |
| Fracture | Each thread tracks Heat independently. Reunion combines the higher value. |

---

# IX. Finale Procedure

## Design Principle

Not every urban adventure ends in a fight. The finale has **three tracks**, and the topology determines which track fires by default. The DM can always override.

## Finale Tracks

### Combat Finale
Boss encounter, tactical setup, the big fight.
- **Tables:** Urban Boss (d100, exists) + Threat Identity creature pool + Urban Tactical Setup (new) + Revelation + Exit State
- **Default for:** Stronghold, Gauntlet, Rundown, Ratchet

### Social Finale
Confrontation, negotiation, ultimatum — the big moment played through dialogue.
- **Tables:** Key NPC (from Urban Contact d200) + Narrative Device (d36, adapt or build) + Revelation + Exit State
- **Default for:** Tightrope, Crucible, Stakeout, Double Cross

### Discovery Finale
The truth is revealed, the pattern clicks, the hidden thing is found. May or may not lead to combat.
- **Tables:** Revelation (primary) + Catalyst Callback (the spark from Setup, recontextualized) + Exit State
- **Default for:** Trail, Web, Mosaic, Shell Game, Layer Cake

### Flexible Topologies
These could land on any track depending on what the segments produced:
- **Turf** — depends on what the excursions revealed
- **Carousel** — depends on what happened during the event
- **Fracture** — depends on what the two threads produced

## Shared Finale Tables

**Revelation** — "What did we learn?" The narrative payoff. Adapt from Dungeon Revelation or build urban-native version. Recommend d20 with Spice Curve.

**Exit State** — "What happens next?" The hook that leads to the next adventure or wraps the one-shot. Adapt from Dungeon Exit State or build urban-native version. Recommend d12.

**Catalyst Callback** — Discovery track only. The generator takes the Catalyst from Setup and presents it in the finale as a recontextualization prompt: *"The [catalyst] was actually [revelation]. What does this change?"* Not a separate table — a prose template that uses the Setup rolls.

---

# X. Loot & Rewards

## Design Principle

Urban adventures don't use a dungeon-style loot budget. Dungeons are treasure hoards in sealed rooms. Cities are economies. **The reward for an urban adventure is access, not gold.**

## Four Urban Currencies

### Coin
Still exists, but contextual. You get paid for the job, find stolen goods, claim the bounty. Scaled to tier like dungeon coin. Awarded at the **finale** and optionally one mid-adventure stash — not distributed per-segment.

### Favor
An NPC or faction owes you. The most urban reward there is. *"The thieves' guild remembers what you did."* A favor is a future resource the DM tracks — a hook, not a number.

### Access
You gain entry to something previously closed. A guild membership, a noble's trust, a restricted district, a secret passage, a black market connection. Loot that opens future adventures.

### Intel
You learn something valuable. A secret, a name, a map, a weakness. The seed of the next session.

## Reward by Finale Track

Each finale track includes a **Reward Line** — a short d8 table suggesting what the adventure yields.

**Combat Finale Rewards (d8):**

| d8 | Reward |
|:--:|:-------|
| 1–2 | Coin — bounty or salvage from the defeated threat |
| 3–4 | Coin + Favor — someone is grateful the threat is gone |
| 5–6 | Favor + Access — the faction you helped opens a door |
| 7 | Access + Intel — the boss's lair contains something unexpected |
| 8 | Intel — the boss was working for someone bigger (campaign hook) |

**Social Finale Rewards (d8):**

| d8 | Reward |
|:--:|:-------|
| 1–2 | Favor — the NPC you helped owes you one |
| 3–4 | Favor + Access — your reputation grants entry somewhere new |
| 5–6 | Access + Intel — the negotiation reveals a hidden truth |
| 7 | Intel + Coin — information plus payment for services |
| 8 | All four — the social victory cascades into multiple rewards |

**Discovery Finale Rewards (d8):**

| d8 | Reward |
|:--:|:-------|
| 1–2 | Intel — the discovery itself is the reward |
| 3–4 | Intel + Access — the truth opens a previously hidden path |
| 5–6 | Intel + Favor — someone wants to reward you for what you found |
| 7 | Access + Coin — the discovery leads to something valuable |
| 8 | Intel (campaign-tier) — what you found changes everything |

> **Magic items** are DM discretion, not system-generated. If the adventure warrants a magic item reward, the DM adds it manually. The generator doesn't budget magic items for urban play.

---

# XI. Output Architecture

## What Gets Generated

The generator produces three files, same atomic structure as the dungeon generator, but with urban-native templates:

### 1. Segment Notes (`S01 — Label.md`, `S02 — Label.md`, etc.)
One note per segment. Each is a self-contained reference card the DM reads during play.

**Shared Core (all segments):**
- Location type + description
- Sensory detail
- Transition to next segment(s) (from nested sub-table)
- Encounter (typed by branch)
- Heat flag (if Enemy encounter: `⚠ Likely Heat +1`)

**Topology-Specific Fields (only appear when relevant):**
- **Trail / Web / Mosaic / Shell Game:** `Intel Thread` — what information is available here and where it points
- **Tightrope:** `Faction Disposition` — which faction controls this scene, current attitude
- **Stakeout:** `Time Elapsed` — how much time passes during this incident
- **Crucible:** `NPC Tension` — what NPCs are present and what they want
- **Ratchet:** `What Closes` — what option or resource is lost after this segment
- **Carousel:** `Event Beat` — what the public event is doing during this scene
- **Gauntlet / Rundown:** `Pursuit Status` — how close the threat is

### 2. Canvas File (`AdventureName.canvas`)
Segments as linked cards, positioned by **topology-native layout** (not universal BFS left-to-right).

| Topology | Canvas Layout |
|:---------|:-------------|
| Trail, Rundown, Stakeout | Linear left-to-right (like dungeon Spine) |
| Web | Main thread horizontal, branches vertical |
| Turf, Stronghold | Hub centered, spokes radiating |
| Layer Cake | Top-to-bottom (surface at top, core at bottom) |
| Double Cross, Fracture | Parallel tracks side by side |
| Carousel | Circular arrangement |
| Gauntlet, Squeeze | Converging lines |
| Mosaic | Scattered, no clear axis (connections emerge) |
| Crucible | Tight cluster, overlapping |
| Tightrope | Faction clusters with party path threading between |
| Ratchet | Funnel shape — wide at top, narrow at bottom |
| Shell Game | Grid with highlighted "hot" node |

### 3. Index Note (`AdventureName.md`)
The single-scroll overview. Contains:

**DM Briefing** — 2–3 sentences synthesizing the Setup rolls into a coherent premise. This is the paragraph the DM reads to understand what this adventure is *about*. The dungeon generator doesn't do this. Example: *"In the rain-soaked harborfront of a port district shaped by royal authority, a warehouse fire has revealed something that should have stayed hidden. Smugglers who work the docks are mobilizing to contain the damage. The party is drawn in when they witness the aftermath."*

**Setup Table** — compact reference block with all Setup Identity results.

**Topology Diagram** — Mermaid flowchart showing segment connections and labels.

**Heat Rules** — full Heat block with topology-specific guidance note.

**Segment Roster** — table with segment number, label, location type, encounter type, connections.

**Finale Summary** — track type (Combat/Social/Discovery), key elements, reward line.

**Full Content Scan** — all segment notes concatenated for single-scroll reading.

---

# XII. What's Decided vs. What's Deferred

## Decided ✓
- 16 topology types organized by player posture (d20 table, 17–20 are reroll/combine)
- Generation cascade: Topology → Graph → Segments → Transitions → Content
- Segment types populated via sub-tables keyed to structural labels
- Transitions baked into segment type rows as nested sub-tables (standard dice)
- Transition State as optional standalone d8
- Spice Curve: weighted probability across all tables (d20 five-band, d12 four-band, d10/d8 three-band, d6 two-band, d4 flat)
- Setup Identity: 8 categories, using existing d100 tables where available; Catalyst is d200 showcase
- Encounter types: 8 branches with per-topology weight distributions
- Heat system: ported from Urban Set Up v1.0, topology-aware guidance, flagged in segment notes
- Finale: 3 tracks (Combat, Social, Discovery), topology determines default track
- Loot: 4 urban currencies (Coin, Favor, Access, Intel), d8 Reward table per finale track, no per-segment budget
- All dice standard increments + d100/d200 for fat tables
- Pen-and-paper playability is a hard constraint for the simplified version

## Deferred (Implementation Phase)
- Output architecture (individual segment notes, canvas, index — same as dungeon or adapted?)
- Actual sub-table content (segment types, Setup d100/d200 entries, Commerce d100, Rumor d100, Spectacle d100)
- New tables to build: Catalyst (d200), Commerce (d100), Rumor/Intel (d100), Spectacle (d100), Urban Narrative Device (d36), Urban Tactical Setup, Urban Threat Identity T1 (d30) and T2 (d50)
- Graph builder functions for each topology (Templater implementation)
- Topology-specific DM guidance notes (improv tips per topology, integrated into output)
- Positive encounters integration (may fold into Social/Contact or Commerce branches)

---

# XII. Comparison to Dungeon Generator v4.2

| Feature | Dungeon v4.2 | Urban v3.0 (Planned) |
|:--------|:-------------|:---------------------|
| Topology types | 12 (spatial) | 16 (adventure-pattern) |
| Topology axis | Physical space | Narrative flow |
| Node identity | Area Type (generic) | Segment Type (topology-aware sub-tables) |
| Connections | Door Type × Door State | Transition baked into segment row + optional State d8 |
| Pressure mechanic | Alert Level (0–3) | Heat Level (0–3), topology-aware guidance |
| Encounter types | 7 branches | 8 branches + per-topology weight distributions |
| Finale | Single track (boss fight) | 3 tracks (Combat / Social / Discovery) |
| Loot | Tier-aware magic item budget by depth | 4 currencies (Coin / Favor / Access / Intel), d8 per track |
| Generation | Templater one-click | Templater one-click (planned) + pen-and-paper capable |
| Output | Room notes + Canvas + Index | Segment notes + Canvas + Index (planned) |
| Showcase table | Myth Seeds (d12) | Catalyst (d200) |

---

# XIII. Implementation Roadmap — v1.0 → v3.0

## v1.0 — Proof of Concept *(build now)*

**Goal:** A working Templater generator that produces playable urban adventure sketches using existing tables. Proves the architecture works.

### v1.0 Scope

**Topologies (4 of 16):**
- The Trail (Spine) — simplest linear structure
- The Web (Branch) — the most common urban adventure shape
- The Turf (Hub) — tests hub-and-spoke generation
- The Layer Cake (Onion) — tests depth-based progression

**Graph Builders:**
- [x] `buildTrailGraph(n)` — linear chain + finale
- [x] `buildWebGraph(n)` — main thread + branch nodes + finale
- [x] `buildTurfGraph(n)` — hub + spokes + finale
- [x] `buildLayerCakeGraph(n)` — onion rings with gateway + finale
- [x] `resolveTopology()` with fallback chain for undersized adventures
- [x] BFS ordering + room numbering (port from dungeon)

**Setup Identity (8 rolls using existing tables):**
- [x] Urban Type (d100)
- [x] Urban Origin (d100 — Power Structure)
- [x] Urban Environment Skin (d100)
- [x] Urban Art Motif (d20)
- [x] Urban Art Motif Modifier (d6)
- [x] Urban Threat Profile (d100)
- [x] Catalyst (d200 — built in v1.5)
- [x] Urban Rest Complications (d20)

**Encounter System:**
- [x] Per-topology weighted encounter type picker (8 branches, weights from design doc)
- [x] Enemy/Faction branch: Urban Enemy Category (d200) + Urban Enemy Composition (d20)
- [x] Social/Contact branch: Urban Contact (d200)
- [x] Problem/Obstacle branch: Urban Problem (d200)
- [x] Hazard branch: Urban Hazard (d100)
- [x] Commerce branch: Urban Commerce (d100 — built in v1.5)
- [x] Spectacle branch: Urban Spectacle (d100 — built in v1.5)
- [x] Rumor/Intel branch: Urban Rumor Intel (d100 — built in v1.5)
- [x] Empty branch: Urban Empty Result (d50 — expanded in v1.5)

**Segment Note Template:**
- [x] Shared core: location, sensory, encounter, dressing, transition, secret
- [x] Topology-specific fields for all 16 topologies (Intel Thread, Faction Disposition, Time Elapsed, etc.)
- [x] Heat flag on Enemy encounters
- [x] Scene Frame from d400 (v3.0)
- [x] Optional section: Feature, Active Magic (tier-aware), Interactable Object (v3.0)

**Finale (three tracks):**
- [x] Combat Finale — Boss + Tactical Setup + Revelation + Reward
- [x] Social Finale — Key NPC + Narrative Device + Revelation + Reward
- [x] Discovery Finale — Revelation + Catalyst Callback + Reward
- [x] Topology → default track mapping
- [x] Optional section: Feature, Active Magic (tier-aware), Interactable Object (v3.0)

**Output:**
- [x] Individual segment notes (`S01 — Label.md`)
- [x] Index note with: Setup table, Mermaid diagram, segment roster, Heat rules, full content scan
- [x] DM Briefing — synthesized from Setup rolls (three-paragraph prose)
- [x] Canvas file with topology-native layout

**Tables — Existing (wire in):**
- Urban Type, Urban Origin, Urban Environment Skin, Urban Art Motif, Urban Art Motif Modifier
- Urban Threat Profile, Urban Rest Complications
- Urban Enemy Category, Urban Enemy Composition, Urban Contact, Urban Problem, Urban Hazard
- Urban Empty Result, Urban Sensory, Urban Set Dressing, Urban Set Dressing Condition
- Urban Foreground Event (placeholder for Spectacle)

**Tables — Placeholder (build later):**
- Catalyst (d20 inline → d200 in v2.0)
- Commerce (→ d100 in v2.0)
- Rumor/Intel (→ d100 in v2.0)
- Spectacle (→ d100 in v2.0)
- Urban Narrative Device (→ d36 in v2.0)
- Urban Tactical Setup (→ v2.0)

---

## v1.5 — Table Expansion

**Goal:** Build the new tables that v1.0 uses placeholders for. No code changes — just content.

- [x] **Catalyst (d200)** — the showcase table. Full Spice Curve. "Why is this adventure happening right now?"
- [x] **Urban Commerce (d100)** — trade, swindles, rare finds, economic pressure. Spice Curve.
- [x] **Urban Rumor / Intel (d100)** — information gained through urban channels. Spice Curve.
- [x] **Urban Spectacle (d100)** — public events, performances, accidents, celebrations. Merge/replace Foreground Event + Art tables. Spice Curve.
- [x] **Urban Narrative Device (d36)** — adapt from Dungeon Narrative Device for urban social encounters.
- [x] **Urban Tactical Setup (d20)** — urban-native combat terrain/positioning. Replaces Dungeon Tactical Terrain.
- [x] **Urban Threat Identity T1 (d30)** — creature pools (Low/Mid/Boss) for tier 1 urban play.
- [x] **Urban Threat Identity T2 (d50)** — creature pools for tier 2.
- [x] **Urban Revelation (d20)** — replaces adapted Dungeon Revelation.
- [x] **Urban Exit State (d12)** — replaces adapted Dungeon Exit State.
- [x] **Urban Boss (d100)** — boss archetypes for Combat Finale track.
- [x] Expand Urban Empty Result from d20 → d50

---

## v2.0 — Full Topology + Topology-Aware Templates

**Goal:** All 16 topologies working with topology-native output.

### Topologies (add remaining 12):
- [x] The Mosaic (Emergent Graph)
- [x] The Shell Game (Shifting Nodes)
- [x] The Stronghold (Fortified Hub)
- [x] The Gauntlet (Inverted Convergence)
- [x] The Rundown (Cascade)
- [x] The Carousel (Loop + Tail)
- [x] The Stakeout (Timeline Spine)
- [x] The Crucible (Dense Cluster)
- [x] The Double Cross (Loop)
- [x] The Tightrope (Weighted Mesh)
- [x] The Ratchet (Contracting Graph)
- [x] The Fracture (Figure-8)

### Topology-Aware Segment Templates:
- [x] `Intel Thread` field for investigative topologies (Trail, Web, Mosaic, Shell Game)
- [x] `Faction Disposition` field for Tightrope
- [x] `Time Elapsed` field for Stakeout
- [x] `NPC Tension` field for Crucible
- [x] `What Closes` field for Ratchet
- [x] `Event Beat` field for Carousel
- [x] `Pursuit Status` field for Gauntlet, Rundown
- [x] `Defenses` field for Stronghold
- [x] `Path Context` field for Double Cross
- [x] `Thread Context` field for Fracture

### Topology-Native Canvas Layouts:
- [x] Linear (Trail, Rundown, Stakeout, Shell Game)
- [x] Branch (Web)
- [x] Hub (Turf, Crucible)
- [x] Top-to-bottom (Layer Cake, Stronghold)
- [x] Parallel tracks (Double Cross, Fracture)
- [x] Circular (Carousel)
- [x] Converging (Gauntlet)
- [x] Scattered (Mosaic)
- [x] Funnel (Ratchet)
- [x] Weighted mesh (Tightrope)

### Three Finale Tracks:
- [x] Combat Finale — Boss + Tactical Setup + Revelation + Reward
- [x] Social Finale — Key NPC + Narrative Device + Revelation + Reward
- [x] Discovery Finale — Revelation + Catalyst Callback + Reward
- [x] Topology → default track mapping

### Full Encounter System:
- [x] Wire in all new tables from v1.5 (replacing placeholders)
- [x] Per-topology encounter weights (all 16)
- [x] Tier selection (T1/T2) with Threat Identity creature pools

---

## v2.5 — Segment Type Sub-Tables

**Goal:** Topology-position-aware segment generation. The cascade works fully: Topology → Graph Labels → Segment Types → Transitions.

### Segment Type Sub-Tables (18 unique tables, consolidated with reuse):
- [x] Shared: Opening (d8) — also serves Arrival, Start, Setup, Introduction, Containment
- [x] Investigative: Lead (d8) — also serves Core Lead
- [x] Investigative: Side Lead (d6)
- [x] Investigative: Fragment (d8) — Mosaic vignettes
- [x] Investigative: Cold Scene (d6) / Warm Scene (d6) / Hot Scene (d4) — Shell Game temperature
- [x] Navigational: Hub (d8)
- [x] Navigational: Excursion (d8)
- [x] Navigational: Surface (d8)
- [x] Navigational: Threshold (d4)
- [x] Navigational: Inner (d6) — also serves Core, Inner Ring
- [x] Navigational: Approach (d6) — also serves Outer Ring
- [x] Navigational: Waypoint (d8) — Gauntlet survival scenes
- [x] Reactive: Escalation (d6) — also serves Spark, Pressure
- [x] Reactive: Event Scene (d8) — also serves Watch, Incident
- [x] Competitive: Path (d6) — also serves Path A/B, Thread A/B, Open
- [x] Competitive: Faction Scene (d12) — also serves Narrowing
- [x] Finale variants handled by three finale tracks (Combat/Social/Discovery) — not a sub-table

### Transition Sub-Tables (nested in segment type rows):
- [x] Each segment type row includes a d4 or d6 transition column
- [x] Transitions contextually plausible for each segment type (no rooftop crossings between basements)
- [x] Generator reads transition column via rollSubTable() and displays in segment notes

---

## v3.0 — Feature Complete

**Goal:** Feature complete. Automated version is refined and production-ready.

### Automated Polish (v2.6):
- [x] Topology fallback chains finalized — posture-aware routing, min input bumped to 2, Stronghold→Trail fix
- [x] Heat starting states per topology — HEAT_START map, displayed above Heat table in index note
- [x] DM Briefing prose quality — three-paragraph structure (Scene/Situation/Texture)
- [x] Positive encounters integration — Urban Boon d20 table, 30% chance on Social / 25% on Commerce
- [x] Myth Seeds / Witness Distortion adaptation — Urban Street Distortion d12 table

### v3.0 Features:
- [x] Scene Frame d400 — unified table replacing four category-routed d100s. No label-to-category mapping, no routing logic. One roll per segment.
- [x] Optional section — Feature (Urban Feature d100), Active Magic (tier-aware), Interactable Object (Urban Interactable Object d300) on every segment and finale
- [x] Tier-aware Active Magic — T1 rolls Urban Magic Effect Lv 1-5, T2 rolls Urban Magic Effect Lv 6-10 (new table)
- [x] Urban Segment Path d300 — replaced d20 transit table with 300 diverse scene-based locations
- [x] Old scene frame category tables superseded (Street, Open, Vertical, Threshold d100s → single d400)
- [x] Old generators archived (_Archive folder)

### Deferred:
- [ ] Playtest feedback integration — adjust encounter weights, table entries, segment templates (no play data yet)

---

## v3.1 — Prep Roster

**Goal:** The generated index note becomes a functional prep document, not just a content scan. Every adventure produces a structured prep checklist the DM can work through before the session.

- [x] **NPC Roster** — per-occurrence table of all Social encounter contacts and the Social finale Key NPC. Columns: #, Seg, Contact Type, Hook, Name (blank). Solves the "surprise NPC, no name" problem at the table.
- [x] **Creature Roster** — all stat blocks needed for the adventure, grouped by creature name. Shows CR Slot, all segments where it appears, and a blank Count column. Enemy (Faction Clash) and Enemy (Complication) are excluded — those are narrative framing, not stat blocks.
- [x] **Battlemap Prep List** — every segment with a full scene frame (Enemy, Hazard, Problem) plus the Finale. Columns: Seg, Location, Scene Frame name, Dims. DM can tick off which maps they've sketched or have ready.
- [x] **Architecture** — `buildEncounter()` returns `npcData`/`creatureData`; `generateFinaleNote()` returns `{ content, npcData, creatureData }`; encounter hoisted from `generateSegmentNote()` to main loop for collection.

---

## v3.2 — DM Prep Tools

**Goal:** Reduce the gap between "sketch generated" and "confident to run it." Targets the authorial pass the DM does after generation and the real-time gaps they hit during play.

### Encounter Type Breakdown:
- [ ] **Encounter Mix Summary** — single line in the index note: `Enemy ×3 · Social ×2 · Boon ×1 · Problem ×1 · Rumor ×2 · Empty ×1`. Tells the DM the adventure's flavor at a glance before reading any segment. Data is already being collected in the loop — trivially cheap to render.
- [ ] Add to **Setup table** (or as a line below the Segment Roster header) for instant visibility.

### Name Bank:
- [ ] **Urban NPC Names table** — 8–10 thematic names generated per adventure, seeded by Environment Skin. Used for any NPC that appears unexpectedly: contacts the DM didn't script, bystanders who become important, merchants in Commerce encounters.
- [ ] **Content work required:** one names pool per skin family (e.g. flooded district → tidal/maritime names; crumbling colosseum district → gladiatorial/imperial names). Skin families can be grouped — probably 6–8 pools covers all 30+ skins.
- [ ] Names rendered as a **Name Bank** block in the index note, next to the NPC Roster. DM crosses them off as used.

### Boon & Reward Summary:
- [ ] **Consolidated reward view** — pull all Boon benefits, Commerce encounter results (the ones that upgraded to Boon), and the Finale reward into a single block. DM can see the full "what they might walk away with" at a glance and prep those moments properly.
- [ ] Consider: list as a simple bullet block under the Prep Roster, not a separate table. Rewards are narrative, not structured.

### Relationship Web (deferred — needs design):
- [ ] For social-heavy topologies (Tightrope, Crucible, Trail), note when two NPC contacts share a hook theme — implied faction connection the DM can lean into.
- [ ] Probably not automated; may be better as a DM prompt ("these contacts share a hook — are they connected?") than computed.
- [ ] Deferred until playtest data shows whether it's actually needed or whether the NPC Roster already handles it.

---

## v3.3 — Play-Informed Calibration

**Goal:** The generator learns from actual sessions. Every number, weight, and entry that was set by intuition gets validated or adjusted against real play data. No changes ship until there's evidence.

### Encounter Weight Tuning:
- [ ] Per-topology encounter weights reviewed against session logs — are combat-heavy topologies (Gauntlet, Stronghold) generating too many enemies for the party to push through in one session?
- [ ] Boon upgrade rates (30% Social, 25% Commerce) — do they feel like windfalls or noise? Adjust if players aren't registering them.
- [ ] Empty encounter rate — does it read as breathing room or dead air? May want topology-specific empty floors (e.g. Rundown should never go empty).

### Spice Curve Calibration:
- [ ] Volatile/Mythic entries (d20 18–20 band) — are they campaign-defining or session-breaking? Flag any entries that consistently derail rather than elevate.
- [ ] Strange band (15–17) — target: DM leans forward. If these are getting skipped at the table, the entries need to be more *usable-strange* rather than *confusing-strange*.
- [ ] Review Urban Magic Effect Lv 6-10 — T2 table is untested. Particularly the Rare/Dangerous (81–95) and Tier 3 Teasers (96–100) bands.

### Segment & Heat Calibration:
- [ ] Segment template refinements — are location descriptions specific enough to spark imagination, or generic enough to require constant DM interpretation?
- [ ] Transition text review — are transitions reading as literal movement instructions or evocative scene cuts?
- [ ] Heat calibration — does Heat 3 (Burning) land with weight? Is "+1 creature to future combat" at Heat 2 a meaningful pressure, or does it go unnoticed?
- [ ] Topology-specific heat guidance — some topologies (Ratchet) are heat-defined; others (Mosaic) are heat-agnostic. Verify the guidance text matches actual play feel.

---

## v3.4 — Campaign Integration

**Goal:** The generator works for ongoing campaigns, not just isolated one-shots. Adventures leave traces. NPCs return. Districts have memory.

### Campaign Thread Hooks:
- [ ] Each generated adventure produces 1–2 **loose end hooks** — unresolved threads that could seed a future adventure. Generated from the encounter content: a Social contact who mentioned something off-script, a Problem that wasn't fully solved, a Rumor that pointed somewhere the party didn't go.
- [ ] Loose ends printed as a **Campaign Threads** block at the bottom of the index note. DM picks up or discards.
- [ ] Design question: fully generated (table-driven), DM-prompted, or hybrid? Lean hybrid — generate the *seed*, let the DM write the *fruit*.

### District Memory:
- [ ] Lightweight **District State** tracking — after an adventure runs, the DM records outcomes: which faction was antagonized, which NPC survived or died, what the finale reward was. Stored as a simple block in the index note.
- [ ] A second adventure in the same district can reference the district state: the contact from the first run recognizes the party, the faction that was burned is hostile, the intel from the first finale is now background knowledge.
- [ ] Not automated — DM-maintained. Generator outputs a **District State** template block; DM fills it after the session.

### Returning NPCs:
- [ ] Flag NPC Roster entries that have strong hooks as **potential recurrents** — a contact with a specific, personal hook is more likely to reappear than one with a generic transactional hook.
- [ ] Simple tagging: mark 1 NPC per adventure as `⟳ Recurrent candidate` with a brief reason. DM decides if it sticks.
- [ ] Cross-adventure NPC tracking lives in the District Memory block, not the generator.

### Multi-Adventure Arc Sketching:
- [ ] Exploratory: can the generator produce a **2–3 adventure arc outline** from a single setup roll? Topology sequence → escalating threat → resolution arc.
- [ ] Scope concern: this may be too large for v3.4 and belong in a separate "Campaign Procedure" tool. Flag for architectural review before committing.

---

## v3.5 — Pen-and-Paper Derivation

**Goal:** Every system in the generator translates to physical dice and printed tables. A DM with no computer and a stack of index cards can run the full procedure. This is the capstone of the 3.x branch.

### Dice Flattening:
- [ ] Encounter weights → single universal **d20 encounter table** (one per topology family, not all 16 — group by posture: Investigative, Navigational, Reactive, Competitive). Add "adjust to taste" column for DM customization.
- [ ] Topology selection → **d20 topology table** (already designed — wire in).
- [ ] Threat Identity → **d6 threat family × d10 specific threat** (nested roll, avoids d50/d30 custom dice).
- [ ] Scene Frame → **d4 spatial type × d100 specific frame** (recovers the four-category structure in physical form, without needing a d400).

### Print-Friendly Procedure Sheet:
- [ ] One-page **Urban Procedure Sheet**: Setup → Topology → Segment Type → Encounter → Finale. DM works top to bottom, fills in blanks.
- [ ] All sub-tables formatted for physical dice (d4/d6/d8/d10/d12/d20/d100) — no d400, no d300, no d50.
- [ ] Segment type sub-tables condensed to one-column format (roll + result, no transition column — that becomes a separate d6 roll).
- [ ] Heat track and Encounter Weights printed as sidebars on the procedure sheet.

### Physical Reference Materials:
- [ ] **Topology Cheat Sheet** — one page, all 16 topologies. Graph shape diagram, segment label sequence, default encounter posture, heat guidance, default finale. Print and laminate.
- [ ] **Quick Reference Card** — wallet-size or A5. Encounter branches + weights summary, Heat states, Spice Curve by die size. Everything a DM needs mid-session without opening the vault.
- [ ] **NPC Name Cards** — skin-family name pools printed on index card stock. DM draws a card when a surprise NPC appears.

### Validation:
- [ ] Dry-run the full procedure with physical dice only — no generator, no Obsidian. Verify every roll is achievable and the output is coherent.
- [ ] Compare a physical-dice run to a generated run — do they produce adventures of equivalent quality? If not, identify what the generator adds that can't be captured in print.

---

*Design document for Arcana Engine v0.25 — Urban Generator branch.*
*Current: v3.1 (released 2026-04-04) · Target: v3.5 (Pen-and-Paper Derivation)*
