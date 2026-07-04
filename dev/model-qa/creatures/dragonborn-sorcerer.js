/* dev/model-qa/creatures/dragonborn-sorcerer.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the SORCERER kit (sorcerer.js
   signature: NO staff / NO hat — a bright FLAME WISP authored first floating off the open casting
   palm, a fitted high-collared split-skirt coat, a dramatic forward LUNGE). Draconic-bloodline
   sorcerer is the flavour-perfect combo: the wisp reads as the dragonborn's innate breath-magic. The
   scale head + horns + tail carry the race; the wisp + lunge carry the class. One whole-object
   function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornSorcerer(){
  const P = {
    coat:0x4a2f4e, coatDk:0x37243c, coatLt:0x5c3d62,
    trim:0x9c7d3e, trimDk:0x6e5a2c,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a, eye:0x1a1512, eyeGlow:0xd9c25a,
    leg:0x2e2622, boot:0x241d15, bootDk:0x160f0a,
    wisp:0xff8a3c, wispCore:0xffe9a8, wispDk:0xb8501f,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.120, shoulderX:0.250,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* WISP FIRST — bright flame off the open right palm (raised, thrust forward) */
  const PALM = V(0.44, 1.185, 0.62);
  const PDIR = V(0.42, 0.10, 0.90).normalize();
  const WISP_C = PALM.clone().addScaledVector(PDIR, 0.062);
  {
    const bands=[
      {t:0.0,  r:0.003},{t:0.22, r:0.062},{t:0.45, r:0.088},
      {t:0.62, r:0.078},{t:0.80, r:0.050},{t:1.0,  r:0.010},
    ];
    const n=8;
    const rings = bands.map(b=>{
      const up = (b.t-0.4)*0.180;
      const lean = Math.sin(b.t*Math.PI)*0.042;
      const c = WISP_C.clone().addScaledVector(V(0,1,0), up).addScaledVector(PDIR, lean*0.5);
      return ring(c, V(0,1,0), b.r, b.r*0.94, n, Math.PI/n);
    });
    stitch(rings, (b)=> b<2?P.wispDk:(b<3?P.wisp:P.wispCore));
    capFan(rings[0], WISP_C.clone().addScaledVector(V(0,1,0),-0.094), P.wispDk, true);
    capFan(rings.at(-1), WISP_C.clone().addScaledVector(V(0,1,0),0.118).addScaledVector(PDIR,0.012), P.wispCore);
    const coreC = WISP_C.clone().addScaledVector(V(0,1,0),0.02);
    const core = ring(coreC, V(0,1,0), 0.030, 0.030, 6, 0);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),0.040), P.wispCore);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),-0.036), P.wispCore, true);
  }

  /* TRUNK — fitted coat (broad dragonborn frame) */
  stack([
    {y:L.hipY,   rx:0.190, rz:0.148, hex:P.coatDk},
    {y:L.waistY, rx:0.168, rz:0.130, hex:P.coat},
    {y:L.ribY,   rx:0.200, rz:0.152, hex:P.coat},
    {y:L.chestY, rx:0.232, rz:0.168, hex:P.coatLt},
    {y:L.shldY,  rx:0.240, rz:0.158, hex:P.coatLt},
    {y:L.neckY,  rx:0.098, rz:0.092, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.004}});

  /* HIGH COLLAR — flared band framing the muzzle base */
  {
    const n=8, ph=Math.PI/n;
    const cLo=ring(V(0,L.neckY-0.01,0.0), V(0,1,0), 0.100, 0.092, n, ph);
    const cHi=ring(V(0,L.jawY-0.055,0.004), V(0,1,0), 0.092, 0.082, n, ph);
    stitch([cLo,cHi], ()=>P.coatDk);
    capFan(cHi, V(0,L.jawY-0.065,0.0), P.coatDk, true);
  }

  /* FLARED SPLIT-SKIRT PANELS — legs show through the front gap (broad dragonborn) */
  {
    const bp=[[L.hipY,-0.150],[0.55,-0.190],[0.35,-0.230],[0.16,-0.260]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.155,y2,z2), V(-0.155,y2,z2), V(-0.155,y1,z1), V(0.155,y1,z1), i%2?P.coat:P.coatDk, 0.04);
    }
    for(const s of [-1,1]){
      const sp=[[L.hipY,0.170*s,0.07],[0.55,0.230*s,0.05],[0.44,0.255*s,0.085]];
      for(let i=0;i<sp.length-1;i++){
        const [y1,x1,z1]=sp[i], [y2,x2,z2]=sp[i+1];
        const inX1=x1*0.55, inX2=x2*0.55;
        quad(V(inX1,y1,z1-0.01), V(x1,y1,z1), V(x2,y2,z2), V(inX2,y2,z2-0.01), i%2?P.coat:P.coatDk, 0.04);
      }
    }
  }

  /* HEAD — inherited dragonborn reptilian skull (muzzle, horns, glow eyes) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.100, rz:0.098, hex:P.scale},
      {y:L.muzzleY, rx:0.118, rz:0.116, hex:P.scale},
      {y:L.browY,   rx:0.122, rz:0.108, hex:P.scale},
      {y:L.crownY,  rx:0.098, rz:0.086, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.010; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.004), P.scaleDk);
    const muzBase = V(0, L.muzzleY-0.01, 0.118);
    const muzMid  = V(0, L.muzzleY-0.030, 0.186);
    const muzTip  = V(0, L.muzzleY-0.050, 0.238);
    tube(muzBase, muzMid, 0.112, 0.094, n, P.scale, {raz:0.100, rbz:0.086, phase:ph});
    tube(muzMid, muzTip, 0.094, 0.066, n, P.scaleLt, {raz:0.086, rbz:0.060, phase:ph, capB:{hex:P.scaleDk, lift:0.014}});
    quad(V(-0.058,L.muzzleY-0.070,0.128), V(0.058,L.muzzleY-0.070,0.128),
         V(0.036,L.muzzleY-0.086,0.224), V(-0.036,L.muzzleY-0.086,0.224), P.scaleBelly, 0.05);
    for(const s of [-1,1]){
      const hb = V(s*0.072, L.crownY-0.015, -0.020);
      const ht = V(s*0.098, L.crownY+0.075, -0.115);
      tube(hb, ht, 0.032, 0.012, 6, P.horn, {capB:{hex:P.hornTip, lift:0.008}});
    }
    for(const s of [-1,1]){
      const ex=s*0.092, ey=L.browY-0.006, ez=0.118;
      quad(V(ex-0.017,ey-0.012,ez), V(ex+0.017,ey-0.012,ez),
           V(ex+0.017,ey+0.014,ez-0.007), V(ex-0.017,ey+0.014,ez-0.007), P.eye, 0.0);
      quad(V(ex-0.007,ey-0.003,ez+0.003), V(ex+0.007,ey-0.003,ez+0.003),
           V(ex+0.007,ey+0.006,ez-0.002), V(ex-0.007,ey+0.006,ez-0.002), P.eyeGlow, 0.0);
    }
  }

  /* RIGHT ARM — CASTING arm thrust forward; hand derived from the wisp palm */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.400, 1.115, 0.335);
    const WRIST = PALM.clone().addScaledVector(PDIR, -0.055);
    tube(S,E,0.078,0.062,6,P.coatLt);
    tube(E,WRIST,0.060,0.046,6,P.coat,{capB:{hex:P.scaleDk}});
    const HB=WRIST.clone().addScaledVector(PDIR,0.01), HT=PALM.clone().addScaledVector(PDIR,0.015);
    tube(HB,HT,0.050,0.038,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,PDIR).normalize();
    for(const k of [-1,0,1]){
      const base=HT.clone().addScaledVector(fu,k*0.020);
      const tip=base.clone().addScaledVector(PDIR,0.055).addScaledVector(fu,k*0.014);
      tube(base,tip,0.014,0.008,4,P.scale,{capB:{hex:P.scaleDk}});
    }
  }

  /* LEFT ARM — swept back low for the lunge counter-balance */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.345, 0.90, -0.02);
    const W2=V(-0.385, 0.625, 0.235);
    tube(S2,E2,0.076,0.060,6,P.coatLt);
    tube(E2,W2,0.058,0.044,6,P.coat,{capB:{hex:P.scaleDk}});
    tube(W2, W2.clone().add(V(-0.012,-0.055,0.035)), 0.046,0.036,6,P.scale,{capB:{hex:P.scaleDk}});
  }

  /* LEGS — dramatic forward lunge, through the split skirt (broad dragonborn) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, -0.02), kneeL=V(-0.170,0.42,-0.20), ankL=V(-0.180,0.090,-0.27);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.02),  kneeR=V( 0.230,0.44,0.38),  ankR=V( 0.270,0.090,0.50);
    tube(hipL,kneeL,0.090,0.064,6,P.leg);
    tube(kneeL,ankL,0.062,0.044,6,P.leg);
    tube(hipR,kneeR,0.096,0.068,6,P.leg);
    tube(kneeR,ankR,0.064,0.046,6,P.leg);
    for(const [ank,toeDir] of [[ankL,V(-0.15,0,-0.9).normalize()], [ankR,V(0.35,0,0.94).normalize()]]){
      stack([
        {y:0.012, rx:0.074, rz:0.082, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.064, rz:0.068, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.070, rz:0.070, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.060,0.046,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.052, rbz:0.036});
    }
  }

  /* TAIL — thick tapering dragonborn tail, curving down and back off to one side (inherited) */
  {
    const root = V(0.04, L.hipY-0.14, -0.245);
    const t1   = V(0.230,0.545, -0.320);
    const t2   = V(0.360,0.400, -0.360);
    const t3   = V(0.445,0.270, -0.360);
    const t4   = V(0.470,0.165, -0.320);
    const tip  = V(0.470,0.115, -0.255);
    tube(root, t1, 0.112, 0.092, 8, P.scale,   {phase:Math.PI/8});
    tube(t1,   t2, 0.092, 0.070, 8, P.scale,   {phase:Math.PI/8});
    tube(t2,   t3, 0.070, 0.046, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t3,   t4, 0.046, 0.025, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t4,   tip,0.025, 0.012, 8, P.scaleDk, {phase:Math.PI/8, capB:{hex:P.scaleDk, lift:0.006}});
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
