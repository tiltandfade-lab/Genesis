/* VERIFY: BEAT-SHAPED DIGEST — no provider calls.
   Proves view selection, deterministic mentioned-noun retrieval, sparse omission semantics,
   story-pressure continuity, ordinary-turn size, and dmPrepareTurn integration.

   Run: node dev/verify-beat-digest.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(ROOT,p),"utf8");
const JSDOM_HOME=process.env.JSDOM_HOME||join(process.env.HOME,".genesis-jsdom");
const {JSDOM}=createRequire(join(JSDOM_HOME,"package.json"))("jsdom");
const man=JSON.parse(read("manifest.json"));
const src=man.loadOrder.filter(p=>p.endsWith(".js")).map(read).join("\n;\n");
const dom=new JSDOM("<!doctype html><html><body><div id='worldView'></div><div id='toast'></div></body></html>",
  {runScripts:"dangerously",url:"http://localhost/"});
const win=dom.window;
win.eval("var U={worlds:{},activeWorldId:null,revealed:{},souls:[]};var SEED=null;\n"+src+
  ";window.DM_BEAT_KINDS=DM_BEAT_KINDS;window.DM_BEAT_TARGET_BYTES=DM_BEAT_TARGET_BYTES;"+
  "window.DM_BEAT_DIGEST_KEYS=DM_BEAT_DIGEST_KEYS;window.DM_DIGEST_KEYS=DM_DIGEST_KEYS;");
win.eval("renderWorld=function(){};wakeReveal=function(){};saveU=function(){};postState=function(){};"+
  "genReserveTopUp=function(){};turnRevealDrift=function(){};");

let passed=0,failed=0;
function check(name,ok,detail=""){
  if(ok){passed++;console.log("  ✓",name);}else{failed++;console.log("  ✗",name,"—",detail);}
}
const bytes=v=>Buffer.byteLength(JSON.stringify(v),"utf8");

function mkWorld(){
  const w={id:"w-beat",name:"The Bellweather",session:2,currentNodeId:"crypt",clock:{day:4,min:725},
    seed:{master:{name:"The Bellweather",desc:"A drowned bell-country."},smell:{name:"rain"},sound:{name:"bells"},
      arch:{name:"black stone"},taboo:{name:"Names Underwater",desc:"Never speak a drowned name."},
      myth:{name:"The Ninth Bell",desc:"It rings for the unburied."},faction:{name:"The Hooks"}},
    map:{nodes:{crypt:{id:"crypt",name:"The Salt Crypt",type:"Place",seen:true}},edges:[]},
    ledger:[],dmlog:[{role:"dm",text:"The crypt opened."}],gazetteer:[],factions:[],pressures:[],
    characters:[{id:"pc",status:"living",name:"Sella Voss",headline:"the woman the bells remember",pronouns:"she",
      conditions:[],sheet:{species:"Human",class:"Fighter",background:"Soldier",level:4,hp:34,hpCur:27,ac:16,gold:19,
        profBonus:2,scores:{str:16,dex:12,con:14,int:10,wis:11,cha:13},mods:{str:3,dex:1,con:2,int:0,wis:0,cha:1},
        saveProfs:["str","con"],skillProfs:["Athletics","Intimidation"],resources:{hitDice:{cur:3,max:4,die:10}},
        inventory:[],equipped:{mainHand:"greatsword",offHand:null,armor:"chain"},marks:["salt-white scar"]}}],
    dm:{lastNarratedNodeId:"crypt",digestAckSeq:0},revealed:{}};
  win.U={worlds:{[w.id]:w},activeWorldId:w.id,revealed:{},souls:[]};
  win.GS.dm={turnId:null,pending:false,poll:null,rollReq:null,ask:null,animate:false,telemetry:[]};
  win.GS.combat=null;
  return w;
}

function codexRecord(id,kind,name,at,known,secret){
  return {id,kind,name,fields:{role:kind==="npc"?"mourner":"landmark",appearance:"salt-stiff black linen",
      voice:"quiet as wet ashes",need:"to know who rang the ninth bell"},
    dm:{secret:secret||"none",want:"the buried oath returned",notes:[{text:"remembers the first funeral"}]},
    links:[],status:{at,known:!!known,soft:!known},attitude:kind==="npc"?{value:0,label:"Indifferent"}:undefined};
}

function fullFixture(w){
  const inventory=Array.from({length:20},(_,i)=>({id:i===7?"javelin-7":"item-"+i,
    name:i===7?"Black-fletched Javelin":"Travel Item "+i,qty:i%4===0?3:1,conditions:i===7?["blood-marked"]:[],
    ...(i===7?{codexId:"item:black-javelin"}:{})}));
  w.characters[0].sheet.inventory=inventory.map(x=>JSON.parse(JSON.stringify(x)));
  const local=[
    codexRecord("npc:mourner","npc","The Veiled Mourner","crypt",true,"she buried Sella's empty coffin"),
    codexRecord("location:coffin","location","The Stone Coffin","crypt",true,"it is warm beneath the lid"),
    codexRecord("npc:porter","npc","Orra Vale","crypt",true,"owes the Hooks a life"),
    codexRecord("object:bell","object","The Tongueless Bell","crypt",false,"it rings only in memory")
  ];
  const roster=Array.from({length:40},(_,i)=>({id:"npc:remote-"+i,kind:"npc",name:"Remote Person "+i,at:"far-"+i,known:i%2===0}));
  roster[13]={id:"npc:mara-voss",kind:"npc",name:"Mara Voss",at:"salt-market",known:false};
  win.codexAdd(w,{id:"npc:mara-voss",kind:"npc",name:"Mara Voss",fields:{role:"estranged sister",voice:"too bright for mourning"},
    dm:{secret:"she sent the false funeral notice",want:"Sella to leave before dusk"},status:{at:"salt-market",known:false,soft:true}});
  return {
    worldId:w.id,worldName:w.name,clock:{day:4,min:725,band:"day",exact:"12:05 PM",session:2,knowsTime:true},
    location:"The Salt Crypt",setting:null,
    pc:{id:"pc",name:"Sella Voss",headline:"the woman the bells remember",pronouns:"she",species:"Human",class:"Fighter",background:"Soldier",level:4,
      hp:{cur:27,max:34},gold:19,ac:16,profBonus:2,scores:w.characters[0].sheet.scores,mods:w.characters[0].sheet.mods,
      saveProfs:["str","con"],skillProfs:["Athletics","Intimidation"],conditions:[],marks:["salt-white scar"],
      resources:{hitDice:{cur:3,max:4,die:10}},inventory,equipped:{mainHand:"greatsword",offHand:null,armor:"chain"},
      equippedWeapons:{mainHand:{name:"Greatsword",damage:"2d6+3 slashing"},offHand:null},toolsCharms:null},
    powers:Array.from({length:6},(_,i)=>({clockId:"faction-"+i,faction:i===3?"The Hooks":"Faction "+i,dominant:i===3,
      agenda:"claim the drowned roads "+i,method:"debts and bells",tags:["salt"],clock:(i+1)+"/8"})),
    fronts:Array.from({length:5},(_,i)=>({clockId:"front-"+i,kind:"doom-"+i,danger:i===2?"The Ninth Bell":"Danger "+i,
      clock:(i===2?6:i+1)+"/6",closed:false,dmOnly:{truth:"truth "+i,doom:"doom "+i}})),
    recentLedger:Array.from({length:6},(_,i)=>({type:"beat",day:4,min:600+i*20,text:"Consequence "+i+(i===1?" involving Mara":"")})),
    gazetteer:Array.from({length:8},(_,i)=>({type:"Place",name:"Known Place "+i,desc:"A distant place "+i})),
    codex:local,codexRoster:roster,minted:[],revealed:["taboo"],sessionLean:null,tarot:null,
    activeWalk:null,ambientPresence:{count:2,texture:"a few locals going about their business"},combat:null,
    prepPending:null,levelUp:null,arrivalBrief:null,itemLegacy:[{codexId:"item:pale-sabre",lossState:"claimed-faction"}],
    itemCustody:[{item:{id:"laid-arrow",name:"Arrow",qty:1},holder:{kind:"object",ref:"coffin",name:"the coffin"}}],
    bastion:null,pendingSituation:null
  };
}

function routeFor(w,action){return win.dmRoute(w,action,{});}

console.log("\n  VERIFY: BEAT-SHAPED DIGEST\n");
check("five explicit view kinds are registered",JSON.stringify(win.DM_BEAT_KINDS)===JSON.stringify(["scene","inventory","combat","travel","social"]),JSON.stringify(win.DM_BEAT_KINDS));
check("ordinary target is exactly 3 KiB",win.DM_BEAT_TARGET_BYTES===3072,String(win.DM_BEAT_TARGET_BYTES));

const w=mkWorld(), full=fullFixture(w);

const worldBefore=JSON.stringify(w);
const scene=win.dmBeatDigest(w,"I study the room and listen to the bells.",routeFor(w,"I study the room and listen to the bells."),{full});
check("default contextual action selects scene",scene.view==="scene",scene.view);
check("scene carries invariant clock/location/PC core",scene.clock.min===725&&scene.location==="The Salt Crypt"&&scene.pc.name==="Sella Voss",JSON.stringify(scene));
check("scene keeps current story pressure rather than becoming context-free",scene.fronts&&scene.fronts.some(x=>x.danger==="The Ninth Bell")&&scene.powers&&scene.powers.length>0,JSON.stringify({fronts:scene.fronts,powers:scene.powers}));
check("scene keeps the newest consequences",scene.recentLedger&&scene.recentLedger.at(-1).text==="Consequence 5",JSON.stringify(scene.recentLedger));
const recallFull=JSON.parse(JSON.stringify(full));
recallFull.recentLedger=[
  {type:"outcome",day:4,min:700,text:"The guards withdrew."},
  {type:"canon",day:4,min:710,text:"The stone hives belonged to the Office of Amber Weights under the split-honeycomb seal."},
  {type:"outcome",day:4,min:711,text:"A door closed."},
  {type:"outcome",day:4,min:712,text:"+1 XP."}
];
const recallAction="What did I establish about the Office of Amber Weights and the split-honeycomb seal?";
const recalled=win.dmBeatDigest(w,recallAction,routeFor(w,recallAction),{full:recallFull,targetBytes:2100});
check("an action-matched canonical ledger fact survives final byte fitting ahead of newer bookkeeping",
  recalled.recentLedger?.some(r=>r.matched&&/Office of Amber Weights/.test(r.text))&&bytes(recalled)<=2100,
  JSON.stringify({bytes:bytes(recalled),ledger:recalled.recentLedger}));
check("ordinary scene omits the global roster structurally",!("codexRoster" in scene)&&scene.retrieval.omitted.codex>=40,JSON.stringify(scene.retrieval));
check("ordinary scene stays within 3 KiB",bytes(scene)<=3072,`${bytes(scene)} B`);
check("projection with supplied truth is read-only",JSON.stringify(w)===worldBefore,"world changed while projecting");

const socialAction="I ask Mara Voss why she sent word of my funeral.";
const social=win.dmBeatDigest(w,socialAction,routeFor(w,socialAction),{full});
const mara=social.codex&&social.codex.find(r=>r.id==="npc:mara-voss");
check("dialogue selects social",social.view==="social",social.view);
check("a named off-scene NPC is retrieved full instead of shipping every roster line",mara&&mara.dm&&mara.dm.secret==="she sent the false funeral notice",JSON.stringify(social.codex));
check("unknown/soft status survives the compact DM projection",mara&&mara.status.known===false&&mara.status.soft===true,JSON.stringify(mara&&mara.status));
check("an unrelated remote NPC remains omitted",!social.codex.some(r=>r.id==="npc:remote-4"),JSON.stringify(social.codex));
check("ordinary social view stays within 3 KiB",bytes(social)<=3072,`${bytes(social)} B`);

w.map.nodes["amber-glass-quay"]={id:"amber-glass-quay",name:"Amber-Glass Quay",type:"Place",seen:true};
win.codexAdd(w,{id:"location:amber-glass-quay-route",kind:"location",name:"Amber-Glass Quay",
  fields:{desc:"a distant glass port"},status:{known:true,soft:false}});
const destinationDigest=win.dmBeatDigest(w,"I return to Amber-Glass Quay by the canal road.",
  routeFor(w,"I return to Amber-Glass Quay by the canal road."),{full});
const destination=destinationDigest.codex?.find(r=>r.id==="location:amber-glass-quay-route");
check("an explicitly retrieved location carries its verified mapNodeId for move_node",
  destination?.mapNodeId==="amber-glass-quay",JSON.stringify(destinationDigest.codex));

const compositeAction="I check my pouch, then ask Mara Voss where the pickpocket went.";
const composite=win.dmBeatDigest(w,compositeAction,routeFor(w,compositeAction),{full});
check("dialogue plus an explicit pouch check keeps social primary and adds bounded inventory truth",
  composite.view==="social"&&composite.slices.includes("inventory")&&
    composite.slices.includes("item-custody")&&composite.pc.inventory?.length>0,
  JSON.stringify({view:composite.view,slices:composite.slices,pc:composite.pc}));
check("composite social inventory retains stable ids and reports the bounded remainder",
  composite.pc.inventory.some(it=>it.id==="javelin-7")&&composite.pc.inventory.length<=16&&composite.pc.inventoryMore>0,
  JSON.stringify(composite.pc));

// Founding/bootstrap digests intentionally omit the remote roster. Exact canonical identity must
// still beat a crowded shared title and survive the final byte-fit pass with its private truth.
[
  ["captain-aster","Captain Aster","keeps the harbor books"],
  ["captain-brann","Captain Brann","takes bribes in salt"],
  ["captain-corin","Captain Corin","guards the eastern gate"],
  ["captain-dain","Captain Dain","owes the Hooks a favor"],
  ["captain-elin","Captain Elin","sleeps beneath the watchtower"],
  ["captain-fenn","Captain Fenn","Fenn poisoned the old marshal"]
].forEach(([id,name,secret])=>win.codexAdd(w,{id:"npc:"+id,kind:"npc",name,
  fields:{role:"city captain",appearance:"a rain-dark uniform with a silver chain",voice:"measured and formal"},
  dm:{secret,want:"the watch records sealed",notes:[{text:"shared title must not determine retrieval"}]},
  status:{at:"far-watch",known:false,soft:true}}));
const founding=JSON.parse(JSON.stringify(full)); founding.codexRoster=[];
const fennDigest=win.dmBeatDigest(w,"I ask Captain Fenn why the old marshal died.",
  routeFor(w,"I ask Captain Fenn why the old marshal died."),{full:founding,targetBytes:2300});
const fenn=fennDigest.codex&&fennDigest.codex.find(r=>r.id==="npc:captain-fenn");
check("exact canonical name is retrievable even when the founding roster is suppressed",
  fenn&&fenn.dm&&/poisoned/.test(fenn.dm.secret),JSON.stringify(fennDigest.codex));
check("exact named record is pinned through final digest fitting",
  fennDigest.retrieval.pinnedCodexIds?.includes("npc:captain-fenn")&&bytes(fennDigest)<=2300,
  JSON.stringify({bytes:bytes(fennDigest),retrieval:fennDigest.retrieval,codex:fennDigest.codex}));

win.codexAdd(w,{id:"npc:tessa-rill",kind:"npc",name:"Tessa Rill",fields:{role:"retired sluice clerk"},
  dm:{secret:"her shadow was removed from the order",want:"the public record corrected"},status:{at:"far-gallery",known:true,soft:false}});
const tessaDigest=win.dmBeatDigest(w,"I ask Tessa whether the corrected sentence is truly hers.",
  routeFor(w,"I ask Tessa whether the corrected sentence is truly hers."),{full:founding,targetBytes:2300});
check("a unique first name retrieves and pins the addressed canonical NPC",
  tessaDigest.codex?.some(r=>r.id==="npc:tessa-rill")&&tessaDigest.retrieval.pinnedCodexIds?.includes("npc:tessa-rill"),
  JSON.stringify({codex:tessaDigest.codex,retrieval:tessaDigest.retrieval}));
win.codexAdd(w,{id:"location:amber-glass-quay",kind:"location",name:"Amber-Glass Quay",
  fields:{desc:"a distant glass port"},dm:{secret:"the harbor books are false"},status:{at:"far-quay",known:false,soft:true}});
const glassBeeDigest=win.dmBeatDigest(w,
  "I bring the First Answer Tube to Tessa and ask whether its glass-bee reply is an archive echo.",
  routeFor(w,"I bring the First Answer Tube to Tessa and ask whether its glass-bee reply is an archive echo."),
  {full:founding,targetBytes:2300});
check("ordinary words do not become false unique-name pins",
  !glassBeeDigest.retrieval.pinnedCodexIds?.includes("location:amber-glass-quay")&&
    !glassBeeDigest.codex?.some(r=>r.id==="location:amber-glass-quay"),
  JSON.stringify({codex:glassBeeDigest.codex,retrieval:glassBeeDigest.retrieval}));
win.codexAdd(w,{id:"location:sealed-dispatch",kind:"location",name:"The Sealed Dispatch Landing",
  fields:{desc:"a dry archive landing"},dm:{secret:"messages are fused into glass"},status:{at:"crypt",known:true,soft:false}});
const sealedAction="I keep the tube sealed while I ask Tessa about the buttons.";
const sealedDigest=win.dmBeatDigest(w,sealedAction,routeFor(w,sealedAction),{full:founding,targetBytes:2300});
check("a unique adjective does not turn a location into a first-name match",
  !sealedDigest.retrieval.pinnedCodexIds?.includes("location:sealed-dispatch"),
  JSON.stringify({codex:sealedDigest.codex,retrieval:sealedDigest.retrieval}));

win.codexAdd(w,{id:"item:shadowless-tube",kind:"item",name:"The Shadowless Message Tube",
  fields:{object:"The Shadowless Message Tube"},dm:{truth:"an older archive tube"},status:{known:true,soft:false}});
win.codexAdd(w,{id:"item:first-answer-tube",kind:"item",name:"The First Answer Tube",
  fields:{object:"The First Answer Tube"},dm:{truth:"the newly minted living-first reply"},status:{known:true,soft:false}});
const mintFull=JSON.parse(JSON.stringify(founding));
mintFull.codex=(mintFull.codex||[]).concat([win.codexFullRecord(w,win.codexGet(w,"item:shadowless-tube"))]);
mintFull.minted=[{id:"item:first-answer-tube",kind:"item",name:"The First Answer Tube",genRef:"t-29"}];
const mintedDigest=win.dmBeatDigest(w,"I accept the fresh tube from Naivara and inspect it.",
  routeFor(w,"I accept the fresh tube from Naivara and inspect it."),{full:mintFull,targetBytes:2300});
check("freshly minted item identity is pinned ahead of an older similar item",
  mintedDigest.codex?.some(r=>r.id==="item:first-answer-tube")&&
    mintedDigest.retrieval.pinnedCodexIds?.includes("item:first-answer-tube"),
  JSON.stringify({codex:mintedDigest.codex,retrieval:mintedDigest.retrieval}));
const answerFull=JSON.parse(JSON.stringify(founding));
answerFull.pc.inventory=(answerFull.pc.inventory||[]).concat([{id:"tube-inst",name:"The First Answer Tube",qty:1,codexId:"item:first-answer-tube"}]);
const honestAction="I ask Tessa for an honest answer about her promise.";
const honestDigest=win.dmBeatDigest(w,honestAction,routeFor(w,honestAction),{full:answerFull,targetBytes:2300});
check("an ordinary word inside an item name does not falsely retrieve the carried item",
  !honestDigest.codex?.some(r=>r.id==="item:first-answer-tube")&&
    !honestDigest.retrieval.actionCodexIds?.includes("item:first-answer-tube"),
  JSON.stringify({codex:honestDigest.codex,retrieval:honestDigest.retrieval}));
w.dm.continuityCodexTurns=[["item:first-answer-tube"]];
const referentDigest=win.dmBeatDigest(w,"I ask Naivara what the glass-bee report cost its sender.",
  routeFor(w,"I ask Naivara what the glass-bee report cost its sender."),{full:founding,targetBytes:2300});
check("the prior beat's exact noun survives one descriptive-reference turn",
  referentDigest.codex?.some(r=>r.id==="item:first-answer-tube")&&
    referentDigest.retrieval.continuityCodexIds?.includes("item:first-answer-tube"),
  JSON.stringify({codex:referentDigest.codex,retrieval:referentDigest.retrieval}));
w.dm.continuityCodexTurns=[["item:first-answer-tube","npc:tessa-rill"]];
const pivotAction="I leave that road alone today and ask Captain Fenn what the harbor needs.";
const pivotDigest=win.dmBeatDigest(w,pivotAction,routeFor(w,pivotAction),{full:founding,targetBytes:2300});
check("an explicit subject pivot does not revive unrelated prior-beat records",
  pivotDigest.codex?.some(r=>r.id==="npc:captain-fenn")&&
    !pivotDigest.codex?.some(r=>r.id==="item:first-answer-tube"||r.id==="npc:tessa-rill")&&bytes(pivotDigest)<=2300,
  JSON.stringify({bytes:bytes(pivotDigest),codex:pivotDigest.codex,retrieval:pivotDigest.retrieval}));
check("explicit action nouns are distinguished from aging continuity nouns",
  pivotDigest.retrieval.actionCodexIds?.includes("npc:captain-fenn")&&
    !pivotDigest.retrieval.continuityCodexIds,
  JSON.stringify(pivotDigest.retrieval));
w.dm.continuityCodexTurns=[["item:first-answer-tube","npc:tessa-rill"]];
const unrelatedAction="I scrape soot from the oldest law plaque and inspect its exemption marks.";
const unrelatedDigest=win.dmBeatDigest(w,unrelatedAction,routeFor(w,unrelatedAction),{full:founding,targetBytes:2300});
check("a noun-free beat without an actual backward reference does not inherit stale continuity",
  !unrelatedDigest.retrieval.continuityCodexIds&&
    !unrelatedDigest.codex?.some(r=>r.id==="item:first-answer-tube"||r.id==="npc:tessa-rill"),
  JSON.stringify({codex:unrelatedDigest.codex,retrieval:unrelatedDigest.retrieval}));
const twoActorAction="I ask Captain Fenn and Tessa to compare what each of them knows.";
const twoActorDigest=win.dmBeatDigest(w,twoActorAction,routeFor(w,twoActorAction),{full:founding,targetBytes:2300});
check("multiple explicitly addressed actors survive fitting without breaking the byte ceiling",
  twoActorDigest.codex?.some(r=>r.id==="npc:captain-fenn")&&twoActorDigest.codex?.some(r=>r.id==="npc:tessa-rill")&&
    bytes(twoActorDigest)<=2300&&!twoActorDigest.retrieval.overTargetBytes,
  JSON.stringify({bytes:bytes(twoActorDigest),codex:twoActorDigest.codex,retrieval:twoActorDigest.retrieval}));
w.dm.continuityCodexTurns=[];

const itemAction="I balance the black-fletched javelin across the coffin lid.";
const inventory=win.dmBeatDigest(w,itemAction,routeFor(w,itemAction),{full});
check("a named carried object selects inventory without mechanizing the prose",inventory.view==="inventory"&&routeFor(w,itemAction).mode==="freeform-ruling",JSON.stringify({view:inventory.view,route:routeFor(w,itemAction)}));
check("inventory focus retains the mentioned stable item id",inventory.pc.inventory&&inventory.pc.inventory.some(it=>it.id==="javelin-7"),JSON.stringify(inventory.pc.inventory));
check("beat PC and storied inventory retain canonical ids",inventory.pc.id==="pc"&&inventory.pc.inventory.some(it=>it.codexId==="item:black-javelin"),JSON.stringify(inventory.pc));
check("inventory focus carries current custody without reviving unrelated legacy losses",
  inventory.itemCustody&&!inventory.itemLegacy,JSON.stringify({custody:inventory.itemCustody,legacy:inventory.itemLegacy}));
const lostDigest=win.dmBeatDigest(w,"Which lost item became a faction legacy?",
  routeFor(w,"Which lost item became a faction legacy?"),{full});
check("an explicit loss or legacy question retrieves the legacy register",
  lostDigest.itemLegacy?.some(r=>r.codexId==="item:pale-sabre"),JSON.stringify(lostDigest.itemLegacy));
check("large inventory is bounded and reports omitted count",inventory.pc.inventory.length<=8&&inventory.pc.inventoryMore>0,JSON.stringify(inventory.pc));
check("ordinary inventory view stays within 3 KiB",bytes(inventory)<=3072,`${bytes(inventory)} B`);
const pluralFull=JSON.parse(JSON.stringify(full));
pluralFull.pc.inventory.push({id:"costume-stack",name:"Costume",qty:2});
const pluralItem=win.dmBeatDigest(w,"I soak my costumes and wrap one over my face.",
  routeFor(w,"I soak my costumes and wrap one over my face."),{full:pluralFull});
check("a natural plural retrieves the unique singular inventory record with its stable id",
  pluralItem.pc.inventory?.some(it=>it.id==="costume-stack"&&it.qty===2),JSON.stringify(pluralItem.pc.inventory));

const travelFull=JSON.parse(JSON.stringify(full));
travelFull.activeWalk={nodeId:"road",place:"The Drowned Road",environment:"wilderness",topology:"linear",
  briefing:"Reach the bell-house before the tide crosses the milestones.",skin:{text:"rain through drowned wheat",band:"fray1"},
  risk:{danger:"severe",reward:"meaningful",telegraphs:["bells below the mud"],escapes:["the raised stones"]},spiceTier:"fray1",
  cursor:{current:6,touched:[1,2,3,4,5,6],done:false,total:12},
  segments:Array.from({length:12},(_,i)=>i===5?{num:6,label:"The Sunken Mile",state:"here",gist:"flooded causeway / omen",atmo:"bells underfoot"}:
    {num:i+1,label:"Mile "+(i+1),state:i<5?"behind":"ahead",...(i===4||i===6?{approach:true,gist:"reachable tide road / hazard"}:{})}),
  cast:{npcIds:["npc:mourner"],itemIds:[]},ambientPresence:null};
const travel=win.dmBeatDigest(w,"I continue along the drowned road.",routeFor(w,"I continue along the drowned road."),{full:travelFull});
check("movement/active walk selects travel",travel.view==="travel",travel.view);
const spellOnWalk=win.dmBeatDigest(w,"I use Minor Illusion to ring the bell across the street.",
  routeFor(w,"I use Minor Illusion to ring the bell across the street."),{full:travelFull});
check("generic spell use during a walk does not falsely select the inventory view",
  spellOnWalk.view==="travel",JSON.stringify({view:spellOnWalk.view,pc:spellOnWalk.pc}));
const skillRollOnWalk=win.dmBeatDigest(w,"(I roll Sleight of Hand: 10)",
  routeFor(w,"(I roll Sleight of Hand: 10)"),{full:travelFull});
check("a Sleight of Hand result during a walk does not falsely select the inventory view",
  skillRollOnWalk.view==="travel",JSON.stringify({view:skillRollOnWalk.view,pc:skillRollOnWalk.pc}));
const itemBranch=win.dmBeatDigest(w,"I balance the Black-fletched Javelin, then return to Mile 5.",
  routeFor(w,"I balance the Black-fletched Javelin, then return to Mile 5."),{full:travelFull});
check("an inventory-heavy walk turn still carries current room plus both immediate graph exits",
  itemBranch.view==="inventory"&&itemBranch.activeWalk&&itemBranch.activeWalk.segments.filter(s=>s.approach).length===2&&
    itemBranch.activeWalk.segments.some(s=>s.state==="behind"&&s.approach),JSON.stringify(itemBranch.activeWalk));
check("travel keeps the current rolled segment and fairness contract",travel.activeWalk&&travel.activeWalk.risk&&travel.activeWalk.segments.some(s=>s.state==="here"&&s.gist),JSON.stringify(travel.activeWalk));
check("long walks fit by keeping here, actionable graph exits, and an honest omitted count",
  travel.activeWalk.segments.length<=3&&travel.activeWalk.segments.some(s=>s.state==="here")&&
    travel.activeWalk.moreSegments===12-travel.activeWalk.segments.length,JSON.stringify(travel.activeWalk));
check("ordinary travel view stays within 3 KiB",bytes(travel)<=3072,`${bytes(travel)} B`);

const targetedSpellOnWalk=win.dmBeatDigest(w,
  "I do not fight them. I cast Minor Illusion at the mud-caked dead end, then move toward the next exit.",
  routeFor(w,"I do not fight them. I cast Minor Illusion at the mud-caked dead end, then move toward the next exit."),
  {full:travelFull});
check("a pre-engagement combat-shaped spell keeps combat-capable PC truth plus the live walk and exits",
  targetedSpellOnWalk.view==="combat"&&targetedSpellOnWalk.slices.includes("active-walk")&&
    targetedSpellOnWalk.activeWalk?.segments.some(s=>s.state==="here")&&
    targetedSpellOnWalk.activeWalk?.segments.filter(s=>s.approach).length===2,
  JSON.stringify({view:targetedSpellOnWalk.view,slices:targetedSpellOnWalk.slices,walk:targetedSpellOnWalk.activeWalk}));

const combatFull=JSON.parse(JSON.stringify(travelFull));
combatFull.combat={round:3,side:"foes",first:"pc",pc:{band:"melee",lane:"C",hp:"27/34",conditions:[]},
  foes:[{fid:"f1",name:"Salt Wolf",band:"melee",lane:"L",state:"bloodied",conditions:[],realm:"gloom"},
        {fid:"f2",name:"Bell Warden",band:"near",lane:"C",state:"fresh",conditions:["frightened"],realm:"gloom"}],
  scene:{cover:["coffin"],hazards:["rising brine"],exits:["stair"]},light:"blue dusk",
  proposals:[{fid:"f2",action:"withdraw behind the coffin",targetHint:"pc",source:"state-machine"}]};
win.GS.combat={active:true};
const combat=win.dmBeatDigest(w,"I hold the stair.",routeFor(w,"I hold the stair."),{full:combatFull});
win.GS.combat=null;
check("live combat always selects combat",combat.view==="combat",combat.view);
check("combat carries tactical truth and combat-capable PC state",combat.combat&&combat.combat.foes.length===2&&combat.pc.mods.str===3&&combat.pc.resources.hitDice.cur===3,JSON.stringify(combat));
check("combat does not duplicate the active walk packet",!("activeWalk" in combat),JSON.stringify(Object.keys(combat)));

const social2=win.dmBeatDigest(w,socialAction,routeFor(w,socialAction),{full});
check("same world/action/full truth produces byte-identical output",JSON.stringify(social)===JSON.stringify(social2),"non-deterministic output");
check("every emitted key belongs to the declared sparse beat shape",Object.keys(scene).every(k=>win.DM_BEAT_DIGEST_KEYS.includes(k)),JSON.stringify(Object.keys(scene)));
check("full dmDigest contract remains a separate larger compatibility vocabulary",win.DM_DIGEST_KEYS.includes("codexRoster")&&!win.DM_BEAT_DIGEST_KEYS.includes("codexRoster"),JSON.stringify({full:win.DM_DIGEST_KEYS,beat:win.DM_BEAT_DIGEST_KEYS}));
check("representative scene packet is materially smaller than full truth",bytes(scene)<bytes(full)*0.45,`beat=${bytes(scene)} full=${bytes(full)}`);

// Real integration: dmPrepareTurn builds full truth, then ships the beat projection.
const integrationWorld=mkWorld();
integrationWorld.characters[0].sheet.inventory=[{id:"rope",name:"Rope",qty:1,conditions:[]}];
integrationWorld.factions=[{name:"The Hooks",dominant:true,agenda:"claim the crypt",method:"debt",tags:[],clock:{filled:3,size:6}}];
integrationWorld.pressures=[{kind:"omen",danger:"The Ninth Bell",real:{text:"the tide is listening"},doom:"the crypt floods",clock:{filled:5,size:6},closed:false}];
const resolved=win.dmResolveTurnRoute(integrationWorld,"I listen at the coffin.",{},Date.now());
const prepared=win.dmPrepareTurn(integrationWorld,"I listen at the coffin.",[],{},resolved);
check("dmPrepareTurn ships beat-digest/v1 on the real transport seam",prepared.turn.digest&&prepared.turn.digest.schema==="beat-digest/v1",JSON.stringify(prepared.turn.digest));
check("transport telemetry measures the compact packet, not the full bootstrap",win.dmTurnMeta(prepared,"mailbox").digestBytes===bytes(prepared.turn.digest),JSON.stringify(win.dmTurnMeta(prepared,"mailbox")));

console.log(`\n${failed?"✗":"✓"} beat-digest: ${passed} passed, ${failed} failed`);
if(failed)process.exit(1);
