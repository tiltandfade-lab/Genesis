---
type: design-spec
project: Genesis
status: signed off 2026-06-19 — ready to build (§7)
created: 2026-06-19
related:
  - "[[DESIGN]]"
  - "[[CHAR-CREATION]]"
  - "[[STARTING-STATE-MODELS]]"
  - "[[SPICE-CURVE]]"
  - "[[NEXT-STEPS]]"
---

# Genesis — The New Game Flow (the Bardo)

> **The concept (Adam, 2026-06-19).** Starting a game is a single guided passage with a definite start and finish — not a dashboard. A **script-voice spirit-guide** draws the soul through the *bardo* (the between), explaining each beat and each roll, while the player **clicks a die** to roll; spicy rolls fire the **"SPICY!"** celebration, then the **Fragment** appears. At the final beat the character **"opens their eyes"** — and the **DM (Claude) takes over** to narrate waking life.
>
> **Touchstone:** *The Midnight Gospel* — each world is a wholly different place the soul drops into; the passage is the same rite, the destination never is. The vibe is *discovery*, not optimization.
>
> **Division of labor (locked by this spec):** the **script owns the bardo** (deterministic, offline, free, paced — the whole creation walkthrough). The **DM owns waking life** (begins at incarnation, narrates the opening scene from what was rolled). This honors the anti-drift north star (script serves state) and the Tier-1 zero-cost design.

This is an **onboarding layer over rolls that already exist** — `lookup` / `rollTbl` / `rollPressure`, the Character Genesis ritual, `rollStartingState`, `rollEntry`, the `FRAG` veil, and the spice bands are all built. What's new: (1) a **wizard shell** that sequences the beats linearly, (2) **guide-voice narration** between beats, (3) a **click-to-roll die + juice animation** (tumble → band celebration → fragment).

---

## 1. The passage — four stages, then waking

A single linear stepper with a visible spine and a definite finish. Dependency order (world → soul → threads → wake) doubles as the narrative arc.

**Threshold — the guide greets the soul.**
> *"You are nowhere yet. Be still. A world is gathering to receive you."*
Entry from the Universe shelf's "Forge a new world." One button: **Begin.**

**Stage I — The World Coalesces** *(World Genesis — the 9 rolls)*
The place forms out of the dark. Each beat: the guide names what's forming, the player **clicks the die**, it tumbles, juice fires on a spicy roll, the **fragment** settles. Beats in order: the Setting → what's on the air (smell) → in the ear (sound) → what it's built of → the trouble at hand → what you must not do (taboo) → places nearby (the triad) → what they whisper (myth) → a power in the land (faction).
Closes with: **name the world** → *"Let it hold."* (this is `bindWorld` / found).

**Stage II — The Soul Takes Shape** *(Character Genesis)*
- **The Sheet** — the guide asks the soul to *choose its form*: species, class, background (choices, framed by the guide), then **roll the body** — 4d6-drop-lowest, **click-rolled** ability by ability — engine derives HP/AC/mods.
- **The Life** — *"Now remember the life you have not yet lived."* The **Life & Origins** roll-chain, click-rolled in sequence; backstory people & threads are seeded as canon.

**Stage III — The Threads Bind** *(Starting State + Entry)*
The cords that tether soul to world. The world's **powers and pressures** surface (pressures as **fragments** — the guide hints, the danger stays veiled); then **your ties**: the opening bundle (Enemies / Friends / Complications / Things / Places) and your arrival (Why You're Here / Foot in the Door / Standing).

**Stage IV — You Open Your Eyes** *(Incarnation — the handoff)*
The guide steps back.
> *"The cord is cut. Open your eyes."*
The script assembles the full **handToDM** payload (world with real names, the character, powers/pressures with DM-only danger + doom, the opening bundle, the opening tension) and **the DM takes over** — the fragments you saw in the bardo now resolve into a narrated first scene. **This is the defined finish of New Game.** The reveal arc is literal: you walked in on fragments; you wake, and the world resolves.

---

