/* dev/model-qa/creatures/rlm-junk-titan-enforcer.js — JUNK-TITAN ENFORCER (ash realm, Large
   Construct, CR 7). Read: a compound-gate scrap titan — a hulking bipedal frame welded from
   girders, oil-drum torso, license-plate armor plating, a crushing slab-fist raised, riveted
   scrap-plate head with a single slit sensor-eye (no eye quad, a lit slit only). VS-desaturated
   rust/ash palette: corroded rust-orange, dull gunmetal, faded paint-flake plates. Whole-object
   grammar: one function, one merged frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildJunkTitanEnforcer(){
  const P = {
    iron:0x4a463e, ironDk:0x2c2a24, ironLt:0x615c50,
    rust:0x7a4a2e, rustDk:0x4e2f1c, rustLt:0x96603c,
    drum:0x515a48, drumDk:0x333a2a,
    plate:0x5c5648, plateDk:0x38352a,
    rivet:0x201d18,
    sensor:0x9c4028, sensorDk:0x5c2416,
    chain:0x403c34,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.85, waistY:1.05, drumY:1.35, chestY:1.65, shldY:1.95, neckY:2.05,
    jawY:2.15, browY:2.30, crownY:2.42,
    shoulderX:0.360,
  };

  /* ---------- LEGS — massive girder-legs, riveted plate armor, wide braced stance. ---------- */
  {
    const hipL=V(-0.24,L.hipY-0.03,0.02), kneeL=V(-0.27,0.50,0.10), ankL=V(-0.25,0.13,0.04);
    const hipR=V(0.24,L.hipY-0.03,-0.02), kneeR=V(0.27,0.50,-0.10), ankR=V(0.25,0.13,-0.04);
    tube(hipL,kneeL,0.210,0.155,7,P.iron);
    tube(kneeL,ankL,0.150,0.110,7,P.ironDk);
    tube(hipR,kneeR,0.210,0.155,7,P.iron);
    tube(kneeR,ankR,0.150,0.110,7,P.ironDk);
    // rust bleed streaks down the legs
    for(const [x,y] of [[-0.26,0.36],[0.26,0.30]]) quad(V(x-0.03,y,0.10),V(x+0.03,y,0.10),V(x+0.024,y-0.16,0.09),V(x-0.024,y-0.16,0.09),P.rust,0.07);
    // riveted seams
    for(const x of [-0.26,0.26]) for(const y of [0.60,0.40]) quad(V(x-0.02,y,0.13),V(x+0.02,y,0.13),V(x+0.016,y-0.03,0.125),V(x-0.016,y-0.03,0.125),P.rivet,0.03);
    // wide flat scrap-plate feet
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.055,ank.z);
      tube(heel.clone().add(V(0,0,-0.08)), heel.clone().add(V(0,0,0.24)), 0.135,0.115,6,P.ironDk,{capA:{hex:P.iron}});
    }
  }

  /* ---------- TORSO — an oil-drum core wrapped in riveted license-plate armor. ---------- */
  stack([
    {y:L.hipY,   rx:0.230, rz:0.200, hex:P.ironDk},
    {y:L.waistY, rx:0.260, rz:0.220, hex:P.iron},
    {y:L.drumY,  rx:0.300, rz:0.250, hex:P.drum},
    {y:L.chestY, rx:0.310, rz:0.245, hex:P.drumDk},
    {y:L.shldY,  rx:0.340, rz:0.240, hex:P.iron},
    {y:L.neckY,  rx:0.130, rz:0.120, hex:P.ironDk},
  ], 9, {capTop:{hex:P.ironDk, lift:0.008}});
  // welded plate patches across the drum torso
  for(const [x0,y0,x1,y1,w] of [[-0.14,L.chestY+0.06,-0.02,L.drumY-0.04,0.16],[0.10,L.shldY-0.02,0.20,L.chestY,0.14]]){
    quad(V(x0,y0,0.24),V(x0+w,y0-0.01,0.235),V(x1+w*0.9,y1,0.225),V(x1,y1+0.01,0.23), P.plate, 0.06);
  }
  for(const [x,y] of [[-0.08,L.chestY],[0.06,L.drumY-0.05],[-0.16,L.waistY+0.05],[0.18,L.shldY-0.08]]) quad(V(x-0.018,y,0.30),V(x+0.018,y,0.30),V(x+0.014,y-0.026,0.295),V(x-0.014,y-0.026,0.295),P.rivet,0.02);
  // hanging tow-chain across the chest
  quad(V(-0.20,L.shldY-0.05,0.20), V(0.22,L.chestY-0.10,0.18), V(0.20,L.chestY-0.18,0.18), V(-0.18,L.shldY-0.13,0.20), P.chain, 0.08);
  // shoulder plate bulks
  for(const s of [-1,1]) blob(s*L.shoulderX,L.shldY+0.03,0.0, 0.15,0.11,0.13,P.iron,7,3);

  /* ---------- HEAD — riveted scrap-plate skull-box, single lit sensor-slit (no eye quad). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.140, rz:0.130, hex:P.iron},
      {y:L.jawY+0.10, rx:0.150, rz:0.140, hex:P.ironLt},
      {y:L.browY,  rx:0.135, rz:0.120, hex:P.ironDk},
      {y:L.crownY, rx:0.105, rz:0.098, hex:P.ironDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.crownY+0.03,0.0), P.ironDk);
    // single glowing sensor slit across the brow (no eye quads — a lit slit shape)
    quad(V(-0.08,L.browY+0.01,0.115),V(0.08,L.browY+0.01,0.115),V(0.075,L.browY-0.02,0.112),V(-0.075,L.browY-0.02,0.112), P.sensor, 0.06);
    quad(V(-0.06,L.browY,0.118),V(0.06,L.browY,0.118),V(0.055,L.browY-0.012,0.116),V(-0.055,L.browY-0.012,0.116), P.sensorDk, 0.04);
    // jaw vent-grille lines
    for(const y of [L.jawY-0.03,L.jawY-0.06,L.jawY-0.09]) quad(V(-0.09,y,0.135),V(0.09,y,0.135),V(0.085,y-0.012,0.132),V(-0.085,y-0.012,0.132),P.rivet,0.03);
  }

  /* ---------- ARMS — one crushing slab-fist RAISED, the other a lowered wrecking-claw. ---------- */
  {
    // raised slab-fist arm (right)
    const S=V(L.shoulderX,L.shldY-0.05,0.0), E=V(0.42,L.shldY+0.20,0.16), W=V(0.36,L.crownY+0.05,0.10);
    tube(S,E,0.150,0.115,7,P.iron);
    tube(E,W,0.115,0.100,6,P.ironDk);
    // slab-fist block
    quad(V(0.24,L.crownY+0.20,0.02),V(0.48,L.crownY+0.20,0.02),V(0.46,L.crownY-0.02,0.20),V(0.26,L.crownY-0.02,0.20), P.ironLt, 0.06);
    blob(0.36,L.crownY+0.10,0.10, 0.15,0.13,0.15,P.iron,7,3);
    // lowered wrecking-claw arm (left)
    const S2=V(-L.shoulderX,L.shldY-0.05,0.0), E2=V(-0.40,0.90,0.20), W2=V(-0.34,0.45,0.30);
    tube(S2,E2,0.150,0.110,7,P.iron);
    tube(E2,W2,0.110,0.080,6,P.ironDk,{capB:{hex:P.rustLt,lift:0.01}});
    for(const [dx,dz] of [[0.05,0.10],[0.0,0.13],[-0.05,0.10]]){
      const cb=V(-0.34,0.44,0.29), ct=V(-0.34+dx,0.18,0.30+dz);
      tube(cb,ct,0.045,0.014,4,P.rust,{capB:{hex:P.rustDk,lift:0.006}});
    }
  }

  /* ---------- base disc (Large r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
