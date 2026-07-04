/* dev/model-qa/creatures/gnome-cleric.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED gnome race (post-F1 big head + wedge EARS + eyeless, stubby frame) wearing the CLERIC kit
   (cleric_fable.js signature: a flanged MACE raised high beside the head authored first, a round SHIELD
   on the off arm, a cream vestment with an oxblood tabard + raised gold cross, a shoulder mantle, a low
   gold circlet). The gnome must read as ITS RACE — big head + ears — under the holy dress. One
   whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnomeCleric(){
  const P = {
    vest:0xc9bfa2, vestDk:0x968c72, vestLt:0xddd4b8,
    tabard:0x7a2f2b, tabardDk:0x5c2421,
    gold:0xb08d46, goldDk:0x7d6432,
    mail:0x8d949a, mailDk:0x62686d,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    hair:0x8a7a58, hairDk:0x5f5238,
    wood:0x5a4326, steel:0x9aa1a6, steelDk:0x6b7176,
    boot:0x2f271c, leather:0x4e3d2a, trouser:0x4a4436,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.335, waistY:0.375, ribY:0.435, chestY:0.465, shldY:0.485, neckY:0.515,
    hipHalf:0.115, shoulderX:0.150,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* trunk — mailed chest under the cream vestment (gnome stubby) */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.128, hex:P.mailDk},
    {y:L.waistY, rx:0.172, rz:0.148, hex:P.mail},
    {y:L.ribY,   rx:0.158, rz:0.132, hex:P.mail},
    {y:L.chestY, rx:0.150, rz:0.124, hex:P.mail},
    {y:L.shldY,  rx:0.148, rz:0.120, hex:P.mail},
    {y:L.neckY,  rx:0.070, rz:0.066, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* VESTMENT SKIRT — knee-length cream cloth */
  stack([
    {y:0.10, rx:0.176, rz:0.148, hex:P.vestDk},
    {y:0.20, rx:0.170, rz:0.142, hex:P.vest},
    {y:0.32, rx:0.164, rz:0.136, hex:P.vestLt},
  ], 8, {});
  stack([
    {y:0.09, rx:0.180, rz:0.152, hex:P.goldDk},
    {y:0.12, rx:0.174, rz:0.146, hex:P.gold},
  ], 8, {});
  /* belt */
  stack([
    {y:L.waistY-0.02, rx:0.174, rz:0.148, hex:P.leather},
    {y:L.waistY+0.012, rx:0.172, rz:0.146, hex:P.leather},
  ], 8, {});

  /* TABARD — front panel + raised gold cross */
  {
    const fp=[[0.485,0.126],[0.40,0.134],[0.28,0.144],[0.18,0.152],[0.10,0.158]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.072,y2,z2), V(0.072,y2,z2), V(0.072,y1,z1), V(-0.072,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const zAt=y=>{ for(let i=0;i<fp.length-1;i++){ const [y1,z1]=fp[i],[y2,z2]=fp[i+1];
      if(y<=y1&&y>=y2) return z1+(z2-z1)*(y1-y)/(y1-y2); } return 0.15; };
    const bar=(x1,x2,y1,y2)=>{
      const d=0.016, zA=zAt(y1)+0.004, zB=zAt(y2)+0.004;
      quad(V(x1,y2,zB+d), V(x2,y2,zB+d), V(x2,y1,zA+d), V(x1,y1,zA+d), P.gold, 0.02);
    };
    bar(-0.020, 0.020, 0.42, 0.24);
    bar(-0.052, 0.052, 0.38, 0.34);
  }

  /* SHOULDER MANTLE */
  stack([
    {y:0.44,  rx:0.184, rz:0.150, hex:P.vestDk},
    {y:0.485, rx:0.168, rz:0.132, hex:P.vest},
    {y:0.52,  rx:0.148, rz:0.112, hex:P.vestLt},
  ], 8, {});

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

  /* GOLD CIRCLET — a low holy band on the brow with a small cross fleuron */
  {
    const n=8, ph=Math.PI/n;
    const lo=ring(V(0,L.browY+0.008,0.0), V(0,1,0), 0.142, 0.130, n, ph);
    const hi=ring(V(0,L.browY+0.040,0.0), V(0,1,0), 0.140, 0.128, n, ph);
    stitch([lo,hi], ()=>P.gold);
    quad(V(-0.010,L.browY+0.04,0.130), V(0.010,L.browY+0.04,0.130), V(0.010,L.browY+0.095,0.122), V(-0.010,L.browY+0.095,0.122), P.gold, 0.02);
    quad(V(-0.030,L.browY+0.07,0.126), V(0.030,L.browY+0.07,0.126), V(0.030,L.browY+0.083,0.124), V(-0.030,L.browY+0.083,0.124), P.gold, 0.02);
  }

  /* MACE FIRST — raised high beside the head; grip = ground truth (scaled gnome) */
  const M_BUTT=V(0.245,0.40,0.14), M_TOP=V(0.280,0.80,0.07);
  const AXIS=new THREE.Vector3().subVectors(M_TOP,M_BUTT).normalize();
  const GRIP=M_BUTT.clone().addScaledVector(AXIS,0.140);
  {
    tube(M_BUTT, GRIP.clone().addScaledVector(AXIS,-0.045), 0.016,0.017,6,P.wood,{capA:{hex:P.steelDk, lift:0.018}});
    tube(GRIP.clone().addScaledVector(AXIS,-0.045), GRIP.clone().addScaledVector(AXIS,0.045), 0.018,0.018,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.045), M_TOP.clone().addScaledVector(AXIS,-0.090), 0.017,0.015,6,P.wood);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.090), M_TOP.clone().addScaledVector(AXIS,-0.010), 0.015,0.040,6,P.steelDk);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.010), M_TOP.clone().addScaledVector(AXIS,0.080), 0.044,0.038,6,P.steel,
         {capA:{hex:P.steelDk}, capB:{hex:P.steelDk, lift:0.022}});
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const cLo=M_TOP.clone().addScaledVector(AXIS,-0.004), cHi=M_TOP.clone().addScaledVector(AXIS,0.072);
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2 + Math.PI/4;
      const d=u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a));
      const t=new THREE.Vector3().crossVectors(AXIS,d).normalize().multiplyScalar(0.006);
      const iA=cLo.clone().addScaledVector(d,0.036), iB=cHi.clone().addScaledVector(d,0.033);
      const oA=cLo.clone().addScaledVector(d,0.086), oB=cHi.clone().addScaledVector(d,0.072);
      quad(iA.clone().add(t), oA.clone().add(t), oB.clone().add(t), iB.clone().add(t), P.steel, 0.03);
      quad(iB.clone().sub(t), oB.clone().sub(t), oA.clone().sub(t), iA.clone().sub(t), P.steel, 0.03);
    }
  }

  /* RIGHT ARM — rises to the mace grip; fist derived */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const W=GRIP.clone().add(V(-0.02,0.035,-0.035));
    const E=V(0.215,0.475,0.05);
    tube(S,E,0.058,0.046,6,P.mail);
    tube(E,W,0.044,0.034,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,-0.045), GRIP.clone().addScaledVector(AXIS,0.045),
         0.036,0.032,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* SHIELD FIRST (left side) — a round targe angled out-forward; left hand meets its back */
  const SC=V(-0.240,0.42,0.09);
  const SN=V(-0.800,0.060,0.470).normalize();
  {
    const R=0.140;
    const front=ring(SC.clone().addScaledVector(SN, 0.016), SN, R, R, 12);
    const back =ring(SC.clone().addScaledVector(SN,-0.014), SN, R*0.97, R*0.97, 12);
    stitch([back,front], ()=>P.steelDk);
    capFan(front, SC.clone().addScaledVector(SN,0.052), P.steel);
    capFan(back,  SC.clone().addScaledVector(SN,-0.024), P.steelDk, true);
    tube(SC.clone().addScaledVector(SN,0.040), SC.clone().addScaledVector(SN,0.076),
         0.036,0.022,6,P.gold,{capB:{hex:P.gold, lift:0.012}});
  }

  /* LEFT ARM — down and out to the shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const W2=SC.clone().addScaledVector(SN,-0.036);
    const E2=V(-0.195,0.435,0.04);
    tube(S2,E2,0.058,0.046,6,P.mail);
    tube(E2,W2,0.044,0.034,6,P.leather);
    tube(W2.clone().add(V(0.012,0.035,-0.012)), W2.clone().add(V(-0.012,-0.035,0.012)),
         0.034,0.030,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — short braced; boots show below the vestment */
  {
    for(const s of [-1,1]){
      const top=V(s*0.10, 0.20, 0.010), ank=V(s*0.115, 0.075, s<0?0.02:-0.02);
      tube(top, ank, 0.056, 0.042, 6, P.trouser);
      stack([
        {y:0.010, rx:0.058, rz:0.066, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.08,  rx:0.052, rz:0.054, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.13,  rx:0.056, rz:0.056, cx:ank.x, cz:ank.z, hex:P.leather},
      ], 6, {capTop:{hex:P.leather, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=V(s*0.20,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.108), 0.048,0.034,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.040, rbz:0.028});
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
