/* dev/model-qa/creatures/rlm-barnacle-golem.js — BARNACLE GOLEM (high-seas, Large Construct,
   CR 2). Read: a squat hull-PLATE golem — riveted iron/oak hullwood plates for a body — crusted
   floor to helm in barnacles and dripping kelp. Broad flat "hull" torso, short thick plated legs,
   a low helm-shaped head fused with a barnacle crown. VS-desaturated: tar-black hullwood + rust,
   barnacles a chalky grey-white, kelp a drab olive drip. Whole-object grammar: one function, one
   frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBarnacleGolem(){
  const P = {
    hull:0x2c2620, hullDk:0x1c1712, hullLt:0x3f362c,          // tarred hullwood
    rust:0x7a4a2c, rustDk:0x502e1a,
    barn:0xa8a394, barnDk:0x7c7768, barnLt:0xc4c0b0,          // chalky barnacle crust
    kelp:0x4a5230, kelpDk:0x333a20,
    rivet:0x201c18,
    disc:0x3a352b, discTop:0x46402f,
  };

  const L = { hipY:0.62, waistY:0.78, chestY:0.98, shldY:1.20, neckY:1.26, headY:1.38, crownY:1.56 };

  /* ---------- LEGS — short, thick, riveted hull-plate pillars. ---------- */
  {
    const leg=(sign)=>{
      const hip=V(sign*0.22,L.hipY-0.06,0), knee=V(sign*0.24,0.40,0.02), ank=V(sign*0.22,0.12,0);
      tube(hip,knee,0.155,0.130,6,P.hullDk,{phase:Math.PI/6});
      tube(knee,ank,0.130,0.110,6,P.hull,{phase:Math.PI/6,capB:{hex:P.hullDk,lift:0.015}});
      // flat plated foot
      stack([{y:0.10,rx:0.135,rz:0.170,cx:ank.x,cz:ank.z+0.05,hex:P.hullDk},{y:0.02,rx:0.150,rz:0.190,cx:ank.x,cz:ank.z+0.06,hex:P.rust}],
        6,{phase:Math.PI/6,capBot:{hex:P.rustDk}});
      // rivets down the shin
      for(const ry of [0.20,0.30]) quad(V(sign*0.24-0.02,ry,0.10),V(sign*0.24+0.02,ry,0.10),V(sign*0.24+0.015,ry+0.02,0.10),V(sign*0.24-0.015,ry+0.02,0.10),P.rivet,0.0);
    };
    leg(-1); leg(1);
  }

  /* ---------- TORSO — a broad flat riveted hull-plate hull, square-ish, barnacle-crusted. ---------- */
  stack([
    {y:L.hipY,   rx:0.300, rz:0.230, hex:P.hullDk},
    {y:L.waistY, rx:0.320, rz:0.245, hex:P.hull},
    {y:L.chestY, rx:0.360, rz:0.260, hex:P.hullLt},
    {y:L.shldY,  rx:0.400, rz:0.265, hex:P.hull},
  ], 6, {phase:Math.PI/6});
  // riveted plate seams
  for(const y of [L.waistY,L.chestY]){ const r=ring(V(0,y-0.02,0),V(0,1,0),0.33,0.25,6,Math.PI/6);
    const r2=ring(V(0,y+0.02,0),V(0,1,0),0.33,0.25,6,Math.PI/6); stitch([r,r2],()=>P.rivet); }
  // barnacle crust clusters climbing the hull front + flanks
  for(const [x,y,z,r] of [[0.14,L.chestY,0.24,0.06],[-0.16,L.waistY+0.04,0.22,0.05],[0.20,L.shldY-0.06,0.10,0.05],
                            [-0.10,L.chestY+0.08,0.24,0.045],[0.02,L.waistY-0.08,0.26,0.05],[-0.24,L.chestY,0.06,0.045]]){
    blob(x,y,z,r,r*0.8,r*0.6,P.barn,5,3);
  }
  // kelp drips hanging off the lower hull
  for(const [x,z] of [[-0.18,0.18],[0.12,0.20],[0.26,0.02]]){
    tube(V(x,L.hipY+0.06,z),V(x*1.1,L.hipY-0.22,z),0.02,0.006,4,P.kelp,{capB:{hex:P.kelpDk}});
  }

  /* ---------- HEAD — a low riveted helm-shape fused to the shoulders, barnacle crown on top. ---------- */
  {
    const bands=[
      {y:L.neckY, rx:0.155, rz:0.150, hex:P.hullDk},
      {y:L.headY, rx:0.175, rz:0.165, hex:P.hull},
      {y:L.crownY-0.08, rx:0.140, rz:0.130, hex:P.hullLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01),V(0,1,0),b.rx,b.rz,6,Math.PI/6));
    stitch(rings,b=>bands[b].hex);
    capFan(rings.at(-1),V(0,L.crownY-0.02,0),P.hullDk);
    // helm slit "eyes" — dark rectangular vision slit, no eye quads
    quad(V(-0.09,L.headY+0.02,0.155),V(0.09,L.headY+0.02,0.155),V(0.08,L.headY-0.03,0.15),V(-0.08,L.headY-0.03,0.15),P.rivet,0.0);
    // barnacle crown crusting the top of the helm
    for(const [dx,dz] of [[0,0],[0.06,0.04],[-0.06,0.04],[0.03,-0.05],[-0.03,-0.05]]){
      blob(dx,L.crownY+0.02,0.02+dz,0.045,0.04,0.035,P.barnLt,4,3);
    }
  }

  /* ---------- ARMS — short thick plated stumps ending in a fused barnacle-crusted fist mass. ---------- */
  {
    const arm=(sign)=>{
      const S=V(sign*0.40,L.shldY-0.06,0), E=V(sign*0.48,L.waistY+0.02,0.10);
      tube(S,E,0.135,0.110,6,P.hull,{phase:Math.PI/6});
      const fistC=V(E.x,E.y-0.08,E.z+0.02);
      stack([{y:fistC.y+0.06,rx:0.115,rz:0.120,cx:fistC.x,cz:fistC.z,hex:P.hullLt},
             {y:fistC.y-0.06,rx:0.130,rz:0.135,cx:fistC.x,cz:fistC.z,hex:P.hullDk}],
        6,{phase:Math.PI/6,capBot:{hex:P.rustDk,lift:0.01}});
      blob(fistC.x+sign*0.05,fistC.y,fistC.z+0.08,0.05,0.045,0.04,P.barn,4,3);
    };
    arm(-1); arm(1);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0),V(0,1,0),0.55,0.55,18);
    const r2=ring(V(0,0.050,0),V(0,1,0),0.53,0.53,18);
    stitch([r1,r2],()=>P.disc);
    capFan(r2,V(0,0.053,0),P.discTop);
  }
}
