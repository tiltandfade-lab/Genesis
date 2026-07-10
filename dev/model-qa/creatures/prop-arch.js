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

/* dev/model-qa/creatures/prop-arch.js — buildDoorframe: the DOORFRAME — a HUMAN-SCALE jamb+lintel
   door (not the monumental buildArchway above: half the height, plain, no voussoirs/portcullis).
   Not a creature — no eyes, no grip. One function, no anchors. Param-typed via {type}:
     - 'plank'  (default): wood-plank jamb+lintel, a wood-plank LEAF swung AJAR on a hinge
     - 'steel':  riveted steel jamb, a steel slot-door leaf (horizontal slot grooves) swung ajar
     - 'stone':  squared stone jamb, a heavy stone-slab leaf swung ajar
     - 'screen': plain wood jamb, a thin screen leaf (mesh cross-bracing) swung ajar
   Tells, bottom→top:
     - TWO plain squared JAMB posts framing a clear opening (~0.9u wide, ~1.78u clear tall — human
       scale, well under the ogre-arch's 2.5u crown)
     - a plain LINTEL bar bridging the jambs (no arch, no keystone — reads "plain door", not "gate")
     - a DOOR LEAF hinged at the left jamb, swung open ~40° into the room — THE USE-TELL: this
       door is mid-use, not a closed portal
     - per-type finish accents (plank grain lines / steel rivets+slot grooves / stone chip facets /
       screen mesh cross-bracing) carrying the material read
   VS-desaturated palette per type (a few close tones + one pale weathering/highlight + one accent).
   Scale reference: figures ~1.5u tall; clear opening ~1.78u (a figure passes through without
   ducking); one 5-ft cell ≈1.25u — this 1×1 footprint prop sits centered in that cell, spanning a
   rim gap. Imported by prop-arch-probe.html (or the doorframe's own probe). */
