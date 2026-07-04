/* dev/model-qa/creatures/prop-refuse.js — the REFUSE PILE / CRUMBLED MASONRY: a dungeon floor SET
   PIECE (whole-object prop). Not a creature — no eyes, no grip. One function, one geometry frame, no
   anchors. Replaces the cuboid rubble-scatter read with a bespoke HEAP: a mound of fallen masonry
   (broken blocks, a snapped column drum, cracked slabs) mixed with dungeon REFUSE (bone shards, a
   broken pot, splintered wood, dead leaves/muck) — cover a figure crouches behind. Sits on the shared
   base disc (r=0.42). A LOW, WIDE mound (chest height at its peak).
   Tells:
     - a MOUND silhouette (not a scatter of identical cubes): a big broken block + a tumbled column
       drum as the bulk, smaller cracked slabs and chips heaped around/on them, sizes varying widely
     - dungeon REFUSE dressing woven in: a cracked pot half-buried, a couple of pale bone shards, a
       splintered plank, a dark muck/silt fill in the crevices
     - masonry is chipped/cracked (pale fresh-break facets), the refuse is grubbier/warmer
   VS-desaturated: weathered stone greys for the masonry, warm grubby browns + bone-pale + muck for
   the refuse. Reads at board distance as "a heap of rubble and rot," not a tidy cube stack.
   Imported by prop-refuse-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildRefuse(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    stone:0x6d6a62, stoneDk:0x504d47, stoneDkr:0x37342f, stoneLt:0x88857a,    // masonry blocks
    fresh:0xa7a08e, freshDk:0x847d6c,                                         // pale fresh-break interior
    chip:0xb2ab99,
    pot:0x7a5230, potDk:0x543821, potLt:0x94693e,                             // broken clay pot
    wood:0x5a4126, woodDk:0x3e2c19, woodLt:0x785638,                          // splintered plank
    bone:0xc0b99f, boneDk:0x928a72,                                          // bone shards
    muck:0x3f3a2c, muckDk:0x2b2720,                                          // silt/rot in the crevices
    disc:0x3a352b, discTop:0x46402f,
  };

  /* box helper — an arbitrarily-oriented broken block. Given center + half-extents + a yaw, draws a
     6-face box (top lit / sides split / bottom dark). Cheap tumbled-block workhorse. */
  function tumbledBlock(cx,cy,cz, hx,hy,hz, yaw, top,mid,dk){
    const c=Math.cos(yaw), s=Math.sin(yaw);
    const R=(x,z)=>V(cx + x*c - z*s, 0, cz + x*s + z*c);   // yaw a local (x,z) offset
    const corner=(sx,sy,sz)=>{ const p=R(sx*hx, sz*hz); return V(p.x, cy+sy*hy, p.z); };
    const A=corner(-1,-1,-1),B=corner(1,-1,-1),Cc=corner(1,-1,1),D=corner(-1,-1,1);
    const E=corner(-1,1,-1),F=corner(1,1,-1),G=corner(1,1,1),H=corner(-1,1,1);
    quad(H,G,F,E, top,0.05); quad(D,Cc,B,A, dk,0.05);
    quad(D,H,E,A, mid,0.05); quad(B,F,G,Cc, mid,0.05);
    quad(A,E,F,B, dk,0.05);  quad(Cc,G,H,D, top,0.05);
  }

  /* ===== 1) MUCK BED — a low dark spread under the heap (silt/rot the rubble sits in), so the pile
     reads as settled into filth, not floating on the clean disc. ===== */
  {
    const y=0.06;
    quad(V(-0.36,y,-0.30),V(0.36,y,-0.28),V(0.34,y,0.34),V(-0.34,y,0.32), P.muckDk, 0.06);
    quad(V(-0.22,y+0.002,-0.16),V(0.24,y+0.002,-0.14),V(0.20,y+0.002,0.22),V(-0.20,y+0.002,0.20), P.muck, 0.05);
  }

  /* ===== 2) MASONRY BULK — the big broken block + a tumbled column drum form the mound's mass. ==== */
  // big broken block, back-left, yawed
  // big broken block — SMALLER + lower + yawed hard so it reads TUMBLED (a fallen wall-block), not a
  // clean upright cube. Two stacked half-blocks with the upper one offset = a block snapped in two.
  tumbledBlock(-0.16, 0.18, -0.04, 0.16, 0.13, 0.15, 0.55, P.stoneLt, P.stone, P.stoneDkr);
  // a broken UPPER chunk sitting askew on it (offset + smaller + different yaw = the break line reads)
  tumbledBlock(-0.10, 0.34, -0.10, 0.12, 0.09, 0.11, -0.35, P.stoneLt, P.stone, P.stoneDkr);
  // pale fresh-break facets along the snap between them (the exposed broken interior)
  quad(V(-0.28,0.30,-0.12),V(-0.06,0.33,-0.16),V(-0.02,0.28,0.06),V(-0.24,0.26,0.10), P.fresh, 0.06);
  quad(V(-0.06,0.33,-0.16),V(0.10,0.34,-0.10),V(0.08,0.30,0.02),V(-0.02,0.28,0.06), P.freshDk, 0.06);

  // tumbled COLUMN DRUM lying on its side, front-right (a fat cylinder = unmistakable masonry)
  {
    const dr=0.145, a=V(0.06,0.06+dr,0.20), b=V(0.34,0.06+dr,0.06);   // lies diagonally
    const axis=new THREE.Vector3().subVectors(b,a).normalize();
    const m=8;
    const ra=ring(a,axis,dr,dr,m,0), rb=ring(b,axis,dr,dr,m,0);
    for(let i=0;i<m;i++){ const i2=(i+1)%m;
      const sh=(i%3===0)?P.stoneLt:(i%3===1?P.stone:P.stoneDk);
      quad(ra[i],ra[i2],rb[i2],rb[i], sh, 0.04); }
    capFan(ra, V(a.x-axis.x*0.02,a.y,a.z-axis.z*0.02), P.stoneDk, true);   // weathered end
    // fresh-break jagged end on the other side
    const jr=ring(b,axis,dr,dr,m,0); jr.forEach((p,i)=>{ p.x+=((i&1)?0.03:-0.02); });
    const c=V(b.x+axis.x*0.05,b.y,b.z+axis.z*0.05);
    for(let i=0;i<m;i++){ const i2=(i+1)%m; quad(jr[i2],jr[i],c,c, (i&1)?P.fresh:P.freshDk, 0.06); }
  }

  /* ===== 3) SMALLER CRACKED SLABS + CHIPS — heaped around/on the bulk at varying sizes (the size
     variety is what kills the "identical cubes" read). ===== */
  tumbledBlock( 0.20, 0.16,-0.18, 0.11,0.07,0.09,-0.5, P.stoneLt,P.stone,P.stoneDkr);   // slab, back-right
  tumbledBlock(-0.26, 0.12, 0.16, 0.09,0.06,0.07, 0.8, P.stone,P.stoneDk,P.stoneDkr);   // chip, front-left
  tumbledBlock( 0.02, 0.42,-0.10, 0.07,0.05,0.06, 0.2, P.stoneLt,P.stone,P.stoneDk);    // chip perched on the bulk

  /* ===== 4) REFUSE DRESSING — the rot that makes it a REFUSE pile, not just rubble. ===== */
  // broken clay POT half-buried, front-center (a bulged blob body sliced open at the top)
  {
    const px=0.0, py=0.14, pz=0.22;
    const body=blob(px,py,pz, 0.09,0.10,0.09, P.pot, 8, 4);
    // shear the top rings open (broken pot mouth) + a dark interior
    body.forEach((rg,k)=>{ if(k>=3) rg.forEach((p,i)=>{ if(i>4) p.y-=0.05; }); });
    // lit shard highlight + a jagged broken rim
    quad(V(px-0.03,py-0.06,pz+0.09),V(px+0.03,py-0.06,pz+0.09),V(px+0.025,py+0.05,pz+0.085),V(px-0.025,py+0.05,pz+0.085), P.potLt, 0.05);
    const inR=ring(V(px,py+0.06,pz),V(0,1,0),0.06,0.06,8,0); capFan(inR,V(px,py+0.02,pz),P.muckDk);
  }
  // splintered PLANK jutting out of the heap (diagonal, front-right)
  {
    const a=V(0.10,0.10,0.28), b=V(0.30,0.30,0.14);
    tube(a,b,0.03,0.024,4, P.wood, {capB:{hex:P.woodLt}});
    // a splintered pale end
    quad(V(0.29,0.29,0.13),V(0.32,0.31,0.12),V(0.33,0.33,0.16),V(0.30,0.31,0.17), P.woodLt, 0.05);
  }
  // a couple of pale BONE shards poking out
  tube(V(-0.20,0.10,0.02),V(-0.12,0.18,-0.06), 0.018,0.014,4, P.bone, {capB:{hex:P.boneDk}});
  tube(V(0.16,0.08,0.10),V(0.22,0.14,0.16), 0.016,0.012,4, P.boneDk, {capB:{hex:P.bone}});

  /* base disc — shared style (r=0.42). Stone tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
