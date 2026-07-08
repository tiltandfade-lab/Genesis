/* dev/model-qa/creatures/rlm-gloom-yuan-ti-abomination.js — the YUAN-TI ABOMINATION landmark
   table (SERPENTINE + HUMANOID-torso family, Large, CR 8, realm gloom), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot, gloom-w2 cell 11).
   Core identity: a dozen willing bodies of a coven fused at the altar into one thing — one
   prayer. A giant serpent-bodied abomination with a humanoid torso and multiple arms. Bespoke
   to the render key "yuan-ti-abomination" — realm reskins ride this chassis narratively.

   FEATURE CHECKLIST (the ~1,600-1,900 budget buys):
     1. SERPENTINE coiled base per ANATOMY-CANON — one continuous tapered D-cross-section tube,
        pre-coiled on the disc (2-3 stacked loops, an inner loop tucked UNDER an outer one),
        near-constant girth through the front two-thirds then a late taper to a fine tail tip
        (never a carrot cone). Large size, base disc r=0.55.
     2. HUMANOID torso rising from the coil where the tube widens to shoulders (the naga splice
        per ANATOMY-CANON) — reared to full height, torqued upright out of the coil rather than
        stacked flat, so the whole figure reads as RISING, not resting.
     3. SIGNATURE — FOUR arms spread wide in benediction, two raised high and two spread level,
        every palm open toward the viewer (law 4's one loud exaggerated feature: a fused coven
        praying with every hand it has left).
     4. Head thrown back, throat bared, jaw dropped — the ecstatic/agonized prayer-face, never a
        level neutral stare (law 5's high-expression pose completing at the head).
     5. Pale belly-scale ladder climbing the coil's underside up onto the visible torso panels —
        the high-value zone law 3 needs, set against a dark scale body so it reads as a rising
        ladder of light from disc to throat.
     6. Fused-coven detail — a ring of small pale humanoid faces pressed into the upper coil
        scales just below the torso splice (the dozen willing bodies still dimly visible in the
        one thing they became), cheap countable tells that sell the "fused congregation" flavor
        without a body-budget spend.

   POSE SENTENCE: reared to its full height out of a tight double coil, torso torqued upward and
   thrown back at the throat as if mid-ecstatic invocation, all four arms flung wide overhead and
   to the sides in open-palmed benediction, never a resting coil or a level idle stare — the
   moment the prayer is answered.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 11, fn buildYuanTiAbomination). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one arm: shoulder -> elbow -> wrist, capped with a spread-fingered open palm (benediction, not
   a fist) — matches medusa/vampire-spawn's finger() idiom, palm always opens toward the viewer. */
function armBenediction(sh, el, wr, spreadDirs, hexUpper, hexLower, palmHex, fingerHex){
  tube(sh, el, 0.062, 0.050, 6, hexUpper);
  tube(el, wr, 0.048, 0.032, 6, hexLower);
  blob(wr.x, wr.y, wr.z, 0.038, 0.032, 0.036, palmHex, 6, 4);
  for(const d of spreadDirs){
    const dn = norm(d);
    const mid = wr.clone().addScaledVector(dn, 0.05);
    const tip = wr.clone().addScaledVector(dn, 0.095);
    /* CRITIC FIX (pass-2): thickened toward the vampire-spawn finger() idiom (0.021/0.015/0.007)
       so the taper clears the law-3 ~0.04u floor instead of dissolving to a needle. */
    tube(wr, mid, 0.019, 0.014, 4, palmHex);
    tube(mid, tip, 0.014, 0.007, 4, fingerHex, { capB: { hex: fingerHex } });
  }
}

