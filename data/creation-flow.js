/* ============================================================
   data/creation-flow.js — the SCRIPT for the guided Genesis ritual.
   Carved out of genesis.html (2026-06-22): the ordered world-genesis
   beats (STAGES / its WORLDBEATS alias), the spirit-guide narration
   (GUIDE), and the Life-chain step metadata (LIFE_STEP). Plain data,
   classic <script> global scope — read at call-time by src/world/play.js
   (world beats) and src/creator/*.js (the guided new-game passage).
   Owns: STAGES, WORLDBEATS, GUIDE, LIFE_STEP.
   ============================================================ */

/* the genesis seed order (sparse: structural + 2 nearby) */
const STAGES=[
  {key:"master",t:"master"},{key:"smell",t:"smell"},{key:"sound",t:"sound"},
  {key:"arch",t:"arch"},{key:"taboo",t:"taboo"},{key:"nearby",t:"nearby",triad:true},
  {key:"myth",t:"myth"},{key:"faction",t:"faction"},{key:"pressure",t:"pressure"},
  // "The Trouble at Hand" (pressure) is the LAST world reveal — the hook into play (Adam 2026-06-19).
];

/* the 9 world-genesis beats, under their play-side name */
const WORLDBEATS=STAGES; // the 9 world-genesis beats (master…faction; pressure last; nearby triad)

/* the spirit-guide's voice, one entry per beat; [first, repeat, terse]
   indexed by the bardo register (see creator/bardo.js guideLine). */
const GUIDE={
  threshold:["A soul is about to be. Be still — the between will shape you, then send you on.","You return to the threshold.","Again."],
  soul:["A soul stirs in the between. It will take its shape, and its history, before it takes a name.","A soul stirs.","Again."],
  species:["Every soul takes a shape to walk in. Choose the kind you will wear.","Your kind.","Kind."],
  class:["And a calling — the craft your hands and will are bent toward.","Your calling.","Calling."],
  background:["Where did this soul come from, before the story starts? Choose the life that shaped it.","Your background.","Background."],
  scores:["Now the raw stuff of the body. Roll it out, ability by ability.","Roll your body.","Scores."],
  skills:["Your calling sharpens some talents over others. Choose where you are keen.","Your skills.","Skills."],
  equipment:["You do not arrive empty-handed. Choose what you carry into the world.","Your kit.","Kit."],
  spells:["Magic answers to you. Choose the words and workings you already hold.","Your spells.","Spells."],
  lifeOrigins:["Memory comes, though you have not lived it yet. Where were you born, and to whom?","Your origins.","Origins."],
  lifePath:["Why this calling? Something turned you toward it. Roll, and remember.","Why this path.","The path."],
  lifeEvents:["And the years between — what happened to you. Roll your life into being.","Your life so far.","Life."],
  ht_setting:["Every soul is from somewhere — a town, a village, a ruin made livable. Let the between show you the place that shaped you.","Your hometown.","Home."],
  ht_history:["No place appeared from nothing. Something put it here — need, accident, belief, or greed. Roll and remember why.","How it began.","Origin."],
  ht_myth:["Every town has a story it tells about itself. True or not, it shapes the people in it. What does this place believe?","What they believe.","The myth."],
  master:["The body made, the soul falls toward a world. A place gathers to receive you.","The place.","The place."],
  smell:["Before the eyes, the senses. What is on the air?","The air.","The air."],
  sound:["Now the ear — every place has its sound.","The sound.","The sound."],
  arch:["What is it built of? Feel the bones of the place.","Built of.","Built of."],
  taboo:["Every people guards a line. Learn theirs before you cross it.","The taboo.","The taboo."],
  nearby:["No place stands alone. Two more wait beyond it.","Nearby.","Nearby."],
  myth:["What they believe is truer here than what is true. Hear the whisper.","The whisper.","The myth."],
  faction:["Power has already taken root here. Roll, and meet it.","The power.","The power."],
  pressure:["No world receives a soul in peace. Something is already wrong here — the last thing you learn before you wake.","The trouble.","The trouble."],
  found:["Now you know this soul, and the world it falls toward. Name them — it comes easier now — and open your eyes.","Name them, and open your eyes.","Name them."],
};

/* the Life chain — one roll per sub-table, dynamically queued
   (events expand off the age roll). */
const LIFE_STEP={
  parents:{tbl:"parents",label:"Your parents",guide:"Who gave you to the world?"},
  birthplace:{tbl:"birthplace",label:"Your birthplace",guide:"Where did it begin?"},
  siblings:{tbl:"siblingsNum",label:"Siblings",guide:"Alone, or among many?"},
  birthOrder:{tbl:"birthOrder",label:"Birth order",guide:"Where did you fall among them?"},
  family:{tbl:"family",label:"Who raised you",guide:"And who actually raised you?"},
  absentParent:{tbl:"absentParent",label:"The absent one",guide:"And the one who wasn't there?"},
  lifestyle:{tbl:"lifestyle",label:"Your means",guide:"Rich, poor, or scraping by?"},
  childhoodHome:{tbl:"childhoodHome",label:"Childhood home",guide:"Where did you lay your head?"},
  childhoodMemory:{tbl:"childhoodMemory",label:"A memory",guide:"What stayed with you?"},
  bgDecision:{die:6,label:"Why this background",guide:"What turned you to this life?"},
  classTraining:{die:6,label:"Why this calling",guide:"How did you come to your craft?"},
  age:{tbl:"lifeByAge",label:"Your years",guide:"How long, and how full, a life?"},
  event:{tbl:"lifeEvents",label:"A life event",guide:"And then — what happened?"},
};
