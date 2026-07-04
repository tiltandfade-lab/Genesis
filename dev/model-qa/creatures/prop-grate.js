/* dev/model-qa/creatures/prop-grate.js — the DRAINAGE GRATE: a dungeon floor SET PIECE (whole-object
   prop). Not a creature — no eyes, no grip. One function, one geometry frame, no anchors. The read:
   an iron drain grate set (raised) in the floor over a dark drop — rusted, half-blocked with muck.
   A LOW, mostly-flat footprint prop (it's a floor feature) but RAISED on a stone rim so it reads as
   an object, not a decal (the "raised" variant is what earns a model — a flush grate is env-FX).
   Sits on the shared base disc (r=0.42).
   Tells:
     - a square STONE RIM / kerb framing a sunken socket (the drain mouth)
     - a dark VOID inside/below (the shaft the water drains into)
     - an IRON GRATE of parallel bars + a couple of cross-bars set into the rim, RAISED slightly proud
     - RUST staining the bars, and a MUCK/silt BLOCKAGE clogging one corner (the "blocked" tell)
   VS-desaturated: cold weathered stone rim, dark rust-eaten iron bars, near-black void, grey-green muck.
   Scale reference: figures ~1.5u; the rim tops ~0.2u (ankle height — it's underfoot). Low + wide.
   Imported by prop-grate-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGrate(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    stone:0x6d6a62, stoneDk:0x4e4b45, stoneDkr:0x35332e, stoneLt:0x88857a,    // rim / kerb
    iron:0x494b4e, ironDk:0x2d2e30, ironLt:0x62656a, ironDkr:0x1e1f20,        // grate bars (lifted so they pop)
    rust:0x664529, rustDk:0x462f1c,                                          // rust wash
    voidDk:0x100e0b, voidMid:0x201c16,                                       // the drain shaft void
    muck:0x4a4d3a, muckDk:0x33362a,                                          // silt/muck blockage (grey-green)
    disc:0x3a352b, discTop:0x46402f,
  };

  /* box helper (closed rectangular stone block, 3-tone) */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05); quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05); quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);  quad(Cc,G,H,D, top, 0.05);
  }

  const rimY0 = 0.055, rimY1 = 0.22;           // rim ~0.16u tall (raised)
  const outer = 0.34, inner = 0.24;            // rim outer/inner half-extent

  /* ===== 1) STONE RIM — a square kerb (4 walls) framing the sunken drain mouth. Slightly proud of
     the floor (raised). Built as 4 boxes around the socket. ===== */
  // -z and +z walls (run along x)
  box(-outer, outer, rimY0, rimY1, -outer, -inner, P.stoneLt, P.stone, P.stoneDkr);
  box(-outer, outer, rimY0, rimY1,  inner,  outer, P.stoneLt, P.stone, P.stoneDkr);
  // -x and +x walls (run along z, between the above)
  box(-outer, -inner, rimY0, rimY1, -inner, inner, P.stone, P.stoneDk, P.stoneDkr);
  box( inner,  outer, rimY0, rimY1, -inner, inner, P.stone, P.stoneDk, P.stoneDkr);
  // a chipped facet on a front rim corner
  quad(V(outer,rimY1,inner), V(outer,rimY1-0.05,inner), V(outer-0.06,rimY1,inner), V(outer-0.06,rimY1,inner), P.stoneLt, 0.03);

  /* ===== 2) THE VOID — the dark socket the grate sits over. A dark floor set BELOW the rim top, so
     looking down through the bars you see black (the drain shaft). ===== */
  {
    const vy = rimY0 + 0.02;
    quad(V(-inner,vy,-inner), V(inner,vy,-inner), V(inner,vy,inner), V(-inner,vy,inner), P.voidDk, 0.03);
    // a slightly-lighter inner-wall band so the socket has depth (the near lip of the shaft)
    for(const [a,b] of [[V(-inner,rimY1,inner),V(inner,rimY1,inner)],
                        [V(inner,rimY1,-inner),V(-inner,rimY1,-inner)]]){
      const ad=V(a.x,vy,a.z*0.98), bd=V(b.x,vy,b.z*0.98);
      quad(a,b,bd,ad, P.voidMid, 0.03);
    }
  }

  /* ===== 3) THE IRON GRATE — parallel bars spanning the socket (along x), plus 2 cross-bars, set
     RAISED just at/proud of the rim top. Rust-eaten. This is the read that says "grate," so bars are
     lifted-value iron against the black void. ===== */
  {
    const gy = rimY1 - 0.015;                  // grate sits just below rim top, proud of the void
    const th = 0.022;
    const barZs = [-0.17, -0.085, 0.0, 0.085, 0.17];   // 5 parallel bars running along x
    for(let i=0;i<barZs.length;i++){
      const bz = barZs[i];
      tube(V(-inner+0.01, gy, bz), V(inner-0.01, gy, bz), th, th, 5, i%2?P.iron:P.ironDk);
    }
    // 2 cross-bars (running along z) binding them
    for(const bx of [-0.10, 0.10]){
      tube(V(bx, gy+0.008, -inner+0.01), V(bx, gy+0.008, inner-0.01), th*0.9, th*0.9, 5, P.ironDkr);
    }
    // RUST wash on a couple of bars (thin warm-dark quads along the top of two bars)
    for(const bz of [-0.17, 0.0]){
      quad(V(-inner+0.02,gy+th,bz-0.008), V(inner-0.02,gy+th,bz-0.008),
           V(inner-0.02,gy+th,bz+0.008), V(-inner+0.02,gy+th,bz+0.008), bz<0?P.rust:P.rustDk, 0.06);
    }
  }

  /* ===== 4) MUCK BLOCKAGE — a silt/muck clog gathered over one corner of the grate (the "blocked"
     tell): a low lumpy grey-green blob half-burying the bars in the front-right corner. ===== */
  {
    const mx = 0.13, mz = 0.14, my = rimY1 - 0.01;
    const m = blob(mx, my, mz, 0.10, 0.05, 0.09, P.muck, 7, 3);
    // flatten the top (it's a spread of muck, not a ball)
    m.forEach((rg,k)=>{ if(k>=2) rg.forEach(p=>{ p.y = Math.min(p.y, my+0.04); }); });
    // a darker wet core
    blob(mx+0.02, my+0.005, mz-0.01, 0.055, 0.03, 0.05, P.muckDk, 6, 3);
  }

  /* base disc — shared style (r=0.42). Stone tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
