/* GENESIS DATA (generated) — data/npc-role-skins.js
   docs/NPC-ROLE-REALMS.md "Data seam" — the 35-archetype universal role SPINE
   (`Engine/03. _Tables/02. Social/Sentient NPCs/NPC Role Spine.md`) + one realm SKIN per
   `data/realms.js` REALM_ID (`NPC Role Skin - <Realm>.md`) that relabels/drops/adds/reweights
   it for that world. NPC_ROLE_SPINE = [{key,archetype,note,weight,cls}, ...] (35 entries, the
   universal play-angle + default Weight). NPC_ROLE_SKINS = {realmId: {reskin:{"<key>":
   {label,weight}}, adds:[{role,weight,cls,note}, ...]}} — reskin.weight null means "inherit
   the spine default", 0 means "drop" (the archetype cannot exist in this realm). Consumed by
   roleForRealm(realmId,rng) (hand-written below, not generated) — src/engine/codex-roll.js's
   rollNPC() calls it in place of the old flat rollTable("npc-role"). GENERATED from the
   Engine markdown source; never hand-edit — edit the source .md tables + re-run
   `python3 build/gen-role-skins.py`. Added 2026-07-08.
   Classic <script> (shared global scope); defines NPC_ROLE_SPINE + NPC_ROLE_SKINS + roleForRealm. */
