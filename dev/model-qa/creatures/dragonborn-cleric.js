/* dev/model-qa/creatures/dragonborn-cleric.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the CLERIC kit (cleric_fable.js
   signature: a flanged MACE raised high beside the head authored first, a round SHIELD on the left
   arm, a knee-length vestment skirt over boots, a hanging tabard with a raised gold cross, a shoulder
   mantle). The MITRE is dropped (horns are the crown) so the muzzle + horns read; a draconic
   war-priest. EYELESS. One whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornCleric(){
  const P = {
    vest:0xc9bfa2, vestDk:0x968c72, vestLt:0xddd4b8,
    tabard:0x7a2f2b, tabardDk:0x5c2421,
    gold:0xb08d46, goldDk:0x7d6432,
    mail:0x8d949a, mailDk:0x62686d,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a,
    wood:0x5a4326, steel:0x9aa1a6, steelDk:0x6b7176,
    boot:0x3c3226, leather:0x4e3d2a, trouser:0x554a34,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* trunk — mailed chest under vestment (broad dragonborn) */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.170, hex:P.mailDk},
    {y:L.waistY, rx:0.190, rz:0.148, hex:P.mail},
    {y:L.ribY,   rx:0.230, rz:0.172, hex:P.mail},
    {y:L.chestY, rx:0.268, rz:0.188, hex:P.mail},
    {y:L.shldY,  rx:0.278, rz:0.180, hex:P.mail},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.006}});

  /* VESTMENT SKIRT — knee-length */
  stack([
    {y:0.30, rx:0.285, rz:0.230, hex:P.vestDk},
    {y:0.46, rx:0.262, rz:0.208, hex:P.vest},
    {y:0.62, rx:0.242, rz:0.190, hex:P.vest},
    {y:0.76, rx:0.222, rz:0.172, hex:P.vestLt},
  ], 8, {});
  stack([
    {y:0.285, rx:0.290, rz:0.235, hex:P.goldDk},
    {y:0.325, rx:0.282, rz:0.227, hex:P.gold},
  ], 8, {});
  stack([
    {y:0.805, rx:0.210, rz:0.162, hex:P.leather},
    {y:0.860, rx:0.206, rz:0.158, hex:P.leather},
  ], 8, {});

  /* TABARD front + back + cross */
  {
    const fp=[[1.06,0.192],[0.87,0.198],[0.66,0.208],[0.44,0.220],[0.30,0.230]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.115,y2,z2), V(0.115,y2,z2), V(0.115,y1,z1), V(-0.115,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const bp=[[1.06,-0.180],[0.78,-0.192],[0.52,-0.208],[0.30,-0.220]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.115,y2,z2), V(-0.115,y2,z2), V(-0.115,y1,z1), V(0.115,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const zAt=y=>{ for(let i=0;i<fp.length-1;i++){ const [y1,z1]=fp[i],[y2,z2]=fp[i+1];
      if(y<=y1&&y>=y2) return z1+(z2-z1)*(y1-y)/(y1-y2); } return 0.21; };
    const bar=(x1,x2,y1,y2)=>{
      const d=0.022, zA=zAt(y1)+0.004, zB=zAt(y2)+0.004;
      quad(V(x1,y2,zB+d), V(x2,y2,zB+d), V(x2,y1,zA+d), V(x1,y1,zA+d), P.gold, 0.02);
      quad(V(x1,y1,zA), V(x2,y1,zA), V(x2,y1,zA+d), V(x1,y1,zA+d), P.goldDk, 0.02);
      quad(V(x2,y2,zB), V(x1,y2,zB), V(x1,y2,zB+d), V(x2,y2,zB+d), P.goldDk, 0.02);
      quad(V(x1,y2,zB), V(x1,y1,zA), V(x1,y1,zA+d), V(x1,y2,zB+d), P.goldDk, 0.02);
      quad(V(x2,y1,zA), V(x2,y2,zB), V(x2,y2,zB+d), V(x2,y1,zA+d), P.goldDk, 0.02);
    };
    bar(-0.028, 0.028, 0.94, 0.52);
    bar(-0.082, 0.082, 0.86, 0.79);
  }

  /* SHOULDER MANTLE */
  stack([
    {y:0.99,  rx:0.320, rz:0.245, hex:P.vestDk},
    {y:1.075, rx:0.292, rz:0.215, hex:P.vest},
    {y:1.140, rx:0.260, rz:0.182, hex:P.vestLt},
  ], 8, {});

  /* HEAD — inherited dragonborn skull. EYELESS. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.100, rz:0.098, hex:P.scale},
      {y:L.muzzleY, rx:0.118, rz:0.116, hex:P.scale},
      {y:L.browY,   rx:0.122, rz:0.108, hex:P.scale},
      {y:L.crownY,  rx:0.098, rz:0.086, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.010; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.004), P.scaleDk);
    const muzBase = V(0, L.muzzleY-0.01, 0.118);
    const muzMid  = V(0, L.muzzleY-0.030, 0.186);
    const muzTip  = V(0, L.muzzleY-0.050, 0.238);
    tube(muzBase, muzMid, 0.112, 0.094, n, P.scale, {raz:0.100, rbz:0.086, phase:ph});
    tube(muzMid, muzTip, 0.094, 0.066, n, P.scaleLt, {raz:0.086, rbz:0.060, phase:ph, capB:{hex:P.scaleDk, lift:0.014}});
    quad(V(-0.058,L.muzzleY-0.070,0.128), V(0.058,L.muzzleY-0.070,0.128),
         V(0.036,L.muzzleY-0.086,0.224), V(-0.036,L.muzzleY-0.086,0.224), P.scaleBelly, 0.05);
    for(const s of [-1,1]){
      const hb = V(s*0.072, L.crownY-0.015, -0.020);
      const ht = V(s*0.098, L.crownY+0.075, -0.115);
      tube(hb, ht, 0.032, 0.012, 6, P.horn, {capB:{hex:P.hornTip, lift:0.008}});
    }
  }

  /* MACE FIRST — raised high beside the head, flanged head */
  const M_BUTT=V(0.375,0.730,0.200), M_TOP=V(0.430,1.430,0.110);
  const AXIS=new THREE.Vector3().subVectors(M_TOP,M_BUTT).normalize();
  const GRIP=M_BUTT.clone().addScaledVector(AXIS,0.235);
  {
    tube(M_BUTT, GRIP.clone().addScaledVector(AXIS,-0.065), 0.022,0.023,6,P.wood,{capA:{hex:P.steelDk, lift:0.02}});
    tube(GRIP.clone().addScaledVector(AXIS,-0.065), GRIP.clone().addScaledVector(AXIS,0.065), 0.024,0.024,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.065), M_TOP.clone().addScaledVector(AXIS,-0.140), 0.023,0.021,6,P.wood);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.140), M_TOP.clone().addScaledVector(AXIS,-0.015), 0.021,0.056,6,P.steelDk);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.015), M_TOP.clone().addScaledVector(AXIS,0.120), 0.064,0.056,6,P.steel,
         {capA:{hex:P.steelDk}, capB:{hex:P.steelDk, lift:0.030}});
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const cLo=M_TOP.clone().addScaledVector(AXIS,-0.005), cHi=M_TOP.clone().addScaledVector(AXIS,0.110);
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2 + Math.PI/4;
      const d=u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a));
      const t=new THREE.Vector3().crossVectors(AXIS,d).normalize().multiplyScalar(0.007);
      const iA=cLo.clone().addScaledVector(d,0.054), iB=cHi.clone().addScaledVector(d,0.050);
      const oA=cLo.clone().addScaledVector(d,0.124), oB=cHi.clone().addScaledVector(d,0.104);
      quad(iA.clone().add(t), oA.clone().add(t), oB.clone().add(t), iB.clone().add(t), P.steel, 0.03);
      quad(iB.clone().sub(t), oB.clone().sub(t), oA.clone().sub(t), iA.clone().sub(t), P.steel, 0.03);
      quad(oA.clone().add(t), oA.clone().sub(t), oB.clone().sub(t), oB.clone().add(t), P.steelDk, 0.03);
    }
  }

  /* RIGHT ARM — mailed sleeve to the mace grip */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const W=GRIP.clone().add(V(-0.030,0.052,-0.048));
    const E=V(0.360,1.040,0.070);
    tube(S,E,0.100,0.078,6,P.mail);
    tube(E,W,0.072,0.058,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,-0.055), GRIP.clone().addScaledVector(AXIS,0.055),
         0.062,0.056,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});
  }

  /* SHIELD FIRST (left) — round targe */
  const SC=V(-0.410,0.870,0.115);
  const SN=V(-0.800,0.060,0.470).normalize();
  {
    const R=0.230;
    const front=ring(SC.clone().addScaledVector(SN, 0.022), SN, R, R, 12);
    const back =ring(SC.clone().addScaledVector(SN,-0.020), SN, R*0.97, R*0.97, 12);
    stitch([back,front], ()=>P.steelDk);
    capFan(front, SC.clone().addScaledVector(SN,0.080), P.steel);
    capFan(back,  SC.clone().addScaledVector(SN,-0.034), P.steelDk, true);
    tube(SC.clone().addScaledVector(SN,0.058), SC.clone().addScaledVector(SN,0.110),
         0.056,0.032,6,P.gold,{capB:{hex:P.gold, lift:0.014}});
  }

  /* LEFT ARM — to the shield back */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.048);
    const E2=V(-0.350,0.990,0.050);
    tube(S2,E2,0.100,0.078,6,P.mail);
    tube(E2,W2,0.072,0.058,6,P.leather);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.056,0.050,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});
  }

  /* LEGS — steady stance, boots visible under the skirt (broad dragonborn) */
  {
    for(const s of [-1,1]){
      const top=V(s*L.hipHalf, 0.44, 0.010), ank=V(s*0.135, 0.085, 0.020);
      tube(top, ank, 0.072, 0.052, 6, P.trouser);
      stack([
        {y:0.012, rx:0.076, rz:0.084, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.068, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.074, rz:0.074, cx:ank.x, cz:ank.z, hex:P.leather},
      ], 6, {capTop:{hex:P.leather, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=V(s*0.10,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.062,0.046,6,P.boot,
           {capB:{hex:P.boot, lift:0.015}, raz:0.054, rbz:0.038});
    }
  }

  /* TAIL — thick tapering dragonborn tail (inherited) */
  {
    const root = V(0.04, L.hipY-0.14, -0.245);
    const t1   = V(0.230,0.545, -0.320);
    const t2   = V(0.360,0.400, -0.360);
    const t3   = V(0.445,0.270, -0.360);
    const t4   = V(0.470,0.165, -0.320);
    const tip  = V(0.470,0.115, -0.255);
    tube(root, t1, 0.112, 0.092, 8, P.scale,   {phase:Math.PI/8});
    tube(t1,   t2, 0.092, 0.070, 8, P.scale,   {phase:Math.PI/8});
    tube(t2,   t3, 0.070, 0.046, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t3,   t4, 0.046, 0.025, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t4,   tip,0.025, 0.012, 8, P.scaleDk, {phase:Math.PI/8, capB:{hex:P.scaleDk, lift:0.006}});
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
