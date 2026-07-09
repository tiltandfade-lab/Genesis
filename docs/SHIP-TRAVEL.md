---
type: system-spec
project: Genesis
status: "SPEC — drafted by Fable 2026-07-08, awaiting Adam's review"
created: 2026-07-08
source: "[[SHIP-RULES-GATHER]] (Ghosts of Saltmarsh App. A, vision-verified, pp. 186–207)"
related:
  - "[[SPATIAL-MODEL]]"
  - "[[TIER-SCOPE]]"
  - "[[COMBAT]]"
  - "[[COMBAT-LIFECYCLE]]"
  - "[[ECONOMY]]"
  - "[[ECONOMY-SINKS]]"
  - "[[ITEMS]]"
  - "[[DESIGN]]"
---

# Genesis — Ship Travel (SHIP-TRAVEL)

Ships, crews, voyages, and sea combat for Genesis. Adapts the Saltmarsh Appendix A rules
(captured in `docs/SHIP-RULES-GATHER.md`) onto Genesis's existing spines: the node-graph
spatial model, `passTime`, the codex NPC layer, the side-based combat MVP, and the
buy/sell economy. **Adam's ruling: these rules are adopted/adapted for the MAIN world
too, not just the high-seas realm** — a ship is general machinery; high-seas is merely
the realm where it's the default mode of travel.

## Design thesis (the three sentences everything below serves)

1. **The ship is a MOBILE HOME NODE.** It is a node in the graph that *moves along water
   edges*: the crew is a standing NPC cast, the hold is storage, the deck is a scene host.
   Nothing about scenes, codex, storage, or rest needs new machinery — the ship reuses
   the node machinery and adds one property: position that changes per day.
2. **The crew QUALITY SCORE is the load-bearing number, and the script owns it.** Crew
   are codex NPCs; their states roll up into one −10..+10 integer that modifies every
   ship group check, initiative, passive perception, and the mutiny check. The DM
   interprets *why* quality moved ("the bosun's grumbling has spread to the galley");
   the engine decides *that* it moved and by how much. Very Genesis: script owns the
   number, DM owns the meaning.
3. **Sea travel is the existing travel loop over water.** Chart a course = pick edges;
   each day = one `passTime("montage")`-shaped tick with a start-of-day hazard/encounter
   roll bolted on. No new clock, no new travel paradigm — the Saltmarsh daily procedure
   *is* a walk assembly with a d20 gate in front.

**TIER-SCOPE law (binding):** nothing in this spec requires a PC past level 10 or
content past T2. Saltmarsh's open-water encounter tables levels 1–4 map to T1; a T2
band is authored from the CR 5–10 aquatic bestiary. Higher-level Saltmarsh tables are
NOT gathered and NOT wired.

---

## 1. Ship acquisition & economy

### Decision: four doors in, one price anchor

A ship enters play by **buy / charter / win / steal** — all four are v1-legal because
each is already expressible in existing machinery (a buy event, a wage sink, a loot
pointer, a theft-with-consequences codex fact).

**Price anchors** (Saltmarsh gp values adopted as-is — they land beautifully inside
T2 wealth; a ship is *the* endgame purchase, which is exactly the keystone-sink
discipline from `ECONOMY-SINKS.md`):

| Class | Buy price | Charter (per day, crew wages included) | Notes |
|---|---|---|---|
| Rowboat | 50 gp | — (just buy it) | carryable; the dinghy every ship tows |
| Keelboat | 3,000 gp | 10 gp | the **main-world workhorse** (§6) |
| Longship | 10,000 gp | 30 gp | fast, shallow draft, oar-capable |
| Sailing Ship | 10,000 gp | 30 gp | the archetypal PC ship |
| Warship | 25,000 gp | 80 gp | T2-capstone purchase; combat-fitted |
| Galley | 30,000 gp | 100 gp | prestige/cargo monster; 80 crew |

Rationale for keeping the raw numbers: T2 treasure math already tops out with Rare
items at 4,000 gp (`ECONOMY.md` RARITY_VALUE), so a 10,000 gp sailing ship is a
multi-adventure savings goal — a **demand sink that outlasts the consumable sink**
without inventing a new currency. The warship/galley tier stays technically buyable
but realistically arrives by *win* or *steal*, which is the correct fantasy.

