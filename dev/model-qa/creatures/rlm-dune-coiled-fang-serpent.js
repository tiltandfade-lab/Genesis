/* dev/model-qa/creatures/rlm-dune-coiled-fang-serpent.js — DUNE-COILED FANG SERPENT
   (lost-world, Medium Beast, CR 0.25). Read: a coiled venomous serpent — no limbs, a thick
   tapering coiled body nesting in a ring, a raised alert forebody/head with hinged jaw +
   long curved fangs. VS-desaturated sand/dun scale (lost-world dust register). Whole-object
   grammar: one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildDuneCoiledFangSerpent(){
  const P = {
    scale:0x8c7a4e, scaleDk:0x655536, scaleLt:0xa89568,
    diamond:0x453a24, belly:0xc4b482, bellyDk:0x9a8a5c,
    fang:0xe8dcb8, mouth:0x2a2015, tongue:0x8a3436,
    disc:0x4a4038, discTop:0x585047,
  };

  /* COILED BODY — a ring of loft segments nested flat/low, spiraling around center, one loop */
  const coilY = 0.12;
  const coilPts = [
    V(0.22, coilY, 0.10), V(0.26, coilY+0.01, -0.10), V(0.14, coilY+0.02, -0.24),
    V(-0.08, coilY+0.02, -0.24), V(-0.22, coilY+0.01, -0.08), V(-0.20, coilY, 0.14),
    V(-0.02, coilY-0.01, 0.24),
  ];
  const rad = [0.075,0.085,0.082,0.075,0.068,0.062,0.055];
  for(let i=0;i<coilPts.length-1;i++){
    const hex = (i%2===0)? P.scale : P.scaleDk;
    tube(coilPts[i], coilPts[i+1], rad[i], rad[i+1], 7, hex, {phase:Math.PI/7});
  }
  /* diamond dorsal markings along the coil */
  for(let i=0;i<coilPts.length-1;i+=2){
    const a=coilPts[i], b=coilPts[i+1];
    const mx=(a.x+b.x)/2, mz=(a.z+b.z)/2, my=(a.y+b.y)/2+0.06;
    quad(V(mx-0.03,my,mz-0.03), V(mx+0.03,my,mz-0.02), V(mx+0.01,my+0.01,mz+0.03), V(mx-0.03,my+0.01,mz+0.02), P.diamond, 0.04);
  }

  /* RAISED FOREBODY — rises up out of the coil's start point, alert S-curve to the head */
  const S = {
    root:  coilPts[0],
    rise1: V(0.28, coilY+0.18, 0.22),
    rise2: V(0.24, coilY+0.42, 0.30),
    neck:  V(0.18, coilY+0.58, 0.28),
    headB: V(0.14, coilY+0.66, 0.32),
  };
  tube(S.root,  S.rise1, 0.078, 0.062, 7, P.scale,   {phase:Math.PI/7});
  tube(S.rise1, S.rise2, 0.062, 0.048, 7, P.scaleDk, {phase:Math.PI/7});
  tube(S.rise2, S.neck,  0.048, 0.036, 7, P.scale,   {phase:Math.PI/7});
  /* pale belly strip along the underside of the raised part */
  quad(V(0.08,coilY+0.10,0.20), V(0.18,coilY+0.10,0.16), V(0.14,coilY+0.50,0.24), V(0.06,coilY+0.50,0.26), P.belly, 0.05);

  /* HEAD — broad triangular viper head with hinged jaw + long curved fangs */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:coilY+0.62, cz:0.30, rx:0.052, rz:0.062, hex:P.scale},
      {y:coilY+0.68, cz:0.33, rx:0.062, rz:0.075, hex:P.scaleLt},
      {y:coilY+0.72, cz:0.30, rx:0.048, rz:0.055, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0.14,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0.14,coilY+0.76,0.29), P.scaleDk);
    /* snout tip */
    const snB=V(0.14,coilY+0.60,0.36), snT=V(0.13,coilY+0.58,0.46);
    tube(snB, snT, 0.040, 0.016, n, P.scale, {raz:0.05, rbz:0.018, phase:ph, capB:{hex:P.mouth, lift:0.005}});
    /* hinged jaw line + open mouth shadow */
    quad(V(0.05,coilY+0.56,0.34), V(0.22,coilY+0.56,0.34), V(0.17,coilY+0.52,0.44), V(0.09,coilY+0.52,0.44), P.mouth, 0.03);
    /* two long curved fangs hanging from the upper jaw */
    for(const s of [-1,1]){
      const fb=V(0.14+s*0.035,coilY+0.555,0.40);
      const ft=V(0.14+s*0.045,coilY+0.44,0.42);
      tube(fb, ft, 0.010, 0.003, 4, P.fang, {capB:{hex:P.fang, lift:0.003}});
    }
    /* flicking tongue */
    const tR=V(0.13,coilY+0.53,0.45), tM=V(0.13,coilY+0.51,0.56);
    tube(tR, tM, 0.008, 0.005, 4, P.tongue, {capA:{hex:P.mouth}});
    for(const s of [-1,1]) tube(tM, V(0.13+s*0.018,coilY+0.505,0.62), 0.005, 0.002, 3, P.tongue);
  }

  /* tail tip — thin taper poking from the innermost coil loop */
  {
    const tt0=coilPts.at(-1);
    const tt1=V(0.06, coilY-0.02, 0.30);
    const tip=V(0.14, coilY-0.03, 0.36);
    tube(tt0, tt1, 0.05, 0.03, 6, P.scaleDk);
    tube(tt1, tip, 0.03, 0.008, 6, P.scaleDk, {capB:{hex:P.scaleDk, lift:0.004}});
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
