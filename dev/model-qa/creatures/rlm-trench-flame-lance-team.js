/* dev/model-qa/creatures/rlm-trench-flame-lance-team.js — Trench Flame-Lance Team (theater, trench
   lens, Medium, CR 5). Read: two soldiers hauling a squat oil-fire tank strapped between them on
   a shoulder yoke, feeding a long lance-nozzle held forward by the lead soldier, a guttering flame
   licking from the tip. Whole-object grammar: one merged frame, no anchors — the pair + tank read
   as ONE silhouette (front soldier forward-leaning aiming the lance, rear soldier braced behind the
   tank). VS-desaturated mud-drab palette, dull rusted-iron tank, dirty rubber hose, low ember-orange
   flame. NO eye quads (helmet-shadow socket read only). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTrenchFlameLanceTeam(){
  const P = {
    coat:0x54523e, coatDk:0x363527, coatLt:0x686550,
    skin:0x8a715c, skinDk:0x5f4c3d,
    helm:0x3e3d33, helmDk:0x27261f,
    tank:0x4a453a, tankDk:0x2e2b23, tankLt:0x615c4d, rust:0x6b4a2e,
    hose:0x232019, nozzle:0x38352c,
    flame:0xb3491f, flameCore:0xd97a2e, flameDk:0x6b2612,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — front soldier forward-leaning (z+), rear soldier braced (z-), tank between. */
  const F = { // front (lance-bearer)
    hip:V(-0.02,0.30,0.12), waist:V(-0.02,0.42,0.18), chest:V(-0.01,0.52,0.24),
    shldr:V(-0.02,0.58,0.26), neck:V(-0.02,0.62,0.28), headB:V(-0.02,0.66,0.29), headT:V(-0.02,0.78,0.27),
  };
  const R = { // rear (tank-bearer)
    hip:V(0.02,0.30,-0.28), waist:V(0.02,0.42,-0.24), chest:V(0.02,0.53,-0.20),
    shldr:V(0.02,0.60,-0.18), neck:V(0.02,0.64,-0.16), headB:V(0.02,0.68,-0.15), headT:V(0.02,0.80,-0.17),
  };

  /* ---------- helper: build one hunched soldier torso+head+legs, forward-leaning ---------- */
  function soldier(S, lean, hex){
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y, cz:S.hip.z, rx:0.135, hex:P.coatDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.130, hex:P.coat},
      {y:S.chest.y, cz:S.chest.z, rx:0.145, hex:P.coat},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.120, hex:P.coatLt},
    ];
    const rings=bands.map(b=>ring(V(S.hip.x,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(S.neck.x,S.neck.y-0.02,S.neck.z), P.coatLt);
    capFan(rings[0], V(S.hip.x,S.hip.y-0.06,S.hip.z), P.coatDk, true);
    // helmet
    const hn=7, hph=Math.PI/hn;
    const hb=[{y:S.headB.y,r:0.078,hex:P.skinDk},{y:S.headB.y+0.05,r:0.085,hex:P.helm},{y:S.headT.y-0.02,r:0.088,hex:P.helm}];
    const hr=hb.map(b=>ring(V(S.headB.x,b.y,S.headB.z),V(0,1,0),b.r,b.r*0.92,hn,hph));
    stitch(hr, b=>hb[b].hex);
    capFan(hr.at(-1), V(S.headB.x,S.headT.y+0.02,S.headB.z-0.01), P.helmDk);
    // brim
    quad(V(S.headB.x-0.10,S.headT.y-0.06,S.headB.z+0.09), V(S.headB.x+0.10,S.headT.y-0.06,S.headB.z+0.09),
         V(S.headB.x+0.09,S.headT.y-0.04,S.headB.z-0.09), V(S.headB.x-0.09,S.headT.y-0.04,S.headB.z-0.09), P.helmDk, 0.04);
    // helmet-shadow socket read (no eyes)
    quad(V(S.headB.x-0.05,S.headB.y+0.01,S.headB.z+0.06), V(S.headB.x+0.05,S.headB.y+0.01,S.headB.z+0.06),
         V(S.headB.x+0.045,S.headB.y+0.045,S.headB.z+0.065), V(S.headB.x-0.045,S.headB.y+0.045,S.headB.z+0.065), P.skinDk, 0.04);
    // legs, crouched/braced
    const hipL=V(S.hip.x-0.08,0.30,S.hip.z), kneeL=V(S.hip.x-0.10,0.15,S.hip.z+lean*0.16), footL=V(S.hip.x-0.10,0.02,S.hip.z+lean*0.28);
    tube(hipL,kneeL,0.070,0.056,6,P.coatDk); tube(kneeL,footL,0.056,0.040,6,P.coat,{capB:{hex:P.helmDk,lift:0.02}});
    const hipR=V(S.hip.x+0.08,0.30,S.hip.z), kneeR=V(S.hip.x+0.14,0.11,S.hip.z-lean*0.14), footR=V(S.hip.x+0.18,0.02,S.hip.z-lean*0.28);
    tube(hipR,kneeR,0.070,0.054,6,P.coatDk); tube(kneeR,footR,0.054,0.038,6,P.coat,{capB:{hex:P.helmDk,lift:0.02}});
  }

  soldier(F, 1, P.coat);
  soldier(R, -1, P.coat);

  /* ---------- FUEL TANK — squat cylinder slung on a yoke between the two soldiers, at hip/waist height. */
  {
    const tb=V(0,0.42,-0.06), tt=V(0,0.62,-0.06);
    const rings=[];
    const n=9, ph=Math.PI/n;
    const bands=[{y:0.40,r:0.150,hex:P.tankDk},{y:0.48,r:0.165,hex:P.tank},{y:0.58,r:0.160,hex:P.tankLt},{y:0.64,r:0.140,hex:P.tank}];
    for(const b of bands) rings.push(ring(V(0,b.y,-0.06), V(0,1,0), b.r, b.r*0.7, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,0.67,-0.06), P.tankDk);
    capFan(rings[0], V(0,0.37,-0.06), P.tankDk, true);
    // rust streaks + rivets
    for(const [z,y] of [[-0.15,0.44],[0.03,0.52],[-0.10,0.60]]){
      quad(V(-0.03,y,z-0.10), V(0.03,y,z-0.10), V(0.02,y+0.06,z-0.09), V(-0.02,y+0.06,z-0.09), P.rust, 0.08);
    }
    // yoke straps over both soldiers' shoulders to the tank
    quad(V(-0.02,0.62,0.20), V(0.05,0.60,-0.02), V(0.03,0.50,-0.04), V(-0.06,0.52,0.18), P.hose, 0.06);
    quad(V(0.02,0.64,-0.20), V(-0.05,0.60,-0.02), V(-0.03,0.50,-0.04), V(0.06,0.52,-0.18), P.hose, 0.06);
  }

  /* ---------- HOSE + LANCE NOZZLE — feeds from tank forward to a long lance held by the front soldier. */
  {
    const hb=V(0.02,0.50,-0.02), hm=V(0,0.46,0.20), hg=V(-0.05,0.42,0.42);
    tube(hb,hm,0.028,0.024,6,P.hose); tube(hm,hg,0.024,0.020,6,P.hose);
    const lanceGrip=V(-0.05,0.42,0.42), lanceMid=V(-0.04,0.44,0.72), muzzle=V(-0.02,0.44,1.02);
    tube(lanceGrip,lanceMid,0.020,0.016,6,P.nozzle);
    tube(lanceMid,muzzle,0.016,0.012,6,P.nozzle,{capB:{hex:P.nozzle,lift:0.004}});
    // grip brace hands (front soldier)
    tube(V(-0.16,0.52,0.34),V(-0.06,0.44,0.46),0.036,0.026,6,P.coat,{capB:{hex:P.skin,lift:0.015}});
    tube(V(0.14,0.54,0.30),V(-0.02,0.45,0.66),0.034,0.024,6,P.coat,{capB:{hex:P.skin,lift:0.015}});
  }

  /* ---------- FLAME — a guttering gout of fire from the nozzle tip, layered translucent-read quads. */
  {
    const gouts=[
      [0.02,0.42,1.10,0.10],[-0.02,0.48,1.22,0.14],[0.05,0.44,1.30,0.09],
      [0.0,0.52,1.40,0.15],[-0.04,0.46,1.34,0.08],
    ];
    for(const [x,y,z,r] of gouts){
      quad(V(x-r,y,z), V(x+r,y,z), V(x+r*0.5,y+r*0.9,z+r*0.5), V(x-r*0.5,y+r*0.9,z+r*0.5), P.flame, 0.10);
    }
    quad(V(-0.03,0.43,1.10), V(0.03,0.43,1.10), V(0.018,0.47,1.20), V(-0.018,0.47,1.20), P.flameCore, 0.10);
    quad(V(-0.02,0.41,1.02), V(0.02,0.41,1.02), V(0.012,0.44,1.10), V(-0.012,0.44,1.10), P.flameDk, 0.08);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
