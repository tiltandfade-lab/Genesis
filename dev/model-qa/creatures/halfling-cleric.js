/* dev/model-qa/creatures/halfling-cleric.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet) wearing the CLERIC kit
   (cleric_fable.js signature: a flanged MACE raised high beside the head authored first, a round SHIELD
   on the off arm, a cream vestment with an oxblood tabard + raised gold cross, a shoulder mantle, a low
   gold circlet). The halfling keeps its curly hair (circlet nested in it) + bare feet. One whole-object
   function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalflingCleric(){
  const P = {
    vest:0xc9bfa2, vestDk:0x968c72, vestLt:0xddd4b8,
    tabard:0x7a2f2b, tabardDk:0x5c2421,
    gold:0xb08d46, goldDk:0x7d6432,
    mail:0x8d949a, mailDk:0x62686d,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a, eye:0x1a1512,
    wood:0x5a4326, steel:0x9aa1a6, steelDk:0x6b7176,
    leather:0x4e3d2a, trouser:0x4a4436,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.375, waistY:0.42, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* trunk — mailed chest under the cream vestment (halfling slim) */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.096, hex:P.mailDk},
    {y:L.waistY, rx:0.114, rz:0.090, hex:P.mail},
    {y:L.ribY,   rx:0.124, rz:0.098, hex:P.mail},
    {y:L.chestY, rx:0.132, rz:0.100, hex:P.mail},
    {y:L.shldY,  rx:0.134, rz:0.096, hex:P.mail},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* VESTMENT SKIRT */
  stack([
    {y:0.14, rx:0.136, rz:0.110, hex:P.vestDk},
    {y:0.26, rx:0.130, rz:0.104, hex:P.vest},
    {y:0.37, rx:0.126, rz:0.100, hex:P.vestLt},
  ], 8, {});
  stack([
    {y:0.13, rx:0.140, rz:0.114, hex:P.goldDk},
    {y:0.16, rx:0.134, rz:0.108, hex:P.gold},
  ], 8, {});
  /* belt */
  stack([
    {y:L.waistY-0.02, rx:0.116, rz:0.092, hex:P.leather},
    {y:L.waistY+0.012, rx:0.114, rz:0.090, hex:P.leather},
  ], 8, {});

  /* TABARD — front panel + raised gold cross */
  {
    const fp=[[0.565,0.100],[0.46,0.108],[0.32,0.116],[0.22,0.122],[0.14,0.128]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.056,y2,z2), V(0.056,y2,z2), V(0.056,y1,z1), V(-0.056,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const zAt=y=>{ for(let i=0;i<fp.length-1;i++){ const [y1,z1]=fp[i],[y2,z2]=fp[i+1];
      if(y<=y1&&y>=y2) return z1+(z2-z1)*(y1-y)/(y1-y2); } return 0.12; };
    const bar=(x1,x2,y1,y2)=>{
      const d=0.014, zA=zAt(y1)+0.004, zB=zAt(y2)+0.004;
      quad(V(x1,y2,zB+d), V(x2,y2,zB+d), V(x2,y1,zA+d), V(x1,y1,zA+d), P.gold, 0.02);
    };
    bar(-0.016, 0.016, 0.48, 0.30);
    bar(-0.044, 0.044, 0.44, 0.40);
  }

  /* SHOULDER MANTLE */
  stack([
    {y:0.52,  rx:0.146, rz:0.118, hex:P.vestDk},
    {y:0.565, rx:0.132, rz:0.104, hex:P.vest},
    {y:0.60,  rx:0.116, rz:0.088, hex:P.vestLt},
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

  /* GOLD CIRCLET — a low band on the brow, nested under the curls */
  {
    const n=8, ph=Math.PI/n;
    const lo=ring(V(0,L.browY+0.020,0.0), V(0,1,0), 0.106, 0.098, n, ph);
    const hi=ring(V(0,L.browY+0.044,0.0), V(0,1,0), 0.104, 0.096, n, ph);
    stitch([lo,hi], ()=>P.gold);
    quad(V(-0.008,L.browY+0.044,0.100), V(0.008,L.browY+0.044,0.100), V(0.008,L.browY+0.085,0.094), V(-0.008,L.browY+0.085,0.094), P.gold, 0.02);
  }

  /* MACE FIRST — raised high beside the head; grip = ground truth (halfling-scaled) */
  const M_BUTT=V(0.215,0.46,0.16), M_TOP=V(0.250,0.90,0.09);
  const AXIS=new THREE.Vector3().subVectors(M_TOP,M_BUTT).normalize();
  const GRIP=M_BUTT.clone().addScaledVector(AXIS,0.150);
  {
    tube(M_BUTT, GRIP.clone().addScaledVector(AXIS,-0.045), 0.015,0.016,6,P.wood,{capA:{hex:P.steelDk, lift:0.016}});
    tube(GRIP.clone().addScaledVector(AXIS,-0.045), GRIP.clone().addScaledVector(AXIS,0.045), 0.017,0.017,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.045), M_TOP.clone().addScaledVector(AXIS,-0.090), 0.016,0.014,6,P.wood);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.090), M_TOP.clone().addScaledVector(AXIS,-0.010), 0.014,0.038,6,P.steelDk);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.010), M_TOP.clone().addScaledVector(AXIS,0.076), 0.042,0.036,6,P.steel,
         {capA:{hex:P.steelDk}, capB:{hex:P.steelDk, lift:0.020}});
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const cLo=M_TOP.clone().addScaledVector(AXIS,-0.004), cHi=M_TOP.clone().addScaledVector(AXIS,0.068);
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2 + Math.PI/4;
      const d=u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a));
      const t=new THREE.Vector3().crossVectors(AXIS,d).normalize().multiplyScalar(0.005);
      const iA=cLo.clone().addScaledVector(d,0.034), iB=cHi.clone().addScaledVector(d,0.031);
      const oA=cLo.clone().addScaledVector(d,0.080), oB=cHi.clone().addScaledVector(d,0.068);
      quad(iA.clone().add(t), oA.clone().add(t), oB.clone().add(t), iB.clone().add(t), P.steel, 0.03);
      quad(iB.clone().sub(t), oB.clone().sub(t), oA.clone().sub(t), iA.clone().sub(t), P.steel, 0.03);
    }
  }

  /* RIGHT ARM — rises to the mace grip; fist derived */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const W=GRIP.clone().add(V(-0.02,0.03,-0.03));
    const E=V(0.185,0.555,0.06);
    tube(S,E,0.048,0.038,6,P.mail);
    tube(E,W,0.036,0.028,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,-0.045), GRIP.clone().addScaledVector(AXIS,0.045),
         0.030,0.026,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* SHIELD FIRST (left side) — a round targe angled out-forward; left hand meets its back */
  const SC=V(-0.230,0.50,0.10);
  const SN=V(-0.800,0.060,0.470).normalize();
  {
    const R=0.130;
    const front=ring(SC.clone().addScaledVector(SN, 0.014), SN, R, R, 12);
    const back =ring(SC.clone().addScaledVector(SN,-0.012), SN, R*0.97, R*0.97, 12);
    stitch([back,front], ()=>P.steelDk);
    capFan(front, SC.clone().addScaledVector(SN,0.048), P.steel);
    capFan(back,  SC.clone().addScaledVector(SN,-0.022), P.steelDk, true);
    tube(SC.clone().addScaledVector(SN,0.036), SC.clone().addScaledVector(SN,0.070),
         0.032,0.020,6,P.gold,{capB:{hex:P.gold, lift:0.010}});
  }

  /* LEFT ARM — down and out to the shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const W2=SC.clone().addScaledVector(SN,-0.032);
    const E2=V(-0.185,0.510,0.05);
    tube(S2,E2,0.048,0.038,6,P.mail);
    tube(E2,W2,0.036,0.028,6,P.leather);
    tube(W2.clone().add(V(0.010,0.030,-0.010)), W2.clone().add(V(-0.010,-0.030,0.010)),
         0.028,0.026,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — slim braced, BARE oversized feet */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.008, 0.008), shinL=V(-0.088,0.185,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.008, 0.006), shinR=V( 0.100,0.185,-0.02);
    tube(hipL,shinL,0.056,0.040,6,P.trouser);
    tube(hipR,shinR,0.056,0.040,6,P.trouser);
    for(const [shin,toeDir] of [[shinL,V(-0.06,0,1)], [shinR,V(0.35,0,0.94).normalize()]]){
      const ankBot=V(shin.x, 0.075, shin.z);
      tube(shin, ankBot, 0.038, 0.058, 6, P.skin);
      stack([
        {y:0.016, rx:0.078, rz:0.096, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.065, rx:0.072, rz:0.084, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.040,shin.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.155), 0.072,0.054,6,P.footpad, {capB:{hex:P.footpad, lift:0.017}, raz:0.062, rbz:0.044});
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
