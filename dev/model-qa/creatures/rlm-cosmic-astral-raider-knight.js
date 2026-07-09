/* dev/model-qa/creatures/rlm-cosmic-astral-raider-knight.js — the ASTRAL RAIDER KNIGHT
   (HUMANOID family, Medium), CR 7, realm cosmic, authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, cosmic-w1 cell 11, port 5381).
   Core identity: the star-spawn knight — wrong-angled armor over a void body, riding the
   seams between stars. A knight silhouette but WRONG: armor plates float slightly apart
   (the animated-armor gap trick) with a starfield-void body glimpsed in the gaps, and one
   arm carries an extra elbow bend nobody asked for.

   FEATURE CHECKLIST (the ~1,600-1,900 budget buys):
     1. HUMANOID knight torso/limbs — recognizable armored-knight proportions (broad
        pauldrons, barrel cuirass, greaves) so the silhouette reads "knight" at a squint
        before the wrongness registers.
     2. SIGNATURE — void gaps: every major plate (cuirass halves, pauldrons, greaves,
        gauntlet) is authored as a separate floating shell with a visible seam of dark
        starfield-void body showing through the gap, not touching the plate below it.
     3. SIGNATURE — star-glint dots: small bright points (>=140 RGB) seeded inside the void
        gaps and along the void-body surface, the law-3 high-value zone, scattered so the
        eye catches them first at a squint (chest gap + shoulder gaps + the open helm-slit).
     4. The dragged greatblade — held one-handed low behind the trailing leg, tip scraping
        near the ground, the weight of the drag reads in the arm's downward pull.
     5. The reaching arm — free hand reaching forward, ONE EXTRA ELBOW BEND partway down the
        forearm (the sanctioned wrongness: still fully articulated, two hinge bends instead
        of one, never a straight stick).
     6. Void body — visible at neck gap, forearm gap between vambrace and gauntlet, and the
        waist gap between cuirass and tasset; near-black (10,9,8) base with the star-glint
        dots punched into it so it clears law 3's 60 RGB body-mass floor via the armor while
        the void itself stays true void-dark (armor is the >=60 RGB body mass; void is a
        deliberate contrast pocket, same treatment as the shoggoth's mouth slits).
     7. Wrong-angled helm — visor canted off-true, a single vertical eye-slit glowing star-
        white, plates that don't quite meet at the crown.

   POSE SENTENCE: the seam-step — mid-stride out of nothing (trailing leg still finishing its
   push, lead leg planting forward), the greatblade dragged low and one-handed behind the
   trailing hip so its weight pulls that shoulder down and back, the free arm reaching forward
   and up across the body with the extra elbow bend giving it an uncanny double-hinge reach —
   never an at-attention idle; always the instant of arriving from nowhere.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY): the spine runs a shallow forward-
   leaning C-curve from the planted lead hip up through a torso twisted toward the reaching
   (front) arm, to a shoulder line that tilts opposite the dragging blade-arm (counterpose —
   reaching shoulder rides HIGH, blade shoulder drops LOW under the drag weight), with the
   canted helm countering back toward the direction of travel so the gesture line runs
   trailing-foot -> hip -> twisted ribcage -> reaching shoulder -> reaching hand in one
   continuous arc that survives the squint.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0. Imported by
   ps1-sheet.html (SETS['cosmic-w1'], cell 11, fn buildAstralRaiderKnight). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* a star-glint: a tiny bright blob, the law-3 high-value seed dropped into void gaps */
function glint(cx, cy, cz, r, hex){
  blob(cx, cy, cz, r, r, r, hex, 5, 3);
}

