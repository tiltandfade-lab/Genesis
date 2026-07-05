/* dev/model-qa/creatures/rlm-petrified-roc-of-the-high-terraces.js — PETRIFIED ROC OF THE HIGH
   TERRACES (lost-world, Gargantuan Monstrosity, CR 11). Read: a colossal roc, wings mantled wide
   as it settles onto a crumbling stone terrace, hooked raptor beak, talons big enough to grip a
   whole block of masonry — but its plumage has calcified in patches into stone (the "petrified"
   tell: grey rock-scale bleeding across feather, cracked and lichen-dusted). VS-desaturated
   antiquity register: sun-bleached tawny-brown plumage shot through with basalt-grey petrified
   patches, bone-pale beak/talons, dusty terrace-lichen green accents. NO eye quads — dark carved
   sockets under a heavy brow. Whole-object grammar: one function, one frame, no anchors.
   Gargantuan size, base disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPetrifiedRocOfTheHighTerraces(){
  const P = {
    plume:0x8a6b48, plumeDk:0x5f4830, plumeLt:0xa5835a,      // sun-bleached tawny-brown plumage
    stonePatch:0x6a655c, stonePatchDk:0x494540,               // petrified stone-scale patches
    lichen:0x6e7a44, lichenDk:0x4a5430,                        // terrace-lichen green
    bone:0xc8c0a8, boneDk:0x968c6e,                            // bone-pale beak/talons
    skin:0x8a8478, skinDk:0x5e5a4e,
    socket:0x14100c,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — massive settling posture, wings mantled wide, low forward-leaning head over the beak */
  const S = {
    tailBase: V(0, 1.10, -1.30),
    hip:      V(0, 1.40, -0.70),
    chest:    V(0.03, 1.72, 0.10),
    shldr:    V(0.03, 1.92, 0.40),
    throat:   V(0.0,  2.02, 0.66),
    headB:    V(-0.02, 2.06, 0.90),
  };

  /* TORSO — massive feathered barrel, petrified stone patches bleeding across the plumage */
  tube(S.hip,   S.chest, 0.62, 0.56, 10, P.plume,   {phase:Math.PI/10, capA:{hex:P.plumeDk, lift:0.05}});
  tube(S.chest, S.shldr, 0.56, 0.46, 10, P.plumeLt, {phase:Math.PI/10});
  tube(S.shldr, S.throat,0.46, 0.28, 9,  P.plumeDk, {phase:Math.PI/9});
  tube(S.throat,S.headB, 0.28, 0.22, 9,  P.plume,   {phase:Math.PI/9});
  /* petrified stone-scale patches — the calcification tell, irregular cracked patches */
  for(const [x,y,z,s] of [[-0.32,1.78,0.10,0.18],[0.26,1.55,-0.24,0.16],[0.10,1.95,0.30,0.14],[-0.18,1.35,-0.50,0.15]]){
    quad(V(x-s,y,z), V(x+s,y,z), V(x+s*0.8,y+s*0.9,z+s*0.4), V(x-s*0.8,y+s*0.9,z+s*0.4), P.stonePatch, 0.05);
    quad(V(x-s*0.3,y+s*0.3,z+s*0.1), V(x+s*0.3,y+s*0.3,z+s*0.1), V(x+s*0.15,y+s*0.55,z+s*0.2), V(x-s*0.15,y+s*0.55,z+s*0.2), P.stonePatchDk, 0.05);
  }
  /* dusty terrace-lichen streaks on the stone patches */
  for(const [x,y,z] of [[-0.30,1.72,0.14],[0.22,1.50,-0.20]]){
    quad(V(x-0.03,y,z), V(x+0.03,y,z), V(x+0.02,y-0.09,z+0.02), V(x-0.02,y-0.09,z+0.02), P.lichen, 0.06);
  }

  /* HEAD — hooked raptor beak, heavy petrified brow, dark carved sockets */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:2.00, cz:0.90, rx:0.22, rz:0.24, hex:P.skinDk},
      {y:2.10, cz:0.98, rx:0.25, rz:0.26, hex:P.skin},
      {y:2.18, cz:0.92, rx:0.20, rz:0.20, hex:P.stonePatch},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,2.26,0.90), P.stonePatchDk);
    /* heavy petrified brow ridge */
    quad(V(-0.14,2.15,1.08), V(0.14,2.15,1.08), V(0.10,2.08,1.14), V(-0.10,2.08,1.14), P.stonePatch, 0.05);
    /* dark carved sockets under the brow */
    for(const s of [-1,1]) quad(V(s*0.08,2.08,1.06), V(s*0.14,2.08,1.06),
                                 V(s*0.12,2.00,1.02), V(s*0.09,2.00,1.02), P.socket, 0.02);
    /* massive hooked beak */
    const bkB=V(0,2.00,1.06), bkM=V(0,1.90,1.30), bkT=V(0,1.76,1.46);
    tube(bkB,bkM,0.16,0.09,n,P.bone,{raz:0.13,rbz:0.07,phase:ph});
    tube(bkM,bkT,0.09,0.03,7,P.boneDk,{capB:{hex:P.boneDk,lift:0.006}});
  }

  /* WINGS — colossal, mantled wide as it settles, feathered with petrified patch-scarring */
  {
    const mantleWing=(sign)=>{
      const root=V(sign*0.50, 1.86, 0.20);
      const mid1=V(sign*1.30, 1.55, -0.10);
      const mid2=V(sign*1.95, 1.05, -0.55);
      const tip= V(sign*2.30, 0.65, -0.95);
      tube(root, mid1, 0.30, 0.20, 8, P.plume, {phase:Math.PI/8});
      tube(mid1, mid2, 0.20, 0.11, 8, P.plumeLt);
      tube(mid2, tip,  0.11, 0.03, 7, P.plumeDk, {capB:{hex:P.plumeDk, lift:0.008}});
      /* broad mantled feather-membrane panel */
      quad(V(root.x,root.y-0.20,root.z), V(mid1.x,mid1.y-0.10,mid1.z),
           V(mid2.x,mid2.y-0.05,mid2.z), V(root.x+sign*0.3,root.y-0.60,root.z-0.30), P.plumeDk, 0.06);
      quad(V(mid1.x,mid1.y-0.06,mid1.z), V(mid2.x,mid2.y-0.03,mid2.z),
           V(tip.x,tip.y+0.02,tip.z), V(mid1.x+sign*0.2,mid1.y-0.35,mid1.z-0.20), P.plumeDk, 0.06);
      /* petrified patch on the wing leading edge */
      quad(V(root.x+sign*0.1,root.y+0.05,root.z+0.05), V(root.x+sign*0.30,root.y+0.02,root.z),
           V(mid1.x,mid1.y-0.02,mid1.z), V(root.x+sign*0.15,root.y-0.06,root.z-0.02), P.stonePatch, 0.05);
    };
    mantleWing(-1); mantleWing(1);
  }

  /* LEGS — massive taloned raptor legs, gripping the terrace masonry, digitigrade */
  {
    const rocLeg=(x, footZ)=>{
      const hip=V(x,1.36,-0.60);
      const knee=V(x*1.15,0.86,-0.40);
      const ankle=V(x*1.05,0.42,-0.10);
      const foot=V(x*1.05,0.10,footZ);
      tube(hip,knee,0.26,0.17,8,P.plume,{phase:Math.PI/9});
      tube(knee,ankle,0.16,0.10,8,P.skinDk);
      tube(ankle,foot,0.095,0.06,7,P.bone,{capB:{hex:P.boneDk,lift:0.01}});
      /* massive gripping talons, one clutching a block of terrace masonry */
      for(const [dx,dz] of [[Math.sign(x||1)*0.14,0.14],[0,0.26],[-Math.sign(x||1)*0.10,0.16]]){
        tube(foot, V(foot.x+dx,0.02,foot.z+dz), 0.045,0.012,5,P.bone,{capB:{hex:P.boneDk,lift:0.006}});
      }
    };
    rocLeg(-0.34, 0.30);
    rocLeg( 0.34, 0.30);
    /* a broken terrace masonry block gripped under one foot */
    quad(V(-0.55,0.06,0.20), V(-0.15,0.06,0.20), V(-0.15,0.20,0.42), V(-0.55,0.20,0.42), P.stonePatch, 0.06);
    quad(V(-0.50,0.20,0.24), V(-0.20,0.20,0.24), V(-0.22,0.28,0.36), V(-0.48,0.28,0.36), P.stonePatchDk, 0.05);
  }

  /* fanned tail-plumes, petrified at the tips */
  {
    const t0=S.tailBase;
    for(const [dx,dl] of [[-0.36,0.60],[-0.12,0.72],[0.12,0.72],[0.36,0.60]]){
      tube(t0, V(dx, t0.y-0.20, t0.z-dl), 0.14,0.03,6,P.plumeDk,{capB:{hex:P.stonePatchDk,lift:0.008}});
    }
  }

  /* base disc (Gargantuan: r=0.72) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 20);
    const r2=ring(V(0,0.060,0), V(0,1,0), 0.70, 0.70, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.063,0), P.discTop);
  }
}
