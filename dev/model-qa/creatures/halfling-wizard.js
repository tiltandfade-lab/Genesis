/* dev/model-qa/creatures/halfling-wizard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet — the icon) wearing the
   WIZARD kit (mage.js signature: a floor-length trim-placketed robe, an orb-staff authored first +
   canted forward, a POINTED drooping hat with the curls escaping beneath, a small raised casting hand).
   The bare oversized feet peek from the robe hem (the halfling read). One whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalflingWizard(){
  const P = {
    robe:0x3b3f63, robeDk:0x2c2f4c, robeLt:0x4a4f78, trim:0xb08d46, trimDk:0x7d6432,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a,
    wood:0x5a4326, woodDk:0x3f2f1a, orb:0x9fd8e6, orbCore:0xe8f6fb,
    hat:0x33375a, hatDk:0x242742, eye:0x1a1512,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hemY:0.03, kneeY:0.22, waistY:0.42, chestY:0.525, shldY:0.565, neckY:0.595,
    shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* ROBE — one loft, floor hem up to the neck (halfling slim) */
  stack([
    {y:L.hemY,   rx:0.134, rz:0.110, hex:P.robeDk},
    {y:L.kneeY,  rx:0.128, rz:0.104, hex:P.robe},
    {y:0.36,     rx:0.124, rz:0.102, hex:P.robe},
    {y:L.waistY, rx:0.122, rz:0.100, hex:P.robe},
    {y:L.chestY, rx:0.132, rz:0.100, hex:P.robeLt},
    {y:L.shldY,  rx:0.132, rz:0.096, hex:P.robeLt},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  /* robe hem flare */
  stack([
    {y:L.hemY-0.004, rx:0.148, rz:0.122, hex:P.robeDk},
    {y:0.11,         rx:0.132, rz:0.108, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});
  /* front trim placket */
  {
    const zs=[[L.chestY,0.098],[0.42,0.106],[L.waistY,0.102],[0.24,0.104],[0.08,0.112]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.022,y1,z1), V(0.022,y1,z1), V(0.022,y2,z2), V(-0.022,y2,z2), i%2?P.trim:P.trimDk, 0.04);
    }
  }
  /* belt cord */
  stack([
    {y:L.waistY-0.02, rx:0.124, rz:0.102, hex:P.trimDk},
    {y:L.waistY+0.02, rx:0.122, rz:0.100, hex:P.trim},
  ], 8, {});

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

  /* CURLS escaping under the hat brim */
  for(const s of [-1,1]){
    const cx=s*0.090, cz=0.020, cy=L.cheekY+0.020;
    tube(V(cx,cy,cz), V(cx*1.08,cy-0.035,cz+0.01), 0.020,0.015,4,P.hair,{capB:{hex:P.hairDk}});
  }

  /* POINTED WIZARD HAT — brim around the brow, then a tall drooping cone */
  {
    const n=10, ph=Math.PI/n;
    const brimLo=ring(V(0,L.browY+0.008,0.0), V(0,1,0), 0.140, 0.130, n, ph);
    const brimHi=ring(V(0,L.browY+0.036,0.0), V(0,1,0), 0.116, 0.108, n, ph);
    stitch([brimLo,brimHi], ()=>P.hatDk);
    capFan(brimLo, V(0,L.browY-0.006,0.0), P.hatDk, true);
    const cone=[
      {y:L.crownY-0.01, rx:0.112, rz:0.104, cz:0.0},
      {y:1.02,          rx:0.078, rz:0.072, cz:-0.02},
      {y:1.12,          rx:0.048, rz:0.044, cz:-0.05},
      {y:1.21,          rx:0.024, rz:0.022, cz:-0.08},
    ].map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(cone, ()=>P.hat);
    stitch([brimHi,cone[0]], ()=>P.hat);
    capFan(cone.at(-1), V(0.02,1.29,-0.12), P.hatDk);
    const bandLo=ring(V(0,L.crownY-0.01,0.0), V(0,1,0), 0.114,0.106,n,ph);
    const bandHi=ring(V(0,L.crownY+0.03,0.0),V(0,1,0), 0.104,0.096,n,ph);
    stitch([bandLo,bandHi], ()=>P.trim);
  }

  /* STAFF FIRST — canted forward, orb leading; base planted on the disc out-right */
  const SHAFT_B=V(0.215,0.02,0.16), SHAFT_T=V(0.180,1.06,0.32);
  const GRIP=SHAFT_B.clone().lerp(SHAFT_T, 0.55);
  {
    tube(SHAFT_B, SHAFT_T, 0.020, 0.016, 6, P.wood, {capA:{hex:P.woodDk}});
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2, pr=0.038;
      const claw=V(SHAFT_T.x+Math.cos(a)*pr, SHAFT_T.y+0.042, SHAFT_T.z+Math.sin(a)*pr);
      tube(SHAFT_T, claw, 0.010,0.005,5,P.woodDk,{capB:{hex:P.woodDk}});
    }
    const oc=V(SHAFT_T.x, SHAFT_T.y+0.080, SHAFT_T.z);
    const orb=[];
    const ob=[0.0,0.35,0.62,0.82,0.96,1.0];
    for(const t of ob){ const yy=oc.y-0.044+t*0.088; const rr=Math.sqrt(Math.max(0,1-Math.pow((t-0.5)*2,2)))*0.046;
      orb.push(ring(V(oc.x,yy,oc.z), V(0,1,0), rr+0.001, rr+0.001, 8, Math.PI/8)); }
    stitch(orb, (b)=> b<2?P.orb:P.orbCore);
  }

  /* ARMS — bell sleeves. Right grips the staff; left raised in a casting gesture. */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(0.01,-0.01,0.04));
    const W=GRIP.clone().add(V(0.0,-0.01,-0.01));
    tube(S,E,0.052,0.042,6,P.robeLt);
    tube(E,W,0.048,0.034,6,P.robe,{capB:{hex:P.robeDk}});
    tube(GRIP.clone().add(V(-0.01,-0.03,0.0)), GRIP.clone().add(V(0.01,0.03,0.0)), 0.028,0.026,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const CAST=V(-0.235, 0.68, 0.20);
    const E2=S2.clone().lerp(CAST, 0.5).add(V(-0.04,-0.02,0.02));
    tube(S2,E2,0.052,0.042,6,P.robeLt);
    tube(E2,CAST,0.048,0.032,6,P.robe,{capB:{hex:P.robeDk}});
    tube(CAST.clone().add(V(0.0,-0.015,-0.01)), CAST.clone().add(V(0.0,0.02,0.02)), 0.028,0.024,6,P.skin,{capA:{hex:P.skin}});
    for(const fx of [-0.016,0.0,0.016]){
      const base=CAST.clone().add(V(fx,0.02,0.02));
      tube(base, base.clone().add(V(fx*0.6,0.036,0.02)), 0.009,0.005,4,P.skin,{capB:{hex:P.skinDk}});
    }
  }

  /* BARE oversized feet peeking under the hem */
  {
    for(const s of [-1,1]){
      const shin=V(s*0.075, 0.10, 0.02);
      const ankBot=V(shin.x, 0.075, shin.z);
      tube(shin, ankBot, 0.034, 0.052, 6, P.skin);
      stack([
        {y:0.016, rx:0.070, rz:0.086, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.055, rx:0.064, rz:0.076, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.038,shin.z), d=V(s*0.12,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.130), 0.064,0.048,6,P.footpad, {capB:{hex:P.footpad, lift:0.015}, raz:0.054, rbz:0.038});
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
