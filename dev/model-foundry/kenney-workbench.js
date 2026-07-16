/* KGR-4A donor/socket workbench. The editor never writes files directly: Save crosses only the
   loopback calibration API. All persisted rotations are normalized [x,y,z,w] quaternions. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { loadDonorPiece } from "/src/ui/theater-donor.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clone = (value) => JSON.parse(JSON.stringify(value));
const MATERIALS = ["stone", "wood", "iron", "roof", "glass", "cloth"];
const rawLoadingManager = new THREE.LoadingManager();
// The two pre-KGR census packs reference an uncommitted Blender colormap by relative URI. Geometry
// inspection must remain usable and console-clean; substitute a neutral one-pixel texture only for
// that absent immutable-source dependency. The GLB itself is still loaded by the real GLTFLoader.
const workbenchAssetUrl = (url) => {
  if (!String(url).split("?")[0].toLowerCase().endsWith("/textures/colormap.png") && String(url).split("?")[0].toLowerCase() !== "textures/colormap.png") return url;
  state.materialFallbacks.add("Textures/colormap.png");
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGPYuXnFfwAHUQMUvPIZzwAAAABJRU5ErkJggg==";
};
rawLoadingManager.setURLModifier(workbenchAssetUrl);
THREE.DefaultLoadingManager.setURLModifier(workbenchAssetUrl);
const loader = new GLTFLoader(rawLoadingManager);
const state = {
  calibration: null, census: null, candidates: new Set(), censusById: new Map(), currentId: null,
  record: null, savedRecord: null, view: "genesis", orientationIndex: 0, selectedSocket: -1,
  packRecord: null, savedPackRecord: null, packIsNew: false,
  materialFallbacks: new Set(),
  model: null, modelUrl: null, childPreview: null, childRecord: null, childId: null,
  overlays: { axes:true, grid:true, module:true, ground:true, wireframe:false, backface:false, normals:false, aabb:true, footprint:true, hierarchy:false, humanScale:true },
};

const canvas = $("#viewCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, preserveDrawingBuffer:true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x17161a);
const camera = new THREE.PerspectiveCamera(28, 1, .01, 500); camera.position.set(6, 5, 7);
scene.add(new THREE.HemisphereLight(0xf8e9d1, 0x222432, 2.0));
const key = new THREE.DirectionalLight(0xffe2bd, 3.2); key.position.set(5,8,6); key.castShadow = true; scene.add(key);
const rim = new THREE.DirectionalLight(0x829ec9, 1.2); rim.position.set(-5,3,-4); scene.add(rim);
const modelMount = new THREE.Group(); modelMount.name = "workbench-calibrated-root"; scene.add(modelMount);
const orientationGroup = new THREE.Group(); orientationGroup.name = "orientation-quarter-turn"; modelMount.add(orientationGroup);
const overlayGroup = new THREE.Group(); overlayGroup.name = "workbench-overlays"; scene.add(overlayGroup);
const socketGroup = new THREE.Group(); socketGroup.name = "socket-overlays"; orientationGroup.add(socketGroup);
const childGroup = new THREE.Group(); childGroup.name = "mate-preview"; scene.add(childGroup);
const axes = new THREE.AxesHelper(2.5); axes.name = "overlay-axes"; overlayGroup.add(axes);
const unitGrid = new THREE.GridHelper(40,40,0x826a47,0x37333b); unitGrid.name="overlay-grid"; overlayGroup.add(unitGrid);
const humanYardstick = createHumanYardstick(); humanYardstick.position.set(-1.25,0,.8); modelMount.add(humanYardstick);
let moduleGrid = null, groundPlane = null, boxHelper = null, footprintHelper = null, normalsHelper = null;

function createHumanYardstick() {
  // Diagnostic geometry only: a deterministic six-foot reference in Genesis's 5 ft/u scale.
  // It is a sibling of the orientation group so asset TRS and quarter-turns cannot move it.
  const group=new THREE.Group(); group.name="overlay-human-yardstick"; group.userData={diagnostic:true,heightWorldUnits:1.2,groundY:0};
  const neutral=new THREE.MeshStandardMaterial({color:0xb8b2a8,roughness:1,metalness:0,flatShading:true});
  const dark=new THREE.MeshStandardMaterial({color:0x77736d,roughness:1,metalness:0,flatShading:true});
  const part=(geometry,material,x,y,z)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.name="human-yardstick-facet";group.add(mesh);return mesh;};
  part(new THREE.CylinderGeometry(.052,.062,.52,4,1,false),dark,-.072,.26,0);
  part(new THREE.CylinderGeometry(.052,.062,.52,4,1,false),dark,.072,.26,0);
  part(new THREE.CylinderGeometry(.11,.17,.48,5,1,false),neutral,0,.76,0);
  part(new THREE.CylinderGeometry(.09,.105,.2,6,1,false),neutral,0,1.1,0);
  const tickGeometry=new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-.24,0,0),new THREE.Vector3(-.24,1.2,0),
    new THREE.Vector3(-.29,0,0),new THREE.Vector3(-.19,0,0),
    new THREE.Vector3(-.29,1.2,0),new THREE.Vector3(-.19,1.2,0),
  ]);
  const ticks=new THREE.LineSegments(tickGeometry,new THREE.LineBasicMaterial({color:0xf0ca7a}));ticks.name="human-yardstick-measure";group.add(ticks);
  return group;
}
function humanYardstickMetrics() {
  humanYardstick.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(humanYardstick);
  const projected=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])projected.push(new THREE.Vector3(x,y,z).project(camera));
  return {height:box.max.y-box.min.y,groundY:box.min.y,parent:humanYardstick.parent?.name,visible:humanYardstick.visible,onScreen:projected.some(point=>Math.abs(point.x)<=1&&Math.abs(point.y)<=1&&point.z>=-1&&point.z<=1)};
}

const transform = new TransformControls(camera, renderer.domElement);
const transformVisual = typeof transform.getHelper === "function" ? transform.getHelper() : transform;
transformVisual.name = "socket-transform-gizmo"; scene.add(transformVisual);
transform.addEventListener("dragging-changed", (event) => { orbit.draggingGizmo = event.value; });
transform.addEventListener("objectChange", () => {
  const socket = state.record?.sockets?.[state.selectedSocket];
  if (!socket || transform.object !== socketGroup.children[state.selectedSocket]) return;
  const object = transform.object;
  socket.position = object.position.toArray().map(round9);
  socket.rotation = normalizeQuat(object.quaternion.toArray());
  populateSocketEditor(); markDirty(); rebuildSocketVisuals(false); updateMateSelectors();
});

const orbit = { yaw:.72, pitch:.48, distance:10, target:new THREE.Vector3(0,1,0), down:false, x:0, y:0, draggingGizmo:false };
canvas.addEventListener("pointerdown", (event) => { if (orbit.draggingGizmo) return; orbit.down=true; orbit.x=event.clientX; orbit.y=event.clientY; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener("pointermove", (event) => { if (!orbit.down || orbit.draggingGizmo) return; orbit.yaw -= (event.clientX-orbit.x)*.008; orbit.pitch = THREE.MathUtils.clamp(orbit.pitch+(event.clientY-orbit.y)*.008,-1.35,1.35); orbit.x=event.clientX;orbit.y=event.clientY; });
canvas.addEventListener("pointerup", () => { orbit.down=false; });
canvas.addEventListener("wheel", (event) => { orbit.distance = THREE.MathUtils.clamp(orbit.distance*Math.exp(event.deltaY*.001),.4,200); event.preventDefault(); }, {passive:false});

function round9(value) { return Math.round(value * 1e9) / 1e9; }
function normalizeQuat(value) {
  const q = new THREE.Quaternion(...(Array.isArray(value) ? value : [0,0,0,1]));
  if (!Number.isFinite(q.lengthSq()) || q.lengthSq() < 1e-12) q.identity(); else q.normalize();
  return q.toArray().map(round9);
}
function assetIdOf(entry) { return `${entry.pack}/${String(entry.name).replace(/\.glb$/i, "")}`; }
function currentCensus() { return state.censusById.get(state.currentId); }
function packOf(id = state.currentId) { return id?.split("/")[0] || ""; }
function slugOf(id = state.currentId) { return id?.split("/")[1] || ""; }
function identityRecord(entry) {
  return {
    sourceSha256: entry.sha256, admissionClass: "PART_DONOR", category: entry.role || "prop",
    rootMaterialFamily: "stone", preTransform:{translation:[0,0,0],rotation:[0,0,0,1],scale:[1,1,1]},
    scaleReason:null, groundOffset:0, semanticParts:{}, sockets:[], footprintOverride:null,
    qaStatus:"needs-review", notes:[],
  };
}
function socketDefault(index) {
  return { id:`socket-${index+1}`, type:"floor-mount", position:[0,0,0], rotation:[0,0,0,1], mateRule:"coincident", mateFamily:"prop", size:[.1,.1,.1], clearance:{shape:"box",size:[.5,.5,.5]} };
}
function markDirty() {
  const dirty = JSON.stringify(state.record) !== JSON.stringify(state.savedRecord) || JSON.stringify(state.packRecord) !== JSON.stringify(state.savedPackRecord);
  $("#dirty").textContent = dirty ? "unsaved" : "clean"; $("#dirty").classList.toggle("is-dirty", dirty);
}
function setStatus(text, good = null) { const el=$("#saveStatus"); el.textContent=text; el.className=good===true?"status-good":good===false?"status-bad":""; }
function setError(text="") { $("#errors").textContent=text; }
function showMaterialDiagnostic(){setError(state.materialFallbacks.size?`RAW MATERIAL UNAVAILABLE: ${[...state.materialFallbacks].join(", ")} is absent from the source corpus; neutral diagnostic texture substituted.`:"");}

function renderAssetList() {
  const query=$("#assetSearch").value.trim().toLowerCase(), filter=$("#assetFilter").value, qa=$("#qaFilter").value;
  const shown = state.census.assets.filter((entry) => {
    const id=assetIdOf(entry), record=state.calibration.assets[id], q=record?.qaStatus || "uncalibrated";
    if (query && !`${id} ${entry.role} ${entry.family}`.toLowerCase().includes(query)) return false;
    if (filter==="candidate" && !state.candidates.has(id)) return false;
    if (filter==="normalized" && !record) return false;
    if (filter==="calibrated" && !record) return false;
    if (qa!=="all" && qa!==q) return false;
    return true;
  });
  $("#assetCount").textContent=`${shown.length.toLocaleString()} / ${state.census.assets.length.toLocaleString()} inventory · ${state.census.assetCount.toLocaleString()} census · ${state.candidates.size} candidates · ${Object.keys(state.calibration.assets).length} normalized/calibrated`;
  const list=$("#assetList"); list.textContent="";
  for (const entry of shown.slice(0,700)) {
    const id=assetIdOf(entry), record=state.calibration.assets[id];
    const button=document.createElement("button"); button.className="asset"+(id===state.currentId?" current":""); button.title=id;
    button.innerHTML=`<span class="pill">${record?.qaStatus || "raw"}</span>${id}`; button.onclick=()=>selectAsset(id); list.append(button);
  }
}

async function selectAsset(id) {
  transform.detach(); clearChildPreview(); state.currentId=id; state.savedRecord=clone(state.calibration.assets[id] || identityRecord(state.censusById.get(id))); state.record=clone(state.savedRecord); state.selectedSocket=state.record.sockets.length?0:-1;
  const existingPack=state.calibration.packs[packOf(id)];state.packIsNew=!existingPack;state.savedPackRecord=clone(existingPack||{sourceUp:"+Y",sourceForward:"+Z",canonicalScale:1,structuralGrid:null});state.packRecord=clone(state.savedPackRecord);
  $("#assetId").textContent=id; populateRecordEditor(); renderAssetList(); updateChildAssets(); updateMateSelectors(); markDirty(); await loadCurrentView();
}

function populateRecordEditor() {
  const r=state.record; $("#admissionClass").value=r.admissionClass; $("#qaStatus").value=r.qaStatus; $("#category").value=r.category; $("#rootMaterial").value=r.rootMaterialFamily;
  populatePackEditor();
  setInputs('[data-vector="translation"]',r.preTransform.translation); setInputs('[data-vector="scale"]',r.preTransform.scale);
  const e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion(...r.preTransform.rotation),"XYZ"); setInputs('[data-vector="euler"]',[e.x,e.y,e.z].map(THREE.MathUtils.radToDeg));
  $("#scaleReason").value=r.scaleReason||""; $("#groundOffset").value=r.groundOffset; $("#notes").value=(r.notes||[]).join("\n");
  populateFootprintEditor();
  populateSocketEditor(); rebuildSocketList();
}
function populatePackEditor(){const p=state.packRecord;$("#packMode").textContent=state.packIsNew?"NEW census pack — packRecord will be added with the first asset save":"Existing pack — fields are read-only";$("#packMode").className=state.packIsNew?"status-bad":"status-good";$("#sourceUp").value=p.sourceUp;$("#sourceForward").value=p.sourceForward;$("#canonicalScale").value=p.canonicalScale;$("#structuralPack").checked=!!p.structuralGrid;$("#sourceModuleUnits").value=p.structuralGrid?.sourceModuleUnits||1;$("#targetWorldUnits").value=p.structuralGrid?.targetWorldUnits||p.canonicalScale;for(const el of $$("#packPanel input"))el.disabled=!state.packIsNew||el.id==="sourceUp"||el.id==="sourceForward";$("#structuralFields").style.display=p.structuralGrid?"block":"none";}
function updatePackFromInputs(){if(!state.packIsNew)return;state.packRecord={sourceUp:"+Y",sourceForward:"+Z",canonicalScale:Number($("#canonicalScale").value),structuralGrid:$("#structuralPack").checked?{sourceModuleUnits:Number($("#sourceModuleUnits").value),targetWorldUnits:Number($("#targetWorldUnits").value),orientationSteps:4,joinMode:"cell-orientation"}:null};populatePackEditor();markDirty();applyCalibrationPreview();rebuildOverlays();}
function setInputs(selector, values) { $$(selector+" input").forEach((input,index)=>input.value=round9(values[index]??0)); }
function readInputs(selector) { return $$(selector+" input").map((input)=>Number(input.value)); }
function footprintFromCurrent(){if(!state.model)return{center:[0,0],halfExtents:[.5,.5],yawRadians:0};const box=pieceLocalBounds(state.model,orientationGroup),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());return{center:[center.x,center.z],halfExtents:[Math.max(.001,size.x/2),Math.max(.001,size.z/2)],yawRadians:0};}
function populateFootprintEditor(){const enabled=!!state.record.footprintOverride,fp=state.record.footprintOverride||{center:[0,0],halfExtents:[.5,.5],yawRadians:0};$("#footprintOverrideEnabled").checked=enabled;$("#footprintFields").style.display=enabled?"block":"none";setInputs('[data-footprint-vector="center"]',fp.center);setInputs('[data-footprint-vector="halfExtents"]',fp.halfExtents);$("#footprintYaw").value=round9(THREE.MathUtils.radToDeg(fp.yawRadians));}
function updateRecordFromInputs() {
  const r=state.record; r.admissionClass=$("#admissionClass").value; r.qaStatus=$("#qaStatus").value; r.category=$("#category").value; r.rootMaterialFamily=$("#rootMaterial").value;
  r.preTransform.translation=readInputs('[data-vector="translation"]'); r.preTransform.scale=readInputs('[data-vector="scale"]');
  const deg=readInputs('[data-vector="euler"]'); r.preTransform.rotation=normalizeQuat(new THREE.Quaternion().setFromEuler(new THREE.Euler(...deg.map(THREE.MathUtils.degToRad),"XYZ")).toArray());
  r.scaleReason=$("#scaleReason").value.trim()||null; r.groundOffset=Number($("#groundOffset").value); r.notes=$("#notes").value.split("\n").filter(Boolean);
  r.footprintOverride=$("#footprintOverrideEnabled").checked?{center:readInputs('[data-footprint-vector="center"]'),halfExtents:readInputs('[data-footprint-vector="halfExtents"]'),yawRadians:THREE.MathUtils.degToRad(Number($("#footprintYaw").value))}:null;$("#footprintFields").style.display=r.footprintOverride?"block":"none";
  markDirty(); applyCalibrationPreview(); rebuildOverlays();
}

function rawUrl(entry) { return "/"+entry.path; }
function normalizedUrl(id) { return `/assets/models-normalized/${packOf(id)}/${slugOf(id)}.glb`; }
async function loadCurrentView() {
  setError(); setStatus(`loading ${state.view}…`); transform.detach();
  if (state.model) { orientationGroup.remove(state.model); disposeObject(state.model); state.model=null; }
  try {
    if (state.view==="raw") { state.modelUrl=rawUrl(currentCensus()); state.model=(await loader.loadAsync(state.modelUrl)).scene; }
    else if (state.view==="normalized") { state.modelUrl=normalizedUrl(); state.model=(await loader.loadAsync(state.modelUrl)).scene; }
    else { state.modelUrl=`loadDonorPiece(${packOf()}, ${slugOf()})`; state.model=await loadDonorPiece(packOf(),slugOf(),{seedKey:`workbench:${state.currentId}`}); }
    state.model.name=`${state.view}:${state.currentId}`; orientationGroup.add(state.model); $("#loadedUrl").textContent=state.modelUrl;
    state.model.traverse((object)=>{ if(object.isMesh){object.castShadow=true;object.receiveShadow=true;object.userData.__workbenchMaterial=object.material;} });
    applyCalibrationPreview(); buildHierarchy(); rebuildOverlays(); rebuildSocketVisuals(); fitCamera();
    showMaterialDiagnostic();
    setStatus(`${state.view} loaded`,true);
  } catch(error) { state.model=null; $("#loadedUrl").textContent=state.modelUrl||"—"; setError(`${state.view} unavailable: ${error.message}`); rebuildSocketVisuals(); setStatus(`${state.view} unavailable`,false); }
}
function matrixForRecord(record, includePackScale) {
  const q=new THREE.Quaternion(...record.preTransform.rotation), scale=new THREE.Vector3(...record.preTransform.scale);
  if (includePackScale) scale.multiplyScalar(state.packRecord?.canonicalScale || 1);
  const position=new THREE.Vector3(...record.preTransform.translation); position.y += record.groundOffset || 0;
  return new THREE.Matrix4().compose(position,q,scale);
}
function applyCalibrationPreview() {
  if (!state.model || !state.record) return;
  let matrix;
  if (state.view==="raw") matrix=matrixForRecord(state.record,true);
  else matrix=matrixForRecord(state.record,false).multiply(matrixForRecord(state.savedRecord,false).invert());
  matrix.decompose(state.model.position,state.model.quaternion,state.model.scale); state.model.updateMatrixWorld(true);
}
function fitCamera() {
  if (!state.model) return;
  const box=new THREE.Box3().setFromObject(state.model); if(state.overlays.humanScale)box.expandByObject(humanYardstick);if(box.isEmpty()) return;
  const size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3()); orbit.target.copy(center); orbit.distance=Math.max(size.length()*1.8,2); orbit.pitch=.48;orbit.yaw=.72;
}
function disposeObject(root) { root.traverse((o)=>{ if(o.geometry&&o.userData.__workbenchGenerated)o.geometry.dispose(); }); }

function buildHierarchy() {
  if (!state.model) return $("#hierarchy").textContent="—";
  const lines=[]; function visit(node,depth){lines.push(`${"  ".repeat(depth)}${node.name||node.type}${node.isMesh?" [mesh]":""}`); for(const child of node.children) visit(child,depth+1);} visit(state.model,0); $("#hierarchy").textContent=lines.join("\n");
}
function clearGenerated(ref) { if(ref){overlayGroup.remove(ref); ref.traverse?.((o)=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose?.();});} return null; }
function rebuildOverlays() {
  boxHelper=clearGenerated(boxHelper); footprintHelper=clearGenerated(footprintHelper); normalsHelper=clearGenerated(normalsHelper);
  if(moduleGrid){overlayGroup.remove(moduleGrid);moduleGrid.geometry.dispose();moduleGrid.material.dispose();moduleGrid=null;}
  if(groundPlane){overlayGroup.remove(groundPlane);groundPlane.geometry.dispose();groundPlane.material.dispose();groundPlane=null;}
  const grid=state.packRecord?.structuralGrid, span=grid?.targetWorldUnits || 0;
  if(span){moduleGrid=new THREE.GridHelper(40,Math.max(1,Math.round(40/span)),0x61b5aa,0x31544f);moduleGrid.name="overlay-module-grid";overlayGroup.add(moduleGrid);}
  groundPlane=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshBasicMaterial({color:0x322d36,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));groundPlane.rotation.x=-Math.PI/2;groundPlane.position.y=-.002;groundPlane.name="overlay-ground-plane";overlayGroup.add(groundPlane);
  if(state.model){
    const box=new THREE.Box3().setFromObject(state.model); boxHelper=new THREE.Box3Helper(box,0xffc360); boxHelper.name="overlay-aabb"; overlayGroup.add(boxHelper);
    const size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3()), fp=state.record.footprintOverride;
    const cx=fp?.center?.[0]??center.x, cz=fp?.center?.[1]??center.z, hx=fp?.halfExtents?.[0]??size.x/2, hz=fp?.halfExtents?.[1]??size.z/2;
    const shape=new THREE.Shape().moveTo(-hx,-hz).lineTo(hx,-hz).lineTo(hx,hz).lineTo(-hx,hz).lineTo(-hx,-hz);
    const geometry=new THREE.BufferGeometry().setFromPoints(shape.getPoints().map(p=>new THREE.Vector3(p.x,0,p.y)));
    footprintHelper=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x73e5c4})); footprintHelper.position.set(cx,.01,cz);footprintHelper.rotation.y=fp?.yawRadians||0;footprintHelper.name="overlay-footprint";overlayGroup.add(footprintHelper);
    normalsHelper=normalLines(state.model); if(normalsHelper)overlayGroup.add(normalsHelper);
    $("#boundsReadout").textContent=`AABB ${size.x.toFixed(3)} × ${size.y.toFixed(3)} × ${size.z.toFixed(3)}u · ground ${box.min.y.toFixed(3)}u`;
    const cell=grid?.targetWorldUnits||1; $("#occupancy").textContent=`${Math.max(1,Math.ceil(size.x/cell))} × ${Math.max(1,Math.ceil(size.z/cell))} ${grid?`${cell}u modules`:"cells"}`;
  }
  applyOverlayState();
}
function normalLines(root) {
  const positions=[]; root.updateMatrixWorld(true);
  root.traverse((mesh)=>{if(!mesh.isMesh||!mesh.geometry.attributes.position||!mesh.geometry.attributes.normal)return;const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal;for(let i=0;i<p.count;i+=Math.max(1,Math.ceil(p.count/1200))){const a=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);const b=new THREE.Vector3().fromBufferAttribute(n,i).transformDirection(mesh.matrixWorld).multiplyScalar(.08).add(a);positions.push(...a.toArray(),...b.toArray());}});
  if(!positions.length)return null;const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));const lines=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0x78b7ff}));lines.name="overlay-normals";return lines;
}
function applyOverlayState() {
  axes.visible=state.overlays.axes;unitGrid.visible=state.overlays.grid;humanYardstick.visible=state.overlays.humanScale;$("#humanScaleLegend").hidden=!state.overlays.humanScale;if(moduleGrid)moduleGrid.visible=state.overlays.module;if(groundPlane)groundPlane.visible=state.overlays.ground;if(boxHelper)boxHelper.visible=state.overlays.aabb;if(footprintHelper)footprintHelper.visible=state.overlays.footprint;if(normalsHelper)normalsHelper.visible=state.overlays.normals;$("#hierarchy").style.display=state.overlays.hierarchy?"block":"none";
  state.model?.traverse((object)=>{if(!object.isMesh)return;const material=object.userData.__workbenchMaterial;if(!material)return;if(!object.userData.__workbenchClone)object.userData.__workbenchClone=material.clone();const m=object.userData.__workbenchClone;m.wireframe=state.overlays.wireframe;m.side=state.overlays.backface?THREE.BackSide:THREE.FrontSide;m.needsUpdate=true;object.material=(state.overlays.wireframe||state.overlays.backface)?m:material;});
}

function rebuildSocketList() {
  const list=$("#socketList");list.textContent="";(state.record?.sockets||[]).forEach((socket,index)=>{const row=document.createElement("div");row.className="socket-row";const select=document.createElement("button");select.textContent=`${socket.id} · ${socket.type}`;select.onclick=()=>selectSocket(index);const remove=document.createElement("button");remove.textContent="×";remove.className="danger";remove.onclick=()=>deleteSocket(index);row.append(select,remove);list.append(row);});
}
function selectSocket(index) { state.selectedSocket=index; populateSocketEditor(); rebuildSocketVisuals(); }
function deleteSocket(index) { state.record.sockets.splice(index,1);state.selectedSocket=Math.min(index,state.record.sockets.length-1);transform.detach();rebuildSocketList();populateSocketEditor();rebuildSocketVisuals();updateMateSelectors();markDirty(); }
function populateSocketEditor() {
  const s=state.record?.sockets?.[state.selectedSocket], disabled=!s; $$("#socketEditor input,#socketEditor select").forEach(el=>el.disabled=disabled); if(!s)return;
  $("#socketId").value=s.id;$("#socketType").value=s.type;$("#mateRule").value=s.mateRule;$("#mateFamily").value=s.mateFamily;
  setInputs('[data-socket-vector="position"]',s.position);setInputs('[data-socket-vector="rotation"]',s.rotation);setInputs('[data-socket-vector="size"]',s.size);setInputs('[data-socket-vector="clearance"]',s.clearance.size);
}
function updateSocketFromInputs() {
  const s=state.record?.sockets?.[state.selectedSocket];if(!s)return;s.id=$("#socketId").value.trim();s.type=$("#socketType").value;s.mateRule=$("#mateRule").value;s.mateFamily=$("#mateFamily").value.trim();s.position=readInputs('[data-socket-vector="position"]');s.rotation=normalizeQuat(readInputs('[data-socket-vector="rotation"]'));s.size=readInputs('[data-socket-vector="size"]');s.clearance={shape:"box",size:readInputs('[data-socket-vector="clearance"]')};populateSocketEditor();rebuildSocketList();rebuildSocketVisuals();updateMateSelectors();markDirty();
}
function pieceLocalBounds(root, localRoot) {
  const box=new THREE.Box3().makeEmpty();if(!root||!localRoot)return box;localRoot.updateMatrixWorld(true);root.updateMatrixWorld(true);const inverse=localRoot.matrixWorld.clone().invert();
  root.traverse((mesh)=>{if(!mesh.isMesh||!mesh.geometry)return;if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();const source=mesh.geometry.boundingBox;if(!source||source.isEmpty())return;const matrix=inverse.clone().multiply(mesh.matrixWorld);for(const x of [source.min.x,source.max.x])for(const y of [source.min.y,source.max.y])for(const z of [source.min.z,source.max.z])box.expandByPoint(new THREE.Vector3(x,y,z).applyMatrix4(matrix));});
  return box;
}
function rotatedBoundsControl(){const root=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(4,2,1),new THREE.MeshBasicMaterial());root.rotation.y=.63;root.add(mesh);scene.add(root);root.updateMatrixWorld(true);const proper=pieceLocalBounds(mesh,root),world=new THREE.Box3().setFromObject(mesh),inverse=root.matrixWorld.clone().invert(),bad=new THREE.Box3(world.min.clone().applyMatrix4(inverse),world.max.clone().applyMatrix4(inverse));const result={proper:proper.getSize(new THREE.Vector3()).toArray(),mutated:bad.getSize(new THREE.Vector3()).toArray()};scene.remove(root);mesh.geometry.dispose();mesh.material.dispose();return result;}
function rebuildSocketVisuals(reattach=true) {
  transform.detach(); while(socketGroup.children.length){const o=socketGroup.children.pop();o.traverse((c)=>{c.geometry?.dispose?.();c.material?.dispose?.();});}
  (state.record?.sockets||[]).forEach((socket,index)=>{const group=new THREE.Group();group.name=`socket:${socket.id}`;group.position.fromArray(socket.position);group.quaternion.fromArray(socket.rotation).normalize();const axis=new THREE.AxesHelper(.4);axis.name="socket-axes";group.add(axis);const size=socket.size||[.1,.1,.1];const box=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)),new THREE.LineBasicMaterial({color:index===state.selectedSocket?0xffd06c:0xb877df}));box.name="socket-volume";group.add(box);socketGroup.add(group);});
  if(reattach&&state.selectedSocket>=0&&socketGroup.children[state.selectedSocket])transform.attach(socketGroup.children[state.selectedSocket]);
}

function snapSelectedSocket() {
  const socket=state.record?.sockets?.[state.selectedSocket], mode=$("#snapMode").value;if(!socket||mode==="none"||!state.model)return;
  const inverse=orientationGroup.matrixWorld.clone().invert(), current=new THREE.Vector3(...socket.position), box=pieceLocalBounds(state.model,orientationGroup);let snapped=current.clone();
  if(mode==="vertex") {let best=Infinity;state.model.updateMatrixWorld(true);state.model.traverse((mesh)=>{const p=mesh.geometry?.attributes?.position;if(!mesh.isMesh||!p)return;const m=inverse.clone().multiply(mesh.matrixWorld);for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m),d=v.distanceToSquared(current);if(d<best){best=d;snapped=v;}}});}
  else if(mode==="aabb") {let best=Infinity;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const v=new THREE.Vector3(x,y,z),d=v.distanceToSquared(current);if(d<best){best=d;snapped=v;}}}
  else if(mode==="face") {const candidates=[];for(const axis of ["x","y","z"])for(const side of ["min","max"]){const v=current.clone().clamp(box.min,box.max);v[axis]=box[side][axis];candidates.push(v);}snapped=candidates.sort((a,b)=>a.distanceToSquared(current)-b.distanceToSquared(current))[0];}
  else if(mode==="edge") {const edges=[];const mn=box.min,mx=box.max;for(const axis of ["x","y","z"]){const other=["x","y","z"].filter(v=>v!==axis);for(const a of [mn[other[0]],mx[other[0]]])for(const b of [mn[other[1]],mx[other[1]]]){const v=current.clone();v[other[0]]=a;v[other[1]]=b;v[axis]=THREE.MathUtils.clamp(v[axis],mn[axis],mx[axis]);edges.push(v);}}snapped=edges.sort((a,b)=>a.distanceToSquared(current)-b.distanceToSquared(current))[0];}
  socket.position=snapped.toArray().map(round9);populateSocketEditor();rebuildSocketVisuals();markDirty();
}

function updateChildAssets() {
  const select=$("#childAsset"), previous=select.value;select.textContent="";for(const [id,record] of Object.entries(state.calibration.assets)){if(id===state.currentId||!record.sockets?.length)continue;const option=document.createElement("option");option.value=id;option.textContent=id;select.append(option);}if([...select.options].some(o=>o.value===previous))select.value=previous;
}
function updateMateSelectors() {
  fillSocketSelect($("#hostSocket"),state.record?.sockets||[]);fillSocketSelect($("#childSocket"),state.childRecord?.sockets||[]);
}
function fillSocketSelect(select,sockets){const old=select.value;select.textContent="";sockets.forEach((s,i)=>{const option=document.createElement("option");option.value=String(i);option.textContent=`${s.id} · ${s.type}`;select.append(option);});if([...select.options].some(o=>o.value===old))select.value=old;}
async function loadChildPreview() {
  clearChildPreview();const id=$("#childAsset").value;if(!id)return;state.childId=id;state.childRecord=clone(state.calibration.assets[id]);try{state.childPreview=await loadDonorPiece(packOf(id),slugOf(id),{seedKey:`workbench-child:${id}`});childGroup.add(state.childPreview);state.childPreview.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.72;}});updateMateSelectors();showMaterialDiagnostic();}catch(error){setError(`child preview unavailable: ${error.message}`);}
}
function clearChildPreview(){if(state.childPreview){childGroup.remove(state.childPreview);disposeObject(state.childPreview);}state.childPreview=null;state.childRecord=null;state.childId=null;updateMateSelectors();}
function socketMatrix(socket){return new THREE.Matrix4().compose(new THREE.Vector3(...socket.position),new THREE.Quaternion(...socket.rotation).normalize(),new THREE.Vector3(1,1,1));}
function snappedChildMatrix(sweepRadians=0,exploded=0){const host=state.record.sockets[Number($("#hostSocket").value)],child=state.childRecord.sockets[Number($("#childSocket").value)];if(!host||!child)return null;orientationGroup.updateMatrixWorld(true);const hostWorld=orientationGroup.matrixWorld.clone().multiply(socketMatrix(host));const motion=new THREE.Matrix4().makeRotationY(sweepRadians);motion.setPosition(new THREE.Vector3(0,0,exploded));const mate=host.mateRule==="opposed-z"?new THREE.Matrix4().makeRotationY(Math.PI):new THREE.Matrix4();return hostWorld.multiply(motion).multiply(mate).multiply(socketMatrix(child).invert());}
function applyMatePreview(){if(!state.childPreview||!state.childRecord)return;const sweep=THREE.MathUtils.degToRad(Number($("#doorSweep").value)),exploded=Number($("#exploded").value),matrix=snappedChildMatrix(sweep,exploded);if(!matrix)return;matrix.decompose(state.childPreview.position,state.childPreview.quaternion,state.childPreview.scale);state.childPreview.updateMatrixWorld(true);measureMateError();}
function measureMateError(){const host=state.record.sockets[Number($("#hostSocket").value)],child=state.childRecord?.sockets?.[Number($("#childSocket").value)];if(!host||!child||!state.childPreview)return;orientationGroup.updateMatrixWorld(true);state.childPreview.updateMatrixWorld(true);const hostWorld=orientationGroup.matrixWorld.clone().multiply(socketMatrix(host)),actual=state.childPreview.matrixWorld.clone().multiply(socketMatrix(child));const expected=hostWorld.clone().multiply(host.mateRule==="opposed-z"?new THREE.Matrix4().makeRotationY(Math.PI):new THREE.Matrix4());const p1=new THREE.Vector3().setFromMatrixPosition(expected),p2=new THREE.Vector3().setFromMatrixPosition(actual),q1=new THREE.Quaternion().setFromRotationMatrix(expected),q2=new THREE.Quaternion().setFromRotationMatrix(actual);const position=p1.distanceTo(p2),angle=THREE.MathUtils.radToDeg(q1.angleTo(q2));$("#mateError").textContent=`position ${position.toFixed(6)}u · angle ${angle.toFixed(4)}°`;$("#mateError").className=position<=.005&&angle<=.5?"status-good":"status-bad";$("#mateError").dataset.positionError=String(position);$("#mateError").dataset.angularError=String(angle);}

async function validateAndSave() {
  setStatus("validating…");const payload={assetId:state.currentId,record:state.record};if(state.packIsNew)payload.packRecord=state.packRecord;const validation=await fetch("/api/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const vr=await validation.json();if(!validation.ok){setStatus(`validation failed: ${(vr.errors||[vr.error]).join("; ")}`,false);return;}
  const savePayload={expectedSourceSha256:state.savedRecord.sourceSha256,record:state.record};if(state.packIsNew)savePayload.packRecord=state.packRecord;const response=await fetch(`/api/calibration/${encodeURIComponent(state.currentId)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(savePayload)});const body=await response.json();if(!response.ok){setStatus(`save failed: ${body.error||(body.errors||[]).join("; ")}`,false);return;}state.calibration.assets[state.currentId]=clone(state.record);if(state.packIsNew)state.calibration.packs[packOf()]=clone(state.packRecord);state.packIsNew=false;state.savedRecord=clone(state.record);state.savedPackRecord=clone(state.packRecord);populatePackEditor();markDirty();renderAssetList();updateChildAssets();setStatus("saved atomically",true);
}
function exportSnapshot(){renderer.render(scene,camera);renderer.domElement.toBlob((blob)=>{if(!blob)return;const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`kenney-${packOf()}-${slugOf()}-${state.view}-o${state.orientationIndex}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},"image/png");}

function bind() {
  for(const id of ["assetSearch","assetFilter","qaFilter"])$("#"+id).addEventListener("input",renderAssetList);
  $("#viewModes").addEventListener("click",async(event)=>{const view=event.target.dataset.view;if(!view)return;state.view=view;$$('#viewModes button').forEach(b=>b.classList.toggle("active",b.dataset.view===view));await loadCurrentView();});
  $$('[data-overlay]').forEach(input=>input.onchange=()=>{state.overlays[input.dataset.overlay]=input.checked;applyOverlayState();});
  $$('[data-o]').forEach(button=>button.onclick=()=>{state.orientationIndex=Number(button.dataset.o);orientationGroup.rotation.y=state.orientationIndex*Math.PI/2;orientationGroup.updateMatrixWorld(true);$$('[data-o]').forEach(b=>b.classList.toggle("active",b===button));rebuildOverlays();});
  for(const selector of ['#admissionClass','#qaStatus','#category','#rootMaterial','#scaleReason','#groundOffset','#notes','[data-vector="translation"] input','[data-vector="euler"] input','[data-vector="scale"] input','[data-footprint-vector] input','#footprintYaw'])$$(selector).forEach(el=>el.addEventListener("input",updateRecordFromInputs));
  $("#footprintOverrideEnabled").onchange=()=>{if($("#footprintOverrideEnabled").checked&&!state.record.footprintOverride){const fp=footprintFromCurrent();setInputs('[data-footprint-vector="center"]',fp.center);setInputs('[data-footprint-vector="halfExtents"]',fp.halfExtents);$("#footprintYaw").value=0;}updateRecordFromInputs();};
  for(const selector of ['#canonicalScale','#structuralPack','#sourceModuleUnits','#targetWorldUnits'])$(selector).addEventListener("input",updatePackFromInputs);
  for(const selector of ['#socketId','#socketType','#mateRule','#mateFamily','[data-socket-vector] input'])$$(selector).forEach(el=>el.addEventListener("change",updateSocketFromInputs));
  $("#addSocket").onclick=()=>{state.record.sockets.push(socketDefault(state.record.sockets.length));state.selectedSocket=state.record.sockets.length-1;rebuildSocketList();populateSocketEditor();rebuildSocketVisuals();updateMateSelectors();markDirty();};
  $("#snapSocket").onclick=snapSelectedSocket;$("#gizmoTranslate").onclick=()=>transform.setMode("translate");$("#gizmoRotate").onclick=()=>transform.setMode("rotate");
  $("#childAsset").onchange=loadChildPreview;$("#hostSocket").onchange=measureMateError;$("#childSocket").onchange=measureMateError;$("#snapMate").onclick=()=>{if(!state.childPreview)loadChildPreview().then(applyMatePreview);else applyMatePreview();};
  $("#exploded").oninput=applyMatePreview;$("#doorSweep").oninput=()=>{$("#doorSweepValue").textContent=$("#doorSweep").value+"°";applyMatePreview();};
  $("#resetAsset").onclick=()=>{state.record=clone(state.savedRecord);state.packRecord=clone(state.savedPackRecord);populateRecordEditor();applyCalibrationPreview();rebuildOverlays();rebuildSocketVisuals();markDirty();setStatus("asset reset");};
  $("#saveAsset").onclick=()=>validateAndSave().catch(error=>setStatus(error.message,false));$("#exportSnapshot").onclick=exportSnapshot;
}
function resize(){const rect=canvas.getBoundingClientRect();const w=Math.max(1,Math.floor(rect.width)),h=Math.max(1,Math.floor(rect.height));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function frame(){resize();const cp=Math.cos(orbit.pitch);camera.position.set(orbit.target.x+Math.sin(orbit.yaw)*cp*orbit.distance,orbit.target.y+Math.sin(orbit.pitch)*orbit.distance,orbit.target.z+Math.cos(orbit.yaw)*cp*orbit.distance);camera.lookAt(orbit.target);renderer.render(scene,camera);requestAnimationFrame(frame);}
async function boot(){bind();const [calibration,census,admission]=await Promise.all([fetch("/api/calibration").then(r=>r.json()),fetch("/dev/model-foundry/kenney-census.json").then(r=>r.json()),fetch("/dev/model-foundry/kenney-admission-manifest.json").then(r=>r.json())]);state.calibration=calibration;state.census=census;state.candidates=new Set((admission.candidates||[]).map(assetIdOf));for(const entry of census.assets)state.censusById.set(assetIdOf(entry),entry);for(const [id,record] of Object.entries(calibration.assets)){if(state.censusById.has(id))continue;const [pack,slug]=id.split("/");const entry={pack,name:`${slug}.glb`,path:`assets/models/${pack}/${slug}.glb`,sha256:record.sourceSha256,role:record.category,family:"normalized",normalizedOnly:true};census.assets.push(entry);state.censusById.set(id,entry);}renderAssetList();const first=state.censusById.has("kenney-mini-dungeon/gate")?"kenney-mini-dungeon/gate":Object.keys(calibration.assets)[0];await selectAsset(first);window.__kenneyWorkbench={state,selectAsset,loadCurrentView,snapMate:applyMatePreview,pieceLocalBounds,rotatedBoundsControl,humanYardstickMetrics,renderer,scene,camera};window.__kenneyWorkbenchReady=true;setStatus("ready",true);}

frame();boot().catch(error=>{setError(error.stack||error.message);setStatus("boot failed",false);window.__kenneyWorkbenchReady=false;});
