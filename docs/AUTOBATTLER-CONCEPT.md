---
type: concept
status: PARKED — product concept for spin-off #1 of the DIRECTION 2026-07-26 addendum ("Living Miniatures" §B.1). NOT in the build queue; it enters only when the addendum's timeline reaches it and the flagship's gates allow. No build authorization is implied by this doc's existence. Adam holds every taste, content, spend, and monetization ruling.
created: 2026-07-26
related:
  - "[[DIRECTION]]"
  - "[[ART-DEPARTMENT]]"
  - "[[LOOT-REMAP]]"
  - "[[EVENT-CONTRACT]]"
---

# Living Miniatures autobattler — one-page concept

**Working title:** TBD (Adam names things). **Form:** single-player PvE roguelike
autobattler (Astronarch/Despot's shape — explicitly NOT PvP autochess; no backend, no
accounts, no live-ops). **Price shape:** see Monetization. **Fiction:** your figurines
come alive and brawl on a tabletop diorama. Death = the mini tips over.

## Core loop (one round ≈ 2 minutes)

Open boosters / buy from the round's shop → arrange minis on the table → deterministic
autobattle resolves → rewards (gold, loot, boosters) → next round. Runs escalate through
waves to a boss; death ends the run; the collection persists.

## The two-layer economy

- **Per-run (roguelike layer):** gold income, shop rerolls, interest, sell-back,
  positioning. ~15 tunable numbers — **these numbers ARE the game**; tuning them is the
  design budget's biggest line item.
- **Persistent (collection layer):** boosters are EARNED THROUGH PLAY as the core reward
  loop; opened cards/minis join the permanent collection; runs draft from your collection.
  Time-rich players (the kid with a summer) grind a full collection for free — this is a
  design pillar, not a concession.

## Monetization law (the one refinement to the founder's vision)

**Randomness is earned, never sold. Money buys certainty.** Real-money random packs =
gacha/gambling-adjacent — regulatory exposure (regional loot-box law, ESRB labeling) and
review-bomb bait, doubly so with kids in the audience. Instead money buys: **expansions**
(new tribes/realms/campaigns — deterministic content), **cosmetics** (foil minis, table
skins, dice), **supporter packs** (explicitly "fund the next game" — the founder's
revenue-flows-back framing, made literal). Precedent: Super Auto Pets (free packs earned,
paid expansions, beloved). Base-game shape is an open founder ruling: cheap premium
($5–8) with a generous demo (demo-as-marketing doctrine) vs. free-to-play with one paid
expansion. Lean: cheap premium — F2P on Steam adds support burden a solo studio doesn't need.

## Content budget (v1)

40–60 units curated from the bestiary sprite register (~379 candidates; regen only the
gaps) · 60–100 items mapped from the loot tables on the existing rarity axis (boosters
reuse rarity math verbatim) · 10–15 waves + 3–4 bosses · 3–5 realm-themed table arenas ·
tribes/synergies: ≤4 simple tribes or none at all (Super Auto Pets shipped with none).

## Trigger grammar (units = typed-event handlers; the event-contract mindset applies)

Battle start · on attack · on hurt · on kill · on death · on ally death · end of round ·
on buy · on sell · on item equipped. (~10 triggers × effects = the whole design space.
One trigger per unit. Keep the grammar closed; expansions add units, not triggers.)

## Art & animation laws

- **No frame animation, by fiction:** minis slide, hop, tilt, and TIP OVER (death) — all
  code tweens on static sprites (Super Auto Pets precedent). The miniature fiction makes
  the cheap solution the correct one.
- Unit sprites: curation from the canon pixel register per `ART-DEPARTMENT.md`.
- **Icons are the real new-art surface** (items, abilities, statuses, badges — several
  hundred small assets): produced by the Codex tile/sprite pipeline on a consistent grid.
- Arena = the diorama/theater stage; realm surfaces and props flip in.

## UI doctrine (founder ruling 2026-07-26)

UI is expected to be ~half the build — and that is EMBRACED, not feared: the deliverable
is a **reusable UI kit** (tokens + components: shop card, drag-drop slot, trigger tooltip,
trait badge, battle log, booster-open moment) built as a pipeline artifact that flips
forward to the shop sim and the flagship, and doubles as a portfolio/process demo for the
Sept–Oct sprint (DIRECTION addendum §F). A good UI here gets Adam hired AND ships game one.

## Tech

Game logic standalone, headless, deterministic, seeded (it must be, for the resolver) —
the theater/diorama renderer is a lens over it, same doctrine as the flagship. Determinism
buys: **factory balance sweeps** (thousands of overnight sim battles → win-rate tables per
unit/item/comp — balance by measurement, not Discord vibes), daily seeded runs, shareable
replays (the event-sourced doctrine paying out again).

## v1 cut lines (hard)

No PvP or async ghosts · no accounts/server · no real-money randomness (law above) · no
frame animation · no trigger-grammar growth · no trait system beyond the cap · no
cross-promotion hooks until the shop sim exists (later flip: this game appears INSIDE the
shop sim as the game customers play).

## Open founder rulings (batched for when this un-parks)

Name · premium-with-demo vs F2P base · tribes in/out · price point · collection reset
policy (never resets vs. seasonal) · which 3–5 realms make the v1 arenas.
