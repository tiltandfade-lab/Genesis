/* dev/model-qa/creatures/rlm-suburb-oni.js — the ONI landmark table (HUMANOID family, Large,
   REFINED build per docs/ANATOMY-CANON.md's humanoid note — regal, not brute), CR 8, realm
   suburb, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, suburb-w1
   cell 0, port 5390). Core identity: the shapeshifting host — one small yearly price for
   paradise. The horned ogre-mage: big, elegant, ARMED with the iconic kanabo studded club, a
   fine robe draped over visible muscle, upright REGAL posture (vs. an ogre's slouching brute).

   FEATURE CHECKLIST (the ~1,400-1,700 budget buys):
     1. HUMANOID torso — Large but REFINED: upright spine, broad but not slab-blocky shoulders,
        a fine draped ROBE (open-front, sashed) over a visibly muscled blue-red chest — the
        "elegant vs. brute" distinguisher law 4 asks for.
     2. SIGNATURE (a) — two curling forehead HORNS, pale ivory climbing to dark tips, the
        highest silhouette-breaking feature on the piece (law 2's outline read).
     3. SIGNATURE (b) — the KANABO: a heavy studded iron club resting easy across the left
        shoulder, gripped one-handed, its iron-banded rows of pyramid studs the single loudest
        high-value zone (law 3's >=140 RGB signature carrier).
     4. Tusked grin — two lower tusks jutting up past the lip, small but a legible read at a
        squint alongside the horns.
     5. The gracious-host BOW: torso pitched forward in a shallow bow, right arm swept wide and
        open in welcome (the "come in" gesture), left arm bent up and back to rest the club on
        the shoulder — a threat wearing a host's manners.
     6. Robe trim — a bright sash/collar band and hem-cord picked out in gold-bronze against the
        dark robe cloth, so constructed detail reads without breaking into masonry-style panels.
     7. Blue-red oni skin value ladder — cool indigo-blue flanks climbing to hot vermilion-red
        highlights across the chest/face, clearing the law-3 60-RGB-over-void floor on its own,
        independent of the club's brighter signature zone.

   POSE SENTENCE: the gracious-host bow that is a threat — torso pitched into a shallow forward
   bow, the right arm swept out wide and low in an open "please, come in" welcome, the left arm
   bent sharply up and back so the kanabo rests easy across the left shoulder, weight settled
   back on a planted rear leg with the front leg stepped forward into the bow — never an
   at-attention idle stand; always the half-second of hospitality with the club already in hand.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY): the spine curve runs pelvis (weight
   back on the rear/right leg, hips countered slightly toward the rear) up through a forward-
   hinged ribcage (the bow) to a skull that tips further forward and down than the shoulders —
   one continuous forward-curling C from tailbone to chin — with the shoulders riding
   asymmetrically (right dropped and rolled forward into the sweeping welcome arm, left raised
   to carry the shouldered club), so the bow reads as one gesture line, not a stiff torso with
   two arms bolted on.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0. Imported by
   ps1-sheet.html (SETS['suburb-w1'], cell 0, fn buildOni). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}
/* rotate a point around the X axis by degrees — the forward-bow-hinge workhorse */
function rotX(p, deg, pivot){
  const piv = pivot || V(0, 0, 0);
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const y = p.y - piv.y, z = p.z - piv.z;
  return V(p.x, piv.y + y * c - z * s, piv.z + y * s + z * c);
}

