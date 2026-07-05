---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — build-ready. The production spine: wire realm creatures into breach encounters (filter to the active realm + nearby leaking realm), mirroring the loot realm-filter that already exists.
created: 2026-07-04
related:
  - "[[BREACH]]"
  - "[[OUTLANDISH-REALMS]]"
  - "[[REALM-RENDER-STYLE]]"
---

# REALM-WIRING — breach encounters spawn the active realm's creatures

## §0 The gap (Adam, 2026-07-04)

A breach already opens INTO a realm (`rollWalkSkinBreach` → `{tail, realms:[...]}`) and LOOT already
filters by it (`dwalkOutlandish(level, {inBreach, realms})`, dungeon-walk.js:224-234). But
**`dwalkEncounter(threat, t2)` (dungeon-walk.js:272) ignores realm** — a frontier breach spawns
generic dungeon monsters. This wires creatures the SAME way loot is wired: in a breach, draw from the
active realm's bestiary (+ a nearby *leaking* realm), using the reskin chassis already approved.

The creature data exists: **`data/realm-bestiary.js`** (generated, `REALM_BESTIARY = {realm: [{name,
cr, role, type, size, frame, model}]}`, 1092 creatures). `frame` = a real `data/bestiary.js` id
(STATS); `model` = a render key (usually a bestiary id, or `net-new`).

## §1 Register the data layer
- `data/realm-bestiary.js` is a generated classic `<script>` (defines `REALM_BESTIARY`, owns that
  symbol). Add it to `manifest.json` (id `data.realm-bestiary`, path, `owns: ["REALM_BESTIARY"]`,
  layer data) and to `genesis.html`'s `<script>` chain right after `data/bestiary.js`. Run
  `python3 build/check-manifest.py` (must end RESULT: OK).

## §2 The active-realm resolver + leakage
Add `realmEncounterPool(activeRealms, leak)` and the resolver (engine, classic-script globals):

- **`activeRealmsFor(skin)`** — from a rolled walk skin (`rollWalkSkinBreach` output): returns
  `skin.realms` when `skin.tail === "breach"` and `skin.realms.length`, else `[]` (a normal walk /
  center-mass = no realm filter, unchanged behavior). Marooned realm walks (`w.realm.name`) also
  count — if `w.realm && w.realm.active`, include `w.realm.name`.
- **Nearby leaking realm (Adam's "or nearby leaking realm"):** define
  `const REALM_ADJACENCY = { frontier:["ash","theater"], ash:["frontier","chrome"],
  chrome:["ash","cosmic"], noir:["chrome","gloom"], gloom:["noir","cosmic"], cosmic:["gloom","chrome"],
  theater:["frontier","high-seas"], "high-seas":["theater","lost-world"], "lost-world":["high-seas","cosmic"],
  suburb:["noir","bright-kingdom"], "bright-kingdom":["suburb","lost-world"] }` (a small thematic
  graph — 2 neighbors each; Adam tunes). **Leak rule:** each creature drawn has a `LEAK_CHANCE = 0.18`
  chance of coming from a random adjacent realm instead of the primary — the breach mostly holds its
  own register but "bleeds" a little at the edges. `realm-neutral` creatures (none today, but the
  layer allows it) are always eligible.

## §3 Wire `dwalkEncounter` (dungeon-walk.js:272; mirror for urban/wild if trivial)
- Signature → `dwalkEncounter(threat, t2, opts)` where `opts.realms` is the active-realm list
  (threaded from the skin at the call site, line 460 / rollDungeonWalk's `skin`). Back-compat:
  `opts` absent → exactly today's behavior.
- **When `opts.realms.length` (in a breach):** for each creature SLOT the composition asks for,
  instead of `resolveArchetypePool`, pick a realm creature from `REALM_BESTIARY` filtered to the
  active realm(s) (+ §2 leak), matched to the slot's role/CR band (mook/elite/high/apex ≈ the slot
  tier). Build the foe spec as:
  `{ name: rc.name, statId: rc.frame, modelKey: rc.model, cr: rc.cr, realm: rc.__realm }`
  — **`statId = frame`** so `cmFoeFrom(BESTIARY[frame])` resolves real 5e stats (mechanics stay D&D),
  **`name`** overrides to the realm creature's name, **`modelKey`** carries the render model.
  Fallback: an empty/զmissing realm pool for a slot → the normal `resolveArchetypePool` path (never
  a dangling slot).

## §4 Stat + model resolution (combat.js + theater-data.js)
- **Stats:** `cmFoeFrom` already resolves from `statId` → `BESTIARY[statId]`. Passing `statId = frame`
  gives the chassis stats; ALSO honor a `name` override on the foe spec (the realm name shows, the
  chassis stats drive). Confirm `combatStart`/`cmFoeFrom` carry a passed `name` verbatim (small guard
  if not).
- **Model:** `theaterUnitsFrom` (theater-data.js:1137) resolves a foe's model from its `statId`.
  Change: **prefer `foe.modelKey`** (the realm creature's own render model) over `statId` when present
  — `resolveWholeObject(foe.modelKey) || resolveWholeObject(statId) || cuboid`. So a realm reskin can
  render as its own model (or the frame's) independently of its stat chassis. `net-new` modelKeys
  resolve to null → cuboid fallback until the 207 net-new models are built (graceful).

## §5 Build + verify
1. `data/realm-bestiary.js` registered; check-manifest OK.
2. New harness `dev/verify-realm-wiring.mjs` (jsdom, mirror verify-battlemap): a fixture skin with
   `tail:"breach", realms:["frontier"]` → `dwalkEncounter` returns foes whose `name` ∈ frontier's
   REALM_BESTIARY and `statId` ∈ BESTIARY (valid chassis); a `tail:"center"` skin → foes come from
   the normal pool (realm filter OFF, regression). Leak: over 500 draws, ~18% come from an adjacent
   realm, 0% from a non-adjacent realm. modelKey preference: a foe with modelKey resolves that model.
   Mutation check: break the realm filter → the breach draws off-realm creatures, harness fails.
3. Regression: `verify-battlemap` + `verify-combat` counts unchanged.

## §6 Out of scope
The 207 net-new models + the render-style grade are separate units. This unit does the CREATURE
wiring only (surfaces + render-grade ride the same `activeRealmsFor` seam next). No bestiary.js edits.

## §7 Decisions (flag to veto)
| # | Decision | Ground |
|---|---|---|
| 1 | frame=stats, modelKey=render, name=realm | the approved reskin arch (mechanics D&D, presentation realm) — mirrors Realm Items' Frame |
| 2 | 18% leak to an adjacent realm | Adam's "or nearby leaking realm"; realms hold their register but bleed at edges |
| 3 | Mirror the existing loot realm-filter | dwalkOutlandish already does exactly this for items — least-surprise |
| 4 | net-new modelKey → cuboid until built | graceful; the 207-model queue fills in behind it |
