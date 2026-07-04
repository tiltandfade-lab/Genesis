/* dev/model-qa/creatures/prop-arch.js — the ARCHWAY: a stone SET PIECE (whole-object prop).
   Not a creature — no eyes, no grip. One function, one geometry frame, no anchors. The read:
   a freestanding stone gate-arch you pass THROUGH, with an iron portcullis half-lowered in it.
   Tells:
     - TWO block-stacked JAMB columns (coursed masonry) framing an opening
     - a rounded ARCH SPAN of WEDGE blocks (voussoirs) bridging the jambs at the top
     - TALL — ~2.5u to the crown, so the ogre (~2.1u) clears the opening
     - a PORTCULLIS half-lowered in the opening: a grid of dark iron bars (vertical bars +
       2 horizontal cross-bars, SPIKED bottom ends) descending from the arch down to ~1.2u
   VS-desaturated: cold weathered stone greys for the masonry, dark cold iron for the grate.
   Scale reference: figures ~1.5u, ogre ~2.1u; opening clear height under the portcullis teeth
   ~1.2u–arch, jamb inner edges ~0.75u apart per side of center. Imported by prop-arch-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildArchway(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    stone:0x726f67, stoneDk:0x504d47, stoneDkr:0x35332f, stoneLt:0x928e82,   // masonry
    keystone:0x9e9a8c, chip:0xacab9e,                                        // lit keystone + pale broken edge
    moss:0x556149, mossDk:0x3f492f,                                          // damp weathering
    iron:0x494b4e, ironDk:0x2e2f30, ironLt:0x676a6e, rust:0x66492f,          // portcullis bars (lifted so they pop in the dark opening)
    disc:0x3a352b, discTop:0x46402f,
  };

  /* box helper (closed rectangular stone block, 3-tone) */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05); quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05); quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);  quad(Cc,G,H,D, top, 0.05);
  }

  /* ===== JAMBS — two block-stacked columns. Inner faces bound the opening. Coursed: each column
     is a stack of block courses, alternating two greys + slight per-course x jitter so it reads as
     laid masonry. Columns are ~0.28u square, inner edges at x=±0.42 (opening ~0.84u wide). ===== */
  const jx = 0.55;                       // column center offset
  const halfW = 0.14;                    // column half-width
  const zN = -0.16, zP = 0.16;           // column depth
  const springY = 1.9;                   // arch springline (top of the straight jambs)
  const courses = 8;
  function jamb(sign){
    const cx = sign*jx;
    const ch = springY / courses;
    for(let k=0;k<courses;k++){
      const y0 = 0.055 + k*ch, y1 = 0.055 + (k+1)*ch;
      // alternate course color + a small inset/outset so courses read
      const lit = (k&1);
      const top = lit?P.stoneLt:P.stone, mid = lit?P.stone:P.stoneDk, dk = P.stoneDkr;
      const jit = ((k%3)-1)*0.006;        // tiny per-course offset
      box(cx-halfW+jit, cx+halfW+jit, y0, y1-0.006, zN, zP, top, mid, dk);
    }
    // a couple of chipped facets + moss down each jamb
    quad(V(cx-halfW,0.5,zP), V(cx-halfW+0.06,0.5,zP), V(cx-halfW,0.5-0.09,zP), V(cx-halfW,0.5-0.09,zP), P.chip, 0.03);
    box(cx-halfW,cx+halfW, 0.055,0.055+0.20, zP-0.001,zP+0.006, P.moss,P.mossDk,P.mossDk); // moss skirt front
  }
  jamb(-1); jamb(+1);

  /* ===== ARCH SPAN — a semicircular ring of WEDGE blocks (voussoirs) from the top of one jamb,
     over the opening, to the top of the other. Built as an arc of trapezoid blocks radiating from
     the opening center at the springline. A brighter KEYSTONE at the apex. ===== */
  {
    const cy = springY;                 // arc center at springline height
    const rIn = jx - halfW + 0.02;      // inner radius = to the inner jamb face (~0.43)
    const rOut = jx + halfW + 0.02;     // outer radius (~0.71)
    const nV = 9;                        // voussoir count (odd → a center keystone)
    for(let i=0;i<nV;i++){
      const a0 = Math.PI * (i/nV);       // 0..π across the arch (left→right over the top)
      const a1 = Math.PI * ((i+1)/nV);
      const isKey = (i === (nV-1)/2);
      const lit = (i&1);
      const top = isKey?P.keystone : (lit?P.stoneLt:P.stone);
      const mid = isKey?P.stoneLt  : (lit?P.stone:P.stoneDk);
      const dk  = P.stoneDkr;
      // 8 corners of one wedge block (inner/outer arc × two angles × two depths)
      const p = (a,r,z)=>V(-Math.cos(a)*r, cy + Math.sin(a)*r, z);   // -cos so i=0 is LEFT (x=-)
      const iA=p(a0,rIn,zN), iB=p(a1,rIn,zN), oA=p(a0,rOut,zN), oB=p(a1,rOut,zN);   // back face
      const iAf=p(a0,rIn,zP), iBf=p(a1,rIn,zP), oAf=p(a0,rOut,zP), oBf=p(a1,rOut,zP);// front face
      quad(iAf,iBf,oBf,oAf, top, 0.05);      // front (+z)
      quad(oA,oB,iB,iA, mid, 0.05);          // back (-z)
      quad(oAf,oBf,oB,oA, top, 0.05);        // outer (extrados)
      quad(iA,iB,iBf,iAf, dk, 0.05);         // inner (intrados / underside of the arch)
      quad(iAf,oAf,oA,iA, dk, 0.05);         // start radial joint
      quad(oBf,iBf,iB,oB, mid, 0.05);        // end radial joint
    }
    // keystone crown flourish — a small raised cap on the apex outer face
    box(-0.06,0.06, cy+rOut-0.02, cy+rOut+0.10, zN,zP, P.keystone,P.stoneLt,P.stoneDk);
  }

  /* ===== PORTCULLIS — a grid of dark iron bars HALF-LOWERED in the opening, descending from just
     under the arch down to ~1.2u (SPIKED bottom teeth hanging in mid-air). Vertical bars + 2 cross
     bars. Set at z≈0 (mid-depth), behind the arch plane. ===== */
  {
    const z = 0.05, th = 0.026;            // bar radius; pulled slightly forward so it reads in the dimetric view
    const topY = springY + 0.30;           // bars slide up into the arch
    const botY = 1.20;                      // half-lowered — teeth hang at ~1.2u
    const spikeY = botY - 0.11;             // spike tips
    const barsX = [-0.30, -0.10, 0.10, 0.30];   // 4 vertical bars across the opening
    // vertical bars, each ending in a spike (a short taper to a point below botY)
    for(const bx of barsX){
      tube(V(bx,topY,z), V(bx,botY,z), th, th, 6, P.iron, {capA:{hex:P.ironDk}});
      // spike tooth
      tube(V(bx,botY,z), V(bx,spikeY,z), th, 0.001, 6, P.ironLt, {capB:{hex:P.ironLt}});
    }
    // 2 horizontal cross-bars binding the grid
    for(const cyb of [springY+0.05, botY+0.35]){
      tube(V(-0.40,cyb,z), V(0.40,cyb,z), th*0.9, th*0.9, 6, P.ironDk);
    }
    // a few rust streaks (thin dark-warm quads on the front of two bars)
    for(const bx of [-0.30, 0.10]){
      quad(V(bx-0.01,botY+0.5,z+th), V(bx+0.01,botY+0.5,z+th), V(bx+0.008,botY+0.1,z+th), V(bx-0.008,botY+0.1,z+th), P.rust, 0.05);
    }
  }

  /* base disc — shared style (r=0.48 for this larger prop). Stone tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
