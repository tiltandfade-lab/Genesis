/* dev/model-qa/creatures/rlm-gas-cloud-horror.js — Gas Cloud Horror (theater, trench lens, Large,
   CR 4). A roiling, undissipated gas cloud with a hunting will of its own: a low rolling mass of
   billowing quad-blobs (sickly yellow-green core, duller drifting fringe), with faint dark
   silhouette-suggestions roiling inside the mass (never solidified into a body — the horror is
   that it's just gas that hunts). No skeleton/limbs — this is a bespoke amorphous-cloud grammar,
   whole-object: a cluster of overlapping soft ellipsoid puffs (blob()) at varied heights forming
   one low, wide, drifting mass with a slight forward lean (motion read). NO eye quads (a suggestion
   of a dark maw-void low in the mass instead). Large disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGasCloudHorror(){
  const P = {
    core:0x8a9a4e, coreDk:0x62703a, coreLt:0xa8b868,
    fringe:0x6a7a58, fringeDk:0x4a5640,
    void_:0x1c1e14,
    tint:0x7c8a56,
    disc:0x3e4030, discTop:0x4c4e3c,
  };

  /* ---------- CORE MASS — a cluster of overlapping soft puffs forming a low, wide rolling body. ---------- */
  blob(0,     0.34, 0.10, 0.32,0.24,0.30, P.core,   8,5);
  blob(0.22,  0.30, -0.06,0.24,0.20,0.24, P.coreLt, 7,5);
  blob(-0.24, 0.28, -0.02,0.24,0.19,0.24, P.coreDk, 7,5);
  blob(0.08,  0.44, 0.24, 0.22,0.17,0.20, P.coreLt, 7,4);
  blob(-0.10, 0.40, 0.28, 0.20,0.16,0.19, P.core,   7,4);

  /* ---------- FRINGE — duller, thinner drifting puffs trailing off the core, wispy edges. ---------- */
  blob(0.40,  0.20, -0.28,0.16,0.11,0.16, P.fringe,   6,4);
  blob(-0.42, 0.18, -0.24,0.15,0.10,0.15, P.fringeDk, 6,4);
  blob(0.30,  0.16, 0.44, 0.14,0.10,0.14, P.fringe,   6,4);
  blob(-0.28, 0.14, 0.42, 0.13,0.09,0.13, P.fringeDk, 6,4);
  blob(0.02,  0.12, -0.44,0.15,0.10,0.15, P.fringe,   6,4);
  blob(0.48,  0.34, 0.06, 0.12,0.09,0.12, P.fringeDk, 5,3);
  blob(-0.46, 0.36, 0.10, 0.12,0.09,0.12, P.fringe,   5,3);

  /* ---------- ROILING INTERNAL SILHOUETTES — faint dark roiling suggestions inside the mass, never
     solidifying into a body — just texture read as something moving within the gas. ---------- */
  for(const [dx,dy,dz,r] of [[0.06,0.30,0.12,0.07],[-0.10,0.26,0.06,0.06],[0.14,0.36,0.22,0.05],[-0.06,0.20,-0.04,0.055]]){
    quad(V(dx-r,dy,dz), V(dx+r,dy,dz+0.02), V(dx+r*0.6,dy-r,dz), V(dx-r*0.6,dy-r,dz-0.02), P.fringeDk, 0.1);
  }
  // tint wisps streaking off the top, motion read (forward lean toward +z, the hunt)
  for(const [x,y0,z0] of [[0.14,0.52,0.30],[-0.12,0.50,0.26],[0.0,0.56,0.18]]){
    const a=V(x,y0,z0), b=V(x*1.4,y0+0.10,z0+0.20);
    tube(a,b,0.045,0.006,5,P.tint,{capB:{hex:P.tint,lift:0.01}});
  }

  /* ---------- DARK MAW-VOID — a suggestion low in the mass, not an eye, not a face — just an
     absence, the "hunting will" tell. Faces the +z direction of travel. ---------- */
  {
    const vx=0.0, vy=0.24, vz=0.32;
    quad(V(vx-0.09,vy+0.05,vz), V(vx+0.09,vy+0.05,vz+0.01), V(vx+0.06,vy-0.08,vz-0.02), V(vx-0.06,vy-0.08,vz-0.02), P.void_, 0.0);
    blob(vx,vy-0.02,vz-0.01,0.07,0.05,0.06,P.void_,6,3);
  }

  /* ---------- base disc (Large: r=0.55) — the gas mass rolls low OVER the disc, doesn't stand on it. ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
