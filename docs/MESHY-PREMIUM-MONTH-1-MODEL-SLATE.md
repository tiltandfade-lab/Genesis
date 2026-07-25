---
type: production-slate
project: Genesis
status: MONTH-1 DEFINITIVE LIST
created: 2026-07-25
budget: 300 Meshy model generations
reference-root: ../Reference/Meshy-Premium-Month-1/
related:
  - "[[GOLDEN-SITE-CONCEPTING-GUIDELINES]]"
  - "[[STRUCTURE-KIT-CATALOG]]"
  - "[[STRUCTURE-KIT-JUNCTION-AND-ROOF-SPINE-SPEC]]"
  - "[[EXTRUDED-SPRITE-PROP-LIBRARY]]"
  - "[[BLENDER-MODEL-SPEC]]"
  - "[[ART-DIRECTION-CANON]]"
---

# Meshy Premium — Month 1 Model Slate

## 0. Decision

Use the 300-model month to produce **75 high-reuse donor families with four intentional
geometry variants per family**.

```text
75 donor families × 4 reference-driven Meshy models = 300 models
```

This is not a list of 300 unrelated finished props. Each family is a small procedural
vocabulary:

- **A — canonical:** the most generally reusable intact version;
- **B — silhouette:** a meaningfully different proportion or construction;
- **C — failed:** damaged, collapsed, spent, broken, or otherwise stateful;
- **D — adapted:** repaired, improvised, culture-shaped, or fantastically transformed.

The four versions must remain close enough to share gameplay metadata, materials, sockets,
collision policy, and downstream code.

## 1. Reference-image contract

Every Meshy input image must use this common presentation:

- one complete isolated object;
- orthographic front-three-quarter view unless the object requires a declared top view;
- no scenery, floor plane, base, cast shadow, contact shadow, fog, atmosphere, character,
  cargo, unrelated prop, text, label, border, or watermark;
- flat warm-light-gray background;
- soft neutral illumination that reveals planes without baking a scene into the texture;
- restrained mature fantasy construction;
- extremely simple, broad, construction-aligned low-poly planes;
- readable silhouette and mechanically believable joins;
- distinct parts when the family is intended for recombination;
- muted material bands rather than photoreal texture noise;
- no direct copying of an existing commercial game asset.

Use Meshy **Smart Topology** without texture first. Begin at roughly:

| asset class | first target |
| --- | ---: |
| small fixture or light | 300–700 polygons |
| ordinary prop or cluster | 700–1,500 polygons |
| wagon, mechanism, shelter, or large formation | 1,500–3,000 polygons |

Only raise the count when the fixed game camera proves that a missing contour matters.

## 2. Admission rule

A Meshy result is a donor, not a production asset, until it has:

- stable world dimensions and a bottom-centered origin;
- named separable parts or a recorded reason it must remain fused;
- a simple collision/occlusion proxy;
- declared footprint, height, cover, walkability, and mounting class;
- material regions replaced or normalized for Genesis;
- allowed scaling axes and safe variation bounds;
- sockets for attachments, light emission, cargo, repair, or procedural traces where relevant;
- LODs derived locally rather than purchased as additional Meshy generations;
- clay-room and fixed-camera proof;
- provenance record containing the reference image, prompt, Meshy settings, result, and date.

## 3. The 300-model list

### A. Natural and organic formations — 18 families / 72 models

These are the safest AI-mesh investment: exact dimensions are less important, variation is
welcome, and the same donor can serve guard, camp, monastery, mine, lair, urban edge, and
abandoned-site states.

