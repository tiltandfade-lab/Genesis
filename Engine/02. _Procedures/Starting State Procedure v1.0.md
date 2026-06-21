---
version: 1.0 (2026-06-19)
---

# Starting State

> Rolls the **standing situation** around a freshly-forged world — the powers in motion (factions with agendas + clocks), the pressures bearing on the town (one from **inside**, one from **outside**), and the **Entry** bundle that wires the arriving character into that present. Closes the gap that world-genesis "plopped you in" but never rolled the pressures inside or outside the town. Design rationale + prior-art: `[[STARTING-STATE-MODELS]]`. Tables: `[[Starting State - Factions]]`, `[[Starting State - Pressures]]`, `[[Starting State - Entry]]`.
>
> **Division of labor (the engine does the rolling, the AI DM interprets):** this procedure is the orchestration tier. The tables hold the rollable content; the clock/advance logic lives here. Everything it produces is written to the **World State Ledger** as standing **fronts**, so it persists and drifts.

## When it fires
- **At world-genesis** (primary): factions + their agendas, and **one Internal + one External pressure**, are rolled when the world is forged — the world is born already in motion, independent of any character.
- **At character-entry** (`cgBind`): the **Entry** bundle is rolled, and the PC's own seeds/choices may **feed** a standing pressure — attaching to it, amplifying it, or re-aiming it at the PC (Adam 2026-06-19).
- **In play** (ongoing): pressures are **reactive** — the DM may spawn a new pressure or advance/relieve a clock as a consequence of the PC's choices. The world answers play in *both* directions (no tonal railroad; `[[SPICE-CURVE]]` §2).
- **On drift** (montage / days passing / return after absence): roll **Faction Turn** for the active faction(s) — factions grow, decline, splinter into new rivals, merge, or pivot their agenda. The web is alive, not frozen at creation.

## Step 1 — The faction web
1. The dominant power = the faction world-genesis already rolled. Add **1d3 rivals** (2–4 factions total; the rivalry is itself a pressure).
2. For each faction roll **Agenda (Goal)**, **Method**, and **1–2 Tags** (`Starting State - Factions`). For each **rival**, roll **Relationship** toward the dominant.
3. Give each faction a **clock** toward its Goal — default **6 segments** (4 for an urgent/desperate goal, 8 for a slow/ancient one). The clock advances on world-drift / montage transitions, or when a Grim Portent comes to pass.
4. Write each faction + agenda + clock to the Ledger (`canon` for the faction-fact, `clock` for the agenda clock).
5. **Factions are not fixed.** As the world drifts, roll **Faction Turn** (`Starting State - Factions`) for the active faction(s): they grow, decline, splinter into new rivals, merge, change leaders/methods, or pivot to a new agenda — and on achieving a goal, take a fresh one. The web is a living thing.

## Step 2 — The pressures (one Internal, one External)
For **each** of the two pressures:
1. Roll **Pressure Source** (`Starting State - Pressures`). It points the danger at: a faction's scheme (use that faction's Agenda+Method), an **impersonal force** (roll *Impersonal Force*), the **world's own** myth/taboo coming due (reincorporate an established Ledger fact), a **neighboring power** (external-leaning), or **fallout** of recent events / the PC's deeds.
2. Roll the matching pressure: **Internal Pressure** (tie it to the town's faction / taboo / trouble) or **External Pressure** (tie it to a neighboring power / myth / place node).
3. Build the **front**: the rolled pressure is the **Danger**; give it a **clock** (default 6; smaller if urgent), seed its segments from **Grim Portent**, and roll its **Impending Doom** (held by the DM, revealed only as the clock fills).
4. **Make it real (if Strange+).** Any pressure that lands in the uncanny bands is **immediately concretized** behind the screen — roll the matching *Making It Real* table (`Starting State - Pressures` §Making It Real) to fix **what it actually is** as an objective, write-once Ledger fact. The player sees only the vague Fragment; the DM holds a concrete thing with stated levers. Never leave a Strange+ pressure as an unresolved mood — *what it is* is fixed once established; *how it ends* is play's.
5. Write the front to the Ledger (`drift` / `clock`).

## Step 3 — Entry (at character creation, `cgBind`)
Assemble the opening bundle — **Enemies / Friends / Complications / Things / Places** — by **preference order**, filling each slot from the first source that has material:
1. the **PC's rolled backstory seeds** (the enemy made, the lost lover, the life-debt companion, the open threads);
2. the world's **factions** (and the PC's Standing with the Local Power);
3. the standing **pressures** (their Dangers, victims, and contested Places);
4. a **fresh roll** only if the slot is still empty (use the Entry tables + the NPC / place generators).

Then roll the framing: **Why You're Here** (prefer to derive from a PC thread first), **A Foot in the Door**, **Standing with the Local Power**. Set the **Opening Tension** by aiming the **nearest-to-firing pressure** at the PC — re-framed as something they'll be forced to answer soon.

**Anchor the floats:** any backstory NPC promoted into the bundle is moved from "an unplaced soul" to **here** (a Ledger location), so the DM can actually reach for them at the opening.

Keep the world-genesis **"Trouble at Hand"** as the immediate first-five-minutes hook; the Opening Tension is the slow burn it sits within. Don't duplicate.

