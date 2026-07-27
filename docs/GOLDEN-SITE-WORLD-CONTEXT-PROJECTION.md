---
type: system-spec
created: 2026-07-25
updated: 2026-07-25
status: ACCEPTED DIRECTION — real-roll context and background contract; implementation unauthorized
owner: Golden Site non-playfield context, background images, and context-style projection
authority:
  - ART-DIRECTION-CANON.md
  - GRAPHICS-CONVERGENCE-CHARTER.md
  - BATTLEMAP-TOWNTRAY-COMPOSITION.md
  - GOLDEN-SITES-CATALOG.md
implementation-evidence:
  - ../src/engine/theater-data.js
  - ../src/ui/theater-boot.js
  - GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md
roll-evidence:
  - ../Reference/Golden-Site-World-Context/ROLL-RECEIPTS.json
visual-evidence:
  - ../Reference/Golden-Site-World-Context/contact-sheets/context-style-targets.png
  - ../Reference/Golden-Site-World-Context/VISUAL-RECEIPTS.json
---

# GOLDEN SITE ROLLED WORLD-CONTEXT PROJECTION

## Founder direction

Adam, 2026-07-25:

> "also makes me think we need to do a pass on background images and background styles
> for the maps based on real rolls at some point"

> "no better time than now, makes perfect sense with our golden sites"

This extends, rather than replaces, the accepted 2026-07-22 art-canon ruling:

> "Now these screens can be built from nodes, or vector art overlaying some biome art
> that we generate for background images, but we aren't going to be able to generate
> bespoke imagery per travel choice by pre-alpha."

The binding conclusion is:

> A Golden Site is not a tactical tray floating in a generic void. Its playable
> geometry remains canonical, while the world, place, material, adjacency, elevation,
> light, weather, history, and current-state rolls project outward into an honest
> context apron and background field.

The background is a **projection of retained facts**, not a mood-board substitution for
them and not a second source of world truth.

## Why this pass exists

The first Prison / Custody ideal-art comparison exposed the gap clearly:

- the two drafted civic-jail layouts are tactically and institutionally useful, but
  their neutral presentation voids make them feel like isolated models;
- the real rolled suspended-cell composition inherits The Shimmering Maw, Living
  Ironwood, massive chains, a fused-glass crater, a hanging holding form, a winch, and
  a property objective;
- those independent facts continue beyond the playable floor and make the site feel
  embedded in a world rather than dressed after the fact.

The lesson is not “all backgrounds should be spectacular.” It is that an ordinary
quarry town, marsh, cliff monastery, canal district, forest, or street continuation is
also rolled context. A neutral void is a useful diagnostic fallback, not the default
finished expression for every exterior Golden Site.

Research and site doctrine still matter. They keep the playable site functional,
legible, and mechanically honest. World-context projection prevents those structures
from becoming the imaginative ceiling.

## Honest current-engine audit

Genesis already has several useful seams:

| Current seam | What it owns now | What it does not own |
|---|---|---|
| `THEATER_ENV_PALETTE[].voidTint` in `src/engine/theater-data.js` | Four near-black environment tints for dungeon, urban, wilderness, and breach | Rolled setting, geography, adjacency, or background geometry |
| `scene.background`, renderer clear color, and fog in `src/ui/theater-boot.js` | A flat color/fog field around the board | Layered context, silhouettes, horizon, supports, or background images |
| exterior daylit/overcast/moonlit profiles and celestial arc | Time-sensitive outdoor key direction, color, intensity, shadow, and sky/void tint | A rolled landscape or settlement for that light to illuminate |
| interior tile-kit grade and fog whisper | Realm-aware interior backdrop tint and depth softening | The physical world beyond an opening, cutaway, balcony, or cavern mouth |
| fixed production camera and `ShotPlan` | Stable composition, framing, focus, and occlusion treatment | A context product describing what belongs outside the playfield |
| world, place, walk, and site lineage | The facts required to derive context | A renderer-facing context plan |

The missing shared product is a **`WorldContextProjectionPlan`** between committed
world/place facts and scene realization.

No Golden Site currently earns a new status gate merely because this specification
exists. The production renderer still falls back to graded color/fog around most
boards, and the existing ideal-art images are visual targets rather than runtime proof.

The companion
[`Golden-Site-World-Context`](../Reference/Golden-Site-World-Context/README.md)
packet includes four real-roll style targets. They are composition and projection
evidence only: flattened art cannot satisfy the runtime contract by itself.

