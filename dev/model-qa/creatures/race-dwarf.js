/* dev/model-qa/creatures/race-dwarf.js — RIG-VARIANT race: same whole-object grammar as
   humanoid.js, different PROPORTIONS. ~1.15u head-top but BROAD: shoulders nearly human-fighter
   width on a short frame, thick trunk, a MASSIVE beard wedge from jaw to belt (mage.js's
   beard-wedge technique scaled way up), a domed helm, and a hand axe hanging sheathed at the
   belt (small, no combat-weapon read). Planted, immovable stance. Plain adventurer dress —
   simple tunic/vest earth tones, no class read. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarf(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    tunic:0x5a4f3c, tunicDk:0x453c2d, linen:0xc9bd9c, linenDk:0x8d846c,
    skin:0xb98a63, skinDk:0x7f5f42, trouser:0x4a4436, trouserDk:0x39352a,
    boot:0x2f271c, leather:0x4e3d2a, leatherDk:0x3a2d1f,
    beard:0x9a9086, beardDk:0x6d655c, hairDk:0x4a4038,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0xb08d46,
    helm:0x7d818a, helmDk:0x565a61,
    eye:0x1a1512, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — short (~1.15u) but BROAD; shoulderX approaches the human fighter's ---------- */
  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.235,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* trunk (one loft, hips -> neck; thick and barrel-shaped, minimal taper) */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.175, hex:P.trouserDk},
    {y:L.waistY, rx:0.235, rz:0.185, hex:P.tunic},
    {y:L.ribY,   rx:0.250, rz:0.195, hex:P.tunic},
    {y:L.chestY, rx:0.258, rz:0.200, hex:P.tunic},
    {y:L.shldY,  rx:0.260, rz:0.190, hex:P.tunic},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.linenDk},
  ], 8, {capTop:{hex:P.linenDk, lift:0.005}});

  /* belt (wide, low, planted look) */
  stack([
    {y:L.waistY-0.03, rx:0.245, rz:0.192, hex:P.leather},
    {y:L.waistY+0.02, rx:0.243, rz:0.190, hex:P.leather},
  ], 8, {});
  quad(V(-0.038,L.waistY-0.026,0.198), V(0.038,L.waistY-0.026,0.198), V(0.038,L.waistY+0.024,0.194), V(-0.038,L.waistY+0.024,0.194), P.brass, 0.02);

  /* HAND AXE — small, hanging sheathed at the hip (not a raised weapon; a tool-read prop).
     Pushed clear of the torso's own rx (~0.26 at hip) so the head reads in silhouette. */
  {
    const hb=V(0.275, L.waistY-0.025, 0.05), ht=V(0.285, L.waistY+0.15, 0.03);
    tube(hb, ht, 0.017, 0.014, 5, P.leatherDk, {capB:{hex:P.brass, lift:0.006}});
    /* small axe head resting against the hip, blade tucked down (sheathed look) */
    const headC = V(0.295, L.waistY-0.055, 0.05);
    quad(headC.clone().add(V(0,0.05,0)), headC.clone().add(V(0.062,0.018,0)),
         headC.clone().add(V(0.048,-0.058,0)), headC.clone().add(V(-0.010,-0.035,0)), P.steelDk, 0.03);
    quad(headC.clone().add(V(0,0.05,0.024)), headC.clone().add(V(-0.010,-0.035,0.024)),
         headC.clone().add(V(0.048,-0.058,0.024)), headC.clone().add(V(0.062,0.018,0.024)), P.steel, 0.03);
  }

  /* HEAD (skin loft; nose pushed; eyes painted). FRONT (+z) verts of this ring are 1 & 2. */
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
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
  }

  /* MASSIVE BEARD — a tapering wedge of rings from the jaw all the way down to the belt
     (mage.js's beard-wedge technique, scaled way up: wider, longer, more bands). Pushed well
     PROUD of the torso's own front face (torso rz maxes ~0.20) so it reads clearly in front of
     the chest/belly instead of being swallowed by it; beard hex contrasts hard against P.tunic. */
    const bands=[
      {y:L.jawY+0.005, rx:0.125, rz:0.095, cz:0.135, hex:P.beard},
      {y:L.cheekY-0.05, rx:0.120, rz:0.088, cz:0.185, hex:P.beard},
      {y:0.735,         rx:0.112, rz:0.080, cz:0.225, hex:P.beard},
      {y:0.665,         rx:0.100, rz:0.070, cz:0.250, hex:P.beard},
      {y:0.59,          rx:0.086, rz:0.060, cz:0.260, hex:P.beardDk},
      {y:0.515,         rx:0.066, rz:0.048, cz:0.250, hex:P.beardDk},
      {y:L.waistY+0.01, rx:0.044, rz:0.034, cz:0.215, hex:P.beardDk},
    ];
  {
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.waistY-0.03,0.185), P.beardDk);
  }

  /* DOMED HELM — a rounded metal cap sitting low over the brow, with a simple rim */
  {
    const n=8, ph=Math.PI/n;
    const rimLo=ring(V(0,L.browY+0.015,0.0), V(0,1,0), 0.140, 0.128, n, ph);
    const rimHi=ring(V(0,L.browY+0.04,0.0), V(0,1,0), 0.138, 0.126, n, ph);
    stitch([rimLo,rimHi], ()=>P.helmDk);
    const dome=[
      {y:L.browY+0.05,  rx:0.136, rz:0.124},
      {y:L.crownY+0.01, rx:0.128, rz:0.116},
      {y:L.headTopY+0.03, rx:0.086, rz:0.078},
    ].map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(dome, ()=>P.helm);
    stitch([rimHi,dome[0]], ()=>P.helm);
    capFan(dome.at(-1), V(0, L.headTopY+0.095, 0.0), P.helmDk);
    /* small nose guard bar */
    quad(V(-0.012,L.browY+0.03,0.132), V(0.012,L.browY+0.03,0.132), V(0.010,L.jawY+0.05,0.145), V(-0.010,L.jawY+0.05,0.145), P.helmDk, 0.02);
  }

  /* ARMS — thick, planted; hands rest near the belt/thighs, elbows tucked IN (not wider than the
     shoulder) so the pose reads as relaxed/immovable rather than a shrug. */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.290, 0.535, 0.10);
    const W=V(0.255, 0.385, 0.155);
    tube(S,E,0.096,0.078,6,P.tunic);
    tube(E,W,0.076,0.060,6,P.skin,{capB:{hex:P.skinDk}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.285, 0.535, 0.09);
    const W2=V(-0.250, 0.38, 0.145);
    tube(S2,E2,0.096,0.078,6,P.tunic);
    tube(E2,W2,0.076,0.060,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — short, thick, wide-braced planted stance (immovable) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), ankL=V(-0.175,0.085,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), ankR=V( 0.185,0.085,-0.02);
    tube(hipL,ankL,0.098,0.072,6,P.trouser);
    tube(hipR,ankR,0.098,0.072,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.30,0,0.95).normalize()]]){
      stack([
        {y:0.012, rx:0.082, rz:0.090, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.074, rz:0.076, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.155, rx:0.080, rz:0.080, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.068,0.050,6,P.boot, {capB:{hex:P.boot, lift:0.016}, raz:0.058, rbz:0.040});
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
