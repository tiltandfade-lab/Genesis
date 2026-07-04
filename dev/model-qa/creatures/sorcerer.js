/* dev/model-qa/creatures/sorcerer.js — the innate-caster landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js / mage.js: the ENTIRE creature is one function of shared
   primitives, every vertex in one model frame, no anchors. Differentiation from the WIZARD (mage.js,
   who owns "hat + straight orb-staff"): NO staff, NO hat. Raw innate magic — a bright energy wisp
   authored FIRST just off the open palm (the one legal floating element, kept within a finger's width
   of the hand), the casting hand/arm derived under it in a forward lunge. Swept-back hair (no hood),
   a fitted high-collared coat with a flared split skirt (NOT a robe — legs show through the split),
   lean dramatic stance. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildSorcerer(){
  /* ---------- PALETTE (VS desaturated; a small bright glow accent on the wisp only) ---------- */
  const P = {
    coat:0x4a2f4e, coatDk:0x37243c, coatLt:0x5c3d62,          /* plum-black fitted coat */
    trim:0x9c7d3e, trimDk:0x6e5a2c,                            /* tarnished gold piping */
    skin:0xc49a72, skinDk:0x8a6a4e, eye:0x1a1512,
    hair:0x2a2320, hairLt:0x3c322c,
    leg:0x2e2622, boot:0x241d15, bootDk:0x160f0a,
    wisp:0xff8a3c, wispCore:0xffe9a8, wispDk:0xb8501f,         /* bright glow accent — small only */
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (lean caster, ~4.7 heads, lunging) ---------- */
  const L = {
    hipY:0.72, waistY:0.82, ribY:0.94, chestY:1.04, shldY:1.12, neckY:1.155,
    shoulderX:0.215, hipHalf:0.105,
    jawY:1.185, cheekY:1.26, browY:1.335, crownY:1.42, headTopY:1.48,
  };

  /* ================= THE WISP — authored FIRST, floating just off the open right palm ================= */
  /* palm anchor is decided here (ground truth); the arm/hand below derives to meet it exactly.
     The flame is a small BLOB (probe-lib's blob helper — a proper ellipsoid, not a cone-stack)
     hovering right at the palm, with the axis of the blob tipped along PDIR so it reads as a
     rounded licking flame hugging the hand from every turnaround angle, not an ice-cream cone. */
  const PALM = V(0.40, 1.145, 0.62);           // raised to shoulder height, thrust ahead of the chest (+z)
  const PDIR = V(0.42, 0.10, 0.90).normalize(); // reach direction, palm facing forward-out (levelled, not down)
  const WISP_C = PALM.clone().addScaledVector(PDIR, 0.062);   // a finger's width off the palm
  {
    // rounded flame blob: wide-bellied ellipsoid via stacked rings, apex tipped along PDIR — 2x scale, brighter core
    const bands=[
      {t:0.0,  r:0.003},
      {t:0.22, r:0.060},
      {t:0.45, r:0.084},
      {t:0.62, r:0.076},
      {t:0.80, r:0.048},
      {t:1.0,  r:0.010},
    ];
    const n=8;
    const rings = bands.map(b=>{
      // blend straight-up growth with a lean toward PDIR so the flame silhouettes round from all sides
      const up = (b.t-0.4)*0.176;
      const lean = Math.sin(b.t*Math.PI)*0.040;
      const c = WISP_C.clone().addScaledVector(V(0,1,0), up).addScaledVector(PDIR, lean*0.5);
      return ring(c, V(0,1,0), b.r, b.r*0.94, n, Math.PI/n);
    });
    stitch(rings, (b)=> b<2?P.wispDk:(b<3?P.wisp:P.wispCore));
    capFan(rings[0], WISP_C.clone().addScaledVector(V(0,1,0),-0.092), P.wispDk, true);
    capFan(rings.at(-1), WISP_C.clone().addScaledVector(V(0,1,0),0.116).addScaledVector(PDIR,0.012), P.wispCore);
    // a bright core spark nested inside the belly of the flame — enlarged with the blob, brighter/bigger
    const coreC = WISP_C.clone().addScaledVector(V(0,1,0),0.02);
    const core = ring(coreC, V(0,1,0), 0.030, 0.030, 6, 0);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),0.04), P.wispCore);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),-0.036), P.wispCore, true);

    // faint SECOND wisp trailing the off (left) hand — smaller, tucked close at the fingertip, not stray
    const OFFWRIST = V(-0.34, 0.565, 0.235);
    const OFFTIP = OFFWRIST.clone().add(V(-0.01,-0.045,0.03));   // matches the left-hand tube tip exactly
    const w2 = OFFTIP.clone().addScaledVector(V(-0.35,0.25,0.35).normalize(), 0.020);
    const b2=[{t:0.0,r:0.001},{t:0.4,r:0.018},{t:0.75,r:0.013},{t:1.0,r:0.003}];
    const n2=6;
    const rings2 = b2.map(b=>ring(V(w2.x, w2.y+(b.t-0.4)*0.042, w2.z), V(0,1,0), b.r, b.r, n2, Math.PI/n2));
    stitch(rings2, (b)=> b<2?P.wispDk:P.wisp);
    capFan(rings2.at(-1), V(w2.x, w2.y+0.032, w2.z), P.wispCore);
  }

  /* TRUNK — fitted coat, one loft hips->neck (slim, no bulk) */
  stack([
    {y:L.hipY,   rx:0.155, rz:0.120, hex:P.coatDk},
    {y:L.waistY, rx:0.135, rz:0.105, hex:P.coat},
    {y:L.ribY,   rx:0.165, rz:0.125, hex:P.coat},
    {y:L.chestY, rx:0.190, rz:0.138, hex:P.coatLt},
    {y:L.shldY,  rx:0.195, rz:0.128, hex:P.coatLt},
    {y:L.neckY,  rx:0.075, rz:0.070, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* HIGH COLLAR — a flared band standing proud of the neckline (frames the face, no hood).
     Kept STRICTLY below jawY with radii smaller than the jaw ring so it never occludes the face —
     the earlier version reached cheek height and read as a dark cowl swallowing the chin. */
  {
    const n=8, ph=Math.PI/n;
    const cLo=ring(V(0,L.neckY-0.01,0.0), V(0,1,0), 0.078, 0.072, n, ph);
    const cHi=ring(V(0,L.jawY-0.045,0.004), V(0,1,0), 0.070, 0.062, n, ph);
    stitch([cLo,cHi], ()=>P.coatDk);
    capFan(cHi, V(0,L.jawY-0.055,0.0), P.coatDk, true);
  }

  /* FLARED SKIRT PANELS — split for the legs (NOT a closed robe): two panels, front-split, back panel */
  {
    // back panel (closed, flares out and down)
    const bp=[[L.hipY,-0.130],[0.52,-0.165],[0.32,-0.205],[0.14,-0.235]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.135,y2,z2), V(-0.135,y2,z2), V(-0.135,y1,z1), V(0.135,y1,z1), i%2?P.coat:P.coatDk, 0.04);
    }
    // two side panels flaring from the hips, leaving a front gap the legs show through.
    // Stops at mid-thigh (y=0.40) — the earlier version hemmed down to y=0.12 (ankle height) with
    // its inner edge collapsing toward the centerline (z~0.02-0.06), which read edge-on from a 3/4
    // walk-pose angle as a needle-thin sliver hanging from the crotch to the disc. A skirt panel has
    // no business reaching that low anyway (it's a HIP garment, not a full-length coat-tail).
    for(const s of [-1,1]){
      const sp=[[L.hipY,0.150*s,0.06],[0.50,0.205*s,0.045],[0.40,0.230*s,0.075]];
      for(let i=0;i<sp.length-1;i++){
        const [y1,x1,z1]=sp[i], [y2,x2,z2]=sp[i+1];
        const inX1=x1*0.55, inX2=x2*0.55;
        quad(V(inX1,y1,z1-0.01), V(x1,y1,z1), V(x2,y2,z2), V(inX2,y2,z2-0.01), i%2?P.coat:P.coatDk, 0.04);
      }
    }
    // gold piping trace down the front seam edges (small trim accent)
    const trimZ=[[L.chestY,0.150],[L.waistY,0.128],[L.hipY,0.145]];
    for(let i=0;i<trimZ.length-1;i++){
      const [y1,z1]=trimZ[i],[y2,z2]=trimZ[i+1];
      quad(V(-0.018,y1,z1),V(0.018,y1,z1),V(0.018,y2,z2),V(-0.018,y2,z2),P.trim,0.03);
    }
  }

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts are 1 & 2. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.076, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.102, rz:0.100, hex:P.skin},
      {y:L.browY,  rx:0.108, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.084, rz:0.076, hex:P.skinDk},
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
    /* eyes — two SMALL intentional quads flanking the nose, proud of the pushed nose-ridge face plane
       (Adam 2026-07-03: "smaller and more intentional, not shaded eye polys"). The cheek-row ring
       (rz=0.100, center z=0.010) puts the un-pushed front verts at z≈0.112; the nose push (+0.020 on
       the front verts) bulges that to z≈0.132 at eye height — use that pushed plane, not the raw ellipse,
       or the eyes end up buried. Sit the eye quads ~0.004 proud of it. */
    for(const s of [-1,1]){
      const ex=s*0.052, ey=(L.cheekY+L.browY)/2-0.004, ez=0.136;
      quad(V(ex-0.013,ey-0.0105,ez), V(ex+0.013,ey-0.0105,ez),
           V(ex+0.013,ey+0.0105,ez-0.006), V(ex-0.013,ey+0.0105,ez-0.006), P.eye, 0.0);
    }
  }

  /* SWEPT-BACK HAIR — no hat, no hood: a shell hugging the crown/back-of-head, NOT the face.
     Radii stay just at/under the skull bands and skip the front (+z) columns entirely so the
     face (eyes, nose) reads clean — the hair only covers the crown and sweeps back off it. */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];      // +z front arc — never covered by hair
    const bands=[
      {y:L.browY-0.01,  rx:0.098, rz:0.092, cz:-0.018, hex:P.hair},
      {y:L.crownY,      rx:0.088, rz:0.082, cz:-0.022, hex:P.hair},
      {y:L.crownY+0.05, rx:0.072, rz:0.070, cz:-0.034, hex:P.hairLt},
    ];
    const skip={0:faceCols, 1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings.at(-1), V(0,L.crownY+0.09,-0.045), P.hairLt);
    // swept tail sweeping back and down behind the neck
    const tail=[
      {y:L.crownY-0.02, cz:-0.09,  rx:0.07, rz:0.055},
      {y:L.neckY+0.06,  cz:-0.145, rx:0.05, rz:0.045},
      {y:0.98,          cz:-0.175, rx:0.03, rz:0.03},
    ].map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 6, Math.PI/6));
    stitch(tail, ()=>P.hair);
    capFan(tail.at(-1), V(0,0.90,-0.20), P.hairLt);
  }

  /* RIGHT ARM — CASTING arm, thrust forward/out; the hand is DERIVED from the wisp's palm anchor */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.365, 1.075, 0.335);                    // elbow, raised + bent forward toward the lifted palm
    const WRIST = PALM.clone().addScaledVector(PDIR, -0.055);
    tube(S,E,0.062,0.050,6,P.coatLt);                  // upper sleeve
    tube(E,WRIST,0.048,0.036,6,P.coat,{capB:{hex:P.skinDk}}); // forearm sleeve to the cuff
    // the open palm/hand: a flat-ish nub oriented along PDIR, fingers spread toward the wisp
    const HB=WRIST.clone().addScaledVector(PDIR,0.01), HT=PALM.clone().addScaledVector(PDIR,0.015);
    tube(HB,HT,0.040,0.030,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    // three short splayed fingers reaching toward the wisp (open-palm cast gesture)
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,PDIR).normalize();
    for(const k of [-1,0,1]){
      const base=HT.clone().addScaledVector(fu,k*0.017);
      const tip=base.clone().addScaledVector(PDIR,0.05).addScaledVector(fu,k*0.012);
      tube(base,tip,0.012,0.007,4,P.skin,{capB:{hex:P.skin}});
    }
  }

  /* LEFT ARM — off arm, swept back low for the lunge counter-balance; the faint trailing wisp sits near its wrist */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.30, 0.83, -0.02);
    const W2=V(-0.34, 0.565, 0.235);          // matches OFFWRIST in the wisp block exactly
    tube(S2,E2,0.060,0.048,6,P.coatLt);
    tube(E2,W2,0.046,0.034,6,P.coat,{capB:{hex:P.skinDk}});
    tube(W2, W2.clone().add(V(-0.01,-0.045,0.03)), 0.036,0.028,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — dramatic forward lunge stance, showing through the split skirt */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, -0.02), kneeL=V(-0.145,0.42,-0.18), ankL=V(-0.155,0.085,-0.24);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.02),  kneeR=V( 0.20,0.44,0.34),  ankR=V( 0.235,0.085,0.46);
    tube(hipL,kneeL,0.072,0.052,6,P.leg);
    tube(kneeL,ankL,0.050,0.036,6,P.leg);
    tube(hipR,kneeR,0.078,0.056,6,P.leg);
    tube(kneeR,ankR,0.052,0.038,6,P.leg);
    for(const [ank,toeDir] of [[ankL,V(-0.15,0,-0.9).normalize()], [ankR,V(0.35,0,0.94).normalize()]]){
      stack([
        {y:0.012, rx:0.060, rz:0.066, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.052, rz:0.056, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.155, rx:0.058, rz:0.058, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.125), 0.050,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.044, rbz:0.030});
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
