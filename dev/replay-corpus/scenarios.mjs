/* dev/replay-corpus/scenarios.mjs — zero-provider, cross-turn adversarial corpus.
   Seven four-turn arcs exercise the production DM preparation/apply seam while state persists
   between turns. `known-gap` checks describe engine limitations discovered by the survey; they are
   evidence, not green assertions disguised as failures. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = JSON.parse(readFileSync(join(ROOT, "dev/state-eval/fixtures/hx-02-check-carried.json"), "utf8")).state;

const clone = value => JSON.parse(JSON.stringify(value));
const active = state => state.U.worlds[state.U.activeWorldId];
const pc = state => active(state).characters.find(c => c.status === "living");
const event = (type, payload, source = "declared") => ({ type, source, payload: payload || {} });
const response = (narration, events = []) => ({ narration, events, gen: [], dmNotes: "recorded zero-provider corpus" });

function baseState(name){
  const state = clone(BASE), w = active(state);
  w.name = name;
  w.seed.master = { name, desc: "An adversarial replay fixture." };
  w.dmlog = []; w.ledger = []; w.log = []; w.session = 2;
  w.dm = { rollReq:null, ask:null, pendingTurnId:null, lastNarratedNodeId:w.currentNodeId,
    digestAckSeq:0, mintQueue:[], sessionSeqWatermark:0, pendingSituation:null, pendingRoll:null };
  w.characters[0].name = "Sella Vey";
  w.characters[0].headline = "a witness with a long memory";
  w.characters[0].sheet.inventory = [
    { id:"javelin-ash", name:"Ash Javelin", qty:1, conditions:[] },
    { id:"ration-1", name:"Rations", qty:3, conditions:[] }
  ];
  w.characters[0].sheet.equipped = { mainHand:"javelin-ash", offHand:null, armor:null, grip:"1h" };
  w.characters[0].sheet.resources = {};
  state.gs = { dm:{ turnId:null, pending:false, poll:null, rollReq:null, ask:null, animate:false,
    telemetry:[] }, combat:null, chase:null };
  return state;
}

function walk(id, place, environment = "dungeon"){
  return { id, environment, topology:"linear", segCount:3, skin:{text:"salt-black stone",band:"baseline"},
    segments:[
      {num:1,depth:0,label:"Threshold",segType:"threshold",areaType:"entry"},
      {num:2,depth:1,label:"Coffin Gallery",segType:"chamber",areaType:"gallery"},
      {num:3,depth:2,label:"Bell Vault",segType:"finale",areaType:"vault",isFinale:true,
        finale:{track:"the bell beneath the floor"}}
    ], place };
}

function addWalks(state){
  const w = active(state);
  w.map.nodes["walk-a"] = {id:"walk-a",name:"The Shimmering Maw",type:"Frontier",seen:true,soft:false};
  w.map.nodes["walk-b"] = {id:"walk-b",name:"The Cinder Causeway",type:"Frontier",seen:true,soft:false};
  w.map.edges.push({from:w.currentNodeId,to:"walk-a",travelMin:10,soft:false});
  w.map.edges.push({from:"walk-a",to:"walk-b",travelMin:15,soft:false});
  w.currentNodeId = "walk-a"; w.dm.lastNarratedNodeId = "walk-a";
  w.prep = {session:w.session,bundle:null,overlays:{},harvest:null,debt:[],activeWalkId:"walk-a",walkLog:[],nodes:{
    "walk-a":{env:"dungeon",soft:false,locked:true,walk:walk("walk-a","The Shimmering Maw"),
      cursor:{current:2,touched:[1,2],tickedSegs:[2],done:false},walkState:"active",segments:[{ref:"S2",note:"a stone coffin with an iron ring"}]},
    "walk-b":{env:"wilderness",soft:false,locked:true,walk:walk("walk-b","The Cinder Causeway","wilderness"),
      cursor:null,walkState:null,segments:[]}
  }};
  return state;
}

function codexNpc(id, name, secret, at = "remote-watch"){
  return {id,kind:"npc",name,rolled:null,fields:{role:"watch captain",voice:"measured"},
    dm:{secret,want:"keep the old oath buried"},links:[],status:{known:false,soft:true,at,condition:"ok"},
    provenance:"authored",source:null,origin:null,ledgerRefs:[],seq:1,touchedSeq:1};
}

function addKnowledge(state){
  const w = active(state); w.codex = {version:1,seq:6,records:{},facts:{}};
  [
    ["captain-arlen","Captain Arlen","Arlen carries the false seal."],
    ["captain-bren","Captain Bren","Bren sold the east gate key."],
    ["captain-cerys","Captain Cerys","Cerys serves the moon court."],
    ["captain-dain","Captain Dain","Dain fears the drowned chapel."],
    ["captain-essa","Captain Essa","Essa is the masked heir."],
    ["captain-fenn","Captain Fenn","Fenn poisoned the old marshal."]
  ].forEach(([id,name,secret],i)=>{ const r=codexNpc(id,name,secret); r.seq=i+1; r.touchedSeq=i+1; w.codex.records[id]=r; });
  return state;
}

function twoWorlds(state){
  const a = active(state); a.id = "world-a"; a.name = "World A";
  const b = clone(a); b.id = "world-b"; b.name = "World B"; b.dmlog=[]; b.ledger=[];
  b.factions[0].clock.filled = 0; a.factions[0].clock.filled = 0;
  state.U.worlds = {"world-a":a,"world-b":b}; state.U.activeWorldId="world-a";
  return state;
}

const checks = {
  route(mode){ return c => c.digest.route.mode === mode; },
  applied(type, predicate = r => r && r.ok === true){
    return c => { const row=(c.apply?.appliedResults||[]).find(x=>x.type===type); return !!row&&predicate(row.res); };
  },
  receipt(predicate){ return c => !!c.digest.receipt && predicate(c.digest.receipt); },
};

function turn(id, action, narration, events, assertions, extra = {}){
  return Object.assign({id,action,response:response(narration,events),assertions:assertions||[],
    dramatic:{required:[]},aiRole:"voice"}, extra);
}

export const scenarios = [
  {
    id:"custody", title:"Portable custody across walk segments", seed:101, initial:()=>addWalks(baseState("Custody Hold")),
    turns:[
      turn("custody-1","I set the Ash Javelin on the coffin.","Sella lays the ash-dark javelin across the coffin's iron ring.",
        [event("item_transfer",{itemId:"javelin-ash",to:{kind:"object",ref:"walk-a:S2:coffin",name:"stone coffin"},note:"laid across the iron ring"})],
        [
          {name:"trusted transfer routes mechanics-first",kind:"green",test:checks.route("declared-mechanic")},
          {name:"receipt owns the transfer",kind:"green",test:checks.receipt(r=>r.accepted&&r.result.ok)},
          {name:"narrator duplicate is ignored",kind:"green",test:checks.applied("item_transfer",r=>r.ignored==="settled-by-receipt")},
          {name:"custody receives stable item id",kind:"green",test:c=>!!active(c.after).itemCustody?.items["javelin-ash"]}
        ], {opts:{mechanic:{type:"item-transfer",payload:{itemId:"javelin-ash",to:{kind:"object",ref:"walk-a:S2:coffin",name:"stone coffin"},note:"laid across the iron ring"}}}, dramatic:{required:[/coffin/i,/iron ring/i]}}),
      turn("custody-2","I pass into the Bell Vault.","The gallery narrows; the buried bell's bronze breath trembles through the vault.",
        [event("walk_advance",{nodeId:"walk-a",toSeg:3})],
        [{name:"walk cursor advances to S3",kind:"green",test:c=>active(c.after).prep.nodes["walk-a"].cursor.current===3}],
        {dramatic:{required:[/bell/i,/vault/i]}}),
      turn("custody-3","I look around the Bell Vault.","Dust lifts from the floor in rings, as if something below has just exhaled.",[],
        [{name:"S2 custody stays out of the S3 beat digest",kind:"green",test:c=>!JSON.stringify(c.digest.digest?.itemCustody||null).includes("javelin-ash")}],
        {dramatic:{required:[/below/i]}}),
      turn("custody-4","I return and take the Ash Javelin from the coffin.","Sella closes a hand around the familiar ashwood shaft.",[],
        [{name:"custody transfers back to the PC atomically",kind:"green",test:c=>c.digest.receipt?.accepted===true&&pc(c.after).sheet.inventory.some(i=>i.id==="javelin-ash")&&!active(c.after).itemCustody?.items["javelin-ash"]}],
        {opts:{mechanic:{type:"item-transfer",payload:{itemId:"javelin-ash",to:{kind:"pc",ref:"c1",name:"Sella Vey"}}}}, dramatic:{required:[/ashwood/i]}})
    ]
  },
  {
    id:"rest", title:"Rest receipt ordering and refusal", seed:211, initial:()=>{const s=baseState("Rest Hold"); pc(s).sheet.hpCur=4; pc(s).sheet.lastLongRest={day:1,min:420}; return s;},
    turns:[
      turn("rest-1","I take a long rest.","Sella sleeps, but the second sleep in a day brings no second renewal.",
        [event("rest",{kind:"long"})], [
          {name:"exact rest routes mechanics-first",kind:"green",test:checks.route("declared-mechanic")},
          {name:"rest settles before narration",kind:"green",test:checks.receipt(r=>r.accepted&&r.result.minutes>0)},
          {name:"duplicate rest event is ignored",kind:"green",test:checks.applied("rest",r=>r.ignored==="settled-by-receipt")}
        ], {dramatic:{required:[/second/i,/renewal/i]}}),
      turn("rest-2","I take a short rest while the raider circles me.","There is no rest inside the raider's reach; the attempt dies before it begins.",[],
        [{name:"combat refuses rest before narration",kind:"green",test:checks.receipt(r=>!r.accepted&&r.result.reason==="combat-active")}],
        {beforeDigest:s=>{s.gs.combat={active:true,round:2,first:"foes",foes:[{fid:"f1",name:"Ash Raider",hp:7,hpMax:7,ac:12,down:false}],pcRef:{name:"Sella Vey"}};}, opts:{mechanic:{type:"rest",payload:{kind:"short"}}}, dramatic:{required:[/no rest/i,/reach/i]}}),
      turn("rest-3","I take a short rest.","With the raider gone, Sella binds the worst of the cut and listens for pursuit.",[],
        [{name:"short rest applies after combat clears",kind:"green",test:checks.receipt(r=>r.accepted&&r.result.rest==="short")}],
        // Combat is persisted on the world so reload can rehydrate the transient tracker. This
        // fixture is deliberately ending the fight, therefore clear both sides of that invariant.
        {beforeDigest:s=>{s.gs.combat=null; active(s).combat=null;},opts:{mechanic:{type:"rest",payload:{kind:"short",spendHitDice:1,hdRolls:[5]}}},dramatic:{required:[/binds/i,/pursuit/i]}}),
      turn("rest-4","What is my current HP?","",[],
        [{name:"post-rest HP query is local",kind:"green",test:c=>c.digest.local&&c.digest.digestBytes===0&&/hit points/i.test(c.digest.localNarration)}],
        {aiRole:"none",dramatic:{required:[]}})
    ]
  },
  {
    id:"combat", title:"Combat, concentration, and reload", seed:307, initial:()=>{const s=baseState("Combat Hold"); pc(s).sheet.concentration={spell:"Moon Veil",startedRound:1,pendingSaves:[]}; return s;},
    turns:[
      turn("combat-1","I attack the Ash Raider before it reaches the bell.","Steel and ash meet beneath the bell as the raider cuts off Sella's path.",
        [event("combat_start",{foes:[{name:"Ash Raider",hp:8,ac:12,bonus:3,damage:"1d6+1",cr:0.25}],scene:"beneath the bell"})],
        [{name:"combat starts in transient tracker",kind:"green",test:c=>!!c.after.gs.combat?.active}],
        {dramatic:{required:[/bell/i,/raider/i]}}),
      turn("combat-2","The raider's hooked blade catches me.","The hook bites through Sella's guard; Moon Veil gutters but has not yet gone out.",
        [event("hp_changed",{delta:-3,attacker:"f1"})], [
          {name:"damage persists",kind:"green",test:c=>pc(c.after).sheet.hpCur===6},
          {name:"concentration save is scripted",kind:"green",test:c=>!!c.apply.rollRequest&&c.apply.rollRequest.ability==="con"}
        ], {dramatic:{required:[/Moon Veil/i,/gutters/i]}}),
      turn("combat-3","I take a short rest.","The raider is still standing. Sella cannot turn six violent seconds into an hour's safety.",[],
        [{name:"rest is rejected mid-fight",kind:"green",test:checks.receipt(r=>!r.accepted&&r.result.reason==="combat-active")}],
        {opts:{mechanic:{type:"rest",payload:{kind:"short"}}},dramatic:{required:[/still standing/i,/safety/i]}}),
      turn("combat-4","I hold position against the surviving Ash Raider.","The raider remains in the fiction even if the browser forgot its combat card.",[],
        [{name:"reload rehydrates active combat into the digest",kind:"green",test:c=>!!c.digest.digest?.combat&&!!active(c.after).combat?.active}],
        {beforeDigest:s=>{s.gs.combat=null;},dramatic:{required:[/forgot/i,/combat card/i]}})
    ]
  },
  {
    id:"knowledge", title:"Named retrieval and hidden knowledge", seed:401, initial:()=>addKnowledge(baseState("Oath Hold")),
    turns:[
      turn("knowledge-1","I send word to Captain Fenn and ask why the old marshal died.","Captain Fenn's reply is courteous, exact, and silent on the poison.",[],
        [{name:"exact remote name survives final digest fit",kind:"green",test:c=>JSON.stringify(c.digest.digest?.codex||[]).includes("captain-fenn")&&JSON.stringify(c.digest.digest?.codex||[]).includes("poisoned")}],
        {dramatic:{required:[/courteous/i,/poison/i]}}),
      turn("knowledge-2","I ask for the Captain.","A runner pauses: in this watch, 'the Captain' is not one unambiguous person.",[],
        [{name:"ambiguous social retrieval stays bounded",kind:"green",test:c=>(c.digest.digest?.codex||[]).length<=5}],
        {dramatic:{required:[/not one/i,/ambiguous/i]}}),
      turn("knowledge-3","I compare Fenn's seal to the marshal's last letter.","The wax matches the marshal's private press; Fenn's old account can no longer stand unchanged.",
        [event("codex_update",{id:"captain-fenn",dm:{secret:"Fenn forged the poison order with the marshal's private seal."},note:"The private seal links Fenn to the order.",supersedes:true})],
        [{name:"interpreted revelation persists through codex event",kind:"green",test:checks.applied("codex_update")}],
        {aiRole:"meaning",dramatic:{required:[/private/i,/unchanged/i]}}),
      turn("knowledge-4","I confront Captain Fenn about the private seal.","For the first time, Fenn stops performing innocence and asks what silence would cost.",[],
        [{name:"later exact retrieval carries corrected meaning",kind:"green",test:c=>JSON.stringify(c.digest.digest?.codex||[]).includes("forged the poison order")}],
        {aiRole:"acting",dramatic:{required:[/innocence/i,/silence/i]}})
    ]
  },
  {
    id:"walks", title:"Suspension and resumption of parallel walks", seed:503, initial:()=>addWalks(baseState("Walk Hold")),
    turns:[
      turn("walks-1","I continue into the Bell Vault.","The Maw opens into the Bell Vault without erasing the Coffin Gallery behind Sella.",
        [event("walk_advance",{nodeId:"walk-a",toSeg:3})],
        [{name:"walk A reaches S3",kind:"green",test:c=>active(c.after).prep.nodes["walk-a"].cursor.current===3}],
        {dramatic:{required:[/Coffin Gallery/i,/behind/i]}}),
      turn("walks-2","I turn my attention to the Cinder Causeway.","The Maw waits where Sella left it while the cinder wind opens another road.",
        [event("prep_contact",{nodeId:"walk-b",enter:false})], [
          {name:"walk B becomes active",kind:"green",test:c=>active(c.after).prep.activeWalkId==="walk-b"},
          {name:"walk A suspends at S3",kind:"green",test:c=>active(c.after).prep.nodes["walk-a"].walkState==="suspended"&&active(c.after).prep.nodes["walk-a"].cursor.current===3}
        ], {dramatic:{required:[/waits/i,/cinder/i]}}),
      turn("walks-3","I return to the Shimmering Maw.","The Maw has not reset itself for Sella; the Bell Vault is still the next breath.",
        [event("prep_contact",{nodeId:"walk-a",enter:false})], [
          {name:"walk A resumes",kind:"green",test:c=>active(c.after).prep.activeWalkId==="walk-a"&&active(c.after).prep.nodes["walk-a"].walkState==="active"},
          {name:"resumed cursor remains S3",kind:"green",test:c=>active(c.after).prep.nodes["walk-a"].cursor.current===3}
        ], {dramatic:{required:[/not reset/i,/Bell Vault/i]}}),
      turn("walks-4","I resolve the bell's secret and leave the Maw behind.","The buried bell names what the Maw was built to hide; the path is finished, not forgotten.",
        [event("walk_complete",{nodeId:"walk-a"})],
        [{name:"completed walk marks cursor done",kind:"green",test:c=>active(c.after).prep.nodes["walk-a"].cursor.done===true}],
        {aiRole:"meaning",dramatic:{required:[/built to hide/i,/not forgotten/i]}})
    ]
  },
  {
    id:"failures", title:"Atomic refusals and recovery", seed:601, initial:()=>baseState("Failure Hold"),
    turns:[
      turn("failures-1","I buy the jeweled astrolabe for one hundred gold.","The merchant does not turn fifteen coins into a hundred; the astrolabe stays put.",
        [event("item_changed",{add:[{name:"Jeweled Astrolabe"}],gold:-100,note:"Purchase"})],
        [{name:"failed purchase is explicit and atomic",kind:"green",test:checks.applied("item_changed",r=>r&&!r.ok&&/^cannot-afford/.test(r.reason))},
         {name:"failed purchase adds no item",kind:"green",test:c=>!pc(c.after).sheet.inventory.some(i=>i.name==="Jeweled Astrolabe")}],
        {dramatic:{required:[/fifteen/i,/stays put/i]}}),
      turn("failures-2","I try to shoulder ten suits of plate armor.","The pile does not become portable because Sella is determined; it remains a pile.",
        [event("item_changed",{add:[{name:"Plate Armor",qty:10}],gold:0})],
        [{name:"over-capacity pickup refuses atomically",kind:"green",test:checks.applied("item_changed",r=>r&&!r.ok&&r.reason==="over-capacity")}],
        {dramatic:{required:[/not become portable/i,/pile/i]}}),
      turn("failures-3","I try to improve the attitude of a person who was never recorded.","There is no hidden relationship score to move for a person the world has never established.",
        [event("attitude_shift",{target:"missing-npc",to:"friendly",cause:"wishful thinking"})],
        [{name:"missing social target refuses loudly",kind:"green",test:checks.applied("attitude_shift",r=>r&&!r.ok&&/^no-target:/.test(r.reason))}],
        {dramatic:{required:[/never established/i]}}),
      turn("failures-4","While I recover, the Ironwood Circle advances its plan.","The Circle uses Sella's delay; one more piece of its plan clicks into place.",
        [event("clock_advanced",{clockId:"The Ironwood Circle",delta:1})], [
          {name:"valid event still applies after refusals",kind:"green",test:checks.applied("clock_advanced",r=>r&&r.ok&&!r.untracked)},
          {name:"tracked clock advances",kind:"green",test:c=>active(c.after).factions[0].clock.filled===1}
        ], {aiRole:"meaning",dramatic:{required:[/delay/i,/clicks into place/i]}})
    ]
  },
  {
    id:"identity", title:"Duplicate, late, and wrong-world responses", seed:701, initial:()=>twoWorlds(baseState("Identity Hold")),
    turns:[
      turn("identity-1","I wait while the Ironwood Circle moves.","In World A, the Circle spends the quiet hour tightening its hold.",
        [event("clock_advanced",{clockId:"The Ironwood Circle",delta:1})],
        [{name:"matching response mutates requested world",kind:"green",test:c=>c.after.U.worlds["world-a"].factions[0].clock.filled===1}],
        {dramatic:{required:[/World A/i,/tightening/i]}}),
      turn("identity-2","I wait again.","The same answer must not become two hours merely because transport delivered it twice.",
        [event("clock_advanced",{clockId:"The Ironwood Circle",delta:1})],
        [{name:"duplicate response is rejected after one application",kind:"green",test:c=>c.after.U.worlds["world-a"].factions[0].clock.filled===2&&c.apply?.responseResult?.ignored==="duplicate-response"}],
        {applyCount:2,dramatic:{required:[/delivered it twice/i]}}),
      turn("identity-3","I hold in World A while its Circle moves.","A response authored for World A must not land in World B merely because the player changed tabs.",
        [event("clock_advanced",{clockId:"The Ironwood Circle",delta:1})], [
          {name:"inactive-world response queues on its owner",kind:"green",test:c=>c.after.U.worlds["world-b"].factions[0].clock.filled===0&&c.after.U.worlds["world-a"].factions[0].clock.filled===2&&c.after.U.worlds["world-a"].dm.queuedResponse?.turnId===c.digest.turnId}
        ], {afterDigest:s=>{s.U.activeWorldId="world-b";},dramatic:{required:[/World A/i,/World B/i]}}),
      turn("identity-4","Show my known map.","",[],
        [{name:"queued response applies only when its owner reactivates",kind:"green",test:c=>c.digest.local&&c.after.U.activeWorldId==="world-a"&&c.after.U.worlds["world-a"].factions[0].clock.filled===3&&c.after.U.worlds["world-b"].factions[0].clock.filled===0&&!c.after.U.worlds["world-a"].dm.queuedResponse}],
        {beforeDigest:s=>{s.U.activeWorldId="world-a";},aiRole:"none",dramatic:{required:[]}})
    ]
  }
];

export function mutateHook(hook, state){ if(typeof hook==="function") hook(state); }
export function activeWorld(state){ return active(state); }
