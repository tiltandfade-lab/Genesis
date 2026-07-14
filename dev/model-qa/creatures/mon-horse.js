/* dev/model-qa/creatures/mon-horse.js — the WARHORSE (bespoke Large QUADRUPED-UNGULIGRADE, REBUILD
   2026-07-08, docs/MODEL-FOUNDRY.md rebuild-w3 cell 4, port 5244) + the WARHORSE SKELETON variant
   (mode 'bone', unchanged silhouette-sharing convention preserved from the prior pass). 18 instances
   + mule/pony aliases — this is the mounted world's workhorse, so it earns the loud pose: a rearing
   strike, not a paddock stand.

   FEATURE CHECKLIST (the ~1,400-1,900 budget buys):
     1. UNGULIGRADE anatomy per ANATOMY-CANON — square proportions (H~=L), deep-narrow level barrel,
        gentle hind Z-zigzag (stifle HIGH & tucked ~0.60H, hock the prominent backward bend ~0.32H,
        long near-vertical cannon below it) contrasted against a straight plumb-line front leg —
        but here BOTH front legs are cocked and airborne (the rear), so the contrast law reads as
        "planted angular hind vs. striking front" instead of the standing "straight front vs angular
        hind."
     2. SIGNATURE — the REAR: front hooves off the ground mid-strike, weight rocked back onto the
        haunches, spine arched from croup through a high-thrown neck to a raised poll. Silhouette
        must read "rearing horse" from the black shape alone (tall vertical wedge, not a horizontal
        bar).
     3. Flying MANE + TAIL — the neck crest sweeps back off the arch (motion cue), the tail flags up
        and out behind (not hanging down), both carrying the value-contrast tone.
     4. Blaze + socks — a pale face blaze down the muzzle and pale fetlock/socks on the forelegs, the
        loud high-value zone law 3 requires, sitting ON the signature (the striking front legs +
        thrown head).
     5. Long arched neck + wedge head, small upright ears, nostril flare (the "mid-strike, not
        grazing" read on the head itself).
     6. Base disc under the HIND hooves only (the rear's weight-bearing point) — the front pair
        floats clear of the disc, which is itself part of the pose read (nothing touching under the
        chest sells "airborne").

   POSE SENTENCE: reared up mid-strike, weight rocked back onto haunches with hocks driven low and
   angular, spine snapping from croup to a high-thrown arched neck, front hooves slashing the air
   above the ground, mane and tail whipped back and flagged out — the mounted world's warhorse at
   its most alive moment, never the paddock stand.

   Both flesh + bone share ONE builder `horseFigure(mode)` so the skeleton keeps the same silhouette
   intent (rib-banded barrel, long bone skull, thin knobbed leg-bones, bare bony tail-string) — the
   skeleton keeps its prior standing-square pose (a reared skeleton reads as "falling," not
   "striking," so bone mode is deliberately NOT reared; only flesh gets the new pose).
   Whole-object grammar: one function, one geometry frame, no anchors. Large: ~2.1u tall (reared),
   base disc r=0.55. Imported by the probes + the proof sheet. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

function horseFigure(mode){
  const bone = (mode === 'bone');
  const rear = !bone;                                   // only flesh gets the rear pose
  /* ---------- PALETTE ---------- */
  const P = bone ? {
    coat:0xccc2a6, coatDk:0xa89d80, mane:0xa89d80, maneDk:0x8a8068, belly:0xd8cfb4,
    muzzle:0xa89d80, hoof:0x2c2620, hoofDk:0x1c1712, nose:0x241f1a,
    hollow:0x14100c, socket:0x0d0a07, boneLt:0xd8cfb4, blaze:0xe4dcc4, sock:0xdcd2b8,
    disc:0x3f362d, discTop:0x4c4238,
  } : {
    coat:0x6a533a, coatDk:0x4a3a28, mane:0x7c6448, maneDk:0x4a3a28, belly:0x8a7458,
    muzzle:0x4a3a28, hoof:0x2c2620, hoofDk:0x1c1712, nose:0x241f1a,
    hollow:0x14100c, socket:0x0d0a07, boneLt:0xd8cfb4, blaze:0xe8dfc8, sock:0xe2d8bc,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — spine along +z; rear mode rocks the whole spine back+up onto the
     haunches (croup drops/stays low+back, withers/neck/poll driven high). Standing (bone) mode
     keeps the original square-proportion stand. */
  const wY = rear ? 1.24 : 1.15;                 // withers height (raised in the rear)
  const S = rear ? {
    croup:  V(0, 0.86, -0.42),                   // rump drops toward the planted hind
    back:   V(0, 1.00, -0.20),
    withers:V(0, wY+0.02, 0.02),
    chest:  V(0, wY+0.08, 0.20),
    neckB:  V(0, wY+0.16, 0.32),                 // neck root throws up
    neckM:  V(0, wY+0.38, 0.38),                 // arched neck mid, curving forward-up
    poll:   V(0, wY+0.60, 0.34),                 // poll thrown high, head reaching forward-up
    headB:  V(0, wY+0.56, 0.28),
  } : {
    croup:  V(0, wY-0.02, -0.58),
    back:   V(0, wY-0.01, -0.30),
    withers:V(0, wY+0.06, -0.02),
    chest:  V(0, wY+0.00,  0.22),
    neckB:  V(0, wY+0.06,  0.40),
    neckM:  V(0, wY+0.22,  0.56),
    poll:   V(0, wY+0.30,  0.70),
    headB:  V(0, wY+0.24,  0.80),
  };

  /* ---------- BODY BARREL — one vertical-tilted loft in rear mode (croup low-back -> withers
     high-forward), horizontal loft in standing/bone mode. ---------- */
  const bodyR = bone ? 0.86 : 1.0;
  tube(S.croup,  S.back,    0.235*bodyR, 0.255*bodyR, 9, P.coat,   {phase:Math.PI/9, capA:{hex:P.coatDk, lift:0.02}});
  tube(S.back,   S.withers, 0.255*bodyR, 0.270*bodyR, 9, P.coat,   {phase:Math.PI/9});
  tube(S.withers,S.chest,   0.270*bodyR, 0.240*bodyR, 9, P.coat,   {phase:Math.PI/9});
  tube(S.chest,  S.neckB,   0.240*bodyR, 0.150*bodyR, 9, P.coat,   {phase:Math.PI/9});
  /* arched neck */
  tube(S.neckB,  S.neckM,   0.150*bodyR, 0.128*bodyR, 9, P.coat,   {phase:Math.PI/9});
  tube(S.neckM,  S.poll,    0.128*bodyR, 0.100*bodyR, 9, P.coatDk, {phase:Math.PI/9});
  if(!bone){
    /* pale belly (flesh only) */
    const bellyZ = rear ? [-0.30, 0.10] : [-0.42, 0.18];
    quad(V(-0.16,S.back.y-0.20,bellyZ[0]), V(0.16,S.back.y-0.20,bellyZ[0]),
         V(0.14,S.chest.y-0.16,bellyZ[1]), V(-0.14,S.chest.y-0.16,bellyZ[1]), P.belly, 0.05);
    /* MANE — discrete windswept strands (not a flat crest): each is a 2-segment tapered tube
       rooted along the neck (neckB->poll), flaring out and whipping BACK off the arch in rear
       mode (the "flying mane" motion cue the DIRECTION brief calls for). Standing/mount mode
       keeps a gentler back-drift. Countable strands = law-1 expression, not padding. */
    const drift = rear ? -0.16 : -0.05;
    const roots=[
      {p:S.neckB, x:-0.05, len:0.20},
      {p:V(0,(S.neckB.y+S.neckM.y)/2+0.02,(S.neckB.z+S.neckM.z)/2), x:0.06, len:0.24},
      {p:S.neckM, x:-0.06, len:0.26},
      {p:V(0,(S.neckM.y+S.poll.y)/2+0.02,(S.neckM.z+S.poll.z)/2), x:0.05, len:0.22},
      {p:S.poll, x:0.0, len:0.18},
    ];
    for(const {p,x,len} of roots){
      const root = p.clone().add(V(x*0.4, 0.05, drift*0.15));
      const mid  = p.clone().add(V(x, len*0.55, drift*0.7));
      const tip  = p.clone().add(V(x*1.4, len, drift*1.4));
      tube(root, mid, 0.032, 0.020, 5, P.mane, {capA:{hex:P.maneDk}});
      tube(mid,  tip, 0.020, 0.006, 5, P.maneDk, {capB:{hex:P.maneDk, lift:0.006}});
    }
    /* small forelock tuft off the poll, falling forward between the ears */
    tube(S.poll.clone().add(V(0,0.02,0.02)), S.poll.clone().add(V(0,-0.10,0.10)), 0.020, 0.006, 4, P.mane, {capB:{hex:P.maneDk}});
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

  /* ---------- HEAD — a long horse skull tapering to a muzzle, riding at the thrown-up neck's tip
     in rear mode. Ears atop. Bone mode: eye sockets. Flesh: a pale BLAZE stripe down the face. ---- */
  {
    const n=9, ph=Math.PI/n;
    const hb=S.headB;
    const dz = rear ? 0.10 : 0.06, dy=0.0;         // head tilts slightly forward off the poll
    const bands=[
      {y:hb.y-0.06, cz:hb.z+dz*0.2, rx:0.088, rz:0.100, hex:P.coatDk},   // jaw
      {y:hb.y+0.02, cz:hb.z+dz*0.5, rx:0.100, rz:0.116, hex:P.coat},     // cheek
      {y:hb.y+0.08, cz:hb.z+dz*0.9, rx:0.092, rz:0.104, hex:P.coatDk},   // forehead
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, hb.y+0.12, hb.z+dz), P.coatDk);
    /* long MUZZLE projecting forward-down (+z, -y) to the nose */
    const mB=V(0, hb.y-0.09, hb.z+dz*1.1), mM=V(0, hb.y-0.17, hb.z+dz*1.25), mT=V(0, hb.y-0.23, hb.z+dz*1.4);
    tube(mB, mM, 0.086, 0.070, n, P.muzzle, {raz:0.076, rbz:0.058, phase:ph});
    tube(mM, mT, 0.070, 0.048, n, P.muzzle, {raz:0.058, rbz:0.040, phase:ph, capB:{hex:P.nose, lift:0.008}});
    /* two nostril pits, flared (mid-strike, not grazing) */
    for(const s of [-1,1]) quad(V(s*0.026-0.009,mT.y+0.03,mT.z-0.02), V(s*0.026+0.009,mT.y+0.03,mT.z-0.02),
                                V(s*0.026+0.007,mT.y+0.05,mT.z-0.04), V(s*0.026-0.007,mT.y+0.05,mT.z-0.04), P.nose, 0.0);
    if(!bone){
      /* pale BLAZE — a bright stripe running down the forehead+muzzle centerline, high-value zone
         sitting right on the thrown-up head (law 3: signature must carry the light). */
      quad(V(-0.014,hb.y+0.10,hb.z+dz*0.6), V(0.014,hb.y+0.10,hb.z+dz*0.6),
           V(0.012,mM.y+0.01,mM.z), V(-0.012,mM.y+0.01,mM.z), P.blaze, 0.02);
      quad(V(-0.012,mM.y+0.01,mM.z), V(0.012,mM.y+0.01,mM.z),
           V(0.010,mT.y+0.02,mT.z-0.01), V(-0.010,mT.y+0.02,mT.z-0.01), P.blaze, 0.0);
    }
    /* two upright EARS, pinned back (mid-strike alertness) */
    for(const s of [-1,1]){
      const eb=V(s*0.060, hb.y+0.16, hb.z+dz*0.7), et=V(s*0.086, hb.y+0.28, hb.z+dz*0.5);
      tube(eb, et, 0.030, 0.006, 5, bone?P.coatDk:P.coat, {raz:0.020, rbz:0.004, capB:{hex:bone?P.coatDk:P.maneDk, lift:0.006}});
    }
    if(bone){
      /* hollow EYE SOCKETS — recessed dark boxes on the skull (anatomical, not painted eyes) */
      const ey=hb.y+0.05, ez=hb.z+dz*0.7;
      for(const s of [-1,1]){
        const ex=s*0.078;
        quad(V(ex-0.036,ey+0.030,ez), V(ex+0.036,ey+0.030,ez),
             V(ex+0.028,ey-0.032,ez), V(ex-0.028,ey-0.032,ez), P.socket, 0.02);
        quad(V(ex-0.024,ey+0.020,ez-0.04), V(ex+0.024,ey+0.020,ez-0.04),
             V(ex+0.020,ey-0.022,ez-0.04), V(ex-0.020,ey-0.022,ez-0.04), P.hollow, 0.0);
      }
      // a bare teeth band on the muzzle
      tube(V(-0.040,mM.y+0.005,mM.z), V(0.040,mM.y+0.005,mM.z), 0.014,0.012,4,P.boneLt);
    }
  }

  /* ---------- LEGS — 4 long legs. Flesh+rear: HIND pair planted/angular (weight-bearing), FRONT
     pair cocked+airborne (striking, no ground contact). Standing/bone mode: original 4-planted
     haunched/bone rig. ------ */
  {
    const knob=(p,r)=>blob(p.x,p.y,p.z, r,r*0.85,r, P.boneLt, 6, 4);
    const leg=(hipX, hipZ, footX, footZ, isRear, airborne)=>{
      const hip=V(hipX, S.chest.y - (isRear? (S.chest.y-S.croup.y)*0.9 : 0.30), hipZ);
      const hipY = isRear ? S.croup.y+0.06 : S.chest.y-0.10;
      const H = V(hipX, hipY, hipZ);
      let knee, fet, hoof;
      if(airborne){
        // striking front leg: hip -> elbow bent FORWARD+UP -> cannon rising -> hoof pawing HIGH
        // above the ground (near/above withers height), curling back toward the chest — a vertical
        // rear-strike read, not a horizontal forward reach.
        knee = V(hipX*1.02, hipY+0.05, hipZ+0.12);
        fet  = V(footX*1.05, hipY+0.28, hipZ+0.10);
        hoof = V(footX*1.05, hipY+0.42, hipZ+0.02);
      } else if(isRear){
        // planted hind: gentle Z-zigzag, stifle HIGH+tucked forward, hock the prominent backward bend
        const stifle = V(hipX*1.02, hipY-0.20, hipZ+0.12);        // stifle forward, high (~0.6H)
        knee = stifle;
        fet  = V(footX, 0.20, footZ-0.06);                        // hock implied between stifle->fet
        hoof = V(footX, 0.03, footZ-0.02);
      } else {
        knee = V(hipX*1.02, 0.58, hipZ-0.02);
        fet  = V(footX, 0.20, footZ);
        hoof = V(footX, 0.05, footZ+0.02);
      }
      if(bone){
        knob(H,0.055); tube(H,knee,0.044,0.034,6,P.coat); knob(knee,0.044);
        tube(knee,fet,0.032,0.024,6,P.coat); knob(fet,0.032);
        tube(fet,hoof,0.030,0.028,6,P.coatDk,{capB:{hex:P.hoofDk, lift:0.006}});
      } else if(airborne){
        // slimmer striking leg, a bright SOCK band at the fetlock (signature value zone)
        tube(H,knee,0.098,0.062,7,P.coat);
        tube(knee,fet,0.048,0.038,6,P.coatDk);
        tube(fet,hoof,0.038,0.044,6,P.sock,{capB:{hex:P.hoofDk, lift:0.006}});
        blob(fet.x, fet.y-0.01, fet.z, 0.030,0.020,0.026, P.sock, 5, 3);   // fetlock feather tuft
      } else {
        // planted hind: haunched upper (thick, weight-bearing), then the angular stifle->hock->cannon
        tube(H,knee,0.140,0.078,7,P.coat);
        tube(knee,fet,0.056,0.042,6,P.coatDk);
        tube(fet,hoof,0.048,0.054,6,P.hoof,{capB:{hex:P.hoofDk, lift:0.006}});
        if(!isRear) blob(fet.x, fet.y-0.01, fet.z, 0.028,0.018,0.024, P.coatDk, 5, 3);
      }
    };
    if(rear){
      // front pair (under chest, striking/airborne)
      leg(-0.165, 0.24, -0.185, 0.62, false, true);
      leg( 0.165, 0.24,  0.185, 0.58, false, true);
      // rear pair (under croup, planted)
      leg(-0.180, -0.44, -0.195, -0.36, true, false);
      leg( 0.180, -0.44,  0.195, -0.40, true, false);
    } else {
      // standing/bone: original 4-planted rig
      leg(-0.165, 0.20, -0.175, 0.24, false, false);
      leg( 0.165, 0.20,  0.175, 0.20, false, false);
      leg(-0.180, -0.52, -0.195, -0.46, true, false);
      leg( 0.180, -0.52,  0.195, -0.50, true, false);
    }
  }

  /* ---------- TAIL — flesh: a thick hair sweep, flagged UP+OUT in rear mode (motion cue). Bone: a
     bare bony tail-string of vertebra knobs (unchanged, standing root). ---- */
  {
    const t0 = rear ? V(0.02, S.croup.y+0.02, S.croup.z-0.10) : V(0.02, wY-0.06, -0.62);
    const t1 = rear ? V(0.06, S.croup.y+0.22, S.croup.z-0.24) : V(0.05, wY-0.28, -0.74);
    const t2 = rear ? V(0.10, S.croup.y+0.30, S.croup.z-0.42) : V(0.08, 0.55,    -0.84);
    const t3 = rear ? V(0.12, S.croup.y+0.20, S.croup.z-0.56) : V(0.10, 0.28,    -0.88);
    const tip= rear ? V(0.13, S.croup.y+0.06, S.croup.z-0.64) : V(0.11, 0.10,   -0.86);
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
      if(rear){
        /* fanned tip strands — the tail splits into 3 countable flying locks off the flagged tip,
           reinforcing the whipped-back motion cue set by the mane. */
        for(const sx of [-0.06,0,0.07]){
          const flareM = t3.clone().add(V(sx*0.6, -0.04, -0.06));
          const flareT = tip.clone().add(V(sx*1.4, -0.10, -0.14));
          tube(flareM, flareT, 0.024, 0.006, 4, P.maneDk, {capB:{hex:P.maneDk, lift:0.006}});
        }
      }
    }
  }

  /* ---------- base disc (Large: r=0.55) — under the weight-bearing hind pair in rear mode; a
     full centered disc in standing/bone mode. ---------- */
  {
    const cz = rear ? -0.40 : 0;
    const r1=ring(V(0,0.002,cz), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,cz), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,cz), P.discTop);
  }
}

export function buildHorse(){ horseFigure('flesh'); }
export function buildWarhorseSkeleton(){ horseFigure('bone'); }
