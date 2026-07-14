/* dev/model-qa/creatures/rlm-frontier-skeleton-archer.js — the BOOTHILL SKELETON landmark table
   (HUMANOID skeletal-undead family, Medium, CR 1/2, realm frontier), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, frontier-w1 cell 3). Core identity
   of the render key "skeleton-archer": the RANGED skeleton — a soldier's drilled bone frame
   aiming a long-arm, not a melee lunge. The frontier reskin (rifle instead of bow, rotted duster)
   rides this chassis per the Boothill Skeleton bestiary entry (data/realm-bestiary.js).

   FEATURE CHECKLIST (the ~1,400-1,700 budget buys):
     1. HUMANOID skeletal chassis per ANATOMY-CANON — pale bone torso/pelvis wrapping a dark
        hollow core, oversized skull with two big dark sunk eye sockets, knobbed joints at every
        shoulder/elbow/wrist/hip/knee/ankle so limbs read as articulated bone, not smooth tubes.
     2. SIGNATURE — the AIMED long-arm (law 4's one loud exaggerated feature): a long rifle
        shouldered and leveled, cheek dropped to the stock, both arms bent at real elbow angles
        (front hand gripping the fore-stock, rear hand at the trigger/butt) — the drilled
        cemetery firing-line stance, muscle memory outlasting the muscle.
     3. Rotted duster — a tattered long coat swept back off the shoulders by the wind, torn hem
        panels trailing behind the braced rear leg, breaking the bone silhouette with cloth mass.
     4. Steel barrel + receiver glint (the law-3 high-value zone) — near-white steel against the
        dark rifle wood and the desaturated bone, catching the eye along the aimed sightline.
     5. Braced firing stance (law 5) — front leg planted forward under the rifle, rear boot
        braced back with the heel lifted, weight driven forward into the shot; torso torqued
        slightly toward the rifle side so the spine still carries a gesture even in a held aim
        (not a flat mannequin square-on stance).
     6. Bone face/hands emphasis — pale ivory skull + gripping finger-bone stubs kept bright
        against the dark duster and hollow torso core so the "who's shooting" read survives
        1/3-res.

   POSE SENTENCE: braced on the cemetery firing line — front foot planted forward, rear boot
   braced back with the heel lifted, torso torqued a touch toward the rifle side, elbows bent,
   cheek dropped to the stock, rifle shouldered and leveled dead level at the target — the
   soldier's discipline outlasting the soldier, duster hem swept back by the wind off the aim.

   SPINE-GESTURE SENTENCE: pelvis set square to the stride, ribcage/shoulders torqued ~12° toward
   the rifle (right) side and tipped forward over the front leg, neck counter-rotating back to
   level the skull behind the sights — one continuous forward-leaning C-curve from the trailing
   heel through the hips, up the torqued spine, into the aiming skull.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w1'], cell 3, fn buildSkeletonArcher). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildSkeletonArcher(){
  /* ---------- PALETTE (weathered ivory bone vs. a near-black hollow/socket void, a rotted
     drab-brown duster, near-white steel on the rifle so the barrel/receiver carry the law-3
     high-value zone along the aim line). ---------- */
  const P = {
    bone: 0xccc2a6, boneDk: 0xa89d80, boneLt: 0xe0d6ba,
    hollow: 0x14100c, socket: 0x0d0a07,
    coat: 0x4a4032, coatDk: 0x322a20, coatLt: 0x5c5140,
    wood: 0x5a4630, woodDk: 0x3c2f1e,
    /* R3: retuned cooler + mid-value (was 0xd6d2c4 — too warm/bright to land in ps1-sheet.html's
       matBucket "steel" window (v 0.40-0.74, low sat, b>=r), so it rendered flat-Lambert-matte
       and capped ~130 RGB in-engine instead of catching the metal Phong specular. */
    steel: 0xa8acb4, steelDk: 0x767a82,
    disc: 0x3f362d, discTop: 0x4c4238,
  };

  /* ===== LANDMARKS — gaunt drilled-soldier frame, torqued toward the rifle (right) side. ===== */
  const L = {
    hipY: 0.72, pelvisY: 0.70, waistY: 0.82, rib0Y: 0.90, rib1Y: 0.98, rib2Y: 1.06, rib3Y: 1.14,
    shldY: 1.19, neckY: 1.225,
    jawBotY: 1.26, jawY: 1.29, cheekY: 1.365, browY: 1.44, crownY: 1.52, headTopY: 1.575,
    hipHalf: 0.10, shoulderX: 0.220,
  };
  /* torso torque + forward lean toward the rifle side — the spine-gesture curve */
  const torque = (p) => {
    const t = Math.max(0, (p.y - L.hipY) / (L.headTopY - L.hipY));
    return V(p.x + 0.028 * t, p.y, p.z + 0.05 * t);
  };

  /* ===== RIFLE FIRST — shouldered and leveled dead-level, held two-handed. Grip is ground
     truth; the arms derive from it (matches the mon-skeleton "sword first" idiom). ===== */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's rifle (radii 0.011-0.028) sampled as a
     near-invisible hairline tucked against the torso — it failed law 2 (doesn't change the
     silhouette) and law 3 (well under the 0.04u feature floor once dithered). Thickened every
     radius ~2x, lengthened + raised the barrel so it clears the skull line and juts clean off
     the right shoulder into open space instead of hugging the ribcage. Also enlarged + pulled
     the duster hem further from the body (was reading as a tiny brown smear) and eased the
     leg/pelvis stance so the brace reads as planted rather than a mid-run scissor. */
  const BUTT = V(0.190, 1.145, -0.20);
  const MUZZLE = V(0.150, 1.260, 0.78);
  const AXIS = new THREE.Vector3().subVectors(MUZZLE, BUTT).normalize();
  const FORE_GRIP = BUTT.clone().addScaledVector(AXIS, 0.42);   // front hand's hold point
  const TRIGGER_GRIP = BUTT.clone().addScaledVector(AXIS, 0.14); // rear hand's hold point
  {
    /* stock — dark wood, tapering butt-to-receiver, thickened for law-3 survival */
    tube(BUTT, BUTT.clone().addScaledVector(AXIS, 0.36), 0.048, 0.036, 6, P.wood, { capA: { hex: P.woodDk } });
    /* receiver block — the rank/mechanism read, a short thicker steel-dark waist */
    tube(BUTT.clone().addScaledVector(AXIS, 0.36), BUTT.clone().addScaledVector(AXIS, 0.48), 0.040, 0.036, 6, P.steelDk);
    /* barrel — long, near-white steel so it carries the value ladder down the sightline */
    tube(BUTT.clone().addScaledVector(AXIS, 0.48), MUZZLE, 0.033, 0.022, 6, P.steel, { capB: { hex: P.steel } });
    /* barrel glint — a bright sliver riding the top of the barrel. R3: r2's glint peaked at
       RGB134 in-engine (under the law-3 140 floor) — widened it and pushed near-white so it
       clears the floor with margin instead of sitting right on the line. */
    const bA = BUTT.clone().addScaledVector(AXIS, 0.52).add(V(0, 0.024, 0));
    const bB = MUZZLE.clone().add(V(0, 0.016, -0.02));
    quad(bA.clone().add(V(-0.016, 0, 0)), bA.clone().add(V(0.016, 0, 0)), bB.clone().add(V(0.011, 0, 0)), bB.clone().add(V(-0.011, 0, 0)), 0xb8bcc4, 0.05);
    /* fore-stock wood wrap under the front grip */
    tube(FORE_GRIP.clone().addScaledVector(AXIS, -0.06), FORE_GRIP.clone().addScaledVector(AXIS, 0.10), 0.038, 0.034, 6, P.wood);
  }

  /* ===== PELVIS BLOCK — squat bone loft, set square (the stride, not the torque). ===== */
  stack([
    { y: L.pelvisY - 0.02, rx: 0.145, rz: 0.105, hex: P.boneDk },
    { y: L.pelvisY + 0.05, rx: 0.130, rz: 0.096, hex: P.bone },
    { y: L.waistY - 0.02,  rx: 0.068, rz: 0.056, hex: P.bone },
  ], 7, { capBot: { hex: P.boneDk, lift: 0.01 } });

  /* ===== TORSO CORE — dark hollow the ribs wrap, torqued+leaned toward the rifle side. ===== */
  stack([
    { y: L.waistY, rx: 0.050, rz: 0.044, hex: P.hollow },
    { y: L.rib1Y,  rx: 0.056, rz: 0.048, hex: P.hollow },
    { y: L.rib3Y,  rx: 0.058, rz: 0.050, hex: P.hollow },
    { y: L.shldY,  rx: 0.064, rz: 0.054, hex: P.hollow },
  ], 7, { capTop: { hex: P.hollow, lift: 0.005 }, xform: torque });

  /* the spine — knobbed dark-bone column climbing the torqued curve into the aiming skull */
  {
    const seg = [
      [L.waistY, -0.028], [L.rib0Y, -0.032], [L.rib1Y, -0.034], [L.rib2Y, -0.036], [L.rib3Y, -0.038], [L.shldY, -0.038],
    ];
    let prev = null;
    for (const [y, z] of seg) {
      const p = torque(V(0, y, z));
      if (prev) tube(prev, p, 0.025, 0.023, 5, P.boneDk);
      blob(p.x, p.y, p.z, 0.026, 0.019, 0.024, P.bone, 6, 4);
      prev = p;
    }
  }

  /* ===== RIBCAGE — 4 pale band-loops open at the back, wrapping the torqued core. ===== */
  {
    const ribs = [
      { y: L.rib0Y, rx: 0.144, rz: 0.115 },
      { y: L.rib1Y, rx: 0.162, rz: 0.128 },
      { y: L.rib2Y, rx: 0.158, rz: 0.124 },
      { y: L.rib3Y, rx: 0.134, rz: 0.106 },
    ];
    for (const rb of ribs) {
      const c0 = torque(V(0, rb.y, 0.006));
      const c1 = torque(V(0, rb.y + 0.045, 0.006));
      const outer = ring(c0, V(0, 1, 0), rb.rx, rb.rz, 8, Math.PI / 8);
      const outer2 = ring(c1, V(0, 1, 0), rb.rx * 0.94, rb.rz * 0.94, 8, Math.PI / 8);
      for (const arr of [outer, outer2]) for (const i of [0, 5, 6, 7]) { arr[i].z *= 0.35; arr[i].x *= 0.78; }
      stitch([outer, outer2], () => P.bone);
      const inA = ring(V(c0.x, c0.y + 0.012, c0.z), V(0, 1, 0), rb.rx - 0.024, rb.rz - 0.024, 8, Math.PI / 8);
      const inB = ring(V(c1.x, c1.y - 0.012, c1.z), V(0, 1, 0), (rb.rx - 0.024) * 0.94, (rb.rz - 0.024) * 0.94, 8, Math.PI / 8);
      for (const arr of [inA, inB]) for (const i of [0, 5, 6, 7]) { arr[i].z *= 0.35; arr[i].x *= 0.78; }
      for (const i of [1, 2, 3, 4]) {
        const i2 = (i + 1) % 8;
        quad(outer2[i], outer2[i2], inB[i2], inB[i], P.boneDk, 0.05);
        quad(inA[i], inA[i2], outer[i2], outer[i], P.boneDk, 0.05);
      }
    }
    const sA = torque(V(0, L.rib0Y - 0.02, 0.128));
    const sB = torque(V(0, L.rib3Y, 0.142));
    tube(sA, sB, 0.024, 0.020, 5, P.boneLt);
  }

  /* ===== SKULL — pale, oversized, two big dark eye voids, jaw dropped a touch (drilled, not
     screaming) — carried by the torqued neck so the gaze still levels behind the sights. ===== */
  const headC = torque(V(0, 0, 0));
  {
    const n = 8, ph = Math.PI / n;
    const bands = [
      { y: L.jawBotY, rx: 0.056, rz: 0.066, hex: P.boneDk },
      { y: L.jawY,    rx: 0.074, rz: 0.086, hex: P.bone },
      { y: L.cheekY,  rx: 0.102, rz: 0.106, hex: P.bone },
      { y: L.browY,   rx: 0.112, rz: 0.108, hex: P.boneLt },
      { y: L.crownY,  rx: 0.096, rz: 0.094, hex: P.bone },
    ];
    const rings = bands.map(b => ring(V(headC.x, b.y, headC.z + 0.008), V(0, 1, 0), b.rx, b.rz, n, ph));
    for (let b = 0; b < rings.length - 1; b++) for (let i = 0; i < n; i++) {
      const i2 = (i + 1) % n;
      quad(rings[b][i], rings[b][i2], rings[b + 1][i2], rings[b + 1][i], bands[b].hex, 0.06);
    }
    capFan(rings[4], V(headC.x, L.headTopY, headC.z + 0.004), P.bone);

    /* two big dark eye voids, separated by a bone nose bridge, sighting down toward the rifle */
    const ey = L.cheekY + 0.026, ezOut = headC.z + 0.126, ezIn = headC.z + 0.038;
    for (const s of [-1, 1]) {
      const exI = headC.x + s * 0.028, exO = headC.x + s * 0.086, htop = 0.048, hbot = 0.046;
      const xa = Math.min(exI, exO), xb = Math.max(exI, exO);
      const rimTL = V(xa, ey + htop, ezOut), rimTR = V(xb, ey + htop, ezOut),
            rimBR = V(xb, ey - hbot, ezOut), rimBL = V(xa, ey - hbot, ezOut);
      const inx = 0.013;
      const flrTL = V(xa + inx, ey + htop * 0.6, ezIn), flrTR = V(xb - inx, ey + htop * 0.6, ezIn),
            flrBR = V(xb - inx, ey - hbot * 0.6, ezIn), flrBL = V(xa + inx, ey - hbot * 0.6, ezIn);
      quad(rimTL, rimTR, flrTR, flrTL, P.socket, 0.02);
      quad(rimBR, rimBL, flrBL, flrBR, P.socket, 0.02);
      quad(rimTR, rimBR, flrBR, flrTR, P.socket, 0.02);
      quad(rimBL, rimTL, flrTL, flrBL, P.socket, 0.02);
      quad(flrTL, flrTR, flrBR, flrBL, P.hollow, 0.0);
    }
    /* nasal cavity */
    const ny = L.cheekY;
    quad(V(headC.x - 0.015, ny + 0.01, headC.z + 0.120), V(headC.x + 0.015, ny + 0.01, headC.z + 0.120),
      V(headC.x + 0.009, ny - 0.048, headC.z + 0.078), V(headC.x - 0.009, ny - 0.048, headC.z + 0.078), P.socket, 0.02);

    /* jaw bar — a modest drop (drilled discipline, not a lunging scream) */
    const jawDrop = 0.026;
    const jl = V(headC.x - 0.048, L.jawBotY - jawDrop, headC.z + 0.048),
          jr = V(headC.x + 0.048, L.jawBotY - jawDrop, headC.z + 0.048),
          jf = V(headC.x, L.jawBotY - jawDrop - 0.028, headC.z + 0.112);
    tube(jl, jf, 0.020, 0.018, 5, P.boneDk);
    tube(jf, jr, 0.018, 0.020, 5, P.boneDk);
    tube(V(headC.x - 0.056, L.jawY - 0.008, headC.z + 0.072), V(headC.x + 0.056, L.jawY - 0.008, headC.z + 0.072), 0.012, 0.011, 4, P.boneLt);
    quad(V(headC.x - 0.050, L.jawY - 0.022, headC.z + 0.096), V(headC.x + 0.050, L.jawY - 0.022, headC.z + 0.096),
      V(headC.x + 0.044, L.jawBotY - jawDrop + 0.010, headC.z + 0.086), V(headC.x - 0.044, L.jawBotY - jawDrop + 0.010, headC.z + 0.086), P.socket, 0.02);
  }

  /* ===== ARMS — thin ivory tubes, knobbed joints, both bent to real elbow angles gripping the
     rifle (law 2 in POSE-ANATOMY: shoulder->elbow->wrist reads as an arc, never a straight
     stick). Front (right) arm cradles the fore-stock; rear (left) arm draws to the trigger. ===== */
  {
    const knob = (p, r) => blob(p.x, p.y, p.z, r, r * 0.85, r, P.boneLt, 6, 4);

    /* FRONT (right) arm — shoulder rides UP toward the raised rifle (POSE-ANATOMY law 3),
       elbow bent ~120°, wrist wraps the fore-stock. */
    const S1 = torque(V(L.shoulderX, L.shldY - 0.01, 0.01)).add(V(0, 0.03, 0));
    /* R3 CRITIC FIX: r2's elbow (0.260,1.075,0.300) measured ~37° of flexion (a folded
       bicep-curl fold, not a grip bend) — outside ANATOMY-CANON's 100-150° band and the source
       of the "arm flung away from the rifle" read in the r2 render. Pulled the elbow in to a
       ~120°-flexion bulge (down + modestly forward, tucked near the fore-stock line) so the
       forearm visibly tracks toward the grip instead of ballooning outward. */
    const E1 = V(0.220, 1.150, 0.140);
    const W1 = FORE_GRIP.clone();
    knob(S1, 0.050); tube(S1, E1, 0.034, 0.028, 6, P.bone); knob(E1, 0.042);
    tube(E1, W1, 0.028, 0.024, 6, P.bone); knob(W1, 0.034);
    /* gripping finger-bone stubs wrapping the fore-stock */
    for (const dz of [-0.02, 0.02]) {
      const d = AXIS.clone();
      tube(W1.clone().add(V(0.018, -0.02, dz)), W1.clone().add(V(0.018, -0.02, dz)).addScaledVector(d, 0.03), 0.010, 0.007, 4, P.boneLt);
    }

    /* REAR (left) arm — shoulder square-ish, elbow bent ~100° down-and-in, wrist at the
       trigger/butt (the rear hand nestled under the receiver, cheek weld above). */
    /* R3 CRITIC FIX #2: even with a smoothed elbow arc, S2 sitting at the full shoulder-width
       offset (-0.220) still projected outside the collar/ribcage silhouette under this camera,
       reading as an isolated knob near the neck. Tucked the rear shoulder in closer to the
       spine (a shouldered rifle's trigger-side shoulder rides in, not out). */
    const S2 = torque(V(-L.shoulderX * 0.72, L.shldY - 0.02, 0.005));
    /* R3 CRITIC FIX: r2's elbow (-0.050,1.030,-0.075) dipped BELOW both the shoulder and the
       wrist, so shoulder->elbow->wrist doubled back on itself in screen space under the fixed
       dimetric camera — read as a disconnected stub near the skull rather than one continuous
       arc (compare gladiator-r2.png's raised arm, which sweeps as a single clean diagonal).
       Moved the elbow onto a smooth downhill line from shoulder to the trigger grip. */
    const E2 = V(-0.020, 1.080, 0.060);
    const W2 = TRIGGER_GRIP.clone();
    knob(S2, 0.050); tube(S2, E2, 0.034, 0.028, 6, P.bone); knob(E2, 0.042);
    tube(E2, W2, 0.028, 0.024, 6, P.bone); knob(W2, 0.034);
    for (const dz of [-0.018, 0.018]) {
      const d = AXIS.clone().multiplyScalar(-1);
      tube(W2.clone().add(V(-0.014, -0.018, dz)), W2.clone().add(V(-0.014, -0.018, dz)).addScaledVector(d, 0.026), 0.009, 0.006, 4, P.boneLt);
    }
  }

  /* ===== ROTTED DUSTER — a tattered long coat swept back off the shoulders by the wind,
     breaking the bone silhouette with cloth mass; torn hem panels trailing behind the braced
     rear leg. Shoulders/yoke close to the torqued torso, hem flares open and back. ===== */
  {
    const yokeC = (y) => torque(V(0, y, 0.0));
    /* shoulder yoke ring, hugging the torso */
    const yoke = ring(yokeC(L.shldY - 0.03), V(0, 1, 0), 0.098, 0.086, 8, Math.PI / 8);
    /* waist ring, still fairly close */
    const waistR = ring(V(0, L.waistY - 0.06, -0.01), V(0, 1, 0), 0.108, 0.098, 8, Math.PI / 8);
    stitch([yoke, waistR], () => P.coat);
    /* hem — flared open, swept back+down toward the trailing rear leg, torn into uneven panels */
    const hemPts = [
      { a: -0.20, len: 0.62, sweepZ: -0.30, sweepX: -0.06 },
      { a: -0.10, len: 0.50, sweepZ: -0.22, sweepX: -0.03 },
      { a: 0.0,   len: 0.40, sweepZ: -0.10, sweepX: 0.0 },
      { a: 0.10,  len: 0.46, sweepZ: -0.16, sweepX: 0.03 },
      { a: 0.20,  len: 0.58, sweepZ: -0.26, sweepX: 0.05 },
    ];
    for (let i = 0; i < hemPts.length - 1; i++) {
      const p0 = hemPts[i], p1 = hemPts[i + 1];
      const top0 = V(p0.a, L.waistY - 0.06, -0.01 + p0.a * 0.05);
      const top1 = V(p1.a, L.waistY - 0.06, -0.01 + p1.a * 0.05);
      const bot0 = V(p0.a + p0.sweepX, L.waistY - 0.06 - p0.len, -0.01 + p0.sweepZ);
      const bot1 = V(p1.a + p1.sweepX, L.waistY - 0.06 - p1.len, -0.01 + p1.sweepZ);
      const hex = (i % 2 === 0) ? P.coat : P.coatDk;
      quad(top0, top1, bot1, bot0, hex, 0.05);
      quad(top1, top0, bot0, bot1, P.coatDk, 0.05);   // back face so wind-swept panels read from both sides
    }
    /* collar — a raised dark band at the yoke top, catching a little light on the front edge */
    const collarA = yokeC(L.shldY + 0.02);
    tube(collarA.clone().add(V(-0.09, 0, -0.02)), collarA.clone().add(V(-0.03, 0.045, 0.09)), 0.018, 0.014, 4, P.coatLt);
    tube(collarA.clone().add(V(0.09, 0, -0.02)), collarA.clone().add(V(0.03, 0.045, 0.09)), 0.018, 0.014, 4, P.coatLt);
  }

  /* ===== LEGS — thin ivory tubes, knobbed joints. Front foot planted forward under the rifle;
     rear boot braced back, heel lifted (the firing-line brace, law 5). ===== */
  {
    const knob = (p, r) => blob(p.x, p.y, p.z, r, r * 0.85, r, P.boneLt, 6, 4);
    /* R3 CRITIC FIX: r2's ankles spread z=+0.335/-0.365 (a 0.70u straddle, ~44% of body height)
       — read as a mid-run scissor/falling split rather than a grounded firing brace. Pulled both
       feet in to a ~0.40u stance (still a clear forward/back stagger, now a brace not a split). */
    /* FRONT (right) — planted forward, knee bent, weight driven into the shot */
    const hipR = V(L.hipHalf, L.hipY - 0.02, 0.0), kneeR = V(0.140, 0.400, 0.140), ankR = V(0.112, 0.048, 0.205);
    knob(hipR, 0.045); tube(hipR, kneeR, 0.039, 0.031, 6, P.bone); knob(kneeR, 0.039);
    tube(kneeR, ankR, 0.031, 0.025, 6, P.bone); knob(ankR, 0.031);
    /* REAR (left) — braced back, straighter, heel lifted (toe-down brace, not a full push-off) */
    const hipL = V(-L.hipHalf, L.hipY - 0.02, 0.0), kneeL = V(-0.112, 0.415, -0.130), ankL = V(-0.090, 0.085, -0.190);
    knob(hipL, 0.045); tube(hipL, kneeL, 0.039, 0.031, 6, P.bone); knob(kneeL, 0.039);
    tube(kneeL, ankL, 0.031, 0.025, 6, P.bone); knob(ankL, 0.031);
    /* bone feet — flat pale plate + toe stubs. Front flat/forward (planted); rear toe-down. */
    for (const [ank, toeDir, footY] of [[ankR, V(-0.05, 0, 1), 0.045], [ankL, V(0.09, 0, 1), 0.088]]) {
      const d = toeDir.clone().normalize();
      const tip = V(ank.x, footY, ank.z).clone().addScaledVector(d, 0.105);
      tube(V(ank.x, footY, ank.z), tip, 0.033, 0.019, 5, P.boneDk, { capB: { hex: P.boneDk }, raz: 0.025, rbz: 0.015 });
      for (const off of [-0.02, 0.02]) tube(tip.clone().add(V(off, 0, 0)), tip.clone().add(V(off, 0, 0.028)), 0.009, 0.007, 4, P.boneLt);
    }
  }

  /* ===== base disc (Medium: r=0.42) ===== */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.058, 0), P.discTop);
  }
}
