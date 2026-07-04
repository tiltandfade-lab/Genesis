/* dev/model-qa/creatures/ranger-alt1.js — the F2 ranger (bow held at rest), KEPT as an alt (Alt
   policy, F3 2026-07-04). F2 rebuilt the ranger's bow into a proper C-arc + straight string chord;
   that F2 figure held the bow VERTICAL at rest in front of the body (no draw). When F3 re-posed the
   ranger into a full-draw aiming stance (new PRIMARY in ranger.js — bladed side-on, bow arm extended,
   string drawn to an anchor at the jaw), this F2 upright-hold state is preserved verbatim as
   `ranger-alt1` so both render on the alts sheet. Identical geometry to the pre-F3 ranger.js (which
   already carried the F2 bow); only the export name differs.

   The LONGBOW (F2 C-arc stave + straight string chord + nocked arrow) is authored first; the bow-hand
   and string-hand fists derive from it. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildRangerAlt1(){
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

  /* LONGBOW REBUILD (F2, 2026-07-04 — reference: strung English longbow = ONE smooth C-arc bending
     toward the string, straight-limb warbow, string a STRAIGHT chord tip-to-tip; see pose-refs.md §1).
     The OLD bow was two tube segments meeting at a mid-point → it read as an angular `>` chevron with
     a hard kink at the grip. This rebuild authors the stave as a CONTINUOUS multi-segment arc through
     a quadratic curve: tips near the string chord, the belly bowing AWAY from the string (toward the
     target, +z) so the profile is a single C. The string is one STRAIGHT chord from top nock to bottom
     nock. The nocked arrow is drawn to a half-draw point ON that chord (the string-hand grips the
     string there), so the string stays a clean straight line and only the arrow shows the draw.

     Local authoring frame: build the arc in the plane x=const (a vertical bow held at the ranger's
     right), height y from BOT to TOP, belly displacement in +z. Then the whole assembly is yawed
     ~26° about the grip and pushed forward so at the game's ~45° camera the C reads (not edge-on)
     and the string clears the hood — the same clearance the old director fix needed, kept. */
  const BOW_YAW = 26 * Math.PI/180;
  const BOW_PIVOT = V(0.345, 0.945, 0.485);         /* the grip = the yaw pivot, so the fist doesn't drag */
  const BOW_FWD = 0.075;                             /* pushed further forward so the bow sits clearly in FRONT of the torso (no silhouette overlap) */
  function bowXform(p){
    const rel = p.clone().sub(BOW_PIVOT);
    const cs = Math.cos(BOW_YAW), sn = Math.sin(BOW_YAW);
    const rx = rel.x*cs + rel.z*sn, rz = -rel.x*sn + rel.z*cs;
    return V(BOW_PIVOT.x + rx, p.y, BOW_PIVOT.z + rz + BOW_FWD);
  }
  /* --- the arc, pre-yaw. Tips (t=0 bottom, t=1 top) sit on the STRING chord plane (zChord); the
     belly bulges to zBelly at mid-height. A quadratic 4*t*(1-t) profile = a smooth symmetric C with
     NO kink anywhere along the stave. The tips also tuck slightly inward in x (recurve-ish nock). --- */
  const ARC_X = 0.345, Y_BOT = 0.30, Y_TOP = 1.62;
  const Z_CHORD = 0.435;                             /* the string plane (tips + string live here) */
  const Z_BELLY = 0.610;                             /* deepest belly, bows toward the target (+z) — a PRONOUNCED C */
  function arcPt(t){                                 /* t: 0=bottom tip .. 1=top tip */
    const y = Y_BOT + (Y_TOP - Y_BOT)*t;
    const bulge = 4*t*(1-t);                          /* 0 at tips, 1 at mid */
    const z = Z_CHORD + (Z_BELLY - Z_CHORD)*bulge;
    const x = ARC_X + 0.03*bulge;                     /* belly leans out in x a touch, tips tuck in */
    return bowXform(V(x, y, z));
  }
  const SEG = 6;                                      /* 6 tube segments = smooth C at this poly budget */
  const arc = []; for(let i=0;i<=SEG;i++) arc.push(arcPt(i/SEG));
  const BOW_BOT = arc[0], BOW_TOP = arc[SEG];
  const GRIP = arcPt(0.5);                            /* grip rides the belly of the arc (deepest point) */
  /* NOCKED-READY pose (Haiku-review fix, 2026-07-04): the string is a STRAIGHT chord and the arrow is
     SEATED ON that chord at its midpoint, pointing forward through/over the grip toward the target.
     The string-hand rests AT the nocking point (on the string) — a light nock-and-hold, not a full
     draw — so nothing floats and both hands connect (bow-hand on the grip, string-hand on the string).
     This keeps the spec's "single C-arc + straight string chord" and removes the broken half-draw. */
  const NOCK = BOW_BOT.clone().lerp(BOW_TOP, 0.47);  /* the nocking point: ON the straight chord, ~centre */
  {
    /* STAVE — one continuous C: consecutive tube segments sharing endpoints (no gap, no kink). The
       limbs taper from a thick grip to thin tips (bottom→grip→top), the warbow read. */
    for(let i=0;i<SEG;i++){
      const a = arc[i], b = arc[i+1];
      /* radius peaks at the grip (i≈SEG/2) and tapers to the tips */
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
    /* STRING — one STRAIGHT chord, top nock to bottom nock. The braced string, a straight taut line
       (thickened a touch so it reads clearly as a chord at 1/3-res). */
    tube(BOW_TOP, BOW_BOT, 0.009, 0.009, 5, P.string);
    /* ARROW — seated ON the string at NOCK, running LEVEL and forward over the grip toward the target.
       DIR is taken in the horizontal plane at the NOCK height (its own y), so the shaft crosses the
       grip at exactly the string's nocking height — the tail unambiguously meets the vertical string
       line (the Haiku-review seat fix). Head projects well past the grip; a bright nock collar sits
       right where the tail meets the string. */
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
