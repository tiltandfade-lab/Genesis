/* dev/model-qa/creatures/prop-whispering-curtain-row.js — WHISPERING CURTAIN ROW (GLOOM set piece, Large).
   The read: a row of THREE heavy dark curtain panels hung from a plain top rail, each panel sagging
   in vertical folds to the floor, the middle panel pulled slightly aside from the other two so a
   dark GAP shows between it and its neighbor (an "ajar" tell — something unseen could be listening
   /whispering through the gap), a scatter of small dark motes/tatters along the hems (a fraying,
   not-quite-clean tell). Occult/horror register: oppressive, heavy fabric, not decorative drapery.
   VS-desaturated near-black/charcoal cloth with a faint dry-blood-brown undertone. One function,
   one geometry frame, no anchors. Large disc r=0.68. RESIZED 2026-07-08 (prop-scale-contract): the
   row widened to ~2.0u (staged ~8 ft) + rail raised to 1.70u (~7 ft) — the old 1.1u row staged at
   4.6 ft, a single drape, not a row. Imported by prop-whispering-curtain-row-probe.html.
   REPAIR 2026-07-05 (judge: cell renders essentially blank, no visible curtain geometry, only the
   tile diamond shows): root cause was a near-black-on-near-black contrast collapse — cloth/clothDk/
   clothLt (0x282320/0x18140f/0x352e28) sat within a hair of each other AND of the dark scene
   background (0x171310), so the fold seams (the only shading cue) never separated visually; the
   panels were also paper-thin in depth (bulge 0.03-0.05u) giving flat-lit faces almost no normal
   variation to catch the key light. Fix mirrors prop-shroud-draped-loom.js (a working hanging-cloth
   read): push the cloth palette to a proper mid-value charcoal (still desaturated, still dark, but
   far off the background black) with real light/dark separation between fold faces, and roughly
   double the forward bulge so folds cast an actual visible normal-shift under the key light. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropWhisperingCurtainRow(){
  /* ---------- PALETTE (mid-value charcoal cloth — desaturated but clearly lifted off black) ---------- */
  const P = {
    rail:0x4a4238, railDk:0x2e2820,                          // top rail
    cloth:0x5c5248, clothDk:0x362f28, clothLt:0x7a6f60,      // heavy dark curtain — real value spread
    undertone:0x6a3f2e,                                       // dry-blood-brown undertone fold, lifted
    tatter:0x201c17,
    disc:0x241f1a, discTop:0x2e2822,
  };

  const railY = 1.70;
  const halfW = 0.95;

  /* ---------- TOP RAIL — a plain bar the panels hang from ---------- */
  tube(V(-halfW-0.05,railY,0), V(halfW+0.05,railY,0), 0.032, 0.032, 6, P.rail, {capA:{hex:P.railDk}, capB:{hex:P.railDk}});
  // small mounting brackets
  for(const sx of [-1,1]) tube(V(sx*(halfW+0.02),railY,0), V(sx*(halfW+0.02),railY+0.06,-0.02), 0.022,0.018,4,P.railDk);

  /* ---------- CURTAIN PANEL helper — a vertical strip from the rail to a floor hem, built as
     3 overlapping folds (each a pair of quads meeting at a forward-bulging seam, bulge roughly
     doubled from the original so the fold's normal-shift actually catches the key light), with
     the panel able to hang straight or be pulled ASIDE (shifted) via `pullX`. ---------- */
  function panel(xL, xR, pullX, hex, hemY){
    const foldN = 3;
    const dx = (xR-xL)/foldN;
    for(let i=0;i<foldN;i++){
      const fx0 = xL+i*dx, fx1 = xL+(i+1)*dx;
      const px0 = fx0+pullX, px1 = fx1+pullX;
      const bulge = 0.07 + (i%2)*0.045;
      const midX = (px0+px1)/2;
      const midZ = 0.03+bulge;
      const topZ = 0.03;
      const c1 = (i%2)? hex.dk : hex.lt;
      const c2 = (i%2)? hex.lt : hex.dk;
      quad(V(px0,railY-0.02,topZ), V(midX,railY-0.02,midZ), V(midX,hemY,midZ*0.7), V(px0,hemY,topZ), c1, 0.08);
      quad(V(midX,railY-0.02,midZ), V(px1,railY-0.02,topZ), V(px1,hemY,topZ), V(midX,hemY,midZ*0.7), c2, 0.08);
    }
    // undertone smudge low on the panel (dry stain read)
    const sx = xL+pullX+dx*0.5, sy = hemY+0.14;
    quad(V(sx-0.035,sy,0.031), V(sx+0.045,sy,0.031), V(sx+0.025,sy+0.16,0.031), V(sx-0.025,sy+0.15,0.031), P.undertone, 0.07);
    // ragged hem tatters
    for(const tx of [xL+pullX+0.02, xR+pullX-0.03]){
      quad(V(tx,hemY,0.032), V(tx+0.025,hemY-0.04,0.032), V(tx+0.045,hemY,0.032), V(tx+0.015,hemY+0.012,0.032), P.tatter, 0.06);
    }
  }

  const CLOTH = {lt:P.clothLt, dk:P.clothDk};

  /* three panels: left, middle (pulled aside +x a touch, revealing a gap), right — uneven hems */
  panel(-halfW,          -halfW+0.55, 0.0,   CLOTH, 0.03);
  panel(-halfW+0.67,      halfW*0.05, 0.20,  CLOTH, 0.00);   // middle, pulled aside → gap opens on its left
  panel(halfW*0.14,       halfW,      0.0,   CLOTH, 0.045);

  /* ---------- THE GAP — a dark sliver of near-black void behind the pulled-aside middle panel,
     the "something listening" read (a flat dark plane set back, contrasted against the lit cloth
     edges framing it so the gap itself reads as a gap, not just more background). ---------- */
  {
    const gx0=-halfW+0.51, gx1=-halfW+0.67+0.20-0.02;
    quad(V(gx0,railY-0.02,-0.03), V(gx1,railY-0.02,-0.03), V(gx1,0.02,-0.03), V(gx0,0.02,-0.03), 0x0a0806, 0.03);
  }

  /* ---------- base disc (r=0.68, matches registry discR — the row overhangs it like a big mini) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.66, 0.66, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
