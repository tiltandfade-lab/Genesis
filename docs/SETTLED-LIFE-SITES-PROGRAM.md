---
type: program-plan
created: 2026-07-26
updated: 2026-07-26
status: DRAFT — Fable-directed, drafted 2026-07-26, awaiting Adam
owner: settled-life environment coverage
authority:
  - GOLDEN-SITE-CONCEPTING-GUIDELINES.md
  - GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md
  - GOLDEN-SITES-CATALOG.md
evidence:
  - intel/marathon-spatial-mining.md
  - intel/walk-census.md
  - intel/walk-census-tally.json
  - intel/walk-census-mapping.json
  - intel/tiyl-starts.md
  - intel/tiyl-raw.json
related:
  - BUILDING-PROGRAM-TABLE-FAMILIES.md
  - URBAN-FABRIC.md
  - TAVERN-VENUE-ROUTING-BRIEF.md
  - GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md
  - URBAN-STUDY-BRIEF.md
  - MESHY-WILDERNESS-SETPIECE-QUEUE.md
---

# SETTLED-LIFE SITES PROGRAM

**Nothing in this document is ruled.** Every classification, build order, and slate entry
below is a `PROPOSED` starting position for Adam. No item here has passed step 1 of THE
SITE PIPELINE, so no item here is settled — the depth law applies in full to all of it.

## 1. Adam's directive, and what this plan is

Adam, 2026-07-26 (verbatim intent, four separate statements from the same conversation):

> "we absolutely do [need to flesh out the settled life types of environments] and we
> need a big plan for how to do that"

> "a lot of the remaining golden sites that we need to flesh out are really more about
> fleshing out STATES of golden sites, so we need to make that distinction"

> the urban building roller tables "will help flesh out how these new golden sites are
> determined and fleshed out"

> the wilderness landscape curiosities should go "in a modeling queue for our meshy sub"

This document is the first three. The fourth is
[`MESHY-WILDERNESS-SETPIECE-QUEUE.md`](MESHY-WILDERNESS-SETPIECE-QUEUE.md).

**What this plan is:** the big plan for ordinary settled life — the places the game's own
dice produce constantly and the twelve-site portfolio does not cover. It is a demand-led
program, not a wish list: every entry below is anchored to a counted result from tonight's
three intel reports, all banked at `docs/intel/`.

**What this plan is not:** it is not a proposal to grow the portfolio to thirteen, or
eighteen, numbered Golden Sites. The single most important thing this plan does is sort
new demand into the right bin *before* anyone builds anything — which is Adam's second
statement, and which the concepting guidelines' step 0.5 already half-writes.

### The evidence in one paragraph

Three independent studies, all real rolls against the built engine, all pointing the same
direction. **Urban arrivals are 33.7% unmapped** (87 of 258 rolled districts touch no
golden site) and the three unmapped buckets are the *biggest* districts on the table:
Entertainment Strip 12.79%, Harborfront 12.02%, Slums/Low Ward 8.91%
([`intel/walk-census.md`](intel/walk-census.md) §3). **Half of character starts land on a
scene no site touches** — 6 of 12 rolled TIYL openings, with the Drowned Port alone
appearing 3 times ([`intel/tiyl-starts.md`](intel/tiyl-starts.md) §3.2). **Domestic
interior is the single most-implied place in the whole life chain** — birthplace was "At
home" in 7 of 12 rolls (58%), and every row of the childhood-home table is a domestic
interior — and it is not one of the twelve, named or unnamed (§3.1). And in the 2026-07-07
marathon, the DM's three biggest spatial inventions were **the home settlement, a
permanent poor-quarter warren, and a well-house mini-dungeon**, none of which any golden
site covers ([`intel/marathon-spatial-mining.md`](intel/marathon-spatial-mining.md) §4).

Wilderness is a different problem with a different answer: 67.2% of wilderness arrivals
(362 of 539) are landscape curiosities — single objects, monuments, wrecks, oddities —
across 166 distinct unmapped values. That is a **modeling** shortfall, not a site
shortfall, and it leaves this document for the Meshy queue.

## 2. The noun/state distinction, formalized

### 2.1 The operating rule (PROPOSED)

> **A numbered Golden Site is a host program — a noun. A state is a transform over a host
> — a verb applied to a noun. New settled-life demand gets a number only when it names a
> distinct operating model that no existing host provides.**

This is not new law; it is the law the system already runs on, written down where planning
sessions can reach it. The ontology contract already classifies the portfolio by proof
role (`GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md` §6), and the catalog's own
vernacular-matrix reading is blunt about it: **sites 3, 8, 9, 11, and 12 are conditions or
relationships over a host, not independent structural nouns** — "any + condition", "full
host kit", "full site-1 kit"
([`intel/walk-census.md`](intel/walk-census.md) §3, reading `STRUCTURE-KIT-CATALOG.md`'s
matrix). Site 3 is *dormant/abandoned*. Site 8 is *layered control*. Sites 9 and 11 are
scale and relationship stress cases. Site 12 is a substrate case.

So of twelve numbers, only seven — 1, 2, 4, 5, 6, 7, 10 — are host programs. The other
five are the game's transform and stress vocabulary wearing site numbers.

The concepting guidelines' **step 0.5** already draws the full distinction (host program /
cross-host transform / scale-relationship case / substrate case / ordinary venue fixture)
and already carries the two warnings that matter here, verbatim:

> Do not create a new geometry generator merely because a story state is visually rich.
> […] Do not create a new numbered Golden Site merely because a common venue—such as a
> tavern—deserves a retained proof.

This program adopts step 0.5 as its gate. Every slate entry in §3 is classified through it
before it is described.

### 2.2 PROPOSED catalog language

Adam's second statement is a request to make the distinction visible in the catalog
itself. Proposed, not ruled — this is a documentation change with no build consequence:

1. In `GOLDEN-SITES-CATALOG.md`'s "Portfolio roles, not twelve runtime kinds," add one
   sentence naming the count plainly: *seven of the twelve numbers are host programs;
   five are transforms or stress cases.* The section already lists which; it does not yet
   say that the split is 7/5, which is the fact planners keep re-deriving.
