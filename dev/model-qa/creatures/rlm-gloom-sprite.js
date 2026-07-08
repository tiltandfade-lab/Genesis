/* dev/model-qa/creatures/rlm-gloom-sprite.js — the SPRITE landmark table (HUMANOID child-small fey
   + WINGED insect-wing family, Small, CR 1/2, realm gloom), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (2026-07-08 foundry pilot, gloom-w2 cell 4). Core identity: a tiny fey
   dart-fighter — child-small body, four dragonfly wings, a drawn needle-sword. Bespoke to the
   render key "sprite" (frame:"sprite" in data/realm-bestiary.js) — the gloom changeling-skin reskin
   ("Wick-Eyed Changeling Child", CR 0.5, Needle Sword trait) rides this chassis narratively; garnish
   (pale watchful face, dark rag-garb) stays generic enough that the changeling read still lands.

   FEATURE CHECKLIST (the ~1,000-1,600 budget buys):
     1. HUMANOID child-small torso/head/limbs per ANATOMY-CANON — a compact loft (not a scaled-down
        adult), pitched forward ~30 degrees as a WHOLE-BODY lean (every band's cz grows with y) so
        the figure reads as diving forward through the air, never a floating standing doll.
     2. SIGNATURE — four insect wings (two pairs: larger fore-wings, smaller hind-wings), each a
        thin near-white pane with a leading-edge spar strut + a visible darker vein line crossing
        it (ANATOMY-CANON WINGED: bones are the shape, membrane hangs off them — adapted to a flat
        glassy insect pane instead of a bat/dragon fan). All four caught at DIFFERENT beat angles
        (fore-left up, fore-right down, hind pair mid-stroke) — the mid-beat asymmetry sells motion.
        Every pane clears the 0.04u+ floor in its own plane; the near-white value is the model's
        loudest high-value zone (law 3), landing squarely on the signature.
     3. Needle-sword — drawn back in the trailing hand, cocked for a forward thrust, a thin pale
        blade against the dark garb (the second value beat, small but legible).
     4. Small pointed fey face, watchful and pale (the changeling's "too-quiet foundling" read) —
        pointed ears break the head silhouette, a plain closed mouth, no glaring eyes.
     5. Legs drawn up and tucked behind the dive instead of dangling or standing — hips bent, knees
        pulled toward the body, feet trailing — the hover reads as active flight, not a standing
        figure lifted off the ground.
     6. Free (leading) arm reaching forward-down, fingers spread — the asymmetric counterweight to
        the cocked sword arm, law 5's pose-expression rule (mid-dart, never at-attention).

   POSE SENTENCE: caught mid-dart, body pitched a hard 30 degrees forward and down, legs drawn up
   tight behind the dive, free hand reaching out ahead of the lunge while the needle-sword arm is
   cocked back at the hip ready to drive the blade forward on contact, and all four wings frozen at
   four different points in the same beat — front pair opposed up/down, hind pair mid-stroke — so
   the wingbeat itself looks like it's still moving.

   R2 CRITIC FIX (post r1 engine render, self-review): r1 authored the whole figure at ~0.6u total
   height against the shared r=0.42 base disc — the disc dwarfed the body and the camera (which
   frames off the FULL bbox including the disc) shrank the creature to a barely-legible smudge in
   one corner; wings and legs were present in geometry but pixel-scale invisible. Rescaled the whole
   body ~1.75x (matches twig-blight's Small-creature crownY~1.0 convention) and widened/lengthened
   the wing panes an extra ~1.3x on top of that so the signature actually dominates the silhouette.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. All geometry authored in absolute world coordinates (no local pt()-offset frame) to
   sidestep the wave-1 coordinate-mixing bug. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 4,
   fn buildSprite). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { buildBase, BASE_P } from '../parts.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one clawless finger stub — pale, short, no nail-tip taper needed at this scale */
function finger(base, dir, len, hex){
  const d = norm(dir);
  const tip = base.clone().addScaledVector(d, len);
  tube(base, tip, 0.014, 0.007, 3, hex, { capB: { hex } });
}

