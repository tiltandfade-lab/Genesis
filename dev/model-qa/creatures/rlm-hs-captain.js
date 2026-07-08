/* dev/model-qa/creatures/rlm-hs-captain.js — HIGH-SEAS CAPTAIN (pirate-captain — retires the
   giant-rat captain). Tricorn (three-point brim, point forward) + knee-length navy coat hanging
   open over a pale waistcoat column (the RMG value read: dark frame / light core / brass button
   dots / baldric), cutlass planted tip-down like a cane at the right side, left fist on hip,
   commanding stance in boots. Big-Medium presence ≈1.5u to the crown, still Medium disc r=0.42.
   Kit: rlm-highseas-kit.js; refs brief: refs-highseas-NOTES.md. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { HS_P, humanoidRig, buildSailorLegs, buildTricornHead, buildCaptainCoat,
         buildCutlass, buildSailorArm, buildFist, buildBase } from './rlm-highseas-kit.js';

export function buildHsCaptain(){
  const P = HS_P;
  const L = humanoidRig({ headTopY:1.495, crownY:1.435, browY:1.345, cheekY:1.27, jawY:1.195, neckY:1.165, shldY:1.125, chestY:1.04 });

  /* trunk under the coat — waistcoat pale core */
  stack([
    {y:L.hipY,   rx:0.185, rz:0.145, hex:P.sailclothDk},
    {y:L.waistY, rx:0.165, rz:0.128, hex:P.sailcloth},
    {y:L.ribY,   rx:0.195, rz:0.148, hex:P.sailcloth},
    {y:L.chestY, rx:0.220, rz:0.160, hex:P.sailcloth},
    {y:L.shldY,  rx:0.225, rz:0.150, hex:P.sailcloth},
    {y:L.neckY,  rx:0.085, rz:0.080, hex:0xe8e2d0},      // the white stock at the throat
  ], 8, {capTop:{hex:0xe8e2d0, lift:0.005}});

  buildCaptainCoat(L, P);

  /* breeches + BOOTS (the captain doesn't go barefoot) — planted command stance */
  {
    const hipL=V(-0.115, L.hipY-0.01, 0.005), kneeL=V(-0.165, 0.40, 0.045), ankL=V(-0.175, 0.085, 0.020);
    const hipR=V( 0.115, L.hipY-0.01, 0.005), kneeR=V( 0.165, 0.40, 0.045), ankR=V( 0.175, 0.085, 0.020);
    tube(hipL, kneeL, 0.085, 0.060, 6, P.sailcloth);     // pale breeches to the knee
    tube(hipR, kneeR, 0.085, 0.060, 6, P.sailcloth);
    for(const [knee, ank, toeDir] of [[kneeL, ankL, V(-0.20,0,1)], [kneeR, ankR, V(0.20,0,1)]]){
      tube(knee, ank, 0.062, 0.050, 6, P.boot);          // tall boot shaft
      stack([
        {y:0.012, rx:0.064, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.056, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.17,  rx:0.066, rz:0.066, cx:ank.x, cz:ank.z, hex:P.tarDk},   // folded boot cuff
      ], 6, {capTop:{hex:P.tarDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const d=toeDir.clone().normalize(), toeA=V(ank.x, 0.05, ank.z);
      tube(toeA, toeA.clone().addScaledVector(d, 0.125), 0.052, 0.038, 6, P.boot,
           {capB:{hex:P.boot, lift:0.012}, raz:0.044, rbz:0.030});
    }
  }

  buildTricornHead(L, P);

  /* CUTLASS FIRST — planted tip-down at the right side like a cane */
  const GRIP = V(0.315, 0.72, 0.14);
  const DIR = V(0.06, -1, 0.10).normalize();
  buildCutlass(GRIP, DIR, P);

  /* right arm derives straight down to the planted grip */
  {
    const S = V(0.245, L.shldY-0.01, 0.015);
    const E = V(0.315, 0.90, 0.075);
    const W = GRIP.clone().add(V(-0.015, 0.055, -0.030));
    buildSailorArm(S, E, W, P, {sleeveHex:P.navy, foreHex:P.navyLt});
    /* pale lace cuff at the wrist over the fist */
    stack([
      {y:GRIP.y+0.075, rx:0.052, rz:0.052, cx:GRIP.x-0.01, cz:GRIP.z-0.02, hex:P.sailcloth},
      {y:GRIP.y+0.115, rx:0.058, rz:0.058, cx:GRIP.x-0.01, cz:GRIP.z-0.02, hex:P.sailcloth},
    ], 6, {});
    buildFist(GRIP.clone().addScaledVector(DIR, -0.005), DIR, P);
  }
  /* left fist on hip — elbow thrown wide (the command silhouette) */
  {
    const S = V(-0.245, L.shldY-0.01, 0.015);
    const E = V(-0.385, 0.92, 0.055);
    const W = V(-0.205, L.hipY+0.035, 0.095);
    buildSailorArm(S, E, W, P, {sleeveHex:P.navy, foreHex:P.navyLt});
    buildFist(W.clone().add(V(0.02, -0.01, 0.01)), V(1, -0.2, 0.3), P);
  }

  buildBase({disc:P.disc, discTop:P.discTop});
}
