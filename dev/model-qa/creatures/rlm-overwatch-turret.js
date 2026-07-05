/* dev/model-qa/creatures/rlm-overwatch-turret.js — the OVERWATCH TURRET (chrome realm, Small).
   A ceiling-mounted autocannon nest, tracking heat and motion. Read: a stubby armored swivel-base
   bolted to an overhead mount arm, a boxy sensor housing with a glowing heat-lens, and twin
   paired cannon barrels slung under the housing on a yoke. NO eye quads — the "eye" is a lensed
   glow-slot, not a socket. VS-desaturated gunmetal/chrome palette, scuffed and grimed. Whole-object
   grammar: one function, one frame, no anchors. Small size: base disc r=0.32 (the disc reads as the
   drop-shadow footprint under the ceiling mount, per the mount-arm convention). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildOverwatchTurret(){
  /* ---------- PALETTE ---------- */
  const P = {
    hull:0x54585c, hullDk:0x3a3d40, hullLt:0x6e7278,       // gunmetal housing
    joint:0x2c2e30,                                         // swivel joint / yoke
    barrel:0x232527, barrelLt:0x3c3e40,                     // twin cannon barrels
    mount:0x45484a,                                         // ceiling mount arm
    scuff:0x8a8d8f,                                          // scuff/scratch highlight
    lens:0xb4552a, lensDk:0x7a3418,                          // heat-tracking glow lens (amber)
    bolt:0x1c1d1e,
    disc:0x2a2b28, discTop:0x353631,
  };

  /* ---------- LANDMARKS — hangs from a ceiling mount, housing below, barrels slung forward. ---------- */
  const mY = 0.92;                              // mount height (near "ceiling", disc still at y0)
  const S = {
    mountTop:  V(0, mY+0.10, -0.10),
    mountArm:  V(0, mY-0.02, -0.06),
    yoke:      V(0, mY-0.14,  0.00),
    housing:   V(0, mY-0.26,  0.03),
    lensC:     V(0, mY-0.28,  0.14),
  };

  /* ---------- MOUNT ARM — bolts to the ceiling, drops down to the swivel yoke. ---------- */
  tube(S.mountTop, S.mountArm, 0.052, 0.062, 6, P.mount, {phase:Math.PI/6});
  tube(S.mountArm, S.yoke,     0.062, 0.072, 6, P.joint, {phase:Math.PI/6});
  // ceiling flange
  {
    const r1 = ring(V(0, mY+0.11, -0.10), V(0,1,0), 0.10, 0.10, 8, Math.PI/8);
    capFan(r1, V(0, mY+0.135, -0.10), P.hullDk);
  }
  // bolt heads around the flange
  for(let i=0;i<4;i++){
    const a = i*Math.PI/2 + 0.3;
    tube(V(Math.cos(a)*0.085, mY+0.11, -0.10+Math.sin(a)*0.085), V(Math.cos(a)*0.085, mY+0.125, -0.10+Math.sin(a)*0.085), 0.012, 0.012, 4, P.bolt);
  }

  /* ---------- HOUSING — boxy sensor/motor housing, swiveled forward on the yoke. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:mY-0.15, cz:0.00, rx:0.150, rz:0.140, hex:P.joint},
      {y:mY-0.20, cz:0.04, rx:0.185, rz:0.170, hex:P.hull},
      {y:mY-0.30, cz:0.06, rx:0.175, rz:0.165, hex:P.hullLt},
      {y:mY-0.38, cz:0.05, rx:0.140, rz:0.135, hex:P.hullDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0, mY-0.13, 0.00), P.joint);
    capFan(rings.at(-1), V(0, mY-0.41, 0.05), P.hullDk, true);

    // scuff streaks on the housing flank
    quad(V(-0.15,mY-0.22,0.10), V(-0.09,mY-0.22,0.12), V(-0.10,mY-0.32,0.10), V(-0.16,mY-0.32,0.08), P.scuff, 0.05);
    quad(V(0.10,mY-0.19,0.14), V(0.16,mY-0.19,0.12), V(0.15,mY-0.28,0.11), V(0.09,mY-0.28,0.13), P.scuff, 0.05);
  }

  /* ---------- HEAT-LENS — a glowing amber tracking lens set in the front of the housing (no eye quad shape: a recessed slotted lens). ---------- */
  {
    const c = S.lensC;
    const rOut = ring(c, V(0,0.15,1), 0.075, 0.075, 8, Math.PI/8);
    const rIn  = ring(V(c.x,c.y,c.z-0.015), V(0,0.15,1), 0.075, 0.075, 8, Math.PI/8);
    stitch([rOut, rIn], ()=>P.hullDk);
    // recessed glow slot (slotted, not round-eye)
    for(const dy of [-0.02,0,0.02]){
      quad(V(c.x-0.05,c.y+dy-0.006,c.z-0.02), V(c.x+0.05,c.y+dy-0.006,c.z-0.02),
           V(c.x+0.05,c.y+dy+0.006,c.z-0.03), V(c.x-0.05,c.y+dy+0.006,c.z-0.03), dy===0?P.lens:P.lensDk, 0.06);
    }
  }

  /* ---------- TWIN CANNON BARRELS — slung under the housing on a yoke, paired side by side. ---------- */
  {
    const yokeC = V(0, mY-0.36, 0.06);
    quad(V(-0.09,yokeC.y+0.03,yokeC.z-0.03), V(0.09,yokeC.y+0.03,yokeC.z-0.03),
         V(0.09,yokeC.y-0.03,yokeC.z-0.03), V(-0.09,yokeC.y-0.03,yokeC.z-0.03), P.joint, 0.04);
    for(const s of [-1,1]){
      const bBase = V(s*0.05, yokeC.y, yokeC.z+0.02);
      const bTip  = V(s*0.05, yokeC.y-0.02, yokeC.z+0.42);
      tube(bBase, bTip, 0.032, 0.026, 6, P.barrel, {phase:Math.PI/6, capB:{hex:P.barrelLt, lift:0.01}});
      // muzzle collar
      const collar = V(s*0.05, yokeC.y-0.018, yokeC.z+0.36);
      tube(collar, V(s*0.05,yokeC.y-0.019,yokeC.z+0.40), 0.034, 0.030, 6, P.hullDk);
    }
  }

  /* ---------- base disc (Small: r=0.32) — drop-shadow footprint beneath the ceiling mount ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.030,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.032,0), P.discTop);
  }
}
