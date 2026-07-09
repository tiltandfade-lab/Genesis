/* dev/model-qa/creatures/rlm-seas-invisible-stalker.js — the INVISIBLE STALKER landmark table
   (SUGGESTED-HUMANOID family, hollow-outline, Large, CR 6, realm high-seas), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, seas-w2 cell 2). Core identity:
   an unseen wind-scout — the tabletop-mini trick is to model the ABSENCE, not the body. There is
   no solid figure here at all: only sea-spray droplets and a swirl of caught mist clinging to
   where a big striding humanoid's silhouette EDGES would be. Every tri authored below is bright
   (the positive spray) — the interior is void by omission, not by painting it dark, which is why
   this is the one creature in the roster where an empty middle IS the signature.

   FEATURE CHECKLIST (the ~1,000-1,400 budget buys):
     1. Hollow-outline striding legs — each leg traced as a pair of thin bright spray "rail" tubes
        running the limb's left/right silhouette edge (never a solid filled limb), front leg
        planted forward, back leg trailing bent — so the void shows clean between the two rails.
     2. Hollow-outline torso cage — two horizontal spray hoops (shoulder + waist) linked by four
        vertical rails tracing the torso's outer edge only; the chest interior is empty geometry
        space, reading as the creature's absence.
     3. SIGNATURE — the reaching arm: a denser, brighter double-rail arm chasing forward past the
        front leg, ending in a foam-white splash burst at the "hand" — the loud, exaggerated,
        law-4 feature (the ONE clearly readable gesture of an unseen thing reaching).
     4. Trailing arm — a thinner, sparser rail pair swept back, with a small trailing mist-puff
        cluster instead of a splash (asymmetric with the signature arm — the mid-stride read).
     5. Head/shoulder mist-swirl — a loose spiral ring of caught-mist droplets sitting where a
        head would be, climbing off the back of the "neck," never a solid skull.
     6. Rain-shadow ground disturbance — a scatter of displaced spray droplets and two low arcing
        spray-rails at the planted foot, selling "something just stepped here" at the base.

   POSE SENTENCE: the mid-stride reach — front leg planted forward, back leg trailing bent behind,
   torso's traced edge leaning into the stride, the signature arm's spray-rail chasing out ahead
   of the front foot into a foam-white splash at the reaching hand, the trailing arm and a loose
   mist-swirl at the head completing the outline of a big striding figure that isn't there.

   Opacity (near-invisible, low alpha) is an engine/material-level spawn property, not authored in
   this geometry — every authored tri here is bright spray/mist so the outline itself carries the
   law-3 value-contrast payload; the engine dims the whole mesh later. The interior stays literal
   void: no fill geometry is authored inside the traced limbs/torso at all.

   R1 SELF-CORRECTION (post r1 engine render): the reaching-arm/splash signature sat too close to
   the torso cage and at leg height, so it visually fused into the leg-spread instead of reading as
   a separate reaching gesture; the head mist-swirl was too small to read as anything but stray
   dots. Fix: pushed the reaching arm's elbow/wrist further out and ABOVE leg height, doubled the
   splash-burst droplet size/reach, and enlarged the head-swirl radius/droplets — all number edits
   on the same rig, no rebuild.

   R2 CRITIC CORRECTION (post r2 engine render, fresh-context pass 2): the r1 fix pushed the
   signature arm's reach (wr.x=0.62-0.66, z=0.78-0.85) so far out past the base disc's r=0.55
   footprint that it left the camera frame entirely — sampled render pixels out at that screen
   region read void-floor (max channel ~30 of 255, indistinguishable from dither noise), i.e. the
   "loudest feature in the piece" was rendering completely off-frame/invisible, a hard law-2/3/5
   failure (silhouette doesn't read, no light on the signature, the reach gesture isn't legible).
   Fix: pulled the signature arm's reach back inside the disc footprint (wr ~0.40/0.86/0.50 vs the
   old 0.62/0.90/0.78) and raised it clearly above the leg-spread's screen band so it stays a
   separate, in-frame, well-lit gesture; enlarged the splash-burst droplets further and added a
   near-wrist foam core blob so the burst reads as a bright cluster rather than a thin scatter that
   could still dissolve at 1/3-res.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w2'], cell 2, fn buildInvisibleStalker). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* sideVec: a lateral offset direction perpendicular to a limb's axis (a->b), used to split one
   centerline into two thin edge-tracing rails so the hollow shell reads instead of a solid stick. */
