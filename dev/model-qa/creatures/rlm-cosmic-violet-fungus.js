/* dev/model-qa/creatures/rlm-cosmic-violet-fungus.js — the VIOLET FUNGUS landmark table (PLANT
   family, Small), CR 1/2, realm cosmic, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri
   band (foundry pilot, cosmic-w1 cell 6, port 5376).
   Core identity: the altar-bound polyp growth — a walking toadstool that lashes at worshippers
   with rot-tendrils; the violet fungus. LAW-3 WARNING: the cosmic Creeper failed TWICE on
   dark-on-dark prisms (docs/MODEL-FOUNDRY.md evidence base) — this model keeps the cap violet at
   a genuinely saturated/bright lavender (not a muddy near-black purple) so the signature clears
   the 140 RGB high-value floor on its own, with pale spots pushed even brighter as the top-value
   accent.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. PLANT body — a squat toadstool: a thick pale stalk (the "torso" analog for a family with
        no skeleton) rising from a spread of root-toes, capped by a domed violet mushroom cap.
     2. SIGNATURE — the violet/lavender spotted cap: a wide low dome, saturated violet ground
        color climbing to pale high-value spots scattered across the upper cap (the law-3 zone —
        the spots alone clear 140 RGB, the single brightest shape in the piece) with a darker
        violet gill-fringe visible at the cap's underside rim.
     3. Thick pale stalk — a stout tapered column (wider at the base, narrowing under the cap),
        pale off-white/cream so the body mass itself clears the 60-RGB-over-void floor
        independent of the cap.
     4. Four whip-tendrils sprouting from the stalk/cap-underside — jointed rot-tendrils (3-tube
        segments each, per the darkmantle/piercer tendril grammar), two whipping forward
        mid-strike at different heights (upper-left high, lower-right low) and two coiled tight
        near the stalk (a spiral wind-up), per the pose direction.
     5. Root-toes — 4 short gnarled root-like "feet" splayed from the stalk base, gripping the
        disc, uneven lengths/angles (never a symmetric tripod/quadrupod).
     6. Cap-underside gill fringe — a ring of short dark-violet gill ridges just under the cap
        rim, visible where the cap tilts, giving the dome a constructed/organic underside instead
        of a smooth blank dome.

   POSE SENTENCE: the lash — the cap tilted off-level (rocked toward the strike side), two
   whip-tendrils caught mid-lash reaching forward at different heights (one high near cap level,
   one low near stalk-base level) as if just cracking toward a worshipper, the other two tendrils
   drawn back coiled tight against the stalk in a wind-up spiral, root-toes gripping the disc at
   uneven angles as the whole body leans into the strike — never a static, symmetrically-radiating
   tendril fan.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY, applied to a PLANT frame with no
   skeleton): the stalk-to-cap axis IS the gesture line — it leans off true-vertical toward the
   strike side and the cap continues that lean into a slight counter-tilt at the top (the
   "shoulders ride" analog: the cap tips further than the stalk's base lean, the way a raised arm
   drags its shoulder), so the whole body reads as one continuous C-curve from root-toes through
   stalk to cap-tip rather than a plumb column with tendrils bolted on; the two strike tendrils
   continue that curve outward as its loudest limbs, the two coiled tendrils counterbalance
   tucked in tight against the lean (contrapposto for a limbless frame). PLANT family has no
   family entry yet in ANATOMY-CANON — this file applies the cross-family POSE-ANATOMY rules
   (spine-first, gesture-line-survives-the-squint, counterpose) directly since no PLANT-specific
   joint-angle table exists to seed from. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildVioletFungus(){
  const P = {
    stalk:    0xd8cfb8,   // pale cream stalk — clears the 60-RGB body-mass floor on its own
    stalkDk:  0xa89c80,
    stalkLt:  0xece4cc,
    capV:     0x7a3fa8,   // saturated violet cap ground color
    capVDk:   0x4c2168,   // darker violet toward the cap rim/underside
    capVLt:   0x9a5fc8,   // lighter violet highlight band, top of dome
    spot:     0xe8c8f4,   // pale high-value spot — law-3 signature zone, brightest shape
    gill:     0x2e1440,   // dark violet gill fringe, cap underside
    tent:     0x6a3492,   // rot-tendril base color
    tentDk:   0x3e1c5c,
    tentPale: 0xb888d8,   // tendril tip — pale violet highlight
    root:     0xb0a488,   // root-toe color, matches stalk but muddier
  };

  // Whole-body lean: the gesture-line C-curve, cap leaning further than the stalk base
  // (the "shoulders ride" analog per POSE-ANATOMY rule 3).
  const lean = 0.22;
  const capLean = 0.34;

  // ---- Root-toes: 4 short gnarled feet, uneven lengths/angles, gripping the disc. Authored
  // FIRST (ground truth) so the stalk rises off a planted base, never floating.
  const rootSpecs = [
    { ang: 0.3,  len: 0.16, droop: 0.02 },
    { ang: 1.9,  len: 0.13, droop: 0.015 },
    { ang: 3.6,  len: 0.19, droop: 0.03 },
    { ang: 5.1,  len: 0.145, droop: 0.01 },
  ];
  const baseCX = -lean * 0.10, baseCZ = 0;
  for(const rt of rootSpecs){
    const c = Math.cos(rt.ang), s = Math.sin(rt.ang);
    const b0 = V(baseCX, 0.03, baseCZ);
    const b1 = V(baseCX + c*rt.len*0.6, 0.015 + rt.droop*0.5, baseCZ + s*rt.len*0.6);
    const b2 = V(baseCX + c*rt.len, 0.012, baseCZ + s*rt.len);
    tube(b0, b1, 0.035, 0.024, 6, P.root, { phase: rt.ang });
    tube(b1, b2, 0.024, 0.008, 6, P.stalkDk, { phase: rt.ang, capB: { hex: P.stalkDk } });
  }

  // ---- Stalk: stout tapered column, wider at base, narrowing under the cap, leaning toward
  // the strike side (the spine-curve base segment).
  const stalkBands = [
    { y: 0.02, rx: 0.080, rz: 0.070, hex: P.stalkDk },
    { y: 0.16, rx: 0.092, rz: 0.082, hex: P.stalk },
    { y: 0.34, rx: 0.078, rz: 0.068, hex: P.stalkLt },
    { y: 0.52, rx: 0.058, rz: 0.052, hex: P.stalk },
    { y: 0.66, rx: 0.044, rz: 0.038, hex: P.stalkDk },   // narrows under the cap underside
  ];
  const stalkLean = stalkBands.map(b => ({
    y: b.y, rx: b.rx, rz: b.rz, hex: b.hex,
    cx: baseCX + lean * (b.y / 0.66),
  }));
  stack(stalkLean, 10, {});

  const capBaseY = 0.66, capBaseX = baseCX + lean;

  // ---- Cap-underside gill fringe: a ring of short dark-violet ridges just under the cap rim,
  // visible where the cap tilts (feature 6). Authored before the cap dome so the dome overlaps it.
  const gillN = 10;
  for(let i=0;i<gillN;i++){
    const ang = i/gillN*Math.PI*2;
    const c = Math.cos(ang), s = Math.sin(ang);
    const gx = capBaseX + c*0.19, gz = s*0.17;
    const g0 = V(gx, capBaseY+0.02, gz);
    const g1 = V(capBaseX + c*0.10, capBaseY-0.05, s*0.09);
    quad(g0, g1, V(g1.x, g1.y+0.015, g1.z), V(g0.x, g0.y+0.015, g0.z), P.gill, 0.03);
  }

  // ---- SIGNATURE: the domed violet cap, tilted off-level toward the strike side (capLean >
  // lean, the "shoulders ride further than the base" read). Built as stacked widening-then-
  // closing rings so it silhouettes as a rounded dome, not a flat disc or a cone.
  const capBands = [
    { y: capBaseY,        rx: 0.205, rz: 0.185, hex: P.capVDk },
    { y: capBaseY + 0.06, rx: 0.235, rz: 0.210, hex: P.capV },
    { y: capBaseY + 0.13, rx: 0.220, rz: 0.195, hex: P.capV },
    { y: capBaseY + 0.20, rx: 0.170, rz: 0.150, hex: P.capVLt },
    { y: capBaseY + 0.26, rx: 0.095, rz: 0.082, hex: P.capVLt },
  ];
  const capBandsTilt = capBands.map((b, i) => ({
    y: b.y, rx: b.rx, rz: b.rz, hex: b.hex,
    cx: capBaseX + capLean * (i / (capBands.length - 1)) * 0.5,
  }));
  stack(capBandsTilt, 12, { phase: Math.PI / 10 });
  const capApexY = capBaseY + 0.31, capApexX = capBaseX + capLean * 0.55;
  blob(capApexX, capApexY, 0.0, 0.055, 0.05, 0.05, P.capVLt, 6, 4);

  // ---- SIGNATURE spots: pale high-value scatter across the upper cap dome — law-3's brightest
  // shape, deliberately uneven placement (never a uniform grid) so it reads organic.
  const spotSpecs = [
    { ang: 0.4,  h: 0.20, r: 0.028 },
    { ang: 1.3,  h: 0.24, r: 0.020 },
    { ang: 2.1,  h: 0.17, r: 0.024 },
    { ang: 2.9,  h: 0.23, r: 0.018 },
    { ang: 3.8,  h: 0.19, r: 0.026 },
    { ang: 4.6,  h: 0.25, r: 0.019 },
    { ang: 5.4,  h: 0.16, r: 0.022 },
    { ang: 0.9,  h: 0.27, r: 0.016 },
  ];
  for(const sp of spotSpecs){
    const c = Math.cos(sp.ang), s = Math.sin(sp.ang);
    const t = sp.h / 0.27;
    const rx = 0.235 - 0.14*t, rz = 0.21 - 0.13*t;
    const sx = capBaseX + capLean * t * 0.5 + c*rx*0.82;
    const sz = s*rz*0.82;
    const sy = capBaseY + sp.h;
    blob(sx, sy, sz, sp.r, sp.r*0.7, sp.r, P.spot, 5, 3);
  }

  // ---- Four whip-tendrils: two mid-lash forward (high + low), two coiled tight against the
  // stalk. Each a 3-segment jointed tube per the darkmantle/piercer tendril grammar (100-150deg
  // bends, never a straight stick).
  // Strike tendril A — HIGH, sprouting near the cap-underside, whipping forward-high and OUT to
  // the side (+x/+z) so it clears the (now slimmer) cap/stalk silhouette instead of tucking
  // behind it — R2 self-review: r1's tendrils vanished into the pale stalk mass.
  {
    const root = V(capBaseX + 0.16, capBaseY + 0.06, 0.14);
    const j1   = V(capBaseX + 0.42, capBaseY + 0.10, 0.38);
    const j2   = V(capBaseX + 0.62, capBaseY + 0.04, 0.56);
    const tip  = V(capBaseX + 0.80, capBaseY - 0.14, 0.62);
    tube(root, j1, 0.052, 0.038, 6, P.tent, { phase: 0.2 });
    tube(j1, j2, 0.038, 0.024, 6, P.tentDk, { phase: 0.2 });
    tube(j2, tip, 0.024, 0.009, 6, P.tentPale, { phase: 0.2, capB: { hex: P.tentPale, lift: 0.006 } });
  }
  // Strike tendril B — LOW, sprouting near the stalk base, whipping forward-low and OUT to the
  // side at a different height than A (per the pose direction's "different heights" requirement).
  {
    const root = V(baseCX + 0.10, 0.24, -0.10);
    const j1   = V(baseCX + 0.34, 0.18, 0.20);
    const j2   = V(baseCX + 0.54, 0.16, 0.42);
    const tip  = V(baseCX + 0.72, 0.20, 0.56);
    tube(root, j1, 0.048, 0.034, 6, P.tent, { phase: 2.4 });
    tube(j1, j2, 0.034, 0.021, 6, P.tentDk, { phase: 2.4 });
    tube(j2, tip, 0.021, 0.008, 6, P.tentPale, { phase: 2.4, capB: { hex: P.tentPale, lift: 0.006 } });
  }
  // Coiled tendril C — drawn back in a tight spiral wind-up, held clear of the stalk's -z flank
  // (pushed further out and given a brighter tent/tentDk pairing than r1 so it reads against the
  // dark void instead of vanishing).
  {
    const root = V(capBaseX - 0.04, capBaseY + 0.02, -0.22);
    const j1   = V(capBaseX - 0.22, capBaseY - 0.06, -0.34);
    const j2   = V(capBaseX - 0.18, capBaseY - 0.20, -0.22);
    const tip  = V(capBaseX - 0.02, capBaseY - 0.26, -0.10);
    tube(root, j1, 0.046, 0.032, 6, P.tentPale, { phase: 4.1 });
    tube(j1, j2, 0.032, 0.020, 6, P.tent, { phase: 4.1 });
    tube(j2, tip, 0.020, 0.008, 6, P.tentPale, { phase: 4.1, capB: { hex: P.tentPale, lift: 0.006 } });
  }
  // Coiled tendril D — drawn back tight, held clear of the stalk's -z flank (lower), counter-
  // balancing the lean; same brighter treatment as C for visibility.
  {
    const root = V(baseCX - 0.04, 0.36, -0.18);
    const j1   = V(baseCX - 0.20, 0.28, -0.28);
    const j2   = V(baseCX - 0.16, 0.16, -0.16);
    const tip  = V(baseCX - 0.02, 0.09, -0.04);
    tube(root, j1, 0.042, 0.030, 6, P.tentPale, { phase: 5.6 });
    tube(j1, j2, 0.030, 0.019, 6, P.tent, { phase: 5.6 });
    tube(j2, tip, 0.019, 0.007, 6, P.tentPale, { phase: 5.6, capB: { hex: P.tentPale, lift: 0.006 } });
  }
}
