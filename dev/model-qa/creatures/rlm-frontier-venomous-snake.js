/* dev/model-qa/creatures/rlm-frontier-venomous-snake.js — the VENOMOUS SNAKE landmark table
   (SERPENTINE family, Tiny, CR 1/8, realm frontier), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, frontier-w1 cell 1). Core identity: an ordinary
   rattlesnake — the bestiary's "Sidewinder Snake" reskin (unusually common, agitated, strikes
   without warning) rides this bespoke rattler chassis narratively.

   FEATURE CHECKLIST (the ~1,000-1,300 budget buys):
     1. SERPENTINE body per ANATOMY-CANON: one continuous tapered tube, D cross-section (flat
        belly, rounded back), pre-coiled — 1.5 loops (outer loop + a stacked inner loop riding
        slightly higher, the "string of beads" near-constant mid-body diameter, late taper only
        at the very tail base and again past the neck pinch).
     2. SIGNATURE A — the RAISED RATTLE (law 4's one loud exaggerated feature): pale segmented
        tail-tip, curled OUT away from the coil footprint before rising vertically, separate
        and readable against the void — the high-value zone law 3 needs.
     3. SIGNATURE B — diamond-back pattern: alternating light/dark body bands plus explicit
        diamond quad overlays down the spine of the coil, the desert-rattler tell.
     4. Head: distinct low wedge, jaw hinge widest at rear narrowing to a blunt snout, jaw
        dropped OPEN on two pale fangs, forked tongue sliver off the tip.
     5. Neck kink: the body pinches narrower right behind the skull before the S-curve carries
        it up off the coil (the "head on a stalk" reading cue).
     6. Small lidless side-set eyes.

   POSE SENTENCE: coiled tight on the base disc, front third lifted off the coil in a raised
   S-curve to a cocked, jaw-open head baring its fangs — the rattle-threat, tail curled clear of
   the coil and standing straight up mid-buzz — never a flat resting loop.

   SPINE-GESTURE SENTENCE: the gesture line runs tail-curl -> coil -> the S-lifted neck -> the
   cocked head, one continuous sweeping curve through the loudest part (the raised neck/head);
   the coil is a Z-zigzag when the loop's traced, exactly what a striking snake's collapsed-and-
   loaded spine looks like — not a flat ring.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w1'], cell 1, fn buildVenomousSnake). */
import { THREE, V, quad, tube, ring, capFan } from '../probe-lib.js';

