/* dev/model-qa/creatures/npc-bandit.js — the roadside-bandit landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js: the ENTIRE creature is one function of shared
   primitives, every vertex in one model frame, no anchors. The CLUB is authored FIRST, held low
   and ready at the hip, so the gripping hand derives to it. Leather jerkin over a shirt, a dark
   face-SCARF banding the lower face (eyes still painted per the humanoid.js house standard, ABOVE
   the scarf band), a rough cap, crouched wary stance — lighter/cheaper than the rogue (no twin
   daggers, no fine leather, no hood-and-cloak set). Human proportions copied from humanoid.js
   (head-top ~1.475), stance widened and lowered for a wary crouch. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildBandit(){
  /* ---------- PALETTE (VS desaturated: dirty leather/canvas, no fine trims) ---------- */
  const P = {
    jerkin:0x5a4a34, jerkinDk:0x413425, shirt:0x7a7160, shirtDk:0x554e42,
    scarf:0x2e2a24, scarfDk:0x201d19,
    cap:0x453824, capDk:0x2f2618,
    skin:0xb08a5f, skinDk:0x7a5d3f, eye:0x1a1512,
    club:0x64503a, clubDk:0x3a2d1e, wrap:0x8a7048,
    trouser:0x433c2e, boot:0x2a2117,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — humanoid.js rig, widened+lowered stance for a wary crouch ---------- */
  const L = {
    hipY:0.685, waistY:0.765, ribY:0.875, chestY:0.975, shldY:1.055, neckY:1.09,
    hipHalf:0.125, shoulderX:0.245,
    jawY:1.12, cheekY:1.195, browY:1.27, crownY:1.36, headTopY:1.42,
  };

  /* ================= THE CLUB — authored FIRST, held LOW and ready at the hip (not raised) ====== */
  const GRIP = V(0.355, 0.63, 0.155), HEAD_END = V(0.46, 0.32, 0.33);
  const CLUB_DIR = new THREE.Vector3().subVectors(HEAD_END, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(CLUB_DIR, -0.09);
  {
    // handle: thin, wrapped grip
    tube(BUTT, GRIP.clone().addScaledVector(CLUB_DIR,0.05), 0.020,0.022,6,P.wrap,{capA:{hex:P.clubDk}});
    // haft continuing to a thick knotted head
    tube(GRIP.clone().addScaledVector(CLUB_DIR,0.05), HEAD_END, 0.026,0.052,7,P.club,{capB:{hex:P.clubDk}});
    // a couple of crude iron studs near the head (cheap improvised weapon detail)
    for(const t of [0.68,0.85]){
      const c=GRIP.clone().lerp(HEAD_END,t);
      const sr=ring(c, CLUB_DIR, 0.056, 0.056, 6);
      capFan(sr, c.clone().addScaledVector(CLUB_DIR,0.012), P.scarfDk);
    }
  }

  /* trunk (one loft, hips->neck) — shirt underneath, jerkin as the outer band from waist up */
  stack([
    {y:L.hipY,   rx:0.190, rz:0.145, hex:P.trouser},
    {y:L.waistY, rx:0.165, rz:0.128, hex:P.shirtDk},
    {y:L.ribY,   rx:0.192, rz:0.145, hex:P.shirt},
    {y:L.chestY, rx:0.215, rz:0.158, hex:P.jerkin},
    {y:L.shldY,  rx:0.220, rz:0.150, hex:P.jerkin},
    {y:L.neckY,  rx:0.082, rz:0.078, hex:P.shirtDk},
  ], 8, {capTop:{hex:P.shirtDk, lift:0.004}});

  /* LEATHER JERKIN — a sleeveless overlayer band across the chest/ribs, open at the shirt collar,
     with a rough stitched edge (a second, slightly wider loft sitting proud of the trunk) */
  stack([
    {y:L.waistY+0.01, rx:0.178, rz:0.138, hex:P.jerkinDk},
    {y:L.ribY+0.01,   rx:0.205, rz:0.155, hex:P.jerkin},
    {y:L.chestY+0.01, rx:0.228, rz:0.168, hex:P.jerkin},
    {y:L.shldY-0.02,  rx:0.230, rz:0.158, hex:P.jerkinDk},
  ], 8, {});
  // crude cross-lacing up the jerkin front (a few short diagonal quad "stitches")
  for(let k=0;k<3;k++){
    const y0=L.waistY+0.03+k*0.075, y1=y0+0.055;
    quad(V(-0.03,y0,0.165), V(0.03,y0+0.02,0.168), V(0.02,y1,0.163), V(-0.04,y1-0.02,0.160), P.scarfDk, 0.05);
  }

  /* belt (plain, worn) */
  stack([
    {y:L.hipY+0.05, rx:0.185, rz:0.142, hex:P.scarfDk},
    {y:L.hipY+0.09, rx:0.183, rz:0.140, hex:P.scarf},
  ], 8, {});

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts of this ring are 1 & 2 — house
     eye standard copied EXACTLY from humanoid.js. Eyes sit ABOVE the scarf band authored below. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.080, rz:0.086, hex:P.skin},
      {y:L.cheekY, rx:0.110, rz:0.106, hex:P.skin},
      {y:L.browY,  rx:0.114, rz:0.104, hex:P.skin},
      {y:L.crownY, rx:0.088, rz:0.080, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.012), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.022;           /* nose ridge on the front verts */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.008), P.skinDk);
    /* eyes — two SMALL intentional quads flanking the nose, proud of the face surface
       (Adam 2026-07-03: "smaller and more intentional, not shaded eye polys"). House standard,
       positioned clear ABOVE where the scarf band will sit. */
    for(const s of [-1,1]){
      const ex=s*0.053, ey=(L.cheekY+L.browY)/2-0.002, ez=0.124;
      quad(V(ex-0.014,ey-0.010,ez), V(ex+0.014,ey-0.010,ez),
           V(ex+0.014,ey+0.012,ez-0.006), V(ex-0.014,ey+0.012,ez-0.006), P.eye, 0.0);
    }
  }

  /* FACE SCARF — a band of dark quads across the lower face (nose-bridge down to under the jaw),
     covering nose/mouth, sitting BELOW the eyes. Proud of the face surface so it reads as cloth,
     not a paint stain. */
  {
    const n=8, ph=Math.PI/n;
    const scarfBands=[
      {y:L.jawY-0.06,  rx:0.090, rz:0.096, hex:P.scarfDk},
      {y:L.jawY+0.005, rx:0.088, rz:0.094, hex:P.scarf},
      {y:L.cheekY-0.045,rx:0.114, rz:0.110, hex:P.scarf},
    ];
    const faceCols=[0,1,2,3];  // wide +z-ish front arc — wraps most of the lower face, not just a sliver
    const rings=scarfBands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    // push the front verts proud of the face so the scarf reads as a raised cloth band
    for(const r of rings) for(const i of faceCols) r[i].z += 0.032;
    for(let b=0;b<rings.length-1;b++){
      for(const i of faceCols){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], scarfBands[b].hex, 0.04);
      }
    }
    // top edge cap so the scarf's upper rim reads as a clean band-edge, not open geometry
    for(const i of faceCols){
      const i2=(i+1)%n;
      quad(rings[2][i], rings[2][i2], rings[2][i2].clone().add(V(0,0.012,0)), rings[2][i].clone().add(V(0,0.012,0)), P.scarfDk, 0.03);
    }
    // a knot/tail at the side where the scarf ties off, hanging down past the jaw
    const knot=V(0.115, L.jawY-0.02, 0.045);
    tube(knot, knot.clone().add(V(0.02,-0.07,-0.015)), 0.013,0.008,5,P.scarfDk,{capB:{hex:P.scarfDk}});
  }

  /* ROUGH CAP — a simple low cloth cap (not a full hood, cheaper silhouette than the rogue's) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.02,  rx:0.122, rz:0.114, hex:P.cap},
      {y:L.crownY+0.01, rx:0.100, rz:0.090, hex:P.cap},
      {y:L.headTopY+0.015, rx:0.060, rz:0.052, hex:P.capDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,-0.004), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.headTopY+0.05,-0.01), P.capDk);
    // a floppy fold flopping to one side (cheap-cap character detail)
    const foldA=V(0.07,L.crownY+0.03,-0.09), foldB=V(0.11,L.crownY-0.02,-0.13);
    tube(foldA, foldB, 0.028,0.014,5,P.capDk,{capB:{hex:P.capDk}});
  }

  /* arms — RIGHT hand DERIVED from the club grip (held low, ready); LEFT hand hangs loosely,
     slightly forward, fingers open (wary balance stance, not a fighting guard). */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.335, 0.815, 0.075);
    const W=GRIP.clone().addScaledVector(CLUB_DIR,-0.02);
    tube(S,E,0.076,0.060,6,P.jerkin);
    tube(E,W,0.056,0.046,6,P.shirtDk,{capB:{hex:P.skin}});
    tube(GRIP.clone().addScaledVector(CLUB_DIR,-0.045), GRIP.clone().addScaledVector(CLUB_DIR,0.04), 0.046,0.042,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skinDk}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02), E2=V(-0.32,0.815,0.075), W2=V(-0.285,0.60,0.075);
    tube(S2,E2,0.076,0.060,6,P.jerkin);
    tube(E2,W2,0.056,0.046,6,P.shirtDk,{capB:{hex:P.skin}});
    const HDIR=V(-0.03,-0.9,0.25).normalize();
    tube(W2, W2.clone().addScaledVector(HDIR,0.08), 0.042,0.034,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skinDk}});
  }

  /* legs — crouched wary stance: wider apart, knees bent lower than humanoid's braced fighter
     stance, weight low and ready to move (lighter than the rogue's crouch — plain trousers) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.02), kneeL=V(-0.205,0.34,0.11), ankL=V(-0.19,0.085,0.055);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.225,0.335,-0.055), ankR=V( 0.205,0.085,-0.10);
    tube(hipL,kneeL,0.086,0.062,6,P.trouser);
    tube(kneeL,ankL,0.058,0.042,6,P.trouser);
    tube(hipR,kneeR,0.086,0.062,6,P.trouser);
    tube(kneeR,ankR,0.058,0.042,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.10,0,1)], [ankR,V(0.80,0,0.35).normalize()]]){
      stack([
        {y:0.012, rx:0.066, rz:0.074, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.095, rx:0.058, rz:0.060, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.13), 0.054,0.040,6,P.boot, {capB:{hex:P.boot, lift:0.013}, raz:0.046, rbz:0.032});
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
