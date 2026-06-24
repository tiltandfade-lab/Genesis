/* GENESIS DATA — data/srd-creator.js
   Curated SRD 5.2.1 / 2024-PHB class data the character creator walks the player through:
   class skill choices, starting-equipment packages, and level-1 spellcasting.
   Hand-authored from Reference/SRD-Data/classes.md (the OCR'd source wraps lines, so these
   are transcribed + verified against it). Classic <script>, shared global scope.
   Defines: ALL_SKILLS, CLASS_SKILLS, CLASS_KIT, CLASS_CASTING, INSTRUMENTS, ARTISAN_TOOLS,
   GAMING_SETS, STANDARD_LANGUAGES. Registered in manifest.json. */

/* The 18 standard skills (for "choose any" lists like the Bard's). */
const ALL_SKILLS=["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"];
// SRD skill → governing ability (for computing each skill's roll modifier on the sheet)
const SKILL_ABILITY={Athletics:"str",Acrobatics:"dex","Sleight of Hand":"dex",Stealth:"dex",Arcana:"int",History:"int",Investigation:"int",Nature:"int",Religion:"int","Animal Handling":"wis",Insight:"wis",Medicine:"wis",Perception:"wis",Survival:"wis",Deception:"cha",Intimidation:"cha",Performance:"cha",Persuasion:"cha"};

/* Class skill proficiencies — {n: how many to choose, from: [list] | "all"}. */
const CLASS_SKILLS={
  Barbarian:{n:2,from:["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"]},
  Bard:{n:3,from:"all"},
  Cleric:{n:2,from:["History","Insight","Medicine","Persuasion","Religion"]},
  Druid:{n:2,from:["Animal Handling","Arcana","Insight","Medicine","Nature","Perception","Religion","Survival"]},
  Fighter:{n:2,from:["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Persuasion","Survival"]},
  Monk:{n:2,from:["Acrobatics","Athletics","History","Insight","Religion","Stealth"]},
  Paladin:{n:2,from:["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"]},
  Ranger:{n:3,from:["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"]},
  Rogue:{n:4,from:["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Persuasion","Sleight of Hand","Stealth"]},
  Sorcerer:{n:2,from:["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"]},
  Warlock:{n:2,from:["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"]},
  Wizard:{n:2,from:["Arcana","History","Insight","Investigation","Medicine","Nature","Religion"]},
};

/* Starting-equipment packages — each option is a label + the items it grants (+ gold).
   `items` are display strings; `gp` the gold; the all-gold option has items:[]. */
const CLASS_KIT={
  Barbarian:[
    {id:"A",items:["Greataxe","4 Handaxes","Explorer's Pack"],gp:15},
    {id:"B",items:[],gp:75}],
  Bard:[
    {id:"A",items:["Leather Armor","2 Daggers","Musical Instrument (your choice)","Entertainer's Pack"],gp:19},
    {id:"B",items:[],gp:90}],
  Cleric:[
    {id:"A",items:["Chain Shirt","Shield","Mace","Holy Symbol","Priest's Pack"],gp:7},
    {id:"B",items:[],gp:110}],
  Druid:[
    {id:"A",items:["Leather Armor","Shield","Sickle","Druidic Focus (Quarterstaff)","Explorer's Pack","Herbalism Kit"],gp:9},
    {id:"B",items:[],gp:50}],
  Fighter:[
    {id:"A",items:["Chain Mail","Greatsword","Flail","8 Javelins","Dungeoneer's Pack"],gp:4},
    {id:"B",items:["Studded Leather Armor","Scimitar","Shortsword","Longbow","20 Arrows","Quiver","Dungeoneer's Pack"],gp:11},
    {id:"C",items:[],gp:155}],
  Monk:[
    {id:"A",items:["Spear","5 Daggers","Artisan's Tools or Musical Instrument","Explorer's Pack"],gp:11},
    {id:"B",items:[],gp:50}],
  Paladin:[
    {id:"A",items:["Chain Mail","Shield","Longsword","6 Javelins","Holy Symbol","Priest's Pack"],gp:9},
    {id:"B",items:[],gp:150}],
  Ranger:[
    {id:"A",items:["Studded Leather Armor","Scimitar","Shortsword","Longbow","20 Arrows","Quiver","Druidic Focus (sprig of mistletoe)","Explorer's Pack"],gp:7},
    {id:"B",items:[],gp:150}],
  Rogue:[
    {id:"A",items:["Leather Armor","2 Daggers","Shortsword","Shortbow","20 Arrows","Quiver","Thieves' Tools","Burglar's Pack"],gp:8},
    {id:"B",items:[],gp:100}],
  Sorcerer:[
    {id:"A",items:["Spear","2 Daggers","Arcane Focus (crystal)","Dungeoneer's Pack"],gp:28},
    {id:"B",items:[],gp:50}],
  Warlock:[
    {id:"A",items:["Leather Armor","Sickle","2 Daggers","Arcane Focus (orb)","Book (occult lore)","Scholar's Pack"],gp:15},
    {id:"B",items:[],gp:100}],
  Wizard:[
    {id:"A",items:["2 Daggers","Arcane Focus (Quarterstaff)","Robe","Spellbook","Scholar's Pack"],gp:5},
    {id:"B",items:[],gp:55}],
};

/* Level-1 spellcasting — {ability, list (the spell-list class key in SPELLS_SLIM),
   cantrips: N, spells: N, term: how the class names its level-1 known/prepared set}.
   Non-casters (Barbarian/Fighter/Monk/Rogue) are absent → no spell step. Wizard's
   `spells` is the spellbook count (6); 4 are prepared from it at the table. */
