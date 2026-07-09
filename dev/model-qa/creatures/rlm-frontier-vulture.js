/* dev/model-qa/creatures/rlm-frontier-vulture.js — VULTURE ("Range Buzzard") landmark table
   (WINGED/AVIAN family, Medium, CR 1/4, realm frontier), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry-pilot, frontier-w1 cell 6). Whole-object grammar: one function,
   one geometry frame, no anchors. Spine +z, ground y=0.
   Bestiary: "Range Buzzard" — "An honest, unremarkable carrion bird — except it's started
   following specific people days before they die." Core identity = ORDINARY carrion bird, the
   smaller sibling of Buzzard-Kin (rlm-frontier-giant-vulture.js) — must read as the SAME species
   scaled down: same naked-head-in-dark-ruff signature, same digitigrade perching leg, same
   strut-skeleton wing grammar — just leaner, lighter, and posed differently (patient sidle, not
   a threat mantle).

   FEATURE CHECKLIST (the budget buys):
     1. WINGED/AVIAN anatomy (docs/ANATOMY-CANON.md §WINGED, AVIAN stub) — strut skeleton
        (shoulder->humerus->radius->wrist spar->finger struts), membrane hung BETWEEN/BEHIND the
        struts, trailing edge pulled into concave scallops on the spread wing — never a flat panel.
     2. SIGNATURE — folded-vs-half-open WING ASYMMETRY: the right wing folds Z-back against the
        flank (forearm collapsed, membrane pleated into vertical folds down the side); the left
        wing is held half-open, canted low and out for balance mid-sidle. The asymmetry itself is
        the read (never a mirrored at-attention pair).
     3. SIGNATURE (paired) — naked pink-grey head/neck cocked SIDEWAYS out of a dark ruff collar:
        the bald skin is the loudest value zone, set against the darkest plumage (law 3 contrast),
        and the skull yaws off-axis rather than facing forward.
     4. Pose = the patient wait (law 5): grounded hop-stance mid-sidle — hips rotated, one leg
        planted forward-under, the other trailing back or out mid-step — never a squared stance.
     5. Hooked beak + small dark eye on the naked skull — the carrion-bird tell.
     6. Clawed perching feet, tarsus bent, weight forward over the toes.

   POSE SENTENCE: caught mid-sidle on bent perching legs — hips canted and one foot planted ahead
   of the other — spine curving up through hunched shoulders then twisting to carry the naked
   head cocked hard sideways past the ruff, the near wing folded flat to the flank and the far
   wing held half-open and low, canted out for balance.

   SPINE-GESTURE SENTENCE: a lateral S — low haunch twisted toward the trailing foot, rising and
   rotating through the shoulders, then snapping the neck sideways so the head ends up looking
   off the body's long axis rather than straight ahead (never a plumb vertical spine).

   Imported by ps1-sheet.html (SETS['frontier-w1'], cell 6). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

/* one finger-strut with a claw-dark tip, matching the giant-vulture/mon-bat wing grammar */
function strut(base, tip, r0, r1, hex, claw){
  tube(base, tip, r0, r1, 5, hex, { capB:{ hex:claw, lift:0.010 } });
}

