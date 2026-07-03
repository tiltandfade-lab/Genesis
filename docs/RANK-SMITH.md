---
type: system-spec
status: CONTENT STUB, 2026-07-03 (realm-tables unit) — the NPC role text + gp pricing table are
  authored here; the actual `NPC Role.md` roll-table entry, the shop/economy call site, and the
  job-walk component-fetch mini-quest are NOT built in this unit and have no call site anywhere in
  the codebase. This is deliberately a stub for the urban-fabric unit (BATCH3-PLAN unit 9) to wire
  when its tinker-kit/proprietor system lands — do not read this doc as "the rank-smith is live."
created: 2026-07-03
related:
  - "[[ITEMS]]"
  - "[[ECONOMY]]"
  - "[[URBAN-FABRIC]]"
  - "[[BATCH3-GUARDRAILS]]"
---

# The Rank-Smith — an NPC role that wakes the next rung on a rank ladder

## What it is

Every realm item authored in `Engine/03. _Tables/05. Realms/*.md` that carries a rank ladder
(2–4 rungs, `Rn(Lm) effect`, active rank = highest rung the attuner's level reaches) needs a
diegetic reason a rung can be woken EARLY, ahead of the level gate, for a price — the
**rank-smith**: a tinker/artificer NPC role who can coax the next rung out of a realm item for
gp (and, at high rungs, a component job-walk) rather than making the player wait purely on
level-ups. This composes with the BUILT attunement machinery (`docs/ITEMS.md` §the congruent
item model; `attuneItem`/`unattuneItem`, `src/world/inventory.js`) — the rank-smith does not
invent a new gate, it just offers to accelerate the existing one, for a price, per item.

**This is a content stub, not a wired feature.** No engine file was touched by this unit. The
three pieces below are ready for `urban-fabric` (BATCH3-PLAN unit 9) to consume when its typed-
building/proprietor roller exists — they should NOT be hand-wired ad hoc before that unit lands,
per BATCH-GUARDRAILS G9 (stop and flag, don't invent a call site that isn't asked for).

## 1. The NPC role

**Rank-Smith** — a tinker/artificer proprietor archetype, found in the Urban Fabric kit that
BATCH3-PLAN unit 9 will build (`URBAN-FABRIC.md`'s ~12 type-kits; this role belongs in whichever
kit ends up hosting a tinker's workshop — likely alongside the Blacksmith/Armorer entry already
in `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Role.md`, row 41). **This unit does NOT add
a row to that table** — `NPC Role.md` is Adam's hand-authored d100 (CLAUDE.md: propose + archive
before any destructive edit), and slotting a new role into a currently-full d100 without
displacing an existing row is exactly the kind of decision this unit should flag rather than
force. Proposed voice, for whenever that row lands: *"Calloused hands, but these calluses are
from tools nobody local recognizes — half salvage, half breach-touched invention."* A
breach-touched rider (BATCH3-GUARDRAILS J2's touched-npcs unit, not yet built) would suit this
role especially well: "quietly collects outlandish trinkets" is one of its d12 touch-table
entries per `docs/BREACH.md` §2d.

## 2. GP pricing (rides `data/economy.js`'s existing `RARITY_VALUE` band — no new pricing system)

Waking a rung early costs a flat gp fee scaled to the RUNG'S OWN implied rarity, not the item's
base price — a rung is priced like leveling up a Common item toward Uncommon/Rare/Very Rare
territory, using the SAME band `src/engine/economy.js` already reads:

| Target rung reached | Rides the RARITY_VALUE band at | Gp fee (½ of that band, tinker's cut) |
|---|---|---|
| R2 (the first upgrade past base) | Uncommon (400) | 200 gp |
| R3 | Rare (4000) | 2000 gp |
| R4 (reality-breaking floor, L9+ only) | Very Rare (40000) | 20000 gp |

This is a flat multiplier off an EXISTING constant (no new economy machinery); `sellValue`'s
0.5 `SELL_RATIO` is the closest existing precedent for "half of the band as the transaction
cost," reused here for consistency rather than inventing a fresh ratio.

## 3. Component job-walk stub (high rungs only, R3+)

Per BATCH3-PLAN unit 6's brief ("a component job-walk" for high rungs): waking R3 or R4 isn't
gold alone — the rank-smith names ONE component, sourced as a `docs/JOB-WALKS.md`-shaped mini
posting (BATCH3-PLAN unit 10, also not yet built) rather than an instant purchase. Shape, for
whenever JOB-WALKS lands:

```
{ kind:"component-fetch", item: <realm item name>, targetRung: "R3"|"R4",
  component: <flavor text naming a scarce, realm-appropriate material>,
  gpFee: <the R3/R4 fee from the table above>, tier-scaled 1–3 segment walk per JOB-WALKS' own rule }
```

No code implements this shape yet — it's recorded here so the job-walks unit's author has the
exact contract this stub expects, rather than needing to re-derive it from the realm tables.

## Why this is a stub and not a build

This unit's mandate is the 11 realm ITEM tables (`Engine/03. _Tables/05. Realms/*.md`) — content
authoring. The rank-smith's actual call sites (an NPC role row, a shop-panel action, a job-walk
posting type) all depend on systems (`urban-fabric`, `job-walks`) that BATCH3-PLAN sequences
AFTER this unit and that do not exist in the codebase yet. Building a one-off call site now would
mean inventing the very wiring those later units are scoped to do properly — exactly what
BATCH-GUARDRAILS G9 says to stop and flag instead of guessing. This doc is the flag.
