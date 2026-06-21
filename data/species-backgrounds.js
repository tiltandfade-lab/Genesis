/* GENESIS MODULE — data/species-backgrounds.js — ABIL, ABIL_LABEL, CLASSES, SPECIES, BACKGROUNDS, TIP
   Carved from genesis.html monolith on 2026-06-20 (data-layer carve, Pass 2).
   Classic <script> (shared global scope) — defines top-level consts, no logic.
   Registered in manifest.json; validated by build/check-manifest.py. */

/* --- Layer 1 mechanical data (cheap; everything else by pointer) --- */
const ABIL=["str","dex","con","int","wis","cha"];
const ABIL_LABEL={str:"STR",dex:"DEX",con:"CON",int:"INT",wis:"WIS",cha:"CHA"};
const CLASSES={
  Barbarian:{hd:12,hp:12,saves:["str","con"],arr:{str:15,dex:13,con:14,int:10,wis:12,cha:8}},
  Bard:{hd:8,hp:8,saves:["dex","cha"],arr:{str:8,dex:14,con:12,int:13,wis:10,cha:15}},
  Cleric:{hd:8,hp:8,saves:["wis","cha"],arr:{str:14,dex:8,con:13,int:10,wis:15,cha:12}},
  Druid:{hd:8,hp:8,saves:["int","wis"],arr:{str:8,dex:12,con:14,int:13,wis:15,cha:10}},
  Fighter:{hd:10,hp:10,saves:["str","con"],arr:{str:15,dex:14,con:13,int:8,wis:10,cha:12}},
  Monk:{hd:8,hp:8,saves:["str","dex"],arr:{str:12,dex:15,con:13,int:10,wis:14,cha:8}},
  Paladin:{hd:10,hp:10,saves:["wis","cha"],arr:{str:15,dex:10,con:13,int:8,wis:12,cha:14}},
  Ranger:{hd:10,hp:10,saves:["str","dex"],arr:{str:12,dex:15,con:13,int:8,wis:14,cha:10}},
  Rogue:{hd:8,hp:8,saves:["dex","int"],arr:{str:12,dex:15,con:13,int:14,wis:10,cha:8}},
  Sorcerer:{hd:6,hp:6,saves:["con","cha"],arr:{str:10,dex:13,con:14,int:8,wis:12,cha:15}},
  Warlock:{hd:8,hp:8,saves:["wis","cha"],arr:{str:8,dex:14,con:13,int:12,wis:10,cha:15}},
  Wizard:{hd:6,hp:6,saves:["int","wis"],arr:{str:8,dex:12,con:13,int:15,wis:14,cha:10}},
};
const SPECIES={
  Dragonborn:{size:"M",speed:30},Dwarf:{size:"M",speed:30},Elf:{size:"M",speed:30},
  Gnome:{size:"S",speed:25},Goliath:{size:"M",speed:35},Halfling:{size:"S",speed:30},
  Human:{size:"M",speed:30},Orc:{size:"M",speed:30},Tiefling:{size:"M",speed:30},
};
/* Backgrounds — feat + three boostable abilities (+2/+1 on the first two) +
   skill profs (+ optional tool). The 4 SRD 5.2.1 backgrounds, then a handful of
   Genesis-native ones (native:true) tied to factions/settings in the world tables.
   Native ones use only SRD origin feats (Alert / Magic Initiate / Savage Attacker
   / Skilled) so they stay SRD-safe. */