## 2. The dice interaction (click-to-roll + juice)

The signature beat. Per roll:
1. The guide presents the die — its real notation (`d100`, `2d20`, `d12 + d8`) from the dice-aware engine.
2. The player **clicks** the die. It tumbles (extend `animateDie`).
3. On settle, the **band drives the juice** (per `SPICE-CURVE` §5):

| Band | Exclamation | Animation |
|---|---|---|
| Grounded | — | none |
| Textured | a soft chime | subtle shimmer |
| Strange | "Bizarre…" | glitchy wobble |
| Volatile | "Otherworldly!" | color-bleed pulse |
| Mythic | **"SPICY!!"** | screen-shake / reality-buckle |

4. The **fragment** fades in (the player's view); the real row is held for the DM.
5. **Reroll — three turnings-back (Adam, 2026-06-19).** The guide grants **3 rerolls for the entire passage** (a shared budget, `REROLL_BUDGET=3`, spent per-beat — *not* 3-per-beat). This is deliberate: Genesis is a game of **discovery, not save-scumming** — you live with most of what the dice give you, and rescue only a precious few. A small counter shows turnings-back remaining; when spent, the reroll affordance is gone and the guide notes it (*"No more turning back. This is the world."*). Nothing is canon until you found / wake (Rimworld-reroll model in DESIGN); after waking, canon. *(Open: if you meant 3-per-beat, easy swap.)*

Roll-heavy sections: **scores** = six individual click-rolls (tactile, you feel the body assemble); **the Life chain** = click-through sequence; **the opening bundle** = revealed as the threads bind. (Optional later: a "roll the rest" for veterans.)

---

## 3. Guide voice (script-authored narration)

Calm, liminal, second-person — a psychopomp, not a tutorial bot. ~2–3 short lines per beat, enough to teach a new player what this roll *is* without breaking the spell. Drafts:

- *Setting:* "Every world begins as a place. Roll, and see where you will wake."
- *Smell / Sound / Built-of:* "The senses come before the eyes. Breathe it in."
- *Trouble at Hand:* "No world receives a soul in peace. Something is already wrong here."
- *Taboo:* "Every people guards a line. Learn theirs before you cross it."
- *Myth:* "What they believe is truer, here, than what is true."
- *The Sheet:* "Choose the shape you will wear. Then let the dice fill it with breath."
- *The Life:* "You have not lived yet — and yet you have. Remember it now."
- *Threads bind:* "A soul does not arrive alone. Here are the cords that hold you."
- *Waking:* "The cord is cut. Open your eyes."

(Full copy authored at build time; this sets the register.)

---

## 4. Returning-player handling — three registers, the third eternal (Adam, 2026-06-19)

The guide **speaks less each time you pass.** Three copy registers, keyed by how many worlds you've forged (`U` knows the count). The wizard stays the only path; the dice/juice/fragments never change — only the guide's voice thins. The psychopomp grows familiar, then quiet; by the third passage it barely speaks, and **that third register loops forever** for every world thereafter — you have become practiced at being born.

- **First passage — the full rite.** The teaching voice (§3 drafts). The guide explains what each roll *is*.
  > *"Every world begins as a place. Roll, and see where you will wake."*
- **Second passage — recognition.** Shorter, warmer; assumes you know the shape. Teaching trimmed to a clause.
  > *"You return. You know this part — the world, first. Roll."*
- **Third passage onward — the eternal register (loops forever).** Nearly silent. Only the ritual remains: the name of the beat and the die. No explanation. Liminal and spare.
  > *"Again. The place. Roll."*  →  *"The senses."*  →  *"The trouble."*

This is the design, not a toggle — the thinning *is* the returning-player experience (a quiet reward for the veteran, and on-theme: birth becomes routine to an old soul). A **"swift passage"** convenience toggle can still let a first/second-timer jump straight to the eternal register if they want silence sooner. *(Rejected: a "Quick Forge" auto-roller — it skips the dice juice, which is the point.)*

---

## 5. Architecture notes

- **New `NEWGAME` state machine** in `genesis.html`: `{stage, step, data, history}` with `advance()` / `back()` / `reroll()`. One unified **New Game panel** with a stepper replaces the current separate `panel-genesis` + `panel-charge` as the *entry path* (those render functions are reused inside the stepper, not deleted).
- **Reuses** every existing roll: `lookup`/`rollTbl`/`rollPressure` (now returning `idx` + fragment), the `cg*` character ritual, `rollStartingState`, `rollEntry`, the `FRAG` veil, the spice bands.
- **Inline, not compiled.** The bardo runs on the inline rituals (which carry the fragments). The compiled `tables.js` + Oracle stay separate (migrating rituals onto the compiled layer remains optional future work).
- **The handoff** at Stage IV is the existing `handToDM` payload — already complete. New Game's finish = fire it + drop into the World view / chat.
- **Universe / World / Oracle unaffected** as concepts: Universe is still the shelf, a World is still the save, the Oracle is still the standalone roll tool. New Game is the *guided path that creates a World*.

---

## 6. Decisions — all resolved (Adam, 2026-06-19) ✅

1. **Stage order** — ✅ **World → Soul → Threads → Wake** (locked; the *Midnight Gospel* "drop into a new place" feel).
2. **Reroll** — ✅ **per-beat spend from a shared budget of 3 ("three turnings-back")** for the whole passage (§2). Discovery over save-scumming.
3. **Returning-player** — ✅ **three thinning registers, the third loops forever** (§4): full rite → recognition → eternal-near-silence.
4. **Choices vs rolls** — ✅ the guide **frames both** (species/class/background choices *and* every roll).
5. **DM entry** — ✅ **only at Stage IV (waking).** The bardo is script-only in v1.

**Spec status: signed off — ready to build per §7.**

---

## 7. Build sequence (once signed off)

1. ☑ Wizard shell + stepper + `BARDO` state machine — **DONE 2026-06-19** (`startBardo`/`renderBardo`/`bardoNext`/`bardoBack`, phase threshold→beats→found, 3-reroll shared budget, 3 guide registers via `worldsForgedCount()`).
2. ☑ Click-to-roll die + juice animations — **DONE** (`bardoFx` tumble; `spicePop` + CSS `j-textured/strange/volatile/mythic` shimmer/wobble/bleed/shake + the "Bizarre…/Otherworldly!/SPICY!!" pop; fragment fade-in).
3. ☑ Stage I (The World Coalesces) end-to-end — **DONE**, verified headless (full 9-beat walk → found → world created; reroll budget enforced; script parses clean). `newWorld()` now launches the bardo; founding hands off to the existing char-genesis from the world view.
4. ☐ Stages II–III (Soul / Threads) inside the stepper (reuse char-genesis + starting-state).
5. ☐ Stage IV waking handoff + finish (reuse `handToDM`).
6. ☐ Returning-player register polish + swift-passage toggle (registers wired; copy can deepen).
7. ◐ Verification: headless ☑ each step; **in-browser pass pending Adam's playtest** (animations only confirmable in a real browser).

### Playtest 1 patches (2026-06-19) — ☑ done
Removed the "a fragment · your DM knows" subline; **taboo expanded to a full d100 spice curve** (28 rows, Grounded→Mythic — the first world table that can hit SPICY!!; `catBand` now maps Volatile/Mythic so any world table can); **rolling list** of category + fragment accumulates under the card as you go; **world-name randomizer** ("🎲 name it for me") alongside manual naming. *(Source-sync debt: the inline `T.taboo` outgrew the markdown `Social-taboos` source — reconcile when rituals migrate to the compiled layer. The other 8 world tables can get the same d100 spice-curve treatment as a follow-up.)*

---

## 8. The Curve of Revelation (the anti-overwhelm principle)

**Problem (Adam's playtest 2026-06-19):** the bardo is calm and legible — one beat at a time — and then founding **dumps the full World view at once** (gazetteer + Powers & Pressures + World State Ledger + hex map + clock + transitions + explore + hand-to-DM). *"Instantly overwhelmed… I helped create this and I don't even know what I'm looking at."* The guided grace collapses the moment you wake.

**Principle: progressive disclosure.** The world is **born minimal** and each system **reveals the first time it becomes relevant**, with one line from the (now-fading) spirit-guide. The guide doesn't vanish at waking — it lingers as a thinning tutorial presence for the first few reveals, then goes quiet. The whole experience becomes **one continuous curve**: bardo (one beat at a time) → waking (*a scene, not a dashboard*) → early play (systems bloom as you meet them) → the full instrument, once learned.

**Mechanism:**
- At **waking**, the World view shows only: *where you are* + the opening scene + **Hand to DM**. Nothing else.
- Each subsystem is **gated on first relevance**, introduced once by the guide:
  - **The Map** — first time you travel. *"This is the map. It grows only where you walk."*
  - **The World State Ledger** — after your first canon event / transition. *"Everything that happens is written here. It does not forget."*
  - **Powers & Pressures** — when a faction or pressure first touches the fiction (or when the opening tension surfaces). *"Forces are already in motion. You'll feel them before you see them."*
  - **The Clock** — at your first declared transition (travel / rest / montage).
  - **Explore / transition** controls — as each concept is introduced.
- Once revealed, a panel **stays**. State: `world.revealed = {map, ledger, powers, clock, …}`, flags set on first trigger.
- **Ties to the three registers:** first world = the full gentle bloom; second = faster/lighter; **third+ = everything open from the start, guide silent** (the veteran wakes already knowing the room). A "show everything" escape exists for anyone who wants the full board early.

**Build implication:** Stage IV (waking) opens into this *minimal* world view, and the `revealed` flags drive the dashboard's growth. So the Curve of Revelation isn't a separate feature — it's **how Stages IV + early play are built.** It supersedes the blunt "dump the world view" that founding does today.

### ⟳ Revision — Playtest 2 (2026-06-19): soul-first · one-choice-everywhere · chat-first
Adam's second playtest reframed the experience. **These supersede §1/§6 where they conflict.**

1. **Order reversed → `soul → sheet → life → world`.** Craft the soul first; the world materializes around the incarnating soul ("craft the soul, then the soul comes into the material world"). The world-genesis beats now run **last**, and within them **"The Trouble at Hand" is the final reveal** — the hook into play (done: moved to last in `STAGES`). New stages: **Soul** (essence/concept) → **The Sheet** (species/class/background + scores) → **The Life** (backstory) → **The World** → **Waking**.
2. **One choice / one roll at a time — for ALL of creation.** The guide leads everything; no menus (kills the current menu-heavy `#panel-charge`).
   - **The Sheet:** species, class, background as **single guided choices**, one screen each, every option carrying a **tooltip / guide explanation** ("we absolutely need tooltips"). Not a form.
   - **Ability scores:** roll **4d6-drop-lowest per ability, one at a time** (six dice moments), then **at the end** choose **"best for class"** (auto-assign) or place by hand.
   - **The Life:** the roll-chain proceeds **one roll at a time** — each result given room to breathe ("a moment with the background… imagination to wander"). No batch roll.
   - *Efficiency is not the goal; presence is.*
3. **Chat-first interface** — see §9.
4. Content done this pass: **smell + sound → d100 spice curves** (unpleasant smells now rare; uncanny tail). Remaining small world tables (arch, etc.) get the same treatment as follow-up.

## 9. The interface — chat-first, menus to the side (Adam 2026-06-19)
Genesis should be **mostly a chat interface** with the DM, with **beautiful text animations** — not a tabbed dashboard. Touchstones: **Baldur's Gate 3** (a left-hand nav rail of menus) + **Disco Elysium** (open a menu → chat slides into a column beside it).
- **Universe / World / Oracle tabs are NOT front-and-center.** The default view is the **DM chat**, centered.
- A **left-hand nav rail** holds the menus (sheet, spells/actions, map, ledger, world, oracle, universe…), collapsed by default — the game is the conversation.
- **Opening a menu** slides the chat into a **right-hand column** (two-pane), so a player can keep **spells & available actions pinned** while the conversation continues.
- The **Curve of Revelation (§8) still governs** which menus exist in the rail: a first-timer earns them; veterans get the full rail.
- This is the **post-creation main game shell**; the bardo stays a focused full-screen passage that dissolves into this chat-first view at waking.
- **Status:** direction captured; substantial shell redesign — its own build track after the creation reshape.

## Build order from here (revised 2026-06-19)
1. ☑ **Reshape creation into the guided one-choice flow, new order — BUILT 2026-06-19 (verified headless).** The bardo is now a single SEQ — **threshold → soul (name) → species → class → background (guided choices w/ tooltips) → scores (4d6-drop one ability at a time, then "Best for class" / "As they fell") → life (origins · path · events, one roll each) → world (9 beats, trouble last) → found ("open your eyes")**. At found, `bardoFound` assembles the **world then the character into it** (`bindWorld` + `cgBind`, reusing all existing char logic). No menus — every step is one guided choice/roll. Verified: full walk creates world + character (species/class/background/scores/life/entry) in the new order; parses clean. The old `#panel-charge` menu is bypassed (kept only for the fate/successor path). *(Coarseness to refine on playtest: Life is 3 beats, not every sub-roll atomized; score dice lack the full tumble juice; choices advance via Next.)*
- *Playtest-3 polish (2026-06-19, done):* **name moved to the very last beat** (character + world both named at "open your eyes," once you know them — the "stay nameless" stale-button bug is gone); **dice show the real notation** (`4d6` for scores, `d100`/`d6` for life) with a tumble (`bardoDieFx`), replacing the generic ⚅ — The Setting's die is the standard. Soul beat is now a wordless intro.
- *Playtest-4 (2026-06-19, done):* **Life is now one roll per sub-table** (dynamic queue: parents · birthplace · siblings → birth-order · family → absent-parent · means · home · memory · why-background · why-calling · age → life-events ×N — each its own die-roll beat with a guide prompt; ~13+ beats). Each result given a moment; reroll per beat from the shared budget.
2. ◐ **Chat-first interface shell** (§9) — **v1 done 2026-06-19:** tabs relocated to a **left nav rail** (✦ Universe · ◈ World · ⚅ Oracle), panels render in a `.stage` content column; creation passages (bardo/genesis/charge) go **immersive** (rail hidden, full-width). **Remaining (the substantive part):** the **chat/scene-centered World view** (Chronicle as a conversation feed + scene header + action input/Hand-to-DM) and the **Disco-Elysium column-slide** when a rail menu opens; promote the revealed panels (sheet/map/ledger…) into the rail per the Curve of Revelation.
3. ☐ Polish: arch + remaining world tables → d100 spice (smell+sound+taboo done); returning-register copy; richer score-roll juice.

---

**BUILT 2026-06-19 (verified headless).** Founding now wakes a first-timer into a **minimal** world view (Soul + Opening + actions + Hand-to-DM); `world.revealed={}` gates Powers/Map/Ledger/Gazetteer. Triggers: **travel → Map (+Gazetteer)**, **first transition → Ledger**, **montage → Powers** — each with a fading-guide toast. **Refinements (Adam):** reveal-gating is **first-timers only** — learned panels persist at the universe level (`U.revealed`), a **"⊕ reveal all panels"** link is always available, and **veterans (3rd world+ or opted-in) wake with everything open**. **Diegetic clock:** the HUD shows **day + time-of-day band** ("Day 2 · morning"); the exact minute is hidden unless `w.knowsTime` (a hook for a future timepiece/class — Adam's instinct: you'd know the light, not the minute); the DM handoff (`fmtClockFull`) keeps exact time. *(Open: which classes, if any, grant `knowsTime` — Adam unsure, left off for now.)* Player-facing transition strings band-ified; DM record keeps exact.
