/* dev/model-qa/creatures/rlm-void-bloom-drone-swarm.js — VOID-BLOOM DRONE SWARM (chrome,
   Large swarm, CR 4). Read: a clumped mass of fist-sized spherical drones packed together
   into one roughly ovoid swarm-cluster, each drone a small studded ball bristling with
   short antenna-spikes, a hard-radiation glow leaking from the gaps between them. Chrome
   register: gunmetal/cracked-white drone shells + a sickly green-white radiation glow.
   NO eye quads — small flat sensor dots per drone instead. Whole-object grammar: one
   function, one frame, no anchors (all "drones" are unlofted blobs stitched into the mass —
   nothing floats free of the cluster). Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildVoidBloomDroneSwarm(){
  const P = {
    shell:0x8a8e90, shellDk:0x54585a, shellLt:0xaeb2b4,
    crack:0x3e4143,
    spike:0x35383a,
    glow:0xa8e878, glowDk:0x4a7a34, glowHot:0xd8ffb0,
    sensor:0x1c1e1a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- the clumped mass — a cluster of small drone-spheres packed into one ovoid swarm ---------- */
  /* layout: a set of drone centers arranged in a rough ovoid clump, sizes varying, all touching
     so the mass reads as one merged cluster (no anchors — each sphere is authored directly here). */
  const drones = [
    {c:V( 0.00, 0.55,  0.00), r:0.22, hex:P.shell},
    {c:V( 0.20, 0.62,  0.10), r:0.16, hex:P.shellDk},
    {c:V(-0.20, 0.60, -0.08), r:0.17, hex:P.shell},
    {c:V( 0.14, 0.42,  0.22), r:0.15, hex:P.shellLt},
    {c:V(-0.16, 0.40, -0.20), r:0.16, hex:P.shellDk},
    {c:V( 0.02, 0.78,  0.02), r:0.15, hex:P.shell},
    {c:V( 0.28, 0.46, -0.14), r:0.13, hex:P.shellDk},
    {c:V(-0.26, 0.52,  0.16), r:0.14, hex:P.shell},
    {c:V( 0.00, 0.30,  0.00), r:0.15, hex:P.shellLt},
    {c:V(-0.06, 0.68, -0.24), r:0.12, hex:P.shellDk},
    {c:V( 0.24, 0.72,  0.05), r:0.12, hex:P.shell},
  ];

  for(const d of drones){
    blob(d.c.x, d.c.y, d.c.z, d.r, d.r, d.r, d.hex, 7, 4);
    /* a couple of short antenna-spikes bristling off each drone */
    for(const [ax,ay,az] of [[d.r*0.7,d.r*0.7,0],[-d.r*0.6,d.r*0.4,d.r*0.6]]){
      const base = V(d.c.x+ax*0.7, d.c.y+ay*0.7, d.c.z+az*0.7);
      const tip  = V(d.c.x+ax*1.5, d.c.y+ay*1.5, d.c.z+az*1.5);
      tube(base, tip, 0.014, 0.003, 3, P.spike);
    }
    /* small flat sensor dot on the drone face (no eye quads — a dead-flat pit sensor) */
    {
      const fx=d.c.x, fy=d.c.y, fz=d.c.z+d.r*0.9;
      quad(V(fx-0.025,fy-0.02,fz), V(fx+0.025,fy-0.02,fz), V(fx+0.02,fy+0.02,fz), V(fx-0.02,fy+0.02,fz), P.sensor, 0.04);
    }
    /* cracked shell fracture on some units */
    if(d.r>0.14) quad(V(d.c.x-0.04,d.c.y+d.r*0.6,d.c.z), V(d.c.x+0.01,d.c.y+d.r*0.6,d.c.z), V(d.c.x+0.03,d.c.y-d.r*0.2,d.c.z), V(d.c.x-0.02,d.c.y-d.r*0.2,d.c.z), P.crack, 0.06);
  }

  /* hard-radiation glow leaking from the gaps between the packed drones — small glow wisps
     seeded at the seams between neighboring spheres */
  const seams = [
    V(0.10,0.58,0.05), V(-0.10,0.56,-0.04), V(0.07,0.36,0.11), V(-0.08,0.35,-0.10),
    V(0.14,0.68,-0.05), V(-0.15,0.50,0.08), V(0.01,0.60,-0.12), V(0.16,0.44,0.02),
  ];
  for(const s of seams){
    quad(V(s.x-0.03,s.y-0.03,s.z), V(s.x+0.03,s.y-0.03,s.z), V(s.x+0.025,s.y+0.03,s.z), V(s.x-0.025,s.y+0.03,s.z), P.glow, 0.2);
    quad(V(s.x-0.015,s.y-0.015,s.z+0.005), V(s.x+0.015,s.y-0.015,s.z+0.005), V(s.x+0.012,s.y+0.015,s.z+0.005), V(s.x-0.012,s.y+0.015,s.z+0.005), P.glowHot, 0.25);
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
