/* dev/model-qa/creatures/rlm-trench-colossus-of-bone-and-wire.js — Trench Colossus of Bone and
   Wire (theater, Huge, CR 13). A titan risen from the unburied dead of no-man's-land: a hulking
   bipedal frame built from lashed-together bone and coiled barbed wire, ribcage-plated torso
   with wire cinched tight between the ribs, a skull-topped head with wire jaw-binding (no eye
   quads — hollow sockets), long bone-strut arms ending in wire-wrapped bludgeon fists, legs
   braced wide like a dug-in gun emplacement. The read: a mass grave standing up, held together
   by the wire that killed it. VS-desaturated bone-grey + rust-black wire palette, mud-caked
   lower half. Whole-object grammar, one merged frame, no anchors. Huge size, base disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTrenchColossusOfBoneAndWire(){
  const P = {
    bone:0xb4a888, boneDk:0x86795c, boneLt:0xcabe9c,
    boneGrime:0x5c5240,
    wire:0x2a2420, wireDk:0x171410, wireRust:0x5a3a26,
    mud:0x3a3020, mudDk:0x241d12,
    socket:0x191510, mouth:0x100d0a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — hulking upright bipedal frame, Huge scale, wide dug-in stance. ---------- */
  const S = {
    hip:   V(0, 0.62, 0),
    waist: V(0.01, 0.86, 0.02),
    chest: V(0.01, 1.14, 0.03),
    shldr: V(0.00, 1.36, 0.02),
    neck:  V(0.00, 1.46, 0.00),
    headB: V(0, 1.52, -0.02),
    headT: V(0, 1.76, -0.06),
  };

  /* ---------- TORSO — a ribcage-plated barrel, wire cinched tight between the ribs. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   cz:S.hip.z,   rx:0.320, hex:P.boneDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.300, hex:P.bone},
      {y:S.chest.y, cz:S.chest.z, rx:0.360, hex:P.boneLt},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.380, hex:P.bone},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.78, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.12,S.hip.z), P.boneDk, true);

    // visible RIB STRUTS — bone tubes arcing across the chest front, lashed with wire
    for(const t of [0,1,2,3]){
      const yy = S.hip.y+0.16 + t*0.20;
      const spread = 0.36 - t*0.02;
      const rA=V(-spread,yy,S.hip.z+0.20), rB=V(0,yy-0.06,S.hip.z+0.32), rC=V(spread,yy,S.hip.z+0.20);
      tube(rA,rB,0.032,0.026,5,P.bone);
      tube(rB,rC,0.026,0.032,5,P.bone);
      // wire lashing crossing the rib center
      tube(V(-0.05,yy-0.03,S.hip.z+0.30), V(0.05,yy-0.09,S.hip.z+0.30), 0.010,0.010,4,P.wire);
    }
    // coiled barbed wire wrap girding the waist
    for(let k=0;k<3;k++){
      const yy = S.waist.y - 0.06 + k*0.05;
      const r1=ring(V(0,yy,S.waist.z), V(0,1,0), 0.305,0.24, 10), r2=ring(V(0,yy+0.015,S.waist.z), V(0,1,0), 0.30,0.235, 10);
      stitch([r1,r2], ()=>P.wire);
    }
    // barb spikes poking off the waist-wire
    for(let i=0;i<8;i++){
      const a = i/8*Math.PI*2;
      const bx=Math.sin(a)*0.31, bz=S.waist.z+Math.cos(a)*0.24;
      tube(V(bx*0.9,S.waist.y-0.02,bz*0.9+S.waist.z*0), V(bx*1.15,S.waist.y-0.02,bz*1.15), 0.012,0.003,3,P.wireRust);
    }
  }

  /* ---------- HEAD — a bare skull, wire jaw-binding, hollow sockets, no eye quads. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.185, hex:P.boneDk},
      {y:S.headB.y+0.14, r:0.205, hex:P.bone},
      {y:S.headT.y-0.05, r:0.165, hex:P.boneLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.92, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.03,S.headB.z-0.02), P.boneLt);
    // deep hollow eye sockets (shading only, no quads standing in for eyes)
    quad(V(-0.13,S.headB.y+0.11,S.headB.z+0.155), V(-0.03,S.headB.y+0.11,S.headB.z+0.17),
         V(-0.04,S.headB.y+0.18,S.headB.z+0.15), V(-0.12,S.headB.y+0.18,S.headB.z+0.14), P.socket, 0.05);
    quad(V(0.03,S.headB.y+0.11,S.headB.z+0.17), V(0.13,S.headB.y+0.11,S.headB.z+0.155),
         V(0.12,S.headB.y+0.18,S.headB.z+0.14), V(0.04,S.headB.y+0.18,S.headB.z+0.15), P.socket, 0.05);
    // nasal cavity
    quad(V(-0.03,S.headB.y+0.06,S.headB.z+0.185), V(0.03,S.headB.y+0.06,S.headB.z+0.185),
         V(0.018,S.headB.y+0.02,S.headB.z+0.17), V(-0.018,S.headB.y+0.02,S.headB.z+0.17), P.socket, 0.04);
    // gaping jaw, dark mouth
    quad(V(-0.09,S.headB.y-0.02,S.headB.z+0.16), V(0.09,S.headB.y-0.02,S.headB.z+0.16),
         V(0.06,S.headB.y-0.12,S.headB.z+0.14), V(-0.06,S.headB.y-0.12,S.headB.z+0.14), P.mouth, 0.04);
    // WIRE JAW-BINDING — barbed wire wound around the skull, cinching the jaw shut
    for(let k=0;k<3;k++){
      const yy = S.headB.y - 0.01 + k*0.05;
      const r1=ring(V(0,yy,S.headB.z), V(0,1,0), 0.19,0.175, 9), r2=ring(V(0,yy+0.012,S.headB.z), V(0,1,0), 0.185,0.17, 9);
      stitch([r1,r2], ()=>P.wire);
    }
    // a trailing loose wire strand hanging off the jaw
    tube(V(0.08,S.headB.y-0.10,S.headB.z+0.14), V(0.14,S.headB.y-0.30,S.headB.z+0.10), 0.012,0.006,4,P.wireRust,{capB:{hex:P.wireRust,lift:0.004}});
  }

  /* ---------- ARMS — long bone-strut arms (femur-like), ending in wire-wrapped bludgeon fists. ---------- */
  {
    const buildArm=(sx)=>{
      const sh=V(sx*0.40,S.shldr.y-0.04,S.shldr.z), el=V(sx*0.52,S.hip.y+0.10,S.shldr.z+0.10), wr=V(sx*0.56,S.hip.y-0.36,S.shldr.z+0.24);
      tube(sh, el, 0.130, 0.095, 7, P.bone);
      tube(el, wr, 0.095, 0.068, 7, P.boneDk);
      // wire-wrapped fist — a knot of coiled wire around a bone-knuckle mass
      const fistC = V(sx*0.58,S.hip.y-0.44,S.shldr.z+0.30);
      const f1=ring(fistC,V(0,1,0),0.10,0.10,7), f2=ring(V(fistC.x,fistC.y-0.10,fistC.z),V(0,1,0),0.09,0.09,7);
      stitch([f1,f2],()=>P.bone);
      capFan(f1, V(fistC.x,fistC.y+0.05,fistC.z), P.boneLt);
      for(let k=0;k<3;k++){
        const yy = fistC.y - 0.01 - k*0.035;
        const w1=ring(V(fistC.x,yy,fistC.z),V(0,1,0),0.105,0.105,8), w2=ring(V(fistC.x,yy+0.01,fistC.z),V(0,1,0),0.10,0.10,8);
        stitch([w1,w2],()=>P.wire);
      }
      // barb spikes off the fist-wire
      for(const [dx,dz] of [[0.14,0.02],[0.02,0.14],[-0.10,0.10],[0.10,-0.08]]){
        tube(V(fistC.x,fistC.y-0.05,fistC.z), V(fistC.x+dx*sx,fistC.y-0.05,fistC.z+dz), 0.010,0.003,3,P.wireRust);
      }
    };
    buildArm(-1); buildArm(1);
  }

  /* ---------- LEGS — braced WIDE, dug-in gun-emplacement stance; bone-strut, mud-caked feet. ---------- */
  {
    const buildLeg=(sx)=>{
      const hip=V(sx*0.20,S.hip.y-0.06,0.0), knee=V(sx*0.34,0.30,0.10), foot=V(sx*0.40,0.05,0.20);
      tube(hip, knee, 0.185, 0.150, 8, P.boneDk);
      tube(knee, foot, 0.150, 0.115, 8, P.bone, {capB:{hex:P.mud, lift:0.03}});
      // mud caking the shin/foot
      quad(V(sx*0.30,0.16,0.04), V(sx*0.46,0.16,0.10), V(sx*0.46,0.03,0.24), V(sx*0.30,0.03,0.18), P.mud, 0.06);
      // wire binding at the ankle
      const a1=ring(V(sx*0.40,0.10,0.20),V(0,1,0),0.11,0.11,7), a2=ring(V(sx*0.40,0.115,0.20),V(0,1,0),0.108,0.108,7);
      stitch([a1,a2],()=>P.wire);
      // splayed bone-toe claws
      for(const [dx,dz] of [[sx*0.10,0.14],[sx*0.02,0.18],[-sx*0.06,0.16]]){
        tube(V(sx*0.40,0.05,0.20), V(sx*0.40+dx,0.01,0.20+dz), 0.045,0.014,4,P.boneDk,{capB:{hex:P.boneDk,lift:0.008}});
      }
    };
    buildLeg(-1); buildLeg(1);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.062,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.065,0), P.discTop);
  }
}