## Protected boundaries

### The playfield remains the authority

The tactical playfield owns:

- traversable cells and surfaces;
- collision, cover, elevation, doors, stairs, bridges, drops, hazards, and supports;
- actors, objectives, property, evidence, resources, and interactables;
- legal entrances, exits, hidden connections, and reinforcement routes; and
- exact mutable state.

Background art cannot add or remove any of these.

### Context is not mechanics

A context layer may:

- show land falling away beyond a real cliff edge;
- continue a true road, canal, wall, bridge, stair, chain, root, or roof mass beyond a
  committed portal;
- show distant settlement, terrain, water, canopy, cavern, host body, or planar
  structure licensed by rolls;
- make the site's material and construction continue coherently into the world;
- express visible weather, time, smoke, damage, repair, occupation, and current events;
  and
- provide scale, depth, silhouette, and world identity.

It may not:

- imply a traversable route, door, roof, bridge, platform, ladder, or shore that the
  canonical graph does not contain;
- bake an actor, monster, guard, prisoner, crowd, chest, vehicle, fire, or treasure into
  a reusable image unless a separate canonical state owns and mounts it;
- reveal a secret, hidden route, faction identity, danger, or offscreen event merely
  because it would make the picture richer;
- paint a destination that has no node/edge or a settlement extent the world does not
  support;
- substitute a distant painted battle, prison break, flood, or collapse for an actual
  event/state; or
- become the only representation of a mechanically important fact.

### Pre-alpha remains provider-independent and runtime-generation-free

This contract does not require runtime ImageGen or one bespoke image per seed. The
pre-alpha production path is:

1. reusable procedural low-poly context geometry;
2. reusable context cards, silhouettes, and background plates authored offline;
3. deterministic assembly from real roll tags and retained source refs; and
4. a graded void/fog fallback when no truthful realization exists.

Runtime image generation remains a separately gated later possibility under the
existing art-canon cost, latency, determinism, rights, safety, continuity, offline, and
provider-availability conditions.

## The four-band scene stack

### Band 0 — canonical playfield

This is the Golden Site, BattleMap, SceneTray, or TownTray itself. It is not background.
Every tactical and interaction fact lives here.

### Band 1 — context apron

The apron explains how the playfield sits in the world. It has two typed parts:

- **portal continuation:** a short, visibly noninteractive continuation of a real exit,
  such as a road, canal, stair, bridge, tunnel, roof run, chainway, or forest path; and
- **support continuation:** foundations, retaining terrain, cliff mass, roots, piers,
  chains, hull, giant body, water body, or cavern shell required to make the tray's
  physical posture believable.

The apron may use low-poly 3D geometry and the same materials as the playfield. It has
no independent collision or interaction authority. Portal continuation must align with
a real portal id; support continuation must align with a real boundary/support fact.

### Band 2 — context field

The field carries near- and mid-distance world mass:

- hills, ridges, trees, marsh, quarry cuts, roofs, walls, towers, canals, wharves,
  switchbacks, platforms, hanging settlement fragments, cavern faces, or host anatomy;
- low-detail procedural meshes;
- layered silhouette cards or shallow 2.5D clusters; and
- state-sensitive but noninteractive environmental traces.

It is lower in contrast, prop density, and semantic specificity than the playfield.
Distinct doors, ladders, loot silhouettes, and standee-like actors are prohibited
unless they correspond to canonical off-board records and a later system explicitly
owns their representation.

### Band 3 — far field and atmosphere

The far field supplies the large-scale premise:

- horizon, skyline, mountain wall, forest mass, ocean, sky, distant city, crater,
  abyss, world-body, cavern depth, or reality seam;
- one camera-calibrated background plate or a very low-detail geometry field;
- fog, cloud, rain, snow, ash, mist, dust, spores, reflected light, and celestial
  color; and
- restrained motion whose source is a committed environmental fact.

Far-field art never claims fine topology. The existing graded void/fog is the smallest
legal Band-3 fallback.

## Source eligibility and precedence

The plan consumes retained facts in this order:

1. **Current node and regional geography:** biome province, terrain, coast/drainage,
   settlement premise, realm, Fray state, and known map relationships.
2. **Canonical adjacency:** actual graph edges, nearby-place records, host/guest
   relationships, approach direction, portals, and destination knowledge.
3. **World construction/material:** persistent `arch`, culture/construction profile,
   and any explicit host material.
4. **Place and site facts:** setting, archetype, dimensions, terrain posture, history,
   current use, condition, support, and site adapter.
