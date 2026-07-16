#!/usr/bin/env node
// KGR-3 calibration contract: mutation-sensitive validation of the build boundary and v2 output.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync,
  rmSync, symlinkSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAL_PATH = join(ROOT, "dev/model-foundry/kenney-calibration.json");
const NORMALIZER = join(ROOT, "build/normalize-donors.py");
let pass = 0, fail = 0;
function check(name, ok, detail = "") {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function json(path) { return JSON.parse(readFileSync(join(ROOT, path), "utf8")); }
function sha(data) { return createHash("sha256").update(data).digest("hex"); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }

function readGlb(path) {
  const data = readFileSync(path);
  let offset = 12, gltf = null;
  while (offset < data.length) {
    const length = data.readUInt32LE(offset), type = data.readUInt32LE(offset + 4);
    offset += 8;
    if (type === 0x4e4f534a) gltf = JSON.parse(data.subarray(offset, offset + length).toString("utf8"));
    offset += length;
  }
  return gltf;
}
function quatMatrix(q) {
  const [x, y, z, w] = q, xx=x*x, yy=y*y, zz=z*z, xy=x*y, xz=x*z, yz=y*z, wx=w*x, wy=w*y, wz=w*z;
  return [
    [1-2*(yy+zz), 2*(xy-wz), 2*(xz+wy), 0],
    [2*(xy+wz), 1-2*(xx+zz), 2*(yz-wx), 0],
    [2*(xz-wy), 2*(yz+wx), 1-2*(xx+yy), 0], [0,0,0,1],
  ];
}
function trs(node) {
  if (node.matrix) {
    const m = Array.from({length:4},()=>Array(4).fill(0));
    for (let c=0;c<4;c++) for (let r=0;r<4;r++) m[r][c]=node.matrix[c*4+r];
    return m;
  }
  const t=node.translation||[0,0,0], s=node.scale||[1,1,1], m=quatMatrix(node.rotation||[0,0,0,1]);
  for (let r=0;r<3;r++) for (let c=0;c<3;c++) m[r][c]*=s[c];
  m[0][3]=t[0]; m[1][3]=t[1]; m[2][3]=t[2]; return m;
}
function mul(a,b) { return a.map((row,r)=>row.map((_,c)=>row.reduce((sum,__,k)=>sum+a[r][k]*b[k][c],0))); }
const ID = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
function point(m,p) { const v=[...p,1]; return [0,1,2].map(r=>v.reduce((sum,x,k)=>sum+m[r][k]*x,0)); }
function sceneBounds(gltf) {
  const out=[[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]];
  function walk(index,parent) {
    const node=gltf.nodes[index], world=mul(parent,trs(node));
    if (node.mesh !== undefined) for (const prim of gltf.meshes[node.mesh].primitives||[]) {
      const pi=prim.attributes?.POSITION; if (pi===undefined) continue;
      const a=gltf.accessors[pi]; if (!a.min||!a.max) continue;
      for (const x of [a.min[0],a.max[0]]) for (const y of [a.min[1],a.max[1]]) for (const z of [a.min[2],a.max[2]]) {
        const p=point(world,[x,y,z]); for(let i=0;i<3;i++){out[0][i]=Math.min(out[0][i],p[i]);out[1][i]=Math.max(out[1][i],p[i]);}
      }
    }
    for (const child of node.children||[]) walk(child,world);
  }
  for (const root of gltf.scenes[gltf.scene||0].nodes||[]) walk(root,ID);
  return out;
}
function dimensions(bounds) { return bounds[1].map((v,i)=>v-bounds[0][i]); }
function hashTree(root) {
  const out={};
  for (const pack of ["kenney-mini-dungeon","kenney-modular-dungeon-kit"]) {
    const dir=join(root,pack); if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).sort()) out[`${pack}/${file}`]=sha(readFileSync(join(dir,file)));
  }
  return out;
}
function makeTempRun(calibration, rawText = null, sourceRoot = join(ROOT,"assets/models")) {
  const temp=mkdtempSync(join(tmpdir(),"genesis-kgr3-"));
  const cal=join(temp,"calibration.json"), out=join(temp,"out"), provenance=join(temp,"provenance.json");
  mkdirSync(join(out,"kenney-mini-dungeon"),{recursive:true});
  writeFileSync(join(out,"kenney-mini-dungeon","keep.txt"),"not replaced\n");
  writeFileSync(cal,rawText ?? JSON.stringify(calibration,null,2)+"\n");
  const result=spawnSync("python3",[NORMALIZER,"--calibration",cal,"--source-root",sourceRoot,"--output-root",out,"--provenance",provenance],{cwd:ROOT,encoding:"utf8"});
  return {temp,cal,out,provenance,result,sentinel:existsSync(join(out,"kenney-mini-dungeon","keep.txt"))};
}
function clean(run){rmSync(run.temp,{recursive:true,force:true});}

