/* dev/model-qa/creatures/prop-pew-row.js — the PEW ROW: a worship-bench (whole-object prop).
   Not a creature — no disc-figure, no eyes, no grip. One function, one geometry frame, no anchors.
   Features:
     - a long plank SEAT (~1.15u wide) on four stub legs — the bench proper
     - a low BACK RAIL standing off the rear of the seat on two short posts
     - a PALE WORN SEAT-TOP patch mid-plank — the value zone (sat on for years, rubbed pale)
     - USE-TELL: a small forgotten kneeler-cushion bundle sitting on the seat, front-right,
       visible from the +x/+z high 3/4 camera
   VS-desaturated aged-wood palette (warm mid wood, dark wood, pale worn highlight, dull cushion cloth).
   Scale: figures ~1.5u; footprint 1x1 five-ft cell (~1.25u), seat sits ~0.28u (bench height).
   Imported by the orchestrator's sheet under render key prop:pew-row. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropPewRow(){
  /* ---------- PALETTE (VS desaturated aged wood) ---------- */
  const P = {
    wood:0x7a5c3e, woodDk:0x5a4128, woodDkr:0x3f2e1c, woodLt:0x8f6e4a,   // seat + rail + legs
    worn:0xb8a082,                                                        // pale rubbed seat-top (value zone)
    cush:0x6b5a52, cushDk:0x4a3d38, cushLt:0x847068,                      // forgotten kneeler-cushion bundle
    disc:0x362a1e, discTop:0x40311f,
  };

  /* helper: an axis-aligned wood box, 3-tone shaded (top lit, sides mid, bottom/back shadow). */
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

  /* ===== 1) FOUR STUB LEGS — short squat wood posts, one near each seat corner. ===== */
  const LEG_TOP = 0.055 + 0.22;
  const lx = 0.52, lz = 0.15;
  box(-lx-0.035,-lx+0.035, 0.055,LEG_TOP, -lz-0.035,-lz+0.035, P.woodLt, P.wood, P.woodDkr);
  box( lx-0.035, lx+0.035, 0.055,LEG_TOP, -lz-0.035,-lz+0.035, P.woodLt, P.wood, P.woodDkr);
  box(-lx-0.035,-lx+0.035, 0.055,LEG_TOP,  lz-0.035, lz+0.035, P.woodLt, P.wood, P.woodDkr);
  box( lx-0.035, lx+0.035, 0.055,LEG_TOP,  lz-0.035, lz+0.035, P.woodLt, P.wood, P.woodDkr);

  /* ===== 2) THE SEAT — long plank spanning ~1.15u wide so rows tile edge-to-edge. ===== */
  const SEAT_Y0 = LEG_TOP;
  const SEAT_Y1 = LEG_TOP + 0.06;
  box(-0.575,0.575, SEAT_Y0,SEAT_Y1, -0.19,0.19, P.woodLt, P.wood, P.woodDk);

  /* ===== 3) PALE WORN SEAT-TOP — a rubbed-pale patch mid-plank, the value-zone tell
     (years of sitting). Proud of the seat top by a hair so it reads over the wood. ===== */
  {
    const y = SEAT_Y1 + 0.002;
    quad(V(-0.34,y,0.13), V(0.30,y,0.13), V(0.26,y,-0.13), V(-0.30,y,-0.13), P.worn, 0.06);
  }

  /* ===== 4) BACK RAIL — a low rail standing off the rear of the seat on two short posts. ===== */
  const POST_TOP = SEAT_Y1 + 0.26;
  const railZ = -0.15;
  box(-0.46,-0.40, SEAT_Y1,POST_TOP, railZ-0.03,railZ+0.03, P.woodLt, P.wood, P.woodDkr);
  box( 0.40, 0.46, SEAT_Y1,POST_TOP, railZ-0.03,railZ+0.03, P.woodLt, P.wood, P.woodDkr);
  box(-0.58,0.58, POST_TOP-0.055,POST_TOP, railZ-0.045,railZ+0.045, P.woodLt, P.wood, P.woodDk);   // the rail itself

  /* ===== 5) USE-TELL — a forgotten kneeler-cushion bundle left on the seat, front-right,
     visible from the +x/+z high 3/4 view. A lumpy rolled cloth bundle with a tie band. ===== */
  {
    const cx=0.34, cz=0.06, cy0=SEAT_Y1+0.002;
    stack([
      {y:cy0,       rx:0.10, rz:0.075, cx, cz, hex:P.cushDk},
      {y:cy0+0.045, rx:0.105,rz:0.08,  cx, cz, hex:P.cush},
      {y:cy0+0.085, rx:0.085,rz:0.065, cx, cz, hex:P.cushLt},
    ], 8, {capTop:{hex:P.cushLt, lift:0.006}});
    // a tie band cinching the bundle mid-height (darker strap)
    quad(V(cx-0.11,cy0+0.05,cz+0.03), V(cx+0.11,cy0+0.05,cz+0.02), V(cx+0.11,cy0+0.03,cz-0.03), V(cx-0.11,cy0+0.03,cz-0.02), P.cushDk, 0.04);
  }

  /* base disc — shared style (r=0.62 to cover the 1x1 footprint). Wood-floor tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.62, 0.62, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.60, 0.60, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
