/* dev/model-qa/creatures/rlm-frontier-giant-vulture.js — GIANT VULTURE ("Buzzard-Kin") landmark
   table (WINGED/AVIAN family, Medium, CR 1/2, realm frontier), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry-pilot, frontier-w1 cell 0).
   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z, ground y=0.
   Bestiary: "Buzzard-Kin" — "An unnaturally patient carrion bird the size of a man's torso that's
   learned to circle the living a little early." Standing/perched mini (not airborne — grounded
   loom, not a swoop).

   FEATURE CHECKLIST (the budget buys):
     1. WINGED/AVIAN anatomy (docs/ANATOMY-CANON.md §WINGED, AVIAN family stub) — wing = arm-analog
        bone chain (shoulder->humerus->radius->wrist), flight surface = a stack of OVERLAPPING
        RIGID FEATHER-BLADE tubes fanning from the wrist and along the forearm (never a spanned
        membrane fan — that's the bat/dragon grammar, and the r1 pass wrongly borrowed it).
     2. SIGNATURE — the MANTLED wings: both wings raised tent-like above the back (a real
        vulture threat/claim display, not a symmetric at-attention fold), primary blades
        draping down-and-in toward the spine, brightest blade at the peak catching the light.
     3. SIGNATURE (paired) — the naked pink-red head/neck snaking forward-and-down out of a dark
        feathered ruff collar: the bald skin is the loudest value zone in frame, set directly
        against the darkest plumage (law 3's contrast law, doubled up on the one feature).
     4. Pose = the early-arrival loom (law 5): perched hunch, spine curved forward-down from
        haunches through shoulders, neck craning further forward and DOWN, head eyeing something
        below and ahead of the feet — never an upright at-attention stance.
     5. Hooked beak + small dark eye on the naked skull — cheap, unmistakable carrion-bird tell.
     6. Clawed perching feet, ankle (tarsus) bent, weight forward over the toes — not planted
        flat/square (continues the forward lean into the ground).

   POSE SENTENCE: hunched low on bent perching legs, the spine rolling forward-and-down from
   haunches to hunched shoulders, both wings raised and mantled tent-like over the back, the
   naked head-and-neck craned out past the beak, forward and down, eyeing the not-yet-dead.

   SPINE-GESTURE SENTENCE: one continuous forward-leaning C-curve — tail/haunch low and back,
   arching up through hunched shoulders, then reversing DOWN through the long naked neck to a
   head lower than the shoulders and pushed forward past the feet (never a plumb vertical spine).
   R2 CRITIC CORRECTION (this pass): the torso stack itself now carries the cz sweep (was ~flat,
   the curve lived only in the neck) so the C-curve is genuinely continuous pelvis->skull.

   Imported by ps1-sheet.html (SETS['frontier-w1'], cell 0) and export-obj.mjs. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGiantVulture(){
  /* ---------- PALETTE (frontier dust register; naked head is the deliberate loud outlier) ---- */
  const P = {
    plume:0x453a2e, plumeDk:0x2a221a, plumeLt:0x6b5a45,     /* dark ruff/back plumage — kept clear of the 0x0a0908 void clear so the torso doesn't vanish */
    membraneLt:0xcdb08a, bladeMid:0xa8916e,                 /* primary-blade highlights — 2 blades/wing clear the >=140 RGB floor so the fan reads as a mass, not one thread */
    spar:0x241c16, claw:0x120e0a,                           /* wing-bone chain + claw tips */
    skin:0xc76a5c, skinLt:0xe0a08e,                          /* naked head/neck — the high-value zone (>=140 RGB per channel on skinLt) */
    beak:0xd8c9a0, beakDk:0x8a7452, eye:0x120a08,
    leg:0x8a7452, legDk:0x584a34, footClaw:0x120e0a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — standing perch height, body leaning forward over the feet --------- */
  const STAND = 0.40;                                       /* hip height off the ground */

  /* ---------- LEGS — bent perching stance, tarsus near-vertical, weight forward over toes ---- */
  for(const s of [-1, 1]){
    const hip  = V(s*0.075, STAND+0.02, -0.02);
    const knee = V(s*0.090, STAND-0.13, 0.05);              /* stifle bends forward */
    const hock = V(s*0.085, STAND-0.30, 0.02);              /* tarsus (ankle) — HIGH, backward bend */
    const foot = V(s*0.080, 0.010,      0.10);              /* toes plant forward of the hock */
    tube(hip, knee, 0.036, 0.028, 6, P.leg);
    tube(knee, hock, 0.026, 0.020, 6, P.leg);
    tube(hock, foot, 0.020, 0.016, 6, P.legDk, {capB:{hex:P.legDk}});
    /* 3 forward toe claws + 1 back claw, spread */
    for(const t of [-0.028, 0, 0.028]){
      tube(foot, V(foot.x+t, 0.0, foot.z+0.052), 0.010, 0.003, 4, P.footClaw, {capB:{hex:P.footClaw}});
    }
    tube(foot, V(foot.x, 0.0, foot.z-0.036), 0.009, 0.003, 4, P.footClaw, {capB:{hex:P.footClaw}});
  }

  /* ---------- BODY — hunched forward-leaning loft, pelvis low/back, chest up/forward, shoulders
     hunched high (the spine's first half of the C-curve) ----------------------------------- */
  /* R2 SELF-CORRECTION (critic pass): v-r1 left every band's cz near 0 (only the top band carried
     +0.03) — a near-plumb vertical torso column with the whole forward-down C-curve dumped onto
     the bolted-on neck. That's exactly the POSE-ANATOMY law-1 "mannequin" failure (trace hips->
     shoulders->skull: it read a plumb line while the neck alone "acted"). Gave the torso a real
     cz sweep (haunch pulled BACK -> chest pushed forward -> shoulders hunched further forward)
     so the C-curve is continuous from the tail root through the shoulders, and the neck's own
     forward-down sweep is a continuation of that line, not a separate bent-on part. */
  stack([
    {y:STAND+0.02, rx:0.115, rz:0.130, cz:-0.050, hex:P.plumeDk},  /* haunch / tail root — low, pulled BACK */
    {y:STAND+0.16, rx:0.150, rz:0.170, cz:-0.010, hex:P.plume},
    {y:STAND+0.32, rx:0.165, rz:0.185, cz:0.055,  hex:P.plume},    /* chest — widest, pushed forward */
    {y:STAND+0.46, rx:0.130, rz:0.150, cz:0.095,  hex:P.plumeDk},  /* hunched shoulders, tipped further fwd */
  ], 8, {capBot:{hex:P.plumeDk, lift:0.02}});

  /* ---------- SHORT TAIL FAN — dark feather blades off the rear, cheap secondary read -------- */
  {
    const root = V(0, STAND+0.06, -0.14);
    for(const t of [-0.055, -0.020, 0.020, 0.055]){
      const tip = V(t*1.4, STAND-0.02, -0.30);
      tube(root, tip, 0.018, 0.004, 4, P.plumeDk, {capB:{hex:P.plumeDk}});
    }
  }

  /* ---------- FEATHERED RUFF COLLAR — dark plumage ring at the base of the naked neck, the
     contrast partner the naked skin needs (law 3's ONE feature carrying the contrast, doubled) - */
  const SHOULDER = V(0, STAND+0.50, 0.10);
  {
    const r1 = ring(V(SHOULDER.x, SHOULDER.y, SHOULDER.z), V(0,1,0), 0.100, 0.100, 8);
    const r2 = ring(V(SHOULDER.x, SHOULDER.y+0.055, SHOULDER.z+0.01), V(0,1,0), 0.075, 0.078, 8);
    stitch([r1, r2], (b)=> b===0 ? P.plumeDk : P.plume);
  }

  /* ---------- NECK + HEAD — naked skin, craned forward and DOWN past the ruff (the spine's
     second half, reversing the C-curve down toward what it's eyeing) ------------------------- */
  const NECK_BASE = V(SHOULDER.x, SHOULDER.y+0.05, SHOULDER.z+0.02);
  const HEAD = V(0, STAND+0.30, 0.42);                      /* lower than shoulders, well forward */
  {
    /* naked neck as a tapering tube, curved forward+down via a mid control point */
    const mid = V(0, STAND+0.44, 0.24);
    tube(NECK_BASE, mid, 0.058, 0.046, 6, P.skin);
    tube(mid, HEAD, 0.046, 0.040, 6, P.skin);

    /* small skull, bald, flattened wedge toward the hooked beak */
    const n=8, ph=Math.PI/n;
    const bands = [
      {y:HEAD.y-0.030, rx:0.040, rz:0.048, hex:P.skin},
      {y:HEAD.y+0.006, rx:0.052, rz:0.058, hex:P.skinLt},   /* crown — the loudest value zone */
      {y:HEAD.y+0.034, rx:0.040, rz:0.044, hex:P.skin},
    ];
    const rings = bands.map(b=>ring(V(HEAD.x,b.y,HEAD.z), V(0,1,0), b.rx, b.rz, n, ph));
    /* push the front verts forward into a short face/brow before the beak root */
    for(const i of [1,2]){ rings[1][i].z += 0.026; }
    for(const i of [1,2]){ rings[0][i].z += 0.016; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[2], V(HEAD.x, HEAD.y+0.052, HEAD.z), P.skin);

    /* HOOKED BEAK — pale horn wedge, downturned tip (the carrion-bird tell) */
    const beakBase = V(HEAD.x, HEAD.y-0.006, HEAD.z+0.070);
    const beakTip  = V(HEAD.x, HEAD.y-0.052, HEAD.z+0.118);
    quad(V(beakBase.x-0.024,beakBase.y+0.016,beakBase.z), V(beakBase.x+0.024,beakBase.y+0.016,beakBase.z),
         beakTip, beakTip, P.beak, 0.02);
    quad(V(beakBase.x-0.022,beakBase.y-0.016,beakBase.z), V(beakBase.x+0.022,beakBase.y-0.016,beakBase.z),
         beakTip, beakTip, P.beakDk, 0.02);
    quad(V(beakBase.x-0.024,beakBase.y+0.016,beakBase.z), beakTip, V(beakBase.x-0.022,beakBase.y-0.016,beakBase.z), V(beakBase.x-0.022,beakBase.y-0.016,beakBase.z), P.beakDk, 0.02);
    quad(V(beakBase.x+0.024,beakBase.y+0.016,beakBase.z), beakTip, V(beakBase.x+0.022,beakBase.y-0.016,beakBase.z), V(beakBase.x+0.022,beakBase.y-0.016,beakBase.z), P.beakDk, 0.02);

    /* small dark eye, offset toward the down-canted gaze */
    for(const s of [-1,1]){
      const e = V(HEAD.x+s*0.034, HEAD.y+0.010, HEAD.z+0.036);
      tube(e, V(e.x, e.y, e.z+0.006), 0.010, 0.010, 5, P.eye);
    }
  }

  /* ---------- WINGS — MANTLED (raised tent-like over the back), asymmetric enough to break the
     at-attention symmetry per law 5 while staying a coherent threat-display shape.
     R2 SELF-CORRECTION (critic pass): v-r1 built the flight surface as a bat/dragon strut-fan +
     spanned membrane (explicitly copying mon-bat.js), which contradicts docs/ANATOMY-CANON.md's
     own WINGED family note — "Bird = DIFFERENT: hand fused, flight surface is overlapping rigid
     feathers... a stack of blades along the arm, not a spanned fan." In the render this read as
     bat/dragon wings, not a vulture's mantle, and broke essence. Kept the correct bone chain
     (shoulder->humerus->radius->wrist) but replaced the finger-strut+membrane-bay grammar with
     overlapping rigid feather-blade tubes fanning from the wrist (the rlm-gloom-raven.js AVIAN
     pattern), wide-angle-burst spread (not a collinear graduated fan) so the tips don't project
     into one thin stick, each blade >=0.04u diameter to clear the law-3 floor, draping DOWN and
     IN toward the spine for the mantle roofline. -------------------------------------------- */
  const SH = V(0, STAND+0.42, 0.16);
  function wing(s, raiseDeg){
    const up = raiseDeg*Math.PI/180;
    const WS = 0.62;
    /* humerus angles UP-and-out from the shoulder (the mantle lift), elbow bends the radius
       further up so the wrist rides HIGH above the back — the tent shape. */
    const EL = V(s*0.20*WS, SH.y + Math.sin(up)*0.30*WS, SH.z - 0.02*WS);
    const WR = V(s*0.30*WS, SH.y + Math.sin(up)*0.62*WS, SH.z - 0.10*WS);
    tube(SH, EL, 0.046, 0.036, 6, P.spar, {capA:{hex:P.plumeDk}});
    tube(EL, WR, 0.034, 0.024, 6, P.spar);
    /* thumb claw hooking off the wrist */
    tube(WR, V(WR.x+s*0.024*WS, WR.y+0.05*WS, WR.z+0.03*WS), 0.012, 0.004, 5, P.spar, {capB:{hex:P.claw, lift:0.01}});

    /* PRIMARY FEATHER BLADES — overlapping rigid blades radiating from the wrist in a genuine
       wide-angle burst (each tip diverges in x/y/z, not a graduated collinear sweep), draping
       down and in toward the spine so the silhouette reads as a mantled roofline, not spread
       flight wings. Value ladder: brightest at the peak (catches the light), darkening toward
       the flank where the blade tucks into shadow near the body. */
    const blades = [
      V(WR.x + s*0.34*WS, WR.y + 0.07*WS, WR.z + 0.12*WS),   /* topmost — steep up, the mantle peak */
      V(WR.x + s*0.46*WS, WR.y - 0.08*WS, WR.z + 0.02*WS),   /* lateral reach — widest point */
      V(WR.x + s*0.40*WS, WR.y - 0.26*WS, WR.z - 0.14*WS),   /* mid drape */
      V(WR.x + s*0.24*WS, WR.y - 0.42*WS, WR.z - 0.30*WS),   /* lower drape toward the flank */
      V(WR.x + s*0.08*WS, WR.y - 0.50*WS, WR.z - 0.42*WS),   /* innermost — tucks down near the spine */
    ];
    /* R3 SELF-CORRECTION (same critic pass, second look): tips at radius 0.018 (0.036u diameter)
       fell UNDER the 0.04u law-3 floor and only 1 of 5 blades cleared the value floor, so the fan
       dissolved into one thin bright thread + 4 invisible sticks. Thickened throughout (kept
       near-uniform base->tip, matching the raven exemplar's own R1 fix) and lifted a 2nd blade to
       a bright mid-tone so the mantle reads as a fanned MASS at a squint, not a single feather. */
    const bladeHex = [P.membraneLt, P.bladeMid, P.plumeLt, P.plumeDk, P.plumeDk];
    blades.forEach((tip, i)=>{
      tube(WR, tip, 0.038, 0.030, 4, bladeHex[i], {capB:{hex:P.plumeDk}});
    });

    /* covert blades along the forearm (elbow->wrist run) — a shorter trailing layer under the
       primaries, the "stack of blades along the arm" the AVIAN family stub calls for. */
    const covertBase = EL.clone().lerp(WR, 0.5);
    const covertTip = V(covertBase.x + s*0.16*WS, covertBase.y - 0.10*WS, covertBase.z - 0.16*WS);
    tube(covertBase, covertTip, 0.026, 0.018, 4, P.plumeLt, {capB:{hex:P.plumeDk}});
  }
  wing(+1, 62);    /* right wing — mantled high */
  wing(-1, 50);    /* left wing — mantled, slightly lower (breaks the symmetric at-attention read) */

  /* ---------- BASE DISC ------------------------------------------------------------------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.34, 0.34, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.32, 0.32, 16);
    stitch([r1, r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
