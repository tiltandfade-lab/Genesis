STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

---
type: spawnable-inventory
site: 8 — layered control (cross-host transform)
created: 2026-07-27
spec: ../SITE-8-LAYERED-CONTROL-SPEC.md
research: ../../Reference/Layered-Control-Study-0727/
feeds: the spawn-audit lane
---

# SITE 8 — SPAWNABLE CONTENT INVENTORY

Every concrete thing the Site 8 spec implies can **spawn in play**, mapped to the Engine table or
roller that would produce it — or marked `NO-TABLE-YET`.

## How to read the status column

| status | meaning |
|---|---|
| `LIVE` | a production code path calls this table/roller today; a named caller is cited |
| `AUTHORED-UNWIRED` | the table is compiled and active in the registry, but **no caller exists in `src/`** — evidence and candidate content, never current behaviour |
| `DERIVED` | not a roll; computed from live state (e.g. a renown score read against a threshold) |
| `NO-TABLE-YET` | nothing produces this; it is new work the transform requires |

**Verification method.** Table existence and row counts come from `table-registry.json`
(generated 2026-07-02) cross-checked against the compiled corpus by streamed scan / `grep -o`
occurrence count — **`tables.js` and `tables.json` were never Read wholesale.** Caller status comes
from `grep -rl "<table-id>" src/`. Where the registry and the compiled corpus disagree, the compiled
corpus wins and the disagreement is recorded.

**Registry caveat (load-bearing).** The registry snapshot is stale: it omits `Faction Outcome`
entirely, and `src/world/turn.js`'s own comments still describe that table as uncompiled. Both are
wrong — the table compiles and the transition engine runs. Any other row in this inventory marked
`AUTHORED-UNWIRED` on registry evidence alone should be re-probed before it is believed.

**Site 8 is a transform.** It spawns almost no *structures*. What it spawns is **claimants,
permissions, tells, evidence, schedules, states and situations** attached to a host's existing
nouns. That asymmetry is the point, and it is why the structures table below is the shortest one
here and the states table is the longest.

---

## 1. Claimants and occupants

| spawnable thing | producing table / roller | status |
|---|---|---|
| A named claimant faction with `dominant` flag, `agenda`, `method`, tags, clock | `SS.fAgenda` (d20) + `SS.fMethod` (d12) via `rollFaction` — `src/engine/world-gen.js:8`; ≥2 per world in 12/12 rolled worlds | `LIVE` |
| A second/rival claimant minted mid-campaign | `faction-outcome` d20 → `splinter` rows 12–13, via `turnFactionOutcome` — `src/world/turn.js` | `LIVE` (re-gated; the registry omits this table) |
| The dug-in urban claimant identity (Corrupt Guard, Foreign Spy Network, Dockside Enforcers, Street Gang, Shadow Cult, …) | `urban-threat-identity-t1` (d30) / `-t2` (d50) — `src/engine/walk.js:581`; 65 distinct values across 258 census walks | `LIVE` |
| The dug-in dungeon claimant identity | `dungeon-threat-identity-t1` (d30) / `-t2` (d45) | `LIVE` |
| The claimant's on-site contact / go-between | `urban-contact` (d200) — `src/engine/walk.js:350`, `:511`; `dungeon-contact` (d300); `wilderness-contact` (d500) | `LIVE` |
| The host's own responsible staff (proprietor, warden, foreman, steward) | typed kit proprietor roll — `data/building-kits.js` + `src/world/urban.js` lifecycle | `LIVE` |
| An NPC's declared tie to a claimant | `npc-faction-ties` (d100, 100 rows) — **no caller in `src/`** | `AUTHORED-UNWIRED` |
| A patron standing behind a claim | `patron-archetype` (d20, 20 rows) — **no caller in `src/`** | `AUTHORED-UNWIRED` |
| A faction scene during an urban walk segment | `urban-segment-faction-scene` (d20) — mapped from the "Faction Scene" and "Narrowing" segment kinds at `src/engine/walk.js:126` | `LIVE` |
| The ambient cast that does *not* take sides | typed-building ambient cast — `src/world/urban.js` | `LIVE` |
| A doorkeeper / recognition-holder occupancy anchor at a threshold | — | `NO-TABLE-YET` |
| A claimant's watch/lookout posted on the host's deck | — | `NO-TABLE-YET` |

