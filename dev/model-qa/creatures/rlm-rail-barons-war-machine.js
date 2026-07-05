/* dev/model-qa/creatures/rlm-rail-barons-war-machine.js — Rail Baron's War-Machine
   (frontier, Huge, CR 9). A squat armored rail-car mounted on four thick mechanical legs,
   gatling-barrel clusters mounted where a face would be, chuffing black smoke from twin
   stacks. Whole-object grammar: one merged frame, no anchors. VS-desaturated black-iron
   + rust-red rail-car palette. NO eye quads — the gatling-cluster IS the face, no separate
   eyes. Huge size: base disc r=0.68.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRailBaronsWarMachine(){
  const P = {
    iron:0x353330, ironDk:0x201f1c, ironLt:0x4a4742,
    rail:0x6e3228, railDk:0x4a2018,
    rivet:0x7a726a,
    gun:0x2a2824, gunLt:0x403c36,
    smoke:0x716c62,
    disc:0x2e2b26, discTop:0x38342d,
  };

  const L = { hipY:0.42, waistY:0.66, chestY:0.94, roofY:1.18 };

  /* ---------- ARMORED RAIL-CAR HULL — a squat, flat-topped box-body (the car itself),
     wide and low, riveted iron plating with a rust-red rail-car band. ---------- */
  {
    const n=10, ph=Math.PI/10;
    const bands=[
      {y:L.hipY-0.10, rx:0.60, rz:0.42, hex:P.ironDk},
      {y:L.hipY+0.10, rx:0.66, rz:0.46, hex:P.iron},
      {y:L.waistY,    rx:0.66, rz:0.46, hex:P.rail},
      {y:L.chestY,    rx:0.62, rz:0.43, hex:P.railDk},
      {y:L.roofY,     rx:0.52, rz:0.36, hex:P.iron},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.roofY+0.06,0), P.ironLt);
    /* rivet rows along the rail-red band */
    for(let i=0;i<n;i++){
      const a=(i/n)*Math.PI*2;
      const px=Math.cos(a)*0.66, pz=Math.sin(a)*0.46;
      quad(V(px-0.02,L.waistY-0.01,pz-0.015), V(px+0.02,L.waistY-0.01,pz-0.015), V(px+0.017,L.waistY+0.02,pz+0.012), V(px-0.017,L.waistY+0.02,pz+0.012), P.rivet, 0.05);
    }
  }

  /* ---------- GATLING-CLUSTER FACE — a bundled ring of thick barrels mounted low-forward
     on the hull, the war-machine's only "face". ---------- */
  {
    const cz=0.46, cy=L.chestY-0.06;
    const barrelN=7;
    for(let i=0;i<barrelN;i++){
      const a=(i/barrelN)*Math.PI*2;
      const bx=Math.cos(a)*0.10, by=cy+Math.sin(a)*0.10;
      tube(V(bx,by,cz-0.02), V(bx,by,cz+0.30), 0.045,0.040, 5, (i%2)?P.gun:P.gunLt, {capB:{hex:P.ironDk}});
    }
    /* mounting collar */
    const r1=ring(V(0,cy,cz-0.06), V(0,0,1), 0.18,0.18, 8, Math.PI/8);
    const r2=ring(V(0,cy,cz+0.02), V(0,0,1), 0.19,0.19, 8, Math.PI/8);
    stitch([r1,r2], ()=>P.ironDk);
  }

  /* ---------- TWIN SMOKESTACKS — two chuffing stacks on the roof, streaming black smoke. --- */
  {
    const stackAt=(sign)=>{
      const base=V(sign*0.22, L.roofY+0.02, -0.10);
      const top =V(sign*0.22, L.roofY+0.34, -0.10);
      tube(base, top, 0.09, 0.075, 7, P.ironDk, {capB:{hex:P.rail, lift:0.015}});
      let prev=V(top.x, top.y+0.02, top.z);
      const puffs=[[sign*0.02,0.16,-0.06],[sign*0.05,0.30,-0.02],[sign*0.03,0.44,0.04]];
      for(const [dx,dy,dz] of puffs){
        const nxt=V(top.x+dx, top.y+dy, top.z+dz);
        tube(prev, nxt, 0.07, 0.10, 6, P.smoke);
        prev=nxt;
      }
    };
    stackAt(-1); stackAt(1);
  }

  /* ---------- FOUR THICK MECHANICAL LEGS — heavy piston-jointed legs planted wide,
     splayed like a squat spider/tripod-derived stance carrying the rail-car hull. ---------- */
  {
    const legAt=(sx, sz)=>{
      const hip = V(sx*0.42, L.hipY-0.06, sz*0.30);
      const knee= V(sx*0.62, L.hipY-0.34, sz*0.44);
      const foot= V(sx*0.58, 0.06, sz*0.50);
      tube(hip, knee, 0.155, 0.115, 8, P.iron, {capA:{hex:P.ironDk}});
      tube(knee, foot, 0.115, 0.135, 8, P.ironDk, {capB:{hex:P.ironLt, lift:0.02}});
      /* flat splayed iron foot-pad */
      quad(V(foot.x-0.10,0.03,foot.z-0.10), V(foot.x+0.10,0.03,foot.z-0.10), V(foot.x+0.09,0.02,foot.z+0.10), V(foot.x-0.09,0.02,foot.z+0.10), P.ironDk, 0.04);
    };
    legAt(-1,-1); legAt(1,-1); legAt(-1,1); legAt(1,1);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
