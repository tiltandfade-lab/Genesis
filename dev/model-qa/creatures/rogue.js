/* dev/model-qa/creatures/rogue.js — SNEAKY-CROUCH ROGUE (F2 re-pose, 2026-07-04. New PRIMARY; the
   original upright twin-dagger rogue is kept verbatim as rogue-alt1.js per the alt policy).
   Reference (pose-refs.md §3): low crouch, forward lean over the lead foot, reverse-grip dagger held
   CLOSE to the body — tucked in near the forearm, NOT sprouting from the hip (the logged hero-angle
   bug, fixed here in the same pass). Weight forward, coiled, head lowered.

   Still the MODULARITY PROOF: head, hood, base, arms, and the DAGGER are shared modules from parts.js.
   The re-pose is joint/transform edits on the existing part assembly (the F3 doctrine: geometry is
   authored; a pose is transforms). A `crouch()` transform lowers + leans the whole upper body about
   the hips as one coherent unit; the legs bend into a deep crouch; the daggers tuck in close. */
import { V, tube, stack } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildHead, buildHood, buildArmToGrip, buildDagger, buildBase } from '../parts.js';

export function buildRogue(){
  const L = humanoidRig();                        // <-- the SHARED rig (landmarks)
  const P = Object.assign({}, BASE_P, {
    hood:0x3a3d40, hoodDk:0x282a2c,
    leather:0x4a3a28, leatherDk:0x33281b, leatherLt:0x5c4832,
    strap:0x2a2119, trouser:0x342c22, boot:0x241d15,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0x9c7d3e,
  });

  /* ---------- THE CROUCH TRANSFORM ----------
     Everything from the hips up is (1) dropped DOWN (deep crouch — the whole upper body sinks toward
     the bent legs) and (2) pitched FORWARD about a low pivot (the coiled forward lean). Applied to the
     torso, head, hood, shoulders, and the dagger grips so the figure re-poses as ONE coherent unit.
     Pivot at the hips (y≈hipY); a forward pitch tips the chest/head over the lead foot. */
  const DROP = 0.20;                               // crouch: sink the upper body
  const PITCH = 0.34;                              // forward lean (radians), about the hip pivot
  const PIVOT = V(0.0, L.hipY - DROP, 0.02);
  const crouch = (p)=>{
    const q = p.clone().add(V(0, -DROP, 0)).sub(PIVOT); // drop, then localize to the pivot
    q.applyAxisAngle(V(1,0,0), PITCH);                  // pitch forward
    return q.add(PIVOT);
  };

  /* --- TWIN DAGGERS FIRST (shared module ×2), placed in the CROUCHED, LEANED space and held CLOSE.
     Right (lead) dagger: forward stab, low and in front of the crouched chest. Left dagger: reverse/
     ice-pick grip TUCKED UP AND IN against the ribs — blade points DOWN along the forearm, grip near
     the chest, NOT out at the hip. Both grips are authored in the crouched frame so the derived fists
     sit right where the leaned arms reach. */
  const gripR = crouch(V(0.24, 0.86, 0.34));            // lead hand: forward + a touch low, close to the body
  const dirR  = V(0.22,-0.20,1).normalize();            // blade forward + slightly down (a low ready stab)
  const gripL = crouch(V(-0.15, 0.98, 0.20));           // off hand: HIGH + IN near the chest (tucked)
  const dirL  = V(-0.10,-0.94,0.28).normalize();        // reverse grip: blade points DOWN, tight to the forearm
  const fistR = buildDagger(gripR, dirR, P);
  const fistL = buildDagger(gripL, dirL, P);

  /* --- BODY slot: slim leather torso loft, built then crouched --- */
  buildTorsoInline(L, P, crouch);

  /* --- SHARED head + hood + base. The crouch xform is passed straight through, so head + hood lean
     and drop with the body as one coherent unit (parts.buildHead/buildHood take opts.xform). --- */
  buildHead(L, P, {xform:crouch});
  buildHood(L, P, {xform:crouch});
  buildBase(P);

  /* --- SHARED arms, each derived to its dagger fist. Shoulders taken from the CROUCHED rig so the
     upper arms leave the leaned torso and reach IN to the tucked grips (short, bent, close). --- */
  const shR = crouch(V(L.shoulderX, L.shldY-0.01, 0.015));
  const shL = crouch(V(-L.shoulderX, L.shldY-0.01, 0.015));
  buildArmToGrip(shR, fistR, P, {sleeveHex:P.leather, cuffHex:P.leatherDk, bend:V(0.05,-0.02,0.08)});
  buildArmToGrip(shL, fistL, P, {sleeveHex:P.leather, cuffHex:P.leatherDk, bend:V(-0.10,0.0,0.06)});

  /* --- LEGS — a DEEP crouch: hips low (dropped), knees pushed WIDE and FORWARD, ankles planted under
     the body. Lead (right) leg forward, trailing (left) leg braced back — the coiled sneaking stance. */
  const hipL = crouch(V(-L.hipHalf, L.hipY-0.01, 0.01));
  const hipR = crouch(V( L.hipHalf, L.hipY-0.01, 0.00));
  const kneeL=V(-0.215, 0.34, 0.12), ankL=V(-0.20, 0.085, -0.02);   // trailing leg: knee out, foot back-under
  const kneeR=V( 0.225, 0.32, 0.26), ankR=V( 0.21, 0.085,  0.16);   // lead leg: knee forward, foot forward
  tube(hipL,kneeL,0.086,0.060,6,P.trouser); tube(kneeL,ankL,0.056,0.042,6,P.trouser);
  tube(hipR,kneeR,0.086,0.060,6,P.trouser); tube(kneeR,ankR,0.056,0.042,6,P.trouser);
  for(const [ank,toe] of [[ankL,V(0.08,0,1)], [ankR,V(0.55,0,0.85)]]){
    const d=toe.clone().normalize(), toeA=V(ank.x,0.05,ank.z);
    tube(V(ank.x,0.17,ank.z), toeA, 0.062,0.052,6,P.boot);
    tube(toeA, toeA.clone().addScaledVector(d,0.130), 0.052,0.040,6,P.boot,{capB:{hex:P.boot,lift:0.012},raz:0.046,rbz:0.032});
  }
}

/* the only rogue-specific geometry: a slim leather torso + belt straps, all under the crouch xform */
function buildTorsoInline(L, P, crouch){
  stack([
    {y:L.hipY,   rx:0.185, rz:0.140, hex:P.leatherDk},
    {y:L.waistY, rx:0.158, rz:0.120, hex:P.leather},
    {y:L.ribY,   rx:0.185, rz:0.138, hex:P.leather},
    {y:L.chestY, rx:0.205, rz:0.150, hex:P.leatherLt},
    {y:L.shldY,  rx:0.210, rz:0.142, hex:P.leatherLt},
    {y:L.neckY,  rx:0.078, rz:0.074, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:crouch});
  // hip skirt (short leather tassets)
  stack([
    {y:0.55, rx:0.215, rz:0.170, hex:P.leatherDk},
    {y:0.70, rx:0.190, rz:0.145, hex:P.leather},
  ], 8, {xform:crouch});
  // crossed baldric strap (two diagonal tubes across the chest)
  tube(crouch(V(-0.19,0.72,0.14)), crouch(V(0.17,1.06,0.13)), 0.020,0.018,5,P.strap);
  tube(crouch(V(0.19,0.72,0.13)),  crouch(V(-0.17,1.06,0.14)),0.020,0.018,5,P.strap);
}