2. In the **status-gate table**, add a `role` column carrying the ontology §6 value
   (`host` / `transform` / `scale` / `substrate`). Today a reader sees `3/8/9/11/12 —
   OPEN across every gate` and reasonably concludes five sites are un-built. Some of that
   OPEN is un-built *host* work; some is un-built *transform* work, which is a different
   kind of job with a different cost.
3. State the corollary once: **a transform never earns its own geometry generator, and a
   host program never earns a second number for being in an unusual state.** A flooded
   port is the port host plus the flooding transform. It is not a flood site.

### 2.3 The three bins

Any new settled-life demand sorts into exactly one of these. The bin decides the cost, the
owner, and the pipeline.

| bin | what it means | who owns it | what it costs |
|---|---|---|---|
| **(a) new host program** | a distinct operating model — roles, workflows, services, capacities, property flows, failure modes — that no existing host provides | the Golden portfolio (a new number, or an unnumbered host family) | full SITE PIPELINE: research → determination → listing → options → stretch → scene promotion → congruent brief, then a working spec |
| **(b) venue fixture inside an existing host** | a common program the story engine requests often, which an existing family chassis can already carry | the shared venue compiler; a retained **Golden Venue fixture** where frequency justifies it (`VENUE-TAVERN-01` is the first) | one program row + one arrangement table + a retained proof — no new geometry generator |
| **(c) transform / state** | a cross-host change that leaves the host's identity intact: dormant, layered control, flooding, occupation, damage, repair, repurposing, breach | the `TransformStack` in the ontology contract | a delta set — claimant profiles, access/schedule/service deltas, tells, triggers — proved on **at least three unlike hosts** with no host-specific branch |

Bin (c) has a hard tell that separates it from bin (a): **ask what persists when the state
ends.** If the place goes back to being itself, it was a state. A drained port is a port.
An emptied prison is a prison. A camp that never leaves is not a camp any more — which is
exactly the argument in §3.4.

## 3. The settled-life slate

Seven entries. Five were named in the directive; two (3.6, 3.7) are added because the
evidence demands them and leaving them out would understate the program.

Each entry carries: the functional promise (guidelines step 1), the step-0.5
classification **with reasoning**, the counted evidence, and the existing work it builds on
so that nothing here is invented next to something that already exists.

---

### 3.1 Domestic / lodging interior family — home, inn room, flophouse

**Functional promise.** This is the place the character came from and the place the
character sleeps: a room with a door that closes, a hearth or its absence, someone else's
belongings, and a reason to be inside it rather than out. Playing here promises intimacy
and exposure at once — the smallest number of routes of any place in the game, so every
approach and every escape is legible; a household's property and its people are in the
same room; and the social register is *guest, tenant, intruder, or family*, never
*customer*. It must remain recognizable from a mansion to a room in a poor quarter to a
rented bed above a taproom, because the game's own dice produce all three.

**Step-0.5 classification (PROPOSED): (a) new host program — habitation — expressed at the
ordinary and low end.** The reasoning, in three steps. First, the ontology's own host-
program list names **habitation** outright (§2, `HostProgram` row: "custody, worship,
extraction, hospitality, market exchange, route service, **habitation**, predation") and
no portfolio member proves it — Site 10's proof is "public frontage, aggregation, cold
population, urban continuity," which is a district's exterior, not a household's interior.
Second, the building-program families *do* have a household family, `BF-HOUSEHOLD-ESTATE`,
but it contains exactly one program: **Manor**, whose minimum invariants are an estate's
(controlled arrival, steward or bailiff, estate records, service circulation). A one-room
dwelling satisfies none of those and is not a degraded Manor. Third, the **inn room** half
is not the same bin: lodging is hospitality, `BF-PUBLIC-SERVICE` already names Tavern, and
`VENUE-TAVERN-01` is already the required first Golden Venue fixture. So this entry splits
cleanly — **the household is bin (a); the rented room is bin (b) riding the hospitality
venue.** That split is itself worth proving, because it is the cheapest available test of
whether the venue path and the host path can sit next to each other.

**Evidence.** `intel/tiyl-starts.md` §3.1: birthplace "At home" in **7 of 12** rolls
(58%); the childhood-home results across the batch were mansion, large house ×2, small
house ×2, rundown shack ×4, a room in a poor quarter, and on the streets — *every one a
domestic register, and a six-rung wealth ladder already sitting in the dice.* §3.1's own
conclusion: "The single most common PLACE the whole chain implies, across both halves, is
an ordinary home — and it is the one register the entry triplet's own vocabulary never
stages as the actual opening scene." §3.2 names it the headline gap outright. The one
explicitly interior opening in the batch (`eFoot` = "a room already paid for," Start 5) is
the lodging half. `intel/walk-census.md` §3: no urban district maps to housing — the
`urban-type` table has ten rows and not one of them is residential, which is its own
finding.

**Builds on.** `BF-HOUSEHOLD-ESTATE` and the Manor authoring pair (`BUILDING-PROGRAM-
TABLE-FAMILIES.md` §5, §7 Proof Pair A) — the dwelling family is the same family's low
end, so the Manor proof teaches it. `URBAN-FABRIC.md` §1's typed building roller and
`data/building-kits.js`. Site 2's **permanence ladder** as the ladder *pattern* (rungs, a
structural distinction that survives occupancy change) — not its content. `TAVERN-VENUE-
ROUTING-BRIEF.md` for the lodging half.

---

### 3.2 Port / harborfront

**Functional promise.** The edge where the land's rules stop. A working waterfront promises
a place where goods, people, and trouble arrive on someone else's schedule and leave the
same way; where the ground itself changes height twice a day; where the most valuable
things in the settlement sit in the open under a tarp with one bored guard; and where
every plan has a fourth route nobody controls — the water. Playing here should feel like
the town's front door left open. It must remain recognizable from a single mooring post at
a river ford to a quarantine harbour with forty days of anchored ships.

**Step-0.5 classification (PROPOSED): (a) new host program — waterside route service and
cargo custody.** The reasoning. Site 10 is the nearest existing host and it does not fit:
its proof is aggregation and public frontage, and a quay's operating model is
*throughput* — vessel arrival, tidal working surface, loading gear, cargo custody and its
handoffs, customs or quarantine authority, and a schedule owned by weather and tide rather
than by the settlement. Site 2 Camp/Service owns route service, but its LOCKED capsule is
"surface-anchored, no foundations… beside the route, never astride it," and a quay is the
exact inverse: it is a foundation driven into water, and it *is* the route's terminus. The
building-program families already recognise half of this — `BF-LOGISTICS` names
**Warehouse** and **Dock-House** — which is the tell that the *buildings* are solved and
the *water edge* is not. That gap is site-grade, not table-grade (see §4).

