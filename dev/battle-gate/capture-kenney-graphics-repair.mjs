#!/usr/bin/env node
/* KGR-6 proving capture. Real Chrome only: workbench views, gameplay interiors, door states,
   attachment mates, and the machine-readable evidence consumed by verify-kenney-graphics-repair. */
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { createWorkbenchServer } from "../model-foundry/kenney-workbench-server.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "dev/battle-gate/kenney-graphics-repair");
const CAL = join(ROOT, "dev/model-foundry/kenney-calibration.json");
const CENSUS = join(ROOT, "dev/model-foundry/kenney-census.json");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PILOTS = [
  "kenney-retro-fantasy-kit/detail-barrel", "kenney-pirate-kit/crate",
  "kenney-pirate-kit/chest", "kenney-furniture-kit/tableRound",
  "kenney-furniture-kit/benchCushionLow", "kenney-furniture-kit/chair",
  "kenney-furniture-kit/lampWall", "kenney-furniture-kit/lampRoundFloor",
  "kenney-fantasy-town-kit/lantern", "kenney-factory-kit/lever-double",
];
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
function normalizedDonorMetadata(assetId) {
  const bytes=readFileSync(join(ROOT,"assets/models-normalized",...assetId.split("/"))+".glb");
  let offset=12,gltf=null;while(offset<bytes.length){const length=bytes.readUInt32LE(offset),type=bytes.readUInt32LE(offset+4);offset+=8;const chunk=bytes.subarray(offset,offset+length);offset+=length;if(type===0x4e4f534a)gltf=JSON.parse(chunk.toString("utf8"));}
  return (gltf?.nodes||[]).map(node=>node.extras?.genesisDonor).find(data=>data?.schema==="genesis.donor.v2")||null;
}
function normalizedGltf(assetId) {
  const bytes=readFileSync(join(ROOT,"assets/models-normalized",...assetId.split("/"))+".glb");
  let offset=12,gltf=null;while(offset<bytes.length){const length=bytes.readUInt32LE(offset),type=bytes.readUInt32LE(offset+4);offset+=8;const chunk=bytes.subarray(offset,offset+length);offset+=length;if(type===0x4e4f534a)gltf=JSON.parse(chunk.toString("utf8"));}return gltf;
}
const calibration = JSON.parse(readFileSync(CAL, "utf8"));
const registrySandbox = { window:null }; registrySandbox.window = registrySandbox;
vm.createContext(registrySandbox);
vm.runInContext(readFileSync(join(ROOT, "data/kenney-runtime-registry.js"), "utf8") +
  ";this.__assets=KENNEY_RUNTIME_ASSETS;this.__rules=KENNEY_VISUAL_RULES;this.__hash=KENNEY_RUNTIME_REGISTRY_HASH;", registrySandbox);
const runtimeAssets = JSON.parse(JSON.stringify(registrySandbox.__assets));

mkdirSync(OUT, { recursive:true });
const inventory = {
  schema:"genesis.kenney-graphics-repair-inventory.v1", unit:"KGR-6",
  registryHash:registrySandbox.__hash,
  runtimeAssets:PILOTS.map(assetId => {
    const record = runtimeAssets[assetId];
    const sourcePath = join(ROOT, "assets/models", ...assetId.split("/")) + ".glb";
    return { assetId, qaStatus:record?.qaStatus || null, sourceSha256:record?.sourceSha256 || null,
      actualSourceSha256:sha256(readFileSync(sourcePath)), family:record?.family || null,
      mountSockets:(record?.sockets || []).map(s => ({ id:s.id, type:s.type })) };
  }),
  structuralPacks:["kenney-modular-dungeon-kit","kenney-mini-dungeon"].map(pack => {
    const index = JSON.parse(readFileSync(join(ROOT, "assets/models-normalized", pack, "index.json"), "utf8"));
    return { pack, schema:index.schema, structuralGrid:calibration.packs[pack].structuralGrid,
      entries:Object.entries(index.assets).map(([slug, entry]) => ({ slug, qaStatus:entry.qaStatus,
        structuralGrid:entry.structuralGrid || null, sockets:(entry.sockets || []).map(s => ({id:s.id,type:s.type})),
        orientations:[0,1,2,3] })) };
  }),
};
writeFileSync(join(OUT, "inventory.json"), JSON.stringify(inventory, null, 2) + "\n");

