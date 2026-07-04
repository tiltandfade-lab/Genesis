/* dev/model-qa/creatures/mon-ratswarm.js — the RAT SWARM (bespoke swarm module, Medium footprint).
   Adam's QA-review ruling 2026-07-04: the swarm was nearest-subbed to the GIANT RAT, so on the board
   it read as ONE big rat, not a swarm. This is a bespoke SWARM: 6 SMALL simplified mouse-shaped
   bodies ("little mouse shaped things with simple tails") scattered across a Medium disc at varied
   position / facing / size. Each mouse is a tiny horizontal loft (rump→shoulder→pointed snout) + a
   pair of small round ears + a thin curved tail + four stub legs, held very low. NO eye quads
   (house eye ruling reversed 2026-07-04 — eyes removed across the board). The read is CARRIED by
   the count + scatter + the little tails, not by any one body's detail. Whole-object grammar: one
   function, one geometry frame, no anchors. Imported by mon-ratswarm-probe.html + the proof sheet. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRatSwarm(){
  /* ---------- PALETTE (VS desaturated; matted grey-brown vermin, varied a touch per body) ---------- */
  const P = {
    fur:0x6b6053, furDk:0x4c443a, furLt:0x8a7d6c, belly:0x9c8f7c,
    fur2:0x605448, fur3:0x746656,             // slight per-body coat variation
    tail:0xb8a48f, tailDk:0x8a7a68,           // bare pale scaly tail
    ear:0xa88f7d, snout:0x847264, nose:0x2a2320,
    foot:0x9a8875,
    disc:0x4a4038, discTop:0x585047,
  };

  /* one little MOUSE at (cx,cz), rotated `yaw` radians about +y, scaled by `sc` (~0.7..1.0), coat hex.
     Body is a short horizontal loft along the mouse's local +z (nose ahead). Everything is authored
     in the mouse's local frame then rotated/translated into place. Held VERY low (~0.11u spine). */
  function mouse(cx, cz, yaw, sc, coat){
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    // place: rotate a local point (lx,ly,lz) about +y by yaw, scale, then offset to (cx,*,cz)
    const P3 = (lx, ly, lz) => V(cx + (lx*cy + lz*sy)*sc, ly*sc, cz + (-lx*sy + lz*cy)*sc);

    const spineY = 0.115;   // local spine height (low body)
    /* body loft: rump (behind -z) -> mid -> shoulder -> pointed snout (ahead +z) */
    const rump  = P3(0, spineY+0.02, -0.15);
    const mid   = P3(0, spineY+0.02,  0.00);
    const shldr = P3(0, spineY+0.01,  0.13);
    const snB   = P3(0, spineY-0.01,  0.22);   // snout base (face front)
    const snT   = P3(0, spineY-0.03,  0.30);   // pointed nose tip
    tube(rump,  mid,   0.090, 0.100, 7, coat,    {phase:Math.PI/7, capA:{hex:P.furDk, lift:0.01}});
    tube(mid,   shldr, 0.100, 0.078, 7, coat,    {phase:Math.PI/7});
    tube(shldr, snB,   0.078, 0.050, 7, P.furDk, {phase:Math.PI/7});
    tube(snB,   snT,   0.050, 0.016, 7, P.snout, {phase:Math.PI/7, capB:{hex:P.nose, lift:0.006}});

    /* two small ROUND ears atop the skull (petal stubs, clear of the body) */
    for(const s of [-1,1]){
      const eb = P3(s*0.055, spineY+0.055, 0.11);
      const et = P3(s*0.075, spineY+0.115, 0.10);
      tube(eb, et, 0.018, 0.030, 6, P.ear, {capB:{hex:P.ear, lift:0.004}});
    }

    /* four stub LEGS dropping to the disc (front pair under shoulder, rear pair under rump) */
    const legs = [ [ 0.075, 0.14], [-0.075, 0.14], [ 0.080, -0.12], [-0.080, -0.12] ];
    for(const [lx, lz] of legs){
      const hip  = P3(lx, spineY-0.05, lz);
      const foot = P3(lx*1.15, 0.012/sc, lz);   // land near the ground (foot y ~ 0.012 world)
      tube(hip, foot, 0.028, 0.020, 5, coat, {capB:{hex:P.foot, lift:0.004}});
    }

    /* thin curved TAIL — roots at the rump, sweeps back and to one side, trailing low. Simple. */
    const t0 = P3(0.02, spineY-0.01, -0.17);
    const t1 = P3(0.06, 0.075,       -0.28);
    const t2 = P3(0.14, 0.055,       -0.36);
    const t3 = P3(0.24, 0.045,       -0.38);
    tube(t0, t1, 0.024, 0.019, 5, P.tailDk, {phase:Math.PI/5, capA:{hex:P.furDk}});
    tube(t1, t2, 0.019, 0.013, 5, P.tail,   {phase:Math.PI/5});
    tube(t2, t3, 0.013, 0.006, 5, P.tail,   {phase:Math.PI/5, capB:{hex:P.tailDk, lift:0.004}});
  }

  /* ---------- THE SWARM — 6 mice scattered across the Medium disc, varied facing/size/coat.
     Positions kept inside r~0.36 so bodies + tails stay over the disc; facings splay outward so it
     reads as a boiling mass fanning out, not a line. ---------- */
  //     cx      cz     yaw     sc     coat
  mouse( 0.02,  0.06,  -0.35,  1.00, P.fur);    // biggest, near-center, facing front-right
  mouse(-0.20, -0.02,   1.05,  0.86, P.fur2);   // left, turned away
  mouse( 0.22, -0.10,  -1.35,  0.80, P.fur3);   // right, facing back-right
  mouse(-0.06, -0.22,   2.55,  0.78, P.fur);    // rear, facing back
  mouse( 0.16,  0.20,   0.45,  0.74, P.fur2);   // front-right, facing out
  mouse(-0.22,  0.18,  -2.05,  0.72, P.fur3);   // front-left, facing back-left

  /* ---------- base disc (Medium: r=0.42, humanoid pattern — the swarm occupies a 5-ft space) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
