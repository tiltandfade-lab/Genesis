/* dev/model-qa/creatures/prop-manacles.js — the WALL MANACLES: a dungeon SET PIECE (whole-object
   prop). Not a creature — no eyes, no grip. One function, one geometry frame, no anchors. The read:
   a section of dungeon WALL fitted with iron shackles — two manacle cuffs bolted to the stone at
   arm height, rusted CHAINS drooping from each down to open cuffs, a leg-iron ring lower down. The
   grim "prisoner was chained here" read. Wall-mounted: the piece is a stone wall slab (front face +z)
   with the ironmongery on it. Sits on the shared base disc (r=0.48 — a wall-section prop).
   Tells:
     - a STONE WALL SLAB (coursed masonry, chest-to-head height) as the mount surface
     - two IRON WRIST-CUFFS bolted to the wall at arm height (open rings on short bolt-plates),
       each trailing a drooping RUSTED CHAIN (catenary sag) ending in a dangling OPEN cuff
     - a lower LEG-IRON: a ring bolted near the floor with a short chain + ankle cuff
     - rust bleed staining the stone under each fixing; a couple of loose links on the floor
   VS-desaturated: cold weathered stone, dark rust-eaten iron (lifted so the chains read), rust streaks.
   Scale reference: figures ~1.5u; wrist cuffs ~1.0u (arm height on the wall). Wall crest ~1.5u.
   Imported by prop-manacles-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildManacles(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    stone:0x6d6a62, stoneDk:0x4e4b45, stoneDkr:0x35322e, stoneLt:0x88857a,    // wall masonry
    iron:0x4a4c4f, ironDk:0x2d2e30, ironLt:0x666a6e, ironDkr:0x1e1f20,        // cuffs / chains (lifted)
    rust:0x6a4930, rustDk:0x472f1c, rustStain:0x55392a,                       // rust bleed
    chip:0xa5a195,
    disc:0x38332a, discTop:0x433d2e,
  };

  /* box helper (closed rectangular stone block) */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05); quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05); quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);  quad(Cc,G,H,D, top, 0.05);
  }

  /* ===== 1) WALL SLAB — a coursed masonry wall, front face at +z. Spans x, thin in z. ===== */
  const wallZf = 0.10, wallZb = -0.06;         // front / back
  const spanX = 0.40, wallTop = 1.52;
  {
    const courses = 6, ch = (wallTop-0.055)/courses;
    for(let k=0;k<courses;k++){
      const y0=0.055+k*ch, y1=0.055+(k+1)*ch-0.008;
      const lit=(k&1);
      // slight per-course x jitter via inset, and alternate greys, for a laid-masonry read
      box(-spanX, spanX, y0, y1, wallZb, wallZf, lit?P.stoneLt:P.stone, lit?P.stone:P.stoneDk, P.stoneDkr);
    }
    // chipped facet + a masonry-joint shadow line down the middle
    quad(V(-0.35,1.1,wallZf+0.001), V(-0.31,1.1,wallZf+0.001), V(-0.35,1.0,wallZf+0.001), V(-0.35,1.0,wallZf+0.001), P.chip, 0.03);
    quad(V(0.0,0.10,wallZf+0.001), V(0.012,0.10,wallZf+0.001), V(0.012,wallTop-0.10,wallZf+0.001), V(0.0,wallTop-0.10,wallZf+0.001), P.stoneDkr, 0.03);
  }

  /* helper: an iron CUFF ring (open shackle) centered at c, facing +z, radius r. Two stacked rings
     make a short band; a gap is left open (the shackle isn't closed). */
  function cuff(cx,cy,cz, r){
    const a=ring(V(cx,cy,cz),V(0,0,1), r, r, 10, 0);
    const b=ring(V(cx,cy,cz+0.03),V(0,0,1), r, r, 10, 0);
    // open shackle: skip 2 segments (the gap where a wrist goes)
    stitch([a,b], (bnd,i)=>P.iron, {0:[4,5]});
  }

  /* rust-bleed streak under a wall fixing */
  function rustBleed(cx,cy){
    quad(V(cx-0.02,cy,wallZf+0.002), V(cx+0.02,cy,wallZf+0.002),
         V(cx+0.015,cy-0.22,wallZf+0.002), V(cx-0.015,cy-0.22,wallZf+0.002), P.rustStain, 0.06);
  }

  /* ===== 2) WRIST CUFFS + DROOPING CHAINS — two fixings at arm height, each: a bolt-plate on the
     wall, a short chain drooping (catenary), an open cuff at the end. Left cuff hangs lower/limp;
     right cuff a touch higher. ===== */
  const wristY = 1.08;
  for(const s of [-1,1]){
    const px = s*0.24;                         // fixing x
    // bolt-plate on the wall (a small proud iron square)
    box(px-0.035, px+0.035, wristY-0.035, wristY+0.035, wallZf-0.001, wallZf+0.03, P.ironLt, P.iron, P.ironDk);
    // a ring bolted through the plate (the anchor the chain hangs from)
    const ar=ring(V(px,wristY,wallZf+0.04),V(0,0,1),0.045,0.045,10,0);
    stitch([ar, ring(V(px,wristY,wallZf+0.065),V(0,0,1),0.045,0.045,10,0)], ()=>P.ironDkr);
    rustBleed(px, wristY-0.04);
    // DROOPING CHAIN — from the anchor ring, sagging down + outward to the dangling cuff
    const anchor = V(px, wristY-0.02, wallZf+0.05);
    const cuffPt = V(px + s*0.10, wristY - (s<0?0.42:0.34), wallZf+0.12);   // left droops lower
    const segs=4;
    for(let i=0;i<segs;i++){
      const a=anchor.clone().lerp(cuffPt,i/segs), b=anchor.clone().lerp(cuffPt,(i+1)/segs);
      // sag: pull midpoints down (catenary)
      const sag=Math.sin(((i+0.5)/segs)*Math.PI)*0.06;
      a.y-=Math.sin((i/segs)*Math.PI)*0.06; b.y-=Math.sin(((i+1)/segs)*Math.PI)*0.06;
      tube(a,b, 0.020,0.020, 4, i%2?P.iron:P.ironDk);
      if(i%2===0){ const m=a.clone().lerp(b,0.5); m.y-=sag*0.3;
        tube(V(m.x-0.022,m.y,m.z),V(m.x+0.022,m.y,m.z),0.011,0.011,4,P.ironDkr); }
    }
    // the dangling OPEN cuff at the chain end
    cuff(cuffPt.x, cuffPt.y, cuffPt.z, 0.05);
    // rust on the cuff
    quad(V(cuffPt.x-0.04,cuffPt.y+0.03,cuffPt.z+0.03),V(cuffPt.x-0.02,cuffPt.y+0.03,cuffPt.z+0.03),
         V(cuffPt.x-0.02,cuffPt.y-0.03,cuffPt.z+0.03),V(cuffPt.x-0.04,cuffPt.y-0.03,cuffPt.z+0.03), P.rust, 0.06);
  }

  /* ===== 3) LEG-IRON — a lower fixing near the floor: a ring bolted to the wall base + a short chain
     + an ankle cuff resting on the floor. ===== */
  {
    const px=-0.05, py=0.34;
    box(px-0.03,px+0.03, py-0.03,py+0.03, wallZf-0.001, wallZf+0.025, P.ironLt,P.iron,P.ironDk);
    const ar=ring(V(px,py,wallZf+0.035),V(0,0,1),0.038,0.038,10,0);
    stitch([ar, ring(V(px,py,wallZf+0.055),V(0,0,1),0.038,0.038,10,0)], ()=>P.ironDkr);
    rustBleed(px, py-0.03);
    // short chain drooping to an ankle cuff on the floor
    const anchor=V(px,py-0.02,wallZf+0.045), floorCuff=V(px+0.14,0.14,wallZf+0.16);
    const segs=3;
    for(let i=0;i<segs;i++){
      const a=anchor.clone().lerp(floorCuff,i/segs), b=anchor.clone().lerp(floorCuff,(i+1)/segs);
      tube(a,b,0.019,0.019,4, i%2?P.iron:P.ironDk);
    }
    // ankle cuff lying open on the floor
    const a=ring(floorCuff,V(0,1,0),0.05,0.05,10,0), b=ring(V(floorCuff.x,floorCuff.y+0.025,floorCuff.z),V(0,1,0),0.05,0.05,10,0);
    stitch([a,b],(bnd,i)=>P.iron,{0:[4,5]});
  }

  /* ===== 4) a couple of loose links dropped on the floor (dressing) ===== */
  for(const [lx,lz] of [[-0.24,0.20],[0.28,0.14]]){
    const a=ring(V(lx,0.09,lz),V(0,1,0),0.03,0.02,8,0), b=ring(V(lx,0.11,lz),V(0,1,0),0.03,0.02,8,0);
    stitch([a,b],()=>P.ironDk);
  }

  /* base disc — wall-section prop (r=0.48). Darker dungeon-floor tone. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
