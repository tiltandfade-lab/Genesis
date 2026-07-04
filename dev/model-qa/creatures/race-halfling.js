/* dev/model-qa/creatures/race-halfling.js — RIG-VARIANT race: same whole-object grammar as
   humanoid.js, different PROPORTIONS. ~1.0u head-top, ~3.5 heads tall: slimmer than the gnome,
   a curly hair cap mass, BARE oversized feet (the icon — big pads, no boots), vest + rolled
   trousers, relaxed stance, a walking stick (authored first, hand derived). Plain adventurer
   dress, earth tones, no class read. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfling(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    vest:0x8a6a42, vestDk:0x6a4f32, linen:0xd6c9a8, linenDk:0x958a6e,
    skin:0xc99b70, skinDk:0x8e6c4c, trouser:0xb8ad8a, trouserDk:0x8f8468,
    footpad:0xc99b70, footpadDk:0x8e6c4c,
    leather:0x4e3d2a, leatherDk:0x3a2d1f, brass:0xb08d46,
    hair:0x7a5236, hairDk:0x5a3c26, eye:0x1a1512, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — slim, ~3.5 heads tall, headTopY ~1.0 ---------- */
  const L = {
    hipY:0.375, waistY:0.425, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* WALKING STICK FIRST — the ground-truth grip for the derived hand */
  const STICK_B = V(-0.235, 0.015, 0.14), STICK_T = V(-0.20, 0.72, 0.10);
  const SDIR = new THREE.Vector3().subVectors(STICK_T, STICK_B).normalize();
  const GRIP = V(-0.215, 0.48, 0.12);
  {
    tube(STICK_B, STICK_T, 0.018, 0.014, 6, P.leather, {capA:{hex:P.leatherDk}, capB:{hex:P.leatherDk, lift:0.01}});
  }

  /* torso (one loft, hips -> neck; slimmer than the gnome, no belly bulge) */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.095, hex:P.trouserDk},
    {y:L.waistY, rx:0.108, rz:0.088, hex:P.vest},
    {y:L.ribY,   rx:0.118, rz:0.092, hex:P.vest},
    {y:L.chestY, rx:0.128, rz:0.098, hex:P.vest},
    {y:L.shldY,  rx:0.130, rz:0.092, hex:P.vest},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.linenDk},
  ], 8, {capTop:{hex:P.linenDk, lift:0.004}});

  /* vest front placket */
  quad(V(-0.016,L.waistY,0.09), V(0.016,L.waistY,0.09), V(0.016,L.shldY,0.088), V(-0.016,L.shldY,0.088), P.vestDk, 0.04);

  /* belt */
  stack([
    {y:L.waistY-0.018, rx:0.112, rz:0.092, hex:P.leather},
    {y:L.waistY+0.014, rx:0.111, rz:0.090, hex:P.leather},
  ], 8, {});
  quad(V(-0.012,L.waistY-0.016,0.094), V(0.012,L.waistY-0.016,0.094), V(0.012,L.waistY+0.016,0.092), V(-0.012,L.waistY+0.016,0.092), P.brass, 0.02);

  /* HEAD — proportionally normal-to-slightly-large for the small frame (not gnome-huge). Nose
     pushed lightly. FRONT (+z) verts of this ring are 1 & 2 per the ring() convention. */
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
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);
    /* eyes — two SMALL intentional quads flanking the nose ridge, proud of the bulged face plane
       (house standard: never shaded ring columns). */
    for(const s of [-1,1]){
      const ex=s*0.048, ey=(L.cheekY+L.browY)/2-0.004, ez=0.112;
      quad(V(ex-0.012,ey-0.009,ez), V(ex+0.012,ey-0.009,ez),
           V(ex+0.012,ey+0.010,ez-0.006), V(ex-0.012,ey+0.010,ez-0.006), P.eye, 0.0);
    }
  }

  /* curly hair cap mass — a lumpy overlapping-blob ring set that reads as curls, not a smooth cap */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.045, rx:0.104, rz:0.096, hex:P.hairDk},   /* hairline sits ABOVE the brow — face stays visible */
      {y:L.crownY-0.005,rx:0.114, rz:0.104, hex:P.hair},
      {y:L.crownY+0.045,rx:0.098, rz:0.088, hex:P.hair},
      {y:L.headTopY+0.010, rx:0.060, rz:0.053, hex:P.hairDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,-0.004), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY+0.045, -0.004), P.hairDk);
    /* small curl-lump nubs — short + rounded so they read as curl texture, not ears/spikes */
    for(const a of [0.3,1.1,2.0,2.9,3.7,4.6,5.4]){
      const cx=Math.cos(a)*0.100, cz=Math.sin(a)*0.094-0.004, cy=L.crownY+Math.sin(a*3)*0.018;
      const base=V(cx,cy,cz), out=base.clone().addScaledVector(V(cx,0.01,cz).normalize(),0.014);
      tube(base, out, 0.017, 0.015, 4, P.hair, {capB:{hex:P.hair, lift:0.003}});
    }
  }

  /* ARMS — right hangs at the side; left derives to the stick grip */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.015);
    const E=V(0.155, 0.42, 0.03);
    const W=V(0.145, 0.30, 0.045);
    tube(S,E,0.036,0.030,6,P.vest);
    tube(E,W,0.028,0.024,6,P.skin,{capB:{hex:P.skinDk}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.015);
    const E2=V(-0.18, 0.575, 0.06);
    tube(S2,E2,0.036,0.030,6,P.vest);
    tube(E2, GRIP.clone().addScaledVector(SDIR,0.03), 0.028,0.024,6,P.skin, {capB:{hex:P.skin}});
    tube(GRIP.clone().addScaledVector(SDIR,-0.03), GRIP.clone().addScaledVector(SDIR,0.04), 0.026,0.022,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — rolled trousers stop mid-shin, then BARE oversized feet (the icon) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.008, 0.008), shinL=V(-0.098,0.185,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.008, 0.006), shinR=V( 0.10,0.185,-0.015);
    tube(hipL,shinL,0.058,0.042,6,P.trouser);
    tube(hipR,shinR,0.058,0.042,6,P.trouser);
    /* rolled cuff at the shin */
    stack([{y:0.16, rx:0.046, rz:0.038, cx:shinL.x, cz:shinL.z, hex:P.trouserDk},{y:0.20, rx:0.050, rz:0.041, cx:shinL.x, cz:shinL.z, hex:P.trouserDk}],6,{capTop:{hex:P.trouserDk,lift:0.003}});
    stack([{y:0.16, rx:0.046, rz:0.038, cx:shinR.x, cz:shinR.z, hex:P.trouserDk},{y:0.20, rx:0.050, rz:0.041, cx:shinR.x, cz:shinR.z, hex:P.trouserDk}],6,{capTop:{hex:P.trouserDk,lift:0.003}});

    /* bare feet — the ICON: big flat pads clearly oversized vs the slim shin, no boots, skin
       all the way (a shade lighter than the trouser cuff so the read is unmistakably "bare"). */
    for(const [ank,toeDir] of [[shinL,V(-0.06,0,1)], [shinR,V(0.30,0,0.95).normalize()]]){
      const ankBot=V(ank.x, 0.075, ank.z);
      tube(ank, ankBot, 0.040, 0.062, 6, P.skin);
      stack([
        {y:0.016, rx:0.078, rz:0.096, cx:ank.x, cz:ank.z, hex:P.footpadDk},
        {y:0.065, rx:0.072, rz:0.084, cx:ank.x, cz:ank.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(ank.x,0.040,ank.z), d=toeDir.clone().normalize();
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
