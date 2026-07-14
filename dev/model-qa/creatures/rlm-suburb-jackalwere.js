/* dev/model-qa/creatures/rlm-suburb-jackalwere.js — THE JACKALWERE (suburb, Medium, CR 2).
   FEATURE CHECKLIST: jackal head (long snout, tall ears, dark sockets) on a human neck · plaid
   button shirt + khaki trousers · one elbow leaning on an unseen doorframe · ankles crossed ·
   off hand holding a knife low behind the near thigh, angled to catch a glint · ground shadow
   pool (this is not a hover unit but the disc IS the shadow-read; kept in-band regardless).
   POSE SENTENCE: weight dumped through a raised left arm propped on nothing, hips kicked out
   and ankles crossed for the lean, jackal head tipped toward the viewer in a performance of
   warmth while the right hand keeps a blade tucked flat against the outside of the thigh.
   SPINE-GESTURE SENTENCE: pelvis kicks right and down onto the crossed-leg lean, the spine
   arcs left through the ribs to counter it, the shoulders roll level-then-tilt toward the
   propped arm, and the neck snaps the jackal head back toward center — one long lazy S from
   hip to snout, the "casual" that sells the lie.
   Whole-object grammar, one merged frame, no anchors. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildJackalwere(){
  const P = {
    shirt:0x8a9068, shirtDk:0x5f6448, shirtLt:0xaab082,   // faded plaid button shirt (suburb khaki-olive)
    plaid:0x6e4f3a,                                        // plaid crossbar accent
    pants:0xbfae83, pantsDk:0x93855e,                      // khaki trousers
    shoe:0x3a3530, shoeSole:0x201d1a,
    skin:0xc79a6b, skinDk:0x9a7148,                         // human hands/neck
    jackal:0xa3702f, jackalDk:0x6e4a1c, jackalLt:0xc08c46,  // tawny jackal-fur head, suburb-lit not lost-world black
    jackalMuz:0x4a3016,
    metal:0xc7c9cc, metalDk:0x7a7c7e,                       // blade
    disc:0x3f4438, discTop:0x4c5243,
  };

  /* ---------- LEGS — crossed ankles, weight kicked onto the near (right) leg. ---------- */
  {
    // stance leg (right, weight-bearing, straight-ish, slight outward kick)
    const hipR = V(0.10, 0.52, 0.00);
    const kneeR = V(0.13, 0.28, 0.03);
    const ankR = V(0.09, 0.06, 0.02);
    tube(hipR, kneeR, 0.075, 0.062, 7, P.pants);
    tube(kneeR, ankR, 0.058, 0.040, 7, P.pants, {capB:{hex:P.pantsDk, lift:0.01}});
    // shoe
    const shR0 = ring(V(0.09,0.045,0.02), V(0,1,0), 0.05, 0.06, 6, Math.PI/6);
    const shR1 = ring(V(0.10,0.012,0.06), V(0,1,0), 0.052, 0.085, 6, Math.PI/6);
    stitch([shR0,shR1], ()=>P.shoe);
    capFan(shR1, V(0.10,0.010,0.06), P.shoeSole, true);
    capFan(shR0, V(0.09,0.05,0.00), P.shoe);

    // crossed leg (left, angled hard across the stance leg, foot planted well past it — the
    // toe pokes out past the stance foot's outside edge so the cross reads in silhouette)
    const hipL = V(-0.10, 0.52, 0.00);
    const kneeL = V(0.08, 0.30, 0.13);
    const ankL = V(0.28, 0.10, 0.07);
    tube(hipL, kneeL, 0.075, 0.060, 7, P.pants);
    tube(kneeL, ankL, 0.056, 0.038, 7, P.pantsDk, {capB:{hex:P.pantsDk, lift:0.01}});
    const shL0 = ring(V(0.28,0.075,0.07), V(0,1,0), 0.048, 0.058, 6, Math.PI/5);
    const shL1 = ring(V(0.32,0.014,0.16), V(0,1,0), 0.050, 0.082, 6, Math.PI/5);
    stitch([shL0,shL1], ()=>P.shoe);
    capFan(shL1, V(0.32,0.012,0.16), P.shoeSole, true);
    capFan(shL0, V(0.28,0.078,0.07), P.shoe);
  }

  /* ---------- HIPS/TORSO — pelvis kicked right, spine arcs left to counter (the lean). ------- */
  const bands = [
    {y:0.50, cx:0.03, cz:0.00, rx:0.155, hex:P.pants},      // hips (kicked toward stance leg)
    {y:0.66, cx:0.00, cz:0.00, rx:0.150, hex:P.shirtDk},    // waist, spine starting to arc left
    {y:0.84, cx:-0.04, cz:0.02, rx:0.165, hex:P.shirt},     // ribs, arced left, chest forward-open
    {y:1.00, cx:-0.05, cz:0.02, rx:0.145, hex:P.shirtLt},   // upper chest
    {y:1.12, cx:-0.02, cz:0.02, rx:0.098, hex:P.shirtDk},   // shoulders (rolling back toward center)
  ];
  {
    const n=9, ph=Math.PI/n;
    const rings = bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0.03,0.485,0.00), P.pantsDk, true);
  }
  // plaid crossbar accents on the shirt (suburb-costume signature, not fur — reads "clothes")
  for(let i=0;i<3;i++){
    const y = 0.72+i*0.13;
    quad(V(-0.16,y,0.10-i*0.01), V(0.14,y,0.06-i*0.02), V(0.13,y-0.025,0.08-i*0.02), V(-0.15,y-0.025,0.12-i*0.01), P.plaid, 0.05);
  }
  for(let i=0;i<3;i++){
    const x = -0.08+i*0.09;
    quad(V(x,0.68,0.14), V(x+0.02,1.05,0.10), V(x+0.01,1.04,0.09), V(x-0.01,0.67,0.13), P.plaid, 0.04);
  }
  // shirt collar/placket + a button row (mid-lie casual detail)
  quad(V(-0.05,1.08,0.09), V(0.03,1.08,0.09), V(0.02,0.70,0.135), V(-0.04,0.70,0.135), P.shirtDk, 0.03);
  for(let i=0;i<4;i++){
    const y = 0.76+i*0.08;
    quad(V(-0.012,y,0.145), V(0.012,y,0.145), V(0.010,y-0.014,0.146), V(-0.010,y-0.014,0.146), P.shirtDk, 0.02);
  }

  /* ---------- ARMS — left propped/leaning on an unseen frame, right low with the hidden blade. */
  {
    // LEANING arm (left, elbow up near shoulder height, forearm angled up-and-out as if propped
    // on an unseen doorframe — the joint bends hard, ~110deg, selling the lean)
    const shL = V(-0.135, 1.08, 0.02);
    const elL = V(-0.33, 0.88, 0.12);
    const hdL = V(-0.34, 1.10, 0.02);
    tube(shL, elL, 0.058, 0.048, 6, P.shirt);
    tube(elL, hdL, 0.046, 0.034, 6, P.skin, {capB:{hex:P.skinDk, lift:0.01}});
    // relaxed propped hand — a small flat knuckle mass, fingers loosely curled against nothing
    const hnd0 = ring(V(-0.34,1.10,0.02), V(0,1,0), 0.030, 0.030, 6, Math.PI/6);
    const hnd1 = ring(V(-0.345,1.13,0.03), V(0,1,0), 0.024, 0.024, 6, Math.PI/6);
    stitch([hnd0,hnd1], ()=>P.skinDk);
    capFan(hnd1, V(-0.345,1.14,0.03), P.skinDk);

    // BLADE arm (right, low and held just clear of the outside of the near thigh — tucked from
    // the "front" the jackal head is performing warmth toward, but angled so the camera catches
    // a metal glint the doorstep victim wouldn't see)
    const shR = V(0.135, 1.06, 0.00);
    const elR = V(0.20, 0.80, -0.02);
    const hdR = V(0.215, 0.55, -0.03);
    tube(shR, elR, 0.058, 0.046, 6, P.shirt);
    tube(elR, hdR, 0.044, 0.032, 6, P.skin, {capB:{hex:P.skinDk, lift:0.01}});
    // fist gripping the blade handle
    const fist0 = ring(V(0.215,0.55,-0.03), V(0,1,0), 0.030, 0.030, 6, Math.PI/6);
    const fist1 = ring(V(0.212,0.51,-0.04), V(0,1,0), 0.028, 0.028, 6, Math.PI/6);
    stitch([fist0,fist1], ()=>P.skinDk);
    // blade — handle down, held a hand's width clear of the thigh, edge canted to catch a glint
    const hb = V(0.212,0.51,-0.04), ht = V(0.205,0.36,-0.06);
    tube(hb, ht, 0.015, 0.011, 4, P.jackalDk); // grip
    // blade body: two quads forming a thin tapered blade (the "glint" is the light-metal face)
    quad(V(0.198,0.36,-0.045), V(0.230,0.355,-0.075), V(0.185,0.235,-0.115), V(0.170,0.240,-0.070), P.metal, 0.10);
    quad(V(0.230,0.355,-0.075), V(0.198,0.36,-0.045), V(0.170,0.240,-0.070), V(0.185,0.235,-0.115), P.metalDk, 0.06);
  }

  /* ---------- JACKAL HEAD — tilted toward the viewer, fake warmth, on a human neck. ---------- */
  {
    // short human neck, tilted to carry the counter-rotation up from the shoulders
    const nkB = V(-0.01, 1.14, 0.02), nkT = V(0.01, 1.22, 0.03);
    tube(nkB, nkT, 0.052, 0.050, 7, P.skin);

    const n=9, ph=Math.PI/n;
    // head base tilted: center offset +x/+z and yaw so the whole head reads "tipped toward you"
    const bands2=[
      {y:1.24, cx:0.02, cz:0.03, rx:0.090, rz:0.092, hex:P.jackal},
      {y:1.34, cx:0.03, cz:0.04, rx:0.096, rz:0.093, hex:P.jackalLt},
      {y:1.44, cx:0.03, cz:0.03, rx:0.076, rz:0.076, hex:P.jackalDk},
    ];
    const rings = bands2.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands2[b].hex);
    capFan(rings.at(-1), V(0.03,1.46,0.03), P.jackalDk);

    // long tapering snout, forward and slightly down (the "tilted toward you" read)
    const snB = V(0.02, 1.30, 0.10);
    const snM = V(0.01, 1.285, 0.25);
    const snT = V(0.00, 1.275, 0.36);
    tube(snB, snM, 0.062, 0.040, n, P.jackal, {raz:0.066, rbz:0.038, phase:ph});
    tube(snM, snT, 0.040, 0.016, n, P.jackalDk, {raz:0.036, rbz:0.014, phase:ph, capB:{hex:P.jackalDk, lift:0.005}});
    // dark mouth line — curved slightly upward, the performed smile
    quad(V(-0.03,1.263,0.17), V(0.03,1.263,0.17), V(0.018,1.256,0.31), V(-0.018,1.256,0.31), P.jackalMuz, 0.03);

    // eyes — small warm-lit patches (NOT dark sockets like the lost-world priest; this jackal is
    // suburb-lit and trying to look friendly, so give it visible amber eyes)
    for(const s of [-1,1]){
      const sx=0.02+s*0.048, sy=1.325, sz=0.095;
      quad(V(sx-0.018,sy+0.012,sz), V(sx+0.018,sy+0.012,sz), V(sx+0.015,sy-0.013,sz+0.005), V(sx-0.015,sy-0.013,sz+0.005), 0xd9a53a, 0.05);
    }

    // tall pointed ears, angled forward-alert (performing interest, not menace)
    for(const s of [-1,1]){
      const eb = V(0.02+s*0.058, 1.42, 0.00);
      const et = V(0.03+s*0.10, 1.62, -0.03);
      tube(eb, et, 0.032, 0.006, 5, P.jackal, {capB:{hex:P.jackalDk, lift:0.005}});
    }
  }

  /* ---------- base disc (Medium: r=0.42) — the ground/shadow read. ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