5. **Walk/room facts:** topology, elevation, water/void, exterior/interior status,
   light, atmosphere, dressing, and visible background event.
6. **Current state:** time, weather, occupancy, damage, fire, flood, siege, breach,
   repair, alert, abandonment, or other committed event.
7. **Presentation:** fixed camera, framing, contrast budget, fog, LOD, and fallback.

Later sources may refine an earlier source but cannot contradict it. A site-local
landslide may change the visible regional slope; a generic wilderness plate may not
erase a rolled canal city.

### Visual-eligibility classes

| Fact class | Examples | Projection rule |
|---|---|---|
| Direct visible noun | crater, canal, cliff, bridge, sky-whale, wall, forest | May become apron, context mass, or far field with source refs |
| Physical property | material, elevation, water level, suspension, growth, color loss | May modify geometry/material/light across licensed bands |
| Visible condition/process | rain, smoke, active fire, flood, collapse, repair, occupation | May appear only while its state is current and locally visible |
| Sensory fact | smell, sound, temperature, vibration | Does not automatically license a visible object; use particles/motion only when the cause is separately established |
| Social/narrative fact | taboo, debt, law, faction goal, rumor | May influence visible authored marks or activity only when another committed fact makes them physically present |
| Secret/latent fact | hidden route, suppressed history, unknown threat | Never enters player-facing context before the knowledge/reveal contract permits it |

## Composable context-style families

These are realization grammars, not mutually exclusive biomes. A plan chooses one
dominant family and at most two modifiers. It does not select one opaque “pretty
background” row.

| Family | Core visual job | Typical realizations | Honest minimum fallback |
|---|---|---|---|
| `GRADE_ONLY` | Bounded diagnostic/interior void | graded color, fog, light profile | existing renderer behavior |
| `REGIONAL_TERRAIN` | Continue landform and biome province | terrain apron, ridge/tree cards, distant terrain plate | graded ground/sky split |
| `SETTLEMENT_FABRIC` | Embed a site in streets, roofs, walls, and district mass | true portal street stubs, roof/wall clusters, skyline plate | one portal stub + low skyline silhouettes |
| `VERTICAL_DEPTH` | Explain cliff, quarry, shaft, sky, abyss, or crater posture | support faces, hanging structures, depth fog, far floor/void plate | support silhouette + depth gradient |
| `WATER_NETWORK` | Continue canals, rivers, coast, flood, or water below | connected water body, banks/piers, reflection plane, horizon | real water exit + fogged water plane |
| `ENCLOSING_SHELL` | Place the map inside cavern, canopy, giant skull, hull, or megastructure | back/side shell mass, ceiling-implying cards, opening light | one enclosing mass + opening/void contrast |
| `HOST_STRUCTURE` | Show that the site rides or borrows another vast thing | bridge span, whale spine, colossal root, wall, machine, chained village | one support/host contour tied to the tray |
| `REALITY_DISTORTION` | Express a licensed Fray, planar, gravity, time, or sentient-world premise | controlled repeated silhouettes, skewed growth, impossible far field, seam VFX | graded breach field with one sourced anomaly |

High Spice does not automatically choose `REALITY_DISTORTION`. The source must name or
physically imply the distortion. An ordinary camp built in fused glass may remain
`REGIONAL_TERRAIN + HOST_STRUCTURE` with a strange material modifier.

## Realization lanes

### Procedural 3D context

Use near the playfield for:

- support geometry;
- true portal continuations;
- water/void edges;
- large terrain masses;
- repeated roofs, walls, trees, posts, chains, roots, and piers; and
- elements that must accept the current light and cast or receive coherent shadows.

Context geometry uses the shared surface/material grammar and remains visibly simpler
than the tactical site. It does not get bespoke collision.

### Layered 2.5D context cards

Use for:

- tree lines, roof clusters, cliff silhouettes, distant cranes, switchbacks, cavern
  teeth, canopy, skyline, and repeated settlement fragments;
- one to three depth layers with restrained parallax under governed pan/zoom; and
- alpha-cut shapes that would be wasteful as full geometry.

Cards remain world-oriented or camera-calibrated under the fixed production camera.
They never billboard like characters, receive standee bases, or masquerade as nearby
interactables.

### Offline-authored background plates

Use for the far field only. Plates are reusable by tags and family; they are not minted
per player choice or per runtime seed.

A background image asset must declare:

