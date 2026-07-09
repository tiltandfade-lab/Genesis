/* dev/model-qa/creatures/rlm-frontier-desperate-bandit.js — the DESPERATE BANDIT landmark
   table (HUMANOID family, Medium, CR 1/8, realm frontier), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, frontier-w2 cell 10). Core
   identity: the BROKE DRIFTER — the most common frontier mook, a desperate gun-for-hire who
   breaks and runs when losing. Soft-brimmed hat, worn coat, revolver held wrong. Bespoke to
   the render key "desperate-bandit"; frontier reskins ride this chassis.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: thin, defeated build (narrow chest,
        slight stoop) carried through a genuine SPINE TWIST — shoulders rotate away from the
        hips as the body half-turns to flee while the gun arm still covers the target (law 5's
        amendment: the spine carries the gesture, a real per-band rotation, not a lean).
     2. SIGNATURE — the shaky draw: the gun arm raised with the revolver up but the elbow
        tucked in FAR too tight against the ribs (deliberately wrong form, the fear is the
        character), the other hand raised open at shoulder height in a half-surrender. The
        raised palm and the revolver are the two high-value law-3 zones.
     3. Soft-brimmed hat (a wide flat disc + tapered crown) throwing the face into partial
        shadow, with the jaw/mouth still catching light below the brim — a countable costume
        feature, not a bare head.
     4. Worn coat — a long dark coat panel breaking over a pale under-shirt at the collar,
        hanging open and loose (a broke drifter's costuming, not a tailored fit).
     5. Face — gaunt, hollow-cheeked, a tight worried mouth-line, no facial high-value patch
        (the palm and revolver carry that job instead — a desperate, drained read).
     6. Half-turned fleeing stance: the trailing leg already rotated toward the exit, weight
        shifting off the front foot, body caught mid-retreat even as the arm still aims — never
        a squared, at-attention stance.

   POSE SENTENCE: the shaky draw — torso twisted half away as if already leaving, the gun arm
   raised with the revolver up but the elbow clamped in too tight against the ribs (fear-bad
   form), the free hand raised open in a half-surrender at shoulder height, trailing leg
   already rotated toward retreat, weight breaking off the front foot — the beat of a man
   covering a target he's about to run from, never a squared duelist's stance.

   SPINE-GESTURE SENTENCE: the spine runs a near-square hip band up through an accelerating
   twist to a shoulder band rotated further around the vertical axis than the hips (the body
   peeling away toward flight), then the neck/head partially untwists back to keep the target
   in view — so the trace hips-to-skull is a coiled, off-balance curve, not a plumb line, with
   the trailing leg turned out as the flight vector and the front leg still braced but
   unloading.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w2'], cell 10, fn buildDesperateBandit). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildDesperateBandit(){
  /* ---------- PALETTE (worn/desaturated frontier drifter — dark coat vs. pale undershirt is
     the law-3 high-value zone the collar/palm/revolver ride against). ---------- */
  /* R2 SELF-CORRECTION (post r1 render, hostile self-review): r1's coat/pants/boot family sat
     within one value step of the disc/discTop (all ~luma 60-90 vs disc ~48-66), so the whole
     lower body and stance vanished into the base — the half-turned fleeing-leg signature never
     read at all. Also r1's revolver (gun/gunLt) was tiny and too dark (no zone actually cleared
     the law-3 >=140 floor), so the gun signature was invisible. Fixed: pants/boot bumped a full
     step brighter (still reads as worn trousers, now clears the disc), revolver enlarged and
     recolored to a bright gunmetal that clears 140, and a lit brow/cheek patch restored under
     the hat brim so the face carries a second readable high-value zone instead of vanishing. */
  const P = {
    coat: 0x4a4030, coatDk: 0x342c20,
    shirt: 0xc8bc98, shirtDk: 0x968a68,
    pants: 0x8c7850, pantsDk: 0x5e4e34,
    boot: 0x8a744e, bootDk: 0x5c4a32,
    skin: 0xc79a70, skinDk: 0x8f6244, brow: 0xd4a878,
    hat: 0x4a3d28, hatDk: 0x2c2314,
    mouth: 0x2c2018,
    gun: 0x6a6458, gunLt: 0xc4bca8,
    palm: 0xdaa87c,
    disc: 0x36312a, discTop: 0x423b32,
  };

  /* ===== SPINE — the flight-twist. Rings rotate about the vertical axis by an angle that
     grows from the hip (near-square) to the shoulder (well further around), the body peeling
     away toward retreat while the gun arm still tracks the target. ===== */
  const L = {
    hipY: 0.34, waistY: 0.47, ribY: 0.60, chestY: 0.73, shldY: 0.85, neckY: 0.915,
    jawY: 0.975, browY: 1.035, crownY: 1.075, brimY: 1.10,
  };
  /* CAMERA NOTE: ps1-sheet's dimetric camera sits at +x/+y/+z looking at the origin; +x/+z
     reads near-camera. Twist sign chosen so the gun-arm shoulder rotates toward +x/+z (stays
     near-camera and visible, raised) and the trailing/retreating side pulls toward -x/-z. */
  const HIP_ANG = 0.12, SHLD_ANG = 0.12 + 0.62;   // ~7deg -> ~42.5deg = ~35.5deg of twist
  const HEAD_ANG = SHLD_ANG - 0.30;               // head partially untwists back to watch the mark
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }
  function twist(p){
    const t = Math.min(1, Math.max(0, (p.y - L.hipY) / (L.shldY - L.hipY)));
    return rotY(p, HIP_ANG + t * (SHLD_ANG - HIP_ANG));
  }
  const headXf = (p) => rotY(p, HEAD_ANG);

  /* ===== LEGS — half-turned fleeing stance. Front (-x) leg still braced but unloading, weight
     breaking off it; trailing (+x) leg already rotated out toward the exit vector. ===== */
  {
    // FRONT leg (-x): bent, weight coming off it
    const hipF = twist(V(-0.125, L.hipY, 0.03));
    const kneeF = V(-0.185, 0.20, 0.20);
    const footF = V(-0.150, 0.03, 0.335);
    tube(hipF, kneeF, 0.086, 0.070, 6, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeF, footF, 0.070, 0.052, 6, P.pantsDk, { capB: { hex: P.boot, lift: 0.018 } });
    quad(V(footF.x + 0.045, 0.015, footF.z + 0.02), V(footF.x - 0.045, 0.015, footF.z + 0.02),
      V(footF.x - 0.04, 0.045, footF.z + 0.085), V(footF.x + 0.04, 0.045, footF.z + 0.085), P.boot, 0.04);

    // TRAILING leg (+x): rotated out toward the flight vector, near-camera side
    const hipR = twist(V(0.125, L.hipY, -0.03));
    const kneeR = V(0.255, 0.19, -0.16);
    const footR = V(0.32, 0.03, -0.30);
    tube(hipR, kneeR, 0.082, 0.066, 6, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeR, footR, 0.066, 0.050, 6, P.pantsDk, { capB: { hex: P.boot, lift: 0.018 } });
    quad(V(footR.x + 0.05, 0.015, footR.z - 0.06), V(footR.x + 0.005, 0.015, footR.z + 0.02),
      V(footR.x + 0.01, 0.045, footR.z + 0.065), V(footR.x + 0.055, 0.045, footR.z - 0.01), P.bootDk, 0.04);
  }

  /* ===== TORSO — thin, defeated build (no gut-push, narrow tapered), twisted through the
     spine rotation. Dark worn coat over a pale undershirt breaking at the collar. ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.150, rz: 0.135, hex: P.pants },
    { y: L.waistY, rx: 0.180, rz: 0.165, hex: P.coatDk },   // coat hem
    { y: L.ribY,   rx: 0.195, rz: 0.170, hex: P.coat },
    { y: L.chestY, rx: 0.198, rz: 0.160, hex: P.coat },
    { y: L.shldY,  rx: 0.210, rz: 0.152, hex: P.coatDk },
    { y: L.neckY,  rx: 0.080, rz: 0.074, hex: P.skinDk },
  ];
  stack(torsoBands, 8, { xform: twist });

  /* pale undershirt V breaking the dark coat open at the collar — the law-3 high-value chest
     zone, worn/loose not tailored */
  {
    const top = twist(V(0, L.shldY + 0.02, 0.125));
    const lo = twist(V(0, L.waistY - 0.02, 0.155));
    quad(V(top.x - 0.05, top.y, top.z), V(top.x + 0.05, top.y, top.z),
      V(lo.x + 0.024, lo.y, lo.z), V(lo.x - 0.024, lo.y, lo.z), P.shirt, 0.05);
  }

  /* open coat panel — a hanging dark flap breaking the silhouette on the trailing side,
     unbuttoned drifter costuming */
  {
    const top = twist(V(0.06, L.chestY, 0.13));
    const bot = twist(V(0.10, L.hipY - 0.06, 0.15));
    quad(V(top.x - 0.03, top.y, top.z - 0.01), V(top.x + 0.045, top.y, top.z - 0.02),
      V(bot.x + 0.06, bot.y, bot.z - 0.02), V(bot.x - 0.02, bot.y, bot.z - 0.01), P.coatDk, 0.04);
  }

  /* ===== HEAD — soft-brimmed hat throwing partial shadow, gaunt hollow-cheeked face, tight
     worried mouth-line. Partially untwisted back toward the mark. ===== */
  {
    const headBands = [
      { y: L.jawY,    rx: 0.088, rz: 0.082, hex: P.skinDk },
      { y: L.browY,   rx: 0.100, rz: 0.094, hex: P.skin },
      { y: L.crownY,  rx: 0.084, rz: 0.078, hex: P.skinDk },
    ];
    stack(headBands, 8, { xform: headXf });

    const jawC = headXf(V(0, L.jawY, 0.078));

    /* tight worried mouth-line */
    quad(V(jawC.x - 0.032, jawC.y - 0.036, jawC.z), V(jawC.x + 0.032, jawC.y - 0.036, jawC.z),
      V(jawC.x + 0.026, jawC.y - 0.024, jawC.z + 0.004), V(jawC.x - 0.026, jawC.y - 0.024, jawC.z + 0.004), P.mouth, 0.03);

    /* hollow cheek shading, one side dark (drained), one side a lit brow-catch (R2: a readable
       high-value zone under the hat brim so the face isn't fully swallowed by shadow) */
    {
      const pDk = headXf(V(-0.068, L.browY - 0.015, 0.075));
      quad(V(pDk.x - 0.02, pDk.y - 0.018, pDk.z), V(pDk.x + 0.02, pDk.y - 0.018, pDk.z),
        V(pDk.x + 0.017, pDk.y + 0.018, pDk.z), V(pDk.x - 0.017, pDk.y + 0.018, pDk.z), P.skinDk, 0.04);
      const pLt = headXf(V(0.068, L.browY - 0.015, 0.075));
      quad(V(pLt.x - 0.022, pLt.y - 0.018, pLt.z), V(pLt.x + 0.022, pLt.y - 0.018, pLt.z),
        V(pLt.x + 0.019, pLt.y + 0.02, pLt.z), V(pLt.x - 0.019, pLt.y + 0.02, pLt.z), P.brow, 0.04);
    }

    /* soft-brimmed hat — wide flat brim disc + tapered crown, sitting atop the head band and
       casting the face into partial shadow; a countable costume feature */
    const brimC = headXf(V(0, L.brimY - 0.03, 0.01));
    {
      const rBrim = ring(V(brimC.x, brimC.y, brimC.z), V(0, 1, 0), 0.145, 0.135, 10);
      const rBrimIn = ring(V(brimC.x, brimC.y - 0.006, brimC.z), V(0, 1, 0), 0.09, 0.084, 10);
      stitch([rBrimIn, rBrim], () => P.hatDk);
      capFan(rBrim, V(brimC.x, brimC.y + 0.004, brimC.z), P.hat, true);
    }
    const crownBands = [
      { y: 0, rx: 0.088, rz: 0.082, hex: P.hat },
      { y: 0.075, rx: 0.066, rz: 0.062, hex: P.hatDk },
    ];
    stack(crownBands.map(b => ({ ...b, y: brimC.y + 0.01 + b.y })), 8, { xform: headXf, capTop: { hex: P.hatDk, lift: 0.02 } });
  }

  /* ===== ARMS — POSE-ANATOMY law 2/3: shoulders ride with the twist, elbows always bent
     100-150 deg. Gun arm raised with the elbow clamped too tight (wrong form, the fear is the
     character); free hand raised open in a half-surrender. ===== */

  /* GUN arm (+x, near-camera/gun-side) — raised, but elbow tucked in hard against the ribs
     instead of extended, revolver held up and slightly canted (bad, fearful form). Solved
     against the dimetric camera's right/up basis for a real on-screen elbow zigzag, not a
     straight reach — elbow pinned close to the torso, forearm angling up and out to the
     revolver. */
  {
    const sh = twist(V(0.175, L.shldY - 0.005, 0.02));
    const el = V(0.185, 0.685, 0.10);
    const wr = V(0.245, 0.855, 0.235);
    tube(sh, el, 0.054, 0.046, 6, P.coatDk);                        // coat sleeve, upper arm
    tube(el, wr, 0.042, 0.034, 6, P.skin, { phase: Math.PI / 6 });  // bare forearm to the grip
    /* revolver — a countable grip block + bright barrel, canted off-true (wrong form). R2:
       enlarged and recolored to a light gunmetal (clears the law-3 >=140 floor) so the gun
       signature actually survives 1/3-res+dither instead of vanishing as a dark speck. */
    quad(V(wr.x - 0.026, wr.y - 0.03, wr.z - 0.012), V(wr.x + 0.026, wr.y - 0.03, wr.z - 0.012),
      V(wr.x + 0.022, wr.y + 0.034, wr.z + 0.014), V(wr.x - 0.022, wr.y + 0.034, wr.z + 0.014), P.gun, 0.04);
    tube(V(wr.x + 0.014, wr.y + 0.014, wr.z + 0.024), V(wr.x + 0.085, wr.y + 0.068, wr.z + 0.155), 0.026, 0.018, 6, P.gunLt);
  }

  /* FREE arm (-x) — raised open at shoulder height, half-surrender; elbow bent, palm forward
     and up, the second law-3 high-value zone. */
  {
    const sh = twist(V(-0.175, L.shldY - 0.005, 0.02));
    const el = V(-0.255, 0.80, 0.12);
    const wr = V(-0.235, 0.965, 0.045);
    tube(sh, el, 0.054, 0.046, 6, P.coatDk);
    tube(el, wr, 0.042, 0.034, 6, P.skin, { phase: Math.PI / 6 });
    /* open raised palm */
    quad(V(wr.x - 0.032, wr.y - 0.006, wr.z), V(wr.x + 0.032, wr.y - 0.006, wr.z),
      V(wr.x + 0.028, wr.y + 0.05, wr.z + 0.016), V(wr.x - 0.028, wr.y + 0.05, wr.z + 0.016), P.palm, 0.05);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
