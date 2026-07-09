/* dev/model-qa/creatures/rlm-cosmic-darkmantle.js — the DARKMANTLE (bespoke COSMIC Aberration,
   Small, CR 1/4). Star-spawn hatchling, smothers before it thinks.

   FEATURE CHECKLIST (budget spend, from flavor "cave-ceiling squid-umbrella that drops on heads"):
     1. the flared umbrella MANTLE — a fleshy cone/dome body opened wide (the signature silhouette)
     2. 8 trailing tentacle points, splayed down-and-out, ready to wrap
     3. a domed dark top vs a PALE high-value underside (Law 3 — the cosmic dark-on-dark killer)
     4. a small beaked maw tucked under the dome center
     5. mottled skin texture bands on the dome (cheap value variation, not a new feature)

   POSE SENTENCE: caught mid-fall, hovering ~0.5u above the disc, mantle flared wide open like an
   umbrella just before it clamps down, all 8 tentacles splayed out and slightly curled to grip —
   the drop, not a resting perch.

   SPINE-GESTURE SENTENCE: the "spine" here is the vertical hang-axis from dome apex (top, pulled
   back slightly -z as if still falling) down through the maw to the tentacle root — a short backward
   lean (apex behind center, tentacles reaching forward-down) reads as arrested momentum rather than
   a static parasol; tentacles curl asymmetrically (alternating hook direction) so the fall/grab
   moment survives the squint instead of a symmetric umbrella-on-a-stick.

   ANATOMY: CEPHALOPOD-UMBRELLA (no dedicated ANATOMY-CANON family yet — authored per this brief:
   fleshy cone/umbrella body, domed top, 6-8 trailing tentacle points). HOVER-FLAGGED: floats above
   an empty disc, no visible support strut.

   Whole-object grammar: one exported fn, ground y=0, spine +z front, up +y. */
import { V, quad, tube, ring, stitch, capFan, stack, blob, setChannels } from '../probe-lib.js';