export function buildYuanTiAbomination(){
  /* ---------- PALETTE (VS desaturated gloom register; dark scale body vs. a pale belly-scale
     ladder + pale fused faces — the high-value zones law 3 needs). ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): the whole body read as one uniform dark-green
     mass with no ladder visible at all — scale/torso lifted a step (still reads dark vs. the
     void, per the vampire-spawn lesson) and belly pushed to near-white so the surface-riding
     patches (fixed above) actually separate at 1/3-res. */
  const P = {
    scale: 0x4c5c48, scaleDk: 0x323e2e, scaleLt: 0x5e7256,     // coven-serpent scale, lifted off void
    belly: 0xece4c4, bellyDk: 0xcac094,                        // pale belly-scale ladder — the value spine, near-white
    torso: 0x546450, torsoLt: 0x687c5e,                        // humanoid torso panels, echoing scale but lifted
    skin: 0xd8cdb0, skinDk: 0xaa9c82,                          // fused-face flesh + arm flesh, lifted for head/palm pop
    faceDk: 0x746a54,                                          // sunken fused-face shadow
    mouth: 0x1c1512, tongue: 0x8a2f2f,
    eye: 0x120e0c, eyeGlow: 0xb8c468,                          // dull yeuan-ti gaze
    disc: 0x2a2620, discTop: 0x342f27,
  };

  /* ===== COIL — double loop, inner loop tucked under the outer (ANATOMY-CANON: "a coil reads as
     a coil only when an inner loop tucks UNDER an outer one"). Near-constant girth front two-
     thirds, late taper to a fine tail tip; D-cross-section (flat belly underside via a pale belly
     strip riding the top of the underside band). ===== */
  const outerY = 0.23, innerY = 0.16;
  const outerPts = [
    V(0.44, outerY, 0.20), V(0.50, outerY + 0.02, -0.16), V(0.30, outerY + 0.03, -0.46),
    V(-0.10, outerY + 0.02, -0.50), V(-0.42, outerY, -0.22), V(-0.46, outerY - 0.02, 0.14),
  ];
  const outerRad = [0.195, 0.205, 0.195, 0.175, 0.150, 0.125];
  const innerPts = [
    V(-0.46, innerY, 0.14), V(-0.18, innerY - 0.01, 0.38), V(0.16, innerY, 0.42),
    V(0.40, innerY + 0.01, 0.24),
  ];
  const innerRad = [0.125, 0.100, 0.075, 0.050];
  for(let i = 0; i < outerPts.length - 1; i++){
    const hex = (i % 2 === 0) ? P.scale : P.scaleDk;
    tube(outerPts[i], outerPts[i + 1], outerRad[i], outerRad[i + 1], 9, hex, { phase: Math.PI / 9 });
  }
  for(let i = 0; i < innerPts.length - 1; i++){
    const hex = (i % 2 === 0) ? P.scaleDk : P.scale;
    tube(innerPts[i], innerPts[i + 1], innerRad[i], innerRad[i + 1], 8, hex, { phase: Math.PI / 8 });
  }
  /* tail tip — fine late taper off the inner loop's thin end */
  tube(innerPts.at(-1), V(0.58, innerY + 0.03, 0.10), innerRad.at(-1), 0.016, 6, P.scaleDk, { capB: { hex: P.scaleDk } });

  /* R2 SELF-CORRECTION (post r1 engine render): r1's belly rungs were flat quads centered ON the
     coil's own centerline — mostly buried INSIDE the solid tube mesh, so the pale value law 3
     needs never reached the surface (the r1 capture reads as one uniform dark-green blob, no
     ladder at all). Rebuilt as patches pushed OUT along the coil's actual surface normal
     (up-and-toward-camera, +z) by ~0.8x the local tube radius — same trick as the constrictor's
     proven wet-sheen strip — so they sit proud on the surface instead of drowning in it. Also
     bumped P.belly toward near-white and enlarged the patches so they survive 1/3-res. */
  const beltPatch = (c, r, hex) => {
    const p = V(c.x, c.y + r * 0.35, c.z + r * 0.85);
    const w = r * 0.85, h = r * 0.9;
    quad(V(p.x - w, p.y - h * 0.4, p.z), V(p.x + w, p.y - h * 0.4, p.z),
         V(p.x + w * 0.7, p.y + h * 0.6, p.z + r * 0.15), V(p.x - w * 0.7, p.y + h * 0.6, p.z + r * 0.15), hex, 0.04);
  };
  for(let i = 0; i < outerPts.length; i++) beltPatch(outerPts[i], outerRad[i], (i % 2 === 0) ? P.belly : P.bellyDk);
  for(let i = 0; i < innerPts.length; i++) beltPatch(innerPts[i], innerRad[i], (i % 2 === 0) ? P.bellyDk : P.belly);

  /* ===== FUSED-COVEN DETAIL — a ring of small pale faces pressed into the upper coil scales just
     below the torso splice, the dozen bodies still dimly visible in the one thing they became. ===== */
  {
    const faceSpots = [
      V(0.30, outerY + 0.16, -0.02), V(-0.10, innerY + 0.14, 0.20), V(0.02, outerY + 0.20, -0.30),
    ];
    for(const c of faceSpots){
      blob(c.x, c.y, c.z, 0.032, 0.038, 0.018, P.skin, 5, 3);
      blob(c.x, c.y + 0.006, c.z + 0.012, 0.010, 0.008, 0.006, P.faceDk, 4, 2);
    }
  }

  /* ===== RISE — the serpent tube widens and climbs from the coil's front-high point up to the
     humanoid splice, torqued so it reads as REARING (not a straight vertical pillar). ===== */
  const rise = {
    root: V(0.14, outerY + 0.06, 0.14),
    r1: V(0.16, 0.42, 0.10),
    r2: V(0.10, 0.74, 0.02),
    splice: V(0.04, 1.02, -0.04),
  };
  tube(rise.root, rise.r1, 0.185, 0.175, 10, P.scale, { phase: Math.PI / 10 });
  tube(rise.r1, rise.r2, 0.175, 0.160, 10, P.scaleDk, { phase: Math.PI / 10 });
  tube(rise.r2, rise.splice, 0.160, 0.150, 10, P.scale, { phase: Math.PI / 10 });
  /* belly ladder continues up the rise's front (R2: same surface-offset fix as the coil rungs) */
  beltPatch(rise.root, 0.185, P.belly);
  beltPatch(rise.r1, 0.175, P.bellyDk);
  beltPatch(rise.r2, 0.160, P.belly);

  /* ===== TORSO — humanoid, reared to full height off the splice, cx/cz torque driving it
     upright-and-back into the "thrown back" throat pose. ===== */
  const L = {
    waistY: 1.02, backY: 1.14, ribY: 1.26, chestY: 1.38, shldY: 1.50, neckY: 1.58,
    jawY: 1.62, cheekY: 1.665, browY: 1.71, crownY: 1.75,
    shoulderX: 0.30,
  };
  const spineCz = { waist: -0.04, back: -0.06, rib: -0.06, chest: -0.04, shld: 0.00, neck: 0.04 };
  const torso = stack([
    { y: L.waistY, rx: 0.155, rz: 0.135, cx: 0.02, cz: spineCz.waist, hex: P.torso },
    { y: L.backY,  rx: 0.170, rz: 0.148, cx: 0.02, cz: spineCz.back,  hex: P.torsoLt },
    { y: L.ribY,   rx: 0.182, rz: 0.158, cx: 0.01, cz: spineCz.rib,   hex: P.torso },
    { y: L.chestY, rx: 0.192, rz: 0.164, cx: 0.00, cz: spineCz.chest, hex: P.torsoLt },
    { y: L.shldY,  rx: 0.205, rz: 0.150, cx: 0.00, cz: spineCz.shld,  hex: P.torso },
    { y: L.neckY,  rx: 0.066, rz: 0.062, cx: -0.01, cz: spineCz.neck, hex: P.skinDk },
  ], 10, {});

  /* belly ladder finishes on the front torso panels — the value spine reaching the throat.
     R2 SELF-CORRECTION: same fix as the coil (patches pushed OUT along the ring's own rz to sit
     proud of the surface instead of buried at an unrelated fixed z). */
  {
    const rungs = [
      [L.waistY, 0.02, 0.135], [L.ribY, 0.01, 0.158], [L.chestY, 0.00, 0.164],
    ];
    for(const [y, cx, rz] of rungs){
      const w = rz * 0.55, z = rz * 0.88;
      quad(V(cx - w, y - 0.05, z), V(cx + w, y - 0.05, z),
           V(cx + w * 0.7, y + 0.06, z + 0.02), V(cx - w * 0.7, y + 0.06, z + 0.02), P.belly, 0.04);
    }
  }

  /* ===== HEAD — thrown back, throat bared, jaw dropped. crownY drifts BACK (-z) and browY tips
     up so the whole head-loft reads as looking straight up, not level-forward. ===== */
  /* R2 SELF-CORRECTION: r1's head (rx/rz ~0.06-0.08) barely registered against the torso at
     1/3-res and its forward-facing surface was small since the "thrown back" tilt angles it away
     from camera. Widened each band ~15-20% and pushed cz forward so more pale skin actually
     faces the lens while the upward tilt (cz still trending back band-to-band) is preserved. */
  const head = stack([
    { y: L.jawY,   rx: 0.082, rz: 0.092, cx: -0.02, cz: spineCz.neck + 0.11,  hex: P.skin },
    { y: L.cheekY, rx: 0.096, rz: 0.104, cx: -0.03, cz: spineCz.neck + 0.07,  hex: P.skin },
    { y: L.browY,  rx: 0.088, rz: 0.094, cx: -0.04, cz: spineCz.neck - 0.01,  hex: P.skinDk },
    { y: L.crownY, rx: 0.066, rz: 0.070, cx: -0.05, cz: spineCz.neck - 0.09,  hex: P.scaleDk },
  ], 8, { capTop: { hex: P.scaleDk, lift: 0.016 } });

  /* dropped jaw — a dark open wedge under the chin, throat bared upward */
  {
    const throatY = L.jawY - 0.02, tz = spineCz.neck + 0.10;
    quad(V(-0.030, throatY, tz), V(0.030, throatY, tz),
         V(0.022, throatY - 0.055, tz - 0.03), V(-0.022, throatY - 0.055, tz - 0.03), P.mouth, 0.03);
    tube(V(0, throatY - 0.01, tz), V(0, throatY - 0.05, tz + 0.03), 0.010, 0.004, 4, P.tongue, { capB: { hex: P.tongue } });
  }

  /* eyes — dull half-lidded gaze tipped up toward the sky, a small pale glow pinprick each */
  for(const s of [-1, 1]){
    const ex = -0.04 + s * 0.034, ey = L.browY + 0.006, ez = spineCz.neck - 0.02;
    blob(ex, ey, ez, 0.016, 0.014, 0.012, P.eye, 5, 3);
    blob(ex, ey + 0.004, ez + 0.008, 0.005, 0.005, 0.005, P.eyeGlow, 4, 2);
  }

  /* ===== SIGNATURE — FOUR arms spread wide in benediction: outer pair raised high overhead,
     inner pair spread level to the sides. Every palm opens toward the viewer. ===== */
  {
    const shBase = V(L.shoulderX, L.shldY - 0.01, spineCz.shld + 0.06);

    /* outer-right: raised high overhead.
       CRITIC FIX (pass-2): r2's spread dirs ran almost collinear with the (near-vertical) forearm
       axis, so the four fingers stacked into a single spike instead of fanning — the loudest part
       of the silhouette (the raised hand, highest point of the whole model) read as a claw/twig,
       not an open palm. Re-aimed the fan to vary mainly in x/z (perpendicular to the mostly-+y arm)
       with less y-domination, so it spreads sideways into a visible open-hand shape overhead. */
    armBenediction(
      V(shBase.x, shBase.y, shBase.z),
      V(0.44, 1.86, -0.02), V(0.40, 2.14, -0.18),
      [[0.55, 0.55, -0.35], [0.25, 0.75, -0.15], [-0.05, 0.75, 0.05], [-0.35, 0.55, 0.25]],
      P.torso, P.skinDk, P.skin, P.skinDk
    );
    /* inner-right: spread level to the side */
    armBenediction(
      V(shBase.x - 0.02, shBase.y - 0.06, shBase.z + 0.04),
      V(0.56, 1.42, 0.10), V(0.74, 1.40, 0.20),
      [[0.7, 0.25, 0.35], [0.85, -0.05, 0.30], [0.75, -0.30, 0.20], [0.5, -0.45, 0.10]],
      P.torso, P.skinDk, P.skin, P.skinDk
    );
    /* inner-left: spread level to the side */
    armBenediction(
      V(-shBase.x + 0.02, shBase.y - 0.06, shBase.z + 0.04),
      V(-0.56, 1.42, 0.10), V(-0.74, 1.40, 0.20),
      [[-0.7, 0.25, 0.35], [-0.85, -0.05, 0.30], [-0.75, -0.30, 0.20], [-0.5, -0.45, 0.10]],
      P.torso, P.skinDk, P.skin, P.skinDk
    );
    /* outer-left: raised high overhead (mirror of outer-right's CRITIC FIX above) */
    armBenediction(
      V(-shBase.x, shBase.y, shBase.z),
      V(-0.44, 1.86, -0.02), V(-0.40, 2.14, -0.18),
      [[-0.55, 0.55, -0.35], [-0.25, 0.75, -0.15], [0.05, 0.75, 0.05], [0.35, 0.55, 0.25]],
      P.torso, P.skinDk, P.skin, P.skinDk
    );
  }

  /* base disc (Large: r=0.55; the coil's own extent (~0.5u) needs the wider Large disc, not the
     parts.js buildBase() Medium default of 0.42) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.55, 0.55, 18);
    const r2 = ring(V(0, 0.050, 0), V(0, 1, 0), 0.53, 0.53, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.053, 0), P.discTop);
  }
}
