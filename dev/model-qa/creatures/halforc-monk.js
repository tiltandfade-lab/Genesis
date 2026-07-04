/* dev/model-qa/creatures/halforc-monk.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED half-orc race (heavy/broad frame, gray-green skin, heavy jaw + tusk nubs + jutting brow)
   wearing the MONK kit (monk.js signature: a QUARTERSTAFF held diagonally two-handed authored first
   so both fists derive true, a wrap-top GI cinched by a red SASH with a trailing knot, bare forearms
   with wrist wraps, a wide low HORSE-STANCE, BARE FEET). A big disciplined orcish martial artist; the
   tusks + brow read on the bare cropped-hair head. EYELESS. One whole-object function, no anchors;
   figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrcMonk(){
  const P = {
    gi:0xa89670, giDk:0x7d6d50, giLt:0xbcac86,
    sash:0xa8342c, sashDk:0x7a2620,
    skin:0x7a8a6e, skinDk:0x525e48, skinLt:0x8fa080,
    tusk:0xd8cdae, tuskDk:0xb9ac86, hair:0x2a2420, hairDk:0x1c1815,
    wrap:0xd8cdb0, wrapDk:0xa89b7c,
    trouser:0x4f4a3e, trouserDk:0x3a362c,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.735, waistY:0.815, ribY:0.930, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* torso (gi wrap-top, broad half-orc loft) */
  stack([
    {y:L.hipY,   rx:0.220, rz:0.170, hex:P.trouserDk},
    {y:L.waistY, rx:0.205, rz:0.156, hex:P.gi},
    {y:L.ribY,   rx:0.244, rz:0.182, hex:P.gi},
    {y:L.chestY, rx:0.282, rz:0.196, hex:P.giLt},
    {y:L.shldY,  rx:0.298, rz:0.188, hex:P.gi},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});

  /* wrap-top V-crossover */
  {
    const zs=[[L.shldY-0.01,0.190],[L.chestY,0.200],[L.ribY,0.186],[L.waistY,0.160]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.11,y1,z1+0.006), V(0.01,y1,z1-0.004), V(0.03,y2,z2-0.004), V(-0.09,y2,z2+0.006), P.giLt, 0.03);
    }
  }

  /* SASH — red waist band with a trailing knot on the left hip */
  stack([
    {y:L.waistY-0.045, rx:0.222, rz:0.170, hex:P.sashDk},
    {y:L.waistY-0.005, rx:0.220, rz:0.168, hex:P.sash},
    {y:L.waistY+0.035, rx:0.218, rz:0.166, hex:P.sash},
    {y:L.waistY+0.06,  rx:0.216, rz:0.164, hex:P.sashDk},
  ], 8, {capTop:{hex:P.sashDk,lift:0.006}, capBot:{hex:P.sashDk,lift:0.0}});
  {
    const kc=V(-0.19,L.waistY-0.02,0.12);
    stack([
      {y:kc.y+0.03, rx:0.036, rz:0.032, cx:kc.x, cz:kc.z, hex:P.sash},
      {y:kc.y-0.01, rx:0.038, rz:0.034, cx:kc.x, cz:kc.z, hex:P.sashDk},
    ], 6, {capTop:{hex:P.sash,lift:0.01}, capBot:{hex:P.sashDk,lift:0.0}});
    tube(V(kc.x+0.01,kc.y-0.01,kc.z), V(kc.x-0.015,kc.y-0.24,kc.z-0.02), 0.022,0.011,5,P.sash,{capB:{hex:P.sashDk}});
    tube(V(kc.x-0.02,kc.y-0.01,kc.z+0.01), V(kc.x-0.04,kc.y-0.20,kc.z+0.03), 0.018,0.009,5,P.sashDk,{capB:{hex:P.sashDk}});
  }

  /* HEAD — inherited half-orc skull, cropped hair. EYELESS. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.148, rz:0.126, hex:P.skin},
      {y:L.cheekY, rx:0.140, rz:0.130, hex:P.skin},
      {y:L.browY,  rx:0.132, rz:0.118, hex:P.skin},
      {y:L.crownY, rx:0.108, rz:0.096, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(const i of [1,2]) rings[2][i].z += 0.058;
    for(const i of [0,3]) rings[2][i].z += 0.030;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
    for(const s of [-1,1]){
      const bx=s*0.044, by=L.jawY-0.006, bz=0.140;
      const tx=s*0.038, ty=by+0.040, tz=bz+0.032;
      const w=0.020;
      quad(V(bx-w,by-0.008,bz), V(bx+w,by-0.008,bz), V(tx+w*0.3,ty,tz), V(tx-w*0.3,ty,tz), P.tusk, 0.0);
    }
  }
  /* cropped dark hair cap + a small bound top-knot (disciplined read) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.010, rx:0.136, rz:0.122, hex:P.hairDk},
      {y:L.crownY+0.004,rx:0.112, rz:0.100, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[1,2,3,4,5,6]});
    capFan(rings[1], V(0, L.headTopY+0.010, -0.004), P.hair);
    stack([
      {y:L.headTopY+0.004, rx:0.040, rz:0.038, hex:P.hairDk},
      {y:L.headTopY+0.04,  rx:0.030, rz:0.028, hex:P.hair},
    ], 7, {capTop:{hex:P.hair, lift:0.008}});
  }

  /* QUARTERSTAFF FIRST — held diagonally two-handed (broad grips) */
  const G1=V(0.290,0.990,0.210);
  const G2=V(-0.275,0.585,0.165);
  const STAFF_A=G1.clone().addScaledVector(new THREE.Vector3().subVectors(G1,G2).normalize(), 0.46);
  const STAFF_B=G2.clone().addScaledVector(new THREE.Vector3().subVectors(G2,G1).normalize(), 0.46);
  const AXIS=new THREE.Vector3().subVectors(STAFF_A,STAFF_B).normalize();
  {
    tube(STAFF_B, STAFF_A, 0.028, 0.028, 8, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
    tube(G1.clone().addScaledVector(AXIS,-0.06), G1.clone().addScaledVector(AXIS,0.06), 0.033,0.033,8,P.woodDk);
    tube(G2.clone().addScaledVector(AXIS,-0.06), G2.clone().addScaledVector(AXIS,0.06), 0.033,0.033,8,P.woodDk);
  }

  /* ARMS — both fists derived from the staff grips (bare gray-green skin) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const FIST1=G1.clone();
    const W=FIST1.clone();
    const E=V(0.360,0.900,0.150);
    tube(S,E,0.098,0.076,6,P.skin);
    tube(E,W,0.070,0.058,6,P.skin,{capB:{hex:P.skin}});
    tube(FIST1.clone().addScaledVector(AXIS,-0.05), FIST1.clone().addScaledVector(AXIS,0.05), 0.062,0.056,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    tube(E.clone().lerp(W,0.55).add(V(0,0.01,0)), E.clone().lerp(W,0.72).add(V(0,0.01,0)), 0.066,0.062,6,P.wrap);

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const FIST2=G2.clone();
    const E2=V(-0.340,0.800,0.070);
    tube(S2,E2,0.098,0.076,6,P.skin);
    const WR2=E2.clone().lerp(FIST2,0.72);
    tube(E2,WR2,0.070,0.058,6,P.skin);
    tube(E2.clone().lerp(FIST2,0.55).add(V(0,0.01,0)), WR2.clone().add(V(0,0.01,0)), 0.064,0.058,6,P.wrap);
    tube(WR2, FIST2.clone().addScaledVector(AXIS,-0.045), 0.058,0.070,6,P.skin,{capB:{hex:P.skinDk}});
    tube(FIST2.clone().addScaledVector(AXIS,-0.045), FIST2.clone().addScaledVector(AXIS,0.045), 0.070,0.062,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skin}});
  }

  /* LEGS — wide horse-stance, cropped trousers, BARE feet (broad half-orc) */
  {
    const hipL=V(-0.235, L.hipY-0.01, 0.02), kneeL=V(-0.275,0.36,0.10), ankL=V(-0.265,0.075,0.055);
    const hipR=V( 0.235, L.hipY-0.01, -0.01), kneeR=V( 0.285,0.36,-0.075), ankR=V( 0.275,0.075,-0.10);
    tube(hipL,kneeL,0.108,0.078,6,P.trouser);
    tube(kneeL, kneeL.clone().lerp(ankL,0.55), 0.074,0.058,6,P.trouser);
    tube(hipR,kneeR,0.108,0.078,6,P.trouser);
    tube(kneeR, kneeR.clone().lerp(ankR,0.55), 0.074,0.058,6,P.trouser);
    for(const [knee,ank] of [[kneeL,ankL],[kneeR,ankR]]){
      const hemA=knee.clone().lerp(ank,0.55);
      stack([{y:hemA.y+0.015, rx:0.066, rz:0.060, cx:hemA.x, cz:hemA.z, hex:P.trouserDk}], 6, {});
      tube(hemA, ank, 0.058,0.048,6,P.skin);
      tube(hemA.clone().lerp(ank,0.55), hemA.clone().lerp(ank,0.78), 0.052,0.050,6,P.wrap);
    }
    for(const [ank,toeDir] of [[ankL,V(0.08,0,1)], [ankR,V(0.75,0,0.35).normalize()]]){
      stack([
        {y:0.010, rx:0.072, rz:0.086, cx:ank.x, cz:ank.z, hex:P.skinDk},
        {y:0.055, rx:0.064, rz:0.070, cx:ank.x, cz:ank.z, hex:P.skin},
      ], 6, {capTop:{hex:P.skin, lift:0.004}, capBot:{hex:P.skinDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.125), 0.060,0.038,6,P.skin, {capB:{hex:P.skinDk, lift:0.012}, raz:0.052, rbz:0.032});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
