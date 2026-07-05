/* dev/model-qa/creatures/rlm-cyber-ganger-warlord.js — CYBER-GANGER WARLORD (chrome, Medium
   humanoid, CR 7). Read: a chrome-plated crime boss head-to-toe in stolen corp tech — a full
   mirrored chrome cuirass, twin cybernetic arm-grafts (one a crushing gauntlet fist, one a
   folded blade-arm), a chrome-plated skull-cap helm with a single slit visor, a heavy cape of
   scavenged plate. Bulkier + more chrome-covered than the grunt/boss line — this is the top of
   the gang food chain. Chrome register: mirrored hard surfaces gone grimy with use-wear. NO eye
   quads — one slit visor lens instead. Whole-object grammar: one function, one frame, no anchors.
   Medium size, base disc r=0.42. Wide, planted stance. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCyberGangerWarlord(){
  const P = {
    chrome:0xc7ccce, chromeDk:0x888e90, chromeLt:0xe6eaea,
    skin:0x8f6f52, skinDk:0x5c4530,
    graft:0x50565a, graftDk:0x2e3336, graftLt:0x70767a,
    blade:0xd8dcdc, bladeDk:0x9aa0a0,
    visor:0x1a1e20, lens:0x6fd8f0, lensDk:0x1c5a68,
    cape:0x2b2622, capeDk:0x18140f,
    boot:0x1a1712, disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.64, 0),
    waist: V(0, 0.84, 0.01),
    chest: V(0, 1.10, -0.02),
    neck:  V(0, 1.26, 0),
    headB: V(0, 1.30, 0),
    headT: V(0, 1.50, 0),
  };

  /* torso — bulky mirrored chrome cuirass, biggest silhouette in the gang lineup */
  tube(S.hip, S.waist, 0.195, 0.185, 8, P.graftDk, {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.185, 0.240, 8, P.graft, {phase:Math.PI/8});
  tube(S.chest, S.neck, 0.240, 0.105, 8, P.graftDk, {phase:Math.PI/8, capB:{hex:P.graftDk, lift:0.01}});
  /* full mirrored chrome cuirass front + a raised chest emblem ridge */
  quad(V(-0.20,0.94,0.19), V(0.20,0.94,0.19), V(0.16,1.20,0.17), V(-0.16,1.20,0.17), P.chrome, 0.06);
  quad(V(-0.02,1.00,0.20), V(0.02,1.00,0.20), V(0.015,1.15,0.185), V(-0.015,1.15,0.185), P.chromeLt, 0.05);
  quad(V(-0.13,0.70,0.20), V(0.13,0.70,0.20), V(0.11,0.90,0.185), V(-0.11,0.90,0.185), P.chromeDk, 0.05);
  /* cape of scavenged plate, hanging from the shoulders down the back */
  quad(V(-0.20,1.18,-0.10), V(0.20,1.18,-0.10), V(0.28,0.40,-0.20), V(-0.28,0.40,-0.20), P.cape, 0.06);
  quad(V(-0.24,0.85,-0.15), V(0.24,0.85,-0.15), V(0.26,0.42,-0.19), V(-0.26,0.42,-0.19), P.capeDk, 0.05);

  /* head — chrome skull-cap helm, single slit visor, jaw exposed below */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,       rx:0.112, rz:0.104, hex:P.skinDk},
      {y:S.headB.y+0.10,  rx:0.120, rz:0.110, hex:P.chrome},
      {y:S.headT.y-0.03,  rx:0.104, rz:0.096, hex:P.chromeDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.chromeDk);
    /* slit visor lens band across the eyes (not an eye quad — one continuous slit) */
    quad(V(-0.09,S.headT.y-0.10,0.095), V(0.09,S.headT.y-0.10,0.095), V(0.085,S.headT.y-0.125,0.09), V(-0.085,S.headT.y-0.125,0.09), P.visor, 0.04);
    quad(V(-0.06,S.headT.y-0.112,0.098), V(0.06,S.headT.y-0.112,0.098), V(0.055,S.headT.y-0.118,0.093), V(-0.055,S.headT.y-0.118,0.093), P.lens, 0.08);
    /* exposed jaw + scarred cheek below the helm rim */
    quad(V(-0.08,S.headB.y+0.01,0.07), V(0.08,S.headB.y+0.01,0.07), V(0.07,S.headB.y-0.06,0.075), V(-0.07,S.headB.y-0.06,0.075), P.skin, 0.05);
  }

  /* arms — left ends in a crushing chrome gauntlet fist; right in a folded blade-arm graft */
  {
    const shL = V(-0.26, 1.06, 0);
    const elL = V(-0.32, 0.82, 0.05);
    const hnL = V(-0.28, 0.60, 0.10);
    tube(shL, elL, 0.088, 0.078, 7, P.graft, {phase:Math.PI/7});
    tube(elL, hnL, 0.078, 0.075, 7, P.chromeDk, {phase:Math.PI/7});
    /* crushing gauntlet fist — a blocky knuckle-plate mass */
    quad(V(hnL.x-0.07,hnL.y+0.05,hnL.z-0.05), V(hnL.x+0.07,hnL.y+0.05,hnL.z-0.05), V(hnL.x+0.065,hnL.y-0.08,hnL.z+0.05), V(hnL.x-0.065,hnL.y-0.08,hnL.z+0.05), P.chrome, 0.06);
    for(let i=0;i<4;i++){
      const kx = hnL.x-0.05+i*0.033;
      quad(V(kx-0.012,hnL.y+0.06,hnL.z-0.06), V(kx+0.012,hnL.y+0.06,hnL.z-0.06), V(kx+0.010,hnL.y-0.02,hnL.z-0.02), V(kx-0.010,hnL.y-0.02,hnL.z-0.02), P.chromeLt, 0.04);
    }

    const shR = V(0.26, 1.06, 0);
    const elR = V(0.30, 0.84, 0.08);
    const hnR = V(0.24, 0.72, 0.30);
    tube(shR, elR, 0.080, 0.068, 7, P.graft, {phase:Math.PI/7});
    tube(elR, hnR, 0.068, 0.038, 7, P.graftDk, {phase:Math.PI/7});
    /* folded blade-arm — a long flat chrome blade riding along the forearm, tip forward */
    quad(V(hnR.x-0.03,hnR.y+0.02,hnR.z-0.02), V(hnR.x+0.03,hnR.y+0.02,hnR.z-0.02), V(hnR.x+0.015,hnR.y-0.01,hnR.z+0.42), V(hnR.x-0.015,hnR.y-0.01,hnR.z+0.42), P.blade, 0.05);
    quad(V(hnR.x-0.012,hnR.y+0.005,hnR.z+0.02), V(hnR.x+0.012,hnR.y+0.005,hnR.z+0.02), V(hnR.x+0.005,hnR.y-0.005,hnR.z+0.42), V(hnR.x-0.005,hnR.y-0.005,hnR.z+0.42), P.bladeDk, 0.04);
  }

  /* legs — wide planted stance, heavy chrome greaves */
  {
    const legPair=(sx)=>{
      const hipJ = V(sx*0.13, 0.62, 0);
      const knee = V(sx*0.17, 0.32, 0.02);
      const foot = V(sx*0.17, 0.03, 0.10);
      tube(hipJ, knee, 0.105, 0.078, 6, P.graftDk, {phase:Math.PI/6});
      tube(knee, foot, 0.078, 0.058, 6, P.chrome, {phase:Math.PI/6, capB:{hex:P.boot, lift:0.02}});
      quad(V(sx*0.17-0.065,0.05,foot.z-0.06), V(sx*0.17+0.065,0.05,foot.z-0.06), V(sx*0.17+0.06,0.02,foot.z+0.11), V(sx*0.17-0.06,0.02,foot.z+0.11), P.boot, 0.03);
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
