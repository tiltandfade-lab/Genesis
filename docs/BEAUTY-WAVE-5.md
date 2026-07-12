# BEAUTY-WAVE-5 — THE SECOND INTEGRATION PASS (rolls become citizens of the scene)

type: system-spec
status: SPECCED v2 (Fable, 2026-07-11 — v1 modeled interactables; v2 reshaped by Adam's rulings:
one-room-at-a-time render (Zelda-NES), occlusion-fade over camera-avoidance, roll-as-palette
curation, EVERYTHING volumetric with an authored per-sprite extrusion depth, state as a broad
engine primitive. Cross-checked against the 2e *Dungeon Builder's Guidebook* now in `Reference/`
— which endorses the room-graph/one-room model point-for-point and supplies liftable mechanics.
Builds as its own wave AFTER BW4; interactables lead the spec; all three seams co-critical.)

## The thesis

BW3 was "THE INTEGRATION PASS (sprites become citizens of the scene)" — it integrated sprites
into lighting/grade/DoF. This is the **second** integration pass, closing a deeper gap: **the
roll layer is rich and authored; the render layer discards or ignores the richness.** The rolls
aren't reaching the graphics. Five instances of one seam:

| Rolled (rich, authored) | Rendered (thrown away) today |
|---|---|
| `dungeon-interactable-object` → "a rusted lever" | text the DM reads; never a placed object |
| objects-dg-03 art (door/chest/lever/torch/grate…, 300 cells) | deliberately excluded — no state channel |
| d200 `Dungeon Area Type` (rotunda, octagon, L/cross, cave) | a random 4–7 cell rectangle |
| the d200 "Side Area & Structural Features" (dais, pit, blind) | discarded with the shape |
| `REALM_SURFACES` condition prose ("rust-streaked", "mildew") | a single flat hex `baseTint` |
| `Architecture Material` (basalt/marble/copper/glass/silk) | never reaches the renderer at all |

Two of the reshape rulings are not seam *content* — they are the **stage** every seam performs
on, so the wave opens with **SEAM 0 — THE STAGE**, then the three co-critical seams
(interactables lead the spec; rooms + materials/conditions build in parallel behind it).

## Scope — CORE 3 FIRST (Adam, 2026-07-11)

**Prove the whole wave on fantasy, gloom, and chrome before opening any other realm.** The other 9
canonical realms are **shelved as expansion packs** — spec-complete but parked until a realm ships.
This governs SEAM 1 (wire/prove objects-dg-03 on the core 3 only — the art exists for all 12 realms
but the placement/state/render chain proves on 3), SEAM 2 (the room engine is realm-agnostic, so it
serves all, but judge it on core-3 dungeons), and SEAM 3 (the core-3 texture gap-fill runs now —
`dev/model-qa/mock-gen/PACKET-07-CORE-VARIANTS.md` + the realm-agnostic decal/material packets 05/06;
the 9-realm texture packet 04 is parked, minus a small cross-usable subset). Un-park per realm as the
expansion ships.

## THE INTEGRATION LAWS

1. **THE ROLL IS THE SOURCE OF TRUTH.** Where a table authored content (shape, material, object,
   state), the renderer READS it — it does not re-invent independently. Every unit replaces an
   "ignore the roll, pick randomly" path with "consume the roll."
2. **NEVER INVENT A NOUN (unchanged).** Placement only positions rostered slugs; the DM only
   NAMES what the engine placed.
