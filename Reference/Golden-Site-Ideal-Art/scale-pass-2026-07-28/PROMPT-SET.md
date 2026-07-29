# Prompt and source receipt — Golden Site scale pass — 2026-07-28

Generation mode: **built-in image generation, one call per asset**

## 2026-07-28 active-window replacement amendment

The nine original third-column prompts below produced extra-large overview studies.
Those images are now explicitly **NOT A GOAL** and live only in
[`not-a-goal-extra-large/`](not-a-goal-extra-large/README.md). Their prompt sections are
retained as an honest generation receipt, not as current scale direction.

The active third-column images were selected from 12 built-in image-generation calls:
nine first-pass compact replacements plus focused footprint reductions for Camp,
Monastery, and Contested Fortress. The final selected prompts shared this contract:

- stylized-concept target for one Golden Site `MaterializationWindow`;
- one isolated square-grid board in the fixed elevated three-quarter orthographic
  camera;
- the user-supplied current terrain-engine frame as the primary terrain/scale
  reference;
- real images from the existing site target set as identity and relationship
  references;
- roughly 12 × 16 active five-foot cells as the requested center, with a hard prompt
  ceiling of 16 × 18;
- arrival within a few cells of the first meaningful choice;
- two or three tightly stacked elevation bands;
- height through retaining faces, shafts, cutaways, wall thickness, balconies,
  substrate slope, parapet drops, and short routes;
- two or three clipped, honest frontiers that imply the larger persistent site;
- no panorama, district/campus/complex/fortress overview, long empty approach,
  ornamental switchback, sprawling terrace field, false exit, UI, label, or filler
  clutter.

The three refinement prompts tightened the center to about 10 × 14 cells, capped stair
runs at four cells, required any core threshold to be reachable in roughly one or two
turns, and explicitly removed broad foreground.

Adam's additional binding words were included verbatim:

> "ok, so what i have learned here, is that the largest maps are a good bit too large. which makes me realized I am faced with a problem, one of the things I was hoping i could avoid in this game are big maps where players would have to walk around a lot. Honestly in RPGs walking is a total bore most of the time. Like it's fun the first time through but if you ever have to backtrack a single second it is instantly a total drag. which is why I was just hoping for vignettes rather than big sprawling XCOM battlemaps, even the biggest FFT battlemaps are pretty small."

> "can i get some replacement renders? and can you mark the extra large map renders as not a goal? i really loved some of the height depth, but i think we can still achieve some of that in a smaller vignette"

### Selected compact scene briefs

- **Site 2:** fire-centered customary camp knot immediately under a short
  reverse-slope watch ridge, with shelter, stores, water/service, and clipped lanes.
- **Site 3:** dead-wing crypt breach stacking the retained twelve-sarcophagus crypt,
  collapse landing, and sealed institutional threshold.
- **Site 4:** only the processional head threshold: arrival terrace, communal
  porch/work landing, upper archive/shrine door, short alternate service climb, and
  retaining/cistern depth.
- **Site 5:** shaft head, working landing, active face, and lower sump/pump pocket
  concentrated around one hoist.
- **Site 8:** operator landing, creditor pay/store window, and civic export scale
  overlapping at one inherited weighbridge threshold.
- **Site 9:** one inboard contested wall-stair window with a tiny court, short paired
  accesses, clipped tower-door ends, and exterior cutaway drop.
- **Site 10:** market scale, exchange frontage, upper counting balcony, and lower
  delivery undercroft touching one compact intersection.
- **Site 11:** one inherited hall bay whose colossal portal, wall thickness, human
  passage, short ledge access, and broken giant ramp carry the scale.
- **Site 12:** one curved dorsal-market knot with tithe gangway, lee stalls, fast rim,
  scar bypass, inspection platform, and sea/substrate drop.

All 27 calls used the shared contract below plus the named scene brief. References were
passed in the order listed for each image.

## Shared rendering contract

- One brand-new map, not an edit or triptych.
- Elevated fixed three-quarter orthographic camera; the full compact tactical board is
  visible.
- Real square 5-foot grid ownership even when lines are subtle.
- Natural terrain is continuous, folded, and cell-spanning, with changing-angle
  surfaces. Constructed curbs, retaining, floors, and steps appear only at causal built
  breaks.
- Routes, doors, stairs, landings, deck access, and exits are collision-honest. No
  background shape may imply a false route or destination.
- Low-poly FFT-like map construction; few broad material families; modest plausible
  Three.js density; strong height silhouettes; ambient occlusion, contact shadows, and
  cast shadows.
- Crisp fantasy pixel standees on shallow natural plinths.
- Lore-native practical lights only.
- Most furnishing remains narrative. Only tactically necessary large props appear.
- No UI, captions, legends, split screen, photorealism, smooth miniature realism, dense
  prop clutter, or scenic panorama.

