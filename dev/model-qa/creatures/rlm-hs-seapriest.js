/* dev/model-qa/creatures/rlm-hs-seapriest.js — SEA-PRIEST (the cult line: sahuagin-priests,
   siren-callers, drowned-god clergy). Hooded (parts.js hood in deep teal), full-length brine-dark
   robe (no legs — the robe IS the silhouette), hemp cord at the waist, both hands on a tall
   boarding-harpoon totem held vertical at the right side, ritual stance. A teal figure among
   sailcloth figures — the one cold silhouette in the kit. Medium ≈1.45u, disc r=0.42.
   Kit: rlm-highseas-kit.js; refs brief: refs-highseas-NOTES.md. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { HS_P, humanoidRig, buildHead, buildHood, buildHarpoon,
         buildSailorArm, buildFist, buildBase } from './rlm-highseas-kit.js';

export function buildHsSeapriest(){
  const P = Object.assign({}, HS_P, {
    robe:HS_P.teal, robeDk:HS_P.tealDk, robeDeep:0x1e3e46,
    hood:HS_P.tealDk, hoodDk:0x1a333a,
  });
  const L = humanoidRig();

  /* full-length robe — one loft, hem to neck; kelp-dark below, teal above (rising value) */
  stack([
    {y:0.045,     rx:0.235, rz:0.195, hex:P.robeDeep},
    {y:0.28,      rx:0.215, rz:0.175, hex:P.robeDk},
    {y:0.52,      rx:0.190, rz:0.155, hex:P.robeDk},
    {y:L.hipY,    rx:0.180, rz:0.145, hex:P.robe},
    {y:L.waistY,  rx:0.165, rz:0.132, hex:P.robe},
    {y:L.chestY,  rx:0.215, rz:0.158, hex:P.robe},
    {y:L.shldY,   rx:0.225, rz:0.152, hex:P.robe},
    {y:L.neckY,   rx:0.085, rz:0.080, hex:P.robeDk},
  ], 8, {capTop:{hex:P.robeDk, lift:0.005}, capBot:{hex:P.robeDeep, lift:0.01}});

  /* hemp cord at the waist, knotted ends dropping down the front */
  stack([
    {y:L.waistY-0.015, rx:0.172, rz:0.138, hex:P.hemp},
    {y:L.waistY+0.020, rx:0.170, rz:0.136, hex:P.hemp},
  ], 8, {});
  quad(V(-0.020, L.waistY-0.01, 0.145), V(0.014, L.waistY-0.01, 0.148),
       V(0.010, 0.58, 0.135), V(-0.016, 0.58, 0.132), P.hempDk, 0.04);

  /* head + hood (deep teal, dark lining — the face window shadows out) */
  buildHead(L, P);
  buildHood(L, P);

  /* HARPOON-TOTEM FIRST — vertical at the right side; hemp fetish rags lashed below the head */
  const HX = 0.30, HZ = 0.10;
  const grips = buildHarpoon(HX, HZ, P, { yBot: 0.05, yTop: 1.60 });
  /* fetish rags off the lashing */
  quad(V(HX-0.020, 1.50, HZ+0.024), V(HX+0.020, 1.50, HZ+0.024),
       V(HX+0.028, 1.36, HZ+0.060), V(HX-0.028, 1.36, HZ+0.060), P.hempDk, 0.05);
  quad(V(HX-0.016, 1.50, HZ-0.020), V(HX+0.016, 1.50, HZ-0.020),
       V(HX+0.010, 1.40, HZ-0.055), V(HX-0.010, 1.40, HZ-0.055), P.blood, 0.04);

  /* both hands on the shaft — high hand over-grip, low hand under-grip (the ritual plant) */
  {
    const S1 = V(0.245, L.shldY-0.01, 0.015);
    const E1 = V(0.330, 0.99, 0.075);
    const W1 = grips.high.clone().add(V(-0.045, 0.010, -0.020));
    buildSailorArm(S1, E1, W1, P, {sleeveHex:P.robe, foreHex:P.robeDk});
    buildFist(grips.high, V(0,1,0), P);
    const S2 = V(-0.245, L.shldY-0.01, 0.015);
    const E2 = V(-0.240, 0.885, 0.13);
    const W2 = grips.low.clone().add(V(-0.055, 0.015, -0.015));
    buildSailorArm(S2, E2, W2, P, {sleeveHex:P.robe, foreHex:P.robeDk});
    buildFist(grips.low, V(0,1,0), P);
  }

  buildBase({disc:P.disc, discTop:P.discTop});
}
