/* dev/model-qa/creatures/rlm-ghost-router-ai.js — GHOST-ROUTER AI (chrome, Medium, CR 4).
   Read: a flickering translucent hologram AI haunting a decommissioned server rack — a
   thin, semi-solid humanoid-ish silhouette of scan-lines and glitch-fragments hovering
   above the dead rack unit, tethered by light. Chrome register: cracked white server plate
   below, cold cyan-white ghost-glow above — cheap miracle gone derelict. NO eye quads — a
   flat glitching visor-band of scan-lines. Whole-object grammar: one function, one frame,
   no anchors. Medium size, base disc r=0.42 (the rack footprint stands in for the disc). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGhostRouterAI(){
  const P = {
    rack:0xaeb2b4, rackDk:0x6e7274, rackLt:0xcfd2d3, crack:0x4a4d4f,
    port:0x2c2f31, led:0x3a3e40,
    ghost:0x8fe8f2, ghostDk:0x2c7a8a, ghostLt:0xcaf6fa,
    glitch:0xd84f8a, glitchDk:0x7a2050,
    visor:0x1c4650, visorGlow:0xbdf4fb,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- decommissioned server rack — the dead hardware base, replacing open ground ---------- */
  {
    const rx=0.34, rz=0.20, ry0=0.02, ry1=0.62;
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:ry0, rx, rz, hex:P.rackDk},
      {y:ry0+0.30, rx, rz, hex:P.rack},
      {y:ry1, rx:rx*0.98, rz:rz*0.98, hex:P.rack},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,ry1+0.02,0), P.rackDk);
    /* server bay slats, cracked plate, dead port lights */
    for(let i=0;i<5;i++){
      const y = 0.10 + i*0.10;
      quad(V(-0.30,y,rz-0.001), V(0.30,y,rz-0.001), V(0.30,y+0.02,rz-0.001), V(-0.30,y+0.02,rz-0.001), P.rackDk, 0.04);
      quad(V(-0.24+ (i%2)*0.4,y+0.03,rz+0.001), V(-0.20+(i%2)*0.4,y+0.03,rz+0.001), V(-0.20+(i%2)*0.4,y+0.055,rz+0.001), V(-0.24+(i%2)*0.4,y+0.055,rz+0.001), P.port, 0.03);
    }
    /* crack fracture across the front plate */
    quad(V(-0.06,0.55,rz+0.002), V(-0.02,0.55,rz+0.002), V(0.08,0.10,rz+0.002), V(0.04,0.10,rz+0.002), P.crack, 0.08);
  }

  /* ---------- the GHOST — a thin translucent humanoid-ish flicker-figure hovering above the rack ---------- */
  const gY = 0.78; // ghost hovers above the rack top
  const S = {
    hip:   V(0, gY,      0.02),
    waist: V(0, gY+0.20, 0.01),
    chest: V(0, gY+0.42, -0.01),
    neck:  V(0, gY+0.58, 0),
    headB: V(0, gY+0.62, 0),
    headT: V(0, gY+0.78, 0),
  };
  /* thin, semi-solid, scan-line torso — narrower than a normal humanoid (ghost read) */
  tube(S.hip, S.waist, 0.095, 0.088, 7, P.ghostDk, {phase:Math.PI/7});
  tube(S.waist, S.chest, 0.088, 0.110, 7, P.ghost,  {phase:Math.PI/7});
  tube(S.chest, S.neck, 0.110, 0.055, 7, P.ghostDk, {phase:Math.PI/7, capB:{hex:P.ghost, lift:0.01}});
  /* horizontal scan-line bands cut across the torso — glitch read */
  for(let i=0;i<6;i++){
    const y = gY + 0.05 + i*0.10;
    if(i%2===0) continue; // gaps read as flicker
    quad(V(-0.12,y,0.02), V(0.12,y,0.02), V(0.11,y+0.015,-0.02), V(-0.11,y+0.015,-0.02), P.ghostLt, 0.15);
  }
  /* glitch-fragment chunks breaking off the silhouette edges (pink corrupted glitch color) */
  for(const [dx,dy,dz] of [[0.14,0.10,0.02],[-0.16,0.30,-0.02],[0.12,0.50,0.03],[-0.10,0.62,0.0]]){
    const px=dx, py=gY+dy, pz=dz;
    quad(V(px-0.03,py,pz), V(px+0.03,py,pz), V(px+0.025,py+0.05,pz), V(px-0.025,py+0.05,pz), P.glitch, 0.2);
  }

  /* head — a thin ghost-head, flat glitching scan-line visor-band (no eye quads) */
  {
    const n=7, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, rx:0.072, rz:0.066, hex:P.ghostDk},
      {y:S.headB.y+0.08, rx:0.078, rz:0.070, hex:P.ghost},
      {y:S.headT.y-0.02, rx:0.066, rz:0.058, hex:P.ghostDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.ghostDk);
    /* flat glitching visor-band across the face */
    quad(V(-0.055,S.headT.y-0.09,0.055), V(0.055,S.headT.y-0.09,0.055), V(0.050,S.headT.y-0.11,0.05), V(-0.050,S.headT.y-0.11,0.05), P.visor, 0.05);
    quad(V(-0.035,S.headT.y-0.097,0.058), V(0.035,S.headT.y-0.097,0.058), V(0.030,S.headT.y-0.105,0.053), V(-0.030,S.headT.y-0.105,0.053), P.visorGlow, 0.15);
  }

  /* thin trailing wisp-arms, fading toward the ends (no hands needed — ghost dissolve) */
  {
    const armWisp=(sx)=>{
      const sh = V(sx*0.11, S.chest.y-0.02, 0);
      const el = V(sx*0.16, S.chest.y-0.22, 0.03);
      const tip= V(sx*0.15, S.chest.y-0.38, 0.02);
      tube(sh, el, 0.036, 0.024, 5, P.ghost, {phase:Math.PI/5});
      tube(el, tip, 0.022, 0.004, 5, P.ghostDk, {phase:Math.PI/5, capB:{hex:P.ghostDk, lift:0.004}});
    };
    armWisp(-1); armWisp(1);
  }

  /* dissolving wisp trail where the "legs" should be — no feet, just fading tendrils into the rack */
  {
    const tail=(sx)=>{
      const t0=V(sx*0.06, S.hip.y+0.02, 0.0);
      const t1=V(sx*0.05, gY-0.10, 0.0);
      const t2=V(sx*0.03, 0.66, 0.0);
      tube(t0,t1,0.06,0.035,6,P.ghostDk,{phase:Math.PI/6});
      tube(t1,t2,0.035,0.006,6,P.ghost,{phase:Math.PI/6, capB:{hex:P.ghost, lift:0.004}});
    };
    tail(-1); tail(1);
  }

  /* tether beam — a thin light column linking the ghost's core down to the rack top (grounds the figure) */
  {
    const b0=V(0,0.64,0), b1=V(0,gY-0.02,0.02);
    tube(b0,b1,0.03,0.05,6,P.ghostLt,{phase:Math.PI/6});
  }

  /* base disc (Medium: r=0.42) — sits flush around the rack footprint */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.014,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.017,0), P.discTop);
  }
}
