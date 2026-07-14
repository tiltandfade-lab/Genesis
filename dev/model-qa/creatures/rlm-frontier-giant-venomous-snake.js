/* dev/model-qa/creatures/rlm-frontier-giant-venomous-snake.js — the GIANT VENOMOUS SNAKE
   landmark table (SERPENTINE family, Medium, CR 1, realm frontier), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, frontier-w1 cell 7). Core
   identity: a big venomous snake — bulkier and longer than the Tiny rattler chassis, NO rattle.
   The bestiary's "Copperhead Nest-Guard" ("Territorial oversized copperhead denning a mine
   entrance") rides this bespoke chassis narratively.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. SERPENTINE body per ANATOMY-CANON: one continuous tapered tube, D cross-section (flat
        belly, rounded back), near-constant thick diameter through the front two-thirds, late
        taper only at the very tail. Pre-coiled: TWO broad stacked coils (bulkier mass than the
        Tiny rattler's 1.5 loops) with the front third launched clear of the coil.
     2. SIGNATURE A — the HORIZONTAL STRIKE LAUNCH (law 5, the pose-is-the-expression law): the
        front third shoots FORWARD low and flat off the top coil, mid-strike trajectory, NOT a
        reared cobra-style vertical lift. The neck stays low, level with the top coil, driving
        straight out at the viewer — the "den-mouth strike," not a threat display.
     3. SIGNATURE B — copper band pattern: alternating copper/dark hourglass-band overlays down
        the spine (the copperhead tell, replacing the Tiny rattler's diamond-back).
     4. Head at full gape: jaw dropped WIDE open (wider angle than the rattler), two long pale
        fangs extended forward on the strike line, forked tongue.
     5. Pale belly ladder — several patches tracking the coil floor, high-value law-3 zone.
     6. Small lidless side-set eyes; heat-pit divots (pit-viper tell) between eye and nostril.
     7. No rattle, no hood — the tail simply tapers to a fine blunt point tucked under the coil.

   POSE SENTENCE: two broad coils stacked on the base disc, the front third launched FORWARD in
   a low flat strike trajectory — neck level with the top coil, jaw at full gape baring fangs,
   driving straight out at prey — mid-lunge from the den mouth, never reared up or resting.

   SPINE-GESTURE SENTENCE: the gesture line runs tail-tuck -> lower coil -> upper coil -> the
   low horizontal launch -> the gaping head, one continuous forward-driving curve that stays
   LOW the whole way (unlike the rattler's vertical S-lift) — traced from above it reads as a
   coiled spring uncoiling flat along the ground, not a raised question-mark.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w1'], cell 7, fn
   buildGiantVenomousSnake). */
import { THREE, V, quad, tube, ring, capFan } from '../probe-lib.js';

