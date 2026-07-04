/* dev/model-qa/creatures/npc-caravaneer.js — the merchant / caravaneer (whole-object NPC).
   npc-role rows 56-59 (Trader or Peddler) + 77-78 (Caravan Escort) + strong "merchant" signal
   across the urban tables. THE distinctness check: the caravaneer must NOT read as the shopkeep.
   The shopkeep is STATIC — a lean trader planted behind a stall. The caravaneer is MOBILE and
   LADEN: a big backpack/bindle hump on the back (authored FIRST), a walking STAFF planted forward
   mid-stride, a wide travel HAT, a heavy road-cloak, coin-pouches at a broad belt, dusty road
   boots. He is going somewhere. Travel-worn ochres and road-dust browns. Shared rig/base. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildCaravaneer(){
  /* ---------- PALETTE (travel-worn ochre/road-dust + a modest merchant's touch of colour) ---------- */
  const P = Object.assign({}, BASE_P, {
    coat:0x8a6a3c, coatDk:0x5f4826, coatLt:0x9c7a48,        // ochre traveling coat
    cloak:0x6a5236, cloakDk:0x483523, cloakLt:0x7d633f,
    pack:0x6f5636, packDk:0x4a3922, packLt:0x836a45,
    skin:0xc09468, skinDk:0x876240,
    staff:0x5f4a30, staffDk:0x3f311e,
    pouch:0x4e3a24, pouchDk:0x342512, brass:0xa8863f,
    hat:0x7a6038, hatDk:0x52401f, boot:0x40301d, bootDk:0x2a1f11,
  });

  /* ---------- RIG — upright but MID-STRIDE (one leg forward), a traveler on the move ---------- */
  const L = humanoidRig({
    hipY:0.72, waistY:0.80, ribY:0.905, chestY:1.005, shldY:1.09, neckY:1.13,
    shoulderX:0.252,
    jawY:1.16, cheekY:1.235, browY:1.31, crownY:1.40, headTopY:1.46,
  });

  /* ================= THE PACK / BINDLE — authored FIRST, a big bundled load humped high on the
     BACK (over both shoulders, sitting behind the neck), lashed with straps. Establishes "laden
     traveler" before anything else. =============================================================== */
  {
    const PC=V(0.0, 1.06, -0.19);   // pack centre, high on the back
    const bands=[
      {y:PC.y-0.24, rx:0.150, rz:0.120, hex:P.packDk},
      {y:PC.y-0.10, rx:0.185, rz:0.150, hex:P.pack},
      {y:PC.y+0.05, rx:0.190, rz:0.155, hex:P.pack},
      {y:PC.y+0.16, rx:0.150, rz:0.122, hex:P.packLt},
      {y:PC.y+0.24, rx:0.075, rz:0.062, hex:P.packDk},     // a rolled bedroll gathered at the top
    ];
    const rings=bands.map(b=>ring(V(PC.x,b.y,PC.z), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(PC.x,PC.y+0.30,PC.z), P.packDk);
    /* lashing straps crossing the pack front + over-shoulder straps to the chest */
    for(const sy of [PC.y-0.05, PC.y+0.10]){
      const r1=ring(V(PC.x,sy,PC.z), V(0,1,0), 0.192,0.157, 8, Math.PI/8);
      const r2=ring(V(PC.x,sy+0.03,PC.z), V(0,1,0), 0.190,0.155, 8, Math.PI/8);
      stitch([r1,r2], ()=>P.staffDk, {0:[0,1,2],1:[0,1,2]}); }   // straps on the back arc
    for(const s of [-1,1]) tube(V(s*0.15,L.shldY+0.04,-0.10), V(s*0.13,0.86,0.14), 0.026,0.024,4,P.staffDk);  // shoulder straps to front
  }

  /* ================= THE WALKING STAFF — planted FORWARD, right hand near the top (mid-stride). == */
  const STAFF_BUTT=V(0.30,0.02,0.24), STAFF_TOP=V(0.29,1.34,0.16);
  const SDIR=new THREE.Vector3().subVectors(STAFF_TOP,STAFF_BUTT).normalize();
  const STAFF_GRIP=STAFF_BUTT.clone().addScaledVector(SDIR, 0.86);   // hand high on the staff
  {
    tube(STAFF_BUTT, STAFF_TOP, 0.020,0.017, 6, P.staff, {capA:{hex:P.staffDk}, capB:{hex:P.staffDk}});
    /* a wrapped grip band + a knobby head */
    const gb=STAFF_GRIP.clone().addScaledVector(SDIR,-0.03), gt=STAFF_GRIP.clone().addScaledVector(SDIR,0.06);
    tube(gb, gt, 0.024,0.024, 6, P.pouchDk);
    capFan(ring(STAFF_TOP, SDIR, 0.028,0.028, 7, 0), STAFF_TOP.clone().addScaledVector(SDIR,0.03), P.staffDk);
  }

  /* torso — ochre traveling coat, buttoned, over the shoulders */
  stack([
    {y:L.hipY,   rx:0.195, rz:0.150, hex:P.coatDk},
    {y:L.waistY, rx:0.176, rz:0.135, hex:P.coat},
    {y:L.ribY,   rx:0.196, rz:0.146, hex:P.coat},
    {y:L.chestY, rx:0.212, rz:0.156, hex:P.coatLt},
    {y:L.shldY,  rx:0.216, rz:0.152, hex:P.coat},
    {y:L.neckY,  rx:0.086, rz:0.080, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* a heavy travel-cloak hanging off the shoulders down the back + sides (weather layer) */
  {
    const bands=[
      {y:0.34, rx:0.230, rz:0.180, hex:P.cloakDk},
      {y:0.60, rx:0.222, rz:0.172, hex:P.cloak},
      {y:L.shldY-0.01, rx:0.222, rz:0.165, hex:P.cloakLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, 9, Math.PI/9));
    stitch(rings, b=>bands[b].hex, {0:[3,4,5],1:[3,4,5],2:[3,4,5]});   // open at the front
  }

  /* coat skirt to the knee */
  stack([
    {y:0.46, rx:0.205, rz:0.162, hex:P.coatDk},
    {y:0.60, rx:0.190, rz:0.148, hex:P.coat},
    {y:L.hipY-0.01, rx:0.178, rz:0.138, hex:P.coat},
  ], 8, {});

  /* broad belt with COIN-POUCHES (the merchant tell — money on the person, not a stall) + brass buckle */
  { const b1=ring(V(0,0.755,0), V(0,1,0), 0.182,0.142, 8, Math.PI/8);
    const b2=ring(V(0,0.795,0), V(0,1,0), 0.179,0.139, 8, Math.PI/8);
    stitch([b1,b2], ()=>P.pouch);
    quad(V(-0.028,0.762,0.146), V(0.028,0.762,0.146), V(0.028,0.79,0.143), V(-0.028,0.79,0.143), P.brass, 0.02);   // buckle
    /* two little coin-pouches hanging at the left hip */
    for(const px of [-0.13,-0.075]){
      const pc=V(px,0.66,0.13);
      const pb=[{y:pc.y-0.055,rx:0.010,rz:0.010,hex:P.pouchDk},{y:pc.y-0.02,rx:0.038,rz:0.032,hex:P.pouch},{y:pc.y+0.01,rx:0.030,rz:0.026,hex:P.pouchDk}];
      const pr=pb.map(b=>ring(V(pc.x,b.y,pc.z),V(0,1,0),b.rx,b.rz,7,0)); stitch(pr,b=>pb[b].hex);
      capFan(pr.at(-1), V(pc.x,pc.y+0.02,pc.z), P.pouchDk); } }

  /* head (skin loft; nose ridge; painted eyes) — weathered, road-tanned */
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
    /* a full trimmed beard (the traveling-trader look) */
    quad(V(-0.078,L.jawY-0.02,0.060), V(0.078,L.jawY-0.02,0.060),
         V(0.062,L.jawY+0.070,0.112), V(-0.062,L.jawY+0.070,0.112), P.skinDk, 0.05);

    /* WIDE TRAVEL HAT — a soft round brim (a hair smaller than the hunter's, rounder crown) */
    const brimOuter=ring(V(0,L.browY+0.035,0), V(0,1,0), 0.175,0.168, n, ph);
    const brimInner=ring(V(0,L.browY+0.035,0), V(0,1,0), 0.112,0.106, n, ph);
    stitch([brimInner,brimOuter], ()=>P.hat);
    stitch([brimOuter,brimInner], ()=>P.hatDk);
    const crownBands=[
      {y:L.browY+0.03, rx:0.110, rz:0.102, hex:P.hatDk},
      {y:L.crownY+0.02, rx:0.104, rz:0.096, hex:P.hat},
      {y:L.headTopY+0.02, rx:0.072, rz:0.066, hex:P.hatDk},
    ];
    const crownRings=crownBands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(crownRings, b=>crownBands[b].hex);
    capFan(crownRings.at(-1), V(0,L.headTopY+0.05,0), P.hat);
  }

  /* arms — RIGHT high on the walking staff (derived to STAFF_GRIP); LEFT swings back (mid-stride) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02), EL=V(0.30,0.98,0.12);
    tube(S,EL,0.078,0.058,6,P.coat);
    tube(EL,STAFF_GRIP,0.058,0.046,6,P.coat,{capB:{hex:P.skin}});
    tube(STAFF_GRIP.clone().add(V(-0.035,0.04,-0.02)), STAFF_GRIP.clone().add(V(0.035,-0.04,0.02)),
         0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015), EL2=V(-0.30,0.85,-0.02), W2=V(-0.27,0.66,-0.09);
    tube(S2,EL2,0.078,0.058,6,P.coat);                               // swung back
    tube(EL2,W2,0.056,0.046,6,P.coat,{capB:{hex:P.skin}});
    tube(W2, W2.clone().add(V(0.0,-0.06,-0.02)), 0.044,0.040,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* legs — MID-STRIDE: right leg forward and planted, left leg trailing back (walking) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, -0.02), kneeL=V(-0.155,0.40,-0.10), ankL=V(-0.165,0.09,-0.17);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.03), kneeR=V( 0.15,0.41,0.14), ankR=V( 0.155,0.09,0.20);
    tube(hipL,kneeL,0.086,0.060,6,P.coatDk);
    tube(kneeL,ankL,0.058,0.042,6,P.bootDk);
    tube(hipR,kneeR,0.086,0.060,6,P.coatDk);
    tube(kneeR,ankR,0.058,0.042,6,P.bootDk);
    /* dusty road boots (right toe pushed forward on the plant) */
    for(const [ank,toeDir] of [[ankL,V(0.03,0,1)], [ankR,V(-0.03,0,1)]]){
      stack([
        {y:0.012, rx:0.062, rz:0.072, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.11,  rx:0.054, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.004}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.13), 0.052,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.044, rbz:0.030});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
