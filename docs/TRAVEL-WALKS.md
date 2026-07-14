---
type: system-spec
status: specced 2026-07-01 night — build-ready (overnight batch)
created: 2026-07-01
related:
  - "[[SPATIAL-MODEL]]"
  - "[[WALK-CONSUMPTION]]"
  - "[[SESSION-PREP]]"
  - "[[COMBAT]]"
---

# Travel Walks — the journey IS a walk

## §0. The decision (Adam, 2026-07-01)

**Travel becomes the walk.** Today `explore()` (`src/world/play.js:163–191`) rolls the route,
advances the clock all at once, moves `currentNodeId`, and logs a bare encounter *count*
(`encN = max(1, round(leagues/2))`, line 177) — no content. Meanwhile the Wilderness Encounter
Generator is **fully ported and compiled** (`src/engine/wild-walk.js`: `rollWildernessWalk` /
`wwalkEncounter`; all 24 `wilderness-*` tables in `tables.json`) — prep wilderness walks already
roll full encounters. This spec wires the Travel verb to that machinery: a journey is played
segment by segment with the EXISTING walk consumption loop, and you **arrive on `walk_complete`**.
Short trips are 1–2 segments; road danger has teeth. (Corrects the stale NEXT-STEPS claim that the
generator is "unported.")

## §1. Contract

`explore()` becomes **departure**, not arrival:

1. Roll the route as today (`rollRoute` — bearing/travelMin/leagues; write-once edge unchanged).
2. **Biomes from the hexes crossed** (`SPATIAL-MODEL`): sample `terrainAt` along the origin→dest
   hex line, one biome per leg (extend `rollWildernessWalk` opts to accept `biomes:[]`, one per
   segment; single-biome fallback preserved).
3. `rollWildernessWalk({ legCount: encN, biomes, tier: tierOfLevel(pc) })` → a walk with
   `kind:"travel"`, stored on the **destination** node's prep slot (reconcile against how frontier
   walks store — same shape, new `kind`), `destNodeId` + `originNodeId` + `travelMin` recorded.
4. Set `P.activeWalkId` to it, cursor at segment 1. `currentNodeId` does NOT move yet.
5. Clock: advance `travelMin / segCount` per `walk_advance` (not all at once). Total elapsed on
   completion ≈ today's travelMin (±rounding).
6. **Arrival semantics — the new branch in `walk_complete`:** when the completed walk is
   `kind:"travel"`, do NOT promote a prep frontier; instead move `currentNodeId` to `destNodeId`,
   write the arrival `transition` ledger entry (reuse today's arrival text), and clear the walk.
   `{abandoned:true}` on a travel walk = turn back: `currentNodeId` stays at origin, clock keeps
   whatever segments were walked, ledger notes the turn-back.
7. Encounters flow through everything that already exists: `activeWalkDigest` carries segments
   every turn; an Enemy segment feeds `combatFromEncounter`; beat provenance stamps
   `{walkId, seg}` (WALK-CONSUMPTION §C — travel walks count in `walkProvenanceReport` under a
   `travel` bucket).

## §2. What travel walks DON'T get (v1)

- **No Stage-2 synthesis pass** (they're rolled at the moment of departure, not prepped) — so no
  reskin overlay and no pre-generated segment effect dice. The DM may generate an effect die live
  for a notable segment (ON-DEMAND-GEN §4 applies); note this in the runbook line.
- No dungeon-only fields (secret/loot budgeting) — the wilderness segment shape as-is
  (`wwalkEncounter` already yields type/enemy/hazard/social/problem/discovery/empty + sensory/
  footing/sign-of-passage/survival).
- Travel between nodes with an ALREADY-established route re-rolls encounters each trip (the road
  is canon; the road's *events* are not) — but `legCount` derives from the established leagues.

## §3. Build plan

1. `rollWildernessWalk` opts: `biomes:[]` per-leg (fallback single `biome`), `kind` passthrough.
2. `explore()` rewrite per §1 (departure + storage + activation). Keep the old instant path
   behind nothing — travel IS the walk now (Adam's call; no legacy toggle).
3. `walk_complete` travel branch + abandon/turn-back branch (`src/world/` walk event handler —
   reconcile exact location).
4. Per-segment clock advance on `walk_advance` for travel walks.
5. Provenance: `travel` bucket in `walkProvenanceReport`.
6. Runbook line (frontier-tier, rides the batch's DM-BRIDGE edit): travel walks appear in
   `digest.activeWalk` like any walk; narrate segment-by-segment; `walk_complete` = arrival —
   never teleport the party yourself.
7. `dev/verify-travel-walks.mjs`.

## §4. Verification

1. Travel to a new place mints a `kind:"travel"` walk with legCount = old `encN` formula,
   per-leg biomes matching `terrainAt` samples, activeWalkId set, `currentNodeId` unmoved.
2. Each `walk_advance` advances the clock by travelMin/segCount; completing all segments ≈
   today's total (±1 min rounding).
3. `walk_complete` on a travel walk moves `currentNodeId` to dest + arrival ledger entry + does
   NOT touch prep frontiers (mutation check: break the kind guard, watch frontier promotion fire
   and the harness fail).
4. `{abandoned:true}` returns nobody anywhere: origin stays current, partial clock kept.
5. An Enemy segment round-trips through `combatFromEncounter` to a startable combat.
6. Established-route re-travel re-rolls fresh encounters, same legCount, no new edge.
7. Regression: prep frontier walks behave byte-identically (`verify-walk-consumption` 37/37 etc.).

## §5. Acceptance (felt)

Travel stops being a teleport with a number attached. A 6-league trek is 3 segments of real road —
maybe a rockslide problem, a stranger with a hook, an ambush — and arriving feels EARNED. Short
hops stay short. The DM narrates from rolled atoms the whole way (engine owns the road's nouns).
