---
type: system-spec
project: Genesis
status: specced
created: 2026-07-01
author: Opus (frontier spec) — for Sonnet execution, Opus review
inputs:
  - ~/Desktop/genesis-ui-wireframe-brief.md   # the design brief
  - ui-sketches/claude-design-revamp-070126/Genesis In-Session Wireframes.html   # the 7 rendered states
---

# In-Session UI Redesign — Build Spec

> ## ⚠️ WAVE 10 DESIGN-SUPERSESSION NOTICE (2026-07-20 — no build authorized)
>
> This document remains the accurate build record/specification for the current in-session shell. Promoted
> procedural-design Wave 10 has reopened the **future** shell orientation: a narrow left icon rail, the SceneTray /
> PreAlpha BattleMat as the central visual hero, persistent highly legible translucent DM conversation on the
> right, and compact left information drawers that do not replace the scene. That direction supersedes this spec's
> persistent-status-left / narration-center / slide-in-panel-right orientation **for the next visual design**, but
> does not authorize code changes or invalidate the existing implementation. Do not execute the new direction until
> Wave 10 closes and produces a replacement implementation spec. Authority and taste cards:
> `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.2.

> ## ⚠️ ADDENDUM (2026-07-01, REV 2) — VISUAL FIDELITY: PORT THE MOCKUP EXACTLY
>
> **The first build (branch `feat/in-session-ui`, commit `0e09128`) was structurally right but diverged
> from the design file. This rev supersedes the "match, don't reinvent the skin" guidance below: the
> in-session view must render VISUALLY IDENTICAL to the mockup. The mockup is not inspiration — it IS the
> spec. Reproduce it; don't interpret it. The data wiring from the first build is CORRECT and stays — this
> pass reworks CSS + layout + rail markup only.**
>
> **Reference artifacts (use BOTH):**
> - **Readable source:** `ui-sketches/claude-design-revamp-070126/_mockup-clean.html` — the mockup
>   un-escaped, every element carrying its exact inline styles (colors, `border-radius:0`, paddings, the
>   R3 rail, the frame). Read it and port its values.
> - **Visual truth:** serve the mockup folder over `python3 -m http.server` and compare the app to it
>   screenshot-by-screenshot, per state, until they match.
>
> **⚑ The game is the `.frame` INTERIOR only — not the wireframe doc.** The mockup is a document showing
> each state as a labeled card: `.board` → `.st-hd` (`.st-id` "S1", `.st-name` "Default in-session", `.st-note`
> caption) + `.frame` (the game). **Reproduce ONLY `.frame`'s contents** (the flex row: sidebar `flex:0 0
> 232px` + feed + panel), expanded to fill 100vw×100vh. **Strip** the `.board` card, all `.st-*` labels/
> captions ("Default in-session" etc.), the body-centering, the `#__bundler_*` boilerplate, the R1/R2/R3
> comparison section, the "Try next" footer, and the multi-state stacking. There is NO "Default in-session"
> heading in the game — that's a wireframe label. The app's full-viewport `.wrap.ingame` == the `.frame`
> interior, minus `.frame`'s own card border/radius/fixed-size and the centering.
>
> **The three corrections that were missed (each cascades across every element):**
> 1. **Squared corners — `border-radius:0` everywhere in-session.** The mockup uses radius `0` throughout
>    (badges, HP bar, AC box, panels, composer, event chips, ability-score boxes, buttons, rail tabs); the
>    ONLY nonzero radii are `50%` (circular dots/dice) and a rare `6px`/`8px`. The build inherited the
>    parchment skin's `border-radius:11px`/pills — strip it. Confirmed badge style: `font-size:11px;
>    padding:2px 8px; border-radius:0; border:1px solid <hue>; background:rgba(<hue>,.1)` (Poisoned
>    `#a8432c`; Inspiration `#b58f3c` border / `#6b5115` text / `rgba(180,143,60,.18)` bg, `◆` prefix,
>    `font-weight:600`).
> 2. **True full-bleed — kill the centered container.** Remove `.wrap.ingame{max-width:1180px}` and all
>    centering; remove the in-session footer tagline ("GENESIS · Arcana Engine branch…"); remove the
>    floating-card gutters and outer margins. The three zones **tile the whole viewport edge-to-edge**,
>    adjacent, separated by thin dividers/borders (as in the mockup) — NOT floating rounded cards on a
>    stone margin. The feed owns full height. Sidebar ≈ the mockup's `flex:0 0 232px`; feed flexes; panel
>    on demand. This is a video game filling the screen, not a centered web page.
> 3. **Rail = R3 "Framed tabs".** The mockup's rail section shows three options — R1 (icons+labels),
>    R2 (icons only), **R3 (framed tabs): "Active item juts toward the feed as a parchment tab — reads as
>    *this panel is open*."** Rail items are **centered icon-over-label** (glyph on top, small-caps label
>    under); the **active** item is a **squared parchment tab that extends rightward toward the feed**,
>    visually connecting to the open panel. Port the mockup's exact rail markup + styles. (The build
>    shipped horizontal left-aligned items with a highlighted rounded box — wrong.)
>
> **Also fix in this pass (real bugs found in the `/code-review`):**
> - **Powers panel is orphaned** — add an `openPanel('powers')` entry to the ⚙ Menu (`actionsMenu`); it's
>   currently reachable from nowhere.
> - **Rail must never clip** — with many condition badges the sidebar can push the rail (incl. the ⚙
>   button) below its `overflow:hidden` clip. Guarantee the rail is always visible (rail `flex-shrink:0`;
>   let the badge area scroll within its own bounded box, not the rail). Don't solve overflow by pushing
>   the rail off-screen.
> - **⚙ Menu popover must not clip** — fix the "Oracle/Reveal-all cut off" bug by giving the menu its OWN
>   internal scroll (`max-height` + `overflow-y:auto`), not by forcing all items to fit.
>
> **Scroll rule (relaxed 2026-07-01):** the PAGE never scrolls and the FEED is the primary scroll region —
> BUT the slide-in `.panel-col` (Character/Actions/Map) AND the ⚙ Menu popover **may scroll internally**
> when their content overflows (`overflow-y:auto` is fine and preferred over clipping/cramming). What must
> NEVER scroll away or clip: the page itself and the RAIL (the nav buttons must always be reachable). This
> supersedes the strict "every zone fits with no scrollbar" language for the panels and the menu.
> - Sweep dead `.cp-head`/`.cp-badge*` CSS; factor the duplicated Character/Actions tab-bar into one helper.
>
> **The port is STRUCTURAL + INTERACTIONAL, not just CSS.** The mockup has components the first build
> flattened — reproduce structure and interactions, not just colors:
> - **Character › Sheet:** SAVING THROWS and SKILLS are **collapsible dropdown sections** (chevron headers),
>   not flat lists — reproduce collapse/expand (a new `GS` toggle is fine).
> - **Actions › Spells:** the structured layout — "PACT MAGIC · SPELL SLOTS" + the dot slot-tracker +
>   "Recovers on a short rest", "Mystic Arcanum — none until Lv 11", "CANTRIPS · AT WILL" reference cards
>   with hover-for-text (e.g. Eldritch Blast "Two beams · 1d10 force each").
> - **Inventory** (EQUIPPED slots + CARRIED list w/ ATTUNED/EQUIPPED chips + USE/STOW/EQUIP/READ + LOAD bar),
>   **Actions** reference cards, **Abilities** resource pips, **Map** node-graph, ⚙ Menu, event chips, and
>   the contextual roll prompt — all matched to the mockup's structure.
>
> **Method:** build a component INVENTORY from `_mockup-clean.html` (every state → every component → its
> structure + interactions), reproduce each intentionally. **Design intentional, not coincidental** — every
> structure/spacing/color traces to a deliberate mockup choice; nothing inherited-by-accident. Flag any
> genuinely ambiguous component rather than guessing.
>
> **ABSOLUTE RULE — do not lose the wiring.** Every binding + handler must keep working (equip/use/attune/
> stow/read → `item_changed`; `dmRollFor`/`dmRollDice`; tab switches; panel open/close; level-up
> banner/picker; ⚙ Menu actions; composer/`sendTurn`). New interactions (collapsibles, hover cards) get
> `GS` state without disturbing data flow. When restructuring markup, **re-point** existing onclicks into
> the new structure — move the wiring, never drop it.
>
> **Dice UI is contextual-only.** REMOVE the standing "🎲 Roll dice" tray (render.js ~181–185 + `.dice-tray*`
> CSS). KEEP the in-feed contextual roll prompt (render.js ~155–165, `dmRollFor`/`dmRollDice`) — it already
> appears only on a DM roll-request and presents the exact dice; restyle it squared. After this, the ONLY
> dice UI anywhere is that contextual prompt.
>
> **Feed readability (Adam's override of the mockup's text size — feed only):** bump narration prose ~18%
> (`.dm-txt` `20px`→~`23.5px`, comfortable line-height, related feed text scaled proportionally); add message
> padding/spacing. **Dynamic horizontal padding as a reading-measure control:** GENEROUS `padding-inline`
> when the feed is full-width/no panel so prose sits in a ~60–80-char column not edge-to-edge on a
> widescreen (e.g. `clamp(32px,8vw,180px)`); REDUCED when squished by an open panel (`.game.has-panel
> .chat-col`, e.g. `clamp(16px,2vw,40px)`). Composer/roll-prompt/event-chips align to the same measure.
>
> **Acceptance is now VISUAL, per state.** For each state — default (no panel), Character Sheet/Inventory/
> History, Actions Actions/Abilities/Spells, Map, ⚙ Menu — screenshot the app and the mockup at the same
> viewport and confirm they match (squared corners, full-bleed frame, R3 tabs, spacing, colors). The jsdom
> structural tests (§9.3) must stay green but are SECONDARY: **a green harness with a wrong-looking screen
> is a FAIL.** Iterate against the visual until it matches the mockup.