export function buildDarkmantle(){
  /* ---------- PALETTE (COSMIC desaturated; dark dome top vs PALE underside — Law 3 contrast) ---------- */
  const P = {
    domeDk:0x352d48, dome:0x453a5e, domeLt:0x554870,        // mottled dome top — bumped clear of the void (Law 3)
    mottleA:0x3e3454, mottleB:0x2e2642,                       // dome texture bands
    underDk:0x8a7ea0, under:0xb4a8c8, underLt:0xe4d8f4,       // PALE underside — the high-value zone (>=140 RGB)
    rim:0xcdb8e8,                                             // the flared RIM itself is the loud high-value band —
                                                               // camera-visible at any angle, unlike the hidden underside
    tent:0x453a5e, tentDk:0x2e2642, tentPale:0xc4b4dc,        // tentacles, bright gripping tips
    maw:0x0f0d16, beak:0x453a5e,                              // dark maw + small beak
    disc:0x322a3c, discTop:0x3e3448,                          // cosmic void-purple disc
  };
  setChannels({
    [P.dome]:'leather', [P.domeDk]:'leather', [P.domeLt]:'leather',
    [P.mottleA]:'leather', [P.mottleB]:'leather', [P.rim]:'leather',
    [P.under]:'skin', [P.underDk]:'skin', [P.underLt]:'skin',
    [P.tent]:'leather', [P.tentDk]:'leather', [P.tentPale]:'skin',
    [P.beak]:'bone',
  });

  /* ---------- LANDMARKS — hovering the drop: apex pulled back (-z) above center, mantle flared
     wide at the rim, tentacle root just below the rim underside. ---------- */
  const hoverY = 0.50;                 // body center height (hover ~0.5u per brief)
  const apex   = V(0, hoverY+0.30, -0.05);   // dome apex, nudged -z = falling-backward lean
  const rimY   = hoverY + 0.06;              // the flared rim — widest point, the signature silhouette

  /* ---------- DOME — a wide flared cone/umbrella lofted from the apex down to the flared rim,
     each band widening fast near the bottom so the "just opened" umbrella read survives the squint. ---------- */
  {
    const n = 12, ph = Math.PI/n;
    const bands = [
      {y:apex.y,        rx:0.02, rz:0.02, cx:apex.x, cz:apex.z, hex:P.domeDk},
      {y:hoverY+0.22,    rx:0.14, rz:0.14, cx:-0.02,  cz:-0.03,  hex:P.dome},
      {y:hoverY+0.14,    rx:0.30, rz:0.29, cx:-0.01,  cz:-0.01,  hex:P.mottleA},
      {y:hoverY+0.08,    rx:0.44, rz:0.43, cx:0,      cz:0,      hex:P.dome},
      {y:rimY,           rx:0.56, rz:0.55, cx:0,      cz:0.01,   hex:P.rim},   // the flared rim — max width, HIGH VALUE
    ];
    stack(bands, n, { phase:ph });
  }

  /* ---------- UNDERSIDE — the pale high-value belly of the mantle, a shallower dome curving up
     from the rim toward the maw, opposite winding so it reads from below/the front. ---------- */
  {
    const n = 12, ph = Math.PI/n;
    const bands = [
      {y:rimY,          rx:0.55, rz:0.54, hex:P.underDk},
      {y:hoverY-0.02,    rx:0.36, rz:0.35, hex:P.under},
      {y:hoverY-0.10,    rx:0.20, rz:0.19, hex:P.underLt},   // brightest zone — right under the dome, faces the disc
      {y:hoverY-0.15,    rx:0.09, rz:0.09, hex:P.underLt},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0.01), V(0,-1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,hoverY-0.18,0.01), P.underLt, true);
  }

  /* ---------- MAW — a small dark beaked mouth tucked under the dome center, facing down/forward. ---------- */
  {
    blob(0, hoverY-0.06, 0.10, 0.07, 0.05, 0.06, P.maw, 7, 4);
    const b0 = V(-0.03, hoverY-0.04, 0.15), b1 = V(0.03, hoverY-0.04, 0.15), tip = V(0, hoverY-0.09, 0.20);
    quad(b0, b1, tip, tip, P.beak, 0.04);
    quad(b1, b0, V(0,hoverY-0.02,0.16), V(0,hoverY-0.02,0.16), P.beak, 0.04);
  }

  /* ---------- SIGNATURE — 8 tentacle points, trailing from just under the rim, splayed down-and-
     out, alternating curl direction (hook L / hook R) so the "reaching to wrap" read survives the
     squint rather than a static radial fringe. Root joints bend, not straight sticks. ---------- */
  {
    const T = 8;
    for(let i=0;i<T;i++){
      const ang = (i/T)*Math.PI*2 + Math.PI/T;
      const c = Math.cos(ang), s = Math.sin(ang);
      // perpendicular (tangent) direction, for a small hook offset that alternates L/R per tentacle
      const px = -s, pz = c;
      const hook = (i%2===0) ? 0.06 : -0.06;
      const root = V(c*0.50, rimY-0.03, s*0.50);                                    // at the rim, splayed out
      const j1   = V(c*0.66, rimY-0.24, s*0.66);                                    // reach further OUT and DOWN — bend ~120deg
      const tip  = V(c*0.56 + px*hook, rimY-0.44, s*0.56 + pz*hook);                // hook back IN + down — the grip
      tube(root, j1, 0.070, 0.044, 6, P.tent, {phase:Math.PI/6});
      tube(j1, tip, 0.044, 0.014, 6, P.tentDk, {phase:Math.PI/6, capB:{hex:P.tentPale, lift:0.008}});
    }
  }

  /* ---------- base disc (Small: r=0.4; empty — hover-flagged, no support strut) ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.40, 0.40, 16);
    const r2 = ring(V(0,0.040,0), V(0,1,0), 0.38, 0.38, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
