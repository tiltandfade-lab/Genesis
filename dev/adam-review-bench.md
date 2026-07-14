---
type: reference
project: Genesis
status: review-bench — read top to bottom, answer each card's question, done
created: 2026-07-03
related:
  - "[[DIRECTION]]"
  - "[[TABLE-EDIT-SAFETY]]"
  - "[[table-lint-baseline]]"
  - "[[TABLE-USAGE-AUDIT]]"
---

# Adam's Table Review Bench — Batch B (2026-07-03)

**What this is:** DIRECTION §6 Batch B, compressed. Three things Adam needs to rule on: the
634 duplicate-row lint warnings, the 38 provisional table files, and the In-Building
Complications linter conflict. Everything below is **read-only research** — nothing in
`Engine/` was touched to build this bench, and nothing here applies a change. Every card ends
in a question with a **default** — if you say nothing, the default happens eventually, but
nothing here auto-executes; these are calls for you to make, not actions already taken.

**How to use it:** read top to bottom. Section 1 is one sitting (~10 min) — 11 clusters, mostly
one-word calls. Section 2 is the long pole (~35–40 min) — 38 cards, ordered so the tables that
actually fire in play come first and the ones nobody's rolled yet come last; skim the ones
whose disposition already looks obviously right and slow down where the sample rows raise your
eyebrow. Section 3 is two options and a recommendation (~5 min).

---

## 1. The dup-row 634, clustered

**The honest headline: all 634 are the SAME kind of finding — a table where a category
deliberately spans multiple roll numbers (frequency-weighting) or a bank cycles its full
palette more than once to fill a wide die.** `lint-tables.py` already treats this check as
WARN-only *by design*, because the linter's own author-comment says duplicate rows are "often
legitimate (a repeated outcome deliberately weighted across multiple die faces)... never hard-
failed because the legitimate case is common." Having gone table-by-table, that default read
holds up: I found **zero clear true-dups** in the 634, one cluster I'm genuinely unsure about,
and ten clusters that are unambiguous by-design weighting.

