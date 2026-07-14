/* dev/model-qa/creatures/rlm-iron-horse-wreck-golem.js — Iron Horse Wreck-Golem (frontier,
   Large, CR 3). A hunched engine of riveted boiler-plate salvage — a squat construct torso
   built from a cracked train boiler, steam venting from a broken stack, short stubby wrecked-
   iron legs and one bent crank-arm. Whole-object grammar: one merged frame, no anchors.
   VS-desaturated rusted iron/soot palette. NO eye quads — a plain dark riveted plate face,
   no eyes. Large size: base disc r=0.55.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildIronHorseWreckGolem(){
  const P = {
    iron:0x4a453c, ironDk:0x2e2b25, ironLt:0x615a4d,
    rust:0x6e4a2e, rustDk:0x4a3220,
    soot:0x232019, sootLt:0x353028,
    rivet:0x726a54,
    steam:0x9a9488,
    disc:0x3f382e, discTop:0x4a4238,
  };

  const L = { hipY:0.28, waistY:0.48, chestY:0.72, shldY:0.92 };

  /* ---------- HUNCHED BOILER-TORSO — a squat riveted barrel, hunched forward, cracked seam
     down one side, wider at the belly than the shoulders (a hunch, not upright). ---------- */
  {
    const n=9, ph=Math.PI/9;
    const bands=[
      {y:L.hipY-0.02, cz:0.02, rx:0.34, rz:0.32, hex:P.ironDk},
      {y:L.waistY,    cz:0.05, rx:0.38, rz:0.36, hex:P.iron},
      {y:L.chestY,    cz:0.07, rx:0.35, rz:0.33, hex:P.ironLt},
      {y:L.shldY,     cz:0.02, rx:0.26, rz:0.26, hex:P.iron},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.shldY+0.10,0.0), P.ironDk);
    /* rivet rows around the belly + chest bands */
    for(const y of [L.waistY, L.chestY]){
      for(let i=0;i<9;i++){
        const a = (i/9)*Math.PI*2;
        const rx = (y===L.waistY?0.38:0.35), rz=(y===L.waistY?0.36:0.33);
        const cz = (y===L.waistY?0.05:0.07);
        const px = Math.cos(a)*rx, pz = cz+Math.sin(a)*rz;
        quad(V(px-0.012,y-0.01,pz-0.012), V(px+0.012,y-0.01,pz-0.012), V(px+0.010,y+0.01,pz+0.010), V(px-0.010,y+0.01,pz+0.010), P.rivet, 0.05);
      }
    }
    /* cracked seam — a jagged dark line down the front of the boiler */
    const seam=[[0,L.shldY-0.02,0.28],[0.02,L.chestY,0.31],[-0.01,L.waistY+0.05,0.34],[0.01,L.hipY,0.30]];
    for(let i=0;i<seam.length-1;i++){
      const [x0,y0,z0]=seam[i], [x1,y1,z1]=seam[i+1];
      quad(V(x0-0.02,y0,z0), V(x0+0.02,y0,z0), V(x1+0.016,y1,z1), V(x1-0.016,y1,z1), P.sootLt, 0.05);
    }
  }

  /* ---------- BROKEN SMOKESTACK — a cracked pipe jutting up off the back-top of the boiler,
     venting a plume of pale steam/soot. ---------- */
  {
    const base = V(-0.08, L.shldY+0.06, -0.14);
    const crack= V(-0.10, L.shldY+0.42, -0.18);
    const jag  = V(-0.02, L.shldY+0.50, -0.14);
    tube(base, crack, 0.11, 0.09, 8, P.ironDk, {capA:{hex:P.iron}});
    tube(crack, jag, 0.09, 0.07, 6, P.rustDk, {capB:{hex:P.sootLt, lift:0.02}});
    /* steam plume — a few soft tapering puffs drifting up/back */
    const puffs=[[jag.x,jag.y+0.10,jag.z-0.04],[jag.x-0.06,jag.y+0.22,jag.z-0.10],[jag.x-0.10,jag.y+0.34,jag.z-0.14]];
    let prev = V(jag.x, jag.y+0.02, jag.z);
    for(const [px,py,pz] of puffs){
      tube(prev, V(px,py,pz), 0.06, 0.09, 6, P.steam);
      prev = V(px,py,pz);
    }
  }

  /* ---------- SMALL RIVETED HEAD — a plain dark box set low/forward into the hunch, no
     eyes — just a slit vent where a face would be. ---------- */
  {
    const cy=L.shldY+0.10, cz=0.22;
    const bands=[
      {y:cy-0.06, rx:0.16, rz:0.15, hex:P.ironDk},
      {y:cy+0.08, rx:0.145,rz:0.13, hex:P.iron},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,cz), V(0,1,0), b.rx, b.rz, 7, Math.PI/7));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,cy+0.13,cz), P.ironLt);
    /* dark vent slit — no eyes */
    quad(V(-0.06,cy+0.01,cz+0.135), V(0.06,cy+0.01,cz+0.135), V(0.05,cy-0.03,cz+0.14), V(-0.05,cy-0.03,cz+0.14), P.soot, 0.03);
  }

  /* ---------- STUBBY WRECKED LEGS — short thick bent-iron legs, one visibly buckled,
     planted wide and low (a hunched-over stance). ---------- */
  {
    const legAt=(sign, buckled)=>{
      const hip = V(sign*0.20, L.hipY, 0.0);
      const knee= V(sign*(0.24+ (buckled?0.10:0.02)), L.hipY-0.16, buckled?0.10:0.04);
      const foot= V(sign*0.22, 0.05, buckled?0.18:0.06);
      tube(hip, knee, 0.135, 0.105, 7, P.iron);
      tube(knee, foot, 0.105, 0.12, 7, P.ironDk, {capB:{hex:P.sootLt, lift:0.02}});
    };
    legAt(-1, false);
    legAt(1, true);
  }

  /* ---------- ONE BENT CRANK-ARM — a single stiff piston/crank arm hanging heavy, the
     other shoulder just a stump (asymmetric wreck read). ---------- */
  {
    const shldr = V(0.30, L.shldY-0.06, 0.06);
    const elbow = V(0.42, L.chestY-0.22, 0.14);
    const crank = V(0.36, L.waistY-0.10, 0.22);
    tube(shldr, elbow, 0.11, 0.085, 7, P.iron, {capA:{hex:P.ironDk}});
    tube(elbow, crank, 0.085, 0.06, 6, P.rust, {capB:{hex:P.rustDk, lift:0.02}});
    /* stump on the other side */
    tube(V(-0.28,L.shldY-0.04,0.04), V(-0.34,L.shldY-0.16,0.06), 0.10, 0.07, 6, P.sootLt, {capB:{hex:P.soot}});
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
