/* dev/model-qa/creatures/rlm-colonial-trench-medic.js — Colonial Trench Medic (theater, trench
   lens, Medium, CR 1). A medic crawling low between craters under fire, a satchel slung across
   the chest, one arm braced forward, helmet low over a grim hollow-socket face. Whole-object
   bipedal grammar, hunched/crawling posture (torso pitched forward, low center, one knee planted).
   VS-desaturated drab-olive palette, mud-stained canvas, dull red cross patch, worn leather straps.
   NO eye quads. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildColonialTrenchMedic(){
  const P = {
    tunic:0x5a5c48, tunicDk:0x3c3e2e, tunicLt:0x6e7058,
    skin:0x8f7a63, skinDk:0x655241,
    helmet:0x4a4c3e, helmetDk:0x2e3024,
    satchel:0x5c4632, satchelDk:0x3a2c1e,
    cross:0x7a2e28, crossDk:0x542018,
    strap:0x3a2c1e, mud:0x362e20,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — crawling/hunched: torso pitched forward and low. ---------- */
  const S = {
    hip:   V(0, 0.24, 0),
    waist: V(0, 0.32, 0.10),
    chest: V(0, 0.40, 0.22),
    shldr: V(0, 0.46, 0.30),
    neck:  V(0, 0.50, 0.34),
    headB: V(0, 0.52, 0.37),
    headT: V(0, 0.64, 0.35),
  };

  /* ---------- TORSO — hunched forward-pitched frame, mud-stained tunic. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   cz:S.hip.z,   rx:0.135, hex:P.tunicDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.128, hex:P.tunic},
      {y:S.chest.y, cz:S.chest.z, rx:0.140, hex:P.tunic},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.150, hex:P.tunicLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.05,S.hip.z), P.tunicDk, true);
    // mud spatter patches
    for(const [dy,dz] of [[0.02,0.06],[-0.04,0.02],[0.06,-0.02]]){
      quad(V(-0.08,S.waist.y+dy,S.waist.z+dz), V(0.02,S.waist.y+dy,S.waist.z+dz+0.02),
           V(0.0,S.waist.y+dy-0.05,S.waist.z+dz), V(-0.09,S.waist.y+dy-0.05,S.waist.z+dz-0.02), P.mud, 0.07);
    }
  }

  /* ---------- MEDIC SATCHEL — slung crossways over the chest, red cross patch on the flap. ---------- */
  {
    const strapA=V(-0.14,S.shldr.y+0.03,S.shldr.z-0.02), strapB=V(0.10,S.hip.y+0.02,S.hip.z+0.04);
    tube(strapA, strapB, 0.020, 0.018, 5, P.strap);
    const bagA=V(0.02,S.waist.y-0.02,S.waist.z+0.10), bagB=V(0.18,S.waist.y-0.02,S.waist.z+0.06);
    const bagC=V(0.19,S.waist.y-0.14,S.waist.z+0.03), bagD=V(0.03,S.waist.y-0.14,S.waist.z+0.07);
    quad(bagA,bagB,bagC,bagD,P.satchel,0.06);
    quad(V(0.03,S.waist.y-0.14,S.waist.z+0.07), V(0.19,S.waist.y-0.14,S.waist.z+0.03),
         V(0.18,S.waist.y-0.02,S.waist.z+0.06), V(0.02,S.waist.y-0.02,S.waist.z+0.10), P.satchelDk, 0.04);
    // red cross patch — vertical + horizontal bar
    const cx=0.11, cy=S.waist.y-0.08, cz=S.waist.z+0.06;
    quad(V(cx-0.006,cy-0.03,cz), V(cx+0.006,cy-0.03,cz), V(cx+0.006,cy+0.03,cz), V(cx-0.006,cy+0.03,cz), P.cross, 0.02);
    quad(V(cx-0.03,cy-0.006,cz), V(cx+0.03,cy-0.006,cz), V(cx+0.03,cy+0.006,cz), V(cx-0.03,cy+0.006,cz), P.cross, 0.02);
  }

  /* ---------- HEAD — low helmet brim, grim hollow-socket face, no eyes. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.078, hex:P.skinDk},
      {y:S.headB.y+0.06, r:0.084, hex:P.skin},
      {y:S.headT.y-0.02, r:0.068, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.92, n, ph));
    stitch(rings, b=>bands[b].hex);
    // socket shading, no eyes
    quad(V(-0.056,S.headB.y+0.045,S.headB.z+0.065), V(-0.014,S.headB.y+0.045,S.headB.z+0.07),
         V(-0.018,S.headB.y+0.075,S.headB.z+0.065), V(-0.052,S.headB.y+0.075,S.headB.z+0.06), P.skinDk, 0.05);
    quad(V(0.014,S.headB.y+0.045,S.headB.z+0.07), V(0.056,S.headB.y+0.045,S.headB.z+0.065),
         V(0.052,S.headB.y+0.075,S.headB.z+0.06), V(0.018,S.headB.y+0.075,S.headB.z+0.065), P.skinDk, 0.05);
    // helmet — a low dome + wide flat brim shadowing the face
    const helmC=ring(V(0,S.headT.y-0.05,S.headB.z-0.01), V(0,1,0), 0.088, 0.082, 8, ph);
    capFan(helmC.map(p=>V(p.x,p.y+0.04,p.z)), V(0,S.headT.y+0.02,S.headB.z-0.02), P.helmet);
    stitch([helmC, helmC.map(p=>V(p.x,p.y+0.04,p.z))], ()=>P.helmet);
    quad(V(-0.13,S.headT.y-0.04,S.headB.z+0.06), V(0.13,S.headT.y-0.04,S.headB.z+0.06),
         V(0.10,S.headT.y-0.06,S.headB.z+0.14), V(-0.10,S.headT.y-0.06,S.headB.z+0.14), P.helmetDk, 0.05);
    // grim tight mouth line
    quad(V(-0.024,S.headB.y-0.01,S.headB.z+0.075), V(0.024,S.headB.y-0.01,S.headB.z+0.075),
         V(0.020,S.headB.y-0.03,S.headB.z+0.07), V(-0.020,S.headB.y-0.03,S.headB.z+0.07), P.skinDk, 0.04);
  }

  /* ---------- ARMS — one braced forward flat on the ground, one tucked reaching for the satchel. ---------- */
  {
    const shR = V(-0.15,0.44,0.26), elR = V(-0.22,0.28,0.42), hR = V(-0.18,0.09,0.56);
    tube(shR, elR, 0.048, 0.038, 6, P.tunic);
    tube(elR, hR, 0.038, 0.030, 6, P.skin, {capB:{hex:P.skin, lift:0.015}});
    const shL = V(0.15,0.43,0.24), elL = V(0.22,0.30,0.20), hL = V(0.14,0.20,0.10);
    tube(shL, elL, 0.048, 0.038, 6, P.tunic);
    tube(elL, hL, 0.038, 0.030, 6, P.skin, {capB:{hex:P.skin, lift:0.015}});
  }

  /* ---------- LEGS — one crawling knee planted, one trailing back, low crouched crawl. ---------- */
  {
    const hipL = V(-0.09,0.24,-0.02), kneeL = V(-0.12,0.10,0.14), footL = V(-0.10,0.09,0.30);
    tube(hipL, kneeL, 0.058, 0.048, 6, P.tunicDk);
    tube(kneeL, footL, 0.046, 0.036, 6, P.tunicDk, {capB:{hex:P.mud, lift:0.015}});
    const hipR = V(0.09,0.24,-0.04), kneeR = V(0.16,0.06,-0.22), footR = V(0.20,0.04,-0.40);
    tube(hipR, kneeR, 0.058, 0.048, 6, P.tunicDk);
    tube(kneeR, footR, 0.046, 0.030, 6, P.tunicDk, {capB:{hex:P.mud, lift:0.01}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
