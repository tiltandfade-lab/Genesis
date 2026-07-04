/* dev/model-qa/probe-lib.js — the WHOLE-OBJECT primitive library (2026-07-03 strategy probe).
   The reusable craft investment the whole-object approach rests on: every creature is authored
   as a landmark table calling these primitives, which write geometry STRAIGHT into one merged
   model frame. There is no anchor resolver and no part-object transform — so nothing can float
   or land 90° wrong (the bug class the old grammar produced). Improving a primitive here (a
   better `tube`, a rounder `stack`) upgrades every creature at once.

   ES module (like theater-parts.js). A probe page imports {V, quad, tube, stack, ring, stitch,
   capFan, resetGeom, mountSheet} and does its authoring between resetGeom() and mountSheet(). */
/* Relative (not bare 'three') so the SAME module loads in the browser AND in Node (the OBJ
   exporter) — Node has no importmap. WebGLRenderer is only touched inside mountSheet(), which
   the exporter never calls, so importing the whole module in Node is DOM-safe. */
import * as THREE from '../../vendor/three/three.module.js';
export { THREE };

/* ---------- deterministic per-quad texel jitter (stable screenshots) ---------- */
let jseed = 7;
export function resetJitter(s = 7){ jseed = s >>> 0; }
function jrand(){ jseed = (jseed * 1664525 + 1013904223) >>> 0; return (jseed >>> 8) / 16777216; }

/* ---------- the quad-soup buffers: everything reduces to quad() ---------- */
let POS = [], COL = [], CHAN = [];
/* P1' MATERIAL CHANNELS (docs/P1-WIRING.md §2.2/§2.3): a creature module may register its own
   hex->channel-name lookup once via setChannels(), then every quad() call whose hex matches gets
   that channel's byte code recorded per TRI (one byte per tri, matching COL's "constant per tri"
   convention). An untagged tri (no match / no map registered) records 0 ("" — the classifier,
   ps1-sheet.html's matBucket generalized in theater-boot, decides at render time). Zero-touch
   back-compat: a module that never calls setChannels() gets an all-0 CHAN array, byte-identical to
   its pre-P1' output on the POS/COL buffers (CHAN is purely additive). */
export const CHANNEL_KEYS = ["", "skin", "cloth", "leather", "bone", "metal",
  "scale", "fur", "wood", "stone", "glass", "glow"];
let channelMap = null; // hex(number) -> channel name, set by the current module via setChannels()
export function setChannels(map){
  channelMap = {};
  if(map){
    Object.keys(map).forEach(function(hexKey){
      const hex = (typeof hexKey === "number") ? hexKey : parseInt(hexKey, 10);
      channelMap[hex] = map[hexKey];
    });
  }
}
function channelByteFor(hex){
  if(!channelMap) return 0;
  const name = channelMap[hex];
  if(!name) return 0;
  const idx = CHANNEL_KEYS.indexOf(name);
  return idx > 0 ? idx : 0;
}
export function resetGeom(){ POS = []; COL = []; CHAN = []; channelMap = null; resetJitter(); }
export function getBuffers(){ return { POS, COL, CHAN: Uint8Array.from(CHAN) }; }   /* the OBJ exporter reads these post-authoring */
const C = new THREE.Color();
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
function pushTri(a, b, c, col, chanByte){ POS.push(a.x,a.y,a.z, b.x,b.y,b.z, c.x,c.y,c.z); for(let i=0;i<3;i++) COL.push(col.r,col.g,col.b); CHAN.push(chanByte); }
export function quad(a, b, c, d, hex, jitter = 0.07){
  C.set(hex); const j = 1 + (jrand()*2-1)*jitter; C.multiplyScalar(j);
  const col = C.clone();
  const chanByte = channelByteFor(typeof hex === "number" ? hex : (hex && hex.getHex ? hex.getHex() : 0));
  pushTri(a,b,c,col,chanByte); pushTri(a,c,d,col,chanByte);
}

