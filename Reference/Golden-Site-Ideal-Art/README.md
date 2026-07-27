# Genesis ideal level-art targets

Status: **visual direction / build target — not runtime proof**

These images define an achievable modern successor to classic isometric tactical-RPG
maps for Genesis. They are deliberately smaller, cleaner, and more modular than a
cinematic CRPG environment.

ImageGen used the accepted site specifications, binding plan/section diagrams, the
current clay-room camera and geometry, and the project's sprite/base tests as
references. The renders should guide scene composition, asset-kit priorities, palette,
lighting, and condition-state work. They do not claim that every pictured object
already exists as a production asset.

## Shared visual grammar

- Fixed elevated orthographic three-quarter camera.
- Compact, board-like site slice rather than a landscape panorama.
- Chunky modular geometry with 5-foot proportions implied by construction, never by a
  permanently visible grid.
- A few broad material and color families per map; texture supports the shapes instead
  of replacing them.
- 3D environments with small, crisp 2D character sprites and shallow natural standee
  bases.
- Strong height silhouettes, ambient occlusion, contact shadows, and honest sprite/
  environment cast shadows.
- Readable shadow values without unowned fill lamps.
- Lore-native practical lights only. Warm and cool pools may overlap when their actual
  sources and tasks justify it.
- Routes, objectives, cover, landings, and exits must remain readable at contact-sheet
  scale.
- No asset density that a small Three.js production cannot plausibly build, repeat, and
  maintain.

## Rolled world-context amendment — 2026-07-25

`../../docs/GOLDEN-SITE-WORLD-CONTEXT-PROJECTION.md` now makes the world around the
playfield part of the Golden Site target. Exterior sites should project retained
setting, material, terrain, adjacency, elevation, time, weather, and current-state rolls
into an honest portal/support apron and near/mid/far background field.

Most images in this packet predate that contract. Their neutral studio/void backgrounds
remain useful for studying the site chassis, but they are not automatically the finished
exterior target. The Shimmering Maw prison is the clearest positive example: suspended
settlement fragments, chains, ironwood supports, and the fused-glass crater carry real
rolled context beyond the playable floor.

Future context revisions must preserve the existing site geometry and must not paint
false routes, actors, interactables, destinations, state, or secrets. Reusable
background plates and context cards are derived from real roll tags; they are not
bespoke runtime images per seed.

The first Guard Post render is the style calibration image:
[modern-FFT style proof](style-calibration/guard-post-modern-fft-proof.png).

## The 21 targets

### Guard Post

![Guard Post variations](contact-sheets/guard-post-variations.png)

1. [Institutional Frontier Shoulder Overlook](guard-post/01-institutional-frontier-shoulder-overlook.png)
2. [Upland Vernacular Rain Station](guard-post/02-upland-vernacular-rain-station.png)
3. [Reoccupied Woodland Threshold](guard-post/03-reoccupied-woodland-threshold.png)

All three preserve the checkpoint, terrain flank, and reachable defensive deck while
changing culture, construction, weather, light ownership, and operating history.

### Camp / Service

![Camp variations](contact-sheets/camp-variations.png)

1. [Traveling Household Clearing](camp/01-traveling-household-clearing.png)
2. [Rainy Military Bivouac](camp/02-rainy-military-bivouac.png)
3. [Rooted Desert Waystation](camp/03-rooted-desert-waystation.png)

Tent shape is cultural construction, not decoration. The household, military, and
desert-service expressions use different shelter profiles and organization while
retaining route tangent, claimed center, shelter seams, stores, service, and terrain
high ground.

### Monastery / Commune

![Monastery variations](contact-sheets/monastery-variations.png)

1. [Level Wrapped Court](monastery/01-level-wrapped-court.png)
2. [Stacked High-Mountain Commune](monastery/02-stacked-high-mountain-commune.png)
3. [Red-Cliff Archive Commune](monastery/03-red-cliff-archive-commune.png)

These test the level court, stacked terrace, and terrain-face postures without losing
formal arrival, common space, covered lateral movement, service access, knowledge/
water objectives, and a reachable authority deck.

### Mine / Workshop

![Mine variations](contact-sheets/mine-variations.png)

1. [Strained Drift with Flooded Lower Branch](mine/01-strained-drift-flooded-lower-branch.png)
2. [Inclined Shaft and Level Complex](mine/02-inclined-shaft-level-complex.png)
3. [Terraced Glowstone Open Cut](mine/03-terraced-glowstone-open-cut.png)

The same compact industrial vocabulary—rock cuts, supports, carts, stairs, water,
pumps, hoists, and task lights—supports horizontal, vertical, and open-cut strategies.

### Natural Lair

![Lair variations](contact-sheets/lair-variations.png)

1. [Walk-In Karst Chamber](lair/01-walk-in-karst-chamber.png)
2. [Body-Authored Root Burrow](lair/02-body-authored-root-burrow.png)
3. [Adopted Feral Mine](lair/03-adopted-feral-mine.png)

