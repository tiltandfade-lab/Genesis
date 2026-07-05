/* dev/model-qa/creatures/rlm-the-horizons-own-reckoning.js — THE HORIZON'S OWN RECKONING
   (high-seas, Huge Undead, CR 19). Read: a burning derelict SHIP-CAPTAIN given monstrous scale —
   a tattered greatcoat figure wreathed floor-to-crown in storm-fire, standing chained at the wrist
   to a great ship's wheel whose spokes are fused drowned hands gripping the rim. VS-desaturated:
   charred coat-black + storm-blue-grey skin, fire read as dull ember-orange/violet (never candy),
   the wheel weathered oak gone bone-pale. Whole-object grammar: one function, one frame, no
   anchors. Huge size, base disc r=0.68. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTheHorizonsOwnReckoning(){
  const P = {
    coat:0x24211f, coatDk:0x161412, coatLt:0x322e29, tatter:0x1c1a18,
    skin:0x4a5560, skinDk:0x333c45, skinLt:0x63707c,           // storm-blue-grey drowned skin
    fire:0x8a3a1c, fireDk:0x5c260f, fireLt:0xc06428, fireVio:0x5a3a68,
    chain:0x2b2823, chainLt:0x3f3a32,
    wheel:0x9c8f74, wheelDk:0x6e6350, wheelLt:0xb8ac90,        // bone-pale weathered oak
    hand:0x505a52, handDk:0x36403a,                             // drowned-hand spokes
    buckle:0x554a38, hatDk:0x18100c,
    disc:0x2e3436, discTop:0x3a4244,
  };

  const L = { hipY:0.90, waistY:1.30, chestY:1.72, shldY:2.10, neckY:2.24, jawY:2.36, crownY:2.58 };

  /* ---------- LEGS — long tattered coat-skirts hiding the stance, planted wide on the deck. ---------- */
  {
    const leg=(sign)=>{
      const hip=V(sign*0.20,L.hipY-0.10,0), knee=V(sign*0.22,0.62,0.04), ank=V(sign*0.20,0.20,0.02);
      tube(hip,knee,0.185,0.145,7,P.coatDk); tube(knee,ank,0.145,0.110,7,P.coat,{capB:{hex:P.coatDk,lift:0.02}});
      // boot
      stack([{y:0.16,rx:0.14,rz:0.20,cx:ank.x,cz:ank.z+0.05,hex:P.coatDk},{y:0.05,rx:0.15,rz:0.24,cx:ank.x,cz:ank.z+0.08,hex:P.tatter}],
        6,{phase:Math.PI/6,capBot:{hex:P.tatter}});
    };
    leg(-1); leg(1);
  }
  /* tattered coat-skirt panels flaring around the legs, burning at the hems */
  for(const [sx,sz] of [[-0.32,0.18],[0.32,0.18],[-0.10,0.34],[0.10,0.34],[0,-0.30]]){
    const top=V(sx*0.5,L.hipY+0.10,sz*0.4), bot=V(sx,0.30,sz);
    quad(V(top.x-0.10,top.y,top.z),V(top.x+0.10,top.y,top.z),V(bot.x+0.14,bot.y,bot.z),V(bot.x-0.14,bot.y,bot.z),P.coat,0.06);
    tube(V(bot.x-0.05,0.32,bot.z),V(bot.x-0.02,0.50,bot.z-0.04),0.03,0.01,4,P.fireLt,{capB:{hex:P.fireLt}});
  }

  /* ---------- TORSO — tall gaunt captain's frame, storm-fire wreathing the whole silhouette. ---------- */
  stack([
    {y:L.hipY,   rx:0.320, rz:0.260, hex:P.coatDk},
    {y:L.waistY, rx:0.300, rz:0.240, hex:P.coat},
    {y:L.chestY, rx:0.340, rz:0.250, hex:P.coatLt},
    {y:L.shldY,  rx:0.420, rz:0.260, hex:P.coat},
    {y:L.neckY,  rx:0.150, rz:0.140, hex:P.skinDk},
  ], 8, {phase:Math.PI/8});
  // coat lapels split open down the chest, storm-blue skin/ribs showing through the gap
  quad(V(-0.10,L.shldY-0.05,0.22),V(0.10,L.shldY-0.05,0.22),V(0.07,L.hipY+0.10,0.20),V(-0.07,L.hipY+0.10,0.20),P.skin,0.06);
  // fire wreathing up the spine and shoulders — small guttering flame tongues
  for(const [dx,dy,dz,h] of [[0.30,L.shldY,0.02,0.28],[-0.30,L.shldY,0.02,0.24],[0.18,L.chestY,-0.20,0.20],[-0.18,L.chestY,-0.20,0.18],[0,L.waistY,-0.24,0.22]]){
    const b=V(dx,dy,dz), t=V(dx*1.3,dy+h,dz*1.2);
    tube(b,t,0.055,0.014,5,P.fire,{capB:{hex:P.fireLt,lift:0.02}});
  }
  for(const [x,y,z] of [[0.20,L.chestY,0.10],[-0.22,L.waistY,0.06],[0.05,L.shldY-0.10,-0.18]]) blob(x,y,z,0.05,0.04,0.03,P.fireVio,4,3);

  /* ---------- HEAD — gaunt, tricorne-hat suggestion (broad brim shadow), storm-fire crown. ---------- */
  {
    const bands=[
      {y:L.jawY,   rx:0.145, rz:0.140, hex:P.skinDk},
      {y:L.jawY+0.12, rx:0.155, rz:0.148, hex:P.skin},
      {y:L.crownY-0.10, rx:0.135, rz:0.118, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02),V(0,1,0),b.rx,b.rz,8,Math.PI/8));
    stitch(rings,b=>bands[b].hex);
    capFan(rings.at(-1),V(0,L.crownY-0.02,0.0),P.hatDk);
    // broad tricorne brim shadow
    quad(V(-0.28,L.crownY-0.10,0.05),V(0.28,L.crownY-0.10,0.05),V(0.20,L.crownY-0.02,-0.18),V(-0.20,L.crownY-0.02,-0.18),P.hatDk,0.05);
    // hollow eye sockets — dull ember glow, no eye quads
    for(const s of [-1,1]) quad(V(s*0.052,L.jawY+0.10,0.135),V(s*0.078,L.jawY+0.10,0.135),V(s*0.070,L.jawY+0.02,0.125),V(s*0.055,L.jawY+0.02,0.125),P.fire,0.0);
    // fire crown rising off the skull
    for(const [dx,dz,h] of [[0,0,0.34],[0.06,0.04,0.24],[-0.06,-0.03,0.22]]){
      const b=V(dx,L.crownY,dz), t=V(dx*1.5,L.crownY+h,dz*1.5);
      tube(b,t,0.05,0.012,5,P.fire,{capB:{hex:P.fireLt,lift:0.02}});
    }
  }

  /* ---------- ARMS — one raised toward the crowd, one chained down to the wheel's rim. ---------- */
  {
    const S=V(0.42,L.shldY-0.04,0), E=V(0.60,L.chestY+0.10,-0.10), W=V(0.56,L.neckY+0.30,-0.16);
    tube(S,E,0.135,0.10,7,P.coat); tube(E,W,0.10,0.075,7,P.skinDk,{capB:{hex:P.skinDk,lift:0.01}});
    const S2=V(-0.42,L.shldY-0.04,0), E2=V(-0.52,L.ribY??L.waistY,0.22), W2=V(-0.40,L.hipY-0.30,0.50);
    tube(S2,E2,0.135,0.10,7,P.coat); tube(E2,W2,0.10,0.075,7,P.skinDk,{capB:{hex:P.skinDk,lift:0.01}});
    // chain from the down-wrist to the wheel rim
    const pts=[W2,V(-0.30,L.hipY-0.55,0.62),V(-0.14,L.hipY-0.75,0.72)];
    for(let i=0;i<pts.length-1;i++) tube(pts[i],pts[i+1],0.022,0.022,5,P.chain);
  }

  /* ---------- SHIP'S WHEEL — a great wheel of drowned-hand spokes gripping the rim, low+forward. ---------- */
  {
    const c=V(-0.05,0.62,0.80), rim=0.44;
    const rimRing=ring(c,V(0,0,1),rim,rim,10,Math.PI/10);
    const rimRing2=ring(V(c.x,c.y,c.z+0.06),V(0,0,1),rim,rim,10,Math.PI/10);
    stitch([rimRing,rimRing2],()=>P.wheel);
    // spokes as fused drowned hands reaching from hub to rim
    for(let i=0;i<8;i++){
      const t=(i/8)*Math.PI*2;
      const tip=V(c.x+Math.cos(t)*rim*0.92,c.y+Math.sin(t)*rim*0.92,c.z+0.03);
      const hub=V(c.x+Math.cos(t)*0.08,c.y+Math.sin(t)*0.08,c.z+0.03);
      tube(hub,tip,0.045,0.030,4,P.hand,{capB:{hex:P.handDk,lift:0.01}});
      // clutching fingers at the rim
      for(const fd of [-0.03,0.03]) tube(tip,V(tip.x+fd,tip.y+0.02,c.z+0.09),0.012,0.006,3,P.handDk);
    }
    const hubR=ring(c,V(0,0,1),0.11,0.11,8);
    stitch([hubR,ring(V(c.x,c.y,c.z+0.05),V(0,0,1),0.09,0.09,8)],()=>P.wheelDk);
    capFan(hubR,V(c.x,c.y,c.z-0.02),P.buckle);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0),V(0,1,0),0.68,0.68,20);
    const r2=ring(V(0,0.055,0),V(0,1,0),0.66,0.66,20);
    stitch([r1,r2],()=>P.disc);
    capFan(r2,V(0,0.058,0),P.discTop);
  }
}
