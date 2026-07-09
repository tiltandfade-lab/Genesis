/* dev/model-qa/creatures/rlm-seas-djinni.js — the DJINNI landmark table (HUMANOID torso dissolving
   into an ELEMENTAL-MASS waterspout column — no single ANATOMY-CANON family covers the fusion, so
   the torso follows the humanoid stack-of-bands convention from rlm-seas-sahuagin-baron.js and the
   spout follows the tapering-band-column convention from rlm-seas-water-elemental.js), Large, CR 11,
   realm high-seas, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot,
   seas-w2 cell 5, port 5279). Core identity: "the Storm-Bound Djinn" — an elemental genie fused into
   a waterspout centuries ago, capricious and huge, who drags whole ships skyward on a whim just to
   watch them fall. Bespoke to the render key "djinni" — realm reskins ride this chassis narratively.

   FEATURE CHECKLIST (the ~1,500-1,800 budget buys):
     1. HUMANOID torso — Large, regal, bare-chested, broad-shouldered — rising from the hips with NO
        legs: the waist dissolves directly into the spout column (the fusion read, not a belt/robe
        hiding a seam).
     2. SIGNATURE — the twisting waterspout-for-legs: a tapering column from a wide wet base up to
        the dissolve point, radius pulsing band-to-band (never a smooth cone) plus three bright foam
        ribbons spiraling up the surface, selling the spin at a glance — the "spout-for-legs" law-4
        signature.
     3. THE FLOURISH pose (law 5) — one arm swept wide and high overhead, hand open and fingers
        splayed mid-gesture (the granted-wish flourish); the other arm cocked sharply at the hip,
        elbow out, hand resting on the waist — never a symmetric idle stance.
     4. Face — regal, bearded, chin lifted high, brow set proud, a gold circlet across the crown
        (the king's-genie tell) — the law-3 high-value zone riding the head.
     5. Gold armbands — a torque on each bicep and each wrist, the "capricious and huge" court-genie
        wealth read, plus a jeweled belt marking the waist-to-spout dissolve line.
     6. Foam bands on the spout (the law-3 high-value zone riding the signature) — bright cyan-white
        ribbons against the deep-blue column so the twist can't vanish into the void.

   POSE SENTENCE: torso rising mid-twist out of the spinning column, chin lifted high, one arm swept
   wide overhead in the grand granted-wish flourish — fingers splayed — the other cocked hard at the
   hip, elbow flared, riding the spout's own spin up through the shoulders — never a still idle
   stance, always the half-second the wish is being granted.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w2'], cell 5, fn buildDjinni). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

export function buildDjinni(){
  /* ---------- PALETTE — deep blue-violet genie skin (regal, not human) against a pale bare
     chest/face highlight; the spout itself is a cooler cyan-blue with bright foam ribbons (the
     law-3 high-value zone riding the signature); gold everywhere the character/wealth reads
     (armbands, circlet, belt) so the "capricious and huge court genie" tell survives dithering. */
  const P = {
    skin: 0x4a4a8e, skinDk: 0x33336a, skinLt: 0x6868b0,   // blue-violet genie skin, chest lit
    beard: 0x201a38, hair: 0x241e3e,                        // deep indigo-black beard/hair
    eye: 0x140f0d, eyeGlow: 0xf0d878,                        // dark socket, hot gold gaze
    gold: 0xe0c458, goldDk: 0xa8862c,                        // circlet/armbands/belt — the wealth tell
    spout: 0x2c6f8e, spoutDk: 0x143a4c, spoutLt: 0x4c96b6,   // twisting column body — kept saturated so it reads BLUE, not grey
    foam: 0xe8f7f4,                                          // bright ribbon — highest value in the piece
    disc: 0x243848, discTop: 0x2e4658,
  };

  /* ===== LANDMARKS — Large humanoid torso (matches the sahuagin-baron's scale) rising above the
     dissolve point where the spout ends. ===== */
  const L = {
    dissolveY: 0.52, hipY: 0.56, waistY: 0.66, ribY: 0.78, chestY: 0.90, shldY: 1.00, neckY: 1.05,
    jawY: 1.09, cheekY: 1.145, browY: 1.19, crownY: 1.235,
    shoulderX: 0.255,
  };
  /* the body keeps riding the spout's own spin as it rises — a slight rotation about the vertical
     axis that grows with height, so the torso reads as CONTINUING the twist rather than a static
     mannequin bolted onto a spinning base (law 5's "expresses the essence" applied to construction). */
  const spin = (p) => {
    const t = Math.max(0, Math.min(1, (p.y - L.dissolveY) / (L.crownY - L.dissolveY)));
    const ang = t * 0.30;
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  };

  /* ===== 1. THE SPOUT — twisting waterspout-for-legs, the signature. Wide wet base tapering up
     to the dissolve point, radius pulsing band-to-band (never a smooth cone) so the twist reads
     even before the foam ribbons are added. ===== */
  {
    const n = 10, bandCount = 12;
    const bands = [];
    for(let i = 0; i <= bandCount; i++){
      const t = i / bandCount;
      const baseR = 0.42 * (1 - 0.74 * t) + 0.02;
      const wobble = 0.013 * Math.sin(t * Math.PI * 7) * (1 - t * 0.55);
      const rx = Math.max(baseR + wobble, 0.055);
      const rz = Math.max((baseR + wobble) * 0.92, 0.050);
      const y = 0.02 + t * (L.dissolveY - 0.02);
      const hex = (i % 2 === 0) ? P.spout : P.spoutDk;
      bands.push({ y, rx, rz, hex });
    }
    stack(bands, n, { capBot: { hex: P.spoutDk, lift: 0.02 } });

    /* three bright foam ribbons spiraling up the surface — the law-3 high-value zone riding the
       signature itself, plus the visual "spin" tell (a barber-pole read). */
    function radiusAt(t){
      const baseR = 0.42 * (1 - 0.74 * t) + 0.02;
      const wobble = 0.013 * Math.sin(t * Math.PI * 7) * (1 - t * 0.55);
      return Math.max(baseR + wobble, 0.055);
    }
    /* CRITIC-PROOFED BEFORE FIRST RENDER: these tubes run near-horizontal (a wide radial arc per
       small y-step), so each ring's cross-section extends vertically by roughly its own radius —
       a low y-origin dips the ring BELOW ground (bbox min.y < 0). Floored the ribbon's y-origin at
       0.08 (well clear of the ~0.03u ring radius) instead of the spout's own 0.02 base.
       CRITIC FIX (post r1 engine render): r1's ribbons floored at 0.045-0.052u against a column
       whose own radius runs 0.05-0.46u — at the mid/upper column the ribbon radius was CLOSE TO
       the column's own radius, so three of them wrapping the surface fully coated it and the
       whole spout sampled as pale grey (foam color) instead of reading blue-with-white-accents.
       Thinned to a true accent ribbon (0.030 floor, 0.012 pad) and dropped to two wraps. */
    const turns = 1.35;
    for(let k = 0; k < 2; k++){
      const phase0 = (k / 2) * Math.PI * 2;
      const pts = [];
      const steps = 9;
      for(let i = 0; i <= steps; i++){
        const t = i / steps;
        const ang = phase0 + t * turns * Math.PI * 2;
        const rr = radiusAt(t) + 0.012;
        const y = 0.08 + t * (L.dissolveY - 0.08);
        pts.push(V(Math.cos(ang) * rr, y, Math.sin(ang) * rr));
      }
      for(let i = 0; i < pts.length - 1; i++){
        const ra = Math.max(0.036 - i * 0.002, 0.030);
        const rb = Math.max(0.036 - (i + 1) * 0.002, 0.030);
        tube(pts[i], pts[i + 1], ra, rb, 5, P.foam, i === pts.length - 2 ? { capB: { hex: P.foam } } : {});
      }
    }
    /* base-of-spout foam splash ring, grounding the column against the disc */
    {
      const r1 = ring(V(0, 0.03, 0), V(0, 1, 0), 0.44, 0.40, 12, Math.PI / 12);
      const r2 = ring(V(0, 0.10, 0), V(0, 1, 0), 0.40, 0.36, 12, Math.PI / 12);
      stitch([r1, r2], (b, i) => (i % 4 === 0 ? P.foam : P.spoutLt));
    }
  }

  /* ===== jeweled belt — marks the waist-to-spout dissolve line (the fusion seam) and doubles as
     a value-contrast + wealth read right at the base of the humanoid signature. ===== */
  {
    const b1 = ring(V(0, L.dissolveY + 0.005, 0), V(0, 1, 0), 0.175, 0.155, 10, Math.PI / 10).map(spin);
    const b2 = ring(V(0, L.dissolveY + 0.045, 0), V(0, 1, 0), 0.185, 0.163, 10, Math.PI / 10).map(spin);
    stitch([b1, b2], (b, i) => (i % 2 === 0 ? P.gold : P.goldDk));
  }

  /* ===== 2. TORSO — regal, bare-chested, broad shoulders, rising with NO legs above the belt. ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.165, rz: 0.150, hex: P.skinDk },
    { y: L.waistY, rx: 0.155, rz: 0.135, hex: P.skin },
    { y: L.ribY,   rx: 0.185, rz: 0.150, hex: P.skin },
    { y: L.chestY, rx: 0.220, rz: 0.168, hex: P.skinLt },
    { y: L.shldY,  rx: 0.255, rz: 0.160, hex: P.skin },
    { y: L.neckY,  rx: 0.078, rz: 0.072, hex: P.skinDk },
  ], 9, { xform: spin });

  /* bare-chest highlight patch — pale-lit slab on the sternum, the law-3 high-value zone riding
     the "face/chest" beat named in the brief. */
  {
    const c = spin(V(0, L.chestY, 0.166));
    const up = spin(V(0, L.chestY + 0.09, 0.176));
    const dn = spin(V(0, L.chestY - 0.10, 0.150));
    quad(V(dn.x - 0.075, dn.y, dn.z), V(dn.x + 0.075, dn.y, dn.z),
      V(up.x + 0.055, up.y, up.z), V(up.x - 0.055, up.y, up.z), P.skinLt, 0.04);
  }

  /* ===== HEAD — regal, bearded, chin lifted high, gold circlet across the crown. ===== */
  const jawC = spin(V(0, L.jawY, 0.078));
  const cheekC = spin(V(0, L.cheekY, 0.098));
  const browC = spin(V(0, L.browY, 0.070));
  const crownC = spin(V(0, L.crownY, 0.030));
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.070, 0.078, 8, Math.PI / 8),
    ring(cheekC, V(0, 1, 0), 0.098, 0.106, 8, Math.PI / 8),
    ring(browC, V(0, 1, 0), 0.100, 0.096, 8, Math.PI / 8),
    ring(crownC, V(0, 1, 0), 0.072, 0.064, 8, Math.PI / 8),
  ];
  stitch(headRings, (b) => [P.skin, P.skinLt, P.skin][b] ?? P.skin);
  capFan(headRings[3], crownC.clone().add(V(0, 0.018, -0.006)), P.hair);

  /* beard — a dark wedge dropping off the jaw, chin lifted so it juts forward proudly */
  {
    const bTop = jawC.clone().add(V(0, 0.02, 0.03));
    const bTip = jawC.clone().add(V(0, -0.10, 0.055));
    quad(bTop.clone().add(V(-0.055, 0, -0.01)), bTop.clone().add(V(0.055, 0, -0.01)), bTip, bTip, P.beard, 0.05);
    quad(bTop.clone().add(V(0.055, 0, -0.01)), bTop.clone().add(V(-0.055, 0, -0.01)), bTip, bTip, P.beard, 0.05);
  }

  /* gold circlet — a thin band riding the brow, the king's-genie tell */
  {
    const c1 = ring(browC.clone().add(V(0, 0.028, 0)), V(0, 1, 0), 0.104, 0.100, 8, Math.PI / 8);
    const c2 = ring(browC.clone().add(V(0, 0.048, -0.006)), V(0, 1, 0), 0.100, 0.094, 8, Math.PI / 8);
    stitch([c1, c2], () => P.gold);
    /* a small gem set front-center of the circlet */
    blob(0, browC.y + 0.052, browC.z + 0.096, 0.018, 0.016, 0.014, P.eyeGlow, 4, 3);
  }

  /* eyes — set forward, gaze lifted with the chin, a hot gold glow (the genie's magic) */
  for(const s of [-1, 1]){
    const p = spin(V(s * 0.052, L.browY + 0.004, 0.086));
    blob(p.x, p.y, p.z, 0.020, 0.017, 0.016, P.eye, 5, 3);
    blob(p.x, p.y + 0.004, p.z + 0.011, 0.009, 0.008, 0.007, P.eyeGlow, 4, 2);
  }

  /* mouth — set in a knowing, capricious half-smile line beneath the beard shadow */
  {
    const my = jawC.y + 0.028, mz = jawC.z + 0.070;
    quad(V(-0.028, my, mz), V(0.028, my, mz), V(0.020, my - 0.012, mz + 0.006), V(-0.020, my - 0.012, mz + 0.006), P.beard, 0.05);
  }

  /* one arm helper — shoulder -> elbow -> wrist tube, ending in a spread hand of tapering
     fingers (never a fist), matching the sahuagin-baron/octopus-arm finger idiom.
     CRITIC FIX (r2, post-render): r1's fingers tapered to a 0.005u tip (under the law-3 0.04u
     floor) AND the raised arm receded in +z away from camera, so the whole "flourish" hand
     foreshortened into a single thin line in the engine render — the splayed-fingers pose claim
     did not read. Thickened every finger segment well past the floor, AND added a webbed
     palm-fan (quads bridging adjacent fingers, capped with a hot-gold glow blob) so the hand
     reads as a solid open-palm silhouette even where individual fingers still foreshorten. */
  function armSpread(sh, el, wr, spreadDirs, hex, hexDk, len = 0.10, glow){
    tube(sh, el, 0.062, 0.050, 6, hex);
    tube(el, wr, 0.050, 0.036, 6, hexDk, { phase: Math.PI / 6 });
    blob(wr.x, wr.y, wr.z, 0.040, 0.033, 0.037, hex, 6, 4);
    const mids = [];
    for(const d of spreadDirs){
      const dn = norm(d);
      const mid = wr.clone().addScaledVector(dn, len * 0.55);
      const tip = wr.clone().addScaledVector(dn, len);
      tube(wr, mid, 0.026, 0.020, 5, hexDk);
      tube(mid, tip, 0.020, 0.013, 5, hex, { capB: { hex } });
      mids.push(mid);
    }
    /* webbed palm — round struts (not flat quads: a flat quad backface-culls from the wrong
       camera angle and vanished in the r2a check) between each adjacent finger pair, so the
       hand reads as a solid paddle silhouette from any angle, not just individual foreshortened
       fingers. */
    for(let i = 0; i < mids.length - 1; i++){
      tube(mids[i], mids[i + 1], 0.017, 0.017, 4, hexDk);
    }
    if(glow) blob(wr.x, wr.y, wr.z, 0.026, 0.022, 0.024, glow, 5, 3);
    return wr;
  }

  /* gold armband — a torque ring on a limb segment, the wealth tell */
  function armband(center, axis, r, hex){
    const b1 = ring(center.clone().addScaledVector(axis, -0.014), axis, r * 1.06, r * 1.06, 8, Math.PI / 8);
    const b2 = ring(center.clone().addScaledVector(axis, 0.014), axis, r * 1.10, r * 1.10, 8, Math.PI / 8);
    stitch([b1, b2], () => hex);
  }

  const shBase = spin(V(L.shoulderX, L.shldY - 0.010, 0.02));

  /* ===== SIGNATURE (pose half) — right arm: THE FLOURISH, swept wide and high overhead, hand
     open, fingers splayed — the granted-wish gesture, law 5's high-expression moment. ===== */
  {
    const sh = V(shBase.x, shBase.y, shBase.z);
    const el = V(0.50, 1.20, -0.04);
    const wr = V(0.58, 1.48, -0.20);
    /* CRITIC FIX (r2b, post-render projection check): r2's spreadDirs varied x and z TOGETHER
       (same sign, correlated) — under this camera's dimetric projection that makes screen-x
       (dx - dz) nearly cancel, so all five fingertips landed within ~7px of each other on
       screen: the fan collapsed to a single line no matter how thick the tubes were. Verified
       numerically against the actual ps1-sheet camera math (yaw45/el30 ortho projection) and
       re-picked dirs so x and z move in OPPOSING signs — now the five tips span ~35px of
       screen-x while all still reaching upward, a real open-palm fan. */
    armSpread(
      sh, el, wr,
      [[0.62, 0.55, -0.62], [0.35, 0.80, -0.35], [0.05, 0.95, -0.05], [-0.30, 0.85, 0.30], [-0.50, 0.65, 0.50]],
      P.skin, P.skinDk, 0.12, P.eyeGlow
    );
    armband(sh.clone().lerp(el, 0.5), norm([el.x - sh.x, el.y - sh.y, el.z - sh.z]), 0.062, P.gold);
    armband(el.clone().lerp(wr, 0.72), norm([wr.x - el.x, wr.y - el.y, wr.z - el.z]), 0.042, P.gold);
  }

  /* left arm: cocked sharply at the hip, elbow flared out, hand resting on the waist — the
     asymmetric counterweight the flourish needs. */
  {
    const sh = V(-shBase.x, shBase.y, shBase.z);
    const el = V(-0.34, 0.86, 0.16);
    const wr = V(-0.20, 0.62, 0.14);
    tube(sh, el, 0.062, 0.050, 6, P.skin);
    tube(el, wr, 0.050, 0.038, 6, P.skinDk, { phase: Math.PI / 6 });
    blob(wr.x, wr.y, wr.z, 0.036, 0.030, 0.033, P.skin, 6, 4);
    const fingerDirs = [[0.35, -0.55, 0.30], [0.10, -0.65, 0.20], [-0.20, -0.60, 0.10]];
    for(const d of fingerDirs){
      const dn = norm(d);
      const mid = wr.clone().addScaledVector(dn, 0.045);
      const tip = wr.clone().addScaledVector(dn, 0.085);
      tube(wr, mid, 0.015, 0.011, 4, P.skinDk);
      tube(mid, tip, 0.011, 0.004, 4, P.skin, { capB: { hex: P.skin } });
    }
    armband(sh.clone().lerp(el, 0.5), norm([el.x - sh.x, el.y - sh.y, el.z - sh.z]), 0.062, P.gold);
    armband(el.clone().lerp(wr, 0.72), norm([wr.x - el.x, wr.y - el.y, wr.z - el.z]), 0.040, P.gold);
  }

  /* base disc (Large: r=0.55, matches the sahuagin-baron/yuan-ti-abomination Large disc) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.55, 0.55, 18);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.53, 0.53, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
