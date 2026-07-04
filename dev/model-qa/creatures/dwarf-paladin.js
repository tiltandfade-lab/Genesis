/* dev/model-qa/creatures/dwarf-paladin.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED dwarf race (squat-broad race-dwarf proportions + massive beard + domed helm + eyeless
   head) wearing the PALADIN kit (paladin.js OATH-GUARD signature: a TOWER SHIELD authored first raised
   across the body to a guard, a WARHAMMER cocked back/up at the right shoulder ready to strike, a steel
   plate cuirass + faulds + big pauldrons, an oxblood TABARD, a wide staggered braced stance). The dwarf
   keeps its domed helm (a holy-warrior read) with the beard flowing out beneath. One whole-object
   function, no anchors; shield then hammer authored first so both hands derive true. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarfPaladin(){
  const P = {
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xbcc2c6,
    gold:0xb08d46, goldDk:0x7d6432,
    tabard:0x7a2f2b, tabardDk:0x5c2421,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    skin:0xb98a63, skinDk:0x7f5f42,
    beard:0x9a9086, beardDk:0x6d655c,
    helm:0x7d818a, helmDk:0x565a61,
    wood:0x5a4326, boot:0x2f271c,
    eye:0x1a1512, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.245,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* TOWER SHIELD FIRST — raised across the body to a guard (scaled short/broad) */
  const SC = V(-0.300, 0.615, 0.290);
  const SN = V(-0.42, 0.06, 0.905).normalize();
  {
    const su = V(0,1,0).clone().sub(SN.clone().multiplyScalar(SN.y)).normalize();
    const sr = new THREE.Vector3().crossVectors(SN, su).normalize();
    const kite = (w,h) => [
      SC.clone().addScaledVector(su, 0.270*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su, 0.170*h).addScaledVector(sr, 0.185*w),
      SC.clone().addScaledVector(su,-0.070*h).addScaledVector(sr, 0.160*w),
      SC.clone().addScaledVector(su,-0.330*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su,-0.070*h).addScaledVector(sr,-0.160*w),
      SC.clone().addScaledVector(su, 0.170*h).addScaledVector(sr,-0.185*w),
    ];
    const front = kite(1,1).map(p=>p.clone().addScaledVector(SN,0.020));
    const back  = kite(0.94,0.96).map(p=>p.clone().addScaledVector(SN,-0.016));
    const n = front.length;
    for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(back[i], back[i2], front[i2], front[i], P.steelDk, 0.04); }
    const cF = SC.clone().addScaledVector(SN,0.026), cB = SC.clone().addScaledVector(SN,-0.022);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], cF, cF, P.tabard, 0.05);
      quad(cB, cB, back[i2], back[i], P.tabardDk, 0.05);
    }
    const frontIn = kite(0.86,0.86).map(p=>p.clone().addScaledVector(SN,0.024));
    for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(front[i], front[i2], frontIn[i2], frontIn[i], P.gold, 0.03); }
    tube(SC.clone().addScaledVector(SN,0.028), SC.clone().addScaledVector(SN,0.078), 0.052, 0.030, 8, P.steel, {capB:{hex:P.steel, lift:0.014}});
  }

  /* WARHAMMER SECOND — cocked back/up at the right shoulder */
  const H_BUTT = V(0.370, 0.430, 0.290), H_TOP = V(0.205, 1.140, -0.230);
  const AXIS = new THREE.Vector3().subVectors(H_TOP, H_BUTT).normalize();
  const GRIP = H_BUTT.clone().addScaledVector(AXIS, 0.26);
  {
    tube(H_BUTT, H_BUTT.clone().addScaledVector(AXIS,0.08), 0.020,0.018,6,P.leatherDk,{capA:{hex:P.gold, lift:0.016}});
    tube(H_BUTT.clone().addScaledVector(AXIS,0.08), GRIP.clone().addScaledVector(AXIS,-0.065), 0.018,0.018,6,P.wood);
    tube(GRIP.clone().addScaledVector(AXIS,-0.065), GRIP.clone().addScaledVector(AXIS,0.065), 0.021,0.021,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.065), H_TOP.clone().addScaledVector(AXIS,-0.12), 0.017,0.022,6,P.wood);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.12), H_TOP.clone().addScaledVector(AXIS,-0.02), 0.022,0.040,6,P.steelDk);
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const HC=H_TOP.clone().addScaledVector(AXIS,0.02);
    const blk=(du,dAx,dw)=>HC.clone().addScaledVector(u,du).addScaledVector(AXIS,dAx).addScaledVector(w,dw);
    const b=[
      blk(0.0,-0.070,-0.060), blk(0.0,0.070,-0.060), blk(0.0,0.070,0.060), blk(0.0,-0.070,0.060),
      blk(0.155,-0.062,-0.054), blk(0.155,0.062,-0.054), blk(0.155,0.062,0.054), blk(0.155,-0.062,0.054),
    ];
    quad(b[0],b[1],b[2],b[3],P.steelDk,0.03);
    quad(b[4],b[7],b[6],b[5],P.steel,0.03);
    quad(b[0],b[4],b[5],b[1],P.steel,0.03);
    quad(b[3],b[2],b[6],b[7],P.steel,0.03);
    quad(b[1],b[5],b[6],b[2],P.steel,0.03);
    quad(b[0],b[3],b[7],b[4],P.steel,0.03);
    const spTip = HC.clone().addScaledVector(u,-0.185);
    const spBase=[ HC.clone().addScaledVector(w,-0.046), HC.clone().addScaledVector(w, 0.046),
                   HC.clone().addScaledVector(AXIS,0.056), HC.clone().addScaledVector(AXIS,-0.056) ];
    for(let i=0;i<4;i++){ const i2=(i+1)%4; quad(spBase[i],spBase[i2],spTip,spTip,P.steelDk,0.03); }
  }

  /* trunk — steel cuirass (dwarf-broad) */
  stack([
    {y:L.hipY,   rx:0.228, rz:0.174, hex:P.steelDk},
    {y:L.waistY, rx:0.238, rz:0.186, hex:P.steel},
    {y:L.ribY,   rx:0.252, rz:0.196, hex:P.steel},
    {y:L.chestY, rx:0.262, rz:0.202, hex:P.steelLt},
    {y:L.shldY,  rx:0.264, rz:0.192, hex:P.steel},
    {y:L.neckY,  rx:0.110, rz:0.104, hex:P.steelDk},
  ], 8, {capTop:{hex:P.steelDk, lift:0.005}});
  { const rows=[[L.ribY,0.186],[0.60,0.194],[L.chestY,0.198]];
    for(const [y,z] of rows) quad(V(-0.026,y-0.02,z), V(0.026,y-0.02,z), V(0.026,y+0.02,z+0.012), V(-0.026,y+0.02,z+0.012), P.steelLt, 0.03); }
  /* faulds */
  stack([
    {y:0.30, rx:0.252, rz:0.200, hex:P.steelDk},
    {y:0.40, rx:0.240, rz:0.188, hex:P.steel},
  ], 8, {});
  /* belt */
  stack([
    {y:L.waistY-0.02, rx:0.244, rz:0.190, hex:P.leather},
    {y:L.waistY+0.02, rx:0.242, rz:0.188, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.036,L.waistY-0.010,0.194), V(0.036,L.waistY-0.010,0.194), V(0.036,L.waistY+0.026,0.190), V(-0.036,L.waistY+0.026,0.190), P.gold, 0.02);

  /* TABARD — oxblood field over the cuirass, gold hem */
  {
    const fp=[[L.chestY,0.198],[0.55,0.206],[0.42,0.214],[0.30,0.220],[0.22,0.224]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.100,y2,z2), V(0.100,y2,z2), V(0.100,y1,z1), V(-0.100,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const [hy,hz]=fp.at(-1);
    quad(V(-0.100,hy-0.016,hz-0.004), V(0.100,hy-0.016,hz-0.004), V(0.100,hy+0.006,hz+0.002), V(-0.100,hy+0.006,hz+0.002), P.gold, 0.02);
  }

  /* PAULDRONS — big flared steel plates */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.01, 0.015);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.32); return q.add(pivot); };
    stack([
      {y:L.shldY-0.03, rx:0.125, rz:0.130, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.03, rx:0.108, rz:0.114, cx:pivot.x, cz:pivot.z, hex:P.steel},
      {y:L.shldY+0.09, rx:0.080, rz:0.084, cx:pivot.x, cz:pivot.z, hex:P.steelLt},
    ], 8, {xform:tilt, capTop:{hex:P.steelLt, lift:0.03}});
  }

  /* HEAD — inherited dwarf skull (eyeless) */
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

  /* DOMED HELM (inherited) with a gold cross fleuron for the paladin read */
  {
    const n=8, ph=Math.PI/n;
    const rimLo=ring(V(0,L.browY+0.015,0.0), V(0,1,0), 0.140, 0.128, n, ph);
    const rimHi=ring(V(0,L.browY+0.04,0.0), V(0,1,0), 0.138, 0.126, n, ph);
    stitch([rimLo,rimHi], ()=>P.helmDk);
    const dome=[
      {y:L.browY+0.05,  rx:0.136, rz:0.124},
      {y:L.crownY+0.01, rx:0.128, rz:0.116},
      {y:L.headTopY+0.03, rx:0.086, rz:0.078},
    ].map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(dome, ()=>P.helm);
    stitch([rimHi,dome[0]], ()=>P.helm);
    capFan(dome.at(-1), V(0, L.headTopY+0.095, 0.0), P.helmDk);
    quad(V(-0.012,L.browY+0.03,0.132), V(0.012,L.browY+0.03,0.132), V(0.010,L.jawY+0.05,0.145), V(-0.010,L.jawY+0.05,0.145), P.helmDk, 0.02);
    /* gold cross crest on the brow-front */
    quad(V(-0.010,L.crownY+0.02,0.120), V(0.010,L.crownY+0.02,0.120), V(0.010,L.headTopY+0.09,0.100), V(-0.010,L.headTopY+0.09,0.100), P.gold, 0.02);
    quad(V(-0.032,L.headTopY+0.03,0.110), V(0.032,L.headTopY+0.03,0.110), V(0.032,L.headTopY+0.05,0.108), V(-0.032,L.headTopY+0.05,0.108), P.gold, 0.02);
  }

  /* RIGHT ARM — steel sleeve to the warhammer grip; fist derived */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const fistNear=GRIP.clone().addScaledVector(AXIS,-0.05);
    const E=S.clone().lerp(fistNear, 0.5).add(V(0.070,0.02,0.06));
    tube(S,E,0.092,0.074,6,P.steel);
    tube(E,fistNear,0.062,0.054,6,P.steel);
    tube(fistNear, GRIP.clone().addScaledVector(AXIS,0.05),
         0.056,0.050,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEFT ARM — raised + bent to the shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.045);
    const E2=V(-0.300, 0.560, 0.100);
    tube(S2,E2,0.090,0.072,6,P.steel);
    tube(E2,W2,0.060,0.050,6,P.steel);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.050,0.046,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — steel greaves, wide staggered guard stance */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), ankL=V(-0.185,0.090,0.10);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), ankR=V( 0.200,0.090,-0.10);
    tube(hipL,ankL,0.098,0.072,6,P.steelDk);
    tube(hipR,ankR,0.098,0.072,6,P.steelDk);
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.40,0,0.90).normalize()]]){
      stack([
        {y:0.012, rx:0.078, rz:0.086, cx:ank.x, cz:ank.z, hex:P.steelDk},
        {y:0.10,  rx:0.070, rz:0.072, cx:ank.x, cz:ank.z, hex:P.steel},
      ], 6, {capTop:{hex:P.steel, lift:0.006}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.062,0.046,6,P.steel, {capB:{hex:P.steel, lift:0.015}, raz:0.054, rbz:0.038});
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
