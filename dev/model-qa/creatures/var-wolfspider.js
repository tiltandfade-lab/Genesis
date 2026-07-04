/* dev/model-qa/creatures/var-wolfspider.js — WOLF SPIDER kin-variant (sub-nearest doctrine).
   COPIES spider.js: all coordinates+radii scaled x0.8, carapace palette swapped from purple-ish
   to mottled brown-tan, legs thickened slightly (radius x1.15). Everything else identical.
   Imported by var-wolfspider-probe.html. */
import { V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

const k = 0.8;                                   // body scale
const lr = 1.15;                                 // leg radius thickener
const KV = (x,y,z)=>V(x*k, y*k, z*k);

export function buildWolfSpider(){
  const P = {
    chitin:0x6a5a42, chitinDk:0x453a2a, chitinLt:0x8c7a5c,   // mottled brown-tan carapace
    violet:0x7a6a48, violetDk:0x554730, fang:0x191418,        // tan abdomen top (was violet)
    eyeSock:0x2a1c10, eyeGlow:0xc79a4e, disc:0x4a4038, discTop:0x585047,   // amber eyeshine
  };
  const CEPH = V(0*k, 0.30*k, 0.15*k);
  const bodyRx = 0.20*k, bodyRz = 0.22*k, hipY = 0.27*k;

  /* cephalothorax (carapace) */
  stack([
    {y:0.20*k, rx:0.14*k, rz:0.17*k, cz:CEPH.z, hex:P.chitinDk},
    {y:0.27*k, rx:0.21*k, rz:0.25*k, cz:CEPH.z, hex:P.chitin},
    {y:0.33*k, rx:0.20*k, rz:0.24*k, cz:CEPH.z, hex:P.chitin},
    {y:0.39*k, rx:0.12*k, rz:0.16*k, cz:CEPH.z, hex:P.chitinDk},
  ], 8, {capTop:{hex:P.chitinDk, lift:0.02*k}, capBot:{hex:P.chitinDk}});

  /* abdomen */
  stack([
    {y:0.18*k, rx:0.10*k, rz:0.13*k, cz:-0.30*k, hex:P.chitinDk},
    {y:0.30*k, rx:0.26*k, rz:0.33*k, cz:-0.30*k, hex:P.chitin},
    {y:0.42*k, rx:0.32*k, rz:0.42*k, cz:-0.31*k, hex:P.chitin},
    {y:0.52*k, rx:0.29*k, rz:0.38*k, cz:-0.31*k, hex:P.violet},
    {y:0.60*k, rx:0.19*k, rz:0.26*k, cz:-0.30*k, hex:P.violetDk},
  ], 8, {capTop:{hex:P.violetDk, lift:0.03*k}, capBot:{hex:P.chitinDk}});

  /* pedicel */
  tube(V(0,0.29*k,-0.02*k), V(0,0.34*k,-0.17*k), 0.10*k, 0.11*k, 6, P.chitinDk);

  /* 8 legs — thickened (radius x1.15) */
  const AZ = [45, 75, 110, 140];
  for(const s of [-1,1]){
    for(let kk=0;kk<4;kk++){
      const a=AZ[kk]*Math.PI/180, d=V(s*Math.sin(a),0,Math.cos(a));
      const H=V(d.x*bodyRx, hipY, CEPH.z + d.z*bodyRz);
      const K=V(H.x + d.x*0.17*k, 0.64*k, H.z + d.z*0.17*k);
      const F=V(H.x + d.x*0.50*k, 0.02*k, H.z + d.z*0.50*k);
      tube(H,K,0.044*k*lr,0.036*k*lr,6,P.chitin);
      tube(K,F,0.038*k*lr,0.012*k*lr,6,P.chitinLt, {capA:{hex:P.chitinLt}, capB:{hex:P.fang, lift:0.01*k}});
      quad(V(K.x-0.045*k,K.y-0.02*k,K.z), V(K.x+0.045*k,K.y-0.02*k,K.z), V(K.x+0.045*k,K.y+0.05*k,K.z), V(K.x-0.045*k,K.y+0.05*k,K.z), P.chitinDk, 0.05);
    }
  }

  /* pedipalps + chelicerae */
  for(const s of [-1,1]){
    tube(V(s*0.05*k,0.24*k,0.30*k), V(s*0.11*k,0.13*k,0.44*k), 0.030*k, 0.018*k, 6, P.chitin);
    tube(V(s*0.05*k,0.21*k,0.29*k), V(s*0.055*k,0.06*k,0.33*k), 0.026*k, 0.009*k, 6, P.chitinDk, {capB:{hex:P.fang}});
  }

  /* eye cluster */
  const dot=(x,y,z,r,hex)=>quad(V(x-r,y-r,z), V(x+r,y-r,z), V(x+r,y+r,z), V(x-r,y+r,z), hex, 0.0);
  dot(0, 0.35*k, 0.315*k, 0.075*k, P.eyeSock);
  for(const [x,y,r] of [[-0.045*k,0.375*k,0.018*k],[0.045*k,0.375*k,0.018*k],[-0.10*k,0.36*k,0.014*k],[0.10*k,0.36*k,0.014*k],
                        [-0.05*k,0.33*k,0.013*k],[0.05*k,0.33*k,0.013*k]]) dot(x, y, 0.322*k, r, P.eyeGlow);

  /* base disc (scaled x0.8) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.74*k, 0.74*k, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.71*k, 0.71*k, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