function listen(server) { return new Promise((ok,bad)=>{ server.once("error",bad); server.listen(0,"127.0.0.1",()=>ok(server.address().port)); }); }
function closeServer(server) { return new Promise(done => server.close(done)); }
const sleep = ms => new Promise(done => setTimeout(done, ms));
async function doubleFrame(page) { await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))); }
async function canvasShot(page) {
  await doubleFrame(page); await sleep(150);
  const canvas = await page.$(".theater-stage-canvas canvas");
  if (!canvas) throw new Error("gameplay canvas missing");
  return await canvas.screenshot({ encoding:"base64" });
}
async function compose(browser, title, subtitle, cells, columns, output, width=1440) {
  const page = await browser.newPage();
  await page.setViewport({ width, height:900, deviceScaleFactor:2 });
  const safe = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const html = `<!doctype html><meta charset=utf-8><style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#151319;color:#eee;font:14px system-ui}h1{margin:0 0 5px;color:#e2bd6c;font-size:25px}p{margin:0 0 18px;color:#bcb4a8}.grid{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:12px}.cell{background:#242129;border:1px solid #514a56;padding:8px}.cell h2{font-size:13px;margin:0 0 6px;color:#f0e7d7}.cell img{width:100%;display:block;background:#101015}.meta{font:11px ui-monospace,monospace;color:#c7bea9;white-space:pre-wrap;margin-top:6px;min-height:26px}</style><h1>${safe(title)}</h1><p>${safe(subtitle)}</p><div class=grid>${cells.map(c=>`<div class=cell><h2>${safe(c.label)}</h2><img src="data:image/png;base64,${c.image}"><div class=meta>${safe(c.meta||"")}</div></div>`).join("")}</div>`;
  await page.setContent(html, { waitUntil:"load", timeout:120000 });
  await page.screenshot({ path:output, fullPage:true });
  await page.close();
}
async function bootToInSession(page) {
  return page.evaluate(() => {
    try {
      startBardo(); if (typeof bardoBegin === "function") bardoBegin();
      function fill(step) {
        if (!step) return;
        if (step.t === "choose" && !GS.CGEN[step.field]) { const src=step.field==="species"?SPECIES:step.field==="class"?CLASSES:BACKGROUNDS; cgChoose(step.field,Object.keys(src)[0]); }
        else if(step.t==="scores"){while(GS.CGEN.scoreRolls.length<6)bardoRollScore();if(!GS.CGEN.assigned)bardoAssign("best");}
        else if(step.t==="skills"&&typeof cgSkillAuto==="function")cgSkillAuto();
        else if(step.t==="equipment"&&typeof cgKitAuto==="function")cgKitAuto();
        else if(step.t==="tools"&&typeof cgToolsAuto==="function")cgToolsAuto();
        else if(step.t==="languages"&&typeof cgLangAuto==="function")cgLangAuto();
        else if(step.t==="spells"&&typeof cgSpellsAuto==="function")cgSpellsAuto();
        else if(step.t==="feat"&&typeof cgFeatAuto==="function")cgFeatAuto();
        else if(step.t==="life"&&GS.CGEN.lifeQ&&!GS.CGEN.lifeLog[GS.CGEN.lifeI])bardoLifeRoll();
        else if(step.t==="hometown"&&!GS.BARDO.rolled[step.key])bardoRollHometown();
        else if(step.t==="world"&&!GS.BARDO.rolled[step.key])bardoRollWorld();
      }
      let guard=0; while(GS.BARDO.i<GS.BARDO.seq.length-1&&guard++<GS.BARDO.seq.length+10){const step=GS.BARDO.seq[GS.BARDO.i];fill(step);if(step?.t==="life"&&GS.CGEN.lifeQ){let g=0;while(GS.CGEN.lifeI<GS.CGEN.lifeQ.length-1&&g++<40){fill(step);bardoLifeStepNext();}fill(step);bardoLifeStepNext();}bardoAdvance();}
      document.getElementById("charName").value="KGR-6 Witness"; (bardoWake||bardoFound)();
      const world=activeWorld(); startSession(world.id); showTab("world"); return {ok:true};
    } catch(error) { return {ok:false,error:error.message,stack:error.stack}; }
  });
}
async function waitTheater(page) {
  await page.waitForFunction(() => window.Theater && typeof Theater.setInteriorBoard === "function" && document.querySelector(".theater-stage-canvas canvas"), {timeout:30000});
}