- **Buy** — rides `previewBuy`-style validation: shipwright NPCs exist only at
  tier-3 (city) coastal nodes; keelboats/rowboats at tier-2 coastal towns.
- **Charter** — a daily wage sink (rides the existing `restRiders` wage lane, same
  shape as companion wages in `src/world/companions.js`). Chartered ship = NPC captain
  retains command; the PC buys passage and course-setting influence, not the helm.
  This is the level-1-affordable on-ramp.
- **Win** — a ship is a legal high-band loot pointer (plot item per doer/pointer
  doctrine): a deed, a salvage claim, a dead captain's ship with a crew that needs
  convincing (quality starts LOW — see §2).
- **Steal** — no special rules; it's a heist scene. The consequence is codex-real:
  the former owner becomes a faction-grade pressure, and the crew you inherit (if
  any) starts at quality −2..+0. Stolen ships are hot: port officials at any tier-2+
  node may recognize them (DM-interpreted off a codex fact the engine records:
  `provenance:"stolen"`).
- **Sell** — `SELL_RATIO 0.5`, merchant-coin-capped like everything else. Only a
  city shipwright can absorb one.

**Upkeep (the ongoing sink):** crew wages 1 sp/day per sailor, 2 gp/day per officer
(SRD hireling rates), charged from the same daily rider stack as companion wages —
never blocks play, accrues as debt, and **unpaid wages are a quality-score input**
(§2). Port fees 1–5 gp/day by node tier. A ship is a home you *pay to keep*.

## 2. Crew — codex NPCs rolled up into one number

### Decision: officers are full codex NPCs; the deck crew is a POOL

- **Officers (up to 6, Saltmarsh roles kept verbatim):** Captain, First Mate, Bosun,
  Quartermaster, Surgeon, Cook. Each is a **named codex NPC record** (full NPC: hook/
  want/leverage tables apply — the ship is a standing cast, which is the whole point
  of a mobile home node). Only the **Captain is mandatory**. On a PC-owned ship the
  PC may hold Captain (or any role they're plausibly proficient for); unfilled roles
  simply lose that role's actions (no Raise Morale without a First Mate, no end-of-day
  Repair without a Bosun — the Saltmarsh role-restrictions become the hiring
  incentive).
- **Deck crew = a partial-NPC pool** (the kids/animals partials pattern from the NPC
  cluster): a count + a quality contribution, not individuated records. The engine
  tracks `crew.count` against the ship's minimums (a galley under 40 crew loses oar
  speed and actions, per stat block). Individual sailors graduate to codex records
  only when the DM promotes one (a mutiny ringleader, a sole survivor) — standard
  partial→full promotion.

### The quality score — derivation, not a free-floating stat

`crewQuality(ship) → int` clamped **−10..+10**, **base +4** (Saltmarsh start),
computed by the engine as base + Σ modifiers:

| Input (engine-tracked fact) | Effect |
|---|---|
| Unpaid wages (per accrued week) | −1 |
| Casualties this voyage (per 10% of crew lost) | −1 |
| Officer seat empty (per seat, max −2) | −1 |
| Days at sea past 30 without port | −1 per 15 days |
| Captain's CHA mod (PC or NPC) | +mod (min −2, max +2) |
| Shore leave day in port (only while quality ≤ 3) | +1/day (Saltmarsh) |
| Raise Morale success (First Mate, 1/24h, quality ≤ 3, DC 15 CHA) | +1 |
| Hazard/mutiny outcomes (§3, §below) | per result table |
| DM-declared morale events (typed event, ±1 cap per event) | ±1 |

The **base+delta ledger** is the anti-drift move: quality is never "set" by the DM,
it's *moved* by typed events (`crew_morale {delta, reason}` folds through
`dmFoldPayload` like everything else), and the derivation inputs (wages, casualties)
move it automatically. The DM narrates the grumbling; the script owns the integer.

**Quality is used exactly where Saltmarsh uses it:** modifier on crew group-check
d20s, ship initiative, crew passive Perception (10 + quality), the mutiny check,
Repair amount (1d6 + quality), sandbar STR checks, stealth-in-fog.

### Mutiny (adopted, mechanized)

