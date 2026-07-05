/* dev/model-qa/creatures/rlm-signal-moth.js — the SIGNAL MOTH (chrome realm, Small).
   A static-mimicking moth-shape latched onto the base of a skull. Read: broad flat static-textured
   wings (an antenna-dish moth silhouette) folded low over a small clinging body, with a skull
   clamped beneath it as its perch/host — the skull reads as landmark furniture the moth grips,
   not a separate creature. NO eye quads on the moth (antenna nubs + a blunt proboscis-probe only);
   the skull is bare bone with dark empty sockets (not a "quad eye" — a socket shape, per the
   authoring contract's NO eye quads rule = sockets are fine, glowing eye-quads are not). VS-desaturated:
   static-grey wing scales, bone the color of old chrome-realm refuse. Whole-object grammar: one
   function, one frame, no anchors. Small size: base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSignalMoth(){
  /* ---------- PALETTE ---------- */
  const P = {
    wing:0x767468, wingDk:0x54524a, wingLt:0x928f80,        // static-grey mimicking wings
    static:0xa8a596,                                          // pale static-noise fleck
    body:0x3f3d36, bodyDk:0x2a2925,                           // small clinging thorax/abdomen
    antenna:0x232220,
    bone:0xa89c86, boneDk:0x7d735f, socket:0x1c1a16,          // skull perch (bare bone, dark sockets)
    disc:0x3a382f, discTop:0x46443a,
  };

  /* ---------- LANDMARKS — skull sits low as the perch; moth body clings on top, wings fan flat. ---------- */
  const skY = 0.12;
  const S = {
    skullC:  V(0, skY, 0.0),
    thorax:  V(0, skY+0.14, -0.02),
    abdomen: V(0, skY+0.10, -0.14),
    wingHL:  V(-0.02, skY+0.16, -0.02),
    wingHR:  V( 0.02, skY+0.16, -0.02),
  };

  /* ---------- SKULL — the perch furniture the moth clamps to; bare bone, empty sockets, no jaw motion. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:skY-0.05, cz:0.06, rx:0.115, rz:0.130, hex:P.bone},   // jaw/cheek
      {y:skY+0.03, cz:0.02, rx:0.135, rz:0.140, hex:P.boneDk}, // cranium widest
      {y:skY+0.09, cz:0.00, rx:0.100, rz:0.105, hex:P.bone},   // crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, skY+0.13, 0.00), P.bone);
    capFan(rings[0], V(0, skY-0.08, 0.06), P.boneDk, true);
    // empty eye sockets — dark recessed shapes, not glowing quads
    for(const s of [-1,1]){
      quad(V(s*0.09-0.02,skY+0.02,0.14), V(s*0.09+0.02,skY+0.02,0.14),
           V(s*0.09+0.018,skY-0.02,0.135), V(s*0.09-0.018,skY-0.02,0.135), P.socket, 0.0);
    }
    // nasal cavity notch + jaw crease line
    quad(V(-0.012,skY-0.01,0.16), V(0.012,skY-0.01,0.16), V(0.008,skY-0.05,0.155), V(-0.008,skY-0.05,0.155), P.socket, 0.0);
  }

  /* ---------- MOTH BODY — small clinging thorax/abdomen resting on the skull crown. ---------- */
  tube(S.abdomen, S.thorax, 0.045, 0.055, 6, P.bodyDk, {phase:Math.PI/6, capA:{hex:P.bodyDk, lift:0.01}});
  tube(S.thorax, V(0, skY+0.17, 0.06), 0.055, 0.030, 6, P.body, {phase:Math.PI/6, capB:{hex:P.body, lift:0.01}});
  // antenna nubs (no eyes — just short blunt feelers)
  for(const s of [-1,1]) tube(V(s*0.02,skY+0.19,0.07), V(s*0.05,skY+0.24,0.11), 0.010, 0.003, 3, P.antenna, {capB:{hex:P.antenna, lift:0.003}});

  /* ---------- WINGS — broad flat static-textured, folded LOW and wide over the skull, mimicry pattern. ---------- */
  {
    const mkWing=(side)=>{
      const root = V(side*0.03, skY+0.16, -0.02);
      const tip  = V(side*0.34, skY+0.10, 0.10);
      const back = V(side*0.30, skY+0.06, -0.22);
      const notch= V(side*0.15, skY+0.14, -0.28);
      // main wing panel (two tris via a quad, flat and broad)
      quad(root, V(side*0.20, skY+0.15, 0.06), tip, V(side*0.22, skY+0.09, -0.04), P.wing, 0.08);
      quad(V(side*0.22, skY+0.09, -0.04), tip, back, notch, P.wingDk, 0.08);
      // static-noise flecks scattered on the wing (small pale quads = the "static mimicry" texture read)
      const flecks = [[0.10,0.02],[0.18,-0.05],[0.26,0.04],[0.14,-0.12],[0.22,-0.16]];
      for(const [fx,fz] of flecks){
        const p = V(side*fx, skY+0.11+ (fz*0.1), fz);
        quad(V(p.x-0.018,p.y+0.01,p.z), V(p.x+0.018,p.y+0.01,p.z), V(p.x+0.014,p.y-0.01,p.z-0.02), V(p.x-0.014,p.y-0.01,p.z-0.02), P.static, 0.1);
      }
      // ragged wing-edge teeth
      for(const t of [-0.24,-0.10,0.02]){
        quad(V(side*(0.26+t*0.1), skY+0.07, t), V(side*(0.30+t*0.1), skY+0.07, t-0.02),
             V(side*(0.28+t*0.1), skY+0.04, t-0.05), V(side*(0.24+t*0.1), skY+0.05, t-0.03), P.wingLt, 0.06);
      }
    };
    mkWing(-1); mkWing(1);
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.036,0), V(0,1,0), 0.305, 0.305, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.038,0), P.discTop);
  }
}