export function buildOni(){
  /* ---------- PALETTE (blue-red oni skin per the brief: cool indigo-blue flanks climbing to
     hot vermilion-red highlights; robe is dark refined cloth w/ gold-bronze trim; kanabo is
     dark iron w/ bright bronze studs — the loudest high-value zone in the piece). ---------- */
  const P = {
    skinDk: 0x3f52a0, skin: 0x6478c8, skinLt: 0xf06478,      // indigo-blue -> hot vermilion-red ladder
    skinHot: 0xffa080,                                        // brightest skin highlight (cheeks/chest ridge)
    robe: 0x3a2c4a, robeDk: 0x2a2038, robeLt: 0x4e3a64,       // dark refined robe cloth (lightened R2 —
                                                                // self-review: r1 body mass sank near the
                                                                // dithered void, failing law 3's 60-RGB floor
    trim: 0xd9a53c, trimBright: 0xf2c860,                     // gold-bronze sash/collar/hem
    hornBase: 0xe8dfc8, hornTip: 0x2a2018,                    // ivory climbing to dark horn tips
    tusk: 0xf0e6cc,
    club: 0x3a342e, clubDk: 0x241f1a, stud: 0xc99a4a, studBright: 0xf0c878, // kanabo iron + bronze studs
    eye: 0x140a08, eyeGlow: 0xffcf40,
    hair: 0x120a0c,
    disc: 0x2a2620, discTop: 0x342e26,
  };

  /* ===== RIG — the forward bow-hinge is the gesture line. BOW_DEG rotates every torso/head/
     arm-root point forward around the hip pivot, per POSE-ANATOMY law 1 (spine curve authored
     first, limbs hang off it). ===== */
  const BOW_DEG = 22;               // torso pitches forward into the shallow host's bow
  const HEAD_BOW_DEG = 14;          // head tips further forward/down than the shoulders (extra bow)
  const HIP_PIVOT = V(0, 0.66, 0.02);
  function bowTorso(p){ return rotX(p, BOW_DEG, HIP_PIVOT); }
  function bowHead(p){ return rotX(p, BOW_DEG + HEAD_BOW_DEG, HIP_PIVOT); }

  /* ===== LEGS — weight settled back on the planted rear (right) leg; front (left) leg stepped
     forward into the bow. Legs stay lightly bent at the knee (never straight sticks), rooted
     below the hip pivot so the bow reads against a grounded stance — counterpose per law 4. ===== */
  function legSeg(hip, knee, ankle, hexU, hexL){
    tube(hip, knee, 0.115, 0.095, 8, hexU);
    tube(knee, ankle, 0.090, 0.070, 8, hexL, { phase: Math.PI / 8 });
    return ankle;
  }
  function foot(ankle, dir, hex){
    const toe = V(ankle.x + dir.x * 0.16, 0.014, ankle.z + dir.z * 0.16);
    blob(toe.x, 0.03, toe.z, 0.075, 0.028, 0.10, hex, 6, 3);
    blob(ankle.x, 0.03, ankle.z, 0.075, 0.03, 0.075, hex, 6, 3);
  }
  {
    // FRONT leg (left, +x) — stepped forward into the bow, knee bent
    const hip = V(0.16, 0.66, 0.02);
    const knee = V(0.20, 0.34, 0.22);
    const ankle = V(0.18, 0.10, 0.26);
    legSeg(hip, knee, ankle, P.robe, P.skinDk);
    foot(ankle, norm([0.1, 0, 1]), P.skinDk);
  }
  {
    // REAR leg (right, -x) — planted, weight-bearing, slight knee bend
    const hip = V(-0.16, 0.66, 0.02);
    const knee = V(-0.18, 0.33, -0.02);
    const ankle = V(-0.17, 0.11, -0.06);
    legSeg(hip, knee, ankle, P.robe, P.skinDk);
    foot(ankle, norm([-0.05, 0, -0.6]), P.skinDk);
  }

  /* ===== HIPS/PELVIS — square, stays UNTWISTED/un-bowed (the counterpose anchor beneath the
     forward-hinging torso). Robe hem starts here. ===== */
  {
    const hipBands = [
      { y: 0.56, rx: 0.19, rz: 0.15, hex: P.robeDk },
      { y: 0.66, rx: 0.23, rz: 0.18, hex: P.robe },
      { y: 0.78, rx: 0.24, rz: 0.19, hex: P.robe },
    ];
    stack(hipBands, 12, {});
    // hem cord — bright trim ring at the robe's lower edge
    const r1 = ring(V(0, 0.58, 0), V(0, 1, 0), 0.195, 0.155, 12);
    const r2 = ring(V(0, 0.605, 0), V(0, 1, 0), 0.205, 0.163, 12);
    stitch([r1, r2], () => P.trim);
  }

  /* ===== TORSO — refined humanoid barrel (not slab-flat construct plate), open-front robe over
     a visibly muscled chest, bowed forward per the gesture. ===== */
  let chestRingLocal, shoulderYLocal;
  {
    const torsoBandsLocal = [
      { y: 0.78, rx: 0.24, rz: 0.19, hex: P.robe },
      { y: 0.96, rx: 0.29, rz: 0.23, hex: P.robeLt },   // open robe lapel line, chest peeks through
      { y: 1.14, rx: 0.31, rz: 0.24, hex: P.skin },      // chest — bare, muscled, oni skin
      { y: 1.30, rx: 0.27, rz: 0.21, hex: P.robe },      // collar / upper chest robe closes back in
      { y: 1.42, rx: 0.19, rz: 0.16, hex: P.robeLt },    // shoulder-root taper
    ];
    const rings = torsoBandsLocal.map(b => ring(V(0, b.y, 0), V(0, 1, 0), b.rx, b.rz, 12).map(bowTorso));
    for(let i = 0; i < rings.length - 1; i++){
      const hexA = torsoBandsLocal[i].hex, hexB = torsoBandsLocal[i + 1].hex;
      stitch([rings[i], rings[i + 1]], (u) => (u < 0.5 ? hexA : hexB));
    }
    capFan(rings[rings.length - 1], bowTorso(V(0, 1.46, 0)), P.robeLt);
    capFan(rings[0].slice().reverse(), bowTorso(V(0, 0.75, 0)), P.robeDk, true);
    chestRingLocal = V(0, 1.14, 0.24);
    shoulderYLocal = 1.42;

    /* bare chest muscle ridge — hot skin highlight running up the sternum (feature 7's brightest
       skin zone, independent of the club) */
    {
      const a = V(-0.05, 1.00, 0.235), b = V(0.05, 1.00, 0.235);
      const c = V(0.06, 1.24, 0.245), d = V(-0.06, 1.24, 0.245);
      quad(bowTorso(a), bowTorso(b), bowTorso(c), bowTorso(d), P.skinHot, 0.05);
    }

    /* collar + sash — bright gold-bronze trim band across the closed upper robe, and a diagonal
       sash from the right shoulder to the left hip (feature 6) */
    {
      const cOuter = ring(V(0, 1.28, 0), V(0, 1, 0), 0.275, 0.215, 12).map(bowTorso);
      const cInner = ring(V(0, 1.26, 0), V(0, 1, 0), 0.26, 0.20, 12).map(bowTorso);
      stitch([cInner, cOuter], () => P.trim);
    }
    {
      // diagonal sash strap, right shoulder -> left hip
      const s1 = bowTorso(V(-0.19, 1.36, 0.08));
      const s2 = bowTorso(V(-0.13, 1.34, 0.16));
      const s3 = bowTorso(V(0.16, 0.80, 0.15));
      const s4 = bowTorso(V(0.10, 0.78, 0.20));
      quad(s1, s2, s3, s4, P.trimBright, 0.04);
    }
  }

  /* ===== SHOULDER RIMS — root the arms, small trim collar (feature 6). ===== */
  const shoulderRLocal = V(0.29, shoulderYLocal - 0.04, -0.01);  // welcome arm (right, swept wide)
  const shoulderLLocal = V(-0.29, shoulderYLocal - 0.04, -0.01); // club arm (left, bent up/back)
  const shoulderR = bowTorso(shoulderRLocal);
  const shoulderL = bowTorso(shoulderLLocal);
  for(const sh of [shoulderRLocal, shoulderLLocal]){
    const c = bowTorso(sh);
    const r1 = ring(c, V(0, 1, 0), 0.105, 0.105, 8);
    const r2 = ring(c.clone().add(V(0, -0.015, 0)), V(0, 1, 0), 0.112, 0.112, 8);
    stitch([r1, r2], () => P.trimBright);
  }

  /* ===== ARMS — elbows bent ~110-150deg per POSE-ANATOMY law 2, shoulders ride with the raised
     arm per law 3. WELCOME arm (right): swept wide and low, open palm, the "come in" gesture.
     CLUB arm (left): bent sharply up and back so the kanabo rests on the shoulder. ===== */
  function armSeg(sh, el, wr, hexU, hexL){
    tube(sh, el, 0.088, 0.072, 7, hexU);
    tube(el, wr, 0.072, 0.058, 7, hexL, { phase: Math.PI / 7 });
    return wr;
  }
  function openHand(wr, dir, hex){
    const dn = norm(dir);
    const c = wr.clone().addScaledVector(dn, 0.04);
    blob(c.x, c.y, c.z, 0.075, 0.06, 0.03, hex, 6, 3);
  }
  let clubGripWr;
  // WELCOME arm (right shoulder) — swept wide+low, elbow ~140deg, open palm. R2 self-review:
  // r1's reach stayed tucked against the torso and vanished into the silhouette — pushed the
  // elbow/wrist further out and forward so the sweep actually breaks the outline (law 2).
  {
    const sh = shoulderR;
    const elLocal = shoulderRLocal.clone().add(V(0.32, -0.10, 0.22));
    const el = bowTorso(elLocal);
    const wrLocal = elLocal.clone().add(V(0.34, -0.02, 0.26));
    const wr = bowTorso(wrLocal);
    armSeg(sh, el, wr, P.skin, P.skinDk);
    openHand(wr, [0.6, 0.05, 0.7], P.skin);
  }
  // CLUB arm (left shoulder) — bent sharply up+back, elbow ~110deg, hand grips near the club haft
  {
    const sh = shoulderL;
    const elLocal = shoulderLLocal.clone().add(V(-0.05, 0.05, -0.16));
    const el = bowTorso(elLocal);
    const wrLocal = elLocal.clone().add(V(0.10, 0.14, -0.08));
    const wr = bowTorso(wrLocal);
    armSeg(sh, el, wr, P.skinDk, P.skin);
    clubGripWr = wr;
  }

  /* ===== SIGNATURE (b) — the KANABO: heavy studded iron club resting across the left shoulder,
     built in LOCAL torso space then carried through bowTorso() so it rides the gesture. Rows of
     bright bronze pyramid studs = the loudest high-value zone in the piece (law 3). ===== */
  {
    const haftBotLocal = shoulderLLocal.clone().add(V(0.14, 0.16, -0.02)); // near the gripping hand
    const haftTopLocal = haftBotLocal.clone().add(V(-0.10, 0.62, 0.28));   // club head rises past the head, angled back
    const haftBot = bowTorso(haftBotLocal), haftTop = bowTorso(haftTopLocal);
    // haft (grip end, narrower)
    tube(haftBot, haftTop.clone().lerp(haftBot, 0.35), 0.028, 0.036, 8, P.clubDk);
    // club head (thick studded barrel, tapered wider toward the top)
    const headBot = haftTop.clone().lerp(haftBot, 0.35);
    tube(headBot, haftTop, 0.036, 0.058, 8, P.club, { capB: { hex: P.club, lift: 0.02 } });

    // studs — 4 rings of pyramid studs around the club head, the brightest shape in the piece
    const studAxis = norm([haftTop.x - headBot.x, haftTop.y - headBot.y, haftTop.z - headBot.z]);
    for(let ringI = 0; ringI < 4; ringI++){
      const t = 0.15 + ringI * 0.24;
      const center = headBot.clone().lerp(haftTop, t);
      const rr = 0.040 + t * 0.020;
      const studRing = ring(center, studAxis, rr, rr, 6);
      for(const p of studRing){
        const outDir = norm([p.x - center.x, p.y - center.y, p.z - center.z]);
        const tip = p.clone().addScaledVector(outDir, 0.026);
        blob(tip.x, tip.y, tip.z, 0.020, 0.020, 0.020, ringI === 1 ? P.studBright : P.stud, 5, 2);
      }
    }
  }

  /* ===== HEAD — refined regal skull, curling ivory horns, tusked grin. Head bows further than
     the torso per POSE-ANATOMY law 3 (the host's nod completing the bow). ===== */
  {
    const neckLocal = V(0, 1.46, 0);
    const neck = bowHead(neckLocal);
    const r1 = ring(neckLocal, V(0, 1, 0), 0.10, 0.09, 8).map(bowHead);
    const r2 = ring(neckLocal.clone().add(V(0, 0.02, 0)), V(0, 1, 0), 0.105, 0.095, 8).map(bowHead);
    stitch([r1, r2], () => P.skinDk);

    const headBandsLocal = [
      { y: 1.49, rx: 0.135, rz: 0.13, hex: P.skin },
      { y: 1.60, rx: 0.155, rz: 0.15, hex: P.skinLt },   // brow / cheek ridge
      { y: 1.70, rx: 0.125, rz: 0.115, hex: P.skin },
      { y: 1.77, rx: 0.09, rz: 0.085, hex: P.skinDk },   // crown
    ];
    const hRings = headBandsLocal.map(b => ring(V(0, b.y, 0), V(0, 1, 0), b.rx, b.rz, 10).map(bowHead));
    for(let i = 0; i < hRings.length - 1; i++){
      stitch([hRings[i], hRings[i + 1]], () => headBandsLocal[i].hex);
    }
    capFan(hRings[hRings.length - 1], bowHead(V(0, 1.80, 0)), P.skinDk);
    // hair cap at the crown back, so the head doesn't read bald-construct
    const hairRing = ring(V(0, 1.72, -0.02), V(0, 1, 0), 0.10, 0.09, 10).map(bowHead);
    capFan(hairRing, bowHead(V(0, 1.79, -0.03)), P.hair);

    // eyes — glowing amber, set into the brow ridge
    for(const side of [-1, 1]){
      const eLocal = V(side * 0.06, 1.605, 0.135);
      const e = bowHead(eLocal);
      blob(e.x, e.y, e.z, 0.022, 0.014, 0.01, P.eye, 5, 2);
      const gLocal = eLocal.clone().add(V(0, 0, 0.008));
      const g = bowHead(gLocal);
      blob(g.x, g.y, g.z, 0.014, 0.009, 0.007, P.eyeGlow, 5, 2);
    }

    // tusked grin — two lower tusks jutting up past the lip (feature 4)
    for(const side of [-1, 1]){
      const base = V(side * 0.045, 1.505, 0.125);
      const tip = base.clone().add(V(side * 0.008, 0.045, 0.01));
      const b = bowHead(base), tp = bowHead(tip);
      tube(b, tp, 0.016, 0.006, 5, P.tusk);
    }

    /* SIGNATURE (a) — curling forehead horns, the highest silhouette-breaking feature (law 2).
       Two-segment tubes so each horn actually curls back rather than jutting as a straight
       spike — ivory base climbing to dark tips. */
    for(const side of [-1, 1]){
      const base = V(side * 0.075, 1.735, 0.02);
      const mid = base.clone().add(V(side * 0.035, 0.11, -0.02));
      const tip = mid.clone().add(V(side * 0.01, 0.10, -0.09));
      const b = bowHead(base), m = bowHead(mid), t = bowHead(tip);
      tube(b, m, 0.030, 0.020, 6, P.hornBase);
      tube(m, t, 0.020, 0.006, 6, P.hornTip, { capB: { hex: P.hornTip, lift: 0.006 } });
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
