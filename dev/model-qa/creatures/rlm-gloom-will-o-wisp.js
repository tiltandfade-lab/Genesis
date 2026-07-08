/* dev/model-qa/creatures/rlm-gloom-will-o-wisp.js — the WILL-O-WISP (gloom, Tiny undead, CR
   1/8-2). Bestiary voice (data/realm-bestiary.js, gloom): "Guttered Wick" — a candle-flame that
   should have died an hour ago, drifting doorway to doorway, its light lagging a shadow behind
   whoever it crosses; "Lantern-Jawed Corpse Candle" — a grave-light hovering over fresh graves,
   warm and inviting like a window-lantern, feeding on the grief of anyone who follows it. Was a
   plain SKELETON stand-in (the worst realm mismatch) — no shared anatomy at all, so this is a
   pure value-contrast/silhouette showcase, not an ANATOMY-CANON family build.

   FEATURE CHECKLIST (the tris this budget buys):
   1. bright guttering core — a sickly blue-white candle-flame body, the high-value zone the
      whole read hangs on (law 3), leaning off-vertical as it climbs.
   2. a pale corona flare girdling the flame's widest point — the "lantern in a window" warmth,
      a second value-ladder rung between the white-hot core and the dark shroud.
   3. dark violet guttering wisp-tendrils wrapping/licking off the flame at contradicting angles
      — "guttering in a wind that isn't there" — kept at a plum value (never near-black) so the
      shroud silhouettes against the void instead of vanishing into it (the Creeper lesson).
   4. one thin trailing under-tendril drooping from the flame's foot toward the ground — the
      stolen shadow it drags a half-step behind whoever it's crossed.
   5. a base disc standing in for the shadow-pool it hovers over/steals.

   POSE SENTENCE: mid-drift, guttering hard to one side as it bobs from a doorway it's checking
   for the wick it lost — not a symmetrical static flame, a candle caught leaning in a draft.

   Whole-object grammar: one exported build fn, probe-lib primitives only, spine +z, ground y=0,
   one landmark table, no anchors. Tiny size, base disc r=0.28 (smaller than the Small-creature
   r=0.32 convention — this is a thumbnail flame, not a body). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildWillOWisp(){
  const P = {
    core:0xeaf9ff, coreMid:0x8fd8f0, coreDk:0x3f7d9c,
    corona:0xc9e8f2,
    shroud:0x7c4fa0, shroudDk:0x54346e, shroudTip:0x2c1a40,
    shadow:0x160e22, shadowTop:0x201530,
  };
  const LEAN = 0.46;   // how hard the whole flame leans/guttures toward +x as it climbs
  // r2 critic pass: LEAN pulled in from 0.65 -> the 6-tendril spread was reading 0.96u wide
  // (near 2x the base-disc diameter) — a Tiny "thumbnail flame" sprawling to bat/wing width.
  // shroud/shroudDk lifted a notch too: the SIGNATURE carried silhouette dominance but zero
  // value pop of its own (all-dark against the bright core) — this keeps the plum-not-near-
  // black law-3 floor while giving the signature itself a visible lit edge, not just the core.

  /* ---------- 1. the guttering core — a leaning candle-flame teardrop, brightest at mid-height,
     tapering to a dark guttering tip (law 3: the high-value zone the read hangs on). Narrow foot
     -> wide belly -> narrow tip so it reads FLAME, not goblet. ---------- */
  stack([
    {y:0.05, cx:0.000, cz:0.000, rx:0.050, hex:P.coreDk},
    {y:0.13, cx:0.006, cz:0.002, rx:0.115, hex:P.coreMid},
    {y:0.24, cx:0.020, cz:0.007, rx:0.155, hex:P.core},
    {y:0.35, cx:0.045, cz:0.015, rx:0.100, hex:P.coreMid},
    {y:0.44, cx:0.075, cz:0.024, rx:0.045, hex:P.coreDk},
  ], 8, {
    phase: Math.PI/8,
    capTop:{hex:P.shroudTip, lift:0.05},   // the flame guts out into dark wisp at the very tip
    capBot:{hex:P.coreDk, lift:0.02},
  });

  /* ---------- 2. corona flare — a thin pale ring girdling the flame's widest point, the
     lantern-warmth value rung between the white-hot core and the dark shroud ---------- */
  {
    const cy = 0.24, cx = 0.020, cz = 0.007;
    const r1 = ring(V(cx, cy-0.012, cz), V(0,1,0), 0.215, 0.215, 8, Math.PI/8);
    const r2 = ring(V(cx, cy+0.012, cz), V(0,1,0), 0.215, 0.215, 8, Math.PI/8);
    stitch([r1, r2], ()=> P.corona);
  }

  /* ---------- 3. SIGNATURE — dark violet wisp-tendrils guttering off the flame at contradicting
     angles, pushed WELL past the core's own silhouette so they change the outline (law 2), never
     near-black so the shroud silhouettes instead of vanishing into the void (law 3) ---------- */
  {
    const base = V(0.020, 0.27, 0.007);
    const spec = [   // [angle, tilt(+/-), length, heightOffset, outSpread]
      [0.20,  1.1, 0.40, 0.10, 1.0],
      [1.10, -0.8, 0.32, 0.24, 1.0],
      [2.35,  1.3, 0.44, -0.02, 1.0],
      [3.35, -1.1, 0.34, 0.14, 1.0],
      [4.30,  0.9, 0.38, -0.08, 1.0],
      [5.35, -1.2, 0.30, 0.20, 1.0],
    ];
    spec.forEach(([ang, tilt, len, hOff])=>{
      const dx = Math.cos(ang), dz = Math.sin(ang);
      // launch point sits OFF the core surface (0.16 out) so tendrils clear the flame body before
      // curling; every tendril also drifts toward +x (LEAN) so the shroud reads as one guttering gust
      const p0 = V(base.x + dx*0.16, base.y + hOff, base.z + dz*0.16);
      const p1 = V(base.x + dx*len*0.55 + LEAN*len*0.45, base.y + hOff + tilt*0.09, base.z + dz*len*0.55);
      const p2 = V(base.x + dx*len*0.86 + LEAN*len*0.80, base.y + hOff + tilt*0.16, base.z + dz*len*0.86 - dx*0.03);
      const tip= V(base.x + dx*len      + LEAN*len*1.00, base.y + hOff + tilt*0.20, base.z + dz*len      - dx*0.045);
      tube(p0, p1, 0.055, 0.038, 6, P.shroud);
      tube(p1, p2, 0.038, 0.022, 6, P.shroudDk);
      tube(p2, tip, 0.022, 0.007, 6, P.shroudTip, {capB:{hex:P.shroudTip, lift:0.006}});
    });
  }

  /* ---------- 4. the stolen shadow — one thin under-tendril dragging out from the flame's foot,
     trailing a half-step behind toward the ground, poking clear past the disc's edge ---------- */
  {
    const p0 = V(-0.02, 0.06, -0.02);
    const p1 = V(-0.14, 0.02, 0.04);
    const p2 = V(-0.27, -0.015, 0.11);   // clears the disc rim — reads as a dragging shadow-tail
    tube(p0, p1, 0.032, 0.020, 5, P.shroudDk);
    tube(p1, p2, 0.020, 0.005, 5, P.shroudTip, {capB:{hex:P.shroudTip, lift:0.004}});
  }

  /* ---------- 5. base disc — the shadow-pool it hovers over / steals (Tiny, r=0.28) ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.28, 0.28, 12);
    const r2 = ring(V(0,0.036,0), V(0,1,0), 0.26, 0.26, 12);
    stitch([r1, r2], ()=> P.shadow);
    capFan(r2, V(0,0.039,0), P.shadowTop);
  }
}