| ID | family and procedural purpose | four Meshy models |
| --- | --- | --- |
| M001 | **Low cover boulder cluster.** Compact two-to-four-stone mass that clearly supplies half cover without sprawling across a route. | A rounded layered cluster · B sharp fractured cluster · C split/scattered cluster · D mortared or deliberately placed cluster |
| M002 | **Tall cover outcrop.** Narrow upright rock mass providing three-quarter cover and a strong height landmark. | A vertical sedimentary stack · B leaning igneous blade · C sheared top · D braced or carved lookout-side version |
| M003 | **Climbable rock-step cluster.** Natural footholds that can become a short alternate access route when aligned to the 2.5-foot height ladder. | A broad three-step climb · B narrow switchback climb · C eroded partial climb · D hand-cut or repaired climb |
| M004 | **Embedded retaining transition.** Rock mass that visually reconciles a procedural wall, terrace, road shoulder, or foundation with natural terrain. | A wall-entering bedrock shoulder · B foundation-wrapping outcrop · C failed/slipped transition · D pinned, mortared, or timber-braced transition |
| M005 | **Wide cave mouth with reveal.** A readable entrance large enough for ordinary encounters, with enough depth to avoid a flat painted hole. | A arched karst mouth · B split-boulder mouth · C partial collapse · D shored or claimed entrance |
| M006 | **Narrow cave squeeze.** Compressed portal that communicates single-file passage, risk, and concealment. | A vertical fissure · B low crawl-like squeeze · C jammed squeeze · D widened or reinforced squeeze |
| M007 | **Tunnel throat and rib mass.** Short organic transition from an entrance into an interior bore without requiring a full generated cave. | A stone rib throat · B root-bound throat · C cracked/settled throat · D mined or propped throat |
| M008 | **Interior ledge and shelf.** Natural raised surface suitable for cover, nest placement, treasure, an authority position, or an alternate route. | A broad walkable shelf · B narrow defensive ledge · C broken shelf · D creature-worked or hand-improved shelf |
| M009 | **Collapse cone and talus ramp.** Debris mass that can be collision-climbable, difficult terrain, blocked terrain, or a source-facing failure trace. | A climbable rubble cone · B long talus fan · C fresh unstable collapse · D cleared path through old collapse |
| M010 | **Dripstone cluster.** Stalagmites and fused columns that create readable natural cover without tiny spikes. | A low clustered forms · B tall narrow columns · C shattered cluster · D mineral-rich wet cluster |
| M011 | **Root arch and burrow mouth.** Large interlocked roots that create a creature-authored or tree-owned entrance. | A broad root arch · B twisted narrow burrow · C snapped/rotted arch · D woven or inhabited entrance |
| M012 | **Root tunnel rib cluster.** Repeating large roots that explain a burrow interior, organic cover, or the sides of a body-authored route. | A parallel root ribs · B tangled asymmetric ribs · C broken/dug-through ribs · D lashed or reinforced ribs |
| M013 | **Sinkhole or shaft rim.** Natural or partly worked perimeter that turns an engine-owned hole into a convincing hazardous opening. | A round eroded rim · B irregular fissure rim · C fresh collapsed edge · D shored, fenced, or worked rim |
| M014 | **Pool and channel rock rim.** Reusable rock edge for springs, cave pools, mine sumps, drains, and water-owned route boundaries. | A shallow pool rim · B narrow channel bank · C breached/overflowed rim · D lined or repaired rim |
| M015 | **Ore-seam outcrop.** Rock face with broad readable mineral bands that can be recolored without changing geometry. | A horizontal banded seam · B vertical vein · C freshly worked face · D exhausted or magically altered seam |
| M016 | **Spoil and tailings pile.** Human-made aggregate mass for mine, construction, siege, urban recovery, and abandoned-site histories. | A coarse spoil mound · B sorted tailings rows · C slumped wet pile · D cleared/reworked pile |
| M017 | **Crystal or strange-mineral growth.** Restrained cool-light candidate that reads as geology first and magic second. | A low clustered growth · B tall blade cluster · C fractured/spent cluster · D harvested or caged working-light cluster |
| M018 | **Nest and larder substrate.** Volumetric organic bed that can accept bones, eggs, hides, food, treasure, or creature traces as separate attachments. | A woven dry nest · B mud-and-root bowl · C abandoned/collapsed nest · D occupied, reinforced, or appropriated nest |

### B. Transport and mechanisms — 16 families / 64 models

These families justify full 3D because they must read from several angles, cast convincing
shadows, and expose parts that can be resized or recombined.

