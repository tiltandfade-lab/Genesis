/* GENESIS DATA (generated) — data/place-skins.js
   docs/PLACE-GEN.md §2/§5 unit 1 + ADDENDUM §7E "Source format contract" — the
   24-archetype universal PLACE SPINE (`Engine/03. _Tables/05. Realms/Place Spine.md`) + one
   realm SKIN per authored `Place Skin - <Realm>.md` file that relabels/drops/adds/reweights
   it for that world. PLACE_SPINE = [{key,archetype,note,weight,scale,space,staff:{min,max},
   cast:{anchor,ambient:[...]}}, ...] (24 entries). PLACE_SKINS = {realmId: {reskin:{"<key>":
   {label,weight}}, adds:[{key,label,weight,scale,space,staff,cast,note}, ...], namePatterns:
   [...]}}  — reskin.weight null means "inherit the spine default", 0 means "drop" (the
   archetype cannot exist in this realm). ONLY AUTHORED REALMS APPEAR HERE (§7E: missing
   skins are legal — only a subset of realms are authored yet); placeForRealm falls back to
   the frontier skin at roll time for every other realm id, so this is never a hole. PLACE_
   SPACE_CELLS = GRID-LAW footprint bands in 5-ft cells (constants sourced from the DMG24
   Bastion gather, see the comment on the constant in build/gen-place-skins.py). Consumed by
   placeForRealm(realmId,rng,opts) (hand-written below, not generated) — src/engine/
   codex-roll.js's rollPlace() calls it (PLACE-GEN §5 unit 2, not yet wired by this unit).
   GENERATED from the Engine markdown source; never hand-edit — edit the source .md tables +
   re-run `python3 build/gen-place-skins.py`. Added 2026-07-09.
   SCENE_BUCKET_BY_ARCHETYPE/SCENE_BUCKET_DEFAULT/sceneBucketForArchetype (PLACE-GEN §5
   unit 3) map a spine archetypeKey to the ambient scene-bucket vocabulary src/world/
   prep.js already owns (shrine|shop|tavern|market) — hand-maintained in this generator,
   NOT parsed from the markdown source (a scene-bucket is an engine population concern).
   SCENE_DRESSING_BY_ARCHETYPE/SCENE_DRESSING_DEFAULT/SURFACE_TAG_BASES/
   sceneDressingForPlace (PLACE-GEN ADDENDUM §7 unit 8) map a spine archetypeKey to
   {propNames,surface,light} dressing — propNames matched by name against realmPropsFor's
   real prop pool (missing skipped, never a hole), surface an abstract tag resolved against
   REALM_SURFACES' real material vocabulary, light the archetype's authored default off
   THEATER_LIGHT_TABLE's own vocabulary. Hand-maintained in this generator, NOT parsed from
   the markdown source (dressing is an engine population concern, same as the scene-bucket
   map above).
   Classic <script> (shared global scope); defines PLACE_SPINE + PLACE_SKINS +
   PLACE_SPACE_CELLS + placeForRealm + SCENE_BUCKET_BY_ARCHETYPE + SCENE_BUCKET_DEFAULT +
   sceneBucketForArchetype + SCENE_DRESSING_BY_ARCHETYPE + SCENE_DRESSING_DEFAULT +
   SURFACE_TAG_BASES + sceneDressingForPlace. */