const CLASS_CASTING={
  Bard:    {ability:"cha",list:"Bard",    cantrips:2,spells:4,term:"prepared"},
  Cleric:  {ability:"wis",list:"Cleric",  cantrips:3,spells:4,term:"prepared"},
  Druid:   {ability:"wis",list:"Druid",   cantrips:2,spells:4,term:"prepared"},
  Paladin: {ability:"cha",list:"Paladin", cantrips:0,spells:2,term:"prepared"},
  Ranger:  {ability:"wis",list:"Ranger",  cantrips:0,spells:2,term:"prepared"},
  Sorcerer:{ability:"cha",list:"Sorcerer",cantrips:4,spells:2,term:"prepared"},
  Warlock: {ability:"cha",list:"Warlock", cantrips:2,spells:2,term:"prepared"},
  Wizard:  {ability:"int",list:"Wizard",  cantrips:3,spells:6,term:"spellbook"},
};

/* Origin feats granted by backgrounds (the four SRD origin feats Genesis backgrounds use).
   `choose` describes any player decision the feat carries:
     null              — no choice, just confirm (Alert, Savage Attacker)
     {kind:"skills",n} — gain N skill proficiencies of choice (Skilled)
     {kind:"magic",list,cantrips,spells,ability} — Magic Initiate: cantrips + L1 from a class list. */
const ORIGIN_FEATS={
  "Alert":{blurb:"Always ready — add your Proficiency Bonus to Initiative, and you can swap Initiative with a willing ally.",choose:null},
  "Savage Attacker":{blurb:"Once each turn you can reroll a melee weapon's damage dice and use either total.",choose:null},
  "Skilled":{blurb:"Broadly trained — gain proficiency in three skills of your choice.",choose:{kind:"skills",n:3}},
  "Magic Initiate (Cleric)":{blurb:"A spark of divine magic — learn two cantrips and one level-1 spell from the Cleric list.",choose:{kind:"magic",list:"Cleric",cantrips:2,spells:1,ability:"wis"}},
  "Magic Initiate (Wizard)":{blurb:"A spark of arcane study — learn two cantrips and one level-1 spell from the Wizard list.",choose:{kind:"magic",list:"Wizard",cantrips:2,spells:1,ability:"int"}},
  "Magic Initiate (Druid)":{blurb:"A spark of primal magic — learn two cantrips and one level-1 spell from the Druid list.",choose:{kind:"magic",list:"Druid",cantrips:2,spells:1,ability:"wis"}},
};

/* ---- "Of your choice" pick-lists (SRD 5.2.1 equipment.md) ----
   Several class kits and backgrounds grant a GENERIC tool/instrument/gaming set
   ("a musical instrument of your choice", "artisan's tools", "gaming set"). The
   guided creator surfaces each as a real player pick (with a 🎲 shortcut) rather
   than silently auto-filling. Languages: every 2024 PC knows Common + two STANDARD
   languages of choice — Common is automatic, so it's omitted from the pick list.
   Sources: equipment.md §Musical Instrument / §Artisan's Tools / §Gaming Set,
   character-creation.md §Choose Languages (Standard Languages table). */
const INSTRUMENTS=["Bagpipes","Drum","Dulcimer","Flute","Horn","Lute","Lyre","Pan flute","Shawm","Viol"];
const ARTISAN_TOOLS=["Alchemist's Supplies","Brewer's Supplies","Calligrapher's Supplies","Carpenter's Tools","Cartographer's Tools","Cobbler's Tools","Cook's Utensils","Glassblower's Tools","Jeweler's Tools","Leatherworker's Tools","Mason's Tools","Painter's Supplies","Potter's Tools","Smith's Tools","Tinker's Tools","Weaver's Tools","Woodcarver's Tools"];
const GAMING_SETS=["Dice set","Dragonchess set","Playing cards","Three-Dragon Ante set"];
const STANDARD_LANGUAGES=["Common Sign Language","Draconic","Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc"];

/* ---- Faction proximity at creation (docs/DEATH-AND-REBIRTH.md step 4) ----
   A character is born near a local power. The KIND of a faction is read from its Method
   (the Faction Method table) via keyword; a class is weighted toward its archetypal kinds,
   but ANY class can land near ANY faction (the affinity only tilts the dice). */
// substring(s) of a faction's `method` text → a kind tag
const METHOD_KIND=[
  [/faith|charism|persuas|creed|ritual|omen|occult/,"divine"],
  [/force|arms|coerc|threat|war/,"martial"],
  [/infiltrat|spies|spy|sabotage|arson|blackmail|smuggl|black market|leverage/,"criminal"],
  [/commerce|debt|ownership|wealth|mercant|trade/,"mercantile"],
  [/law|court|charter|bureau/,"civic"],
  [/marriage|alliance|blood|kin|rumor|propaganda/,"social"],
];
// class → the kinds it gravitates toward (first = strongest). Unlisted → no tilt (even odds).
const CLASS_FACTION_AFFINITY={
  Barbarian:["martial"],Fighter:["martial"],Ranger:["martial"],
  Paladin:["divine","martial"],Cleric:["divine"],Monk:["divine","martial"],
  Rogue:["criminal"],
  Wizard:["arcane","civic"],Sorcerer:["arcane"],Warlock:["occult","divine"],
  Bard:["social"],Druid:["occult"],
};
