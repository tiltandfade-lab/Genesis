#!/usr/bin/env node
/* Deterministic in-engine Fantasy prop pilot. Candidate geometry is mounted through the capture-only
   Theater seam; runtime registries remain untouched and runtimeAdmittedCount must stay zero. */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require=createRequire(import.meta.url);
const puppeteer=require(path.join(process.env.HOME,".genesis-jsdom","node_modules","puppeteer-core"));
const here=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(here,"..","..");
const out=path.join(here,"fantasy-room-pilot"); fs.mkdirSync(out,{recursive:true});
const ports=[5391,5392,5393,5394,5395], chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const used=p=>new Promise(resolve=>{const s=net.connect({host:"127.0.0.1",port:p},()=>{s.destroy();resolve(true)});s.on("error",()=>resolve(false));s.setTimeout(500,()=>{s.destroy();resolve(false)})});
async function server(){for(const p of ports){if(await used(p))continue;const proc=spawn("python3",["-m","http.server",String(p),"--bind","127.0.0.1"],{cwd:root,stdio:"ignore"});for(let i=0;i<40;i++){if(await used(p))return{proc,base:`http://127.0.0.1:${p}`};await sleep(125)}proc.kill()}throw Error("no capture port")}

async function boot(page){return page.evaluate(()=>{try{
  startBardo(); if(typeof bardoBegin==="function")bardoBegin();
  function fill(s){if(!s)return;if(s.t==="choose"&&!GS.CGEN[s.field]){const src=s.field==="species"?SPECIES:s.field==="class"?CLASSES:BACKGROUNDS;cgChoose(s.field,Object.keys(src)[0])}
    else if(s.t==="scores"){while(GS.CGEN.scoreRolls.length<6)bardoRollScore();if(!GS.CGEN.assigned)bardoAssign("best")}
    else if(s.t==="skills"&&typeof cgSkillAuto==="function")cgSkillAuto();else if(s.t==="equipment"&&typeof cgKitAuto==="function")cgKitAuto();
    else if(s.t==="tools"&&typeof cgToolsAuto==="function")cgToolsAuto();else if(s.t==="languages"&&typeof cgLangAuto==="function")cgLangAuto();
    else if(s.t==="spells"&&typeof cgSpellsAuto==="function")cgSpellsAuto();else if(s.t==="feat"&&typeof cgFeatAuto==="function")cgFeatAuto();
    else if(s.t==="life"&&GS.CGEN.lifeQ&&!GS.CGEN.lifeLog[GS.CGEN.lifeI])bardoLifeRoll();
    else if(s.t==="hometown"&&!GS.BARDO.rolled[s.key])bardoRollHometown();else if(s.t==="world"&&!GS.BARDO.rolled[s.key])bardoRollWorld()}
  let guard=0;while(GS.BARDO.i<GS.BARDO.seq.length-1&&guard++<GS.BARDO.seq.length+12){const s=GS.BARDO.seq[GS.BARDO.i];fill(s);if(s&&s.t==="life"&&GS.CGEN.lifeQ){let n=0;while(GS.CGEN.lifeI<GS.CGEN.lifeQ.length-1&&n++<40){fill(s);bardoLifeStepNext()}fill(s);bardoLifeStepNext()}bardoAdvance()}
  const name=document.getElementById("charName");if(name)name.value="Fantasy Prop Pilot";if(typeof bardoWake==="function")bardoWake();else bardoFound();
  const w=activeWorld();startSession(w.id);showTab("world");return{ok:true}
}catch(e){return{ok:false,error:e.message,stack:e.stack}}})}

async function waitTheater(page){for(let i=0;i<70;i++){const ok=await page.evaluate(()=>!!(window.Theater&&Theater.setInteriorBoard&&Theater._mountFantasyPropPilotForTest&&GS.theaterMounted));if(ok)return;await page.evaluate(()=>{try{renderWorld()}catch(e){}});await sleep(250)}throw Error("theater not ready")}

