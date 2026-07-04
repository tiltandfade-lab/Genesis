/* dev/model-qa/creatures/gnome-rogue.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED gnome race (post-F1 big head + wedge ears + wide eyes, stubby frame) wearing the ROGUE
   kit (rogue.js signature: a low sneaky CROUCH, a leather torso + crossed baldric, a dark hood, and
   twin DAGGERS — one lead forward-stab, one reverse/ice-pick grip tucked close). The dagger is the
   shared reusable `buildDagger` from parts.js, authored first so the fists derive true. The whole
   upper body is dropped + pitched forward by a crouch() transform (the F2 rogue idiom). The gnome
   must read as ITS RACE — big head + ears crouched low, not a short human. One whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { buildDagger } from '../parts.js';

export function buildGnomeRogue(){
  const P = {
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    hood:0x3a3d40, hoodDk:0x282a2c,
    leather:0x4a3a28, leatherDk:0x33281b, leatherLt:0x5c4832,
    strap:0x2a2119, trouser:0x342c22, boot:0x241d15,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.335, waistY:0.375, ribY:0.435, chestY:0.465, shldY:0.485, neckY:0.515,
    shoulderX:0.145,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* CROUCH transform — drop + forward pitch of everything above the hips (F2 rogue idiom, scaled) */
  const DROP = 0.11, PITCH = 0.32;
  const PIVOT = V(0.0, L.hipY - DROP, 0.02);
  const crouch = (p)=>{
    const q = p.clone().add(V(0, -DROP, 0)).sub(PIVOT);
    q.applyAxisAngle(V(1,0,0), PITCH);
    return q.add(PIVOT);
  };

  /* TWIN DAGGERS FIRST (shared module ×2), in the crouched/leaned frame, held CLOSE */
  const gripR = crouch(V(0.155, 0.475, 0.24));           // lead hand: forward + low
  const dirR  = V(0.22,-0.20,1).normalize();
  const gripL = crouch(V(-0.10, 0.545, 0.14));           // off hand: high + in near the chest
  const dirL  = V(-0.10,-0.94,0.28).normalize();         // reverse grip, blade down
  const fistR = buildDagger(gripR, dirR, P);
  const fistL = buildDagger(gripL, dirL, P);

  /* TORSO — slim leather, crouched. Pot-belly kept modest so it still reads gnome. */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.128, hex:P.leatherDk},
    {y:L.waistY, rx:0.175, rz:0.152, hex:P.leather},
    {y:L.chestY, rx:0.158, rz:0.132, hex:P.leatherLt},
    {y:L.shldY,  rx:0.150, rz:0.124, hex:P.leatherLt},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:crouch});
  /* short hip tassets */
  stack([
    {y:0.24, rx:0.190, rz:0.160, hex:P.leatherDk},
    {y:0.32, rx:0.170, rz:0.140, hex:P.leather},
  ], 8, {xform:crouch});
  /* crossed baldric straps */
  tube(crouch(V(-0.14,0.36,0.13)), crouch(V(0.13,0.51,0.12)), 0.016,0.014,5,P.strap);
  tube(crouch(V(0.14,0.36,0.12)),  crouch(V(-0.13,0.51,0.13)),0.016,0.014,5,P.strap);

  /* HEAD — inherited gnome (big head, ears, wide eyes), under the crouch xform */
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
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], crouch(V(0, L.headTopY, 0.010)), P.skinDk);
    for(const s of [-1,1]){
      const ex=s*0.072, ey=(L.cheekY+L.browY)/2-0.004, ez=0.150;
      quad(crouch(V(ex-0.016,ey-0.012,ez)), crouch(V(ex+0.016,ey-0.012,ez)),
           crouch(V(ex+0.016,ey+0.014,ez-0.007)), crouch(V(ex-0.016,ey+0.014,ez-0.007)), P.eye, 0.0);
    }
    for(const s of [-1,1]){
      const eb=crouch(V(s*0.128, L.cheekY+0.008, 0.016));
      const et=crouch(V(s*0.128, L.cheekY+0.008, 0.016).add(V(s*0.078, 0.032, -0.010)));
      tube(eb, et, 0.024, 0.009, 5, P.ear, {capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.004}});
    }
  }

  /* HOOD — dark, open-face; passed through crouch so it leans with the head (over the ears). */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.115, rz:0.108, hex:P.hoodDk},
      {y:L.jawY+0.02,   rx:0.155, rz:0.142, hex:P.hood},
      {y:L.browY+0.01,  rx:0.160, rz:0.144, hex:P.hood},
      {y:L.crownY+0.02, rx:0.124, rz:0.114, hex:P.hood},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.018);
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], crouch(V(0, L.headTopY+0.045, -0.03)), P.hood);
  }

  /* ARMS — each derived to its dagger fist (short, bent, close), from crouched shoulders */
  {
    const shR = crouch(V(L.shoulderX, L.shldY-0.01, 0.015));
    const shL = crouch(V(-L.shoulderX, L.shldY-0.01, 0.015));
    for(const [sh, fist, bend] of [[shR, fistR, V(0.03,-0.01,0.05)], [shL, fistL, V(-0.06,0.0,0.04)]]){
      const elbow = sh.clone().lerp(fist, 0.5).add(bend);
      tube(sh, elbow, 0.052, 0.042, 6, P.leather);
      tube(elbow, fist, 0.040, 0.032, 6, P.leatherDk, {capB:{hex:P.skin}});
    }
  }

  /* LEGS — deep stubby crouch: hips low, knees wide/forward, feet planted under the body */
  {
    const hipL = crouch(V(-0.095, L.hipY-0.01, 0.01));
    const hipR = crouch(V( 0.095, L.hipY-0.01, 0.00));
    const kneeL=V(-0.165, 0.20, 0.09), ankL=V(-0.15, 0.075, -0.01);
    const kneeR=V( 0.170, 0.19, 0.18), ankR=V( 0.155, 0.075, 0.12);
    tube(hipL,kneeL,0.066,0.048,6,P.trouser); tube(kneeL,ankL,0.044,0.034,6,P.trouser);
    tube(hipR,kneeR,0.066,0.048,6,P.trouser); tube(kneeR,ankR,0.044,0.034,6,P.trouser);
    for(const [ank,toe] of [[ankL,V(0.08,0,1)], [ankR,V(0.55,0,0.85)]]){
      const d=toe.clone().normalize(), toeA=V(ank.x,0.045,ank.z);
      tube(V(ank.x,0.13,ank.z), toeA, 0.050,0.042,6,P.boot);
      tube(toeA, toeA.clone().addScaledVector(d,0.100), 0.042,0.032,6,P.boot,{capB:{hex:P.boot,lift:0.010},raz:0.036,rbz:0.026});
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
