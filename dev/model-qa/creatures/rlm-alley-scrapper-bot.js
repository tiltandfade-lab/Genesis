/* dev/model-qa/creatures/rlm-alley-scrapper-bot.js — ALLEY SCRAPPER BOT (chrome, Small
   construct, CR 0.125). Read: a hunched junkyard salvage bot stitched from mismatched scrap
   parts — a lumpy patchwork torso of riveted panels of different metals, a hunched low
   stance, one grabber-claw arm and one crude pincer arm of different sizes, small stubby
   treads instead of legs. Chrome register: gritted-underneath — dull scrap gunmetal, faded
   rust patches, no glossy sheen. NO eye quads — a single dim sensor-lens slit instead.
   Whole-object grammar: one function, one frame, no anchors. Small size, base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildAlleyScrapperBot(){
  const P = {
    scrap:0x5c6066, scrapDk:0x383c40, scrapLt:0x767a7e,
    rust:0x6e4a34, rustDk:0x452e20,
    patch:0x848a48, patchDk:0x565c30,
    lens:0x6fd8f0, lensDk:0x1c5a68,
    rivet:0x1a1c1e, tread:0x24211d,
    disc:0x4a4038, discTop:0x585047,
  };

  /* hunched low torso — patchwork scrap panels stacked, leaning slightly forward */
  const bodyY = 0.22;
  const S = {
    base:  V(0, bodyY-0.10, 0),
    mid:   V(0, bodyY+0.06, 0.02),
    top:   V(0, bodyY+0.20, 0.05),
  };
  tube(S.base, S.mid, 0.170, 0.150, 8, P.scrap, {phase:Math.PI/8});
  tube(S.mid, S.top, 0.150, 0.100, 7, P.scrapDk, {phase:Math.PI/7, capB:{hex:P.scrapDk, lift:0.02}});

  /* mismatched panel patches riveted onto the torso, different metals */
  quad(V(-0.13,bodyY-0.06,0.12), V(0.05,bodyY-0.08,0.14), V(0.04,bodyY+0.06,0.13), V(-0.12,bodyY+0.08,0.11), P.patch, 0.06);
  quad(V(-0.02,bodyY+0.02,0.15), V(0.14,bodyY+0.00,0.14), V(0.13,bodyY+0.14,0.12), V(-0.01,bodyY+0.16,0.13), P.rust, 0.05);
  for(const [x,y] of [[-0.08,bodyY+0.01],[0.09,bodyY+0.05],[-0.02,bodyY+0.13]])
    quad(V(x-0.012,y,0.155), V(x+0.012,y,0.155), V(x+0.010,y-0.02,0.15), V(x-0.010,y-0.02,0.15), P.rivet, 0.02);

  /* head-stub — a small sensor block set low into the top of the torso, hunched forward */
  {
    const hb = V(0, bodyY+0.24, 0.10);
    const ht = V(0, bodyY+0.34, 0.14);
    tube(S.top, hb, 0.090, 0.075, 6, P.scrapDk);
    tube(hb, ht, 0.075, 0.060, 6, P.rustDk, {capB:{hex:P.rustDk, lift:0.01}});
    /* single dim sensor-lens slit, no eye quads */
    quad(V(-0.030,bodyY+0.29,0.185), V(0.030,bodyY+0.29,0.185), V(0.026,bodyY+0.27,0.19), V(-0.026,bodyY+0.27,0.19), P.lens, 0.05);
    quad(V(-0.020,bodyY+0.285,0.187), V(0.020,bodyY+0.285,0.187), V(0.017,bodyY+0.275,0.192), V(-0.017,bodyY+0.275,0.192), P.lensDk, 0.05);
  }

  /* two mismatched arms — a large grabber-claw + a small crude pincer, different sizes */
  {
    /* left: bigger grabber claw */
    const shL = V(-0.19, bodyY+0.10, 0.02);
    const elL = V(-0.28, bodyY-0.06, 0.10);
    const hnL = V(-0.24, bodyY-0.16, 0.24);
    tube(shL, elL, 0.070, 0.055, 6, P.scrap, {phase:Math.PI/6});
    tube(elL, hnL, 0.055, 0.042, 6, P.scrapDk, {phase:Math.PI/6});
    for(const s of [-1,1]){
      const cb = hnL;
      const ct = V(hnL.x+s*0.02, hnL.y-0.02, hnL.z+0.10);
      tube(cb, ct, 0.024, 0.010, 4, P.rustDk, {capB:{hex:P.rustDk, lift:0.004}});
    }

    /* right: smaller crude pincer stub */
    const shR = V(0.17, bodyY+0.08, 0.02);
    const elR = V(0.22, bodyY-0.02, 0.08);
    const hnR = V(0.20, bodyY-0.10, 0.16);
    tube(shR, elR, 0.048, 0.038, 6, P.scrapDk, {phase:Math.PI/6});
    tube(elR, hnR, 0.038, 0.026, 6, P.scrap, {phase:Math.PI/6});
    for(const s of [-1,1]){
      const ct = V(hnR.x+s*0.014, hnR.y-0.015, hnR.z+0.06);
      tube(hnR, ct, 0.015, 0.006, 4, P.rustDk, {capB:{hex:P.rustDk, lift:0.003}});
    }
  }

  /* stubby treads instead of legs — two low tread blocks flanking the base */
  {
    for(const s of [-1,1]){
      const cz0=-0.10, cz1=0.16, cx=s*0.14;
      quad(V(cx-0.06,0.03,cz0), V(cx+0.06,0.03,cz0), V(cx+0.06,0.03,cz1), V(cx-0.06,0.03,cz1), P.tread, 0.04);
      quad(V(cx-0.065,0.09,cz0-0.02), V(cx+0.065,0.09,cz0-0.02), V(cx+0.065,0.03,cz0-0.02), V(cx-0.065,0.03,cz0-0.02), P.scrapDk, 0.05);
      quad(V(cx-0.065,0.09,cz1+0.02), V(cx+0.065,0.09,cz1+0.02), V(cx+0.065,0.03,cz1+0.02), V(cx-0.065,0.03,cz1+0.02), P.scrapDk, 0.05);
      /* tread rungs */
      for(let i=0;i<4;i++){ const zz=cz0+i*0.09;
        quad(V(cx-0.065,0.045,zz), V(cx+0.065,0.045,zz), V(cx+0.065,0.03,zz+0.02), V(cx-0.065,0.03,zz+0.02), P.rustDk, 0.05); }
    }
  }

  /* base disc (Small: r=0.32) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