/* ring of n points ⊥ to `axis`, centered `c`, radii rx (u-dir) / rz (v-dir).
   CONVENTION NOTE (the lesson from the humanoid head bug): for a vertical axis (+y) the
   FRONT (+z) vertices are indices 1 and 2 at the default phase π/n; index 0 is front-left.
   Author faces/eyes/noses against that, or use frontVerts() below. */
export function ring(c, axis, rx, rz, n, phase = 0){
  const up = Math.abs(axis.y) > 0.93 ? V(0,0,1) : V(0,1,0);
  const u = new THREE.Vector3().crossVectors(up, axis).normalize();
  const v = new THREE.Vector3().crossVectors(axis, u).normalize();
  const pts = [];
  for(let i=0;i<n;i++){
    const t = phase + (i/n) * Math.PI*2;
    pts.push(V(c.x + u.x*Math.cos(t)*rx + v.x*Math.sin(t)*rz,
               c.y + u.y*Math.cos(t)*rx + v.y*Math.sin(t)*rz,
               c.z + u.z*Math.cos(t)*rx + v.z*Math.sin(t)*rz));
  }
  return pts;
}
export function stitch(rings, colFn, skip){
  const n = rings[0].length;
  for(let b=0;b<rings.length-1;b++){
    for(let i=0;i<n;i++){
      if(skip && skip[b] && skip[b].includes(i)) continue;
      const i2 = (i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], colFn(b,i));
    }
  }
}
export function capFan(rng, apex, hex, flip = false){
  const n = rng.length;
  for(let i=0;i<n;i++){ const i2=(i+1)%n;
    C.set(hex); const j=1+(jrand()*2-1)*0.07; C.multiplyScalar(j);
    flip ? pushTri(rng[i2], rng[i], apex, C.clone()) : pushTri(rng[i], rng[i2], apex, C.clone());
  }
}
/* vertical stack of bands = [{y, rx, rz?, cx?, cz?, hex}] — torso/head/boot/abdomen workhorse */
export function stack(bands, n, opts = {}){
  const xf = opts.xform || (p=>p);
  const rings = bands.map(b => ring(V(b.cx||0, b.y, b.cz||0), V(0,1,0), b.rx, (b.rz??b.rx), n, opts.phase ?? Math.PI/n).map(xf));
  stitch(rings, (b)=> bands[b].hex, opts.skip);
  if(opts.capTop) capFan(rings.at(-1), xf(V(bands.at(-1).cx||0, bands.at(-1).y+(opts.capTop.lift||0.02), bands.at(-1).cz||0)), opts.capTop.hex||bands.at(-1).hex);
  if(opts.capBot) capFan(rings[0], xf(V(bands[0].cx||0, bands[0].y-(opts.capBot.lift||0.02), bands[0].cz||0)), opts.capBot.hex||bands[0].hex, true);
  return rings;
}
/* limb / leg segment: ring ⊥ (b-a) at each end, stitched. capA/capB close the ends. */
export function tube(a, b, ra, rb, n, hex, opts = {}){
  const axis = new THREE.Vector3().subVectors(b,a).normalize();
  const r1 = ring(a, axis, ra, opts.raz??ra, n, opts.phase||0);
  const r2 = ring(b, axis, rb, opts.rbz??rb, n, opts.phase||0);
  stitch([r1,r2], ()=> hex);
  if(opts.capB) capFan(r2, V(b.x+axis.x*(opts.capB.lift||0.02), b.y+axis.y*(opts.capB.lift||0.02), b.z+axis.z*(opts.capB.lift||0.02)), opts.capB.hex||hex);
  if(opts.capA) capFan(r1, V(a.x-axis.x*0.02, a.y-axis.y*0.02, a.z-axis.z*0.02), opts.capA.hex||hex, true);
  return {r1, r2, axis};
}
/* an ellipsoid-ish blob from stacked rings between yBot..yTop — the bulbous-abdomen / ooze helper */
export function blob(cx, cy, cz, rx, ry, rz, hex, n = 8, bands = 5){
  const rings = [];
  for(let k=0;k<=bands;k++){
    const t = k/bands, ang = t*Math.PI, yy = cy + ry*(-Math.cos(ang));
    const rr = Math.sin(ang);
    rings.push(ring(V(cx,yy,cz), V(0,1,0), rx*rr+0.0001, rz*rr+0.0001, n, Math.PI/n));
  }
  stitch(rings, ()=> hex);
  return rings;
}

