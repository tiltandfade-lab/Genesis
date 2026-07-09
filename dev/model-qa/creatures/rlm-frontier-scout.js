/* dev/model-qa/creatures/rlm-frontier-scout.js — the SCOUT landmark table (HUMANOID family,
   Medium, CR 1/2, realm frontier), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry pilot, frontier-w2 cell 11). Core identity: the ARMED SQUATTER on a forged land deed
   — a frontier scout who's claimed ground he has no right to and is ready to shoot to keep it.
   Bespoke to the render key "scout"; realm reskins ride this chassis.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: lean, wiry trail build (narrower than the
        Tough's beefy barrel), carried through a real spine twist — the torso rotates toward the
        planted/staked leg, chest opening slightly toward the camera as the chin lifts defiant.
     2. SIGNATURE — the claim defense: the lead boot planted UP on top of a hand-driven CLAIM
        STAKE (a rough wooden post, half-buried, jutting from the disc), weight rocked back onto
        it; the rifle held diagonally across the body at port arms, both hands gripping it, the
        barrel crossing the chest at high value against the shirt.
     3. Chin lifted and turned slightly toward camera — defiant, not cowed; a hard flat stare.
     4. Face — sun-weathered tan skin, a hard flat brow, thin set mouth (no snarl — controlled,
        not enraged), a few days' dark stubble shading the jaw, a wide-brim trail hat throwing a
        hard shadow-break line across the brow.
     5. Bedroll — a rolled blanket cylinder slung diagonally across the back, tied off with two
        cord wraps — the second signature read, visible from the three-quarter/back turns.
     6. Costume breaks: a canvas duster/vest hanging open over the shirt, a cartridge bandolier
        crossing the chest opposite the rifle sling, worn trail boots, patched trousers.

   POSE SENTENCE: the claim defense — one boot driven up onto the half-buried claim stake,
   weight rocked back and braced through the twisted spine, the rifle held diagonally at port
   arms across the chest with both hands, chin lifted and turned toward the camera in open
   defiance, the bedroll slung across the back completing the read from every angle — the beat
   of a squatter daring you to test the deed, never an at-attention parade stance.

   SPINE-GESTURE SENTENCE: the spine runs from a hip band rotated toward the staked leg, up
   through an easing twist to a shoulder band that opens back slightly toward the camera (the
   rifle held across the open chest), then the neck/head continues the counter-rotation further,
   chin lifted — so the trace hips-to-skull is a shallow uncoiling spiral (twist-in at the hip,
   twist-out at the head), with the free leg planted wide on the ground as the counterweight to
   the staked leg's raised height.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w2'], cell 11, fn buildScout). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildScout(){
  /* ---------- PALETTE (frontier-desaturated, warm dust tones; canvas duster + pale shirt vs.
     dark trousers/boot/stake — the rifle barrel + shirt + stake top carry the law-3 high-value
     zone). ---------- */
  const P = {
    shirt: 0xc8b888, shirtDk: 0x968660,
    duster: 0x8a7a5a, dusterDk: 0x60543c,
    pants: 0x6c5a3e, pantsDk: 0x4a3c28,
    boot: 0x5c4c34, bootDk: 0x3e3220,
    skin: 0xb8825c, skinDk: 0x86593c,
    hat: 0x746038, hatDk: 0x4c3f24,
    band: 0x2c2418,
    stubble: 0x4a3a28,
    mouth: 0x2c2018,
    stake: 0x9a7c50, stakeDk: 0x6c5836, stakeTop: 0xc4a468,
    barrel: 0x2a2620, barrelHi: 0xa8a496, stock: 0x5c4630,
    roll: 0x7a5838, rollDk: 0x543c24, cord: 0x2c2018,
    bando: 0x4c3e28, shell: 0xc4a852,
    disc: 0x36312a, discTop: 0x423b32,
  };

  /* ===== SPINE — shallow uncoiling twist: hip rotates toward the staked (+x) leg, shoulder
     eases back open, head continues the counter-rotation further with the lifted chin. ===== */
  const L = {
    hipY: 0.40, waistY: 0.53, ribY: 0.66, chestY: 0.79, shldY: 0.90, neckY: 0.965,
    jawY: 1.03, browY: 1.09, crownY: 1.135,
  };
  const HIP_ANG = 0.34, SHLD_ANG = 0.16;              // ~19.5deg -> ~9deg: uncoils as it rises
  const HEAD_ANG = SHLD_ANG - 0.30;                    // head continues the counter-rotation, chin toward camera
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }
  function twist(p){
    const t = Math.min(1, Math.max(0, (p.y - L.hipY) / (L.shldY - L.hipY)));
    return rotY(p, HIP_ANG + t * (SHLD_ANG - HIP_ANG));
  }
  const headXf = (p) => rotY(p, HEAD_ANG);

  /* ===== CLAIM STAKE — the signature prop, half-driven into the disc, near-camera (+x) side so
     it clears the torso silhouette and the boot resting on it reads clean. ===== */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's stake (top=0.215) sat almost exactly where
     the boot sole landed, so the boot fully swallowed it — the claim-stake signature never
     reached the render at all, and the stake also crowded the raised leg's own silhouette.
     Fixed: taller shaft (top=0.30) with a visible bare-shaft gap below the boot, pulled forward
     (+z, toward camera) clear of the leg, and widened so the bright stakeTop cap peeks past the
     boot's edge instead of hiding under it. */
  const stakeBaseX = 0.255, stakeBaseZ = 0.185, stakeTopY = 0.30;
  {
    const base = V(stakeBaseX, 0.002, stakeBaseZ);
    const top = V(stakeBaseX + 0.02, stakeTopY, stakeBaseZ - 0.015);
    tube(base, top, 0.062, 0.048, 8, P.stake, { capB: { hex: P.stakeTop, lift: 0.018 } });
    /* driven-in wedge at the base reads as "hammered into ground" */
    quad(V(base.x - 0.07, 0.006, base.z), V(base.x + 0.07, 0.006, base.z),
      V(base.x + 0.06, 0.03, base.z + 0.045), V(base.x - 0.06, 0.03, base.z + 0.045), P.stakeDk, 0.05);
  }

  /* ===== LEGS — staked leg (+x) planted UP on top of the stake, bent, weight rocked back onto
     it; free leg (-x) planted wide on the ground as the counterweight. ===== */
  {
    // STAKED leg (+x): hip -> knee -> boot resting atop the stake top
    const hipS = twist(V(0.130, L.hipY, 0.00));
    const kneeS = V(0.245, 0.44, 0.20);
    const footS = V(stakeBaseX + 0.008, stakeTopY + 0.038, stakeBaseZ - 0.03);
    tube(hipS, kneeS, 0.098, 0.080, 8, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeS, footS, 0.080, 0.060, 8, P.pantsDk, { capB: { hex: P.boot, lift: 0.016 } });
    quad(V(footS.x + 0.05, footS.y - 0.014, footS.z + 0.02), V(footS.x - 0.05, footS.y - 0.014, footS.z + 0.02),
      V(footS.x - 0.045, footS.y + 0.016, footS.z + 0.09), V(footS.x + 0.045, footS.y + 0.016, footS.z + 0.09), P.boot, 0.04);

    // FREE leg (-x): planted wide on the ground, braced, taking the rocked-back weight
    const hipF = twist(V(-0.130, L.hipY, -0.01));
    const kneeF = V(-0.220, 0.19, -0.12);
    const footF = V(-0.250, 0.03, -0.20);
    tube(hipF, kneeF, 0.100, 0.084, 8, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeF, footF, 0.084, 0.062, 8, P.pantsDk, { capB: { hex: P.boot, lift: 0.018 } });
    quad(V(footF.x - 0.05, 0.015, footF.z - 0.02), V(footF.x + 0.05, 0.015, footF.z - 0.02),
      V(footF.x + 0.045, 0.045, footF.z - 0.09), V(footF.x - 0.045, 0.045, footF.z - 0.09), P.bootDk, 0.04);
  }

  /* ===== TORSO — lean wiry trail build, twisted through the spine rotation. Duster hangs open
     over the shirt (belly panel), belt breaks pants from shirt. ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.155, rz: 0.140, hex: P.pants },
    { y: L.waistY, rx: 0.185, rz: 0.170, hex: P.pantsDk },   // belt line
    { y: L.ribY,   rx: 0.198, rz: 0.172, hex: P.shirt },
    { y: L.chestY, rx: 0.208, rz: 0.168, hex: P.shirtDk },
    { y: L.shldY,  rx: 0.222, rz: 0.162, hex: P.shirt },
    { y: L.neckY,  rx: 0.084, rz: 0.078, hex: P.skinDk },
  ];
  stack(torsoBands, 10, { xform: twist });

  /* open duster — two dark canvas panels hanging past the shirt at the sides, following the
     twist down from shoulder to hip, breaking up the torso silhouette with a costume layer */
  for(const s of [-1, 1]){
    const top = twist(V(s * 0.20, L.shldY + 0.01, -0.03));
    const mid = twist(V(s * 0.225, L.chestY - 0.05, -0.02));
    const bot = twist(V(s * 0.19, L.hipY - 0.06, 0.01));
    quad(V(top.x, top.y, top.z), V(top.x + s * 0.05, top.y - 0.01, top.z - 0.06),
      V(bot.x + s * 0.045, bot.y, bot.z - 0.04), V(bot.x, bot.y, bot.z), P.duster, 0.05);
    quad(V(mid.x, mid.y, mid.z), V(mid.x + s * 0.052, mid.y - 0.02, mid.z - 0.07),
      V(bot.x + s * 0.048, bot.y - 0.03, bot.z - 0.05), V(bot.x, bot.y - 0.02, bot.z), P.dusterDk, 0.04);
  }

  /* belt line + small buckle glint */
  {
    const c = twist(V(0, L.hipY + 0.03, 0.165));
    quad(V(c.x - 0.075, c.y - 0.016, c.z), V(c.x + 0.075, c.y - 0.016, c.z),
      V(c.x + 0.075, c.y + 0.016, c.z), V(c.x - 0.075, c.y + 0.016, c.z), P.pantsDk, 0.04);
    quad(V(c.x - 0.018, c.y - 0.014, c.z + 0.006), V(c.x + 0.018, c.y - 0.014, c.z + 0.006),
      V(c.x + 0.018, c.y + 0.014, c.z + 0.006), V(c.x - 0.018, c.y + 0.014, c.z + 0.006), P.shell, 0.03);
  }

  /* cartridge bandolier — crosses the chest opposite the rifle's diagonal, a countable costume
     line with bright shell studs (a small high-value glint chain) */
  {
    const top = twist(V(-0.155, L.shldY - 0.01, 0.10));
    const bot = twist(V(0.09, L.hipY + 0.07, 0.15));
    quad(V(top.x - 0.02, top.y, top.z), V(top.x + 0.02, top.y, top.z),
      V(bot.x + 0.018, bot.y, bot.z), V(bot.x - 0.018, bot.y, bot.z), P.bando, 0.04);
    for(let i = 1; i < 4; i++){
      const t = i / 4;
      const p = V(top.x + (bot.x - top.x) * t, top.y + (bot.y - top.y) * t, top.z + (bot.z - top.z) * t + 0.01);
      quad(V(p.x - 0.012, p.y - 0.010, p.z), V(p.x + 0.012, p.y - 0.010, p.z),
        V(p.x + 0.010, p.y + 0.012, p.z), V(p.x - 0.010, p.y + 0.012, p.z), P.shell, 0.05);
    }
  }

  /* ===== BEDROLL — rolled blanket slung diagonally across the back, tied with two cord wraps.
     The second signature read; sits on the far/back (-z) side of the twisted torso. ===== */
  {
    const rollA = twist(V(-0.16, L.shldY + 0.03, -0.10));
    const rollB = twist(V(0.135, L.hipY + 0.02, -0.135));
    tube(rollA, rollB, 0.075, 0.075, 10, P.roll, { capA: { hex: P.rollDk }, capB: { hex: P.rollDk } });
    for(const t of [0.32, 0.68]){
      const c = V(rollA.x + (rollB.x - rollA.x) * t, rollA.y + (rollB.y - rollA.y) * t, rollA.z + (rollB.z - rollA.z) * t);
      const ax = new THREE.Vector3(rollB.x - rollA.x, rollB.y - rollA.y, rollB.z - rollA.z).normalize();
      const perp = new THREE.Vector3().crossVectors(ax, V(0, 1, 0)).normalize().multiplyScalar(0.09);
      quad(V(c.x - perp.x, c.y - perp.y - 0.002, c.z - perp.z), V(c.x + perp.x, c.y + perp.y - 0.002, c.z + perp.z),
        V(c.x + perp.x, c.y + perp.y + 0.002, c.z + perp.z), V(c.x - perp.x, c.y - perp.y + 0.002, c.z - perp.z), P.cord, 0.03);
    }
  }

  /* ===== HEAD — chin lifted, defiant, hat brim shadow-break, stubbled jaw. ===== */
  {
    const headBands = [
      { y: L.jawY,    rx: 0.092, rz: 0.088, hex: P.stubble },
      { y: L.browY,   rx: 0.106, rz: 0.100, hex: P.skin },
      { y: L.crownY,  rx: 0.088, rz: 0.082, hex: P.skinDk },
    ];
    stack(headBands, 10, { xform: headXf, capTop: { hex: P.skinDk, lift: 0.02 } });

    const jawC = headXf(V(0, L.jawY, 0.086));
    const browC = headXf(V(0, L.browY, 0.100));

    /* hard flat brow ridge */
    quad(V(jawC.x - 0.062, browC.y + 0.025, browC.z), V(jawC.x + 0.062, browC.y + 0.025, browC.z),
      V(jawC.x + 0.050, browC.y + 0.046, browC.z - 0.008), V(jawC.x - 0.050, browC.y + 0.046, browC.z - 0.008), P.skinDk, 0.03);

    /* thin set mouth — controlled, not snarling */
    quad(V(jawC.x - 0.030, jawC.y - 0.040, jawC.z), V(jawC.x + 0.030, jawC.y - 0.040, jawC.z),
      V(jawC.x + 0.026, jawC.y - 0.030, jawC.z + 0.004), V(jawC.x - 0.026, jawC.y - 0.030, jawC.z + 0.004), P.mouth, 0.04);

    /* wide-brim trail hat — a flat disc brim + a low crown, throwing a hard shadow line across
       the brow (the discPos matches the disc's own edge-break trick, but scaled to the head) */
    /* R2 SELF-CORRECTION (post r1 engine render): r1's brim (browY+0.075) hung low enough to
       shadow-swallow the whole face — sun-weathered skin, brow, and mouth all vanished under the
       hat, losing the "defiant stare" read entirely. Lifted the brim clear of the brow and added
       a brighter tan cheek patch (law 3 high-value zone) so the face survives under the shadow
       line instead of disappearing into it. */
    const brimC = headXf(V(0, L.browY + 0.135, 0.01));
    const brim = ring(brimC, V(0, 1, 0), 0.175, 0.165, 10, Math.PI / 10);
    const crownRing = ring(headXf(V(0, L.browY + 0.135, 0.01)), V(0, 1, 0), 0.095, 0.088, 10, Math.PI / 10);
    stitch([brim, crownRing], () => P.hatDk);
    const crownTop = ring(headXf(V(0, L.crownY + 0.12, 0.005)), V(0, 1, 0), 0.086, 0.080, 10, Math.PI / 10);
    stitch([crownRing, crownTop], () => P.hat);
    capFan(crownTop, headXf(V(0, L.crownY + 0.145, 0.005)), P.hat);

    /* bright sun-weathered cheek patch — law-3 high-value zone under the brim shadow */
    for(const s of [-1, 1]){
      const p = headXf(V(s * 0.075, L.browY - 0.02, 0.092));
      quad(V(p.x - 0.022, p.y - 0.018, p.z), V(p.x + 0.022, p.y - 0.018, p.z),
        V(p.x + 0.018, p.y + 0.018, p.z), V(p.x - 0.018, p.y + 0.018, p.z), 0xd89c68, 0.05);
    }
  }

  /* ===== ARMS — POSE-ANATOMY law 2/3: shoulders ride with the twist, elbows always bent
     100-150 deg. Both hands grip the rifle held diagonally at port arms across the chest —
     the barrel is the high-value zone (law 3), crossing bright against the shirt. ===== */

  /* LEFT arm (-x, lower grip on the rifle's forestock, near the hip) */
  const shL = twist(V(-0.190, L.shldY - 0.01, 0.02));
  const elL = V(-0.145, 0.685, 0.235);
  const wrL = V(-0.020, 0.635, 0.315);
  tube(shL, elL, 0.058, 0.050, 8, P.duster);
  tube(elL, wrL, 0.046, 0.038, 8, P.shirtDk, { phase: Math.PI / 6 });
  quad(V(wrL.x - 0.024, wrL.y - 0.022, wrL.z), V(wrL.x + 0.024, wrL.y - 0.022, wrL.z),
    V(wrL.x + 0.020, wrL.y + 0.024, wrL.z + 0.016), V(wrL.x - 0.020, wrL.y + 0.024, wrL.z + 0.016), P.skin, 0.04);

  /* RIGHT arm (+x, upper grip near the rifle's stock/trigger, at the chest) */
  const shR = twist(V(0.190, L.shldY - 0.01, 0.01));
  const elR = V(0.235, 0.72, 0.145);
  const wrR = V(0.145, 0.815, 0.235);
  tube(shR, elR, 0.058, 0.050, 8, P.duster);
  tube(elR, wrR, 0.046, 0.038, 8, P.shirtDk, { phase: Math.PI / 6 });
  quad(V(wrR.x - 0.024, wrR.y - 0.022, wrR.z), V(wrR.x + 0.024, wrR.y - 0.022, wrR.z),
    V(wrR.x + 0.020, wrR.y + 0.024, wrR.z + 0.016), V(wrR.x - 0.020, wrR.y + 0.024, wrR.z + 0.016), P.skin, 0.04);

  /* RIFLE — diagonal from the low left grip up to the high right grip, crossing the chest at
     port arms; barrel extends past the right hand, stock past the left. High-value barrel
     highlight strip (law 3, >=0.04u) rides the top face. */
  {
    const stockEnd = V(wrL.x - 0.10, wrL.y - 0.04, wrL.z - 0.06);
    const muzzle = V(wrR.x + 0.11, wrR.y + 0.05, wrR.z + 0.09);
    tube(stockEnd, wrL, 0.030, 0.026, 6, P.stock);
    tube(wrL, wrR, 0.024, 0.020, 6, P.barrel);
    tube(wrR, muzzle, 0.020, 0.015, 6, P.barrel);
    /* highlight strip along the barrel top — the law-3 body-mass-clearing bright zone */
    const midA = V(wrL.x, wrL.y + 0.024, wrL.z);
    const midB = V(wrR.x, wrR.y + 0.020, wrR.z);
    quad(V(midA.x - 0.01, midA.y, midA.z - 0.01), V(midA.x + 0.01, midA.y, midA.z + 0.01),
      V(midB.x + 0.01, midB.y, midB.z + 0.01), V(midB.x - 0.01, midB.y, midB.z - 0.01), P.barrelHi, 0.06);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
