/* dev/model-qa/creatures/rlm-shared-bandit-crime-lord.js — the CRIME LORD landmark table
   (HUMANOID family, Medium, CR 4, CROSS-REALM shared body), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, catchall-w1 cell 10). Core identity: the BANDIT line apex —
   a bounty hunter who only delivers corpses / alias-juggling smuggler boss, the seated-power read.
   Cross-realm shared body: authored to the neutral core identity, no single realm's palette gimmick.
   Bespoke to the render key "crimeLord"; realm reskins ride this chassis.

   FEATURE CHECKLIST (the ~1,300-1,800 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: a long fine coat over a lean, confident
        frame, carried through a real spine lean — the torso rotates and leans forward toward the
        raised knee, chest opening toward the viewer as it closes the distance.
     2. SIGNATURE — the terms: one boot planted UP on a low crate, forearm resting across the
        raised knee, torso leaning IN toward the viewer; the other hand held out to the side
        flicking a bright COIN mid-air (the high-value mote) — the crate lean + the coin flick.
     3. Face — cold, appraising half-smile; hard eyes under a low-brimmed hat, a thin dueling
        scar, high-value pale skin against the dark coat collar.
     4. Twin holsters crossing the hips in an X-belt rig, gun grips catching light against the
        dark coat.
     5. Fine long coat — tailored, collar popped, a single bright accent (a pocket-chain glint)
        breaking the dark mass; hangs open past the planted knee, split by the pose.
     6. The low crate — a weathered wooden box, the seat of power, planted foot resting on its
        top edge, a rope-cinched lid strap for texture.

   POSE SENTENCE: the terms — one boot driven up onto a low crate, forearm draped across the
   raised knee, torso leaning forward INTO the viewer as the free hand flicks a coin into the
   air at shoulder height, chin low and eyes level — the beat of a boss stating his price and
   watching you decide, never an at-attention parade stance.

   SPINE-GESTURE SENTENCE: the spine runs from a hip band rotated and dropped toward the planted
   (crate) leg, up through a forward-leaning curve to a shoulder band that pitches further
   forward and opens slightly toward the coin hand, then the neck/head continues the lean,
   chin dropped level at the viewer — so the trace hips-to-skull is one unbroken forward-leaning
   C-curve (the "closing the deal" lean), with the free leg planted on the ground as the
   counterweight to the raised knee.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['catchall-w1'], cell 10, fn buildBanditCrimeLord). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildBanditCrimeLord(){
  /* ---------- PALETTE (neutral cross-realm: dark tailored coat, pale shirt/skin, brass/gold
     accents on holsters + coin + chain — the coin + shirt + face carry the law-3 high-value
     zone against the dark coat mass). ---------- */
  const P = {
    coat: 0x2c2a30, coatDk: 0x1a181c, coatHi: 0x3e3a42,
    shirt: 0xd8ceb8, shirtDk: 0xa89c82,
    pants: 0x7a6c56, pantsDk: 0x584c3c,
    boot: 0x463c30, bootDk: 0x2e2620,
    skin: 0xc89468, skinDk: 0x926846,
    hat: 0x24211e, hatDk: 0x161412,
    scar: 0x7a4c40,
    mouth: 0x50302a,
    holster: 0x3a2e22, holsterDk: 0x281f18, gunGrip: 0xc4a24c,
    chain: 0xd4b458,
    coin: 0xf0d060, coinDk: 0xb89030,
    crate: 0x86694a, crateDk: 0x5c4830, crateTop: 0xa4835a,
    rope: 0x9a8258,
    disc: 0x2e2a26, discTop: 0x38332c,
  };

  /* ===== SPINE — one unbroken forward-leaning C-curve: hip rotates+drops toward the crate
     (+x) leg, shoulder pitches further forward, head continues the lean toward the viewer. ===== */
  const L = {
    hipY: 0.44, waistY: 0.57, ribY: 0.69, chestY: 0.81, shldY: 0.915, neckY: 0.975,
    jawY: 1.035, browY: 1.095, crownY: 1.14,
  };
  const HIP_LEAN = 0.10, SHLD_LEAN = 0.30;             // forward pitch (rotate about x, lean +z)
  const HIP_ANG = 0.16, SHLD_ANG = 0.26;                // slight yaw toward the coin-hand side
  const HEAD_ANG = SHLD_ANG + 0.10;
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }
  function lean(p, t){
    // forward pitch: shift +z proportional to height-fraction t, plus a slight y compression
    const fz = HIP_LEAN + t * (SHLD_LEAN - HIP_LEAN);
    return V(p.x, p.y, p.z + fz * (p.y - L.hipY + 0.05));
  }
  function twist(p){
    const t = Math.min(1, Math.max(0, (p.y - L.hipY) / (L.shldY - L.hipY)));
    const yawed = rotY(p, HIP_ANG + t * (SHLD_ANG - HIP_ANG));
    return lean(yawed, t);
  }
  const headXf = (p) => {
    const yawed = rotY(p, HEAD_ANG);
    return lean(yawed, 1.15);
  };

  /* ===== CRATE — the seat of power, near-camera (+x) side, planted foot rests on its top. ===== */
  const crateX = 0.255, crateZ = 0.235, crateTopY = 0.235;
  {
    const cx0 = crateX - 0.125, cx1 = crateX + 0.125, cz0 = crateZ - 0.115, cz1 = crateZ + 0.115;
    // 4 side faces + top
    quad(V(cx0, 0, cz1), V(cx1, 0, cz1), V(cx1, crateTopY, cz1), V(cx0, crateTopY, cz1), P.crate, 0.04);
    quad(V(cx1, 0, cz0), V(cx0, 0, cz0), V(cx0, crateTopY, cz0), V(cx1, crateTopY, cz0), P.crateDk, 0.04);
    quad(V(cx0, 0, cz0), V(cx0, 0, cz1), V(cx0, crateTopY, cz1), V(cx0, crateTopY, cz0), P.crateDk, 0.04);
    quad(V(cx1, 0, cz1), V(cx1, 0, cz0), V(cx1, crateTopY, cz0), V(cx1, crateTopY, cz1), P.crate, 0.04);
    quad(V(cx0, crateTopY, cz0), V(cx1, crateTopY, cz0), V(cx1, crateTopY, cz1), V(cx0, crateTopY, cz1), P.crateTop, 0.03);
    // rope-cinched lid strap
    quad(V(cx0 - 0.01, crateTopY + 0.001, crateZ - 0.012), V(cx1 + 0.01, crateTopY + 0.001, crateZ - 0.012),
      V(cx1 + 0.01, crateTopY + 0.001, crateZ + 0.012), V(cx0 - 0.01, crateTopY + 0.001, crateZ + 0.012), P.rope, 0.03);
  }

  /* ===== LEGS — planted leg (+x) on the crate top, knee bent up high; free leg (-x) grounded,
     counterweight to the forward lean. ===== */
  {
    // PLANTED leg (+x): hip -> knee (raised, forward) -> boot on the crate top
    const hipP = twist(V(0.135, L.hipY, 0.00));
    const kneeP = V(crateX + 0.02, 0.50, crateZ - 0.04);
    const footP = V(crateX + 0.01, crateTopY + 0.02, crateZ + 0.02);
    tube(hipP, kneeP, 0.100, 0.082, 8, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeP, footP, 0.082, 0.062, 8, P.pantsDk, { capB: { hex: P.boot, lift: 0.016 } });
    quad(V(footP.x + 0.05, footP.y - 0.014, footP.z + 0.02), V(footP.x - 0.05, footP.y - 0.014, footP.z + 0.02),
      V(footP.x - 0.045, footP.y + 0.016, footP.z + 0.09), V(footP.x + 0.045, footP.y + 0.016, footP.z + 0.09), P.boot, 0.04);

    // FREE leg (-x): grounded, slightly back, the counterweight to the forward lean
    const hipF = twist(V(-0.135, L.hipY, -0.02));
    const kneeF = V(-0.185, 0.20, -0.06);
    const footF = V(-0.205, 0.03, -0.05);
    tube(hipF, kneeF, 0.102, 0.086, 8, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeF, footF, 0.086, 0.064, 8, P.pantsDk, { capB: { hex: P.boot, lift: 0.018 } });
    quad(V(footF.x - 0.05, 0.015, footF.z - 0.02), V(footF.x + 0.05, 0.015, footF.z - 0.02),
      V(footF.x + 0.045, 0.045, footF.z - 0.09), V(footF.x - 0.045, 0.045, footF.z - 0.09), P.bootDk, 0.04);
  }

  /* ===== TORSO — lean confident build under the coat, carried through the forward lean. ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.150, rz: 0.135, hex: P.pants },
    { y: L.waistY, rx: 0.178, rz: 0.162, hex: P.pantsDk },
    { y: L.ribY,   rx: 0.195, rz: 0.168, hex: P.shirt },
    { y: L.chestY, rx: 0.208, rz: 0.166, hex: P.shirtDk },
    { y: L.shldY,  rx: 0.226, rz: 0.160, hex: P.shirt },
    { y: L.neckY,  rx: 0.082, rz: 0.076, hex: P.skinDk },
  ];
  stack(torsoBands, 10, { xform: twist });

  /* fine long coat — two dark tailored panels hanging past the shirt, split open by the
     raised knee, following the lean down to knee-height (long-coat read, not a jacket) */
  for(const s of [-1, 1]){
    const top = twist(V(s * 0.205, L.shldY + 0.01, -0.03));
    const mid = twist(V(s * 0.230, L.chestY - 0.05, -0.02));
    const bot = twist(V(s * 0.185, L.hipY - 0.28, s > 0 ? 0.06 : 0.01));
    quad(V(top.x, top.y, top.z), V(top.x + s * 0.05, top.y - 0.01, top.z - 0.06),
      V(bot.x + s * 0.05, bot.y, bot.z - 0.03), V(bot.x, bot.y, bot.z), P.coat, 0.05);
    quad(V(mid.x, mid.y, mid.z), V(mid.x + s * 0.055, mid.y - 0.02, mid.z - 0.07),
      V(bot.x + s * 0.05, bot.y - 0.05, bot.z - 0.04), V(bot.x, bot.y - 0.02, bot.z), P.coatDk, 0.04);
  }

  /* twin holsters — X-belt rig crossing the hips, brass gun grips catching light */
  for(const s of [-1, 1]){
    const top = twist(V(s * -0.06, L.shldY - 0.02, 0.11));
    const bot = twist(V(s * 0.13, L.hipY + 0.02, 0.14));
    quad(V(top.x - 0.018, top.y, top.z), V(top.x + 0.018, top.y, top.z),
      V(bot.x + 0.016, bot.y, bot.z), V(bot.x - 0.016, bot.y, bot.z), P.holster, 0.04);
    const grip = twist(V(s * 0.155, L.hipY + 0.055, 0.155));
    quad(V(grip.x - 0.022, grip.y - 0.02, grip.z), V(grip.x + 0.022, grip.y - 0.02, grip.z),
      V(grip.x + 0.018, grip.y + 0.024, grip.z + 0.012), V(grip.x - 0.018, grip.y + 0.024, grip.z + 0.012), P.gunGrip, 0.05);
  }

  /* pocket-chain glint — the single bright accent breaking the dark coat mass */
  {
    const a = twist(V(0.10, L.chestY - 0.03, 0.155));
    const b = twist(V(0.02, L.hipY + 0.09, 0.165));
    tube(a, b, 0.010, 0.010, 6, P.chain);
  }

  /* ===== HEAD — chin low, eyes level, cold appraising half-smile, low-brimmed hat. ===== */
  {
    const headBands = [
      { y: L.jawY,    rx: 0.090, rz: 0.086, hex: P.skin },
      { y: L.browY,   rx: 0.104, rz: 0.098, hex: P.skin },
      { y: L.crownY,  rx: 0.086, rz: 0.080, hex: P.skinDk },
    ];
    stack(headBands, 10, { xform: headXf, capTop: { hex: P.skinDk, lift: 0.02 } });

    const jawC = headXf(V(0, L.jawY, 0.086));
    const browC = headXf(V(0, L.browY, 0.098));

    /* dueling scar — a thin diagonal mark across the cheek/brow */
    quad(V(jawC.x - 0.008, browC.y + 0.01, browC.z + 0.01), V(jawC.x + 0.008, browC.y + 0.01, browC.z + 0.01),
      V(jawC.x + 0.014, jawC.y - 0.015, jawC.z + 0.03), V(jawC.x - 0.002, jawC.y - 0.015, jawC.z + 0.03), P.scar, 0.03);

    /* cold half-smile — asymmetric mouth line, one corner lifted */
    quad(V(jawC.x - 0.032, jawC.y - 0.038, jawC.z), V(jawC.x + 0.034, jawC.y - 0.034, jawC.z),
      V(jawC.x + 0.030, jawC.y - 0.024, jawC.z + 0.004), V(jawC.x - 0.028, jawC.y - 0.028, jawC.z + 0.004), P.mouth, 0.04);

    /* hard eyes — small dark bands under the brow, level and appraising */
    for(const s of [-1, 1]){
      const p = headXf(V(s * 0.042, L.browY - 0.012, 0.096));
      quad(V(p.x - 0.016, p.y - 0.008, p.z), V(p.x + 0.016, p.y - 0.008, p.z),
        V(p.x + 0.014, p.y + 0.010, p.z), V(p.x - 0.014, p.y + 0.010, p.z), P.mouth, 0.05);
    }

    /* bright pale-skin cheek highlight — law-3 high-value zone on the face */
    for(const s of [-1, 1]){
      const p = headXf(V(s * 0.070, L.browY - 0.02, 0.088));
      quad(V(p.x - 0.020, p.y - 0.016, p.z), V(p.x + 0.020, p.y - 0.016, p.z),
        V(p.x + 0.016, p.y + 0.016, p.z), V(p.x - 0.016, p.y + 0.016, p.z), 0xe0b888, 0.05);
    }

    /* low-brimmed hat — flat disc brim + low crown */
    const brimC = headXf(V(0, L.browY + 0.115, 0.005));
    const brim = ring(brimC, V(0, 1, 0), 0.168, 0.158, 10, Math.PI / 10);
    const crownRing = ring(headXf(V(0, L.browY + 0.115, 0.005)), V(0, 1, 0), 0.090, 0.084, 10, Math.PI / 10);
    stitch([brim, crownRing], () => P.hatDk);
    const crownTop = ring(headXf(V(0, L.crownY + 0.10, 0.0)), V(0, 1, 0), 0.082, 0.076, 10, Math.PI / 10);
    stitch([crownRing, crownTop], () => P.hat);
    capFan(crownTop, headXf(V(0, L.crownY + 0.125, 0.0)), P.hat);

    /* collar — popped coat collar framing the neck/jaw, breaking the torso-head seam */
    for(const s of [-1, 1]){
      const p = twist(V(s * 0.075, L.neckY + 0.01, 0.0));
      const q = twist(V(s * 0.10, L.shldY - 0.01, -0.02));
      quad(V(p.x, p.y + 0.05, p.z - 0.03), V(p.x, p.y - 0.01, p.z),
        V(q.x, q.y, q.z), V(q.x, q.y + 0.05, q.z - 0.03), P.coat, 0.04);
    }
  }

  /* ===== ARMS — POSE-ANATOMY law 2/3: shoulders ride with the lean, elbows bent 100-150 deg.
     LEFT arm rests forearm across the raised knee; RIGHT arm out to the side flicking the coin —
     the coin is the loud law-3 high-value mote, held clear of the body mass. ===== */

  /* LEFT arm (-x on the yaw, but crosses toward the +x raised knee): shoulder -> elbow -> wrist
     draped across the planted knee. */
  const shL = twist(V(-0.195, L.shldY - 0.01, 0.02));
  const elL = V(-0.03, 0.60, 0.28);
  const wrL = V(crateX - 0.02, 0.505, crateZ + 0.10);
  tube(shL, elL, 0.058, 0.050, 8, P.coat);
  tube(elL, wrL, 0.046, 0.038, 8, P.shirtDk, { phase: Math.PI / 6 });
  quad(V(wrL.x - 0.024, wrL.y - 0.020, wrL.z), V(wrL.x + 0.024, wrL.y - 0.020, wrL.z),
    V(wrL.x + 0.020, wrL.y + 0.022, wrL.z + 0.016), V(wrL.x - 0.020, wrL.y + 0.022, wrL.z + 0.016), P.skin, 0.04);

  /* RIGHT arm (+x, out to the side, raised at shoulder height): shoulder -> elbow -> wrist
     flicking the coin. */
  const shR = twist(V(0.195, L.shldY - 0.01, 0.01));
  const elR = V(0.295, 0.865, 0.05);
  const wrR = V(0.335, 0.955, 0.145);
  tube(shR, elR, 0.058, 0.050, 8, P.coat);
  tube(elR, wrR, 0.046, 0.038, 8, P.shirtDk, { phase: Math.PI / 6 });
  quad(V(wrR.x - 0.022, wrR.y - 0.018, wrR.z), V(wrR.x + 0.022, wrR.y - 0.018, wrR.z),
    V(wrR.x + 0.018, wrR.y + 0.020, wrR.z + 0.014), V(wrR.x - 0.018, wrR.y + 0.020, wrR.z + 0.014), P.skin, 0.04);

  /* THE COIN — mid-air above the flicking hand, small bright disc (the signature mote, law 3). */
  {
    const c = V(wrR.x + 0.03, wrR.y + 0.11, wrR.z + 0.03);
    const cr = ring(c, V(0.3, 1, 0.1), 0.032, 0.032, 8);
    const cr2 = ring(V(c.x + 0.006, c.y, c.z + 0.002), V(0.3, 1, 0.1), 0.028, 0.028, 8);
    stitch([cr, cr2], () => P.coin);
    capFan(cr, V(c.x - 0.01, c.y + 0.005, c.z - 0.004), P.coin);
    capFan(cr2, V(c.x + 0.018, c.y - 0.003, c.z + 0.006), P.coinDk, true);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
