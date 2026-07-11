# GRAPHICS-ENGINE — the Wildermyth grammar (Adam's north star, 2026-07-10 evening)

type: system-spec
status: PROVISIONAL (Adam named the analog; recipe captured same-session; build units await red-pen)

## The ruling

**Wildermyth is the technical analog.** Not the art to copy — the *construction* to match:
2D cutout characters standing in a 3D diorama world; clean blocky architecture; surfaces
subtly textured (enough to say "wood/stone/metal", never busy); foliage and props as flat
painted cards in 3D space; soft real lighting with cast shadows; theatrical floating-stage
framing. Genesis renders ITS art (the pixel-sprite corpus, the realm palettes, PS1 grit on
the WORLD only) through Wildermyth's machine.

**VERDICT-SEAT NOTE (2026-07-10 night):** Adam delegated the remaining taste calls to
Fable. Laws 2/2b below are now RULED (perspective ~20° ON · dither+snap OFF world);
the VP0 study card is a confirmation gate read by Fable, escalating to Adam only on
contradiction. §G is closed below.

## Why this fits (what today already proved)

The 2026-07-10 dungeon-graph build converged on this grammar independently:

| Wildermyth technique | Genesis state |
|---|---|
| flat character cutouts, camera-tilted, real shadows | ✅ BUILT — standee billboards (camera-pitch tilt, zero PSX distortion, alpha-tested shadow casting) |
| blocky 3D architecture with real volume | ✅ BUILT — InstancedMesh prism tile kits (walls/floors/pillars/doorframes, 1 draw call per kind) |
| scene light sources + shadow maps | ✅ BUILT — per-room torches/lamps, capped shadow casters, interiors only |
| stage/diorama framing | ✅ BUILT — focus-room camera fit + cutaway walls; the standing table IS a floating stage |
| deterministic set dressing | ✅ pattern exists (seeded per-room lights; extend to props/foliage) |
| subtle painted surface texture | ⬜ GAP 1 |
| foliage/prop cards | ⬜ GAP 2 |
| soft global light rig + per-scene grading | ⬜ GAP 3 |
| ground/terrain treatment + stage skirt | ⬜ GAP 4 |

## The recipe (technical laws, per Wildermyth's construction)

1. **CUTOUT LAW.** Characters are always flat art in 3D space — never 3D-modeled figures.
   Billboards face the camera (yaw + elevation tilt), cast alpha-tested shadows, receive
   none. No shader effects touch character pixels (SPRITE PURITY, ruled today).
2. **BLOCK LAW.** Architecture is clean prism volumes — few faces, sharp silhouettes.
   Detail lives in the TEXTURE, not the mesh. **PS1 RETIRED GAME-WIDE (Adam 2026-07-10
   night, superseding the earlier channel-scoped amendment):** no low-res framebuffer
   (PSX_RES_SCALE squeeze — the "mode 7 crust" root cause), no dither, no vertex snap,
   on ANY channel including the flat tabletop. `psxEnabled` default OFF (dev toggle
   survives for comparison; machinery deletion rides UW3 cleanup). What survives is no
   longer PS1: palette discipline (realm-palette law), poly discipline (this block law),
   nearest-MAG sprite crispness (minFilter Linear kills the shimmer). → BW2-0.
2b. **CAMERA LAW (Adam 2026-07-10 night, pending VP0 pixels).** Gentle PERSPECTIVE
   (~20° FOV) replaces orthographic on the diorama — parallel lines converging is the
   cheapest depth there is. Standee tilt math carries over.
2c. **FRAMING LAW (Adam 2026-07-10 night).** True scale is honest; the CAMERA composes.
   During combat beats the camera fits the ACTION CLUSTER (participants + 1 cell
   margin), not the room — Wildermyth frames actors, not architecture. Exploration
   beats may frame the room.
