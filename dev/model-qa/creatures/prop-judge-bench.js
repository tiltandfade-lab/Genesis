/* dev/model-qa/creatures/prop-judge-bench.js — the JUDGE'S BENCH: a raised seat-of-power dais
   (whole-object prop). Not a creature — no disc-figure, no eyes, no grip. One function, one
   geometry frame, no anchors. Footprint 2x1 five-ft cells (~2.5u x 1.25u).
   Feature checklist (what the tri budget buys):
     - a RAISED PLATFORM (~1 cell high, ~1.15u) — a single wide plank/stone step the whole bench
       sits on; this is the primary authority tell (elevation, not ornament)
     - a DESK-RUN / RAIL across the platform's front lip, waist-high off the platform top —
       the working surface the judge sits behind
     - a HIGH-BACKED SEAT silhouette standing behind the desk lip — tall back-slab reading over
       the desk from any distance, the second authority tell
     - a short set of ACCESS STEPS at one end of the platform (how anyone gets up there)
     - USE-TELL clutter on the desk-run: a stacked ledger/tome and a small gavel-block, proving
       the bench is mid-session, not a bare box
   Use sentence: a judge is presently seated behind this bench, elevated over the room, ledger
   open and gavel-block at hand — the room reads "court is in session" at a glance.
   VS-desaturated weathered wood/stone palette per prop-altar.js's convention (a few close tones,
   one pale weathering accent, one warm brass/wax accent on the clutter).
   Scale reference: figure ~1.5u tall; platform top ~1.15u (a standing figure's chest height —
   reads as genuinely elevated over a seated crowd); one 5-ft cell ~1.25u (footprint 2x1 cells). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropJudgeBench(){
  /* ---------- PALETTE (VS desaturated weathered wood/stone) ---------- */
  const P = {
    plank:0x5f4a35, plankDk:0x453424, plankDkr:0x2f2418, plankLt:0x76604a,   // platform + desk wood
    stoneBase:0x565349, stoneBaseDk:0x3d3b33,                                // step supports (stone plinth)
    chip:0x9a8f78,                                                           // pale weathering edge
    seat:0x4a3a2a, seatDk:0x33281c, seatLt:0x5f4c38,                         // high-back seat
    ledger:0x8a7a55, ledgerDk:0x5f5238, page:0xcfc39f,                       // ledger/tome clutter
    gavel:0x3a2c1e, gavelDk:0x241a11, brass:0xb08a4a,                        // gavel-block + brass accent
    disc:0x352c20, discTop:0x413523,
  };

  /* helper: axis-aligned box, 3-tone shaded (top lit, sides mid, front lit, back/bottom shadow) */
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

  /* footprint: 2x1 cells (~2.5u x ~1.25u). Long axis = X (front-to-side), depth = Z. */
  const PLAT_Y0 = 0.055;
  const PLAT_Y1 = PLAT_Y0 + 1.10;   // platform top ~1.15u — reads elevated over a standing figure's waist

  /* ===== 1) STONE PLINTH SUPPORT — a lower solid base the plank platform sits on, slightly
     inset so the platform overhangs (heavy read). ===== */
  box(-1.15,1.15, PLAT_Y0, PLAT_Y1-0.10, -0.55,0.55, P.stoneBase, P.stoneBase, P.stoneBaseDk);

  /* ===== 2) RAISED PLANK PLATFORM — the top slab of the dais, the whole bench sits on this. ===== */
  box(-1.20,1.20, PLAT_Y1-0.10,PLAT_Y1, -0.60,0.60, P.plankLt, P.plank, P.plankDk);
  // pale chipped weathering edge along the front lip
  quad(V(-1.20,PLAT_Y1,0.60), V(-0.50,PLAT_Y1,0.60), V(-1.20,PLAT_Y1-0.04,0.60), V(-1.20,PLAT_Y1-0.04,0.60), P.chip, 0.03);
  quad(V(0.70,PLAT_Y1,0.60), V(0.70,PLAT_Y1-0.05,0.60), V(1.20,PLAT_Y1,0.60), V(1.20,PLAT_Y1,0.60), P.chip, 0.03);

  /* ===== 3) DESK-RUN / RAIL — waist-high run across the platform's front lip, the working
     surface. Sits near the front edge, spans nearly the full width. ===== */
  const DESK_Y0 = PLAT_Y1, DESK_Y1 = PLAT_Y1 + 0.55;
  box(-1.10,1.10, DESK_Y0,DESK_Y1, 0.30,0.46, P.plank, P.plankDk, P.plankDkr);   // desk front panel/rail
  box(-1.10,1.10, DESK_Y1,DESK_Y1+0.06, 0.24,0.50, P.plankLt, P.plank, P.plankDk); // desk top lip (thin cap, overhangs)

  /* ===== 4) HIGH-BACKED SEAT — a tall back-slab silhouette standing behind the desk, reading
     clearly over the desk lip from a distance. The authority read's second half. ===== */
  const SEAT_Y0 = PLAT_Y1;
  box(-0.32,0.32, SEAT_Y0,SEAT_Y0+0.30, -0.42,-0.28, P.seat, P.seatDk, P.seatDk);       // seat base/cushion block
  box(-0.34,0.34, SEAT_Y0+0.30,SEAT_Y0+0.85, -0.46,-0.34, P.seatLt, P.seat, P.seatDk);  // tall back-slab, well above desk
  // a pale worn accent stripe down the back-slab center (reads at 1/3-res as the seat's spine)
  quad(V(-0.03,SEAT_Y0+0.35,-0.34), V(0.03,SEAT_Y0+0.35,-0.34), V(0.03,SEAT_Y0+0.80,-0.34), V(-0.03,SEAT_Y0+0.80,-0.34), P.chip, 0.05);

  /* ===== 5) ACCESS STEPS — a short two-tread stair at the +X end of the platform, how anyone
     climbs up. Reads clearly as "raised, and here's the way up." ===== */
  {
    const sx0 = 1.20, sx1 = 1.45;
    box(sx0, sx1, PLAT_Y0, PLAT_Y0+0.38, -0.35,0.35, P.stoneBase, P.stoneBase, P.stoneBaseDk);  // lower tread
    box(sx1, sx1+0.20, PLAT_Y0+0.38, PLAT_Y1-0.10, -0.30,0.30, P.plank, P.plankDk, P.plankDkr);  // upper tread meets platform
  }

  /* ===== 6) USE-TELL CLUTTER on the desk lip — a stacked ledger/tome and a gavel-block sitting
     on the desk top, proving the bench is mid-session. ===== */
  {
    const y = DESK_Y1 + 0.06 + 0.002;
    // ledger: two stacked slab "books", slightly offset
    box(-0.85,-0.50, y,y+0.05, 0.20,0.42, P.ledgerDk, P.ledgerDk, P.ledgerDk);
    box(-0.82,-0.53, y+0.05,y+0.09, 0.21,0.40, P.ledger, P.ledger, P.ledgerDk);
    // pale page-edge sliver on the top book (the leaf-tell)
    quad(V(-0.82,y+0.09,0.40), V(-0.53,y+0.09,0.40), V(-0.53,y+0.089,0.21), V(-0.82,y+0.089,0.21), P.page, 0.02);
    // gavel-block: a small dark plinth + brass-capped stub gavel, near the other end of the desk
    box(0.45,0.72, y,y+0.06, 0.22,0.40, P.gavelDk, P.gavelDk, P.gavelDk);
    tube(V(0.58,y+0.06,0.30), V(0.58,y+0.16,0.30), 0.035,0.028,6, P.gavel, {capB:{hex:P.brass}});
    tube(V(0.50,y+0.13,0.30), V(0.66,y+0.13,0.30), 0.045,0.045,6, P.gavel, {capB:{hex:P.gavelDk}, capT:{hex:P.gavelDk}});
  }

  /* base disc — shared style, sized to the 2x1 footprint (long-axis radius). */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.65, 0.65, 20);
    const r2=ring(V(0,PLAT_Y0,0), V(0,1,0), 0.62, 0.62, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,PLAT_Y0+0.003,0), P.discTop);
  }
}
