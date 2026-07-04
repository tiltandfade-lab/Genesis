/* dev/model-qa/creatures/rogue-alt1.js — the ORIGINAL rogue, KEPT as an alt (Alt policy, F2 2026-07-04).
   Adam rated the OG rogue pretty-good; when F2 re-posed the rogue into a deep sneaky crouch (new
   PRIMARY in rogue.js), this upright twin-dagger stance is preserved verbatim as `rogue-alt1` so both
   render on the sheet. Identical geometry to the pre-F2 rogue.js; only the export name differs.

   MODULARITY PROOF: a class assembled from the shared parts kit. Almost nothing here is rogue-specific
   geometry code. The head, hood, base, arms, and the DAGGER are all shared modules from parts.js — the
   dagger is instantiated TWICE with different grips. Only the leather torso + legs are authored inline. */
import { V, tube, stack } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildHead, buildHood, buildArmToGrip, buildDagger, buildBase } from '../parts.js';

export function buildRogueAlt1(){
  const L = humanoidRig();                        // <-- the SHARED rig
  const P = Object.assign({}, BASE_P, {
    hood:0x3a3d40, hoodDk:0x282a2c,               // dark hood (parts.buildHood reads P.hood/hoodDk)
    leather:0x4a3a28, leatherDk:0x33281b, leatherLt:0x5c4832,
    strap:0x2a2119, trouser:0x342c22, boot:0x241d15,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0x9c7d3e,
  });

  /* --- TWIN DAGGERS FIRST (shared module ×2). Right: forward stab. Left: reverse/ice-pick grip. */
  const gripR = V(0.30, 0.74, 0.30), dirR = V(0.35,-0.35,1).normalize();
  const gripL = V(-0.26, 0.71, 0.24), dirL = V(-0.15,-0.9,0.35).normalize();   // blade points down (reverse grip)
  const fistR = buildDagger(gripR, dirR, P);
  const fistL = buildDagger(gripL, dirL, P);

  /* --- BODY slot (class-specific): slim leather torso loft, hips -> neck --- */
  buildTorsoInline(L, P);

  /* --- SHARED head + hood + base --- */
  buildHead(L, P);
  buildHood(L, P);
  buildBase(P);

  /* --- SHARED arms, each derived to its dagger fist --- */
  const shR = V(L.shoulderX, L.shldY-0.01, 0.015), shL = V(-L.shoulderX, L.shldY-0.01, 0.015);
  buildArmToGrip(shR, fistR, P, {sleeveHex:P.leather, cuffHex:P.leatherDk, bend:V(0.07,0.0,0.05)});
  buildArmToGrip(shL, fistL, P, {sleeveHex:P.leather, cuffHex:P.leatherDk, bend:V(-0.09,0.02,0.03)});

  /* --- legs: low, braced crouch (class body) --- */
  const hipL=V(-L.hipHalf,L.hipY-0.01,0.01), kneeL=V(-0.17,0.40,0.09), ankL=V(-0.18,0.085,0.05);
  const hipR=V( L.hipHalf,L.hipY-0.01,0.00), kneeR=V( 0.185,0.40,-0.04), ankR=V( 0.20,0.085,-0.09);
  tube(hipL,kneeL,0.082,0.058,6,P.trouser); tube(kneeL,ankL,0.054,0.040,6,P.trouser);
  tube(hipR,kneeR,0.082,0.058,6,P.trouser); tube(kneeR,ankR,0.054,0.040,6,P.trouser);
  for(const [ank,toe] of [[ankL,V(0.10,0,1)], [ankR,V(0.8,0,0.35)]]){
    const d=toe.clone().normalize(), toeA=V(ank.x,0.05,ank.z);
    tube(V(ank.x,0.16,ank.z), toeA, 0.060,0.052,6,P.boot);
    tube(toeA, toeA.clone().addScaledVector(d,0.125), 0.052,0.040,6,P.boot,{capB:{hex:P.boot,lift:0.012},raz:0.046,rbz:0.032});
  }
}

/* the only rogue-specific geometry: a slim leather torso + belt straps */
function buildTorsoInline(L, P){
  stack([
    {y:L.hipY,   rx:0.185, rz:0.140, hex:P.leatherDk},
    {y:L.waistY, rx:0.158, rz:0.120, hex:P.leather},
    {y:L.ribY,   rx:0.185, rz:0.138, hex:P.leather},
    {y:L.chestY, rx:0.205, rz:0.150, hex:P.leatherLt},
    {y:L.shldY,  rx:0.210, rz:0.142, hex:P.leatherLt},
    {y:L.neckY,  rx:0.078, rz:0.074, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  // hip skirt (short leather tassets)
  stack([
    {y:0.55, rx:0.215, rz:0.170, hex:P.leatherDk},
    {y:0.70, rx:0.190, rz:0.145, hex:P.leather},
  ], 8, {});
  // crossed baldric strap (two diagonal tubes across the chest)
  tube(V(-0.19,0.72,0.14), V(0.17,1.06,0.13), 0.020,0.018,5,P.strap);
  tube(V(0.19,0.72,0.13),  V(-0.17,1.06,0.14),0.020,0.018,5,P.strap);
}
