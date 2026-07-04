/* dev/model-qa/creatures/dwarf-monk.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED dwarf race (squat-broad race-dwarf proportions + massive beard + eyeless head) wearing the
   MONK kit (monk.js signature: a simple wrap-top GI cinched by a contrasting red SASH with a trailing
   knot, wrist wraps, a QUARTERSTAFF held diagonally two-handed so both fists derive from the shaft, a
   WIDE LOW HORSE-STANCE). The dwarf keeps the beard (no shaved head — the beard IS the read) over a
   cropped topknot. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarfMonk(){
  const P = {
    gi:0xb0a07a, giDk:0x847557, giLt:0xc6b78e,
    sash:0xa8342c, sashDk:0x7a2620,
    skin:0xb98a63, skinDk:0x7f5f42,
    beard:0x9a9086, beardDk:0x6d655c,
    wrap:0xd8cdb0, wrapDk:0xa89b7c,
    hair:0x8a8078, hairDk:0x605852, eye:0x1a1512,
    trouser:0x4f4a3e, trouserDk:0x3a362c,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.235,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* torso — gi wrap-top, dwarf-broad */
  stack([
    {y:L.hipY,   rx:0.222, rz:0.172, hex:P.trouserDk},
    {y:L.waistY, rx:0.230, rz:0.180, hex:P.gi},
    {y:L.ribY,   rx:0.246, rz:0.190, hex:P.gi},
    {y:L.chestY, rx:0.254, rz:0.196, hex:P.giLt},
    {y:L.shldY,  rx:0.256, rz:0.188, hex:P.gi},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});
  /* wrap-top V-crossover */
  {
    const zs=[[L.shldY-0.01,0.188],[L.chestY,0.194],[L.ribY,0.188],[L.waistY,0.180]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.120,y1,z1+0.006), V(0.010,y1,z1-0.004), V(0.024,y2,z2-0.004), V(-0.100,y2,z2+0.006), P.giLt, 0.03);
    }
  }

  /* SASH — red band at the waist + trailing knot */
  stack([
    {y:L.waistY-0.03, rx:0.248, rz:0.194, hex:P.sashDk},
    {y:L.waistY,      rx:0.246, rz:0.192, hex:P.sash},
    {y:L.waistY+0.03, rx:0.244, rz:0.190, hex:P.sash},
    {y:L.waistY+0.05, rx:0.242, rz:0.188, hex:P.sashDk},
  ], 8, {capTop:{hex:P.sashDk,lift:0.005}, capBot:{hex:P.sashDk,lift:0.0}});
  {
    const kc=V(-0.205,L.waistY-0.010,0.14);
    tube(V(kc.x+0.008,kc.y-0.01,kc.z), V(kc.x-0.012,kc.y-0.20,kc.z-0.015), 0.020,0.010,5,P.sash,{capB:{hex:P.sashDk}});
    tube(V(kc.x-0.018,kc.y-0.01,kc.z+0.008), V(kc.x-0.035,kc.y-0.16,kc.z+0.02), 0.017,0.008,5,P.sashDk,{capB:{hex:P.sashDk}});
  }

  /* HEAD — inherited dwarf (eyeless) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.104, hex:P.skin},
      {y:L.cheekY, rx:0.128, rz:0.122, hex:P.skin},
      {y:L.browY,  rx:0.132, rz:0.118, hex:P.skin},
      {y:L.crownY, rx:0.100, rz:0.090, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.026;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
  }

  /* MASSIVE BEARD (inherited) — a tied monk beard */
  {
    const bands=[
      {y:L.jawY+0.005, rx:0.125, rz:0.095, cz:0.135, hex:P.beard},
      {y:L.cheekY-0.05, rx:0.120, rz:0.088, cz:0.185, hex:P.beard},
      {y:0.735,         rx:0.112, rz:0.080, cz:0.225, hex:P.beard},
      {y:0.665,         rx:0.100, rz:0.070, cz:0.250, hex:P.beard},
      {y:0.59,          rx:0.086, rz:0.060, cz:0.260, hex:P.beardDk},
      {y:0.515,         rx:0.066, rz:0.048, cz:0.250, hex:P.beardDk},
      {y:L.waistY+0.01, rx:0.044, rz:0.034, cz:0.215, hex:P.beardDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.waistY-0.03,0.185), P.beardDk);
  }

  /* CROPPED TOPKNOT (no helm) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.010, rx:0.136, rz:0.122, hex:P.hairDk},
      {y:L.crownY+0.004,rx:0.106, rz:0.096, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[1,2,3,4,5,6]});
    capFan(rings[1], V(0, L.headTopY+0.010, -0.004), P.hair);
    tube(V(0,L.crownY+0.02,-0.01), V(0.01,L.headTopY+0.09,-0.05), 0.022,0.010,6,P.hairDk,{capB:{hex:P.hairDk}});
  }

  /* QUARTERSTAFF FIRST — diagonal two-handed; both fists derive (scaled dwarf) */
  const G1=V(0.255,0.78,0.20);
  const G2=V(-0.250,0.46,0.155);
  const STAFF_A=G1.clone().addScaledVector(new THREE.Vector3().subVectors(G1,G2).normalize(), 0.40);
  const STAFF_B=G2.clone().addScaledVector(new THREE.Vector3().subVectors(G2,G1).normalize(), 0.40);
  const AXIS=new THREE.Vector3().subVectors(STAFF_A,STAFF_B).normalize();
  {
    tube(STAFF_B, STAFF_A, 0.024, 0.024, 8, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
    tube(G1.clone().addScaledVector(AXIS,-0.05), G1.clone().addScaledVector(AXIS,0.05), 0.028,0.028,8,P.woodDk);
    tube(G2.clone().addScaledVector(AXIS,-0.05), G2.clone().addScaledVector(AXIS,0.05), 0.028,0.028,8,P.woodDk);
  }

  /* ARMS — both fists derived from the staff grips, wrist wraps */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const E=V(0.290,0.665,0.14);
    tube(S,E,0.092,0.072,6,P.gi);
    tube(E,G1.clone(),0.066,0.052,6,P.skin,{capB:{hex:P.skin}});
    tube(E.clone().lerp(G1,0.55), E.clone().lerp(G1,0.78), 0.062,0.058,6,P.wrap);
    tube(G1.clone().addScaledVector(AXIS,-0.05), G1.clone().addScaledVector(AXIS,0.05), 0.058,0.052,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const E2=V(-0.290,0.560,0.07);
    tube(S2,E2,0.092,0.072,6,P.gi);
    const WR2=E2.clone().lerp(G2,0.72);
    tube(E2,WR2,0.066,0.052,6,P.skin);
    tube(E2.clone().lerp(G2,0.55), WR2, 0.062,0.058,6,P.wrap);
    tube(WR2, G2.clone().addScaledVector(AXIS,-0.045), 0.056,0.058,6,P.skin,{capB:{hex:P.skinDk}});
    tube(G2.clone().addScaledVector(AXIS,-0.045), G2.clone().addScaledVector(AXIS,0.045), 0.058,0.052,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skin}});
  }

  /* LEGS — wide horse-stance, cropped trousers, geta sandals */
  {
    const hipL=V(-0.170, L.hipY-0.01, 0.04), kneeL=V(-0.230,0.26,0.10), shinL=V(-0.215,0.13,0.05);
    const hipR=V( 0.170, L.hipY-0.01, -0.02), kneeR=V( 0.240,0.26,-0.075), shinR=V( 0.225,0.13,-0.10);
    tube(hipL,kneeL,0.094,0.070,6,P.trouser); tube(kneeL,shinL,0.070,0.052,6,P.trouser);
    tube(hipR,kneeR,0.094,0.070,6,P.trouser); tube(kneeR,shinR,0.070,0.052,6,P.trouser);
    for(const shin of [shinL,shinR]){
      stack([{y:shin.y+0.010, rx:0.070, rz:0.058, cx:shin.x, cz:shin.z, hex:P.trouserDk}],6,{});
    }
    for(const [shin,toeDir] of [[shinL,V(0.05,0,1)], [shinR,V(0.70,0,0.40).normalize()]]){
      stack([
        {y:0.016, rx:0.086, rz:0.100, cx:shin.x, cz:shin.z, hex:P.wrapDk},
        {y:0.055, rx:0.080, rz:0.090, cx:shin.x, cz:shin.z, hex:P.wrap},
      ], 6, {capTop:{hex:P.wrap, lift:0.003}, capBot:{hex:P.wrapDk, lift:0.0}});
      const toeA=V(shin.x,0.040,shin.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.076,0.056,6,P.skin, {capB:{hex:P.skin, lift:0.016}, raz:0.066, rbz:0.046});
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
