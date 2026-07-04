/* dev/model-qa/creatures/halfling-monk.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED halfling race (slim ~1.0u, BARE oversized feet — which double perfectly as the monk's
   barefoot read) wearing the MONK kit (monk.js signature: a simple wrap-top GI cinched by a
   contrasting red SASH with a trailing knot, wrist wraps, a QUARTERSTAFF held diagonally two-handed
   so both fists derive from the shaft, and a WIDE LOW HORSE-STANCE). Halfling monks keep the curly
   hair (no shaved head — that's the human monk read; the halfling stays halfling). Bare feet inherited
   from the race. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalflingMonk(){
  const P = {
    gi:0xa89670, giDk:0x7d6d50, giLt:0xbcac86,
    sash:0xa8342c, sashDk:0x7a2620,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    wrap:0xd8cdb0, wrapDk:0xa89b7c,
    hair:0x5a3c26, hairDk:0x412a1a, eye:0x1a1512,
    trouser:0x4f4a3e, trouserDk:0x3a362c,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.375, waistY:0.42, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* torso — the gi wrap-top, slim halfling frame */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.096, hex:P.trouserDk},
    {y:L.waistY, rx:0.114, rz:0.090, hex:P.gi},
    {y:L.ribY,   rx:0.124, rz:0.098, hex:P.gi},
    {y:L.chestY, rx:0.132, rz:0.100, hex:P.giLt},
    {y:L.shldY,  rx:0.134, rz:0.096, hex:P.gi},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* wrap-top V-crossover */
  {
    const zs=[[L.shldY-0.01,0.098],[L.chestY,0.100],[L.ribY,0.094],[L.waistY,0.086]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.068,y1,z1+0.006), V(0.004,y1,z1-0.004), V(0.016,y2,z2-0.004), V(-0.056,y2,z2+0.006), P.giLt, 0.03);
    }
  }

  /* SASH — red band at the waist + trailing knot */
  stack([
    {y:L.waistY-0.035, rx:0.128, rz:0.096, hex:P.sashDk},
    {y:L.waistY-0.005, rx:0.126, rz:0.094, hex:P.sash},
    {y:L.waistY+0.025, rx:0.124, rz:0.092, hex:P.sash},
    {y:L.waistY+0.045, rx:0.122, rz:0.090, hex:P.sashDk},
  ], 8, {capTop:{hex:P.sashDk,lift:0.005}, capBot:{hex:P.sashDk,lift:0.0}});
  {
    const kc=V(-0.105,L.waistY-0.015,0.07);
    tube(V(kc.x+0.008,kc.y-0.01,kc.z), V(kc.x-0.012,kc.y-0.16,kc.z-0.015), 0.016,0.008,5,P.sash,{capB:{hex:P.sashDk}});
    tube(V(kc.x-0.015,kc.y-0.01,kc.z+0.008), V(kc.x-0.03,kc.y-0.13,kc.z+0.02), 0.014,0.006,5,P.sashDk,{capB:{hex:P.sashDk}});
  }

  /* HEAD — inherited halfling */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.072, rz:0.078, hex:P.skin},
      {y:L.cheekY, rx:0.098, rz:0.096, hex:P.skin},
      {y:L.browY,  rx:0.102, rz:0.094, hex:P.skin},
      {y:L.crownY, rx:0.080, rz:0.072, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);
  }

  /* CURLY HAIR CAP (inherited) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.045, rx:0.104, rz:0.096, hex:P.hairDk},
      {y:L.crownY-0.005,rx:0.114, rz:0.104, hex:P.hair},
      {y:L.crownY+0.045,rx:0.098, rz:0.088, hex:P.hair},
      {y:L.headTopY+0.010, rx:0.060, rz:0.053, hex:P.hairDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,-0.004), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY+0.045, -0.004), P.hairDk);
    for(const a of [0.3,1.1,2.0,2.9,3.7,4.6,5.4]){
      const cx=Math.cos(a)*0.100, cz=Math.sin(a)*0.094-0.004, cy=L.crownY+Math.sin(a*3)*0.018;
      const base=V(cx,cy,cz), out=base.clone().addScaledVector(V(cx,0.01,cz).normalize(),0.014);
      tube(base, out, 0.016, 0.014, 4, P.hair, {capB:{hex:P.hair, lift:0.003}});
    }
  }

  /* QUARTERSTAFF FIRST — diagonal two-handed; both fists derive (scaled halfling) */
  const G1=V(0.155,0.68,0.16);
  const G2=V(-0.150,0.40,0.125);
  const STAFF_A=G1.clone().addScaledVector(new THREE.Vector3().subVectors(G1,G2).normalize(), 0.34);
  const STAFF_B=G2.clone().addScaledVector(new THREE.Vector3().subVectors(G2,G1).normalize(), 0.34);
  const AXIS=new THREE.Vector3().subVectors(STAFF_A,STAFF_B).normalize();
  {
    tube(STAFF_B, STAFF_A, 0.020, 0.020, 8, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
    tube(G1.clone().addScaledVector(AXIS,-0.05), G1.clone().addScaledVector(AXIS,0.05), 0.024,0.024,8,P.woodDk);
    tube(G2.clone().addScaledVector(AXIS,-0.05), G2.clone().addScaledVector(AXIS,0.05), 0.024,0.024,8,P.woodDk);
  }

  /* ARMS — both fists derived from the staff grips, wrist wraps */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const E=V(0.185,0.575,0.12);
    tube(S,E,0.050,0.040,6,P.skin);
    tube(E,G1.clone(),0.038,0.032,6,P.skin,{capB:{hex:P.skin}});
    tube(E.clone().lerp(G1,0.55).add(V(0,0.005,0)), E.clone().lerp(G1,0.75).add(V(0,0.005,0)), 0.036,0.034,6,P.wrap);
    tube(G1.clone().addScaledVector(AXIS,-0.04), G1.clone().addScaledVector(AXIS,0.04), 0.034,0.030,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const E2=V(-0.175,0.475,0.06);
    tube(S2,E2,0.050,0.040,6,P.skin);
    const WR2=E2.clone().lerp(G2,0.72);
    tube(E2,WR2,0.038,0.032,6,P.skin);
    tube(E2.clone().lerp(G2,0.55).add(V(0,0.005,0)), WR2.clone().add(V(0,0.005,0)), 0.034,0.032,6,P.wrap);
    tube(WR2, G2.clone().addScaledVector(AXIS,-0.035), 0.032,0.040,6,P.skin,{capB:{hex:P.skinDk}});
    tube(G2.clone().addScaledVector(AXIS,-0.035), G2.clone().addScaledVector(AXIS,0.035), 0.040,0.036,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skin}});
  }

  /* LEGS — wide horse-stance, cropped trousers, BARE feet (inherited icon) */
  {
    const hipL=V(-0.135, L.hipY-0.01, 0.02), kneeL=V(-0.165,0.24,0.075), shinL=V(-0.155,0.15,0.04);
    const hipR=V( 0.135, L.hipY-0.01, -0.01), kneeR=V( 0.175,0.24,-0.055), shinR=V( 0.165,0.15,-0.075);
    tube(hipL,kneeL,0.056,0.044,6,P.trouser); tube(kneeL,shinL,0.044,0.036,6,P.trouser);
    tube(hipR,kneeR,0.056,0.044,6,P.trouser); tube(kneeR,shinR,0.044,0.036,6,P.trouser);
    /* cropped hem + bare shin */
    for(const shin of [shinL,shinR]){
      stack([{y:shin.y+0.010, rx:0.044, rz:0.040, cx:shin.x, cz:shin.z, hex:P.trouserDk}],6,{});
      tube(shin, V(shin.x,0.075,shin.z), 0.038,0.040,6,P.skin);
    }
    for(const [shin,toeDir] of [[shinL,V(0.05,0,1)], [shinR,V(0.70,0,0.40).normalize()]]){
      stack([
        {y:0.016, rx:0.076, rz:0.094, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.060, rx:0.070, rz:0.082, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.040,shin.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.070,0.052,6,P.footpad, {capB:{hex:P.footpad, lift:0.016}, raz:0.060, rbz:0.042});
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
