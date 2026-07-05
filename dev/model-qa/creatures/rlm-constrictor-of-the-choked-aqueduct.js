/* dev/model-qa/creatures/rlm-constrictor-of-the-choked-aqueduct.js — CONSTRICTOR OF THE
   CHOKED AQUEDUCT (lost-world, Large Beast, CR 0.25). Read: a heavy-bodied constrictor —
   thick muscular coiled body (much heavier girth than the dune serpent), small blunt head,
   wet mottled hide reading "aqueduct-slick." VS-desaturated murky green-grey (wet stone
   register). Whole-object grammar: one function, one frame, no anchors. Large size,
   base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildConstrictorOfTheChokedAqueduct(){
  const P = {
    scale:0x565c48, scaleDk:0x3a3f30, scaleLt:0x6d7358,
    mottle:0x4a5038, belly:0x9a9878, bellyDk:0x767454,
    wet:0x2e332a, mouth:0x201c14, tooth:0xd8cfa8,
    disc:0x4a4038, discTop:0x585047,
  };

  /* HEAVY COIL — much thicker girth than a typical serpent; a broad layered coil low to ground */
  const coilY = 0.16;
  const coilPts = [
    V(0.34, coilY, 0.16), V(0.40, coilY+0.02, -0.12), V(0.24, coilY+0.04, -0.34),
    V(-0.06, coilY+0.05, -0.38), V(-0.32, coilY+0.03, -0.18), V(-0.36, coilY+0.01, 0.12),
    V(-0.14, coilY-0.01, 0.34), V(0.10, coilY-0.02, 0.36),
  ];
  const rad = [0.155,0.175,0.185,0.180,0.165,0.150,0.130,0.110];
  for(let i=0;i<coilPts.length-1;i++){
    const hex = (i%2===0)? P.scale : P.mottle;
    tube(coilPts[i], coilPts[i+1], rad[i], rad[i+1], 9, hex, {phase:Math.PI/9});
  }
  /* wet sheen highlight strip along the outer top of the coil */
  for(let i=0;i<coilPts.length-1;i+=2){
    const a=coilPts[i], b=coilPts[i+1];
    const mx=(a.x+b.x)/2, mz=(a.z+b.z)/2, my=Math.max(a.y,b.y)+rad[i]*0.7;
    quad(V(mx-0.05,my,mz-0.05), V(mx+0.05,my,mz-0.03), V(mx+0.03,my+0.01,mz+0.05), V(mx-0.05,my+0.01,mz+0.03), P.wet, 0.05);
  }
  /* pale belly strip visible where the coil underside shows */
  quad(V(0.20,coilY-0.05,0.20), V(0.32,coilY-0.04,0.05), V(0.34,coilY,0.20), V(0.22,coilY,0.30), P.belly, 0.05);

  /* RAISED FOREBODY — short thick rise from the coil to a small blunt head (constrictors don't
     rear high like vipers; keep it low, coiled tight, head resting near the top of the mass) */
  const S = {
    root:  coilPts[0],
    rise1: V(0.40, coilY+0.22, 0.30),
    neck:  V(0.36, coilY+0.30, 0.42),
    headB: V(0.32, coilY+0.32, 0.50),
  };
  tube(S.root,  S.rise1, 0.150, 0.110, 8, P.scale,   {phase:Math.PI/8});
  tube(S.rise1, S.neck,  0.110, 0.085, 8, P.mottle,  {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.085, 0.072, 8, P.scaleDk, {phase:Math.PI/8});

  /* HEAD — small blunt constrictor head (proportionally small vs. the huge body) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:coilY+0.30, cz:0.50, rx:0.062, rz:0.072, hex:P.scale},
      {y:coilY+0.34, cz:0.54, rx:0.070, rz:0.082, hex:P.scaleLt},
      {y:coilY+0.36, cz:0.50, rx:0.058, rz:0.062, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0.30,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0.30,coilY+0.39,0.49), P.scaleDk);
    /* blunt rounded snout — NOT a tapering viper point */
    const snB=V(0.30,coilY+0.28,0.56), snT=V(0.29,coilY+0.27,0.62);
    tube(snB, snT, 0.052, 0.038, n, P.scale, {raz:0.058, rbz:0.040, phase:ph, capB:{hex:P.mouth, lift:0.006}});
    /* mouth line */
    quad(V(0.20,coilY+0.235,0.52), V(0.40,coilY+0.235,0.52), V(0.34,coilY+0.20,0.60), V(0.24,coilY+0.20,0.60), P.mouth, 0.03);
    /* small recurved teeth (constrictor, not fangs) */
    for(let i=-2;i<=2;i++) quad(V(0.30+i*0.016-0.005,coilY+0.225,0.55), V(0.30+i*0.016+0.005,coilY+0.225,0.55),
                                 V(0.30+i*0.016+0.004,coilY+0.205,0.56), V(0.30+i*0.016-0.004,coilY+0.205,0.56), P.tooth, 0.03);
  }

  /* tail tip — thick, poking briefly from the innermost coil loop, blunt taper */
  {
    const tt0=coilPts.at(-1);
    const tt1=V(0.02, coilY-0.03, 0.42);
    const tip=V(0.16, coilY-0.04, 0.46);
    tube(tt0, tt1, 0.09, 0.05, 7, P.mottle);
    tube(tt1, tip, 0.05, 0.018, 7, P.scaleDk, {capB:{hex:P.scaleDk, lift:0.005}});
  }

  /* base disc (Large r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
