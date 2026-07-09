/* dev/model-qa/creatures/rlm-bright-clay-golem.js — CLAY GOLEM (bright-kingdom, Large Construct,
   CR 10), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, bright-w1
   cell 4, port 5354). Core identity: the "lost-and-found effigy" — a soft-edged, finger-molded
   clay body still bearing the maker's drag-marks, sagging out of shape from its own weight and
   age. Bespoke to the render key "clay-golem" — distinct from the iron golem (plate/rivet) and
   flesh golem (stitched meat) chassis: this is wet clay, unbaked, ANATOMY-CANON HUMANOID kit
   read but soft/rounded rather than muscled, no hard edges anywhere.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. CONSTRUCT-HUMANOID soft-clay body: rounded, finger-pressed forms throughout (torso, gut,
        limbs, head) — no flat planes, no sharp corners; every mass reads as pinched/pressed clay.
     2. SAGGING gut and losing-shape arms/shoulders — the belly bulges and droops BELOW the waist
        line (clay slumping under its own weight), the upper arms sag loose off the shoulder
        rather than reading as taut muscle mass.
     3. SIGNATURE (law 4, loudest feature) — FINGER-GROOVE bands: lighter dragged terracotta
        lines raked across torso, gut, shoulders, and thighs (the maker's fingers, still visible
        in the clay) — the law-3 high-value zone, carried in a pale terracotta well above the
        base clay tone so it reads first at a squint.
     4. SECONDARY signature — the MELT-HAND: the trailing (rear-swing) arm's fingers are fusing
        back into a single clay mass mid-stride, one blunt fused lobe with two shallow finger
        seams still legible and a thin drip tendril hanging off the heel of the hand — captured
        as an action (the melt is happening AS it walks), not a static stump.
     5. Blank golem face — no carved eyes/mouth; two shallow pressed-thumb divots for eye
        sockets and a single dragged groove for a mouth-seam, jowls sagging past the jawline.
     6. Terracotta value ladder: dark unfired clay base, a mid terracotta body tone, and the
        pale finger-groove highlight — distinct register from iron's grey-steel and flesh's
        pink/grey palette on the same wave sheet.

   POSE SENTENCE: the relentless walk — mid-stride, forward (right) leg planted and weight-
   loaded, trailing (left) leg dragging back off the ground, both arms swinging heavy and low
   with the counter-swing (left arm forward, right arm trailing back mid-melt), spine leaning
   forward into the plod, head hung slightly down and forward — never a standing-still pose, the
   golem is captured mid-lurch toward you.

   SPINE-GESTURE SENTENCE (ANATOMY-CANON POSE-ANATOMY rule 1): hips punch forward-right onto the
   planted leg, the torso leans forward continuously from hip to crown (heavier lean at the
   shoulders than the hips — the top-heavy clay bulk drooping into its own momentum), the head
   continues the forward lean and tips slightly further down — one continuous forward-leaning
   curve, never a vertical plumb line.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Large size, base disc r=0.55. Imported by ps1-sheet.html (SETS['bright-w1'],
   cell 4, fn buildClayGolem). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildClayGolem(){
  /* ---------- PALETTE — terracotta clay, distinct from iron (grey-steel) / flesh (pink-grey).
     Base dark unfired clay, mid terracotta body, pale finger-groove highlight (the >=140 RGB
     value-floor zone the signature must carry). ---------- */
  const P = {
    clayDk:   0x6e3c22,   // dark unfired clay, shadow side / recesses (R2: lightened off the
                           // void floor — 0x5a2f1c read too close to the dithered void/disc)
    clay:     0x8a4a2c,   // mid terracotta body
    clayLt:   0xa8623c,   // raised/lit clay
    groove:   0xd9a878,   // pale dragged finger-groove — the loud signature tone (>140 RGB)
    grooveDk: 0xb17c50,   // groove mid-tone, transition band
    drip:     0x6e3820,   // wet drip tendrils, melt seams
    void_:    0x2c1710,   // eye divots, mouth seam — deep shadow, near-black terracotta
    disc:     0x3a2416, discTop: 0x462c1c,
  };

  const L = { hipY:0.62, waistY:0.76, bellyY:0.90, chestY:1.04, shldY:1.18, neckY:1.24, headY:1.40, crownY:1.55 };

  /* ===== RIG — the forward-lean spine curve, authored first (POSE-ANATOMY rule 1). The whole
     upper body leans into the plod: more lean the higher up the body, plus a slight hip-forward
     punch onto the weighted (right) leg. ===== */
  const spine = (p) => {
    const t = Math.max(0, Math.min(1, (p.y - L.hipY) / (L.crownY - L.hipY)));
    const hipPunch = Math.sin(Math.min(t, 0.3) / 0.3 * Math.PI / 2) * 0.020;
    const lean = 0.115 * t * t;             // accelerating forward lean, top-heavy droop
    const sway = 0.012 * Math.sin(t * Math.PI); // slight counter-twist so it isn't a plank
    return V(p.x + hipPunch + sway, p.y, p.z + lean);
  };

  /* ---------- LEGS — thick soft clay pillars, forward leg planted/weighted, trailing leg
     dragging back with heel lifted off the ground (mid-stride). Bent knees both sides
     (POSE-ANATOMY rule 2: always bend, never a dead-straight leg). ---------- */
  function leg(hip, knee, ankle, footFwd, hex, hexDk){
    tube(hip, knee, 0.175, 0.145, 8, hex, { phase: Math.PI / 8 });
    tube(knee, ankle, 0.145, 0.115, 8, hexDk, { phase: Math.PI / 8 });
    const toe = ankle.clone().add(V(footFwd.x * 0.16, -0.025, footFwd.z * 0.16));
    const heel = ankle.clone().add(V(-footFwd.x * 0.05, -0.02, -footFwd.z * 0.05));
    tube(ankle, toe, 0.055, 0.045, 6, hexDk);
    tube(ankle, heel, 0.045, 0.035, 6, hexDk, { capB: { hex: hexDk } });
  }
  /* planted (right) — near-vertical, weight-loaded, foot flat forward. Kept wide in x and
     forward in z (z >= the gut's forward reach) so the thick sagging gut never occludes the
     legs from the dimetric capture camera. */
  leg(V(0.26, L.hipY, 0.10), V(0.275, 0.365, 0.235), V(0.245, 0.075, 0.300),
    V(0, 0, 1), P.clayLt, P.clay);
  /* trailing (left) — knee bent, dragging back. PASS-1 fix: swept wide in -x (rather than
     deep -z) so it stays out from behind the torso/planted leg from the dimetric camera
     (a purely backward-z trail gets hidden by nearer geometry at the same screen column —
     the sideways sweep keeps it visually separated, same lesson as the gladiator's trailing
     leg). Heel lifted off the disc, still bent at the knee. */
  leg(V(-0.30, L.hipY - 0.01, 0.06), V(-0.420, 0.330, -0.020), V(-0.385, 0.130, -0.060),
    V(-0.4, 0, -1), P.clay, P.clayDk);

  /* finger-groove drag marks down both thighs — the signature reaching the legs */
  for(const sx of [1, -1]){
    for(const t of [0.30, 0.55, 0.78]){
      const y = L.hipY - 0.05 + t * 0.30, x = sx * (0.26 - t * 0.03), z = 0.12 - t * 0.05;
      quad(V(x - 0.05, y + 0.02, z), V(x + 0.05 * sx * 0.4 + 0.05, y + 0.02, z + 0.02),
        V(x + 0.045, y - 0.03, z), V(x - 0.045 * sx, y - 0.03, z - 0.01), P.groove, 0.04);
    }
  }

  /* ---------- TORSO — soft rounded stack, SAGGING gut bulging past the waist and drooping
     below it (feature checklist 2), shoulders slumped rather than square. ---------- */
  const torso = stack([
    { y: L.hipY,   rx: 0.290, rz: 0.235, hex: P.clayDk },
    { y: L.waistY, rx: 0.270, rz: 0.220, hex: P.clay },
    { y: L.bellyY, rx: 0.310, rz: 0.235, hex: P.clayLt },   // the sagging gut — widest point
    { y: L.chestY, rx: 0.320, rz: 0.255, hex: P.clay },
    { y: L.shldY,  rx: 0.350, rz: 0.240, hex: P.clayDk },   // slumped shoulders, not squared
  ], 10, { xform: spine, phase: Math.PI / 10 });

  /* the gut droop — an extra soft lobe hanging just under the belly ring, reading as clay
     slumping under its own weight rather than a taut musculature */
  {
    const gc = spine(V(0.01, L.bellyY - 0.10, 0.06));
    blob(gc.x, gc.y, gc.z, 0.30, 0.10, 0.24, P.clay, 8, 3);
  }

  /* finger-groove bands raking across the torso — the loudest signature zone (law 3/4), pale
     terracotta dragged diagonally across the belly, chest, and shoulders */
  {
    const bands = [
      { c: spine(V(-0.02, L.bellyY + 0.02, 0.24)), w: 0.20, h: 0.05, rot: 0.35 },
      { c: spine(V(0.08, L.chestY - 0.02, 0.20)),  w: 0.16, h: 0.04, rot: -0.25 },
      { c: spine(V(-0.10, L.waistY + 0.05, 0.20)), w: 0.14, h: 0.04, rot: 0.15 },
      { c: spine(V(0.18, L.shldY - 0.05, 0.14)),   w: 0.12, h: 0.035, rot: 0.5 },
    ];
    for(const b of bands){
      const dx = Math.cos(b.rot) * b.w, dy = Math.sin(b.rot) * b.w;
      quad(
        V(b.c.x - dx, b.c.y - dy, b.c.z), V(b.c.x + dx, b.c.y + dy, b.c.z),
        V(b.c.x + dx + b.h * 0.3, b.c.y + dy + b.h, b.c.z + 0.01),
        V(b.c.x - dx + b.h * 0.3, b.c.y - dy + b.h, b.c.z + 0.01),
        P.groove, 0.03
      );
    }
  }

  /* ---------- HEAD — soft rounded clay skull, sagging jowls, blank pressed-thumb eye divots,
     dragged mouth-seam groove. No carved features — a golem is unfinished on purpose. ---------- */
  const neckC = spine(V(0, L.neckY, 0));
  const headC = spine(V(0.01, L.headY, 0.01));
  const crownC = spine(V(0.01, L.crownY, -0.02));
  {
    const rings = [
      ring(neckC, V(0, 1, 0), 0.135, 0.130, 9),
      ring(spine(V(0, (L.neckY + L.headY) / 2, 0.02)), V(0, 1, 0), 0.175, 0.170, 9),
      ring(headC, V(0, 1, 0), 0.165, 0.160, 9),
      ring(crownC, V(0, 1, 0), 0.125, 0.120, 9),
    ];
    stitch(rings, (b) => [P.clayDk, P.clayLt, P.clay, P.clayDk][b] ?? P.clay);
    capFan(rings.at(-1), crownC.clone().add(V(0, 0.05, -0.02)), P.clayDk);
  }
  /* sagging jowls — a soft lobe drooping past the jawline */
  {
    const jc = spine(V(0, L.headY - 0.06, 0.10));
    blob(jc.x, jc.y, jc.z, 0.11, 0.045, 0.09, P.clayLt, 6, 3);
  }
  /* pressed-thumb eye divots — deep shadow, no eye quads */
  for(const s of [-1, 1]){
    const ec = spine(V(s * 0.065, L.headY + 0.01, 0.145));
    blob(ec.x, ec.y, ec.z, 0.022, 0.018, 0.014, P.void_, 5, 2);
  }
  /* dragged mouth-seam groove */
  {
    const mc = spine(V(0, L.headY - 0.09, 0.15));
    quad(V(mc.x - 0.05, mc.y + 0.01, mc.z), V(mc.x + 0.05, mc.y + 0.01, mc.z),
      V(mc.x + 0.04, mc.y - 0.015, mc.z + 0.005), V(mc.x - 0.04, mc.y - 0.015, mc.z + 0.005),
      P.void_, 0.03);
  }
  /* a finger-groove drag mark climbing the temple onto the crown — signature continues onto
     the head so it isn't isolated to the torso */
  {
    const gc = spine(V(-0.10, L.headY - 0.02, 0.06));
    quad(V(gc.x - 0.02, gc.y - 0.10, gc.z), V(gc.x + 0.03, gc.y - 0.10, gc.z + 0.01),
      V(gc.x + 0.025, gc.y + 0.11, gc.z - 0.02), V(gc.x - 0.025, gc.y + 0.11, gc.z - 0.02),
      P.groove, 0.05);
  }

  /* ===== ARMS — heavy counter-swing (POSE-ANATOMY rules 2-3): left arm swings forward with the
     opposite planted leg, right (trailing) arm swings back and carries the MELT-HAND. Both
     elbows bent, both shoulders sag/ride with the swing rather than reading level. ===== */
  function armSeg(shoulder, elbow, wrist, hex, hexDk){
    tube(shoulder, elbow, 0.115, 0.090, 8, hex, { phase: Math.PI / 8 });
    tube(elbow, wrist, 0.090, 0.070, 8, hexDk, { phase: Math.PI / 8 });
  }

  /* LEFT arm — forward counter-swing (opposite the planted right leg), elbow bent ~120°,
     shoulder dropped/sagging forward with the swing. */
  const lShoulder = spine(V(-0.325, L.shldY - 0.03, 0.02));
  const lElbow = lShoulder.clone().add(V(-0.03, -0.16, 0.15));
  const lWrist = lElbow.clone().add(V(0.02, -0.14, 0.10));
  armSeg(lShoulder, lElbow, lWrist, P.clay, P.clayDk);
  /* stubby clay fingers, blunt and thick, still individuated on this hand */
  {
    const palmDir = V(0.15, -0.55, 0.82).normalize();
    for(const s of [-1.3, -0.4, 0.4, 1.3]){
      const side = V(-palmDir.z, 0, palmDir.x).normalize();
      const base = lWrist.clone().addScaledVector(side, s * 0.024);
      const tip = base.clone().addScaledVector(palmDir, 0.075);
      tube(base, tip, 0.026, 0.018, 5, P.clay, { capB: { hex: P.clayDk } });
    }
  }
  /* finger-groove band down the forward-swinging arm */
  {
    const gc = lShoulder.clone().lerp(lElbow, 0.5).add(V(0, 0, 0.06));
    quad(V(gc.x - 0.02, gc.y - 0.09, gc.z), V(gc.x + 0.05, gc.y - 0.09, gc.z + 0.01),
      V(gc.x + 0.045, gc.y + 0.09, gc.z - 0.01), V(gc.x - 0.025, gc.y + 0.09, gc.z),
      P.groove, 0.04);
  }

  /* RIGHT arm — trailing back-swing, elbow bent ~130°, shoulder sagging loose (feature
     checklist 2: arms losing shape). Carries the MELT-HAND signature. */
  const rShoulder = spine(V(0.330, L.shldY - 0.04, -0.02));
  const rElbow = rShoulder.clone().add(V(0.05, -0.17, -0.13));
  const rWrist = rElbow.clone().add(V(-0.01, -0.13, -0.11));
  armSeg(rShoulder, rElbow, rWrist, P.clay, P.clayDk);
  /* ---- MELT-HAND: fingers fusing back into one blunt clay lobe mid-stride, two shallow seam
     grooves still legible, a thin drip tendril hanging off the heel of the hand. ---- */
  {
    /* R2 self-review fix: the melt-hand read as a near-invisible nub at r1 render scale —
       enlarged the fused mass ~1.7x, lit it with clayLt (not mid-tone clay) so it holds its
       own high-value pocket against the arm, and thickened/lengthened the drip so the
       wet-clay tell survives the 1/3-res capture. */
    const meltDir = V(-0.05, -0.6, -0.79).normalize();
    const massC = rWrist.clone().addScaledVector(meltDir, 0.06);
    blob(massC.x, massC.y, massC.z, 0.125, 0.100, 0.110, P.clayLt, 8, 4);
    /* a second smaller sub-lobe, still half-fused, breaking the mass's outline so it silhouettes
       as "fingers becoming one" rather than a clean sphere */
    const subC = massC.clone().addScaledVector(meltDir, 0.05).add(V(0.04, -0.01, 0.02));
    blob(subC.x, subC.y, subC.z, 0.05, 0.04, 0.045, P.groove, 5, 3);
    /* two shallow finger seams still readable in the fused mass (not full fingers anymore) */
    for(const s of [-0.6, 0.6]){
      const side = V(-meltDir.z, 0, meltDir.x).normalize();
      const a = massC.clone().addScaledVector(side, s * 0.045).addScaledVector(meltDir, -0.03);
      const b = a.clone().addScaledVector(meltDir, 0.09);
      quad(V(a.x - 0.012, a.y, a.z), V(a.x + 0.012, a.y, a.z),
        V(b.x + 0.009, b.y, b.z), V(b.x - 0.009, b.y, b.z), P.void_, 0.02);
    }
    /* thick drip tendril hanging off the heel of the melt-hand — the wet-clay tell, now sized
       to survive dithering instead of dissolving to a hairline */
    const dripA = massC.clone().add(V(0.015, -0.08, 0.02));
    const dripB = dripA.clone().add(V(-0.01, -0.16, -0.02));
    tube(dripA, dripB, 0.028, 0.010, 5, P.drip, { capB: { hex: P.drip } });
  }
  /* finger-groove band down the trailing arm, matching the forward arm's signature */
  {
    const gc = rShoulder.clone().lerp(rElbow, 0.5).add(V(0, 0, -0.05));
    quad(V(gc.x - 0.045, gc.y - 0.09, gc.z), V(gc.x + 0.02, gc.y - 0.09, gc.z - 0.01),
      V(gc.x + 0.025, gc.y + 0.09, gc.z), V(gc.x - 0.05, gc.y + 0.09, gc.z + 0.01),
      P.groove, 0.04);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.55, 0.55, 18);
    const r2 = ring(V(0, 0.050, 0), V(0, 1, 0), 0.53, 0.53, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.053, 0), P.discTop);
  }
}
