/* dev/model-qa/creatures/dwarf-cleric.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED dwarf race (race-dwarf.js squat-broad proportions + massive beard + eye standard)
   wearing the CLERIC kit (cleric_fable.js signature: a flanged MACE raised high beside the head
   authored first, a round SHIELD on the off arm, a cream vestment with an oxblood tabard + raised
   gold cross, a shoulder mantle). The dwarf wears no helm here — a low gold circlet reads as the
   holy-warrior priest instead. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarfCleric(){
  const P = {
    vest:0xc9bfa2, vestDk:0x968c72, vestLt:0xddd4b8,
    tabard:0x7a2f2b, tabardDk:0x5c2421,
    gold:0xb08d46, goldDk:0x7d6432,
    mail:0x8d949a, mailDk:0x62686d,
    skin:0xb98a63, skinDk:0x7f5f42,
    beard:0x9a9086, beardDk:0x6d655c,
    wood:0x5a4326, steel:0x9aa1a6, steelDk:0x6b7176,
    boot:0x2f271c, leather:0x4e3d2a, trouser:0x4a4436,
    eye:0x1a1512, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.235,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* trunk — mailed chest under the cream vestment (dwarf-broad) */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.175, hex:P.mailDk},
    {y:L.waistY, rx:0.235, rz:0.185, hex:P.mail},
    {y:L.ribY,   rx:0.250, rz:0.195, hex:P.mail},
    {y:L.chestY, rx:0.258, rz:0.200, hex:P.mail},
    {y:L.shldY,  rx:0.260, rz:0.190, hex:P.mail},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* VESTMENT SKIRT — knee-length cream cloth over the mail, boots show below */
  stack([
    {y:0.16, rx:0.258, rz:0.208, hex:P.vestDk},
    {y:0.28, rx:0.248, rz:0.198, hex:P.vest},
    {y:0.40, rx:0.240, rz:0.190, hex:P.vestLt},
  ], 8, {});
  /* gold hem band */
  stack([
    {y:0.145, rx:0.262, rz:0.212, hex:P.goldDk},
    {y:0.185, rx:0.256, rz:0.206, hex:P.gold},
  ], 8, {});

  /* belt */
  stack([
    {y:L.waistY-0.03, rx:0.245, rz:0.192, hex:P.leather},
    {y:L.waistY+0.02, rx:0.243, rz:0.190, hex:P.leather},
  ], 8, {});

  /* TABARD — front + back panel over the vestment, raised gold cross on the front */
  {
    const fp=[[0.70,0.212],[0.56,0.220],[0.38,0.230],[0.24,0.240],[0.16,0.246]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.100,y2,z2), V(0.100,y2,z2), V(0.100,y1,z1), V(-0.100,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const bp=[[0.70,-0.200],[0.50,-0.212],[0.30,-0.226],[0.16,-0.236]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.100,y2,z2), V(-0.100,y2,z2), V(-0.100,y1,z1), V(0.100,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const zAt=y=>{ for(let i=0;i<fp.length-1;i++){ const [y1,z1]=fp[i],[y2,z2]=fp[i+1];
      if(y<=y1&&y>=y2) return z1+(z2-z1)*(y1-y)/(y1-y2); } return 0.24; };
    const bar=(x1,x2,y1,y2)=>{
      const d=0.020, zA=zAt(y1)+0.004, zB=zAt(y2)+0.004;
      quad(V(x1,y2,zB+d), V(x2,y2,zB+d), V(x2,y1,zA+d), V(x1,y1,zA+d), P.gold, 0.02);
      quad(V(x1,y1,zA), V(x2,y1,zA), V(x2,y1,zA+d), V(x1,y1,zA+d), P.goldDk, 0.02);
      quad(V(x2,y2,zB), V(x1,y2,zB), V(x1,y2,zB+d), V(x2,y2,zB+d), P.goldDk, 0.02);
      quad(V(x1,y2,zB), V(x1,y1,zA), V(x1,y1,zA+d), V(x1,y2,zB+d), P.goldDk, 0.02);
      quad(V(x2,y1,zA), V(x2,y2,zB), V(x2,y2,zB+d), V(x2,y1,zA+d), P.goldDk, 0.02);
    };
    bar(-0.026, 0.026, 0.60, 0.34);
    bar(-0.072, 0.072, 0.54, 0.48);
  }

  /* SHOULDER MANTLE — a short priestly cape over the shoulders */
  stack([
    {y:0.63,  rx:0.295, rz:0.225, hex:P.vestDk},
    {y:0.70,  rx:0.272, rz:0.200, hex:P.vest},
    {y:0.755, rx:0.245, rz:0.172, hex:P.vestLt},
  ], 8, {});

  /* HEAD — inherited dwarf skull + eyes */
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

  /* GOLD CIRCLET — a low holy band on the brow (in place of the dwarf helm) */
  {
    const n=8, ph=Math.PI/n;
    const lo=ring(V(0,L.browY+0.010,0.0), V(0,1,0), 0.138, 0.126, n, ph);
    const hi=ring(V(0,L.browY+0.050,0.0), V(0,1,0), 0.136, 0.124, n, ph);
    stitch([lo,hi], ()=>P.gold);
    /* a small cross fleuron rising at the front of the circlet */
    quad(V(-0.012,L.browY+0.05,0.128), V(0.012,L.browY+0.05,0.128), V(0.012,L.browY+0.115,0.120), V(-0.012,L.browY+0.115,0.120), P.gold, 0.02);
    quad(V(-0.036,L.browY+0.085,0.124), V(0.036,L.browY+0.085,0.124), V(0.036,L.browY+0.100,0.122), V(-0.036,L.browY+0.100,0.122), P.gold, 0.02);
  }

  /* MACE FIRST — raised high beside the head; the grip is ground truth (scaled for the dwarf) */
  const M_BUTT=V(0.360,0.500,0.170), M_TOP=V(0.405,1.010,0.090);
  const AXIS=new THREE.Vector3().subVectors(M_TOP,M_BUTT).normalize();
  const GRIP=M_BUTT.clone().addScaledVector(AXIS,0.185);
  {
    tube(M_BUTT, GRIP.clone().addScaledVector(AXIS,-0.055), 0.020,0.021,6,P.wood,{capA:{hex:P.steelDk, lift:0.02}});
    tube(GRIP.clone().addScaledVector(AXIS,-0.055), GRIP.clone().addScaledVector(AXIS,0.055), 0.022,0.022,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.055), M_TOP.clone().addScaledVector(AXIS,-0.115), 0.021,0.019,6,P.wood);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.115), M_TOP.clone().addScaledVector(AXIS,-0.015), 0.019,0.050,6,P.steelDk);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.015), M_TOP.clone().addScaledVector(AXIS,0.100), 0.056,0.048,6,P.steel,
         {capA:{hex:P.steelDk}, capB:{hex:P.steelDk, lift:0.028}});
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const cLo=M_TOP.clone().addScaledVector(AXIS,-0.005), cHi=M_TOP.clone().addScaledVector(AXIS,0.092);
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2 + Math.PI/4;
      const d=u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a));
      const t=new THREE.Vector3().crossVectors(AXIS,d).normalize().multiplyScalar(0.007);
      const iA=cLo.clone().addScaledVector(d,0.046), iB=cHi.clone().addScaledVector(d,0.042);
      const oA=cLo.clone().addScaledVector(d,0.108), oB=cHi.clone().addScaledVector(d,0.090);
      quad(iA.clone().add(t), oA.clone().add(t), oB.clone().add(t), iB.clone().add(t), P.steel, 0.03);
      quad(iB.clone().sub(t), oB.clone().sub(t), oA.clone().sub(t), iA.clone().sub(t), P.steel, 0.03);
      quad(oA.clone().add(t), oA.clone().sub(t), oB.clone().sub(t), oB.clone().add(t), P.steelDk, 0.03);
    }
  }

  /* RIGHT ARM — rises to the mace grip; fist derived */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const W=GRIP.clone().add(V(-0.028,0.045,-0.045));
    const E=V(0.320,0.590,0.06);
    tube(S,E,0.096,0.076,6,P.mail);
    tube(E,W,0.070,0.056,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,-0.055), GRIP.clone().addScaledVector(AXIS,0.055),
         0.058,0.052,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* SHIELD FIRST (left side) — a round targe angled out-forward; left hand meets its back */
  const SC=V(-0.375,0.520,0.115);
  const SN=V(-0.800,0.060,0.470).normalize();
  {
    const R=0.200;
    const front=ring(SC.clone().addScaledVector(SN, 0.020), SN, R, R, 12);
    const back =ring(SC.clone().addScaledVector(SN,-0.018), SN, R*0.97, R*0.97, 12);
    stitch([back,front], ()=>P.steelDk);
    capFan(front, SC.clone().addScaledVector(SN,0.072), P.steel);
    capFan(back,  SC.clone().addScaledVector(SN,-0.032), P.steelDk, true);
    tube(SC.clone().addScaledVector(SN,0.052), SC.clone().addScaledVector(SN,0.100),
         0.050,0.030,6,P.gold,{capB:{hex:P.gold, lift:0.014}});
  }

  /* LEFT ARM — down and out to the shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const W2=SC.clone().addScaledVector(SN,-0.045);
    const E2=V(-0.300,0.560,0.05);
    tube(S2,E2,0.096,0.076,6,P.mail);
    tube(E2,W2,0.070,0.056,6,P.leather);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.052,0.048,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — short braced; boots show below the knee-length vestment */
  {
    for(const s of [-1,1]){
      const top=V(s*L.hipHalf, 0.30, 0.010), ank=V(s*0.16, 0.085, s<0?0.02:-0.02);
      tube(top, ank, 0.090, 0.066, 6, P.trouser);
      stack([
        {y:0.012, rx:0.082, rz:0.090, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.074, rz:0.076, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.155, rx:0.080, rz:0.080, cx:ank.x, cz:ank.z, hex:P.leather},
      ], 6, {capTop:{hex:P.leather, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=V(s*0.20,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.066,0.048,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.056, rbz:0.038});
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