export function buildDoorframe(params){
  const type = (params && params.type) || 'plank';

  /* ---------- PALETTE (VS desaturated, per type) ---------- */
  const PAL = {
    plank: { fTop:0x7a5a3c, fMid:0x5e4530, fDk:0x40301f, fLt:0x8f6b48,           // wood jamb/lintel
             lTop:0x8a6947, lMid:0x6b4f32, lDk:0x4a3720, grain:0x3a2a18,          // plank leaf + grain lines
             accent:0xb7935f, disc:0x362a1c, discTop:0x40311f },
    steel: { fTop:0x74777c, fMid:0x54575c, fDk:0x35373a, fLt:0x8d9096,
             lTop:0x63666b, lMid:0x484a4e, lDk:0x2c2d30, grain:0x1e1f21,
             accent:0xc7cdd2, disc:0x2c2d30, discTop:0x36373a },                  // rivets = accent
    stone: { fTop:0x726f67, fMid:0x504d47, fDk:0x35332f, fLt:0x928e82,
             lTop:0x807c72, lMid:0x605d55, lDk:0x403d38, grain:0x2c2a26,
             accent:0xacab9e, disc:0x3a352b, discTop:0x46402f },                  // chip = accent
    screen: { fTop:0x7a5a3c, fMid:0x5e4530, fDk:0x40301f, fLt:0x8f6b48,
              lTop:0x746753, lMid:0x59503f, lDk:0x3c352a, grain:0x9a8d6f,          // mesh lighter than frame
              accent:0xb7935f, disc:0x362a1c, discTop:0x40311f },
  };
  const P = PAL[type] || PAL.plank;

  /* box helper (closed rectangular block, 3-tone — axis-aligned) */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05); quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05); quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);  quad(Cc,G,H,D, top, 0.05);
  }
  /* rotated-panel box helper — same 6-quad closed block, but the x,z footprint is an arbitrary
     quadrilateral (given as 4 [x,z] corners in winding order) instead of an axis-aligned rect.
     Used for the door leaf swung open on its hinge. */
  function panelBox(c0,c1,c2,c3, y0,y1, top, mid, dk){
    const A=V(c0[0],y0,c0[1]), B=V(c1[0],y0,c1[1]), Cc=V(c2[0],y0,c2[1]), D=V(c3[0],y0,c3[1]);
    const E=V(c0[0],y1,c0[1]), F=V(c1[0],y1,c1[1]), G=V(c2[0],y1,c2[1]), H=V(c3[0],y1,c3[1]);
    quad(H,G,F,E, top, 0.05); quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05); quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);  quad(Cc,G,H,D, top, 0.05);
  }
  const rot = (px,pz, x,z, a)=>{
    const dx=x-px, dz=z-pz, c=Math.cos(a), s=Math.sin(a);
    return [px + dx*c - dz*s, pz + dx*s + dz*c];
  };

  /* ===== FRAME — two plain squared jamb posts + a plain lintel bridging them. Human scale:
     opening ~0.90u wide, clear height ~1.78u (well under the archway's 2.5u crown). ===== */
  const halfW = 0.45;             // half the clear opening width
  const jambT = 0.085;            // jamb post thickness
  const depth = 0.11;             // jamb/lintel depth
  const clearH = 1.78;            // clear opening height
  const lintelH = 0.13;           // lintel bar height
  box(-halfW-jambT,-halfW, 0.055,clearH, -depth/2,depth/2, P.fLt,P.fMid,P.fDk);   // left jamb
  box( halfW, halfW+jambT, 0.055,clearH, -depth/2,depth/2, P.fLt,P.fMid,P.fDk);   // right jamb
  box(-halfW-jambT, halfW+jambT, clearH, clearH+lintelH, -depth/2,depth/2, P.fTop,P.fMid,P.fDk); // lintel

  /* ===== DOOR LEAF — hinged at the left jamb's inner-front edge, swung open ~42 deg into the
     room (+z). THE USE-TELL: ajar, not closed. ===== */
  {
    const hingeX = -halfW + 0.01, hingeZ = -depth/2 + 0.015;
    const Lw = halfW*2 - 0.06;    // leaf width (slightly under the clear opening)
    const Lt = 0.035;             // leaf thickness
    const y0 = 0.06, y1 = clearH - 0.02;
    const theta = 0.87;           // ~50 deg swing open — proud of the jamb plane on +z so the
                                   // ajar leaf reads clearly at a 3/4 camera angle
    // local (closed) corners: near-hinge edge at x=hingeX, far edge at x=hingeX+Lw; thin in z
    const c0 = rot(hingeX,hingeZ, hingeX,        hingeZ-Lt/2, theta);
    const c1 = rot(hingeX,hingeZ, hingeX+Lw,     hingeZ-Lt/2, theta);
    const c2 = rot(hingeX,hingeZ, hingeX+Lw,     hingeZ+Lt/2, theta);
    const c3 = rot(hingeX,hingeZ, hingeX,        hingeZ+Lt/2, theta);
    panelBox(c0,c1,c2,c3, y0,y1, P.lTop,P.lMid,P.lDk);

    // pale leading-edge highlight strip — the leaf's own face tones (lMid/lDk) sit close to the
    // jamb's tones, so the swung-open silhouette can wash out at a 3/4 angle. A thin PALE strip
    // proud of the far (free) edge's front face gives the "door ajar" use-tell a guaranteed
    // value-contrast read regardless of camera angle.
    {
      const e0 = rot(hingeX,hingeZ, hingeX+Lw, hingeZ-Lt/2-0.012, theta);
      const e1 = rot(hingeX,hingeZ, hingeX+Lw, hingeZ-Lt/2-0.001, theta);
      quad(V(e0[0],y1-0.01,e0[1]), V(e1[0],y1-0.01,e1[1]), V(e1[0],y0+0.01,e1[1]), V(e0[0],y0+0.01,e0[1]), P.fLt, 0.03);
    }

    // per-type finish accent on the swung leaf's outer face (c1-c2 edge, facing +x/+z-ish)
    const midOut = (a,b)=>[(a[0]+b[0])/2, (a[1]+b[1])/2];
    if(type === 'plank' || type === 'screen'){
      // vertical grain/plank division lines across the leaf face (3 thin quads)
      for(const f of [0.28, 0.52, 0.76]){
        const g0 = rot(hingeX,hingeZ, hingeX+Lw*f, hingeZ-Lt/2-0.001, theta);
        const g1 = rot(hingeX,hingeZ, hingeX+Lw*f+0.012, hingeZ-Lt/2-0.001, theta);
        quad(V(g0[0],y1-0.02,g0[1]), V(g1[0],y1-0.02,g1[1]), V(g1[0],y0+0.02,g1[1]), V(g0[0],y0+0.02,g0[1]), P.grain, 0.02);
      }
      if(type === 'screen'){
        // mesh cross-bracing (an X of two thin diagonal quads) reading as the screen panel
        const cA=rot(hingeX,hingeZ, hingeX+Lw*0.08, hingeZ-Lt/2-0.001, theta);
        const cB=rot(hingeX,hingeZ, hingeX+Lw*0.92, hingeZ-Lt/2-0.001, theta);
        quad(V(cA[0],y1-0.06,cA[1]), V(cA[0]+0.02,y1-0.06,cA[1]), V(cB[0],y0+0.06,cB[1]), V(cB[0]-0.02,y0+0.06,cB[1]), P.grain, 0.03);
        quad(V(cB[0],y1-0.06,cB[1]), V(cB[0]-0.02,y1-0.06,cB[1]), V(cA[0],y0+0.06,cA[1]), V(cA[0]+0.02,y0+0.06,cA[1]), P.grain, 0.03);
      }
    } else if(type === 'steel'){
      // horizontal slot grooves (2 thin dark bands) — the "slot-door" read
      for(const f of [0.4, 0.65]){
        const s0 = rot(hingeX,hingeZ, hingeX+0.06, hingeZ-Lt/2-0.001, theta);
        const s1 = rot(hingeX,hingeZ, hingeX+Lw-0.06, hingeZ-Lt/2-0.001, theta);
        const yy = y0 + (y1-y0)*f;
        quad(V(s0[0],yy+0.02,s0[1]), V(s1[0],yy+0.02,s1[1]), V(s1[0],yy-0.02,s1[1]), V(s0[0],yy-0.02,s0[1]), P.lDk, 0.02);
      }
      // rivets — 4 pale corner dots on the jamb faces (small quads, high-value accent)
      for(const [jx,jz] of [[-halfW-jambT/2,depth/2-0.02],[halfW+jambT/2,depth/2-0.02]]){
        for(const jy of [0.4, clearH-0.35]){
          quad(V(jx-0.014,jy+0.014,jz), V(jx+0.014,jy+0.014,jz), V(jx+0.014,jy-0.014,jz), V(jx-0.014,jy-0.014,jz), P.accent, 0.02);
        }
      }
    } else if(type === 'stone'){
      // chipped pale facet at a jamb top corner (weathering, matches the archway convention)
      quad(V(-halfW-jambT,clearH,depth/2), V(-halfW,clearH,depth/2), V(-halfW-jambT,clearH-0.12,depth/2), V(-halfW-jambT,clearH-0.12,depth/2), P.accent, 0.03);
    }

    /* ===== HINGE PLATES — two small hardware plates straddling the jamb/leaf pivot line (upper +
       lower), reading as the actual hinge the leaf swings on — not decoration, the mechanism tell. ===== */
    {
      const hpW = 0.05, hpD = 0.045, hpH = 0.16;
      for(const hy of [0.06+0.22, clearH-0.22-hpH]){
        box(hingeX-0.02, hingeX+hpW-0.02, hy, hy+hpH, hingeZ-hpD/2, hingeZ+hpD/2, P.grain, P.grain, P.fDk);
      }
    }

    /* ===== LATCH / HANDLE — a small hardware block on the leaf's free edge (opposite the hinge),
       mid-height, rotated with the leaf. THE grip-tell: this door has a handle you'd pull. ===== */
    {
      const latchY0 = (y0 + y1)/2 - 0.09, latchY1 = latchY0 + 0.12;
      const lx0 = hingeX + Lw - 0.14, lx1 = hingeX + Lw - 0.06;
      const lz0 = hingeZ - Lt/2 - 0.035, lz1 = hingeZ - Lt/2 - 0.002;
      const h0 = rot(hingeX,hingeZ, lx0, lz0, theta), h1 = rot(hingeX,hingeZ, lx1, lz0, theta);
      const h2 = rot(hingeX,hingeZ, lx1, lz1, theta), h3 = rot(hingeX,hingeZ, lx0, lz1, theta);
      panelBox(h0,h1,h2,h3, latchY0, latchY1, P.accent, P.accent, P.grain);
    }
  }

  /* ===== THRESHOLD STEP — a low worn sill spanning the opening base, protruding slightly into
     the room (+z) in front of the frame. Grounds the doorway as a used, stepped-through place. ===== */
  box(-halfW+0.04, halfW-0.04, 0.008, 0.05, -depth/2-0.05, -depth/2+0.01, P.fMid, P.fDk, P.fDk);

  /* ===== LINTEL CAP — a small raised cap block centered on the lintel top, catching the light
     (the one high-value accent zone, matching the archway's keystone-flourish convention). ===== */
  box(-0.06,0.06, clearH+lintelH, clearH+lintelH+0.05, -depth/2-0.02, depth/2+0.02, P.accent, P.fLt, P.fDk);

  /* base disc — shared style (r=0.44, sized between the counter props and the archway). */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
