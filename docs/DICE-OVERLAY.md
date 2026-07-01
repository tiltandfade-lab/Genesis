# DICE-OVERLAY — rollable polyhedral dice on the board

**type:** system-spec · **status:** rulings-locked — BUILT (2026-07-01) · **author:** Fable (spec+build)
**Adam's rulings (2026-07-01, all four):** CSS/SVG tumble (no npm/bundler — SCALING.md discipline) ·
fires on **every player-facing roll** · **player clicks to roll** (DM never rolls the player's dice;
the click is the existing roll-prompt button) · **Ivalice engraved** styling with blood/gold crit flashes.

## 1. Principle

The engine rolls first; the animation is pure theater that lands on the predetermined result.
`dmRollFor` / `dmRollDice` (src/world/dm.js) already compute every number synchronously on the
player's click — the overlay visualizes exactly those numbers. No result is ever produced by the
animation layer. `sendTurn` fires immediately (the tumble plays during DM latency, not before it).

## 2. Surface

- **`diceOverlay(spec)`** — src/ui/dice.js (the one dice-FX home), registered in `ui.dice` owns.
  `spec = { title, resultLine, dice:[{sides, result, dropped?, crit?}...], stage2?:{dice, resultLine} }`
  - `dropped:true` renders the discarded die of an adv/dis pair (dims + grays on settle; the kept die
    gets a gold ring).
  - `crit:"crit"|"fumble"` on a die → gold/blood radial flash behind it on settle.
  - `stage2` = the crit-magnitude die: enters tumbling ~250ms AFTER stage-1 settles (the two-beat
    drama: the 20 lands … then the magnitude die drops).
- Mounted on `document.body` (`#diceOverlay`, fixed) so `renderWorld()` re-renders can't kill it;
  centered over `.chat-col`'s rect when present, else the viewport. `pointer-events:none` — play is
  never blocked. Auto-dismisses ~1.4s after final settle (fade 300ms). A new roll replaces the old
  overlay immediately.
- Die faces: inline-SVG polyhedral silhouettes per `sides` (d4 triangle · d6 rounded square · d8
  diamond · d10 kite · d12 pentagon · d20 hex-with-facets; unknown sides → d20 shape). Parchment
  gradient fill, double gold stroke, Cinzel ink numeral. Numeral ticks through random faces with the
  same decelerating cadence as `dieRoll` while the shape tumbles (CSS keyframes: arc + spin + scale),
  then settle-pops on the true result.
- Display cap: 10 dice; beyond that the plate carries the full breakdown (`resultLine`) — never lie
  by omission, `resultLine` is always the engine's `show`/total string.
- `prefers-reduced-motion`: no tumble — dice appear settled, plate shows, dismisses on the same clock.

## 3. Call sites (the ONLY two — every player-facing roll funnels through them)

- `dmRollFor` (checks/saves): d20 (or the adv/dis pair with `dropped` marked), `crit` flag on nat
  20/1, `stage2` = the crit-magnitude d20 when it fired. Replaces the old `dieRoll(#dmDie…)` hook.
- `dmRollDice` (damage/utility NdM±K): one die per individual rolled die from `rollDiceExpr`'s
  `terms[].rolls`, `resultLine = r.show`.
- Both guard `typeof diceOverlay==="function"` (jsdom-safe, layer-safe: world.dm already calls down
  into ui.dice via `dieRoll` — no new layer edge).

## 4. Palette compliance (rides along)

`diceSpice`'s Strange pop color `#8f7fc0` (purple) → `#2e6f63` verdigris, matching the `--strange`
retirement (DESIGN-GUIDE §II.1).

## 5. Acceptance

- `python3 build/check-manifest.py` → RESULT: OK (diceOverlay in ui.dice owns).
- `node dev/verify-in-session-ui.mjs` → all green including new §2c checks: spy `diceOverlay`, stub
  `sendTurn`; `dmRollFor` must pass the SAME d20 result to the overlay as it sends in `rolls`;
  `dmRollDice("2d6+3")` must pass exactly 2 six-sided dice whose results match the expression's
  term rolls; adv pair marks exactly one die `dropped`. Mutation-tested: decouple the overlay result
  from the sent roll → checks go RED.
- Live browser walk: click a DM roll prompt, watch the tumble land on the toast's number; a damage
  expression shows its individual dice; screenshot.