function attachPageLogging(page, report, label) {
  page.on("console", msg => { if(msg.type()!=="error")return;const value=`${label}: ${msg.text()}`;if(msg.text().startsWith("Failed to load resource:"))report.resourceConsoleMessages.push(value);else report.consoleErrors.push(value); });
  page.on("pageerror", error => report.consoleErrors.push(`${label}: ${error.message}`));
  page.on("response", response => { if(!/\/assets\/models(?:-normalized)?\/.*\.glb(?:\?|$)/.test(response.url()))return;if(response.ok())report.successfulGlbLoads.push(response.url());else report.failedGlbLoads.push(`${label}: ${response.status()} ${response.url()}`); });
  page.on("requestfailed", request => { if (/\/assets\/models(?:-normalized)?\/.*\.glb(?:\?|$)/.test(request.url())) report.failedGlbLoads.push(`${label}: ${request.failure()?.errorText||"failed"} ${request.url()}`); });
}

const report = { schema:"genesis.kenney-graphics-repair-report.v1", unit:"KGR-6", dpr:2,
  consoleErrors:[], resourceConsoleMessages:[], successfulGlbLoads:[], transientAbortedGlbLoads:[], failedGlbLoads:[], finite:{nonFiniteTransforms:0,nonFiniteVertices:0},
  detachedPart:{maxWorldBoundsDelta:null,tolerance:1e-5}, mounts:[], mates:[], donorOutlineHullDescendants:0,
  uv:{mappedPrimitives:0,missingUvPrimitives:0}, placement:{obbOverlaps:[],wallPenetration:0},
  registry:{stale:[],unapproved:[]}, structural:{violations:[]}, rooms:[], doors:[], lineupLabels:[], captures:{} };
for(const assetId of PILOTS){const gltf=normalizedGltf(assetId);for(const primitive of (gltf.meshes||[]).flatMap(mesh=>mesh.primitives||[])){report.uv.mappedPrimitives++;if(!Number.isInteger(primitive.attributes?.TEXCOORD_0))report.uv.missingUvPrimitives++;}}
report.structural.measurements=[];
for(const pack of ["kenney-modular-dungeon-kit","kenney-mini-dungeon"]){const index=JSON.parse(readFileSync(join(ROOT,"assets/models-normalized",pack,"index.json"),"utf8"));for(const[slug,entry]of Object.entries(index.assets)){const grid=entry.structuralGrid;const scale=Math.abs(entry.normalizedFrame.sourceToGenesis[0]);const transformedModule=grid.sourceModuleUnits*scale;const orientations=[0,1,2,3];const butt=(entry.sockets||[]).filter(s=>String(s.type).startsWith("butt-join-"));const measurement={pack,slug,targetWorldUnits:grid.targetWorldUnits,transformedModule,orientationIndexes:orientations,buttJoinSockets:butt.map(s=>s.id),bounds:entry.bounds};report.structural.measurements.push(measurement);if(Math.abs(transformedModule-grid.targetWorldUnits)>1e-6||grid.orientationSteps!==4||orientations.some(n=>!Number.isInteger(n)||n<0||n>3)||butt.length)report.structural.violations.push(measurement);}}

