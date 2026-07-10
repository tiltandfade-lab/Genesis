/* dev/model-qa/creatures/prop-stall-frame.js — MARKET STALL FRAME: a whole-object prop.
   Not a creature — no disc-figure, no eyes, no grip. One function, one geometry frame, no anchors.
   The read (all at once): lean-to market stall, mid-trading-day. Tells, bottom→top:
     - 4 dark TIMBER POSTS — tall pair at back, short pair at front — the lean-to skeleton
     - a RIDGE BEAM across the back posts + a LOW RAIL across the front posts (the frame read)
     - a sagging PALE CANOPY (sun-bleached cloth) slung from ridge to front rail, overhanging the
       counter for shade — the high-value zone, dark timber below it for contrast
     - a narrow COUNTER LIP plank at the front, waist-high
     - 3 GOODS LUMPS sitting on the lip (round produce/sack shapes, varied dull colors) — the
       use-tell: someone is selling out of this stall right now
   VS-desaturated palette (weathered dark timber + one pale sun-bleached cloth + dull goods accents).
   Scale reference: figures ~1.5u; footprint = one 5-ft cell (~1.25u); counter top sits ~0.5u
   (waist height); ridge/canopy peak ~1.8u (ducks under nothing — outdoor stall). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildPropStallFrame(){
  /* ---------- PALETTE (VS desaturated, neutral-warm register) ---------- */
  const P = {
    postDk:0x3c322a, postDkr:0x2a221c, postLt:0x4f4236,        // dark weathered timber posts/beams
    canopy:0xcfc3a4, canopyDk:0xb2a483, canopyShade:0x8f8368,  // pale sun-bleached cloth (top/under/shade)
    counter:0x5a4a3a, counterDk:0x40342a, counterLt:0x6e5b48,  // counter lip plank
    goodsA:0x8a5a3a, goodsADk:0x6a4128,                        // sack / root veg
    goodsB:0x9a7a2e, goodsBDk:0x74581f,                        // gourd / squash
    goodsC:0x6f7a4a, goodsCDk:0x515c34,                        // greens bundle
    disc:0x3a352b, discTop:0x46402f,
  };

  /* helper: axis-aligned timber box, 3-tone shaded like the altar exemplar's box(). */
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

  const GND = 0.055;
  const POST_W = 0.05;
  /* ===== 1) FOUR POSTS — tall pair at back (z=-0.48), short pair at front (z=0.42). Lean-to
     skeleton: back is tall so the canopy sheds forward/down over the counter. ===== */
  const BACK_TOP = 1.80, FRONT_TOP = 1.15;
  const bx = 0.48, fz = 0.42, bz = -0.48;
  box(-bx-POST_W,-bx+POST_W, GND,BACK_TOP, bz-POST_W,bz+POST_W, P.postLt, P.postDk, P.postDkr);   // back-left post
  box( bx-POST_W, bx+POST_W, GND,BACK_TOP, bz-POST_W,bz+POST_W, P.postLt, P.postDk, P.postDkr);   // back-right post
  box(-bx-POST_W,-bx+POST_W, GND,FRONT_TOP, fz-POST_W,fz+POST_W, P.postLt, P.postDk, P.postDkr);  // front-left post
  box( bx-POST_W, bx+POST_W, GND,FRONT_TOP, fz-POST_W,fz+POST_W, P.postLt, P.postDk, P.postDkr);  // front-right post

  /* ===== 2) RIDGE BEAM (back, at BACK_TOP) + LOW RAIL (front, at FRONT_TOP) — the frame read
     that names "stall skeleton" even with the canopy stripped away. ===== */
  box(-bx-0.02, bx+0.02, BACK_TOP-0.045,BACK_TOP, bz-0.05,bz+0.05, P.postLt, P.postDk, P.postDkr);   // ridge beam
  box(-bx-0.02, bx+0.02, FRONT_TOP-0.04,FRONT_TOP, fz-0.05,fz+0.05, P.postLt, P.postDk, P.postDkr);  // front rail

  /* ===== 3) CANOPY — sagging pale cloth slung from the ridge down-forward to the front rail,
     overhanging the counter. Built as 3 draped strips (bowed downward at the belly) so it reads
     as slack cloth, not a rigid plane — the sag IS the signature feature + the high-value zone. ===== */
  {
    const xs = [-bx-0.03, -0.16, 0.16, bx+0.03];   // 3 cloth strips across the width
    const sagY = 0.10;                              // how far the belly droops below the straight-line chord
    const overhang = fz + 0.12;                      // canopy nose pokes past the front rail (shade lip)
    for (let i=0;i<3;i++){
      const xa=xs[i], xb=xs[i+1];
      // back edge (at ridge) -> mid sag point -> front edge (past the rail, drooped)
      const backY = BACK_TOP-0.01, midY = (BACK_TOP+FRONT_TOP)/2 - sagY, frontY = FRONT_TOP-0.02;
      const backZ = bz, midZ = (bz+overhang)/2, frontZ = overhang;
      // top face (2 quads forming the sagging strip, lit pale)
      quad(V(xa,backY,backZ), V(xb,backY,backZ), V(xb,midY,midZ), V(xa,midY,midZ), P.canopy, 0.05);
      quad(V(xa,midY,midZ), V(xb,midY,midZ), V(xb,frontY,frontZ), V(xa,frontY,frontZ), P.canopyDk, 0.05);
      // underside (shaded, faces down — closes the sheet so it doesn't vanish from below)
      quad(V(xa,midY,midZ), V(xb,midY,midZ), V(xb,backY,backZ), V(xa,backY,backZ), P.canopyShade, 0.05);
      quad(V(xa,frontY,frontZ), V(xb,frontY,frontZ), V(xb,midY,midZ), V(xa,midY,midZ), P.canopyShade, 0.05);
    }
    // a pale strip-seam along the canopy top (cloth panel line, weathering detail; kept >=0.04u wide)
    quad(V(-0.20,BACK_TOP-0.015,bz+0.02), V(-0.15,BACK_TOP-0.015,bz+0.02), V(-0.18,(BACK_TOP+FRONT_TOP)/2-sagY+0.01,(bz+overhang)/2), V(-0.18,(BACK_TOP+FRONT_TOP)/2-sagY+0.01,(bz+overhang)/2), P.canopyDk, 0.03);
  }

  /* ===== 4) COUNTER LIP — a narrow waist-high plank at the front posts, the transactional
     surface the goods sit on. ===== */
  const CTOP = 0.52, CBOT = 0.40;
  box(-bx-0.05, bx+0.05, CBOT,CTOP, fz-0.03,fz+0.10, P.counterLt, P.counter, P.counterDk);
  // a pale worn strip along the counter's front top edge (handling wear — value contrast note)
  quad(V(-bx-0.05,CTOP,fz+0.10), V(bx+0.05,CTOP,fz+0.10), V(bx+0.05,CTOP,fz+0.07), V(-bx-0.05,CTOP,fz+0.07), P.counterLt, 0.03);

  /* ===== 5) GOODS LUMPS — 3 small round shapes on the lip: sack, gourd, greens-bundle. The
     use-tell (Law 5): this stall is mid-selling, not an empty frame. ===== */
  blob(-0.28, CTOP+0.05, fz+0.02, 0.09,0.07,0.08, P.goodsA, 8, 4);   // sack/root-veg lump, left
  blob( 0.00, CTOP+0.045, fz+0.03, 0.075,0.065,0.07, P.goodsB, 8, 4); // gourd, center
  blob( 0.27, CTOP+0.04, fz+0.01, 0.085,0.05,0.075, P.goodsC, 8, 4);  // greens bundle, right
  // dark grounding shadow-notch under each lump so they read as sitting ON the lip, not floating
  quad(V(-0.36,CTOP+0.001,fz-0.02), V(-0.20,CTOP+0.001,fz-0.02), V(-0.20,CTOP+0.001,fz+0.09), V(-0.36,CTOP+0.001,fz+0.09), P.goodsADk, 0.04);

  /* base disc — shared style (r sized to the 1x1 footprint, ~0.42 like the altar exemplar). */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
