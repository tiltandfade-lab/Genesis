/* dev/model-qa/creatures/rlm-seas-water-elemental.js — the WATER ELEMENTAL landmark table
   (ELEMENTAL MASS family — no ANATOMY-CANON section exists for it yet, family stub list only
   covers AVIAN/HUMANOID, so this is authored from first principles per the DIRECTION brief),
   Large, CR 5, realm high-seas, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (2026-07-08 foundry pilot, seas-w1 cell 4, port 5254). Core identity: a living riptide
   dragging leftovers of a wreck under — a wave given intent. Bespoke to the render key
   "water-elemental" — realm reskins ride this chassis narratively; the translucent-read
   palette here is opaque (opacity is a registry concern per the brief), authored with a
   bright cyan/foam value ladder so the signature reads solid regardless.

   FEATURE CHECKLIST (the ~850-950 budget buys):
     1. ELEMENTAL MASS body — one continuous asymmetric stack of bands from a wide wet base
        rising and drifting forward (cx/cz walking +z as y climbs), bulging at mid-height into
        a suggested TORSO (the "given intent" read: a chest breaking out of the wave, not a
        flat cone), then narrowing to a crest that arcs forward and hooks down over itself —
        the breaking-curl silhouette IS the pose, not a separate curl bolted onto a cone.
     2. SIGNATURE — one water-arm breaking off the torso bulge, arced forward like a claw:
        shoulder -> elbow -> wrist tube climbing out of the mass, ending in 4 spread clawed
        talons (tapering tubes, never a fist). A second smaller off-arm on the opposite side,
        low and trailing, is the law-5 asymmetric counterweight (one arm reaching, one dragging).
     3. Foam lip — a bright ribbon riding the outer edge of the curling crest (b6->b10), the
        highest-value tone in the piece, set directly on the signature per law 3 so the breaking
        curl can't vanish into the body's mid-blue.
     4. Trailing spray — 2 tapering ribbon-tubes flung off the crest backward (-z) and up, plus
        a scatter of small foam droplet blobs, selling "mid-break" motion instead of a static
        pillar of water.
     5. Half-swallowed ship TIMBER — a pale broken plank crossing diagonally through the torso
        bulge (visible poking through the mass, the "gray-ooze bone trick": a bright warm-tan
        object inside a cool-blue body), plus a shorter splinter piece and one small crate
        fragment at the base — the "leftovers of a wreck" the flavor line names.
     6. Deep trough shading at the base (darkest tone, kept OFF the signature per law 3) so the
        mass reads as rising water, not a flat-lit blob.

   POSE SENTENCE: caught mid-break — the mass rearing up and drifting forward into a torso
   bulge, one water-arm arcing out of it like a claw reaching for the deck it just cleared,
   the crest above hooking forward and down into a foam-lipped curl with spray flung off the
   back, a splintered ship timber still caught crosswise in its chest — never a static column
   of water, always the half-second the wave is breaking.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w1'], cell 4, fn buildWaterElemental). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one clawed water-talon: wrist -> mid -> tip, tapering, per the vampire-spawn/yuan-ti finger()
   idiom (never a needle — floors at the law-3 ~0.04u minimum on the base segment). */
function talon(wrist, dir, len, hex){
  const dn = norm(dir);
  const mid = wrist.clone().addScaledVector(dn, len * 0.55);
  const tip = wrist.clone().addScaledVector(dn, len);
  tube(wrist, mid, 0.052, 0.036, 4, hex);
  tube(mid, tip, 0.036, 0.014, 4, hex, { capB: { hex } });
}