```text
id and version
context family and compatible tags
source recipe / prompt hash / provenance
fixed camera family and horizon anchor
safe crop and pan/zoom overscan
depth band and intended mount plane
alpha/depth/sky/emissive masks where present
time/weather compatibility or neutral-light status
grade behavior and forbidden mirroring
repeat/tiling rule
interactive-noun prohibition
license and production status
```

The preferred plate is lighting-neutral enough to accept the live realm grade and
celestial profile. If it contains directional sunlight, window light, fire, or
emissive features, it must carry a compatible time/profile family or separate masks;
the renderer may not place a noon-shadow plate behind a moonlit board.

Discrete people, monsters, guards, prisoners, carts, fires, open doors, loot, and
vehicles should not be baked into a reusable plate. Mount them from canonical state
through their owning systems.

### Atmosphere and motion

Fog, rain, snow, ash, dust, leaves, spores, water motion, chain sway, smoke, and
reflected/emissive light are separate deterministic layers. Their source, direction,
intensity, and lifetime come from current state. They cannot be used to obscure an
otherwise false boundary or compensate for unreadable gameplay.

## Proposed `WorldContextProjectionPlan`

This is a conceptual data contract, not a frozen schema:

```js
{
  id, version, seedNamespace,
  sourceRollRefs, rollerLineage,
  cameraFamily, lightProfileRef, clockRef, weatherRef,
  boundaryEdges: [{
    sideOrRun, kind, portalRef, destinationRef, supportRef,
    continuationAllowed, knowledgeState, sourceRefs
  }],
  layers: [{
    id,
    band,                 // apron | near | mid | far | atmosphere
    family,
    realization,         // mesh | context-card | plate | fog | particles | grade
    recipeRef,
    sourceRefs,
    transform,
    materialRole,
    contrastClass,
    motionRef,
    collision: "none",
    interaction: "none",
    routeClaim: "none"    // or a real portal/destination ref
  }],
  omissions: [{ sourceRef, reason }],
  rejections: [{ candidate, rule, reason }],
  fallbacks: [{ from, to, reason }],
  diagnostics: {
    portalAlignment,
    falseAffordances,
    criticalContrast,
    contextCoverage,
    performance
  }
}
```

The plan is a sibling consumer of `TacticalCompositionPlan`, not a replacement for it.
The tactical plan supplies the boundary, portals, negative space, supports, and fixed
camera constraints. Context projection supplies no new legal cell or connector.

## Projection order

1. Retain the complete world/place/walk/site lineage.
2. Determine whether the venue is exterior, interior, transitional, open-sided, or
   vertically exposed.
3. Knowledge-filter every candidate fact before visual classification.
4. Classify each playfield boundary run as wall/enclosure, terrain support, water/void
   edge, true portal, or unlicensed edge.
5. Choose one dominant context family from direct physical facts; add at most two
   licensed modifiers.
6. Build portal continuation only at real exits and support continuation only where
   the playfield needs it.
7. Place near/mid context masses without introducing false affordances or blocking the
   fixed production view.
8. Resolve one far-field plate/geometry field or the graded-void fallback.
9. Apply persistent material/culture and chronological condition to context assemblies.
10. Apply current time, light, weather, atmosphere, and state.
11. Run fixed-camera legibility, boundary-honesty, knowledge, continuity, and
    performance validation.
12. Retain every omitted source, rejected candidate, and fallback in the receipt.

No stage rerolls the world to find an easier picture.

## Failure and fallback ladder

Fallback degrades representation, never truth:

1. remove optional atmosphere motion and particles;
2. reduce repeated context instances and context-card layers;
3. replace near/mid complex clusters with simpler silhouettes;
4. replace a far plate with a compatible neutral family plate;
5. retain only true portal/support apron plus a graded far field;
6. use the existing grade/fog void and emit a visible diagnostic gap.

Never:

- substitute an unrelated forest, town, sky, or cavern because it fits the camera;
- delete a visible abyss, water body, host structure, or settlement premise;
- invent a road or destination to fill an empty edge;
- hide a false join in fog;
- flatten a strange material into ordinary stone;
- reveal a secret because its geometry would be attractive; or
- preserve one favored seed with a seed-name branch.

## Fixed-camera and legibility law

The context should enrich the shot without competing with the tactical read.

- The playfield retains the strongest local contrast, sharpest interaction silhouettes,
  and highest prop specificity.
- The apron may match playfield materials but loses interactive density immediately
  outside the boundary.
