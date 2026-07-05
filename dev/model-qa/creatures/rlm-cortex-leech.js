/* dev/model-qa/creatures/rlm-cortex-leech.js — the CORTEX LEECH (chrome realm, Small).
   A segmented neural parasite riding a spinal cyberware port. Read: a slick segmented leech-body
   arched over and clamped onto a stub of exposed spinal cyberware port (vertebral hardware jutting
   from a socket base), thin probing tendrils burrowing into the port's data-jack slots. NO eye
   quads — a blunt sucker-mouth clamped to the port only. VS-desaturated: wet blue-black leech
   hide, dull chrome port hardware, grimy exposed circuitry. Whole-object grammar: one function,
   one frame, no anchors. Small size: base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCortexLeech(){
  /* ---------- PALETTE ---------- */
  const P = {
    leech:0x33404a, leechDk:0x212a30, leechLt:0x475864,      // wet blue-black leech hide
    seg:0x1a2126,
    sucker:0x171d21, suckerLt:0x2b363d,                        // sucker-mouth
    port:0x5c6066, portDk:0x3e4145, portLt:0x767a80,           // chrome cyberware port hardware
    jack:0x2a2c2e,                                              // data-jack slots
    wire:0x6a5a2e, wireGlow:0x9ab84a,                           // probing tendril / signal glow
    disc:0x2c2e28, discTop:0x363832,
  };

  /* ---------- LANDMARKS — spinal port is the base furniture; leech arches over it, clamped down. ---------- */
  const portY = 0.14;
  const S = {
    portBase: V(0, portY-0.06, 0.0),
    portTop:  V(0, portY+0.14, 0.02),
    tail:     V(-0.14, portY+0.20, -0.10),
    arch1:    V(-0.04, portY+0.32, 0.02),
    arch2:    V( 0.06, portY+0.30, 0.14),
    clamp:    V( 0.10, portY+0.16, 0.22),
    head:     V( 0.08, portY+0.06, 0.24),
  };

  /* ---------- SPINAL PORT — chrome cyberware hardware jutting from a socket base, the perch. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:portY-0.08, cz:0.0, rx:0.115, rz:0.10, hex:P.portDk},
      {y:portY+0.02, cz:0.0, rx:0.085, rz:0.075, hex:P.port},
      {y:portY+0.10, cz:0.01, rx:0.065, rz:0.06, hex:P.portLt},
      {y:portY+0.16, cz:0.01, rx:0.050, rz:0.05, hex:P.port},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,portY-0.10,0.0), P.portDk);
    capFan(rings.at(-1), V(0,portY+0.19,0.01), P.portLt);
    // data-jack slot recesses around the port collar
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+0.4;
      const p=V(Math.cos(a)*0.075, portY+0.05, 0.01+Math.sin(a)*0.065);
      quad(V(p.x-0.012,p.y+0.01,p.z), V(p.x+0.012,p.y+0.01,p.z), V(p.x+0.010,p.y-0.01,p.z), V(p.x-0.010,p.y-0.01,p.z), P.jack, 0.0);
    }
  }

  /* ---------- LEECH BODY — segmented, arching up off the port and clamping back down forward. ---------- */
  tube(S.tail, S.arch1, 0.028, 0.048, 7, P.leechDk, {phase:Math.PI/7, capA:{hex:P.leechDk, lift:0.006}});
  tube(S.arch1, S.arch2, 0.048, 0.052, 7, P.leech,   {phase:Math.PI/7});
  tube(S.arch2, S.clamp, 0.052, 0.040, 7, P.leechLt, {phase:Math.PI/7});
  tube(S.clamp, S.head,  0.040, 0.030, 6, P.leechDk, {phase:Math.PI/6});

  // segment crease rings along the arch
  for(const c of [S.arch1, S.arch2, S.clamp]){
    const r = ring(c, V(0.2,1,0.1), 0.045, 0.045, 7, Math.PI/7);
    stitch([r, ring(V(c.x,c.y-0.006,c.z), V(0.2,1,0.1), 0.043, 0.043, 7, Math.PI/7)], ()=>P.seg);
  }

  /* ---------- SUCKER-MOUTH — clamped down over the port's top face, no eye quads. ---------- */
  {
    const mC = S.head;
    const rOut = ring(mC, V(0.3,-0.6,0.7), 0.034, 0.034, 7, Math.PI/7);
    capFan(rOut, V(mC.x, mC.y-0.03, mC.z+0.02), P.sucker);
    // sucker rim highlight ring
    const rimHi = ring(V(mC.x,mC.y+0.008,mC.z), V(0.3,-0.6,0.7), 0.036, 0.036, 7, Math.PI/7);
    stitch([rimHi, rOut], ()=>P.suckerLt);
  }

  /* ---------- PROBING TENDRILS — thin filaments reaching from the body into the jack slots. ---------- */
  {
    const rootA = V(0.02, portY+0.24, 0.06);
    const rootB = V(-0.02, portY+0.22, 0.10);
    for(const [root,tgt] of [[rootA, V(0.075,portY+0.05,0.065)], [rootB, V(-0.065,portY+0.05,0.045)]]){
      const mid = V((root.x+tgt.x)/2, (root.y+tgt.y)/2+0.02, (root.z+tgt.z)/2);
      tube(root, mid, 0.012, 0.008, 4, P.wire, {capA:{hex:P.leechDk}});
      tube(mid, tgt, 0.008, 0.003, 4, P.wireGlow, {capB:{hex:P.wireGlow, lift:0.002}});
    }
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.036,0), V(0,1,0), 0.305, 0.305, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.038,0), P.discTop);
  }
}
