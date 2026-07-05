/* dev/model-qa/creatures/rlm-mustard-fog-sprite.js — Mustard Fog Sprite (theater, Medium, CR 1).
   A low-rolling pocket of living gas hunting by sound. Whole-object grammar: one merged frame, a
   billowing amorphous rolling gas-cloud mass built from stacked overlapping blob-ish rings low to
   the ground, with a faint sickly luminous core and thin tendrils questing/listening outward.
   VS-desaturated toxic palette (dull sickly mustard-yellow-green fog, dirty ochre core, bruised
   green-brown fringe) — read as GAS, not flesh. NO eye quads — no face at all, just a dim glowing
   core deep inside the cloud. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMustardFogSprite(){
  const P = {
    fog:0x7a7440, fogDk:0x504c2a, fogLt:0x928c52,
    fringe:0x5c5030, fringeDk:0x3a3320,
    core:0x9a8f3a, coreGlow:0xb8a848,
    disc:0x4a4630, discTop:0x565038,
  };

  /* ---------- LANDMARKS — a low rolling mass, wider than tall, billowing asymmetric lobes. ---------- */
  const baseY = 0.10;
  const S = {
    lobeA: V(-0.14, baseY+0.10, 0.06),
    lobeB: V(0.10, baseY+0.16, -0.08),
    lobeC: V(0.0, baseY+0.22, 0.14),
    core:  V(0.0, baseY+0.14, 0.0),
  };

  /* ---------- BILLOWING FOG LOBES — several overlapping blob-ring stacks at offset centers,
     the "rolling gas cloud" read, no hard edges, uneven lumpy silhouette. ---------- */
  const lobeSpecs = [
    {c:S.lobeA, rx:0.26, ry:0.20, rz:0.24, hex:P.fog},
    {c:S.lobeB, rx:0.24, ry:0.22, rz:0.22, hex:P.fogLt},
    {c:S.lobeC, rx:0.20, ry:0.18, rz:0.22, hex:P.fogDk},
    {c:V(0.02,baseY+0.06,-0.20), rx:0.18, ry:0.14, rz:0.18, hex:P.fog},
    {c:V(-0.20,baseY+0.05,-0.10), rx:0.16, ry:0.13, rz:0.16, hex:P.fringe},
    {c:V(0.20,baseY+0.02,0.16), rx:0.16, ry:0.12, rz:0.16, hex:P.fringe},
  ];
  for(const L of lobeSpecs){
    const bands=6, n=9;
    const rings=[];
    for(let k=0;k<=bands;k++){
      const t=k/bands, ang=t*Math.PI, yy=L.c.y + L.ry*(-Math.cos(ang));
      const rr=Math.sin(ang);
      rings.push(ring(V(L.c.x,yy,L.c.z), V(0,1,0), L.rx*rr+0.0001, L.rz*rr+0.0001, n, Math.PI/n));
    }
    stitch(rings, ()=>L.hex);
  }

  /* ---------- QUESTING TENDRILS — thin wisps of gas reaching outward, "hunting by sound" gesture. ---------- */
  {
    const tendrilSpots = [
      [-0.34, baseY+0.14, 0.02, -0.16, 0.10],
      [0.30, baseY+0.10, -0.10, 0.14, -0.06],
      [0.02, baseY+0.06, 0.34, 0.02, 0.18],
      [-0.10, baseY+0.28, -0.24, -0.06, -0.14],
      [0.18, baseY+0.30, 0.18, 0.10, 0.10],
    ];
    for(const [x,y,z,dx,dz] of tendrilSpots){
      const base = V(x,y,z);
      const mid = V(x+dx*0.6, y+0.04, z+dz*0.6);
      const tip = V(x+dx, y+0.02, z+dz);
      tube(base, mid, 0.045, 0.024, 5, P.fogLt);
      tube(mid, tip, 0.024, 0.004, 5, P.fringeDk, {capB:{hex:P.fringeDk, lift:0.002}});
    }
  }

  /* ---------- SICKLY GLOWING CORE — a dim luminous nucleus deep inside the mass, the only "face". ---------- */
  {
    const n=10, ph=Math.PI/n;
    const outer = ring(S.core, V(0,1,0), 0.09, 0.09, n, ph);
    const inner = ring(V(S.core.x,S.core.y+0.01,S.core.z), V(0,1,0), 0.05, 0.05, n, ph);
    stitch([outer,inner], ()=>P.core);
    capFan(inner, V(S.core.x,S.core.y+0.02,S.core.z), P.coreGlow);
    capFan(inner, V(S.core.x,S.core.y,S.core.z), P.coreGlow, true);
  }

  /* ---------- fringe darkening at the low skirts where the gas meets the ground ---------- */
  {
    quad(V(-0.30,baseY-0.02,0.10), V(-0.10,baseY-0.02,0.16), V(-0.14,baseY+0.06,0.10), V(-0.32,baseY+0.06,0.06), P.fringeDk, 0.08);
    quad(V(0.10,baseY-0.02,-0.20), V(0.30,baseY-0.02,-0.10), V(0.28,baseY+0.06,-0.06), V(0.10,baseY+0.06,-0.16), P.fringeDk, 0.08);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