---

## 2. Structures and spatial pieces

Deliberately short. Under the map-growth law the transform adds at most one appended strip, and only
under the overflow test.

| spawnable thing | producing table / roller | status |
|---|---|---|
| The host itself (tavern, mine, prison, monastery, works, frontage) | Place Spine archetype via `rollPlace` / `placeForRealm`; `data/building-kits.js` typed kits via `rollBuilding` | `LIVE` |
| The host's interior layout / notable feature / occupant seed | `building-interior` (d300) via `rollBuildingInterior` | `LIVE` |
| The urban district the claim may cover | `urban-district-type` (d20) via `mintDistricts` — `src/world/urban.js` | `LIVE` |
| A district record carrying a claimant **name** | `districtFactionHandle` — `src/world/urban.js:150`; **read-only, name string only, Chrome realm only** | `LIVE` (scope-limited) |
| A district record carrying a claimant in **any other realm** | — | `NO-TABLE-YET` |
| The appended strip (single-file back corridor / store) | — | `NO-TABLE-YET` |
| A partition run with door and hatch variants | — | `NO-TABLE-YET` |
| A galleried upper ring (shared-centre deck) | — | `NO-TABLE-YET` |
| A threshold scene frame | `urban-scene-frame` (d400) — `src/engine/walk.js:373`. The typed `urban-scene-frame-threshold` (d100) has **no direct caller** | parent `LIVE`; typed sub-frame `AUTHORED-UNWIRED` |
| A segment threshold | `urban-segment-threshold` (d20) — `src/engine/walk.js` | `LIVE` |
| An inherited regime boundary (slope, water line, tree line, road, existing wall) | host terrain and walk topology are `LIVE`; `urban-feature` (d100) itself has **no caller in `src/`** | terrain `LIVE`; `urban-feature` `AUTHORED-UNWIRED`; **boundary-with-an-owner** `NO-TABLE-YET` |
| A claimant-owned boundary that both parties recognise | — | `NO-TABLE-YET` |

---

## 3. Props, fixtures and decals

| spawnable thing | producing table / roller | status |
|---|---|---|
| A general interactable object in the space | `urban-interactable-object` (d300) — `src/world/wiring-a.js:367`; `wilderness-interactable-object` (d300); `dungeon-interactable-object` (d100) | `LIVE` |
| Set dressing and its condition | `urban-set-dressing` (d100) — `src/engine/walk.js`; `urban-set-dressing-condition` (d20) | `LIVE` |
| A sealed/locked thing and where its key is kept | `plot-lock` (d300) — `src/engine/codex-roll.js:524` (`sealed`, `keyKept`) | `LIVE` |
| A downtime ledger entry (debt, tab, service owed) | `downtime-ledger` (d100) — `src/world/dm.js`, `src/world/gap-wiring.js` | `LIVE` |
| **A two-owner fixture wrapper** (counter / store / cabinet / scale / tally board with a second book and a second permission) | — | `NO-TABLE-YET` |
| **A claim marker** (mark, counter-mark, chalk mark, cut tally, painted rule, seal, emblem panel) | — | `NO-TABLE-YET` |
| **A claim-marker socket** (a legal mount point on any surface) | — | `NO-TABLE-YET` |
| A signal device (bell, shutter, lamp, knotted cord, seat left empty) | — | `NO-TABLE-YET` |
| Scrip / token / chit as an exchange medium | economy layer exists (`src/engine/economy.js`) but has no alternate-medium concept | `NO-TABLE-YET` |
| A key/token custody chain | `plot-lock`'s `keyKept` is the nearest live fact; no custody chain exists | partial `LIVE` / chain `NO-TABLE-YET` |
| A threshold wear pattern (one party uses this door more) | — | `NO-TABLE-YET` |

---

## 4. Tells, evidence and knowledge

This is the section where the biggest *unwired* opportunity sits.