2d. **VALUE LAW (Adam 2026-07-10 night).** Hue is identity, value is composition:
   every scene owns a dark, a mid, and ONE bright; palette richness lives inside that
   hierarchy. (The palette law's missing half.)
3. **SUBTLE-TEXTURE LAW (gap 1).** Every block face carries a low-contrast material
   texture — enough to read wood grain / stone course / brushed metal at glance distance,
   never noisy, never photographic. Implementation: procedural CanvasTextures generated
   at boot per realm kit (the threejs-procedural-dungeon pattern), nearest-filtered,
   one texel density across a kit. Realm kits extend from {floorColor, wallColor} to
   {material: stone|wood|metal|flesh…, grain intensity, accent trim}.
4. **CARD LAW (gap 2).** Foliage, clutter, and small props are flat painted cards
   (single quads or cross-pairs), alpha-cut, shadow-casting, seeded per room role —
   the sprite pipeline can GENERATE these (a "props+foliage" sheet family: mushrooms,
   roots, rubble, banners, moss hangs — per realm). Big props stay 3D prisms.
5. **STAGE LAW.** Every scene floats — diorama edges visible, skirt faces darkened
   (gap 4: bevel/skirt treatment on the board edge so the floating slab reads finished),
   void-tinted backdrop per realm.
6. **LIGHT RIG LAW (gap 3).** One soft key (hemisphere or low-intensity directional,
   subtle warm/cool split) + scene sources (torches/lamps, the real shadow casters) +
   per-realm color grade (fog tint kept at a whisper). No baked AO by default — real
   shadows carry contact darkness (today's finding); the parameterized baseAO knob stays
   available for bright rooms.
7. **DETERMINISM LAW.** All dressing (texture variation, card placement, light positions)
   seeds from the walk/place id — same room forever renders the same.

## Build units (PROVISIONAL — await Adam's red-pen; each Sonnet-executable)

- **GR1 — material textures.** Procedural per-realm CanvasTextures (stone/wood/metal
  grain, low contrast) for the interior kits; texel-density discipline; screenshot gate.
- **GR2 — props+foliage cards.** Card-mesh channel (quad/cross, alpha, shadows) + seeded
  per-room placement by room role; art from a new sprite-sheet family (codex packet:
  "dressing" sheets per realm — flat icon law does NOT apply; these are eye-level cards).
- **GR3 — light rig + grade.** Hemisphere key + per-realm grade values in the kits;
  tabletop parity pass (the flat standing table adopts the same rig so both channels match).
- **GR4 — stage skirt + edge trim.** Board-edge bevel/skirt treatment, void backdrop tint.
- **GR5 — Wildermyth parity card.** One capture: a fantasy forest-edge room + a gloom
  crypt, all laws on, judged against the analog's *construction* (not its art).

## Sources of truth

- Today's render laws: docs/DUNGEON-GRAPH.md (§Laws, U3) — this spec extends, never
  contradicts; TRUE-SCALE and VOLUMETRIC WALL laws stand.
- Sprite side: docs/SPRITE-GEN-V2.md + SPRITE-TAGS.md (corpus feeds the cutouts; the
  dressing-card family will need its own §8-style manifest law).
- The study rig (dev/battle-gate/capture-interior-study.mjs) is the standing screenshot
  gate for every GR unit.

---

# PART II — THE MARRIAGE (2026-07-10 late: research-grounded; Adam's four rulings folded)

Research digests: `scratchpad wildermyth-research/{engine,modding}-digest.md` (sourced;
key facts recorded here so the spec survives the scratchpad). Confirmed: custom Java
engine, OpenGL, explicitly "2.5D" — flat painted art moving through a 3D board/camera/
lighting space; characters = depth-ordered PNG layers; combat maps assembled by a
tag-driven MissionBuilder over a scenery kit (primary tag: focalPoint/floor/lamp/
barricade/setPiece × biome × interior/exterior × station); effects = named animation
scripts referenced from ability JSON; transformations = aspect-gated layer swaps.

**The mapping that makes this cheap:** their MissionBuilder ↔ our place-gen (engine owns
the nouns; tags are the shared language). Their animation-script registry ↔ our
`theater-verbs.js` (`THEATER_VERBS`/`playVerb`/`tickTweens` — already data-driven).
Their aspect-gated layer swaps ↔ our GUISE forms. Their scenery JSON+PNG cards ↔ our
sprite pipeline. Genesis = Dwarf Fortress simulation depth + Daggerfall procedural
breadth (Adam: scale/breadth/simulation ONLY — no first-person ambitions) + Wildermyth
presentation, rendering OUR corpus.

## §A STANDEE VERBS (Adam ruling: verbs now, puppets later)

Data-driven whole-standee tweens bound to EVENTS, never hardcoded per-creature.
Registry `STANDEE_VERBS` (extends theater-verbs.js conventions): each verb = a named
tween script {phases of translate/rotate/scale/tint/flash on the billboard group}.
v1 verb set:
- `act-attack` — lean-in lunge toward target + snap back
- `act-cast` — rise 0.2 cells + hold + settle (casting glow rides the effects layer)
- `move-step` — hop-slide per cell (the DM's mechanical repositioning uses this too)
- `hit-damage` — shake + white flash + brief red tint; `hit-crit` adds squash-stretch
- `fall-death` — tip-over (rotate to floor plane) + desaturate; corpse stays as a card
- `heal` / `buff` / `debuff` — pulse tints (green/gold/violet whisper)
- `guise-swap` — crossfade texture + scale to the new form (GUISE G3's verb)
Law: verbs manipulate the GROUP transform/tint only — never the sprite pixels
(SPRITE PURITY). Ability/event JSON names its verb (`animationVerb` field at the
contract boundary), mirroring their `specialAnimationEffect` pattern.
**Puppet tier (LATER, spec'd not built):** corpus generation from round 4 onward favors
segmentation-friendly poses (limbs distinct from torso silhouette where natural) so a
future AI-segmentation pass can cut layered puppets without regenerating art.

## §B EFFECT SPRITES (Adam ruling: shared core + realm accents)

New sheet family `effects` (flat cards, animated by verb scripts as 2-4 frame swaps or
transform tweens — no particle engine in v1):
- **Shared core (~3 sheets, neutral style):** impacts (slash arcs, blunt stars, pierce
  glints), magic (cast circles, bolt heads, burst rings), status (blood spatter per the
  tone ruling, smoke puffs, sparks, heal motes, shield shimmer), environmental (dust,
  splash, ember drift).
- **Realm accents (12 small sheets, 6-9 cells each):** the realm's signature energy —
  chrome neon arc-flash, gloom ichor + VHS static tear, cosmic gold constellation
  burst, ash ember gout, bright-kingdom star-pop, noir muzzle flash, etc.
Effects render as camera-facing cards at the standee layer, additive blending allowed
(they are EFFECTS, not characters — purity law doesn't apply), realm accent picked by
the scene's realm, core picked by the event type.

## §C INTERACTIVE OBJECTS (Adam ruling: cards with states)

New sheet family `objects`: flat sprite cards with STATE VARIANTS, Wildermyth-style.
- v1 archetype set: door (shut/ajar/open/broken), chest (closed/open/looted), lever
  (left/right), shrine (dormant/lit), campfire (unlit/lit/dead), trap (hidden/sprung),
  portal (sealed/active), container-misc (barrel/crate intact/broken).
- Per realm SKIN: the archetype × realm look (chrome blast-door vs gloom crypt door).
  Shared manifest law: `slug, archetype, state, realm, aspects[]` — aspects =
  interactability (openable, lootable, triggerable), mirroring their Aspects field.
- States are TEXTURE SWAPS on one card (same footprint, same binding) — the door
  doesn't move, it becomes its next state. MIMIC HOOK: a mimic is an object card whose
  entity has a GUISE creature form (docs/GUISE.md object-guiser class, now mechanized).
- Architecture stays prism (walls, doorFRAMES); the door LEAF in the frame is a card.

## §D DRESSING SYSTEM (foliage + clutter; the MissionBuilder marriage)

New sheet family `dressing` (flat cards; some cross-pair for volume — foliage law):
- **Per realm roster (~2 sheets each: `flora` + `clutter`):** realm-true foliage
  (fantasy: oak/fern/ivy/mushroom ring; lost-world: fronds/cycads; ash: burnt snags/
  fungal blooms; chrome: planters/cable-vines/holo-ads; gloom: dead hedges/cattails/
  gravestones…) + clutter (rubble, bones, crates, banners, moss hangs, puddles).
- **Tag schema (the shared language, theirs → ours):** every dressing card carries
  `{ primary: focal|floor|wall-hang|light|blocker|setPiece, biome: <realm terrain
  words>, location: interior|exterior, station: forge|library|shrine|camp|market|… }`.
- **THE ROLL (engine owns the nouns):** place-gen/walk-gen emit a seeded dressing pass
  per room/segment: room role + realm + env + station tables pick counts and tags
  (pockets get focal pieces, paths get blockers/rubble, finale rooms get setPieces,
  light-tagged cards co-locate with the light sources U3 already seeds). Deterministic
  from the walk/place id (law 7). DM never rolls dressing; the DM may only NAME what
  the engine placed (nouns law).
- Density by role: entrance sparse → pocket dense → finale staged. Interior renderer
  mounts dressing as shadow-casting cards (GR2's channel).

## §E TEXTURE-PER-REALM (GR1 refined)

Realm material registry `REALM_MATERIALS`: per realm × surface kind (floor/wall/trim)
→ {material: stone-course|plank|slab|metal-panel|flesh|ice|…, grain: subtle intensity,
palette anchors}. Procedural CanvasTextures at boot (seeded, nearest-filtered, one
texel density per kit) — low contrast ALWAYS (the subtle-texture law): readable as
material at glance distance, never busy under sprites.

## §F SPRITE-GEN QUEUE ADDITIONS (the ask: spec'd into the queue)

New generation wave **DRESSING-GEN** (after round 3; rosters below are the red-pen
surface — prompts generate mechanically per SPRITE-GEN-V2 §10 once Adam approves):
1. `flora` ×12 realms (16-24 cards each; eye-level cards, magenta key, NO floor plane,
   flat-icon law does NOT apply)
2. `clutter` ×12 realms (12-16 cards each)
3. `objects` ×12 realms (8 archetypes × avg 3 states ≈ 24 cells each)
4. `effects-core` ×3 shared sheets + `effects-accent` ×12 mini-sheets
5. Every sheet under the standing laws: manifest-first (§8), expressive where alive,
   no-blank-slots alts, additive fold, chroma per §7.
Estimated total: ~51 sheets / ~900 cells — the next big codex campaign after round 3.

## §G — RULED (Fable, delegated verdict seat, 2026-07-10 night; Adam may overrule)

1. **Corpse persistence: FOREVER.** The death card stays tipped on the floor — Adam
   already ruled exactly this for the tabletop ("corpses default-persist, no
   resurrection", TABLETOP-VISION 2026-07-07); the diorama inherits it. Bounded by
   encounter size, so no growth problem. A room that remembers its dead is the thesis.
2. **Weather: DEFERRED to UW1, seam named now.** Exterior atmosphere = the VP6 mote
   channel extended (rain/snow/ash-fall/ember variants as realm-keyed drifting cards)
   + a realm-sky grade — spec'd in UNIFICATION-WAVE UW1 §3b. No new system.
3. **Blood: FULL GRIM applies to visuals.** One tone register across prose and pixels
   (graphic death is a feature — the standing craft ruling). The children carve-out is
   MECHANICAL, not interpretive: child-tagged entities never receive blood decals or
   spatter; impact/dust effects only. Wired into BEAUTY-WAVE VP6 §4.
