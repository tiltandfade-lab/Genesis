# Walk-Native Diorama Contract

type: graphics-system amendment
status: PROPOSED, grounded against the 2026-07-12 tree
audience: Claude/Codex sessions implementing Genesis graphics and walk extensions

## 0. Ruling

Graph-wide dealing, empty-room staging, lore restoration, and the secret observation-chamber worked
example are specified in `docs/WALK-CARD-DEALING.md`. This document governs projection after that
dealer has found homes for the walk's cards.

The walk system is Genesis's content spine. Dioramas do not generate rooms; they reveal the active
walk segment physically.

The canonical order is:

```text
Engine markdown spark tables
  -> compile-tables.py
  -> GENESIS_TABLES
  -> rollUrbanWalk / rollDungeonWalk / rollWildernessWalk
  -> stored walk {setup, skin, topology, segments, edges}
  -> active segment selected by pn.cursor.current
  -> persistent per-segment overlay in pn.segments
  -> optional SpatialPlan projection in pn.spatial
  -> walkSceneFrom(...)
  -> tray / room shell
  -> ShotPlan
  -> Three.js render
```

Every arrow after the stored walk is a projection. None may invent or reroll content.

This preserves the core authoring advantage: a designer can read a D&D book, translate a useful
procedure or spark table into the Engine markdown table format, wire its result into a walk field,
and immediately make it available to narration, mechanics, and graphics without hand-authoring a
level.

## 1. Current Walk Model

### 1.1 Authored source

`Engine/03. _Tables/**/*.md` is editable source. `Engine/00. _System/compile-tables.py` validates and
compiles it to `tables.json`/`tables.js`; runtime reads `GENESIS_TABLES`. Generated table artifacts are
never hand-edited.

The source format already supports the important book-porting properties:

- stable table id in frontmatter
- dice inferred from declared/ranged rows
- multi-column structured cells
- optional spice band and other compiler-recognized tags
- source prose preserved for the DM

### 1.2 Walk assembly

The three environment rollers share a common grammar but retain environment-specific fields:

- `src/engine/walk.js`: urban topology, pacing labels, scene frames, encounters, setup, and segments
- `src/engine/dungeon-walk.js`: dungeon topology, rooms, exits/doors, area, features, encounters,
  secrets, finale, and loot
- `src/engine/wild-walk.js`: wilderness/travel legs, biome, footing, signs, encounters, arrival, and
  loot

The graph is already explicit. `segments[]` are nodes; `exits[]` and `edges[]` are connections;
`depth` is BFS progression where the topology supplies it; `isFinale` marks the terminal beat.

Walk generation uses real random table draws and then persists the result. Therefore:

> Never attempt to recreate a walk from a seed unless that specific roller is explicitly seeded.
> Render from the stored walk snapshot. Determinism begins after minting.

### 1.3 Consumption and persistence

`src/world/prep.js` owns the active walk and cursor:

- `P.activeWalkId`: active walk/node id
- `P.nodes[id].walk`: stored raw walk
- `P.nodes[id].cursor.current`: active segment number
- `P.nodes[id].cursor.touched`: entered segments
- `P.nodes[id].segments`: persistent per-segment overlays keyed by `ref: "S<num>"`
- `P.nodes[id].spatial`: optional dungeon geometry/semantics projection

`walk_advance` moves the cursor. `walk_update` writes the existing overlay. Combat aftermath, room
effect-die state, decals, removed pieces, and future object state belong in that overlay or another
explicit persistent state channel, never in renderer memory alone.

### 1.4 Narration contract

`activeWalkDigest(w)` exposes the walk and identifies the current segment as `here`. The DM honors
the rolls and may reskin by overlay, but does not rewrite them. Graphics must obey the same contract:
the sighted player cannot see a noun the digest cannot support, and the graphics layer cannot erase
a rolled fact merely because it does not instantiate it as geometry.

## 2. Canonical Scene Input

Add a pure adapter before `trayFrom`/`ShotPlan`:

