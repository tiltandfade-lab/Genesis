/* dev/model-qa/creatures/rlm-brine-cursed-werebear-bosun.js — BRINE-CURSED WEREBEAR BOSUN
   (high-seas, Medium Humanoid/shapechanger, CR 4). Read: a hulking, salt-matted BEAR-shape mid-
   transformation, wearing a bosun's coat still buttoned over the fur (too small now, straining at
   the seams) — bear head/muzzle/claws, humanoid stance, nautical trim. VS-desaturated: salt-
   crusted dun-brown fur, a faded navy-black coat gone pale with brine stains. Whole-object
   grammar: one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBrineCursedWerebearBosun(){
  const P = {
    fur:0x5c4c38, furDk:0x3e3324, furLt:0x776048,
    salt:0x8c8272, saltLt:0xa8a08e,                  // salt-crust patches
    coat:0x232830, coatDk:0x161a20, coatLt:0x333a44, brine:0x555c62,
    button:0x2c2822, claw:0x1c1712, nose:0x141010, mouth:0x241c18,
    disc:0x3a352b, discTop:0x46402f,
  };

  const L = { hipY:0.60, waistY:0.86, chestY:1.14, shldY:1.36, neckY:1.46, jawY:1.56, browY:1.68, crownY:1.78 };

  /* ---------- LEGS — thick digitigrade-leaning bear legs, plantigrade stance (stands like a man). ---------- */
  {
    const leg=(sign)=>{
      const hip=V(sign*0.16,L.hipY-0.06,0), knee=V(sign*0.19,0.34,0.04), ank=V(sign*0.17,0.10,-0.02);
      tube(hip,knee,0.140,0.115,7,P.furDk); tube(knee,ank,0.115,0.095,7,P.fur,{capB:{hex:P.furDk,lift:0.015}});
      // broad clawed bear foot
      const pad=V(ank.x,0.05,ank.z+0.06);
      blob(pad.x,0.045,pad.z,0.09,0.05,0.11,P.fur,5,3);
      for(const dx of [-0.05,-0.017,0.017,0.05]) tube(V(pad.x+dx,0.05,pad.z+0.10),V(pad.x+dx,0.01,pad.z+0.16),0.018,0.008,4,P.claw,{capB:{hex:P.claw}});
    };
    leg(-1); leg(1);
  }

  /* ---------- TORSO — a broad barrel bear-chest, straining bosun's coat buttoned over the fur. ---------- */
  stack([
    {y:L.hipY,   rx:0.220, rz:0.200, hex:P.furDk},
    {y:L.waistY, rx:0.260, rz:0.230, hex:P.coatDk},
    {y:L.chestY, rx:0.310, rz:0.260, hex:P.coat},
    {y:L.shldY,  rx:0.340, rz:0.270, hex:P.coatLt},
    {y:L.neckY,  rx:0.170, rz:0.160, hex:P.furDk},
  ], 8, {phase:Math.PI/8});
  // coat lapels + strained buttons down the front, fur bulging through the gaps
  quad(V(-0.09,L.shldY-0.02,0.24),V(0.09,L.shldY-0.02,0.24),V(0.06,L.hipY+0.06,0.20),V(-0.06,L.hipY+0.06,0.20),P.fur,0.06);
  for(const y of [L.waistY+0.02,L.chestY-0.02,L.chestY+0.14]) quad(V(-0.018,y,0.255),V(0.018,y,0.255),V(0.015,y-0.02,0.25),V(-0.015,y-0.02,0.25),P.button,0.0);
  // salt-crust stains on the coat shoulders/collar
  for(const [x,y,z] of [[0.16,L.shldY,0.08],[-0.18,L.chestY+0.08,0.10],[0.10,L.waistY,0.14]]) blob(x,y,z,0.05,0.035,0.02,P.brine,4,3);
  // nautical trim — a row of small brass-like buttons at the collar (kept desaturated, no shine hex)
  quad(V(-0.14,L.neckY-0.02,0.12),V(0.14,L.neckY-0.02,0.12),V(0.10,L.neckY-0.08,0.16),V(-0.10,L.neckY-0.08,0.16),P.coatDk,0.04);

  /* ---------- HEAD — a bear muzzle/skull, coat collar riding up around the fur neck. ---------- */
  {
    const bands=[
      {y:L.jawY,   rx:0.140, rz:0.150, hex:P.fur},
      {y:L.browY,  rx:0.155, rz:0.155, hex:P.furLt},
      {y:L.crownY, rx:0.115, rz:0.110, hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02),V(0,1,0),b.rx,b.rz,8,Math.PI/8));
    stitch(rings,b=>bands[b].hex);
    capFan(rings.at(-1),V(0,L.crownY+0.04,0),P.furDk);
    // rounded bear ears
    for(const s of [-1,1]) blob(s*0.10,L.crownY+0.02,-0.02,0.045,0.045,0.03,P.furDk,4,3);
    // muzzle projecting forward
    const snB=V(0,L.jawY-0.02,0.14), snM=V(0,L.jawY-0.06,0.26), snT=V(0,L.jawY-0.08,0.34);
    tube(snB,snM,0.095,0.075,8,P.fur,{raz:0.085,rbz:0.065}); tube(snM,snT,0.075,0.05,8,P.furLt,{raz:0.065,rbz:0.04,capB:{hex:P.nose,lift:0.008}});
    quad(V(-0.055,L.jawY-0.10,0.24),V(0.055,L.jawY-0.10,0.24),V(0.035,L.jawY-0.115,0.33),V(-0.035,L.jawY-0.115,0.33),P.mouth,0.03);
    // eye sockets, no quads — deep dark pits
    for(const s of [-1,1]) quad(V(s*0.06,L.browY-0.01,0.11),V(s*0.085,L.browY-0.01,0.11),V(s*0.075,L.browY-0.06,0.10),V(s*0.055,L.browY-0.06,0.10),P.mouth,0.0);
  }

  /* ---------- ARMS — heavy furred arms, one clawed hand raised. ---------- */
  {
    const S=V(0.34,L.shldY-0.04,0), E=V(0.44,L.chestY-0.02,0.10), W=V(0.40,L.waistY,0.18);
    tube(S,E,0.130,0.10,7,P.coat); tube(E,W,0.10,0.085,7,P.fur,{capB:{hex:P.fur,lift:0.01}});
    for(const dx of [-0.03,0,0.03]) tube(V(W.x+dx,W.y-0.02,W.z+0.05),V(W.x+dx,W.y-0.10,W.z+0.13),0.016,0.007,4,P.claw,{capB:{hex:P.claw}});
    const S2=V(-0.34,L.shldY-0.04,0), E2=V(-0.46,L.waistY+0.06,0.02), W2=V(-0.42,L.hipY-0.06,-0.08);
    tube(S2,E2,0.130,0.10,7,P.coat); tube(E2,W2,0.10,0.085,7,P.fur,{capB:{hex:P.fur,lift:0.01}});
    for(const dx of [-0.03,0,0.03]) tube(V(W2.x+dx,W2.y-0.02,W2.z-0.03),V(W2.x+dx,W2.y-0.10,W2.z-0.10),0.016,0.007,4,P.claw,{capB:{hex:P.claw}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0),V(0,1,0),0.42,0.42,16);
    const r2=ring(V(0,0.045,0),V(0,1,0),0.40,0.40,16);
    stitch([r1,r2],()=>P.disc);
    capFan(r2,V(0,0.048,0),P.discTop);
  }
}
