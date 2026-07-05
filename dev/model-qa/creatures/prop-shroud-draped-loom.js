/* dev/model-qa/creatures/prop-shroud-draped-loom.js — SHROUD-DRAPED LOOM (GLOOM set piece, Large).
   The read: an old wooden WEAVING LOOM — an upright timber frame with a horizontal beam holding
   warp threads strung taut down to a lower beam — draped heavily in pale funerary SHROUD cloth
   sagging off the frame in stained, uneven folds, some threads still strung and visible through
   gaps in the drape, a scatter of loose thread-ends dangling. Occult/horror register: the cloth
   reads like grave-linen, not laundry — dingy, stained, torn at the hem. VS-desaturated dark wood
   + pale dirty shroud fabric. One function, one geometry frame, no anchors. Large disc r=0.55.
   Imported by prop-shroud-draped-loom-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropShroudDrapedLoom(){
  /* ---------- PALETTE (VS desaturated dark timber + dingy grave-linen) ---------- */
  const P = {
    wood:0x362a1e, woodDk:0x241a12, woodLt:0x4a3a28,        // loom frame timber
    thread:0xa89878, threadDk:0x7a6c52,                      // warp threads
    shroud:0xb8ada0, shroudDk:0x8a7d70, shroudStain:0x5c5044, // pale stained cloth
    shroudDeep:0x3e362e,                                      // deep shadow fold
    disc:0x2c2822, discTop:0x362f27,
  };

  const halfW = 0.42;
  const postH = 1.35;
  const topBeamY = postH;
  const botBeamY = 0.30;

  /* ---------- FRAME — two uprights + top/bottom beams ---------- */
  for(const sx of [-1,1]){
    tube(V(sx*halfW,0.03,0), V(sx*halfW,postH,0), 0.045, 0.038, 6, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
  }
  tube(V(-halfW,topBeamY,0), V(halfW,topBeamY,0), 0.040, 0.040, 6, P.woodLt, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
  tube(V(-halfW,botBeamY,0), V(halfW,botBeamY,0), 0.036, 0.036, 6, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
  // a rear brace beam for depth-read
  tube(V(-halfW,postH*0.55,-0.12), V(halfW,postH*0.55,-0.12), 0.03, 0.03, 6, P.woodDk);
  for(const sx of [-1,1]) tube(V(sx*halfW,postH*0.55,-0.12), V(sx*halfW,postH*0.6,0.0), 0.025,0.02,5, P.woodDk);

  /* ---------- WARP THREADS — taut vertical lines between beams, visible where the shroud gaps ---------- */
  const threadXs = [];
  for(let x=-halfW+0.06; x<=halfW-0.06; x+=0.075) threadXs.push(x);
  for(const tx of threadXs){
    tube(V(tx,topBeamY-0.02,0.01), V(tx,botBeamY+0.02,0.01), 0.006, 0.006, 4, (Math.abs(tx)%0.15<0.04)? P.threadDk : P.thread);
  }

  /* ---------- SHROUD DRAPE — heavy pale cloth sagging over the top beam and down the front,
     built as overlapping sagging panels (catenary-quad technique) so folds read, with a torn
     ragged hem and a couple of loose dangling thread-ends. ---------- */
  {
    // main drape over the top beam, hanging down the front in 4 uneven vertical folds
    const foldXs = [-halfW+0.02, -halfW*0.42, halfW*0.18, halfW-0.05];
    const hemYs  = [0.55, 0.42, 0.62, 0.48];   // uneven ragged hem heights
    for(let i=0;i<foldXs.length-0;i++){
      const xL = foldXs[i], xR = (i<foldXs.length-1)? foldXs[i+1] : halfW+0.03;
      const hemL = hemYs[i], hemR = hemYs[(i+1)%hemYs.length];
      const topY = topBeamY+0.05;
      const bulge = 0.06 + (i%2)*0.03;         // fold sags forward at the middle
      const midX = (xL+xR)/2;
      // front face of the fold: two quads meeting at a forward-bulging vertical seam
      quad(V(xL,topY,0.03), V(midX,topY,0.03+bulge), V(midX,hemL,0.03+bulge*0.6), V(xL,hemL,0.03), (i%2)?P.shroud:P.shroudDk, 0.06);
      quad(V(midX,topY,0.03+bulge), V(xR,topY,0.03), V(xR,hemR,0.03), V(midX,hemR,0.03+bulge*0.6), (i%2)?P.shroudDk:P.shroud, 0.06);
      // stain smudge low on the fold
      if(i%2===0){
        const sy = hemL+0.10;
        quad(V(xL+0.03,sy,0.032), V(xL+0.09,sy,0.032), V(xL+0.07,sy+0.10,0.032), V(xL+0.02,sy+0.09,0.032), P.shroudStain, 0.05);
      }
      // ragged torn hem — a few small dark triangular notches
      quad(V(xL+0.02,hemL,0.031), V(xL+0.05,hemL-0.035,0.031), V(xL+0.07,hemL,0.031), V(xL+0.035,hemL+0.01,0.031), P.shroudDeep, 0.05);
    }
    // back-drape hint over the rear brace (dark, mostly-shadowed) so the loom reads wrapped, not just fronted
    quad(V(-halfW,topBeamY+0.02,-0.03), V(halfW,topBeamY+0.02,-0.03), V(halfW*0.7,postH*0.62,-0.10), V(-halfW*0.7,postH*0.62,-0.10), P.shroudDeep, 0.06);
  }

  /* ---------- loose dangling thread-ends ---------- */
  for(const [dx,dl] of [[-halfW*0.3,0.14],[0.05,0.09],[halfW*0.55,0.18]]){
    const top = V(dx, botBeamY+0.05, 0.04);
    const bot = V(dx+0.01, botBeamY+0.05-dl, 0.045);
    tube(top, bot, 0.005, 0.003, 3, P.threadDk);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
