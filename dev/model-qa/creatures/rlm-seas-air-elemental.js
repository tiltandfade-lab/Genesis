/* dev/model-qa/creatures/rlm-seas-air-elemental.js — the AIR ELEMENTAL landmark table
   (ELEMENTAL MASS family — no ANATOMY-CANON section exists for it yet, family stub list only
   covers AVIAN/HUMANOID, so this is authored from first principles per the DIRECTION brief,
   following the rlm-seas-water-elemental.js precedent for the family), Large, CR 5, realm
   high-seas, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry
   pilot, seas-w2 cell 1, port 5275). Core identity: a bottled storm shaken loose — a living
   whirlwind, completing the elemental quartet (earth=mass, fire=rise, water=wave, AIR=SPIN).
   Bespoke to the render key "air-elemental" — realm reskins ride this chassis narratively;
   palette is cool grey-white, opaque here (opacity is a registry concern per the brief).

   FEATURE CHECKLIST (the ~1,100-1,300 budget buys):
     1. THE FUNNEL — a stacked-band vortex body, every ring rotated (phase-offset) further than
        the last so the surface itself reads as TWISTING rather than a smooth cone, leaning hard
        off-axis mid-turn (cx/cz walk sideways as y climbs, not straight up) so the whole mass
        looks caught mid-spin rather than standing still.
     2. SIGNATURE — orbiting DEBRIS at three different heights around the funnel: a broken deck
        plank, a barrel stave, and a gull feather, each on its own ring radius/height/orbital
        angle so wind reads as visible-by-what-it-carries. Palest, highest-value tones in the
        piece live on the debris per law 3, set directly against the cool grey-white body.
     3. Two wind-arms — visible turbulence limbs breaking off the funnel's mid-section: one flung
        WIDE and far (the ripping-spin gesture), the other short and trailing low, the law-5
        asymmetric counterweight (mirrors the water-elemental's reach-arm / trail-arm split).
     4. Twist-banding — alternating light/dark grey bands spiraling up the funnel (not flat rings)
        so the spin direction reads even where no debris orbits at that height.
     5. Base skirt — a wide, low, wind-torn skirt at the foot of the funnel (uneven, torn-edge
        rim) selling contact with the deck/sea it's ripping across, kept in the darkest tone
        (never on the signature) per law 3's void-avoidance floor.
     6. Debris trail dust — a scatter of small pale chip/spray blobs flung off the funnel's
        leeward side, selling motion without adding a second full signature.

   POSE SENTENCE: caught mid-rip — the funnel leaning hard off its own axis mid-turn, one
   wind-arm flung wide and far as if it just backhanded something off the deck, the other arm
   short and trailing low on the opposite side, three pale objects (a plank, a stave, a feather)
   caught in orbit at different heights around the twisting body, never a standing-still column
   of air.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w2'], cell 1, fn buildAirElemental). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one tapering wind-limb: shoulder -> elbow -> wrist, ending in a small blown-open "hand" of
   3 thin trailing wisps (never a fist — wind doesn't grip, it streams). */
function windLimb(shoulder, elbow, wrist, wispDirs, wispLen, hex, hexLt){
  tube(shoulder, elbow, 0.085, 0.062, 6, hex);
  tube(elbow, wrist, 0.062, 0.040, 6, hex);
  blob(wrist.x, wrist.y, wrist.z, 0.040, 0.036, 0.038, hexLt, 5, 3);
  for(const d of wispDirs){
    const dn = norm(d);
    const tip = wrist.clone().addScaledVector(dn, wispLen);
    tube(wrist, tip, 0.030, 0.010, 4, hexLt, { capB: { hex: hexLt } });
  }
}

