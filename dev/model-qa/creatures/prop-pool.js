/* dev/model-qa/creatures/prop-pool.js — the STAGNANT POOL: a dungeon floor SET PIECE (whole-object
   prop). Not a creature — no eyes, no grip. One function, one geometry frame, no anchors. The read:
   a still, dark pool of fouled water in a stone basin sunk into the floor — algae scum on the surface,
   a faint ripple, a raised stone RIM so it reads as an object (a body of water), NOT a painted floor
   decal. Sits on the shared base disc (r=0.42). A LOW piece — the water surface is near floor level.
   *** BUILD-AS-DISC-AND-RIM RULING (docs/ENV-WAVES.md): this is authored as a flat water disc + a
   raised stone rim. QA (Haiku positioning review) decides whether it reads as a pool or as a flat
   "rug" on the floor; if it reads as a rug, the orchestrator demotes it to env-FX and records the
   verdict. The author builds it honestly as geometry; the QA gate rules. ***
   Tells:
     - a raised STONE RIM / kerb ring framing a sunken socket (the pool edge — this is what fights the
       "rug" read: the rim gives it a lip and a lifted edge so it reads as a basin, not a decal)
     - a DARK WATER surface set below the rim (near-black green-brown), with a couple of faint lit
       RIPPLE rings + a dull sky-glint so it reads as liquid, not stone
     - patches of ALGAE SCUM (dull green) floating on the surface + around the rim; a little muck/silt
       staining the rim stone
   VS-desaturated: cold weathered stone rim, dark fouled-water (near-black with a green-brown cast),
   dull algae green, a faint cold glint. Imported by prop-pool-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildPool(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    stone:0x6c6960, stoneDk:0x4d4a44, stoneDkr:0x34312d, stoneLt:0x868276,    // rim
    water:0x1c241f, waterDk:0x121712, waterMid:0x28332a,                      // dark fouled water (green-brown cast)
    glint:0x4a5a52, ripple:0x38463c,                                         // faint surface glint / ripple
    algae:0x4c5c38, algaeDk:0x37431f, algaeLt:0x63763f,                       // scum green
    muck:0x3f3a2c,
    disc:0x3a352b, discTop:0x46402f,
  };

  const rimY0 = 0.055, rimY1 = 0.14;           // low raised rim (~0.09u — a lip, not a wall)
  const rOut = 0.40, rIn = 0.30;               // rim outer/inner radius
  const surfY = rimY0 + 0.045;                 // water surface set just below the rim top
  const N = 20;

  /* ===== 1) STONE RIM — a low ring of blocky stone segments (coursed) framing the pool. This is the
     anti-"rug" tell: a raised lip all around. ===== */
  {
    const outT=ring(V(0,rimY1,0),V(0,1,0),rOut,rOut,N,0);
    const outB=ring(V(0,rimY0,0),V(0,1,0),rOut,rOut,N,0);
    const inT =ring(V(0,rimY1,0),V(0,1,0),rIn,rIn,N,0);
    const inB =ring(V(0,rimY0,0),V(0,1,0),rIn,rIn,N,0);
    // outer wall (alternate greys = coursed blocks)
    for(let i=0;i<N;i++){ const j=(i+1)%N; quad(outB[i],outB[j],outT[j],outT[i], (i&1)?P.stone:P.stoneDk, 0.05); }
    // inner wall (darker — in shadow above the water)
    for(let i=0;i<N;i++){ const j=(i+1)%N; quad(inT[i],inT[j],inB[j],inB[i], P.stoneDkr, 0.05); }
    // top coping (the flat lip you'd step over) — lit
    for(let i=0;i<N;i++){ const j=(i+1)%N; quad(inT[i],inT[j],outT[j],outT[i], (i&1)?P.stoneLt:P.stone, 0.05); }
    // a couple of muck/algae stains + a chip on the rim
    quad(outB[3],outB[4],outT[4],outT[3], P.muck, 0.06);
    quad(outB[12],outB[13],outT[13],outT[12], P.algaeDk, 0.06);
    quad(outT[8], V(outT[8].x*0.95,rimY1-0.05,outT[8].z*0.95), outT[9], outT[9], P.stoneLt, 0.03);
  }

  /* ===== 2) WATER SURFACE — a dark disc set below the rim top. Faint ripple rings + a dull glint so
     it reads as still liquid, not a stone floor patch. ===== */
  {
    // the main dark water disc (near-black, green-brown cast) — a fan to a slightly-lower center so it
    // has the faintest concavity (a dish of water), which also helps it not read dead-flat.
    const surf=ring(V(0,surfY,0),V(0,1,0),rIn-0.01,rIn-0.01,N,0);
    capFan(surf, V(0,surfY-0.02,0), P.water);
    // faint concentric RIPPLE rings (thin lit bands) — surface motion read
    for(const [rr,hex] of [[rIn*0.66,P.ripple],[rIn*0.40,P.glint],[rIn*0.20,P.ripple]]){
      const a=ring(V(0,surfY+0.001,0),V(0,1,0),rr+0.008,rr+0.008,N,0);
      const b=ring(V(0,surfY+0.001,0),V(0,1,0),rr-0.008,rr-0.008,N,0);
      stitch([a,b], ()=>hex);
    }
    // a single dull cold GLINT streak off-center (a highlight the eye reads as a wet surface)
    quad(V(-0.10,surfY+0.002,0.06),V(0.02,surfY+0.002,0.10),V(0.04,surfY+0.002,0.02),V(-0.08,surfY+0.002,-0.02), P.glint, 0.04);
  }

  /* ===== 3) ALGAE SCUM — dull-green patches floating on the surface + creeping in from the rim (the
     stagnant tell). Low flat blobs a hair above the water. ===== */
  {
    const y=surfY+0.004;
    // three irregular scum mats (flat quads, wound to face up)
    quad(V(-0.22,y,-0.02),V(-0.08,y,-0.10),V(-0.02,y,0.06),V(-0.16,y,0.12), P.algae, 0.07);
    quad(V(0.06,y,0.14),V(0.20,y,0.08),V(0.24,y,-0.04),V(0.10,y,-0.02), P.algaeLt, 0.06);
    quad(V(0.02,y,-0.20),V(0.16,y,-0.22),V(0.18,y,-0.10),V(0.04,y,-0.10), P.algaeDk, 0.06);
    // a few tiny scum flecks creeping from the rim inward
    for(const [ang] of [[0.6],[2.4],[4.1],[5.2]]){
      const rr=rIn-0.05;
      const fx=Math.cos(ang)*rr, fz=Math.sin(ang)*rr;
      quad(V(fx-0.03,y,fz-0.03),V(fx+0.03,y,fz-0.02),V(fx+0.025,y,fz+0.03),V(fx-0.025,y,fz+0.025), P.algaeDk, 0.06);
    }
  }

  /* base disc — shared style (r=0.42). Stone tones. (The rim sits inside it.) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