## Presentation — the player rolls it (Adam 2026-06-19)
The starting state is **player-rolled, not DM-only bookkeeping.** When a world is forged, the player rolls its factions and pressures the same way they roll the world skeleton, and sees the **Fragment** for each — a 6–10 word sensory hook that tells them *what kind of world they've made* without spelling out the mechanics (the locked **Fragment oracle**, `[[DESIGN]]` / `[[SPICE-CURVE]]` §5). The AI DM holds the real table row and the **Impending Doom** behind the screen and reveals them through play — anticipation, not spoiler. So a pressure surfaces to the player as e.g. *"smoke on the northern road, and refugees"* or *"the old quarry has begun to hum,"* while the DM holds the full danger + doom. (Per-row Fragments are generated in the **Fragment batch**, `NEXT-STEPS` step 6; until then the DM improvises the fragment from the row.)

## Spice — let the dice decide (no override)
- Pressures and agendas roll by **honest rarity** (`[[SPICE-CURVE]]`): most outcomes Grounded; Internal tops out around Volatile; **External may reach Mythic** (an awakening, an intrusion — the "persistent mutator" case), rare by the dice. The grounded-and-mythic blend is the point; the dice decide it.
- **No intensity override (Adam 2026-06-19).** The earlier player calm/standard/harsh dial is **cut** — it was a small engineered lever, against the "emergent spice, no dial" principle. The player's only knob is **re-roll the whole world** before founding it (Rimworld-style; world-genesis already offers "↻ Reroll the seed" — nothing is canon until "Found this world"). Once founded, the rolled world stands.

## Outputs (all to the World State Ledger)
- Factions: `canon` (the fact) + `clock` (the agenda).
- Pressures: standing fronts as `drift` + `clock`, Impending Doom held DM-side until revealed.
- Entry: `canon` for the opening situation; promoted backstory NPCs anchored to "here."
- These feed the **change-over-time layer** (`NEXT-STEPS` 10–13): the faction/pressure clocks *are* drift's content; reincorporation resurfaces them; NPC life-events move the people the bundle named.

## Roll manifest (the call sequence — for the JS wiring)
> Every roll the procedure fires, in order. `[plumbing]` = auto-resolved by the engine; `[fragment]` = surfaced to the player as a 6–10 word hook; `[DM]` = held behind the screen; `[cond]` = conditional.

**World-genesis — faction web**
1. Rival count — **1d3** `[plumbing]`
2. Per faction: Agenda **d20** `[fragment]` · Method **d12** `[plumbing]` · Tags **1–2 × d20** `[plumbing]`
3. Per rival: Relationship to dominant — **d12** `[fragment]`
4. Per faction: clock = 6 segments (set, not rolled)

**World-genesis — pressures (×2: one Internal, one External)**
5. Pressure Source — **d12** `[plumbing]`
6. Internal **d20** or External **d20** `[fragment]`
7. Impersonal Force — **d12** `[cond: Source = impersonal]`
8. Grim Portent — **d12** (seed clock steps) `[DM]`
9. Impending Doom — **d12** `[DM]`
10. Making It Real — Buried Power **d8** / Intrusion **d6 + d4** / Becoming **d8** / Curse **d8** `[cond: Strange+] [DM]`

**Character entry (`cgBind`)**
11. 5-slot bundle (Enemies/Friends/Complications/Things/Places) — *assembled* from PC seeds → factions → pressures → fresh roll only if empty
12. Why You're Here — **d12** (prefer a PC thread) `[fragment]`
13. A Foot in the Door — **d12** `[fragment]`
14. Standing with the Local Power — **d10** `[fragment]`
15. Opening Tension — aim the nearest pressure (assembled, not rolled)

**Over time**
16. Faction Turn — **d12** on drift `[fragment]`
17. Reactive pressures — DM-spawned from play (no fixed roll)

*~20–30 rolls per fresh world; most are plumbing, a handful surface as fragments.*

## Build status
Tables + this procedure authored 2026-06-19 (the data tier). **World-side WIRED into `genesis.html` 2026-06-19** (verified 21/21 headless): `rollStartingState` (called from `bindWorld`) rolls the faction web (1 dominant + 1d3 rivals) + one Internal + one External pressure, concretizes Strange+ behind the screen (`concretize` → Buried/Intrusion/Becoming/Curse), writes all to the Ledger as fronts/clocks; `ssFactionTurn` ticks on montage/drift; `renderPowers` shows the **Powers & Pressures** panel; `handToDM` carries the powers + DM-only doom/concretization.

**Step 3 (Entry) — WIRED 2026-06-19 (Option C), verified 28/28 headless.** `rollEntry` now performs the full assembly: it harvests the PC's backstory seeds (`entrySeeds` reads the `npc-life` + `thread` ledger entries char-genesis wrote), assembles the 5-slot **Enemies / Friends / Complications / Things / Places** bundle by preference order (PC seeds → factions → pressures → fresh), ties **Standing** to the actual dominant faction (`standingFaction`), routes that faction to Enemies or Friends by whether Standing is adversarial, derives **Why You're Here** from a search-thread when present, selects the **Opening Tension** via `pickTension` (connects-to-PC → higher-spice/concretized → internal — *not* random), and **anchors** promoted backstory NPCs to the entry location with a `canon`/`kind:anchor` ledger write. **Option C:** any slot still empty after canon is filled by the script from the fresh `EB` tables (`Starting State - Opening Bundle.md`) — the opening is never punted to the DM. A new **The Opening** panel (`renderOpening`) shows the player the arrival framing + 5 slots (past-sourced items flagged ⟡); `handToDM` carries the bundle + DM-only tension truth/doom. Also fixed: `cgHandleSec` now handles the `enemy` tag (a rolled enemy seeds an opening foe).

**Still pending:** per-row **Fragments** (the player currently sees raw row text at world-founding, not the 6–10 word hooks this procedure is designed around — `NEXT-STEPS` step 6 / O2). The fresh-table rows in the Opening Bundle are already written as short fragment-style hooks.
