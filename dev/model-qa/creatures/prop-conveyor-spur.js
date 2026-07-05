/* dev/model-qa/creatures/prop-conveyor-spur.js — CONVEYOR SPUR (CHROME set piece, Large).
   A waist-high segmented belt line jutting into the room — the read: two parallel armored SIDE
   RAILS running on stub legs, a line of raised roller-drums between them, a slack conveyor BELT
   draped over the rollers with visible sag between drums, and a small end-drum housing where the
   line terminates mid-room (jutting off, not connecting to anything — an orphaned spur). Scuffed
   gunmetal/chrome, VS-desaturated (gritted-tech, not showroom). One function, one geometry frame,
   no anchors. Sits on base disc r=0.55 (Large). Imported by prop-conveyor-spur-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropConveyorSpur(){
  /* ---------- PALETTE ---------- */
  const P = {
    rail:0x53585b, railDk:0x393d3f, railLt:0x6f7477,        // side rails
    leg:0x3f4244, legDk:0x2b2d2e,                            // support legs
    drum:0x6a6f72, drumDk:0x484c4e,                          // roller drums
    belt:0x2e2b28, beltLt:0x423e39,                          // rubber belt (dark, worn)
    end:0x565a5c, endDk:0x3a3d3f,                             // end-drum housing
    rust:0x5a4a35, scuff:0x8a8f90,
    disc:0x3a3838, discTop:0x454242,
  };

  const railY = 0.46;          // waist-high rail top
  const railLen = 1.55;        // running along +z, jutting into the room from -z
  const z0 = -railLen*0.5, z1 = railLen*0.5;
  const railXs = [-0.24, 0.24];

  /* ---------- SUPPORT LEGS — a few stub legs holding the rails at waist height ---------- */
  {
    const legZs = [z0+0.12, 0, z1-0.30];
    for(const lz of legZs) for(const lx of railXs){
      const foot = V(lx, 0.04, lz);
      const top  = V(lx, railY-0.06, lz);
      tube(foot, top, 0.045, 0.036, 6, P.leg, {capA:{hex:P.legDk}});
      // small foot pad
      const f1=ring(V(lx,0.03,lz), V(0,1,0), 0.06,0.06,6,0);
      const f2=ring(V(lx,0.055,lz), V(0,1,0), 0.055,0.055,6,0);
      stitch([f1,f2], ()=>P.legDk);
    }
  }

  /* ---------- SIDE RAILS — two parallel armored beams running the length ---------- */
  for(const lx of railXs){
    tube(V(lx,railY,z0), V(lx,railY,z1), 0.055, 0.055, 8, P.rail, {phase:Math.PI/8, capA:{hex:P.railDk}, capB:{hex:P.railDk}});
    // a raised lip along the top of the rail
    quad(V(lx-0.025,railY+0.05,z0), V(lx+0.025,railY+0.05,z0), V(lx+0.025,railY+0.05,z1), V(lx-0.025,railY+0.05,z1), P.railLt, 0.05);
  }

  /* ---------- ROLLER DRUMS — a line of raised drums between the rails ---------- */
  const drumZs = [];
  for(let z=z0+0.10; z<=z1-0.10; z+=0.26) drumZs.push(z);
  for(const dz of drumZs){
    const axis = V(1,0,0);
    const c = V(0, railY+0.045, dz);
    const r1 = ring(V(-0.24,c.y,dz), axis, 0.055,0.055,8,0);
    const r2 = ring(V(0.24,c.y,dz), axis, 0.055,0.055,8,0);
    stitch([r1,r2], (b,i)=> (i%2? P.drum : P.drumDk));
    capFan(r1, V(-0.27,c.y,dz), P.drumDk, true);
    capFan(r2, V(0.27,c.y,dz), P.drumDk);
  }

  /* ---------- BELT — a slack strip draped over the drum-tops, sagging between drums ---------- */
  {
    const half = 0.20; // belt half-width along x
    for(let i=0;i<drumZs.length-1;i++){
      const zA=drumZs[i], zB=drumZs[i+1], zM=(zA+zB)/2;
      const yTop = railY+0.10, sag=0.035;
      // top surface: two quads meeting at a sagging midpoint (a shallow V catenary read)
      quad(V(-half,yTop,zA), V(half,yTop,zA), V(half,yTop-sag,zM), V(-half,yTop-sag,zM), P.belt, 0.05);
      quad(V(-half,yTop-sag,zM), V(half,yTop-sag,zM), V(half,yTop,zB), V(-half,yTop,zB), P.beltLt, 0.05);
      // belt sides (thin skirt down to drum height)
      for(const s of [-1,1]){
        quad(V(s*half,yTop,zA), V(s*half,yTop-sag,zM), V(s*half,yTop-0.03,zM), V(s*half,yTop-0.02,zA), P.belt, 0.06);
      }
    }
  }

  /* ---------- END-DRUM HOUSING — a small boxy terminus at +z end (the spur just... stops) ---------- */
  {
    const ez = z1+0.02, ey = railY+0.02;
    const hx=0.30, hy=0.14, hz=0.10;
    const c=(sx,sy,sz)=>V(sx*hx, ey+sy*hy, ez+sz*hz);
    quad(c(-1,-1,1),c(1,-1,1),c(1,1,1),c(-1,1,1), P.end, 0.05);        // front
    quad(c(1,-1,-1),c(-1,-1,-1),c(-1,1,-1),c(1,1,-1), P.endDk, 0.05);  // back
    quad(c(-1,-1,-1),c(-1,-1,1),c(-1,1,1),c(-1,1,-1), P.end, 0.06);    // left
    quad(c(1,-1,1),c(1,-1,-1),c(1,1,-1),c(1,1,1), P.endDk, 0.06);      // right
    quad(c(-1,1,-1),c(-1,1,1),c(1,1,1),c(1,1,-1), P.end, 0.04);        // top
    // a warning-stripe-less scuffed panel accent
    quad(c(-0.7,-0.4,1.001),c(0.7,-0.4,1.001),c(0.7,0.5,1.001),c(-0.7,0.5,1.001), P.endDk, 0.05);
  }

  /* ---------- scuffs + oxidation streaks ---------- */
  quad(V(-0.20,railY+0.02,z0+0.3), V(-0.12,railY+0.03,z0+0.3), V(-0.13,railY+0.16,z0+0.15), V(-0.21,railY+0.15,z0+0.15), P.rust, 0.06);
  quad(V(0.10,railY+0.02,z1-0.4), V(0.20,railY+0.03,z1-0.4), V(0.19,railY+0.14,z1-0.55), V(0.09,railY+0.13,z1-0.55), P.scuff, 0.08);

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