export function buildAstralRaiderKnight(){
  const P = {
    void: 0x08070a,        // near-black void-body base (law-3 contrast pocket, not the body-mass color)
    voidLit: 0x322a4a,     // faint indigo lift on void where starlight catches it
    plateDk: 0x4c4768,     // cool dark plate — flanks, shadow faces (>=60 RGB body mass, raised for legibility)
    plate: 0x726a94,       // mid plate — brightened off the initial dark-on-dark miss
    plateLt: 0xa89cc4,     // plate highlight rim — pushed toward law-3's readable range
    trim: 0x4ed0c8,        // teal-cosmic trim edging — brightened for a clear accent pop
    glint: 0xffffff,       // star-glint white (>=140 RGB, law-3 signature zone) — full white, bigger/brighter
    glintCore: 0xe6d8ff,   // secondary glint lavender
    eye: 0xf4fbff,         // visor eye-slit glow
    grip: 0x241f30,        // blade grip / dark leather
    blade: 0x8f9ab4,       // greatblade steel — brightened so the drag reads clearly
    bladeEdge: 0xf0f6fb,   // greatblade bright edge
  };

  const LEAN = 0.09;       // forward torso lean (spine C-curve)
  const TWIST = 0.10;      // torso twist toward reach arm

  // ---------------- VOID BODY (the base form the plates float over) ----------------
  // slim void torso — visible through every plate gap, near-black w/ faint indigo lift
  stack([
    {y:0.90, rx:0.155, rz:0.115, hex:P.void, cx:LEAN*0.4, cz:0},
    {y:1.06, rx:0.175, rz:0.135, hex:P.voidLit, cx:LEAN*0.6, cz:TWIST*0.3},
    {y:1.28, rx:0.185, rz:0.145, hex:P.void, cx:LEAN*0.8, cz:TWIST*0.6},
    {y:1.46, rx:0.155, rz:0.12, hex:P.voidLit, cx:LEAN, cz:TWIST*0.9},
  ], 8, { phase: Math.PI/8 });
  // void neck stub between cuirass and helm
  stack([
    {y:1.46, rx:0.075, rz:0.07, hex:P.void},
    {y:1.56, rx:0.07, rz:0.065, hex:P.voidLit},
  ], 6, {});

  // ---------------- CUIRASS — floating in two shells with a void waist-gap ----------------
  // lower cuirass/tasset shell (sits low, doesn't touch torso base — void shows below)
  stack([
    {y:0.86, rx:0.19, rz:0.15, hex:P.plateDk, cx:LEAN*0.35},
    {y:1.00, rx:0.215, rz:0.165, hex:P.plate, cx:LEAN*0.45},
    {y:1.13, rx:0.20, rz:0.155, hex:P.plateDk, cx:LEAN*0.55, cz:TWIST*0.2},
  ], 8, { phase: Math.PI/8, capBot:{hex:P.trim, lift:0.015} });
  // waist void-gap glints
  glint(0.02+LEAN*0.5, 1.155, 0.16, 0.0352, P.glint);
  glint(-0.14+LEAN*0.5, 1.15, 0.06, 0.0256, P.glintCore);

  // upper cuirass shell — floats above the waist gap, doesn't fuse to the lower shell
  stack([
    {y:1.20, rx:0.215, rz:0.17, hex:P.plateDk, cx:LEAN*0.75, cz:TWIST*0.5},
    {y:1.34, rx:0.235, rz:0.185, hex:P.plate, cx:LEAN*0.85, cz:TWIST*0.7},
    {y:1.47, rx:0.20, rz:0.155, hex:P.plateLt, cx:LEAN, cz:TWIST*0.9},
  ], 8, { phase: Math.PI/8, capTop:{hex:P.trim, lift:0.015} });
  // chest gap glints — the loudest signature cluster, front-and-center
  glint(0.10+LEAN*0.8, 1.375, 0.19+TWIST*0.6, 0.0480, P.glint);
  glint(-0.06+LEAN*0.8, 1.35, 0.185+TWIST*0.6, 0.0320, P.glintCore);
  glint(0.02+LEAN*0.8, 1.40, 0.20+TWIST*0.6, 0.0256, P.glint);

  // ---------------- PAULDRONS — floating shoulder shells with visible gaps ----------------
  // reaching-arm (front, left) shoulder — rides HIGH (shoulder-rides-with-arm law)
  blob(-0.29+LEAN, 1.60, 0.05+TWIST*0.8, 0.13, 0.10, 0.12, P.plate, 8, 4);
  blob(-0.29+LEAN, 1.615, 0.04+TWIST*0.8, 0.075, 0.055, 0.07, P.plateLt, 6, 3);
  glint(-0.30+LEAN, 1.585, 0.11+TWIST*0.8, 0.0288, P.glint);
  // blade-arm (rear, right) shoulder — drops LOW under the drag weight (counterpose)
  blob(0.27+LEAN*0.6, 1.44, -0.02+TWIST*0.3, 0.135, 0.105, 0.125, P.plateDk, 8, 4);
  blob(0.27+LEAN*0.6, 1.455, -0.03+TWIST*0.3, 0.078, 0.058, 0.072, P.plate, 6, 3);
  glint(0.29+LEAN*0.6, 1.43, 0.05+TWIST*0.3, 0.0240, P.glintCore);

  // ---------------- HELM — canted, floating above the void neck, crown gap ----------------
  const helmC = V(0.03+LEAN, 1.70, 0.02+TWIST);
  stack([
    {y:1.63, rx:0.115, rz:0.105, hex:P.plateDk, cx:helmC.x-0.02, cz:helmC.z-0.01},
    {y:1.72, rx:0.125, rz:0.115, hex:P.plate, cx:helmC.x, cz:helmC.z},
    {y:1.80, rx:0.10, rz:0.095, hex:P.plateLt, cx:helmC.x+0.025, cz:helmC.z+0.015},  // canted crown, off-true
  ], 8, { phase: Math.PI/8 });
  // crown gap — plates don't quite meet, void + glint peek through
  glint(helmC.x+0.01, 1.795, helmC.z+0.02, 0.0272, P.glint);
  // visor eye-slit — vertical glowing gash on the front face
  quad(V(helmC.x-0.012, 1.68, helmC.z+0.10), V(helmC.x+0.012, 1.68, helmC.z+0.10),
       V(helmC.x+0.014, 1.755, helmC.z+0.095), V(helmC.x-0.014, 1.755, helmC.z+0.095), P.eye, 0.04);

  // ---------------- LEGS — the seam-step: lead planted forward, trailing pushing off ----------------
  // lead leg (left, forward-planted) — greave floats over a void shin gap
  const hipL = V(-0.10, 0.86, 0.14);
  const kneeL = V(-0.11, 0.46, 0.24);
  const footL = V(-0.12, 0.05, 0.34);
  tube(hipL, kneeL, 0.10, 0.075, 7, P.void, {});                       // void thigh (upper leg bare-void)
  tube(V(kneeL.x, kneeL.y+0.02, kneeL.z-0.01), footL, 0.07, 0.06, 7, P.plateDk, {capB:{hex:P.trim, lift:0.02}}); // floating greave shell
  glint(kneeL.x, kneeL.y-0.005, kneeL.z+0.02, 0.0256, P.glintCore);      // knee-gap glint
  blob(footL.x, 0.052, footL.z+0.05, 0.09, 0.05, 0.13, P.plate, 6, 3);   // sabaton, planted flat
  blob(footL.x, 0.052, footL.z+0.05, 0.05, 0.03, 0.08, P.plateLt, 5, 2);

  // trailing leg (right, still finishing its push, heel lifted)
  const hipR = V(0.11, 0.87, -0.06);
  const kneeR = V(0.155, 0.44, -0.20);
  const footR = V(0.10, 0.055, -0.32);
  tube(hipR, kneeR, 0.10, 0.075, 7, P.void, {});
  tube(V(kneeR.x, kneeR.y+0.02, kneeR.z+0.01), footR, 0.07, 0.058, 7, P.plateDk, {capB:{hex:P.trim, lift:0.02}});
  glint(kneeR.x, kneeR.y-0.005, kneeR.z-0.02, 0.0224, P.glint);
  blob(footR.x, 0.045, footR.z-0.02, 0.085, 0.045, 0.115, P.plate, 6, 3);  // heel lifted off ground slightly (still >= -0.01)

  // ---------------- BLADE ARM (rear/right) — dragged low, one-handed, behind trailing hip ----------------
  const shR = V(0.27+LEAN*0.6, 1.44, -0.02+TWIST*0.3);
  const elbowR = V(0.32, 1.06, -0.14);
  const wristR = V(0.20, 0.65, -0.28);
  tube(shR, elbowR, 0.075, 0.06, 6, P.plate, {});                 // upper arm — bends ~120deg at elbow
  glint(elbowR.x+0.02, elbowR.y, elbowR.z-0.02, 0.0224, P.glintCore);
  tube(elbowR, wristR, 0.058, 0.045, 6, P.plateDk, {});           // forearm, pulled down by blade weight
  blob(wristR.x, wristR.y-0.02, wristR.z, 0.055, 0.045, 0.055, P.grip, 5, 3);  // gauntlet fist gripping the tang

  // greatblade — dragged, tip near ground behind the trailing leg
  const gripTop = V(wristR.x+0.01, wristR.y+0.06, wristR.z-0.01);
  const gripBot = V(wristR.x, wristR.y-0.10, wristR.z+0.01);
  tube(gripTop, gripBot, 0.028, 0.026, 5, P.grip, {});
  const bladeBase = V(gripBot.x+0.01, gripBot.y-0.02, gripBot.z-0.03);
  const bladeTip = V(gripBot.x+0.04, 0.02, gripBot.z-0.62);        // long drag, tip skims near ground
  const rB0 = ring(bladeBase, norm([bladeTip.x-bladeBase.x, bladeTip.y-bladeBase.y, bladeTip.z-bladeBase.z]), 0.048, 0.014, 4, 0);
  const rB1 = ring(V((bladeBase.x+bladeTip.x)/2, (bladeBase.y+bladeTip.y)/2+0.01, (bladeBase.z+bladeTip.z)/2),
                    norm([bladeTip.x-bladeBase.x, bladeTip.y-bladeBase.y, bladeTip.z-bladeBase.z]), 0.038, 0.011, 4, 0);
  const rB2 = ring(bladeTip, norm([bladeTip.x-bladeBase.x, bladeTip.y-bladeBase.y, bladeTip.z-bladeBase.z]), 0.006, 0.004, 4, 0);
  stitch([rB0, rB1], (b,i)=> (i%2===0)?P.blade:P.bladeEdge);
  stitch([rB1, rB2], (b,i)=> (i%2===0)?P.blade:P.bladeEdge);
  capFan(rB0, V(bladeBase.x, bladeBase.y+0.02, bladeBase.z+0.02), P.blade, true);
  capFan(rB2, bladeTip, P.bladeEdge);
  // crossguard
  quad(V(bladeBase.x-0.09,bladeBase.y+0.015,bladeBase.z), V(bladeBase.x+0.09,bladeBase.y+0.015,bladeBase.z),
       V(bladeBase.x+0.08,bladeBase.y-0.02,bladeBase.z), V(bladeBase.x-0.08,bladeBase.y-0.02,bladeBase.z), P.trim, 0.04);

  // ---------------- REACHING ARM (front/left) — the extra-elbow wrongness ----------------
  const shL = V(-0.29+LEAN, 1.60, 0.05+TWIST*0.8);
  const elbow1 = V(-0.22, 1.30, 0.28);      // first bend — normal shoulder->elbow arc, ~120deg
  const elbow2 = V(-0.05, 1.14, 0.42);      // SANCTIONED EXTRA JOINT — second hinge partway down forearm
  const wristL = V(0.16, 1.20, 0.52);       // hand reaching forward and slightly up
  tube(shL, elbow1, 0.072, 0.058, 6, P.plate, {});
  glint(elbow1.x-0.02, elbow1.y, elbow1.z+0.02, 0.0208, P.glint);
  tube(elbow1, elbow2, 0.055, 0.048, 6, P.plateDk, {});           // upper forearm segment
  glint(elbow2.x, elbow2.y+0.015, elbow2.z, 0.0192, P.glintCore);   // the extra elbow's own gap-glint
  tube(elbow2, wristL, 0.046, 0.036, 6, P.plate, {});             // lower forearm segment — the wrong extra hinge
  // reaching hand — fingers implied by a splayed gauntlet blob, fingertips the forward-most point
  blob(wristL.x+0.03, wristL.y, wristL.z+0.03, 0.05, 0.038, 0.055, P.grip, 5, 3);
  blob(wristL.x+0.09, wristL.y+0.01, wristL.z+0.08, 0.022, 0.018, 0.03, P.plateDk, 4, 2);

  // trim edging along the cuirass rim + pauldron rims — small bright accent ticks
  glint(-0.29+LEAN, 1.545, 0.10+TWIST*0.8, 0.0192, P.trim);
  glint(0.27+LEAN*0.6, 1.385, 0.06+TWIST*0.3, 0.0192, P.trim);
}
