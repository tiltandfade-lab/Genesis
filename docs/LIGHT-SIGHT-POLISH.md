# LIGHT-SIGHT-POLISH — the diegetic-light follow-ups (Adam's re-shoot feedback)

type: system-spec
status: SPECCED (Opus 4.8, 2026-07-11 — from Adam's feedback on the DIEGETIC-LIGHT re-shoot: suburb
"nuclear bomb", cosmic "invisible", floating rhomboids, "occlusion demo makes no sense / not working".
Grounded against the current tree; execute exactly. Three independent units.)

## Context
DIEGETIC-LIGHT (docs/DIEGETIC-LIGHT.md) landed: cone killed, ambient floored, diegetic shadows, a
bright hemisphere for daylit/overcast/moonlit, occlusion ankle-cut+ghost. The re-shoot exposed three
follow-ups. All taste values stay named constants (Adam dials from the next re-shoot).

---

## P-1 — LIGHTING DIALS (per-realm bright fill · cosmic · seat the glow)

### The three problems (from the re-shoot)
1. **suburb daylit blows out.** DL-A's `ITR_BRIGHT_SCENE_*` constants (theater-boot.js — grep
   `ITR_BRIGHT_SCENE_AMBIENT/HEMI/FILL_SCALE/KEY/FILL`, ~L-4 block) were pushed HIGH so lost-world's
   dark jungle albedo (`floorColor:#3d4a2e`/`wallColor:#2a3320`) would read bright. suburb's lighter
   kit blows out under the same numbers.
2. **cosmic voidlit is near-black.** voidlit is NOT in `ITR_BRIGHT_PROFILES` (only daylit/overcast/
   moonlit). cosmic reads as pure void.
3. **The glow disc floats with no source.** With the cone gone (`ITR_LIGHT_CONE_ENABLED=false`), the
   additive glow disc (`interiorBuildGlowDisc`, ~6161) hangs in mid-air where a realm has no light-card
   (`INTERIOR_LIGHT_CARD` map, ~6135 — only gloom/fantasy carry lantern/candle cards today). "Where is
   the light coming from?" fails.

### Decisions
- **Bright fill becomes per-realm, not one global set.** Replace the single `ITR_BRIGHT_SCENE_*`
  block with a per-realm override keyed on realmId (a small `ITR_BRIGHT_REALM_FILL` table), with a
  default. lost-world keeps the strong numbers (its albedo needs them); suburb/bright-kingdom get a
  gentler set tuned to their lighter kits. The mechanism: derive the fill from the realm's own
  authored floor/wall albedo luminance (brighter kit → less fill) OR an explicit per-realm entry —
  prefer an explicit per-realm table (predictable, dial-able) with a luminance-derived fallback.
- **cosmic gets its own emissive fill.** Add cosmic (voidlit) to a bright/emissive path: a low cool
  hemisphere + a faint self-emissive floor/star ambient so the room is legible without reading as
  daylight. NOT the daylit numbers — a distinct cosmic entry (dim, cool, legible).
- **Seat the glow on a visible source.** Every realm gets a minimal diegetic emitter under the glow
  disc so the light has a visible origin: either extend `INTERIOR_LIGHT_CARD` to cover all core
  realms (a small self-lit brazier/lamp/emitter card per realm), or mount a tiny emissive marker mesh
  (a low brazier/sconce nub) at the light seed when no card exists. Reversible: the emitter mounts
  behind the same lights path; a flag disables it.

### Anchors
`LIGHT_PROFILES` (~4655), `ITR_BRIGHT_PROFILES`/`ITR_BRIGHT_SCENE_*` (L-4 block, grep them),
`interiorBuildGlowDisc` (~6161), `INTERIOR_LIGHT_CARD` realm map (~6135), `interiorBuildLightCard`
(~after 6288), the lights builder `interiorBuildLights` (~6300+, where glow+card+cone mount).

### Verify — extend `dev/verify-diegetic-light.mjs` (real Chrome, roomMean luminance metric it already has)
- ⊗ suburb daylit roomMean drops below a blown-out ceiling (assert it's no longer clipping — sample
  the highlight region, prove it was clipping at base, then within range). RED-first.
- lost-world daylit stays bright (its number unchanged) — the L-4 headline assertion still passes.
- ⊗ cosmic voidlit roomMean rises above a legibility floor (was near-zero; assert readable now).
- Every core realm (chrome/gloom/fantasy + the bright set) has a visible emitter under each glow disc
  (assert an emitter mesh/card exists at each light seed; RED-first — none exists for e.g. chrome today).
- Regression: verify-theater-lighting 21/0, light-props 10/0, dungeon-interior 287/0. check-manifest OK.

---

## P-2 — WALL-HANG PLACEMENT FIX (the floating tan rhomboids)

