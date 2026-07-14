/* dev/model-qa/creatures/rlm-gloom-cat.js — the CAT landmark table (QUADRUPED-DIGITIGRADE feline
   family, Tiny, CR 1/8, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (2026-07-08 foundry pilot, gloom-w2 cell 2). Core identity: the render key "cat" (frame:"cat" in
   data/realm-bestiary.js, e.g. the "Ashen Widow's Cat") — a funeral-black cat that never blinks and
   always knows which door hides the coffin. Bespoke to the chassis; gloom reskins ride it narratively.

   FEATURE CHECKLIST (the ~1,000-1,400 budget buys):
     1. QUADRUPED-DIGITIGRADE feline anatomy, SEATED — per ANATOMY-CANON: the hind thigh compresses
        into a rounded haunch mass fused to the torso (a real seated-cat structure, not a shortcut —
        the thigh presses flat to the ground when a cat sits), then the true lower-leg segment (hock
        -> near-vertical cannon -> paw) emerges visible in front of each haunch, flanking the front
        legs. Front legs stay the family's near-straight weight-bearing columns, shoulder to paw.
        The spine itself is the sit: a vertical loft widening at the ground-touching hip and
        narrowing up through chest/shoulders to a slim raised neck — NOT a level standing back.
     2. SIGNATURE — the unblinking WIDE eyes: two oversized pale-glow discs fixed dead-forward on
        the viewer, vertical slit pupils, a small glint accent. The high-value zone law 3 needs,
        landed directly on the signature (flavor: "never blinks").
     3. Tail curled TIGHT in a closed loop around the front feet (flavor: "tail curled over its
        paws") — a segmented taper sweeping out from the rump, around the side, in front of the
        paws, tip hooking back up and in against the body.
     4. Small wedge feline skull — cheek-widest head loft, short muzzle/nose, two flattened
        triangular ears erect and slightly forward-canted (alert, not relaxed).
     5. TOO-STRAIGHT bolt-upright posture — the spine loft runs near-vertical with no slouch or
        curve, the "wrong" unnatural stillness the omen-sit reads as at a glance.
     6. Funeral-black coat kept OFF true black (a cool charcoal-blue register, banded coat/coatDk)
        so the silhouette itself doesn't vanish into the render's dark void — law 3's general
        dark-on-dark trap, distinct from the eyes' own high-value beat.

   POSE SENTENCE: the omen sit — bolt upright, unnaturally still, weight settled dead-center on its
   haunches, tail curled tight and closed around its own forefeet, head fixed level and forward,
   eyes wide and unblinking on the viewer — never a relaxed loaf or a mid-stride prowl, always the
   held, watching stillness of something that already knows which door you'll open next.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 2, fn buildCat).

   PASS-2 CRITIC FIX (r2->r3, fresh-context critic): r2's engine render leaned the whole spine
   ~37deg forward (torso cz drift 0.228 over 0.302 height) — read as a crouch/prowl, not the
   claimed "bolt upright, unnaturally still" omen-sit; the head dipped down instead of fixing
   level-forward on the viewer. Cut the torso cz drift to ~0.140 (a slight chest-forward lean per
   the header's own "chest juts a touch ahead" language, not a hunch) and rigidly shifted the
   attached head/ears/eyes/nose/whiskers/front-legs back by the matching delta so the face stays
   flush on the now-more-vertical neck. Silhouette/essence (eyes) were already sound in r2 — this
   is a pose-only fix. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildCat(){
  /* ---------- PALETTE (funeral-black kept off true 0x000 per law 3; pale sickly-glow eyes are
     the loud high-value signature, gloom-register green-white). ---------- */
  /* R2 CRITIC FIX (post r1 engine render): the whole torso/leg/tail mass vanished into one near-
     black blob indistinguishable from the void — only the head/ears/eyes survived the capture.
     Law 3's dark-on-dark trap (the Creeper lesson), not a signature problem — the eyes already
     read perfectly. Coat lifted substantially (still a cool goth slate, reads "funeral-black" by
     context against the lighter world, but now clears the dither floor) and the coat/coatDk band
     alternation widened so the torso bands + separate legs/tail actually separate from each other
     instead of fusing into one silhouette shape. */
  const P = {
    coat: 0x4a4558, coatDk: 0x322e3d, coatLt: 0x615a72,      // lifted cool slate-black register
    sheen: 0x7b7392,                                          // thin spine sheen — the second, quieter value beat
    eyeGlow: 0xe6f0c4, eyeGlowDk: 0xb8cf94, pupil: 0x0b0b0d, glint: 0xf6ffe0,
    nose: 0x2e1a20, ear: 0x4a4558, earIn: 0x1c1620,
    disc: 0x241f20, discTop: 0x2c2624,
  };

  /* ---------- TORSO — a near-vertical loft: wide seated hip at the ground narrowing up through
     the chest to a slim raised neck (the bolt-upright read, law 5). cz drifts forward slightly as
     y rises — the chest juts a touch ahead of the hips, never a level standing back. ---------- */
  /* PASS-2 CRITIC FIX: r2 render leaned ~37deg forward (cz drift 0.228 over 0.302 of height) —
     read as a crouch/prowl, not the claimed "bolt upright, unnaturally still" omen-sit. Cut the
     drift to ~0.140 (a slight chest-forward, not a hunch) so the spine reads vertical at a glance;
     head/ears/eyes/nose/whiskers/front-legs below are rigidly shifted back to match. */
  const torso = stack([
    { y: 0.050, cz: -0.120, rx: 0.128, rz: 0.145, hex: P.coat },     // hip / haunch mass, seated on the ground
    { y: 0.150, cz: -0.074, rx: 0.112, rz: 0.122, hex: P.coatDk },
    { y: 0.240, cz: -0.032, rx: 0.100, rz: 0.100, hex: P.coat },
    { y: 0.300, cz: -0.004, rx: 0.096, rz: 0.088, hex: P.coatDk },   // shoulders
    { y: 0.352, cz:  0.020, rx: 0.056, rz: 0.052, hex: P.coat },     // slim raised neck
  ], 8, { phase: Math.PI / 8, capBot: { hex: P.coatDk, lift: 0.018 } });

  /* thin sheen strip up the spine ridge — the second, quieter value beat (law 3's general dark-
     on-dark guard: the black coat itself must not fully vanish, even before the eyes carry it). */
  {
    quad(V(-0.012, 0.16, -0.065), V(0.012, 0.16, -0.065), V(0.008, 0.34, 0.014), V(-0.008, 0.34, 0.014), P.sheen, 0.05);
  }

  /* ---------- HEAD — small wedge feline skull, widest at the cheeks, narrowing to the crown. ---- */
  const head = stack([
    { y: 0.375, cz: 0.067, rx: 0.058, rz: 0.064, hex: P.coat },
    { y: 0.415, cz: 0.078, rx: 0.070, rz: 0.076, hex: P.coat },      // cheek — widest
    { y: 0.450, cz: 0.062, rx: 0.058, rz: 0.058, hex: P.coatDk },
    { y: 0.475, cz: 0.032, rx: 0.036, rz: 0.036, hex: P.coatDk },
  ], 8, { phase: Math.PI / 8, capTop: { hex: P.coatDk, lift: 0.014 } });

  /* small nose + short closed muzzle tip at the front of the jaw band */
  {
    blob(0, 0.383, 0.127, 0.011, 0.008, 0.007, P.nose, 5, 3);
    quad(V(-0.014, 0.372, 0.118), V(0.014, 0.372, 0.118), V(0.010, 0.360, 0.114), V(-0.010, 0.360, 0.114), P.coatDk, 0.03);
  }

  /* ears — two flattened triangular cones, erect and slightly forward/outward-canted (alert). */
  for(const s of [-1, 1]){
    const base = V(s * 0.032, 0.462, 0.026);
    const tip = V(s * 0.078, 0.600, 0.052);
    tube(base, tip, 0.030, 0.003, 4, P.ear, { raz: 0.011, rbz: 0.002, phase: Math.PI / 4, capB: { hex: P.ear } });
    /* dark inner-ear sliver, a cheap value/texture beat */
    const innerBase = base.clone().addScaledVector(V(0, 0, 1), 0.006);
    const innerTip = tip.clone().lerp(base, 0.35);
    quad(innerBase, V(innerBase.x + s * 0.010, innerBase.y + 0.01, innerBase.z),
      V(innerTip.x + s * 0.006, innerTip.y, innerTip.z), innerTip, P.earIn, 0.03);
  }

  /* ---------- SIGNATURE — the unblinking wide eyes: oversized pale-glow discs fixed dead-forward,
     vertical slit pupils, a small glint. The high-value zone law 3 needs, landed on the signature
     itself (flavor: "never blinks"). ---------- */
  for(const s of [-1, 1]){
    const ex = s * 0.036, ey = 0.418, ez = 0.134;
    blob(ex, ey, ez, 0.028, 0.026, 0.014, P.eyeGlow, 6, 3);
    blob(ex, ey - 0.002, ez + 0.006, 0.022, 0.020, 0.010, P.eyeGlowDk, 5, 2);
    /* vertical slit pupil, fixed dead-center — the "never blinks" tell */
    quad(V(ex - 0.004, ey + 0.015, ez + 0.017), V(ex + 0.004, ey + 0.015, ez + 0.017),
      V(ex + 0.003, ey - 0.015, ez + 0.017), V(ex - 0.003, ey - 0.015, ez + 0.017), P.pupil, 0.02);
    blob(ex, ey + 0.012, ez + 0.019, 0.005, 0.005, 0.004, P.glint, 4, 2);
  }

  /* whiskers — thin pale-grey slivers off the muzzle sides, cheap texture */
  for(const s of [-1, 1]){
    for(const [dy, dz, len] of [[0.010, 0.01, 0.10], [-0.006, 0.006, 0.11], [-0.018, 0.0, 0.09]]){
      const a = V(s * 0.052, 0.388 + dy, 0.110 + dz);
      const b = a.clone().add(V(s * len, dy * 0.3, 0.01));
      quad(a, V(a.x, a.y - 0.003, a.z), V(b.x, b.y - 0.003, b.z), b, P.coatLt, 0.02);
    }
  }

  /* ---------- LEGS. Front — near-straight weight-bearing columns, shoulder straight down to a
     planted paw (ANATOMY-CANON's family tell). Rear — the true lower-leg segment (hock -> near-
     vertical cannon -> paw) emerging visible in front of each fused haunch, flanking the front
     pair — the seated cat's folded-knee silhouette. ---------- */
  for(const s of [-1, 1]){
    const shoulder = V(s * 0.058, 0.288, 0.078);
    const carpus = V(s * 0.060, 0.140, 0.091);
    const paw = V(s * 0.062, 0.020, 0.098);
    tube(shoulder, carpus, 0.028, 0.024, 6, P.coat);
    tube(carpus, paw, 0.024, 0.019, 6, P.coatDk, { capB: { hex: P.coatDk } });

    const hock = V(s * 0.098, 0.098, -0.010);
    const cannon = V(s * 0.108, 0.036, 0.062);
    const hpaw = V(s * 0.112, 0.020, 0.112);
    tube(hock, cannon, 0.032, 0.025, 6, P.coat);
    tube(cannon, hpaw, 0.023, 0.019, 6, P.coatDk, { capB: { hex: P.coatDk } });
  }

  /* ---------- TAIL — curled tight in a closed loop around the front feet (flavor: "tail curled
     over its paws"), segmented taper. ---------- */
  {
    const root = V(0.020, 0.072, -0.160);
    const p1 = V(0.150, 0.046, -0.060);
    const p2 = V(0.190, 0.028, 0.055);
    const p3 = V(0.150, 0.022, 0.135);
    const p4 = V(0.062, 0.028, 0.172);
    const tip = V(0.004, 0.046, 0.145);
    tube(root, p1, 0.026, 0.022, 6, P.coatDk, { phase: Math.PI / 6, capA: { hex: P.coatDk } });
    tube(p1, p2, 0.022, 0.018, 6, P.coat, { phase: Math.PI / 6 });
    tube(p2, p3, 0.018, 0.015, 6, P.coat, { phase: Math.PI / 6 });
    tube(p3, p4, 0.015, 0.012, 6, P.coatDk, { phase: Math.PI / 6 });
    tube(p4, tip, 0.012, 0.007, 6, P.coatDk, { phase: Math.PI / 6, capB: { hex: P.coatDk, lift: 0.006 } });
  }

  /* ---------- base disc (Tiny footprint — well under the Medium 0.42 humanoid pattern). ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.240, 0.240, 16);
    const r2 = ring(V(0, 0.040, 0), V(0, 1, 0), 0.225, 0.225, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.043, 0), P.discTop);
  }
}
