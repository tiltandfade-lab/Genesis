/* dev/model-qa/creatures/rlm-the-angle-that-ate-a-city.js — THE ANGLE THAT ATE A CITY
   (cosmic, Gargantuan, CR 20). Read: a fractally-wrong geometric mass the size of a district,
   STILL FOLDED — a nested lattice of interlocking wedges and impossible corners that keeps
   re-angling as it's read, silhouette a jagged mountain of self-similar shards, never a body.
   VS-desaturated cosmic palette (deep black-violet void wedges, cold slate facets, a sick pale
   fracture-line glow). NO eye quads — dark fracture seams instead. Whole-object grammar, one
   merged frame. Gargantuan disc r=0.72 (the largest single silhouette in the set). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheAngleThatAteACity(){
  const P = {
    slate:0x4c4e58, slateDk:0x2e2f38, slateLt:0x65677a,
    voidV:0x2a2432, voidDk:0x18141c,                           // deep black-violet void wedges
    fract:0x8a86a0,                                            // sick pale fracture-line glow
    seam:0x141216,                                              // dark fracture seams (no eyes)
    disc:0x201d26, discTop:0x2e2a36,
  };

  /* ---------- CORE MASS — a tall irregular nested-wedge lattice, built as stacked angular rings
     whose radius/rotation disagree band to band so the corners never line up — "still folded". -- */
  const cy = 1.10;
  {
    const n=8, ph0=Math.PI/n;                                   // low-n = hard angular facets, not round
    const bands=[
      {y:cy-0.85, r:0.10, ph:ph0*0.2, hex:P.voidDk},
      {y:cy-0.60, r:0.42, ph:ph0*1.3, hex:P.slate},
      {y:cy-0.35, r:0.30, ph:ph0*0.4, hex:P.voidV},
      {y:cy-0.12, r:0.58, ph:ph0*1.6, hex:P.slateLt},
      {y:cy+0.10, r:0.38, ph:ph0*0.7, hex:P.voidDk},
      {y:cy+0.32, r:0.62, ph:ph0*1.9, hex:P.slate},
      {y:cy+0.52, r:0.34, ph:ph0*0.5, hex:P.voidV},
      {y:cy+0.72, r:0.48, ph:ph0*1.4, hex:P.slateDk},
      {y:cy+0.90, r:0.22, ph:ph0*0.9, hex:P.voidDk},
      {y:cy+1.05, r:0.10, ph:ph0*1.7, hex:P.slate},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.r, b.r, n, b.ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(0,cy+1.14,0), P.voidDk);
    capFan(rings[0], V(0,cy-0.95,0), P.voidDk, true);
  }

  /* ---------- JUTTING WEDGE-SHARDS — angular flat quad-wedges stabbing off the core at every
     height, each a hard triangular facet reinforcing the "fractally wrong" district-sized read. -- */
  {
    const wedgeCount=16;
    for(let i=0;i<wedgeCount;i++){
      const a = (i/wedgeCount)*Math.PI*2 + (i%3)*0.35;
      const hy = cy - 0.7 + (i*0.13)%1.9;
      const rBase = 0.30 + (i%4)*0.10;
      const len = 0.20 + (i%5)*0.09;
      const x0=Math.cos(a)*rBase, z0=Math.sin(a)*rBase;
      const x1=Math.cos(a)*(rBase+len), z1=Math.sin(a)*(rBase+len);
      const yTip = hy + ((i%2)?0.18:-0.16);
      quad(V(x0,hy-0.10,z0), V(x0,hy+0.10,z0), V(x1,yTip,z1), V(x1,yTip,z1), (i%2?P.slate:P.voidV), 0.12);
      // dark fracture seam running the base of each wedge (no eyes; just cracks)
      quad(V(x0-0.02,hy-0.10,z0), V(x0+0.02,hy-0.10,z0), V(x0+0.015,hy+0.10,z0), V(x0-0.015,hy+0.10,z0), P.seam, 0.05);
    }
  }

  /* ---------- NESTED SUB-LATTICE — a smaller self-similar echo of the core mass, offset and
     tilted, fused into the main body's side — the fractal "still folding into itself" read. ----- */
  {
    const ox=0.42, oz=0.18, oy=cy-0.25;
    const n=7, ph0=Math.PI/n;
    const bands=[
      {y:oy-0.30, r:0.06, ph:ph0*0.3, hex:P.voidDk},
      {y:oy-0.10, r:0.22, ph:ph0*1.1, hex:P.slate},
      {y:oy+0.12, r:0.16, ph:ph0*0.6, hex:P.voidV},
      {y:oy+0.32, r:0.24, ph:ph0*1.5, hex:P.slateDk},
      {y:oy+0.50, r:0.08, ph:ph0*0.8, hex:P.voidDk},
    ];
    const rings=bands.map(b=>ring(V(ox,b.y,oz), V(0,1,0), b.r, b.r, n, b.ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(ox,oy+0.58,oz), P.voidDk);
    capFan(rings[0], V(ox,oy-0.36,oz), P.voidDk, true);
  }

  /* ---------- FRACTURE-LINE GLOW — thin sick-pale seams running across the core's facet joins,
     the only "light" this thing gives off, tracing where the angles disagree. ---------- */
  {
    const seamPts=[[cy-0.45,0.05],[cy-0.05,-0.30],[cy+0.35,0.15],[cy+0.70,-0.10]];
    seamPts.forEach(([sy,sx])=>{
      quad(V(sx-0.24,sy,0.10), V(sx+0.24,sy,-0.14), V(sx+0.20,sy+0.03,-0.10), V(sx-0.20,sy+0.03,0.14), P.fract, 0.15);
    });
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.71, 0.71, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.021,0), P.discTop, true);
  }
}
