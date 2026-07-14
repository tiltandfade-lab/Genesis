/* dev/model-qa/creatures/ranger.js — the bow-hunter landmark table (whole-object probe).
   PRIMARY = the D-BOW AT REST (director ruling 2026-07-04): Adam ruled the bow must read as a "D" —
   a CURVED stave with the STRING a straight VERTICAL chord connecting EXACTLY to the two stave tips
   (the nocks), arrow nocked-ready. This at-rest hold (formerly the F2/ranger-alt1 geometry) is now
   the PRIMARY ranger; the F3 full-draw aiming pose becomes the alt (ranger-alt1.js). The string's
   endpoint vertices are made EXACTLY coincident with the stave-tip vertices (BOW_TOP / BOW_BOT) — the
   connection was the complaint. Eyes REMOVED (Adam 2026-07-04: "the eyes are in the wrong place").

   Same whole-object grammar as humanoid.js/mage.js: the ENTIRE creature is one function of shared
   primitives, every vertex in one model frame, no anchors. The LONGBOW is authored first. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildRanger(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    leather:0x5a4530, leatherDk:0x3f3020, leatherLt:0x6e5640,   /* tanned hunter's leathers */
    cloak:0x3f4a34, cloakDk:0x2c3524,                            /* half-cloak, mossy green */
    skin:0xc49a72, skinDk:0x8a6a4e,
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

  /* head (skin loft; nose pushed). Eyes REMOVED per the 2026-07-04 eye ruling. */
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
    /* EYES — REMOVED (Adam 2026-07-04: "across the board the eyes are in the wrong place, get rid of
       them"). The ranger reads by the hood + nocked bow; no painted eye quads. */
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

  /* LONGBOW — the "D": a CONTINUOUS C-arc stave with the STRING a STRAIGHT VERTICAL chord connecting
     EXACTLY to the two stave tips (nocks), arrow nocked-ready (director ruling 2026-07-04). The stave
     is authored as a quadratic arc (tips on the chord plane zChord, belly bowing to zBelly toward the
     target), yawed ~26° about the grip + pushed forward so the D reads at the ~45° game camera and the
     string clears the hood. */
  /* BOW_YAW raised 26°→52° (director D-read fix 2026-07-04): at 26° the bow presented nearly edge-on
     to the ~45° game camera and read as a thin vertical stick, not a D. Swinging the arc plane to 52°
     turns the C-arc belly toward the camera so the D (curved stave + straight tip-to-tip string) reads
     at the game angle. */
  const BOW_YAW = 52 * Math.PI/180;
  const BOW_PIVOT = V(0.345, 0.945, 0.485);         /* the grip = the yaw pivot, so the fist doesn't drag */
  const BOW_FWD = 0.075;                             /* pushed forward so the bow sits clearly in FRONT of the torso */
  function bowXform(p){
    const rel = p.clone().sub(BOW_PIVOT);
    const cs = Math.cos(BOW_YAW), sn = Math.sin(BOW_YAW);
    const rx = rel.x*cs + rel.z*sn, rz = -rel.x*sn + rel.z*cs;
    return V(BOW_PIVOT.x + rx, p.y, BOW_PIVOT.z + rz + BOW_FWD);
  }
  const ARC_X = 0.345, Y_BOT = 0.30, Y_TOP = 1.62;
  const Z_CHORD = 0.435;                             /* the string plane (both tips + the string live here) */
  const Z_BELLY = 0.700;                             /* deepest belly — deepened (was 0.610) so the C-curve reads even foreshortened at the game camera */
  function arcPt(t){                                 /* t: 0=bottom tip .. 1=top tip */
    const y = Y_BOT + (Y_TOP - Y_BOT)*t;
    const bulge = 4*t*(1-t);                          /* 0 at tips, 1 at mid */
    const z = Z_CHORD + (Z_BELLY - Z_CHORD)*bulge;
    const x = ARC_X + 0.03*bulge;                     /* belly leans out in x a touch, tips tuck in */
    return bowXform(V(x, y, z));
  }
  const SEG = 6;                                      /* 6 tube segments = smooth C at this poly budget */
  const arc = []; for(let i=0;i<=SEG;i++) arc.push(arcPt(i/SEG));
  const BOW_BOT = arc[0], BOW_TOP = arc[SEG];         /* the two stave TIPS = the two string nocks */
  const GRIP = arcPt(0.5);                            /* grip rides the belly of the arc (deepest point) */
  /* NOCKED-READY: the string is a STRAIGHT chord tip-to-tip and the arrow is SEATED ON that chord at
     its midpoint, pointing forward through/over the grip toward the target. The string-hand rests AT
     the nocking point (on the string) — a light nock-and-hold, not a full draw. */
  const NOCK = BOW_BOT.clone().lerp(BOW_TOP, 0.47);  /* the nocking point: ON the straight chord, ~centre */
  {
    /* STAVE — one continuous C: consecutive tube segments sharing endpoints (no gap, no kink). The
       limbs taper from a thick grip to thin tips (bottom→grip→top), the warbow read. */
    for(let i=0;i<SEG;i++){
      const a = arc[i], b = arc[i+1];
      const tA = i/SEG, tB = (i+1)/SEG;
      const rA = 0.014 + 0.016*(4*tA*(1-tA));
      const rB = 0.014 + 0.016*(4*tB*(1-tB));
      const capO = {};
      if(i===0) capO.capA = {hex:P.woodDk};
      if(i===SEG-1) capO.capB = {hex:P.woodDk};
      tube(a, b, rA, rB, 7, i%2? P.woodDk : P.wood, capO);
    }
    /* handle riser wrap at the grip (thicker leather-wrapped section over the belly of the arc) */
    tube(arcPt(0.42), arcPt(0.58), 0.034, 0.034, 8, P.leatherDk);
    /* STRING — one STRAIGHT chord, EXACTLY tip-to-tip: its two endpoint vertices ARE the stave-tip
       vertices BOW_TOP and BOW_BOT (the coincidence Adam flagged). A straight taut vertical line, kept
       THIN (thinner than the stave) so the string and the curved stave read as two separate things. */
    tube(BOW_TOP, BOW_BOT, 0.008, 0.008, 5, P.string);
    /* ARROW — seated ON the string at NOCK, running LEVEL and forward over the grip toward the target.
       DIR is horizontal at the NOCK height, so the shaft crosses the grip at exactly the string's
       nocking height; the tail unambiguously meets the vertical string line. */
    const AIM = V(GRIP.x, NOCK.y, GRIP.z);                             // level with the nock, out at the grip
    const DIR = new THREE.Vector3().subVectors(AIM, NOCK).normalize(); // horizontal: string → grip → target
    const ARROW_TAIL = NOCK.clone().addScaledVector(DIR, -0.010);      // fletch end seated ON the string
    const ARROW_HEAD_TIP = NOCK.clone().addScaledVector(DIR, 0.66);    // head well past the grip
    /* nock collar — a small bright bead straddling the string exactly where the arrow tail seats */
    tube(NOCK.clone().addScaledVector(DIR,-0.020), NOCK.clone().addScaledVector(DIR,0.020), 0.018,0.015,6,P.string);
    tube(ARROW_TAIL, ARROW_HEAD_TIP.clone().addScaledVector(DIR,-0.045), 0.010,0.010,6,P.shaft);
    tube(ARROW_HEAD_TIP.clone().addScaledVector(DIR,-0.045), ARROW_HEAD_TIP, 0.012,0.002,6,P.arrowhead,{capB:{hex:P.arrowhead}});
    /* 3 fletching vanes flaring from the tail (right at the string) */
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

  /* LEGS — braced hunter's stance, HIGH BOOTS rising well above the ankle. */
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
