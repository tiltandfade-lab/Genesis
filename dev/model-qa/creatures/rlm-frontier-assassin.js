/* dev/model-qa/creatures/rlm-frontier-assassin.js — the ASSASSIN landmark table (HUMANOID
   family, Medium, CR 3, realm frontier), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri
   band (foundry pilot, frontier-w2 cell 1). Core identity: the RIDGE SNIPER, KNEELING —
   REQUEUE. The prior build was PRONE (belly flat to the ground); at this camera's dimetric
   angle a prone figure squashes to a low horizontal smear with almost no silhouette to read.
   NEW DIRECTION per requeue brief: abandon prone entirely, build the kneel — one knee down,
   rifle barrel rested across the raised knee, cheek laid to the stock, hat brim pulled low,
   long duster coat pooled around the kneeling leg. Silhouette = the kneeling triangle (wide
   base at the pooled coat, narrowing up to the hat) crossed by the long horizontal barrel line.
   Bespoke to the render key "assassin"; the frontier reskin rides this chassis.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID kneeling brace per ANATOMY-CANON POSE-ANATOMY: rear leg folded fully under the
        body (thigh down, shin flat to the ground, foot trailing back), front leg planted with
        the knee raised and bent ~100-110deg, foot flat forward of the hip — a true kneeling
        brace, not a standing figure crouched in place.
     2. SIGNATURE — the rifle: a long dark barrel resting across the raised front knee, angled
        up and out toward the target, with a bright brass/glint band at the muzzle (the law-3
        high-value patch) and a second smaller glint at the bolt/receiver near the stock.
     3. SPINE curls forward and down INTO the stock — chest leans over the raised knee, neck
        bends the head down and forward so the cheek lays against the stock line, not an
        upright plumb spine with a gun merely attached.
     4. Both elbows bent 100-150deg: the front (trigger) arm folds down to the trigger guard
        under the barrel; the rear (support) arm reaches up and across to brace the stock at the
        shoulder — a real elbow corner on each, not straight rods.
     5. Long duster coat: a wide flared skirt of coat fabric pooling out around the kneeling
        rear leg and hip, breaking the torso silhouette wide at the base (the "pooled" read) and
        narrowing up through a buttoned coat-front torso.
     6. Face — hat brim pulled low over the brow (a broad dark disc silhouette element), a
        narrow strip of face visible beneath it (jaw, one eye-line shadow, pressed lips), a
        hatband as a second small glint/color-break feature.

   POSE SENTENCE: the ridge kneel — rear leg folded flat under the body, front leg planted
   with the knee raised, chest and neck curled forward and down over the raised knee to lay
   cheek to stock, the rifle barrel resting across that knee and angled out toward the target,
   trigger arm folded down under the guard, support arm braced up across the stock, hat brim
   low, duster pooling wide around the kneel — coiled, settled, patient, never standing.

   SPINE-GESTURE SENTENCE: the spine runs from a low, twisted hip band (square to the folded
   rear leg, offset toward the planted front knee) up through a forward-curling ribcage/chest
   that leans down and out over the raised knee, into a neck that continues the same forward
   curl and turns the head down to the stock — a single continuous forward arc from pelvis to
   skull, not a vertical mannequin line with the head merely tilted.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w2'], cell 1, fn buildAssassin). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildAssassin(){
  /* ---------- PALETTE (dusty duster + dark leathers vs. a bright brass glint on the rifle —
     the law-3 high-value zone the muzzle/bolt/hatband carry; frontier-desaturated, cool-dusty). */
  const P = {
    coat: 0x6a5c46, coatDk: 0x4a4032, coatLt: 0x8a7a5c,
    vest: 0x3a3226,
    pants: 0x564a38, pantsDk: 0x3e3628,
    boot: 0x3e3628, bootDk: 0x2a241a,
    skin: 0xc4906a, skinDk: 0x8f6244,
    hat: 0x342c20, hatband: 0x7a5838,
    barrel: 0x2a241c, stock: 0x4a3826,
    glint: 0xe8d8a8, glint2: 0xd0c090,
    eyeShadow: 0x1c1610,
    disc: 0x36312a, discTop: 0x423b32,
  };

  /* ===== SPINE — a single forward-curling arc from a low hip band up through the chest and
     neck, curling forward and down over the raised knee to the stock. Authored as EXPLICIT
     (y,z) anchor points (no rotation matrix — a prior rotate-about-hip attempt compounded and
     collapsed the whole figure down into a smear, the exact prone-look failure this requeue
     exists to fix). Each band's z creeps forward as y climbs, then z keeps growing while y
     eases back down through the neck/jaw/brow — the forward-and-down curl into the stock. ===== */
  const SP = {
    hip:    V(0, 0.235, 0.00),
    waist:  V(0, 0.340, 0.03),
    rib:    V(0, 0.440, 0.075),
    chest:  V(0, 0.500, 0.135),
    shld:   V(0, 0.535, 0.175),
    neck:   V(0, 0.545, 0.205),
    jaw:    V(0, 0.520, 0.250),
    brow:   V(0, 0.545, 0.275),
    crown:  V(0, 0.585, 0.255),
  };

  /* ===== LEGS — the kneeling brace. Rear leg (+x) folded fully under the body: thigh angles
     down-back from the hip, shin lies flat to the ground, foot trails back — the knee itself
     rests on the ground plane. Front leg (-x) planted: thigh down-forward, knee raised and bent
     ~105deg, foot flat on the ground forward of the hip, taking the weight the chest leans over. */
  {
    // REAR leg (+x): folded under, knee-down kneel
    const hipR = V(0.11, SP.hip.y, SP.hip.z - 0.02);
    const kneeGround = V(0.155, 0.095, -0.235);   // rear knee touches ground
    const footR = V(0.165, 0.062, -0.360);        // trailing foot, toe down
    tube(hipR, kneeGround, 0.098, 0.080, 6, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeGround, footR, 0.076, 0.058, 6, P.boot, { capB: { hex: P.bootDk, lift: 0.014 } });

    // FRONT leg (-x): planted, knee raised ~105deg, foot forward of hip
    const hipF = V(-0.125, SP.hip.y, SP.hip.z);
    const kneeF = V(-0.150, 0.360, 0.235);        // raised knee, well above ground, forward
    const footF = V(-0.150, 0.032, 0.330);        // planted flat, forward of hip
    tube(hipF, kneeF, 0.104, 0.086, 6, P.pants, { capA: { hex: P.coatDk } });
    tube(kneeF, footF, 0.082, 0.062, 6, P.boot, { capB: { hex: P.bootDk, lift: 0.016 } });
    // boot toe wedge, front foot
    quad(V(footF.x + 0.05, 0.014, footF.z + 0.03), V(footF.x - 0.05, 0.014, footF.z + 0.03),
      V(footF.x - 0.045, 0.044, footF.z + 0.10), V(footF.x + 0.045, 0.044, footF.z + 0.10), P.boot, 0.04);
  }

  /* ===== DUSTER SKIRT — wide flared coat fabric pooling around the kneeling rear leg/hip,
     breaking the base of the silhouette wide (the "pooled" read) before narrowing up into the
     torso. Authored as a fan of quads flaring outward at the hip level. ===== */
  {
    const hipC = V(0, SP.hip.y - 0.03, SP.hip.z - 0.03);
    const pts = [
      V(-0.24, 0.03, 0.10), V(-0.10, 0.02, 0.34), V(0.06, 0.03, 0.30),
      V(0.30, 0.02, -0.10), V(0.34, 0.03, -0.34), V(0.10, 0.03, -0.42),
    ];
    for(let i = 0; i < pts.length; i++){
      const a = pts[i], b = pts[(i + 1) % pts.length];
      quad(V(hipC.x, hipC.y, hipC.z), V(a.x, a.y, a.z), V(b.x, b.y, b.z), V(hipC.x, hipC.y - 0.01, hipC.z),
        i % 2 === 0 ? P.coat : P.coatDk, 0.05);
    }
  }

  /* ===== TORSO — narrowing coat-front band rising from the hip through chest to shoulder,
     following the forward curl via explicit per-band cz. Buttoned coat front + dark vest
     breaking the coat open. ===== */
  const torsoBands = [
    { y: SP.hip.y,   cz: SP.hip.z,   rx: 0.150, rz: 0.140, hex: P.coatDk },
    { y: SP.waist.y, cz: SP.waist.z, rx: 0.168, rz: 0.150, hex: P.coat },
    { y: SP.rib.y,   cz: SP.rib.z,   rx: 0.180, rz: 0.155, hex: P.coatLt },
    { y: SP.chest.y, cz: SP.chest.z, rx: 0.172, rz: 0.148, hex: P.coat },
    { y: SP.shld.y,  cz: SP.shld.z,  rx: 0.160, rz: 0.135, hex: P.coatDk },
  ];
  stack(torsoBands, 8, {});

  /* open coat front — dark vest strip breaking the coat down the chest */
  {
    const top = V(0, SP.shld.y - 0.01, SP.shld.z + 0.115);
    const lo = V(0, SP.hip.y + 0.03, SP.hip.z + 0.125);
    quad(V(top.x - 0.032, top.y, top.z), V(top.x + 0.032, top.y, top.z),
      V(lo.x + 0.026, lo.y, lo.z), V(lo.x - 0.026, lo.y, lo.z), P.vest, 0.04);
  }
  /* coat buttons — small bright dots down the vest line (secondary countable feature) */
  for(let i = 0; i < 3; i++){
    const t = i / 2;
    const c = V(0, SP.hip.y + 0.05 + t * (SP.shld.y - SP.hip.y - 0.08), SP.hip.z + 0.13 + t * 0.03);
    quad(V(c.x - 0.010, c.y - 0.009, c.z), V(c.x + 0.010, c.y - 0.009, c.z),
      V(c.x + 0.009, c.y + 0.009, c.z), V(c.x - 0.009, c.y + 0.009, c.z), P.glint2, 0.05);
  }

  /* ===== HEAD — curled down toward the stock, hat brim low, narrow strip of face visible. */
  {
    const headBands = [
      { y: SP.jaw.y,  cz: SP.jaw.z,  rx: 0.086, rz: 0.082, hex: P.skinDk },
      { y: SP.brow.y, cz: SP.brow.z, rx: 0.098, rz: 0.092, hex: P.skin },
    ];
    stack(headBands, 8, {});

    const jawC = V(0, SP.jaw.y, SP.jaw.z + 0.078);
    const browC = V(0, SP.brow.y, SP.brow.z + 0.088);

    /* eye-shadow line under the brim — a dark strip standing in for the shadowed eyes */
    quad(V(jawC.x - 0.060, browC.y - 0.006, browC.z), V(jawC.x + 0.060, browC.y - 0.006, browC.z),
      V(jawC.x + 0.052, browC.y + 0.016, browC.z - 0.008), V(jawC.x - 0.052, browC.y + 0.016, browC.z - 0.008),
      P.eyeShadow, 0.03);

    /* pressed lips */
    quad(V(jawC.x - 0.032, jawC.y - 0.028, jawC.z), V(jawC.x + 0.032, jawC.y - 0.028, jawC.z),
      V(jawC.x + 0.026, jawC.y - 0.014, jawC.z + 0.004), V(jawC.x - 0.026, jawC.y - 0.014, jawC.z + 0.004),
      P.skinDk, 0.03);

    /* hat crown + wide low brim — a broad dark disc silhouette element sitting over the head,
       riding the forward curl */
    const crownC = V(SP.crown.x, SP.crown.y, SP.crown.z + 0.06);
    const crownBands = [
      { y: SP.crown.y,         cz: SP.crown.z,         rx: 0.100, rz: 0.096, hex: P.hat },
      { y: SP.crown.y + 0.075, cz: SP.crown.z - 0.015,  rx: 0.078, rz: 0.074, hex: P.hat },
    ];
    stack(crownBands, 8, { capTop: { hex: P.hat, lift: 0.02 } });
    /* brim — wide flat fan below the crown, pulled low over the brow */
    {
      const bC = V(SP.crown.x, SP.crown.y - 0.02, SP.crown.z + 0.02);
      const bpts = [
        V(-0.175, bC.y, bC.z + 0.08), V(0.00, bC.y, bC.z + 0.155), V(0.175, bC.y, bC.z + 0.08),
        V(0.145, bC.y, bC.z - 0.12), V(0.00, bC.y, bC.z - 0.155), V(-0.145, bC.y, bC.z - 0.12),
      ];
      for(let i = 0; i < bpts.length; i++){
        const a = bpts[i], b = bpts[(i + 1) % bpts.length];
        quad(V(bC.x, bC.y, bC.z), V(a.x, a.y, a.z), V(b.x, b.y, b.z), V(bC.x, bC.y - 0.006, bC.z), P.hat, 0.04);
      }
    }
    /* hatband — small bright color-break glint around the base of the crown */
    quad(V(crownC.x - 0.095, crownC.y - 0.01, crownC.z + 0.06), V(crownC.x + 0.095, crownC.y - 0.01, crownC.z + 0.06),
      V(crownC.x + 0.085, crownC.y + 0.02, crownC.z + 0.05), V(crownC.x - 0.085, crownC.y + 0.02, crownC.z + 0.05),
      P.hatband, 0.04);
  }

  /* ===== ARMS — POSE-ANATOMY law 2/3: elbows always bent 100-150deg. Trigger (front, -x) arm
     folds down from the shoulder to the trigger guard under the barrel; support (rear, +x) arm
     reaches up and across to brace the stock at the shoulder. ===== */

  /* trigger arm (-x): shoulder -> elbow tucked down close to the ribs -> wrist at the trigger
     guard, roughly under the raised knee where the barrel rests */
  {
    const sh = V(-0.150, SP.shld.y - 0.01, SP.shld.z + 0.05);
    const el = V(-0.185, 0.430, 0.215);
    const wr = V(-0.130, 0.365, 0.335);
    tube(sh, el, 0.052, 0.044, 6, P.coat);
    tube(el, wr, 0.042, 0.036, 6, P.skin, { phase: Math.PI / 6 });
    quad(V(wr.x - 0.020, wr.y - 0.020, wr.z), V(wr.x + 0.020, wr.y - 0.020, wr.z),
      V(wr.x + 0.017, wr.y + 0.020, wr.z + 0.014), V(wr.x - 0.017, wr.y + 0.020, wr.z + 0.014), P.skin, 0.04);
  }

  /* support arm (+x): shoulder -> elbow swung out and back -> wrist braced up across to the
     stock near the shoulder/cheek — a real elbow corner, not a straight reach to the far side */
  {
    const sh = V(0.140, SP.shld.y - 0.005, SP.shld.z + 0.03);
    const el = V(0.235, 0.470, -0.075);
    const wr = V(0.100, 0.560, 0.115);
    tube(sh, el, 0.052, 0.044, 6, P.coat);
    tube(el, wr, 0.042, 0.036, 6, P.skin, { phase: Math.PI / 6 });
    quad(V(wr.x - 0.020, wr.y - 0.020, wr.z), V(wr.x + 0.020, wr.y - 0.020, wr.z),
      V(wr.x + 0.017, wr.y + 0.020, wr.z + 0.010), V(wr.x - 0.017, wr.y + 0.020, wr.z + 0.010), P.skin, 0.04);
  }

  /* ===== RIFLE — the signature. Long dark barrel resting across the raised front knee,
     angled up and out toward the target; stock laid back toward the cheek/shoulder. Bright
     glint bands at the muzzle (law-3 high-value patch) and at the bolt/receiver. ===== */
  {
    const stockEnd = V(0.075, 0.580, 0.10);     // butt near the cheek/shoulder
    const kneeRest = V(-0.145, 0.375, 0.245);   // resting point across the raised knee
    const muzzle = V(-0.30, 0.520, 0.620);      // angled up and far out toward the target

    tube(stockEnd, kneeRest, 0.030, 0.026, 6, P.stock);
    tube(kneeRest, muzzle, 0.024, 0.014, 6, P.barrel);

    /* bolt/receiver glint — small bright band near the stock */
    const boltC = V(stockEnd.x * 0.4 + kneeRest.x * 0.6, stockEnd.y * 0.4 + kneeRest.y * 0.6, stockEnd.z * 0.4 + kneeRest.z * 0.6);
    quad(V(boltC.x - 0.020, boltC.y - 0.014, boltC.z), V(boltC.x + 0.020, boltC.y - 0.014, boltC.z),
      V(boltC.x + 0.018, boltC.y + 0.014, boltC.z + 0.01), V(boltC.x - 0.018, boltC.y + 0.014, boltC.z + 0.01),
      P.glint2, 0.04);

    /* muzzle glint — the brightest law-3 patch, out at the far tip toward the target */
    quad(V(muzzle.x - 0.020, muzzle.y - 0.016, muzzle.z - 0.01), V(muzzle.x + 0.020, muzzle.y - 0.016, muzzle.z - 0.01),
      V(muzzle.x + 0.017, muzzle.y + 0.016, muzzle.z + 0.02), V(muzzle.x - 0.017, muzzle.y + 0.016, muzzle.z + 0.02),
      P.glint, 0.03);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