| ID | family and procedural purpose | four Meshy models |
| --- | --- | --- |
| M019 | **Universal four-wheel wagon chassis.** Narrow reusable platform with separate wheels, axles, tongue, bed, and attachment sockets for cargo, sides, canopy, lights, and repair states. | A low standard chassis · B long narrow carrier · C axle-broken wreck · D reinforced service chassis |
| M020 | **Two-wheel handcart.** Human-scale carrier suitable for markets, camps, workshops, corpses, tools, and improvised barricades. | A shallow tray cart · B deep box cart · C overturned/broken cart · D patched culture-owned cart |
| M021 | **Mine ore cart.** Compact industrial tub and wheel assembly that can run on rails or a prepared haul route. | A low iron-shod cart · B timber mine tub · C derailed/deformed cart · D repaired or mineral-work variant |
| M022 | **Sledge and travois carrier.** Wheel-free hauling platform for rough ground, snow, mud, camp movement, and creature or humanoid drag teams. | A timber sledge · B forked-pole travois · C snapped/abandoned carrier · D lashed field repair |
| M023 | **Pack frame and carrier rack.** Freestanding load-bearing framework that can receive bags, ore, firewood, bodies, cages, or ritual cargo. | A narrow back-frame · B broad animal pannier rack · C collapsed load frame · D fortified or ceremonial rack |
| M024 | **Counterweighted road barrier.** Recognizable checkpoint mechanism with separately useful beam, pivot, weight, rope, and support. | A simple boom gate · B forked timber barrier · C dropped/broken barrier · D improvised reoccupation version |
| M025 | **Hand windlass and winch.** Universal rotating drum for wells, gates, shafts, bridges, cages, and workshop lifting. | A horizontal hand windlass · B vertical crank winch · C seized/broken drum · D repaired or geared winch |
| M026 | **Mine hoist headframe assembly.** Compact above-shaft lifting vocabulary; not a whole building. | A timber A-frame hoist · B squat gantry hoist · C collapsed headframe · D reinforced or culture-shaped headframe |
| M027 | **Capstan and chain drum.** Waist-high rotational mechanism for hauling, gates, ship-like works, mines, and heavy doors. | A radial-bar capstan · B enclosed chain drum · C jammed/spent mechanism · D repaired or powered adaptation |
| M028 | **Piston mine pump.** Readable intake, cylinder, lever, and discharge parts for flood control and industrial storytelling. | A hand-lever pump · B crank-driven pump · C failed/leaking pump · D patched working pump |
| M029 | **Bellows or treadle pump.** Low-tech air or water movement device serving forge, mine ventilation, workshop, and ritual fire. | A single large bellows · B twin treadle bellows · C torn/collapsed bellows · D repaired or ceremonial bellows |
| M030 | **Jaw crusher.** Compact paired plates, hopper, and drive suitable for ore, stone, salvage, or fantasy processing. | A hand-driven crusher · B geared workshop crusher · C jammed/broken crusher · D reinforced or strange-material crusher |
| M031 | **Stamp-mill module.** One readable repeatable stamping unit rather than a whole industrial building. | A single vertical stamp · B twin-stamp frame · C snapped/seized stamp · D repaired or magically driven stamp |
| M032 | **Ore-washing rocker and trough.** Water-assisted processing equipment with separated tray, stand, screen, and discharge. | A rocking tray · B stepped wash trough · C silted/broken wash unit · D cleared or culture-owned wash unit |
| M033 | **Sorting hopper and work table.** Reusable gravity-fed task station for ore, grain, salvage, market goods, or alchemical material. | A low sorting tray · B raised feed hopper · C tipped/spilled station · D repaired or repurposed station |
| M034 | **Ventilation fan or large workshop bellows.** A legible air-moving landmark for dangerous interiors. | A hand-cranked fan · B ducted rotary fan · C stopped/damaged fan · D repaired, guarded, or arcane-powered fan |

### C. Shelter and service assemblies — 9 families / 36 models

Shelters remain culturally meaningful. Meshy supplies difficult canopy volumes and donor
silhouettes; the engine still owns exact footprint, collision, poles, sockets, and gameplay.

