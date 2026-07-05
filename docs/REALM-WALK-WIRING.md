---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — urban + wilderness creature wiring (NEXT-STEPS later-3 item 4's
  "urban/wilderness creature-wiring"; dungeon done in REALM-WIRING). Sonnet-executable.
created: 2026-07-04
related:
  - "[[REALM-WIRING]]"
  - "[[REALM-STORY-WIRING]]"
---

# REALM-WALK-WIRING — urban + wilderness breaches spawn realm creatures too

## §0 The gap

`rollWalkSkinBreach` already runs on all three walk families, but only dungeon's
`dwalkEncounter(threat, t2, opts)` reads `opts.realms`. Urban `walkEncounter(topo, threat, tier)`
(walk.js:244) and wilderness `wwalkEncounter(tier, region, tarot)` (wild-walk.js:35) have no
realm path — an urban or wilderness breach spawns street toughs and boars.

## §1 The change (mirror REALM-WIRING §3 exactly)

- **Urban:** `walkEncounter(topo, threat, tier, opts)` — when `opts.realms.length`, each creature
  slot draws via the SAME `realmEncounterPool(realms, slotRole)` (+18% adjacency leak) and emits
  the same spec `{slot, creature: rc.name, statId: rc.frame, modelKey: rc.model, cr, realm,
  desc?, summary?}`. Empty pool for a slot → today's `walkPickCreature` path (never dangle).
  Thread `opts.realms = activeRealmsFor(skin, w)` from `rollUrbanWalk`'s skin call site.
- **Wilderness:** `wwalkEncounter(tier, region, tarot, opts)` — same rule; the single-creature
  shape gets the same fields. Thread from `rollWildernessWalk`'s skin site (wild-walk.js:122–124
  already rolls the skin).
- `realmEncounterPool`/`activeRealmsFor`/`REALM_ADJACENCY` live in dungeon-walk.js today — they
  are cross-family now; MOVE them is NOT allowed this unit (blast radius). Call them as globals
  (classic-script shared scope) and note the future home in a comment.
- Back-compat law: `opts` absent → byte-identical behavior (regression assert).

## §2 Build + verify

1. Branch `feat/realm-walk-wiring`. check-manifest OK.
2. Extend `dev/verify-realm-wiring.mjs`: urban breach fixture → foes from the realm pool with
   valid frames; wilderness breach fixture → same; no-realm fixtures → zero realm fields
   (regression); leak distribution sanity on one family. MUTATION: break the urban filter →
   off-realm names appear → fail.
3. Regression: verify-walk, verify-prep-bundle, verify-combat counts unchanged.

## §3 Out of scope / decisions

No pool relocation; no digest/codex work ([[REALM-STORY-WIRING]] owns it — its foe-chain carry
applies to these specs automatically since combatFromEncounter is shared). Decision: identical
leak constant + adjacency graph across families (one law, one tune point) — flag to veto.
