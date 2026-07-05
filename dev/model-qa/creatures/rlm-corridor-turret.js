/* dev/model-qa/creatures/rlm-corridor-turret.js — CORRIDOR TURRET (chrome, Small construct, CR 0.25).
   Read: a wall-mounted swivel-barrel turret stub — a squat pivoting drum bolted to a flush
   backplate (as if flush into a wall), a stubby twin-barrel gun projecting forward on a yoke,
   and a slit sensor-lens. Chrome register: clean hard surfaces, cheap miracles — pale gunmetal
   and white polymer, still gritted/desaturated underneath (not glossy). NO eye quads — a single
   lens slit stands in. Whole-object grammar: one function, one frame, no anchors. Small size,
   base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCorridorTurret(){
  const P = {
    hull:0x9098a0, hullDk:0x656c74, hullLt:0xb0b6bc,
    poly:0xc8cdd2, polyDk:0x8f959b,
    gun:0x484e54, gunDk:0x2c3034, gunLt:0x60666c,
    brass:0x8a8250, lens:0x2fb0c8, lensDk:0x123842,
    rivet:0x1c1e20, disc:0x4a4038, discTop:0x585047,
  };

  /* backplate + pivot column: mounted flush to a wall behind (-z), stub reaches forward (+z) */
  const spY = 0.30;
  const S = {
    plate:  V(0, spY, -0.12),
    pivot:  V(0, spY+0.04, 0.02),
    yoke:   V(0, spY+0.05, 0.14),
  };

  /* wall backplate — flat flush octagon disc standing vertical */
  {
    const r1 = ring(S.plate, V(0,0,1), 0.20, 0.20, 8, Math.PI/8);
    const r2 = ring(V(S.plate.x,S.plate.y,S.plate.z+0.03), V(0,0,1), 0.20, 0.20, 8, Math.PI/8);
    stitch([r1,r2], ()=>P.hullDk);
    capFan(r1, V(S.plate.x,S.plate.y,S.plate.z-0.01), P.hullDk, true);
    for(let i=0;i<8;i++){ const t=(i/8)*Math.PI*2;
      quad(V(Math.cos(t)*0.185,S.plate.y+Math.sin(t)*0.185,S.plate.z+0.028),
           V(Math.cos(t)*0.185+0.012,S.plate.y+Math.sin(t)*0.185+0.012,S.plate.z+0.028),
           V(Math.cos(t)*0.175+0.012,S.plate.y+Math.sin(t)*0.175+0.012,S.plate.z+0.02),
           V(Math.cos(t)*0.175,S.plate.y+Math.sin(t)*0.175,S.plate.z+0.02), P.rivet, 0.02);
    }
  }

  /* pivot collar + squat swivel drum */
  tube(S.plate, S.pivot, 0.100, 0.150, 8, P.hull, {phase:Math.PI/8});
  {
    const dB = ring(S.pivot, V(0,0,1), 0.150, 0.150, 8, Math.PI/8);
    const dT = ring(S.yoke,  V(0,0,1), 0.120, 0.120, 8, Math.PI/8);
    stitch([dB,dT], ()=>P.poly);
    capFan(dT, V(S.yoke.x,S.yoke.y,S.yoke.z+0.02), P.polyDk);
  }

  /* sensor lens slit set into the drum face */
  quad(V(-0.045,spY+0.05,0.155), V(0.045,spY+0.05,0.155), V(0.038,spY+0.02,0.16), V(-0.038,spY+0.02,0.16), P.lens, 0.05);
  quad(V(-0.030,spY+0.045,0.157), V(0.030,spY+0.045,0.157), V(0.024,spY+0.03,0.162), V(-0.024,spY+0.03,0.162), P.lensDk, 0.05);

  /* twin stub barrels on a yoke, projecting forward (+z) */
  {
    const gunBase = V(0, spY+0.02, 0.16);
    for(const s of [-1,1]){
      const bB = V(gunBase.x+s*0.045, gunBase.y, gunBase.z);
      const bT = V(gunBase.x+s*0.045, gunBase.y+0.01, gunBase.z+0.30);
      tube(bB, bT, 0.026, 0.020, 6, P.gun, {capB:{hex:P.gunDk, lift:0.006}});
      quad(V(bB.x-0.03,gunBase.y-0.03,gunBase.z-0.01), V(bB.x+0.03,gunBase.y-0.03,gunBase.z-0.01),
           V(bB.x+0.026,gunBase.y+0.03,gunBase.z+0.01), V(bB.x-0.026,gunBase.y+0.03,gunBase.z+0.01), P.gunLt, 0.03);
    }
    /* yoke brace connecting the barrels */
    quad(V(-0.07,gunBase.y+0.01,gunBase.z-0.01), V(0.07,gunBase.y+0.01,gunBase.z-0.01),
         V(0.07,gunBase.y-0.04,gunBase.z+0.01), V(-0.07,gunBase.y-0.04,gunBase.z+0.01), P.gunDk, 0.03);
  }

  /* brass hazard-band ring around the drum equator */
  {
    const bB = ring(V(S.pivot.x,S.pivot.y-0.02,S.pivot.z+0.02), V(0,0,1), 0.140, 0.140, 8, Math.PI/8);
    const bT = ring(V(S.pivot.x,S.pivot.y+0.02,S.pivot.z+0.02), V(0,0,1), 0.140, 0.140, 8, Math.PI/8);
    stitch([bB,bT], ()=>P.brass);
  }

  /* base disc (Small: r=0.32) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
