/* dev/model-qa/creatures/prop-well.js — the WELL: a stone SET PIECE (whole-object prop).
   Not a creature — no eyes, no grip. One function, one geometry frame, no anchors. The read:
   a stone well you could draw water from (or drop something into). Tells:
     - a CIRCULAR stone RIM (~0.7u diameter ring of blocky segments, ~0.45u tall) — the well mouth
     - a DARK VOID top face (the open shaft dropping into black) inside the rim
     - TWO WOODEN POSTS rising past the rim, bearing a CROSS-BEAM over the mouth
     - a small ROPE + BUCKET hanging from the beam down over the mouth
   VS-desaturated: cold stone greys for the rim, warm weathered browns for the timber + bucket.
   Scale reference: figures ~1.5u; the rim tops ~0.5u (knee-to-waist height), the beam ~1.3u.
   Imported by prop-well-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildWell(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    stone:0x726f67, stoneDk:0x484540, stoneDkr:0x33312d, stoneLt:0x938f83,   // rim blocks (wide value gap = coursed masonry reads)
    moss:0x556149, mossDk:0x3f492f,                                          // damp green weathering
    chip:0xa5a195,                                                           // pale broken edge
    voidTop:0x0d0b09, voidRim:0x1c1815,                                      // the black shaft mouth
    wood:0x6b5334, woodDk:0x4c3b24, woodLt:0x84683f,                         // posts + beam (aged timber)
    rope:0x9a875e, ropeDk:0x6f5f3f,                                          // hemp rope
    bucket:0x5a4428, bucketDk:0x3f2f1b, iron:0x54524d,                       // wooden bucket + iron band
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ===== RIM — a circular wall of BLOCKY stone segments (a low cylinder built from n trapezoid
     blocks so it reads as coursed masonry, not a smooth tube). Outer r ~0.35, inner r ~0.24,
     from y0 to y1. The inner wall + a dark annular top face frame the void shaft. ===== */
  const N = 12;                          // masonry segments
  const rO = 0.35, rI = 0.235;
  const y0 = 0.055, y1 = 0.50;           // rim base (on disc) to rim top ~0.45u tall
  {
    const outT = ring(V(0,y1,0), V(0,1,0), rO, rO, N);
    const outB = ring(V(0,y0,0), V(0,1,0), rO, rO, N);
    const inT  = ring(V(0,y1,0), V(0,1,0), rI, rI, N);
    const inB  = ring(V(0,y0,0), V(0,1,0), rI, rI, N);
    // OUTER wall — alternate two greys per segment so courses read as blocks
    for(let i=0;i<N;i++){ const j=(i+1)%N;
      const hex = (i&1)?P.stone:P.stoneDk;
      quad(outB[i], outB[j], outT[j], outT[i], hex, 0.05);
    }
    // INNER wall (darker — in shadow down the shaft)
    for(let i=0;i<N;i++){ const j=(i+1)%N;
      quad(inT[i], inT[j], inB[j], inB[i], P.stoneDkr, 0.05);
    }
    // TOP annular coping — the flat stone ring you'd lean on (lit)
    for(let i=0;i<N;i++){ const j=(i+1)%N;
      const hex = (i&1)?P.stoneLt:P.stone;
      quad(inT[i], inT[j], outT[j], outT[i], hex, 0.05);
    }
    // BOTTOM ring closes the base to the disc (shadow)
    for(let i=0;i<N;i++){ const j=(i+1)%N;
      quad(outB[j], outB[i], inB[i], inB[j], P.stoneDkr, 0.05);
    }
    // the DARK VOID — a black cap across the inner mouth, dropped slightly so it reads as a hole
    const voidR = ring(V(0,y1-0.06,0), V(0,1,0), rI-0.005, rI-0.005, N);
    capFan(voidR, V(0,y1-0.10,0), P.voidTop);          // fan down to a dark point = a shaft into black
    // a thin darker inner-lip ring so the void edge reads crisp
    for(let i=0;i<N;i++){ const j=(i+1)%N;
      quad(inT[i], inT[j], voidR[j], voidR[i], P.voidRim, 0.03);
    }
    // MOSS + a couple of chipped facets on the outer rim (weathering)
    quad(outB[2], outB[3], outT[3], outT[2], P.moss, 0.06);
    quad(outB[7], outB[8], outT[8], outT[7], P.mossDk, 0.06);
    quad(outT[5], V(outT[5].x*0.95,y1-0.07,outT[5].z*0.95), outT[6], outT[6], P.chip, 0.03);
  }

  /* ===== TWO WOODEN POSTS — square-ish timber uprights on opposite sides of the rim (left/right,
     along x), rising well above it to carry the beam. Rooted just outside the rim. ===== */
  const postX = rO + 0.02;               // just outside the rim
  const postTopY = 1.28;                 // beam height
  function post(sign){
    const bx = sign*postX;
    // a squared timber: 4 tapering bands (slightly narrower up top) so it reads as a hewn post
    stack([
      {y:y0-0.01, rx:0.055, rz:0.055, cx:bx, cz:0, hex:P.woodDk},
      {y:0.55,    rx:0.050, rz:0.050, cx:bx, cz:0, hex:P.wood},
      {y:postTopY,rx:0.045, rz:0.045, cx:bx, cz:0, hex:P.wood},
    ], 4, {phase:Math.PI/4, capTop:{hex:P.woodLt, lift:0.01}});   // phase π/4 = square cross-section
    // a lit face streak down the front of the post
    quad(V(bx-0.03,y0,0.052), V(bx+0.03,y0,0.052), V(bx+0.028,postTopY-0.05,0.046), V(bx-0.028,postTopY-0.05,0.046), P.woodLt, 0.04);
  }
  post(-1); post(+1);

  /* ===== CROSS-BEAM — a horizontal timber spanning the two post tops (along x), the windlass bar
     the rope hangs from. A square beam slightly above the post caps. ===== */
  {
    const by = postTopY + 0.02, hw = postX + 0.05, th = 0.045;
    // build as a box along x
    const A=V(-hw,by-th,-th), B=V(hw,by-th,-th), Cc=V(hw,by-th,th), D=V(-hw,by-th,th);
    const E=V(-hw,by+th,-th), F=V(hw,by+th,-th), G=V(hw,by+th,th), H=V(-hw,by+th,th);
    quad(H,G,F,E, P.woodLt, 0.05);   // top
    quad(A,B,Cc,D, P.woodDk, 0.05);  // bottom
    quad(Cc,G,H,D, P.wood, 0.05);    // front (+z)
    quad(A,E,F,B, P.woodDk, 0.05);   // back (-z)
    quad(D,H,E,A, P.woodDk, 0.05);   // left cap
    quad(B,F,G,Cc, P.woodDk, 0.05);  // right cap
    // a peg detail on the front where the rope would spool
    tube(V(0,by,th), V(0,by,th+0.05), 0.012,0.010,5, P.woodDk, {capB:{hex:P.woodLt}});
  }

  /* ===== ROPE + BUCKET — a rope dropping from the beam center, over the mouth, to a small wooden
     bucket hanging above (not yet in) the void. ===== */
  {
    const beamY = postTopY + 0.02;
    const bucketTopY = 0.74, bucketBotY = 0.58;   // bucket hangs just above the rim top, over the mouth
    const rx = 0.02;                              // slight offset so rope isn't dead-center-on-axis
    // rope: beam → bucket handle (a thin tube)
    tube(V(rx,beamY-0.03,0.0), V(rx,bucketTopY+0.10,0.0), 0.010,0.010,5, P.rope, {capA:{hex:P.ropeDk}});
    // bucket HANDLE — a thin iron arc over the bucket (two short posts + a tiny top bar)
    tube(V(rx,bucketTopY+0.10,0.0), V(rx-0.06,bucketTopY,0.0), 0.008,0.006,4, P.iron);
    tube(V(rx,bucketTopY+0.10,0.0), V(rx+0.06,bucketTopY,0.0), 0.008,0.006,4, P.iron);
    // BUCKET — a small tapering wooden tub with two iron bands
    stack([
      {y:bucketBotY,        rx:0.055, rz:0.055, cx:rx, cz:0, hex:P.bucketDk},
      {y:bucketBotY+0.06,   rx:0.065, rz:0.065, cx:rx, cz:0, hex:P.bucket},
      {y:bucketTopY,        rx:0.075, rz:0.075, cx:rx, cz:0, hex:P.bucket},
    ], 8, {phase:Math.PI/8, capBot:{hex:P.bucketDk, lift:0.0}});
    // two iron band rings on the bucket
    for(const yb of [bucketBotY+0.02, bucketTopY-0.02]){
      const rr = 0.056 + (yb-bucketBotY)*0.11;
      const a=ring(V(rx,yb,0),V(0,1,0),rr+0.004,rr+0.004,8,Math.PI/8);
      const b=ring(V(rx,yb+0.012,0),V(0,1,0),rr+0.004,rr+0.004,8,Math.PI/8);
      stitch([a,b],()=>P.iron);
    }
    // dark bucket interior (a small dark cap just inside the top rim)
    const inR = ring(V(rx,bucketTopY-0.006,0),V(0,1,0),0.066,0.066,8,Math.PI/8);
    capFan(inR, V(rx,bucketTopY-0.04,0), P.voidRim);
  }

  /* base disc — shared style (r=0.42). Stone tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
