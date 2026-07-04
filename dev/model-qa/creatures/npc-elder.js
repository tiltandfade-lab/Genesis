/* dev/model-qa/creatures/npc-elder.js — the village elder (whole-object NPC).
   npc-role rows 90-94 (Outsider Resident / Reclusive Figure / Authority Proxy / Local Leader —
   "power without title") + the recurring "elder" across the urban tables: the wise/aged authority
   read. THE distinctness check: the elder must NOT read as the noble. The noble stands UPRIGHT,
   chin high, cane held tip-to-ground as an ornament of status. The elder is BENT with age and
   leans his WEIGHT onto a gnarled staff (authored FIRST — the staff bears him, not the reverse):
   a stooped spine, a long white BEARD to the chest, a plain long robe, a shawl, and a slow settled
   stance. Humble aged greys/creams, no wine-and-gold finery. Shared rig/base from parts.js. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildElder(){
  /* ---------- PALETTE (aged, humble: undyed wool + a muted shawl + white hair/beard) ---------- */
  const P = Object.assign({}, BASE_P, {
    robe:0x8f8468, robeDk:0x655c44, robeLt:0xa19a7c,
    shawl:0x6b6a72, shawlDk:0x4c4b53, shawlLt:0x7d7c85,
    skin:0xc0a582, skinDk:0x8f7658,                         // paler, weathered aged skin
    hair:0xbdb7a8, hairDk:0x928c7e,                          // aged grey-white hair + beard (toned off pure white)
    staff:0x5c4a34, staffDk:0x3c3020, staffLt:0x6e5a40,
    sandal:0x574530, sandalDk:0x3a2d1d,
  });

  /* ---------- RIG — SHORT and STOOPED; the head hangs forward, the spine curves ---------- */
  const L = humanoidRig({
    hipY:0.66, waistY:0.735, ribY:0.83, chestY:0.925, shldY:1.00, neckY:1.04,
    hipHalf:0.11, shoulderX:0.228,
    jawY:1.065, cheekY:1.135, browY:1.205, crownY:1.29, headTopY:1.345,
  });

  /* an age-hunch: forward lean that grows up the spine (fwd = +z), plus a slight settling drop */
  const HIP_PIVOT_Y = L.hipY;
  const lean = (p) => { const t = Math.max(0, p.y - HIP_PIVOT_Y); return V(p.x, p.y - t*0.06, p.z + t*0.30); };

  /* ================= THE GNARLED STAFF — authored FIRST, planted forward, the elder LEANS his
     WEIGHT onto it: both the tilt and the two-handed high grip say the staff bears him. A knobby
     natural-wood shaft with a crooked top. ======================================================= */
  const STAFF_BUTT=V(0.245,0.02,0.30), STAFF_TOP=V(0.30,1.14,0.20);
  const SDIR=new THREE.Vector3().subVectors(STAFF_TOP,STAFF_BUTT).normalize();
  const GRIP_HI=STAFF_BUTT.clone().addScaledVector(SDIR, 0.94);    // top hand (bearing weight)
  const GRIP_LO=STAFF_BUTT.clone().addScaledVector(SDIR, 0.74);    // lower hand below it
  {
    /* knobby shaft: a few tube segments of slightly varying radius (gnarled read) */
    const segs=[STAFF_BUTT, STAFF_BUTT.clone().addScaledVector(SDIR,0.38), STAFF_BUTT.clone().addScaledVector(SDIR,0.74), STAFF_TOP];
    const rr=[0.026,0.022,0.028,0.020];
    for(let i=0;i<segs.length-1;i++) tube(segs[i], segs[i+1], rr[i],rr[i+1], 6, i%2?P.staffLt:P.staff, {capA:i===0?{hex:P.staffDk}:undefined});
    /* a crooked knot near the top + a knobby head */
    capFan(ring(STAFF_TOP, SDIR, 0.034,0.030, 7, 0), STAFF_TOP.clone().addScaledVector(SDIR,0.04).add(V(0.02,0,0.01)), P.staffDk);
  }

  /* trunk — plain long robe, narrow (a frail aged frame), stooped forward */
  stack([
    {y:L.hipY,   rx:0.172, rz:0.132, hex:P.robeDk},
    {y:L.waistY, rx:0.152, rz:0.116, hex:P.robe},
    {y:L.ribY,   rx:0.168, rz:0.126, hex:P.robe},
    {y:L.chestY, rx:0.178, rz:0.132, hex:P.robe},
    {y:L.shldY,  rx:0.176, rz:0.126, hex:P.robeDk},   // rounded/hunched shoulders
    {y:L.neckY,  rx:0.076, rz:0.072, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:lean});

  /* long robe skirt to the ankles (plain, undyed) */
  stack([
    {y:0.14, rx:0.205, rz:0.168, hex:P.robeDk},
    {y:0.34, rx:0.196, rz:0.158, hex:P.robe},
    {y:0.50, rx:0.184, rz:0.146, hex:P.robe},
    {y:L.hipY-0.01, rx:0.168, rz:0.128, hex:P.robeLt},
  ], 8, {});

  /* a SHAWL over the rounded shoulders (an old man's warmth-layer; muted grey) */
  {
    const bands=[
      {y:L.chestY-0.02, rx:0.196, rz:0.148, hex:P.shawlDk},
      {y:L.shldY+0.02, rx:0.202, rz:0.150, hex:P.shawl},
      {y:L.neckY-0.01, rx:0.132, rz:0.108, hex:P.shawlLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, 9, Math.PI/9).map(lean));
    stitch(rings, b=>bands[b].hex);
    /* the shawl's two hanging front tails */
    for(const s of [-1,1]) quad(lean(V(s*0.08,L.chestY,0.135)), lean(V(s*0.13,L.chestY,0.130)),
      lean(V(s*0.12,0.72,0.145)), lean(V(s*0.07,0.72,0.150)), P.shawlDk, 0.03);
  }

  /* a simple cord belt */
  { const b1=ring(V(0,0.71,0), V(0,1,0), 0.156,0.120, 8, Math.PI/8).map(lean);
    const b2=ring(V(0,0.735,0), V(0,1,0), 0.153,0.117, 8, Math.PI/8).map(lean);
    stitch([b1,b2], ()=>P.robeDk); }

  /* head (skin loft; nose ridge; painted eyes) — DROPPED forward, deeply aged */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.078, rz:0.084, hex:P.skin},
      {y:L.cheekY, rx:0.104, rz:0.100, hex:P.skin},
      {y:L.browY,  rx:0.108, rz:0.100, hex:P.skin},
      {y:L.crownY, rx:0.084, rz:0.077, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph).map(lean));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    capFan(rings[3], lean(V(0, L.headTopY, 0.007)), P.skinDk);
    /* the LONG WHITE BEARD — the elder tell — a narrow tapering panel hanging from the CHIN (starts
       below the jaw, not at it, so it never overhangs the face), tucking toward the chest (z shrinks
       as it descends) so it drapes flat rather than bulging forward over the face plane. */
    const bb=[
      {y:L.jawY-0.055, w:0.032, z:0.108}, {y:0.99, w:0.056, z:0.100}, {y:0.925, w:0.052, z:0.086},
      {y:0.855, w:0.038, z:0.066}, {y:0.79, w:0.016, z:0.052},
    ];
    for(let i=0;i<bb.length-1;i++){
      const a=bb[i], b=bb[i+1];
      quad(lean(V(-a.w,a.y,a.z)), lean(V(a.w,a.y,a.z)), lean(V(b.w,b.y,b.z)), lean(V(-b.w,b.y,b.z)), i<2?P.hair:P.hairDk, 0.05);
      quad(lean(V(-a.w,a.y,a.z-0.012)), lean(V(a.w,a.y,a.z-0.012)), lean(V(b.w,b.y,b.z-0.012)), lean(V(-b.w,b.y,b.z-0.012)), P.hairDk, 0.05);
    }
    /* white hair: a ring of long hair round the sides/back, bald-ish thin crown (a fringe of white) */
    const hairBands=[
      {y:L.browY, rx:0.114, rz:0.105, hex:P.hair},
      {y:L.crownY+0.005, rx:0.088, rz:0.080, hex:P.hairDk},   // shaded crown (not a uniform pale dome)
      {y:L.headTopY+0.006, rx:0.048, rz:0.044, hex:P.hairDk},
    ];
    const hairRings=hairBands.map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph).map(lean));
    stitch(hairRings, b=>hairBands[b].hex, {0:[1,2]});   // fringe recedes off the brow-front
    capFan(hairRings.at(-1), lean(V(0,L.headTopY+0.035,0)), P.hairDk);
    /* long white eyebrows/moustache hint across the upper lip */
    quad(lean(V(-0.050,L.jawY+0.048,0.108)), lean(V(0.050,L.jawY+0.048,0.108)),
         lean(V(0.044,L.jawY+0.066,0.114)), lean(V(-0.044,L.jawY+0.066,0.114)), P.hairDk, 0.05);
  }

  /* arms — BOTH forward onto the staff (top + lower grip): the two-handed lean-on-staff read.
     Thin aged forearms in wide robe sleeves. */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02), EL=lean(V(0.255,0.86,0.14));
    tube(lean(S),EL,0.066,0.050,6,P.robe);
    tube(EL,GRIP_HI,0.050,0.040,6,P.robe,{capB:{hex:P.skin}});
    tube(GRIP_HI.clone().add(V(-0.03,0.03,-0.02)), GRIP_HI.clone().add(V(0.03,-0.03,0.02)), 0.042,0.038,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02), EL2=lean(V(-0.16,0.83,0.16));
    tube(lean(S2),EL2,0.066,0.050,6,P.robe);
    tube(EL2,GRIP_LO,0.050,0.040,6,P.robe,{capB:{hex:P.skin}});
    tube(GRIP_LO.clone().add(V(-0.03,0.03,-0.02)), GRIP_LO.clone().add(V(0.03,-0.03,0.02)), 0.042,0.038,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* legs — feet close, settled (weight partly on the staff); sandalled */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.02), kneeL=V(-0.10,0.34,0.06), ankL=V(-0.09,0.07,0.05);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.01), kneeR=V( 0.105,0.34,0.03), ankR=V( 0.10,0.07,0.01);
    tube(hipL,kneeL,0.074,0.054,6,P.robeDk);
    tube(kneeL,ankL,0.050,0.038,6,P.robeDk);
    tube(hipR,kneeR,0.074,0.054,6,P.robeDk);
    tube(kneeR,ankR,0.050,0.038,6,P.robeDk);
    for(const [ank,toeDir] of [[ankL,V(0.04,0,1)], [ankR,V(-0.04,0,1)]]){
      stack([
        {y:0.010, rx:0.054, rz:0.064, cx:ank.x, cz:ank.z, hex:P.sandalDk},
        {y:0.045, rx:0.048, rz:0.052, cx:ank.x, cz:ank.z, hex:P.skin},
      ], 6, {capTop:{hex:P.skin, lift:0.004}});
      const toeA=V(ank.x,0.038,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.10), 0.046,0.034,6,P.skin, {capB:{hex:P.skinDk, lift:0.01}, raz:0.038, rbz:0.026});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
