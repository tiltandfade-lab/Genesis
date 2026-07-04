/* dev/model-qa/creatures/npc-watchcaptain.js — the watch-captain (armored authority NPC).
   The walk threat-ladder's MID slot is literally "Captain" (walk.js:464) and "captain" recurs 9x
   across the urban tables — the armored authority read. THE named distinctness check: a captain
   must NOT read as guard #2. The guard is a humble sentry — drab quilted gambeson, kettle-brim
   hat, spear butt-on-ground, small buckler, no drawn steel. The captain is the OPPOSITE register:
   PLATE over the shoulders (broad angular pauldrons), a PLUMED closed-face helm (crest ridge),
   a sheathed longsword worn on the hip with the gauntleted hand resting commandingly on the
   pommel (authored FIRST), a house sash/tabard across the breastplate, and a tall upright
   parade-rest stance. Steel-and-crimson, not municipal drab. Shared rig/base from parts.js. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildWatchCaptain(){
  /* ---------- PALETTE (polished steel + crimson house colours — reads senior, not drab) ---------- */
  const P = Object.assign({}, BASE_P, {
    steel:0x9aa2a8, steelDk:0x646b71, steelLt:0xb6bdc2,
    sash:0x7a2f30, sashDk:0x55201f, sashLt:0x8e3a3a,
    gold:0xa8863f, goldDk:0x74592a,
    leather:0x4a3624, leatherDk:0x332517,
    plume:0x8c2f2c, plumeDk:0x5f1f1d,
    skin:0xc09468, skinDk:0x876240,
    trouser:0x3e3830, boot:0x241c14, bootDk:0x18130d,
  });

  /* ---------- RIG — tall, chin-high, shoulders squared back (command posture) ---------- */
  const L = humanoidRig({
    hipY:0.735, waistY:0.815, ribY:0.925, chestY:1.035, shldY:1.115, neckY:1.16,
    shoulderX:0.258,
    jawY:1.19, cheekY:1.265, browY:1.34, crownY:1.43, headTopY:1.49,
  });

  /* ================= THE SHEATHED LONGSWORD — authored FIRST, worn on the LEFT hip, the
     gauntleted RIGHT hand resting on the pommel across the body (a commander's rest). The
     scabbard hangs; the hilt rises to the pommel grip. ============================================ */
  const POMMEL = V(-0.055, 0.90, 0.20);          // pommel sits centred-forward, hand rests here
  const THROAT = V(-0.235, 0.74, 0.115);         // scabbard mouth at the left hip
  const CHAPE  = V(-0.315, 0.26, 0.045);         // scabbard tip, angled back-and-down
  {
    /* scabbard: throat -> chape, leather with steel fittings */
    tube(THROAT, CHAPE, 0.036,0.024, 6, P.leather, {capB:{hex:P.steelDk}});
    tube(THROAT.clone().lerp(CHAPE,-0.04), THROAT, 0.040,0.038, 6, P.steelDk);   // steel throat locket
    /* hilt rising from the throat to the pommel: grip wrap + crossguard + pommel knob */
    const gu=new THREE.Vector3().subVectors(POMMEL,THROAT).normalize();
    const GUARD = THROAT.clone().addScaledVector(gu, 0.045);
    tube(GUARD, POMMEL.clone().addScaledVector(gu,-0.03), 0.024,0.022,6,P.leatherDk);  // grip
    const side=new THREE.Vector3().crossVectors(gu,V(0,0,1)).normalize();
    quad(GUARD.clone().addScaledVector(side,0.07), GUARD.clone().addScaledVector(side,-0.07),
         GUARD.clone().addScaledVector(side,-0.07).addScaledVector(gu,0.024), GUARD.clone().addScaledVector(side,0.07).addScaledVector(gu,0.024),
         P.steel, 0.03);                                                                // crossguard
    capFan(ring(POMMEL, gu, 0.028,0.028, 7, 0), POMMEL.clone().addScaledVector(gu,0.03), P.gold);  // pommel knob
  }

  /* torso — a fitted BREASTPLATE (plate loft, brighter steel, gold trim collar) */
  stack([
    {y:L.hipY,   rx:0.198, rz:0.150, hex:P.steelDk},
    {y:L.waistY, rx:0.178, rz:0.135, hex:P.steel},
    {y:L.ribY,   rx:0.205, rz:0.152, hex:P.steel},
    {y:L.chestY, rx:0.234, rz:0.168, hex:P.steelLt},   // fauld-to-cuirass swell (chest catch-light)
    {y:L.shldY,  rx:0.240, rz:0.166, hex:P.steel},
    {y:L.neckY,  rx:0.090, rz:0.084, hex:P.gold},      // gorget/collar ring, gold
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* a diagonal house SASH/tabard across the breastplate (crimson, gold-edged) */
  {
    quad(V(-0.22,L.shldY+0.01,0.15), V(-0.14,L.shldY+0.03,0.175),
         V(0.20,L.hipY+0.02,0.16), V(0.12,L.hipY,0.14), P.sash, 0.03);
    quad(V(-0.235,L.shldY,0.148), V(-0.20,L.shldY+0.01,0.15),
         V(0.115,L.hipY-0.005,0.138), V(0.10,L.hipY-0.01,0.135), P.gold, 0.02);   // gold edge stripe
  }

  /* plate SKIRT (fauld) — overlapping lames over the hips (short, angular) */
  stack([
    {y:0.50, rx:0.215, rz:0.172, hex:P.steelDk},
    {y:0.60, rx:0.205, rz:0.160, hex:P.steel},
    {y:L.hipY-0.01, rx:0.192, rz:0.148, hex:P.steelDk},
  ], 8, {});

  /* BROAD ANGULAR PAULDRONS — the silhouette that separates captain from guard. Two big
     over-shoulder plate caps that jut wider than the arms, each a stack cap. */
  for(const s of [-1,1]){
    const px=s*0.28;
    stack([
      {y:L.shldY-0.02, rx:0.115, rz:0.115, cx:px, cz:0.02, hex:P.steel},
      {y:L.shldY+0.075, rx:0.135, rz:0.128, cx:px+s*0.01, cz:0.02, hex:P.steelLt},
      {y:L.shldY+0.12, rx:0.085, rz:0.082, cx:px+s*0.015, cz:0.02, hex:P.steelDk},
    ], 7, {capTop:{hex:P.steelDk, lift:0.02}});
    /* a jutting angular ridge fin on the outer edge (aggressive pauldron read) */
    quad(V(px+s*0.11,L.shldY+0.04,0.06), V(px+s*0.17,L.shldY+0.02,0.0),
         V(px+s*0.15,L.shldY+0.10,0.0), V(px+s*0.10,L.shldY+0.11,0.05), P.steelDk, 0.03);
  }

  /* head (skin loft; nose ridge; painted eyes) — the eyes still read in the visor gap */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.080, rz:0.086, hex:P.skin},
      {y:L.cheekY, rx:0.110, rz:0.106, hex:P.skin},
      {y:L.browY,  rx:0.114, rz:0.105, hex:P.skin},
      {y:L.crownY, rx:0.089, rz:0.081, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.021;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    capFan(rings[3], V(0, L.headTopY, 0.007), P.skinDk);
    for(const s of [-1,1]){ const ex=s*0.052, ey=(L.cheekY+L.browY)/2-0.004, ez=0.124;
      quad(V(ex-0.013,ey-0.010,ez), V(ex+0.013,ey-0.010,ez),
           V(ex+0.013,ey+0.011,ez-0.006), V(ex-0.013,ey+0.011,ez-0.006), P.eye, 0.0); }
  }

  /* PLUMED CLOSED HELM — a full steel dome/cheek shell with a raised visor gap (eyes read through),
     a nose-guard bar, and a tall crimson CREST PLUME running fore-aft over the crown. Distinct
     from the guard's flat kettle-brim: this is a rounded knight's sallet with a crest. */
  {
    const n=10, ph=Math.PI/n;
    /* helm shell: brow band -> crown -> apex, open across the front eye-slot cols */
    const faceCols=[0,1,2];
    const bands=[
      {y:L.jawY+0.02,  rx:0.118, rz:0.118, hex:P.steelDk},   // cheek guards down to the jaw
      {y:L.browY-0.01, rx:0.128, rz:0.120, hex:P.steel},
      {y:L.crownY+0.01,rx:0.108, rz:0.100, hex:P.steelLt},
      {y:L.headTopY+0.015, rx:0.052, rz:0.048, hex:P.steelDk},
    ];
    const skip={1:faceCols};   // eye-slot open at brow height only
    const rings=bands.map(b=>ring(V(0,b.y,0.004), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings.at(-1), V(0,L.headTopY+0.05,0.0), P.steelDk);
    /* nose-guard bar down the centre of the face gap */
    quad(V(-0.016,L.browY+0.04,0.128), V(0.016,L.browY+0.04,0.128),
         V(0.016,L.cheekY-0.01,0.132), V(-0.016,L.cheekY-0.01,0.132), P.steelDk, 0.02);
    /* CREST PLUME — a tall thin crimson blade running fore-aft over the crown ridge */
    const plumeBands=[
      {z:-0.11, h:0.10}, {z:-0.04, h:0.20}, {z:0.05, h:0.22}, {z:0.13, h:0.13},
    ];
    for(let i=0;i<plumeBands.length-1;i++){
      const a=plumeBands[i], b=plumeBands[i+1], yb=L.headTopY-0.02;   // base tucked into the crown ridge (no float gap)
      quad(V(0,yb,a.z), V(0,yb+a.h,a.z), V(0,yb+b.h,b.z), V(0,yb,b.z), i<2?P.plume:P.plumeDk, 0.05);
      quad(V(0.006,yb,a.z), V(0.006,yb+a.h,a.z), V(0.006,yb+b.h,b.z), V(0.006,yb,b.z), P.plumeDk, 0.05);
    }
  }

  /* arms — RIGHT gauntlet rests on the pommel (derived to POMMEL); LEFT hangs at parade rest,
     gauntleted fist at the side. Both plate-sleeved with an articulated look via band steps. */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02), EL=V(0.235,0.93,0.155);
    tube(S,EL,0.086,0.064,6,P.steel);                                    // upper arm plate
    /* vambrace drops right ONTO the pommel (wrist ends at the grip just above the pommel knob), so
       the hand plainly makes contact — no air gap between wrist and hilt. */
    const WRIST = POMMEL.clone().add(V(0.0,0.055,-0.01));
    tube(EL, WRIST, 0.062,0.050,6,P.steelDk,{capB:{hex:P.steelDk}});     // vambrace to the grip
    /* the gauntlet fist: a closed cuff wrapping the grip AT the pommel — spans across the hilt so it
       reads as a hand curled over it, not floating beside it. */
    tube(POMMEL.clone().add(V(-0.055,0.03,-0.03)), POMMEL.clone().add(V(0.055,0.03,0.03)),
         0.050,0.046,6,P.steelDk,{capA:{hex:P.steel},capB:{hex:P.steel}}); // knuckles across the grip
    tube(POMMEL.clone().add(V(0.0,0.075,0.0)), POMMEL.clone().add(V(0.0,0.005,0.0)),
         0.044,0.042,6,P.steel,{capB:{hex:P.steelDk}});                  // thumb/heel wrapping down onto the pommel knob

    const S2=V(-L.shoulderX, L.shldY-0.02, 0.02), EL2=V(-0.30,0.85,0.03), W2=V(-0.29,0.60,0.05);
    tube(S2,EL2,0.086,0.064,6,P.steel);
    tube(EL2,W2,0.062,0.050,6,P.steelDk);
    tube(W2, W2.clone().add(V(0.0,-0.07,0.01)), 0.048,0.042,6,P.steelDk,{capB:{hex:P.steel}});  // gauntlet fist
  }

  /* legs — armored greaves, tall upright parade-rest (feet planted, slight heel-out) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.145,0.40,0.03), ankL=V(-0.155,0.095,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.150,0.40,0.00), ankR=V( 0.160,0.095,-0.01);
    tube(hipL,kneeL,0.090,0.062,6,P.steelDk);
    tube(kneeL,ankL,0.060,0.044,6,P.steel);           // greave catch-light
    tube(hipR,kneeR,0.090,0.062,6,P.steelDk);
    tube(kneeR,ankR,0.060,0.044,6,P.steel);
    /* sabaton boots (steel-toed) */
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(-0.05,0,1)]]){
      stack([
        {y:0.012, rx:0.064, rz:0.072, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.10,  rx:0.058, rz:0.060, cx:ank.x, cz:ank.z, hex:P.steelDk},
      ], 6, {capTop:{hex:P.steelDk, lift:0.004}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.14), 0.054,0.040,6,P.steelDk, {capB:{hex:P.steel, lift:0.014}, raz:0.046, rbz:0.030});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
