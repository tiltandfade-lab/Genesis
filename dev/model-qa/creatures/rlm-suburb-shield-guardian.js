/* dev/model-qa/creatures/rlm-suburb-shield-guardian.js — the SHIELD GUARDIAN landmark table
   (CONSTRUCT-HUMANOID family, Large), CR 7, realm suburb, authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, suburb-w1 cell 1, port 5391).
   Core identity: the amulet-bound bodyguard construct — a covenant-bound guardian that trims
   anything grown too tall. Distinct from iron/stone/clay/flesh golems: rounded bronze-wood
   plating (organic curved sections, not riveted slab-iron or masonry block), a keyhole-and-amulet
   slot glowing in the chest (the master's amulet locks the construct's will), oversized forearms
   built for blocking blows meant for someone else.

   FEATURE CHECKLIST (the ~1,500-1,850 budget buys):
     1. CONSTRUCT-HUMANOID torso — rounded bronze-wood plate segments (smooth curved barrel,
        wood-grain-dark seams between bronze bands — the law-1 distinguisher vs. slab-riveted
        iron and blocky masonry golems), a deep barrel chest.
     2. SIGNATURE — the keyhole-and-amulet slot: a dark keyhole-shaped recess set into the
        chest with a glowing violet-white amulet disc seated inside it, law 3's >=140 RGB
        high-value zone, the single brightest/coolest-toned shape in the piece (contrasts the
        warm bronze/teak body) so it reads first at a squint as the "master's ward."
     3. Oversized forearms — both forearms built noticeably thicker/longer than the biceps
        (a bodyguard's blocking tools), raised and CROSSED in an X in front of the chest/face,
        elbows bent ~110-130deg per POSE-ANATOMY law 2.
     4. Legs — braced wide sideways-on, front (lead) leg planted forward with a bent knee
        taking the impact, rear leg driven back straighter bracing against the shove — the
        wall-brace stance of something about to eat a blow, not an at-attention stand.
     5. Blocky construct head — small relative to the torso, wood-grain seam ring at the neck,
        two dim ward-lit slot-eyes, no face-forward focal point (a construct doesn't need one).
     6. Wood-grain seam lines — dark teak seams following the plate bands (shoulder rims, chest
        border, knee/elbow joint collars, forearm bands) so the rounded-plate read still carries
        visible constructed detail without breaking into rivets or block-lines.
     7. Bronze/teak value ladder — dark teak-brown flanks (near-void) climbing to bright bronze
        plate-edge highlights at rims/knuckles/seams, so the body clears the void per law 3's
        60 RGB floor while the cool violet amulet alone owns the top/coolest of the value range.

   POSE SENTENCE: the interpose — braced sideways-on like a wall between the master and the
   blow, weight low and wide with the lead leg planted forward and bent, the rear leg driving
   back straighter to brace the shove, torso angled to present a narrow bracing profile, and
   both oversized forearms raised and crossed in an X-block in front of the chest and face —
   never a squared, symmetric idle stand; always the instant before impact lands on the shield
   instead of the ward.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY): the spine curve runs a shallow
   brace-lean — hips shifted back and down over the planted rear foot, ribcage leaning forward
   and rotating slightly toward the lead side to square the block into the incoming line, the
   neck/head countering back upright so the construct still "faces" what it's blocking — one
   continuous lean-and-counter line from pelvis to skull, not a plumb column with arms bolted on.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0. Imported by
   ps1-sheet.html (SETS['suburb-w1'], cell 1, fn buildShieldGuardian). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}
/* rotate a point around the Y axis by degrees — the torso-lean-toward-block workhorse */
function rotY(p, deg, pivot){
  const piv = pivot || V(0, 0, 0);
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const x = p.x - piv.x, z = p.z - piv.z;
  return V(piv.x + x * c + z * s, p.y, piv.z - x * s + z * c);
}
/* rotate a point around the X axis by degrees — the forward brace-lean workhorse */
function rotX(p, deg, pivot){
  const piv = pivot || V(0, 0, 0);
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const y = p.y - piv.y, z = p.z - piv.z;
  return V(p.x, piv.y + y * c - z * s, piv.z + y * s + z * c);
}