const NPC_ROLE_SPINE=[
 {
  "key": 1,
  "archetype": "Land-worker",
  "note": "Tied to the land and its seasons; the base everyone eats from.",
  "weight": 6,
  "cls": "labor"
 },
 {
  "key": 2,
  "archetype": "Wild-provider",
  "note": "Reads the wild and brings in what the settled can't.",
  "weight": 8,
  "cls": "wild"
 },
 {
  "key": 3,
  "archetype": "Hauler",
  "note": "Moves the heavy things; sees everything, is asked nothing.",
  "weight": 10,
  "cls": "labor"
 },
 {
  "key": 4,
  "archetype": "Delver",
  "note": "Works the dark and the tight places; patient underground.",
  "weight": 4,
  "cls": "labor"
 },
 {
  "key": 5,
  "archetype": "Servant",
  "note": "Invisible to the powerful, and so hears every secret.",
  "weight": 4,
  "cls": "service"
 },
 {
  "key": 6,
  "archetype": "Destitute",
  "note": "Has nothing, so knows the streets better than anyone.",
  "weight": 3,
  "cls": "margin"
 },
 {
  "key": 7,
  "archetype": "Maker",
  "note": "Their tools carry their whole history.",
  "weight": 5,
  "cls": "craft"
 },
 {
  "key": 8,
  "archetype": "Metalworker",
  "note": "Calloused hands; deals in practical defense.",
  "weight": 3,
  "cls": "craft"
 },
 {
  "key": 9,
  "archetype": "Feeder",
  "note": "Up before dawn; holds the neighborhood's gossip.",
  "weight": 3,
  "cls": "craft"
 },
 {
  "key": 10,
  "archetype": "Builder",
  "note": "Reads every structure out of habit; knows what's load-bearing.",
  "weight": 3,
  "cls": "craft"
 },
 {
  "key": 11,
  "archetype": "Clothier",
  "note": "Notices the cut and quality of everyone's clothes.",
  "weight": 3,
  "cls": "craft"
 },
 {
  "key": 12,
  "archetype": "Outfitter",
  "note": "Keeps the means of travel and trade running; eyes on the weather.",
  "weight": 3,
  "cls": "craft"
 },
 {
  "key": 13,
  "archetype": "Trader",
  "note": "Information-rich, truth-poor.",
  "weight": 4,
  "cls": "trade"
 },
 {
  "key": 14,
  "archetype": "Host",
  "note": "Controls the space, not the people in it.",
  "weight": 3,
  "cls": "trade"
 },
 {
  "key": 15,
  "archetype": "Remedy-maker",
  "note": "Smells of bitterroot; knows what heals and what doesn't.",
  "weight": 3,
  "cls": "care"
 },
 {
  "key": 16,
  "archetype": "Healer",
  "note": "Trusted, and overburdened by it.",
  "weight": 2,
  "cls": "care"
 },
 {
  "key": 17,
  "archetype": "Rite-keeper",
  "note": "Maintains the ritual, not the doctrine.",
  "weight": 2,
  "cls": "faith"
 },
 {
  "key": 18,
  "archetype": "Performer",
  "note": "Craves the attention; hides the true feeling under it.",
  "weight": 1,
  "cls": "service"
 },
 {
  "key": 19,
  "archetype": "Enforcer",
  "note": "Authority-adjacent, with limited real power.",
  "weight": 4,
  "cls": "authority"
 },
 {
  "key": 20,
  "archetype": "Hired-blade",
  "note": "Loyalty bought with coin, and cynical about it.",
  "weight": 2,
  "cls": "criminal"
 },
 {
  "key": 21,
  "archetype": "Road-guard",
  "note": "Wary of the road; values a good pair of boots.",
  "weight": 2,
  "cls": "authority"
 },
 {
  "key": 22,
  "archetype": "Outlaw",
  "note": "Desperate or cruel; lives outside the law.",
  "weight": 3,
  "cls": "criminal"
 },
 {
  "key": 23,
  "archetype": "Smuggler",
  "note": "Hides the cargo; speaks only in euphemism.",
  "weight": 2,
  "cls": "criminal"
 },
 {
  "key": 24,
  "archetype": "Thief",
  "note": "Eyes every coin-pouch; avoids every eye.",
  "weight": 2,
  "cls": "criminal"
 },
 {
  "key": 25,
  "archetype": "Hidden-fanatic",
  "note": "Fanatical devotion behind a mundane face.",
  "weight": 2,
  "cls": "faith"
 },
 {
  "key": 26,
  "archetype": "Recruiter",
  "note": "Charisma aimed at the desperate; sells belonging.",
  "weight": 2,
  "cls": "faith"
 },
 {
  "key": 27,
  "archetype": "Outsider",
  "note": "Chose to stay here; the reasons stay unclear.",
  "weight": 2,
  "cls": "margin"
 },
 {
  "key": 28,
  "archetype": "Recluse",
  "note": "Known of, rarely seen.",
  "weight": 1,
  "cls": "margin"
 },
 {
  "key": 29,
  "archetype": "Stand-in",
  "note": "Filling in for someone absent; borrowed authority.",
  "weight": 1,
  "cls": "authority"
 },
 {
  "key": 30,
  "archetype": "Unofficial-power",
  "note": "Power without a title.",
  "weight": 1,
  "cls": "authority"
 },
 {
  "key": 31,
  "archetype": "Misfit",
  "note": "Unqualified, unwilling, or both — and in the role anyway.",
  "weight": 1,
  "cls": "margin"
 },
 {
  "key": 32,
  "archetype": "Pampered-elite",
  "note": "Wealthy, bored, insulated from real consequence.",
  "weight": 2,
  "cls": "elite"
 },
 {
  "key": 33,
  "archetype": "Magnate",
  "note": "Sees every interaction as a transaction.",
  "weight": 1,
  "cls": "elite"
 },
 {
  "key": 34,
  "archetype": "Secret-scholar",
  "note": "Hoards the secret knowledge; sees others as material.",
  "weight": 1,
  "cls": "faith"
 },
 {
  "key": 35,
  "archetype": "Cipher",
  "note": "Their very presence is the notable thing.",
  "weight": 1,
  "cls": "margin"
 }
];
const NPC_ROLE_SKINS={
 "frontier": {
  "reskin": {
   "1": {
    "label": "Farmer or Grower",
    "weight": null
   },
   "2": {
    "label": "Hunter, Fisher, or Trapper",
    "weight": null
   },
   "3": {
    "label": "Laborer, Porter, or Dockhand",
    "weight": null
   },
   "4": {
    "label": "Miner or Excavator",
    "weight": null
   },
   "5": {
    "label": "Servant or Maid",
    "weight": null
   },
   "6": {
    "label": "Beggar or Urchin",
    "weight": null
   },
   "7": {
    "label": "Crafter or Artisan",
    "weight": null
   },
   "8": {
    "label": "Blacksmith or Farrier",
    "weight": null
   },
   "9": {
    "label": "Baker or Cook",
    "weight": null
   },
   "10": {
    "label": "Mason or Carpenter",
    "weight": null
   },
   "11": {
    "label": "Tailor or Weaver",
    "weight": null
   },
   "12": {
    "label": "Wheelwright or Ostler",
    "weight": null
   },
   "13": {
    "label": "Merchant or Trader",
    "weight": null
   },
   "14": {
    "label": "Innkeeper or Tavernkeeper",
    "weight": null
   },
   "15": {
    "label": "Herbalist or Apothecary",
    "weight": null
   },
   "16": {
    "label": "Physician or Midwife",
    "weight": null
   },
   "17": {
    "label": "Preacher or Acolyte",
    "weight": null
   },
   "18": {
    "label": "Bard or Traveling Player",
    "weight": null
   },
   "19": {
    "label": "Town Guard or Constable",
    "weight": null
   },
   "20": {
    "label": "Sellsword or Hired Gun",
    "weight": null
   },
   "21": {
    "label": "Caravan Guard or Outrider",
    "weight": null
   },
   "22": {
    "label": "Bandit or Road-agent",
    "weight": null
   },
   "23": {
    "label": "Smuggler or Fence",
    "weight": null
   },
   "24": {
    "label": "Cutpurse or Burglar",
    "weight": null
   },
   "25": {
    "label": "Hidden Zealot",
    "weight": null
   },
   "26": {
    "label": "Cult Recruiter or Crimper",
    "weight": null
   },
   "27": {
    "label": "Foreign Settler or Drifter",
    "weight": null
   },
   "28": {
    "label": "Hermit",
    "weight": null
   },
   "29": {
    "label": "Acting Deputy",
    "weight": null
   },
   "30": {
    "label": "Town Boss",
    "weight": null
   },
   "31": {
    "label": "Reluctant Officeholder",
    "weight": null
   },
   "32": {
    "label": "Landed Gentry",
    "weight": null
   },
   "33": {
    "label": "Land Baron or Trade Magnate",
    "weight": null
   },
   "34": {
    "label": "Hedge-Scholar or Collector",
    "weight": null
   },
   "35": {
    "label": "Stranger (the notable presence)",
    "weight": null
   }
  },
  "adds": [
   {
    "role": "Marshal / lawman",
    "weight": 2,
    "cls": "authority",
    "note": "The last honest law for a hundred miles; the badge means a little less each year."
   },
   {
    "role": "Gunslinger-for-hire",
    "weight": 2,
    "cls": "criminal",
    "note": "Reputation is the whole résumé — and someone always rides in to test it."
   },
   {
    "role": "Homesteader",
    "weight": 3,
    "cls": "margin",
    "note": "Staked a claim the map won't recognize yet, and will die on it."
   },
   {
    "role": "Company / railroad agent",
    "weight": 1,
    "cls": "elite",
    "note": "Buying the future out from under everyone, politely, with papers."
   },
   {
    "role": "Prospector",
    "weight": 3,
    "cls": "wild",
    "note": "One strike from rich, ten years from broke, and can't stop."
   },
   {
    "role": "Circuit judge",
    "weight": 1,
    "cls": "authority",
    "note": "The law itself, in town three days a month, gone before the appeals."
   },
   {
    "role": "Cattle baron",
    "weight": 1,
    "cls": "elite",
    "note": "Owns the range, and the water rights everyone else has to cross."
   },
   {
    "role": "Wanted outlaw",
    "weight": 2,
    "cls": "criminal",
    "note": "A face on a poster, worth more dead — and starting to believe it."
   }
  ]
 },
 "chrome": {
  "reskin": {
   "1": {
    "label": "Vat-farmer or Algae-tender",
    "weight": 2
   },
   "2": {
    "label": "—",
    "weight": 0
   },
   "3": {
    "label": "Freight-runner or Loader-drone handler",
    "weight": 10
   },
   "4": {
    "label": "Undercity crawler or Conduit-tech",
    "weight": 6
   },
   "5": {
    "label": "Domestic synth or Contract menial",
    "weight": 6
   },
   "6": {
    "label": "No-implant drifter or Gutter-ganger",
    "weight": 6
   },
   "7": {
    "label": "Fabricator or Print-jockey",
    "weight": null
   },
   "8": {
    "label": "Chop-shop welder or Frame-tech",
    "weight": null
   },
   "9": {
    "label": "Noodle-stall cook or Ration-line hand",
    "weight": null
   },
   "10": {
    "label": "Habitat-tech or Structural rigger",
    "weight": null
   },
   "11": {
    "label": "Wetwear tailor or Synth-weave designer",
    "weight": null
   },
   "12": {
    "label": "Docking-bay outfitter or Drone-wrangler",
    "weight": null
   },
   "13": {
    "label": "Grey-market broker or Chip-and-goods trader",
    "weight": 5
   },
   "14": {
    "label": "Chem-lounge host or Dive-bar op",
    "weight": 4
   },
   "15": {
    "label": "Back-alley chemist or Nerve-tonic brewer",
    "weight": null
   },
   "16": {
    "label": "Trauma-clinic tech or Patch-medic",
    "weight": 3
   },
   "17": {
    "label": "Machine-cult tender or Upload-shrine keeper",
    "weight": 3
   },
   "18": {
    "label": "Holo-idol or Broadcast busker",
    "weight": null
   },
   "19": {
    "label": "Corp security or Sector cop",
    "weight": 6
   },
   "20": {
    "label": "Chrome-arm muscle or Contract enforcer",
    "weight": 3
   },
   "21": {
    "label": "Convoy escort or Airlock sentry",
    "weight": null
   },
   "22": {
    "label": "Ganger or Void-pirate",
    "weight": 4
   },
   "23": {
    "label": "Chip-smuggler or Contraband runner",
    "weight": 4
   },
   "24": {
    "label": "Data-thief or Cred-skimmer",
    "weight": 5
   },
   "25": {
    "label": "Machine-zealot behind a work badge",
    "weight": null
   },
   "26": {
    "label": "Corp headhunter or Upload-cult recruiter",
    "weight": null
   },
   "27": {
    "label": "Off-world transplant or Undocumented arrival",
    "weight": null
   },
   "28": {
    "label": "Firewall recluse or Off-grid hermit",
    "weight": null
   },
   "29": {
    "label": "Acting shift-supervisor",
    "weight": null
   },
   "30": {
    "label": "Block boss or Corridor fixer",
    "weight": 2
   },
   "31": {
    "label": "Unlicensed operator or Glitch-hire",
    "weight": null
   },
   "32": {
    "label": "Gated-tower scion or Augment-flush heir",
    "weight": null
   },
   "33": {
    "label": "Founder-tycoon or Habitat magnate",
    "weight": null
   },
   "34": {
    "label": "Rogue archivist or AI-whisperer",
    "weight": null
   },
   "35": {
    "label": "The unregistered face",
    "weight": null
   }
  },
  "adds": [
   {
    "role": "Fixer / tech",
    "weight": 3,
    "cls": "craft",
    "note": "Keeps the dying machines limping; the only one who still reads the lost manual."
   },
   {
    "role": "Corp drone",
    "weight": 4,
    "cls": "service",
    "note": "Badge, quota, and a loyalty that expires with the contract."
   },
   {
    "role": "Courier",
    "weight": 4,
    "cls": "trade",
    "note": "Moves data or bodies through the corridors, fast, no questions logged."
   },
   {
    "role": "Ripperdoc",
    "weight": 2,
    "cls": "criminal",
    "note": "Installs the upgrades no licensed clinic will touch."
   },
   {
    "role": "Synth-minder",
    "weight": 1,
    "cls": "authority",
    "note": "Speaks for the thing that isn't supposed to speak — and might be listening."
   },
   {
    "role": "Data-broker",
    "weight": 2,
    "cls": "trade",
    "note": "Buys and sells what people forgot was ever recorded."
   },
   {
    "role": "Decommissioned unit",
    "weight": 2,
    "cls": "margin",
    "note": "Obsolete, discharged, still armed and still running old orders."
   },
   {
    "role": "Habitat-warden",
    "weight": 1,
    "cls": "authority",
    "note": "Keeps life-support running; holds everyone's air, quietly, in one hand."
   },
   {
    "role": "Splice-addict",
    "weight": 3,
    "cls": "margin",
    "note": "Chasing the next upgrade past what a body was meant to hold."
   },
   {
    "role": "Corporate exec",
    "weight": 1,
    "cls": "elite",
    "note": "A quarterly god; the battery under the whole town is a line on their sheet."
   }
  ]
 },
 "noir": {
  "reskin": {
   "1": {
    "label": "—",
    "weight": 0
   },
   "2": {
    "label": "—",
    "weight": 0
   },
   "3": {
    "label": "Longshoreman or Teamster",
    "weight": 10
   },
   "4": {
    "label": "Sandhog or Sewer-man",
    "weight": null
   },
   "5": {
    "label": "Hotel bellhop or Charwoman",
    "weight": null
   },
   "6": {
    "label": "Vagrant or Flophouse tenant",
    "weight": null
   },
   "7": {
    "label": "Machinist or Repairman",
    "weight": null
   },
   "8": {
    "label": "Gunsmith or Locksmith",
    "weight": null
   },
   "9": {
    "label": "Diner cook or Lunch-counter man",
    "weight": null
   },
   "10": {
    "label": "Construction hand or Building super",
    "weight": null
   },
   "11": {
    "label": "Tailor or Seamstress",
    "weight": null
   },
   "12": {
    "label": "—",
    "weight": 0
   },
   "13": {
    "label": "Pawnbroker or Wholesaler",
    "weight": 5
   },
   "14": {
    "label": "Barkeep or Club owner",
    "weight": 5
   },
   "15": {
    "label": "Chemist or Pharmacist",
    "weight": null
   },
   "16": {
    "label": "Back-alley doctor or Nurse",
    "weight": null
   },
   "17": {
    "label": "Parish priest",
    "weight": null
   },
   "18": {
    "label": "Nightclub act or Emcee",
    "weight": null
   },
   "19": {
    "label": "Beat cop or Precinct detective",
    "weight": 6
   },
   "20": {
    "label": "Triggerman or Leg-breaker",
    "weight": 3
   },
   "21": {
    "label": "Bodyguard or Wheelman",
    "weight": null
   },
   "22": {
    "label": "Stick-up man or Heist crew",
    "weight": 4
   },
   "23": {
    "label": "Bootlegger or Runner",
    "weight": 4
   },
   "24": {
    "label": "Second-story man or Grifter",
    "weight": 4
   },
   "25": {
    "label": "True-believer behind a clerk's face",
    "weight": null
   },
   "26": {
    "label": "Union organizer or Outfit recruiter",
    "weight": null
   },
   "27": {
    "label": "Immigrant newcomer or Out-of-towner",
    "weight": null
   },
   "28": {
    "label": "Shut-in",
    "weight": null
   },
   "29": {
    "label": "Acting captain or Understudy",
    "weight": null
   },
   "30": {
    "label": "Ward boss or Neighborhood fixer",
    "weight": 2
   },
   "31": {
    "label": "In-over-their-head appointee",
    "weight": null
   },
   "32": {
    "label": "Society heir or Kept socialite",
    "weight": null
   },
   "33": {
    "label": "Shipping or real-estate magnate",
    "weight": null
   },
   "34": {
    "label": "Occult collector or Alienist",
    "weight": null
   },
   "35": {
    "label": "The stranger in the good suit",
    "weight": null
   }
  },
  "adds": [
   {
    "role": "Private eye",
    "weight": 3,
    "cls": "margin",
    "note": "Takes the case nobody else will, for money they'll probably never see."
   },
   {
    "role": "Fatale",
    "weight": 2,
    "cls": "criminal",
    "note": "The reason the case exists; wants the one thing you can't hand over."
   },
   {
    "role": "Crooked D.A. / captain",
    "weight": 1,
    "cls": "authority",
    "note": "The law, for sale, with a smile and a firm handshake."
   },
   {
    "role": "Stool-pigeon",
    "weight": 2,
    "cls": "criminal",
    "note": "Sells whispers; terrified of the morning the buyer decides they're done."
   },
   {
    "role": "Torch singer",
    "weight": 2,
    "cls": "service",
    "note": "The club fixture who sees exactly who meets whom after midnight."
   },
   {
    "role": "Honest beat cop",
    "weight": 2,
    "cls": "authority",
    "note": "The one clean badge on the force, and it's killing their career."
   },
   {
    "role": "Mob accountant",
    "weight": 1,
    "cls": "criminal",
    "note": "Makes the problems and the receipts disappear, in that order."
   },
   {
    "role": "Widow with a policy",
    "weight": 2,
    "cls": "margin",
    "note": "Grieving, insured, and lying about exactly one thing."
   },
   {
    "role": "Newshound",
    "weight": 2,
    "cls": "trade",
    "note": "Chases the story past the point where it's safe to print."
   },
   {
    "role": "Numbers-runner",
    "weight": 3,
    "cls": "criminal",
    "note": "The block's small-time bank, and owes upward every single week."
   }
  ]
 },
 "ash": {
  "reskin": {
   "1": {
    "label": "Dirt-farmer (scorched rows, hydroponic scraps)",
    "weight": 3
   },
   "2": {
    "label": "Waste-hunter",
    "weight": 10
   },
   "3": {
    "label": "Convoy hand",
    "weight": 12
   },
   "4": {
    "label": "Ruin-diver or Vault-delver",
    "weight": 8
   },
   "5": {
    "label": "Bonded hand (indentured to a warlord or hoarder)",
    "weight": null
   },
   "6": {
    "label": "The Starving",
    "weight": 6
   },
   "7": {
    "label": "Salvage-tinker",
    "weight": 6
   },
   "8": {
    "label": "Scrap-smith",
    "weight": null
   },
   "9": {
    "label": "Ration-cook",
    "weight": null
   },
   "10": {
    "label": "Wall-raiser",
    "weight": 4
   },
   "11": {
    "label": "Rag-mender",
    "weight": null
   },
   "12": {
    "label": "Rig-mechanic",
    "weight": 5
   },
   "13": {
    "label": "Barter-runner",
    "weight": 5
   },
   "14": {
    "label": "Waystation-keeper",
    "weight": null
   },
   "15": {
    "label": "Herb-scrounger",
    "weight": null
   },
   "16": {
    "label": "Settlement medic",
    "weight": 3
   },
   "17": {
    "label": "Keeper of the old rites",
    "weight": null
   },
   "18": {
    "label": "Waste-bard",
    "weight": null
   },
   "19": {
    "label": "Warlord's enforcer",
    "weight": 6
   },
   "20": {
    "label": "Gun-for-hire",
    "weight": 4
   },
   "21": {
    "label": "Convoy escort",
    "weight": 4
   },
   "22": {
    "label": "Raider",
    "weight": 6
   },
   "23": {
    "label": "Black-market runner",
    "weight": 4
   },
   "24": {
    "label": "Camp-rat",
    "weight": null
   },
   "25": {
    "label": "Believer in plain clothes",
    "weight": null
   },
   "26": {
    "label": "Warlord's press-gang boss",
    "weight": 3
   },
   "27": {
    "label": "Wastelander from beyond the map",
    "weight": null
   },
   "28": {
    "label": "Bunker hermit",
    "weight": 2
   },
   "29": {
    "label": "Acting boss (the old one didn't come back)",
    "weight": null
   },
   "30": {
    "label": "Settlement fixer",
    "weight": 2
   },
   "31": {
    "label": "Conscript who never should've held the rifle",
    "weight": null
   },
   "32": {
    "label": "—",
    "weight": 0
   },
   "33": {
    "label": "—",
    "weight": 0
   },
   "34": {
    "label": "Archive-keeper",
    "weight": 2
   },
   "35": {
    "label": "The one who remembers before",
    "weight": null
   }
  },
  "adds": [
   {
    "role": "Scavenger",
    "weight": 4,
    "cls": "wild",
    "note": "Reads a dead town for the one thing left in it that still works."
   },
   {
    "role": "Warlord",
    "weight": 2,
    "cls": "authority",
    "note": "Owns the water, the fuel, or the guns — and that's the whole law now."
   },
   {
    "role": "Vault-hoarder",
    "weight": 1,
    "cls": "elite",
    "note": "Sits on a stockpile everyone else has decided is theirs by right."
   },
   {
    "role": "Waste-healer",
    "weight": 2,
    "cls": "care",
    "note": "Trades clean water for wounds; knows which sickness is the new kind."
   },
   {
    "role": "Cult-of-the-before",
    "weight": 2,
    "cls": "faith",
    "note": "Worships the world that ended; keeps a dead machine as its shrine."
   },
   {
    "role": "Water-baron",
    "weight": 1,
    "cls": "elite",
    "note": "Holds the one clean source, and rations it out like a small god."
   },
   {
    "role": "Radio-voice",
    "weight": 1,
    "cls": "service",
    "note": "Broadcasts into the waste; the only thing every survivor still shares."
   },
   {
    "role": "Marked-by-the-end",
    "weight": 2,
    "cls": "margin",
    "note": "Changed by what happened — feared, and quietly indispensable."
   },
   {
    "role": "Convoy-runner",
    "weight": 3,
    "cls": "trade",
    "note": "Moves goods between dead towns, armored, paranoid, and usually right to be."
   },
   {
    "role": "Reclaimer",
    "weight": 2,
    "cls": "faith",
    "note": "Trying to restart one dead thing — a pump, a field, a school — against all sense."
   }
  ]
 },
 "suburb": {
  "reskin": {
   "1": {
    "label": "Landscaper or Lawn crew",
    "weight": 3
   },
   "2": {
    "label": "—",
    "weight": 0
   },
   "3": {
    "label": "Garbage-truck driver or Moving crew",
    "weight": 10
   },
   "4": {
    "label": "Utility repairman or Storm-drain crew",
    "weight": null
   },
   "5": {
    "label": "Housekeeper or Pool cleaner",
    "weight": 6
   },
   "6": {
    "label": "Runaway or Squatter in the half-built lot",
    "weight": 1
   },
   "7": {
    "label": "Craft-fair hobbyist or Weekend woodworker",
    "weight": null
   },
   "8": {
    "label": "Locksmith or Auto mechanic",
    "weight": null
   },
   "9": {
    "label": "Donut-shop baker or Diner cook",
    "weight": null
   },
   "10": {
    "label": "Subdivision contractor",
    "weight": 5
   },
   "11": {
    "label": "Mall boutique clerk",
    "weight": null
   },
   "12": {
    "label": "Gas-station attendant or Bike-shop owner",
    "weight": null
   },
   "13": {
    "label": "Realtor",
    "weight": 6
   },
   "14": {
    "label": "Pizza-parlor or Roller-rink owner",
    "weight": null
   },
   "15": {
    "label": "Drugstore pharmacist",
    "weight": null
   },
   "16": {
    "label": "Family physician or Pediatrician",
    "weight": null
   },
   "17": {
    "label": "Parish minister or Sunday-school teacher",
    "weight": null
   },
   "18": {
    "label": "Local radio DJ or Talent-show emcee",
    "weight": null
   },
   "19": {
    "label": "Patrol cop",
    "weight": 6
   },
   "20": {
    "label": "Repo man",
    "weight": 1
   },
   "21": {
    "label": "School crossing guard",
    "weight": 4
   },
   "22": {
    "label": "Joyriding delinquent",
    "weight": null
   },
   "23": {
    "label": "Backroom bootleg-tape dealer",
    "weight": 1
   },
   "24": {
    "label": "Shoplifter or Bike-thief",
    "weight": null
   },
   "25": {
    "label": "Devout neighbor with a locked basement",
    "weight": 4
   },
   "26": {
    "label": "Door-to-door salesman",
    "weight": null
   },
   "27": {
    "label": "New family on the block",
    "weight": 5
   },
   "28": {
    "label": "Shut-in at the end of the cul-de-sac",
    "weight": 3
   },
   "29": {
    "label": "Substitute teacher",
    "weight": null
   },
   "30": {
    "label": "PTA president or Neighborhood alpha-dad",
    "weight": null
   },
   "31": {
    "label": "Reluctant Little League coach",
    "weight": null
   },
   "32": {
    "label": "Country-club parents",
    "weight": null
   },
   "33": {
    "label": "Subdivision developer",
    "weight": null
   },
   "34": {
    "label": "Ham-radio conspiracy buff",
    "weight": null
   },
   "35": {
    "label": "The kid nobody remembers enrolling",
    "weight": null
   }
  },
  "adds": [
   {
    "role": "HOA committee-member",
    "weight": 2,
    "cls": "authority",
    "note": "Enforces the standards; smiles harder the more you contradict them."
   },
   {
    "role": "Too-friendly neighbor",
    "weight": 3,
    "cls": "margin",
    "note": "Waves too fast, knows your schedule, means well — allegedly."
   },
   {
    "role": "The model family",
    "weight": 1,
    "cls": "elite",
    "note": "Too perfect; something in that household keeps very regular hours."
   },
   {
    "role": "Block captain",
    "weight": 2,
    "cls": "authority",
    "note": "Organizes the watch, the potluck, and the reporting. Especially the reporting."
   },
   {
    "role": "Garage inventor",
    "weight": 2,
    "cls": "craft",
    "note": "The block's harmless genius, allegedly; the garage hums at odd hours."
   },
   {
    "role": "Arcade king",
    "weight": 2,
    "cls": "margin",
    "note": "Rules the mall cabinets; the high score is his whole identity."
   },
   {
    "role": "Video-store clerk",
    "weight": 3,
    "cls": "service",
    "note": "Knows every tape, every late fee, and what gets rented after dark."
   },
   {
    "role": "Homecoming royalty",
    "weight": 2,
    "cls": "elite",
    "note": "Peaks this year, letterman and all — and some part of them knows it."
   },
   {
    "role": "The bully",
    "weight": 2,
    "cls": "criminal",
    "note": "The wrongness with a letterman jacket and a car that's too nice."
   },
   {
    "role": "Diner waitress",
    "weight": 3,
    "cls": "service",
    "note": "The town's real hub; refills the coffee and dispenses the verdict."
   },
   {
    "role": "Mall security",
    "weight": 2,
    "cls": "authority",
    "note": "A uniform, a flashlight, and expansive delusions of jurisdiction."
   }
  ]
 },
 "cosmic": {
  "reskin": {
   "1": {
    "label": "—",
    "weight": 0
   },
   "2": {
    "label": "Omen-forager (gathers what falls when the sky argues with itself)",
    "weight": 4
   },
   "3": {
    "label": "—",
    "weight": 0
   },
   "4": {
    "label": "Breach-delver (works the tears in the world; patient in the wrong places)",
    "weight": 8
   },
   "5": {
    "label": "Oracle's aide (attends the star-reader; hears what each reading costs)",
    "weight": null
   },
   "6": {
    "label": "Star-mad beggar (lost everything to a reading that wouldn't stop)",
    "weight": 5
   },
   "7": {
    "label": "Instrument-wright (builds the orreries and listening-horns)",
    "weight": null
   },
   "8": {
    "label": "Ward-smith (forges the sigils that keep the listening things out)",
    "weight": null
   },
   "9": {
    "label": "Vigil-cook (feeds the ones who keep the watch; never asks what for)",
    "weight": 2
   },
   "10": {
    "label": "Ward-mason (raises the walls that hold the geometry outside)",
    "weight": null
   },
   "11": {
    "label": "Ward-cloth stitcher (hems the sigils in; notices whose seams are already wrong)",
    "weight": null
   },
   "12": {
    "label": "Star-tide chandler (preps vessels for currents the moon doesn't make)",
    "weight": null
   },
   "13": {
    "label": "Relic-trader (deals in driftwood that remembers, and coin from nowhere)",
    "weight": null
   },
   "14": {
    "label": "Way-house keeper (runs the inn at the edge of the charted world)",
    "weight": null
   },
   "15": {
    "label": "Wrongness-tender (treats what the sky does to people; recipes half-guessed)",
    "weight": null
   },
   "16": {
    "label": "Mind-tender (holds the touched together; trusted, and fraying under it)",
    "weight": null
   },
   "17": {
    "label": "Vigil-keeper (maintains the watch-ritual, not the doctrine behind it)",
    "weight": 4
   },
   "18": {
    "label": "Echo-singer (performs songs half-borrowed from something that answered)",
    "weight": null
   },
   "19": {
    "label": "Ward-line sentry (authority-adjacent; patrols where the geometry leaks)",
    "weight": null
   },
   "20": {
    "label": "Breach-mercenary (paid to stand where the wrongness runs thickest)",
    "weight": null
   },
   "21": {
    "label": "Waypoint-warder (wary of paths that don't lead where they used to)",
    "weight": null
   },
   "22": {
    "label": "Boundary-breaker (desperate or reckless; crosses lines meant to stay closed)",
    "weight": null
   },
   "23": {
    "label": "Relic-runner (moves the sealed and the never-opened; speaks only in euphemism)",
    "weight": null
   },
   "24": {
    "label": "Sigil-picker (steals the wards themselves, and doesn't grasp what that undoes)",
    "weight": null
   },
   "25": {
    "label": "Answer-cultist behind a mundane face",
    "weight": 3
   },
   "26": {
    "label": "Belonging-seller (charisma aimed at the desperate; sells a place in something vast)",
    "weight": 3
   },
   "27": {
    "label": "The kept-on (chose to stay after being changed; the reasons stay unclear)",
    "weight": 3
   },
   "28": {
    "label": "Sky-hermit (known of, rarely seen; talks to something that isn't there — or is)",
    "weight": 2
   },
   "29": {
    "label": "Borrowed warden (filling in for someone the void took)",
    "weight": null
   },
   "30": {
    "label": "Reading-broker (power without a title; controls who gets an augury, and when)",
    "weight": null
   },
   "31": {
    "label": "The unqualified reader (never should have picked up the charts, and can't put them down)",
    "weight": null
   },
   "32": {
    "label": "Augury patron (wealthy, bored, insulated — commissions readings like art)",
    "weight": 1
   },
   "33": {
    "label": "Relic magnate (sees every wonder as inventory)",
    "weight": null
   },
   "34": {
    "label": "Archive-warden of the impossible (hoards the knowledge that costs its reader)",
    "weight": null
   },
   "35": {
    "label": "The unexplained presence",
    "weight": 3
   }
  },
  "adds": [
   {
    "role": "Star-reader / augur",
    "weight": 3,
    "cls": "faith",
    "note": "Reads the geometry that argues with itself, and pays for each reading a piece at a time."
   },
   {
    "role": "Drowned-tongue speaker",
    "weight": 1,
    "cls": "margin",
    "note": "Knows the name too long to finish; the only translator, and it's costing them."
   },
   {
    "role": "Silence-keeper",
    "weight": 2,
    "cls": "authority",
    "note": "Tends the thing that must not be heard; the town's quiet is their whole job."
   },
   {
    "role": "Touched pilgrim",
    "weight": 3,
    "cls": "margin",
    "note": "Came back from the edge changed, following a sound with no source."
   },
   {
    "role": "Cult-of-the-answer",
    "weight": 2,
    "cls": "faith",
    "note": "Worships what answered back. Recruiting. Patiently. Forever."
   },
   {
    "role": "Cartographer-of-the-impossible",
    "weight": 1,
    "cls": "craft",
    "note": "Maps the geometry that won't hold still; the maps are never twice the same."
   },
   {
    "role": "The returned",
    "weight": 2,
    "cls": "margin",
    "note": "Went in and came back subtly wrong; their loved ones aren't quite sure it's them."
   },
   {
    "role": "Sleeper-medium",
    "weight": 1,
    "cls": "faith",
    "note": "Speaks the drowned language — but only while asleep, and can't be woken safely."
   },
   {
    "role": "Void-beacon keeper",
    "weight": 1,
    "cls": "authority",
    "note": "Tends the light that warns things OFF, not ships in."
   },
   {
    "role": "Scholar-gone-too-far",
    "weight": 1,
    "cls": "elite",
    "note": "Knew too much; now the knowing lives in them and pays no rent."
   }
  ]
 },
 "theater": {
  "reskin": {
   "1": {
    "label": "Requisitioned farmer or Forager",
    "weight": 2
   },
   "2": {
    "label": "Scout or Skirmisher",
    "weight": null
   },
   "3": {
    "label": "Ammunition-bearer or Baggage-train hand",
    "weight": 10
   },
   "4": {
    "label": "Sapper or Trench-digger",
    "weight": null
   },
   "5": {
    "label": "Officer's orderly / batman",
    "weight": 4
   },
   "6": {
    "label": "Refugee or Straggler",
    "weight": 6
   },
   "7": {
    "label": "Field-artificer or Smith's mate",
    "weight": null
   },
   "8": {
    "label": "Armorer",
    "weight": null
   },
   "9": {
    "label": "Cook or Mess-hand",
    "weight": null
   },
   "10": {
    "label": "Field engineer or Bridge-layer",
    "weight": null
   },
   "11": {
    "label": "Kit-mender or Tent-wright",
    "weight": null
   },
   "12": {
    "label": "Farrier or Wainwright of the train",
    "weight": null
   },
   "13": {
    "label": "Sutler (camp merchant)",
    "weight": null
   },
   "14": {
    "label": "Canteen-keeper or Billet-master",
    "weight": null
   },
   "15": {
    "label": "Camp bonesetter or Herb-woman",
    "weight": null
   },
   "16": {
    "label": "Surgeon (the rear hospital)",
    "weight": null
   },
   "17": {
    "label": "Chaplain",
    "weight": null
   },
   "18": {
    "label": "Camp entertainer",
    "weight": null
   },
   "19": {
    "label": "Provost-sergeant or Military police",
    "weight": 6
   },
   "20": {
    "label": "Mercenary or Free-company soldier",
    "weight": 5
   },
   "21": {
    "label": "Picket or Sentry",
    "weight": null
   },
   "22": {
    "label": "Marauder or Deserter-turned-brigand",
    "weight": null
   },
   "23": {
    "label": "Contraband-runner or Blockade-runner",
    "weight": null
   },
   "24": {
    "label": "Looter or Camp-thief",
    "weight": null
   },
   "25": {
    "label": "Zealot-soldier or Fifth-columnist",
    "weight": null
   },
   "26": {
    "label": "Press-gang or Recruiting sergeant",
    "weight": null
   },
   "27": {
    "label": "Foreign auxiliary from afar",
    "weight": null
   },
   "28": {
    "label": "Shell-shocked hermit behind the lines",
    "weight": null
   },
   "29": {
    "label": "Field-promoted corporal (borrowed command)",
    "weight": null
   },
   "30": {
    "label": "Trench boss or Camp strongman",
    "weight": null
   },
   "31": {
    "label": "Conscript who should never have been called",
    "weight": null
   },
   "32": {
    "label": "Well-connected staff cornet",
    "weight": 1
   },
   "33": {
    "label": "War contractor",
    "weight": null
   },
   "34": {
    "label": "Cryptographer or War-alchemist",
    "weight": null
   },
   "35": {
    "label": "The one no uniform explains",
    "weight": null
   }
  },
  "adds": [
   {
    "role": "Officer",
    "weight": 3,
    "cls": "authority",
    "note": "Orders the line held; loved or hated, and rarely wrong about both."
   },
   {
    "role": "Field-medic",
    "weight": 3,
    "cls": "care",
    "note": "Patches what the line breaks; ran out of the good supplies weeks ago."
   },
   {
    "role": "Quartermaster",
    "weight": 2,
    "cls": "trade",
    "note": "Controls what everyone needs, and skims what nobody counts."
   },
   {
    "role": "Runner",
    "weight": 2,
    "cls": "service",
    "note": "Carries the message under fire; knows what the officers won't say aloud."
   },
   {
    "role": "Deserter",
    "weight": 2,
    "cls": "margin",
    "note": "Walked away from the line; now every uniform is a threat."
   },
   {
    "role": "War-orphan / camp-follower",
    "weight": 4,
    "cls": "margin",
    "note": "The war's dependents; survive in its margins, move when it moves."
   },
   {
    "role": "The captured",
    "weight": 1,
    "cls": "margin",
    "note": "Belongs to no side now — and is leverage to every side."
   },
   {
    "role": "Veteran, missing a piece",
    "weight": 2,
    "cls": "margin",
    "note": "Came home from a war no one names, and it followed them back."
   }
  ]
 },
 "high-seas": {
  "reskin": {
   "1": {
    "label": "—",
    "weight": 0
   },
   "2": {
    "label": "Fisherman or Whaler",
    "weight": 10
   },
   "3": {
    "label": "Dockhand or Deckhand",
    "weight": 12
   },
   "4": {
    "label": "Hold-rat or Ballast-shifter",
    "weight": null
   },
   "5": {
    "label": "Captain's steward",
    "weight": null
   },
   "6": {
    "label": "Wharf-beggar or Dock-tramp",
    "weight": null
   },
   "7": {
    "label": "Shipwright",
    "weight": null
   },
   "8": {
    "label": "Ship's smith or Cannon-armorer",
    "weight": 1
   },
   "9": {
    "label": "Ship's cook or Galley-hand",
    "weight": null
   },
   "10": {
    "label": "Ship's carpenter",
    "weight": 5
   },
   "11": {
    "label": "Sailmaker or Rigger",
    "weight": 5
   },
   "12": {
    "label": "Ship's chandler",
    "weight": null
   },
   "13": {
    "label": "Purser or Trade-factor",
    "weight": 5
   },
   "14": {
    "label": "Portside tavern-keeper",
    "weight": 4
   },
   "15": {
    "label": "Herb-woman of the port",
    "weight": null
   },
   "16": {
    "label": "Surgeon's mate or Loblolly boy",
    "weight": null
   },
   "17": {
    "label": "Ship's chaplain",
    "weight": 1
   },
   "18": {
    "label": "Shantyman",
    "weight": 3
   },
   "19": {
    "label": "Master-at-arms",
    "weight": 5
   },
   "20": {
    "label": "Cutlass-for-hire",
    "weight": null
   },
   "21": {
    "label": "Convoy-escort hand",
    "weight": 1
   },
   "22": {
    "label": "Pirate or Mutineer",
    "weight": 6
   },
   "23": {
    "label": "Smuggler or Blockade-runner",
    "weight": 4
   },
   "24": {
    "label": "Ship's rat or Dockside cutpurse",
    "weight": null
   },
   "25": {
    "label": "Devotee of the drowned god",
    "weight": null
   },
   "26": {
    "label": "Press-gang recruiter",
    "weight": null
   },
   "27": {
    "label": "Foreign hand signed at the last port",
    "weight": null
   },
   "28": {
    "label": "The one who never comes above decks",
    "weight": null
   },
   "29": {
    "label": "Acting mate (the officer lost or drowned)",
    "weight": null
   },
   "30": {
    "label": "Fo'c'sle boss",
    "weight": null
   },
   "31": {
    "label": "Landsman who never should've shipped out",
    "weight": null
   },
   "32": {
    "label": "Passenger of quality",
    "weight": 1
   },
   "33": {
    "label": "Trading-company nabob or Fleet-owner",
    "weight": null
   },
   "34": {
    "label": "Chart-hoarder with a route no captain will buy",
    "weight": null
   },
   "35": {
    "label": "The stowaway no manifest explains",
    "weight": null
   }
  },
  "adds": [
   {
    "role": "Ship's captain",
    "weight": 2,
    "cls": "authority",
    "note": "Owes the crew as much as they're owed; the ledger is law aboard."
   },
   {
    "role": "Navigator",
    "weight": 2,
    "cls": "craft",
    "note": "Holds the torn chart everyone needs — and the real route is only in their head."
   },
   {
    "role": "Press-ganged hand",
    "weight": 3,
    "cls": "margin",
    "note": "Didn't choose the sea; the sea has them now anyway."
   },
   {
    "role": "Privateer",
    "weight": 2,
    "cls": "criminal",
    "note": "A letter of marque, or none — depending on who's asking, and when."
   },
   {
    "role": "Harbor-master",
    "weight": 1,
    "cls": "authority",
    "note": "Decides which cargo is seen; every manifest is negotiable."
   },
   {
    "role": "Ship's surgeon",
    "weight": 2,
    "cls": "care",
    "note": "Saw, needle, and rum; the crew's whole hope below the waterline."
   },
   {
    "role": "Bosun",
    "weight": 2,
    "cls": "authority",
    "note": "The captain's fist — keeps the crew, and the debt, in line."
   },
   {
    "role": "Cabin-child",
    "weight": 2,
    "cls": "margin",
    "note": "Sees everything, counts for nothing, and remembers all of it."
   },
   {
    "role": "Merchant-shipper",
    "weight": 2,
    "cls": "elite",
    "note": "Owns the cargo, never the risk; insures against their own crew."
   },
   {
    "role": "Shipwreck-survivor",
    "weight": 1,
    "cls": "margin",
    "note": "Washed in from somewhere that sank; knows a way back no one wants."
   }
  ]
 },
 "lost-world": {
  "reskin": {
   "1": {
    "label": "Canal-farmer or Terrace-tender",
    "weight": 3
   },
   "2": {
    "label": "Waste-runner or Ruin-hunter",
    "weight": 10
   },
   "3": {
    "label": "Stone-hauler or Relic-porter",
    "weight": null
   },
   "4": {
    "label": "Tomb-delver or Vault-breaker",
    "weight": 10
   },
   "5": {
    "label": "Bond-servant or Tomb-house attendant",
    "weight": null
   },
   "6": {
    "label": "Ruin-beggar or Camp-follower",
    "weight": 5
   },
   "7": {
    "label": "Relic-tinkerer or Old-craft apprentice",
    "weight": null
   },
   "8": {
    "label": "Bronze-caster or Old-alloy smith",
    "weight": null
   },
   "9": {
    "label": "Dig-camp cook",
    "weight": 2
   },
   "10": {
    "label": "Buttress-mason or Shoring-carpenter",
    "weight": null
   },
   "11": {
    "label": "Wrap-weaver or Shroud-maker",
    "weight": 2
   },
   "12": {
    "label": "Expedition outfitter or Camel-master",
    "weight": 5
   },
   "13": {
    "label": "Relic-fence or Antiquities broker",
    "weight": 7
   },
   "14": {
    "label": "Caravanserai-keeper or Dig-camp quartermaster",
    "weight": null
   },
   "15": {
    "label": "Curse-ward apothecary or Herb-woman",
    "weight": null
   },
   "16": {
    "label": "Dig-camp physician",
    "weight": null
   },
   "17": {
    "label": "Grave-rite keeper",
    "weight": 4
   },
   "18": {
    "label": "Epic-singer or Lorekeeper-bard",
    "weight": null
   },
   "19": {
    "label": "Wonder-warden or Site militiaman",
    "weight": null
   },
   "20": {
    "label": "Tomb-raider's muscle",
    "weight": 4
   },
   "21": {
    "label": "Waste-caravan guard",
    "weight": null
   },
   "22": {
    "label": "Wasteland raider",
    "weight": 5
   },
   "23": {
    "label": "Relic-smuggler",
    "weight": 4
   },
   "24": {
    "label": "Tomb-robber",
    "weight": 8
   },
   "25": {
    "label": "Dead-god zealot behind a digger's face",
    "weight": 4
   },
   "26": {
    "label": "Cult recruiter preaching the god-king's return",
    "weight": 3
   },
   "27": {
    "label": "Foreign scholar or Far-realm pilgrim",
    "weight": null
   },
   "28": {
    "label": "Ruin-hermit",
    "weight": 2
   },
   "29": {
    "label": "Acting steward for an heir long dead",
    "weight": null
   },
   "30": {
    "label": "Dig-boss or Camp strongman",
    "weight": null
   },
   "31": {
    "label": "Reluctant tomb-guide",
    "weight": null
   },
   "32": {
    "label": "—",
    "weight": 0
   },
   "33": {
    "label": "Antiquities baron",
    "weight": null
   },
   "34": {
    "label": "Forbidden archivist",
    "weight": 3
   },
   "35": {
    "label": "The one who remembers the world before the fall",
    "weight": 2
   }
  },
  "adds": [
   {
    "role": "Ruin-reader",
    "weight": 3,
    "cls": "craft",
    "note": "The last who can read the dead tongue; the monument speaks only to them."
   },
   {
    "role": "Tomb-guardian",
    "weight": 2,
    "cls": "faith",
    "note": "A bloodline still keeping a watch no one remembers assigning."
   },
   {
    "role": "Relic-hunter",
    "weight": 4,
    "cls": "wild",
    "note": "Plunders the wonder for coin — one curse at a time."
   },
   {
    "role": "Last-of-the-line",
    "weight": 1,
    "cls": "elite",
    "note": "The final heir of a people the sand swallowed; carries the whole memory."
   },
   {
    "role": "Oracle-keeper",
    "weight": 1,
    "cls": "faith",
    "note": "Tends a voice that outlived its god and still, unhelpfully, answers."
   },
   {
    "role": "God-king's heir",
    "weight": 1,
    "cls": "authority",
    "note": "Claims a throne no one alive is left to recognize — and means it."
   },
   {
    "role": "Caretaker-construct",
    "weight": 3,
    "cls": "margin",
    "note": "The builders' servant, still on duty, still following the last instruction."
   },
   {
    "role": "Expedition-guide",
    "weight": 4,
    "cls": "trade",
    "note": "Leads outsiders in. Doesn't always lead the same number out."
   },
   {
    "role": "Keeper-of-the-flame",
    "weight": 2,
    "cls": "faith",
    "note": "Tends a rite whose meaning is lost but whose lapse is deeply feared."
   },
   {
    "role": "Awakened sleeper",
    "weight": 1,
    "cls": "margin",
    "note": "Roused out of the old age into this one; entirely, dangerously out of time."
   }
  ]
 },
 "gloom": {
  "reskin": {
   "1": {
    "label": "Tenant farmer or Blight-farmer",
    "weight": 8
   },
   "2": {
    "label": "Trapper or Woods-warden",
    "weight": 6
   },
   "3": {
    "label": "Corpse-cart driver or Grave-hauler",
    "weight": null
   },
   "4": {
    "label": "Gravedigger or Crypt-digger",
    "weight": 6
   },
   "5": {
    "label": "Manor servant or House-maid",
    "weight": 5
   },
   "6": {
    "label": "Outcast beggar or the Forsaken",
    "weight": 5
   },
   "7": {
    "label": "Ward-carver or Charm-maker",
    "weight": null
   },
   "8": {
    "label": "Iron-ward smith",
    "weight": 4
   },
   "9": {
    "label": "Baker or Miller",
    "weight": null
   },
   "10": {
    "label": "Mason or Crypt-wright",
    "weight": null
   },
   "11": {
    "label": "Shroud-sewer or Seamstress",
    "weight": null
   },
   "12": {
    "label": "—",
    "weight": 0
   },
   "13": {
    "label": "Traveling peddler",
    "weight": 2
   },
   "14": {
    "label": "Innkeeper or Tavern-keeper",
    "weight": 5
   },
   "15": {
    "label": "Hedge-witch or Herb-woman",
    "weight": null
   },
   "16": {
    "label": "Village physician or Midwife",
    "weight": null
   },
   "17": {
    "label": "Ward-keeper or Old-rite keeper",
    "weight": 5
   },
   "18": {
    "label": "—",
    "weight": 0
   },
   "19": {
    "label": "Village constable",
    "weight": 2
   },
   "20": {
    "label": "Paid exorcist or Hedge-mercenary",
    "weight": null
   },
   "21": {
    "label": "Crossroads warden",
    "weight": null
   },
   "22": {
    "label": "Body-snatcher",
    "weight": null
   },
   "23": {
    "label": "Cursed-relic runner",
    "weight": null
   },
   "24": {
    "label": "Grave-goods thief",
    "weight": null
   },
   "25": {
    "label": "Secret cultist",
    "weight": 5
   },
   "26": {
    "label": "Cult recruiter",
    "weight": 4
   },
   "27": {
    "label": "The newcomer who stayed",
    "weight": 3
   },
   "28": {
    "label": "Hermit at the tree-line",
    "weight": 4
   },
   "29": {
    "label": "Acting elder",
    "weight": null
   },
   "30": {
    "label": "The one the village answers to",
    "weight": 3
   },
   "31": {
    "label": "Reluctant keeper",
    "weight": null
   },
   "32": {
    "label": "Manor gentry",
    "weight": null
   },
   "33": {
    "label": "Mill-owner",
    "weight": null
   },
   "34": {
    "label": "Occult researcher",
    "weight": 3
   },
   "35": {
    "label": "The stranger who came the night it started",
    "weight": 3
   }
  },
  "adds": [
   {
    "role": "Cunning-folk / exorcist",
    "weight": 3,
    "cls": "faith",
    "note": "Deals with the thing that answered; charges in debts you don't want to owe."
   },
   {
    "role": "The marked",
    "weight": 3,
    "cls": "margin",
    "note": "Carries a doom they never asked for; people cross the street."
   },
   {
    "role": "Sin-eater",
    "weight": 2,
    "cls": "care",
    "note": "Keeps the dead down — or takes on what they left behind."
   },
   {
    "role": "Occult collector",
    "weight": 1,
    "cls": "elite",
    "note": "Hoards the objects that shouldn't be kept. One of them is awake."
   },
   {
    "role": "Kin-of-the-afflicted",
    "weight": 3,
    "cls": "margin",
    "note": "Holds the household together directly over the cellar door."
   },
   {
    "role": "Taboo-elder",
    "weight": 2,
    "cls": "authority",
    "note": "Enforces the old rule everyone half-forgot — the one that keeps It out."
   },
   {
    "role": "Medium",
    "weight": 2,
    "cls": "faith",
    "note": "Takes messages from the wrong side of the door, and charges dearly for it."
   },
   {
    "role": "The last witness",
    "weight": 1,
    "cls": "margin",
    "note": "Saw what took the others; no one believes them yet, and time is short."
   },
   {
    "role": "Reliquary-keeper",
    "weight": 1,
    "cls": "faith",
    "note": "Guards the bones, or the object, that must never once be moved."
   },
   {
    "role": "Doomed-line heir",
    "weight": 1,
    "cls": "elite",
    "note": "The family the curse has been patient with, for generations."
   }
  ]
 },
 "bright-kingdom": {
  "reskin": {
   "1": {
    "label": "—",
    "weight": 0
   },
   "2": {
    "label": "Overworld forager or Warp-zone scout",
    "weight": 10
   },
   "3": {
    "label": "Block-pusher or Cart-hauler",
    "weight": 12
   },
   "4": {
    "label": "Pipe-diver or Underworld tunneler",
    "weight": null
   },
   "5": {
    "label": "Wind-up page or Court page",
    "weight": null
   },
   "6": {
    "label": "Out-of-lives drifter or Bankrupt gambler",
    "weight": 6
   },
   "7": {
    "label": "Toymaker",
    "weight": 8
   },
   "8": {
    "label": "—",
    "weight": 0
   },
   "9": {
    "label": "Candy-chef or Sweet-shop baker",
    "weight": 6
   },
   "10": {
    "label": "Block-mason",
    "weight": null
   },
   "11": {
    "label": "Mascot-suit tailor",
    "weight": null
   },
   "12": {
    "label": "Kart-wright or Ride-mechanic",
    "weight": null
   },
   "13": {
    "label": "Prize-broker or Ticket-changer",
    "weight": null
   },
   "14": {
    "label": "Save-point keeper or Rest-stop host",
    "weight": null
   },
   "15": {
    "label": "Heart-container brewer",
    "weight": null
   },
   "16": {
    "label": "Extra-life nurse",
    "weight": null
   },
   "17": {
    "label": "Checkpoint priest",
    "weight": null
   },
   "18": {
    "label": "Sideshow act or Circus barker",
    "weight": 3
   },
   "19": {
    "label": "Wind-up soldier or Rule-goon",
    "weight": null
   },
   "20": {
    "label": "Rented mini-boss",
    "weight": null
   },
   "21": {
    "label": "Gate-guard between worlds",
    "weight": null
   },
   "22": {
    "label": "Glitch-goblin or Rule-breaker",
    "weight": 4
   },
   "23": {
    "label": "Contraband power-up dealer",
    "weight": null
   },
   "24": {
    "label": "Coin-snatcher or Item-nabber",
    "weight": null
   },
   "25": {
    "label": "True-believer in the High Score",
    "weight": 4
   },
   "26": {
    "label": "Talent-scout for the Game",
    "weight": null
   },
   "27": {
    "label": "Glitched-in wanderer",
    "weight": 3
   },
   "28": {
    "label": "Superboss no one's beaten",
    "weight": null
   },
   "29": {
    "label": "Understudy mascot",
    "weight": null
   },
   "30": {
    "label": "Backroom high-scorer",
    "weight": null
   },
   "31": {
    "label": "Miscast sprite",
    "weight": 2
   },
   "32": {
    "label": "Spoiled prince or princess",
    "weight": 4
   },
   "33": {
    "label": "Arcade tycoon or Toy magnate",
    "weight": null
   },
   "34": {
    "label": "Manual-keeper or Lore-hoarder",
    "weight": null
   },
   "35": {
    "label": "The NPC with no dialogue tree",
    "weight": 2
   }
  },
  "adds": [
   {
    "role": "Champion-by-the-rules",
    "weight": 1,
    "cls": "elite",
    "note": "Won the game everyone plays; the crown is literal, and heavier than it looks."
   },
   {
    "role": "Prize-keeper",
    "weight": 2,
    "cls": "authority",
    "note": "Guards the reward that's watching you back; the rules protect it, not you."
   },
   {
    "role": "Perpetual challenger",
    "weight": 3,
    "cls": "margin",
    "note": "Respawns to try again — cheerfully, endlessly, and a little wrong."
   },
   {
    "role": "Power-up peddler",
    "weight": 3,
    "cls": "trade",
    "note": "Sells the thing you eat to get strong. The fine print has teeth."
   },
   {
    "role": "Referee",
    "weight": 2,
    "cls": "authority",
    "note": "Enforces rules a child could recite, with consequences a child shouldn't see."
   },
   {
    "role": "Mascot / herald",
    "weight": 3,
    "cls": "service",
    "note": "The too-cheerful face that greets you; the smile never once drops."
   },
   {
    "role": "Collectible-hoarder",
    "weight": 2,
    "cls": "margin",
    "note": "Needs all of the set — and the last piece is guarded by something."
   },
   {
    "role": "Level-boss",
    "weight": 1,
    "cls": "authority",
    "note": "Sits at the top of the map, bound by the rules to wait for a challenger."
   },
   {
    "role": "Fairy-godmother figure",
    "weight": 1,
    "cls": "faith",
    "note": "Grants the boon; the fine print is a fairy-tale kind of cruel."
   },
   {
    "role": "Reset-warden",
    "weight": 2,
    "cls": "margin",
    "note": "Puts everything back the way it was each morning, and hates when you notice."
   }
  ]
 }
};

