/* dev/model-qa/creatures/rlm-longship-skald-reaver.js — Longship Skald-Reaver (theater, longship
   lens, Medium, CR 3). A raider singing the saga while swinging an axe: braided beard, an open
   singing mouth, a war-horn slung at the hip, a one-handed axe raised mid-swing with the free arm
   thrown wide (performing as much as fighting). Whole-object bipedal grammar, dynamic mid-swing
   twist posture. VS-desaturated cold-north palette (weathered leather, dull bronze horn fittings,
   iron axe). NO eye quads. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildLongshipSkaldReaver(){
  const P = {
    leather:0x5c4632, leatherDk:0x3a2c1e, leatherLt:0x6e5640,
    skin:0x9c8468, skinDk:0x6c5847,
    hair:0x5a5040, hairDk:0x3a3428,
    iron:0x3a3c3e, ironDk:0x232527, ironLt:0x585c5e,
    wood:0x4a3826, bronze:0x8a6a3a, bronzeDk:0x5e4a26,
    mouth:0x7a2e28,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — mid-swing twist: hips forward, shoulders rotated, weight on lead leg. ---------- */
  const S = {
    hip:   V(0, 0.35, 0),
    waist: V(0.02, 0.48, 0.02),
    chest: V(0.03, 0.60, 0.05),
    shldr: V(0.02, 0.68, 0.06),
    neck:  V(0.01, 0.72, 0.04),
    headB: V(0, 0.76, 0.02),
    headT: V(-0.01, 0.90, -0.01),
  };

  /* ---------- TORSO — leather-wrapped, twisting frame mid-swing. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   cz:S.hip.z,   rx:0.138, hex:P.leatherDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.130, hex:P.leather},
      {y:S.chest.y, cz:S.chest.z, rx:0.148, hex:P.leatherLt},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.158, hex:P.leather},
    ];
    const rings=bands.map(b=>ring(V(b.cx||0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.80, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.leatherDk, true);
    // crossed leather strap over the chest
    quad(V(-0.13,S.shldr.y+0.02,S.shldr.z), V(-0.02,S.hip.y+0.10,S.hip.z+0.12),
         V(0.03,S.hip.y+0.06,S.hip.z+0.12), V(-0.08,S.shldr.y-0.02,S.shldr.z), P.leatherDk, 0.06);
  }

  /* ---------- WAR-HORN — a curved horn slung at the hip on a strap, bronze-mounted tip. ---------- */
  {
    const h0=V(0.14,S.hip.y+0.08,S.hip.z-0.02), h1=V(0.20,S.hip.y-0.02,S.hip.z-0.08), h2=V(0.22,S.hip.y-0.10,S.hip.z-0.12);
    tube(h0,h1,0.032,0.024,6,P.leatherLt);
    tube(h1,h2,0.024,0.010,6,P.bronze,{capB:{hex:P.bronzeDk,lift:0.008}});
  }

  /* ---------- HEAD — braided beard, open singing mouth, hollow socket shading (no eyes). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.082, hex:P.skinDk},
      {y:S.headB.y+0.07, r:0.088, hex:P.skin},
      {y:S.headT.y-0.03, r:0.072, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z-0.01), P.hair);
    // socket shading, no eyes
    quad(V(-0.058,S.headB.y+0.05,S.headB.z+0.068), V(-0.014,S.headB.y+0.05,S.headB.z+0.073),
         V(-0.018,S.headB.y+0.08,S.headB.z+0.067), V(-0.054,S.headB.y+0.08,S.headB.z+0.062), P.skinDk, 0.05);
    quad(V(0.014,S.headB.y+0.05,S.headB.z+0.073), V(0.058,S.headB.y+0.05,S.headB.z+0.068),
         V(0.054,S.headB.y+0.08,S.headB.z+0.062), V(0.018,S.headB.y+0.08,S.headB.z+0.067), P.skinDk, 0.05);
    // open singing mouth — a dark oval, wide
    quad(V(-0.034,S.headB.y,S.headB.z+0.075), V(0.034,S.headB.y,S.headB.z+0.075),
         V(0.028,S.headB.y-0.045,S.headB.z+0.07), V(-0.028,S.headB.y-0.045,S.headB.z+0.07), P.mouth, 0.04);
    // braided beard hanging from the jaw, two thick plaits
    for(const s of [-1,1]){
      const b0=V(s*0.03,S.headB.y-0.02,S.headB.z+0.07), b1=V(s*0.04,S.headB.y-0.16,S.headB.z+0.05), b2=V(s*0.05,S.headB.y-0.28,S.headB.z+0.02);
      tube(b0,b1,0.020,0.016,5,P.hair);
      tube(b1,b2,0.016,0.008,5,P.hairDk,{capB:{hex:P.hairDk,lift:0.006}});
    }
  }

  /* ---------- ARMS — one raised high mid-swing with the axe, the other thrown wide (performing). ---------- */
  {
    const shR = V(-0.20,0.68,0.08), elR = V(-0.32,0.86,0.20), hR = V(-0.20,1.02,0.34);
    tube(shR, elR, 0.052, 0.042, 6, P.leather);
    tube(elR, hR, 0.042, 0.032, 6, P.skin, {capB:{hex:P.skin, lift:0.02}});
    const shL = V(0.20,0.67,0.08), elL = V(0.38,0.62,0.02), hL = V(0.50,0.58,-0.10);
    tube(shL, elL, 0.052, 0.042, 6, P.leather);
    tube(elL, hL, 0.042, 0.032, 6, P.skin, {capB:{hex:P.skin, lift:0.02}});
  }

  /* ---------- ONE-HANDED AXE — raised overhead mid-swing, iron head with a worn edge. ---------- */
  {
    const grip=V(-0.20,1.02,0.34), top=V(-0.14,1.18,0.44);
    tube(grip, top, 0.020, 0.014, 6, P.wood);
    quad(V(-0.14,1.18,0.44), V(-0.14,1.10,0.44), V(-0.30,1.14,0.50), V(-0.28,1.24,0.52), P.iron, 0.05);
    quad(V(-0.30,1.14,0.50), V(-0.28,1.24,0.52), V(-0.34,1.19,0.54), V(-0.34,1.19,0.54), P.ironLt, 0.05);
  }

  /* ---------- LEGS — lead leg forward, planted wide for the swing. ---------- */
  {
    const hipL = V(-0.09,0.35,0.04), kneeL = V(-0.13,0.19,0.22), footL = V(-0.12,0.02,0.34);
    tube(hipL, kneeL, 0.062, 0.050, 6, P.leatherDk);
    tube(kneeL, footL, 0.050, 0.038, 6, P.leather, {capB:{hex:P.ironDk, lift:0.02}});
    const hipR = V(0.09,0.35,-0.04), kneeR = V(0.14,0.19,-0.18), footR = V(0.15,0.02,-0.26);
    tube(hipR, kneeR, 0.062, 0.050, 6, P.leatherDk);
    tube(kneeR, footR, 0.050, 0.038, 6, P.leather, {capB:{hex:P.ironDk, lift:0.02}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
