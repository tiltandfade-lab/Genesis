STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

---
type: research-note
study: LAYERED-CONTROL-STUDY-0727 lane 3
status: EVIDENCE GATHERED 2026-07-27 — nothing here is ruled
method: source read of the built engine (`src/`, `data/`) plus a re-tally of the banked
  2026-07-26 intel evidence (`docs/intel/tiyl-raw.json`, `docs/intel/walk-census.md`,
  `docs/intel/marathon-spatial-mining.md`). `tables.js` / `tables.json` were never opened.
---

# Lane 3 — Engine audit: what already produces layered control, and what cannot express it

## 0. The finding in one sentence

**Site 8 is not a content gap. It is a projection gap.** The story engine already rolls, persists,
mutates and narrates layered control on every single world it creates; nothing anywhere in the
visual or spatial layer can express any of it.

That reframing is the most consequential result of this whole study and it changes what the site's
first build should be.

---

## 1. The eligibility predicate is satisfied by 100% of rolled worlds

The DESIGN.md ruling requires (a) at least two persistent simultaneous claims and (b) a
consequential difference in at least one control dimension.

Re-tallying the twelve real TIYL starts in `docs/intel/tiyl-raw.json`:

- **Factions per world: 12/12 worlds have ≥2. Range 2–4, mean 2.92.** Each faction carries a
  `name`, a `dominant` flag, an `agenda` and a `method`.
- **The `method` field is a control-dimension roll in all but name.** Across the 35 factions in the
  batch: faith and persuasion ×5, commerce and debt ×5, coercion and made examples ×4, marriage and
  blood-ties ×4, rumour and propaganda ×4, sabotage and accidents ×3, smuggling and the black
  market ×3, open force ×2, law/charters/bureaucracy ×2, infiltration and spies ×2, ritual and the
  occult ×1. **21 of 35 (60%) are parallel-authority or covert methods** — precisely the LC-2/LC-3
  material.
- **`agenda` supplies the claim target.** "Seize control of a vital resource" ×5, "widen its
  territory or reach" ×4, "impose its creed, law, or taboo on everyone" ×4, "break, absorb, or
  outlast a rival" ×3, and the full `SS.fAgenda` d20 also carries **"control who comes and goes"**
  — a literal access-control claim.
- **The PC arrives already inside the layering.** Entry `standing` across the 12: owed a favour ×4,
  in their debt ×4, a stranger ×2, wanted ×1, watched or marked ×1. **10 of 12 (83%) begin with an
  asymmetric relationship to a named power.**
- **The opening tension is a layered-control statement in at least 5 of 12.** "A blood-feud between
  families or quarters is turning open" ×3, "the dispossessed are organising toward revolt" ×1,
  "a guild or cartel is tightening its grip on a vital trade" ×1. Tension `kind` was internal in
  10/12.

