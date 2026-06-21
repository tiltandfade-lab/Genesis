---
type: design-research
branch: Genesis
status: reference
created: 2026-06-19
related:
  - "[[DESIGN]]"
  - "[[NEXT-STEPS]]"
  - "[[SPICE-CURVE]]"
  - "[[CHAR-CREATION]]"
---

# Genesis — Starting-State, Pressure & Faction Models (research → build plan)

Reference digest for the next build: the **Entry / opening-situation layer**, **internal vs external pressures**, and **faction motivation**. Captures the *structures* (methods, not copyrightable) of the best prior art, flags what's legally reusable, maps each to what Genesis already has, and proposes the Genesis-native design to build.

**The gap Adam named (2026-06-19):** world-genesis "plops you into a world" well, but it does **not roll the pressures acting on the town — neither the ones from *inside* the town nor the ones from *outside* it.** A character lands with a rich backstory and a rolled setting, but the world has no *standing situation* in motion around them. That standing situation is what this layer adds.

---

## License posture — what we can actually reuse (read first)

| Source | Reuse status | What we take |
|---|---|---|
| **Ironsworn / Ironsworn: Starforged** (Shawn Tomkin) | **CC-BY 4.0** — SRD + oracle tables + truths reusable *with attribution*, even commercially | The one source we can adapt **content** from, not just structure. "Truths," some oracle rows, the connection→bond arc. |
| **Dungeon World** (SRD) | Open (CC-BY-SA / DW SRD) | The **Fronts** structure (Dangers / Grim Portents / Impending Doom / Stakes / Cast) — adopt the method freely. |
| **Worlds/Stars Without Number** (Kevin Crawford) | **Study-only** (free editions exist but text is copyrighted) | The **faction** schema (stats + Tags + Goals + faction turn) and the **Adventure Tag** bundle (Enemies/Friends/Complications/Things/Places) as *methods*; author our own content. |
| **Tome of Adventure Design** (Matt Finch) | Study-only | The "character motivation / why here" *idea*; our own rows. |
| **The Solo Adventurer's Toolbox** (Paul Bimler, DMs Guild) | Study-only | Genre comp for solo-5e oracle/scene/quest structure. |

**Discipline (same as the backgrounds/biography pass):** mechanics and table *structures* aren't copyrightable; specific flavor text and curated row-sets are. Adopt structures, write original content. Ironsworn is the exception we may quote with attribution.

---

## The models (structure only)

