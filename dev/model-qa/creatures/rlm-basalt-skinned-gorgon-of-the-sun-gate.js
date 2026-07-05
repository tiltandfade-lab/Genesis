/* dev/model-qa/creatures/rlm-basalt-skinned-gorgon-of-the-sun-gate.js — BASALT-SKINNED GORGON OF
   THE SUN GATE (lost-world, Large Construct, CR 5). Read: a bull-shaped stone-plated construct
   guardian, low quadruped stance braced before a gate, iron-scale hide over basalt-grey plating,
   heavy curved horns, head lowered as it breathes a jet of petrifying dust from flared nostrils.
   VS-desaturated antiquity register: basalt-grey stone plating, dull iron-black scale, faint
   sun-gate ochre dust residue caked at the muzzle. NO eye quads — dark carved sockets only.
   Whole-object grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBasaltSkinnedGorgonOfTheSunGate(){
  const P = {
    stone:0x6a655c, stoneDk:0x494540, stoneLt:0x847e72,     // basalt-grey stone plating
    scale:0x3a3a36, scaleDk:0x232320, scaleLt:0x525048,      // dull iron-black scale
    horn:0x847860, hornDk:0x584f3e,                          // heavy stone-worn horns
    dust:0xa68f5c, dustDk:0x7a6a42,                           // sun-gate ochre dust residue
    socket:0x141210, nostril:0x0e0c0a,
    hoof:0x2a2823,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — low quadruped bull stance, head lowered as if about to charge/breathe dust */
  const spY = 0.52;
  const S = {
    tailBase: V(0, spY+0.06, -0.66),
    rump:     V(0, spY+0.14, -0.42),
    mid:      V(0, spY+0.16, -0.10),
    shldr:    V(0, spY+0.10, 0.20),
    neck:     V(0, spY-0.04, 0.42),
    headB:    V(0, spY-0.16, 0.58),          // head lowered
  };

  /* BODY — a broad barrel torso, stone-plated over scale */
  tube(S.rump,  S.mid,   0.30, 0.34, 9, P.stone,  {phase:Math.PI/9, capA:{hex:P.stoneDk, lift:0.03}});
  tube(S.mid,   S.shldr, 0.34, 0.30, 9, P.scale,  {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.30, 0.20, 8, P.stoneDk,{phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.20, 0.16, 8, P.stone,  {phase:Math.PI/8});
  /* riveted stone-plate seams down the flank */
  for(let i=0;i<4;i++){
    const z0=-0.40+i*0.22;
    quad(V(-0.30,spY+0.14,z0), V(-0.24,spY+0.14,z0), V(-0.22,spY-0.10,z0+0.10), V(-0.28,spY-0.10,z0+0.10), P.scaleDk, 0.06);
    quad(V(0.30,spY+0.14,z0), V(0.24,spY+0.14,z0), V(0.22,spY-0.10,z0+0.10), V(0.28,spY-0.10,z0+0.10), P.scaleDk, 0.06);
  }

  /* HEAD — heavy bull skull, curved stone horns, flared dust-caked nostrils, dark sockets */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.20, cz:0.58, rx:0.155,rz:0.16, hex:P.stone},
      {y:spY-0.10, cz:0.62, rx:0.175,rz:0.18, hex:P.stoneLt},
      {y:spY-0.02, cz:0.58, rx:0.140,rz:0.14, hex:P.stoneDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.02,0.58), P.stoneDk);
    /* muzzle wedge, dust-caked */
    const mzB=V(0,spY-0.24,0.68), mzM=V(0,spY-0.28,0.80), mzT=V(0,spY-0.30,0.90);
    tube(mzB,mzM,0.13,0.09,n,P.dustDk,{raz:0.10,rbz:0.07,phase:ph});
    tube(mzM,mzT,0.09,0.05,8,P.dust,{capB:{hex:P.dust,lift:0.006}});
    /* flared nostrils venting dust */
    for(const s of [-1,1]) quad(V(s*0.028-0.01,spY-0.29,0.87), V(s*0.028+0.02,spY-0.29,0.87),
                                 V(s*0.028+0.015,spY-0.24,0.83), V(s*0.028-0.015,spY-0.24,0.83), P.nostril, 0.02);
    /* wisp of petrifying dust jetting from the nostrils */
    for(const s of [-1,1]){
      quad(V(s*0.02,spY-0.28,0.90), V(s*0.05,spY-0.26,0.98), V(s*0.06,spY-0.22,1.06), V(s*0.03,spY-0.24,1.00), P.dust, 0.10);
    }
    /* dark carved sockets */
    for(const s of [-1,1]) quad(V(s*0.055,spY-0.06,0.68), V(s*0.09,spY-0.06,0.68),
                                 V(s*0.082,spY-0.10,0.66), V(s*0.063,spY-0.10,0.66), P.socket, 0.02);
    /* heavy curved stone horns sweeping up and out */
    for(const s of [-1,1]){
      const b0=V(s*0.10,spY+0.02,0.56), b1=V(s*0.24,spY+0.20,0.46), b2=V(s*0.38,spY+0.28,0.30), tip=V(s*0.46,spY+0.22,0.14);
      tube(b0,b1,0.055,0.042,6,P.horn);
      tube(b1,b2,0.042,0.026,6,P.hornDk);
      tube(b2,tip,0.026,0.008,5,P.horn,{capB:{hex:P.hornDk,lift:0.004}});
    }
  }

  /* LEGS — thick stone-plated bull legs, wide braced quadruped stance, cloven stone hooves */
  {
    const bullLeg=(shoulder, footX, footZ, hex)=>{
      const knee=V(shoulder.x, shoulder.y-0.24, shoulder.z + (footZ>shoulder.z?0.03:-0.03));
      const ankle=V(footX*0.9, 0.14, footZ*0.9);
      const foot=V(footX, 0.03, footZ);
      tube(shoulder, knee, 0.135, 0.095, 7, hex, {phase:Math.PI/9});
      tube(knee, ankle, 0.090, 0.058, 7, P.scaleDk);
      tube(ankle, foot, 0.055, 0.045, 6, P.hoof, {capB:{hex:P.hoof, lift:0.005}});
    };
    bullLeg(V(-0.22, spY+0.06, 0.20), -0.28, 0.30, P.stone);
    bullLeg(V( 0.22, spY+0.06, 0.20),  0.28, 0.30, P.stone);
    bullLeg(V(-0.24, spY+0.12,-0.40), -0.32,-0.48, P.stoneDk);
    bullLeg(V( 0.24, spY+0.12,-0.40),  0.32,-0.48, P.stoneDk);
  }

  /* short stone-plated tail */
  {
    const t0=S.tailBase, t1=V(0.02,spY-0.10,-0.90), tip=V(0.10,spY-0.18,-1.06);
    tube(t0,t1,0.10,0.06,7,P.stone);
    tube(t1,tip,0.06,0.02,6,P.stoneDk,{capB:{hex:P.stoneDk,lift:0.004}});
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