Once/day while quality < 0: engine fires a captain CHA (Intimidation/Persuasion)
check modified by quality (the PC rolls their own d20 if they're captain — dice
transparency law). Total 1–9 → quality −1. Total ≤ 0 → **mutiny**: engine emits
`mutiny_started` and the crew becomes a hostile side in the combat MVP (or a social
scene — DM's interpretive call which lens fires, per the social-attitude subsystem).
Quelling it (violence, bribes, concession — DM-adjudicated, resolved through normal
checks) emits `mutiny_ended` → quality +1d4. Mutiny is the boon-you-can-lose made
flesh: a great crew is a boon, and neglect takes it from you.

## 3. The voyage loop

### Chart a course = edge selection on the existing graph

Water is just terrain: **sea/river/coastal nodes and edges live on the same
node-graph** (`SPATIAL-MODEL.md`). Ports are nodes; sea-lanes are write-once edges
whose travel time derives from distance ÷ the ship's travel pace (Saltmarsh paces
adopted verbatim: longship/sailing ship 120 mi/day, galley/warship 96, keelboat 72,
rowboat 24). Ships **can't exceed pace, only fall below it**; a damaged movement
component costs 1 mph / 24 mi-day per −10 ft speed. Charting a course = choosing the
edge path; open-sea exploration = extending the graph into unexplored water exactly
like land travel extends it (the fraying edge applies at sea too — far water trends
Strange → Mythic; sea monsters live where the map dissolves).

### The daily tick — `passTime` integration

