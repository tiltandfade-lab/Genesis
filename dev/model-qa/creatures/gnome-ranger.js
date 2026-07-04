/* dev/model-qa/creatures/gnome-ranger.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED gnome race (post-F1 big head + wedge EARS + eyeless, stubby frame) wearing the RANGER kit
   (ranger.js signature: a strung LONGBOW authored first as a D — a smooth C-arc curved STAVE with a
   STRAIGHT vertical string chord connecting EXACTLY at both stave tips — held braced at the gnome's
   side, a back QUIVER with fletchings over the shoulder, tanned hunter's leathers + a mossy hooded
   half-cloak). The gnome keeps its big head + ears (race-read). One whole-object function; the bow is
   authored first so the bow-hand derives true. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnomeRanger(){
  const P = {
    leather:0x5a4530, leatherDk:0x3f3020, leatherLt:0x6e5640,
    cloak:0x3f4a34, cloakDk:0x2c3524,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    trouser:0x463c2c, boot:0x2e2418, bootDk:0x211a11,
    wood:0x6b4f2e, woodDk:0x4a3620, string:0xd8cdb0,
    fletch:0xc9c2a8, fletchDk:0x8f8870, shaft:0x8a6a42, arrowhead:0x8d949a,
    strap:0x2a2119, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.335, waistY:0.375, ribY:0.435, chestY:0.465, shldY:0.485, neckY:0.515,
    hipHalf:0.115, shoulderX:0.150,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* torso — hunter's leathers, gnome stubby */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.128, hex:P.leatherDk},
    {y:L.waistY, rx:0.172, rz:0.148, hex:P.leather},
    {y:L.ribY,   rx:0.158, rz:0.132, hex:P.leather},
    {y:L.chestY, rx:0.150, rz:0.124, hex:P.leatherLt},
    {y:L.shldY,  rx:0.148, rz:0.120, hex:P.leather},
    {y:L.neckY,  rx:0.070, rz:0.066, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  /* belt + buckle */
  stack([
    {y:L.waistY-0.015, rx:0.174, rz:0.150, hex:P.leatherDk},
    {y:L.waistY+0.012, rx:0.172, rz:0.148, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.018,L.waistY-0.006,0.152), V(0.018,L.waistY-0.006,0.152), V(0.018,L.waistY+0.018,0.148), V(-0.018,L.waistY+0.018,0.148), P.brass, 0.02);
  /* short hip tassets */
  stack([
    {y:0.24, rx:0.176, rz:0.150, hex:P.leatherDk},
    {y:0.32, rx:0.166, rz:0.140, hex:P.leather},
  ], 8, {});

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

  /* HOODED HALF-CLOAK — mossy hood over the crown (open face), over the big ears */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.128, rz:0.120, hex:P.cloakDk},
      {y:L.jawY+0.03,   rx:0.166, rz:0.152, hex:P.cloak},
      {y:L.browY+0.03,  rx:0.170, rz:0.152, hex:P.cloak},
      {y:L.crownY+0.02, rx:0.128, rz:0.118, hex:P.cloak},
    ];
    const skip={1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.016);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.03, -0.02), P.cloak);
    /* short half-cape draping the back */
    stack([
      {y:L.shldY+0.02, rx:0.190, rz:0.150, cz:-0.03, hex:P.cloakDk},
      {y:L.shldY-0.06, rx:0.176, rz:0.138, cz:-0.05, hex:P.cloak},
      {y:0.32,         rx:0.140, rz:0.112, cz:-0.05, hex:P.cloak},
    ], 8, {});
  }

  /* LONGBOW FIRST — a D: smooth C-arc STAVE, STRAIGHT vertical string chord tip-to-tip. Held braced. */
  const ARC_X = 0.255, Y_BOT = 0.10, Y_TOP = 0.92;
  const Z_CHORD = 0.190;   // the flat string plane
  const Z_BELLY = 0.320;   // the stave bows out to here at mid
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
  const QUIV_BASE=V(-0.13,0.36,-0.120), QUIV_MOUTH=V(-0.200,0.70,-0.02);
  {
    tube(QUIV_BASE, QUIV_MOUTH, 0.056, 0.066, 8, P.leatherDk, {capA:{hex:P.leatherDk}});
    tube(V(0.08,L.shldY+0.01,0.08), QUIV_MOUTH.clone().add(V(0,0.02,0.03)), 0.014,0.012,5,P.strap);
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
    const E=V(0.215, 0.395, 0.12);
    tube(S,E,0.056,0.044,6,P.leather);
    tube(E,GRIP.clone().add(V(-0.02,0.02,-0.02)),0.044,0.034,6,P.leatherLt,{capB:{hex:P.skin}});
    tube(GRIP.clone().add(V(0,-0.035,0)), GRIP.clone().add(V(0,0.035,0)), 0.036,0.032,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.180, 0.375, 0.06);
    const W2=V(-0.155, 0.27, 0.10);
    tube(S2,E2,0.056,0.044,6,P.leather);
    tube(E2,W2,0.044,0.034,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — braced, high boots */
  {
    const hipL=V(-0.100, L.hipY-0.01, 0.02), ankL=V(-0.125,0.075,0.03);
    const hipR=V( 0.100, L.hipY-0.01, 0.00), ankR=V( 0.140,0.075,-0.03);
    tube(hipL,ankL,0.060,0.044,6,P.trouser);
    tube(hipR,ankR,0.060,0.044,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(-0.05,0,1)], [ankR,V(0.30,0,0.95).normalize()]]){
      stack([
        {y:0.010, rx:0.056, rz:0.064, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.09,  rx:0.050, rz:0.052, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.15,  rx:0.054, rz:0.054, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.bootDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.106), 0.046,0.032,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.038, rbz:0.026});
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
