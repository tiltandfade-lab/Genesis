/* dev/model-qa/creatures/prop-table.js — the TRESTLE TABLE: a heavy tavern/workshop table with a
   bench alongside and a mug + plate on top. Whole-object grammar: one function, one geometry frame,
   no anchors. Set piece — a room-filler and waist-high cover/obstacle.
     • a thick plank TOP (~1.2u long, ~0.85u tall) on two A-frame TRESTLES (splayed legs + a cross-brace)
     • a low BENCH alongside the near long edge (plank seat on two stubby leg-pairs)
     • a MUG (small ringed cylinder + handle nub) and a PLATE (flat disc) on the tabletop
   VS-desaturated oak. Imported by prop-table-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTable(){
  /* ---------- PALETTE (VS desaturated oak + pewter tableware) ---------- */
  const P = {
    top:0x74562f, topDk:0x543d20, topLt:0x8a6a3c, plank:0x5c4126,
    leg:0x5f4527, legDk:0x40301c, brace:0x503a20,
    bench:0x6a4c2b, benchDk:0x48341d,
    mug:0x6d5233, mugDk:0x4a3922, mugRim:0x877050,
    plate:0x9a958a, plateDk:0x6f6b62,
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — the top is a slab along X (long axis). Trestles at each end; bench in front.
     PROPORTION PASS (2026-07-04 QA review — Adam: "the table is much taller than its bench"). The old
     table top sat at y=0.72 (surface ~0.78) with the bench seat at y=0.34 (surface ~0.385) — a
     ~0.49 bench:table ratio, so the table towered over a tiny bench and read spindly-tall for its
     footprint. Lowered the table underside to 0.56 (surface ~0.62, a believable squat trestle-table
     height for the ~1.5u humanoid) and raised the bench seat to 0.36 (surface ~0.405) → a ~0.65
     bench:table ratio, the real bench-to-table proportion. ---- */
  const L = {
    topHalfL:0.46,   // half-length along X (~0.92u; overhangs the disc a touch, a long table)
    topHalfW:0.24,   // half-width along Z
    topY:0.56,       // underside of the top (LOWERED from 0.72 — the table was too tall)
    topThick:0.06,   // plank thickness
    trestleX:0.32,   // trestle inset from the ends
    footSplay:0.14,  // how far the feet splay past the top-frame at the floor
    benchZ:0.56,     // bench sits clearly in FRONT (+z), clear of the table's leg splay
    benchTopY:0.36,  // bench seat height (RAISED from 0.34 — believable seat-to-table proportion)
  };

  /* ===== TABLE TOP — a thick plank slab. 8 corners → top face, underside, 4 edges. Plank seams. ==== */
  const hl=L.topHalfL, hw=L.topHalfW, y0=L.topY, y1=L.topY+L.topThick;
  const tc=(sx,y,sz)=>V(sx*hl, y, sz*hw);
  {
    // TOP
    quad(tc(-1,y1,-1), tc(1,y1,-1), tc(1,y1,1), tc(-1,y1,1), P.topLt, 0.05);
    // UNDER
    quad(tc(1,y0,-1), tc(-1,y0,-1), tc(-1,y0,1), tc(1,y0,1), P.topDk, 0.03);
    // long edges (front +z / back −z)
    quad(tc(-1,y0,1), tc(1,y0,1), tc(1,y1,1), tc(-1,y1,1), P.top, 0.04);
    quad(tc(1,y0,-1), tc(-1,y0,-1), tc(-1,y1,-1), tc(1,y1,-1), P.topDk, 0.04);
    // short edges
    quad(tc(-1,y0,-1), tc(-1,y0,1), tc(-1,y1,1), tc(-1,y1,-1), P.topDk, 0.04);
    quad(tc(1,y0,1), tc(1,y0,-1), tc(1,y1,-1), tc(1,y1,1), P.topDk, 0.04);
    // plank seams — 2 lengthwise darker lines on the top face
    for(const pz of [-0.08, 0.08]){
      quad(V(-hl,y1+0.002,pz-0.012), V(hl,y1+0.002,pz-0.012), V(hl,y1+0.002,pz+0.012), V(-hl,y1+0.002,pz+0.012), P.plank, 0.02);
    }
  }

  /* ===== TRESTLES — two A-frames, one near each end. Each = a pair of splayed legs (front+back)
     meeting a top rail under the slab, plus a horizontal cross-brace low between the two legs. ===== */
  const trestle=(tx)=>{
    // top of the legs meet just under the slab at ±hw; feet splay OUT to ±(hw+splay) at the floor
    const topZ=hw-0.02, footZ=hw+L.footSplay, footY=0.05;
    for(const sz of [-1,1]){
      const top=V(tx, y0-0.01, sz*topZ);
      const foot=V(tx, footY, sz*footZ);
      tube(top, foot, 0.045, 0.055, 6, P.leg, {capB:{hex:P.legDk, lift:0.01}});
    }
    // a short top-rail block hugging the underside of the slab (the trestle head)
    stack([
      {y:y0-0.07, rx:0.05, rz:topZ+0.02, cx:tx, hex:P.legDk},
      {y:y0-0.01, rx:0.05, rz:topZ+0.02, cx:tx, hex:P.leg},
    ], 6, {capTop:{hex:P.leg}});
    // low CROSS-BRACE between the two legs (horizontal along Z near the floor)
    tube(V(tx, 0.18, -topZ*0.7), V(tx, 0.18, topZ*0.7), 0.030, 0.030, 6, P.brace, {capA:{hex:P.brace},capB:{hex:P.brace}});
  };
  trestle(-L.trestleX);
  trestle( L.trestleX);
  // a long STRETCHER connecting the two trestles down the center (classic trestle table)
  tube(V(-L.trestleX, 0.20, 0.0), V(L.trestleX, 0.20, 0.0), 0.032, 0.032, 6, P.brace, {capA:{hex:P.brace},capB:{hex:P.brace}});

  /* ===== BENCH — a low plank seat in FRONT of the table (+z), along X. Plank seat + 2 stubby
     splayed leg-pairs. Shorter than the table so it reads as its own piece. ===== */
  {
    const bhl=0.32, bhw=0.09, bz=L.benchZ, y0b=L.benchTopY, y1b=L.benchTopY+0.045;
    const bc=(sx,y,sz)=>V(sx*bhl, y, bz + sz*bhw);
    // seat slab
    quad(bc(-1,y1b,-1), bc(1,y1b,-1), bc(1,y1b,1), bc(-1,y1b,1), P.bench, 0.05);
    quad(bc(1,y0b,-1), bc(-1,y0b,-1), bc(-1,y0b,1), bc(1,y0b,1), P.benchDk, 0.03);
    quad(bc(-1,y0b,1), bc(1,y0b,1), bc(1,y1b,1), bc(-1,y1b,1), P.benchDk, 0.04);
    quad(bc(1,y0b,-1), bc(-1,y0b,-1), bc(-1,y1b,-1), bc(1,y1b,-1), P.benchDk, 0.04);
    quad(bc(-1,y0b,-1), bc(-1,y0b,1), bc(-1,y1b,1), bc(-1,y1b,-1), P.benchDk, 0.04);
    quad(bc(1,y0b,1), bc(1,y0b,-1), bc(1,y1b,-1), bc(1,y1b,1), P.benchDk, 0.04);
    // 4 stubby legs, splayed a touch
    for(const sx of [-1,1]) for(const sz of [-1,1]){
      const top=V(sx*(bhl-0.05), y0b, bz+sz*(bhw-0.02));
      const foot=V(sx*(bhl-0.02), 0.04, bz+sz*(bhw+0.04));
      tube(top, foot, 0.028, 0.032, 5, P.benchDk, {capB:{hex:P.benchDk, lift:0.01}});
    }
  }

  /* ===== TABLEWARE — a MUG (ringed cylinder + a handle nub) and a PLATE (flat disc) on the top. == */
  {
    const surfY=y1;
    // PLATE — a shallow disc, front-left of the top
    const px=-0.16, pz=0.02;
    const pOuter=ring(V(px, surfY+0.006, pz), V(0,1,0), 0.085, 0.085, 12, 0);
    const pInner=ring(V(px, surfY+0.012, pz), V(0,1,0), 0.055, 0.055, 12, 0);
    stitch([pOuter, pInner], ()=>P.plate);            // rim slope
    capFan(pInner, V(px, surfY+0.010, pz), P.plateDk); // shallow well
    // MUG — a small ringed cylinder, right of the plate
    const mx=0.12, mz=-0.02, mb=surfY+0.004, mt=surfY+0.115;
    stack([
      {y:mb,          rx:0.055, cx:mx, cz:mz, hex:P.mugDk},
      {y:mb+0.03,     rx:0.058, cx:mx, cz:mz, hex:P.mug},
      {y:mt-0.02,     rx:0.056, cx:mx, cz:mz, hex:P.mug},
      {y:mt,          rx:0.058, cx:mx, cz:mz, hex:P.mugRim},
    ], 10, {capBot:{hex:P.mugDk}});
    // dark ale surface inside the rim
    capFan(ring(V(mx, mt-0.004, mz), V(0,1,0), 0.05, 0.05, 10, 0), V(mx, mt-0.006, mz), 0x2a1d10);
    // handle nub — a little C on the +x side (two short tubes)
    const hy=(mb+mt)/2;
    tube(V(mx+0.055, hy-0.03, mz), V(mx+0.085, hy, mz), 0.014,0.014, 5, P.mug);
    tube(V(mx+0.085, hy, mz), V(mx+0.055, hy+0.03, mz), 0.014,0.014, 5, P.mug);
  }

  /* base disc — Large piece (r=0.42). Table legs + bench legs touch down; the long top overhangs. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}

/* dev/model-qa/creatures/prop-table.js — buildCounterRun — the COUNTER-RUN / BAR: a waist-high
   service run of scarred plank, straight with an L-corner return at one end. Whole-object,
   footprint 2x1 five-ft cells (1 cell ~1.25u -> ~2.5u x 1.25u ground plan). Distinct from
   buildTable() above: taller (waist-high, ~0.88u top vs the table's ~0.62u), one-sided (a solid
   front apron + foot-rail, no legs to walk around), and longer/service-run shaped, not a sit-down
   table. Features the budget buys:
     - a long WAIST-HIGH PLANK TOP running straight, with an L-CORNER RETURN turning the end
       (the signature feature — names it "counter/bar" at a glance, not "table")
     - a solid FRONT APRON/KICKBOARD below the top on both runs (one-sided service face)
     - a FOOT-RAIL tube along the front, proud of the apron near the floor (bar-rail read)
     - scarred PLANK-SEAM lines on the top (worn service surface)
     - CLUTTER on the top — two bottles, a mug, and a draped rag hanging off the front lip — the
       USE-TELL: this bar is mid-service, not a bare geometric plank.
   Use sentence: a long tavern/shop bar mid-shift, bottles and a rag left out where the last round
   was poured. VS-desaturated scarred-oak palette (few close browns + one pale worn-edge + one
   dark rag accent), matching the exemplar's palette discipline. */
export function buildCounterRun(){
  /* ---------- PALETTE (VS desaturated scarred oak + dull bar-clutter accents) ---------- */
  const P = {
    top:0x6e5230, topDk:0x4e3a20, topLt:0x83643c, plank:0x543e22,
    apron:0x5a4126, apronDk:0x3d2c19,
    rail:0x453322, railDk:0x2e2116,
    wornEdge:0x9c8256,                                   // pale worn-plank edge (weathering accent)
    bottle:0x3d5240, bottleDk:0x293a2c, bottleGlass:0x577a5f,   // dull green glass
    mug:0x6d5233, mugDk:0x4a3922, mugRim:0x877050,
    rag:0x8a7a5e, ragDk:0x5c4d38,                        // dull cloth
    disc:0x3a352b, discTop:0x46402f,
  };

  /* helper: axis-aligned box, 3-tone shaded (top lit, front lit, others mid/dark). Matches the
     gold exemplar's box() convention. */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05);
    quad(D,Cc,B,A, dk, 0.03);
    quad(D,H,E,A, mid, 0.04);
    quad(B,F,G,Cc, mid, 0.04);
    quad(A,E,F,B, dk, 0.04);
    quad(Cc,G,H,D, top, 0.05);
  }

  /* ---------- LANDMARKS ---------- */
  const FLOOR = 0.055;                 // ground clearance (matches the floor gate)
  const topThick = 0.055;
  const topY1 = 0.88;                  // waist-high top surface
  const topY0 = topY1 - topThick;
  // MAIN RUN — long, along X. Front face (service side) at -Z.
  const mainX0=-1.15, mainX1=0.85, mainZ0=-0.14, mainZ1=0.14;
  // RETURN — the L-corner, turning at the +X end, running away in +Z.
  const retX0=0.71, retX1=0.99, retZ0=0.14, retZ1=0.90;

  /* ===== 1) FRONT APRON / KICKBOARD — solid service-face panel below the top, both runs. ===== */
  box(mainX0, mainX1, FLOOR, topY0, mainZ0, mainZ1, P.apron, P.apron, P.apronDk);
  box(retX0, retX1, FLOOR, topY0, retZ0, retZ1, P.apron, P.apron, P.apronDk);

  /* ===== 2) THE TOP — the long waist-high plank run with the L-CORNER RETURN (the signature
     feature: reads "bar/counter" at a squint from the run+turn silhouette alone). Slight overhang
     past the apron on all open edges. ===== */
  box(mainX0-0.02, mainX1+0.02, topY0, topY1, mainZ0-0.02, mainZ1+0.02, P.topLt, P.top, P.topDk);
  box(retX0-0.02, retX1+0.02, topY0, topY1, retZ0-0.02, retZ1+0.02, P.topLt, P.top, P.topDk);
  // plank seams — darker lengthwise lines on the main run top
  for(const pz of [-0.05, 0.05]){
    quad(V(mainX0, topY1+0.002, pz-0.010), V(mainX1, topY1+0.002, pz-0.010),
         V(mainX1, topY1+0.002, pz+0.010), V(mainX0, topY1+0.002, pz+0.010), P.plank, 0.02);
  }
  // one plank seam on the return top (crosswise, along Z)
  quad(V(retX0+0.06, topY1+0.002, retZ0), V(retX0+0.06, topY1+0.002, retZ1),
       V(retX0-0.06+0.14, topY1+0.002, retZ1), V(retX0-0.06+0.14, topY1+0.002, retZ0), P.plank, 0.02);
  // pale worn-edge facets at the two exposed corners (the top-lit weathering accent, ~0.04u legible)
  quad(V(mainX0-0.02,topY1,mainZ0-0.02), V(mainX0+0.10,topY1,mainZ0-0.02),
       V(mainX0-0.02,topY1-0.045,mainZ0-0.02), V(mainX0-0.02,topY1-0.045,mainZ0-0.02), P.wornEdge, 0.03);
  quad(V(retX1+0.02,topY1,retZ1+0.02), V(retX1+0.02,topY1-0.045,retZ1+0.02),
       V(retX1-0.10,topY1,retZ1+0.02), V(retX1-0.10,topY1,retZ1+0.02), P.wornEdge, 0.03);

  /* ===== 3) FOOT-RAIL — a tube proud of the front apron near the floor, the length of the main
     run (the bar-rail tell that distinguishes this from a plain table's leg silhouette). ===== */
  {
    const railY=0.18, railZ=mainZ0-0.05;
    tube(V(mainX0+0.05, railY, railZ), V(mainX1-0.05, railY, railZ), 0.028, 0.028, 8, P.rail,
      {capA:{hex:P.railDk}, capB:{hex:P.railDk}});
    // two stub brackets holding the rail against the apron
    for(const bx of [mainX0+0.20, mainX1-0.20]){
      tube(V(bx, railY, railZ), V(bx, railY, mainZ0+0.01), 0.020, 0.020, 5, P.railDk);
    }
  }

  /* ===== 4) CLUTTER — the USE-TELL. Two bottles, a mug, a draped rag along the main-run top,
     clustered toward the corner where the runs meet (busiest service spot). ===== */
  {
    const surfY=topY1;
    // BOTTLE A — tall tapered stack (dull green glass), left of center
    const b1x=-0.55, b1z=-0.02, b1b=surfY+0.004;
    stack([
      {y:b1b,        rx:0.038, cx:b1x, cz:b1z, hex:P.bottleDk},
      {y:b1b+0.05,   rx:0.040, cx:b1x, cz:b1z, hex:P.bottle},
      {y:b1b+0.14,   rx:0.034, cx:b1x, cz:b1z, hex:P.bottle},
      {y:b1b+0.19,   rx:0.016, cx:b1x, cz:b1z, hex:P.bottleGlass},
      {y:b1b+0.23,   rx:0.013, cx:b1x, cz:b1z, hex:P.bottleGlass},
    ], 8, {capTop:{hex:P.bottleGlass}, capBot:{hex:P.bottleDk}});
    // BOTTLE B — shorter, tilted-read companion bottle, right of it
    const b2x=-0.40, b2z=0.04, b2b=surfY+0.004;
    stack([
      {y:b2b,        rx:0.036, cx:b2x, cz:b2z, hex:P.bottleDk},
      {y:b2b+0.045,  rx:0.038, cx:b2x, cz:b2z, hex:P.bottle},
      {y:b2b+0.11,   rx:0.032, cx:b2x, cz:b2z, hex:P.bottle},
      {y:b2b+0.15,   rx:0.014, cx:b2x+0.01, cz:b2z, hex:P.bottleGlass},
    ], 8, {capTop:{hex:P.bottleGlass}, capBot:{hex:P.bottleDk}});
    // MUG — ringed cylinder + handle nub, near the corner
    const mx=0.55, mz=0.02, mb=surfY+0.004, mt=surfY+0.10;
    stack([
      {y:mb,          rx:0.050, cx:mx, cz:mz, hex:P.mugDk},
      {y:mb+0.025,    rx:0.053, cx:mx, cz:mz, hex:P.mug},
      {y:mt-0.018,    rx:0.051, cx:mx, cz:mz, hex:P.mug},
      {y:mt,          rx:0.053, cx:mx, cz:mz, hex:P.mugRim},
    ], 10, {capBot:{hex:P.mugDk}});
    capFan(ring(V(mx, mt-0.004, mz), V(0,1,0), 0.046, 0.046, 10, 0), V(mx, mt-0.006, mz), 0x2a1d10);
    const hy=(mb+mt)/2;
    tube(V(mx+0.050, hy-0.025, mz), V(mx+0.078, hy, mz), 0.012,0.012, 5, P.mug);
    tube(V(mx+0.078, hy, mz), V(mx+0.050, hy+0.025, mz), 0.012,0.012, 5, P.mug);
    // RAG — a draped cloth hanging off the front lip of the main run (flat top quad + a hanging
    // front quad, tilted so it reads as fabric, not a flat sticker)
    const rx0=0.10, rx1=0.28, rz=mainZ0;
    quad(V(rx0,surfY+0.006,rz+0.10), V(rx1,surfY+0.006,rz+0.09), V(rx1,surfY+0.006,rz-0.02), V(rx0,surfY+0.006,rz-0.01), P.rag, 0.05);
    quad(V(rx0,surfY+0.004,rz-0.02), V(rx1,surfY+0.004,rz-0.02), V(rx1,topY0+0.10,rz-0.06), V(rx0,topY0+0.14,rz-0.06), P.ragDk, 0.05);
  }

  /* base rectangle — grounding shadow plane matching the 2x1 footprint (not a round disc; this
     prop's footprint is rectangular, not square, so a rectangular grounding plane reads truer). */
  {
    const gx0=mainX0-0.06, gx1=retX1+0.06, gz0=mainZ0-0.10, gz1=retZ1+0.06;
    quad(V(gx0,0.002,gz0), V(gx1,0.002,gz0), V(gx1,0.002,gz1), V(gx0,0.002,gz1), P.disc, 0.04);
  }
}
