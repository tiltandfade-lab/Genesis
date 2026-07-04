/* dev/model-qa/creatures/ranger.js — the bow-hunter landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js/mage.js/cleric_fable.js/monk.js: the ENTIRE creature is
   one function of shared primitives, every vertex in one model frame, no anchors. The LONGBOW is
   authored first — a curved stave through 3 points, a thin string tube, a nocked arrow — so the
   bow-hand fist derives onto the grip and the string-hand derives to the draw point near the cheek.
   Silhouette-first: a big body-height bow at half-draw (the read), a quiver of fletched arrows
   angled over the shoulder, a hooded half-cloak (shorter than the rogue's full hood, face left
   open), leathers + high boots. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildRanger(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    leather:0x5a4530, leatherDk:0x3f3020, leatherLt:0x6e5640,   /* tanned hunter's leathers */
    cloak:0x3f4a34, cloakDk:0x2c3524,                            /* half-cloak, mossy green */
    skin:0xc49a72, skinDk:0x8a6a4e, eye:0x1a1512,
    trouser:0x463c2c, boot:0x2e2418, bootDk:0x211a11,
    wood:0x6b4f2e, woodDk:0x4a3620, string:0xd8cdb0,
    fletch:0xc9c2a8, fletchDk:0x8f8870, shaft:0x8a6a42, arrowhead:0x8d949a,
    strap:0x2a2119, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (rangy frame, ~4.6 heads) ---------- */
  const L = {
    hipY:0.71, waistY:0.79, ribY:0.90, chestY:1.01, shldY:1.09, neckY:1.13,
    hipHalf:0.11, shoulderX:0.235,
    jawY:1.16, cheekY:1.235, browY:1.31, crownY:1.405, headTopY:1.47,
  };

  /* torso (leathers loft, hips->neck) */
  stack([
    {y:L.hipY,   rx:0.170, rz:0.130, hex:P.leatherDk},
    {y:L.waistY, rx:0.155, rz:0.118, hex:P.leather},
    {y:L.ribY,   rx:0.185, rz:0.138, hex:P.leather},
    {y:L.chestY, rx:0.205, rz:0.150, hex:P.leatherLt},
    {y:L.shldY,  rx:0.210, rz:0.140, hex:P.leather},
    {y:L.neckY,  rx:0.078, rz:0.074, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* belt + buckle */
  stack([
    {y:L.waistY-0.015, rx:0.168, rz:0.128, hex:P.leatherDk},
    {y:L.waistY+0.025, rx:0.165, rz:0.126, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.03,L.waistY-0.008,0.135), V(0.03,L.waistY-0.008,0.135), V(0.03,L.waistY+0.035,0.132), V(-0.03,L.waistY+0.035,0.132), P.brass, 0.02);

  /* hip skirt (short leather tassets over the trousers) */
  stack([
    {y:0.52, rx:0.195, rz:0.155, hex:P.leatherDk},
    {y:0.66, rx:0.178, rz:0.140, hex:P.leather},
  ], 8, {});

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts of this ring are 1 & 2. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.079, rz:0.085, hex:P.skin},
      {y:L.cheekY, rx:0.108, rz:0.104, hex:P.skin},
      {y:L.browY,  rx:0.112, rz:0.102, hex:P.skin},
      {y:L.crownY, rx:0.087, rz:0.079, hex:P.skinDk},
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
    /* eyes — two SMALL intentional quads flanking the nose ridge, proud of the pushed face plane
       (Adam 2026-07-03 house standard: "smaller and more intentional, not shaded eye polys").
       z computed from THIS head's own bands: base 0.010 + avg(cheekRz,browRz)=0.103 + nose-push
       0.020 = 0.133 pushed-plane depth, +0.004 proud = 0.137. */
    for(const s of [-1,1]){
      const ex=s*0.052, ey=(L.cheekY+L.browY)/2-0.004, ez=0.137;
      quad(V(ex-0.013,ey-0.0105,ez), V(ex+0.013,ey-0.0105,ez),
           V(ex+0.013,ey+0.0105,ez-0.006), V(ex-0.013,ey+0.0105,ez-0.006), P.eye, 0.0);
    }
  }

  /* HOODED HALF-CLOAK — shorter than the rogue's full hood; face window left MORE open (only
     the crown band skips, brow stays clear) so the face reads under the shadow rather than vanishing */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.100, rz:0.096, hex:P.cloakDk},
      {y:L.jawY+0.02,   rx:0.128, rz:0.118, hex:P.cloak},
      {y:L.browY+0.02,  rx:0.132, rz:0.118, hex:P.cloak},
      {y:L.crownY+0.015,rx:0.100, rz:0.094, hex:P.cloak},
    ];
    /* face window only over the lower two bands (jaw->brow) — brow stays open, less enclosing than rogue */
    const skip={1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.012);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.03, -0.02), P.cloak);
    const inner=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx-0.016, b.rz-0.016, n, ph));
    inner[3].forEach(p=>p.z-=0.012);
    for(const edge of [0,3]) quad(rings[1][edge], inner[1][edge], inner[2][edge], rings[2][edge], P.cloakDk, 0.03);

    /* the SHORT half-cape — a shoulder mantle draping to mid-back, not a full-length cloak */
    stack([
      {y:L.shldY+0.03, rx:0.275, rz:0.200, cz:-0.03, hex:P.cloakDk},
      {y:L.shldY-0.06, rx:0.250, rz:0.185, cz:-0.05, hex:P.cloak},
      {y:0.86,         rx:0.200, rz:0.155, cz:-0.06, hex:P.cloak},
      {y:0.70,         rx:0.150, rz:0.120, cz:-0.05, hex:P.cloakDk},
    ], 8, {});
  }

  /* LONGBOW FIRST — big, body-height, curved stave through 3 points; half-draw string; nocked arrow.
     Held out well FORWARD of the torso (+z) and canted so the limbs read as an outward bow-curve
     rather than a vertical pole skewering the body. Bow-hand (left, forward) fist derives onto
     GRIP; string-hand (right) derives to the draw point near the cheek.
     DIRECTOR FIX (2026-07-03, dimetric-angle pass): at the game's ~45deg yaw the string was
     crossing the face/hood silhouette and the bow plane read too flat-on to the camera. The whole
     bow assembly (stave, string, arrow — everything hung off GRIP/NOCK) is yawed ~25deg around a
     vertical pivot near the grip and pushed forward (+z) so the string clears the head at that
     angle while staying readable as an outward bow-curve. Shoulders/elbows stay anchored to the
     body; only the bow-side points rotate, so the forearms simply reach further to the new GRIP/NOCK. */
  const BOW_YAW = 28 * Math.PI/180;                /* swings TOP/BOT further +x (toward profile, away from centerline) */
  const BOW_PIVOT = V(0.345, 0.945, 0.485);         /* = GRIP itself, so the grip/fist doesn't drag */
  const BOW_FWD = 0.035;                            /* small extra +z on top of the yaw, clears the hood edge fully */
  function bowXform(p){
    const rel = p.clone().sub(BOW_PIVOT);
    const cs = Math.cos(BOW_YAW), sn = Math.sin(BOW_YAW);
    const rx = rel.x*cs + rel.z*sn, rz = -rel.x*sn + rel.z*cs;
    return V(BOW_PIVOT.x + rx, p.y, BOW_PIVOT.z + rz + BOW_FWD);
  }
  const BOW_BOT=bowXform(V(0.145,0.31,0.46)), BOW_MID=bowXform(V(0.335,0.945,0.50)), BOW_TOP=bowXform(V(0.16,1.62,0.44));
  const GRIP=V(0.345,0.945,0.485+BOW_FWD);         /* the handle riser, near the stave midpoint (pivot, unmoved in x/y) */
  const NOCK=bowXform(V(0.42,0.885,0.10));         /* draw point near the cheek at half-draw — pulled forward (+z 0.03->0.10) so the string clears the hood */
  {
    /* stave: two tube segments through bottom->mid->top gives the recurve-ish bend read; the
       mid-point bows OUT in +z relative to the bot/top chord, giving visible limb curvature */
    tube(BOW_BOT, BOW_MID, 0.022, 0.026, 8, P.wood, {capA:{hex:P.woodDk}});
    tube(BOW_MID, BOW_TOP, 0.026, 0.020, 8, P.wood, {capB:{hex:P.woodDk}});
    /* handle riser wrap at the grip */
    tube(GRIP.clone().add(V(0,-0.05,0)), GRIP.clone().add(V(0,0.05,0)), 0.032,0.032,8,P.leatherDk);
    /* string: nocked, drawn back to NOCK (half-draw) — two thin tube segments top-> nock -> bottom */
    tube(BOW_TOP.clone().add(V(-0.01,-0.01,0.0)), NOCK, 0.006,0.006,5,P.string);
    tube(NOCK, BOW_BOT.clone().add(V(0.01,0.01,0.0)), 0.006,0.006,5,P.string);
    /* nocked arrow: shaft along draw-line through NOCK toward the bow, fletching at the nock end,
       head projecting just past the grip */
    /* draw-line leveled: use NOCK's own height for both ends so the shaft runs flat through/over
       the grip rather than angling down off the string's natural NOCK->GRIP slope (director fix). */
    const AIM=V(GRIP.x, NOCK.y, GRIP.z);
    const DIR=new THREE.Vector3().subVectors(AIM,NOCK).normalize();
    const ARROW_TAIL=NOCK.clone().addScaledVector(DIR,-0.05);
    const ARROW_HEAD_TIP=AIM.clone().addScaledVector(DIR,0.34);
    tube(ARROW_TAIL, ARROW_HEAD_TIP.clone().addScaledVector(DIR,-0.045), 0.010,0.010,6,P.shaft);
    tube(ARROW_HEAD_TIP.clone().addScaledVector(DIR,-0.045), ARROW_HEAD_TIP, 0.012,0.002,6,P.arrowhead,{capB:{hex:P.arrowhead}});
    /* 3 fletching vanes flaring from the tail */
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2;
      const up=Math.abs(DIR.y)>0.9?V(0,0,1):V(0,1,0);
      const u=new THREE.Vector3().crossVectors(up,DIR).normalize(), w=new THREE.Vector3().crossVectors(DIR,u).normalize();
      const d=u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a));
      const base=ARROW_TAIL.clone().addScaledVector(DIR,0.055);
      const tip=ARROW_TAIL.clone();
      quad(base, base.clone().addScaledVector(d,0.028), tip.clone().addScaledVector(d,0.014), tip, P.fletchDk, 0.04);
    }
  }

  /* QUIVER — angled on the back, fletchings visible over the shoulder (the read the brief calls for) */
  const QUIV_BASE=V(-0.13,0.80,-0.135), QUIV_MOUTH=V(-0.235,1.30,-0.02);
  {
    tube(QUIV_BASE, QUIV_MOUTH, 0.075, 0.088, 8, P.leatherDk, {capA:{hex:P.leatherDk}});
    /* mouth rim */
    stack([
      {y:0, rx:0.090,rz:0.090, cx:QUIV_MOUTH.x, cz:QUIV_MOUTH.z, hex:P.leather},
    ], 8, {xform:p=>p.clone().add(V(0, QUIV_MOUTH.y, 0))});
    /* straps crossing the chest/back to hold it */
    tube(V(0.14,L.shldY+0.02,0.10), QUIV_MOUTH.clone().add(V(0,0.02,0.04)), 0.018,0.016,5,P.strap);
    tube(V(0.05,L.hipY+0.02,0.06), QUIV_BASE.clone().add(V(0.03,0.02,0.02)), 0.018,0.016,5,P.strap);
    /* a fan of arrow shafts poking from the mouth, fletchings visible above the shoulder */
    const qdir=new THREE.Vector3().subVectors(QUIV_MOUTH,QUIV_BASE).normalize();
    for(let k=0;k<5;k++){
      const t=(k-2)*0.028, s=(k-2)*0.02;
      const base=QUIV_MOUTH.clone().add(V(t*1.1, 0, s*0.6));
      const tip=base.clone().addScaledVector(qdir,0.30).add(V(t*0.4,0,s*0.3));
      tube(base, tip, 0.010,0.010,5,P.shaft);
      /* small fletch flare at the top of each shaft */
      for(const side of [-1,1]){
        const u=V(1,0,0), w=V(0,0,1);
        const flareBase=tip.clone().addScaledVector(qdir,-0.06);
        quad(flareBase, flareBase.clone().add(u.clone().multiplyScalar(side*0.02)).add(V(0,0.02,0)),
             tip.clone().add(u.clone().multiplyScalar(side*0.010)), tip, P.fletch, 0.05);
      }
    }
  }

  /* ARMS — left (bow hand) fist derived to GRIP; right (string hand) fist derived to NOCK near the cheek */
  {
    const S=V(-L.shoulderX, L.shldY-0.01, 0.02);   /* left shoulder */
    const E=V(0.11,0.935,0.28);
    tube(S,E,0.075,0.060,6,P.leather);
    tube(E,GRIP,0.056,0.046,6,P.leatherLt,{capB:{hex:P.skin}});
    tube(GRIP.clone().add(V(0,-0.045,0)), GRIP.clone().add(V(0,0.045,0)), 0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(L.shoulderX, L.shldY-0.01, 0.02);   /* right shoulder, drawn back to the cheek */
    const E2=V(0.32,0.955,0.05);
    tube(S2,E2,0.075,0.060,6,P.leather);
    tube(E2,NOCK,0.056,0.046,6,P.leatherLt,{capB:{hex:P.skin}});
    const HDIR=new THREE.Vector3().subVectors(NOCK,E2).normalize();
    tube(NOCK.clone().addScaledVector(HDIR,-0.045), NOCK.clone().addScaledVector(HDIR,0.045), 0.044,0.040,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — braced hunter's stance, HIGH BOOTS rising well above the ankle.
     The ankle/ground joint (ank) sits near y≈0.085 like the other classes; the trouser leg meets
     it there, and the boot shaft then rises UP from the ankle to well past mid-shin — no gap. */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.155,0.42,0.06), shinL=V(-0.16,0.285,0.045), ankL=V(-0.165,0.085,0.03);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.18,0.42,-0.04), shinR=V(0.19,0.285,-0.06), ankR=V( 0.195,0.085,-0.075);
    tube(hipL,kneeL,0.086,0.062,6,P.trouser);
    tube(kneeL,shinL,0.058,0.054,6,P.trouser);
    tube(hipR,kneeR,0.086,0.062,6,P.trouser);
    tube(kneeR,shinR,0.058,0.054,6,P.trouser);
    for(const [shin,ank,toeDir] of [[shinL,ankL,V(0.06,0,1)], [shinR,ankR,V(0.82,0,0.32).normalize()]]){
      /* high boot shaft: ankle (ground level) rising up past the shin joint to well above it */
      tube(ank, shin.clone().add(V(0,0.10,0)), 0.062,0.054,7,P.boot, {capB:{hex:P.bootDk, lift:0.01}});
      /* boot foot: heel/sole pad sitting right at the ankle's ground contact */
      stack([
        {y:0.012, rx:0.070, rz:0.078, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.09,  rx:0.062, rz:0.066, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capBot:{hex:P.bootDk, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.14), 0.056,0.042,6,P.boot, {capB:{hex:P.bootDk, lift:0.015}, raz:0.050, rbz:0.034});
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