Adam's binding words were included verbatim in every call:

> "ok, well remember we are expressing these things in the very low poly language of the FFT map construction. So can you make that translation?"

> "for now, we are going to keep the majority of furnishings narrative, the DM can talk about them, they can affect the scene and the world, but they are essentially imaginary until we can prove the architectural soundness and tactical juiciness of the scene itself"

> "ok, i have some feedback on those images already, because generally everything should be built on our grid system. that looks like a bespoke graphic, not a procedurally generated scene basic on a real grid and a real roll. Now these screens can be built from nodes, or vector art overlaying some biome art that we generate for background images, but we aren't going to be able to generate bespoke imagery per travel choice by pre-alpha. that might be it's own module later once image gen or if image gen becomes cheaper and faster"

## Primary terrain reference

Every call used
`source-references/current-terrain-engine-two-tray-reference.png` as reference image 1.
The prompt explicitly borrowed its continuous folded ground, embedded routes, sparse
causal rock break, and character-to-cell scale—not its gray material or two-board
comparison composition.

## Site 2 — Camp / Service

### Small — Roadside Sleep-and-Fire Stop

Roughly 13 × 15 cells beside, never astride, a traveled road. One fire-centered social
void, bell/cone shelter, low open-span shelter, carrier/load, water, downwind waste, and
clear route out. A terrain-owned root-lifted hummock creates an observation position
and sheltered undercut approach. Temporary only.

References: approved `camp/01-traveling-household-clearing.png`;
`Camp-Service-Study-0727/images/CS-05-fort-lawton-bell-tent-mule-shed-1900.jpeg`.

### Medium — Borrowed-Clearing Camp

Roughly 22 × 24 cells. Golden Seed with exactly three different legal shelter
footprints, inward social center, wagon/store edge, distinct water/service/waste
destinations, two road thresholds, and a terrain-owned compound hill shoulder with
long/short flanks and saddle.

References: approved `camp/01-traveling-household-clearing.png`;
`source-references/camp-anchor-sketch.png`.

### Archived extra-large overview — NOT A GOAL — Customary / Organized Camp

Roughly 34 × 38 cells. Several household/crew clusters around a large quiet central
ground, repeated-use traces, separated service lanes, portable watch platform and
marked entry without permanent fortification. Natural reverse-slope ridge and sunken
runoff lane provide the terrain play.

References: approved `camp/02-rainy-military-bivouac.png`;
`Camp-Service-Study-0727/images/CS-05-fort-lawton-bell-tent-mule-shed-1900.jpeg`.

## Site 3 — Dormant

### Small — Stopped Guard Shelter

Roughly 14 × 16 cells. A roadside toll/watch shelter stopped by a storm-lifted roof and
slumped bank. Main door deliberately sealed, broken side opening risky, rubble cone
beneath its source, runoff-side approach, and two road exits.

References: approved `guard-post/03-reoccupied-woodland-threshold.png`;
`Dormant-Abandoned-Study-0727/images/D1-01-roofless-croft-lyndale.jpg`.

### Medium — Sunken Estate

Roughly 22 × 24 cells. `DA-SEED-01`: upper domestic estate at D2–D3, lower rooms
preserved at D0 beneath a flat flood datum, central drawdown wheel/sluice, drowned
service route, collapse ramp, and causal drainage failure.

References: approved `urban/02-fire-recovery-curfew-market.png`;
`Dormant-Abandoned-Study-0727/images/D5-02-submerged-village-curdi.jpg`.

### Archived extra-large overview — NOT A GOAL — Dead Institutional Wing

Roughly 32 × 36 cells. Two-court communal host with one D2–D3 dead wing, source-linked
collapse, sealed former shortcut, damp unused vegetation, maintained approach, and a
recent intruder route. Cutaway crypt retains roll `RC-DORMANT-01`: twelve sarcophagi in
two tiers, charnel alcove, one mortar-sealed and one freshly tampered.

References: approved `monastery/02-stacked-high-mountain-commune.png`;
`Dormant-Abandoned-Study-0727/images/D2-01-trees-in-chancel-st-nicholas.jpg`.

## Site 4 — Monastery / Commune

### Small — Communal House

Roughly 15 × 17 cells. Bounded work yard, shared hall, communal sleeping range,
service edge, modest ritual/council head, direct guest route, eave route, work bypass,
broad stair, and separate downhill service exit.

References: approved `monastery/01-level-wrapped-court.png`;
`Monastery-Study-0727/images/M4-05-hancock-shaker-brick-dwelling.jpg`.

### Medium — Level Wrapped Court

Roughly 24 × 26 cells. Golden Seed with spur approach, centered low gate, level quiet
court, repeated arcade, shared hall/dormitory ranges, low service work, library over
walk, broad processional stair, reachable head platform, and separate service exit.

