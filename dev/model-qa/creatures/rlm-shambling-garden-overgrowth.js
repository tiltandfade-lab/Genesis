/* dev/model-qa/creatures/rlm-shambling-garden-overgrowth.js — SHAMBLING GARDEN OVERGROWTH
   (lost-world, Large Plant, CR 5). Read: a sentient tangle of vines and reclaimed hanging-garden
   growth heaved into a lumbering quadrupedal mass — a hunched mound-body of woven creeper stems,
   thorned tendril "limbs" splayed wide for support, a nest of flowering vines crowning where a
   head would be, dragging root-tendrils and dead leaf-litter. VS-desaturated antiquity register:
   sun-faded jade/olive vine, dusty terracotta flower accents (dead-garden bloom), stone-grey
   embedded rubble. NO eye quads — a dark hollow knot instead. Whole-object grammar: one function,
   one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildShamblingGardenOvergrowth(){
  const P = {
    vine:0x596b3e, vineDk:0x3d4a29, vineLt:0x748856,        // sun-faded jade/olive vine
    leaf:0x6d7a44, leafDk:0x4a5430,
    bloom:0x9c6350, bloomDk:0x6e4436,                        // dusty terracotta dead-garden flowers
    thorn:0x2e2a1e,
    rubble:0x7d7466, rubbleDk:0x544d42,                      // embedded garden-stone rubble
    knot:0x1e1c14,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — hunched quadrupedal mound, low front, high humped rear (a dragged mass of growth) */
  const spY = 0.62;
  const S = {
    tailBase: V(0, 0.50, -0.62),
    rump:     V(0, 0.72, -0.36),
    hump:     V(0, 0.86, -0.10),
    mid:      V(0, 0.78, 0.14),
    shldr:    V(0, 0.62, 0.36),
    neck:     V(0, 0.55, 0.54),
    headB:    V(0, 0.60, 0.66),
  };

  /* BODY — a lumpy woven-vine mound, irregular bulges (not a smooth beast torso) */
  tube(S.rump,  S.hump, 0.34, 0.40, 9, P.vine,   {phase:Math.PI/9, capA:{hex:P.vineDk, lift:0.03}});
  tube(S.hump,  S.mid,  0.40, 0.33, 9, P.vineLt, {phase:Math.PI/9});
  tube(S.mid,   S.shldr,0.33, 0.26, 9, P.vine,   {phase:Math.PI/9});
  tube(S.shldr, S.neck, 0.26, 0.17, 8, P.vineDk, {phase:Math.PI/8});
  tube(S.neck,  S.headB,0.17, 0.15, 8, P.vine,   {phase:Math.PI/8});
  /* woven vine strands lacing over the mound (surface detail, not a new silhouette) */
  {
    const strand=(z0,y0,z1,y1)=>{
      quad(V(-0.30,y0,z0), V(-0.24,y0,z0), V(-0.20,y1,z1), V(-0.26,y1,z1), P.vineDk, 0.06);
      quad(V(0.24,y0,z0),  V(0.30,y0,z0),  V(0.26,y1,z1),  V(0.20,y1,z1),  P.vineLt, 0.06);
    };
    strand(-0.30,0.62,-0.05,0.90); strand(-0.05,0.86,0.28,0.70);
  }
  /* dead-garden flower clusters embedded in the mound */
  for(const [x,y,z] of [[-0.22,0.94,-0.14],[0.20,0.80,0.06],[-0.10,0.60,-0.48],[0.14,0.66,0.40]]){
    quad(V(x-0.05,y,z), V(x+0.05,y,z), V(x+0.03,y+0.07,z+0.02), V(x-0.03,y+0.07,z+0.02), P.bloom, 0.06);
    quad(V(x-0.02,y+0.05,z+0.01), V(x+0.02,y+0.05,z+0.01), V(x,y+0.11,z+0.02), V(x,y+0.11,z+0.02), P.bloomDk, 0.05);
  }
  /* embedded rubble chunks — reclaimed hanging-garden stone caught in the growth */
  for(const [x,y,z,s] of [[-0.18,0.58,0.20,0.09],[0.24,0.68,-0.20,0.08],[0.02,0.52,0.44,0.07]]){
    quad(V(x-s,y-s*0.5,z), V(x+s,y-s*0.5,z), V(x+s*0.7,y+s*0.7,z+s*0.4), V(x-s*0.7,y+s*0.7,z+s*0.4), P.rubble, 0.05);
  }

  /* HEAD-KNOT — a crowning nest of woven vine + flowers where a head would sit; a dark knot-hollow */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:0.58, cz:0.66, rx:0.13, rz:0.14, hex:P.vine},
      {y:0.68, cz:0.70, rx:0.155,rz:0.16, hex:P.vineLt},
      {y:0.76, cz:0.66, rx:0.115,rz:0.12, hex:P.vineDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,0.80,0.66), P.leaf);
    /* the dark knot-hollow (no eye quads) */
    quad(V(-0.028,0.665,0.79), V(0.028,0.665,0.79), V(0.022,0.635,0.785), V(-0.022,0.635,0.785), P.knot, 0.02);
    /* trailing flowering vine off the crown */
    quad(V(-0.06,0.78,0.62), V(0.02,0.78,0.62), V(0.05,0.55,0.50), V(-0.03,0.55,0.50), P.bloom, 0.05);
    /* thorned tendrils bristling off the crown */
    for(const [dx,dy] of [[-0.10,0.10],[0.02,0.14],[0.11,0.09]]){
      tube(V(0,0.74,0.68), V(dx,0.74+dy,0.72), 0.02,0.006,4,P.thorn,{capB:{hex:P.thorn,lift:0.003}});
    }
  }

  /* LIMBS — four splayed thorned tendril-limbs for support, wide stance, dragging root-tips */
  {
    const tendrilLeg=(shoulder, footX, footZ, hex)=>{
      const kneeX = shoulder.x + Math.sign(shoulder.x||1)*0.16;
      const knee = V(kneeX, shoulder.y-0.26, shoulder.z + (footZ>shoulder.z?0.05:-0.05));
      const foot = V(footX, 0.06, footZ);
      tube(shoulder, knee, 0.13, 0.09, 7, hex, {phase:Math.PI/9});
      tube(knee, foot, 0.09, 0.05, 6, P.vineDk, {capB:{hex:P.rubbleDk, lift:0.01}});
      /* thorn spurs along the limb */
      for(const t of [0.3,0.6]){
        const px=knee.x+(foot.x-knee.x)*t, py=knee.y+(foot.y-knee.y)*t, pz=knee.z+(foot.z-knee.z)*t;
        tube(V(px,py,pz), V(px+Math.sign(px||1)*0.06, py+0.02, pz), 0.014,0.003,3,P.thorn,{capB:{hex:P.thorn,lift:0.003}});
      }
      /* rooted splayed foot-tendrils */
      for(const [dx,dz] of [[Math.sign(foot.x||1)*0.06,0.03],[0,0.08],[-Math.sign(foot.x||1)*0.04,0.05]]){
        tube(V(foot.x,0.05,foot.z), V(foot.x+dx,0.01,foot.z+dz), 0.03,0.008,4,P.vineDk,{capB:{hex:P.vineDk,lift:0.004}});
      }
    };
    tendrilLeg(V(-0.22,0.60,0.32), -0.46, 0.42, P.vine);
    tendrilLeg(V( 0.22,0.60,0.32),  0.46, 0.38, P.vine);
    tendrilLeg(V(-0.28,0.68,-0.32), -0.50,-0.40, P.vineDk);
    tendrilLeg(V( 0.28,0.68,-0.32),  0.50,-0.44, P.vineDk);
  }

  /* trailing root-tendril dragging behind, littered with dead leaves */
  {
    const t0=S.tailBase, t1=V(0.06,0.34,-0.92), t2=V(0.16,0.16,-1.16), tip=V(0.24,0.06,-1.30);
    tube(t0,t1,0.14,0.09,7,P.vine,{phase:Math.PI/9});
    tube(t1,t2,0.09,0.05,7,P.vineDk);
    tube(t2,tip,0.05,0.02,6,P.vine,{capB:{hex:P.vineDk,lift:0.006}});
    for(const [x,y,z] of [[-0.10,0.14,-1.05],[0.14,0.10,-1.22]]){
      quad(V(x-0.05,y,z), V(x+0.05,y,z), V(x+0.02,y-0.03,z+0.05), V(x-0.02,y-0.03,z+0.05), P.leafDk, 0.06);
    }
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