**One-line:** rebuild the in-session game view into the three-zone frame the wireframes show —
a **persistent status sidebar** (left), the **narration feed as a full-height hero** (center),
and **slide-in panels** (right) — by rewriting `renderWorld` and its rail/panel helpers in
`src/world/render.js` plus the in-game CSS in `genesis.html`. **Refine-not-rebuild:** almost all
panel *content* already renders; this is a re-layout + a new sidebar + a slimmer rail, not net-new
content rendering.

This is a **single spec, executed in one Sonnet pass** (Adam's call, 2026-07-01). Rail triage is
**exactly the brief** (Adam's call): rail = Character · Actions · Map · ⚙ Menu; Ledger folds into
Character › History; Codex hidden; Spells becomes an Actions tab; Powers + Universe + Oracle move
into the ⚙ Menu; "Story" is the default no-panel feed.

---

## 0. Ground rules (do not violate)

- **Classic-script globals only.** No ES modules, no build step. All new functions are top-level
  `function` decls in existing modules; the UI stays on inline `onclick="fn()"` (CLAUDE.md contract).
- **Never hand-edit generated artifacts** (`tables.js`, `data/class-progression.js`, etc.). Nothing
  here touches them.
- **Register every new/changed module in `manifest.json`** and run `python3 build/check-manifest.py`
  after edits — it fails on orphans/drift. This change edits existing modules only (no new files
  expected), but any new owned symbol must be added to that module's `owns` list.
- **The page never scrolls.** Only the feed's message list (`.dm-feed`) scrolls. Every other zone
  fits the viewport height with no scrollbar. This is already true for the feed today (`.wrap.ingame`
  CSS, genesis.html ~382–393) — preserve it.
- **Desktop horizontal only.** Keep the existing `@media(max-width:760px)` stacking fallback working
  but do not invest in mobile.
- **Do not change any engine/state logic.** This is presentation. Read from the sheet; never mutate it.

---

## 1. The target layout

Three columns inside `.wrap.ingame > .stagecol`:

```
┌──────────────┬────────────────────────────┬───────────────┐
│ STATUS       │   NARRATION FEED (hero)     │  SLIDE-IN     │
│ SIDEBAR      │   scene header (minimal)    │  PANEL        │
│ (persistent) │   .dm-feed  (scrolls)       │  (on demand)  │
│              │   composer (pinned)         │               │
│  identity    │                             │  Character:   │
│  HP bar +tmp │                             │   Sheet/Inv/  │
│  AC          │                             │   History     │
│  cond badges │                             │  Actions:     │
│  clock       │                             │   Actions/    │
│  location    │                             │   Abilities/  │
│  ── divider  │                             │   Spells      │
│  RAIL        │                             │  Map          │
│   Character  │                             │               │
│   Actions    │                             │               │
│   Map        │                             │               │
│   ⚙ Menu     │                             │               │
└──────────────┴────────────────────────────┴───────────────┘
   narrow          fills remaining width         moderate
 (flex ~0 0 15em)  (flex 1, the hero)          (present only
                                                 when open)
```

Relative sizing (no hard pixels for the majors):
- **Status sidebar** — a narrow fixed-content column, `flex:0 0 15em` (tune to fit content; must not
  wrap the identity/clock lines). Never scrolls.
- **Feed** — `flex:1`, the hero. When a panel is open it reflows narrower (see below).
- **Panel** — present only when `GS.gamePanel` is set. Today `.game.has-panel .chat-col{flex:0 0 46%}`
  splits chat/panel 46/54 inside `.game-main`. Keep that behavior: sidebar is *outside* `.game-main`,
  so opening a panel narrows the **feed**, never the sidebar.

### The DOM `renderWorld` must emit (replace lines ~234–240)

```
<div class="game ${panel?'has-panel':''}">
  ${statusSidebar(w, cur, panel)}          <!-- NEW: identity/HP/AC/cond/clock/loc + rail -->
  <div class="game-main">
    <div class="chat-col">${sceneHead(w)}${chat}</div>
    ${panel ? `<aside class="panel-col">${gamePanelContent(w,cur,panel)}</aside>` : ""}
  </div>
</div>
```

`statusSidebar` is the new left column: the status readout **and** the rail beneath a divider (the
rail is no longer a sibling of `.game-main`; it lives in the sidebar per the brief §51–59). Remove the
old top-of-chat `scene-head` clock pill (the clock relocates to the sidebar); `sceneHead(w)` shrinks
to near-nothing (see §4).

---

## 2. Zone 1 — the status sidebar (NEW)

New function `statusSidebar(w, cur, panel)` in `src/world/render.js`. Emits a `<aside class="status-side">`
containing, top to bottom:

1. **Identity** — `cur.name` as a heading; below it a small `ancestry · class · Lvl N` line. **Reuse the
   exact identity expression already built in `renderCharacterPanel`** (the `cp-head`/`cp-sub` block,
   ~line 465+) — read the same sheet fields it reads; do not invent new field names. If `!cur`, render
   the empty state (§2a).
2. **HP** — a bar with `current / max` and a **temp-HP** indicator when `sh.tempHp > 0`.
   - `const hpCur = (sh.hpCur==null ? sh.hp : sh.hpCur);` (same as render.js:455)
   - max = `sh.hp`; temp = `sh.tempHp || 0` (field owned by `engine.death`, death.js:98–100).
   - Bar fill % = `hpCur / sh.hp`. Show `+N tmp` as a small blue chip beside the numbers when temp>0.
   - Reuse the existing HP bar visual language if one exists; otherwise a thin parchment-inset bar with
     a blood→gold fill. Low-HP (≤¼) may tint the fill toward `--blood`.
3. **AC** — a shield glyph + `sh.ac`. Reuse the `cp-badge.ac` treatment (render.js:559) or a compact
   shield chip.
4. **Condition badges** — small chips, absent when none:
   - Active conditions: enumerate `sh.conditions` via `condName(e)` (engine.conditions owns
     `condName`/`hasCondition`/`CONDITIONS`). One chip per condition, Title-Cased.
   - **Exhaustion** — if `exhaustionLevel(sh) > 0` (engine.hazards owns `exhaustionLevel`), one chip
     `Exhaustion N`.
   - **Inspiration** — if `hasInspiration(sh)` (engine.check owns `hasInspiration`), a distinct
     gold "◆ Inspiration" token.
   - Use the existing `.item-cond`/chip styling family for consistency; condition chips lean
     `--blood`-ish, inspiration leans gold (matches the wireframe).
5. **Clock** — `Day N · time-of-day` and `Session N`. Reuse `fmtClock(w)` (world.state) and `w.session`.
   This is the clock's ONLY home now (removed from `scene-head`).
6. **Current location** — `nodeName(w, w.currentNodeId)` (world.state), with the location glyph (◈).
7. **Divider**, then the **rail** (§3) — `gameRail(w, cur, panel)`, restyled vertical, anchored so the
   whole sidebar fits the viewport height with no scrollbar.

### 2a. Empty state (`!cur`)
When no living soul is in play, the sidebar shows a muted identity ("No soul in play") and suppresses
HP/AC/conditions; the clock + location + rail still render. (The feed already shows the
"Roll a soul into the world" strip — render.js:229–231 — leave that.)

### 2b. Live binding
The sidebar reads the **current living character** exactly as `renderWorld` already computes it:
`const cur = w.characters.filter(c=>c.status==="living").slice(-1)[0] || null;` (render.js:207). Every
sidebar value is derived from `cur.sheet` at render time — since `renderWorld()` re-runs on every DM
turn / state change, the sidebar stays live for free. **Do not add any new state to `GS`** for this.

---

## 3. Zone 2 — the rail (retriaged to exactly the brief)

Rewrite `gameRail(w, cur, panel)`. The rail now lives **inside** `statusSidebar` (below the divider),
styled as a vertical stack that fits the sidebar's remaining height. Final rail — **four items only**:

| glyph | label | opens | show condition |
|---|---|---|---|
| ☖ | **Character** | `openPanel('character')` | `!!cur` |
| ⚔ | **Actions** | `openPanel('actions')` | `!!cur` |
| ◉ | **Map** | `openPanel('map')` | `isRevealed(w,'map')` |
| ⚙ | **Menu** | `toggleMenu()` (popover, NOT a panel) | always |

- **Story** is not a rail button — it's the default state (no panel open). Clicking an active rail
  glyph again closes back to the feed (existing `openPanel` toggle, render.js:629). Provide a visible
  "close/back to story" affordance too (the panel's `×`, already present).
- **⚙ Menu** is set apart at the bottom (a `grail-sep` above it) and opens the overflow popover (§6),
  not a slide-in panel.
- **Removed from the rail:** Story (now implicit), Spells (→ Actions tab), Codex (hidden), Ledger
  (→ Character › History), Powers (→ ⚙ Menu), Universe (→ ⚙ Menu), Oracle (→ ⚙ Menu).
- Keep the `gico(name,glyph)` icon-with-fallback helper (render.js:280). Keep per-item reveal-gating
  where it applies (Map on `isRevealed(w,'map')`).

---

## 4. The center — scene header + feed + composer

- **`sceneHead(w)` shrinks to near-nothing.** The location + clock move to the sidebar. Keep at most a
  faint world/location whisper at the top-right of the feed (the wireframe shows a small "◈ EMBERREACH"
  top-right) — or drop the header band entirely so the feed starts at the frame's top. Reclaiming this
  vertical space is an explicit goal (brief §96). The **session start/end button** (currently in the
  scene-head, render.js:210–212) moves into the ⚙ Menu (§6).
- **The feed is unchanged in content** — `renderDMFeed(w)` (render.js:121), `streamDMText`, event chips
  (`eventChip`), roll prompts, the pinned composer (`.dm-input`). Do not touch feed rendering, streaming,
  or the composer. Only its *container width* changes (it's now the hero between sidebar and panel).
- **`worldActions(w)`** (the `<details>⚙ World & transitions` block under the chat, render.js:300) is
  **removed from the feed** — its controls move into the ⚙ Menu (§6). The feed shows only narration +
  composer.

---

## 5. Zone 3 — the slide-in panels (tabbed; wrap existing renderers)

`gamePanelContent(w, cur, panel)` (render.js:322) gains two tabbed panels. Each panel keeps the existing
`.panel-close` × (→ `openPanel(null)`).

### 5a. Character panel — tabs: Sheet · Inventory · History
- A tab bar at the top of the panel; active tab in `GS.charTab` (default `'sheet'`). Add a
  `setCharTab(t)` function that sets `GS.charTab` and re-renders (`renderWorld()`), like `openPanel`.
- **Sheet** — the ability-scores/combat/saves/skills block **already rendered by
  `renderCharacterPanel(w,cur)`** (render.js:450). Split its current output: the *identity + HP/AC*
  header (`cp-head`/`cp-badges`) is now redundant with the sidebar — **drop that header from the Sheet
  tab** (or keep a slim echo) and lead with ability scores. The rest (scores, combat block, saves,
  skills, XP) stays.
- **Inventory** — the equipped-slots + carried-list + load bar **already in `renderCharacterPanel`**
  (the `inv`/encumbrance section, render.js:470+). Extract that section into its own tab. Keep all
  equip/use/attune/stow controls and their `onclick`s intact.
- **History** — **`renderCharacterHistory(w,cur)`** already exists (render.js:594). This tab hosts it,
  and **absorbs the player-facing Ledger** — fold `renderLedger`'s player-visible slice
  (`ledgerPlayerVisible`, render.js:652/660) in here so the standalone Ledger rail item can retire.

> Splitting `renderCharacterPanel` into three tab-bodies is the biggest single refactor here. Do it by
> extracting three helpers — `charSheetBody(w,cur)`, `charInventoryBody(w,cur)`, `charHistoryBody(w,cur)`
> — and having the Character panel render the active one. Move code, don't rewrite it; preserve every
> existing class name and `onclick` so behavior is byte-identical per tab.

### 5b. Actions panel — tabs: Actions · Abilities · Spells (INFORM-ONLY)
- Tab state in `GS.actionsTab` (default `'actions'`); `setActionsTab(t)` mirrors `setCharTab`.
- **Actions** — reference cards for the standard actions (Attack, Dash, Disengage, Dodge, Help, Hide,
  Ready, Search…), each a labeled card with a one-line plain-English description. **This is the one
  net-new content piece.** Add a small static table `STANDARD_ACTIONS` (name + one-line desc) — put it
  in `data/` as a tiny data module (e.g. `data/actions-ref.js`, owns `STANDARD_ACTIONS`) and register
  it in `manifest.json`. Render as **non-interactive cards** — they must read as *reference vocabulary,
  not command buttons* (brief §15, §77). No `onclick` on the cards.
- **Abilities** — class/resource capabilities with remaining uses (Rage 2/3, Channel Divinity 1/1…).
  **Reuse `resourceTrackerHTML(sh)`** (render.js:438) / `deriveResources`/`resourceDigest`
  (engine.resources). A readout, not buttons.
- **Spells** — caster-only. **Reuse `renderSpellPanel(w,cur)`** (render.js:396) + `spellSlotTracker`
  (render.js:423). Show the tab only when the character is a caster (reuse the `caster` test already in
  `gameRail`, render.js:283). Cards are hover-for-text reference; the player casts by typing.

### 5c. Map panel
- **Reuse `renderMap(w)` / `renderHexMap(w)`** (render.js:631/14). `openPanel('map')` → this panel.
  Current location highlighted (already done). Fit to panel height.

### 5d. Panels that retire from the rail (still reachable)
- **Codex/Gazetteer** (`codexPanel`/`gazPanel`) — **hidden** (no rail entry). Keep the functions; just
  don't surface them. (Awaiting its own future redesign — brief §93.)
- **Powers** (`renderPowers`, render.js:78) — reachable from the ⚙ Menu (§6), not the rail.

---

## 6. The ⚙ Menu (overflow popover, NOT a slide-in panel)

`toggleMenu()` shows/hides a small popover anchored above the rail's ⚙ button (wireframe S6). It is a
positioned overflow menu, **not** a `panel-col` — the feed stays full-width behind it. State: a simple
`GS.menuOpen` bool; clicking ⚙ toggles, clicking an item or outside closes. Contents (wireframe S6):

- **Return to your worlds** → `showTab('universe')`
- **Start / end session** → `startSession()` / `endSession()` (the button relocated from scene-head;
  show the correct verb from `w.sessionLive`, render.js:210).
- **Destroy world…** (styled `--blood`) → the existing destroy-world flow used by the current UI.
- **World & transitions** — the controls currently in `worldActions(w)` (Explore/Travel, manual
  time-transitions) move here.
- Divider → **Dev tools:** **Oracle** → `showTab('oracle')` · **Reveal all** → `showAllPanels()`
  (render.js:301) · **Advance time…** (the manual clock transitions).

Reuse existing handlers verbatim; the Menu is just a new container for buttons that already exist.

---

## 7. CSS (in genesis.html `<style>`)

- Add `.status-side` (the sidebar) and its children (`.ss-id`, `.ss-hp`, `.ss-hp-bar`, `.ss-ac`,
  `.ss-badges`, `.ss-clock`, `.ss-loc`). Honor the established skin: parchment panel, gold accent
  `~#c9a14a`, display serif for labels, `--blood` for hurt/conditions, `--steel` for AC/temp. **Match,
  don't reinvent** the aesthetic (brief §100).
- The sidebar is a flex column, `flex:0 0 ~15em`, `height:100%`, `overflow:hidden` (never scrolls).
- Restyle `.game-rail` for its new in-sidebar home: a vertical stack under a `grail-sep` divider, items
  compressing to fit (reuse the existing `clamp()` sizing at genesis.html ~397–400 so it never
  scrolls on short windows).
- Add `.actions-menu` (the ⚙ popover): absolutely positioned, dark slate popover with parchment items,
  a subtle shadow; `--blood` for Destroy; a `Dev tools` sub-label. Wireframe S6 is the reference.
- Add `.panel-tabs` / `.ptab` (the Character/Actions tab bars): a slim gold-underline tab row; active
  tab highlighted. Wireframe S2/S7 is the reference.
- Keep the `.wrap.ingame` no-scroll invariants (382–393) intact — the sidebar and rail must both live
  inside the `height:100vh; overflow:hidden` frame.

---

## 8. Triage summary (what moves where)

| Today (rail/feed) | New home |
|---|---|
| Story rail button | implicit default (no panel) |
| Character rail | **Character panel** (Sheet/Inventory/History tabs) |
| Spells rail | **Actions panel › Spells tab** |
| Map rail | **Map panel** (unchanged content) |
| Codex rail | **hidden** (functions kept) |
| Ledger rail | **Character › History** (folded) |
| Powers rail | **⚙ Menu** |
| Universe rail | **⚙ Menu › Return to your worlds** |
| Oracle rail | **⚙ Menu › Dev tools › Oracle** |
| scene-head clock pill | **status sidebar › Clock** |
| scene-head start/end session | **⚙ Menu › Start/end session** |
| `worldActions` details (under feed) | **⚙ Menu › World & transitions + Dev tools** |
| HP/AC/conditions (inside Character panel) | **status sidebar** (persistent) |
| NEW | **Actions › Actions** reference cards (`STANDARD_ACTIONS`) |

---

## 9. Verification plan (how Sonnet proves it green)

**Do not trust a self-reported "looks right." Prove it.**

1. **`python3 build/check-manifest.py` → clean.** If `data/actions-ref.js` (or any new file) was added,
   it's registered with its `owns`; no orphans/drift; `loadOrder` ↔ `<script>` tags consistent.
2. **Full existing harness suite stays green — 0 regressions.** Run every `dev/verify-*.mjs` /
   `node`/jsdom harness the repo already has (walk, items, social, dm-events, conditions, concentration,
   combat-actions, death-saves, hazards, check, etc.). This is a presentation change; **no engine test
   may change.** If any goes red, the refactor leaked into logic — fix or revert that part.
3. **jsdom render test (extend or add one).** Load the real `genesis.html` with all modules in document
   order, roll a world + a living character into play, then assert on the rendered DOM:
   - `.status-side` exists and contains the identity, an HP bar, an AC value, the clock (`Day`/`Session`),
     and the location node name.
   - Condition/exhaustion/inspiration badges appear **iff** the sheet has them: set
     `sh.conditions=[{condition:'poisoned'}]`, `sh.exhaustion=1`, `sh.inspiration=true`, `sh.tempHp=3`
     → assert four chips + the `+3 tmp` indicator render; clear them → assert they're absent.
   - The rail has exactly four items (Character/Actions/Map/⚙) and no Codex/Ledger/Powers/Universe/Oracle
     rail buttons.
   - `openPanel('character')` → panel renders with a three-tab bar; `setCharTab('inventory')` shows the
     slots/list; `setCharTab('history')` shows the chronicle. `openPanel('actions')` → three tabs;
     Actions tab renders `STANDARD_ACTIONS` cards **with no `onclick`** (assert inform-only).
   - `toggleMenu()` → the popover contains Return-to-worlds / Start-or-end-session / Destroy /
     World-transitions / Oracle / Reveal-all, and it is NOT a `.panel-col`.
   - **No-scroll invariant:** the page root does not exceed the viewport (assert `.wrap.ingame`
     `overflow:hidden` holds; the only scrollable node is `.dm-feed`).
4. **Live browser walk (the part jsdom can't judge).** Serve over the bridge or a static server and
   walk the wireframe's states in Chrome: default (feed hero, no panel) → Character Sheet/Inventory/
   History → Actions Actions/Abilities/Spells → Map → ⚙ Menu. Confirm: the page never scrolls (only the
   feed does), the feed reflows narrower when a panel opens and reclaims width when it closes, the
   sidebar stays fixed and legible, and the skin matches the wireframe. Screenshot each state.

**7th check — mutation/regression guards.** For the three most breakable bindings, prove the test would
catch a regression: temporarily break (a) the temp-HP indicator condition, (b) the inspiration badge
gate, (c) the rail's four-item set, and confirm the jsdom assertions go red; then restore. Report the
red→green for each (the "never trust self-reported green" discipline — auto-memory
`feedback-spec-rubric-sonnet-handoff`).

---

## 10. Out of scope (do NOT build now)

- Mobile/portrait/narrow layouts (keep the existing stacking fallback working, invest nothing).
- The **combat tactical phase** — the center is a swappable "stage" later; keep the three-zone frame so
  the center can swap chat→battlefield and the sidebar/rail persist. Don't build it; don't preclude it.
- A **collapsible** sidebar (future — v1 is fixed-open).
- Redesigns of Codex/Gazetteer/Ledger *content* (each is its own future effort — we only relocate/hide).
- Final visual comps / illustration — layout + skin match only.

---

## 11. Definition of done

- `renderWorld` emits sidebar + feed + optional panel; the old scene-head clock pill and the under-feed
  `worldActions` details are gone (relocated per §8).
- The rail is exactly Character · Actions · Map · ⚙ Menu.
- The status sidebar renders live HP/AC/conditions/exhaustion/inspiration/clock/location for the current
  character, persistently, with no scrollbar.
- Character + Actions panels are tabbed and wrap the existing renderers; Map unchanged; Codex hidden;
  Powers/Universe/Oracle/session/transitions live in the ⚙ Menu.
- `check-manifest` clean · full harness suite green (0 regressions) · the new jsdom assertions pass ·
  the 7th-check mutation guards demonstrated red→green · a live browser walk screenshotted across all
  states.
