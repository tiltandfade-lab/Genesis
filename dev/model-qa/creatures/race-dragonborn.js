/* dev/model-qa/creatures/race-dragonborn.js — RIG-VARIANT race: same whole-object grammar as
   humanoid.js, different ANATOMY. ~1.55u tall, powerfully built (broader chest/shoulders than the
   human baseline), a reptilian head (forward-projecting muzzle via an off-axis tube() loft, a
   heavy brow ridge, two back-swept horn stubs), and a thick tapering tail chained from the hips
   via 4 tube() segments that curves down and back behind the base disc. Dressed as a plain
   adventurer: simple tunic/leathers in earth tones, a plain belt, a tiny sheathed belt knife —
   NOT any class (no held weapon). A few darker scale-accent bands on the chest suggest texture
   without a full armor build-up. Bronze/rust scale palette. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonborn(){
  /* ---------- PALETTE (VS desaturated; bronze/rust scale family) ---------- */
  const P = {
    tunic:0x6b6440, tunicDk:0x54502f, linen:0xb8a888, linenDk:0x847053,
    leather:0x4e3d2a, leatherDk:0x3a2d1f, trouser:0x554a34, boot:0x3c3226,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a, brass:0xb08d46, eye:0x1a1512,
    eyeGlow:0xd9c25a, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — broad powerful frame, ~1.55u tall (taller/broader than the 1.5u
     humanoid.js baseline: chest/shoulder radii scaled up ~12-15%, head sits higher). ---------- */
  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* trunk (one loft, hips->neck; broader chest/shoulders than the human baseline) */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.170, hex:P.tunicDk},
    {y:L.waistY, rx:0.188, rz:0.145, hex:P.tunic},
    {y:L.ribY,   rx:0.222, rz:0.165, hex:P.tunic},
    {y:L.chestY, rx:0.258, rz:0.185, hex:P.tunic},
    {y:L.shldY,  rx:0.268, rz:0.175, hex:P.tunic},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.005}});

  /* scale-accent bands on the chest — a few darker ring-segments suggesting texture, not full armor */
  {
    const bands=[
      {y:L.ribY+0.02,   rx:0.226, rz:0.168},
      {y:L.chestY-0.03, rx:0.250, rz:0.180},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    // only paint the front-ish arc (indices 0,1,2,3) as darker scale accents over the tunic
    for(let b=0;b<rings.length-1;b++){
      for(const i of [0,1,2,3]){
        const i2=(i+1)%8;
        const r0=rings[b], r1=rings[b+1];
        quad(r0[i].clone().add(V(0,0,0.006)), r0[i2].clone().add(V(0,0,0.006)),
             r1[i2].clone().add(V(0,0,0.006)), r1[i].clone().add(V(0,0,0.006)), P.scaleDk, 0.05);
      }
    }
  }

  /* tunic skirt */
  stack([
    {y:0.48, rx:0.245, rz:0.195, hex:P.tunicDk},
    {y:0.62, rx:0.228, rz:0.178, hex:P.tunic},
    {y:0.77, rx:0.205, rz:0.155, hex:P.tunic},
  ], 8, {});

  /* belt + buckle */
  stack([
    {y:0.805, rx:0.196, rz:0.152, hex:P.leather},
    {y:0.860, rx:0.193, rz:0.150, hex:P.leather},
  ], 8, {});
  quad(V(-0.035,0.812,0.160), V(0.035,0.812,0.160), V(0.035,0.855,0.156), V(-0.035,0.855,0.156), P.brass, 0.02);

  /* tiny sheathed belt knife (NOT a hero weapon — small, at the hip) */
  {
    const kb=V(0.165,0.795,0.135), kt=V(0.180,0.885,0.118);
    tube(kb, kt, 0.013,0.009,5,P.leatherDk,{capB:{hex:P.brass,lift:0.005}});
  }

  /* ---------- HEAD — reptilian skull with a forward-projecting muzzle ---------- */
  {
    const n=8, ph=Math.PI/n;
    /* skull loft: jaw -> muzzle-base -> brow -> crown (skin=scale hide tones) */
    const bands=[
      {y:L.jawY,    rx:0.100, rz:0.098, hex:P.scale},
      {y:L.muzzleY, rx:0.118, rz:0.116, hex:P.scale},
      {y:L.browY,   rx:0.122, rz:0.108, hex:P.scale},
      {y:L.crownY,  rx:0.098, rz:0.086, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    /* brow ridge — push the brow ring's front verts forward/down slightly for a heavy ridge
       (the same nose-ridge push trick, applied to a brow instead of a nose). */
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.010; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.004), P.scaleDk);

    /* MUZZLE — a wedge projecting forward (+z) from the face, built via tube() with an
       arbitrary +z-leaning axis (not the usual vertical limb direction). Two chained segments
       taper from a wide base near the eyes/brow down to a blunt tip, angled slightly down. */
    const muzBase = V(0, L.muzzleY-0.01, 0.118);            // meets the face at the muzzle-base ring
    const muzMid  = V(0, L.muzzleY-0.028, 0.230);
    const muzTip  = V(0, L.muzzleY-0.052, 0.322);
    tube(muzBase, muzMid, 0.108, 0.082, n, P.scale, {raz:0.088, rbz:0.068, phase:ph});
    tube(muzMid, muzTip, 0.082, 0.040, n, P.scaleLt, {raz:0.068, rbz:0.032, phase:ph, capB:{hex:P.scaleDk, lift:0.012}});
    /* jaw underside — a belly-toned strip under the muzzle for the paler throat/jaw read */
    quad(V(-0.05,L.muzzleY-0.06,0.130), V(0.05,L.muzzleY-0.06,0.130),
         V(0.028,L.muzzleY-0.075,0.300), V(-0.028,L.muzzleY-0.075,0.300), P.scaleBelly, 0.05);

    /* HORN STUBS — two short back-swept segments from the top/rear of the skull, angled
       backward (-z) and slightly up. Stubs, not dramatic horns. */
    for(const s of [-1,1]){
      const hb = V(s*0.072, L.crownY-0.015, -0.020);
      const ht = V(s*0.098, L.crownY+0.075, -0.115);
      tube(hb, ht, 0.032, 0.012, 6, P.horn, {capB:{hex:P.hornTip, lift:0.008}});
    }

    /* EYES — two small dark quads flanking the brow ridge, ABOVE the muzzle-base ring so the
       muzzle geometry can't occlude/shadow them (adapted house standard: higher and wider than
       the human placement, sitting where a reptilian skull's eyes would flank the brow, proud
       of the brow-ridge surface). */
    for(const s of [-1,1]){
      const ex=s*0.092, ey=L.browY-0.006, ez=0.118;
      quad(V(ex-0.017,ey-0.012,ez), V(ex+0.017,ey-0.012,ez),
           V(ex+0.017,ey+0.014,ez-0.007), V(ex-0.017,ey+0.014,ez-0.007), P.eye, 0.0);
      // tiny glow fleck inset (dragonborn eye read — still small & intentional, not a shaded column)
      quad(V(ex-0.007,ey-0.003,ez+0.003), V(ex+0.007,ey-0.003,ez+0.003),
           V(ex+0.007,ey+0.006,ez-0.002), V(ex-0.007,ey+0.006,ez-0.002), P.eyeGlow, 0.0);
    }
  }

  /* ---------- ARMS — plain, ending in a rounded fist nub (no held weapon) ---------- */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const E=V(0.335, 0.885, 0.075);
    const W=V(0.300, 0.640, 0.155);
    tube(S,E,0.092,0.072,6,P.tunic);
    tube(E,W,0.066,0.054,6,P.leather);
    tube(W, W.clone().add(V(0.015,-0.075,0.045)), 0.056,0.044,6,P.scale, {capB:{hex:P.scaleDk}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const E2=V(-0.345, 0.885, 0.060);
    const W2=V(-0.315, 0.635, 0.130);
    tube(S2,E2,0.092,0.072,6,P.tunic);
    tube(E2,W2,0.066,0.054,6,P.leather);
    tube(W2, W2.clone().add(V(-0.012,-0.075,0.038)), 0.056,0.044,6,P.scale, {capB:{hex:P.scaleDk}});
  }

  /* ---------- LEGS + boots (same disc convention) ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.165,0.415,0.075), ankL=V(-0.175,0.090,0.045);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.190,0.415,-0.035), ankR=V( 0.205,0.090,-0.085);
    tube(hipL,kneeL,0.098,0.070,6,P.trouser);
    tube(kneeL,ankL,0.064,0.046,6,P.trouser);
    tube(hipR,kneeR,0.098,0.070,6,P.trouser);
    tube(kneeR,ankR,0.064,0.046,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.076, rz:0.084, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.066, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.072, rz:0.074, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.062,0.046,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.052, rbz:0.036});
    }
  }

  /* ---------- TAIL — thick tapering tail chained from the LOWER SPINE / HIP, curving down and
     back (-z, per the house convention: front is +z where the muzzle/eyes/knife face, back is
     -z where the hood/horns sweep). Root sits LOW (below the belt line at y~0.83, at hip level)
     and WELL behind the torso volume (z=-0.245, clear past the hip/skirt rz~0.16-0.18 depth) so
     it reads as emerging from behind the body rather than grazing the tunic surface, and so it
     can't peek out front-on or cross the forearm in 3/4. It then arcs down and sweeps DECISIVELY
     off to one side (+x) so the descending curve clears the right leg OUTBOARD (right knee/ankle
     live at x~0.19-0.21; the tail's mid/lower arc rides x~0.30-0.36, well beside them) rather
     than crossing over a leg silhouette. Lowest point stays clearly above the base disc top
     (y=0.058). ---------- */
  {
    const root = V(0.04, L.hipY-0.14, -0.245);   // low (y~0.61, below belt) + well behind the torso
    const t1   = V(0.230,0.545, -0.320);          // swing OUTBOARD early + high, before descending
    const t2   = V(0.360,0.400, -0.360);          // clear of the right leg's x~0.13-0.21 by knee height
    const t3   = V(0.445,0.270, -0.360);
    const t4   = V(0.470,0.165, -0.320);
    const tip  = V(0.470,0.115, -0.255);
    tube(root, t1, 0.112, 0.092, 8, P.scale,   {phase:Math.PI/8});
    tube(t1,   t2, 0.092, 0.070, 8, P.scale,   {phase:Math.PI/8});
    tube(t2,   t3, 0.070, 0.046, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t3,   t4, 0.046, 0.025, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t4,   tip,0.025, 0.012, 8, P.scaleDk, {phase:Math.PI/8, capB:{hex:P.scaleDk, lift:0.006}});
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
