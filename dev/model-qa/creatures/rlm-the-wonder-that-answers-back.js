/* dev/model-qa/creatures/rlm-the-wonder-that-answers-back.js — THE WONDER THAT ANSWERS BACK
   (cosmic, Gargantuan, CR 18). Read: a star-scaled orb-and-limb mass whose geometry disagrees with
   itself — a great central sphere ringed by mismatched secondary spheres at wrong angles, jointed
   limbs that bend the wrong way, faceted crystalline growths stabbing off at impossible angles.
   VS-desaturated cosmic palette (deep bruised violet / cold iron-grey / sick starlight pale).
   NO eye quads — faceted dark hollows instead. Whole-object grammar, one merged frame.
   Gargantuan disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheWonderThatAnswersBack(){
  const P = {
    orb:0x494256, orbDk:0x2e2836, orbLt:0x615a70,             // bruised violet main mass
    iron:0x565a5e, ironDk:0x363a3c,                            // cold iron-grey secondary spheres
    facet:0x847ea0, facetDk:0x585270,                          // faceted crystalline growths
    hollow:0x1c1a20,                                           // dark faceted hollows (no eyes)
    star:0x9a94ac,                                             // sick pale starlight highlight
    disc:0x2a2730, discTop:0x3a3540,
  };

  /* ---------- CENTRAL ORB MASS — a great uneven sphere built from off-axis stacked rings so its
     silhouette bulges wrong, geometry visibly disagreeing with a clean sphere. ---------- */
  const cy = 1.15;
  {
    const n=14, ph=Math.PI/n;
    const bands=[
      {y:cy-0.62, cx:0.03,  cz:-0.02, r:0.20, hex:P.orbDk},
      {y:cy-0.42, cx:-0.05, cz:0.04,  r:0.42, hex:P.orb},
      {y:cy-0.18, cx:0.06,  cz:-0.03, r:0.58, hex:P.orbLt},
      {y:cy+0.06, cx:-0.04, cz:0.05,  r:0.64, hex:P.orb},
      {y:cy+0.30, cx:0.05,  cz:-0.04, r:0.50, hex:P.orbDk},
      {y:cy+0.52, cx:-0.03, cz:0.02,  r:0.34, hex:P.orb},
      {y:cy+0.70, cx:0.02,  cz:-0.01, r:0.16, hex:P.orbDk},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.r, b.r*1.06, n, ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(0.02,cy+0.78,-0.01), P.orbDk);
    capFan(rings[0], V(0.03,cy-0.70,-0.02), P.orbDk, true);
  }

  /* ---------- SECONDARY SPHERES — smaller iron-grey orbs stuck to the main mass at WRONG angles,
     each its own stack of rings, none aligned with the others — the disagreeing geometry. ------- */
  {
    const spots = [
      {c:V(0.52, cy+0.20, 0.10), r:0.26, tilt:0.35},
      {c:V(-0.48, cy-0.10, -0.18), r:0.22, tilt:-0.5},
      {c:V(0.20, cy+0.62, -0.30), r:0.18, tilt:0.7},
      {c:V(-0.30, cy+0.55, 0.28), r:0.20, tilt:-0.2},
      {c:V(0.05, cy-0.55, 0.36), r:0.16, tilt:0.9},
    ];
    spots.forEach((s,i)=>{
      const n=9, ph=Math.PI/n;
      const axis = V(Math.sin(s.tilt), Math.cos(s.tilt), 0.15);
      const up = new THREE.Vector3(axis.x,axis.y,axis.z).normalize();
      const bands=[
        {t:-0.7,r:0.35},{t:-0.2,r:0.85},{t:0.3,r:0.95},{t:0.75,r:0.45},
      ];
      const rings = bands.map(b=>{
        const c = V(s.c.x+up.x*b.t*s.r, s.c.y+up.y*b.t*s.r, s.c.z+up.z*b.t*s.r);
        return ring(c, up, s.r*b.r, s.r*b.r, n, ph);
      });
      stitch(rings, ()=>(i%2?P.iron:P.ironDk));
      capFan(rings.at(-1), V(s.c.x+up.x*s.r*0.9, s.c.y+up.y*s.r*0.9, s.c.z+up.z*s.r*0.9), P.ironDk);
      capFan(rings[0], V(s.c.x-up.x*s.r*0.9, s.c.y-up.y*s.r*0.9, s.c.z-up.z*s.r*0.9), P.ironDk, true);
    });
  }

  /* ---------- WRONG-BEND LIMBS — jointed tube-limbs that bend back on themselves at each joint,
     four total, radiating from the core at uneven angles then kinking the "wrong" way. --------- */
  {
    const roots = [
      {a:V(0.44,cy-0.05,0.30), dir:1, side:1},
      {a:V(-0.40,cy+0.10,-0.32), dir:-1, side:-1},
      {a:V(0.30,cy-0.50,-0.20), dir:1, side:1},
      {a:V(-0.34,cy-0.42,0.24), dir:-1, side:-1},
    ];
    roots.forEach((rt,i)=>{
      const s=rt.side;
      const j0=rt.a;
      const j1=V(j0.x+s*0.35, j0.y+0.10*rt.dir, j0.z+s*0.15);
      const j2=V(j1.x+s*0.10, j1.y-0.38*rt.dir, j1.z+s*0.30); // kinks back the "wrong" way
      const j3=V(j2.x+s*0.30, j2.y+0.22*rt.dir, j2.z-0.10);
      tube(j0,j1,0.15,0.11,7,P.iron,{phase:Math.PI/7});
      tube(j1,j2,0.11,0.08,7,P.ironDk,{phase:Math.PI/7});
      tube(j2,j3,0.08,0.03,7,P.iron,{phase:Math.PI/7, capB:{hex:P.orbDk, lift:0.02}});
      // faceted crystalline growth stabbing off the last joint
      const fTip = V(j3.x+s*0.14, j3.y+0.16, j3.z+0.08);
      tube(j3, fTip, 0.05, 0.005, 5, P.facet, {capB:{hex:P.facet, lift:0.01}});
    });
  }

  /* ---------- FACETED CRYSTALLINE GROWTHS — stabbing off the main orb at impossible angles,
     sharp-edged low-poly spikes breaking the sphere's silhouette. NO eyes; dark faceted hollows. */
  {
    const spikes = [
      {base:V(0.10,cy+0.66,0.05), dir:V(0.3,1,0.1), len:0.34},
      {base:V(-0.20,cy+0.40,0.42), dir:V(-0.2,0.7,0.9), len:0.28},
      {base:V(0.36,cy-0.30,-0.40), dir:V(0.6,-0.4,-0.8), len:0.24},
      {base:V(-0.42,cy+0.02,-0.36), dir:V(-0.7,0.2,-0.7), len:0.30},
    ];
    spikes.forEach(sp=>{
      const tip=V(sp.base.x+sp.dir.x*sp.len, sp.base.y+sp.dir.y*sp.len, sp.base.z+sp.dir.z*sp.len);
      tube(sp.base, tip, 0.10, 0.01, 5, P.facet, {phase:0.2, capB:{hex:P.facetDk, lift:0.01}});
      // a dark faceted hollow at the base of each spike (not an eye — a fracture)
      quad(V(sp.base.x-0.05,sp.base.y+0.03,sp.base.z), V(sp.base.x+0.05,sp.base.y+0.03,sp.base.z),
           V(sp.base.x+0.03,sp.base.y-0.03,sp.base.z+0.03), V(sp.base.x-0.03,sp.base.y-0.03,sp.base.z+0.03), P.hollow, 0.05);
    });
    // scattered star-flecks (sick pale starlight) across the main orb, uneven, unsettling
    for(let i=0;i<10;i++){
      const a=(i/10)*Math.PI*2, ry=cy-0.2+Math.sin(i*1.7)*0.5;
      const rx=Math.cos(a)*0.55, rz=Math.sin(a)*0.55;
      quad(V(rx-0.02,ry,rz), V(rx+0.02,ry,rz), V(rx+0.015,ry+0.03,rz+0.01), V(rx-0.015,ry+0.03,rz+0.01), P.star, 0.12);
    }
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.71, 0.71, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.021,0), P.discTop, true);
  }
}
