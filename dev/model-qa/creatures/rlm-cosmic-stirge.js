/* dev/model-qa/creatures/rlm-cosmic-stirge.js — COSMIC realm, cosmic-w1 wave, cell 5.
   STIRGE — Small, CR 1/2. Tiny star-fallen splinter searching for its parent (flavor); core
   identity = the mosquito-bat bloodsucker (never lose that under the flavor coat).

   FEATURE CHECKLIST (family: WINGED / AVIAN-lean, per docs/ANATOMY-CANON WINGED section):
   - pot-bellied bulbous abdomen (rust-red, body-mass RGB>=60 over the void)
   - bat-strut wings: thick leading-edge spar + 3 finger struts fanning back, scalloped trailing
     membrane bays (never a flat sheet) — SPREAD + up-swept mid-brake (hero/airborne pose exception)
   - four thin dangling legs, clawed, reaching forward/down (not folded — mid-dive reach)
   - SIGNATURE: the needle proboscis — pale (>=140 RGB zone), thin, long, leading like a lance
   - small head fused low into the body mass (stirges barely have a distinct head/neck)
   - hover flag: whole model floats at ~0.35u, ground disc stays at y=0 (empty — no floor clip)

   POSE SENTENCE: the latch-dive — body pitched forward and down like a thrown dart, spine curves
   from raised rump/wing-root down through the belly to the proboscis tip (one C-curve gesture, not
   a plumb line), wings swept UP and BACK at the wrist mid-brake (catching air, not folded), all
   four legs unfurled and reaching forward-down as if to grab, proboscis leads the whole gesture
   like a lance point extending the spine curve.

   SPINE-GESTURE SENTENCE: wing-root (high, back) -> abdomen apex (mid) -> belly underside (low,
   forward) -> proboscis tip (lowest, furthest forward) traces one continuous downward-forward arc;
   legs hang off that arc at the belly, each with a real hip-knee-ish bend (not straight sticks).

   Whole-object grammar: one exported fn, ground y=0, HOVER unit (bbox min.y >= -0.01 verified after
   the +0.35u lift — the disc below stays clear). Imports from ../probe-lib.js only. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildStirge(){
  /* ground anchor: a faint hover-shadow pool under the dive (the hover-unit grounding convention —
     verify-theater-figures requires bbox min.y inside [-0.01,0.08]; the dive itself floats at ~0.3u) */
  blob(0, 0.035, 0.15, 0.16, 0.025, 0.12, 0x241412, 8, 3);
  const P = {
    body:   0x9a3f2e,   // rust-red pot belly
    bodyDk: 0x6e2a1f,   // shadow underside
    bodyLt: 0xb85a42,   // top highlight
    wing:   0x8a3a2c,   // rust wing membrane — brightened off the r1 dark-on-dark near-miss
    wingDk: 0x6a2a20,
    spar:   0x5e2a1e,   // leading-edge spar / strut — lifted off near-black so it reads vs. the void
    rim:    0xc86a48,   // bright leading-edge highlight strip (cosmic dark-on-dark guardrail)
    leg:    0x5c2c22,   // thin clawed legs — lifted off near-black to stay readable vs. the void
    claw:   0x1c0e0b,
    proboscis: 0xe8d8b8, // SIGNATURE — pale needle, >=140 RGB
    proboscisDk: 0xc4a884,
    eye:    0xf0c840,
    pupil:  0x140a06,
  };

  const HOVER = 0.35; // whole-model lift; hover-flagged unit, empty base disc under it
  const Y = (y) => y + HOVER;

  /* ---------------- POT-BELLY ABDOMEN (body mass) ---------------- */
  // asymmetric bulb: wide/high at the back (wing root), tapering low-forward toward the proboscis —
  // this IS the spine-gesture curve, built into the body loft itself.
  const bodyRings = stack([
    { y: Y(0.30), cz: -0.06, rx: 0.16, rz: 0.18, hex: P.bodyDk },
    { y: Y(0.40), cz: -0.02, rx: 0.24, rz: 0.26, hex: P.body },
    { y: Y(0.46), cz: 0.05,  rx: 0.27, rz: 0.27, hex: P.bodyLt },
    { y: Y(0.42), cz: 0.16,  rx: 0.20, rz: 0.21, hex: P.body },
    { y: Y(0.33), cz: 0.25,  rx: 0.11, rz: 0.12, hex: P.bodyDk },
  ], 8, { phase: Math.PI / 8 });
  capFan(bodyRings[0], V(0, Y(0.22), -0.08), P.bodyDk);

  // small fused head-knob at the front of the belly (barely a head — stirge has no real neck)
  blob(0, Y(0.34), 0.29, 0.085, 0.08, 0.09, P.body, 6, 4);

  /* ---------------- EYES — a pair, small, low on the head-knob, forward-looking ---------------- */
  const eyeAt = (dx) => {
    blob(dx, Y(0.35), 0.35, 0.03, 0.03, 0.03, P.eye, 5, 3);
    blob(dx * 1.15, Y(0.345), 0.375, 0.016, 0.016, 0.016, P.pupil, 4, 2);
  };
  eyeAt(-0.045); eyeAt(0.045);

  /* ---------------- SIGNATURE: NEEDLE PROBOSCIS — leading like a lance ---------------- */
  // long thin tapered tube extending the spine gesture forward-and-down from the head-knob, pale +
  // high-value so it reads as the loud silhouette feature. width kept >=0.04u at the base per Law 3.
  const pbBase = V(0, Y(0.335), 0.37);
  const pbMid  = V(0, Y(0.24), 0.62);
  const pbTip  = V(0, Y(0.135), 0.92);
  tube(pbBase, pbMid, 0.042, 0.028, 6, P.proboscis, { phase: Math.PI / 6 });
  tube(pbMid, pbTip, 0.028, 0.012, 6, P.proboscisDk, { phase: Math.PI / 6, capB: { hex: P.proboscisDk } });

  /* ---------------- BAT-STRUT WINGS — spread, swept up-and-back mid-brake ---------------- */
  // one shared builder mirrored left/right. wingSign = -1 (left/-x) / +1 (right/+x).
  function wing(sign){
    const rootS = V(sign * 0.10, Y(0.44), -0.04);      // shoulder, high on the back
    const rootJ = V(sign * 0.10, Y(0.44), -0.04);
    // humerus: shoulder -> elbow, swept UP and BACK (brake stroke)
    const elbow = V(sign * 0.30, Y(0.68), -0.20);
    tube(rootJ, elbow, 0.05, 0.038, 5, P.spar, { phase: Math.PI / 5 });
    // leading-edge spar: elbow -> wrist, continues the up-back sweep, thickened (Law: WINGED #2)
    const wrist = V(sign * 0.46, Y(0.80), -0.14);
    tube(elbow, wrist, 0.038, 0.026, 5, P.spar, { phase: Math.PI / 5 });
    // bright rim strip riding the leading edge (cosmic dark-on-dark guardrail — a thin high-value
    // seam so the wing silhouette pops off the void even where the membrane itself reads dark)
    const rimA0 = V(rootJ.x, rootJ.y + 0.03, rootJ.z + 0.02);
    const rimA1 = V(rootJ.x, rootJ.y - 0.02, rootJ.z + 0.02);
    const rimB0 = V(elbow.x, elbow.y + 0.03, elbow.z + 0.02);
    const rimB1 = V(elbow.x, elbow.y - 0.02, elbow.z + 0.02);
    const rimC0 = V(wrist.x, wrist.y + 0.025, wrist.z + 0.02);
    const rimC1 = V(wrist.x, wrist.y - 0.015, wrist.z + 0.02);
    quad(rimA0, rimB0, rimB1, rimA1, P.rim, 0.05);
    quad(rimB0, rimC0, rimC1, rimB1, P.rim, 0.05);

    // 3 finger struts fanning back from the wrist, each carrying one scalloped membrane bay
    const fingerTips = [
      V(sign * 0.66, Y(0.86), 0.06),   // fwd-most finger
      V(sign * 0.70, Y(0.78), -0.16),  // mid finger
      V(sign * 0.60, Y(0.66), -0.34),  // rearmost finger, sweeps toward the body
    ];
    fingerTips.forEach((tip, i) => {
      tube(wrist, tip, 0.022, 0.008, 4, P.spar, { phase: Math.PI / 4 });
    });

    // membrane bays: wrist/root anchor -> finger[i] -> finger[i+1], scalloped trailing edge via a
    // pulled-in midpoint (concave bay, never a taut flat plane per WINGED #1)
    const anchors = [rootS, wrist, wrist];
    const chain = [wrist, ...fingerTips];
    for(let i=0;i<fingerTips.length;i++){
      const a = chain[i];
      const b = chain[i+1];
      const mid = new THREE.Vector3(
        (a.x + b.x) / 2 * 0.92 + (sign * 0.02),
        (a.y + b.y) / 2 - 0.06,               // drooped camber
        (a.z + b.z) / 2 - (Math.abs(a.z - b.z) * 0.35 + 0.05) // pulled inward = the scallop
      );
      const root = i === 0 ? rootS : chain[i];
      quad(root, a, mid, b, i % 2 ? P.wing : P.wingDk, 0.05);
      quad(root, b, mid, root, i % 2 ? P.wingDk : P.wing, 0.05); // small back-fill triangle-ish quad closing the bay to the root
    }
    // one back panel closing wrist-root gap so the wing doesn't look detached from the body
    quad(rootS, wrist, chain[1], rootS, P.wingDk, 0.05);
  }
  wing(-1);
  wing(1);

  /* ---------------- FOUR DANGLING LEGS — reaching forward-down, real hip/knee bends ---------------- */
  // seated in two pairs along the belly underside, each a 2-segment reach with a visible knee angle
  // (per POSE-ANATOMY law 2 — arms/legs bend at joints, ~100-150 deg, never dead-straight sticks).
  const legRoots = [
    V(-0.14, Y(0.33), 0.08),
    V(-0.10, Y(0.30), 0.22),
    V(0.10, Y(0.30), 0.22),
    V(0.14, Y(0.33), 0.08),
  ];
  legRoots.forEach((root, i) => {
    const sign = root.x < 0 ? -1 : 1;
    const spread = 0.16 + (i % 2) * 0.04;
    const knee = V(root.x + sign * spread, Y(0.16), root.z + 0.20);   // thigh: down-and-out-forward
    const tip  = V(root.x + sign * (spread + 0.06), Y(-0.03), root.z + 0.46); // shin: down-and-further-forward, reaching hard toward the proboscis line
    tube(root, knee, 0.024, 0.017, 4, P.leg, { phase: Math.PI / 4 });
    tube(knee, tip, 0.017, 0.006, 4, P.leg, { phase: Math.PI / 4, capB: { hex: P.claw } });
    // a tiny claw-splay at the tip (2 slivers) so the reaching hand reads as grabbing, not a stick end
    const splayA = V(tip.x + sign * 0.03, tip.y - 0.02, tip.z + 0.02);
    const splayB = V(tip.x - sign * 0.01, tip.y - 0.025, tip.z + 0.035);
    quad(tip, splayA, splayA, tip, P.claw, 0.05);
    quad(tip, splayB, splayB, tip, P.claw, 0.05);
  });
}
