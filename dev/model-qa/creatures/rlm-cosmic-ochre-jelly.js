/* dev/model-qa/creatures/rlm-cosmic-ochre-jelly.js — the OCHRE JELLY landmark table (AMORPHOUS
   family — no ANATOMY-CANON stub exists for it; same first-principles posture as
   rlm-cosmic-black-pudding.js's precedent), Medium, CR 1, realm cosmic, authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, cosmic-w1 cell 7, port 5377).
   Core identity: the yellow SPLITTING ooze, a net-tangled ooze dragging its own net as a lure.
   Must read distinct from the gray ooze (translucent) and black pudding (tall dark dome): the
   OCHRE is a FLAT, WIDE, creeping PANCAKE — mustard-ochre, bright by ooze standards.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. AMORPHOUS body — a wide, low, flat pancake mass with LOBED edges (never a tall dome —
        that's the pudding's silhouette; this one reads flat-and-wide first).
     2. SIGNATURE A — the ENCIRCLE: the pancake mid-flows AROUND a small half-swallowed rock,
        with lobes of the mass reaching past the rock on both sides so the ooze visibly wraps it
        (not just abuts it) — the "mid-ooze around an obstacle" pose the brief calls for.
     3. SIGNATURE A (cont.) — the rock itself: a pale, hard-edged value anchor sitting proud
        where the pancake has parted around it, half-submerged into the mass on its lower half so
        it reads "half-swallowed," not "sitting on top."
     4. SIGNATURE B — the dragged NET: a tangle of thin cord segments trailing off one side of
        the mass, snagged into a loose knotted clump partway out — the "net-tangled ooze dragging
        its own net as a lure" identity beat, distinct from every other cosmic ooze here.
     5. Lobed edge highlights — a string of bright mustard-ochre sheen ridges along the pancake's
        raised lobe rims (law-3's "give the body a >=140 RGB zone," carried by the ochre color
        itself rather than a separate white highlight — "bright by ooze standards").
     6. Wet-texture surface bumps (alternating darker/lighter nubs across the pancake's top) —
        the "shifting mass" character read, cheap and countable per law 1.
     7. A thin dark contact smear under the mass's leading edge — grounds the creep and reads as
        the corrosive slick it leaves behind.

   POSE SENTENCE: the encircle — the pancake mass flowing low and wide around a small pale rock,
   lobes of its own bulk reaching past the rock on both flanks so it visibly wraps rather than
   merely touches it, its own dragged net snagged in a loose tangle trailing off the far side.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY, adapted for an AMORPHOUS body with no
   skeleton, same adaptation the black-pudding/gelatinous-cube tables used): this family's gesture
   line is the FLOW AXIS — the mass's two encircling lobes sweep from the pancake's grounded bulk
   on one side, around the rock, and rejoin low on the far side in one continuous horizontal C-curve
   (left-lobe-base -> around-rock-front -> right-lobe-base), read in plan (top-down) rather than
   vertically. A perfectly symmetric ring or an un-parted slab sitting flush against the rock with
   no wrap would be this family's "T-stance" failure; the visible parting-and-rejoining carries the
   "high-expression moment" law the way bent elbows carry it for a jointed body.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0 (every blob's cy
   is kept >= its ry so bbox min.y stays >= 0 by construction; the rock and net sit on/above the
   mass, never below the floor). Cosmic palette: mustard-ochre body (kept well over 140 RGB per
   law 3 — this is the piece's own high-value zone, no separate highlight needed), a darker ochre
   for recessed/underside variants, a pale hard rock, and a dull cord color for the net. */
import { THREE, V, blob, tube, quad } from '../probe-lib.js';