The origin explains the route network and the deck: geological shelf, excavator-made
root ledge, or inherited industrial platform. Darkness remains readable without
inventing practical lights.

### Urban Institution

![Urban variations](contact-sheets/urban-variations.png)

1. [Market-Hall Town Slice](urban/01-market-hall-town-slice.png)
2. [Fire-Recovery Market under Curfew](urban/02-fire-recovery-curfew-market.png)
3. [Hillside Stair-Street and Roof Market](urban/03-hillside-stair-street-roof-market.png)

These preserve two street continuations, owned frontage, public center, institution,
upper urban route, and service consequences across an ordinary market, a live recovery
state, and a terrain/culture-owned stair street.

### Prison / Custody

![Prison variations](contact-sheets/prison-variations.png)

1. [Slate-Roof Keeper-House Civic Jail](prison/01-slate-roof-keeper-house-civic-jail.png)
2. [Thorngate Ledger-and-Shift Civic Jail](prison/02-thorngate-ledger-and-shift-civic-jail.png)
3. [Shimmering Maw Suspended Ironwood Cell](prison/03-shimmering-maw-suspended-ironwood-cell.png)

The first pair holds four-cell capacity and camera intent constant while changing the
institutional layout, not merely the palette. The third is a fresh deterministic
reconstruction of the retained suspended-cell composition. Its seed independently
reaches The Shimmering Maw, Living Ironwood, The jailhouse, and a hanging cage through
the current ordinary roller calls; it is not mislabeled as the unavailable original
save. See the [roll receipts and prompt notes](prison/README.md).

## Native procedural decay

Decay should be a record of events acting on a clean site, not a random grunge pass.
The generator should first construct a working place and then apply a chronological
condition stack.

### Inputs

1. **Material response:** stone, plaster, timber, fabric, earth, metal, and vegetation
   react differently.
2. **Water and exposure:** rainfall direction, roof runoff, drains, seep sources,
   standing water, sun, wind, and sheltered faces.
3. **Structure and load:** foundations, supports, spans, retaining pressure, moving
   machinery, roots, and creature forces.
4. **Use graph:** public traffic, carts, animals, hands, doors, workstations, service
   routes, and inactive pockets.
5. **Occupancy and maintenance:** who still sweeps, patches, pumps, braces, clears,
   paints, replaces, or ignores each system.
6. **Event history:** fire, flood, siege, collapse, root growth, faction seizure,
   abandonment, reoccupation, and repair in a known order.
7. **Elapsed time and climate:** controls how far each event propagates and which traces
   survive later use.

### Causal rules

- Water marks begin at a source and continue downhill; they do not appear uniformly.
- Structural cracks follow stress and support failure; collapse debris sits below a
  plausible source.
- Traffic polishes, compacts, ruts, or clears the routes people and cargo actually use.
- Sun fades exposed fabric and paint; sheltered material retains more color.
- Soot rises from fire and heat damage weakens nearby material before distant material.
- Moss and volunteer growth prefer damp, protected, unused surfaces.
- Rot begins at wet timber feet, trapped joints, or failed caps.
- Creature damage follows body height, movement direction, reach, and repeated routes.
- Repair is an overlay with its own age: sister braces, paler mortar, replacement
  modules, patches, caps, drains, and cleared working space.
- Active sites are unevenly worn but maintained. Uniform ruin belongs only to a
  specifically justified dormant history.

### Recommended runtime representation

Store condition as facts on semantic assemblies, not as one `decayAmount` value:

```text
assembly
  material and construction
  exposure fields
  traffic/use intensity
  structural stress
  water source and flow
  occupancy/maintenance owner
  ordered damage and repair events
  current geometry state
  current surface masks and trace props
```

Each modular asset should support a small state family such as:

```text
intact → worn → chipped/cracked → displaced → failed
                         ↘ braced / patched / capped / replaced
```

The visible result can then combine:

- geometry swaps for breaks, displacement, missing pieces, deformation, and repairs;
- shader masks for wetness, soot, mineral bloom, fading, polish, and moss;
- a small decal library for localized stains, cracks, tool marks, and authority/history
  marks;
- generated trace props such as rubble, silt, braces, patches, cleared spoil, salvage,
  or nest material; and
- vegetation placement constrained by moisture, shelter, light, and traffic.

### Generation order

1. Build and validate the clean playable site.
2. Derive water flow, exposure, stress, traffic, and maintenance fields.
3. Roll or author a short ordered history.
4. Propagate each event through the relevant fields.
5. Select geometry states, surface masks, and trace props.
6. Apply later repairs and current maintenance.
7. Re-run collision, route, standee, fixed-camera, lighting, and gameplay validation.

This lets one asset kit create maintained, strained, damaged, repaired, abandoned, and
reoccupied places without importing a bespoke decayed 3D model for every result.

## Rejected direction

The earlier high-detail cinematic-CRPG attempts were discarded. They are explicitly not
target art.
