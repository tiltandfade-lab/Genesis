# KGR-7 walk truth — the gameplay-first vertical slice

Date: 2026-07-17
Build: `feat/kgr7-walk-truth` off integration `0a54f0b7` (the §15 acceptance amendment)
Rig: `dev/battle-gate/capture-kgr7-walk-truth.mjs` — real bardo boot, prep serviced through
`applyEvent({type:"prep_applied"})`, `start_walk` into the rolled dungeon frontier, production
interior render, canonical world persisted to `kgr7-world-state.json` (the world IS the save file;
`--restore` renders the same world under any engine state — seeds alone do not reproduce a roll
because world ids consume Date entropy).
Canonical fixture: **The Ivory Pit** · dungeon · The Loop · 4 segments.
Evidence: `dev/battle-gate/kgr7-walk-truth/` — `kgr7-before-preprep.png`, `kgr7-before.png`,
`kgr7-after.png`, `kgr7-before-after.png`, both `-diagnosis.json` dumps.

## The rolled demand (canonical, never rewritten)

| seg | areaType | feature | object | dressing |
| --- | --- | --- | --- | --- |
| S1 Entry | Chasm Room | Bone Wall | Small cairn | Winch drum with frayed cable |
| S2 | Sloped Passage | Toppled Bookcase | Sliding panel | Small shrine shelf |
| S3 | Natural Passage | Eldritch Circle | Chalk nub | Cookpot, soot-black belly |
| S4 Finale | T-Junction | Refuse Pile | Rope ladder | Rolled rug, damp-heavy |

## Why the before-frame realized nothing (the full chain, all confirmed live)

1. **Prep servicing** — first frontier render is the flat fallback board until `prep_applied`
   attaches `pn.spatial`; the invalid KGR-6 "live playtest" capture recorded exactly this state.
   The rig now services prep the way the DM seat does and captures the pre-prep frame as evidence.
2. **Realm fallback** — `activeRealmsFor` returns `[]` for every non-breach walk, so the interior
   seam passed `realmId: undefined` and `dressPlan` fell back to the CHROME roster: neon sci-fi
   filler in a base-world fantasy dungeon (also the source of the "overexposed white flora" P2).
3. **Noun projection gap** — legacy fallback cards (`S1.feature/object/dressing`) carry no
   `visual.slug` and no position, so `projectedDressing` dropped them: the room's own rolled
   identity never reached the stage in any walk ever rendered.
4. **Rule vocabulary** — all `realmPropNameIncludes` rules matched a field only settlement/urban
   tray paths stamp; interiors never stamped it. Only two fantasy slug rules existed, and the
   chrome fallback meant even those could not fire.
5. **Capture timing** — donor GLB loads replay the board asynchronously; the rig now waits for
   every stamped visualAsset's template before shooting.

## What KGR-7 landed

- **Realm truth (F1):** interior seam defaults `realmId` to `"fantasy"` (DESIGN 2026-07-15 Q19,
  fantasy-only pre-alpha) at the one seam every consumer reads.
- **Walk-noun projection (F2):** additive derived dressing candidates for slug-less canonical
  cards — identity via `realmPropName` (the rolled name), deterministic seeded cells, anchor-class
  primaries so `placeDistribute` never relocates a canonical fact (its first run pushed the cairn
  outside the room rect), camera-visible wall pools only, fail-closed: an unmatched noun adds
  nothing and renders exactly as before.
- **Walk-demand calibration (F3):** three workbench-calibrated, source-hash-bound admissions
  against this roll's demand — `kenney-castle-kit/rocks-small` (Small cairn, 0.3u stone stack),
  `kenney-retro-fantasy-kit/pulley-crate` (winch tackle), `kenney-food-kit/pot-stew` (cookpot,
  0.18u) — plus three name rules (`cairn`, `winch|pulley`, `cookpot|stew pot|cauldron`).
  `kenney-retro-fantasy-kit/pulley` is a NAMED approved-dev demotion: correct in the workbench,
  reads as an edge-on sliver at the production camera. All four admission gates re-pinned to the
  new exact set.
- **Fourth-wall law:** wall-hung props (donor mounts and extrusion cards) on camera-cutaway walls
  hide with their wall (`itrCameraSideBand`, the parapet's own hoisted test) — kills the
  floating-olive-painting-back class of artifact.
- **Rig:** `capture-kgr7-walk-truth.mjs` + world-state restore = the reusable gameplay-first
  acceptance harness the operation lacked.

## After-frame read (S1, same canonical walk)

Fantasy dungeon, warm practicals, willow set-piece, mossy boulder, rope pallet, fern — and the
rolled **Small cairn as a real calibrated 3D stone stack mid-floor**. Realization stamped 2 of 9
entries (both walk nouns); 7 filler entries remain honest billboards. Bone Wall stays
narration-only — the catalog has no truthful bone asset (nearest hit: `food-kit/fish-bones`).

## Residual findings (named, for the next units)

- **P2-A billboard wall clip:** tall tilted setPiece cards (35° camera pitch) penetrate far walls;
  the top strip of the willow art re-emerges above the wall line. The CLIP MARGIN LAW's
  `maxMag: 1` cap loses to cards taller than ~2u. Pre-existing (visible in the before frame too).
- **P2-B blocker volumes:** `full-3d-prop` blockers (`fantasy-flora-brambleblocker`) render as
  untextured near-black prisms — the most prominent visual debt in the frame. Pre-existing lane.
- **P2-C south-band staging:** `placeDistribute` relocates filler into the camera-cutaway shadow
  band where it reads as outside the room; run-to-run cascades also shuffle filler chaotically
  (deterministic but sensitive). Needs a readability term or a south-band exclusion.
- **P2-D wall-visibility authority:** the engine's compass n/w preference and the render's
  diagonal `itrCameraSideBand` disagree on irregular rooms — the winch mounted on an n-side cell
  the render judged camera-side, so it hides with its wall (correct law, invisible noun). One
  shared authority should decide "camera-visible wall" at both seams.
- **P2-E dark door leaves** (known): unchanged.
- **Catalog gaps from real demand:** bone wall / bone pile, winch drum (floor), shrine shelf,
  toppled bookcase, refuse pile, rope ladder, rolled rug. Future workbench tranches should mine
  rolled demand exactly this way; never admit speculatively.

## Machine state

`check-manifest` OK · all nine Kenney gates green after re-pinning the admission set ·
`normalize-donors` 62 calibrated assets byte-stable · full `dev/verify-*.mjs` loop run at commit
time (see CHANGELOG). Acceptance remains **Adam's read of the frames** — machine green proves
contracts, not visual success (OPERATION §15).
