#!/usr/bin/env node
/* KGR-4A mutation, API, UI, real-loader, mate-solver, and browser-capture gate. */
import { createRequire } from "node:module";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import { createWorkbenchServer, validateAssetRecord, validatePackRecord, validateCalibrationDocument } from "./model-foundry/kenney-workbench-server.mjs";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const CAL=join(ROOT,"dev/model-foundry/kenney-calibration.json"),CENSUS=join(ROOT,"dev/model-foundry/kenney-census.json");
const OUT=join(ROOT,"dev/model-foundry/kenney-workbench-captures");
let pass=0,fail=0;function check(name,condition,detail=""){if(condition){pass++;console.log(`  ✓ ${name}`);}else{fail++;console.log(`  ✗ ${name}${detail?` — ${detail}`:""}`);}}
const clone=v=>JSON.parse(JSON.stringify(v));
const calibration=JSON.parse(readFileSync(CAL,"utf8")),census=JSON.parse(readFileSync(CENSUS,"utf8"));
const censusById=new Map(census.assets.map(e=>[`${e.pack}/${e.name.replace(/\.glb$/i,"")}`,e]));
const existingId="kenney-mini-dungeon/gate",existing=calibration.assets[existingId],existingEntry=censusById.get(existingId)||{pack:"kenney-mini-dungeon",name:"gate.glb",path:"assets/models/kenney-mini-dungeon/gate.glb",sha256:existing.sourceSha256,role:existing.category};
const newEntry=census.assets.find(e=>!calibration.packs[e.pack]),newId=`${newEntry.pack}/${newEntry.name.replace(/\.glb$/i,"")}`;
const newRecord={sourceSha256:newEntry.sha256,admissionClass:"PART_DONOR",category:newEntry.role||"prop",rootMaterialFamily:"stone",preTransform:{translation:[0,0,0],rotation:[0,0,0,1],scale:[1,1,1]},scaleReason:null,groundOffset:0,semanticParts:{},sockets:[],footprintOverride:null,qaStatus:"needs-review",notes:[]};
const newPack={sourceUp:"+Y",sourceForward:"+Z",canonicalScale:1,structuralGrid:null};

function request(port,method,path,body){return new Promise((resolve,reject)=>{const data=body===undefined?null:Buffer.from(JSON.stringify(body));const req=http.request({host:"127.0.0.1",port,method,path,headers:data?{"Content-Type":"application/json","Content-Length":data.length}:{}},res=>{const chunks=[];res.on("data",c=>chunks.push(c));res.on("end",()=>{const text=Buffer.concat(chunks).toString("utf8");let json=null;try{json=JSON.parse(text);}catch{}resolve({status:res.statusCode,text,json});});});req.on("error",reject);if(data)req.write(data);req.end();});}
async function listen(server){await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok);});return server.address().port;}
async function close(server){await new Promise(resolve=>server.close(resolve));}

console.log("\n=== KGR-4A full record + pack validation ===");
check("existing calibrated record fully validates",validateAssetRecord(existingId,existing,existingEntry,calibration.packs[existingEntry.pack]).length===0);
check("⊗ invalid quaternion is rejected",validateAssetRecord(existingId,{...clone(existing),preTransform:{...clone(existing.preTransform),rotation:[0,0,0,0]}},existingEntry,calibration.packs[existingEntry.pack]).some(e=>e.includes("quaternion")));
check("new nonstructural pack record validates",validatePackRecord(newPack).length===0);
check("⊗ inconsistent structural grid is rejected",validatePackRecord({...newPack,structuralGrid:{sourceModuleUnits:4,targetWorldUnits:2,orientationSteps:4,joinMode:"cell-orientation"}}).some(e=>e.includes("canonicalScale")));
const completeInventory=new Map(censusById);for(const [id,record] of Object.entries(calibration.assets))if(!completeInventory.has(id)){const[pack,slug]=id.split("/");completeInventory.set(id,{pack,name:`${slug}.glb`,sha256:record.sourceSha256});}
check("complete prospective calibration document fully validates",validateCalibrationDocument(calibration,completeInventory).length===0);