References: approved `monastery/01-level-wrapped-court.png`;
`source-references/monastery-exemplary-seed.png`.

### Archived extra-large overview — NOT A GOAL — Filtered Processional Campus

Roughly 36 × 40 cells. Proposed admitted alternative of separate halls on three linked
benches: guest/receiving, commons, and upper ritual/teaching head. Two filters, broad
processional stairs, quieter service climb, reverse-slope hollow, and quiet ground.

References: approved `monastery/02-stacked-high-mountain-commune.png`;
`Monastery-Study-0727/images/M4-04-eiheiji-zen-monastery.jpg`.

## Site 5 — Mine / Workshop

### Small — Prospect and Repair Shed

Roughly 14 × 16 cells. Shallow cut/adit, promising seam, causal spoil destination,
temporary tool/repair shelter, broad cart approach, narrow observation/escape manway,
and runoff control. No mature mine machinery.

References: approved `mine/01-strained-drift-flooded-lower-branch.png`;
`Mine-Workshop-Study-0727/images/MW-09-lulu-portal-interior.jpg`.

### Medium — Strained Drift

Roughly 24 × 28 cells. Current first-build seed: daylight portal, active upper face,
repeated supports, broad haul ramp, separate manway/air loop, sorting/repair, stock,
spoil, export, lower branch flooding on a flat datum, visible failing pump/discharge,
and last-safe support.

References: approved `mine/01-strained-drift-flooded-lower-branch.png`;
`source-references/mine-first-build-plan.png`.

### Archived extra-large overview — NOT A GOAL — Shaft and Level Complex

Roughly 36 × 40 cells. Central headframe/hoist and three distinct levels; separate haul,
manway/air, pump/discharge, landing, face, retreat, surface sorting, stock, spoil, and
export relationships. Large bodies use haul ground but not every manway.

References: approved `mine/02-inclined-shaft-level-complex.png`;
`Mine-Workshop-Study-0727/images/MW-08-dickson-hoisting-engine-1904.jpg`.

## Site 8 — Layered Control

### Small — Hospitality Threshold

Roughly 14 × 16 cells. Golden Seed LC-2: proprietor owns public/service spaces; second
claimant owns one back room, deliveries, and private introductions. Existing host
geometry only; claim state appears through compatible seals, paint, keys, wear, lamp
ownership, and double-marked crates.

References: approved `urban/01-market-hall-town-slice.png`;
`Layered-Control-Study-0727/images/lc1-durham-sanctuary-knocker.jpg`.

### Medium — Mine Pay / Store Split

Roughly 24 × 28 cells. Operator owns portal/face/supports/haul. Second claimant owns pay
cage, store, credit, and delivery threshold. Shared weighing fixture is double-marked;
permissions change risk without changing the walk grid.

References: approved `mine/01-strained-drift-flooded-lower-branch.png`;
`Layered-Control-Study-0727/images/lc8-koppers-company-store.jpg`.

### Archived extra-large overview — NOT A GOAL — Distributed Works Claims

Roughly 36 × 40 cells. Extraction/processing host with operator, credit/supply, and
civic/export domains. Boundaries follow host thresholds, work surfaces, and wear;
shared weighbridge, water, and lamp line carry multiple marks. It reads first as a
working site, second as layered ownership.

References: approved `mine/02-inclined-shaft-level-complex.png`;
`Layered-Control-Study-0727/images/lc4-steelyard-london-1600s.jpg`.

## Site 9 — Contested Fortress

### Small — Rising Gate Window

Roughly 18 × 22 cells. One gate mass, rising turning approach, divided ditch/moat,
narrow causeway, two sequential barriers, control gallery, legal stair, taller
camera-far gatehouse, flank masses, quiet approach, and one breached-ditch scramble.

References: approved `guard-post/01-institutional-frontier-shoulder-overlook.png`;
`Contested-Fortress-Study-0727/images/b4-rasnov-barbican.jpg`.

### Medium — Contested Wall Segment

Roughly 26 × 32 cells. Golden Seed wall between two towers with outside open terrain and
inside linear court on the same geometry. Continuous wall-walk has two accesses and one
chokepoint. Different holders occupy opposite ends; breached ditch/rampart and
reverse-slope hollow create the exterior contest.

References: approved `guard-post/01-institutional-frontier-shoulder-overlook.png`;
`Contested-Fortress-Study-0727/images/c2-brouage-rampart-chemin-de-ronde.jpg`.

### Archived extra-large overview — NOT A GOAL — Colonized Thorngate Works

Roughly 40 × 46 cells. Live Thorngate roll: oversized border works with outer ditch-bank
and inner wall/ward, offset gates, rival-held outer line, active inner garrison, sparse
civilian quarter in the old killing ground, and quiet unused ground as the largest
plate.

