/* dev/model-qa/creatures/npc-innkeep.js — the innkeeper / host / cook (whole-object NPC).
   npc-role rows 60-62 (Innkeeper or Host) + 44-46 (Baker or Cook) = the hospitality read (6/100).
   THE distinctness check: an innkeep must not read as the shopkeep. The shopkeep is a lean trader
   behind a stall (measured merchant read). The innkeep is ROTUND and warm: a big round apron-belly,
   sleeves shoved up, a FULL TANKARD hoisted in one hand (authored FIRST — offering a drink, the
   clearest tavern tell) and a rag/cloth over the other forearm, a jolly wide stance. Warm ale-and-
   apron browns. Shared rig/base from parts.js. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildInnkeep(){
  /* ---------- PALETTE (warm tavern browns: apron, roll-sleeve shirt, ale) ---------- */
  const P = Object.assign({}, BASE_P, {
    shirt:0xb0a074, shirtDk:0x847647, shirtLt:0xc2b285,
    apron:0x8a5a30, apronDk:0x5f3c1e, apronLt:0x9c6a3c,
    rag:0xc9bfa0, ragDk:0x9a9075,
    skin:0xc7a074, skinDk:0x8d6d4a,
    tankard:0x6b5236, tankardDk:0x473519, ale:0xb3853a, aleLt:0xd8b46a, foam:0xe7ddc4,
    trouser:0x5c5240, boot:0x3a2f22,
  });

  /* ---------- RIG — SHORTER and BROADER (rotund host); low centre of gravity ---------- */
  const L = humanoidRig({
    hipY:0.68, waistY:0.75, ribY:0.85, chestY:0.95, shldY:1.03, neckY:1.07,
    shoulderX:0.255,
    jawY:1.10, cheekY:1.175, browY:1.25, crownY:1.34, headTopY:1.40,
  });

  /* ================= THE TANKARD — authored FIRST, hoisted in the RIGHT hand up near the chest,
     brimming with foamy ale. The gripping hand derives to the handle. ============================ */
  const TANK_C = V(0.31, 0.98, 0.16);            // tankard body centre, raised
  {
    const bands=[
      {y:TANK_C.y-0.075, rx:0.058, rz:0.058, hex:P.tankardDk},
      {y:TANK_C.y-0.02,  rx:0.064, rz:0.064, hex:P.tankard},
      {y:TANK_C.y+0.045, rx:0.066, rz:0.066, hex:P.tankard},
      {y:TANK_C.y+0.07,  rx:0.064, rz:0.064, hex:P.tankardDk},   // rim lip
    ];
    const rings=bands.map(b=>ring(V(TANK_C.x,b.y,TANK_C.z), V(0,1,0), b.rx, b.rz, 8, 0));
    stitch(rings, b=>bands[b].hex);
    /* ale surface + a foamy head sitting proud of the rim */
    capFan(ring(V(TANK_C.x,TANK_C.y+0.072,TANK_C.z), V(0,1,0), 0.058,0.058, 8, 0), V(TANK_C.x,TANK_C.y+0.078,TANK_C.z), P.aleLt);
    capFan(ring(V(TANK_C.x,TANK_C.y+0.085,TANK_C.z), V(0,1,0), 0.050,0.050, 8, 0), V(TANK_C.x,TANK_C.y+0.11,TANK_C.z), P.foam);
    /* the handle: a C-loop on the outer side (toward the arm) */
    const hb=V(TANK_C.x+0.066,TANK_C.y-0.03,TANK_C.z), ht=V(TANK_C.x+0.066,TANK_C.y+0.05,TANK_C.z);
    tube(hb, V(TANK_C.x+0.115,TANK_C.y-0.005,TANK_C.z), 0.012,0.012,5,P.tankardDk);
    tube(V(TANK_C.x+0.115,TANK_C.y-0.005,TANK_C.z), ht, 0.012,0.012,5,P.tankardDk);
  }
  const GRIP=V(TANK_C.x+0.10, TANK_C.y-0.005, TANK_C.z);   // fist wraps the handle

  /* torso — ROUND: a big-bellied barrel loft, widest at the belt (a well-fed host) */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.190, hex:P.shirtDk},
    {y:L.waistY, rx:0.250, rz:0.205, hex:P.shirt},        // belly bulge — widest here
    {y:L.ribY,   rx:0.235, rz:0.185, hex:P.shirt},
    {y:L.chestY, rx:0.222, rz:0.168, hex:P.shirtLt},
    {y:L.shldY,  rx:0.226, rz:0.160, hex:P.shirt},
    {y:L.neckY,  rx:0.094, rz:0.088, hex:P.skinDk},        // thick neck
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* the big front APRON — a broad panel over the belly and thighs, tied at the waist. Covers the
     front arc, bib rising to the chest, hem to the knees. */
  {
    /* bib + skirt as a front-only stack (skip the back cols) */
    stack([
      {y:0.44, rx:0.235, rz:0.200, hex:P.apronDk},
      {y:0.60, rx:0.250, rz:0.208, hex:P.apron},
      {y:L.waistY-0.01, rx:0.246, rz:0.202, hex:P.apronLt},
      {y:L.chestY-0.02, rx:0.170, rz:0.150, hex:P.apron},   // bib narrows up the chest
    ], 8, {skip:{0:[4,5,6],1:[4,5,6],2:[4,5,6],3:[4,5,6]}});
    /* apron waist-tie band across the front */
    const t1=ring(V(0,L.waistY,0), V(0,1,0), 0.256,0.210, 8, Math.PI/8);
    const t2=ring(V(0,L.waistY+0.035,0), V(0,1,0), 0.252,0.206, 8, Math.PI/8);
    stitch([t1,t2], ()=>P.apronDk, {0:[4,5,6],1:[4,5,6]});
  }

  /* head (skin loft; nose ridge; painted eyes) — round, ruddy, a bit jowly */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.092, rz:0.096, hex:P.skin},   // fuller jaw/jowl
      {y:L.cheekY, rx:0.116, rz:0.112, hex:P.skin},
      {y:L.browY,  rx:0.116, rz:0.107, hex:P.skin},
      {y:L.crownY, rx:0.090, rz:0.082, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.021;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    capFan(rings[3], V(0, L.headTopY, 0.007), P.skinDk);
    /* a bushy MOUSTACHE across the upper lip (the jovial-host tell) */
    quad(V(-0.055,L.jawY+0.052,0.115), V(0.055,L.jawY+0.052,0.115),
         V(0.048,L.jawY+0.078,0.122), V(-0.048,L.jawY+0.078,0.122), P.shirtDk, 0.05);
    /* receding pate: hair only on the sides/back band, bald on top */
    const hairRing=ring(V(0,L.browY+0.02,0), V(0,1,0), 0.120,0.111, n, ph);
    const hairRing2=ring(V(0,L.crownY-0.01,0), V(0,1,0), 0.100,0.092, n, ph);
    stitch([hairRing,hairRing2], ()=>P.shirtDk, {0:[1,2],1:[1,2]});
  }

  /* arms — RIGHT hoists the tankard (derived to GRIP); LEFT bent with a serving RAG draped over
     the forearm (the barkeep idiom). Sleeves shoved up to the elbow -> bare forearms. */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02), EL=V(0.31,0.86,0.10);
    tube(S,EL,0.086,0.066,6,P.shirt,{capB:{hex:P.skin}});             // sleeve rolled to elbow
    tube(EL,GRIP,0.062,0.050,6,P.skin,{capB:{hex:P.skin}});           // bare forearm up to the handle
    tube(GRIP.clone().add(V(-0.03,-0.03,-0.02)), GRIP.clone().add(V(0.03,0.03,0.02)),
         0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    /* left arm bent across the front, forearm horizontal, a folded rag hanging over it */
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02), EL2=V(-0.28,0.83,0.06), W2=V(-0.09,0.83,0.19);
    tube(S2,EL2,0.086,0.066,6,P.shirt,{capB:{hex:P.skin}});
    tube(EL2,W2,0.058,0.048,6,P.skin,{capB:{hex:P.skinDk}});          // bare forearm across the belly
    /* the rag: a cloth draped over that forearm, hanging down both sides */
    quad(V(-0.24,0.83,0.20), V(-0.06,0.83,0.21), V(-0.07,0.70,0.22), V(-0.25,0.70,0.21), P.rag, 0.04);
    quad(V(-0.24,0.83,0.18), V(-0.06,0.83,0.19), V(-0.07,0.72,0.15), V(-0.25,0.72,0.15), P.ragDk, 0.04);
  }

  /* legs — short, wide, planted (a jolly straddle); simple boots */
  {
    const hipL=V(-L.hipHalf-0.03, L.hipY-0.01, 0.01), kneeL=V(-0.18,0.37,0.03), ankL=V(-0.185,0.085,0.02);
    const hipR=V( L.hipHalf+0.03, L.hipY-0.01, 0.00), kneeR=V( 0.185,0.37,0.00), ankR=V( 0.19,0.085,-0.01);
    tube(hipL,kneeL,0.098,0.068,6,P.trouser);
    tube(kneeL,ankL,0.064,0.046,6,P.trouser);
    tube(hipR,kneeR,0.098,0.068,6,P.trouser);
    tube(kneeR,ankR,0.064,0.046,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.07,0,1)], [ankR,V(-0.06,0,1)]]){
      stack([
        {y:0.011, rx:0.064, rz:0.072, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.075, rx:0.056, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.004}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.12), 0.054,0.040,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.046, rbz:0.030});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