Sources for the rolls: `src/engine/world-gen.js` (`rollFaction` at line 8, `factionKind` at 61,
`rollFactionProximity` at ~70, `pickTension` at 49, `rollEntry`'s standing/bundle at 99–148),
`data/starting-state.js` (`SS.fAgenda` d20, `SS.fMethod` d12, `SS.eStanding`).

---

## 2. The transform's transition machinery is ALSO already live

This was the surprise. `src/world/turn.js` implements `turnFactionOutcome(w, factionName)` — fired
when a faction's agenda clock fills — which rolls the `faction-outcome` table and then **really
mutates the world**:

| outcome | mutation |
|---|---|
| `advance` | permanent canon mark; the faction re-rolls a fresh agenda and keeps its identity |
| `setback` | clock resets; `method` re-rolls (hardens) |
| `splinter` | a new rival faction is minted off `SS.f*` and pushed into `w.factions`; the parent loses a tag |
| `merge` | the weakest rival is absorbed and removed from `w.factions` |
| `takeover` | the `dominant` flag moves from one faction to another |
| `collapse` | the faction is removed; its codex record is set to `condition:"historical"` |

That is a complete **control-transition engine** — the ontology §5.3 requirement for "transition
triggers and legal outcomes" — with ledger entries and codex updates, gated behind the usual reveal
arc.

### 2.1 Is it actually live? — a re-gate, because two artefacts say it is not

`src/world/turn.js:11` states *"Tables `place-drift` / `npc-life-event` / `faction-outcome` are NOT
YET COMPILED"*, and line 239 repeats *"faction-outcome isn't compiled — degrades to a no-op
(logged)"*. `table-registry.md` and `table-registry.json` (both generated **2026-07-02**) list
`Faction - Basic` and `Patron Archetype` under **Factions** and **do not list `Faction Outcome` at
all**. On that evidence the transition engine would be inert.

**Both artefacts are stale.** Verified without opening either generated file wholesale:

- `Engine/03. _Tables/02. Social/Factions/Faction Outcome.md` exists as source, `id: faction-outcome`,
  `table_class: Fork`, d20, 20 rows, with the Outcome column's first word documented as the literal
  machine key the `switch` matches.
- A streamed scan of `tables.json` (never a full Read) finds the compiled record:
  `"faction-outcome": { "dice":"d20", "die":20, "class":"Fork", "player_facing":"plumbing",
  "domain":"Social / Factions", "rows":[…] }`, with row 1's `cells[0]` = `"advance"` — exactly the
  shape `turnFactionOutcome` reads.
- Occurrence counts in `tables.json` (`grep -o`): `faction-outcome` 1, `place-secret` 1,
  `urban-segment-faction-scene` 1, `urban-threat-identity-t1` 1, and a control string that does not
  exist returns 0.

**Conclusion: the faction-transition engine is LIVE end-to-end.** The null-safe branch is no longer
the live branch.

**Two stale artefacts recorded as findings, not fixed here** (out of this lane's scope):
1. `table-registry.{md,json}` is a 2026-07-02 snapshot and under-reports the compiled corpus.
2. `src/world/turn.js`'s header and inline comments still describe `faction-outcome` as uncompiled,
   which would mislead the next auditor into calling a live subsystem inert.

`src/world/turn.js:123` also binds a two-thirds-full faction or pressure clock into the turn, so
the approach of a control shift is already a readable world state.

---

## 3. Recognition profiles are already live too

`src/world/reputation.js` maintains `w.renown = { factions:{slug:{score,epithets:[]}}, regions:{…} }`
with:

- `RENOWN_STEP = 2` — score points per ±1 opening-attitude rung;
- `HUNTED_AT = -6` — at or below this score the PC is **hunted by that faction**;
- `RENOWN_FADE = 0.9` per in-world month with `RENOWN_ZERO = 0.5` snap-to-zero, and permanent
  epithets minted above a level-scaled magnitude;
- witness inference (co-located codex NPCs, an inhabited node, or a foe that fled alive), with the
  DM able to override per event.

`src/world/companions.js:59` already reads `repuOf(w).factions[fk]` to bias a companion's opening
attitude. `src/engine/codex-roll.js` carries a separate per-NPC/creature `attitude` rung clamped to
[-2, 2], and `src/engine/economy.js` tints prices by it.

**So the "claimant and recognition profiles" the transform must contribute (ontology §5.3) exist
as a live, decaying, witnessed, per-faction score with a named hostile threshold.**

---

## 4. What is missing — and it is entirely spatial

Every one of the following is absent. This list is the actual scope of Site 8's build.

| required by the ruling / ontology §5.3 | status today |
|---|---|
| claimant and recognition profiles | **LIVE** (`w.renown.factions`, faction `dominant`, entry `standing`) |
| transition triggers and legal outcomes | **LIVE** (`turnFactionOutcome`, faction clocks) |
| claim targets and affected semantic roles | **PARTIAL** — `agenda` names the target in prose; no semantic role is ever bound to it |
| access, schedule, service, custody and information deltas | **ABSENT** — no access profile, schedule or permission object exists anywhere in the codebase |
| sparse occupation zones and fronts | **ABSENT** |
| visible tells, secret evidence, knowledge gates | **PARTIAL** — `place-secret` is `LIVE` through `rollPlace`, and factions have a `known` reveal flag; neither is spatially homed |
| newly required spatial obligations | **ABSENT** |

The one place a faction touches geography today is `districtFactionHandle(w)` in
`src/world/urban.js:150`, which picks an existing `w.factions` entry's name for a district record —
and its own comment is scrupulous about what it is not: *"This is NOT new faction plumbing — no
faction is created, assigned, or mutated here, only read."* It is also **gated to the Chrome realm
only** (`realmId === "chrome"`); every other realm's district record carries no faction field at
all, deliberately, to keep pre-change records byte-identical.

**So the single existing semantic hook between a claimant and a piece of ground exists in exactly
one realm, is read-only, and carries a name string and nothing else.**

---

## 5. The occupancy roster is live and it is enormous

The walk census (`docs/intel/walk-census.md` §2b) tallied `threat.id` — the "who is dug in here"
field — from 1,050 real walks:

- **Urban: 65 distinct threat identities across 258 walks**, a very flat tail (top value 4.0%).
  Named values include Corrupt Guard, Foreign Spy Network, Street Gang, Shadow Cult, Dockside
  Enforcers, Enchantment Ring, Religious Fanatic Sect, Necromancer Cells, Fey Court in the City.
- Dungeon: 29 distinct across 253 walks.

Rolled by `rollUrbanWalk` from `urban-threat-identity-t1` / `-t2` (`src/engine/walk.js:581`), tier
aware. **At least a third of the urban roster reads natively as a second claimant over a host rather
than as a monster to fight** — Corrupt Guard is the host's own enforcement turned; Foreign Spy
Network is the Kontor case; Dockside Enforcers is the company-store case; Street Gang is the
default tavern case.

The transform therefore does not need a claimant table. It needs to consume the one that exists.

---

## 6. The Underworks misclassification

The census mapped **Underworks — 27 of 258 urban arrivals, 10.47%** — to Site 8, with the honest
note: *"sewers read as the concealed-layer condition, not a standalone noun."* Meanwhile the same
census left **Infrastructure Hub — 35 of 253 dungeon arrivals, 13.83%** — UNMAPPED, describing it as
*"aqueduct/utility hub … functionally a city-utility space, not extraction/craft."*

Read side by side these are **the same host program — city utility substrate — split across two
walk tables**, one of them parked on Site 8 only because Site 8's old name was
"Infiltrated/Layered" and sewers feel concealed.

That is a classification error, and correcting it matters in both directions:

1. Site 8 should **not** claim Underworks as a noun. Under the 2026-07-26 ruling a transform never
   owns a district type. Underworks is a host that layered control is unusually likely to be
   *applied to*, which is a different statement.
2. The settled-life program (`SETTLED-LIFE-SITES-PROGRAM.md` §2.3) has a bin-(a) candidate it has
   not named: an **urban infrastructure / utility-substrate host** worth 10.5% of urban arrivals
   plus 13.8% of dungeon arrivals. That is a larger demand signal than several numbered hosts.

Neither statement is ruled here; both are raised as founder items rather than edited into the
catalog, which this lane does not touch.

---

## 7. Play evidence: pervasive in fiction, absent from every map

`docs/intel/marathon-spatial-mining.md` records **zero** Site 8 appearances across the 2026-07-07
marathon — "no scene in any of the 11 files reads as a … Infiltrated/Layered site … which is itself
the finding."

That count is correct *as a site count* and misleading as a demand signal. Sella Voss's entire
campaign is a covert-allegiance arc: a targeted grep of the transcripts finds the mole/dead-drop/
chalk-mark/Sunn vocabulary in 6 of the 11 set files, concentrated in set-09 (27 hits), set-01 (21),
set-07 (21) and set-03 (12). The marathon's own ledger includes the Miller's Leat dead-drop, a
stakeout post chosen for a clean line on a specific door, a scored-and-struck-through tally cut into
the Traitor's Tree, a courier chit, a decoy shutter, and "his eye rakes your row and finds nothing
worth a chalk-mark."

**Every one of those is a layered-control tell, and not one of them ever became geometry.** The DM
invented each on the spot as prose. That is precisely what a projection gap looks like from the
inside: the fiction is saturated, the map is empty.

---

## 8. Honest source classification for the working spec

Using the ledger's status vocabulary (`GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md`):

| source | status | contribution to `LayeredControl` |
|---|---|---|
| `data/starting-state.js` `SS.fAgenda` / `SS.fMethod`; `src/engine/world-gen.js` `rollFaction` | `LIVE` | ≥2 persistent claimants per world with agenda + method |
| `src/engine/world-gen.js` `rollFactionProximity` / `factionKind` | `LIVE` | the PC's own tie to a claimant |
| `src/engine/world-gen.js` `rollEntry` `standing` (`SS.eStanding`) | `LIVE` | the arriving recognition asymmetry |
| `src/engine/world-gen.js` `pickTension` | `LIVE` | opening tension, frequently a control statement |
| `src/world/turn.js` faction clocks + `turnFactionOutcome` | `LIVE` | promotion/demotion transitions with real mutation |
| `src/world/reputation.js` `w.renown.factions` | `LIVE` | per-faction recognition score, hunted threshold, epithets |
| `src/world/codex.js` faction entities; `src/world/dm.js` `powers` + `f.known` | `LIVE` | claimant identity, reveal gating, DM surface |
| `src/engine/walk.js` `urban-threat-identity-t1/t2` | `LIVE` | 65-value urban claimant roster |
| `src/world/urban.js` `districtFactionHandle` | `LIVE` **but Chrome-realm only, read-only, name string only** | the single existing claimant↔ground link |
| `rollPlace` `place-secret` | `LIVE` | the secret a knowledge gate would hide; not spatially homed |
| `data/building-kits.js` typed kits; `building-interior` d300 | `LIVE` | the hosts the transform rides |
| Access profiles, schedules, permissions, claim zones, fronts, tells-as-geometry | **`TARGET-ADAPTER`** | does not exist |
| `LayeredControl` delta compiler over a `SemanticSitePlan` | **`TARGET-ADAPTER`** | does not exist |

**Nothing in this table may be described as proving Site 8.** The live half is the *inputs*. The
transform itself is unbuilt, and its `RESEARCHED` gate is the only one this study can move.