References: approved `urban/02-fire-recovery-curfew-market.png`;
`Contested-Fortress-Study-0727/images/a2-caerphilly-aerial.jpg`.

## Site 10 — Urban Institution

### Small — Open-Flank Frontage

Roughly 14 × 18 cells. Two owned frontage bays, one open and one closed
shutter-counter state, two street ends, open work-yard flank, exterior upper gallery,
delivery/waste route, and a causal town-edge retaining/drainage break.

References: approved `urban/01-market-hall-town-slice.png`;
`Urban-Institution-Study-0727/images/UI-01-horsham-shop-mid-erection-1985.jpg`.

### Medium — Market-Hall Slice

Roughly 26 × 30 cells. Golden Seed with two street ends, open-post hall splitting the
public ground, attached fountain, owned shuttered frontage, public apron, distinct
service edge, and legal upper gallery/roofline deck.

References: approved `urban/01-market-hall-town-slice.png`;
`source-references/urban-market-hall-seed.png`.

### Archived extra-large overview — NOT A GOAL — Market / Exchange District

Roughly 40 × 44 cells. Proposed `BF-MARKET-EXCHANGE-01` deterministic roll:
`ME-CH-04` court-and-arcade market, `MH-AR-01` daily provisions, `ME-ST-03`
clearing/closure, `MH-SC-02` conflicting legal weights, and grounded old pitch marks.
Includes separately reached upper exchange/civic range without replacing the public
market ground.

References: approved `urban/03-hillside-stair-street-roof-market.png`;
`Urban-Institution-Study-0727/images/UI-04-sukiennice-arcades-krakow.jpg`.

## Site 11 — Mixed Scale

### Small — Petrified Dragon

Roughly 18 × 22 cells. Live wilderness-feature roll 256, “Petrified Dragon — Wings form
ramps, mouth forms a cave.” One wing ramp, broken wing underpass/rubble escape, mouth
cave, human squeeze, ordinary door-scale witness, and reachable doughnut playfield.

References: approved `lair/01-walk-in-karst-chamber.png`;
`Mixed-Scale-Study-0727/images/MS-07-bragar-whalebone-arch.jpg`.

### Medium — Working Beast Bays

Roughly 26 × 32 cells. Golden Seed with four Huge bays, broad creature apertures,
one-cell keeper apertures, continuous back passage, one occupied bay, tethers, feed,
water, muck, broad yard/load gate, human service landing, and explicit ordinary/Huge
scale references.

References: approved `mine/02-inclined-shaft-level-complex.png`;
`Mixed-Scale-Study-0727/images/MS-03-hampi-elephant-stables-panorama.jpg`.

### Archived extra-large overview — NOT A GOAL — Inherited Hall

Roughly 40 × 44 cells. Colossal older hall with few enormous masonry runs, Huge portals,
camera-far tall piers, human passages threaded through wall thickness, small doors
beside Huge gates, service rooms nested under giant platforms, high reachable deck, and
terraced bluff approach.

References: approved `monastery/02-stacked-high-mountain-commune.png`;
`Mixed-Scale-Study-0727/images/MS-01-tiryns-gallery.jpg`.

## Site 12 — Substrate

### Small — Bog Crossing

Roughly 15 × 18 cells. Trusted plank spine across quaking mat, firm bank, dry knoll,
stakes/anchors, maintained marker, clearly invalid broken branch, load-sensitive sag,
and a slumped-bank alternate crossing.

References: approved `guard-post/03-reoccupied-woodland-threshold.png`;
`Anomalous-Living-Mobile-Study-0727/images/S12-A4-quaking-bog-floating-mat.jpg`.

### Medium — Raft Quarter

Roughly 26 × 30 cells. `SUB-RAFT-01`: six pontoon decks and raft mill on rising river,
stake/pier field, removable plank spines, one public gangway, real mill-wheel current
gap, one parted raft still on a piling, visible water datum/undersides/support forest,
and load-sensitive trim.

References: approved `prison/03-shimmering-maw-suspended-ironwood-cell.png`;
`Anomalous-Living-Mobile-Study-0727/images/S12-B1-ship-mill-rackeve.jpg`.

### Archived extra-large overview — NOT A GOAL — Dorsal Market

Roughly 38 × 44 cells. Retained roll `RC-SUBSTRATE-02`: curved living host with slow
lee, fast exposed point, rim, scars, breathing grade change, tithe gate, stable gangway,
anchored lee arcade, delivery of a patron's eye to Tithe-Keepers, strangers under
cartel-tightened trade, contested scar bypass, and honest water/fall surround.

References: approved `urban/01-market-hall-town-slice.png`;
`Anomalous-Living-Mobile-Study-0727/images/S12-C2-barnacled-humpback-back.jpg`.
