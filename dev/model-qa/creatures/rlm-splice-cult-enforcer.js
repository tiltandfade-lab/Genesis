/* dev/model-qa/creatures/rlm-splice-cult-enforcer.js — SPLICE-CULT ENFORCER (chrome, Medium
   humanoid, CR 5). Read: a machine-ascension zealot — half his body still flesh (robed,
   chanting), the other half replaced by exposed chrome cybernetics (bare graft arm, a
   plated leg, a chrome jaw-graft on the face), ritual wiring/prayer-cable strung across
   the chest like beads. Chrome register: cultist robe browns/reds + gunmetal grafts + a
   thin cyan ritual-glow at the wiring nodes. NO eye quads — one graft-socket lens on the
   mechanical half, a shadowed hood on the flesh half. Whole-object grammar: one function,
   one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSpliceCultEnforcer(){
  const P = {
    robe:0x6a2a28, robeDk:0x421a18, robeLt:0x8a3a34,
    skin:0x8f6f52, skinDk:0x63482f,
    graft:0x767a7e, graftDk:0x484c50, graftLt:0x9a9ea2,
    lens:0x6fd8f0, lensDk:0x1c5a68,
    cable:0x2a2c2e, node:0x7fe0f5, nodeDk:0x2c7a8a,
    hood:0x2a1614,
    boot:0x1e1a16, disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.63, 0),
    waist: V(0, 0.82, 0.01),
    chest: V(0, 1.06, -0.02),
    neck:  V(0, 1.22, 0),
    headB: V(0, 1.26, 0),
    headT: V(0, 1.44, 0),
  };

  /* torso — asymmetric split: robe drapes the flesh-half, exposed chrome plating the graft-half */
  tube(S.hip, S.waist, 0.170, 0.155, 8, P.robeDk, {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.155, 0.205, 8, P.robe,  {phase:Math.PI/8});
  tube(S.chest, S.neck, 0.205, 0.095, 8, P.robeDk, {phase:Math.PI/8, capB:{hex:P.skinDk, lift:0.01}});
  /* robe drape on the left/flesh half */
  quad(V(-0.20,0.68,0.10), V(-0.02,0.66,0.16), V(-0.02,1.10,0.14), V(-0.20,1.08,0.10), P.robe, 0.06);
  quad(V(-0.24,0.64,0.02), V(-0.20,0.68,0.10), V(-0.20,1.08,0.10), V(-0.24,1.02,0.02), P.robeDk, 0.05);
  /* exposed chrome graft plating on the right torso half */
  quad(V(0.02,0.70,0.14), V(0.20,0.68,0.10), V(0.22,1.06,0.08), V(0.03,1.09,0.13), P.graft, 0.05);
  quad(V(0.04,0.80,0.155), V(0.16,0.78,0.12), V(0.17,0.98,0.10), V(0.05,1.00,0.14), P.graftDk, 0.05);

  /* ritual prayer-cable strung across the chest like beads, glowing nodes */
  {
    const pts = [[-0.14,1.05],[-0.05,0.98],[0.06,0.92],[0.15,0.86]];
    for(let i=0;i<pts.length-1;i++){
      const [x0,y0]=pts[i], [x1,y1]=pts[i+1];
      tube(V(x0,y0,0.20), V(x1,y1,0.19), 0.012, 0.012, 4, P.cable);
    }
    for(const [x,y] of pts){
      const nc=V(x,y,0.205);
      quad(V(nc.x-0.018,nc.y-0.018,nc.z), V(nc.x+0.018,nc.y-0.018,nc.z), V(nc.x+0.015,nc.y+0.015,nc.z), V(nc.x-0.015,nc.y+0.015,nc.z), P.node, 0.15);
    }
  }

  /* head — hood shadow on the flesh (left) side, chrome jaw-graft + lens on the mechanical (right) side */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, rx:0.100, rz:0.094, hex:P.skinDk},
      {y:S.headB.y+0.10, rx:0.106, rz:0.098, hex:P.skin},
      {y:S.headT.y-0.03, rx:0.094, rz:0.086, hex:P.hood},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.hood);
    /* hood drape shadowing the left/flesh side of the face */
    quad(V(-0.11,S.headT.y-0.02,0.03), V(-0.02,S.headT.y-0.01,0.09), V(-0.03,S.headB.y-0.02,0.07), V(-0.11,S.headB.y-0.01,0.01), P.hood, 0.06);
    /* graft socket lens on the right/mechanical side (recessed disc, not an eye quad) */
    quad(V(0.03,S.headT.y-0.10,0.09), V(0.09,S.headT.y-0.10,0.085), V(0.085,S.headT.y-0.14,0.08), V(0.03,S.headT.y-0.14,0.085), P.graftDk, 0.03);
    quad(V(0.045,S.headT.y-0.115,0.088), V(0.075,S.headT.y-0.115,0.084), V(0.072,S.headT.y-0.13,0.082), V(0.045,S.headT.y-0.13,0.085), P.lens, 0.06);
    /* chrome jaw-graft plate on the mechanical side */
    quad(V(0.02,S.headB.y+0.01,0.075), V(0.09,S.headB.y-0.01,0.06), V(0.09,S.headB.y-0.06,0.05), V(0.02,S.headB.y-0.04,0.065), P.graft, 0.04);
  }

  /* arms — left arm robed/flesh (folded in chant), right arm bare exposed graft */
  {
    const shL = V(-0.20, 0.98, 0);
    const elL = V(-0.24, 0.80, 0.10);
    const hnL = V(-0.14, 0.72, 0.20);
    tube(shL, elL, 0.068, 0.058, 6, P.robe, {phase:Math.PI/6});
    tube(elL, hnL, 0.056, 0.040, 6, P.robeDk, {phase:Math.PI/6, capB:{hex:P.skinDk, lift:0.015}});

    const shR = V(0.20, 0.98, 0);
    const elR = V(0.25, 0.78, 0.06);
    const hnR = V(0.22, 0.58, 0.02);
    tube(shR, elR, 0.062, 0.052, 6, P.graft, {phase:Math.PI/6});
    tube(elR, hnR, 0.050, 0.038, 6, P.graftDk, {phase:Math.PI/6, capB:{hex:P.graftLt, lift:0.015}});
    /* small ritual-node glow set into the graft forearm */
    quad(V(elR.x-0.02,elR.y-0.06,elR.z+0.03), V(elR.x+0.02,elR.y-0.06,elR.z+0.03), V(elR.x+0.016,elR.y-0.10,elR.z+0.03), V(elR.x-0.016,elR.y-0.10,elR.z+0.03), P.node, 0.15);
  }

  /* legs — one robed, one plated (mirrors the torso split) */
  {
    const hipL = V(-0.115, 0.61, 0);
    const kneeL= V(-0.135, 0.32, 0.02);
    const footL= V(-0.14, 0.03, 0.09);
    tube(hipL, kneeL, 0.088, 0.066, 6, P.robeDk, {phase:Math.PI/6});
    tube(kneeL, footL, 0.064, 0.048, 6, P.robe, {phase:Math.PI/6, capB:{hex:P.boot, lift:0.02}});
    quad(V(-0.14-0.055,0.05,footL.z-0.06), V(-0.14+0.055,0.05,footL.z-0.06), V(-0.14+0.05,0.02,footL.z+0.09), V(-0.14-0.05,0.02,footL.z+0.09), P.boot, 0.03);

    const hipR = V(0.115, 0.61, 0);
    const kneeR= V(0.135, 0.32, 0.02);
    const footR= V(0.14, 0.03, 0.09);
    tube(hipR, kneeR, 0.088, 0.066, 6, P.graft, {phase:Math.PI/6});
    tube(kneeR, footR, 0.064, 0.048, 6, P.graftDk, {phase:Math.PI/6, capB:{hex:P.graftLt, lift:0.02}});
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
