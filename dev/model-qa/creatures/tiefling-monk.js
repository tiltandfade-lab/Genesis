/* dev/model-qa/creatures/tiefling-monk.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED tiefling race (slim ~1.45u frame, dusky red-mauve skin, backswept HORNS, sharp GOATEE,
   thin spade-tipped TAIL) wearing the MONK kit (monk.js signature: a QUARTERSTAFF held diagonally
   two-handed authored first so both fists derive true, a wrap-top GI + red SASH with a trailing knot,
   wrist wraps, a wide low HORSE-STANCE, BARE FEET). A disciplined infernal ascetic; the horns +
   goatee + tail carry the race. EYELESS. One whole-object function, no anchors; figure faces +z. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTieflingMonk(){
  const P = {
    gi:0xa89670, giDk:0x7d6d50, giLt:0xbcac86,
    sash:0xa8342c, sashDk:0x7a2620,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a, hair:0x2a2320,
    wrap:0xd8cdb0, wrapDk:0xa89b7c,
    trouser:0x4f4a3e, trouserDk:0x3a362c,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.215,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* torso (gi wrap-top, slim tiefling) */
  stack([
    {y:L.hipY,   rx:0.160, rz:0.122, hex:P.trouserDk},
    {y:L.waistY, rx:0.148, rz:0.110, hex:P.gi},
    {y:L.ribY,   rx:0.170, rz:0.126, hex:P.gi},
    {y:L.chestY, rx:0.190, rz:0.138, hex:P.giLt},
    {y:L.shldY,  rx:0.194, rz:0.130, hex:P.gi},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  {
    const zs=[[L.shldY-0.01,0.130],[L.chestY,0.140],[L.ribY,0.128],[L.waistY,0.114]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.09,y1,z1+0.006), V(0.005,y1,z1-0.004), V(0.02,y2,z2-0.004), V(-0.075,y2,z2+0.006), P.giLt, 0.03);
    }
  }

  /* SASH */
  stack([
    {y:L.waistY-0.045, rx:0.166, rz:0.124, hex:P.sashDk},
    {y:L.waistY-0.005, rx:0.164, rz:0.122, hex:P.sash},
    {y:L.waistY+0.035, rx:0.162, rz:0.120, hex:P.sash},
    {y:L.waistY+0.06,  rx:0.160, rz:0.118, hex:P.sashDk},
  ], 8, {capTop:{hex:P.sashDk,lift:0.006}, capBot:{hex:P.sashDk,lift:0.0}});
  {
    const kc=V(-0.14,L.waistY-0.02,0.09);
    stack([
      {y:kc.y+0.03, rx:0.032, rz:0.028, cx:kc.x, cz:kc.z, hex:P.sash},
      {y:kc.y-0.01, rx:0.034, rz:0.030, cx:kc.x, cz:kc.z, hex:P.sashDk},
    ], 6, {capTop:{hex:P.sash,lift:0.01}, capBot:{hex:P.sashDk,lift:0.0}});
    tube(V(kc.x+0.01,kc.y-0.01,kc.z), V(kc.x-0.015,kc.y-0.22,kc.z-0.02), 0.020,0.010,5,P.sash,{capB:{hex:P.sashDk}});
    tube(V(kc.x-0.02,kc.y-0.01,kc.z+0.01), V(kc.x-0.04,kc.y-0.18,kc.z+0.03), 0.017,0.008,5,P.sashDk,{capB:{hex:P.sashDk}});
  }

  /* HEAD — inherited tiefling skull. EYELESS. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.076, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.104, rz:0.100, hex:P.skin},
      {y:L.browY,  rx:0.108, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.084, rz:0.076, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    /* SHAVED head — cap in skinDk (no hair mass, monk read) */
    capFan(rings[3], V(0, L.headTopY-0.01, 0.006), P.skinDk);
  }
  /* GOATEE */
  {
    const bands=[
      {y:L.jawY+0.010, rx:0.058, rz:0.046, cz:0.058, hex:P.hair},
      {y:L.jawY-0.034, rx:0.044, rz:0.036, cz:0.075, hex:P.hair},
      {y:L.jawY-0.072, rx:0.028, rz:0.024, cz:0.078, hex:P.hair},
      {y:L.jawY-0.100, rx:0.012, rz:0.011, cz:0.068, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.jawY-0.122,0.062), P.hair);
  }
  /* HORNS */
  for(const s of [-1,1]){
    const baseX = s*0.100, baseZ = -0.010;
    const base   = V(baseX, L.browY-0.010, baseZ);
    const p1 = V(baseX + s*0.026, L.browY+0.118, baseZ - 0.028);
    const p2 = V(baseX + s*0.044, L.browY+0.210, baseZ - 0.090);
    const p3 = V(baseX + s*0.052, L.browY+0.262, baseZ - 0.150);
    tube(base, p1, 0.030, 0.023, 6, P.horn,   {capA:{hex:P.hornDk}});
    tube(p1,   p2, 0.023, 0.015, 6, P.hornLt);
    tube(p2,   p3, 0.015, 0.003, 6, P.hornLt, {capB:{hex:P.hornDk}});
  }

  /* QUARTERSTAFF FIRST — held diagonally two-handed */
  const G1=V(0.215,0.965,0.170);
  const G2=V(-0.205,0.575,0.135);
  const STAFF_A=G1.clone().addScaledVector(new THREE.Vector3().subVectors(G1,G2).normalize(), 0.42);
  const STAFF_B=G2.clone().addScaledVector(new THREE.Vector3().subVectors(G2,G1).normalize(), 0.42);
  const AXIS=new THREE.Vector3().subVectors(STAFF_A,STAFF_B).normalize();
  {
    tube(STAFF_B, STAFF_A, 0.026, 0.026, 8, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
    tube(G1.clone().addScaledVector(AXIS,-0.06), G1.clone().addScaledVector(AXIS,0.06), 0.030,0.030,8,P.woodDk);
    tube(G2.clone().addScaledVector(AXIS,-0.06), G2.clone().addScaledVector(AXIS,0.06), 0.030,0.030,8,P.woodDk);
  }

  /* ARMS — both fists derived from the staff grips (bare skin) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const FIST1=G1.clone();
    const W=FIST1.clone();
    const E=V(0.280,0.865,0.125);
    tube(S,E,0.070,0.056,6,P.skin);
    tube(E,W,0.052,0.044,6,P.skin,{capB:{hex:P.skin}});
    tube(FIST1.clone().addScaledVector(AXIS,-0.05), FIST1.clone().addScaledVector(AXIS,0.05), 0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    tube(E.clone().lerp(W,0.55).add(V(0,0.01,0)), E.clone().lerp(W,0.72).add(V(0,0.01,0)), 0.050,0.048,6,P.wrap);

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const FIST2=G2.clone();
    const E2=V(-0.260,0.780,0.06);
    tube(S2,E2,0.070,0.056,6,P.skin);
    const WR2=E2.clone().lerp(FIST2,0.72);
    tube(E2,WR2,0.052,0.044,6,P.skin);
    tube(E2.clone().lerp(FIST2,0.55).add(V(0,0.01,0)), WR2.clone().add(V(0,0.01,0)), 0.048,0.044,6,P.wrap);
    tube(WR2, FIST2.clone().addScaledVector(AXIS,-0.045), 0.044,0.058,6,P.skin,{capB:{hex:P.skinDk}});
    tube(FIST2.clone().addScaledVector(AXIS,-0.045), FIST2.clone().addScaledVector(AXIS,0.045), 0.058,0.052,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skin}});
  }

  /* LEGS — wide horse-stance, cropped trousers, BARE feet (slim tiefling) */
  {
    const hipL=V(-0.185, L.hipY-0.01, 0.02), kneeL=V(-0.220,0.36,0.10), ankL=V(-0.210,0.075,0.055);
    const hipR=V( 0.185, L.hipY-0.01, -0.01), kneeR=V( 0.230,0.36,-0.075), ankR=V( 0.220,0.075,-0.10);
    tube(hipL,kneeL,0.082,0.060,6,P.trouser);
    tube(kneeL, kneeL.clone().lerp(ankL,0.55), 0.056,0.044,6,P.trouser);
    tube(hipR,kneeR,0.082,0.060,6,P.trouser);
    tube(kneeR, kneeR.clone().lerp(ankR,0.55), 0.056,0.044,6,P.trouser);
    for(const [knee,ank] of [[kneeL,ankL],[kneeR,ankR]]){
      const hemA=knee.clone().lerp(ank,0.55);
      stack([{y:hemA.y+0.015, rx:0.050, rz:0.046, cx:hemA.x, cz:hemA.z, hex:P.trouserDk}], 6, {});
      tube(hemA, ank, 0.044,0.036,6,P.skin);
      tube(hemA.clone().lerp(ank,0.55), hemA.clone().lerp(ank,0.78), 0.040,0.038,6,P.wrap);
    }
    for(const [ank,toeDir] of [[ankL,V(0.08,0,1)], [ankR,V(0.75,0,0.35).normalize()]]){
      stack([
        {y:0.010, rx:0.058, rz:0.070, cx:ank.x, cz:ank.z, hex:P.skinDk},
        {y:0.055, rx:0.052, rz:0.058, cx:ank.x, cz:ank.z, hex:P.skin},
      ], 6, {capTop:{hex:P.skin, lift:0.004}, capBot:{hex:P.skinDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.105), 0.048,0.030,6,P.skin, {capB:{hex:P.skinDk, lift:0.012}, raz:0.042, rbz:0.026});
    }
  }

  /* TAIL — thin spade-tipped tail (inherited) */
  {
    const root = V(0.030, L.hipY-0.045, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.giDk);
    tube(t1,   t2, 0.031, 0.022, 6, P.skinDk);
    tube(t2,   t3, 0.022, 0.013, 6, P.skinDk);
    tube(t3,   tip,0.013, 0.006, 6, P.skinDk);
    const axis = new THREE.Vector3().subVectors(tip,t3).normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), axis).normalize();
    const fwd  = tip.clone().addScaledVector(axis, 0.052);
    const back = tip.clone().addScaledVector(axis, -0.014);
    const wingL= tip.clone().addScaledVector(side, 0.040).addScaledVector(axis, 0.006);
    const wingR= tip.clone().addScaledVector(side,-0.040).addScaledVector(axis, 0.006);
    quad(back, wingR, fwd, wingL, P.skinDk, 0.03);
    quad(back, wingL, fwd, wingR, P.skinDk, 0.03);
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
