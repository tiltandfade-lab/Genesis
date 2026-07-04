/* dev/model-qa/creatures/mon-succubus.js — the SUCCUBUS (bespoke WINGED HUMANOID, Medium Fiend).
   docs/CREATURE-MODELS-P2.md Wave 4: seductive fiend — a slender humanoid frame with leathery bat
   wings folded/half-spread off the shoulders, small curved horns, and a thin whip-tail. Dusky
   red-violet skin (VS desaturated, mottled), dark wing membrane. Seeds the winged-humanoid base
   (erinyes/incubus/cambion lift from it later). NO eye quads (house ruling). Whole-object grammar:
   one function, one geometry frame, no anchors. Medium size: base disc r=0.42.
   Imported by the p2mon proof-sheet set + WHOLE_OBJECT_REGISTRY. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildSuccubus(){
  /* ---------- PALETTE (VS desaturated; dusky red-violet skin, dark leathery wings) ---------- */
  const P = {
    skin:0x6e4658, skinDk:0x502f40, skinLt:0x82586c,           // dusky red-violet hide
    mottleA:0x5f3c4d, mottleB:0x785066,                         // torso mottle bands
    horn:0x2c2027, hornDk:0x1c1418,                             // dark curved horns
    wing:0x2e2228, wingDk:0x1c1418, wingBone:0x4a3540,          // dark leathery membrane + bone struts
    tail:0x5f3c4d, tailDk:0x3f2733,
    claw:0x1c1418,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin', [P.mottleA]:'skin', [P.mottleB]:'skin',
    [P.horn]:'bone', [P.hornDk]:'bone',
    [P.wing]:'leather', [P.wingDk]:'leather', [P.wingBone]:'bone',
    [P.tail]:'skin', [P.tailDk]:'skin', [P.claw]:'bone',
  });

  /* ---------- LANDMARKS — slender humanoid spine, standing tall (~4.6 heads). ---------- */
  const L = {
    hipY:0.62, waistY:0.72, ribY:0.84, chestY:0.95, shldY:1.02, neckY:1.06,
    hipHalf:0.095, shoulderX:0.185,
    jawY:1.09, cheekY:1.16, browY:1.225, crownY:1.30, headTopY:1.35,
  };

  /* trunk — one loft, slender fiend torso */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.155, rz:0.120, hex:P.mottleA},
      {y:L.waistY, rx:0.125, rz:0.100, hex:P.skin},
      {y:L.ribY,   rx:0.145, rz:0.115, hex:P.skin},
      {y:L.chestY, rx:0.170, rz:0.130, hex:P.mottleB},
      {y:L.shldY,  rx:0.175, rz:0.120, hex:P.skin},
      {y:L.neckY,  rx:0.065, rz:0.062, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* narrow hips down to a short skirt-line */
    const rings2=[ring(V(0,0.42,0), V(0,1,0), 0.135, 0.105, n, ph), rings[0]];
    stitch(rings2, ()=>P.skinDk);
  }

  /* ---------- HEAD — slender fiendish face, brow ridge, no eye quads (socket recesses only). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.078, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.098, rz:0.096, hex:P.skin},
      {y:L.browY,  rx:0.100, rz:0.090, hex:P.skinDk},
      {y:L.crownY, rx:0.078, rz:0.068, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY, 0.004), P.skinDk);
    /* dark socket recesses — shape only, no eye quads */
    for(const s of [-1,1]) quad(V(s*0.048,L.cheekY+0.012,0.086), V(s*0.026,L.cheekY+0.012,0.090),
                                V(s*0.026,L.cheekY-0.014,0.088), V(s*0.048,L.cheekY-0.014,0.084), P.skinDk, 0.05);
    /* thin dark lips */
    quad(V(-0.032,L.jawY-0.02,0.078), V(0.032,L.jawY-0.02,0.078), V(0.026,L.jawY-0.03,0.084), V(-0.026,L.jawY-0.03,0.084), P.hornDk, 0.03);

    /* small curved HORNS sweeping back off the brow */
    for(const s of [-1,1]){
      const hb = V(s*0.055, L.browY+0.05, 0.02);
      const hm = V(s*0.085, L.browY+0.16, -0.03);
      const ht = V(s*0.095, L.browY+0.26, -0.10);
      tube(hb, hm, 0.026, 0.017, 5, P.horn);
      tube(hm, ht, 0.017, 0.005, 5, P.hornDk, {capB:{hex:P.hornDk, lift:0.004}});
    }
  }

  /* ---------- ARMS — slender, hands clawed, one hand extended, one at the hip. ---------- */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.01), E=V(0.235,0.80,0.14), W=V(0.255,0.605,0.235);
    tube(S,E,0.052,0.040,6,P.skin);
    tube(E,W,0.040,0.032,6,P.skin);
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.01), E2=V(-0.24,0.80,0.02), W2=V(-0.205,0.615,-0.02);
    tube(S2,E2,0.052,0.040,6,P.skin);
    tube(E2,W2,0.040,0.032,6,P.skin);
    /* clawed fingers, both hands — short slim tapers */
    for(const [w,dir] of [[W,V(0.4,-0.5,0.9)],[W2,V(-0.3,-0.6,-0.7)]]){
      const d=dir.clone().normalize();
      for(const off of [-0.014,0,0.014]){
        const cb=V(w.x,w.y,w.z);
        const ct=w.clone().addScaledVector(d,0.06).add(V(off,0,0));
        tube(cb,ct,0.012,0.004,4,P.claw,{capB:{hex:P.claw, lift:0.003}});
      }
    }
  }

  /* ---------- LEGS — slender, standing narrow stance, clawed feet. ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.10,0.34,0.045), ankL=V(-0.095,0.075,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.105,0.34,0.030), ankR=V( 0.10,0.075,0.005);
    tube(hipL,kneeL,0.062,0.044,6,P.skinDk);
    tube(kneeL,ankL,0.042,0.028,6,P.skinDk);
    tube(hipR,kneeR,0.062,0.044,6,P.skinDk);
    tube(kneeR,ankR,0.042,0.028,6,P.skinDk);
    for(const ank of [ankL,ankR]){
      const pad=V(ank.x,0.04,ank.z+0.02);
      for(const dx of [-0.03,0,0.03]){
        const cb=V(pad.x+dx,0.045,pad.z);
        const ct=V(pad.x+dx,0.008,pad.z+0.045);
        tube(cb,ct,0.014,0.005,4,P.claw,{capB:{hex:P.claw, lift:0.003}});
      }
    }
  }

  /* ---------- WINGS — leathery bat wings, half-spread off the shoulders. ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.135, L.shldY+0.06, -0.03);
      const shoulder = V(side*0.24, L.shldY+0.14, -0.06);
      const f1 = V(side*0.44, L.shldY+0.52, -0.10);
      const f2 = V(side*0.60, L.shldY+0.40, -0.28);
      const f3 = V(side*0.62, L.shldY+0.20, -0.44);
      const f4 = V(side*0.50, L.shldY+0.02, -0.50);
      tube(root, shoulder, 0.036, 0.026, 5, P.wingBone);
      tube(shoulder, f1, 0.026, 0.009, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f2, 0.024, 0.008, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f3, 0.020, 0.007, 4, P.wingBone, {capB:{hex:P.wingBone, lift:0.003}});
      quad(shoulder, f1, f2, shoulder, P.wing, 0.10);
      quad(shoulder, f2, f3, shoulder, P.wingDk, 0.10);
      const hTrail = V(side*0.28, L.shldY-0.06, -0.34);
      quad(shoulder, f3, f4, hTrail, P.wingDk, 0.10);
      const rim=[f1,f2,f3,f4];
      for(let i=0;i<rim.length-1;i++){
        const a=rim[i], b=rim[i+1];
        const dip=V((a.x+b.x)/2,(a.y+b.y)/2-0.05,(a.z+b.z)/2);
        quad(a,b,dip,dip,P.wingDk,0.08);
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- TAIL — thin whip-tail, roots at the base of the spine, curls down/out then flicks up. ---------- */
  {
    const t0=V(0, L.hipY-0.06, -0.10);
    const t1=V(0.04, 0.42, -0.18);
    const t2=V(0.10, 0.24, -0.22);
    const t3=V(0.18, 0.14, -0.16);
    const t4=V(0.24, 0.16, -0.02);
    const tip=V(0.28, 0.24, 0.06);
    tube(t0,t1,0.036,0.026,6,P.tail,{capA:{hex:P.tailDk}});
    tube(t1,t2,0.026,0.018,6,P.tailDk);
    tube(t2,t3,0.018,0.011,6,P.tail);
    tube(t3,t4,0.011,0.006,5,P.tailDk);
    tube(t4,tip,0.006,0.010,5,P.tailDk,{capB:{hex:P.tailDk, lift:0.006}}); // small barbed tip flare
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
