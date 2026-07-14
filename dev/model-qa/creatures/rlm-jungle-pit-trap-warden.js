/* dev/model-qa/creatures/rlm-jungle-pit-trap-warden.js — Jungle Pit-Trap Warden (theater, jungle
   lens, Medium, CR 1). A guerrilla warden crouched low among staked pits and deadfalls, wrapped
   in mottled jungle cloth, a sharpened bamboo stake spear held ready, a coil of trip-cord at the
   hip. Whole-object bipedal grammar, crouched watching posture (knees bent, low center, head
   tilted forward listening). VS-desaturated jungle-drab palette (mottled greens, dark bamboo,
   worn cord). NO eye quads. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildJunglePitTrapWarden(){
  const P = {
    cloth:0x51573a, clothDk:0x363b26, clothLt:0x656b46,
    skin:0x7d6650, skinDk:0x574636,
    bamboo:0x9a8f5c, bambooDk:0x6e6640, bambooTip:0x3a3520,
    cord:0x4a3d2a, cordDk:0x2c2317,
    mud:0x3a3524,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — crouched, knees bent, low center of gravity. ---------- */
  const S = {
    hip:   V(0, 0.26, 0),
    waist: V(0, 0.36, 0.02),
    chest: V(0, 0.46, 0.04),
    shldr: V(0, 0.53, 0.03),
    neck:  V(0, 0.57, 0.05),
    headB: V(0, 0.60, 0.08),
    headT: V(0, 0.73, 0.07),
  };

  /* ---------- TORSO — wrapped in mottled jungle cloth, crouched-compact frame. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   cz:S.hip.z,   rx:0.128, hex:P.clothDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.122, hex:P.cloth},
      {y:S.chest.y, cz:S.chest.z, rx:0.138, hex:P.clothLt},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.146, hex:P.cloth},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.05,S.hip.z), P.clothDk, true);
    // mottled dark patches, guerrilla camo read
    for(const [dy,dz,r] of [[0.05,0.06,0.03],[-0.03,-0.02,0.025],[0.10,-0.04,0.028]]){
      quad(V(-r,S.chest.y+dy,S.chest.z+dz), V(r,S.chest.y+dy,S.chest.z+dz+0.01),
           V(r*0.7,S.chest.y+dy-r,S.chest.z+dz), V(-r*0.7,S.chest.y+dy-r,S.chest.z+dz-0.01), P.clothDk, 0.06);
    }
  }

  /* ---------- CORD COIL — trip-cord coiled at the hip, the trap-warden's tell. ---------- */
  {
    const cx=0.14, cy=S.hip.y+0.02, cz=S.hip.z-0.02;
    for(let k=0;k<3;k++){
      const rr=0.055-k*0.008;
      ring(V(cx,cy+k*0.018,cz), V(0,1,0), rr, rr*0.9, 8).forEach((p,i,arr)=>{
        const p2=arr[(i+1)%arr.length];
        quad(p,p2,V(p2.x,p2.y+0.012,p2.z),V(p.x,p.y+0.012,p.z), k%2?P.cord:P.cordDk, 0.06);
      });
    }
  }

  /* ---------- HEAD — low, forward-tilted (listening posture), hollow socket shading only. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.076, hex:P.skinDk},
      {y:S.headB.y+0.06, r:0.082, hex:P.skin},
      {y:S.headT.y-0.02, r:0.066, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z+((b.y-S.headB.y)*0.15)), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z+0.12), P.clothDk);
    // socket shading, no eyes
    quad(V(-0.054,S.headB.y+0.045,S.headB.z+0.062), V(-0.013,S.headB.y+0.045,S.headB.z+0.066),
         V(-0.017,S.headB.y+0.072,S.headB.z+0.06), V(-0.05,S.headB.y+0.072,S.headB.z+0.055), P.skinDk, 0.05);
    quad(V(0.013,S.headB.y+0.045,S.headB.z+0.066), V(0.054,S.headB.y+0.045,S.headB.z+0.062),
         V(0.05,S.headB.y+0.072,S.headB.z+0.055), V(0.017,S.headB.y+0.072,S.headB.z+0.06), P.skinDk, 0.05);
    // jungle cloth wrap covering the head/neck (bandana-like)
    quad(V(-0.09,S.headT.y-0.03,S.headB.z+0.05), V(0.09,S.headT.y-0.03,S.headB.z+0.05),
         V(0.075,S.headB.y+0.02,S.headB.z+0.10), V(-0.075,S.headB.y+0.02,S.headB.z+0.10), P.clothDk, 0.06);
  }

  /* ---------- ARMS — both gripping the bamboo stake spear low and angled, ready posture. ---------- */
  {
    const shR = V(-0.16,0.52,0.06), elR = V(-0.22,0.38,0.16), hR = V(-0.14,0.30,0.30);
    tube(shR, elR, 0.048, 0.038, 6, P.cloth);
    tube(elR, hR, 0.038, 0.030, 6, P.skin, {capB:{hex:P.skin, lift:0.015}});
    const shL = V(0.16,0.51,0.06), elL = V(0.20,0.34,0.20), hL = V(0.08,0.24,0.34);
    tube(shL, elL, 0.048, 0.038, 6, P.cloth);
    tube(elL, hL, 0.038, 0.030, 6, P.skin, {capB:{hex:P.skin, lift:0.015}});
  }

  /* ---------- BAMBOO STAKE SPEAR — a sharpened bamboo pole held low/forward. ---------- */
  {
    const gripL=V(0.08,0.24,0.34), gripR=V(-0.14,0.30,0.30), tip=V(0.20,0.18,0.62);
    tube(gripR, gripL, 0.020, 0.020, 6, P.bamboo);
    tube(gripL, tip, 0.020, 0.005, 6, P.bambooDk, {capB:{hex:P.bambooTip, lift:0.01}});
    // butt end trailing behind
    tube(gripR, V(-0.24,0.32,0.10), 0.020,0.014,6,P.bamboo);
  }

  /* ---------- LEGS — deeply crouched, knees bent wide, feet planted close. ---------- */
  {
    const hipL = V(-0.10,0.26,0.01), kneeL = V(-0.16,0.13,0.16), footL = V(-0.11,0.02,0.12);
    tube(hipL, kneeL, 0.058, 0.048, 6, P.clothDk);
    tube(kneeL, footL, 0.046, 0.036, 6, P.skinDk, {capB:{hex:P.mud, lift:0.015}});
    const hipR = V(0.10,0.26,-0.01), kneeR = V(0.15,0.11,0.10), footR = V(0.11,0.02,-0.02);
    tube(hipR, kneeR, 0.058, 0.048, 6, P.clothDk);
    tube(kneeR, footR, 0.046, 0.036, 6, P.skinDk, {capB:{hex:P.mud, lift:0.015}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
