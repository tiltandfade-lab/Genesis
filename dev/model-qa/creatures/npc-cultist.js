/* dev/model-qa/creatures/npc-cultist.js — the hooded-cultist landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js: the ENTIRE creature is one function of shared
   primitives, every vertex in one model frame, no anchors. The RITUAL DAGGER is authored FIRST,
   held point-DOWN with both hands meeting at the chest, so both fists derive to the grip. Full
   hooded robe with the hood UP; the face is a dark VOID under the hood (no skin, no painted eyes)
   — this is the ONE legal exception to the humanoid.js house eye standard (a deliberately empty
   dark socket reads scarier than any painted dot at this resolution, and there IS no face plane to
   paint eyes onto — the hood shadow-well goes all the way back to the skull ring). Plain dull
   grey-brown robe, rope belt with a hanging cord tail, slight forward hunch. Human proportions
   copied from humanoid.js (head-top ~1.475 before the hunch tips it forward). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildCultist(){
  /* ---------- PALETTE (plain dull grey-brown — distinct from the warlock's near-black plum) ---------- */
  const P = {
    robe:0x5a5140, robeDk:0x433c30, robeLt:0x6b6150,
    rope:0xa88f52, ropeDk:0x6b5730,
    void:0x0d0b09,                                    /* the face-void — near-black, not pure black */
    hand:0x8a7458, handDk:0x5f5038,                    /* muted cloth-wrapped hands (skin de-emphasized) */
    steel:0x8a8f92, steelDk:0x5c6164, hilt:0x2c2620,
    boot:0x241d15, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — copy humanoid.js's rig numbers, then hunch (chest/shoulders +z, -y a touch) */
  const L = {
    hipY:0.71, waistY:0.785, ribY:0.885, chestY:0.985, shldY:1.06, neckY:1.10,
    hipHalf:0.115, shoulderX:0.230,
    jawY:1.13, cheekY:1.20, browY:1.275, crownY:1.365, headTopY:1.425,
  };

  /* ================= THE RITUAL DAGGER — authored FIRST, held point-DOWN at the chest,
     both hands meeting on the grip (a two-handed offering/ready grip, not a fighting stance). */
  const GRIP_HI = V(0.0, 0.885, 0.285), GRIP_LO = V(0.0, 0.790, 0.270);
  const BLADE_DIR = new THREE.Vector3().subVectors(GRIP_LO, GRIP_HI).normalize();   // points down+slightly fwd
  const TIP = GRIP_LO.clone().addScaledVector(BLADE_DIR, 0.22);
  {
    // hilt: pommel -> grip -> short crossguard, blade continuing down past the grip to the tip
    const POMMEL = GRIP_HI.clone().addScaledVector(BLADE_DIR, -0.05);
    tube(POMMEL, GRIP_HI, 0.020, 0.016, 6, P.hilt, {capA:{hex:P.hilt}});
    // crossguard — a small perpendicular bar at the grip/blade transition, held well clear of the robe
    const cu = new THREE.Vector3().crossVectors(V(0,1,0), BLADE_DIR).normalize();
    const cgA=GRIP_HI.clone().addScaledVector(cu,0.075), cgB=GRIP_HI.clone().addScaledVector(cu,-0.075);
    tube(cgA, cgB, 0.014, 0.012, 5, P.steelDk);
    // blade — tapering tube from grip down to the tip, out in front of the robe (proud +z)
    tube(GRIP_HI, TIP, 0.026, 0.004, 6, P.steel, {capB:{hex:P.steel}});
  }

  /* trunk (one loft, hips->neck) — hunched: verts pushed +z as y rises, same family as warlock.js */
  stack([
    {y:L.hipY,   rx:0.185, rz:0.145, cz:0.0,   hex:P.robeDk},
    {y:L.waistY, rx:0.165, rz:0.128, cz:0.008, hex:P.robe},
    {y:L.ribY,   rx:0.188, rz:0.145, cz:0.020, hex:P.robe},
    {y:L.chestY, rx:0.205, rz:0.158, cz:0.036, hex:P.robeLt},
    {y:L.shldY,  rx:0.205, rz:0.148, cz:0.050, hex:P.robeLt},
    {y:L.neckY,  rx:0.078, rz:0.075, cz:0.054, hex:P.robeDk},
  ], 8, {capTop:{hex:P.robeDk, lift:0.004}});

  /* FULL ROBE — floor-length outer shell, heavier toward the hem (this IS the lower body) */
  stack([
    {y:0.04,  rx:0.275, rz:0.230, cz:0.040, hex:P.robeDk},
    {y:0.22,  rx:0.258, rz:0.212, cz:0.034, hex:P.robe},
    {y:0.42,  rx:0.235, rz:0.190, cz:0.026, hex:P.robe},
    {y:0.60,  rx:0.212, rz:0.168, cz:0.018, hex:P.robeLt},
    {y:L.hipY,rx:0.190, rz:0.148, cz:0.010, hex:P.robeLt},
  ], 8, {});
  // hem flare lip
  stack([
    {y:0.03,  rx:0.300, rz:0.250, cz:0.044, hex:P.robeDk},
    {y:0.12,  rx:0.270, rz:0.222, cz:0.040, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});

  /* ROPE BELT with a hanging cord tail (knotted, dangling to mid-thigh) */
  stack([
    {y:L.waistY-0.008, rx:0.198, rz:0.160, hex:P.rope},
    {y:L.waistY+0.028, rx:0.196, rz:0.158, hex:P.ropeDk},
  ], 8, {});
  {
    // hanging cord: a slightly wavy tube from the belt knot down past the hip
    const knot=V(0.035, L.waistY+0.01, 0.175);
    const c1=V(0.045, 0.58, 0.185), c2=V(0.03, 0.42, 0.175), c3=V(0.05, 0.30, 0.165);
    tube(knot, c1, 0.014,0.012,5,P.rope);
    tube(c1, c2, 0.012,0.010,5,P.ropeDk);
    tube(c2, c3, 0.010,0.007,5,P.ropeDk, {capB:{hex:P.ropeDk}});
    // small knot bump at the belt
    const kr=ring(knot.clone(), V(0,1,0), 0.022,0.022,6);
    capFan(kr, knot.clone().add(V(0,0.02,0)), P.rope);
  }

  /* HOOD UP — deep, face fully shadowed. Same shell-construction family as humanoid.js's hood
     (outer shell + open front window + dark lining) but pulled forward and DEEPER, with the
     "face window" left open all the way to a dark void ring set well back inside the hood — no
     head/skin geometry is authored at all; the void IS the face. */
  {
    const n=8, ph=Math.PI/n, faceCols=[1,2];       // narrow front window (house-hood proportion) — deep shadow read
    const bands=[
      {y:L.neckY-0.01,  rx:0.098, rz:0.096, cz:0.056, hex:P.robeDk},
      {y:L.jawY+0.02,   rx:0.128, rz:0.122, cz:0.056, hex:P.robe},
      {y:L.cheekY+0.02, rx:0.136, rz:0.128, cz:0.046, hex:P.robeLt},
      {y:L.browY+0.03,  rx:0.128, rz:0.120, cz:0.026, hex:P.robe},
      {y:L.crownY+0.05, rx:0.104, rz:0.096, cz:0.008, hex:P.robeDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    const skip={1:faceCols, 2:faceCols, 3:faceCols};
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings.at(-1), V(0, L.headTopY+0.08, 0.02), P.robeDk);
    // deep inner lining walls framing the face window (dark, receding into the hood)
    const inner=bands.map(b=>ring(V(0,b.y,b.cz-0.05), V(0,1,0), b.rx-0.025, b.rz-0.025, n, ph));
    for(let b=1;b<4;b++) for(const edge of [1,2])
      quad(rings[b][edge], inner[b][edge], inner[b+1][edge], rings[b+1][edge], P.robeDk, 0.03);
    /* THE FACE-VOID — a dark shadow-well set well back inside the hood opening. No skin, no eyes:
       a single recessed dark disc is the entire face read (the one legal exception to the house
       eye standard — noted per the brief). */
    const voidCenter = V(0, (L.jawY+L.browY)/2+0.01, -0.008);
    const voidRing = ring(voidCenter, V(0,0,1), 0.070, 0.088, 10);
    capFan(voidRing, voidCenter.clone().add(V(0,0,-0.05)), P.void);
    // a slightly darker inset lip right at the void's edge so it reads as a socket, not a flat disc
    const lipRing = ring(voidCenter.clone().add(V(0,0,0.012)), V(0,0,1), 0.078, 0.096, 10);
    stitch([lipRing, voidRing], ()=>P.void);
  }

  /* arms — BOTH hands meet at the chest gripping the dagger (derived to GRIP_HI/GRIP_LO). Wide
     robe sleeves down to cloth-wrapped hands, no bare skin shown. */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.05);
    const E=V(0.20, 0.90, 0.16);
    const W=GRIP_HI.clone().addScaledVector(V(1,0,0), 0.04).add(V(0,-0.01,0.01));
    tube(S,E,0.082,0.066,6,P.robe);
    tube(E,W,0.066,0.050,6,P.robeLt,{capB:{hex:P.hand}});
    tube(W, GRIP_HI.clone().add(V(0.015,-0.03,0.0)), 0.044,0.040,6,P.hand, {capA:{hex:P.hand}, capB:{hex:P.handDk}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.05), E2=V(-0.20, 0.87, 0.17);
    const W2=GRIP_LO.clone().add(V(-0.04,0.01,0.01));
    tube(S2,E2,0.082,0.066,6,P.robe);
    tube(E2,W2,0.066,0.050,6,P.robeLt,{capB:{hex:P.hand}});
    tube(W2, GRIP_LO.clone().add(V(-0.015,0.03,0.0)), 0.044,0.040,6,P.hand, {capA:{hex:P.hand}, capB:{hex:P.handDk}});
  }

  /* legs — mostly hidden by the full robe hem, only cloth-wrapped boot-toes peek out */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.03), ankL=V(-0.095, 0.085, 0.06);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.03), ankR=V( 0.11, 0.085, 0.03);
    tube(hipL,ankL,0.058,0.044,6,P.robeDk);
    tube(hipR,ankR,0.058,0.044,6,P.robeDk);
    for(const [ank,toeDir] of [[ankL,V(-0.08,0,1).normalize()], [ankR,V(0.12,0,1).normalize()]]){
      stack([
        {y:0.012, rx:0.060, rz:0.068, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.054, rz:0.056, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.11), 0.048,0.036,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.040, rbz:0.028});
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