**Evidence.** `intel/walk-census.md` §3: **Harborfront 31/258 = 12.02% of urban arrivals,
unmapped** — the second-largest urban district and the second-largest unmapped bucket.
`intel/tiyl-starts.md` §3.1: **The Drowned Port is the single most-rolled `bornWhere` in
the batch, 3 of 12 starts**, and §3.2 marks it a flat gap: "no golden site is a working
waterfront/port town." The hometown rolls in the same batch add The Quarantine Port, Old
Oak Wharf, Fishgut Alley, Deadseason Port, and The Cobbled Tannery — five more waterside
settlements in twelve draws. `intel/marathon-spatial-mining.md`: Sella Voss's entire
campaign back-half runs on a waterfront — findings 17–22 and 30 (the drowning room, the
high dry span, the failing footspan, the rope ferry, the resin-gate choke, the plank
between pilings, the Drowned Port) — and §4 ranks water/flood hazard the **4th** most
load-bearing structural demand in the whole marathon with "nothing in the twelve sites
models it."

**Builds on.** `BF-LOGISTICS` (Warehouse, Dock-House) for the buildings.
`URBAN-STUDY-BRIEF.md` as the *brief pattern* — a body study plus a life study, run as a
pair. The Site 5 Mine/Workshop working spec for the operating-circuit standard (a quay is
a circuit: arrive, moor, unload, tally, store, dispatch). Site 1's threshold grammar for
the customs/quarantine control relation, which is a guard post's job done on water.

---

### 3.3 Entertainment venue family — tavern, theater, gambling house

**Functional promise.** A room built to hold more people than live there, on purpose, at
night. It promises anonymity and its opposite: the player can disappear into a crowd or be
recognised by everyone in it, and both are useful. Every plan here runs through other
people — bought, bribed, distracted, or used as cover — and the building's own machinery
(the service door, the private room, the stage, the bank) is the lever.

**Step-0.5 classification (PROPOSED): (b) venue fixture inside an existing host — with one
flagged exception.** This is the guidelines' own worked example and their own warning:
*"Do not create a new numbered Golden Site merely because a common venue—such as a
tavern—deserves a retained proof."* The system has already ruled on it and the ruling
holds up: `BF-PUBLIC-SERVICE` names **Tavern, Bathhouse, and Gambling Den** as three
programs sharing one chassis grammar (public arrival, recognition/payment, guest area,
service edge, controlled back route, egress) — which is a precise description of all three.
`URBAN-FABRIC.md` §-1 states it flatly: "The tavern is an ordinary venue/host program, not
a numbered Golden Site," hosted by Site 2 for its roadside expression, Site 10 for its
urban frontage, Site 4 for a courtyard-inn guest expression, and transformed by Sites 3
and 8. `VENUE-TAVERN-01` is already the required first fixture.

**So why is Entertainment Strip the single biggest unmapped urban bucket at 12.79%?**
Because the *district* is unmapped, not the *venue*. An Entertainment Strip is a run of
venue frontages with a shared night-time street between them — that is a **fabric**
problem (§3.5), and the fabric layer is where it should be answered. Routing it to a new
site number would build the wrong thing at the wrong scale.

**The flagged exception.** The **theater / performance hall** is the one member of this
family whose geometry the `BF-PUBLIC-SERVICE` chassis does not supply: tiered or raked
seating around a focal volume, a back-of-house that is a second building, and sightlines
that are the *point* rather than a tactical accident. That is a distinct spatial grammar
sitting inside a correctly-classified family. **Proposed:** a second Golden Venue fixture,
`VENUE-ASSEMBLY-01`, covering the tiered-assembly volume and reused by courtroom, chapter
house, lecture hall, and auction room. Still bin (b). Still not a number.

**Evidence.** `intel/walk-census.md` §3: **Entertainment Strip 33/258 = 12.79%** — the
largest single urban district on the table and the largest unmapped bucket, "taverns/
theaters/gambling — no golden site names this." `intel/tiyl-starts.md`: Start 4's
birthplace rolled "In a tavern or inn"; Start 6's Entertainer background and its
`eFoot` = "an old acquaintance or contact in town" resolve into venue interiors.
`intel/marathon-spatial-mining.md` finding 6: the Drover's Rest waystation inn, mapped to
Site 2 — the roadside expression working exactly as `URBAN-FABRIC.md` predicts.

**Builds on.** `TAVERN-VENUE-ROUTING-BRIEF.md` and `VENUE-TAVERN-01` (do this *after* that
proof, not beside it). `BF-PUBLIC-SERVICE`. `URBAN-FABRIC.md` §1's tavern flagship kit and
its distilled Tavern 2.0 tables.

---

### 3.4 Slums / poor-quarter warren

**Functional promise.** A settlement that grew where nobody planned one and nobody can
now remove it. It promises density as terrain: routes that are three feet wide and four
storeys tall, a hundred witnesses and no informants, cover everywhere and safety nowhere,
and a social machine (fire-circles, dead-man rooms, who-owes-whom) that the player can
read and use. Playing here should feel like the map is made of people. It must remain
recognizable whether it is a refugee quarter on a rich town's cheapest ground, a stacked
lodging warren, or a shanty ring outside a wall.

**Step-0.5 classification (PROPOSED): (a) new host program — shared with §3.1, expressed at
aggregate scale.** In other words: the warren is not a thirteenth number and not a
fourteenth. It is *habitation at density*, and it should be the top rung of the same
ladder whose bottom rung is one room.

**Why it is not Site 2 Camp/Service** — the argument Adam asked for, made against Site 2's
own LOCKED capsule rather than against a summary of it. Site 2's capsule is
"**surface-anchored, no foundations — the anti-guard-post**… camps leave **traces, not
ruins** — fire scar, stake holes, trampled ground," and its permanence ladder is
explicitly *two rollers, one technology*, topping out at Rung 2 waystation. The brief names
the structural distinction the ladder preserves: "**what persists when everyone leaves** —
a camp leaves traces, a waystation leaves structures — and **which way it faces** (inward
ring vs road frontage)." Test the warren against both axes:

