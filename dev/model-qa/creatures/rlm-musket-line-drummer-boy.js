/* dev/model-qa/creatures/rlm-musket-line-drummer-boy.js — Musket-Line Drummer Boy (theater, Small, CR 0.5).
   A young drummer keeping march step through the volleys. Whole-object bipedal grammar: one merged
   frame, a small slight build, a marching-forward stride, a drum slung at the hip with crossed drum-
   sticks mid-beat, forage cap, faded uniform coat. VS-desaturated faded field palette (dull wool drab,
   tarnished brass, worn drum-skin cream). NO eye quads. Small size disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMusketLineDrummerBoy(){
  const P = {
    coat:0x5c5a46, coatDk:0x3e3c2e, coatLt:0x726f56,
    skin:0x9c8268, skinDk:0x6b5847,
    cap:0x3a3830, capDk:0x232219,
    brass:0x8c7c40,
    drumWood:0x4a3624, drumSkin:0xc9bd9c, drumSkinDk:0xa89876, drumHoop:0x2a251c,
    stick:0x5a4530,
    disc:0x453f34, discTop:0x524b3c,
  };

  /* ---------- LANDMARKS — small slight build, mid-stride marching forward. ---------- */
  const S = {
    hip:   V(0, 0.24, 0),
    waist: V(0, 0.33, 0.01),
    chest: V(0, 0.42, 0.02),
    shldr: V(0, 0.47, 0.02),
    neck:  V(0, 0.50, 0.02),
    headB: V(0, 0.53, 0.02),
    headT: V(0, 0.63, 0.01),
  };

  /* ---------- TORSO — small uniform coat, brass buttons down the front. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   rx:0.100, hex:P.coatDk},
      {y:S.waist.y, rx:0.095, hex:P.coat},
      {y:S.chest.y, rx:0.105, hex:P.coat},
      {y:S.shldr.y, rx:0.090, hex:P.coatLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.hip.z), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.neck.y-0.01,S.neck.z), P.coatLt);
    capFan(rings[0], V(0,S.hip.y-0.05,S.hip.z), P.coatDk, true);
    // brass button row
    for(const y of [0.28,0.35,0.42]) quad(V(-0.012,y,0.10),V(0.012,y,0.10),V(0.010,y+0.018,0.10),V(-0.010,y+0.018,0.10), P.brass, 0.05);
  }

  /* ---------- HEAD — young, small forage cap, chin strap. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.058, hex:P.skinDk},
      {y:S.headB.y+0.05, r:0.062, hex:P.skin},
      {y:S.headT.y-0.02, r:0.056, hex:P.cap},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.015,S.headB.z-0.01), P.capDk);
    // small brim
    quad(V(-0.06,S.headT.y-0.03,S.headB.z+0.06), V(0.06,S.headT.y-0.03,S.headB.z+0.06),
         V(0.04,S.headT.y-0.015,S.headB.z-0.03), V(-0.04,S.headT.y-0.015,S.headB.z-0.03), P.capDk, 0.04);
    // chin strap
    quad(V(-0.035,S.headB.y-0.005,S.headB.z+0.04), V(0.035,S.headB.y-0.005,S.headB.z+0.04),
         V(0.03,S.headB.y+0.02,S.headB.z+0.045), V(-0.03,S.headB.y+0.02,S.headB.z+0.045), P.capDk, 0.04);
  }

  /* ---------- ARMS — mid-beat, crossed drumsticks over the drumhead. ---------- */
  {
    const shR = V(-0.09,0.46,0.02), elR = V(-0.13,0.36,0.12), hR = V(-0.05,0.34,0.20);
    tube(shR, elR, 0.032, 0.026, 6, P.coat);
    tube(elR, hR, 0.026, 0.020, 6, P.coatDk, {capB:{hex:P.skin, lift:0.015}});
    const shL = V(0.09,0.46,0.02), elL = V(0.13,0.37,0.13), hL = V(0.03,0.34,0.19);
    tube(shL, elL, 0.032, 0.026, 6, P.coat);
    tube(elL, hL, 0.026, 0.020, 6, P.coatDk, {capB:{hex:P.skin, lift:0.015}});
    // crossed drumsticks, tips raised mid-beat over the head
    tube(hR, V(0.06,0.44,0.24), 0.010, 0.004, 4, P.stick, {capB:{hex:P.stick, lift:0.003}});
    tube(hL, V(-0.04,0.44,0.25), 0.010, 0.004, 4, P.stick, {capB:{hex:P.stick, lift:0.003}});
  }

  /* ---------- DRUM — a snare drum slung at the hip, cream skin, dark hoops, wood shell. ---------- */
  {
    const cy=0.20, cz=0.20;
    const n=10, ph=Math.PI/n;
    const rTop = ring(V(0,cy+0.09,cz), V(0,1,0), 0.11, 0.11, n, ph);
    const rBot = ring(V(0,cy-0.09,cz), V(0,1,0), 0.11, 0.11, n, ph);
    stitch([rTop,rBot], ()=>P.drumWood);
    capFan(rTop, V(0,cy+0.095,cz), P.drumSkin);
    capFan(rBot, V(0,cy-0.095,cz), P.drumSkinDk, true);
    // hoop rims top/bottom
    const rimTop2 = ring(V(0,cy+0.085,cz), V(0,1,0), 0.115, 0.115, n, ph);
    stitch([rTop.map((p,i)=>rimTop2[i]), rTop], ()=>P.drumHoop);
    // sling strap over the shoulder
    quad(V(-0.07,0.46,0.05), V(-0.02,0.44,0.06), V(-0.05,0.24,0.14), V(-0.10,0.26,0.13), P.coatDk, 0.05);
  }

  /* ---------- LEGS — mid-stride march, one leg forward. ---------- */
  {
    const hipL = V(-0.05,0.24,0), kneeL = V(-0.06,0.12,0.10), footL = V(-0.05,0.01,0.18);
    tube(hipL, kneeL, 0.044, 0.036, 6, P.coatDk);
    tube(kneeL, footL, 0.036, 0.026, 6, P.capDk, {capB:{hex:P.capDk, lift:0.015}});
    const hipR = V(0.05,0.24,0), kneeR = V(0.07,0.10,-0.10), footR = V(0.09,0.01,-0.18);
    tube(hipR, kneeR, 0.044, 0.036, 6, P.coatDk);
    tube(kneeR, footR, 0.036, 0.026, 6, P.capDk, {capB:{hex:P.capDk, lift:0.015}});
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.30, 0.30, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
