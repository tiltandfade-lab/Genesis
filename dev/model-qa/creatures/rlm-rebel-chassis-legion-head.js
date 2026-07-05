/* dev/model-qa/creatures/rlm-rebel-chassis-legion-head.js — REBEL CHASSIS LEGION-HEAD (chrome,
   Large construct, CR 9). Read: a networked command-node — a tall antenna-crowned command
   chassis standing on a tripod of stabilizer legs, its "head" a rotating sensor-drum broadcasting
   to a self-replicating drone swarm (read here as small satellite-drones docked in cradle-arms
   around its shoulders, ready to launch). Chrome register: rebel-salvage patchwork chrome, cooler
   blue-white signal glow (vs the Oracle Mainframe's hostile red) — this is the "rebel" faction
   read. NO eye quads — a rotating sensor-band slit instead. Whole-object grammar: one function,
   one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRebelChassisLegionHead(){
  const P = {
    hull:0x565d60, hullDk:0x353b3d, hullLt:0x767d80,
    patch:0x4a4038, patchDk:0x312a20,          // scavenged salvage-patch plating, off-tone
    sig:0x6fd8f0, sigDk:0x1c5a68, sigGlow:0x9ceaf8,
    drone:0x3a4144, droneDk:0x22272a,
    leg:0x454b4e, legDk:0x2a2f31,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    base:  V(0, 0.60, 0),
    mid:   V(0, 1.05, 0),
    neck:  V(0, 1.42, 0),
    headB: V(0, 1.46, 0),
    headT: V(0, 1.72, 0),
  };

  /* central command-chassis column — tall, narrower than the Mainframe (this reads "command
     node" not "server block") */
  tube(S.base, V(0,0.86,0), 0.30, 0.24, 8, P.hullDk, {phase:Math.PI/8});
  tube(V(0,0.86,0), S.mid, 0.24, 0.20, 8, P.hull, {phase:Math.PI/8});
  tube(S.mid, S.neck, 0.20, 0.13, 8, P.patch, {phase:Math.PI/8});
  /* salvage-patch plates riveted at odd angles down the column — rebel patchwork read */
  quad(V(-0.22,0.70,0.18), V(-0.08,0.74,0.21), V(-0.09,0.92,0.19), V(-0.23,0.88,0.16), P.patchDk, 0.07);
  quad(V(0.06,0.66,0.20), V(0.22,0.68,0.19), V(0.21,0.86,0.17), V(0.05,0.84,0.185), P.hullLt, 0.06);

  /* sensor-drum head — a rotating drum with a slit signal-band, crowned by a splayed antenna array */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,       rx:0.135, rz:0.128, hex:P.hullDk},
      {y:S.headB.y+0.11,  rx:0.145, rz:0.135, hex:P.hull},
      {y:S.headT.y-0.04,  rx:0.130, rz:0.120, hex:P.hullDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.hullDk);

    /* rotating sensor-band slit wrapping the drum — the "eye" read, a full band not a quad pair */
    const sc = V(0, S.headB.y+0.13, 0);
    const sr1 = ring(sc, V(0,1,0), 0.148, 0.138, n, ph);
    const sr2 = ring(V(0,sc.y+0.03,0), V(0,1,0), 0.148, 0.138, n, ph);
    stitch([sr1,sr2], ()=>P.sig);
    /* bright glow seam facing forward */
    quad(V(-0.09,sc.y,0.135), V(0.09,sc.y,0.135), V(0.085,sc.y+0.03,0.132), V(-0.085,sc.y+0.03,0.132), P.sigGlow, 0.1);

    /* splayed antenna array crowning the head, broadcasting to the swarm */
    for(const [dx,dz] of [[-0.10,-0.02],[0.0,0.0],[0.10,-0.02],[-0.05,0.10],[0.05,0.10]]){
      const ab = V(dx*0.6, S.headT.y-0.02, dz*0.6);
      const at = V(dx*1.8, S.headT.y+0.20, dz*1.8);
      tube(ab, at, 0.018, 0.006, 4, P.hullLt, {capB:{hex:P.sigGlow, lift:0.01}});
    }
  }

  /* cradle-arms around the shoulders holding small docked satellite-drones, ready to launch —
     this is the "self-replicating drone swarm" read, visible without a separate swarm model */
  {
    const dockDrone=(ang, dist)=>{
      const bx=Math.cos(ang)*dist, bz=Math.sin(ang)*dist;
      const cradleBase = V(bx*0.55, 0.98, bz*0.55);
      const cradleTip = V(bx, 1.02, bz);
      tube(cradleBase, cradleTip, 0.035, 0.022, 5, P.legDk);
      /* the docked drone — a tiny boxy chassis with its own glow-slit */
      const dc = V(cradleTip.x, cradleTip.y, cradleTip.z);
      quad(V(dc.x-0.06,dc.y-0.05,dc.z-0.06), V(dc.x+0.06,dc.y-0.05,dc.z-0.06), V(dc.x+0.055,dc.y+0.05,dc.z-0.05), V(dc.x-0.055,dc.y+0.05,dc.z-0.05), P.drone, 0.06);
      quad(V(dc.x-0.04,dc.y-0.01,dc.z-0.062), V(dc.x+0.04,dc.y-0.01,dc.z-0.062), V(dc.x+0.035,dc.y+0.01,dc.z-0.058), V(dc.x-0.035,dc.y+0.01,dc.z-0.058), P.sigGlow, 0.1);
    };
    dockDrone(0.5, 0.42); dockDrone(1.9, 0.42); dockDrone(3.4, 0.40); dockDrone(4.9, 0.42);
  }

  /* tripod of stabilizer legs — three thick mechanical legs (not four; distinct from the Mainframe) */
  {
    const stabLeg=(ang)=>{
      const bx=Math.cos(ang)*0.26, bz=Math.sin(ang)*0.24;
      const hip  = V(bx, 0.52, bz);
      const knee = V(bx*2.0, 0.34, bz*2.0);
      const foot = V(bx*2.5, 0.03, bz*2.5);
      tube(hip, knee, 0.115, 0.085, 6, P.leg, {phase:Math.PI/6});
      tube(knee, foot, 0.085, 0.050, 6, P.legDk, {phase:Math.PI/6, capB:{hex:P.legDk, lift:0.015}});
      quad(V(foot.x-0.06,0.03,foot.z-0.06), V(foot.x+0.06,0.03,foot.z-0.06), V(foot.x+0.055,0.01,foot.z+0.07), V(foot.x-0.055,0.01,foot.z+0.07), P.legDk, 0.03);
    };
    stabLeg(Math.PI*0.5); stabLeg(Math.PI*1.5+0.6); stabLeg(Math.PI*1.5-0.6);
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
