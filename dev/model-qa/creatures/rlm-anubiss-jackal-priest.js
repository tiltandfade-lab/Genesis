/* dev/model-qa/creatures/rlm-anubiss-jackal-priest.js — ANUBIS'S JACKAL-PRIEST (lost-world,
   Medium, CR 8). A jackal-masked embalmer-priest in funerary wrappings, wielding a ceremonial
   flail. Read: an upright humanoid in linen wrappings, a black jackal-head mask (long snout,
   tall pointed ears, no eye quads — dark socket recesses under the mask), a beaded funerary
   collar, and a crook/flail held ceremonially. Whole-object grammar, one merged frame, no
   anchors. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildAnubissJackalPriest(){
  const P = {
    linen:0xb8ab84, linenDk:0x8c7f5e, linenLt:0xd0c39c,
    wrap:0x9c8f68,
    jackal:0x1c1c1c, jackalDk:0x0e0e0e, jackalLt:0x2c2c2c,
    gold:0x9c7d3a, goldDk:0x6e5626,
    collar:0x2f7d72, collarB:0xa9873c, collarC:0x8a3a3a,   // beaded funerary collar (turquoise/gold/carnelian)
    skin:0x7a5f42, skinDk:0x574128,
    wood:0x4a3a28, metal:0x6b6b6b,
    disc:0x463c2f, discTop:0x554839,
  };

  const spY = 0.62;
  /* ---------- TORSO — upright humanoid wrapped in linen, wide priestly stance. ---------- */
  const bands=[
    {y:0.02,  rx:0.16, hex:P.linenDk},   // wrapped shins/feet base
    {y:0.34,  rx:0.145, hex:P.linen},    // hips
    {y:0.55,  rx:0.155, hex:P.linenLt},  // waist/torso
    {y:0.78,  rx:0.135, hex:P.linen},    // chest
    {y:0.92,  rx:0.105, hex:P.linenDk},  // shoulders
  ];
  {
    const n=9, ph=Math.PI/n;
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,0.01,0), P.linenDk, true);
  }
  // wrapped-linen bandage striping across the torso
  for(let i=0;i<4;i++){
    const y = 0.40+i*0.11;
    quad(V(-0.14,y,0.08), V(0.14,y,0.08), V(0.13,y-0.03,0.10), V(-0.13,y-0.03,0.10), P.wrap, 0.06);
  }

  /* ---------- BEADED FUNERARY COLLAR — layered bead rows across the chest/shoulders. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const c0 = ring(V(0,0.87,0), V(0,1,0), 0.145, 0.130, n, ph);
    const c1 = ring(V(0,0.80,0), V(0,1,0), 0.170, 0.155, n, ph);
    const c2 = ring(V(0,0.73,0), V(0,1,0), 0.155, 0.140, n, ph);
    stitch([c0,c1], ()=>P.collarB);
    stitch([c1,c2], ()=>P.collar);
    // carnelian bead accents at the collar front
    for(const dz of [0.12,-0.03]){
      quad(V(-0.03,0.775,0.155+dz), V(0.03,0.775,0.155+dz), V(0.024,0.755,0.148+dz), V(-0.024,0.755,0.148+dz), P.collarC, 0.05);
    }
  }

  /* ---------- ARMS — one holding a ceremonial flail raised, one bearing an ankh/staff low. ------- */
  {
    // flail arm (right, raised)
    const sh1 = V(0.135, 0.90, 0.02);
    const el1 = V(0.24, 0.72, 0.10);
    const hd1 = V(0.30, 0.85, 0.20);
    tube(sh1, el1, 0.055, 0.045, 6, P.linen);
    tube(el1, hd1, 0.045, 0.035, 6, P.skin, {capB:{hex:P.skinDk, lift:0.01}});
    // flail: wooden haft + chain + spiked head
    const hB = hd1, hT = V(0.34, 1.10, 0.28);
    tube(hB, hT, 0.022, 0.014, 6, P.wood);
    const chB = hT, chT = V(0.32, 1.02, 0.36);
    tube(chB, chT, 0.010, 0.010, 4, P.metal);
    const fh0 = ring(V(0.31,0.96,0.40), V(0,1,0), 0.045, 0.045, 6, Math.PI/6);
    const fh1 = ring(V(0.31,1.02,0.40), V(0,1,0), 0.050, 0.050, 6, Math.PI/6);
    stitch([fh0,fh1], ()=>P.metal);
    capFan(fh1, V(0.31,1.03,0.40), P.metal);
    // spikes on the flail head
    for(let i=0;i<6;i++){
      const t=i/6*Math.PI*2;
      const bx=0.31+Math.cos(t)*0.045, bz=0.40+Math.sin(t)*0.045;
      const tx=0.31+Math.cos(t)*0.075, tz=0.40+Math.sin(t)*0.075;
      quad(V(bx,0.985,bz), V(bx+0.006,0.985,bz+0.006), V(tx,0.985,tz), V(tx,0.985,tz), P.metal, 0.05);
    }

    // staff arm (left, lower, holding a crook)
    const sh2 = V(-0.135, 0.88, 0.02);
    const el2 = V(-0.20, 0.66, 0.06);
    const hd2 = V(-0.22, 0.44, 0.10);
    tube(sh2, el2, 0.055, 0.045, 6, P.linen);
    tube(el2, hd2, 0.045, 0.035, 6, P.skin, {capB:{hex:P.skinDk, lift:0.01}});
    const stB = hd2, stT = V(-0.22, 0.95, 0.12);
    tube(stB, stT, 0.018, 0.014, 6, P.gold, {capB:{hex:P.goldDk, lift:0.01}});
    // crook curl at the top
    const crC = V(-0.16, 1.02, 0.13);
    tube(stT, crC, 0.014, 0.008, 5, P.goldDk, {capB:{hex:P.gold, lift:0.006}});
  }

  /* ---------- JACKAL-HEAD MASK — long black snout, tall pointed ears, no eye quads. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands2=[
      {y:0.94, cz:0.02, rx:0.088, rz:0.090, hex:P.jackal},
      {y:1.04, cz:0.02, rx:0.095, rz:0.092, hex:P.jackalLt},
      {y:1.14, cz:0.00, rx:0.075, rz:0.075, hex:P.jackalDk},
    ];
    const rings = bands2.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands2[b].hex);
    capFan(rings.at(-1), V(0,1.16,0.00), P.jackalDk);

    // long tapering snout forward
    const snB = V(0, 0.995, 0.09);
    const snM = V(0, 0.985, 0.24);
    const snT = V(0, 0.978, 0.34);
    tube(snB, snM, 0.062, 0.040, n, P.jackal, {raz:0.068, rbz:0.038, phase:ph});
    tube(snM, snT, 0.040, 0.018, n, P.jackalDk, {raz:0.038, rbz:0.016, phase:ph, capB:{hex:P.jackalDk, lift:0.005}});
    // dark mouth line
    quad(V(-0.03,0.965,0.16), V(0.03,0.965,0.16), V(0.016,0.960,0.30), V(-0.016,0.960,0.30), P.jackalDk, 0.03);

    // dark socket recesses (no eye quads)
    for(const s of [-1,1]){
      const sx=s*0.045, sy=1.03, sz=0.075;
      quad(V(sx-0.022,sy+0.014,sz), V(sx+0.022,sy+0.014,sz), V(sx+0.018,sy-0.016,sz+0.006), V(sx-0.018,sy-0.016,sz+0.006), P.jackalDk, 0.03);
    }

    // tall pointed ears
    for(const s of [-1,1]){
      const eb = V(s*0.055, 1.12, -0.02);
      const et = V(s*0.09, 1.34, -0.03);
      tube(eb, et, 0.032, 0.006, 5, P.jackal, {capB:{hex:P.jackalDk, lift:0.005}});
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
