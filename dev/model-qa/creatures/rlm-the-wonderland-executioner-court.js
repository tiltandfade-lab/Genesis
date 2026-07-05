/* dev/model-qa/creatures/rlm-the-wonderland-executioner-court.js — THE WONDERLAND EXECUTIONER-
   COURT (bright-kingdom, Large, CR 8). A whirling mass of card-guards rising as a single
   verdict. Read: NOT a single humanoid — a Large swarm-silhouette built from a ring of stacked,
   overlapping flat card-guard bodies (spade-suit playing-card torsos, stubby limbs, halberd
   arms) whirling around a shared vertical axis, denser/taller at the center, thinning toward
   the edges — reading as one cohesive rising mass rather than individual soldiers. No eye quads
   anywhere (dark socket recesses on the card-faces that show). Whole-object grammar, one merged
   frame, no anchors. Large disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheWonderlandExecutionerCourt(){
  const P = {
    cardWhite:0xb8ae98, cardCream:0xc9bfa8,
    spade:0x201e1a, spadeDk:0x141310,
    trim:0x8a2530, trimDk:0x5e1a22,
    limb:0x9c8968, limbDk:0x6e5f45,
    haft:0x4a3a28, blade:0x716a5e, bladeDk:0x4a453c,
    disc:0x453f34, discTop:0x534c40,
  };

  /* one flat card-guard figure: a rectangular card-torso with a spade pip, stubby arms, one
     holding a small halberd. Built at a local origin then placed by rotate+offset below. */
  function cardGuard(cx, cz, angle, h, scale){
    const cos=Math.cos(angle), sin=Math.sin(angle);
    const rot=(x,z)=>({x:cx + (x*cos - z*sin), z:cz + (x*sin + z*cos)});

    // flat card-torso: a thin rectangular slab (two-sided quad pair) standing upright
    const w=0.10*scale, half=w/2, y0=h, y1=h+0.34*scale;
    const f0=rot(-half,0.012), f1=rot(half,0.012);
    const b0=rot(-half,-0.012), b1=rot(half,-0.012);
    quad(V(f0.x,y0,f0.z), V(f1.x,y0,f1.z), V(f1.x,y1,f1.z), V(f0.x,y1,f0.z), P.cardCream, 0.05);
    quad(V(b1.x,y0,b1.z), V(b0.x,y0,b0.z), V(b0.x,y1,b0.z), V(b1.x,y1,b1.z), P.cardWhite, 0.05);
    // edge trim (thin sides)
    quad(V(f0.x,y0,f0.z), V(b0.x,y0,b0.z), V(b0.x,y1,b0.z), V(f0.x,y1,f0.z), P.trim, 0.04);
    quad(V(f1.x,y0,f1.z), V(b1.x,y0,b1.z), V(b1.x,y1,b1.z), V(f1.x,y1,f1.z), P.trim, 0.04);
    // spade pip on the card-face (the suit tell)
    {
      const py=y0+0.20*scale, ps=0.045*scale;
      const p=rot(0,0.013);
      quad(V(p.x-ps*0.5,py+ps,p.z), V(p.x+ps*0.5,py+ps,p.z), V(p.x,py-ps*0.6,p.z), V(p.x,py-ps*0.6,p.z), P.spade, 0.04);
      quad(V(p.x-ps*0.3,py-ps*0.4,p.z), V(p.x+ps*0.3,py-ps*0.4,p.z), V(p.x,py-ps*1.0,p.z), V(p.x,py-ps*1.0,p.z), P.spadeDk, 0.04);
    }
    // small card-face head cap: rounded top with dark socket recesses, no eye quads elsewhere
    {
      const hc=rot(0, 0.012);
      const r0=ring(V(hc.x,y1,hc.z), V(0,1,0), 0.05*scale, 0.03*scale, 6, angle);
      capFan(r0, V(hc.x,y1+0.05*scale,hc.z), P.cardCream);
      const sL=rot(-0.02,0.03), sR=rot(0.02,0.03);
      const sy=y1-0.02*scale;
      quad(V(sL.x-0.01,sy+0.01,sL.z), V(sL.x+0.01,sy+0.01,sL.z), V(sL.x+0.008,sy-0.01,sL.z), V(sL.x-0.008,sy-0.01,sL.z), P.spadeDk, 0.03);
      quad(V(sR.x-0.01,sy+0.01,sR.z), V(sR.x+0.01,sy+0.01,sR.z), V(sR.x+0.008,sy-0.01,sR.z), V(sR.x-0.008,sy-0.01,sR.z), P.spadeDk, 0.03);
    }
    // stubby arms — one bare, one gripping a small halberd raised
    {
      const shL=rot(-half-0.01, 0.10), hdL=rot(-half-0.06, 0.03);
      tube(V(shL.x,y0+0.24*scale,shL.z), V(hdL.x,y0+0.12*scale,hdL.z), 0.020*scale,0.014*scale,5,P.limb,{capB:{hex:P.limbDk,lift:0.004}});
      const shR=rot(half+0.01, 0.10), hdR=rot(half+0.06, -0.02);
      tube(V(shR.x,y0+0.24*scale,shR.z), V(hdR.x,y0+0.30*scale,hdR.z), 0.020*scale,0.014*scale,5,P.limb);
      // small halberd: haft rising + a stubby blade
      const hB=V(hdR.x,y0+0.30*scale,hdR.z), hT=V(hdR.x,y1+0.30*scale,hdR.z);
      tube(hB,hT,0.010*scale,0.008*scale,5,P.haft);
      const bl=rot(half+0.09,-0.02);
      quad(V(hT.x-0.02*scale,hT.y+0.03*scale,hT.z), V(hT.x+0.05*scale,hT.y+0.02*scale,hT.z), V(hT.x+0.03*scale,hT.y-0.04*scale,hT.z), V(hT.x-0.01*scale,hT.y-0.02*scale,hT.z), P.blade, 0.05);
    }
    // stubby legs planted
    {
      const lL=rot(-0.03,0.01), lR=rot(0.03,0.01);
      tube(V(lL.x,y0,lL.z), V(lL.x,y0-0.10*scale,lL.z), 0.026*scale,0.020*scale,5,P.limbDk);
      tube(V(lR.x,y0,lR.z), V(lR.x,y0-0.10*scale,lR.z), 0.026*scale,0.020*scale,5,P.limbDk);
    }
  }

  /* ---------- WHIRLING MASS — a ring of overlapping card-guards around a shared vertical axis,
     denser/taller near the center, thinning toward the edges: reads as one rising verdict. ------- */
  const N = 10;
  for(let i=0;i<N;i++){
    const t = i/N;
    const angle = t*Math.PI*2 + (i%2)*0.18;              // whirl offset, staggered rotation
    const ringRad = 0.16 + 0.10*Math.sin(t*Math.PI*2*1.5)*0.4 + 0.14;  // slight in/out whirl
    const cx = Math.sin(angle)*ringRad;
    const cz = Math.cos(angle)*ringRad;
    const centerBias = 1 - Math.min(1, ringRad/0.34);     // taller/denser toward the middle
    const h = 0.02 + centerBias*0.18 + (i%3)*0.03;
    const scale = 0.78 + centerBias*0.5;
    cardGuard(cx, cz, angle + Math.PI, h, scale);
  }
  // one taller central guard rising through the core of the mass — the "verdict" focal read
  cardGuard(0.01, 0.01, 0.4, 0.30, 1.15);

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
