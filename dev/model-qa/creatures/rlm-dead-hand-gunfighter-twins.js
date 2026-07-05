/* dev/model-qa/creatures/rlm-dead-hand-gunfighter-twins.js — "Dead Hand Gunfighter Twins"
   (frontier realm, Medium undead, CR 9, disc r=0.42). Twin duster-coated revenants standing
   BACK TO BACK sharing one base disc, four revolvers drawn between them (2 each, crossed low).
   VS-desaturated dusty grey-brown duster palette, gaunt undead faces, no eye quads. Whole-object
   grammar: authored as one merged frame — the two figures ARE the single silhouette. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildDeadHandGunfighterTwins(){
  const P = {
    hide:0x8a8272, hideDk:0x5c5648, hideLt:0x9e9686,       // pale gaunt undead skin
    duster:0x453d30, dusterDk:0x2b2519, dusterLt:0x584e3e,
    hat:0x241f17, iron:0x565048, ironDk:0x2e2a24,
    socket:0x18150f, disc:0x4a4038, discTop:0x584a3a,
  };

  /* build one twin, mirrored/rotated 180 for the other — back to back sharing the disc center */
  const buildTwin=(faceZ /* +1 facing +z, -1 facing -z */, offX)=>{
    const fz = faceZ;
    const S = {
      pelvis:V(offX,0.52,-0.02*fz), waist:V(offX,0.70,0), chest:V(offX,0.94,0.01*fz),
      shldr:V(offX,1.10,0), neck:V(offX,1.17,0.01*fz), headB:V(offX,1.24,0.02*fz),
    };
    tube(S.pelvis,S.waist,0.145,0.160,8,P.duster,{phase:Math.PI/8});
    tube(S.waist,S.chest,0.160,0.175,8,P.dusterLt,{phase:Math.PI/8});
    tube(S.chest,S.shldr,0.175,0.155,8,P.duster,{phase:Math.PI/8});
    tube(S.shldr,S.neck,0.155,0.070,8,P.dusterDk,{phase:Math.PI/8});
    /* duster hem flare on the facing side */
    quad(V(offX-0.10,0.62,0.06*fz), V(offX+0.10,0.62,0.06*fz), V(offX+0.14,0.36,0.14*fz), V(offX-0.14,0.36,0.14*fz), P.duster, 0.06);

    /* gaunt head, socket shadows, no eyes */
    {
      const n=8, ph=Math.PI/n;
      const bands=[{y:1.20,rx:0.080,rz:0.082,hex:P.hide},{y:1.27,rx:0.088,rz:0.084,hex:P.hideLt},{y:1.34,rx:0.070,rz:0.066,hex:P.hideDk}];
      const rings=bands.map(b=>ring(V(offX,b.y,fz*0.02), V(0,1,0), b.rx, b.rz, n, ph));
      stitch(rings, b=>bands[b].hex);
      capFan(rings.at(-1), V(offX,1.38,fz*0.02), P.hideDk);
      for(const s of [-1,1]) quad(V(offX+s*0.05,1.29,fz*0.075+0.04*fz), V(offX+s*0.02,1.29,fz*0.08+0.04*fz),
                                    V(offX+s*0.02,1.24,fz*0.08+0.04*fz), V(offX+s*0.05,1.24,fz*0.075+0.04*fz), P.socket, 0.02);
    }
    /* low hat brim */
    {
      const r1=ring(V(offX,1.38,fz*0.02),V(0,1,0),0.125,0.125,10);
      const r2=ring(V(offX,1.40,fz*0.02),V(0,1,0),0.07,0.07,10);
      const r3=ring(V(offX,1.50,fz*0.02),V(0,1,0),0.07,0.07,10);
      stitch([r1,r2],()=>P.hat); stitch([r2,r3],()=>P.hat); capFan(r3, V(offX,1.52,fz*0.02), P.hat);
    }
    /* two arms per twin, each gripping a drawn revolver, held low & crossed toward center */
    for(const s of [-1,1]){
      const sh=V(offX+s*0.17,1.04,0.01*fz);
      const el=V(offX+s*0.10,0.84,0.14*fz);
      const ha=V(offX-s*0.02,0.66,0.22*fz);   // hand swings toward the shared centerline
      tube(sh,el,0.058,0.044,6,P.duster,{phase:Math.PI/6});
      tube(el,ha,0.044,0.032,6,P.hide,{phase:Math.PI/6,capB:{hex:P.hideDk,lift:0.012}});
      /* revolver */
      const gEnd=V(ha.x+s*0.02, ha.y-0.02, ha.z+0.14*fz);
      tube(ha,gEnd,0.024,0.014,5,P.iron,{capB:{hex:P.ironDk}});
      quad(V(ha.x-0.02,ha.y+0.03,ha.z-0.01*fz), V(ha.x+0.02,ha.y+0.03,ha.z-0.01*fz),
           V(ha.x+0.018,ha.y-0.02,ha.z), V(ha.x-0.018,ha.y-0.02,ha.z), P.ironDk, 0.03);
    }
    /* legs */
    for(const s of [-1,1]){
      const hip=V(offX+s*0.08,0.50,-0.01*fz), knee=V(offX+s*0.09,0.28,0.01*fz), foot=V(offX+s*0.09,0.04,0.05*fz);
      tube(hip,knee,0.10,0.075,7,P.duster);
      tube(knee,foot,0.070,0.055,6,P.hideDk,{capB:{hex:P.hideDk,lift:0.012}});
    }
  };

  buildTwin(1, -0.13);   // faces +z, offset left
  buildTwin(-1, 0.13);   // faces -z (back to back), offset right

  /* base disc (Medium: r=0.42), shared by both twins */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
