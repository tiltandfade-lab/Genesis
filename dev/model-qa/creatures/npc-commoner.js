/* dev/model-qa/creatures/npc-commoner.js — the generic town commoner (whole-object NPC).
   Same whole-object grammar as humanoid.js: one function, one geometry frame, no anchors.
   The read IS genericness: a plain knee tunic, a rope belt, bare simple shoes, a slight working
   stoop, and a small SACK carried in one hand (authored first — the hand derives from its grip).
   Undyed cloth. No weapon, no armor, no heroic pose. Uses the shared rig/head/base from parts.js
   so proportions match the class figures exactly (head-top ~1.475, humanoid.js's numbers). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildCommoner(){
  /* ---------- PALETTE (undyed, humble — the least saturated cloth in the cast) ---------- */
  const P = Object.assign({}, BASE_P, {
    tunic:0x8c8064, tunicDk:0x6b6249, linen:0xc9bfa0, linenDk:0x93876a,
    rope:0x9c8a5c, ropeDk:0x6e5f3c, skin:0xc49a72, skinDk:0x8a6a4e,
    trouser:0x746a52, shoe:0x4d4232, shoeDk:0x362e22,
    sack:0xa88f5e, sackDk:0x7a6540,
  });

  /* ---------- RIG — same landmarks as humanoid.js, a hair shorter/slumped (working stoop) ---------- */
  const L = humanoidRig({
    hipY:0.70, waistY:0.775, ribY:0.875, chestY:0.975, shldY:1.055, neckY:1.095,
    jawY:1.125, cheekY:1.20, browY:1.275, crownY:1.365, headTopY:1.425,
  });

  /* SACK FIRST — carried low in the left hand, the grip is ground truth for the arm */
  const GRIP=V(-0.30,0.62,0.14);
  {
    /* sack body: a lumpy bag, gathered + tied at the top (small ellipsoid-ish loft) */
    const bands=[
      {y:GRIP.y-0.235, rx:0.001, rz:0.001, hex:P.sackDk},
      {y:GRIP.y-0.20,  rx:0.075, rz:0.070, hex:P.sack},
      {y:GRIP.y-0.12,  rx:0.105, rz:0.098, hex:P.sack},
      {y:GRIP.y-0.03,  rx:0.098, rz:0.090, hex:P.sack},
      {y:GRIP.y+0.03,  rx:0.052, rz:0.048, hex:P.sackDk},   // gathered neck, at the grip
    ];
    const rings=bands.map(b=>ring(V(GRIP.x,b.y,GRIP.z), V(0,1,0), b.rx, b.rz, 7, 0));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(GRIP.x,GRIP.y+0.06,GRIP.z), P.sackDk);
    /* a twist of rope cinching the neck */
    tube(V(GRIP.x-0.058,GRIP.y+0.005,GRIP.z), V(GRIP.x+0.058,GRIP.y+0.01,GRIP.z), 0.012,0.012,5,P.ropeDk);
  }

  /* forward working stoop — lean increases with height above the hip pivot (fwd = +z) */
  const HIP_PIVOT_Y = L.hipY;
  const lean = (p) => { const t = Math.max(0, p.y - HIP_PIVOT_Y); return V(p.x, p.y - t*0.05, p.z + t*0.34); };

  /* trunk — plain tunic loft, hips -> neck, slightly narrower/humbler than the fighter */
  stack([
    {y:L.hipY,   rx:0.185, rz:0.140, hex:P.tunicDk},
    {y:L.waistY, rx:0.155, rz:0.118, hex:P.tunic},
    {y:L.ribY,   rx:0.180, rz:0.135, hex:P.tunic},
    {y:L.chestY, rx:0.200, rz:0.148, hex:P.tunic},
    {y:L.shldY,  rx:0.198, rz:0.138, hex:P.tunic},
    {y:L.neckY,  rx:0.080, rz:0.075, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:lean});

  /* knee-length tunic skirt (plain, undyed, no ornament) */
  stack([
    {y:0.44, rx:0.225, rz:0.180, hex:P.tunicDk},
    {y:0.56, rx:0.205, rz:0.162, hex:P.tunic},
    {y:L.hipY-0.01, rx:0.188, rz:0.145, hex:P.tunic},
  ], 8, {});

  /* rope belt (a simple cord, no buckle) */
  {
    const b1=ring(V(0,0.735,0), V(0,1,0), 0.168, 0.128, 8, Math.PI/8);
    const b2=ring(V(0,0.755,0), V(0,1,0), 0.165, 0.125, 8, Math.PI/8);
    stitch([b1,b2], ()=>P.ropeDk);
    tube(V(0.01,0.735,0.128), V(0.03,0.60,0.135), 0.010,0.008,5,P.rope,{capB:{hex:P.ropeDk}});  // hanging cord tail
  }

  /* head (skin loft; nose ridge; painted eyes) — authored inline (not the shared module) so the
     forward stoop lean applies to every ring, same as humanoid.js's pattern. FRONT verts 1&2. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.080, rz:0.086, hex:P.skin},
      {y:L.cheekY, rx:0.110, rz:0.106, hex:P.skin},
      {y:L.browY,  rx:0.114, rz:0.105, hex:P.skin},
      {y:L.crownY, rx:0.089, rz:0.081, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph).map(lean));
    for(const i of [1,2]) rings[1][i].z += 0.021;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){
      const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
    }
    capFan(rings[3], lean(V(0, L.headTopY, 0.007)), P.skinDk);
    /* simple close-fitting cloth cap: a full dome from brow to crown-top + a rolled brim band,
       covering the whole scalp (fixes the earlier "floating strip" read) */
    const capBands=[
      {y:L.browY-0.01, rx:0.120, rz:0.114, hex:P.linenDk},
      {y:L.browY+0.05, rx:0.122, rz:0.116, hex:P.linen},
      {y:L.crownY+0.01,rx:0.098, rz:0.090, hex:P.linen},
      {y:L.headTopY+0.012, rx:0.040, rz:0.036, hex:P.linenDk},
    ];
    const capRings=capBands.map(b=>ring(V(0,b.y,0.004), V(0,1,0), b.rx, b.rz, n, ph).map(lean));
    stitch(capRings, b=>capBands[b].hex);
    capFan(capRings.at(-1), lean(V(0, L.headTopY+0.05, 0.0)), P.linenDk);
  }

  /* arms — right hangs loose at the side; left carries the sack (derived from GRIP) */
  {
    const S=V(L.shoulderX*0.94, L.shldY-0.01, 0.01), E=V(0.275,0.80,0.045), W=V(0.255,0.615,0.09);
    tube(S,E,0.068,0.055,6,P.tunic);
    tube(E,W,0.052,0.042,6,P.tunic);
    tube(W, W.clone().add(V(0.0,-0.075,0.015)), 0.040,0.034,6,P.skin,{capB:{hex:P.skinDk}});

    const S2=V(-L.shoulderX*0.94, L.shldY-0.01, 0.01), E2=V(-0.295,0.78,0.06);
    tube(S2,E2,0.068,0.055,6,P.tunic);
    tube(E2,GRIP,0.052,0.040,6,P.tunic,{capB:{hex:P.skin}});
    /* fist wraps the gathered sack neck */
    tube(GRIP.clone().add(V(-0.045,0.01,-0.03)), GRIP.clone().add(V(0.045,0.01,0.03)), 0.040,0.038,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* legs — plain trouser, humble stance (feet close together, not braced) */
  {
    const hipL=V(-L.hipHalf*0.95, L.hipY-0.01, 0.01), kneeL=V(-0.10,0.38,0.02), ankL=V(-0.09,0.075,0.01);
    const hipR=V( L.hipHalf*0.95, L.hipY-0.01, 0.00), kneeR=V( 0.11,0.38,-0.01), ankR=V( 0.10,0.075,-0.015);
    tube(hipL,kneeL,0.078,0.056,6,P.trouser);
    tube(kneeL,ankL,0.052,0.038,6,P.trouser);
    tube(hipR,kneeR,0.078,0.056,6,P.trouser);
    tube(kneeR,ankR,0.052,0.038,6,P.trouser);
    /* simple flat shoes, no boot cuff */
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(-0.05,0,1)]]){
      stack([
        {y:0.010, rx:0.058, rz:0.066, cx:ank.x, cz:ank.z, hex:P.shoeDk},
        {y:0.055, rx:0.052, rz:0.056, cx:ank.x, cz:ank.z, hex:P.shoe},
      ], 6, {capTop:{hex:P.shoe, lift:0.004}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.115), 0.048,0.036,6,P.shoe, {capB:{hex:P.shoe, lift:0.012}, raz:0.040, rbz:0.028});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
