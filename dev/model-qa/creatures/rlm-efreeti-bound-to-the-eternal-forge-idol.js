/* dev/model-qa/creatures/rlm-efreeti-bound-to-the-eternal-forge-idol.js — EFREETI BOUND TO THE
   ETERNAL FORGE-IDOL (lost-world, Large Elemental, CR 11). Read: a flame-wreathed genie-smith
   chained at the wrist/ankle to a squat basalt idol-forge, forced to stoke it forever — a
   powerful humanoid torso tapering to a smokey lower coil (no legs, genie-tail read), broad
   smith's shoulders, a crown of guttering flame instead of hair, molten cracks across bronze-
   black skin. VS-desaturated: charcoal-bronze skin lit by dull ember-orange (never candy-fire).
   Whole-object grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildEfreetiBoundToTheEternalForgeIdol(){
  const P = {
    skin:0x4a3a30, skinDk:0x33261f, skinLt:0x62483a,
    crack:0xb85a28, crackDk:0x7a3616, ember:0xd9772f, emberLt:0xf0a04a,
    flame:0x8a3a1c, flameDk:0x5c260f,
    smoke:0x3a352e, smokeLt:0x53483a,
    chain:0x2b2823, chainLt:0x3f3a32,
    idol:0x2c2924, idolDk:0x1c1a17, idolLt:0x413c34,
    cloth:0x5c4028, clothDk:0x3c2818,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    coilY:0.10, hipY:0.62, waistY:0.94, ribY:1.18, chestY:1.38, shldY:1.54, neckY:1.62,
    jawY:1.72, cheekY:1.82, browY:1.92, crownY:2.00,
  };

  /* ---------- SMOKY LOWER COIL — genie-tail read, tapering from hips down into curling smoke. ---------- */
  {
    const pts=[V(0,L.hipY-0.02,0), V(0.05,0.42,-0.06), V(0.10,0.26,-0.02), V(0.06,0.14,0.10), V(-0.02,0.06,0.16)];
    const rad=[0.26,0.24,0.19,0.13,0.07];
    for(let i=0;i<pts.length-1;i++){
      const hex = i%2===0? P.smoke : P.smokeLt;
      tube(pts[i], pts[i+1], rad[i], rad[i+1], 8, hex, {phase:Math.PI/8});
    }
    // curling smoke wisp trailing off
    tube(pts.at(-1), V(-0.10,0.03,0.24), 0.05,0.02,6,P.smokeLt,{capB:{hex:P.smokeLt,lift:0.01}});
  }

  /* ---------- TORSO — a powerful smith's frame, broad shoulders, cracked bronze-black skin. ---------- */
  {
    const bands=[
      {y:L.hipY,   rx:0.300, rz:0.260, hex:P.skinDk},
      {y:L.waistY, rx:0.320, rz:0.270, hex:P.skin},
      {y:L.ribY,   rx:0.350, rz:0.280, hex:P.skinLt},
      {y:L.chestY, rx:0.400, rz:0.290, hex:P.skin},
      {y:L.shldY,  rx:0.480, rz:0.300, hex:P.skinLt},
      {y:L.neckY,  rx:0.170, rz:0.160, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    /* molten crack lines across the chest — glowing ember fissures */
    for(const [z0,y0,z1,y1] of [[0.24,L.chestY-0.05,0.10,L.ribY+0.03],[-0.20,L.shldY-0.04,-0.06,L.chestY+0.02]]){
      quad(V(-0.02,y0,z0), V(0.02,y0,z0), V(0.015,y1,z1), V(-0.015,y1,z1), P.crack, 0.06);
    }
    for(const [x,y,z] of [[0.14,L.chestY,0.28],[-0.18,L.ribY,0.22],[0.06,L.shldY-0.05,0.24]]){
      blob(x,y,z,0.045,0.03,0.02,P.ember,4,3);
    }
  }

  /* ---------- SMITH'S APRON — a heavy scorched leather apron over the waist/hips. ---------- */
  {
    quad(V(-0.30,L.chestY-0.10,0.20), V(0.30,L.chestY-0.10,0.20), V(0.26,L.hipY-0.10,0.30), V(-0.26,L.hipY-0.10,0.30), P.cloth, 0.05);
    quad(V(-0.26,L.hipY-0.10,0.30), V(0.26,L.hipY-0.10,0.30), V(0.18,L.hipY-0.32,0.30), V(-0.18,L.hipY-0.32,0.30), P.clothDk, 0.05);
  }

  /* ---------- HEAD — heavy jaw, deep brow, a crown of guttering flame instead of hair. ---------- */
  {
    const bands=[
      {y:L.jawY,   rx:0.150, rz:0.145, hex:P.skinLt},
      {y:L.cheekY, rx:0.160, rz:0.150, hex:P.skin},
      {y:L.browY,  rx:0.140, rz:0.125, hex:P.skinDk},
      {y:L.crownY, rx:0.110, rz:0.100, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.crownY+0.03,0.0), P.skinDk);
    /* heavy jaw wedge */
    tube(V(0,L.jawY+0.01,0.02), V(0,L.jawY-0.12,0.16), 0.150,0.10,6,P.skinLt,{raz:0.13,rbz:0.08,capB:{hex:P.skinDk}});
    /* flame crown — several guttering flame tongues rising from the crown */
    for(const [dx,dz,h] of [[0,0,0.30],[0.07,0.04,0.22],[-0.07,-0.02,0.20],[0.04,-0.07,0.18],[-0.05,0.06,0.16]]){
      const b=V(dx,L.crownY+0.02,dz), t=V(dx*1.4,L.crownY+h,dz*1.4);
      tube(b,t,0.045,0.012,5,P.flame,{capB:{hex:P.emberLt,lift:0.01}});
    }
  }

  /* ---------- ARMS — one raised, gripping the chain up; one hammering down toward the forge. ---------- */
  {
    // right arm: raised, chained wrist
    const S=V(0.44,L.shldY-0.02,0.02), E=V(0.60,L.chestY+0.10,-0.10), W=V(0.56,L.neckY+0.34,-0.20);
    tube(S,E,0.150,0.115,7,P.skin);
    tube(E,W,0.115,0.085,7,P.skinDk,{capB:{hex:P.skinDk,lift:0.01}});
    // left arm: swung down, gripping a smith's hammer toward the idol
    const S2=V(-0.44,L.shldY-0.02,0.02), E2=V(-0.52,L.ribY-0.10,0.24), W2=V(-0.44,L.hipY-0.20,0.42);
    tube(S2,E2,0.150,0.115,7,P.skin);
    tube(E2,W2,0.115,0.085,7,P.skinDk,{capB:{hex:P.skinDk,lift:0.01}});
    // hammer head at W2
    tube(V(-0.44,L.hipY-0.22,0.44),V(-0.44,L.hipY-0.30,0.60),0.06,0.05,5,P.chain);
    quad(V(-0.56,L.hipY-0.34,0.58),V(-0.32,L.hipY-0.34,0.58),V(-0.32,L.hipY-0.22,0.58),V(-0.56,L.hipY-0.22,0.58),P.idolDk,0.04);
  }

  /* ---------- CHAIN — links running from the raised wrist down to the idol below. ---------- */
  {
    const chainPts=[V(0.56,L.neckY+0.34,-0.20), V(0.44,L.neckY+0.10,-0.10), V(0.30,L.chestY-0.10,0.02), V(0.20,L.ribY-0.10,0.14), V(0.16,L.hipY-0.10,0.24)];
    for(let i=0;i<chainPts.length-1;i++){
      const mid=chainPts[i].clone().lerp(chainPts[i+1],0.5);
      const r1=ring(mid,new THREE.Vector3().subVectors(chainPts[i+1],chainPts[i]).normalize(),0.028,0.020,6);
      const r2=ring(mid,V(0,1,0),0.028,0.020,6);
      stitch([r1,r2],()=>P.chainLt);
      tube(chainPts[i],mid,0.024,0.024,5,P.chain);
      tube(mid,chainPts[i+1],0.024,0.024,5,P.chain);
    }
  }

  /* ---------- IDOL-FORGE — a squat basalt idol with a glowing forge-mouth, low and to the front. ---------- */
  {
    const c=V(0.10,0,0.36);
    const b1=ring(V(c.x,0.02,c.z),V(0,1,0),0.28,0.24,8), b2=ring(V(c.x,0.30,c.z),V(0,1,0),0.24,0.20,8), b3=ring(V(c.x,0.44,c.z),V(0,1,0),0.16,0.14,8);
    stitch([b1,b2],()=>P.idol); stitch([b2,b3],()=>P.idolLt);
    capFan(b3,V(c.x,0.50,c.z),P.idolDk);
    // forge-mouth glow
    quad(V(c.x-0.10,0.18,c.z+0.20),V(c.x+0.10,0.18,c.z+0.20),V(c.x+0.08,0.32,c.z+0.20),V(c.x-0.08,0.32,c.z+0.20),P.ember,0.08);
    blob(c.x,0.24,c.z+0.20,0.06,0.05,0.02,P.emberLt,4,3);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
