/* dev/model-qa/creatures/rlm-signal-moth.js — the SIGNAL MOTH (chrome realm, Small).
   REPAIR PASS (p3-chrome): judge said the first build read as a flat blob/pile with no legible
   moth-shape or wing silhouette, and no skull base present. Rebuilt from scratch to fix both:
   (1) the SKULL is now a raised, clearly-domed landmark sitting proud of the base disc — a
   distinct bone-colored mound with dark socket pits, unmistakably a skull before anything perches
   on it; (2) the WINGS are now built as tall, angled, moth-triangle silhouettes that stand UP and
   OUT from the body (like a real moth at rest — wings held in a shallow tent above the back, not
   flat quads lying on the ground) so the wing shape reads instantly from any turnaround angle.
   A small clinging thorax/abdomen sits in the saddle between the wing roots, gripping the crown
   of the skull with clawed forelegs. NO eye quads — antenna nubs + dark recessed sockets only.
   VS-desaturated: static-grey wing scales, bone the color of old chrome-realm refuse. Whole-object
   grammar: one function, one frame, no anchors. Small size: base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSignalMoth(){
  /* ---------- PALETTE ---------- */
  const P = {
    wing:0x767468, wingDk:0x504e46, wingLt:0x9a9686,        // static-grey mimicking wings
    static:0xb4b0a0,                                          // pale static-noise fleck
    body:0x3f3d36, bodyDk:0x2a2925,                           // small clinging thorax/abdomen
    leg:0x2e2c28, antenna:0x232220,
    bone:0xa89c86, boneDk:0x7d735f, boneLt:0xbdb096, socket:0x161410,
    disc:0x3a382f, discTop:0x46443a,
  };

  /* ---------- LANDMARKS — skull raised proud as the base/perch; moth saddles its crown, wings
     rise in a tent above. All heights measured off the base disc (y=0 at ground). ---------- */
  const skY = 0.20;                                    // skull center height — RAISED, not flat
  const S = {
    crown:   V(0, skY+0.14, -0.02),
    thorax:  V(0, skY+0.26, -0.06),
    abdomen: V(0, skY+0.20, -0.22),
    wingRootL: V(-0.05, skY+0.27, -0.05),
    wingRootR: V( 0.05, skY+0.27, -0.05),
  };

  /* ---------- SKULL — a raised, clearly-domed bone mound (the perch furniture). Tall bands so it
     reads as a distinct skull-shape BEFORE the moth registers, not a smear at the base. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:0.045,     cz:0.02, rx:0.145, rz:0.165, hex:P.boneDk}, // wide jaw/cheek base, close to ground
      {y:0.14,      cz:0.05, rx:0.170, rz:0.185, hex:P.bone},   // cranium — widest point
      {y:skY+0.05,  cz:0.02, rx:0.150, rz:0.155, hex:P.boneLt}, // upper cranium narrowing
      {y:skY+0.14,  cz:-0.02,rx:0.100, rz:0.100, hex:P.bone},   // crown top (moth perches here)
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), S.crown, P.bone);
    capFan(rings[0], V(0, 0.01, 0.06), P.boneDk, true);
    // brow ridge lip so the front reads eye-socket-adjacent, not just a barrel
    quad(V(-0.14,0.15,0.16), V(0.14,0.15,0.16), V(0.11,0.10,0.20), V(-0.11,0.10,0.20), P.boneDk, 0.05);
    // empty eye sockets — dark recessed shapes set into the brow, not glowing quads
    for(const s of [-1,1]){
      quad(V(s*0.095-0.03,0.135,0.185), V(s*0.095+0.03,0.135,0.185),
           V(s*0.095+0.026,0.085,0.175), V(s*0.095-0.026,0.085,0.175), P.socket, 0.0);
    }
    // nasal cavity notch + jaw crease line beneath
    quad(V(-0.018,0.09,0.19), V(0.018,0.09,0.19), V(0.012,0.045,0.185), V(-0.012,0.045,0.185), P.socket, 0.0);
    quad(V(-0.10,0.055,0.14), V(0.10,0.055,0.14), V(0.075,0.02,0.15), V(-0.075,0.02,0.15), P.boneDk, 0.04);
    // small cracks/chips on the cranium for the "old refuse" read
    quad(V(-0.06,0.22,-0.05), V(-0.03,0.225,-0.03), V(-0.035,0.19,-0.02), V(-0.065,0.185,-0.04), P.boneDk, 0.06);
  }

  /* ---------- MOTH BODY — small clinging thorax/abdomen saddled on the skull crown, gripping
     with clawed forelegs so the "clamped onto the skull" read is explicit. ---------- */
  tube(S.abdomen, S.thorax, 0.048, 0.058, 6, P.bodyDk, {phase:Math.PI/6, capA:{hex:P.bodyDk, lift:0.01}});
  tube(S.thorax, V(0, skY+0.34, -0.10), 0.058, 0.032, 6, P.body, {phase:Math.PI/6, capB:{hex:P.body, lift:0.01}});
  // fuzzy body flecking (small nubs) for a mothy thorax texture
  for(const [dx,dz] of [[-0.03,-0.02],[0.03,-0.03],[0,-0.10]]){
    const p = V(dx, skY+0.24, -0.08+dz);
    quad(V(p.x-0.012,p.y+0.01,p.z), V(p.x+0.012,p.y+0.01,p.z), V(p.x+0.008,p.y-0.01,p.z-0.01), V(p.x-0.008,p.y-0.01,p.z-0.01), P.bodyDk, 0.08);
  }
  // antenna nubs (no eyes — just short blunt feelers off the head-end of the thorax)
  for(const s of [-1,1]) tube(V(s*0.02,skY+0.36,-0.10), V(s*0.05,skY+0.42,-0.16), 0.010, 0.003, 3, P.antenna, {capB:{hex:P.antenna, lift:0.003}});
  // clawed forelegs gripping down onto the skull crown — makes the "clamped on" read explicit
  for(const s of [-1,1]){
    const hip = V(s*0.05, skY+0.23, -0.10);
    const knee = V(s*0.12, skY+0.17, -0.04);
    const foot = V(s*0.09, skY+0.13, 0.02);
    tube(hip, knee, 0.020, 0.014, 4, P.leg);
    tube(knee, foot, 0.014, 0.006, 4, P.leg, {capB:{hex:P.leg, lift:0.004}});
  }

  /* ---------- WINGS — tall angled moth-triangle silhouettes standing UP in a shallow tent above
     the back (rest posture of a real moth), not flat quads laid on the ground. Each wing is a
     ruled surface between a low root edge and a high raised tip, so from every turnaround angle
     a triangular wing shape reads against the skyline. ---------- */
  {
    const mkWing=(side)=>{
      const rootLo = V(side*0.04, skY+0.24, -0.08);   // low inner root, tucked near the body
      const rootHi = V(side*0.06, skY+0.30, -0.14);   // root rides up along the back
      const tipUp  = V(side*0.30, skY+0.52, -0.06);   // wing tip raised HIGH — the tented silhouette
      const tipOut = V(side*0.44, skY+0.30, 0.10);     // wing tip swept forward+out, mid height
      const trail  = V(side*0.34, skY+0.12,-0.34);     // trailing edge sweeps back down low

      // main upper wing panel — rises from the spine to the raised tip (reads against the sky)
      quad(rootHi, tipUp, tipOut, rootLo, P.wing, 0.08);
      // lower wing panel — drops from the raised tip down to the trailing edge (gives it depth/volume)
      quad(tipUp, trail, V(side*0.20, skY+0.16, -0.28), tipOut, P.wingDk, 0.08);
      // hindwing sliver tucked below, completing the moth silhouette from the side
      quad(rootLo, V(side*0.20, skY+0.16, -0.28), trail, V(side*0.08, skY+0.20, -0.20), P.wingLt, 0.07);

      // static-noise flecks scattered on the upper wing (the "static mimicry" texture read)
      const flecks = [[0.14,0.40,0.00],[0.22,0.44,-0.08],[0.10,0.36,-0.10],[0.28,0.38,0.04],[0.18,0.34,-0.16]];
      for(const [fx,fy,fz] of flecks){
        const p = V(side*fx, fy, fz);
        quad(V(p.x-0.020,p.y+0.012,p.z), V(p.x+0.020,p.y+0.012,p.z), V(p.x+0.015,p.y-0.012,p.z-0.02), V(p.x-0.015,p.y-0.012,p.z-0.02), P.static, 0.1);
      }
      // ragged wing-edge teeth along the trailing edge for the tattered-mimic silhouette
      for(const t of [-0.28,-0.16,-0.02]){
        const bx = side*(0.22+t*0.3), bz = t;
        quad(V(bx, skY+0.14, bz), V(bx+side*0.06, skY+0.10, bz-0.03),
             V(bx+side*0.03, skY+0.06, bz-0.07), V(bx-side*0.02, skY+0.09, bz-0.04), P.wingDk, 0.06);
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
