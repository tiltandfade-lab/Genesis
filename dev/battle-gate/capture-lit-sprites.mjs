#!/usr/bin/env node
/* dev/battle-gate/capture-lit-sprites.mjs — BW2-4b CITIZENSHIP iterate-loop instrument (TASTE seat).
   THE BRIGHTNESS LAW measured proof: mounts a controlled interior room per realm, stands the SAME
   creature slug on a torch-pool cell and in the farthest dark corner, renders LIT and (via the debug
   seam) full-bright UNLIT, samples the rendered canvas pixels over each sprite's own projected rect,
   and reports rendered-luminance-as-a-ratio-of-full-bright. Gates (Adam's addendum):
     dark corner  <= 0.40 of full-bright   ·   torch pool ~0.60-0.85   ·   max across all sprites < 0.90
   Saves the lit room frame to dev/battle-gate/citizenship/round-<N>-<realm>.png and writes measures.json.
   Reuses capture-dungeon-loop.mjs's server/Chrome/boot conventions.
   Run:  node dev/battle-gate/capture-lit-sprites.mjs [roundLabel]   (roundLabel defaults to "r") */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(__dirname, "citizenship");
fs.mkdirSync(outDir, { recursive: true });
const ROUND = process.argv[2] || "r";

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5216, 5217, 5218, 5219, 5220];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const log = (...a) => console.log("[lit-sprites]", ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function portInUse(port){ return new Promise((res)=>{ const s=net.connect({host:"127.0.0.1",port},()=>{s.destroy();res(true);}); s.on("error",()=>res(false)); s.setTimeout(600,()=>{s.destroy();res(false);}); }); }
async function probeRoot(port){ try{ const r=await fetch(`http://127.0.0.1:${port}/genesis.html`,{cache:"no-store"}); if(!r.ok) return false; const b=await r.text(); return b.includes("Genesis"); }catch(e){ return false; } }
async function startServer(){
  for(const port of PORT_CANDIDATES){
    if(await portInUse(port)){ if(await probeRoot(port)){ BASE=`http://127.0.0.1:${port}`; return {proc:null,port}; } continue; }
    const proc=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{cwd:repoRoot,stdio:["ignore","ignore","ignore"]});
    for(let i=0;i<40;i++){ if(await portInUse(port)){ if(await probeRoot(port)){ BASE=`http://127.0.0.1:${port}`; return {proc,port}; } break; } await sleep(150); }
    try{ proc.kill("SIGTERM"); }catch(e){}
  }
  throw new Error("no usable port");
}
const SHOT_W=1600, SHOT_H=1200;
async function launchChrome(){
  const args=["--headless=new","--no-sandbox","--disable-gpu-sandbox","--use-gl=angle","--enable-webgl","--ignore-gpu-blocklist",`--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({executablePath:CHROME,headless:"new",args,defaultViewport:{width:SHOT_W,height:SHOT_H,deviceScaleFactor:1}});
}

// bootToInSession — verbatim from capture-dungeon-loop.mjs (see its header).
async function bootToInSession(page){
  return await page.evaluate(()=>{
    const notes=[];
    try{
      if(typeof startBardo!=="function") return {ok:false,stage:"startBardo-missing"};
      startBardo(); if(typeof bardoBegin==="function") bardoBegin();
      function autoFillStep(step){ if(!step) return; try{
        if(step.t==="choose"){ if(!GS.CGEN[step.field]){ const src=step.field==="species"?SPECIES:step.field==="class"?CLASSES:BACKGROUNDS; const k=Object.keys(src||{})[0]; if(k) cgChoose(step.field,k); } }
        else if(step.t==="scores"){ while(GS.CGEN.scoreRolls.length<6) bardoRollScore(); if(!GS.CGEN.assigned) bardoAssign("best"); }
        else if(step.t==="skills"){ if(typeof cgSkillAuto==="function") cgSkillAuto(); }
        else if(step.t==="equipment"){ if(typeof cgKitAuto==="function") cgKitAuto(); }
        else if(step.t==="tools"){ if(typeof cgToolsAuto==="function") cgToolsAuto(); }
        else if(step.t==="languages"){ if(typeof cgLangAuto==="function") cgLangAuto(); }
        else if(step.t==="spells"){ if(typeof cgSpellsAuto==="function") cgSpellsAuto(); }
        else if(step.t==="feat"){ if(typeof cgFeatAuto==="function") cgFeatAuto(); }
        else if(step.t==="life"){ if(GS.CGEN.lifeQ&&!GS.CGEN.lifeLog[GS.CGEN.lifeI]&&typeof bardoLifeRoll==="function") bardoLifeRoll(); }
        else if(step.t==="hometown"){ if(!GS.BARDO.rolled[step.key]&&typeof bardoRollHometown==="function") bardoRollHometown(); }
        else if(step.t==="world"){ if(!GS.BARDO.rolled[step.key]&&typeof bardoRollWorld==="function") bardoRollWorld(); }
      }catch(e){ notes.push("autoFillStep threw: "+e.message); } }
      const seq=GS.BARDO.seq; let guard=0; const MAX=seq.length+10;
      while(GS.BARDO&&GS.BARDO.i<seq.length-1&&guard<MAX){ const step=seq[GS.BARDO.i]; autoFillStep(step);
        if(step&&step.t==="life"&&GS.CGEN.lifeQ){ let lg=0; while(GS.CGEN.lifeI<GS.CGEN.lifeQ.length-1&&lg<40){ autoFillStep(step); if(typeof bardoLifeStepNext==="function") bardoLifeStepNext(); lg++; } autoFillStep(step); if(typeof bardoLifeStepNext==="function") bardoLifeStepNext(); }
        bardoAdvance(); guard++; }
      const nameEl=document.getElementById("charName"); if(nameEl) nameEl.value="Lit Sprite Gate Soul";
      if(typeof bardoWake==="function") bardoWake(); else if(typeof bardoFound==="function") bardoFound();
      const world=(typeof activeWorld==="function")?activeWorld():null;
      if(!world) return {ok:false,stage:"no-world",notes};
      if(typeof startSession==="function") startSession(world.id);
      showTab("world");
      return {ok:true,worldId:world.id};
    }catch(e){ return {ok:false,stage:"exception",error:e.message,notes}; }
  });
}
async function waitForTheater(page){
  const deadline=Date.now()+20000; let state=null;
  while(Date.now()<deadline){
    state=await page.evaluate(()=>{ const host=document.getElementById("worldView"); return {
      hasBattleStage:!!(host&&host.querySelector(".game.battle-stage")), theaterMounted:!!(typeof GS!=="undefined"&&GS.theaterMounted),
      hasCanvas:!!(host&&host.querySelector(".theater-stage-canvas canvas")), hasSet:!!(window.Theater&&typeof window.Theater.setInteriorBoard==="function"),
      hasRects:!!(window.Theater&&typeof window.Theater.__spriteScreenRects==="function") }; });
    if(state.hasBattleStage&&state.theaterMounted&&state.hasCanvas&&state.hasSet&&state.hasRects) return state;
    await page.evaluate(()=>{ try{ renderWorld(); }catch(e){} });
    await sleep(300);
  }
  return state;
}
async function shootCanvas(page, outPath){
  const canvasEl=await page.$(".theater-stage-canvas canvas");
  if(!canvasEl){ await page.screenshot({path:outPath}); return; }
  const box=await canvasEl.boundingBox();
  const fullB64=await page.screenshot({encoding:"base64"});
  if(!box){ fs.writeFileSync(outPath,Buffer.from(fullB64,"base64")); return; }
  const cropped=await page.evaluate(({fullB64,box})=>new Promise((resolve)=>{ const im=new Image(); im.onload=()=>{ const c=document.createElement("canvas"); c.width=Math.round(box.width); c.height=Math.round(box.height); const x=c.getContext("2d"); x.drawImage(im,box.x,box.y,box.width,box.height,0,0,box.width,box.height); resolve(c.toDataURL("image/png").split(",")[1]); }; im.onerror=()=>resolve(fullB64); im.src="data:image/png;base64,"+fullB64; }),{fullB64,box});
  fs.writeFileSync(outPath,Buffer.from(cropped,"base64"));
}

// build a controlled room for a realm and return {board, torchCell, darkCell} — a real rolled walk,
// then two identical creature standees placed on a torch pool cell + the farthest dark corner.
const PROBE_SLUG = { gloom:"Skeleton", chrome:"Guard", fantasy:"Guard" };
async function buildRealmRoom(page, realm, seedI){
  return await page.evaluate((realm, seedI)=>{
    const out={ok:false,stage:"start"};
    try{
      const world=activeWorld(); GS.combat=null;
      const walk=rollDungeonWalk({segCount:6,tier:1});
      const nodeId=addNode(world,"Lit "+realm,"Dungeon");
      const P=prepOf(world); P.bundle=P.bundle||{environments:[]};
      const idx=P.bundle.environments.length;
      P.bundle.environments.push({kind:"dungeon",walk,hook:{leadsTo:null},cast:null});
      P.nodes[nodeId]={env:"dungeon",idx,soft:true,locked:false,hook:null};
      walkSetActive(world,nodeId);
      applyEvent(world,{type:"prep_applied",payload:{overlays:{dungeon:{briefing:"lit",segments:[]}}}});
      const pn=prepOf(world).nodes[nodeId];
      if(!pn||!pn.spatial) return Object.assign(out,{stage:"no-spatial"});
      const byDepth=walk.segments.slice().sort((a,b)=>a.depth-b.depth);
      const targetSeg=byDepth[Math.floor(byDepth.length/2)]||byDepth[byDepth.length-1];
      applyEvent(world,{type:"walk_advance",payload:{toSeg:targetSeg.num,nodeId}});
      const room=spatialRoomForSeg(pn,pn.cursor.current);
      if(!room) return Object.assign(out,{stage:"no-room"});
      const board=trayFrom({kind:"interior",plan:pn.spatial,focusSegNum:pn.cursor.current,radius:1,env:walk.environment,realms:[realm]},null,{});
      if(!board||board.kind!=="interior3d") return Object.assign(out,{stage:"bad-board",kind:board&&board.kind});
      const lights=board.lights||[];
      // torch cell: the floor cell adjacent to lights[0] (or room center if no lights)
      const inRoom=(x,y)=>x>=room.x+1&&x<=room.x+room.w-2&&y>=room.y+1&&y<=room.y+room.d-2;
      // torch probe: ~3 cells from lights[0] TOWARD room center — a realistic IN-POOL standee position
      // (a foe stands in the pool, not 1 cell from the flame; the loop gate huddles foes at room center
      // and torches sit on the walls, so 3 cells is representative). Not on the flame (that clips).
      const rcx=room.x+Math.floor(room.w/2), rcy=room.y+Math.floor(room.d/2);
      let torch=null;
      if(lights.length){ const l=lights[0]; const lx=Math.round(l.x), ly=Math.round(l.z);
        const vx=rcx-lx, vy=rcy-ly, vlen=Math.hypot(vx,vy)||1;
        for(const step of [3,2,4,1]){ const c={x:Math.round(lx+vx/vlen*step), y:Math.round(ly+vy/vlen*step)}; if(inRoom(c.x,c.y)){ torch=c; break; } } }
      if(!torch){ torch={x:rcx,y:rcy}; }
      // dark cell: room interior cell maximizing min-distance to every light
      let dark=null,bestD=-1;
      for(let y=room.y+1;y<=room.y+room.d-2;y++){ for(let x=room.x+1;x<=room.x+room.w-2;x++){
        let md=1e9; (lights.length?lights:[{x:torch.x,z:torch.y}]).forEach(l=>{ const d=Math.hypot(x-(l.x||0),y-(l.z||0)); if(d<md) md=d; });
        if(md>bestD){ bestD=md; dark={x,y}; } } }
      if(!dark) dark={x:room.x+1,y:room.y+1};
      const slug=({gloom:"Skeleton",chrome:"Guard",fantasy:"Guard"})[realm]||"Guard";
      board.pieces=[{slug,fid:"probe-torch",cellX:torch.x,cellY:torch.y},{slug,fid:"probe-dark",cellX:dark.x,cellY:dark.y}];
      board.cameraFit={mode:"beat",cells:[{x:torch.x,y:torch.y},{x:dark.x,y:dark.y}]};
      out.ok=true; out.torch=torch; out.dark=dark; out.lightCount=lights.length; out.nodeId=nodeId;
      window.__litBoard=board; // stash for re-mount (lit/unlit)
      return out;
    }catch(e){ return Object.assign(out,{stage:"exception",error:e.message,stack:e.stack}); }
  }, realm, seedI);
}
async function mountBoard(page, unlit){
  return await page.evaluate((unlit)=>{
    window.Theater.__setSpriteUnlitDebug(unlit);
    const b=Object.assign({},window.__litBoard,{__v:unlit?"u":"l"}); // bust the dirty-key so it rebuilds
    window.Theater.setInteriorBoard(b);
    return { requested: window.Theater.interiorPiecesRequested(), resolved: window.Theater.interiorPiecesResolved() };
  }, unlit);
}
async function pollResolved(page){
  const deadline=Date.now()+4000;
  while(Date.now()<deadline){ const r=await page.evaluate(()=>({r:window.Theater.interiorPiecesResolved(),q:window.Theater.interiorPiecesRequested(),t:window.Theater.interiorFileTexPending()})); if(r.r>=r.q&&r.t===0) return r; await sleep(200); }
  return await page.evaluate(()=>({r:window.Theater.interiorPiecesResolved(),q:window.Theater.interiorPiecesRequested()}));
}
// The WebGL context is preserveDrawingBuffer:false — an in-page drawImage(glCanvas) reads BLACK a tick
// after render. So we sample the COMPOSITED puppeteer screenshot instead (which is what the eye sees).
// Capture rects (draw-buffer px) once + the canvas box (CSS/page px), then decode both screenshots
// in-page and sample at box-offset, box-scaled positions.
async function captureRects(page){
  const canvasEl=await page.$(".theater-stage-canvas canvas");
  const box=await canvasEl.boundingBox();
  const info=await page.evaluate(()=>{ const glc=document.querySelector(".theater-stage-canvas canvas"); return {cw:glc.width, ch:glc.height}; });
  const rects=await page.evaluate(()=>window.Theater.__spriteScreenRects());
  return {box, rects, cw:info.cw, ch:info.ch};
}
async function measureFromShots(page, litB64, unlitB64, cap){
  return await page.evaluate(({litB64, unlitB64, cap})=>new Promise((resolve)=>{
    const decode=(b64)=>new Promise((res)=>{ const im=new Image(); im.onload=()=>{ const c=document.createElement("canvas"); c.width=im.width; c.height=im.height; const x=c.getContext("2d"); x.drawImage(im,0,0); res({data:x.getImageData(0,0,c.width,c.height).data,w:c.width,h:c.height}); }; im.src="data:image/png;base64,"+b64; });
    Promise.all([decode(litB64),decode(unlitB64)]).then(([lit,unlit])=>{
      const lum=(d,i)=>0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];
      const sx=cap.box.width/cap.cw, sy=cap.box.height/cap.ch; // draw-buffer px -> page px
      function sample(r){
        const cx=cap.box.x + r.cx*sx, cy=cap.box.y + r.cy*sy, w=r.w*sx, h=r.h*sy;
        const W=unlit.w, H=unlit.h;
        const x0=Math.max(0,Math.round(cx-w/2)), x1=Math.min(W-1,Math.round(cx+w/2));
        const y0=Math.max(0,Math.round(cy-h/2)), y1=Math.min(H-1,Math.round(cy+h/2));
        let sL=0,sU=0,n=0;
        for(let y=y0;y<=y1;y++){ for(let x=x0;x<=x1;x++){ const i=(y*W+x)*4;
          const u=lum(unlit.data,i); if(u<40) continue; sU+=u; sL+=lum(lit.data,i); n++; } }
        return n>0?{n,meanUnlit:+(sU/n).toFixed(1),meanLit:+(sL/n).toFixed(1),ratio:(sL/n)/(sU/n)}:{n:0};
      }
      resolve(cap.rects.map((r,idx)=>Object.assign({idx,slug:r.slug,rect:{cx:Math.round(r.cx),cy:Math.round(r.cy),w:Math.round(r.w),h:Math.round(r.h)}}, sample(r))));
    });
  }),{litB64, unlitB64, cap});
}

async function main(){
  // kill stale servers in our range handled by caller; here just start.
  const server=await startServer();
  const results={round:ROUND,generatedAt:new Date().toISOString(),realms:[]};
  let browser=null;
  try{
    browser=await launchChrome();
    const page=await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request",(req)=>{ if(req.url().endsWith("/favicon.ico")) req.respond({status:200,contentType:"image/gif",body:Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7","base64")}); else req.continue(); });
    await page.goto(`${BASE}/genesis.html`,{waitUntil:"networkidle0",timeout:30000});
    await sleep(300);
    await page.addStyleTag({content:"#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none!important}"});
    const boot=await bootToInSession(page); if(!boot.ok) throw new Error("boot "+JSON.stringify(boot));
    const ts=await waitForTheater(page); if(!ts||!ts.hasRects) throw new Error("theater "+JSON.stringify(ts));

    for(const realm of ["gloom","chrome","fantasy"]){
      const room=await buildRealmRoom(page, realm, 0);
      if(!room.ok){ log(realm,"room build failed",room.stage); results.realms.push({realm,error:room.stage,detail:room}); continue; }
      // LIT
      await mountBoard(page, false); await pollResolved(page); await sleep(500);
      const litShot=path.join(outDir,`round-${ROUND}-${realm}.png`);
      await shootCanvas(page, litShot);
      const cap=await captureRects(page); // rects + canvas box (sprite positions identical across mounts)
      const litB64=await page.screenshot({encoding:"base64"});
      // UNLIT reference (same board, forced full-bright)
      await mountBoard(page, true); await pollResolved(page); await sleep(400);
      const unlitB64=await page.screenshot({encoding:"base64"});
      const m=await measureFromShots(page, litB64, unlitB64, cap);
      // restore lit for any subsequent realm
      await page.evaluate(()=>window.Theater.__setSpriteUnlitDebug(false));
      // sprite idx 0 = torch probe, idx 1 = dark probe (piece order preserved by interiorBuildPieces)
      const torch=m[0]||{}, dark=m[1]||{};
      const maxRatio=Math.max(...m.map(s=>s.ratio||0));
      log(`${realm}: torch ratio=${(torch.ratio||0).toFixed(3)} (n=${torch.n}) · dark ratio=${(dark.ratio||0).toFixed(3)} (n=${dark.n}) · maxRatio=${maxRatio.toFixed(3)} · lights=${room.lightCount}`);
      results.realms.push({realm,torchCell:room.torch,darkCell:room.dark,lightCount:room.lightCount,samples:m,torchRatio:torch.ratio,darkRatio:dark.ratio,maxRatio,shot:path.basename(litShot)});
    }
    fs.writeFileSync(path.join(outDir,`measures-${ROUND}.json`),JSON.stringify(results,null,2));
    log("wrote",path.join(outDir,`measures-${ROUND}.json`));
    // gate summary
    let pass=true;
    results.realms.forEach(r=>{ if(r.error){ pass=false; return; }
      if(!(r.darkRatio<=0.40)){ log(`GATE FAIL ${r.realm}: dark ratio ${r.darkRatio?.toFixed(3)} > 0.40`); pass=false; }
      if(!(r.maxRatio<0.90)){ log(`GATE FAIL ${r.realm}: max ratio ${r.maxRatio?.toFixed(3)} >= 0.90`); pass=false; }
      if(!(r.torchRatio>=0.50)){ log(`NOTE ${r.realm}: torch ratio ${r.torchRatio?.toFixed(3)} < 0.50 (pool should read strong)`); }
    });
    log(pass?"BRIGHTNESS-LAW GATES: PASS":"BRIGHTNESS-LAW GATES: FAIL");
    if(!pass) process.exitCode=2;
  }catch(e){ log("FATAL",e.message); process.exitCode=1; }
  finally{ if(browser) await browser.close(); if(server.proc){ try{ server.proc.kill("SIGTERM"); }catch(e){} } }
}
main();