```js
walkSceneFrom({
  walkId,
  walk,          // stored raw walk
  segment,       // exact raw segment at cursor.current
  overlay,       // matching pn.segments entry, or null
  spatialRoom,   // matching pn.spatial.rooms entry, or null
  live: {
    combat,
    codex,
    cast,
    discoveredSecrets,
    inventory,
    viewState
  }
})
```

Suggested output:

```js
{
  walkRef: { id: walkId, environment: walk.environment, topology: walk.topology },
  segmentRef: { id: segment.id, num: segment.num, label: segment.label },
  register: {
    setup: walk.setup,
    skin: walk.skin,
    spiceTier: walk.spiceTier,
    posture: walk.posture || null,
    depth: segment.depth ?? null,
    isFinale: !!segment.isFinale
  },
  structure: [],
  connections: [],
  surfaces: [],
  practicals: [],
  citizens: [],
  interactables: [],
  dressing: [],
  conditions: [],
  atmosphere: [],
  hidden: [],
  traces: [],
  removals: [],
  fieldRefs: []
}
```

`walkSceneFrom` does not choose coordinates, meshes, camera, or shaders. It classifies existing facts
into visual roles while preserving their exact source paths. It is the anti-drift boundary between a
book-derived walk record and the graphics engine.

## 3. Field Provenance

Every projected citizen carries a field reference:

```js
{
  sourceRef: {
    walkId: "frontier:node-7",
    segmentNum: 3,
    fieldPath: "dressing.text",
    tableId: "dungeon-set-dressing", // when known
    roll: 42,                        // when known
    overlayRef: null
  }
}
```

Current `walkPick(...)` returns only cell values, so most raw segment fields lose table id/roll
provenance after minting. The visuals can initially use `{walkId,segmentNum,fieldPath}`. The best
long-term walk-system improvement is an additive stamped-roll helper:

```js
walkPickStamped(tableId, ...columns)
// -> { values: [...], source: { tableId, total, band } }
```

Rollers can then add a compact sibling map without changing their existing public field shapes:

```js
segment.rollRefs = {
  area: { tableId: "dungeon-area-type", total: 99 },
  feature: { tableId: "dungeon-feature", total: 14 },
  dressing: { tableId: "dungeon-set-dressing", total: 42 }
};
```

This is strongly recommended because it preserves the book/table origin of a visual fact, makes
regression fixtures exact, and lets future visual bindings route by table id instead of brittle prose
keywords. It is additive and can be introduced first for graphics-critical fields.

## 4. Visual Role Taxonomy

Every walk field resolves to one of these roles:

| role | meaning | examples | render law |
|---|---|---|---|
| `structure` | room/terrain geometry | area type, dims, side feature, footing | shell compiler may interpret; never replace noun |
| `connection` | graph edge representation | exit, door type/state, transition | one edge -> one aperture/portal/route marker |
| `surface` | base material/skin | biome, environment skin, architecture material | material registry/fallback |
| `practical` | visible light source | torch, lamp, fire, beacon, daylight aperture | visible emitter and matching light |
| `citizen` | creature/NPC/item with identity | encounter creature, contacted NPC, revealed loot | figure/object with state provenance |
| `interactable` | actionable fixture/object | lever, chest, shrine, trap | construction class + state |
| `dressing` | visible nonessential noun | crate, banner, willow, rubble | subject to visual budget, never deleted from canon |
| `condition` | overlay/modifier | wet, rusted, scorched, mossy | decal/material/transform, not a replacement noun |
| `atmosphere` | prose/sound/odor/air | sensory, atmo | prose-only unless a separate explicit visible field licenses an effect |
| `hidden` | unrevealed fact | secret, hidden trap, concealed loot | no mesh until reveal state permits it |
| `trace` | earned persistent consequence | corpse, blood, breach, dropped item | overlay-derived and persistent |
| `direction` | shot/arrangement hint | scene frame, tactical setup, posture | camera/placement guidance only |

Unknown fields default to prose-only. A missing visual binding never blocks play and never causes a
fresh graphics roll.

