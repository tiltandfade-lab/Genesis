/* dev/model-qa/creatures/rlm-overclocked-sentinel-frame.js — OVERCLOCKED SENTINEL FRAME
   (chrome, Medium construct, CR 4). Read: a boxy security exo-frame pushed past its thermal
   limit — plating visibly warped/bubbled from its own heat, vents glowing orange-hot,
   heavy blocky limbs, a flat sensor-slit visor. Chrome register: gunmetal + scorched plate,
   hot orange overclock-glow leaking from every seam. NO eye quads — a single flat sensor
   slit. Whole-object grammar: one function, one frame, no anchors. Medium size, base disc
   r=0.42. Blocky bipedal security-frame stance. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildOverclockedSentinelFrame(){
  const P = {
    plate:0x71767a, plateDk:0x484c4f, plateLt:0x8e9396,
    warp:0x5c534c, warpDk:0x352f2a,               // heat-warped/bubbled plating
    gunmetal:0x54585c, gunmetalDk:0x35383b,
    glow:0xe27a2c, glowDk:0x8a4414, glowHot:0xffb060,
    visor:0x2c2622, visorGlow:0xff9040,
    boot:0x2a2622, disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.66, 0),
    waist: V(0, 0.86, 0.01),
    chest: V(0, 1.10, -0.02),
    neck:  V(0, 1.26, 0),
    headB: V(0, 1.30, 0),
    headT: V(0, 1.48, 0),
  };

  /* torso — boxy blocky frame, wide stacked bands */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:S.hip.y,   rx:0.180, rz:0.160, hex:P.plateDk},
      {y:S.waist.y, rx:0.190, rz:0.170, hex:P.plate},
      {y:S.chest.y, rx:0.230, rz:0.200, hex:P.plate},
      {y:S.neck.y,  rx:0.115, rz:0.100, hex:P.gunmetalDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
  }
  /* heat-warped plate patch on the chest — visibly bubbled/melted */
  quad(V(-0.16,0.98,0.19), V(0.16,0.98,0.19), V(0.13,1.20,0.175), V(-0.13,1.20,0.175), P.warp, 0.08);
  quad(V(-0.09,1.02,0.20), V(0.02,1.05,0.205), V(0.06,1.14,0.195), V(-0.06,1.11,0.19), P.warpDk, 0.1);
  /* glowing vents along the flanks, hot orange leaking from seams */
  for(const [sx, y] of [[-1,1.00],[-1,0.82],[1,1.00],[1,0.82]]){
    const vx = sx*0.20;
    quad(V(vx-0.02,y-0.03,0.02), V(vx+0.02,y-0.03,0.02), V(vx+0.018,y+0.05,0.02), V(vx-0.018,y+0.05,0.02), P.glow, 0.1);
    quad(V(vx-0.012,y-0.01,0.024), V(vx+0.012,y-0.01,0.024), V(vx+0.010,y+0.03,0.024), V(vx-0.010,y+0.03,0.024), P.glowHot, 0.12);
  }

  /* head — blocky sentinel helm, single flat sensor slit (no eye quads) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, rx:0.115, rz:0.105, hex:P.gunmetalDk},
      {y:S.headB.y+0.10, rx:0.120, rz:0.110, hex:P.plate},
      {y:S.headT.y-0.03, rx:0.100, rz:0.090, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.gunmetalDk);
    /* flat sensor slit, glowing hot-orange (overclocked) */
    quad(V(-0.085,S.headT.y-0.11,0.09), V(0.085,S.headT.y-0.11,0.09), V(0.078,S.headT.y-0.135,0.085), V(-0.078,S.headT.y-0.135,0.085), P.visor, 0.04);
    quad(V(-0.055,S.headT.y-0.118,0.093), V(0.055,S.headT.y-0.118,0.093), V(0.048,S.headT.y-0.128,0.088), V(-0.048,S.headT.y-0.128,0.088), P.visorGlow, 0.12);
    /* warped seam on the crown from overheating */
    quad(V(-0.05,S.headT.y-0.01,0.02), V(0.05,S.headT.y-0.01,0.02), V(0.04,S.headT.y-0.04,0.05), V(-0.04,S.headT.y-0.04,0.05), P.warpDk, 0.06);
  }

  /* arms — heavy blocky limbs, a fixed baton/shock-prod welded to the right forearm */
  {
    const shL = V(-0.245, 1.05, 0);
    const elL = V(-0.27, 0.82, 0.06);
    const hnL = V(-0.25, 0.60, 0.08);
    tube(shL, elL, 0.082, 0.068, 6, P.plate, {phase:Math.PI/6});
    tube(elL, hnL, 0.066, 0.052, 6, P.gunmetal, {phase:Math.PI/6, capB:{hex:P.gunmetalDk, lift:0.02}});

    const shR = V(0.245, 1.05, 0);
    const elR = V(0.27, 0.82, 0.06);
    const hnR = V(0.25, 0.60, 0.10);
    tube(shR, elR, 0.082, 0.068, 6, P.plate, {phase:Math.PI/6});
    tube(elR, hnR, 0.066, 0.052, 6, P.gunmetal, {phase:Math.PI/6, capB:{hex:P.gunmetalDk, lift:0.02}});
    /* shock-prod baton, glowing tip */
    const prodTip = V(hnR.x+0.02, hnR.y-0.02, hnR.z+0.30);
    tube(hnR, prodTip, 0.028, 0.014, 5, P.gunmetalDk, {capB:{hex:P.glowHot, lift:0.01}});
  }

  /* legs — heavy blocky stance, glowing knee-vents */
  {
    const legPair=(sx)=>{
      const hipJ = V(sx*0.13, 0.64, 0);
      const knee = V(sx*0.15, 0.32, 0.02);
      const foot = V(sx*0.155, 0.03, 0.10);
      tube(hipJ, knee, 0.105, 0.078, 6, P.plate, {phase:Math.PI/6});
      quad(V(sx*0.15-0.02,0.34,0.06), V(sx*0.15+0.02,0.34,0.06), V(sx*0.15+0.018,0.38,0.05), V(sx*0.15-0.018,0.38,0.05), P.glowHot, 0.12);
      tube(knee, foot, 0.076, 0.058, 6, P.gunmetal, {phase:Math.PI/6, capB:{hex:P.boot, lift:0.02}});
      quad(V(sx*0.155-0.06,0.05,foot.z-0.06), V(sx*0.155+0.06,0.05,foot.z-0.06), V(sx*0.155+0.055,0.02,foot.z+0.10), V(sx*0.155-0.055,0.02,foot.z+0.10), P.boot, 0.03);
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
