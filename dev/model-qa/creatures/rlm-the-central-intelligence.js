/* dev/model-qa/creatures/rlm-the-central-intelligence.js — THE CENTRAL INTELLIGENCE (chrome,
   Gargantuan construct/aberration, CR 17). Read: a building-spanning cluster fused into the
   architecture itself — a massive vertical core column wrapped in cabling and mounted screen-
   panels, ringed by a lower skirt of mechanical eye-stalks (lens-tipped, not quad "eyes") that
   pivot outward, cabling looping and draping between screen-panels and down into the floor,
   as if the room itself grew out of it. Chrome register: clean hard surfaces gone monumental —
   pale institutional gunmetal/white housing, dense black cabling, a cold blue-white glow at
   every lens/screen. NO eye quads — every "eye" is a lens disc on a stalk. Whole-object
   grammar: one function, one frame, no anchors. Gargantuan size, base disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTHECENTRALINTELLIGENCE(){
  const P = {
    hull:0x9098a0, hullDk:0x5c636a, hullLt:0xb4bac0,
    screen:0x1c2226, screenLt:0x2a3238,
    glow:0x7fe0f5, glowDk:0x2a8fa8,
    cable:0x181a1c, cableLt:0x2c2e30,
    lens:0x9ff2ff, lensDk:0x1c5a68,
    rivet:0x141618, disc:0x4a4038, discTop:0x585047,
  };

  const baseY = 0.30;
  const coreTopY = 2.6;

  /* CENTRAL CORE COLUMN — tall stacked drum, wide base narrowing upward, fused into "walls" */
  {
    const bands=[
      {y:baseY,        rx:0.62, hex:P.hullDk},
      {y:baseY+0.5,     rx:0.58, hex:P.hull},
      {y:baseY+1.1,     rx:0.50, hex:P.hullLt},
      {y:baseY+1.7,     rx:0.40, hex:P.hull},
      {y:baseY+2.2,     rx:0.30, hex:P.hullDk},
      {y:coreTopY,       rx:0.20, hex:P.hullDk},
    ];
    const n=14, ph=Math.PI/n;
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,coreTopY+0.15,0), P.hullDk);
    capFan(rings[0], V(0,baseY-0.06,0), P.hullDk, true);
    /* riveted seam bands at two heights */
    for(const ringY of [baseY+0.5, baseY+1.7]){
      for(let i=0;i<n;i++){ const t=(i/n)*Math.PI*2;
        const rr = ringY<1.2?0.58:0.40;
        quad(V(Math.cos(t)*rr,ringY+0.03,Math.sin(t)*rr), V(Math.cos(t)*rr+0.02,ringY+0.03,Math.sin(t)*rr+0.02),
             V(Math.cos(t)*(rr-0.01)+0.02,ringY-0.04,Math.sin(t)*(rr-0.01)+0.02), V(Math.cos(t)*(rr-0.01),ringY-0.04,Math.sin(t)*(rr-0.01)), P.rivet, 0.02);
      }
    }
  }

  /* SCREEN-PANELS — flat glowing rectangles mounted around the core at three heights */
  {
    const screenRow=(y, rr, n, sc)=>{
      for(let i=0;i<n;i++){
        const t=(i/n)*Math.PI*2;
        const dx=Math.cos(t), dz=Math.sin(t);
        const cx=dx*rr, cz=dz*rr;
        const ux=-dz, uz=dx; // tangent for panel width
        const w=0.13*sc, h=0.20*sc;
        const p1=V(cx-ux*w, y-h/2, cz-uz*w), p2=V(cx+ux*w, y-h/2, cz+uz*w);
        const p3=V(cx+ux*w, y+h/2, cz+uz*w), p4=V(cx-ux*w, y+h/2, cz-uz*w);
        quad(p1,p2,p3,p4, i%2===0?P.screen:P.screenLt, 0.06);
        const gw=w*0.6, gh=h*0.5;
        const g1=V(cx-ux*gw, y-gh/2, cz-uz*gw), g2=V(cx+ux*gw, y-gh/2, cz+uz*gw);
        const g3=V(cx+ux*gw, y+gh/2, cz+uz*gw), g4=V(cx-ux*gw, y+gh/2, cz-uz*gw);
        quad(g1,g2,g3,g4, P.glow, 0.1);
      }
    };
    screenRow(baseY+0.55, 0.60, 6, 1.0);
    screenRow(baseY+1.15, 0.52, 6, 0.9);
    screenRow(baseY+1.75, 0.42, 5, 0.75);
  }

  /* CABLING — draped loops between screen bands and down to the floor */
  {
    const loop=(y0, y1, r0, r1, ang)=>{
      const dx=Math.cos(ang), dz=Math.sin(ang);
      const a = V(dx*r0, y0, dz*r0);
      const sagY = (y0+y1)/2 - 0.18;
      const b = V(dx*(r0+r1)/2*0.9, sagY, dz*(r0+r1)/2*0.9);
      const c = V(dx*r1, y1, dz*r1);
      tube(a,b,0.028,0.024,5,P.cable);
      tube(b,c,0.024,0.020,5,P.cableLt);
    };
    for(const ang of [0.4, 1.6, 2.8, 4.0, 5.2]) loop(baseY+1.9, baseY+1.05, 0.40, 0.55, ang);
    for(const ang of [0.9, 2.3, 3.7, 5.0]) loop(baseY+0.95, baseY+0.20, 0.55, 0.65, ang);
    /* cables spilling down to floor, fused-to-architecture read */
    for(const ang of [0.2, 2.1, 3.9, 5.4]){
      const dx=Math.cos(ang), dz=Math.sin(ang);
      tube(V(dx*0.65,baseY+0.15,dz*0.65), V(dx*0.72,0.04,dz*0.72), 0.026, 0.020, 5, P.cable, {capB:{hex:P.cableLt, lift:0.01}});
    }
  }

  /* MECHANICAL EYE-STALKS — a lower skirt ring of lens-tipped stalks pivoting outward (no eye quads) */
  {
    const stalkCount=8;
    for(let i=0;i<stalkCount;i++){
      const t=(i/stalkCount)*Math.PI*2 + 0.3;
      const dx=Math.cos(t), dz=Math.sin(t);
      const y = baseY+0.12+(i%2)*0.06;
      const rootR = 0.60;
      const root = V(dx*rootR, y, dz*rootR);
      const mid  = V(dx*(rootR+0.16), y+0.05, dz*(rootR+0.16));
      const tip  = V(dx*(rootR+0.26), y+0.02, dz*(rootR+0.26));
      tube(root, mid, 0.045, 0.036, 6, P.hullDk);
      tube(mid, tip, 0.036, 0.030, 6, P.hull);
      /* lens housing + glowing lens disc, pivoted to face outward */
      const hb = ring(tip, V(dx,0,dz), 0.038, 0.038, 8, Math.PI/8);
      const ht = ring(V(tip.x+dx*0.03,tip.y,tip.z+dz*0.03), V(dx,0,dz), 0.038, 0.038, 8, Math.PI/8);
      stitch([hb,ht], ()=>P.hullLt);
      capFan(ht, V(tip.x+dx*0.05,tip.y,tip.z+dz*0.05), P.lensDk);
      capFan(hb, V(tip.x-dx*0.01,tip.y,tip.z-dz*0.01), P.lens, true);
    }
  }

  /* base disc (Gargantuan: r=0.72) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.060,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.063,0), P.discTop);
  }
}
