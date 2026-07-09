/* dev/model-qa/creatures/rlm-frontier-assassin.js — the ASSASSIN landmark table (HUMANOID
   family — PRONE, the one sanctioned horizontal humanoid per ANATOMY-CANON, Medium, CR 3, realm
   frontier), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot,
   frontier-w1 cell 11). Core identity: the Ridge-Line Sniper — a patient half-mile ridge killer
   who waits days for one clean shot. Bespoke to the render key "assassin" — the frontier reskin
   (Ridge-Line Sniper, data/realm-bestiary.js) rides this chassis narratively (dust-hide trim,
   long rifle in place of a hand crossbow — not a re-model).

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. Full-length PRONE line — the whole body lies flat along the ground (the sanctioned
        horizontal humanoid), a low flat spine arc from hip to shoulder, never a folded/kneeling
        silhouette. This IS the core identity read.
     2. SIGNATURE — a long bipod-braced rifle reaching forward well past the head (law 4's one
        loud exaggerated feature, taken straight off the flavor line: the half-mile ridge shot).
     3. Both elbows planted forward on the ground bearing the weight, bent per POSE-ANATOMY (never
        straight sticks), cheek welded to the shouldered stock.
     4. One knee drawn up and splayed out to the side for stability (the frog-leg prone brace);
        the other leg trails straight-ish behind with a slight knee bend — distinct L/R leg
        silhouettes, never a symmetric double-straight pair.
     5. Hat off, set beside the boot — bare head, pale skin/face high-value patch (law 3) against
        the dusty cloak.
     6. Dust-worn cloak/wrap value ladder (tan/khaki lit patches against darker hide trim) riding
        the low arc hip-to-shoulder, plus the rifle's near-white steel — the law-3 high-value
        zones the direction calls out (barrel + hat + hands/face).

   POSE SENTENCE: full-length prone on the ground, cheek welded to the rifle stock, both elbows
   planted forward bearing the weight, one knee drawn up and splayed for stability while the other
   leg trails straight behind, the long bipod-braced barrel reaching out past a head lifted just
   enough to sight down it, hat off beside the boot — the held breath before one clean shot.

   SPINE-GESTURE SENTENCE: the spine runs a low flat arc from the hips up through gently rising
   shoulders to a head lifted just enough to sight down the barrel — never a plumb line; the whole
   figure reads as one long low forward-reaching gesture, continued past the skull by the rifle
   itself. (POSE-ANATOMY rule 4 "counterpose or fall over" is N/A here — the body is fully
   ground-supported along its length, not balanced on one leg; the asymmetric splayed knee still
   keeps the pose from reading as a stiff symmetric plank.)

   Whole-object grammar: one function, one geometry frame, no anchors. Body lies along +z (the
   rifle's aim direction is the "front"), up +y, ground y=0. Imported by ps1-sheet.html
   (SETS['frontier-w1'], cell 11, fn buildAssassin). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildAssassin(){
  /* ---------- PALETTE (dust-tan cloak/wrap value ladder vs. darker hide trim; pale sun-worn
     skin for the bare head/hands high-value zone; near-white steel on the rifle so the barrel
     survives dithering at 1/3-res per law 3). ---------- */
  /* R3 SELF-CORRECTION (post r2 engine render): r2's height fix broke the tile plane, but every
     segment still shared one warm tan/brown hue family — hip, legs, and torso fused into one
     boulder-shaped blob with no readable body-part separation. The performer figure in this same
     set proves the fix: distinct HUES per segment (skin/shirt/trouser/shoe) read as a body even
     compressed to a few dozen px; a single-hue value ladder does not. Split legs into a cool
     grey-drab trouser tone (against the warm tan cloak torso + pale skin) so hip/torso/leg/boot
     separate at a glance. */
  const P = {
    cloak: 0x9c8a5e, cloakDk: 0x6a5e40, cloakLt: 0xc4b184,   // dust-tan canvas/cloak ladder, lifted for the void
    hide: 0x4a3c28, hideDk: 0x2e2418,                          // dark leather trim/wraps (belt, knife, hat)
    trouser: 0x565c4a, trouserDk: 0x363c2e,                   // cool grey-drab trousers — the leg-vs-torso hue split
    skin: 0xdcb886, skinDk: 0xa87c4c,                          // sun-worn pale skin, hands/face — pushed toward the law-3 floor
    hair: 0x241a10, eye: 0x140f0c,
    boot: 0x3c3226, bootDk: 0x241e18,
    hat: 0x5c4c34, hatDk: 0x2e2418, hatLt: 0x8a7550,
    stock: 0x6e5030, stockDk: 0x483420,                        // rifle wood
    steel: 0xdadcd0, steelDk: 0x92968a,                        // rifle steel, near-white so the long barrel survives dithering
    disc: 0x4a4030, discTop: 0x584a38,
  };

  /* ===== RIG — the low flat spine arc, authored FIRST as a transform so every part hangs off
     it (POSE-ANATOMY rule 1). Reuses stack()'s vertical-band convention but remaps it prone:
     the band's local "y" (0 at hip .. crown near the far end) becomes world Z (distance along
     the ground the body lies on); the local "z" (front/back torso thickness) becomes world Y
     (height off the ground — a propped chest/shoulders read as literal vertical lift here);
     local "x" (side width) stays world X unchanged. ===== */
  const L = {
    hipY: 0.00, waistY: 0.14, ribY: 0.30, chestY: 0.46, shldY: 0.58, neckY: 0.66,
    jawY: 0.70, cheekY: 0.735, browY: 0.77, crownY: 0.80,
  };
  const zBase = -0.20;
  /* R2 SELF-CORRECTION (post r1 engine render): r1's near-flat arc (0.07→0.13) read as a
     ground-hugging smear — the exact cable-snake-splice failure (docs/MODEL-FOUNDRY.md evidence
     base): from the 30°-elevation dimetric camera a body that thin in Y disappears into the
     tile. Fixed the same way the coil fixed it — reared the chest/shoulders/head up MUCH higher
     (hip 0.07 stays low and truly prone; by the head it's climbed to ~0.28, a real elbows-
     propped-high sniper lean) so the figure actually breaks the tile plane and reads as a body,
     not a stain. Also shortened the total z-reach (legs pulled in, rifle shortened) so the
     auto-fit camera doesn't zoom out so far the figure goes tiny. */
  const proneArc = (t) => 0.066 + 0.215 * Math.pow(Math.max(0, t), 1.5);
  const prone = (p) => {
    const t = p.y / L.crownY;
    return V(p.x, proneArc(t) + p.z, zBase + p.y);
  };

  /* ===== TORSO — low flat prone arc, dust-tan cloak over dark hide trim. ===== */
  /* R3 also thinned the torso itself (rx/rz pulled in another ~20%) — the earlier boulder-round
     cross-section was competing with the rifle/head/legs for the read; a slimmer torso lets the
     signature (rifle) and the extremities (pale head, trouser legs, lit hat) carry the silhouette
     instead of one dominant mass swallowing them. */
  const torso = stack([
    { y: L.hipY,   rx: 0.082, rz: 0.056, hex: P.trouserDk },
    { y: L.waistY, rx: 0.076, rz: 0.048, hex: P.hide },
    { y: L.ribY,   rx: 0.088, rz: 0.054, hex: P.cloak },
    { y: L.chestY, rx: 0.096, rz: 0.060, hex: P.cloakLt },
    { y: L.shldY,  rx: 0.102, rz: 0.064, hex: P.cloak },
    { y: L.neckY,  rx: 0.052, rz: 0.046, hex: P.skinDk },
  ], 9, { xform: prone });

  /* dust-worn cloth strip accents on the back — a light echo of camouflage break-up, secondary
     to the signature (law 1: real countable features, not padding). */
  {
    const spots = [
      [0.06, L.ribY, 0.084], [-0.07, L.chestY, 0.086], [0.03, L.waistY, 0.070],
    ];
    for(const [x, y, rz] of spots){
      const c = prone(V(x, y, rz));
      const tip = prone(V(x * 1.3, y - 0.05, rz + 0.03));
      quad(V(c.x - 0.022, c.y, c.z), V(c.x + 0.022, c.y, c.z), V(tip.x + 0.014, tip.y, tip.z), V(tip.x - 0.014, tip.y, tip.z), P.cloakDk, 0.06);
    }
  }

  /* ===== HEAD — bare, lifted just enough to sight down the barrel, cheek pressed toward the
     rifle. Continues the same prone() arc past the neck. ===== */
  const jawC = prone(V(0, L.jawY, 0.070));
  const cheekC = prone(V(0, L.cheekY, 0.078));
  const browC = prone(V(0, L.browY, 0.066));
  const crownC = prone(V(0, L.crownY, 0.044));
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.066, 0.070, 8, Math.PI / 8),
    ring(cheekC, V(0, 1, 0), 0.074, 0.078, 8, Math.PI / 8),
    ring(browC, V(0, 1, 0), 0.066, 0.062, 8, Math.PI / 8),
    ring(crownC, V(0, 1, 0), 0.046, 0.044, 8, Math.PI / 8),
  ];
  stitch(headRings, (b) => [P.skinDk, P.skin, P.skin][b] ?? P.skinDk);
  capFan(headRings[3], crownC.clone().add(V(0, 0.014, -0.01)), P.hair);

  /* tight-shut aiming eye + squint line, no open mouth (silent, focused) */
  {
    const p = browC.clone().add(V(0.026, -0.012, 0.028));
    quad(V(p.x - 0.016, p.y, p.z), V(p.x + 0.016, p.y, p.z), V(p.x + 0.014, p.y + 0.008, p.z + 0.006), V(p.x - 0.014, p.y + 0.008, p.z + 0.006), P.eye, 0.04);
    const q = jawC.clone().add(V(0, 0.024, 0.056));
    quad(V(q.x - 0.018, q.y, q.z), V(q.x + 0.018, q.y, q.z), V(q.x + 0.014, q.y - 0.008, q.z + 0.004), V(q.x - 0.014, q.y - 0.008, q.z + 0.004), P.skinDk, 0.05);
  }

  /* short cropped hair cap */
  blob(crownC.x, crownC.y + 0.006, crownC.z - 0.006, 0.044, 0.024, 0.044, P.hair, 6, 3);

  /* ===== LEGS — one drawn-up-and-splayed knee (the frog-leg prone brace), one trailing
     straight-ish behind with a slight knee bend. Both attach off the hip ring. ===== */
  function leg(hip, knee, ankle, toeDir, hex, hexDk){
    tube(hip, knee, 0.070, 0.052, 7, hex);
    tube(knee, ankle, 0.052, 0.036, 7, hexDk, { phase: Math.PI / 7 });
    const ball = ankle.clone().addScaledVector(toeDir, 0.080).add(V(0, -0.004, 0));
    const heel = ankle.clone().addScaledVector(toeDir, -0.032).add(V(0, -0.002, 0));
    tube(ankle, ball, 0.036, 0.032, 6, P.boot);
    tube(ankle, heel, 0.028, 0.024, 5, P.boot, { capB: { hex: P.bootDk } });
    capFan(ring(ball, V(0, 1, 0), 0.030, 0.026, 6), ball.clone().addScaledVector(toeDir, 0.02), P.bootDk);
  }
  /* trailing leg (left) — extended back, slight knee bend, not dead-straight (R2: shortened;
     R3: recolored to the cool trouser hue so it splits from the warm torso/hip; CRITIC R2: pulled
     the ankle in another ~0.06 — the old reach was the single biggest contributor to a bbox
     stretch that forced the auto-fit camera to zoom out so far the whole pose dissolved) */
  leg(
    V(-0.085, 0.070, zBase - 0.02), V(-0.100, 0.050, zBase - 0.13), V(-0.088, 0.034, zBase - 0.24),
    V(-0.05, 0, -0.99).normalize(), P.trouser, P.trouserDk
  );
  /* drawn-up leg (right) — knee kicked OUT and forward, foot folded back (POSE-ANATOMY: legs
     bend at the knee same as arms) (R2: pulled in; R3: recolored) */
  leg(
    V(0.085, 0.070, zBase + 0.02), V(0.255, 0.095, zBase + 0.16), V(0.180, 0.044, zBase - 0.01),
    V(-0.55, 0, -0.84).normalize(), P.trouser, P.trouserDk
  );

  /* ===== ARMS — both elbows planted forward on the ground bearing the weight (bent per
     POSE-ANATOMY rule 2 — never a straight stick), shoulders riding low with the prone arc. ===== */
  const shC = prone(V(0, L.shldY - 0.02, 0.02));
  function arm(sh, el, wr, hex, hexDk){
    tube(sh, el, 0.052, 0.040, 6, hex);
    tube(el, wr, 0.040, 0.030, 6, hexDk, { phase: Math.PI / 6 });
    blob(wr.x, wr.y, wr.z, 0.026, 0.022, 0.026, P.skin, 5, 3);
    return wr;
  }
  /* support arm (left) — elbow planted, hand up on the foregrip (R2: shortened reach) */
  const wrL = arm(
    V(shC.x - 0.11, shC.y, shC.z), V(-0.145, 0.048, shC.z + 0.09), V(-0.028, 0.076, shC.z + 0.17),
    P.cloak, P.cloakDk
  );
  /* trigger arm (right) — elbow planted, hand at the grip near the cheek (R2: shortened reach) */
  const wrR = arm(
    V(shC.x + 0.11, shC.y, shC.z), V(0.135, 0.044, shC.z + 0.06), V(0.030, 0.088, shC.z + 0.11),
    P.cloak, P.cloakDk
  );

  /* ===== SIGNATURE — the long bipod-braced rifle, gripped at both hands, reaching forward well
     past the head. Wood stock into near-white steel barrel so the law-3 floor holds. ===== */
  {
    /* R3: lifted clear of the (now slimmer) torso mass and lengthened again so the barrel reads
       as its own long bright line rather than merging into the cloak silhouette.
       CRITIC R2 (this pass, post r4 engine render): the render showed the whole figure reading as
       a single dark blob with NO visible bright signature line — the barrel/scope radii (0.017-
       0.026) sat AT or UNDER the law-3 0.04u floor and dissolved completely at 1/3-res+dither.
       Thickened every steel segment well clear of the floor and made the barrel one unbroken pure-
       steel tube (dropped the darker steelDk wrap band that was muddying its value) so the
       signature reads as a solid bright line even zoomed out. */
    const stockButt = jawC.clone().add(V(0.012, 0.028, -0.03));
    const grip = wrR.clone().add(V(-0.01, 0.020, 0.01));
    const foreEnd = wrL.clone().add(V(0.01, 0.018, 0.01));
    const muzzle = V(0.00, foreEnd.y + 0.048, foreEnd.z + 0.22);
    tube(stockButt, grip, 0.052, 0.040, 6, P.stock, { capA: { hex: P.stockDk } });
    tube(grip, foreEnd, 0.038, 0.034, 6, P.stockDk);
    tube(foreEnd, muzzle, 0.036, 0.028, 6, P.steel, { capB: { hex: P.steel } });
    /* scope — small tube riding above the grip/stock, near-white lens caps (thickened past floor) */
    const scA = stockButt.clone().add(V(0, 0.052, 0.04));
    const scB = grip.clone().add(V(0, 0.052, 0.08));
    tube(scA, scB, 0.026, 0.024, 6, P.steelDk, { capA: { hex: P.steel }, capB: { hex: P.steel } });
    /* bipod — two thin legs from the foregrip down to the ground, braced for the long wait */
    const bipodTop = foreEnd.clone().add(V(0, -0.01, 0.02));
    for(const s of [-1, 1]){
      const foot = V(s * 0.075, 0.006, bipodTop.z + 0.05);
      tube(bipodTop, foot, 0.014, 0.009, 4, P.steelDk, { capB: { hex: P.steelDk } });
    }
  }

  /* ===== BELT KNIFE — sheathed at the hip (the sniper's close-in backup). ===== */
  {
    const hipC = prone(V(0.095, L.hipY + 0.03, 0.06));
    const sheathTip = hipC.clone().add(V(0.03, -0.01, 0.09));
    tube(hipC, sheathTip, 0.020, 0.010, 5, P.hideDk, { capB: { hex: P.hideDk } });
    blob(hipC.x - 0.01, hipC.y + 0.01, hipC.z - 0.01, 0.018, 0.014, 0.018, P.hide, 4, 2);
  }

  /* ===== HAT — off, set beside the trailing boot, brim flat toward the ground (a high-value
     patch: the crown catches light where the body doesn't). ===== */
  {
    // CRITIC R2: pulled in from zBase-0.38 (brim reached to zBase-0.495, the single biggest bbox
    // outlier at ~0.7u total z-span) to sit snug beside the now-shorter trailing boot, and
    // shrank the brim — the hat is a minor prop, not owed the biggest reach in the model.
    const c = V(-0.17, 0.018, zBase - 0.26);
    const crownR = [
      ring(c, V(0, 1, 0), 0.070, 0.068, 8),
      ring(c.clone().add(V(0, 0.045, 0)), V(0, 1, 0), 0.048, 0.046, 8),
    ];
    stitch(crownR, () => P.hat);
    capFan(crownR[1], c.clone().add(V(0, 0.05, 0)), P.hatLt);
    const brimN = 10;
    for(let i = 0; i < brimN; i++){
      const a = (i / brimN) * Math.PI * 2, a2 = ((i + 1) / brimN) * Math.PI * 2;
      const rIn = 0.072, rOut = 0.095;
      quad(
        V(c.x + Math.cos(a) * rIn, c.y + 0.004, c.z + Math.sin(a) * rIn),
        V(c.x + Math.cos(a) * rOut, c.y, c.z + Math.sin(a) * rOut),
        V(c.x + Math.cos(a2) * rOut, c.y, c.z + Math.sin(a2) * rOut),
        V(c.x + Math.cos(a2) * rIn, c.y + 0.004, c.z + Math.sin(a2) * rIn),
        P.hatDk, 0.05
      );
    }
  }

  /* ===== BASE DISC (Medium: r=0.42) ===== */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
