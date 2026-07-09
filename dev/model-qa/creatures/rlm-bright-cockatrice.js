/* dev/model-qa/creatures/rlm-bright-cockatrice.js — COCKATRICE landmark table (WINGED-AVIAN family,
   docs/ANATOMY-CANON.md's AVIAN stub: keel chest + WINGED wing rules, thin scaled legs), Small,
   CR 1/4, realm bright-kingdom, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry pilot, bright-w1 cell 0, port 5350). Core identity: the rooster-lizard hybrid whose
   bite petrifies. Bright-kingdom skin per data/realm-bestiary.js "Plush Ripper" reskin: cuddly
   stuffed animal — button eyes, calico-felt fur, music-box giggle — hiding a mouthful of hooked
   steel teeth sewn in wrong. Bespoke to render key "cockatrice"; the felt/plush palette below is
   the bright-kingdom read, the hybrid ANATOMY (bird body + rooster head + lizard tail) is the
   CORE identity and leads over the skin per law 4.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. WINGED-AVIAN body — small keeled breast block (bird chest, not a barrel), calico-felt
        plush body plumage in patchwork tan/cream, seams stitched in dark thread along the
        belly (the "puckered wrong" tell from the flavor line).
     2. SIGNATURE — the rooster head: comb + wattle in bright saturated red (the law-3 high-value
        zone, >=140 RGB), short curved beak, button eyes (small black-on-white high-contrast
        points), carried HIGH at the top of the silhouette so it reads first at a squint.
     3. The hybrid tell — a long, tapering SCALED lizard tail (not a bird tail): distinct
        overlapping scale rings in a dull olive-brown, breaking from the plush body texture,
        whipped up and curled behind — the single loudest anatomy cue that this is not just a
        rooster.
     4. Small filled feather-mass wings, spread and asymmetric (one higher than the other,
        mid-beat), primaries as flat feather quads fanning back per the WINGED wing rules —
        struts-first, no flat single-sheet fin.
     5. Thin scaled legs (bird legs, not lizard) ending in clawed feet, one planted, one
        drawn up mid-hop — the flurry-strike stance.
     6. Under the felt: a hint of the hooked teeth — a few pale curved hook-shapes just inside
        the open beak, sewn-in-wrong per the flavor, small but value-bright against the dark
        throat well.

   POSE SENTENCE: the flurry-strike — mid-hop off a single planted leg, wings beating asymmetric
   (one high, one low, caught mid-stroke), neck extended low and forward in a pecking strike,
   beak snapped open toward the target, tail whipped up and curled high behind for counter-
   balance — never a static perched rooster.

   POSE NOTE (per ANATOMY-CANON POSE-ANATOMY, adapted for AVIAN): the spine gesture is the
   neck-to-tail curve — chest arched forward-down into the extended neck (the strike line), tail
   curling the OPPOSITE way (up and back) as the counterpose that keeps a forward-lunging body
   from reading as toppling. The planted leg carries a visible ~120deg knee bend; the drawn-up
   leg folds tighter at hip and knee, never a straight stick. Wings ride asymmetric off the
   arched spine (one shoulder driven up on the beat-up side) rather than mirrored/level per law 3.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0 (disc r=0.30,
   Small). Imported by ps1-sheet.html (SETS['bright-w1'], cell 0, fn buildCockatrice). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCockatrice(){
  const C = {
    felt:0xc9a877, feltDk:0x9c7c53, feltLt:0xe0c090,      // calico-felt plush body
    seam:0x5a3f28,                                          // dark stitched seams
    comb:0xd81f2a, combDk:0x9c1018, wattle:0xc2141f,        // bright saturated red (signature)
    beak:0xe8a020, beakDk:0xb87010,
    eyeWhite:0xf0ece0, eyeDk:0x1a1410,                       // button eyes
    scale:0x6e6a34, scaleDk:0x4c491f, scaleLt:0x8a8548,     // olive-brown lizard tail
    feather:0xd8c090, featherDk:0xa88858,
    leg:0xc9a877, claw:0x2a2218,
    hook:0xe8e2d0, throat:0x2a1a14,
    disc:0x4a4038, discTop:0x584a3a,
  };

  /* landmark spine — the neck-to-tail gesture curve: chest arched forward-down into the
     extended neck (strike line), tail curling up-and-back (counterpose). Small creature. */
  const S = {
    tailBase: V(-0.02, 0.32, -0.20),
    rump:     V( 0.00, 0.36, -0.08),
    chest:    V( 0.02, 0.38,  0.10),   // keeled breast block
    neckB:    V( 0.04, 0.40,  0.20),
    neckM:    V( 0.10, 0.38,  0.34),
    headB:    V( 0.16, 0.34,  0.46),   // neck extended forward — the strike, kept clear of the legs
  };

  /* ---------- BODY — keeled breast block, plush felt ---------- */
  const n = 8, ph = Math.PI / n;
  tube(S.rump, S.chest, 0.115, 0.100, n, C.felt, { phase: ph });
  tube(S.tailBase, S.rump, 0.095, 0.115, n, C.feltDk, { phase: ph });
  tube(S.chest, S.neckB, 0.095, 0.062, n, C.feltLt, { phase: ph });
  /* keel — a raised ridge along the belly, faceted forward, the "puckered wrong" seam */
  for (const t of [0.15, 0.4, 0.65, 0.9]) {
    const a = S.rump.clone().lerp(S.chest, t);
    quad(
      V(a.x - 0.01, a.y - 0.10, a.z - 0.02), V(a.x + 0.01, a.y - 0.10, a.z + 0.02),
      V(a.x + 0.006, a.y - 0.02, a.z + 0.01), V(a.x - 0.006, a.y - 0.02, a.z - 0.01),
      C.seam, 0.03
    );
  }

  /* ---------- NECK -> HEAD (extended, low, forward-driven) ---------- */
  tube(S.neckB, S.neckM, 0.062, 0.050, n, C.felt, { phase: ph });
  tube(S.neckM, S.headB, 0.050, 0.045, n, C.feltLt, { phase: ph });

  /* rooster head — small blocky skull, button eyes, short curved beak */
  {
    const skull0 = S.headB, skull1 = V(0.20, 0.34, 0.54);
    tube(skull0, skull1, 0.048, 0.042, 7, C.felt, { phase: Math.PI / 7 });
    /* button eyes — small, high-contrast, punched INTO the plush */
    for (const s of [-1, 1]) {
      const ex = 0.028 * s;
      quad(V(0.18 + ex, 0.36, 0.48), V(0.20 + ex, 0.36, 0.50), V(0.20 + ex, 0.33, 0.50), V(0.18 + ex, 0.33, 0.48), C.eyeWhite, 0.01);
      quad(V(0.185 + ex, 0.353, 0.483), V(0.195 + ex, 0.353, 0.492), V(0.195 + ex, 0.338, 0.492), V(0.185 + ex, 0.338, 0.483), C.eyeDk, 0.006);
    }
    /* short curved beak, snapped open toward target — reveals hooked teeth + dark throat */
    const bBase = V(0.20, 0.335, 0.54), bTip = V(0.235, 0.295, 0.64);
    tube(bBase, bTip, 0.028, 0.010, 6, C.beak, { phase: Math.PI / 6, capB: { hex: C.beakDk } });
    const bLoBase = V(0.20, 0.315, 0.54), bLoTip = V(0.23, 0.265, 0.625);
    tube(bLoBase, bLoTip, 0.024, 0.008, 6, C.beakDk, { phase: Math.PI / 6, capB: { hex: C.beakDk } });
    /* dark throat well between the mandibles */
    quad(V(0.185, 0.32, 0.56), V(0.215, 0.32, 0.56), V(0.215, 0.285, 0.605), V(0.185, 0.285, 0.605), C.throat, 0.02);
    /* hooked steel teeth, sewn in wrong — small pale curved hooks against the dark throat */
    for (const [hx, hy] of [[0.192, 0.312], [0.205, 0.308], [0.218, 0.312]]) {
      tube(V(hx, hy, 0.57), V(hx + 0.006, hy - 0.018, 0.585), 0.006, 0.002, 3, C.hook, { capB: { hex: C.hook } });
    }
    /* comb — bright red, tall, jagged, on the crown (the loudest zone at the silhouette top,
       enlarged in the fix round so it reads as a value spike at a squint) */
    const combPts = [
      [0.20, 0.375, 0.48, 0.445, 0.425], [0.205, 0.395, 0.51, 0.475, 0.475], [0.20, 0.385, 0.54, 0.455, 0.515],
    ];
    for (const [bx, by, bz, ty, tz] of combPts) {
      tube(V(bx, by, bz), V(bx, ty, tz), 0.026, 0.005, 4, C.comb, { capB: { hex: C.combDk } });
    }
    /* wattle — hangs under the beak, saturated red */
    tube(V(0.195, 0.305, 0.545), V(0.195, 0.255, 0.555), 0.016, 0.006, 4, C.wattle, { capB: { hex: C.wattle } });
  }

  /* ---------- WINGS — small filled feather-mass, spread laterally + ASYMMETRIC mid-beat
     (fix round: pulled OUT to the sides rather than stacked near-vertical, so the silhouette
     reads bird-with-wings instead of a crab/antenna shape) ---------- */
  const wing = (side, beatUp) => {
    const root = V(side * 0.11, 0.37 + (beatUp ? 0.03 : -0.01), -0.02);
    const elbow = V(side * 0.30, root.y + (beatUp ? 0.10 : -0.06), root.z - 0.02);
    const tip = V(side * 0.46, elbow.y + (beatUp ? 0.06 : -0.14), elbow.z - 0.04);
    tube(root, elbow, 0.045, 0.032, 6, C.feather, { phase: Math.PI / 6 });
    tube(elbow, tip, 0.032, 0.010, 6, C.featherDk, { phase: Math.PI / 6, capB: { hex: C.featherDk } });
    /* struts-first: leading-edge spar carries the primary feather fan, scalloped trailing edge */
    const featherPts = [[0.10, -0.06], [0.16, -0.11], [0.21, -0.16], [0.26, -0.20]];
    for (let i = 0; i < featherPts.length; i++) {
      const [fx, fz] = featherPts[i];
      const rx = root.x + side * fx, rz = root.z + fz, ry = elbow.y - i * 0.008;
      quad(
        V(rx, ry + 0.03, rz + 0.02), V(rx + side * 0.03, ry + 0.015, rz - 0.005),
        V(rx + side * 0.045, ry - 0.02, rz - 0.06), V(rx + side * 0.008, ry + 0.0, rz - 0.04),
        C.feather, 0.02
      );
    }
  };
  wing(-1, true);   // beat UP
  wing(1, false);   // beat DOWN — asymmetric mid-stroke

  /* ---------- SCALED LIZARD TAIL — the hybrid tell, whipped up + curled behind ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(-0.06, 0.42, -0.34);   // whips upward
    const t2 = V(-0.02, 0.52, -0.46);   // curls back over
    const t3 = V(0.06, 0.48, -0.52);    // tip curling down
    tube(t0, t1, 0.052, 0.038, 7, C.scale, { phase: Math.PI / 7 });
    tube(t1, t2, 0.038, 0.024, 7, C.scaleDk, { phase: Math.PI / 7 });
    tube(t2, t3, 0.024, 0.008, 6, C.scaleLt, { phase: Math.PI / 6, capB: { hex: C.scaleDk } });
    /* overlapping scale rings — small raised bands distinct from the plush body texture */
    for (const t of [t0, t0.clone().lerp(t1, 0.5), t1, t1.clone().lerp(t2, 0.5), t2]) {
      quad(V(t.x - 0.03, t.y - 0.01, t.z), V(t.x + 0.03, t.y - 0.01, t.z), V(t.x + 0.025, t.y + 0.015, t.z + 0.01), V(t.x - 0.025, t.y + 0.015, t.z + 0.01), C.scaleDk, 0.02);
    }
  }

  /* ---------- LEGS — thin scaled, one planted (~120deg knee), one drawn up mid-hop ---------- */
  {
    /* planted leg — bears weight, visible bent knee, foot flat on the disc */
    const hipP = V(0.03, 0.32, -0.02), kneeP = V(0.06, 0.18, 0.00), footP = V(0.02, 0.05, 0.06);
    tube(hipP, kneeP, 0.030, 0.020, 6, C.leg, { phase: Math.PI / 6 });
    tube(kneeP, footP, 0.018, 0.012, 6, C.leg, { capB: { hex: C.claw, lift: 0.01 } });
    for (const [dx, dz] of [[0.018, 0.03], [0.0, 0.035], [-0.018, 0.03]]) {
      tube(V(footP.x, footP.y + 0.008, footP.z), V(footP.x + dx, footP.y - 0.03, footP.z + dz), 0.008, 0.002, 3, C.claw, { capB: { hex: C.claw } });
    }

    /* drawn-up leg — hip AND knee fold tight, foot lifted, mid-hop */
    const hipD = V(-0.03, 0.34, 0.02), kneeD = V(-0.06, 0.22, 0.10), footD = V(-0.03, 0.17, 0.06);
    tube(hipD, kneeD, 0.028, 0.018, 6, C.felt, { phase: Math.PI / 6 });
    tube(kneeD, footD, 0.016, 0.010, 6, C.leg, { capB: { hex: C.claw, lift: 0.008 } });
    for (const [dx, dz] of [[0.012, 0.02], [0.0, 0.024], [-0.012, 0.02]]) {
      tube(V(footD.x, footD.y + 0.003, footD.z), V(footD.x + dx, footD.y - 0.014, footD.z + dz), 0.006, 0.002, 3, C.claw, { capB: { hex: C.claw } });
    }
  }

  /* ---------- BASE DISC (Small — r=0.30) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.30, 0.30, 16);
    const r2 = ring(V(0, 0.03, 0), V(0, 1, 0), 0.285, 0.285, 16);
    stitch([r1, r2], () => C.disc);
    capFan(r2, V(0, 0.032, 0), C.discTop);
  }
}