async function build(page){return page.evaluate(()=>{
  const walk=[{id:"fantasy-threshold",num:1,label:"Banded Oak Threshold",isFinale:false,depth:0,exits:[],light:"normal",fixture:"door / lever / trap / container"}];
  const plan=spatializePlan(walk,"Fantasy Walk Prop Pilot",{walkId:"fantasy-prop-pilot-table-backed"});
  const room=plan.rooms[0], board=interiorBuildBoard(plan,{realmId:"fantasy",env:"dungeon",focusSegNum:room.segNum,radius:1});
  const cx=room.x+Math.floor(room.w/2),cz=room.y+Math.floor(room.d/2);
  board.pieces=[];board.dressing=[];board.wallProps=[];board.furniture=[];board.cameraFit={mode:"room"};
  board.lights=[{x:cx+2.7,z:cz-1.7,y:2.2,color:"#ffad55",intensity:1.35,distance:7,decay:2,kind:"torch",roomSegNum:room.segNum,fixtureId:"sconce-iron",mount:"wall",emitterLocal:{x:0,y:0.05,z:0.16}}];
  return{board,provenance:{walkId:"fantasy-prop-pilot-table-backed",realm:"fantasy",roomLabel:walk[0].label,tableRefs:["Engine/02. _Procedures/Dungeon Encounter v2.0.md","src/engine/place-dressing.js#fantasy"]}}
})}

async function main(){const srv=await server();let browser;const report={schema:"genesis.fantasy-prop-room-pilot.v1",technicalStatus:"UNTESTED",visualStatus:"PENDING_HUMAN_REVIEW",runtimeAdmittedCount:0};try{
  browser=await puppeteer.launch({executablePath:chrome,headless:"new",args:["--headless=new","--no-sandbox","--disable-gpu-sandbox","--use-gl=angle","--enable-webgl","--ignore-gpu-blocklist","--window-size=1600,1000"],defaultViewport:{width:1600,height:1000,deviceScaleFactor:1}});
  const page=await browser.newPage(),errors=[];
  await page.evaluateOnNewDocument(()=>{let s=0x51f15e1d;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}});
  page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});page.on("pageerror",e=>errors.push(e.message));
  await page.goto(`${srv.base}/genesis.html`,{waitUntil:"networkidle0",timeout:30000});await page.addStyleTag({content:"#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none!important}"});
  const b=await boot(page);if(!b.ok)throw Error(JSON.stringify(b));await waitTheater(page);const built=await build(page);
  await page.evaluate(board=>Theater.setInteriorBoard(board),built.board);await page.waitForFunction(()=>!Theater.tweensLive||Theater.tweensLive()===0,{timeout:15000});
  const mounted=await page.evaluate(()=>Theater._mountFantasyPropPilotForTest({}));if(!mounted.ok)throw Error(JSON.stringify(mounted));
  await page.evaluate(()=>{Theater._freezeFantasyPropPilotLightForTest();Theater._setInteriorCameraPoseForTest({x:6.8,y:7.2,z:8.4},{x:0,y:0.75,z:-0.35},1.05);Theater._fantasyPropPilotCutawayForTest()});await sleep(600);
  const diag=await page.evaluate(()=>({glowCount:Theater.interiorLightGlowCount(),emitters:Theater._interiorFixtureEmittersForTest(),inventory:Theater._graphicsResearchInventoryForTest(),camera:Theater._interiorCameraPositionForTest()}));
  if(mounted.runtimeAdmittedCount!==0)throw Error("runtime admission invariant violated");if(diag.glowCount!==0)throw Error("floating glow disc active");
  const image=path.join(out,"fantasy-walk-room.png");await page.screenshot({path:image});
  report.technicalStatus="COMPILED_AND_MOUNTED";report.capture=image;report.provenance=built.provenance;report.candidates=mounted.mounted;report.diagnostics=diag;report.consoleErrors=errors;report.runtimeAdmittedCount=0;
  fs.writeFileSync(path.join(out,"report.json"),JSON.stringify(report,null,2)+"\n");console.log(JSON.stringify({capture:image,technicalStatus:report.technicalStatus,visualStatus:report.visualStatus,runtimeAdmittedCount:0,candidates:mounted.mounted.length,glowCount:diag.glowCount,consoleErrors:errors.length},null,2));
}finally{if(browser)await browser.close();if(srv.proc)srv.proc.kill("SIGTERM")}}
main().catch(e=>{console.error(e);process.exitCode=1});
