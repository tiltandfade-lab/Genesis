/* dev/model-qa/creatures/rlm-gloom-medusa.js — the MEDUSA landmark table (HUMANOID + SERPENTINE-
   crown family, Medium, CR 6, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000
   tri band (2026-07-08 foundry pilot, gloom-w1 cell 7). Core identity: the gorgon — snake-haired
   petrifier. Bespoke to the render key "medusa" (frame:"medusa" in data/realm-bestiary.js), the
   chassis two gloom reskins ride narratively ("the Gorgon's Daughter" CR6 curator-of-statues,
   "Candlewax Doppelganger" CR6 face-thief) — garnish stays generic/regal so either skin reads.

   FEATURE CHECKLIST (the ~1,300-1,800 budget buys):
     1. HUMANOID torso + robe per ANATOMY-CANON — standing anatomy first: waist/ribs/chest/
        shoulders/neck loft, torqued (cx/cz drift band-to-band) so the spine itself twists toward
        the viewer as it rises, not a flat frontal stack. A flared robe skirt stands in for the
        legs (waist to hem), one foot stepping out through a front slit so the turn reads as a
        STRIDE, not a floating column.
     2. SIGNATURE — 8 hair-snakes, each built per ANATOMY-CANON SERPENTINE ("the raised, S-curved
        neck lifting a distinct wedge head off the coil"): a rise off the scalp, an S-kink arcing
        FORWARD toward the camera, a flattened wedge head, a forked tongue sliver. Every snake
        radius sits >=0.04u per the DIRECTION brief's feature floor. Snake body value is lifted
        clear of the dark robe (law 3) so all 8 read as countable against it.
     3. Mid-reveal sweeping VEIL — a flattened ribbon (thin-tube, not a flat quad, so it reads from
        every turnaround angle) running from the neck, up through the raised hand, trailing off
        past it. A pale lining tone flashes on the last segment — the second high-value beat, the
        motion-in-cloth that sells "just swept aside."
     4. Regal pale face — brow/cheek/jaw wedge skull loft, a thin GOLD circlet band anchoring the
        snake roots at the brow (the "regal" read), closed lidded eyes (petrifying gaze held back,
        not glaring), a short closed mouth line.
     5. Off-arm — lower, bent, hand loose at the hip/robe line: the asymmetric counterweight to the
        raised sweeping arm (law 5's mid-lunge asymmetry, here a mid-turn asymmetry).
     6. Gold sash accent at the waist — a second small regal beat, cheap value/color contrast
        against the plum-black robe.

   POSE SENTENCE: caught mid-reveal, turning her torqued torso and head toward the viewer as her
   raised arm sweeps a dark veil aside from her face, weight rolling onto her forward-stepping
   foot as it breaks through the robe's slit hem, while every one of the eight hair-snakes cranes
   and strains toward the same camera the veil just uncovered her to — never a frontal idol-stance,
   always the half-second of the unveiling itself.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w1'], cell 7, fn buildMedusa). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { buildBase } from '../parts.js';

/* norm(): plain [x,y,z] array -> unit THREE.Vector3 (root+dir authoring, matches specter's idiom) */
function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one finger: two tapering segments, pale base -> nail-pale tip (matches rlm-gloom-specter.js's
   finger() idiom — anatomical hand detail rather than a plain blob). */
function finger(base, dir, len, hex, hexTip){
  const dn = norm(dir);
  const mid = base.clone().addScaledVector(dn, len * 0.55);
  const tip = base.clone().addScaledVector(dn, len);
  tube(base, mid, 0.015, 0.011, 4, hex);
  tube(mid, tip, 0.011, 0.006, 4, hexTip, { capB: { hex: hexTip } });
}

/* one hair-snake: root -> rise (S-curve leg 1) -> fore-kink (S-curve leg 2, arcing toward camera)
   -> flattened wedge head -> forked tongue sliver. Every tube radius floors at the 0.04u law-3
   feature minimum (DIRECTION brief: "snakes at least 0.04u thick each"). */
