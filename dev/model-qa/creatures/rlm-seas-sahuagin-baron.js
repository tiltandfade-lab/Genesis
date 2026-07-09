/* dev/model-qa/creatures/rlm-seas-sahuagin-baron.js — the SAHUAGIN BARON landmark table
   (HUMANOID-FISH family, Large, CR 5, realm high-seas), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, seas-w1 cell 7). Core identity: the reef-ruling sea-devil
   warlord commanding raid packs — the FOUR-ARMED sahuagin king, the warrior's terrifying elder.
   Bespoke to the render key "sahuagin-baron" — realm reskins ride this chassis narratively.
   Shares the sahuagin-warrior's HUMANOID-FISH digitigrade-biped chassis (ANATOMY-CANON) at
   Large scale, with the mutation signature (four arms) and a taller flared crest layered on.

   FEATURE CHECKLIST (the ~1,800-2,000 budget buys):
     1. HUMANOID-FISH torso+legs per ANATOMY-CANON's digitigrade construction rule applied to a
        biped, at LARGE scale (heavier build than the warrior — thicker torso/limb girths, wider
        hips): reversed lower leg (true ankle set HIGH, heel drawn back), webbed 3-toe feet
        splayed wide for a swim-kick push-off.
     2. SIGNATURE — FOUR arms (the mutation signature, law 4's one loud exaggerated feature): two
        weapon arms (trident + a hooked shortspear-claw) and two bare clawed arms, all spread wide
        in the war-cry display rather than tucked at the sides.
     3. Tall spined crest — taller and more elaborately branched than the warrior's, fully flared
        skull-crown to nape, reading as a king's frill/crown silhouette.
     4. Fish head — heavier fish-fanged muzzle than the warrior (elder's jaw), jaw dropped wide
        in the war-cry, gill slits at the throat, bulging lidless eyes set to the sides.
     5. Pale belly/throat/crest-membrane scale ladder (the law-3 high-value zone) against a deep
        sea-green back and limbs, carried up the torso, onto the throat, and into the crest
        membrane itself so the signature carries the value contrast.
     6. The WAR-CRY pose (law 5) — reared to full height (not the warrior's crouch — the baron
        commands, he doesn't ambush), all four arms spread wide overhead and to the sides, crest
        fully flared, jaw wide open mid-roar.

   POSE SENTENCE: reared to full height on the base disc, all four arms flung wide — the two
   weapon arms raised overhead, the two clawed arms spread level to the sides — crest fully
   flared skull to nape, jaw wide open mid-roar, the war-cry that calls the raid pack to battle,
   never a standing idle stance.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w1'], cell 7, fn buildSahuaginBaron). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

export function buildSahuaginBaron(){
  /* ---------- PALETTE (deep sea-green back/limbs vs. a pale belly/throat/crest-membrane
     ladder — the high-value zone law 3 needs; steel + a bronze king's-band lift the weapons
     and crest-spines off the body so the signature reads at a squint). ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's weapon tine tips sampled as pure void
     (10,9,8) — the thin steel taper + waterlogged-wood shaft dissolved completely at 1/3-res
     (law 3). Lifted the whole body palette a step off the void for margin, and pushed steel/
     bronze/membrane hexes toward near-white so the signature and weapons actually survive
     dithering (geometry thickened to match, below). */
  const P = {
    scale: 0x3f664a, scaleDk: 0x2c4530, scaleLt: 0x557d5c,   // back/limb scale, lifted further off void
    belly: 0xe0d8a8, bellyDk: 0xb8ae7c,                       // pale belly/throat ladder
    fin: 0x9dc492, finDk: 0x527a54, finMembrane: 0xf0e8c0,    // crest spines + pale membrane (high-value)
    claw: 0xd8ddc4,                                           // webbed claw tips
    eye: 0x1a1512, eyeGlow: 0xe8d868,                         // bulging lidless gaze, a shade hotter than the warrior's
    mouth: 0x140f0d, fang: 0xe8e2c8,
    steel: 0xd8ddce, steelDk: 0x9aa090,                       // trident/spear-claw heads — near-white so tine tips survive
    bronze: 0xc4964a, bronzeDk: 0x8a6a30,                     // king's band on shaft grips — the rank tell, brighter
    shaft: 0x6e5a40, shaftDk: 0x4a3c28,                       // waterlogged wood, lifted
    disc: 0x2c322a, discTop: 0x363e32,
  };

  /* ===== RIG — reared to full height, Large scale (heavier girths than the warrior). Slight
     backward/upward torque through the spine so the war-cry reads as CLIMBING taller, not a
     level stand. ===== */
  const L = {
    hipY: 0.52, waistY: 0.62, ribY: 0.74, chestY: 0.87, shldY: 0.97, neckY: 1.02,
    jawY: 1.06, cheekY: 1.125, browY: 1.175, crownY: 1.225, crestTopY: 1.46,
    hipHalf: 0.145, shoulderX: 0.270,
  };
  const rear = (p) => {
    const t = Math.max(0, (p.y - L.hipY) / (L.crownY - L.hipY));
    return V(p.x, p.y + 0.01 * t, p.z - 0.05 * t);
  };

  /* ===== LEGS — digitigrade biped, Large-scale thicker girths. Braced wide and set for the
     rear (both legs planted, weight low, the king standing his ground on the reef). ===== */
  function legDigitigrade(hip, knee, ankle, toeDir, hex, hexDk, footHex){
    tube(hip, knee, 0.108, 0.082, 7, hex);
    tube(knee, ankle, 0.076, 0.042, 7, hexDk, { phase: Math.PI / 7 });
    const heel = ankle.clone().addScaledVector(toeDir, -0.065).add(V(0, -0.012, 0));
    const ball = ankle.clone().addScaledVector(toeDir, 0.090).add(V(0, -0.054, 0));
    tube(ankle, ball, 0.048, 0.044, 6, footHex);
    tube(ankle, heel, 0.036, 0.022, 5, footHex, { capB: { hex: footHex } });
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), toeDir).normalize();
    for(const s of [-1, 0, 1]){
      const spread = toeDir.clone().addScaledVector(side, s * 0.55).normalize();
      const tip = ball.clone().addScaledVector(spread, 0.090).add(V(0, -0.007, 0));
      const mid = ball.clone().addScaledVector(spread, 0.043).add(V(0, -0.003, 0));
      tube(ball, mid, 0.024, 0.019, 4, footHex);
      tube(mid, tip, 0.019, 0.008, 4, P.claw, { capB: { hex: P.claw } });
      if(s < 1){
        const spread2 = toeDir.clone().addScaledVector(side, (s + 1) * 0.55).normalize();
        const mid2 = ball.clone().addScaledVector(spread2, 0.038).add(V(0, -0.003, 0));
        quad(ball, mid, mid2, ball, hexDk, 0.04);
      }
    }
  }
  legDigitigrade(
    V(0.145, L.hipY, 0.03), V(0.205, 0.285, 0.175), V(0.175, 0.170, 0.155),
    V(0.20, 0, 0.98).normalize(), P.scale, P.scaleDk, P.belly
  );
  legDigitigrade(
    V(-0.145, L.hipY, -0.01), V(-0.200, 0.285, -0.150), V(-0.170, 0.170, -0.130),
    V(-0.20, 0, -0.98).normalize(), P.scaleDk, P.scale, P.belly
  );

  /* ===== TORSO — humanoid-fish, heavier (Large) girths than the warrior, reared upright. ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.185, rz: 0.160, hex: P.scale },
    { y: L.waistY, rx: 0.172, rz: 0.142, hex: P.scaleDk },
    { y: L.ribY,   rx: 0.195, rz: 0.158, hex: P.scale },
    { y: L.chestY, rx: 0.220, rz: 0.174, hex: P.scaleLt },
    { y: L.shldY,  rx: 0.248, rz: 0.168, hex: P.scale },
    { y: L.neckY,  rx: 0.084, rz: 0.078, hex: P.scaleDk },
  ], 9, { xform: rear });

  /* belly/throat scale ladder — the high-value zone, climbing the reared torso to the jaw.
     CRITIC FIX (pass-2, r2->r3): the 0.82-0.90 z-multipliers sat INSIDE the torso stack's own
     shell radius at these bands (chest rz=0.174 vs. this patch's old 0.157 max) — the opaque
     torso surface occluded the pale patches completely (confirmed: belly pixel sampled at
     essentially void color in the r2 render). Multipliers pushed to 1.02-1.10 so the ladder sits
     just proud of the shell instead of buried behind it. */
  {
    const rungs = [
      [L.hipY, 0.160], [L.waistY, 0.142], [L.ribY, 0.158], [L.chestY, 0.174],
    ];
    for(const [y, rz] of rungs){
      const c = rear(V(0, y, rz * 1.02));
      const w = rz * 0.42, h = 0.06;
      const up = rear(V(0, y + h, rz * 1.10));
      const dn = rear(V(0, y - h, rz * 1.02));
      quad(V(dn.x - w, dn.y, dn.z), V(dn.x + w, dn.y, dn.z), V(up.x + w * 0.7, up.y, up.z), V(up.x - w * 0.7, up.y, up.z),
        (y === L.chestY || y === L.ribY) ? P.belly : P.bellyDk, 0.04);
    }
  }

  /* ===== HEAD — heavier fish-fanged elder's muzzle, jaw dropped wide mid-roar, gill slits,
     bulging side eyes, tall spined crest. ===== */
  const jawC = rear(V(0, L.jawY, 0.088));
  const cheekC = rear(V(0, L.cheekY, 0.104));
  const browC = rear(V(0, L.browY, 0.074));
  const crownC = rear(V(0, L.crownY, 0.036));
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.082, 0.110, 8, Math.PI / 8),
    ring(cheekC, V(0, 1, 0), 0.110, 0.135, 8, Math.PI / 8),
    ring(browC, V(0, 1, 0), 0.118, 0.110, 8, Math.PI / 8),
    ring(crownC, V(0, 1, 0), 0.082, 0.071, 8, Math.PI / 8),
  ];
  stitch(headRings, (b) => [P.scale, P.scaleLt, P.scale][b] ?? P.scale);
  capFan(headRings[3], crownC.clone().add(V(0, 0.02, -0.01)), P.scaleDk);

  /* mouth — dropped WIDE open, mid-roar (law 5's pose completing at the head), pale fangs
     breaking the dark, a bright throat glimpsed inside.
     CRITIC FIX (pass-2, r2->r3): both quads below wound with a -z-facing normal (verified via
     cross-product against the belly ladder's proven +z-facing order) — backface-culled from the
     front dimetric camera, so the whole mid-roar signature rendered as literally nothing. Vertex
     order reversed (bottom-first) to match the belly ladder's working convention; also pushed mz
     further forward so the mouth clears the now-protruded muzzle instead of sitting flush with it. */
  {
    const my = jawC.y - 0.01, mz = jawC.z + 0.058;
    quad(V(-0.040, my - 0.072, mz - 0.03), V(0.040, my - 0.072, mz - 0.03), V(0.052, my + 0.028, mz), V(-0.052, my + 0.028, mz), P.mouth, 0.03);
    /* bright inner-throat sliver — sells "open" rather than "dark smear" at 1/3-res */
    quad(V(-0.018, my - 0.048, mz - 0.02), V(0.018, my - 0.048, mz - 0.02), V(0.026, my - 0.006, mz - 0.006), V(-0.026, my - 0.006, mz - 0.006), 0x7a2a24, 0.04);
    for(const s of [-1, 1]){
      const fx = s * 0.034;
      tube(V(fx, my + 0.022, mz + 0.008), V(fx, my - 0.028, mz - 0.008), 0.010, 0.003, 4, P.fang, { capB: { hex: P.fang } });
      tube(V(fx, my - 0.058, mz - 0.02), V(fx, my - 0.032, mz - 0.008), 0.008, 0.002, 4, P.fang, { capB: { hex: P.fang } });
    }
  }

  /* jaw underside pale throat patch, connecting the belly ladder up to the roaring mouth */
  {
    const c = jawC.clone().add(V(0, -0.012, 0.012));
    quad(V(c.x - 0.040, c.y - 0.022, c.z - 0.012), V(c.x + 0.040, c.y - 0.022, c.z - 0.012),
      V(c.x + 0.030, c.y + 0.014, c.z + 0.036), V(c.x - 0.030, c.y + 0.014, c.z + 0.036), P.belly, 0.04);
  }

  /* gill slits — three dark slashes on each cheek */
  for(const s of [-1, 1]){
    for(let i = 0; i < 3; i++){
      const gy = L.jawY + 0.012 + i * 0.021;
      const p = rear(V(s * 0.104, gy, 0.072));
      quad(V(p.x - 0.005, p.y - 0.014, p.z), V(p.x + 0.005, p.y - 0.014, p.z), V(p.x + 0.005, p.y + 0.014, p.z), V(p.x - 0.005, p.y + 0.014, p.z), P.scaleDk, 0.05);
    }
  }

  /* eyes — bulging, lidless, set well to the sides, a hotter glow than the warrior's (the
     elder's gaze). */
  for(const s of [-1, 1]){
    const p = rear(V(s * 0.116, L.browY + 0.006, 0.070));
    blob(p.x, p.y, p.z, 0.028, 0.027, 0.023, P.eye, 6, 4);
    blob(p.x + s * 0.008, p.y + 0.005, p.z + 0.016, 0.013, 0.012, 0.011, P.eyeGlow, 4, 2);
  }

  /* ===== SIGNATURE — tall spined crest, skull-crown to nape, FULLY flared (bigger and more
     branched than the warrior's — the king's crown). Membrane between spines carries the pale
     value ladder up into the signature itself. ===== */
  {
    const crestBase = crownC.clone().add(V(0, 0.006, -0.012));
    const finPts = [
      { off: V(0.0, 0.0, 0.0),    h: 0.070, w: 0.036 },
      { off: V(0.0, 0.045, -0.06), h: 0.130, w: 0.048 },
      { off: V(0.0, 0.075, -0.13), h: 0.155, w: 0.054 },
      { off: V(0.0, 0.070, -0.20), h: 0.140, w: 0.048 },
      { off: V(0.0, 0.040, -0.26), h: 0.100, w: 0.038 },
      { off: V(0.0, -0.005, -0.31), h: 0.058, w: 0.024 },
    ];
    const roots = [];
    for(const f of finPts){
      const root = crestBase.clone().add(f.off);
      const tip = root.clone().add(V(0, f.h, -0.014));
      const l = root.clone().add(V(-f.w, 0.012, 0));
      const r = root.clone().add(V(f.w, 0.012, 0));
      quad(l, r, tip, tip, P.fin, 0.04);
      quad(r, l, tip, tip, P.finDk, 0.04);
      roots.push({ root, tip, l, r });
    }
    /* pale membrane panels stretched between adjacent spine tips — the high-value zone riding
       the signature itself, per law 3.
       CRITIC FIX (pass-2, r2->r3): cross-product check showed this order's normal pointed
       -x/-z (edge-on-to-back-facing from the front dimetric camera) — culled, so the crest's
       claimed value-ladder never reached the render (sampled brightest crest pixel fell far
       short of finMembrane). Reversed the vertex order to flip the normal toward the camera. */
    for(let i = 0; i < roots.length - 1; i++){
      const a = roots[i], b = roots[i + 1];
      const midTip = a.tip.clone().lerp(b.tip, 0.5).add(V(0, -0.02, 0));
      quad(a.root.clone().lerp(a.r, 0.4), b.root.clone().lerp(b.l, 0.4), b.tip, a.tip, P.finMembrane, 0.05);
    }
  }

  /* forearm fin ridges — small paired spikes, echo the crest signature at low tri cost */
  function finRidge(base, dir, hex){
    const n = new THREE.Vector3(0, 1, 0);
    const tip = base.clone().addScaledVector(dir, 0.06).addScaledVector(n, 0.052);
    const a = base.clone().addScaledVector(dir, -0.014);
    const b = base.clone().addScaledVector(dir, 0.014);
    quad(a, b, tip, tip, hex, 0.05);
  }

  /* one arm helper: shoulder -> elbow -> wrist, either a spread clawed hand (bare arms) or a
     gripped weapon shaft (weapon arms). Matches the yuan-ti-abomination's armBenediction idiom,
     scaled for the baron's heavier Large-frame limbs. */
  function armClawed(sh, el, wr, spreadDirs, hex, hexDk, clawHex){
    tube(sh, el, 0.072, 0.058, 6, hex);
    tube(el, wr, 0.056, 0.038, 6, hexDk, { phase: Math.PI / 6 });
    blob(wr.x, wr.y, wr.z, 0.038, 0.031, 0.035, hex, 6, 4);
    for(const d of spreadDirs){
      const dn = norm(d);
      const mid = wr.clone().addScaledVector(dn, 0.052);
      const tip = wr.clone().addScaledVector(dn, 0.098);
      tube(wr, mid, 0.021, 0.015, 4, hexDk);
      tube(mid, tip, 0.015, 0.007, 4, clawHex, { capB: { hex: clawHex } });
    }
    return wr;
  }

  /* ===== SIGNATURE — FOUR arms spread wide in the war-cry: outer pair (weapon arms) raised
     overhead gripping trident + hooked spear-claw; inner pair (bare clawed arms) spread level
     to the sides, claws splayed. All four visibly separate from the torso silhouette. ===== */
  const shBase = rear(V(L.shoulderX, L.shldY - 0.012, 0.03));

  /* outer-right: raised high overhead, gripping the trident */
  let tridentGrip;
  {
    const sh = V(shBase.x, shBase.y, shBase.z);
    const el = V(0.52, 1.28, -0.06);
    const wr = V(0.48, 1.56, -0.24);
    tube(sh, el, 0.076, 0.060, 6, P.scale);
    tube(el, wr, 0.058, 0.040, 6, P.scaleDk, { phase: Math.PI / 6 });
    finRidge(el.clone().add(V(0.02, 0, -0.02)), V(0.55, 0, -0.5).normalize(), P.finDk);
    blob(wr.x, wr.y, wr.z, 0.038, 0.031, 0.035, P.scale, 6, 4);
    tridentGrip = wr.clone();
  }
  /* outer-left: raised high overhead, gripping the hooked spear-claw */
  let spearGrip;
  {
    const sh = V(-shBase.x, shBase.y, shBase.z);
    const el = V(-0.50, 1.24, -0.04);
    const wr = V(-0.46, 1.50, -0.20);
    tube(sh, el, 0.076, 0.060, 6, P.scale);
    tube(el, wr, 0.058, 0.040, 6, P.scaleDk, { phase: Math.PI / 6 });
    finRidge(el.clone().add(V(-0.02, 0, -0.02)), V(-0.55, 0, -0.5).normalize(), P.finDk);
    blob(wr.x, wr.y, wr.z, 0.038, 0.031, 0.035, P.scale, 6, 4);
    spearGrip = wr.clone();
  }
  /* inner-right: spread level to the side, bare clawed hand */
  armClawed(
    V(shBase.x - 0.02, shBase.y - 0.05, shBase.z + 0.05),
    V(0.62, 0.98, 0.22), V(0.80, 0.92, 0.36),
    [[0.75, 0.20, 0.40], [0.88, -0.10, 0.30], [0.78, -0.35, 0.18], [0.55, -0.48, 0.08]],
    P.scale, P.scaleDk, P.claw
  );
  /* inner-left: spread level to the side, bare clawed hand */
  armClawed(
    V(-shBase.x + 0.02, shBase.y - 0.05, shBase.z + 0.05),
    V(-0.62, 0.98, 0.22), V(-0.80, 0.92, 0.36),
    [[-0.75, 0.20, 0.40], [-0.88, -0.10, 0.30], [-0.78, -0.35, 0.18], [-0.55, -0.48, 0.08]],
    P.scale, P.scaleDk, P.claw
  );

  /* trident — raised overhead, bronze king's-band on the grip (rank tell), three tines fanning
     up off the head.
     R2 SELF-CORRECTION (post r1 engine render): r1's tines sampled as pure void (10,9,8) — the
     taper dissolved completely at 1/3-res. Shortened the reach (headBase pulled in ~25%) so the
     tips stay well inside the camera frame, and thickened every radius ~40-60% so the steel
     clears the law-3 ~0.04u floor instead of dissolving to a needle. */
  {
    const grip2 = tridentGrip.clone().add(V(0.02, 0.05, -0.03));
    const bandEnd = tridentGrip.clone().add(V(-0.02, -0.09, 0.03));
    const headBase = tridentGrip.clone().add(V(0.04, 0.16, -0.07));
    tube(bandEnd, tridentGrip, 0.034, 0.036, 6, P.shaftDk, { capA: { hex: P.shaftDk } });
    tube(tridentGrip, grip2, 0.036, 0.031, 6, P.bronze);   // king's band — the rank tell
    tube(grip2, headBase, 0.031, 0.025, 6, P.shaft);
    const dir = headBase.clone().sub(grip2).normalize();
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), dir).normalize();
    for(const s of [-1, 0, 1]){
      const spread = dir.clone().addScaledVector(side, s * 0.32).addScaledVector(V(0, 1, 0), 0.06 * (s === 0 ? 1.3 : 1)).normalize();
      const root = headBase.clone().addScaledVector(side, s * 0.040);
      const mid = root.clone().addScaledVector(spread, 0.075);
      const tip = root.clone().addScaledVector(spread, 0.135);
      tube(root, mid, 0.024, 0.018, 4, P.steelDk);
      tube(mid, tip, 0.018, 0.009, 4, P.steel, { capB: { hex: P.steel } });
    }
    quad(headBase.clone().add(V(-0.034, 0, -0.007)), headBase.clone().add(V(0.034, 0, -0.007)),
      headBase.clone().add(V(0.028, 0.016, 0.007)), headBase.clone().add(V(-0.028, 0.016, 0.007)), P.steel, 0.03);
  }

  /* hooked spear-claw — raised overhead opposite the trident, a single back-curved hook blade
     (distinct silhouette from the trident so the two weapon arms don't read as duplicates),
     bronze king's-band matching the trident grip.
     R2 SELF-CORRECTION (post r1 engine render): same fix as the trident — shortened reach,
     thickened every radius so the hook survives 1/3-res instead of vanishing into the void. */
  {
    const grip2 = spearGrip.clone().add(V(-0.02, 0.05, -0.03));
    const bandEnd = spearGrip.clone().add(V(0.02, -0.09, 0.03));
    const hookRoot = spearGrip.clone().add(V(-0.025, 0.15, -0.06));
    tube(bandEnd, spearGrip, 0.032, 0.034, 6, P.shaftDk, { capA: { hex: P.shaftDk } });
    tube(spearGrip, grip2, 0.034, 0.029, 6, P.bronze);
    tube(grip2, hookRoot, 0.029, 0.021, 6, P.shaft);
    const hookMid = hookRoot.clone().add(V(-0.075, 0.085, -0.015));
    const hookTip = hookMid.clone().add(V(-0.015, 0.075, 0.068));   // curves back toward the wielder
    tube(hookRoot, hookMid, 0.023, 0.016, 5, P.steelDk);
    tube(hookMid, hookTip, 0.016, 0.007, 5, P.steel, { capB: { hex: P.steel } });
  }

  /* base disc (Large: r=0.55, matches the yuan-ti-abomination's Large disc) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.55, 0.55, 18);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.53, 0.53, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.058, 0), P.discTop);
  }
}