- Near/mid context uses broader masses, lower contrast, fewer internal openings, and
  fewer high-frequency edges.
- Far context receives fog/grade separation and no cinematic depth-of-field blur.
- Player sprites, objectives, doors, stairs, cells, cover, and true exits must remain
  readable at contact-sheet scale.
- Background value may frame a silhouette; it may not produce a false highlight that
  reads as an interactable or exit.
- Governed pan/zoom/focus must stay inside the plate's safe crop and must not expose
  unfinished context edges.
- Camera-side wall omission and cutaway continue to obey the art canon. A far wall or
  context mass cannot re-occlude the information the cutaway just protected.

## Real-roll context portfolio

`../Reference/Golden-Site-World-Context/ROLL-RECEIPTS.json` records six complete current
world-genesis replay-harness draws plus the Prison reconstruction receipt.

The six world draws use the live `STAGES` order and `lookup()` tables, with a recorded
Mulberry32 harness replacing the live unseeded `Math.random` solely to make the audit
replayable. They are **real current table/roller results but not product world seeds**:
the current player-facing ritual does not persist an RNG seed.

| Site study | Replay harness | Live rolled collision | Context projection lesson |
|---|---:|---|---|
| Guard Post | `19` | High-Harrow Gate + Bone & Sinew + mist pass + Hanging Crane/Drover's Rest nearby | Mountain-pass and support silhouettes matter; construction can radically change the fort without changing the controlled route |
| Camp / Service | `7` | Bog-Iron Camp + Fused Glass + woodsmoke + a falling landmark pressure | Marsh/peat terrain and glass construction may coexist; the Wrong Hour is sound, not permission to paint a false sky |
| Monastery / Commune | `68` | Pilgrim's Ascent + Sounded Glass + cliff switchbacks + nearby Signal Cairn | Processional vertical context and material identity should continue beyond the court; the Dream-Eater stays latent |
| Mine / Workshop | `39` | Ivory Pit + Rough-Hewn Basalt + white-marble quarry + Color-Miners | The background can make the geology/material contrast legible and show the real vertical extraction host |
| Natural Lair | `254` | Gravity-Well + Fieldstone & Mortar + trees growing toward a floating magnetic stone | A natural-site background can carry the world's governing physical anomaly; the quarantined exit must be a real route state, not scenery |
| Urban Institution | `13` | Canal-Knot + Rough-Hewn Basalt + foundry air + nearby Hollowed Bridge | Streets and waterways need true continuations; a whispered name does not license a painted figure |
| Prison / Custody | `6198` | The Shimmering Maw + Living Ironwood + jailhouse + hanging cage | Support, host settlement, abyss, and material are part of the custody composition rather than decorative wallpaper |

The first six are context receipts paired with future Golden Site chassis. They are not
claims that a live Golden Site adapter already generated those complete sites. The
Prison receipt is a fresh ordinary-path reconstructed composition, not the missing
original save.

## Golden Site-specific obligations

### Site 1 — Guard Post

- Continue only the real controlled route, terrain flank, wall/pass, bridge, or
  settlement edge.
- Preserve the sight/observation relationship in the background silhouette.
- Do not add a second road, gate, bridge, or approach unless the plan owns it.
- First context proof: replay harness `19`, High-Harrow Gate + Bone & Sinew.

### Site 2 — Camp / Service

- Show the host ground, route tangent, borrowed clearing, water/terrain relation, and
  permanence level without turning every camp into a town.
- A departing or temporary camp may leave low-detail traces rather than distant
  permanent buildings.
- Background fires, wagons, animals, and people remain state-mounted, not baked.
- First context proof: replay harness `7`, Bog-Iron Camp + Fused Glass.

### Site 4 — Monastery / Commune

- Continue the formal arrival/processional route, cliff/court/terrace posture, guest
  threshold, and surrounding work/service landscape.
- Distant shrine, bell, garden, cell row, or archive mass needs a real provider or site
  record.
- Background cannot reveal restricted knowledge or hidden routes.
- First context proof: replay harness `68`, Pilgrim's Ascent + Sounded Glass.

### Site 5 — Mine / Workshop

- Explain the source-to-processing-to-export relationship through geology, spoil,
  water, roads, hoists, shafts, quarry walls, mills, or settlement support.
- A painted tunnel mouth or crane cannot replace a real connector or mechanism.
- Water, smoke, exhaust, and collapse reflect current circuit state.
- First context proof: replay harness `39`, Ivory Pit + Rough-Hewn Basalt.

