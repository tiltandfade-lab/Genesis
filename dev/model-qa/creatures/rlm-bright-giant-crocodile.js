/* dev/model-qa/creatures/rlm-bright-giant-crocodile.js — the GIANT CROCODILE landmark table
   (REPTILE family — no dedicated ANATOMY-CANON section exists yet; family stub list only
   covers AVIAN/HUMANOID, so this is authored from first principles off the DIRECTION brief,
   borrowing the cross-family construction rules — topline continuity, surface-seated features,
   real 3D volume for small parts, params-not-remodel — and the POSE-ANATOMY spine-gesture +
   bent-joint laws, adapted for a SPRAWLING low quadruped rather than an upright biped/humanoid),
   Huge, CR 4, realm bright-kingdom, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry pilot, bright-w1 cell 8, port 5358). Core identity: the giant crocodile — the death-
   roll river king — reskinned bright-kingdom as a cheerful bath-toy giant (saturated candy-green
   hide, cream belly/mouth, no menace in the palette even though the pose is a full ambush gape).
   This unit also frees the crocodile line off the wyvern alias (bespoke chassis, not a reskin).
   Bespoke to the render key "giant-crocodile"; bright-kingdom reskins ride this chassis.

   FEATURE CHECKLIST (the ~1,300-1,800 budget buys):
     1. REPTILE sprawl torso — a long, low, armored body carried close to the disc (not standing
        tall on columnar legs): a flattened-elliptical loft (wide, squashed low) running a
        shallow S-curve from a coiled tail through the hips/ribcage into the chest and the long
        jaw. Legs sprawl OUT from the flanks (elbows-out), not tucked under a mammal barrel.
     2. SIGNATURE — the ambush gape: the jaw is roughly HALF the total body length, hinged wide
        open, upper and lower jaw both modeled as real volume (not a single slit), a pale mouth-
        interior high-value zone (>=140 RGB, law 3) with a row of countable inward-canted teeth
        top and bottom (the loudest feature, per law 4, carried where the silhouette breaks widest).
     3. Scute ridge row — a countable line of small triangular ridge spikes down the spine from
        the base of the skull to the tail root, real 3D wedges (not slivers) so they read at any
        angle and break the topline into a jagged saw, the reptile "armored back" tell.
     4. FOUR sprawled legs — femur runs OUT-and-slightly-down from the hip (near-horizontal,
        elbows-out per the brief), a visible ~110-140deg bend at the elbow/knee down into a
        near-vertical lower leg to a splayed clawed foot — every leg bends at a real joint, none
        a straight stick, per POSE-ANATOMY law 2 adapted to the sprawl gait.
     5. Coiled lunge tail — thick at the root, tapering to a fine tip, curved off to one side in
        a loaded S so the whole body reads "coiled to strike," not a straight trailing rudder.
     6. Bath-toy bright-kingdom palette — saturated candy-green hide over a cream/pale-yellow
        belly and throat, warm pink-cream mouth interior with cream teeth, big glossy toy-eyes —
        cheerful colors riding a genuinely correct predator anatomy (law 4: correctness and
        character are additive, never traded).

   POSE SENTENCE: the ambush gape — body pressed low into a shallow S-curve, tail coiled off to
   one flank loaded for the lunge, all four legs sprawled and braced wide (elbows-out, each bent
   at a real joint), jaws thrown open to a full wedge baring the pale mouth interior and countable
   teeth, head low and level with the spine — the half-second before the death roll, never a
   closed-mouth basking pose.

   SPINE-GESTURE SENTENCE: the spine runs a shallow lateral S from the coiled tail root, through
   a slight rump-left / chest-right counter-bend at the hips, into a low, near-level neck that
   carries the head on the spine line (not lifted proud) into the open jaw — no straight plumb
   spine, no square four-legged at-rest stance; the sprawled legs' hip/shoulder lines break the
   symmetric stance the same way the jackal's lifted foreleg does, adapted here to four braced
   sprawl legs instead of one raised paw (a low ambush stance reads its "action" through the
   loaded tail-coil and gaping jaw rather than a lifted limb).

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Huge size: base disc r=0.68. Imported by ps1-sheet.html (SETS['bright-w1'],
   cell 8, fn buildGiantCrocodile). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildGiantCrocodile(){
  /* ---------- PALETTE (bath-toy bright-kingdom: saturated candy-green hide, cream belly/mouth,
     warm pink throat, cream teeth/claws — cheerful colors on a correct predator frame). ---------- */
  const P = {
    hide: 0x4fb84a, hideDk: 0x35913a, hideLt: 0x74d15f,     // saturated candy-green scaled hide
    scute: 0x9ee050, scuteDk: 0x7bc23e,                       // pale-lime scute ridge spikes — pushed off the hide for contrast
    belly: 0xf3e7a6, bellyDk: 0xe2d288,                       // cream/pale-yellow underside
    snout: 0x4aa848, snoutDk: 0x2f7a35,                       // top-of-jaw green
    mouth: 0xe8879c, mouthDk: 0xc65f79,                       // warm pink-cream mouth interior — the law-3 zone
    tooth: 0xf7f1d8, toothDk: 0xe4dbb6,                       // cream countable teeth
    eye: 0xf6d94a, pupil: 0x201a10,                           // big glossy toy-eye, dark pupil
    claw: 0xf0e6c0,
    disc: 0x4a4038, discTop: 0x584a3a,
  };
  setChannels({ [P.hide]:'scale', [P.hideDk]:'scale', [P.hideLt]:'scale',
    [P.scute]:'scale', [P.scuteDk]:'scale', [P.snout]:'scale', [P.snoutDk]:'scale',
    [P.belly]:'skin', [P.bellyDk]:'skin', [P.mouth]:'', [P.mouthDk]:'', [P.tooth]:'bone',
    [P.toothDk]:'bone', [P.claw]:'bone', [P.eye]:'', [P.pupil]:'' });

  /* ---------- LANDMARKS — spine along +z, pressed LOW (sprawl carry, not standing tall), a
     shallow lateral S-curve (rump/tail one way, chest/neck the counter-bend) reading the coiled-
     for-a-lunge pose. Total nose-to-tail-tip span ~1.5u; jaw alone (hinge->tip) is close to half
     of that per the brief. ---------- */
  const spY = 0.15;   // low sprawl spine height
  const S = {
    tailTip:  V( 0.24, spY - 0.03, -0.62),
    tailMid:  V( 0.19, spY - 0.03, -0.50),
    tailBase: V( 0.09, spY - 0.01, -0.36),
    rump:     V( 0.03, spY + 0.03, -0.20),   // S-curve: rump kicked slightly +x
    mid:      V(-0.01, spY + 0.05, -0.02),
    chest:    V(-0.03, spY + 0.055, 0.16),   // counter-bend: chest kicked slightly -x
    neckBase: V(-0.01, spY + 0.05,  0.32),
    jawHinge: V( 0.00, spY + 0.045, 0.42),   // jaw hinge — snout runs from here
    snoutTip: V( 0.00, spY + 0.01,  0.82),   // jaw hinge->tip = 0.40u, ~ half the 0.82-(-0.68)=1.5u total span
  };

  /* ---------- BODY — flattened-elliptical loft (wide, squashed low, sprawl-reptile mass),
     tapering tail behind, widening ribcage/chest, narrowing into the neck. ---------- */
  tube(S.tailTip, S.tailMid,  0.012, 0.032, 8, P.hideDk, { raz: 0.010, rbz: 0.026 });
  tube(S.tailMid, S.tailBase, 0.032, 0.070, 8, P.hide,   { raz: 0.026, rbz: 0.050, capA: { hex: P.hideDk, lift: 0.006 } });
  tube(S.tailBase, S.rump,    0.070, 0.145, 8, P.hide,   { raz: 0.050, rbz: 0.095 });
  tube(S.rump,     S.mid,     0.145, 0.170, 8, P.hide,   { raz: 0.095, rbz: 0.110 });
  tube(S.mid,      S.chest,   0.170, 0.160, 8, P.hide,   { raz: 0.110, rbz: 0.105 });
  tube(S.chest,    S.neckBase,0.160, 0.110, 8, P.hideDk, { raz: 0.105, rbz: 0.078 });
  tube(S.neckBase, S.jawHinge,0.110, 0.095, 8, P.hide,   { raz: 0.078, rbz: 0.068 });

  /* pale belly/throat strip — high-value zone (law 3), full underside chest-through-tail-base */
  {
    const by = spY - 0.075;
    quad(V(-0.10, by - 0.02, -0.34), V(0.10, by - 0.02, -0.34), V(0.13, by + 0.01, 0.14), V(-0.13, by + 0.01, 0.14), P.belly, 0.04);
    quad(V(-0.08, by + 0.01, 0.10), V(0.08, by + 0.01, 0.10), V(0.06, by + 0.03, 0.34), V(-0.06, by + 0.03, 0.34), P.bellyDk, 0.04);
  }

  /* ---------- SCUTE RIDGE ROW — a countable line of small triangular armor spikes down the
     spine, real 3D wedges (2 side faces + a ridge apex) so they read at any angle, jagging the
     topline. Placed from just behind the skull to the tail root. ---------- */
  {
    const scuteSpots = [
      { z: 0.36, w: 0.028, h: 0.032 }, { z: 0.24, w: 0.036, h: 0.042 },
      { z: 0.10, w: 0.042, h: 0.050 }, { z: -0.06, w: 0.044, h: 0.052 },
      { z: -0.20, w: 0.038, h: 0.046 }, { z: -0.33, w: 0.028, h: 0.034 },
    ];
    for (const sp of scuteSpots) {
      const topY = spY + 0.10 + sp.h;
      const baseL = V(-sp.w, spY + 0.09, sp.z - 0.02);
      const baseR = V(sp.w, spY + 0.09, sp.z - 0.02);
      const baseF = V(0, spY + 0.08, sp.z + 0.03);
      const apex  = V(0, topY, sp.z);
      quad(baseL, baseR, apex, apex, P.scute, 0.06);
      quad(baseR, baseF, apex, apex, P.scuteDk, 0.06);
      quad(baseF, baseL, apex, apex, P.scuteDk, 0.06);
    }
  }

  /* ---------- HEAD + THE AMBUSH GAPE — the signature. Skull cap over the jaw hinge, then a
     long two-part jaw (upper fixed to the skull line, lower hinged open) with a pale mouth
     interior, countable teeth top and bottom, and glossy toy-eyes on top of the skull. ---------- */
  {
    const n = 8, ph = Math.PI / n;
    /* skull cap — short, sits over the jaw hinge */
    const skullRings = [
      ring(V(0, spY + 0.05, 0.40), V(0, 1, 0), 0.095, 0.075, n, ph),
      ring(V(0, spY + 0.13, 0.44), V(0, 1, 0), 0.075, 0.062, n, ph),
    ];
    stitch(skullRings, () => P.snoutDk);
    capFan(skullRings[1], V(0, spY + 0.155, 0.46), P.snoutDk);

    /* UPPER jaw — runs from the hinge to the snout tip, held level/slightly up, real volume via
       a tapering tube; teeth hang off its underside edge. */
    const upA = V(0, spY + 0.075, 0.42);
    const upB = V(0, spY + 0.065, 0.62);
    const upC = V(0, spY + 0.05,  0.82);   // snout tip
    tube(upA, upB, 0.078, 0.052, n, P.snout, { raz: 0.058, rbz: 0.038 });
    tube(upB, upC, 0.052, 0.020, n, P.snout, { raz: 0.038, rbz: 0.015, capB: { hex: P.snout, lift: 0.004 } });

    /* LOWER jaw — hinged wide OPEN (dropped well below the upper jaw), the gape that reads as the
       signature: it does not track the upper jaw's height, it drops to open a real wedge gap. */
    const loA = V(0, spY - 0.075, 0.42);
    const loB = V(0, spY - 0.095, 0.60);
    const loC = V(0, spY - 0.075, 0.79);
    tube(loA, loB, 0.070, 0.046, n, P.snout, { raz: 0.050, rbz: 0.034 });
    tube(loB, loC, 0.046, 0.016, n, P.snout, { raz: 0.034, rbz: 0.012, capB: { hex: P.snout, lift: 0.004 } });

    /* pale mouth interior — the law-3 high-value zone, spans the open gap between jaws */
    quad(V(-0.055, spY + 0.02, 0.44), V(0.055, spY + 0.02, 0.44), V(0.018, spY - 0.03, 0.78), V(-0.018, spY - 0.03, 0.78), P.mouth, 0.03);
    quad(V(-0.055, spY + 0.02, 0.44), V(0.018, spY - 0.03, 0.78), V(0.055, spY + 0.02, 0.44), V(0.055, spY + 0.02, 0.44), P.mouthDk, 0.03);
    /* throat well — dark-warm depth at the back of the gape */
    quad(V(-0.05, spY + 0.03, 0.42), V(0.05, spY + 0.03, 0.42), V(0.03, spY - 0.06, 0.44), V(-0.03, spY - 0.06, 0.44), P.mouthDk, 0.02);

    /* countable teeth — upper row hanging down, lower row standing up, spaced along the jaw
       length, small pyramids (2 visible faces each) so they read as real teeth not slivers. */
    const toothSpots = [0.46, 0.53, 0.60, 0.67, 0.74];
    for (const tz of toothSpots) {
      const jt = (tz - 0.42) / (0.82 - 0.42);
      const upperGum = V(0, spY + 0.06 - jt * 0.015, tz);
      const upperTip = V(0, spY + 0.005 - jt * 0.04, tz + 0.008);
      for (const s of [-1, 1]) {
        quad(V(s * 0.028 * (1 - jt * 0.7), upperGum.y, upperGum.z), V(0, upperGum.y, upperGum.z), upperTip, upperTip, P.tooth, 0.03);
      }
      const lowerGum = V(0, spY - 0.07 + jt * 0.01, tz - 0.01);
      const lowerTip = V(0, spY - 0.02 + jt * 0.03, tz - 0.002);
      for (const s of [-1, 1]) {
        quad(V(s * 0.024 * (1 - jt * 0.7), lowerGum.y, lowerGum.z), V(0, lowerGum.y, lowerGum.z), lowerTip, lowerTip, P.toothDk, 0.03);
      }
    }

    /* glossy toy-eyes — bumped on top of the skull, forward-set (croc read), double-sided so
       they don't backface-cull from a 3q camera. */
    const dquad = (a, b, c, d, hex, j) => { quad(a, b, c, d, hex, j); quad(d, c, b, a, hex, j); };
    for (const s of [-1, 1]) {
      const ec = V(s * 0.058, spY + 0.165, 0.415);
      dquad(V(ec.x - 0.026, ec.y, ec.z - 0.020), V(ec.x + 0.026, ec.y, ec.z - 0.020),
        V(ec.x + 0.020, ec.y + 0.036, ec.z + 0.014), V(ec.x - 0.020, ec.y + 0.036, ec.z + 0.014), P.eye, 0.03);
      dquad(V(ec.x - 0.010, ec.y + 0.018, ec.z + 0.008), V(ec.x + 0.010, ec.y + 0.018, ec.z + 0.008),
        V(ec.x + 0.007, ec.y + 0.032, ec.z + 0.016), V(ec.x - 0.007, ec.y + 0.032, ec.z + 0.016), P.pupil, 0.02);
    }
  }

  /* ---------- LEGS — REPTILE SPRAWL per the brief: femur runs OUT-and-down from the hip
     (near-horizontal, elbows-out), a real bent joint at the elbow/knee into a near-vertical
     lower leg to a splayed clawed foot. Four legs, all braced/planted wide (the ambush crouch —
     no lifted paw; the pose reads through the coiled tail + gaping jaw instead). ---------- */
  {
    const sprawlLeg = (hipX, hipZ, hex) => {
      const hip  = V(hipX, spY + 0.01, hipZ);
      const knee = V(hipX * 1.85, spY - 0.02, hipZ + 0.03 * Math.sign(hipX));  // OUT, elbow-out, near-horizontal
      const ankle= V(hipX * 1.95, spY - 0.08, hipZ - 0.02 * Math.sign(hipX));  // real bend down (~120deg)
      const foot = V(hipX * 1.80, 0.030, hipZ - 0.04 * Math.sign(hipX));       // splayed, near ground
      tube(hip, knee, 0.058, 0.048, 6, hex, { capA: { hex: P.hideDk } });
      tube(knee, ankle, 0.048, 0.032, 6, P.hideDk);
      tube(ankle, foot, 0.032, 0.020, 5, P.hideDk, { capB: { hex: P.claw, lift: 0.006 } });
      /* three short splayed claws off the foot — cheap 3D toe reads */
      for (const d of [-0.03, 0, 0.03]) {
        const tip = V(foot.x + d * Math.sign(hipX) * 1.4, 0.020, foot.z + 0.045);
        tube(foot, tip, 0.014, 0.006, 4, P.claw);
      }
    };
    // FRONT legs (shoulders) — shorter, closer to chest
    sprawlLeg(0.16, 0.20, P.hide);
    sprawlLeg(-0.16, 0.20, P.hide);
    // REAR legs (hips) — longer, powers the lunge, at the rump
    sprawlLeg(0.19, -0.16, P.hide);
    sprawlLeg(-0.19, -0.16, P.hide);
  }

  /* ---------- TAIL FIN RIDGE — a low serrated crest along the tapering tail, reinforcing the
     coiled-for-a-lunge read from the top-down silhouette. ---------- */
  {
    const finSpots = [
      { z: -0.60, w: 0.012, h: 0.020 }, { z: -0.50, w: 0.016, h: 0.026 },
      { z: -0.40, w: 0.020, h: 0.030 }, { z: -0.28, w: 0.022, h: 0.032 },
    ];
    for (const sp of finSpots) {
      const baseL = V(-sp.w, spY - 0.03, sp.z - 0.02);
      const baseR = V(sp.w, spY - 0.03, sp.z - 0.02);
      const apex  = V(0, spY - 0.03 + sp.h, sp.z);
      quad(baseL, baseR, apex, apex, P.scuteDk, 0.05);
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.68, 0.68, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.65, 0.65, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