## 5. Dungeon Field Map

Source: `rollDungeonWalk` in `src/engine/dungeon-walk.js`.

| walk/segment field | visual role | intended projection |
|---|---|---|
| `walk.topology` | direction/graph | room connectivity and pacing; never cosmetic geometry alone |
| `walk.setup.type` | surface/register | architecture family/material vocabulary |
| `walk.setup.skin`, `skinVisual` | surface/register | realm-neutral base styling before breach realm grade |
| `walk.setup.motif*` | surface/dressing register | motif binding for generated assets; no new nouns |
| `walk.skin` | register | active realm/breach lens and grants |
| `segment.areaType` | structure | polygon archetype: rect/rotunda/octagon/L/cross/cave/etc. |
| `segment.dims` | structure | mechanical/render footprint scale |
| `segment.side` | structure/dressing | structural terrain or side-area; parse explicitly, preserve prose |
| `segment.exits[]` | connection | graph edges and aperture slots |
| `exit.door.type/state` | connection/interactable | aperture silhouette plus door state |
| `segment.scene` | direction | room arrangement/shot register |
| `lighting`, `lightFlavor`, `light` | practical | visible source type, color/falloff profile, exposure hint |
| `sensory` | atmosphere | prose-only by default |
| `atmo` | atmosphere | always prose-only; never spawn geometry from keywords |
| `object` | interactable | actionable object candidate; retain name/flavor |
| `feature` | structure/dressing | strongest centerpiece/structural candidate; dims can affect footprint |
| `dressing.text` | dressing | one licensed prop/assembly/trace-like noun |
| `dressing.condition` | condition | material/decal/state modifier applied to licensed surface/object |
| `secret` | hidden | stage only after the reveal condition/event |
| `encounter` | citizen/direction | figures, hazards, problems, tactical terrain |
| `finale` | citizen/direction | boss/objective/exit state and boss shot mode |
| `loot` | hidden/citizen | stage only when located/revealed; does not appear merely because budget exists |
| overlay `traces/removed/decals` | trace | persistent room aftermath |

Important: the current spatializer randomizes rectangles from the graph and therefore discards
`areaType/dims/side`. The room-shape work should consume those exact fields. Do not introduce a
parallel shape table in graphics.

## 6. Urban Field Map

Source: `rollUrbanWalk` in `src/engine/walk.js`.

| walk/segment field | visual role | intended projection |
|---|---|---|
| `walk.topology/posture` | direction/graph | pacing and shot arrangement, not literal floor shape |
| `walk.setup.type/atmosphere/origin` | register | architectural/social context |
| `walk.setup.skin/skinVisual` | surface | district/street material family |
| `walk.setup.motif*` | surface/dressing register | generated asset family |
| `walk.setup.distortion*` | structure/direction | only visible where the rolled distortion explicitly implies it |
| `segment.segType` | structure | street/open/threshold/vertical fabric archetype |
| `segment.description` | structure/direction | authored spatial description; parse through bindings, not generic keyword spam |
| `segment.transition` | connection | street mouth, threshold, stair, passage, or scene transition |
| `segment.exits[]` | connection | graph continuity |
| `sceneFrame.frame/dims/tactical` | structure/direction | tray dimensions, lanes, tactical composition |
| `light` | practical | visible local source or sky profile |
| `dressing` | dressing+condition | sparse street/shopfront props and overlays |
| `interactable` | interactable | use urban tags (`tag/tag2/signal/visibility/tone`) for placement and reveal |
| `backgroundEvent` | direction/citizen | stage only its explicitly licensed visible participants/effects |
| `encounter` | citizen/direction | cast and tactical state |
| `atmo` | atmosphere | prose-only |
| `loot` | hidden/citizen | reveal-gated stash/lockbox/strongbox |
| `finale` | citizen/direction | finale track controls boss/social/discovery framing |

Urban graphics should not force every segment into a dungeon-room polygon. An urban segment can be a
street slice, threshold, open square, shopfront, vertical landing, or abstract social stage while
remaining the same walk node contract.

