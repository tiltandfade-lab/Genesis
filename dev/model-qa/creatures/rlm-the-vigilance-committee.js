/* dev/model-qa/creatures/rlm-the-vigilance-committee.js — THE VIGILANCE COMMITTEE (frontier,
   fused-mass horror, Large, CR 14). Read: a fused mass of hooded, rope-scarred figures
   moving as one — several robed silhouettes melted shoulder-to-shoulder into a single wide
   standing body, each head still individually hooded, ropes/nooses looping between and
   around the fused figures like binding cords, one central pair of arms rising from the
   mass. Frontier register: dry burlap hoods, sun-bleached rope, dusty judge-black robes.
   NO eye quads — hollow hood-shadow faces, no face detail beyond dark cavities. Whole-
   object grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheVigilanceCommittee(){
  /* ---------- PALETTE (VS desaturated; dusty judge-black robes, sun-bleached burlap/rope) --- */
  const P = {
    robe:0x2c2925, robeDk:0x1a1815, robeLt:0x3e3a34,
    burlap:0xa89572, burlapDk:0x7a6a4e,
    rope:0xc4b48a, ropeDk:0x8f8261,
    skinShadow:0x1a1712,
    disc:0x4a4038, discTop:0x585047,
  };

  const baseY = 0.06;

  /* ---------- FUSED BODY MASS — a wide standing body made of 3 melted robed silhouettes ---- */
  const bodySpecs=[
    {cx:-0.28, cz:0.02, scaleTop:0.92},
    {cx:0.00,  cz:0.06, scaleTop:1.05},
    {cx:0.28,  cz:0.00, scaleTop:0.88},
  ];
  for(const bs of bodySpecs){
    const bands=[
      {y:baseY,       rx:0.24, rz:0.20, hex:P.robeDk},
      {y:baseY+0.30,  rx:0.27, rz:0.22, hex:P.robe},
      {y:baseY+0.65,  rx:0.25*bs.scaleTop, rz:0.21*bs.scaleTop, hex:P.robe},
      {y:baseY+0.95,  rx:0.19*bs.scaleTop, rz:0.17*bs.scaleTop, hex:P.robeLt},
    ];
    const n=9, ph=Math.PI/n;
    const rings=bands.map(b=>ring(V(bs.cx,b.y,bs.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    if(bs.cx!==0) capFan(rings.at(-1), V(bs.cx,baseY+1.0,bs.cz), P.robeLt); /* only the flanking bodies cap here — center rises to a head */
  }
  /* seam quads bridging the three fused torsos so they read as ONE mass, not three separate */
  quad(V(-0.14,baseY+0.15,0.10), V(0.14,baseY+0.15,0.10), V(0.12,baseY+0.85,0.10), V(-0.12,baseY+0.85,0.10), P.robeDk, 0.03);
  quad(V(-0.42,baseY+0.15,0.06), V(-0.14,baseY+0.15,0.10), V(-0.12,baseY+0.80,0.10), V(-0.40,baseY+0.80,0.06), P.robeDk, 0.03);
  quad(V(0.14,baseY+0.15,0.10), V(0.42,baseY+0.15,0.06), V(0.40,baseY+0.80,0.06), V(0.12,baseY+0.80,0.10), P.robeDk, 0.03);

  /* ---------- THREE HOODED HEADS, each with hollow hood-shadow, cavity face ---------- */
  const hood=(cx, cz, hy, scale)=>{
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:hy,        rx:0.13*scale, rz:0.12*scale, hex:P.burlapDk},
      {y:hy+0.10,   rx:0.16*scale, rz:0.145*scale, hex:P.burlap},
      {y:hy+0.20,   rx:0.12*scale, rz:0.11*scale, hex:P.burlapDk},
      {y:hy+0.27,   rx:0.055*scale, rz:0.05*scale, hex:P.burlapDk},
    ];
    const rings=bands.map(b=>ring(V(cx,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(cx,hy+0.29,cz), P.burlapDk);
    /* hollow hood-shadow face — a dark recessed cavity, no eyes/features */
    quad(V(cx-0.07*scale,hy+0.16,cz+0.10*scale), V(cx+0.07*scale,hy+0.16,cz+0.10*scale),
         V(cx+0.06*scale,hy+0.03,cz+0.11*scale), V(cx-0.06*scale,hy+0.03,cz+0.11*scale), P.skinShadow, 0.02);
  };
  hood(-0.28, 0.10, baseY+1.02, 0.88);
  hood( 0.00, 0.14, baseY+1.32, 1.05);
  hood( 0.28, 0.08, baseY+0.98, 0.85);

  /* ---------- ROPE/NOOSE cords looping between and around the fused figures ---------- */
  {
    const ropeLoop=(a,b,sag)=>{
      const mid=a.clone().lerp(b,0.5).add(V(0,-sag,0));
      tube(a, mid, 0.020, 0.024, 5, P.rope);
      tube(mid, b, 0.024, 0.020, 5, P.ropeDk);
    };
    ropeLoop(V(-0.28,baseY+1.05,0.20), V(0.00,baseY+1.20,0.24), 0.12);
    ropeLoop(V(0.00,baseY+1.20,0.24), V(0.28,baseY+1.02,0.16), 0.12);
    ropeLoop(V(-0.40,baseY+0.55,0.10), V(0.40,baseY+0.55,0.06), 0.30);
    /* a hanging noose loop off the central head — grim signature detail */
    {
      const nb=V(0.10,baseY+1.30,0.20), nt=V(0.10,baseY+1.05,0.24);
      const nring=ring(nb, V(0,1,0), 0.06, 0.06, 8, Math.PI/8);
      const nring2=ring(nt, V(0,1,0), 0.05, 0.05, 8, Math.PI/8);
      stitch([nring,nring2], ()=>P.rope);
      tube(V(0.10,baseY+1.45,0.20), nb, 0.018,0.020,5,P.ropeDk);
    }
  }

  /* ---------- ONE CENTRAL PAIR OF ARMS rising from the mass, rope-scarred wrists ---------- */
  {
    const S=V(-0.16, baseY+1.10, 0.10), E=V(-0.30,baseY+0.85,0.24), W=V(-0.34,baseY+0.60,0.30);
    tube(S,E,0.075,0.058,6,P.robe);
    tube(E,W,0.055,0.042,6,P.robeDk);
    tube(W, W.clone().add(V(-0.02,-0.10,0.05)), 0.040,0.032,6,P.burlapDk,{capB:{hex:P.skinShadow,lift:0.01}});
    /* rope binding scar wrapped around the forearm */
    quad(V(-0.31,baseY+0.72,0.26), V(-0.27,baseY+0.72,0.28), V(-0.25,baseY+0.68,0.26), V(-0.29,baseY+0.68,0.24), P.rope, 0.04);

    const S2=V(0.16, baseY+1.10, 0.10), E2=V(0.30,baseY+0.85,0.24), W2=V(0.34,baseY+0.60,0.30);
    tube(S2,E2,0.075,0.058,6,P.robe);
    tube(E2,W2,0.055,0.042,6,P.robeDk);
    tube(W2, W2.clone().add(V(0.02,-0.10,0.05)), 0.040,0.032,6,P.burlapDk,{capB:{hex:P.skinShadow,lift:0.01}});
    quad(V(0.27,baseY+0.72,0.28), V(0.31,baseY+0.72,0.26), V(0.29,baseY+0.68,0.24), V(0.25,baseY+0.68,0.26), P.rope, 0.04);
  }

  /* ---------- fused robe hem at the base, wide skirt of the mass ---------- */
  {
    const n=16, ph=Math.PI/n;
    const hem0=ring(V(0,baseY-0.02,0.02), V(0,1,0), 0.52, 0.44, n, ph);
    const hem1=ring(V(0,baseY+0.18,0.02), V(0,1,0), 0.46, 0.38, n, ph);
    stitch([hem0,hem1], ()=>P.robeDk);
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.052,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.055,0), P.discTop);
  }
}
