/* dev/model-qa/creatures/rlm-shared-guard-captain.js — the GUARD CAPTAIN landmark table
   (HUMANOID family, Medium, CR 4, CROSS-REALM shared body), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, catchall-w1 cell 7). Core
   identity: the GUARD body escalated to officer class — bank-job planner, bought-off examiner,
   gallery marksman, whichever realm skins it. Bespoke to the render key "guardCaptain"; realm
   reskins ride this chassis. Authored to the NEUTRAL core identity — no single realm's palette
   gimmicks (see rlm-shared-spy.js / rlm-shared-mage.js for sibling catchall bodies).

   FEATURE CHECKLIST (the ~1,300-1,800 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: a real spine twist mid-order — hips plant
        toward the braced leg, ribcage untwists back through the chest, shoulders open further
        still to throw the command fist, head turns hardest of all toward the ranks. The trace
        hips->shoulders->skull is a rising spiral, never a plumb line.
     2. SIGNATURE #1 — the plume: a tall crest of curved fins jutting from the kettle-helm's crown,
        high-value color against the dark steel, the single loudest read from every silhouette.
     3. SIGNATURE #2 — the command fist: the off arm (left) thrown straight UP, shoulder dragged up
        with it per POSE-ANATOMY law 3, elbow still holding a slight break, fist balled tight —
        "hold fast," not a stiff salute.
     4. The order arm (right): elbow bent, longsword held low and OUT to the side mid-signal —
        blade lowered as if just completing a downward cutting gesture that pointed the ranks
        forward, not resting sheathed. Longsword crossguard + a bright blade-edge high-value strip.
     5. Half-cape — a single panel slung off the back shoulder (opposite the sword arm), caught
        mid-swing (a curved trailing silhouette, asymmetric, never hanging straight down) — reads
        the motion of the turn even in a static pose.
     6. Head turned hard toward the ranks (away from the sword-arm side), kettle-helm brim throwing
        a shadow break, a hard set jaw visible under it.
     7. Costume breaks: tabard over a mail-textured torso (banded rings), belt, trim on the tabard
        hem, plain trousers + tall boots — the officer-class layer over the base guard's gambeson.

   POSE SENTENCE: caught mid-order — the longsword just completing its downward cutting sweep,
   held low and out to the side, off arm punched straight overhead in a hold-fast fist, spine
   spiraling from a planted hip through an open chest to a head wrenched hard toward the ranks,
   the half-cape still catching the turn's motion — never an at-attention parade stance.

   SPINE-GESTURE SENTENCE: the spine runs from a hip band rotated toward the braced (sword-side)
   leg, up through an easing twist to a shoulder band that opens further still (dragged up on the
   fist side per law 3), then the neck/head continues the rotation hardest of all toward the
   ranks — hips-to-skull traces a rising uncoiling spiral, with the free leg planted wide as the
   counterweight and the hips tilting in contrapposto against the shoulder line.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['catchall-w1'], cell 7, fn buildGuardCaptain). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildGuardCaptain(){
  /* ---------- PALETTE (neutral officer-class: dark worn steel, deep tabard red-oxide (not a
     house color — a generic command-red), bright plume + blade-edge carrying law-3's high-value
     zone against the dark mail/steel body mass). ---------- */
  const P = {
    mail: 0x6a6e72, mailDk: 0x4a4d50,
    tabard: 0x7a3230, tabardDk: 0x521f1e, trim: 0xc4a852,
    steel: 0x8f959a, steelDk: 0x5c6266,
    cape: 0x3a3430, capeDk: 0x241f1c,
    skin: 0xb8825c, skinDk: 0x86593c,
    trouser: 0x625a48, boot: 0x584a38, bootDk: 0x3a3024,
    belt: 0x2c2418, buckle: 0xc4a852,
    plume: 0xc4302a, plumeDk: 0x841e1a, plumeHi: 0xe85c48,
    bladeHi: 0xd8dce0, hilt: 0x8a6c34,
    disc: 0x36312a, discTop: 0x423b32,
  };

  /* ===== SPINE — rising uncoiling twist: hip rotates toward the braced (+x, sword) leg, shoulder
     opens further still, head continues the rotation hardest of all toward the ranks (-x turn of
     the face away from the sword side, per the direction brief). ===== */
  const L = {
    hipY: 0.42, waistY: 0.55, ribY: 0.68, chestY: 0.81, shldY: 0.92, neckY: 0.975,
    jawY: 1.035, browY: 1.095, crownY: 1.14,
  };
  const HIP_ANG = 0.22, SHLD_ANG = 0.42;               // ~12.6deg -> ~24deg: uncoils UPWARD (opens)
  const HEAD_ANG = SHLD_ANG + 0.34;                     // head turns hardest of all, toward the ranks
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }
  function twist(p){
    const t = Math.min(1, Math.max(0, (p.y - L.hipY) / (L.shldY - L.hipY)));
    return rotY(p, HIP_ANG + t * (SHLD_ANG - HIP_ANG));
  }
  const headXf = (p) => rotY(p, HEAD_ANG);

  /* ===== LEGS — braced leg (+x) plants the weight forward/wide under the sword-side hip; free
     leg (-x) trails, straighter, counterweighting the hip tilt (contrapposto). ===== */
  {
    // BRACED leg (+x): hip -> knee -> boot planted wide, taking the weight of the turn
    const hipB = twist(V(0.135, L.hipY, 0.00));
    const kneeB = V(0.235, 0.235, 0.155);
    const footB = V(0.270, 0.03, 0.24);
    tube(hipB, kneeB, 0.100, 0.084, 8, P.trouser, { capA: { hex: P.trouser } });
    tube(kneeB, footB, 0.084, 0.062, 8, P.trouser, { capB: { hex: P.boot, lift: 0.018 } });
    quad(V(footB.x + 0.05, 0.015, footB.z + 0.03), V(footB.x - 0.05, 0.015, footB.z + 0.03),
      V(footB.x - 0.045, 0.045, footB.z + 0.12), V(footB.x + 0.045, 0.045, footB.z + 0.12), P.boot, 0.04);

    // FREE leg (-x): trails straighter, small counter-bend at the knee, planted narrower
    const hipF = twist(V(-0.135, L.hipY, -0.01));
    const kneeF = V(-0.185, 0.22, -0.10);
    const footF = V(-0.195, 0.03, -0.16);
    tube(hipF, kneeF, 0.098, 0.082, 8, P.trouser, { capA: { hex: P.trouser } });
    tube(kneeF, footF, 0.082, 0.060, 8, P.trouser, { capB: { hex: P.boot, lift: 0.018 } });
    quad(V(footF.x - 0.05, 0.015, footF.z - 0.02), V(footF.x + 0.05, 0.015, footF.z - 0.02),
      V(footF.x + 0.045, 0.045, footF.z - 0.09), V(footF.x - 0.045, 0.045, footF.z - 0.09), P.bootDk, 0.04);
  }

  /* ===== TORSO — mail-banded core with a tabard overlay; twisted through the spine rotation. ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.160, rz: 0.145, hex: P.mailDk },
    { y: L.waistY, rx: 0.190, rz: 0.172, hex: P.mail },     // belt line
    { y: L.ribY,   rx: 0.202, rz: 0.175, hex: P.mailDk },
    { y: L.chestY, rx: 0.212, rz: 0.170, hex: P.mail },
    { y: L.shldY,  rx: 0.226, rz: 0.164, hex: P.mailDk },
    { y: L.neckY,  rx: 0.086, rz: 0.080, hex: P.skinDk },
  ];
  stack(torsoBands, 10, { xform: twist });

  /* tabard — front + back panel over the mail, deep command-red with a trim hem, side-open so
     the mail bands still peek through at the flanks */
  for(const side of ['front', 'back']){
    const zSign = side === 'front' ? 1 : -1;
    const top = twist(V(0, L.shldY - 0.01, zSign * 0.155));
    const midL = twist(V(-0.13, L.chestY - 0.06, zSign * 0.175));
    const midR = twist(V(0.13, L.chestY - 0.06, zSign * 0.175));
    const botL = twist(V(-0.10, L.hipY - 0.09, zSign * 0.155));
    const botR = twist(V(0.10, L.hipY - 0.09, zSign * 0.155));
    quad(V(top.x - 0.10, top.y, top.z), V(top.x + 0.10, top.y, top.z), midR, midL, P.tabard, 0.04);
    quad(midL, midR, botR, botL, P.tabardDk, 0.04);
    /* trim hem — bright thin band, law-3 accent along the tabard's bottom edge */
    quad(V(botL.x, botL.y - 0.006, botL.z), V(botR.x, botR.y - 0.006, botR.z),
      V(botR.x, botR.y + 0.012, botR.z), V(botL.x, botL.y + 0.012, botL.z), P.trim, 0.03);
  }

  /* belt line + buckle */
  {
    const c = twist(V(0, L.hipY + 0.03, 0.170));
    quad(V(c.x - 0.075, c.y - 0.016, c.z), V(c.x + 0.075, c.y - 0.016, c.z),
      V(c.x + 0.075, c.y + 0.016, c.z), V(c.x - 0.075, c.y + 0.016, c.z), P.belt, 0.04);
    quad(V(c.x - 0.018, c.y - 0.014, c.z + 0.006), V(c.x + 0.018, c.y - 0.014, c.z + 0.006),
      V(c.x + 0.018, c.y + 0.014, c.z + 0.006), V(c.x - 0.018, c.y + 0.014, c.z + 0.006), P.buckle, 0.03);
  }

  /* ===== HALF-CAPE — a single panel slung off the back (left, off-fist-arm) shoulder, caught
     mid-swing: an asymmetric curved trailing silhouette, not a straight hang. ===== */
  {
    const hookA = twist(V(-0.20, L.shldY + 0.02, -0.06));
    const hookB = twist(V(-0.10, L.shldY - 0.01, -0.09));
    const capeTop0 = hookA, capeTop1 = hookB;
    /* swing curve: the panel bells OUT and BACK as if caught mid-turn, three control widths */
    const s1 = V(hookA.x - 0.22, L.chestY - 0.02, hookA.z - 0.20);
    const s2 = V(hookA.x - 0.30, L.waistY + 0.02, hookA.z - 0.34);
    const e1 = V(hookB.x - 0.10, L.chestY - 0.05, hookB.z - 0.10);
    const e2 = V(hookB.x - 0.14, L.waistY, hookB.z - 0.18);
    const hemA = V(hookA.x - 0.34, L.hipY - 0.10, hookA.z - 0.42);
    const hemB = V(hookB.x - 0.17, L.hipY - 0.06, hookB.z - 0.22);
    quad(capeTop0, capeTop1, s1, s1, P.cape, 0.03);
    quad(s1, e1, e2, s2, P.cape, 0.05);
    quad(s2, e2, hemB, hemA, P.capeDk, 0.06);
    quad(hemA, hemB, e2, s2, P.capeDk, 0.05);
  }

  /* ===== HEAD — turned hard toward the ranks (away from the sword side), kettle-helm brim
     shadow-break, set jaw. ===== */
  {
    const headBands = [
      { y: L.jawY,    rx: 0.092, rz: 0.088, hex: P.skinDk },
      { y: L.browY,   rx: 0.106, rz: 0.100, hex: P.skin },
      { y: L.crownY,  rx: 0.088, rz: 0.082, hex: P.skinDk },
    ];
    stack(headBands, 10, { xform: headXf, capTop: { hex: P.skinDk, lift: 0.02 } });

    const jawC = headXf(V(0, L.jawY, 0.086));
    const browC = headXf(V(0, L.browY, 0.100));

    /* hard set brow */
    quad(V(jawC.x - 0.060, browC.y + 0.024, browC.z), V(jawC.x + 0.060, browC.y + 0.024, browC.z),
      V(jawC.x + 0.048, browC.y + 0.044, browC.z - 0.008), V(jawC.x - 0.048, browC.y + 0.044, browC.z - 0.008), P.skinDk, 0.03);

    /* jaw set hard, mouth a flat line */
    quad(V(jawC.x - 0.028, jawC.y - 0.038, jawC.z), V(jawC.x + 0.028, jawC.y - 0.038, jawC.z),
      V(jawC.x + 0.024, jawC.y - 0.028, jawC.z + 0.004), V(jawC.x - 0.024, jawC.y - 0.028, jawC.z + 0.004), 0x2c2018, 0.04);

    /* ===== KETTLE-HELM — a flat brim ring at brow height + a low steel dome crown, casting the
       shadow break across the eyes. ===== */
    const brimC = headXf(V(0, L.browY + 0.14, 0.01));
    const brim = ring(brimC, V(0, 1, 0), 0.180, 0.170, 10, Math.PI / 10);
    const crownRing = ring(brimC, V(0, 1, 0), 0.098, 0.090, 10, Math.PI / 10);
    stitch([brim, crownRing], () => P.steelDk);
    const crownMid = ring(headXf(V(0, L.crownY + 0.10, 0.005)), V(0, 1, 0), 0.088, 0.080, 10, Math.PI / 10);
    stitch([crownRing, crownMid], () => P.steel);
    const crownTop = ring(headXf(V(0, L.crownY + 0.135, 0.002)), V(0, 1, 0), 0.040, 0.036, 10, Math.PI / 10);
    stitch([crownMid, crownTop], () => P.steelDk);

    /* ===== PLUME — SIGNATURE #1: a tall crest of curved fins jutting from the helm's crown,
       tallest single feature, bright against the dark steel (law 3 high-value, >=0.04u zones,
       real 3D volume so it reads from every angle per ANATOMY-CANON rule 3). ===== */
    {
      const baseC = headXf(V(0, L.crownY + 0.145, -0.01));
      const dir = headXf(V(0, 1, -0.28));
      const nrm = new THREE.Vector3(dir.x, dir.y, dir.z).sub(new THREE.Vector3(baseC.x, baseC.y, baseC.z)).normalize();
      /* three stacked fin quads curving up-and-back, each pair (front/back face) for volume */
      const fins = [
        { h0: 0.00, h1: 0.11, w: 0.050, back: -0.02 },
        { h0: 0.09, h1: 0.20, w: 0.060, back: -0.06 },
        { h0: 0.18, h1: 0.29, w: 0.048, back: -0.11 },
      ];
      for(const f of fins){
        const p0 = V(baseC.x, baseC.y + f.h0, baseC.z + f.back * 0.3);
        const p1 = V(baseC.x, baseC.y + f.h1, baseC.z + f.back);
        const hexTop = f.h1 > 0.2 ? P.plumeHi : P.plume;
        quad(V(p0.x - f.w, p0.y, p0.z), V(p0.x + f.w, p0.y, p0.z),
          V(p1.x + f.w * 0.6, p1.y, p1.z), V(p1.x - f.w * 0.6, p1.y, p1.z), hexTop, 0.06);
        quad(V(p0.x + f.w, p0.y, p0.z + 0.01), V(p0.x - f.w, p0.y, p0.z + 0.01),
          V(p1.x - f.w * 0.6, p1.y, p1.z + 0.01), V(p1.x + f.w * 0.6, p1.y, p1.z + 0.01), P.plumeDk, 0.05);
      }
      /* bright tip cap — the loudest single point of the silhouette */
      quad(V(baseC.x - 0.03, baseC.y + 0.29, baseC.z - 0.11), V(baseC.x + 0.03, baseC.y + 0.29, baseC.z - 0.11),
        V(baseC.x + 0.014, baseC.y + 0.335, baseC.z - 0.13), V(baseC.x - 0.014, baseC.y + 0.335, baseC.z - 0.13), P.plumeHi, 0.05);
    }
  }

  /* ===== ARMS — POSE-ANATOMY law 2/3: elbows always bend 100-150deg, shoulders ride with the
     lift. Left = the command fist thrown straight up (shoulder dragged up); right = the order
     arm, elbow bent, longsword held low and out mid-signal. ===== */

  /* LEFT arm (-x) — the command fist, punched straight overhead; shoulder rides UP with it. */
  const shL = twist(V(-0.185, L.shldY + 0.055, 0.00));   // shoulder already dragged up (law 3)
  const elL = V(-0.270, 1.115, 0.075);
  const wrL = V(-0.225, 1.405, 0.045);   // pushed further out+up so the fist clears the plume silhouette
  tube(shL, elL, 0.060, 0.052, 8, P.mail);
  tube(elL, wrL, 0.046, 0.040, 8, P.skinDk, { phase: Math.PI / 5 });
  /* balled fist — a compact blocky knuckle mass, not a flat paddle */
  {
    const f = wrL;
    quad(V(f.x - 0.030, f.y - 0.026, f.z - 0.024), V(f.x + 0.030, f.y - 0.026, f.z - 0.024),
      V(f.x + 0.028, f.y + 0.030, f.z - 0.02), V(f.x - 0.028, f.y + 0.030, f.z - 0.02), P.skin, 0.05);
    quad(V(f.x - 0.028, f.y - 0.026, f.z + 0.024), V(f.x + 0.028, f.y - 0.026, f.z + 0.024),
      V(f.x + 0.026, f.y + 0.028, f.z + 0.02), V(f.x - 0.026, f.y + 0.028, f.z + 0.02), P.skinDk, 0.04);
  }

  /* RIGHT arm (+x) — the order arm: elbow bent, longsword held low and OUT to the side mid the
     downward cutting sweep, not sheathed at rest. */
  const shR = twist(V(0.190, L.shldY - 0.01, 0.00));
  const elR = V(0.310, 0.745, 0.155);
  const wrR = V(0.445, 0.605, 0.290);   // pushed further out+forward so the blade clears the leg entirely
  tube(shR, elR, 0.060, 0.052, 8, P.mail);
  tube(elR, wrR, 0.046, 0.040, 8, P.skinDk, { phase: Math.PI / 5 });
  quad(V(wrR.x - 0.026, wrR.y - 0.024, wrR.z), V(wrR.x + 0.026, wrR.y - 0.024, wrR.z),
    V(wrR.x + 0.022, wrR.y + 0.026, wrR.z + 0.016), V(wrR.x - 0.022, wrR.y + 0.026, wrR.z + 0.016), P.skin, 0.04);

  /* ===== LONGSWORD — SIGNATURE (order arm): hilt at the grip, crossguard, blade extending low
     and out from the wrist, angled as if just completing a downward cut. Bright blade-edge strip
     carries the law-3 high-value zone against the dark mail body. ===== */
  {
    const gripBase = V(wrR.x - 0.02, wrR.y - 0.04, wrR.z - 0.01);
    const gripTop = V(wrR.x + 0.05, wrR.y + 0.03, wrR.z + 0.03);
    tube(gripBase, gripTop, 0.020, 0.018, 6, P.hilt);
    /* crossguard */
    const gDir = new THREE.Vector3(gripTop.x - gripBase.x, gripTop.y - gripBase.y, gripTop.z - gripBase.z).normalize();
    const cross = new THREE.Vector3().crossVectors(gDir, V(0, 1, 0)).normalize().multiplyScalar(0.075);
    quad(V(gripTop.x - cross.x, gripTop.y - cross.y, gripTop.z - cross.z), V(gripTop.x + cross.x, gripTop.y + cross.y, gripTop.z + cross.z),
      V(gripTop.x + cross.x * 0.5, gripTop.y + cross.y * 0.5 + 0.015, gripTop.z + cross.z * 0.5),
      V(gripTop.x - cross.x * 0.5, gripTop.y - cross.y * 0.5 + 0.015, gripTop.z - cross.z * 0.5), P.steelDk, 0.04);
    /* blade — R2 SELF-CORRECTION (post r1 render): r1's blade angled DOWN off the wrist and
       nearly vanished into the leg/ground-shadow, losing the order-arm signature entirely.
       Redirected outward-and-slightly-up (away from the body, clear of the leg silhouette) and
       lengthened + thickened for a stronger, more legible read. */
    const bladeTip = V(gripTop.x + gDir.x * 0.72 + 0.30, gripTop.y + gDir.y * 0.72 + 0.06, gripTop.z + gDir.z * 0.72 + 0.10);
    const bladeMid = V(gripTop.x + gDir.x * 0.34 + 0.15, gripTop.y + gDir.y * 0.34 + 0.03, gripTop.z + gDir.z * 0.34 + 0.05);
    tube(gripTop, bladeMid, 0.034, 0.026, 6, P.steel);
    tube(bladeMid, bladeTip, 0.024, 0.007, 6, P.steel);
    /* bright edge highlight strip along the top of the blade, law-3 zone, widened for legibility */
    const hi0 = V(gripTop.x, gripTop.y + 0.020, gripTop.z);
    const hi1 = V(bladeMid.x, bladeMid.y + 0.016, bladeMid.z);
    const hi2 = V(bladeTip.x, bladeTip.y + 0.008, bladeTip.z);
    quad(V(hi0.x - 0.011, hi0.y, hi0.z), V(hi0.x + 0.011, hi0.y, hi0.z),
      V(hi1.x + 0.011, hi1.y, hi1.z), V(hi1.x - 0.011, hi1.y, hi1.z), P.bladeHi, 0.06);
    quad(V(hi1.x - 0.009, hi1.y, hi1.z), V(hi1.x + 0.009, hi1.y, hi1.z),
      V(hi2.x + 0.005, hi2.y, hi2.z), V(hi2.x - 0.005, hi2.y, hi2.z), P.bladeHi, 0.06);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
