/* dev/model-qa/creatures/rlm-sickle-toed-ambush-runner.js — SICKLE-TOED AMBUSH RUNNER
   (lost-world, Medium Beast, CR 1). Read: a raptor — bipedal, horizontal spine carried low,
   long stiff counterbalance tail, S-curved neck, narrow snouted skull, and the tell: one
   raised SICKLE CLAW held clear of the ground on each foot. VS-desaturated dry ochre/rust
   hide (broken-column ruin register — dusty, sun-bleached, dirt-gritted). Whole-object
   grammar: one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSickleToedAmbushRunner(){
  const P = {
    hide:0x7a6448, hideDk:0x584a34, hideLt:0x93805c,
    stripe:0x4d3f2a, belly:0xb9a778, bellyDk:0x8c7a54,
    claw:0x2a2419, mouth:0x271f16, eye:0x1c1712,
    disc:0x4a4038, discTop:0x585047,
  };

  /* spine held horizontal-forward-leaning, hip pivot the balance point */
  const hipY = 0.44;
  const S = {
    tailBase: V(0, hipY+0.02, -0.30),
    hip:      V(0, hipY+0.05, -0.10),
    back:     V(0, hipY+0.10,  0.10),
    shldr:    V(0, hipY+0.06,  0.28),
    neckLo:   V(0, hipY+0.18,  0.36),
    neckHi:   V(0, hipY+0.42,  0.30),
    headB:    V(0, hipY+0.52,  0.38),
  };

  /* BODY — compact horizontal torso, deep-chested, narrowing to the hip */
  tube(S.hip,   S.back,  0.155, 0.170, 8, P.hide,   {phase:Math.PI/8, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.back,  S.shldr, 0.170, 0.150, 8, P.hideLt, {phase:Math.PI/8});
  /* S-curved neck rising sharply up */
  tube(S.shldr, S.neckLo, 0.150, 0.100, 7, P.hide,   {phase:Math.PI/7});
  tube(S.neckLo,S.neckHi, 0.100, 0.075, 7, P.hideDk, {phase:Math.PI/7});
  /* pale belly strip */
  {
    const by = hipY-0.10;
    quad(V(-0.11,by,-0.22), V(0.11,by,-0.22), V(0.10,by+0.02,0.24), V(-0.10,by+0.02,0.24), P.belly, 0.05);
  }
  /* dark dorsal stripe */
  {
    const seg=[[-0.24,hipY+0.16],[-0.02,hipY+0.20],[0.20,hipY+0.16]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.02,y0,z0), V(0.02,y0,z0), V(0.017,y1,z1), V(-0.017,y1,z1), P.stripe, 0.04);
    }
  }

  /* HEAD — narrow snouted skull atop the S-neck, jaw full of small teeth */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:hipY+0.44, cz:0.40, rx:0.075, rz:0.10, hex:P.hide},
      {y:hipY+0.50, cz:0.42, rx:0.085, rz:0.115,hex:P.hideLt},
      {y:hipY+0.56, cz:0.39, rx:0.070, rz:0.09, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, hipY+0.60, 0.37), P.hideDk);
    /* narrow snout projecting forward */
    const snB=V(0, hipY+0.46, 0.46), snT=V(0, hipY+0.44, 0.62);
    tube(snB, snT, 0.062, 0.020, n, P.hide, {raz:0.075, rbz:0.024, phase:ph, capB:{hex:P.mouth, lift:0.006}});
    quad(V(-0.05,hipY+0.415,0.48), V(0.05,hipY+0.415,0.48), V(0.016,hipY+0.40,0.615), V(-0.016,hipY+0.40,0.615), P.mouth, 0.03);
    /* eye sockets (no eye quads — carved sockets only) */
    for(const s of [-1,1]) quad(V(s*0.068,hipY+0.535,0.40), V(s*0.078,hipY+0.535,0.40),
                                 V(s*0.075,hipY+0.505,0.415), V(s*0.065,hipY+0.505,0.415), P.eye, 0.02);
  }

  /* LEGS — digitigrade bird-leg: thigh back, shin forward, foot flat, ONE SICKLE CLAW raised clear */
  {
    const raptorLeg=(hipX, footZ, hex)=>{
      const hip   = V(hipX, hipY-0.02, -0.06);
      const knee  = V(hipX*1.15, hipY-0.22, 0.02);
      const ankle = V(hipX*1.05, 0.12, footZ-0.02);
      const foot  = V(hipX*0.95, 0.045, footZ+0.06);
      tube(hip, knee, 0.075, 0.052, 6, hex);
      tube(knee, ankle, 0.050, 0.026, 6, P.hideDk);
      tube(ankle, foot, 0.026, 0.020, 5, P.hideDk, {capB:{hex:P.hideDk, lift:0.005}});
      /* two grounded forward toes */
      for(const dz of [0.09,0.13]){
        const ct=V(foot.x+ (dz>0.1?0.02:-0.02), 0.012, foot.z+dz);
        tube(V(foot.x,0.03,foot.z), ct, 0.014, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
      /* the SICKLE CLAW — held raised, clear of the ground, curving up-forward off the ankle */
      const sickleRoot = V(ankle.x, ankle.y-0.02, ankle.z+0.02);
      const sickleTip  = V(ankle.x + Math.sign(hipX||1)*0.03, 0.20, ankle.z+0.14);
      tube(sickleRoot, sickleTip, 0.020, 0.006, 5, P.claw, {capB:{hex:P.claw, lift:0.004}});
    };
    raptorLeg(-0.12, 0.10, P.hide);
    raptorLeg( 0.12, 0.16, P.hideLt);
  }

  /* ARMS — small, held tucked forward at the chest */
  {
    const armStub=(x)=>{
      const sh=V(x, hipY+0.16, 0.30);
      const el=V(x*1.3, hipY+0.06, 0.38);
      const hd=V(x*1.2, hipY+0.02, 0.46);
      tube(sh, el, 0.032, 0.024, 5, P.hide);
      tube(el, hd, 0.024, 0.014, 5, P.hideDk, {capB:{hex:P.claw, lift:0.006}});
    };
    armStub(-0.11); armStub(0.11);
  }

  /* TAIL — long, stiff, counterbalancing, tapering straight back and slightly down */
  {
    const t0=S.tailBase;
    const t1=V(0, hipY-0.02, -0.62);
    const t2=V(0, hipY-0.06, -0.94);
    const t3=V(0, hipY-0.10, -1.20);
    const tip=V(0, hipY-0.13, -1.38);
    tube(t0,t1, 0.115,0.085,7,P.hide,   {phase:Math.PI/7, capA:{hex:P.hideDk}});
    tube(t1,t2, 0.085,0.055,7,P.hideDk, {phase:Math.PI/7});
    tube(t2,t3, 0.055,0.030,7,P.hide,   {phase:Math.PI/7});
    tube(t3,tip,0.030,0.010,7,P.hideDk, {phase:Math.PI/7, capB:{hex:P.hideDk, lift:0.005}});
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