| spawnable thing | producing table / roller | status |
|---|---|---|
| The place's own secret | `place-secret` (d200) via `rollPlace` | `LIVE` |
| Rumour / intel picked up on a walk | `urban-rumor-intel` (d100) — `src/engine/walk.js:363` | `LIVE` |
| An NPC's flaw or secret | `npc-flaws-secrets` (d300) — `src/engine/codex-roll.js:315`, gated by `gate.flawSecret` | `LIVE` (gated) |
| An NPC's bonus secret | `npc-bonus-secret` (d100) — **no caller in `src/`** | `AUTHORED-UNWIRED` |
| **An urban secret, with tier, reveal type and payoff size** | `urban-secrets` (d98/50 rows) + `urban-secret-tier` (d20) + `urban-secret-reveal-type` (d20) + `urban-secret-payoff-size` (d6) — **none has a caller in `src/`** | `AUTHORED-UNWIRED` — **a complete four-table secrets subsystem, compiled and uncalled, and it is exactly what Site 8's tell/evidence obligation needs** |
| Dungeon secret type / tier / reveal / payoff | `dungeon-secret-type` (d8) + `-tier` (d20) + `-reveal-type` (d20) + `-payoff-size` (d6) — **no caller in `src/`**, the same condition as the urban quartet | `AUTHORED-UNWIRED` |
| A **visible tell** bound to a named surface or fixture id | — | `NO-TABLE-YET` |
| A **knowledge gate** binding evidence to a spatial home | — | `NO-TABLE-YET` |
| The claimant reveal flag (`f.known`) flipping | `src/world/dm.js:3563` + `reveal(w,'powers')` | `LIVE` |
| A consequence-of-being-watched effect | `watcher-effect-pool` (d8) — `src/engine/consequence.js` | `LIVE` |

---

## 5. Situations and hooks

| spawnable thing | producing table / roller | status |
|---|---|---|
| The opening tension that names a control conflict ("a blood-feud between families or quarters is turning open"; "a guild or cartel is tightening its grip on a vital trade"; "the dispossessed are organising toward revolt") | `pickTension` over `SS` pressures — `src/engine/world-gen.js:49` | `LIVE` |
| The PC's arrival standing (owed a favour / in their debt / stranger / wanted / watched or marked) | `SS.eStanding` via `rollEntry` — `src/engine/world-gen.js:100` | `LIVE` |
| The PC's inherited tie to a claimant | `rollFactionProximity` / `factionKind` — `src/engine/world-gen.js:57–76` | `LIVE` |
| A claimant transition event (advance / setback / splinter / merge / takeover / collapse) | `faction-outcome` (d20) via `turnFactionOutcome` — `src/world/turn.js` | `LIVE` |
| A two-thirds-full clock warning that a shift is coming | `src/world/turn.js:123` | `LIVE` |
| Exit state at a finale | `urban-exit-state` (d12) — `src/engine/walk.js:501`; `dungeon-exit-state` (d100) | `LIVE` |
| A generic urban problem / catalyst / revelation | `urban-problem` (d200), `urban-catalyst` (d200), `urban-revelation` (d20) | `LIVE` (walk assembly) |
| **A refusal at a threshold** (someone is not admitted, in public) | — | `NO-TABLE-YET` |
| **A recognition test** (are you known, vouched, marked?) | `DERIVED` from `w.renown.factions[slug].score` vs `HUNTED_AT = -6` plus entry `standing` — `src/world/reputation.js` | `DERIVED` (the state exists; **no situation consumes it at a threshold**) |
| **A schedule window changing which authority is in force** | — | `NO-TABLE-YET` |
| **A delivery that must not be seen** | — | `NO-TABLE-YET` |
| **A price or service that differs by recognition** | attitude-tinted pricing exists (`ecAtt`, `src/engine/economy.js:58`) but keys off per-NPC attitude, not faction recognition | partial `LIVE` / faction-keyed `NO-TABLE-YET` |

---

## 6. States (the transform's real output)

Per the spec §6.2, `layeredControl = true` is rejected. These are the factorized fields.