export function buildShieldGuardian(){
  /* ---------- PALETTE (bronze/teak covenant-guardian skin: warm dark-teak flanks climbing to
     bright bronze plate-edge highlights, keyhole amulet reads cool violet-white — the law-3
     high-value zone, the coolest/brightest shape in the piece against an all-warm body). ---------- */
  const P = {
    bronze: 0x9a7448, bronzeDk: 0x5f4529, bronzeLt: 0xc79c62,   // main plate ladder
    teak: 0x3a2a1a, teakDk: 0x241a10,                            // wood-grain seams / dark recesses
    rim: 0xe0b878, seamLt: 0xd4a25e,                             // bright plate-edge / seam highlights
    keyhole: 0x181018,                                           // dark keyhole housing
    amuletCore: 0xf5f0ff, amuletMid: 0xb6a0f0, amuletEdge: 0x6a4fb8, // white-violet core -> violet -> deep violet edge
    eye: 0x140f0a, eyeGlow: 0x9a80e0,
    disc: 0x2a2018, discTop: 0x342820,
  };

  /* ===== RIG — the brace-lean is the gesture line: LEAN_DEG rotates every torso/head/arm-root
     point forward around the pelvis pivot (rotX), ROT_DEG angles the torso slightly toward the
     lead side (rotY) so the block squares into the incoming line — carrying shoulders/chest/
     head through one committed brace, not features glued onto a square torso. ===== */
  const LEAN_DEG = 7;          // torso leans forward into the brace (R2 self-review: r1's 14deg
                                 // lean compounded with ROT_DEG collapsed the whole figure into
                                 // an illegible diagonal blob — pulled back to a subtle brace)
  const ROT_DEG = -9;           // torso rotates toward the lead (left) side, squaring the block
  const HEAD_COUNTER_DEG = -5;  // head/neck counters back upright so it still "faces" the blow
  const PELVIS_PIVOT = V(0, 0.60, -0.02);
  function brace(p){ return rotX(rotY(p, ROT_DEG, PELVIS_PIVOT), LEAN_DEG, PELVIS_PIVOT); }
  function braceHead(p){ return rotX(rotY(p, ROT_DEG + HEAD_COUNTER_DEG, PELVIS_PIVOT), LEAN_DEG - 6, PELVIS_PIVOT); }

  /* ===== LEGS — wide sideways-on brace: lead (left) leg planted forward, knee bent, taking the
     impact; rear (right) leg driven back straighter, bracing the shove. Legs stay UNROTATED
     (root off the pelvis, below the pivot) so the plant reads solid under the leaning torso —
     per POSE-ANATOMY law 4, counterpose: feet stay wide-planted while the torso above leans. ===== */
  function legSeg(hip, knee, ankle, hexU, hexL){
    tube(hip, knee, 0.145, 0.120, 8, hexU);
    tube(knee, ankle, 0.115, 0.088, 8, hexL, { phase: Math.PI / 8 });
    return ankle;
  }
  function bigFoot(ankle, dir, hex, hexDk){
    const heel = V(ankle.x - dir.x * 0.06, 0.01, ankle.z - dir.z * 0.06);
    const toe = V(ankle.x + dir.x * 0.22, 0.012, ankle.z + dir.z * 0.22);
    quad(
      ankle.clone().add(V(-0.08, 0, 0)), ankle.clone().add(V(0.08, 0, 0)),
      toe.clone().add(V(0.09, 0, 0)), toe.clone().add(V(-0.09, 0, 0)),
      hex, 0.05
    );
    quad(heel.clone().add(V(-0.085, 0, 0)), heel.clone().add(V(0.085, 0, 0)),
      ankle.clone().add(V(0.08, 0, 0)), ankle.clone().add(V(-0.08, 0, 0)), hexDk, 0.05);
    blob(toe.x, 0.035, toe.z, 0.095, 0.032, 0.115, hex, 6, 3);
  }
  {
    // LEAD leg (left, +x) — planted forward and wide, knee bent, taking the impact.
    // R2b fix (second-pass flag: "lead leg is hidden"): the old hip/knee/ankle x-offsets grew
    // slower than the z-forward reach, so in the dimetric camera projection (screen-x ~ x-z) the
    // lead foot's screen position crossed OVER the rear leg's and hid behind it. Widened the x
    // spread at every joint so x dominates z the whole way down (also restored a real knee bend —
    // the first widen pass over-straightened it to ~170deg; the knee now bulges forward to
    // ~122deg per POSE-ANATOMY law 2) and pulled the toe direction off pure +z (was drifting the
    // toe's screen position away from the ankle, reading as a detached blob) so the foot stays
    // visually attached to the leg.
    const hip = V(0.28, 0.60, -0.02);
    const knee = V(0.40, 0.32, 0.30);
    const ankle = V(0.46, 0.12, 0.26);
    legSeg(hip, knee, ankle, P.bronze, P.bronzeDk);
    bigFoot(ankle, norm([0.6, 0, 0.7]), P.bronze, P.bronzeDk);
  }
  {
    // REAR leg (right, -x) — driven back straighter, bracing the shove (kept near-straight,
    // ~173deg, per the pose sentence). R2b fix: widening x alone wasn't enough — this leg's hip
    // sits inside the torso's own footprint, so in the orthographic camera's z-buffer the torso
    // occluded almost the entire thigh+shin regardless of color (verified with a pure-red
    // diagnostic bake). Cut the z (backward) reach way down and pushed x hard sideways instead —
    // depth into the torso was what hid it, not lateral position — so the shin+foot now clear the
    // torso's silhouette edge and read as a connected leg instead of a floating foot. Also
    // brightened to bronzeLt/bronze (was bronzeDk/bronze) so what's visible clears the void floor.
    const hip = V(-0.30, 0.60, -0.02);
    const knee = V(-0.50, 0.30, -0.08);
    const ankle = V(-0.58, 0.12, -0.10);
    legSeg(hip, knee, ankle, P.bronzeLt, P.bronze);
    bigFoot(ankle, norm([-0.3, 0, -0.85]), P.bronze, P.bronzeDk);
  }
  /* knee joint collars — bright wood-grain seam ring at each knee, per feature 6 */
  for(const kn of [V(0.40, 0.32, 0.30), V(-0.50, 0.30, -0.08)]){
    const r1 = ring(kn, V(0, 1, 0), 0.128, 0.128, 8);
    const r2 = ring(kn.clone().add(V(0, 0.02, 0)), V(0, 1, 0), 0.134, 0.134, 8);
    stitch([r1, r2], () => P.seamLt);
  }

  /* ===== HIPS/PELVIS BLOCK — stays unrotated (the counterpose anchor). ===== */
  {
    const hipBands = [
      { y: 0.48, rx: 0.30, rz: 0.24, hex: P.bronzeDk },
      { y: 0.58, rx: 0.34, rz: 0.27, hex: P.bronze },
      { y: 0.68, rx: 0.32, rz: 0.26, hex: P.bronze },
    ];
    stack(hipBands, 12, {});
  }

  /* ===== TORSO — rounded bronze-wood plate barrel, braced per the lean+twist. ===== */
  {
    const torsoBandsLocal = [
      { y: 0.68,  rx: 0.34, rz: 0.27, hex: P.bronze },
      { y: 0.86,  rx: 0.41, rz: 0.32, hex: P.bronzeLt },
      { y: 1.05,  rx: 0.44, rz: 0.34, hex: P.bronze },     // chest — amulet slot rides here
      { y: 1.23,  rx: 0.40, rz: 0.30, hex: P.bronze },
      { y: 1.37,  rx: 0.29, rz: 0.23, hex: P.bronzeDk },   // shoulder-root taper
    ];
    const rings = torsoBandsLocal.map(b => ring(V(0, b.y, 0), V(0, 1, 0), b.rx, b.rz, 12).map(brace));
    for(let i = 0; i < rings.length - 1; i++){
      const hexA = torsoBandsLocal[i].hex, hexB = torsoBandsLocal[i + 1].hex;
      stitch([rings[i], rings[i + 1]], (u) => (u < 0.5 ? hexA : hexB));
    }
    capFan(rings[rings.length - 1], brace(V(0, 1.41, 0)), P.bronzeDk);
    capFan(rings[0].slice().reverse(), brace(V(0, 0.66, 0)), P.bronzeDk, true);

    /* chest-plate border seam — a bright wood-grain ring around the chest band (feature 6) */
    const bAouter = ring(V(0, 1.01, 0), V(0, 1, 0), 0.445, 0.335, 12).map(brace);
    const bAinner = ring(V(0, 1.01, 0), V(0, 1, 0), 0.42, 0.31, 12).map(brace);
    stitch([bAinner, bAouter], () => P.seamLt);
  }

  /* ===== SIGNATURE — the keyhole-and-amulet slot: dark keyhole recess set into the chest with
     a glowing violet-white amulet disc seated inside. Built in LOCAL space then carried through
     brace() so it rides the leaning/rotated chest plate. ===== */
  {
    // R2b fix (second-pass flag: "amulet is small and half-occluded"): dropped onto the lower
    // chest/belly plate (was riding right where the crossed-forearm guard sat, y=1.05) and
    // enlarged ~30% across the board so it clears the arms' new crossing zone (see ARMS below,
    // which now stays above y~1.02) and reads as the single brightest/coolest shape at a squint.
    const keyCenterLocal = V(0.02, 0.85, 0.37);
    // dark keyhole housing (circle body + narrow slot below, built as two stacked blobs read as
    // one silhouette shape)
    const kc = brace(keyCenterLocal);
    blob(kc.x, kc.y, kc.z, 0.20, 0.20, 0.035, P.keyhole, 10, 3);
    const slotLocal = keyCenterLocal.clone().add(V(0, -0.17, 0.002));
    const sc = brace(slotLocal);
    blob(sc.x, sc.y, sc.z, 0.075, 0.11, 0.03, P.keyhole, 8, 3);

    // amulet disc seated in the keyhole — concentric rings, white-hot core -> violet -> deep-violet edge
    const discRings = [
      { r: 0.15, hex: P.amuletEdge },
      { r: 0.10, hex: P.amuletMid },
      { r: 0.05, hex: P.amuletCore },
    ];
    for(const dr of discRings){
      const c = keyCenterLocal.clone().add(V(0, 0, 0.035));
      blob(brace(c).x, brace(c).y, brace(c).z, dr.r, dr.r, 0.02, dr.hex, 10, 2);
    }
    // amulet rim highlight — thin bright ring around the disc edge
    {
      const r1 = ring(keyCenterLocal.clone().add(V(0, 0, 0.04)), V(0, 0, 1), 0.17, 0.17, 12).map(brace);
      const r2 = ring(keyCenterLocal.clone().add(V(0, 0, 0.038)), V(0, 0, 1), 0.16, 0.16, 12).map(brace);
      stitch([r1, r2], () => P.amuletMid);
    }
  }

  /* ===== SHOULDER RIMS — bright wood-grain-lined shoulder collars (feature 6), root the arms. ===== */
  const shoulderLLocal = V(0.42, 1.35, -0.02);   // lead-side shoulder
  const shoulderRLocal = V(-0.42, 1.35, -0.02);  // rear-side shoulder
  const shoulderL = brace(shoulderLLocal);
  const shoulderR = brace(shoulderRLocal);
  for(const sh of [shoulderLLocal, shoulderRLocal]){
    const c = brace(sh);
    const r1 = ring(c, V(0, 1, 0), 0.15, 0.15, 8);
    const r2 = ring(c.clone().add(V(0, -0.02, 0)), V(0, 1, 0), 0.16, 0.16, 8);
    stitch([r1, r2], () => P.seamLt);
  }

  /* ===== ARMS — oversized forearms (noticeably thicker/longer than the biceps), raised and
     CROSSED in an X-block in front of the chest/face. Elbows bent ~115-130deg per POSE-ANATOMY
     law 2. Right arm crosses toward the left (upper), left arm crosses toward the right
     (lower) so the X reads clearly without the forearms fighting for the same depth. ===== */
  function armSeg(sh, el, wr, hexU, hexL, bicepR0, bicepR1, forearmR0, forearmR1){
    tube(sh, el, bicepR0, bicepR1, 7, hexU);
    tube(el, wr, forearmR0, forearmR1, 7, hexL, { phase: Math.PI / 7 });
    return wr;
  }
  function slabForearmEnd(wr, dir, hex, hexRim){
    const dn = norm(dir);
    const c = wr.clone().addScaledVector(dn, 0.05);
    blob(c.x, c.y, c.z, 0.16, 0.13, 0.15, hex, 7, 4);
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), dn).normalize();
    for(const s of [-0.7, 0, 0.7]){
      const p = c.clone().addScaledVector(side, s * 0.10).addScaledVector(dn, 0.10);
      blob(p.x, p.y, p.z, 0.028, 0.026, 0.026, hexRim, 5, 3);
    }
  }
  // RIGHT arm (rear shoulder) — crosses toward the lead side. R2b fix (second-pass flag: "the
  // crossed forearms read as one rounded mass"): r1/R2's two forearms ran nearly PARALLEL
  // through the same point (both sweeping +x, both landing near the same y/z), so their tubes
  // lay flush against each other with no gap. Kept the R2 cap (wrist stays well below head
  // y=1.44, learned from the earlier head-swallow regression) but swung this arm's crossing
  // band HIGH (el/wr y 1.22->1.35) while the left arm's band (below) stays LOW (y 1.02->1.07) —
  // a real ~0.25-0.3u vertical gap opens where the two forearms cross, reading as a genuine
  // X instead of a merged blob, and the whole band sits above the amulet (now at y=0.85).
  {
    const sh = shoulderR;
    const elLocal = V(-0.28, 1.22, 0.22);
    const el = brace(elLocal);
    const wrLocal = V(0.20, 1.35, 0.42);
    const wr = brace(wrLocal);
    armSeg(sh, el, wr, P.bronzeDk, P.bronze, 0.115, 0.10, 0.155, 0.125);
    slabForearmEnd(wr, [0.5, 0.15, -0.1], P.bronzeDk, P.rim);
    const r1 = ring(el, V(0.5, -0.2, 0.7), 0.115, 0.115, 6);
    const r2 = ring(el.clone().add(V(0.01, 0.01, 0.01)), V(0.5, -0.2, 0.7), 0.12, 0.12, 6);
    stitch([r1, r2], () => P.seamLt);
  }
  // LEFT arm (lead shoulder) — crosses toward the rear side, LOW band (see note above), passing
  // clearly below the right forearm's high band so the two read as a crossed X with daylight
  // between them, guarding the chest without sitting on top of the (now lower) amulet.
  {
    const sh = shoulderL;
    const elLocal = V(0.28, 1.07, 0.18);
    const el = brace(elLocal);
    const wrLocal = V(-0.22, 1.02, 0.34);
    const wr = brace(wrLocal);
    armSeg(sh, el, wr, P.bronze, P.bronzeLt, 0.115, 0.10, 0.155, 0.125);
    slabForearmEnd(wr, [-0.5, 0.1, 0.0], P.bronze, P.rim);
    const r1 = ring(el, V(-0.5, -0.2, 0.6), 0.115, 0.115, 6);
    const r2 = ring(el.clone().add(V(0.01, 0.01, 0.01)), V(-0.5, -0.2, 0.6), 0.12, 0.12, 6);
    stitch([r1, r2], () => P.seamLt);
  }

  /* ===== HEAD — small blocky construct head, wood-grain neck seam, dim ward-lit slot-eyes.
     Head counters back upright per POSE-ANATOMY law 3 (shoulders ride with the leaning torso,
     head/neck counters the opposite way so the construct still "faces" the blow). ===== */
  {
    const neckLocal = V(0, 1.41, 0);
    const r1 = ring(neckLocal, V(0, 1, 0), 0.135, 0.115, 8).map(braceHead);
    const r2 = ring(neckLocal.clone().add(V(0, 0.03, 0)), V(0, 1, 0), 0.14, 0.12, 8).map(braceHead);
    stitch([r1, r2], () => P.seamLt);   // neck wood-grain seam

    const headBandsLocal = [
      { y: 1.44, rx: 0.155, rz: 0.145, hex: P.bronze },
      { y: 1.55, rx: 0.175, rz: 0.165, hex: P.bronzeLt },
      { y: 1.65, rx: 0.145, rz: 0.135, hex: P.bronze },
    ];
    const hRings = headBandsLocal.map(b => ring(V(0, b.y, 0), V(0, 1, 0), b.rx, b.rz, 8).map(braceHead));
    for(let i = 0; i < hRings.length - 1; i++){
      stitch([hRings[i], hRings[i + 1]], () => headBandsLocal[i].hex);
    }
    capFan(hRings[hRings.length - 1], braceHead(V(0, 1.69, 0)), P.bronzeDk);

    // slot eyes — dim ward-violet glow, low on the head block
    for(const side of [-1, 1]){
      const eLocal = V(side * 0.078, 1.52, 0.14);
      const e = braceHead(eLocal);
      blob(e.x, e.y, e.z, 0.03, 0.013, 0.01, P.eye, 4, 2);
      const gLocal = eLocal.clone().add(V(0, 0, 0.01));
      const g = braceHead(gLocal);
      blob(g.x, g.y, g.z, 0.019, 0.008, 0.006, P.eyeGlow, 4, 2);
    }
  }

  /* base disc (Large: r=0.62) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.62, 0.62, 20);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.60, 0.60, 20);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