const PLACE_SPINE=[
 {
  "key": 1,
  "archetype": "Gathering-place",
  "note": "Where everyone passes through; the social switchboard; rumor's home.",
  "weight": 6,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 1,
   "max": 3
  },
  "cast": {
   "anchor": "trade",
   "ambient": [
    "service",
    "margin"
   ]
  }
 },
 {
  "key": 2,
  "archetype": "Watering-hole",
  "note": "Drink, food, and talk after dark; every side of every feud at adjacent tables.",
  "weight": 8,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 2,
   "max": 4
  },
  "cast": {
   "anchor": "trade",
   "ambient": [
    "service",
    "margin"
   ]
  }
 },
 {
  "key": 3,
  "archetype": "Market",
  "note": "Goods change hands and so does information; haggling is the local theater.",
  "weight": 7,
  "scale": "site",
  "space": "vast",
  "staff": {
   "min": 3,
   "max": 6
  },
  "cast": {
   "anchor": "trade",
   "ambient": [
    "trade",
    "margin"
   ]
  }
 },
 {
  "key": 4,
  "archetype": "Seat-of-power",
  "note": "Where the decisions get made; petitioners wait; guards watch.",
  "weight": 4,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 2,
   "max": 4
  },
  "cast": {
   "anchor": "authority",
   "ambient": [
    "authority",
    "service"
   ]
  }
 },
 {
  "key": 5,
  "archetype": "Hall-of-law",
  "note": "Judgment, records, and the cells under it.",
  "weight": 3,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 2,
   "max": 3
  },
  "cast": {
   "anchor": "authority",
   "ambient": [
    "authority",
    "criminal"
   ]
  }
 },
 {
  "key": 6,
  "archetype": "Shrine",
  "note": "The realm's relationship with the numinous, in one room.",
  "weight": 5,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 1,
   "max": 2
  },
  "cast": {
   "anchor": "faith",
   "ambient": [
    "faith",
    "care"
   ]
  }
 },
 {
  "key": 7,
  "archetype": "House-of-healing",
  "note": "Where the hurt go; the healer knows everyone's wounds and secrets.",
  "weight": 4,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 1,
   "max": 3
  },
  "cast": {
   "anchor": "care",
   "ambient": [
    "care",
    "service"
   ]
  }
 },
 {
  "key": 8,
  "archetype": "Workplace",
  "note": "The town's labor, concentrated; skilled hands and workplace grudges.",
  "weight": 5,
  "scale": "site",
  "space": "vast",
  "staff": {
   "min": 3,
   "max": 6
  },
  "cast": {
   "anchor": "labor",
   "ambient": [
    "labor",
    "craft"
   ]
  }
 },
 {
  "key": 9,
  "archetype": "Workshop",
  "note": "One craftsperson's domain; commissions, repairs, and pride.",
  "weight": 6,
  "scale": "site",
  "space": "cramped",
  "staff": {
   "min": 1,
   "max": 2
  },
  "cast": {
   "anchor": "craft",
   "ambient": [
    "craft"
   ]
  }
 },
 {
  "key": 10,
  "archetype": "Storehouse",
  "note": "Value at rest; guarded, inventoried, and worth robbing.",
  "weight": 4,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 1,
   "max": 2
  },
  "cast": {
   "anchor": "trade",
   "ambient": [
    "labor",
    "authority"
   ]
  }
 },
 {
  "key": 11,
  "archetype": "Lodging",
  "note": "Beds for strangers; the ledger of who passed through.",
  "weight": 6,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 1,
   "max": 3
  },
  "cast": {
   "anchor": "trade",
   "ambient": [
    "service",
    "margin"
   ]
  }
 },
 {
  "key": 12,
  "archetype": "Dwelling",
  "note": "Someone's home; entering means something.",
  "weight": 6,
  "scale": "site",
  "space": "cramped",
  "staff": {
   "min": 1,
   "max": 2
  },
  "cast": {
   "anchor": "any",
   "ambient": [
    "margin",
    "service"
   ]
  }
 },
 {
  "key": 13,
  "archetype": "Threshold",
  "note": "The gate/door/checkpoint between here and elsewhere; someone controls it.",
  "weight": 5,
  "scale": "site",
  "space": "cramped",
  "staff": {
   "min": 1,
   "max": 2
  },
  "cast": {
   "anchor": "authority",
   "ambient": [
    "authority",
    "margin"
   ]
  }
 },
 {
  "key": 14,
  "archetype": "Crossing",
  "note": "Where routes meet; travelers, tolls, and ambush geometry.",
  "weight": 4,
  "scale": "site",
  "space": "vast",
  "staff": {
   "min": 1,
   "max": 2
  },
  "cast": {
   "anchor": "trade",
   "ambient": [
    "margin",
    "criminal"
   ]
  }
 },
 {
  "key": 15,
  "archetype": "Hideout",
  "note": "Where the unwelcome gather out of sight.",
  "weight": 4,
  "scale": "site",
  "space": "cramped",
  "staff": {
   "min": 2,
   "max": 4
  },
  "cast": {
   "anchor": "criminal",
   "ambient": [
    "criminal",
    "margin"
   ]
  }
 },
 {
  "key": 16,
  "archetype": "Vice-den",
  "note": "Pleasure the daylight economy pretends not to see.",
  "weight": 3,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 2,
   "max": 4
  },
  "cast": {
   "anchor": "criminal",
   "ambient": [
    "criminal",
    "elite"
   ]
  }
 },
 {
  "key": 17,
  "archetype": "Ruin",
  "note": "What this place used to be; the past, enterable.",
  "weight": 5,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 0,
   "max": 2
  },
  "cast": {
   "anchor": "margin",
   "ambient": [
    "margin",
    "wild"
   ]
  }
 },
 {
  "key": 18,
  "archetype": "Boneyard",
  "note": "Where the dead are kept, and how the realm feels about them.",
  "weight": 3,
  "scale": "site",
  "space": "vast",
  "staff": {
   "min": 0,
   "max": 1
  },
  "cast": {
   "anchor": "faith",
   "ambient": [
    "margin"
   ]
  }
 },
 {
  "key": 19,
  "archetype": "Watch-post",
  "note": "Eyes on the horizon; first to know, first to die.",
  "weight": 3,
  "scale": "site",
  "space": "cramped",
  "staff": {
   "min": 1,
   "max": 2
  },
  "cast": {
   "anchor": "authority",
   "ambient": [
    "authority"
   ]
  }
 },
 {
  "key": 20,
  "archetype": "Wild-margin",
  "note": "The edge where the settled gives out; foraging, dumping, disappearing.",
  "weight": 4,
  "scale": "site",
  "space": "vast",
  "staff": {
   "min": 0,
   "max": 1
  },
  "cast": {
   "anchor": "wild",
   "ambient": [
    "wild",
    "margin"
   ]
  }
 },
 {
  "key": 21,
  "archetype": "Works",
  "note": "The big shared machine — mill, dock, pump, reactor: what the place runs on.",
  "weight": 4,
  "scale": "site",
  "space": "vast",
  "staff": {
   "min": 2,
   "max": 4
  },
  "cast": {
   "anchor": "labor",
   "ambient": [
    "labor",
    "craft"
   ]
  }
 },
 {
  "key": 22,
  "archetype": "Commons",
  "note": "Open shared ground — square, green, lot — where public things happen.",
  "weight": 5,
  "scale": "site",
  "space": "vast",
  "staff": {
   "min": 0,
   "max": 3
  },
  "cast": {
   "anchor": "any",
   "ambient": [
    "margin",
    "service"
   ]
  }
 },
 {
  "key": 23,
  "archetype": "Seat-of-learning",
  "note": "Records, teaching, maps; who's allowed to know things.",
  "weight": 3,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 1,
   "max": 2
  },
  "cast": {
   "anchor": "faith",
   "ambient": [
    "faith",
    "service"
   ]
  }
 },
 {
  "key": 24,
  "archetype": "Monument",
  "note": "The thing built to be remembered; what it commemorates is contested.",
  "weight": 2,
  "scale": "site",
  "space": "roomy",
  "staff": {
   "min": 0,
   "max": 1
  },
  "cast": {
   "anchor": "any",
   "ambient": [
    "faith",
    "margin"
   ]
  }
 }
];
const PLACE_SKINS={
 "chrome": {
  "reskin": {
   "1": {
    "label": "The 24-hour laundromat",
    "weight": null
   },
   "2": {
    "label": "The noodle bar under the rail line",
    "weight": 10
   },
   "3": {
    "label": "The night market under the overpass",
    "weight": null
   },
   "4": {
    "label": "The corp tower lobby, floor 1 of 200",
    "weight": null
   },
   "5": {
    "label": "The precinct house",
    "weight": 4
   },
   "6": {
    "label": "The street shrine between vending machines",
    "weight": 3
   },
   "7": {
    "label": "The unlicensed clinic over the pawnshop",
    "weight": null
   },
   "8": {
    "label": "The sorting floor",
    "weight": null
   },
   "9": {
    "label": "The sewer-workshop",
    "weight": null
   },
   "10": {
    "label": "The container stack",
    "weight": null
   },
   "11": {
    "label": "The capsule flophouse",
    "weight": null
   },
   "12": {
    "label": "A stacked-block apartment",
    "weight": 8
   },
   "13": {
    "label": "The turnstile checkpoint on the turf line",
    "weight": 7
   },
   "14": {
    "label": "The interchange under the elevated",
    "weight": null
   },
   "15": {
    "label": "The clubhouse behind the arcade",
    "weight": 6
   },
   "16": {
    "label": "The basement fight pit",
    "weight": 4
   },
   "17": {
    "label": "The condemned block",
    "weight": 6
   },
   "18": {
    "label": "The recycler",
    "weight": null
   },
   "19": {
    "label": "The signal tower catwalk",
    "weight": null
   },
   "20": {
    "label": "—",
    "weight": 0
   },
   "21": {
    "label": "The transformer yard",
    "weight": null
   },
   "22": {
    "label": "The handball courts",
    "weight": null
   },
   "23": {
    "label": "The records annex, sublevel 3",
    "weight": null
   },
   "24": {
    "label": "The statue the gangs repaint monthly",
    "weight": null
   }
  },
  "adds": [
   {
    "key": "add:the-subway-platform",
    "label": "The subway platform",
    "weight": 6,
    "scale": "site",
    "space": "roomy",
    "staff": {
     "min": 1,
     "max": 3
    },
    "cast": {
     "anchor": "authority",
     "ambient": [
      "margin",
      "criminal"
     ]
    },
    "note": "Neutral ground by treaty nobody signed; every gang rides, nobody fights on the platform — usually."
   },
   {
    "key": "add:rooftop-territory",
    "label": "Rooftop territory",
    "weight": 4,
    "scale": "site",
    "space": "vast",
    "staff": {
     "min": 0,
     "max": 2
    },
    "cast": {
     "anchor": "criminal",
     "ambient": [
      "criminal",
      "margin"
     ]
    },
    "note": "The city above the city: pigeon coops, painted claims, and the fastest routes for those who can jump."
   },
   {
    "key": "add:the-charging-depot",
    "label": "The charging depot",
    "weight": 3,
    "scale": "site",
    "space": "roomy",
    "staff": {
     "min": 1,
     "max": 2
    },
    "cast": {
     "anchor": "labor",
     "ambient": [
      "labor",
      "authority"
     ]
    },
    "note": "Where the mechs and the fleet drink power; the hum gets into your teeth, and the manifests get into everything."
   },
   {
    "key": "add:the-arcology-mezzanine",
    "label": "The arcology mezzanine",
    "weight": 2,
    "scale": "site",
    "space": "vast",
    "staff": {
     "min": 2,
     "max": 4
    },
    "cast": {
     "anchor": "elite",
     "ambient": [
      "service",
      "authority"
     ]
    },
    "note": "The clean level — planters, security glass, and the exact altitude where the city stops being visible."
   }
  ],
  "namePatterns": []
 },
 "frontier": {
  "reskin": {
   "1": {
    "label": "The trading post porch",
    "weight": null
   },
   "2": {
    "label": "The saloon",
    "weight": null
   },
   "3": {
    "label": "Market day on the main street",
    "weight": null
   },
   "4": {
    "label": "The land office",
    "weight": null
   },
   "5": {
    "label": "The jailhouse",
    "weight": null
   },
   "6": {
    "label": "The plank-board chapel",
    "weight": null
   },
   "7": {
    "label": "The sawbones' surgery",
    "weight": null
   },
   "8": {
    "label": "The stockyards",
    "weight": null
   },
   "9": {
    "label": "The smithy",
    "weight": null
   },
   "10": {
    "label": "The freight depot",
    "weight": null
   },
   "11": {
    "label": "The boarding house",
    "weight": null
   },
   "12": {
    "label": "A homestead",
    "weight": null
   },
   "13": {
    "label": "The town gate palisade",
    "weight": null
   },
   "14": {
    "label": "The ford and its toll rope",
    "weight": null
   },
   "15": {
    "label": "The dry-gulch camp",
    "weight": null
   },
   "16": {
    "label": "The card room behind the saloon",
    "weight": null
   },
   "17": {
    "label": "The burned claim",
    "weight": null
   },
   "18": {
    "label": "Boot hill",
    "weight": null
   },
   "19": {
    "label": "The water tower platform",
    "weight": null
   },
   "20": {
    "label": "The scrubline past the last fence",
    "weight": null
   },
   "21": {
    "label": "The mill by the creek",
    "weight": null
   },
   "22": {
    "label": "The wagon yard",
    "weight": null
   },
   "23": {
    "label": "The assay-and-records office",
    "weight": null
   },
   "24": {
    "label": "The founders' obelisk",
    "weight": null
   }
  },
  "adds": [
   {
    "key": "add:the-stagecoach-relay",
    "label": "The stagecoach relay",
    "weight": 3,
    "scale": "site",
    "space": "roomy",
    "staff": {
     "min": 1,
     "max": 2
    },
    "cast": {
     "anchor": "trade",
     "ambient": [
      "service",
      "margin"
     ]
    },
    "note": "Fresh horses, old news, and everyone who is leaving or arriving passes through its yard."
   },
   {
    "key": "add:the-hanging-tree",
    "label": "The hanging tree",
    "weight": 1,
    "scale": "site",
    "space": "roomy",
    "staff": {
     "min": 0,
     "max": 1
    },
    "cast": {
     "anchor": "any",
     "ambient": [
      "faith",
      "margin"
     ]
    },
    "note": "Justice done fast and outdoors; the town remembers every name it has carried."
   },
   {
    "key": "add:the-claim-diggings",
    "label": "The claim diggings",
    "weight": 3,
    "scale": "site",
    "space": "vast",
    "staff": {
     "min": 1,
     "max": 3
    },
    "cast": {
     "anchor": "labor",
     "ambient": [
      "labor",
      "criminal"
     ]
    },
    "note": "Staked ground, jealously watched; every hole is somebody's hope or somebody's theft."
   }
  ],
  "namePatterns": []
 },
 "gloom": {
  "reskin": {
   "1": {
    "label": "The barbershop",
    "weight": null
   },
   "2": {
    "label": "The diner that closes at 9 sharp",
    "weight": null
   },
   "3": {
    "label": "The Main Street grocery",
    "weight": null
   },
   "4": {
    "label": "The realty office that owns the town",
    "weight": null
   },
   "5": {
    "label": "The sheriff's office and the two cells",
    "weight": null
   },
   "6": {
    "label": "The white-steeple church",
    "weight": null
   },
   "7": {
    "label": "The clinic on Center Street",
    "weight": null
   },
   "8": {
    "label": "The mill that still employs half the town",
    "weight": null
   },
   "9": {
    "label": "The repair shop that fixes anything, no questions",
    "weight": null
   },
   "10": {
    "label": "The self-storage lot by the highway",
    "weight": null
   },
   "11": {
    "label": "The motel off the county route",
    "weight": null
   },
   "12": {
    "label": "A house with the porch light always on",
    "weight": null
   },
   "13": {
    "label": "The town-limits sign nobody walks past at night",
    "weight": null
   },
   "14": {
    "label": "The four-way stop where the routes meet",
    "weight": null
   },
   "15": {
    "label": "The clubhouse under the bridge",
    "weight": null
   },
   "16": {
    "label": "The roadhouse outside town limits",
    "weight": null
   },
   "17": {
    "label": "The house everyone knows not to buy",
    "weight": 7
   },
   "18": {
    "label": "The old cemetery the kids dare each other into",
    "weight": 4
   },
   "19": {
    "label": "The fire lookout on Miller Hill",
    "weight": null
   },
   "20": {
    "label": "The treeline where the yards give out",
    "weight": 6
   },
   "21": {
    "label": "The pump station",
    "weight": null
   },
   "22": {
    "label": "The town green and its bandstand",
    "weight": null
   },
   "23": {
    "label": "The public library",
    "weight": 5
   },
   "24": {
    "label": "The bronze founder nobody researched",
    "weight": null
   }
  },
  "adds": [
   {
    "key": "add:the-standpipe",
    "label": "The standpipe",
    "weight": 3,
    "scale": "site",
    "space": "cramped",
    "staff": {
     "min": 0,
     "max": 1
    },
    "cast": {
     "anchor": "any",
     "ambient": [
      "margin"
     ]
    },
    "note": "The waterworks tower everything in town drinks from; the door has been painted shut for thirty years and the paint is fresh."
   },
   {
    "key": "add:the-fairground-that-shouldn-t-still-be-operating",
    "label": "The fairground that shouldn't still be operating",
    "weight": 2,
    "scale": "site",
    "space": "vast",
    "staff": {
     "min": 2,
     "max": 4
    },
    "cast": {
     "anchor": "trade",
     "ambient": [
      "margin",
      "criminal"
     ]
    },
    "note": "Off-season, every season — and yet the lights run and somebody takes tickets."
   },
   {
    "key": "add:the-barrens",
    "label": "The barrens",
    "weight": 4,
    "scale": "site",
    "space": "vast",
    "staff": {
     "min": 0,
     "max": 1
    },
    "cast": {
     "anchor": "wild",
     "ambient": [
      "margin"
     ]
    },
    "note": "The scrubland where the town dumps what it doesn't discuss; things lost there stay lost, mostly."
   }
  ],
  "namePatterns": [
   "<Family>'s <label>",
   "The <label> on <Street>",
   "The old <Family> place",
   "<Town> <label>"
  ]
 }
};
const PLACE_SPACE_CELLS={
 "cramped": {
  "wMin": 1,
  "wMax": 2,
  "dMin": 1,
  "dMax": 2
 },
 "roomy": {
  "wMin": 3,
  "wMax": 4,
  "dMin": 3,
  "dMax": 4
 },
 "vast": {
  "wMin": 5,
  "wMax": 6,
  "dMin": 5,
  "dMax": 6
 }
};
const ARCHETYPE_BIAS_MULTIPLIER=3;
const SCENE_BUCKET_BY_ARCHETYPE={
 "1": "market",
 "2": "tavern",
 "3": "market",
 "6": "shrine",
 "16": "tavern",
 "22": "market"
};
const SCENE_BUCKET_DEFAULT="shop";
const SCENE_DRESSING_BY_ARCHETYPE={
 "1": {
  "propNames": [
   "Long Bar",
   "Rain Barrel",
   "Wandering Torch",
   "Overflowing Trash Can"
  ],
  "surface": "street",
  "light": "lamplit"
 },
 "2": {
  "propNames": [
   "Long Bar",
   "Grog Barrel Row",
   "Rolling Field Kitchen",
   "Rain Barrel"
  ],
  "surface": "interior-wood",
  "light": "lamplit"
 },
 "3": {
  "propNames": [
   "Market Stall Frame",
   "Shop Counter",
   "Munitions Crate",
   "Trash Can Row",
   "Rolling Field Kitchen"
  ],
  "surface": "street",
  "light": "daylit"
 },
 "4": {
  "propNames": [
   "Judge's Bench",
   "Case-File Desk",
   "Star-Chart Table",
   "Wandering Torch"
  ],
  "surface": "interior-stone",
  "light": "lamplit"
 },
 "5": {
  "propNames": [
   "Judge's Bench",
   "Cell Bar Run",
   "Case-File Desk",
   "Brig Cage"
  ],
  "surface": "interior-stone",
  "light": "torchlit"
 },
 "6": {
  "propNames": [
   "Offertory Table",
   "Weeping Font",
   "Guttering Grave-Torch",
   "Reliquary Crate Stack",
   "Blood-Slick Altar"
  ],
  "surface": "interior-stone",
  "light": "torchlit"
 },
 "7": {
  "propNames": [
   "Embalming Table",
   "Rain Barrel",
   "Duckboard Walkway"
  ],
  "surface": "interior-wood",
  "light": "lamplit"
 },
 "8": {
  "propNames": [
   "Scrap Heap",
   "Cinderblock Stack",
   "Munitions Crate Stack",
   "Slag Heap"
  ],
  "surface": "interior-metal",
  "light": "torchlit"
 },
 "9": {
  "propNames": [
   "Shop Counter",
   "Scrap Heap",
   "Rust Drum",
   "Munitions Crate"
  ],
  "surface": "interior-wood",
  "light": "lamplit"
 },
 "10": {
  "propNames": [
   "Munitions Crate Stack",
   "Ballast Crate Stack",
   "Reliquary Crate Stack",
   "Rust Drum"
  ],
  "surface": "interior-wood",
  "light": "dark"
 },
 "11": {
  "propNames": [
   "Duckboard Walkway",
   "Rain Barrel",
   "Trash Can Row"
  ],
  "surface": "interior-wood",
  "light": "lamplit"
 },
 "12": {
  "propNames": [
   "Rain Barrel",
   "Cobweb Mass",
   "Overflowing Trash Can"
  ],
  "surface": "interior-wood",
  "light": "dark"
 },
 "13": {
  "propNames": [
   "Checkpoint Gate",
   "Rift Grate",
   "Glyph-Warded Grate"
  ],
  "surface": "street",
  "light": "torchlit"
 },
 "14": {
  "propNames": [
   "Storm Drain Grate",
   "Coiled Mooring Rope",
   "Wandering Torch",
   "Cracked Water Cistern"
  ],
  "surface": "street",
  "light": "daylit"
 },
 "15": {
  "propNames": [
   "Cell Bar Run",
   "Cobweb Mass",
   "Scrap Heap",
   "Rotted Coffin"
  ],
  "surface": "earth",
  "light": "dark"
 },
 "16": {
  "propNames": [
   "Long Bar",
   "Grog Barrel Row",
   "Piled Party Favors"
  ],
  "surface": "interior-wood",
  "light": "lamplit"
 },
 "17": {
  "propNames": [
   "Sundered Column Drum",
   "Cobweb Mass",
   "Rotted Coffin",
   "Collapsed Trench Wall"
  ],
  "surface": "earth",
  "light": "dark"
 },
 "18": {
  "propNames": [
   "Stacked Corpse Cairn",
   "Cattle Skull Pile",
   "Rotted Coffin",
   "Guttering Grave-Torch"
  ],
  "surface": "earth",
  "light": "moonlit"
 },
 "19": {
  "propNames": [
   "Wandering Torch",
   "Cinderblock Stack",
   "Storm Drain Grate"
  ],
  "surface": "interior-stone",
  "light": "torchlit"
 },
 "20": {
  "propNames": [
   "Refuse Drift",
   "Cobweb Mass",
   "Cattle Skull Pile"
  ],
  "surface": "open-exterior",
  "light": "overcast"
 },
 "21": {
  "propNames": [
   "Riveted Standpipe Tank",
   "Scrap Heap",
   "Slag Heap",
   "Rust Drum"
  ],
  "surface": "interior-metal",
  "light": "torchlit"
 },
 "22": {
  "propNames": [
   "Overflowing Trash Can",
   "Wandering Torch",
   "Rain Barrel",
   "Trash Can Row"
  ],
  "surface": "street",
  "light": "daylit"
 },
 "23": {
  "propNames": [
   "Star-Chart Table",
   "Case-File Desk",
   "Reliquary Crate Stack"
  ],
  "surface": "interior-stone",
  "light": "lamplit"
 },
 "24": {
  "propNames": [
   "Sundered Column Drum",
   "Wandering Torch",
   "Cinderblock Stack"
  ],
  "surface": "street",
  "light": "moonlit"
 }
};
const SCENE_DRESSING_DEFAULT={"propNames": [], "surface": "interior-wood", "light": "dark"};
const SURFACE_TAG_BASES={
 "interior-wood": [
  "plank"
 ],
 "interior-stone": [
  "flagstone",
  "cave-rock",
  "cobble"
 ],
 "interior-metal": [
  "grating"
 ],
 "street": [
  "cobble",
  "asphalt",
  "mud"
 ],
 "earth": [
  "cracked-earth",
  "mud",
  "leaf-litter",
  "scree"
 ],
 "open-exterior": [
  "grass",
  "scree",
  "snow-ice",
  "sand"
 ]
};

