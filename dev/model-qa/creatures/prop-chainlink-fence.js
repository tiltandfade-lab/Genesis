/* dev/model-qa/creatures/prop-chainlink-fence.js — CHAIN-LINK / TURF-LINE FENCE (whole-object prop).
   Not a creature — no disc-figure, no eyes, no grip. One function, one geometry frame, no anchors.
   Footprint 1x1 (five-ft cell ~1.25u); this is a single fence SEGMENT meant to tile along a run.
   The read (all at once): a sagging chain-link boundary panel, Chrome's turf-grammar edge marker.
   Feature checklist the tri-budget buys, bottom -> top:
     - TWO PIPE POSTS (round tube uprights) planted at the panel edges — the fence's structural read
     - a BOTTOM RAIL pipe running taut between the posts near the ground
     - a TOP RAIL pipe that visibly SAGS between the posts (mid dips below the post tops) — the
       "sagging" tell from the brief
     - a SPARSE COARSE DIAGONAL LATTICE (X-crossed pipe members, each >=0.04u thick) strung between
       the rails — suggests chain-link without modeling literal fine mesh (which dissolves at
       sub-0.04u), each diamond gap left open so the fence still reads as permeable screening
     - a PAINTED-CLAIM CLOTH STRIP tied through the lattice, sagging/draped — one saturated-but-dusty
       gang-color accent (the HIGH-VALUE zone + the turf-grammar signature), pale enough at its lit
       face to carry real contrast against the grey pipe/lattice
   Use-tell: this is mid-USE as a claimed boundary — the cloth is knotted through the mesh and hangs
   loose at one corner (a flag, not a banner), and the top rail sags from years of climbers/weather,
   both readable from a 3/4 high camera without being hidden behind the panel plane.
   VS-desaturated palette: a few close grey-pipe tones + one pale weathered highlight + one dusty
   saturated accent (cloth). Scale reference: figures ~1.5u tall; fence stands ~1.5u, panel ~1.2u
   wide; one 5-ft cell ~1.25u (this segment tiles to that cell). */
import { THREE, V, quad, tube, ring, stitch } from '../probe-lib.js';