### Site 6 — Prison / Custody

- Preserve the public/outside approach, custody support, operator access, property
  destination, and any visible force/void relationship.
- From a captured viewpoint, the background may expose what the prisoner can actually
  see; it cannot reveal a secret route, external ally, or property location hidden by
  the knowledge contract.
- Suspended cells require visible supports and world context without making every chain
  or root an unowned escape route.
- First context proof: seed `6198`, the retained Shimmering Maw reconstruction.

### Site 7 — Natural Lair

- Project biome, ecology, body scale, origin, water, entrance light, and enclosing
  mass. Worked background structure requires a real adopted/host history.
- Darkness remains truthful; backgrounds do not invent practical lights.
- Bolt-holes and distant exits appear only when the lair graph owns them.
- First context proof: replay harness `254`, The Gravity-Well + Fieldstone & Mortar.

### Site 10 — Urban Institution

- Continue both true street/water edges, owned frontage, district mass, roof/vertical
  posture, and hour/current-state consequences.
- The context field is bounded urban fabric, not a claim that the entire city is
  rendered or simulated.
- Social/exploration-to-combat remount preserves the same streets, roofs, doors,
  damage, citizens, and background state.
- First context proof: replay harness `13`, The Canal-Knot + Rough-Hewn Basalt.

## Shared proof contract

Before context projection becomes a production requirement, retain:

1. the exact canonical playfield and ids with context off and on;
2. a real-roll receipt with every consumed, omitted, and rejected source;
3. one `WorldContextProjectionPlan` capture/debug view per band;
4. portal alignment and false-affordance diagnostics;
5. gameplay-scale clay, tactical, dressed/context, and context-disabled captures from
   the same committed plan;
6. day/night or applicable light-state parity without baked-light contradiction;
7. one ordinary terrain/settlement context, one water or vertical context, one
   enclosing context, and one licensed strange context;
8. two changed roll contexts applied to the same site chassis to prove that context can
   change without rewriting mechanics;
9. one changed site chassis under the same world context to prove that the background
   is not a site-specific painting;
10. one adversarial camera/contrast/context case and its named fallback;
11. performance counts by realization lane; and
12. a contact sheet readable at the same scale as the Golden Site ideal-art targets.

A beautiful context image does not pass if it lies about routes, state, knowledge,
material, light, or scale.

## Proof → MVP → Ideal

### Proof

- one pure `WorldContextProjectionPlan` shape;
- grade-only fallback plus procedural apron and one far-field realization;
- real-roll Guard Post, Prison, and one additional ordinary context;
- context-off/on parity over identical mechanics and ids;
- route/knowledge/camera/light diagnostics; and
- one reusable background plate family with full asset metadata.

### MVP

- all eight context families with deterministic fallback;
- context proofs for Sites 1, 2, 4, 5, 6, 7, and 10;
- procedural support/portal aprons, layered context cards, and reusable far plates;
- time/weather/realm grade compatibility;
- state-mounted actors/effects rather than baked narrative events;
- persistent damage/repair/background continuity across venue remount; and
- measured desktop/mobile quality and performance bands.

### Ideal

- regional geometry and low-resolution world-map provinces project continuously into
  local context;
- selected town, route, coast, mountain, forest, subterranean, host-body, and Fray
  fields can persist coherently between adjacent venues;
- background depth, motion, weather, and history respond to persistent world change;
- offline foundry tools derive reusable context families from corpus gaps;
- optional later runtime-generated enrichment remains subordinate to canonical
  grid/node truth and can disappear without breaking the game; and
- Golden Site captures routinely gain the same sense of world embedding that made the
  Shimmering Maw prison stronger than an isolated civic-jail model.

## Known gaps

- no `WorldContextProjectionPlan` schema or compiler exists;
- no current renderer consumes world/place/nearby rolls as context geometry or plates;
- world genesis uses unseeded `Math.random` and does not persist a replayable RNG seed;
- `rollPlace` does not directly consume the persistent world architecture field;
- context-card and background-plate asset manifests do not exist;
- time/weather compatibility metadata for background images does not exist;
- no portal-to-context continuation validator exists;
- no false-affordance or context-knowledge diagnostic exists;
- the current ideal-art set was not authored under this contract, so neutral/expository
  backgrounds should be treated as incomplete rather than silently grandfathered; and
- no Golden Site has passed a runtime context-off/on proof.

These gaps define later implementation work. They do not authorize one-off skyboxes,
seed branches, or bespoke runtime images.