| spawnable state | producing source | status |
|---|---|---|
| `claimStrength` — latent / acknowledged / operative / dominant | derivable from `f.dominant` + clock fill; not modelled as a field | `NO-TABLE-YET` |
| `openness` — secret / signalled / open / declared | `f.known` is the nearest live fact (binary) | partial `LIVE` / four-state `NO-TABLE-YET` |
| `legitimacy` — criminal / customary / chartered / official | proposed as **derived from the rolled `method`** (spec Q3 recommendation); `SS.fMethod` is `LIVE`, the mapping is not | mapping `NO-TABLE-YET` |
| `recognition` — stranger / known / vouched / member / marked / hunted | `w.renown.factions[slug].score`, `HUNTED_AT`, epithets, plus `rollFactionProximity`'s member/tie | `DERIVED` from `LIVE` state |
| `scheduleState` — which authority is in force now | — | `NO-TABLE-YET` |
| `frictionState` — accommodated / strained / breached / hot | — | `NO-TABLE-YET` |
| `rungId` — `LC-0`…`LC-5` | — | `NO-TABLE-YET` |
| Access profile per semantic role | — | `NO-TABLE-YET` |
| Permission delta per semantic role | — | `NO-TABLE-YET` |
| Route owner and route-rank delta | — | `NO-TABLE-YET` (and gated on founder question Q2) |
| Deck owner | — | `NO-TABLE-YET` |
| Light owner | `urban-lighting` (d50/9 rows) exists but has **no caller in `src/`**; ownership is not a concept anywhere | table `AUTHORED-UNWIRED`; ownership `NO-TABLE-YET` |
| Capacity fact on a restricted threshold or strip | — | `NO-TABLE-YET` |
| Residue after demotion (changed access, a scar, an unexplained schedule) | — | `NO-TABLE-YET` |

---

## 7. Summary for the spawn-audit lane

**Counts across §§1–6, tallied from this file's own tables (71 rows):**
`LIVE` 29 · `NO-TABLE-YET` 29 · MIXED (partly live, partly missing) 7 · `AUTHORED-UNWIRED` 5 ·
`DERIVED` 1.

Folding the mixed rows in: **eight compiled-but-uncalled table families** that Site 8 would consume
(the urban secrets quartet, the dungeon secrets quartet, `npc-faction-ties`, `patron-archetype`,
`npc-bonus-secret`, `urban-lighting`, `urban-feature`, the typed threshold scene frame), and
**33 things nothing produces today**.

Three findings the audit should carry forward:

1. **Every claimant, transition, tension and recognition input Site 8 needs is already `LIVE`.**
   The transform does not need a claimant table, a rivalry table, or a transition table. It needs to
   *consume* the ones running today.

2. **Two complete secrets subsystems are compiled and uncalled.** `urban-secrets` (50 rows) plus
   `urban-secret-tier`, `urban-secret-reveal-type` and `urban-secret-payoff-size` have **no caller
   anywhere in `src/`** — and the dungeon quartet (`dungeon-secret-type` d8, `-tier` d20,
   `-reveal-type` d20, `-payoff-size` d6) is in exactly the same condition. Site 8's tell/evidence
   obligation (spec §4.2 items 4 and 5) is the natural consumer, and wiring it would cost nothing
   new to author. `npc-faction-ties` (d100), `patron-archetype` (d20), `npc-bonus-secret` (d100),
   `urban-lighting` (d50), `urban-feature` (d100) and the four typed `urban-scene-frame` sub-tables
   are also compiled with no direct caller. Whether any of this belongs to Site 8 or to a general
   wiring sweep is a scoping call for the audit lane, not a Site 8 ruling.

3. **All 33 missing things are the same kind of thing.** Access profiles, permissions,
   schedules, owners, capacities, tells-as-geometry, rungs and residue — every one is a *spatial or
   permissional* fact, and not one of them is a new noun, a new creature, or a new room. That is the
   shape of a **projection gap**, and it is the evidence behind the spec's central claim.

**Nothing in this inventory constitutes proof that Site 8 works.** It is a map of what the transform
would draw on and what it would have to build.
