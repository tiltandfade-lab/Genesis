/* dev/model-qa/creatures/rlm-suburb-death-knight.js — the DEATH KNIGHT landmark table (HUMANOID +
   FULL-PLATE family, Huge, CR 16, realm suburb), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000
   tri band (2026-07-08 foundry pilot, suburb-w1 cell 11). Core identity: the eternal dismissal bell
   that never released its final class — the damned paladin, hell-plate, flame eyes, flaming
   greatsword. Huge scale over the gloom knight's Medium chassis: heavier ornate spiked plate, a
   horned great-helm with living flame in the vision slit, and a greatsword that trails fire.

   FEATURE CHECKLIST (the ~1,700-2,100 budget buys; OVER-BAND REASON: Huge CR16 boss — the header
   asks for >2000 when justified; this authors toward the top of band first and only spends past it
   if the r1 render proves the silhouette needs it):
     1. HUMANOID full-plate torso per ANATOMY-CANON (chief criterion) — a complete breastplate loft
        heavier/ornate-r than the gloom knight: wider flared spiked pauldrons, a longer articulated
        fauld skirt, raised sculpted ribbing down the chest. Never a thin surcoat-over-mail read.
     2. HORNED GREAT-HELM — a complete closed ovoid helm, two swept-back horns rising off the brow,
        a single glowing horizontal vision SLIT across the front lit from FLAME (not the gloom
        knight's dim cold ember) — the "flame eyes" signature-adjacent tell, hot orange-white core.
     3. SIGNATURE — a huge GREATSWORD swept back two-handed, trailing flame ticks off the blade edge
        (the judgment-advance carry, not planted). The single loudest silhouette break: a burning
        blade held high-and-back against near-black spiked plate — the high-value zone law 3 needs,
        sampled hot against the dark body so it never drowns.
     4. Near-black ornate hell-plate — darker/more spiked than the gloom knight's pitted steel, with
        hot ember-orange trim at pauldron spikes, helm horns, and fauld edges (the "damned paladin's
        once-holy gilding, now hellfire" tell). Value contrast law 3: body reads dark-on-void EXCEPT
        the blade, the horn-tips, the trim, and the helm slit.
     5. JUDGMENT-ADVANCE POSE — mid-stride, weight rolling onto the forward leg, torso torqued and
        counter-rotated against the swept-back blade, helm lowered and tipped toward the target — a
        spine gesture that carries hip->shoulder->skull as one forward-leaning C-curve, never an
        at-attention plant (law 5, POSE-ANATOMY law 1).
     6. Trailing flame ticks off the blade's leading edge (3-4 small hot blobs receding from the tip)
        — a cheap countable "still moving through the air" tell that sells the swept-back carry
        without spending budget on a particle system.

   POSE SENTENCE: the judgment advance — mid-stride with weight rolling onto the forward leg, the
   greatsword swept back two-handed over the trailing shoulder trailing flame ticks off its edge,
   helm lowered and tipped down toward the target, torso torqued forward-and-down against the
   counter-rotated blade — the half-second before the swing completes, not a guard stance.

   SPINE-GESTURE SENTENCE: hips roll forward onto the lead leg and twist toward the swing, the ribs
   counter-twist back with the blade, the chest keeps carrying forward, and the helm drops and leads
   past the shoulder line — one continuous forward-and-down C-curve from planted heel to lowered
   horn-tip, with the blade's backward sweep as the counterweight that keeps the whole figure from
   reading as a plumb-line mannequin.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['suburb-w1'], cell 11, fn buildDeathKnight). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDeathKnight(){
  /* ---------- PALETTE (VS desaturated suburb-hell register; near-black ornate spiked plate vs a
     hot flame blade/horn-tips/trim/slit — the value ladder law 3 needs, sampled hotter than the
     gloom knight's cold ember so "flame eyes" reads distinct from "dim vigil ember"). ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's plate ladder (0x4a423a/0x2e2822) sat too close
     to void and the greatsword's extreme up-and-back sweep (tip at y=2.78) blew the bbox out so far
     that the whole figure rendered as a tiny dark clump with a disconnected blade fragment floating
     above a huge empty gap — both a law-3 value failure and a silhouette failure. Lifted the whole
     plate ladder well clear of void and pulled the blade sweep in (see GRIP/TIP below) so the figure
     fills the frame like its w1 neighbors. */
  const P = {
    plate: 0x605648, plateDk: 0x423a2e, plateLt: 0x746a5a,      // near-black ornate hell-plate, lifted clear of void (R2)
    spike: 0x2e2822,                                             // darkest spike-tip accents
    trim: 0xc9642a, trimDk: 0x8a3d16, trimLt: 0xf0975a,          // hot ember-orange trim (hotter than gloom knight's bronze)
    blade: 0xd8955a, bladeHot: 0xffce7a, bladeCore: 0xfff0c8,    // flaming greatsword — orange steel to white-hot core
    bladeDk: 0x6e3618,
    hilt: 0x2c2118, wrap: 0x1c140e,
    flameTick: 0xff8a3c, flameTickDk: 0xb5471a,
    glow: 0xff7a2c, glowCore: 0xfff2c0,                          // living flame behind the vision slit
    slit: 0x1a0e08,
    disc: 0x241d18, discTop: 0x2e251d,
  };

  /* ---------- LANDMARKS — Huge scale (~1.6x the gloom knight's Medium chassis), forward-torqued
     judgment-advance lean: cz grows band-to-band carrying the torso forward and down, matching
     POSE-ANATOMY's spine-gesture rule (hip->shoulder->skull one C-curve). ---------- */
  const L = {
    hipY: 0.96, waistY: 1.12, ribY: 1.35, chestY: 1.56, shldY: 1.73, neckY: 1.81,
    jawY: 1.85, cheekY: 1.945, browY: 2.04, crownY: 2.12,
    hipHalf: 0.240, shoulderX: 0.408,
  };
  /* forward-and-down lean path — cz grows through the stack, then the head continues past it
     (the "helm drops and leads" spine-gesture close) */
  const cz = { hip: 0.03, waist: 0.075, rib: 0.140, chest: 0.205, shld: 0.250, neck: 0.270 };

  /* ===== GREATSWORD — swept back two-handed over the trailing (right) shoulder, blade angled
     up-and-back, trailing flame ticks off the leading edge. Authored FIRST per POSE-ANATOMY so the
     arms derive to the grip, not the other way around. ===== */
  /* R2 SELF-CORRECTION: r1's TIP (-0.42, 2.78, -0.86) swept so far up-and-back off the GRIP that it
     blew the bbox out (max.y 2.81) and read as a disconnected fragment over a huge dead gap — pulled
     the tip in to stay visually welded to the shoulder/helm silhouette instead of orbiting off it. */
  const GRIP = V(0.30, 1.90, -0.10);
  const POMMEL = V(0.37, 1.78, -0.24);
  const TIP = V(-0.14, 2.36, -0.56);
  const BLADE_DIR = new THREE.Vector3().subVectors(TIP, GRIP).normalize();
  {
    const up = V(0, 1, 0);
    const gu = new THREE.Vector3().crossVectors(up, BLADE_DIR).normalize();
    const gv = new THREE.Vector3().crossVectors(BLADE_DIR, gu).normalize();
    const bl = (t, w, th) => {
      const c = GRIP.clone().addScaledVector(BLADE_DIR, t);
      return [c.clone().addScaledVector(gu, w), c.clone().addScaledVector(gv, th),
              c.clone().addScaledVector(gu, -w), c.clone().addScaledVector(gv, -th)];
    };
    const s0 = bl(0.00, 0.014, 0.010);
    const s1 = bl(0.30, 0.068, 0.026);
    const s2 = bl(0.62, 0.078, 0.030);
    const s3 = bl(0.92, 0.052, 0.020);   // narrows toward the tip, but still well past the 0.04u floor
    stitch([s0, s1, s2, s3], (b) => b < 2 ? P.bladeDk : P.blade);
    /* hot core groove down the flat — the "living flame within the steel" tell */
    quad(bl(0.20, 0.014, 0.028)[1], bl(0.85, 0.010, 0.022)[1],
         bl(0.85, -0.010, 0.022)[1], bl(0.20, -0.014, 0.028)[1], P.bladeHot, 0.03);
    capFan(s3, TIP.clone().addScaledVector(BLADE_DIR, 0.05), P.bladeCore);
    /* trailing flame ticks — 4 small hot blobs receding off the blade's leading edge, the "still
       moving through the air" tell (feature 6) */
    for(let i = 0; i < 4; i++){
      const t = 0.35 + i * 0.16;
      const c = GRIP.clone().addScaledVector(BLADE_DIR, t).addScaledVector(gv, 0.045 + i * 0.01);
      const back = c.clone().addScaledVector(BLADE_DIR, -0.10 - i * 0.02);
      blob(back.x, back.y, back.z, 0.026 - i * 0.004, 0.030 - i * 0.004, 0.022 - i * 0.003,
           i % 2 === 0 ? P.flameTick : P.flameTickDk, 5, 3);
    }
  }
  {
    /* crossguard — squared, hot-trim bar poking past the blade width */
    const up = V(0, 1, 0);
    const gu = new THREE.Vector3().crossVectors(up, BLADE_DIR).normalize();
    quad(GRIP.clone().addScaledVector(gu, 0.135), GRIP.clone().addScaledVector(gu, -0.135),
         GRIP.clone().addScaledVector(gu, -0.135).addScaledVector(BLADE_DIR, -0.032),
         GRIP.clone().addScaledVector(gu, 0.135).addScaledVector(BLADE_DIR, -0.032), P.trim, 0.03);
    /* grip — dark leather-wrapped, running from the crossguard down to the pommel */
    tube(GRIP.clone().addScaledVector(BLADE_DIR, -0.032), POMMEL.clone(), 0.036, 0.032, 8, P.wrap);
    tube(POMMEL.clone(), POMMEL.clone().addScaledVector(BLADE_DIR, -0.05), 0.032, 0.016, 8, P.trim, { capB: { hex: P.trimDk } });
  }

  /* ===== TORSO — full-plate breastplate loft, heavier/more ornate than the gloom knight: wider
     bands, raised chest ribbing. Torqued forward-and-down into the judgment-advance lean. ===== */
  stack([
    { y: L.hipY,   rx: 0.300, rz: 0.250, cz: cz.hip,   hex: P.plateDk },
    { y: L.waistY, rx: 0.278, rz: 0.235, cz: cz.waist, hex: P.plate },
    { y: L.ribY,   rx: 0.315, rz: 0.250, cz: cz.rib,   hex: P.plate },
    { y: L.chestY, rx: 0.358, rz: 0.268, cz: cz.chest, hex: P.plateLt },
    { y: L.shldY,  rx: 0.398, rz: 0.258, cz: cz.shld,  hex: P.plate },
    { y: L.neckY,  rx: 0.140, rz: 0.132, cz: cz.neck,  hex: P.plateDk },
  ], 8, {});

  /* raised chest ribbing — 3 vertical sculpted lines down the breastplate, hot-trim, the "ornate"
     tell law 4/6 need without spending a body-budget shape */
  {
    for(const sx of [-0.10, 0, 0.10]){
      const a = V(sx, L.ribY - 0.02, cz.rib + 0.245);
      const b = V(sx, L.chestY + 0.03, cz.chest + 0.263);
      tube(a, b, 0.016, 0.013, 3, P.trimDk);
    }
  }

  /* fauld — overlapping plate-lame skirt, longer/heavier than the gloom knight's, hip down toward
     mid-thigh, full coverage */
  {
    const bands = [
      { y: L.hipY - 0.03, rx: 0.320, rz: 0.265, cz: cz.hip * 0.9, hex: P.plateDk },
      { y: 0.72, rx: 0.345, rz: 0.282, cz: cz.hip * 0.6, hex: P.plate },
      { y: 0.52, rx: 0.360, rz: 0.290, cz: cz.hip * 0.4, hex: P.plateDk },
    ];
    stack(bands, 8, {});
    for(const yy of [0.62, 0.82]){
      const rr = ring(V(0, yy, cz.hip * 0.5), V(0, 1, 0), 0.352, 0.286, 8, Math.PI / 8);
      for(let i = 0; i < 8; i += 2){
        const i2 = (i + 1) % 8;
        quad(rr[i], rr[i2], rr[i2].clone().add(V(0, -0.018, 0)), rr[i].clone().add(V(0, -0.018, 0)), P.plateDk, 0.03);
      }
    }
  }

  /* trim rim — hot ember-orange band at the shoulder line */
  {
    const r1 = ring(V(0, L.shldY - 0.02, cz.shld), V(0, 1, 0), 0.400, 0.260, 8, Math.PI / 8);
    const r2 = ring(V(0, L.shldY + 0.01, cz.shld), V(0, 1, 0), 0.394, 0.254, 8, Math.PI / 8);
    stitch([r1, r2], () => P.trim);
  }

  /* pauldrons — wide flared SPIKED plate domes, heavier than the gloom knight's plain pair, with a
     spike pyramid rising off each */
  for(const s of [-1, 1]){
    const pivot = V(s * L.shoulderX, L.shldY + 0.05, 0.03 + cz.shld);
    const tilt = (p) => { const q = p.clone().sub(pivot); q.applyAxisAngle(V(0, 0, 1), -s * 0.32); return q.add(pivot); };
    stack([
      { y: L.shldY - 0.05, rx: 0.205, rz: 0.212, cx: pivot.x, cz: pivot.z, hex: P.plateDk },
      { y: L.shldY + 0.10, rx: 0.158, rz: 0.166, cx: pivot.x, cz: pivot.z, hex: P.plate },
    ], 8, { xform: tilt, capTop: { hex: P.plateLt, lift: 0.045 } });
    /* spike — a real 3D pyramid off the pauldron crown (cross-family rule 3: needs actual volume) */
    const spBase = tilt(V(pivot.x, L.shldY + 0.15, pivot.z));
    const spTip = tilt(V(pivot.x + s * 0.02, L.shldY + 0.34, pivot.z - 0.02));
    tube(spBase, spTip, 0.052, 0.006, 5, P.spike, { capB: { hex: P.trim } });
  }

  /* ===== HEAD — HORNED GREAT-HELM, complete ovoid, no face gap, horns sweeping back off the brow,
     bowed forward/down further than the shoulders (the judgment-advance close: "helm drops and
     leads past the shoulder line" from the spine-gesture sentence). ===== */
  const headCz = cz.neck + 0.075;
  const neckPivot = V(0, L.neckY + 0.02, cz.neck);
  const bow = (p) => { const q = p.clone().sub(neckPivot); q.applyAxisAngle(V(1, 0, 0), 0.46); return q.add(neckPivot); };
  const head = stack([
    { y: L.jawY,   rx: 0.140, rz: 0.138, cz: headCz - 0.008, hex: P.plate },
    { y: L.cheekY, rx: 0.156, rz: 0.154, cz: headCz,         hex: P.plateLt },
    { y: L.browY,  rx: 0.148, rz: 0.142, cz: headCz + 0.012, hex: P.plate },
    { y: L.crownY, rx: 0.116, rz: 0.110, cz: headCz - 0.008, hex: P.plateDk },
  ], 8, { xform: bow, capTop: { hex: P.plateDk, lift: 0.028 } });

  /* the vision slit — hot LIVING FLAME (not the gloom knight's dim cold ember): a bright orange
     band with a white-hot core pinprick, the signature-adjacent "flame eyes" tell. */
  {
    const ez = headCz + 0.140;
    quad(bow(V(-0.100, L.browY - 0.014, ez)), bow(V(0.100, L.browY - 0.014, ez)),
         bow(V(0.094, L.browY - 0.044, ez - 0.003)), bow(V(-0.094, L.browY - 0.044, ez - 0.003)), P.slit, 0.02);
    for(const s of [-1, 1]){
      const g = bow(V(s * 0.046, L.browY - 0.028, ez - 0.014));
      blob(g.x, g.y, g.z, 0.020, 0.014, 0.012, P.glow, 5, 3);
      blob(g.x, g.y + 0.003, g.z + 0.010, 0.008, 0.006, 0.006, P.glowCore, 4, 2);
    }
  }

  /* helm brow trim — hot ember-orange band, matching the shoulder rim */
  {
    const c = bow(V(0, L.browY + 0.016, headCz + 0.012));
    const c2 = bow(V(0, L.browY + 0.034, headCz + 0.012));
    const r1 = ring(c, V(0, 1, 0), 0.150, 0.144, 8, Math.PI / 8).map(bow);
    const r2 = ring(c2, V(0, 1, 0), 0.144, 0.138, 8, Math.PI / 8).map(bow);
    stitch([r1, r2], () => P.trim);
  }

  /* HORNS — two swept-back horns off the brow, real tapered volume, hot ember tips. The signature-
     adjacent read that separates this from the gloom knight's bare helm. */
  for(const s of [-1, 1]){
    const root = bow(V(s * 0.088, L.browY + 0.030, headCz + 0.010));
    const mid = bow(V(s * 0.150, L.browY + 0.115, headCz - 0.075));
    const tip = bow(V(s * 0.190, L.browY + 0.175, headCz - 0.175));
    tube(root, mid, 0.034, 0.020, 5, P.plateDk);
    tube(mid, tip, 0.020, 0.005, 5, P.trimDk, { capB: { hex: P.trim } });
  }

  /* helm ridge — a low center crest running crown-to-brow */
  {
    const a = bow(V(0, L.crownY + 0.028, headCz - 0.014));
    const b = bow(V(0, L.browY + 0.046, headCz + 0.118));
    tube(a, b, 0.020, 0.014, 4, P.trimDk, { raz: 0.014, rbz: 0.010 });
  }

  /* ===== ARMS — RIGHT arm swept back gripping the pommel, elbow bent per POSE-ANATOMY (100-150deg,
     never dead-straight); LEFT arm counter-swings forward, shoulder rides with the swing per law 3.
     Shoulder-elbow-wrist reads as a clear arc, not a mannequin bolt-on. ===== */
  {
    const shR = V(L.shoulderX + 0.02, L.shldY + 0.02, 0.06 + cz.shld);
    const elR = V(0.42, 1.72, -0.20);       // real elbow bend off the shoulder->grip line
    const wrR = POMMEL.clone();
    tube(shR, elR, 0.118, 0.094, 6, P.plate);
    tube(elR, wrR, 0.092, 0.072, 6, P.plateDk);
    blob(wrR.x, wrR.y, wrR.z, 0.056, 0.048, 0.052, P.plateDk, 6, 4);
    for(const d of [[-0.5, -0.3, 0.7], [-0.1, -0.5, 0.8], [0.3, -0.45, 0.75], [0.6, -0.2, 0.55]]){
      const n = Math.hypot(d[0], d[1], d[2]);
      const tip = V(wrR.x + d[0] / n * 0.075, wrR.y + d[1] / n * 0.075, wrR.z + d[2] / n * 0.075);
      tube(wrR, tip, 0.024, 0.013, 3, P.plateDk, { capB: { hex: P.plateDk } });
    }

    /* LEFT arm — grips the wrap just below the crossguard, elbow bent forward, shoulder rides up
       with the swing (POSE-ANATOMY law 3: an overhead/across-body arm drags its shoulder). */
    const shL = V(-L.shoulderX - 0.01, L.shldY + 0.04, 0.09 + cz.shld);
    const elL = V(0.02, 1.94, -0.02);
    const wrL = GRIP.clone().addScaledVector(BLADE_DIR, -0.018);
    tube(shL, elL, 0.116, 0.090, 6, P.plate);
    tube(elL, wrL, 0.088, 0.068, 6, P.plateDk);
    blob(wrL.x, wrL.y, wrL.z, 0.054, 0.046, 0.050, P.plateDk, 6, 4);
    for(const d of [[-0.5, -0.35, 0.6], [-0.1, -0.5, 0.76], [0.3, -0.45, 0.72], [0.55, -0.22, 0.5]]){
      const n = Math.hypot(d[0], d[1], d[2]);
      const tip = V(wrL.x + d[0] / n * 0.072, wrL.y + d[1] / n * 0.072, wrL.z + d[2] / n * 0.072);
      tube(wrL, tip, 0.023, 0.012, 3, P.plateDk, { capB: { hex: P.plateDk } });
    }
  }

  /* ===== LEGS — the judgment-advance mid-stride, weight rolling onto the forward leg, knee bent
     100-150deg (POSE-ANATOMY law 2), never a squared at-attention stand. Full plate to sabatons. ===== */
  {
    const hipF = V(0.115, L.hipY - 0.04, cz.hip + 0.13);   // front (weight-bearing) leg
    const kneeF = V(0.155, 0.500, cz.hip + 0.38);
    const ankF = V(0.145, 0.115, cz.hip + 0.42);
    const hipB = V(-0.115, L.hipY - 0.03, cz.hip - 0.10);  // back (trailing/push-off) leg
    const kneeB = V(-0.170, 0.470, cz.hip - 0.34);
    const ankB = V(-0.160, 0.110, cz.hip - 0.40);
    for(const [hip, knee, ank] of [[hipF, kneeF, ankF], [hipB, kneeB, ankB]]){
      tube(hip, knee, 0.152, 0.112, 6, P.plate);
      blob(knee.x, knee.y, knee.z, 0.096, 0.084, 0.092, P.plateDk, 6, 4);
      tube(knee, ank, 0.105, 0.078, 6, P.plateDk);
    }
    /* sabatons — armored boots, toe ring flattened so bbox min.y never dips below 0 */
    for(const [ank, toeLen] of [[ankF, 0.230], [ankB, 0.175]]){
      const heel = V(ank.x, 0.080, ank.z - 0.045);
      const toe = V(ank.x, 0.045, ank.z + toeLen);
      tube(heel, toe, 0.096, 0.040, 6, P.plateDk, { raz: 0.080, rbz: 0.028, capB: { hex: P.plateDk, lift: 0.012 } });
    }
  }

  /* base disc (Huge: r=0.85 — this figure's own stride/blade-sweep extent needs a wider disc than
     the parts.js buildBase() Medium default of 0.42) */
  {
    const P2 = { disc: P.disc, discTop: P.discTop };
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.85, 0.85, 18);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.82, 0.82, 18);
    stitch([r1, r2], () => P2.disc);
    capFan(r2, V(0, 0.060, 0), P2.discTop);
  }
}
