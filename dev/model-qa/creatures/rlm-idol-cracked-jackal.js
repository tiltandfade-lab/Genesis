/* dev/model-qa/creatures/rlm-idol-cracked-jackal.js — IDOL-CRACKED JACKAL
   (lost-world, Small Beast, CR 0.25). Read: a lean scavenger jackal — quadruped, low
   lithe body, large upright ears, narrow muzzle, bushy low-carried tail, denning posture
   (haunches slightly low, alert). VS-desaturated dusty tan/rust hide (lost-world dust
   register). Whole-object grammar: one function, one frame, no anchors. Small size,
   base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildIdolCrackedJackal(){
  const P = {
    hide:0x8a6f4a, hideDk:0x63502f, hideLt:0xa38660,
    mane:0x4f3f26, belly:0xc0a878, bellyDk:0x967c52,
    snout:0x3f3020, mouth:0x241a12, nose:0x1c140e,
    claw:0x241f19, disc:0x4a4038, discTop:0x585047,
  };

  const spY = 0.20;
  const S = {
    tailBase: V(0, spY+0.02, -0.24),
    rump:     V(0, spY+0.06, -0.16),
    mid:      V(0, spY+0.09, 0.0),
    shldr:    V(0, spY+0.07, 0.16),
    neck:     V(0, spY+0.14, 0.24),
    headB:    V(0, spY+0.22, 0.30),
  };

  /* BODY — lean low quadruped torso */
  tube(S.rump,  S.mid,   0.095, 0.105, 8, P.hide,   {phase:Math.PI/8, capA:{hex:P.hideDk, lift:0.015}});
  tube(S.mid,   S.shldr, 0.105, 0.090, 8, P.hideLt, {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.090, 0.060, 7, P.hide,   {phase:Math.PI/7});
  /* pale belly strip */
  quad(V(-0.06,spY-0.06,-0.14), V(0.06,spY-0.06,-0.14), V(0.05,spY-0.05,0.14), V(-0.05,spY-0.05,0.14), P.belly, 0.05);
  /* dark dorsal mane stripe (scruffy back-ridge fur) */
  {
    const seg=[[-0.20,spY+0.14],[0.0,spY+0.16],[0.20,spY+0.13]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.014,y0,z0), V(0.014,y0,z0), V(0.011,y1,z1), V(-0.011,y1,z1), P.mane, 0.05);
    }
  }

  /* HEAD — narrow fox-like skull with a sharp muzzle */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY+0.18, cz:0.28, rx:0.048, rz:0.058, hex:P.hide},
      {y:spY+0.24, cz:0.30, rx:0.056, rz:0.066, hex:P.hideLt},
      {y:spY+0.29, cz:0.27, rx:0.046, rz:0.05,  hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.32,0.26), P.hideDk);
    /* narrow muzzle */
    const snB=V(0,spY+0.17,0.34), snT=V(0,spY+0.14,0.44);
    tube(snB, snT, 0.038, 0.016, n, P.hide, {raz:0.044, rbz:0.018, phase:ph, capB:{hex:P.nose, lift:0.005}});
    quad(V(-0.03,spY+0.115,0.36), V(0.03,spY+0.115,0.36), V(0.012,spY+0.11,0.43), V(-0.012,spY+0.11,0.43), P.mouth, 0.03);
    /* LARGE upright pointed ears (jackal tell) */
    for(const s of [-1,1]){
      const eb=V(s*0.038,spY+0.30,0.22);
      const em=V(s*0.055,spY+0.44,0.24);
      const et=V(s*0.058,spY+0.53,0.25);
      tube(eb, em, 0.026, 0.016, 5, P.hide);
      tube(em, et, 0.016, 0.004, 5, P.hideDk, {capB:{hex:P.hideDk, lift:0.003}});
    }
  }

  /* LEGS — thin lithe legs, denning slightly-crouched stance */
  {
    const jackalLeg=(x, z, hex)=>{
      const shoulder=V(x, spY+0.02, z);
      const knee=V(x*1.05, spY-0.10, z + (z>0?0.02:-0.02));
      const foot=V(x*1.0, 0.02, z);
      tube(shoulder, knee, 0.034, 0.024, 6, hex);
      tube(knee, foot, 0.024, 0.014, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.004}});
      /* small paw claws */
      for(const dz of [-0.02,0.02]) tube(V(foot.x,0.018,foot.z), V(foot.x+dz*0.5,0.006,foot.z+dz+0.02), 0.008, 0.003, 3, P.claw, {capB:{hex:P.claw, lift:0.002}});
    };
    jackalLeg(-0.09, 0.14, P.hide);
    jackalLeg( 0.09, 0.14, P.hideLt);
    jackalLeg(-0.10, -0.16, P.hide);
    jackalLeg( 0.10, -0.16, P.hideLt);
  }

  /* TAIL — bushy, low-carried, drooping behind (denning/wary posture) */
  {
    const t0=S.tailBase;
    const t1=V(0.02, spY-0.02, -0.42);
    const t2=V(0.03, spY-0.05, -0.58);
    const tip=V(0.04, spY-0.06, -0.68);
    tube(t0,t1, 0.06,0.055,6,P.mane);
    tube(t1,t2, 0.055,0.04,6,P.hide);
    tube(t2,tip,0.04,0.015,6,P.hideDk,{capB:{hex:P.hideDk, lift:0.004}});
  }

  /* base disc (Small r=0.32) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.038,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.041,0), P.discTop);
  }
}