export function buildGiantVenomousSnake(){
  /* ---------- PALETTE (copperhead: warm copper/rust hourglass bands vs. a pale high-value
     gape/fang zone + belly ladder — law 3's contrast zone lives in the open mouth so the
     signature survives dithering). ---------- */
  const P = {
    scale: 0xba7444, scaleDk: 0x7c4626,      // warm copper-brown back — brightened for law-3 contrast
    band: 0xe8ac68, bandDk: 0x4a2412,        // hourglass-band overlay (light/dark alternation, band lit up)
    belly: 0xecd8a8,                          // pale flat-belly D-section underside
    head: 0xa8703e, headDk: 0x603a1c,
    gape: 0xf0c8a0,                           // pale interior of the open mouth — the high-value zone
    eye: 0x1a1410, tongue: 0xc03828,
    fang: 0xf8f0d8,
    pit: 0x241408,                            // heat-pit divot
  };

  const n = 16; // body ring segment count — bulkier mass than the Tiny rattler, worth the density

  /* ---------- BODY PATH: tail-tuck -> lower coil (full loop) -> upper coil (stacked, offset)
     -> low horizontal launch -> head base. Each entry: [x,y,z,radius]. Chained tube() segments
     keep consistent phase so ring seams align along the whole spine. Radii bulkier + path
     longer than the Tiny rattler (Medium vs Tiny: near-constant thick diameter through the
     front two-thirds, late taper only at the tail). ---------- */
  const pts = [
    [ 0.02, 0.060, -0.26, 0.020],  // tail tip, tucked under the lower coil
    [ 0.09, 0.062, -0.22, 0.034],  // tail thickening into the lower coil
    [ 0.17, 0.066, -0.11, 0.052],  // lower coil, right arc
    [ 0.12, 0.072,  0.03, 0.062],  // lower coil, front — thick mid-body mass ("the chest") — raised
    [-0.03, 0.076,  0.10, 0.064],  // to clear ground: radius 0.062-0.064 needs centerline > ~0.055
    [-0.18, 0.078,  0.02, 0.062],  // lower coil, left-rear
    [-0.20, 0.082, -0.12, 0.058],  // lower coil closes, rises into the upper coil
    [-0.10, 0.088, -0.15, 0.058],  // upper coil begins, stacked higher + offset inward
    [ 0.05, 0.096, -0.08, 0.060],  // upper coil, front-right — second thick mass
    [ 0.12, 0.100,  0.06, 0.058],
    [ 0.02, 0.104,  0.15, 0.054],  // upper coil, front — launch point begins here
    [-0.05, 0.108,  0.10, 0.048],  // upper coil closes toward the launch
    [ 0.06, 0.112,  0.18, 0.046],  // low horizontal launch starts — stays LEVEL, no vertical lift
    [ 0.10, 0.118,  0.30, 0.038],  // driving straight forward, flat trajectory — CRITIC r2: kept thick
    [ 0.11, 0.122,  0.41, 0.030],  // neck, still level with the coil top — law-3 floor fix
    [ 0.10, 0.124,  0.50, 0.024],  // neck pinch right behind the skull — dia 0.048, clears 0.04u floor
  ];

  for(let i=0;i<pts.length-1;i++){
    const a = V(pts[i][0], pts[i][1], pts[i][2]);
    const b = V(pts[i+1][0], pts[i+1][1], pts[i+1][2]);
    const bandHex = (i % 2 === 0) ? P.scale : P.scaleDk;
    tube(a, b, pts[i][3], pts[i+1][3], n, bandHex, { phase: Math.PI/n });
  }

  /* copper hourglass-band overlay — explicit countable band quads riding the coil tops and the
     launch run (law 1: features, not padding). Each is a flat lozenge laid onto the back band. */
  const bandSpots = [
    [ 0.15, 0.074, -0.09, 1.00], [ 0.06, 0.082,  0.07, 1.05], [-0.12, 0.086,  0.04, 0.95],
    [-0.19, 0.090, -0.14, 0.90], [-0.06, 0.096, -0.11, 0.90], [ 0.09, 0.104,  0.00, 0.95],
    [ 0.09, 0.108,  0.11, 0.85], [-0.01, 0.112,  0.09, 0.75], [ 0.09, 0.126,  0.22, 0.65],
    [ 0.11, 0.130,  0.34, 0.55], [ 0.10, 0.132,  0.44, 0.42],
  ];
  bandSpots.forEach((s, i) => {
    const cx=s[0], cy=s[1]+0.032, cz=s[2], sc=s[3];
    const hex = (i%2)?P.band:P.bandDk;
    quad(V(cx,cy,cz-0.036*sc), V(cx+0.030*sc,cy,cz), V(cx,cy,cz+0.036*sc), V(cx-0.030*sc,cy,cz), hex, 0.05);
  });

  /* ---------- TAIL — no rattle: fine blunt taper tucked under the lower coil (points 0-1 above
     already carry it; this just caps it cleanly). ---------- */
  tube(V(-0.02, 0.058, -0.29), V(0.02, 0.060, -0.26), 0.010, 0.020, 8, P.scaleDk, { phase: Math.PI/8, capA: { hex: P.scaleDk } });

  /* ---------- HEAD — low flat wedge driving forward on the strike line, jaw at FULL GAPE
     (wider angle than the Tiny rattler). Upper skull + lower jaw as hinged short tube chains
     off the neck pinch, both angled DOWN-forward to stay level with the launch trajectory. ---------- */
  const neckEnd  = V(0.10, 0.124, 0.50);
  const skullBack = V(0.10, 0.128, 0.535);   // jaw hinge — widest point, still low/level
  const skullTop  = V(0.08, 0.148, 0.575);   // top of wedge, only a slight upward tilt (flat strike)
  const snoutTip  = V(0.06, 0.152, 0.625);   // blunt snout, forward-driving tip

  // CRITIC r2: head/neck radii bumped across the board — pass-1 tapered the neck+skull below the
  // 0.04u minimum-feature floor (law 3), so the whole signature dissolved to a pale smudge at
  // 1/3-res. Neck now hands off from pts[15]'s 0.024 without a re-pinch; skull widened to read as
  // a distinct wedge instead of a thread.
  tube(neckEnd, skullBack, 0.024, 0.040, 7, P.head, { phase: Math.PI/7 });
  tube(skullBack, skullTop, 0.040, 0.030, 7, P.headDk, { phase: Math.PI/7 });
  tube(skullTop, snoutTip, 0.030, 0.022, 7, P.head, { phase: Math.PI/7, capB: { hex: P.head } });

  // lower jaw — dropped to FULL GAPE, hinged low at skullBack, driven well below the upper wedge.
  // CRITIC r2: jaw drop deepened (was barely open) so the gape reads as an open mouth, not a seam.
  const jawMid = V(0.10, 0.078, 0.565);
  const jawTip = V(0.08, 0.052, 0.615);
  tube(skullBack, jawMid, 0.036, 0.022, 6, P.headDk, { phase: Math.PI/6 });
  tube(jawMid, jawTip, 0.022, 0.013, 6, P.headDk, { phase: Math.PI/6, capB: { hex: P.headDk } });

  // pale gape interior — a lozenge spanning the open mouth, the high-value law-3 zone. CRITIC r2:
  // re-anchored to the deepened jawMid/jawTip so the pale patch actually fills the widened gap.
  quad(V(0.12,0.128,0.535), skullTop, jawTip, V(0.10,0.098,0.548), P.gape, 0.05);
  quad(V(0.08,0.128,0.535), skullTop, jawTip, V(0.10,0.098,0.548), P.gape, 0.05);

  // fangs — two long pale tris hanging forward off the upper wedge into the gape, on the strike
  // line. CRITIC r2: thickened + extended down to the deepened jaw so they read as fangs in an
  // open mouth instead of vanishing threads.
  tube(V(0.122, 0.144, 0.555), V(0.122, 0.062, 0.592), 0.016, 0.002, 4, P.fang, { capB: { hex: P.fang } });
  tube(V(0.038, 0.142, 0.582), V(0.038, 0.058, 0.620), 0.015, 0.002, 4, P.fang, { capB: { hex: P.fang } });

  // forked tongue sliver off the snout tip
  tube(snoutTip, V(0.03, 0.150, 0.665), 0.005, 0.001, 3, P.tongue, { capB: { hex: P.tongue } });
  tube(snoutTip, V(0.07, 0.153, 0.662), 0.005, 0.001, 3, P.tongue, { capB: { hex: P.tongue } });

  // eyes — small lidless side-set blobs on the skull
  const eyeRing = ring(V(0.098, 0.152, 0.560), V(1,0,0), 0.012, 0.012, 6, 0);
  capFan(eyeRing, V(0.110, 0.152, 0.560), P.eye);
  const eyeRing2 = ring(V(0.062, 0.152, 0.560), V(-1,0,0), 0.012, 0.012, 6, 0);
  capFan(eyeRing2, V(0.050, 0.152, 0.560), P.eye);

  // heat-pit divots — the pit-viper tell, between eye and nostril, small dark recessed nubs
  const pitRing = ring(V(0.095, 0.140, 0.598), V(1,0,0), 0.006, 0.006, 5, 0);
  capFan(pitRing, V(0.100, 0.140, 0.598), P.pit);
  const pitRing2 = ring(V(0.065, 0.140, 0.598), V(-1,0,0), 0.006, 0.006, 5, 0);
  capFan(pitRing2, V(0.060, 0.140, 0.598), P.pit);

  // pale belly ladder on the coil underside — flat D-section cue, several patches tracking BOTH
  // coil floors so the belly reads as a continuous underside on the bulkier two-coil mass.
  const bellyPatches = [
    [[ 0.17,0.036,-0.11],[ 0.12,0.036, 0.03],[-0.03,0.036, 0.10],[-0.01,0.036,-0.02]],
    [[-0.18,0.036, 0.02],[-0.20,0.036,-0.12],[-0.10,0.036,-0.14],[-0.14,0.036,-0.03]],
    [[-0.10,0.056,-0.15],[ 0.05,0.056,-0.08],[ 0.12,0.056, 0.06],[ 0.02,0.056,-0.03]],
    [[ 0.02,0.056, 0.15],[-0.05,0.056, 0.10],[ 0.01,0.056, 0.00],[ 0.06,0.056, 0.06]],
  ];
  bellyPatches.forEach(p => quad(V(...p[0]), V(...p[1]), V(...p[2]), V(...p[3]), P.belly, 0.05));

  // dorsal ridge scutes — a low row of raised keel-scale ridges along the coil spine (real
  // pit-viper anatomy, not padding: keeled dorsal scales are the tactile/visual spine tell).
  for(let i=2;i<pts.length-3;i++){
    const p = pts[i];
    const base = ring(V(p[0], p[1]+p[3]*0.7, p[2]), V(0,1,0), 0.012, 0.007, 4, 0);
    capFan(base, V(p[0], p[1]+p[3]*0.7+0.016, p[2]), (i%2)?P.bandDk:P.band);
  }
}
