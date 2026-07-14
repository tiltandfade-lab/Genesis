/* dev/model-qa/creatures/prop-portcullis.js — the PORTCULLIS GATE: a dungeon SET PIECE (whole-object
   prop). NOT the full masonry archway (prop-arch.js already owns that) — this is the bare IRON GATE
   itself: a heavy grille of vertical bars + horizontal cross-rails, SPIKED at the bottom, hung in a
   slim iron guide-frame, half-DROPPED and jammed at an angle so it reads "rusted / wedged / bent /
   warped." Whole-object grammar: one function, one geometry frame, no anchors. Sits on the same base
   disc the humanoid figures use (r=0.68 — a gateway-scale prop). RESIZED 2026-07-08
   (prop-scale-contract): widened + raised to gateway scale (staged ~6.3 ft wide × ~9.4 ft tall) —
   the old 1.0u-wide, 1.94u-tall gate staged as a 4-ft doorway grate.
   The read at board distance: a rust-eaten iron grate wedged in a stone socket, NOT a triumphal arch.
   Tells:
     - a THICK grille of 5 vertical bars bound by 3 horizontal cross-rails, SPIKED lower teeth
     - the whole grid DROPPED to ~half height + tilted a few degrees (jammed/warped in its channel)
     - two slim stone guide-JAMBS the grate slides in (short — the arch is elsewhere; these just
       socket the gate) with a heavy iron LINTEL/winch-drum across the top the chains feed over
     - RUST bloom streaks down the bars; one bar visibly BENT out of true (the "bent/warped" tell)
   VS-desaturated: cold rust-eaten iron for the grille (lifted so it pops), weathered stone for the
   short jambs. Imported by prop-portcullis-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPortcullis(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    iron:0x4c4e51, ironDk:0x2f3032, ironLt:0x6a6d71, ironDkr:0x1f2021,        // grille bars (lifted to read in the dark socket)
    rust:0x6b4a2c, rustDk:0x4a3320, rustLt:0x835e37,                          // rust bloom
    stone:0x6f6c64, stoneDk:0x504d47, stoneDkr:0x35332f, stoneLt:0x8c887c,    // short guide-jambs
    chip:0xa5a195,
    disc:0x3a352b, discTop:0x46402f,
  };

  /* box helper (closed rectangular stone block, 3-tone) — for the jambs + lintel */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05); quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05); quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);  quad(Cc,G,H,D, top, 0.05);
  }

  /* ===== SHORT GUIDE-JAMBS — two slim stone posts the grate slides in. Short/plain (the arch is a
     separate prop) — just enough to socket the gate and read "this is a gateway." Inner edges ~x=±0.60.
     ===== */
  const jx = 0.68, halfW = 0.075, zN = -0.10, zP = 0.10, jambTop = 2.24;
  for(const s of [-1,1]){
    const cx = s*jx;
    // coursed: 6 block courses
    const courses = 6, ch = (jambTop-0.055)/courses;
    for(let k=0;k<courses;k++){
      const y0 = 0.055 + k*ch, y1 = 0.055 + (k+1)*ch - 0.006;
      const lit = (k&1);
      box(cx-halfW, cx+halfW, y0, y1, zN, zP, lit?P.stoneLt:P.stone, lit?P.stone:P.stoneDk, P.stoneDkr);
    }
    // a channel groove down the inner face (the slot the grate rides in)
    const ix = cx - s*halfW;
    quad(V(ix,0.10,zP+0.001), V(ix-s*0.02,0.10,zP+0.001), V(ix-s*0.02,jambTop-0.10,zP+0.001), V(ix,jambTop-0.10,zP+0.001), P.stoneDkr, 0.03);
    // a chipped facet high on the jamb
    quad(V(cx-halfW,0.7,zP), V(cx-halfW+0.04,0.7,zP), V(cx-halfW,0.62,zP), V(cx-halfW,0.62,zP), P.chip, 0.03);
  }

  /* ===== IRON LINTEL / WINCH BAR — a heavy iron beam across the two jamb-tops; the grate hangs from
     it, chains feed over it. Reads as the mechanism the gate is suspended from. ===== */
  {
    const by = jambTop + 0.02, hw = jx + halfW + 0.02, th = 0.06;
    const A=V(-hw,by-th,-0.075), B=V(hw,by-th,-0.075), Cc=V(hw,by-th,0.075), D=V(-hw,by-th,0.075);
    const E=V(-hw,by+th,-0.075), F=V(hw,by+th,-0.075), G=V(hw,by+th,0.075), H=V(-hw,by+th,0.075);
    quad(H,G,F,E, P.ironLt, 0.04); quad(A,B,Cc,D, P.ironDkr, 0.04);
    quad(Cc,G,H,D, P.iron, 0.04); quad(A,E,F,B, P.ironDk, 0.04);
    quad(D,H,E,A, P.ironDk, 0.04); quad(B,F,G,Cc, P.ironDk, 0.04);
    // winch-drum stub on the +z face
    tube(V(0,by,0.075), V(0,by,0.16), 0.05,0.05,8, P.iron, {capB:{hex:P.ironLt}});
  }

  /* ===== THE GRILLE — the money read. A grid of 5 vertical bars bound by 3 horizontal cross-rails,
     dropped to about half height and JAMMED at a small tilt (the whole grid is built in a tilted
     local frame). SPIKED lower ends hang as teeth in mid-air. The grate is dropped: its top rail sits
     under the lintel, its teeth end well above the floor (half-lowered + wedged). ===== */
  {
    const tilt = 0.055;                     // ~3.1° jam
    const cx0 = 0.0, cy0 = 1.24;            // grate center (dropped low — half-lowered)
    const rot = (x,y,z)=>{                   // rotate (x,y) about (cx0,cy0) by `tilt`
      const dx=x-cx0, dy=y-cy0;
      return V(cx0 + dx*Math.cos(tilt) - dy*Math.sin(tilt),
               cy0 + dx*Math.sin(tilt) + dy*Math.cos(tilt), z);
    };
    const z = 0.0, th = 0.035;
    const topY = 2.06, botY = 0.52, spikeY = botY - 0.16;   // grate spans dropped-half, teeth hang ~0.36u
    const barsX = [-0.56, -0.28, 0.0, 0.28, 0.56];          // 5 vertical bars
    barsX.forEach((bx,i)=>{
      // one bar is BENT out of true (the "bent/warped" tell) — kink its lower half forward + out
      const bent = (i===3);
      const topP = rot(bx, topY, z);
      const midP = rot(bent? bx+0.05 : bx, (topY+botY)/2, bent? z+0.05 : z);
      const botP = rot(bent? bx+0.09 : bx, botY, bent? z+0.07 : z);
      tube(topP, midP, th, th, 6, i%2?P.iron:P.ironDk, {capA:{hex:P.ironDkr}});
      tube(midP, botP, th, th*0.95, 6, i%2?P.iron:P.ironDk);
      // spike tooth
      const spP = rot(bent? bx+0.11 : bx, spikeY, bent? z+0.09 : z);
      tube(botP, spP, th*0.95, 0.001, 6, P.ironLt, {capB:{hex:P.ironLt}});
    });
    // 3 horizontal cross-rails binding the grid (top / mid / lower)
    for(const cyb of [topY-0.05, (topY+botY)/2, botY+0.05]){
      const a = rot(-0.64, cyb, z), b = rot(0.64, cyb, z);
      tube(a, b, th*0.85, th*0.85, 6, P.ironDkr);
    }
    // RUST bloom streaks down two bars (warm dark quads on the +z face)
    for(const bx of [-0.56, 0.0]){
      const a=rot(bx-0.012, 1.65, z+th), b=rot(bx+0.012, 1.65, z+th);
      const c=rot(bx+0.010, 0.95, z+th), d=rot(bx-0.010, 0.95, z+th);
      quad(a, b, c, d, bx<0?P.rust:P.rustDk, 0.06);
    }
    // a rust crust blob at the jammed corner (where the tilt binds against the right jamb)
    const rc = rot(0.60, 1.15, z+th);
    quad(V(rc.x-0.03,rc.y+0.06,rc.z), V(rc.x+0.03,rc.y+0.05,rc.z), V(rc.x+0.02,rc.y-0.06,rc.z), V(rc.x-0.03,rc.y-0.05,rc.z), P.rustLt, 0.06);
  }

  /* base disc — gateway-scale prop (r=0.68, matches registry discR). Stone tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.66, 0.66, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
