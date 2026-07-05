/* dev/model-qa/creatures/rlm-emperor-wyrm-of-the-sunken-ziggurat.js — EMPEROR WYRM OF THE SUNKEN
   ZIGGURAT (lost-world, Huge, CR 17). A great serpent-dragon corpse bound to its own stepped
   ziggurat. Read: a long dead coiled serpent-dragon body draped through/around a stepped stone
   ziggurat tier, scales cracked and desiccated, jaw frozen in a rictus, small vestigial wings
   folded flat and withered, the ziggurat steps rising through the coils as the base. No eye quads
   — dark sunken sockets. Whole-object grammar, one merged frame. Huge disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildEmperorWyrmOfTheSunkenZiggurat(){
  const P = {
    hide:0x51584a, hideDk:0x363c31, hideLt:0x6c7460,
    crack:0x201f1a, belly:0x8a8368, bellyDk:0x655f49,
    stone:0x6b5f4c, stoneDk:0x453c30, stoneLt:0x8a7a5f,
    gold:0x9c7d3a, goldDk:0x6e5626,
    wing:0x3a3f34, wingDk:0x25281f,
    mouth:0x261f1a, tooth:0xc9c0a0,
    disc:0x453b30, discTop:0x54483a,
  };

  /* ---------- ZIGGURAT BASE — stepped stone tiers, rising through the coils as the model's ground.-- */
  const zg = [
    {y:0.02, r:0.66}, {y:0.10, r:0.58}, {y:0.18, r:0.49}, {y:0.26, r:0.40}, {y:0.34, r:0.30},
  ];
  for(let i=0;i<zg.length;i++){
    const n=12, ph=Math.PI/n;
    const bot = ring(V(0,zg[i].y,0), V(0,1,0), zg[i].r, zg[i].r, n, ph);
    const top = ring(V(0,zg[i].y+0.055,0), V(0,1,0), zg[i].r, zg[i].r, n, ph);
    stitch([bot,top], ()=>(i%2? P.stone : P.stoneDk));
    if(i===zg.length-1) capFan(top, V(0,zg[i].y+0.057,0), P.stoneLt);
  }
  // gold ceremonial banding on the second tier
  {
    const n=12, ph=Math.PI/n;
    const gb = ring(V(0,0.155,0), V(0,1,0), 0.50, 0.50, n, ph);
    const gt = ring(V(0,0.175,0), V(0,1,0), 0.495,0.495, n, ph);
    stitch([gb,gt], ()=>P.gold);
  }

  /* ---------- SERPENT-DRAGON BODY — long undulating coil draped across/around the ziggurat top. --- */
  const spineY = 0.42;
  const S = {
    tailTip:  V(0.02, spineY-0.10, -0.98),
    tailA:    V(-0.10, spineY-0.02, -0.74),
    coilA:    V(0.18, spineY+0.06, -0.46),
    coilB:    V(-0.16, spineY+0.10, -0.16),
    coilC:    V(0.14, spineY+0.08, 0.14),
    shldr:    V(-0.06, spineY+0.05, 0.42),
    neck:     V(0.02, spineY+0.02, 0.62),
    headB:    V(0.0,  spineY-0.02, 0.78),
  };
  const segs = [
    [S.tailTip, S.tailA, 0.045,0.115],
    [S.tailA,   S.coilA, 0.115,0.185],
    [S.coilA,   S.coilB, 0.185,0.215],
    [S.coilB,   S.coilC, 0.215,0.205],
    [S.coilC,   S.shldr, 0.205,0.175],
    [S.shldr,   S.neck,  0.175,0.115],
    [S.neck,    S.headB, 0.115,0.090],
  ];
  segs.forEach(([a,b,ra,rb],i)=>{
    tube(a,b,ra,rb,10,(i%2? P.hide : P.hideDk), {phase:Math.PI/10});
  });
  // desiccated belly scutes along the underside
  for(const pt of [S.tailA, S.coilA, S.coilB, S.coilC, S.shldr]){
    quad(V(pt.x-0.06,pt.y-0.12,pt.z-0.05), V(pt.x+0.06,pt.y-0.12,pt.z-0.05),
         V(pt.x+0.05,pt.y-0.10,pt.z+0.05), V(pt.x-0.05,pt.y-0.10,pt.z+0.05), P.belly, 0.05);
  }
  // cracked dry scale seams
  for(const [a,b] of [[S.coilA,S.coilB],[S.coilB,S.coilC],[S.shldr,S.neck]]){
    const mid = V((a.x+b.x)/2,(a.y+b.y)/2+0.08,(a.z+b.z)/2);
    quad(V(mid.x-0.05,mid.y,mid.z-0.02), V(mid.x+0.05,mid.y,mid.z-0.02), V(mid.x+0.04,mid.y-0.03,mid.z+0.04), V(mid.x-0.04,mid.y-0.03,mid.z+0.04), P.crack, 0.06);
  }

  /* ---------- HEAD — a long draconic skull, jaw in a frozen rictus, dark sunken sockets. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spineY-0.06, cz:0.80, rx:0.100, rz:0.115, hex:P.hide},
      {y:spineY-0.01, cz:0.84, rx:0.115, rz:0.120, hex:P.hideLt},
      {y:spineY+0.04, cz:0.80, rx:0.088, rz:0.092, hex:P.hideDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spineY+0.06, 0.78), P.hideDk);

    // sunken sockets — dark recesses, no eye quads
    for(const s of [-1,1]){
      const sx=s*0.062, sy=spineY+0.005, sz=0.86;
      quad(V(sx-0.03,sy+0.02,sz), V(sx+0.03,sy+0.02,sz), V(sx+0.026,sy-0.03,sz+0.01), V(sx-0.026,sy-0.03,sz+0.01), P.mouth, 0.04);
    }
    // long snout tapering forward
    const snB = V(0, spineY-0.075, 0.86);
    const snT = V(0, spineY-0.10, 1.06);
    tube(snB, snT, 0.078, 0.030, n, P.hide, {raz:0.088, rbz:0.034, phase:ph, capB:{hex:P.hideDk, lift:0.008}});
    // rictus jaw gap with a row of teeth
    quad(V(-0.062,spineY-0.11,0.86), V(0.062,spineY-0.11,0.86), V(0.030,spineY-0.135,1.02), V(-0.030,spineY-0.135,1.02), P.mouth, 0.05);
    for(let i=0;i<4;i++){
      const t = i/3, tx=(t-0.5)*0.09, tz=0.87+t*0.14;
      quad(V(tx-0.01,spineY-0.11,tz), V(tx+0.01,spineY-0.11,tz), V(tx+0.008,spineY-0.13,tz+0.01), V(tx-0.008,spineY-0.13,tz+0.01), P.tooth, 0.03);
    }
    // small horns / crest ridge behind the brow
    for(const s of [-1,1]){
      const hb = V(s*0.05, spineY+0.075, 0.80);
      const ht = V(s*0.09, spineY+0.16, 0.70);
      tube(hb, ht, 0.02, 0.005, 5, P.hideDk, {capB:{hex:P.hideDk, lift:0.005}});
    }
  }

  /* ---------- VESTIGIAL WINGS — small, folded flat, withered, along the flanks near the shoulder. --- */
  for(const s of [-1,1]){
    const wingRoot = V(s*0.14, spineY+0.10, 0.30);
    const wingTip  = V(s*0.42, spineY+0.02, 0.02);
    const wingMid  = V(s*0.30, spineY+0.14, 0.18);
    quad(wingRoot, V(wingMid.x, wingMid.y, wingMid.z), wingTip, V(s*0.20,spineY-0.02,0.10), P.wing, 0.08);
    quad(wingRoot, V(s*0.20,spineY-0.02,0.10), wingTip, V(wingMid.x,wingMid.y-0.06,wingMid.z), P.wingDk, 0.08);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.018,0), V(0,1,0), 0.67, 0.67, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.019,0), P.discTop, true);
  }
}
