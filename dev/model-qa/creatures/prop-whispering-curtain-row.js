/* dev/model-qa/creatures/prop-whispering-curtain-row.js — WHISPERING CURTAIN ROW (GLOOM set piece, Large).
   The read: a row of THREE heavy dark curtain panels hung from a plain top rail, each panel sagging
   in vertical folds to the floor, the middle panel pulled slightly aside from the other two so a
   dark GAP shows between it and its neighbor (an "ajar" tell — something unseen could be listening
   /whispering through the gap), a scatter of small dark motes/tatters along the hems (a fraying,
   not-quite-clean tell). Occult/horror register: oppressive, heavy fabric, not decorative drapery.
   VS-desaturated near-black/charcoal cloth with a faint dry-blood-brown undertone. One function,
   one geometry frame, no anchors. Large disc r=0.55. Imported by prop-whispering-curtain-row-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropWhisperingCurtainRow(){
  /* ---------- PALETTE ---------- */
  const P = {
    rail:0x2b2622, railDk:0x1a1714,                          // top rail
    cloth:0x282320, clothDk:0x18140f, clothLt:0x352e28,      // heavy dark curtain
    undertone:0x3a241c,                                       // faint dry-blood-brown undertone fold
    tatter:0x161310,
    disc:0x241f1a, discTop:0x2e2822,
  };

  const railY = 1.45;
  const halfW = 0.58;

  /* ---------- TOP RAIL — a plain dark bar the panels hang from ---------- */
  tube(V(-halfW-0.04,railY,0), V(halfW+0.04,railY,0), 0.028, 0.028, 6, P.rail, {capA:{hex:P.railDk}, capB:{hex:P.railDk}});
  // small mounting brackets
  for(const sx of [-1,1]) tube(V(sx*(halfW+0.02),railY,0), V(sx*(halfW+0.02),railY+0.05,-0.02), 0.02,0.016,4,P.railDk);

  /* ---------- CURTAIN PANEL helper — a vertical strip from the rail to a floor hem, built as
     3 overlapping folds (each a pair of quads meeting at a forward-bulging seam), with the panel
     able to hang straight or be pulled ASIDE (shifted + rotated slightly) via `pullX`. ---------- */
  function panel(xL, xR, pullX, hex, hemY){
    const foldN = 3;
    const dx = (xR-xL)/foldN;
    for(let i=0;i<foldN;i++){
      const fx0 = xL+i*dx, fx1 = xL+(i+1)*dx;
      const px0 = fx0+pullX, px1 = fx1+pullX;
      const bulge = 0.03 + (i%2)*0.02;
      const midX = (px0+px1)/2;
      const midZ = 0.02+bulge;
      const topZ = 0.02;
      const c1 = (i%2)? hex.dk : hex.lt;
      const c2 = (i%2)? hex.lt : hex.dk;
      quad(V(px0,railY-0.02,topZ), V(midX,railY-0.02,midZ), V(midX,hemY,midZ*0.7), V(px0,hemY,topZ), c1, 0.06);
      quad(V(midX,railY-0.02,midZ), V(px1,railY-0.02,topZ), V(px1,hemY,topZ), V(midX,hemY,midZ*0.7), c2, 0.06);
    }
    // undertone smudge low on the panel (dry stain read)
    const sx = xL+pullX+dx*0.5, sy = hemY+0.12;
    quad(V(sx-0.03,sy,0.021), V(sx+0.04,sy,0.021), V(sx+0.02,sy+0.14,0.021), V(sx-0.02,sy+0.13,0.021), P.undertone, 0.06);
    // ragged hem tatters
    for(const tx of [xL+pullX+0.02, xR+pullX-0.03]){
      quad(V(tx,hemY,0.022), V(tx+0.02,hemY-0.03,0.022), V(tx+0.035,hemY,0.022), V(tx+0.012,hemY+0.01,0.022), P.tatter, 0.05);
    }
  }

  const CLOTH = {lt:P.clothLt, dk:P.clothDk};

  /* three panels: left, middle (pulled aside +x a touch, revealing a gap), right — uneven hems */
  panel(-halfW,          -halfW+0.34, 0.0,   CLOTH, 0.02);
  panel(-halfW+0.40,      halfW*0.06, 0.11,  CLOTH, 0.00);   // middle, pulled aside → gap opens on its left
  panel(halfW*0.16,       halfW,      0.0,   CLOTH, 0.035);

  /* ---------- THE GAP — a dark sliver of near-black void behind the pulled-aside middle panel,
     the "something listening" read (just a flat dark plane set back). ---------- */
  {
    const gx0=-halfW+0.30, gx1=-halfW+0.40+0.11-0.02;
    quad(V(gx0,railY-0.02,-0.02), V(gx1,railY-0.02,-0.02), V(gx1,0.02,-0.02), V(gx0,0.02,-0.02), 0x0a0806, 0.03);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
