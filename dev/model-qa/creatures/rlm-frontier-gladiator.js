/* dev/model-qa/creatures/rlm-frontier-gladiator.js — the GLADIATOR landmark table (HUMANOID
   family, Medium, CR 5, realm frontier), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri
   band (foundry pilot, frontier-w1 cell 5). Core identity: the arena professional — the baron's
   undefeated duelist, a showman-killer who fights over land and water. Bespoke to the render key
   "gladiator" — frontier reskin (Cattle-Baron's Enforcer, data/realm-bestiary.js) rides this
   chassis narratively (dust-and-hide trim over the arena kit, not a re-model).

   FEATURE CHECKLIST (the ~1,400-1,700 budget buys):
     1. HUMANOID biped per ANATOMY-CANON POSE-ANATOMY: athletic straight-leg stance, contrapposto
        weight cocked hard onto the ONE planted hip.
     2. SIGNATURE — one huge asymmetric shoulder guard (right side), oversized against the bare
        left shoulder/torso — the single loud exaggerated read (law 4).
     3. Blade arm flung WIDE and open (the crowd-taunt invitation) — elbow bent, not locked
        straight, blade angled out and up.
     4. Off arm raised and flexed (bicep-up showman gesture) — elbow sharply bent, fist near the
        ear, shoulder riding UP with the arm per POSE-ANATOMY rule 3.
     5. Bare open chest/torso (arena showman, no covering armor there) so the pale-vs-tan value
        contrast (law 3) reads clean against the dark shoulder guard and dark trunks/wraps.
     6. The TAUNT pose (law 5, POSE-ANATOMY 1-5) — spine arched BACK in a C-curve from pelvis to
        skull, chest thrown open to the crowd, shoulders in opposition (guard-shoulder back-high,
        flexed-arm shoulder forward-high), hips tilted hard onto the weighted leg, head tipped
        back inviting the crowd — never an at-attention stance.

   POSE SENTENCE: weight cocked hard onto the right hip, spine arched back in one open C-curve
   from pelvis through chest to a tipped-back skull, the blade arm flung wide and open at chest
   height in a crowd-taunt invitation while the left arm snaps up flexed beside the ear, shoulders
   twisted in opposition under the one huge shoulder guard — the undefeated duelist selling the
   kill before he lands it.

   SPINE-GESTURE SENTENCE: hips shift right and rear, ribcage counter-rotates left and lifts, the
   spine bows backward through the chest so sternum leads skull, neck continues the arch tipping
   the head back — one continuous C-curve, no vertical plumb line anywhere along it.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w1'], cell 5, fn buildGladiator). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGladiator(){
  /* ---------- PALETTE (sun-baked tan skin + dark dust-leather trunks/wraps vs. one big dark
     bronze-and-steel shoulder guard — the law-3 value contrast rides skin-vs-guard rather than a
     painted stripe, so it survives dithering at any angle). ---------- */
  const P = {
    skin: 0xc99a68, skinLt: 0xe0bd8c, skinDk: 0x9c703f,     // sun-baked tan, pale highlight for value floor
    wrap: 0x2c2118, wrapDk: 0x1a130c,                         // dark leather trunks/wrist-wraps
    guard: 0x6a5638, guardDk: 0x3e321f, guardLt: 0x8a744c,    // big bronze-hide shoulder guard
    steel: 0xc8ccc0, steelDk: 0x82887a,                       // blade + rivets, near-white so it survives
    hair: 0x241a10, eye: 0x140f0c, mouth: 0x1a1210, teeth: 0xe8e0c8,
    disc: 0x362a1c, discTop: 0x413320,
  };

  /* ===== RIG — the spine gesture, authored FIRST as a curve function so every part hangs off
     the same C-arch (POSE-ANATOMY rule 1). t=0 at the hip, t=1 at the skull crown. ===== */
  const L = {
    hipY: 0.50, waistY: 0.60, ribY: 0.72, chestY: 0.84, shldY: 0.92, neckY: 0.965,
    jawY: 1.00, browY: 1.055, crownY: 1.10,
  };
  /* the C-curve: hips punch forward-right, chest bows BACK, head tips further back still —
     x sweeps right (weighted hip), z sweeps back-then-forward (the arch), continuously. */
  const spine = (p) => {
    const t = Math.max(0, Math.min(1, (p.y - L.hipY) / (L.crownY - L.hipY)));
    const hipPunch = Math.sin(Math.min(t, 0.35) / 0.35 * Math.PI / 2) * 0.028;
    const archBack = -0.032 * Math.sin(t * Math.PI * 0.85);
    const headTip = t > 0.75 ? (t - 0.75) / 0.25 * 0.030 : 0;
    return V(p.x + hipPunch, p.y, p.z + archBack - headTip);
  };

  /* ===== LEGS — straight athletic stance, weight cocked HARD onto the right leg (planted,
     nearly straight, hip driven out); left leg trails loose, knee bent, foot light (POSE-ANATOMY
     rule 4: counterpose or fall over). ===== */
  function leg(hip, knee, ankle, toeDir, hex, hexDk){
    tube(hip, knee, 0.082, 0.062, 9, hex);
    tube(knee, ankle, 0.062, 0.040, 9, hexDk, { phase: Math.PI / 9 });
    const ball = ankle.clone().addScaledVector(toeDir, 0.095).add(V(0, -0.052, 0));
    const heel = ankle.clone().addScaledVector(toeDir, -0.040).add(V(0, -0.048, 0));
    tube(ankle, ball, 0.044, 0.040, 7, hexDk);
    tube(ankle, heel, 0.034, 0.030, 6, hexDk, { capB: { hex: hexDk } });
    capFan(ring(ball, V(0, 1, 0), 0.040, 0.034, 6), ball.clone().addScaledVector(toeDir, 0.030).add(V(0, -0.006, 0)), hexDk);
  }
  /* weighted (right) leg — near-vertical, planted */
  leg(V(0.115, L.hipY, 0.01), V(0.128, 0.275, 0.045), V(0.122, 0.095, 0.030),
    V(0, 0, 1), P.skin, P.skinDk);
  /* trailing (left) leg — knee kicked out and bent, foot drawn back light. PASS-2 fix: the ankle
     was pulled back in -z far enough that the 45°-yaw camera projected it almost onto the
     weighted leg's screen column (both read as one center leg, killing the counterpose read) —
     ankle now continues the hip→knee sideways sweep (more -x, less -z) so it stays visually
     separated instead of curling back to center. */
  leg(V(-0.105, L.hipY - 0.01, -0.01), V(-0.155, 0.290, -0.100), V(-0.150, 0.140, -0.075),
    V(0.55, 0, -0.83).normalize(), P.skin, P.skinDk);

  /* dark leather trunks over the hips */
  {
    const hipRings = [
      ring(spine(V(0, L.hipY - 0.045, 0)), V(0, 1, 0), 0.155, 0.135, 10),
      ring(spine(V(0, L.hipY + 0.055, 0)), V(0, 1, 0), 0.170, 0.150, 10),
    ];
    stitch(hipRings, () => P.wrap);
    capFan(hipRings[1], spine(V(0, L.hipY + 0.055, 0)), P.wrapDk, true);
  }

  /* ===== TORSO — bare showman's chest/back, bowed through the C-curve, hips→shoulders in
     opposition (right hip forward, left shoulder forward = the twist). ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.150, rz: 0.130, hex: P.skinDk },
    { y: L.waistY, rx: 0.128, rz: 0.108, hex: P.skin },
    { y: L.ribY,   rx: 0.158, rz: 0.122, hex: P.skinLt },
    { y: L.chestY, rx: 0.178, rz: 0.136, hex: P.skinLt },
    { y: L.shldY,  rx: 0.192, rz: 0.126, hex: P.skin },
    { y: L.neckY,  rx: 0.062, rz: 0.058, hex: P.skinDk },
  ], 17, { xform: spine });

  /* the twist: shoulders yaw opposite the hips — approximate by nudging the top two torso
     rings sideways in x, layering a thin quad "counter-shrug" plane so the read survives even
     flat-faceted (cheap, no new rig math needed since the C-curve already carries y/z). */
  {
    const c = spine(V(-0.02, L.shldY - 0.01, 0.10));
    quad(V(c.x - 0.10, c.y - 0.05, c.z), V(c.x + 0.10, c.y - 0.05, c.z),
      V(c.x + 0.12, c.y + 0.07, c.z + 0.02), V(c.x - 0.12, c.y + 0.07, c.z + 0.02), P.skinLt, 0.05);
  }

  /* ===== HEAD — tipped back into the arch, jaw dropped in a crowd-taunt grin/shout. ===== */
  const jawC = spine(V(0.005, L.jawY, 0.02));
  const browC = spine(V(0.005, L.browY, -0.01));
  const crownC = spine(V(0.005, L.crownY, -0.03));
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.058, 0.062, 10),
    ring(spine(V(0.005, (L.jawY + L.browY) / 2, 0.01)), V(0, 1, 0), 0.072, 0.074, 10),
    ring(browC, V(0, 1, 0), 0.068, 0.066, 10),
    ring(crownC, V(0, 1, 0), 0.050, 0.048, 10),
  ];
  stitch(headRings, (b) => [P.skin, P.skinLt, P.skin][b] ?? P.skin);
  capFan(headRings[3], crownC.clone().add(V(0, 0.028, -0.012)), P.hair);

  /* open shouting mouth, tipped-back jaw */
  {
    const my = jawC.y + 0.006, mz = jawC.z + 0.052;
    quad(V(-0.024, my - 0.026, mz - 0.01), V(0.024, my - 0.026, mz - 0.01),
      V(0.026, my + 0.018, mz), V(-0.026, my + 0.018, mz), P.mouth, 0.04);
    quad(V(-0.018, my - 0.006, mz - 0.006), V(0.018, my - 0.006, mz - 0.006),
      V(0.018, my + 0.012, mz), V(-0.018, my + 0.012, mz), P.teeth, 0.05);
  }
  /* eyes */
  for(const s of [-1, 1]){
    const p = spine(V(s * 0.026 + 0.005, L.browY + 0.004, 0.045));
    blob(p.x, p.y, p.z, 0.010, 0.009, 0.008, P.eye, 5, 3);
  }
  /* short cropped hair cap */
  {
    const c = crownC.clone().add(V(0, 0.006, -0.01));
    blob(c.x, c.y, c.z, 0.052, 0.030, 0.052, P.hair, 6, 3);
  }

  /* ===== SHOULDER GUARD — the SIGNATURE, one huge asymmetric bronze-hide pauldron on the
     RIGHT shoulder, dwarfing the bare left shoulder (law 4's one loud feature). Riveted layered
     plates flaring up and out past the head's silhouette. ===== */
  const guardC = spine(V(0.185, L.shldY + 0.015, 0.01));
  {
    const plates = [
      { rx: 0.075, rz: 0.085, dy: -0.05 },
      { rx: 0.100, rz: 0.108, dy: 0.015 },
      { rx: 0.088, rz: 0.096, dy: 0.075 },
    ];
    const rings = plates.map((pl) => ring(guardC.clone().add(V(0.01, pl.dy, 0)), V(0.25, 1, -0.08), pl.rx, pl.rz, 10));
    stitch(rings, (b) => [P.guardDk, P.guard, P.guardLt][b] ?? P.guard);
    capFan(rings[2], guardC.clone().add(V(0.045, 0.125, -0.02)), P.guardLt);
    capFan(rings[0], guardC.clone().add(V(-0.01, -0.10, 0.02)), P.guardDk, true);
    /* rivet row — the steel tell against the dark hide */
    for(let i = 0; i < 4; i++){
      const t = i / 3;
      const p = guardC.clone().add(V(0.02 + t * 0.01, -0.03 + t * 0.14, 0.09));
      blob(p.x, p.y, p.z, 0.010, 0.010, 0.008, P.steel, 4, 2);
    }
  }

  /* ===== ARMS — POSE-ANATOMY rules 2-3: both elbows bent, shoulders ride with the gesture. ===== */
  function armSeg(shoulder, elbow, wrist, hex, hexDk){
    tube(shoulder, elbow, 0.052, 0.040, 8, hex);
    tube(elbow, wrist, 0.040, 0.030, 8, hexDk, { phase: Math.PI / 8 });
  }

  /* BLADE ARM (right, under the guard) — flung WIDE and open at chest height, elbow bent ~130°,
     never straight; the guard shoulder rides UP and BACK with it. */
  const rShoulder = spine(V(0.205, L.shldY - 0.01, 0.04));
  const rElbow = rShoulder.clone().add(V(0.135, 0.015, 0.075));
  const rWrist = rElbow.clone().add(V(0.145, 0.055, -0.035));
  armSeg(rShoulder, rElbow, rWrist, P.skin, P.skinDk);
  /* open hand — splayed fingers as short blob-capped tubes, palm-up inviting */
  {
    const palmDir = V(0.6, 0.3, -0.4).normalize();
    for(const s of [-1.4, -0.5, 0.5, 1.4]){
      const side = V(-palmDir.z, 0, palmDir.x).normalize();
      const tip = rWrist.clone().addScaledVector(palmDir, 0.055).addScaledVector(side, s * 0.014);
      tube(rWrist, tip, 0.012, 0.007, 4, P.skin, { capB: { hex: P.skin } });
    }
  }
  /* dueling blade — gripped loosely, angled out past the flung hand, riding the invitation line */
  {
    const hilt = rWrist.clone().addScaledVector(V(0.6, 0.3, -0.4).normalize(), 0.03);
    const tip = hilt.clone().add(V(0.20, 0.10, -0.08));
    tube(hilt, hilt.clone().add(V(0.03, -0.03, 0.01)), 0.014, 0.012, 5, P.wrapDk);
    tube(hilt, tip, 0.020, 0.004, 5, P.steel, { capB: { hex: P.steelDk } });
    const crossA = hilt.clone().add(V(0.02, 0.018, -0.006));
    const crossB = hilt.clone().add(V(-0.02, -0.018, 0.006));
    tube(crossA, crossB, 0.010, 0.010, 4, P.steelDk);
  }

  /* FLEXED ARM (left, bare) — snapped UP, fist near the ear, elbow sharply bent ~100°, shoulder
     dragged up-and-forward with it (POSE-ANATOMY rule 3). */
  const lShoulder = spine(V(-0.190, L.shldY + 0.005, 0.03));
  const lElbow = lShoulder.clone().add(V(-0.045, 0.115, 0.050));
  const lWrist = lElbow.clone().add(V(0.030, 0.095, -0.010));
  armSeg(lShoulder, lElbow, lWrist, P.skin, P.skinDk);
  /* flexed fist */
  blob(lWrist.x, lWrist.y + 0.018, lWrist.z, 0.026, 0.024, 0.024, P.skin, 6, 4);
  /* wrist wrap */
  {
    const c = lElbow.clone().lerp(lWrist, 0.85);
    ring(c, lWrist.clone().sub(lElbow).normalize(), 0.034, 0.034, 6);
  }
  quad(V(lElbow.x - 0.03, lElbow.y + 0.05, lElbow.z), V(lElbow.x + 0.03, lElbow.y + 0.05, lElbow.z),
    V(lElbow.x + 0.03, lElbow.y + 0.09, lElbow.z), V(lElbow.x - 0.03, lElbow.y + 0.09, lElbow.z), P.wrap, 0.05);

  /* ===== BELT — buckle at the hip line, ties torso to trunks. ===== */
  {
    const c = spine(V(0, L.hipY + 0.045, 0.10));
    const rings = [
      ring(spine(V(0, L.hipY + 0.020, 0)), V(0, 1, 0), 0.162, 0.142, 8),
      ring(spine(V(0, L.hipY + 0.058, 0)), V(0, 1, 0), 0.168, 0.148, 8),
    ];
    stitch(rings, () => P.wrapDk);
    blob(c.x, c.y, c.z, 0.024, 0.020, 0.012, P.steel, 5, 3);
  }

  /* trophy net — coiled and slung at the left hip, unused hand's trophy (arena showman detail,
     never wielded this pose — the taunt sells the fight, the net waits). */
  {
    const hipC = spine(V(-0.145, L.hipY + 0.02, 0.02));
    for(let i = 0; i < 5; i++){
      const a = i / 5 * Math.PI * 1.7;
      const r = 0.052 - i * 0.006;
      const c = hipC.clone().add(V(Math.cos(a) * r, i * 0.014, Math.sin(a) * r * 0.6));
      ring(c, V(0.2, 1, 0.3), 0.022 - i * 0.002, 0.022 - i * 0.002, 6);
    }
    stitch([0, 1, 2, 3, 4].map((i) => {
      const a = i / 5 * Math.PI * 1.7;
      const r = 0.052 - i * 0.006;
      const c = hipC.clone().add(V(Math.cos(a) * r, i * 0.014, Math.sin(a) * r * 0.6));
      return ring(c, V(0.2, 1, 0.3), 0.022 - i * 0.002, 0.022 - i * 0.002, 6);
    }), () => P.wrapDk);
  }

  /* second smaller pauldron strap across the chest, tying the big guard down (also breaks up
     the bare-chest plane with one more dark accent, cheap silhouette read). */
  {
    const a = spine(V(0.10, L.chestY + 0.02, 0.12));
    const b = spine(V(-0.06, L.waistY - 0.01, 0.10));
    tube(a, b, 0.020, 0.016, 5, P.wrap);
  }

  /* greave wraps — dark leather bands at both shins, tie the leg reading to the guard/wrap
     palette family and add the shin-detail the bare showman legs were missing. */
  for(const [hip, ankle] of [
    [V(0.115, L.hipY, 0.01), V(0.122, 0.095, 0.030)],
    [V(-0.105, L.hipY - 0.01, -0.01), V(-0.150, 0.140, -0.075)],
  ]){
    const shin = hip.clone().lerp(ankle, 0.72);
    ring(shin, V(0, 1, 0.15), 0.052, 0.052, 6);
    ring(shin.clone().add(V(0, -0.03, 0)), V(0, 1, 0.15), 0.050, 0.050, 6);
  }

  /* second guard plate row — a smaller flared plate riding OVER the main pauldron stack, pushing
     the signature's silhouette out further past the head (law 4, one loud feature made louder). */
  {
    const c2 = guardC.clone().add(V(0.035, 0.155, -0.03));
    const rings2 = [
      ring(c2, V(0.3, 1, -0.1), 0.052, 0.058, 7),
      ring(c2.clone().add(V(0.02, 0.045, -0.01)), V(0.3, 1, -0.1), 0.030, 0.034, 7),
    ];
    stitch(rings2, (b) => [P.guard, P.guardLt][b] ?? P.guard);
    capFan(rings2[1], c2.clone().add(V(0.03, 0.06, -0.015)), P.guardLt);
  }

  /* ===== BASE DISC ===== */
  {
    const rings = [
      ring(V(0, 0, 0), V(0, 1, 0), 0.42, 0.42, 16),
      ring(V(0, 0.018, 0), V(0, 1, 0), 0.42, 0.42, 16),
    ];
    stitch(rings, () => P.disc);
    capFan(rings[1], V(0, 0.018, 0), P.discTop);
  }
}
