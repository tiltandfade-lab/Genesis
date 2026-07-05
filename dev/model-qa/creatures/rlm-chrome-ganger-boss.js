/* dev/model-qa/creatures/rlm-chrome-ganger-boss.js — CHROME-GANGER BOSS (chrome, Medium
   humanoid, CR 4). Read: a bulkier, scarred cyber-ganger crew boss — heavier plate than the
   grunt, bristling with mismatched cybernetic grafts (a chunky arm graft, a shoulder port,
   a jaw graft), gripping a long rail-pistol with a visible capacitor coil. Chrome register:
   clean hard surfaces / cheap miracles gone grimy — gunmetal grafts, cracked white plate,
   a live blue-white glow at the coil. NO eye quads — one graft eye-socket lens instead (not
   a quad "eye", a lens disc set in a socket). Whole-object grammar: one function, one frame,
   no anchors. Medium size, base disc r=0.42. Bipedal, wider stance than the grunt. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildChromeGangerBoss(){
  const P = {
    leather:0x453528, leatherDk:0x2a2018, leatherLt:0x5a4736,
    plate:0xb8bdc0, plateDk:0x7c8184, plateLt:0xd4d8da,
    skin:0x8f6f52, skinDk:0x63482f,
    graft:0x4a4e52, graftDk:0x2c2f32, graftLt:0x666a6e,
    lens:0x6fd8f0, lensDk:0x1c5a68,
    coil:0x5c6064, glow:0x7fe0f5,
    boot:0x1e1a16, disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.64, 0),
    waist: V(0, 0.82, 0.01),
    chest: V(0, 1.05, -0.02),
    neck:  V(0, 1.20, 0),
    headB: V(0, 1.24, 0),
    headT: V(0, 1.42, 0),
  };

  /* torso — bulkier build than the grunt, heavier plate coverage */
  tube(S.hip, S.waist, 0.185, 0.170, 8, P.leather, {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.170, 0.220, 8, P.leatherDk, {phase:Math.PI/8});
  tube(S.chest, S.neck, 0.220, 0.100, 8, P.leather, {phase:Math.PI/8, capB:{hex:P.leatherDk, lift:0.01}});
  /* heavy chest plate, riveted, covering most of the torso */
  quad(V(-0.17,0.92,0.17), V(0.17,0.92,0.17), V(0.14,1.14,0.16), V(-0.14,1.14,0.16), P.plate, 0.05);
  quad(V(-0.12,0.72,0.19), V(0.12,0.72,0.19), V(0.10,0.90,0.175), V(-0.10,0.90,0.175), P.plateDk, 0.05);
  for(const [x,y] of [[-0.10,1.05],[0.10,1.05],[-0.08,0.80],[0.08,0.80]])
    quad(V(x-0.012,y,0.19), V(x+0.012,y,0.19), V(x+0.010,y-0.02,0.185), V(x-0.010,y-0.02,0.185), P.graftDk, 0.02);
  /* shoulder pauldrons — heavier, asymmetric grafts */
  quad(V(-0.16,1.08,-0.03), V(-0.26,1.05,-0.02), V(-0.24,0.92,0.03), V(-0.15,0.96,0.03), P.plate, 0.06);
  /* right shoulder replaced with a cyber-graft port (mechanical shoulder) */
  {
    const pc = V(0.22, 1.02, 0.0);
    const r1 = ring(pc, V(1,0,0), 0.085, 0.085, 8, Math.PI/8);
    const r2 = ring(V(pc.x+0.03,pc.y,pc.z), V(1,0,0), 0.075, 0.075, 8, Math.PI/8);
    stitch([r1,r2], ()=>P.graft);
    capFan(r2, V(pc.x+0.05,pc.y,pc.z), P.graftDk);
  }

  /* head — blocky, scarred, one side has a jaw graft; single lens set in a socket (not an eye quad) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, rx:0.108, rz:0.100, hex:P.skinDk},
      {y:S.headB.y+0.10, rx:0.115, rz:0.106, hex:P.skin},
      {y:S.headT.y-0.03, rx:0.100, rz:0.092, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.graftDk);
    /* graft socket lens on one side of the face (recessed disc, not an eye quad) */
    quad(V(0.03,S.headT.y-0.10,0.09), V(0.09,S.headT.y-0.10,0.085), V(0.085,S.headT.y-0.14,0.08), V(0.03,S.headT.y-0.14,0.085), P.graftDk, 0.03);
    quad(V(0.045,S.headT.y-0.115,0.088), V(0.075,S.headT.y-0.115,0.084), V(0.072,S.headT.y-0.13,0.082), V(0.045,S.headT.y-0.13,0.085), P.lens, 0.05);
    /* jaw graft plate on the other side */
    quad(V(-0.09,S.headB.y+0.01,0.06), V(-0.02,S.headB.y-0.01,0.075), V(-0.02,S.headB.y-0.06,0.065), V(-0.09,S.headB.y-0.04,0.05), P.graft, 0.04);
  }

  /* arms — left arm bears a bulky cybernetic forearm graft; right grips the rail-pistol */
  {
    const shL = V(-0.24, 1.00, 0);
    const elL = V(-0.28, 0.80, 0.05);
    const hnL = V(-0.25, 0.62, 0.10);
    tube(shL, elL, 0.075, 0.070, 6, P.leather, {phase:Math.PI/6});
    tube(elL, hnL, 0.070, 0.058, 6, P.graft, {phase:Math.PI/6, capB:{hex:P.graftDk, lift:0.02}});
    /* graft plating over the forearm */
    quad(V(elL.x-0.05,elL.y-0.02,elL.z+0.04), V(elL.x+0.05,elL.y-0.02,elL.z+0.04), V(hnL.x+0.04,hnL.y+0.03,hnL.z+0.05), V(hnL.x-0.04,hnL.y+0.03,hnL.z+0.05), P.graftLt, 0.04);

    const shR = V(0.22, 1.00, 0);
    const elR = V(0.26, 0.86, 0.12);
    const hnR = V(0.20, 0.86, 0.34);
    tube(shR, elR, 0.062, 0.050, 6, P.leather, {phase:Math.PI/6});
    tube(elR, hnR, 0.050, 0.040, 6, P.leatherDk, {phase:Math.PI/6, capB:{hex:P.skinDk, lift:0.02}});

    /* rail-pistol — long barrel with a visible glowing capacitor coil mid-shaft */
    const gB = hnR;
    const coilA = V(hnR.x, hnR.y+0.01, hnR.z+0.10);
    const coilB = V(hnR.x, hnR.y+0.01, hnR.z+0.18);
    const muzzle = V(hnR.x, hnR.y+0.005, hnR.z+0.42);
    tube(gB, coilA, 0.026, 0.030, 6, P.graftDk);
    /* capacitor coil rings, glowing */
    for(let i=0;i<3;i++){
      const t=i/2, cy=coilA.y, cz=coilA.z+t*(coilB.z-coilA.z);
      const r1=ring(V(coilA.x,cy,cz),V(0,0,1),0.034,0.034,6,Math.PI/6);
      const r2=ring(V(coilA.x,cy,cz+0.015),V(0,0,1),0.034,0.034,6,Math.PI/6);
      stitch([r1,r2], ()=>P.coil);
    }
    quad(V(coilA.x-0.02,coilA.y+0.032,coilA.z), V(coilA.x+0.02,coilA.y+0.032,coilA.z), V(coilB.x+0.02,coilB.y+0.032,coilB.z), V(coilB.x-0.02,coilB.y+0.032,coilB.z), P.glow, 0.1);
    tube(coilB, muzzle, 0.030, 0.018, 6, P.graft, {capB:{hex:P.graftDk, lift:0.006}});
  }

  /* legs — wide stance, heavy boots */
  {
    const legPair=(sx)=>{
      const hipJ = V(sx*0.11, 0.62, 0);
      const knee = V(sx*0.14, 0.32, 0.02);
      const foot = V(sx*0.14, 0.03, 0.09);
      tube(hipJ, knee, 0.095, 0.070, 6, P.leatherDk, {phase:Math.PI/6});
      tube(knee, foot, 0.070, 0.052, 6, P.leather, {phase:Math.PI/6, capB:{hex:P.boot, lift:0.02}});
      quad(V(sx*0.14-0.06,0.05,foot.z-0.06), V(sx*0.14+0.06,0.05,foot.z-0.06), V(sx*0.14+0.055,0.02,foot.z+0.10), V(sx*0.14-0.055,0.02,foot.z+0.10), P.boot, 0.03);
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