### The bug (confirmed — persists with occlusion reverted, so it's pre-existing)
`interiorBuildWallProps` (theater-boot.js:6934) places each wall-hang extrusion prop at
`g.position.set((d.x)-cx, floorTop, (d.y)-cz)` — i.e. at the cell center, at FLOOR level, with NO
wall-normal offset and NO orientation to its wall. `buildExtrusionProp` (~6902) builds a box facing
+Z whose side/back faces are edge-sampled to flat stone tan (`itrPropEdgeColorFor`, ~6869). Result: a
painting/sconce sits as a small tan box floating at floor-center, showing its tan sides — the "little
floating rhomboids" Adam sees across renders.

### Decisions
- A wall-hang must mount **on its wall**: (1) at wall MID-HEIGHT (e.g. `floorTop + wallHeightBase *
  frac`, a named `ITR_WALLHANG_HEIGHT_FRAC`), not floor; (2) pushed flush to the wall PLANE (offset
  from cell center by ~half a cell along the wall normal); (3) rotated so its front face points INTO
  the room (away from the wall). The wall it hangs on / its normal must be resolved — place-dressing.js
  guarantees wall-adjacency (`dpAdjacentToWall`); the wall direction is derivable from the room
  geometry (which of the 4 cell-neighbors is solid wall). If `d` doesn't already carry the wall
  normal, derive it (find the adjacent solid wall cell; if ambiguous/none, keep today's placement and
  log — never throw).
- The wall-contact AO (`addWallContactAO`) must still sit behind the prop's back face against the wall
  plane after the reorientation (it currently assumes the +Z back face).

### Anchors
`interiorBuildWallProps` (6934), `buildExtrusionProp` (6902), `itrPropEdgeColorFor` (6869),
`addWallContactAO` (~6960), `interiorFloorTopAt`, the wall/solid-cell map (grep the interior build for
the wall instance list / solid mask the occlusion + tile build already read), `wallHeightBase`.

### Verify — `dev/verify-wallhang-placement.mjs` (real Chrome + THREE; copy boot from verify-diegetic-light)
- ⊗ RED-FIRST: at base, a wall-hang prop's world Y ≈ floorTop and its box center is at the cell center
  (floating, not on a wall). Prove it, then GREEN: Y is at mid-wall height and the box back face is
  within a small epsilon of the wall plane (flush), front face points into the room.
- The prop is oriented to its wall (assert rotation matches the resolved wall normal).
- Wall-contact AO still hugs the (new) back face.
- Regression: verify-dungeon-interior 287/0, verify-scene-direction, any wall-prop harness
  (grep dev/verify-*wall*/*dressing*), check-manifest OK. Shoot a before/after capture (a room with
  wall-hangs) and note the path — the orchestrator READS it to confirm the rhomboids are gone.

---

## P-3 — REAL OCCLUSION DEMO (prove the ankle-cut+ghost works, or prove it doesn't)

### Why
The DL-B demo (dev/battle-gate/occlusion-fade/*.png) is a synthetic harness scene — a bare floor plane
+ a fake floating occluder, no column, no mini. Meaningless. A/B on a real room DID show occlusion
revealing an otherwise-hidden mini, but there's no legible proof. Build one.

### Decisions (this is a CAPTURE/verification unit — no production-logic change)
- A capture `dev/battle-gate/capture-occlusion-real.mjs` that builds a REAL interior room (reuse the
  capture-env-rolls/interior-study fixture), places a mini in a cell **provably behind a
  column/wall from the live camera** (raycast camera→cell must hit an occluder — assert it, don't
  eyeball), and shoots the SAME framing twice: occlusion ON (default) and OFF
  (`window.Theater.setOcclusionFade?.(false)` — the test-only disable flag DL-B added; grep its name)
  — plus a mid-reference with no occluder. Output: `occlusion-real/{on,off,contact}.png` + a
  metrics.json noting whether the mini's screen rect reads the mini (ON) vs the wall (OFF).
- If the flag to disable occlusion at runtime doesn't exist, add a `window.Theater` getter/setter for
  it (test-only, mirrors setLightConeEnabled) — that's the only production touch allowed here.

### Verify
- The capture asserts (in metrics) the occluder is genuinely on the camera→mini ray (else the demo is
  meaningless again — this is the guard the first demo lacked).
- ON: the mini's screen-rect luminance/color reads the MINI (visible through the ankle-cut+ghost).
  OFF: it reads the WALL (occluded). A real, legible delta.
- The orchestrator READS on.png/off.png to make the keep-or-revert call on DL-B. check-manifest OK.

## Order + vehicles
Three independent units → three parallel executors (P-1 light rig, P-2 wall-hang, P-3 demo). P-1 and
P-2 both touch theater-boot.js but disjoint regions (lights ~6300 vs wall-props ~6934) — worktrees
isolate; orchestrator resolves any merge. After landing: RE-SHOOT env-rolls + read the P-3 demo, then
Adam judges. All reversible (named constants, flags).
