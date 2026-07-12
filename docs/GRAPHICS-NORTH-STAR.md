# GRAPHICS-NORTH-STAR — the A→B graphics program (adopting the Codex directive)

type: system-spec
status: SPECCED (Opus 4.8, 2026-07-11 — adopts `ui-sketches/mock-frames/vq-battle-scenes/
CLAUDE-IMPLEMENTATION-HANDOFF.md` (Codex's directive, delivered with the 20 VQ frames) as the
graphics north star, and maps it onto Genesis's build pipeline: modules, units, gates, sequence,
and reconciliation with the specs already in flight. The directive is the source of truth for the
*what*; this doc is the *how it lands in Genesis*.)

Read with: the directive (above), the 20 frames in that folder, `GRAPHICS-ENGINE.md`,
`BEAUTY-WAVE-5.md`, `DIEGETIC-LIGHT.md`, `LIGHT-SIGHT-POLISH.md`, `TABLETOP-VISION.md`.

## Walk-native amendment (2026-07-12)

The **walk is the content spine**. The graphics program is not a second scene generator and may not
supplant the book-derived spark-table method. A canonical scene begins as:

`walk setup + active segment + pn.segments overlay + live combat/codex state`.

`pn.spatial`, the room shell, the tray, and `ShotPlan` are successively more visual projections of
that record. They may position, frame, light, occlude, and choose a construction class for nouns the
walk licensed. They may not roll replacement content, reject an incongruous roll, or silently rewrite a
field. "Sparse" means selective **visual objectification**: an unrendered rolled field remains canonical
on the segment and may enter a walk-backed **staging reserve** for later narration or projection. The
reserve is an index over source fields, not a second source of truth and not a discard pile.

Detailed contract and current dungeon/urban/wilderness field map:
`ui-sketches/mock-frames/vq-battle-scenes/WALK-NATIVE-DIORAMA-CONTRACT.md`.

## The diagnosis (why the current battle view reads as a 1990s map)
Not polygon count. Per the directive §2: (1) rooms are **cell-prisms** — a rasterized plan rendered
as unit boxes, so the square-cell origin always shows; (2) the camera **fits geometry, not a
dramatic subject**; (3) rich rolls (shape, tiers, interactable state, material, condition) **collapse
to rectangles/prose**, so scenes share a silhouette; (4) sprites are judged **as PNG assets, not as
lit rendered citizens**; (5) **lighting carries too many jobs** (exposure + readability + bright
realms + torch pools) and oscillates crushed↔flat; (6) post is **screen heuristics** (screen-Y DoF,
luminance bloom) with no depth. The VQ target frames (see `04-gloom-dungeon`, `12-gloom-octagon`) are
photographed miniature dioramas: one contained architectural shell in darkness, one action cluster,
one candle/practical as the sole value peak, flat standees on physical plinths, sparse curation.

**The fix is stage construction + shot direction, not more props/contrast/bloom/ambient.** Those
moves make the failure mode more elaborate (directive §0, §10).

## The spine: `ShotPlan` (the highest-leverage addition)
A deterministic pure-data **view description** the renderer consumes — never new world state
(directive §3). `shotPlanFrom(tray, combat, viewState)` is pure except for ephemeral player
orbit/zoom. It carries: `stage` (polygon, floorLevels, wallSegments, apertures, skirt, openEdges),
`anchors` (player, primaryThreat, objective, focalLight, actionCenter), `pieces/props/interactables/
overlays/traces`, `lightRig`, `camera` (mode beat|room|boss, yaw/pitch/fov/target/distance,
sharpSubjects), `occlusionTargets`, `postProfile`, and `provenance` (every staged noun mapped to the
state/roll/codex/combat/trace that licensed it). This makes the camera, visual projection, lighting,
occlusion, and TESTS all agree about what the frame is *about*. **New module `src/ui/theater-shot.js`.**

## Reconciliation with the specs already in flight (important — some get re-scoped)
- **BW5 (THE SECOND INTEGRATION PASS)** — one-room render, everything-volumetric (EXTRUDE/FACED-BOX/
  MODEL), roll-as-palette, broad state primitive: **not superseded — it IS Stages C+D of this
  program.** The directive refines it with the ShotPlan spine + the room-shell compiler. Keep BW5's
  construction-class taxonomy verbatim.
- **DIEGETIC-LIGHT + LIGHT-SIGHT-POLISH** (landed: cone-kill, diegetic shadows, per-realm fill,
  emitter nubs, occlusion ankle+ghost, mote soft-dots): **down payments on Stage E's LightRig.** The
  directive's §4.7 endorses exactly what we did (every PointLight needs visible emitter geometry;
  never a floating glow disc) and tells us where to take it next: a declarative `LIGHT_RIG_PROFILES`
  registry consumed by the shot planner, with one dominant practical owning the brightest 5%.
