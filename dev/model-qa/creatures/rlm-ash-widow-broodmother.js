/* dev/model-qa/creatures/rlm-ash-widow-broodmother.js — ASH-WIDOW BROODMOTHER (ash realm, Large,
   CR 3). Read: a reactor-dome spider broodmother — a swollen ash-grey abdomen ridged like a
   containment dome, eight splayed legs in a wide low sprawl, a smaller cephalothorax up front
   with fanged mandibles, an egg-sac cluster slung under the abdomen. Whole-object grammar: one
   function, one merged frame, no anchors. NO eye quads — dark socket cluster dimples only.
   Large size: base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildAshWidowBroodmother(){
  /* ---------- PALETTE (VS-desaturated ash-grey chitin, sickly egg-sac pale, radiation dome sheen) - */
  const P = {
    chitin:0x4c4a40, chitinDk:0x33322a, chitinLt:0x625f50,
    dome:0x5a584c, domeDk:0x3e3c32, domeRing:0x6e6c5a,   /* reactor-dome ridge banding */
    egg:0x9a9578, eggDk:0x726e54,
    leg:0x2e2c24, fang:0x201d18,
    socket:0x151310,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — low sprawl, abdomen dominant behind, smaller head up front ---------- */
  const spY = 0.34;
  const S = {
    abdomenC: V(0, spY+0.02, -0.28),
    waist:    V(0, spY+0.01, 0.06),
    thorax:   V(0, spY-0.01, 0.24),
    headB:    V(0, spY-0.05, 0.38),
  };

  /* ---------- ABDOMEN — swollen dome, ridge-banded like a containment reactor dome ---------- */
  {
    const bands=[
      {y:spY-0.10, cz:S.abdomenC.z, rx:0.10, ry:0.05, rz:0.10},
    ];
    const domeCy = 0.24;   // lifted from 0.02 so the ry=0.30 dome bottom clears the floor-plane bound
    blob(0, domeCy, S.abdomenC.z, 0.34, 0.30, 0.36, P.dome, 10, 6);
    /* ridge rings banding the dome (reactor-containment read) */
    for(const dy of [0.10, 0.20, 0.30, 0.38]){
      const rr = Math.sqrt(Math.max(0.001, 1-((dy-0.02)/0.30)**2))*0.33;
      const ry = dy + (domeCy-0.02);
      const rg = ring(V(0,ry,S.abdomenC.z), V(0,1,0), rr, rr, 10, Math.PI/10);
      const rg2 = ring(V(0,ry+0.018,S.abdomenC.z), V(0,1,0), rr*0.97, rr*0.97, 10, Math.PI/10);
      stitch([rg,rg2], ()=>P.domeRing);
    }
    /* dark seam/vent line down the top of the dome */
    quad(V(-0.02,0.36+(domeCy-0.02),S.abdomenC.z-0.20), V(0.02,0.36+(domeCy-0.02),S.abdomenC.z-0.20),
         V(0.016,0.20+(domeCy-0.02),S.abdomenC.z+0.14), V(-0.016,0.20+(domeCy-0.02),S.abdomenC.z+0.14), P.domeDk, 0.04);
  }

  /* ---------- EGG-SAC CLUSTER — slung low beneath the abdomen (raised slightly with the dome lift
     above so the cluster still visually nestles under the dome rather than floating a full 0.22u
     of empty space beneath it) ---------- */
  {
    for(const [x,z,r] of [[0.0,-0.30,0.13],[0.14,-0.20,0.09],[-0.13,-0.22,0.09],[0.05,-0.40,0.08]]){
      blob(x, 0.10, z, r, r*0.85, r, P.egg, 7, 4);
    }
    quad(V(-0.05,0.09,-0.10), V(0.05,0.09,-0.10), V(0.03,0.07,-0.02), V(-0.03,0.07,-0.02), P.eggDk, 0.05);
  }

  /* ---------- CEPHALOTHORAX + HEAD — smaller segment up front, fanged mandibles ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.waist.y,   cz:S.waist.z,   rx:0.150, rz:0.155, hex:P.chitin},
      {y:S.thorax.y,  cz:S.thorax.z,  rx:0.145, rz:0.140, hex:P.chitinLt},
      {y:S.headB.y,   cz:S.headB.z,   rx:0.105, rz:0.100, hex:P.chitinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headB.y-0.02, S.headB.z+0.06), P.chitinDk);

    /* fanged mandibles projecting forward/down */
    for(const s of [-1,1]){
      const mb = V(s*0.045, spY-0.08, 0.44);
      const mt = V(s*0.02, spY-0.20, 0.54);
      tube(mb, mt, 0.028, 0.008, 5, P.fang, {capB:{hex:P.fang}});
    }
    /* dark socket-cluster dimples (no eye quads) atop the cephalothorax */
    for(const [x,z] of [[-0.05,0.30],[0.05,0.30],[-0.07,0.24],[0.07,0.24],[0,0.34]]){
      quad(V(x-0.012,spY+0.07,z), V(x+0.012,spY+0.07,z), V(x+0.010,spY+0.05,z), V(x-0.010,spY+0.05,z), P.socket, 0.02);
    }
  }

  /* ---------- LEGS — eight splayed sprawling legs, low wide stance ---------- */
  {
    const sprawlLeg=(hipX, hipZ, footX, footZ)=>{
      const hip = V(hipX, spY+0.04, hipZ);
      const knee = V(hipX + Math.sign(hipX)*0.22, spY-0.02, hipZ*0.4 + footZ*0.2);
      const foot = V(footX, 0.03, footZ);
      tube(hip, knee, 0.052, 0.038, 6, P.chitin, {phase:Math.PI/6});
      tube(knee, foot, 0.038, 0.018, 6, P.leg, {phase:Math.PI/6, capB:{hex:P.leg, lift:0.006}});
    };
    const rows = [
      {hz: 0.30, fz: 0.46}, {hz: 0.12, fz: 0.24}, {hz:-0.08, fz:-0.02}, {hz:-0.28, fz:-0.30},
    ];
    for(const r of rows){
      sprawlLeg(-0.16, r.hz, -0.52, r.fz);
      sprawlLeg( 0.16, r.hz,  0.52, r.fz);
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