| ID | family and procedural purpose | four Meshy models |
| --- | --- | --- |
| M035 | **Ridge tent.** Ordinary household or expedition shelter with a clear roof line and removable front treatment. | A short household ridge · B long communal ridge · C sagged/torn ridge · D patched culture-owned ridge |
| M036 | **Wedge military tent.** Compact disciplined shelter with steep sides and a small tactical footprint. | A low two-person wedge · B tall command wedge · C collapsed/struck tent · D reinforced field-repair tent |
| M037 | **Dome or bender shelter.** Curved pole-and-cloth form for woodland, migratory, or family construction languages. | A low woven dome · B elongated bender · C partially collapsed dome · D layered weatherproof adaptation |
| M038 | **Long woven shade canopy.** Open-sided service or desert shelter defined by a strong fabric silhouette rather than enclosed walls. | A flat woven shade · B peaked long canopy · C wind-torn canopy · D doubled or repaired canopy |
| M039 | **Lean-to service shelter.** Small open work cover for tools, guards, animals, cooking, repairs, or mine support. | A single-slope timber lean-to · B rock-backed lean-to · C collapsed lean-to · D patched/reoccupied lean-to |
| M040 | **Removable wagon canopy module.** Hoops and cloth that mount to M019 without rebuilding the chassis. | A low merchant canopy · B tall household canopy · C torn/retracted canopy · D armored, screened, or ceremonial canopy |
| M041 | **Field kitchen and cook shelter.** Compact hearth, suspended vessel support, work ledge, and optional light socket. | A household cook station · B organized military kitchen · C spent/abandoned kitchen · D repaired or winterized kitchen |
| M042 | **Trough, feeder, and water stand.** Stable service fixture for animals, camps, markets, workshops, and streets. | A long timber trough · B stone basin trough · C broken/dry trough · D patched, covered, or culture-owned trough |
| M043 | **Wash and water-service station.** Raised vessel, drain surface, stand, and work shelf for mundane camp and institutional life. | A barrel-fed wash stand · B stone communal wash station · C failed/leaking station · D repaired or ritualized station |

### D. Civic, market, and ritual equipment — 10 families / 40 models

These are site centers and identity carriers. Their major components must stay separable so
realm motifs, materials, authority marks, and condition states can change locally.

| ID | family and procedural purpose | four Meshy models |
| --- | --- | --- |
| M044 | **Wellhead with lifting gear.** A complete but modular well fixture whose shaft opening remains engine-owned. | A timber-roofed windlass · B low stone crank well · C collapsed/dry wellhead · D repaired or warded wellhead |
| M045 | **Low public fountain basin.** Walk-around civic center with a low cover rim and replaceable center fitting. | A round stone basin · B polygonal trough fountain · C dry/cracked fountain · D patched or reclaimed fountain |
| M046 | **Raised ceremonial fountain.** More formal authority landmark with a readable upper bowl or water source. | A stacked-bowl fountain · B carved spring-head fountain · C broken/blocked fountain · D restored or strange-water fountain |
| M047 | **Market-stall chassis.** Counter, posts, shelf sockets, and canopy attachment points without permanent goods. | A narrow street stall · B broad plaza stall · C fire-damaged/struck stall · D repaired or faction-marked stall |
| M048 | **Shutter-counter assembly.** Building-facing transaction fixture that can be open, closed, damaged, or barricaded. | A horizontal lift shutter · B paired folding shutters · C broken/forced counter · D reinforced or repurposed counter |
| M049 | **Public notice and signal board.** Freestanding civic information surface accepting separate posters, laws, bounties, schedules, or warnings. | A roofed notice board · B narrow post board · C vandalized/broken board · D repaired or militarized board |
| M050 | **Shrine and reliquary plinth.** Volumetric sacred support accepting separate idol, relic, flame, crystal, offering, or faction object. | A low roadside shrine · B tall niche shrine · C desecrated/empty shrine · D repaired or syncretic shrine |
| M051 | **Altar and ritual work table.** Serious, practical ritual surface with sockets rather than permanently modeled magical clutter. | A restrained slab altar · B portable timber altar · C cracked/overturned altar · D repaired or active emissive altar |
| M052 | **Bell or gong yoke.** Audible civic, guard, mine, monastery, and alarm fixture with separable striker and hanging body. | A suspended iron bell · B broad warning gong · C cracked/fallen signal · D repaired or improvised signal |
| M053 | **Archive lectern and scribe station.** Knowledge-work fixture for monastery, urban institution, guard records, mine tallies, and ritual use. | A standing lectern · B seated sloped desk · C collapsed/burned station · D repaired or secured archive station |

### E. Defensive and industrial hero props — 6 families / 24 models

These are movable or stateful objects, not replacements for the exact procedural wall, stair,
roof, junction, floor, or gate-opening grammar.

