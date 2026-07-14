/* dev/model-qa/creatures/rlm-jungle-tiger-rider-scout.js — Jungle Tiger-Rider Scout (theater,
   jungle lens, Large, CR 6). Read: a scout crouched low along the back of a trained tiger, moving
   canopy trails — the tiger's low-slung striped quadruped body carries the rider almost flattened
   against its shoulders. Whole-object grammar: one merged frame, no anchors — tiger + rider read as
   ONE Large mounted silhouette. VS-desaturated dirty ochre-orange tiger stripes, dull leather scout
   gear, jungle-drab wraps. NO eye quads (mask/socket shading only). Large disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildJungleTigerRiderScout(){
  const P = {
    fur:0x8a5c34, furDk:0x5c3c20, furLt:0xa87642,
    stripe:0x2a2018, belly:0xc9b28a,
    nose:0x231b14, mouth:0x2e2018,
    claw:0x241f19,
    leather:0x4a3a28, leatherDk:0x2e2018,
    skin:0x8a715c, skinDk:0x5f4c3d,
    wrap:0x5a5236, wrapDk:0x3a3422,
    disc:0x3f362d, discTop:0x4c4238,
  };

  /* ---------- LANDMARKS — low-slung tiger spine, +z forward; ~1.5u barrel. ---------- */
  const wY = 0.62;
  const S = {
    croup:V(0,wY-0.02,-0.58), back:V(0,wY,-0.28), withers:V(0,wY+0.06,-0.02),
    chest:V(0,wY+0.01,0.22), neckB:V(0,wY+0.05,0.38), neckM:V(0,wY+0.16,0.52), headB:V(0,wY+0.16,0.68),
  };

  /* ---------- BODY BARREL — muscular low tiger torso, striped. ---------- */
  tube(S.croup,S.back,0.220,0.245,9,P.fur,{phase:Math.PI/9,capA:{hex:P.furDk,lift:0.02}});
  tube(S.back,S.withers,0.245,0.260,9,P.fur,{phase:Math.PI/9});
  tube(S.withers,S.chest,0.260,0.230,9,P.fur,{phase:Math.PI/9});
  tube(S.chest,S.neckB,0.230,0.170,9,P.furDk,{phase:Math.PI/9});
  tube(S.neckB,S.neckM,0.170,0.150,9,P.fur,{phase:Math.PI/9});
  tube(S.neckM,S.headB,0.150,0.120,9,P.furDk,{phase:Math.PI/9});
  // pale belly strip
  quad(V(-0.15,wY-0.20,-0.42),V(0.15,wY-0.20,-0.42),V(0.13,wY-0.20,0.16),V(-0.13,wY-0.20,0.16),P.belly,0.05);
  // dark stripe bands across the flank + back
  for(const [z,ang] of [[-0.44,0.5],[-0.24,0.7],[-0.02,0.9],[0.18,0.7]]){
    const y0=wY+0.20, y1=wY-0.18;
    quad(V(-0.02,y0,z), V(0.02,y0,z-ang*0.05), V(0.018,y1,z-ang*0.10), V(-0.018,y1,z-ang*0.05-0.05), P.stripe, 0.05);
  }

  /* ---------- HEAD — broad tiger skull, ruff, striped muzzle. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:wY+0.10,cz:0.72,rx:0.135,rz:0.140,hex:P.furDk},
      {y:wY+0.20,cz:0.70,rx:0.155,rz:0.150,hex:P.fur},
      {y:wY+0.30,cz:0.66,rx:0.125,rz:0.115,hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz),V(0,1,0),b.rx,b.rz,n,ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,wY+0.34,0.64), P.furDk);
    // muzzle
    const mB=V(0,wY+0.08,0.80), mT=V(0,wY+0.02,0.92);
    tube(mB,mT,0.090,0.055,n,P.belly,{raz:0.078,rbz:0.045,phase:ph,capB:{hex:P.nose,lift:0.006}});
    // ruff tufts on cheeks
    for(const s of [-1,1]) tube(V(s*0.13,wY+0.14,0.66),V(s*0.22,wY+0.06,0.70),0.030,0.010,4,P.furLt);
    // ears
    for(const s of [-1,1]) tube(V(s*0.09,wY+0.32,0.62),V(s*0.13,wY+0.42,0.60),0.030,0.006,5,P.furDk,{capB:{hex:P.fur,lift:0.006}});
    // mask shading, no eye quads
    for(const s of [-1,1]) quad(V(s*0.11-0.03,wY+0.20,0.74),V(s*0.11+0.03,wY+0.20,0.74),
         V(s*0.11+0.026,wY+0.24,0.735),V(s*0.11-0.026,wY+0.24,0.735),P.stripe,0.05);
  }

  /* ---------- LEGS — 4 muscular striped legs, planted for a stalking gait. ---------- */
  {
    const leg=(hipX,hipZ,footX,footZ,rear)=>{
      const hip=V(hipX,wY-0.06,hipZ), knee=V(hipX*1.02,0.30,hipZ+(rear?0.05:-0.02)), foot=V(footX,0.03,footZ);
      tube(hip,knee,rear?0.100:0.082,0.056,7,P.fur);
      tube(knee,foot,0.052,0.040,6,P.furDk,{capB:{hex:P.furDk,lift:0.006}});
      for(const [dx,dz] of [[0.03,0.03],[0,0.045],[-0.03,0.03]]) tube(V(foot.x,0.02,foot.z),V(foot.x+dx,0.0,foot.z+dz),0.012,0.005,4,P.claw);
    };
    leg(-0.17,0.20,-0.19,0.26,false); leg(0.17,0.20,0.19,0.22,false);
    leg(-0.19,-0.50,-0.21,-0.42,true); leg(0.19,-0.50,0.21,-0.46,true);
  }

  /* ---------- TAIL — long striped tail sweeping back and curling. ---------- */
  {
    const t0=V(0.02,wY-0.02,-0.62), t1=V(0.06,wY-0.10,-0.86), t2=V(0.14,0.20,-1.04), tip=V(0.22,0.34,-1.10);
    tube(t0,t1,0.072,0.052,8,P.fur,{phase:Math.PI/8,capA:{hex:P.furDk}});
    tube(t1,t2,0.052,0.030,8,P.stripe,{phase:Math.PI/8});
    tube(t2,tip,0.030,0.012,8,P.fur,{phase:Math.PI/8,capB:{hex:P.furDk,lift:0.006}});
  }

  /* ---------- SCOUT SADDLE-GEAR — leather straps/girth on the tiger's back. ---------- */
  {
    quad(V(-0.20,wY+0.19,-0.10),V(0.20,wY+0.19,-0.10),V(0.18,wY+0.19,0.14),V(-0.18,wY+0.19,0.14),P.leather,0.05);
    quad(V(-0.20,wY-0.10,0.02),V(-0.18,wY-0.10,0.02),V(-0.20,wY+0.20,0.02),V(-0.22,wY+0.20,0.02),P.leatherDk,0.05);
    quad(V(0.20,wY-0.10,0.02),V(0.18,wY-0.10,0.02),V(0.20,wY+0.20,0.02),V(0.22,wY+0.20,0.02),P.leatherDk,0.05);
  }

  /* ---------- RIDER — crouched flat along the back, low profile, head forward beside the tiger's neck. */
  {
    const rH=V(0,wY+0.30,-0.04), rC=V(0,wY+0.38,0.10), rSh=V(0,wY+0.42,0.24), rNk=V(0,wY+0.44,0.34), rHd=V(0,wY+0.46,0.42);
    const bands=[{y:rH.y,cz:rH.z,rx:0.100,hex:P.wrapDk},{y:rC.y,cz:rC.z,rx:0.105,hex:P.wrap},{y:rSh.y,cz:rSh.z,rx:0.100,hex:P.wrap}];
    const n=8, ph=Math.PI/n;
    const rings=bands.map(b=>ring(V(0,b.y,b.cz),V(0,1,0),b.rx,b.rx*0.75,n,ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,rNk.y+0.01,rNk.z), P.wrap);
    capFan(rings[0], V(0,rH.y-0.03,rH.z), P.wrapDk, true);
    // head, wrapped scarf, forward-low
    const hb=[{y:rHd.y-0.03,r:0.056,hex:P.skinDk},{y:rHd.y+0.02,r:0.060,hex:P.skin},{y:rHd.y+0.06,r:0.056,hex:P.wrapDk}];
    const hr=hb.map(b=>ring(V(0,b.y,rHd.z),V(0,1,0),b.r,b.r*0.9,7,Math.PI/7));
    stitch(hr, b=>hb[b].hex);
    capFan(hr.at(-1), V(0,rHd.y+0.10,rHd.z-0.01), P.wrapDk);
    // arms gripping the mane/girth forward
    tube(V(-0.10,rSh.y,rSh.z),V(-0.08,wY+0.30,0.50),0.032,0.022,5,P.wrap,{capB:{hex:P.skin,lift:0.015}});
    tube(V(0.10,rSh.y,rSh.z),V(0.08,wY+0.30,0.50),0.032,0.022,5,P.wrap,{capB:{hex:P.skin,lift:0.015}});
    // legs trailing along the tiger's flanks
    tube(V(-0.14,rH.y-0.02,rH.z-0.10),V(-0.20,wY-0.02,-0.20),0.040,0.026,5,P.wrapDk);
    tube(V(0.14,rH.y-0.02,rH.z-0.10),V(0.20,wY-0.02,-0.20),0.040,0.026,5,P.wrapDk);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
