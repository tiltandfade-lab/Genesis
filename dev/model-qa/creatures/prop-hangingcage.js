/* dev/model-qa/creatures/prop-hangingcage.js — the HANGING CAGE (gibbet): a dungeon SET PIECE
   (whole-object prop). Not a creature — no eyes, no grip. One function, one geometry frame, no
   anchors. The read: a rusted iron gibbet-cage SUSPENDED from a chain off a wall-bracket, swaying
   over the floor — a bulging bell/teardrop cage of vertical ribs bound by hoops, empty or with a
   few bones rattling in the bottom. A SILHOUETTE piece: the read is the barred bulge hanging in
   space. Sits on the shared base disc (r=0.42) — the disc anchors it; the cage itself hangs high.
   Tells:
     - a short wall-BRACKET arm up top + a length of heavy CHAIN dropping from it (the "hangs from a
       chain" tell) — the cage sways off-vertical (swaying variant)
     - a bulging teardrop CAGE: 6-8 vertical iron ribs bowing out at the belly, bound by 3 hoop rings,
       a domed cap where the chain meets it + a small floor plate
     - a few pale BONES piled in the cage bottom (the "bone-filled" tell) — a couple of long-bones +
       a skull nub
   VS-desaturated: dark rust-eaten iron (ribs lifted so the silhouette reads), dead bone-pale.
   Scale reference: figures ~1.5u; the cage belly sits ~0.9u–1.5u (hangs at head height). Vertical piece.
   Imported by prop-hangingcage-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildHangingCage(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    iron:0x4a4c4f, ironDk:0x2e2f31, ironLt:0x676a6e, ironDkr:0x1e1f20,        // cage ribs / hoops (lifted for silhouette)
    rust:0x644428, rustDk:0x442e1b,
    chain:0x545659, chainDk:0x333537,                                        // heavier chain links
    bracketStone:0x615e57, bracketDk:0x46433d,                                // the wall stub the bracket roots in
    bone:0xc2bba2, boneDk:0x938b73, boneLt:0xd6cfb4,
    disc:0x38332a, discTop:0x433d2e,
  };

  /* the cage hangs, swaying: everything above the disc is built around a swing axis. The suspension
     point is high; the cage center hangs below it, offset in +x (swaying). */
  const hangTopY = 2.30;                        // where the bracket/chain starts up high
  const swayX = 0.10;                           // the cage swings toward +x
  const cageCx = swayX, cageCy = 1.15;          // cage center (belly), off-vertical

  /* ===== 1) WALL BRACKET — a short stone wall stub at back-top with an iron arm reaching out over
     the disc, from which the chain hangs. (Roots the "off a wall" read.) ===== */
  {
    // stone wall stub at back (-z), high up
    const A=V(-0.14,hangTopY-0.10,-0.30), B=V(0.14,hangTopY-0.10,-0.30), Cc=V(0.14,hangTopY-0.10,-0.20), D=V(-0.14,hangTopY-0.10,-0.20);
    const E=V(-0.14,hangTopY+0.14,-0.30), F=V(0.14,hangTopY+0.14,-0.30), G=V(0.14,hangTopY+0.14,-0.20), H=V(-0.14,hangTopY+0.14,-0.20);
    quad(H,G,F,E,P.bracketStone,0.05); quad(Cc,G,H,D,P.bracketStone,0.05); quad(A,E,F,B,P.bracketDk,0.05);
    quad(D,H,E,A,P.bracketDk,0.05); quad(B,F,G,Cc,P.bracketDk,0.05);
    // iron bracket arm reaching out + forward to the hang point
    tube(V(0,hangTopY+0.02,-0.22), V(0,hangTopY+0.06,0.0), 0.03,0.026, 6, P.iron, {capB:{hex:P.ironLt}});
    // a small ring at the arm end the chain loops through
    const r=ring(V(0,hangTopY+0.02,0.0),V(1,0,0),0.045,0.045,8,0);
    stitch([r, ring(V(0.01,hangTopY+0.02,0.0),V(1,0,0),0.045,0.045,8,0)], ()=>P.ironLt);
  }

  /* ===== 2) CHAIN — a run of links from the bracket ring down to the cage crown, drifting to +x
     (the sway). Rendered as a few short tapered link-segments (cheap catenary, matching chain-drape
     idiom). ===== */
  {
    const top = V(0, hangTopY, 0.0);
    const crown = V(cageCx, cageCy+0.42, 0.0);   // cage top
    const segs = 5;
    for(let i=0;i<segs;i++){
      const a = top.clone().lerp(crown, i/segs);
      const b = top.clone().lerp(crown, (i+1)/segs);
      tube(a, b, 0.028, 0.028, 5, i%2?P.chain:P.chainDk);
      // a cross-link nub every other segment (chain read)
      if(i%2===0){ const m=a.clone().lerp(b,0.5);
        tube(V(m.x-0.03,m.y,m.z), V(m.x+0.03,m.y,m.z), 0.014,0.014,4, P.chainDk); }
    }
  }

  /* ===== 3) THE CAGE — a bulging teardrop of vertical ribs bound by hoops. Domed crown where the
     chain meets, bulging belly, tapering to a small floor plate. Built around (cageCx, cageCy). ===== */
  const ribCount = 7;
  const hoops = [                             // {y-offset from cageCy, radius}
    {dy:0.42, r:0.05},                        // crown (narrow)
    {dy:0.24, r:0.19},
    {dy:0.02, r:0.26},                        // belly (widest)
    {dy:-0.22,r:0.20},
    {dy:-0.40,r:0.09},                        // floor (narrow)
  ];
  {
    // vertical ribs — each a poly-line through the hoop radii at its angular slot
    for(let k=0;k<ribCount;k++){
      const ang = (k/ribCount)*Math.PI*2;
      const pts = hoops.map(h=>V(cageCx + Math.cos(ang)*h.r, cageCy + h.dy, Math.sin(ang)*h.r));
      for(let s=0;s<pts.length-1;s++)
        tube(pts[s], pts[s+1], 0.020, 0.020, 4, k%2?P.iron:P.ironDk);
    }
    // hoop rings binding the ribs at each level
    for(const h of hoops){
      const a=ring(V(cageCx,cageCy+h.dy-0.012,0),V(0,1,0), h.r, h.r, 12, 0);
      const b=ring(V(cageCx,cageCy+h.dy+0.012,0),V(0,1,0), h.r, h.r, 12, 0);
      stitch([a,b], ()=>P.ironDkr);
    }
    // domed crown cap where the chain meets
    const crownR=ring(V(cageCx,cageCy+0.42,0),V(0,1,0),0.05,0.05,ribCount,0);
    capFan(crownR, V(cageCx,cageCy+0.50,0), P.ironLt);
    // small floor plate
    const floorR=ring(V(cageCx,cageCy-0.40,0),V(0,1,0),0.09,0.09,ribCount,0);
    capFan(floorR, V(cageCx,cageCy-0.44,0), P.ironDk, true);
    // rust wash on two ribs
    for(const k of [1,4]){
      const ang=(k/ribCount)*Math.PI*2;
      const b1=hoops[1], b3=hoops[3];
      const p1=V(cageCx+Math.cos(ang)*b1.r*1.03, cageCy+b1.dy, Math.sin(ang)*b1.r*1.03);
      const p3=V(cageCx+Math.cos(ang)*b3.r*1.03, cageCy+b3.dy, Math.sin(ang)*b3.r*1.03);
      quad(V(p1.x-0.012,p1.y,p1.z), V(p1.x+0.012,p1.y,p1.z), V(p3.x+0.012,p3.y,p3.z), V(p3.x-0.012,p3.y,p3.z), k===1?P.rust:P.rustDk, 0.06);
    }
  }

  /* ===== 4) BONES in the bottom — a couple of pale long-bones + a skull nub piled on the floor
     plate (the "bone-filled" tell). ===== */
  {
    const fy = cageCy - 0.36, fz = 0.0, fx = cageCx;
    // two crossed long-bones
    tube(V(fx-0.10,fy,fz-0.03), V(fx+0.08,fy+0.02,fz+0.05), 0.022,0.020,5, P.bone);
    tube(V(fx-0.06,fy+0.01,fz+0.05), V(fx+0.10,fy,fz-0.04), 0.020,0.018,5, P.boneDk);
    blob(fx-0.10,fy,fz-0.03, 0.032,0.03,0.032, P.boneLt,6,3);
    blob(fx+0.10,fy,fz-0.04, 0.032,0.03,0.032, P.boneLt,6,3);
    // a small skull nub resting in the pile
    const skz=fz-0.02;
    const dome=blob(fx+0.02, fy+0.05, skz, 0.055,0.05,0.05, P.bone,7,3);
    dome; // (kept for readability)
    for(const ex of [-0.02,0.02])
      quad(V(fx+0.02+ex-0.014,fy+0.055,skz+0.045), V(fx+0.02+ex+0.014,fy+0.055,skz+0.045),
           V(fx+0.02+ex+0.011,fy+0.03,skz+0.043), V(fx+0.02+ex-0.011,fy+0.03,skz+0.043), 0x161310, 0.03);
  }

  /* base disc — shared style (r=0.42). Darker crypt-floor tone. The cage hangs above it. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