console.log("\n=== KGR-3 calibration source + v2 artifacts ===");
const calibration=json("dev/model-foundry/kenney-calibration.json");
const schema=json("dev/model-foundry/kenney-calibration.schema.json");
check("calibration and schema identify genesis.kenney-calibration.v1", calibration.schema==="genesis.kenney-calibration.v1" && schema.$id==="genesis.kenney-calibration.v1");
check("calibration owns all 47 current outputs", Object.keys(calibration.assets).length===47, `got ${Object.keys(calibration.assets).length}`);
check("two measured pack grid contracts are locked", calibration.packs["kenney-modular-dungeon-kit"].canonicalScale===0.5 && calibration.packs["kenney-mini-dungeon"].canonicalScale===2.0 && Object.values(calibration.packs).every(p=>p.structuralGrid.orientationSteps===4 && p.structuralGrid.joinMode==="cell-orientation"));
const indexes=Object.fromEntries(Object.keys(calibration.packs).map(pack=>[pack,json(`assets/models-normalized/${pack}/index.json`)]));
check("both indexes use the v2 envelope", Object.values(indexes).every(i=>i.schema==="genesis.donor-index.v2" && i.assets && !i[Object.keys(i.assets)[0]]));
check("indexes contain exactly the calibrated ids", Object.entries(indexes).flatMap(([pack,i])=>Object.keys(i.assets).map(slug=>`${pack}/${slug}`)).sort().join("|")===Object.keys(calibration.assets).sort().join("|"));

let hierarchyOk=true, sourceScaleOk=true, metadataOk=true, socketsOk=true, framesOk=true, groundsOk=true, gridOk=true, hashesOk=true, uvOk=true;
for (const [assetId, asset] of Object.entries(calibration.assets)) {
  const [pack,slug]=assetId.split("/"), entry=indexes[pack].assets[slug];
  const outPath=join(ROOT,"assets/models-normalized",pack,`${slug}.glb`), sourcePath=join(ROOT,"assets/models",pack,`${slug}.glb`);
  const gltf=readGlb(outPath), scene=gltf.scenes[gltf.scene||0], donor=gltf.nodes[scene.nodes[0]], source=gltf.nodes[donor.children?.[0]];
  hierarchyOk &&= scene.nodes.length===1 && donor.name===slug && !donor.scale && !donor.translation && source.name==="genesis-source-transform";
  const canonical=calibration.packs[pack].canonicalScale;
  sourceScaleOk &&= (source.scale||[]).every((v,i)=>Math.abs(v-asset.preTransform.scale[i]*canonical)<1e-12);
  const meta=donor.extras?.genesisDonor;
  metadataOk &&= meta?.schema==="genesis.donor.v2" && meta.assetId===assetId && meta.sourceSha256===asset.sourceSha256 && meta.bounds && meta.normalizedFrame?.sourceToGenesis?.length===16;
  hashesOk &&= sha(readFileSync(sourcePath))===asset.sourceSha256 && entry.sourceSha256===asset.sourceSha256;
  gridOk &&= entry.structuralGrid?.orientationSteps===4 && entry.structuralGrid?.joinMode==="cell-orientation";
  socketsOk &&= entry.sockets.length>0 && entry.sockets.every(s=>s.id && !s.type.startsWith("butt-join-") && ["floor-mount","wall-mount","top-surface","hinge"].includes(s.type));
  const ids=entry.sockets.map(s=>s.id); socketsOk &&= new Set(ids).size===ids.length;
  for (const s of entry.sockets) {
    const [x,y,z,w]=s.rotation, n=Math.hypot(x,y,z,w);
    framesOk &&= s.position.concat(s.rotation).every(Number.isFinite) && Math.abs(n-1)<1e-5;
    if (s.type==="floor-mount") groundsOk &&= Math.abs(s.position[1]-entry.bounds.groundY)<=0.01;
  }
  if (asset.admissionClass==="DIRECT_MODULATED") {
    const d=dimensions(sceneBounds(gltf)), target=calibration.packs[pack].structuralGrid.targetWorldUnits;
    gridOk &&= [d[0],d[2]].every(v=>{const n=Math.round(v/target)*target;return n>0&&Math.abs(v-n)/n<=0.02;});
  }
  const sourceGltf=readGlb(sourcePath);
  for(let mi=0;mi<(sourceGltf.meshes||[]).length;mi++) for(let pi=0;pi<(sourceGltf.meshes[mi].primitives||[]).length;pi++) {
    const raw=sourceGltf.meshes[mi].primitives[pi].attributes||{}, cooked=gltf.meshes[mi].primitives[pi].attributes||{};
    for(const key of Object.keys(raw).filter(k=>k.startsWith("TEXCOORD_"))) uvOk &&= raw[key]===cooked[key];
  }
}
check("identity donor root + one genesis-source-transform child on every output",hierarchyOk);
check("pack/pre-transform scale exists exactly once on source-transform",sourceScaleOk);
check("v2 source hash, normalized frame, bounds, and provenance metadata load from every root",metadataOk&&hashesOk);
check("v2 sockets are uniquely identified frames and contain no butt-join types",socketsOk);
check("every attachment quaternion is finite and normalized",framesOk);
check("every derived floor mount lies on ground within 0.01u",groundsOk);
check("DIRECT_MODULATED footprints obey their structural grid within 2%",gridOk);
check("material stripping preserves every TEXCOORD accessor index",uvOk);

