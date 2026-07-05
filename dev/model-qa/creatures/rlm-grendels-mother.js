/* dev/model-qa/creatures/rlm-grendels-mother.js — GRENDEL'S MOTHER (lost-world, Large, CR 6). A
   mere-dwelling avenger who drags the fight underwater. Read: a leaner, more sinuous marsh-hag
   brute than Grendel — webbed clawed hands, a slicked wet-hide texture, a gaunt fanged face
   (no eye quads — dark hollow sockets), trailing weed-like hair/growths, built for grappling and
   pulling opponents down into water. Whole-object grammar, one merged frame. Large disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGrendelsMother(){
  const P = {
    hide:0x3f5048, hideDk:0x293530, hideLt:0x577064,     // wet slicked green-grey hide
    wet:0x6f8a7c,                                          // slick highlight sheen
    weed:0x3a4a2e, weedDk:0x263019,                        // trailing weed-hair
    claw:0x1a1a16, web:0x2a352e,
    tooth:0xc7d0c2, mouth:0x161a16,
    disc:0x33392f, discTop:0x40483b,
  };

  const spY = 0.66; // slightly less hunched than Grendel, more upright/sinuous
  /* ---------- LEGS — leaner than Grendel's, wet-slicked hide. ---------- */
  for(const s of [-1,1]){
    const hip = V(s*0.14, 0.64, 0);
    const knee = V(s*0.16, 0.32, 0.04);
    const foot = V(s*0.17, 0.03, 0.10);
    tube(hip, knee, 0.105, 0.085, 7, P.hide);
    tube(knee, foot, 0.085, 0.090, 7, P.hideDk, {capB:{hex:P.hideDk, lift:0.015}});
    quad(V(s*0.17-0.03,0.14,0.06), V(s*0.17+0.03,0.14,0.06), V(s*0.17+0.02,0.06,0.10), V(s*0.17-0.02,0.06,0.10), P.wet, 0.10);
  }

  /* ---------- TORSO — leaner, sinuous, more upright than Grendel; wet sheen streaks. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:0.58, cz:0.00, rx:0.155, hex:P.hide},
      {y:0.80, cz:0.01, rx:0.180, hex:P.hideLt},
      {y:1.02, cz:0.02, rx:0.160, hex:P.hide},
      {y:1.18, cz:0.02, rx:0.120, hex:P.hideDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.80, n, ph));
    stitch(rings, b=>bands[b].hex);
    // wet sheen streaks
    for(const [y,z] of [[0.95,0.14],[0.75,0.13]]){
      quad(V(-0.06,y,z), V(0.06,y,z), V(0.05,y-0.10,z+0.01), V(-0.05,y-0.10,z+0.01), P.wet, 0.10);
    }
  }

  /* ---------- ARMS — webbed clawed hands, built for grappling + dragging down into water. --------- */
  for(const s of [-1,1]){
    const sh = V(s*0.185, 1.10, 0.02);
    const el = V(s*0.27, 0.80, 0.10);
    const hd = V(s*0.28, 0.52, 0.16);
    tube(sh, el, 0.090, 0.072, 7, P.hide);
    tube(el, hd, 0.072, 0.068, 7, P.hideDk, {capB:{hex:P.hideDk, lift:0.015}});
    // webbing between fingers (a fanned quad set)
    quad(V(hd.x-0.05,hd.y-0.02,hd.z), V(hd.x+0.05,hd.y-0.02,hd.z), V(hd.x+0.04,hd.y-0.10,hd.z+0.06), V(hd.x-0.04,hd.y-0.10,hd.z+0.06), P.web, 0.06);
    for(let i=0;i<4;i++){
      const dx=(i-1.5)*0.032;
      const cb = V(hd.x+dx, hd.y-0.04, hd.z+0.03);
      const ct = V(hd.x+dx, hd.y-0.14, hd.z+0.14);
      tube(cb, ct, 0.020, 0.007, 4, P.claw, {capB:{hex:P.claw, lift:0.006}});
    }
  }

  /* ---------- HEAD — gaunt, fanged, hollow sockets (no eye quads); slicked-back weed-hair. --------- */
  {
    const n=9, ph=Math.PI/n;
    const bands2=[
      {y:1.18, cz:0.02, rx:0.105, rz:0.110, hex:P.hide},
      {y:1.30, cz:0.03, rx:0.108, rz:0.108, hex:P.hideLt},
      {y:1.42, cz:0.00, rx:0.080, rz:0.082, hex:P.hideDk},
    ];
    const rings = bands2.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands2[b].hex);
    capFan(rings.at(-1), V(0,1.44,0.00), P.hideDk);
    capFan(rings[0], V(0,1.16,0.02), P.hideDk, true);

    // gaunt cheeks — inward-pinched hollow quad accents
    for(const s of [-1,1]){
      quad(V(s*0.10,1.25,0.10), V(s*0.06,1.25,0.16), V(s*0.06,1.19,0.16), V(s*0.10,1.19,0.10), P.hideDk, 0.06);
    }
    // hollow sockets (no eye quads)
    for(const s of [-1,1]){
      const sx=s*0.045, sy=1.31, sz=0.185;
      quad(V(sx-0.022,sy+0.014,sz), V(sx+0.022,sy+0.014,sz), V(sx+0.018,sy-0.016,sz+0.006), V(sx-0.018,sy-0.016,sz+0.006), P.mouth, 0.03);
    }
    // fanged gaunt jaw
    quad(V(-0.075,1.20,0.19), V(0.075,1.20,0.19), V(0.055,1.12,0.17), V(-0.055,1.12,0.17), P.mouth, 0.05);
    for(let i=0;i<4;i++){
      const t=i/3, tx=(t-0.5)*0.10;
      quad(V(tx-0.010,1.195,0.185), V(tx+0.010,1.195,0.185), V(tx+0.007,1.15,0.175), V(tx-0.007,1.15,0.175), P.tooth, 0.04);
    }

    // trailing weed-like hair/growths sweeping back off the skull
    for(const [dx,dz] of [[-0.06,-0.02],[0.0,-0.03],[0.07,-0.01]]){
      const wb = V(dx, 1.40, 0.02+dz);
      const wm = V(dx*1.6, 1.20, -0.20+dz);
      const wt = V(dx*2.0, 0.95, -0.38+dz);
      tube(wb, wm, 0.020, 0.014, 4, P.weed);
      tube(wm, wt, 0.014, 0.005, 4, P.weedDk, {capB:{hex:P.weedDk, lift:0.005}});
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
