---
type: system-spec
status: specced 2026-07-01 night — build-ready (overnight batch; UI = Claude's autonomous lane, structural/asset-light per DESIGN-GUIDE §II.0a)
created: 2026-07-01
related:
  - "[[COMBAT]]"
  - "[[SRD-MECHANIZATION]]"
  - "[[IN-SESSION-UI]]"
  - "[[DESIGN-GUIDE]]"
---

# Combat Tracker — surfacing the built fight

## §0. Scope

The combat engine + SRD mechanization are BUILT but headless: `attack`, `opportunity_attack`,
`grapple`/`shove`, `condition_add/remove/expired`, `round_tick`, `death_save`,
`concentration_broken` all mutate `GS.combat`/the sheet with **no render surface** (feed chips
only). `GS.combat` already holds everything a tracker needs (`src/engine/combat.js:77`: round,
side, first, foes[{name,cr,ac,hp,conditions,band,down}], scene cover/hazards). This spec renders
it — **structural, asset-light** (CSS + existing chrome only; NO new engraved assets — the §II.0a
style gate holds) — shaped as the precursor to the T6 band-lane battle theater so the banked
arena/rings art drops in later without rework. Also fills the thin Abilities-tab body.

## §1. The combat panel

- New `gamePanelContent` case `'combat'` (the shop-panel pattern, `src/world/render.js:333`),
  rendered by `combatPanel(w,cur)`.
- **Auto-open** while `GS.combat && GS.combat.active` (renderWorld hook sets
  `GS.gamePanel="combat"` on combat start; restores the prior panel on combat end). Player can
  tab away; the rail marks the combat panel hot while active.
- **Layout — four band lanes** (the COMBAT.md range bands), rendered as horizontal lanes:
  `Melee · Near · Far · Distant` (reconcile exact band names against `combat.js`). Chips sit in
  their lane:
  - **PC chip**: name + HP bar (the player's own numbers are theirs) + active condition badges.
  - **Foe chips**: name, CR glyph, condition badges, and a **state word only** — `fresh` /
    `bloodied` (≤half) / `down`. **NEVER exact foe HP or AC in the DOM** — the DM's spine stays
    hidden (verify asserts this).
- **Header strip**: Round N · whose side acts (`side`) · who won initiative (`first`) ·
  scene tags (cover/hazards/exits from `combat.scene`, name-only chips).
- **Death-save pips** (also §2): when the PC is at 0 HP, the panel shows the 3+3 pip row
  (successes ●, failures ✕) read from the sheet's death-save state (SRD-MECH §4) — display only;
  rolling stays the player's open d20 via the existing prompt. No automation (COMBAT.md
  fast-follow "death-save automation" stays deferred).
- Events → surface: `applyEvent` already mutates state; `renderWorld()` after events (already
  happens) repaints the panel. `round_tick` bumps the round header; `condition_expired` clears
  badges. No new event types.

## §2. Status-sidebar additions (out-of-panel visibility)

- At 0 HP: the death-save pip row rides `ssBadges` (next to exhaustion/inspiration badges).
- Concentration: a small `◉ concentrating: <spell>` badge while the sheet holds concentration;
  clears on `concentration_broken` (SRD-MECH §2 state — reconcile symbol).
- Condition badges gain TTL dots when the condition carries one (`ttl` from the conditions
  engine) — e.g. `poisoned ··` = 2 rounds left.

## §3. The Abilities tab body (the carried design question — resolved)

`actionsAbilitiesBody` (`src/world/render.js:368`) currently renders only class-resource dot
rows. Fill it, **reference-only** (the Actions-tab register: "✦ Reference only — you act by
typing" — the no-coaching charter rule §3 forbids suggesting tactics):

1. Keep the resource dot-tracker rows at top (they're right).
2. Below: **class features known at current level**, from `CLASS_PROGRESSION` (name + the
   SRD text, collapsed to first sentence with expand-on-tap), level-gated, subclass features
   included where the sheet has one.
3. Origin feat (from the sheet) as one more reference card.
4. Casters: a one-line pointer to the Spells tab (no duplication).

## §4. Build plan

1. `combatPanel` + `gamePanelContent` case + auto-open/restore hook + rail hot-state.
2. Band lanes + chips (no foe HP/AC in DOM — the state-word derivation lives app-side off
   `foe.hp/maxHp`, emitting only the word).
3. Death-save pips (panel + sidebar), concentration badge, TTL dots.
4. `actionsAbilitiesBody` fill per §3.
5. `dev/verify-combat-tracker.mjs` (jsdom; drive real events through `applyEvent`).
6. `check-manifest` (render.js is registered; new module only if the panel gets its own file —
   follow the shop-panel precedent).

## §5. Verification

1. `combatStart` fixture → panel auto-opens; four lanes render; foes appear in correct bands.
2. Foe at ≤half HP shows `bloodied`; at 0 shows `down`; **the DOM contains no foe HP number or
   AC anywhere** (regex the rendered HTML — mutation check: leak `foe.hp` into the chip, harness
   fails).
3. `round_tick` increments the header round; `condition_add {ttl:2}` shows 2 dots, decays via
   `round_tick`, badge clears on expiry.
4. PC at 0 HP → pips in panel + sidebar; `death_save` events fill them; stabilize/heal clears.
5. Concentration badge appears on cast-with-concentration, clears on `concentration_broken`.
6. Combat end (`combatOutcomeEvents`) → panel closes, prior game panel restored.
7. Abilities tab: a L5 Barbarian fixture lists Rage dots + Extra Attack + subclass features;
   a L1 shows only L1 features; text is reference-register (no imperative "you should").
8. Regression: shop panel + tabs behave identically; full sweep green.

## §6. Acceptance (felt)

A fight reads at a glance — who's where, what's ticking, how bad it is — without the DM
re-stating board state in prose, and without ever leaking the DM's numbers. The Abilities tab
answers "what can I even do" the way the Actions tab does: informing, never coaching. And when
the T6 battle-theater art lands, it lands INTO this structure.
