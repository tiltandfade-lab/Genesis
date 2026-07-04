/* dev/model-qa/creatures/gnome-monk.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED gnome race (post-F1 big head + wedge EARS + eyeless, stubby frame) wearing the MONK kit
   (monk.js signature: a wrap-top GI cinched by a red SASH with a trailing knot, wrist wraps, a
   QUARTERSTAFF held diagonally two-handed so both fists derive from the shaft, a WIDE LOW HORSE-STANCE).
   The gnome keeps its big head + ears (race-read). One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnomeMonk(){
  const P = {
    gi:0xa89670, giDk:0x7d6d50, giLt:0xbcac86,
    sash:0xa8342c, sashDk:0x7a2620,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    wrap:0xd8cdb0, wrapDk:0xa89b7c,
    hair:0x6d4b2c, hairDk:0x4a331d,
    trouser:0x4f4a3e, trouserDk:0x3a362c,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.335, waistY:0.375, ribY:0.425, chestY:0.465, shldY:0.485, neckY:0.515,
    hipHalf:0.100, shoulderX:0.145,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* torso — gi wrap-top, gnome stubby */
  stack([
    {y:L.hipY,   rx:0.148, rz:0.126, hex:P.trouserDk},
    {y:L.waistY, rx:0.166, rz:0.140, hex:P.gi},
    {y:L.ribY,   rx:0.156, rz:0.130, hex:P.gi},
    {y:L.chestY, rx:0.150, rz:0.124, hex:P.giLt},
    {y:L.shldY,  rx:0.148, rz:0.120, hex:P.gi},
    {y:L.neckY,  rx:0.070, rz:0.066, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  /* wrap-top V-crossover */
  {
    const zs=[[L.shldY-0.01,0.120],[L.chestY,0.124],[L.ribY,0.118],[L.waistY,0.110]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.084,y1,z1+0.006), V(0.006,y1,z1-0.004), V(0.018,y2,z2-0.004), V(-0.070,y2,z2+0.006), P.giLt, 0.03);
    }
  }

  /* SASH — red band + trailing knot */
  stack([
    {y:L.waistY-0.03, rx:0.170, rz:0.130, hex:P.sashDk},
    {y:L.waistY,      rx:0.168, rz:0.128, hex:P.sash},
    {y:L.waistY+0.03, rx:0.166, rz:0.126, hex:P.sash},
    {y:L.waistY+0.048, rx:0.164, rz:0.124, hex:P.sashDk},
  ], 8, {capTop:{hex:P.sashDk,lift:0.005}, capBot:{hex:P.sashDk,lift:0.0}});
  {
    const kc=V(-0.140,L.waistY-0.010,0.10);
    tube(V(kc.x+0.006,kc.y-0.01,kc.z), V(kc.x-0.012,kc.y-0.16,kc.z-0.012), 0.014,0.007,5,P.sash,{capB:{hex:P.sashDk}});
    tube(V(kc.x-0.014,kc.y-0.01,kc.z+0.006), V(kc.x-0.028,kc.y-0.13,kc.z+0.016), 0.012,0.006,5,P.sashDk,{capB:{hex:P.sashDk}});
  }

  /* HEAD — inherited gnome (big head, ears, eyeless) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.106, hex:P.skin},
      {y:L.cheekY, rx:0.134, rz:0.128, hex:P.skin},
      {y:L.browY,  rx:0.138, rz:0.126, hex:P.skin},
      {y:L.crownY, rx:0.106, rz:0.097, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.026;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
    for(const s of [-1,1]){
      const eb=V(s*0.128, L.cheekY+0.008, 0.016);
      const et=eb.clone().add(V(s*0.078, 0.032, -0.010));
      tube(eb, et, 0.024, 0.009, 5, P.ear, {capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.004}});
    }
  }

  /* CROPPED TOPKNOT */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.010, rx:0.140, rz:0.128, hex:P.hairDk},
      {y:L.crownY+0.004,rx:0.108, rz:0.098, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[1,2,3,4,5,6]});
    capFan(rings[1], V(0, L.headTopY+0.010, -0.004), P.hair);
    tube(V(0,L.crownY+0.02,-0.01), V(0.008,L.headTopY+0.07,-0.04), 0.018,0.008,6,P.hairDk,{capB:{hex:P.hairDk}});
  }

  /* QUARTERSTAFF FIRST — diagonal two-handed; both fists derive (scaled gnome) */
  const G1=V(0.160,0.60,0.14);
  const G2=V(-0.155,0.36,0.11);
  const STAFF_A=G1.clone().addScaledVector(new THREE.Vector3().subVectors(G1,G2).normalize(), 0.30);
  const STAFF_B=G2.clone().addScaledVector(new THREE.Vector3().subVectors(G2,G1).normalize(), 0.30);
  const AXIS=new THREE.Vector3().subVectors(STAFF_A,STAFF_B).normalize();
  {
    tube(STAFF_B, STAFF_A, 0.019, 0.019, 8, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
    tube(G1.clone().addScaledVector(AXIS,-0.045), G1.clone().addScaledVector(AXIS,0.045), 0.022,0.022,8,P.woodDk);
    tube(G2.clone().addScaledVector(AXIS,-0.045), G2.clone().addScaledVector(AXIS,0.045), 0.022,0.022,8,P.woodDk);
  }

  /* ARMS — both fists derived from the staff grips, wrist wraps */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const E=V(0.185,0.495,0.10);
    tube(S,E,0.052,0.042,6,P.skin);
    tube(E,G1.clone(),0.040,0.034,6,P.skin,{capB:{hex:P.skin}});
    tube(E.clone().lerp(G1,0.55), E.clone().lerp(G1,0.78), 0.038,0.036,6,P.wrap);
    tube(G1.clone().addScaledVector(AXIS,-0.04), G1.clone().addScaledVector(AXIS,0.04), 0.036,0.032,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const E2=V(-0.180,0.415,0.05);
    tube(S2,E2,0.052,0.042,6,P.skin);
    const WR2=E2.clone().lerp(G2,0.72);
    tube(E2,WR2,0.040,0.034,6,P.skin);
    tube(E2.clone().lerp(G2,0.55), WR2, 0.038,0.036,6,P.wrap);
    tube(WR2, G2.clone().addScaledVector(AXIS,-0.035), 0.036,0.038,6,P.skin,{capB:{hex:P.skinDk}});
    tube(G2.clone().addScaledVector(AXIS,-0.035), G2.clone().addScaledVector(AXIS,0.035), 0.038,0.034,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skin}});
  }

  /* LEGS — wide horse-stance, cropped trousers, sandals */
  {
    const hipL=V(-0.115, L.hipY-0.01, 0.03), kneeL=V(-0.155,0.22,0.075), shinL=V(-0.145,0.12,0.04);
    const hipR=V( 0.115, L.hipY-0.01, -0.01), kneeR=V( 0.165,0.22,-0.055), shinR=V( 0.155,0.12,-0.075);
    tube(hipL,kneeL,0.056,0.044,6,P.trouser); tube(kneeL,shinL,0.044,0.036,6,P.trouser);
    tube(hipR,kneeR,0.056,0.044,6,P.trouser); tube(kneeR,shinR,0.044,0.036,6,P.trouser);
    for(const shin of [shinL,shinR]){
      stack([{y:shin.y+0.008, rx:0.050, rz:0.042, cx:shin.x, cz:shin.z, hex:P.trouserDk}],6,{});
    }
    for(const [shin,toeDir] of [[shinL,V(0.05,0,1)], [shinR,V(0.70,0,0.40).normalize()]]){
      stack([
        {y:0.012, rx:0.066, rz:0.078, cx:shin.x, cz:shin.z, hex:P.wrapDk},
        {y:0.045, rx:0.060, rz:0.070, cx:shin.x, cz:shin.z, hex:P.wrap},
      ], 6, {capTop:{hex:P.wrap, lift:0.003}, capBot:{hex:P.wrapDk, lift:0.0}});
      const toeA=V(shin.x,0.035,shin.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.110), 0.058,0.044,6,P.skin, {capB:{hex:P.skin, lift:0.013}, raz:0.050, rbz:0.036});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