function snakeHair(root, riseDir, foreDir, riseLen, foreLen, headLen, thick, hexA, hexB, headHex, tongueHex){
  const rn = norm(riseDir), fn = norm(foreDir);
  const mid = V(root.x + rn.x * riseLen, root.y + rn.y * riseLen, root.z + rn.z * riseLen);
  const neckTip = V(mid.x + fn.x * foreLen, mid.y + fn.y * foreLen, mid.z + fn.z * foreLen);
  tube(root, mid, thick, thick * 0.86, 5, hexA);
  tube(mid, neckTip, thick * 0.86, thick * 0.62, 5, hexB);
  /* R3 CRITIC FIX: a head that only continues the neck's taper down to a point reads as a leaf/
     frond tip (this is what r2's engine render actually showed — 8 fronds, not 8 snake heads).
     A real wedge head needs to FLARE wider than the neck first, THEN come to a point — that
     silhouette break plus a hard value jump (pale headHex vs. the mid-green body) is what reads
     as "head" instead of "taper." */
  const headBase = V(neckTip.x + fn.x * headLen * 0.30, neckTip.y + fn.y * headLen * 0.30, neckTip.z + fn.z * headLen * 0.30);
  const snout = V(neckTip.x + fn.x * headLen, neckTip.y + fn.y * headLen, neckTip.z + fn.z * headLen);
  /* R4: the flare wasn't big enough to survive 1/3-res dither (checked against the real capture) —
     the bulge radius is pushed past the neck's OWN root radius (thick*1.15 vs. root's thick*1.0)
     so it reads as a genuine swelling, not a slightly-fatter taper. */
  tube(neckTip, headBase, thick * 0.62, thick * 1.15, 5, headHex, { raz: thick * 0.68, rbz: thick * 0.22 });
  tube(headBase, snout, thick * 1.15, thick * 0.10, 5, headHex,
    { raz: thick * 0.70, rbz: thick * 0.08, capB: { hex: headHex } });
  /* forked tongue — a cheap unmistakable tell (ANATOMY-CANON SERPENTINE). */
  const tLen = headLen * 0.55;
  const side = norm([fn.z, 0, -fn.x]); // perpendicular-ish sliver spread
  const tBase = snout.clone().addScaledVector(fn, 0.01);
  const tTipA = tBase.clone().addScaledVector(fn, tLen).addScaledVector(side, 0.014);
  const tTipB = tBase.clone().addScaledVector(fn, tLen).addScaledVector(side, -0.014);
  quad(tBase, tBase.clone().add(V(0.001, 0.001, 0)), tTipA, tTipA, tongueHex, 0.05);
  quad(tBase, tBase.clone().add(V(-0.001, 0.001, 0)), tTipB, tTipB, tongueHex, 0.05);
}