export function buildVulture(){
  /* ---------- PALETTE (frontier dust register, same family as Buzzard-Kin but leaner/duller —
     an ordinary bird, not the unnaturally patient torso-sized cousin) ------------------------ */
  const P = {
    plume:0x4e4232, plumeDk:0x2e2519, plumeLt:0x7a6a51,     /* dark ruff/back plumage, kept clear of 0x0a0908 void */
    membrane:0x2e2519, membraneLt:0xb89c78,                 /* wing membrane — dark shadow, lit dusty-tan top (>=140 floor) */
    spar:0x201810, claw:0x100c08,
    skin:0xb8695b, skinLt:0xfaf2e8,                          /* naked head/neck — the high-value zone.
      pass-2: measured the lit crown facet at only ~0.60x its base color at this angle (the sideways
      cock turns it away from the overhead+forward key), so a merely-brighter pink (0xf0b89c, tried
      first) still landed short on G/B (measured max 146/112/94 — only R cleared 140). Pushed to a
      pale warm pink-grey (still on-brief: bestiary calls the head "naked pink-grey") bright enough
      that all three channels clear the floor even at the same 0.60x ratio. */
    beak:0xd2c396, beakDk:0x836d4c, eye:0x100a08,
    leg:0x7c6a4a, legDk:0x4e422e, footClaw:0x100c08,
    disc:0x443a32, discTop:0x544c40,
  };

  /* ---------- LANDMARKS — leaner stand height than the giant cousin, hips canted for the sidle */
  const STAND = 0.34;

  /* ---------- LEGS — mid-sidle: one foot planted forward-under, the other trailing back-out --- */
  {
    /* right leg (s=+1) — the trailing/back leg, foot pulled back and slightly out */
    const hipR  = V(0.065, STAND+0.02, -0.03);
    const kneeR = V(0.078, STAND-0.11, 0.02);
    const hockR = V(0.074, STAND-0.26, -0.03);
    const footR = V(0.066, 0.010,      -0.11);              /* trails BEHIND, breaking symmetry */
    tube(hipR, kneeR, 0.032, 0.025, 6, P.leg);
    tube(kneeR, hockR, 0.023, 0.018, 6, P.leg);
    tube(hockR, footR, 0.018, 0.014, 6, P.legDk, {capB:{hex:P.legDk}});
    for(const t of [-0.024, 0, 0.024]){
      tube(footR, V(footR.x+t, 0.0, footR.z-0.044), 0.009, 0.003, 4, P.footClaw, {capB:{hex:P.footClaw}});
    }
    tube(footR, V(footR.x, 0.0, footR.z+0.030), 0.008, 0.003, 4, P.footClaw, {capB:{hex:P.footClaw}});

    /* left leg (s=-1) — the planted/forward leg, foot well ahead, taking the weight */
    const hipL  = V(-0.065, STAND+0.02, -0.01);
    const kneeL = V(-0.080, STAND-0.12, 0.09);
    const hockL = V(-0.076, STAND-0.27, 0.06);
    const footL = V(-0.068, 0.010,      0.16);
    tube(hipL, kneeL, 0.034, 0.026, 6, P.leg);
    tube(kneeL, hockL, 0.024, 0.019, 6, P.leg);
    tube(hockL, footL, 0.019, 0.015, 6, P.legDk, {capB:{hex:P.legDk}});
    for(const t of [-0.026, 0, 0.026]){
      tube(footL, V(footL.x+t, 0.0, footL.z+0.048), 0.010, 0.003, 4, P.footClaw, {capB:{hex:P.footClaw}});
    }
    tube(footL, V(footL.x, 0.0, footL.z-0.032), 0.009, 0.003, 4, P.footClaw, {capB:{hex:P.footClaw}});
  }

  /* ---------- BODY — hunched, leaner loft, hips rotated toward the trailing (right) foot so the
     mass carries into the sidle rather than sitting square --------------------------------- */
  stack([
    {y:STAND+0.01, rx:0.095, rz:0.110, hex:P.plumeDk, cx:0.012},   /* haunch — nudged toward trail foot */
    {y:STAND+0.13, rx:0.125, rz:0.142, hex:P.plume,   cx:0.006},
    {y:STAND+0.27, rx:0.138, rz:0.155, hex:P.plume},               /* chest — widest */
    {y:STAND+0.39, rx:0.108, rz:0.126, hex:P.plumeDk, cz:0.02, cx:-0.010}, /* shoulders twist toward planted foot */
  ], 8, {capBot:{hex:P.plumeDk, lift:0.018}});

  /* ---------- SHORT TAIL FAN — dark feather blades, canted with the hip twist -------------- */
  {
    const root = V(0.010, STAND+0.05, -0.12);
    for(const t of [-0.045, -0.016, 0.016, 0.045]){
      const tip = V(root.x + t*1.3, STAND-0.02, -0.25);
      tube(root, tip, 0.015, 0.003, 4, P.plumeDk, {capB:{hex:P.plumeDk}});
    }
  }

  /* ---------- FEATHERED RUFF COLLAR — dark plumage ring at the base of the naked neck -------- */
  const SHOULDER = V(0, STAND+0.42, 0.09);
  {
    const r1 = ring(V(SHOULDER.x, SHOULDER.y, SHOULDER.z), V(0,1,0), 0.084, 0.084, 8);
    const r2 = ring(V(SHOULDER.x, SHOULDER.y+0.046, SHOULDER.z+0.008), V(0,1,0), 0.062, 0.065, 8);
    stitch([r1, r2], (b)=> b===0 ? P.plumeDk : P.plume);
  }

  /* ---------- NECK + HEAD — naked skin, craned forward then COCKED SIDEWAYS (the signature,
     paired with the ruff contrast) — spine's second half twists off-axis instead of just diving
     down, distinguishing this from the giant cousin's straight forward-down crane. ------------ */
  const NECK_BASE = V(SHOULDER.x, SHOULDER.y+0.04, SHOULDER.z+0.02);
  const HEAD = V(-0.115, STAND+0.34, 0.30);                 /* cocked hard to the planted-leg side */
  {
    const mid = V(-0.045, STAND+0.40, 0.20);
    tube(NECK_BASE, mid, 0.048, 0.038, 6, P.skin);
    tube(mid, HEAD, 0.038, 0.033, 6, P.skin);

    const n=8, ph=Math.PI/n;
    const bands = [
      {y:HEAD.y-0.026, rx:0.033, rz:0.040},
      {y:HEAD.y+0.005, rx:0.043, rz:0.049},   /* crown — the widest ring, loudest value zone */
      {y:HEAD.y+0.028, rx:0.033, rz:0.037},
    ];
    /* the head faces sideways (+x-ish) rather than +z — rotate the "forward" push accordingly.
       pass-2 (measured empirically, sample-then-adjust — a theory about which cone face should
       catch the overhead+forward key light [probe-lib key at (5,9,7)] was tried and DISPROVED by
       re-render+pixel-sample: painting the lower expanding face measured DARKER (125) than the
       upper contracting face (146), so the upper face (ring1->ring2, bands[1]) keeps the bright
       hex — geometry-angle tuning here is unreliable blind, so the real fix is the color bump
       above, pushed far enough that even this face's ~0.60 lit-ratio clears the floor on every
       channel, not just R. Kept the crown ring's +z nudge (harmless; didn't change the ratio). */
    const rings = bands.map(b=>ring(V(HEAD.x,b.y,HEAD.z), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[1][i].x -= 0.008; rings[1][i].z += 0.024; }
    for(const i of [1,2]){ rings[0][i].x -= 0.005; rings[0][i].z += 0.014; }
    stitch(rings, b=> b===1 ? P.skinLt : P.skin);
    capFan(rings[2], V(HEAD.x, HEAD.y+0.044, HEAD.z), P.skin);

    /* HOOKED BEAK — pale horn wedge, pointing sideways off the cocked skull */
    const beakBase = V(HEAD.x-0.058, HEAD.y-0.004, HEAD.z+0.028);
    const beakTip  = V(HEAD.x-0.098, HEAD.y-0.040, HEAD.z+0.052);
    quad(V(beakBase.x,beakBase.y+0.013,beakBase.z-0.018), V(beakBase.x,beakBase.y+0.013,beakBase.z+0.018),
         beakTip, beakTip, P.beak, 0.02);
    quad(V(beakBase.x,beakBase.y-0.013,beakBase.z-0.018), V(beakBase.x,beakBase.y-0.013,beakBase.z+0.018),
         beakTip, beakTip, P.beakDk, 0.02);
    quad(V(beakBase.x,beakBase.y+0.013,beakBase.z-0.018), beakTip, V(beakBase.x,beakBase.y-0.013,beakBase.z-0.018), V(beakBase.x,beakBase.y-0.013,beakBase.z-0.018), P.beakDk, 0.02);
    quad(V(beakBase.x,beakBase.y+0.013,beakBase.z+0.018), beakTip, V(beakBase.x,beakBase.y-0.013,beakBase.z+0.018), V(beakBase.x,beakBase.y-0.013,beakBase.z+0.018), P.beakDk, 0.02);

    /* small dark eye, on the outward-facing cheek (the side the head is cocked toward) */
    const e = V(HEAD.x-0.036, HEAD.y+0.008, HEAD.z+0.022);
    tube(e, V(e.x-0.006, e.y, e.z+0.004), 0.009, 0.009, 5, P.eye);
  }

  /* ---------- WINGS — the folded-vs-half-open ASYMMETRY (the core signature). Strut skeleton per
     docs/ANATOMY-CANON §WINGED. Right wing (s=+1, trail side) FOLDS flat to the flank; left wing
     (s=-1, planted side) is HALF-OPEN, canted low and out for balance mid-sidle. ---------------- */
  const SH = V(0, STAND+0.36, 0.11);

  /* folded wing — spar rides HIGH along the topline (docs/ANATOMY-CANON "Folded vs spread": spar
     riding high) rather than dropping down the flank into the void — the fold reads as a raised
     ridge above the back, wingtip extending back past the haunch toward the tail, with pleated
     membrane panels catching light along the ridge's upper edge so it doesn't vanish into the
     dark body (law 3). */
  function wingFolded(s){
    const WS = 0.50;
    const EL = V(s*0.07*WS, SH.y+0.07*WS, SH.z-0.06*WS);            /* elbow riding just above the shoulder */
    const WR = V(s*0.05*WS, SH.y+0.13*WS, SH.z-0.34*WS);            /* wrist HIGH, swept back along the topline */
    tube(SH, EL, 0.038, 0.030, 6, P.spar, {capA:{hex:P.plumeDk}});
    tube(EL, WR, 0.028, 0.021, 6, P.spar);
    /* 3 collapsed finger struts continuing the ridge line back toward/past the tail */
    const F0 = V(WR.x+s*0.02*WS, WR.y+0.03*WS, WR.z-0.16*WS);
    const F1 = V(WR.x+s*0.01*WS, WR.y+0.01*WS, WR.z-0.30*WS);
    const F2 = V(WR.x,           WR.y-0.03*WS, WR.z-0.42*WS);
    strut(WR, F0, 0.019, 0.015, P.spar, P.claw);
    strut(F0, F1, 0.015, 0.012, P.spar, P.claw);
    strut(F1, F2, 0.012, 0.008, P.spar, P.claw);
    /* pleated membrane — narrow vertical-fold panels hanging BELOW the ridge, lit top edge along
       the spar (>=140-floor membraneLt) so the fold reads as a distinct raised shape, not a void */
    const pleats = [[SH,EL],[EL,WR],[WR,F0],[F0,F1]];
    for(const [a,b] of pleats){
      const hang = V((a.x+b.x)/2 + s*0.015*WS, Math.min(a.y,b.y)-0.05*WS, (a.z+b.z)/2);
      quad(a, hang, b, b, P.membrane, 0.03);
      quad(a, b, V((a.x+b.x)/2, (a.y+b.y)/2+0.012, (a.z+b.z)/2), V((a.x+b.x)/2, (a.y+b.y)/2+0.012, (a.z+b.z)/2), P.membraneLt, 0.03);
    }
  }

  /* half-open wing — like the giant cousin's mantle wing but held LOW and OUT (balance, not
     threat-display): humerus angles out with only a shallow lift, wrist rides level with the
     shoulder rather than high above the back, 4 finger struts fan back with scalloped bays. */
  function wingHalfOpen(s){
    const WS = 0.60;
    const outDeg = 42*Math.PI/180;                                /* shallow of a full mantle, but clears the silhouette */
    const EL = V(s*0.22*WS, SH.y + Math.sin(outDeg)*0.22*WS, SH.z - 0.04*WS);
    const WR = V(s*0.42*WS, SH.y + Math.sin(outDeg)*0.34*WS, SH.z - 0.10*WS);
    tube(SH, EL, 0.040, 0.032, 6, P.spar, {capA:{hex:P.plumeDk}});
    tube(EL, WR, 0.030, 0.022, 6, P.spar);
    tube(WR, V(WR.x+s*0.022*WS, WR.y+0.04*WS, WR.z+0.03*WS), 0.011, 0.004, 5, P.spar, {capB:{hex:P.claw, lift:0.009}});

    const F0 = V(WR.x + s*0.36*WS, WR.y - 0.10*WS, WR.z + (0.04 - s*0.06)*WS);
    const F1 = V(WR.x + s*0.40*WS, WR.y - 0.22*WS, WR.z + 0.10*WS);
    const F2 = V(WR.x + s*0.36*WS, WR.y - 0.32*WS, WR.z - 0.08*WS);
    const F3 = V(WR.x + s*0.24*WS, WR.y - 0.38*WS, WR.z - 0.26*WS);
    strut(WR, F0, 0.022, 0.017, P.spar, P.claw);
    strut(WR, F1, 0.019, 0.015, P.spar, P.claw);
    strut(WR, F2, 0.019, 0.015, P.spar, P.claw);
    strut(WR, F3, 0.017, 0.013, P.spar, P.claw);

    const ROOTFORE = V(s*0.05, SH.y+0.02, SH.z+0.07);
    const ROOTAFT  = V(s*0.04, STAND+0.08, -0.13);

    const scallop=(a,b)=>{
      const mid=V((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);
      const chord=Math.hypot(b.x-a.x, b.y-a.y, b.z-a.z) || 0.001;
      const dx=WR.x-mid.x, dy=WR.y-mid.y, dz=WR.z-mid.z;
      const dlen=Math.hypot(dx,dy,dz) || 0.001;
      const pull=chord*0.20;
      return V(mid.x + dx/dlen*pull, mid.y + dy/dlen*pull, mid.z + dz/dlen*pull);
    };
    const bays = [
      [ROOTFORE, F0, scallop(ROOTFORE,F0)],
      [F0, F1, scallop(F0,F1)],
      [F1, F2, scallop(F1,F2)],
      [F2, F3, scallop(F2,F3)],
      [F3, ROOTAFT, scallop(F3,ROOTAFT)],
    ];
    for(const [a, b, notch] of bays){
      quad(WR, a, notch, notch, P.membraneLt, 0.05);
      quad(WR, notch, a, a, P.membraneLt, 0.05);
      quad(WR, notch, b, b, P.membraneLt, 0.05);
      quad(WR, b, notch, notch, P.membraneLt, 0.05);
      const dip=(p)=>V(p.x, p.y-0.008, p.z);
      quad(dip(WR), dip(notch), dip(a), dip(a), P.membrane, 0.05);
      quad(dip(WR), dip(a), dip(notch), dip(notch), P.membrane, 0.05);
      quad(dip(WR), dip(b), dip(notch), dip(notch), P.membrane, 0.05);
      quad(dip(WR), dip(notch), dip(b), dip(b), P.membrane, 0.05);
    }
  }

  /* the half-open wing goes on the side AWAY from the head-cock (right/trail side) so it reads as
     a distinct shape in frame rather than overlapping the neck; the folded wing tucks on the same
     side as the cocked head, where its subtler ridge silhouette doesn't compete for the read. */
  wingFolded(-1);      /* left (planted/head-cock side) — folded flat, subtler, shares the frame with the neck */
  wingHalfOpen(+1);    /* right (trail side) — half-open, low and out for balance, clearly separated */

  /* ---------- BASE DISC ------------------------------------------------------------------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.30, 0.30, 16);
    const r2=ring(V(0,0.046,0), V(0,1,0), 0.28, 0.28, 16);
    stitch([r1, r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
