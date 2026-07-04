/* dev/model-qa/creatures/mon-chaindevil.js — CHAIN DEVIL (bestiary id: chain-devil), gaunt fiend
   half-wrapped in animated chains, some ending in barbed hooks reaching outward. Iron-grey flayed
   flesh (VS desaturated), rust-dark chains. Whole-object grammar: one function, one merged geometry
   frame, no anchors, no eye quads (dark socket recesses only). Medium size, base disc r=0.42.
   Seeds the horned-humanoid base per docs/CREATURE-MODELS-P2.md Wave 4. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildChainDevil(){
  /* ---------- PALETTE (VS desaturated; iron-grey flayed flesh, rust-dark chains) ---------- */
  const P = {
    flesh:0x6b6660, fleshDk:0x433f3a, fleshLt:0x847d74,       // iron-grey flayed hide
    sinew:0x5a423c, sinewDk:0x362622,                          // exposed sinew striping
    horn:0x2b2622, hornLt:0x413a33,
    socket:0x14110e,                                           // dark eye-socket recess
    chain:0x5a3f30, chainDk:0x36231a, chainLt:0x76543e,        // rust-dark chain iron
    hook:0x3a2c22, hookLt:0x574234,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — gaunt humanoid, slight forward hunch, held tight/coiled. ---------- */
  const L = {
    hipY:0.62, waistY:0.78, ribY:0.92, chestY:1.04, shldY:1.14, neckY:1.20,
    jawY:1.24, cheekY:1.30, browY:1.365, crownY:1.42,
    hipHalf:0.115, shoulderX:0.205,
  };

  /* ---------- TORSO — gaunt, ribs-showing, a narrow loft (never a bulky read). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.150, rz:0.120, hex:P.fleshDk},
      {y:L.waistY, rx:0.140, rz:0.110, hex:P.flesh},
      {y:L.ribY,   rx:0.175, rz:0.130, hex:P.sinew},          // ribcage bulge
      {y:L.chestY, rx:0.190, rz:0.140, hex:P.flesh},
      {y:L.shldY,  rx:0.210, rz:0.145, hex:P.fleshLt},
      {y:L.neckY,  rx:0.100, rz:0.090, hex:P.fleshDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.neckY+0.02, 0), P.fleshDk);
    /* sinew striping down the ribcage — dark vertical strips over flayed flesh */
    for(const s of [-0.09,0.0,0.09]){
      quad(V(s-0.02,L.hipY+0.04,0.11), V(s+0.02,L.hipY+0.04,0.11),
           V(s+0.015,L.chestY+0.02,0.135), V(s-0.015,L.chestY+0.02,0.135), P.sinewDk, 0.05);
    }
  }

  /* ---------- HEAD — gaunt skull-like, small horn stubs, dark socket recesses (NO eye quads). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.088, rz:0.092, hex:P.flesh},
      {y:L.cheekY, rx:0.100, rz:0.098, hex:P.fleshLt},
      {y:L.browY,  rx:0.092, rz:0.084, hex:P.fleshDk},
      {y:L.crownY, rx:0.060, rz:0.056, hex:P.fleshDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.crownY+0.05, 0.02), P.fleshDk);
    /* dark socket recesses — hollow eye pits, shape not paint */
    for(const s of [-1,1]){
      const c = V(s*0.038, L.browY-0.01, 0.098);
      quad(c.clone().add(V(-0.018,-0.012,0)), c.clone().add(V(0.018,-0.012,0)),
           c.clone().add(V(0.012,0.014,-0.01)), c.clone().add(V(-0.012,0.014,-0.01)), P.socket, 0.02);
    }
    /* gaunt jaw slit (mouth as a dark recess line) */
    quad(V(-0.045,L.jawY-0.03,0.09), V(0.045,L.jawY-0.03,0.09), V(0.03,L.jawY-0.035,0.10), V(-0.03,L.jawY-0.035,0.10), P.socket, 0.03);
    /* short curved horn stubs on the brow */
    for(const s of [-1,1]){
      const hb = V(s*0.055, L.browY+0.03, 0.03);
      const ht = V(s*0.09, L.crownY+0.10, -0.02);
      tube(hb, ht, 0.024, 0.006, 5, P.horn, {capB:{hex:P.hornLt, lift:0.004}, capA:{hex:P.hornLt}});
    }
  }

  /* ---------- ARMS — gaunt, held out slightly from the body so chains can wrap them. ---------- */
  const armEnd = { L:null, R:null };
  {
    for(const s of [-1,1]){
      const S=V(s*L.shoulderX, L.shldY-0.02, 0.0);
      const E=V(s*0.28, L.ribY-0.08, 0.06);
      const W=V(s*0.30, L.waistY-0.10, 0.10);
      tube(S,E,0.062,0.048,6,P.flesh);
      tube(E,W,0.046,0.032,6,P.fleshDk);
      /* clawed hand */
      for(const off of [-1,0,1]){
        const kb=W.clone().add(V(s*0.01,-0.01,off*0.024));
        const kt=kb.clone().add(V(s*0.03,-0.05,off*0.01));
        tube(kb,kt,0.014,0.005,4,P.fleshDk,{capB:{hex:P.hook, lift:0.004}});
      }
      if(s<0) armEnd.L=W; else armEnd.R=W;
    }
  }

  /* ---------- LEGS — gaunt, digitigrade-ish, clawed feet. ---------- */
  {
    for(const s of [-1,1]){
      const hip=V(s*L.hipHalf, L.hipY-0.02, 0.0);
      const knee=V(s*0.135, 0.32, 0.05);
      const ank=V(s*0.115, 0.075, 0.02);
      tube(hip,knee,0.088,0.062,6,P.flesh);
      tube(knee,ank,0.060,0.040,6,P.fleshDk);
      const heel=V(ank.x,0.045,ank.z);
      tube(heel, heel.clone().add(V(0,0,0.10)), 0.048,0.034,5,P.fleshDk,{capA:{hex:P.fleshDk}});
      for(const off of [-1,0,1]){
        const tb=heel.clone().add(V(off*0.03,0,0.10));
        const tt=tb.clone().add(V(off*0.008,-0.02,0.045));
        tube(tb,tt,0.016,0.005,4,P.fleshDk,{capB:{hex:P.hook, lift:0.004}});
      }
    }
  }

  /* ---------- CHAINS — animated chains snaking out from the torso, some coiling around the body,
     some ending in barbed HOOKS reaching outward. Authored as short alternating-twist tube links. --- */
  const chainLink=(c0,c1,c2,ra=0.030)=>{
    tube(c0,c1, ra, ra*0.92, 6, P.chain, {phase:0});
    tube(c1,c2, ra*0.92, ra*0.85, 6, P.chainDk, {phase:Math.PI/6});
  };
  const hookEnd=(base,dir)=>{
    const d=dir.clone().normalize();
    const shaftEnd=base.clone().addScaledVector(d,0.14);
    tube(base, shaftEnd, 0.028, 0.020, 6, P.chainLt);
    const side=new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    const curveMid=shaftEnd.clone().addScaledVector(d,0.05).addScaledVector(side,0.03).add(V(0,-0.03,0));
    const tip=curveMid.clone().addScaledVector(d,-0.02).add(V(0,-0.09,0));
    tube(shaftEnd, curveMid, 0.020, 0.014, 5, P.hook);
    tube(curveMid, tip, 0.014, 0.004, 5, P.hookLt, {capB:{hex:P.hookLt, lift:0.004}});
  };

  /* chain 1: coils around the torso (waist to chest), free end reaching to the right with a hook */
  {
    const a=V(-0.16, L.waistY-0.02, 0.10), b=V(0.18, L.ribY+0.02, -0.11),
          c=V(-0.14, L.chestY+0.03, 0.12), d=V(0.30, L.chestY-0.02, 0.02),
          e=V(0.46, L.ribY-0.05, 0.10);
    chainLink(a,b,c); chainLink(c,d,e);
    hookEnd(e, V(0.85,-0.15,0.4));
  }
  /* chain 2: drapes off the left shoulder, hangs down along the flank, hook near the hip */
  {
    const a=V(-0.21, L.shldY-0.02, 0.02), b=V(-0.30, L.ribY-0.05, 0.05),
          c=V(-0.34, L.waistY-0.03, 0.02), d=V(-0.30, L.hipY-0.06, 0.10);
    chainLink(a,b,c); chainLink(c,d, V(-0.24,L.hipY-0.16,0.16));
    hookEnd(V(-0.24,L.hipY-0.16,0.16), V(-0.4,-0.5,0.3));
  }
  /* chain 3: rises up and back over the shoulder, arcs behind the head, barbed hook reaching up-back */
  {
    const a=V(0.10, L.shldY+0.02, -0.08), b=V(0.06, L.neckY+0.14, -0.22),
          c=V(-0.05, L.crownY+0.10, -0.20), d=V(-0.14, L.crownY+0.22, -0.10);
    chainLink(a,b,c); chainLink(c,d, V(-0.20,L.crownY+0.30,0.02));
    hookEnd(V(-0.20,L.crownY+0.30,0.02), V(-0.3,0.6,0.5));
  }
  /* chain 4: short, wraps the near forearm/wrist, trailing a hook below the hand */
  if(armEnd.R){
    const a=armEnd.R.clone().add(V(0.02,0.05,-0.02));
    const b=armEnd.R.clone().add(V(0.06,-0.02,0.03));
    const c=armEnd.R.clone().add(V(0.05,-0.10,0.05));
    chainLink(a,b,c,0.022);
    hookEnd(c, V(0.3,-0.8,0.2));
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
