/* dev/model-qa/creatures/dwarf-rogue.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED dwarf race (squat-broad race-dwarf proportions + massive beard + eyeless head) wearing the
   ROGUE kit (rogue.js signature: a low sneaky CROUCH, a leather torso + crossed baldric, a dark hood
   over the beard, twin DAGGERS — one lead forward-stab, one reverse tucked close). The dagger is the
   shared reusable buildDagger from parts.js, authored first so the fists derive true. The whole upper
   body drops + pitches forward via a crouch() transform (the F2 rogue idiom). Beard + broad frame keep
   the dwarf read even hunched. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { buildDagger } from '../parts.js';

export function buildDwarfRogue(){
  const P = {
    skin:0xb98a63, skinDk:0x7f5f42, eye:0x1a1512,
    beard:0x8a8078, beardDk:0x605852,
    hood:0x35383b, hoodDk:0x242628,
    leather:0x4a3a28, leatherDk:0x33281b, leatherLt:0x5c4832,
    strap:0x2a2119, trouser:0x342c22, boot:0x241d15,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.235,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* CROUCH transform — drop + forward pitch above the hips (F2 rogue idiom, scaled to the low dwarf) */
  const DROP = 0.10, PITCH = 0.28;
  const PIVOT = V(0.0, L.hipY - DROP, 0.02);
  const crouch = (p)=>{
    const q = p.clone().add(V(0, -DROP, 0)).sub(PIVOT);
    q.applyAxisAngle(V(1,0,0), PITCH);
    return q.add(PIVOT);
  };

  /* TWIN DAGGERS FIRST (shared module ×2), in the crouched frame, held CLOSE */
  const gripR = crouch(V(0.235, 0.560, 0.30));           // lead hand: forward + low
  const dirR  = V(0.24,-0.16,1).normalize();
  const gripL = crouch(V(-0.155, 0.640, 0.16));          // off hand: high + in near the chest
  const dirL  = V(-0.10,-0.94,0.28).normalize();         // reverse grip, blade down
  const fistR = buildDagger(gripR, dirR, P);
  const fistL = buildDagger(gripL, dirL, P);

  /* TORSO — slim-ish leather over the barrel, crouched */
  stack([
    {y:L.hipY,   rx:0.220, rz:0.170, hex:P.leatherDk},
    {y:L.waistY, rx:0.230, rz:0.180, hex:P.leather},
    {y:L.ribY,   rx:0.242, rz:0.188, hex:P.leather},
    {y:L.chestY, rx:0.248, rz:0.190, hex:P.leatherLt},
    {y:L.shldY,  rx:0.250, rz:0.182, hex:P.leatherLt},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}, xform:crouch});
  /* short hip tassets */
  stack([
    {y:0.30, rx:0.244, rz:0.190, hex:P.leatherDk},
    {y:0.40, rx:0.230, rz:0.178, hex:P.leather},
  ], 8, {xform:crouch});
  /* crossed baldric straps */
  tube(crouch(V(-0.20,0.53,0.19)), crouch(V(0.19,0.70,0.16)), 0.018,0.016,5,P.strap);
  tube(crouch(V(0.20,0.53,0.16)),  crouch(V(-0.19,0.70,0.19)),0.018,0.016,5,P.strap);

  /* HEAD — inherited dwarf (eyeless), under the crouch xform */
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
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], crouch(V(0, L.headTopY, 0.010)), P.skinDk);
  }

  /* MASSIVE BEARD (inherited), under the crouch xform */
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
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), crouch(V(0,L.waistY-0.03,0.185)), P.beardDk);
  }

  /* HOOD — dark, open-face; passed through crouch so it leans with the head */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.128, rz:0.120, hex:P.hoodDk},
      {y:L.jawY+0.03,   rx:0.158, rz:0.146, hex:P.hood},
      {y:L.browY+0.02,  rx:0.162, rz:0.146, hex:P.hood},
      {y:L.crownY+0.02, rx:0.128, rz:0.118, hex:P.hood},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.018);
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], crouch(V(0, L.headTopY+0.045, -0.03)), P.hood);
  }

  /* ARMS — each derived to its dagger fist (short, bent, close), from crouched shoulders */
  {
    const shR = crouch(V(L.shoulderX, L.shldY-0.01, 0.015));
    const shL = crouch(V(-L.shoulderX, L.shldY-0.01, 0.015));
    for(const [sh, fist, bend] of [[shR, fistR, V(0.04,-0.01,0.06)], [shL, fistL, V(-0.06,0.0,0.05)]]){
      const elbow = sh.clone().lerp(fist, 0.5).add(bend);
      tube(sh, elbow, 0.092, 0.072, 6, P.leather);
      tube(elbow, fist, 0.066, 0.052, 6, P.leatherDk, {capB:{hex:P.skin}});
    }
  }

  /* LEGS — short thick wide-braced crouch, feet planted under the body */
  {
    const hipL = crouch(V(-L.hipHalf, L.hipY-0.01, 0.01));
    const hipR = crouch(V( L.hipHalf, L.hipY-0.01, 0.00));
    const kneeL=V(-0.220, 0.24, 0.11), ankL=V(-0.185, 0.085, -0.01);
    const kneeR=V( 0.225, 0.23, 0.20), ankR=V( 0.190, 0.085, 0.13);
    tube(hipL,kneeL,0.094,0.070,6,P.trouser); tube(kneeL,ankL,0.070,0.052,6,P.trouser);
    tube(hipR,kneeR,0.094,0.070,6,P.trouser); tube(kneeR,ankR,0.070,0.052,6,P.trouser);
    for(const [ank,toe] of [[ankL,V(0.06,0,1)], [ankR,V(0.50,0,0.86)]]){
      const d=toe.clone().normalize(), toeA=V(ank.x,0.05,ank.z);
      stack([
        {y:0.012, rx:0.078, rz:0.086, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.11,  rx:0.070, rz:0.072, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.006}});
      tube(toeA, toeA.clone().addScaledVector(d,0.130), 0.064,0.048,6,P.boot,{capB:{hex:P.boot,lift:0.014},raz:0.054,rbz:0.038});
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
