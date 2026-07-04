# INITIATIVE-UI — turn & health indication on the battle stage

```
type: system-spec
status: SPECCED (locked 2026-07-04; Adam: side-based is fine but the player must always know
whose turn was spent — "either way, all indicated")
consumer: Sonnet executor; orchestrator gates
```

## Decisions (recorded — do not re-litigate)

- Initiative stays SIDE-BASED (v1, per COMBAT.md). No per-creature order UI.
- **Allies act on the PC side's turn** (5e-sidekick style). v1 has no ally mechanical state
  (`src/engine/combat.js:696-698` documents the seam) — the UI renders ally chips from
  `companionPartyStrip(w)` (already flowing into `cmbStageOverlay`, `src/world/render.js:396`)
  and shows their HP bar only when a row carries hp data; otherwise the bar is omitted, never
  faked.
- Foe HP is shown as a THIN BAR under the chip name — no numerals for foes (bloodied language
  stays the prose channel). Bar width quantized to 5% steps so it reads grit, not lab equipment.
- Turn-spent is derivable from existing state — `{first, side}`: when `side !== first`, the
  first-acting side's turn is SPENT this round. No new state fields.

## State anchors (verified 2026-07-04)

- `GS.combat.round` / `.side` ("pc"|"enemy") / `.first` — `src/state.js:32`,
  set by `src/engine/combat.js` (`rollInitiative` ~line 150, combat assembly ~594).
- Side flips + round increments via `round_tick` applyEvent case, `src/world/dm.js` ~1620
  (ledger line "— Round 4; you act." already emitted there).
- Foe objects in `GS.combat.foes[]` carry hp fields — VERIFY exact field names (`hp`/`hpMax` or
  similar) in `src/engine/combat.js` foe statting before writing the bar math; do not guess.
- Stage overlay markup: `cmbStageOverlay(w,cur,cm,flashed)` `src/world/render.js:391`; chips
  from `cmbZoneOccupants(...)`; classic fallback panel `combatPanel(cm)` same file; prose twin
  `cmbProseSummary()` (role="status" aria-live already in place).

## Behavior

1. **Turn banner** — a compact plate on the stage overlay (top edge, between the band rail and
   the camera controls; pointer-events:none): `Round {N} — YOU ACT` / `Round {N} — THEY ACT`.
   Derived ONLY from `cm.round` + `cm.side`. Also rendered in the classic combatPanel as text.
2. **Spent tick** — the side whose turn already passed this round gets a dim ✓ next to its
   grouping: when `side==="enemy" && first==="pc"`, the PC/ally chips group shows the spent
   marker (and vice versa). Rendered as a small muted glyph on the banner ("YOURS SPENT ·
   THEY ACT") AND as a subtle chip-group dim — both, so it reads at any zoom.
3. **Thin HP bar** — every combatant chip (PC, ally rows with hp data, every foe) gains
   `<span class="chip-hp"><i style="width:{q}%"></i></span>` directly under the name line;
   `q` = round(hp/hpMax*20)*5, clamped 0–100. Downed foes (f.down): bar at 0 + the chip's
   existing down styling. Fled/surrendered: bar hidden, state glyph stays.
4. **Prose twin** (BLIND-PLAYABLE FULLY — ships in the same unit or the unit isn't done):
   `cmbProseSummary()` gains the spent clause: "Round 3 — your turn is spent; the foes act." and
   per-foe condition stays word-based (unhurt/bloodied/nearly down), never percentages.
5. **CSS** in genesis.html beside the existing `.stage-band-*` rules: bar 3px tall, full chip
   width, muted track, side-colored fill (existing PC/foe accent vars); no animation beyond a
   150ms width transition; respects prefers-reduced-motion (transition: none).

## Out of scope

Per-creature initiative order · numeric foe HP · ally mechanical combat state (documented seam
stays) · re-theming chips (BATTLE-THEATER rev2 layout is frozen) · DM digest changes (digest
already carries round/side/first at `src/world/dm.js:168`).

## Verification

Harness: `dev/verify-initiative-ui.mjs` (bootstrap copied from an existing dev/verify-*.mjs
jsdom harness; classic-script load order from manifest).

1. ⊗ RED-FIRST: assert banner element exists with "Round 1" + "YOU ACT"/"THEY ACT" after a
   `combat_start` applyEvent — prove it fails before the code lands.
2. Flip side via `round_tick`; assert banner text flips and the spent marker appears on the
   correct side (both `first:"pc"` and `first:"enemy"` fixtures).
3. Damage a foe via `attack` applyEvent; assert its chip-hp width decreased and is a multiple
   of 5%.
4. ⊗ Mutation check: with the banner render line stubbed out, checks 1–2 go red (fix off → red →
   fix on → green), recorded in the report.
5. Prose twin: assert cmbProseSummary output contains round + side phrasing (+ spent clause when
   side !== first).
6. `python3 build/check-manifest.py` → RESULT: OK; full `dev/verify-*.mjs` sweep by exit code;
   `node dev/gauntlet-monkey.mjs` (0 harness-aborted) since render surface changed.