export function buildWaterElemental(){
  const P = {
    deep:    0x1c4f66, // darkest trough — base only, never on the signature
    body:    0x2f7a93, // main wave-body mid-blue
    bodyLt:  0x4aa8c2, // lit torso-bulge blue
    crest:   0x7cd0e2, // crest/curl blue, lifted clear of the body
    foam:    0xdff5f3, // foam lip / spray — highest value in the piece
    claw:    0x63c0da, // water-claw, lighter than the body so it reads against it
    wood:    0xc9a869, // pale ship timber — the high-value warm signature-inside-the-mass beat
    woodDk:  0x8a6b3d, // timber end-grain / shadow
    crate:   0x6d5636, // small wreck-debris crate fragment
  };

  /* ---------------- 1. THE MASS — wave body rising into a breaking curl ---------------- */
  const bands = [
    { y: 0.02, rx: 0.50, rz: 0.46, cx: 0.00,  cz: -0.06, hex: P.deep   },
    { y: 0.16, rx: 0.49, rz: 0.45, cx: 0.01,  cz: -0.03, hex: P.deep   },
    { y: 0.32, rx: 0.45, rz: 0.42, cx: 0.02,  cz: 0.02,  hex: P.body   },
    { y: 0.50, rx: 0.40, rz: 0.39, cx: 0.02,  cz: 0.09,  hex: P.body   }, // torso bulge starts
    { y: 0.66, rx: 0.37, rz: 0.36, cx: 0.01,  cz: 0.17,  hex: P.bodyLt }, // torso bulge peak
    { y: 0.82, rx: 0.31, rz: 0.31, cx: -0.01, cz: 0.25,  hex: P.bodyLt },
    { y: 0.96, rx: 0.26, rz: 0.27, cx: -0.02, cz: 0.34,  hex: P.body   }, // crest neck, narrowing
    { y: 1.09, rx: 0.24, rz: 0.26, cx: -0.02, cz: 0.42,  hex: P.crest  }, // crest base
    { y: 1.20, rx: 0.22, rz: 0.24, cx: 0.02,  cz: 0.52,  hex: P.crest  }, // crest rising, arcing fwd
    { y: 1.28, rx: 0.20, rz: 0.22, cx: 0.06,  cz: 0.62,  hex: P.foam   }, // curl top — the hook apex
    { y: 1.24, rx: 0.17, rz: 0.19, cx: 0.09,  cz: 0.72,  hex: P.foam   }, // hook descending forward
    { y: 1.12, rx: 0.13, rz: 0.15, cx: 0.09,  cz: 0.80,  hex: P.foam   }, // curl tip — kept CHUNKY (law-3 floor)
    { y: 1.00, rx: 0.09, rz: 0.10, cx: 0.07,  cz: 0.85,  hex: P.foam   }, // curl lip roll-under, still solid
  ];
  /* CRITIC FIX (round 1, fresh-context pass): r2's crest tip radii bottomed out at 0.035-0.065u —
     under/at the law-3 0.04u floor — so the loft read as a thin horn/antenna, not a breaking
     foam curl (killed the silhouette read entirely). Re-fattened every crest ring so the hook
     stays a solid rolled mass all the way to its tip, and pushed the apex further +x/+z so the
     curl visibly overhangs the torso bulge instead of spiking straight up. */
  stack(bands, 12, { capBot: { hex: P.deep, lift: 0.02 }, capTop: { hex: P.foam, lift: 0.015 } });

  /* foam lip — a bright ribbon tube riding the outer (leading) edge of the curl, b6->b11, so
     the breaking crest can't vanish into the mid-blue body (law 3, right on the signature). */
  {
    /* CRITIC FIX (round 1): re-plotted along the re-fattened curl (see above) and floored the
       radius at 0.045 (was 0.012) so the lip stays a visible rolled ribbon instead of doubling
       up with the old thin curl stack into a needle. */
    const lipPts = [
      V(0.02, 1.10, 0.48), V(0.06, 1.23, 0.58), V(0.10, 1.30, 0.68),
      V(0.12, 1.25, 0.78), V(0.11, 1.13, 0.85), V(0.09, 1.01, 0.89),
    ];
    for(let i=0;i<lipPts.length-1;i++){
      const ra = 0.070 - i*0.006, rb = 0.070 - (i+1)*0.006;
      tube(lipPts[i], lipPts[i+1], Math.max(ra,0.045), Math.max(rb,0.045), 5, P.foam);
    }
  }

  /* ---------------- 2. SIGNATURE — the forward water-claw ---------------- */
  {
    /* CRITIC FIX (round 1 self-correct): the original reach ran mostly +z, which the sheet's
       camera foreshortens straight into the torso silhouette (arm read as fused to the mass).
       Swung the whole limb further +x (lateral, toward the viewer's side of the body) and DOWN
       below the torso bulge so its 2D silhouette clears the body outline entirely — matches the
       octopus-arm lesson ("push the reach radius past the mantle's own silhouette edge"). */
    /* CRITIC FIX (round 1): r2's wrist sat low/tucked under the torso shadow and read as a limp
       dangling hand rather than "a claw reaching for the deck it just cleared" — the essence
       feature wasn't LOUD. Raised the wrist and pushed the whole limb further +x/+z so the hand
       clears the body's dark lower shadow band and sits against open void/ground for contrast,
       and upsized the talon spread so the claw silhouette reads at a glance. */
    const shoulder = V(0.24, 0.58, 0.22);
    const elbow    = V(0.52, 0.54, 0.46);
    const wrist    = V(0.74, 0.46, 0.64);
    tube(shoulder, elbow, 0.095, 0.074, 6, P.claw);
    tube(elbow, wrist, 0.074, 0.056, 6, P.claw);
    blob(wrist.x, wrist.y, wrist.z, 0.060, 0.052, 0.056, P.claw, 6, 4);
    const talonDirs = [
      [0.65, 0.30, 0.85], [0.35, 0.10, 1.0], [-0.05, 0.02, 1.0], [-0.42, 0.15, 0.82],
    ];
    for(const d of talonDirs) talon(wrist, d, 0.23, P.foam);
  }

  /* off-arm — smaller, low, trailing on the opposite side: the asymmetric counterweight to the
     reaching claw (law 5's mid-lunge asymmetry). */
  {
    const shoulder = V(-0.14, 0.56, 0.16);
    const elbow    = V(-0.24, 0.44, 0.30);
    const wrist    = V(-0.26, 0.36, 0.42);
    tube(shoulder, elbow, 0.058, 0.044, 5, P.body);
    tube(elbow, wrist, 0.044, 0.030, 5, P.body);
    blob(wrist.x, wrist.y, wrist.z, 0.032, 0.028, 0.030, P.claw, 5, 3);
    const dripDirs = [[-0.5,-0.3,0.6],[-0.1,-0.5,0.7],[-0.7,0.1,0.5]];
    for(const d of dripDirs) talon(wrist, d, 0.09, P.crest);
  }

  /* ---------------- 3. Trailing spray — flung off the crest, motion not a static pillar ------ */
  {
    /* CRITIC FIX (round 1, fresh-context pass): r2/r3's spray radius floored at 0.006-0.008u —
       roughly 1/6th the law-3 0.04u minimum feature size. This (not the crest-curl bands, which
       were correctly re-fattened above) was the actual source of the hairline "antenna" spike
       that broke the silhouette read in r2 AND persisted into r3. Floored every ribbon segment
       at 0.045/0.040u and pulled the chains in tighter to the crest apex so they still read as
       flung spray, not a separate needle poking clear of the whole model. */
    const sprayA = [V(0.10, 1.24, 0.56), V(0.06, 1.33, 0.44), V(0.02, 1.36, 0.33)];
    const sprayB = [V(0.02, 1.10, 0.62), V(-0.03, 1.19, 0.50), V(-0.07, 1.22, 0.39)];
    for(const chain of [sprayA, sprayB]){
      for(let i=0;i<chain.length-1;i++){
        const ra = 0.062 - i*0.012, rb = 0.062 - (i+1)*0.012;
        tube(chain[i], chain[i+1], Math.max(ra,0.045), Math.max(rb,0.040), 4, P.foam, i===chain.length-2 ? { capB:{hex:P.foam} } : {});
      }
    }
    // scattered small foam droplets, deterministic placement (spiral-scattered, no Math.random)
    const dropPts = [
      [0.18,1.02,0.30],[-0.20,0.90,0.10],[0.24,0.80,-0.02],[-0.28,1.10,0.40],
      [0.10,1.28,0.50],[-0.06,0.72,-0.08],
    ];
    for(const [dx,dy,dz] of dropPts){
      blob(dx, dy, dz, 0.028, 0.026, 0.028, P.foam, 4, 3);
    }
  }

  /* ---------------- 4. Half-swallowed ship TIMBER — the wreck leftovers ---------------- */
  {
    /* CRITIC FIX (round 1 self-correct): the first pass buried BOTH ends of the plank inside the
       torso radius, so the solid outer shell fully occluded it — invisible in the r1 capture.
       Per the mon-ooze "engulfed bone" precedent (skull placed so it pokes ABOVE the mass's own
       local surface), one end now sits well OUTSIDE the torso's local radius (front-right,
       beyond rx~0.37-0.40 at this height) so the pale wood tip visibly juts clear of the body
       silhouette; the other end stays buried near the torso core (the "half-swallowed" read). */
    const pA = V(-0.06, 0.56, 0.06);          // buried end, inside the torso mass
    const pB = V(0.46, 0.74, 0.62);           // exposed end, clear beyond the body's own surface
    tube(pA, pB, 0.048, 0.034, 5, P.wood, { capB: { hex: P.woodDk } });
    // a short splintered stub, also poking clear, crossing the first plank near its exposed end
    const sA = V(0.10, 0.60, 0.14);           // buried end
    const sB = V(0.44, 0.52, 0.50);           // exposed end
    tube(sA, sB, 0.030, 0.018, 4, P.wood, { capB: { hex: P.woodDk } });
    // small crate-fragment debris caught low at the base, outside the body footprint (visible)
    blob(-0.44, 0.09, -0.10, 0.075, 0.06, 0.07, P.crate, 5, 3);
    blob(-0.38, 0.15, -0.02, 0.035, 0.030, 0.032, P.wood, 4, 3);
  }
}
