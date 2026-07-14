/* dev/model-qa/creatures/rlm-hs-drowned.js — THE DROWNED (the undead-sailor line: ghost crew,
   sodden ghouls, wights of the deep). The deckhand kit gone waterlogged: HS_DROWNED_P channel
   (brine-pale grey-green skin, cloth sunk to kelp, sash rotted to sodden teal), the whole figure
   SLUMPED (Ryder read: value + sag — head dropped, shoulders caved forward) with kelp streamers
   hanging off the arms/shoulders and a barnacle crust at the collar. Empty drowned hands — it
   reaches, it doesn't fence. Medium ≈1.4u slumped, disc r=0.42.
   Kit: rlm-highseas-kit.js; refs brief: refs-highseas-NOTES.md. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { HS_DROWNED_P, humanoidRig, buildSailorTorso, buildSailorLegs, buildBandanaHead,
         buildKelpStreamer, buildSailorArm, buildBase } from './rlm-highseas-kit.js';

export function buildHsDrowned(){
  const P = HS_DROWNED_P;
  const L = humanoidRig();

  /* the SLUMP — everything above the waist leans forward (+z) and sags; the head drops hardest.
     One shared lean fn keeps torso/head/bandana coherent (no floating parts). */
  const lean = (p)=>{
    const t = Math.max(0, (p.y - L.waistY) / (L.headTopY - L.waistY));   // 0 at waist → 1 at crown
    return V(p.x, p.y - 0.085*t*t, p.z + 0.16*t);
  };

  buildSailorTorso(L, P, { lean, sashHex:P.blood });
  buildSailorLegs(P, {
    ankL: V(-0.130, 0.06, -0.010), toeL: V(0.02, 0, 1),
    ankR: V( 0.150, 0.06,  0.060), toeR: V(0.35, 0, 1).normalize(),   // one foot dragged forward
    calfHex: P.skin,
  });
  buildBandanaHead(L, P, { xform: lean, bandanaHex: P.blood, bandanaDkHex: P.kelpDk });

  /* arms — both hang heavy, slightly forward, empty (the reach) */
  {
    const S1 = lean(V(0.245, L.shldY-0.01, 0.015));
    const E1 = V(0.300, 0.82, 0.14);
    const W1 = V(0.270, 0.56, 0.20);
    buildSailorArm(S1, E1, W1, P);
    tube(W1, W1.clone().add(V(0.01, -0.085, 0.035)), 0.040, 0.030, 6, P.skin, {capB:{hex:P.skinDk}});
    const S2 = lean(V(-0.245, L.shldY-0.01, 0.015));
    const E2 = V(-0.305, 0.80, 0.10);
    const W2 = V(-0.280, 0.52, 0.15);
    buildSailorArm(S2, E2, W2, P);
    tube(W2, W2.clone().add(V(-0.01, -0.085, 0.030)), 0.040, 0.030, 6, P.skin, {capB:{hex:P.skinDk}});

    /* kelp streamers off the forearms + shoulders (the drowned dressing) */
    buildKelpStreamer(V(0.285, 0.70, 0.17), 0.30, P, {sway: 0.035});
    buildKelpStreamer(V(-0.295, 0.66, 0.12), 0.36, P, {sway:-0.030});
    buildKelpStreamer(lean(V(0.10, L.shldY+0.02, 0.10)), 0.26, P, {sway: 0.020, w:0.030});
    buildKelpStreamer(lean(V(-0.16, L.shldY, 0.06)), 0.22, P, {sway:-0.025});
  }

  /* barnacle crust — pale nodules at the collar/shoulder line */
  for(const [x,y,z] of [[0.16, L.shldY+0.01, 0.09], [-0.11, L.shldY+0.03, 0.12], [0.02, L.neckY-0.02, 0.13]]){
    const q = lean(V(x,y,z));
    blob(q.x, q.y, q.z, 0.030, 0.022, 0.024, P.barnacle, 4, 3);
  }

  buildBase({disc:0x3a3f36, discTop:0x464c40});
}
