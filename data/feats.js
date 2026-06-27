/* GENESIS DATA — data/feats.js — original, IP-clean GENERAL FEATS for the level-up picker.
   The SRD ships almost no general feats (just ASI + Grappler), so these are Genesis-native — written
   from scratch, not transcribed from any rulebook. Taken at an ASI level (4, 8 in Tier 2) INSTEAD of
   a +2 ability bump. Balanced to ~a +2 ASI: a "full" feat is a pure benefit; a "half" feat grants +1
   to one listed ability PLUS a modest benefit.

   The engine applies only the MECHANICAL grant (an ability +1, flat HP / AC / speed, a save or skill
   proficiency) + records the feat on sh.feats; the situational text is the DM's to adjudicate in play
   (the `text` is shown to the player). DRAFT balance — Adam's to tune. Classic <script> (global). */
const GENERAL_FEATS = {
  /* ---- full feats (no ability bump; a standalone benefit ~ a +2 ASI) ---- */
  deep_roots: { name:"Deep Roots", kind:"full", grant:{ hpPerLevel:2 },
    summary:"Max HP +2 per level",
    text:"Life runs deep in you. Your Hit Point maximum increases by 2 for every level you have, and by a further 2 each time you gain a level hereafter." },
  sentinels_vow: { name:"Sentinel's Vow", kind:"full", grant:{},
    summary:"Guard your allies; opportunity strikes halt foes",
    text:"When a creature within 5 feet of you attacks someone other than you, you can use your Reaction to make a melee attack against it. A creature you hit with an opportunity attack has its Speed reduced to 0 until the end of the turn." },
  riposte_stance: { name:"Riposte Stance", kind:"full", grant:{},
    summary:"Punish a melee miss with a counterattack",
    text:"Once on each of your turns, when a creature you can see misses you with a melee attack, you can use your Reaction to make one melee attack against it." },
  far_shot: { name:"Far Shot", kind:"full", grant:{},
    summary:"Ranged attacks ignore cover and long range",
    text:"Your ranged attacks — with a weapon or a spell — ignore Half and Three-Quarters Cover, and you don't have Disadvantage on ranged attack rolls at long range against a target you can see." },
  arcane_dabbler: { name:"Arcane Dabbler", kind:"full", grant:{},
    summary:"A flicker of innate magic",
    text:"A spark of untrained magic stirs in you. You can sense the presence of active magic within 30 feet (as a Bonus Action) and you have Advantage on saving throws against being Charmed. Your DM may let you cast a single minor cantrip-tier effect in fiction." },

  /* ---- half feats (+1 to one listed ability, plus a modest benefit) ---- */
  fleetfoot: { name:"Fleetfoot", kind:"half", abilities:["dex"], grant:{ ability:true, speed:10 },
    summary:"+1 DEX · Speed +10 ft",
    text:"Your Speed increases by 10 feet, and difficult terrain costs you no extra movement when you Dash." },
  battle_hardened: { name:"Battle-Hardened", kind:"half", abilities:["str","con"], grant:{ ability:true },
    summary:"+1 STR or CON · a bonus strike",
    text:"When you take the Attack action on your turn, you can make one unarmed or improvised melee strike as a Bonus Action." },
  steady_caster: { name:"Steady Caster", kind:"half", abilities:["int","wis","cha"], grant:{ ability:true },
    summary:"+1 a casting stat · iron concentration",
    text:"You have Advantage on Constitution saving throws to maintain Concentration, and you can perform the somatic components of spells even with weapons or a shield in hand." },
  keen_senses: { name:"Keen Senses", kind:"half", abilities:["wis"], grant:{ ability:true, skillProfs:["Perception"] },
    summary:"+1 WIS · Perception · never surprised",
    text:"You gain proficiency in Perception (or, if already proficient, you can't be Surprised while you are conscious)." },
  iron_skin: { name:"Iron Skin", kind:"half", abilities:["con"], grant:{ ability:true, ac:1 },
    summary:"+1 CON · +1 AC",
    text:"Your hide has weathered into something that turns blades. You gain a +1 bonus to Armor Class." },
  silver_tongue: { name:"Silver Tongue", kind:"half", abilities:["cha"], grant:{ ability:true, skillProfs:["Persuasion"] },
    summary:"+1 CHA · Persuasion",
    text:"You gain proficiency in Persuasion (or, if already proficient, you have Advantage on a Persuasion check once per Short Rest)." },
  resolute: { name:"Resolute", kind:"half", abilities:["str","dex","con","int","wis","cha"], grant:{ ability:true, saveProfFromAbility:true },
    summary:"+1 to a chosen ability · its saving throw",
    text:"Choose an ability to raise. You also gain proficiency in saving throws using that ability." },
};
