/* dev/model-qa/creatures/rlm-grendel.js — GRENDEL (lost-world, Large, CR 7). Hulking marsh-born
   raider with iron-resistant hide, drags prey back to the fen. Read: a hunched, over-long-armed
   humanoid brute, thick mottled grey-green hide (iron-resistant, scarred), a low brutish skull
   (no eye quads — deep-set dark sockets), one oversized clawed hand for dragging/rending, marsh
   muck and reeds clinging to the lower body. Whole-object grammar, one merged frame. Large disc
   r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGrendel(){
  const P = {
    hide:0x555c4a, hideDk:0x373d30, hideLt:0x6f7861,
    scar:0x232720,
    muck:0x2e3324, muckDk:0x1c2018,
    claw:0x1c1a16,
    tooth:0xb8ad8e, mouth:0x211d18,
    reed:0x6b6b3e,
    disc:0x3f3a2c, discTop:0x4d4838,
  };

  const spY = 0.62; // hunched — lower than a normal upright stance for a Large brute
  /* ---------- LEGS — thick, muck-caked at the shins/feet. ---------- */
  for(const s of [-1,1]){
    const hip = V(s*0.16, 0.60, 0);
    const knee = V(s*0.19, 0.30, 0.06);
    const foot = V(s*0.20, 0.03, 0.14);
    tube(hip, knee, 0.130, 0.105, 7, P.hide);
    tube(knee, foot, 0.105, 0.115, 7, P.muckDk, {capB:{hex:P.muckDk, lift:0.015}});
    // muck/reed clinging to the shin
    quad(V(s*0.20-0.05,0.20,0.10), V(s*0.20+0.05,0.20,0.10), V(s*0.20+0.03,0.10,0.16), V(s*0.20-0.03,0.10,0.16), P.muck, 0.08);
  }

  /* ---------- TORSO — hunched, hulking, scarred hide. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:0.55, cz:0.00, rx:0.20, hex:P.hide},
      {y:0.78, cz:0.02, rx:0.235, hex:P.hideLt},
      {y:1.00, cz:0.04, rx:0.205, hex:P.hide},   // hunched forward (cz drifting +z)
      {y:1.16, cz:0.06, rx:0.155, hex:P.hideDk}, // shoulders, hunched
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    // scars
    for(const [y,z] of [[0.92,0.18],[0.70,0.15]]){
      quad(V(-0.10,y,z), V(0.10,y,z-0.02), V(0.08,y-0.02,z-0.04), V(-0.08,y-0.02,z-0.02), P.scar, 0.06);
    }
  }

  /* ---------- ARMS — over-long, asymmetric: one huge clawed dragging-hand, one merely large. ------ */
  {
    // MASSIVE right arm — over-long, huge clawed hand for dragging prey
    const sh1 = V(0.22, 1.10, 0.05);
    const el1 = V(0.34, 0.72, 0.10);
    const hd1 = V(0.30, 0.30, 0.14);
    tube(sh1, el1, 0.130, 0.100, 7, P.hide);
    tube(el1, hd1, 0.100, 0.095, 7, P.hideDk, {capB:{hex:P.hideDk, lift:0.02}});
    for(let i=0;i<4;i++){
      const dx=(i-1.5)*0.045;
      const cb = V(hd1.x+dx, hd1.y-0.05, hd1.z+0.04);
      const ct = V(hd1.x+dx*1.3, hd1.y-0.20, hd1.z+0.22);
      tube(cb, ct, 0.032, 0.010, 4, P.claw, {capB:{hex:P.claw, lift:0.008}});
    }
    // ordinary left arm, still large, hanging
    const sh2 = V(-0.20, 1.12, 0.02);
    const el2 = V(-0.26, 0.82, 0.06);
    const hd2 = V(-0.24, 0.55, 0.08);
    tube(sh2, el2, 0.105, 0.085, 6, P.hide);
    tube(el2, hd2, 0.085, 0.070, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.015}});
    for(let i=0;i<3;i++){
      const dx=(i-1)*0.035;
      const cb = V(hd2.x+dx, hd2.y-0.02, hd2.z+0.02);
      const ct = V(hd2.x+dx, hd2.y-0.09, hd2.z+0.10);
      tube(cb, ct, 0.020, 0.007, 4, P.claw, {capB:{hex:P.claw, lift:0.006}});
    }
  }

  /* ---------- HEAD — low, brutish, hunched forward; deep-set dark sockets (no eye quads). ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands2=[
      {y:1.16, cz:0.10, rx:0.135, rz:0.140, hex:P.hide},
      {y:1.30, cz:0.12, rx:0.145, rz:0.145, hex:P.hideLt},
      {y:1.42, cz:0.08, rx:0.115, rz:0.115, hex:P.hideDk},
    ];
    const rings = bands2.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands2[b].hex);
    capFan(rings.at(-1), V(0,1.44,0.08), P.hideDk);
    capFan(rings[0], V(0,1.14,0.10), P.hideDk, true);

    // brutish jutting brow ridge
    quad(V(-0.10,1.34,0.24), V(0.10,1.34,0.24), V(0.08,1.29,0.26), V(-0.08,1.29,0.26), P.hideDk, 0.06);
    // deep-set dark sockets under the brow
    for(const s of [-1,1]){
      const sx=s*0.05, sy=1.30, sz=0.23;
      quad(V(sx-0.026,sy+0.016,sz), V(sx+0.026,sy+0.016,sz), V(sx+0.022,sy-0.018,sz+0.006), V(sx-0.022,sy-0.018,sz+0.006), P.mouth, 0.04);
    }
    // wide brutish jaw with jagged teeth
    quad(V(-0.10,1.19,0.24), V(0.10,1.19,0.24), V(0.075,1.10,0.22), V(-0.075,1.10,0.22), P.mouth, 0.05);
    for(let i=0;i<4;i++){
      const t=i/3, tx=(t-0.5)*0.14;
      quad(V(tx-0.012,1.185,0.238), V(tx+0.012,1.185,0.238), V(tx+0.009,1.16,0.23), V(tx-0.009,1.16,0.23), P.tooth, 0.04);
    }
  }

  /* ---------- reeds / muck clinging around the base, marsh-born read. ---------- */
  for(const [x,z,h] of [[-0.30,0.20,0.28],[0.28,-0.18,0.22],[0.10,0.32,0.18]]){
    const rb = V(x, 0.03, z);
    const rt = V(x+0.02, 0.03+h, z-0.02);
    tube(rb, rt, 0.012, 0.004, 4, P.reed, {capB:{hex:P.reed, lift:0.004}});
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
