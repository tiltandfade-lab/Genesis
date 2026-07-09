/* dev/model-qa/creatures/rlm-cosmic-black-pudding.js — the BLACK PUDDING landmark table
   (AMORPHOUS family — no ANATOMY-CANON stub exists for it, same first-principles posture as
   rlm-bright-gelatinous-cube.js's AMORPHOUS-GEOMETRIC precedent), Large, CR 6, realm cosmic,
   authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, cosmic-w1 cell 2,
   port 5372). Core identity: the big acid ooze — a shifting shoggoth-mass that dissolves and
   remembers. Must read distinct from the gray ooze: bigger, glossier, BLACK (not gray-drab).

   FEATURE CHECKLIST (the ~1,300-1,600 budget buys):
     1. AMORPHOUS body — a tall dark dome mass, built from overlapping ellipsoid lobes tapering
        upward and outward (never a flat blob-puddle — this creature stands tall and mid-motion).
     2. SIGNATURE A — the mid-SPLIT: the main dome's upper mass necks down and stretches toward
        a SECOND LOBE that has torn away and is caught mid-drop above/forward of the main body,
        with a small falling droplet under it selling the "still separating" read.
     3. SIGNATURE A (cont.) — a WEB OF STRANDS: five thin goo strands bridge the tear point on
        the main dome to the underside of the departing lobe, each sagging under its own gravity
        (two-segment tubes, thin waist, thicker anchors) — the "stretched web of goo" the brief
        calls for.
     4. SIGNATURE B — a half-dissolved pale SHIELD embedded in the dome's front surface: a
        flattened disc (old adventurer's gear the pudding has half-digested and still carries in
        its mass), a raised bright boss at its center, two dark "bite" notches eating into its
        rim where the ooze is mid-dissolving it, and a thin drip of shield-metal sludge running
        down from its lower edge. This is the law-3 high-value zone (>=140 RGB) — the single
        brightest, most legible shape in the piece.
     5. Glossy top-of-dome rim highlights — a string of small bright sheen patches along the
        main dome's upper silhouette (law-3's "black body NEEDS its rim light," hard mode: this
        realm killed two Creeper bakes to dark-on-dark — every dark zone here is checked against
        the void).
     6. Wet-texture surface bumps (alternating darker/lighter nubs low on the main dome) — the
        "shifting mass" character read, cheap and countable per law 1.
     7. A dark contact pool under the main dome's base — grounds the mass and reads as the acid
        it's built from.

   POSE SENTENCE: the split-lunge — the main dome reared up and leaning into its own tear point,
   a second lobe caught mid-drop above and forward of it with a droplet trailing below, five
   strands of goo stretched taut between them, the half-dissolved shield riding high on the
   dome's chest where the light catches it first.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY, adapted for an AMORPHOUS body with no
   skeleton, same adaptation the gelatinous-cube table used): this family's gesture line is the
   TEAR AXIS — the main dome's mass necks and leans from its grounded base up through the tear
   point toward the departing lobe, in one continuous diagonal sweep (base -> A2 -> A3 -> A4 ->
   strands -> B2 -> B1). A perfectly symmetric, perfectly vertical dome with no lean toward the
   split would be this family's "T-stance" failure; the neck-and-stretch diagonal carries the
   "high-expression moment" law the way bent elbows carry it for a jointed body.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0 (every blob's
   cy is kept >= its ry so bbox min.y stays >= 0 by construction; the departing lobe and its
   strands sit well above the floor). Cosmic palette: glossy near-black body (kept >=60 RGB over
   the (10,9,8) void per law 3 — pure black would vanish), a brighter sheen variant for rim
   highlights, and a pale bone/silver shield that's the piece's loud >=140 RGB zone. */
import { THREE, V, blob, tube, quad } from '../probe-lib.js';