| # | Table | Warnings | Example row A | Example row B | Disposition |
|---|---|---:|---|---|---|
| 1 | `Dungeon Loot - Junk.md` | 258 | Roll 1: *Rusted Nail — A bent, orange-flaked nail. Good for leaving a trail.* | Roll 20: same text (Rusted Nail spans rolls 1–20 of a d300; Ceramic Shard spans 21–33, etc.) | `band-weighting (rows repeat by design — linter should allow)` |
| 2 | `NPC Race Weighted.md` | 81 | Roll 1: *Human (Lowlander): The most common humans on the frontier coast...* | Roll 15: same text (Lowlander spans 1–15/100; a d100 demographic-frequency table) | `band-weighting (rows repeat by design — linter should allow)` |
| 3 | `Urban Dressing Mega Table.md` | 79 | d20 Air Currents roll 8: *"still"* | Roll 13: same (still spans 6/20 — the most common ambient air state; a "roll 6× to dress the scene" bank) | `band-weighting (rows repeat by design — linter should allow)` |
| 4 | `NPC Role.md` | 62 | Roll 1: *Farmer or Grower — Tied to land quality and seasons.* | Roll 6: same text (Farmer spans 1–6/100; another d100 demographic-frequency table) | `band-weighting (rows repeat by design — linter should allow)` |
| 5 | `Dungeon Loot - Minor Resource.md` | 57 | Roll 01: *Potion of Healing — Regain 2d4+2 HP...* | Roll 18: same text (Potion of Healing is the deliberately-common early-tier find) | `band-weighting (rows repeat by design — linter should allow)` |
| 6 | `Wilderness Footing.md` | 39 | Roll 002 (of a d200): *Springy Turf / Tundra Moss — 100% of Area — Normal Movement. Tracking DC 15* | Roll 042: byte-identical (the whole 1–40 "Normal Movement" palette repeats verbatim at 41–80 to fill the die) | `band-weighting (rows repeat by design — linter should allow)` |
| 7 | `NPC Influence Weight.md` | 14 | Roll 1: *1 — Personal Only — Affects only themselves or immediate relations.* | Roll 7: same text (a d20 collapsed to 6 named tiers — the table-lint-baseline's own named example) | `band-weighting (rows repeat by design — linter should allow)` |
| 8 | `Wilderness Encounter Type.md` | 14 | Roll 2: *Trap / Barrier (Lock)...* | Roll 4: same text (Trap spans 2–4/20; Social spans 5–8; Hazard spans 10–14 — an encounter-type frequency curve) | `band-weighting (rows repeat by design — linter should allow)` |
| 9 | `Dungeon Encounter Type.md` | 13 | Roll 1: *Enemy / Faction Encounter* | Roll 4: same (Enemy spans 1–5/20; Problem spans 6–9; Hazard 10–12 — same pattern as #8) | `band-weighting (rows repeat by design — linter should allow)` |
| 10 | `Urban Interactable Object.md` | 11 | Roll 187: *Iron Portcullis Winch — Access — Hazard — Loud — Obvious — Mundane* | Roll 268: same name AND same 5 metadata columns, ~80 rolls later, inside a 300-row bank where names are otherwise near-unique | `unsure` |
| 11 | `Travel Event Type.md` | 6 | Roll 1: *Landmark* | Roll 2: same (Landmark/Threat/Complication each span 3/12 — a category-frequency table) | `band-weighting (rows repeat by design — linter should allow)` |

**Why #10 is the one `unsure`:** every other cluster is either a named-category table where the
category is *supposed* to repeat (demographic/encounter-type frequency curves) or a short ambient
bank that's *supposed* to cycle (dressing tables, footing's full-palette repeat). `Urban
Interactable Object` is different in kind — it's a d300 of individually-flavored, mostly-unique
named props (300 rows, each trying to be its own little detail), and roughly 9 of them reappear
verbatim ~80–100 rolls apart (`Iron Portcullis Winch`, `Shattered Mirror`, `Alley Belfry`, `Caged
Floating Orb`, `Fountain of Clear Water`, `Suspended Cargo Net`, `Stray Draft Horse`, `Pile of
Discarded Armor`, `The Monolith Chunk`). That COULD be deliberate pacing — the same standout prop
resurfacing as a recognizable set-piece across a big city — or it could be a copy-paste slip from
an authoring pass that ran out of fresh d300 ideas near the end. I can't tell which from the text
alone, and I'd rather flag it honestly than guess. **Recommended default if Adam doesn't weigh
in: leave it (it's WARN-only and low-stakes either way), but it's worth 2 minutes of Adam's eyes
specifically — it's the one cluster where "leave it" is a judgment call, not an obvious read.**

**Tally:**

| bucket | clusters | of 634 warnings |
|---|---:|---:|
| `true-dup (fix)` | 0 | 0 |
| `intentional-echo (linter should allow)` | 0 | 0 |
| `band-weighting (rows repeat by design — linter should allow)` | 10 | 623 |
| `unsure` | 1 | 11 |

**The single linter change (if any):** none needed. `lint-tables.py`'s duplicate-row check is
already WARN-only and already never fails the gate (`python3 build/lint-tables.py` with no flags
exits 0 with these 634 present — confirmed by re-running it fresh today). The check is doing
exactly its documented job: surfacing the pattern for a human to glance at, never blocking. If
you want less noise in future `--warn-only` runs, the only lever is per-table suppression (same
mechanism as the In-Building Complications question in §3) — but nothing here is costing you
anything today. **Recommendation: no linter change for the dup-row check specifically.**

---

## 2. The provisional files, one card each

**Honest count: 38 files carry a `PROVISIONAL — Adam spot-check pending` (or equivalent) callout
in `Engine/03. _Tables/`** — matches DIRECTION §6 and HANDOFF's "38 flagged files" exactly; I
found it by grepping the corpus directly rather than trusting either doc's number, so this is a
verified count, not a repeated claim.

**Ordering:** by how often the table can actually fire in a live session, most-frequent first,
verified against the wiring code (`src/world/*.js`, `src/engine/*.js`), not just
`docs/TABLE-USAGE-AUDIT.md` alone — that audit's static scanner misses tables reached through
dynamic `rollTable("walk-skin-"+envKind)`-style calls, so I cross-checked every "Oracle-only" hit
against a direct grep before trusting it. One real miss found and corrected: the audit's cached
copy showed In-Building Complications as a stale 5-row d20; the actual file (and the compiled
`tables.json`) is a d100/100 rows — the wiring verdict (Oracle-only) was still right, just the
row-count was stale. Four tiers:

- **Tier A — fires on essentially every walk segment or every scene of its kind** (walk skins,
  which color every wilderness/dungeon/urban walk; character/world creation, guaranteed once
  per PC/world).
- **Tier B — fires on a frequent structural trigger** (revisit-after-absence, first-touch of a
  region, a fired faction clock — common, but not every single turn).
- **Tier C — fires on a specific in-fiction precondition** (you have to be in a chase, at a
  shrine, mid-downtime, or specifically inside the rare "breach" tail of a walk roll).
- **Tier D — Oracle-only, no auto-trigger found anywhere in the codebase.**

### Tier A — fires on nearly every walk / every world

**1. `Engine/03. _Tables/03. Session Mechanics/Walk Skin - Wilderness.md`**
Sets the one wide-angle mood that colors every wilderness walk segment (`rollWalkSkin`, called
once per walk). d100, Commitment ceiling, 66/20/9/4/1 band split.
- Low (Grounded, roll 1★): *"Late-season rot. Every deadfall is soft, every ford swollen; the
  trail knows it's October. (Footing rolls where there was footing; smells of wet bark and
  mushroom.)"*
- Mid (Textured, roll 77): *"A faction's supply cache, half-hidden. Oilcloth-wrapped stores
  tucked under a deadfall, marked with a sigil, clearly meant to be found only by the right
  eyes."*
- High (Mythic, roll 100): *"The forest remembers being an ocean. Fish-shadows school between
  the trunks at dusk; drowned bells toll from under the roots; things surface."*
**Q: bless as-is, or needs the craft pass?** (Default: bless — the ★-anchor rows are your own
approved samples verbatim, and the sampled register holds all the way up.)

**2. `Engine/03. _Tables/03. Session Mechanics/Walk Skin - Urban.md`**
Same mechanism, urban lane. d100, Commitment ceiling.
- Low (Grounded, roll 1★): *"Market-day crush. Carts locked axle-to-axle, tempers short,
  watchmen bored, pickpockets fat. Everything takes twice as long and costs a little more."*
- Mid (Textured, roll 77): *"The city gate logs are being audited, unusually. Clerks
  cross-checking names against something, and travelers who arrived recently are being quietly
  asked to confirm their business again."*
- High (Mythic, roll 100): *"The district's reflection runs a day ahead. Windows show tomorrow's
  street; some people check them like almanacs; the glazier is very rich and very afraid."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**3. `Engine/03. _Tables/03. Session Mechanics/Walk Skin - Dungeon.md`**
Same mechanism, dungeon lane. d100, Commitment ceiling.
- Low (Grounded, roll 1★): *"Water got in decades ago. Rust-bloom on every hinge, doors swollen
  shut, the deep smell of wet stone. What iron remains is not to be trusted."*
- Mid (Textured, roll 77): *"The dungeon's deepest chamber has fresh candlelight. A steady glow
  visible from the corridor above, in a room that should be pitch dark and undisturbed — someone
  is down there right now, or was moments ago."*
- High (Mythic, roll 100): *"Time pools in the deep rooms. Torches burn backward toward their
  lighting; your footprints arrive before you do; the deepest room is earlier than the door."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**4. `Engine/03. _Tables/04. Character Genesis/Genesis Backgrounds.md`**
Wired directly in `srd-creator.js` — every new character rolls one of these. **Narrow the ask:**
only the "I became…" d12 sub-tables (12 of them, one per background) carry the PROVISIONAL flag
— the mechanical packages table above them (feats/abilities/skills/tools) is unmarked and
settled. Rows 1–6 of each are your own hand-authored text, byte-untouched; 7–12 are new.
- Low (Bog-Iron Digger, row 1, your original): *"I was born to the peat and the rust; the mine
  was the only inheritance my family had."*
- Mid (Bog-Iron Digger, row 7, new): *"My father's lungs went black with the dust; I dig anyway,
  because the alternative is starving clean."*
- High (Bog-Iron Digger, row 12, new): *"The peat took my brother whole, no body to bury — I dig
  so there's always a chance I'll find him."*
**Q: do the new rows 7–12 match your rows 1–6's register, across all 12 backgrounds — or does
one background's new half read off?** (Default: bless — the sampled pair reads seamless; only
worth a full pass if one background snags your eye.)

