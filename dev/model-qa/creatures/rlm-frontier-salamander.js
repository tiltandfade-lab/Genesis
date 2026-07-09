/* dev/model-qa/creatures/rlm-frontier-salamander.js — SALAMANDER (fire-snake, elemental
   naga-build), Large, CR 5, realm frontier, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000
   band (foundry pilot, frontier-w2 cell 5, port 5335). ANATOMY per docs/ANATOMY-CANON.md's
   SERPENTINE family note: "naga: same tube for the lower body, splice a humanoid torso at the
   neck beads where the tube widens to shoulders" — a pre-coiled serpentine tail carries a
   humanoid torso + arms reared out of it. Core identity: the heat-mirage serpent that strikes
   at high noon — a fire-elemental snake-man wreathed in flame, coiled to strike.

   FEATURE CHECKLIST (the ~1,400-1,800 budget buys):
     1. SERPENTINE lower body — a coiled tube (2 stacked loops, D-cross-section per the family
        note) planted as the base, the "string of beads" widening through the front third then
        pinching at a neck-bead ring where it splices into the torso (the naga seam).
     2. HUMANOID torso + arms rising from the coil — a reared, twisted ribcage/torso, two arms
        (elbow-bent per POSE-ANATOMY law 2), one gripping a curved blade mid-thrust.
     3. SIGNATURE — the flame-tongue crest: a ridge of jagged flame-shaped fin spikes running
        the full spine from tail-tip up the coil and up the torso's back to the skull, carrying
        the law-3 high-value ladder (near-white core -> deep red edge, the fire-elemental
        palette pattern), the single loudest feature at the silhouette's highest/liveliest edge.
     4. Head — a wedge serpent skull (per the family note: lance/arrowhead top-down, low
        flattened wedge side-on, forked-tongue sliver) with small backswept horn-nubs and two
        ember eye-glows, thrown back in the strike-rear.
     5. The blade — a curved sword gripped in the forward hand, held high and back at the top
        of the wind-up, itself carrying a thin flame-ladder edge so the weapon reads as part of
        the heat signature, not a separate gray prop.
     6. Heat-shimmer scatter — small free-floating ember/spark blobs around the blade tip and
        crest peaks, near-white-hot, selling "mid strike, air still cooking."
     7. Flame-ladder body palette — dark charcoal-scaled coil/torso base against the near-white
        -> orange -> deep-red crest ladder (law-3 zone), ember-amber eye glow, so the signature
        carries the brightest values in the piece per law 4.

   POSE SENTENCE: the noon strike — tail coiled and braced in two ground-planted loops, torso
   reared up and twisted hard toward the blade side, the curved blade raised high and back at
   the top of a downward thrust, the free arm thrown back low in counterpose, head snapped back
   and twisted to track the strike line, crest blazing the length of the spine — never a
   vertical column with a sword glued on, always the half-second before the blade falls.

   SPINE-GESTURE SENTENCE (POSE-ANATOMY law 1, adapted per the naga splice): the gesture line
   runs unbroken from the coil's own lean (tail base tips toward the blade side) up through the
   torso's twist-and-arch (hips/waist twisted toward the strike, ribcage arched back, shoulders
   riding up with the raised sword arm per law 3) to the head snapped back on the same curve —
   traced hip-to-skull it is one committed C-curve leaning into the strike, not a plumb column;
   the sword arm's shoulder->elbow->wrist reads a visible ~120deg bend (never a straight ram)
   and the off arm thrown back low is the counterpose that keeps the reared torso from reading
   as toppling off the coil.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0 (coil base is
   the widest footprint, per family note "author already in a COIL so the footprint fits a base
   disc"). Imported by ps1-sheet.html (SETS['frontier-w2'], cell 5, fn buildSalamander). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}
function lerp(a, b, t){ return a.clone().lerp(b, t); }

export function buildSalamander(){
  /* ---------- PALETTE (dark charcoal-scale coil/torso base vs. the flame-ladder crest —
     near-white core through orange to deep-red edge — the law-3 high-value zone rides the
     signature crest + blade; embers near-white so the mid-strike heat-shimmer beat survives
     1/3-res). ---------- */
  const P = {
    /* R1 SELF-REVIEW FIX: r1's charcoal scale colors (lum ~20-55) sat almost on the dithered
       void — the render showed only a bright blade-tip and a barely-legible dark torso lump;
       the coil/serpentine mass (the ANATOMY-CANON identity) and the flame crest (the law-4
       signature) both vanished. Lightened and warmed the whole scale/coil ladder well past the
       law-3 60-RGB-over-void floor, and rebuilt the crest as thicker, taller, brighter flame
       panels (not slivers) so it reads as the loudest feature per law 4. */
    scaleDk: 0x4a3226, scale: 0x6b4732, scaleLt: 0x8f6242,     // warm umber-to-tan scale base, well clear of the void
    coilBand: 0xa8683a,                                          // warm bright mid band on the coil bulk
    crestCore: 0xfff6e0, crestHot: 0xffbe52, crestMid: 0xf5842f, // near-white core -> orange, flame ladder
    crestEdge: 0xdb3a14, crestDeep: 0x8f1e08,                    // deep-red trailing edge of the crest
    blade: 0xb4bac2, bladeDk: 0x767c84, bladeEdge: 0xffedbc,      // curved blade, pale flame-ladder edge
    horn: 0x3a2618,
    eye: 0x140a08, eyeGlow: 0xff9a3a,
    ember: 0xfff6e0, emberDk: 0xffbe52,
    disc: 0x2c1e16, discTop: 0x38271c,
  };

  /* ===== RIG — the gesture curve: SPINE_T(0..1) walks tail-tip -> coil -> neck-splice ->
     torso -> skull, carrying every band through one leaning, twisting C-curve. Coil leans
     toward +x (the blade side); torso twists+arches back over the coil; head snaps back on
     the same line. This is the "trace hip-to-skull, one committed curve" test from
     POSE-ANATOMY law 1, adapted for the naga splice (coil lean substitutes for hip lean). */
  function spine(t){
    // t: 0 = tail tip, 0.55 = neck-splice (top of coil / base of torso), 1 = skull
    let x, y, z, leanScale;
    if(t <= 0.55){
      const u = t / 0.55; // 0..1 through the coil
      // two stacked loops descending then rising to the neck-splice, spiraling toward +x/+z
      const loopAng = u * Math.PI * 2.15;
      const loopR = 0.34 * (1 - 0.15 * u);
      x = Math.cos(loopAng) * loopR * 0.55 + u * 0.10;
      z = Math.sin(loopAng) * loopR;
      y = 0.06 + u * 0.34;
      leanScale = u;
    } else {
      const u = (t - 0.55) / 0.45; // 0..1 through torso to skull
      // reared, twisted, arched-back torso rising and leaning hard toward +x
      // R1 SELF-REVIEW FIX: r1's torso rise (0.62u) plus the arm/blade reach stacked on top of
      // it pushed the whole model to ~1.8u tall against a ~0.3u-wide coil footprint — a thin
      // stick, not a coiled fire-serpent. Compressed the rise so the reared torso stays
      // proportionate to the coil mass below it.
      x = 0.10 + u * 0.30;
      y = 0.40 + u * 0.36;
      z = 0.0 - u * 0.08;
      leanScale = 1;
    }
    return V(x, y, z);
  }
  // twist angle (deg, around Y) at parameter t — torso twists toward the blade side as it rises
  function twistDeg(t){
    if(t <= 0.55) return 0;
    const u = (t - 0.55) / 0.45;
    return 34 * u * u; // eases in, strongest at the shoulders/skull
  }
  function rotY(p, deg){
    const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return V(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }

  /* ===== SERPENTINE COIL — string-of-beads tube, D-cross-section via ring(), two stacked
     loops widening through the front third then pinching at the neck-bead splice. ===== */
  const coilSamples = [];
  const COIL_N = 11;
  for(let i = 0; i <= COIL_N; i++){
    const t = (i / COIL_N) * 0.55;
    coilSamples.push(t);
  }
  const coilRadii = [0.030,0.055,0.085,0.115,0.145,0.165,0.175,0.170,0.150,0.115,0.085,0.060];
  const coilRings = [];
  for(let i = 0; i < coilSamples.length; i++){
    const t = coilSamples[i];
    const c = spine(t);
    const nextT = Math.min(t + 0.02, 0.55);
    const nc = spine(nextT);
    const axis = norm([nc.x - c.x, nc.y - c.y + 0.001, nc.z - c.z]);
    const r = coilRadii[i] ?? 0.08;
    coilRings.push(ring(c, axis, r, r * 0.85, 8, i * 0.3));
  }
  const coilHexes = [P.scaleDk, P.scale, P.coilBand, P.scale, P.coilBand, P.scale, P.scaleLt, P.coilBand, P.scale, P.scaleDk, P.scale, P.scaleDk];
  for(let i = 0; i < coilRings.length - 1; i++){
    const hexA = coilHexes[i % coilHexes.length], hexB = coilHexes[(i + 1) % coilHexes.length];
    stitch([coilRings[i], coilRings[i + 1]], (a, b) => (a % 2 === 0 ? hexA : hexB));
  }
  // tail tip cap (blunt taper) + neck-splice cap kept open (torso seats onto it below)
  capFan(coilRings[0], spine(0).clone().add(V(0, -0.02, 0)), P.scaleDk, true);

  /* ===== HUMANOID TORSO + ARMS rising from the coil — splices at the neck-bead ring
     (t=0.55), reared and twisted, per the naga-family note. ===== */
  const neckSplice = coilRings[coilRings.length - 1];
  const torsoBands = [];
  const TORSO_N = 8;
  for(let i = 0; i <= TORSO_N; i++){
    const t = 0.55 + (i / TORSO_N) * 0.40; // stop just before the skull (0.95), head built separately
    torsoBands.push(t);
  }
  const torsoRadii = [0.150,0.175,0.205,0.225,0.230,0.215,0.185,0.150,0.120];
  const torsoHexShades = [P.scale, P.scaleLt, P.scale, P.coilBand, P.scale, P.scaleLt, P.scale, P.scaleDk, P.scale];
  const torsoRings = [neckSplice];
  for(let i = 1; i < torsoBands.length; i++){
    const t = torsoBands[i];
    let c = spine(t);
    c = rotY(V(c.x - spine(0.55).x, c.y, c.z), twistDeg(t)).add(V(spine(0.55).x, 0, 0));
    const nextT = Math.min(t + 0.02, 0.95);
    let nc = spine(nextT);
    nc = rotY(V(nc.x - spine(0.55).x, nc.y, nc.z), twistDeg(nextT)).add(V(spine(0.55).x, 0, 0));
    const axis = norm([nc.x - c.x, nc.y - c.y + 0.001, nc.z - c.z]);
    const rx = torsoRadii[i], rz = rx * 0.72; // flattened D-ish ribcage cross-section
    torsoRings.push(ring(c, axis, rx, rz, 8, i * 0.2 + twistDeg(t) * Math.PI / 180));
  }
  for(let i = 0; i < torsoRings.length - 1; i++){
    const hexA = torsoHexShades[i % torsoHexShades.length], hexB = torsoHexShades[(i + 1) % torsoHexShades.length];
    stitch([torsoRings[i], torsoRings[i + 1]], (a, b) => (a % 2 === 0 ? hexA : hexB));
  }
  const shoulderRing = torsoRings[torsoRings.length - 1];
  const shoulderCenter = torsoBands[torsoBands.length - 1];

  /* helper: world point on the spine curve at t, twisted, for arm/head roots */
  function spineWorld(t){
    const c = spine(t);
    const base = spine(0.55);
    return rotY(V(c.x - base.x, c.y, c.z), twistDeg(t)).add(V(base.x, 0, 0));
  }

  /* ===== ARMS — bend at the elbow ~110-130deg per POSE-ANATOMY law 2. Sword arm (right,
     +x/+z side) raised high-and-back at the top of the wind-up, shoulder riding UP with it
     per law 3; off arm thrown back-and-down low as the counterpose. ===== */
  const shoulderPt = spineWorld(0.95);
  function armSegment(sh, el, wr, hexA, hexB){
    tube(sh, el, 0.058, 0.044, 6, hexA);
    tube(el, wr, 0.042, 0.030, 6, hexB, { phase: Math.PI / 5 });
  }
  // SWORD ARM — raised high above the shoulder, twisted back, elbow bent ~120deg
  let swordWrist;
  {
    const sh = shoulderPt.clone().add(V(0.11, 0.06, 0.02));
    const el = shoulderPt.clone().add(V(0.20, 0.20, -0.05));
    const wr = shoulderPt.clone().add(V(0.11, 0.33, -0.13));
    armSegment(sh, el, wr, P.scale, P.scaleDk);
    blob(sh.x, sh.y, sh.z, 0.075, 0.070, 0.070, P.scaleLt, 6, 4); // shoulder cap rides up with the arm
    blob(wr.x, wr.y, wr.z, 0.036, 0.033, 0.033, P.scale, 5, 3);
    swordWrist = wr;
  }
  // OFF ARM — thrown back and down low, counterpose, elbow bent ~130deg, hand open
  {
    const sh = shoulderPt.clone().add(V(-0.13, 0.02, -0.02));
    const el = sh.clone().add(V(-0.16, -0.16, -0.10));
    const wr = el.clone().add(V(-0.10, -0.20, -0.08));
    armSegment(sh, el, wr, P.scale, P.scaleDk);
    blob(sh.x, sh.y, sh.z, 0.068, 0.064, 0.064, P.scaleLt, 6, 4);
    blob(wr.x, wr.y, wr.z, 0.030, 0.028, 0.028, P.scale, 5, 3);
    for(let k = 0; k < 3; k++){
      const ang = (k / 2 - 0.5) * 0.7;
      const dn = norm([Math.sin(ang) - 0.3, -1, 0]);
      const tip = wr.clone().addScaledVector(dn, 0.06);
      tube(wr, tip, 0.014, 0.006, 3, P.scaleDk);
    }
  }

  /* ===== HEAD — wedge serpent skull, snapped back on the spine curve, small backswept
     horn-nubs, ember eye-glows, forked-tongue sliver. ===== */
  const headBase = spineWorld(0.95).clone().add(V(0.02, 0.10, -0.04));
  const headTip = headBase.clone().add(V(0.10, 0.14, -0.16));
  {
    const backRing = ring(headBase, norm([headTip.x - headBase.x, headTip.y - headBase.y, headTip.z - headBase.z]), 0.095, 0.075, 8, 0);
    const midPt = headBase.clone().lerp(headTip, 0.55).add(V(0, 0.01, 0));
    const midRing = ring(midPt, norm([headTip.x - midPt.x, headTip.y - midPt.y, headTip.z - midPt.z]), 0.070, 0.052, 8, 0.15);
    stitch([backRing, midRing], () => P.scale);
    capFan(midRing, headTip, P.scaleDk, false);
    capFan(backRing, headBase.clone().add(V(0, -0.03, 0.04)), P.scaleDk, true);
    // forked tongue sliver off the snout
    const tongueRoot = headTip.clone().add(V(0, -0.015, -0.01));
    for(const s of [-1, 1]){
      const tip = tongueRoot.clone().add(V(s * 0.018, -0.01, -0.05));
      tube(tongueRoot, tip, 0.006, 0.002, 3, 0x8a1c14);
    }
    // horn nubs, backswept
    for(const s of [-1, 1]){
      const root = headBase.clone().add(V(s * 0.06, 0.05, 0.01));
      const tip = root.clone().add(V(s * 0.03, 0.06, 0.05));
      tube(root, tip, 0.018, 0.004, 4, P.horn);
    }
    // eyes — ember glow, set on the sides of the wedge
    for(const s of [-1, 1]){
      const p = headBase.clone().lerp(headTip, 0.30).add(V(s * 0.055, 0.015, 0));
      blob(p.x, p.y, p.z, 0.018, 0.016, 0.016, P.eye, 5, 3);
      const g = p.clone().addScaledVector(V(s * 0.4, 0.1, -0.9), 0.012);
      blob(g.x, g.y, g.z, 0.009, 0.008, 0.008, P.eyeGlow, 4, 2);
    }
  }

  /* ===== SIGNATURE — the flame-tongue crest: jagged flame-shaped fin spikes running the full
     spine from tail-tip through the coil, up the torso's back, to the skull. Flame-ladder
     value: near-white core -> orange -> deep red trailing edge, law-3's brightest zone. ===== */
  /* R1 SELF-REVIEW FIX: r1's spikes were thin (0.032u wide) single slivers at 0.05-0.11u
     height, riding tight against the body — they read as noise or vanished entirely under the
     1/3-res dither. Rebuilt as wider two-triangle flame PANELS (root pair -> tip pair, real
     quads not degenerate slivers), taller, standing clear of the body silhouette, with a
     bright core panel layered in front of a darker trailing-edge panel so the flame-ladder
     value contrast (law 3) is unmistakable at a squint — this is now the loudest feature. */
  {
    const N_SPIKES = 13;
    for(let i = 0; i < N_SPIKES; i++){
      const t = i / (N_SPIKES - 1); // 0 = tail tip, 1 = skull crown
      let root, backDir;
      if(t <= 0.55 / 0.95){
        const st = t * 0.95;
        root = spine(Math.min(st, 0.55)).clone().add(V(0, 0.015, 0));
        const r = coilRadii[Math.min(Math.round((st / 0.55) * (coilRadii.length - 1)), coilRadii.length - 1)] ?? 0.1;
        backDir = norm([0, 1, -0.35]);
      } else {
        const st = t * 0.95;
        root = spineWorld(Math.min(st, 0.95)).clone();
        backDir = norm([0, 0.8, -0.65]);
      }
      const height = 0.10 + 0.09 * Math.sin(t * Math.PI); // tallest mid-spine, tapers at both ends
      const width = 0.045;
      const tip = root.clone().addScaledVector(backDir, height);
      const side = new THREE.Vector3().crossVectors(V(0, 1, 0), backDir).normalize().multiplyScalar(width);
      const rootL = root.clone().sub(side), rootR = root.clone().add(side);
      const tipL = tip.clone().addScaledVector(side, 0.25), tipR = tip.clone().addScaledVector(side, -0.25);
      const hexEdge = (i % 2 === 0) ? P.crestEdge : P.crestDeep;
      // back (trailing-edge) panel — deep red/orange, full width, sets the silhouette
      quad(rootL, rootR, tipR, tipL, hexEdge, 0.06);
      // front bright core panel — narrower, near-white->orange, layered toward the viewer
      const coreL = root.clone().sub(side.clone().multiplyScalar(0.45)).addScaledVector(backDir, -0.005);
      const coreR = root.clone().add(side.clone().multiplyScalar(0.45)).addScaledVector(backDir, -0.005);
      const coreTip = tip.clone().addScaledVector(backDir, -0.01);
      const hexCore = (i % 3 === 0) ? P.crestCore : P.crestHot;
      quad(coreL, coreR, coreTip, coreTip, hexCore, 0.05);
    }
  }

  /* ===== BLADE — curved sword gripped high-and-back, thin flame-ladder edge so it reads as
     part of the heat signature. ===== */
  {
    const hilt = swordWrist.clone();
    const guardDir = norm([0.35, 0.55, -0.35]);
    const guard = hilt.clone().addScaledVector(guardDir, 0.04);
    const midBlade = guard.clone().addScaledVector(guardDir, 0.13).add(V(0.025, 0.01, -0.015));
    const tipBlade = midBlade.clone().addScaledVector(guardDir, 0.13).add(V(0.05, 0.02, -0.03));
    tube(hilt, guard, 0.018, 0.020, 5, P.bladeDk);
    tube(guard, midBlade, 0.030, 0.024, 5, P.blade);
    tube(midBlade, tipBlade, 0.024, 0.004, 5, P.blade, { capB: { hex: P.blade } });
    // thin bright flame-ladder edge riding the blade's leading side
    const edgeSide = new THREE.Vector3().crossVectors(V(0, 1, 0), guardDir).normalize().multiplyScalar(0.014);
    quad(guard.clone().add(edgeSide), midBlade.clone().add(edgeSide), tipBlade.clone().add(edgeSide), tipBlade.clone().add(edgeSide), P.bladeEdge, 0.02);
    // small crossguard nubs
    const crossSide = new THREE.Vector3().crossVectors(V(0, 1, 0), guardDir).normalize().multiplyScalar(0.045);
    tube(guard.clone().sub(crossSide), guard.clone().add(crossSide), 0.012, 0.012, 4, P.bladeDk);
  }

  /* ===== HEAT-SHIMMER EMBERS — free-floating spark blobs near the blade tip and crest peaks,
     "mid strike, air still cooking." ===== */
  {
    const bladeTipApprox = swordWrist.clone().add(V(0.24, 0.20, -0.20));
    for(let i = 0; i < 4; i++){
      const p = bladeTipApprox.clone().add(V(
        (Math.sin(i * 2.1) * 0.06),
        0.04 + i * 0.035,
        (Math.cos(i * 1.7) * 0.05)
      ));
      const hex = i % 2 === 0 ? P.ember : P.emberDk;
      blob(p.x, p.y, p.z, 0.012, 0.011, 0.011, hex, 4, 2);
    }
    const crestPeak = spineWorld(0.75).clone().add(V(0, 0.16, -0.10));
    for(let i = 0; i < 3; i++){
      const p = crestPeak.clone().add(V((i - 1) * 0.05, 0.02 * i, -0.02 * i));
      blob(p.x, p.y, p.z, 0.010, 0.009, 0.009, P.ember, 4, 2);
    }
  }

  /* ===== BASE DISC — ground y=0, footprint sized to the coil's widest loop. ===== */
  {
    const discRing = ring(V(0, 0.01, 0), V(0, 1, 0), 0.40, 0.40, 10, 0);
    const discTopRing = ring(V(0, 0.0, 0), V(0, 1, 0), 0.40, 0.40, 10, 0);
    capFan(discTopRing, V(0, 0.0, 0), P.disc, false);
    stitch([discTopRing, discRing.map(p => V(p.x, -0.01, p.z))], () => P.discTop);
  }
}