export function buildPropChainlinkFence(){
  /* ---------- PALETTE (VS desaturated galvanized-pipe grey + dusty gang-color accent) ---------- */
  const P = {
    pipe:0x76766e, pipeDk:0x504f49, pipeLt:0x9a998e,      // posts + rails, mid/shadow/lit
    latt:0x6d6c64, lattDk:0x4a4944,                         // lattice members (slightly duller)
    rust:0x8a6a4a,                                          // a rust streak highlight, pale-warm
    cloth:0x9a3d3a, clothDk:0x5c211f, clothLt:0xb3665f,     // dusty gang-red claim cloth (accent)
    disc:0x3a352b, discTop:0x46402f,
  };

  const GROUND = 0.055;
  const POST_H = 1.5;                 // post top height (~5ft posts, fence panel ~1.5u incl. post)
  const XL = -0.55, XR = 0.55;        // post x-positions (panel ~1.2u wide incl. post radius)
  const RAIL_BOT = GROUND + 0.10;     // bottom rail height
  const RAIL_TOP_POST = POST_H - 0.05;// top rail height AT the posts
  const SAG_MID = RAIL_TOP_POST - 0.14; // top rail sags down at midspan — the "sagging" tell

  /* ===== 1) TWO PIPE POSTS ===== */
  tube(V(XL,GROUND,0), V(XL,POST_H,0), 0.028,0.028, 8, P.pipe, {capB:{hex:P.pipeLt}});
  tube(V(XR,GROUND,0), V(XR,POST_H,0), 0.028,0.028, 8, P.pipe, {capB:{hex:P.pipeLt}});

  /* ===== 2) BOTTOM RAIL — taut, straight ===== */
  tube(V(XL,RAIL_BOT,0), V(XR,RAIL_BOT,0), 0.022,0.022, 6, P.pipeDk);

  /* ===== 3) TOP RAIL — two segments dipping to a sagged midpoint (visible sag) ===== */
  const MIDX = (XL+XR)/2;
  tube(V(XL,RAIL_TOP_POST,0), V(MIDX,SAG_MID,0.01), 0.024,0.022, 6, P.pipeLt);
  tube(V(MIDX,SAG_MID,0.01), V(XR,RAIL_TOP_POST,0), 0.022,0.024, 6, P.pipeLt);
  // a pale rust streak highlight along the sagged low point (weathering, catches light)
  quad(V(MIDX-0.08,SAG_MID+0.015,0.012), V(MIDX+0.08,SAG_MID+0.015,0.012), V(MIDX+0.06,SAG_MID-0.01,0.012), V(MIDX-0.06,SAG_MID-0.01,0.012), P.rust, 0.05);

  /* ===== 4) SPARSE COARSE DIAGONAL LATTICE — X-crossed pipe members between the rails, each
     >=0.04u dia (0.02 radius), a handful of diamonds, NOT a literal fine mesh. Follows the rail
     sag by interpolating the top-rail height across x. ===== */
  function topRailY(x){
    const t = (x-XL)/(XR-XL);
    // simple 2-segment lerp matching the two tube segments above
    return t<0.5 ? RAIL_TOP_POST + (SAG_MID-RAIL_TOP_POST)*(t/0.5)
                 : SAG_MID + (RAIL_TOP_POST-SAG_MID)*((t-0.5)/0.5);
  }
  const N_DIAMONDS = 4;
  const seg = (XR-XL)/N_DIAMONDS;
  for(let i=0;i<N_DIAMONDS;i++){
    const x0 = XL + i*seg, x1 = XL + (i+1)*seg;
    const yTop0 = topRailY(x0), yTop1 = topRailY(x1);
    // "/" diagonal: bottom-left to top-right
    tube(V(x0,RAIL_BOT,0), V(x1,yTop1,0.005), 0.022,0.022, 4, P.latt);
    // "\" diagonal: top-left to bottom-right
    tube(V(x0,yTop0,0), V(x1,RAIL_BOT,0.005), 0.022,0.022, 4, P.lattDk);
  }

  /* ===== 5) PAINTED-CLAIM CLOTH STRIP — tied through the lattice near the left post, sagging,
     one corner hanging loose (use-tell: this is a CLAIMED edge, knotted in by hand). Pale-lit
     face carries the value read; dusty-dark face is the shadow side. ===== */
  {
    const cx = XL + 0.22, topY = topRailY(cx);
    const y0 = topY - 0.05, y1 = RAIL_BOT + 0.18;
    const zF = 0.03, zB = -0.02;
    // main draped panel, slightly bowed (front face lit/pale-accent, back face dusty-dark)
    quad(V(cx-0.13,y0,zF), V(cx+0.11,y0-0.02,zF), V(cx+0.07,y1,zF), V(cx-0.15,y1+0.03,zF), P.clothLt, 0.05);
    quad(V(cx-0.15,y1+0.03,zB), V(cx+0.07,y1,zB), V(cx+0.11,y0-0.02,zB), V(cx-0.13,y0,zB), P.clothDk, 0.05);
    // a knot nub where it's tied through the lattice at the top
    tube(V(cx-0.02,topY-0.02,-0.01), V(cx+0.03,topY+0.01,0.02), 0.018,0.014, 4, P.cloth, {capB:{hex:P.cloth}});
    // one loose lower corner peeling away from the panel plane (the hand-tied use-tell)
    quad(V(cx+0.07,y1,zF+0.01), V(cx+0.14,y1-0.09,zF+0.05), V(cx+0.10,y1-0.16,zF+0.05), V(cx+0.03,y1-0.07,zF+0.01), P.cloth, 0.06);
  }

  /* base disc — shared style (r=0.42), matches the exemplar footprint marker. */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.62, 0.62, 16);
    const r2 = ring(V(0,GROUND,0), V(0,1,0), 0.60, 0.60, 16);
    stitch([r1,r2], ()=>P.disc);
  }
}
