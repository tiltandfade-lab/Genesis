/* dev/model-qa/creatures/rlm-shared-wight-lord.js — the WIGHT LORD (HUMANOID family, Medium,
   CR 7, CROSS-REALM shared body), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry pilot, catchall-w1 cell 8). Core identity: the WIGHT body enthroned in authority —
   crown proper, robes over the armor, a planted key-scepter — dead bank owner guarding his
   strongbox / drowned chaplain / jilted suitor, whichever realm reskins it. Bespoke to the
   render key "wightLord"; neutral cross-realm core, no single realm's palette gimmicks.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: an armored noble-knight barrel under a
        robe, carried through a real spine twist — hips rotate toward the planted foot atop the
        strongbox, shoulders ease open toward camera, head continues the counter-rotation, crown
        held high.
     2. SIGNATURE — the possession claim: standing atop a low strongbox/plinth block, the great
        key-scepter planted like a flag in the near hand, the far hand splayed possessively flat
        over the box lid, crowned head high.
     3. Crown — a proper jeweled circlet, the single brightest law-3 zone in the piece.
     4. Face — pale dead wight flesh, sunken hollow eye pits (dark, not glowing — a quiet
        elevated undead, not a screaming one), a grim closed mouth line.
     5. Robe over plate — a heavy over-robe hangs open past the shoulders and down the back,
        breaking the armor silhouette and reading from every turn; visible plate pauldrons and
        a breastplate edge underneath.
     6. Key-scepter — an oversized ornate key held haft-down like a mace/standard, its bow (the
        ring head) at the top, catching a second high-value glint below the crown.

   POSE SENTENCE: the possession claim — one booted foot planted flat atop the low strongbox,
   the other braced wide on the ground, weight rocked over the claimed box, the key-scepter
   driven haft-down beside the planted foot like a flag staked in conquered ground, the free
   hand splayed flat and possessive across the box lid, crowned head lifted high in cold
   authority — never an at-attention parade stance, always the dead lord standing on what is his.

   SPINE-GESTURE SENTENCE: the spine runs from a hip band rotated toward the box-planted leg, up
   through an easing twist to a shoulder band that opens back toward the camera (the splayed hand
   reaching down-and-out to the box), then the neck/head continues the counter-rotation further,
   crown lifted — so the trace hips-to-skull is a shallow uncoiling spiral (twist-in at the hip,
   twist-out at the head), with the free leg planted wide on the ground as the counterweight.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['catchall-w1'], cell 8, fn buildWightLord). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildWightLord(){
  /* ---------- PALETTE (neutral cross-realm: pale dead flesh, tarnished plate, a deep faded
     robe, gold crown/key as the law-3 high-value zones). ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1 read as a near-monochrome grey silhouette —
     plate/robe/boot values sat too close in luminance to each other AND to the void/disc, so the
     legs vanished into the base, the robe layer never separated from the plate, and the box read
     as a shadow blob under the feet instead of a distinct claimed object. Face features (eye
     pits/mouth) also washed out against the mid-grey skin. Fixed: pushed plate/robe/boot/box each
     to a clearly separated luminance band, brightened the box + its band trim so the "standing on
     his strongbox" signature reads, and lifted skin contrast so the pale dead face survives. */
  const P = {
    skin: 0xb4b8a4, skinDk: 0x848870, eyepit: 0x100f0c,
    plate: 0x82887a, plateDk: 0x565a4c, plateHi: 0xb4bcac,
    robe: 0x6c5480, robeDk: 0x483458,
    robeTrim: 0x9a7c40,
    crown: 0xe8c460, crownDk: 0xac8830,
    key: 0xd8b850, keyDk: 0x9c7c34,
    mouth: 0x0a0a08,
    boot: 0x565040, bootDk: 0x342e20,
    box: 0x8e7048, boxDk: 0x5c4630, boxBand: 0xd0a848,
    disc: 0x241f22, discTop: 0x2c2628,
  };

  /* ===== SPINE — shallow uncoiling twist: hip rotates toward the box-planted (+x) leg, shoulder
     eases back open, head continues the counter-rotation further with the crown lifted. ===== */
  const L = {
    hipY: 0.44, waistY: 0.58, ribY: 0.72, chestY: 0.86, shldY: 0.98, neckY: 1.05,
    jawY: 1.11, browY: 1.175, crownY: 1.23,
  };
  const HIP_ANG = 0.32, SHLD_ANG = 0.14;
  const HEAD_ANG = SHLD_ANG - 0.24;
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }
  function twist(p){
    const t = Math.min(1, Math.max(0, (p.y - L.hipY) / (L.shldY - L.hipY)));
    return rotY(p, HIP_ANG + t * (SHLD_ANG - HIP_ANG));
  }
  const headXf = (p) => rotY(p, HEAD_ANG);

  /* ===== STRONGBOX — the signature possession prop: a low plinth/box near the +x foot, close
     enough to camera that the planted-flat foot reads clean on top of it. ===== */
  const boxCX = 0.12, boxCZ = 0.14, boxTopY = 0.14;
  {
    const bx = boxCX, bz = boxCZ;
    const c000 = V(bx - 0.13, 0.002, bz - 0.11), c100 = V(bx + 0.13, 0.002, bz - 0.11);
    const c110 = V(bx + 0.13, 0.002, bz + 0.11), c010 = V(bx - 0.13, 0.002, bz + 0.11);
    const c001 = V(bx - 0.13, boxTopY, bz - 0.11), c101 = V(bx + 0.13, boxTopY, bz - 0.11);
    const c111 = V(bx + 0.13, boxTopY, bz + 0.11), c011 = V(bx - 0.13, boxTopY, bz + 0.11);
    quad(c000, c100, c101, c001, P.box, 0.04);           // front
    quad(c100, c110, c111, c101, P.boxDk, 0.04);          // right
    quad(c010, c011, c111, c110, P.box, 0.04);            // back
    quad(c000, c001, c011, c010, P.boxDk, 0.04);          // left
    quad(c001, c101, c111, c011, P.boxDk, 0.03);          // top (mostly covered by foot/hand)
    /* brass corner band — a quiet secondary metal accent, not competing with the crown/key */
    quad(V(bx - 0.13, boxTopY - 0.03, bz - 0.111), V(bx + 0.13, boxTopY - 0.03, bz - 0.111),
      V(bx + 0.13, boxTopY - 0.015, bz - 0.111), V(bx - 0.13, boxTopY - 0.015, bz - 0.111), P.boxBand, 0.03);
  }

  /* ===== LEGS — box-planted leg (+x) flat atop the strongbox lid, weight rocked over it; free
     leg (-x) planted wide on the ground as the counterweight. ===== */
  {
    // BOX-PLANTED leg (+x): hip -> knee -> boot resting flat on the box lid
    const hipS = twist(V(0.145, L.hipY, 0.00));
    const kneeS = V(0.235, 0.32, 0.20);
    const footS = V(boxCX + 0.01, boxTopY + 0.018, boxCZ + 0.02);
    tube(hipS, kneeS, 0.108, 0.088, 8, P.plate, { capA: { hex: P.plateDk } });
    tube(kneeS, footS, 0.088, 0.066, 8, P.plateDk, { capB: { hex: P.boot, lift: 0.016 } });
    quad(V(footS.x + 0.055, footS.y - 0.014, footS.z + 0.02), V(footS.x - 0.055, footS.y - 0.014, footS.z + 0.02),
      V(footS.x - 0.05, footS.y + 0.016, footS.z + 0.10), V(footS.x + 0.05, footS.y + 0.016, footS.z + 0.10), P.boot, 0.04);

    // FREE leg (-x): planted wide on the ground, braced
    const hipF = twist(V(-0.145, L.hipY, -0.01));
    const kneeF = V(-0.240, 0.21, -0.13);
    const footF = V(-0.270, 0.03, -0.21);
    tube(hipF, kneeF, 0.110, 0.092, 8, P.plate, { capA: { hex: P.plateDk } });
    tube(kneeF, footF, 0.092, 0.068, 8, P.plateDk, { capB: { hex: P.boot, lift: 0.018 } });
    quad(V(footF.x - 0.055, 0.015, footF.z - 0.02), V(footF.x + 0.055, 0.015, footF.z - 0.02),
      V(footF.x + 0.05, 0.045, footF.z - 0.10), V(footF.x - 0.05, 0.045, footF.z - 0.10), P.bootDk, 0.04);
  }

  /* ===== TORSO — armored barrel under the twist, plate bands showing at hip/chest, robe layer
     added after as open panels. ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.175, rz: 0.155, hex: P.plateDk },
    { y: L.waistY, rx: 0.205, rz: 0.185, hex: P.plate },
    { y: L.ribY,   rx: 0.222, rz: 0.190, hex: P.plateDk },
    { y: L.chestY, rx: 0.235, rz: 0.185, hex: P.plate },
    { y: L.shldY,  rx: 0.250, rz: 0.178, hex: P.plateHi },
    { y: L.neckY,  rx: 0.090, rz: 0.084, hex: P.skinDk },
  ];
  stack(torsoBands, 10, { xform: twist });

  /* open over-robe — two heavy panels hanging past the plate at the sides/back, following the
     twist, the costume break that carries the "robed authority" read from every angle */
  for(const s of [-1, 1]){
    const top = twist(V(s * 0.24, L.shldY + 0.02, -0.04));
    const mid = twist(V(s * 0.26, L.chestY - 0.04, -0.03));
    const bot = twist(V(s * 0.22, L.hipY - 0.10, 0.02));
    quad(V(top.x, top.y, top.z), V(top.x + s * 0.065, top.y - 0.01, top.z - 0.08),
      V(bot.x + s * 0.058, bot.y - 0.04, bot.z - 0.05), V(bot.x, bot.y - 0.04, bot.z), P.robe, 0.06);
    quad(V(mid.x, mid.y, mid.z), V(mid.x + s * 0.066, mid.y - 0.02, mid.z - 0.09),
      V(bot.x + s * 0.06, bot.y - 0.07, bot.z - 0.06), V(bot.x, bot.y - 0.06, bot.z), P.robeDk, 0.05);
  }
  /* robe collar/trim across the shoulders — a warm secondary trim breaking the cold plate/robe */
  {
    const c = twist(V(0, L.shldY + 0.03, 0.09));
    quad(V(c.x - 0.14, c.y - 0.02, c.z), V(c.x + 0.14, c.y - 0.02, c.z),
      V(c.x + 0.13, c.y + 0.03, c.z + 0.02), V(c.x - 0.13, c.y + 0.03, c.z + 0.02), P.robeTrim, 0.04);
  }

  /* breastplate center ridge — visible plate seam under the open robe, chest centerline */
  {
    const c = twist(V(0, L.chestY - 0.02, 0.185));
    quad(V(c.x - 0.05, c.y - 0.09, c.z), V(c.x + 0.05, c.y - 0.09, c.z),
      V(c.x + 0.045, c.y + 0.09, c.z + 0.01), V(c.x - 0.045, c.y + 0.09, c.z + 0.01), P.plateHi, 0.04);
  }

  /* ===== HEAD — crown lifted high, sunken dark eye pits, grim closed mouth. ===== */
  {
    const headBands = [
      { y: L.jawY,    rx: 0.098, rz: 0.092, hex: P.skinDk },
      { y: L.browY,   rx: 0.112, rz: 0.104, hex: P.skin },
      { y: L.crownY,  rx: 0.092, rz: 0.084, hex: P.skinDk },
    ];
    stack(headBands, 10, { xform: headXf, capTop: { hex: P.skinDk, lift: 0.018 } });

    const jawC = headXf(V(0, L.jawY, 0.090));
    const browC = headXf(V(0, L.browY, 0.104));

    /* sunken eye pits — dark hollows, not glowing; a quiet elevated-dead read */
    for(const s of [-1, 1]){
      const p = headXf(V(s * 0.045, L.browY - 0.008, 0.098));
      quad(V(p.x - 0.020, p.y - 0.016, p.z), V(p.x + 0.020, p.y - 0.016, p.z),
        V(p.x + 0.016, p.y + 0.014, p.z + 0.006), V(p.x - 0.016, p.y + 0.014, p.z + 0.006), P.eyepit, 0.04);
    }

    /* grim closed mouth line */
    quad(V(jawC.x - 0.032, jawC.y - 0.044, jawC.z), V(jawC.x + 0.032, jawC.y - 0.044, jawC.z),
      V(jawC.x + 0.028, jawC.y - 0.034, jawC.z + 0.004), V(jawC.x - 0.028, jawC.y - 0.034, jawC.z + 0.004), P.mouth, 0.04);

    /* CROWN — jeweled circlet, the piece's single brightest law-3 zone, sat above the crown band */
    const crownBaseC = headXf(V(0, L.crownY + 0.05, 0.005));
    const ringA = ring(crownBaseC, V(0, 1, 0), 0.095, 0.084, 10);
    const ringB = ring(headXf(V(0, L.crownY + 0.11, 0.005)), V(0, 1, 0), 0.088, 0.078, 10);
    stitch([ringA, ringB], () => P.crown);
    capFan(ringB, headXf(V(0, L.crownY + 0.125, 0.005)), P.crownDk);
    /* three jewel points spiking off the circlet — countable features at >=0.04u */
    for(const ang of [0, Math.PI * 2 / 3, Math.PI * 4 / 3]){
      const rx = Math.sin(ang) * 0.086, rz = Math.cos(ang) * 0.078;
      const base = headXf(V(rx, L.crownY + 0.11, 0.005 + rz));
      const tip = headXf(V(rx * 1.02, L.crownY + 0.17, 0.005 + rz * 1.02));
      tube(base, tip, 0.022, 0.006, 5, P.crown, { capB: { hex: 0xf0d878, lift: 0.006 } });
    }
  }

  /* ===== ARMS — POSE-ANATOMY law 2/3: shoulders ride with the twist, elbows always bent
     100-150 deg. Near (+x) hand grips the key-scepter driven haft-down; far (-x) hand splays
     flat and possessive over the strongbox lid. ===== */

  /* RIGHT arm (+x, grips the key-scepter haft near the box-planted leg) */
  const shR = twist(V(0.235, L.shldY - 0.01, 0.01));
  const elR = V(0.29, 0.72, 0.155);
  const wrR = V(0.235, 0.56, 0.225);
  tube(shR, elR, 0.066, 0.056, 8, P.plate);
  tube(elR, wrR, 0.052, 0.042, 8, P.plateDk, { phase: Math.PI / 6 });
  quad(V(wrR.x - 0.026, wrR.y - 0.024, wrR.z), V(wrR.x + 0.026, wrR.y - 0.024, wrR.z),
    V(wrR.x + 0.022, wrR.y + 0.026, wrR.z + 0.018), V(wrR.x - 0.022, wrR.y + 0.026, wrR.z + 0.018), P.skin, 0.04);

  /* LEFT arm (-x, splayed flat over the box lid — the possessive gesture) */
  const shL = twist(V(-0.235, L.shldY - 0.01, 0.00));
  const elL = V(-0.26, 0.63, 0.14);
  const wrL = V(-0.20, 0.36, 0.20);
  tube(shL, elL, 0.064, 0.054, 8, P.plate);
  tube(elL, wrL, 0.050, 0.040, 8, P.plateDk, { phase: -Math.PI / 6 });
  /* splayed hand — a flat wide quad instead of a fist, spread over the box lid */
  quad(V(wrL.x - 0.045, wrL.y - 0.02, wrL.z - 0.01), V(wrL.x + 0.045, wrL.y - 0.02, wrL.z - 0.01),
    V(wrL.x + 0.038, wrL.y + 0.03, wrL.z + 0.06), V(wrL.x - 0.038, wrL.y + 0.03, wrL.z + 0.06), P.skin, 0.04);

  /* KEY-SCEPTER — oversized ornate key, held haft-down beside the planted foot like a flag; the
     bow (ring head) sits high near the crown, catching the second high-value glint (law 3). */
  {
    const haftBase = V(boxCX + 0.03, 0.03, boxCZ - 0.06);
    const haftTop = V(wrR.x, wrR.y, wrR.z);
    tube(haftBase, haftTop, 0.024, 0.026, 6, P.keyDk);
    const bowBase = V(haftTop.x, haftTop.y + 0.02, haftTop.z);
    const bowTop = V(haftTop.x + 0.01, haftTop.y + 0.22, haftTop.z - 0.01);
    tube(bowBase, bowTop, 0.026, 0.020, 6, P.key);
    /* the key's bow (ring head) — bright, law-3 high-value zone */
    const bowC = V(bowTop.x, bowTop.y + 0.08, bowTop.z);
    const bowR1 = ring(bowC, V(0, 0, 1), 0.095, 0.062, 10);
    const bowR2 = ring(V(bowC.x, bowC.y, bowC.z - 0.018), V(0, 0, 1), 0.095, 0.062, 10);
    stitch([bowR1, bowR2], () => P.crown);
    capFan(bowR2, V(bowC.x, bowC.y, bowC.z - 0.022), P.crown);
    /* teeth off the shaft near the base — countable key-teeth read */
    for(const t of [0.08, 0.16]){
      const p = V(haftBase.x + (haftTop.x - haftBase.x) * t, haftBase.y + (haftTop.y - haftBase.y) * t, haftBase.z + (haftTop.z - haftBase.z) * t);
      quad(V(p.x + 0.02, p.y - 0.01, p.z), V(p.x + 0.06, p.y - 0.01, p.z),
        V(p.x + 0.06, p.y + 0.03, p.z), V(p.x + 0.02, p.y + 0.03, p.z), P.key, 0.03);
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
