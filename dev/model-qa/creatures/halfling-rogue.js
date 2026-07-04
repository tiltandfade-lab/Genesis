/* dev/model-qa/creatures/halfling-rogue.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED halfling race (race-halfling proportions: ~1.0u, slim, curly hair-cap, BARE oversized
   feet — the icon) wearing the ROGUE kit (rogue.js signature: a low sneaky CROUCH, leather torso +
   crossed baldric, twin DAGGERS one lead one reverse). Halflings are the archetypal rogue race, so
   this is the flagship of the set. The daggers are the shared reusable `buildDagger` (authored first).
   The curly hair reads over a low hood; the BARE FEET are kept (no boots) — the halfling silhouette
   read at board distance. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { buildDagger } from '../parts.js';

export function buildHalflingRogue(){
  const P = {
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a, eye:0x1a1512,
    hood:0x3a3d40, hoodDk:0x282a2c,
    leather:0x4a3a28, leatherDk:0x33281b, leatherLt:0x5c4832,
    strap:0x2a2119, trouser:0x342c22, trouserDk:0x241d15,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.375, waistY:0.425, ribY:0.500, chestY:0.540, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* CROUCH transform — drop + forward pitch above the hips (F2 rogue idiom) */
  const DROP = 0.13, PITCH = 0.32;
  const PIVOT = V(0.0, L.hipY - DROP, 0.02);
  const crouch = (p)=>{
    const q = p.clone().add(V(0, -DROP, 0)).sub(PIVOT);
    q.applyAxisAngle(V(1,0,0), PITCH);
    return q.add(PIVOT);
  };

  /* TWIN DAGGERS FIRST (shared module), crouched frame, held close */
  const gripR = crouch(V(0.16, 0.55, 0.27));
  const dirR  = V(0.22,-0.20,1).normalize();
  const gripL = crouch(V(-0.10, 0.63, 0.16));
  const dirL  = V(-0.10,-0.94,0.28).normalize();
  const fistR = buildDagger(gripR, dirR, P);
  const fistL = buildDagger(gripL, dirL, P);

  /* TORSO — slim leather, crouched */
  stack([
    {y:L.hipY,   rx:0.120, rz:0.098, hex:P.leatherDk},
    {y:L.waistY, rx:0.112, rz:0.090, hex:P.leather},
    {y:L.ribY,   rx:0.122, rz:0.096, hex:P.leather},
    {y:L.chestY, rx:0.132, rz:0.100, hex:P.leatherLt},
    {y:L.shldY,  rx:0.134, rz:0.096, hex:P.leatherLt},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:crouch});
  /* short hip tassets */
  stack([
    {y:0.29, rx:0.150, rz:0.122, hex:P.leatherDk},
    {y:0.36, rx:0.130, rz:0.102, hex:P.leather},
  ], 8, {xform:crouch});
  /* crossed baldric straps */
  tube(crouch(V(-0.12,0.42,0.10)), crouch(V(0.11,0.57,0.09)), 0.015,0.013,5,P.strap);
  tube(crouch(V(0.12,0.42,0.09)),  crouch(V(-0.11,0.57,0.10)),0.015,0.013,5,P.strap);

  /* HEAD — inherited halfling (slim, lightly-pushed nose), crouched */
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
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], crouch(V(0, L.headTopY, 0.006)), P.skinDk);
    for(const s of [-1,1]){
      const ex=s*0.048, ey=(L.cheekY+L.browY)/2-0.004, ez=0.112;
      quad(crouch(V(ex-0.012,ey-0.009,ez)), crouch(V(ex+0.012,ey-0.009,ez)),
           crouch(V(ex+0.012,ey+0.010,ez-0.006)), crouch(V(ex-0.012,ey+0.010,ez-0.006)), P.eye, 0.0);
    }
  }

  /* CURLY HAIR CAP — the halfling icon, a lumpy curl mass over the crown (crouched) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.045, rx:0.104, rz:0.096, hex:P.hairDk},
      {y:L.crownY-0.005,rx:0.114, rz:0.104, hex:P.hair},
      {y:L.crownY+0.045,rx:0.098, rz:0.088, hex:P.hair},
      {y:L.headTopY+0.010, rx:0.060, rz:0.053, hex:P.hairDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,-0.004), V(0,1,0), b.rx, b.rz, n, ph));
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), crouch(V(0, L.headTopY+0.045, -0.004)), P.hairDk);
    for(const a of [0.3,1.1,2.0,2.9,3.7,4.6,5.4]){
      const cx=Math.cos(a)*0.100, cz=Math.sin(a)*0.094-0.004, cy=L.crownY+Math.sin(a*3)*0.018;
      const base=crouch(V(cx,cy,cz)), out=crouch(V(cx,cy,cz).add(V(cx,0.01,cz).normalize().multiplyScalar(0.014)));
      tube(base, out, 0.016, 0.014, 4, P.hair, {capB:{hex:P.hair, lift:0.003}});
    }
  }

  /* ARMS — each derived to its dagger fist, from crouched shoulders */
  {
    const shR = crouch(V(L.shoulderX, L.shldY-0.01, 0.015));
    const shL = crouch(V(-L.shoulderX, L.shldY-0.01, 0.015));
    for(const [sh, fist, bend] of [[shR, fistR, V(0.03,-0.01,0.05)], [shL, fistL, V(-0.06,0.0,0.04)]]){
      const elbow = sh.clone().lerp(fist, 0.5).add(bend);
      tube(sh, elbow, 0.036, 0.030, 6, P.leather);
      tube(elbow, fist, 0.028, 0.024, 6, P.leatherDk, {capB:{hex:P.skin}});
    }
  }

  /* LEGS — deep crouch, rolled trousers + BARE oversized feet (the halfling icon) */
  {
    const hipL = crouch(V(-L.hipHalf, L.hipY-0.008, 0.008));
    const hipR = crouch(V( L.hipHalf, L.hipY-0.008, 0.006));
    const kneeL=V(-0.155, 0.24, 0.10), shinL=V(-0.14, 0.15, -0.01);
    const kneeR=V( 0.160, 0.23, 0.19), shinR=V( 0.145, 0.15, 0.13);
    tube(hipL,kneeL,0.056,0.042,6,P.trouser); tube(kneeL,shinL,0.046,0.038,6,P.trouser);
    tube(hipR,kneeR,0.056,0.042,6,P.trouser); tube(kneeR,shinR,0.046,0.038,6,P.trouser);
    /* rolled cuffs */
    for(const shin of [shinL,shinR]){
      stack([{y:shin.y+0.005, rx:0.046, rz:0.038, cx:shin.x, cz:shin.z, hex:P.trouserDk},
             {y:shin.y+0.035, rx:0.050, rz:0.041, cx:shin.x, cz:shin.z, hex:P.trouserDk}],6,{capTop:{hex:P.trouserDk,lift:0.003}});
    }
    /* bare feet — big flat pads, oversized */
    for(const [shin,toeDir] of [[shinL,V(0.02,0,1)], [shinR,V(0.40,0,0.92).normalize()]]){
      const ankBot=V(shin.x, 0.072, shin.z);
      tube(shin, ankBot, 0.040, 0.062, 6, P.skin);
      stack([
        {y:0.016, rx:0.078, rz:0.096, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.062, rx:0.072, rz:0.084, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.040,shin.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.150), 0.072,0.054,6,P.footpad, {capB:{hex:P.footpad, lift:0.017}, raz:0.062, rbz:0.044});
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