export function buildAirElemental(){
  const P = {
    deep:    0x5a6068, // darkest trough/skirt — base only, never on the signature
    body:    0x848c94, // main funnel mid-grey
    bodyLt:  0xa8b0b6, // lit twist-band grey
    crest:   0xc6ccd0, // upper funnel / limb grey, lifted clear of the body
    foam:    0xf2f4f2, // highest-value pale — debris + wisp tips
    limb:    0xb4bcc2, // wind-limb base tone, lighter than body so it reads against it
    wood:    0xc9a869, // pale plank/stave — warm signature-inside-cool-mass beat (debris)
    woodDk:  0x8a6b3d, // plank end-grain / shadow
    stave:   0xa87e46, // barrel-stave tone, distinct warm from the plank
    feather: 0xe8e4da, // gull feather — near-white, softest of the three debris pieces
  };

  /* ---------------- 1. THE FUNNEL — twisting vortex body, leaning mid-spin ---------------- */
  const bands = [
    { y: 0.02, rx: 0.50, rz: 0.48, cx:  0.00, cz:  0.00, hex: P.deep   },
    { y: 0.14, rx: 0.46, rz: 0.44, cx:  0.05, cz:  0.02, hex: P.deep   },
    { y: 0.28, rx: 0.38, rz: 0.36, cx:  0.11, cz:  0.05, hex: P.body   },
    { y: 0.44, rx: 0.31, rz: 0.30, cx:  0.16, cz:  0.10, hex: P.bodyLt }, // twist begins
    { y: 0.60, rx: 0.26, rz: 0.25, cx:  0.18, cz:  0.17, hex: P.body   },
    { y: 0.76, rx: 0.22, rz: 0.21, cx:  0.16, cz:  0.25, hex: P.bodyLt }, // mid-section (limbs seat here)
    { y: 0.92, rx: 0.18, rz: 0.18, cx:  0.11, cz:  0.32, hex: P.body   },
    { y: 1.08, rx: 0.145,rz: 0.145,cx:  0.06, cz:  0.38, hex: P.crest  },
    { y: 1.24, rx: 0.11, rz: 0.11, cx:  0.02, cz:  0.42, hex: P.bodyLt },
    { y: 1.38, rx: 0.075,rz: 0.075,cx: -0.02, cz:  0.44, hex: P.crest  },
    { y: 1.50, rx: 0.045,rz: 0.045,cx: -0.05, cz:  0.44, hex: P.foam   }, // funnel tip, kept chunky (law-3 floor)
  ];
  /* every band's phase is walked forward so the ring seams spiral rather than stack flat — the
     "twisting surface" read law 1 asks for (the tri budget spent on the spin itself, not on
     smoothing a plain cone). */
  stack(bands, 12, {
    phase: 0.62,
    capBot: { hex: P.deep, lift: 0.02 },
    capTop: { hex: P.foam, lift: 0.012 },
  });

  /* twist-banding — alternating light/dark spiral ribbons riding the funnel surface so the spin
     direction reads at every height, not only where debris orbits. */
  {
    const spiralPts = [];
    const N = 10;
    for(let i=0;i<=N;i++){
      const t = i / N;
      const y = 0.10 + t * 1.32;
      const rr = 0.44 * (1 - t) + 0.05 * t;
      const ang = t * Math.PI * 2.6; // ~1.3 full turns climbing the funnel
      spiralPts.push(V(Math.cos(ang) * rr + t * 0.10, y, Math.sin(ang) * rr + t * 0.44));
    }
    for(let i=0;i<spiralPts.length-1;i++){
      const ra = 0.052 - i*0.0035, rb = 0.052 - (i+1)*0.0035;
      tube(spiralPts[i], spiralPts[i+1], Math.max(ra,0.030), Math.max(rb,0.030), 4,
        (i % 2) ? P.crest : P.bodyLt);
    }
  }

  /* ---------------- 2. SIGNATURE — orbiting debris at three heights ---------------- */
  {
    // (a) broken deck plank — low orbit, wide radius, warm pale tone against the cool grey body
    const plankA = V(0.55, 0.30, -0.18);
    const plankB = V(0.30, 0.34, 0.62);
    tube(plankA, plankB, 0.055, 0.040, 5, P.wood, { capA: { hex: P.woodDk }, capB: { hex: P.woodDk } });

    // (b) barrel stave — mid orbit, curved-arc read via two short tubes, opposite side of funnel
    const staveA = V(-0.52, 0.62, 0.10);
    const staveM = V(-0.44, 0.70, 0.38);
    const staveB = V(-0.20, 0.66, 0.56);
    tube(staveA, staveM, 0.045, 0.038, 4, P.stave);
    tube(staveM, staveB, 0.038, 0.030, 4, P.stave, { capB: { hex: P.woodDk } });

    // (c) gull feather — high orbit, thin tapering quill + a soft blob barb, near-white (highest
    // value zone in the piece, set well clear of the void per law 3)
    /* SELF-CORRECT (round 1, post-render): r1's feather quill (0.024->0.010) and barb blob
       (0.045/0.028/0.055) sat too far from the funnel body and too thin — it read as a faint
       grey nub against the void rather than the third pale debris piece. Fattened both above
       the law-3 0.04u floor and pulled the whole piece closer/lower so it reads against the
       funnel's own silhouette instead of dissolving in open dark void. */
    const featherA = V(0.14, 0.98, -0.34);
    const featherB = V(0.32, 0.92, -0.10);
    tube(featherA, featherB, 0.042, 0.020, 4, P.feather, { capB: { hex: P.feather } });
    blob(0.13, 1.01, -0.38, 0.062, 0.040, 0.070, P.feather, 5, 3);
  }

  /* ---------------- 3. Two wind-arms — the ripping-spin gesture ---------------- */
  {
    // wide-flung arm — the loud gesture, reaches far past the funnel's own silhouette
    const shoulderA = V(0.20, 0.78, 0.24);
    const elbowA    = V(0.58, 0.86, 0.10);
    const wristA    = V(0.94, 0.92, -0.10);
    windLimb(shoulderA, elbowA, wristA,
      [[0.75,0.20,-0.60],[0.55,0.45,0.10],[0.35,-0.15,-0.90]],
      0.20, P.limb, P.foam);

    // short trailing arm — low, opposite side, the law-5 asymmetric counterweight
    const shoulderB = V(-0.16, 0.62, 0.30);
    const elbowB    = V(-0.30, 0.50, 0.46);
    const wristB    = V(-0.34, 0.40, 0.58);
    windLimb(shoulderB, elbowB, wristB,
      [[-0.55,-0.25,0.60],[-0.15,-0.50,0.70],[-0.75,0.05,0.40]],
      0.12, P.body, P.crest);
  }

  /* ---------------- 4. Base skirt — wind-torn contact rim ---------------- */
  {
    const skirtPts = [];
    const S = 10;
    for(let i=0;i<S;i++){
      const ang = i/S*Math.PI*2;
      const jag = (i % 3 === 0) ? 0.62 : 0.52; // uneven torn-edge radius
      skirtPts.push([Math.cos(ang)*jag, 0.05 + 0.02*((i*3)%2), Math.sin(ang)*jag*0.94]);
    }
    for(const [dx,dy,dz] of skirtPts){
      blob(dx, dy, dz, 0.075, 0.035, 0.07, P.deep, 5, 3);
    }
  }

  /* ---------------- 5. Debris trail dust — small leeward chip scatter ---------------- */
  {
    const dustPts = [
      [-0.62,0.46,-0.22],[-0.70,0.20,-0.05],[-0.50,0.72,-0.35],
      [0.72,0.55,-0.55],[0.62,0.18,-0.40],[-0.40,0.95,-0.20],
    ];
    for(const [dx,dy,dz] of dustPts){
      blob(dx, dy, dz, 0.026, 0.022, 0.026, P.crest, 4, 3);
    }
  }
}
