/* dev/model-qa/creatures/rlm-grave-wasp-nest-cluster.js — GRAVE-WASP NEST CLUSTER
   (lost-world, Medium Swarm/Beast, CR 0.5). Read: a papery hanging wasp-nest body with
   several wasp figures clustered around/emerging from it — a "nest as body" silhouette,
   NOT a single insect. Grey-brown papery nest, translucent-amber wasp bodies. VS-desaturated
   (lost-world dust register, ashy paper-grey). Whole-object grammar: one function, one
   frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGraveWaspNestCluster(){
  const P = {
    paper:0x8a7d5e, paperDk:0x5f5540, paperLt:0xa89873,
    hole:0x2c2418, wasp:0x6b5228, waspDk:0x453420, waspLt:0x8a6a38,
    wing:0xc9c0a0, stinger:0x241f16,
    disc:0x4a4038, discTop:0x585047,
  };

  /* NEST BODY — a bulbous papery hive mass, layered rings like a real hanging wasp nest,
     wider at the bottom, tapering to a narrow top stem */
  const nestC = V(0, 0.30, 0.0);
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:0.06, rx:0.10, rz:0.10, hex:P.paperDk},
      {y:0.16, rx:0.22, rz:0.22, hex:P.paper},
      {y:0.30, rx:0.26, rz:0.26, hex:P.paperLt},
      {y:0.44, rx:0.21, rz:0.21, hex:P.paper},
      {y:0.55, rx:0.13, rz:0.13, hex:P.paperDk},
      {y:0.62, rx:0.05, rz:0.05, hex:P.paperDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,0.02,0), P.paperDk, true);
    capFan(rings.at(-1), V(0,0.66,0), P.paperDk);
    /* papery layered ridges — horizontal band lines wrapping the nest (real nest texture) */
    for(let i=0;i<bands.length-1;i++){
      const y=(bands[i].y+bands[i+1].y)/2;
      const rx=(bands[i].rx+bands[i+1].rx)/2*1.02;
      for(let k=0;k<3;k++){
        const a=(k/3)*Math.PI*2 + ph;
        const x0=Math.cos(a)*rx, z0=Math.sin(a)*rx;
        quad(V(x0-0.02,y+0.01,z0-0.02), V(x0+0.02,y+0.01,z0+0.02), V(x0+0.018,y-0.01,z0+0.018), V(x0-0.018,y-0.01,z0-0.018), P.paperDk, 0.06);
      }
    }
    /* dark entrance holes pocking the nest surface — the "cracked reliquary" grave read */
    const holeSpots=[[0.6,0.20,0.18],[ -0.55,0.34,0.5],[0.2,0.46,-0.25],[-0.3,0.14,-0.2]];
    for(const [ax,y,az] of holeSpots){
      const ang=Math.atan2(az,ax), r=0.20+ (y>0.3?0.02:0.0);
      const x=Math.cos(ang)*r, z=Math.sin(ang)*r;
      quad(V(x-0.025,y+0.02,z), V(x+0.025,y+0.02,z), V(x+0.018,y-0.02,z+0.01), V(x-0.018,y-0.02,z+0.01), P.hole, 0.02);
    }
  }

  /* stem attaching nest to a broken beam/root stub above (implied — small stub up top) */
  quad(V(-0.015,0.62,0), V(0.015,0.62,0), V(0.01,0.72,0), V(-0.01,0.72,0), P.paperDk, 0.05);

  /* WASP FIGURES — 3 small wasp bodies clustered on/around the nest, each a compact
     whole-object insect: thorax+abdomen tube, wings, thin legs, a stinger. */
  const waspAt=(cx, cy, cz, yaw, hex)=>{
    const dx=Math.cos(yaw), dz=Math.sin(yaw);
    const head = V(cx+dx*0.09, cy, cz+dz*0.09);
    const thorax=V(cx, cy, cz);
    const abdB  =V(cx-dx*0.07, cy-0.01, cz-dz*0.07);
    const abdT  =V(cx-dx*0.16, cy-0.02, cz-dz*0.16);
    tube(head, thorax, 0.028, 0.036, 6, hex);
    tube(thorax, abdB, 0.036, 0.030, 6, P.waspDk);
    tube(abdB, abdT, 0.030, 0.010, 6, P.waspLt, {capB:{hex:P.stinger, lift:0.006}});
    /* banded stripes on abdomen */
    quad(V(abdB.x-0.02,cy+0.02,abdB.z-0.02), V(abdB.x+0.02,cy+0.02,abdB.z+0.02),
         V(abdB.x+0.015,cy-0.02,abdB.z+0.015), V(abdB.x-0.015,cy-0.02,abdB.z-0.015), P.waspDk, 0.04);
    /* head cap */
    { const r=ring(head, V(dz,0,-dx), 0.024,0.024,5,0); capFan(r, V(head.x+dx*0.03,cy,head.z+dz*0.03), P.waspDk); }
    /* thin wings — flat quads angled up from the thorax */
    for(const s of [-1,1]){
      const wr=V(cx+ -dz*s*0.02, cy+0.02, cz+dx*s*0.02);
      const wt=V(cx+ -dz*s*0.14 + dx*0.10, cy+0.09, cz+dx*s*0.14 + dz*0.10);
      quad(wr, V(wr.x+dx*0.05,wr.y,wr.z+dz*0.05), wt, V(wt.x-dx*0.02,wt.y,wt.z-dz*0.02), P.wing, 0.10);
    }
    /* thin legs, 3 per side */
    for(const s of [-1,1]) for(let i=0;i<3;i++){
      const t=i/2, lz=thorax.z - dz*0.02 + t*(-dz*0.06);
      const lx=thorax.x - dx*0.02 + t*(-dx*0.06);
      const base=V(lx, cy-0.02, lz);
      const foot=V(lx + -dz*s*0.06, cy-0.09, lz + dx*s*0.06);
      tube(base, foot, 0.008, 0.003, 3, P.waspDk, {capB:{hex:P.waspDk, lift:0.002}});
    }
  };
  waspAt(0.24, 0.34, 0.10, 0.3, P.wasp);
  waspAt(-0.22, 0.42, 0.20, 2.4, P.waspLt);
  waspAt(0.02, 0.20, 0.30, 1.2, P.wasp);

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
