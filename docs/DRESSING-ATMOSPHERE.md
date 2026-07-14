# DRESSING-ATMOSPHERE — the mega tables' atmosphere lanes join the walk sensory pool

```
type: system-spec
status: SPECCED (locked 2026-07-04; Adam approved. Extends DRESSING-WIRING — landed earlier
today in all three walkers — to the atmosphere sub-blocks that unit's own comment explicitly
deferred: src/engine/dungeon-walk.js:423–426.)
consumer: Sonnet executor; orchestrator gates
branch: feat/dressing-atmosphere
```

## What exists (verified 2026-07-04 against the compiled tables.js — NO recompile needed)

The atmosphere sub-blocks and their EXACT compiled keys:

| lane | dungeon | urban | wilderness |
|---|---|---|---|
| air | `d100-air-currents` | `d20-urban-air-currents` | `d100-wind-weather-currents` |
| odor | `d100-odors` | `d20-urban-odors` | `d100-wilderness-odors` |
| sound | `d100-unexplained-sounds-and-weird-noises` | `d100-urban-sounds-and-weird-noises` | `d100-wilderness-unexplained-sounds-and-weird-noises` |

Enumerated and EXCLUDED (recorded): the d6 air-VISIBILITY trio (lighting lane owns ambient
visibility) · the general-features blocks (would double-dress against *-set-dressing) · ALL
furnishings/container-contents/utensils/clothing keys (gen/loot layer, per the brief).

Existing roll sites this extends: dungeon per-room src/engine/dungeon-walk.js:414–418
(sensory :416, dressing :427, room object :434–438) · wilderness per-leg
src/engine/wild-walk.js:134–143 (+ arrival :180–190) · urban per-segment
src/engine/walk.js:509–528 (finales skip dressing per :497–502). Roll primitive
`walkPick(id,...cols)` walk.js:148–153. Digest carriage precedent: activeWalkDigest's
"here"-segment dressing field, src/world/dm.js:82–86.

## Decisions (recorded — do not re-litigate)

1. **Mechanism: a separate `atmo` field carried by the digest like dressing**, NOT a 50/50
   second source inside the sensory walkPick. Grounds: (a) urban segments have NO `.sensory`
   field (skin-grants.js:218–224 special-cases exactly this) — option 1 can't cover all three
   envs; (b) sensory text does NOT ride the DM digest today, while dressing's separate-field
   carriage (dm.js:86) is the proven consumption path; (c) leaves existing sensory rolls
   byte-identical (no SKIN_TINT_FIELDS interaction).
2. **ONE lane per room/leg/segment** — pick one of {air, odor, sound} uniformly, roll only
   that lane. Grounds: DIGEST-DIET — one new short string per room/leg, and three lanes per
   room would monotonize narration.
3. **Every room/leg/segment rolls; finale asymmetry mirrors dressing** — urban finales skip;
   dungeon finale + wilderness arrival DO carry atmo. Identical cadence keeps the RED-FIRST
   assertion total and the walker diffs minimal.
4. **No theater prop wiring.** Air/odor/sound are non-visual; keyword rules untouched.
5. **Digest carries the text string only**; the `{lane,text}` pair persists on the walk
   (rolled once, immutable like names).
6. Housekeeping riding this branch (docs-coherence discipline): flip docs/DRESSING-WIRING.md's
   status line from SPECCED to BUILT (the unit landed 2026-07-04; walker comments +
   verify-dressing.mjs prove it).

## Data shapes (exact)

New helper in src/engine/walk.js beside walkPick (:148):
```js
const WALK_ATMO_TABLES = {
  dungeon:   { air:"d100-air-currents",          odor:"d100-odors",              sound:"d100-unexplained-sounds-and-weird-noises" },
  urban:     { air:"d20-urban-air-currents",     odor:"d20-urban-odors",         sound:"d100-urban-sounds-and-weird-noises" },
  wilderness:{ air:"d100-wind-weather-currents", odor:"d100-wilderness-odors",   sound:"d100-wilderness-unexplained-sounds-and-weird-noises" } };
function walkRollAtmo(env){
  const lanes=WALK_ATMO_TABLES[env]; if(!lanes) return null;
  const lane=walkRnd(["air","odor","sound"]);
  const [text]=walkPick(lanes[lane],1);            // VERIFY-FIRST: re-check the column index per table
  return text ? { lane, text } : null;
}
```
Segment field: `atmo: { lane:"air"|"odor"|"sound", text:string } | null` on room / leg / seg.
Digest ("here" segment only, next to dressing, dm.js:86):
`atmo: s.atmo ? (s.atmo.text||null) : null` — ONE new short string.

## Behavior (ordered, with guards)

1. Add WALK_ATMO_TABLES + walkRollAtmo to src/engine/walk.js (null-safe: unknown env or
   empty table → null → walkers store null → digest carries null; graceful like light/skin).
2. Dungeon: `atmo: walkRollAtmo("dungeon")` beside the dressing roll (dungeon-walk.js:427),
   onto the room object (:434–438). All rooms including finale.
3. Wilderness: same beside :143 onto the leg (:166–173) and beside :184 onto the arrival.
4. Urban: same beside :519 onto the segment (:525–528); finale branch untouched.
5. Digest: activeWalkDigest here-segment (dm.js:68–87) gains the atmo string (surfaced ONLY
   on "here"; the DM narrates it, never invents it).
6. No table markdown edits, no recompile, no manifest changes; `tables.js`/`tables.json`
   git diff must be CLEAN at the end.

## Out of scope

Furnishings + container-contents (gen/loot layer) · the d6 air-visibility trio (lighting) ·
general-features blocks · interiors (ON-DEMAND-GEN) · re-rolling atmo on revisit ·
THEATER_PROP_KEYWORD_RULES · row re-authoring (Adam's craft sweep; note for his ledger — the
urban air/odor lanes are d20s, so city texture repeats sooner; craft-lane expansion, not a
wiring bug).

## Verification (dev/verify-atmosphere.mjs — sibling of dev/verify-dressing.mjs)

1. ⊗ RED-FIRST: roll each walk type ×50; assert every dungeon room, wilderness leg + arrival,
   and urban NON-finale segment carries atmo.lane ∈ {air,odor,sound} + non-empty atmo.text;
   urban finales carry none. Red before wiring.
2. Lane spread: across ×50 per env, all three lanes occur (guards a dead lane / wrong column).
3. Key presence: compiled tables.js carries all nine keys with non-empty rows
   (verify-dressing check-5 grep discipline).
4. Digest: here-segment carries atmo beside dressing; ahead/behind stubs stay bare.
5. Determinism: seeded replay yields identical atmo (verify-dressing check-2 convention).
6. ⊗ MUTATION: (a) stub the nine table ids to empty → checks 1/4 red; (b) drop the digest
   atmo line → check 4 red alone; restore → green. Record runs.
7. check-manifest → RESULT: OK; tables.js/tables.json diff clean; full sweep — named:
   verify-dressing.mjs, verify-walk.mjs, verify-travel-walks.mjs, verify-walk-consumption.mjs,
   verify-walk-refresh.mjs, verify-job-walks.mjs, verify-digest-diet.mjs,
   verify-skin-grants.mjs; gauntlet-monkey (0 harness-aborted).