console.log("\n=== transformed measurement + single-scale negative controls ===");
{
  const source=readGlb(join(ROOT,"assets/models/kenney-mini-dungeon/wall.glb"));
  const transformed=dimensions(sceneBounds(source));
  const indiscriminate=[[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]];
  for(const a of source.accessors||[]) if(a.min?.length>=3&&a.max?.length>=3) for(let i=0;i<3;i++){indiscriminate[0][i]=Math.min(indiscriminate[0][i],a.min[i]);indiscriminate[1][i]=Math.max(indiscriminate[1][i],a.max[i]);}
  const rawUnion=dimensions(indiscriminate), cooked=dimensions(sceneBounds(readGlb(join(ROOT,"assets/models-normalized/kenney-mini-dungeon/wall.glb"))));
  check("⊗ real mini wall transformed POSITION scene footprint is 1.0 source module",Math.abs(transformed[0]-1)<1e-9&&Math.abs(transformed[2]-1)<1e-9,JSON.stringify(transformed));
  check("⊗ raw accessor-wide union mutation reports the wrong 2.0 source footprint",rawUnion[0]===2&&rawUnion[2]===2,JSON.stringify(rawUnion));
  check("real mini wall output is exactly one canonicalScale (2.0) module",Math.abs(cooked[0]-2)<1e-9&&Math.abs(cooked[2]-2)<1e-9,JSON.stringify(cooked));
  const doubled=clone(readGlb(join(ROOT,"assets/models-normalized/kenney-mini-dungeon/wall.glb")));
  const donor=doubled.nodes[doubled.scenes[doubled.scene||0].nodes[0]], sourceNode=doubled.nodes[donor.children[0]], original=doubled.nodes[sourceNode.children[0]];
  original.scale=[2,2,2]; const bad=dimensions(sceneBounds(doubled));
  check("⊗ applying canonical scale at wrapper and original source root fails dimension parity",Math.abs(bad[0]-cooked[0])>1&&Math.abs(bad[2]-cooked[2])>1,JSON.stringify(bad));
}

console.log("\n=== aggregate RED-FIRST validation before replacement ===");
{
  const bad=clone(calibration), gate=bad.assets["kenney-mini-dungeon/gate"], direct=bad.assets["kenney-mini-dungeon/floor"], part=bad.assets["kenney-mini-dungeon/wall"];
  direct.sourceSha256="0".repeat(64);
  gate.sockets.push(clone(gate.sockets[0]));
  gate.sockets[0].rotation=[0,0,0,0];
  direct.preTransform.scale=[-1,-1,-1];
  part.preTransform.scale=[1,2,1];
  part.scaleReason=null;
  part.unrecognizedCalibrationField=true;
  const raw=JSON.stringify(bad,null,2).replace('"groundOffset": 0','"groundOffset": NaN');
  const run=makeTempRun(bad,raw), text=run.result.stderr;
  check("⊗ aggregate invalid calibration exits nonzero",run.result.status!==0);
  check("⊗ hash, duplicate id, zero quaternion, negative/nonuniform scale, NaN, and unknown field all report together",["sourceSha256 mismatch","duplicate socket id","quaternion norm 0","must be positive","nonuniform scale","must be finite","unknown field"].every(s=>text.includes(s)),text.slice(0,500));
  check("⊗ validation failure occurs before output replacement",run.sentinel&&!existsSync(run.provenance));
  clean(run);
}
{
  const bad=clone(calibration); bad.assets["kenney-mini-dungeon/floor"].preTransform.scale=[2,2,2]; bad.assets["kenney-mini-dungeon/floor"].scaleReason="mutation";
  const run=makeTempRun(bad);
  check("⊗ DIRECT_MODULATED per-asset scale fails before replacement",run.result.status!==0&&run.result.stderr.includes("DIRECT_MODULATED")&&run.sentinel);
  clean(run);
}
{
  const bad=clone(calibration); bad.assets["kenney-mini-dungeon/wall"].preTransform.scale=[2,2,2]; bad.assets["kenney-mini-dungeon/wall"].scaleReason=null;
  const run=makeTempRun(bad);
  check("⊗ PART_DONOR nonidentity scale without scaleReason fails before replacement",run.result.status!==0&&run.result.stderr.includes("scaleReason")&&run.sentinel);
  clean(run);
}