- **Task #16 (suburb glow-disc suppression)** — KEEP, do it now: it directly implements §4.7's "never
  leave a floating glow disc as the source" and "one source owns the brightest 5%." It's a Stage-A-
  adjacent quick win (a bright realm's daylight has no torch orbs). Fold its numbers toward
  `LIGHT_RIG_PROFILES` rather than more `theater-boot.js` constants.
- **Task #14 (MI-1 per-realm normal maps on Lambert)** — **RE-SCOPE, do NOT build as specced.** The
  directive §4.8 wants `MeshStandardMaterial` shells with generated **normal + roughness** maps and
  semantic metalness — a Lambert `normalMap` is a partial that we'd redo. MI-1 folds into **Stage E's
  material contract.** Mark `docs/MATERIAL-IDENTITY.md` superseded-by-this for the shell surfaces.
- **Sprite-extrusion plan (task #9 inventory)** — its wall-hang/flat-prop fold is Stage D dressing;
  its findings feed the standee/prop asset contract (§4.5).

## The program — Stages A→E (directive §7), as Genesis waves
Each stage is a wave of Sonnet-ready units on branches, gated by the frame-tied success gate PLUS the
objective visual gates (§ below). New modules register in `manifest.json`; run check-manifest after
each edit. **Do not hide any of this inside `theater-boot.js` — it already carries too many policy
constants** (directive §9). New data contracts get focused modules.

### STAGE A — stop producing map overviews (the immediate wave; highest leverage) — ✅ BUILT 2026-07-12
> **CLOSED (master `00b775f8`).** A1 one-room-literal + the room-shell compiler (Stage C4, pulled
> forward) landed 2026-07-11; A2 ShotPlan built same day but was DORMANT (no caller). 2026-07-12 the
> walk-native boundary (`walkSceneFrom`, per Codex's amendment) + A3 (wires the ShotPlan, composed
> camera live, WalkScene-fed) + A4 (dynamic occlusion v2) landed — `docs/WALK-NATIVE-A.md`,
> CHANGELOG 2026-07-12. The interior now composes on the action cluster (medium standee 0.208 frame
> height) and occludes dynamically. Next graphics wave = **Stage B (sprite citizenship)**.
1. **A1 one-room-literal** — the ACTIVE room alone owns render geometry; a doorway is a shallow
   darkness portal / corridor throat / glimpse card, never the neighbor room shell. (theater-interior:
   replace the neighbor keep-set with active-room-only render data.)
2. **A2 ShotPlan + composeShot** — new `theater-shot.js`: build `ShotPlan`; a finite candidate camera
   search (4 diagonal yaws + current orbit; pitch 28-38°, FOV 18-24°) scored on the directive's
   `score` formula; hard constraints (7% safe frame, medium 18-25% frame height, ≤15% subject
   overlap, ≥1 stage edge visible, neighbor mesh count 0). Emits candidate scores to capture JSON.
   Reuse `projectWorldPoint` + sprite screen-rect diagnostics + camera-fit — do not rebuild projection.
3. **A3 reframe-around-anchors** — theater-boot consumes the shot camera (weighted cluster: player,
   primary threat, objective, focal light), not `focusRect`.
4. **A4 dynamic occlusion v2** — blockers from `ShotPlan.occlusionTargets` (walls/pillars/tall
   furniture/large foreground props); fade only the blocking segment; upper opacity 0.05-0.10 + solid
   0.12-0.25u stem; tween 120-180ms in / 180-260ms out with hysteresis; keep the small ghost mesh.
   (Supersedes the current flat 0.2 ghost — task #16-adjacent.)
- **Gate:** frames `04` and `11` approximated with current assets read as staged encounters, not maps.

### STAGE B — fix sprite citizenship
B1 complete registry metadata + automated fold gates (the §4.5 standee contract: footX/Y, worldHeight,
contentBounds, alphaCutoff, extrudeDepth, baseRadius, shadowProfile, qaFlags). B2 standee side
thickness (0.015-0.035u), stable beveled plinth, soft contact shadow, explicit standee shader (§4.5/
§4.6: readability separated from ambient, clamped in perceptual luma). B3 in-engine sprite acceptance
gallery (render each asset in the standard test room under the §5.5 light/grade/yaw matrix). B4 remove
runtime size inference + unresolved fallback scaling.
- **Gate:** no square shadows / floating feet / tilted bases / key halos / edge-on invisible cards /
  full-bright dark-corner sprites across the core-three gallery. **(This absorbs Adam's plumb-line +
  base-placement + cooler-bases asks — task #10 — into the standee contract.)**

### STAGE C — compile real room shells
C1 preserve rolled size; C2 structural elevation (dais/pit tiers + darker riser side faces); C3
polygon room shapes + polygon-derived exit slots (octagon/rotunda/L/cross/cave — BW5); C4 the
**room-shell compiler** `src/ui/theater-room-mesh.js`: marching-squares/boundary-trace the active
room contour → simplify collinear (preserve apertures) → triangulate floor per elevation tier → wall
strips from boundary segments (not per-cell boxes) → cut at apertures → bevel exposed edges →
world-aligned UVs → keep a hidden logical cell↔triangle map for placement/hit-test/mutation. Keep
`interiorBuildBoard` as the data producer; the compiler is render-only, behind a diagnostic flag
during migration.
- **Gate:** frames `12` and `19` structurally possible without decorative props.

### STAGE D — make rolled nouns physical and stateful
D1 fold core-three object generation into a state registry (BW5 construction classes MODEL / FACED_BOX
/ EXTRUDE); D2 ship **door→room transition first** (the keystone slice); D3 lever/chest/fire/shrine/
portal/container/trap; D4 extend `theater-verbs.js` for object-state + persistent-trace + terrain-
change visual verbs (§4.10). State comes from game data; animation is a view projection; revisit
rebuilds to the same terminal visual state. Plus the **walk visual-projection pass** (§4.11,
walk-native amendment): a deterministic field-to-visual compiler with room budgets (ordinary 0-3
props, dressed 3-6, boss 2-5 + at most one visually dominant centerpiece). Gameplay citizens
(doors/combatants/objective/hazards/traces) do not consume the decorative budget. Fields over the
visual budget remain on the canonical walk segment and enter the source-referenced staging reserve;
nothing is discarded, rerolled, or made invisible to the DM.
- **Gate:** frames `13`, `15`, `20` rebuild correctly from saved state.

### STAGE E — material and light finish
E1 declarative `LIGHT_RIG_PROFILES` + visible practicals (subsumes DIEGETIC-LIGHT/LIGHT-SIGHT-POLISH +
task #16); one dominant source owns the brightest 5%; ≤1-2 real-time shadow lights; per-light-class
bias/normalBias. E2 PBR terrain/prop materials (`MeshStandardMaterial` shells; generated normal +
roughness from accepted albedo; semantic metalness; vertex/AO perimeter darkening — subsumes/​re-scopes
MI-1). E3 condition decals (sparse projected quads, deterministic) + low fog (volume/particles, not
a blanket). E4 post: one color-management path, depth-aware DoF (from room-shell depth), selective/
emissive-masked bloom, subtle output dither, weak camera-relative vignette.
- **Gate:** the same scene stays legible in fantasy/gloom/chrome while each realm has a distinct
  material/light identity, not only a tint.

## Objective visual gates (directive §8 — executable, not prose)
Every graphics unit emits capture PNGs + metrics JSON; failures become executable gates. Headline
numbers: **Composition** — 0 living-subject pixels outside the 7% safe frame; medium standee 18-25%
frame height; primary-figure overlap <15%; neighbor-room mesh count 0; one dominant bright region.
**Value** — 35-55% of an indoor frame in the dark band; ≤~8% in the highlight band; non-emissive
indoor near-white clipping <0.5%; focal source brighter than every non-source region. **Sprites** — 0
unresolved in core-three fixtures; 0 visible chroma fringe; base normal world-up within epsilon;
foot-to-base gap <2 screen px; no world PSX shader on sprite fronts. **Geometry/state** — no duplicate
noun pieces; no prop in a CLEAR cell/door-swing/figure footprint; no z-fighting; deterministic polygon
+ exits; transitions fire once + rebuild to terminal; traces persist across room swap + reload.
**Performance (measure on Adam's machine + the target browser)** — warm `shotPlanFrom` + room assembly
≤250ms; ≥60fps preferred / ≥30fps hard floor; ≤1-2 real-time shadow lights; draw calls + tris recorded
per capture with budgets from the best current core-three room + headroom. Canvas-pixel checks reject
blank/near-black/blown captures BEFORE a vision model judges taste.

## New modules + touchpoints (directive §9, dependency order)
`theater-data.js` (extend projection for stateful interactables/traces/structural terrain; keep
provenance+determinism) → `theater-interior.js` (emit active-room polygon/elevations/apertures/
materials/decals/anchors; drop neighbor keep-set) → **`theater-room-mesh.js` (NEW)** (compile shell) →
**`theater-shot.js` (NEW)** (ShotPlan + composeShot + light story + metrics) → `theater-boot.js`
(consume shell + shot camera; dynamic occlusion; explicit standee shader/material factory; depth/
emissive post; keep every new subsystem behind a `window.Theater` toggle) → `theater-figures.js`
(resolve full standee metadata; never infer) → `theater-materials.js` (PBR recipes + generated maps)
→ `theater-verbs.js` (object-state/trace/terrain-change verbs) → `build/` fold scripts + `dev/model-qa/`
(the no-human generation+QA loop) → `dev/battle-gate/` (shot-plan, sprite-citizenship, room-shell,
state-rebuild, post-mask galleries).

## Fully-procedural asset loop (directive §5 — no human paint-over)
Manifest-first generation packets (slug/cell/realm/family/size/construction-class/state-variants/
key/dims) → image gen (standee fronts + state variants, prop faces + extrusion silhouettes, tileable
albedo, keyed decals, emitter cards) → mechanical fold (slice/key/defringe/normalize/derive maps/
write registry; never hand-edit) → automated QA (mechanical gates THEN scoped vision review; rejects
requeue with the failed criterion added) → in-engine QA (§5.5 render matrix before registry promotion).
The VQ PNGs are references for the assembler, **never runtime backgrounds** (§5.2, §10).

## The practical north star (directive §11)
`walk setup+segment+overlay+live state → projected active-room tray → polygonal shell + physical citizens → shot plan centered on
the action → one visible light story → stable standees with bases/contact/shadows → restrained depth-
aware finish → automated capture+promotion gates.`

## Decisions / open for Adam (before I orchestrate)
1. **Pace + commitment.** This is graphics-engine-v2 — a multi-wave program (Stages A-E ≈ 25-30
   units + 2 new modules + a PBR/asset-QA pipeline). I recommend committing to **Stage A as the next
   wave** (biggest visual leverage: rooms stop reading as maps) and re-deciding at each stage gate,
   rather than pre-committing all five. Confirm.
2. **The re-scopes:** kill MI-1-as-specced (fold into Stage E PBR); keep task #16 suburb-glow now
   (on-directive). OK?
3. **MeshStandard perf** — Stage E moves shells to `MeshStandardMaterial` + shadow maps; the directive
   says reconsider the engine only if WebGL2 can't meet the ≤250ms / ≥30fps budgets after these
   changes. We measure on your machine at each stage; no engine replacement now.
4. **Finish the current lighting loop first?** — suburb glow-suppression + cosmic are small and land
   this session; Stage A is the next real wave. I'd land those, then open Stage A. Confirm the order.
