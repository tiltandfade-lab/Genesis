/* dev/model-qa/creatures/rlm-bright-iron-golem.js — the IRON GOLEM landmark table
   (CONSTRUCT-HUMANOID family, Large), CR 11, realm bright-kingdom, authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, bright-w1 cell 2, port 5352).
   Core identity: the top construct — massive, smooth riveted iron plate (vs. stone-golem's
   rough masonry blocks), a furnace grille glowing in the chest. Bright-kingdom skin: a
   coin-slot golem — treasury-forged, its furnace-glow rendered as bright coin-gold instead
   of raw forge orange, rivet lines picked out like minted seams.

   FEATURE CHECKLIST (the ~1,600-1,900 budget buys):
     1. CONSTRUCT-HUMANOID torso — broad, slab-flat riveted iron plates (smooth curved plate
        segments, NOT masonry blocks — the law-1 distinguisher vs. the stone golem), a deep
        barrel chest that reads as one solid mass.
     2. SIGNATURE — the furnace grille: a rectangular grid of glowing bars set into the chest,
        coin-gold/white-hot at the core cooling to ember at the grille edges — law 3's
        >=140 RGB high-value zone, the single brightest shape in the piece, positioned at
        chest-center so it's the first thing the eye lands on at a squint.
     3. Massive riveted arms — the wind-up arm (right) drawn back full behind the rotated
        torso, elbow bent ~120deg, the fist a huge slab-knuckled iron block; the lead arm
        (left) low and slightly forward, counterbalancing across the torso twist.
     4. Legs — one lead leg (left) planted forward and wide, knee bent, foot crushing into the
        ground; the rear leg (right) trailing, straighter, driving off the back foot — the
        weight-transfer stance of a haymaker in motion, not an at-attention stand.
     5. Blocky construct head — small relative to the torso (a construct's head is vestigial,
        not a face-forward focal point), riveted seam ring at the neck, two dim slot-eyes.
     6. Rivet lines — rows of raised rivet studs following the plate seams (shoulder rims,
        chest-plate borders, knee/elbow joint collars) so the smooth-plate read still carries
        visible constructed detail without breaking into masonry blocks.
     7. Iron value ladder — cool dark iron (near-void flanks) climbing to bright plate-edge
        highlights at the rims/knuckles/rivets, so the body clears the void per law 3's 60 RGB
        floor while the furnace grille alone owns the top of the value range.

   POSE SENTENCE: the slow haymaker wind-up — torso rotated hard toward the trailing (right)
   side, the right fist drawn back full past the hip with the elbow cocked ~120deg, the left
   arm low and forward across the body as counterbalance, the left leg planted wide and deep
   in front with a bent knee crushing the ground while the right leg trails straighter behind,
   driving off the back foot — never a squared, symmetric idle stance; always the half-second
   before the fist starts forward.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY): the spine curve runs pelvis-twist
   -> torso counter-rotation -> shoulder line, one continuous torque line from the planted
   lead hip up through a rotated ribcage to the cocked-back shoulder — the torso TWIST is this
   creature's gesture line (no lateral lean available on a construct-solid frame, so the twist
   carries the "spine is the pose" law), with the head/neck seam countering back toward
   forward-facing so the wind-up doesn't read as looking away from its target.

   Header reason for exceeding a mid-band count (law 3's over-budget allowance): Large apex
   construct — CR 11 landmark, broad plate coverage across a bigger-than-Medium frame, the
   furnace grille's own bar grid, and full rivet-line detailing across five plate zones (chest,
   both shoulders, both knee collars) all cost real tris on a body this size; the count below
   stays inside 2,000 without needing full over-budget justification, but is authored toward
   the top of the band deliberately for the "top construct" mandate.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0. Imported by
   ps1-sheet.html (SETS['bright-w1'], cell 2, fn buildIronGolem). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}
function lerp(a, b, t){ return a.clone().lerp(b, t); }
/* rotate a point around the Y axis by degrees — the torso-twist workhorse */
function rotY(p, deg, pivot){
  const piv = pivot || V(0, 0, 0);
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const x = p.x - piv.x, z = p.z - piv.z;
  return V(piv.x + x * c + z * s, p.y, piv.z - x * s + z * c);
}