3. **ONE ROOM AT A TIME.** The connected room graph is the LOGIC truth (which rooms exist, how
   they link, the map). The renderer shows only the ACTIVE room. No visible or shrouded
   neighbors — no spoilers, no camera spill, budget concentrated on one room. (Zelda-NES, not
   Diablo. Endorsed by the 2e book's tile-graph model.)
4. **OCCLUSION-FADE, NOT CAMERA-AVOIDANCE.** The camera is not fixed; do not place *around* it.
   Place for beauty/narrative/tactics; any architecture between the orbit camera and the action
   **fades to ~5% opacity or demotes to a short stem.** (Retires `dressPlan`'s camera-side bias;
   extends the BW2 occlusion+clip law.)
5. **THE WALK RECORD IS CANON; THE FRAME IS SELECTIVE.** The walk rolls rich fields on purpose.
   A visual projector objectifies a small, themed subset per room; **the median room can remain
   visually near-bare** (the 2e Contents curve: ~62% empty by design — "empty is the resting state
   that makes dressed rooms land"). Every rolled field remains on the canonical segment and in
   prose or the DM's staging reserve. Over-budget fields are not discarded, rerolled, or promoted to
   codex merely because they do not fit; they are simply not all geometry in the same frame. See the walk-native amendment in
   `ui-sketches/mock-frames/vq-battle-scenes/WALK-NATIVE-DIORAMA-CONTRACT.md`.
6. **STATE IS A BROAD PRIMITIVE.** Most placed entities carry a mutable `state` field + a
   state-transition event, designed broad from day one; BW4 animates the transition (never a
   teleport — a door swings, a chest lid lifts, a fire gutters).
7. **EVERYTHING IS VOLUMETRIC.** Every object is a real extrusion with authored dimensions; the
   only non-object affordance is the sparkle (§IA-4). Depth is a stored per-sprite `extrudeDepth`
   authored ONCE (not recomputed per-roll), scaled by sprite type. Off-kilter is a condition.
8. **PLACEMENT IS TACTICAL.** The combat-space protections (center 2×2 clear, cover-to-walls,
   `CLEAR` veto) are load-bearing FUN, not cosmetics — every rule preserves the tactical read.
9. **BOTH PATHS FOR CONDITION.** A base surface can be WIDENED (re-gen: more variant tiles) AND
   OVERLAID (a condition decal). Neither replaces the other.

---

# SEAM 0 — THE STAGE (the render foundation; leads)

## S0-1 — ONE-ROOM RENDER + THE CONNECTION-POINT CONTRACT

Render only `pn.spatial`'s ACTIVE room; movement through a door **transitions** to the next room
(rebuild under BW4's MF-2 crossfade — already specced). The room-graph edge type is the 2e book's
connection-point contract: **`same-level` slots** (door / open-archway / hallway) + **`vertical`
slots** (stair up / down / both — a stair is TWO slots, above+below). Two riders from the book:
- **Archway-vs-door sightline:** an open archway grants a *controlled glimpse* into the next room
  at the threshold (a teaser, not the whole neighbor); a door does not. Discovery-pacing lever
  that honors ONE-ROOM without violating it.
- **Per-room plan-vs-elevation axis flag:** vertical rooms (shafts, chasms, waterfalls) don't
  obey floor-plan edge logic — flag them so the camera/geometry orients correctly.
*Verify:* only the active room's geometry exists in the scene graph (assert neighbor meshes
absent); door-cross transition swaps rooms under the crossfade; connection slots on both sides of
an edge agree; loop gate re-shot per room; fps with one room ≥ current whole-plan fps.

## S0-2 — OCCLUSION-FADE + ORBIT CAMERA

The orbitable per-room camera + a screen-space/depth test: architecture (walls, columns, tall
furniture) occluding the action cluster **fades to ~5% or demotes to a short stem**, restoring on
clear. Retire `dpIsCameraSideOfRoom`'s far-side placement bias (IA-3 no longer dodges the camera).
*Verify:* a blocker between camera and cluster fades within N ms and restores; fade never touches
the action figures themselves; interruptible; determinism unaffected (fade is view-state, not
world-state).

## S0-3 — THE STATE PRIMITIVE (broad)

A mutable `state` field + a `stateTransition` event on placed entities generally (interactables,
fixtures, fires, creatures alive/wounded/dead, surfaces clean/fouled). Defaulted safely; the
transition event is the hook BW4 animates. Designed broad; interactables (SEAM 1) are the first
consumer, but the field and event are engine-general.
*Verify:* an entity with no explicit state resolves a safe default; a transition fires the event
exactly once and is fake-clock testable; state is seeded/deterministic where rolled.

## S0-4 — THE VOLUMETRIC EXTRUSION MODEL

Retire the flat-card tier. Every object carries a stored **`extrudeDepth`** (referenced to the
~1.5u humanoid), **authored once in a pass, never computed per-roll.** Depth by sprite type:
hero props full volume (+ articulated parts, §IA-4); standard props a typed mid-depth; **flush
fixtures (grate/vent/wall-plate) minimal depth** (they sit flush) — except **off-kilter**, a
condition where a shoddy/decayed dungeon tilts a flush fixture *proud* (rides S0-3 state + the
spice band + the existing KILTER law). Amends the PROP PERSPECTIVE law: extrusion depth is now
**authored (stored), not contextual (computed).** Full detail: **`docs/GRAPHICS-ENGINE.md` §H**
(folded there per Adam's ruling — extrusion-by-type grammar + the `extrudeDepth` field + the
off-kilter condition + the §C reconciliation; not a standalone doc).
*Verify:* every registry object resolves an `extrudeDepth` (no per-roll computation path remains);
type→depth bands assert (grate < crate < chest); an off-kilter fixture renders proud/tilted only
under the decayed condition; the depth authoring pass is idempotent.

---

# SEAM 1 — INTERACTABLES (the lead; "can you model those?")

objects-dg-03 art (finished today): **door, chest, container, campfire, lever, portal, shrine,
trap** — 300 cells. Taxonomy as (state × placement × tactical role):

| Archetype | States | Placement grammar | Tactical role |
|---|---|---|---|
| **Door** | shut · ajar · open · broken | binds to existing **DOOR cells**; aperture cut to the rolled door silhouette | chokepoint; LoS gate |
| **Chest** | closed · open · looted | floor, wall-adjacent, off the center 2×2 | reward magnet → pulls off cover |
| **Container** | closed · open | floor, wall-adjacent, clustered | cover; loot |
| **Campfire** | lit · embers · cold | floor, room-anchor, **light-affine** | light pool; rally point |
| **Lever** | left · right | **wall-mounted** | objective; puzzle |
| **Portal** | sealed · active | **back wall**, finale-biased | objective; escalation |
| **Shrine** | intact · defiled · active | wall-adjacent / alcove, **focal**; on the **dais** when terrain has one | cover; ritual site |
| **Trap** | hidden · sprung | floor, thresholds & center approach (chokepoints) | the tactical teeth; pairs with the **pit** |

(torch/grate/vending live in adjacent families and fold identically.)

## IA-1 — FOLD & REGISTRY
Mirror `REALM_DRESSING` (`build/gen-realm-dressing.py`): a fold reads the objects-dg-03 manifests
→ registry keyed **`slug@state`**. Includes the **location authoring pass** (today every cell is
`location:"both"` — set per-archetype floor/wall/door-cell from the table) and the **`extrudeDepth`
authoring pass** (S0-4 — author each object's depth once). Absorbs MICRO-PROPS.md's d100-noun →
archetype mapping (its 3D-micro-model geometry is superseded by the extrusion path).
*Verify:* deterministic fold; every rostered slug resolves art + `extrudeDepth` at every state;
`check-manifest` clean; no undifferentiated `location:"both"` survives.

## IA-2 — WALK→COORDINATE BINDING + VISUAL PROJECTION (the crux of "graphics rolling in")
Turn the text-only roll (`dungeon-walk.js:541`) into a placed thing.
- **`plan.interactables[]`** sibling to `plan.dressing[]` — a deterministic projection carrying
  `{archetype, slug, state, extrudeDepth, name, flavor, x, y, roomSegNum, sourceRef}`. The canonical
  noun remains the raw segment field; the placed entry is rebuildable view/mechanics data, not a
  second content record. Promote to codex only if ordinary codex doctrine independently requires a
  persistent identity/contact, never merely because graphics placed it.
- **The visual-projection pass (Law 5):** enforce a **default-empty screen budget** and derive the
  visual register from already-rolled walk setup/skin/segment fields. Select a coherent small set
  (the 2e "kitchen → cooks+pots+hound" rule) without inventing a replacement theme.
- **Walk-backed staging reserve, never a discard lane:** over-budget rolls remain on the walk segment
  and receive source-referenced reserve entries. The reserve lets the DM introduce them through the
  slow drip, promote them when space opens, or let interaction make them visually dominant. "Not a
  mesh this frame" never means "not canon" or "unavailable to narration."
- **Coherence is upstream:** a surprising fit is a story fact or a table-authoring issue, not a
  renderer license to reject/reroll. Ecology constraints belong in the walk roller/table chain.
- **Starting state** comes from a rolled field when present, otherwise an archetype-safe default.
  Spice may bias the upstream walk roll; the renderer does not make a fresh state roll.
*Verify:* a fixture walk yields a source-referenced coordinate in `plan.interactables[]`; the raw
segment is unchanged; a reduced visual budget changes only the placed projection, never the segment
or digest; same segment+overlay+seed rebuilds byte-identically.

## IA-3 — PLACEMENT / COMPOSITION  *(= build ROOM-GRAMMAR.md)*
ROOM-GRAMMAR is promoted here — it IS this unit. Placement via its primitives (ALIGN levers to
walls, PAIR/FLANK braziers to doors, FOCAL shrine to the anchor, RHYTHM torch cadence, **CLEAR**
vetoes door-swings + aisles LAST) and typologies (shop/shrine/library/barracks/crypt/throne/camp).
Interactables place BEFORE decorative dressing. **No camera-side bias** (S0-2 handles visibility).
Light-affine → real PointLight seeds; traps → chokepoints; portals/levers → finale/back-wall.
*Verify:* ROOM-GRAMMAR's harness (rhythm uniform, pairs mirror, CLEAR veto red-first) + nothing
lands on a CLEAR cell or the center 2×2; determinism byte-check.

## IA-4 — RENDER (doors first; the construction classes)
Render via the three construction classes (GRAPHICS-ENGINE §H) + one non-object affordance:
- **MODEL** (hero/articulated) — the **chest = faced-box base + hinged lid** (closed/open/looted as
  geometry, lid hinges on the BW4 state tween); portals, complex set-pieces. Whole-object path.
- **FACED-BOX** — rectilinear furniture-class objects (containers, benches-as-cover) — a parametric
  box wearing generated sprite faces; you don't extrude these.
- **EXTRUDE** — flat/silhouette objects (levers, grates, banners, wall relief) — simplified-contour
  extrusion (Douglas-Peucker, ~200 tris) at the authored `extrudeDepth`.
- **Sparkle affordance** — *no mesh*: a noticed-secret (from an ambient-perception roll) renders as
  a **sparkle**; the DM handwaves the reveal ("an ancient bow under a rock — what's *that* doing
  here?"). Narrative-first, like the fragment oracle.
- **Doors:** the wall **aperture is cut to the rolled door's silhouette** (arched door → arched
  opening), rendered through the door sprite-extrusion spec — **never a flat quad**.
**Doors ship first** — the thin vertical slice that proves the whole stack: render one room →
place a shaped-aperture extruded door carrying rolled type+state → walk through → crossfade to the
next room (proves S0-1/S0-3 + IA-1/2/3/4 at once).
*Verify:* a study card per archetype per state READ; chest lid hinges on the open transition;
door aperture matches the rolled silhouette; sparkle affordance carries no mesh; fps ≥30 with a
room fully dressed; loop gate 5/5.

---

# SEAM 2 — ROOMS (size-fidelity + structural terrain + real shapes)

The d200 `Dungeon Area Type` table is *already beautiful* (rotundas, octagons, L/cross, caves) and
its "Side Area & Structural Features" already authored tactical terrain (dais/pit/blind).
`spatializePlan` throws it away as a random rectangle, and the caller passes no `sizeClass`.

- **RM-1 — SIZE FIDELITY.** Parse `area.dims` → a real `sizeClass` into `spatializePlan` (kills
  "octagon → random box"; rooms stay rectangular this cut).
- **RM-2 — STRUCTURAL TERRAIN.** Wire the structural-features column into the grid as elevation
  tiers (dais up, pit/sunken down, blind/ledge) — the seam where "beautiful rooms" and tactical
  fun are the SAME fix; terrain informs IA-3 (shrine on the dais, trap on the pit approach).
- **RM-3 — REAL SHAPES (now tractable).** Lift the 2e **Table 11f** shape menu and **derive exit
  slots FROM the polygon** (hexagon→6 faces, octagon→8, circle→periphery, single-entrance→vault) —
  "shape and connectivity are one decision." This is the non-rect carving `DUNGEON-GRAPH.md:71`'s
  unbuilt ellipse flag anticipated; the polygon-exit rule is what makes it affordable.
- **Free variety (the book's permutations):** rotation/mirror on placed rooms (cheapest geometry
  variety) + the "invasion" re-skin (temple→goblin warren: same rooms, new tenant, auto-hooks) —
  Genesis's realm/skin system already has the seams for both.
*Verify:* rolled dims → matching footprint (±0 size class); terrain tiers render at height + stay
reachable (BFS green); a rotunda no longer boxes; exits sit on polygon faces; determinism held.

---

# SEAM 3 — MATERIALS & CONDITIONS (re-gen AND decals — both)

Condition lives only as prose today; `Architecture Material` is unwired; only 3/11 realms have
authored textures; there is no compositing (every tile a single flat bake; the only floor-layer
idiom is the flat decal quad).

- **MC-1 — WIRE `Architecture Material` + material inheritance.** Route the rolled building
  material (basalt/marble/mudbrick/copper/glass/ironwood/silk) to the renderer; add missing
  recipes. Adopt the 2e **material-inheritance** rule: a cave-adjacent room propagates a "rough"
  flag so no marble corridor bolts onto a cavern.
- **MC-2 — CONDITION DECALS (extend the flat-quad idiom).** Turn `REALM_SURFACES` condition prose
  into a rendered overlay carrying condition ART (grime/moss/wear/stain), driven by the surface +
  material roll. Wire the two inert stashes first as proof (`shared-wet-stain-decal-set-1.png`;
  the `textures-psx` CC0 pack — rust/scorch/moss/wetmud). **Quad-on-top, not compositing** (extends
  the only existing layer idiom; reserve blend infra unless quad fails). Off-kilter fixtures (S0-4)
  read as a decayed-condition cue here too.
- **MC-3 — WIDEN THE TILE POOLS (re-gen).** `REALM_TEXTURES` is already a variant ARRAY (length 1,
  designed to widen); author the 8 missing realms + append variants for real pool breadth.
*Verify:* the rolled material changes on-screen pixels (red-first: two materials render
distinguishably); a condition decal composits over its base without disturbing the VALUE LAW
ordering; the wet-stain stash renders where its prose is "wet/stained"; all 11 realms resolve a
floor texture.

---

## Adjacent — GENERATOR v2 (flagged, not core BW5)

The 2e book's dungeon-assembly mechanics upgrade the generator's *coherence* (separate from the
render gap). Flagged for a later generator pass, not built here: **escalating-bias convergence**
(termination pressure rises per room → tunable dungeon length, always reaches a focus/boss),
**distance-decay pruning** (branches dead-end farther from the spine → bounded footprint + a
depth/difficulty gradient — aligns with Genesis's spice-by-depth), and **spine-first assembly**
(chart origin→focus before accreting branches → every dungeon has a real beginning-middle-end).

## The BW4 coupling

Keep BW4 clean. The one interaction: once S0-3 gives entities states, transitions must not
teleport (BW4 Law 1) — a door swings, a chest lid lifts, a lever throws. The only BW4 plan touch:
**interactable/fixture state transitions are motion targets** — actionable only after this wave
wires them. Order holds: BW5 wires; BW4 animates.

## Order + vehicles

SEAM 0 leads (the stage). **Doors-first is the keystone slice** — it exercises S0-1/S0-3 +
IA-1/2/3/4 end-to-end. Cheap wins pulled forward: **RM-1 (size fidelity)** + the IA-1 location &
`extrudeDepth` authoring passes. SEAM 2 and SEAM 3 build in parallel behind SEAM 0 once
`plan.interactables[]` + the cache boundary are proven; RM-1 and MC-1 are each cheap first cuts.
Vehicles: Sonnet executors per unit behind Sonnet-ready specs; personal re-gate every unit (never
trust self-reported green); `--no-ff` merge per unit; regenerate — never hand-merge — generated
artifacts at the master merge. Standing scars apply (kill stale servers, commit before finishing,
pinned red-first refs).

## Supersession / reconciliation / new docs

- **ROOM-GRAMMAR.md** — PROMOTED into this wave as IA-3 (the placement/composition engine). Build
  it here; not rewritten.
- **MICRO-PROPS.md** — d100-noun→archetype MAPPING folds into IA-1; its 3D-micro-model geometry is
  SUPERSEDED by the extrusion path (S0-4/IA-4).
- **PROP PERSPECTIVE law (BEAUTY-WAVE-2 / GRAPHICS-ENGINE)** — AMENDED: extrusion depth is now
  authored (stored `extrudeDepth`), not contextual (computed per-roll). See GRAPHICS-ENGINE §H.
- **GRAPHICS-ENGINE §C (INTERACTIVE OBJECTS)** — its state model survives; its "flat card, state =
  texture-swap" GEOMETRY is superseded by the extrusion model (§H). Reconciled in §H.
- **Detailed specs folded into their homes** (not standalone): the extrusion model + one-room
  render + occlusion-fade → **GRAPHICS-ENGINE §H/§I**; the connection-point contract + real room
  shapes (RM-1/2/3) → **DUNGEON-GRAPH Law 7 + U6**; the placement/composition engine → ROOM-GRAMMAR
  (IA-3). BW5 stays the wave umbrella; the mechanics live in those system-specs.
- Register in `docs/DESIGN.md` (locked-decision lines: one-room render · occlusion-fade ·
  roll-as-palette · everything-volumetric · broad state primitive) + `docs/NEXT-STEPS.md`
  (Do-next) on Adam's sign-off — held until then, per director seat.