function sideVec(a, b){
  const axis = new THREE.Vector3().subVectors(b, a).normalize();
  let side = new THREE.Vector3().crossVectors(axis, V(0, 1, 0));
  if(side.lengthSq() < 0.02) side = new THREE.Vector3().crossVectors(axis, V(1, 0, 0));
  return side.normalize();
}

/* edgeLimb: draws the HOLLOW outline of one limb segment as two thin bright rails offset ±half-
   width from the true centerline — the void between them is the point (law 3's dark-inside-is-
   the-signature, applied to the whole creature rather than one feature). */
function edgeLimb(a, b, width, r0, r1, hexA, hexB, n = 5){
  const side = sideVec(a, b);
  const offA0 = a.clone().addScaledVector(side, width * 0.5);
  const offA1 = b.clone().addScaledVector(side, width * 0.5);
  const offB0 = a.clone().addScaledVector(side, -width * 0.5);
  const offB1 = b.clone().addScaledVector(side, -width * 0.5);
  tube(offA0, offA1, r0, r1, n, hexA);
  tube(offB0, offB1, r0, r1, n, hexB);
}

/* hoop: a horizontal ring of points traced with short thin tube rails instead of a filled band —
   the torso-cage outline (empty inside, bright edge). */
function hoop(cy, rx, rz, n, r, hex){
  const pts = ring(V(0, cy, 0), V(0, 1, 0), rx, rz, n, Math.PI / n);
  for(let i = 0; i < n; i++){
    const i2 = (i + 1) % n;
    tube(pts[i], pts[i2], r, r, 4, hex);
  }
  return pts;
}

