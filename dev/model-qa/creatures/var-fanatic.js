/* dev/model-qa/creatures/var-fanatic.js — CULT FANATIC kin-variant (sub-nearest doctrine).
   COPIES npc-cultist.js: keeps the hooded robe but swaps to a darker blood-tinged palette, and
   RAISES the ritual dagger OVERHEAD in one hand (the dagger + its gripping arm relocated from the
   two-hand chest clasp to a raised strike — following the source's held-item-FIRST structure), plus
   a rope-scourge hanging at the belt. Mid-ritual fervor. Everything else identical.
   Imported by var-fanatic-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildCultFanatic(){
  /* ---------- PALETTE (darker blood-tinged — deep oxblood robe vs. the cultist's grey-brown) ---------- */
  const P = {
    robe:0x3e2622, robeDk:0x2a1815, robeLt:0x50322c,
    rope:0x8a6f3e, ropeDk:0x574327,
    void:0x0a0806,
    hand:0x8a7458, handDk:0x5f5038,
    steel:0x8a8f92, steelDk:0x5c6164, hilt:0x2c2620,
    boot:0x1c1610, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (copied from the cultist) ---------- */
  const L = {
    hipY:0.71, waistY:0.785, ribY:0.885, chestY:0.985, shldY:1.06, neckY:1.10,
    hipHalf:0.115, shoulderX:0.230,
    jawY:1.13, cheekY:1.20, browY:1.275, crownY:1.365, headTopY:1.425,
  };

  /* ================= THE RITUAL DAGGER — authored FIRST, RAISED OVERHEAD in the right hand for a
     downward strike. The grip sits high above the right shoulder; the blade points DOWN-and-back
     (ready to plunge). The right fist derives to GRIP_LO/GRIP_HI as in the source. */
  const GRIP_HI = V(0.34, 1.62, 0.06), GRIP_LO = V(0.32, 1.52, 0.10);
  const BLADE_DIR = new THREE.Vector3().subVectors(GRIP_LO, GRIP_HI).normalize();   // down + slightly fwd
  const TIP = GRIP_LO.clone().addScaledVector(BLADE_DIR, 0.22);
  {
    const POMMEL = GRIP_HI.clone().addScaledVector(BLADE_DIR, -0.05);
    tube(POMMEL, GRIP_HI, 0.020, 0.016, 6, P.hilt, {capA:{hex:P.hilt}});
    const cu = new THREE.Vector3().crossVectors(V(0,1,0), BLADE_DIR).normalize();
    const cgA=GRIP_HI.clone().addScaledVector(cu,0.075), cgB=GRIP_HI.clone().addScaledVector(cu,-0.075);
    tube(cgA, cgB, 0.014, 0.012, 5, P.steelDk);
    tube(GRIP_HI, TIP, 0.026, 0.004, 6, P.steel, {capB:{hex:P.steel}});
  }

  /* trunk (one loft, hips->neck) — hunched */
  stack([
    {y:L.hipY,   rx:0.185, rz:0.145, cz:0.0,   hex:P.robeDk},
    {y:L.waistY, rx:0.165, rz:0.128, cz:0.008, hex:P.robe},
    {y:L.ribY,   rx:0.188, rz:0.145, cz:0.020, hex:P.robe},
    {y:L.chestY, rx:0.205, rz:0.158, cz:0.036, hex:P.robeLt},
    {y:L.shldY,  rx:0.205, rz:0.148, cz:0.050, hex:P.robeLt},
    {y:L.neckY,  rx:0.078, rz:0.075, cz:0.054, hex:P.robeDk},
  ], 8, {capTop:{hex:P.robeDk, lift:0.004}});

  /* FULL ROBE */
  stack([
    {y:0.04,  rx:0.275, rz:0.230, cz:0.040, hex:P.robeDk},
    {y:0.22,  rx:0.258, rz:0.212, cz:0.034, hex:P.robe},
    {y:0.42,  rx:0.235, rz:0.190, cz:0.026, hex:P.robe},
    {y:0.60,  rx:0.212, rz:0.168, cz:0.018, hex:P.robeLt},
    {y:L.hipY,rx:0.190, rz:0.148, cz:0.010, hex:P.robeLt},
  ], 8, {});
  stack([
    {y:0.03,  rx:0.300, rz:0.250, cz:0.044, hex:P.robeDk},
    {y:0.12,  rx:0.270, rz:0.222, cz:0.040, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});

  /* ROPE BELT + hanging cord tail */
  stack([
    {y:L.waistY-0.008, rx:0.198, rz:0.160, hex:P.rope},
    {y:L.waistY+0.028, rx:0.196, rz:0.158, hex:P.ropeDk},
  ], 8, {});
  {
    const knot=V(0.035, L.waistY+0.01, 0.175);
    const c1=V(0.045, 0.58, 0.185), c2=V(0.03, 0.42, 0.175), c3=V(0.05, 0.30, 0.165);
    tube(knot, c1, 0.014,0.012,5,P.rope);
    tube(c1, c2, 0.012,0.010,5,P.ropeDk);
    tube(c2, c3, 0.010,0.007,5,P.ropeDk, {capB:{hex:P.ropeDk}});
    const kr=ring(knot.clone(), V(0,1,0), 0.022,0.022,6);
    capFan(kr, knot.clone().add(V(0,0.02,0)), P.rope);
  }

  /* ROPE-SCOURGE — a knotted flail of several thin cords hanging from the LEFT belt, dangling with
     little knotted end-nubs (mid-ritual self-flagellation prop). */
  {
    const hang=V(-0.150, L.waistY+0.01, 0.150);
    // scourge grip stub at the belt
    const gr=ring(hang.clone(), V(0,1,0), 0.020,0.020,6);
    capFan(gr, hang.clone().add(V(0,0.02,0)), P.ropeDk);
    // three-to-four cords fanning down + out
    const cords=[[-0.05,0.34,0.20],[-0.02,0.30,0.16],[-0.08,0.28,0.24],[-0.03,0.26,0.12]];
    for(const [dx,ey,dz] of cords){
      const a=hang.clone().add(V(0,-0.02,0));
      const m=V(hang.x+dx*0.6, (L.waistY+ey)/2, dz);
      const b=V(hang.x+dx, ey, dz);
      tube(a, m, 0.010, 0.008, 4, P.rope);
      tube(m, b, 0.008, 0.006, 4, P.ropeDk, {capB:{hex:P.ropeDk}});
      // knotted end-nub
      const nb=ring(b.clone(), V(0,1,0), 0.014,0.014,5);
      capFan(nb, b.clone().add(V(0,-0.012,0)), P.rope);
    }
  }

  /* HOOD UP — face-void, blood-tinged shell */
  {
    const n=8, ph=Math.PI/n, faceCols=[1,2];
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
    const inner=bands.map(b=>ring(V(0,b.y,b.cz-0.05), V(0,1,0), b.rx-0.025, b.rz-0.025, n, ph));
    for(let b=1;b<4;b++) for(const edge of [1,2])
      quad(rings[b][edge], inner[b][edge], inner[b+1][edge], rings[b+1][edge], P.robeDk, 0.03);
    const voidCenter = V(0, (L.jawY+L.browY)/2+0.01, -0.008);
    const voidRing = ring(voidCenter, V(0,0,1), 0.070, 0.088, 10);
    capFan(voidRing, voidCenter.clone().add(V(0,0,-0.05)), P.void);
    const lipRing = ring(voidCenter.clone().add(V(0,0,0.012)), V(0,0,1), 0.078, 0.096, 10);
    stitch([lipRing, voidRing], ()=>P.void);
  }

  /* arms — RIGHT raised overhead to the dagger grip; LEFT drops low/open (fervor). Right fist
     derives to GRIP_LO/GRIP_HI as in the source. */
  {
    /* RIGHT arm sweeps UP and back to the raised grip */
    const S=V(L.shoulderX, L.shldY-0.01, 0.05);
    const E=V(0.335, 1.28, 0.02);                     // elbow high, cocked back
    const W=GRIP_HI.clone().add(V(0.02,-0.02,0.02));
    tube(S,E,0.082,0.066,6,P.robe);
    tube(E,W,0.066,0.050,6,P.robeLt,{capB:{hex:P.hand}});
    tube(W, GRIP_LO.clone().add(V(0.015,0.02,0.0)), 0.044,0.040,6,P.hand, {capA:{hex:P.hand}, capB:{hex:P.handDk}});

    /* LEFT arm thrown low and open (empty, palm forward — beseeching) */
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.05);
    const E2=V(-0.30, 0.90, 0.15);
    const W2=V(-0.33, 0.66, 0.24);
    tube(S2,E2,0.082,0.066,6,P.robe);
    tube(E2,W2,0.066,0.050,6,P.robeLt,{capB:{hex:P.hand}});
    const HDIR=V(-0.10,-0.30,1).normalize();
    tube(W2, W2.clone().addScaledVector(HDIR,0.085), 0.044,0.038,6,P.hand, {capA:{hex:P.hand}, capB:{hex:P.handDk}});
  }

  /* legs — cloth-wrapped boot-toes peek out */
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
