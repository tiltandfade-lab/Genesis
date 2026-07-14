/* dev/model-qa/creatures/rlm-chrome-ganger-grunt.js — CHROME-GANGER GRUNT (chrome, Medium
   humanoid, CR 0.5). Read: a scrappy street-ganger in leather-and-plastic plate armor
   (mismatched scavenged panels, not uniform gear), gripping a jury-rigged stun baton crackling
   at the tip. Chrome register: clean hard surfaces / cheap miracles underneath the grime —
   dull leather browns, cracked white polymer plates, a live blue-white spark at the baton
   tip. NO eye quads — a recessed brow shadow instead. Whole-object grammar: one function, one
   frame, no anchors. Medium size, base disc r=0.42. Bipedal stance, standing upright. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildChromeGangerGrunt(){
  const P = {
    leather:0x4a3a2c, leatherDk:0x2e241a, leatherLt:0x5e4a38,
    plate:0xc8cdd0, plateDk:0x8a9094, plateLt:0xe0e4e6,
    skin:0x9a7a5c, skinDk:0x6e5138,
    hair:0x201d18, brow:0x3a2c20,
    baton:0x2a2c2e, batonDk:0x161819,
    spark:0x6fd8f0, sparkDk:0x2a8fa8,
    boot:0x241f1a, disc:0x4a4038, discTop:0x585047,
  };

  /* upright bipedal spine — hip -> chest -> neck -> head, standing */
  const S = {
    hip:   V(0, 0.62, 0),
    waist: V(0, 0.78, 0.01),
    chest: V(0, 0.98, -0.01),
    neck:  V(0, 1.12, 0),
    headB: V(0, 1.16, 0),
    headT: V(0, 1.32, 0),
  };

  /* torso — leather jacket base, patched plastic plate over the chest */
  tube(S.hip, S.waist, 0.155, 0.140, 8, P.leather,  {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.140, 0.175, 8, P.leatherDk, {phase:Math.PI/8});
  tube(S.chest, S.neck, 0.175, 0.085, 8, P.leather,  {phase:Math.PI/8, capB:{hex:P.leatherDk, lift:0.01}});
  /* chest plate patches — mismatched plastic panels strapped over leather */
  quad(V(-0.13,0.90,0.14), V(0.13,0.90,0.14), V(0.10,1.06,0.13), V(-0.10,1.06,0.13), P.plate, 0.06);
  quad(V(-0.09,0.72,0.15), V(0.09,0.72,0.15), V(0.07,0.88,0.145), V(-0.07,0.88,0.145), P.plateDk, 0.05);
  /* shoulder pauldron scraps */
  for(const s of [-1,1]) quad(V(s*0.13,1.00,-0.02), V(s*0.20,0.98,-0.02), V(s*0.19,0.90,0.02), V(s*0.12,0.92,0.02), P.plate, 0.06);

  /* head — low blocky skull shape, no eye quads, recessed brow shadow, buzzed hair cap */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, rx:0.100, rz:0.095, hex:P.skinDk},
      {y:S.headB.y+0.09, rx:0.108, rz:0.100, hex:P.skin},
      {y:S.headT.y-0.03, rx:0.095, rz:0.088, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.hair);
    /* recessed brow shadow band (no eyes) */
    quad(V(-0.07,S.headT.y-0.09,0.085), V(0.07,S.headT.y-0.09,0.085), V(0.06,S.headT.y-0.12,0.09), V(-0.06,S.headT.y-0.12,0.09), P.brow, 0.04);
    /* jaw / chin */
    quad(V(-0.06,S.headB.y-0.02,0.07), V(0.06,S.headB.y-0.02,0.07), V(0.045,S.headB.y-0.05,0.06), V(-0.045,S.headB.y-0.05,0.06), P.skinDk, 0.04);
  }

  /* arms — left arm at side, right arm raised gripping the baton forward */
  {
    const shL = V(-0.185, 0.98, 0);
    const elL = V(-0.22, 0.78, 0.03);
    const hnL = V(-0.20, 0.62, 0.05);
    tube(shL, elL, 0.058, 0.046, 6, P.leather, {phase:Math.PI/6});
    tube(elL, hnL, 0.046, 0.036, 6, P.leatherDk, {phase:Math.PI/6, capB:{hex:P.skinDk, lift:0.02}});

    const shR = V(0.185, 0.98, 0);
    const elR = V(0.23, 0.86, 0.10);
    const hnR = V(0.20, 0.86, 0.28);
    tube(shR, elR, 0.058, 0.046, 6, P.leather, {phase:Math.PI/6});
    tube(elR, hnR, 0.046, 0.038, 6, P.leatherDk, {phase:Math.PI/6, capB:{hex:P.skinDk, lift:0.02}});

    /* jury-rigged stun baton — taped grip + shaft + sparking tip */
    const gB = hnR;
    const gT = V(hnR.x, hnR.y+0.02, hnR.z+0.16);
    const tip = V(hnR.x-0.01, hnR.y+0.03, hnR.z+0.34);
    tube(gB, gT, 0.024, 0.020, 6, P.batonDk);
    tube(gT, tip, 0.020, 0.012, 6, P.baton, {capB:{hex:P.spark, lift:0.01}});
    /* crackling spark burst at the tip */
    for(const a of [0, 2.1, 4.2]){
      const dx=Math.cos(a)*0.03, dy=Math.sin(a)*0.03;
      quad(V(tip.x,tip.y,tip.z), V(tip.x+dx,tip.y+dy,tip.z+0.02), V(tip.x+dx*0.6,tip.y+dy*0.6+0.02,tip.z+0.03), V(tip.x,tip.y,tip.z+0.01), P.sparkDk, 0.08);
    }
  }

  /* legs — mismatched leather/plastic-plated pants, boots */
  {
    const legPair=(sx)=>{
      const hipJ = V(sx*0.09, 0.60, 0);
      const knee = V(sx*0.10, 0.32, 0.02);
      const foot = V(sx*0.10, 0.03, 0.08);
      tube(hipJ, knee, 0.078, 0.058, 6, P.leatherDk, {phase:Math.PI/6});
      tube(knee, foot, 0.058, 0.044, 6, P.leather, {phase:Math.PI/6, capB:{hex:P.boot, lift:0.02}});
      /* boot */
      quad(V(sx*0.10-0.05,0.05,foot.z-0.05), V(sx*0.10+0.05,0.05,foot.z-0.05), V(sx*0.10+0.045,0.02,foot.z+0.09), V(sx*0.10-0.045,0.02,foot.z+0.09), P.boot, 0.03);
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
