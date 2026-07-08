/* GENESIS DATA (generated) — data/realm-props.js
   REALM-PROPS-WIRING.md §1 — per-realm furniture/cover vocabulary (docs/REALM-PROPS-DRAFT.md's
   308-prop draft): REALM_PROPS[realmId] = [{name,size,cover,crossRealm,model,summary,part?,
   partParams?}], keyed to data/realms.js's REALM_IDS (the `all`/cross-realm-list props are
   authored ONCE and just tagged with which realms they're also eligible in — realmPropsFor
   below folds them into every requested realm's pool, never a literal per-realm copy).
   `model` is either an existing 'prop:<part>' WHOLE_OBJECT_REGISTRY key (derived from the
   draft's own `base` column, src/engine/theater-data.js's live part vocabulary) or a
   'net-new: <brief>' marker for REALM-MODELS-P3's queue — a missing net-new model NEVER blocks
   rendering (theater-boot.js's setBoard falls back to the part's generic cuboid, or a flat prop
   box; "never a hole" per §1). GENERATED from dev/model-qa/realm-props.json — never hand-edit;
   edit the source json + re-run `python3 build/gen-realm-props.py`. Added 2026-07-04.
   Classic <script> (shared global scope); defines REALM_PROPS + realmPropsFor(realms). */
