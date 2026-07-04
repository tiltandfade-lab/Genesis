/* dev/model-qa/creatures/halfling-sorcerer.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet — the icon) wearing the
   SORCERER kit (sorcerer.js signature: NO staff / NO hat — raw innate magic: a bright FLAME WISP
   authored first floating just off the open casting palm, a fitted high-collared split-skirt coat, a
   dramatic forward LUNGE stance). The halfling keeps its curls + bare feet (a barefoot spark-blood
   caster). One whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalflingSorcerer(){
  const P = {
    coat:0x4a2f4e, coatDk:0x37243c, coatLt:0x5c3d62,
    trim:0x9c7d3e, trimDk:0x6e5a2c,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a, eye:0x1a1512,
    leg:0x2e2622,
    wisp:0xff8a3c, wispCore:0xffe9a8, wispDk:0xb8501f,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.375, waistY:0.42, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    shoulderX:0.135, hipHalf:0.088,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* WISP FIRST — bright flame blob floating off the open right palm (raised, thrust forward) */
  const PALM = V(0.30, 0.640, 0.44);
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

  /* TRUNK — fitted coat (halfling slim) */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.096, hex:P.coatDk},
    {y:L.waistY, rx:0.114, rz:0.090, hex:P.coat},
    {y:L.ribY,   rx:0.126, rz:0.100, hex:P.coat},
    {y:L.chestY, rx:0.134, rz:0.102, hex:P.coatLt},
    {y:L.shldY,  rx:0.136, rz:0.098, hex:P.coatLt},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* HIGH COLLAR */
  {
    const n=8, ph=Math.PI/n;
    const cLo=ring(V(0,L.neckY-0.01,0.0), V(0,1,0), 0.060, 0.056, n, ph);
    const cHi=ring(V(0,L.jawY-0.045,0.004), V(0,1,0), 0.054, 0.048, n, ph);
    stitch([cLo,cHi], ()=>P.coatDk);
    capFan(cHi, V(0,L.jawY-0.055,0.0), P.coatDk, true);
  }

  /* FLARED SPLIT-SKIRT PANELS */
  {
    const bp=[[L.hipY,-0.110],[0.24,-0.145],[0.12,-0.170]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.110,y2,z2), V(-0.110,y2,z2), V(-0.110,y1,z1), V(0.110,y1,z1), i%2?P.coat:P.coatDk, 0.04);
    }
    for(const s of [-1,1]){
      const sp=[[L.hipY,0.130*s,0.055],[0.24,0.160*s,0.040]];
      for(let i=0;i<sp.length-1;i++){
        const [y1,x1,z1]=sp[i], [y2,x2,z2]=sp[i+1];
        const inX1=x1*0.55, inX2=x2*0.55;
        quad(V(inX1,y1,z1-0.01), V(x1,y1,z1), V(x2,y2,z2), V(inX2,y2,z2-0.01), i%2?P.coat:P.coatDk, 0.04);
      }
    }
    const trimZ=[[L.chestY,0.100],[L.waistY,0.090],[L.hipY,0.100]];
    for(let i=0;i<trimZ.length-1;i++){
      const [y1,z1]=trimZ[i],[y2,z2]=trimZ[i+1];
      quad(V(-0.012,y1,z1),V(0.012,y1,z1),V(0.012,y2,z2),V(-0.012,y2,z2),P.trim,0.03);
    }
  }

  /* HEAD — inherited halfling */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.072, rz:0.078, hex:P.skin},
      {y:L.cheekY, rx:0.098, rz:0.096, hex:P.skin},
      {y:L.browY,  rx:0.102, rz:0.094, hex:P.skin},
      {y:L.crownY, rx:0.080, rz:0.072, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);
  }

  /* CURLY HAIR CAP (inherited) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.045, rx:0.104, rz:0.096, hex:P.hairDk},
      {y:L.crownY-0.005,rx:0.114, rz:0.104, hex:P.hair},
      {y:L.crownY+0.045,rx:0.098, rz:0.088, hex:P.hair},
      {y:L.headTopY+0.010, rx:0.060, rz:0.053, hex:P.hairDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,-0.004), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY+0.045, -0.004), P.hairDk);
    for(const a of [0.3,1.1,2.0,2.9,3.7,4.6,5.4]){
      const cx=Math.cos(a)*0.100, cz=Math.sin(a)*0.094-0.004, cy=L.crownY+Math.sin(a*3)*0.018;
      const base=V(cx,cy,cz), out=base.clone().addScaledVector(V(cx,0.01,cz).normalize(),0.014);
      tube(base, out, 0.016, 0.014, 4, P.hair, {capB:{hex:P.hair, lift:0.003}});
    }
  }

  /* RIGHT ARM — CASTING arm thrust forward; hand derived from the wisp palm */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=V(0.235, 0.555, 0.24);
    const WRIST = PALM.clone().addScaledVector(PDIR, -0.045);
    tube(S,E,0.048,0.038,6,P.coatLt);
    tube(E,WRIST,0.036,0.028,6,P.coat,{capB:{hex:P.skinDk}});
    const HB=WRIST.clone().addScaledVector(PDIR,0.008), HT=PALM.clone().addScaledVector(PDIR,0.012);
    tube(HB,HT,0.030,0.024,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,PDIR).normalize();
    for(const k of [-1,0,1]){
      const base=HT.clone().addScaledVector(fu,k*0.013);
      const tip=base.clone().addScaledVector(PDIR,0.04).addScaledVector(fu,k*0.009);
      tube(base,tip,0.010,0.005,4,P.skin,{capB:{hex:P.skin}});
    }
  }

  /* LEFT ARM — swept back low for the lunge counter-balance */
  {
    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.180, 0.500, -0.02);
    const W2=V(-0.210, 0.34, 0.15);
    tube(S2,E2,0.046,0.036,6,P.coatLt);
    tube(E2,W2,0.036,0.026,6,P.coat,{capB:{hex:P.skinDk}});
    tube(W2, W2.clone().add(V(-0.008,-0.032,0.02)), 0.028,0.022,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — forward lunge, BARE oversized feet */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.008, -0.02), kneeL=V(-0.108,0.24,-0.12), shinL=V(-0.115,0.185,-0.15);
    const hipR=V( L.hipHalf, L.hipY-0.008, 0.02),  kneeR=V( 0.130,0.25,0.19),  shinR=V( 0.150,0.185,0.25);
    tube(hipL,kneeL,0.054,0.040,6,P.leg); tube(kneeL,shinL,0.042,0.032,6,P.leg);
    tube(hipR,kneeR,0.056,0.042,6,P.leg); tube(kneeR,shinR,0.044,0.034,6,P.leg);
    for(const [shin,toeDir] of [[shinL,V(-0.15,0,-0.9).normalize()], [shinR,V(0.35,0,0.94).normalize()]]){
      const ankBot=V(shin.x, 0.075, shin.z);
      tube(shin, ankBot, 0.036, 0.056, 6, P.skin);
      stack([
        {y:0.016, rx:0.076, rz:0.094, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.065, rx:0.070, rz:0.082, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.040,shin.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.152), 0.070,0.052,6,P.footpad, {capB:{hex:P.footpad, lift:0.016}, raz:0.060, rbz:0.042});
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
