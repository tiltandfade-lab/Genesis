/* dev/model-qa/creatures/rlm-barbed-kill-zone-tangle.js — Barbed Kill-Zone Tangle (theater, Medium, CR 1).
   A thorned mass of coiled wire that snags a boot then pulls. Whole-object grammar: a nested tangle
   of coiled tube loops built from a single stack of landmark coils, bristling with short barb spikes,
   plus one longer questing tendril that reads as the "snag" gesture. VS-desaturated rusted-wire palette
   (dull iron, dried rust bloom, dark oil-black kinks) — no organic tissue, no eyes, pure hostile object.
   Medium size disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBarbedKillZoneTangle(){
  const P = {
    wire:0x4a463c, wireDk:0x322f28, wireLt:0x615c4e,
    rust:0x6b4430, rustDk:0x452c1f,
    oil:0x1c1a16, barb:0x25221c,
    disc:0x3a352c, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — a low coiled mass, center near origin, rising to a snarled crown. ---------- */
  const baseY = 0.06;
  const S = {
    coreLo: V(0, baseY, 0),
    coreMid: V(0, baseY+0.16, 0.02),
    coreHi: V(0.02, baseY+0.30, -0.02),
    crown: V(0, baseY+0.42, 0.0),
  };

  /* ---------- CORE COIL MASS — several overlapping ring-loops of wire stacked/twisted around
     the core landmarks, reading as a snarled ball of barbed wire sitting low on the ground. ---------- */
  const loopCount = 7;
  for(let i=0;i<loopCount;i++){
    const t = i/(loopCount-1);
    const y = baseY + 0.04 + t*0.34;
    const rr = 0.30 - t*0.10;
    const tilt = (i%2===0) ? 1 : -1;
    const cx = Math.sin(i*1.7)*0.06;
    const cz = Math.cos(i*1.3)*0.06;
    const axis = new THREE.Vector3(0.15*tilt, 1, 0.12*Math.sin(i)).normalize();
    const r1 = ring(V(cx,y,cz), axis, rr, rr*0.82, 10, i*0.4);
    const r2 = ring(V(cx,y+0.05,cz), axis, rr*0.90, rr*0.74, 10, i*0.4+0.5);
    stitch([r1,r2], ()=> (i%3===0?P.rust:(i%2===0?P.wire:P.wireDk)));
  }

  /* ---------- BARBS — short spike pairs jutting out radially all over the tangle, the read-at-a-
     glance "thorn" silhouette. ---------- */
  {
    const barbSpots = [
      [0.28,baseY+0.10,0.05],[-0.26,baseY+0.14,-0.08],[0.10,baseY+0.22,0.24],
      [-0.14,baseY+0.28,-0.20],[0.22,baseY+0.34,-0.10],[-0.22,baseY+0.20,0.18],
      [0.02,baseY+0.40,0.06],[0.30,baseY+0.24,-0.18],[-0.30,baseY+0.08,0.10],
      [0.06,baseY+0.06,-0.28],[-0.06,baseY+0.36,0.14],[0.18,baseY+0.08,0.30],
    ];
    for(const [x,y,z] of barbSpots){
      const base = V(x,y,z);
      const outDir = new THREE.Vector3(x,0,z).normalize();
      if(outDir.lengthSq()===0) outDir.set(1,0,0);
      const tip = V(x+outDir.x*0.10, y+0.03, z+outDir.z*0.10);
      tube(base, tip, 0.018, 0.003, 4, P.barb, {capB:{hex:P.oil, lift:0.002}});
      // a crossing barb-pair thorn
      const tip2 = V(x-outDir.z*0.07, y-0.02, z+outDir.x*0.07);
      tube(base, tip2, 0.014, 0.003, 4, P.barb, {capB:{hex:P.oil, lift:0.002}});
    }
  }

  /* ---------- THE SNAG TENDRIL — one longer questing loop of wire reaching out low, the piece that
     "snags a boot" — a single loft arcing out from the mass then curling back. ---------- */
  {
    const q0 = V(0.02, baseY+0.05, 0.02);
    const q1 = V(0.20, baseY+0.03, 0.30);
    const q2 = V(0.34, baseY+0.10, 0.52);
    const q3 = V(0.30, baseY+0.22, 0.66);
    const q4 = V(0.14, baseY+0.28, 0.62);
    tube(q0,q1, 0.045, 0.036, 7, P.wire, {phase:Math.PI/7});
    tube(q1,q2, 0.036, 0.026, 7, P.rust, {phase:Math.PI/7});
    tube(q2,q3, 0.026, 0.018, 7, P.wire, {phase:Math.PI/7});
    tube(q3,q4, 0.018, 0.010, 6, P.wireDk, {phase:Math.PI/6, capB:{hex:P.oil, lift:0.006}});
    // barbs along the questing tendril
    for(const [p,d] of [[q1,0.06],[q2,0.07],[q3,0.05]]){
      const t1 = V(p.x+d, p.y+0.03, p.z);
      tube(p, t1, 0.012, 0.003, 4, P.barb);
      const t2 = V(p.x-d*0.4, p.y+0.05, p.z+d*0.4);
      tube(p, t2, 0.010, 0.003, 4, P.barb);
    }
  }

  /* ---------- rust-bloom patches on the mass ---------- */
  {
    quad(V(-0.10,baseY+0.10,0.20), V(0.06,baseY+0.10,0.22), V(0.04,baseY+0.22,0.10), V(-0.12,baseY+0.22,0.08), P.rustDk, 0.06);
    quad(V(0.02,baseY+0.02,-0.20), V(0.16,baseY+0.02,-0.18), V(0.14,baseY+0.16,-0.24), V(0,baseY+0.16,-0.26), P.rust, 0.06);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