- **What persists.** A warren leaves *ruins* — party walls, chimney stacks, a lane pattern
  that survives the buildings. That is the far side of Site 2's own boundary; the ladder
  has no rung for it, by design.
- **Which way it faces.** A camp faces its fire; a waystation faces the road. A warren
  faces *itself* — its identity is the interior alley network, and its relationship to the
  road is to hide from it.
- And a third axis Site 2 does not have to carry: **who it serves.** Site 2 is a service
  program — it "controls nothing and offers something (fire, shelter, water, trade)" to
  passers-by. A warren offers nothing to anyone outside it. It is habitation, and its
  operating model is a household's, multiplied and stacked.

The census's own mapping already made this call and left it unmapped for the same reason:
Slums/Low Ward → UNMAPPED, "poverty district — no named vernacular."

**Evidence.** `intel/walk-census.md` §3: **Slums/Low Ward 23/258 = 8.91%, unmapped** —
third-largest unmapped urban bucket. `intel/marathon-spatial-mining.md` §4, gap 3, stated
as an explicit finding: "**A permanent poor-quarter/warren** (the Refugee Quarter) —
distinct from Site 2's *temporary* camp-on-borrowed-ground; this is a settled, permanent
slum with its own social machinery (dead-man rooms, fire-circles). Site 2's brief
explicitly says it owns the temporary case; this gap is real and unclaimed by any of the
twelve." Marathon finding 12 has the DM's own words for the thing: "a warren of lean-tos
and stacked lodging on the town's cheapest chains," plus finding 13 (the wash-yard
dead-end) and finding 15 (hiding among "a hundred marks") as the two gameplay uses.
`intel/tiyl-starts.md`: childhood home rolled "A room in a poor quarter" (Start 6) and "On
the streets" (Start 4); Start 8's tension rolled "a sickness is spreading through the
poorer quarters."

**Builds on.** §3.1's dwelling family (this is its aggregate rung). `URBAN-FABRIC.md` §2's
district fabric and lazy mint-on-entry. `URBAN-STUDY-BRIEF.md` lane 5, which has already
classified the **FFT slums cohort** (maps 32, 40, 48) — the brief says "already classified
by the camp study; reuse, do not reclassify," so that comparison work is banked and
waiting. Site 10's shanty-quarter chassis expression, named in the same brief.

---

### 3.5 The home settlement as playable fabric — the umbrella

**Functional promise.** The place the player returns to. Not a level: a persistent,
named, accreting fabric with a memory, where the same alley is the same alley next month
and the shopkeeper remembers. It promises continuity as a mechanic — the player's
reputation, debts, hiding places, and enemies all have addresses.

**Step-0.5 classification (PROPOSED): none of the five — this is not a site at all.** It is
the **fabric / aggregation layer**, and it already has an owner:
`URBAN-FABRIC.md` (districts minted write-once on entry, buildings soft-minted on approach
and locked on contact, district biases the walk) plus
`BATTLEMAP-TOWNTRAY-COMPOSITION.md` (the TownTray projection). **We must not invent a
parallel program here**, and this section exists mainly to say so before someone does.

What the evidence shows is missing is not a new generator. It is three specific additions
to the layer that already exists:

1. **Residential fill.** The fabric currently has no housing to fill itself with, because
   there is no dwelling program (§3.1). A district minted today can produce a tavern, a
   temple, a guildhall, a manor, a garrison, a court, a bathhouse, a gambling den, a
   warehouse, a dock-house, and four shop kinds — and nowhere for anyone to live.
2. **The between-buildings vocabulary.** The marathon's number-one ranked demand is not a
   building at all: "**Sightline/cover geometry for stakeout, stealth, and ambush** (7
   findings, highest load-bearing)… a generator needs a standard vocabulary of *cover
   elements* (stall-gaps, doorway nooks, crowd-density, dead-end lanes) **attachable to any
   settlement site**, not just golden sites." That is a fabric-layer asset, not a site.
3. **Elevation and unstable ground as fabric.** Ranked second, 7 findings: "A generator
   should ship named vantage points and at least one collapsing/slick/narrow hazard per
   site as standard kit." Two independent playtest sets invented the *same* trick unaided
   (bait an enemy onto a narrow unstable edge) — that is demand, not flavour.

**Evidence.** `intel/marathon-spatial-mining.md` §1: **19 of 37 total findings are tagged
"OTHER — Shimmering Maw town fabric"** — more than every golden site in the marathon
combined. §4, gap 1: "an entire campaign's home base with no golden-site analog at all…
a hybrid settlement-plus-natural-hazard that every set had to keep re-inventing piecemeal."
§3 ranks 1, 2, 5, and 7 are all fabric-level rather than site-level demands.
`intel/tiyl-starts.md` §3.1: **all 12 of 12 starts produced a settlement**, none produced
open road with no settlement — flagged there as plausibly sample-size luck at n=12, and
worth a larger batch before it is treated as structural.

**Builds on.** `URBAN-FABRIC.md` §2 (district fabric, distilled from Settlement & District
v1.1) and its verified state — `dev/verify-urban-fabric.mjs` passed 33/33 on 2026-07-26.
`BATTLEMAP-TOWNTRAY-COMPOSITION.md` §10.3 coverage dimensions.
`GOLDEN-SITE-WORLD-CONTEXT-PROJECTION.md` for the apron/context boundary, since a home
settlement is mostly *context* around whichever tray is active.

---

### 3.6 Infrastructure hub — the settlement's underside *(added: the census's dungeon-side gap)*

**Functional promise.** The machine under the town. Aqueduct, cistern, culvert, sewer,
pump house, and the well in the yard: spaces built for water and waste rather than for
people, which people therefore use for everything the town forbids. It promises a second
map over the same ground — a route network that ignores walls, doors, and guards, at the
price of darkness, bad air, flooding on someone else's schedule, and no way to turn
around. Its scale ladder runs from one household's well shaft to a city's whole
undercroft.

