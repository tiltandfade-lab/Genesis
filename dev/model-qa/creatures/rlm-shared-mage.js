/* dev/model-qa/creatures/rlm-shared-mage.js — the MAGE landmark table (HUMANOID family, Medium,
   CR 6, CROSS-REALM shared body), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry pilot, catchall-w1 cell 0). Core identity: the battle mage mid-cast — a robed caster
   caught at the exact instant a spell leaves the staff. Bespoke to the render key "mage2"; five
   realms reskin this chassis (storm-witch, corrupt detective, rewired researcher, ballerina
   automaton, cultist-mage) — authored NEUTRAL, no single realm's palette gimmick. NOTE: a
   PC-class mage.js already exists (mon-quality) — this is the separate MONSTER body.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: robed caster build, spine arched INTO the
        cast — a real C-curve from hip to skull, weight staggered onto the back leg, front leg
        driven forward under the staff-arm reach.
     2. SIGNATURE — the SPELL MOTE: a bright glowing sphere blazing at the staff tip, held out
        at the end of the thrust-forward staff arm. Law-3 high-value zone, >=140 RGB, well clear
        of body mass so it reads against the void.
     3. Off hand pulled back at the hip, trailing 2-3 fading motes (smaller, dimmer echoes of the
        signature) — a secondary countable-feature read.
     4. Robe hem blown back by the cast — asymmetric flared panels trailing behind the staggered
        stance, breaking the silhouette from a static column.
     5. Staff — a long weathered wood shaft gripped in the forward hand, capped by a small dark
        focus-socket the mote sits just above/in front of.
     6. Face/hood — a weathered, non-regal hood shadowing the brow, hollow-cheeked, mouth set
        in a mid-incantation snarl (jaw dropped, casting a word).
     7. Costume breaks: a wide belt with hanging component pouches, a frayed rope-cord sash
        crossing the chest, patched robe layers (under-robe + over-robe) for a weathered-not-
        regal read.

   POSE SENTENCE: the mid-cast brace — staggered stance leaning hard into the spell, the front
   leg planted forward under a driven-out staff arm as the spell mote ignites at its tip, the
   back leg trailing straight behind bearing the push-off, the off hand thrown back at the hip
   trailing fading motes, the spine arched forward-and-up into the cast, robe hem snapping back
   in the spell-wind — never a neutral standing-cast T-pose.

   SPINE-GESTURE SENTENCE: the spine runs from a hip band rotated and driven forward over the
   staggered front leg, up through a forward arch (chest opening toward the staff-arm side) to
   a shoulder band that drops on the trailing/off-hand side and lifts on the staff side, then
   the neck/head continues the line, chin and hood thrust forward toward the mote — so the trace
   hips-to-skull is one continuous forward-leaning arc, with the counterpose in the pulled-back
   off arm and trailing back leg balancing the thrust.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['catchall-w1'], cell 0, fn buildMage2). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildMage2(){
  /* ---------- PALETTE (neutral weathered caster — muted robe browns/greens, no single realm's
     gimmick color; the mote carries the ONLY saturated/bright hue, law-3 high value zone). ---------- */
  const P = {
    robeOuter: 0x6c6250, robeOuterDk: 0x484030,
    robeUnder: 0x9c9268, robeUnderDk: 0x746a4e,
    hood: 0x504838, hoodDk: 0x342e24,
    skin: 0xb08e68, skinDk: 0x7c5e42,
    sash: 0x8a6c40, sashDk: 0x5c4828,
    belt: 0x342e22, pouch: 0x584a30,
    boot: 0x6c5f4a, bootDk: 0x584c3c,
    hemLit: 0xc8bc86,
    staff: 0x6c5838, staffDk: 0x463824,
    focus: 0x241f18,
    mote: 0x9ef0ff, moteCore: 0xffffff, moteFade: 0x5ac4dc, moteFaint: 0x2c6070,
    mouth: 0x180c0c, teeth: 0xd8d0c0,
    disc: 0x36312a, discTop: 0x423b32,
  };

  /* ===== SPINE — forward-leaning cast arc: hip drives forward over the staggered front leg,
     shoulders rise on the staff side / drop on the off side, head continues toward the mote. ===== */
  const L = {
    hipY: 0.40, waistY: 0.52, ribY: 0.64, chestY: 0.76, shldY: 0.865, neckY: 0.925,
    jawY: 0.975, browY: 1.03, crownY: 1.075,
  };
  const HIP_FWD = 0.10, SHLD_FWD = 0.22;               // z-lean grows going up the spine
  const HIP_ROLL = -0.12, SHLD_ROLL = 0.20;             // shoulder rotates open toward staff (+x) side
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }
  function arch(p){
    const t = Math.min(1, Math.max(0, (p.y - L.hipY) / (L.shldY - L.hipY)));
    const fwd = HIP_FWD + t * (SHLD_FWD - HIP_FWD);
    const roll = HIP_ROLL + t * (SHLD_ROLL - HIP_ROLL);
    const rolled = rotY(p, roll);
    return V(rolled.x, rolled.y, rolled.z + fwd * t * 0.9 + fwd * 0.15);
  }
  const headXf = (p) => { const a = arch(V(0, L.shldY, 0)); const r = rotY(p, SHLD_ROLL + 0.10); return V(r.x + a.x, r.y, r.z + a.z + 0.075); };

  /* ===== LEGS — staggered brace: front leg (+z) driven forward and planted, back leg (-z)
     trailing straight-ish behind bearing the push-off (POSE-ANATOMY: knee still bent, never a
     locked stick). ===== */
  {
    // FRONT leg (+z, staggered forward under the cast)
    const hipF = arch(V(0.075, L.hipY, 0.02));
    const kneeF = V(0.10, 0.225, 0.26);
    const footF = V(0.115, 0.028, 0.415);
    tube(hipF, kneeF, 0.098, 0.082, 8, P.robeUnderDk, { capA: { hex: P.robeUnder } });
    tube(kneeF, footF, 0.070, 0.052, 8, P.bootDk, { capB: { hex: P.boot, lift: 0.016 } });
    quad(V(footF.x + 0.046, footF.y - 0.012, footF.z + 0.01), V(footF.x - 0.046, footF.y - 0.012, footF.z + 0.01),
      V(footF.x - 0.040, footF.y + 0.014, footF.z + 0.10), V(footF.x + 0.040, footF.y + 0.014, footF.z + 0.10), P.boot, 0.04);

    // BACK leg (-z, trailing, push-off brace, knee still bent)
    const hipB = arch(V(-0.09, L.hipY, -0.03));
    const kneeB = V(-0.135, 0.205, -0.235);
    const footB = V(-0.155, 0.03, -0.36);
    tube(hipB, kneeB, 0.098, 0.080, 8, P.robeUnderDk, { capA: { hex: P.robeUnder } });
    tube(kneeB, footB, 0.068, 0.050, 8, P.bootDk, { capB: { hex: P.boot, lift: 0.016 } });
    quad(V(footB.x - 0.044, footB.y - 0.012, footB.z - 0.01), V(footB.x + 0.044, footB.y - 0.012, footB.z - 0.01),
      V(footB.x + 0.038, footB.y + 0.014, footB.z - 0.095), V(footB.x - 0.038, footB.y + 0.014, footB.z - 0.095), P.bootDk, 0.04);
  }

  /* ===== TORSO — robed caster, layered under-robe + over-robe, arched into the cast. ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.185, rz: 0.165, hex: P.robeUnderDk },
    { y: L.waistY, rx: 0.205, rz: 0.185, hex: P.belt },
    { y: L.ribY,   rx: 0.225, rz: 0.195, hex: P.robeOuter },
    { y: L.chestY, rx: 0.230, rz: 0.188, hex: P.robeOuterDk },
    { y: L.shldY,  rx: 0.235, rz: 0.178, hex: P.robeOuter },
    { y: L.neckY,  rx: 0.078, rz: 0.072, hex: P.skinDk },
  ];
  stack(torsoBands, 10, { xform: arch });

  /* robe hem — asymmetric flared panels trailing back behind the stagger, blown-back read;
     longer/wider on the trailing (-z) side, a shorter snap on the +x staff side. Each blown-back
     panel gets a thin bright rim strip along its outer (windward) edge — flag-note fix: without
     a value break the panels melted into the boots/disc at the base; the rim gives the flare a
     lit edge so the stagger reads crisply against the dark ground. */
    const lerp = (a, b, t) => V(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
    const RIM_T = 0.80; // rim strip starts 80% of the way out from the hip anchor
  {
    const hipC = arch(V(0, L.hipY - 0.02, 0));
    const p1 = arch(V(-0.20, L.hipY - 0.02, -0.05));
    const p2 = arch(V(-0.30, L.hipY - 0.10, -0.30));
    const p3 = arch(V(-0.02, L.hipY - 0.10, -0.34));
    quad(V(hipC.x, hipC.y, hipC.z), V(p1.x, p1.y, p1.z), V(p2.x, p2.y, p2.z), V(p3.x, p3.y, p3.z), P.robeOuterDk, 0.05);
    {
      const p1i = lerp(hipC, p1, RIM_T), p2i = lerp(hipC, p2, RIM_T), p3i = lerp(hipC, p3, RIM_T);
      quad(p1i, p1, p2, p2i, P.hemLit, 0.03);
      quad(p2i, p2, p3, p3i, P.hemLit, 0.03);
    }

    const q1 = arch(V(0.20, L.hipY - 0.03, 0.02));
    const q2 = arch(V(0.30, L.hipY - 0.09, -0.10));
    const q3 = arch(V(0.10, L.hipY - 0.09, -0.16));
    quad(V(hipC.x, hipC.y, hipC.z), V(q1.x, q1.y, q1.z), V(q2.x, q2.y, q2.z), V(q3.x, q3.y, q3.z), P.robeOuter, 0.05);
    {
      const q1i = lerp(hipC, q1, RIM_T), q2i = lerp(hipC, q2, RIM_T), q3i = lerp(hipC, q3, RIM_T);
      quad(q1i, q1, q2, q2i, P.hemLit, 0.03);
      quad(q2i, q2, q3, q3i, P.hemLit, 0.03);
    }

    /* front hem panel, following the forward-planted leg */
    const f1 = arch(V(0.10, L.hipY - 0.03, 0.05));
    const f2 = arch(V(0.16, L.hipY - 0.16, 0.24));
    const f3 = arch(V(-0.02, L.hipY - 0.16, 0.22));
    quad(V(hipC.x, hipC.y, hipC.z), V(f1.x, f1.y, f1.z), V(f2.x, f2.y, f2.z), V(f3.x, f3.y, f3.z), P.robeUnder, 0.05);
  }

  /* sash — frayed rope-cord crossing the chest opposite the staff side */
  {
    const top = arch(V(-0.155, L.shldY - 0.01, 0.03));
    const bot = arch(V(0.10, L.hipY + 0.07, 0.09));
    quad(V(top.x - 0.020, top.y, top.z), V(top.x + 0.020, top.y, top.z),
      V(bot.x + 0.018, bot.y, bot.z), V(bot.x - 0.018, bot.y, bot.z), P.sash, 0.04);
  }

  /* belt + hanging pouches (component pouches, costume-break countable feature) */
  {
    const c = arch(V(0, L.waistY, 0.19));
    quad(V(c.x - 0.09, c.y - 0.018, c.z), V(c.x + 0.09, c.y - 0.018, c.z),
      V(c.x + 0.09, c.y + 0.018, c.z), V(c.x - 0.09, c.y + 0.018, c.z), P.belt, 0.03);
    for(const s of [-1, 1]){
      const p = arch(V(s * 0.11, L.waistY - 0.045, 0.155));
      quad(V(p.x - 0.026, p.y - 0.032, p.z), V(p.x + 0.026, p.y - 0.032, p.z),
        V(p.x + 0.022, p.y + 0.02, p.z + 0.014), V(p.x - 0.022, p.y + 0.02, p.z + 0.014), P.pouch, 0.06);
    }
  }

  /* ===== HEAD — hood shadowed brow, hollow cheeks, mid-incantation open mouth. ===== */
  {
    const headBands = [
      { y: L.jawY,    rx: 0.082, rz: 0.078, hex: P.skinDk },
      { y: L.browY,   rx: 0.092, rz: 0.086, hex: P.skin },
      { y: L.crownY,  rx: 0.078, rz: 0.072, hex: P.hoodDk },
    ];
    stack(headBands, 10, { xform: headXf, capTop: { hex: P.hoodDk, lift: 0.02 } });

    const jawC = headXf(V(0, L.jawY, 0.078));

    /* mid-incantation open mouth — jaw dropped, casting a word */
    quad(V(jawC.x - 0.024, jawC.y - 0.052, jawC.z - 0.004), V(jawC.x + 0.024, jawC.y - 0.052, jawC.z - 0.004),
      V(jawC.x + 0.020, jawC.y - 0.020, jawC.z + 0.006), V(jawC.x - 0.020, jawC.y - 0.020, jawC.z + 0.006), P.mouth, 0.05);
    quad(V(jawC.x - 0.018, jawC.y - 0.024, jawC.z + 0.006), V(jawC.x + 0.018, jawC.y - 0.024, jawC.z + 0.006),
      V(jawC.x + 0.014, jawC.y - 0.018, jawC.z + 0.010), V(jawC.x - 0.014, jawC.y - 0.018, jawC.z + 0.010), P.teeth, 0.04);

    /* hollow cheeks — a dark shadow wedge either side of the jaw, weathered-not-regal */
    for(const s of [-1, 1]){
      const p = headXf(V(s * 0.068, L.jawY + 0.01, 0.05));
      quad(V(p.x - 0.018, p.y - 0.02, p.z), V(p.x + 0.018, p.y - 0.02, p.z),
        V(p.x + 0.014, p.y + 0.024, p.z - 0.01), V(p.x - 0.014, p.y + 0.024, p.z - 0.01), P.skinDk, 0.05);
    }

    /* hood — a deep cowl thrown up over the crown, shadowing the brow; asymmetric peak driven
       forward with the cast lean */
    const hoodC = headXf(V(0, L.browY + 0.075, -0.01));
    const hoodRing = ring(hoodC, V(0, 1, 0), 0.115, 0.105, 10, Math.PI / 10);
    const browRing = ring(headXf(V(0, L.browY + 0.02, -0.005)), V(0, 1, 0), 0.100, 0.092, 10, Math.PI / 10);
    stitch([browRing, hoodRing], () => P.hood);
    capFan(hoodRing, headXf(V(0.01, L.browY + 0.135, 0.02)), P.hoodDk);
  }

  /* ===== ARMS — POSE-ANATOMY law 2/3: shoulders ride with the arch, elbows bend 100-150deg.
     Staff arm (+x) driven forward-thrust; off arm (-x) pulled back at the hip, both bending
     at real elbow joints — never straight sticks. ===== */

  /* STAFF arm (+x, thrust forward and up, gripping the shaft) */
  const shR = arch(V(0.205, L.shldY - 0.01, 0.02));
  const elR = V(0.30, 0.72, 0.24);
  const wrR = V(0.40, 0.775, 0.475);
  tube(shR, elR, 0.058, 0.050, 8, P.robeOuter);
  tube(elR, wrR, 0.046, 0.038, 8, P.skinDk, { phase: Math.PI / 6 });
  quad(V(wrR.x - 0.022, wrR.y - 0.02, wrR.z), V(wrR.x + 0.022, wrR.y - 0.02, wrR.z),
    V(wrR.x + 0.018, wrR.y + 0.022, wrR.z + 0.014), V(wrR.x - 0.018, wrR.y + 0.022, wrR.z + 0.014), P.skin, 0.04);

  /* OFF arm (-x, pulled back at the hip, elbow bent, hand open trailing motes) */
  const shL = arch(V(-0.205, L.shldY - 0.02, -0.01));
  const elL = V(-0.245, 0.60, -0.15);
  const wrL = V(-0.175, 0.475, -0.29);
  tube(shL, elL, 0.056, 0.048, 8, P.robeOuter);
  tube(elL, wrL, 0.044, 0.036, 8, P.skinDk, { phase: Math.PI / 6 });
  quad(V(wrL.x - 0.020, wrL.y - 0.018, wrL.z), V(wrL.x + 0.020, wrL.y - 0.018, wrL.z),
    V(wrL.x + 0.016, wrL.y + 0.020, wrL.z - 0.012), V(wrL.x - 0.016, wrL.y + 0.020, wrL.z - 0.012), P.skin, 0.04);

  /* ===== STAFF — long shaft in the forward-driven grip, dark focus socket capping the top. ===== */
  const staffBase = V(wrR.x - 0.06, wrR.y - 0.24, wrR.z - 0.10);
  const staffTip = V(wrR.x + 0.055, wrR.y + 0.235, wrR.z + 0.105);
  tube(staffBase, wrR, 0.024, 0.020, 6, P.staffDk);
  tube(wrR, staffTip, 0.020, 0.016, 6, P.staff);
  const socketTop = V(staffTip.x + 0.012, staffTip.y + 0.028, staffTip.z + 0.014);
  tube(staffTip, socketTop, 0.030, 0.010, 8, P.focus);

  /* ===== SIGNATURE — SPELL MOTE: the blazing sphere at the staff tip. Law-3 >=140 RGB, well
     clear of body mass, >=0.04u so it survives 1/3-res. Built as stacked bright rings (a lofted
     sphere) with a hot white core and a cooler bright shell. ===== */
  {
    const moteC = V(socketTop.x + 0.04, socketTop.y + 0.075, socketTop.z + 0.05);
    const bands = [
      { y: moteC.y - 0.06, rx: 0.012, rz: 0.012, cx: moteC.x, cz: moteC.z, hex: P.moteFade },
      { y: moteC.y - 0.03, rx: 0.045, rz: 0.045, cx: moteC.x, cz: moteC.z, hex: P.mote },
      { y: moteC.y,        rx: 0.062, rz: 0.062, cx: moteC.x, cz: moteC.z, hex: P.moteCore },
      { y: moteC.y + 0.03, rx: 0.045, rz: 0.045, cx: moteC.x, cz: moteC.z, hex: P.mote },
      { y: moteC.y + 0.06, rx: 0.012, rz: 0.012, cx: moteC.x, cz: moteC.z, hex: P.moteFade },
    ];
    stack(bands, 8, { capTop: { hex: P.moteFade }, capBot: { hex: P.moteFade } });
  }

  /* trailing fading motes off the off-hand — 3 small dim echoes, descending size, arcing back
     from the wrist toward the hip (secondary countable feature) */
  {
    const echoes = [
      { p: V(wrL.x - 0.055, wrL.y + 0.03, wrL.z - 0.05), r: 0.026, hex: P.moteFade },
      { p: V(wrL.x - 0.11, wrL.y - 0.02, wrL.z - 0.13), r: 0.018, hex: P.moteFaint },
      { p: V(wrL.x - 0.155, wrL.y - 0.08, wrL.z - 0.20), r: 0.012, hex: P.moteFaint },
    ];
    for(const e of echoes){
      const bands = [
        { y: e.p.y - e.r * 0.6, rx: e.r * 0.5, rz: e.r * 0.5, cx: e.p.x, cz: e.p.z, hex: e.hex },
        { y: e.p.y,             rx: e.r,       rz: e.r,       cx: e.p.x, cz: e.p.z, hex: e.hex },
        { y: e.p.y + e.r * 0.6, rx: e.r * 0.5, rz: e.r * 0.5, cx: e.p.x, cz: e.p.z, hex: e.hex },
      ];
      stack(bands, 6, { capTop: { hex: e.hex }, capBot: { hex: e.hex } });
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
