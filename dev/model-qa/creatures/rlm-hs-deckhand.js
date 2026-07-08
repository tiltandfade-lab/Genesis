/* dev/model-qa/creatures/rlm-hs-deckhand.js — HIGH-SEAS DECKHAND (the pirate mook — retires the
   giant-rat pirates). Bandana head (blood-red skull-dot + nape tail), loose sailcloth shirt over
   the broad blood sash, petticoat slops, bare calves, cutlass held out low at the right side in a
   loose brawler stance. Medium ≈1.45u, disc r=0.42. Kit: rlm-highseas-kit.js; refs brief:
   refs-highseas-NOTES.md (the Pyle silhouette: billowed light torso / cinched sash / pale bell
   slops / stick ankles). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { HS_P, humanoidRig, buildSailorTorso, buildSailorLegs, buildBandanaHead,
         buildCutlass, buildSailorArm, buildFist, buildBase } from './rlm-highseas-kit.js';

export function buildHsDeckhand(){
  const P = HS_P;
  const L = humanoidRig();

  buildSailorTorso(L, P);
  buildSailorLegs(P, {
    ankL: V(-0.150, 0.06, 0.045), toeL: V(0.10, 0, 1),
    ankR: V( 0.165, 0.06, -0.055), toeR: V(0.80, 0, 0.45).normalize(),
  });
  buildBandanaHead(L, P);

  /* CUTLASS FIRST — held out low and lazy at the right side, tip forward-down */
  const GRIP = V(0.30, 0.62, 0.16);
  const DIR = V(0.30, -0.42, 0.85).normalize();
  buildCutlass(GRIP, DIR, P);

  /* right arm derives to the grip */
  {
    const S = V(L.shoulderX, L.shldY-0.01, 0.015);
    const E = V(0.315, 0.86, 0.075);
    const W = GRIP.clone().add(V(-0.020, 0.055, -0.045));
    buildSailorArm(S, E, W, P);
    buildFist(GRIP.clone().addScaledVector(DIR, -0.005), DIR, P);
  }
  /* left arm loose, hanging slightly out from the hip */
  {
    const S = V(-L.shoulderX, L.shldY-0.01, 0.015);
    const E = V(-0.330, 0.86, 0.045);
    const W = V(-0.300, 0.63, 0.075);
    buildSailorArm(S, E, W, P);
    const HD = V(-0.05, -1, 0.25).normalize();
    tube(W, W.clone().addScaledVector(HD, 0.085), 0.042, 0.034, 6, P.skin, {capB:{hex:P.skinDk}});
  }

  buildBase({disc:P.disc, discTop:P.discTop});
}
