/* dev/model-qa/creatures/mon-merrow.js — the MERROW (bespoke BIPED, hulking aquatic ogre-shark).
   Bestiary merrow: a brutish fish-ogre. The read: a hunched, big-bellied biped hauling a
   shark-toothed maw, fin-frills running the arms/back, webbed clawed hands, hunched posture (from
   a lifetime hauling under waves). Grey-green scaled hide (VS desaturated), pale mottled belly.
   NO eye quads (sockets only). Whole-object grammar: one function, one geometry frame, no anchors.
   Large-ish brute; base disc r=0.55. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildMerrow(){
  /* ---------- PALETTE (VS desaturated; grey-green scaled hide, pale mottled belly) ---------- */
  const P = {
    hide:0x51624f, hideDk:0x394636, hideLt:0x647560, hideMot:0x445640,   // grey-green scaled hide
    belly:0x8a9080, bellyDk:0x666e5c,                                     // pale mottled belly
    fin:0x3a4a42, finDk:0x27332c,                                        // dorsal/arm fin-frills
    tooth:0xcdc9a8, toothDk:0x9f9c80,                                    // shark teeth
    mouth:0x241d1a, socket:0x161311, claw:0x211d18, web:0x475447,        // webbed hand
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — hunched brute, gut-forward slump, wide splayed stance. ---------- */
  const L = {
    hipY:0.62, gutY:0.78, waistY:0.92, ribY:1.10, chestY:1.28, shldY:1.42, neckY:1.48,
    hipHalf:0.230, shoulderX:0.400,
    jawY:1.54, cheekY:1.66, browY:1.76, crownY:1.86, headTopY:1.92,
  };
  /* hunch — a forward tip of the upper body about the hips (heavy, load-hauling posture) */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.22);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — big-bellied barrel, hunched, tapering to a thick neckless shoulder mass. --- */
  stack([
    {y:L.hipY,   rx:0.290, rz:0.270, hex:P.hideDk},
    {y:L.gutY,   rx:0.365, rz:0.370, hex:P.belly},        // gut balloons
    {y:L.waistY, rx:0.380, rz:0.375, hex:P.bellyDk},       // widest band — the paunch
    {y:L.ribY,   rx:0.320, rz:0.270, hex:P.hide},
    {y:L.chestY, rx:0.330, rz:0.250, hex:P.hideLt},
    {y:L.shldY,  rx:0.400, rz:0.270, hex:P.hide},          // hulking shoulders
    {y:L.neckY,  rx:0.195, rz:0.180, hex:P.hideDk},
  ], 8, {xform:hunch, capTop:{hex:P.hideDk, lift:0.008}});

  /* mottle patches on flank/belly */
  for(const [y,rx,rz,cx,hex] of [
    [L.gutY+0.01, 0.150, 0.130, -0.15, P.hideMot],
    [L.waistY-0.02, 0.140, 0.125, 0.18, P.bellyDk],
  ]){
    const rings=[
      ring(V(cx,y-0.05,0.05), V(0,1,0), rx*0.85, rz*0.85, 7, Math.PI/7).map(hunch),
      ring(V(cx,y+0.05,0.05), V(0,1,0), rx, rz, 7, Math.PI/7).map(hunch),
    ];
    stitch(rings, ()=>hex);
    capFan(rings[1], hunch(V(cx,y+0.11,0.05)), hex);
  }

  /* ---------- DORSAL FIN-FRILL — a row of small fin spikes running the spine, neck to hips. --- */
  {
    const seg = [
      [L.hipY+0.05,-0.10],[L.waistY+0.02,-0.08],[L.ribY+0.02,-0.07],
      [L.chestY,-0.06],[L.shldY-0.02,-0.05],
    ];
    for(const [y,z] of seg){
      const base = hunch(V(0,y,z));
      const tip  = hunch(V(0,y+0.14,z-0.03));
      tube(base, tip, 0.028, 0.006, 4, P.fin, {capA:{hex:P.finDk}, capB:{hex:P.finDk, lift:0.004}});
    }
  }

  /* ---------- HEAD — brutish, flattened crown, wide shark-toothed maw, dark eye sockets. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.205, rz:0.220, hex:P.hideLt},   // wide jaw/cheek
      {y:L.cheekY, rx:0.190, rz:0.190, hex:P.hide},
      {y:L.browY,  rx:0.165, rz:0.150, hex:P.hide},
      {y:L.crownY, rx:0.110, rz:0.100, hex:P.hideDk},   // flattened crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* push brow/jaw forward slightly for a forward-jutting shark-brute muzzle read */
    for(const i of [1,2]){ rings[0][i].z += 0.045; rings[1][i].z += 0.030; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], hunch(V(0, L.headTopY, -0.02)), P.hideDk);

    /* EYE SOCKETS — dark recesses, no eye quads, sunk into the brow */
    for(const s of [-1,1]){
      const c = hunch(V(s*0.075, L.browY+0.01, 0.185));
      const c2 = hunch(V(s*0.075, L.browY-0.005, 0.155));
      tube(c, c2, 0.030, 0.022, 5, P.socket, {capA:{hex:P.socket, lift:0.003}});
    }

    /* MAW — a wide underslung jaw wedge jutting forward, ringed with shark teeth. */
    const jawFrontBot = hunch(V(0, L.jawY-0.115, 0.235));
    tube(hunch(V(0,L.jawY+0.01,0.05)), jawFrontBot, 0.195, 0.120, 6, P.hideLt, {raz:0.150, rbz:0.095, capB:{hex:P.mouth}});
    quad(hunch(V(-0.10,L.jawY-0.06,0.20)), hunch(V(0.10,L.jawY-0.06,0.20)),
         hunch(V(0.075,L.jawY-0.115,0.225)), hunch(V(-0.075,L.jawY-0.115,0.225)), P.mouth, 0.03);
    /* shark teeth — a jagged row of small pale triangular tubes along the lower jaw line */
    for(let i=0;i<7;i++){
      const t=i/6, x=-0.095+t*0.19;
      const base=hunch(V(x, L.jawY-0.075, 0.215));
      const tip =hunch(V(x, L.jawY-0.015+((i%2)*0.02), 0.222));
      tube(base, tip, 0.016, 0.003, 3, P.tooth, {capB:{hex:P.toothDk, lift:0.003}});
    }
    /* a couple of nub ears / gill-ridges low on the sides */
    for(const s of [-1,1]){
      const eb = hunch(V(s*0.190, L.cheekY, 0.00));
      const et = hunch(V(s*0.220, L.cheekY+0.03, -0.05));
      tube(eb, et, 0.045, 0.024, 4, P.finDk, {raz:0.030, rbz:0.014, capB:{hex:P.fin, lift:0.004}});
    }
  }

  /* ---------- ARMS — heavy, fin-frilled, ending in webbed clawed hands. ---------- */
  const webbedHand = (ctr, faceDir, hex)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.06), ctr.clone().addScaledVector(d,0.06),
         0.100, 0.088, 5, hex, {raz:0.070, rbz:0.070, capA:{hex}, capB:{hex}});
    /* webbing panels between splayed clawed fingers */
    for(const off of [-1,0,1]){
      const kb = ctr.clone().addScaledVector(d,0.055).addScaledVector(side, off*0.062);
      const kt = kb.clone().addScaledVector(d,0.100).addScaledVector(side, off*0.018);
      tube(kb, kt, 0.026, 0.009, 4, P.web, {capB:{hex:P.claw, lift:0.005}});
    }
    const wb0=ctr.clone().addScaledVector(d,0.06).addScaledVector(side,-0.055);
    const wb1=ctr.clone().addScaledVector(d,0.06).addScaledVector(side, 0.055);
    const wt0=ctr.clone().addScaledVector(d,0.10).addScaledVector(side,-0.02);
    const wt1=ctr.clone().addScaledVector(d,0.10).addScaledVector(side, 0.02);
    quad(wb0, wb1, wt1, wt0, P.web, 0.05);
  };
  {
    const S1=hunch(V(-L.shoulderX, L.shldY-0.02, 0.02));
    const E1=V(-0.520, 0.98, 0.18);
    const W1=V(-0.480, 0.64, 0.26);
    tube(S1,E1,0.145,0.112,6,P.hide);
    tube(E1,W1,0.108,0.088,6,P.hideDk);
    webbedHand(W1, V(-0.10,-0.55,1), P.hideLt);

    const S2=hunch(V(L.shoulderX, L.shldY-0.02, 0.02));
    const E2=V(0.540, 1.02, 0.20);
    const W2=V(0.500, 0.68, 0.28);
    tube(S2,E2,0.145,0.112,6,P.hide);
    tube(E2,W2,0.108,0.088,6,P.hideDk);
    webbedHand(W2, V(0.10,-0.55,1), P.hideLt);

    /* arm fin-frills — small spikes along the outer edge of each forearm */
    for(const [b,t] of [[E1,W1],[E2,W2]]){
      const mid = b.clone().lerp(t,0.5);
      const base = mid.clone().add(V(0,0.04,0));
      const tip  = mid.clone().add(V(mid.x>0?0.09:-0.09, 0.05, -0.02));
      tube(base, tip, 0.020, 0.005, 3, P.fin, {capB:{hex:P.finDk, lift:0.003}});
    }
  }

  /* ---------- LEGS — thick, splayed, webbed clawed feet. ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.03, 0.02), kneeL=V(-0.320,0.36,0.10), ankL=V(-0.340,0.08,0.05);
    const hipR=V( L.hipHalf, L.hipY-0.03, 0.00), kneeR=V( 0.320,0.36,-0.04), ankR=V( 0.340,0.08,-0.08);
    tube(hipL,kneeL,0.175,0.128,6,P.hide);
    tube(kneeL,ankL,0.120,0.088,6,P.hideDk);
    tube(hipR,kneeR,0.175,0.128,6,P.hide);
    tube(kneeR,ankR,0.120,0.088,6,P.hideDk);
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.08,0,1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.045,ank.z);
      tube(heel.clone().addScaledVector(d,-0.02), heel.clone().addScaledVector(d,0.185), 0.098,0.072,6,P.hide,
           {raz:0.086, rbz:0.058, capA:{hex:P.hideDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.175).addScaledVector(side, off*0.058);
        const tt=tb.clone().addScaledVector(d,0.055).addScaledVector(side, off*0.010);
        tube(tb, tt, 0.026,0.010,4,P.web,{capB:{hex:P.claw, lift:0.005}});
      }
      /* webbing between toes */
      const wb0=heel.clone().addScaledVector(d,0.175).addScaledVector(side,-0.052);
      const wb1=heel.clone().addScaledVector(d,0.175).addScaledVector(side, 0.052);
      const wt0=heel.clone().addScaledVector(d,0.21).addScaledVector(side,-0.018);
      const wt1=heel.clone().addScaledVector(d,0.21).addScaledVector(side, 0.018);
      quad(wb0, wb1, wt1, wt0, P.web, 0.05);
    }
  }

  /* ---------- base disc (r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.53, 0.53, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
