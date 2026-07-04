/* dev/model-qa/creatures/mon-voidmonk-psion.js — the VOID-MONK-PSION (bespoke bipedal ASCETIC).
   Bestiary: void-monk-psion (githzerai-flavored psion). The read: a lean robed-and-hooded ascetic
   humanoid standing upright, one hand raised in a focused casting pose, the other held low/still at
   its side. Ashen grey-yellow skin, muted dirty-cloth robe, a faint psionic glow gathered at the
   raised hand. NO eye quads (dark hood-shadow recess only, house ruling 2026-07-04). Whole-object
   grammar: one function, one merged geometry frame, no anchors, no part-object transforms — every
   part is authored directly in world space. Medium ascetic: base disc r=0.42. */
import { V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildVoidMonkPsion(){
  /* ---------- PALETTE (VS-desaturated; ashen grey-yellow skin, muted dirty robe, faint glow) ---------- */
  const P = {
    skin:0x8c8468, skinDk:0x6b6550, skinLt:0x9c9578,           // ashen grey-yellow githzerai skin
    hood:0x554e3f, hoodDk:0x3a352a, hoodLt:0x676051,           // muted robe hood
    robe:0x4c4738, robeDk:0x353128, robeLt:0x5d5847,           // robe body — dirty desaturated cloth
    sash:0x6b5a3f, sashDk:0x493c2a,                            // rope-sash / wrap at waist
    socket:0x18150f,                                          // dark hood-shadow / socket recess
    hand:0x8c8468,
    glow:0xb8c2a0, glowDk:0x7f8a6a,                            // faint psionic glow, desaturated (not candy)
    foot:0x2c2820,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin', [P.hand]:'skin',
    [P.hood]:'cloth', [P.hoodDk]:'cloth', [P.hoodLt]:'cloth',
    [P.robe]:'cloth', [P.robeDk]:'cloth', [P.robeLt]:'cloth',
    [P.sash]:'cloth', [P.sashDk]:'cloth',
    [P.glow]:'glow', [P.glowDk]:'glow',
  });

  /* ---------- LANDMARKS — spine along +y, upright ascetic stance, kept within the r0.42 disc. ---- */
  const S = {
    root:  V(0, 0.02, 0.00),
    waist: V(0, 0.34, 0.00),
    chest: V(0, 0.62, 0.01),
    shldr: V(0, 0.80, 0.01),
    neck:  V(0, 0.88, 0.01),
    hoodC: V(0, 1.02, 0.00),      // hood crown center
    hoodF: V(0, 0.94, 0.09),      // hood front lip (shadow line over the face)
  };

  /* ---------- ROBE — a tapering loft from hem to shoulders, wider at the hem (floor-length). ---- */
  {
    const n = 10, ph = Math.PI/n;
    const bands = [
      {y:0.02,  cz:0.00, rx:0.205, rz:0.175, hex:P.robeDk},   // hem, wide + weighty
      {y:0.16,  cz:0.00, rx:0.185, rz:0.160, hex:P.robe},
      {y:0.34,  cz:0.00, rx:0.150, rz:0.135, hex:P.robeLt},   // waist (sash line)
      {y:0.52,  cz:0.00, rx:0.145, rz:0.120, hex:P.robe},
      {y:0.62,  cz:0.005,rx:0.140, rz:0.115, hex:P.robeDk},   // chest
      {y:0.80,  cz:0.01, rx:0.105, rz:0.090, hex:P.robeLt},   // shoulders (narrows to neck)
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* rope-sash wrap at the waist band */
    quad(V(-0.16,0.335,-0.02), V(0.16,0.335,-0.02), V(0.155,0.315,0.10), V(-0.155,0.315,0.10), P.sash, 0.05);
    quad(V(-0.155,0.315,0.10), V(0.155,0.315,0.10), V(0.02,0.16,0.12), V(-0.02,0.16,0.12), P.sashDk, 0.05); // hanging sash-tail
  }

  /* ---------- NECK + HEAD — narrow neck rising into a lean hooded skull-shape. ------------------ */
  {
    const n=8, ph=Math.PI/n;
    tube(S.neck, V(0,0.92,0.01), 0.052, 0.060, n, P.skinDk, {phase:ph});
    const bands=[
      {y:0.93, cz:0.00, rx:0.085, rz:0.088, hex:P.skin},     // jaw/cheek
      {y:1.00, cz:0.00, rx:0.092, rz:0.092, hex:P.skinLt},   // cranium (lean, slightly elongated githzerai skull)
      {y:1.07, cz:-0.01,rx:0.072, rz:0.072, hex:P.skinDk},   // crown taper
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.12,-0.01), P.skinDk);
    /* dark socket-shadow recess (NO eye quads — shape only) under the hood lip */
    quad(V(-0.055,0.965,0.075), V(0.055,0.965,0.075), V(0.045,0.935,0.082), V(-0.045,0.935,0.082), P.socket, 0.02);
    /* gaunt cheek hollows */
    quad(V(-0.088,0.945,0.02), V(-0.04,0.945,0.06), V(-0.05,0.905,0.05), V(-0.088,0.905,0.01), P.skinDk, 0.05);
    quad(V( 0.088,0.945,0.02), V( 0.04,0.945,0.06), V( 0.05,0.905,0.05), V( 0.088,0.905,0.01), P.skinDk, 0.05);
  }

  /* ---------- HOOD — draped over the crown, a stiff peaked cowl with a shadowed front lip. ------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:0.83, cz:0.00, rx:0.125, rz:0.115, hex:P.hoodDk},   // hood base at the shoulders
      {y:0.97, cz:0.01, rx:0.118, rz:0.120, hex:P.hood},     // hood mid, draped wide of the skull
      {y:1.09, cz:0.00, rx:0.082, rz:0.086, hex:P.hoodLt},   // hood peak narrows
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.16,-0.01), P.hoodDk);
    /* the hood's shadowed front lip overhang, dipping low over the socket recess */
    quad(V(-0.075,0.965,0.095), V(0.075,0.965,0.095), V(0.078,0.905,0.10), V(-0.078,0.905,0.10), P.hoodDk, 0.04);
  }

  /* ---------- ARMS — one raised in a focused casting pose (psionic gather), one low + still. ---- */
  {
    const n=6;
    /* RAISED arm: shoulder -> elbow bent up -> forearm angled in toward chest height, palm up-ish */
    const shR = V(0.115, 0.78, 0.01);
    const elR = V(0.205, 0.72, 0.12);
    const wrR = V(0.145, 0.86, 0.20);
    const hnR = V(0.095, 0.92, 0.24);
    tube(shR, elR, 0.052, 0.042, n, P.hoodDk, {capA:{hex:P.hoodDk}});   // sleeve upper
    tube(elR, wrR, 0.040, 0.032, n, P.hoodDk);                          // sleeve fore
    tube(wrR, hnR, 0.026, 0.020, n, P.skin, {capB:{hex:P.skinLt, lift:0.02}}); // bare hand
    /* faint psionic glow gathered above the raised palm — small dim glow blob, desaturated not candy */
    {
      const gC = V(0.09, 0.965, 0.255);
      const gr = ring(gC, V(0,1,0), 0.028, 0.028, 6, 0);
      capFan(gr, V(gC.x, gC.y+0.03, gC.z), P.glow);
      capFan(gr, V(gC.x, gC.y-0.02, gC.z), P.glowDk, true);
    }

    /* LOW arm: hangs still at the side, sleeve to a loose hand near the hip. */
    const shL = V(-0.115, 0.78, 0.01);
    const elL = V(-0.150, 0.55, 0.04);
    const wrL = V(-0.135, 0.36, 0.05);
    const hnL = V(-0.128, 0.29, 0.07);
    tube(shL, elL, 0.052, 0.042, n, P.hoodDk, {capA:{hex:P.hoodDk}});
    tube(elL, wrL, 0.040, 0.030, n, P.hoodDk);
    tube(wrL, hnL, 0.024, 0.018, n, P.skin, {capB:{hex:P.skinDk, lift:0.018}});
  }

  /* ---------- FEET — bare ascetic feet, just visible at the hem, planted narrow. ----------------- */
  {
    for(const s of [-1,1]){
      const a = V(s*0.075, 0.03, -0.02);
      const b = V(s*0.075, 0.015, 0.09);
      tube(a, b, 0.045, 0.038, 5, P.foot, {capA:{hex:P.foot}, capB:{hex:P.foot, lift:0.01}});
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