/* roleForRealm(realmId, rng) -> {archetypeKey, label, note, cls} — NPC-ROLE-REALMS.md "Engine
   wiring": weighted-pick a spine archetype (skin weight override, else spine default; weight 0 =
   excluded) union'd with that realm's own [ADD] roles (own weight/label/note/cls), then weighted-
   pick ONE entry from the combined pool. `rng` is an optional zero-arg fn returning a float in
   [0,1) (same contract as Math.random) — omit it and this uses Math.random() directly, same
   defensive style as this file's siblings (rollNpcBreachTouch, coherenceAtomGate). realmId falls
   back to 'frontier' when absent/unrecognized (NPC-ROLE-REALMS.md "default when no realm context
   -> frontier skin, no regression"). ADD entries carry a synthetic, always-truthy archetypeKey
   ("add:<role>") — rollNPC's `rolled.archetypeKey set` contract holds for adds too, they just
   don't map back onto a spine row. Pure — no state/DOM access, safe for the jsdom harness.
   opts.addsOnly (bool, additive) restricts the pool to ONLY that realm's [ADD] rows — the
   NPC-ROLE-REALMS.md hybridization seam (src/engine/codex-roll.js's rollNPC opts.hybridRealm rider)
   draws a fray-scaled minority of picks from a *breached* realm's edge-adds specifically, never its
   whole reskinned spine (the "Fallout pocket": a war-shape washes up, not a whole parallel town).
   PLACE-GEN.md §5 unit 3 (cast wiring): opts.filterCls (a NPC spine Tags class, e.g. "trade") is a
   FILTERED-POOL pick, not a retry — the combined spine∪adds pool is narrowed to entries whose cls
   matches before the weighted pick, so a place's anchor NPC (e.g. a Watering-hole's `trade` anchor)
   reliably lands on-class even when that class is a thin minority of the realm's weighted pool
   (retrying the unfiltered draw would under-hit a rare class; this never does). "any" is treated as
   no filter (the castProfile's own unfiltered sentinel). NEVER DANGLES: if the filtered pool is
   empty (the class has zero candidates in this realm's skin), falls back to the full unfiltered
   pool below — a place always mints an anchor. */
