/* dev/model-qa/creatures/prop-stock-rack.js — the STOCK-RACK: an open-frame wood/metal shelf
   unit (whole-object prop). Not a creature — no disc-figure, no eyes, no grip. One function,
   one geometry frame, no anchors.
   FEATURE CHECKLIST (what the tri budget buys):
     - 4 slim vertical POSTS, floor to just-over-head (open frame — nothing between posts but air)
     - 3 horizontal SHELF BOARDS (bottom/mid/top) spanning the posts — the see-through gaps ARE
       the read: no back panel, no side panels
     - bottom shelf: 2 slouched BURLAP SACKS + 1 low CRATE — heavy stacked-goods clutter
     - mid shelf: 3 stacked WOOD CRATES, slightly uneven (a lived-in stockroom, not a display)
     - top shelf: a row of 4 pale CERAMIC JARS — the SIGNATURE feature + the high-value pale zone
       (lit tops read ~0x9c-0xac, clearly brighter than the wood/burlap band around them)
   USE SENTENCE: a stockroom shelf mid-stocked — sacks slumped on the floor shelf, crates stacked
   crooked in the middle, a tidy row of pale jars up top where the last hand left them.
   VS-desaturated wood/burlap palette (a few close warm-brown tones + the pale jar row + a dark
   iron-strap accent on the frame joints).
   Scale reference: figures ~1.5u tall; footprint 1×1 five-ft cell (≈1.25u) — the rack itself sits
   well inside it (~0.85u wide × 0.38u deep) so it doesn't crowd the cell edges. Overall height
   ~1.55u (waist-to-head-and-a-bit, per brief). Imported by prop-stock-rack-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropStockRack(){
  /* ---------- PALETTE (VS desaturated wood/stockroom) ---------- */
  const P = {
    postLt:0x8a7256, post:0x6e5940, postDk:0x4e4030,        // frame posts (weathered wood)
    shelfLt:0x8f7658, shelf:0x715c42, shelfDk:0x4f4130,      // shelf boards
    strap:0x2c2822, strapLt:0x46403a,                        // iron corner straps (dark accent)
    sackLt:0x9c8b62, sack:0x7d6d49, sackDk:0x5a4e35,         // burlap sacks
    crateLt:0x9a7f57, crate:0x7a6340, crateDk:0x584730,      // wood crates
    jar:0x9caa9c, jarLt:0xa8b8a6, jarPale:0xacb8ac, jarDk:0x6f7a70, // pale ceramic jars — VALUE ZONE
    disc:0x3a352b, discTop:0x46402f,
  };

  /* box helper (from the exemplar): axis-aligned block, 3-tone shaded, closed. */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05);
    quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05);
    quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);
    quad(Cc,G,H,D, top, 0.05);
  }

  const Y0 = 0.055;          // ground clearance
  const POST_H = 1.55;       // waist-to-head-and-a-bit overall height
  const HALF_W = 0.42, HALF_D = 0.17;   // rack footprint half-extents (inside the 1×1 cell)
  const PT = 0.028;          // post half-thickness

  /* ===== 1) FOUR POSTS — floor to top, open on all sides (nothing but air between them). ===== */
  const postXZ = [[-HALF_W,-HALF_D],[HALF_W,-HALF_D],[-HALF_W,HALF_D],[HALF_W,HALF_D]];
  postXZ.forEach(([px,pz])=>{
    box(px-PT,px+PT, Y0,POST_H, pz-PT,pz+PT, P.postLt, P.post, P.postDk);
  });
  // dark iron strap accent at the base of each post (grounding tell)
  postXZ.forEach(([px,pz])=>{
    box(px-PT-0.006,px+PT+0.006, Y0,Y0+0.05, pz-PT-0.006,pz+PT+0.006, P.strapLt, P.strap, P.strap);
  });

  /* ===== 2) THREE SHELF BOARDS spanning the posts. Thin — the gaps between them are the point. ===== */
  const SHELF_T = 0.03;
  const shelfYs = [0.52, 0.98, 1.44];   // bottom / mid / top shelf TOP surface
  shelfYs.forEach(sy=>{
    box(-HALF_W-0.02,HALF_W+0.02, sy-SHELF_T,sy, -HALF_D-0.02,HALF_D+0.02, P.shelfLt, P.shelf, P.shelfDk);
  });

  /* ===== 3) BOTTOM SHELF — 2 slouched burlap sacks + 1 low crate. ===== */
  {
    const sy = shelfYs[0] + 0.002;
    // sack A (bulgy tapered stack, slouched — wider mid than top/bottom)
    stack([
      {y:sy,        rx:0.11, rz:0.085, cx:-0.24, cz:0.0,  hex:P.sackDk},
      {y:sy+0.09,   rx:0.135,rz:0.10,  cx:-0.24, cz:0.0,  hex:P.sack},
      {y:sy+0.18,   rx:0.10, rz:0.08,  cx:-0.235,cz:0.005,hex:P.sackLt},
      {y:sy+0.24,   rx:0.05, rz:0.045, cx:-0.23, cz:0.01, hex:P.sackDk},   // gathered neck
    ], 8, {capTop:{hex:P.sackDk, lift:0.004}});
    // sack B (shorter, slouched against sack A)
    stack([
      {y:sy,        rx:0.095,rz:0.08, cx:-0.02, cz:0.02, hex:P.sackDk},
      {y:sy+0.075,  rx:0.115,rz:0.095,cx:-0.03, cz:0.02, hex:P.sack},
      {y:sy+0.15,   rx:0.075,rz:0.065,cx:-0.03, cz:0.02, hex:P.sackLt},
      {y:sy+0.19,   rx:0.04, rz:0.035,cx:-0.03, cz:0.02, hex:P.sackDk},
    ], 8, {capTop:{hex:P.sackDk, lift:0.004}});
    // low crate beside the sacks
    box(0.14,0.32, sy,sy+0.16, -0.10,0.10, P.crateLt, P.crate, P.crateDk);
  }

  /* ===== 4) MID SHELF — 3 stacked wood crates, slightly uneven (lived-in). ===== */
  {
    const sy = shelfYs[1] + 0.002;
    box(-0.34,-0.10, sy,sy+0.19, -0.11,0.11, P.crateLt, P.crate, P.crateDk);
    box(-0.06,0.16,  sy,sy+0.17, -0.10,0.10, P.crateLt, P.crate, P.crateDk);
    box( 0.16,0.16+0.14, sy+0.17,sy+0.17+0.15, -0.075,0.075, P.crateLt, P.crate, P.crateDk); // stacked crate, offset up
  }

  /* ===== 5) TOP SHELF — row of 4 pale ceramic jars. THE SIGNATURE FEATURE + high-value zone. ===== */
  {
    const sy = shelfYs[2] + 0.002;
    const jarXs = [-0.30, -0.12, 0.08, 0.28];
    jarXs.forEach((jx,i)=>{
      const jz = (i % 2 === 0) ? -0.01 : 0.015;   // tiny stagger so the row isn't a laser line
      stack([
        {y:sy,       rx:0.052, rz:0.05,  cx:jx, cz:jz, hex:P.jarDk},
        {y:sy+0.03,  rx:0.062, rz:0.06,  cx:jx, cz:jz, hex:P.jar},
        {y:sy+0.10,  rx:0.058, rz:0.056, cx:jx, cz:jz, hex:P.jarLt},   // shoulder — lit, pale
        {y:sy+0.145, rx:0.034, rz:0.032, cx:jx, cz:jz, hex:P.jarPale}, // neck — palest, top-lit
      ], 8, {capTop:{hex:P.jarPale, lift:0.006}});
    });
  }

  /* base disc — shared style (r=0.42), stone-neutral tones so it sits under any realm floor. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
