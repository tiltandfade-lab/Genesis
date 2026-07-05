/* dev/model-qa/creatures/rlm-void-drift-larva.js — VOID-DRIFT LARVA (chrome, Medium, CR 2).
   Read: a vacuum-hardened hatchling clamped hard to a hull-breach — a segmented grub body
   with a broad sucker-mouth ring fused flat against a curved hull-plate patch (its own little
   base-disc "hull" standing in for open ground), a ridged dorsal carapace, and short splayed
   grasping limbs digging into the metal. Chrome register: gunmetal hull scrap + sickly
   bio-green ichor-slick hide — cheap miracle gone feral. NO eye quads — a ring of pressure
   pits instead. Whole-object grammar: one function, one frame, no anchors. Medium size,
   base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildVoidDriftLarva(){
  const P = {
    hide:0x596b4a, hideDk:0x3a4630, hideLt:0x748a5c,
    ichor:0x7a9c50, ichorDk:0x4c6432,
    carapace:0x475542, carapaceDk:0x2c362a,
    sucker:0x8fa670, suckerDk:0x566e3e, pit:0x1a2015,
    hull:0x6a6e70, hullDk:0x3e4142, hullLt:0x8a8e90, rivet:0x24262a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* spine held low, curled forward into the clamped mouth-ring at the hull patch (+z) */
  const spY = 0.30;
  const S = {
    tail:  V(0, spY-0.02, -0.40),
    rump:  V(0, spY+0.03, -0.24),
    mid:   V(0, spY+0.05, -0.02),
    fore:  V(0, spY+0.03,  0.18),
    neck:  V(0, spY-0.03,  0.32),
    mouth: V(0, spY-0.06,  0.42),
  };

  /* segmented grub body — a series of tapered ringed lobes, ridged dorsal carapace plates */
  tube(S.tail, S.rump, 0.150, 0.195, 8, P.hide,    {phase:Math.PI/8, capA:{hex:P.hideDk}});
  tube(S.rump, S.mid,  0.195, 0.225, 8, P.ichor,   {phase:Math.PI/8});
  tube(S.mid,  S.fore, 0.225, 0.190, 8, P.hide,    {phase:Math.PI/8});
  tube(S.fore, S.neck, 0.190, 0.140, 8, P.ichorDk, {phase:Math.PI/8});
  tube(S.neck, S.mouth,0.140, 0.170, 8, P.hideDk,  {phase:Math.PI/8});

  /* dorsal carapace ridge plates, segmented, running the spine */
  {
    const seg = [[-0.34,spY+0.19],[-0.14,spY+0.23],[0.06,spY+0.25],[0.24,spY+0.18]];
    for(let i=0;i<seg.length;i++){
      const [z,y]=seg[i];
      quad(V(-0.09,y,z-0.05), V(0.09,y,z-0.05), V(0.07,y+0.05,z+0.05), V(-0.07,y+0.05,z+0.05), P.carapace, 0.05);
      quad(V(-0.06,y+0.045,z), V(0.06,y+0.045,z), V(0,y+0.085,z-0.02), V(0,y+0.085,z-0.02), P.carapaceDk, 0.04);
    }
  }

  /* SUCKER-MOUTH RING — a broad flat mouth fused flat against the hull patch, radial pressure pits */
  {
    const mc = V(0, spY-0.10, 0.46);
    const rOut = ring(mc, V(0,0,1), 0.185, 0.185, 10, Math.PI/10);
    const rMid = ring(V(mc.x,mc.y,mc.z+0.015), V(0,0,1), 0.150, 0.150, 10, Math.PI/10);
    const rIn  = ring(V(mc.x,mc.y,mc.z+0.02), V(0,0,1), 0.095, 0.095, 10, Math.PI/10);
    stitch([rOut,rMid], ()=>P.sucker);
    stitch([rMid,rIn], ()=>P.suckerDk);
    capFan(rIn, V(mc.x,mc.y,mc.z+0.01), P.pit, true);
    /* ring of small pressure pits around the rim (no eye quads) */
    for(let i=0;i<10;i++){
      const t=(i/10)*Math.PI*2 + Math.PI/10;
      const px=mc.x+Math.cos(t)*0.165, py=mc.y+Math.sin(t)*0.165;
      quad(V(px-0.012,py-0.012,mc.z+0.005), V(px+0.012,py-0.012,mc.z+0.005), V(px+0.010,py+0.010,mc.z+0.005), V(px-0.010,py+0.010,mc.z+0.005), P.pit, 0.02);
    }
  }

  /* short splayed grasping limbs digging into the hull plate — sprawl posture, stubby */
  {
    const gripLeg=(shoulder, gx, gz)=>{
      const elbow = V(shoulder.x + Math.sign(shoulder.x)*0.14, spY-0.08, shoulder.z);
      const grip  = V(gx, 0.06, gz);
      tube(shoulder, elbow, 0.052, 0.040, 6, P.hide);
      tube(elbow, grip, 0.038, 0.022, 5, P.hideDk, {capB:{hex:P.carapaceDk, lift:0.006}});
      for(const [dx,dz] of [[0.02,0.03],[-0.02,0.03],[0,-0.02]]){
        const ct = V(grip.x+dx, 0.02, grip.z+dz);
        tube(V(grip.x,0.03,grip.z), ct, 0.010, 0.004, 3, P.carapaceDk, {capB:{hex:P.carapaceDk}});
      }
    };
    gripLeg(V(-0.16, spY-0.02, 0.12), -0.30, 0.24);
    gripLeg(V( 0.16, spY-0.02, 0.12),  0.30, 0.22);
    gripLeg(V(-0.20, spY,     -0.18), -0.34, -0.10);
    gripLeg(V( 0.20, spY,     -0.18),  0.34, -0.08);
  }

  /* stub tapering tail-tip */
  {
    const tp = V(0, spY-0.06, -0.54);
    tube(S.tail, tp, 0.15, 0.03, 8, P.hideDk, {phase:Math.PI/8, capB:{hex:P.hideDk, lift:0.005}});
  }

  /* the clamped hull-patch — a curved scrap-metal disc under the mouth-ring instead of open ground,
     riveted, standing in for the breach itself; sits flush inside/replacing the usual base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.hull);
    capFan(r2, V(0,0.043,0), P.hullLt);
    for(let i=0;i<6;i++){
      const t=(i/6)*Math.PI*2;
      const rx=0.30*Math.cos(t), rz=0.30*Math.sin(t);
      quad(V(rx-0.02,0.044,rz-0.02), V(rx+0.02,0.044,rz-0.02), V(rx+0.018,0.044,rz+0.02), V(rx-0.018,0.044,rz+0.02), P.rivet, 0.03);
    }
  }
}