| ID | family and procedural purpose | four Meshy models |
| --- | --- | --- |
| M054 | **Chevaux-de-frise and spike barrier.** Portable route denial whose X-frame, spikes, rope, and wear remain readable from the game camera. | A timber anti-charge frame · B iron-spiked frame · C broken/displaced frame · D lashed improvised repair |
| M055 | **Movable timber barricade.** Self-supporting defensive obstacle rather than a permanent wall segment. | A plank-and-brace barrier · B log barricade · C breached/burned barrier · D reinforced reoccupation barrier |
| M056 | **Wattle and woven screen.** Light culturally variable screen for camp edges, markets, animals, concealment, and wind protection. | A straight low screen · B curved tall screen · C torn/open screen · D patched or decorated screen |
| M057 | **Gabion and stone-basket cluster.** Portable earthwork vocabulary useful in guard, siege, construction, flood, and urban-recovery states. | A single large basket · B stepped basket cluster · C burst/spilled basket · D repaired or reused basket |
| M058 | **Holding cage or animal pen module.** Inspectable open-frame enclosure with a readable door and separable bars/panels. | A compact timber cage · B iron transport cage · C forced/broken cage · D repaired or repurposed pen |
| M059 | **Forge hearth and blower assembly.** Major working prop with warm-light socket, fuel area, hood, bellows connection, and tool sockets. | A compact field forge · B masonry workshop hearth · C cold/damaged forge · D repaired or strange-fuel forge |

### F. Stateful trace and cover clusters — 8 families / 32 models

These are curated causal traces, not random clutter. Each cluster must keep a strong outer
silhouette and a limited number of large components.

| ID | family and procedural purpose | four Meshy models |
| --- | --- | --- |
| M060 | **Broken wagon and axle wreck.** Derivative cover and abandonment family built from M019-like parts. | A wheel-off roadside wreck · B overturned chassis · C burned fragmented wreck · D salvaged barricade adaptation |
| M061 | **Tool and active-work cluster.** Large readable tools around a stable rack or bench, indicating a task without loose micro-clutter. | A mining work cluster · B carpentry work cluster · C abandoned/scattered cluster · D orderly maintained cluster |
| M062 | **Timber repair and brace cluster.** Sister posts, wedges, caps, and lashings showing structural intervention. | A prepared repair stack · B installed diagonal brace group · C failed brace debris · D later reinforced repair |
| M063 | **Rope, net, and harness cluster.** Complex flexible equipment that benefits from generated volume but must avoid hair-thin strands. | A coiled hauling set · B hanging cargo net · C tangled/snapped set · D repaired or actively tensioned set |
| M064 | **Camp kitchen and stores cluster.** A few large vessels, rack forms, and containers showing domestic service without becoming a pile of tiny props. | A traveling-household cluster · B disciplined military stores · C abandoned/spilled stores · D reorganized long-term stores |
| M065 | **Market basket and display cluster.** Replaceable goods presentation that turns an empty stall into a specific working institution. | A produce display · B cloth/craft display · C overturned/looted display · D protected or rationed display |
| M066 | **Creature bone and larder cluster.** Adult-horror trace with restrained, readable bones and bundled remains rather than gore noise. | A dry bone cache · B butchered larder rack · C scattered abandoned cache · D organized or ritualized cache |
| M067 | **Salvage, scrap, and repair-material cluster.** Cross-site evidence of recovery and reuse with a few large recognizable parts. | A sorted salvage stack · B mixed metal/timber scrap · C collapsed unsafe heap · D picked-over or repurposed stack |

### G. Lore-native light and signal fixtures — 8 families / 32 models

These fixtures own geometry and emission surfaces. Runtime lighting owns range, color, shadow,
flicker, overlap, and performance. Each warm fixture needs an ember/flame socket; each cool
fixture needs an emissive material region rather than an invisible point light.