console.log("\n=== KGR-4A loopback API mutation safety ===");
const temp=mkdtempSync(join(tmpdir(),"genesis-kgr4a-")),tempCal=join(temp,"kenney-calibration.json");cpSync(CAL,tempCal);
let server=createWorkbenchServer({root:ROOT,calibrationPath:tempCal,censusPath:CENSUS}),port=await listen(server);
const before=()=>readFileSync(tempCal);
async function unchangedMutation(name,method,path,body){const bytes=before(),response=await request(port,method,path,body);check(name,response.status>=400&&response.status<500,`HTTP ${response.status}`);check(`${name} leaves manifest byte-identical`,before().equals(bytes));return response;}
await unchangedMutation("⊗ source-hash mismatch returns 4xx","PUT",`/api/calibration/${encodeURIComponent(existingId)}`,{expectedSourceSha256:"0".repeat(64),record:existing});
await unchangedMutation("⊗ unknown census id returns 4xx","PUT",`/api/calibration/${encodeURIComponent("kenney-missing/nope")}`,{expectedSourceSha256:"0".repeat(64),record:existing});
const invalidQuat={...clone(existing),preTransform:{...clone(existing.preTransform),rotation:[0,0,0,0]}};
await unchangedMutation("⊗ invalid quaternion returns 4xx","PUT",`/api/calibration/${encodeURIComponent(existingId)}`,{expectedSourceSha256:existing.sourceSha256,record:invalidQuat});
await unchangedMutation("⊗ traversal returns 4xx","PUT","/api/calibration/..%2Fescape",{expectedSourceSha256:existing.sourceSha256,record:existing});
await unchangedMutation("⊗ new-pack asset without packRecord returns 4xx","PUT",`/api/calibration/${encodeURIComponent(newId)}`,{expectedSourceSha256:newRecord.sourceSha256,record:newRecord});
await unchangedMutation("⊗ packRecord on existing pack returns 4xx","PUT",`/api/calibration/${encodeURIComponent(existingId)}`,{expectedSourceSha256:existing.sourceSha256,record:existing,packRecord:newPack});
await unchangedMutation("⊗ fields beyond one pack+asset return 4xx","PUT",`/api/calibration/${encodeURIComponent(existingId)}`,{expectedSourceSha256:existing.sourceSha256,record:existing,secondAsset:{escape:true}});

