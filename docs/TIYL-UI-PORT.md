---
type: system-spec
project: Genesis
status: SPECCED 2026-07-03 — Sonnet-executable (U1 medium effort, U2 low); visual side-by-side acceptance
created: 2026-07-03
author: Fable (mapped by an Explore pass, anchors spot-verified)
related:
  - "[[IN-SESSION-UI]]"     # the visual laws + the three-zone precedent
  - "[[DESIGN-GUIDE]]"      # Ivalice bible; §II.0a style gate (this port is composition, not new style depth)
  - "[[NEW-GAME-FLOW]]"     # the bardo stage sequence (unchanged by this port)
  - "[[TIYL-DEEPENING]]"    # the live content spec (unchanged by this port)
  - "[[CHAR-CREATION]]"
---

# TIYL-UI-PORT — the bardo leaves the centered-card era

## §0 Why

The This-Is-Your-Life / bardo passage still runs the banished layout: `.wrap.immersive`
(`genesis.html:43`, `max-width:940px` centered) wrapping `.bardo-layout` (`:46`,
`max-width:940px; margin:0 auto`, two floating cards — the beat card + a sticky scrolling
"So far" aside). The visual laws (IN-SESSION-UI addendum + DESIGN-GUIDE §II.3) banned centered
floating containers repo-wide; in-session went full-bleed (`.wrap.ingame`, `genesis.html:409`,
`max-width:none; height:100vh; overflow:hidden`). The bardo is the FIRST thing a new player
sees and the last screen still on the old model. Adam 2026-07-03: spec the update.

**What this port is NOT:** no content/flow changes (beat sequence, rolls, reroll budget,
TIYL-DEEPENING wiring all untouched), no new art generation (§II.0a holds — existing assets
only), no ES modules, no event-delegation refactor (the 41 inline `onclick=` handlers in
`src/creator/bardo.js` survive verbatim — wiring loss is the known port failure mode).

## §1 The target layout — a full-bleed two-zone ritual stage

The bardo is ceremonial, not the in-session three-zone screen — but it obeys the same frame
laws. New wrapper class `.wrap.bardo-stage` modeled line-for-line on `.wrap.ingame`
(`max-width:none; height:100vh; padding:0; overflow:hidden`), sitting on the same stone-ground
backdrop the in-session frame uses:

