/* dev/model-qa/creatures/npc-beggar.js — the beggar / urchin (whole-object NPC).
   npc-role rows 33-35 (Beggar or Urchin, 3/100 and a recurring street presence). THE distinctness
   check: the beggar is the SMALLEST, most COLLAPSED silhouette in the civilian cast — a deep hunch,
   knees folded, a ragged over-cloak in tatters, and a BEGGING BOWL held out in both cupped hands
   (authored FIRST — the supplicant read). Where the commoner stands and works, the beggar folds
   inward and reaches out. Filthy greys and torn browns; no cap, matted hair, a walking crutch-stick
   leaned against the shoulder. Shared rig/base from parts.js. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildBeggar(){
  /* ---------- PALETTE (filthy greys + torn browns — the drabbest, dirtiest cloth in the cast) ---------- */
  const P = Object.assign({}, BASE_P, {
    rag:0x6f6a5e, ragDk:0x4c4840, ragLt:0x82796a,
    cloak:0x565046, cloakDk:0x3b362e,
    skin:0xb18b64, skinDk:0x7c5e40,
    bowl:0x7a6242, bowlDk:0x503d24,
    stick:0x5f4c33, stickDk:0x3f3120,
    hair:0x4a4038, foot:0x453a2c,
  });

  /* ---------- RIG — SHORT and deeply HUNCHED; head dropped forward, shoulders curled in ---------- */
  const L = humanoidRig({
    hipY:0.58, waistY:0.66, ribY:0.755, chestY:0.85, shldY:0.93, neckY:0.97,
    hipHalf:0.11, shoulderX:0.225,
    jawY:0.99, cheekY:1.055, browY:1.12, crownY:1.20, headTopY:1.255,
  });

  /* deep forward-and-inward hunch: lean grows with height above the hip pivot (fwd = +z, curled) */
  const HIP_PIVOT_Y = L.hipY;
  const lean = (p) => { const t = Math.max(0, p.y - HIP_PIVOT_Y); return V(p.x*(1-t*0.10), p.y - t*0.11, p.z + t*0.42); };

  /* ================= THE BEGGING BOWL — authored FIRST, held OUT and UP in both cupped hands at
     mid-chest, tilted toward the viewer (supplicating). Hands derive to the bowl rim. =========== */
  const BOWL_C = lean(V(0.0, 0.86, 0.24));       // out front, below the dropped face
  {
    const bands=[
      {y:BOWL_C.y-0.055, rx:0.010, rz:0.010, hex:P.bowlDk},
      {y:BOWL_C.y-0.02,  rx:0.070, rz:0.058, hex:P.bowlDk},
      {y:BOWL_C.y+0.01,  rx:0.092, rz:0.076, hex:P.bowl},
      {y:BOWL_C.y+0.028, rx:0.096, rz:0.080, hex:P.bowl},   // rim
    ];
    const rings=bands.map(b=>ring(V(BOWL_C.x,b.y,BOWL_C.z), V(0,1,0), b.rx, b.rz, 9, 0));
    stitch(rings, b=>bands[b].hex);
    /* dark hollow interior (empty bowl) */
    capFan(ring(V(BOWL_C.x,BOWL_C.y+0.02,BOWL_C.z), V(0,1,0), 0.078,0.064, 9, 0), V(BOWL_C.x,BOWL_C.y-0.01,BOWL_C.z), P.bowlDk, true);
  }
  const GRIP_L=V(BOWL_C.x-0.088, BOWL_C.y-0.005, BOWL_C.z-0.02);
  const GRIP_R=V(BOWL_C.x+0.088, BOWL_C.y-0.005, BOWL_C.z-0.02);

  /* a lean CRUTCH-STICK planted well FORWARD of and OUTSIDE the left side — its whole length stays
     ahead of the torso (high +z) so no view shows it passing through the shoulder or trunk. Top sits
     at armpit height, forward, where a leaned-on stick would meet the body's front-left. */
  {
    const top=V(-0.275,0.90,0.30), bot=V(-0.295,0.02,0.14);
    tube(bot, top, 0.018,0.016, 5, P.stick, {capA:{hex:P.stickDk}, capB:{hex:P.stickDk}});
    /* a small cross-piece at the top (the hand/armpit rest), across the front */
    tube(top.clone().add(V(-0.04,0.008,-0.02)), top.clone().add(V(0.04,0.008,0.02)), 0.014,0.014,5,P.stickDk);
  }

  /* trunk — a lean, half-starved body under a torn shirt; narrower than the commoner */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.115, hex:P.ragDk},
    {y:L.waistY, rx:0.132, rz:0.100, hex:P.rag},
    {y:L.ribY,   rx:0.150, rz:0.112, hex:P.rag},
    {y:L.chestY, rx:0.162, rz:0.120, hex:P.rag},
    {y:L.shldY,  rx:0.158, rz:0.114, hex:P.ragDk},
    {y:L.neckY,  rx:0.070, rz:0.066, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:lean});

  /* a ragged over-cloak draped off the shoulders and hanging in TATTERS (jagged hem) */
  {
    const bands=[
      {y:0.30, rx:0.190, rz:0.150, hex:P.cloakDk},
      {y:0.48, rx:0.185, rz:0.145, hex:P.cloak},
      {y:L.shldY-0.02, rx:0.180, rz:0.135, hex:P.cloak},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, 9, Math.PI/9).map(lean));
    stitch(rings, b=>bands[b].hex, {0:[3,4,5],1:[3,4,5],2:[3,4,5]});   // open down the front, drapes the back+sides
    /* torn hanging tatters along the front hem */
    for(const tx of [-0.14,-0.02,0.10]){
      quad(lean(V(tx,0.30,0.10)), lean(V(tx+0.06,0.30,0.10)),
           lean(V(tx+0.04,0.20,0.115)), lean(V(tx+0.01,0.24,0.115)), P.cloakDk, 0.06);
    }
  }

  /* knee-length torn under-tunic skirt (frayed) */
  stack([
    {y:0.36, rx:0.170, rz:0.135, hex:P.ragDk},
    {y:L.hipY-0.02, rx:0.150, rz:0.115, hex:P.rag},
  ], 8, {});

  /* head (skin loft; nose ridge; painted eyes) — DROPPED forward under the hunch, gaunt */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.074, rz:0.080, hex:P.skin},
      {y:L.cheekY, rx:0.100, rz:0.098, hex:P.skin},   // hollow gaunt cheeks (a hair narrower)
      {y:L.browY,  rx:0.106, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.083, rz:0.076, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph).map(lean));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    capFan(rings[3], lean(V(0, L.headTopY, 0.007)), P.skinDk);
    /* matted unkempt hair — a rough cap of dark hair over the crown, straggling low at the sides */
    const capBands=[
      {y:L.browY-0.01, rx:0.112, rz:0.104, hex:P.hair},
      {y:L.crownY+0.005, rx:0.090, rz:0.082, hex:P.hair},
      {y:L.headTopY+0.008, rx:0.044, rz:0.040, hex:P.skinDk},
    ];
    const capRings=capBands.map(b=>ring(V(0,b.y,0.002), V(0,1,0), b.rx, b.rz, n, ph).map(lean));
    stitch(capRings, b=>capBands[b].hex, {0:[1,2],1:[1,2]});   // fringe parts over the gaunt face
    capFan(capRings.at(-1), lean(V(0, L.headTopY+0.04, 0.0)), P.hair);
  }

  /* arms — BOTH reach forward, cupping the bowl (derived to GRIP_L/GRIP_R). Thin, ragged sleeves. */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const EL=lean(V(0.185,0.87,0.14));
    tube(lean(S),EL,0.058,0.046,6,P.rag);
    tube(EL,GRIP_R,0.044,0.036,6,P.skin,{capB:{hex:P.skin}});
    tube(GRIP_R.clone().add(V(-0.02,-0.02,-0.02)), GRIP_R.clone().add(V(0.015,0.02,0.03)), 0.036,0.034,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const EL2=lean(V(-0.185,0.87,0.14));
    tube(lean(S2),EL2,0.058,0.046,6,P.rag);
    tube(EL2,GRIP_L,0.044,0.036,6,P.skin,{capB:{hex:P.skin}});
    tube(GRIP_L.clone().add(V(-0.015,-0.02,-0.02)), GRIP_L.clone().add(V(0.02,0.02,0.03)), 0.036,0.034,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* legs — FOLDED: knees drawn up, half-crouched (sitting-into-the-hunch), bare wrapped feet */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.03), kneeL=V(-0.145,0.30,0.18), ankL=V(-0.135,0.07,0.09);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.02), kneeR=V( 0.145,0.30,0.17), ankR=V( 0.135,0.07,0.08);
    tube(hipL,kneeL,0.070,0.052,6,P.ragDk);
    tube(kneeL,ankL,0.050,0.038,6,P.rag);
    tube(hipR,kneeR,0.070,0.052,6,P.ragDk);
    tube(kneeR,ankR,0.050,0.038,6,P.rag);
    /* rag-wrapped feet (no shoes) */
    for(const ank of [ankL,ankR]){
      stack([
        {y:0.010, rx:0.052, rz:0.062, cx:ank.x, cz:ank.z, hex:P.foot},
        {y:0.05,  rx:0.046, rz:0.050, cx:ank.x, cz:ank.z, hex:P.ragDk},
      ], 6, {capTop:{hex:P.ragDk, lift:0.004}});
      const toeA=V(ank.x,0.04,ank.z+0.01);
      tube(toeA, toeA.clone().add(V(0,0,0.09)), 0.044,0.034,6,P.foot, {capB:{hex:P.foot, lift:0.01}, raz:0.036, rbz:0.026});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
