/* dev/model-qa/creatures/rlm-the-deathless-mutiny.js — THE DEATHLESS MUTINY (high-seas, Large
   Undead, CR 16). Read: a fused mass of mutineers' corpses forming ONE many-armed horror — a
   central hunched torso-knot of merged bodies, many arms (6+) radiating outward at different
   angles each ending in a grasping rotted hand, several slack corpse-heads fused into the mass.
   VS-desaturated: waterlogged grey-green corpse flesh, tattered sailor-rag browns, bone showing
   through at the worst joins. Whole-object grammar: one function, one frame, no anchors. Large
   size, base disc r=0.55. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTheDeathlessMutiny(){
  const P = {
    skin:0x545e54, skinDk:0x3a423a, skinLt:0x6c766a,
    rag:0x4a3e2e, ragDk:0x2e2620, ragLt:0x5e5038,
    bone:0x8c8270, boneDk:0x5c5648,
    wound:0x3a1c1c, hair:0x201c18,
    disc:0x2e3436, discTop:0x3a4244,
  };

  const L = { hipY:0.60, waistY:0.86, chestY:1.14, shldY:1.34, neckY:1.44 };

  /* ---------- CENTRAL KNOT — a hunched fused-corpse mass, wider and lumpier than a normal torso. ---------- */
  stack([
    {y:L.hipY,   rx:0.320, rz:0.300, hex:P.skinDk},
    {y:L.waistY, rx:0.360, rz:0.330, hex:P.skin},
    {y:L.chestY, rx:0.400, rz:0.340, hex:P.skinLt},
    {y:L.shldY,  rx:0.360, rz:0.300, hex:P.skin},
    {y:L.neckY,  rx:0.220, rz:0.200, hex:P.skinDk},
  ], 8, {phase:Math.PI/8});
  // ragged tattered sailor-clothing scraps clinging to the mass
  for(const [x,y,z,w,h] of [[0.16,L.chestY,0.22,0.14,0.20],[-0.20,L.waistY,0.20,0.12,0.18],[0.02,L.hipY+0.06,0.26,0.16,0.16]]){
    quad(V(x-w/2,y+h/2,z),V(x+w/2,y+h/2,z),V(x+w/2*0.7,y-h/2,z+0.04),V(x-w/2*0.7,y-h/2,z+0.04),P.rag,0.06);
  }
  // bone showing through at a couple of the worst joins
  for(const [x,y,z] of [[0.12,L.waistY+0.06,0.28],[-0.10,L.chestY,0.26]]) blob(x,y,z,0.035,0.03,0.02,P.bone,4,3);
  // dark wound/seam gashes where bodies fuse together
  for(const [x0,y0,x1,y1] of [[-0.20,L.chestY,0.05,L.waistY+0.05],[0.15,L.shldY-0.05,0.28,L.chestY-0.05]]){
    quad(V(x0-0.02,y0,0.30),V(x0+0.02,y0,0.30),V(x1+0.015,y1,0.28),V(x1-0.015,y1,0.28),P.wound,0.05);
  }

  /* ---------- FUSED HEADS — 2 slack secondary corpse-heads sunk into the mass + 1 primary raised head. ---------- */
  {
    // primary head, raised center
    const bands=[
      {y:L.neckY+0.06, rx:0.130, rz:0.135, hex:P.skin},
      {y:L.neckY+0.20, rx:0.115, rz:0.110, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.03),V(0,1,0),b.rx,b.rz,8,Math.PI/8));
    stitch(rings,b=>bands[b].hex);
    capFan(rings.at(-1),V(0,L.neckY+0.28,0.02),P.skinDk);
    quad(V(-0.05,L.neckY+0.02,0.16),V(0.05,L.neckY+0.02,0.16),V(0.035,L.neckY-0.04,0.155),V(-0.035,L.neckY-0.04,0.155),P.wound,0.04);
    for(const s of [-1,1]) quad(V(s*0.05,L.neckY+0.10,0.15),V(s*0.075,L.neckY+0.10,0.15),V(s*0.065,L.neckY+0.04,0.14),V(s*0.055,L.neckY+0.04,0.14),P.wound,0.0);
    // secondary slack heads sunk sideways into the shoulders
    for(const sign of [-1,1]){
      const c=V(sign*0.32,L.shldY+0.02,0.10);
      const b2=[ {y:c.y-0.06,rx:0.09,rz:0.095,hex:P.skinDk}, {y:c.y+0.06,rx:0.075,rz:0.07,hex:P.skin} ];
      const r2=b2.map(b=>ring(V(c.x,b.y,c.z),V(0,1,0),b.rx,b.rz,6,Math.PI/6));
      stitch(r2,b=>b2[b].hex);
      capFan(r2.at(-1),V(c.x,c.y+0.11,c.z-0.02),P.skinDk);
    }
  }

  /* ---------- MANY ARMS — 6 arms radiating out from the knot at varied angles, grasping rotted hands. ---------- */
  {
    const arm=(S,E,W,hex)=>{
      tube(S,E,0.100,0.078,6,hex);
      tube(E,W,0.078,0.058,6,P.skinDk,{capB:{hex:P.skinDk,lift:0.01}});
      // grasping fingers, splayed
      for(const [fdx,fdz] of [[-0.04,0.06],[-0.015,0.075],[0.015,0.07],[0.045,0.055]]){
        tube(W,V(W.x+fdx,W.y-0.03,W.z+fdz),0.014,0.005,4,P.skinDk,{capB:{hex:P.skinDk}});
      }
    };
    arm(V(0.34,L.shldY,0.04),  V(0.56,L.chestY+0.10,-0.10), V(0.62,L.neckY+0.10,-0.30), P.skin);
    arm(V(-0.34,L.shldY,0.04), V(-0.58,L.waistY+0.08,0.20), V(-0.66,L.hipY-0.10,0.42),  P.skinLt);
    arm(V(0.30,L.chestY-0.04,0.16), V(0.48,L.waistY-0.06,0.36), V(0.44,L.hipY-0.14,0.56), P.skinDk);
    arm(V(-0.30,L.chestY-0.04,0.16), V(-0.44,L.chestY+0.16,0.32), V(-0.36,L.shldY+0.20,0.44), P.skin);
    arm(V(0.20,L.waistY,0.24), V(0.10,L.hipY-0.20,0.44), V(-0.06,L.hipY-0.34,0.58), P.skinLt);
    arm(V(-0.18,L.waistY+0.04,0.22), V(-0.02,L.chestY+0.20,0.30), V(0.10,L.shldY+0.24,0.32), P.skinDk);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0),V(0,1,0),0.55,0.55,18);
    const r2=ring(V(0,0.050,0),V(0,1,0),0.53,0.53,18);
    stitch([r1,r2],()=>P.disc);
    capFan(r2,V(0,0.053,0),P.discTop);
  }
}
