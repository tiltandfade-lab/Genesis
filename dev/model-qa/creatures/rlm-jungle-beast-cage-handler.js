/* dev/model-qa/creatures/rlm-jungle-beast-cage-handler.js — Jungle Beast-Cage Handler (theater,
   jungle lens, Medium, CR 4). A handler flinging open bamboo cages at the ambush horn: one arm
   thrown up gripping a horn to the lips, the other hauling open a lashed bamboo cage-crate slung
   at the hip with a snarling shape half-visible inside. Whole-object bipedal grammar, dynamic
   action posture. VS-desaturated jungle-drab palette (mottled cloth, dark bamboo lashings, worn
   horn). NO eye quads. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildJungleBeastCageHandler(){
  const P = {
    cloth:0x4e5438, clothDk:0x353a24, clothLt:0x646a44,
    skin:0x7d6650, skinDk:0x574636,
    bamboo:0x8f8558, bambooDk:0x655c38,
    lash:0x3a3020, horn:0x5e4a2e, hornDk:0x3a2c1a,
    beastHide:0x6a4232, beastDk:0x3e241a, fang:0xd8cfa8,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — dynamic wide stance, one arm thrown up, torso twisted toward the cage. ---------- */
  const S = {
    hip:   V(0, 0.35, 0),
    waist: V(0.02, 0.48, 0.02),
    chest: V(0.03, 0.60, 0.04),
    shldr: V(0.02, 0.68, 0.05),
    neck:  V(0.01, 0.72, 0.04),
    headB: V(0, 0.76, 0.03),
    headT: V(-0.01, 0.90, 0.0),
  };

  /* ---------- TORSO — mottled jungle cloth, twisting frame. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   cz:S.hip.z,   rx:0.132, hex:P.clothDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.126, hex:P.cloth},
      {y:S.chest.y, cz:S.chest.z, rx:0.142, hex:P.clothLt},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.150, hex:P.cloth},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.05,S.hip.z), P.clothDk, true);
  }

  /* ---------- HEAD — hollow socket shading (no eyes), cloth wrap. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.080, hex:P.skinDk},
      {y:S.headB.y+0.06, r:0.086, hex:P.skin},
      {y:S.headT.y-0.02, r:0.070, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z-0.01), P.clothDk);
    quad(V(-0.056,S.headB.y+0.048,S.headB.z+0.064), V(-0.014,S.headB.y+0.048,S.headB.z+0.068),
         V(-0.018,S.headB.y+0.075,S.headB.z+0.062), V(-0.052,S.headB.y+0.075,S.headB.z+0.058), P.skinDk, 0.05);
    quad(V(0.014,S.headB.y+0.048,S.headB.z+0.068), V(0.056,S.headB.y+0.048,S.headB.z+0.064),
         V(0.052,S.headB.y+0.075,S.headB.z+0.058), V(0.018,S.headB.y+0.075,S.headB.z+0.062), P.skinDk, 0.05);
  }

  /* ---------- ARM + HORN — one arm thrown up, horn raised to the lips, mid-blast. ---------- */
  {
    const shR=V(-0.18,0.68,0.06), elR=V(-0.26,0.82,0.18), hR=V(-0.14,0.90,0.34);
    tube(shR,elR,0.050,0.040,6,P.cloth);
    tube(elR,hR,0.040,0.030,6,P.skin,{capB:{hex:P.skin,lift:0.02}});
    const hb0=V(-0.14,0.90,0.34), hb1=V(-0.04,0.86,0.46), hbTip=V(0.08,0.80,0.58);
    tube(hb0,hb1,0.030,0.022,6,P.horn);
    tube(hb1,hbTip,0.022,0.010,6,P.hornDk,{capB:{hex:P.hornDk,lift:0.006}});
  }

  /* ---------- ARM + CAGE — the other arm hauling open a lashed bamboo cage-crate at the hip. ---------- */
  {
    const shL=V(0.18,0.67,0.06), elL=V(0.28,0.52,0.16), hL=V(0.30,0.36,0.22);
    tube(shL,elL,0.050,0.040,6,P.cloth);
    tube(elL,hL,0.040,0.030,6,P.skin,{capB:{hex:P.skin,lift:0.02}});
    // cage-crate — a boxy bamboo-slat frame slung at the hip, one slat swung open
    const cx=0.28, cy=0.22, cz=0.14;
    const c0=V(cx-0.10,cy+0.12,cz-0.08), c1=V(cx+0.10,cy+0.12,cz-0.08), c2=V(cx+0.10,cy-0.10,cz-0.08), c3=V(cx-0.10,cy-0.10,cz-0.08);
    quad(c0,c1,c2,c3,P.bambooDk,0.06);
    // vertical bamboo slats (bars) on the front face, one displaced (open)
    for(let i=-2;i<=2;i++){
      const sx=cx+i*0.038;
      const open = i===0;
      const topz = cz+0.10, botz = cz+0.10;
      if(open){
        tube(V(sx,cy+0.12,cz+0.10), V(sx+0.10,cy+0.10,cz+0.24), 0.012,0.010,4,P.bamboo);
      } else {
        tube(V(sx,cy+0.12,cz+0.10), V(sx,cy-0.10,cz+0.10), 0.012,0.010,4,P.bamboo);
      }
    }
    // lashing cords at top and bottom of the cage
    quad(V(cx-0.10,cy+0.11,cz+0.09), V(cx+0.10,cy+0.11,cz+0.09), V(cx+0.10,cy+0.12,cz+0.11), V(cx-0.10,cy+0.12,cz+0.11), P.lash, 0.04);
    // a snarling beast shape half-visible inside the dark cage interior
    quad(V(cx-0.06,cy+0.02,cz+0.02), V(cx+0.06,cy+0.02,cz+0.02), V(cx+0.05,cy-0.06,cz+0.02), V(cx-0.05,cy-0.06,cz+0.02), P.beastDk, 0.06);
    for(const s of [-1,1]) tube(V(s*0.02,cy-0.02,cz+0.03), V(s*0.03,cy-0.06,cz+0.05), 0.008,0.002,3,P.fang);
  }

  /* ---------- LEGS — wide dynamic stance, weight thrown toward the cage side. ---------- */
  {
    const hipL = V(-0.10,0.35,0.03), kneeL = V(-0.16,0.19,0.14), footL = V(-0.14,0.02,0.20);
    tube(hipL, kneeL, 0.060, 0.048, 6, P.clothDk);
    tube(kneeL, footL, 0.048, 0.036, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.015}});
    const hipR = V(0.10,0.35,-0.02), kneeR = V(0.18,0.20,-0.10), footR = V(0.24,0.02,-0.16);
    tube(hipR, kneeR, 0.060, 0.048, 6, P.clothDk);
    tube(kneeR, footR, 0.048, 0.036, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.015}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
