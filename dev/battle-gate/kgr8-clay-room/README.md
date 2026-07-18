# KGR-8 CLAY CARD 01 — the 5×5 proving room

`clay-01-shell.png` — the first rung of the proving ladder (clay 5×5 → rolled 5-room → rolled
14-room). **Adam's ruling: GO on the shell; rubble chips KEEP (placement taste-carded later).**
Card 02 follow-ups live beside it: `clay-01b-doorfix.png` (unit 1 — the wall-plane-relative leaf
mount; the card-01 leaf read as a proud slab beside a slot) and `camera-taste/` (unit 2 — the
pitch taste card, Adam's pick freezes the production camera angle). Card 03 follow-ups:
`clay-01c-doorfix2.png` + `door-card.png` (unit 1 — Adam rejected the card-02 door: "there's
still a gap, it doesn't sit aligned with the walls"; the leaf now rests on the VISIBLE wall face
and covers its aperture — deviation 3 below) and `camera-taste/battlefield-*.png` (unit 2 — the
22-vs-28 battlefield-vision tiebreaker with clay proxy pieces). Card 04 follow-ups:
`clay-01d-thinleaf.png` + `door-card-2.png`/`door-card-2-grazing.png` + `door-card-2-audit.json`
(unit 1 — Adam rejected the card-03 full-depth leaf: "no reason for the door to be that thick";
the leaf is now HALF the wall slab depth, CENTERED in the slab, and the aperture void is closed
by interior fill — deviation 3 below), `kenney-doors/` + `kenney-doors/kenney-doors-card.png`
(unit 2 — every kit gate piece mounted in the doorway for Adam's read; NO single-wide door
exists in either kit), and `camera-taste/production-28-verify.png` (unit 3 — the camera
graduation: `CAM_ELEV_DEG` 35→28 landed in production; the pure production path re-shot with no
override recovers pitch 28.000). One hand-authored 25 ft × 25 ft dungeon room, shell built **100% from
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
| production flat leaf | 1 | door | the engine's own interactables door (state `shut`), fit by `kgr8FitLeafToAperture` v4 (card 04, Adam's depth spec): 1.3 wide (laps the jambs 0.15/side), full height, **0.2492 deep = HALF the 0.4984 wall slab, z-CENTERED in the slab** (box z [−2.874, −2.625] about slab center −2.7492); the resulting 0.3973 inset reveal off the visible face is the accepted read |
| aperture fill (fixture boxes) | 4 | door | clay sill + plug + two reveal linings INSIDE the aperture (built by the same helper off live measurements) — closes every see-through-void vector the thin leaf opens; see deviation 3 |

Structural placement is cell + quarter-turn only. Wall/corner pieces take the engine's own
`KIT_WALL_NATIVE_HEIGHT`-style scale-y correction to the board's `wallHeightBase` (2.4/2.075 ≈
1.157; posts 2.4/2.025) — the published production convention for kit walls, which also closes
the kit's own 0.05-unit wall-vs-post height mismatch.

