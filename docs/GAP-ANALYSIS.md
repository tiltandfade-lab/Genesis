---
type: design-doc
branch: Genesis
status: draft
created: 2026-06-17
related:
  - "[[DESIGN]]"
  - "[[table-registry]]"
---

# Genesis — Gap Analysis

**Question:** what does a *persistent solo-RPG world* need that the Arcana Engine doesn't have yet?

**Method:** the registry (270 active tables, ~18.8k rows) is the denominator — what *exists*. This doc is the numerator — what the *persistent solo loop needs*. The delta is the punch list.

## Headline

The engine was built for **episodic DM prep**: roll up a place, a dungeon, an NPC, on demand, for one session. Genesis adds **persistence over time**. So the engine is a **snapshot generator**, and almost every real gap is the same shape: **there are no _change-over-time_ generators.** The engine can tell you what a faction *is*, not what it *did while you were away*. That single sentence predicts the whole list below.

## Legend

- ✅ **Covered** — registry has it, fit for purpose.
- 🟡 **Partial** — exists but snapshot-only, or thin for persistence.
- 🔴 **Missing** — the persistent loop needs it; engine has nothing.
- Build type: **[T]** new tables · **[A]** app mechanic (no tables) · **[D]** a decision, not a build.

## The persistent-world lifecycle, phase by phase

### Phase 1 — Genesis (creating a world) ✅
Master Setting, sensory (smells/sounds/architecture), Starting Pressure, Social Taboos, Place Mythology, Faction-Basic, Nearby Places. Strong. **No gap.**

### Phase 2 — Exploring interiors (city / ruin / wild) ✅
Urban (71 tables / 5,749 rows), Dungeon (62 / 4,501), Wilderness (22 / 3,050), Travel (11 / 340). Deepest part of the engine. **No content gap** — the gap is *presentation* (the 100-roll problem, solved in DESIGN §3), not coverage.

### Phase 3 — Meeting people 🟡
37 NPC tables / ~3,070 rows — appearance, demeanor, secret, hook, bond, fear, leverage, etc. Strong at *snapshot*. Two known gaps:
- 🔴 **[T] Single-culture human names** — the d100 human-name table is Anglo only; All-Stars assets patch it but the table layer doesn't. (Known.)
- 🔴 **[T/D] No PC/companion _mechanical_ generator** — identity/flavor exists, class/stats do not. (Known; see Phase 8.)

### Phase 4 — Who am I (player character) 🔴 / [D]
No PC generator. Genesis uses a light invented "spark" line; the full sheet lives in `_Playtest/player-interface.html`. **Decision, not a build:** keep PC creation light + external, or commission a real L1 generator. Until decided, this blocks nothing but feels thin.

### Phase 5 — Time passing (world clock) 🔴 / [T+A]
A persistent world needs a sense of *when*. Engine has Wilderness Lighting/Weather and some Travel timing, but no **calendar / season / world-clock / time-of-day-as-state**. Without it, the world can't age and "between visits" has no unit. **Foundational for everything in Phase 6–7.**

### Phase 6 — The world changing while you're away 🔴 / [T+A] — THE signature gap
Nothing models how a place evolves after you leave. A persistent universe lives or dies on this. Needs:
- 🔴 **[T] Faction clocks / agendas** — Faction-Basic says what a faction *is*; nothing advances its goals over time, escalates inter-faction conflict, or reacts to player absence.
- 🔴 **[T] World-state drift** — "what changed at this place since last visit" (a fire, a new ruler, a market collapse, a road washed out).
- 🔴 **[T] NPC life-events** — recurring NPCs who die / move / marry / rise / fall between visits.
- 🔴 **[A] Reincorporation oracle** — the Mythic-GME move: a mechanic that *pulls already-established gazetteer elements back in* so the universe resurfaces its own history instead of always generating new. Mostly app logic over the gazetteer; a small "callback" table helps.

### Phase 7 — Consequences & relationships over time 🟡
- 🟡 **[T] Consequences** — a Consequences folder exists (In-Building Complications, etc.) but is scene-scoped, not lasting world-state. Persistence needs durable consequences.
- 🔴 **[T] NPC longitudinal relationship** — do they remember you, does the bond deepen/sour. NPC tables are snapshot-at-meeting, not a track.
- 🔴 **[T/A] Death & legacy** — Genesis handles death mechanically (fate roll); nothing for how the *world* remembers a fallen character (graveyard rumors, successor hooks, reputation).

### Phase 8 — Downtime / between sessions 🔴 / [T]
What the PC does between adventures (craft, recover, train, build) and what the world does in parallel. Engine has none. Couples tightly to Phase 5–6.

### Phase 9 — Economy / goods 🟡 / [T]
Urban Commerce + Treasure v1.0 exist; shop inventory / price-by-scarcity / regional economy is thin. Lower priority for a narrative-first solo game.

### Phase 10 — Quests / hooks ✅
Quests & Problems tables + NPC Hook megatable. Adequate.

### Phase 11 — Multiworld travel 🔴 / [A] — deferred by design
Data-model door is open; no mechanic. Parked.

## Update — design direction (2026-06-17)

Decisions that move items below:
- **World clock unit = play session** (P0 #1 resolved as a *decision*; the app still needs to track session count + per-place "last visited" stamps — light [A]).
- **History is lazy / on-inquiry** — the past is unwritten until the player asks, then rolled and made canon (P0 #2 reincorporation + a new *history oracle*: retrieve-if-established, else roll-and-record). Mostly [A] over the ledger + a small "rolled past event" [T].
- **Two-layer truth model + NPC deception** — "once established = canon" truth; NPCs lie only when motivated (Secret/Fear/Leverage/If Cornered — *already exist*). New [T] is small: a "tell" table for catchable lies. This adds a narrow hidden DM layer. See `DESIGN.md` §Time, truth & lies.
- **Combat parked for Fable**; all conversation runs through Claude.

## Priority punch list

**P0 — blocks the persistent loop from *feeling* persistent**
1. 🔴 [T+A] **World clock / time** (Phase 5) — the unit everything else needs.
2. 🔴 [A] **Reincorporation oracle** (Phase 6) — makes the universe resurface its own history; mostly app, high payoff, low cost.
3. 🔵 [D] **PC entry decision** (Phase 4) — light/external vs. build.

**P1 — makes the world feel alive between visits**
4. 🔴 [T] **Faction clocks / agendas** (Phase 6).
5. 🔴 [T] **World-state drift** (Phase 6).
6. 🔴 [T] **NPC life-events + relationship track** (Phase 6–7).

**P2 — depth, once the loop sings**
7. 🔴 [T] **Downtime** (Phase 8).
8. 🟡 [T] **Durable consequences** (Phase 7).
9. 🔴 [T/A] **Death & legacy** (Phase 7).
10. 🟡 [T] **Economy depth** (Phase 9).
11. 🔴 [T] **Human-name cultures** (Phase 3) — small, known, easy win.

## Read in one line

Coverage of *space* (places, interiors, people-as-snapshots) is excellent. Coverage of *time* (clocks, drift, life-events, reincorporation) is nearly absent — and time is exactly what "persistent" means. The P0/P1 items are almost all the same project: **give the world a clock and let things change against it.**