```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌───────────────────────────────────────────┐ │
│ │ THE LIFE     │ │            [banner plaque]                │ │
│ │ SO FAR       │ │         YOUR PARENTS · d100               │ │
│ │ (chronicle   │ │                                           │ │
│ │  rail —      │ │   the beat stage — prose in a reading-    │ │
│ │  internal    │ │   measure column (~62ch), left-anchored   │ │
│ │  scroll,     │ │   with dynamic padding like the feed,     │ │
│ │  plaque      │ │   NOT page-centered; die glyph, fragment  │ │
│ │  header)     │ │   fade-in, option grids, name inputs      │ │
│ │              │ │                                           │ │
│ │              │ │   [↩ turn back]              [Next →]     │ │
│ └──────────────┘ └───────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

1. **Chronicle rail** (left, `flex:0 0 15em` — the SAME width token as the in-session status
   sidebar so the eye learns one geometry): the existing "So far" log content
   (`.bardo-aside`, `genesis.html:48`) rehomed; parchment panel edge-to-edge top-to-bottom,
   internal `overflow:auto`, header on the plaque treatment ("THE LIFE SO FAR"). Empty until
   the first beat lands (threshold/soul screens show the rail empty — that's fine, it frames).
2. **Beat stage** (the rest, edge-to-edge): the current beat's content. The beat label + die
   notation move ONTO the banner plaque (`plaques-scene-banner.png`, the 9-slice border-image
   already shipped for the scene whisper — reuse the exact CSS pattern, finials never stretch).
   Prose (`.bardo-frag`/`.bardo-guide`) keeps its ~460px measure but anchors in a reading
   column with dynamic padding (the feed's own pattern, IN-SESSION-UI), never page-centered.
   Option grids (species/class/background), score slots, name-option chips, and the nav
   buttons keep their existing markup and handlers — restyled by the container, not rewritten.
3. **Progress pips** (bottom of the stage, one thin row): the stage sequence
   (soul → species → class → background → scores → skills → equipment → tools → languages →
   spells → feat → life → hometown → world → found) as inert pips, current one lit — the
   orientation the centered card never gave. Pure CSS + one function reading the existing
   `GS.BARDO` cursor; no new state.
4. **No page scroll anywhere**; the rail scrolls internally. Squared corners throughout
   (`border-radius:0` — the aside already complies, `genesis.html:48`).

## §2 Execution constraints (the port discipline)

- **U1 = `feat/tiyl-ui-port`** (medium effort). Touch: `genesis.html` (CSS: retire
  `.wrap.immersive`/`.bardo-layout` centering for the bardo path, add `.wrap.bardo-stage` +
  rail/stage/pips classes) + `src/creator/bardo.js` (the outer scaffold `renderBardo()` emits;
  the per-beat inner HTML changes ONLY where the plaque header replaces the old label line).
  `src/creator/life.js` and all roll/data logic: ZERO edits.
- **Every one of the 41 inline `onclick=` strings in bardo.js survives byte-identical** (the
  harness asserts the full inventory — §4.2). `GS.BARDO.rerolls` (the 3-budget), `GS.CGEN.lifeQ`
  queuing, `bardoBack()`/`bardoLifeStepNext()` order: untouched.
- The `show` fade (`.stage.show`, `genesis.html:112` dealIn animation) keeps firing per
  fragment reveal — the reveal pacing IS the bardo's feel.
- **BLIND-PLAYABLE parity (binding):** the shakedown proved the current bardo fully playable
  through the accessibility tree; the port keeps every interactive element a real
  focusable `<button>`/`<input>` with its text label, adds `role="log" aria-live="polite"` to
  the chronicle rail (fragments announce as they land), and the plaque header is a real
  heading element, not a background image with dead text.
- The threshold/soul/found screens (the cinematic bookends incl. `bardoWake()` fade-to-black)
  keep their pacing; only their frame goes full-bleed.

## §3 U2 = `fix/tiyl-wiring-sd004-005` (separate branch, LOW effort, same wave)

The two queued shakedown wiring bugs live in TIYL's bind path and ride this wave (they are NOT
UI; keep the branches separate so the port diff stays reviewable):
- **SD-004:** `tiylBackfillPeople`/`seedFromLife` mints codex people without the rolled
  species ("a elf sailor" vs the Dwarf record) — bind the species field through, and fix the
  a/an article while in there.
- **SD-005:** attitude init ignores the TIYL relationship stance ("former friend, now hostile"
  shipped as Indifferent/0) — map TIYL relationship words → initial attitude rungs at mint
  time (hostile→Hostile, friend→Friendly, rival→Unfriendly; default unchanged).
- Both mutation-tested red-first in `dev/verify-tiyl.mjs` extensions.

## §4 Acceptance

1. **Visual side-by-side per state** (the mockup-port law): before/after screenshots of
   threshold · a choose grid · scores · one life step (die + revealed fragment) · hometown ·
   a world beat · found. Full-bleed confirmed at 1512px AND a ~1100px window (the rail must
   not crush the measure).
2. **`dev/verify-bardo-port.mjs` (new, red-first):** (a) the rendered bardo shell contains
   `.wrap.bardo-stage` and NO `max-width:940px` path; (b) the complete `onclick=` inventory
   extracted from `renderBardo()` output across a scripted full passage equals the pre-port
   inventory (fixture committed with the spec); (c) reroll budget decrements 3→2→1 across a
   scores reroll + life reroll + world reroll; (d) `lifeQ` walks the same step ids in the same
   order; (e) the chronicle rail carries `role="log"`; (f) the fade class still toggles on a
   fresh fragment.
3. **Regressions:** `verify-tiyl` · `verify-creation-picks` · `verify-capture` ·
   `verify-levelup-picker` (shares creator renderers) · full sweep · `check-manifest`.
4. A keyboard-only + screen-reader pass of one full passage (manual, session-close checklist).

## §5 Decisions

| # | Decision | Ground |
|---|---|---|
| 1 | Bardo gets its own full-bleed stage class, not the in-session three-zone frame | it's a ritual passage, not play; but frame laws are universal |
| 2 | Chronicle rail reuses the 15em sidebar geometry + plaque header | one learned geometry; assets already shipped |
| 3 | Inline handlers preserved verbatim; no delegation refactor | the REV-1/REV-2 wiring-loss lesson; ES-module era does delegation later |
| 4 | SD-004/005 ride the wave on their own branch | TIYL-scoped, queued anyway; separate diff keeps the port reviewable |
| 5 | Bardo dice do NOT reroute through the dice overlay in this port | scope discipline; flagged as a fast-follow candidate (one roll theater everywhere) |
| 6 | No new assets | §II.0a until the style probes rule |
