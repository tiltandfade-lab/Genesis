---
type: system-spec
project: Genesis
status: SPECCED — build AFTER the come-home migration (first new-home unit); the door workbench (in flight) becomes page one
created: 2026-07-17 (night)
consumer: Adam (the portal's only user) + the rigs/engine that consume its lock files
depends_on: door workbench (feat/kgr8-door-workbench), sprite-review.py, the parked LIGHT-LAB, DESIGN.md 2026-07-17 rulings
---

# THE DEV PORTAL — one launcher, every editor

Adam's order (2026-07-17, verbatim): "really there should be a dev portal that allows me to use
any editors we create, a launcher for that single dev portal is acceptable, that allows me to
edit lighting settings per lighting object, my sprite sizes, horizontal and vertical alignment,
the 3d workbench which allows me to adjust the alignment settings of specific objects that i
request to be tweaked"

## The unifying contract (what makes it a portal, not a pile of pages)

1. **One launcher** in Adam's launcher folder → starts one server → opens one home page listing
   every editor. No per-tool launchers ever again (the LIGHT-LAB launcher stranded on the
   Desktop is the anti-pattern).
2. **Every editor renders the REAL engine** (the door-workbench boot path), never a mock.
3. **Every editor ends in SAVE**, and SAVE writes a named, committed **lock file** (the
   door-mount-lock.json pattern): locks are data consumed by rigs + production, never hand-edits
   to engine code. A lock file IS a test-card constant — the prototype-proof law's approval
   artifact. Systemwide application of a lock stays gated on Adam's read of its card.
4. **Fixture picker on every page**: the 5×5 clay room, the Ivory Pit, or any saved world state
   (the workbench save API / --restore already does this).

## Pages v1 (build order)

1. **Object-Alignment Workbench** — the door workbench generalized: select any staged object
   (click-pick or a request list Adam names), nudge position/rotation/scale RELATIVE TO ITS
   ANCHOR (wall plane, floor cell, socket, ceiling), arrow-key fine steps, live numbers; SAVE
   writes a per-object-class mount lock. "Specific objects that i request to be tweaked" —
   the request list is the queue.
2. **Sprite Editor** — the existing sprite-review (5179) embedded/linked as a portal page:
   sprite sizes (feet), floor line, horizontal + vertical alignment, legacy-vs-faceted compare.
   Its registry-write discipline is unchanged (regenerate, never hand-edit).
3. **Lighting Lab** — revive the parked LIGHT-LAB as a page: per-light-object settings
   (intensity, color, range, height, falloff) on real fixtures in the fixture room; the LL-1b
   "2 lab tunables live-replay" rides this. SAVE writes per-fixture-class light locks.

## Pages v2 (APPROVED by Adam 2026-07-17: "yeah, all of that actually sounds very good")

- **Time-of-day scrubber** — scrub the in-world clock; edit the CELESTIAL_ARC keyframes and
  daylit soft-shadow table live (Adam's standing red-pen items from 2026-07-15).
- **Decal Lab** — preview decal nouns at rolled size bands with free rotation/overlap (the
  2026-07-17 decal rulings); dial each noun's band; SAVE writes the size-band table.
- **Material/Normal-Map Tuner** — the Sobel-strength sliders per surface class (walls/floors,
  props, characters) that generate the ordered normal-map taste cards.
- **Shot Tuner** — the named compose/occlusion consts (ITR_OCCLUSION_UPPER_OPACITY,
  STEM_HEIGHT_U, framing targets) as sliders. Camera PITCH stays frozen (28°, law).
- **Provenance Inspector** — click any staged object → its chain: walk fact → table roll →
  realized asset (read-only; the anti-drift boundary made visible).
- **Extrusion Lab** (Adam's ask, 2026-07-17: "any way i can get an editor to tweak the settings
  on sprite extrusion?") — pick any corpus sprite, live-generate its smooth-contour extruded
  piece beside the flat standee under a directional light rig. Sliders: thickness/depth, bevel
  width + angle, contour smoothing epsilon (facet count), side-shell tone/darkening, back-face
  treatment (mirrored interim vs authored), foot/anchor line, composed-angle preview yaw. SAVE
  writes an **extrusion recipe lock** per sprite class (character / environment / prop) — the
  X1 extrusion spec's parameters made hand-tunable. Serves the A6 law (environmental sprites =
  architecture-aligned extruded citizens) and the composed-standee ruling.

**How the Extrusion Lab layers with the Provenance Inspector:** extrusion adds one link to the
chain. The inspector's chain becomes: walk fact → table roll → chosen asset (sprite) →
**extrusion recipe (which lock file + version + parameter values manufactured this geometry)**
→ anchor derivation (which wall/floor/socket placed it, per A6). Clicking any extruded piece
shows WHICH sprite and WHICH recipe stamped it — provenance covers not just what was chosen
but how it was manufactured into 3D. The Lab writes the recipes; the Inspector reads them.

## Non-negotiables

- Portal pages NEVER mutate production source; they write lock files and tables.
- The worktree law and prototype-proof law apply to portal-driven changes like any other.
- Build at the NEW repo home (post-migration); single server, zero new npm deps if possible.
