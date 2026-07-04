/* dev/model-qa/creatures/tiefling-cleric.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED tiefling race (slim ~1.45u frame, dusky red-mauve skin, backswept HORNS, sharp GOATEE,
   thin spade-tipped TAIL) wearing the CLERIC kit (cleric_fable.js signature: a flanged MACE raised
   high beside the head authored first, a round SHIELD on the left arm, a knee-length vestment skirt
   over boots, a hanging tabard with a raised gold cross, a shoulder mantle). The MITRE is dropped to
   an open head so the horns read; an infernal-blooded priest. EYELESS. One whole-object function, no
   anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTieflingCleric(){
  const P = {
    vest:0xc9bfa2, vestDk:0x968c72, vestLt:0xddd4b8,
    tabard:0x38304a, tabardDk:0x271f36,
    gold:0xb08d46, goldDk:0x7d6432,
    mail:0x8d949a, mailDk:0x62686d,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a, hair:0x2a2320,
    wood:0x5a4326, steel:0x9aa1a6, steelDk:0x6b7176,
    boot:0x2a221c, leather:0x4e3d2a, trouser:0x342c22,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.225,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* trunk — mailed chest under vestment (slim tiefling) */
  stack([
    {y:L.hipY,   rx:0.172, rz:0.130, hex:P.mailDk},
    {y:L.waistY, rx:0.150, rz:0.114, hex:P.mail},
    {y:L.ribY,   rx:0.176, rz:0.132, hex:P.mail},
    {y:L.chestY, rx:0.196, rz:0.140, hex:P.mail},
    {y:L.shldY,  rx:0.200, rz:0.132, hex:P.mail},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* VESTMENT SKIRT — knee-length */
  stack([
    {y:0.28, rx:0.212, rz:0.172, hex:P.vestDk},
    {y:0.44, rx:0.196, rz:0.156, hex:P.vest},
    {y:0.60, rx:0.182, rz:0.142, hex:P.vest},
    {y:L.hipY, rx:0.170, rz:0.128, hex:P.vestLt},
  ], 8, {});
  stack([
    {y:0.265, rx:0.216, rz:0.176, hex:P.goldDk},
    {y:0.305, rx:0.210, rz:0.170, hex:P.gold},
  ], 8, {});
  stack([
    {y:0.720, rx:0.156, rz:0.120, hex:P.leather},
    {y:0.770, rx:0.153, rz:0.117, hex:P.leather},
  ], 8, {});

  /* TABARD front + cross */
  {
    const fp=[[1.00,0.148],[0.82,0.154],[0.62,0.164],[0.42,0.174],[0.28,0.182]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.090,y2,z2), V(0.090,y2,z2), V(0.090,y1,z1), V(-0.090,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const zAt=y=>{ for(let i=0;i<fp.length-1;i++){ const [y1,z1]=fp[i],[y2,z2]=fp[i+1];
      if(y<=y1&&y>=y2) return z1+(z2-z1)*(y1-y)/(y1-y2); } return 0.16; };
    const bar=(x1,x2,y1,y2)=>{
      const d=0.020, zA=zAt(y1)+0.004, zB=zAt(y2)+0.004;
      quad(V(x1,y2,zB+d), V(x2,y2,zB+d), V(x2,y1,zA+d), V(x1,y1,zA+d), P.gold, 0.02);
      quad(V(x1,y1,zA), V(x2,y1,zA), V(x2,y1,zA+d), V(x1,y1,zA+d), P.goldDk, 0.02);
      quad(V(x2,y2,zB), V(x1,y2,zB), V(x1,y2,zB+d), V(x2,y2,zB+d), P.goldDk, 0.02);
      quad(V(x1,y2,zB), V(x1,y1,zA), V(x1,y1,zA+d), V(x1,y2,zB+d), P.goldDk, 0.02);
      quad(V(x2,y1,zA), V(x2,y2,zB), V(x2,y2,zB+d), V(x2,y1,zA+d), P.goldDk, 0.02);
    };
    bar(-0.024, 0.024, 0.90, 0.50);
    bar(-0.072, 0.072, 0.82, 0.755);
  }

  /* SHOULDER MANTLE */
  stack([
    {y:0.94,  rx:0.235, rz:0.180, hex:P.vestDk},
    {y:1.02,  rx:0.212, rz:0.158, hex:P.vest},
    {y:1.09,  rx:0.188, rz:0.132, hex:P.vestLt},
  ], 8, {});

  /* HEAD — inherited tiefling skull. EYELESS. */
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
    stack([
      {y:L.crownY-0.01, rx:0.086, rz:0.078, cz:-0.006, hex:P.hair},
      {y:L.crownY+0.03, rx:0.070, rz:0.062, cz:-0.010, hex:P.hair},
    ], 8, {capTop:{hex:P.hair, lift:0.012}});
  }
  /* GOATEE */
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
  /* HORNS */
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

  /* MACE FIRST — raised high beside the head, flanged head */
  const M_BUTT=V(0.300,0.680,0.170), M_TOP=V(0.345,1.290,0.095);
  const AXIS=new THREE.Vector3().subVectors(M_TOP,M_BUTT).normalize();
  const GRIP=M_BUTT.clone().addScaledVector(AXIS,0.205);
  {
    tube(M_BUTT, GRIP.clone().addScaledVector(AXIS,-0.06), 0.019,0.020,6,P.wood,{capA:{hex:P.steelDk, lift:0.02}});
    tube(GRIP.clone().addScaledVector(AXIS,-0.06), GRIP.clone().addScaledVector(AXIS,0.06), 0.021,0.021,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.06), M_TOP.clone().addScaledVector(AXIS,-0.12), 0.020,0.018,6,P.wood);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.12), M_TOP.clone().addScaledVector(AXIS,-0.015), 0.018,0.048,6,P.steelDk);
    tube(M_TOP.clone().addScaledVector(AXIS,-0.015), M_TOP.clone().addScaledVector(AXIS,0.105), 0.056,0.048,6,P.steel,
         {capA:{hex:P.steelDk}, capB:{hex:P.steelDk, lift:0.030}});
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const cLo=M_TOP.clone().addScaledVector(AXIS,-0.005), cHi=M_TOP.clone().addScaledVector(AXIS,0.095);
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2 + Math.PI/4;
      const d=u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a));
      const t=new THREE.Vector3().crossVectors(AXIS,d).normalize().multiplyScalar(0.007);
      const iA=cLo.clone().addScaledVector(d,0.046), iB=cHi.clone().addScaledVector(d,0.042);
      const oA=cLo.clone().addScaledVector(d,0.110), oB=cHi.clone().addScaledVector(d,0.092);
      quad(iA.clone().add(t), oA.clone().add(t), oB.clone().add(t), iB.clone().add(t), P.steel, 0.03);
      quad(iB.clone().sub(t), oB.clone().sub(t), oA.clone().sub(t), iA.clone().sub(t), P.steel, 0.03);
      quad(oA.clone().add(t), oA.clone().sub(t), oB.clone().sub(t), oB.clone().add(t), P.steelDk, 0.03);
    }
  }

  /* RIGHT ARM — mailed sleeve to the mace grip */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const W=GRIP.clone().add(V(-0.026,0.048,-0.042));
    const E=V(0.290,0.965,0.055);
    tube(S,E,0.072,0.058,6,P.mail);
    tube(E,W,0.052,0.044,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,-0.050), GRIP.clone().addScaledVector(AXIS,0.050),
         0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* SHIELD FIRST (left) — round targe */
  const SC=V(-0.340,0.820,0.100);
  const SN=V(-0.800,0.060,0.470).normalize();
  {
    const R=0.190;
    const front=ring(SC.clone().addScaledVector(SN, 0.020), SN, R, R, 12);
    const back =ring(SC.clone().addScaledVector(SN,-0.018), SN, R*0.97, R*0.97, 12);
    stitch([back,front], ()=>P.steelDk);
    capFan(front, SC.clone().addScaledVector(SN,0.070), P.steel);
    capFan(back,  SC.clone().addScaledVector(SN,-0.030), P.steelDk, true);
    tube(SC.clone().addScaledVector(SN,0.050), SC.clone().addScaledVector(SN,0.098),
         0.048,0.028,6,P.gold,{capB:{hex:P.gold, lift:0.014}});
  }

  /* LEFT ARM — to the shield back */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.042);
    const E2=V(-0.285,0.940,0.040);
    tube(S2,E2,0.072,0.058,6,P.mail);
    tube(E2,W2,0.052,0.044,6,P.leather);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.042,0.038,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — lower legs + boots visible under the skirt (slim tiefling) */
  {
    for(const s of [-1,1]){
      const top=V(s*L.hipHalf, 0.42, 0.010), ank=V(s*0.115, 0.085, 0.020);
      tube(top, ank, 0.056, 0.042, 6, P.trouser);
      stack([
        {y:0.012, rx:0.058, rz:0.064, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.052, rz:0.054, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.15,  rx:0.056, rz:0.056, cx:ank.x, cz:ank.z, hex:P.leather},
      ], 6, {capTop:{hex:P.leather, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=V(s*0.10,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.120), 0.048,0.036,6,P.boot,
           {capB:{hex:P.boot, lift:0.014}, raz:0.042, rbz:0.030});
    }
  }

  /* TAIL — thin spade-tipped tail (inherited) */
  {
    const root = V(0.030, L.hipY-0.045, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.vestDk);
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
