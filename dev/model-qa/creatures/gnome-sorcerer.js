/* dev/model-qa/creatures/gnome-sorcerer.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED gnome race (post-F1 big head + wedge EARS + eyeless, stubby frame) wearing the SORCERER kit
   (sorcerer.js signature: NO staff / NO hat — raw innate magic: a bright FLAME WISP authored first
   floating just off the open casting palm, a fitted high-collared split-skirt coat, a dramatic forward
   LUNGE stance). The gnome keeps its big head + ears (race-read). One whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnomeSorcerer(){
  const P = {
    coat:0x4a2f4e, coatDk:0x37243c, coatLt:0x5c3d62,
    trim:0x9c7d3e, trimDk:0x6e5a2c,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    hair:0x6d4b2c, hairDk:0x4a331d,
    leg:0x2e2622, boot:0x241d15, bootDk:0x160f0a,
    wisp:0xff8a3c, wispCore:0xffe9a8, wispDk:0xb8501f,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.335, waistY:0.375, ribY:0.435, chestY:0.465, shldY:0.485, neckY:0.515,
    shoulderX:0.150, hipHalf:0.100,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* WISP FIRST — bright flame blob floating off the open right palm (raised, thrust forward) */
  const PALM = V(0.30, 0.560, 0.44);
  const PDIR = V(0.42, 0.10, 0.90).normalize();
  const WISP_C = PALM.clone().addScaledVector(PDIR, 0.052);
  {
    const bands=[
      {t:0.0,  r:0.003},{t:0.22, r:0.050},{t:0.45, r:0.070},
      {t:0.62, r:0.062},{t:0.80, r:0.040},{t:1.0,  r:0.008},
    ];
    const n=8;
    const rings = bands.map(b=>{
      const up = (b.t-0.4)*0.150;
      const lean = Math.sin(b.t*Math.PI)*0.032;
      const c = WISP_C.clone().addScaledVector(V(0,1,0), up).addScaledVector(PDIR, lean*0.5);
      return ring(c, V(0,1,0), b.r, b.r*0.94, n, Math.PI/n);
    });
    stitch(rings, (b)=> b<2?P.wispDk:(b<3?P.wisp:P.wispCore));
    capFan(rings[0], WISP_C.clone().addScaledVector(V(0,1,0),-0.078), P.wispDk, true);
    capFan(rings.at(-1), WISP_C.clone().addScaledVector(V(0,1,0),0.095).addScaledVector(PDIR,0.010), P.wispCore);
    const coreC = WISP_C.clone().addScaledVector(V(0,1,0),0.018);
    const core = ring(coreC, V(0,1,0), 0.024, 0.024, 6, 0);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),0.032), P.wispCore);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),-0.030), P.wispCore, true);
  }

  /* TRUNK — fitted coat (gnome stubby) */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.126, hex:P.coatDk},
    {y:L.waistY, rx:0.168, rz:0.144, hex:P.coat},
    {y:L.ribY,   rx:0.156, rz:0.130, hex:P.coat},
    {y:L.chestY, rx:0.150, rz:0.124, hex:P.coatLt},
    {y:L.shldY,  rx:0.148, rz:0.120, hex:P.coatLt},
    {y:L.neckY,  rx:0.070, rz:0.066, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* HIGH COLLAR */
  {
    const n=8, ph=Math.PI/n;
    const cLo=ring(V(0,L.neckY-0.01,0.0), V(0,1,0), 0.074, 0.068, n, ph);
    const cHi=ring(V(0,L.jawY-0.045,0.004), V(0,1,0), 0.066, 0.058, n, ph);
    stitch([cLo,cHi], ()=>P.coatDk);
    capFan(cHi, V(0,L.jawY-0.055,0.0), P.coatDk, true);
  }

  /* FLARED SPLIT-SKIRT PANELS */
  {
    const bp=[[L.hipY,-0.130],[0.24,-0.165],[0.12,-0.195]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.130,y2,z2), V(-0.130,y2,z2), V(-0.130,y1,z1), V(0.130,y1,z1), i%2?P.coat:P.coatDk, 0.04);
    }
    for(const s of [-1,1]){
      const sp=[[L.hipY,0.150*s,0.06],[0.24,0.185*s,0.045]];
      for(let i=0;i<sp.length-1;i++){
        const [y1,x1,z1]=sp[i], [y2,x2,z2]=sp[i+1];
        const inX1=x1*0.55, inX2=x2*0.55;
        quad(V(inX1,y1,z1-0.01), V(x1,y1,z1), V(x2,y2,z2), V(inX2,y2,z2-0.01), i%2?P.coat:P.coatDk, 0.04);
      }
    }
    const trimZ=[[L.chestY,0.124],[L.waistY,0.108],[L.hipY,0.124]];
    for(let i=0;i<trimZ.length-1;i++){
      const [y1,z1]=trimZ[i],[y2,z2]=trimZ[i+1];
      quad(V(-0.014,y1,z1),V(0.014,y1,z1),V(0.014,y2,z2),V(-0.014,y2,z2),P.trim,0.03);
    }
  }

  /* HEAD — inherited gnome (big head, ears, eyeless) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.106, hex:P.skin},
      {y:L.cheekY, rx:0.134, rz:0.128, hex:P.skin},
      {y:L.browY,  rx:0.138, rz:0.126, hex:P.skin},
      {y:L.crownY, rx:0.106, rz:0.097, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.026;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
    for(const s of [-1,1]){
      const eb=V(s*0.128, L.cheekY+0.008, 0.016);
      const et=eb.clone().add(V(s*0.078, 0.032, -0.010));
      tube(eb, et, 0.024, 0.009, 5, P.ear, {capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.004}});
    }
  }

  /* SWEPT-BACK HAIR — crown-only shell */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.browY+0.01,  rx:0.134, rz:0.122, cz:-0.010, hex:P.hair},
      {y:L.crownY,      rx:0.108, rz:0.098, cz:-0.020, hex:P.hair},
      {y:L.crownY+0.04, rx:0.086, rz:0.078, cz:-0.032, hex:P.hairDk},
    ];
    const skip={0:faceCols, 1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings.at(-1), V(0,L.crownY+0.07,-0.040), P.hairDk);
  }

  /* RIGHT ARM — CASTING arm thrust forward; hand derived from the wisp palm */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=V(0.245, 0.475, 0.24);
    const WRIST = PALM.clone().addScaledVector(PDIR, -0.045);
    tube(S,E,0.056,0.044,6,P.coatLt);
    tube(E,WRIST,0.044,0.032,6,P.coat,{capB:{hex:P.skinDk}});
    const HB=WRIST.clone().addScaledVector(PDIR,0.008), HT=PALM.clone().addScaledVector(PDIR,0.012);
    tube(HB,HT,0.036,0.028,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,PDIR).normalize();
    for(const k of [-1,0,1]){
      const base=HT.clone().addScaledVector(fu,k*0.015);
      const tip=base.clone().addScaledVector(PDIR,0.04).addScaledVector(fu,k*0.010);
      tube(base,tip,0.011,0.006,4,P.skin,{capB:{hex:P.skin}});
    }
  }

  /* LEFT ARM — swept back low for the lunge counter-balance */
  {
    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.205, 0.415, -0.02);
    const W2=V(-0.235, 0.26, 0.16);
    tube(S2,E2,0.054,0.042,6,P.coatLt);
    tube(E2,W2,0.042,0.030,6,P.coat,{capB:{hex:P.skinDk}});
    tube(W2, W2.clone().add(V(-0.008,-0.036,0.02)), 0.034,0.026,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — forward lunge through the split skirt */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, -0.02), kneeL=V(-0.130,0.20,-0.15), ankL=V(-0.140,0.075,-0.20);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.02),  kneeR=V( 0.165,0.21,0.26),  ankR=V( 0.195,0.075,0.36);
    tube(hipL,kneeL,0.056,0.042,6,P.leg);
    tube(kneeL,ankL,0.042,0.032,6,P.leg);
    tube(hipR,kneeR,0.058,0.044,6,P.leg);
    tube(kneeR,ankR,0.044,0.034,6,P.leg);
    for(const [ank,toeDir] of [[ankL,V(-0.15,0,-0.9).normalize()], [ankR,V(0.35,0,0.94).normalize()]]){
      stack([
        {y:0.010, rx:0.056, rz:0.062, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.08,  rx:0.048, rz:0.052, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.13,  rx:0.054, rz:0.054, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.105), 0.046,0.034,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.040, rbz:0.028});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