/* placeForRealm(realmId, rng, opts) -> {archetypeKey, label, note, scale, space, staff, cast} —
   PLACE-GEN.md §2/§5 unit 1 "Engine wiring": weighted-pick a spine archetype (skin weight
   override if present, else spine default; weight 0 = excluded) unioned with that realm's own
   [ADD] places (own weight/label/scale/space/staff/cast/note), then weighted-pick ONE entry from
   the combined pool. `rng` is an optional zero-arg fn returning a float in [0,1) (Math.random
   contract) — omit it and this uses Math.random() directly (same defensive style as
   roleForRealm/rollNpcBreachTouch/coherenceAtomGate). realmId falls back to 'frontier' when
   absent/unrecognized OR when no skin file was authored for it yet (§7E: only 3 of 11 realms are
   authored — this is the roll-time fallback that makes the other 8 legal to omit).
   opts.archetypeBias (array of archetype/add keys, string or number) multiplies each listed key's
   pool weight by ARCHETYPE_BIAS_MULTIPLIER (HOOK-WALKS seam, PLACE-GEN §4). opts.excludeScale
   (array of scale tags) drops any pool entry whose scale is listed — accepted now for future use;
   every spine/add row is scale "site" today so this is a no-op until non-site rows exist. Pure —
   no state/DOM access, safe for the jsdom harness. */