The doorway is a 1-cell ABSENCE in the north wall run (wall butt ends are the jambs — zero proud
surround; no jamb/header/arch/gatehouse anywhere). Card 02 unit 1: the leaf is mounted
WALL-PLANE-RELATIVE by the rig's `kgr8FitLeafToAperture` helper (see deviation 3).

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
3. **Leaf-plane correction — `kgr8FitLeafToAperture` (card 02 unit 1, REBUILT card 03 unit 1).**
   Production mounts the leaf at the door CELL CENTER — the wall mid-plane under 1-cell-thick
   prism walls, but half a cell OUTSIDE the thin kit slab (the card-01 frame showed it proud with
   a slot behind — failed the read). Card 02 re-derived the mount from the wall holders' own
   mount frames (the calibrated template-wall face at local z=0) and landed the leaf coplanar
   with the SLAB plane — **Adam rejected that too** ("there's still a gap, it doesn't sit aligned
   with the walls"), and he was right: the wall's FACE DETAILS protrude 0.2727 interior of the
   slab plane, so the plane the eye reads as "the wall" is the detail plane; a slab-plane leaf
   reads recessed with shaded reveals both sides. (The card-02 note below this one used to call
   the remaining dark line "real doorway geometry, not a gap" — that rationalization is dead: if
   it reads as a gap, it IS a gap.) Card 03: the leaf rests on the VISIBLE face plane (banded
   vertex max of the flanking pieces' face details, clamped, + 0.005 anti-z-fight hair), is
   WIDER than the aperture by 0.15 per side so it laps the jamb butt ends the way a real door
   covers its frame (the door law forbids proud SURROUNDS — jambs/headers/gatehouses — not a leaf
   covering its own opening), FULL height (floor top → wall top; the kit aperture is a
   full-height slot, any head clearance is a see-through void), and FULL depth (back at the
   wall's outer face — a pixel audit caught a 2×24 px void sliver peeking into the open
   aperture-head tunnel behind a 0.32-deep leaf, through the parallax wedge beside a jamb's cap
   end). The card-02 leaf emissive lift is retired with the recess that justified it. Measured:
   slab plane −2.5, visible face −2.2273 (detail protrusion 0.2727), aperture [−0.5, 0.5], leaf
   box x[−0.65, 0.65] y[−0.3, 1.9] z[−2.998, −2.222]. Pixel audit of `clay-01c-doorfix2.png`:
   ZERO sub-70-luminance pixels in the doorway below the wall silhouette (darkest seam tone 124 —
   joint shading, not void). Absolute box-to-plane alignment — idempotent, re-asserted at shot
   time. GRADUATION: production door rebuild = a leaf that COVERS its aperture, resting on the
   wall's visible face plane, never cell-center + constant and never the bare slab plane; the
   production 0.9-wide / 1.9-tall leaf constants are prism-era numbers. `door-card.png` is the
   dedicated close read (production camera direction, yaw 45° pitch 35°, dollied to dist 13 on
   the leaf center).
   **REBUILT AGAIN card 04 unit 1 (Adam's depth spec):** the card-03 full-depth leaf was
   REJECTED ("no reason for the door to be that thick"). The ruling: a leaf is the wall's depth
   or THINNER — canonically ~half the wall slab depth, CENTERED in the slab; the inset reveal
   that results is realistic and ACCEPTABLE; see-through void is NOT. v4 keeps card 03's
   aperture-covering width, full slot height, and measurement split, and re-cuts the depth:
   leaf 0.2492 deep (half the measured 0.4984 slab), z-centered on the slab's mid-depth
   (−2.7492), reveal 0.3973 behind the visible face. The void card 03 closed with leaf thickness
   is now closed by APERTURE-INTERIOR FILL built from the same live measurements: a clay SILL
   (threshold under the tunnel), a clay PLUG (leaf back → slab outer plane, floor → wall top —
   the open-top down-look slot behind a thin leaf), and two clay REVEAL LININGS straddling the
   aperture's side planes through the full tunnel depth. The linings are a MEASURED necessity,
   not decoration: the first card-04 frame's audit showed a full-height dark slit down the west
   reveal — at yaw 45° the parallax shift across the 0.4 inset (≈ tan 45° · depth) beats the
   0.15 side lap, and rays slip out the aperture's side planes through the sparse trim band and
   behind the thin upper slab. Solid linings close the side planes for every yaw and read as the
   clean reveal of a real doorway. Everything sits INSIDE the wall body — zero proud surround;
   the door law holds. Pixel audit (`door-card-2-audit.json`, hull = the projected aperture
   tunnel recorded in the diagnosis JSON): ZERO sub-70-luminance pixels below the wall
   silhouette in BOTH `door-card-2.png` (production camera, pitch 28, dist 13) and
   `door-card-2-grazing.png` (grazing pitch 12, same yaw/dolly); darkest doorway tone 124 —
   joint shading, not void (card 03's own floor). GRADUATION SHAPE: leaf = aperture-covering
   width, full slot height, half the slab depth, centered in the slab; aperture void closed by
   sill+plug+reveal interior treatment measured off the wall geometry.
4. **Parapet-cut parity is a mirror.** `itrCameraSideBand` + `ITR_CUTAWAY_PARAPET_FRAC` (0.4) are
   a sealed closure; the fixture reapplies the identical published math to its own wall holders
   (8 pieces cut, listed in the diagnosis).
5. **Clay stage dressing of the frame:** neutral hemi+key rig, fog off, post chain off
   (`_setPostChainEnabledForTest(false)`), motes removed, skirt forced to charcoal matte, leaf
   given a small emissive lift (the clay analog of the leaf's production emissive readability
   floor), `Theater.zoom(−1)` ×3 for the whole-shell framing (recorded in the diagnosis;
   `setInteriorBoard`'s small-board zoom bias otherwise frames a 5×5 for figures, cropping the
   shell).

## The camera-angle taste card (card 02 unit 2 — `camera-taste/`)

The finished room (fixed door) at four pitches, everything else held identical (yaw 45°, orbit
distance 24.956 = production fit + the recorded 3-step zoom-out, center [0,0,0], persp FOV):
`cam-a` 50° top-down · `cam-b` 35° CURRENT (`CAM_ELEV_DEG = 35`, theater-boot.js) · `cam-c` 28°
intermediate · `cam-d` 22° cinematic low. Pitch burned into each frame; exact parameters in
`camera-taste/README.md` + `camera-taste-params.json`; side-by-side in `camera-taste-card.png`.
Adam names the winner; that number freezes as the production constant. Rig note: an engine re-fit
re-places the camera between override and screenshot (measured: a 50° override rendered at 35°),
so the rig freezes the camera object per shot — see runCameraTaste's own comments.

## The Kenney door lineup (card 04 unit 2 — `kenney-doors/`)

Adam: *"what does the doorway look like when you put the kenney doors in there? are there single
wide and double wide doors?"* Verified inventory answer: **NO single-wide door exists in either
dungeon kit.** kenney-modular-dungeon-kit ships `gate` / `gate-door` / `gate-door-window` /
`gate-metal-bars` — all 2.2 W × 2.2 H × 0.7 D calibrated, ARCHED, with proud surrounds;
kenney-mini-dungeon ships `gate` — 1.6 W × 1.5 H × 0.4 D, arched, hinged leaf. Every one is a
~2-cell piece, so the study room's aperture is WIDENED TO 2 CELLS (noted on the card; the canon
clay room keeps its 1-cell doorway). Each piece loads through the real donor admission path,
centers on the aperture with its interior face on the wall's visible face plane, and takes the
wall band's own scale-y parity factor (wallHeightBase/2.075 — NOT per-piece, so the kit's
gate-vs-wall height relationship is preserved: modular gates crown 0.145 proud of the wall top,
the mini gate stands 0.66 short; both kit-true). Geometry untouched, clay like the shell (the
donor-material read lives in `lineup-modular.png`/`lineup-mini.png`); no production leaf/portal
on this board. Frames: `kenney-doors/<pack>-<slug>.png` (frozen production camera, pitch 28) +
`<...>-zoom.png` (doorway dolly, dist 13) + `kenney-doors-card.png` (2×5 contact sheet, names
burned) + `kenney-doors-manifest.json` (measured boxes, cameras, fits). These pieces violate the
flat-leaf door law by construction — the card exists so Adam judges them with his own eyes.

## The camera graduation (card 04 unit 3 — FROZEN at 28°)

Adam's battlefield-card ruling landed in production: `CAM_ELEV_DEG` 35→28 in
`src/ui/theater-boot.js` (the single-constant swap IS the approved graduation; no other camera
surgery). Verification: the clay room re-shot through the PURE production camera path with no
override — `camera-taste/production-28-verify.png` — and the pitch recovered from the live
camera's world direction reads **28.000** (`camera-taste/production-28-verify-diagnosis.json`,
`cameraVerify.pitchDeg`; yaw 45, FOV 20). Every card-04 frame carries the same recovered-pitch
sanity in its diagnosis (`productionCamera`).

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