| ID | family and procedural purpose | four Meshy models |
| --- | --- | --- |
| M068 | **Wall flame sconce.** Grounded dungeon and institutional wall light replacing the abstract bulb while preserving the approved torch behavior. | A iron basket sconce · B forked timber-and-iron sconce · C bent/spent sconce · D repaired or hooded directional sconce |
| M069 | **Freestanding brazier basket.** Movable warm pool for courts, guard decks, camps, streets, rituals, and workshops. | A low round brazier · B tall tripod basket · C tipped/spent brazier · D screened or ceremonial brazier |
| M070 | **Hanging lantern.** Ceiling, beam, hook, and wagon-compatible enclosed warm light with a distinct glowing material volume. | A iron cage lantern · B horn/paper-panel lantern · C cracked/dark lantern · D repaired or weather-shielded lantern |
| M071 | **Hooded mine work lamp.** Directional task light that can mount to posts, walls, carts, machinery, or work faces. | A hooded oil lamp · B protected candle-box lamp · C crushed/spent lamp · D repaired or mineral-fueled lamp |
| M072 | **Portable table and hand lantern.** Human-scale light that can sit on counters, altars, ledges, wagons, and workstations. | A squat oil lantern · B handled candle lantern · C broken/open lantern · D shuttered signal-lantern version |
| M073 | **Ritual cold-light vessel.** Lore-native cool magic source with the visible material itself emitting, avoiding a free-floating bulb. | A crystal reliquary cup · B rune-cut stone vessel · C dormant/cracked vessel · D active repaired or faction-bound vessel |
| M074 | **Living or mineral cool-light cluster.** Sunless readable cool source for lairs and mines, grounded in fungus, crystal, or bioluminescent growth. | A shelf-fungus lamp cluster · B mineral bud cluster · C harvested/spent cluster · D cultivated/caged cluster |
| M075 | **Beacon and signal-fire basket.** Larger warm landmark for gates, ridges, guard posts, mine mouths, alarms, and navigation. | A raised fire basket · B stone-and-iron beacon bowl · C collapsed/extinguished beacon · D shielded, repaired, or color-signal beacon |

## 4. Explicit exclusions from the 300

Do **not** spend Meshy generations this month on:

- walls, wall ends, party walls, corners, posts, capitals, structural junctions;
- floors, roads, terrain slabs, retaining prisms, stairs, ramps, ladders, or landings;
- roof planes, ridges, roof spines, gables, parapets, or exact arcade bays;
- ordinary boxes, barrels, sacks, tables, beds, benches, shelves, simple doors, or crates;
- characters or creatures already better represented by canonical standee sprites;
- decals, stains, moss, cracks, soot, wetness, or other surface-state masks;
- LODs, ordinary rescaling, mirrored versions, recolors, or material-only changes;
- an entire building, site, dungeon room, mine, camp, monastery, or urban block.

Those belong to procedural geometry, faced boxes, extrusion, sprites, shaders, local Blender
derivation, or runtime composition.

## 5. Production order

Do not generate M001 through M075 in simple numeric order.

### Gate 1 — eight-family calibration

Generate only the A version of:

```text
M001 low cover boulder cluster
M005 wide cave mouth
M019 universal wagon chassis
M025 hand windlass
M035 ridge tent
M047 market-stall chassis
M059 forge hearth
M068 wall flame sconce
```

Bring all eight through Smart Topology, Blender cleanup, Genesis materials, collision,
metadata, and clay-room proof. Record minutes of cleanup per accepted asset.

### Gate 2 — approve or change the recipe

Continue only when:

- at least six of the eight preserve the intended silhouette;
- separated parts are genuinely useful rather than arbitrary fragments;
- ordinary cleanup is faster than rebuilding the same object natively;
- the fixed camera reads the result without generated texture detail;
- the polygon count and shadow cost fit the browser target.

#### Focused cross-material calibration amendment

The wagon round trip established that a valuable fused Meshy donor can still be salvaged by
connected-island analysis, with simple standardized parts replaced locally. Before preparing the
full production handoff, test this smaller material-diverse set:

| Order | Model | Primary material/process risk | Question |
|---:|---|---|---|
| complete | `M019-A` wagon chassis | structural timber + iron + repeated mechanism | Can the valuable chassis survive while dirty wheels are replaced procedurally? **Passed.** |
| complete | `M001-A` low-cover boulder cluster | broad geological stone planes | Can a composed cover-anchor silhouette survive low remesh and beat routine procedural placement? **Passed at 236 cleaned triangles after deterministic duplicate-shell removal.** |
| complete | `M035-A` ridge tent | thin cloth over a timber frame | Can broad cloth, an open threshold, and separable supports survive low remesh? **Passed at 752 cleaned triangles after mirrored rear flaps were replaced with a deterministic back cap whose deep returns and bound seams seal both rear corners.** |
| 3 | `M059-A` forge hearth | masonry mass + iron fittings + empty sockets | Can mixed rigid materials remain legible without buying dense brick, coal, tool, or fastener noise? |
| 4 | `M068-A` wall flame sconce | thin forged metal + runtime-owned flame/light | Can a small open metal fixture survive at game scale while flame, emission, and illumination remain engine-owned? |