**5. `Engine/03. _Tables/01. World Building/Place Generation/World Name Patterns.md`**
Wired in `src/creator/world-name.js` — the world-creation screen and PC-naming step both roll
here, once per world, three-option-pick + reroll + free-text-always-wins. d20, Spark ceiling.
- Low (roll 1): *`«root»'s «noun»` → "Varnic's Hollow"*
- Mid (roll 11): *`«geography»'s «root»` → "Downs' Farzad"*
- High (roll 20): *`«root»-«culture-root»` → "Vanh-Choru"*
**Q: bless as-is, or needs the craft pass?** (Default: bless — it's mechanical-register by
design, per its own frontmatter; there's no "mythic" tier to over-reach here.)

### Tier B — fires on a frequent structural trigger (revisit, first-touch, fired clock)

**6. `Engine/03. _Tables/03. Session Mechanics/Place Drift.md`**
Rolled on every revisit-after-absence (`turnDriftOnRevisit`, `WORLD-TURN.md` §2) — what changed
at a known place while you were gone. d100, Commitment ceiling. **Note:** this is also the OTHER
file the linter flags with hard-ERROR band dips (6 isolated dips, per `table-lint-baseline.md`)
— not part of Batch B's dup-row question, but worth knowing it's in the same boat as In-Building
Complications for §3's fix.
- Low (Grounded, roll 1★): *"Prices crept. The ferryman's rate is up two coppers and he blames
  the season; the inn repainted its door; someone you knew by face has moved on."*
- Mid (Textured, roll 77): *"The town's watch has new orders that don't sit right. Enforcement
  priorities have shifted, and the ones being watched most closely have changed since you
  left."*
- High (Mythic, roll 100): *"The river changed its bed and took half the town's foundations with
  it. Streets that led to the water now lead to dry stone; the old dock district has resettled a
  quarter-mile downhill..."*
**Q: bless the content, and separately — fix the 6 band-order dips now or batch them with
In-Building Complications's fix in §3?** (Default: batch them — same fix, same session.)

**7. `Engine/03. _Tables/03. Session Mechanics/NPC Life Event.md`**
Rolled per known NPC on revisit after 14+ elapsed days (`WORLD-TURN.md` §4) — known faces live
and die offscreen. d100, Commitment ceiling.
- Low (Grounded, roll 1★): *"Prospered, modestly. A better stall, a second apprentice, a new
  coat. They remember what they owe you and mention it first."*
- Mid (Textured, roll 77): *"Was quietly recruited as an informant. Passing word to someone with
  power, in exchange for protection or coin, and increasingly uneasy about how deep it's
  gotten."*
- High (Mythic, roll 100): *"Died — and attends their own grave. Seen at dusk, unaging, polite,
  refusing all questions. The priest has stopped charging the family for candles."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**8. `Engine/03. _Tables/02. Social/Factions/Faction Outcome.md`**
Rolled whenever a faction's agenda clock fires (`turnFactionOutcome`, `WORLD-TURN.md` §3) —
**mechanically load-bearing**: the Outcome column's first word (`advance|setback|splinter|merge|
takeover|collapse`) is the literal switch key the code matches on, so this one's lower
voice-criticality but higher mechanical stakes than most on this list. d20, Fork.
- Low (roll 1): *"advance — The agenda is achieved outright; the clock maxes and a new agenda is
  rolled — identity persists, ambition doesn't stand still."*
- Mid (roll 11): *"setback — A resource the plan depended on dries up, is seized, or simply stops
  arriving; the clock resets while it's replaced."*
- High (roll 20): *"collapse — It doesn't die so much as get absorbed into the ordinary
  background of the place — no funeral, just fewer and fewer people still using the name."*
**Q: bless the prose — and separately, does the fixed 6-word outcome vocabulary
(advance/setback/splinter/merge/takeover/collapse) cover every faction shape you want, or is a
7th outcome missing?** (Default: bless both; flag a 7th outcome only if a specific faction shape
comes to mind.)

**9. `Engine/03. _Tables/01. World Building/Place Generation/Region Identity.md`**
Rolled once, write-once, the first time a walk/node lands in an untouched region — locks a name +
one-line character + a mechanical flavor vector, canon from the moment it's rolled. d100,
Commitment ceiling — the highest-stakes voice table on this list next to Distant Word, since it's
permanent the instant it fires.
- Low (Grounded, roll 1): *"The Weeping Downs ★ — Barrow-country that never dries; the dead are
  neighbors here, salt is courtesy, iron is rude."*
- Mid (Textured, roll 77): *"The Bonewater Fens — Wetland where old battle-dead surface, gently,
  on their own schedule; burial here is a working profession."*
- High (Mythic, roll 100): *"The Godsgrave Reach — Farmland plowed, unremarked, over the buried
  shape of something too large to have ever been alive by any ordinary account."*
**Q: bless as-is, or needs the craft pass?** (Default: bless — but this is the one worth a
slower read given it's permanent-on-roll; skim isn't really enough here.)

### Tier C — fires on a specific in-fiction precondition

**10. `Engine/03. _Tables/03. Session Mechanics/Walk Breach - Wilderness.md`**
Rolled only from the HIGH tail of the walk-skin 2d10 bell — a rarer doorway into another realm
entirely. d20, Commitment ceiling, band floor at Strange.
- Low (Strange, roll 1★): *"The Black Shore — black sand to the horizon, a field of roses inland,
  and a tower on the skyline no matter which direction you face. Distances here are promises,
  not measurements."*
- Mid (Strange, roll 8): *"The Long Siege Line — earthworks and gun-pits run the length of a
  valley that was never a battlefield in this world; the trenches are freshly dug and utterly
  silent."*
- High (Mythic, roll 20): *"The Interior — the land around you is memory, warm and specific: this
  valley is a mind, and the world already knows whose... the deepest place is the thing they
  never told anyone, and leaving it changes what everyone who knows them will ever be to each
  other again."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**11. `Engine/03. _Tables/03. Session Mechanics/Walk Breach - Urban.md`**
Same mechanism, urban lane. d20, Commitment ceiling.
- Low (Strange, roll 1★): *"The Rain Quarter — a district where it is always night, always
  raining, and every light is a colored sign for something illegal; everyone owes somebody, and
  newcomers' debts get assigned. Guns here, not wands."*
- Mid (Strange, roll 8): *"The Salvage Row — a strip of shopfronts built entirely from a fallen
  warship's hull-plate, still faintly warm..."*
- High (Mythic, roll 20): *"The Interior — the city block around you is memory... every storefront
  binds one true thing about them..."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**12. `Engine/03. _Tables/03. Session Mechanics/Walk Breach - Dungeon.md`**
Same mechanism, dungeon lane. d20, Commitment ceiling.
- Low (Strange, roll 1★): *"The Preserve — a humid garden under a false sky, trails mown to
  invite; polished trophies hang at intervals, arranged by kill difficulty. Something invisible
  keeps score, and your entrance was scored."*
- Mid (Strange, roll 8): *"The Rehearsal Hall — a backstage warren of mirrors and half-built
  sets; a director's chair faces an empty stage, and the script pinned to it has your names
  already in the cast list."*
- High (Mythic, roll 20): *"The Interior — the walls are memory... this dungeon is a mind, and
  the world already knows whose."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**13. `Engine/03. _Tables/03. Session Mechanics/Walk Nightmare - Wilderness.md`**
Rolled only from the LOW tail of the same bell — the wild at its most indifferent. d20,
Commitment ceiling.
- Low (Textured, roll 1★): *"The Overgrazed Range — every pasture for a day's ride has been
  stripped bare, fences down, and no one has seen the herd that did it, only the tracks
  leaving."*
- Mid (Textured, roll 2): *"The Long-Unlit Waystones — the trail's mile-markers used to carry
  lanterns; every one is dark now, wicks gone, and the last traveler's log entry just says
  'don't relight them.'"*
- High (Mythic, roll 20): *"The Interior (Hollowed) — the wild around you is a mind emptying out
  from the inside as you walk it, mile by mile... it is the party's choice whether it
  survives the visit."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**14. `Engine/03. _Tables/03. Session Mechanics/Walk Nightmare - Urban.md`**
Same mechanism, urban lane. d20, Commitment ceiling.
- Low (Textured, roll 1★): *"The Landlord's Rounds — every building on the block changed hands
  the same week, to the same buyer, who has never been seen and always collects on time
  regardless."*
- Mid (Textured, roll 2): *"The Watch That Doesn't Blink — the district's guard posts are all
  manned, all night, by watchmen who never seem to rotate shifts or go home."*
- High (Mythic, roll 20): *"The Interior (Hollowed) — the district around you is a mind emptying
  out from the inside as you walk it, block by block..."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**15. `Engine/03. _Tables/03. Session Mechanics/Walk Nightmare - Dungeon.md`**
Same mechanism, dungeon lane. d20, Commitment ceiling.
- Low (Textured, roll 1★): *"The Overworked Grave — every chamber down here was dug twice: once
  for whoever's buried, once again more recently, badly, by someone in a hurry who didn't finish
  the job right."*
- Mid (Textured, roll 2): *"The Debt Collector's Route — chalk tallies climb every doorway in a
  single obsessive hand, the sums always slightly wrong in the dungeon's favor; someone here is
  still being billed."*
- High (Mythic, roll 20): *"The Interior (Hollowed) — the mind you're walking is emptying out
  from the inside as you go, room by room..."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**16. `Engine/03. _Tables/03. Session Mechanics/Chase Complications.md`**
Rolled once per chase round (the "audit's big find" — shipped fully authored, wired to
`applyEvent chase_start/chase_round/chase_yield` in a follow-up unit). d100, Fork.
- Low (Grounded, roll 1★): *"A cart swings out of the wheelwright's. Vault it (Athletics) or lose
  the gap; the carter's curses mark your route for anyone asking."*
- Mid (Textured, roll 77): *"A trap not meant for this chase triggers anyway. Old, real, already
  there — a snare, a ward, a watch-alarm — and now it's everyone's problem, not just whoever set
  it."*
- High (Mythic, roll 100): *"For six heartbeats the chase crosses somewhere thin. Black sand, a
  bell, no sky — and something there notices the running and joins in."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**17. `Engine/03. _Tables/03. Session Mechanics/Downtime Ledger.md`**
Rolled once per week-long downtime montage (`applyEvent downtime`, fixed 6-intent vocabulary:
work/carouse/research/train/lie-low/seek-work). d100, Commitment ceiling.
- Low (Grounded, roll 1★): *"Honest wages. Coin scaled to the place, sore hands, and one useful
  acquaintance who now knows your name and work."*
- Mid (Textured, roll 77): *"The week's lie-low drew exactly the wrong kind of curiosity. Someone
  noticed you trying not to be noticed, and that's its own kind of attention now."*
- High (Mythic, roll 100): *"You trained under someone who died years ago. The skill is real and
  stays. The grave is undisturbed. The lessons continue in dreams, and there is a fee."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**18. `Engine/03. _Tables/03. Session Mechanics/Distant Word.md`**
Rolled on tavern/crier contact, downtime, or session start — the rumor arm, salience-weighted to
real ledger entries from non-current nodes. d100, Commitment ceiling. Two live seams (`applyEvent
distant_word` and `applyDriftEffect`'s `rep` tag).
- Low (Grounded, roll 1★): *"Distortion — True, mostly — the numbers doubled in the telling.
  Scale exaggerated; the fact beneath is ledger-real."*
- Mid (Textured, roll 77): *"Distortion — The location swapped to somewhere politically safer to
  name. The teller won't say where it really happened..."*
- High (Mythic, roll 100): *"Distortion — The word arrived before the event — dated three days
  hence, in a dead man's handwriting, and it names a place you were planning to be."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**19. `Engine/03. _Tables/03. Session Mechanics/Festival and Holy Days.md`**
Rolled on a Textured+ drift row or downtime — the urban life beat walk-skins only flirt with.
d100, Commitment ceiling. Wired via `applyDriftEffect`'s `festival` tag.
- Low (Grounded, roll 1★): *"The harvest weighing. Scales in the square, loud bragging, a pie
  court with genuine stakes. Prices dip for a week after."*
- Mid (Textured, roll 77): *"The silence hour. By imposed decree (not old custom), the town
  observes an hour of mandatory silence for a faction's purposes."*
- High (Mythic, roll 100): *"The god attends. Everyone pretends this is normal. The etiquette is
  life-critical, unwritten, and no one will explain it to a stranger."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**20. `Engine/03. _Tables/03. Session Mechanics/Shrine and Omen.md`**
A walk/interior/place dressing lane bound to the world's own rolled myth by reference
(`[the myth]` fills at roll time). d100, Commitment ceiling. Wired via `applyEvent shrine_omen`.
- Low (Grounded, roll 1★): *"A wayside shrine, tended. Fresh offerings, a plinth worn smooth
  where hands rest. Leave something; the road feels shorter."*
- Mid (Textured, roll 77): *"A specific omen at this shrine is read as urgent, right now. Locals
  are visibly unsettled, watching it closely..."*
- High (Mythic, roll 100): *"Prayers here are answered in advance. The granted thing arrives
  before the asking. The debt is presumed, and collection is patient."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**21. `Engine/03. _Tables/01. World Building/Mythic Events/Truth vs False.md`**
Chained from Place Mythology — how true a rolled myth actually is. d20, Commitment ceiling
(expanded from d6; original 6 rows byte-untouched at 1/4/8/12/16/20).
- Low (roll 1): *"Entirely false"*
- Mid (roll 11): *"The myth compresses three separate events into one, and gets the order
  wrong"*
- High (roll 20): *"Exact. The myth is not describing the past — it is still, right now,
  describing something that hasn't finished happening"*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

### Tier C — realm items (fires only inside a breach, but guaranteed then: ≥1-per-breach)

**One shared note before the 11 cards:** every breach walk plants at least one realm-filtered
Outlandish item, guaranteed (`src/engine/breach.js` §6, the "≥1-per-breach guarantee"). So these
fire less often than walk-skins (only on the rarer breach tail) but **deterministically** once a
breach happens — not a random maybe. All 11 are d50, Commitment ceiling, and all 11 share the
same lint WARNING (not error) for a deliberate two-wave structure — rows 1–27 climb
Grounded→Mythic, rows 28–50 open a second wave back at Grounded, a documented 12-mundane +
8-enchanted + 4-signature + consumables recipe per each file's own frontmatter. **The mythic-tier
rows below are trimmed** — the real rows run 400–900 words each (a d4 sub-roll of four
mini-artifacts, each with two power ranks) — genuinely excellent, but too long to reproduce
verbatim on a scannable bench; read the file directly for the full text before ruling.

**22. `Engine/03. _Tables/05. Realms/Realm Items - Frontier.md`**
- Low (Grounded, roll 1): *"A trail cook's battered coffee pot, dented from a hundred
  campfires. Boils water fast if you know how to bank a fire; no one will say whose it was
  first."*
- Mid (Textured, roll 34): *"A land agent's brochure for a town that, on arrival, turns out to
  be four buildings and a well. The brochure's illustration is suspiciously detailed for a town
  that small."*
- High (Mythic, roll 27, trimmed): *"The last bullet ever fired in the war that named this
  territory, still warm, still waiting for the second shot everyone agreed would end it... fired
  once, it ends a feud permanently — both sides, no survivors to reignite it..."*
**Q: bless the register, or wrong tone for Frontier specifically?** (Default: bless.)

**23. `Engine/03. _Tables/05. Realms/Realm Items - Chrome.md`**
- Low (Grounded, roll 1): *"A cracked data-slate, screen dim in one corner, still readable...
  the dim corner has eaten one paragraph per page, always the same paragraph number."*
- Mid (Textured, roll 20): *"A retired security chief's off-book confession recording,
  unplayed. Whatever's on it, someone paid to have the original destroyed. This is a copy."*
- High (Mythic, roll 27, trimmed): *"The root credential nobody alive was cleared to hold... the
  first traffic-control mind ever switched on under [this settlement], still routing every cart
  and courier and closed door in the city..."*
**Q: bless the register, or wrong tone for Chrome specifically?** (Default: bless.)

**24. `Engine/03. _Tables/05. Realms/Realm Items - Gloom.md`**
- Low (Grounded, roll 1): *"A wax candle, black, unlit, smells faintly of something sweet gone
  slightly wrong. Burns like any candle. The smell's just a preference of whoever poured it."*
- Mid (Textured, roll 20): *"A church bell's maintenance log, noting it 'rang on its own again'
  three times this year, each entry more clipped than the last."*
- High (Mythic, roll 27, trimmed): *"The parish's holy relic... the original burial shroud of
  [this settlement]'s founding saint, whose bones have never been found..."*
**Q: bless the register, or wrong tone for Gloom specifically?** (Default: bless.)

**25. `Engine/03. _Tables/05. Realms/Realm Items - Noir.md`**
- Low (Grounded, roll 1): *"A trench coat, rain-dark, missing one button. Standard protection
  from weather. Smells faintly of someone else's cigarettes."*
- Mid (Textured, roll 20): *"A cabbie's fare log, listing a pickup at an address that burned
  down the week before the ride."*
- High (Mythic, roll 27, trimmed): *"The one honest confession that's ever fully exonerated a
  man in this city's history, framed behind bulletproof glass in a courthouse nobody can quite
  remember voting to build that way."*
**Q: bless the register, or wrong tone for Noir specifically?** (Default: bless.)

**26. `Engine/03. _Tables/05. Realms/Realm Items - High-Seas.md`**
- Low (Grounded, roll 1): *"A ship's bell, cracked, salvaged from a wreck nobody's
  identified... the crack runs exactly along where the maker's mark would be."*
- Mid (Textured, roll 20): *"A harbor master's ledger, showing berth fees paid by a ship that,
  per every other record, sank two seasons ago."*
- High (Mythic, roll 27, trimmed): *"The thing the Company can't afford you to find... the last
  uncorrupted chart of the true trade routes, before the Company redrew the seas to suit its
  ledgers..."*
**Q: bless the register, or wrong tone for High-Seas specifically?** (Default: bless.)

**27. `Engine/03. _Tables/05. Realms/Realm Items - Lost-World.md`**
- Low (Grounded, roll 1): *"A shard of painted pottery, glaze faded, pattern half a story
  nobody can finish reading."*
- Mid (Textured, roll 20): *"A royal decree, sealed, ordering the 'sealing of the lower gate,
  permanently, on the king's own authority.' The lower gate in question doesn't appear on any
  surviving map of the city."*
- High (Mythic, roll 27, trimmed): *"The wonder that outlived its makers... the founding charter
  of the civilization itself, intact, naming the first city..."*
**Q: bless the register, or wrong tone for Lost-World specifically?** (Default: bless.)

**28. `Engine/03. _Tables/05. Realms/Realm Items - Bright-Kingdom.md`**
- Low (Grounded, roll 1): *"A wrapped hard candy, bright red, flavor unclear from the wrapper
  alone. Tastes like cherry. Nothing more."*
- Mid (Textured, roll 20): *"A theme park map with one attraction crossed out in red pen, no
  explanation, by hand that isn't the printer's."*
- High (Mythic, roll 27, trimmed): *"The first wonder the park was built to imitate... the
  original Wishing Coin, minted the day the Kingdom was founded..."*
**Q: bless the register, or wrong tone for Bright-Kingdom specifically?** (Default: bless.)

**29. `Engine/03. _Tables/05. Realms/Realm Items - Cosmic.md`**
- Low (Grounded, roll 1): *"A pebble, unremarkable, that happens to be perfectly round. Nothing
  more than that. Somehow that's a little unsettling here."*
- Mid (Textured, roll 20): *"A retired linguist's private notes on 'a language that answers
  before you finish the question.'"*
- High (Mythic, roll 27, trimmed): *"The thing that was written down before we had hands to hold
  the pen... the Choir's original hymn, transcribed in full for the first time in living
  memory..."*
**Q: bless the register, or wrong tone for Cosmic specifically?** (Default: bless.)

**30. `Engine/03. _Tables/05. Realms/Realm Items - Suburb.md`**
- Low (Grounded, roll 1): *"A garden gnome, chipped, paint faded to mostly primer. Decorative.
  Every lawn on the block has one similar."*
- Mid (Textured, roll 20): *"A For Sale sign, 'Under Contract,' posted on a house that's been
  visibly empty for years. The listing agent's number, when called, rings somewhere that's
  never once picked up."*
- High (Mythic, roll 27, trimmed): *"The paperwork the neighborhood was really built on... the
  original plat map for the whole subdivision, hand-drawn, showing every house's true
  dimensions..."*
**Q: bless the register, or wrong tone for Suburb specifically?** (Default: bless.)

**31. `Engine/03. _Tables/05. Realms/Realm Items - Theater.md`**
- Low (Grounded, roll 1): *"A soldier's letter home, unsent, folded and refolded until the
  creases are soft as cloth. Mundane, personal, unfinished. The last line trails off
  mid-sentence."*
- Mid (Textured, roll 20): *"A veteran's medal, unclaimed, mailed to a family that moved without
  leaving a forwarding address."*
- High (Mythic, roll 27, trimmed): *"The relic every side that's fought here has left behind...
  the single armistice bell, cast from melted weapons off every side that's ever fought here..."*
**Q: bless the register, or wrong tone for Theater specifically?** (Default: bless.)

**32. `Engine/03. _Tables/05. Realms/Realm Items - Ash.md`**
- Low (Grounded, roll 1): *"A rusted-through water jug, patched with tape three different
  colors. Holds a day's water once patched. The patches are all somebody else's spares."*
- Mid (Textured, roll 20): *"A settlement guard's confiscation log, listing an item taken from a
  traveler who never left. The item isn't in the evidence locker anymore. Someone took it back
  out."*
- High (Mythic, roll 27, trimmed): *"The thing the survivors kept... the last working seed vault
  on the continent, its door standing open for the first time in a generation..."*
**Q: bless the register, or wrong tone for Ash specifically?** (Default: bless — note this file
also carries a "band shares run hotter than baseline by construction" note in its own
frontmatter; that's declared intentional, not a lint issue.)

### Tier C — dungeon-specific plumbing

**33. `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Reinforcements.md`**
Rolled on an alarm/pursuit trigger inside the 5-Room Dungeon Generator. d12, Fork (expanded from
d6; rows 1–6 byte-untouched).
- Low (roll 1): *"1 Guard from the same faction arrives from an adjacent segment."*
- Mid (roll 7): *"3 Minions (CR 1/8–1/4 each) arrive at a dead run, already shouting the alarm
  onward."*
- High (roll 12): *"The boss arrives in person, underprepared and furious — treat as a
  Veteran/Elite (CR ~1) with one boss-tier trait active early."*
**Q: bless as-is, or needs the craft pass?** (Default: bless.)

**34. `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Loot - Outlandish.md`**
The legacy d300 anachronism-intrusion grab-bag (the pre-realm-items version — realm items are the
newer, realm-filtered replacement path; this stays as the wider grab-bag). Only change from
PROVISIONAL: a new DM-only Band column, every other cell byte-untouched. d300, Fork.
- Low (utility, roll 1): *"The Red Ball — Pokémon — Throw at a beast; on hit, it is trapped in a
  pocket dimension."*
- Mid (high-power, roll 151): *"Kevlar Helmet — Reality — Immunity to critical hits from
  non-magical projectiles."*
- High (reality-breaking, roll 300): *"The Infinity Gauntlet (Real) — Marvel — Can rewrite
  reality. (Requires 6 Infinity Gems)."*
**Q: is the new Band column's utility/combat/high-power/reality-breaking read on each of the
300 items right, or does one jump out as mis-tiered?** (Default: bless — it's a DM-only heuristic
note, not player-facing, so a wrong tier here is low-stakes to leave.)

**35. `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Loot - Valuables.md`**
Wired via `codex-roll.js`/`dungeon-walk.js` — sellable loot. **This one's flagged differently
from the rest: its own frontmatter says "Adam craft pass pending," not "spot-check pending"** —
drafted fast in 2026-07-01/02 to unblock the sell-content economy plumbing, so it's a heavier ask
than most cards here. d100, Fork.
- Low (Grounded, roll 1): *"A handful of copper rings — 5 — Cheap, but a peddler will take them
  without a question."*
- Mid (Textured, roll 77): *"A carved wooden mask with the eyeholes stitched shut — 80 — Ritual
  craft, unclear tradition, deeply unsettling to the superstitious."*
- High (Mythic, roll 100): *"A crown-jewel shard still faintly warm with a dead god's attention —
  5000 — It doesn't want to be sold. It wants to be worn. It says so, if you hold it long
  enough."*
**Q: does this need the full craft pass now, or is the sampled register good enough to bless
and revisit later?** (Default: no default here — this is the one card in the whole bench where
Adam's own frontmatter already says "pending a real pass," so skipping the question isn't fair
to what you already flagged. Recommend at minimum a full read, not just this 3-row sample.)

**36. `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Dressing Mega Table.md`**
Wired via Urban/5-Room Set Up (12 sub-tables, "roll 6× to dress the scene"). **Narrow the ask:**
only ONE of the 12 sub-tables carries the PROVISIONAL flag — the d6 Air table, collapsed from a
mislabeled "d100 Air" whose body was actually only 5 rows. All 5 original strings byte-untouched;
"clear" keeps 2/6 slots (its ~70% real-world share) against 1-slot minimums for the other four.
- Full table (only 5 distinct results across 6 slots): *1–2: "clear" · 3: "foggy (or steamy)" ·
  4: "foggy near floor (or steamy)" · 5: "hazy (dust)" · 6: "misted"*
**Q: does an honest d6 beat the old fake d100 here, or would you rather it read d100 for
Oracle-tab consistency with its 11 siblings even though the real content is 5 rows?** (Default:
bless the d6 — a fake d100 miscounts the true odds, which is worse than an honest smaller die.)

**37. `Engine/03. _Tables/03. Session Mechanics/Pressure/In-Building Complications.md`**
**See §3 below — this is the file with the linter conflict, not a simple bless/needs-pass call.**
Currently Oracle-only (no auto-trigger found in the codebase — confirmed by direct grep, not just
the audit). d100, Fork, expanded from d20.
- Low (Grounded, roll 1): *"Residence — A noisy family — an argument, a crying child, a
  radio-loud gathering that means every room is occupied and listening."*
- Mid (Textured, roll 56): *"Religious — A hidden shrine behind the public one, older, tended in
  secret, to something the visible faith doesn't claim."*
- High (Mythic, roll 100): *"Shop — The shop's stock replaces itself overnight to match whatever
  the day's first customer most needs; today, that was the party, and the shelves rearranged
  before they walked in."*
**Q: bless the content — and separately, should this table get wired to fire automatically on
building entry (per its own frontmatter's stated intent), or stay Oracle-only?** (Default: bless
content; wiring decision is a build-priority call, not a content call — doesn't need to happen in
this bench sitting.)

### Tier D — Oracle-only, name-bank build artifact

**38. `Engine/03. _Tables/02. Social/Sentient NPCs/Name Cultures.md`**
`type: name-bank` — the dice compiler skips it entirely; it's consumed at BUILD time by
`build/gen-names.py --cultures` into `data/names-cultures.js`, not rolled live in a session.
12 culture banks (Varnic/Sahelian/Qadari/Long-Shore/Northreach/Meridian/Steppewind/Cloudterrace/
Reedlands/Islefolk/Thornwald/Ashkarn) × 3 name-lists (female/male/family) × ~40 names ≈ ~1,440
names total. Each culture's approved sample name is entry 01 in its bank, verbatim.
- Sample (Varnic Female, entry 01): *"Zvena"* (your approved sample, anchoring the bank)
- Sample (Varnic Female, entry 20): *"Rava"*
- Sample (Varnic Female, entry 40): *"Zvelya"*
**Q: spot-check 2-3 of the 12 cultures for phonology consistency, or trust the pattern from the
one you already approved (Zvena) and bless all 12?** (Default: bless all 12 — coining ~1,440
names is a volume task, not a taste task, and the one anchor per bank was already your call.)

---

## 3. In-Building Complications — the linter conflict

**What's actually wrong, precisely:** running `python3 build/lint-tables.py` (no flags — the real
gate, not the report-only baseline) returns **exactly 3 hard ERRORs today, all three inside this
one file**, confirmed by a fresh run just now:

```
[ERROR] ...In-Building Complications.md:50  rolls 26-27 drop below the roll-25 peak of 'Textured'
[ERROR] ...In-Building Complications.md:59  rolls 35-36 drop below the roll-34 peak of 'Strange'
[ERROR] ...In-Building Complications.md:62  roll 38 drop below the roll-37 peak of 'Strange'
```

This is the **band-order check** (isolated single-row dips in an otherwise-ascending d100), NOT
the duplicate-row question from §1 — those are two completely different lint checks. The table's
own design doc (`docs/TABLE-EDIT-SAFETY.md`) already names this exact file as a worked example of
"authoring noise, not design" — a single row here or there landed one band lower than the row
before it, inside a table that's supposed to climb monotonically as the roll number rises. It's
not visible in normal play (nobody notices row 26 reading Grounded right after row 25 read
Textured), but it IS the one thing standing between this corpus and a fully-green
`lint-tables.py` run today (everything else is WARN-only and already passes).

**Option A — linter frontmatter opt-out.** Add a field (e.g. `band_monotonic: false`, or a
per-file skip-list the linter reads) so this file's 3 dips stop being hard errors.
- **What changes:** one new frontmatter field (or one linter-side allowlist entry), zero content
  edits. The linter itself needs a small code change to read and honor it — a few lines in
  `lint-tables.py`'s check-2 logic.
- **What it costs later:** every future edit to this file skips band-order checking entirely, not
  just these 3 rows — if someone (you, or a future editing pass) introduces a NEW, worse dip
  later, the linter goes silent on it too. It's an off switch for the whole file, not a
  targeted allow for these 3 rows specifically (unless the opt-out mechanism is built more
  precisely than a whole-file flag, which is more linter work).
- **One-line recommendation:** fine IF the mechanism is scoped tight (e.g., "allow rank drops
  starting at rolls 26/35/38 specifically"), but a coarse whole-file opt-out is the weaker of the
  two options — it trades a 3-row fix for a permanently-blind spot on a table that's still
  actively being expanded (this exact file went d20→d100 in a wave-2b pass already; it's not
  static).

**Option B — re-sort.** Move the 3 offending rows (or retitle their Band cell) so the sequence
climbs monotonically — e.g., bump row 26/27's Band from Grounded to Textured (matching their
neighbors), or physically reorder which roll-numbers carry which text so no row's band ever dips
below the row before it.
- **What changes:** either 3 Band-cell edits (fastest — reclassify, don't rewrite) or a fuller
  reshuffle of roll-number assignments (slower, touches more of the file, risks new duplicate/gap
  issues the linter would then have to re-check). The narrow version — just bump the 3 Band
  labels up one notch — is a content-preserving fix: no prose changes, the complication text
  stays exactly as written, only its declared intensity tier moves.
- **What it costs later:** nothing structural — the file becomes and stays fully lint-clean, no
  ongoing exception to track or forget about. The only real cost is Adam's few minutes now
  (versus zero minutes now under Option A) to actually look at the 3 rows and confirm the
  reclassification reads right (a Grounded complication reclassified as Textured needs to still
  feel like a Textured complication, not just get a new label pasted on).
- **One-line recommendation: do this one.** It's the smaller, one-time cost (3 Band-cell edits)
  against Option A's recurring cost (a standing blind spot on a table still being actively
  expanded) — and it's the only option that gets `lint-tables.py` to a clean, no-exceptions,
  no-flags PASS today rather than a pass-with-an-asterisk.

**Default if Adam doesn't rule:** the file stays exactly as it is — 3 hard errors present, but
harmless in practice (the linter isn't wired into any CI gate that blocks anything; it's a
standalone pre-compile check someone has to remember to run). Nothing breaks either way; this is
purely a hygiene call, not an urgency call.

---

*Built read-only against `Engine/` — no table content or linter code was modified to produce
this bench. `docs/TABLE-USAGE-AUDIT.md` was regenerated once during research to check wiring
freshness, then reverted (not part of this branch's diff) since a full audit refresh wasn't in
scope; run `python3 build/gen-table-usage-audit.py` yourself if you want the refreshed copy
committed separately.*
