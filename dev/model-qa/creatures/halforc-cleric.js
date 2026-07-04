/* dev/model-qa/creatures/halforc-cleric.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED half-orc race (heavy/broad frame, gray-green skin, heavy jaw + tusk nubs + jutting brow)
   wearing the CLERIC kit (cleric_fable.js signature: a flanged MACE authored first raised high beside
   the head, a round SHIELD on the left arm, a tall MITRE, a knee-length vestment skirt over boots, a
   hanging tabard with a raised gold cross, a shoulder mantle). A broad orcish warrior-priest; the
   tusks + brow read under the mitre's brow band. EYELESS. One whole-object function, no anchors;
   figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrcCleric(){
  const P = {
    vest:0xc9bfa2, vestDk:0x968c72, vestLt:0xddd4b8,
    tabard:0x7a2f2b, tabardDk:0x5c2421,
    gold:0xb08d46, goldDk:0x7d6432,
    mail:0x8d949a, mailDk:0x62686d,
    skin:0x7a8a6e, skinDk:0x525e48, skinLt:0x8fa080,
    tusk:0xd8cdae, tuskDk:0xb9ac86,
    wood:0x5a4326, steel:0x9aa1a6, steelDk:0x6b7176,
    boot:0x3c3226, leather:0x4e3d2a, trouser:0x50483c,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.735, waistY:0.815, ribY:0.930, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* trunk — mailed chest under the vestment (broad half-orc) */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.180, hex:P.mailDk},
    {y:L.waistY, rx:0.205, rz:0.160, hex:P.mail},
    {y:L.ribY,   rx:0.250, rz:0.185, hex:P.mail},
    {y:L.chestY, rx:0.290, rz:0.200, hex:P.mail},
    {y:L.shldY,  rx:0.305, rz:0.192, hex:P.mail},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});

  /* VESTMENT SKIRT — knee-length, boots show below */
  stack([
    {y:0.30, rx:0.295, rz:0.238, hex:P.vestDk},
    {y:0.46, rx:0.270, rz:0.215, hex:P.vest},
    {y:0.62, rx:0.250, rz:0.196, hex:P.vest},
    {y:0.76, rx:0.230, rz:0.178, hex:P.vestLt},
  ], 8, {});
  stack([
    {y:0.285, rx:0.300, rz:0.243, hex:P.goldDk},
    {y:0.325, rx:0.292, rz:0.235, hex:P.gold},
  ], 8, {});

  /* belt */
  stack([
    {y:0.790, rx:0.220, rz:0.170, hex:P.leather},
    {y:0.850, rx:0.216, rz:0.166, hex:P.leather},
  ], 8, {});

  /* TABARD front + back panels + raised gold cross */
  {
    const fp=[[1.05,0.202],[0.86,0.208],[0.66,0.218],[0.44,0.230],[0.30,0.240]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.120,y2,z2), V(0.120,y2,z2), V(0.120,y1,z1), V(-0.120,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const bp=[[1.05,-0.190],[0.78,-0.202],[0.52,-0.218],[0.30,-0.230]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.120,y2,z2), V(-0.120,y2,z2), V(-0.120,y1,z1), V(0.120,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const zAt=y=>{ for(let i=0;i<fp.length-1;i++){ const [y1,z1]=fp[i],[y2,z2]=fp[i+1];
      if(y<=y1&&y>=y2) return z1+(z2-z1)*(y1-y)/(y1-y2); } return 0.22; };
    const bar=(x1,x2,y1,y2)=>{
      const d=0.024, zA=zAt(y1)+0.004, zB=zAt(y2)+0.004;
      quad(V(x1,y2,zB+d), V(x2,y2,zB+d), V(x2,y1,zA+d), V(x1,y1,zA+d), P.gold, 0.02);
      quad(V(x1,y1,zA), V(x2,y1,zA), V(x2,y1,zA+d), V(x1,y1,zA+d), P.goldDk, 0.02);
      quad(V(x2,y2,zB), V(x1,y2,zB), V(x1,y2,zB+d), V(x2,y2,zB+d), P.goldDk, 0.02);
      quad(V(x1,y2,zB), V(x1,y1,zA), V(x1,y1,zA+d), V(x1,y2,zB+d), P.goldDk, 0.02);
      quad(V(x2,y1,zA), V(x2,y2,zB), V(x2,y2,zB+d), V(x2,y1,zA+d), P.goldDk, 0.02);
    };
    bar(-0.030, 0.030, 0.94, 0.52);
    bar(-0.088, 0.088, 0.86, 0.79);
  }

  /* SHOULDER MANTLE */
  stack([
    {y:0.99,  rx:0.335, rz:0.255, hex:P.vestDk},
    {y:1.075, rx:0.305, rz:0.225, hex:P.vest},
    {y:1.140, rx:0.272, rz:0.192, hex:P.vestLt},
  ], 8, {});

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

  /* MITRE — gold base band + tall thin-x/long-z blade to a ridge peak */
  {
    const n=10, ph=Math.PI/n;
    const bandLo=ring(V(0,L.browY+0.000,0.0), V(0,1,0), 0.150, 0.140, n, ph);
    const bandHi=ring(V(0,L.browY+0.055,0.0), V(0,1,0), 0.148, 0.140, n, ph);
    stitch([bandLo,bandHi], ()=>P.gold);
    capFan(bandLo, V(0,L.browY-0.012,0.0), P.goldDk, true);
    const body=[
      {y:L.browY+0.055, rx:0.148, rz:0.140},
      {y:1.560,         rx:0.116, rz:0.138},
      {y:1.690,         rx:0.068, rz:0.120},
      {y:1.810,         rx:0.026, rz:0.086},
    ].map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(body, ()=>P.vestLt);
    capFan(body.at(-1), V(0,1.890,0.0), P.vestLt);
    const fs=[[1.475,0.142],[1.590,0.136],[1.710,0.114],[1.800,0.088]];
    for(let i=0;i<fs.length-1;i++){
      const [y1,z1]=fs[i], [y2,z2]=fs[i+1];
      quad(V(-0.022,y1,z1+0.006), V(0.022,y1,z1+0.006), V(0.018,y2,z2+0.006), V(-0.018,y2,z2+0.006), P.gold, 0.02);
    }
    for(const s of [-1,1]){
      const zb=-0.132;
      quad(V(s*0.068,1.425,zb), V(s*0.022,1.425,zb-0.006), V(s*0.018,1.18,zb-0.030), V(s*0.058,1.18,zb-0.024), P.gold, 0.03);
    }
  }

  /* MACE FIRST — raised high beside the head, flanged head; grip = ground truth */
  const M_BUTT=V(0.375,0.720,0.200), M_TOP=V(0.430,1.420,0.110);
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
    const E=V(0.360,1.030,0.070);
    tube(S,E,0.100,0.078,6,P.mail);
    tube(E,W,0.072,0.058,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,-0.055), GRIP.clone().addScaledVector(AXIS,0.055),
         0.062,0.056,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* SHIELD FIRST (left) — round targe angled out-forward */
  const SC=V(-0.410,0.860,0.115);
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

  /* LEFT ARM — down and out to the shield back */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.048);
    const E2=V(-0.350,0.985,0.050);
    tube(S2,E2,0.100,0.078,6,P.mail);
    tube(E2,W2,0.072,0.058,6,P.leather);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.056,0.050,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — steady stance, lower legs + boots visible under the skirt (broad half-orc) */
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

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
