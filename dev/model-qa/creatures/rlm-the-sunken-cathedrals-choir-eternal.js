/* dev/model-qa/creatures/rlm-the-sunken-cathedrals-choir-eternal.js — THE SUNKEN CATHEDRAL'S
   CHOIR ETERNAL (high-seas, Huge Undead, CR 17). Read: a coral-crowned LICH enthroned in a drowned
   cathedral nave — a gaunt robed lich figure seated on a tall coral-fused choir-stall throne, choir
   pipes (organ-pipe silhouette) rising behind like a halo, drowned in kelp and barnacle. VS-
   desaturated: bone-pale lich flesh, rotted violet-black vestments, reef-coral throne bone-pale
   with rust-red accents, dull verdigris pipe-metal. Whole-object grammar: one function, one frame,
   no anchors. Huge size, base disc r=0.68. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTheSunkenCathedralsChoirEternal(){
  const P = {
    bone:0xa89c88, boneDk:0x746a58, boneLt:0xc4b8a0,
    robe:0x322638, robeDk:0x1e1622, robeLt:0x463652,
    coral:0x8a7a68, coralDk:0x5e5346, coralRed:0x8a4a3c,
    pipe:0x4a5c56, pipeDk:0x323e3a, pipeLt:0x647a70,          // verdigris organ-pipe metal
    kelp:0x3a4226, kelpDk:0x282e1a,
    crown:0x6e5a44,
    disc:0x1c2020, discTop:0x262c2a,
  };

  const L = { seatY:0.90, hipY:1.10, waistY:1.36, chestY:1.62, shldY:1.84, neckY:1.94, jawY:2.04, crownY:2.24 };

  /* ---------- CHOIR-PIPE HALO — a rank of tall organ pipes rising behind the throne, halo shape. ---------- */
  {
    const pipeXs=[-0.60,-0.42,-0.24,-0.08,0.08,0.24,0.42,0.60];
    const heights=[1.60,2.10,2.55,2.85,2.85,2.55,2.10,1.60];
    for(let i=0;i<pipeXs.length;i++){
      const x=pipeXs[i], h=heights[i];
      const base=V(x,0.10,-0.34), top=V(x*0.9,h,-0.30);
      tube(base,top,0.075,0.055,6,i%2===0?P.pipe:P.pipeDk,{capB:{hex:P.pipeLt,lift:0.02}});
    }
  }

  /* ---------- THRONE — coral-fused choir-stall, tall coral spires flanking the seat. ---------- */
  {
    stack([
      {y:0.06, rx:0.44, rz:0.40, hex:P.coralDk},
      {y:0.40, rx:0.40, rz:0.36, hex:P.coral},
      {y:L.seatY-0.06, rx:0.36, rz:0.32, hex:P.coral},
    ], 8, {phase:Math.PI/8});
    // flanking coral spires
    for(const sign of [-1,1]){
      const b=V(sign*0.38,L.seatY-0.10,-0.16), t=V(sign*0.44,L.chestY+0.30,-0.20);
      tube(b,t,0.10,0.03,6,P.coral,{capB:{hex:P.coralDk,lift:0.02}});
      for(const dy of [0.3,0.6]){
        const p=b.clone().lerp(t,dy);
        tube(p,V(p.x+sign*0.08,p.y+0.06,p.z),0.03,0.006,4,P.coralRed,{capB:{hex:P.coralRed}});
      }
    }
    // kelp drape over the throne arms
    for(const [x,z] of [[-0.36,-0.10],[0.34,-0.06]]) tube(V(x,L.seatY,z),V(x*1.1,L.seatY-0.30,z+0.06),0.02,0.006,4,P.kelp,{capB:{hex:P.kelpDk}});
  }

  /* ---------- SEATED FIGURE — gaunt robed lich, hunched enthroned. ---------- */
  quad(V(-0.22,L.seatY+0.02,0.14),V(0.22,L.seatY+0.02,0.14),V(0.28,L.hipY-0.06,-0.10),V(-0.28,L.hipY-0.06,-0.10),P.robe,0.05);

  stack([
    {y:L.hipY,   rx:0.260, rz:0.230, hex:P.robeDk},
    {y:L.waistY, rx:0.230, rz:0.205, hex:P.robe},
    {y:L.chestY, rx:0.260, rz:0.220, hex:P.robeLt},
    {y:L.shldY,  rx:0.300, rz:0.230, hex:P.robe},
    {y:L.neckY,  rx:0.130, rz:0.125, hex:P.boneDk},
  ], 8, {phase:Math.PI/8});
  // ragged vestment hem trailing + a bone amulet at the chest
  quad(V(-0.12,L.chestY+0.02,0.20),V(0.12,L.chestY+0.02,0.20),V(0.08,L.waistY-0.06,0.24),V(-0.08,L.waistY-0.06,0.24),P.boneLt,0.04);

  /* ---------- HEAD — gaunt lich skull, coral crown fused to the brow. ---------- */
  {
    const bands=[
      {y:L.jawY,   rx:0.115, rz:0.120, hex:P.bone},
      {y:L.jawY+0.10, rx:0.125, rz:0.125, hex:P.boneLt},
      {y:L.crownY-0.14, rx:0.105, rz:0.100, hex:P.boneDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01),V(0,1,0),b.rx,b.rz,8,Math.PI/8));
    stitch(rings,b=>bands[b].hex);
    capFan(rings.at(-1),V(0,L.crownY-0.06,0),P.boneDk);
    // hollow eye sockets, no eye quads
    for(const s of [-1,1]) quad(V(s*0.045,L.jawY+0.14,0.105),V(s*0.068,L.jawY+0.14,0.105),V(s*0.06,L.jawY+0.06,0.095),V(s*0.048,L.jawY+0.06,0.095),P.robeDk,0.0);
    // gaunt jaw line
    quad(V(-0.05,L.jawY-0.06,0.10),V(0.05,L.jawY-0.06,0.10),V(0.035,L.jawY-0.12,0.09),V(-0.035,L.jawY-0.12,0.09),P.robeDk,0.03);
    // coral crown fused to the skull
    for(const [dx,dz,h] of [[0,0.02,0.22],[0.09,0.01,0.16],[-0.09,0.01,0.16],[0.05,-0.06,0.13],[-0.05,-0.06,0.13]]){
      const b=V(dx,L.crownY-0.08,dz), t=V(dx*1.4,L.crownY-0.08+h,dz*1.3);
      tube(b,t,0.035,0.010,5,P.coral,{capB:{hex:P.coralDk,lift:0.01}});
    }
  }

  /* ---------- ARMS — gaunt, one raised conducting the choir, one resting on the throne arm. ---------- */
  {
    const S=V(0.28,L.shldY-0.02,0), E=V(0.42,L.chestY+0.14,-0.06), W=V(0.40,L.neckY+0.28,-0.14);
    tube(S,E,0.095,0.070,6,P.robe); tube(E,W,0.070,0.045,6,P.bone,{capB:{hex:P.boneDk,lift:0.01}});
    for(const fd of [-0.02,0.02]) tube(W,V(W.x+fd,W.y+0.06,W.z-0.02),0.012,0.004,3,P.boneDk,{capB:{hex:P.boneDk}});
    const S2=V(-0.28,L.shldY-0.02,0), E2=V(-0.36,L.waistY+0.06,0.14), W2=V(-0.34,L.seatY+0.06,0.10);
    tube(S2,E2,0.095,0.070,6,P.robe); tube(E2,W2,0.070,0.045,6,P.bone,{capB:{hex:P.boneDk,lift:0.01}});
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0),V(0,1,0),0.68,0.68,20);
    const r2=ring(V(0,0.055,0),V(0,1,0),0.66,0.66,20);
    stitch([r1,r2],()=>P.disc);
    capFan(r2,V(0,0.058,0),P.discTop);
  }
}