**Step-0.5 classification (PROPOSED): (a) new host program — conveyance and utility.** And
this one is the cleanest possible demonstration of why the noun/state distinction matters,
because the census caught the system making exactly the error the distinction prevents.
The census maps **Underworks** (10.47% of urban arrivals) to **Site 8 Infiltrated/Layered**
— and Site 8 is a *transform*. Its own reason line says so: "sewers read as the concealed-
layer condition, not a standalone noun." Which means the game's sewers currently have **a
state and no host**. The utility network is being represented by the fact that someone is
hiding in it. Give it a host program and Site 8 goes back to doing its actual job:
transforming it.

The dungeon side says the same thing from the other direction: **Infrastructure Hub is the
only unmapped dungeon type**, at 13.83%, and the census's reason is precise — "adjacent to
Site 5's excavated vernacular but functionally a city-utility space, not extraction/craft."
Site 5 Mine/Workshop is close but wrong: a mine's operating model is extraction and haulage
outward; a cistern's is conveyance and containment inward.

And the small end of this program already appeared in play, ranked as its own demand:
"**A vertical shaft/well as a dungeon-style descent point grafted onto an otherwise mundane
building** (2 findings)… players expect *some* buildings to have a below (cellar, well,
sunken floor) that leads to a different register of danger/secrecy." That is the household
water organ from §3.1 and the settlement water organ from this entry meeting in the middle
— which is a strong argument for building them in the same program rather than twice.

**Evidence.** `intel/walk-census.md` §3: **Infrastructure Hub 35/253 = 13.83% of dungeon
arrivals, the sole unmapped dungeon type** and the 4th most common place-kind in the whole
pooled 1,050-walk census. Underworks 27/258 = 10.47% urban, mapped only to a transform.
`intel/marathon-spatial-mining.md` §3 rank 8 (the well-house shaft) and findings 34, 36,
37 — "the richest single-scene invention of the marathon," per the report's own heading.

**Builds on.** `BF-LOGISTICS` for the throughput grammar (but see §4 — the throughput is
water and waste, not goods, so it needs its own family). Site 5's working spec as the
operating-circuit and vertical-access standard. The dungeon walk, which is already this
program's entering walk family.

---

### 3.7 Flooding / inundation *(added: the marathon's fourth-ranked demand, and it is a state)*

**Functional promise.** Not a place — a thing that happens to places. Water arriving where
the floor is, on a clock the player does not set: routes closing behind you, height
becoming the only currency, structure failing under load, and everything the settlement
owns turning into either a raft or an anchor.

**Step-0.5 classification (PROPOSED): (c) transform / state.** It is named already, in the
ontology contract's `TransformStack` row: "dormant, layered control, siege, **flooding**,
occupation, repurposing, damage, repair, or breach." It is listed here rather than left
implicit for one reason: it is currently the **highest-demand unbuilt item in the whole
corpus that is not a noun**, and if it is not written down as a state, the demand will
keep arguing for a "drowned site." There should be no flood site. There should be a
flooding transform proved on unlike hosts — a port, a dwelling, an infrastructure hub —
which is exactly the ontology's acceptance test 2 ("one transform applied to at least three
unlike hosts with no host-specific transform branch").

**Evidence.** `intel/marathon-spatial-mining.md` §4, ranked demand 4: "**Water/flood hazard
as recurring dramatic architecture** (5+ findings across sets 03/05/07/09). Rising water,
drowning rooms, failing spans, and a 'glass that keeps its dead' are not one-off — they
are the spine of Sella's entire back half. No golden site currently models a
flood/drowning-disaster site; this is a standing demand with no home."
`intel/tiyl-starts.md`: **The Drowned Port** — "a coastal town where half the streets flood
at high tide" — is the most-rolled origin in the batch, 3 of 12, and it is a *host plus a
state* described in one table row.

**Builds on.** Site 3 (dormant) and Site 8 (layered control) as the two transforms with
existing treatment — flooding is the third, and doing it third is what proves the transform
machinery is general rather than two special cases. The ontology contract §5's expression
ladder (LC-0…LC-5) as the *shape* of a transform spec.

---

### 3.8 Slate summary

| # | entry | bin | evidence headline |
|---|---|---|---|
| 3.1 | Domestic / lodging interior | **(a)** host — habitation *(lodging half = (b))* | 58% of births "at home"; most-implied place in the chain; no district is residential |
| 3.2 | Port / harborfront | **(a)** host — waterside service | 12.02% of urban arrivals unmapped; most-rolled TIYL origin (3/12) |
| 3.3 | Entertainment venues | **(b)** venue fixture *(theater = new fixture, not new site)* | 12.79% — largest urban district, largest unmapped bucket |
| 3.4 | Slums / warren | **(a)** host — habitation at density | 8.91% unmapped; marathon gap 3, argued against Site 2's capsule |
| 3.5 | Home settlement fabric | **not a site** — fabric layer, already owned | 19 of 37 marathon findings; ranks 1, 2, 5, 7 are all fabric |
| 3.6 | Infrastructure hub | **(a)** host — conveyance/utility | 13.83% of dungeons, sole unmapped type; Underworks has a state and no host |
| 3.7 | Flooding | **(c)** transform | marathon rank 4, 4 separate sets; Drowned Port ×3 |

Four new host programs, one venue fixture, one transform, one explicit do-not-build. That
is the honest size of "settled life" — and note that it is *four*, not seven, which is what
sorting into bins buys.

## 4. How the building-program roller tables serve this

Adam's third statement is a build instruction: new settled-life sites should be
**determined and fleshed out through the building-program / urban-fabric table families
where possible, not bespoke geometry generators each.** This section maps every slate entry
onto what those families actually cover today.

### 4.1 What the roller covers today, honestly

`BUILDING-PROGRAM-TABLE-FAMILIES.md` is `ACCEPTED DIRECTION` (founder-ruled after the
42-roll audit, seven-family taste sampler returned, **live implementation deferred**). It
defines seven authoring families over fourteen programs:

| family | programs |
|---|---|
| `BF-PUBLIC-SERVICE` | Tavern, Bathhouse, Gambling Den |
| `BF-CIVIC-AUTHORITY` | Guildhall, Garrison, Court |
| `BF-HOUSEHOLD-ESTATE` | Manor |
| `BF-RITUAL-INSTITUTION` | Temple |
| `BF-LOGISTICS` | Warehouse, Dock-House |
| `BF-SHOP-WORKSHOP` | Smithy, Apothecary, General Store, Arcanist |
| `BF-CUSTODY` | Prison/Custody |

