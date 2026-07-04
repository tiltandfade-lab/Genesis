/* dev/model-qa/creatures/mon-shadow.js — THE SHADOW: living darkness, a man's shadow that stood up.
   Whole-object grammar: one function, one geometry frame, no anchors. Y-up. Where the WRAITH (its
   hovering cousin) DRIFTS in the air with a hooded face and cold eyes, the SHADOW is BOUND TO THE
   FLOOR: a low, hunched head-and-shoulders suggestion rises at the FRONT (~0.9u) then dissolves
   BACKWARD and DOWNWARD into flat trailing streamers that HUG the disc surface like spilled ink.
   No hood, no face, NO eyes — pure absence, a silhouette cut from the void. Two long reaching arms
   end in elongated finger-streamers that also touch the ground. Near-black palette with the faintest
   cold blue-grey edge highlights, the only thing that separates the form from the void background.
   The read: a man's shadow, peeled off the wall, poured upright, reaching for you.
   Imported by mon-shadow-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildShadow(){
  /* ---------- PALETTE (near-black; the faintest cold blue-grey edge so the silhouette reads) ---------- */
  const P = {
    ink:0x0a0c11, inkDk:0x060709, inkDkr:0x040507,      // the body-black, void-dark
    ink2:0x0e1118,                                        // a hair lighter fold
    edge:0x2a323f, edgeLt:0x3a4655,                       // COLD blue-grey rim highlight (the only separation)
    ground:0x080a0e,                                      // the flat trailing streamers on the floor
    disc:0x1a1d22, discTop:0x22262d,
  };

  /* ---------- LANDMARKS — a hunched head-and-shoulders form at the FRONT (+z), pouring back into
     ground-hugging streamers. The whole mass leans FORWARD and low; the "head" is a mere bump, not
     a skull. Nothing rises high — this is a shadow standing up, not a figure. FRONT = +z. ---------- */
  const FRONT = 0.16;                 // the shoulders/head cluster sits forward on the disc
  const L = {
    baseY:0.06, waistY:0.36, chestY:0.60, shldY:0.74, neckY:0.80,
    headY:0.86, headTopY:0.92,        // the head is a low crest ~0.9u, NOT a face
    shoulderX:0.155,
  };

  /* ===== FRONT CORE — a hunched shoulders-and-head suggestion that RISES at the front (+z) and
     caves/dissolves at the back. Built as a loft, narrow and forward-leaning. Near-black; a whisper
     of cold edge on the lit shoulder tops. This is the "man that stood up" reading from the front. ===== */
  stack([
    {y:L.baseY,  cz:FRONT-0.04, rx:0.190, rz:0.150, hex:P.inkDkr},    // where the front root meets the pooling ink
    {y:L.waistY, cz:FRONT-0.01, rx:0.150, rz:0.120, hex:P.inkDk},     // narrow hunched waist
    {y:L.chestY, cz:FRONT+0.02, rx:0.185, rz:0.135, hex:P.ink},       // chest, leaning forward
    {y:L.shldY,  cz:FRONT+0.02, rx:0.205, rz:0.130, hex:P.ink2},      // shoulders — the widest of the upright form
    {y:L.neckY,  cz:FRONT+0.01, rx:0.075, rz:0.070, hex:P.inkDk},     // pinched neck into the head-bump
  ], 8, {phase:Math.PI/8, capTop:{hex:P.inkDk, lift:0.004}});

  /* the HEAD — a smooth featureless bump, hunched forward off the neck. No face, no eyes: a
     rounded near-black knob that reads only as a silhouette crown. Tilted forward (+z). */
  stack([
    {y:L.neckY+0.005, cz:FRONT+0.01, rx:0.078, rz:0.072, hex:P.inkDk},
    {y:L.headY,       cz:FRONT+0.035, rx:0.100, rz:0.090, hex:P.ink},   // brow-line of the bump, leaning forward
    {y:L.headTopY,    cz:FRONT+0.025, rx:0.066, rz:0.062, hex:P.inkDk}, // crown
  ], 8, {phase:Math.PI/8, capTop:{hex:P.inkDkr, lift:0.02}});

  /* faint COLD-EDGE rim quads along the lit front of the shoulders + the crown, so the black
     silhouette separates from the black void. Thin proud strips, blue-grey. */
  {
    const rim=(y,z,hw,col)=> quad(
      V(-hw, y-0.02, z+0.005), V(hw, y-0.02, z+0.005),
      V(hw*0.7, y+0.03, z-0.01), V(-hw*0.7, y+0.03, z-0.01), col, 0.04);
    rim(L.shldY+0.01, FRONT+0.135, 0.135, P.edge);            // shoulder-top catch-light
    rim(L.headY+0.02, FRONT+0.115, 0.060, P.edgeLt);          // crown catch-light
    rim(L.chestY,     FRONT+0.150, 0.100, P.edge);            // upper chest edge
  }

  /* ===== TRAILING STREAMERS — the FLOOR-BOUND tell. Behind and below the upright front, the mass
     spills into 5 flat streamers that fan out across the disc and HUG its surface (bottoms at
     y≈0.055, resting ON the disc — the opposite of the wraith's air-gap). They spread BACKWARD (-z)
     and outward like spilled ink pouring off the standing form. Ragged, uneven, low + flat. ===== */
  {
    /* Each streamer: root high-ish on the back of the core, then SINKS to the floor and spreads out.
       They are wide+flat near the disc (spilled ink), tapering to frayed points at the edge. Root
       radius modest → mid flattens toward the floor → tip is a thin wisp lying ON the disc top. */
    const floor = 0.058;              // streamer tips rest here, ON the disc surface
    const streamers = [
      { rx:-0.06, rz:FRONT-0.08, midX:-0.20, tipX:-0.34, tipZ:-0.30 },  // back-left pour
      { rx: 0.07, rz:FRONT-0.09, midX: 0.22, tipX: 0.36, tipZ:-0.26 },  // back-right pour
      { rx: 0.00, rz:FRONT-0.12, midX: 0.02, tipX: 0.04, tipZ:-0.40 },  // straight back, longest
      { rx:-0.10, rz:FRONT-0.02, midX:-0.28, tipX:-0.40, tipZ:-0.02 },  // left side, wide
      { rx: 0.10, rz:FRONT-0.02, midX: 0.28, tipX: 0.40, tipZ:-0.06 },  // right side, wide
    ];
    for(const s of streamers){
      const root = V(s.rx, L.waistY-0.06, s.rz);                        // peels off the low back of the core
      const mid  = V(s.midX, floor+0.09, (s.rz + s.tipZ)*0.5);          // dipping toward the floor
      const tip  = V(s.tipX, floor, s.tipZ);                            // resting ON the disc
      tube(root, mid, 0.066, 0.038, 5, P.inkDk);                        // fat frayed root
      tube(mid,  tip, 0.038, 0.006, 5, P.ground, {capB:{hex:P.inkDkr, lift:0.006}});  // flattening to a floor wisp
      /* a NARROW flat ink-tongue quad hugging the disc, tapering to a point (a tendril, not a pool).
         Kept slim + pointed so streamers read as separating fingers of ink, not one grey rug. */
      const half=0.032, dirx=(tip.x-mid.x), dirz=(tip.z-mid.z);
      const pl=Math.hypot(dirx,dirz)||1, px=-dirz/pl, pz=dirx/pl;       // perpendicular in the floor plane
      quad(V(mid.x+px*half, floor+0.004, mid.z+pz*half), V(mid.x-px*half, floor+0.004, mid.z-pz*half),
           V(tip.x-px*half*0.15, floor+0.003, tip.z-pz*half*0.15), V(tip.x+px*half*0.15, floor+0.003, tip.z+pz*half*0.15), P.ground, 0.05);
      /* a thin cold-edge sliver down ONE side only (a rim glint, not a full ring) */
      quad(V(mid.x+px*half, floor+0.006, mid.z+pz*half), V(mid.x+px*half*0.6, floor+0.006, mid.z+pz*half*0.6),
           V(tip.x+px*half*0.1, floor+0.005, tip.z+pz*half*0.1), V(tip.x+px*half*0.14, floor+0.005, tip.z+pz*half*0.14), P.edge, 0.06);
    }
    /* a few loose thin ink-tendrils peeling off between the main streamers (splayed pointed fingers) */
    for(const [rx,rz,tx,tz] of [
      [-0.14, FRONT-0.06, -0.28, -0.14],
      [ 0.14, FRONT-0.05,  0.28, -0.16],
      [ 0.02, FRONT-0.14,  0.12, -0.36],
      [-0.20, FRONT-0.01, -0.34,  0.06],
      [ 0.20, FRONT-0.01,  0.34,  0.04],
    ]){
      const rt=V(rx, floor+0.03, rz), tp=V(tx, floor, tz);
      tube(rt, tp, 0.026, 0.004, 4, P.inkDkr, {capB:{hex:P.ground, lift:0.006}});
    }
  }

  /* ===== ARMS — two long REACHING arms sweeping FORWARD + DOWN, ending in elongated finger-
     streamers that also drip to the ground. The RIGHT (s=+1) reaches far forward toward the viewer;
     the LEFT sweeps out to the side and lower. Near-black tapering tubes, boneless (no joints show)
     — a shadow's limb, not a skeleton. The finger-tips trail down to hug the disc. ===== */
  {
    const floor = 0.06;
    // reaching right arm — forward toward the viewer, fingers dripping to the floor
    {
      const S = V(L.shoulderX, L.shldY-0.03, FRONT+0.03);
      const E = V(0.30, L.chestY-0.08, FRONT+0.22);          // elbow out + forward
      const W = V(0.33, L.waistY-0.06, FRONT+0.40);          // wrist reaching FAR forward + lower
      tube(S, E, 0.058, 0.040, 6, P.inkDk);                  // upper arm, boneless
      tube(E, W, 0.036, 0.022, 6, P.ink);                    // forearm
      // long elongated finger-streamers fanning forward then DRIPPING down toward the floor
      const fingers=[
        V(W.x-0.14, floor+0.02, W.z+0.14),
        V(W.x-0.04, floor,      W.z+0.20),
        V(W.x+0.08, floor,      W.z+0.18),
        V(W.x+0.18, floor+0.02, W.z+0.10),
      ];
      for(const f of fingers) tube(W, f, 0.017, 0.003, 4, P.ink, {capB:{hex:P.inkDkr, lift:0.008}});
      // faint cold edge on the upper wrist so the reaching hand reads against the void
      quad(V(W.x-0.03, W.y+0.01, W.z+0.02), V(W.x+0.03, W.y+0.01, W.z+0.02),
           V(W.x+0.02, W.y+0.04, W.z), V(W.x-0.02, W.y+0.04, W.z), P.edge, 0.05);
    }
    // left arm — sweeps OUT to the side + forward, lower, fingers trailing to the floor
    {
      const S = V(-L.shoulderX, L.shldY-0.03, FRONT+0.01);
      const E = V(-0.30, L.waistY+0.02, FRONT+0.12);
      const W = V(-0.38, L.waistY-0.10, FRONT+0.22);         // wrist out to the side + forward
      tube(S, E, 0.056, 0.038, 6, P.inkDk);
      tube(E, W, 0.034, 0.020, 6, P.ink);
      const fingers=[
        V(W.x-0.16, floor+0.02, W.z+0.06),
        V(W.x-0.06, floor,      W.z+0.14),
        V(W.x+0.06, floor,      W.z+0.16),
        V(W.x+0.14, floor+0.02, W.z+0.10),
      ];
      for(const f of fingers) tube(W, f, 0.016, 0.003, 4, P.ink, {capB:{hex:P.inkDkr, lift:0.008}});
      quad(V(W.x-0.03, W.y+0.01, W.z+0.02), V(W.x+0.03, W.y+0.01, W.z+0.02),
           V(W.x+0.02, W.y+0.04, W.z), V(W.x-0.02, W.y+0.04, W.z), P.edge, 0.05);
    }
  }

  /* base disc (Medium: r=0.42). The shadow POOLS onto it — the streamers and finger-tips all touch. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
