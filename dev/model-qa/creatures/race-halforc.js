/* dev/model-qa/creatures/race-halforc.js — Half-Orc PC race, plain adventurer garb (whole-object probe).
   Human-frame variant (per humanoid.js) pushed BROADER/HEAVIER: wider shoulder/chest bands, a thick
   columnar neck, a heavy square jaw with small pale tusk nubs, an aggressively jutting brow, cropped
   dark hair. Simple leathers, no class weapons — belt knife only, sheathed. Whole-object: one landmark
   table, no anchors, everything lands straight into the merged frame. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrc(){
  /* ---------- PALETTE (VS desaturated, gray-green skin family) ---------- */
  const P = {
    leather:0x6b5636, leatherDk:0x4d3c24, leatherLt:0x7d6640,   /* broader-cut earth-tone leathers */
    linen:0xb8ac8e, linenDk:0x7d7358,
    skin:0x7a8a6e, skinDk:0x525e48, skinLt:0x8fa080,             /* gray-green half-orc skin */
    tusk:0xd8cdae, tuskDk:0xb9ac86,
    hair:0x2a2420, hairDk:0x1c1815,
    trouser:0x4a4030, boot:0x352b1e, bootDk:0x291f15,
    strap:0x33281b, eye:0x140f0c, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — heavier/broader frame than humanoid.js, ~1.52 total height ---------- */
  const L = {
    hipY:0.735, waistY:0.815, ribY:0.930, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* trunk (one loft, hips -> neck). rx/rz pushed well past humanoid.js's 0.230-0.245 range at
     chest/shoulder, and the neck ring is a thick near-cylindrical column, not a taper. */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.180, hex:P.leatherDk},
    {y:L.waistY, rx:0.205, rz:0.160, hex:P.leather},
    {y:L.ribY,   rx:0.245, rz:0.185, hex:P.leather},
    {y:L.chestY, rx:0.282, rz:0.205, hex:P.leather},
    {y:L.shldY,  rx:0.298, rz:0.198, hex:P.leather},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.skinDk},   /* thick column, NOT tapered — sells the heavy neck */
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});

  /* leather skirt/tassets (broader cut than humanoid.js's tunic skirt) */
  stack([
    {y:0.475, rx:0.290, rz:0.225, hex:P.leatherDk},
    {y:0.610, rx:0.262, rz:0.202, hex:P.leather},
    {y:0.750, rx:0.235, rz:0.175, hex:P.leather},
  ], 8, {});

  /* belt + sheathed knife (small, plain — not held/hero-posed) */
  stack([
    {y:0.790, rx:0.212, rz:0.160, hex:P.strap},
    {y:0.850, rx:0.208, rz:0.157, hex:P.strap},
  ], 8, {});
  quad(V(-0.03,0.796,0.168), V(0.03,0.796,0.168), V(0.03,0.842,0.164), V(-0.03,0.842,0.164), P.leatherLt, 0.02);
  /* belt knife: small sheath hanging at the hip, blade tucked away, plain pommel only visible */
  {
    const sheathTop=V(0.175,0.845,0.05), sheathBot=V(0.185,0.700,0.06);
    tube(sheathTop, sheathBot, 0.024,0.016,6,P.leatherDk, {capB:{hex:P.leatherDk}});
    tube(sheathTop, sheathTop.clone().add(V(0,0.03,0)), 0.014,0.010,5,P.tusk, {capB:{hex:P.tuskDk}}); /* small pommel nub */
  }

  /* head (skin loft; heavy jaw, jutting brow, tusk nubs, painted eyes).
     FRONT (+z) verts of this ring are 1 & 2, per the house ring() convention. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.148, rz:0.126, hex:P.skin},    /* heavy/SQUARE jaw — widest band of the head, past humanoid.js's 0.082/0.088 */
      {y:L.cheekY, rx:0.140, rz:0.130, hex:P.skin},
      {y:L.browY,  rx:0.132, rz:0.118, hex:P.skin},    /* brow band narrower than jaw so the push below reads as a distinct ridge, not just more width */
      {y:L.crownY, rx:0.108, rz:0.096, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    /* nose ridge on the cheek band (front verts pushed forward, same trick as humanoid.js) */
    for(const i of [1,2]) rings[1][i].z += 0.018;
    /* heavy brow: push the browY front verts (+z) AGGRESSIVELY — well past the subtle nose-ridge
       trick — so it juts out further than the cheeks/nose below it, reading as a shelf that casts
       shadow down onto the eyes. Push the front-adjacent verts too for a wide, chunky ridge instead
       of a single pinched point. */
    for(const i of [1,2]) rings[2][i].z += 0.058;
    for(const i of [0,3]) rings[2][i].z += 0.030;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
    /* tusk nubs — two small pale wedge quads rising from the lower lip/jaw, projecting +z and
       slightly +y. Nubs (not big boar tusks), pale/bone colored to contrast the gray-green skin.
       Base sits proud of the WIDENED jaw surface (jaw rz 0.126, so base z pushed to clear it). */
    for(const s of [-1,1]){
      const bx=s*0.044, by=L.jawY-0.006, bz=0.140;         /* base at the jaw/lip line, proud of the wider jaw */
      const tx=s*0.038, ty=by+0.040, tz=bz+0.032;          /* tip: up and further forward — a nub, not a tusk */
      const w=0.020;
      quad(V(bx-w,by-0.008,bz), V(bx+w,by-0.008,bz), V(tx+w*0.3,ty,tz), V(tx-w*0.3,ty,tz), P.tusk, 0.0);
    }
  }

  /* cropped dark hair — a low-profile cap hugging the crown, two shrunk ring-bands, dark tone.
     Radii sit just PROUD of the skull's own browY/crownY radii (0.132/0.118 rx) so the cap reads
     as a thin shell over the skull with no gap-sliver at the open-face seam edges (cols 0 & 7). */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.010, rx:0.136, rz:0.122, hex:P.hairDk},
      {y:L.crownY+0.004,rx:0.112, rz:0.100, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[1,2,3,4,5,6]});   /* skip the face-front arc, keep sides/back */
    capFan(rings[1], V(0, L.headTopY+0.010, -0.004), P.hair);
  }

  /* arms — simple leather sleeves, no held weapon (belt knife stays sheathed) */
  {
    const S=V(L.shoulderX, L.shldY-0.012, 0.018);
    const E=V(0.365,0.865,0.095);
    const W=V(0.335,0.660,0.145);
    tube(S,E,0.098,0.076,6,P.leather);
    tube(E,W,0.072,0.058,6,P.skin, {capB:{hex:P.skinDk}});
    const S2=V(-L.shoulderX, L.shldY-0.012, 0.018);
    const E2=V(-0.372,0.860,0.070);
    const W2=V(-0.330,0.655,0.170);
    tube(S2,E2,0.098,0.076,6,P.leather);
    tube(E2,W2,0.072,0.058,6,P.skin, {capB:{hex:P.skinDk}});
  }

  /* legs — braced stance, simple leather/trouser, boots (identical convention to humanoid.js) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.012, 0.012), kneeL=V(-0.165,0.395,0.080), ankL=V(-0.175,0.085,0.048);
    const hipR=V( L.hipHalf, L.hipY-0.012, 0.005), kneeR=V( 0.190,0.395,-0.038), ankR=V( 0.205,0.085,-0.090);
    tube(hipL,kneeL,0.100,0.074,6,P.trouser);
    tube(kneeL,ankL,0.070,0.050,6,P.trouser);
    tube(hipR,kneeR,0.100,0.074,6,P.trouser);
    tube(kneeR,ankR,0.070,0.050,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.078, rz:0.086, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.068, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.074, rz:0.074, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.062,0.048,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.054, rbz:0.038});
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
