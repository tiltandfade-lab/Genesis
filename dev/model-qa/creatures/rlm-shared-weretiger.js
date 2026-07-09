/* dev/model-qa/creatures/rlm-shared-weretiger.js — the WERETIGER landmark table (HUMANOID-FELINE
   HYBRID family, Medium, CR 7, CROSS-REALM shared body), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, catchall-w1 cell 5). Core identity: the muscle chief of
   the underboss — barely hiding the stripes under noir skin, elegant/coiled/deadly, POISE over
   werewolf frenzy. Bespoke to the render key "weretiger"; realm reskins ride this chassis, so
   this file authors the NEUTRAL core identity only — no single realm's palette gimmicks.

   FEATURE CHECKLIST (lands under-band at ~700 tris — fine per the guardrail, "under fine if
   features read; padding fails" — every tri below buys a countable feature, none is filler):
     1. HUMANOID-FELINE HYBRID torso per ANATOMY-CANON POSE-ANATOMY: the spine gesture is a
        measured stalking coil, NOT the werewolf frenzy-lunge — shoulders level and controlled,
        hips rotated into a mid-prowl step, weight low and centered (poise, not aggression).
     2. SIGNATURE — the STRIPE BANDS: dark bands laid over an orange-tan coat, countable (law 1),
        running the torso/limbs/tail as discrete quad bands (not a texture trick) so they read at
        1/3-res. High-value zone (law 3, >=140 RGB): the cream muzzle + chest patch, breaking the
        stripe field with a bright anchor.
     3. DIGITIGRADE FELINE LEGS on the humanoid frame: hip -> long thigh -> HIGH backward hock
        (the quadruped-family Z-zigzag adapted to bipedal stance) -> a short near-vertical
        metatarsal -> a compact digitigrade paw, toes just touching down. Both legs mid-stride,
        one driving forward (the stalk step), one trailing to push off.
     4. Long balanced TAIL carried in a live S-curve off the tailbone — arcs out wide, curls back
        toward camera, banded with the same stripe rhythm as the body; the second signature read,
        visible from every turn and the counterweight to the stalking stride.
     5. One clawed hand flexed low at the hip (splayed digits, small claw tips) — the "ready to
        strike, not yet striking" beat; the other arm trails back, elbow bent, balancing the
        stride.
     6. TIGER HEAD, level and locked on the target (not tipped/tilted — POISE): a blended
        muzzle-skull wedge (never two loaves + a gumdrop), triangular ears set high and forward,
        a dark contrasting muzzle bridge stripe, cream cheek/chin patch as the second law-3 zone.

   POSE SENTENCE: the measured stalk — a mid-prowl stride with the lead leg driving forward and
   the trailing leg pushing off through its high hock, weight carried low and level, one clawed
   hand flexed low at the hip ready to strike, the tail arcing out in a live S behind for balance,
   the head carried level and locked dead-on the target — poise and control, never the werewolf's
   lunging frenzy.

   SPINE-GESTURE SENTENCE: the spine runs from a hip band rotated toward the lead leg's stride, up
   through a shallow counter-twist to level, controlled shoulders (poise holds them square-ish
   rather than wrenched open), then the neck carries the tiger head level and forward, locked
   dead-on — a low, coiled, mostly-level line (not a rearing arch) with the tail's S-curve reading
   as the counterweight the spine itself doesn't need to supply.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['catchall-w1'], cell 5, fn buildWeretiger). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildWeretiger(){
  /* ---------- PALETTE (neutral cross-realm core: orange-tan coat, dark stripe bands, cream
     high-value patches — no single realm's tint). ---------- */
  const P = {
    coat: 0xc47a3c, coatDk: 0x9a5c28,
    stripe: 0x150c08, stripeSoft: 0x3a2818,
    cream: 0xead9b8, creamDk: 0xc9b48c,
    pawDk: 0x3a2818,
    claw: 0xe8e0cc,
    eye: 0xd8c840,
    nose: 0x2a1a14,
    tailTip: 0x2a1c12,
    disc: 0x2e2620, discTop: 0x3a3026,
  };

  /* ===== SPINE — low, mostly-level, controlled twist: hip rotates toward the lead (+z stride)
     leg, shoulders stay near-level (poise), head continues level and locked forward. ===== */
  const L = {
    hipY: 0.44, waistY: 0.56, ribY: 0.67, chestY: 0.77, shldY: 0.86, neckY: 0.92,
    jawY: 0.975, browY: 1.03, crownY: 1.065,
  };
  const HIP_ANG = 0.22, SHLD_ANG = 0.07;               // shallow — poise, not a wrench
  const HEAD_ANG = 0.0;                                  // head locked level/forward, not tilted
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }
  function twist(p){
    const t = Math.min(1, Math.max(0, (p.y - L.hipY) / (L.shldY - L.hipY)));
    return rotY(p, HIP_ANG + t * (SHLD_ANG - HIP_ANG));
  }
  const headXf = (p) => rotY(p, HEAD_ANG);

  /* helper: a countable dark stripe band wrapped as a shallow quad belt over a limb/torso point,
     oriented perpendicular to the local +z (front) axis — law 1's countable-feature discipline. */
  function stripeBand(c, rx, rz, halfH, hex){
    quad(V(c.x - rx, c.y - halfH, c.z + rz * 0.4), V(c.x + rx, c.y - halfH, c.z + rz * 0.4),
      V(c.x + rx, c.y + halfH, c.z + rz * 0.4), V(c.x - rx, c.y + halfH, c.z + rz * 0.4), hex, 0.05);
    quad(V(c.x - rx, c.y - halfH, c.z - rz * 0.4), V(c.x + rx, c.y - halfH, c.z - rz * 0.4),
      V(c.x + rx, c.y + halfH, c.z - rz * 0.4), V(c.x - rx, c.y + halfH, c.z - rz * 0.4), hex, 0.05);
  }

  /* ===== LEGS — digitigrade feline: hip -> thigh -> HIGH backward hock -> short vertical
     metatarsal -> compact paw. Lead leg (+z) driving forward mid-stride, trail leg (-z)
     pushed off through its hock, heel lifted. ===== */
  {
    // LEAD leg (+z, front-driving stride)
    const hipLd = twist(V(0.135, L.hipY, 0.02));
    const stifleLd = V(0.155, 0.285, 0.185);              // thigh angles down-forward
    const hockLd = V(0.130, 0.135, 0.075);                // hock kicks HIGH and back
    const pawLd = V(0.150, 0.028, 0.185);                 // metatarsal near-vertical to paw
    tube(hipLd, stifleLd, 0.088, 0.070, 10, P.coat, { capA: { hex: P.coatDk } });
    tube(stifleLd, hockLd, 0.066, 0.046, 10, P.coatDk);
    tube(hockLd, pawLd, 0.044, 0.036, 10, P.pawDk, { capB: { hex: P.pawDk, lift: 0.014 } });
    quad(V(pawLd.x + 0.04, pawLd.y - 0.012, pawLd.z + 0.03), V(pawLd.x - 0.04, pawLd.y - 0.012, pawLd.z + 0.03),
      V(pawLd.x - 0.036, pawLd.y + 0.016, pawLd.z + 0.09), V(pawLd.x + 0.036, pawLd.y + 0.016, pawLd.z + 0.09), P.pawDk, 0.04);
    stripeBand(V((hipLd.x + stifleLd.x) / 2, (hipLd.y + stifleLd.y) / 2, (hipLd.z + stifleLd.z) / 2), 0.075, 0.04, 0.02, P.stripe);
    stripeBand(V((stifleLd.x + hockLd.x) / 2, (stifleLd.y + hockLd.y) / 2, (stifleLd.z + hockLd.z) / 2), 0.055, 0.03, 0.016, P.stripe);

    // TRAIL leg (-z, pushing off through the hock, heel lifted)
    const hipTr = twist(V(-0.135, L.hipY, -0.03));
    const stifleTr = V(-0.150, 0.235, -0.155);
    const hockTr = V(-0.185, 0.16, -0.245);                // hock HIGH+back, driving the push
    const pawTr = V(-0.150, 0.055, -0.195);                // heel lifted off the ground
    tube(hipTr, stifleTr, 0.086, 0.068, 10, P.coat, { capA: { hex: P.coatDk } });
    tube(stifleTr, hockTr, 0.064, 0.044, 10, P.coatDk);
    tube(hockTr, pawTr, 0.042, 0.034, 10, P.pawDk, { capB: { hex: P.pawDk, lift: 0.012 } });
    quad(V(pawTr.x + 0.036, pawTr.y - 0.01, pawTr.z - 0.03), V(pawTr.x - 0.036, pawTr.y - 0.01, pawTr.z - 0.03),
      V(pawTr.x - 0.03, pawTr.y + 0.03, pawTr.z - 0.08), V(pawTr.x + 0.03, pawTr.y + 0.03, pawTr.z - 0.08), P.pawDk, 0.04);
    stripeBand(V((hipTr.x + stifleTr.x) / 2, (hipTr.y + stifleTr.y) / 2, (hipTr.z + stifleTr.z) / 2), 0.073, 0.038, 0.02, P.stripe);
    stripeBand(V((stifleTr.x + hockTr.x) / 2, (stifleTr.y + hockTr.y) / 2, (stifleTr.z + hockTr.z) / 2), 0.052, 0.028, 0.016, P.stripe);
  }

  /* ===== TORSO — lean coiled muscle, low and level, stripe bands wrapping the mass. ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.150, rz: 0.135, hex: P.coat },
    { y: L.waistY, rx: 0.168, rz: 0.150, hex: P.coatDk },
    { y: L.ribY,   rx: 0.195, rz: 0.172, hex: P.coat },
    { y: L.chestY, rx: 0.205, rz: 0.178, hex: P.coatDk },
    { y: L.shldY,  rx: 0.198, rz: 0.165, hex: P.coat },
    { y: L.neckY,  rx: 0.100, rz: 0.092, hex: P.coatDk },
  ];
  stack(torsoBands, 14, { xform: twist });

  /* countable torso stripe bands (law 1) riding the twisted mass, front and back faces */
  for(const yy of [L.hipY + 0.03, L.waistY + 0.02, L.ribY - 0.02, L.ribY + 0.05, L.chestY, L.chestY + 0.07]){
    const c = twist(V(0, yy, 0.17));
    stripeBand(c, 0.14, 0.05, 0.026, P.stripe);
    const cs = twist(V(0.13, yy, 0.06));
    stripeBand(cs, 0.05, 0.09, 0.026, P.stripe);
    const cs2 = twist(V(-0.13, yy, 0.06));
    stripeBand(cs2, 0.05, 0.09, 0.026, P.stripe);
    const cb = twist(V(0, yy, -0.15));
    stripeBand(cb, 0.13, 0.05, 0.026, P.stripe);
  }

  /* cream chest patch — the law-3 high-value zone breaking the stripe field */
  {
    const c = twist(V(0, L.chestY - 0.02, 0.185));
    quad(V(c.x - 0.055, c.y - 0.07, c.z), V(c.x + 0.055, c.y - 0.07, c.z),
      V(c.x + 0.045, c.y + 0.08, c.z + 0.01), V(c.x - 0.045, c.y + 0.08, c.z + 0.01), P.cream, 0.05);
  }

  /* ===== TAIL — long balanced tail in a live S-curve off the tailbone, banded with the stripe
     rhythm. Second signature read; the counterweight to the stalking stride. ===== */
  {
    const t0 = twist(V(0, L.hipY - 0.02, -0.14));
    const t1 = V(-0.18, L.hipY + 0.10, -0.36);
    const t2 = V(-0.06, L.hipY + 0.28, -0.46);
    const t3 = V(0.16, L.hipY + 0.30, -0.30);              // S curls back toward camera
    const t4 = V(0.22, L.hipY + 0.20, -0.12);
    const segs = [t0, t1, t2, t3, t4];
    for(let i = 0; i < segs.length - 1; i++){
      const rA = 0.052 - i * 0.008, rB = 0.052 - (i + 1) * 0.008;
      tube(segs[i], segs[i + 1], rA, rB, 10, i % 2 === 0 ? P.coat : P.coatDk,
        i === segs.length - 2 ? { capB: { hex: P.tailTip } } : undefined);
      const mid = V((segs[i].x + segs[i + 1].x) / 2, (segs[i].y + segs[i + 1].y) / 2, (segs[i].z + segs[i + 1].z) / 2);
      stripeBand(mid, rA * 0.9, rA * 0.9, 0.014, P.stripe);
    }
  }

  /* ===== HEAD — tiger head, level and locked forward (POISE, no tilt). Blended muzzle-skull
     wedge, high forward triangular ears, dark muzzle bridge stripe, cream cheek/chin patch. ===== */
  {
    const headBands = [
      { y: L.jawY,   rx: 0.100, rz: 0.150, hex: P.coat },     // muzzle wedge — extends +z (forward)
      { y: L.browY,  rx: 0.115, rz: 0.120, hex: P.coatDk },
      { y: L.crownY, rx: 0.100, rz: 0.088, hex: P.coat },
    ];
    stack(headBands, 14, { xform: headXf, capTop: { hex: P.coatDk, lift: 0.018 } });

    const jawC = headXf(V(0, L.jawY, 0.14));
    const browC = headXf(V(0, L.browY, 0.10));

    /* muzzle bridge — dark stripe running the length of the wedge, countable law-1 feature */
    quad(V(jawC.x - 0.028, jawC.y - 0.01, jawC.z - 0.06), V(jawC.x + 0.028, jawC.y - 0.01, jawC.z - 0.06),
      V(jawC.x + 0.022, jawC.y + 0.03, jawC.z + 0.10), V(jawC.x - 0.022, jawC.y + 0.03, jawC.z + 0.10), P.stripe, 0.03);

    /* nose tip */
    quad(V(jawC.x - 0.018, jawC.y + 0.01, jawC.z + 0.095), V(jawC.x + 0.018, jawC.y + 0.01, jawC.z + 0.095),
      V(jawC.x + 0.014, jawC.y + 0.03, jawC.z + 0.11), V(jawC.x - 0.014, jawC.y + 0.03, jawC.z + 0.11), P.nose, 0.03);

    /* cream cheek/chin patch — second law-3 high-value zone, level with the locked-forward gaze */
    for(const s of [-1, 1]){
      const p = headXf(V(s * 0.065, L.jawY - 0.03, 0.08));
      quad(V(p.x - 0.026, p.y - 0.024, p.z), V(p.x + 0.026, p.y - 0.024, p.z),
        V(p.x + 0.020, p.y + 0.026, p.z + 0.02), V(p.x - 0.020, p.y + 0.026, p.z + 0.02), P.cream, 0.05);
    }

    /* eyes — locked forward, small bright glints */
    for(const s of [-1, 1]){
      const p = headXf(V(s * 0.075, L.browY + 0.01, 0.075));
      quad(V(p.x - 0.014, p.y - 0.010, p.z), V(p.x + 0.014, p.y - 0.010, p.z),
        V(p.x + 0.012, p.y + 0.012, p.z + 0.01), V(p.x - 0.012, p.y + 0.012, p.z + 0.01), P.eye, 0.04);
    }

    /* R2 SELF-CORRECTION (post r1 engine render): r1's ear tip (crownY+0.13, well above the
       crown cap) read as a single thin antenna spike jutting off the skull — the degenerate
       tip-tip quad plus the excess height broke the silhouette instead of reading as an ear.
       Fixed: a proper 3-cornered triangular ear (front + back faces, each a real 3-point tri)
       tucked lower and closer to the crown, wide-based so it reads as a triangle not a line. */
    for(const s of [-1, 1]){
      const baseFwd = headXf(V(s * 0.075, L.crownY + 0.015, 0.035));
      const baseBack = headXf(V(s * 0.045, L.crownY + 0.005, -0.035));
      const tip = headXf(V(s * 0.095, L.crownY + 0.075, -0.005));
      quad(baseFwd, baseBack, tip, baseFwd, P.coatDk, 0.05);
      quad(baseBack, baseFwd, tip, baseBack, P.coat, 0.05);
    }
  }

  /* ===== ARMS — POSE-ANATOMY law 2/3: shoulders ride, elbows bend 100-150deg. One clawed hand
     flexed low at the hip (ready to strike); the trailing arm balances the stride. ===== */

  /* STRIKE arm (+x, hand flexed low at the hip, claws splayed) */
  const shS = twist(V(0.205, L.shldY - 0.01, 0.02));
  const elS = V(0.255, 0.665, 0.115);
  const wrS = V(0.215, 0.475, 0.155);
  tube(shS, elS, 0.062, 0.052, 10, P.coat);
  tube(elS, wrS, 0.048, 0.038, 10, P.coatDk, { phase: Math.PI / 6 });
  stripeBand(V((shS.x + elS.x) / 2, (shS.y + elS.y) / 2, (shS.z + elS.z) / 2), 0.055, 0.03, 0.016, P.stripe);
  /* flexed clawed hand — a compact palm block + three small claw tips fanned low */
  quad(V(wrS.x - 0.026, wrS.y - 0.024, wrS.z), V(wrS.x + 0.026, wrS.y - 0.024, wrS.z),
    V(wrS.x + 0.022, wrS.y + 0.02, wrS.z + 0.018), V(wrS.x - 0.022, wrS.y + 0.02, wrS.z + 0.018), P.coatDk, 0.04);
  for(let i = -1; i <= 1; i++){
    const cx = wrS.x + i * 0.017, cz = wrS.z + 0.03;
    quad(V(cx - 0.007, wrS.y - 0.03, cz), V(cx + 0.007, wrS.y - 0.03, cz),
      V(cx + 0.003, wrS.y - 0.05, cz + 0.02), V(cx - 0.003, wrS.y - 0.05, cz + 0.02), P.claw, 0.04);
  }

  /* TRAIL arm (-x, elbow bent, balancing the stride) */
  const shT = twist(V(-0.205, L.shldY - 0.01, -0.01));
  const elT = V(-0.245, 0.665, -0.135);
  const wrT = V(-0.190, 0.545, -0.245);
  tube(shT, elT, 0.060, 0.050, 10, P.coat);
  tube(elT, wrT, 0.046, 0.036, 10, P.coatDk, { phase: Math.PI / 6 });
  stripeBand(V((shT.x + elT.x) / 2, (shT.y + elT.y) / 2, (shT.z + elT.z) / 2), 0.053, 0.028, 0.016, P.stripe);
  quad(V(wrT.x - 0.022, wrT.y - 0.02, wrT.z), V(wrT.x + 0.022, wrT.y - 0.02, wrT.z),
    V(wrT.x + 0.018, wrT.y + 0.022, wrT.z + 0.014), V(wrT.x - 0.018, wrT.y + 0.022, wrT.z + 0.014), P.coatDk, 0.04);

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