export function buildMedusa(){
  /* ---------- PALETTE (VS desaturated gloom register; plum-black robe/veil vs pale regal flesh
     and lifted-jade snakes — the two high-value zones law 3 needs). ---------- */
  /* R2 CRITIC FIX (post r1 engine render): the face read as a muddy olive-brown, nearly the same
     value as the snake mass sitting over it — law-3 failure (no legible high-value zone on the
     signature). Skin lifted further pale + the head bands unified to ONE consistently-pale tone
     (r1 alternated skin/skinDk per band, and the darker brow/crown bands happened to dominate the
     camera-facing area). The veil rendered as a near-invisible thread (r1 raz/rbz too thin at this
     camera angle) — thickened substantially and rerouted to sweep OUT laterally instead of nearly
     parallel to the view direction. Snake tones lifted brighter so all 8 separate from the dark
     robe instead of reading as one green canopy blob. */
  const P = {
    robe: 0x2c2334, robeDk: 0x1c1523, robeLt: 0x3d3049,          // plum-black robe
    veilMid: 0x5a4874, veilLine: 0xe4d6ee,                       // sweeping veil (R2: lifted off near-black) + pale lining flash
    skin: 0xf0dfc8, skinDk: 0xd8c2a2, skinSh: 0xb99f83,          // pale regal flesh (lifted, R2)
    gold: 0xceA548, goldDk: 0x8f6c2c,                            // circlet + sash — the regal beat
    snakeA: 0x7aa365, snakeB: 0x5a8049, snakeBelly: 0xe8f5c4, // lifted-jade snakes (R2 brighter; R4: belly pushed near-white for the head flare's value break; snakeHead retired, unused since R3 head-color swap)
    tongue: 0xd44a4a,
    eyeLid: 0x6f5a4e, mouth: 0x241a19,
    disc: 0x2a2530, discTop: 0x342d3b,
  };

  /* ---------- LANDMARKS — torso torques toward the viewer as it rises (cx AND cz drift, not just
     a forward lean): hips near-frontal, shoulders/head rotated toward +x/+z, the turn baked into
     the spine path itself. Robe skirt covers hip->hem; one foot steps through the front slit. ---- */
  const L = {
    hemY: 0.02, kneeY: 0.30, skirtY: 0.46, hipY: 0.62,
    waistY: 0.70, backY: 0.80, ribY: 0.90, chestY: 1.00, shldY: 1.10, neckY: 1.16,
    jawY: 1.20, cheekY: 1.255, browY: 1.32, crownY: 1.38,
    shoulderX: 0.20,
  };
  /* spine torque path — cx/cz per band, hips frontal -> shoulders/head rotated toward the camera */
  const spineCx = { waist: 0.00, back: 0.012, rib: 0.024, chest: 0.038, shld: 0.052, neck: 0.060 };
  const spineCz = { waist: 0.00, back: 0.030, rib: 0.058, chest: 0.088, shld: 0.108, neck: 0.120 };

  /* ===== TORSO — waist up through the twisting spine to the shoulders. ===== */
  const torso = stack([
    { y: L.waistY, rx: 0.150, rz: 0.130, cx: spineCx.waist, cz: spineCz.waist, hex: P.robeDk },
    { y: L.backY,  rx: 0.158, rz: 0.136, cx: spineCx.back,  cz: spineCz.back,  hex: P.robe },
    { y: L.ribY,   rx: 0.168, rz: 0.142, cx: spineCx.rib,   cz: spineCz.rib,   hex: P.robe },
    { y: L.chestY, rx: 0.178, rz: 0.148, cx: spineCx.chest, cz: spineCz.chest, hex: P.robeLt },
    { y: L.shldY,  rx: 0.190, rz: 0.140, cx: spineCx.shld,  cz: spineCz.shld,  hex: P.robe },
    { y: L.neckY,  rx: 0.062, rz: 0.060, cx: spineCx.neck,  cz: spineCz.neck,  hex: P.skinDk },
  ], 10, {});

  /* ===== ROBE SKIRT — flared loft, hip down to a wavy hem near the ground; a real front slit
     (two ring-index columns skipped in the stitch, edges capped) lets one stepping foot break
     through (the stride read, per law 5: never a static idol-column). ===== */
  {
    const n = 10, ph = Math.PI / n;
    const hipRing = ring(V(0, L.hipY, 0.00), V(0, 1, 0), 0.175, 0.150, n, ph);
    const skirtRing = ring(V(0, L.skirtY, 0.01), V(0, 1, 0), 0.255, 0.230, n, ph);
    const kneeRing = ring(V(0, L.kneeY, 0.02), V(0, 1, 0), 0.320, 0.290, n, ph);
    /* uneven flowing hem (regal drape, not tattered — a gentle wave, not jagged rips) */
    const hemY = [0.09, 0.06, 0.02, 0.05, 0.08, 0.10, 0.07, 0.03, 0.05, 0.08];
    const hem = [];
    for(let i = 0; i < n; i++){
      const t = ph + (i / n) * Math.PI * 2;
      hem.push(V(Math.cos(t) * 0.360, hemY[i], 0.02 + Math.sin(t) * 0.330));
    }
    /* the slit sits at the front (+z, indices 0/1 of a phase=PI/10 ring): skip those two columns
       in the lower band so the panel opens, then cap the two cut edges so the slit reads as a
       gap, not a hole into the void. */
    stitch([hipRing, skirtRing], (b) => b ? P.robe : P.robeDk);
    stitch([skirtRing, kneeRing], () => P.robe, { 0: [0, 1] });
    stitch([kneeRing, hem], () => P.robe, { 0: [0, 1] });
    /* slit edge walls — the two cut columns capped so the opening reads as a torn/parted seam */
    for(const i of [0, 1]){
      quad(skirtRing[i], kneeRing[i], hem[i], hem[i], P.robeDk, 0.05);
    }
  }

  /* one foot stepping forward through the hem slit — reads the turning stride; three toe stubs
     so it lands as a bare foot, not a rounded stump. */
  {
    const ankle = V(0.055, 0.075, 0.360);
    const ball = V(0.048, 0.028, 0.470);
    tube(ankle, ball, 0.052, 0.038, 5, P.skinDk, { raz: 0.040, rbz: 0.026 });
    for(const tx of [-0.022, 0, 0.022]){
      const toeA = V(ball.x + tx * 0.6, 0.026, ball.z);
      const toeB = V(ball.x + tx, 0.014, ball.z + 0.055);
      tube(toeA, toeB, 0.014, 0.008, 4, P.skinDk, { capB: { hex: P.skinSh } });
    }
  }

  /* ===== GOLD SASH — a thin regal band at the waist, cheap value/color beat against the robe. */
  {
    const sA = V(0, L.waistY + 0.02, spineCz.waist + 0.02);
    const sB = V(0, L.hipY + 0.03, 0.01);
    tube(sA, sB, 0.020, 0.017, 8, P.gold, { raz: 0.150, rbz: 0.128, phase: Math.PI / 8 });
  }

  /* ===== HEAD — regal skull loft, torqued further toward the viewer than the shoulders (the turn
     completes at the head), a thin gold circlet anchoring the snake roots at the brow. ===== */
  const headCx = 0.068, headCz = 0.155;
  const head = stack([
    { y: L.jawY,   rx: 0.076, rz: 0.082, cx: headCx - 0.01, cz: headCz - 0.01, hex: P.skin },
    { y: L.cheekY, rx: 0.096, rz: 0.100, cx: headCx,        cz: headCz,        hex: P.skin },
    { y: L.browY,  rx: 0.090, rz: 0.092, cx: headCx + 0.006,cz: headCz + 0.01, hex: P.skin },
    { y: L.crownY, rx: 0.070, rz: 0.066, cx: headCx,        cz: headCz - 0.01, hex: P.skinDk },
  ], 8, { capTop: { hex: P.skinDk, lift: 0.018 } });

  /* gold circlet — a thin flattened ring riding the brow band */
  {
    const c = V(headCx + 0.006, L.browY + 0.005, headCz + 0.01);
    const ring1 = ring(c, V(0, 1, 0), 0.096, 0.098, 10, Math.PI / 10);
    const ring2 = ring(V(c.x, c.y + 0.014, c.z), V(0, 1, 0), 0.092, 0.094, 10, Math.PI / 10);
    stitch([ring1, ring2], () => P.gold);
  }

  /* closed lidded eyes — the gaze held back, not glaring; a short closed mouth line. */
  {
    const ey = L.cheekY + 0.02, ez = headCz + 0.088, ecx = headCx;
    for(const s of [-1, 1]){
      quad(V(ecx + s * 0.020, ey + 0.014, ez), V(ecx + s * 0.052, ey + 0.012, ez),
           V(ecx + s * 0.050, ey - 0.006, ez - 0.004), V(ecx + s * 0.018, ey - 0.008, ez - 0.004), P.eyeLid, 0.03);
    }
    quad(V(ecx - 0.026, L.jawY + 0.028, ez + 0.006), V(ecx + 0.026, L.jawY + 0.028, ez + 0.006),
         V(ecx + 0.020, L.jawY + 0.012, ez), V(ecx - 0.020, L.jawY + 0.012, ez), P.mouth, 0.02);
  }

  /* ===== SIGNATURE — 8 hair-snakes off the crown, every one straining forward toward the camera
     that the veil just uncovered her to. Roots scattered around the crown ring (front pair
     lowest/shortest — nearest the viewer already — back-center riser tallest, arcing furthest).
     R2 CRITIC FIX: r1's 8 strands overlapped into one green canopy blob in the 45-degree capture
     — the rise legs all leaned inward toward camera-forward at similar angles. Widened the lateral
     (x) rise magnitude on every strand so the crown fans out sideways FIRST before any strand
     kinks forward, breaking the projected silhouette into countable individual heads (law 1). */
  {
    const c = V(headCx, L.crownY + 0.01, headCz - 0.01);
    /* R4: hl (head length) raised ~55-65% across the board — the flare-then-point head zone needs
       to occupy a real share of each strand's silhouette to survive the 1/3-res engine capture;
       the r3 render's bulge was geometrically real but too small a fraction of the strand to see. */
    const roots = [
      { o: [-0.078, 0.00, 0.048], rise: [-0.65, 0.95, 0.10], fore: [-0.30, -0.05, 1.0], rl: 0.22, fl: 0.18, hl: 0.120 },
      { o: [ 0.078, 0.00, 0.048], rise: [ 0.65, 0.95, 0.10], fore: [ 0.30, -0.05, 1.0], rl: 0.22, fl: 0.18, hl: 0.120 },
      { o: [ 0.000, 0.02, 0.085], rise: [ 0.10, 1.0, 0.20], fore: [ 0.05, -0.30, 1.0], rl: 0.28, fl: 0.24, hl: 0.140 },
      { o: [-0.100, 0.01,-0.010], rise: [-0.90, 0.80,-0.10],fore: [-0.45, -0.05, 0.85], rl: 0.24, fl: 0.20, hl: 0.125 },
      { o: [ 0.100, 0.01,-0.010], rise: [ 0.90, 0.80,-0.10],fore: [ 0.45, -0.05, 0.85], rl: 0.24, fl: 0.20, hl: 0.125 },
      { o: [-0.066, 0.03,-0.080], rise: [-0.75, 0.70,-0.35], fore: [-0.35, -0.10, 0.90], rl: 0.26, fl: 0.21, hl: 0.128 },
      { o: [ 0.066, 0.03,-0.080], rise: [ 0.75, 0.70,-0.35], fore: [ 0.35, -0.10, 0.90], rl: 0.26, fl: 0.21, hl: 0.128 },
      { o: [ 0.000, 0.06,-0.052], rise: [ 0.00, 1.0, -0.45], fore: [ 0.00, -0.35, 1.0], rl: 0.34, fl: 0.28, hl: 0.150 },
    ];
    roots.forEach((r, i) => {
      const root = V(c.x + r.o[0], c.y + r.o[1], c.z + r.o[2]);
      const thick = 0.046 + (i % 3) * 0.004; // >= the 0.04u feature floor, slight per-strand variety
      const bodyA = (i % 2) ? P.snakeA : P.snakeB;
      const bodyB = (i % 2) ? P.snakeB : P.snakeA; // R3: alternate WITHIN a strand too, not just across strands
      /* R3 CRITIC FIX: headHex swapped from the palette's old snakeHead tone (a mid-tone barely lighter than the body —
         the r2 render's 8 heads never separated from the canopy) to P.snakeBelly, the palette's
         unused pale-jade tone. Combined with the new flare-then-point head shape, this is what
         actually breaks the "leafy bush" read into 8 legible pale wedge heads against dark-green
         necks — law 3's value contrast landing ON the signature, not near it. */
      snakeHair(root, r.rise, r.fore, r.rl, r.fl, r.hl, thick, bodyA, bodyB, P.snakeBelly, P.tongue);
      /* every snake gets a small dark eye dot now (was 3 of 8) — cheap per-strand tell that sells
         "these are heads," not just brighter frond tips. */
      const rn = norm(r.rise), fn = norm(r.fore);
      const headBase = V(root.x + rn.x * r.rl + fn.x * r.fl, root.y + rn.y * r.rl + fn.y * r.fl, root.z + rn.z * r.rl + fn.z * r.fl);
      blob(headBase.x, headBase.y + 0.01, headBase.z, 0.010, 0.010, 0.010, P.mouth, 4, 2);
    });
  }

  /* ===== ARMS. Right (leading, screen +x): raised high, sweeping the veil away from the face.
     Left (trailing/off-arm): lower, bent, hand loose at the hip — the asymmetric counterweight. */
  {
    const shR = V(L.shoulderX + spineCx.shld, L.shldY - 0.01, 0.10 + spineCz.shld);
    const elR = V(0.34, 1.28, 0.16);
    const wrR = V(0.36, 1.46, 0.24);
    tube(shR, elR, 0.056, 0.046, 6, P.robe);
    tube(elR, wrR, 0.044, 0.030, 6, P.skinDk);
    blob(wrR.x, wrR.y, wrR.z, 0.036, 0.030, 0.034, P.skin, 6, 4);
    /* fingers gripping the veil edge — fanned forward-and-up, matching the sweep direction */
    for(const d of [[-0.35, 0.30, 0.85], [-0.10, 0.40, 0.90], [0.15, 0.35, 0.90], [0.38, 0.20, 0.75]])
      finger(wrR, d, 0.075, P.skin, P.skinSh);

    const shL = V(-L.shoulderX + spineCx.shld * 0.5, L.shldY - 0.02, 0.06 + spineCz.shld * 0.5);
    const elL = V(-0.28, 0.86, 0.14);
    const wrL = V(-0.22, 0.68, 0.10);
    tube(shL, elL, 0.054, 0.044, 6, P.robe);
    tube(elL, wrL, 0.042, 0.030, 6, P.skinDk);
    blob(wrL.x, wrL.y, wrL.z, 0.034, 0.028, 0.032, P.skin, 6, 4);
    /* fingers loose, curling down at the hip — the relaxed off-hand */
    for(const d of [[-0.30, -0.55, 0.55], [-0.08, -0.65, 0.60], [0.16, -0.60, 0.58], [0.36, -0.45, 0.50]])
      finger(wrL, d, 0.065, P.skin, P.skinSh);
  }

  /* ===== VEIL — a flattened-tube ribbon (reads from every turnaround angle, not a one-sided
     quad): root near the neck (where it was pinned over the face), rising through the sweeping
     hand, trailing off past it. Final segment lifts to the pale lining tone — the flash of cloth
     mid-motion, law 3's second high-value beat.
     R2 CRITIC FIX: r1's veil vanished — the true bug was VALUE, not size (root/mid tone at
     0x241a2e sat almost the same near-black as the robe/void, so a geometrically-real ribbon read
     as a hairline). Lifted the whole ribbon to a lit mid-plum -> pale-lilac ladder, widened the
     raz/rbz cross-section further, and swept the path more LATERALLY (bigger x delta, flatter z)
     so it doesn't run near-parallel to the 45-degree capture camera and foreshorten to a thread. */
  {
    /* R3 CRITIC FIX: a smooth straight taper-to-a-thin-point read unmistakably as a held blade
       (a rapier), not swept cloth — the strongest false read in the r2 render. Cloth doesn't
       taper to a point; it curls and flutters and stays WIDE at the trailing edge. Kept the
       neck->wrist run (that part reads fine — it's the arm's "gripped fabric" segment) but swapped
       the trailing run for a curled path (p3 kicks back in z) ending in a WIDENING flare instead
       of a point (last raz > the segment before it), so the tip reads as a ruffled edge. */
    const root = V(-0.06, L.neckY + 0.03, spineCz.neck + 0.10);
    const p1 = V(0.22, 1.08, 0.22);
    const p2 = V(0.44, 1.44, 0.20); // meets the raised right wrist
    const p3 = V(0.66, 1.53, 0.08);
    const p4 = V(0.80, 1.47, -0.14); // trailing flutter — curls back toward the body, doesn't spear outward
    tube(root, p1, 0.095, 0.084, 6, P.veilMid, { raz: 0.040, rbz: 0.034 });
    tube(p1, p2, 0.084, 0.068, 6, P.veilMid, { raz: 0.034, rbz: 0.028 });
    tube(p2, p3, 0.068, 0.052, 6, P.veilLine, { raz: 0.028, rbz: 0.018 });
    tube(p3, p4, 0.052, 0.046, 6, P.veilLine, { raz: 0.060, rbz: 0.012, capB: { hex: P.veilLine } });
  }

  /* base disc (Medium: r=0.42) */
  buildBase(P);
}
