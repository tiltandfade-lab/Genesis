/* dev/model-qa/creatures/halforc-sorcerer.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED half-orc race (heavy/broad frame, gray-green skin, heavy jaw + tusk nubs + jutting brow)
   wearing the SORCERER kit (sorcerer.js signature: NO staff / NO hat — a bright FLAME WISP authored
   first floating off the open casting palm, a fitted high-collared split-skirt coat, swept-back hair,
   a dramatic forward LUNGE). A raw orcish innate caster; the tusks + brow carry the race under the
   swept hair. EYELESS. One whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrcSorcerer(){
  const P = {
    coat:0x4a2f4e, coatDk:0x37243c, coatLt:0x5c3d62,
    trim:0x9c7d3e, trimDk:0x6e5a2c,
    skin:0x7a8a6e, skinDk:0x525e48, skinLt:0x8fa080,
    tusk:0xd8cdae, tuskDk:0xb9ac86, hair:0x2a2320, hairLt:0x3c322c,
    leg:0x2e2622, boot:0x241d15, bootDk:0x160f0a,
    wisp:0xff8a3c, wispCore:0xffe9a8, wispDk:0xb8501f,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.735, waistY:0.815, ribY:0.930, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* WISP FIRST — bright flame off the open right palm (raised, thrust forward) */
  const PALM = V(0.46, 1.175, 0.64);
  const PDIR = V(0.42, 0.10, 0.90).normalize();
  const WISP_C = PALM.clone().addScaledVector(PDIR, 0.064);
  {
    const bands=[
      {t:0.0,  r:0.003},{t:0.22, r:0.066},{t:0.45, r:0.092},
      {t:0.62, r:0.082},{t:0.80, r:0.052},{t:1.0,  r:0.010},
    ];
    const n=8;
    const rings = bands.map(b=>{
      const up = (b.t-0.4)*0.190;
      const lean = Math.sin(b.t*Math.PI)*0.044;
      const c = WISP_C.clone().addScaledVector(V(0,1,0), up).addScaledVector(PDIR, lean*0.5);
      return ring(c, V(0,1,0), b.r, b.r*0.94, n, Math.PI/n);
    });
    stitch(rings, (b)=> b<2?P.wispDk:(b<3?P.wisp:P.wispCore));
    capFan(rings[0], WISP_C.clone().addScaledVector(V(0,1,0),-0.098), P.wispDk, true);
    capFan(rings.at(-1), WISP_C.clone().addScaledVector(V(0,1,0),0.122).addScaledVector(PDIR,0.012), P.wispCore);
    const coreC = WISP_C.clone().addScaledVector(V(0,1,0),0.02);
    const core = ring(coreC, V(0,1,0), 0.032, 0.032, 6, 0);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),0.044), P.wispCore);
    capFan(core, coreC.clone().addScaledVector(V(0,1,0),-0.038), P.wispCore, true);
  }

  /* TRUNK — fitted coat (broad half-orc) */
  stack([
    {y:L.hipY,   rx:0.230, rz:0.176, hex:P.coatDk},
    {y:L.waistY, rx:0.200, rz:0.156, hex:P.coat},
    {y:L.ribY,   rx:0.244, rz:0.182, hex:P.coat},
    {y:L.chestY, rx:0.282, rz:0.196, hex:P.coatLt},
    {y:L.shldY,  rx:0.298, rz:0.188, hex:P.coatLt},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* HIGH COLLAR — flared band below the jaw, framing the face */
  {
    const n=8, ph=Math.PI/n;
    const cLo=ring(V(0,L.neckY-0.01,0.0), V(0,1,0), 0.150, 0.142, n, ph);
    const cHi=ring(V(0,L.jawY-0.055,0.004), V(0,1,0), 0.132, 0.120, n, ph);
    stitch([cLo,cHi], ()=>P.coatDk);
    capFan(cHi, V(0,L.jawY-0.065,0.0), P.coatDk, true);
  }

  /* FLARED SPLIT-SKIRT PANELS — legs show through the front gap (broad half-orc) */
  {
    const bp=[[L.hipY,-0.175],[0.52,-0.210],[0.32,-0.250],[0.14,-0.280]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.185,y2,z2), V(-0.185,y2,z2), V(-0.185,y1,z1), V(0.185,y1,z1), i%2?P.coat:P.coatDk, 0.04);
    }
    for(const s of [-1,1]){
      const sp=[[L.hipY,0.200*s,0.07],[0.50,0.255*s,0.055],[0.40,0.280*s,0.085]];
      for(let i=0;i<sp.length-1;i++){
        const [y1,x1,z1]=sp[i], [y2,x2,z2]=sp[i+1];
        const inX1=x1*0.55, inX2=x2*0.55;
        quad(V(inX1,y1,z1-0.01), V(x1,y1,z1), V(x2,y2,z2), V(inX2,y2,z2-0.01), i%2?P.coat:P.coatDk, 0.04);
      }
    }
    const trimZ=[[L.chestY,0.198],[L.waistY,0.170],[L.hipY,0.190]];
    for(let i=0;i<trimZ.length-1;i++){
      const [y1,z1]=trimZ[i],[y2,z2]=trimZ[i+1];
      quad(V(-0.020,y1,z1),V(0.020,y1,z1),V(0.020,y2,z2),V(-0.020,y2,z2),P.trim,0.03);
    }
  }

  /* HEAD — inherited half-orc skull. EYELESS. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.148, rz:0.126, hex:P.skin},
      {y:L.cheekY, rx:0.140, rz:0.130, hex:P.skin},
      {y:L.browY,  rx:0.132, rz:0.118, hex:P.skin},
      {y:L.crownY, rx:0.108, rz:0.096, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(const i of [1,2]) rings[2][i].z += 0.058;
    for(const i of [0,3]) rings[2][i].z += 0.030;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
    for(const s of [-1,1]){
      const bx=s*0.044, by=L.jawY-0.006, bz=0.140;
      const tx=s*0.038, ty=by+0.040, tz=bz+0.032;
      const w=0.020;
      quad(V(bx-w,by-0.008,bz), V(bx+w,by-0.008,bz), V(tx+w*0.3,ty,tz), V(tx-w*0.3,ty,tz), P.tusk, 0.0);
    }
  }

  /* SWEPT-BACK HAIR — shell over the crown/back, never the face */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.browY-0.01,  rx:0.140, rz:0.126, cz:-0.020, hex:P.hair},
      {y:L.crownY,      rx:0.120, rz:0.108, cz:-0.026, hex:P.hair},
      {y:L.crownY+0.05, rx:0.098, rz:0.090, cz:-0.040, hex:P.hairLt},
    ];
    const skip={0:faceCols, 1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings.at(-1), V(0,L.crownY+0.10,-0.052), P.hairLt);
    const tail=[
      {y:L.crownY-0.02, cz:-0.10,  rx:0.090, rz:0.070},
      {y:L.neckY+0.06,  cz:-0.165, rx:0.062, rz:0.055},
      {y:1.02,          cz:-0.200, rx:0.036, rz:0.036},
    ].map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 6, Math.PI/6));
    stitch(tail, ()=>P.hair);
    capFan(tail.at(-1), V(0,0.94,-0.225), P.hairLt);
  }

  /* RIGHT ARM — casting arm thrust forward; hand derived from the wisp palm */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.420, 1.100, 0.335);
    const WRIST = PALM.clone().addScaledVector(PDIR, -0.055);
    tube(S,E,0.100,0.078,6,P.coatLt);
    tube(E,WRIST,0.072,0.056,6,P.coat,{capB:{hex:P.skinDk}});
    const HB=WRIST.clone().addScaledVector(PDIR,0.01), HT=PALM.clone().addScaledVector(PDIR,0.015);
    tube(HB,HT,0.058,0.044,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,PDIR).normalize();
    for(const k of [-1,0,1]){
      const base=HT.clone().addScaledVector(fu,k*0.022);
      const tip=base.clone().addScaledVector(PDIR,0.058).addScaledVector(fu,k*0.015);
      tube(base,tip,0.016,0.009,4,P.skin,{capB:{hex:P.skin}});
    }
  }

  /* LEFT ARM — swept back low for the lunge counter-balance */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.360, 0.90, -0.02);
    const W2=V(-0.400, 0.610, 0.245);
    tube(S2,E2,0.098,0.076,6,P.coatLt);
    tube(E2,W2,0.070,0.054,6,P.coat,{capB:{hex:P.skinDk}});
    tube(W2, W2.clone().add(V(-0.012,-0.055,0.035)), 0.056,0.044,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — dramatic forward lunge, through the split skirt (broad half-orc) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, -0.02), kneeL=V(-0.175,0.42,-0.20), ankL=V(-0.185,0.085,-0.27);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.02),  kneeR=V( 0.235,0.44,0.38),  ankR=V( 0.275,0.085,0.50);
    tube(hipL,kneeL,0.098,0.070,6,P.leg);
    tube(kneeL,ankL,0.070,0.050,6,P.leg);
    tube(hipR,kneeR,0.104,0.074,6,P.leg);
    tube(kneeR,ankR,0.072,0.052,6,P.leg);
    for(const [ank,toeDir] of [[ankL,V(-0.15,0,-0.9).normalize()], [ankR,V(0.35,0,0.94).normalize()]]){
      stack([
        {y:0.012, rx:0.074, rz:0.082, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.064, rz:0.068, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.155, rx:0.070, rz:0.070, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.062,0.046,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.054, rbz:0.036});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
