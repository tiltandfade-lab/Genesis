/* dev/model-qa/creatures/rlm-the-queen-of-hearts.js — THE QUEEN OF HEARTS (bright-kingdom,
   Medium, CR 4). An imperious card-court queen, oversized ruffed gown, axe she never swings
   herself. Read: an upright regal humanoid in a wide, stiff, oversized ruffed gown (heart-suit
   red/black/cream), a tall pointed card-suit crown, arms crossed imperiously, and a ceremonial
   axe planted blade-down beside her (held loosely / leaned on, not raised — she never swings it
   herself). No eye quads (dark socket recesses under a haughty painted brow). Whole-object
   grammar, one merged frame, no anchors. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheQueenOfHearts(){
  const P = {
    skin:0xa8876a, skinDk:0x7a5f46,
    gown:0x8a2530, gownDk:0x5e1a22, gownLt:0xa84345, cream:0xc9baa0,
    ruff:0xb0a488, ruffDk:0x877c62,
    black:0x201c18, blackLt:0x332e28,
    gold:0x9c7d3a, goldDk:0x6e5626,
    heart:0x6e1620,
    haft:0x4a3a28, blade:0x716a5e, bladeDk:0x4a453c,
    disc:0x463c2f, discTop:0x554839,
  };

  const spY = 0.62;
  /* ---------- GOWN — wide, stiff, oversized ruffed silhouette; a bell-shaped skirt-of-cards read. */
  const bands=[
    {y:0.02,  rx:0.235, hex:P.gownDk},   // wide hem
    {y:0.16,  rx:0.255, hex:P.gown},     // widest point (oversized bell)
    {y:0.34,  rx:0.220, hex:P.gownDk},
    {y:0.52,  rx:0.165, hex:P.gown},     // waist cinch
    {y:0.70,  rx:0.145, hex:P.cream},    // bodice/ruff base
    {y:0.84,  rx:0.105, hex:P.gownDk},   // shoulders
  ];
  {
    const n=10, ph=Math.PI/n;
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.88, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,0.01,0), P.gownDk, true);
  }
  // heart-suit motif panel on the chest
  {
    const hy=0.72, hz=0.145;
    quad(V(-0.03,hy+0.02,hz), V(0.03,hy+0.02,hz), V(0.022,hy-0.01,hz), V(-0.022,hy-0.01,hz), P.heart, 0.03);
    quad(V(-0.022,hy-0.01,hz), V(0,hy-0.03,hz), V(0,hy-0.03,hz), V(0.022,hy-0.01,hz), P.heart, 0.03);
  }
  // vertical black/cream card-suit stripes down the skirt (alternating panels)
  for(let i=0;i<8;i++){
    const t=i/8*Math.PI*2;
    const x0=Math.sin(t)*0.24, z0=Math.cos(t)*0.21*0.88;
    const x1=Math.sin(t)*0.10, z1=Math.cos(t)*0.09*0.88;
    if(i%2===0) quad(V(x0,0.16,z0), V(x0*0.9,0.03,z0*0.9), V(x1*0.9,0.20,z1*0.9), V(x1,0.36,z1), P.black, 0.06);
  }
  // stiff wide RUFF collar standing up around the neck
  {
    const n=12, ph=Math.PI/12;
    const r0=ring(V(0,0.86,0), V(0,1,0), 0.145, 0.130, n, ph);
    const r1=ring(V(0,0.98,0), V(0,1,0), 0.185, 0.170, n, ph);
    for(let i=0;i<n;i++){
      const i2=(i+1)%n;
      quad(r0[i], r0[i2], r1[i2], r1[i], i%2? P.ruff:P.ruffDk, 0.06);
    }
    capFan(r1, V(0,1.0,0), P.ruffDk);
  }

  /* ---------- HEAD — haughty painted face, dark socket recesses (no eye quads). ------------------ */
  {
    const n=9, ph=Math.PI/n;
    const hb=[
      {y:1.00, cz:0.00, rx:0.088, rz:0.090, hex:P.skin},
      {y:1.10, cz:0.01, rx:0.092, rz:0.086, hex:P.skinDk},
      {y:1.20, cz:0.00, rx:0.070, rz:0.072, hex:P.skin},
    ];
    const rings = hb.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>hb[b].hex);
    capFan(rings.at(-1), V(0,1.22,0), P.skin);
    // dark socket recesses
    for(const s of [-1,1]){
      const sx=s*0.038, sy=1.115, sz=0.075;
      quad(V(sx-0.014,sy+0.011,sz), V(sx+0.014,sy+0.011,sz), V(sx+0.011,sy-0.011,sz+0.004), V(sx-0.011,sy-0.011,sz+0.004), P.skinDk, 0.04);
    }
    // small pursed painted mouth
    quad(V(-0.016,1.045,0.083), V(0.016,1.045,0.083), V(0.012,1.038,0.086), V(-0.012,1.038,0.086), P.gownDk, 0.03);

    /* CROWN — tall pointed card-suit crown of alternating gold points and heart/spade finials. */
    const cn=6, cph=Math.PI/cn;
    const cb0=ring(V(0,1.225,0), V(0,1,0), 0.078, 0.080, cn, cph);
    const cb1=ring(V(0,1.27,0), V(0,1,0), 0.082, 0.078, cn, cph);
    stitch([cb0,cb1], ()=>P.gold);
    for(let i=0;i<cn;i++){
      const p0=cb1[i], p1=cb1[(i+1)%cn];
      const mx=(p0.x+p1.x)/2, mz=(p0.z+p1.z)/2;
      const tip=V(mx*1.05, 1.42, mz*1.05);
      quad(p0, p1, tip, tip, i%2? P.gold:P.goldDk, 0.05);
    }
    capFan(cb1, V(0,1.28,0), P.goldDk, true);
  }

  /* ---------- ARMS — crossed imperiously over the chest. ---------- */
  {
    const sh1 = V(0.13, 0.82, 0.03);
    const el1 = V(0.08, 0.72, 0.14);
    const hd1 = V(-0.05, 0.70, 0.16);
    tube(sh1, el1, 0.048, 0.038, 6, P.gownDk);
    tube(el1, hd1, 0.038, 0.026, 6, P.skin, {capB:{hex:P.skinDk, lift:0.008}});

    const sh2 = V(-0.13, 0.80, 0.03);
    const el2 = V(-0.09, 0.68, 0.16);
    const hd2 = V(0.06, 0.66, 0.18);
    tube(sh2, el2, 0.048, 0.038, 6, P.gownDk);
    tube(el2, hd2, 0.038, 0.026, 6, P.skin, {capB:{hex:P.skinDk, lift:0.008}});
  }

  /* ---------- CEREMONIAL AXE — planted blade-down beside her, leaned against, never swung. ------ */
  {
    const hB = V(0.30, 0.02, 0.12), hT = V(0.28, 1.05, 0.10);
    tube(hB, hT, 0.020, 0.026, 6, P.haft);
    // broad axe-head near the top, blade angled down toward the ground (planted read)
    const bladeC = V(0.28, 0.95, 0.10);
    const b0=ring(bladeC, V(0,1,0), 0.020, 0.020, 6);
    quad(V(bladeC.x-0.02,bladeC.y+0.10,bladeC.z), V(bladeC.x+0.02,bladeC.y+0.10,bladeC.z),
         V(bladeC.x+0.15,bladeC.y-0.02,bladeC.z+0.02), V(bladeC.x-0.02,bladeC.y-0.10,bladeC.z), P.blade, 0.05);
    quad(V(bladeC.x-0.02,bladeC.y+0.10,bladeC.z-0.02), V(bladeC.x+0.02,bladeC.y+0.10,bladeC.z-0.02),
         V(bladeC.x-0.15,bladeC.y-0.02,bladeC.z-0.04), V(bladeC.x-0.02,bladeC.y-0.10,bladeC.z-0.02), P.bladeDk, 0.05);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
