/* dev/model-qa/creatures/tiefling-rogue.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED tiefling race (dusky red-mauve skin, backswept HORNS, sharp GOATEE, spade-tipped TAIL)
   wearing the ROGUE kit (rogue.js signature: a low sneaky CROUCH, leather torso + crossed baldric,
   twin DAGGERS one lead one reverse). The tiefling's horns + tail are kept and pass through the
   crouch transform with the rest of the head/body. The daggers are the shared reusable `buildDagger`
   (authored first). One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { buildDagger } from '../parts.js';

export function buildTieflingRogue(){
  const P = {
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a,
    hair:0x2a2320, eye:0x1a1512,
    hood:0x33303a, hoodDk:0x22202a,
    leather:0x3f3128, leatherDk:0x2c2119, leatherLt:0x4e3d30,
    strap:0x241d15, trouser:0x2a2520, boot:0x1a1510,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.215,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* CROUCH transform — drop + forward pitch above the hips (F2 rogue idiom) */
  const DROP = 0.20, PITCH = 0.34;
  const PIVOT = V(0.0, L.hipY - DROP, 0.02);
  const crouch = (p)=>{
    const q = p.clone().add(V(0, -DROP, 0)).sub(PIVOT);
    q.applyAxisAngle(V(1,0,0), PITCH);
    return q.add(PIVOT);
  };

  /* TWIN DAGGERS FIRST (shared module), crouched frame */
  const gripR = crouch(V(0.235, 0.855, 0.34));
  const dirR  = V(0.22,-0.20,1).normalize();
  const gripL = crouch(V(-0.145, 0.975, 0.20));
  const dirL  = V(-0.10,-0.94,0.28).normalize();
  const fistR = buildDagger(gripR, dirR, P);
  const fistL = buildDagger(gripL, dirL, P);

  /* TORSO — slim leather, crouched */
  stack([
    {y:L.hipY,   rx:0.172, rz:0.130, hex:P.leatherDk},
    {y:L.waistY, rx:0.148, rz:0.112, hex:P.leather},
    {y:L.ribY,   rx:0.172, rz:0.130, hex:P.leather},
    {y:L.chestY, rx:0.192, rz:0.140, hex:P.leatherLt},
    {y:L.shldY,  rx:0.196, rz:0.132, hex:P.leatherLt},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:crouch});
  /* short hip tassets */
  stack([
    {y:0.52, rx:0.200, rz:0.158, hex:P.leatherDk},
    {y:0.66, rx:0.178, rz:0.138, hex:P.leather},
  ], 8, {xform:crouch});
  /* crossed baldric */
  tube(crouch(V(-0.18,0.72,0.13)), crouch(V(0.16,1.05,0.12)), 0.019,0.017,5,P.strap);
  tube(crouch(V(0.18,0.72,0.12)),  crouch(V(-0.16,1.05,0.13)),0.019,0.017,5,P.strap);

  /* HEAD — inherited tiefling skull, crouched */
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
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], crouch(V(0, L.headTopY, 0.006)), P.skinDk);
    for(const s of [-1,1]){
      const ex=s*0.050, ey=(L.cheekY+L.browY)/2-0.004, ez=0.116;
      quad(crouch(V(ex-0.013,ey-0.009,ez)), crouch(V(ex+0.013,ey-0.009,ez)),
           crouch(V(ex+0.013,ey+0.011,ez-0.006)), crouch(V(ex-0.013,ey+0.011,ez-0.006)), P.eye, 0.0);
    }
  }

  /* HORNS — backswept (inherited), passed through crouch so they lean with the head */
  for(const s of [-1,1]){
    const baseX = s*0.100, baseZ = -0.010;
    const base   = crouch(V(baseX, L.browY-0.010, baseZ));
    const p1 = crouch(V(baseX + s*0.026, L.browY+0.118, baseZ - 0.028));
    const p2 = crouch(V(baseX + s*0.044, L.browY+0.210, baseZ - 0.090));
    const p3 = crouch(V(baseX + s*0.052, L.browY+0.262, baseZ - 0.150));
    tube(base, p1, 0.030, 0.023, 6, P.horn,   {capA:{hex:P.hornDk}});
    tube(p1,   p2, 0.023, 0.015, 6, P.hornLt);
    tube(p2,   p3, 0.015, 0.003, 6, P.hornLt, {capB:{hex:P.hornDk}});
  }

  /* GOATEE (inherited), crouched */
  {
    const bands=[
      {y:L.jawY+0.010, rx:0.058, rz:0.046, cz:0.058, hex:P.hair},
      {y:L.jawY-0.034, rx:0.044, rz:0.036, cz:0.075, hex:P.hair},
      {y:L.jawY-0.072, rx:0.028, rz:0.024, cz:0.078, hex:P.hair},
      {y:L.jawY-0.100, rx:0.012, rz:0.011, cz:0.068, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), crouch(V(0,L.jawY-0.122,0.062)), P.hair);
  }

  /* ARMS — each derived to its dagger fist, from crouched shoulders */
  {
    const shR = crouch(V(L.shoulderX, L.shldY-0.01, 0.015));
    const shL = crouch(V(-L.shoulderX, L.shldY-0.01, 0.015));
    for(const [sh, fist, bend] of [[shR, fistR, V(0.05,-0.02,0.08)], [shL, fistL, V(-0.10,0.0,0.06)]]){
      const elbow = sh.clone().lerp(fist, 0.5).add(bend);
      tube(sh, elbow, 0.062, 0.050, 6, P.leather);
      tube(elbow, fist, 0.046, 0.038, 6, P.leatherDk, {capB:{hex:P.skin}});
    }
  }

  /* LEGS — deep crouch (lead forward, trailing braced back) */
  {
    const hipL = crouch(V(-L.hipHalf, L.hipY-0.01, 0.01));
    const hipR = crouch(V( L.hipHalf, L.hipY-0.01, 0.00));
    const kneeL=V(-0.205, 0.34, 0.12), ankL=V(-0.19, 0.085, -0.02);
    const kneeR=V( 0.215, 0.32, 0.26), ankR=V( 0.20, 0.085,  0.16);
    tube(hipL,kneeL,0.076,0.054,6,P.trouser); tube(kneeL,ankL,0.050,0.038,6,P.trouser);
    tube(hipR,kneeR,0.076,0.054,6,P.trouser); tube(kneeR,ankR,0.050,0.038,6,P.trouser);
    for(const [ank,toe] of [[ankL,V(0.08,0,1)], [ankR,V(0.55,0,0.85)]]){
      const d=toe.clone().normalize(), toeA=V(ank.x,0.05,ank.z);
      tube(V(ank.x,0.17,ank.z), toeA, 0.056,0.046,6,P.boot);
      tube(toeA, toeA.clone().addScaledVector(d,0.120), 0.046,0.036,6,P.boot,{capB:{hex:P.boot,lift:0.011},raz:0.040,rbz:0.028});
    }
  }

  /* TAIL — thin spade-tipped tail (inherited), hanging behind the crouch */
  {
    const root = V(0.030, L.hipY-0.16, -0.150);
    const t1 = V(0.080, 0.45, -0.270);
    const t2 = V(0.110, 0.31, -0.290);
    const t3 = V(0.120, 0.215, -0.250);
    const tip = V(0.124, 0.145, -0.185);
    tube(root, t1, 0.036, 0.030, 6, P.leatherDk);
    tube(t1,   t2, 0.030, 0.021, 6, P.skinDk);
    tube(t2,   t3, 0.021, 0.013, 6, P.skinDk);
    tube(t3,   tip,0.013, 0.006, 6, P.skinDk);
    const axis = new THREE.Vector3().subVectors(tip,t3).normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), axis).normalize();
    const fwd  = tip.clone().addScaledVector(axis, 0.050);
    const back = tip.clone().addScaledVector(axis, -0.014);
    const wingL= tip.clone().addScaledVector(side, 0.038).addScaledVector(axis, 0.006);
    const wingR= tip.clone().addScaledVector(side,-0.038).addScaledVector(axis, 0.006);
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
