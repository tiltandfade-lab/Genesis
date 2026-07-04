/* dev/model-qa/creatures/halfling-ranger.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet — the icon) wearing the
   RANGER kit (ranger.js signature: a strung LONGBOW authored first as a D — a smooth C-arc curved STAVE
   with a STRAIGHT vertical string chord connecting EXACTLY at both stave tips — held braced at the
   halfling's side, a back QUIVER with fletchings over the shoulder, tanned hunter's leathers + a mossy
   hooded half-cloak over the curls). Bare feet inherited. One whole-object function; the bow is authored
   first so the bow-hand derives true. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalflingRanger(){
  const P = {
    leather:0x5a4530, leatherDk:0x3f3020, leatherLt:0x6e5640,
    cloak:0x3f4a34, cloakDk:0x2c3524,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a, eye:0x1a1512,
    trouser:0x463c2c,
    wood:0x6b4f2e, woodDk:0x4a3620, string:0xd8cdb0,
    fletch:0xc9c2a8, fletchDk:0x8f8870, shaft:0x8a6a42, arrowhead:0x8d949a,
    strap:0x2a2119, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.375, waistY:0.42, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* torso — hunter's leathers, halfling slim */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.096, hex:P.leatherDk},
    {y:L.waistY, rx:0.114, rz:0.090, hex:P.leather},
    {y:L.ribY,   rx:0.124, rz:0.098, hex:P.leather},
    {y:L.chestY, rx:0.132, rz:0.100, hex:P.leatherLt},
    {y:L.shldY,  rx:0.134, rz:0.096, hex:P.leather},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  /* belt + buckle */
  stack([
    {y:L.waistY-0.015, rx:0.116, rz:0.092, hex:P.leatherDk},
    {y:L.waistY+0.012, rx:0.114, rz:0.090, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.014,L.waistY-0.006,0.096), V(0.014,L.waistY-0.006,0.096), V(0.014,L.waistY+0.016,0.093), V(-0.014,L.waistY+0.016,0.093), P.brass, 0.02);
  /* hip tassets */
  stack([
    {y:0.30, rx:0.134, rz:0.108, hex:P.leatherDk},
    {y:0.37, rx:0.120, rz:0.096, hex:P.leather},
  ], 8, {});

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

  /* CURLY HAIR CAP (inherited) — some curls peek from under the hood */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.030, rx:0.104, rz:0.096, hex:P.hairDk},
      {y:L.crownY-0.015,rx:0.110, rz:0.100, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[6,7]});
    for(const a of [1.0,2.0,3.0]){
      const cx=Math.cos(a)*0.098, cz=Math.sin(a)*0.090+0.012, cy=L.browY+0.02+Math.sin(a*3)*0.010;
      const base=V(cx,cy,cz), out=base.clone().addScaledVector(V(cx,0.0,cz).normalize(),0.012);
      tube(base, out, 0.014, 0.012, 4, P.hair, {capB:{hex:P.hair, lift:0.003}});
    }
  }

  /* HOODED HALF-CLOAK — mossy hood over the crown (open face) */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.100, rz:0.094, hex:P.cloakDk},
      {y:L.jawY+0.02,   rx:0.126, rz:0.116, hex:P.cloak},
      {y:L.browY+0.03,  rx:0.130, rz:0.118, hex:P.cloak},
      {y:L.crownY+0.02, rx:0.098, rz:0.090, hex:P.cloak},
    ];
    const skip={1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.014);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.02, -0.02), P.cloak);
    stack([
      {y:L.shldY+0.02, rx:0.150, rz:0.116, cz:-0.03, hex:P.cloakDk},
      {y:L.shldY-0.06, rx:0.138, rz:0.106, cz:-0.05, hex:P.cloak},
      {y:0.36,         rx:0.108, rz:0.086, cz:-0.05, hex:P.cloak},
    ], 8, {});
  }

  /* LONGBOW FIRST — a D: smooth C-arc STAVE, STRAIGHT vertical string chord tip-to-tip. Braced. */
  const ARC_X = 0.260, Y_BOT = 0.12, Y_TOP = 0.98;
  const Z_CHORD = 0.190;
  const Z_BELLY = 0.320;
  function arcPt(t){
    const y = Y_BOT + (Y_TOP - Y_BOT)*t;
    const bulge = 4*t*(1-t);
    const z = Z_CHORD + (Z_BELLY - Z_CHORD)*bulge;
    const x = ARC_X + 0.015*bulge;
    return V(x, y, z);
  }
  const SEG = 6;
  const arc = []; for(let i=0;i<=SEG;i++) arc.push(arcPt(i/SEG));
  const BOW_BOT = arc[0], BOW_TOP = arc[SEG];
  const GRIP = arcPt(0.5);
  {
    for(let i=0;i<SEG;i++){
      const a = arc[i], b = arc[i+1];
      const tA = i/SEG, tB = (i+1)/SEG;
      const rA = 0.011 + 0.011*(4*tA*(1-tA));
      const rB = 0.011 + 0.011*(4*tB*(1-tB));
      const capO = {};
      if(i===0) capO.capA = {hex:P.woodDk};
      if(i===SEG-1) capO.capB = {hex:P.woodDk};
      tube(a, b, rA, rB, 7, i%2? P.woodDk : P.wood, capO);
    }
    tube(arcPt(0.42), arcPt(0.58), 0.024, 0.024, 8, P.leatherDk);   // grip riser
    tube(BOW_TOP, BOW_BOT, 0.007, 0.007, 5, P.string);              // STRAIGHT string chord, tip-to-tip
  }

  /* QUIVER — angled on the back, fletchings over the shoulder */
  const QUIV_BASE=V(-0.13,0.40,-0.120), QUIV_MOUTH=V(-0.200,0.74,-0.02);
  {
    tube(QUIV_BASE, QUIV_MOUTH, 0.054, 0.064, 8, P.leatherDk, {capA:{hex:P.leatherDk}});
    tube(V(0.07,L.shldY+0.01,0.08), QUIV_MOUTH.clone().add(V(0,0.02,0.03)), 0.013,0.011,5,P.strap);
    const qdir=new THREE.Vector3().subVectors(QUIV_MOUTH,QUIV_BASE).normalize();
    for(let k=0;k<5;k++){
      const t=(k-2)*0.020, s=(k-2)*0.014;
      const base=QUIV_MOUTH.clone().add(V(t*1.1, 0, s*0.6));
      const tip=base.clone().addScaledVector(qdir,0.20).add(V(t*0.4,0,s*0.3));
      tube(base, tip, 0.008,0.008,5,P.shaft);
      for(const side of [-1,1]){
        const u=V(1,0,0);
        const flareBase=tip.clone().addScaledVector(qdir,-0.044);
        quad(flareBase, flareBase.clone().add(u.clone().multiplyScalar(side*0.016)).add(V(0,0.016,0)),
             tip.clone().add(u.clone().multiplyScalar(side*0.008)), tip, P.fletch, 0.05);
      }
    }
  }

  /* ARMS — right (bow) hand grips the bow belly; left rests near the belt */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=V(0.185, 0.475, 0.12);
    tube(S,E,0.048,0.038,6,P.leather);
    tube(E,GRIP.clone().add(V(-0.02,0.02,-0.02)),0.036,0.028,6,P.leatherLt,{capB:{hex:P.skin}});
    tube(GRIP.clone().add(V(0,-0.03,0)), GRIP.clone().add(V(0,0.03,0)), 0.030,0.026,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.160, 0.455, 0.06);
    const W2=V(-0.135, 0.34, 0.10);
    tube(S2,E2,0.048,0.038,6,P.leather);
    tube(E2,W2,0.036,0.028,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — braced, BARE oversized feet */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.008, 0.008), shinL=V(-0.088,0.185,0.03);
    const hipR=V( L.hipHalf, L.hipY-0.008, 0.006), shinR=V( 0.100,0.185,-0.03);
    tube(hipL,shinL,0.056,0.040,6,P.trouser);
    tube(hipR,shinR,0.056,0.040,6,P.trouser);
    for(const [shin,toeDir] of [[shinL,V(-0.06,0,1)], [shinR,V(0.35,0,0.94).normalize()]]){
      const ankBot=V(shin.x, 0.075, shin.z);
      tube(shin, ankBot, 0.038, 0.058, 6, P.skin);
      stack([
        {y:0.016, rx:0.078, rz:0.096, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.065, rx:0.072, rz:0.084, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.040,shin.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.155), 0.072,0.054,6,P.footpad, {capB:{hex:P.footpad, lift:0.017}, raz:0.062, rbz:0.044});
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