const REALM_PROPS={
 "frontier": [
  {
   "name": "Long Bar",
   "size": "Large",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:table-slab",
   "summary": "long bartop slab, half cover along its run",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Hitching Rail",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "suburb"
   ],
   "model": "prop:pillar-broken",
   "summary": "low rail post, marker-sized half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Water Trough",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "lost-world"
   ],
   "model": "prop:basin-block",
   "summary": "raised tin trough, murky water, half cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Buckboard Wagon",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "lost-world"
   ],
   "model": "prop:cart",
   "summary": "overturned freight wagon, dominant three-quarters cover",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Gallows Frame",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:arch-frame",
   "summary": "timber gallows arch, ominous zone centerpiece",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Tumbleweed Drift",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "lost-world"
   ],
   "model": "net-new: a loose ball of dry dead brush, low and roll-able",
   "summary": "rolling brush ball, no cover, atmosphere only"
  },
  {
   "name": "Cactus Stand",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "spined saguaro cluster, half cover, chunk filler",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Powder Barrel",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "stout oak barrel, small marker half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Mine Cart",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "chrome",
    "lost-world"
   ],
   "model": "prop:cart",
   "summary": "derailed ore cart, half cover, chunk filler",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Boot Hill Marker",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "gloom",
    "lost-world"
   ],
   "model": "prop:pillar-broken",
   "summary": "crooked grave marker, no cover, zone flavor",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Wanted Board",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "noir",
    "suburb"
   ],
   "model": "prop:rubble-scatter",
   "summary": "papered bounty board, upright, no cover",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Assay Office Vault Door",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "noir",
    "chrome"
   ],
   "model": "prop:arch-frame",
   "summary": "blasted iron vault door, heavy three-quarters cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Windmill Frame",
   "size": "Huge",
   "cover": "full",
   "crossRealm": [
    "suburb",
    "ash"
   ],
   "model": "net-new: a tall skeletal windmill tower with a slow-turning fan",
   "summary": "tall windmill tower, dominates zone, full cover base"
  },
  {
   "name": "Saloon Piano",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "theater",
    "noir"
   ],
   "model": "prop:shrine-block",
   "summary": "battered upright piano, half cover, chunk filler",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Rain Barrel",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "swollen rain barrel, small half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Boardwalk Overhang",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "noir",
    "suburb"
   ],
   "model": "prop:arch-frame",
   "summary": "sagging boardwalk roof, half cover along the run",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Sheriff's Desk",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "noir"
   ],
   "model": "prop:table-slab",
   "summary": "cluttered lawman's desk, half cover, chunk filler",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Stagecoach Wreck",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "lost-world"
   ],
   "model": "prop:cart",
   "summary": "toppled stagecoach, dominant three-quarters cover",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Corral Fence",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "suburb"
   ],
   "model": "prop:rubble-scatter",
   "summary": "split-rail corral fence, half cover, chunk filler",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Mission Bell Tower",
   "size": "Huge",
   "cover": "three-quarters",
   "crossRealm": [
    "gloom",
    "lost-world"
   ],
   "model": "prop:pillar-broken",
   "summary": "crumbling bell tower, dominates zone, heavy cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Well Pump",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:well-shaft",
   "summary": "iron well pump, half cover, chunk filler",
   "part": "well-shaft",
   "partParams": {}
  },
  {
   "name": "Blacksmith Forge",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:candelabra",
   "summary": "dead smith's forge, half cover, chunk filler",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Prospector's Sluice",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "net-new: a long angled wooden trough on stilts for panning ore",
   "summary": "long angled sluice trough, half cover along its run"
  },
  {
   "name": "Storefront Facade",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "noir",
    "suburb"
   ],
   "model": "prop:arch-frame",
   "summary": "hollow false-front facade, heavy three-quarters cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Rattlesnake Den",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "lost-world",
    "gloom"
   ],
   "model": "prop:rubble-scatter",
   "summary": "rocky snake den, no cover, zone flavor",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Telegraph Pole",
   "size": "Medium",
   "cover": "none",
   "crossRealm": [
    "chrome",
    "suburb"
   ],
   "model": "prop:pillar-broken",
   "summary": "leaning wire pole, no cover, zone flavor",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Cattle Skull Pile",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "stacked longhorn skull cairn, half cover",
   "part": "rubble-scatter",
   "partParams": {
    "channel": "bone",
    "scale": 0.9
   }
  },
  {
   "name": "Stasis-Cage Wagon",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:cage-frame",
   "summary": "barred prisoner wagon, half cover, chunk filler",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Batwing Saloon Doors",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:arch-frame",
   "summary": "swinging saloon door-frame, half cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Frontier Water Tower",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "stilt-legged water tank tower, half cover at base",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Feed-Store Sack Pile",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "ash"
   ],
   "model": "prop:crate",
   "summary": "stacked burlap sacks, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "General-Store Porch Post",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "boardwalk support post, marker-sized half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Hay Bale Stack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "lost-world"
   ],
   "model": "prop:crate",
   "summary": "stacked hay bales, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Church Pew Bench",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:table-slab",
   "summary": "long timber pew, half cover",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Pot-Belly Stove",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "noir"
   ],
   "model": "prop:candelabra",
   "summary": "cast-iron stove, half cover",
   "part": "candelabra",
   "partParams": {}
  }
 ],
 "chrome": [
  {
   "name": "Rack Stack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:pillar-broken",
   "summary": "humming server tower, half-cover, faceplate torn open",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Shattered Rack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:pillar-broken",
   "summary": "toppled sparking server tower, jagged half-cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Terminal Stand",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:shrine-block",
   "summary": "console terminal altar, looping diagnostic screen",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Munitions Crate",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "stamped supply crate, magnetic seals, in-zone marker",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Stasis Coffin",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "cosmic",
    "gloom"
   ],
   "model": "prop:coffin-slab",
   "summary": "fogged stasis pod, frozen occupant, heavy three-quarter cover",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Core Pillar",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:pillar-broken",
   "summary": "throbbing reactor pillar, pulsing warning glyphs",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Bulkhead Door",
   "size": "Huge",
   "cover": "full",
   "crossRealm": [
    "cosmic",
    "high-seas"
   ],
   "model": "prop:arch-frame",
   "summary": "jammed blast door, huge full-cover chokepoint",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Charge Dock",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:candelabra",
   "summary": "blinking drone charger post, small marker, no cover",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Cable Snarl",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:web-mass",
   "summary": "knotted sparking cable bundle, tangled half-cover",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Grav-Cart",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:cart",
   "summary": "dead cargo hauler, large three-quarter cover",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Command Slab",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:table-slab",
   "summary": "holo-table, flickering dead projector fragments",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Vent Grate",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "floor vent grate, gusting stale air, small marker",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Overseer Chair",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:throne-seat",
   "summary": "bolted operator chair, worn smooth, half cover",
   "part": "throne-seat",
   "partParams": {}
  },
  {
   "name": "Coolant Pool",
   "size": "Medium",
   "cover": "none",
   "crossRealm": [
    "cosmic",
    "ash"
   ],
   "model": "prop:basin-block",
   "summary": "glowing coolant spill, slick hazard, no cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Servo Cage",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:cage-frame",
   "summary": "dormant drone in hanging recharge cradle, half-cover",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Scrap Heap",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "decommissioned hardware drift, sharp unstable half-cover",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Loading Manipulator",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:statue-figure",
   "summary": "seized cargo-arm robot, frozen mid-reach, heavy cover",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Coil Brazier",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:candelabra",
   "summary": "crackling induction coil, waste-heat glow, marker-sized",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Data Well",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:well-shaft",
   "summary": "sunken archive shaft, wheezing fans, half cover",
   "part": "well-shaft",
   "partParams": {}
  },
  {
   "name": "Airlock Arch",
   "size": "Large",
   "cover": "none",
   "crossRealm": [
    "cosmic",
    "high-seas"
   ],
   "model": "prop:arch-frame",
   "summary": "pressure-sealed archway, cycling warning strobes",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Cryo Manacles",
   "size": "Medium",
   "cover": "none",
   "crossRealm": [
    "cosmic",
    "gloom"
   ],
   "model": "prop:chain-drape",
   "summary": "wired wall restraints, faint compliance charge",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Exposed Gearbox",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic",
    "high-seas"
   ],
   "model": "prop:gear-cluster",
   "summary": "open drive assembly, cogs turning on residual torque",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Signal Obelisk",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:pillar-broken",
   "summary": "dish-bristling relay spire, ceaseless chatter, heavy cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Waste Duct",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:rubble-scatter",
   "summary": "fused stacked-component palisade, jagged half cover",
   "part": "rubble-scatter",
   "partParams": {
    "channel": "bone",
    "scale": 0.9
   }
  },
  {
   "name": "Cage Elevator",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:cage-frame",
   "summary": "dangling open-frame lift car, ticking taut cable",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Vat Cluster",
   "size": "Large",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:basin-block",
   "summary": "bank of tissue vats, churning murky viewports",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "net-new: Sentry Turret Mount",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic",
    "high-seas"
   ],
   "model": "prop:sentry-turret-mount",
   "summary": "dormant swivel turret, drooping barrel, half cover"
  },
  {
   "name": "net-new: Conveyor Spur",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "cosmic"
   ],
   "model": "prop:conveyor-spur",
   "summary": "frozen assembly conveyor, clamped unfinished parts, half cover"
  },
  {
   "name": "net-new: Holo-Pillar Ad",
   "size": "Medium",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:holo-pillar-ad",
   "summary": "flickering ad column, looping dead brand image, no cover"
  },
  {
   "name": "net-new: Blast Shutter Frame",
   "size": "Huge",
   "cover": "full",
   "crossRealm": [
    "cosmic",
    "high-seas"
   ],
   "model": "prop:blast-shutter-frame",
   "summary": "half-retracted blast shutter, huge chokepoint, full cover"
  },
  {
   "name": "Jersey Barrier Line",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "ash",
    "noir"
   ],
   "model": "prop:crate",
   "summary": "concrete barrier line, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Vending Kiosk",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:crate",
   "summary": "automated kiosk, three-quarters cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Neon Strip Sign",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "noir"
   ],
   "model": "prop:pillar-broken",
   "summary": "vertical neon sign post, no cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Drone Charging Dock",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "drone dock pillar, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Coolant Pipe Bundle",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "ash"
   ],
   "model": "prop:gear-cluster",
   "summary": "coolant pipe cluster, half cover",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Reactor Coolant Tank",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:crate",
   "summary": "bulging coolant tank, three-quarters cover",
   "part": "crate",
   "partParams": {}
  }
 ],
 "noir": [
  {
   "name": "Sputtering Streetlamp",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "suburb",
    "frontier",
    "gloom"
   ],
   "model": "prop:candelabra",
   "summary": "buzzing cast-iron lamppost, half-cover marker",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Overflowing Trash Can",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "dented steel can, spilled refuse, low cover",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Cracked-Glass Phone Booth",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:arch-frame",
   "summary": "battered glass booth, dead receiver, solid cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Bullet-Pocked Sedan",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "suburb",
    "chrome"
   ],
   "model": "prop:cart",
   "summary": "slumped parked sedan, open door, zone-filling cover",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Corner Newsstand",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:crate",
   "summary": "wire-racked newsstand, curling headlines, chunk cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Rusted Dumpster",
   "size": "Large",
   "cover": "full",
   "crossRealm": "all",
   "model": "prop:coffin-slab",
   "summary": "steel alley dumpster, dented lid, full cover",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Case-File Desk",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:table-slab",
   "summary": "scarred oak desk, buried in case files, half cover",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Locked Filing Cabinet",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "suburb",
    "chrome"
   ],
   "model": "prop:pillar-broken",
   "summary": "jammed gray cabinet, forced drawer, low cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Gushing Fire Hydrant",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "suburb"
   ],
   "model": "prop:basin-block",
   "summary": "cracked hissing hydrant, rust-streaked, no cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Buzzing Neon Sign",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "stuttering neon marquee, red light, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Chained Loading Gate",
   "size": "Large",
   "cover": "full",
   "crossRealm": [
    "chrome",
    "frontier"
   ],
   "model": "prop:arch-frame",
   "summary": "chained roll-gate, shuttered storefront, full cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Rain-Slick Manhole Grate",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "suburb",
    "chrome",
    "gloom"
   ],
   "model": "prop:rubble-scatter",
   "summary": "steaming sunken grate, street-level marker",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Payphone Bank",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:chain-drape",
   "summary": "tangled payphone row, chipped brick, low cover",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Wrecked Patrol Cruiser",
   "size": "Huge",
   "cover": "full",
   "crossRealm": "specific",
   "model": "net-new: a flipped, burnt-out police cruiser lying on its roof, wheels in the air",
   "summary": "flipped burnt cruiser, pulsing light bar, zone-dominating cover"
  },
  {
   "name": "Boarded Storefront Window",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "suburb",
    "ash"
   ],
   "model": "prop:pillar-broken",
   "summary": "boarded shattered display window, chunk cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Alley Fire Escape",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "chrome",
    "gloom"
   ],
   "model": "prop:web-mass",
   "summary": "zigzag iron fire escape, loose ladder, tall cover",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Back-Alley Card Table",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "high-seas",
    "frontier"
   ],
   "model": "prop:shrine-block",
   "summary": "folding card table, half-dealt hand, low cover",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Pawnshop Cage",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:cage-frame",
   "summary": "bolted wire pawn cage, hocked trinkets, solid cover",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Stalled Elevated Train Car",
   "size": "Huge",
   "cover": "full",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:cart",
   "summary": "dead elevated rail car, frozen doors, zone-dominating cover",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Piled Sandbag Checkpoint",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier",
    "ash"
   ],
   "model": "prop:rubble-scatter",
   "summary": "chest-high sandbag stack, abandoned checkpoint, tall cover",
   "part": "rubble-scatter",
   "partParams": {
    "channel": "bone",
    "scale": 0.9
   }
  },
  {
   "name": "Backroom Piano",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:throne-seat",
   "summary": "broken-key upright piano, yellowed sheet music, chunk cover",
   "part": "throne-seat",
   "partParams": {}
  },
  {
   "name": "Overturned Fruit Cart",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "high-seas",
    "gloom"
   ],
   "model": "prop:cart",
   "summary": "overturned peddler cart, rotting spill, chunk cover",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Rooftop Water Tower",
   "size": "Huge",
   "cover": "full",
   "crossRealm": [
    "chrome",
    "cosmic"
   ],
   "model": "prop:gear-cluster",
   "summary": "stilted rooftop water tank, rust drip, zone-dominating cover",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Broken Parking Meter Row",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "suburb",
    "chrome"
   ],
   "model": "prop:web-mass",
   "summary": "bent meter row, jimmied coin slots, street marker",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Smashed Slot Machine",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:gear-cluster",
   "summary": "cracked-open slot machine, frozen reels, chunk cover",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Dead Drop Mailbox",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:pillar-broken",
   "summary": "dented steel mailbox, propped flap, low cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Collapsed Scaffolding",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "chrome",
    "ash"
   ],
   "model": "prop:pillar-broken",
   "summary": "buckled construction scaffold, scattered planks, tall cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Barber Pole",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "spinning barber pole, no cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Chrome Diner Counter",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "suburb"
   ],
   "model": "prop:table-slab",
   "summary": "long diner counter, half cover",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Trash-Fire Barrel",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "ash"
   ],
   "model": "prop:candelabra",
   "summary": "burning trash barrel, half cover",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Steam Manhole",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:rubble-scatter",
   "summary": "steaming manhole grate, no cover",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Detective's Filing Stack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:crate",
   "summary": "stacked file boxes, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Coat-Check Cage",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:cage-frame",
   "summary": "brass coat-check cage, half cover",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  }
 ],
 "ash": [
  {
   "name": "Wrecked Sedan",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier",
    "noir",
    "suburb"
   ],
   "model": "prop:cart",
   "summary": "Gutted car husk, deep chunk cover, half-buried in ash",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Rust Drum",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "Rusted oil drum, low cover marker, sticky residue",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Slag Heap",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "Loose rubble mound, unstable footing, chunk-filling cover",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Scrap Wall",
   "size": "Large",
   "cover": "full",
   "crossRealm": "specific",
   "model": "prop:rubble-scatter",
   "summary": "Cobbled scrap barricade, full-zone wall, wire-lashed",
   "part": "rubble-scatter",
   "partParams": {
    "channel": "bone",
    "scale": 0.9
   }
  },
  {
   "name": "Bent Signpost",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "frontier",
    "noir",
    "suburb"
   ],
   "model": "prop:pillar-broken",
   "summary": "Leaning road sign, marker only, no meaningful cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Dead Pump",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "suburb"
   ],
   "model": "prop:well-shaft",
   "summary": "Cracked fuel pump, chunk cover, permanent black puddle",
   "part": "well-shaft",
   "partParams": {}
  },
  {
   "name": "Tire Cairn",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "suburb"
   ],
   "model": "prop:pillar-broken",
   "summary": "Stacked tire column, chunk cover, heat-warped rubber",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Shanty Panel",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:arch-frame",
   "summary": "Corrugated shanty wall, near-full cover, patchwork tin",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Hot Drum",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:candelabra",
   "summary": "Radiation barrel, marker-sized, faint ticking hazard",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Chain-Link Gate",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "noir",
    "suburb"
   ],
   "model": "prop:rubble-scatter",
   "summary": "Sagging fence gate, dominates a zone, mostly-solid screen",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Server Husk",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:pillar-broken",
   "summary": "Stripped equipment rack, low cover, trailing dead wires",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Guardrail Stub",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "noir",
    "suburb"
   ],
   "model": "prop:pillar-broken",
   "summary": "Snapped guardrail segment, in-zone marker cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Ash Cistern",
   "size": "Medium",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:basin-block",
   "summary": "Collapsed cistern pool, hazard terrain, no real cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Cinderblock Stack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:table-slab",
   "summary": "Piled cinderblocks, waist-high chunk cover, salvage pile",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Bus Skeleton",
   "size": "Huge",
   "cover": "full",
   "crossRealm": "specific",
   "model": "net-new: a long gutted transit-bus shell, roof caved at one end, resting on flattened tires",
   "summary": "Massive gutted bus shell, dominates zone, full cover"
  },
  {
   "name": "Collapsed Overpass Slab",
   "size": "Huge",
   "cover": "full",
   "crossRealm": "specific",
   "model": "net-new: a huge tilted chunk of broken elevated roadway, rebar bristling from its underside",
   "summary": "Tilted highway slab, huge terrain feature, full cover"
  },
  {
   "name": "Bone-Dry Fountain",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "suburb",
    "gloom"
   ],
   "model": "prop:basin-block",
   "summary": "Dry cracked fountain basin, waist-high rim cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Vending Husk",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "suburb",
    "noir"
   ],
   "model": "prop:coffin-slab",
   "summary": "Toppled vending machine, blocky chunk cover, looted",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Melted Playground Frame",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "suburb"
   ],
   "model": "net-new: a warped jungle-gym / swingset skeleton, bars slumped and fused from heat",
   "summary": "Heat-warped playground frame, open lattice, partial cover"
  },
  {
   "name": "Fallout Shelter Hatch",
   "size": "Medium",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:rubble-scatter",
   "summary": "Sealed shelter hatch, ground-level marker, sealed shut",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Broadcast Antenna Stump",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "chrome",
    "cosmic"
   ],
   "model": "prop:pillar-broken",
   "summary": "Snapped radio mast, tall half-cover, faint dead hum",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Ashfall Drift",
   "size": "Medium",
   "cover": "none",
   "crossRealm": "specific",
   "model": "net-new: a soft dune of settled gray ash banked against a wall or vehicle, ankle-to-knee deep",
   "summary": "Banked ash dune, difficult terrain, no real cover"
  },
  {
   "name": "Church Pew Row",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "suburb"
   ],
   "model": "prop:table-slab",
   "summary": "Splintered pew row, long waist-high cover line",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Rebar Thicket",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:web-mass",
   "summary": "Tangled rebar snarl, jagged half-cover, snags movement",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Traffic Light Gantry",
   "size": "Medium",
   "cover": "none",
   "crossRealm": [
    "noir",
    "suburb",
    "frontier"
   ],
   "model": "prop:candelabra",
   "summary": "Sagging signal gantry, tall marker, swinging dead lamp",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Looted ATM Stump",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "noir",
    "suburb"
   ],
   "model": "prop:shrine-block",
   "summary": "Gutted cash machine, chest-high marker, dead screen",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Water Tower Legs",
   "size": "Huge",
   "cover": "three-quarters",
   "crossRealm": [
    "suburb",
    "frontier"
   ],
   "model": "prop:arch-frame",
   "summary": "Toppled tower's stilt-legs, huge crossing cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Shopping Cart Tangle",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "suburb"
   ],
   "model": "prop:web-mass",
   "summary": "Fused cart-pile tangle, low cover, wheel-locked mass",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Sandbag Emplacement",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "theater"
   ],
   "model": "prop:crate",
   "summary": "sandbag wall, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Collapsed Billboard",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "toppled billboard frame, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Burnt Sofa Row",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "suburb"
   ],
   "model": "prop:table-slab",
   "summary": "burnt sofa frames, half cover",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Gutted Shipping Container",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:crate",
   "summary": "gutted shipping container, three-quarters cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Cracked Concrete Planter",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "suburb",
    "noir"
   ],
   "model": "prop:basin-block",
   "summary": "concrete planter box, half cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Melted Streetlight Stump",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "melted streetlight stump, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  }
 ],
 "suburb": [
  {
   "name": "Leaning Mailbox",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "noir",
    "frontier"
   ],
   "model": "prop:pillar-broken",
   "summary": "Skinny post marker; a token waist-high obstacle",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Picket Fence Run",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:chain-drape",
   "summary": "Low slatted barrier fills a chunk, half cover",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Cracked Garden Gnome",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:statue-figure",
   "summary": "Small ceramic statue, no cover, pure marker",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Popped Sprinkler Head",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:basin-block",
   "summary": "Ground-level fixture in a spreading puddle",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Rusted BMX Bike",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "Toppled bike frame, low half-cover clutter",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Dead Station Wagon",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "noir",
    "frontier"
   ],
   "model": "prop:cart",
   "summary": "Large derelict car, dominant three-quarter cover",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Trash Can Row",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "Clustered bins fill a chunk, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Sagging Basketball Hoop",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:candelabra",
   "summary": "Tall pole-and-board fixture, narrow half cover",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Above-Ground Pool Shell",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:coffin-slab",
   "summary": "Ringed pool husk, large sunken cover feature",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Dead TV Set",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "chrome",
    "noir"
   ],
   "model": "prop:shrine-block",
   "summary": "Squat box on the grass, waist-high half cover",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Flickering Arcade Cabinet",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:pillar-broken",
   "summary": "Tall standing cabinet, three-quarter cover marker",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Overgrown Hedge Row",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "gloom",
    "lost-world"
   ],
   "model": "prop:web-mass",
   "summary": "Dense shrub tangle, chunky three-quarter cover",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Carport Support Post",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:pillar-broken",
   "summary": "Slim structural post, minor half-cover marker",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Charcoal Grill Drum",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "high-seas"
   ],
   "model": "prop:candelabra",
   "summary": "Squat drum grill, small waist-high half cover",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Split-Rail Swing Set",
   "size": "Large",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:arch-frame",
   "summary": "Tall skeletal frame, no cover, tall marker",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Collapsed Garage Door",
   "size": "Huge",
   "cover": "full",
   "crossRealm": [
    "chrome",
    "noir"
   ],
   "model": "prop:arch-frame",
   "summary": "Huge buckled panel, blocks the doorway fully",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Kiddie Pool Puddle",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:basin-block",
   "summary": "Shallow plastic basin, ground-level no cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Propane Tank Cluster",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "high-seas"
   ],
   "model": "prop:gear-cluster",
   "summary": "Clustered cylinders, chunky half-cover hazard",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Toppled Satellite Dish",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "chrome",
    "cosmic"
   ],
   "model": "prop:pillar-broken",
   "summary": "Fallen dish shell, low half-cover clutter",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Storm Drain Grate",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "Flush street fixture, no cover, floor feature",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Utility Pole Stub",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "noir",
    "frontier"
   ],
   "model": "prop:candelabra",
   "summary": "Tall standing pole, narrow half-cover marker",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Cul-de-Sac Fire Hydrant",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "noir",
    "chrome"
   ],
   "model": "prop:candelabra",
   "summary": "Stubby curb fixture, no cover, ground marker",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Abandoned Grill Cart",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:table-slab",
   "summary": "Tipped wheeled cart, waist-high half cover",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Front-Porch Recliner",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:throne-seat",
   "summary": "Bulky seated furniture, half-cover porch fixture",
   "part": "throne-seat",
   "partParams": {}
  },
  {
   "name": "Sunken Cellar Hatch",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic",
    "ash"
   ],
   "model": "prop:coffin-slab",
   "summary": "Sunken steel hatch, chunky half-cover feature",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Wrecked Riding Mower",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:cart",
   "summary": "Tipped mower body, chunky half-cover obstacle",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Christmas Light Tangle Post",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:candelabra",
   "summary": "Slim lit post, no cover, ambient marker",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Overturned Play Slide",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "Toppled plastic hulk, half-cover yard clutter",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Street Lamppost",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "noir",
    "chrome"
   ],
   "model": "prop:candelabra",
   "summary": "tall street lamppost, half cover",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Curbside Dumpster",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "noir",
    "chrome",
    "ash"
   ],
   "model": "prop:crate",
   "summary": "steel dumpster, three-quarters cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Park Bench",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "noir",
    "bright-kingdom"
   ],
   "model": "prop:table-slab",
   "summary": "slatted park bench, half cover",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Bus Stop Shelter",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "noir",
    "chrome"
   ],
   "model": "prop:arch-frame",
   "summary": "bus-stop shelter frame, half cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Sidewalk Vending Machine",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:crate",
   "summary": "standing vending machine, three-quarters cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Newspaper Box Row",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "noir"
   ],
   "model": "prop:crate",
   "summary": "chained newspaper boxes, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Backyard Play Climber",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "play-set climbing frame, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  }
 ],
 "cosmic": [
  {
   "name": "Non-Euclidean Monolith",
   "size": "Huge",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "impossible-angled black obelisk, dominates the zone",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Floating Shard",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "lost-world",
    "gloom"
   ],
   "model": "net-new: a jagged crystal slab hovering mid-air with no visible support",
   "summary": "levitating broken crystal slab, slow rotation"
  },
  {
   "name": "Altar of Eyes",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:shrine-block",
   "summary": "altar studded with tracking eyeballs, unsettling",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Star-Well",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "lost-world"
   ],
   "model": "prop:well-shaft",
   "summary": "well opening onto starfield depths, faint pull",
   "part": "well-shaft",
   "partParams": {}
  },
  {
   "name": "Fleshy Growth",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "gloom",
    "ash"
   ],
   "model": "prop:web-mass",
   "summary": "pulsing alien-flesh mass, breathes faintly wrong",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Impossible Stair",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "net-new: a short flight of steps that loops back into itself, Escher-fashion",
   "summary": "self-looping Escher staircase, disorients climbers"
  },
  {
   "name": "Gate-Arch",
   "size": "Huge",
   "cover": "three-quarters",
   "crossRealm": [
    "lost-world",
    "gloom"
   ],
   "model": "prop:arch-frame",
   "summary": "archway framing impossible smeared colors beyond",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Crystalline Mass",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "lost-world"
   ],
   "model": "prop:pillar-broken",
   "summary": "jagged crystal eruption, hums at painful pitch",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Void-Root Cluster",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:crate",
   "summary": "small cluster of black void-tendrils, cold",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Drifting Reliquary",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "lost-world"
   ],
   "model": "prop:cart",
   "summary": "floating ornate reliquary, contents rattle oddly",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Watcher Statue",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "lost-world"
   ],
   "model": "prop:statue-figure",
   "summary": "faceted alien statue, head slowly tracks motion",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Gravity Lattice",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:gear-cluster",
   "summary": "interlocking rotating rings, bends space subtly",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Star-Ash Brazier",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:candelabra",
   "summary": "brazier burning cold silent starlight, wrong shadows",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Cosmic Sarcophagus",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "gloom",
    "lost-world"
   ],
   "model": "prop:coffin-slab",
   "summary": "sarcophagus with shifting constellation carvings",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Stasis Pod",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "net-new: an upright ovoid capsule with a frosted transparent panel, faint internal glow",
   "summary": "upright glowing stasis pod, drifting occupant inside"
  },
  {
   "name": "Void-Shackle Rack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "ash"
   ],
   "model": "prop:chain-drape",
   "summary": "wall-mounted dark-matter chain rack, faint hum",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Star-Chart Table",
   "size": "Large",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:table-slab",
   "summary": "large slab table, self-rewriting star chart etched in",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Throne of Angles",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:throne-seat",
   "summary": "impossibly-angled seat, unsettling to view directly",
   "part": "throne-seat",
   "partParams": {}
  },
  {
   "name": "Signal Lantern Post",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "noir",
    "suburb"
   ],
   "model": "prop:candelabra",
   "summary": "tall post, pulsing coded crystalline light",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Warped Portcullis",
   "size": "Huge",
   "cover": "full",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:arch-frame",
   "summary": "light-bending barred gate, folds the passage beyond",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Ossuary Wall",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "gloom",
    "ash",
    "lost-world"
   ],
   "model": "prop:rubble-scatter",
   "summary": "stacked alien-bone wall, wrong-angled joints",
   "part": "rubble-scatter",
   "partParams": {
    "channel": "bone",
    "scale": 0.9
   }
  },
  {
   "name": "Rift Grate",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "floor grate, cold ozone draft rising through",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Suspended Cage",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "ash"
   ],
   "model": "prop:cage-frame",
   "summary": "cageless-support hanging cage, defies gravity",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Refuse Drift",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "small debris heap, edges faintly weightless",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Cold Candle Array",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:candelabra",
   "summary": "branching candle stand, cold sideways-bent flames",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Wandering Torch",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:candelabra",
   "summary": "wall torch, flame drifts loose from the wick",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Event-Horizon Pool",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:basin-block",
   "summary": "glassy still pool, objects fall too long inside",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Orrery Engine",
   "size": "Huge",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "net-new: a large freestanding armature of concentric rotating rings orbiting small glowing spheres",
   "summary": "huge orbiting-spheres armature, turns unknown worlds"
  },
  {
   "name": "Console Bank",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:gear-cluster",
   "summary": "control console bank, half cover",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Antenna Array",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "antenna mast array, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Nutrient Vat Row",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:basin-block",
   "summary": "clouded nutrient vats, half cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Fallen Star-Idol",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:statue-figure",
   "summary": "fallen meteor idol, three-quarters cover",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Signal Beacon Pylon",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:pillar-broken",
   "summary": "signal beacon pylon, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Meat Pillar",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "breathing flesh pillar, three-quarters cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  }
 ],
 "theater": [
  {
   "name": "Sandbagged Firing Wall",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier",
    "ash",
    "high-seas"
   ],
   "model": "prop:rubble-scatter",
   "summary": "Long sandbag revetment, chest-high firing cover",
   "part": "rubble-scatter",
   "partParams": {
    "channel": "bone",
    "scale": 0.9
   }
  },
  {
   "name": "Barbed Coil",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "ash",
    "frontier"
   ],
   "model": "prop:web-mass",
   "summary": "Tangled rusted wire snarl, slows and snags movement",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Field Artillery Piece",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "high-seas"
   ],
   "model": "net-new: a long-barreled wheeled cannon tilted up on a cracked carriage",
   "summary": "Derelict wheeled cannon, half-cover firing position"
  },
  {
   "name": "Munitions Crate Stack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "Stacked ammo crates, splintered and half-spilled",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Trench Ladder",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "Rickety plank ladder braced against a trench wall",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Gutted Tank Hulk",
   "size": "Huge",
   "cover": "full",
   "crossRealm": [
    "ash"
   ],
   "model": "net-new: a treaded armored hull split open with a slumped turret",
   "summary": "Massive burnt-out tank wreck, dominates and fully blocks"
  },
  {
   "name": "Timber Barricade",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier",
    "ash",
    "gloom"
   ],
   "model": "prop:arch-frame",
   "summary": "Improvised timber-and-scrap wall, near-total blocking cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Fixed Field Gun",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "high-seas"
   ],
   "model": "prop:throne-seat",
   "summary": "Bolted emplaced gun on a bracing plate, seated cover",
   "part": "throne-seat",
   "partParams": {}
  },
  {
   "name": "Battlefield Gravemarker",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "gloom",
    "frontier",
    "lost-world"
   ],
   "model": "prop:pillar-broken",
   "summary": "Rifle-and-helmet grave marker, small silent monument",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Ration Supply Tent",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "suburb"
   ],
   "model": "prop:arch-frame",
   "summary": "Sagging canvas supply tent, open-frame partial cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Collapsed Trench Wall",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:pillar-broken",
   "summary": "Caved earthworks section, jagged half-cover rubble",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Signal Wire Post",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "noir",
    "suburb",
    "ash"
   ],
   "model": "prop:candelabra",
   "summary": "Snapped signal pole trailing dead telephone wire",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Mud-Sunk Supply Cart",
   "size": "Large",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:cart",
   "summary": "Axle-deep supply cart, tilted half-cover obstacle",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Razor Wire Apron",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "ash",
    "frontier"
   ],
   "model": "prop:rubble-scatter",
   "summary": "Low staked wire lattice, ankle-height snagging cover",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Command Bunker Door",
   "size": "Large",
   "cover": "full",
   "crossRealm": [
    "chrome",
    "ash"
   ],
   "model": "prop:arch-frame",
   "summary": "Sunken concrete bunker hatch, full-blocking steel door",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Duckboard Walkway",
   "size": "Medium",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:table-slab",
   "summary": "Low slatted duckboard path, walkable no-cover strip",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Barrage Shell Crater",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "ash",
    "lost-world"
   ],
   "model": "prop:basin-block",
   "summary": "Flooded shell crater, sunken half-cover depression",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Sniper's Nest",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "net-new: a collapsed loophole of stacked brick and steel plate with a narrow firing slit",
   "summary": "Fortified loophole nook, narrow firing-slit cover"
  },
  {
   "name": "Downed Observation Balloon",
   "size": "Huge",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:web-mass",
   "summary": "Collapsed spotter balloon, huge draped tangle cover",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Triage Cot Row",
   "size": "Medium",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:table-slab",
   "summary": "Row of collapsed field-hospital cots, waist-high clutter",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Barbed Chevaux-de-Frise",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "ash",
    "frontier"
   ],
   "model": "prop:rubble-scatter",
   "summary": "Portable X-frame wire obstacle, half-cover chokepoint",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Gas Alarm Bell Post",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:candelabra",
   "summary": "Hanging shell-casing gas alarm, small landmark post",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Officer's Map Table",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "high-seas"
   ],
   "model": "prop:table-slab",
   "summary": "Cluttered map-and-cartridge command table",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Executed Deserter's Post",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "Bound execution post, grim small marker",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Barbed Wire Entanglement Fence",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "ash",
    "frontier"
   ],
   "model": "prop:chain-drape",
   "summary": "Dense multi-strand wire fence, near-total snagging wall",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Collapsed Pillbox",
   "size": "Large",
   "cover": "full",
   "crossRealm": [
    "ash"
   ],
   "model": "prop:coffin-slab",
   "summary": "Caved concrete pillbox, full-blocking bunker husk",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Stacked Corpse Cairn",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "Grim tarped corpse mound, somber half-cover pile",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Rolling Field Kitchen",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:cart",
   "summary": "Wheeled cook-wagon, rattling half-cover obstacle",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Ammunition Limber",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:cart",
   "summary": "overturned ammo limber, three-quarters cover",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Periscope Trench Post",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "trench periscope post, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Field Telephone Table",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "chrome"
   ],
   "model": "prop:table-slab",
   "summary": "field-telephone trestle, half cover",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Duckboard Stack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:crate",
   "summary": "stacked duckboards, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Wire Picket Screw",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "ash"
   ],
   "model": "prop:pillar-broken",
   "summary": "barbed-wire picket post, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Mule-Team Water Cart",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:cart",
   "summary": "bogged water cart, three-quarters cover",
   "part": "cart",
   "partParams": {}
  }
 ],
 "high-seas": [
  {
   "name": "Broadside Cannon",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "theater"
   ],
   "model": "prop:pillar-broken",
   "summary": "Iron gun on a wheeled carriage, half-cover bulk",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Powder Keg Stack",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "ash"
   ],
   "model": "prop:crate",
   "summary": "Stacked explosive kegs, obvious detonation risk",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Ship's Wheel",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:gear-cluster",
   "summary": "Spinning oak helm, spoked cover silhouette",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Mainmast Stump",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "Broken mast trunk, dominates a deck zone",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Cargo Net Tangle",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "lost-world"
   ],
   "model": "prop:web-mass",
   "summary": "Snarled netting mass, awkward footing hazard",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Capstan",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:gear-cluster",
   "summary": "Chain-wound drum with turning bars, waist-high",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Sunken Treasure Chest",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "lost-world",
    "frontier"
   ],
   "model": "prop:coffin-slab",
   "summary": "Cracked coin-spilling chest, loot beacon",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Ship's Anchor",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "Massive buried anchor, three-quarter cover hulk",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Rigging Lines",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "theater"
   ],
   "model": "prop:chain-drape",
   "summary": "Taut rope lattice, climbable hazard tangle",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Ballast Crate Stack",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "Lashed crate pyramid, sturdy improvised wall",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Bosun's Table",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:table-slab",
   "summary": "Bolted worktable scattered with navigation tools",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Grog Barrel Row",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "Lashed barrel row, low sloshing half-cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Figurehead Wreckage",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:statue-figure",
   "summary": "Torn carved figurehead, salt-bleached dominant piece",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Ratlines Web",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:web-mass",
   "summary": "Swaying rope-ladder net between mast shrouds",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Cracked Ship's Bell",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "gloom",
    "lost-world"
   ],
   "model": "prop:candelabra",
   "summary": "Verdigris bell on a crooked yoke, silent",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Galley Stove",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "suburb"
   ],
   "model": "prop:shrine-block",
   "summary": "Bolted iron cook stove, cold firebox interactable",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Binnacle Compass Stand",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:candelabra",
   "summary": "Fogged brass compass stand, restless needle",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Cannonball Rack",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "theater"
   ],
   "model": "prop:rubble-scatter",
   "summary": "Racked iron shot, a few loose rollers",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Gangplank",
   "size": "Large",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:arch-frame",
   "summary": "Warped single plank, precarious crossing hazard",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Shattered Ship's Boat",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier"
   ],
   "model": "prop:cart",
   "summary": "Capsized splintered longboat, sturdy cover hull",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Hanging Lantern Cluster",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "noir",
    "gloom"
   ],
   "model": "prop:candelabra",
   "summary": "Swinging salt-fogged lantern cluster overhead",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Brig Cage",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:cage-frame",
   "summary": "Rusted iron brig cell, half-cover bars",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Coiled Mooring Rope",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:web-mass",
   "summary": "Huge coiled hawser, nested rope pile",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Scuttle Hatch",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "Warped sealed hatch over sloshing bilge water",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Drowned Sailor's Bones",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "Waterlogged bone tangle snagged in debris",
   "part": "rubble-scatter",
   "partParams": {
    "channel": "bone",
    "scale": 0.9
   }
  },
  {
   "name": "Captain's Sea Chest",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:crate",
   "summary": "Bolted brass-cornered officer's trunk, faded sigil",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Caved Wheelhouse Ruin",
   "size": "Large",
   "cover": "full",
   "crossRealm": "specific",
   "model": "prop:arch-frame",
   "summary": "Caved wheelhouse frame, full-cover cage ruin",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Mooring Bollard",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "noir"
   ],
   "model": "prop:pillar-broken",
   "summary": "iron mooring bollard, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Barrel Raft",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:crate",
   "summary": "lashed-barrel raft, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Fish-Drying Rack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "lost-world"
   ],
   "model": "prop:table-slab",
   "summary": "fish-drying rack, half cover",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Tide-Pool Cistern",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:basin-block",
   "summary": "jetty tide-pool, half cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Chum Barrel",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:crate",
   "summary": "open chum barrel, half cover",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Beached Longboat",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:cart",
   "summary": "beached longboat, three-quarters cover",
   "part": "cart",
   "partParams": {}
  }
 ],
 "lost-world": [
  {
   "name": "Idol of the Devouring Maw",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "gloom",
    "cosmic"
   ],
   "model": "prop:statue-figure",
   "summary": "Fanged temple idol, offering-stained, blocks half a zone",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Sundered Column Drum",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:pillar-broken",
   "summary": "Toppled column drum, waist-high rubble cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Bloodstone Altar",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "cosmic"
   ],
   "model": "prop:shrine-block",
   "summary": "Grooved sacrificial slab, blood-dark stone channels",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Reclaimed Guardian",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "bright-kingdom",
    "gloom"
   ],
   "model": "prop:statue-figure",
   "summary": "Vine-swallowed guardian statue, half plant, half god",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Everflame Brazier",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "gloom",
    "cosmic",
    "bright-kingdom"
   ],
   "model": "prop:candelabra",
   "summary": "Bronze tripod brazier, coals mysteriously never dying",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Sky-Needle Obelisk",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "cosmic",
    "gloom",
    "ash"
   ],
   "model": "prop:pillar-broken",
   "summary": "Leaning star-carved monolith, ancient king-list glyphs",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Ziggurat Terrace Step",
   "size": "Huge",
   "cover": "half",
   "crossRealm": "specific",
   "model": "net-new: a stepped stone platform tier, roughly knee-to-waist high, forming a walkable ledge across part of a zone",
   "summary": "Pyramid terrace tier, walkable ledge dominates zone"
  },
  {
   "name": "Wyrmling Clutch Egg",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "net-new: a single oversized leathery/stone egg nested in torn foliage, rounded silhouette taller than a person",
   "summary": "Barrel-sized nested egg, warm and faintly stirring"
  },
  {
   "name": "Ossuary Cairn",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "ash",
    "gloom",
    "frontier"
   ],
   "model": "prop:rubble-scatter",
   "summary": "Heaped bleached-bone cairn, mixed beast and other",
   "part": "rubble-scatter",
   "partParams": {
    "channel": "bone",
    "scale": 0.9
   }
  },
  {
   "name": "Offertory Table",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:table-slab",
   "summary": "Low stone offering table, cracked pottery clutter",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Sunken Reflecting Pool",
   "size": "Large",
   "cover": "none",
   "crossRealm": [
    "gloom",
    "bright-kingdom"
   ],
   "model": "prop:basin-block",
   "summary": "Algae-choked ceremonial pool, frog-god rim carvings",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Rope-Vine Archway",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "bright-kingdom"
   ],
   "model": "prop:arch-frame",
   "summary": "Vine-lashed collapsed gateway, half-standing archway",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Feathered-Serpent Throne",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "cosmic"
   ],
   "model": "prop:throne-seat",
   "summary": "Moss-grown serpent throne, long-abandoned royal seat",
   "part": "throne-seat",
   "partParams": {}
  },
  {
   "name": "Idol-Bearer's Crate Stack",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "Spilled reed-basket and crate stack, looter leavings",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Sun-Priest Sarcophagus",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "ash"
   ],
   "model": "prop:coffin-slab",
   "summary": "Cracked priest sarcophagus, robed-figure carved lid",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Fossil Rib Colonnade",
   "size": "Huge",
   "cover": "half",
   "crossRealm": [
    "ash",
    "gloom"
   ],
   "model": "net-new: a row of huge curved bone-ribs arching overhead like a colonnade, embedded in rock strata",
   "summary": "Fossilized rib-arch colonnade, titanic bones in strata"
  },
  {
   "name": "Expedition Base Camp Tent",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier",
    "high-seas"
   ],
   "model": "net-new: a canvas tent shelter, guy-lines staked out, low profile with a peaked roof",
   "summary": "Abandoned canvas dig-tent, full-side canvas cover"
  },
  {
   "name": "Cracked Water Cistern",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:well-shaft",
   "summary": "Dry cracked cistern, moss-rimmed stone basin",
   "part": "well-shaft",
   "partParams": {}
  },
  {
   "name": "Vine-Choked Portcullis",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "noir"
   ],
   "model": "prop:arch-frame",
   "summary": "Root-jammed iron portcullis, rusted half-open gate",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Surveyor's Cart",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "high-seas"
   ],
   "model": "prop:cart",
   "summary": "Broken expedition cart, tarp-covered relic crates",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Glyph-Warded Grate",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "Warded floor grate, warm air rising from below",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Bone-Feathered Hanging Cage",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "chrome"
   ],
   "model": "prop:cage-frame",
   "summary": "Swinging bone-and-hide cage, long-picked temple relic",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Priest-Bound Manacle Wall",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom",
    "noir"
   ],
   "model": "prop:chain-drape",
   "summary": "Stone-cuffed sacrifice wall, carved binding stations",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Temple Refuse Midden",
   "size": "Small",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "Slumped shrine refuse heap, shards and gnawed bone",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Amber-Set Resin Block",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "net-new: a translucent amber-colored resin block embedded with a preserved silhouette, roughly torso-height",
   "summary": "Amber resin block, winged creature frozen inside"
  },
  {
   "name": "Calcified Lava Vent",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "ash"
   ],
   "model": "net-new: a low cracked stone vent in the ground, faintly glowing and venting heat-shimmer",
   "summary": "Cracked heat-vent fissure, sulfurous mineral-rimed crack"
  },
  {
   "name": "Claw-Scored Watch Totem",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "frontier"
   ],
   "model": "net-new: a tall wooden or bone totem pole carved with layered predator faces, scored with deep claw gouges",
   "summary": "Claw-scored predator totem, layered carved visages"
  },
  {
   "name": "Nest of Woven Bramble",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "net-new: a huge shallow bowl-shaped nest of woven branches and bramble, wide enough to hold a large creature",
   "summary": "Huge thorned bramble nest, scale-lined predator lair"
  },
  {
   "name": "Tar Pit Pool",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:basin-block",
   "summary": "bubbling tar pit, half cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Jungle Liana Curtain",
   "size": "Large",
   "cover": "half",
   "crossRealm": [
    "high-seas"
   ],
   "model": "prop:web-mass",
   "summary": "hanging liana curtain, half cover",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Standing Megalith",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier"
   ],
   "model": "prop:pillar-broken",
   "summary": "leaning megalith, three-quarters cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Bone Midden Mound",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:rubble-scatter",
   "summary": "bone midden mound, half cover",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Sacrificial Cenote",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:well-shaft",
   "summary": "sacrificial cenote shaft, half cover",
   "part": "well-shaft",
   "partParams": {}
  },
  {
   "name": "Petrified Stump Circle",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "petrified stump ring, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  }
 ],
 "gloom": [
  {
   "name": "Rotted Coffin",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:coffin-slab",
   "summary": "splintered wooden coffin, lid ajar, half-buried",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Sunken Gravestone",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "lost-world"
   ],
   "model": "prop:pillar-broken",
   "summary": "tilted weathered headstone, moss-eaten, in-zone marker",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Wax-Choked Candelabra",
   "size": "Small",
   "cover": "none",
   "crossRealm": [
    "theater",
    "bright-kingdom"
   ],
   "model": "prop:candelabra",
   "summary": "tarnished iron candelabra, black wax, sickly blue flame",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Scorched Ritual Circle",
   "size": "Large",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:basin-block",
   "summary": "burnt sigil-ring on the floor, no cover, area hazard",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Rusted Hanging Cage",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "high-seas"
   ],
   "model": "prop:cage-frame",
   "summary": "chained iron cage overhead, bones rattling inside",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Rusted Iron Maiden",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:coffin-slab",
   "summary": "upright spiked torture cabinet, door ajar, heavy cover",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Cracked Scrying Mirror",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "theater",
    "cosmic"
   ],
   "model": "prop:statue-figure",
   "summary": "tall standing mirror, spiderwebbed crack, wrong reflection",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Cursed Doll Heap",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "suburb",
    "theater"
   ],
   "model": "prop:rubble-scatter",
   "summary": "pile of stitched dolls, button eyes, watching heap",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Blood-Slick Altar",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier",
    "lost-world",
    "cosmic"
   ],
   "model": "prop:shrine-block",
   "summary": "grooved stone sacrifice altar, blood-blackened, three-quarter cover",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Cobweb Mass",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "all",
   "model": "prop:web-mass",
   "summary": "floor-to-ceiling web tangle, sealed corner, dense cover",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Guttering Grave-Torch",
   "size": "Small",
   "cover": "none",
   "crossRealm": "all",
   "model": "prop:candelabra",
   "summary": "wall-mounted torch, sickly green flame, never gutters out",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Bone-Picket Fence",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "frontier",
    "lost-world"
   ],
   "model": "prop:rubble-scatter",
   "summary": "lashed-bone fence line, waist-high, animals avoid it",
   "part": "rubble-scatter",
   "partParams": {
    "channel": "bone",
    "scale": 0.9
   }
  },
  {
   "name": "Wraith-Bound Manacles",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:chain-drape",
   "summary": "wall manacles, chains taut, gripping nothing visible",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Rust-Locked Portcullis",
   "size": "Huge",
   "cover": "full",
   "crossRealm": [
    "frontier",
    "high-seas"
   ],
   "model": "prop:arch-frame",
   "summary": "corroded iron portcullis, fused shut, seals the passage",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Weeping Font",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:well-shaft",
   "summary": "stone font basin, weeping black water, never runs dry",
   "part": "well-shaft",
   "partParams": {}
  },
  {
   "name": "Shrouded Processional Bier",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier",
    "high-seas"
   ],
   "model": "prop:cart",
   "summary": "abandoned funeral litter, stiff shroud, mid-procession halt",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Death-Mask Wall",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:gear-cluster",
   "summary": "wall of cast death-masks, ranked rows, silent witnesses",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Shattered Confessional",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:arch-frame",
   "summary": "splintered confessional booth, screen clawed inward",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Vigil Candle Rack",
   "size": "Medium",
   "cover": "none",
   "crossRealm": [
    "theater",
    "bright-kingdom"
   ],
   "model": "prop:candelabra",
   "summary": "tiered votive rack, hundreds of stubs, none extinguish",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Embalming Table",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:table-slab",
   "summary": "stained slab table, dangling straps, grim clinical purpose",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Ancestor Throne",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "frontier",
    "cosmic"
   ],
   "model": "prop:throne-seat",
   "summary": "carved black-wood throne, hundred faces, all watching inward",
   "part": "throne-seat",
   "partParams": {}
  },
  {
   "name": "Reliquary Crate Stack",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:crate",
   "summary": "stacked reliquary crates, over-nailed, sealed chapel stamp",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Choir-Loft Grate",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "iron floor grate, cold draft, faint wrong harmonies",
   "part": "rubble-scatter",
   "partParams": {
    "flat": true,
    "scale": 0.4
   }
  },
  {
   "name": "Fogged Reliquary Case",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "cosmic",
    "theater"
   ],
   "model": "prop:pillar-broken",
   "summary": "cracked display case, permanent internal fog, holds a relic",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "net-new: Shroud-Draped Loom",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:shroud-draped-loom",
   "summary": "upright loom, hair-thin thread, rocking with no wind"
  },
  {
   "name": "net-new: Sin-Eater's Bowl Stand",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:sin-eaters-bowl-stand",
   "summary": "tripod offering-bowl stand, warm to the touch, never empties"
  },
  {
   "name": "net-new: Charnel Pit",
   "size": "Huge",
   "cover": "none",
   "crossRealm": [
    "frontier",
    "lost-world"
   ],
   "model": "prop:charnel-pit",
   "summary": "sunken bone-choked pit, area hazard, crumbling edges"
  },
  {
   "name": "net-new: Whispering Curtain Row",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": [
    "theater"
   ],
   "model": "prop:whispering-curtain-row",
   "summary": "hanging drape row, floor-to-ceiling, murmurs when unwatched"
  },
  {
   "name": "Candle Forest",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:candelabra",
   "summary": "grove of votive candles, half cover",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Hanging Cocoon Cluster",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "lost-world"
   ],
   "model": "prop:web-mass",
   "summary": "hanging cocoon cluster, half cover",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Graveyard Iron Fence",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "noir"
   ],
   "model": "prop:pillar-broken",
   "summary": "iron cemetery railing, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Plague Cart",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "theater"
   ],
   "model": "prop:cart",
   "summary": "loaded plague cart, three-quarters cover",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Weeping Statue",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": [
    "bright-kingdom"
   ],
   "model": "prop:statue-figure",
   "summary": "mourning angel statue, three-quarters cover",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Funeral Pyre Frame",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:candelabra",
   "summary": "unlit funeral pyre, half cover",
   "part": "candelabra",
   "partParams": {}
  }
 ],
 "bright-kingdom": [
  {
   "name": "Ribbon-Bound Colossus",
   "size": "Huge",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:crate",
   "summary": "giant present box, tight ribbon, oversized crate reskin",
   "part": "crate",
   "partParams": {}
  },
  {
   "name": "Peppermint Column",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "candy-cane pillar, sticky spiral stripe, standard pillar reskin",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Snapped Peppermint Stub",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "broken candy-cane stub, jagged sugar-glass edge",
   "part": "pillar-broken",
   "partParams": {
    "intact": false
   }
  },
  {
   "name": "Nursery Block Tower",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "toy-block stack, alphabet-carved, tall pillar reskin",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Grinning Crank-Box",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:web-mass",
   "summary": "jack-in-the-box, self-turning crank, unsettling toy prop",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Painted Charger",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:statue-figure",
   "summary": "carousel horse, frozen gallop, statue reskin",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Sunken Sphere Pit",
   "size": "Large",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:basin-block",
   "summary": "ball pit, colorful and swallowing, pool reskin, no cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Loaded Number-Cube",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "oversized die, fixed fatal number, obelisk reskin",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Sugar-Bark Lollipop Tree",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "lollipop tree, swirled trunk, tall pillar reskin",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Split-Seam Effigy",
   "size": "Medium",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:cage-frame",
   "summary": "hanging pinata effigy, swings and spills on impact",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Marching-Band Cart",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:cart",
   "summary": "parade float, bunting-wrapped, standard cart reskin",
   "part": "cart",
   "partParams": {}
  },
  {
   "name": "Confetti-Choked Cannon",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "theater",
    "high-seas"
   ],
   "model": "prop:candelabra",
   "summary": "tipped party cannon, faintly smoldering, brazier reskin",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Storybook Lectern",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:shrine-block",
   "summary": "giant storybook stand, self-turning pages, altar reskin",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Nutcracker Sentinel",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:statue-figure",
   "summary": "toy soldier statue, painted tracking eyes, guard prop",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Tangled Marionette Rack",
   "size": "Small",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:chain-drape",
   "summary": "puppet-string rack, empty harnesses swaying, no cover",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Tipped Teacup Ride",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:table-slab",
   "summary": "overturned teacup ride car, table-slab reskin, big cover",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Bunting Archway",
   "size": "Huge",
   "cover": "half",
   "crossRealm": [
    "theater",
    "suburb"
   ],
   "model": "prop:arch-frame",
   "summary": "festival arch, faded bunting, tall passage frame",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Music-Box Sentinel",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:candelabra",
   "summary": "wind-up ballerina post, warping tune, lamp-post reskin",
   "part": "candelabra",
   "partParams": {}
  },
  {
   "name": "Prize-Counter Stall",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:table-slab",
   "summary": "carnival prize counter, stacked plush, table reskin",
   "part": "table-slab",
   "partParams": {}
  },
  {
   "name": "Coiled Slide Tube",
   "size": "Large",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:arch-frame",
   "summary": "spiral playground slide, dark mouth, gate-slot reskin",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Candy-Cage Kiosk",
   "size": "Small",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:cage-frame",
   "summary": "sugar-crusted candy kiosk, seized spinning drum",
   "part": "cage-frame",
   "partParams": {
    "cheap": true
   }
  },
  {
   "name": "Storm-Cloud Bounce House",
   "size": "Large",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:web-mass",
   "summary": "sagging inflatable castle, wheezing blower, soft mass",
   "part": "web-mass",
   "partParams": {}
  },
  {
   "name": "Ferris Gondola Husk",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:coffin-slab",
   "summary": "detached ferris car, bent-hinge door, box cover",
   "part": "coffin-slab",
   "partParams": {}
  },
  {
   "name": "Ticket-Booth Husk",
   "size": "Medium",
   "cover": "three-quarters",
   "crossRealm": "specific",
   "model": "prop:throne-seat",
   "summary": "gilded ticket-booth seat, looped velvet rope, throne reskin",
   "part": "throne-seat",
   "partParams": {}
  },
  {
   "name": "Fun-House Mirror Rank",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:pillar-broken",
   "summary": "warped mirror row, stretched reflections, obelisk row",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Piled Party Favors",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "all",
   "model": "prop:rubble-scatter",
   "summary": "party-favor debris heap, generic clutter cover",
   "part": "rubble-scatter",
   "partParams": {
    "scale": 0.9
   }
  },
  {
   "name": "Wax Figure Gallery",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:chain-drape",
   "summary": "wax performer row, softening smiles, wall-mounted",
   "part": "chain-drape",
   "partParams": {}
  },
  {
   "name": "Cotton-Candy Stalactites",
   "size": "Large",
   "cover": "none",
   "crossRealm": "specific",
   "model": "prop:gear-cluster",
   "summary": "sugar-strand overgrowth, muffled machinery, no cover",
   "part": "gear-cluster",
   "partParams": {}
  },
  {
   "name": "Tournament Pavilion",
   "size": "Large",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:arch-frame",
   "summary": "striped tournament pavilion, half cover",
   "part": "arch-frame",
   "partParams": {}
  },
  {
   "name": "Heraldic Banner Rank",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "gloom"
   ],
   "model": "prop:pillar-broken",
   "summary": "row of banner poles, half cover",
   "part": "pillar-broken",
   "partParams": {
    "intact": true
   }
  },
  {
   "name": "Flower Planter Box",
   "size": "Small",
   "cover": "half",
   "crossRealm": [
    "suburb"
   ],
   "model": "prop:basin-block",
   "summary": "overflowing flower planter, half cover",
   "part": "basin-block",
   "partParams": {}
  },
  {
   "name": "Reliquary Altar",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:shrine-block",
   "summary": "jeweled reliquary altar, half cover",
   "part": "shrine-block",
   "partParams": {}
  },
  {
   "name": "Carousel Horse",
   "size": "Medium",
   "cover": "half",
   "crossRealm": [
    "suburb"
   ],
   "model": "prop:statue-figure",
   "summary": "carousel horse on pole, half cover",
   "part": "statue-figure",
   "partParams": {
    "pose": "standing"
   }
  },
  {
   "name": "Gumdrop Fountain",
   "size": "Medium",
   "cover": "half",
   "crossRealm": "specific",
   "model": "prop:basin-block",
   "summary": "tiered candy fountain, half cover",
   "part": "basin-block",
   "partParams": {}
  }
 ]
};