**The settled-life hole shows up here too, and independently.** Fourteen programs and there
is no ordinary dwelling, no quay, and no conveyance. The one household program is a Manor.
That is the same finding as the walk census, arrived at from the authoring side, which is
worth stating plainly because two independent instruments agreeing is stronger evidence
than either alone.

The layer stack the roller supplies is: **Layer 0** committed program (not a roll) →
**L1** family chassis d20 → **L2** program arrangement d12/d20 → **L3** operating state →
**L4** current scene d20 → **L5** context-biased Spice d20 → **L6** realm doctrine →
**L7** derived population and capacity. That stack is genuinely powerful for anything with
a frontage, a threshold, and an operator. It is silent on ground, level change, water,
route networks, and the space *between* buildings.

### 4.2 The mapping

| slate entry | rides the building roller? | what it needs, precisely |
|---|---|---|
| **3.1 Domestic / lodging** | **RIDES — fully.** | A new program `dwelling` inside `BF-HOUSEHOLD-ESTATE` (or a split family `BF-DWELLING` if the estate invariants prove too heavy — that is a research finding, not a decision to make now), plus `building-dwelling-arrangement` d20, `building-dwelling-current-scene` d20, `building-dwelling-spice` d20. This is the §7 **Proof Pair** shape exactly — propose it as **Proof Pair C**. The lodging half rides `BF-PUBLIC-SERVICE` as an arrangement row on the existing Tavern program (`road inn with lodging`, already gestured at in §1's chassis note: "A road inn may require a lodging-capable Public-Service chassis"). |
| **3.2 Port / harborfront** | **SPLIT.** Buildings ride; the water edge does not. | Buildings: `BF-LOGISTICS` already has Warehouse and Dock-House; add `customs/quarantine post` and `chandlery` as programs, and a `waterfront` chassis row — §1 already anticipates this ("a ferry house may require a true vehicle/water loading edge"). **Site-grade:** the quay chassis itself — water plane, tidal level change, mooring geometry, vessel envelope as a moving occluder and a route. No building table can produce a two-metre tidal drop. |
| **3.3 Entertainment venues** | **RIDES — fully, no site-grade work.** | Tavern, Bathhouse, and Gambling Den are already `BF-PUBLIC-SERVICE` programs. Theater needs one program row plus one chassis row (tiered assembly volume) inside the same family, and its retained proof is `VENUE-ASSEMBLY-01`. Nothing here is a geometry generator. |
| **3.4 Slums / warren** | **SPLIT.** Each shelter rides; the aggregation does not. | The individual dwelling rides §3.1's family at its lowest rung. But a warren's identity is the *relationship between* buildings — shared walls, stacked storeys, three-foot lanes, roofs as routes — and the roller mints one building at a time by design. The aggregation belongs to `URBAN-FABRIC.md` §2's district layer. **This is the clearest case in the slate where the roller genuinely stops.** |
| **3.5 Home settlement fabric** | **NEITHER — it is the layer above.** | The roller serves it by supplying buildings; the fabric layer supplies the between. What is missing is fabric-level kit (cover elements, vantage points, unstable ground) and residential fill, per §3.5. |
| **3.6 Infrastructure hub** | **NEEDS SITE-GRADE TREATMENT.** | Every one of the seven families is an above-ground frontage program with a customer, member, guest, petitioner, or prisoner edge and a named operator. A cistern has no frontage, no customer, and often no operator present. `BF-LOGISTICS` is closest but its throughput is goods on vehicles; this throughput is water and waste under gravity. Needs its own family (`BF-CONVEYANCE`) **and** site-grade route/section grammar, because its entering walk family is the dungeon walk, not the urban walk. |
| **3.7 Flooding** | **NEITHER — transform layer.** | Touches the roller only at **Layer 3 (operating state)**, which already lists "damage, occupation, dormancy" and would gain flooded/draining/drowned as states. The transform's real home is the `TransformStack` in the ontology contract. It must not become a Layer-1 chassis row; a flooded building is not a kind of building. |

### 4.3 The rule this yields

**PROPOSED:** a settled-life demand earns site-grade treatment only when it needs
*ground* the building roller cannot describe — level change, water, terrain, or a route
network between buildings. Everything with a frontage, a threshold, and an operator rides
the roller. By that rule the slate is: three ride (3.1, 3.3, and the buildings of 3.2 and
3.4), two need real site-grade ground (3.2's quay, 3.6's conveyance network), one is fabric
(3.4's aggregation and 3.5), and one is a transform (3.7).

That is a much smaller programme than "flesh out settled life" sounds like, which is the
point of doing the classification first.

## 5. Pipeline entry and build order

### 5.1 Entry

**Every slate item in §3 enters THE SITE PIPELINE at step 1 (RESEARCH). Nothing in this
document settles tonight.** The depth law applies in full and without exception: a breadth
sweep ("what else could this site be"), real-image reference lanes with per-image license
ledgers, the FFT-equivalent cohort comparison, and a culture study where the site's life
demands one. Conversational rulings bank as they land; briefs settle only after that work
returns and is re-gated.

Two honest consequences of that. First, this document's classifications in §3 are
**hypotheses for step 0.5 to test**, not step-0.5 outputs — a research pass could find that
the warren is a distinct host after all, or that the quay is a Site 2 variant, and either
would be a good outcome. Second, per the pipeline's own step 0, each item owes a
**roller audit** before its research pass: what already produces this site's ingredients,
with `LIVE` / `LIVE-COMPOSED` / `AUTHORED-UNWIRED` / `ORACLE-MANUAL` / `INTERPRETIVE` /
`TARGET-ADAPTER` statuses per source, and at least one real rolled composition worth
retaining, recorded in `GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md`. An authored row that no
player-facing roller calls must never be described as live.

### 5.2 Proposed build order

Per THE GENERATOR PRINCIPLE, this is a **proposed build order with learning rationale**,
not an A-or-B choice. Everything on the slate is eventually built; the question is only
what teaches the most, soonest.

**1 — Ordinary dwelling / habitation host (§3.1).**
*Learning:* it is the only item that closes a hole in **both** instruments at once — the
golden portfolio has no habitation host, and the building-program families have no dwelling
program. It is also the only item whose *high end already exists*: the Manor is authored,
so building the low end teaches the **ladder**, not just a room, and the ladder is the
thing every other entry needs. And it is the cheapest possible test of the (a)/(b) split,
because the household and the rented room sit in the same building on the same street.
*Still unknown after it passes:* whether the dwelling family generalizes across realms as
cleanly as the Manor did, and whether household interiors read at the fixed production
camera at all.

**2 — Port / harborfront (§3.2).**
*Learning:* it teaches the **water edge** — tidal level change, mooring, vessel envelope —
which nothing in the portfolio teaches and which four separate slate entries and one
transform depend on. Its buildings are already covered by `BF-LOGISTICS`, so the research
can concentrate entirely on the ground, which is where the unknown is. Doing it second
means the flooding transform (item 3) has a host built for it.
*Still unknown after it passes:* whether a vessel is a site fixture, a moving occluder, or
a second tray.

**3 — Flooding transform (§3.7), mounted on §3.2 and §3.1.**
*Learning:* the cheapest available proof of the noun/state law, and it satisfies the
ontology's acceptance test 2 (one transform, three unlike hosts, no host-specific branch)
using two hosts that will just have been built plus one that already exists. If flooding
cannot be done as a delta, that is a load-bearing failure we want to discover on the third
item rather than the tenth.
*Still unknown after it passes:* whether time-varying transforms (a tide, a rising flood)
need a different machinery from static ones (dormant, layered control).

**4 — Warren / poor-quarter aggregation (§3.4).**
*Learning:* it is recombination of item 1 at density, so the buildings are free; what it
actually teaches is the **between-buildings grammar** — the marathon's number-one and
number-two ranked demands (cover/sightline elements; elevation and unstable ground). Those
are fabric assets that then serve every settlement in the game, not just this one.
*Still unknown after it passes:* whether crowd density can be a first-class tactical
element rather than dressing.

**5 — Infrastructure hub / conveyance (§3.6).**
*Learning:* it gives Underworks a noun and gives Site 8 its job back; it reuses item 1's
household water organ at settlement scale; and it is the one settled-life host whose
entering walk is the **dungeon** walk, which tests whether a host program really can be
reached from any walk family (ontology acceptance test 1). Fifth rather than second because
its 13.83% is dungeon-side, and the urban gaps are larger and compound with each other.
*Still unknown after it passes:* whether a route network without rooms is a site at all.

**6 — Entertainment venue fixtures (§3.3), including `VENUE-ASSEMBLY-01`.**
*Learning:* the least, which is exactly why it goes last — it rides a family that already
exists and it should follow `VENUE-TAVERN-01` rather than run beside it, so that the venue
path is proved once before it is used three more times. Cheap, high-frequency, and it will
be cheaper still after items 1–5 have supplied the fabric around it.

**Not in the build order: §3.5.** It is not a build item; it is a standing correction —
route all home-settlement work to `URBAN-FABRIC.md` and `BATTLEMAP-TOWNTRAY-COMPOSITION.md`
and do not start a parallel program. Its two real needs (residential fill, fabric kit) are
delivered as side-effects of items 1 and 4.

**Ladder links.** Items 1 and 4 are one ladder (one room → household → tenement →
warren) and must not be built as two families. Items 2 and 6 both host the lodging venue,
which is the cross-check that the venue path is host-agnostic. Item 3 degrades 2 and 1
(flooded), and item 5 is what 3 flows into. Item 5's smallest rung (a household well) is
item 1's largest fixture — build it once.

### 5.3 First research briefs to commission

Following `URBAN-STUDY-BRIEF.md`'s pattern: a **body** brief and a **life** brief run as a
pair, all lanes in one pass for a background run, reporting once, founder questions batched
at synthesis only, outputs in-repo under `Reference/<Study>/` with a `SOURCE-LEDGER.md` and
declared gaps stated plainly.

**Commission now (items 1 and 2):**

1. **`DWELLING-STUDY-BRIEF.md`** — the body. Lanes: (1) vernacular house typology across
   wealth rungs, matched to the six rungs the game's own dice already roll (mansion, large
   house, small house, shack, room in a poor quarter, streets); (2) the single-room
   interior at gameplay scale — hearth, bed, storage, threshold, and what a fixed camera
   can actually read; (3) the sub-floor organ (cellar, well, sunken floor) that connects to
   item 5; (4) party walls, stairs, and the upper-room condition, since half the marathon's
   domestic scenes happened on a stair; (5) the FFT domestic cohort; (6) touchstones,
   documentation only. Deliverable includes the §8-format material/dressing roster.
2. **`DOMESTIC-LIFE-STUDY-BRIEF.md`** — the life, sibling to the above on the urban pair's
   model. What a household actually contains, does, owns, and hides; who is home at what
   hour; what a guest may and may not touch; the meaning-bearing dressing extract that
   routes back into brief 1's roster lane.
3. **`HARBOR-STUDY-BRIEF.md`** — the body, weighted hard toward **ground**: tidal working
   surfaces and level change, quay and jetty construction, mooring geometry, loading gear,
   vessel envelopes at gameplay scale, and the flood/inundation states the same ground
   takes. Its FFT cohort lane should pull the port and water maps. This brief is unusual in
   that its *building* lane is thin on purpose — `BF-LOGISTICS` already owns it.

**Queued behind them (items 4, 5):** `WARREN-STUDY-BRIEF.md` (density, stacking, alley
networks, and the cover/sightline vocabulary as a first-class deliverable — note lane 5's
FFT slums cohort 32/40/48 is already classified by the camp study and must be reused, not
reclassified) and `CONVEYANCE-STUDY-BRIEF.md` (aqueduct, cistern, culvert, sewer, pump
house; section and route grammar; the dungeon-walk entry).

## 6. The minute-zero connection

`intel/tiyl-starts.md` §4 offers the founder three representation options for what the game
puts on the table at minute zero. **This section takes no position between them** — that is
a founder call. What it does is state plainly what each one depends on from this slate, so
the choice can be made with its cost visible.

**Option A — a dedicated origin-scene treatment (a purpose-built thirteenth site type).**
Depends on: **§3.1 and §3.2** for content, and on nothing else in this slate structurally.
Note the tension the report itself raises: it "directly collides with Adam's framing that
the twelve golden sites 'define the entire game's MVP' — a 13th site grows that scope
rather than filling it." Note also that if §3.1 and §3.2 are built as host programs, most
of Option A's demanded content exists without a thirteenth number — the origin scene becomes
a *selection rule* over existing hosts rather than a new site. That is not an argument
against A; it is a statement that A gets cheaper the later it is decided.

**Option B — nearest-neighbour reuse plus realm dressing.** Depends **most heavily** on this
slate, and improves fastest as it lands. Today B routes roughly half of rolled openings
into a visibly wrong container (the report's example: "a flooding port street staged inside
a civic market-hall's silhouette says something the prose doesn't"). Build §3.2 and the
Drowned Port's 3-of-12 share is right instead of wrong. Build §3.1 and the lodging-room
opening is right. Build §3.4 and the poor-quarter starts are right. B's whole cost is the
miss rate, and this slate is the miss rate's only real lever.

**Option C — text-first cold open, defer the rendered scene.** Depends on **nothing** in
this slate, and is the only option available today at zero build cost; it also matches the
project's own TEXT-FIRST-FOREVER doctrine. The honest counter-evidence is in the marathon,
not the TIYL batch: play does not leave settled fabric and come back to it later — 19 of 37
spatial inventions across eleven playtest sets were settlement fabric, so a deferral rule
would be deferring the most-used register in the game, not the least.

**One mechanical dependency that sits under all three.** `intel/tiyl-starts.md` §3.0
records that the rolled *hometown* and the mechanical *`bornWhere`* are two independent
d100 draws that disagreed **12 times out of 12**, with both written into the ledger as
canon. Any option that renders minute zero needs a rule for which one it renders. That is a
prior question to the three options, not part of choosing between them.

## 7. Founder questions — ALL FOUR RULED by Adam, 2026-07-27 (morning)

> **Q1 — RULED: fold into the Manor's low end.** One household program, dressed by wealth,
> the Manor as its top rung. The six wealth rungs are expressions of one program; the
> "same house with worse furniture" failure mode becomes the thing the dwelling research
> pass must explicitly defeat (§5's DWELLING-STUDY-BRIEF inherits that as its first
> acceptance criterion). §3.1's classification updates accordingly.
> **Q2 — RULED: working quay first.** The healthy operating model lands before its
> degradation; the drowned waterfront follows within the same research pass as the honest
> flooding-transform proof.
> **Q3 — RULED: one persistent, returnable place.** The home settlement is a named place
> with a memory — alleys the player learns, a shopkeeper who remembers, debts with
> addresses. The fabric layer (§3.4, §3.5) is worth heavy investment; its persistence
> model is load-bearing and budgets accordingly.
> **Q4 — RULED: the middle answer.** Buy silhouette for all wilderness curiosities; mark a
> small usable subset per family. The Meshy queue specs to silhouette-grade by default
> with a per-family usable flag.

Recorded verbatim-intent answers: "ordinary dwelling should fold into the manor's low
end" · "working quay" · "one persistent returnable place" · "the middle answer."

The original questions, preserved for the reasoning behind each choice:

**1. Does the ordinary dwelling get its own ladder, or does it fold into the Manor's low
end?** The game's dice already roll a six-rung wealth ladder for where a character grew up
— mansion, large house, small house, rundown shack, a room in a poor quarter, on the
streets. We can honour all six as distinct rungs of a dwelling family with real spatial
differences between them, or we can treat the household as one program that a wealth
parameter dresses, with the Manor as its top rung. *Six rungs* gives you a rundown shack
that reads as a different kind of place from a large house, and it makes §3.4's warren a
natural extension rather than a new invention; it costs more authoring and more research
breadth. *One program, dressed* is cheaper, lands sooner, and reuses the Manor proof
directly; it risks poverty reading as "the same house with worse furniture," which is the
failure mode the 42-roll audit already caught elsewhere. This is easy to revise upward
(rungs can be split later) and hard to revise downward. **The judgement needed is visual:
five dwelling expressions side by side at the same camera, poorest to richest.**

**2. For the waterfront, which comes first — the working quay or the drowned waterfront?**
Both are being built; this is build order. *Working quay first* gives us the healthy
operating model — arrive, moor, unload, tally, store — and the drowned version is then an
honest degradation of a place we understand. *Drowned first* gets us straight to the
register the playtest actually produced (Sella's flooding chain-town, the most-rolled
origin being The Drowned Port) and to the flooding transform sooner. My reason for
proposing working-first in §5.2 is that a degradation is only truthful if we know what was
degraded — but the demand evidence genuinely points the other way, so this is a real
choice. Easy to revise: whichever is second follows within the same research pass.
**Judgement needs: one quay in two states, same ground, same camera.**

**3. Is the home settlement one named, persistent, returnable place — or is every
settlement equally disposable?** The marathon produced the first answer by itself: both PCs'
whole campaigns ran inside settlements the catalog does not model, and the Shimmering Maw
accreted across eleven sets into something with a memory. *A returnable home settlement*
makes the fabric layer worth heavy investment — alleys the player learns, a shopkeeper who
remembers, debts with addresses — and it makes §3.4 and §3.5 high-value. *All settlements
disposable* keeps the generator honest and the world large, and it caps how much we should
spend on fabric. This is a direction call about what kind of game it is, not a systems
question, and it changes the budget for two slate entries. Hard to revise late — the fabric
layer's persistence model is load-bearing. **Judgement needs: no image; this is a
conversation about the shape of a campaign.**

**4. Are wilderness landscape curiosities scenery the player walks past, or objects the
player uses?** This one sets the spec for the sibling Meshy queue. *Scenery* means we buy
silhouette and nothing else — a Meshy donor with a collision proxy, cheap, and 313
rollable instances get a body fast. *Usable* means every donor also needs sockets, real
collision, cover values, climbability, and in some cases an interaction — several times the
cleanup per model, and a much smaller batch for the same month. The evidence cuts both
ways: the marathon shows players relentlessly *using* terrain (two independent sets invented
the same bait-onto-unstable-ground trick unaided), but the wilderness curiosity table is
enormous and thin — 166 distinct values, most appearing once or twice, which argues against
paying interaction cost per row. A middle answer exists: buy silhouette for all, and mark a
small usable subset. Easy to revise per family; expensive to revise per model.
**Judgement needs: three donors at the fixed camera with a standee beside them — one
scenery-grade, one usable-grade — to see whether the difference is even visible.**