## 7. Wilderness and Travel Field Map

Source: `rollWildernessWalk` in `src/engine/wild-walk.js`.

| walk/segment field | visual role | intended projection |
|---|---|---|
| `walk.kind` | direction | frontier vs travel presentation; both remain walks |
| `walk.setup.biome`, `segment.biome` | surface/structure | mat, terrain kit, scatter family, sky profile |
| `segment.feature` | structure/dressing | primary landmark/centerpiece candidate |
| `signOfPassage` | dressing/direction | tracks, spoor, marker, warning trace; especially encounter telegraph |
| `footing` | structure/surface | passability and ground treatment |
| `dressing` | dressing+condition | sparse vegetation/debris/objectification |
| `survival` | direction/structure | only stage a physical constraint explicitly named by the roll |
| `interactable` | interactable | actionable wilderness object |
| `regionEncounter` | citizen/direction | visible only when its field describes a present thing/event |
| `activeMagic` | practical/condition/direction | explicit visible magical effect; no generic fantasy particles otherwise |
| `artFind` | hidden/citizen | reveal-gated art/object |
| `encounter` | citizen/direction | cast and threat telegraph |
| `light` | practical/sky | sun/moon/weather/local source |
| `sensory`, `atmo` | atmosphere | prose-only by default |
| arrival `areaType/dims/side` | structure | destination shell/mat shape and structural terrain |
| `exits[]` | connection | next leg/arrival route direction |
| `loot` | hidden/citizen | reveal-gated cache/remains/grave-goods |

Wilderness does not need dungeon rims/walls. Its containment comes from the open mat, foreground
scatter, light pool, negative space, and camera crop. The active leg is still one walk segment.

## 8. Selective Visual Objectification

The diorama should be sparse without weakening the walk.

### 8.1 Required projection order

1. Active segment structure and connections.
2. Living cast and mechanically active hazards/interactables.
3. Revealed objective/secret/loot.
4. Persistent traces and removals.
5. Dominant rolled feature.
6. Rolled dressing and condition within the visual budget.
7. Pure atmosphere remains prose-only.

### 8.2 Budget semantics

A budget limits simultaneous geometry, not canon:

```js
visualBudget = {
  dominantFeature: 1,
  dressingAssemblies: ordinary ? 2 : dressed ? 4 : 3,
  conditionOverlays: ordinary ? 1 : 3,
  shadowLights: 2
};
```

If `feature`, `object`, `dressing`, and `encounter` all carry visible nouns, mandatory/mechanical
citizens stage first. Lower-priority fields enter the segment's staging reserve. They can become
visible later if the camera changes, the player interacts with them, or a higher-priority citizen
leaves, but their underlying fields never change.

### 8.3 Walk-backed staging reserve

The walk intentionally rolls more material than every tray can objectify at once. Preserve that
tabletop virtue with a derived, persistent presentation index:

```js
segmentProjection = {
  sourceVersion: 1,
  stageNow: ["S3.encounter", "S3.hazard", "S3.feature"],
  narrateNow: ["S3.atmo", "S3.dressing"],
  reserve: [
    {
      sourceRef: "S3.activeMagic",
      status: "deferred",
      reason: "visual-density",
      presentation: "effect-overlay",
      promotion: ["interaction", "hazard-cleared", "camera-reframe"]
    }
  ]
};
```

This is a cache of **presentation decisions**, never a cache of copied or rewritten content. Values
are resolved through `sourceRef` from the stored walk and overlay. Rebuilding the projection may
change its lanes while preserving those references. The DM digest receives `narrateNow` plus a small,
priority-ranked reserve slice; it does not receive an unbounded lore dump.

The lanes have distinct jobs:

1. `stageNow`: mechanically active citizens and the visual facts needed to read the encounter.
2. `narrateNow`: sensory anchors the DM should use in the current beat, whether or not they have meshes.
3. `reserve`: canonical material held for slow-drip narration, later interaction, reframing, or promotion.
4. Hidden/unrevealed: a separate reveal gate, never merely an overflow lane.

