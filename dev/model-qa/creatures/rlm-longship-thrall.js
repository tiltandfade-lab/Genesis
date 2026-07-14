/* dev/model-qa/creatures/rlm-longship-thrall.js — Longship Thrall (theater, Medium, CR 0.25).
   A chained oarsman handed an axe at the beachhead. Whole-object bipedal grammar: one merged frame,
   a lean rower's build hunched from bench-work, an iron ankle-chain stub, ragged tunic, and a hand-axe
   raised awkwardly (fighting posture unpracticed vs a rower's). VS-desaturated cold northern palette
   (weathered gray-brown wool, dull iron chain, pale scarred skin). NO eye quads. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildLongshipThrall(){
  const P = {
    tunic:0x5a5244, tunicDk:0x3a352a, tunicLt:0x6e6552,
    skin:0x9a8268, skinDk:0x6b5847,
    hair:0x453a2e,
    iron:0x3a3c3e, ironDk:0x232527, ironLt:0x555a5c,
    wood:0x4a3826, axeHead:0x585a58, axeEdge:0x777a76,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — hunched rower's stance: shoulders rounded forward, low center. ---------- */
  const S = {
    hip:   V(0, 0.34, 0),
    waist: V(0, 0.46, 0.02),
    chest: V(0, 0.58, 0.06),
    shldr: V(0, 0.66, 0.05),
    neck:  V(0, 0.70, 0.03),
    headB: V(0, 0.74, 0.02),
    headT: V(0, 0.87, 0.0),
  };

  /* ---------- TORSO — lean hunched frame, ragged tunic. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   cz:S.hip.z,   rx:0.130, hex:P.tunicDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.118, hex:P.tunic},
      {y:S.chest.y, cz:S.chest.z, rx:0.135, hex:P.tunic},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.150, hex:P.tunicLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.80, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.tunicDk, true);
    // ragged hem tatters
    for(const a of [-0.10,-0.03,0.05,0.11]){
      quad(V(a,S.hip.y-0.04,S.hip.z+0.06), V(a+0.05,S.hip.y-0.04,S.hip.z+0.06),
           V(a+0.03,S.hip.y-0.14,S.hip.z+0.05), V(a-0.01,S.hip.y-0.14,S.hip.z+0.05), P.tunicDk, 0.06);
    }
  }

  /* ---------- HEAD — gaunt, tied-back hair, hollow socket shading only (no eye quads). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.080, hex:P.skinDk},
      {y:S.headB.y+0.07, r:0.086, hex:P.skin},
      {y:S.headT.y-0.03, r:0.072, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z-0.01), P.hair);
    // socket shading
    quad(V(-0.06,S.headB.y+0.05,S.headB.z+0.06), V(-0.015,S.headB.y+0.05,S.headB.z+0.065),
         V(-0.02,S.headB.y+0.08,S.headB.z+0.06), V(-0.055,S.headB.y+0.08,S.headB.z+0.055), P.skinDk, 0.05);
    quad(V(0.015,S.headB.y+0.05,S.headB.z+0.065), V(0.06,S.headB.y+0.05,S.headB.z+0.06),
         V(0.055,S.headB.y+0.08,S.headB.z+0.055), V(0.02,S.headB.y+0.08,S.headB.z+0.06), P.skinDk, 0.05);
    // hair tied back
    quad(V(-0.04,S.headT.y-0.02,S.headB.z-0.05), V(0.04,S.headT.y-0.02,S.headB.z-0.05),
         V(0.03,S.headB.y-0.05,S.headB.z-0.08), V(-0.03,S.headB.y-0.05,S.headB.z-0.08), P.hair, 0.05);
  }

  /* ---------- ARMS — one raising the axe overhead-awkward, one hanging with the chain stub. ---------- */
  {
    const shR = V(-0.14,0.65,0.04), elR = V(-0.22,0.78,0.10), hR = V(-0.14,0.92,0.14);
    tube(shR, elR, 0.045, 0.036, 6, P.tunic);
    tube(elR, hR, 0.036, 0.028, 6, P.skin, {capB:{hex:P.skin, lift:0.02}});
    const shL = V(0.14,0.64,0.04), elL = V(0.19,0.50,0.06), hL = V(0.15,0.36,0.05);
    tube(shL, elL, 0.045, 0.036, 6, P.tunic);
    tube(elL, hL, 0.036, 0.028, 6, P.skin, {capB:{hex:P.skin, lift:0.02}});
  }

  /* ---------- AXE — a hand-axe raised in the right hand, plain wood haft + iron head. ---------- */
  {
    const grip = V(-0.14,0.92,0.14), top = V(-0.10,1.06,0.20);
    tube(grip, top, 0.018, 0.014, 6, P.wood);
    // axe head fanning off the top
    quad(V(-0.10,1.06,0.20), V(-0.10,1.00,0.20), V(-0.24,1.02,0.24), V(-0.22,1.10,0.24), P.axeHead, 0.05);
    quad(V(-0.24,1.02,0.24), V(-0.22,1.10,0.24), V(-0.27,1.06,0.26), V(-0.27,1.06,0.26), P.axeEdge, 0.05);
  }

  /* ---------- LEGS — a bit bowed from bench-work; iron ankle-chain stub on one leg. ---------- */
  {
    const hipL = V(-0.07,0.34,0), kneeL = V(-0.10,0.18,0.04), footL = V(-0.10,0.02,0.06);
    tube(hipL, kneeL, 0.060, 0.048, 6, P.tunicDk);
    tube(kneeL, footL, 0.048, 0.036, 6, P.skinDk, {capB:{hex:P.ironDk, lift:0.02}});
    const hipR = V(0.07,0.34,0), kneeR = V(0.09,0.18,-0.02), footR = V(0.10,0.02,-0.04);
    tube(hipR, kneeR, 0.060, 0.048, 6, P.tunicDk);
    tube(kneeR, footR, 0.048, 0.036, 6, P.skinDk, {capB:{hex:P.ironDk, lift:0.02}});
    // ankle-chain stub + broken shackle
    const ankle = V(0.10,0.04,-0.04);
    ring(ankle, V(0,1,0), 0.045, 0.045, 8).forEach((p,i,arr)=>{
      const p2 = arr[(i+1)%arr.length];
      quad(p, p2, V(p2.x,p2.y+0.03,p2.z), V(p.x,p.y+0.03,p.z), P.iron, 0.05);
    });
    const link1 = V(0.13,0.03,-0.10), link2 = V(0.17,0.01,-0.16);
    tube(ankle, link1, 0.014, 0.012, 5, P.ironLt);
    tube(link1, link2, 0.012, 0.006, 5, P.iron, {capB:{hex:P.ironDk, lift:0.003}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
