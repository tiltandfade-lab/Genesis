/* dev/model-qa/creatures/rlm-frontier-bandit-enforcer.js — the BANDIT ENFORCER landmark table
   (HUMANOID family, Medium, CR 1/2, realm frontier), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, frontier-w1 cell 2). Core identity: the HEAVY — a bigger,
   meaner railroad-payroll thug who does debt-collection business, distinct from the scrappy
   bandit and the drilled veteran soldier. Bespoke to the render key "bandit-enforcer"; the
   frontier reskin (Company Enforcer — clean coat, brass buttons, ledger-book menace, per
   data/realm-bestiary.js) rides this chassis.

   FEATURE CHECKLIST (the ~1,400-1,700 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: heavyset/overweight-strong bulk (wide
        barrel ribcage, thick neck, no waist taper) straining a buttoned coat across the gut —
        the coat panels pull open at the belly buttons, the law-4 "bigger meaner" body read.
     2. SIGNATURE — the strained coat: brass buttons under tension, lapels pulled taut across
        the chest, a coat hem riding up off the hips from the gut-push. The single loudest
        readable cue that this is the OVERSIZED heavy, not the scrappy bandit.
     3. Club in the raised hand, tapping into the open off-hand palm — brass-knuckled fist
        held low and forward, the "I'm about to use this" threat display (law 5 pose).
     4. Face — heavy jowled head lowered bull-like between rolled-forward shoulders, brim-hat
        shadow, a hard flat mouth-line (no eyes, per the frontier faceless-thug convention).
     5. Pale shirt collar + brass buttons + knuckle-duster as the law-3 high-value zone,
        lifted off the dark coat so the signature carries the value contrast even dithered.
     6. Boots planted wide, weight fully forward onto the front foot (the door-lean stance).

   POSE SENTENCE: the doorway lean-in — weight fully committed onto the front foot, torso
   rolled forward off a forward C-curve spine, shoulders hunched and rolled in, head lowered
   bull-like between them, the club hand raised and cocked, tapping the club-head into the
   open off-hand palm at chest height — the beat before the first swing, never an at-attention
   stance.

   SPINE-GESTURE SENTENCE: the spine runs pelvis (planted, slight forward tilt over the front
   foot) up through a forward-leaning C-curve at the ribcage to a dropped, forward-jutting
   neck/skull — hips push back-and-down as counterweight to the head/shoulders pushing
   forward-and-down, so the trace hips-to-skull reads as one forward-hooking curve, not a
   plumb line, with the rear leg trailing straight-ish and the front leg bent to take the load.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w1'], cell 2, fn buildBanditEnforcer).*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBanditEnforcer(){
  /* ---------- PALETTE (dark strained coat vs. pale shirt/brass high-value ladder — the
     law-3 zone the buttons + collar + knuckles carry; dusty frontier-desaturated). ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's coat/skin sampled far too close to the
     void — the whole torso+arms read as a black silhouette blob with only the hat band
     surviving, and the head disappeared entirely between the hat and the torso (law 3
     failure). Lifted the whole palette a full step off the void, and pushed the shirt/collar
     to near-white so the strained-coat signature actually carries the high-value zone. */
  const P = {
    coat: 0x4a4030, coatDk: 0x322a1f, coatLt: 0x5e523e,
    shirt: 0xf0e6c4, shirtDk: 0xb0a37e,
    skin: 0xb28a62, skinDk: 0x7e5e40,
    hat: 0x2a2419, hatBand: 0x5c4830,
    brass: 0xdcb85c, brassDk: 0x9c7e3c,
    club: 0x5c4632, clubDk: 0x3c2c1e,
    disc: 0x36312a, discTop: 0x423b32,
  };

  /* ===== RIG — forward C-curve spine: hips back-and-low, ribcage/shoulders forward-and-up,
     head dropped further forward. Front (left, +x) leg planted and bent; rear (right, -x) leg
     trailing, weight fully forward. ===== */
  const L = {
    hipY: 0.34, waistY: 0.50, ribY: 0.66, chestY: 0.80, shldY: 0.90, neckY: 0.965,
    headY: 1.10,
  };
  /* forward lean offsets in +z (the direction the enforcer leans into) per band, and a
     backward hip counter — this IS the spine curve, authored as per-ring z/x shifts. */
  const leanZ = (t) => 0.16 * t * t;      // t=0 at hip, 1 at head: quadratic forward push
  const hipBackX = -0.02;                  // hips settle slightly back off center as counterweight

  /* ---------- LEGS — front leg (left, +x) bent and planted forward taking full weight;
     rear leg (right, -x) trailing straighter behind, toe still grounded. ---------- */
  {
    // FRONT leg: hip -> knee (bent forward) -> ankle/foot, weight-bearing
    const hipF = V(0.10 + hipBackX, L.hipY, -0.02);
    const kneeF = V(0.155, 0.19, 0.155);
    const footF = V(0.14, 0.03, 0.20);
    tube(hipF, kneeF, 0.095, 0.078, 6, P.coatDk, {capA:{hex:P.coat}});
    tube(kneeF, footF, 0.078, 0.062, 6, P.coatDk, {capB:{hex:P.hatBand, lift:0.015}});

    // REAR leg: hip -> knee (slight bend) -> ankle/foot, trailing behind
    const hipR = V(-0.11 + hipBackX, L.hipY, -0.04);
    const kneeR = V(-0.145, 0.16, -0.14);
    const footR = V(-0.13, 0.03, -0.24);
    tube(hipR, kneeR, 0.088, 0.072, 6, P.coatDk, {capA:{hex:P.coat}});
    tube(kneeR, footR, 0.072, 0.058, 6, P.coatDk, {capB:{hex:P.hatBand, lift:0.015}});
  }

  /* ---------- TORSO — heavyset barrel, buttoned coat straining across the gut, following
     the forward C-curve. Wide ribcage, thick waist (no taper — the "bigger meaner" read). --- */
  {
    const n = 8, ph = Math.PI / 8;
    /* R2: torso, neck and head are now ONE continuous ring chain (no separate disconnected
       shells) so there is never a void gap between shoulders and skull. */
    const bands = [
      { y: L.hipY,   rx: 0.185, rz: 0.170, hex: P.coatDk, lean: 0.00 },
      { y: L.waistY, rx: 0.215, rz: 0.200, hex: P.coat,   lean: 0.10 },   // the gut push
      { y: L.ribY,   rx: 0.225, rz: 0.195, hex: P.coatLt, lean: 0.18 },
      { y: L.chestY, rx: 0.220, rz: 0.190, hex: P.coat,   lean: 0.24 },
      { y: L.shldY,  rx: 0.235, rz: 0.185, hex: P.coat,   lean: 0.28 },   // rolled-forward shoulders, widest
      { y: L.neckY,  rx: 0.135, rz: 0.125, hex: P.skinDk, lean: 0.31 },   // neck taper, thick bull-neck
    ];
    const rings = bands.map(b => ring(V(hipBackX, b.y, leanZ(b.lean) + b.lean), V(0, 1, 0), b.rx, b.rz, n, ph));
    stitch(rings, (i) => bands[i].hex);

    /* strained coat lapels pulling open at the belly — pale shirt wedge showing through,
       brass buttons under visible tension (the signature).
       R3 GEOMETRY FIX (critic pass 2): the r1-r4 renders buried this whole panel — the old
       z-offsets (~0.21-0.22) sat 0.15-0.2u BEHIND the actual coat-ring front surface at these
       bands (waist front=0.30, rib front=0.38, chest front=0.44; measured from the ring
       center+rz), so the signature was fully occluded inside the torso shell every render.
       ALSO the quad's vertex winding pointed -z (away from the +x/+z dimetric camera), so
       even at the right depth it would have been backface-culled. Fixed both: pushed the
       panel proud of the true front surface (+0.02u clearance) and reversed the winding
       order (a,b,c,d -> b,a,d,c) so the normal now points +z toward the camera/key light.
       R3b: +0.02 clearance still under-cleared (vertex-snap noise). Widened to +0.08 — verified
       via an offline camera/occlusion probe that this is geometrically unoccluded and correctly
       wound, yet still rendered under the law-3 140 floor (~90-110). Root cause: the panel's
       slant made its face normal tilt slightly -Y (top pushed more forward than bottom), which
       DOT-PRODUCTS AGAINST the key light's dominant +Y component (light at (5,9,7) — Y=9 is the
       biggest term) and starves it of light.
       R3c: flipped the slant — the WAIST (bottom) now pushes further forward than the CHEST
       (top). Double win: (1) more correct "gut push" read for an overweight heavy (the belly
       is the proudest point, not the sternum), (2) tilts the face normal +Y into the key light.
       R3d: measured after R3c — still ~90-124, short of 140. This engine's diffuse response to
       a modest +Y tilt (dot~0.71) is weaker than a naive Lambert estimate predicts, so rather
       than keep reverse-engineering the exact curve, went further and MEASURED: pushed the tilt
       much steeper (near-45 degrees, dot-with-key ~0.85+) and widened the panel so it's the
       dominant chest read, not a sliver. Buttons now ride the same steep plane, each carrying
       a matching internal tilt so no individual button is flatter than the panel around it. */
    quad(V(0.10, L.chestY + 0.04, 0.50), V(-0.10, L.chestY + 0.04, 0.50),
         V(-0.10, L.waistY - 0.03, 0.72), V(0.10, L.waistY - 0.03, 0.72), P.shirt, 0.035);
    const buttonZc = [0.685, 0.626, 0.566];   // steep gut-flare plane, same slope as the shirt panel
    const buttonT = [0.05, 0.13, 0.21];
    for (let bi = 0; bi < buttonT.length; bi++) {
      const t = buttonT[bi];
      const y = L.waistY + t * (L.chestY - L.waistY) / 0.24;
      const zc = buttonZc[bi];
      // enlarged to clear the law-3 0.04u feature floor (was 0.032x0.028, dissolved at 1/3-res);
      // each button carries its own slight forward-tilt (matches the panel's plane) so it isn't
      // flatter/dimmer than the shirt it's stitched to.
      quad(V(-0.024, y - 0.022, zc + 0.013), V(0.024, y - 0.022, zc + 0.013),
           V(0.020, y + 0.022, zc - 0.013), V(-0.020, y + 0.022, zc - 0.013), P.brass, 0.045);
    }
    /* coat hem riding up off the hips from the gut push — a short flared skirt, gapping open */
    quad(V(-0.20, L.hipY - 0.02, leanZ(0) - 0.14), V(0.20, L.hipY - 0.02, leanZ(0) - 0.14),
         V(0.24, L.hipY - 0.14, leanZ(0) - 0.10), V(-0.24, L.hipY - 0.14, leanZ(0) - 0.10), P.coatDk, 0.04);
  }

  /* ---------- HEAD — heavy jowled, dropped forward bull-like between rolled shoulders,
     hat-brim shadow, no eyes (frontier faceless-thug convention), hard flat mouth-line. --- */
  {
    const n = 8, ph = Math.PI / 8;
    /* R2 fix: this MUST match the head-top band's own z (leanZ(0.34)+0.34) — an earlier,
       unrelated formula here put the hat/face features ~0.32u away from the actual head,
       reading as a floating disconnected hat (the r2 render bug). */
    const headLean = leanZ(0.34) + 0.34;
    /* R2: chain starts at the SAME neck ring position/center used to close the torso stitch
       above (y=L.neckY, lean=0.31) so the head is welded to the torso, not a floating shell. */
    const bands = [
      { y: L.neckY,        rx: 0.135, rz: 0.125, hex: P.skinDk, lean: 0.31 },
      { y: L.headY - 0.02, rx: 0.155, rz: 0.145, hex: P.skin,   lean: 0.33 },   // jowly widest point
      { y: L.headY + 0.07, rx: 0.125, rz: 0.118, hex: P.skinDk, lean: 0.34 },
    ];
    const rings = bands.map(b => ring(V(hipBackX, b.y, leanZ(b.lean) + b.lean), V(0, 1, 0), b.rx, b.rz, n, ph));
    stitch(rings, (i) => bands[i].hex);

    /* hat-brim shadow band across the upper face */
    quad(V(-0.12, L.headY + 0.005, headLean + 0.125), V(0.12, L.headY + 0.005, headLean + 0.125),
         V(0.10, L.headY + 0.06, headLean + 0.115), V(-0.10, L.headY + 0.06, headLean + 0.115), P.skinDk, 0.03);
    /* hard flat mouth-line */
    quad(V(-0.05, L.headY - 0.075, headLean + 0.13), V(0.05, L.headY - 0.075, headLean + 0.13),
         V(0.04, L.headY - 0.088, headLean + 0.135), V(-0.04, L.headY - 0.088, headLean + 0.135), P.coatDk, 0.04);

    /* low flat-brim hat, tipped forward with the lean */
    const hb0 = ring(V(hipBackX, L.headY + 0.10, headLean), V(0, 1, 0), 0.155, 0.145, n, ph);
    const hb1 = ring(V(hipBackX, L.headY + 0.155, headLean), V(0, 1, 0), 0.115, 0.108, n, ph);
    stitch([hb0, hb1], () => P.hat);
    capFan(hb1, V(hipBackX, L.headY + 0.22, headLean), P.hat);
    const brimN = 10;
    for (let i = 0; i < brimN; i++) {
      const a = (i / brimN) * Math.PI * 2, a2 = ((i + 1) / brimN) * Math.PI * 2;
      const rIn = 0.15, rOut = 0.25;
      const y0 = L.headY + 0.11 + Math.max(0, Math.cos(a)) * 0.03;
      const y1 = L.headY + 0.11 + Math.max(0, Math.cos(a2)) * 0.03;
      quad(V(hipBackX + Math.cos(a) * rIn, y0, headLean + Math.sin(a) * rIn - 0.02),
           V(hipBackX + Math.cos(a) * rOut, y0 - 0.01, headLean + Math.sin(a) * rOut - 0.02),
           V(hipBackX + Math.cos(a2) * rOut, y1 - 0.01, headLean + Math.sin(a2) * rOut - 0.02),
           V(hipBackX + Math.cos(a2) * rIn, y1, headLean + Math.sin(a2) * rIn - 0.02), P.hatBand, 0.05);
    }
  }

  /* ---------- ARMS — shoulders ride with the raised club arm (POSE-ANATOMY law 3): the
     club-arm shoulder lifts and the near shoulder tilts up toward the action, elbow bent
     ~110°, club tapping down toward the open off-hand palm held low-and-forward. ---------- */
  {
    const shBase = leanZ(0.28) + 0.19;
    /* R3 GEOMETRY FIX (critic pass 2): the old wrist z's (shBase+0.24/+0.22 = ~0.42-0.44) sat
       almost exactly FLUSH with the torso's own front surface at these heights (shoulder/chest
       front measures 0.44-0.48), so the club+off-hand tap read as embedded in the coat, not a
       gesture projecting out in front of the body — no silhouette break, no pose read. Pushed
       both wrists well proud of the torso front, and pushed the club elbow further out in x
       (beyond the shoulder ring's own 0.235 max radius) so the bent arm pokes past the torso
       outline (POSE-ANATOMY law 3: a visible elbow, not swallowed by the torso silhouette). */
    /* CLUB ARM (right side, -x): shoulder raised, elbow bent sharply, club cocked overhead-
       forward, mid-tap toward the off-hand. */
    const shC = V(-0.185, L.shldY + 0.03, shBase - 0.01);
    const elC = V(-0.30, L.shldY + 0.15, shBase + 0.13);
    const wrC = V(-0.15, L.shldY + 0.23, shBase + 0.40);
    tube(shC, elC, 0.062, 0.052, 6, P.coat, { capA: { hex: P.coatDk } });
    tube(elC, wrC, 0.052, 0.040, 6, P.coat, { capB: { hex: P.skin, lift: 0.012 } });
    /* the club, gripped, angled down toward the off-hand */
    const clubTip = V(wrC.x + 0.11, wrC.y - 0.16, wrC.z + 0.05);
    tube(wrC, clubTip, 0.026, 0.044, 6, P.club, { capB: { hex: P.clubDk } });
    /* brass knuckle-band on the club grip — the high-value glint */
    quad(V(wrC.x - 0.028, wrC.y - 0.02, wrC.z), V(wrC.x + 0.028, wrC.y - 0.02, wrC.z),
         V(wrC.x + 0.022, wrC.y + 0.024, wrC.z + 0.02), V(wrC.x - 0.022, wrC.y + 0.024, wrC.z + 0.02), P.brass, 0.03);

    /* OFF-HAND ARM (left side, +x): bent, palm raised low-and-forward to receive the tap,
       elbow bent ~120°, brass-knuckled fist. */
    const shO = V(0.19, L.shldY, shBase - 0.02);
    const elO = V(0.27, L.chestY + 0.02, shBase + 0.10);
    const wrO = V(0.17, L.chestY + 0.10, shBase + 0.36);
    tube(shO, elO, 0.060, 0.050, 6, P.coat, { capA: { hex: P.coatDk } });
    tube(elO, wrO, 0.050, 0.040, 6, P.coat, { capB: { hex: P.skin, lift: 0.012 } });
    /* fist block */
    quad(V(wrO.x - 0.032, wrO.y - 0.03, wrO.z), V(wrO.x + 0.032, wrO.y - 0.03, wrO.z),
         V(wrO.x + 0.028, wrO.y + 0.032, wrO.z + 0.02), V(wrO.x - 0.028, wrO.y + 0.032, wrO.z + 0.02), P.skinDk, 0.035);
    /* brass knuckle-duster across the fist (enlarged to clear the law-3 0.04u floor on both axes) */
    quad(V(wrO.x - 0.036, wrO.y + 0.012, wrO.z + 0.018), V(wrO.x + 0.036, wrO.y + 0.012, wrO.z + 0.018),
         V(wrO.x + 0.030, wrO.y + 0.055, wrO.z + 0.035), V(wrO.x - 0.030, wrO.y + 0.055, wrO.z + 0.035), P.brass, 0.03);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