The DM may connect reserve facts, compress their representation, or promote one into scene focus.
Any persistent invention added while connecting them follows DM Charter section 8.5 and must be
captured through the normal event/Ledger circuitry. Promotion does not require codex creation unless
the fact independently meets codex doctrine.

### 8.4 Overloaded-tray response ladder

When the canonical room contains a large cast, centerpiece, active magic, cover, and a hazard, use
this order instead of dropping narrative material:

1. Preserve every mechanically active fact: cast, hazard, exits, objective, and tactically relevant cover.
2. Compress repeated nouns into assemblies: a crate field is one cover assembly; an NPC group may use
   representative standees plus an engine-readable group footprint/count.
3. Scale visual proxies within authored readability and tactical-footprint limits; never shrink away
   mechanical reach, cover, blocking, or hazard area.
4. Recompose camera and occlusion, then expand the tray within device/performance bounds when density
   still prevents a truthful read.
5. Move only non-immediate presentation into `narrateNow` or `reserve`. The DM still owns the complete
   narrative scene and may surface reserved facts through the slow drip.

### 8.5 No coherence veto

Do not reject “a shrine in a kitchen,” “a jungle plant in a crypt,” or a displaced monster at the
graphics boundary. The walk/realm/region systems either licensed that juxtaposition deliberately or
exposed a table-authoring bug. Render the licensed fact where possible; otherwise preserve it in prose
and report missing visual coverage. Rerolling would destroy the emergent spark-table result.

## 9. Placement Grammar

Placement is deterministic interpretation of rolled nouns, not new content generation.

```text
field role + tags + room structure + tactical exclusions
  -> placement primitive
  -> coordinate/socket
```

Examples:

- door field -> bind to its existing graph-edge aperture
- lever tagged wall/objective -> wall socket away from door swing
- shrine + dais side feature -> focal socket on dais
- dressing “crate stack” -> cover-compatible wall-adjacent floor socket
- sign of passage “tracks” -> route-aligned overlay from entrance toward encounter
- campfire practical -> floor source socket and matching PointLight

Placement may select among valid sockets with a stable hash of
`walkId + segment.num + fieldPath + slug`. It must not call `Math.random()` at render time.

If no valid socket exists, keep the fact prose-only and emit a diagnostic. Never overlap a figure,
block every path, or fabricate a different prop as compensation.

## 10. ShotPlan Amendment

`ShotPlan` should consume `WalkScene`, not raw unrelated tray fields. Add:

```js
{
  walkRef,
  segmentRef,
  fieldRefs,
  register,
  // existing stage/anchors/pieces/... fields follow
}
```

Shot mode derives from the walk:

- `boss`: `segment.isFinale` with combat/boss track
- `beat`: active Enemy/Hazard/Problem or live combat
- `room`: Empty/Discovery/Lore/exploration
- `social`: Social/Commerce or urban faction scene
- `travel`: wilderness leg without active combat

This affects framing only. It never changes encounter type, room contents, or topology.

Walk topology and labels can inform composition:

- `Opening/Departure/Arrival`: show the connection and orientation
- `Hub`: emphasize exits and social/circulation space
- `Threshold/Approach/Narrowing`: emphasize connection/choke geometry
- `Finale/Core/Sanctum`: objective/boss framing
- `depth`: available for progression metrics; do not darken/escalate automatically unless another
  rolled field licenses the change

## 11. Optional Table Metadata for Book-Portability

To make a newly imported book table visually useful without editing several render modules, extend
table frontmatter with optional metadata:

```yaml
visual_role: dressing
visual_priority: optional
visual_binding: prop-noun
placement: wall-adjacent
reveal: immediate
```

Suggested values:

- `visual_role`: taxonomy from section 4
- `visual_priority`: `required | focal | optional | prose-only | hidden`
- `visual_binding`: stable adapter key, not a mesh filename
- `placement`: socket grammar key
- `reveal`: `immediate | contact | discovered | event`

Compiler evolution:

