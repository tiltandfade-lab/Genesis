/* dev/model-qa/creatures/rlm-trench-officers-ghost-whistle.js — Trench Officer's Ghost-Whistle
   (theater, trench lens, Medium, CR 6). Read: a spectral officer, translucent-read tattered
   greatcoat, still standing at the parapet blowing a whistle for a charge that never stops coming —
   one arm raised with the whistle to spectral lips, the other gesturing forward-over. Whole-object
   bipedal grammar: one merged frame, no anchors. VS-desaturated ghost-pale drab greens fading to
   translucent hem tatters, dull brass whistle, hollow officer's cap. NO eye quads (hollow-socket
   ghost shading only). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTrenchOfficersGhostWhistle(){
  const P = {
    coat:0x6a7268, coatDk:0x424a40, coatLt:0x8a927e,
    ghost:0x9aa294, ghostDk:0x525a4e,
    skin:0x7a8074, skinDk:0x4c524a,
    cap:0x3a4038, capDk:0x242a22, capBand:0x8a7a3e,
    brass:0x8a7a3e,
    disc:0x3f4238, discTop:0x4c5044,
  };

  /* ---------- LANDMARKS — upright officer stance, one arm raised to the mouth. ---------- */
  const S = {
    hip:V(0,0.34,0), waist:V(0,0.48,0.02), chest:V(0,0.60,0.05),
    shldr:V(0,0.70,0.04), neck:V(0,0.74,0.03), headB:V(0,0.78,0.02), headT:V(0,0.94,0.0),
  };

  /* ---------- TORSO — tattered greatcoat, pale ghost-drab, semi-worn read via mottled bands. ------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y, cz:S.hip.z, rx:0.145, hex:P.coatDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.140, hex:P.coat},
      {y:S.chest.y, cz:S.chest.z, rx:0.155, hex:P.coat},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.130, hex:P.coatLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.neck.y-0.02,S.neck.z), P.coatLt);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.coatDk, true);
    // long greatcoat hem trailing down, tattering into ghost-pale ragged strips
    for(const [dx] of [[-0.10],[-0.03],[0.04],[0.11]]){
      quad(V(dx,S.hip.y-0.06,S.hip.z-0.02),V(dx+0.05,S.hip.y-0.06,S.hip.z-0.02),
           V(dx+0.03,S.hip.y-0.24,S.hip.z-0.06),V(dx-0.02,S.hip.y-0.24,S.hip.z-0.06),P.ghost,0.09);
    }
    // brass buttons
    for(const y of [0.42,0.50,0.58]) quad(V(-0.014,y,S.chest.z+0.15),V(0.014,y,S.chest.z+0.15),V(0.011,y+0.018,S.chest.z+0.15),V(-0.011,y+0.018,S.chest.z+0.15),P.brass,0.04);
  }

  /* ---------- HEAD — officer's peaked cap, gaunt ghost-pale face, hollow socket shading. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.078, hex:P.skinDk},
      {y:S.headB.y+0.055, r:0.084, hex:P.skin},
      {y:S.headT.y-0.06, r:0.076, hex:P.capBand},
      {y:S.headT.y-0.01, r:0.078, hex:P.cap},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z-0.01), P.capDk);
    // peaked brim
    quad(V(-0.09,S.headT.y-0.09,S.headB.z+0.09), V(0.09,S.headT.y-0.09,S.headB.z+0.09),
         V(0.07,S.headT.y-0.06,S.headB.z-0.06), V(-0.07,S.headT.y-0.06,S.headB.z-0.06), P.capDk, 0.04);
    // hollow ghost-socket shading (no eyes)
    for(const s of [-1,1]) quad(V(s*0.055-0.020,S.headB.y+0.05,S.headB.z+0.07), V(s*0.055+0.020,S.headB.y+0.05,S.headB.z+0.07),
         V(s*0.055+0.016,S.headB.y+0.08,S.headB.z+0.065), V(s*0.055-0.016,S.headB.y+0.08,S.headB.z+0.065), P.ghostDk, 0.05);
  }

  /* ---------- ARMS — one raised to the mouth with the whistle, one gesturing forward-over. --------- */
  {
    const shR=V(-0.12,0.68,0.06), elR=V(-0.18,0.78,0.14), hR=V(-0.05,0.80,0.20);
    tube(shR,elR,0.048,0.038,6,P.coat); tube(elR,hR,0.036,0.026,6,P.coatDk,{capB:{hex:P.skin,lift:0.015}});
    // whistle at the lips
    const wc=V(0,0.80,0.14);
    tube(hR,wc,0.010,0.008,4,P.brass,{capB:{hex:P.brass,lift:0.004}});
    // cord from whistle to a coat button
    tube(wc,V(0.04,0.66,0.16),0.006,0.006,4,P.coatDk);
    const shL=V(0.13,0.70,0.06), elL=V(0.24,0.62,0.24), hL=V(0.32,0.60,0.42);
    tube(shL,elL,0.048,0.036,6,P.coat); tube(elL,hL,0.034,0.024,6,P.coatDk,{capB:{hex:P.skin,lift:0.015}});
    // gesturing-forward ghost tatter trailing off the pointing hand (translucent-read wisp)
    quad(V(0.30,0.60,0.42),V(0.36,0.58,0.48),V(0.34,0.52,0.52),V(0.28,0.54,0.46),P.ghost,0.10);
  }

  /* ---------- LEGS — upright standing at the parapet, one slightly forward. ---------- */
  {
    const hipL=V(-0.08,0.34,0), kneeL=V(-0.09,0.16,0.06), footL=V(-0.09,0.02,0.10);
    tube(hipL,kneeL,0.066,0.052,6,P.coatDk); tube(kneeL,footL,0.052,0.036,6,P.coat,{capB:{hex:P.capDk,lift:0.02}});
    const hipR=V(0.08,0.34,0), kneeR=V(0.10,0.16,-0.02), footR=V(0.12,0.02,-0.04);
    tube(hipR,kneeR,0.066,0.050,6,P.coatDk); tube(kneeR,footR,0.050,0.034,6,P.coat,{capB:{hex:P.capDk,lift:0.02}});
    // ghost-tatter hem wisps at the boot-tops (fading legs)
    for(const [x] of [[-0.09],[0.11]]) quad(V(x-0.03,0.06,0.06),V(x+0.03,0.06,0.06),V(x+0.02,0.0,0.02),V(x-0.02,0.0,0.02),P.ghost,0.09);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
