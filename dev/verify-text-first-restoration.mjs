#!/usr/bin/env node
/* Text-first restoration regression: real manifest load, no Theater stub.
   Proves prep creates durable object identities, state survives JSON save/reload and projection
   re-derivation, and a contacted walk remains resumable after a later prep bundle replaces the
   session-scoped bundle. Run with JSDOM_HOME=$HOME/.genesis-jsdom when jsdom is not local. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(ROOT,p),"utf8");
const JSDOM_HOME=process.env.JSDOM_HOME||join(process.env.HOME,".genesis-jsdom");
const {JSDOM}=createRequire(join(JSDOM_HOME,"package.json"))("jsdom");
const manifest=JSON.parse(read("manifest.json"));
const src=read("tables.js")+"\n;\n"+manifest.loadOrder.filter(p=>p.endsWith(".js")).map(read).join("\n;\n");
const dom=new JSDOM("<!doctype html><html><body><div id=worldView></div><div id=toast></div></body></html>",
  {runScripts:"dangerously",url:"http://localhost/"});
const win=dom.window;
win.eval("var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;\n"+src);

let pass=0,fail=0; const failures=[];
const ok=(cond,msg)=>cond?pass++:(fail++,failures.push(msg));
const world={
  id:"w-text-first",name:"Text First",session:1,currentNodeId:"home",sessionLive:true,
  map:{nodes:{home:{id:"home",name:"Home",type:"Setting",x:0,y:0}},edges:[]},
  ledger:[],clock:{day:1,min:600},dmlog:[],dm:{},gazetteer:[],factions:[],pressures:[],
  characters:[{id:"c1",status:"living",name:"Wren",conditions:[],sheet:{level:3,hp:20,hpCur:20,mods:{},skillProfs:[]}}],
  seed:{master:{name:"Test Realm",desc:"d"},smell:{name:"s"},sound:{name:"n"},arch:{name:"a"},
    taboo:{name:"t",desc:"td"},myth:{name:"m",desc:"md"}}
};
win.U.worlds[world.id]=world; win.U.activeWorldId=world.id;

ok(win.GS.presentationMode==="story","app defaults to Story mode");
ok(win.Theater===undefined,"fixture has no Theater renderer");
win.startPrep(world);
const dungeonId=Object.keys(world.prep.nodes).find(id=>world.prep.nodes[id].env==="dungeon");
const pn=world.prep.nodes[dungeonId];
ok(!!pn.spatial&&Array.isArray(pn.interactables)&&pn.interactables.length>0,"initial prep creates Story-mode object identities before synthesis");
win.applyPrep(world,{overlays:{dungeon:{env:"dungeon",briefing:"A durable undercroft.",segments:[],newCanon:[]}}});
ok(!!pn.spatial,"dungeon prep receives a semantic spatial plan without Theater");
ok(Array.isArray(pn.interactables)&&pn.interactables.length>0,"prep creates durable interactable identities without Theater");
if(!pn.spatial||!Array.isArray(pn.interactables)){
  try{
    const walk=pn.walk;
    const plan0=win.spatializePlan(walk.segments,walk.topology,{walkId:dungeonId});
    const semantic=win.semanticizePlan(plan0,walk.segments,[]);
    const projected=win.bindWalkInteractables(semantic,walk,{walkId:dungeonId});
    console.log("diagnostic:",JSON.stringify({rooms:semantic.rooms&&semantic.rooms.length,interactables:projected.interactables&&projected.interactables.length}));
  }catch(e){ console.log("diagnostic error:",e&&e.stack||e); }
}
ok(Array.isArray(pn.interactables)&&pn.interactables.every(r=>Object.keys(r).sort().join(",")==="archetype,sourceRef,state"),"durable store is identity+state only");

win.lockOnContact(world,dungeonId);
const target=(pn.interactables||[]).find(r=>(win.dmArchetypeStates(r.archetype)||[]).length>1);
const states=target&&win.dmArchetypeStates(target.archetype);
const nextState=states&&states.find(s=>s!==target.state);
const transition=target&&nextState?win.applyEvent(world,{type:"state_transition",source:"declared",
  payload:{entityRef:target.sourceRef,to:nextState,cause:"text-first verification"}}):{ok:false};
ok(transition.ok,"a Story-only state_transition mutates the prepared object");

const saved=JSON.stringify(world);
const restored=JSON.parse(saved);
win.U.worlds[restored.id]=restored; win.U.activeWorldId=restored.id;
const restoredPn=restored.prep.nodes[dungeonId];
ok(!!target&&restoredPn.interactables.find(r=>r.sourceRef===target.sourceRef).state===nextState,"object state survives JSON save/reload");
const freshProjection=win.bindWalkInteractables(restoredPn.spatial,restoredPn.walk,{walkId:dungeonId});
win.reconcileWalkInteractableState(restoredPn,freshProjection.interactables);
ok(!!target&&freshProjection.interactables.find(r=>r.sourceRef===target.sourceRef).state===nextState,"persisted state wins on pure projection re-derivation");

const cursorBefore=JSON.stringify(restoredPn.cursor),walkBefore=JSON.stringify(restoredPn.walk);
restored.session=2; win.startPrep(restored);
ok(JSON.stringify(restored.prep.nodes[dungeonId].walk)===walkBefore,"a later session bundle does not erase the contacted walk");
ok(JSON.stringify(restored.prep.nodes[dungeonId].cursor)===cursorBefore,"a later session preserves the walk cursor");
ok(!!target&&restored.prep.nodes[dungeonId].interactables.find(r=>r.sourceRef===target.sourceRef).state===nextState,"a later session preserves object state");

console.log(`\n${fail===0?"✅ PASS":"❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ failures.forEach(m=>console.log("   ✗ "+m)); process.exit(1); }
