/* dev/model-qa/creatures/rlm-jungle-war-dog.js — Jungle War-Dog (theater, Medium, CR 1).
   A scent-trained war-dog running point ahead of the patrol. Whole-object bespoke QUADRUPED grammar
   (mon-lizard exemplar pattern): a lean, low, muscular canine body low to the ground in a forward
   scenting-run posture (haunches driving, forequarters low, nose out), a lean tucked belly, alert
   pricked ears, a stiff level tail. VS-desaturated jungle-drab palette (dull khaki-brindle hide,
   mud-dark muzzle, pale scarred belly). NO eye quads (socket/brow shading only). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildJungleWarDog(){
  const P = {
    hide:0x5c5240, hideDk:0x3c362a, hideLt:0x726652,
    brindleA:0x453e30, brindleB:0x67593e,
    belly:0x8a7d63, bellyDk:0x685c47,
    muzzle:0x362f24, nose:0x1c1813, mouth:0x241d18,
    claw:0x201b15, harness:0x3a2e20, buckle:0x7a6c3e,
    disc:0x453f34, discTop:0x524b3c,
  };

  /* ---------- LANDMARKS — low forward-driving run: haunches high/back, chest low/forward, head out. ---------- */
  const spY = 0.34;
  const S = {
    tailBase: V(0, spY+0.08, -0.52),
    rump:     V(0, spY+0.10, -0.32),
    loin:     V(0, spY+0.06, -0.10),
    mid:      V(0, spY+0.02, 0.10),
    shldr:    V(0, spY-0.02, 0.30),
    neck:     V(0, spY-0.06, 0.46),
    headB:    V(0, spY-0.06, 0.56),
  };

  /* ---------- BODY — lean muscular barrel, low forward lean into the run. ---------- */
  {
    const n=9, ph=Math.PI/9;
    tube(S.rump,  S.loin,  0.175, 0.165, n, P.hide,    {phase:ph, capA:{hex:P.hideDk, lift:0.02}});
    tube(S.loin,  S.mid,   0.165, 0.155, n, P.brindleA,{phase:ph});
    tube(S.mid,   S.shldr, 0.155, 0.145, n, P.hide,    {phase:ph});
    tube(S.shldr, S.neck,  0.145, 0.100, n, P.brindleB,{phase:ph});
    tube(S.neck,  S.headB, 0.100, 0.078, n, P.hideDk,  {phase:ph});
    // pale lean belly strip, tucked (running-dog gaunt read)
    const by = spY-0.13;
    quad(V(-0.09,by,-0.30), V(0.09,by,-0.30), V(0.07,by+0.02,0.20), V(-0.07,by+0.02,0.20), P.belly, 0.06);
    // brindle stripes over the flank
    for(const z of [-0.24,-0.06,0.12]){
      quad(V(-0.01,spY+0.15,z), V(0.01,spY+0.15,z), V(0.012,spY-0.02,z-0.06), V(-0.012,spY-0.02,z-0.06), P.brindleA, 0.05);
    }
  }

  /* ---------- HEAD — lean canine wedge, muzzle out low scenting forward, pricked ears. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY-0.10, cz:0.56, rx:0.075, hex:P.hide},
      {y:spY-0.06, cz:0.58, rx:0.082, hex:P.hide},
      {y:spY-0.02, cz:0.55, rx:0.068, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.02,0.55), P.hideDk);

    // muzzle projecting forward+down, scenting
    const mB = V(0,spY-0.11,0.62), mM=V(0,spY-0.14,0.72), mT=V(0,spY-0.155,0.80);
    tube(mB, mM, 0.058, 0.040, n, P.muzzle, {phase:ph});
    tube(mM, mT, 0.040, 0.022, n, P.muzzle, {phase:ph, capB:{hex:P.nose, lift:0.006}});
    quad(V(-0.03,spY-0.16,0.66), V(0.03,spY-0.16,0.66), V(0.02,spY-0.165,0.78), V(-0.02,spY-0.165,0.78), P.mouth, 0.04);

    // pricked alert ears
    for(const s of [-1,1]){
      const eb = V(s*0.055, spY+0.03, 0.52), et = V(s*0.09, spY+0.16, 0.48);
      tube(eb, et, 0.030, 0.006, 5, P.hideDk, {capB:{hex:P.hideDk, lift:0.004}});
    }
    // brow socket shading (no eye quads)
    for(const s of [-1,1]) quad(V(s*0.05,spY-0.005,0.60), V(s*0.07,spY-0.005,0.60),
                                V(s*0.065,spY+0.02,0.585), V(s*0.045,spY+0.02,0.585), P.hideDk, 0.05);
  }

  /* ---------- LEGS — a running gait: front legs stretched, rear legs coiled driving. ---------- */
  {
    const runLeg=(shoulder, footX, footZ, kneeY, hex)=>{
      const knee = V(shoulder.x*0.6, kneeY, (shoulder.z+footZ)/2);
      const foot = V(footX, 0.03, footZ);
      tube(shoulder, knee, 0.052, 0.038, 6, hex);
      tube(knee, foot, 0.038, 0.024, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.004}});
      const pad = V(foot.x, 0.02, foot.z+0.02);
      for(const [dx,dz] of [[-0.02,0.03],[0,0.04],[0.02,0.03]]){
        tube(V(pad.x,0.025,pad.z), V(pad.x+dx,0.006,pad.z+dz), 0.010,0.004,4,P.claw);
      }
    };
    // front legs — stretched forward/down (reach phase of the run)
    runLeg(V(-0.11, spY-0.05, 0.28), -0.16, 0.50, 0.14, P.hide);
    runLeg(V( 0.11, spY-0.05, 0.28),  0.16, 0.10, 0.05, P.hideDk);
    // rear legs — coiled driving off the ground
    runLeg(V(-0.12, spY+0.06, -0.34), -0.20, -0.60, 0.20, P.brindleA);
    runLeg(V( 0.12, spY+0.06, -0.34),  0.18, -0.24, 0.10, P.hide);
  }

  /* ---------- TAIL — stiff and level, held straight back (alert working posture). ---------- */
  {
    const t0=S.tailBase, t1=V(0,spY+0.12,-0.74), t2=V(0.02,spY+0.10,-0.94), tip=V(0.03,spY+0.06,-1.06);
    tube(t0,t1,0.055,0.040,7,P.hide,{phase:Math.PI/7});
    tube(t1,t2,0.040,0.024,7,P.brindleB,{phase:Math.PI/7});
    tube(t2,tip,0.024,0.008,7,P.hideDk,{phase:Math.PI/7, capB:{hex:P.hideDk, lift:0.004}});
  }

  /* ---------- HARNESS — a simple working strap over the shoulders, scent-hound gear. ---------- */
  {
    quad(V(-0.10,spY+0.02,0.24), V(0.10,spY+0.02,0.24), V(0.08,spY-0.12,0.18), V(-0.08,spY-0.12,0.18), P.harness, 0.05);
    quad(V(-0.02,spY+0.06,0.30), V(0.02,spY+0.06,0.30), V(0.015,spY+0.06,0.20), V(-0.015,spY+0.06,0.20), P.buckle, 0.04);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
