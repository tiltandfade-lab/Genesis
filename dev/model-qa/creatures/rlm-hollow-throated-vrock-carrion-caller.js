/* dev/model-qa/creatures/rlm-hollow-throated-vrock-carrion-caller.js — HOLLOW-THROATED VROCK
   CARRION-CALLER (lost-world, Large Fiend, CR 6). Read: a vulture-headed demon, hunched
   bird-of-prey posture, bound as a warder over forbidden grave-magic — a bald ridged skull-head
   on a hollow throat-sac, tattered leathery wings folded like a shroud, taloned bird-legs, a
   distended feathered torso mottled with graveyard rot. VS-desaturated antiquity register:
   ash-grey/carrion-black plumage, sickly bruise-purple wattle throat, sun-bleached bone-white
   beak/talons. NO eye quads — dark carved sockets under a bony brow ridge. Whole-object
   grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildHollowThroatedVrockCarrionCaller(){
  const P = {
    plume:0x4a463e, plumeDk:0x2e2b26, plumeLt:0x66625a,      // ash-grey/carrion-black plumage
    rot:0x5e5646, rotDk:0x3c372a,                              // graveyard-rot mottling
    skin:0x8a8478, skinDk:0x5e5a4e,                            // bald skull-head grey skin
    wattle:0x6e4256, wattleDk:0x4a2b3a,                        // bruise-purple throat wattle
    bone:0xc8c0a8, boneDk:0x968c6e,                            // sun-bleached beak/talons
    socket:0x18130f,
    wing:0x3a362e, wingDk:0x241f1a, wingMem:0x2a2620,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — hunched bird-of-prey posture, low forward-leaning torso */
  const S = {
    tailBase: V(0, 0.56, -0.30),
    hip:      V(0, 0.72, -0.14),
    chest:    V(0.02, 0.94, 0.06),
    shldr:    V(0.02, 1.06, 0.12),
    throat:   V(0.0, 1.14, 0.18),
    headB:    V(-0.01, 1.22, 0.22),
  };

  /* TORSO — distended feathered body, rot-mottled */
  tube(S.hip,   S.chest, 0.24, 0.22, 9, P.plume,  {phase:Math.PI/9, capA:{hex:P.plumeDk, lift:0.03}});
  tube(S.chest, S.shldr, 0.22, 0.185,9, P.rot,    {phase:Math.PI/9});
  tube(S.shldr, S.throat,0.185,0.12, 8, P.plumeDk,{phase:Math.PI/8});
  /* mottled rot patches on the torso */
  for(const [x,y,z] of [[-0.14,0.86,0.0],[0.12,0.98,0.08],[-0.06,0.76,-0.08]]){
    quad(V(x-0.05,y,z), V(x+0.05,y,z), V(x+0.03,y+0.06,z+0.02), V(x-0.03,y+0.06,z+0.02), P.rotDk, 0.06);
  }
  /* hollow distended wattle throat-sac, hanging loose beneath the neck */
  {
    const wT=ring(V(0,1.10,0.20), V(0,1,0), 0.07,0.06,8,Math.PI/8);
    const wB=ring(V(0.01,0.94,0.24), V(0,1,0), 0.10,0.08,8,Math.PI/8);
    stitch([wT,wB], ()=>P.wattle);
    capFan(wB, V(0.01,0.90,0.24), P.wattleDk, true);
  }

  /* HEAD — bald vulture skull, hooked bone beak, dark sockets under a bony brow ridge */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.19, cz:0.24, rx:0.085,rz:0.09, hex:P.skinDk},
      {y:1.25, cz:0.27, rx:0.095,rz:0.10, hex:P.skin},
      {y:1.30, cz:0.24, rx:0.080,rz:0.08, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.34,0.24), P.skinDk);
    /* bony brow ridge */
    quad(V(-0.05,1.28,0.32), V(0.05,1.28,0.32), V(0.04,1.25,0.34), V(-0.04,1.25,0.34), P.bone, 0.04);
    /* dark carved sockets under the ridge */
    for(const s of [-1,1]) quad(V(s*0.030,1.255,0.315), V(s*0.048,1.255,0.315),
                                 V(s*0.044,1.230,0.31), V(s*0.034,1.230,0.31), P.socket, 0.02);
    /* hooked bone-white beak */
    const bkB=V(0,1.19,0.32), bkM=V(0,1.15,0.42), bkT=V(0,1.10,0.48);
    tube(bkB,bkM,0.055,0.032,n,P.bone,{raz:0.045,rbz:0.024,phase:ph});
    tube(bkM,bkT,0.032,0.010,6,P.boneDk,{capB:{hex:P.boneDk,lift:0.004}});
  }

  /* WINGS — tattered leathery wings, folded like a shroud over the back */
  {
    const wingShroud=(sign)=>{
      const root=V(sign*0.20, 1.02, 0.02);
      const tip1=V(sign*0.46, 0.78, -0.28);
      const tip2=V(sign*0.44, 0.52, -0.56);
      const tip3=V(sign*0.30, 0.40, -0.72);
      tube(root, tip1, 0.10, 0.06, 6, P.wing, {phase:Math.PI/6});
      tube(tip1, tip2, 0.06, 0.03, 6, P.wingDk);
      tube(tip2, tip3, 0.03, 0.008, 5, P.wingDk, {capB:{hex:P.wingDk, lift:0.004}});
      /* tattered membrane panel between root and mid-wing */
      quad(V(root.x,root.y-0.06,root.z), V(tip1.x,tip1.y-0.03,tip1.z),
           V(tip2.x,tip2.y-0.02,tip2.z), V(root.x,root.y-0.20,root.z-0.10), P.wingMem, 0.06);
      /* ragged tears along the trailing edge */
      for(const t of [0.35,0.65]){
        const px=root.x+(tip2.x-root.x)*t, py=root.y+(tip2.y-root.y)*t-0.05, pz=root.z+(tip2.z-root.z)*t-0.06;
        quad(V(px-0.03,py,pz), V(px+0.03,py,pz), V(px+0.01,py-0.09,pz-0.02), V(px-0.01,py-0.09,pz-0.02), P.wingDk, 0.05);
      }
    };
    wingShroud(-1); wingShroud(1);
  }

  /* LEGS — taloned bird-legs, backward-bending, gripping stance guarding the grave-site */
  {
    const birdLeg=(x, footZ)=>{
      const hip=V(x,0.68,-0.10);
      const knee=V(x*1.15,0.42,-0.02);
      const ankle=V(x*1.05,0.20,0.06);
      const foot=V(x*1.05,0.05,footZ);
      tube(hip,knee,0.10,0.065,7,P.plume,{phase:Math.PI/9});
      tube(knee,ankle,0.062,0.038,7,P.skinDk);
      tube(ankle,foot,0.036,0.022,6,P.bone,{capB:{hex:P.boneDk,lift:0.004}});
      /* grasping talons */
      for(const [dx,dz] of [[Math.sign(x||1)*0.06,0.06],[0,0.11],[-Math.sign(x||1)*0.05,0.07]]){
        tube(foot, V(foot.x+dx,0.01,foot.z+dz), 0.018,0.005,4,P.bone,{capB:{hex:P.boneDk,lift:0.004}});
      }
    };
    birdLeg(-0.13, 0.20);
    birdLeg( 0.13, 0.14);
  }

  /* short fanned tail-plumes */
  {
    const t0=S.tailBase;
    for(const [dx,dl] of [[-0.14,0.34],[0,0.40],[0.14,0.34]]){
      tube(t0, V(dx, t0.y-0.10, t0.z-dl), 0.05,0.012,5,P.plumeDk,{capB:{hex:P.plumeDk,lift:0.006}});
    }
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
