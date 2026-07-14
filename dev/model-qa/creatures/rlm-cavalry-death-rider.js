/* dev/model-qa/creatures/rlm-cavalry-death-rider.js — Cavalry Death-Rider (theater, Large, CR 7).
   Read: a dead cavalry officer astride a dead warhorse, both frozen mid-charge — the horse's
   silhouette leaning hard forward with legs extended in full gallop, the rider low over the neck
   with a raised sabre. Whole-object grammar: one merged frame, no anchors — horse + rider read as
   ONE Large mounted silhouette (reusing the horse spine/leg grammar, desaturated to grave-pale
   corpse-hide + tattered dark cavalry coat). NO eye quads (hollow skull sockets only, both horse
   and rider). Large disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildCavalryDeathRider(){
  const P = {
    hide:0x5c5648, hideDk:0x3a362c, hideLt:0x6e6858,
    mane:0x2c2a22, maneDk:0x1a1812,
    hoof:0x201c16, hoofDk:0x121009,
    socket:0x0d0a07,
    coat:0x38342e, coatDk:0x201d19, coatLt:0x4a453d,
    skin:0x6c6858, skinDk:0x423f34,
    sabre:0x484844, hilt:0x6b5a2e,
    disc:0x3f362d, discTop:0x4c4238,
  };

  /* ---------- HORSE — reused low-arched galloping-lean spine grammar, corpse-pale/desaturated. ---- */
  const wY=1.10;
  const S = {
    croup:V(0,wY-0.10,-0.56), back:V(0,wY-0.04,-0.28), withers:V(0,wY+0.04,-0.02),
    chest:V(0,wY-0.02,0.24), neckB:V(0,wY+0.02,0.42), neckM:V(0,wY+0.14,0.58), poll:V(0,wY+0.22,0.72), headB:V(0,wY+0.17,0.82),
  };
  tube(S.croup,S.back,0.220,0.245,9,P.hide,{phase:Math.PI/9,capA:{hex:P.hideDk,lift:0.02}});
  tube(S.back,S.withers,0.245,0.260,9,P.hide,{phase:Math.PI/9});
  tube(S.withers,S.chest,0.260,0.230,9,P.hide,{phase:Math.PI/9});
  tube(S.chest,S.neckB,0.230,0.145,9,P.hideDk,{phase:Math.PI/9});
  tube(S.neckB,S.neckM,0.145,0.122,9,P.hide,{phase:Math.PI/9});
  tube(S.neckM,S.poll,0.122,0.095,9,P.hideDk,{phase:Math.PI/9});
  // gaunt rib-shadow patches on the flank (corpse read, not full skeleton)
  for(const [z,y] of [[-0.40,wY-0.08],[-0.14,wY-0.10]]){
    quad(V(-0.14,y,z-0.06),V(0.14,y,z-0.06),V(0.11,y+0.10,z+0.08),V(-0.11,y+0.10,z+0.08),P.hideDk,0.06);
  }
  // head
  {
    const n=9, ph=Math.PI/n;
    const bands=[{y:wY+0.13,cz:0.88,rx:0.084,rz:0.096,hex:P.hideDk},{y:wY+0.20,cz:0.86,rx:0.096,rz:0.112,hex:P.hide},{y:wY+0.26,cz:0.82,rx:0.088,rz:0.100,hex:P.hideDk}];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz),V(0,1,0),b.rx,b.rz,n,ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,wY+0.30,0.80), P.hideDk);
    const mB=V(0,wY+0.10,0.92), mT=V(0,wY+0.02,1.10);
    tube(mB,mT,0.082,0.044,n,P.hideDk,{raz:0.072,rbz:0.036,phase:ph,capB:{hex:P.socket,lift:0.006}});
    for(const s of [-1,1]) tube(V(s*0.058,wY+0.29,0.76),V(s*0.074,wY+0.42,0.72),0.028,0.006,5,P.hide,{capB:{hex:P.hideDk,lift:0.006}});
    // hollow eye sockets
    const ey=wY+0.22, ez=0.80;
    for(const s of [-1,1]){
      const ex=s*0.072;
      quad(V(ex-0.030,ey+0.024,ez), V(ex+0.030,ey+0.024,ez), V(ex+0.024,ey-0.026,ez), V(ex-0.024,ey-0.026,ez), P.socket, 0.02);
    }
  }
  // legs — extended full-gallop stance
  {
    const front1a=V(-0.16,wY-0.16,0.22), front1b=V(-0.30,0.48,0.52), front1f=V(-0.34,0.03,0.62);
    const front2a=V(0.16,wY-0.16,0.20), front2b=V(0.22,0.60,0.02), front2f=V(0.20,0.03,-0.08);
    const rear1a=V(-0.18,wY-0.16,-0.50), rear1b=V(-0.28,0.55,-0.66), rear1f=V(-0.30,0.03,-0.78);
    const rear2a=V(0.18,wY-0.16,-0.48), rear2b=V(0.30,0.50,-0.28), rear2f=V(0.34,0.03,-0.14);
    for(const [a,b,f,rear] of [[front1a,front1b,front1f,false],[front2a,front2b,front2f,false],[rear1a,rear1b,rear1f,true],[rear2a,rear2b,rear2f,true]]){
      tube(a,b,rear?0.098:0.084,0.044,7,P.hide);
      tube(b,f,0.040,0.034,6,P.hideDk,{capB:{hex:P.hoofDk,lift:0.006}});
    }
  }
  // tail
  {
    const t0=V(0.02,wY-0.20,-0.58), t1=V(0.06,wY-0.42,-0.68), t2=V(0.10,0.40,-0.72), tip=V(0.12,0.14,-0.68);
    tube(t0,t1,0.062,0.070,8,P.mane,{phase:Math.PI/8,capA:{hex:P.maneDk}});
    tube(t1,t2,0.070,0.048,8,P.maneDk,{phase:Math.PI/8});
    tube(t2,tip,0.048,0.014,8,P.maneDk,{phase:Math.PI/8,capB:{hex:P.maneDk,lift:0.006}});
  }
  // mane crest
  {
    const mane=[[S.neckB,0.14],[S.neckM,0.18],[S.poll,0.13]];
    for(let i=0;i<mane.length-1;i++){
      const [a,ha]=mane[i], [b,hb]=mane[i+1];
      const az=a.clone().add(V(0,ha,-0.02)), bz=b.clone().add(V(0,hb,-0.02));
      quad(a.clone().add(V(-0.02,0,-0.05)),a.clone().add(V(0.02,0,-0.05)),bz.clone().add(V(0.02,0,0)),bz.clone().add(V(-0.02,0,0)),P.mane,0.06);
    }
  }

  /* ---------- RIDER — low over the neck, one arm raised with a sabre. ---------- */
  {
    const rH=V(0,wY+0.26,0.36), rC=V(0,wY+0.36,0.48), rSh=V(0,wY+0.42,0.56), rNk=V(0,wY+0.46,0.60), rHd=V(0,wY+0.52,0.62);
    const n=8, ph=Math.PI/n;
    const bands=[{y:rH.y,cz:rH.z,rx:0.115,hex:P.coatDk},{y:rC.y,cz:rC.z,rx:0.120,hex:P.coat},{y:rSh.y,cz:rSh.z,rx:0.110,hex:P.coatLt}];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz),V(0,1,0),b.rx,b.rx*0.8,n,ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,rNk.y+0.01,rNk.z), P.coatLt);
    capFan(rings[0], V(0,rH.y-0.04,rH.z), P.coatDk, true);
    // tattered coat-tails streaming back
    for(const dx of [-0.10,0.0,0.10]) quad(V(dx,rH.y-0.02,rH.z-0.06),V(dx+0.05,rH.y-0.02,rH.z-0.06),V(dx+0.03,rH.y-0.18,rH.z-0.20),V(dx-0.02,rH.y-0.18,rH.z-0.20),P.coatDk,0.08);
    // skull head, hollow sockets
    const hb=[{y:rHd.y-0.03,r:0.058,hex:P.skinDk},{y:rHd.y+0.02,r:0.062,hex:P.skin},{y:rHd.y+0.06,r:0.050,hex:P.skinDk}];
    const hr=hb.map(b=>ring(V(0,b.y,rHd.z),V(0,1,0),b.r,b.r*0.9,7,Math.PI/7));
    stitch(hr, b=>hb[b].hex);
    capFan(hr.at(-1), V(0,rHd.y+0.10,rHd.z-0.01), P.skinDk);
    for(const s of [-1,1]) quad(V(s*0.026-0.014,rHd.y+0.01,rHd.z+0.05),V(s*0.026+0.014,rHd.y+0.01,rHd.z+0.05),
         V(s*0.026+0.011,rHd.y+0.03,rHd.z+0.048),V(s*0.026-0.011,rHd.y+0.03,rHd.z+0.048),P.socket,0.02);
    // raised arm with sabre
    const shR=V(-0.09,rSh.y,rSh.z), elR=V(-0.18,rSh.y+0.14,rSh.z+0.02), hR=V(-0.14,rSh.y+0.30,rSh.z-0.04);
    tube(shR,elR,0.036,0.026,5,P.coat); tube(elR,hR,0.026,0.020,5,P.coatDk,{capB:{hex:P.skin,lift:0.012}});
    tube(hR,V(-0.10,rSh.y+0.52,rSh.z-0.14),0.016,0.006,4,P.sabre,{capA:{hex:P.hilt,lift:0.01}});
    // other arm gripping the reins/mane
    const shL=V(0.09,rSh.y,rSh.z), elL=V(0.12,rC.y-0.02,rC.z+0.10), hL=V(0.08,wY+0.20,0.60);
    tube(shL,elL,0.034,0.024,5,P.coat); tube(elL,hL,0.024,0.018,5,P.coatDk,{capB:{hex:P.skin,lift:0.012}});
    // trailing legs along the horse flanks
    tube(V(-0.11,rH.y-0.02,rH.z-0.10),V(-0.18,wY-0.06,0.02),0.036,0.024,5,P.coatDk);
    tube(V(0.11,rH.y-0.02,rH.z-0.10),V(0.18,wY-0.06,0.02),0.036,0.024,5,P.coatDk);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
