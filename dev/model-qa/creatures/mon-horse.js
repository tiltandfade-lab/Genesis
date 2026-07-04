/* dev/model-qa/creatures/mon-horse.js — the HORSE (bespoke Large QUADRUPED) + the WARHORSE SKELETON
   (a SKELETAL-HORSE variant reusing the same silhouette). Adam's QA-review ruling 2026-07-04: the
   roster had no horse; build one, then a skeletal-horse variant — and Adam CONFIRMED warhorse-skeleton
   = a skeletal HORSE, not a mounted skeleton (fixing the NEAREST_SUB alias that sent it to the humanoid
   skeleton).

   Both are ONE shared builder `horseFigure(mode)` with mode 'flesh' | 'bone', so the skeleton is the
   SAME horse silhouette (spine loft, high withers, arched neck, long head, four haunched legs, tail)
   rendered as bone: a thinned rib-banded barrel, a long bone skull, thin ivory leg-bones with knobbed
   joints, and a bare bony tail-string. NO eye quads on either (house eye ruling reversed 2026-07-04;
   the skull keeps hollow eye SOCKETS as anatomical structure, consistent with mon-skeleton.js).
   Whole-object grammar: one function, one geometry frame, no anchors. Large: ~2.4u nose-to-tail,
   shoulder ~1.5u, base disc r=0.55. Imported by the probes + the proof sheet. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

function horseFigure(mode){
  const bone = (mode === 'bone');
  /* ---------- PALETTE ---------- */
  const P = bone ? {
    coat:0xccc2a6, coatDk:0xa89d80, mane:0xa89d80, maneDk:0x8a8068, belly:0xd8cfb4,
    muzzle:0xa89d80, hoof:0x2c2620, hoofDk:0x1c1712, nose:0x241f1a,
    hollow:0x14100c, socket:0x0d0a07, boneLt:0xd8cfb4,
    disc:0x3f362d, discTop:0x4c4238,
  } : {
    coat:0x6a533a, coatDk:0x4a3a28, mane:0x2e2418, maneDk:0x1e1710, belly:0x8a7458,
    muzzle:0x4a3a28, hoof:0x2c2620, hoofDk:0x1c1712, nose:0x241f1a,
    hollow:0x14100c, socket:0x0d0a07, boneLt:0xd8cfb4,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — spine along +z; withers ~1.15u, croup slightly lower; ~1.5u long barrel. */
  const wY = 1.15;                              // withers height
  const S = {
    croup:  V(0, wY-0.02, -0.58),              // rump / croup
    back:   V(0, wY-0.01, -0.30),
    withers:V(0, wY+0.06, -0.02),              // high withers
    chest:  V(0, wY+0.00,  0.22),              // shoulder/chest
    neckB:  V(0, wY+0.06,  0.40),              // neck root (arches up)
    neckM:  V(0, wY+0.22,  0.56),              // arched neck mid
    poll:   V(0, wY+0.30,  0.70),              // top of neck / poll
    headB:  V(0, wY+0.24,  0.80),              // head base (angles forward-down)
  };

  /* ---------- BODY BARREL — one horizontal loft. For bone mode it's thinner (a rib cage), and rib
     band lines are drawn over it. ---------- */
  const bodyR = bone ? 0.86 : 1.0;
  tube(S.croup,  S.back,    0.235*bodyR, 0.255*bodyR, 9, P.coat,   {phase:Math.PI/9, capA:{hex:P.coatDk, lift:0.02}});
  tube(S.back,   S.withers, 0.255*bodyR, 0.270*bodyR, 9, P.coat,   {phase:Math.PI/9});
  tube(S.withers,S.chest,   0.270*bodyR, 0.240*bodyR, 9, P.coat,   {phase:Math.PI/9});
  tube(S.chest,  S.neckB,   0.240*bodyR, 0.150*bodyR, 9, P.coat,   {phase:Math.PI/9});
  /* arched neck */
  tube(S.neckB,  S.neckM,   0.150*bodyR, 0.128*bodyR, 9, P.coat,   {phase:Math.PI/9});
  tube(S.neckM,  S.poll,    0.128*bodyR, 0.100*bodyR, 9, P.coatDk, {phase:Math.PI/9});
  if(!bone){
    /* pale belly + a mane crest down the neck (flesh only) */
    quad(V(-0.16,wY-0.24,-0.42), V(0.16,wY-0.24,-0.42), V(0.14,wY-0.24,0.18), V(-0.14,wY-0.24,0.18), P.belly, 0.05);
    // mane — a dark crest of quads down the back of the neck (neckB -> poll)
    const mane=[[S.neckB,0.16],[S.neckM,0.20],[S.poll,0.16]];
    for(let i=0;i<mane.length-1;i++){
      const [a,ha]=mane[i], [b,hb]=mane[i+1];
      const az=a.clone().add(V(0,ha,-0.02)), bz=b.clone().add(V(0,hb,-0.02));
      quad(a.clone().add(V(-0.02,0,-0.05)), a.clone().add(V(0.02,0,-0.05)), bz.clone().add(V(0.02,0,0)), bz.clone().add(V(-0.02,0,0)), P.mane, 0.05);
      quad(a.clone().add(V(0,0,-0.05)), az, bz, b.clone().add(V(0,0,-0.05)), P.maneDk, 0.05);
    }
  } else {
    /* RIB BANDS — pale rib hoops over a thinned barrel (croup->chest), so the bone-horse reads as
       a rib cage, not a smooth tube. A few flat rings hugging the barrel. */
    const ribZ=[-0.42,-0.24,-0.06,0.12];
    for(const rz of ribZ){
      const outer=ring(V(0,wY-0.02,rz), V(0,0,1), 0.235, 0.245, 9, Math.PI/9);
      const outer2=ring(V(0,wY-0.02,rz+0.05), V(0,0,1), 0.225, 0.235, 9, Math.PI/9);
      // pull the belly (bottom) verts up a touch so ribs are open at the belly
      stitch([outer,outer2], ()=>P.coat);
    }
    // exposed spine knobs along the top
    for(const z of [-0.5,-0.3,-0.1,0.1,0.28]) blob(0, wY+0.24, z, 0.030,0.024,0.030, P.coatDk, 6, 3);
  }

  /* ---------- HEAD — a long horse skull tapering to a muzzle. Ears atop. Bone mode: eye sockets. --- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:wY+0.20, cz:0.86, rx:0.088, rz:0.100, hex:P.coatDk},   // jaw
      {y:wY+0.27, cz:0.84, rx:0.100, rz:0.116, hex:P.coat},     // cheek
      {y:wY+0.33, cz:0.80, rx:0.092, rz:0.104, hex:P.coatDk},   // forehead
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, wY+0.37, 0.78), P.coatDk);
    /* long MUZZLE projecting forward-down (+z, -y) to the nose */
    const mB=V(0, wY+0.17, 0.90), mM=V(0, wY+0.09, 1.02), mT=V(0, wY+0.03, 1.10);
    tube(mB, mM, 0.086, 0.070, n, P.muzzle, {raz:0.076, rbz:0.058, phase:ph});
    tube(mM, mT, 0.070, 0.048, n, P.muzzle, {raz:0.058, rbz:0.040, phase:ph, capB:{hex:P.nose, lift:0.008}});
    /* two nostril pits */
    for(const s of [-1,1]) quad(V(s*0.024-0.008,wY+0.05,1.08), V(s*0.024+0.008,wY+0.05,1.08),
                                V(s*0.024+0.006,wY+0.07,1.06), V(s*0.024-0.006,wY+0.07,1.06), P.nose, 0.0);
    /* two upright EARS on the poll */
    for(const s of [-1,1]){
      const eb=V(s*0.060, wY+0.36, 0.74), et=V(s*0.078, wY+0.50, 0.70);
      tube(eb, et, 0.030, 0.006, 5, bone?P.coatDk:P.coat, {raz:0.020, rbz:0.004, capB:{hex:bone?P.coatDk:P.maneDk, lift:0.006}});
    }
    if(bone){
      /* hollow EYE SOCKETS — recessed dark boxes on the skull (anatomical, not painted eyes) */
      const ey=wY+0.29, ez=0.104;
      for(const s of [-1,1]){
        const ex=s*0.078;
        quad(V(ex-0.036,ey+0.030,0.80), V(ex+0.036,ey+0.030,0.80),
             V(ex+0.028,ey-0.032,0.80), V(ex-0.028,ey-0.032,0.80), P.socket, 0.02);
        quad(V(ex-0.024,ey+0.020,0.76), V(ex+0.024,ey+0.020,0.76),
             V(ex+0.020,ey-0.022,0.76), V(ex-0.020,ey-0.022,0.76), P.hollow, 0.0);
      }
      // a bare teeth band on the muzzle
      tube(V(-0.040,wY+0.045,1.02), V(0.040,wY+0.045,1.02), 0.014,0.012,4,P.boneLt);
    }
  }

  /* ---------- LEGS — 4 long legs. Flesh: haunched with hooves. Bone: thin knobbed leg-bones. ------ */
  {
    const knob=(p,r)=>blob(p.x,p.y,p.z, r,r*0.85,r, P.boneLt, 6, 4);
    const leg=(hipX, hipZ, footX, footZ, rear)=>{
      const hip=V(hipX, wY-0.10, hipZ);
      const knee=V(hipX*1.02, 0.58, hipZ + (rear?0.05:-0.02));
      const fet=V(footX, 0.20, footZ);                 // fetlock
      const hoof=V(footX, 0.05, footZ+0.02);
      if(bone){
        knob(hip,0.055); tube(hip,knee,0.044,0.034,6,P.coat); knob(knee,0.044);
        tube(knee,fet,0.032,0.024,6,P.coat); knob(fet,0.032);
        tube(fet,hoof,0.030,0.028,6,P.coatDk,{capB:{hex:P.hoofDk, lift:0.006}});
      } else {
        // haunched upper (thicker for rear), slim cannon, hoof
        const upR=rear?0.130:0.108;
        tube(hip,knee,upR,0.070,7,P.coat);
        tube(knee,fet,0.052,0.040,6,P.coatDk);
        tube(fet,hoof,0.046,0.052,6,P.hoof,{capB:{hex:P.hoofDk, lift:0.006}});
      }
    };
    // front pair (under chest z~0.20) + rear pair (under croup z~-0.52)
    leg(-0.165, 0.20, -0.175, 0.24, false);
    leg( 0.165, 0.20,  0.175, 0.20, false);
    leg(-0.180, -0.52, -0.195, -0.46, true);
    leg( 0.180, -0.52,  0.195, -0.50, true);
  }

  /* ---------- TAIL — flesh: a thick hair sweep. Bone: a bare bony tail-string of vertebra knobs. ---- */
  {
    const t0=V(0.02, wY-0.06, -0.62);
    const t1=V(0.05, wY-0.28, -0.74);
    const t2=V(0.08, 0.55,    -0.84);
    const t3=V(0.10, 0.28,    -0.88);
    const tip=V(0.11, 0.10,   -0.86);
    if(bone){
      const knob=(p,r)=>blob(p.x,p.y,p.z, r,r*0.85,r, P.boneLt, 6, 3);
      const segs=[t0,t1,t2,t3,tip];
      for(let i=0;i<segs.length-1;i++) tube(segs[i],segs[i+1],0.026-i*0.004,0.022-i*0.004,5,P.coatDk);
      for(const p of segs) knob(p,0.024);
    } else {
      tube(t0,t1,0.075,0.088,8,P.mane,{phase:Math.PI/8, capA:{hex:P.maneDk}});
      tube(t1,t2,0.088,0.078,8,P.mane,{phase:Math.PI/8});
      tube(t2,t3,0.078,0.052,8,P.maneDk,{phase:Math.PI/8});
      tube(t3,tip,0.052,0.020,8,P.maneDk,{phase:Math.PI/8, capB:{hex:P.maneDk, lift:0.008}});
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}

export function buildHorse(){ horseFigure('flesh'); }
export function buildWarhorseSkeleton(){ horseFigure('bone'); }
