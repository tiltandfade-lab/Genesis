---
type: design-spec
project: Genesis
status: executing 2026-07-11
author: Codex
related:
  - "[[NEW-GAME-FLOW]]"
  - "[[CHAR-CREATION]]"
  - "[[TIYL-UI-PORT]]"
  - "[[IN-SESSION-UI]]"
  - "[[SHOP-UI]]"
  - "[[LEVELUP-PICKER]]"
---

# UI Vision Quest — The Astral Folio

## The promise

Genesis should feel like opening a forbidden campaign folio on a table while a miniature world
stirs behind it. The UI is not a website and not a fantasy HUD. It is a **ritual instrument**:
quiet when the fiction speaks, ceremonial when the player makes an irreversible choice, and
precise when rules or inventory matter.

The graphics engine owns spectacle. The interface owns **attention**.

## Instructions for the quest

These are the implementation instructions and the acceptance test. If an attractive treatment
breaks one of them, the treatment loses.

1. **One visual cosmology.** Every surface uses the same four materials: void, smoked vellum,
   old gold, and a single living accent. No screen invents a separate card language.
2. **The current decision is always the brightest object.** One primary action, one selected
   option, one active tab. Everything else steps down through contrast rather than decoration.
3. **Ritual screens breathe; utility screens scan.** Title, TIYL, and level-up use generous space,
   centered measures, and deliberate reveals. Character, inventory, and shop use dense aligned
   rows, stable columns, and obvious state tags.
4. **The frame remembers the world.** In play, the realm may tint a hairline, glow, or atmospheric
   wash. It never recolors rules text or reduces contrast. The diorama remains the visual hero.
5. **Parchment is an object, not a beige background.** Use fine borders, inset lines, restrained
   texture, edge light, and shadow. Avoid floating rounded SaaS cards, pill overload, and faux-
   medieval clutter.
6. **Type carries hierarchy.** Cinzel is for short names, stages, and numbers. Garamond is for
   narration and explanation. Uppercase micro-labels orient; they do not become body copy.
7. **Motion marks meaning.** Thresholds may bloom, selections may settle, dice may tumble, and a
   level may flare. Routine hover feedback stays under 180ms. Reduced-motion users lose no state.
8. **Every icon has words nearby or accessible text.** A glyph can add flavor; it cannot be the
   only explanation of an action.
9. **Every existing handler survives.** This is a presentation overhaul over the real game. No
   creation choice, item action, transaction, level pick, rail action, or accessibility affordance
   may be lost.
10. **Desktop is cinematic; narrow screens remain playable.** Wide layouts may use stage wings and
    split ledgers. Below tablet width, content becomes one clear column with sticky decisions rather
    than shrinking into illegibility.

## The shared system

### Materials

- **Void:** blue-black charcoal, not flat black; subtle radial light and grain.
- **Smoked vellum:** warm near-black for utility frames; pale parchment only for focused records.
- **Old gold:** borders, stage numerals, important totals, and active geometry.
- **Living accent:** cool celestial blue by default; blood, grounded green, and realm hues are
  semantic exceptions.

Corners are clipped or square. Hairlines and corner marks make the frame. Glow is scarce and
therefore meaningful.

### Reusable anatomy

- **Eyebrow:** small uppercase context label.
- **Title:** short Cinzel name with a controlled scale.
- **Supporting line:** one sentence in Garamond.
- **Rule:** a central diamond with tapering hairlines.
- **Plate:** border + inner border + corner cuts; no rounded floating card.
- **Ledger row:** aligned name, state/quantity, value, then actions.
- **Seal action:** primary button with a strong gold face and a plain verb.

## Screen visions

### Title — The Unmade World

The screen is almost empty: the Genesis wordmark suspended in a deep atmospheric field, a slow
halo behind it, and one bright **Begin a New Genesis** seal. Returning players see a quieter
**Continue the Chronicle** action plus a count of persistent worlds. References and utility links
live at the bottom edge, not in the opening composition.

The emotional read is possibility, not menu.

### Universe — The Atlas of Lives

Worlds become folio leaves rather than dashboard cards. Each leaf leads with world name and realm,
then a compact record of discoveries, living souls, and fallen souls. The active world carries a
gold spine; a crowned or sundered world carries a permanent heraldic mark. The forge tile is a dark
negative-space invitation, visually distinct from an existing world.

### Character creation — The Soul Forge

The TIYL two-zone frame remains: chronicle on the left, current beat on the right. The right side is
a ceremonial workbench. Stage name and progress are fixed; content scrolls inside the workbench;
the action row stays reachable. Option cards behave like engraved slips: compact, legible, with a
clear selected inlay. Ability rolls feel like six sockets filling with light.

### This Is Your Life — The Memory Chain

Life is not a questionnaire. The left chronicle becomes a visible chain of remembered fragments,
with the newest memory luminous and older memories receding. The current die/result receives a
single centered reading measure. Strange outcomes can disturb the frame, but the text remains still
and readable. “Turn back” is visually secondary and its remaining count is always adjacent.

### Character — The Living Record

The character panel opens like a field dossier. Identity, level, and advancement form the masthead;
core numbers become a compact stat constellation; saves, skills, features, and history sit in ruled
sections. The panel should answer “who am I, what condition am I in, and what can I do next?” in one
glance.

### Inventory — The Loadout Table

Equipped items occupy explicit silhouette slots at the top. Carried items are ledger rows with a
stable name column, small semantic tags, weight/state, and verbs at the far edge. “Use” and “Equip”
are readable actions; attunement and item conditions are state seals. Load is a real meter with a
number, never color alone.

### Shop — The Merchant's Counter

The panel becomes a counter split by a strong Buy/Sell switch. Merchant identity and location are
at eye level; the player's purse is a fixed brass tally. Stock is a price ledger. Selecting a row
opens one inset transaction receipt directly beneath it, with price, warning, and the only Confirm
seal. Relationship-tinted pricing remains subtle and semantic.

### Level up — The Ascension Rite

A level is a rare interruption and earns the strongest ceremony in the UI. The modal darkens the
entire world; the old and new level flank a vertical flare; the current choice appears on one
illuminated leaf. Queue progress reads as named rites (Path, Ability, Spell), not generic dots.
Confirming feels conclusive. “Decide later” remains available but visually quiet.

## Definition of done

- Title, universe, bardo/creator, TIYL result, character sheet, inventory, shop, and level-up all
  visibly belong to the Astral Folio.
- Existing interaction handlers and state contracts remain intact.
- The in-session three-zone layout stays full-bleed and the battle stage remains unobscured.
- Focus, hover, selected, disabled, dangerous, and reduced-motion states are distinct.
- At 1440×900 the title and ritual screens feel composed, not merely centered; at ~1100px the bardo
  rail and reading measure remain usable; below 760px the flows become one column.
- Manifest validation and relevant UI/TIYL/shop/level-up checks pass, followed by a browser walk of
  the key states.
