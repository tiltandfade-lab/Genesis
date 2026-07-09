/* dev/model-qa/creatures/rlm-frontier-peryton.js — PERYTON landmark table (WINGED/AVIAN family
   per docs/ANATOMY-CANON.md's WINGED + AVIAN stub, Medium, CR 2, realm frontier), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, frontier-w2 cell 6, port 5336).
   Core identity: the antlered vulture-thing that casts the shadow of its next victim — a
   STAG-HEADED RAPTOR. Whole-object grammar: one function, one geometry frame, no anchors.
   Spine +z, ground y=0. Bestiary: "a carrion-lean bird of prey wearing a stag's skull like a
   crown, gliding low enough that its shadow finds you before its talons do."

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. WINGED/AVIAN body (docs/ANATOMY-CANON.md §WINGED, AVIAN stub) — keel-chested raptor
        torso, wing = arm-analog bone chain (shoulder->humerus->radius->wrist), flight surface =
        overlapping RIGID FEATHER-BLADE tubes fanning from the wrist (never a spanned bat/dragon
        membrane — the giant-vulture r2 correction's grammar, reused here deliberately).
     2. SIGNATURE — the antler rack: a countable stag rack (4 tines/side, forking pairs) rising
        off a stag skull, pale bone against the dark plumage, the single tallest/brightest thing
        in the silhouette (law 3's >=140 RGB zone lives here, not on the body).
     3. SIGNATURE (paired) — the half-flared wing spread: both wings swept wide and slightly back
        (braking, not mantled/folded), primary blades fanned open so the wingspan reads as the
        second-loudest silhouette break after the rack.
     4. Stag head (not a bird head) — long deer-like muzzle, dark deer eyes, short fur-toned snout
        on a raptor-feathered neck transition — the "antlered raptor" hybrid read, not a plain
        bird skull with horns glued on.
     5. Dropped talons — clawed raptor feet hanging loose below the body (not perched/planted),
        legs drawn up slightly, toes curled open, mid-stoop.
     6. Dark plumage body (near-black brown) against pale antlers + pale talons — the law-3
        contrast ladder, doubled at both ends of the silhouette (crown and feet).

   POSE SENTENCE: the stoop-threat — body pitched forward and slightly nose-down as if braking
   out of a dive, both wings swept half-flared and back (not fully spread, not folded), talons
   dropped loose below the drawn-up legs, the antlered stag head lowered and thrust forward past
   the chest to gore, neck curving down out of hunched shoulders to meet it.

   SPINE-GESTURE SENTENCE: one continuous forward-down C-curve — tail low and back, rising through
   a hunched, forward-pitched chest/shoulder mass, then reversing DOWN through the neck to a head
   carried BELOW the shoulder line and pushed forward of the chest (never a plumb vertical spine);
   the half-flared wings continue the gesture outward from the hunched shoulders, sweeping back in
   the same direction the tail points, so the whole figure reads as one arrested-dive line.

   Imported by ps1-sheet.html (SETS['frontier-w2'], cell 6, fn buildPeryton). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPeryton(){
  /* ---------- PALETTE (near-black brown plumage body vs. pale bone rack + pale talons — the
     law-3 contrast ladder doubled at crown and feet). ---------- */
  /* R2 SELF-CORRECTION (post r1 capture): r1's plume/blade/hide register (lum ~35-55) landed
     under the law-3 60-RGB body-mass floor over the (10,9,8) void — the render showed only the
     antler rack + talon dots, with the whole body/wing mass merged into black. Lifted the whole
     plumage/blade/hide ladder a full step brighter (matching the giant-vulture R4 correction's
     register) so the body clears >=60 RGB on every channel while staying well under the pale
     antler/talon zone (preserving the law-3 contrast the antlers need to still read loudest). */
  const P = {
    plume:0x6e5c46, plumeDk:0x483a2c, plumeLt:0x8c785e,     /* dark plumage body — lifted clear of the void */
    blade:0x4a3c2c, bladeLt:0x6e5c46,                         /* wing feather-blades, lifted clear + a lit edge tone */
    spar:0x2e241a,
    hide:0x5e4632, hideDk:0x3c2c1e,                           /* stag muzzle/snout hide, short-fur toned, lifted */
    antler:0xd8c9a0, antlerDk:0xa8916a,                       /* pale rack — the >=140 RGB signature */
    eye:0x0e0a06,
    hoofClaw:0xc9baa0, hoofClawDk:0x9a8a6c,                   /* pale talons — the paired contrast zone */
    disc:0x2a2118, discTop:0x342a1e,
  };

  /* ---------- LANDMARKS — mid-stoop, body pitched forward, hip HIGHER than the dropped feet -- */
  const HIP = V(0, 0.62, -0.06);       /* haunch root, pulled back per the C-curve */
  const SHOULDER = V(0, 0.72, 0.10);   /* hunched, pushed forward */
  const NECK_BASE = V(SHOULDER.x, SHOULDER.y-0.02, SHOULDER.z+0.05);
  const HEAD = V(0, 0.50, 0.42);       /* well below the shoulder line, pushed forward */

  /* ---------- BODY — hunched forward-leaning loft, tail low/back -> chest forward, continuing
     the spine-gesture C-curve (giant-vulture r2-correction pattern, reused deliberately). ------ */
  stack([
    {y:HIP.y-0.06,      rx:0.095, rz:0.115, cz:-0.06, hex:P.plumeDk},  /* tail root — low, pulled BACK */
    {y:HIP.y+0.10,      rx:0.130, rz:0.155, cz:-0.02, hex:P.plume},
    {y:SHOULDER.y-0.06, rx:0.150, rz:0.175, cz:0.04,  hex:P.plume},    /* keel chest — widest, forward */
    {y:SHOULDER.y+0.06, rx:0.120, rz:0.140, cz:0.08,  hex:P.plumeDk},  /* hunched shoulders, tipped fwd */
  ], 8, {capBot:{hex:P.plumeDk, lift:0.02}});

  /* ---------- TAIL FAN — dark feather blades off the rear, cheap secondary read -------------- */
  {
    const root = V(0, HIP.y-0.04, -0.16);
    for(const t of [-0.05, -0.018, 0.018, 0.05]){
      const tip = V(t*1.3, HIP.y-0.10, -0.34);
      tube(root, tip, 0.017, 0.004, 4, P.plumeDk, {capB:{hex:P.plumeDk}});
    }
  }

  /* ---------- DROPPED LEGS + TALONS — drawn up slightly then hanging loose below the body, mid-
     stoop (never perched/planted flat — law 5's "high-expression moment"). ------------------- */
  for(const s of [-1, 1]){
    const hip  = V(s*0.075, HIP.y-0.02, HIP.z+0.06);
    const knee = V(s*0.085, HIP.y-0.20, HIP.z+0.14);    /* drawn up, tucked toward the body */
    const hock = V(s*0.075, HIP.y-0.38, HIP.z+0.10);    /* hanging loose */
    const foot = V(s*0.065, HIP.y-0.54, HIP.z+0.16);
    tube(hip, knee, 0.034, 0.026, 6, P.hide);
    tube(knee, hock, 0.024, 0.018, 6, P.hideDk);
    tube(hock, foot, 0.018, 0.013, 6, P.hideDk, {capB:{hex:P.hideDk}});
    /* 3 forward talons + 1 back talon, curled open (not planted) */
    for(const t of [-0.032, 0, 0.032]){
      tube(foot, V(foot.x+t, foot.y-0.05, foot.z+0.05), 0.012, 0.004, 4, P.hoofClaw, {capB:{hex:P.hoofClaw}});
    }
    tube(foot, V(foot.x, foot.y-0.03, foot.z-0.05), 0.011, 0.004, 4, P.hoofClawDk, {capB:{hex:P.hoofClawDk}});
  }

  /* ---------- NECK + STAG HEAD — feathered neck transitions to a fur-hide deer muzzle; head
     carried lower than the shoulders, pushed forward, gaze down toward the gore-target. -------- */
  {
    const mid = V(0, SHOULDER.y-0.10, 0.24);
    tube(NECK_BASE, mid, 0.058, 0.048, 6, P.plumeDk);
    tube(mid, HEAD, 0.046, 0.036, 6, P.hide);

    /* stag skull — a tapering wedge (skull->muzzle continuous, per the ungulate-head lesson) */
    const n=8, ph=Math.PI/n;
    const bands = [
      {y:HEAD.y-0.026, rx:0.036, rz:0.052, hex:P.hide},
      {y:HEAD.y+0.006, rx:0.044, rz:0.062, hex:P.hideDk},   /* brow/crown — antler root platform */
      {y:HEAD.y+0.024, rx:0.030, rz:0.038, hex:P.hide},
    ];
    const rings = bands.map(b=>ring(V(HEAD.x,b.y,HEAD.z), V(0,1,0), b.rx, b.rz, n, ph));
    /* push the front verts forward into the long deer muzzle before the nose tip */
    for(const i of [1,2]){ rings[0][i].z += 0.09; }
    for(const i of [1,2]){ rings[1][i].z += 0.035; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(HEAD.x, HEAD.y-0.03, HEAD.z+0.14), P.hideDk);   /* muzzle/nose cap */

    /* dark deer eyes, offset toward the down-canted gaze */
    for(const s of [-1,1]){
      const e = V(HEAD.x+s*0.032, HEAD.y+0.012, HEAD.z+0.03);
      tube(e, V(e.x, e.y, e.z+0.006), 0.009, 0.009, 5, P.eye);
    }

    /* ---------- ANTLER RACK — SIGNATURE. Pale, forking, 4-tine countable rack per side, rising
       off the brow crown; each tine a real 3D tube (never a sliver) so it reads front/side/3q. */
    const ROOT = V(HEAD.x, HEAD.y+0.03, HEAD.z-0.01);
    function rack(s){
      const base = V(ROOT.x+s*0.03, ROOT.y, ROOT.z);
      const beam1 = V(base.x+s*0.02, base.y+0.10, base.z-0.02);
      const beam2 = V(base.x+s*0.03, base.y+0.20, base.z-0.06);
      const beamTop = V(base.x+s*0.02, base.y+0.30, base.z-0.10);
      tube(base, beam1, 0.020, 0.016, 5, P.antlerDk);
      tube(beam1, beam2, 0.016, 0.012, 5, P.antler);
      tube(beam2, beamTop, 0.012, 0.006, 5, P.antler, {capB:{hex:P.antler}});
      /* forking tines off the main beam — 3 side tines + the beam tip = 4 tines/side, countable */
      const tineRoots = [beam1, V(beam1.clone().lerp(beam2,0.5).x,beam1.clone().lerp(beam2,0.5).y,beam1.clone().lerp(beam2,0.5).z), beam2];
      const tineDirs = [[0.10,0.14,0.02], [0.09,0.16,-0.02], [0.08,0.13,-0.06]];
      tineRoots.forEach((r,i)=>{
        const d = tineDirs[i];
        const tip = V(r.x+s*d[0], r.y+d[1], r.z+d[2]);
        tube(r, tip, 0.011, 0.004, 4, P.antler, {capB:{hex:P.antler}});
      });
    }
    rack(-1); rack(1);
  }

  /* ---------- WINGS — HALF-FLARED (swept wide and back, braking mid-stoop — not mantled/folded).
     Bird-family flight surface: overlapping RIGID FEATHER-BLADE tubes fanning from the wrist, per
     the AVIAN stub (never a spanned bat/dragon membrane). --------------------------------------- */
  const SH = V(0, SHOULDER.y-0.01, SHOULDER.z-0.04);
  function wing(s, sweepDeg){
    const sw = sweepDeg*Math.PI/180;
    const WS = 0.56;    /* R2 SELF-CORRECTION: r1's 0.70 pushed the fan off-frame/off-camera and
                            read as a thin stick; pulled the span in so the whole half-flare stays
                            in the auto-framed bbox and reads as one filled fan, not a spar. */
    /* humerus angles out-and-slightly-down, elbow bends the radius BACK (braking sweep), wrist
       riding wide and low-back rather than high like a mantle. */
    const EL = V(s*0.20*WS, SH.y - 0.02*WS, SH.z - Math.sin(sw)*0.30*WS);
    const WR = V(s*0.42*WS, SH.y - 0.10*WS, SH.z - Math.sin(sw)*0.62*WS);
    tube(SH, EL, 0.048, 0.038, 6, P.spar, {capA:{hex:P.plumeDk}});
    tube(EL, WR, 0.036, 0.026, 6, P.spar);
    /* thumb claw hooking off the wrist */
    tube(WR, V(WR.x+s*0.03*WS, WR.y+0.03*WS, WR.z+0.02*WS), 0.012, 0.004, 5, P.spar, {capB:{hex:P.spar, lift:0.01}});

    /* PRIMARY FEATHER BLADES — 7 blades, overlapping (tips packed close, half-spread apart), so
       the fan reads as one continuous filled shape at 1/3-res, spread WIDE outward+back (the
       half-flare) rather than draped down toward the spine (that's the mantle grammar, not this). */
    const blades = [
      V(WR.x + s*0.34*WS, WR.y + 0.14*WS, WR.z - 0.06*WS),    /* leading — outward, slight lift */
      V(WR.x + s*0.42*WS, WR.y + 0.06*WS, WR.z - 0.14*WS),
      V(WR.x + s*0.46*WS, WR.y - 0.02*WS, WR.z - 0.22*WS),    /* widest point of the flare */
      V(WR.x + s*0.44*WS, WR.y - 0.10*WS, WR.z - 0.30*WS),
      V(WR.x + s*0.38*WS, WR.y - 0.17*WS, WR.z - 0.37*WS),
      V(WR.x + s*0.28*WS, WR.y - 0.22*WS, WR.z - 0.43*WS),    /* trailing — sweeps back */
      V(WR.x + s*0.15*WS, WR.y - 0.24*WS, WR.z - 0.47*WS),    /* innermost — tucks toward the flank */
    ];
    const bladeHex = [P.bladeLt, P.blade, P.bladeLt, P.blade, P.plume, P.plumeDk, P.plumeDk];
    blades.forEach((tip, i)=>{
      tube(WR, tip, 0.046, 0.034, 4, bladeHex[i], {capB:{hex:P.plumeDk}});
    });

    /* COVERT LAYER — a shorter trailing feather stack along the forearm backfilling the wedge
       between the primary fan and the torso, so the half-flare reads as one filled mass. */
    for(const f of [0.35, 0.65]){
      const covertBase = EL.clone().lerp(WR, f);
      const covertTip = V(covertBase.x + s*0.16*WS, covertBase.y - 0.05*WS, covertBase.z - 0.16*WS);
      tube(covertBase, covertTip, 0.030, 0.020, 4, f<0.5 ? P.plumeLt : P.plume, {capB:{hex:P.plumeDk}});
    }
  }
  wing(+1, 58);
  wing(-1, 50);   /* asymmetric sweep angle breaks the at-attention symmetry per law 5 */

  /* ---------- BASE DISC ------------------------------------------------------------------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.34, 0.34, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.32, 0.32, 16);
    stitch([r1, r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
