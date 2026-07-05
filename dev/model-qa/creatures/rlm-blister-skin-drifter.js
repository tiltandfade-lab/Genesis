/* dev/model-qa/creatures/rlm-blister-skin-drifter.js — BLISTER-SKIN DRIFTER (ash realm, Medium biped, CR 1).
   Read: a weeping-sore contact-rot drifter — a shambling humanoid whose exposed skin is covered
   in cracked, weeping chemical-burn blisters, ragged remnant clothing, a lurching stiff gait
   read through posture, arms held slightly out from the body (avoiding contact with itself).
   Whole-object grammar. NO eye quads — sunken dark sockets only. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBlisterSkinDrifter(){
  /* ---------- PALETTE (VS-desaturated sickly grey-tan skin, weeping sore yellow-red, rag remnants) ---------- */
  const P = {
    skin:0x8a8168, skinDk:0x655e48, skinLt:0x9a9276,
    sore:0x8a5040, soreWeep:0xa06848, soreDk:0x5c3226,
    blister:0x6e6a4a, scab:0x3a2e22,
    rag:0x655c4c, ragDk:0x453e32,
    mouth:0x201c16, disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — upright but stooped, gaunt biped ~1.66u tall ---------- */
  const S = {
    hip:    V(0, 0.86, 0),
    waist:  V(0.01, 1.02, 0.02),
    chest:  V(0.02, 1.24, 0.04),
    shldr:  V(0.02, 1.40, 0.02),
    neck:   V(0.01, 1.48, 0.00),
    headB:  V(0, 1.54, -0.01),
    headT:  V(-0.01, 1.72, -0.03),
  };

  /* ---------- TORSO — bare afflicted skin under torn remnant rags ---------- */
  tube(S.hip,   S.waist, 0.150, 0.130, 8, P.skin,   {phase:Math.PI/8, capA:{hex:P.skinDk, lift:0.02}});
  tube(S.waist, S.chest, 0.130, 0.170, 8, P.skin,   {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.170, 0.155, 8, P.rag,    {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.155, 0.072, 8, P.skinDk, {phase:Math.PI/8});
  /* ragged remnant cloth hanging off one shoulder */
  quad(V(-0.16,1.42,0.02), V(-0.02,1.38,0.10), V(-0.03,1.05,0.09), V(-0.17,1.10,0.01), P.ragDk, 0.06);

  /* weeping sore blisters across the torso/chest/arms — cracked wet chemical-burn patches */
  const soreSpots = [
    [0.10,1.30,0.15,0.035],[-0.09,1.24,0.15,0.03],[0.03,1.16,0.17,0.04],
    [0.12,1.06,0.13,0.03],[-0.11,1.35,0.10,0.025],[0.00,1.42,0.05,0.03],
    [0.14,1.20,-0.05,0.03],[-0.05,0.98,0.14,0.028]
  ];
  for(const [x,y,z,r] of soreSpots){
    quad(V(x-r,y,z), V(x+r,y,z), V(x+r*0.8,y+r*1.3,z+0.01), V(x-r*0.8,y+r*1.3,z+0.01), P.sore, 0.1);
    quad(V(x-r*0.4,y+r*0.3,z+0.01), V(x+r*0.4,y+r*0.3,z+0.01), V(x+r*0.3,y+r*0.8,z+0.015), V(x-r*0.3,y+r*0.8,z+0.015), P.soreWeep, 0.12);
  }

  /* ---------- HEAD — gaunt afflicted face, sores across cheeks/scalp, sunken sockets ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.55, cz:0.00, rx:0.090, rz:0.095, hex:P.skin},
      {y:1.62, cz:0.00, rx:0.096, rz:0.096, hex:P.skinLt},
      {y:1.69, cz:-0.02,rx:0.084, rz:0.086, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.735, -0.02), P.scab);

    /* patchy scab/blister scalp instead of hair */
    quad(V(-0.07,1.70,-0.05), V(0.07,1.70,-0.05), V(0.05,1.66,-0.06), V(-0.05,1.66,-0.06), P.scab, 0.06);
    quad(V(0.02,1.71,-0.02), V(0.075,1.685,-0.03), V(0.06,1.645,-0.03), V(0.01,1.665,-0.02), P.blister, 0.08);

    /* sunken dark sockets (no eye quads) */
    for(const s of [-1,1]) quad(V(s*0.045,1.615,0.075), V(s*0.068,1.615,0.070), V(s*0.062,1.575,0.075), V(s*0.042,1.578,0.078), P.mouth, 0.04);

    /* weeping sore across one cheek */
    quad(V(0.055,1.60,0.075), V(0.085,1.595,0.06), V(0.078,1.555,0.065), V(0.05,1.56,0.078), P.sore, 0.08);

    /* slack half-open mouth */
    quad(V(-0.03,1.535,0.085), V(0.03,1.535,0.085), V(0.024,1.515,0.086), V(-0.024,1.515,0.086), P.mouth, 0.03);
  }

  /* ---------- ARMS — held slightly OUT from the body (avoiding contact), afflicted skin visible ---------- */
  {
    const shL = V(-0.185, 1.375, 0.00), shR = V(0.185, 1.375, 0.00);
    const elL = V(-0.275, 1.14, 0.06);
    const wrL = V(-0.31, 0.90, 0.10);
    const elR = V(0.27, 1.16, -0.02);
    const wrR = V(0.30, 0.92, 0.02);
    tube(shL, elL, 0.058, 0.046, 6, P.skin);
    tube(elL, wrL, 0.046, 0.034, 6, P.skinLt, {capB:{hex:P.skinDk, lift:0.02}});
    tube(shR, elR, 0.058, 0.046, 6, P.skin);
    tube(elR, wrR, 0.046, 0.034, 6, P.skinLt, {capB:{hex:P.skinDk, lift:0.02}});
    /* sores on the forearms */
    for(const [p,r] of [[elL,0.024],[wrR,0.02]]){
      quad(V(p.x-r,p.y+0.02,p.z), V(p.x+r,p.y+0.02,p.z), V(p.x+r*0.8,p.y+r*1.2,p.z+0.01), V(p.x-r*0.8,p.y+r*1.2,p.z+0.01), P.sore, 0.1);
    }
  }

  /* ---------- LEGS — stiff lurching stance, torn trouser remnants ---------- */
  {
    const leg=(hipX, hex)=>{
      const hip  = V(hipX, 0.80, 0.00);
      const knee = V(hipX*1.06, 0.44, 0.02);
      const ankle= V(hipX*1.03, 0.14, 0.00);
      const foot = V(hipX*1.0, 0.03, 0.11);
      tube(hip, knee, 0.072, 0.055, 7, hex);
      tube(knee, ankle, 0.055, 0.040, 6, P.skinDk);
      tube(ankle, foot, 0.044, 0.046, 5, P.ragDk, {capB:{hex:P.ragDk, lift:0.01}});
    };
    leg(-0.095, P.rag);
    leg( 0.095, P.skin);
    /* sore on the bare leg */
    quad(V(0.13,0.55,0.05), V(0.155,0.55,0.03), V(0.148,0.50,0.04), V(0.125,0.50,0.06), P.sore, 0.08);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
