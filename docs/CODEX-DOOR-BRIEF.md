---
type: codex-brief
status: IMPLEMENTED ON codex/clayroom-door-socket — pending Adam visual acceptance, 2026-07-23
consumer: Codex (independent visual-acceptance owner, AGENTS.md)
authority: ART-DIRECTION-CANON.md "THE DOOR / DOOR-FRAME SPLIT" + "THE KINDERGARTEN DOOR" +
  "Camera-side wall omission" (all verbatim, all 2026-07-23) · C1A-CLAY-ROOM.md D12b/D14/D18-D20
---

# CODEX DOOR BRIEF — make the doorway a piece of the wall

## Adam's definition (verbatim — this is the whole assignment)

> "the door and door frame are two separate objects, the door frame should generally be constructed
> as a piece of the wall, and the door is an object that goes in the hole in the wall"

Plus the kindergarten scope: **rectangle hole, rectangle door, 36"×80"** (0.6 × 1.3333 world units;
1 u = 5 ft = 60 in), prototype-only — more types later via D14's catalog.

## Where the current implementation falls short (measured, not guessed)

The door cell currently emits three wall-colored infill prisms (two full-height sides + a band over
a 0.61 × 1.35 opening, `ITR_DOORWAY_DEPTH 0.3`) that fill the shell wall's full-height, full-cell
aperture gap. Defect: they are a SEPARATE body from the wall — by default they sit at the boundary
plane (z −2.5) while the shell wall body stands centred at **−2.61** (thickness 0.29) — so they read
as applied frame columns rising to the ceiling, ~0.11 proud of the wall face. Adam: "the door frame
is just sticking out and rising to the ceiling... that's not normal door construction."

## The likely right shape (Codex owns the decision)

Cut the door-shaped hole into the WALL ITSELF — the shell compiler
(`compileRoomShellData`, `src/ui/theater-room-mesh.js`) currently excludes door segments entirely
(full-height gap, `apertures[]` ~line 1596/1927); building the wall with a 0.61 × 1.35 rectangular
opening (wall continuous above and beside, same body/plane/thickness) would delete the infill
prisms outright. The instanced wall channel (`theater-interior.js` door branch, ~1660) is the
non-shell fallback and can keep prism infill if the shell path owns the real answer. NO CSG —
wall openings are made by omitting/shaping geometry, never boolean subtraction (D14's law).

## What Adam already accepted — do not redo

- Leaf: 36"×80" extruded rectangle, corner-edge hinge (`interiorBuildInteractableDoorMesh`,
  theater-boot.js) — production hinge builder, record-derived board entry, orientation from
  `doorAxes` (the frame's own axis authority). Accepted.
- Camera-side wall omission (stems retained) — accepted on the packet ("the omission looks best").
- The mount/tuner: DEV-PORTAL §6.1 door-mount slice (clay overlay → Mount tab), per-axis nudges,
  snap cell-centre/boundary/wall-centre, lock-shaped export. Adam left tuned settings in his last
  session — value PENDING his paste; bake as the default when it lands.
- Darkness card sized to the opening, beyond the outer face.

## Gates (keep green; rewrite red-first only with a named supersession)

`dev/verify-clay-room.mjs` 137 (check 27 = kindergarten shape; will need rewriting to the
wall-hole shape — red-first, keep the REAL properties) · `dev/verify-d4-doors.mjs` 203 ·
`dev/verify-ks2-door-assembly.mjs` 40 · `dev/verify-dungeon-interior.mjs` 288 ·
`python3 build/check-manifest.py`. Captures: `node dev/capture-clayroom-fixture.cjs
dev/clay-captures/door <label> <port>` (serve the worktree; receipts carry doorMount + census with
world positions). Evidence bar: gameplay-scale before/after through the production renderer; Adam
gates the visual.

## Files

`src/ui/theater-room-mesh.js` (shell wall fill + apertures) · `src/ui/theater-interior.js` (door
branch ~1620-1710, instanced fallback) · `src/ui/theater-boot.js` (leaf builder ~4238, mount
~itrDoorMountFor, clay overlay Mount tab) · `src/engine/clay-room.js` (record → board adapter) ·
worktree `worktrees/Genesis-clayroom`, branch `feat/cl-r0-clayroom-reset` (14 commits, unmerged).
