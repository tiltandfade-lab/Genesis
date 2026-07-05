/* dev/model-qa/creatures/rlm-vulture-headed-carrion-priest.js — VULTURE-HEADED CARRION
   PRIEST (lost-world, Medium Humanoid, CR 3). Read: a robed priest presiding over open-air
   excarnation rites — a gaunt hooded/robed humanoid body, a carved/worn VULTURE MASK for a
   head (hooked beak, bald wrinkled neck-ruff, no eye quads — dark socket hollows only), a
   ritual sickle/hook carried in one hand, ragged funerary robes with bone-charm trim.
   VS-desaturated bone-dust cream robes over dun-grey mask. Whole-object grammar: one function,
   one frame, no anchors. Medium, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildVultureHeadedCarrionPriest(){
  const P = {
    robe:0x9a8e6e, robeDk:0x6e6448, robeLt:0xb4a884,
    trim:0x3a3226,
    mask:0x8c7a5e, maskDk:0x5c4e38, maskLt:0xa8967a,
    beak:0x453a28, socket:0x201c15,
    ruff:0x776a4e,
    bone:0xd4c8a0, charm:0xc0b088,
    hook:0x4a4438, hookEdge:0xb8b09c,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ROBED BODY — gaunt upright humanoid, wide draped robe silhouette */
  const S = {
    hem:    V(0, 0.02, 0),
    hip:    V(0, 0.56, 0),
    waist:  V(0, 0.78, 0.0),
    chest:  V(0, 1.04, -0.01),
    neck:   V(0, 1.22, -0.02),
    headB:  V(0, 1.30, -0.02),
  };
  tube(S.hem,   S.hip,   0.260, 0.170, 9, P.robe,   {phase:Math.PI/9, capA:{hex:P.robeDk, lift:0.02}});
  tube(S.hip,   S.waist, 0.170, 0.140, 9, P.robeDk, {phase:Math.PI/9});
  tube(S.waist, S.chest, 0.140, 0.155, 9, P.robe,   {phase:Math.PI/9});
  tube(S.chest, S.neck,  0.130, 0.075, 9, P.robeLt, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.075, 0.060, 9, P.ruff,   {phase:Math.PI/9});
  /* ragged hem tatters at the bottom of the robe */
  for(const ang of [0.3,1.1,2.0,2.9,3.9,4.8]){
    const x=Math.sin(ang)*0.24, z=Math.cos(ang)*0.24;
    quad(V(x*0.7,0.10,z*0.7), V(x*0.9,0.10,z*0.9), V(x,-0.03,z), V(x*0.8,-0.02,z*0.8), P.robeDk, 0.06);
  }
  /* trim + bone-charm strand down the front */
  quad(V(-0.015,1.06,0.14), V(0.015,1.06,0.14), V(0.012,0.30,0.15), V(-0.012,0.30,0.15), P.trim, 0.03);
  for(const t of [0.35,0.55,0.75]){
    const y=1.06+(0.30-1.06)*t;
    quad(V(-0.028,y,0.155), V(0.028,y,0.155), V(0.022,y-0.03,0.16), V(-0.022,y-0.03,0.16), P.charm, 0.05);
  }
  /* hood shoulders draped up around the neck-ruff */
  quad(V(-0.11,1.16,-0.05), V(0.11,1.16,-0.05), V(0.09,1.30,-0.03), V(-0.09,1.30,-0.03), P.robeDk, 0.04);

  /* VULTURE-MASK HEAD — worn carved mask, hooked beak, wrinkled bald neck-ruff, dark sockets */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.28, cz:0, rx:0.088, rz:0.090, hex:P.mask},
      {y:1.38, cz:0.01, rx:0.100, rz:0.098, hex:P.maskLt},
      {y:1.46, cz:0, rx:0.080, rz:0.078, hex:P.maskDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.51,0.0), P.maskDk);
    /* dark socket hollows (no eye quads) */
    for(const s of [-1,1]) quad(V(s*0.030,1.395,0.088), V(s*0.048,1.395,0.088),
                                 V(s*0.044,1.365,0.090), V(s*0.034,1.365,0.090), P.socket, 0.02);
    /* hooked beak — a long curved downturned shape jutting forward */
    const bkB=V(0,1.36,0.09), bkM=V(0,1.34,0.20), bkT=V(0,1.28,0.28);
    tube(bkB, bkM, 0.036, 0.020, n, P.beak, {raz:0.045, rbz:0.022, phase:ph});
    tube(bkM, bkT, 0.020, 0.006, n, P.beak, {raz:0.022, rbz:0.010, phase:ph, capB:{hex:P.beak, lift:0.003}});
    /* wrinkled bald neck-ruff folds below the mask */
    for(let i=0;i<3;i++){
      const y=1.24-i*0.03;
      quad(V(-0.06-i*0.008,y,0.05), V(0.06+i*0.008,y,0.05), V(0.05+i*0.006,y-0.02,0.06), V(-0.05-i*0.006,y-0.02,0.06), P.ruff, 0.05);
    }
  }

  /* ARMS — one carrying the ritual hook/sickle, one hanging, wide sleeves */
  {
    const lsh=V(-0.13,1.06,0), lel=V(-0.20,0.82,0.06), lhd=V(-0.16,0.60,0.10);
    tube(lsh,lel,0.060,0.050,6,P.robe);
    tube(lel,lhd,0.050,0.040,6,P.robeDk,{capB:{hex:P.robeDk, lift:0.01}});
    /* sleeve flare */
    quad(V(-0.22,0.86,0.02), V(-0.10,0.86,0.02), V(-0.14,0.72,0.10), V(-0.24,0.72,0.10), P.robeLt, 0.05);

    /* right arm raised, gripping the ritual sickle/excarnation hook */
    const rsh=V(0.13,1.06,0), rel=V(0.22,0.94,0.10), rhd=V(0.28,1.06,0.18);
    tube(rsh,rel,0.060,0.048,6,P.robe);
    tube(rel,rhd,0.048,0.034,6,P.robeDk,{capB:{hex:P.robeDk, lift:0.008}});
    /* the hooked ritual blade — a curved sickle shape rising from the gripping hand */
    const hkBase=V(0.28,1.06,0.18), hkMid=V(0.30,1.20,0.22), hkTip=V(0.22,1.30,0.20);
    tube(hkBase, hkMid, 0.020, 0.014, 5, P.hook);
    tube(hkMid, hkTip, 0.014, 0.005, 5, P.hookEdge, {capB:{hex:P.hookEdge, lift:0.003}});
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