/* one dragonfly wing: a thin leading-edge spar (root->mid->tip, tapering) + a near-white pane
   trailing off the spar (2 quads, root->mid->tip so it can droop/camber slightly) + one visible
   darker vein line crossing the pane partway out (ANATOMY-CANON WINGED reading cue, adapted to a
   flat insect pane instead of a scalloped membrane fan). dir = spar direction (root->tip); the
   trailing (width) direction is DERIVED as a true perpendicular to dir (cross product against a
   reference up-axis) rather than hand-picked, so the pane's projected area survives the dimetric
   engine camera regardless of which way the spar itself points (R3 CRITIC FIX below explains why
   hand-picked side vectors failed). All absolute-coordinate math, no local frame. */
function dragonflyWing(root, dir, len, width, hexPane, hexSpar, hexVein){
  const d = norm(dir);
  const upRef = Math.abs(d.y) > 0.85 ? V(0, 0, 1) : V(0, 1, 0);
  const s = new THREE.Vector3().crossVectors(d, upRef).normalize();
  const mid = root.clone().addScaledVector(d, len * 0.58);
  const tip = root.clone().addScaledVector(d, len);
  /* leading-edge spar — thin tapered tube, the wing's structural line */
  tube(root, mid, 0.018, 0.013, 4, hexSpar);
  tube(mid, tip, 0.013, 0.006, 4, hexSpar, { capB: { hex: hexSpar } });
  /* pane — two quads off the spar, trailing edge tapering toward the tip so it reads as a fan,
     slight droop (lower y on the trail points) for camber instead of a taut flat plane.
     R4 CRITIC FIX (self-review of r3's engine render): r3's panes were built as SINGLE-winding
     flat quads (like the very "flat sheet" ANATOMY-CANON's WINGED section names as the #1 wing
     failure mode) — backface culling + the flat-shaded normal facing away from this camera angle
     meant the pane geometry existed but never drew; only the round (always-visible) spar/vein
     tubes survived, which is why r3 read as thin fencing lines instead of broad panes. Each pane
     quad is now authored TWICE with reversed winding (front + back triangle pair) so it renders
     from every turnaround angle — the same reason the medusa's veil uses a tube instead of a flat
     ribbon; a real dragonfly wing has no back-face to hide. */
  const trailRoot = root.clone().addScaledVector(s, width * 0.50).addScaledVector(V(0, -0.012, 0), 1);
  const trailMid = mid.clone().addScaledVector(s, width * 0.95).addScaledVector(V(0, -0.020, 0), 1);
  const trailTip = tip.clone().addScaledVector(s, width * 0.22).addScaledVector(V(0, -0.012, 0), 1);
  quad(root, mid, trailMid, trailRoot, hexPane, 0.05);
  quad(trailRoot, trailMid, mid, root, hexPane, 0.05);
  quad(mid, tip, trailTip, trailMid, hexPane, 0.05);
  quad(trailMid, trailTip, tip, mid, hexPane, 0.05);
  /* one visible vein-strut crossing the pane roughly a third of the way out — a thin darker line,
     kept above the 0.04u-ish floor as a tube (not a flat quad) so it survives every turnaround */
  const veinA = root.clone().lerp(trailRoot, 0.55).addScaledVector(d, len * 0.06);
  const veinB = mid.clone().lerp(trailMid, 0.85);
  tube(veinA, veinB, 0.011, 0.007, 3, hexVein);
}