export function buildVenomousSnake(){
  /* ---------- PALETTE (dusty tan/brown diamond-back vs. a pale high-value rattle + belly
     ladder — law 3's contrast zone lives in the rattle so the signature survives dithering). ---------- */
  const P = {
    scale: 0x9c8256, scaleDk: 0x6b5636,     // dusty tan back
    diamond: 0xc9a862, diamondDk: 0x4a3b22, // diamond-pattern overlay (light/dark alternation)
    belly: 0xd9c79a,                        // pale flat-belly D-section underside
    rattle: 0xe8dcb8, rattleDk: 0xb8a878,   // segmented pale rattle — the loud signature
    head: 0x8a7048, headDk: 0x5c4a2c,
    eye: 0x1a1410, tongue: 0xb03828,
    fang: 0xe8e0c8,
  };

  const n = 14; // body ring segment count — mid-body is the mass of the creature, worth the density

  /* ---------- BODY PATH: tail-curl -> coil (outer loop then inner loop stacked) -> neck rise
     -> head base. Each entry: [x,y,z,radius]. Chained tube() segments per the tail/tentacle
     convention (consistent phase keeps ring seams aligned along the whole spine). ---------- */
  const pts = [
    [ 0.10, 0.028, -0.20, 0.014],  // tail tip (curls into the rattle base)
    [ 0.14, 0.032, -0.15, 0.020],  // tail curling clear of the coil
    [ 0.06, 0.040, -0.14, 0.030],  // tail rejoins body mass, thickening
    [-0.09, 0.046, -0.10, 0.040],  // outer loop, left arc
    [-0.15, 0.050,  0.02, 0.045],  // outer loop, rear
    [-0.09, 0.056,  0.13, 0.046],  // outer loop, right-front (thick mid-body — the "chest")
    [ 0.04, 0.062,  0.15, 0.045],
    [ 0.13, 0.072,  0.08, 0.044],  // curl inward, ring stacks slightly higher (inner loop begins)
    [ 0.11, 0.086, -0.02, 0.042],
    [ 0.02, 0.098, -0.05, 0.039],  // inner loop tucks UNDER-to-OVER the outer (reads as a coil)
    [-0.06, 0.108,  0.02, 0.035],
    [-0.03, 0.140,  0.10, 0.030],  // R2: lift begins earlier and steeper — S-curve reads distinct
    [ 0.04, 0.225,  0.16, 0.023],  // neck rising hard, S bends forward
    [ 0.03, 0.320,  0.21, 0.015],  // neck pinch — the "kink" behind the skull, well clear of the coil
  ];

  for(let i=0;i<pts.length-1;i++){
    const a = V(pts[i][0], pts[i][1], pts[i][2]);
    const b = V(pts[i+1][0], pts[i+1][1], pts[i+1][2]);
    const bandHex = (i % 2 === 0) ? P.scale : P.scaleDk;
    tube(a, b, pts[i][3], pts[i+1][3], n, bandHex, { phase: Math.PI/n });
  }

  /* diamond-back overlay — explicit countable diamond quads riding the topmost coil points
     (law 1: features, not padding). Each is a flat lozenge laid onto the back band. */
  const diamondSpots = [
    [-0.12, 0.048, -0.06, 0.90], [-0.15, 0.058, 0.02, 1.0], [-0.12, 0.058, 0.10, 0.95],
    [-0.03, 0.070, 0.145, 1.0], [0.13, 0.078, 0.05, 0.90], [0.11, 0.088, 0.03, 0.85],
    [0.00, 0.100, -0.05, 0.85], [-0.03, 0.112, 0.04, 0.80], [0.00, 0.140, 0.11, 0.60],
  ];
  diamondSpots.forEach((s, i) => {
    const cx=s[0], cy=s[1]+0.028, cz=s[2], sc=s[3];
    const hex = (i%2)?P.diamond:P.diamondDk;
    // R2-CRITIC FIX: winding was CW-from-above (normal pointed -y, culled by the FrontSide
    // MeshLambertMaterial — the whole diamond signature was invisible, backface-culled against
    // the overhead key light). Swapped the +x/-x verts so the normal points +y and the pattern
    // actually reads.
    quad(V(cx,cy,cz-0.028*sc), V(cx-0.024*sc,cy,cz), V(cx,cy,cz+0.028*sc), V(cx+0.024*sc,cy,cz), hex, 0.05);
  });

  /* ---------- TAIL RATTLE — segmented, pale, curled clear of the coil, standing up mid-buzz
     (SIGNATURE A). Separate short stack of shrinking tapered tube segments rising off the
     tail-curl point (pts[0]), NOT touching the coil body. ---------- */
  const rattleBase = V(0.115, 0.035, -0.225);
  const rattleSegs = [
    [0.115, 0.035, -0.225, 0.020],
    [0.119, 0.062, -0.229, 0.018],
    [0.120, 0.090, -0.230, 0.015],
    [0.118, 0.117, -0.228, 0.013],
    [0.115, 0.140, -0.224, 0.010],
    [0.113, 0.160, -0.222, 0.008],
    [0.110, 0.178, -0.217, 0.005],
  ];
  for(let i=0;i<rattleSegs.length-1;i++){
    const a = V(rattleSegs[i][0], rattleSegs[i][1], rattleSegs[i][2]);
    const b = V(rattleSegs[i+1][0], rattleSegs[i+1][1], rattleSegs[i+1][2]);
    const hex = (i % 2 === 0) ? P.rattle : P.rattleDk;
    tube(a, b, rattleSegs[i][3], rattleSegs[i+1][3], 8, hex, { phase: Math.PI/8,
      capB: (i === rattleSegs.length-2) ? { hex: P.rattle } : undefined });
  }
  // connect tail-curl to rattle base so it doesn't float
  tube(V(0.10,0.028,-0.20), rattleBase, 0.016, 0.020, 8, P.rattleDk, { phase: Math.PI/8 });

  /* ---------- HEAD — low wedge, widest at the jaw hinge narrowing to a blunt snout, jaw
     dropped OPEN. Upper skull + lower jaw as two hinged short tube chains off the neck pinch. ---------- */
  const neckEnd = V(0.03, 0.320, 0.21);
  const skullBack = V(0.02, 0.337, 0.245);   // jaw hinge — widest point
  const skullTop  = V(0.00, 0.370, 0.295);   // top of wedge, tilted up (open-mouth cock)
  const snoutTip  = V(-0.02, 0.374, 0.345);  // blunt snout narrowing forward

  tube(neckEnd, skullBack, 0.015, 0.026, 6, P.head, { phase: Math.PI/6 });
  tube(skullBack, skullTop, 0.026, 0.020, 6, P.headDk, { phase: Math.PI/6 });
  tube(skullTop, snoutTip, 0.020, 0.010, 6, P.head, { phase: Math.PI/6, capB: { hex: P.head } });

  // lower jaw — dropped OPEN, hinged at skullBack, hanging below the upper wedge
  const jawMid = V(0.02, 0.305, 0.285);
  const jawTip = V(-0.01, 0.298, 0.332);
  tube(skullBack, jawMid, 0.022, 0.014, 5, P.headDk, { phase: Math.PI/5 });
  tube(jawMid, jawTip, 0.014, 0.006, 5, P.headDk, { phase: Math.PI/5, capB: { hex: P.headDk } });

  // fangs — two small pale tris hanging off the upper wedge into the open mouth gap
  tube(V(0.035, 0.352, 0.31), V(0.035, 0.318, 0.305), 0.007, 0.001, 4, P.fang, { capB: { hex: P.fang } });
  tube(V(0.005, 0.350, 0.325), V(0.005, 0.316, 0.320), 0.006, 0.001, 4, P.fang, { capB: { hex: P.fang } });

  // forked tongue sliver off the snout tip
  tube(snoutTip, V(-0.03, 0.362, 0.375), 0.004, 0.001, 3, P.tongue, { capB: { hex: P.tongue } });
  tube(snoutTip, V(-0.01, 0.364, 0.372), 0.004, 0.001, 3, P.tongue, { capB: { hex: P.tongue } });

  // eyes — small lidless side-set blobs on the skull, with a raised supraocular brow scute
  // (the "brow" tell that makes a viper head read hostile even in a squint)
  const eyeRing = ring(V(0.018, 0.354, 0.298), V(1,0,0), 0.010, 0.010, 6, 0);
  capFan(eyeRing, V(0.028, 0.354, 0.298), P.eye);
  const eyeRing2 = ring(V(-0.028, 0.354, 0.298), V(-1,0,0), 0.010, 0.010, 6, 0);
  capFan(eyeRing2, V(-0.038, 0.354, 0.298), P.eye);
  const browR = ring(V(0.016, 0.365, 0.293), V(0.6,1,0.2), 0.011, 0.005, 5, 0);
  capFan(browR, V(0.030, 0.372, 0.288), P.headDk);
  const browL = ring(V(-0.026, 0.365, 0.293), V(-0.6,1,0.2), 0.011, 0.005, 5, 0);
  capFan(browL, V(-0.040, 0.372, 0.288), P.headDk);

  // heat-pit signature — a small dark facet between eye and nostril each side (pit-viper tell)
  tube(V(0.010, 0.348, 0.315), V(0.014, 0.345, 0.322), 0.006, 0.002, 4, P.eye, { capB:{hex:P.eye} });
  tube(V(-0.020, 0.348, 0.315), V(-0.024, 0.345, 0.322), 0.006, 0.002, 4, P.eye, { capB:{hex:P.eye} });

  // R3-CRITIC FIX: the R2 belly patches (even after being dropped/shrunk) still had an UPWARD
  // normal sitting in the ring-bottom gap below the coil tube surface — they read as a bright,
  // hard-edged rectangular slab floating in a dark hole mid-coil (the "paper tag" the R2 header
  // called out, not actually fixed). Cut entirely rather than re-chase the seam: not a checklist
  // feature, and the coil's own alternating scale bands + diamond overlay already carry the
  // belly-adjacent read without a disconnected flat patch breaking the silhouette.

  // dorsal ridge scutes — a low row of raised keel-scale ridges along the coil spine (real
  // rattler anatomy, not padding: keeled dorsal scales are the tactile/visual spine tell).
  for(let i=2;i<pts.length-2;i++){
    const p = pts[i];
    const base = ring(V(p[0], p[1]+p[3]*0.7, p[2]), V(0,1,0), 0.010, 0.006, 4, 0);
    capFan(base, V(p[0], p[1]+p[3]*0.7+0.014, p[2]), (i%2)?P.diamondDk:P.diamond);
  }
}