console.log("\n=== calibration-driven iteration, overrides, and determinism ===");
{
  const temp=mkdtempSync(join(tmpdir(),"genesis-kgr3-source-")), sourceRoot=join(temp,"models");
  for(const [assetId] of Object.entries(calibration.assets)) {
    const [pack,slug]=assetId.split("/"), dir=join(sourceRoot,pack); mkdirSync(dir,{recursive:true});
    const link=join(dir,`${slug}.glb`); if(!existsSync(link)) symlinkSync(join(ROOT,"assets/models",pack,`${slug}.glb`),link);
  }
  const scratch=clone(calibration), source=join(ROOT,"assets/models/kenney-mini-dungeon/wall.glb"), scratchFile=join(sourceRoot,"kenney-mini-dungeon/scratch-calibrated.glb");
  symlinkSync(source,scratchFile);
  scratch.assets["kenney-mini-dungeon/scratch-calibrated"]={...clone(scratch.assets["kenney-mini-dungeon/wall"]),sourceSha256:sha(readFileSync(source)),footprintOverride:{center:[3,4],halfExtents:[0.5,0.75],yawRadians:0.25}};
  const socketSource=join(ROOT,"assets/models/kenney-mini-dungeon/floor.glb"), socketFile=join(sourceRoot,"kenney-mini-dungeon/scratch-custom-sockets.glb");
  symlinkSync(socketSource,socketFile);
  const socketAsset=clone(scratch.assets["kenney-mini-dungeon/floor"]);
  socketAsset.sourceSha256=sha(readFileSync(socketSource));
  socketAsset.sockets=indexes["kenney-mini-dungeon"].assets.floor.sockets.map((socket)=>({
    ...clone(socket), id: socket.type==="floor-mount" ? "base-center" : "usable-deck",
  }));
  scratch.assets["kenney-mini-dungeon/scratch-custom-sockets"]=socketAsset;
  const run=makeTempRun(scratch,null,sourceRoot), idx=run.result.status===0?JSON.parse(readFileSync(join(run.out,"kenney-mini-dungeon/index.json"),"utf8")):null;
  check("adding one valid scratch calibration record normalizes without a Python slug branch",run.result.status===0&&existsSync(join(run.out,"kenney-mini-dungeon/scratch-calibrated.glb")),run.result.stderr);
  check("explicit footprint override wins and is reported",idx?.assets?.["scratch-calibrated"]?.bounds?.footprintSource==="override"&&idx.assets["scratch-calibrated"].bounds.footprint.center[0]===3);
  const customSockets=idx?.assets?.["scratch-custom-sockets"]?.sockets||[];
  check("custom socket IDs survive while same-type floor/top defaults are suppressed",
    customSockets.length===2 &&
    customSockets.filter((socket)=>socket.type==="floor-mount").length===1 &&
    customSockets.filter((socket)=>socket.type==="top-surface").length===1 &&
    ["base-center","usable-deck"].every((id)=>customSockets.some((socket)=>socket.id===id)) &&
    !customSockets.some((socket)=>["floor-mount","top-surface"].includes(socket.id)),
    JSON.stringify(customSockets));
  clean(run); rmSync(temp,{recursive:true,force:true});
}

execFileSync("python3",[NORMALIZER],{cwd:ROOT,stdio:"pipe"});
const first=hashTree(join(ROOT,"assets/models-normalized")), firstProv=readFileSync(join(ROOT,"dev/model-foundry/KS1-PROVENANCE.json"));
execFileSync("python3",[NORMALIZER],{cwd:ROOT,stdio:"pipe"});
const second=hashTree(join(ROOT,"assets/models-normalized")), secondProv=readFileSync(join(ROOT,"dev/model-foundry/KS1-PROVENANCE.json"));
check("two normalizer runs emit identical file sets and bytes",JSON.stringify(first)===JSON.stringify(second));
check("two normalizer runs emit byte-identical v2 provenance",firstProv.equals(secondProv));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