export function buildSprite(){
  /* ---------- PALETTE (gloom register: pale watchful changeling flesh + dark rag-garb carrying
     the low value, the four wing-panes carrying the model's one loud high-value zone). ---------- */
  const P = {
    skin: 0xdccbb0, skinDk: 0xb8a184,                    // pale fey flesh (the changeling's foundling pallor)
    garb: 0x3a3226, garbDk: 0x241f18,                    // dark rag-leaf garb, low-value against the void
    hair: 0x241a16,
    eye: 0x1a1310, mouth: 0x231a17,
    wing: 0xeef2ee, wingEdge: 0xcdd8d2, vein: 0x8fa199,  // near-white panes, darker spar/vein for the read
    blade: 0xdcdcd4, bladeDk: 0x9a9a90, hilt: 0x2a2018,
    ...BASE_P,
  };

  /* ---------- LANDMARKS — hover ~0.44u above the tile, whole-body pitch baked into cz growing
     with y (30-degree forward dive), never a vertical standing stack. Overall crownY ~1.03, on the
     twig-blight (Small) convention against the shared r=0.42 disc. ---------- */
  const L = {
    hipY: 0.525, waistY: 0.6125, chestY: 0.7175, shldY: 0.7965, neckY: 0.8575,
    jawY: 0.875, cheekY: 0.9275, browY: 0.980, crownY: 1.029,
  };
  const cz = { hip: 0.000, waist: 0.0385, chest: 0.0875, shld: 0.1365, neck: 0.1715, jaw: 0.196, cheek: 0.224, brow: 0.245, crown: 0.2625 };

  /* ===== TORSO — compact child-small loft, the dive pitch riding cz per band. ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.091, rz: 0.081, cz: cz.hip,   hex: P.garbDk },
    { y: L.waistY, rx: 0.084, rz: 0.074, cz: cz.waist, hex: P.garb },
    { y: L.chestY, rx: 0.088, rz: 0.077, cz: cz.chest, hex: P.garb },
    { y: L.shldY,  rx: 0.102, rz: 0.070, cz: cz.shld,  hex: P.garbDk },
    { y: L.neckY,  rx: 0.039, rz: 0.035, cz: cz.neck,  hex: P.skinDk },
  ], 8, {});

  /* ===== HEAD — small pointed fey skull loft, watchful/pale. ===== */
  const head = stack([
    { y: L.jawY,   rx: 0.046, rz: 0.053, cz: cz.jaw,   hex: P.skin },
    { y: L.cheekY, rx: 0.060, rz: 0.063, cz: cz.cheek, hex: P.skin },
    { y: L.browY,  rx: 0.056, rz: 0.058, cz: cz.brow,  hex: P.skin },
    { y: L.crownY, rx: 0.042, rz: 0.039, cz: cz.crown, hex: P.hair },
  ], 8, { capTop: { hex: P.hair, lift: 0.018 } });

  /* pointed ears — break the head silhouette (fey read), thin flat quads swept back-and-up */
  for(const s of [-1, 1]){
    const base = V(s * 0.053, L.browY + 0.007, cz.brow + 0.011);
    const tip = V(s * 0.102, L.browY + 0.046, cz.brow - 0.035);
    const mid = V(s * 0.070, L.browY + 0.035, cz.brow - 0.007);
    quad(base, mid, tip, tip, P.skinDk, 0.04);
  }

  /* small dark eyes (watchful, not glaring — flat dots) + a plain closed mouth line */
  for(const s of [-1, 1])
    blob(s * 0.023, L.cheekY + 0.011, cz.cheek + 0.058, 0.011, 0.011, 0.007, P.eye, 4, 2);
  quad(V(-0.021, L.jawY + 0.018, cz.jaw + 0.049), V(0.021, L.jawY + 0.018, cz.jaw + 0.049),
       V(0.016, L.jawY + 0.004, cz.jaw + 0.042), V(-0.016, L.jawY + 0.004, cz.jaw + 0.042), P.mouth, 0.02);

  /* ===== LEGS — drawn up and tucked behind the dive, hips bent, knees pulled toward the body,
     feet trailing (never a standing/dangling pair). Spread wider laterally than r2 (knees/feet
     pushed past the torso's own rx=0.091 hip radius) so the bent-leg shape breaks the torso
     silhouette instead of hiding fully inside it; feet lifted to full skin tone (not skinDk) so
     they carry a small third value beat instead of dissolving into the garb's dark value. ===== */
  for(const s of [-1, 1]){
    const hip = V(s * 0.070, L.hipY - 0.018, cz.hip + 0.018);
    const knee = V(s * 0.145, L.hipY - 0.150, cz.hip - 0.095);
    const foot = V(s * 0.130, L.hipY - 0.200, cz.hip - 0.230);
    tube(hip, knee, 0.038, 0.028, 5, P.garbDk);
    tube(knee, foot, 0.028, 0.017, 5, P.skin, { capB: { hex: P.skin } });
  }

  /* ===== ARMS — leading (left, s=-1) reaching forward-down; trailing (right, s=1) cocked back at
     the hip gripping the needle-sword, ready to drive it forward on contact. ===== */
  const shR = V(0.098, L.shldY - 0.007, cz.shld + 0.011);
  const elR = V(0.137, L.shldY - 0.084, cz.shld - 0.091);
  const wrR = V(0.109, L.hipY + 0.035, cz.hip - 0.035);
  tube(shR, elR, 0.034, 0.027, 5, P.garb);
  tube(elR, wrR, 0.027, 0.018, 5, P.skinDk);
  blob(wrR.x, wrR.y, wrR.z, 0.019, 0.018, 0.019, P.skin, 5, 3);

  const shL = V(-0.098, L.shldY - 0.007, cz.shld + 0.011);
  const elL = V(-0.151, L.shldY - 0.035, cz.shld + 0.105);
  const wrL = V(-0.137, L.shldY - 0.105, cz.shld + 0.228);
  tube(shL, elL, 0.034, 0.027, 5, P.garb);
  tube(elL, wrL, 0.027, 0.016, 5, P.skinDk);
  blob(wrL.x, wrL.y, wrL.z, 0.018, 0.016, 0.018, P.skin, 5, 3);
  for(const d of [[-0.35, 0.10, 0.90], [-0.05, 0.15, 0.98], [0.25, 0.05, 0.92]])
    finger(wrL, d, 0.048, P.skin);

  /* ===== SIGNATURE — the needle-sword, drawn back in the trailing (right) hand, blade cocked
     toward the ground/back ready for a forward thrust; a thin pale blade against dark garb. ===== */
  {
    const grip = wrR.clone();
    const bTip = grip.clone().addScaledVector(V(0.20, -0.44, -0.18), 1);
    const guard = grip.clone().addScaledVector(V(0.011, 0.018, 0.011), 1);
    tube(grip, guard, 0.018, 0.018, 5, P.hilt);
    tube(guard, bTip, 0.015, 0.004, 5, P.blade, { capB: { hex: P.blade } });
    /* a thin cross-guard nub */
    quad(guard.clone().addScaledVector(V(1,0,-1), 0.026), guard.clone().addScaledVector(V(-1,0,1), 0.026),
         guard.clone().addScaledVector(V(-1,0,1), 0.026).add(V(0,0.008,0)), guard.clone().addScaledVector(V(1,0,-1), 0.026).add(V(0,0.008,0)),
         P.bladeDk, 0.03);
  }

  /* ===== SIGNATURE — four dragonfly wings off the shoulder/back, two pairs at different beat
     angles. Mount points sit well clear of the shoulder band and the sword's diagonal (dorsal,
     pushed back and spread laterally) so all four separate from the body AND from each other in
     the squint silhouette, each pair angled opposite to catch a different instant of the same beat
     (law 5's motion-frozen expression). Panes are the model's loudest silhouette element by design
     — larger than any limb.
     R3 CRITIC FIX (self-review of r2's engine render): the r2 dir vectors pointed the spar itself
     almost straight at the dimetric camera (large -z component), so even with a real 3D pane the
     PROJECTED width collapsed to a sliver — only one thin chevron survived, indistinguishable from
     the sword. Spar directions rewritten to spread mostly LATERALLY (large |x|) and vertically
     (large |y|) with only a small z term, so the pane's long axis runs mostly parallel to the
     screen instead of into it; width is now a derived true-perpendicular (see dragonflyWing). ===== */
  {
    const mountY = L.shldY + 0.024, mountZ = cz.shld - 0.070;
    /* fore-wings (larger): left UP-stroke, right DOWN-stroke — the opposed beat */
    dragonflyWing(V(-0.078, mountY, mountZ), [-0.90, 0.40, -0.16], 0.320, 0.155, P.wing, P.wingEdge, P.vein);
    dragonflyWing(V( 0.078, mountY, mountZ), [ 0.90,-0.32, -0.18], 0.320, 0.155, P.wing, P.wingEdge, P.vein);
    /* hind-wings (smaller): both mid-stroke, mounted lower/further back so they clear the fore-wing
       silhouette instead of stacking under it */
    const mountY2 = L.shldY - 0.032, mountZ2 = cz.shld - 0.110;
    dragonflyWing(V(-0.070, mountY2, mountZ2), [-0.94, 0.06, -0.20], 0.225, 0.110, P.wing, P.wingEdge, P.vein);
    dragonflyWing(V( 0.070, mountY2, mountZ2), [ 0.95, 0.10, -0.18], 0.225, 0.110, P.wing, P.wingEdge, P.vein);
  }

  /* base disc (Small, shares the standard r=0.42 tile — the hover clears it by ~0.5u) */
  buildBase(P);
}
