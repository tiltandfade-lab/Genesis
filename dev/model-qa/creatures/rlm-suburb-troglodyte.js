/* dev/model-qa/creatures/rlm-suburb-troglodyte.js — the TROGLODYTE landmark table (HUMANOID-
   REPTILE family, Medium, CR 1/4, realm suburb), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (2026-07-08 foundry pilot, suburb-w1 cell 2). Core identity: something
   low and scaled that keeps pace just past the fence line — a shoulder here, a tail there, gone
   before you turn fully toward it. Bespoke to the render key "troglodyte".

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. STOOPED HUMANOID-REPTILE spine — a deep C-curve crouch, hips low, torso pitched forward
        and down, never a plumb vertical column (POSE-ANATOMY law 1: the spine curve authored
        FIRST, limbs hang off its line).
     2. SIGNATURE — a skull frill and a running spine crest: a fanned frill off the back of the
        skull plus a descending line of crest spikes rump-to-neck, pale-edged against the dark
        scale body (law 4's one loud exaggerated feature).
     3. Mid-creep asymmetric stance: the RIGHT leg reaches forward-planted, the LEFT leg trails
        back bent, and (contrapposto counter) the LEFT arm reaches down with its clawed hand
        touching the ground while the RIGHT arm counter-bends up-and-back — never a symmetric
        squared crouch (POSE-ANATOMY law 2/4: every joint bends 100-150deg, shoulders ride the
        reaching arm, hips/shoulders counter-tilt).
     4. Head swiveled SIDEWAYS off the neck to stare at the viewer while the body still reads as
        moving forward along the fence line — the high-expression completing beat at the head
        (law 5), not a level neutral stare.
     5. Pale belly-scale strip down the chest/underbelly — the high-value zone law 3 needs, set
        against the dark olive-grey body so it reads as a strip of light in the dark.
     6. Clawed 3-finger hands + clawed feet, a short stub tail for the reptile read, and a dull
        yellow-green glowing eye pair.

   POSE SENTENCE: caught mid-creep along a fence line — hips dropped into a deep crouch, spine
   bowed forward in one continuous C-curve from tail to skull, right leg planted forward and
   left trailing back, left clawed hand pressed flat to the ground for balance while the right
   arm counter-bends up behind the shoulder, and the head twisted hard sideways off the moving
   body to fix the viewer with a stare — never a resting squat or a level forward face.

   SPINE-GESTURE SENTENCE: one C-curve running tail-stub -> low hip -> forward-bowed back ->
   raised shoulder -> a neck that kinks and twists sideways into the turned head, so the trace
   hip->shoulder->skull reads as a single swept arc, not a plumb line.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['suburb-w1'], cell 2, fn buildTroglodyte). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTroglodyte(){
  /* ---------- PALETTE (VS-desaturated suburb register: dull olive-grey scale body low-value,
     pale belly-strip + pale frill/crest edges the two high-value zones law 3 needs). ---------- */
  const P = {
    scale: 0x545c48, scaleDk: 0x363c2e, scaleLt: 0x676f56,   // olive-grey hide, dark-vs-void ok
    belly: 0xc8bc8c, bellyDk: 0xa2986c,                        // pale belly strip, the value spine
    frill: 0xd4c894, frillDk: 0x9c9066,                        // pale-edged frill/crest, the signature
    claw: 0x201d16, mouth: 0x1a1611, tongue: 0x6e2f2a,
    eye: 0x14110c, eyeGlow: 0xb8c468,
    disc: 0x3a352a, discTop: 0x453f32,
  };

  /* ===== SPINE — deep C-curve crouch: low hip, forward-bowed back, raised shoulder, kinked
     neck twisting sideways into the turned head. Author FIRST per POSE-ANATOMY law 1. ===== */
  const S = {
    tailBase: V(-0.01, 0.16, -0.30),
    hip:      V(0.00, 0.22, -0.14),
    loin:     V(0.02, 0.30,  0.00),
    back:     V(0.05, 0.40,  0.10),
    shldr:    V(0.06, 0.50,  0.14),
    neckLo:   V(0.08, 0.56,  0.15),
    neckHi:   V(0.16, 0.60,  0.13),   // kink starts turning sideways (+x)
  };
  tube(S.tailBase, S.hip,  0.135, 0.150, 8, P.scaleDk, {phase:Math.PI/8, capA:{hex:P.scaleDk, lift:0.02}});
  tube(S.hip,      S.loin, 0.150, 0.158, 8, P.scale,   {phase:Math.PI/8});
  tube(S.loin,     S.back, 0.158, 0.148, 8, P.scaleLt, {phase:Math.PI/8});
  tube(S.back,     S.shldr,0.148, 0.128, 8, P.scale,   {phase:Math.PI/8});
  tube(S.shldr,    S.neckLo,0.100, 0.078, 7, P.scaleDk,{phase:Math.PI/7});
  tube(S.neckLo,   S.neckHi,0.078, 0.062, 6, P.scale,  {phase:Math.PI/6});

  /* pale belly-scale strip riding the underside of the crouch (chest -> hip) */
  {
    const rungs = [
      {c:S.hip,  r:0.150}, {c:S.loin, r:0.158}, {c:S.back, r:0.148},
    ];
    for(const {c,r} of rungs){
      const w = r*0.70, h = r*0.55;
      quad(V(c.x-w, c.y-h, c.z-0.02), V(c.x+w, c.y-h, c.z-0.02),
           V(c.x+w*0.75, c.y-h*0.15, c.z-0.06), V(c.x-w*0.75, c.y-h*0.15, c.z-0.06), P.belly, 0.04);
    }
  }

  /* ===== SPINE CREST — descending line of crest spikes rump -> neck, pale-edged, the running
     half of the frill+crest signature. ===== */
  {
    const crestPts = [S.tailBase, S.hip, S.loin, S.back, S.shldr, S.neckLo];
    const crestR   = [0.135, 0.150, 0.158, 0.148, 0.100, 0.078];
    for(let i=0;i<crestPts.length;i++){
      const c = crestPts[i], r = crestR[i];
      const root = V(c.x, c.y + r*0.55, c.z - r*0.10);
      const tip  = V(c.x, c.y + r*1.55, c.z - r*0.20);
      tube(root, tip, 0.020, 0.004, 4, P.frillDk, {capB:{hex:P.frill, lift:0.006}});
    }
  }

  /* ===== HEAD — swiveled sideways (+x) off the kinked neck to stare at the viewer while the
     body reads as moving forward. Wedge skull, frill fanned off the back. ===== */
  const headC = V(0.24, 0.62, 0.12);   // center, offset hard sideways off the spine line
  {
    const n = 8, ph = Math.PI/n;
    const bands = [
      {y:headC.y-0.03, cx:headC.x-0.02, cz:headC.z+0.04, rx:0.075, rz:0.090, hex:P.scale},
      {y:headC.y+0.03, cx:headC.x,      cz:headC.z+0.02, rx:0.088, rz:0.100, hex:P.scaleLt},
      {y:headC.y+0.09, cx:headC.x+0.01, cz:headC.z-0.02, rx:0.072, rz:0.080, hex:P.scaleDk},
    ];
    const rings = bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(headC.x+0.01, headC.y+0.14, headC.z-0.02), P.scaleDk);

    /* snout projecting toward the viewer (+x turn, slight +z forward) */
    const snB = V(headC.x+0.05, headC.y-0.01, headC.z+0.09);
    const snT = V(headC.x+0.20, headC.y-0.03, headC.z+0.14);
    tube(snB, snT, 0.058, 0.022, n, P.scale, {raz:0.066, rbz:0.026, phase:ph, capB:{hex:P.mouth, lift:0.006}});
    /* jaw line + open mouth gap */
    quad(V(headC.x+0.02, headC.y-0.045, headC.z+0.10), V(headC.x+0.02, headC.y-0.045, headC.z+0.02),
         V(headC.x+0.19, headC.y-0.06,  headC.z+0.10), V(headC.x+0.19, headC.y-0.06,  headC.z+0.02), P.mouth, 0.03);
    tube(V(headC.x+0.10, headC.y-0.05, headC.z+0.06), V(headC.x+0.19, headC.y-0.06, headC.z+0.07), 0.010, 0.004, 4, P.tongue, {capB:{hex:P.tongue}});

    /* eyes — dull glow pair, set to face the viewer's sideways stare */
    for(const dz of [0.05, -0.03]){
      const ex = headC.x + 0.055, ey = headC.y + 0.055, ez = headC.z + dz*0.6 + 0.03;
      quad(V(ex-0.014, ey+0.012, ez), V(ex+0.014, ey+0.012, ez),
           V(ex+0.012, ey-0.012, ez), V(ex-0.012, ey-0.012, ez), P.eye, 0.02);
      quad(V(ex-0.006, ey+0.006, ez+0.004), V(ex+0.006, ey+0.006, ez+0.004),
           V(ex+0.005, ey-0.006, ez+0.004), V(ex-0.005, ey-0.006, ez+0.004), P.eyeGlow, 0.05);
    }

    /* fanned skull frill — the loud pale-edged signature, splayed CLOSE against the back of the
       skull like a lizard's neck-frill (not floating antennae). R2 SELF-CORRECTION (post r1
       engine render): r1's frill tips read as four thin disconnected spikes hovering above the
       head — shrunk the reach ~45%, widened each fan panel into a solid pale wedge instead of a
       tube-tipped stick, and pulled the whole fan down/back flush against the skull crown so it
       reads as one continuous frill silhouette merged with the head mass. */
    {
      const root = V(headC.x-0.01, headC.y+0.09, headC.z-0.02);
      const spread = [
        {dx:-0.06, dy:0.07, dz:-0.07}, {dx:-0.01, dy:0.10, dz:-0.10},
        {dx:0.05,  dy:0.09, dz:-0.09}, {dx:0.10,  dy:0.06, dz:-0.05},
      ];
      for(let i=0;i<spread.length;i++){
        const d = spread[i];
        const tip = V(root.x+d.dx, root.y+d.dy, root.z+d.dz);
        /* wide diamond-shaped panel: root -> side A -> tip -> side B, pale panel over a dark rim */
        const perp = V(-d.dz, 0.02, d.dx);
        const w = 0.028;
        const sideA = V(root.x + d.dx*0.5 + perp.x*w, root.y + d.dy*0.5 + perp.y*w, root.z + d.dz*0.5 + perp.z*w);
        const sideB = V(root.x + d.dx*0.5 - perp.x*w, root.y + d.dy*0.5 - perp.y*w, root.z + d.dz*0.5 - perp.z*w);
        quad(root, sideA, tip, sideB, P.frill, 0.05);
        quad(root, sideB, tip, sideA, P.frillDk, 0.04);
      }
    }
  }

  /* ===== LEGS — mid-creep asymmetric crouch. Right forward-planted, left trailing back, each
     knee bent ~110-140deg per POSE-ANATOMY law 2. ===== */
  {
    /* right leg — forward, weight-bearing plant */
    const rHip  = V(0.13, 0.24, -0.02);
    const rKnee = V(0.20, 0.11,  0.14);
    const rFoot = V(0.15, 0.03,  0.30);
    tube(rHip, rKnee, 0.075, 0.055, 6, P.scale);
    tube(rKnee, rFoot, 0.055, 0.032, 6, P.scaleDk, {capB:{hex:P.scaleDk, lift:0.005}});
    for(const [dx,dz] of [[0.03,0.06],[0,0.075],[-0.03,0.06]]){
      tube(V(rFoot.x,0.03,rFoot.z), V(rFoot.x+dx,0.006,rFoot.z+dz), 0.013, 0.004, 3, P.claw, {capB:{hex:P.claw, lift:0.003}});
    }
    /* left leg — trailing back, deeper bend */
    const lHip  = V(-0.13, 0.24, -0.06);
    const lKnee = V(-0.21, 0.10, -0.24);
    const lFoot = V(-0.12, 0.03, -0.36);
    tube(lHip, lKnee, 0.075, 0.055, 6, P.scaleLt);
    tube(lKnee, lFoot, 0.055, 0.032, 6, P.scaleDk, {capB:{hex:P.scaleDk, lift:0.005}});
    for(const [dx,dz] of [[0.03,-0.06],[0,-0.075],[-0.03,-0.06]]){
      tube(V(lFoot.x,0.03,lFoot.z), V(lFoot.x+dx,0.006,lFoot.z+dz), 0.013, 0.004, 3, P.claw, {capB:{hex:P.claw, lift:0.003}});
    }
  }

  /* ===== ARMS — left reaches down, clawed hand flat on the ground (balance); right counter-
     bends up-and-back off the raised shoulder (POSE-ANATOMY law 3: shoulders ride the arm).
     Both elbows visibly bent, never a dead-straight segment (law 2). ===== */
  {
    const clawHand = (wrist, dir, hex) => {
      for(const s of [-0.6, 0, 0.6]){
        const side = V(-dir.z, 0, dir.x).multiplyScalar(s*0.022);
        const mid = wrist.clone().addScaledVector(dir, 0.03).add(side);
        const tip = wrist.clone().addScaledVector(dir, 0.06).add(side.clone().multiplyScalar(1.3));
        tube(wrist, mid, 0.017, 0.012, 4, hex);
        tube(mid, tip, 0.012, 0.004, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
    };
    /* left arm — reaches down-forward, hand touching the ground */
    const lSh = V(-0.15, 0.52, 0.13);
    const lEl = V(-0.24, 0.32, 0.20);   // elbow bends outward, ~120deg
    const lWr = V(-0.17, 0.04, 0.28);   // wrist near ground plane
    tube(lSh, lEl, 0.052, 0.040, 6, P.scaleLt);
    tube(lEl, lWr, 0.040, 0.026, 6, P.scale, {capB:{hex:P.scale, lift:0.004}});
    clawHand(lWr, new THREE.Vector3(0.15, -0.35, 0.92).normalize(), P.scale);

    /* right arm — counter-bends up and back off the raised shoulder */
    const rSh = V(0.14, 0.53, 0.13);
    const rEl = V(0.24, 0.62, 0.02);    // elbow raised, ~130deg bend
    const rWr = V(0.20, 0.50, -0.12);
    tube(rSh, rEl, 0.050, 0.038, 6, P.scale);
    tube(rEl, rWr, 0.038, 0.025, 6, P.scaleDk, {capB:{hex:P.scaleDk, lift:0.004}});
    clawHand(rWr, new THREE.Vector3(-0.10, 0.05, -0.99).normalize(), P.scaleDk);
  }

  /* ===== TAIL STUB — short reptile stub off the low hip, dragging just clear of the ground. ===== */
  {
    const t0 = S.tailBase;
    const t1 = V(-0.03, 0.12, -0.46);
    const t2 = V(-0.02, 0.07, -0.58);
    tube(t0, t1, 0.100, 0.060, 6, P.scaleDk, {phase:Math.PI/6});
    tube(t1, t2, 0.060, 0.018, 6, P.scale, {phase:Math.PI/6, capB:{hex:P.scale, lift:0.004}});
  }

  /* base disc (Medium r=0.42) */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2 = ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
