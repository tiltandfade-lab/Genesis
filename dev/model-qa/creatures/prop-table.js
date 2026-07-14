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