This focused set replaces the requirement to finish all eight original calibration references
before writing the production handoff. `M005-A`, `M025-A`, and `M047-A` remain high-priority early
production models, but they no longer block documentation if the five objects above establish a
trustworthy recipe.

The focused recipe passes when:

- at least four of the five objects are accepted, including `M019-A`;
- at least one natural mass and one thin/open-frame object pass;
- every failure produces a family-specific routing decision rather than an improvised rerender loop;
- cleanup is faster than native reconstruction for every accepted donor;
- no accepted result depends on generated texture detail;
- repeated or standardized parts are identified for procedural geometry, extrusion, or instancing;
- the reference-image prompt reliably produces one isolated object in one view rather than a
  model sheet, turnaround, scene, or part catalog.

Stop paid generation for a family when two attempts fail for the same structural reason. Return
its remaining slots to the highest-value successful families or to native construction.

#### Required production-handoff document after calibration

Once the focused recipe passes, produce one joint handoff with two explicit lanes.

**Adam / Meshy lane**

Every production row must provide:

```text
model ID and variant
plain-English asset name
reference-image path
exact Meshy prompt, when the selected mode accepts one
Meshy mode
topology mode and target polygon count
texture and image-enhancement settings
exact untouched-download filename
expected procedural replacements
intake and acceptance checks
```

**Terra / reference-image lane**

Every production row must provide:

```text
model ID and variant
definitive subject to generate
what geometry the donor must own
what the engine or local tools own instead
canonical style block
composition and scale contract
material-language block
single-isolated-render constraints
avoid list
exact reference-image filename
```

The Terra lane must quote one canonical style block and one canonical single-render block
verbatim. The single-render block must explicitly require:

```text
exactly one isolated object or intentionally fused cluster
exactly one orthographic front-three-quarter view
no model sheet, turnaround, alternate angle, inset, underside, duplicate, exploded layout,
part catalog, neighboring prop, floor, horizon, label, dimension, arrow, border, or watermark
```

One row creates one reference image. Variants never share a canvas. A corrective render changes
one identified failure only; it does not silently redesign the family.

### Gate 3 — complete A models

Generate the canonical A model for all 75 families. This creates broad usable coverage before
the month is consumed by variants.

### Gate 4 — complete B, C, and D in value order

Finish the remaining variants in this order:

1. M019–M034 transport and mechanisms;
2. M068–M075 lights;
3. M001–M018 natural formations;
4. M035–M043 shelters;
5. M044–M053 civic and ritual;
6. M054–M067 defensive and trace clusters.

If a family fails repeatedly, stop spending generations on it and return its unused slots to:

```text
M001–M018 natural formation alternates
M019–M025 carrier and lifting alternates
M068–M075 light-fixture alternates
```

These three groups have the highest expected salvage and reuse value.

## 6. First reference

The first generated reference is:

![M019 universal four-wheel wagon chassis](../Reference/Meshy-Premium-Month-1/reference-images/M019-A-universal-four-wheel-wagon-chassis-v2.png)

It demonstrates:

- one isolated donor rather than a finished scene prop;
- broad orthographic three-quarter presentation;
- a chassis that can be resized independently from its wheels;
- visible axle, tongue, cargo-bed, and attachment logic;
- sockets for canopy, cargo, sideboards, lights, and repair;
- muted readable construction suitable for simplification.

It is a **calibration input**, not an accepted final model. If Meshy turns its modest plank wear
or iron joints into noisy geometry, the next reference pass should flatten those regions further
before the rest of the fleet is generated.

The earlier first-pass image remains beside it as generation-history evidence. The `v2` image is
the current input because its prompt quotes the canonical prop-language blocks and its geometry is
cleaner and less ornamented.

## 7. Reference-production record

For every reference image, append:

```text
modelId
variant
family
source site/schema needs
ImageGen prompt
reference images used for style only
output path
Meshy mode and settings
Meshy task/result IDs
accepted/rejected
cleanup minutes
derived production assets
notes for the next reference
```

The first eight calibration objects determine the reusable prompt and image grammar. Do not
silently paraphrase that grammar after it has been accepted; change it through an explicit
calibration decision.
