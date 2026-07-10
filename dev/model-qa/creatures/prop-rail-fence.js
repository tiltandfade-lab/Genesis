/* dev/model-qa/creatures/prop-rail-fence.js — RAIL FENCE RUN: a low horizontal-rail fence
   segment (whole-object prop). Not a creature — no disc-figure, no eyes, no grip. One function,
   one geometry frame, no anchors. Tiles side-by-side to make a longer run.
   Feature checklist (what the ~260-tri budget buys):
     - THREE weathered posts (end, end, one mid) set into the ground, square-cut timber
     - TWO horizontal rails threaded through the posts (upper + lower), open gaps between —
       see-through enough to read the yard/paddock behind it
     - the UPPER rail SAGS at midspan and carries a dark CRACK where it's been leaned on —
       the use-tell: years of forearms resting on it have bowed and split the wood
     - pale SUN-BLEACHED rail-top facets (the high-value zone) running the length of both rails,
       contrasted against darker weathered post/rail-body tones
     - small dark KNOT flecks on the posts (age detail, cheap)
   Use sentence: this is the rail a hundred passersby have leaned their weight on for years —
   the top face has gone pale and smooth, and the upper rail has sagged and split at the middle
   from all that leaning.
   VS-desaturated weathered-wood palette (a few close greys/browns + one pale bleached top +
   one dark crack/knot accent). Scale reference: figures ~1.5u tall; the fence stands ~1.0u,
   waist-height on a figure so a person can lean an elbow on the top rail. Segment ~1.2u wide,
   sized to tile against a 1×1 (≈1.25u) five-ft cell. Imported by the theater prop registry. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropRailFence(){
  /* ---------- PALETTE (VS desaturated weathered wood) ---------- */
  const P = {
    wood:0x6b5b47, woodDk:0x4c3f31, woodDkr:0x362c22, woodLt:0x83715a,   // posts + rail bodies
    bleach:0x9a8c76,                                                     // pale sun-bleached top facets (high value)
    bleachHi:0xa89a80,                                                   // brightest bleached highlight (crown of the sag)
    crack:0x241c15,                                                      // dark leaned-on crack / split
    knot:0x2e241a,                                                       // small dark knot flecks
    disc:0x352c22, discTop:0x40352a,
  };

  /* helper: an axis-aligned rectangular wood box from (min) to (max) with 3-tone shading. */
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

  const GROUND = 0.055;
  const POST_H = 0.95;         // post top height
  const POST_W = 0.055;        // half-width of square post
  const RUN_HALF = 0.58;       // half the segment span (~1.16u wide)
  const postXs = [-RUN_HALF, 0, RUN_HALF];

  /* ===== 1) THREE POSTS — square-cut timber, set at both ends + mid-span. ===== */
  postXs.forEach((px,i)=>{
    box(px-POST_W,px+POST_W, GROUND,POST_H, -POST_W,POST_W, P.woodLt, P.wood, P.woodDkr);
    // pale bleached cap on the post top (small — the tops catch sun too)
    quad(V(px-POST_W,POST_H+0.001,-POST_W), V(px+POST_W,POST_H+0.001,-POST_W),
         V(px+POST_W,POST_H+0.001,POST_W),  V(px-POST_W,POST_H+0.001,POST_W), P.bleach, 0.03);
    // a small dark knot fleck on the front face
    const ky = GROUND + 0.25 + i*0.11;
    quad(V(px-0.018,ky+0.02,POST_W+0.001), V(px+0.014,ky+0.03,POST_W+0.001),
         V(px+0.010,ky-0.02,POST_W+0.001), V(px-0.016,ky-0.03,POST_W+0.001), P.knot, 0.02);
  });

  /* ===== 2) LOWER RAIL — straight, threaded through all three posts near the base. ===== */
  const LOW_Y0 = GROUND + 0.16, LOW_Y1 = LOW_Y0 + 0.09;
  box(-RUN_HALF-POST_W, RUN_HALF+POST_W, LOW_Y0, LOW_Y1, -0.045,0.045, P.woodLt, P.wood, P.woodDk);
  // pale bleached top facet along its length (high-value zone)
  quad(V(-RUN_HALF-POST_W,LOW_Y1+0.001,-0.045), V(RUN_HALF+POST_W,LOW_Y1+0.001,-0.045),
       V(RUN_HALF+POST_W,LOW_Y1+0.001,0.045),  V(-RUN_HALF-POST_W,LOW_Y1+0.001,0.045), P.bleach, 0.04);

  /* ===== 3) UPPER RAIL — sags at midspan (built as three straight segments dipping toward the
     middle post) and carries a dark crack there — the leaned-on use-tell. ===== */
  const UP_Y_END = GROUND + 0.62;     // rail height at the end posts
  const SAG = 0.055;                  // how far the middle dips down
  const UP_Y_MID = UP_Y_END - SAG;
  const RH = 0.10;                    // rail thickness (half to half not exact, just top-bottom span)
  // left half-span: end post -> mid post, sloping down to the sag
  box(-RUN_HALF-POST_W, 0, UP_Y_MID, UP_Y_END, -0.045,0.045, P.woodLt, P.wood, P.woodDk);
  // right half-span: mid post -> end post, sloping back up (built as one shallow box; the two
  // halves visually read as a single sagging beam since they share the mid-height)
  box(0, RUN_HALF+POST_W, UP_Y_MID, UP_Y_END, -0.045,0.045, P.woodLt, P.wood, P.woodDk);
  // pale bleached top running the full sagged length (high-value zone — brighter at the crown-ends,
  // slightly duller right at the sag where the crack lives)
  quad(V(-RUN_HALF-POST_W,UP_Y_END+0.001,-0.045), V(-0.06,UP_Y_MID+RH+0.001,-0.045),
       V(-0.06,UP_Y_MID+RH+0.001,0.045),  V(-RUN_HALF-POST_W,UP_Y_END+0.001,0.045), P.bleachHi, 0.045);
  quad(V(0.06,UP_Y_MID+RH+0.001,-0.045), V(RUN_HALF+POST_W,UP_Y_END+0.001,-0.045),
       V(RUN_HALF+POST_W,UP_Y_END+0.001,0.045),  V(0.06,UP_Y_MID+RH+0.001,0.045), P.bleachHi, 0.045);
  // the crack itself — a dark jagged split running along the sagged midspan top, dead center
  quad(V(-0.09,UP_Y_MID+RH+0.0015,0.02), V(0.05,UP_Y_MID+RH+0.0015,-0.015),
       V(0.03,UP_Y_MID+RH+0.0015,-0.03), V(-0.07,UP_Y_MID+RH+0.0015,0.005), P.crack, 0.03);
  // a thin dark underside shadow line at the sag (reads as the wood having bowed/stressed there)
  quad(V(-0.10,UP_Y_MID,-0.04), V(0.10,UP_Y_MID,-0.04), V(0.10,UP_Y_MID,0.04), V(-0.10,UP_Y_MID,0.04), P.woodDkr, 0.02);

  /* base disc — shared style, sized to the run's footprint. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.66, 0.66, 16);
    const r2=ring(V(0,GROUND,0), V(0,1,0), 0.64, 0.64, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,GROUND+0.003,0), P.discTop);
  }
}
