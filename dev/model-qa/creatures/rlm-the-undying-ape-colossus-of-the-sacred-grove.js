/* dev/model-qa/creatures/rlm-the-undying-ape-colossus-of-the-sacred-grove.js — THE UNDYING
   APE-COLOSSUS OF THE SACRED GROVE (lost-world, Gargantuan Construct, CR 16). Read: a titanic
   stone ape-idol animated to punish desecrators — the biggest board piece, a hunched gorilla-
   silhouette carved from grove-mossed grey stone: massive knuckle-dragging arms, a heavy brow-
   ridge, a broad flat nose-shape (no eye quads), lichen and vine growth across the shoulders/
   back reading as the "sacred grove" tell. VS-desaturated grey stone shot through with dull
   moss-green streaks. Whole-object grammar: one function, one frame, no anchors. Gargantuan
   size, base disc r=0.72. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTheUndyingApeColossusOfTheSacredGrove(){
  const P = {
    stone:0x6a6458, stoneDk:0x484338, stoneLt:0x827c6c,
    crack:0x38342c,
    moss:0x4a5c3e, mossDk:0x323f2a, mossLt:0x647a52,
    vine:0x3c4c2e, vineDk:0x28331e,
    knuckle:0x585248, nail:0x2c281f,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:1.10, waistY:1.36, ribY:1.70, chestY:2.00, shldY:2.24, neckY:2.32,
    hipHalf:0.44, shoulderX:0.92,
    jawY:2.42, cheekY:2.58, browY:2.76, crownY:2.92, headTopY:3.02,
  };

  /* ape-hunch: bent forward at the hips, knuckle-dragging posture */
  const hunch=(p)=>{
    const q=p.clone().sub(V(0,L.hipY,0));
    q.applyAxisAngle(V(1,0,0), 0.42);
    return q.add(V(0,L.hipY,0));
  };

  /* ---------- LEGS — short, thick, bent (ape stance). ---------- */
  {
    const hipL=V(-0.42,L.hipY-0.04,0.0), kneeL=V(-0.56,0.58,0.30), ankL=V(-0.54,0.16,0.14);
    const hipR=V(0.42,L.hipY-0.04,0.0), kneeR=V(0.56,0.58,0.28), ankR=V(0.54,0.16,0.12);
    tube(hipL,kneeL,0.360,0.280,8,P.stone);
    tube(kneeL,ankL,0.270,0.220,8,P.stoneDk);
    tube(hipR,kneeR,0.360,0.280,8,P.stone);
    tube(kneeR,ankR,0.270,0.220,8,P.stoneDk);
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.20,ank.z);
      tube(heel.clone().add(V(0,0,-0.06)), heel.clone().add(V(0,0,0.40)), 0.230,0.180,7,P.stone,{capA:{hex:P.stoneDk}});
      const side=Math.sign(ank.x);
      for(const off of [-1,0,1]){
        const tb=heel.clone().add(V(off*0.14,0.03,0.36)), tt=tb.clone().add(V(off*0.02,-0.02,0.10));
        tube(tb,tt,0.075,0.04,5,P.stoneDk,{capB:{hex:P.nail,lift:0.01}});
      }
    }
  }

  /* ---------- TORSO — massive gorilla barrel, wide chest, powerful shoulders. ---------- */
  stack([
    {y:L.hipY,   rx:0.560, rz:0.500, hex:P.stoneDk},
    {y:L.waistY, rx:0.600, rz:0.540, hex:P.stone},
    {y:L.ribY,   rx:0.700, rz:0.560, hex:P.stoneLt},
    {y:L.chestY, rx:0.780, rz:0.520, hex:P.stone},
    {y:L.shldY,  rx:0.860, rz:0.540, hex:P.stoneLt},
    {y:L.neckY,  rx:0.340, rz:0.320, hex:P.stoneDk},
  ], 9, {xform:hunch, capTop:{hex:P.stoneDk, lift:0.01}});

  /* cracked-stone fissure lines across the chest */
  for(const [x0,y0,x1,y1] of [[-0.24,L.chestY-0.06,-0.10,L.ribY+0.06],[0.30,L.shldY-0.08,0.16,L.chestY],[0,L.ribY,0.06,L.waistY+0.06]]){
    quad(hunch(V(x0,y0,0.36)), hunch(V(x0+0.02,y0,0.36)), hunch(V(x1+0.015,y1,0.34)), hunch(V(x1,y1,0.34)), P.crack, 0.05);
  }

  /* ---------- LICHEN/VINE GROWTH — mossy patches across the shoulders + back (the grove tell). ---------- */
  {
    const patches=[[0.5,L.shldY,0.1,0.16],[-0.55,L.shldY-0.05,-0.15,0.14],[0.2,L.ribY,-0.4,0.13],[-0.15,L.chestY,-0.36,0.11]];
    for(const [x,y,z,r] of patches){ const c=hunch(V(x,y,z)); blob(c.x,c.y,c.z,r,r*0.5,r*0.9,P.moss,6,3); }
    // trailing vines down the back
    for(const [x,z] of [[0.3,-0.4],[-0.4,-0.35]]){
      const b=hunch(V(x,L.shldY,z)), t=hunch(V(x*1.1,L.hipY-0.1,z*1.1));
      tube(b,t,0.05,0.03,5,P.vine,{capB:{hex:P.vineDk,lift:0.01}});
    }
  }

  /* ---------- HEAD — heavy sagittal crest, deep brow shelf, broad flat nose-shape (no eye quads). ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.400, rz:0.400, hex:P.stoneLt},
      {y:L.cheekY, rx:0.430, rz:0.420, hex:P.stone},
      {y:L.browY,  rx:0.400, rz:0.360, hex:P.stone},
      {y:L.crownY, rx:0.320, rz:0.300, hex:P.stoneDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* broad flat nose shape — push cheek-band front verts forward */
    for(const i of [1,2]) rings[1][i].z += 0.05;
    /* heavy brow shelf overhang */
    for(const i of [1,2]){ rings[2][i].z += 0.06; rings[2][i].y -= 0.04; }
    stitch(rings, b=>bands[b].hex);
    /* sagittal crest — a raised ridge running the crown fore-aft */
    capFan(rings.at(-1), hunch(V(0,L.headTopY,-0.02)), P.stoneDk);
    quad(hunch(V(-0.03,L.crownY+0.02,0.14)), hunch(V(0.03,L.crownY+0.02,0.14)),
         hunch(V(0.02,L.headTopY+0.08,-0.10)), hunch(V(-0.02,L.headTopY+0.08,-0.10)), P.stoneDk, 0.04);
    /* heavy jaw */
    tube(hunch(V(0,L.jawY+0.02,0.05)), hunch(V(0,L.jawY-0.22,0.34)), 0.40,0.28,7,P.stoneLt,{raz:0.35,rbz:0.20,capB:{hex:P.stoneDk}});
    /* small dumb ears */
    for(const s of [-1,1]){
      const eb=hunch(V(s*0.40,L.cheekY,0.0)), et=hunch(V(s*0.46,L.cheekY+0.12,-0.10));
      tube(eb,et,0.10,0.06,5,P.stone,{capB:{hex:P.stoneDk,lift:0.008}});
    }
  }

  /* ---------- ARMS — MASSIVE, knuckle-dragging, reaching near the ground. ---------- */
  {
    const bigFist=(ctr,dir,hex)=>{
      const d=dir.clone().normalize();
      tube(ctr.clone().addScaledVector(d,-0.18), ctr.clone().addScaledVector(d,0.18), 0.34,0.30,7,hex,{capA:{hex},capB:{hex}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1.2,-0.4,0.4,1.2]){
        const kb=ctr.clone().addScaledVector(d,0.16).addScaledVector(side,off*0.16);
        const kt=kb.clone().addScaledVector(d,0.22).addScaledVector(side,off*0.04);
        tube(kb,kt,0.09,0.04,4,hex,{capB:{hex:P.nail,lift:0.012}});
      }
    };
    const S=hunch(V(L.shoulderX-0.08,L.shldY-0.04,0.05)), E=V(1.10,1.30,0.60), W=V(0.86,0.30,0.90);
    tube(S,E,0.40,0.32,7,P.stone);
    tube(E,W,0.32,0.28,7,P.stoneDk);
    bigFist(W, V(0.1,-0.4,1), P.stoneLt);

    const S2=hunch(V(-L.shoulderX+0.08,L.shldY-0.04,0.05)), E2=V(-1.06,1.36,0.56), W2=V(-0.82,0.34,0.86);
    tube(S2,E2,0.40,0.32,7,P.stone);
    tube(E2,W2,0.32,0.28,7,P.stoneDk);
    bigFist(W2, V(-0.1,-0.4,1), P.stoneLt);
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 20);
    const r2=ring(V(0,0.066,0), V(0,1,0), 0.70, 0.70, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.069,0), P.discTop);
  }
}
