# DRESSING-WIRING — set dressing rolls into all three walks (the battlemap-life wire)

```
type: system-spec
status: SPECCED (locked 2026-07-04; Adam: "the dungeon dressing stuff is a big one, that should
be wired into all the walks… that is what will bring the battlemap to life"; reskin
determination delegated to the orchestrator and recorded below)
consumer: Sonnet executor; orchestrator gates
```

## What exists (verified 2026-07-04)

- Authored-but-inert dressing family in `Engine/03. _Tables/03. Session Mechanics/Dungeons/`:
  `Dungeon Dressing Mega Table.md`, `Dungeon Set Dressing.md`, `Urban Dressing Mega Table.md`,
  `Urban Set Dressing Condition.md`, `Wilderness Set Dressing Condition.md`.
  NO wilderness mega table exists.
- `rollDungeonWalk()` (`src/engine/dungeon-walk.js`) rolls per-room feature/interactable at
  ~414–418 and one-time dungeon descriptors at ~374–381; it never consumes dressing.
- Wilderness per-leg rolls: `src/engine/wild-walk.js` ~134–156. Urban per-segment rolls:
  `src/engine/walk.js` (`walkPick(id, ...cols)` at :148 is the roll primitive).
- Theater prop pool: `theaterSegmentFeatureText()` / `theaterBoardFrom()` →
  `theaterPropForText()` keyword rules, `src/engine/theater-data.js:227–380`.
- VERIFY FIRST: the compiled key names for the dressing tables in the compiled tables file
  (repo-root `tables.js` / `src/engine/tables.js`) — grep for "dressing" AFTER recompiling.
  If a table is missing from the compile output, check its markdown header `type:` line against
  other compiled tables and match the format; the compile step is
  `python3 "Engine/00. _System/compile-tables.py" --emit` (edit markdown source only, NEVER the
  compiled artifacts).

## Reskin determination (RECORDED — do not re-litigate)

- **Dungeon walks** roll the Dungeon Dressing Mega Table + Dungeon Set Dressing as-is.
- **Urban walks** roll the existing Urban Dressing Mega Table + Urban Set Dressing Condition
  as-is — no reskin needed, the table already exists.
- **Wilderness walks**: author `Wilderness Dressing Mega Table.md` as a NEW table, marked
  `status: PROVISIONAL (pending Adam's craft pass)` in its header — translate the dungeon mega's
  row STRUCTURE (same d-size, same column shape) with nouns moved outdoors (masonry→deadfall &
  scree, cobweb→bramble & lichen, sconce→fire-ring, etc.); keep row-band spice geography aligned
  with the source table. Wilderness Set Dressing Condition (exists) rolls alongside it.
  This is enabling prep, not the craft pass — Adam's re-authoring lens applies later.

## Behavior

1. One dressing roll per dungeon ROOM, wilderness LEG, urban SEGMENT, stored as
   `room.dressing` / `leg.dressing` / `seg.dressing` = `{text, condition}` (text from the mega
   table, condition from the matching Set Dressing/Condition table). Exact insertion points:
   the per-room/per-leg/per-segment roll blocks anchored above.
2. Dressing text joins the theater feature-text pool (`theaterSegmentFeatureText`,
   `src/engine/theater-data.js:385`) so `theaterPropForText` can resolve props from it.
3. After compiling, enumerate dressing nouns with NO keyword-rule match and extend
   `THEATER_PROP_KEYWORD_RULES` mapping them onto EXISTING parts only (crate/rubble-scatter/
   chain-drape/etc.). New bespoke models are the env waves' job, not this unit's.
4. Dressing text rides the walk slice of the DM digest exactly like `feature` does (find where
   segment feature text enters the digest in `src/world/dm.js` and mirror it) — the DM narrates
   dressing, never invents it.
5. Persistence: dressing is part of the rolled walk (world state), not GS transient.

## Out of scope

New prop models · dressing for interiors (ON-DEMAND-GEN overlay owns interiors) · re-rolling
dressing on revisit (rolled once, immutable like names) · consuming Dungeon Threat Profile /
Exit Destination (still DM reference).

## Verification

Harness: `dev/verify-dressing.mjs` (jsdom, manifest load order).

1. ⊗ RED-FIRST: roll each walk type ×50; assert every room/leg/segment carries
   `.dressing.text` (non-empty string) — prove red before wiring.
2. Determinism: same seed → same dressing (walk rolls are seeded; match the walker's existing
   determinism tests).
3. Theater pickup: for a fixture room whose dressing text names a known keyword (e.g. "cobweb"),
   assert `theaterBoardFrom` output includes the mapped part.
4. ⊗ Mutation: stub the dressing roll out → checks 1 & 3 red; restore → green.
5. Table compile: recompile runs clean; `git diff` on compiled artifacts shows ONLY the new/
   changed dressing tables; markdown sources carry the PROVISIONAL header for the new
   wilderness table.
6. `python3 build/check-manifest.py` → RESULT: OK; full `dev/verify-*.mjs` sweep by exit code.
   Walk-surface change: run `node dev/gauntlet-monkey.mjs` (0 harness-aborted).
