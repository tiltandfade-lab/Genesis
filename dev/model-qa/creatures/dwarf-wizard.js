/* dev/model-qa/creatures/dwarf-wizard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED dwarf race (squat-broad race-dwarf proportions + massive beard + eyeless head) wearing the
   WIZARD kit (mage.js signature: a floor-length trim-placketed robe, an orb-staff authored first +
   canted forward, a POINTED drooping hat, a small raised casting hand). The dwarf's beard flows out
   beneath the pointed hat — the classic mountain-mage read. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarfWizard(){
  const P = {
    robe:0x3b3f63, robeDk:0x2c2f4c, robeLt:0x4a4f78, trim:0xb08d46, trimDk:0x7d6432,
    skin:0xb98a63, skinDk:0x7f5f42,
    beard:0x9a9086, beardDk:0x6d655c,
    wood:0x5a4326, woodDk:0x3f2f1a, orb:0x9fd8e6, orbCore:0xe8f6fb,
    hat:0x33375a, hatDk:0x242742, eye:0x1a1512,
    boot:0x2f271c, disc:0x4a4038, discTop:0x585047,
  };

  /* dwarf landmarks — but the robe is the lower body (hem at the disc) */
  const L = {
    hemY:0.03, kneeY:0.22, waistY:0.475, chestY:0.635, shldY:0.70, neckY:0.735,
    shoulderX:0.235,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* ROBE — one loft, floor hem up to the neck (dwarf broad) */
  stack([
    {y:L.hemY,   rx:0.268, rz:0.216, hex:P.robeDk},
    {y:L.kneeY,  rx:0.256, rz:0.204, hex:P.robe},
    {y:0.40,     rx:0.248, rz:0.198, hex:P.robe},
    {y:L.waistY, rx:0.250, rz:0.202, hex:P.robe},
    {y:L.chestY, rx:0.256, rz:0.198, hex:P.robeLt},
    {y:L.shldY,  rx:0.258, rz:0.190, hex:P.robeLt},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});
  /* robe hem flare */
  stack([
    {y:L.hemY-0.004, rx:0.290, rz:0.236, hex:P.robeDk},
    {y:0.12,         rx:0.264, rz:0.212, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});
  /* front trim placket */
  {
    const zs=[[L.chestY,0.196],[0.55,0.204],[L.waistY,0.208],[0.30,0.198],[0.10,0.212]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.030,y1,z1), V(0.030,y1,z1), V(0.030,y2,z2), V(-0.030,y2,z2), i%2?P.trim:P.trimDk, 0.04);
    }
  }
  /* belt cord */
  stack([
    {y:L.waistY-0.02, rx:0.252, rz:0.204, hex:P.trimDk},
    {y:L.waistY+0.02, rx:0.250, rz:0.202, hex:P.trim},
  ], 8, {});

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

  /* POINTED WIZARD HAT — brim around the brow, then a tall drooping cone */
  {
    const n=10, ph=Math.PI/n;
    const brimLo=ring(V(0,L.browY+0.010,0.0), V(0,1,0), 0.180, 0.168, n, ph);
    const brimHi=ring(V(0,L.browY+0.044,0.0), V(0,1,0), 0.152, 0.144, n, ph);
    stitch([brimLo,brimHi], ()=>P.hatDk);
    capFan(brimLo, V(0,L.browY-0.006,0.0), P.hatDk, true);
    const cone=[
      {y:L.crownY-0.01, rx:0.148, rz:0.140, cz:0.0},
      {y:1.12,          rx:0.100, rz:0.094, cz:-0.02},
      {y:1.24,          rx:0.062, rz:0.058, cz:-0.05},
      {y:1.34,          rx:0.032, rz:0.030, cz:-0.09},
    ].map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(cone, ()=>P.hat);
    stitch([brimHi,cone[0]], ()=>P.hat);
    capFan(cone.at(-1), V(0.02,1.42,-0.14), P.hatDk);
    const bandLo=ring(V(0,L.crownY-0.01,0.0), V(0,1,0), 0.150,0.142,n,ph);
    const bandHi=ring(V(0,L.crownY+0.04,0.0),V(0,1,0), 0.140,0.132,n,ph);
    stitch([bandLo,bandHi], ()=>P.trim);
  }

  /* STAFF FIRST — canted forward, orb leading; base planted on the disc out-right */
  const SHAFT_B=V(0.285,0.02,0.18), SHAFT_T=V(0.240,1.24,0.34);
  const GRIP=SHAFT_B.clone().lerp(SHAFT_T, 0.55);
  {
    tube(SHAFT_B, SHAFT_T, 0.024, 0.020, 6, P.wood, {capA:{hex:P.woodDk}});
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2, pr=0.046;
      const claw=V(SHAFT_T.x+Math.cos(a)*pr, SHAFT_T.y+0.048, SHAFT_T.z+Math.sin(a)*pr);
      tube(SHAFT_T, claw, 0.012,0.006,5,P.woodDk,{capB:{hex:P.woodDk}});
    }
    const oc=V(SHAFT_T.x, SHAFT_T.y+0.090, SHAFT_T.z);
    const orb=[];
    const ob=[0.0,0.35,0.62,0.82,0.96,1.0];
    for(const t of ob){ const yy=oc.y-0.050+t*0.100; const rr=Math.sqrt(Math.max(0,1-Math.pow((t-0.5)*2,2)))*0.055;
      orb.push(ring(V(oc.x,yy,oc.z), V(0,1,0), rr+0.001, rr+0.001, 8, Math.PI/8)); }
    stitch(orb, (b)=> b<2?P.orb:P.orbCore);
  }

  /* ARMS — bell sleeves. Right grips the staff; left raised in a casting gesture. */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(0.02,-0.01,0.05));
    const W=GRIP.clone().add(V(0.0,-0.01,-0.01));
    tube(S,E,0.090,0.072,6,P.robeLt);
    tube(E,W,0.082,0.058,6,P.robe,{capB:{hex:P.robeDk}});
    tube(GRIP.clone().add(V(-0.01,-0.04,0.0)), GRIP.clone().add(V(0.01,0.04,0.0)), 0.050,0.046,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const CAST=V(-0.360, 0.80, 0.24);
    const E2=S2.clone().lerp(CAST, 0.5).add(V(-0.06,-0.02,0.03));
    tube(S2,E2,0.090,0.072,6,P.robeLt);
    tube(E2,CAST,0.080,0.056,6,P.robe,{capB:{hex:P.robeDk}});
    tube(CAST.clone().add(V(0.0,-0.02,-0.01)), CAST.clone().add(V(0.0,0.03,0.02)), 0.050,0.044,6,P.skin,{capA:{hex:P.skin}});
    for(const fx of [-0.024,0.0,0.024]){
      const base=CAST.clone().add(V(fx,0.03,0.02));
      tube(base, base.clone().add(V(fx*0.6,0.05,0.02)), 0.012,0.006,4,P.skin,{capB:{hex:P.skinDk}});
    }
  }

  /* boots peeking under the hem */
  {
    for(const s of [-1,1]){
      const ank=V(s*0.10, 0.02, 0.03);
      stack([{y:0.012, rx:0.078, rz:0.086, cx:ank.x, cz:ank.z, hex:P.boot}], 6, {capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.03,ank.z), d=V(s*0.12,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.115), 0.062,0.046,6,P.boot, {capB:{hex:P.boot, lift:0.013}, raz:0.052, rbz:0.036});
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
