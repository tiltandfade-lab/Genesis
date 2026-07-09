/* dev/model-qa/creatures/npc-commoner.js — the generic town commoner (whole-object NPC).
   REBUILD 2026-07-08 (MODEL-FOUNDRY pass 1). Same whole-object grammar as humanoid.js: one
   function, one geometry frame, no anchors. Preserves the palette intent (undyed cloth, the
   least saturated cast member) and the named signature (a carried bundle) from the prior pass,
   but replaces the static "hang a sack in one hand" geometry with a caught-mid-life beat — this
   is the DEFAULT body for every unmapped townsfolk, the single most-seen figure in the game, so
   it earns the same pose-care as a hero.

   FEATURE CHECKLIST (the budget buys):
     1. a woven BASKET carried against the left hip (the named signature — was a hanging sack,
        now rides the hip like a real errand, handle gripped low-and-in not dangling at arm's length)
     2. a cream BIB APRON over the tunic — the high-value zone, brighter than every other cloth
        on the body, sitting right on top of the basket-carrying side for the value/signature pairing
     3. a raised HAILING arm (right) — shoulder up, elbow bent, open hand near head height, breaking
        the silhouette upward; this is the "mid-gesture" read, not a hero pose, just a wave/call
     4. MID-STRIDE legs — left leg forward and knee-lifted (contralateral to the raised right arm,
        real walk-cycle coordination), right leg trailing back on the ball of the foot
     5. a simple rolled cloth cap + working-stoop-free upright posture (alive, not slumped — the
        stride carries the "working" read instead of a hunch)
     6. plain rope belt + drab trousers/shoes kept LOW value so the apron+basket read as the eye-path

   POSE SENTENCE: a townsfolk mid-errand, basket riding the left hip, right arm thrown up to hail
   someone across the street, weight rolling forward onto a lifted left knee. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildCommoner(){
  /* ---------- PALETTE (undyed, humble — apron is the ONE bright note) ---------- */
  const P = Object.assign({}, BASE_P, {
    tunic:0x8c8064, tunicDk:0x6b6249,
    apron:0xe3d6aa, apronDk:0xb9a878,          // the high-value zone — bright cream, not linen-drab
    rope:0x9c8a5c, ropeDk:0x6e5f3c,
    skin:0xc49a72, skinDk:0x8a6a4e,
    trouser:0x746a52, trouserDk:0x564d3a, shoe:0x4d4232, shoeDk:0x362e22,
    basket:0xa8813e, basketDk:0x7a5c2b,        // warm woven wood, mid-value (apron carries the light)
    cap:0xc9bfa0, capDk:0x93876a,
  });

  /* ---------- RIG — same landmarks as humanoid.js, upright (stride carries the "alive" read) ---------- */
  const L = humanoidRig({
    hipY:0.70, waistY:0.775, ribY:0.875, chestY:0.975, shldY:1.055, neckY:1.095,
    jawY:1.125, cheekY:1.20, browY:1.275, crownY:1.365, headTopY:1.425,
  });

  /* slight forward-into-the-stride lean + a small counter-twist so the torso reads as walking,
     not standing at attention — much lighter than the old working-stoop */
  const HIP_PIVOT_Y = L.hipY;
  const lean = (p) => { const t = Math.max(0, p.y - HIP_PIVOT_Y); return V(p.x - t*0.03, p.y, p.z + t*0.12); };

  /* BASKET FIRST — the grip is ground truth for the left arm. Rides against the left hip, not
     dangling at arm's length: grip sits IN, close to the body. */
  const GRIPL = V(-0.30, 0.635, 0.135);
  {
    /* wide shallow woven basket, banded two-tone for a cheap woven-texture read */
    const bx=GRIPL.x+0.015, bz=GRIPL.z+0.045;
    const bands=[
      {y:GRIPL.y-0.145, rx:0.030, rz:0.028, hex:P.basketDk},
      {y:GRIPL.y-0.09,  rx:0.115, rz:0.100, hex:P.basket},
      {y:GRIPL.y-0.02,  rx:0.135, rz:0.118, hex:P.basketDk},
      {y:GRIPL.y+0.05,  rx:0.128, rz:0.112, hex:P.basket},
    ];
    const rings=bands.map(b=>ring(V(bx,b.y,bz), V(0,1,0), b.rx, b.rz, 8, 0));
    stitch(rings, b=>bands[b].hex);
    /* a bundled cloth bulging up out of the basket mouth — reads as "carrying goods" */
    const bundle=[
      {y:GRIPL.y+0.055, rx:0.075, rz:0.065, hex:P.apronDk},
      {y:GRIPL.y+0.12,  rx:0.058, rz:0.050, hex:P.apron},
      {y:GRIPL.y+0.155, rx:0.028, rz:0.024, hex:P.apronDk},
    ];
    const bRings=bundle.map(b=>ring(V(bx,b.y,bz), V(0,1,0), b.rx, b.rz, 6, 0));
    stitch(bRings, b=>bundle[b].hex);
    capFan(bRings.at(-1), V(bx,GRIPL.y+0.175,bz), P.apronDk);
    /* the handle arc, gripped at GRIPL */
    tube(V(bx-0.10,GRIPL.y-0.01,bz-0.02), GRIPL, 0.014,0.016,5,P.basketDk);
    tube(GRIPL, V(bx+0.10,GRIPL.y-0.01,bz+0.02), 0.016,0.014,5,P.basketDk);
  }

  /* trunk — plain tunic loft, hips -> neck */
  stack([
    {y:L.hipY,   rx:0.185, rz:0.140, hex:P.tunicDk},
    {y:L.waistY, rx:0.155, rz:0.118, hex:P.tunic},
    {y:L.ribY,   rx:0.180, rz:0.135, hex:P.tunic},
    {y:L.chestY, rx:0.200, rz:0.148, hex:P.tunic},
    {y:L.shldY,  rx:0.198, rz:0.138, hex:P.tunic},
    {y:L.neckY,  rx:0.080, rz:0.075, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:lean});

  /* knee-length tunic skirt (plain, undyed) */
  stack([
    {y:0.44, rx:0.225, rz:0.180, hex:P.tunicDk},
    {y:0.56, rx:0.205, rz:0.162, hex:P.tunic},
    {y:L.hipY-0.01, rx:0.188, rz:0.145, hex:P.tunic},
  ], 8, {});

  /* BIB APRON — the value-contrast payload. A front-only panel (two edge columns + rows) laid
     OVER the tunic front, from hem to chest, plus a cross strap over the left shoulder (the
     basket side) so it visually "belongs" to the carrying arm. Bright cream, deliberately the
     lightest cloth on the body. ROWS MUST ASCEND (low y -> high y), matching the stack()/stitch()
     band convention everywhere else in this file — a descending row list silently flips the quad
     winding (the face normal ends up pointing -z, back-face-culled from this camera and INVISIBLE
     no matter how far it's pushed forward — the bug that cost pass-1 its first two renders). */
  {
    const halfW=0.145, apronZ=0.205;   // clear of the tunic front (~0.03-0.05u) once winding is right
    const rows=[
      {y:0.44,            hw:halfW*0.62},
      {y:0.56,            hw:halfW*0.82},
      {y:L.waistY-0.02,  hw:halfW*0.95},
      {y:L.ribY,         hw:halfW},
      {y:L.chestY+0.01, hw:halfW*0.62},
    ];
    const cols=rows.map(r=>({
      L:lean(V(-r.hw, r.y, apronZ)),
      R:lean(V( r.hw, r.y, apronZ)),
    }));
    for(let i=0;i<cols.length-1;i++){
      quad(cols[i].L, cols[i].R, cols[i+1].R, cols[i+1].L, P.apron, 0.05);
    }
    /* dark stitched hem edge at the bottom row */
    const hemY=rows[0].y-0.015;
    quad(lean(V(rows[0].hw,hemY,apronZ)), lean(V(-rows[0].hw,hemY,apronZ)),
         cols[0].L, cols[0].R, P.apronDk, 0.02);
    /* the shoulder strap, over the basket-carrying (left) shoulder */
    const strapTop=lean(V(-0.06, L.shldY+0.015, 0.02));
    const strapChest=cols.at(-1).L;
    tube(strapTop, strapChest, 0.020, 0.022, 4, P.apron, {capA:{hex:P.apronDk}});
  }

  /* rope belt over the apron (simple cord, no buckle) */
  {
    const b1=ring(V(0,0.735,0), V(0,1,0), 0.170, 0.130, 8, Math.PI/8);
    const b2=ring(V(0,0.755,0), V(0,1,0), 0.167, 0.127, 8, Math.PI/8);
    stitch([b1,b2], ()=>P.ropeDk);
    tube(V(0.01,0.735,0.130), V(0.03,0.60,0.138), 0.010,0.008,5,P.rope,{capB:{hex:P.ropeDk}});
  }

  /* head (skin loft; nose ridge) — authored inline so the same lean applies. Small turn toward
     the hailing side (right) so the pose reads as calling out, not staring blankly ahead. */
  const headTurn = (p) => { const t=Math.max(0,p.y-L.jawY+0.03); return V(p.x + t*0.10, p.y, p.z); };
  const headXf = (p)=>headTurn(lean(p));
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.080, rz:0.086, hex:P.skin},
      {y:L.cheekY, rx:0.110, rz:0.106, hex:P.skin},
      {y:L.browY,  rx:0.114, rz:0.105, hex:P.skin},
      {y:L.crownY, rx:0.089, rz:0.081, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph).map(headXf));
    for(const i of [1,2]) rings[1][i].z += 0.021;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){
      const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
    }
    capFan(rings[3], headXf(V(0, L.headTopY, 0.007)), P.skinDk);
    /* rolled cloth cap, full scalp coverage */
    const capBands=[
      {y:L.browY-0.01, rx:0.120, rz:0.114, hex:P.capDk},
      {y:L.browY+0.05, rx:0.122, rz:0.116, hex:P.cap},
      {y:L.crownY+0.01,rx:0.098, rz:0.090, hex:P.cap},
      {y:L.headTopY+0.012, rx:0.040, rz:0.036, hex:P.capDk},
    ];
    const capRings=capBands.map(b=>ring(V(0,b.y,0.004), V(0,1,0), b.rx, b.rz, n, ph).map(headXf));
    stitch(capRings, b=>capBands[b].hex);
    capFan(capRings.at(-1), headXf(V(0, L.headTopY+0.05, 0.0)), P.capDk);
  }

  /* arms — RIGHT thrown up in a hailing wave (breaks the silhouette upward, the "mid-gesture"
     signal); LEFT bent in tight to grip the basket handle against the hip. */
  {
    /* raised hailing arm: shoulder -> elbow out+up -> forearm up -> open hand near head height */
    const S=V(L.shoulderX*0.98, L.shldY+0.01, 0.00);
    const E=V(0.315, L.shldY+0.155, 0.02);
    const Wr=V(0.235, L.headTopY-0.02, -0.01);
    tube(S,E,0.068,0.056,6,P.tunic);
    tube(E,Wr,0.054,0.044,6,P.skin,{capB:{hex:P.skin}});
    /* open hand: a small flat splay of three short nubs off the wrist, cheap "fingers spread" tell */
    const palm=Wr.clone().add(V(0.0,0.04,-0.005));
    tube(Wr,palm,0.044,0.040,5,P.skin);
    for(const dx of [-0.028,0,0.028]){
      tube(palm, palm.clone().add(V(dx,0.045,0.0)), 0.012,0.008,4,P.skinDk);
    }

    /* left arm — tight bend, forearm angled down-in to the basket grip */
    const S2=V(-L.shoulderX*0.94, L.shldY-0.01, 0.01);
    const E2=V(-0.315, 0.80, 0.075);
    tube(S2,E2,0.068,0.055,6,P.tunic);
    tube(E2,GRIPL,0.052,0.040,6,P.tunic,{capB:{hex:P.skin}});
    /* fist wraps the basket handle */
    tube(GRIPL.clone().add(V(-0.040,0.012,-0.025)), GRIPL.clone().add(V(0.040,0.012,0.025)), 0.038,0.036,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* legs — MID-STRIDE: left forward + knee-lifted (contralateral to the raised right arm), right
     trailing back on the ball of the foot (weight rolling off the toe, not flat). */
  {
    const hipL=V(-L.hipHalf*0.95, L.hipY-0.01, 0.01), kneeL=V(-0.145,0.415,0.145), ankL=V(-0.135,0.085,0.205);
    const hipR=V( L.hipHalf*0.95, L.hipY-0.01, 0.00), kneeR=V( 0.095,0.335,-0.155), ankR=V( 0.150,0.050,-0.230);
    tube(hipL,kneeL,0.078,0.058,6,P.trouserDk);
    tube(kneeL,ankL,0.054,0.040,6,P.trouser);
    tube(hipR,kneeR,0.078,0.056,6,P.trouserDk);
    tube(kneeR,ankR,0.052,0.038,6,P.trouser);
    /* shoes: left flat-planted (forward foot lands), right rolled up on the ball (trailing push-off) */
    {
      const ank=ankL, toeDir=V(0,0,1);
      stack([
        {y:0.010, rx:0.058, rz:0.066, cx:ank.x, cz:ank.z, hex:P.shoeDk},
        {y:0.055, rx:0.052, rz:0.056, cx:ank.x, cz:ank.z, hex:P.shoe},
      ], 6, {capTop:{hex:P.shoe, lift:0.004}});
      const toeA=V(ank.x,0.045,ank.z);
      tube(toeA, toeA.clone().addScaledVector(toeDir,0.115), 0.048,0.036,6,P.shoe, {capB:{hex:P.shoe, lift:0.012}, raz:0.040, rbz:0.028});
    }
    {
      /* trailing foot: heel lifted, whole shoe tipped forward onto the toe (ankle raised off y=0) */
      const ank=ankR;
      stack([
        {y:0.045, rx:0.056, rz:0.062, cx:ank.x, cz:ank.z, hex:P.shoeDk},
        {y:0.075, rx:0.050, rz:0.052, cx:ank.x, cz:ank.z, hex:P.shoe},
      ], 6, {capTop:{hex:P.shoe, lift:0.004}});
      const toeA=V(ank.x,0.034,ank.z-0.01);
      tube(toeA, toeA.clone().addScaledVector(V(0,0,-1),0.10), 0.040,0.030,6,P.shoe, {capB:{hex:P.shoe, lift:0.010}, raz:0.026, rbz:0.018});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