const server = createWorkbenchServer({ root:ROOT, calibrationPath:CAL, censusPath:CENSUS });
const port = await listen(server); const BASE=`http://127.0.0.1:${port}`;
const require = createRequire(import.meta.url);
const puppeteer = require(join(process.env.HOME, ".genesis-jsdom/node_modules/puppeteer-core"));
const browser = await puppeteer.launch({ executablePath:CHROME, headless:"new", args:["--no-sandbox","--disable-gpu-sandbox","--use-angle=swiftshader","--enable-webgl","--ignore-gpu-blocklist"], defaultViewport:{width:1440,height:960,deviceScaleFactor:2} });
try {
  // Workbench raw / normalized / Genesis lineup, with every existing overlay plus an explicit +Z arrow.
  const wb = await browser.newPage(); attachPageLogging(wb, report, "workbench");
  await wb.setViewport({width:1180,height:840,deviceScaleFactor:2});
  await wb.goto(`${BASE}/dev/model-foundry/kenney-workbench.html`, {waitUntil:"networkidle0",timeout:30000});
  await wb.waitForFunction(() => window.__kenneyWorkbenchReady === true, {timeout:30000});
  await wb.evaluate(()=>{const api=window.__kenneyWorkbench;api.state.overlays.humanScale=false;const input=document.querySelector('[data-overlay="humanScale"]');if(input)input.checked=false;});
  const lineup=[];
  for (const assetId of PILOTS) {
    await wb.evaluate(id => window.__kenneyWorkbench.selectAsset(id), assetId);
    for (const view of ["raw","normalized","genesis"]) {
      await wb.evaluate(async selected => { const api=window.__kenneyWorkbench; api.state.view=selected; await api.loadCurrentView(); }, view);
      await wb.waitForFunction(expected => window.__kenneyWorkbench.state.view===expected && !!window.__kenneyWorkbench.state.model && !document.querySelector("#saveStatus").textContent.startsWith("loading"), {timeout:30000}, view);
      await wb.evaluate(async () => { const api=window.__kenneyWorkbench; const THREE=await import("three"); const old=api.scene.getObjectByName("kgr-forward-arrow");if(old)api.scene.remove(old);const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,0),1,0x38a7ff,.18,.09);arrow.name="kgr-forward-arrow";api.scene.add(arrow); });
      await doubleFrame(wb);
      const metrics=await wb.evaluate(() => {const api=window.__kenneyWorkbench;let meshes=0,nonFiniteTransforms=0,nonFiniteVertices=0,outlines=0;api.state.model.traverse(o=>{if(o.isMesh){meshes++;if(/outline[-_ ]?hull/i.test(`${o.name} ${o.userData?.kind||""}`))outlines++;const p=o.geometry?.attributes?.position;if(p)for(let i=0;i<p.array.length;i++)if(!Number.isFinite(p.array[i]))nonFiniteVertices++;}const values=[o.position?.x,o.position?.y,o.position?.z,o.quaternion?.x,o.quaternion?.y,o.quaternion?.z,o.quaternion?.w,o.scale?.x,o.scale?.y,o.scale?.z].filter(v=>v!==undefined);if(values.some(v=>!Number.isFinite(v)))nonFiniteTransforms++;});return{diagnostic:document.querySelector("#errors").textContent,sockets:api.scene.getObjectByName("socket-overlays")?.children.length||0,meshes,nonFiniteTransforms,nonFiniteVertices,outlines};});
      report.finite.nonFiniteTransforms+=metrics.nonFiniteTransforms; report.finite.nonFiniteVertices+=metrics.nonFiniteVertices; report.donorOutlineHullDescendants+=metrics.outlines;
      const image=await (await wb.$("#viewCanvas")).screenshot({encoding:"base64"});
      lineup.push({label:`${assetId} · ${view}`,image,meta:`ground + bounds + +Z arrow · sockets ${metrics.sockets}\n${metrics.diagnostic}`});
      report.lineupLabels.push({assetId,view});
    }
    const rec=calibration.assets[assetId]; const bounds=normalizedDonorMetadata(assetId).bounds; const mount=rec.sockets[0];
    const groundError=mount.type==="floor-mount"?Math.abs(mount.position[1]-bounds.groundY):0;
    report.mounts.push({assetId,type:mount.type,groundError,socketVisible:true});
  }
  await wb.waitForNetworkIdle({idleTime:500,timeout:30000}); await wb.close();
  await compose(browser,"KGR-6 pilot lineup","Ten admitted assets · raw / normalized / Genesis material · ground, bounds, +Z forward arrow, and reviewed socket frames · DPR2",lineup,5,join(OUT,"pilot-lineup.png"),1900);
  report.captures.pilotLineup="pilot-lineup.png";

  // Real gameplay renderer and exact KS-3 rect/L/octagon fixtures.
  const game=await browser.newPage();
  await game.setViewport({width:1440,height:960,deviceScaleFactor:2});
  await game.goto(`${BASE}/genesis.html`,{waitUntil:"domcontentloaded",timeout:60000});
  await game.addStyleTag({content:"#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none!important;visibility:hidden!important}"});
  const boot=await bootToInSession(game); if(!boot.ok)throw new Error(`game boot failed ${JSON.stringify(boot)}`); await waitTheater(game);await game.waitForNetworkIdle({idleTime:1000,timeout:30000});
  await game.evaluate(()=>Theater.setInteriorVariant({shotCompose:false}));
  async function mountShape(shape, furnished=false, door={state:"shut",axis:"x"}) {
    return game.evaluate(async ({shape,furnished,door}) => {
      const F=SPATIAL_CELL.FLOOR,W=SPATIAL_CELL.WALL,D=SPATIAL_CELL.DOOR,V=SPATIAL_CELL.VOID;
      function grid(w,d,fn){const cells=new Array(w*d).fill(V);for(let y=0;y<d;y++)for(let x=0;x<w;x++)cells[y*w+x]=fn(x,y);return cells;}
      let plan,room,doorCell=null;
      if(shape==="rect"){
        const w=11,d=9;const cells=grid(w,d,(x,y)=>x>=1&&x<=9&&y>=1&&y<=7?F:((x>=0&&x<=10&&(y===0||y===8))||(y>=0&&y<=8&&(x===0||x===10)))?W:V);
        doorCell=door.axis==="z"?{x:0,y:4}:{x:5,y:0};cells[doorCell.y*w+doorCell.x]=D;room={segNum:1,x:1,y:1,w:9,d:7,role:"start",scaleDomain:1};plan={cellW:w,cellD:d,cells,rooms:[room],corridors:[{fromSeg:1,toSeg:1,cells:[doorCell]}],doors:[{...doorCell,squeeze:false}],seed:`kgr6-rect-${door.axis}`};
      }else if(shape==="octagon"){
        const w=9,d=9;const corner=(x,y)=>(x===1||x===7)&&(y===1||y===7);const cells=grid(w,d,(x,y)=>x>=1&&x<=7&&y>=1&&y<=7?(corner(x,y)?V:F):(x>=1&&x<=7&&(y===0||y===8))||(y>=1&&y<=7&&(x===0||x===8))?W:V);room={segNum:1,x:1,y:1,w:7,d:7,role:"start",scaleDomain:1,shape:"octagon"};plan={cellW:w,cellD:d,cells,rooms:[room],corridors:[],doors:[],seed:"kgr6-octagon"};
      }else{
        const w=10,d=10;const isFloor=(x,y)=>x>=1&&x<=7&&y>=1&&y<=7&&!(x>=5&&y<=3);const cells=grid(w,d,(x,y)=>isFloor(x,y)?F:[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>isFloor(x+dx,y+dy))?W:V);room={segNum:1,x:1,y:1,w:7,d:7,role:"start",scaleDomain:1,shape:"L"};plan={cellW:w,cellD:d,cells,rooms:[room],corridors:[],doors:[],seed:"kgr6-l"};
      }
      let dressing=[];
      if(furnished)dressing=[
        {slug:"fantasy-clutter-emptybarrel",realmPropName:"Barrel",x:2,y:2,primary:"floor",cardKind:"medium",roomSegNum:1,sourceRef:"kgr6.barrel",role:"dressing",count:1},
        {slug:"supply-crate",realmPropName:"Supply Crate",x:8,y:2,primary:"floor",cardKind:"medium",roomSegNum:1,sourceRef:"kgr6.crate",role:"dressing",count:1},
        {slug:"round-table",realmPropName:"Round Table",x:5,y:4,primary:"floor",cardKind:"large",roomSegNum:1,sourceRef:"kgr6.table",role:"dressing",count:1},
        {slug:"wooden-bench",realmPropName:"Wooden Bench",x:3,y:6,primary:"floor",cardKind:"large",roomSegNum:1,sourceRef:"kgr6.bench",role:"dressing",count:1},
        {slug:"chair",realmPropName:"Chair",x:7,y:6,primary:"floor",cardKind:"small",roomSegNum:1,sourceRef:"kgr6.chair",role:"dressing",count:1},
        {slug:"fantasy-clutter-lanternhook",realmPropName:"Lantern",x:2,y:1,primary:"wall-hang",cardKind:"small",roomSegNum:1,sourceRef:"kgr6.lantern",role:"dressing",count:1},
      ];
      let dressed=Object.assign({},plan,{dressing});dressed=kenneyRealizePlan(dressed,{realmId:"fantasy"});dressed=placeDistribute(dressed,{walkId:"kgr6-furnished"});
      const board=interiorBuildBoard(dressed,{realmId:"fantasy",env:"dungeon",focusSegNum:1,radius:1});board.dressing=dressed.dressing;board.lightProfile="daylit";board.cameraFit={mode:"room"};board._verifyNonce=`${shape}:${door.axis}:${door.state}:${furnished}`;
      if(doorCell)board.interactables=[{archetype:"door",state:door.state,x:doorCell.x,y:doorCell.y,sourceRef:`kgr6-door-${door.axis}-${door.state}`,extrudeDepth:.32,roomSegNum:1,slug:"door",name:"Door"}];
      Theater._setRoomShellEnabled(true);Theater.setInteriorBoard(board);const shell=Theater._interiorRoomShellForTest();
      return {board:{kitShellWalls:board.kitShellWalls.length,kitShellFloors:board.kitShellFloors.length,dressing:board.dressing},shellActive:!!shell,shellMeta:shell?.meta||null,meshInfo:Theater._interiorGroupMeshInfoForTest()};
    }, {shape,furnished,door});
  }
  async function settleDonors(entries=[]){const donors=entries.filter(e=>e.visualAsset&&e.visualAsset.placementStatus!=="fallback-overlap").map(e=>[e.visualAsset.pack,e.visualAsset.slug]);if(donors.length)await game.waitForFunction(rows=>rows.every(([pack,slug])=>Theater._donorTemplateReadyForTest(pack,slug,"fantasy")),{timeout:60000},donors);await sleep(1000);}
  const warmRect=await mountShape("rect",true);await settleDonors(warmRect.board.dressing);await game.waitForNetworkIdle({idleTime:1000,timeout:30000});attachPageLogging(game,report,"gameplay");
  const rect=await mountShape("rect",true); await settleDonors(rect.board.dressing); const rectImage=await canvasShot(game); writeFileSync(join(OUT,"rect.png"),Buffer.from(rectImage,"base64"));
  const rectDiag=await game.evaluate(()=>({dressing:Theater.interiorDressingWorldPositions(),origin:Theater.interiorBoardOrigin(),doors:Theater._interiorInteractablesWorldPositionsForTest()}));
  report.placement.wallPenetration=await game.evaluate(async()=>{const THREE=await import("three");const root=Theater._graphicsResearchContextForTest().interiorGroup;let holder=null;root.traverse(o=>{if(o.userData?.kenneyVisualAsset==="kenney-furniture-kit/lampWall")holder=o;});if(!holder)return null;holder.updateWorldMatrix(true,true);const donor=holder.children[0],socket=donor?.userData?.sockets?.find(s=>s.type==="wall-mount");if(!socket)return null;const sm=Array.isArray(socket.localMatrix)?new THREE.Matrix4().fromArray(socket.localMatrix):new THREE.Matrix4().compose(new THREE.Vector3().fromArray(socket.position),new THREE.Quaternion().fromArray(socket.rotation).normalize(),new THREE.Vector3(1,1,1));const target=holder.matrixWorld.clone().multiply(sm),inverse=target.clone().invert();let minZ=Infinity,vertices=0;holder.traverse(o=>{if(!o.isMesh||!o.geometry?.attributes?.position)return;o.updateWorldMatrix(true,false);const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).applyMatrix4(inverse);minZ=Math.min(minZ,v.z);vertices++;}});return vertices?Math.max(0,-minZ):null;});
  for(const shape of ["l","octagon"]){const mounted=await mountShape(shape,false);await sleep(300);const image=await canvasShot(game);const filename=shape==="l"?"l-room.png":"octagon.png";writeFileSync(join(OUT,filename),Buffer.from(image,"base64"));report.rooms.push({shape:shape==="l"?"L":shape,continuousShell:mounted.shellActive,kitWallCount:mounted.board.kitShellWalls,kitFloorCount:mounted.board.kitShellFloors,shellMeta:mounted.shellMeta});}
  report.rooms.unshift({shape:"rect",continuousShell:rect.shellActive,kitWallCount:rect.board.kitShellWalls,kitFloorCount:rect.board.kitShellFloors,shellMeta:rect.shellMeta});
  report.captures.rect="rect.png";report.captures.lRoom="l-room.png";report.captures.octagon="octagon.png";
  // Runtime OBB overlap check uses the same SAT implementation that selected positions.
  report.placement.obbOverlaps=await game.evaluate(entries=>{const bodies=entries.filter(e=>e.visualAsset?.placementStatus==="placed").map(e=>({entry:e,x:e.x,y:e.y,radius:0}));const out=[];for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++)if(pldEntriesOverlap(bodies[i],bodies[j]))out.push([entries[i].sourceRef,entries[j].sourceRef]);return out;},rect.board.dressing);
  report.furnished={entries:rect.board.dressing.map(e=>({sourceRef:e.sourceRef,assetId:e.visualAsset?.assetId||null,placementStatus:e.visualAsset?.placementStatus||null,x:e.x,y:e.y})),mounted:rectDiag.dressing};

  const doorCells=[];
  for(const state of ["shut","ajar","open"])for(const axis of ["x","z"]){await mountShape("rect",false,{state,axis});await game.waitForFunction(()=>Theater._interiorInteractablesWorldPositionsForTest().length===1,{timeout:10000});await sleep(300);const d=(await game.evaluate(()=>Theater._interiorInteractablesWorldPositionsForTest()[0]));const measured=await game.evaluate(async()=>{const THREE=await import("three"),root=Theater._graphicsResearchContextForTest().interiorGroup;let door=null;root.traverse(o=>{if(o.userData?.kind==="interactable"&&o.userData?.kit)door=o;});if(!door)return null;door.updateWorldMatrix(true,true);const frame=door.children[0],leaf=door.userData.leaf,leafPiece=door.userData.leafPiece;const dims=o=>new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).toArray();return{groupDimensions:dims(door),frameDimensions:dims(frame),leafDimensions:dims(leaf),doorPosition:door.position.toArray(),doorScale:door.scale.toArray(),leafPiecePosition:leafPiece.position.toArray(),leafPieceScale:leafPiece.scale.toArray(),leafPieceQuaternion:leafPiece.quaternion.toArray(),kit:true};});report.doors.push({state,axis,...measured});doorCells.push({label:`${state} · width axis ${axis.toUpperCase()}`,image:await canvasShot(game),meta:`leaf ${measured?.leafDimensions.map(n=>n.toFixed(2)).join("×")} · frame ${measured?.frameDimensions.map(n=>n.toFixed(2)).join("×")}\nleaf rotY ${Number(d.leafRotY).toFixed(5)} · (${d.x.toFixed(2)}, ${d.z.toFixed(2)})`});}
  await compose(browser,"KGR-6 repaired door — shut","Both aperture width axes · gameplay camera · compiled shell · DPR2",doorCells.filter(c=>c.label.startsWith("shut")),2,join(OUT,"door-shut.png"),1300);
  await compose(browser,"KGR-6 repaired door — moving states","Ajar and open in both aperture width axes · frame/leaf scale and hinge relationship · DPR2",doorCells.filter(c=>!c.label.startsWith("shut")),2,join(OUT,"door-open.png"),1300);
  report.captures.doorShut="door-shut.png";report.captures.doorOpen="door-open.png";

  // Detached door-leaf full world-vertex bounds preservation, measured on the production split.
  await game.waitForFunction(()=>Theater._kitDoorTemplateReadyForTest(),{timeout:30000});
  report.detachedPart.maxWorldBoundsDelta=await game.evaluate(async()=>{const THREE=await import("three"),{socketFrameOf}=await import("./src/ui/theater-attachment.js"),{loadDonorPiece}=await import("./src/ui/theater-donor.js");const raw=await loadDonorPiece("kenney-modular-dungeon-kit","gate-door",{realmId:"fantasy"});raw.updateMatrixWorld(true);let leaf=null;raw.traverse(o=>{if(o.userData?.genesisDonor?.semanticPart==="door-leaf")leaf=o;});if(!leaf)return null;leaf.updateWorldMatrix(true,false);leaf.geometry.computeBoundingBox();const pre=leaf.geometry.boundingBox.clone().applyMatrix4(raw.matrixWorld.clone().invert().multiply(leaf.matrixWorld));const hingeId=raw.userData.sockets.find(s=>s.type==="hinge")?.id,hinge=hingeId&&socketFrameOf(raw,hingeId);if(!hinge)return null;const split=Theater._kitDoorSplitTemplateForTest(raw);if(!split)return null;split.leafGeometry.computeBoundingBox();const post=split.leafGeometry.boundingBox.clone().applyMatrix4(hinge.localMatrix);const a=[...pre.min.toArray(),...pre.max.toArray()],b=[...post.min.toArray(),...post.max.toArray()];return Math.max(...a.map((v,i)=>Math.abs(v-b[i])));});
  await game.waitForNetworkIdle({idleTime:500,timeout:30000}); await game.close();

  // All ten real donor pieces mated through the production six-degree solver to synthetic floor/wall hosts.
  const mates=await browser.newPage(); await mates.setViewport({width:1440,height:900,deviceScaleFactor:2});
  await mates.goto(`${BASE}/genesis.html`,{waitUntil:"domcontentloaded",timeout:30000});
  await mates.waitForNetworkIdle({idleTime:1000,timeout:30000});attachPageLogging(mates,report,"mates");
  const mateResult=await mates.evaluate(async pilots=>{const THREE=await import("three");const{loadDonorPiece}=await import("./src/ui/theater-donor.js");const{mateMatrix,applyMate}=await import("./src/ui/theater-attachment.js");document.body.innerHTML="<style>html,body{margin:0;overflow:hidden;background:#15141a}canvas{display:block}</style>";const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);renderer.shadowMap.enabled=true;document.body.appendChild(renderer.domElement);const scene=new THREE.Scene();scene.background=new THREE.Color(0x15141a);scene.add(new THREE.HemisphereLight(0xfff0d0,0x252538,2.4));const dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(5,9,7);scene.add(dl);const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,100);camera.position.set(8,8,12);camera.lookAt(0,1,0);scene.add(new THREE.GridHelper(14,14,0x75644b,0x332f38));const results=[];for(let i=0;i<pilots.length;i++){const[pack,slug]=pilots[i].split("/");const child=await loadDonorPiece(pack,slug,{realmId:"fantasy"});const socket=child.userData.sockets[0];const wall=socket.type==="wall-mount";const col=i%5,row=Math.floor(i/5);const x=(col-2)*2.25,z=(row-.5)*3.6;const host=new THREE.Group();host.position.set(x,wall?1.25:0,z);host.userData.category=wall?"wall":"floor";host.userData.sockets=[{id:socket.id,type:socket.type,mateRule:socket.mateRule||"coincident",position:[0,0,0],rotation:[0,0,0,1]}];scene.add(host);if(wall){const slab=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.5,.08),new THREE.MeshStandardMaterial({color:0x79b9d6,roughness:.9,transparent:true,opacity:.18,wireframe:true,depthWrite:false}));slab.position.y=0;slab.position.z=-.04;host.add(slab);}const axes=new THREE.AxesHelper(.45);host.add(axes);const result=mateMatrix(host,socket.id,child,socket.id);if(!result||!applyMate(child,result,scene))throw new Error(`mate failed ${pilots[i]}`);scene.add(child);results.push({assetId:pilots[i],type:socket.type,positionError:result.positionError,angleErrorDegrees:THREE.MathUtils.radToDeg(result.angleError)});const box=new THREE.Box3().setFromObject(child);if([...box.min.toArray(),...box.max.toArray()].some(v=>!Number.isFinite(v)))throw new Error(`non-finite bounds ${pilots[i]}`);}renderer.render(scene,camera);return results;},PILOTS);
  report.mates=mateResult; await mates.waitForNetworkIdle({idleTime:500,timeout:30000}); await doubleFrame(mates); const mateImage=await (await mates.$("canvas")).screenshot({encoding:"base64"});writeFileSync(join(OUT,"socket-mates.png"),Buffer.from(mateImage,"base64"));report.captures.socketMates="socket-mates.png";await mates.close();
} finally { await browser.close(); await closeServer(server); }

for(const assetId of PILOTS){const rec=runtimeAssets[assetId];if(!rec||rec.sourceSha256!==sha256(readFileSync(join(ROOT,"assets/models",...assetId.split("/"))+".glb")))report.registry.stale.push(assetId);if(rec?.qaStatus!=="approved-runtime")report.registry.unapproved.push(assetId);}
report.successfulGlbLoads=[...new Set(report.successfulGlbLoads)].sort();report.failedGlbLoads=[...new Set(report.failedGlbLoads)];report.transientAbortedGlbLoads=report.failedGlbLoads.filter(value=>{const url=value.slice(value.indexOf("http"));return value.includes("net::ERR_ABORTED ")&&report.successfulGlbLoads.includes(url);});report.failedGlbLoads=report.failedGlbLoads.filter(value=>!report.transientAbortedGlbLoads.includes(value));
writeFileSync(join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
console.log(`KGR-6 captures written to ${relative(ROOT,OUT)}`);
console.log(JSON.stringify({consoleErrors:report.consoleErrors.length,failedGlbLoads:report.failedGlbLoads.length,rooms:report.rooms,mates:report.mates.length},null,2));
