/* dev/model-qa/creatures/rlm-cosmic-phase-spider.js — COSMIC realm, cosmic-w1 cell 1.
   PHASE SPIDER — Large, CR 3. Half-phased star-spawn cattle grazing on light: the blue-white
   ethereal spider, mid-stalk between planes.

   FEATURE CHECKLIST (the budget buys): (1) pinched arthropod body — small cephalothorax + narrow
   waist + bulbous abdomen, (2) 8 arched tent-pole legs, knees riding ABOVE the body line, (3) the
   SIGNATURE phase split — the spider's near side (right flank: 2 legs + half the abdomen/thorax)
   rendered in a paler ghost-blue tone vs the solid pale-violet far side, reading as half-in-this-
   world, (4) a forward eye cluster (8 small eyes, ethereal glow) on the cephalothorax face,
   (5) fang/chelicerae nubs under the eyes.

   POSE SENTENCE: mid-phase stalk — weight sunk low on the rear three leg-pairs, the front pair
   lifted and reaching forward-and-up as if testing solid ground that isn't fully there yet, body
   half-crouched and canted toward the phased flank.

   SPINE-GESTURE SENTENCE: the cephalothorax-to-abdomen axis leans forward and down off the pinch,
   dipping the whole mass toward the lifted front legs — a shallow forward C-curve, not a flat
   tabletop back.

   Whole-object grammar: one exported build fn, ground y=0. Spine +z (front), up +y.
   Palette: ghost-blue phase flank reads as the ≥140-RGB high-value zone required by law 3; the
   solid pale-violet flank + dark cephalothorax core keep body mass ≥60 RGB over the (10,9,8) void. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

const P = {
  bodySolid:   0x453a68,   // solid (unphased) flank — deep saturated violet, kept OFF the void floor
  bodySolidDk: 0x2e2748,   // solid flank shade
  bodyPhase:   0xdcf0ff,   // SIGNATURE — the phased flank, near-white ghost-blue (loud value spike)
  bodyPhaseDk: 0xa8d4f0,   // phased flank shade (still far above the value floor)
  legSolid:    0x3d3460,
  legPhase:    0xcae8fc,
  fang:        0x1a1530,
  eyePale:     0xeaf6ff,
  eyeGlow:     0x9fe0ff,
  pupil:       0x14182a,
};

/* small ethereal eye cluster — pale glowing spheres, no dark iris (the ghost read). */
function eye(cx, cy, cz, r, dir){
  blob(cx, cy, cz, r, r, r, P.eyePale, 5, 3);
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0]/n, dy = dir[1]/n, dz = dir[2]/n;
  blob(cx + dx*r*0.7, cy + dy*r*0.7, cz + dz*r*0.7, r*0.4, r*0.4, r*0.4, P.eyeGlow, 4, 2);
}

/* one leg: coxa-hidden, femur (up-and-out, THE knee-above-body peak) -> tibia (down past vertical)
   -> tarsus (thin foot to ground). base = hip socket on the body, dir = [dx,dz] outward horizontal
   direction, frontBias tips the knee forward for the lifted front pair, phase = ghost tone. */
function leg(base, dx, dz, kneeH, footY, footOutMul, frontBias, hex, hexDk, lifted){
  const n = Math.hypot(dx, dz) || 1;
  const ux = dx/n, uz = dz/n;
  // femur: hip -> knee, rising up-and-out, biased forward/back
  const kneeOut = 0.30;
  const knee = V(base.x + ux*kneeOut + frontBias*0.10, kneeH, base.z + uz*kneeOut + frontBias*0.14);
  tube(base, knee, 0.052, 0.040, 6, hex, { phase: Math.PI/6 });
  // tibia: knee -> ankle, sweeping down past vertical, still outward
  const ankleOut = kneeOut + 0.46*footOutMul;
  const ankle = V(base.x + ux*ankleOut + frontBias*0.05, lifted ? footY + 0.14 : footY + 0.05, base.z + uz*ankleOut + frontBias*0.08);
  tube(knee, ankle, 0.040, 0.026, 6, hexDk, { phase: Math.PI/6 });
  // tarsus: ankle -> foot, thin, angling to ground (or held aloft if lifted)
  const footOut = ankleOut + 0.16*footOutMul;
  const foot = V(base.x + ux*footOut, lifted ? footY + 0.16 : Math.max(0.025, footY), base.z + uz*footOut);
  tube(ankle, foot, 0.026, 0.012, 5, hexDk, { phase: Math.PI/6, capB: { hex: hexDk } });
}