/* ================= the 5-panel turnaround sheet harness ================= */
/* auto-frames from the geometry bbox (no per-creature halfH tuning): big game-dimetric panel
   left, 4 turnarounds (front / three-quarter / side / back) in a 2×2 on the right. */
export function mountSheet(canvas, statEl, saveBtn, statText, opts = {}){
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(POS, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(COL, 3));
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  const bb = geo.boundingBox, ctr = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3());
  const reach = Math.max(sz.x, sz.y, sz.z) * 0.5;

  const figure = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({vertexColors:true, flatShading:true}));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x171310);
  scene.add(figure);
  scene.add(new THREE.HemisphereLight(0xcab08a, 0x2a241e, 0.95));
  const key = new THREE.DirectionalLight(0xffe0b0, 1.05); key.position.set(2.2, 3.0, 1.6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8090a0, 0.40); rim.position.set(-2.0, 1.4, -2.2); scene.add(rim);

  const board = new THREE.Group();
  const tile = Math.max(0.6, reach*0.95);
  const g = new THREE.PlaneGeometry(tile*0.98, tile*0.98);
  for(let i=-1;i<=1;i++) for(let j=-1;j<=1;j++){
    const m = new THREE.MeshLambertMaterial({color:((i+j)&1)?0x7d6142:0x54402c});
    const t = new THREE.Mesh(g, m); t.rotation.x = -Math.PI/2; t.position.set(i*tile, bb.min.y-0.004, j*tile); board.add(t);
  }
  scene.add(board);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);
  const cy = ctr.y;
  function cam(yawDeg, elevDeg, pad){
    const c = new THREE.OrthographicCamera(-1,1,1,-1,0.1,80);
    const yaw=yawDeg*Math.PI/180, el=elevDeg*Math.PI/180, d=20;
    c.position.set(Math.sin(yaw)*Math.cos(el)*d, Math.sin(el)*d+cy, Math.cos(yaw)*Math.cos(el)*d);
    c.lookAt(0, cy, 0); c._h = reach*pad; return c;
  }
  const PANELS = [
    {x:0,   y:0,   w:640, h:820, cam:cam(45,35,1.35), game:true},
    {x:640, y:410, w:320, h:410, cam:cam(0,  8,1.55)},
    {x:960, y:410, w:320, h:410, cam:cam(35, 8,1.55)},
    {x:640, y:0,   w:320, h:410, cam:cam(90, 8,1.55)},
    {x:960, y:0,   w:320, h:410, cam:cam(180,8,1.55)},
  ];
  renderer.setScissorTest(true);
  for(const p of PANELS){
    const asp=p.w/p.h, hh=p.cam._h;
    p.cam.left=-hh*asp; p.cam.right=hh*asp; p.cam.top=hh; p.cam.bottom=-hh; p.cam.updateProjectionMatrix();
    board.visible = !!p.game;
    renderer.setViewport(p.x,p.y,p.w,p.h); renderer.setScissor(p.x,p.y,p.w,p.h);
    renderer.render(scene, p.cam);
  }
  if(statEl) statEl.textContent = `${(POS.length/9)|0} tris · ${statText}`;
  if(saveBtn) saveBtn.onclick = ()=>{ const a=document.createElement('a'); a.download=(opts.name||'probe')+'.png'; a.href=canvas.toDataURL('image/png'); a.click(); };
  return {tris:(POS.length/9)|0};
}
