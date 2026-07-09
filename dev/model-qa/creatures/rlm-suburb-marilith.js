/* dev/model-qa/creatures/rlm-suburb-marilith.js — the MARILITH landmark table (SERPENTINE lower +
   HUMANOID torso, SIX-ARMED, family, Large, CR 11, realm suburb), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot, suburb-w1 cell 7).
   Bestiary tie: "The Perfect Family, Fully Grown" — the skin-family horror that stopped
   pretending to be separate people. Core identity: a six-armed serpent demoness, the yuan-ti
   abomission pattern (ANATOMY-CANON's SERPENTINE+humanoid naga splice) escalated to six blades —
   three faces fused into one thing wearing every hand it ever had.

   FEATURE CHECKLIST (the ~1,700-2,000 budget buys):
     1. SERPENTINE coiled lower body per ANATOMY-CANON — one continuous tapered D-cross-section
        tube, pre-coiled (2-3 stacked loops, inner loop tucked UNDER the outer), braced against
        the ground rather than resting, near-constant girth front two-thirds then a late taper to
        a fine tail tip. Large size, base disc r=0.58.
     2. HUMANOID torso rising and TWISTING off the coil (the naga splice) — torqued hard at the
        waist so chest and hips face different directions, the spine gesture that drives the
        whole blade-fan pose.
     3. SIGNATURE — SIX arms, each gripping a blade, fanned out at six different heights/angles
        around the torso (never a symmetric snowflake) — the steel peacock. Two arms raised high,
        two spread level, two crossed low — a fan of lit steel against the dark-scale body, the
        chief high-value zone law 3 needs.
     4. Green-gold scale palette on the coil/torso, pale-gold belly ladder climbing the coil's
        underside onto the torso — the value spine.
     5. Head twisted to look back over one shoulder, jaw slightly open — a watching/hunting
        expression, not a level forward stare (law 5).
     6. Three faint overlapping brow-ridges pressed into the single head (a cheap countable tell
        for "three faces fused into one" without a body-budget spend — echoes the bestiary flavor
        without a literal three-headed rebuild).

   POSE SENTENCE: the blade-fan — coil braced wide against the ground, torso twisted hard at the
   waist, head turned back over one shoulder, all six arms fanned at six different heights around
   the body, each gripping a blade angled outward, never a resting coil or a symmetric idle stance
   — the instant before it closes the fan.

   SPINE-GESTURE SENTENCE: pelvis plants over the coil's front-high point and torques left through
   the waist and ribs, the ribcage counter-twisting right, the neck untwisting back left again to
   throw the head over the shoulder — one continuous S-torque from coil to skull, never a plumb
   vertical column.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['suburb-w1'], cell 7, fn buildMarilith). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one arm: shoulder -> elbow -> wrist gripping a flat blade angled along `bladeDir`. Elbow always
   bends (POSE-ANATOMY law 2) — never a straight shoulder-to-tip line. */
