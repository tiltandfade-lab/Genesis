/* dev/model-qa/creatures/rlm-the-colour.js — THE COLOUR (cosmic, Large, CR 8). Read: a shifting
   stain of unnameable light with no fixed silhouette — a loose, uneven blob-mass of layered
   translucent-read color bands that bulges and thins unevenly, no limbs, no head, no fixed shape,
   just a stain that has crept up off the ground into a rough mass. VS-desaturated but the ONE place
   the "unnameable color" gets to read slightly off-palette — a sick washed-out violet-grey-green
   that refuses to sit still, per cosmic register. NO eye quads (it has none). Whole-object grammar,
   one merged frame. Large disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheColour(){
  const P = {
    stainA:0x5c6058, stainB:0x545a62, stainC:0x60585c,          // shifting unnameable stain (grey-violet-green)
    stainDk:0x363a38, stainLt:0x767c72,
    creep:0x484e46,                                              // ground-creep edge, darker
    fleck:0x8a9088,                                              // faint sick highlight flecks
    disc:0x38362e, discTop:0x484638,
  };

  /* ---------- MAIN STAIN-MASS — an uneven blobby column, radius bulging/thinning band to band with
     no rhythm (no fixed silhouette), built from off-center rings so it leans and sags unevenly. -- */
  {
    const n=11, ph=Math.PI/n;
    const bands=[
      {y:0.04, cx:0.02,  cz:-0.05, r:0.30, hex:P.creep},
      {y:0.18, cx:-0.06, cz:0.08,  r:0.44, hex:P.stainA},
      {y:0.30, cx:0.08,  cz:-0.04, r:0.32, hex:P.stainC},
      {y:0.44, cx:-0.04, cz:0.10,  r:0.48, hex:P.stainB},
      {y:0.58, cx:0.06,  cz:-0.08, r:0.28, hex:P.stainDk},
      {y:0.70, cx:-0.08, cz:0.02,  r:0.38, hex:P.stainA},
      {y:0.82, cx:0.03,  cz:0.06,  r:0.20, hex:P.stainLt},
      {y:0.92, cx:-0.02, cz:-0.04, r:0.26, hex:P.stainC},
      {y:1.00, cx:0.0,   cz:0.0,   r:0.12, hex:P.stainDk},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.r, b.r*1.08, n, ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(0,1.06,0), P.stainDk);
    capFan(rings[0], V(0,-0.01,0), P.creep, true);
  }

  /* ---------- BULGING OUTCROPS — a few asymmetric extra lobes swelling off the main mass at
     uneven heights, no rhythm, no matching pair — reinforcing "no fixed silhouette". ---------- */
  {
    const lobes=[
      {c:V(0.34,0.30,0.10), r:0.20},
      {c:V(-0.30,0.52,-0.14), r:0.16},
      {c:V(0.18,0.68,0.26), r:0.13},
      {c:V(-0.20,0.14,0.22), r:0.15},
    ];
    lobes.forEach((lb,i)=>{
      const n=8, ph=Math.PI/n;
      const bands=[
        {t:-0.7,r:0.4},{t:-0.2,r:0.9},{t:0.35,r:1.0},{t:0.75,r:0.4},
      ];
      const rings=bands.map(b=>ring(V(lb.c.x, lb.c.y+b.t*lb.r, lb.c.z), V(0,1,0), lb.r*b.r, lb.r*b.r, n, ph));
      stitch(rings, ()=>(i%2?P.stainB:P.stainC));
      capFan(rings.at(-1), V(lb.c.x, lb.c.y+lb.r*0.85, lb.c.z), P.stainDk);
      capFan(rings[0], V(lb.c.x, lb.c.y-lb.r*0.85, lb.c.z), P.creep, true);
    });
  }

  /* ---------- GROUND-CREEP EDGE — the stain reads as having crept up from the tile, a wide flat
     uneven puddle-skirt around the base before it rises into the mass. ---------- */
  {
    const pts=8;
    for(let i=0;i<pts;i++){
      const a=(i/pts)*Math.PI*2;
      const rr = 0.30 + (i%3)*0.06;
      const x0=Math.cos(a)*0.16, z0=Math.sin(a)*0.16;
      const x1=Math.cos(a)*rr, z1=Math.sin(a)*rr;
      quad(V(x0,0.03,z0), V(x1,0.01,z1), V(x1*0.7,0.005,z1*0.7), V(x0*0.7,0.02,z0*0.7), P.creep, 0.10);
    }
  }

  /* ---------- FAINT FLECKS — sparse sick pale highlight flecks scattered across the mass, the
     "unnameable" quality — never resolving into a pattern, no rhythm. ---------- */
  {
    for(let i=0;i<9;i++){
      const a=(i*2.4)%(Math.PI*2), hy=0.15+((i*0.11)%0.85);
      const rx=Math.cos(a)*0.30, rz=Math.sin(a)*0.30;
      quad(V(rx-0.02,hy,rz), V(rx+0.02,hy,rz), V(rx+0.015,hy+0.025,rz+0.01), V(rx-0.015,hy+0.025,rz+0.01), P.fleck, 0.14);
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
