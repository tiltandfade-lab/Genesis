/* dev/model-qa/creatures/rlm-iron-rail-spike-wraith.js — Iron-Rail Spike Wraith
   (frontier, Medium, CR 3). A translucent laborer-shape, arms fused at both wrists into
   one glowing iron spike-maul, forever swinging to drive rail spikes that no longer
   exist. Whole-object grammar: one merged frame, no anchors. VS-desaturated ghost-blue
   translucent-read palette (achieved via pale washed-out hex, not real transparency) +
   a dull glowing iron maul-head. NO eye quads — a faint featureless pale head, no face.
   Medium size: base disc r=0.42.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildIronRailSpikeWraith(){
  const P = {
    ghost:0x7c8590, ghostDk:0x565e68, ghostLt:0x9ba3ac,
    cloth:0x656b5c, clothDk:0x454a3e,
    maul:0x4a4640, maulDk:0x2c2925,
    glow:0xd8945c, glowLt:0xf0b072,
    disc:0x3a3a3c, discTop:0x454548,
  };

  const L = { hipY:0.36, waistY:0.56, chestY:0.80, shldY:0.96, neckY:1.04, headY:1.18 };

  /* ---------- TRANSLUCENT LABORER BODY — a lean worn-down frame in tattered work-cloth,
     pale washed ghost-hide showing through gaps, hunched from endless swinging labor. --- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:L.hipY-0.06, rx:0.155, rz:0.14, hex:P.ghostDk},
      {y:L.hipY,      rx:0.135,rz:0.12, hex:P.cloth},
      {y:L.waistY,    rx:0.12, rz:0.11, hex:P.cloth},
      {y:L.chestY-0.06,rx:0.145,rz:0.13, hex:P.clothDk},
      {y:L.shldY-0.06, rx:0.155,rz:0.14, hex:P.cloth},   // hunched, slightly forward-leaning shoulders
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.y>L.chestY-0.1?0.04:0.0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* tattered cloth strips hanging loose (worn labor clothes) */
    for(const [x,y,z,dx,dz] of [[-0.10,L.waistY,0.05,-0.02,0.10],[0.09,L.hipY+0.02,0.06,0.03,0.09]]){
      quad(V(x-0.03,y,z), V(x+0.03,y,z), V(x+dx+0.02,y-0.16,z+dz), V(x+dx-0.02,y-0.16,z+dz), P.clothDk, 0.06);
    }
  }

  /* ---------- FEATURELESS PALE HEAD — a bowed, faint head with no discernible face,
     the ghost worn down to almost nothing above the neck. ---------- */
  {
    const n=7, ph=Math.PI/7;
    const bands=[
      {y:L.neckY,      rx:0.085, rz:0.08, hex:P.ghostDk},
      {y:L.headY-0.02, rx:0.095, rz:0.088,hex:P.ghost},
      {y:L.headY+0.05, rx:0.078, rz:0.072,hex:P.ghostDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.05), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.headY+0.08,0.03), P.ghostDk);
    /* just a faint pale wash where a face would be — no features */
    quad(V(-0.05,L.headY-0.02,0.135), V(0.05,L.headY-0.02,0.135), V(0.04,L.headY+0.03,0.125), V(-0.04,L.headY+0.03,0.125), P.ghostLt, 0.05);
  }

  /* ---------- FUSED WRISTS + ONE GLOWING SPIKE-MAUL — both arms run down and fuse at
     the wrists into a single haft, ending in a heavy glowing iron maul-head. The core
     silhouette read of the creature. ---------- */
  {
    /* two arms from the shoulders, converging to one fused wrist-point */
    const shL=V(-0.13,L.shldY-0.08,0.05), shR=V(0.13,L.shldY-0.08,0.05);
    const fuse=V(0.0, L.waistY-0.10, 0.20);
    tube(shL, fuse, 0.055, 0.045, 6, P.ghost, {capA:{hex:P.ghostDk}});
    tube(shR, fuse, 0.055, 0.045, 6, P.ghost, {capA:{hex:P.ghostDk}});
    /* the fused haft continuing down/forward from the wrist-fusion */
    const haftMid = V(0.02, L.hipY-0.10, 0.34);
    const haftEnd = V(0.03, L.hipY-0.26, 0.46);
    tube(fuse, haftMid, 0.045, 0.052, 6, P.maulDk);
    tube(haftMid, haftEnd, 0.052, 0.065, 6, P.maul, {capB:{hex:P.maulDk, lift:0.02}});
    /* the heavy maul-head, glowing faint ember-orange at the striking face */
    {
      const n=8, ph=Math.PI/8;
      const cy=haftEnd.y-0.02, cz=haftEnd.z+0.10;
      const bands=[
        {y:cy-0.12, rx:0.13, rz:0.11, hex:P.maulDk},
        {y:cy+0.02, rx:0.155,rz:0.135,hex:P.maul},
        {y:cy+0.14, rx:0.12, rz:0.10, hex:P.maulDk},
      ];
      const rings=bands.map(b=>ring(V(0.03,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
      stitch(rings, b=>bands[b].hex);
      /* glowing striking-face flecks on the maul head-front */
      for(const [dx,dy] of [[0.0,0.0],[0.03,0.05],[-0.03,-0.04],[0.04,-0.06]]){
        const gx=0.03+dx, gy=cy+dy;
        quad(V(gx-0.015,gy-0.012,cz+0.135), V(gx+0.015,gy-0.012,cz+0.135), V(gx+0.012,gy+0.014,cz+0.14), V(gx-0.012,gy+0.014,cz+0.14), P.glow, 0.06);
      }
      quad(V(-0.02,cy+0.02,cz+0.14), V(0.08,cy+0.02,cz+0.14), V(0.06,cy+0.10,cz+0.145), V(0.0,cy+0.10,cz+0.145), P.glowLt, 0.05);
    }
  }

  /* ---------- LEGS — thin worn ghost-legs, planted mid-swing stance. ---------- */
  {
    const legAt=(sign)=>{
      const hip=V(sign*0.07, 0.16, 0.0);
      const foot=V(sign*0.08, 0.02, sign*0.02+0.04);
      tube(hip, foot, 0.06, 0.055, 6, P.ghostDk, {capB:{hex:P.ghostLt, lift:0.012}});
    };
    legAt(-1); legAt(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