const valid=clone(existing);valid.notes=[...valid.notes,"KGR-4A restart receipt"];
const priorDoc=JSON.parse(before()),save=await request(port,"PUT",`/api/calibration/${encodeURIComponent(existingId)}`,{expectedSourceSha256:existing.sourceSha256,record:valid});
const savedDoc=JSON.parse(before());
check("valid PUT succeeds",save.status===200,save.text);
check("valid PUT changes exactly one asset record",Object.keys(priorDoc.assets).every(id=>id===existingId||JSON.stringify(priorDoc.assets[id])===JSON.stringify(savedDoc.assets[id]))&&JSON.stringify(priorDoc.packs)===JSON.stringify(savedDoc.packs));
await close(server);server=createWorkbenchServer({root:ROOT,calibrationPath:tempCal,censusPath:CENSUS});port=await listen(server);
const restarted=await request(port,"GET","/api/calibration");check("one-record save survives server restart",restarted.status===200&&restarted.json.assets[existingId].notes.at(-1)==="KGR-4A restart receipt");
const beforeNew=clone(restarted.json),newSave=await request(port,"PUT",`/api/calibration/${encodeURIComponent(newId)}`,{expectedSourceSha256:newRecord.sourceSha256,record:newRecord,packRecord:newPack}),afterNew=JSON.parse(before());
check("new census asset + required packRecord save succeeds atomically",newSave.status===200&&newSave.json.packAdded===true,newSave.text);
check("new-pack transaction adds exactly one pack and one asset",Object.keys(afterNew.packs).length===Object.keys(beforeNew.packs).length+1&&Object.keys(afterNew.assets).length===Object.keys(beforeNew.assets).length+1&&Object.keys(beforeNew.packs).every(k=>JSON.stringify(beforeNew.packs[k])===JSON.stringify(afterNew.packs[k]))&&Object.keys(beforeNew.assets).every(k=>JSON.stringify(beforeNew.assets[k])===JSON.stringify(afterNew.assets[k])));
const invalidCal=join(temp,"invalid-unrelated-calibration.json"),invalidDoc=clone(calibration);invalidDoc.assets["kenney-mini-dungeon/floor"].preTransform.rotation=[0,0,0,0];writeFileSync(invalidCal,JSON.stringify(invalidDoc,null,2)+"\n");const invalidBytes=readFileSync(invalidCal);const invalidServer=createWorkbenchServer({root:ROOT,calibrationPath:invalidCal,censusPath:CENSUS}),invalidPort=await listen(invalidServer);const blockedByUnrelated=await request(invalidPort,"PUT",`/api/calibration/${encodeURIComponent(existingId)}`,{expectedSourceSha256:existing.sourceSha256,record:existing});check("⊗ unrelated invalid existing record makes prospective PUT return 422",blockedByUnrelated.status===422&&blockedByUnrelated.json.errors.some(error=>error.includes("kenney-mini-dungeon/floor")&&error.includes("quaternion")),blockedByUnrelated.text);check("⊗ unrelated-invalid prospective PUT leaves manifest byte-identical",readFileSync(invalidCal).equals(invalidBytes));await close(invalidServer);