export function buildBlackPudding(){
  const P = {
    body:   0x3c3c48,   // glossy near-black base — 60,60,72, well clear of the (10,9,8) void
    bodyLt: 0x535364,   // slightly lifted variant for the upper/tear mass, transitional
    bodyDk: 0x2a2a34,   // recessed/underside variant (still >60 RGB over void: 42,42,52)
    rim:    0x9a9ab8,   // glossy top-of-dome sheen — the law-3 rim-light high-value zone
    pool:   0x1c1c24,   // dark acid contact pool under the base
    shield: 0xc8c0a2,   // half-dissolved pale shield — the loud >=140 RGB signature
    shieldBoss: 0xe8dfc0, // raised boss at the shield's center, brightest point in the piece
    shieldDrip: 0xb0a888, // melted shield-metal sludge dripping from its lower edge
    strand: 0x7a7a92,    // bright-enough goo-strand webbing, reads against the void (law 3)
  };

  /* ---------- 1. main dome mass — grounded, necking up and leaning toward the tear point.
     Every band's cy is set >= its ry so the bbox floor stays at y>=0 by construction. ---- */
  blob(-0.10, 0.35, -0.06, 0.40, 0.33, 0.38, P.body,   10, 6);   // A1 — broad base
  blob(-0.02, 0.56,  0.02, 0.32, 0.29, 0.29, P.body,   10, 6);   // A2 — upper dome bulk
  blob( 0.10, 0.73,  0.11, 0.16, 0.15, 0.15, P.bodyLt, 8, 4);    // A3 — necking, waisted thin
  blob( 0.16, 0.85,  0.16, 0.08, 0.08, 0.08, P.body,   6, 4);    // A4 — tear tip, thinnest point

  /* ---------- 2. departing lobe — torn free, caught mid-drop CLEARLY off the dome's silhouette
     (up and out to the right), with a small falling droplet trailing beneath it. ---- */
  blob(0.62, 1.06, 0.28, 0.26, 0.23, 0.24, P.body,   9, 5);      // B1 — lobe core
  blob(0.44, 0.86, 0.20, 0.13, 0.12, 0.13, P.bodyDk, 8, 4);      // B2 — underside taper
  blob(0.34, 0.66, 0.14, 0.06, 0.08, 0.06, P.bodyDk, 6, 3);      // B3 — falling droplet

  /* ---------- 3. SIGNATURE A — the strand web: 5 sagging two-segment strands from the dome's
     tear tip (A4) to the lobe's underside (B2), thin waist (still >=0.04u dia per law 3) with
     thicker, brighter anchors at both ends so the web reads against the void. ---- */
  const tearC = V(0.16, 0.85, 0.16), lobeC = V(0.44, 0.86, 0.20);
  for(let i=0;i<5;i++){
    const ang = (i/5)*Math.PI*2;
    const start = V(tearC.x + Math.cos(ang)*0.08, tearC.y + Math.sin(ang)*0.04 + 0.02, tearC.z + Math.sin(ang)*0.07);
    const end   = V(lobeC.x + Math.cos(ang+0.7)*0.08, lobeC.y - 0.06 + Math.sin(ang+0.7)*0.03, lobeC.z + Math.sin(ang+0.7)*0.08);
    const sag = 0.05 + 0.03*((i*3)%3)/2;
    const mid = V((start.x+end.x)/2, Math.min(start.y,end.y) - sag, (start.z+end.z)/2);
    const rA = 0.034 + 0.006*(i%2), rM = 0.022, rE = 0.030 + 0.005*((i+1)%2);
    tube(start, mid, rA, rM, 5, P.strand, {phase:Math.PI/5});
    tube(mid, end, rM, rE, 5, P.strand, {phase:Math.PI/5});
  }

  /* ---------- 4. SIGNATURE B — the half-dissolved pale shield, embedded proud of the dome's
     front (+z) surface on the upper mass (A2). Flattened disc (thin in z = facing the viewer),
     a bright raised boss, two dark melt-bite notches eating its rim, and a drip trailing down. */
  const sc = V(-0.10, 0.56, 0.34);
  blob(sc.x, sc.y, sc.z, 0.16, 0.18, 0.05, P.shield, 10, 5);           // main disc
  blob(sc.x, sc.y, sc.z + 0.04, 0.06, 0.06, 0.035, P.shieldBoss, 8, 4); // raised bright boss
  blob(sc.x + 0.12, sc.y + 0.09, sc.z + 0.01, 0.06, 0.06, 0.045, P.body, 7, 4); // melt-bite, upper-right (smaller, cleaner disc)
  tube(V(sc.x-0.02, sc.y-0.17, sc.z+0.02), V(sc.x-0.035, sc.y-0.31, sc.z+0.005), 0.024, 0.010, 5, P.shieldDrip, {capB:{hex:P.shieldDrip}});

  /* ---------- 5. glossy top-of-dome rim highlights — small bright sheen patches strung along
     the dome's upper silhouette, the rim-light law-3 insures against dark-on-dark. ---- */
  const rimSpots = [
    V(-0.20, 0.68, 0.20), V(-0.04, 0.78, 0.10), V(0.20, 0.70, -0.12),
    V(0.10, 0.86, 0.20), V(-0.24, 0.52, -0.10),
  ];
  rimSpots.forEach((p,i)=> blob(p.x, p.y, p.z, 0.075, 0.045, 0.06, P.rim, 6, 3));

  /* ---------- 6. wet-texture surface bumps — alternating dark/light nubs low on the main
     dome, the "shifting mass" character read. ---- */
  const bumpSpots = [
    [-0.28, 0.22, 0.12, P.bodyDk], [0.20, 0.18, 0.28, P.bodyLt], [0.02, 0.14, -0.30, P.bodyDk],
    [-0.10, 0.46, -0.32, P.bodyLt], [0.30, 0.40, -0.06, P.bodyDk],
  ];
  bumpSpots.forEach(([x,y,z,hex])=> blob(x, y, z, 0.06, 0.05, 0.06, hex, 6, 3));

  /* ---------- 7. dark acid contact pool under the base — grounds the mass. ---- */
  quad(V(-0.55,0.006,-0.50), V(0.50,0.006,-0.50), V(0.55,0.006,0.42), V(-0.50,0.006,0.42), P.pool, 0.05);
}
