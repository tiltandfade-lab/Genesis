/* dev/model-qa/creatures/rlm-rope-fanged-pit-viper.js — ROPE-FANGED PIT VIPER
   (lost-world, Tiny Beast, CR 0.125). Read: a small thin coiled viper, "rope-like" —
   a slender low coil (much thinner/smaller than the dune fang serpent), small triangular
   head with fangs, hidden/nested posture (low, flat, tucked). VS-desaturated pale dusty
   grey-tan (false-bottomed coffin register — wood-dust pale). Whole-object grammar: one
   function, one frame, no anchors. Tiny size, base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRopeFangedPitViper(){
  const P = {
    scale:0x9a8c68, scaleDk:0x6e6248, scaleLt:0xb4a680,
    band:0x584c34, belly:0xcabf98, bellyDk:0x9c9270,
    fang:0xe8e0c0, mouth:0x241c14, tongue:0x7a3230,
    disc:0x4a4038, discTop:0x585047,
  };

  /* THIN ROPE-LIKE COIL — a slender flat loop, low and tight, tucked (false-bottom hidden) */
  const coilY = 0.05;
  const coilPts = [
    V(0.14, coilY, 0.06), V(0.16, coilY+0.005, -0.08), V(0.08, coilY+0.01, -0.16),
    V(-0.05, coilY+0.01, -0.15), V(-0.14, coilY+0.005, -0.04), V(-0.13, coilY, 0.08),
    V(-0.02, coilY-0.005, 0.15),
  ];
  const rad = [0.030,0.034,0.032,0.028,0.025,0.022,0.018];
  for(let i=0;i<coilPts.length-1;i++){
    const hex = (i%2===0)? P.scale : P.scaleDk;
    tube(coilPts[i], coilPts[i+1], rad[i], rad[i+1], 6, hex, {phase:Math.PI/6});
  }
  /* thin dark banding rings along the rope-body (classic viper bands, small scale) */
  for(let i=0;i<coilPts.length-1;i+=2){
    const a=coilPts[i], b=coilPts[i+1];
    const mx=(a.x+b.x)/2, mz=(a.z+b.z)/2, my=(a.y+b.y)/2+0.02;
    quad(V(mx-0.015,my,mz-0.015), V(mx+0.015,my,mz-0.012), V(mx+0.006,my+0.006,mz+0.015), V(mx-0.015,my+0.006,mz+0.01), P.band, 0.05);
  }
  /* pale belly hint on the underside */
  quad(V(0.06,coilY-0.02,0.06), V(0.11,coilY-0.018,-0.02), V(0.12,coilY-0.01,0.08), V(0.07,coilY-0.01,0.12), P.belly, 0.05);

  /* small raised forebody — short rise, low profile (tiny/hidden, not reared up like the dune serpent) */
  const S = {
    root:  coilPts[0],
    rise1: V(0.19, coilY+0.05, 0.14),
    neck:  V(0.17, coilY+0.09, 0.20),
    headB: V(0.15, coilY+0.10, 0.24),
  };
  tube(S.root,  S.rise1, 0.032, 0.024, 6, P.scale,   {phase:Math.PI/6});
  tube(S.rise1, S.neck,  0.024, 0.018, 6, P.scaleDk, {phase:Math.PI/6});
  tube(S.neck,  S.headB, 0.018, 0.015, 6, P.scale,   {phase:Math.PI/6});

  /* HEAD — tiny triangular viper head, small fangs */
  {
    const n=7, ph=Math.PI/n;
    const bands=[
      {y:coilY+0.09, cz:0.24, rx:0.017, rz:0.02, hex:P.scale},
      {y:coilY+0.11, cz:0.26, rx:0.021, rz:0.026,hex:P.scaleLt},
      {y:coilY+0.12, cz:0.24, rx:0.016, rz:0.018,hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0.15,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0.15,coilY+0.13,0.235), P.scaleDk);
    const snB=V(0.15,coilY+0.08,0.27), snT=V(0.145,coilY+0.075,0.30);
    tube(snB, snT, 0.013, 0.005, n, P.scale, {raz:0.016, rbz:0.006, phase:ph, capB:{hex:P.mouth, lift:0.002}});
    quad(V(0.12,coilY+0.07,0.25), V(0.18,coilY+0.07,0.25), V(0.16,coilY+0.06,0.29), V(0.14,coilY+0.06,0.29), P.mouth, 0.03);
    /* tiny fangs */
    for(const s of [-1,1]){
      const fb=V(0.15+s*0.010,coilY+0.068,0.27);
      const ft=V(0.15+s*0.013,coilY+0.045,0.28);
      tube(fb, ft, 0.004, 0.0015, 3, P.fang, {capB:{hex:P.fang, lift:0.001}});
    }
    /* flicking tongue */
    const tR=V(0.15,coilY+0.065,0.29), tM=V(0.15,coilY+0.06,0.34);
    tube(tR, tM, 0.003, 0.002, 3, P.tongue, {capA:{hex:P.mouth}});
  }

  /* tail tip — very thin, poking briefly from the innermost coil loop */
  {
    const tt0=coilPts.at(-1);
    const tt1=V(0.03, coilY-0.01, 0.19);
    const tip=V(0.08, coilY-0.012, 0.21);
    tube(tt0, tt1, 0.016, 0.008, 5, P.scaleDk);
    tube(tt1, tip, 0.008, 0.003, 5, P.scaleDk, {capB:{hex:P.scaleDk, lift:0.002}});
  }

  /* base disc (Tiny r=0.32) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.038,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.041,0), P.discTop);
  }
}