console.log("\n=== KGR-4A UI and loader contract ===");
const html=readFileSync(join(ROOT,"dev/model-foundry/kenney-workbench.html"),"utf8"),js=readFileSync(join(ROOT,"dev/model-foundry/kenney-workbench.js"),"utf8"),serverSource=readFileSync(join(ROOT,"dev/model-foundry/kenney-workbench-server.mjs"),"utf8");
for(const token of ["assetSearch","assetFilter","qaFilter","raw","normalized","genesis","axes","module","ground","wireframe","backface","normals","aabb","footprint","hierarchy","orientationIndex","admissionClass","groundOffset","footprintOverrideEnabled","socketList","snapMode","hostSocket","childAsset","exploded","doorSweep","dirty","Reset Asset","Save Asset","Export Snapshot","packPanel"])check(`required UI token: ${token}`,html.includes(token));
check("Genesis-material mode imports the real donor loader",js.includes('import { loadDonorPiece } from "/src/ui/theater-donor.js"')&&js.includes("await loadDonorPiece("));
check("raw and normalized modes select distinct GLB URLs",js.includes("rawUrl(currentCensus())")&&js.includes("normalizedUrl()"));
check("only the three locked API route families exist",[...serverSource.matchAll(/url\.pathname\s*(?:===|\.startsWith\()\s*["`]([^"`]+)/g)].map(m=>m[1]).filter(v=>v.startsWith("/api/")&&v!=="/api/").sort().join("|")==="/api/calibration|/api/calibration/|/api/validate");

console.log("\n=== KGR-4A browser overlay, toggle, mate, and console gate ===");
mkdirSync(OUT,{recursive:true});const report={schema:"genesis.kenney-workbench-capture.v1",assetId:existingId,viewUrls:{},overlays:{},mate:{},consoleErrors:[]};
let puppeteer=null;try{const require=createRequire(join(process.env.HOME,".genesis-jsdom","package.json"));puppeteer=require("puppeteer-core");}catch{}
const chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if(!puppeteer){check("Puppeteer available for required visual gate",false,"puppeteer-core missing");}
else{
  const browser=await puppeteer.launch({executablePath:chrome,headless:"new",args:["--use-angle=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--no-sandbox","--disable-gpu-sandbox"],defaultViewport:{width:1440,height:960,deviceScaleFactor:1}});
  const page=await browser.newPage();page.on("console",message=>{if(message.type()==="error")report.consoleErrors.push(message.text());});page.on("pageerror",error=>report.consoleErrors.push(error.message));
  try{
    await page.goto(`http://127.0.0.1:${port}/dev/model-foundry/kenney-workbench.html`,{waitUntil:"networkidle0",timeout:30000});await page.waitForFunction(()=>window.__kenneyWorkbenchReady===true,{timeout:30000});
    for(const view of ["raw","normalized","genesis"]){await page.click(`[data-view="${view}"]`);await page.waitForFunction(v=>window.__kenneyWorkbench.state.view===v&&document.querySelector("#saveStatus").textContent!="loading " + v + "…",{},view);report.viewUrls[view]=await page.$eval("#loadedUrl",el=>el.textContent);}
    report.overlays=await page.evaluate(()=>({axes:window.__kenneyWorkbench.scene.getObjectByName("overlay-axes")?.visible,ground:window.__kenneyWorkbench.scene.getObjectByName("overlay-ground-plane")?.visible,module:window.__kenneyWorkbench.scene.getObjectByName("overlay-module-grid")?.visible,sockets:window.__kenneyWorkbench.scene.getObjectByName("socket-overlays")?.children.length,canvas:{width:document.querySelector("#viewCanvas").clientWidth,height:document.querySelector("#viewCanvas").clientHeight}}));report.materialDiagnostic=await page.$eval("#errors",el=>el.textContent);report.rotatedBounds=await page.evaluate(()=>window.__kenneyWorkbench.rotatedBoundsControl());
    await page.click("#snapMate");try{await page.waitForFunction(()=>document.querySelector("#mateError").dataset.positionError!==undefined,{timeout:20000});}catch{}report.mate=await page.evaluate(()=>{const el=document.querySelector("#mateError");return{position:Number(el.dataset.positionError),angleDeg:Number(el.dataset.angularError),text:el.textContent,error:document.querySelector("#errors").textContent,child:document.querySelector("#childAsset").value,childSocketCount:document.querySelector("#childSocket").options.length};});
    await page.screenshot({path:join(OUT,"workbench-overlays.png")});
    check("raw/normalized toggle changes the loaded URL",new Set([report.viewUrls.raw,report.viewUrls.normalized]).size===2,JSON.stringify(report.viewUrls));
    check("Genesis-material view passes through real loadDonorPiece",report.viewUrls.genesis.startsWith("loadDonorPiece("),report.viewUrls.genesis);
    check("visible axes, ground, module, and socket overlays exist",report.overlays.axes&&report.overlays.ground&&report.overlays.module&&report.overlays.sockets>0,JSON.stringify(report.overlays));
    check("absent raw colormap fallback is explicit in capture diagnostics",report.materialDiagnostic.includes("RAW MATERIAL UNAVAILABLE")&&report.materialDiagnostic.includes("Textures/colormap.png"),report.materialDiagnostic);
    check("rotated fixture local bounds preserve geometry dimensions",report.rotatedBounds.proper.every((value,index)=>Math.abs(value-[4,2,1][index])<1e-9),JSON.stringify(report.rotatedBounds));
    check("⊗ transformed-world min/max shortcut fails rotated local-bounds control",report.rotatedBounds.mutated.some((value,index)=>Math.abs(value-report.rotatedBounds.proper[index])>.1),JSON.stringify(report.rotatedBounds));
    check("Snap mate positional error <= 0.005u",Number.isFinite(report.mate.position)&&report.mate.position<=.005,JSON.stringify(report.mate));check("Snap mate angular error <= 0.5 degrees",Number.isFinite(report.mate.angleDeg)&&report.mate.angleDeg<=.5,JSON.stringify(report.mate));
    check("Puppeteer capture has zero console errors",report.consoleErrors.length===0,report.consoleErrors.join(" | "));
  }finally{await browser.close();}
}
writeFileSync(join(OUT,"workbench-report.json"),JSON.stringify(report,null,2)+"\n");await close(server);rmSync(temp,{recursive:true,force:true});
console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);
