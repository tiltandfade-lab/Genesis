/* dev/model-qa/creatures/dwarf-sorcerer.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED dwarf race (squat-broad race-dwarf proportions + massive beard + eyeless head) wearing the
   SORCERER kit (sorcerer.js signature: NO staff / NO hat — raw innate magic: a bright FLAME WISP
   authored first floating just off the open casting palm, a fitted high-collared split-skirt coat, a
   dramatic forward LUNGE stance). The dwarf's mass grounds the lunge; the beard reads under the raised
   casting arm. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarfSorcerer(){
  const P = {
    coat:0x4a2f4e, coatDk:0x37243c, coatLt:0x5c3d62,
    trim:0x9c7d3e, trimDk:0x6e5a2c,
    skin:0xb98a63, skinDk:0x7f5f42,
    beard:0x9a9086, beardDk:0x6d655c,
    hair:0x6d655c, eye:0x1a1512,
    leg:0x2e2622, boot:0x241d15, bootDk:0x160f0a,
    wisp:0xff8a3c, wispCore:0xffe9a8, wispDk:0xb8501f,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    shoulderX:0.235, hipHalf:0.135,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* WISP FIRST — bright flame blob floating off the open right palm (raised, thrust forward) */
  const PALM = V(0.42, 0.720, 0.58);
  const PDIR = V(0.42, 0.10, 0.90).normalize();
  const WISP_C = PALM.clone().addScaledVector(PDIR, 0.062);
  {
    const bands=[
      {t:0.0,  r:0.003},{t:0.22, r:0.060},{t:0.45, r:0.084},
      {t:0.62, r:0.075},{t:0.80, r:0.048},{t:1.0,  r:0.010},
    ];
    const n=8;
    const rings = bands.map(b=>{
      const up = (b.t-0.4)*0.180;
      const lean = Math.sin(b.t*Math.PI)*0.040;
      const c = WISP_C.clone().addScaledVector(V(0,1,0), up).addScaledVector(PDIR, lean*0.5);
      return ring(c, V(0,1,0), b.r, b.r*0.94, n, Math.PI/n);
    });
    stitch(rings, (b)=> b<2?P.wispDk:(b<3?P.wisp:P.wispCore));
    capFan(rings[0], WISP_C.clone().addScaledVector(V(0,1,0),-0.092), P.wispDk, true);
    capFan(rings.at(-1), WISP_C.clone().addScaledVector(V(0,1,0),0.115).addScaledVector(PDIR,0.012), P.wispCore);
    const coreC = WISP_C.clone().addScaledVector(V(0,1,0),0.02);
    const core = ring(coreC, V(0,1,0), 0.030, 0.030, 6, 0);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),0.040), P.wispCore);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),-0.036), P.wispCore, true);
  }

  /* TRUNK — fitted coat (dwarf broad) */
  stack([
    {y:L.hipY,   rx:0.228, rz:0.176, hex:P.coatDk},
    {y:L.waistY, rx:0.238, rz:0.186, hex:P.coat},
    {y:L.ribY,   rx:0.250, rz:0.194, hex:P.coat},
    {y:L.chestY, rx:0.258, rz:0.198, hex:P.coatLt},
    {y:L.shldY,  rx:0.260, rz:0.190, hex:P.coatLt},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* HIGH COLLAR — flared band framing the face */
  {
    const n=8, ph=Math.PI/n;
    const cLo=ring(V(0,L.neckY-0.01,0.0), V(0,1,0), 0.104, 0.098, n, ph);
    const cHi=ring(V(0,L.jawY-0.040,0.004), V(0,1,0), 0.092, 0.084, n, ph);
    stitch([cLo,cHi], ()=>P.coatDk);
    capFan(cHi, V(0,L.jawY-0.050,0.0), P.coatDk, true);
  }

  /* FLARED SPLIT-SKIRT PANELS — legs show through the front gap */
  {
    const bp=[[L.hipY,-0.180],[0.32,-0.220],[0.18,-0.256],[0.08,-0.280]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.180,y2,z2), V(-0.180,y2,z2), V(-0.180,y1,z1), V(0.180,y1,z1), i%2?P.coat:P.coatDk, 0.04);
    }
    for(const s of [-1,1]){
      const sp=[[L.hipY,0.200*s,0.10],[0.30,0.250*s,0.075],[0.18,0.270*s,0.11]];
      for(let i=0;i<sp.length-1;i++){
        const [y1,x1,z1]=sp[i], [y2,x2,z2]=sp[i+1];
        const inX1=x1*0.55, inX2=x2*0.55;
        quad(V(inX1,y1,z1-0.01), V(x1,y1,z1), V(x2,y2,z2), V(inX2,y2,z2-0.01), i%2?P.coat:P.coatDk, 0.04);
      }
    }
    const trimZ=[[L.chestY,0.196],[L.waistY,0.180],[L.hipY,0.190]];
    for(let i=0;i<trimZ.length-1;i++){
      const [y1,z1]=trimZ[i],[y2,z2]=trimZ[i+1];
      quad(V(-0.020,y1,z1),V(0.020,y1,z1),V(0.020,y2,z2),V(-0.020,y2,z2),P.trim,0.03);
    }
  }

  /* HEAD — inherited dwarf (eyeless) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.104, hex:P.skin},
      {y:L.cheekY, rx:0.128, rz:0.122, hex:P.skin},
      {y:L.browY,  rx:0.132, rz:0.118, hex:P.skin},
      {y:L.crownY, rx:0.100, rz:0.090, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.026;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
  }

  /* MASSIVE BEARD (inherited) */
  {
    const bands=[
      {y:L.jawY+0.005, rx:0.125, rz:0.095, cz:0.135, hex:P.beard},
      {y:L.cheekY-0.05, rx:0.120, rz:0.088, cz:0.185, hex:P.beard},
      {y:0.735,         rx:0.112, rz:0.080, cz:0.225, hex:P.beard},
      {y:0.665,         rx:0.100, rz:0.070, cz:0.250, hex:P.beard},
      {y:0.59,          rx:0.086, rz:0.060, cz:0.260, hex:P.beardDk},
      {y:0.515,         rx:0.066, rz:0.048, cz:0.250, hex:P.beardDk},
      {y:L.waistY+0.01, rx:0.044, rz:0.034, cz:0.215, hex:P.beardDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.waistY-0.03,0.185), P.beardDk);
  }

  /* SWEPT-BACK HAIR — crown-only shell */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.browY+0.01,  rx:0.128, rz:0.116, cz:-0.010, hex:P.hair},
      {y:L.crownY,      rx:0.106, rz:0.096, cz:-0.020, hex:P.hair},
      {y:L.crownY+0.05, rx:0.086, rz:0.078, cz:-0.034, hex:P.hair},
    ];
    const skip={0:faceCols, 1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings.at(-1), V(0,L.crownY+0.09,-0.045), P.hair);
  }

  /* RIGHT ARM — CASTING arm thrust forward; hand derived from the wisp palm */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.360, 0.665, 0.32);
    const WRIST = PALM.clone().addScaledVector(PDIR, -0.055);
    tube(S,E,0.090,0.072,6,P.coatLt);
    tube(E,WRIST,0.064,0.050,6,P.coat,{capB:{hex:P.skinDk}});
    const HB=WRIST.clone().addScaledVector(PDIR,0.01), HT=PALM.clone().addScaledVector(PDIR,0.015);
    tube(HB,HT,0.050,0.040,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,PDIR).normalize();
    for(const k of [-1,0,1]){
      const base=HT.clone().addScaledVector(fu,k*0.020);
      const tip=base.clone().addScaledVector(PDIR,0.05).addScaledVector(fu,k*0.014);
      tube(base,tip,0.014,0.008,4,P.skin,{capB:{hex:P.skin}});
    }
  }

  /* LEFT ARM — swept back low for the lunge counter-balance */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.310, 0.535, -0.02);
    const W2=V(-0.350, 0.320, 0.22);
    tube(S2,E2,0.088,0.070,6,P.coatLt);
    tube(E2,W2,0.062,0.048,6,P.coat,{capB:{hex:P.skinDk}});
    tube(W2, W2.clone().add(V(-0.01,-0.05,0.03)), 0.050,0.040,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — dramatic forward lunge, through the split skirt (dwarf-short but staggered) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, -0.02), kneeL=V(-0.180,0.22,-0.18), ankL=V(-0.195,0.085,-0.24);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.02),  kneeR=V( 0.235,0.24,0.34),  ankR=V( 0.270,0.085,0.46);
    tube(hipL,kneeL,0.096,0.072,6,P.leg);
    tube(kneeL,ankL,0.070,0.052,6,P.leg);
    tube(hipR,kneeR,0.100,0.074,6,P.leg);
    tube(kneeR,ankR,0.072,0.054,6,P.leg);
    for(const [ank,toeDir] of [[ankL,V(-0.15,0,-0.9).normalize()], [ankR,V(0.35,0,0.94).normalize()]]){
      stack([
        {y:0.012, rx:0.076, rz:0.082, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.068, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.155, rx:0.074, rz:0.074, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.135), 0.064,0.048,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.054, rbz:0.038});
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