export function buildOchreJelly(){
  const P = {
    body:    0xc8a832,   // mustard-ochre base — 200,168,50 — the law-3 loud zone, no dark-on-dark risk
    bodyLt:  0xe0c058,   // lifted lobe-rim variant, brighter mustard
    bodyDk:  0x9c7e22,   // recessed/underside variant, still well clear of the void
    rock:    0xa89a86,   // pale hard rock — value anchor, cooler/grayer than the ochre body
    rockDk:  0x746a5a,   // rock underside, half-submerged into the mass
    net:     0x5a4a30,   // dragged cord/net — dull umber, reads distinct from the ochre body
    smear:   0x6a5418,   // dark corrosive contact smear under the leading edge
  };

  /* ---------- 1. main pancake mass — wide, low, flat, lobed edges. Every band's cy is kept
     >= its ry so the bbox floor stays at y>=0 by construction. This is a FLAT slab, not a dome:
     rx/rz are much larger than ry throughout. ---- */
  blob( 0.00, 0.16,  0.00, 0.46, 0.15, 0.42, P.body,   10, 5);   // core — broad flat center
  blob(-0.30, 0.14, -0.10, 0.22, 0.12, 0.20, P.bodyLt, 9, 4);    // left lobe, reaching around the rock
  blob( 0.30, 0.14,  0.06, 0.24, 0.13, 0.22, P.bodyLt, 9, 4);    // right lobe, reaching around the rock
  blob(-0.10, 0.13,  0.34, 0.20, 0.11, 0.16, P.body,   8, 4);    // front lobe, parting around the rock
  blob( 0.05, 0.13, -0.32, 0.22, 0.11, 0.18, P.bodyDk, 8, 4);    // rear lobe
  blob(-0.38, 0.12,  0.22, 0.13, 0.09, 0.12, P.bodyLt, 7, 3);    // small outer lobe tip, left-front
  blob( 0.36, 0.12, -0.18, 0.13, 0.09, 0.12, P.bodyDk, 7, 3);    // small outer lobe tip, right-rear

  /* ---------- 2. SIGNATURE A — the half-swallowed rock. RAISED proud above the mass (not a
     recessed hole — round 1 self-review caught it reading as a punched-through ring), with only
     a small dark collar at its waterline selling the "half-swallowed" submersion. ---- */
  blob(0.02, 0.19, 0.02, 0.155, 0.075, 0.145, P.rockDk, 8, 4);  // dark waterline collar, low+wide
  blob(0.02, 0.30, 0.02, 0.135, 0.135, 0.125, P.rock,   9, 5);  // proud dome, well above the mass top
  blob(0.06, 0.40, -0.02, 0.055, 0.05, 0.055, P.rock,   6, 3);  // small rock chip riding the peak

  /* ---------- 3. SIGNATURE B — the dragged net: a tangle of cord segments trailing off the
     near (front-right) side of the mass into a loose knotted clump, pulled IN close so it stays
     inside the frame (round 1 self-review: the wider reach pushed the camera out and the net
     shrank to an unreadable sliver at the edge). Thin tubes, still >=0.04u dia per law 3. ---- */
  const netRoot = V(0.30, 0.17, 0.10);
  const netKnot = V(0.46, 0.11, 0.28);
  tube(netRoot, netKnot, 0.030, 0.026, 5, P.net, {phase:Math.PI/5});
  const cordEnds = [
    V(0.54, 0.06, 0.40), V(0.50, 0.07, 0.20), V(0.60, 0.08, 0.32),
    V(0.42, 0.05, 0.44), V(0.52, 0.09, 0.42),
  ];
  cordEnds.forEach((e,i)=>{
    tube(netKnot, e, 0.022, 0.011, 4, P.net, {phase:Math.PI/4 + i});
  });
  blob(netKnot.x, netKnot.y, netKnot.z, 0.055, 0.045, 0.055, P.net, 6, 3);  // the knotted clump itself
  // a couple of crossing strands so the "net" reads as a mesh, not a stray rope
  tube(V(0.42,0.07,0.38), V(0.58,0.07,0.24), 0.016, 0.016, 4, P.net, {phase:Math.PI/4});
  tube(V(0.40,0.06,0.26), V(0.58,0.06,0.42), 0.016, 0.016, 4, P.net, {phase:Math.PI/4});

  /* ---------- 4. lobed edge highlights — bright mustard-ochre ridges along the raised lobe
     rims, the piece's own high-value zone (no separate white highlight needed at this color). */
  const rimSpots = [
    V(-0.44, 0.19, 0.08), V(0.42, 0.20, 0.18), V(-0.18, 0.18, 0.40),
    V(0.14, 0.17, -0.38), V(-0.42, 0.16, -0.06),
  ];
  rimSpots.forEach(p=> blob(p.x, p.y, p.z, 0.05, 0.028, 0.05, P.bodyLt, 6, 3));

  /* ---------- 5. wet-texture surface bumps — alternating dark/light nubs across the pancake
     top, the "shifting mass" character read. ---- */
  const bumpSpots = [
    [-0.20, 0.24, -0.06, P.bodyDk], [0.12, 0.22, 0.20, P.bodyLt], [-0.06, 0.20, -0.24, P.bodyDk],
    [0.24, 0.21, -0.02, P.bodyLt], [-0.30, 0.18, 0.18, P.bodyDk],
  ];
  bumpSpots.forEach(([x,y,z,hex])=> blob(x, y, z, 0.055, 0.035, 0.055, hex, 6, 3));

  /* ---------- 6. dark corrosive contact smear under the mass's leading edge — grounds the
     creep. ---- */
  quad(V(-0.62,0.006,-0.10), V(0.58,0.006,-0.28), V(0.66,0.006,0.50), V(-0.50,0.006,0.48), P.smear, 0.05);
}
