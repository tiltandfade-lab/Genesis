/* dev/model-qa/creatures/tiefling-sorcerer.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED tiefling race (dusky red-mauve skin, backswept HORNS, sharp GOATEE, spade-tipped TAIL)
   wearing the SORCERER kit (sorcerer.js signature: NO staff / NO hat — raw innate magic: a bright
   FLAME WISP authored first floating just off the open casting palm, a fitted high-collared split-
   skirt coat, a dramatic forward LUNGE stance). Tiefling sorcerer is the archetypal innate-bloodline
   caster; the horns + tail sell the fiendish pact-blood read, the wisp sells the class. One
   whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTieflingSorcerer(){
  const P = {
    coat:0x4a2f4e, coatDk:0x37243c, coatLt:0x5c3d62,
    trim:0x9c7d3e, trimDk:0x6e5a2c,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a,
    hair:0x2a2320, eye:0x1a1512,
    leg:0x2e2622, boot:0x241d15, bootDk:0x160f0a,
    wisp:0xff8a3c, wispCore:0xffe9a8, wispDk:0xb8501f,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.775, ribY:0.885, chestY:0.985, shldY:1.065, neckY:1.100,
    shoulderX:0.205, hipHalf:0.100,
    jawY:1.130, cheekY:1.202, browY:1.272, crownY:1.355, headTopY:1.410,
  };

  /* WISP FIRST — bright flame blob floating just off the open right palm (raised, thrust forward) */
  const PALM = V(0.38, 1.090, 0.60);
  const PDIR = V(0.42, 0.10, 0.90).normalize();
  const WISP_C = PALM.clone().addScaledVector(PDIR, 0.062);
  {
    const bands=[
      {t:0.0,  r:0.003},{t:0.22, r:0.058},{t:0.45, r:0.080},
      {t:0.62, r:0.072},{t:0.80, r:0.046},{t:1.0,  r:0.010},
    ];
    const n=8;
    const rings = bands.map(b=>{
      const up = (b.t-0.4)*0.170;
      const lean = Math.sin(b.t*Math.PI)*0.038;
      const c = WISP_C.clone().addScaledVector(V(0,1,0), up).addScaledVector(PDIR, lean*0.5);
      return ring(c, V(0,1,0), b.r, b.r*0.94, n, Math.PI/n);
    });
    stitch(rings, (b)=> b<2?P.wispDk:(b<3?P.wisp:P.wispCore));
    capFan(rings[0], WISP_C.clone().addScaledVector(V(0,1,0),-0.088), P.wispDk, true);
    capFan(rings.at(-1), WISP_C.clone().addScaledVector(V(0,1,0),0.110).addScaledVector(PDIR,0.012), P.wispCore);
    const coreC = WISP_C.clone().addScaledVector(V(0,1,0),0.02);
    const core = ring(coreC, V(0,1,0), 0.028, 0.028, 6, 0);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),0.038), P.wispCore);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),-0.034), P.wispCore, true);
  }

  /* TRUNK — fitted coat */
  stack([
    {y:L.hipY,   rx:0.158, rz:0.122, hex:P.coatDk},
    {y:L.waistY, rx:0.138, rz:0.108, hex:P.coat},
    {y:L.ribY,   rx:0.168, rz:0.128, hex:P.coat},
    {y:L.chestY, rx:0.192, rz:0.140, hex:P.coatLt},
    {y:L.shldY,  rx:0.198, rz:0.130, hex:P.coatLt},
    {y:L.neckY,  rx:0.075, rz:0.070, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* HIGH COLLAR — flared band framing the face (no hood) */
  {
    const n=8, ph=Math.PI/n;
    const cLo=ring(V(0,L.neckY-0.01,0.0), V(0,1,0), 0.078, 0.072, n, ph);
    const cHi=ring(V(0,L.jawY-0.045,0.004), V(0,1,0), 0.070, 0.062, n, ph);
    stitch([cLo,cHi], ()=>P.coatDk);
    capFan(cHi, V(0,L.jawY-0.055,0.0), P.coatDk, true);
  }

  /* FLARED SPLIT-SKIRT PANELS — legs show through the front gap */
  {
    const bp=[[L.hipY,-0.130],[0.52,-0.165],[0.32,-0.205],[0.14,-0.235]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.135,y2,z2), V(-0.135,y2,z2), V(-0.135,y1,z1), V(0.135,y1,z1), i%2?P.coat:P.coatDk, 0.04);
    }
    for(const s of [-1,1]){
      const sp=[[L.hipY,0.150*s,0.06],[0.50,0.205*s,0.045],[0.40,0.230*s,0.075]];
      for(let i=0;i<sp.length-1;i++){
        const [y1,x1,z1]=sp[i], [y2,x2,z2]=sp[i+1];
        const inX1=x1*0.55, inX2=x2*0.55;
        quad(V(inX1,y1,z1-0.01), V(x1,y1,z1), V(x2,y2,z2), V(inX2,y2,z2-0.01), i%2?P.coat:P.coatDk, 0.04);
      }
    }
    const trimZ=[[L.chestY,0.150],[L.waistY,0.128],[L.hipY,0.145]];
    for(let i=0;i<trimZ.length-1;i++){
      const [y1,z1]=trimZ[i],[y2,z2]=trimZ[i+1];
      quad(V(-0.018,y1,z1),V(0.018,y1,z1),V(0.018,y2,z2),V(-0.018,y2,z2),P.trim,0.03);
    }
  }

  /* HEAD — inherited tiefling skull */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.076, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.104, rz:0.100, hex:P.skin},
      {y:L.browY,  rx:0.108, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.084, rz:0.076, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);
    for(const s of [-1,1]){
      const ex=s*0.050, ey=(L.cheekY+L.browY)/2-0.004, ez=0.116;
      quad(V(ex-0.013,ey-0.009,ez), V(ex+0.013,ey-0.009,ez),
           V(ex+0.013,ey+0.011,ez-0.006), V(ex-0.013,ey+0.011,ez-0.006), P.eye, 0.0);
    }
  }

  /* SWEPT-BACK HAIR — crown-only shell, sweeps back (inherited tiefling short hair, swept for drama) */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.browY-0.01,  rx:0.098, rz:0.092, cz:-0.018, hex:P.hair},
      {y:L.crownY,      rx:0.088, rz:0.082, cz:-0.022, hex:P.hair},
      {y:L.crownY+0.05, rx:0.072, rz:0.070, cz:-0.034, hex:P.hair},
    ];
    const skip={0:faceCols, 1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings.at(-1), V(0,L.crownY+0.09,-0.045), P.hair);
  }

  /* GOATEE (inherited tiefling marker) */
  {
    const bands=[
      {y:L.jawY+0.010, rx:0.058, rz:0.046, cz:0.058, hex:P.hair},
      {y:L.jawY-0.034, rx:0.044, rz:0.036, cz:0.075, hex:P.hair},
      {y:L.jawY-0.072, rx:0.028, rz:0.024, cz:0.078, hex:P.hair},
      {y:L.jawY-0.100, rx:0.012, rz:0.011, cz:0.068, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.jawY-0.122,0.062), P.hair);
  }

  /* HORNS — backswept (inherited) */
  for(const s of [-1,1]){
    const baseX = s*0.100, baseZ = -0.010;
    const base   = V(baseX, L.browY-0.010, baseZ);
    const p1 = V(baseX + s*0.026, L.browY+0.118, baseZ - 0.028);
    const p2 = V(baseX + s*0.044, L.browY+0.210, baseZ - 0.090);
    const p3 = V(baseX + s*0.052, L.browY+0.262, baseZ - 0.150);
    tube(base, p1, 0.030, 0.023, 6, P.horn,   {capA:{hex:P.hornDk}});
    tube(p1,   p2, 0.023, 0.015, 6, P.hornLt);
    tube(p2,   p3, 0.015, 0.003, 6, P.hornLt, {capB:{hex:P.hornDk}});
  }

  /* RIGHT ARM — CASTING arm thrust forward; hand derived from the wisp palm */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.355, 1.025, 0.335);
    const WRIST = PALM.clone().addScaledVector(PDIR, -0.055);
    tube(S,E,0.062,0.050,6,P.coatLt);
    tube(E,WRIST,0.048,0.036,6,P.coat,{capB:{hex:P.skinDk}});
    const HB=WRIST.clone().addScaledVector(PDIR,0.01), HT=PALM.clone().addScaledVector(PDIR,0.015);
    tube(HB,HT,0.040,0.030,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,PDIR).normalize();
    for(const k of [-1,0,1]){
      const base=HT.clone().addScaledVector(fu,k*0.017);
      const tip=base.clone().addScaledVector(PDIR,0.05).addScaledVector(fu,k*0.012);
      tube(base,tip,0.012,0.007,4,P.skin,{capB:{hex:P.skin}});
    }
  }

  /* LEFT ARM — swept back low for the lunge counter-balance */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.30, 0.83, -0.02);
    const W2=V(-0.34, 0.565, 0.235);
    tube(S2,E2,0.060,0.048,6,P.coatLt);
    tube(E2,W2,0.046,0.034,6,P.coat,{capB:{hex:P.skinDk}});
    tube(W2, W2.clone().add(V(-0.01,-0.045,0.03)), 0.036,0.028,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — dramatic forward lunge, through the split skirt */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, -0.02), kneeL=V(-0.145,0.42,-0.18), ankL=V(-0.155,0.085,-0.24);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.02),  kneeR=V( 0.20,0.44,0.34),  ankR=V( 0.235,0.085,0.46);
    tube(hipL,kneeL,0.072,0.052,6,P.leg);
    tube(kneeL,ankL,0.050,0.036,6,P.leg);
    tube(hipR,kneeR,0.078,0.056,6,P.leg);
    tube(kneeR,ankR,0.052,0.038,6,P.leg);
    for(const [ank,toeDir] of [[ankL,V(-0.15,0,-0.9).normalize()], [ankR,V(0.35,0,0.94).normalize()]]){
      stack([
        {y:0.012, rx:0.060, rz:0.066, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.052, rz:0.056, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.155, rx:0.058, rz:0.058, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.125), 0.050,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.044, rbz:0.030});
    }
  }

  /* TAIL — thin spade-tipped tail (inherited), balancing the lunge behind the rear leg */
  {
    const root = V(-0.010, L.hipY-0.045, -0.150);
    const t1 = V(-0.070, 0.505, -0.270);
    const t2 = V(-0.108, 0.345, -0.300);
    const t3 = V(-0.120, 0.235, -0.265);
    const tip = V(-0.124, 0.155, -0.200);
    tube(root, t1, 0.038, 0.031, 6, P.coatDk);
    tube(t1,   t2, 0.031, 0.022, 6, P.skinDk);
    tube(t2,   t3, 0.022, 0.013, 6, P.skinDk);
    tube(t3,   tip,0.013, 0.006, 6, P.skinDk);
    const axis = new THREE.Vector3().subVectors(tip,t3).normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), axis).normalize();
    const fwd  = tip.clone().addScaledVector(axis, 0.052);
    const back = tip.clone().addScaledVector(axis, -0.014);
    const wingL= tip.clone().addScaledVector(side, 0.040).addScaledVector(axis, 0.006);
    const wingR= tip.clone().addScaledVector(side,-0.040).addScaledVector(axis, 0.006);
    quad(back, wingR, fwd, wingL, P.skinDk, 0.03);
    quad(back, wingL, fwd, wingR, P.skinDk, 0.03);
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