export function buildIronGolem(){
  /* ---------- PALETTE (bright-kingdom coin-slot skin: cool dark iron flanks climbing to
     bright plate-edge/rivet highlights, furnace grille reads coin-gold/white-hot at the
     signature zone — the law-3 high-value zone, brightest shape in the piece). ---------- */
  const P = {
    iron: 0x7d8794, ironDk: 0x565f6b, ironLt: 0xa8b2be,       // main plate ladder — R2 self-review: r1 sat too
                                                                 // close to the dithered void, body mass failed
                                                                 // law 3's 60-RGB-over-void floor; lightened whole
    rim: 0xd4dbe2, rivet: 0xeef2f6,                            // bright plate-edge/rivet highlights
    grille: 0x241c10, grilleBar: 0x3a2e1a,                     // grille housing (dark frame around the glow)
    coreGlow: 0xfff8d8, midGlow: 0xffcf52, edgeGlow: 0xd6800f, // white-hot core -> coin-gold -> ember edge
    eye: 0x120e0a, eyeGlow: 0xd8a840,
    disc: 0x2a2620, discTop: 0x342e26,
  };

  /* ===== RIG — torso twist is the gesture line (no lateral spine lean on a solid construct
     frame): TORSO_TWIST_DEG rotates every torso/head/arm-root point around the pelvis pivot,
     carrying shoulders/chest/head through one committed rotation so the wind-up reads as one
     torque line, not features glued onto a square torso. ===== */
  const TORSO_TWIST_DEG = -34;      // torso rotates AWAY from the lead (left) side, winding
                                     // the right shoulder back behind the pelvis
  const HEAD_COUNTER_DEG = 16;      // head/neck counters back toward forward-facing
  const PELVIS_PIVOT = V(0, 0.62, 0);
  function twistTorso(p){ return rotY(p, TORSO_TWIST_DEG, PELVIS_PIVOT); }
  function twistHead(p){ return rotY(p, TORSO_TWIST_DEG + HEAD_COUNTER_DEG, PELVIS_PIVOT); }

  /* ===== LEGS — lead (left) leg planted forward+wide, knee bent, crushing the ground; rear
     (right) leg trailing straighter, driving off the back foot. Legs stay UNTWISTED (they
     root off the pelvis, below the torso-twist pivot) so the plant reads solid under a
     rotating torso — per POSE-ANATOMY law 4, counterpose: hips stay square-planted while the
     torso above twists against them. ===== */
  function legSeg(hip, knee, ankle, hexU, hexL){
    tube(hip, knee, 0.135, 0.115, 8, hexU);
    tube(knee, ankle, 0.110, 0.085, 8, hexL, { phase: Math.PI / 8 });
    return ankle;
  }
  function bigFoot(ankle, dir, hex, hexDk){
    // foot geometry never drops below true ground (y=0.01 floor) regardless of ankle height
    const heel = V(ankle.x - dir.x * 0.06, 0.01, ankle.z - dir.z * 0.06);
    const toe = V(ankle.x + dir.x * 0.22, 0.012, ankle.z + dir.z * 0.22);
    quad(
      ankle.clone().add(V(-0.075, 0, 0)), ankle.clone().add(V(0.075, 0, 0)),
      toe.clone().add(V(0.085, 0, 0)), toe.clone().add(V(-0.085, 0, 0)),
      hex, 0.05
    );
    quad(heel.clone().add(V(-0.08, 0, 0)), heel.clone().add(V(0.08, 0, 0)),
      ankle.clone().add(V(0.075, 0, 0)), ankle.clone().add(V(-0.075, 0, 0)), hexDk, 0.05);
    blob(toe.x, 0.035, toe.z, 0.09, 0.03, 0.11, hex, 6, 3);
  }
  let leftAnkle, rightAnkle;
  {
    // LEAD leg (left, +x) — planted forward and wide, knee bent hard, crushing forward
    const hip = V(0.19, 0.62, 0);
    const knee = V(0.30, 0.30, 0.16);
    const ankle = V(0.27, 0.13, 0.34);
    leftAnkle = legSeg(hip, knee, ankle, P.iron, P.ironDk);
    bigFoot(ankle, norm([0.15, 0, 1]), P.iron, P.ironDk);
  }
  {
    // TRAILING leg (right, -x) — straighter, driving off the back foot
    const hip = V(-0.19, 0.62, 0);
    const knee = V(-0.24, 0.34, -0.10);
    const ankle = V(-0.22, 0.10, -0.22);
    rightAnkle = legSeg(hip, knee, ankle, P.ironDk, P.iron);
    bigFoot(ankle, norm([-0.1, 0, -0.65]), P.ironDk, P.iron);
  }
  /* knee joint collars — bright rivet ring at each knee, per feature 6 */
  for(const kn of [V(0.30, 0.30, 0.16), V(-0.24, 0.34, -0.10)]){
    const r1 = ring(kn, V(0, 1, 0), 0.122, 0.122, 8);
    const r2 = ring(kn.clone().add(V(0, 0.02, 0)), V(0, 1, 0), 0.128, 0.128, 8);
    stitch([r1, r2], () => P.rim);
  }

  /* ===== HIPS/PELVIS BLOCK — square, stays untwisted (the counterpose anchor). ===== */
  {
    const hipBands = [
      { y: 0.50, rx: 0.30, rz: 0.22, hex: P.ironDk },
      { y: 0.60, rx: 0.34, rz: 0.25, hex: P.iron },
      { y: 0.70, rx: 0.32, rz: 0.24, hex: P.iron },
    ];
    stack(hipBands, 12, {});
  }

  /* ===== TORSO — broad slab-flat riveted plate barrel, twisted per the wind-up. ===== */
  {
    const torsoBandsLocal = [
      { y: 0.70,  rx: 0.34, rz: 0.26, hex: P.iron },
      { y: 0.88,  rx: 0.40, rz: 0.30, hex: P.ironLt },
      { y: 1.06,  rx: 0.42, rz: 0.31, hex: P.iron },     // chest — furnace grille rides here
      { y: 1.24,  rx: 0.38, rz: 0.28, hex: P.iron },
      { y: 1.38,  rx: 0.28, rz: 0.22, hex: P.ironDk },   // shoulder-root taper
    ];
    // stack() bands sample n rings between consecutive band y-levels via ring(); replicate
    // that by hand so each ring can be run through twistTorso before stitching.
    const rings = torsoBandsLocal.map(b => ring(V(0, b.y, 0), V(0, 1, 0), b.rx, b.rz, 12).map(twistTorso));
    for(let i = 0; i < rings.length - 1; i++){
      const hexA = torsoBandsLocal[i].hex, hexB = torsoBandsLocal[i + 1].hex;
      stitch([rings[i], rings[i + 1]], (u) => (u < 0.5 ? hexA : hexB));
    }
    capFan(rings[rings.length - 1], twistTorso(V(0, 1.42, 0)), P.ironDk);
    capFan(rings[0].slice().reverse(), twistTorso(V(0, 0.68, 0)), P.ironDk, true);

    /* chest-plate border rivets — a bright seam ring around the chest band (feature 6) */
    const bAouter = ring(V(0, 1.02, 0), V(0, 1, 0), 0.425, 0.315, 12).map(twistTorso);
    const bAinner = ring(V(0, 1.02, 0), V(0, 1, 0), 0.40, 0.29, 12).map(twistTorso);
    stitch([bAinner, bAouter], () => P.rim);
  }

  /* ===== SIGNATURE — the furnace grille: rectangular bar grid set into the chest, white-hot
     core cooling to ember at the edges. Built in LOCAL space then carried through
     twistTorso() so it rides the rotated chest plate. ===== */
  {
    const grilleCenterLocal = V(0.02, 1.06, 0.30);
    const gw = 0.30, gh = 0.24;
    // dark housing frame (recessed panel)
    const frameOuter = [
      grilleCenterLocal.clone().add(V(-gw / 2 - 0.03, gh / 2 + 0.03, 0)),
      grilleCenterLocal.clone().add(V(gw / 2 + 0.03, gh / 2 + 0.03, 0)),
      grilleCenterLocal.clone().add(V(gw / 2 + 0.03, -gh / 2 - 0.03, 0)),
      grilleCenterLocal.clone().add(V(-gw / 2 - 0.03, -gh / 2 - 0.03, 0)),
    ].map(twistTorso);
    quad(frameOuter[0], frameOuter[3], frameOuter[2], frameOuter[1], P.grille, 0.02);

    // horizontal glow bars — center bar brightest (white-hot core), outer bars cooler (ember)
    const barN = 5;
    for(let i = 0; i < barN; i++){
      const t = i / (barN - 1);                  // 0..1 top to bottom
      const distFromCenter = Math.abs(t - 0.5) * 2; // 0 at center, 1 at edges
      const y = gh / 2 - t * gh;
      const hex = distFromCenter < 0.3 ? P.coreGlow : (distFromCenter < 0.7 ? P.midGlow : P.edgeGlow);
      const a = grilleCenterLocal.clone().add(V(-gw / 2 + 0.02, y + 0.018, 0.005));
      const b = grilleCenterLocal.clone().add(V(gw / 2 - 0.02, y + 0.018, 0.005));
      const c = grilleCenterLocal.clone().add(V(gw / 2 - 0.02, y - 0.018, 0.005));
      const d = grilleCenterLocal.clone().add(V(-gw / 2 + 0.02, y - 0.018, 0.005));
      quad(twistTorso(a), twistTorso(d), twistTorso(c), twistTorso(b), hex, 0.03);
      // dark separator bar below (except last)
      if(i < barN - 1){
        const sepY = y - gh / (barN - 1) / 2;
        const sa = grilleCenterLocal.clone().add(V(-gw / 2 + 0.02, sepY + 0.006, 0.006));
        const sb = grilleCenterLocal.clone().add(V(gw / 2 - 0.02, sepY + 0.006, 0.006));
        const sc = grilleCenterLocal.clone().add(V(gw / 2 - 0.02, sepY - 0.006, 0.006));
        const sd = grilleCenterLocal.clone().add(V(-gw / 2 + 0.02, sepY - 0.006, 0.006));
        quad(twistTorso(sa), twistTorso(sd), twistTorso(sc), twistTorso(sb), P.grilleBar, 0.02);
      }
    }
    // frame rim bright highlight — a thin bright quad ring around the housing edge (not a
    // degenerate strip: each edge gets real width so it actually renders, not just a hairline).
    {
      const ro = 0.014;
      const outerA = grilleCenterLocal.clone().add(V(-gw / 2 - ro, gh / 2 + ro, 0.008));
      const outerB = grilleCenterLocal.clone().add(V(gw / 2 + ro, gh / 2 + ro, 0.008));
      const outerC = grilleCenterLocal.clone().add(V(gw / 2 + ro, -gh / 2 - ro, 0.008));
      const outerD = grilleCenterLocal.clone().add(V(-gw / 2 - ro, -gh / 2 - ro, 0.008));
      const innerA = grilleCenterLocal.clone().add(V(-gw / 2, gh / 2, 0.006));
      const innerB = grilleCenterLocal.clone().add(V(gw / 2, gh / 2, 0.006));
      const innerC = grilleCenterLocal.clone().add(V(gw / 2, -gh / 2, 0.006));
      const innerD = grilleCenterLocal.clone().add(V(-gw / 2, -gh / 2, 0.006));
      const oA = twistTorso(outerA), oB = twistTorso(outerB), oC = twistTorso(outerC), oD = twistTorso(outerD);
      const iA = twistTorso(innerA), iB = twistTorso(innerB), iC = twistTorso(innerC), iD = twistTorso(innerD);
      quad(oA, oB, iB, iA, P.midGlow, 0.02);  // top edge
      quad(iB, oB, oC, iC, P.midGlow, 0.02);  // right edge
      quad(iD, iC, oC, oD, P.midGlow, 0.02);  // bottom edge
      quad(oA, iA, iD, oD, P.midGlow, 0.02);  // left edge
    }
  }

  /* ===== SHOULDER RIMS — bright rivet-lined shoulder collars (feature 6), root the arms. ===== */
  const shoulderLLocal = V(0.40, 1.36, -0.02);   // lead-side shoulder (left, low+forward arm)
  const shoulderRLocal = V(-0.40, 1.36, -0.02);  // wind-up shoulder (right, cocked back)
  const shoulderL = twistTorso(shoulderLLocal);
  const shoulderR = twistTorso(shoulderRLocal);
  for(const sh of [shoulderLLocal, shoulderRLocal]){
    const c = twistTorso(sh);
    const r1 = ring(c, V(0, 1, 0), 0.145, 0.145, 8);
    const r2 = ring(c.clone().add(V(0, -0.02, 0)), V(0, 1, 0), 0.155, 0.155, 8);
    stitch([r1, r2], () => P.rim);
  }

  /* ===== ARMS — massive riveted arms, elbows bent ~110-130deg per POSE-ANATOMY law 2.
     WIND-UP arm (right): drawn back full behind the rotated torso, fist past the hip.
     LEAD arm (left): low and forward, counterbalancing across the twist. ===== */
  function armSeg(sh, el, wr, hexU, hexL){
    tube(sh, el, 0.115, 0.095, 7, hexU);
    tube(el, wr, 0.095, 0.078, 7, hexL, { phase: Math.PI / 7 });
    return wr;
  }
  function slabFist(wr, dir, hex, hexRim){
    const dn = norm(dir);
    const c = wr.clone().addScaledVector(dn, 0.05);
    blob(c.x, c.y, c.z, 0.135, 0.115, 0.13, hex, 7, 4);
    // knuckle rivets — 3 small bright studs across the fist face
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), dn).normalize();
    for(const s of [-0.7, 0, 0.7]){
      const p = c.clone().addScaledVector(side, s * 0.09).addScaledVector(dn, 0.09);
      blob(p.x, p.y, p.z, 0.026, 0.024, 0.024, hexRim, 5, 3);
    }
  }
  // WIND-UP arm (right shoulder) — elbow ~120deg, fist drawn back past the hip
  {
    const sh = shoulderR;
    const elLocal = shoulderRLocal.clone().add(V(-0.10, -0.20, -0.34));
    const el = twistTorso(elLocal);
    const wrLocal = elLocal.clone().add(V(0.16, -0.34, -0.16));
    const wr = twistTorso(wrLocal);
    armSeg(sh, el, wr, P.ironDk, P.iron);
    slabFist(wr, [0.2, -0.4, -0.6], P.ironDk, P.rim);
    // elbow rivet collar
    const r1 = ring(el, V(0.3, -0.6, -0.7), 0.10, 0.10, 6);
    const r2 = ring(el.clone().add(V(0.01, 0.01, 0.01)), V(0.3, -0.6, -0.7), 0.105, 0.105, 6);
    stitch([r1, r2], () => P.rim);
  }
  // LEAD arm (left shoulder) — low, forward, counterbalancing across the body
  {
    const sh = shoulderL;
    const elLocal = shoulderLLocal.clone().add(V(0.06, -0.28, 0.20));
    const el = twistTorso(elLocal);
    const wrLocal = elLocal.clone().add(V(-0.14, -0.30, 0.22));
    const wr = twistTorso(wrLocal);
    armSeg(sh, el, wr, P.iron, P.ironLt);
    slabFist(wr, [-0.35, -0.5, 0.5], P.iron, P.rim);
    const r1 = ring(el, V(-0.4, -0.6, 0.6), 0.10, 0.10, 6);
    const r2 = ring(el.clone().add(V(0.01, 0.01, 0.01)), V(-0.4, -0.6, 0.6), 0.105, 0.105, 6);
    stitch([r1, r2], () => P.rim);
  }

  /* ===== HEAD — small blocky construct head, riveted neck seam, dim slot-eyes. Head counters
     back toward forward-facing per POSE-ANATOMY law 3 (shoulders ride with the twisted arm,
     head/neck counters the opposite way). ===== */
  {
    const neckLocal = V(0, 1.42, 0);
    const neck = twistHead(neckLocal);
    const r1 = ring(neckLocal, V(0, 1, 0), 0.13, 0.11, 8).map(twistHead);
    const r2 = ring(neckLocal.clone().add(V(0, 0.03, 0)), V(0, 1, 0), 0.135, 0.115, 8).map(twistHead);
    stitch([r1, r2], () => P.rim);   // neck rivet seam

    const headBandsLocal = [
      { y: 1.45, rx: 0.15, rz: 0.14, hex: P.iron },
      { y: 1.56, rx: 0.17, rz: 0.16, hex: P.ironLt },
      { y: 1.66, rx: 0.14, rz: 0.13, hex: P.iron },
    ];
    const hRings = headBandsLocal.map(b => ring(V(0, b.y, 0), V(0, 1, 0), b.rx, b.rz, 8).map(twistHead));
    for(let i = 0; i < hRings.length - 1; i++){
      stitch([hRings[i], hRings[i + 1]], () => headBandsLocal[i].hex);
    }
    capFan(hRings[hRings.length - 1], twistHead(V(0, 1.70, 0)), P.ironDk);

    // slot eyes — dim ember glow, low on the head block
    for(const side of [-1, 1]){
      const eLocal = V(side * 0.075, 1.53, 0.135);
      const e = twistHead(eLocal);
      blob(e.x, e.y, e.z, 0.028, 0.012, 0.01, P.eye, 4, 2);
      const gLocal = eLocal.clone().add(V(0, 0, 0.01));
      const g = twistHead(gLocal);
      blob(g.x, g.y, g.z, 0.018, 0.007, 0.006, P.eyeGlow, 4, 2);
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
