/* dev/model-qa/creatures/rlm-chittering-reliquary-swarm.js — CHITTERING RELIQUARY SWARM
   (lost-world, Medium Swarm, CR 0.25). Read: a cracked stone reliquary box boiling over
   with a mass of small scarab beetles — reliquary-as-anchor silhouette with a scarab cloud
   pouring out/around it. VS-desaturated worn stone + dark iridescent-dulled scarab carapace
   (lost-world dust register). Whole-object grammar: one function, one frame, no anchors.
   Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildChitteringReliquarySwarm(){
  const P = {
    stone:0x8c8268, stoneDk:0x615a44, stoneLt:0xa89a78,
    crack:0x2c2618, gilt:0x8a7440,
    beetle:0x3a3226, beetleDk:0x201c14, beetleSheen:0x565035,
    leg:0x1c1811, disc:0x4a4038, discTop:0x585047,
  };

  /* RELIQUARY BOX — a squat carved stone box, lid ajar/cracked, resting low */
  const boxC = V(0, 0.20, -0.05);
  {
    /* box body — a rectangular-ish stack of bands (blocky via wide rx/rz, low n for facets) */
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:0.06, rx:0.20, rz:0.16, hex:P.stoneDk},
      {y:0.12, rx:0.215,rz:0.175,hex:P.stone},
      {y:0.28, rx:0.215,rz:0.175,hex:P.stoneLt},
      {y:0.34, rx:0.20, rz:0.16, hex:P.stone},
    ];
    const rings=bands.map(b=>ring(V(boxC.x,b.y,boxC.z), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(boxC.x,0.03,boxC.z), P.stoneDk, true);
    /* gilt trim band near the top */
    quad(V(boxC.x-0.20,0.30,boxC.z-0.16), V(boxC.x+0.20,0.30,boxC.z-0.16), V(boxC.x+0.20,0.32,boxC.z+0.16), V(boxC.x-0.20,0.32,boxC.z+0.16), P.gilt, 0.05);
    /* carved crack lines across the face */
    for(const [x0,y0,x1,y1] of [[-0.12,0.30,-0.02,0.10],[0.05,0.28,0.16,0.14]]){
      quad(V(x0,y0,boxC.z+0.176), V(x0+0.01,y0,boxC.z+0.176), V(x1+0.01,y1,boxC.z+0.176), V(x1,y1,boxC.z+0.176), P.crack, 0.02);
    }
  }

  /* LID — cracked open, propped ajar at an angle, revealing the dark cavity beneath */
  {
    const hingeZ = boxC.z - 0.16;
    const lidP0 = V(boxC.x-0.20, 0.34, hingeZ);
    const lidP1 = V(boxC.x+0.20, 0.34, hingeZ);
    const lidP2 = V(boxC.x+0.19, 0.52, hingeZ+0.34);
    const lidP3 = V(boxC.x-0.19, 0.52, hingeZ+0.34);
    quad(lidP0, lidP1, lidP2, lidP3, P.stoneLt, 0.05);
    quad(lidP3, lidP2, lidP1, lidP0, P.stoneDk, 0.05);
    /* dark cavity mouth beneath the ajar lid, where the swarm boils out */
    quad(V(boxC.x-0.18,0.335,boxC.z+0.16), V(boxC.x+0.18,0.335,boxC.z+0.16), V(boxC.x+0.15,0.20,boxC.z+0.05), V(boxC.x-0.15,0.20,boxC.z+0.05), P.crack, 0.02);
  }

  /* SCARAB SWARM — a cluster of small beetle bodies boiling out of/around the cavity mouth,
     each a compact whole-object beetle: domed carapace + head + short legs. */
  const beetleAt=(cx, cy, cz, yaw, s, hex)=>{
    const dx=Math.cos(yaw), dz=Math.sin(yaw);
    const head=V(cx+dx*0.05*s, cy, cz+dz*0.05*s);
    const body=V(cx, cy, cz);
    /* domed carapace via a small stack */
    const n=7, ph=Math.PI/n;
    const bands=[
      {y:cy-0.018*s, rx:0.045*s, rz:0.055*s, hex:P.beetleDk},
      {y:cy+0.01*s,  rx:0.052*s, rz:0.062*s, hex:hex},
      {y:cy+0.03*s,  rx:0.030*s, rz:0.038*s, hex:P.beetleSheen},
    ];
    const rings=bands.map(b=>ring(V(body.x,b.y,body.z), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(body.x,cy+0.045*s,body.z), P.beetleSheen);
    capFan(rings[0], V(body.x,cy-0.03*s,body.z), P.beetleDk, true);
    /* head nub */
    tube(V(body.x,cy-0.005*s,body.z+dz*0.05*s*(dz>=0?1:1)), head, 0.020*s, 0.012*s, 5, P.beetleDk, {capB:{hex:P.beetleDk, lift:0.003*s}});
    /* short splayed legs, 3 per side */
    for(const side of [-1,1]) for(let i=0;i<3;i++){
      const t=(i-1)*0.4;
      const bx=body.x - dz*side*0.03*s + dx*t*0.03*s;
      const bz=body.z + dx*side*0.03*s + dz*t*0.03*s;
      const base=V(bx, cy-0.01*s, bz);
      const foot=V(bx - dz*side*0.045*s, cy-0.05*s, bz + dx*side*0.045*s);
      tube(base, foot, 0.007*s, 0.003*s, 3, P.leg, {capB:{hex:P.leg, lift:0.002*s}});
    }
  };
  /* cluster: some still on the box lid/rim, some spilling toward the viewer */
  beetleAt(boxC.x-0.05, 0.345, boxC.z+0.10, 0.6, 1.0, P.beetle);
  beetleAt(boxC.x+0.08, 0.345, boxC.z+0.08, -0.4, 0.9, P.beetleSheen);
  beetleAt(boxC.x+0.02, 0.15, boxC.z+0.30, 1.4, 1.1, P.beetle);
  beetleAt(boxC.x-0.14, 0.13, boxC.z+0.24, 2.2, 0.85, P.beetleDk);
  beetleAt(boxC.x+0.16, 0.11, boxC.z+0.20, -1.6, 0.95, P.beetle);
  beetleAt(boxC.x-0.02, 0.08, boxC.z+0.36, 0.8, 0.8, P.beetleSheen);

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
