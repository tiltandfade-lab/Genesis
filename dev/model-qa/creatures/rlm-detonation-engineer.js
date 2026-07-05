/* dev/model-qa/creatures/rlm-detonation-engineer.js — DETONATION ENGINEER (ash realm, Medium
   Humanoid, CR 8). Read: a half-mad reactor-core warhead engineer — a lean wiry figure in a
   scorched rad-suit half-unzipped, goggles pushed up on a soot-streaked brow, a glowing
   strapped-on reactor-core warhead device on the chest, wires trailing to a detonator box held
   in one hand, tools/charges hanging off a mad tinkerer's harness. VS-desaturated ash palette
   with one sickly reactor-glow accent (the warhead core). NO eye quads — the goggle lenses read
   as dark glass, no face shown through them. Whole-object grammar: one function, one merged
   frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDetonationEngineer(){
  const P = {
    suit:0x565044, suitDk:0x322e26, suitLt:0x6c6552,
    scorch:0x241f19, patch:0x453f32,
    skin:0x8a6048, skinDk:0x5e4030,
    goggle:0x2a2822, lens:0x181614, strap:0x201d18,
    core:0x5a8a3c, coreGlow:0x8ac458, coreDk:0x2e4a1e,
    wire:0x201e1a, box:0x3a3630, boxDk:0x221f1a,
    harness:0x2c2822, charge:0x847a5e, chargeDk:0x544c38,
    disc:0x443f36, discTop:0x524b3e,
  };

  const L = {
    hipY:0.56, waistY:0.68, ribY:0.84, chestY:0.98, shldY:1.10, neckY:1.16,
    jawY:1.21, browY:1.30, crownY:1.36,
    shoulderX:0.205,
  };

  /* ---------- LEGS — lean, scorched rad-suit legging, quick nervous stance. ---------- */
  {
    const hipL=V(-0.12,L.hipY-0.02,0.01), kneeL=V(-0.13,0.32,0.05), ankL=V(-0.13,0.09,0.01);
    const hipR=V(0.12,L.hipY-0.02,-0.02), kneeR=V(0.13,0.32,-0.02), ankR=V(0.13,0.09,-0.01);
    tube(hipL,kneeL,0.096,0.070,6,P.suit);
    tube(kneeL,ankL,0.066,0.050,6,P.suitDk);
    tube(hipR,kneeR,0.096,0.070,6,P.suit);
    tube(kneeR,ankR,0.066,0.050,6,P.suitDk);
    for(const [x,y] of [[-0.13,0.22],[0.13,0.18]]) quad(V(x-0.016,y,0.045),V(x+0.016,y,0.045),V(x+0.012,y-0.08,0.04),V(x-0.012,y-0.08,0.04),P.scorch,0.06);
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.045,ank.z);
      tube(heel.clone().add(V(0,0,-0.02)), heel.clone().add(V(0,0,0.15)), 0.066,0.052,6,P.suitDk,{capA:{hex:P.suit}});
    }
  }

  /* ---------- TORSO — half-unzipped rad-suit, patch-scorched, harness of tools/charges. ---------- */
  stack([
    {y:L.hipY,   rx:0.130, rz:0.112, hex:P.suitDk},
    {y:L.waistY, rx:0.140, rz:0.122, hex:P.suit},
    {y:L.ribY,   rx:0.150, rz:0.128, hex:P.suitLt},
    {y:L.chestY, rx:0.156, rz:0.120, hex:P.suit},
    {y:L.shldY,  rx:0.175, rz:0.128, hex:P.suitLt},
    {y:L.neckY,  rx:0.068, rz:0.064, hex:P.suitDk},
  ], 8, {capTop:{hex:P.suitDk, lift:0.005}});
  // scorch patches and burn marks
  for(const [x0,y0,x1,y1] of [[-0.08,L.chestY+0.02,-0.02,L.ribY-0.02],[0.09,L.shldY-0.02,0.03,L.chestY]]){
    quad(V(x0,y0,0.13),V(x0+0.012,y0,0.13),V(x1+0.01,y1,0.125),V(x1,y1,0.125), P.scorch, 0.06);
  }
  // half-unzipped V showing bare chest/skin underneath
  quad(V(-0.03,L.shldY+0.01,0.13),V(0.03,L.shldY+0.01,0.13),V(0.05,L.ribY,0.12),V(-0.05,L.ribY,0.12), P.skin, 0.05);

  // THE REACTOR-CORE WARHEAD DEVICE — strapped to the chest, the one glowing accent
  {
    const cC=V(0.0,L.ribY+0.03,0.16);
    tube(V(cC.x,cC.y-0.06,cC.z),V(cC.x,cC.y+0.06,cC.z+0.01),0.072,0.072,7,P.core,{capA:{hex:P.coreDk},capB:{hex:P.coreDk,lift:0.008}});
    blob(cC.x,cC.y,cC.z+0.06,0.032,0.032,0.024,P.coreGlow,5,4); // glowing core window
    // strap bands around the warhead
    for(const y of [cC.y-0.05,cC.y+0.05]) quad(V(-0.09,y,cC.z+0.055),V(0.09,y,cC.z+0.055),V(0.085,y-0.015,cC.z+0.05),V(-0.085,y-0.015,cC.z+0.05),P.strap,0.04);
  }
  // trailing wires from the core down to the detonator hand
  tube(V(0.05,L.ribY-0.02,0.20), V(0.16,0.60,0.24), 0.008,0.006,4,P.wire);
  tube(V(0.16,0.60,0.24), V(0.20,0.42,0.28), 0.006,0.005,4,P.wire);

  // mad tinkerer's harness — hanging charges/tools across the shoulders and hip
  quad(V(-0.16,L.shldY,-0.02),V(0.16,L.shldY,-0.02),V(0.13,L.hipY+0.04,-0.06),V(-0.13,L.hipY+0.04,-0.06), P.harness, 0.05);
  for(const [x,y] of [[-0.11,L.waistY],[0.10,L.ribY-0.04],[-0.04,L.hipY+0.06]]){
    tube(V(x,y+0.05,-0.05),V(x,y-0.06,-0.05),0.020,0.020,5,P.charge,{capA:{hex:P.chargeDk},capB:{hex:P.chargeDk,lift:0.005}});
  }
  for(const s of [-1,1]) blob(s*L.shoulderX,L.shldY+0.01,0.0, 0.078,0.055,0.072,P.suitLt,6,3);

  /* ---------- HEAD — goggles pushed up on a soot-streaked brow, dark lenses, no face shown through. --- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.068, rz:0.064, hex:P.skin},
      {y:L.jawY+0.07, rx:0.074, rz:0.070, hex:P.skinDk},
      {y:L.browY,  rx:0.066, rz:0.058, hex:P.skinDk},
      {y:L.crownY, rx:0.055, rz:0.050, hex:P.suitDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.crownY+0.015,0.0), P.suitDk);
    // soot streaks on the brow
    quad(V(-0.03,L.browY+0.01,0.06),V(0.02,L.browY,0.055),V(0.01,L.browY-0.04,0.05),V(-0.04,L.browY-0.03,0.055), P.scorch, 0.06);
    // jaw
    quad(V(-0.04,L.jawY,0.058),V(0.04,L.jawY,0.058),V(0.036,L.jawY-0.045,0.054),V(-0.036,L.jawY-0.045,0.054),P.skinDk,0.04);
    // GOGGLES pushed up on the forehead, dark lenses (no eye quads — lens is the only "eye" shape)
    const gY=L.crownY-0.02;
    quad(V(-0.075,gY,0.05),V(0.075,gY,0.05),V(0.07,gY-0.045,0.048),V(-0.07,gY-0.045,0.048), P.goggle, 0.04);
    for(const s of [-1,1]) blob(s*0.036,gY-0.022,0.058,0.024,0.020,0.010,P.lens,4,3);
    tube(V(-0.08,gY-0.01,0.02),V(-0.10,gY+0.02,-0.03),0.010,0.006,4,P.strap); // strap around the head
  }

  /* ---------- ARMS — one hand gripping a wired detonator box, the other loose/gesturing. ---------- */
  {
    const S=V(L.shoulderX,L.shldY-0.02,0.0), E=V(0.22,0.66,0.20), W=V(0.20,0.42,0.28);
    tube(S,E,0.058,0.044,6,P.suit);
    tube(E,W,0.044,0.034,6,P.skinDk,{capB:{hex:P.skinDk,lift:0.005}});
    const S2=V(-L.shoulderX,L.shldY-0.02,0.0), E2=V(-0.20,0.70,0.10), W2=V(-0.18,0.52,0.02);
    tube(S2,E2,0.058,0.044,6,P.suit);
    tube(E2,W2,0.044,0.034,6,P.skinDk,{capB:{hex:P.skinDk,lift:0.005}});

    // detonator box in the right hand
    quad(V(0.16,0.40,0.30),V(0.24,0.40,0.30),V(0.24,0.32,0.32),V(0.16,0.32,0.32), P.box, 0.05);
    quad(V(0.18,0.38,0.29),V(0.22,0.38,0.29),V(0.22,0.35,0.30),V(0.18,0.35,0.30), P.boxDk, 0.03); // recessed switch
  }

  /* ---------- base disc (Medium r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
