/* dev/model-qa/creatures/spider.js — the giant-spider landmark table (hard-shape probe).
   The worst case for the old anchor system: 8 legs radiating from one core. Here every leg hip is
   placed ON the carapace surface, so legs meet the body by construction — no anchor resolver.
   Imported by both spider-probe.html (render) and export-obj.mjs (Blender export). */
import { V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildSpider(){
  const P = {
    chitin:0x4a5a6b, chitinDk:0x333f4c, chitinLt:0x6f7d8b,
    violet:0x6a5578, violetDk:0x4a3c55, fang:0x191418,
    eyeSock:0x241030, eyeGlow:0xa565bd, disc:0x4a4038, discTop:0x585047,
  };
  const CEPH = V(0, 0.30, 0.15);              /* cephalothorax center (carries legs + face) */
  const bodyRx = 0.20, bodyRz = 0.22, hipY = 0.27;

  /* cephalothorax (carapace) */
  stack([
    {y:0.20, rx:0.14, rz:0.17, cz:CEPH.z, hex:P.chitinDk},
    {y:0.27, rx:0.21, rz:0.25, cz:CEPH.z, hex:P.chitin},
    {y:0.33, rx:0.20, rz:0.24, cz:CEPH.z, hex:P.chitin},
    {y:0.39, rx:0.12, rz:0.16, cz:CEPH.z, hex:P.chitinDk},
  ], 8, {capTop:{hex:P.chitinDk, lift:0.02}, capBot:{hex:P.chitinDk}});

  /* abdomen (raised bulb behind, violet-topped) */
  stack([
    {y:0.18, rx:0.10, rz:0.13, cz:-0.30, hex:P.chitinDk},
    {y:0.30, rx:0.26, rz:0.33, cz:-0.30, hex:P.chitin},
    {y:0.42, rx:0.32, rz:0.42, cz:-0.31, hex:P.chitin},
    {y:0.52, rx:0.29, rz:0.38, cz:-0.31, hex:P.violet},
    {y:0.60, rx:0.19, rz:0.26, cz:-0.30, hex:P.violetDk},
  ], 8, {capTop:{hex:P.violetDk, lift:0.03}, capBot:{hex:P.chitinDk}});

  /* pedicel (waist connecting carapace→abdomen) */
  tube(V(0,0.29,-0.02), V(0,0.34,-0.17), 0.10, 0.11, 6, P.chitinDk);

  /* 8 legs: hip ON the carapace → SHARP high knee → foot planted */
  const AZ = [45, 75, 110, 140];
  for(const s of [-1,1]){
    for(let k=0;k<4;k++){
      const a=AZ[k]*Math.PI/180, d=V(s*Math.sin(a),0,Math.cos(a));
      const H=V(d.x*bodyRx, hipY, CEPH.z + d.z*bodyRz);
      const K=V(H.x + d.x*0.17, 0.64, H.z + d.z*0.17);
      const F=V(H.x + d.x*0.50, 0.02, H.z + d.z*0.50);
      tube(H,K,0.044,0.036,6,P.chitin);
      tube(K,F,0.038,0.012,6,P.chitinLt, {capA:{hex:P.chitinLt}, capB:{hex:P.fang, lift:0.01}});
      quad(V(K.x-0.045,K.y-0.02,K.z), V(K.x+0.045,K.y-0.02,K.z), V(K.x+0.045,K.y+0.05,K.z), V(K.x-0.045,K.y+0.05,K.z), P.chitinDk, 0.05);
    }
  }

  /* pedipalps + chelicerae (frame the face) */
  for(const s of [-1,1]){
    tube(V(s*0.05,0.24,0.30), V(s*0.11,0.13,0.44), 0.030, 0.018, 6, P.chitin);
    tube(V(s*0.05,0.21,0.29), V(s*0.055,0.06,0.33), 0.026, 0.009, 6, P.chitinDk, {capB:{hex:P.fang}});
  }

  /* eye cluster (front-top of carapace) */
  const dot=(x,y,z,r,hex)=>quad(V(x-r,y-r,z), V(x+r,y-r,z), V(x+r,y+r,z), V(x-r,y+r,z), hex, 0.0);
  dot(0, 0.35, 0.315, 0.075, P.eyeSock);
  for(const [x,y,r] of [[-0.045,0.375,0.018],[0.045,0.375,0.018],[-0.10,0.36,0.014],[0.10,0.36,0.014],
                        [-0.05,0.33,0.013],[0.05,0.33,0.013]]) dot(x, y, 0.322, r, P.eyeGlow);

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.74, 0.74, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.71, 0.71, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
