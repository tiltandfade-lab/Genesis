/* dev/model-qa/creatures/rlm-convoy-breaker.js — CONVOY BREAKER (ash realm, Medium, CR 4).
   Read: an axle-cracking convoy ambusher — heavyset raider built for wrecking vehicles, a massive
   spiked sledge/axle-breaker weapon carried two-handed, wheel-rim shoulder guards, a scrap-plated
   chest, goggles pushed up on a scarred bald head. Whole-object grammar: one function, one merged
   frame, no anchors. NO eye quads — the goggles are flat glass discs, not eyes. Base disc r=0.42
   (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildConvoyBreaker(){
  /* ---------- PALETTE (VS-desaturated road-dust drab, rust/axle-grease accents, ash register) --- */
  const P = {
    skin:0x8a6a4e, skinDk:0x5e4632,
    cloth:0x5a5240, clothDk:0x3c3628,
    plate:0x5c584c, plateDk:0x3d3a30, plateLt:0x726d5c,
    rim:0x3a3830, rimLt:0x585448,          /* wheel-rim shoulder guard */
    rust:0x8a5a3a, rustDk:0x5c3a24,
    lens:0x3a4238, lensGlint:0x8a9880,
    leather:0x3e2e1e, bootDk:0x211a12,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — heavyset wide stance, weight braced forward for the swing ---------- */
  const S = {
    hip:   V(0, 0.54, 0),
    waist: V(0, 0.72, 0.01),
    chest: V(0, 0.98, 0.03),
    shldr: V(0, 1.14, 0.00),
    neck:  V(0, 1.20, -0.01),
    headB: V(0, 1.26, -0.02),
    headT: V(0, 1.43, -0.02),
  };

  /* ---------- TORSO — heavy scrap-plated chest over cloth ---------- */
  tube(S.hip,   S.waist, 0.175, 0.160, 9, P.cloth,   {phase:Math.PI/9});
  tube(S.waist, S.chest, 0.160, 0.230, 9, P.plate,   {phase:Math.PI/9});
  tube(S.chest, S.shldr, 0.230, 0.250, 9, P.plateDk, {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.250, 0.088, 9, P.plate,   {phase:Math.PI/9});
  /* dented plate seams + rust streak */
  for(const s of [-1,1]) quad(V(s*0.15,1.06,0.10), V(s*0.19,1.06,0.06), V(s*0.17,0.78,0.14), V(s*0.13,0.78,0.18), P.plateLt, 0.06);
  quad(V(-0.08,0.98,0.22), V(0.08,0.98,0.22), V(0.04,0.72,0.20), V(-0.04,0.72,0.20), P.rust, 0.08);

  /* ---------- WHEEL-RIM SHOULDER GUARDS — a salvaged wheel-rim worn on each shoulder ---------- */
  {
    for(const s of [-1,1]){
      const c = V(s*0.235, 1.13, 0.00);
      const outer = ring(c, V(1,0,0), 0.105, 0.105, 10, Math.PI/10);
      const inner = ring(V(c.x+s*0.02,c.y,c.z), V(1,0,0), 0.075, 0.075, 10, Math.PI/10);
      stitch([outer,inner], ()=>P.rimLt);
      stitch([inner,outer], ()=>P.rim);
      /* spokes */
      for(let i=0;i<5;i++){
        const t=(i/5)*Math.PI*2;
        quad(V(c.x,c.y,c.z), V(c.x+s*0.01,c.y+Math.cos(t)*0.09,c.z+Math.sin(t)*0.09),
             V(c.x+s*0.01,c.y+Math.cos(t+0.3)*0.09,c.z+Math.sin(t+0.3)*0.09), V(c.x,c.y,c.z), P.rimLt, 0.04);
      }
    }
  }

  /* ---------- HEAD — scarred bald head, goggles pushed up on the brow (glass discs, no eyes) --- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0.00, rx:0.095, rz:0.098, hex:P.skin},
      {y:S.headB.y+0.10, cz:0.00, rx:0.098, rz:0.094, hex:P.skinDk},
      {y:S.headT.y-0.02, cz:-0.01,rx:0.080, rz:0.076, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headT.y+0.02, -0.01), P.skinDk);
    /* scar quad on the scalp */
    quad(V(-0.02,S.headT.y-0.01,0.02), V(0.02,S.headT.y-0.01,0.02), V(0.015,S.headB.y+0.14,0.06), V(-0.015,S.headB.y+0.14,0.06), P.skinDk, 0.03);
    /* goggles pushed up on the brow — strap + two flat lens discs */
    quad(V(-0.09,S.headB.y+0.145,0.05), V(0.09,S.headB.y+0.145,0.05), V(0.075,S.headB.y+0.125,-0.04), V(-0.075,S.headB.y+0.125,-0.04), P.leather, 0.05);
    for(const s of [-1,1]){
      const c = V(s*0.05, S.headB.y+0.135, 0.06);
      const outer = ring(c, V(0,0,1), 0.038, 0.038, 8, Math.PI/8);
      const inner = ring(V(c.x,c.y,c.z+0.006), V(0,0,1), 0.026, 0.026, 8, Math.PI/8);
      stitch([outer,inner], ()=>P.plateDk);
      capFan(inner, V(c.x,c.y,c.z+0.012), P.lens);
      quad(V(c.x+0.003,c.y+0.012,c.z+0.013), V(c.x+0.013,c.y+0.012,c.z+0.013), V(c.x+0.008,c.y+0.004,c.z+0.013), V(c.x,c.y+0.004,c.z+0.013), P.lensGlint, 0.04);
    }
    /* dark jaw/mouth line */
    quad(V(-0.05,S.headB.y-0.01,0.08), V(0.05,S.headB.y-0.01,0.08), V(0.04,S.headB.y-0.05,0.085), V(-0.04,S.headB.y-0.05,0.085), P.skinDk, 0.04);
  }

  /* ---------- ARMS — both gripping a massive spiked axle-breaker sledge, two-handed ---------- */
  {
    const shL = V(-0.22, 1.06, 0.02), shR = V(0.22, 1.06, 0.02);
    const elL = V(-0.24, 0.84, 0.16), elR = V(0.24, 0.84, 0.16);
    const hL  = V(-0.12, 0.70, 0.34), hR  = V(0.12, 0.70, 0.36);
    tube(shL, elL, 0.078, 0.062, 6, P.plate);
    tube(elL, hL,  0.062, 0.050, 6, P.skin, {capB:{hex:P.skin, lift:0.012}});
    tube(shR, elR, 0.078, 0.062, 6, P.plate);
    tube(elR, hR,  0.062, 0.050, 6, P.skin, {capB:{hex:P.skin, lift:0.012}});
    /* axle-breaker sledge: long haft + spiked head */
    const haftB = V(0.0, 0.70, 0.35), haftT = V(-0.06, 1.10, 0.66);
    tube(haftB, haftT, 0.035, 0.030, 6, P.leather);
    const headC = V(-0.09, 1.22, 0.76);
    tube(haftT, headC, 0.030, 0.09, 8, P.plateDk, {capB:{hex:P.rustDk, lift:0.02}});
    /* spikes on the sledge head */
    for(const [dx,dy,dz] of [[0.08,0.04,0.02],[-0.08,0.04,0.02],[0,0.10,0.02],[0,0.04,0.08]]){
      tube(V(headC.x,headC.y,headC.z), V(headC.x+dx,headC.y+dy,headC.z+dz), 0.024, 0.005, 4, P.rustDk, {capB:{hex:P.rustDk}});
    }
  }

  /* ---------- LEGS — wide braced stance ---------- */
  {
    const legs=(hipX)=>{
      const hip = V(hipX, S.hip.y-0.02, 0);
      const knee = V(hipX*1.15, 0.30, 0.05);
      const foot = V(hipX*1.05, 0.03, 0.09);
      tube(hip, knee, 0.095, 0.076, 7, P.cloth);
      tube(knee, foot, 0.076, 0.064, 7, P.plateDk, {capB:{hex:P.bootDk, lift:0.02}});
      quad(V(foot.x-0.06,0.028,foot.z-0.03), V(foot.x+0.06,0.028,foot.z-0.03), V(foot.x+0.05,0.01,foot.z+0.09), V(foot.x-0.05,0.01,foot.z+0.09), P.bootDk, 0.04);
    };
    legs(-0.10); legs(0.10);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
