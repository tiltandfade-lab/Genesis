/* dev/model-qa/creatures/rlm-gloom-raven.js — the RAVEN (gloom, Tiny beast, CR 1/4), authored
   under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot, gloom-w2).
   Core identity: a carrier-crow of a coven, its beak sewn shut around a secret. Bespoke chassis
   authored to the raven's own identity — realm reskins ride this narratively.

   ANATOMY — WINGED/AVIAN (docs/ANATOMY-CANON.md): keeled breast block, wings fold HIGH against
   the back (folded default per the WINGED family rules), but here half-lifted for the spring —
   hand fused, flight surface = a stack of overlapping rigid feather blades along the arm (NOT a
   bat membrane fan). Thin scaled legs, perched grip (not a standing/walking stance).

   FEATURE CHECKLIST (the ~1.1-1.4k budget buys):
     1. AVIAN perch anatomy — keeled breast block leaning forward, thin scaled legs with a
        3-toe-forward/1-toe-back grip curling over the perch lip (anatomy chief criterion: reads
        as a bird gripping a branch, not standing on flat feet).
     2. Wings HALF-LIFTED about to spring — both wings raised off the back at a shared launch
        angle, primary feather-blades fanned open at the tips (law 5: the pre-flight coil, never
        folded-flat-asleep).
     3. Head cocked HARD sideways, one eye fixed forward on the viewer — the "appraising" gloom-
        raven read, off-axis from the body's forward lean.
     4. SIGNATURE — the sewn beak: pale X-stitches (crossed thread quads) running across the
        closed bill, the high-value zone sitting right on the signature (law 3/4). The secret it
        carries, stitched shut.
     5. Glossy black plumage body vs the pale stitch/eye-glint value contrast — body reads dark-
        on-void except the stitches and one cocked eye carrying the light (law 3).
     6. A short fanned tail dropped low behind, countering the forward lean/wing-lift for a
        balanced pre-launch silhouette break.

   POSE SENTENCE: perched forward-lean with the tail dropped low for counterbalance, both wings
   half-lifted and coiled to spring, the head snapped hard sideways to fix one eye dead on the
   viewer — a bird one heartbeat from launch, not at rest.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 3). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';

export function buildRaven(){
  /* ---------- PALETTE (VS-desaturated glossy black plumage; pale stitch/eye value payload) ---------- */
  const P = {
    // R1 SELF-CORRECTION: v1 tones (0x201d22/0x141216/0x38333a) were only ~20-45 RGB steps above
    // the void clear color (0x0a0908) — dither + 1/3-res dissolved the whole body into the dark,
    // leaving only the pale stitches and a shapeless streak (law-3 failure, same class as the
    // vampire-spawn v1 coat). Lifted to a slate-value band (matching the specter/vampire-spawn
    // fix) so the body still reads glossy-black-on-void but clears the void by a wide margin.
    plum:0x38323e, plumDk:0x28232c, plumLt:0x504a58,   // glossy black-blue body plumage
    sheen:0x6a6276,                                     // faint blue-sheen highlight band
    beak:0x2a2420, beakDk:0x161310,                     // dark horn bill
    stitch:0xf2e8d2,                                    // SIGNATURE — pale sewn-thread X-stitches (R2: brightened)
    eye:0x0c0a09, eyeGlint:0xd8c48c,                    // dark socket + pale cocked-eye glint
    leg:0x322a24, legDk:0x1e1814, claw:0x100d0b,        // scaled legs / dark talons
    perch:0x2a221a, perchDk:0x1a140f,                   // the branch stub it grips
    disc:0x352c22, discTop:0x413528,
  };
  setChannels({
    [P.plum]:'fur', [P.plumDk]:'fur', [P.plumLt]:'fur', [P.sheen]:'fur',
    [P.beak]:'bone', [P.beakDk]:'bone',
    [P.leg]:'scale', [P.legDk]:'scale', [P.claw]:'bone',
    [P.perch]:'wood', [P.perchDk]:'wood',
  });

  /* ---------- LANDMARKS — Tiny perched bird, forward lean, spine driving up+forward off the
     grip point. All heights measured off y=0 (the base disc / perch top). ---------- */
  const GRIP = V(0, 0.115, 0.010);                       // where the feet grip the perch lip
  const L = {
    tailY:0.145, rumpY:0.185, bellyY:0.235, breastY:0.300, shldY:0.330, neckY:0.345,
    jawY:0.350, cheekY:0.375, browY:0.395, crownY:0.410,
  };

  /* ---------- PERCH — a short dark branch stub the feet curl over ---------- */
  {
    const pb = V(-0.16, 0.100, -0.02), pt = V(0.20, 0.108, 0.03);
    tube(pb, pt, 0.038, 0.032, 6, P.perch, { capA:{ hex:P.perchDk }, capB:{ hex:P.perchDk } });
  }

  /* ===== BODY — keeled breast block leaning forward, tail dropped low behind for counterbalance
     (the ungulate/canine stack() workhorse, angled). cz grows toward the breast (forward lean),
     then the neck pulls back UP toward the cocked head root. ===== */
  const torsoRings = stack([
    { y:L.tailY,   rx:0.052, rz:0.075, cz:-0.075, hex:P.plumDk },
    { y:L.rumpY,   rx:0.088, rz:0.100, cz:-0.020, hex:P.plum },
    { y:L.bellyY,  rx:0.100, rz:0.105, cz:0.030,  hex:P.plum },
    { y:L.breastY, rx:0.092, rz:0.115, cz:0.088,  hex:P.plumLt },   // keeled breast — pushed forward
    { y:L.shldY,   rx:0.075, rz:0.090, cz:0.070,  hex:P.plum },
    { y:L.neckY,   rx:0.042, rz:0.048, cz:0.055,  hex:P.plumDk },
  ], 8, { capBot:{ hex:P.plumDk, lift:0.01 } });

  /* faint blue-sheen highlight strip along the back, catching what little light there is */
  quad(V(-0.028, L.bellyY+0.030, -0.010), V(0.028, L.bellyY+0.030, -0.010),
       V(0.022, L.shldY+0.020,   0.060),  V(-0.022, L.shldY+0.020,  0.060), P.sheen, 0.05);

  /* ===== HEAD — cocked HARD sideways off the neck root, one eye fixed forward. Gaunt small
     bands rotated on their own local X-offset rather than the body's forward-Z lean, so the
     cock reads as a distinct turn away from the torso's axis. ===== */
  const HEAD = V(0.058, L.crownY + 0.010, 0.100);   // cocked +x (bird's right), pulled slightly up
  const headRings = stack([
    { y:L.jawY,   rx:0.052, rz:0.058, cx:HEAD.x*0.35, cz:0.075, hex:P.plum },
    { y:L.cheekY, rx:0.062, rz:0.066, cx:HEAD.x*0.70, cz:0.088, hex:P.plumLt },
    { y:L.browY,  rx:0.058, rz:0.062, cx:HEAD.x*0.95, cz:0.096, hex:P.plum },
    { y:L.crownY, rx:0.044, rz:0.048, cx:HEAD.x,      cz:0.090, hex:P.plumDk },
  ], 8, { capTop:{ hex:P.plumDk, lift:0.012 } });

  /* sunken dark eye sockets with one bright cocked-eye glint (the appraising read) — both
     placed, but the near-side (bird's right, facing the viewer) carries the visible glint */
  for(const s of [-1, 1]){
    const ex = HEAD.x + s*0.052, ey = L.browY - 0.006, ez = HEAD.z + 0.030;
    blob(ex, ey, ez, 0.016, 0.016, 0.013, P.eye, 6, 4);
  }
  blob(HEAD.x + 0.052, L.browY - 0.006, HEAD.z + 0.036, 0.006, 0.006, 0.006, P.eyeGlint, 4, 2);

  /* ===== BEAK — a thin dark wedge projecting forward off the cocked head, closed and sewn shut
     (never open/gaping — the secret stays in). ===== */
  const beakBase = V(HEAD.x, L.jawY + 0.008, HEAD.z + 0.058);
  const beakTip  = V(HEAD.x, L.jawY - 0.010, HEAD.z + 0.145);
  tube(beakBase, beakTip, 0.026, 0.006, 5, P.beak, { capB:{ hex:P.beakDk } });
  /* lower mandible sliver, closed tight against the upper */
  quad(V(HEAD.x-0.016, L.jawY-0.006, HEAD.z+0.062), V(HEAD.x+0.016, L.jawY-0.006, HEAD.z+0.062),
       V(HEAD.x+0.005, L.jawY-0.016, HEAD.z+0.128), V(HEAD.x-0.005, L.jawY-0.016, HEAD.z+0.128),
       P.beakDk, 0.04);

  /* ===== SIGNATURE — the sewn beak: pale X-stitches crossing the closed bill, the loud
     value-contrast payload sitting right on the beak (law 3/4).
     R2 SELF-CORRECTION (critic pass): v-r2 tube radius was 0.008 = 0.016u diameter — well UNDER
     the ~0.04u law-3 feature floor, which is why the signature measured far dimmer/smaller than
     the medusa/vampire-spawn passes (peak lum 133 vs 148/179, lit-pixel count 6-15x smaller).
     Thickened to 0.022 radius (0.044u diameter, clears the floor) and lifted the color so the
     stitches actually read as the loud payload the law calls for. */
  {
    const stitchAt = (t, w) => {
      const cx = beakBase.x + (beakTip.x - beakBase.x) * t;
      const cy = beakBase.y + (beakTip.y - beakBase.y) * t;
      const cz = beakBase.z + (beakTip.z - beakBase.z) * t;
      const a = V(cx - w, cy + 0.017, cz - 0.007);
      const b = V(cx + w, cy - 0.017, cz + 0.007);
      const c = V(cx + w, cy + 0.017, cz - 0.007);
      const d = V(cx - w, cy - 0.017, cz + 0.007);
      tube(a, b, 0.022, 0.022, 4, P.stitch, { capA:{hex:P.stitch}, capB:{hex:P.stitch} });
      tube(c, d, 0.022, 0.022, 4, P.stitch, { capA:{hex:P.stitch}, capB:{hex:P.stitch} });
    };
    stitchAt(0.28, 0.022);
    stitchAt(0.50, 0.019);
    stitchAt(0.70, 0.015);
  }

  /* ===== WINGS — the READ: both HALF-LIFTED, coiled to spring, launch-angle shared. Bird
     anatomy per ANATOMY-CANON: hand fused, flight surface = overlapping rigid feather blades
     stacked along the arm (radiating tube "blades", not a spanned membrane fan). Root off the
     shoulder band, well up the torso. ===== */
  {
    const wing = (s) => {
      const sh = V(s*0.070, L.shldY - 0.010, 0.040);
      const el = V(s*0.175, L.shldY + 0.075, -0.010);   // elbow lifted up+out — the launch coil
      const wr = V(s*0.235, L.shldY + 0.140, -0.075);   // wrist further up — half-lifted, not full spread
      tube(sh, el, 0.048, 0.036, 6, P.plum);
      tube(el, wr, 0.034, 0.024, 6, P.plumDk);
      /* primary feather-blades fanned open off the wrist — 4 overlapping rigid blades, splayed.
         R1 SELF-CORRECTION: v1 blade radii (0.022->0.006) thinned below the ~0.04u feature floor
         well before the tip, so the fan dissolved into the single streak seen in r1 — thickened
         throughout (kept near-uniform longer) so each blade survives 1/3-res as a distinct mass.
         R2 SELF-CORRECTION (critic pass): even thickened, the 4 tips only diverged in y/z — nearly
         identical x offsets stacked them collinear from the capture camera, so the whole fan still
         projected as ONE thin stick (measured: no wing-mass silhouette, just a line). Spread the x
         offsets too (0.145s->0.055s, a real fan radiating in three axes, not two) and lifted two of
         the four blades onto the brighter sheen tone so the coiled fan carries its own value pop
         instead of blending into the plum-on-plum body. */
      /* R2-B SELF-CORRECTION (critic pass, round 2): the first widen still read as one stick — the
         4 tips were still graduated smoothly along a shared trajectory (near-parallel lines offset
         from each other), which occludes into a single mass at this camera's oblique angle no
         matter the thickness. Replaced with a genuine wide-angle burst: blade 1 swept sharply UP
         (steep vertical break from the arm line), blade 2 pushed hard LATERAL (the widest reach,
         nearly level — the point that breaks collinearity with the arm's rising diagonal), blade 4
         swept sharply DOWN-BACK (opposite extreme from blade 1) — >90 degrees of spread tip-to-tip
         instead of a graduated fan, so silhouette gains real height+width at the wrist, not length. */
      const blades = [
        V(wr.x + s*0.075, wr.y + 0.145, wr.z + 0.060),
        V(wr.x + s*0.185, wr.y + 0.010, wr.z + 0.040),
        V(wr.x + s*0.130, wr.y - 0.065, wr.z - 0.050),
        V(wr.x + s*0.040, wr.y - 0.140, wr.z - 0.130),
      ];
      const bladeHex = [P.sheen, P.plumLt, P.sheen, P.plumDk];
      blades.forEach((tip, i) => {
        tube(wr, tip, 0.038, 0.022, 4, bladeHex[i], { capB:{ hex:P.plumDk } });
      });
      /* secondary covert blades along the forearm (elbow->wrist run), shorter, trailing edge */
      const covertBase = el.clone().lerp(wr, 0.5);
      const covertTip = V(covertBase.x + s*0.065, covertBase.y - 0.055, covertBase.z - 0.055);
      tube(covertBase, covertTip, 0.026, 0.012, 4, P.plumDk, { capB:{ hex:P.plumDk } });
    };
    wing(1); wing(-1);
  }

  /* ===== TAIL — short fanned tail dropped low behind, countering the forward lean/wing-lift
     for a balanced pre-launch silhouette. 3 flat feather blades fanning out from the rump. ===== */
  {
    const root = V(0, L.tailY - 0.005, -0.085);
    const feathers = [
      V(-0.045, L.tailY - 0.045, -0.220),
      V(0,      L.tailY - 0.060, -0.235),
      V(0.045,  L.tailY - 0.045, -0.220),
    ];
    feathers.forEach((tip, i) => {
      tube(root, tip, 0.028, 0.012, 4, i === 1 ? P.plumDk : P.plumLt, { capB:{ hex:P.plumDk } });
    });
  }

  /* ===== LEGS — thin scaled legs, feet gripping the perch lip (3-toe-forward/1-toe-back). ===== */
  for(const s of [-1, 1]){
    const hip  = V(s*0.028, L.bellyY - 0.015, 0.020);
    const knee = V(s*0.038, 0.175, 0.010);
    const foot = V(s*0.032, GRIP.y + 0.010, GRIP.z + s*0.02);
    tube(hip, knee, 0.020, 0.013, 5, P.leg);
    tube(knee, foot, 0.013, 0.009, 5, P.legDk);
    /* three forward toes curling down over the perch + one back toe */
    const toesFwd = [[-0.024, -0.018, 0.038], [0, -0.022, 0.048], [0.024, -0.018, 0.038]];
    for(const [dx,dy,dz] of toesFwd)
      tube(foot, V(foot.x+dx, foot.y+dy, foot.z+dz), 0.008, 0.003, 3, P.claw, { capB:{ hex:P.claw } });
    tube(foot, V(foot.x, foot.y-0.016, foot.z-0.032), 0.008, 0.003, 3, P.claw, { capB:{ hex:P.claw } });
  }

  /* base disc — shared module, seats the perch/grip on the tile (Tiny: parts.js buildBase is
     Medium r=0.42 — override with a tighter Tiny disc instead of the shared default) */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.26, 0.26, 14);
    const r2 = ring(V(0,0.045,0), V(0,1,0), 0.24, 0.24, 14);
    stitch([r1,r2], () => P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
