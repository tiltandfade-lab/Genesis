/* dev/model-qa/creatures/rlm-suburb-vrock.js — "The Block Party Ringmaster" landmark table
   (WINGED/AVIAN + HUMANOID-stance hybrid family, Large, CR 7, realm suburb), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, suburb-w1 cell 5).
   Bestiary: "vrock" — "Organizes the annual street party with unnerving precision, down to
   exactly who disappears in the bounce-house line each year." Confetti Spores + Group Photo
   traits confirm the demon dresses the disappearance as a festive ritual.

   FEATURE CHECKLIST (the ~1,600-1,900 budget buys):
     1. WINGED/AVIAN anatomy per ANATOMY-CANON — wing = arm-analog bone chain (shoulder->
        humerus->radius->wrist), flight surface = a stack of 7 OVERLAPPING RIGID FEATHER-BLADE
        tubes fanning from each wrist (the giant-vulture idiom — never a spanned bat/dragon
        membrane, never sparse spars with void gaps between them).
     2. SIGNATURE — the SCREECH-FLARE: both wings thrown WIDE and HIGH (not mantled/folded), a
        threat-display burst rather than a tent, primaries fanned open so the whole upper
        silhouette reads as a wide V of feathers.
     3. Vulture head on a humanoid torso/stance (the vrock's canonical splice) — bald naked-skin
        skull, hooked beak, thrust FORWARD and screeching (jaw dropped, wide).
     4. Spore-crusted chest — pale-to-sickly confetti-colored spore pods studding the sternum and
        collarbone, the high-value zone law 3 needs (a party favor made of poison), set against a
        dark plumage/hide torso.
     5. Humanoid legs planted in a wide talon-gripping stance (bird feet, not human feet) — the
        base the screech-flare pose launches off of.
     6. Clawed hands (talons, not fingers) at the wrist-elbow of each arm-wing junction, gripping
        open — cheap countable tell that this is a predator mid-strike, not a decoration.

   POSE SENTENCE: planted wide on gripping talon feet, spine arched up and back through the
   chest, both wings thrown open to their fullest span and lifted high overhead in a screeching
   threat-flare, head thrust forward and UP off the throat with the beak wide in mid-shriek —
   the loudest possible moment, never a folded/at-rest stance.

   SPINE-GESTURE SENTENCE: one continuous back-arching C-curve from the low, backward-tilted
   pelvis through a pushed-forward chest to a head thrown forward-and-up past the shoulders —
   hips lean back to counterbalance the wings' high overhead mass, shoulders ride UP with the
   raised wings, never a plumb vertical column with the wings bolted on.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['suburb-w1'], cell 5, fn buildVrock). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildVrock(){
  /* ---------- PALETTE (suburb-demon register: dead-lawn/vinyl-siding dark plumage vs. a
     confetti-bright spore chest + naked screaming head — the law-3 high-value pair). ---------- */
  /* R1 SELF-CORRECTION (post r1 engine render): the torso/legs/disc all vanished into the void —
     P.plume(74,64,56) and P.leg(88,74,58) sat right at (or under, on blue) the law-3 60-RGB
     body-mass floor, and the r1 capture confirmed it: torso/legs read as near-black, only the
     wing blades + a stray skin patch survived. Bumped the whole plumage/leg/disc register a full
     step brighter across every channel (still a plausible dusty dark-hide suburb-demon register,
     still clearly under the naked-skin/spore high-value zones) so body mass clears >=60 RGB on
     every channel, and widened skin/skinLt further so the screeching head reads as a coherent
     bright zone instead of an isolated disconnected patch. */
  const P = {
    plume: 0x6c5e4c, plumeDk: 0x453c30, plumeLt: 0x8a7a62,       /* dark hide/plumage torso+wings, lifted clear of the void */
    membraneLt: 0xd0b488, bladeMid: 0x9c8465,                     /* feather-blade highlights, clear the >=140 signature floor */
    spar: 0x342b20, claw: 0x18120c,
    skin: 0xc86a56, skinLt: 0xeaa488,                             /* naked screeching head — the paired high-value zone */
    beak: 0xd8c8a0, beakDk: 0x8c7a58, eye: 0x100a08, eyeGlow: 0xf0d840,
    spore: 0xe8d84a, sporeLt: 0xf6ecb0, sporeDk: 0x9a7a1e,        /* confetti-bright spore pods — loudest chest color */
    leg: 0x6c5c48, legDk: 0x443a2c, footClaw: 0x18120c,
    disc: 0x4a4438, discTop: 0x565046,
  };

  /* ---------- LANDMARKS ---------- */
  const STAND = 0.46;                                            /* hip height, Large stance */

  /* ---------- LEGS — wide talon-gripping bird-feet stance, weight low, counterposed back into
     the arch (the base the screech-flare launches off of) ---------- */
  for(const s of [-1, 1]){
    const hip  = V(s*0.150, STAND+0.02, -0.03);
    const knee = V(s*0.190, STAND-0.16, 0.10);                   /* stifle bends forward+out */
    const hock = V(s*0.175, STAND-0.34, 0.02);                   /* tarsus, high backward bend */
    const foot = V(s*0.165, 0.010,      0.14);                   /* toes plant forward, wide base */
    tube(hip, knee, 0.058, 0.046, 6, P.leg);
    tube(knee, hock, 0.044, 0.034, 6, P.leg);
    tube(hock, foot, 0.034, 0.026, 6, P.legDk, {capB:{hex:P.legDk}});
    for(const t of [-0.048, 0, 0.048]){
      tube(foot, V(foot.x+t, 0.0, foot.z+0.090), 0.017, 0.005, 4, P.footClaw, {capB:{hex:P.footClaw}});
    }
    tube(foot, V(foot.x, 0.0, foot.z-0.062), 0.015, 0.005, 4, P.footClaw, {capB:{hex:P.footClaw}});
  }

  /* ---------- TORSO — the back-arching C-curve: pelvis low+back, chest pushed forward+up,
     shoulders riding high with the raised wings (POSE-ANATOMY law 3). ---------- */
  const spineCz = { pelvis:-0.045, waist:-0.010, rib:0.045, chest:0.085, shld:0.070 };
  stack([
    {y:STAND+0.02, rx:0.170, rz:0.150, cz:spineCz.pelvis, hex:P.plumeDk},   /* pelvis — low, tilted back */
    {y:STAND+0.20, rx:0.190, rz:0.170, cz:spineCz.waist,  hex:P.plume},
    {y:STAND+0.40, rx:0.215, rz:0.190, cz:spineCz.rib,    hex:P.plumeLt},
    {y:STAND+0.58, rx:0.225, rz:0.195, cz:spineCz.chest,  hex:P.plume},     /* chest — widest, arched forward */
    {y:STAND+0.76, rx:0.185, rz:0.165, cz:spineCz.shld,   hex:P.plumeDk},   /* shoulders — high, riding the wings */
  ], 10, {capBot:{hex:P.plumeDk, lift:0.02}});

  /* ---------- SPORE-CRUSTED CHEST — confetti-bright pods studding the sternum/collarbone,
     the loud secondary value zone against the dark torso plumage. ---------- */
  {
    const spots = [
      V(0.00, STAND+0.66, spineCz.chest+0.16), V(-0.075, STAND+0.60, spineCz.chest+0.14),
      V(0.075, STAND+0.60, spineCz.chest+0.14), V(-0.11, STAND+0.50, spineCz.rib+0.12),
      V(0.11, STAND+0.50, spineCz.rib+0.12), V(-0.04, STAND+0.50, spineCz.rib+0.15),
      V(0.04, STAND+0.50, spineCz.rib+0.15),
    ];
    const hexes = [P.sporeLt, P.spore, P.spore, P.sporeDk, P.sporeDk, P.spore, P.spore];
    spots.forEach((c, i)=>{
      blob(c.x, c.y, c.z, 0.032, 0.034, 0.026, hexes[i], 6, 4);
      blob(c.x, c.y+0.008, c.z+0.014, 0.011, 0.011, 0.009, P.sporeLt, 4, 2);
    });
  }

  /* ---------- HEAD — vulture skull thrust forward and UP off the throat, beak wide in
     mid-shriek (the "screeching" half of the pose sentence). ---------- */
  const NECK_BASE = V(0.00, STAND+0.80, spineCz.shld+0.06);
  const HEAD = V(0.00, STAND+1.04, 0.30);                        /* thrust forward+up, ahead of chest */
  {
    const mid = V(0.00, STAND+0.94, 0.16);
    tube(NECK_BASE, mid, 0.072, 0.058, 6, P.skin);
    tube(mid, HEAD, 0.058, 0.050, 6, P.skin);

    const n=8, ph=Math.PI/n;
    const bands = [
      {y:HEAD.y-0.032, rx:0.052, rz:0.062, hex:P.skin},
      {y:HEAD.y+0.008, rx:0.066, rz:0.074, hex:P.skinLt},        /* crown — the paired loud value zone */
      {y:HEAD.y+0.044, rx:0.052, rz:0.056, hex:P.skin},
    ];
    const rings = bands.map(b=>ring(V(HEAD.x,b.y,HEAD.z), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[1][i].z += 0.034; }
    for(const i of [1,2]){ rings[0][i].z += 0.020; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[2], V(HEAD.x, HEAD.y+0.066, HEAD.z), P.skin);

    /* dark plumage ruff at the neck base — the value contrast partner for the naked head */
    {
      const r1 = ring(V(NECK_BASE.x, NECK_BASE.y-0.01, NECK_BASE.z), V(0,1,0), 0.110, 0.100, 8);
      const r2 = ring(V(NECK_BASE.x, NECK_BASE.y+0.05, NECK_BASE.z+0.01), V(0,1,0), 0.084, 0.078, 8);
      stitch([r1, r2], (b)=> b===0 ? P.plumeDk : P.plume);
    }

    /* WIDE-OPEN BEAK — screeching, not a closed hook: upper mandible cocked UP, lower dropped */
    const beakRoot = V(HEAD.x, HEAD.y-0.004, HEAD.z+0.092);
    const upTip = V(HEAD.x, HEAD.y+0.052, HEAD.z+0.150);
    const lowTip = V(HEAD.x, HEAD.y-0.078, HEAD.z+0.140);
    quad(V(beakRoot.x-0.030,beakRoot.y+0.014,beakRoot.z), V(beakRoot.x+0.030,beakRoot.y+0.014,beakRoot.z), upTip, upTip, P.beak, 0.02);
    quad(V(beakRoot.x-0.026,beakRoot.y-0.010,beakRoot.z), V(beakRoot.x+0.026,beakRoot.y-0.010,beakRoot.z), lowTip, lowTip, P.beakDk, 0.02);
    /* dark open-mouth wedge between the two mandibles, mid-scream */
    quad(V(beakRoot.x-0.020,beakRoot.y+0.006,beakRoot.z+0.01), V(beakRoot.x+0.020,beakRoot.y+0.006,beakRoot.z+0.01),
         V(0, (upTip.y+lowTip.y)/2, (upTip.z+lowTip.z)/2-0.01), V(0, (upTip.y+lowTip.y)/2, (upTip.z+lowTip.z)/2-0.01), P.eye, 0.02);

    for(const s of [-1,1]){
      const e = V(HEAD.x+s*0.042, HEAD.y+0.014, HEAD.z+0.044);
      blob(e.x, e.y, e.z, 0.017, 0.015, 0.013, P.eye, 5, 3);
      blob(e.x, e.y+0.004, e.z+0.010, 0.006, 0.006, 0.006, P.eyeGlow, 4, 2);
    }
  }

  /* ---------- WINGS — the SCREECH-FLARE signature: thrown wide AND high, a threat-burst V,
     not a mantle. Talon-tipped wrist gripping open at the wing/arm junction. ---------- */
  const SH = V(0, STAND+0.72, spineCz.shld+0.10);
  function wing(s){
    const WS = 0.98;                                             /* Large-size wing reach */
    /* humerus angles UP and WIDE-out, elbow lifts further high-and-out so the wrist sits far
       above and to the side of the shoulder — the flared "wide and high" reading. */
    const EL = V(s*0.26*WS, SH.y + 0.30*WS, SH.z - 0.02*WS);
    const WR = V(s*0.46*WS, SH.y + 0.62*WS, SH.z - 0.06*WS);
    tube(SH, EL, 0.070, 0.056, 6, P.spar, {capA:{hex:P.plumeDk}});
    tube(EL, WR, 0.052, 0.038, 6, P.spar);

    /* gripping talon at the wrist junction — open, mid-strike, not folded */
    for(const t of [-0.028, 0.028]){
      const dir = V(s*0.032, -0.06, 0.05*(t>0?1:-1));
      tube(WR, V(WR.x+dir.x, WR.y+dir.y, WR.z+dir.z), 0.018, 0.006, 4, P.claw, {capB:{hex:P.claw}});
    }

    /* PRIMARY FEATHER BLADES — 7 overlapping rigid blades fanning WIDE from the wrist, tips
       packed close so neighbors visibly overlap (no void gap between them per the giant-vulture
       gate lesson), spread OUTWARD-and-UP for the flare rather than draping down toward the
       spine (the mantle grammar this is deliberately NOT using). */
    const blades = [
      V(WR.x + s*0.10*WS, WR.y + 0.46*WS, WR.z - 0.02*WS),   /* topmost — steepest, the flare peak */
      V(WR.x + s*0.24*WS, WR.y + 0.42*WS, WR.z - 0.06*WS),
      V(WR.x + s*0.38*WS, WR.y + 0.34*WS, WR.z - 0.10*WS),
      V(WR.x + s*0.48*WS, WR.y + 0.22*WS, WR.z - 0.14*WS),   /* lateral reach — widest point */
      V(WR.x + s*0.52*WS, WR.y + 0.08*WS, WR.z - 0.16*WS),
      V(WR.x + s*0.48*WS, WR.y - 0.06*WS, WR.z - 0.16*WS),
      V(WR.x + s*0.38*WS, WR.y - 0.18*WS, WR.z - 0.14*WS),   /* lowest — still above shoulder height */
    ];
    const bladeHex = [P.membraneLt, P.bladeMid, P.plumeLt, P.bladeMid, P.plumeLt, P.bladeMid, P.plumeDk];
    blades.forEach((tip, i)=>{
      tube(WR, tip, 0.052, 0.038, 4, bladeHex[i], {capB:{hex:P.plumeDk}});
    });

    /* COVERT LAYER — a shorter secondary feather stack along the forearm backfilling the wedge
       between the primary fan and the shoulder, so the flare reads as one filled mass. */
    for(const f of [0.35, 0.65]){
      const covertBase = EL.clone().lerp(WR, f);
      const covertTip = V(covertBase.x + s*0.18*WS, covertBase.y + 0.16*WS, covertBase.z - 0.10*WS);
      tube(covertBase, covertTip, 0.034, 0.024, 4, f<0.5 ? P.plumeLt : P.plume, {capB:{hex:P.plumeDk}});
    }
  }
  wing(+1);
  wing(-1);

  /* ---------- BASE DISC ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2 = ring(V(0,0.05,0),  V(0,1,0), 0.40, 0.40, 16);
    stitch([r1, r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