export function buildPhaseSpider(){
  // --- body: cephalothorax (small) + pinched waist + bulbous abdomen (large), leaning forward ---
  // cephalothorax — split solid/phase down the sagittal-ish plane (x<0 solid, x>=0 phase side...
  // but the brief wants the PHASE flank + 2 legs paler; use +x side as the phased flank throughout).
  blob(-0.02, 0.42, 0.14, 0.135, 0.115, 0.145, P.bodySolid, 8, 5);   // solid-side cephalothorax mass
  blob(0.05, 0.44, 0.15, 0.125, 0.115, 0.14, P.bodyPhase, 8, 5);     // phased-side cephalothorax mass
  blob(0.015, 0.36, 0.12, 0.07, 0.06, 0.08, P.bodySolidDk, 6, 4);    // underside shade, pinch anchor

  // pinched waist (pedicel) — narrow, dips down between the two masses
  blob(0.01, 0.34, -0.04, 0.05, 0.045, 0.06, P.bodySolidDk, 6, 3);

  // abdomen — bulbous, ~1.7x the cephalothorax volume, split solid/phase, canted down+back
  blob(-0.06, 0.30, -0.28, 0.20, 0.185, 0.23, P.bodySolid, 9, 6);
  blob(0.09, 0.32, -0.30, 0.185, 0.175, 0.215, P.bodyPhase, 9, 6);
  blob(0.02, 0.19, -0.30, 0.16, 0.12, 0.18, P.bodySolidDk, 8, 5);    // ventral shade

  // --- eye cluster on the cephalothorax face (forward, +z) — ethereal glow, no true pupils ---
  eye(-0.05, 0.46, 0.27, 0.028, [-0.3, 0.1, 1]);
  eye(0.03, 0.47, 0.28, 0.030, [0.1, 0.15, 1]);
  eye(0.10, 0.455, 0.27, 0.027, [0.5, 0.05, 1]);
  eye(-0.10, 0.42, 0.255, 0.020, [-0.6, -0.1, 0.9]);
  eye(0.16, 0.41, 0.25, 0.019, [0.7, -0.1, 0.9]);
  eye(-0.02, 0.51, 0.26, 0.017, [-0.1, 0.5, 0.9]);
  eye(0.07, 0.515, 0.255, 0.016, [0.25, 0.5, 0.9]);
  eye(0.13, 0.49, 0.24, 0.015, [0.6, 0.3, 0.85]);

  // fang / chelicerae nubs under the eye cluster
  capFan(ring(V(-0.04, 0.36, 0.28), V(-0.2, -0.6, 1), 0.028, 0.028, 5, 0), V(-0.06, 0.29, 0.35), P.fang);
  capFan(ring(V(0.05, 0.36, 0.28), V(0.2, -0.6, 1), 0.028, 0.028, 5, 0), V(0.07, 0.29, 0.35), P.fang);

  // --- 8 legs, 4 pairs, radiating from the cephalothorax/waist join. Front pair LIFTED (pose). ---
  // Pair order front->back at z offsets; x offset = hip socket on the body surface.
  const hips = [
    { z: 0.20, dz:  1.0, frontBias: 1.2, lifted: true  },  // front pair — LIFTED, reaching up/fwd
    { z: 0.06, dz:  0.55, frontBias: 0.4, lifted: false },  // 2nd pair
    { z: -0.10, dz: -0.25, frontBias: -0.3, lifted: false }, // 3rd pair
    { z: -0.24, dz: -0.85, frontBias: -1.0, lifted: false }, // rear pair
  ];
  hips.forEach((h, i) => {
    // solid (left, -x) leg of the pair — always solid tone
    const baseL = V(-0.11, 0.40, h.z);
    leg(baseL, -1.0, h.dz, 0.62 + (h.lifted?0.10:0), 0.0, 1.0, h.frontBias, P.legSolid, P.bodySolidDk, h.lifted);
    // right (+x) leg of the pair — SIGNATURE: exactly TWO legs (front + rear right) carry the ghost
    // phase tone per the brief ("one side of the body and two legs"); the other two right legs stay
    // solid so the phase reads as a targeted signature, not a whole-side recolor.
    const baseR = V(0.14, 0.41, h.z);
    const phased = (i === 0 || i === 3);
    leg(baseR, 1.0, h.dz, 0.64 + (h.lifted?0.12:0), 0.0, 1.0, h.frontBias,
        phased ? P.legPhase : P.legSolid, phased ? P.bodyPhaseDk : P.bodySolidDk, h.lifted);
  });

  // spinnerets — small dark nub at the rear of the abdomen
  blob(0.0, 0.16, -0.48, 0.035, 0.03, 0.03, P.bodySolidDk, 5, 3);
}
