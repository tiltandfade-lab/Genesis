/* dev/model-qa/creatures/prop-altar.js — the ALTAR: a stone SET PIECE (whole-object prop).
   Not a creature — no disc-figure, no eyes, no grip. One function, one geometry frame, no anchors.
   The read (all at once): shrine / altar / SACRIFICIAL stone. Tells, bottom→top:
     - a low TWO-STEP DAIS (broad bottom step, narrower top step) — the raised platform
     - TWO SQUAT block supports standing on the dais top
     - a heavy STONE SLAB (~1.0u wide, ~0.75u tall overall) bridging the supports — the altar table
     - a DARK OFFERING-STAIN patch soaked into the slab top (the blood/ritual tell)
     - one CANDLE-STUB at a front corner (pale wax nub + tiny dark wick)
   VS-desaturated stone palette (a few close greys + a cold pale weathering + a warm wax accent).
   Scale reference: figures ~1.5u; the slab top sits ~0.75u (altar-table height, reads as a surface
   a figure could be laid on). Imported by prop-altar-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildAltar(){
  /* ---------- PALETTE (VS desaturated stone) ---------- */
  const P = {
    stone:0x6e6b64, stoneDk:0x504e48, stoneDkr:0x3a3833, stoneLt:0x847f75,   // slab + supports
    dais:0x605d56, daisDk:0x46433d, daisLt:0x77746a,                          // the steps
    chip:0xa6a296,                                                            // pale broken weathering edges
    stain:0x4a2822, stainDk:0x321713,                                         // dried offering-stain (dark red-brown, readable on grey)
    wax:0xc9bfa2, waxDk:0x9a9179, wick:0x1a1512,                              // candle stub
    disc:0x3a352b, discTop:0x46402f,
  };

  /* helper: an axis-aligned rectangular stone box from (min) to (max) with 3-tone shading
     (top lit, front/back mid, sides split so it reads as a solid block). No caps needed — closed. */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);   // bottom ring
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);    // top ring
    quad(H,G,F,E, top, 0.05);          // top (lit)
    quad(D,Cc,B,A, dk, 0.05);          // bottom (shadow) — closes the box
    quad(D,H,E,A, mid, 0.05);          // left (-x)
    quad(B,F,G,Cc, mid, 0.05);         // right (+x)
    quad(A,E,F,B, dk, 0.05);           // back (-z, shadow)
    quad(Cc,G,H,D, top, 0.05);         // front (+z, lit)
  }

  /* ===== 1) TWO-STEP DAIS — broad bottom step, narrower top step. Sits on the base plane (y≈0.055
     to clear the board), stacked upward. The whole altar is built on the dais top. ===== */
  const STEP0_TOP = 0.055 + 0.075;   // bottom step top
  const STEP1_TOP = STEP0_TOP + 0.070;   // top step top = the dais surface the supports stand on
  box(-0.40,0.40, 0.055,STEP0_TOP, -0.34,0.34, P.daisLt, P.dais, P.daisDk);       // bottom step (broad)
  box(-0.32,0.32, STEP0_TOP,STEP1_TOP, -0.27,0.27, P.daisLt, P.dais, P.daisDk);   // top step (narrower)
  // a couple of chipped pale facets at the front step edges (weathering)
  quad(V(-0.40,STEP0_TOP,0.34), V(-0.31,STEP0_TOP,0.34), V(-0.40,STEP0_TOP-0.05,0.34), V(-0.40,STEP0_TOP-0.05,0.34), P.chip, 0.03);
  quad(V(0.32,STEP1_TOP,0.27), V(0.32,STEP1_TOP-0.05,0.27), V(0.24,STEP1_TOP,0.27), V(0.24,STEP1_TOP,0.27), P.chip, 0.03);

  /* ===== 2) TWO SQUAT SUPPORTS — heavy stone blocks standing on the dais top, one left one right,
     holding the slab up. Squat (wider than tall) so the altar reads as heavy, not spindly. ===== */
  const SUP_TOP = STEP1_TOP + 0.34;   // support height on the dais
  box(-0.30,-0.14, STEP1_TOP,SUP_TOP, -0.17,0.17, P.stoneLt, P.stone, P.stoneDkr);   // left support
  box( 0.14, 0.30, STEP1_TOP,SUP_TOP, -0.17,0.17, P.stoneLt, P.stone, P.stoneDkr);   // right support
  // a knocked-out dark notch low on the front of the left support (age)
  quad(V(-0.27,STEP1_TOP+0.04,0.17), V(-0.17,STEP1_TOP+0.04,0.17), V(-0.19,STEP1_TOP+0.15,0.15), V(-0.25,STEP1_TOP+0.15,0.15), P.stoneDkr, 0.03);

  /* ===== 3) THE SLAB — a heavy stone table ~1.0u wide x ~0.75u tall(top) bridging the supports.
     Overhangs the supports on all sides (the tabletop read). Top face is the offering surface. ===== */
  const SLAB_Y0 = SUP_TOP;               // slab bottom rests on the supports
  const SLAB_Y1 = SUP_TOP + 0.16;        // slab is a thick heavy slab
  box(-0.50,0.50, SLAB_Y0,SLAB_Y1, -0.24,0.24, P.stoneLt, P.stone, P.stoneDk);
  // heavy chipped corners on the slab (broken edges, pale)
  quad(V(-0.50,SLAB_Y1,0.24), V(-0.42,SLAB_Y1,0.24), V(-0.50,SLAB_Y1-0.06,0.24), V(-0.50,SLAB_Y1-0.06,0.24), P.chip, 0.03);
  quad(V(0.50,SLAB_Y1,0.24), V(0.50,SLAB_Y1-0.07,0.24), V(0.42,SLAB_Y1,0.24), V(0.42,SLAB_Y1,0.24), P.chip, 0.03);
  quad(V(0.50,SLAB_Y1,-0.24), V(0.42,SLAB_Y1,-0.24), V(0.50,SLAB_Y1-0.06,-0.24), V(0.50,SLAB_Y1-0.06,-0.24), P.chip, 0.03);

  /* ===== 4) OFFERING-STAIN — a dark irregular patch soaked into the slab TOP, off-center, with a
     drip running over the front lip. Proud of the top face by a hair so it reads over the stone. ===== */
  {
    const y = SLAB_Y1 + 0.002;
    // the main soaked patch on top (irregular quad, wound to face UP). Bigger + off-center.
    quad(V(-0.22,y,0.18), V(0.30,y,0.14), V(0.26,y,-0.12), V(-0.20,y,-0.06), P.stain, 0.06);
    quad(V(-0.06,y,0.14), V(0.20,y,0.10), V(0.18,y,-0.06), V(-0.02,y,-0.02), P.stainDk, 0.05);   // darker core
    // a drip running down over the FRONT lip of the slab
    quad(V(0.02,SLAB_Y1,0.24), V(0.11,SLAB_Y1,0.24), V(0.10,SLAB_Y1-0.10,0.242), V(0.03,SLAB_Y1-0.10,0.242), P.stain, 0.05);
    quad(V(0.05,SLAB_Y1-0.05,0.242), V(0.08,SLAB_Y1-0.05,0.242), V(0.07,SLAB_Y1-0.16,0.243), V(0.06,SLAB_Y1-0.16,0.243), P.stainDk, 0.04);
  }

  /* ===== 5) CANDLE-STUB — a short pale wax nub standing at the front-LEFT corner of the slab top,
     with a tiny dark wick. A worn stub (squat, melted). ===== */
  {
    const cx=-0.38, cz=0.15, cy0=SLAB_Y1+0.002;
    stack([
      {y:cy0,       rx:0.028, rz:0.028, cx, cz, hex:P.waxDk},
      {y:cy0+0.055, rx:0.026, rz:0.026, cx, cz, hex:P.wax},
      {y:cy0+0.085, rx:0.022, rz:0.020, cx, cz, hex:P.wax},   // melted, slightly leaning taper
    ], 6, {capTop:{hex:P.wax, lift:0.006}});
    // wick — a tiny dark nub on top
    tube(V(cx,cy0+0.085,cz), V(cx+0.004,cy0+0.115,cz), 0.006,0.003,4, P.wick, {capB:{hex:P.wick}});
    // a little wax pool spreading on the slab under the stub (wound to face UP)
    quad(V(cx-0.05,cy0,cz+0.04), V(cx+0.05,cy0,cz+0.05), V(cx+0.045,cy0,cz-0.03), V(cx-0.045,cy0,cz-0.04), P.waxDk, 0.05);
  }

  /* base disc — shared style (r=0.42). Stone tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
