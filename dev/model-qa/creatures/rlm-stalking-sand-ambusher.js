/* dev/model-qa/creatures/rlm-stalking-sand-ambusher.js — STALKING SAND-AMBUSHER
   (lost-world, Large Monstrosity, CR 3). Read: a big spider-shape built for the desert —
   8 long splayed legs on a low broad abdomen+cephalothorax, sand-dun mottled carapace built
   to vanish in heat-mirage, thick venom-dripping fangs/pedipalps forward, gritty sand-caked
   hair-bristles on the legs. VS-desaturated dun/ochre scale, no eye quads (clustered ocelli
   as small dark pits only). Whole-object grammar: one function, one frame, no anchors.
   Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildStalkingSandAmbusher(){
  const P = {
    hide:0x8c7a52, hideDk:0x64563a, hideLt:0xa89468,
    mottleA:0x776438, mottleB:0x93825a,
    belly:0x5c4f34,
    fang:0x2e2820, venom:0x6d7a3a,
    ocelli:0x1e1a14,
    bristle:0xb8a878,
    claw:0x201d17,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ABDOMEN + CEPHALOTHORAX — low broad two-lobe body, held close to the sand */
  const spY = 0.30;
  const S = {
    abdBack: V(0, spY+0.02, -0.44),
    abdMid:  V(0, spY+0.08, -0.14),
    waist:   V(0, spY+0.04,  0.02),
    thorax:  V(0, spY+0.02,  0.20),
    fore:    V(0, spY-0.02,  0.36),
  };
  /* bulbous segmented abdomen */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.02, cz:-0.52, rx:0.150, rz:0.170, hex:P.hideDk},
      {y:spY+0.10, cz:-0.34, rx:0.250, rz:0.270, hex:P.hide},
      {y:spY+0.14, cz:-0.10, rx:0.270, rz:0.250, hex:P.mottleA},
      {y:spY+0.06, cz: 0.04, rx:0.200, rz:0.190, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,spY-0.10,-0.56), P.belly, true);
    /* mottled dorsal splotches for heat-mirage camo read */
    for(const [dx,dz,r] of [[0.10,-0.30,0.09],[-0.12,-0.18,0.07],[0.04,-0.42,0.06]]){
      quad(V(dx-r,spY+0.16,dz-r*0.6), V(dx+r,spY+0.16,dz-r*0.6), V(dx+r*0.6,spY+0.14,dz+r), V(dx-r*0.6,spY+0.14,dz+r), P.mottleB, 0.05);
    }
  }
  /* cephalothorax — smaller forward hump */
  tube(S.waist, S.thorax, 0.180, 0.150, 8, P.hide,   {phase:Math.PI/8});
  tube(S.thorax, S.fore,  0.150, 0.110, 8, P.mottleA,{phase:Math.PI/8, capB:{hex:P.hideDk, lift:0.02}});

  /* HEAD-END — clustered ocelli (dark pits, no eye quads) + fangs/pedipalps */
  {
    for(const [dx,dy] of [[-0.05,0.02],[0.05,0.02],[-0.03,-0.01],[0.03,-0.01],[0,0.045]]){
      quad(V(dx-0.012,spY-0.01+dy,0.395), V(dx+0.012,spY-0.01+dy,0.395), V(dx+0.008,spY-0.02+dy,0.400), V(dx-0.008,spY-0.02+dy,0.400), P.ocelli, 0.02);
    }
    /* thick venom-dripping fangs, forward and down */
    for(const s of [-1,1]){
      const fb=V(s*0.05, spY-0.035, 0.40);
      const fm=V(s*0.06, spY-0.09, 0.46);
      const ft=V(s*0.055,spY-0.14, 0.48);
      tube(fb,fm,0.030,0.018,5,P.hideDk);
      tube(fm,ft,0.018,0.006,5,P.fang,{capB:{hex:P.venom, lift:0.004}});
    }
    /* pedipalps, shorter and to the sides */
    for(const s of [-1,1]){
      const pb=V(s*0.13, spY-0.01, 0.36), pt=V(s*0.20, spY-0.05, 0.46);
      tube(pb,pt,0.032,0.018,5,P.hide,{capB:{hex:P.hideDk, lift:0.005}});
    }
  }

  /* LEGS — 8 long splayed spider legs, 4 pairs, sprawled wide for the ambush crouch */
  {
    const spiderLeg=(hip, kneeOff, footX, footZ, hex)=>{
      const knee = V(hip.x+kneeOff.x, hip.y+0.14, hip.z+kneeOff.z);
      const heel = V(footX*0.8, spY-0.16, footZ*0.85);
      const foot = V(footX, 0.05, footZ);
      tube(hip, knee, 0.052, 0.040, 6, hex);
      tube(knee, heel, 0.040, 0.026, 6, P.hideDk);
      tube(heel, foot, 0.026, 0.010, 5, P.hideLt, {capB:{hex:P.claw, lift:0.005}});
      /* sand-caked bristle tufts along the leg */
      const bx=(hip.x+knee.x)/2, by=(hip.y+knee.y)/2+0.03, bz=(hip.z+knee.z)/2;
      quad(V(bx-0.02,by,bz), V(bx+0.02,by,bz), V(bx+0.01,by+0.035,bz-0.01), V(bx-0.01,by+0.035,bz-0.01), P.bristle, 0.08);
    };
    const hipZ = [0.16, 0.02, -0.14, -0.28];
    const footZ = [0.46, 0.22, -0.30, -0.58];
    const footXb = [0.62, 0.72, 0.70, 0.58];
    for(let i=0;i<4;i++){
      spiderLeg(V(-0.19, spY+0.02, hipZ[i]), V(-0.20, 0, (footZ[i]>hipZ[i]?0.08:-0.08)), -footXb[i], footZ[i], (i%2? P.hideDk:P.hide));
      spiderLeg(V( 0.19, spY+0.02, hipZ[i]), V( 0.20, 0, (footZ[i]>hipZ[i]?0.08:-0.08)),  footXb[i], footZ[i], (i%2? P.hideDk:P.hide));
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