function placeForRealm(realmId, rng, opts){
  var rnd = (typeof rng === "function") ? rng : Math.random;
  var bias = (opts && opts.archetypeBias) || [];
  var biasSet = {};
  for(var bi=0; bi<bias.length; bi++) biasSet[String(bias[bi])] = true;
  var excludeScale = {};
  ((opts && opts.excludeScale) || []).forEach(function(s){ excludeScale[s] = true; });
  var skin = (PLACE_SKINS[realmId]) || PLACE_SKINS.frontier || null;
  if(!skin) return null; // defensive: data file failed to load / is empty — never throw
  var pool = [];
  PLACE_SPINE.forEach(function(a){
    if(excludeScale[a.scale]) return;
    var row = skin.reskin[String(a.key)];
    var weight = (row && row.weight !== null && row.weight !== undefined) ? row.weight : a.weight;
    if(!weight) return; // 0 or missing override with a 0 spine default -> dropped
    if(biasSet[String(a.key)]) weight *= ARCHETYPE_BIAS_MULTIPLIER;
    var label = (row && row.label) ? row.label : a.archetype;
    pool.push({archetypeKey:a.key, label:label, note:a.note, scale:a.scale, space:a.space, staff:a.staff, cast:a.cast, weight:weight});
  });
  (skin.adds || []).forEach(function(add){
    if(!add.weight) return;
    if(excludeScale[add.scale]) return;
    var weight = add.weight;
    if(biasSet[add.key]) weight *= ARCHETYPE_BIAS_MULTIPLIER;
    pool.push({archetypeKey:add.key, label:add.label, note:add.note, scale:add.scale, space:add.space, staff:add.staff, cast:add.cast, weight:weight});
  });
  if(!pool.length) return null; // defensive: a malformed skin (or excludeScale) dropped everything — never throw
  var total = 0;
  for(var i=0;i<pool.length;i++) total += pool[i].weight;
  var roll = rnd() * total;
  var acc = 0;
  for(var j=0;j<pool.length;j++){
    acc += pool[j].weight;
    if(roll < acc) return {archetypeKey:pool[j].archetypeKey, label:pool[j].label, note:pool[j].note, scale:pool[j].scale, space:pool[j].space, staff:pool[j].staff, cast:pool[j].cast};
  }
  var last = pool[pool.length-1]; // float-rounding guard, same pattern as roleForRealm/pickCoherenceTier
  return {archetypeKey:last.archetypeKey, label:last.label, note:last.note, scale:last.scale, space:last.space, staff:last.staff, cast:last.cast};
}

