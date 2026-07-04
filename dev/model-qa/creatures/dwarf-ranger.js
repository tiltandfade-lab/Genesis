/* dev/model-qa/creatures/dwarf-ranger.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED dwarf race (squat-broad race-dwarf proportions + beard + eye standard) wearing the
   RANGER kit (ranger.js signature: a strung LONGBOW authored first as a smooth C-arc with a
   straight string chord — held braced at the dwarf's side, NOT full-draw, which suits the short
   planted frame — a back QUIVER with fletchings over the shoulder, and tanned hunter's leathers
   with a mossy hooded half-cloak). The dwarf keeps the beard but swaps the helm for the cloak hood.
   One whole-object function, no anchors; the bow is authored first so the bow-hand derives true. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarfRanger(){
  const P = {
    leather:0x5a4530, leatherDk:0x3f3020, leatherLt:0x6e5640,
    cloak:0x3f4a34, cloakDk:0x2c3524,
    skin:0xb98a63, skinDk:0x7f5f42,
    beard:0x8a8078, beardDk:0x605852,
    trouser:0x463c2c, boot:0x2e2418, bootDk:0x211a11,
    wood:0x6b4f2e, woodDk:0x4a3620, string:0xd8cdb0,
    fletch:0xc9c2a8, fletchDk:0x8f8870, shaft:0x8a6a42, arrowhead:0x8d949a,
    strap:0x2a2119, brass:0x9c7d3e,
    eye:0x1a1512, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.235,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* torso — hunter's leathers, dwarf-broad */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.175, hex:P.leatherDk},
    {y:L.waistY, rx:0.232, rz:0.182, hex:P.leather},
    {y:L.ribY,   rx:0.248, rz:0.192, hex:P.leather},
    {y:L.chestY, rx:0.256, rz:0.198, hex:P.leatherLt},
    {y:L.shldY,  rx:0.258, rz:0.188, hex:P.leather},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* belt + buckle */
  stack([
    {y:L.waistY-0.02, rx:0.243, rz:0.190, hex:P.leatherDk},
    {y:L.waistY+0.02, rx:0.241, rz:0.188, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.03,L.waistY-0.006,0.196), V(0.03,L.waistY-0.006,0.196), V(0.03,L.waistY+0.03,0.192), V(-0.03,L.waistY+0.03,0.192), P.brass, 0.02);

  /* short hip tassets */
  stack([
    {y:0.30, rx:0.245, rz:0.192, hex:P.leatherDk},
    {y:0.40, rx:0.232, rz:0.180, hex:P.leather},
  ], 8, {});

  /* HEAD — inherited dwarf skull + eyes */
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
    for(const s of [-1,1]){
      const ex=s*0.062, ey=(L.cheekY+L.browY)/2-0.002, ez=0.148;
      quad(V(ex-0.015,ey-0.011,ez), V(ex+0.015,ey-0.011,ez),
           V(ex+0.015,ey+0.013,ez-0.007), V(ex-0.015,ey+0.013,ez-0.007), P.eye, 0.0);
    }
  }

  /* BEARD (inherited) */
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

  /* HOODED HALF-CLOAK — mossy hood over the crown (open face), short shoulder cape behind */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.128, rz:0.120, hex:P.cloakDk},
      {y:L.jawY+0.03,   rx:0.156, rz:0.144, hex:P.cloak},
      {y:L.browY+0.04,  rx:0.160, rz:0.144, hex:P.cloak},
      {y:L.crownY+0.03, rx:0.128, rz:0.118, hex:P.cloak},
    ];
    const skip={1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.016);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.04, -0.02), P.cloak);
    /* short half-cape draping the shoulders/back */
    stack([
      {y:L.shldY+0.03, rx:0.290, rz:0.215, cz:-0.03, hex:P.cloakDk},
      {y:L.shldY-0.06, rx:0.268, rz:0.198, cz:-0.05, hex:P.cloak},
      {y:0.54,         rx:0.215, rz:0.165, cz:-0.06, hex:P.cloak},
      {y:0.42,         rx:0.165, rz:0.130, cz:-0.05, hex:P.cloakDk},
    ], 8, {});
  }

  /* LONGBOW FIRST — a smooth C-arc held BRACED at the dwarf's right side (vertical-ish, belly
     bowing toward the target). String a straight chord tip-to-tip. Bow-hand grip on the belly. */
  const ARC_X = 0.335, Y_BOT = 0.12, Y_TOP = 1.16;
  const Z_CHORD = 0.230;
  const Z_BELLY = 0.360;
  function arcPt(t){
    const y = Y_BOT + (Y_TOP - Y_BOT)*t;
    const bulge = 4*t*(1-t);
    const z = Z_CHORD + (Z_BELLY - Z_CHORD)*bulge;
    const x = ARC_X + 0.02*bulge;
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
      const rA = 0.013 + 0.014*(4*tA*(1-tA));
      const rB = 0.013 + 0.014*(4*tB*(1-tB));
      const capO = {};
      if(i===0) capO.capA = {hex:P.woodDk};
      if(i===SEG-1) capO.capB = {hex:P.woodDk};
      tube(a, b, rA, rB, 7, i%2? P.woodDk : P.wood, capO);
    }
    tube(arcPt(0.42), arcPt(0.58), 0.030, 0.030, 8, P.leatherDk);   // grip riser
    tube(BOW_TOP, BOW_BOT, 0.008, 0.008, 5, P.string);              // straight string chord
  }

  /* QUIVER — angled on the back, fletchings over the shoulder */
  const QUIV_BASE=V(-0.16,0.48,-0.145), QUIV_MOUTH=V(-0.255,0.90,-0.02);
  {
    tube(QUIV_BASE, QUIV_MOUTH, 0.070, 0.082, 8, P.leatherDk, {capA:{hex:P.leatherDk}});
    tube(V(0.10,L.shldY+0.02,0.10), QUIV_MOUTH.clone().add(V(0,0.02,0.04)), 0.017,0.015,5,P.strap);
    const qdir=new THREE.Vector3().subVectors(QUIV_MOUTH,QUIV_BASE).normalize();
    for(let k=0;k<5;k++){
      const t=(k-2)*0.026, s=(k-2)*0.018;
      const base=QUIV_MOUTH.clone().add(V(t*1.1, 0, s*0.6));
      const tip=base.clone().addScaledVector(qdir,0.26).add(V(t*0.4,0,s*0.3));
      tube(base, tip, 0.010,0.010,5,P.shaft);
      for(const side of [-1,1]){
        const u=V(1,0,0);
        const flareBase=tip.clone().addScaledVector(qdir,-0.055);
        quad(flareBase, flareBase.clone().add(u.clone().multiplyScalar(side*0.02)).add(V(0,0.02,0)),
             tip.clone().add(u.clone().multiplyScalar(side*0.010)), tip, P.fletch, 0.05);
      }
    }
  }

  /* ARMS — right (bow) hand grips the bow belly; left rests near the belt */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.315, 0.545, 0.14);
    tube(S,E,0.094,0.074,6,P.leather);
    tube(E,GRIP.clone().add(V(-0.02,0.03,-0.02)),0.070,0.056,6,P.leatherLt,{capB:{hex:P.skin}});
    tube(GRIP.clone().add(V(0,-0.05,0)), GRIP.clone().add(V(0,0.05,0)), 0.056,0.050,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.285, 0.535, 0.08);
    const W2=V(-0.245, 0.40, 0.13);
    tube(S2,E2,0.094,0.074,6,P.leather);
    tube(E2,W2,0.070,0.054,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — braced, high boots (hunter) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), ankL=V(-0.175,0.085,0.03);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), ankR=V( 0.185,0.085,-0.03);
    tube(hipL,ankL,0.096,0.070,6,P.trouser);
    tube(hipR,ankR,0.096,0.070,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.30,0,0.95).normalize()]]){
      stack([
        {y:0.012, rx:0.080, rz:0.088, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.11,  rx:0.072, rz:0.074, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.175, rx:0.076, rz:0.076, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.bootDk, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.066,0.048,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.056, rbz:0.038});
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
