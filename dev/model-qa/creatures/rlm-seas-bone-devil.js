/* dev/model-qa/creatures/rlm-seas-bone-devil.js — the BONE DEVIL landmark table (FIEND family,
   Large, CR 9, realm high-seas), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry pilot, seas-w2 cell 4). Core identity: the boarding-fiend contracted for one raid,
   bitter about the fine print — a skeletal exoskeletal devil whose SCORPION HOOK-TAIL is the
   signature. Bespoke to the render key "bone-devil" — realm reskins ride this chassis
   narratively; pulled from data/realm-bestiary.js's "Boarding-Fiend Bone Devil" entry (Contract
   Claw / Infernal Sting, litigious-under-contract flavor).

   FEATURE CHECKLIST (the ~1,700 budget buys):
     1. Exoskeletal bone-plate biped body — segmented plate-stack torso/limbs (no soft flesh
        reads; every band is a hard plate edge, not a smooth taper), digitigrade-leaning legs
        ending in 3-claw talons.
     2. SIGNATURE — the scorpion HOOK-TAIL, rooted at the hip, arced up and OVER the near
        shoulder, cocked high and forward like a raised weapon about to come down, barbed black
        stinger at the tip (law 4's one loud exaggerated feature, the "skeletal devil with the
        scorpion hook-tail" identity line).
     3. One arm extended forward, talon open, PALM-UP — the contract-enforcement gesture ("pay
        me"): forearm level, wrist rotated so the three claws splay upward/forward instead of
        down, an empty offered hand.
     4. Insectile wing stubs — small chitinous vestigial wing-nubs folded flat against the
        shoulder blades (not full flight wings — stubs, per the anatomy line).
     5. Gaunt bone-plate skull — sunken dark eye sockets, a fang-lined jaw set in a flat
        litigious scowl, small backswept horn nubs.
     6. Pale bone-plate value ladder — the whole body reads BRIGHT bone against the void (law 3's
        high-value zone is not one patch here, it's the base material), with dark red-black
        joint creases/gaps between plates carrying the shadow read, and the tail barb picking up
        the same pale plate tone so the signature doesn't go dark-on-dark.

   POSE SENTENCE: looming forward off the hips onto a braced front leg, the off-hand talon
   flung out and open palm-up presenting the (unpaid) terms of the contract, the hook-tail
   arced high over the same-side shoulder and cocked forward like a blade about to fall, wing
   stubs cracked slightly open for balance — the boarding-fiend collecting on a raid nobody
   read the fine print on, never a standing idle stance.

   Whole-object grammar: one function, one merged geometry frame, no anchors. Spine +z (front),
   up +y, ground y=0. Imported by ps1-sheet.html (SETS['seas-w2'], cell 4, fn buildBoneDevil). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';

export function buildBoneDevil(){
  /* ---------- PALETTE (pale bone plates reading BRIGHT against the void — law 3's contrast
     lives in the base material, not one patch; dark red-black joint creases carry the shadow
     read between plates; the tail barb + horn nubs share the same dark-horn tone so they read
     as one material family). ---------- */
  const P = {
    bone: 0xd6cdb0, boneLt: 0xe8e0c4, boneDk: 0xb0a686,          // pale plate ladder (the law-3 zone)
    crease: 0x4a2420, creaseDk: 0x2e1512,                        // dark joint/gap creases between plates
    horn: 0x241914, hornLt: 0x362518,                            // horn nubs + stinger barb
    eye: 0x120b09, eyeGlow: 0xb8321c,                            // sunken sockets, litigious ember glow
    mouth: 0x160c0a, fang: 0xece4cc,
    claw: 0x241914,
    wing: 0x5a2e26, wingDk: 0x3a1c17,                            // chitinous wing-stub membrane
    disc: 0x2c2420, discTop: 0x362c26,
  };
  setChannels({
    [P.bone]: 'bone', [P.boneLt]: 'bone', [P.boneDk]: 'bone',
    [P.crease]: 'skin', [P.creaseDk]: 'skin',
    [P.horn]: 'bone', [P.hornLt]: 'bone',
    [P.claw]: 'bone', [P.wing]: 'leather', [P.wingDk]: 'leather',
  });

  /* ===== RIG — Large biped, looming forward off the hips (law 5's pose). ===== */
  const L = {
    hipY: 0.50, waistY: 0.60, ribY: 0.72, chestY: 0.85, shldY: 0.96, neckY: 1.00,
    jawY: 1.04, cheekY: 1.10, browY: 1.155, crownY: 1.20,
    hipHalf: 0.145, shoulderX: 0.235,
  };
  /* forward loom — hips push forward/down slightly, shoulders lead further forward than the
     hips (the "looming" read), never a vertical T-stance spine. */
  const loom = (p) => {
    const t = Math.max(0, (p.y - L.hipY) / (L.crownY - L.hipY));
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1, 0, 0), -0.16 * t);
    return q.add(V(0, L.hipY, 0)).add(V(0, 0, 0.02 * t));
  };

  /* ===== LEGS — digitigrade-leaning plate-armored legs, front leg braced forward taking the
     loom's weight, back leg trailing. 3-claw talon feet. ===== */
  function leg(hip, knee, ankle, toeDir, front){
    tube(hip, knee, 0.100, 0.072, 7, P.bone);
    quad(V(hip.x - 0.06, hip.y, hip.z + 0.05), V(hip.x + 0.06, hip.y, hip.z + 0.05),
      V(hip.x + 0.05, hip.y - 0.03, hip.z + 0.02), V(hip.x - 0.05, hip.y - 0.03, hip.z + 0.02), P.crease, 0.05);
    tube(knee, ankle, 0.068, 0.040, 7, P.boneDk, { phase: Math.PI / 7 });
    /* dark crease ring at the knee joint */
    quad(V(knee.x - 0.055, knee.y + 0.01, knee.z), V(knee.x + 0.055, knee.y + 0.01, knee.z),
      V(knee.x + 0.048, knee.y - 0.018, knee.z), V(knee.x - 0.048, knee.y - 0.018, knee.z), P.crease, 0.05);
    const heel = ankle.clone().addScaledVector(toeDir, -0.055).add(V(0, -0.010, 0));
    const ball = ankle.clone().addScaledVector(toeDir, 0.085).add(V(0, -0.050, 0));
    tube(ankle, ball, 0.046, 0.042, 6, P.bone);
    tube(ankle, heel, 0.034, 0.020, 5, P.bone, { capB: { hex: P.bone } });
    const sideAxis = new THREE.Vector3().crossVectors(V(0, 1, 0), toeDir).normalize();
    for(const s of [-1, 0, 1]){
      const spread = toeDir.clone().addScaledVector(sideAxis, s * 0.5).normalize();
      const mid = ball.clone().addScaledVector(spread, 0.040).add(V(0, -0.004, 0));
      const tip = ball.clone().addScaledVector(spread, 0.088).add(V(0, -0.008, 0));
      tube(ball, mid, 0.022, 0.017, 4, P.boneDk);
      tube(mid, tip, 0.017, 0.006, 4, P.claw, { capB: { hex: P.claw } });
    }
    if(front){
      /* forward-braced leg gets a small forward-lean shin plate flare (weight-taking read) */
      quad(V(knee.x - 0.05, knee.y - 0.05, knee.z + 0.04), V(knee.x + 0.05, knee.y - 0.05, knee.z + 0.04),
        V(knee.x + 0.04, knee.y - 0.11, knee.z + 0.06), V(knee.x - 0.04, knee.y - 0.11, knee.z + 0.06), P.boneLt, 0.05);
    }
  }
  /* front (right) leg — braced forward, the weight-bearing loom leg */
  leg(V(0.145, L.hipY, 0.02), V(0.185, 0.275, 0.190), V(0.155, 0.165, 0.170),
    V(0.15, 0, 0.99).normalize(), true);
  /* back (left) leg — trailing */
  leg(V(-0.145, L.hipY, -0.03), V(-0.190, 0.270, -0.060), V(-0.165, 0.160, -0.030),
    V(-0.15, 0, 0.99).normalize(), false);

  /* ===== TORSO — exoskeletal plate-stack, narrow waist to broad shoulders, hard plate edges
     (not smoothed) so every band reads as a distinct armor segment. ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.150, rz: 0.125, hex: P.boneDk },
    { y: L.waistY, rx: 0.132, rz: 0.108, hex: P.bone },
    { y: L.ribY,   rx: 0.158, rz: 0.128, hex: P.boneDk },
    { y: L.chestY, rx: 0.185, rz: 0.148, hex: P.boneLt },
    { y: L.shldY,  rx: 0.205, rz: 0.140, hex: P.bone },
    { y: L.neckY,  rx: 0.075, rz: 0.068, hex: P.boneDk },
  ], 8, { xform: loom });

  /* dark joint-crease rungs between plate bands — the shadow read between the bright plates */
  {
    const rungs = [
      [L.waistY, 0.108], [L.ribY, 0.128], [L.chestY, 0.148],
    ];
    for(const [y, rz] of rungs){
      const c = loom(V(0, y - 0.025, rz * 1.01));
      const w = rz * 0.55, h = 0.018;
      quad(V(c.x - w, c.y - h, c.z), V(c.x + w, c.y - h, c.z), V(c.x + w * 0.85, c.y + h, c.z), V(c.x - w * 0.85, c.y + h, c.z), P.crease, 0.04);
    }
  }

  /* ridge of small dorsal plate spikes climbing the spine — reinforces the exoskeletal read
     and breaks the back silhouette (cheap tri cost, echoes the tail's plate material). */
  {
    const spikeYs = [L.hipY + 0.02, L.waistY, L.ribY, L.chestY];
    for(const y of spikeYs){
      const base = loom(V(0, y, -0.115));
      const tip = base.clone().add(V(0, 0.055, -0.030));
      tube(base, tip, 0.022, 0.006, 4, P.boneDk, { capB: { hex: P.hornLt } });
    }
  }

  /* ===== HEAD — gaunt bone-plate skull, sunken sockets, fang-lined scowl, backswept horn
     nubs. ===== */
  const jawC = loom(V(0, L.jawY, 0.075));
  const cheekC = loom(V(0, L.cheekY, 0.092));
  const browC = loom(V(0, L.browY, 0.066));
  const crownC = loom(V(0, L.crownY, 0.030));
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.068, 0.092, 8, Math.PI / 8),
    ring(cheekC, V(0, 1, 0), 0.088, 0.108, 8, Math.PI / 8),
    ring(browC, V(0, 1, 0), 0.096, 0.086, 8, Math.PI / 8),
    ring(crownC, V(0, 1, 0), 0.066, 0.058, 8, Math.PI / 8),
  ];
  stitch(headRings, (b) => [P.bone, P.boneLt, P.bone][b] ?? P.bone);
  capFan(headRings[3], crownC.clone().add(V(0, 0.024, -0.010)), P.boneDk);

  /* sunken dark eye sockets (recess, not a painted glow patch) with a small litigious ember
     deep inside — the "annoyed" character beat, kept small so it doesn't fight the tail
     signature for attention. */
  for(const s of [-1, 1]){
    const p = loom(V(s * 0.055, L.browY - 0.006, 0.070));
    quad(p.clone().add(V(-0.022, -0.016, 0)), p.clone().add(V(0.022, -0.016, 0)),
      p.clone().add(V(0.018, 0.018, -0.010)), p.clone().add(V(-0.018, 0.018, -0.010)), P.eye, 0.03);
    blob(p.x, p.y - 0.002, p.z - 0.006, 0.009, 0.008, 0.007, P.eyeGlow, 4, 2);
  }

  /* jaw — dropped in a flat fanged scowl, not a wide roar (the litigious/bitter read, distinct
     from the baron's war-cry) */
  {
    const my = jawC.y - 0.006, mz = jawC.z + 0.052;
    quad(V(-0.036, my - 0.040, mz - 0.02), V(0.036, my - 0.040, mz - 0.02), V(0.044, my + 0.018, mz), V(-0.044, my + 0.018, mz), P.mouth, 0.03);
    for(const s of [-1, 1]){
      const fx = s * 0.028;
      tube(V(fx, my + 0.014, mz + 0.006), V(fx, my - 0.030, mz - 0.006), 0.009, 0.002, 4, P.fang, { capB: { hex: P.fang } });
    }
  }

  /* small backswept horn nubs */
  for(const s of [-1, 1]){
    const hb = loom(V(s * 0.048, L.crownY - 0.005, -0.005));
    const ht = hb.clone().add(V(s * 0.055, 0.075, -0.075));
    tube(hb, ht, 0.020, 0.005, 5, P.horn, { capA: { hex: P.hornLt } });
  }

  /* ===== SIGNATURE (4) — insectile wing stubs, folded flat chitinous nubs against the
     shoulder blades. Kept small/flat so they read as VESTIGIAL, never competing with the
     tail's silhouette claim. ===== */
  for(const s of [-1, 1]){
    const base = loom(V(s * 0.185, L.shldY - 0.03, -0.06));
    const tip = base.clone().add(V(s * 0.075, 0.030, -0.115));
    const mid = base.clone().add(V(s * 0.010, 0.045, -0.015));
    quad(base, mid, tip, tip, P.wing, 0.05);
    quad(mid, base, tip, tip, P.wingDk, 0.05);
  }

  /* ===== SIGNATURE (2) — one arm extended forward, talon open PALM-UP (the contract
     gesture): wrist rotated so the three claws splay upward/forward off an offered flat
     hand, not curled down into a fist. Off arm held back/low, claws loosely curled, ready. */
  {
    /* extended talon arm (right) — R2 SELF-CORRECTION (post r1 engine render): r1's elbow/wrist
       target (0.36..0.56, z 0.23..0.36) pushed +x and +z together, and this camera's ~45° yaw
       dimetric projects screen-x as (x - z) — moving both together cancels out, so the whole arm
       foreshortened into a small blob hugging the chest (confirmed: r1 crop showed no separate
       reaching-arm silhouette). Re-aimed the reach almost fully lateral (+x) with the wrist
       pulled BACK toward the shoulder's own z (little forward push) so screen-x actually grows —
       reads as a level offered arm breaking the torso's side silhouette instead of receding into
       the camera. */
    const sh = loom(V(L.shoulderX, L.shldY - 0.01, 0.02));
    const el = V(0.440, 0.905, 0.030);
    const wr = V(0.660, 0.865, -0.030);
    tube(sh, el, 0.066, 0.052, 6, P.bone);
    tube(el, wr, 0.050, 0.036, 6, P.boneDk, { phase: Math.PI / 6 });
    /* flat offered palm plate, facing UP (+y normal) */
    const palmC = wr.clone().add(V(0.032, -0.006, 0.010));
    quad(palmC.clone().add(V(-0.030, 0, -0.024)), palmC.clone().add(V(0.030, 0, -0.024)),
      palmC.clone().add(V(0.026, 0, 0.030)), palmC.clone().add(V(-0.026, 0, 0.030)), P.boneLt, 0.04);
    /* three claws splaying up-and-outward off the palm, not down */
    const clawDirs = [[0.55, 0.55, 0.50], [0.72, 0.60, 0.10], [0.55, 0.50, -0.30]];
    for(const d of clawDirs){
      const dn = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      const mid = palmC.clone().addScaledVector(dn, 0.045);
      const tip = palmC.clone().addScaledVector(dn, 0.095);
      tube(palmC, mid, 0.017, 0.012, 4, P.boneDk);
      tube(mid, tip, 0.012, 0.005, 4, P.claw, { capB: { hex: P.claw } });
    }
  }
  {
    /* off talon arm (left) — held back/low, claws loosely curled, ready posture */
    const sh = loom(V(-L.shoulderX, L.shldY - 0.02, -0.01));
    const el = V(-0.300, 0.680, -0.100);
    const wr = V(-0.330, 0.500, -0.040);
    tube(sh, el, 0.066, 0.052, 6, P.boneDk);
    tube(el, wr, 0.050, 0.036, 6, P.bone, { phase: Math.PI / 6 });
    blob(wr.x, wr.y, wr.z, 0.032, 0.026, 0.030, P.boneDk, 6, 4);
    const clawDirs = [[-0.60, -0.35, 0.60], [-0.75, -0.15, 0.45], [-0.55, -0.55, 0.35]];
    for(const d of clawDirs){
      const dn = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      const mid = wr.clone().addScaledVector(dn, 0.038);
      const tip = wr.clone().addScaledVector(dn, 0.078);
      tube(wr, mid, 0.015, 0.010, 4, P.boneDk);
      tube(mid, tip, 0.010, 0.004, 4, P.claw, { capB: { hex: P.claw } });
    }
  }

  /* ===== SIGNATURE (1, the loud one) — scorpion HOOK-TAIL: rooted at the hip, climbing up
     the spine and OVER the near (right) shoulder, cocked high and forward like a raised
     blade, barbed black stinger at the tip. Plate segments matching the bone-ladder tone so
     the signature carries law-3's value contrast instead of vanishing dark-on-dark. ===== */
  {
    const t0 = loom(V(0.02, L.hipY + 0.01, -0.115));
    const t1 = V(0.075, L.ribY + 0.10, -0.275);
    const t2 = V(0.145, L.shldY + 0.34, -0.230);
    const t3 = V(0.210, L.crownY + 0.42, -0.020);
    const t4 = V(0.230, L.crownY + 0.28, 0.150);
    tube(t0, t1, 0.082, 0.062, 7, P.bone, { capA: { hex: P.boneDk } });
    tube(t1, t2, 0.062, 0.044, 7, P.boneDk, { phase: Math.PI / 7 });
    tube(t2, t3, 0.044, 0.030, 7, P.bone, { phase: Math.PI / 7 });
    tube(t3, t4, 0.030, 0.022, 6, P.boneLt);
    /* plate-joint crease rings at each tail bend — echoes the torso's plate/crease ladder */
    for(const j of [t1, t2, t3]){
      quad(j.clone().add(V(-0.040, 0.012, 0)), j.clone().add(V(0.040, 0.012, 0)),
        j.clone().add(V(0.034, -0.014, 0)), j.clone().add(V(-0.034, -0.014, 0)), P.crease, 0.05);
    }
    /* barbed black stinger — R2 SELF-CORRECTION (post r1 engine render): r1's hook reached far
       out at radius 0.002-0.01 (well under the law-3 ~0.04u floor) AND detached from the main
       tail arc by a wide gap — it sampled as void, invisible. Pulled the hook in tight against
       t4 (curling DOWN-and-inward toward the chest, "cocked forward like a blade about to
       fall" per the pose sentence) and thickened every radius so it reads as a stubby hooked
       barb continuing the tail's silhouette instead of a detached needle. */
    const hookMid = t4.clone().add(V(-0.020, -0.100, 0.075));
    const hookTip = hookMid.clone().add(V(-0.045, -0.110, 0.030));
    tube(t4, hookMid, 0.022, 0.016, 5, P.horn);
    tube(hookMid, hookTip, 0.016, 0.007, 5, P.horn, { capB: { hex: P.hornLt } });
    /* a few short barbs along the tail's outer curve, matching the spine-ridge material */
    for(const [p, dir] of [[t1, V(0.5, 0.2, -0.6)], [t2, V(0.4, 0.4, -0.5)], [t3, V(0.3, 0.5, -0.3)]]){
      const dn = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
      const base = p.clone();
      const tip = base.clone().addScaledVector(dn, 0.055);
      tube(base, tip, 0.016, 0.004, 4, P.horn);
    }
  }

  /* base disc (Large: r=0.55, matches sahuagin-baron's Large disc) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.55, 0.55, 18);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.53, 0.53, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.058, 0), P.discTop);
  }
}