function armBlade(sh, el, wr, bladeDir, bladeLen, armHex, armHexDk, gripHex, bladeHex, bladeHexLt){
  tube(sh, el, 0.058, 0.046, 6, armHex);
  tube(el, wr, 0.044, 0.032, 6, armHexDk);
  tube(wr, wr.clone().addScaledVector(bladeDir, 0.05), 0.030, 0.026, 6, gripHex);
  const bd = norm([bladeDir.x, bladeDir.y, bladeDir.z]);
  const up = Math.abs(bd.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
  const gu = new THREE.Vector3().crossVectors(up, bd).normalize();
  const base = wr.clone().addScaledVector(bd, 0.07);
  const tip = wr.clone().addScaledVector(bd, 0.07 + bladeLen);
  const bl = (t, w) => {
    const c = base.clone().lerp(tip, t);
    return [c.clone().addScaledVector(gu, w), c.clone().addScaledVector(gu, -w)];
  };
  const s0 = bl(0.00, 0.030);
  const s1 = bl(0.55, 0.038);
  const s2 = bl(1.00, 0.006);
  /* flat two-sided blade — thin quad strip widened mid-blade then tapered to a point */
  quad(s0[0], s0[1], s1[1], s1[0], bladeHexLt, 0.04);
  quad(s1[0], s1[1], s2[1], s2[0], bladeHex, 0.04);
  /* backside for readability from any angle */
  quad(s0[1], s0[0], s1[0], s1[1], bladeHex, 0.04);
  quad(s1[1], s1[0], s2[0], s2[1], bladeHexLt, 0.04);
}

export function buildMarilith(){
  /* ---------- PALETTE (suburb green-gold register; dark-green scale body vs. a pale-gold belly
     ladder + lit-steel blades — the high-value zones law 3 needs). ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's coil/torso mass read as one uniform dark
     green robe-blob at 1/3-res — the belly ladder patches were too small/sparse to separate from
     the body, and the coil's own girth against the torso didn't read as "coiled." Lifted the
     scale ladder off void (matches the yuan-ti-abomination R2 fix) and enlarged/brightened the
     belly patches so the value spine actually survives dither. */
  const P = {
    scale: 0x4c7040, scaleDk: 0x32482a, scaleLt: 0x628c50,     // green-gold coil/torso scale, lifted
    belly: 0xe8dc94, bellyDk: 0xc0b06a,                        // pale-gold belly ladder — the value spine, brighter
    torso: 0x466a3a, torsoLt: 0x5c8a4a,                        // humanoid torso panels, gold-green
    skin: 0xc4b888, skinDk: 0x968a5c,                          // arm flesh, warmer gold than scale
    faceDk: 0x3a4e2e,                                          // brow-ridge shadow (three-face tell)
    mouth: 0x1c1512, tongue: 0x8a2f2f,
    eye: 0x120e0c, eyeGlow: 0xc8d468,
    grip: 0x2c2418, wrap: 0x1c160e,
    blade: 0xb0b8bc, bladeLt: 0xe8ecee, bladeDk: 0x707880,     // lit steel — the signature payload
    disc: 0x2a2a20, discTop: 0x343428,
  };

  /* ===== COIL — double loop braced wide against the ground (not resting), inner loop tucked
     under the outer, near-constant girth front two-thirds, late taper to a fine tail tip. ===== */
  const outerY = 0.22, innerY = 0.15;
  const outerPts = [
    V(0.46, outerY, 0.22), V(0.52, outerY + 0.02, -0.14), V(0.32, outerY + 0.03, -0.48),
    V(-0.08, outerY + 0.02, -0.52), V(-0.44, outerY, -0.24), V(-0.48, outerY - 0.02, 0.12),
  ];
  const outerRad = [0.205, 0.215, 0.205, 0.185, 0.158, 0.130];
  const innerPts = [
    V(-0.48, innerY, 0.12), V(-0.20, innerY - 0.01, 0.40), V(0.18, innerY, 0.44),
    V(0.42, innerY + 0.01, 0.26),
  ];
  const innerRad = [0.130, 0.104, 0.078, 0.052];
  for(let i = 0; i < outerPts.length - 1; i++){
    const hex = (i % 2 === 0) ? P.scale : P.scaleDk;
    tube(outerPts[i], outerPts[i + 1], outerRad[i], outerRad[i + 1], 9, hex, { phase: Math.PI / 9 });
  }
  for(let i = 0; i < innerPts.length - 1; i++){
    const hex = (i % 2 === 0) ? P.scaleDk : P.scale;
    tube(innerPts[i], innerPts[i + 1], innerRad[i], innerRad[i + 1], 8, hex, { phase: Math.PI / 8 });
  }
  tube(innerPts.at(-1), V(0.60, innerY + 0.03, 0.08), innerRad.at(-1), 0.017, 6, P.scaleDk, { capB: { hex: P.scaleDk } });

  /* belly ladder — pushed OUT along the coil's own surface normal (the proven fix from the
     yuan-ti abomination) so it sits proud of the surface instead of buried inside the tube. */
  const beltPatch = (c, r, hex) => {
    const p = V(c.x, c.y + r * 0.35, c.z + r * 0.95);
    const w = r * 1.05, h = r * 1.1;
    quad(V(p.x - w, p.y - h * 0.4, p.z), V(p.x + w, p.y - h * 0.4, p.z),
         V(p.x + w * 0.7, p.y + h * 0.6, p.z + r * 0.15), V(p.x - w * 0.7, p.y + h * 0.6, p.z + r * 0.15), hex, 0.04);
  };
  for(let i = 0; i < outerPts.length; i++) beltPatch(outerPts[i], outerRad[i], (i % 2 === 0) ? P.belly : P.bellyDk);
  for(let i = 0; i < innerPts.length; i++) beltPatch(innerPts[i], innerRad[i], (i % 2 === 0) ? P.bellyDk : P.belly);

  /* ===== RISE — the serpent tube widens and climbs from the coil's front-high point up to the
     humanoid splice, torqued left so the S-torque begins here (spine-gesture law). ===== */
  const rise = {
    root: V(0.16, outerY + 0.06, 0.16),
    r1: V(0.20, 0.42, 0.06),
    r2: V(0.14, 0.72, -0.06),
    splice: V(0.06, 1.00, -0.10),
  };
  tube(rise.root, rise.r1, 0.195, 0.182, 10, P.scale, { phase: Math.PI / 10 });
  tube(rise.r1, rise.r2, 0.182, 0.165, 10, P.scaleDk, { phase: Math.PI / 10 });
  tube(rise.r2, rise.splice, 0.165, 0.152, 10, P.scale, { phase: Math.PI / 10 });
  beltPatch(rise.root, 0.195, P.belly);
  beltPatch(rise.r1, 0.182, P.bellyDk);
  beltPatch(rise.r2, 0.165, P.belly);

  /* ===== TORSO — humanoid, torqued hard at the waist (S-torque continues: waist twists left,
     ribs counter-twist right, shoulders/neck untwist back left toward the turned head). ===== */
  const L = {
    waistY: 1.00, backY: 1.12, ribY: 1.24, chestY: 1.36, shldY: 1.48, neckY: 1.56,
    jawY: 1.605, cheekY: 1.65, browY: 1.695, crownY: 1.735,
  };
  /* cx/cz carry the torque: waist twists toward +x/-z, ribs counter toward -x/+z, shoulders
     settle back near center with a slight lean, neck resumes the leftward turn toward the head. */
  const spine = {
    waist: { cx: 0.03, cz: -0.02 },
    back:  { cx: 0.05, cz: -0.06 },
    rib:   { cx: 0.02, cz: -0.10 },
    chest: { cx: -0.03, cz: -0.08 },
    shld:  { cx: -0.02, cz: -0.02 },
    neck:  { cx: 0.02, cz: 0.03 },
  };
  const torso = stack([
    { y: L.waistY, rx: 0.160, rz: 0.140, cx: spine.waist.cx, cz: spine.waist.cz, hex: P.torso },
    { y: L.backY,  rx: 0.176, rz: 0.152, cx: spine.back.cx,  cz: spine.back.cz,  hex: P.torsoLt },
    { y: L.ribY,   rx: 0.188, rz: 0.162, cx: spine.rib.cx,   cz: spine.rib.cz,   hex: P.torso },
    { y: L.chestY, rx: 0.198, rz: 0.168, cx: spine.chest.cx, cz: spine.chest.cz, hex: P.torsoLt },
    { y: L.shldY,  rx: 0.212, rz: 0.155, cx: spine.shld.cx,  cz: spine.shld.cz,  hex: P.torso },
    { y: L.neckY,  rx: 0.068, rz: 0.064, cx: spine.neck.cx,  cz: spine.neck.cz,  hex: P.skinDk },
  ], 10, {});

  {
    const rungs = [
      [L.waistY, spine.waist.cx, 0.140], [L.ribY, spine.rib.cx, 0.162], [L.chestY, spine.chest.cx, 0.168],
    ];
    for(const [y, cx, rz] of rungs){
      const w = rz * 0.55, z = rz * 0.88;
      quad(V(cx - w, y - 0.05, z), V(cx + w, y - 0.05, z),
           V(cx + w * 0.7, y + 0.06, z + 0.02), V(cx - w * 0.7, y + 0.06, z + 0.02), P.belly, 0.04);
    }
  }

  /* ===== HEAD — twisted back over one shoulder (opposite the waist torque, completing the
     S-torque up to the skull), jaw slightly open, watching-not-idle. Three faint overlapping
     brow-ridges = the fused-faces tell. ===== */
  const headTurn = { cx: -0.09, czBase: spine.neck.cz };
  const head = stack([
    { y: L.jawY,   rx: 0.086, rz: 0.096, cx: headTurn.cx - 0.02, cz: headTurn.czBase + 0.09,  hex: P.skin },
    { y: L.cheekY, rx: 0.098, rz: 0.108, cx: headTurn.cx - 0.03, cz: headTurn.czBase + 0.05,  hex: P.skin },
    { y: L.browY,  rx: 0.090, rz: 0.098, cx: headTurn.cx - 0.05, cz: headTurn.czBase - 0.02,  hex: P.skinDk },
    { y: L.crownY, rx: 0.068, rz: 0.072, cx: headTurn.cx - 0.06, cz: headTurn.czBase - 0.09,  hex: P.scaleDk },
  ], 8, { capTop: { hex: P.scaleDk, lift: 0.016 } });

  /* three faint brow-ridge tells — small overlapping dark arcs pressed just above the eyes */
  for(const off of [-0.024, 0, 0.024]){
    const bx = headTurn.cx - 0.05 + off, by = L.browY + 0.014, bz = headTurn.czBase - 0.01;
    blob(bx, by, bz, 0.020, 0.010, 0.010, P.faceDk, 5, 3);
  }

  /* jaw — slightly open, dark wedge under the chin, tongue sliver */
  {
    const throatY = L.jawY - 0.015, tz = headTurn.czBase + 0.08, tx = headTurn.cx - 0.02;
    quad(V(tx - 0.028, throatY, tz), V(tx + 0.028, throatY, tz),
         V(tx + 0.020, throatY - 0.035, tz - 0.02), V(tx - 0.020, throatY - 0.035, tz - 0.02), P.mouth, 0.03);
    tube(V(tx, throatY - 0.005, tz), V(tx, throatY - 0.03, tz + 0.02), 0.009, 0.004, 4, P.tongue, { capB: { hex: P.tongue } });
  }

  /* eyes — watching, aimed back over the shoulder toward the turn direction */
  for(const s of [-1, 1]){
    const ex = headTurn.cx - 0.05 + s * 0.034, ey = L.browY + 0.008, ez = headTurn.czBase - 0.005;
    blob(ex, ey, ez, 0.017, 0.014, 0.012, P.eye, 5, 3);
    blob(ex, ey + 0.004, ez + 0.008, 0.006, 0.006, 0.006, P.eyeGlow, 4, 2);
  }

  /* ===== SIGNATURE — SIX arms, each gripping a blade, fanned at six different heights/angles
     around the torso (asymmetric, never a snowflake): two raised high, two spread level, two
     crossed low. Every elbow bends (POSE-ANATOMY law 2). ===== */
  {
    const shR = V(0.205, L.shldY - 0.01, spine.shld.cz + 0.05);
    const shL = V(-0.19, L.shldY - 0.03, spine.shld.cz + 0.02);

    /* raised-high right — highest point of the whole model */
    armBlade(
      V(shR.x, shR.y, shR.z),
      V(0.42, 1.82, -0.04), V(0.40, 2.06, -0.22),
      norm([0.30, 0.62, -0.72]), 0.42,
      P.torso, P.skinDk, P.grip, P.blade, P.bladeLt
    );
    /* raised-high left, offset height so it's not a mirror-symmetric pair */
    armBlade(
      V(shL.x, shL.y, shL.z),
      V(-0.46, 1.68, 0.06), V(-0.50, 1.94, -0.10),
      norm([-0.34, 0.70, -0.62]), 0.40,
      P.torso, P.skinDk, P.grip, P.blade, P.bladeLt
    );
    /* level-spread right */
    armBlade(
      V(shR.x + 0.02, shR.y - 0.20, shR.z + 0.05),
      V(0.62, 1.36, 0.16), V(0.86, 1.30, 0.24),
      norm([0.92, -0.06, 0.38]), 0.44,
      P.torso, P.skinDk, P.grip, P.blade, P.bladeLt
    );
    /* level-spread left, angled slightly down so it's not a mirror pair */
    armBlade(
      V(shL.x - 0.02, shL.y - 0.24, shL.z + 0.03),
      V(-0.64, 1.22, 0.22), V(-0.88, 1.10, 0.34),
      norm([-0.90, -0.22, 0.38]), 0.40,
      P.torso, P.skinDk, P.grip, P.blade, P.bladeLt
    );
    /* crossed-low right — reaches across the body toward the left hip */
    armBlade(
      V(shR.x - 0.03, shR.y - 0.34, shR.z + 0.02),
      V(0.16, 0.94, 0.30), V(-0.20, 0.80, 0.40),
      norm([-0.62, -0.18, 0.76]), 0.36,
      P.torso, P.skinDk, P.grip, P.blade, P.bladeLt
    );
    /* crossed-low left — reaches across the body toward the right hip, different depth than its
       mirror so the fan reads asymmetric */
    armBlade(
      V(shL.x + 0.03, shL.y - 0.30, shL.z),
      V(-0.10, 0.86, 0.36), V(0.26, 0.68, 0.48),
      norm([0.66, -0.30, 0.68]), 0.34,
      P.torso, P.skinDk, P.grip, P.blade, P.bladeLt
    );
  }

  /* base disc (Large: r=0.58; the coil's own extent needs the wider Large disc) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.58, 0.58, 18);
    const r2 = ring(V(0, 0.050, 0), V(0, 1, 0), 0.56, 0.56, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.053, 0), P.discTop);
  }
}