/* sceneBucketForArchetype(archetypeKey) -> one of "shrine"|"shop"|"tavern"|"market" — PLACE-GEN.md
   §5 unit 3: resolves a minted place's spine archetypeKey to the ambient-population scene-bucket
   vocabulary src/world/prep.js already owns (AMBIENT_SCENE_BASE/SCENE_PARTIALS). ALWAYS resolves —
   an unmapped spine key or any realm [ADD] key (SCENE_BUCKET_BY_ARCHETYPE only covers universal
   spine rows, per this file's own comment) falls through to SCENE_BUCKET_DEFAULT, never undefined. */
function sceneBucketForArchetype(archetypeKey){
  if(archetypeKey==null) return SCENE_BUCKET_DEFAULT;
  var hit = SCENE_BUCKET_BY_ARCHETYPE[String(archetypeKey)];
  return hit || SCENE_BUCKET_DEFAULT;
}

/* sceneDressingForPlace(realmId, archetypeKey) -> {props:[...], surface, light} — PLACE-GEN.md
   ADDENDUM §7 unit 8: resolves a minted place's spine archetypeKey (or an add:* key) to concrete
   dressing for that realm. props: SCENE_DRESSING_BY_ARCHETYPE[archetypeKey].propNames matched BY
   NAME against realmPropsFor([realmId])'s pool — a name with no match is SKIPPED (never a hole,
   never a throw; the array is simply shorter). surface: the archetype's abstract SURFACE_TAG_
   resolved against REALM_SURFACES[realmId] (fallback 'frontier', same convention as placeForRealm)
   -> the first surface entry whose base is in that tag's material list, or that realm's first
   surface entry if nothing matches (never undefined). light: the archetype's authored default
   light-profile, straight from THEATER_LIGHT_TABLE's own vocabulary (src/engine/theater-data.js) —
   not re-rolled here, this is an authored per-archetype fact layered under the battle-theater's own
   dice/keyword seam. An unmapped archetypeKey (an add:* key with no per-skin override, or any
   future spine key) falls through to SCENE_DRESSING_DEFAULT. Pure, defensive — never throws even
   when REALM_PROPS/REALM_SURFACES/realmPropsFor haven't loaded (returns empty props / undefined
   surface only in that unloaded-data edge case, same defensive tier as placeForRealm's own guards). */
function sceneDressingForPlace(realmId, archetypeKey){
  var dress = SCENE_DRESSING_BY_ARCHETYPE[String(archetypeKey)] || SCENE_DRESSING_DEFAULT;
  var props = [];
  if(typeof realmPropsFor === "function"){
    var pool = realmPropsFor([realmId || "frontier"]);
    var byName = {};
    pool.forEach(function(p){ byName[p.name] = p; });
    (dress.propNames || []).forEach(function(n){ if(byName[n]) props.push(byName[n]); });
  }
  var surface = null;
  if(typeof REALM_SURFACES !== "undefined"){
    var surfaces = REALM_SURFACES[realmId] || REALM_SURFACES.frontier || [];
    var bases = SURFACE_TAG_BASES[dress.surface] || [];
    var baseSet = {};
    bases.forEach(function(b){ baseSet[b] = true; });
    for(var i=0; i<surfaces.length; i++){
      if(baseSet[surfaces[i].base]){ surface = surfaces[i]; break; }
    }
    if(!surface && surfaces.length) surface = surfaces[0];
  }
  return {props: props, surface: surface, light: dress.light};
}