### 1 · Dungeon World **Fronts** → our pressure layer
A *front* is a standing threat with momentum:
- **Dangers** — the who/what of the threat (a faction, a force, a place).
- **Grim Portents** — the ordered steps the danger takes if unopposed = **a clock**.
- **Impending Doom** — what happens when the clock fills.
- **Stakes / Cast** — open questions + the people involved.
- **Campaign front** = large, slow, *external* (the region, the wider world). **Adventure front** = local, immediate, *internal* (this town). → This split is exactly Adam's "outside the town vs inside the town."
Source: [DW SRD — Fronts](https://www.dungeonworldsrd.com/gamemastering/fronts/), [Roll20 compendium](https://roll20.net/compendium/dw/Fronts).

### 2 · WWN/SWN **Factions** → our faction-motivation engine
A faction = **stats** (Cunning / Force / Wealth / Magic), 1–2 **Tags** (capsule descriptors that flavor what it can do), **Goals** (objectives earned over several **faction turns**), and **Assets**. A faction pursuing a Goal on a clock **is a front** — this unifies "faction" and "pressure." Source: [Let's Read SWN: Factions](https://takeonrules.com/2018/12/27/lets-read-stars-without-number-factions/), [WWN review](https://seedofworlds.blogspot.com/2021/12/review-worlds-without-number.html).

### 3 · WWN **Adventure Tags** → our Entry / opening bundle
Each tag yields a packet of **Enemies / Friends / Complications / Things / Places** — a ready "starting-situation seed bundle." This is the cleanest shape for the Entry step (the PC↔world bridge at t=0). ~200 tags across communities / courts / ruins / wilderness in the source; we author our own. Source: [WWN critique](https://eldritchexarchpress.substack.com/p/a-reviewcritique-of-worlds-without).

### 4 · Ironsworn **Truths + Inciting Incident + Connection** → the entry arc (reusable)
Set the world's truths → an inciting incident drops you in → NPCs become **Connections** that develop into **Bonds**. The connection→bond track is the model for *how a backstory seed becomes a present relationship.* CC-BY, so adaptable with attribution. Source: [Ironsworn licensing](https://tomkinpress.com/pages/licensing), [Starforged](https://tomkinpress.com/pages/ironsworn-starforged).

### 5 · Tome of Adventure Design / Solo Adventurer's Toolbox → comps
ToAD has an explicit **character-motivation ("why would they choose this")** table (deep-prep). The Solo Toolbox is the closest solo-5e oracle/scene/quest kit. Both study-only. Sources: [ToAD](https://www.mythmeregames.com/products/tome-of-adventure-design-pdf), [Solo Toolbox](https://www.dmsguild.com/en/product/252355).

---

## Map to what Genesis already has

- **World-genesis rolls** a Setting + smell/sound/arch + **Taboo** + **"The Trouble at Hand" (pressure d100)** + **a Faction** (name/desc) + **a Myth** + nearby places. → We have the *ingredients* but not the *standing situation*.
- **"The Trouble at Hand"** is a one-shot *arrival complication* (debt collector, missing gear…) — the first-five-minutes hook. It is **not** a standing front and does **not** roll internal vs external sources. Keep it as the immediate opener; the new pressures are the slow burn beneath it. (Don't duplicate.)
- **The Faction roll** gives a name + description but **no Goal, Method, or clock** — so factions are static set-dressing, not drivers. This is the motivation gap.
- **World State Ledger** already reserves `clock`, `drift`, and `npc-life` entry types, and the **change-over-time layer (NEXT-STEPS 10–13: reincorporation / faction clocks / drift / NPC life-events)** is unbuilt but unblocked. Fronts/faction-clocks are exactly what those reserved types are for.
- **Char-genesis seeds** (people + threads) are the PC-side raw material for the Entry bundle.

---

## Proposed Genesis-native design (build next session)

**Output format (locked convention, Adam 2026-06-19):** build all of this as **standard Genesis tables** — `# Title` + markdown-table source (mirrored to the inline JS row shape `key:{die,d?,rows:[[lo,hi,"text",extra]]}`), matching the existing ~263 engine tables — **plus a procedure doc** that orchestrates them, exactly like the Treasure Generator procedure calls the loot tables. The rollable content (faction Goal/Method, pressure types, the Entry bundle's five slots) is all plain d-tables; only the clock/advance logic is procedural and lives in the procedure tier. Because we author the content original (IP discipline), formatting is fully ours and stays consistent regardless of how the sources present it — which keeps Track B's compiler special-case-free.

Three composable pieces, all spice-graded (common = Grounded; rare tails Strange→Mythic), all writing to the Ledger so they persist and drift.

### A · Faction Agenda & Clock — extend the existing Faction roll
Per rolled faction, add:
- **Goal / Agenda** (d-table, generic): seize a resource · break a rival · expand territory · restore lost status · acquire a relic or secret · enforce an ideology/taboo · survive a closing threat · profit.
- **Method**: coercion · commerce · faith · infiltration · open force · law · sabotage · alliance.
- **Clock** (4–6 segments) toward the Goal; segments tick on world-drift / montage transitions (→ ledger `clock`). Optional 1–2 **Tags** for capsule flavor.
A faction with a Goal + Clock **is a front** → this is where pressures come from.

### B · Pressure layer — Internal + External (the named gap)
Two new rolls at world-genesis (or at first entry), each a mini-front (Danger → Grim-Portent clock → Impending Doom):
- **Internal Pressure (within the town)** — rooted in the settlement, usually tied to its rolled **Faction / Taboo / Trouble**: a guild tightening its grip · a hidden cult · a blood-feud · a shortage or sickness · a rot in the leadership · a secret kept too long. Mostly Grounded–Textured; rare Strange.
- **External Pressure (from beyond the town)** — approaching from the region/wider world, tied to a **neighboring power / myth / place node**: a rival settlement's faction · a migrating threat · a coming army, blight, or hard winter · something stirring in the ruins or wilds. Spice tail may reach **Volatile/Mythic** (an awakening, an invasion) — your persistent-mutator vision lives here.
Each pressure is written to the Ledger as a standing front; its clock advances on in-world time → feeds drift + reincorporation.

### C · Entry / Opening bundle — the PC↔world bridge (at `cgBind`)
A WWN-tag-style packet generated when a soul enters a world: **Enemies / Friends / Complications / Things / Places**, but each slot **preferentially reincorporates** (1) the PC's rolled backstory seeds, (2) the world's factions + internal/external pressures, before rolling anything fresh. Plus the framing rolls from the char-creation thread: *why you're here · what's pressing · standing with the local power · a foot in the door · the opening clock* — where the **opening clock is drawn from the internal/external pressures** (now they have somewhere to come from). Output: a seeded opening scene handed to the DM, anchoring a couple of the floating backstory NPCs to "here."

**The through-line:** PC backstory seeds + faction agendas + internal/external pressure fronts → one coherent, in-motion starting situation, all persisted in the Ledger and able to drift. This is also the on-ramp to the change-over-time layer (10–13) — building pressures/faction-clocks *is* building drift's content.

---

## Decisions locked (2026-06-19) + build status

| Fork | Adam's call |
|---|---|
| Faction count | **1 dominant + 1d3 rivals** (2–4 total); the rivalry is itself a pressure |
| Factions change over time | **Yes — `Faction Turn` table** (grow / decline / splinter into new rivals / merge / pivot agenda / achieve goal→new goal). Fires on drift; the web is alive, not frozen at creation |
| Presentation | **Player-rolled + Fragment-revealed** — the player rolls the starting state and sees a 6–10 word sensory fragment per result (the locked Fragment oracle); the DM holds the real row + the hidden Impending Doom |
| Pressure timing | **At world-genesis** (world born in motion); **character-entry rolls may feed/aim** a standing pressure too |
| Pressure sources | **Factions + impersonal forces + reincorporated world-rolls + reactions to / effects of PC choices** (reactive, not only rolled at start) |
| Starting intensity | **Honest rolls — let the dice decide; NO override** (the calm/standard/harsh dial was cut 2026-06-19). The only knob is **re-roll the whole world** before founding (Rimworld-style); once founded, it stands. The grounded↔mythic blend is the point |
| Vague ≠ undefined | **Concretize the uncanny.** A Strange+ pressure is vague *to the player* but **immediately resolved behind the screen** to an objective, write-once Ledger fact via the *Making It Real* tables (Buried Power / Intrusion / Becoming / Curse). *What it is* is fixed once established; *how it ends* is shaped by player choice (each entry carries its own levers). Never an unresolved mood |

**Built (data tier) 2026-06-19** — standard pipe tables + a procedure, lint-clean (18/18 tables cover their die range):
- `Engine/03. _Tables/01. World Building/Starting State/Starting State - Factions.md` (Agenda / Method / Tags / Relationship / **Faction Turn**)
- `…/Starting State - Pressures.md` (Source / Internal / External / Impersonal Force / Grim Portent / Impending Doom / **Making It Real**: Buried Power / Intrusion / Becoming / Curse)
- `…/Starting State - Entry.md` (Why You're Here / Foot in the Door / Standing with the Local Power; the 5-slot bundle is procedure-assembled)
- `Engine/02. _Procedures/Starting State Procedure v1.0.md`

**Deferred (next pass):** mirror into `genesis.html` inline data; wire the rolls into world-genesis + `cgBind`; render fronts/clocks in the World view; tick clocks on transitions.

## Sources
- Dungeon World Fronts — [DW SRD](https://www.dungeonworldsrd.com/gamemastering/fronts/), [Roll20](https://roll20.net/compendium/dw/Fronts), [Sly Flourish: Fronts in D&D](https://slyflourish.com/fronts_in_dnd.html)
- WWN/SWN factions — [Let's Read SWN: Factions](https://takeonrules.com/2018/12/27/lets-read-stars-without-number-factions/), [Seed of Worlds: WWN review](https://seedofworlds.blogspot.com/2021/12/review-worlds-without-number.html), [WWN critique](https://eldritchexarchpress.substack.com/p/a-reviewcritique-of-worlds-without)
- Ironsworn / Starforged (CC-BY) — [Licensing](https://tomkinpress.com/pages/licensing), [Let's Talk About Ironsworn Licensing](https://tomkinpress.com/blogs/news/lets-talk-about-ironsworn-licensing), [Starforged](https://tomkinpress.com/pages/ironsworn-starforged)
- Tome of Adventure Design — [Mythmere](https://www.mythmeregames.com/products/tome-of-adventure-design-pdf), [review](http://swordsandwizardry.blogspot.com/2011/11/review-of-tome-of-adventure-design.html)
- The Solo Adventurer's Toolbox — [DMs Guild](https://www.dmsguild.com/en/product/252355)
- Lightweight scene tools — [One Page Solo Engine](https://www.finalparsec.com/pages/solo_rpg_play), [Scene Unfolding Machine](https://jeansenvaars.itch.io/scene-unfolding-machine), [Scene Zero formula](https://solorpgamer.substack.com/p/scene-zero-a-quickstart-formula-for)
