/* dev/model-qa/creatures/race-tiefling.js — the tiefling PC-race landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js/mage.js: the ENTIRE creature is one function of shared
   primitives, every vertex in one model frame, no anchors. Dressed as a PLAIN ADVENTURER (fitted
   dark clothing, no class weapon — a small sheathed belt knife at most). The human-frame head loft
   is the base (per humanoid.js), plus tiefling markers: curved horns off the temples (chained
   tube() segments sweeping up then hooking forward), a sharp goatee wedge (a short mage.js-style
   tapering ring stack, forward-offset via cz), and a thin tail (narrow chained tube() segments)
   ending in a spade-tip that hangs clear of the ground behind the calf. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTiefling(){
  /* ---------- PALETTE (VS desaturated; dusky red-mauve skin, dark fitted adventurer clothing) ---------- */
  const P = {
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    tunic:0x3c3440, tunicDk:0x2b2530, tunicLt:0x4a4050,     // deep plum/charcoal fitted vest+tunic
    trouser:0x332e36, trouserDk:0x252129,
    leather:0x3f3128, leatherDk:0x2c2119,
    boot:0x2a221c, bootDk:0x1d1712,
    hair:0x2a2320, eye:0x1a1512,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a,
    steel:0x8d9298, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — human-frame body bands, slightly slimmer/shorter than humanoid.js
     (elegant ~1.45u figure vs. the stocky ~1.48u fighter) ---------- */
  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.215,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* trunk (one loft, hips -> neck) — slimmer rx/rz than the stocky fighter */
  stack([
    {y:L.hipY,   rx:0.172, rz:0.128, hex:P.tunicDk},
    {y:L.waistY, rx:0.142, rz:0.108, hex:P.tunic},
    {y:L.ribY,   rx:0.166, rz:0.124, hex:P.tunic},
    {y:L.chestY, rx:0.190, rz:0.136, hex:P.tunicLt},
    {y:L.shldY,  rx:0.194, rz:0.128, hex:P.tunic},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* tunic skirt hem (short, fitted) */
  stack([
    {y:0.485, rx:0.205, rz:0.165, hex:P.tunicDk},
    {y:0.58,  rx:0.192, rz:0.150, hex:P.tunic},
    {y:L.hipY,rx:0.176, rz:0.132, hex:P.tunic},
  ], 8, {});

  /* belt + small buckle */
  stack([
    {y:0.735, rx:0.150, rz:0.114, hex:P.leather},
    {y:0.775, rx:0.148, rz:0.112, hex:P.leather},
  ], 8, {});
  quad(V(-0.026,0.740,0.122), V(0.026,0.740,0.122), V(0.026,0.772,0.118), V(-0.026,0.772,0.118), P.brass, 0.02);

  /* small sheathed belt knife — hangs at the hip, not held/hero-posed */
  {
    const sheathTop = V(0.135, 0.755, 0.075), sheathBot = V(0.155, 0.615, 0.095);
    tube(sheathTop, sheathBot, 0.026, 0.016, 6, P.leatherDk, {capB:{hex:P.leatherDk}});
    // small brass pommel nub peeking from the sheath mouth
    quad(V(0.115,0.760,0.062), V(0.155,0.760,0.062), V(0.155,0.778,0.058), V(0.115,0.778,0.058), P.brass, 0.02);
  }

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts of this ring are 1 & 2 — same
     human-frame convention as humanoid.js/mage.js. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.076, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.104, rz:0.100, hex:P.skin},
      {y:L.browY,  rx:0.108, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.084, rz:0.076, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.020;           /* nose ridge on the front verts */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);

    /* eyes — two SMALL intentional quads flanking the nose, proud of the face surface
       (house eye standard). Plain dark quads — no glowing-eye gimmick, per spec. */
    for(const s of [-1,1]){
      const ex=s*0.050, ey=(L.cheekY+L.browY)/2-0.004, ez=0.116;
      quad(V(ex-0.013,ey-0.009,ez), V(ex+0.013,ey-0.009,ez),
           V(ex+0.013,ey+0.011,ez-0.006), V(ex-0.013,ey+0.011,ez-0.006), P.eye, 0.0);
    }

    /* short dark hair cap (small, human-shaped — nothing elaborate) */
    stack([
      {y:L.crownY-0.01, rx:0.086, rz:0.078, cz:-0.006, hex:P.hair},
      {y:L.crownY+0.03, rx:0.070, rz:0.062, cz:-0.010, hex:P.hair},
    ], 8, {capTop:{hex:P.hair, lift:0.012}});
  }

  /* GOATEE — a small sharp wedge at the chin, forward-offset (+z via cz) clear of the jaw's own
     surface so it reads as a distinct dark wedge, not lost in the skin shading. Still MUCH
     shorter/smaller than mage.js's long wizard beard: 4 tight tapering rings down to a point. */
  {
    const bands=[
      {y:L.jawY+0.010, rx:0.058, rz:0.046, cz:0.058, hex:P.hair},
      {y:L.jawY-0.034, rx:0.044, rz:0.036, cz:0.075, hex:P.hair},
      {y:L.jawY-0.072, rx:0.028, rz:0.024, cz:0.078, hex:P.hair},
      {y:L.jawY-0.100, rx:0.012, rz:0.011, cz:0.068, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0].map(p=>p), V(0,L.jawY+0.030,0.045), P.hair, true);  // small cap seals the top against the chin
    capFan(rings.at(-1), V(0,L.jawY-0.122,0.062), P.hair);
  }

  /* HORNS — chained tube() segments off the temples, near browY/crownY, offset at +-x.
     Each horn sweeps UP and gently BACK (a classic backswept ram/tiefling curve): the root rises
     from the temple, then the 2nd/3rd segments arc rearward (-z) and a touch outward. A backswept
     curve reads cleanly SYMMETRIC from every front/hero angle — the old "hook FORWARD (+z)" draped
     one horn down alongside the cheek under the 45° hero camera (reading as a lopsided stub) while
     the far horn projected as a long arc. Kept identical L/R by construction. Root wide, point
     narrow. */
  for(const s of [-1,1]){
    const baseX = s*0.100, baseZ = -0.010;
    const base   = V(baseX, L.browY-0.010, baseZ);
    // seg1: mostly up, a touch outward — the root sweep
    const p1 = V(baseX + s*0.026, L.browY+0.118, baseZ - 0.028);
    // seg2: still rising but now curving BACK (-z) and slightly outward
    const p2 = V(baseX + s*0.044, L.browY+0.210, baseZ - 0.090);
    // seg3: arcs further back and up to the point — the backswept tip, never dropping past the brow
    const p3 = V(baseX + s*0.052, L.browY+0.262, baseZ - 0.150);
    tube(base, p1, 0.030, 0.023, 6, P.horn,   {capA:{hex:P.hornDk}});
    tube(p1,   p2, 0.023, 0.015, 6, P.hornLt);
    tube(p2,   p3, 0.015, 0.003, 6, P.hornLt, {capB:{hex:P.hornDk}});
  }

  /* arms — plain adventurer, relaxed at sides (no class weapon; small knife stays sheathed) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.012), E=V(0.262,0.815,0.045), W=V(0.230,0.605,0.085);
    tube(S,E,0.062,0.050,6,P.tunic);
    tube(E,W,0.046,0.038,6,P.tunicDk);
    tube(W, W.clone().add(V(0.010,-0.075,0.020)), 0.038,0.030,6,P.skin, {capB:{hex:P.skinDk}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.012), E2=V(-0.268,0.820,0.038), W2=V(-0.232,0.610,0.070);
    tube(S2,E2,0.062,0.050,6,P.tunic);
    tube(E2,W2,0.046,0.038,6,P.tunicDk);
    tube(W2, W2.clone().add(V(-0.008,-0.075,0.018)), 0.038,0.030,6,P.skin, {capB:{hex:P.skinDk}});
  }

  /* legs — clean standing stance, fitted trousers + simple boots */
  const ankL=V(-0.128,0.085,0.020), ankR=V(0.128,0.085,-0.012);
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.008), kneeL=V(-0.118,0.40,0.032);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00),  kneeR=V( 0.122,0.40,-0.020);
    tube(hipL,kneeL,0.068,0.050,6,P.trouser);
    tube(kneeL,ankL,0.046,0.034,6,P.trouser);
    tube(hipR,kneeR,0.068,0.050,6,P.trouser);
    tube(kneeR,ankR,0.046,0.034,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.056, rz:0.062, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.095, rx:0.050, rz:0.052, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.150, rx:0.055, rz:0.055, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.048,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.118), 0.046,0.034,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.040, rbz:0.028});
    }
  }

  /* TAIL — thin (0.02-0.04 radius, much narrower than a limb), chained from the lower spine/hip,
     curving down and back through open space, then a short flare into a flat spade-tip diamond.
     The tip is held at roughly calf height, well clear of both the base disc (y up to ~0.058)
     and the trailing boot heel, so it hangs in mid-air behind the figure. Also swept a little to
     +x as it falls (not just y/z) — a pure z-only curve projects as a straight vertical drop in
     the orthographic front/back panels (depth is invisible from those cameras); the x-kick makes
     it read clearly beside the leg from every angle, not just the side view. */
  {
    const root = V(0.030, L.hipY-0.045, -0.120);
    // Keep x aligned with the figure's right leg (hip≈+0.10, ankle≈+0.13) and hold z well behind it,
    // so from the FRONT ortho view the leg fully occludes the tail — it must never drift into the
    // crotch gap / peek past the hem (the old sweep to x=+0.030 with shallow z=-0.230 poked a red
    // sliver through the front hem). It reads clearly in the side/three-quarter panels where depth
    // is visible.
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);           // mid-air behind the calf — well above y=0.058
    tube(root, t1, 0.038, 0.031, 6, P.tunicDk);    // thick end blends into the hip/hem
    tube(t1,   t2, 0.031, 0.022, 6, P.skinDk);
    tube(t2,   t3, 0.022, 0.013, 6, P.skinDk);
    tube(t3,   tip,0.013, 0.006, 6, P.skinDk);

    /* spade-tip: a small flattened diamond fanning out past the tail's end point, built from
       two quads (top face + bottom face) meeting at a point beyond `tip`, wide at `tip`, narrow
       fore/aft — reads as a flat arrow-head/spade silhouette. */
    const axis = new THREE.Vector3().subVectors(tip,t3).normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), axis).normalize();
    const fwd  = tip.clone().addScaledVector(axis, 0.052);      // spade point, past the tail end
    const back = tip.clone().addScaledVector(axis, -0.014);     // spade "waist" nearest the tail
    const wingL= tip.clone().addScaledVector(side, 0.040).addScaledVector(axis, 0.006);
    const wingR= tip.clone().addScaledVector(side,-0.040).addScaledVector(axis, 0.006);
    quad(back, wingR, fwd, wingL, P.skinDk, 0.03);
    quad(back, wingL, fwd, wingR, P.skinDk, 0.03);   // opposite winding so both faces shade correctly
  }

  /* base disc — identical convention to humanoid.js */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
