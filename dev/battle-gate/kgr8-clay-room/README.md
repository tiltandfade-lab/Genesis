# KGR-8 CLAY CARD 01 — the 5×5 proving room

`clay-01-shell.png` — the first rung of the proving ladder (clay 5×5 → rolled 5-room → rolled
14-room). One hand-authored 25 ft × 25 ft dungeon room, shell built **100% from
kenney-modular-dungeon-kit modules**, uniform clay-grey matte, production camera angle
(yaw 45°, rotationStep 0) with the production camera-side parapet cutaway (south+east walls at
0.4 height), clean dark void beyond the walls, open top, nothing in the room.

Rig: `dev/battle-gate/capture-kgr8-clay-room.mjs` (harness pattern verbatim from
`capture-ks3-kit-shells.mjs`). Re-run: `node dev/battle-gate/capture-kgr8-clay-room.mjs`.
Machine evidence: `clay-01-diagnosis.json` (module manifest, stripped-prism counts — 26 floor +
25 wall prism instances removed, ZERO prism shell in frame — parapet-cut list, final scene
inventory). `lineup-modular.png` / `lineup-mini.png` + `lineup-manifest.json` are the module
contact probe (both kits stood on a prism board, donor materials intact) the composition
decisions were read from.

## Modules used (one structural palette — kenney-modular-dungeon-kit only)

| module | count | role | placement |
| --- | --- | --- | --- |
| `template-floor` | 9 | floor | 2×2-cell tiles at centers (1.5/3.5/4.5)²: exact 5×5 coverage, last row+col overlap one cell, dropped 0.6–1.2 mm so coplanar tiles never z-fight |
| `template-wall` | 8 | walls | 2-cell slabs, face ON the room boundary, thin body growing OUTWARD into the ring band |
| `template-wall-half` | 3 | walls | 1-cell slab centered in each doorless side: wall–half–wall, mirroring the door side's wall–aperture–wall rhythm |
| `template-wall-corner` | 4 | corners | square post AT each corner point, rotated per quadrant so its 0.5×0.5 body sits fully outward with both inner faces flush with the wall planes |
| production flat leaf | 1 | door | the engine's own interactables door (state `shut`), archetype-standard 0.9×1.9 leaf |

Structural placement is cell + quarter-turn only. Wall/corner pieces take the engine's own
`KIT_WALL_NATIVE_HEIGHT`-style scale-y correction to the board's `wallHeightBase` (2.4/2.075 ≈
1.157; posts 2.4/2.025) — the published production convention for kit walls, which also closes
the kit's own 0.05-unit wall-vs-post height mismatch.

The doorway is a 1-cell ABSENCE in the north wall run (wall butt ends are the jambs — zero proud
surround; no jamb/header/arch/gatehouse anywhere). The leaf hinge is nudged +0.20 z into the
aperture so the leaf reads as an inset panel behind a shadow reveal (see deviation 3).

## Admission path

**Real path.** Every module loads in-page through `window.TheaterDonor.loadDonorPiece` — the
calibrated normalized index (`assets/models-normalized/kenney-modular-dungeon-kit/index.json`,
`genesis.donor-index.v2`) with per-load sourceSha256/recipeHash provenance verification. No
card-scoped module loading was needed. Placement/orientation/cutaway live in the fixture (the
hand-authoring this card is licensed for); no calibration, registry, or production render file
was touched.

## Card-scoped deviations (fixture-side, all documented in the rig's own comments)

1. **Prism shell stripped in board data.** The board is built by the real `interiorBuildBoard`,
   then `instances.floor/wall/doorframe/pillar` are emptied before `setInteriorBoard` — the same
   pure-data channel the KS-3 rig already writes. Zero prism instances render (the compiled room
   shell consumes floorList, so it stays down too).
2. **Darkness portal retired on this card only.** It mounts nearer the room than the shut leaf
   (portal z ≈ −2.63 vs leaf ≈ −3.0, measured off the live inventory) and would fully cover it.
   Cards with open doorways re-adopt the production portal.
3. **Leaf-plane correction (+0.20 z).** Production mounts the leaf at the door CELL CENTER — the
   wall mid-plane under 1-cell-thick prism walls, but half a cell OUTSIDE the thin kit slab. This
   is a real thin-wall finding the KGR-8 door rebuild must own: the aperture/leaf mount needs to
   be wall-plane-relative, not cell-center-relative.
4. **Parapet-cut parity is a mirror.** `itrCameraSideBand` + `ITR_CUTAWAY_PARAPET_FRAC` (0.4) are
   a sealed closure; the fixture reapplies the identical published math to its own wall holders
   (8 pieces cut, listed in the diagnosis).
5. **Clay stage dressing of the frame:** neutral hemi+key rig, fog off, post chain off
   (`_setPostChainEnabledForTest(false)`), motes removed, skirt forced to charcoal matte, leaf
   given a small emissive lift (the clay analog of the leaf's production emissive readability
   floor), `Theater.zoom(−1)` ×3 for the whole-shell framing (recorded in the diagnosis;
   `setInteriorBoard`'s small-board zoom bias otherwise frames a 5×5 for figures, cropping the
   shell).

## Kit coverage gaps found (drive the next calibration/authoring tranche)

- **No 1×1 floor tile** in either dungeon kit (template-floor is 2×2 cells; mini floor is 2×2
  too). Odd-dimension rooms cannot tile without overlap or outward excess. This card overlaps
  with an epsilon drop; the room compiler v2 needs a real answer (author a 1×1, or license
  overlap, or quantize rooms to even sizes only).
- **No flat-topped 1-cell doorway/aperture module** in kenney-modular-dungeon-kit. All gate
  pieces (`gate`, `gate-door`, `gate-metal-bars`) are 2.2 units wide, 2.2 tall (proud above the
  2.075 wall line) and ARCHED — every one violates the door law as a 5-ft doorway. The honest
  kit aperture is the butt-jointed absence this card uses.
- **kenney-mini-dungeon is a fused-tile grammar** (each "wall" piece is a closed 2×2 crenellated
  box with its own floor — see `lineup-mini.png`): unusable for outward-growing walls on a cell
  grid; rejected from the structural palette entirely.
- **`template-corner` is a curved quarter-round** (2×2 footprint) — the kit's authored corner is
  ROUND, not rectilinear (the room-small macro shares this language). Selectable here via
  `--corner piece`; the default card uses the square `template-wall-corner` post.
- **Base-rubble scatter is part of `template-wall`** — each slab ships loose rock chips around
  its base that land OUTSIDE the room on the tray plinth. On the clay card they read as scattered
  pale chips against the dark skirt (visible along the south/east parapets). Kit-authored
  geometry, kept; flagging for Adam's read — if unwanted, the rebuild needs either a
  rubble-stripped wall variant at normalize time or a licensed "debris apron" band in the void
  law.
- **Wall vs post native heights differ** (2.075 vs 2.025) — hidden here by the shared
  wallHeightBase scale correction; a native-scale build would show a 0.05 step at every corner.

## Smells worth carrying forward

- The camera-fit machinery (`interiorFitMaxHeight`, small-board zoom bias) frames FIGURES, not
  shells — fine for gameplay, but every shell-acceptance card will need the explicit zoom-out
  framing this rig records.
- The skirt/tray + scene-void greying is entirely mood-light-dependent: under a neutral rig the
  production skirt albedo reads pale. The clean-void ruling probably wants an albedo-level
  answer, not a lighting-level one.
- Late async passes (file textures, donor replays) can re-dress a mounted board; the rig
  re-asserts clay at shot time. Anything that captures modified boards should do the same.
