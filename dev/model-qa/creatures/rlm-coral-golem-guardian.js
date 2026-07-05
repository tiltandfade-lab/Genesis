/* dev/model-qa/creatures/rlm-coral-golem-guardian.js — CORAL GOLEM GUARDIAN (high-seas, Large
   Construct, CR 3). Read: a jagged reef-coral colossus shaped like a boarding PIKE stood upright —
   a tall narrow branching-coral spike-body, alive with darting cleaner-fish threading its jagged
   branches. Reads as a weapon given a body: a long tapering spiny trunk, coral "shoulders" flaring
   like a pike's crossguard, a spear-point head. VS-desaturated: bone-pale reef coral, rust-red and
   dull violet coral accents (never candy-reef-brights), small dull-silver fish. Whole-object
   grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildCoralGolemGuardian(){
  const P = {
    coral:0x8a7a68, coralDk:0x5e5346, coralLt:0xa89684,      // bone-pale reef coral
    coralRed:0x8a4a3c, coralVio:0x5a4a5c,
    spine:0x413a30,
    fish:0x8a9498, fishDk:0x5c646a,                           // dull-silver cleaner fish
    disc:0x2c3230, discTop:0x363e3a,
  };

  const L = { baseY:0.20, waistY:0.70, chestY:1.20, shldY:1.60, neckY:1.78, tipY:2.10 };

  /* ---------- TRUNK — a tall tapering spike-body, narrow at the base, widening at the "guard". ---------- */
  stack([
    {y:L.baseY,  rx:0.190, rz:0.170, hex:P.coralDk},
    {y:L.waistY, rx:0.155, rz:0.140, hex:P.coral},
    {y:L.chestY, rx:0.190, rz:0.165, hex:P.coralLt},
    {y:L.shldY,  rx:0.260, rz:0.220, hex:P.coral},    // pike-crossguard flare
    {y:L.neckY,  rx:0.110, rz:0.100, hex:P.coralDk},
  ], 7, {phase:Math.PI/7});

  /* ---------- CROSSGUARD SPARS — coral branches jutting sideways at the shoulder flare, reading as
     a pike's crossguard silhouette. ---------- */
  for(const sign of [-1,1]){
    const base=V(sign*0.22,L.shldY,0.02);
    const mid=V(sign*0.48,L.shldY+0.10,0.04);
    const tip=V(sign*0.66,L.shldY-0.02,0.02);
    tube(base,mid,0.075,0.050,6,P.coral); tube(mid,tip,0.050,0.018,6,P.coralDk,{capB:{hex:P.coralDk,lift:0.01}});
    // small branch spurs off the crossguard
    for(const t of [0.3,0.6]){
      const p=base.clone().lerp(mid,t);
      tube(p,V(p.x+sign*0.06,p.y+0.10,p.z-0.04),0.02,0.006,4,P.coralRed,{capB:{hex:P.coralRed}});
    }
  }

  /* ---------- SPINE BRANCHES — jagged coral spikes running the length of the trunk. ---------- */
  for(const [y,side,h] of [[L.baseY+0.10,-1,0.14],[L.waistY,1,0.18],[L.waistY+0.20,-1,0.16],
                            [L.chestY-0.10,1,0.20],[L.chestY+0.15,-1,0.16]]){
    const b=V(side*0.14,y,0.10), t=V(side*0.24,y+h,0.16);
    tube(b,t,0.045,0.010,5,side>0?P.coralRed:P.coralVio,{capB:{hex:P.spine,lift:0.01}});
  }

  /* ---------- HEAD/POINT — a narrow spear-point tip crowning the trunk, the pike's blade. ---------- */
  {
    const b1=ring(V(0,L.neckY,0),V(0,1,0),0.10,0.09,6,Math.PI/6);
    const b2=ring(V(0,L.neckY+0.16,0),V(0,1,0),0.055,0.05,6,Math.PI/6);
    stitch([b1,b2],()=>P.coral);
    capFan(b2,V(0,L.tipY,0),P.coralDk);
    // small eye-socket-like coral pits, no eye quads
    for(const s of [-1,1]) quad(V(s*0.03,L.neckY+0.06,0.075),V(s*0.045,L.neckY+0.06,0.075),V(s*0.04,L.neckY+0.02,0.07),V(s*0.028,L.neckY+0.02,0.07),P.spine,0.0);
  }

  /* ---------- LOWER LEGS/ROOTS — the trunk splits into short root-like coral stumps at the base. ---------- */
  for(const sign of [-1,0,1]){
    const top=V(sign*0.10,L.baseY+0.02,0), bot=V(sign*0.18,0.05,sign*0.10+0.06);
    tube(top,bot,0.10,0.06,6,P.coralDk,{capB:{hex:P.coralDk,lift:0.01}});
  }

  /* ---------- CLEANER FISH — small darting fish threading the coral branches, mid-height. ---------- */
  for(const [x,y,z] of [[0.20,L.chestY+0.05,0.14],[-0.24,L.waistY+0.10,0.18],[0.12,L.shldY-0.06,0.22],
                          [-0.10,L.baseY+0.20,0.16],[0.30,L.shldY+0.04,0.02]]){
    blob(x,y,z,0.03,0.018,0.014,P.fish,4,3);
    tube(V(x,y,z-0.03),V(x,y,z-0.055),0.012,0.002,3,P.fishDk,{capB:{hex:P.fishDk}});
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0),V(0,1,0),0.55,0.55,18);
    const r2=ring(V(0,0.050,0),V(0,1,0),0.53,0.53,18);
    stitch([r1,r2],()=>P.disc);
    capFan(r2,V(0,0.053,0),P.discTop);
  }
}
