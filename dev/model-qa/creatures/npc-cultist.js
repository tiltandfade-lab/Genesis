/* dev/model-qa/creatures/npc-cultist.js — the hooded-cultist landmark table (whole-object probe).
   REBUILD 2026-07-08 under docs/MODEL-FOUNDRY.md (foundry rebuild-w1, cell 3). Same whole-object
   grammar: the ENTIRE creature is one function of shared primitives, every vertex in one model
   frame, no anchors. Preserves the ORIGINAL SIGNATURE (deep hood over an empty dark face-void +
   the ritual dagger) and the ORIGINAL PALETTE (plain dull grey-brown robe, rope belt) but replaces
   the geometry's POSE per the foundry brief: mid-ritual, both arms thrown UP to the sky, dagger
   raised in ONE fist, hood/head snapped BACK — the high-expression moment, not the old two-handed
   offering-grip stance.

   FEATURE CHECKLIST (the ~1.1-1.5k budget buys):
     1. HUMANOID torso + full floor-length robe (ANATOMY-CANON humanoid proportions), hunched-back
        arched INTO the upward reach rather than forward — the spine bends backward as the arms go up.
     2. Deep hood, pulled back off a snapped-back head-tilt, framing the face-void from BELOW/behind
        rather than dead-on — the empty dark socket is still the whole face read (no skin/eyes
        authored — the one legal exception to the house eye standard, unchanged from the original).
     3. Ritual dagger, raised OVERHEAD in the right fist, blade pointing UP — the signature weapon,
        now a vertical high-value accent breaking the robe's silhouette above the head instead of
        hidden at the chest.
     4. BOTH arms raised skyward, wide bell sleeves falling open/inverted (sleeve cuffs wider than
        the wrist, gravity-dropped toward the shoulder) — the pose's second silhouette tell.
     5. Rope belt with the hanging knotted cord tail (unchanged signature detail, second high-value
        warm accent against the dark robe).
     6. Ragged hem + cloth-wrapped boot toes peeking from beneath the floor-length robe.

   POSE SENTENCE: mid-ritual — both arms thrown straight up to the sky, the dagger raised high in
   the right fist, the hooded head snapped back as if drinking in something descending from above;
   never a static offering stance, the creature's most alive, most committed moment. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildCultist(){
  /* ---------- PALETTE (unchanged from the original — plain dull grey-brown) ---------- */
  const P = {
    robe:0x5a5140, robeDk:0x433c30, robeLt:0x6b6150,
    rope:0xa88f52, ropeDk:0x6b5730,
    void:0x0d0b09,                                    /* the face-void — near-black, not pure black */
    hand:0x8a7458, handDk:0x5f5038,                    /* muted cloth-wrapped hands (skin de-emphasized) */
    steel:0x9aa0a3, steelDk:0x5c6164, hilt:0x2c2620,
    boot:0x241d15, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — humanoid.js's rig numbers, then a BACKWARD arch (spine bends -z at the
     top as it rises, opposite of the old forward hunch) so the reach reads as thrown-back, not slumped. */
  const L = {
    hipY:0.71, waistY:0.785, ribY:0.885, chestY:0.985, shldY:1.06, neckY:1.10,
    hipHalf:0.115, shoulderX:0.230,
    jawY:1.145, cheekY:1.215, browY:1.29, crownY:1.375, headTopY:1.435,
  };

  /* trunk (one loft, hips->neck) — POSEFIX 2026-07-08: a genuine C-curve, not a plumb column.
     Pelvis reads FORWARD (+z, positive cz) at the hip, the curve sweeps backward (-z) climbing
     through rib/chest/shoulder/neck — chest lifted, the whole upper spine arched back. */
  stack([
    {y:L.hipY,   rx:0.185, rz:0.145, cz:0.010,  hex:P.robeDk},
    {y:L.waistY, rx:0.168, rz:0.130, cz:-0.012, hex:P.robe},
    {y:L.ribY,   rx:0.192, rz:0.148, cz:-0.055, hex:P.robe},
    {y:L.chestY, rx:0.216, rz:0.165, cz:-0.100, hex:P.robeLt},
    {y:L.shldY,  rx:0.208, rz:0.150, cz:-0.125, hex:P.robeLt},
    {y:L.neckY,  rx:0.080, rz:0.076, cz:-0.145, hex:P.robeDk},
  ], 8, {capTop:{hex:P.robeDk, lift:0.004}});

  /* FULL ROBE — floor-length outer shell, heavier toward the hem (this IS the lower body).
     Pelvis pushed forward (+z) at the hem, tapering up to the hip cz to hand off cleanly into
     the trunk's counter-arch above. */
  stack([
    {y:0.04,  rx:0.275, rz:0.230, cz:0.050, hex:P.robeDk},
    {y:0.22,  rx:0.258, rz:0.212, cz:0.044, hex:P.robe},
    {y:0.42,  rx:0.235, rz:0.190, cz:0.032, hex:P.robe},
    {y:0.60,  rx:0.212, rz:0.168, cz:0.018, hex:P.robeLt},
    {y:L.hipY,rx:0.190, rz:0.148, cz:0.010, hex:P.robeLt},
  ], 8, {});
  // hem flare lip
  stack([
    {y:0.03,  rx:0.300, rz:0.250, cz:0.052, hex:P.robeDk},
    {y:0.12,  rx:0.270, rz:0.222, cz:0.046, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});

  /* ROPE BELT with a hanging cord tail (knotted, dangling to mid-thigh) — unchanged signature */
  stack([
    {y:L.waistY-0.008, rx:0.198, rz:0.160, hex:P.rope},
    {y:L.waistY+0.028, rx:0.196, rz:0.158, hex:P.ropeDk},
  ], 8, {});
  {
    const knot=V(0.035, L.waistY+0.01, 0.150);
    const c1=V(0.045, 0.58, 0.160), c2=V(0.03, 0.42, 0.150), c3=V(0.05, 0.30, 0.140);
    tube(knot, c1, 0.014,0.012,5,P.rope);
    tube(c1, c2, 0.012,0.010,5,P.ropeDk);
    tube(c2, c3, 0.010,0.007,5,P.ropeDk, {capB:{hex:P.ropeDk}});
    const kr=ring(knot.clone(), V(0,1,0), 0.022,0.022,6);
    capFan(kr, knot.clone().add(V(0,0.02,0)), P.rope);
  }

  /* HOOD — pulled back off a head snapped BACK: the hood's crown tilts -z (backward/up) instead of
     the old forward droop, exposing the face-void from a lower/rearward angle. Same shell family
     (outer shell + open front window + dark lining) as before, just re-angled for the new pose. */
  {
    const n=8, ph=Math.PI/n, faceCols=[1,2];
    /* POSEFIX 2026-07-08: head follows the trunk's new -0.145 neck cz — shifted back by the same
       delta as before (~-0.087) so the hood's own internal curve (still opening forward toward
       the crown) is preserved, it just rides the more dramatic backward arch now. */
    const bands=[
      {y:L.neckY-0.01,  rx:0.100, rz:0.098, cz:-0.145, hex:P.robeDk},
      {y:L.jawY+0.03,   rx:0.130, rz:0.124, cz:-0.142, hex:P.robe},
      {y:L.cheekY+0.05, rx:0.138, rz:0.130, cz:-0.127, hex:P.robeLt},
      {y:L.browY+0.09,  rx:0.130, rz:0.122, cz:-0.097, hex:P.robe},
      {y:L.crownY+0.13, rx:0.106, rz:0.098, cz:-0.057, hex:P.robeDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    const skip={1:faceCols, 2:faceCols, 3:faceCols};
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings.at(-1), V(0, L.headTopY+0.16, -0.012), P.robeDk);
    // deep inner lining walls framing the face window (dark, receding into the hood)
    const inner=bands.map(b=>ring(V(0,b.y,b.cz+0.05), V(0,1,0), b.rx-0.025, b.rz-0.025, n, ph));
    for(let b=1;b<4;b++) for(const edge of [1,2])
      quad(rings[b][edge], inner[b][edge], inner[b+1][edge], rings[b+1][edge], P.robeDk, 0.03);
    /* THE FACE-VOID — recessed dark shadow-well, tilted to face UP-and-forward (following the
       snapped-back head), still the single legal exception to the house eye standard. */
    const voidCenter = V(0, (L.jawY+L.browY)/2+0.04, -0.045);
    const voidNormal = V(0, 0.65, 1).normalize();
    const voidRing = ring(voidCenter, voidNormal, 0.070, 0.088, 10);
    capFan(voidRing, voidCenter.clone().addScaledVector(voidNormal, -0.05), P.void);
    const lipRing = ring(voidCenter.clone().addScaledVector(voidNormal, 0.012), voidNormal, 0.078, 0.096, 10);
    stitch([lipRing, voidRing], ()=>P.void);
  }

  /* ================= THE RITUAL DAGGER — raised OVERHEAD in the right fist, blade pointing UP.
     Authored before the arms so the right wrist can derive to the grip. */
  const GRIP_HI = V(0.235, 1.64, -0.105), GRIP_LO = V(0.230, 1.505, -0.11);
  const BLADE_DIR = new THREE.Vector3().subVectors(GRIP_HI, GRIP_LO).normalize();   // points up
  const TIP = GRIP_HI.clone().addScaledVector(BLADE_DIR, 0.24);
  {
    const POMMEL = GRIP_LO.clone().addScaledVector(BLADE_DIR, -0.055);
    tube(POMMEL, GRIP_LO, 0.020, 0.016, 6, P.hilt, {capA:{hex:P.hilt}});
    const cu = new THREE.Vector3().crossVectors(V(0,1,0), BLADE_DIR).normalize();
    if (cu.lengthSq() < 1e-6) cu.set(1,0,0);
    const cgA=GRIP_LO.clone().addScaledVector(cu,0.075), cgB=GRIP_LO.clone().addScaledVector(cu,-0.075);
    tube(cgA, cgB, 0.014, 0.012, 5, P.steelDk);
    tube(GRIP_LO, TIP, 0.026, 0.004, 6, P.steel, {capB:{hex:P.steel}});
  }

  /* arms — POSEFIX 2026-07-08 (ANATOMY-CANON POSE-ANATOMY): the "candlestick" (both arms straight,
     near-symmetric, mirrored heights) is a gate failure — staggered instead. RIGHT (dagger) arm
     rides HIGH with a clear ~114° elbow bend and its shoulder lifted with it (rule 3). LEFT (off)
     arm is lower AND wider — a ~114° elbow swung out to the side rather than mirroring the dagger
     arm overhead — so the silhouette reads as one asymmetric gesture, not a tuning fork. */
  {
    // right arm: shoulder (lifted, rides with the raised arm) -> elbow (kicked out, bent ~114°) -> wrist at the dagger grip
    const S_R=V(0.185, L.shldY+0.025, -0.04);
    const E_R=V(0.240, 1.260, 0.060);
    const W_R=GRIP_LO.clone().add(V(0.005,-0.01,0.01));
    tube(S_R,E_R,0.080,0.062,6,P.robe);
    tube(E_R,W_R,0.062,0.046,6,P.robeLt,{capB:{hex:P.hand}});
    tube(W_R, GRIP_LO.clone().add(V(0.0,0.02,0.0)), 0.042,0.038,6,P.hand, {capA:{hex:P.hand}, capB:{hex:P.handDk}});
    // bell-sleeve cuff flaring open at the elbow (wider ring dropping toward the shoulder)
    stack([
      {y:E_R.y+0.03, rx:0.075, rz:0.070, cx:E_R.x-0.01, cz:E_R.z-0.02, hex:P.robeLt},
      {y:E_R.y-0.10, rx:0.100, rz:0.090, cx:E_R.x-0.02, cz:E_R.z-0.05, hex:P.robeDk},
    ], 6, {capBot:{hex:P.robeDk, lift:0.0}});

    // left arm: shoulder (relaxed, below the dagger shoulder) -> elbow swung WIDE and low -> open
    // palm raised only to chest/shoulder height — lower AND wider than the dagger arm, never mirrored.
    const S_L=V(-0.195, L.shldY-0.015, -0.03);
    const E_L=V(-0.310, 1.180, 0.100);
    const W_L=V(-0.440, 1.300, 0.000);
    tube(S_L,E_L,0.080,0.062,6,P.robe);
    tube(E_L,W_L,0.062,0.046,6,P.robeLt,{capB:{hex:P.hand}});
    // open palm — a short flattened stub capped at the fingertip line
    tube(W_L, W_L.clone().add(V(-0.06,0.06,-0.02)), 0.040,0.030,6,P.hand, {capA:{hex:P.hand}, capB:{hex:P.handDk}});
    stack([
      {y:E_L.y+0.03, rx:0.075, rz:0.070, cx:E_L.x+0.01, cz:E_L.z-0.02, hex:P.robeLt},
      {y:E_L.y-0.10, rx:0.100, rz:0.090, cx:E_L.x+0.02, cz:E_L.z-0.05, hex:P.robeDk},
    ], 6, {capBot:{hex:P.robeDk, lift:0.0}});
  }

  /* legs — mostly hidden by the full robe hem, only cloth-wrapped boot-toes peek out. Braced wide
     for the backward arch (stance widened slightly vs. the original for balance under the reach). */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.02), ankL=V(-0.115, 0.085, 0.03);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.02), ankR=V( 0.13, 0.085, 0.00);
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