function roleForRealm(realmId, rng, opts){
  var rnd = (typeof rng === "function") ? rng : Math.random;
  var addsOnly = !!(opts && opts.addsOnly);
  var filterCls = (opts && opts.filterCls && opts.filterCls!=="any") ? opts.filterCls : null;
  var skin = (NPC_ROLE_SKINS[realmId]) || NPC_ROLE_SKINS.frontier || null;
  if(!skin) return null; // defensive: data file failed to load / is empty — never throw
  var pool = [];
  if(!addsOnly){
    NPC_ROLE_SPINE.forEach(function(a){
      var row = skin.reskin[String(a.key)];
      var weight = (row && row.weight !== null && row.weight !== undefined) ? row.weight : a.weight;
      if(!weight) return; // 0 or missing override with a 0 spine default -> dropped
      var label = (row && row.label) ? row.label : a.archetype;
      pool.push({archetypeKey:a.key, label:label, note:a.note, cls:a.cls, weight:weight});
    });
  }
  (skin.adds || []).forEach(function(add){
    if(!add.weight) return;
    pool.push({archetypeKey:"add:"+add.role, label:add.role, note:add.note, cls:add.cls, weight:add.weight});
  });
  if(!pool.length) return null; // defensive: a malformed skin dropped everything (or addsOnly on an empty adds list) — never throw
  if(filterCls){
    var filtered = pool.filter(function(p){ return p.cls===filterCls; });
    if(filtered.length) pool = filtered; // else: zero candidates for this class — never-dangle fallthrough to the full pool
  }
  var total = 0;
  for(var i=0;i<pool.length;i++) total += pool[i].weight;
  var roll = rnd() * total;
  var acc = 0;
  for(var j=0;j<pool.length;j++){
    acc += pool[j].weight;
    if(roll < acc) return {archetypeKey:pool[j].archetypeKey, label:pool[j].label, note:pool[j].note, cls:pool[j].cls};
  }
  var last = pool[pool.length-1]; // float-rounding guard, same pattern as pickCoherenceTier's fallthrough
  return {archetypeKey:last.archetypeKey, label:last.label, note:last.note, cls:last.cls};
}
