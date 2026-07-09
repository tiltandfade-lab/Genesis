/* dev/model-qa/creatures/rlm-bright-flesh-golem.js — the FLESH GOLEM landmark table (HUMANOID
   family, CONSTRUCT-HUMANOID variant per ANATOMY-CANON's POSE-ANATOMY, Large, CR 7, realm
   bright-kingdom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot,
   bright-w1 cell 3, port 5353). Core identity: the flesh golem — the stitched-together brute.
   Bright-skin garnish: the Popcorn Machine Golem (data/realm-bestiary.js, CR7 Large,
   "overheated popcorn-machine golem hailing scalding kernels", stitched apron, chest-cavity
   vent) — the carnival read rides atop the CORE stitched-brute chassis, never replaces it.

   FEATURE CHECKLIST (the ~1,400-1,800 budget buys):
     1. CONSTRUCT-HUMANOID biped, Large: heavy-set torso, thick neck, no waist taper — a slab
        built for bludgeoning, not a showman's athletic frame.
     2. SIGNATURE — the STITCH SEAMS: pale raised lines crossing every tone boundary (arm-to-
        shoulder, torso panel joins, neck-to-head, leg-to-hip) — the loudest, highest-value
        read in the piece per law 4, carried at every joint so the "sewn together" identity
        reads before anything else.
     3. MISMATCHED LIMBS — one arm (right) visibly bigger and a different tone (pale grey-
        bruise donor skin) than the other (left, smaller, ruddier tan donor skin) — law 4's
        asymmetry beat, plus the direction's explicit call-out.
     4. Neck bolts — two stubby rivets at the base of the skull where the head was grafted on.
     5. The lurching grab: both mismatched arms reaching forward, mid-stumble, head lolled to
        one shoulder — law 5's high-expression pose, never an at-attention stance.
     6. Bright-kingdom garnish — a scorched stitched-apron panel over the chest with a dark
        vented cavity seam (the popcorn-machine chest cavity, kept as a chest DETAIL, not a
        body-plan change) plus a warm ember glow in the vent gap.

   POSE SENTENCE: mid-stumble forward lurch, weight pitched onto the leading (left) foot, both
   mismatched arms flung out and reaching, fingers splayed for the grab, head lolled heavy onto
   the right shoulder on a slack grafted neck — never balanced, never at rest, always one step
   from toppling into whatever it's reaching for.

   SPINE-GESTURE SENTENCE: hips drive forward and down onto the lead leg, the ribcage keeps
   pitching forward past the hips (a lean, not an arch — the golem is FALLING toward its
   target), the neck breaks the line entirely and lets the head slump sideways-down onto one
   shoulder — one continuous forward-toppling curve from pelvis to the loose, off-axis skull.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['bright-w1'], cell 3, fn buildFleshGolem). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildFleshGolem(){
  /* ---------- PALETTE (two donor-skin tones on the mismatched arms/shoulders — pale grey-
     bruise vs. ruddier tan — against a mid dead-flesh torso, with the STITCH SEAM pale-cream
     lines as the law-3 highest-value zone riding every tone boundary; the popcorn-golem chest
     panel is a small scorched-apron dark patch with a warm ember vent, garnish not identity). */
  const P = {
    flesh: 0x869068, fleshDk: 0x5e6a4a, fleshLt: 0xaab48c,   // dead-flesh torso/legs/head base, lightened for value floor vs the shadow disc
    armR: 0x8a8a92, armRDk: 0x5e5e66, armRLt: 0xa8a8b2,        // BIG right arm — pale grey-bruise donor skin
    armL: 0x9c7256, armLDk: 0x6e4e38, armLLt: 0xb98f6c,        // smaller left arm — ruddier tan donor skin
    seam: 0xf5ecd4, seamDk: 0xd4c8a2,                          // pale raised stitch-seam lines — the signature, pushed past the 140-RGB floor
    bolt: 0x8c8878, boltDk: 0x5a5648,                          // neck bolts, dull grafted-iron
    apron: 0x2c2620, apronDk: 0x181410, apronBurn: 0x40382c,   // bright-kingdom scorched stitched apron
    vent: 0x140d08, ember: 0xe8863a, emberLt: 0xffbd6e,        // chest-cavity vent + warm popcorn-ember glow
    eye: 0x100c08, eyeGlow: 0xc8b078,
    disc: 0x2a2620, discTop: 0x342e26,
  };

  /* ===== RIG — the forward-toppling lurch curve, authored FIRST (POSE-ANATOMY rule 1). t=0 at
     the hip, t=1 at the skull crown. Hips punch forward onto the lead foot; the ribcage keeps
     leaning PAST the hips (never arches back — this is a fall-forward, not a taunt); the neck
     breaks the line and dumps the head sideways onto one shoulder. ===== */
  const L = {
    hipY: 0.52, waistY: 0.64, ribY: 0.78, chestY: 0.92, shldY: 1.02, neckY: 1.075,
    jawY: 1.11, browY: 1.165, crownY: 1.21,
  };
  const spine = (p) => {
    const t = Math.max(0, Math.min(1, (p.y - L.hipY) / (L.crownY - L.hipY)));
    const hipPunch = Math.sin(Math.min(t, 0.30) / 0.30 * Math.PI / 2) * 0.030;
    const forwardLean = 0.058 * Math.sin(Math.min(t, 0.85) / 0.85 * Math.PI / 2);   // ribcage keeps pitching forward past hips
    const neckBreak = t > 0.82 ? (t - 0.82) / 0.18 * 0.070 : 0;                      // neck slumps further forward+down
    return V(p.x + hipPunch, p.y, p.z + forwardLean + neckBreak);
  };
  /* the head-loll: everything above the jaw also drifts sideways (+x) onto the right shoulder */
  const headLoll = (p) => {
    const t = Math.max(0, Math.min(1, (p.y - L.jawY) / (L.crownY - L.jawY)));
    return V(p.x + t * 0.075, p.y - t * 0.020, p.z);
  };

  /* ===== LEGS — heavy, planted-wide lurch stance: left leg leads and takes the weight (nearly
     straight, driven forward-down), right leg trails, knee bent, dragging into the stumble
     (POSE-ANATOMY rule 4: counterpose or fall over — here the "fall" IS the pose, so the trail
     leg reads as the half-caught stumble rather than balance). ===== */
  function leg(hip, knee, ankle, toeDir, hex, hexDk){
    tube(hip, knee, 0.105, 0.082, 9, hex);
    tube(knee, ankle, 0.082, 0.058, 9, hexDk, { phase: Math.PI / 9 });
    const ball = ankle.clone().addScaledVector(toeDir, 0.100).add(V(0, -0.060, 0));
    const heel = ankle.clone().addScaledVector(toeDir, -0.045).add(V(0, -0.056, 0));
    tube(ankle, ball, 0.056, 0.050, 7, hexDk);
    tube(ankle, heel, 0.044, 0.038, 6, hexDk, { capB: { hex: hexDk } });
    capFan(ring(ball, V(0, 1, 0), 0.050, 0.044, 6), ball.clone().addScaledVector(toeDir, 0.034).add(V(0, -0.008, 0)), hexDk);
  }
  /* lead (left) leg — planted forward, near-vertical, taking the falling weight */
  leg(V(-0.125, L.hipY, 0.05), V(-0.140, 0.290, 0.155), V(-0.132, 0.100, 0.135),
    V(0, 0, 1), P.flesh, P.fleshDk);
  /* trailing (right) leg — kicked back, knee bent, dragging into the stumble */
  leg(V(0.120, L.hipY - 0.01, -0.02), V(0.150, 0.300, -0.140), V(0.140, 0.130, -0.190),
    V(-0.25, 0, -0.97).normalize(), P.flesh, P.fleshDk);

  /* stitch seams at the hip-to-leg joints */
  for(const s of [-1, 1]){
    const c = spine(V(s * 0.13, L.hipY, s > 0 ? -0.02 : 0.05));
    const ringPts = ring(c, V(0, 1, 0), 0.10, 0.09, 8);
    for(let i = 0; i < ringPts.length; i += 2){
      const a = ringPts[i], b = ringPts[(i + 1) % ringPts.length];
      quad(a.clone().add(V(0, 0.028, 0)), b.clone().add(V(0, 0.028, 0)),
        b.clone().add(V(0, -0.028, 0)), a.clone().add(V(0, -0.028, 0)), i % 4 === 0 ? P.seam : P.seamDk, 0.03);
    }
  }

  /* ===== TORSO — heavy-set slab, no waist taper, leaning forward through the toppling curve.
     Panel-join stitch seams (law-4 signature) cross the tone boundaries at rib/chest/shoulder
     bands. ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.185, rz: 0.155, hex: P.fleshDk },
    { y: L.waistY, rx: 0.195, rz: 0.160, hex: P.flesh },
    { y: L.ribY,   rx: 0.215, rz: 0.175, hex: P.fleshLt },
    { y: L.chestY, rx: 0.230, rz: 0.185, hex: P.flesh },
    { y: L.shldY,  rx: 0.245, rz: 0.180, hex: P.fleshDk },
    { y: L.neckY,  rx: 0.078, rz: 0.074, hex: P.fleshDk },
  ], 16, { xform: spine });

  /* torso stitch seams — horizontal pale-line bands riding the rib/chest/shoulder panel joins,
     the highest-value zone in the piece (law 3) */
  for(const y of [L.ribY - 0.01, L.chestY - 0.01, L.shldY - 0.008]){
    const rA = ring(spine(V(0, y - 0.026, 0)), V(0, 1, 0), 0.205, 0.172, 12);
    const rB = ring(spine(V(0, y + 0.026, 0)), V(0, 1, 0), 0.215, 0.182, 12);
    stitch([rA, rB], (b, i) => (i % 2 === 0) ? P.seam : P.seamDk);
  }
  /* vertical center-seam running the spine of the torso (the "sewn shut" line) */
  {
    const top = spine(V(0.002, L.shldY - 0.01, 0.13));
    const bot = spine(V(0.002, L.hipY + 0.03, 0.11));
    for(let i = 0; i < 6; i++){
      const t0 = i / 6, t1 = (i + 1) / 6;
      const p0 = top.clone().lerp(bot, t0), p1 = top.clone().lerp(bot, t1);
      const off = V(0.026, 0, 0);
      quad(p0.clone().sub(off), p0.clone().add(off), p1.clone().add(off), p1.clone().sub(off),
        i % 2 === 0 ? P.seam : P.seamDk, 0.04);
    }
  }

  /* ===== BRIGHT-KINGDOM GARNISH — scorched stitched apron panel over the chest with a dark
     vented cavity + warm ember glow (the popcorn-machine chest cavity, kept as a chest detail
     layered ON the core stitched-brute chassis). ===== */
  {
    const c = spine(V(0, L.chestY - 0.02, 0.185));
    const rings = [
      ring(spine(V(0, L.ribY + 0.02, 0)), V(0, 0, 1), 0.13, 0.02, 10),
      ring(spine(V(0, L.chestY + 0.03, 0)), V(0, 0, 1), 0.15, 0.02, 10),
    ];
    stitch(rings, () => P.apron);
    capFan(rings[1], spine(V(0, L.chestY + 0.045, 0.20)), P.apronBurn);
    /* dark vent slit + ember glow */
    quad(c.clone().add(V(-0.045, -0.03, 0.006)), c.clone().add(V(0.045, -0.03, 0.006)),
      c.clone().add(V(0.045, 0.03, 0.006)), c.clone().add(V(-0.045, 0.03, 0.006)), P.vent, 0.03);
    blob(c.x, c.y, c.z + 0.012, 0.030, 0.018, 0.010, P.ember, 5, 3);
    blob(c.x, c.y + 0.006, c.z + 0.018, 0.016, 0.010, 0.006, P.emberLt, 4, 2);
    /* apron stitch trim */
    for(const s of [-1, 1]){
      const p = spine(V(s * 0.12, L.chestY - 0.04, 0.19));
      quad(p.clone().add(V(-0.012, -0.05, 0)), p.clone().add(V(0.012, -0.05, 0)),
        p.clone().add(V(0.012, 0.05, 0)), p.clone().add(V(-0.012, 0.05, 0)), P.seamDk, 0.04);
    }
  }

  /* ===== HEAD — grafted onto a slack, broken neck line, lolled heavy onto the right shoulder
     (headLoll carries every point above the jaw sideways+down). Neck bolts flank the base of
     the skull where it was sewn on. ===== */
  const jawC = headLoll(spine(V(0.005, L.jawY, 0.05)));
  const browC = headLoll(spine(V(0.005, L.browY, 0.02)));
  const crownC = headLoll(spine(V(0.005, L.crownY, -0.01)));
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.072, 0.078, 10),
    ring(headLoll(spine(V(0.005, (L.jawY + L.browY) / 2, 0.035))), V(0, 1, 0), 0.088, 0.090, 10),
    ring(browC, V(0, 1, 0), 0.082, 0.080, 10),
    ring(crownC, V(0, 1, 0), 0.060, 0.058, 10),
  ];
  stitch(headRings, (b) => [P.fleshDk, P.flesh, P.fleshLt][b] ?? P.flesh);
  capFan(headRings[3], crownC.clone().add(V(0, 0.024, -0.010)), P.fleshDk);

  /* skull-graft stitch seam ringing the neck-to-head join */
  {
    const rA = ring(headLoll(spine(V(0.005, L.jawY - 0.030, 0.02))), V(0, 1, 0), 0.076, 0.082, 10);
    const rB = ring(headLoll(spine(V(0.005, L.jawY + 0.024, 0.025))), V(0, 1, 0), 0.080, 0.084, 10);
    stitch([rA, rB], (b, i) => (i % 2 === 0) ? P.seam : P.seamDk);
  }
  /* neck bolts — two stubby rivets flanking the base of the skull */
  for(const s of [-1, 1]){
    const p = headLoll(spine(V(s * 0.062, L.jawY - 0.010, 0.03)));
    blob(p.x, p.y, p.z, 0.020, 0.016, 0.018, P.bolt, 5, 3);
    blob(p.x + s * 0.014, p.y, p.z, 0.010, 0.010, 0.010, P.boltDk, 4, 2);
  }

  /* slack half-open mouth, dull unfocused eyes */
  {
    const my = jawC.y - 0.010, mz = jawC.z + 0.062;
    quad(V(jawC.x - 0.026, my - 0.014, mz), V(jawC.x + 0.026, my - 0.014, mz),
      V(jawC.x + 0.024, my + 0.010, mz + 0.006), V(jawC.x - 0.024, my + 0.010, mz + 0.006), P.vent, 0.04);
  }
  for(const s of [-1, 1]){
    const p = browC.clone().add(V(s * 0.030, 0.006, 0.058));
    blob(p.x, p.y, p.z, 0.011, 0.010, 0.009, P.eye, 5, 3);
    blob(p.x, p.y + 0.002, p.z + 0.004, 0.004, 0.004, 0.004, P.eyeGlow, 3, 2);
  }

  /* ===== ARMS — MISMATCHED per the direction: RIGHT arm big + pale grey-bruise donor skin,
     LEFT arm smaller + ruddier tan donor skin. Both flung forward in the lurching grab, elbows
     bent (POSE-ANATOMY rule 2), shoulders riding up with the forward reach (rule 3), fingers
     splayed wide for the grasp. Stitch seams ring both shoulder grafts (law-4 signature). ===== */
  function armSeg(shoulder, elbow, wrist, ra, rb, rc, hex, hexDk){
    tube(shoulder, elbow, ra, rb, 9, hex);
    tube(elbow, wrist, rb, rc, 9, hexDk, { phase: Math.PI / 9 });
  }
  function reachHand(wr, dir, hex, spread){
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), dir).normalize();
    blob(wr.x, wr.y, wr.z, spread * 0.30, spread * 0.26, spread * 0.28, hex, 6, 4);
    for(const s of [-1.3, -0.5, 0.5, 1.3]){
      const spr = dir.clone().addScaledVector(side, s * 0.32).normalize();
      const mid = wr.clone().addScaledVector(spr, spread * 0.55);
      const tip = wr.clone().addScaledVector(spr, spread * 1.05);
      tube(wr, mid, spread * 0.20, spread * 0.15, 4, hex);
      tube(mid, tip, spread * 0.15, spread * 0.05, 4, hex, { capB: { hex } });
    }
  }
  function shoulderSeam(c, rx, rz){
    const rA = ring(c.clone().add(V(0, -0.028, 0)), V(1, 0.2, 0), rx * 0.94, rz * 0.94, 8);
    const rB = ring(c.clone().add(V(0, 0.028, 0)), V(1, 0.2, 0), rx, rz, 8);
    stitch([rA, rB], (b, i) => (i % 2 === 0) ? P.seam : P.seamDk);
  }

  /* RIGHT arm — the BIG one, pale grey-bruise donor skin, reaching forward-left across the
     body (crossing toward the grab target), elbow bent ~120deg, shoulder driven up-forward. */
  {
    const sh = spine(V(0.235, L.shldY - 0.02, 0.05));
    const el = sh.clone().add(V(0.075, -0.045, 0.235));
    const wr = el.clone().add(V(-0.060, -0.010, 0.230));
    armSeg(sh, el, wr, 0.088, 0.068, 0.052, P.armR, P.armRDk);
    reachHand(wr, V(-0.20, -0.05, 0.98).normalize(), P.armR, 0.075);
    shoulderSeam(sh, 0.095, 0.088);
  }
  /* LEFT arm — the smaller one, ruddier tan donor skin, reaching forward-right, elbow bent
     ~110deg, shoulder likewise driven up-forward but the whole limb reads visibly slighter. */
  {
    const sh = spine(V(-0.215, L.shldY - 0.015, 0.045));
    const el = sh.clone().add(V(-0.050, -0.040, 0.205));
    const wr = el.clone().add(V(0.045, -0.005, 0.205));
    armSeg(sh, el, wr, 0.066, 0.052, 0.040, P.armL, P.armLDk);
    reachHand(wr, V(0.16, -0.04, 0.99).normalize(), P.armL, 0.058);
    shoulderSeam(sh, 0.078, 0.072);
  }

  /* base disc (Large: r=0.55) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.55, 0.55, 18);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.53, 0.53, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