const BACKGROUNDS={
  Acolyte:{feat:"Magic Initiate (Cleric)",abils:["int","wis","cha"],skills:["Insight","Religion"]},
  Criminal:{feat:"Alert",abils:["dex","con","int"],skills:["Sleight of Hand","Stealth"]},
  Sage:{feat:"Magic Initiate (Wizard)",abils:["con","int","wis"],skills:["Arcana","History"]},
  Soldier:{feat:"Savage Attacker",abils:["str","dex","con"],skills:["Athletics","Intimidation"]},
  "Bog-Iron Digger":{feat:"Skilled",abils:["str","con","wis"],skills:["Athletics","Survival"],tool:"Mason's tools",native:true},
  "Glass-Singer":{feat:"Magic Initiate (Wizard)",abils:["cha","dex","con"],skills:["Performance","Arcana"],tool:"Glassblower's tools",native:true},
  "Hearth-Watch":{feat:"Savage Attacker",abils:["con","wis","str"],skills:["Perception","Intimidation"],tool:"Vehicles (land)",native:true},
  Crier:{feat:"Skilled",abils:["cha","int","dex"],skills:["Persuasion","Insight"],tool:"Forgery kit",native:true},
  "River-Rat":{feat:"Alert",abils:["dex","con","int"],skills:["Athletics","Sleight of Hand"],tool:"Thieves' tools",native:true},
  Pilgrim:{feat:"Magic Initiate (Cleric)",abils:["wis","con","cha"],skills:["Religion","Insight"],tool:"Cartographer's tools",native:true},
  /* standard archetypes — rebuilt IP-clean (own packages + own prose, SRD feats only) */
  Charlatan:{feat:"Skilled",abils:["cha","dex","int"],skills:["Deception","Sleight of Hand"],tool:"Disguise kit"},
  Entertainer:{feat:"Skilled",abils:["cha","dex","con"],skills:["Acrobatics","Performance"],tool:"Musical instrument"},
  "Folk Hero":{feat:"Savage Attacker",abils:["str","con","wis"],skills:["Animal Handling","Survival"],tool:"Vehicles (land)"},
  "Guild Artisan":{feat:"Skilled",abils:["int","wis","cha"],skills:["Insight","Persuasion"],tool:"Artisan's tools"},
  Hermit:{feat:"Magic Initiate (Cleric)",abils:["con","wis","int"],skills:["Medicine","Religion"],tool:"Herbalism kit"},
  Noble:{feat:"Skilled",abils:["str","int","cha"],skills:["History","Persuasion"],tool:"Gaming set"},
  Outlander:{feat:"Magic Initiate (Druid)",abils:["wis","con","str"],skills:["Survival","Nature"],tool:"Herbalism kit"},
  Sailor:{feat:"Alert",abils:["str","dex","wis"],skills:["Athletics","Perception"],tool:"Navigator's tools"},
  Urchin:{feat:"Skilled",abils:["dex","con","cha"],skills:["Stealth","Insight"],tool:"Disguise kit"},
};

/* --- tooltips for the guided Sheet choices (one-liners shown beside each option) --- */
const TIP={
  species:{Dragonborn:"draconic blood — a breath weapon and proud lineage.",Dwarf:"stout and enduring, at home in stone and dark.",Elf:"long-lived and keen-sensed, quick and watchful.",Gnome:"small, clever, irrepressibly curious.",Goliath:"huge and mountain-born, mighty and resolute.",Halfling:"small, lucky, and hard to frighten.",Human:"adaptable and ambitious — the wild card.",Orc:"powerful and relentless, built to endure.",Tiefling:"infernal heritage — marked, resilient, sharp."},
  class:{Barbarian:"a raging warrior of brute force and fury.",Bard:"a magical artist who inspires and beguiles.",Cleric:"a divine channeler of healing and wrath.",Druid:"a shapeshifting keeper of the wild balance.",Fighter:"a master of weapons and battle-craft.",Monk:"a martial artist channeling inner ki.",Paladin:"a holy warrior bound by a sacred oath.",Ranger:"a hunter and tracker of the borderlands.",Rogue:"a stealthy expert of guile and precision.",Sorcerer:"innate magic burning in the blood.",Warlock:"power granted by an otherworldly pact.",Wizard:"a scholar of arcane study and spellcraft."},
  background:{Acolyte:"temple-raised — Insight & Religion.",Criminal:"a life outside the law — Stealth & Sleight of Hand.",Sage:"a seeker of knowledge — Arcana & History.",Soldier:"forged by war — Athletics & Intimidation.","Bog-Iron Digger":"mud and ore — Athletics & Survival.","Glass-Singer":"shaping glass with song — Performance & Arcana.","Hearth-Watch":"a town's quiet guardian — Perception & Intimidation.",Crier:"a seller of news — Persuasion & Insight.","River-Rat":"raised on the water — Athletics & Sleight of Hand.",Pilgrim:"a walker of holy roads — Religion & Insight.",Charlatan:"a confident liar — Deception & Sleight of Hand.",Entertainer:"a crowd's darling — Acrobatics & Performance.","Folk Hero":"the people's champion — Animal Handling & Survival.","Guild Artisan":"a maker of fine things — Insight & Persuasion.",Hermit:"a seeker in solitude — Medicine & Religion.",Noble:"born to privilege — History & Persuasion.",Outlander:"raised in the wild — Survival & Nature.",Sailor:"a life at sea — Athletics & Perception.",Urchin:"a survivor of the streets — Stealth & Insight."},
};