/* realmPropsFor(realms): an array of active realm ids (SAME activeRealmsFor(skin,w) shape
   theaterFloorSurfaceInfo's opts.realms already consumes) -> the union of every named realm's
   own REALM_PROPS entries PLUS every corpus-wide crossRealm:"all" prop (folded in once each,
   never per-realm-duplicated — the dedupe law lives here at read time, not at authoring time).
   A prop tagged with an explicit realm-id list (crossRealm is an array) is included when ANY of
   its listed realms is in `realms`. A prop is always read off its OWN home realm's list first
   (crossRealm:"specific" props never leak into another realm's pool at all). Returns [] on a
   missing/empty `realms` or an unloaded REALM_PROPS (never throws — same total-function
   discipline as theaterRealmSurfacePick). */
function realmPropsFor(realms){
  if(typeof REALM_PROPS === "undefined") return [];
  var list = Array.isArray(realms) ? realms : [];
  if(!list.length) return [];
  var wantSet = {};
  list.forEach(function(r){ wantSet[r] = true; });
  var seen = {};
  var out = [];
  function add(p){ if(seen[p.name]) return; seen[p.name] = true; out.push(p); }
  Object.keys(REALM_PROPS).forEach(function(realmId){
    (REALM_PROPS[realmId] || []).forEach(function(p){
      var eligible = wantSet[realmId] ||
        (p.crossRealm === "all") ||
        (Array.isArray(p.crossRealm) && p.crossRealm.some(function(r){ return wantSet[r]; }));
      if(eligible) add(p);
    });
  });
  return out;
}