1. Preserve these optional fields in table metadata.
2. Do not add them to row narration text.
3. Unknown metadata remains inert.
4. Existing tables remain byte-compatible.

This is preferable to a giant renderer keyword scan. The table author says what kind of fact the
table produces; the registry says how that class of fact can become a visual.

## 12. Adding a New D&D-Derived System

The desired authoring workflow is:

1. Identify the book procedure: what is rolled, at what cadence, and what each column means.
2. Port/adapt it into one or more Engine markdown tables with stable ids and structured columns.
3. Compile and validate table coverage.
4. Add one explicit walk roll at the correct cadence:
   - walk setup: once per whole adventure/location
   - segment: once per node/room/leg
   - exit: once per graph edge
   - encounter: when the segment is minted
   - reveal/effect: persistent overlay when resolved
5. Store the result on the raw walk/segment. Do not send it directly to graphics.
6. Add or reuse a visual-role binding. If none exists, the field is immediately available to the DM
   in prose and gains visuals later without changing the table.
7. Add a fixture proving raw roll -> stored field -> digest -> optional visual projection.

This keeps the book legible in the implementation. A developer should be able to point from a scene
fact back to a table row and say, “this is where that came from.”

## 13. Recommended Engine Units

### WDV-1: `walkSceneFrom`

Pure adapter with common envelope and environment-specific bindings. No Three.js, no DOM, no RNG.
Tests use real rolled dungeon/urban/wilderness walks and assert every projected noun has a fieldRef.

### WDV-2: stamped roll provenance

Add `walkPickStamped` and `segment.rollRefs` for graphics-critical tables first: area, feature,
dressing, condition, interactable, light, door, scene frame. Preserve existing field shapes.

### WDV-3: table visual metadata

Extend compiler/runtime metadata and replace keyword-only routing gradually. Existing binding registry
wins where explicit; metadata next; conservative prose-only fallback last.

### WDV-4: overlay/state unification

Define the allowed persistent visual overlay keys (`effectDie`, `rolledFace`, `traces`, `removed`,
`decals`, `entityStates`, `terrainMods`) and keep `walkUpdateSegment` as the mutation boundary.

### WDV-5: cross-environment diorama gate

For a real roll from each walker, capture:

- raw walk JSON hash
- active segment and overlay
- WalkScene classification
- tray/ShotPlan provenance report
- final frame

Changing camera or asset availability must not change the raw walk hash.

## 14. Acceptance Gates

1. Raw walk immutability: visual build does not mutate `walk` or `segment`.
2. No render RNG: same stored snapshot + view state -> byte-identical WalkScene/tray/ShotPlan.
3. Provenance completeness: every visible noun resolves to a field, overlay, combat unit, or codex
   record digest-visible this turn.
4. Hidden gating: unrevealed secret/loot/trap yields no visible noun.
5. Atmo isolation: air/odor/sound keywords spawn zero geometry.
6. Graph fidelity: one `exit` edge maps to one connection citizen; no invented neighboring room.
7. Overlay persistence: traces/state survive room swap, revisit, and reload.
8. Budget non-destruction: reducing visual budget changes only projected citizens and presentation
   lanes, never raw segment fields or provenance; reserved facts remain available to the scoped digest.
9. Fallback honesty: missing asset yields a generic representation or prose-only diagnostic, never a
   replacement noun.
10. Book-port test: a new tagged table can reach WalkScene through one roller field and one reusable
    binding without editing `theater-boot.js`.

## 15. Consequence for the VQ Frames

The twenty VQ frames remain valid visual targets. Their content should be read as examples of how
walk fields can converge:

- octagon: `areaType/dims/side`
- lit shrine or lever: `object/interactable + lighting`
- wet chrome room: `surface + dressing.condition + light`
- corpse/breach: persistent segment overlay
- tactical market lanes: urban `sceneFrame + dressing + encounter`
- wilderness campfire: `feature/interactable + light + biome`

The target beauty comes from making the rolled fields physically coherent and photographically
framed, not from replacing them with a handcrafted scene recipe.
