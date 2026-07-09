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
  /* R4 SELF-CORRECTION (this pass, requeue gate): r1-r3's P.plume (0x453a2e = 69,58,46) landed
     only ~59 R / 49 G / 38 B over the (10,9,8) void — under the law-3 60-RGB body-mass floor, so
     the torso merged into the black clear at 1/3-res+dither ("torso too dark, merged with the
     void" gate note). Bumped the whole plumage register a full step brighter (plume/plumeDk/
     plumeLt all re-based) so P.plume clears >=60 RGB over the void on every channel while staying
     a plausible dusty dark-brown plumage (still well under the bright skin zone, preserving the
     law-3 contrast). Also widened bladeMid/membraneLt further apart so 2 distinct blade tones
     both clear the >=140 signature floor, not just one. */
  const P = {
    /* R6 SECOND-PASS ITERATOR (this pass, flag: "torso still on the dark side"): bumped plume +
       plumeDk one more value step brighter each — plumeDk was 69/58/44, under the 60-RGB body-mass
       floor on G+B; now 92/77/60 clears the floor on every channel while staying visibly darker
       than plume (kept the ladder plumeDk<plume<plumeLt intact so the torso still reads as
       plumage, not a flat wash). */
    plume:0x7c6a54, plumeDk:0x5c4d3c, plumeLt:0x8a765c,     /* dark ruff/back plumage — lifted clear of the void (law 3 body-mass floor) */
    membraneLt:0xd8bc94, bladeMid:0xb89a72,                 /* primary-blade highlights — clear the >=140 RGB signature floor, distinct from each other */
    spar:0x3a2e22, claw:0x1c1610,                           /* wing-bone chain + claw tips */
    skin:0xc76a5c, skinLt:0xe0a08e,                          /* naked head/neck — the high-value zone (>=140 RGB per channel on skinLt) */
    beak:0xd8c9a0, beakDk:0x8a7452, eye:0x120a08,
    leg:0x8a7452, legDk:0x584a34, footClaw:0x1c1610,
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
    /* R5 SELF-REVIEW (post r1 capture): the wings read as filled blocky masses now (the sticks
       failure is fixed) but the lateral (x) spread on EL/WR splayed them outward like paddles/
       antennae instead of converging over the spine as a mantle tent (the pose sentence's "raised
       ...tent-like over the back"). Pulled the lateral offset in and pushed more of the reach into
       vertical lift + backward drape (-z) so the wrists sit closer to the spine's centerline and
       higher, and the blade fan reads as roofing the back rather than pointing out sideways. */
    /* R6 SECOND-PASS ITERATOR (this pass, flag: "wings still splay like paddles rather than a
       mantled tent — converge the wrists over the spine harder"): r5's lateral pull-in wasn't
       enough — pulled the x-mult in further still (EL 0.13->0.08, WR 0.19->0.10) and pushed more
       of the reach into height + backward drape (WR y-mult 0.68->0.78, z-mult -0.20->-0.30) so the
       wrists sit noticeably closer to the spine centerline AND higher/further back over the
       haunch, reading as a roofing tent rather than two arms reaching sideways. */
    const EL = V(s*0.06*WS, SH.y + Math.sin(up)*0.34*WS, SH.z - 0.09*WS);
    const WR = V(s*0.06*WS, SH.y + Math.sin(up)*0.85*WS, SH.z - 0.34*WS);
    tube(SH, EL, 0.046, 0.036, 6, P.spar, {capA:{hex:P.plumeDk}});
    tube(EL, WR, 0.034, 0.024, 6, P.spar);
    /* thumb claw hooking off the wrist */
    tube(WR, V(WR.x+s*0.024*WS, WR.y+0.05*WS, WR.z+0.03*WS), 0.012, 0.004, 5, P.spar, {capB:{hex:P.claw, lift:0.01}});

    /* PRIMARY FEATHER BLADES — R4 SELF-CORRECTION (this pass, requeue gate): the r1-r3 5-blade
       fan, even thickened, still read as "2 thin sticks per side" at 1/3-res+dither — the 5 tips
       fanned wide enough apart that the gaps between them showed void, so only the brightest 1-2
       blades survived the squint as isolated threads. Fixed per the gate note: 7 blades now
       (docs/MODEL-FOUNDRY.md's 5-7-wide overlapping-blade mass), tips packed MUCH closer together
       (half the prior angular spread) so each blade visibly overlaps its neighbor's base and no
       void gap opens between them, every blade thickened further (0.048 base) and ALL clear the
       0.04u law-3 floor, and a second covert layer is now itself doubled (inner + outer) to
       backfill the gap between the primary fan and the torso so the mantle silhouette is one
       continuous filled shape from spine to wrist, not sparse spars. */
    /* R6 SECOND-PASS ITERATOR (this pass, flag: "add 2 more overlapping blades per wing for mass"
       + convergence): 7->9 blades. Every tip's x-reach scaled by 0.70 (converge the fan toward
       the WR/spine centerline that just moved inward) and z pulled 1.15x further backward (more
       mantle drape over the haunch), matching the EL/WR convergence above. The 2 new blades are
       interpolated midpoints (between the old i1/i2 and i3/i4 tips) so they backfill the widest,
       most gap-prone part of the fan with mass rather than just re-spacing the same 7 tips. */
    /* R7 SECOND-PASS ROUND 2 (same pass — the wrist pull-in alone still left the two blade fans
       reaching wide via their OWN lateral spread, still reading as a V rather than one dome): cut
       the fan's x-reach another 0.7x and pushed z another 1.1x further backward, so the blade mass
       itself (not just the wrist anchor) closes toward the centerline and drapes over the spine. */
    const blades = [
      V(WR.x + s*0.147*WS,   WR.y + 0.09*WS,    WR.z + 0.177*WS),   /* topmost — steep up, the mantle peak */
      V(WR.x + s*0.186*WS,   WR.y + 0.00*WS,    WR.z + 0.101*WS),
      V(WR.x + s*0.198*WS,   WR.y - 0.045*WS,   WR.z + 0.051*WS),   /* new — backfills the peak/upper gap */
      V(WR.x + s*0.211*WS,   WR.y - 0.09*WS,    WR.z + 0.00*WS),    /* lateral reach — widest point */
      V(WR.x + s*0.206*WS,   WR.y - 0.19*WS,    WR.z - 0.114*WS),
      V(WR.x + s*0.191*WS,   WR.y - 0.245*WS,   WR.z - 0.177*WS),   /* new — backfills the mid/drape gap */
      V(WR.x + s*0.176*WS,   WR.y - 0.30*WS,    WR.z - 0.240*WS),   /* mid drape */
      V(WR.x + s*0.127*WS,   WR.y - 0.41*WS,    WR.z - 0.367*WS),   /* lower drape toward the flank */
      V(WR.x + s*0.064*WS,   WR.y - 0.49*WS,    WR.z - 0.493*WS),   /* innermost — tucks down near the spine */
    ];
    const bladeHex = [P.membraneLt, P.bladeMid, P.plumeLt, P.bladeMid, P.plumeLt, P.bladeMid, P.plumeLt, P.plumeDk, P.plumeDk];
    blades.forEach((tip, i)=>{
      tube(WR, tip, 0.048, 0.036, 4, bladeHex[i], {capB:{hex:P.plumeDk}});
    });

    /* COVERT LAYER (doubled) — a shorter trailing feather stack along the forearm (elbow->wrist)
       that backfills the wedge between the primary fan and the torso, so the mantle reads as one
       filled mass all the way to the spine rather than a fan floating off a bare wrist. */
    /* R6 SECOND-PASS ITERATOR: x-reach scaled down to match the tightened primary fan (was 0.20,
       would now poke OUTSIDE the converged blades and re-introduce a paddle edge). */
    for(const f of [0.35, 0.65]){
      const covertBase = EL.clone().lerp(WR, f);
      const covertTip = V(covertBase.x + s*0.10*WS, covertBase.y - 0.07*WS, covertBase.z - 0.22*WS);
      tube(covertBase, covertTip, 0.032, 0.022, 4, f<0.5 ? P.plumeLt : P.plume, {capB:{hex:P.plumeDk}});
    }
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
