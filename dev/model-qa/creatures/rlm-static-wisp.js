/* dev/model-qa/creatures/rlm-static-wisp.js — STATIC WISP (chrome, Tiny elemental, CR 0.125).
   Read: a fist-sized knot of crackling loose current clinging to exposed metal — a small
   irregular ball-of-arcs form, a dense glowing core wrapped in jagged branching arc-tendrils
   reaching outward, sitting low as if clinging to a surface. Chrome register: the live
   blue-white "cheap miracle" glow against dark scorched-metal undertones. NO eye quads —
   this is a pure energy knot, no face at all. Whole-object grammar: one function, one frame,
   no anchors. Tiny size, base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildStaticWisp(){
  const P = {
    core:0xbdf2ff, coreDk:0x6fd8f0,
    arc:0x7fe0f5, arcDk:0x2a8fa8,
    scorch:0x201d1a, scorchDk:0x100e0c,
    disc:0x4a4038, discTop:0x585047,
  };

  const cY = 0.20;
  const core = V(0, cY, 0);

  /* dense glowing core — small irregular blob of stacked bands */
  {
    const bands=[
      {y:cY-0.09, rx:0.055, hex:P.coreDk},
      {y:cY-0.02, rx:0.085, hex:P.core},
      {y:cY+0.05, rx:0.070, hex:P.core},
      {y:cY+0.10, rx:0.035, hex:P.coreDk},
    ];
    const n=8, ph=Math.PI/n;
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,cY+0.13,0), P.coreDk);
    capFan(rings[0], V(0,cY-0.12,0), P.coreDk, true);
  }

  /* jagged branching arc-tendrils reaching outward — thin zigzag tubes off the core surface */
  {
    const tendril=(ang, tilt, len)=>{
      const dx=Math.cos(ang), dz=Math.sin(ang);
      const p0 = V(dx*0.08, cY+tilt*0.06, dz*0.08);
      const p1 = V(dx*len*0.55, cY+tilt*0.10+0.04, dz*len*0.55);
      const p2 = V(dx*len*0.85-dz*0.03, cY+tilt*0.14, dz*len*0.85+dx*0.03);
      const tip= V(dx*len+dz*0.02, cY+tilt*0.10, dz*len-dx*0.02);
      tube(p0, p1, 0.022, 0.014, 4, P.arc);
      tube(p1, p2, 0.014, 0.009, 4, P.arcDk);
      tube(p2, tip, 0.009, 0.003, 4, P.arc, {capB:{hex:P.arc, lift:0.004}});
    };
    const angles=[0.2,1.1,2.0,2.9,3.8,4.7,5.6];
    angles.forEach((a,i)=> tendril(a, (i%2? -1:1), 0.20+ (i%3)*0.03));
  }

  /* scorched metal patch it's clinging to — dark burn mark under the wisp */
  {
    quad(V(-0.14,0.005,-0.12), V(0.14,0.005,-0.12), V(0.11,0.005,0.14), V(-0.11,0.005,0.14), P.scorch, 0.06);
    quad(V(-0.07,0.008,-0.05), V(0.07,0.008,-0.05), V(0.05,0.008,0.07), V(-0.05,0.008,0.07), P.scorchDk, 0.06);
  }

  /* base disc (Tiny: r=0.32) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
