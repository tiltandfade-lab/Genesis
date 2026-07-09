/* dev/model-qa/creatures/rlm-cosmic-brain-crawler.js — the BRAIN CRAWLER landmark table
   (ABERRANT-ARTHROPOD family, Small), CR 1, realm cosmic, authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, cosmic-w1 cell 9, port 5379).
   Core identity: a BRAIN ON LEGS — the walking cortex. Flavor coat: a bell-ringing messenger
   aberration tolling unwanted summons (a small drooping clapper-tendril off the rear of the
   body carries that flavor without displacing the core read). LAW-3 WARNING: cosmic killed two
   dark models (Creeper x2, docs/MODEL-FOUNDRY.md) on dark-on-dark — the fold ridges are pushed
   to a genuinely bright pale pink-grey so the body clears both the signature-zone (>=140) and
   body-mass (>=60-over-void) floors on their own.

   FEATURE CHECKLIST (the ~1,000-1,400 budget buys):
     1. ABERRANT-ARTHROPOD body — a single wrinkled brain-mass (no head/thorax/abdomen split;
        the whole thing IS the "head"), built as a lofted ovoid that leans forward as it climbs
        (the lean is baked into the loft, not a separate rotation), narrow puckered underside
        where the legs root, wide mid-bulge, a forward-leaning crown at the top.
     2. SIGNATURE — the cortex folds: ~10 individual countable ridge-blobs (law 1: tris =
        countable features, never a noise texture) laid over the loft's surface, alternating a
        bright pale pink-grey ridge value (>=140 RGB, the piece's brightest shape) against
        darker groove-shadow flanks so the fold pattern reads at a squint as "brain," not "lumpy
        ball."
     3. Four naked clawed bird-legs (law: ARTHROPOD-family tent-pole knee, applied to 4 legs
        instead of 8/6) — each a real 3-segment chain: femur rises steeply UP-and-OUT so the
        knee peaks HIGHER than the body's own crown, tibia bends sharply back down, a short
        reversed-ankle segment carries the foot forward again (the avian double-bend that reads
        "bird leg" rather than "spider leg"), ending in a 3-toe claw splay.
     4. POSE — the scuttle-toll: the two front legs are raised off the ground mid-stride (feet
        lifted, claws splayed open in the air), the two rear legs planted and weight-bearing,
        while the whole brain-mass leans forward and down over the raised legs — an eager,
        off-balance mid-scurry, never an at-attention four-square stand.
     5. Minor flavor payload — a short drooping tendril off the rear underside of the body
        ending in a small round bell-clapper knob (the "bell-ringing messenger" flavor, kept
        small/secondary so it never competes with the brain+legs silhouette).

   POSE SENTENCE: the scuttle-toll — body pitched forward and slightly down, both front legs
   drawn up off the ground with claws splayed open mid-reach, both rear legs planted and driving
   the push, the whole brain-mass tilted eagerly forward over its own front feet as if lunging
   toward whatever it's about to summon.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY, applied to a non-humanoid frame):
   there is no pelvis/skull chain on a legs-only aberration, so the loft's own long axis carries
   the law instead — the body's centerline runs from the low-back underside (where the rear legs
   root, the "hip" analog) up and forward through the mid-bulge to the forward-leaning crown (the
   "skull" analog), one continuous forward-tipping curve, never a dead-plumb column; the raised
   front legs hang off that curve continuing its forward-reaching line, and the planted rear legs
   counter it at the base the way a back leg counters a lunging torso. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBrainCrawler(){
  const P = {
    bodyDk:   0x4a3244,   // underside / groove shadow — lifted well off near-black (cosmic guardrail)
    body:     0x8a6070,   // mid brain-mass value
    bodyLt:   0xa87c88,   // upper crown value, climbing toward the fold highlights
    foldLt:   0xe8c8d0,   // SIGNATURE ridge — pale pink-grey, >=140 RGB, brightest shape in the piece
    foldMid:  0xc79aa4,   // secondary ridge value (still well over the void floor)
    grooveDk: 0x5c3c4e,   // groove/crevice between ridges — dark but not near-void
    leg:      0x9c7860,   // naked clawed leg — fleshy tan, lifted off near-black to stay readable
    legDk:    0x6e5040,   // lower leg segment / shadow
    claw:     0x241610,   // claw tips
    clapper:  0x7a5c68,   // bell-clapper tendril, dim, secondary flavor payload
  };

  /* ---------------- BRAIN-MASS BODY — single lofted ovoid, forward-leaning crown baked
     directly into the per-band cz offsets (the "spine gesture" for a legs-only frame). ---------------- */
  const bodyRings = stack([
    { y: 0.28, cz: -0.04, rx: 0.15, rz: 0.14, hex: P.bodyDk },   // puckered underside, legs root here
    { y: 0.38, cz: 0.00,  rx: 0.25, rz: 0.23, hex: P.body },
    { y: 0.50, cz: 0.06,  rx: 0.30, rz: 0.27, hex: P.body },     // widest mid-bulge
    { y: 0.61, cz: 0.14,  rx: 0.25, rz: 0.22, hex: P.bodyLt },
    { y: 0.68, cz: 0.21,  rx: 0.14, rz: 0.13, hex: P.bodyLt },   // forward-leaning crown tip
  ], 10, {
    phase: Math.PI / 10,
    capTop: { hex: P.foldMid, lift: 0.01 },
    capBot: { hex: P.bodyDk, lift: 0.01 },
  });
  void bodyRings;

  /* ---------------- CORTEX FOLDS — ~10 countable ridge-blobs over the loft surface (law 1:
     countable features, not a noise texture). Alternating pale-ridge / groove-shadow values so
     the fold pattern reads at a squint. Positions wrap the crown + mid-bulge, deliberately
     asymmetric (never a tidy symmetric grid — this is a wrinkled thing, not a soccer ball). ---------------- */
  const ridges = [
    // top crown ridges (loudest, brightest — closest to the eye at a squint)
    { cx: 0.00,  cy: 0.67, cz: 0.24, rx: 0.10, ry: 0.05, rz: 0.13, hex: P.foldLt },
    { cx: -0.12, cy: 0.60, cz: 0.20, rx: 0.08, ry: 0.05, rz: 0.11, hex: P.foldMid },
    { cx: 0.13,  cy: 0.60, cz: 0.19, rx: 0.08, ry: 0.05, rz: 0.11, hex: P.foldLt },
    // mid-bulge ridges, wrapping toward the flanks
    { cx: -0.24, cy: 0.50, cz: 0.05, rx: 0.08, ry: 0.06, rz: 0.10, hex: P.grooveDk },
    { cx: 0.25,  cy: 0.49, cz: 0.04, rx: 0.08, ry: 0.06, rz: 0.10, hex: P.foldMid },
    { cx: 0.00,  cy: 0.52, cz: -0.14, rx: 0.10, ry: 0.05, rz: 0.09, hex: P.grooveDk },   // rear ridge
    { cx: -0.10, cy: 0.44, cz: 0.22, rx: 0.09, ry: 0.05, rz: 0.09, hex: P.foldLt },      // lower-front bulge
    { cx: 0.11,  cy: 0.43, cz: 0.21, rx: 0.09, ry: 0.05, rz: 0.09, hex: P.foldMid },
    { cx: -0.18, cy: 0.34, cz: -0.04, rx: 0.07, ry: 0.05, rz: 0.08, hex: P.grooveDk },   // low flank ridges
    { cx: 0.19,  cy: 0.35, cz: -0.03, rx: 0.07, ry: 0.05, rz: 0.08, hex: P.foldMid },
  ];
  ridges.forEach(r => blob(r.cx, r.cy, r.cz, r.rx, r.ry, r.rz, r.hex, 7, 4));

  /* ---------------- MINOR FLAVOR — the bell-clapper tendril, drooping off the rear
     underside, small enough to never compete with the brain+legs silhouette. ---------------- */
  const clapA = V(0, 0.28, -0.16);
  const clapB = V(0.02, 0.14, -0.22);
  const clapTip = V(0.03, 0.05, -0.24);
  tube(clapA, clapB, 0.028, 0.02, 5, P.clapper, { phase: Math.PI / 5 });
  tube(clapB, clapTip, 0.02, 0.018, 5, P.clapper, { phase: Math.PI / 5, capB: { hex: P.clapper } });
  blob(clapTip.x, clapTip.y - 0.01, clapTip.z, 0.03, 0.03, 0.03, P.clapper, 6, 3);

  /* ---------------- FOUR CLAWED BIRD-LEGS — real 3-segment chains (femur tent-poles ABOVE
     the body's own crown per the ARTHROPOD-family knee law, tibia bends sharply back down, a
     short reversed-ankle segment carries the foot forward — the avian double-bend). Front pair
     raised off the ground mid-stride (the scuttle-toll pose); rear pair planted and weight-
     bearing. ---------------- */
  function leg(hip, knee, ankle, foot, raised){
    tube(hip, knee, 0.05, 0.036, 5, P.leg, { phase: Math.PI / 5 });
    tube(knee, ankle, 0.036, 0.026, 5, P.leg, { phase: Math.PI / 5 });
    tube(ankle, foot, 0.026, 0.013, 5, P.legDk, { phase: Math.PI / 5, capB: { hex: P.claw } });
    // 3-toe claw splay off the foot — spread wider/more open on the raised (reaching) front feet
    const spread = raised ? 0.075 : 0.05;
    const sign = hip.x < 0 ? -1 : 1;
    const toes = [
      V(foot.x + sign * spread, foot.y + (raised ? 0.01 : 0.0), foot.z + 0.05),
      V(foot.x + sign * spread * 0.3, foot.y + (raised ? 0.02 : 0.0), foot.z + 0.08),
      V(foot.x - sign * spread * 0.4, foot.y + (raised ? 0.01 : 0.0), foot.z + 0.05),
    ];
    toes.forEach(tip => tube(foot, tip, 0.013, 0.004, 3, P.claw, { phase: Math.PI / 3 }));
  }

  // front legs (raised, claws lifted off the ground, mid-reach forward — the "scuttle" beat).
  // R2 self-review: r1's front pair tucked in almost behind the body silhouette from the game
  // camera and read as fused with the rear pair — widened the knee/foot spread and pushed the
  // reach further forward+up so the raised claws clear the body outline and the tent-pole knee
  // bend reads distinctly from the planted rear legs.
  leg(
    V(-0.15, 0.34, 0.22), V(-0.44, 0.80, 0.36), V(-0.30, 0.46, 0.54), V(-0.26, 0.20, 0.64),
    true
  );
  leg(
    V(0.15, 0.34, 0.22), V(0.44, 0.80, 0.36), V(0.30, 0.46, 0.54), V(0.26, 0.20, 0.64),
    true
  );
  // rear legs (planted, weight-bearing, driving the forward lean)
  leg(
    V(-0.15, 0.32, -0.14), V(-0.38, 0.74, -0.22), V(-0.28, 0.32, -0.36), V(-0.24, 0.03, -0.30),
    false
  );
  leg(
    V(0.15, 0.32, -0.14), V(0.38, 0.74, -0.22), V(0.28, 0.32, -0.36), V(0.24, 0.03, -0.30),
    false
  );
}