export function buildInvisibleStalker(){
  /* ---------- PALETTE — everything authored is BRIGHT (the positive spray/mist); nothing here
     is painted void-dark, since the void reads through pure absence of geometry, not color. ---- */
  const P = {
    sprayLt: 0xe8f4f0,   // near-white pale sea-spray — the main edge-rail color
    spray:   0xc4dcd8,   // pale cyan, secondary rail
    sprayDk: 0x9cbcb8,   // dimmer rail (trailing/back-body limbs), still well off the void
    mist:    0xd4e4e0,   // caught-mist puffs (head swirl, trailing arm)
    foam:    0xffffff,   // SIGNATURE — the reaching-hand splash burst, the loudest value in the piece
    disc:    0x2c322a, discTop: 0x363e32,   // base disc (furniture, not the creature — dark is fine here)
  };

  /* ===== RIG — Large scale, mid-stride: front (left) leg planted forward, back (right) leg
     trailing bent; torso's traced edge leans forward into the stride; right arm (paired with the
     forward left leg, natural contralateral gait) reaches out ahead as the signature; left arm
     trails back. ===== */
  const L = {
    hipY: 0.55, waistY: 0.66, chestY: 0.82, shldY: 0.93, neckY: 0.99, headY: 1.10,
  };

  /* ===== LEGS — hollow-outline stride. Front leg planted well forward and low; back leg
     trailing, knee lifted and drawn up behind (the push-off moment). ===== */
  const hipL = V(-0.11, L.hipY, 0.04), kneeL = V(-0.16, 0.30, 0.34), footL = V(-0.14, 0.02, 0.54);
  const hipR = V(0.11, L.hipY, -0.02), kneeR = V(0.22, 0.36, -0.22), footR = V(0.26, 0.16, -0.44);

  edgeLimb(hipL, kneeL, 0.075, 0.052, 0.040, P.sprayLt, P.spray, 5);
  edgeLimb(kneeL, footL, 0.075, 0.040, 0.026, P.sprayLt, P.spray, 5);
  edgeLimb(hipR, kneeR, 0.068, 0.048, 0.036, P.spray, P.sprayDk, 5);
  edgeLimb(kneeR, footR, 0.068, 0.036, 0.022, P.spray, P.sprayDk, 5);

  /* planted-foot spray puffs — small droplet cluster where the front foot lands */
  for(let i = 0; i < 3; i++){
    const a = i * 2.1 + 0.4;
    const dx = Math.cos(a) * 0.05, dz = Math.sin(a) * 0.05;
    blob(footL.x + dx, 0.015 + 0.01 * (i % 2), footL.z + dz, 0.028, 0.020, 0.028, P.sprayLt, 4, 2);
  }
  /* trailing-foot lighter puffs — the back foot mid-lift */
  for(let i = 0; i < 2; i++){
    const a = i * 2.7 + 1.1;
    const dx = Math.cos(a) * 0.04, dz = Math.sin(a) * 0.04;
    blob(footR.x + dx, footR.y - 0.02, footR.z + dz, 0.022, 0.016, 0.022, P.sprayDk, 4, 2);
  }

  /* ===== TORSO — hollow-outline cage: shoulder hoop + waist hoop linked by four vertical rails,
     interior left as true void geometry-space. Leaned forward into the stride. ===== */
  const waistHoop = hoop(L.waistY, 0.155, 0.130, 8, 0.028, P.spray);
  const shldHoop = hoop(L.shldY + 0.02, 0.205, 0.145, 8, 0.032, P.sprayLt);
  {
    const rails = [0, 2, 4, 6];
    for(const i of rails){
      tube(waistHoop[i], shldHoop[i], 0.026, 0.030, 4, (i === 4) ? P.sprayLt : P.spray);
    }
    /* hip hoop closing the base of the cage down toward the legs, linked up to the waist hoop */
    const hipHoop = hoop(L.hipY, 0.135, 0.115, 8, 0.026, P.sprayDk);
    for(const i of rails) tube(hipHoop[i], waistHoop[i], 0.022, 0.026, 4, P.sprayDk);
  }

  /* ===== HEAD — a loose mist-swirl ring where a head would be, spiraling up off the traced neck,
     never a solid skull. ===== */
  {
    const N = 6;
    for(let i = 0; i < N; i++){
      const t = i / N, ang = t * Math.PI * 2;
      const r = 0.105 - 0.014 * Math.sin(t * Math.PI);
      const cx = Math.cos(ang) * r, cz = Math.sin(ang) * r * 0.85;
      const cy = L.headY + 0.03 * Math.sin(t * Math.PI * 2 + 1.2);
      blob(cx, cy, cz, 0.042, 0.036, 0.042, (i % 2) ? P.mist : P.sprayLt, 4, 2);
    }
    /* swirl trail lifting off the back of the head */
    for(let i = 0; i < 3; i++){
      const t = i / 2;
      blob(-0.04 - 0.04 * t, L.headY + 0.08 + 0.06 * t, -0.08 - 0.06 * t, 0.028 - 0.005 * i, 0.022, 0.028 - 0.005 * i, P.mist, 4, 2);
    }
    /* neck rail connecting the shoulder hoop up to the head swirl */
    tube(V(0, L.shldY + 0.02, 0.01), V(0, L.neckY, 0.02), 0.030, 0.020, 5, P.sprayLt);
  }

  /* ===== SIGNATURE — the reaching arm (right, paired with the forward left leg): a brighter,
     denser double-rail chasing out ahead of the front foot, ending in a foam-white splash burst
     at the hand. The loudest, most exaggerated feature in the piece. ===== */
  {
    /* r2 critic correction: pulled the reach back inside the base-disc footprint (was wr
       x=0.62/z=0.78, past the r=0.55 disc radius — rendered off-frame/void at the engine capture)
       and raised it clearly above the leg-spread band so it survives as a separate, in-frame,
       well-lit gesture instead of dissolving at the camera edge. */
    const sh = V(0.15, L.shldY, 0.08);
    const el = V(0.22, 1.05, 0.42);
    const wr = V(0.24, 1.14, 0.62);
    edgeLimb(sh, el, 0.062, 0.046, 0.036, P.sprayLt, P.foam, 5);
    edgeLimb(el, wr, 0.062, 0.036, 0.022, P.sprayLt, P.foam, 5);
    /* splash burst — a fan of bright droplets bursting off the reaching hand, further enlarged +
       pulled to the in-frame wrist position; a solid near-wrist foam core added so the burst reads
       as one bright cluster (not a thin scatter that can dissolve at 1/3-res). */
    const B = 8;
    for(let i = 0; i < B; i++){
      const a = i / B * Math.PI * 2;
      const dx = Math.cos(a) * 0.10, dy = 0.04 + 0.08 * Math.abs(Math.sin(a * 1.7)), dz = Math.sin(a) * 0.09 + 0.06;
      blob(wr.x + dx, wr.y + dy, wr.z + dz, 0.042, 0.036, 0.042, P.foam, 4, 2);
    }
    blob(wr.x + 0.03, wr.y + 0.02, wr.z + 0.05, 0.056, 0.046, 0.056, P.foam, 5, 3);
    blob(wr.x, wr.y, wr.z, 0.044, 0.038, 0.044, P.foam, 5, 2);
  }

  /* ===== trailing arm (left, sweeping back) — thinner, sparser rail pair, a small trailing mist
     puff cluster instead of a splash — the asymmetric, less-loud counterpart. ===== */
  {
    const sh = V(-0.16, L.shldY, 0.02);
    const el = V(-0.26, 0.72, -0.16);
    const wr = V(-0.30, 0.62, -0.32);
    edgeLimb(sh, el, 0.048, 0.036, 0.026, P.spray, P.sprayDk, 5);
    edgeLimb(el, wr, 0.048, 0.026, 0.016, P.spray, P.sprayDk, 5);
    for(let i = 0; i < 3; i++){
      const a = i * 2.3 + 0.7;
      const dx = Math.cos(a) * 0.03, dz = Math.sin(a) * 0.03 - 0.02;
      blob(wr.x + dx, wr.y - 0.01, wr.z + dz, 0.020, 0.016, 0.020, P.mist, 4, 2);
    }
  }

  /* ===== rain-shadow ground disturbance — the base sells "something just stepped here": a
     scatter of displaced droplets plus two low arcing spray-rails fanning out from the planted
     front foot. ===== */
  {
    const D = 5;
    for(let i = 0; i < D; i++){
      const a = i / D * Math.PI * 2 + 0.3;
      const r = 0.13 + 0.04 * (i % 2);
      const dx = footL.x + Math.cos(a) * r, dz = footL.z + Math.sin(a) * r;
      blob(dx, 0.010, dz, 0.018, 0.012, 0.018, (i % 2) ? P.spray : P.sprayLt, 4, 2);
    }
    for(const s of [-1, 1]){
      const a0 = footL.clone().add(V(s * 0.03, 0.01, -0.02));
      const a1 = footL.clone().add(V(s * 0.16, 0.02, 0.10));
      tube(a0, a1, 0.018, 0.006, 4, P.spray, { capB: { hex: P.spray } });
    }
  }

  /* base disc (Large: r=0.55, matches the sahuagin-baron/yuan-ti-abomination convention) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.55, 0.55, 18);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.53, 0.53, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.058, 0), P.discTop);
  }
}
