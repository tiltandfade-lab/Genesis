/* dev/model-qa/creatures/rlm-patch-kit-ganger.js — PATCH-KIT GANGER (chrome, Medium humanoid,
   CR 0.25). Read: a jittery low-tier ganger with off-brand patch-kit cybernetic grafts
   visibly overheating — a thin, twitchy build, one graft-arm venting a faint heat-shimmer
   glow, a graft plate on the neck/jaw with a small warning-orange overheat glow. Chrome
   register: cheap-miracle tech gone cut-rate and unstable — dull leather layers, off-brand
   beige-grey graft plastic (not the cleaner white of proper gear), a warm amber overheat
   glow instead of the cool blue-white of proper tech. NO eye quads — recessed brow shadow.
   Whole-object grammar: one function, one frame, no anchors. Medium size, base disc r=0.42.
   Bipedal, narrower/twitchier stance than the grunt. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPatchKitGanger(){
  const P = {
    leather:0x463527, leatherDk:0x2b2117, leatherLt:0x5a4634,
    graft:0xa89e8a, graftDk:0x746a58, graftLt:0xc4bba8,
    skin:0x937255, skinDk:0x654a30, skinLt:0xa3835f,
    heat:0xe89a3c, heatDk:0x8a4a18, glow:0xffb85c,
    hair:0x1c1a17, brow:0x35281c,
    boot:0x201c18, disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.60, 0),
    waist: V(0, 0.76, 0.01),
    chest: V(0, 0.94, -0.01),
    neck:  V(0, 1.08, 0),
    headB: V(0, 1.12, 0),
    headT: V(0, 1.28, 0),
  };

  /* thin, twitchy torso — narrower build than the grunt */
  tube(S.hip, S.waist, 0.125, 0.115, 8, P.leather, {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.115, 0.140, 8, P.leatherDk, {phase:Math.PI/8});
  tube(S.chest, S.neck, 0.140, 0.075, 8, P.leather, {phase:Math.PI/8, capB:{hex:P.leatherDk, lift:0.01}});
  /* thin patch-kit vest straps, no real plate coverage */
  for(const s of [-1,1]) quad(V(s*0.10,0.72,0.10), V(s*0.13,0.90,0.09), V(s*0.11,0.98,0.10), V(s*0.09,0.80,0.11), P.leatherLt, 0.06);

  /* neck/jaw graft plate with a small overheat glow slit */
  quad(V(-0.055,1.02,0.05), V(0.055,1.02,0.05), V(0.045,1.10,0.055), V(-0.045,1.10,0.055), P.graft, 0.05);
  quad(V(-0.022,1.045,0.075), V(0.022,1.045,0.075), V(0.018,1.06,0.08), V(-0.018,1.06,0.08), P.heat, 0.08);

  /* head — thin, twitchy, recessed brow shadow (no eyes), messy hair */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, rx:0.088, rz:0.082, hex:P.skinDk},
      {y:S.headB.y+0.08, rx:0.094, rz:0.086, hex:P.skin},
      {y:S.headT.y-0.03, rx:0.082, rz:0.076, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.hair);
    /* messy hair tufts */
    for(const s of [-1,0,1]) quad(V(s*0.03,S.headT.y-0.005,0), V(s*0.03+0.01,S.headT.y+0.05,0), V(s*0.03+0.005,S.headT.y+0.06,0.01), V(s*0.03-0.005,S.headT.y+0.005,0.01), P.hair, 0.05);
    quad(V(-0.06,S.headT.y-0.08,0.075), V(0.06,S.headT.y-0.08,0.075), V(0.05,S.headT.y-0.10,0.08), V(-0.05,S.headT.y-0.10,0.08), P.brow, 0.04);
  }

  /* arms — left arm bears a cheap graft with a heat-shimmer vent slit; right arm bare, twitchy */
  {
    const shL = V(-0.155, 0.94, 0);
    const elL = V(-0.19, 0.74, 0.03);
    const hnL = V(-0.17, 0.58, 0.05);
    tube(shL, elL, 0.050, 0.042, 6, P.leather, {phase:Math.PI/6});
    tube(elL, hnL, 0.042, 0.034, 6, P.graft, {phase:Math.PI/6, capB:{hex:P.graftDk, lift:0.02}});
    /* venting heat-shimmer glow slit on the forearm graft */
    quad(V(elL.x-0.03,elL.y-0.04,elL.z+0.03), V(elL.x+0.01,elL.y-0.04,elL.z+0.035), V(elL.x,elL.y-0.10,elL.z+0.03), V(elL.x-0.035,elL.y-0.10,elL.z+0.025), P.heat, 0.10);
    quad(V(elL.x-0.02,elL.y-0.05,elL.z+0.032), V(elL.x-0.004,elL.y-0.05,elL.z+0.034), V(elL.x-0.008,elL.y-0.09,elL.z+0.03), V(elL.x-0.024,elL.y-0.09,elL.z+0.028), P.glow, 0.1);

    const shR = V(0.145, 0.94, 0);
    const elR = V(0.175, 0.74, 0.03);
    const hnR = V(0.16, 0.58, 0.06);
    tube(shR, elR, 0.045, 0.038, 6, P.leather, {phase:Math.PI/6});
    tube(elR, hnR, 0.038, 0.030, 6, P.skinDk, {phase:Math.PI/6, capB:{hex:P.skinDk, lift:0.015}});
  }

  /* legs — thin, jittery stance */
  {
    const legPair=(sx)=>{
      const hipJ = V(sx*0.07, 0.58, 0);
      const knee = V(sx*0.085, 0.30, 0.02);
      const foot = V(sx*0.09, 0.03, 0.07);
      tube(hipJ, knee, 0.060, 0.044, 6, P.leatherDk, {phase:Math.PI/6});
      tube(knee, foot, 0.044, 0.034, 6, P.leather, {phase:Math.PI/6, capB:{hex:P.boot, lift:0.02}});
      quad(V(sx*0.09-0.04,0.05,foot.z-0.04), V(sx*0.09+0.04,0.05,foot.z-0.04), V(sx*0.09+0.036,0.02,foot.z+0.07), V(sx*0.09-0.036,0.02,foot.z+0.07), P.boot, 0.03);
    };
    legPair(-1); legPair(1);
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
