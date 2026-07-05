/* dev/model-qa/creatures/rlm-ash-grey-ochre-seep.js — the ASH-GREY OCHRE SEEP (lost-world, Large
   ooze, CR 2). A corrosive ooze seeping UP through cracks in a burial-chamber floor: not one mound
   but a low SPREADING SHEET riven by dark fissure-lines, welling into several seep-heads where the
   ochre-grey mass bulges thickest. Whole-object grammar: one function, one frame, no anchors.
   Palette: ash-grey body shot through with sick ochre-yellow (the "corrosive" tell), darker at the
   fissures (deep in the crack), paler ochre foam at the rising seep-heads. Lost-world register:
   VS-desaturated, grave-dust grey rather than wet slate — a thing that crept up out of tomb stone.
   NO eyes/face. Large size: spread ~1.0u wide, low (~0.5u), base disc r=0.55. */
import { THREE, V, quad, tube, blob, ring, stitch, capFan } from '../probe-lib.js';

export function buildAshGreyOchreSeep(){
  /* ---------- PALETTE (ash-grey ooze shot through with sick ochre; VS desaturated, dusty) ---------- */
  const P = {
    ash:0x5c584c, ashDk:0x3f3c33, ashLt:0x767159,      /* the dominant ash-grey mass */
    ochre:0x8a7431, ochreDk:0x5f4f22, ochreLt:0xa8904a, /* corrosive ochre-yellow veining/foam */
    fissure:0x201d18,                                   /* dark crack lines, deep floor-crack read */
    sheen:0xb8ad86,                                     /* pale glisten where ochre foams up */
    disc:0x453d2e, discTop:0x554c37,
  };

  /* ---------- FLOOR SHEET — a low, wide, irregular spreading mass (not a dome: several joined
     low blobs so the silhouette reads as a SEEP across the ground, not a single mound). ---------- */
  const sheetLobes = [
    {cx: 0.00, cz: 0.00, rx:0.44, ry:0.16, rz:0.42, hex:P.ash},
    {cx: 0.36, cz: 0.22, rx:0.28, ry:0.13, rz:0.26, hex:P.ashDk},
    {cx:-0.34, cz: 0.10, rx:0.26, ry:0.12, rz:0.28, hex:P.ash},
    {cx: 0.06, cz:-0.38, rx:0.24, ry:0.11, rz:0.22, hex:P.ashDk},
    {cx:-0.20, cz:-0.32, rx:0.20, ry:0.10, rz:0.20, hex:P.ash},
  ];
  for(const L of sheetLobes){
    const rings = blob(L.cx, L.ry, L.cz, L.rx, L.ry, L.rz, L.hex, 9, 4);
    rings.forEach((rg,k)=>{ if(k<=1) rg.forEach(p=>{ if(p.y<0.02) p.y=0.006; }); });
  }

  /* ---------- SEEP-HEADS — 3 thicker ochre-foamed bulges where the mass wells up thickest, the
     "corrosive seeping up through a crack" tell: pale ochre foam crown over a darker ochre throat. ---------- */
  const heads = [
    {cx:0.12, cz:0.02, r:0.20, h:0.30},
    {cx:-0.28, cz:0.18, r:0.15, h:0.24},
    {cx:0.10, cz:-0.30, r:0.13, h:0.20},
  ];
  for(const H of heads){
    const throat = blob(H.cx, H.h*0.35, H.cz, H.r*0.85, H.h*0.4, H.r*0.85, P.ochreDk, 8, 4);
    const crown  = blob(H.cx, H.h*0.7,  H.cz, H.r*0.55, H.h*0.35, H.r*0.55, P.ochre, 8, 4);
    capFan(crown.at(-1), V(H.cx, H.h*0.95, H.cz), P.sheen);
    /* a couple bright foam dabs at the crown lip */
    quad(V(H.cx-H.r*0.3,H.h*0.75,H.cz-H.r*0.2), V(H.cx+H.r*0.2,H.h*0.75,H.cz-H.r*0.25),
         V(H.cx+H.r*0.15,H.h*0.85,H.cz+H.r*0.1), V(H.cx-H.r*0.25,H.h*0.85,H.cz+H.r*0.15), P.ochreLt, 0.05);
    throat; /* referenced for lint clarity — throat rings already stitched by blob() */
  }

  /* ---------- FISSURE LINES — dark crack-quads scoring the sheet between the seep-heads, selling
     "floor cracks it rose from" rather than a puddle. ---------- */
  {
    const cracks = [
      [[-0.02,0.030,-0.02],[0.10,0.028,0.06],[0.22,0.026,0.14],[0.34,0.024,0.20]],
      [[-0.06,0.028,0.02],[-0.18,0.026,0.10],[-0.30,0.024,0.16]],
      [[0.02,0.026,-0.10],[0.06,0.024,-0.22],[0.10,0.022,-0.32]],
    ];
    for(const seg of cracks){
      for(let i=0;i<seg.length-1;i++){
        const [x0,y0,z0]=seg[i], [x1,y1,z1]=seg[i+1];
        const w=0.03;
        quad(V(x0-w,y0,z0), V(x0+w,y0,z0), V(x1+w*0.7,y1,z1), V(x1-w*0.7,y1,z1), P.fissure, 0.05);
      }
    }
  }

  /* ---------- SHEEN DABS — scattered small bright quads selling wet/corrosive glisten on the sheet --- */
  const dab=(x,y,z,r,hex)=>quad(V(x-r,y,z-r), V(x+r,y,z-r), V(x+r,y+r*0.3,z+r), V(x-r,y+r*0.3,z+r), hex, 0.04);
  dab(0.30, 0.20, -0.10, 0.05, P.sheen);
  dab(-0.10, 0.15, 0.28, 0.045, P.ochreLt);
  dab(0.02, 0.10, -0.36, 0.04, P.sheen);

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