One sea-day = one `passTime("montage")`-shaped tick, extended by a **start-of-day
sea procedure** (script-owned, runs before the day's travel is narrated):

1. **Hazard d20** — on a natural 20, a hazard fires. Roll Hazard Type (d20: 1–3 crew
   conflict · 4–6 fire · 7–9 fog · 10–12 infestation · 13–20 storm) and Hazard DC
   (d20: 1–9→10 · 10–17→15 · 18–19→20 · 20→25). Adopted verbatim.
2. **Encounter d20** — 19–20 = a sea encounter, from realm/tier-banded open-water
   tables (T1 authored from the Saltmarsh 1–4 table; T2 authored fresh from the CR
   5–10 aquatic bestiary). A day can carry both. **Spice-band note:** the encounter
   table is banded like any Genesis table — hazard is the *mundane* danger channel,
   the encounter table carries the Strange+ payloads.
3. **Hazard resolution = the group check, four tiers.** The engine assembles the
   check: named contributing officers each roll (PC rolls own dice), the crew pool
   rolls ONE d20 + quality. Outcome tier (Total Success / Success / Failure / Total
   Failure) is computed by the script; consequences apply from the per-hazard result
   tables (adopted verbatim, including storm's 4d10-per-component / Total Failure
   10d10 + 10% crew lost + random direction — the sea is supposed to be able to kill
   a ship). The **DM narrates the storm; the engine breaks the mast.**
4. **End of day:** Bosun repair check (DC 15 STR + carpenter's tools → each damaged
   component regains 1d6 + quality), wage/lodging riders, mutiny check if due, then
   normal `passTime` recovery/world-turn machinery.

Travel activities map to the existing walk-assembly roles: Navigate (Quartermaster,
vs getting lost — a failed navigation on an *established* edge costs time, on an
exploratory heading it costs heading), Forage (fishing), Draw a Map, Raise Morale.

**Weather** is the storm-hazard lane plus a light daily flavor roll (wind
with/against — with-wind ships gain the stat block's with-wind speed, into-wind drop
to 15 ft-equivalent pace). Keep it one roll; weather earns depth only when it fires
as a hazard.

### Rest & scenes aboard

The ship is a node, so: resting aboard = normal rest at a node (no lodging fee —
that's the home-node dividend), the deck/hold/cabin are scene hosts for the theater
layer (the ship interior is an `interior` gen-kind), and being aboard during a
hazard IS the scene — the PC contributes to the group check through their own actions
(DM maps the PC's declared action to one officer-check slot or advantage on one).

## 4. Ship combat

### Decision: ships slot into the side-based combat MVP as BIG combatants

No parallel combat system. A ship in combat is a **side-affiliated entity** in the
existing engine (`COMBAT.md`): side-based initiative (the ship rolls DEX + crew
quality), the 4 range bands stretched to naval scale (Melee = grappled/boarding ·
Near = ballista range · Far = mangonel range · Out = disengaged/horizon), and the
script-owns-numbers / DM-owns-decisions split intact — **the captain (the PC, or the
DM through an NPC captain) picks which ship actions fire; the resolver does the
math.**

- **Components adopted, but collapsed to FOUR for v1:** Hull, Helm, Movement (one
  pooled oars/sails track), Weapons (per-weapon HP kept — they're the tactical
  targets). Each keeps Saltmarsh AC/HP/**damage threshold** (threshold is the good
  design: small-arms fire can't sink a galley; siege damage, crashes, and big
  monsters can). Hull 0 = **wrecked**. Full six-component granularity is a deferred
  enrichment, not v1.
- **Crew casualties reduce ship actions** (adopted): action count checks live crew
  vs the stat-block thresholds. Killing crew is a valid tactic — for the enemy too.
- **Officer actions** (Take Aim, Full Speed Ahead) adopted for captain/first mate/
  bosun — these are the PC-facing tactical verbs when the PC holds a seat.
- **Crash & boarding = the melee bridge.** Crash adopted verbatim (DC 10 CON save,
  crash damage by size table, ram shunts damage). A deliberate crash/grapple
  transitions to **boarding: a normal personal-scale combat on the deck scene host**
  — the existing combat MVP takes over entirely, with the crew pool contributing
  as side-based mooks. This is the design payoff: naval combat only has to be good
  at maneuvering and shooting, because the existing engine already owns the melee.
- **Ship weapons:** ballista (+6, 3d10 piercing, 120/480) and mangonel (+5, 5d10
  bludgeoning, 200/800, min 60 ft) verbatim. The PC can personally crew one (their
  attack roll, their d20, weapon's damage).
- **DM's interpretive seat preserved:** enemy captain intent, morale/flee/parley
  (ships surrender — prizes are the pirate economy), what the scene offers (reefs,
  fog, a whirlpool as terrain) all stay DM-owned, resolved through typed events.

## 5. Ship as home — upgrades, rescaled to T2

Saltmarsh's flat **15,000 gp + 1d4 weeks** is priced for T3/T4 wealth. Rescaled to
a T2 ladder (keystone sinks, priced against the ship values in §1 — an upgrade
should cost a meaningful fraction of the hull it improves):

| Slot | Cost | Time in port | v1 menu (SRD-safe adaptations) |
|---|---|---|---|
| Hull (one) | 4,000 gp | 1d4 weeks | Reinforced Hull (hull HP ×1.5 in v1, not ×2), Vigilant Watch (+2 crew passive Perception) |
| Movement (one per type) | 3,000 gp | 1d4 weeks | Weathered Sails (ignore first −10 ft of sail damage), Long Oars (+5 ft oar speed) |
| Weapon (one) | 2,500 gp | 1 week | Reinforced Frames (+2 weapon-component AC), Heavy Rounds (+1d4 damage) |
| Figurehead (one) | 2,000 gp | 1 week | pure prestige + one 1/voyage reroll of a hazard group-check die (the "luck" of a named ship) |
| Misc (any, each once) | 1,000 gp | 3 days | Smuggler's Hold (hidden cargo), Taskmaster's Drums (+5 ft oars for 1 hr/day), Comfortable Berths (shore-leave healing rate at sea, 1/voyage) |

Leaving port pauses work (gp never re-paid) — adopted. The magical upgrade tier
(Dragon Sails, Death Vessel, etc.) is **deferred with the T3/T4 content**: authored-
but-inert if we transcribe it, per the TIER-SCOPE authored-but-inert pattern.
Upgrades are codex facts on the ship record; the DM narrates them into scenes.

**The hold** = a storage inventory attached to the ship node (same instance-item
shapes as `ITEMS.md`), capacity-capped by the stat block's cargo tonnage. The ship
is where a T2 PC's accumulation problem gets solved — and where it all is when the
ship is at the bottom of the sea. **Boons matter because you can lose them.**

## 6. Main-world reuse — rivers, coasts, one small class

The same machinery serves the main world with **no new rules**:

- **River/coastal edges** are water edges on the main-world graph; any port/ferry
  node can host charter and shipwright services at its tier.
- **The keelboat is the main-world class** (3,000 gp, 3 crew, 72 mi/day): big enough
  for a crew cast and a hold, small enough that a mid-T2 PC can own one, legal on
  rivers/coastal water. The rowboat (50 gp) is the dinghy/crossing tool. Blue-water
  classes (sailing ship and up) exist in the main world at major coastal cities but
  are realm-flavored toward high-seas.
- **Hazard table swap by water type:** river/coastal days roll the same start-of-day
  d20 but on a **coastal hazard sub-table** (no open-ocean storms at full 10d10
  violence; sandbars, fog, river currents from the environs menu §8 of the gather).
  Open ocean uses the full table. One procedure, banded content — the standard
  Genesis pattern.
- The high-seas realm simply *defaults* to this system (its walks assume a ship the
  way land realms assume feet) and gets the richest encounter tables.

---

## Build units (Sonnet-executable, dependency order)

Each unit: spec section cited, acceptance criteria, red-first test (write the
failing assertion before the implementation). All per the 6-point rubric; every
module edit gates on `python3 build/check-manifest.py`.

**U1 — Ship data + registry** (`data/ships.js`; §1, §4)
Ship class defs: the 6 Saltmarsh blocks with v1's 4-component collapse (hull/helm/
movement/weapons w/ AC/HP/threshold), capacity, paces, prices, crew minimums,
action-count thresholds. Ship *instances* (id, class, name, provenance, components'
current HP, upgrades[], hold[], crew) stored on the world.
- *Accept:* `shipDef("sailing-ship")` returns verbatim-matching stats vs the gather;
  instance create/serialize round-trips through save/load.
- *Red-first:* assert galley hull HP 500/threshold 20 and warship price 25,000 before
  authoring the data.

**U2 — Crew model + quality derivation** (`src/world/ship-crew.js`; §2)
Officer seats bound to codex NPC ids; crew pool count; `crewQuality(ship)` derivation
with the full input table; `crew_morale` typed event registered in `DM_EVENT_FIELDS`
(normalization at the contract boundary, never in the handler); mutiny daily check +
`mutiny_started`/`mutiny_ended` events.
- *Accept:* quality clamps −10..+10; unpaid wages and casualties move it without any
  DM event; a DM `crew_morale` delta beyond ±1 is clamped by the fold layer.
- *Red-first:* assert quality of a fresh full crew = +4 + captain CHA mod; assert a
  handler-free path (removing the derivation input silently = test fails).

**U3 — Water edges + course charting** (extend `src/world/` travel; §3)
Edge `medium:"water"` (+ `waterType:"river"|"coastal"|"ocean"`) on the node-graph;
travel-time from ship pace; a ship instance can be `at` a node or `enRoute` on an
edge; charting = ordered edge selection with ETA.
- *Accept:* a 240-mi ocean edge = 2 days for a sailing ship, 2.5 for a warship
  (partial days round up per existing edge conventions); land walk machinery
  untouched (regression: existing travel tests green).
- *Red-first:* assert a water edge is refused without a ship and a land party.

**U4 — The sea-day procedure** (`src/engine/sea-day.js` + `passTime` hook; §3)
Start-of-day hazard d20 + type/DC rolls; encounter d20; the four-tier group check
assembler (officer slots + one crew-pool d20 + quality); per-hazard result
application (component damage, quality deltas, crew loss, direction loss); end-of-day
bosun repair; all riding the existing `restRiders`/`passTime("montage")` day tick.
- *Accept:* 10,000 simulated days ≈ 5% hazard rate, 10% encounter rate; storm Total
  Failure applies 10d10/component + −2 quality + 10% crew loss in one tick; PC rolls
  are accepted pre-rolled (never rolled for the player).
- *Red-first:* assert hazard fires only on nat 20 and both rolls can fire the same
  day.

**U5 — Ship acquisition + upkeep economy** (extend `src/engine/economy.js` wiring; §1)
Shipwright stock at coastal tier-2/3 nodes; buy/sell/charter events (previewBuy-style
validation); wage + port-fee riders on the daily stack; unpaid-wage debt fact feeding
U2's derivation.
- *Accept:* buy refuses on insufficient gold; sell = half, merchant-coin-capped;
  charter charges daily and stops accruing in port when dismissed.
- *Red-first:* assert a keelboat is NOT stocked at an inland city (coastal gate).

**U6 — Ship combat integration** (extend `src/engine/combat.js` seam; §4)
Ship as a side entity: DEX+quality initiative, naval range-band mapping, component
targeting with thresholds, action economy from live crew count, officer actions,
weapon attacks (PC-crewed uses the player's d20), crash resolution, boarding
transition to personal-scale combat on the deck host, `ship_wrecked` event.
- *Accept:* sub-threshold damage is ignored; hull 0 emits `ship_wrecked`; a crash
  into a same-size ship deals 16d10 on a failed DC 10 CON save and stops both;
  boarding hands off cleanly to the existing combat loop (one shared initiative).
- *Red-first:* assert a 15-damage hit on a threshold-20 galley hull changes nothing.

**U7 — Upgrades + the hold** (§5)
The rescaled upgrade ladder (slot limits, gp, in-port time with pause-not-refund),
hold inventory vs cargo tonnage, upgrade effects wired (hull ×1.5, +ACs, the
figurehead reroll).
- *Accept:* second hull upgrade refused; leaving port pauses the clock without
  re-charging; hold refuses past tonnage.
- *Red-first:* assert Reinforced Hull yields 450 HP on a 300-HP hull (×1.5, not ×2).

**U8 — Encounter + hazard content tables** (Engine markdown → compile; §3, §6)
`sea-encounter-t1` / `-t2` (T1 seeded from the Saltmarsh 1–4 table, T2 authored from
CR 5–10 aquatics), the coastal hazard sub-table, spice-banded per the table
standard, run through `dev/table-review.py`. **PROVISIONAL until Adam's craft pass**
(his tables are his).
- *Accept:* table lint green; no entry references CR > 10; band samples read at
  register per the 5-band-samples protocol.
- *Red-first:* verify guard asserting no T3+ creature id resolves from either table.

**U9 — DM contract + digest** (§ all)
`digest.ship` slice (position/ETA, quality, component state, active hazard, crew
roster handles), the new typed events registered end-to-end, DM-CHARTER-consistent
prose twins for every ship state change (text-first law), `dev/verify-bridge`-class
contract test.
- *Accept:* `node dev/verify-dm-events.mjs` green including the new events; a full
  voyage day renders as prose with no visual layer loaded.
- *Red-first:* assert `crew_morale` with alias/string-number payload folds correctly
  through `dmFoldPayload` (the HQ2-1 bug shape, pre-blocked).

Suggested waves: U1+U2 ∥ → U3 → U4+U5 ∥ → U6+U7 ∥ → U8+U9 ∥.

## Adam's rulings needed

1. **How lethal is the sea?** Spec keeps Saltmarsh storm violence verbatim (Total
   Failure = 10d10/component, 10% crew lost) — a T2 ship CAN be wrecked by weather
   alone. Recommend YES (hard-and-dangerous doctrine; the sea should be the one
   terrain that doesn't care about your level). Confirm or soften.
2. **Ship loss permanence.** Recommendation: wrecked = gone, hold and all (salvage
   only if the wreck site is reachable — depth rules make deep-ocean loss total).
   The boon matters because you can lose it. Confirm; also rule whether crew NPCs
   who die at sea are dead-dead (recommend yes, standard corpse rules — pending the
   parked corpse-channel fork).
3. **PC-as-captain vs hired captain default.** Spec lets the PC hold any officer seat
   they can plausibly fill. Rule: may a level-1 PC captain a keelboat solo (3-crew
   minimum unmet = degraded, not forbidden)?
4. **Mutiny ceiling.** Should a mutinous crew be willing to KILL the PC (full
   lethality) or default to marooning/imprisonment with kill as the high-band
   escalation? Spec recommends full lethality is on the table (CAL-1 posture).
5. **Price anchors** — confirm adopting raw Saltmarsh gp (§1 table) and the rescaled
   upgrade ladder (§5); both are economy-shaping numbers and that's Adam's ledger.
6. **Stolen-ship heat** — how hot? Recommend: recognition is a per-port DM
   interpretation off the engine's provenance fact, never auto-detected. Confirm.
7. **U8 table craft pass** — the encounter/hazard tables ship PROVISIONAL; schedule
   the hands-on pass (whole-corpus discipline applies).
