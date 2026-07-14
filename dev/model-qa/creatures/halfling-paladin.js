/* dev/model-qa/creatures/halfling-paladin.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet) wearing the PALADIN kit
   (paladin.js OATH-GUARD signature: a TOWER SHIELD authored first raised across the body, a WARHAMMER
   cocked back/up at the right shoulder, a steel plate cuirass + faulds + pauldrons, an oxblood TABARD,
   a braced stance). The halfling keeps its curls under a low crested helm; the feet stay BARE (the
   halfling icon — a barefoot holy squire). One whole-object function; shield then hammer authored first
   so both hands derive true. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalflingPaladin(){
  const P = {
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xbcc2c6,
    gold:0xb08d46, goldDk:0x7d6432,
    tabard:0x7a2f2b, tabardDk:0x5c2421,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a,
    helm:0x7d818a, helmDk:0x565a61,
    wood:0x5a4326, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.375, waistY:0.42, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.140,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* TOWER SHIELD FIRST — raised across the body to a guard (halfling-scaled) */
  const SC = V(-0.205, 0.560, 0.230);
  const SN = V(-0.42, 0.06, 0.905).normalize();
  {
    const su = V(0,1,0).clone().sub(SN.clone().multiplyScalar(SN.y)).normalize();
    const sr = new THREE.Vector3().crossVectors(SN, su).normalize();
    const kite = (w,h) => [
      SC.clone().addScaledVector(su, 0.220*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su, 0.135*h).addScaledVector(sr, 0.155*w),
      SC.clone().addScaledVector(su,-0.058*h).addScaledVector(sr, 0.135*w),
      SC.clone().addScaledVector(su,-0.275*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su,-0.058*h).addScaledVector(sr,-0.135*w),
      SC.clone().addScaledVector(su, 0.135*h).addScaledVector(sr,-0.155*w),
    ];
    const front = kite(1,1).map(p=>p.clone().addScaledVector(SN,0.016));
    const back  = kite(0.94,0.96).map(p=>p.clone().addScaledVector(SN,-0.013));
    const n = front.length;
    for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(back[i], back[i2], front[i2], front[i], P.steelDk, 0.04); }
    const cF = SC.clone().addScaledVector(SN,0.020), cB = SC.clone().addScaledVector(SN,-0.018);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], cF, cF, P.tabard, 0.05);
      quad(cB, cB, back[i2], back[i], P.tabardDk, 0.05);
    }
    const frontIn = kite(0.86,0.86).map(p=>p.clone().addScaledVector(SN,0.019));
    for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(front[i], front[i2], frontIn[i2], frontIn[i], P.gold, 0.03); }
    tube(SC.clone().addScaledVector(SN,0.022), SC.clone().addScaledVector(SN,0.060), 0.040, 0.024, 8, P.steel, {capB:{hex:P.steel, lift:0.012}});
  }

  /* WARHAMMER SECOND — cocked back/up at the right shoulder */
  const H_BUTT = V(0.255, 0.420, 0.220), H_TOP = V(0.150, 0.980, -0.170);
  const AXIS = new THREE.Vector3().subVectors(H_TOP, H_BUTT).normalize();
  const GRIP = H_BUTT.clone().addScaledVector(AXIS, 0.20);
  {
    tube(H_BUTT, H_BUTT.clone().addScaledVector(AXIS,0.06), 0.016,0.014,6,P.leatherDk,{capA:{hex:P.gold, lift:0.014}});
    tube(H_BUTT.clone().addScaledVector(AXIS,0.06), GRIP.clone().addScaledVector(AXIS,-0.05), 0.014,0.014,6,P.wood);
    tube(GRIP.clone().addScaledVector(AXIS,-0.05), GRIP.clone().addScaledVector(AXIS,0.05), 0.017,0.017,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.05), H_TOP.clone().addScaledVector(AXIS,-0.09), 0.013,0.017,6,P.wood);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.09), H_TOP.clone().addScaledVector(AXIS,-0.015), 0.017,0.032,6,P.steelDk);
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const HC=H_TOP.clone().addScaledVector(AXIS,0.015);
    const blk=(du,dAx,dw)=>HC.clone().addScaledVector(u,du).addScaledVector(AXIS,dAx).addScaledVector(w,dw);
    const b=[
      blk(0.0,-0.056,-0.048), blk(0.0,0.056,-0.048), blk(0.0,0.056,0.048), blk(0.0,-0.056,0.048),
      blk(0.120,-0.050,-0.043), blk(0.120,0.050,-0.043), blk(0.120,0.050,0.043), blk(0.120,-0.050,0.043),
    ];
    quad(b[0],b[1],b[2],b[3],P.steelDk,0.03);
    quad(b[4],b[7],b[6],b[5],P.steel,0.03);
    quad(b[0],b[4],b[5],b[1],P.steel,0.03);
    quad(b[3],b[2],b[6],b[7],P.steel,0.03);
    quad(b[1],b[5],b[6],b[2],P.steel,0.03);
    quad(b[0],b[3],b[7],b[4],P.steel,0.03);
    const spTip = HC.clone().addScaledVector(u,-0.150);
    const spBase=[ HC.clone().addScaledVector(w,-0.038), HC.clone().addScaledVector(w, 0.038),
                   HC.clone().addScaledVector(AXIS,0.046), HC.clone().addScaledVector(AXIS,-0.046) ];
    for(let i=0;i<4;i++){ const i2=(i+1)%4; quad(spBase[i],spBase[i2],spTip,spTip,P.steelDk,0.03); }
  }

  /* trunk — steel cuirass (halfling slim) */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.096, hex:P.steelDk},
    {y:L.waistY, rx:0.114, rz:0.090, hex:P.steel},
    {y:L.ribY,   rx:0.126, rz:0.100, hex:P.steel},
    {y:L.chestY, rx:0.134, rz:0.102, hex:P.steelLt},
    {y:L.shldY,  rx:0.136, rz:0.098, hex:P.steel},
    {y:L.neckY,  rx:0.062, rz:0.058, hex:P.steelDk},
  ], 8, {capTop:{hex:P.steelDk, lift:0.004}});
  /* faulds */
  stack([
    {y:0.30, rx:0.140, rz:0.112, hex:P.steelDk},
    {y:0.37, rx:0.126, rz:0.100, hex:P.steel},
  ], 8, {});
  /* belt */
  stack([
    {y:L.waistY-0.015, rx:0.116, rz:0.092, hex:P.leather},
    {y:L.waistY+0.012, rx:0.114, rz:0.090, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.018,L.waistY-0.006,0.096), V(0.018,L.waistY-0.006,0.096), V(0.018,L.waistY+0.016,0.093), V(-0.018,L.waistY+0.016,0.093), P.gold, 0.02);

  /* TABARD — oxblood field, gold hem */
  {
    const fp=[[L.chestY,0.100],[0.36,0.110],[0.24,0.118],[0.16,0.124]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.056,y2,z2), V(0.056,y2,z2), V(0.056,y1,z1), V(-0.056,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const [hy,hz]=fp.at(-1);
    quad(V(-0.056,hy-0.010,hz-0.003), V(0.056,hy-0.010,hz-0.003), V(0.056,hy+0.004,hz+0.002), V(-0.056,hy+0.004,hz+0.002), P.gold, 0.02);
  }

  /* PAULDRONS — flared steel plates */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.01, 0.015);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.32); return q.add(pivot); };
    stack([
      {y:L.shldY-0.02, rx:0.076, rz:0.080, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.02, rx:0.064, rz:0.068, cx:pivot.x, cz:pivot.z, hex:P.steel},
      {y:L.shldY+0.06, rx:0.048, rz:0.050, cx:pivot.x, cz:pivot.z, hex:P.steelLt},
    ], 8, {xform:tilt, capTop:{hex:P.steelLt, lift:0.02}});
  }

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

  /* CURLS peeking at the temples + a LOW CRESTED HELM (visor slit) with a gold cross */
  {
    for(const s of [-1,1]){
      const cx=s*0.092, cz=0.024, cy=L.cheekY+0.010;
      tube(V(cx,cy,cz), V(cx*1.1,cy-0.03,cz+0.01), 0.020,0.016,4,P.hair,{capB:{hex:P.hairDk}});
    }
    const n=8, ph=Math.PI/n;
    const rimLo=ring(V(0,L.browY-0.005,0.0), V(0,1,0), 0.108, 0.100, n, ph);
    const rimHi=ring(V(0,L.browY+0.020,0.0), V(0,1,0), 0.106, 0.098, n, ph);
    stitch([rimLo,rimHi], ()=>P.helmDk);
    const dome=[
      {y:L.browY+0.03,  rx:0.104, rz:0.096},
      {y:L.crownY+0.01, rx:0.092, rz:0.084},
      {y:L.headTopY+0.01, rx:0.056, rz:0.050},
    ].map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(dome, ()=>P.helm);
    stitch([rimHi,dome[0]], ()=>P.helm);
    capFan(dome.at(-1), V(0, L.headTopY+0.055, 0.0), P.helmDk);
    /* visor slit */
    quad(V(-0.050,L.cheekY+0.02,0.096), V(0.050,L.cheekY+0.02,0.096), V(0.050,L.cheekY+0.036,0.096), V(-0.050,L.cheekY+0.036,0.096), P.helmDk, 0.02);
    /* gold cross crest */
    quad(V(-0.006,L.crownY+0.01,0.086), V(0.006,L.crownY+0.01,0.086), V(0.006,L.headTopY+0.05,0.072), V(-0.006,L.headTopY+0.05,0.072), P.gold, 0.02);
    quad(V(-0.020,L.headTopY+0.01,0.078), V(0.020,L.headTopY+0.01,0.078), V(0.020,L.headTopY+0.024,0.076), V(-0.020,L.headTopY+0.024,0.076), P.gold, 0.02);
  }

  /* RIGHT ARM — steel sleeve to the warhammer grip; fist derived */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const fistNear=GRIP.clone().addScaledVector(AXIS,-0.04);
    const E=S.clone().lerp(fistNear, 0.5).add(V(0.045,0.015,0.045));
    tube(S,E,0.048,0.038,6,P.steel);
    tube(E,fistNear,0.036,0.030,6,P.steel);
    tube(fistNear, GRIP.clone().addScaledVector(AXIS,0.04),
         0.032,0.028,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEFT ARM — raised + bent to the shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.032);
    const E2=V(-0.185, 0.510, 0.080);
    tube(S2,E2,0.048,0.038,6,P.steel);
    tube(E2,W2,0.036,0.028,6,P.steel);
    tube(W2.clone().add(V(0.010,0.030,-0.010)), W2.clone().add(V(-0.010,-0.030,0.010)),
         0.028,0.026,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — slim braced, BARE oversized feet (barefoot squire) */
  {
    const hipL=V(-0.090, L.hipY-0.008, 0.008), shinL=V(-0.108,0.185,0.05);
    const hipR=V( 0.090, L.hipY-0.008, 0.006), shinR=V( 0.120,0.185,-0.05);
    tube(hipL,shinL,0.056,0.040,6,P.steelDk);
    tube(hipR,shinR,0.056,0.040,6,P.steelDk);
    for(const [shin,toeDir] of [[shinL,V(-0.06,0,1)], [shinR,V(0.40,0,0.90).normalize()]]){
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
