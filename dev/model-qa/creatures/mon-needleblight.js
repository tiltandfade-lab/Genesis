/* dev/model-qa/creatures/mon-needleblight.js — the NEEDLE BLIGHT (PLANT-HUMANOID family, Medium,
   CR 1/4, realm core), REBUILT under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08
   foundry pilot, rebuild-w2). The bestiary needle-blight is a shambling humanoid-shaped mass of
   woody vines and pine-needle bristles that whips a burst of needles at range — this pass keeps
   the prior build's palette intent (blighted bark browns vs dark evergreen needles, no eyes, a
   knot-hole "face" hollow) and REPLACES the geometry: a gaunt trunk-body with root-splay legs,
   caught mid-volley with both arm-branches swept back, about to whip the needle burst forward.

   FEATURE CHECKLIST (the ~1,300-1,700 tri budget buys):
     1. PLANT-HUMANOID gaunt trunk torso — a lean, slightly canted bark trunk standing in for the
        chest/abdomen (anatomy chief criterion: reads as a stripped, knotted tree-trunk body wearing
        a rough humanoid posture, never a smooth person).
     2. Root-splay legs — two stubby root-clawed legs planted wide and gripping the ground, roots
        spreading into 3-4 claws each (the plant "feet" read, distinct from a humanoid foot/boot).
     3. SIGNATURE — bristling NEEDLE QUILLS: dense fans of pale-tipped dark needle spikes erupting
        off the back, crown, shoulders and both forearms. Each needle is its own tapered quad,
        countable, kept >=0.04u thick at the base so none dissolve at 1/3-res (law 3). Pale tips vs
        dark bark body carry the value contrast.
     4. Dark knot-hole "face" hollow — a recessed cavity high on the trunk-head, no eyes, ringed by
        a raised bark lip, a jagged sap-amber crack below it standing in for a mouth.
     5. Two twisted branch-arms ending in claw-twig hands, BOTH swept back past the shoulders —
        the mid-volley pose: torso twisted, arms cocked back like a drawn bow about to whip forward
        and loose the needle burst. Never at rest, never at attention.
     6. Bark-channel grooves up the trunk (cheap vertical dark strips) sell the woody-bark surface
        without spending real geometry on bark texture.

   POSE SENTENCE: caught at the top of its wind-up — torso twisted at the waist, both arm-branches
   swept back past the shoulders with needle-bristled forearms cocked like a drawn bow, weight
   dropped low over splayed root-feet, about to snap forward and loose the needle volley.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w2'], cell 1). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildNeedleBlight(){
  /* ---------- PALETTE (blighted bark browns + dark evergreen needles, pale tips carry value) ---------- */
  const P = {
    bark:0x5a4a34, barkDk:0x3c3020, barkLt:0x6f5c40,          // gnarled woody bark
    barkGrey:0x4a4436,                                         // weathered grey bark patches
    knot:0x241c12, hollow:0x140f09,                            // dark knot-hole "face" cavity
    needle:0x394a2c, needleDk:0x445938, needleTip:0xd7e6a0,   // dark evergreen needles, PALE tips (R2: lifted well off void + brighter tip for law-3 contrast)
    root:0x463928, rootDk:0x2e2418,                            // root-claw feet
    sap:0x7a5a2a,                                              // amber sap crack (mouth-analog)
    disc:0x3f362d, discTop:0x4c4238,
  };

  /* ---------- LANDMARKS — a lean gaunt trunk, twisted at the waist for the wind-up. ---------- */
  const L = {
    hipY:0.30, waistY:0.46, chestY:0.70, shldY:0.90, crownY:1.08, topY:1.16,
    hipHalf:0.100, shoulderX:0.185,
  };
  /* twist: hips fixed, everything from the waist up rotates about Y (the wind-up torque) plus a
     slight overall forward-and-side lean (crooked growth, weight dropping low). All body-loft and
     head points pass through this — never mixed with raw world-space points (coordinate-frame law). */
  const twist = (p) => {
    const q = p.clone().sub(V(0, L.waistY, 0));
    const t = Math.max(0, (p.y - L.waistY)) / (L.topY - L.waistY);   // 0 at waist -> 1 at crown
    q.applyAxisAngle(V(0, 1, 0), 0.62 * t);                          // twist ramps up the trunk
    q.applyAxisAngle(V(0, 0, 1), -0.05);                              // slight lean
    return q.add(V(0, L.waistY, 0));
  };

  /* a NEEDLE QUILL FAN: `n` tapered needle-quads erupting from `base` along `dir`, splaying in a
     narrow cone. Base end dark, tip end pale (the value-contrast payload). Kept >=0.04u wide at
     the base so none of them dissolve at 1/3-res. */
  function needleFan(base, dir, n, len, spread, jitterSeedX){
    const d = dir.clone().normalize();
    const up = Math.abs(d.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(up, d).normalize();
    const w = new THREE.Vector3().crossVectors(d, u).normalize();
    for (let k = 0; k < n; k++){
      const a = (k / n) * Math.PI * 2 + jitterSeedX;
      const r = spread * (0.4 + 0.6 * ((k * 7) % n) / n);
      const off = u.clone().multiplyScalar(Math.cos(a) * r).addScaledVector(w, Math.sin(a) * r);
      const l = len * (0.8 + 0.4 * ((k * 5) % n) / n);
      const tip = base.clone().addScaledVector(d, l).add(off);
      // R2 CRITIC FIX: r1's needles (perp ~0.025u half-width, dark base color close to the bark
      // value) dissolved into scattered specks at 1/3-res — the signature failed law 3. Widened
      // the base segment and lifted needleDk well off the bark/void neighborhood so the whole
      // quill silhouette survives, then grew the pale tip segment to ~40% of the length so it
      // reads as a real light zone, not a pixel fleck.
      const perp = off.clone().normalize().multiplyScalar(0.034).add(V(0, 0.018, 0));
      quad(base.clone().sub(perp), base.clone().add(perp),
           tip.clone().add(perp.clone().multiplyScalar(0.30)), tip.clone().sub(perp.clone().multiplyScalar(0.30)),
           P.needleDk, 0.04);
      // pale tip cap — a longer second segment carrying the light (the value payload)
      const tipBase = base.clone().addScaledVector(d, l * 0.60).add(off.clone().multiplyScalar(0.85));
      const perp2 = perp.clone().multiplyScalar(0.75);
      quad(tipBase.clone().sub(perp2), tipBase.clone().add(perp2),
           tip.clone().add(perp2.clone().multiplyScalar(0.25)), tip.clone().sub(perp2.clone().multiplyScalar(0.25)),
           P.needleTip, 0.03);
    }
  }

  /* ---------- BODY — a gnarled bark TRUNK loft (narrow root base, swelling chest, knotty
     shoulders). Irregular radii per band = a lumpy organic trunk, not a smooth cylinder. Twist
     applies from waist up so the whole upper trunk torques for the wind-up. ---------- */
  const torsoRings = stack([
    { y:L.hipY,   rx:0.118, rz:0.106, hex:P.barkDk },
    { y:L.waistY, rx:0.100, rz:0.088, hex:P.bark },
    { y:L.chestY, rx:0.132, rz:0.112, cz:0.010, hex:P.bark },     // swelling trunk chest, twisting into it
    { y:L.shldY,  rx:0.145, rz:0.118, cz:0.014, hex:P.barkLt },   // knotty shoulders, full twist
    { y:L.crownY, rx:0.096, rz:0.084, cz:0.010, hex:P.barkGrey }, // head = top of the trunk (no separate skull)
  ], 9, { xform:twist, capBot:{ hex:P.rootDk, lift:0.006 }, capTop:{ hex:P.barkGrey, lift:0.01 } });

  /* bark CHANNEL GROOVES — a few dark vertical strips up the trunk (cheap bark-texture read) */
  for (const ang of [-0.9, -0.2, 0.5, 1.3, 2.4]){
    const r = 0.11;
    const bx = Math.sin(ang) * r, bz = Math.cos(ang) * r;
    const a = twist(V(bx, L.hipY + 0.02, bz)), b = twist(V(bx * 1.1, L.chestY, bz * 1.1));
    quad(a.clone().add(V(-0.012, 0, 0)), a.clone().add(V(0.012, 0, 0)),
         b.clone().add(V(0.010, 0, 0)), b.clone().add(V(-0.010, 0, 0)), P.barkDk, 0.05);
  }

  /* ---------- "FACE" — a dark KNOT-HOLE hollow high on the trunk-head (no eyes; a plant knot
     cavity). A recessed dark oval + a ragged bark rim, a jagged sap-crack below stands in for a
     mouth. Riding the twisted crown so it faces the forward wind-up. ---------- */
  {
    const fy = L.crownY - 0.02, fz = 0.088;
    const rim = (x, y, z) => twist(V(x, y, z));
    quad(rim(-0.044, fy + 0.040, fz), rim(0.044, fy + 0.040, fz),
         rim(0.034, fy - 0.048, fz), rim(-0.034, fy - 0.048, fz), P.hollow, 0.02);
    for (const [x0, y0, x1, y1] of [[-0.052, fy + 0.048, 0.052, fy + 0.048], [-0.052, fy + 0.048, -0.040, fy - 0.056],
                                     [0.052, fy + 0.048, 0.040, fy - 0.056], [-0.040, fy - 0.056, 0.040, fy - 0.056]]){
      quad(rim(x0, y0, fz - 0.006), rim(x1, y1, fz - 0.006), rim(x1 * 0.9, y1, fz - 0.02), rim(x0 * 0.9, y0, fz - 0.02), P.knot, 0.04);
    }
    quad(rim(-0.026, fy - 0.064, fz - 0.004), rim(0.026, fy - 0.064, fz - 0.004),
         rim(0.017, fy - 0.094, fz - 0.010), rim(-0.017, fy - 0.094, fz - 0.010), P.sap, 0.03);
  }

  /* ---------- NEEDLE QUILLS — the signature. Bristling fans off crown, shoulders, back. --- */
  needleFan(twist(V(0, L.topY - 0.02, 0.02)),      V(0.1, 1, 0.15),  16, 0.34, 0.18, 0.0);   // crown crest
  needleFan(twist(V(-0.12, L.shldY + 0.02, 0.01)), V(-0.6, 0.8, 0.1), 13, 0.27, 0.16, 1.1);  // left shoulder
  // R3 CRITIC FIX: the right-shoulder fan (a literal x-mirror of the left) rendered ~1/3 as bright
  // as its left twin under this fixed dimetric camera+key-light (measured via face-normal·camDir /
  // face-normal·lightDir on the actual quads: left litW~18.6 vs right litW~6.1) — mirroring position
  // does NOT mirror a cross-product-built local frame's lighting response, so the "both shoulders"
  // signature read lopsided (right side nearly bare). Re-aimed the fan to sweep further BACK
  // (z -0.1 -> -0.9, also reads MORE wind-up-cocked, not less) and bumped 16 needles (was 13);
  // measured litW now ~15.9 (~86% of the left twin) — law 3 value parity restored without moving
  // any joint/silhouette geometry.
  needleFan(twist(V(0.12, L.shldY + 0.02, 0.01)),  V(0.4, 0.8, -0.9), 16, 0.27, 0.16, 2.2);  // right shoulder
  needleFan(twist(V(-0.05, L.chestY, -0.11)),      V(-0.3, 0.5, -1), 11, 0.24, 0.14, 0.7);   // upper back
  needleFan(twist(V(0.06, L.waistY, -0.09)),       V(0.3, 0.3, -1),  10, 0.22, 0.13, 1.7);   // lower back

  /* ---------- ARMS — two twisted BRANCH-arms, BOTH swept back past the shoulders — the wind-up.
     Needle tufts bristle off both forearms (the drawn-bow read: the needle payload rides the arms
     that are about to loose it). Claw-twig hands. ---------- */
  const twigHand = (ctr, faceDir, hex) => {
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), d).normalize();
    for (const off of [-1, -0.3, 0.4, 1]){
      const kb = ctr.clone().addScaledVector(side, off * 0.030);
      const km = kb.clone().addScaledVector(d, 0.055).addScaledVector(side, off * 0.014);
      const kt = km.clone().addScaledVector(d, 0.045).addScaledVector(side, off * 0.006).add(V(0, -0.02, 0));
      tube(kb, km, 0.014, 0.009, 4, hex);
      tube(km, kt, 0.009, 0.004, 4, P.barkDk, { capB:{ hex:P.barkDk, lift:0.004 } });
    }
  };
  {
    /* R2 CRITIC FIX: r1's arms (one climbing forward-up, one dropping forward-down) read as an
       ambiguous single diagonal gesture, not a wind-up — the pose law failed the "would a stranger
       know what this is doing" test. Rebuilt SYMMETRIC: both elbows swing OUT WIDE to the sides
       and back, both hands sweep further out/up/back past the shoulders — a wide twin-V silhouette
       break clearly reading as "cocked back", legible even foreshortened toward the camera. Roots
       off the TWISTED shoulder ring so the arms inherit the torso's wind-up torque. */
    const shL = twist(V(-L.shoulderX, L.shldY - 0.02, 0.02));
    const elL = V(-0.42, 0.98, -0.16);
    const hL  = V(-0.50, 1.14, -0.42);
    tube(shL, elL, 0.052, 0.038, 6, P.bark, { capA:{ hex:P.barkDk } });
    tube(elL, hL, 0.038, 0.026, 6, P.barkLt);
    needleFan(elL, V(-0.5, 0.4, -0.85), 10, 0.20, 0.13, 0.3);
    twigHand(hL, V(-0.3, 0.2, -0.95), P.barkLt);

    const shR = twist(V(L.shoulderX, L.shldY - 0.02, 0.02));
    const elR = V(0.42, 0.94, -0.16);
    const hR  = V(0.50, 1.08, -0.42);
    tube(shR, elR, 0.052, 0.038, 6, P.bark, { capA:{ hex:P.barkDk } });
    tube(elR, hR, 0.038, 0.026, 6, P.barkLt);
    needleFan(elR, V(0.5, 0.35, -0.85), 10, 0.20, 0.13, 1.4);
    twigHand(hR, V(0.3, 0.15, -0.95), P.barkLt);
  }

  /* ---------- LEGS — stubby gnarled ROOT-legs, planted wide and low (weight dropped for the
     wind-up), splaying to root-claw feet gripping the ground. Untwisted (roots anchor the base
     while the trunk above torques). ---------- */
  {
    const legL = (sx) => {
      const hip = V(sx * L.hipHalf, L.hipY - 0.02, 0.0);
      const knee = V(sx * 0.150, 0.150, 0.05);
      const ankle = V(sx * 0.150, 0.055, 0.02);
      tube(hip, knee, 0.058, 0.046, 6, P.bark);
      tube(knee, ankle, 0.044, 0.033, 6, P.barkDk);
      for (const [dx, dz] of [[sx * 0.06, 0.06], [sx * 0.02, 0.09], [-sx * 0.03, 0.06], [sx * 0.03, -0.05]]){
        const rb = V(ankle.x, 0.050, ankle.z);
        const rt = V(ankle.x + dx, 0.02, ankle.z + dz);
        tube(rb, rt, 0.024, 0.008, 5, P.root, { capB:{ hex:P.rootDk, lift:0.004 } });
      }
    };
    legL(-1); legL(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.058, 0), P.discTop);
  }
}
