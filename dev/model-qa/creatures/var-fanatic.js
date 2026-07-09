/* dev/model-qa/creatures/var-fanatic.js — the CULT FANATIC landmark table (HUMANOID family,
   Medium, CR 2, realm core), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry rebuild-w4, cell 0). REBUILD: preserves the humanoid-kit chassis + palette INTENT
   (dark oxblood robe, rope belt, dagger, boot-toes) shared with the base cultist, but the
   fanatic is the cult LEADER — the same robes escalated: ragged-hem-turned-ornate, a horned/
   ornamented headdress in place of the plain hood, and painted hem sigils. Bespoke geometry;
   whole-object grammar unchanged. Imported by ps1-sheet.html (SETS['rebuild-w4'], cell 0,
   fn buildCultFanatic).

   FEATURE CHECKLIST (the ~1,400-1,900 budget buys):
     1. HUMANOID torso + full floor-length robe, hunched-and-arched BACKWARD into the invocation
        (spine bends -z as it rises, chest lifted, matching the base kit's landmark rig).
     2. SIGNATURE #1 — a horned/ornamented HEADDRESS replacing the plain hood: two curved horns
        sweeping back off a banded crown, an open face (not the hood's void — the leader is SEEN,
        commanding, not anonymous), a bone/tooth fringe hanging off the browband.
     3. SIGNATURE #2 — the ritual dagger, raised OVERHEAD in the right fist at the top of the
        arc, blade pointing up — the tallest silhouette point, above even the horns.
     4. BOTH arms thrown UP-AND-BACK (not just up) — sleeves flung open, elbows cocked behind the
        shoulder line, wide bell cuffs gravity-dropped — the ecstatic-invocation arc.
     5. Ragged-ornate hem: the floor-length robe's lower third carries jagged tattered points
        AND a band of painted hem sigils (the law-3 high-value zone: pale bone-white glyph
        strokes against the dark robe, carried around the hem where they read against the base
        disc) — escalation from the plain cultist's clean hem.
     6. Rope belt + hanging knotted cord tail (unchanged signature detail, warm accent), plus a
        second cord looping a small trophy-bone at the hip (escalation motif, tiny added read).

   POSE SENTENCE: the ecstatic invocation — both arms thrown up and back, spine arched fully
   backward, the ritual dagger raised high above a head thrown fully back to the sky, horned
   headdress tipped skyward with it — the leader's most alive, most possessed moment, never a
   static offering stance. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildCultFanatic(){
  /* ---------- PALETTE (escalated from the cultist — deeper oxblood robe, bone-white sigils/horns,
     the same warm rope/hand family kept for continuity) ---------- */
  const P = {
    robe:0x3e2622, robeDk:0x2a1815, robeLt:0x50322c,
    rope:0x8a6f3e, ropeDk:0x574327,
    bone:0xf5ecd6, boneDk:0xc4b78e,                     /* headdress horns + hem sigils + fringe —
      PASS-2 CRITIC FIX: raised from 0xd8cdb0/0x9c8f6e — the PS1 shader (dither+1/3-res+dark void)
      was crushing the old bone tone to a measured in-engine max of 126 RGB, under the law-3 140
      floor and well below sibling rebuild-w4 renders (141-187); this is a near-white bone now so
      the signature actually carries the high-value zone the law requires. */
    horn:0xa8925e, hornDk:0x6c5c3e,
    hand:0x8a7458, handDk:0x5f5038,
    steel:0x9aa0a3, steelDk:0x5c6164, hilt:0x2c2620,
    boot:0x1c1610, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — the shared humanoid-kit rig numbers, backward-arched (matches the
     base cultist's -z spine bend so the family reads coherent) ---------- */
  const L = {
    hipY:0.71, waistY:0.785, ribY:0.885, chestY:0.985, shldY:1.06, neckY:1.10,
    hipHalf:0.115, shoulderX:0.230,
    jawY:1.145, cheekY:1.215, browY:1.29, crownY:1.375, headTopY:1.435,
  };

  /* trunk (one loft, hips->neck) — arched BACK: verts pushed -z as y rises, chest lifted */
  stack([
    {y:L.hipY,   rx:0.185, rz:0.145, cz:0.0,    hex:P.robeDk},
    {y:L.waistY, rx:0.168, rz:0.130, cz:-0.006, hex:P.robe},
    {y:L.ribY,   rx:0.192, rz:0.148, cz:-0.020, hex:P.robe},
    {y:L.chestY, rx:0.210, rz:0.162, cz:-0.038, hex:P.robeLt},
    {y:L.shldY,  rx:0.208, rz:0.150, cz:-0.052, hex:P.robeLt},
    {y:L.neckY,  rx:0.080, rz:0.076, cz:-0.058, hex:P.robeDk},
  ], 8, {capTop:{hex:P.robeDk, lift:0.004}});

  /* FULL ROBE — floor-length outer shell, heavier toward the hem */
  stack([
    {y:0.10,  rx:0.275, rz:0.230, cz:0.020, hex:P.robeDk},
    {y:0.24,  rx:0.258, rz:0.212, cz:0.016, hex:P.robe},
    {y:0.42,  rx:0.235, rz:0.190, cz:0.008, hex:P.robe},
    {y:0.60,  rx:0.212, rz:0.168, cz:0.000, hex:P.robeLt},
    {y:L.hipY,rx:0.190, rz:0.148, cz:-0.006,hex:P.robeLt},
  ], 8, {});

  /* RAGGED-ORNATE HEM — a SOLID band of painted bone-white hem sigils, ~0.09u thick (well above
     the 0.04u dissolve floor — round-1 self-correction: the first pass used a ~0.045u sliver band
     and it vanished entirely into the dark at 1/3-res), sitting proud of the robe surface (larger
     radius so it doesn't z-fight the hidden main-robe geometry). Jagged tattered points drop
     below it toward the ground for the torn silhouette. */
  {
    const bandTopY = 0.225, bandBotY = 0.135, hemRx = 0.283, hemRz = 0.233, hemCz = 0.020;
    const topRing = ring(V(0, bandTopY, hemCz), V(0,1,0), hemRx, hemRz, 12, Math.PI/12);
    const botRing = ring(V(0, bandBotY, hemCz), V(0,1,0), hemRx+0.006, hemRz+0.006, 12, Math.PI/12);
    stitch([botRing, topRing], (b,i)=> (i%2===0 ? P.bone : P.boneDk));
    // ragged tab points hanging from the sigil band, alternating long/short for the torn silhouette
    for(let i=0;i<12;i++){
      const a = botRing[i];
      const long = (i%2===0);
      const drop = long ? 0.115 : 0.065;
      const tip = V(a.x, Math.max(0.012, a.y-drop), a.z);
      const aN = botRing[(i+1)%12];
      quad(a, aN, V((a.x+aN.x)/2, tip.y, (a.z+aN.z)/2), tip, P.robeDk, 0.05);
    }
  }

  /* ROPE BELT with a hanging cord tail (unchanged signature detail) */
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
  /* second cord looping a small trophy-bone at the hip (escalation motif) */
  {
    const hang=V(-0.150, L.waistY+0.01, 0.140);
    const a=hang.clone(), b=V(-0.185, 0.60, 0.150);
    tube(a, b, 0.010, 0.007, 5, P.ropeDk, {capB:{hex:P.bone}});
    tube(b, b.clone().add(V(-0.01,-0.045,0.01)), 0.014, 0.010, 5, P.bone, {capA:{hex:P.bone}, capB:{hex:P.boneDk}});
  }

  /* ================= HEADDRESS — SIGNATURE #1. Replaces the plain hood: a banded crown open at
     the face (the leader is SEEN — no void), two curved horns sweeping back off the crown, and a
     bone/tooth fringe hanging off the browband. Head snapped fully BACK per the pose. */
  {
    const n=8, ph=Math.PI/n;
    const headCz = 0.02; // head snapped back, slight forward center-of-mass correction
    const bands=[
      {y:L.neckY-0.01,  rx:0.088, rz:0.086, cz:-0.010, hex:P.robeDk},   // throat wrap
      {y:L.jawY+0.02,   rx:0.082, rz:0.080, cz:0.010,  hex:P.handDk},   // jaw (bare skin, leader is seen)
      {y:L.cheekY+0.03, rx:0.080, rz:0.076, cz:0.030,  hex:P.hand},     // cheek
      {y:L.browY+0.05,  rx:0.078, rz:0.072, cz:0.040,  hex:P.handDk},   // brow
      {y:L.crownY+0.08, rx:0.072, rz:0.066, cz:0.030,  hex:P.robeDk},   // crown band base
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    // crown headpiece cap — the banded ornamented crown sitting atop the skull
    const crownTop = ring(V(0, L.headTopY+0.06, 0.02), V(0,1,0), 0.058, 0.052, n, ph);
    stitch([rings.at(-1), crownTop], ()=>P.bone);
    capFan(crownTop, V(0, L.headTopY+0.10, 0.01), P.boneDk);

    // TWO CURVED HORNS sweeping UP-and-OUT off the crown band, tall enough to clear the raised
    // arms and flank the dagger at the top of the silhouette (avoids the arms/headdress read
    // collapsing into one dark blob — the round-1 failure) — real 3D volume (tapered tube).
    for(const side of [-1,1]){
      const root = V(side*0.050, L.crownY+0.09, 0.015);
      const mid  = V(side*0.150, L.crownY+0.32, -0.03);
      const tip  = V(side*0.205, L.crownY+0.50, -0.06);
      tube(root, mid, 0.030, 0.020, 6, P.horn);
      tube(mid, tip, 0.020, 0.008, 6, P.hornDk, {capB:{hex:P.hornDk}});
    }

    // bone/tooth fringe hanging off the browband — small tapered nubs across the front
    const fringeAt = [-0.045,-0.022,0.0,0.022,0.045];
    for(const fx of fringeAt){
      const a = V(fx, L.browY+0.02, 0.108);
      const b = V(fx, L.browY-0.055, 0.112);
      tube(a, b, 0.010, 0.003, 4, P.bone, {capB:{hex:P.bone}});
    }
  }

  /* ================= THE RITUAL DAGGER — SIGNATURE #2, raised OVERHEAD in the right fist at the
     top of the up-and-back arc, blade pointing UP — the tallest point of the silhouette, taller
     than the horns. Authored before the arms so the right wrist can derive to the grip. */
  const GRIP_HI = V(0.20, 1.72, -0.10), GRIP_LO = V(0.195, 1.58, -0.11);
  const BLADE_DIR = new THREE.Vector3().subVectors(GRIP_HI, GRIP_LO).normalize();   // points up
  const TIP = GRIP_HI.clone().addScaledVector(BLADE_DIR, 0.26);
  {
    const POMMEL = GRIP_LO.clone().addScaledVector(BLADE_DIR, -0.055);
    tube(POMMEL, GRIP_LO, 0.020, 0.016, 6, P.hilt, {capA:{hex:P.hilt}});
    const cu = new THREE.Vector3().crossVectors(V(0,1,0), BLADE_DIR).normalize();
    if (cu.lengthSq() < 1e-6) cu.set(1,0,0);
    const cgA=GRIP_LO.clone().addScaledVector(cu,0.078), cgB=GRIP_LO.clone().addScaledVector(cu,-0.078);
    tube(cgA, cgB, 0.014, 0.012, 5, P.steelDk);
    tube(GRIP_LO, TIP, 0.028, 0.004, 6, P.steel, {capB:{hex:P.steel}});
  }

  /* arms — BOTH thrown UP-AND-BACK, elbows cocked behind the shoulder line (not just straight
     up), wide bell sleeves falling open/inverted toward the shoulder. Right hand grips the
     dagger overhead; left is open-palmed, thrown back and up alongside it. */
  {
    // right arm: shoulder -> elbow (raised AND back) -> wrist at the dagger grip
    const S_R=V(0.185, L.shldY-0.005, -0.03);
    const E_R=V(0.235, 1.40, -0.12);
    const W_R=GRIP_LO.clone().add(V(0.005,-0.01,0.01));
    tube(S_R,E_R,0.080,0.062,6,P.robe);
    tube(E_R,W_R,0.062,0.046,6,P.robeLt,{capB:{hex:P.hand}});
    tube(W_R, GRIP_LO.clone().add(V(0.0,0.02,0.0)), 0.042,0.038,6,P.hand, {capA:{hex:P.hand}, capB:{hex:P.handDk}});
    // bell-sleeve cuff flaring open at the elbow
    stack([
      {y:E_R.y+0.02, rx:0.075, rz:0.070, cx:E_R.x-0.01, cz:E_R.z+0.04, hex:P.robeLt},
      {y:E_R.y-0.11, rx:0.100, rz:0.090, cx:E_R.x-0.02, cz:E_R.z+0.09, hex:P.robeDk},
    ], 6, {capBot:{hex:P.robeDk, lift:0.0}});

    // left arm: shoulder -> elbow (raised and back, mirrored, slightly lower/wider) -> open palm
    const S_L=V(-0.185, L.shldY-0.005, -0.03);
    const E_L=V(-0.245, 1.36, -0.10);
    const W_L=V(-0.235, 1.64, -0.16);
    tube(S_L,E_L,0.080,0.062,6,P.robe);
    tube(E_L,W_L,0.062,0.046,6,P.robeLt,{capB:{hex:P.hand}});
    tube(W_L, W_L.clone().add(V(-0.01,0.09,-0.05)), 0.040,0.030,6,P.hand, {capA:{hex:P.hand}, capB:{hex:P.handDk}});
    stack([
      {y:E_L.y+0.02, rx:0.075, rz:0.070, cx:E_L.x+0.01, cz:E_L.z+0.04, hex:P.robeLt},
      {y:E_L.y-0.11, rx:0.100, rz:0.090, cx:E_L.x+0.02, cz:E_L.z+0.09, hex:P.robeDk},
    ], 6, {capBot:{hex:P.robeDk, lift:0.0}});
  }

  /* legs — mostly hidden by the full robe hem, only cloth-wrapped boot-toes peek out. Braced wide
     for the backward arch. */
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
