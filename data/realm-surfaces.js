/* GENESIS DATA (generated) — data/realm-surfaces.js
   REALM-SURFACES-WIRING.md §1 — per-realm floor surface vocabulary (docs/REALM-SURFACES-DRAFT.md's
   88-surface draft): REALM_SURFACES[realmId] = [{name,base,tint,baseTint,where,summary}], 8 entries
   per realm across the 11 realms (data/realms.js). `base` is a real src/ui/theater-boot.js
   FLOOR_MATERIAL_RECIPES key (validated at generation time by build/gen-realm-surfaces.py — never
   hand-copied); `where` is interior|exterior|any; `baseTint` is the surface's authored '#rrggbb'
   floor color (Adam 2026-07-08 — the §3 decision-2 tint funnel: theaterApplySurfaceTint reads it,
   floor tiles carry it instead of the generic env grays). Consumed by theaterFloorMaterial's
   opts.realms seam (src/engine/theater-data.js) to pick a breach room's floor from its active realm
   instead of the generic 12-material pool. GENERATED from dev/model-qa/realm-surfaces.json — never
   hand-edit; edit the source json + re-run `python3 build/gen-realm-surfaces.py`. Added 2026-07-04.
   Classic <script> (shared global scope); defines REALM_SURFACES. */
const REALM_SURFACES={
 "frontier": [
  {
   "name": "Saloon Boards",
   "base": "plank",
   "tint": "dusty amber, whiskey-stained dark rings around table legs",
   "baseTint": "#b5762c",
   "where": "interior",
   "summary": "warped amber floorboards scuffed by boot heels and spilled drink"
  },
  {
   "name": "Main Street Mud",
   "base": "mud",
   "tint": "sun-baked ochre cracking to wet grey-brown ruts",
   "baseTint": "#9c6830",
   "where": "exterior",
   "summary": "wheel-rutted street mud baked hard at the edges, wet in the middle"
  },
  {
   "name": "Boot Hill Clay",
   "base": "cracked-earth",
   "tint": "grave-dark red clay, bone-pale where sun-bleached",
   "baseTint": "#a84a2c",
   "where": "exterior",
   "summary": "cracked graveyard clay dotted with sun-bleached patches and old mounds"
  },
  {
   "name": "Desert Flats",
   "base": "sand",
   "tint": "bleached tan shifting to rust-red under harsh noon light",
   "baseTint": "#dca058",
   "where": "exterior",
   "summary": "windblown tan sand rippled into dunes with rust-colored mineral streaks"
  },
  {
   "name": "Shaft Timber Deck",
   "base": "plank",
   "tint": "soot-black creosote over raw pine, silvered where worn",
   "baseTint": "#6e4a24",
   "where": "interior",
   "summary": "creosote-blackened mine timbers polished silver by cart wheels"
  },
  {
   "name": "Tunnel Rock",
   "base": "cave-rock",
   "tint": "iron-ochre stone streaked with coal-black seams",
   "baseTint": "#b05628",
   "where": "interior",
   "summary": "rough-blasted tunnel stone veined with dark coal and iron rust"
  },
  {
   "name": "Scrubland Scree",
   "base": "scree",
   "tint": "sun-grey gravel with dried-blood rust flecks",
   "baseTint": "#ac7a44",
   "where": "exterior",
   "summary": "loose sun-grey shale scattered with rust-red mineral chips"
  },
  {
   "name": "Rail Cinder Bed",
   "base": "ash",
   "tint": "soot-black clinker fading to grey ballast dust",
   "baseTint": "#5e4834",
   "where": "exterior",
   "summary": "packed cinder and clinker ballast dusted with soot-grey ash"
  }
 ],
 "chrome": [
  {
   "name": "Corridor Composite",
   "base": "flagstone",
   "tint": "cold institutional grey with faint blue-white undercast",
   "baseTint": "#5a7288",
   "where": "interior",
   "summary": "seamed panel flooring under sterile fluorescent-cold light"
  },
  {
   "name": "Grated Decking",
   "base": "grating",
   "tint": "gunmetal grey with oxidized amber bleed at rivets",
   "baseTint": "#4e5a6a",
   "where": "interior",
   "summary": "perforated metal walkway plates over open machinery space"
  },
  {
   "name": "Server Tile",
   "base": "flagstone",
   "tint": "cold sterile grey-white with faint cyan status-light wash",
   "baseTint": "#7cacbc",
   "where": "interior",
   "summary": "raised anti-static floor tiles humming under cable racks"
  },
  {
   "name": "Hull Plate",
   "base": "cave-rock",
   "tint": "dull dark steel with dried-blood rust streaking",
   "baseTint": "#7a5038",
   "where": "any",
   "summary": "riveted armor plating dented and rust-streaked from impacts"
  },
  {
   "name": "Reactor Grate",
   "base": "scree",
   "tint": "scorched charcoal with molten-orange heat-glow undertone",
   "baseTint": "#8a4620",
   "where": "interior",
   "summary": "loose heat-warped grating rattling above the glowing core"
  },
  {
   "name": "Coolant Sludge",
   "base": "mud",
   "tint": "toxic teal-green with oily chemical sheen",
   "baseTint": "#2c8a78",
   "where": "any",
   "summary": "chemical runoff pooling in cracked containment channels"
  },
  {
   "name": "Vented Ash-Fall",
   "base": "ash",
   "tint": "pale industrial grey dusted with fine particulate soot",
   "baseTint": "#8a949c",
   "where": "exterior",
   "summary": "fine particulate ash drifting from exterior exhaust vents"
  },
  {
   "name": "Frost-Locked Hull",
   "base": "snow-ice",
   "tint": "pale blue-white rime over dull metal",
   "baseTint": "#9cbcd2",
   "where": "exterior",
   "summary": "frozen condensation rime crusting over exposed cold metal"
  }
 ],
 "noir": [
  {
   "name": "Rainslick Blacktop",
   "base": "cobble",
   "tint": "wet oil-black with rain-glare highlights",
   "baseTint": "#32383e",
   "where": "exterior",
   "summary": "puddled cobble street slicked black under streetlamp glare"
  },
  {
   "name": "Gutter Grime",
   "base": "mud",
   "tint": "soot-grey run-off with oily sheen",
   "baseTint": "#4c4a42",
   "where": "exterior",
   "summary": "trash-slick alley muck pooled between brick and dumpsters"
  },
  {
   "name": "Precinct Linoleum",
   "base": "flagstone",
   "tint": "institutional pea-green, scuffed to grey",
   "baseTint": "#6c7256",
   "where": "interior",
   "summary": "waxed office linoleum worn dull under fluorescent tube light"
  },
  {
   "name": "Warehouse Dust",
   "base": "ash",
   "tint": "pale concrete-grey with settled dust film",
   "baseTint": "#86847c",
   "where": "interior",
   "summary": "dusty poured-concrete floor cut by long crate shadows"
  },
  {
   "name": "Pier Planking",
   "base": "plank",
   "tint": "tar-black weathered timber, brine-bleached edges",
   "baseTint": "#4c453c",
   "where": "exterior",
   "summary": "salt-warped dockside boards slick with harbor spray"
  },
  {
   "name": "Backroom Carpet",
   "base": "leaf-litter",
   "tint": "cigarette-stained maroon with matted pile",
   "baseTint": "#703a3e",
   "where": "interior",
   "summary": "threadbare maroon carpet crushed flat by decades of traffic"
  },
  {
   "name": "Fire-Escape Grating",
   "base": "grating",
   "tint": "cold gunmetal rust-streaked black",
   "baseTint": "#3c4248",
   "where": "exterior",
   "summary": "rusted steel grating underfoot on rain-slick rooftop crossings"
  },
  {
   "name": "Wet Asphalt Crossing",
   "base": "asphalt",
   "tint": "deep charcoal with faded chalk-white striping",
   "baseTint": "#33363b",
   "where": "exterior",
   "summary": "faded crosswalk stripes bleeding into rain-dark rolled asphalt"
  }
 ],
 "ash": [
  {
   "name": "Buckled Blacktop",
   "base": "flagstone",
   "tint": "sun-bleached charcoal with faded yellow lane-ghosts",
   "baseTint": "#6c6250",
   "where": "exterior",
   "summary": "heaved asphalt slabs, grout lines read as tar seams"
  },
  {
   "name": "Rubble Drift",
   "base": "scree",
   "tint": "ash-grey rock with rust-orange flecks",
   "baseTint": "#8e6844",
   "where": "exterior",
   "summary": "loose broken masonry and pebbled concrete chunks underfoot"
  },
  {
   "name": "Fallout Crust",
   "base": "cracked-earth",
   "tint": "sickly yellow-green over dead brown",
   "baseTint": "#948234",
   "where": "exterior",
   "summary": "baked toxic soil, branching cracks glow faint green in the grooves"
  },
  {
   "name": "Cinderfield",
   "base": "ash",
   "tint": "soot grey shading to bone white",
   "baseTint": "#8e867a",
   "where": "any",
   "summary": "fine drifting soot over a scorched even grey base"
  },
  {
   "name": "Scavenger Decking",
   "base": "plank",
   "tint": "weathered driftwood grey with rust-stain streaks",
   "baseTint": "#80644c",
   "where": "interior",
   "summary": "mismatched scrap planks nailed over rubble, seams patched crooked"
  },
  {
   "name": "Bunker Slab",
   "base": "cave-rock",
   "tint": "cold poured-concrete grey with damp dark pits",
   "baseTint": "#706c62",
   "where": "interior",
   "summary": "raw unfinished concrete, coarse and pitted, echo-cold"
  },
  {
   "name": "Grating Walk",
   "base": "grating",
   "tint": "oxidized rust-orange over dull gunmetal",
   "baseTint": "#a85628",
   "where": "any",
   "summary": "see-through metal grate decking, rusted and loose-bolted"
  },
  {
   "name": "Mudflat Sink",
   "base": "mud",
   "tint": "oil-black sludge with chemical sheen",
   "baseTint": "#4a4032",
   "where": "exterior",
   "summary": "toxic standing sludge pooled in low ground, glossy and foul"
  }
 ],
 "suburb": [
  {
   "name": "Manicured Turf",
   "base": "grass",
   "tint": "unnaturally uniform golf-green, chemical brightness",
   "baseTint": "#3e9e38",
   "where": "exterior",
   "summary": "Suspiciously perfect turf, mowed in identical stripes"
  },
  {
   "name": "Cul-de-Sac Blacktop",
   "base": "cobble",
   "tint": "faded charcoal asphalt with chalky seam-lines",
   "baseTint": "#56545c",
   "where": "exterior",
   "summary": "Seal-coated driveway asphalt, hairline cracks in cul-de-sac rings"
  },
  {
   "name": "Kitchen Linoleum",
   "base": "flagstone",
   "tint": "jaundiced beige-yellow, wax-shine gone dull",
   "baseTint": "#ccb266",
   "where": "interior",
   "summary": "Checkerboard linoleum tile, grout gone grease-dark"
  },
  {
   "name": "Wall-to-Wall Carpet",
   "base": "leaf-litter",
   "tint": "flattened mauve-beige with dark traffic-path staining",
   "baseTint": "#a2808a",
   "where": "interior",
   "summary": "Matted shag carpet, foot-worn paths and old stains"
  },
  {
   "name": "Unfinished Basement Slab",
   "base": "cracked-earth",
   "tint": "cold damp grey with rust-water bleed",
   "baseTint": "#74706a",
   "where": "interior",
   "summary": "Bare concrete slab, damp-stained hairline cracks"
  },
  {
   "name": "Vinyl Siding Fence-Line",
   "base": "plank",
   "tint": "bleached HOA-white gone chalky and mildewed",
   "baseTint": "#d6d2c4",
   "where": "exterior",
   "summary": "Vinyl-plank fencing, sun-bleached and mildew-freckled"
  },
  {
   "name": "Sprinkler-Slick Mudflat",
   "base": "mud",
   "tint": "over-saturated near-black loam, chemical sheen",
   "baseTint": "#48341c",
   "where": "exterior",
   "summary": "Waterlogged lawn edge, oily sprinkler runoff sheen"
  },
  {
   "name": "Attic Insulation Crawl",
   "base": "ash",
   "tint": "powder-pink fiberglass grey, dust-choked",
   "baseTint": "#c2909a",
   "where": "interior",
   "summary": "Fiberglass insulation dust over particleboard, itchy grey"
  }
 ],
 "cosmic": [
  {
   "name": "Wrong-Angle Flags",
   "base": "flagstone",
   "tint": "bruised violet-grey, mortar lines glowing faint cold white",
   "baseTint": "#6a5890",
   "where": "interior",
   "summary": "paving whose grout lines don't quite meet at corners"
  },
  {
   "name": "Star-Flecked Void-Floor",
   "base": "void-floor",
   "tint": "deep space-black shot through with white and faint blue-violet points",
   "baseTint": "#1c1832",
   "where": "exterior",
   "summary": "walking on open starfield; ground behaves like night sky"
  },
  {
   "name": "Drowned Reliquary Tile",
   "base": "flagstone",
   "tint": "algae-teal drowned grey, waterlogged dark seams",
   "baseTint": "#3a7c72",
   "where": "interior",
   "summary": "waterlogged temple tile, swollen and slick underfoot"
  },
  {
   "name": "Fractal Switchback Rock",
   "base": "cave-rock",
   "tint": "iridescent charcoal with oil-sheen color shifts",
   "baseTint": "#4c4460",
   "where": "any",
   "summary": "raw stone that repeats itself at the wrong scale"
  },
  {
   "name": "Ash of Collapsed Stars",
   "base": "ash",
   "tint": "pale cosmic grey with cold blue-white fleck",
   "baseTint": "#8c94ac",
   "where": "exterior",
   "summary": "fine soot-grey ash flecked with dying starlight"
  },
  {
   "name": "Warped Coral Scree",
   "base": "scree",
   "tint": "bone-pale lavender, faint bioluminescent edges",
   "baseTint": "#a892c2",
   "where": "exterior",
   "summary": "loose broken coral-rock catching a faint inner glow"
  },
  {
   "name": "Gravity-Slipped Planking",
   "base": "plank",
   "tint": "driftwood grey-violet, seams that don't line up straight",
   "baseTint": "#726280",
   "where": "interior",
   "summary": "boarding that seems to tilt though it reads level"
  },
  {
   "name": "Silt of the Drowned Deep",
   "base": "mud",
   "tint": "ink-black with faint phosphorescent glints",
   "baseTint": "#242e38",
   "where": "any",
   "summary": "glossy black silt that glimmers like sediment full of stars"
  }
 ],
 "theater": [
  {
   "name": "Trench Mire",
   "base": "mud",
   "tint": "cold slate-brown, rain-slicked dark",
   "baseTint": "#564838",
   "where": "exterior",
   "summary": "waterlogged trench bottom, boot-churned and glossy-dark"
  },
  {
   "name": "Duckboards",
   "base": "plank",
   "tint": "weathered grey-brown, algae-stained at the seams",
   "baseTint": "#706246",
   "where": "exterior",
   "summary": "slatted trench planking laid over the mud, split and slick"
  },
  {
   "name": "Cratered Waste",
   "base": "cracked-earth",
   "tint": "scorched ochre-grey, blast-pale",
   "baseTint": "#8c7450",
   "where": "exterior",
   "summary": "shell-pocked open ground, baked and fissured by bombardment"
  },
  {
   "name": "Shattered Cobble",
   "base": "cobble",
   "tint": "soot-grey stone, rust-red brick dust in the gaps",
   "baseTint": "#785848",
   "where": "any",
   "summary": "bomb-broken street cobbles, heaved and rubble-choked"
  },
  {
   "name": "Choked Undergrowth",
   "base": "leaf-litter",
   "tint": "sodden dark green-black, rot-flecked",
   "baseTint": "#3c4c2c",
   "where": "exterior",
   "summary": "dense rotting jungle floor, root-tangled and shell-torn"
  },
  {
   "name": "Ash-Field",
   "base": "ash",
   "tint": "bleached grey-white, ember-black flecking",
   "baseTint": "#968e7e",
   "where": "exterior",
   "summary": "cinder-blanketed ground from a burned battle line"
  },
  {
   "name": "Sandbag Line",
   "base": "scree",
   "tint": "dusty khaki-tan, torn burlap brown",
   "baseTint": "#a48a54",
   "where": "any",
   "summary": "collapsed sandbag fill, loose grit and burst-bag scatter"
  },
  {
   "name": "Grated Decking",
   "base": "grating",
   "tint": "gunmetal grey with rust-orange bleed",
   "baseTint": "#5e544e",
   "where": "interior",
   "summary": "riveted steel bunker flooring, rust-streaked and battle-scuffed"
  }
 ],
 "high-seas": [
  {
   "name": "Weather Deck Planking",
   "base": "plank",
   "tint": "salt-bleached grey-blond, tar-black seams",
   "baseTint": "#ccaa66",
   "where": "exterior",
   "summary": "sun-scoured deck boards, caulked seams, salt-crust grain"
  },
  {
   "name": "Berth Boards",
   "base": "plank",
   "tint": "tallow-yellow, oil-dark knots",
   "baseTint": "#ba8c3e",
   "where": "interior",
   "summary": "low-lit oiled boards, close-grained, lamp-soot darkened"
  },
  {
   "name": "Surf-Line Sand",
   "base": "sand",
   "tint": "wet slate-tan, foam-bleached edges",
   "baseTint": "#a89468",
   "where": "exterior",
   "summary": "packed wet sand, foam-rippled, dark where the surf drags"
  },
  {
   "name": "Dune Sand",
   "base": "sand",
   "tint": "pale bone-tan, dry and loose",
   "baseTint": "#e6cc8e",
   "where": "exterior",
   "summary": "loose dry sand, wind-rippled, sun-bleached pale"
  },
  {
   "name": "Harbor Cobble",
   "base": "cobble",
   "tint": "barnacle-grey, brine-stained dark at the joints",
   "baseTint": "#7c7866",
   "where": "exterior",
   "summary": "salt-slick harbor stone, algae-dark in the low spots"
  },
  {
   "name": "Tide-Pool Shelf",
   "base": "cave-rock",
   "tint": "kelp-green-black, wet obsidian sheen",
   "baseTint": "#28685a",
   "where": "exterior",
   "summary": "wave-carved rock shelf, slick with weed and standing pools"
  },
  {
   "name": "Ballast Bilge Boards",
   "base": "plank",
   "tint": "bilge-brown, waterlogged near-black",
   "baseTint": "#4c3c26",
   "where": "interior",
   "summary": "warped waterlogged planking over ballast stone, rot-dark"
  },
  {
   "name": "Wet Rope Matting",
   "base": "rope-matting",
   "tint": "hemp-brown, salt-whitened high spots",
   "baseTint": "#9c8252",
   "where": "exterior",
   "summary": "woven rope matting over gaps, stiff with dried salt"
  }
 ],
 "lost-world": [
  {
   "name": "Temple Flagstone",
   "base": "flagstone",
   "tint": "sun-bleached limestone with deep green-black moss staining in the seams",
   "baseTint": "#c4b48e",
   "where": "interior",
   "summary": "cut ceremonial stone, cracked and lichen-veined by age"
  },
  {
   "name": "Glyph Mosaic",
   "base": "flagstone",
   "tint": "faded terracotta, ochre, and verdigris tile fragments over dust-grey grout",
   "baseTint": "#b26a40",
   "where": "interior",
   "summary": "shattered inlaid tilework tracing half-worn ancient glyphs"
  },
  {
   "name": "Canopy Loam",
   "base": "leaf-litter",
   "tint": "wet black-brown humus flecked with rot-yellow leaf matter",
   "baseTint": "#4c3a20",
   "where": "exterior",
   "summary": "spongy decomposing jungle mulch underfoot, perpetually damp"
  },
  {
   "name": "Buried Colonnade Sand",
   "base": "sand",
   "tint": "bone-pale dune sand with buried rust-red stone grit mixed through",
   "baseTint": "#d2b480",
   "where": "exterior",
   "summary": "windblown sand drifted over sunken broken columns"
  },
  {
   "name": "Moss-Stone Terrace",
   "base": "cave-rock",
   "tint": "slick emerald-black moss over weathered grey-green stone",
   "baseTint": "#2e6c3a",
   "where": "exterior",
   "summary": "algae-slick ancient stonework reclaimed by creeping moss"
  },
  {
   "name": "Root-Cracked Earth",
   "base": "cracked-earth",
   "tint": "dry cracked clay-red soil laced with pale invasive root tendrils",
   "baseTint": "#aa5836",
   "where": "exterior",
   "summary": "parched cracked ground split apart by invasive jungle roots"
  },
  {
   "name": "Silt-Choked Channel",
   "base": "mud",
   "tint": "murky olive-brown silt with standing rain-slick pools",
   "baseTint": "#5e562e",
   "where": "any",
   "summary": "stagnant silted mud pooling through collapsed ruin channels"
  },
  {
   "name": "Vaulted Ash-Char",
   "base": "ash",
   "tint": "soot-grey char over blackened stone, faint ember-orange in cracks",
   "baseTint": "#584a40",
   "where": "interior",
   "summary": "scorched sanctum floor, ash-caked from ancient ritual fire"
  }
 ],
 "gloom": [
  {
   "name": "Rotwood Planking",
   "base": "plank",
   "tint": "bruised grey-brown, black at the seams",
   "baseTint": "#46543a",
   "where": "interior",
   "summary": "soft rotted boards, damp-swollen, dark at the joints"
  },
  {
   "name": "Grave Loam",
   "base": "cracked-earth",
   "tint": "grave-dark umber with a sickly green cast",
   "baseTint": "#3c5426",
   "where": "exterior",
   "summary": "disturbed grave earth, root-cracked, faintly sunken"
  },
  {
   "name": "Undercroft Stone",
   "base": "cave-rock",
   "tint": "cold wet slate, mildew-pale at the edges",
   "baseTint": "#2c5468",
   "where": "interior",
   "summary": "damp quarried stone, sweating walls, mildew bloom"
  },
  {
   "name": "Consecrated Flags",
   "base": "flagstone",
   "tint": "ash-grey stained rust-brown",
   "baseTint": "#614a30",
   "where": "any",
   "summary": "worn ritual flagstones, old blood ground into the seams"
  },
  {
   "name": "Web-Shrouded Tile",
   "base": "flagstone",
   "tint": "dust-pale grey under a grimy white haze",
   "baseTint": "#5e7a64",
   "where": "interior",
   "summary": "fine tile buried under cobweb dust and neglect"
  },
  {
   "name": "Charnel Ash",
   "base": "ash",
   "tint": "bone-white going to sooty black",
   "baseTint": "#807a66",
   "where": "any",
   "summary": "powdery bone-ash drift, scorched patches, brittle underfoot"
  },
  {
   "name": "Weeping Mudflat",
   "base": "mud",
   "tint": "black-brown, oil-slick sheen",
   "baseTint": "#24443a",
   "where": "exterior",
   "summary": "sucking black mud pooled around sunken graves"
  },
  {
   "name": "Bone Scree",
   "base": "scree",
   "tint": "yellowed bone-grey with dark grit",
   "baseTint": "#8c8058",
   "where": "exterior",
   "summary": "loose shattered bone and rubble underfoot, unstable"
  }
 ],
 "bright-kingdom": [
  {
   "name": "Sugar-Tile Checkerboard",
   "base": "flagstone",
   "tint": "candy-shell gloss over bone-white and cherry-red squares, grout gone tacky brown",
   "baseTint": "#e04444",
   "where": "interior",
   "summary": "glossy checkerboard flagstone, joints sticky with old syrup"
  },
  {
   "name": "Candy-Shell Cobble",
   "base": "cobble",
   "tint": "hard-lacquer reds and yellows, cracked to a dull grey-brown pulp beneath",
   "baseTint": "#e67e22",
   "where": "exterior",
   "summary": "cobbles cast as boiled candy, chipped to reveal stale nougat"
  },
  {
   "name": "Plush-Rot Carpet",
   "base": "leaf-litter",
   "tint": "faded nursery pastels gone mildew-grey at the pile roots",
   "baseTint": "#c286b2",
   "where": "interior",
   "summary": "matted plush carpet reskinned off leaf-litter's uneven organic drift"
  },
  {
   "name": "Painted Building-Block Floor",
   "base": "plank",
   "tint": "primary-color lacquer, chipped through to raw particleboard grey",
   "baseTint": "#2a7ad2",
   "where": "interior",
   "summary": "planking recast as oversized painted blocks, paint flaking at the seams"
  },
  {
   "name": "Sugar-Frost Ground",
   "base": "snow-ice",
   "tint": "powdered-sugar white gone waxy and grey where it's been walked flat",
   "baseTint": "#eedeee",
   "where": "exterior",
   "summary": "snow-ice reskinned as packed frosting, crusted and greying underfoot"
  },
  {
   "name": "Marzipan Scree",
   "base": "scree",
   "tint": "pale almond-tan rubble streaked with cracked pastel dye",
   "baseTint": "#e2ba86",
   "where": "exterior",
   "summary": "scree recast as shattered marzipan and candy debris, brittle underfoot"
  },
  {
   "name": "Licorice-Ash Yard",
   "base": "ash",
   "tint": "tar-black and dull char-grey, faint burnt-sugar sheen",
   "baseTint": "#3a2c36",
   "where": "exterior",
   "summary": "ash reframed as scorched licorice grit, sweetness gone acrid"
  },
  {
   "name": "Grated Gumdrop Decking",
   "base": "candy-tile",
   "tint": "jewel-tone gumdrop reds/greens/purples under a grime-dulled clear coat",
   "baseTint": "#34b246",
   "where": "any",
   "summary": "net-new hex-panel decking, candy-jewel color under grimed lacquer"
  }
 ]
};
