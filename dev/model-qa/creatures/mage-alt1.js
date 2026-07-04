/* dev/model-qa/creatures/mage-alt1.js — the ORIGINAL wizard (mage), KEPT as an alt (Alt policy,
   F3 2026-07-04). Adam rated the OG wizard good; when F3 re-posed it into an incantation stance (new
   PRIMARY in mage.js — orb-staff canted forward, free casting hand raised, forward lean), this upright
   parade stance (staff dead-vertical, both arms hanging) is preserved verbatim as `mage-alt1` so both
   render on the alts sheet. Identical geometry to the pre-F3 mage.js; only the export name differs.

   Same whole-object grammar as humanoid.js: the ENTIRE creature is one function of shared primitives,
   every vertex in one model frame, no anchors. The staff is authored first. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildMageAlt1(){
  /* ---------- PALETTE (VS desaturated; carried as vertex color into the GLB) ---------- */
  const P = {
    robe:0x3b3f63, robeDk:0x2c2f4c, robeLt:0x4a4f78, trim:0xb08d46, trimDk:0x7d6432,
    linen:0xcfc4a6, skin:0xc49a72, skinDk:0x8a6a4e, beard:0xbfc2c4, beardDk:0x8f9294,
    eye:0x1a1512, wood:0x5a4326, woodDk:0x3f2f1a, orb:0x9fd8e6, orbCore:0xe8f6fb,
    hat:0x33375a, hatDk:0x24274238&0xffffff, disc:0x4a4038, discTop:0x585047,
  };
  P.hatDk = 0x242742;

  /* ---------- LANDMARKS (slim caster, ~4.6 heads) ---------- */
  const L = {
    hemY:0.05, kneeY:0.42, waistY:0.82, chestY:1.02, shldY:1.11, neckY:1.155,
    shoulderX:0.225,
    jawY:1.185, cheekY:1.26, browY:1.335, crownY:1.425, headTopY:1.485,
  };

  /* ROBE — one long loft, floor hem up to the neck (this IS the lower body) */
  stack([
    {y:L.hemY,   rx:0.315, rz:0.255, hex:P.robeDk},
    {y:L.kneeY,  rx:0.270, rz:0.220, hex:P.robe},
    {y:0.62,     rx:0.235, rz:0.190, hex:P.robe},
    {y:L.waistY, rx:0.190, rz:0.155, hex:P.robe},
    {y:L.chestY, rx:0.215, rz:0.165, hex:P.robeLt},
    {y:L.shldY,  rx:0.220, rz:0.150, hex:P.robeLt},
    {y:L.neckY,  rx:0.080, rz:0.075, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* robe hem flare (a second skirt lip so the base of the loft reads as heavy cloth) */
  stack([
    {y:L.hemY-0.005, rx:0.345, rz:0.280, hex:P.robeDk},
    {y:0.16,         rx:0.300, rz:0.245, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});

  /* front trim placket — a vertical band of trim quads down the robe front (+z face) */
  {
    const zs=[[L.chestY,0.163],[0.92,0.175],[L.waistY,0.150],[0.66,0.185],[0.50,0.213],[L.kneeY,0.222]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.035,y1,z1), V(0.035,y1,z1), V(0.035,y2,z2), V(-0.035,y2,z2), i%2?P.trim:P.trimDk, 0.04);
    }
  }

  /* belt cord + hanging knot */
  stack([
    {y:L.waistY-0.01, rx:0.198, rz:0.162, hex:P.trimDk},
    {y:L.waistY+0.03, rx:0.196, rz:0.160, hex:P.trim},
  ], 8, {});
  tube(V(0.02,L.waistY,0.16), V(0.05,0.66,0.20), 0.018,0.012,6,P.trim,{capB:{hex:P.trimDk}});

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts are 1 & 2. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.078, rz:0.084, hex:P.skin},
      {y:L.cheekY, rx:0.106, rz:0.104, hex:P.skin},
      {y:L.browY,  rx:0.112, rz:0.104, hex:P.skin},
      {y:L.crownY, rx:0.088, rz:0.080, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);
    /* eyes — small intentional dot quads (house standard, Adam 2026-07-03), not shaded ring columns.
       DIRECTOR FIX (2026-07-03, dimetric-angle pass): -0.028 sat too low under the hat brim and
       read as a smudge/mustache instead of eyes. Raised to mid-face (cheekY/browY midpoint minus a
       small 0.014 nudge, half the old drop) and enlarged ~1.2x so they read as two distinct dots
       below the brim shadow but above the beard line. ez/x unchanged (still proud of the bulged
       face plane, still flanking the nose ridge). */
    for(const s of [-1,1]){
      const ex=s*0.058, ey=(L.cheekY+L.browY)/2-0.014, ez=0.128;  /* flank the nose ridge, proud of the bulged face plane, clear of the hat-brim shadow line */
      quad(V(ex-0.015,ey-0.009,ez), V(ex+0.015,ey-0.009,ez),
           V(ex+0.015,ey+0.010,ez-0.006), V(ex-0.015,ey+0.010,ez-0.006), P.eye, 0.0);
    }
  }

  /* BEARD — a tapering wedge of rings from the jaw down the chest (front-offset) */
  {
    const bands=[
      {y:L.jawY+0.01, rx:0.095, rz:0.070, cz:0.045, hex:P.beard},
      {y:L.cheekY-0.06,rx:0.088,rz:0.062, cz:0.070, hex:P.beard},
      {y:1.06,        rx:0.078, rz:0.055, cz:0.085, hex:P.beard},
      {y:0.96,        rx:0.058, rz:0.045, cz:0.080, hex:P.beardDk},
      {y:0.88,        rx:0.030, rz:0.028, cz:0.070, hex:P.beardDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,0.83,0.062), P.beardDk);
  }

  /* POINTED HAT — brim ring around the brow, then a tall drooping cone */
  {
    const n=10, ph=Math.PI/n;
    const brimLo=ring(V(0,L.browY+0.01,0.0), V(0,1,0), 0.185, 0.175, n, ph);
    const brimHi=ring(V(0,L.browY+0.05,0.0), V(0,1,0), 0.155, 0.148, n, ph);
    stitch([brimLo,brimHi], ()=>P.hatDk);
    capFan(brimLo, V(0,L.browY-0.01,0.0), P.hatDk, true);   // underside of brim
    /* cone body: rings shrinking + leaning back, up to a drooped tip */
    const cone=[
      {y:L.crownY-0.02, rx:0.150, rz:0.142, cz:0.0},
      {y:1.62,          rx:0.110, rz:0.104, cz:-0.02},
      {y:1.80,          rx:0.072, rz:0.068, cz:-0.05},
      {y:1.96,          rx:0.040, rz:0.038, cz:-0.09},
    ].map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(cone, ()=>P.hat);
    stitch([brimHi,cone[0]], ()=>P.hat);
    capFan(cone.at(-1), V(0.02,2.06,-0.16), P.hatDk);        // drooping point
    /* hat band */
    const bandLo=ring(V(0,L.crownY-0.01,0.0), V(0,1,0), 0.152,0.144,n,ph);
    const bandHi=ring(V(0,L.crownY+0.05,0.0),V(0,1,0), 0.140,0.132,n,ph);
    stitch([bandLo,bandHi], ()=>P.trim);
  }

  /* STAFF FIRST — vertical shaft the casting fist is fitted to */
  const SHAFT_B=V(0.34,0.02,0.16), SHAFT_T=V(0.30,1.70,0.10);
  const SDIR=new THREE.Vector3().subVectors(SHAFT_T,SHAFT_B).normalize();
  const GRIP=V(0.315,1.02,0.135);                            // where the fist meets the shaft
  {
    tube(SHAFT_B, SHAFT_T, 0.028, 0.024, 6, P.wood, {capA:{hex:P.woodDk}});
    /* orb cradle: three prongs + an orb */
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2, pr=0.055;
      const claw=V(SHAFT_T.x+Math.cos(a)*pr, SHAFT_T.y+0.06, SHAFT_T.z+Math.sin(a)*pr);
      tube(SHAFT_T, claw, 0.014,0.008,5,P.woodDk,{capB:{hex:P.woodDk}});
    }
    // orb — small ellipsoid blob at the crown of the staff
    const oc=V(SHAFT_T.x, SHAFT_T.y+0.11, SHAFT_T.z);
    const orb=[];
    const ob=[0.0,0.35,0.62,0.82,0.96,1.0];
    for(const t of ob){ const yy=oc.y-0.058+t*0.116; const rr=Math.sqrt(Math.max(0,1-Math.pow((t-0.5)*2,2)))*0.062;
      orb.push(ring(V(oc.x,yy,oc.z), V(0,1,0), rr+0.001, rr+0.001, 8, Math.PI/8)); }
    stitch(orb, (b)=> b<2?P.orb:P.orbCore);
  }

  /* ARMS — bell sleeves. Right arm raised to the staff grip; left hangs at the side. */
  {
    /* right: shoulder -> elbow -> wrist at GRIP, wide sleeve then a small hand nub */
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.31,0.90,0.10);
    const W=GRIP.clone().add(V(0.0,-0.02,-0.01));
    tube(S,E,0.090,0.075,6,P.robeLt);                       // upper sleeve
    tube(E,W,0.088,0.055,6,P.robe,{capB:{hex:P.robeDk}});   // bell forearm sleeve (wide->narrow at cuff)
    tube(GRIP.clone().add(V(-0.01,-0.05,0.0)), GRIP.clone().add(V(0.01,0.05,0.0)), 0.042,0.040,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    /* left: shoulder -> elbow -> wrist, hanging, wide cuff and a hand nub */
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02), E2=V(-0.29,0.86,0.03), W2=V(-0.26,0.60,0.10);
    tube(S2,E2,0.090,0.075,6,P.robeLt);
    tube(E2,W2,0.088,0.052,6,P.robe,{capB:{hex:P.robeDk}});
    tube(W2, W2.clone().add(V(0.0,-0.075,0.02)), 0.040,0.034,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
