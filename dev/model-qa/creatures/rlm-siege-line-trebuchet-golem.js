/* dev/model-qa/creatures/rlm-siege-line-trebuchet-golem.js — Siege-Line Trebuchet Golem
   (theater/siege era-lens, Huge, CR 7). A hulking trebuchet fused into a construct that aims and
   looses ITSELF — a massive timber-and-stone frame walking on two thick splayed legs, a long throwing
   arm cocked back over its "shoulders" with a counterweight box at the short end and a sling cradling
   a boulder at the long end. Whole-object grammar: one merged frame, no anchors. VS-desaturated
   weathered siege-timber palette (grey-brown oak, rope ochre, iron-black fittings, dull stone
   counterweight/shot). NO eye quads — this is inert war-machine, no face at all. Huge size: base
   disc r=0.68. Keep abstracted (no nation/era markers beyond generic siege timber). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSiegeLineTrebuchetGolem(){
  const P = {
    wood:0x5c5142, woodDk:0x3c342a, woodLt:0x726556,
    iron:0x2c2823, ironLt:0x4a443c,
    rope:0x7a6a44, ropeDk:0x584a2e,
    stone:0x6e695f, stoneDk:0x4c473f,
    box:0x453b2f, boxDk:0x2e271e,
    disc:0x453f34, discTop:0x524b3c,
  };

  /* ---------- LANDMARKS — a squat wide frame ~1.5u tall at the shoulder pivot, arm sweeping up
     and back to ~2.0u, huge splayed legs. ---------- */
  const L = {
    hipY:0.42, frameY:0.98, pivotY:1.30, shoulderX:0.34,
  };

  /* ===== BASE FRAME — a broad timber crib the whole machine stands on, like a sled/chassis. ===== */
  {
    const bands=[
      {y:L.hipY-0.10, cz:0, rx:0.44, rz:0.62, hex:P.woodDk},
      {y:L.hipY+0.06, cz:0, rx:0.46, rz:0.64, hex:P.wood},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 4, Math.PI/4));
    stitch(rings, b=>bands[b].hex);
    // cross-braces
    for(const z of [-0.4,0,0.4]) quad(V(-0.46,L.hipY-0.02,z-0.03),V(0.46,L.hipY-0.02,z-0.03),
      V(0.46,L.hipY+0.06,z+0.03),V(-0.46,L.hipY+0.06,z+0.03), P.woodDk, 0.05);
  }

  /* ===== LEGS — two huge thick square-timber "legs" (post-and-brace stilts) planted wide, the
     construct's locomotion. Splayed like an A-frame footing that also walks. ===== */
  {
    const leg=(sign)=>{
      const hip = V(sign*L.shoulderX, L.hipY+0.05, 0.05);
      const knee= V(sign*(L.shoulderX+0.10), 0.20, 0.10);
      const foot= V(sign*(L.shoulderX+0.16), 0.05, 0.14);
      tube(hip, knee, 0.135, 0.115, 4, P.wood, {phase:Math.PI/4, capA:{hex:P.woodDk}});
      tube(knee, foot, 0.115, 0.150, 4, P.woodDk, {phase:Math.PI/4, capB:{hex:P.ironLt, lift:0.02}});
      // iron foot-shoe
      quad(V(foot.x-0.14,0.02,foot.z-0.10), V(foot.x+0.14,0.02,foot.z-0.10),
           V(foot.x+0.12,0.02,foot.z+0.16), V(foot.x-0.12,0.02,foot.z+0.16), P.iron, 0.03);
    };
    leg(-1); leg(1);
  }

  /* ===== A-FRAME TOWER — the twin uprights bracing the pivot, splayed like a real trebuchet A-frame,
     rooted in the base and crossing near the top where the throwing arm pivots. ===== */
  {
    const upright=(sign)=>{
      const base = V(sign*0.30, L.frameY-0.50, -0.06);
      const top   = V(sign*0.05, L.pivotY, 0.02);
      tube(base, top, 0.075, 0.055, 4, P.wood, {phase:Math.PI/4, capA:{hex:P.woodDk}});
    };
    upright(-1); upright(1);
    // cross brace lashings
    quad(V(-0.20,L.frameY-0.05,-0.02), V(0.20,L.frameY-0.05,-0.02),
         V(0.17,L.frameY+0.05,0.02), V(-0.17,L.frameY+0.05,0.02), P.ropeDk, 0.05);
    // pivot axle block at the apex
    quad(V(-0.09,L.pivotY-0.03,-0.02), V(0.09,L.pivotY-0.03,-0.02),
         V(0.09,L.pivotY+0.05,0.02), V(-0.09,L.pivotY+0.05,0.02), P.iron, 0.03);
  }

  /* ===== THROWING ARM — the dominant silhouette: a long tapering timber beam pivoting through
     the A-frame apex, cocked so the SHORT end (with the counterweight box) is DOWN/forward-low and
     the LONG end sweeps up and back overhead ending in a sling cradling a boulder. ===== */
  {
    const pivot = V(0, L.pivotY+0.02, 0.0);
    const shortEnd = V(0.06, L.frameY-0.34, 0.46);      // short arm, counterweight end, low/fwd
    const longMid  = V(-0.10, L.pivotY+0.55, -0.30);
    const longEnd  = V(-0.22, L.pivotY+0.95, -0.62);    // long arm tip, high/back
    tube(pivot, shortEnd, 0.075, 0.095, 6, P.woodLt, {capB:{hex:P.woodDk, lift:0.03}});
    tube(pivot, longMid, 0.075, 0.052, 6, P.wood);
    tube(longMid, longEnd, 0.052, 0.028, 6, P.woodDk, {capB:{hex:P.ironLt, lift:0.01}});

    // COUNTERWEIGHT BOX — a heavy iron-strapped stone box hanging off the short end.
    {
      const cwC = V(shortEnd.x+0.04, shortEnd.y-0.16, shortEnd.z+0.06);
      const bands=[
        {y:cwC.y-0.12, rx:0.15, rz:0.15, hex:P.boxDk},
        {y:cwC.y+0.12, rx:0.16, rz:0.16, hex:P.box},
      ];
      const rings=bands.map(b=>ring(V(cwC.x,b.y,cwC.z), V(0,1,0), b.rx, b.rz, 4, Math.PI/4));
      stitch(rings, b=>bands[b].hex);
      capFan(rings.at(-1), V(cwC.x,cwC.y+0.14,cwC.z), P.iron);
      // hanging chain-link from arm to box top
      tube(shortEnd, V(cwC.x,cwC.y+0.14,cwC.z), 0.02,0.02, 4, P.iron);
      // iron corner straps on the box
      for(const s of [-1,1]) quad(V(cwC.x+s*0.15,cwC.y-0.12,cwC.z-0.02),V(cwC.x+s*0.15,cwC.y+0.12,cwC.z-0.02),
        V(cwC.x+s*0.16,cwC.y+0.12,cwC.z+0.02),V(cwC.x+s*0.16,cwC.y-0.12,cwC.z+0.02), P.iron, 0.04);
    }

    // SLING + BOULDER at the long end, hanging below the tip, mid-swing.
    {
      const tip = longEnd;
      const cradle = V(tip.x-0.10, tip.y-0.22, tip.z-0.10);
      tube(tip, cradle, 0.014,0.014, 4, P.ropeDk);
      const bands=[
        {y:cradle.y-0.10, rx:0.115, rz:0.115, hex:P.stoneDk},
        {y:cradle.y+0.02, rx:0.130, rz:0.130, hex:P.stone},
      ];
      const rings=bands.map(b=>ring(V(cradle.x,b.y,cradle.z), V(0,1,0), b.rx, b.rz, 6, Math.PI/6));
      stitch(rings, b=>bands[b].hex);
      capFan(rings.at(-1), V(cradle.x,cradle.y+0.08,cradle.z), P.stone);
      capFan(rings[0], V(cradle.x,cradle.y-0.13,cradle.z), P.stoneDk, true);
      // sling ropes cradling the boulder underneath
      quad(V(cradle.x-0.10,cradle.y-0.06,cradle.z), V(cradle.x+0.10,cradle.y-0.06,cradle.z),
           V(tip.x+0.02,tip.y-0.05,tip.z+0.02), V(tip.x-0.02,tip.y-0.05,tip.z-0.02), P.rope, 0.05);
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
