/* dev/model-qa/creatures/tiefling-paladin.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED tiefling race (slim ~1.45u frame, dusky red-mauve skin, backswept HORNS, sharp GOATEE,
   thin spade-tipped TAIL) wearing the PALADIN kit (paladin.js signature: a TOWER kite SHIELD raised
   to an oath-guard, a WARHAMMER cocked back/up at the shoulder, flared steel pauldrons, a deep tabard,
   a braced staggered stance). The head stays BARE (helmless) so the horns read — an oathsworn tiefling
   redemption knight. EYELESS. One whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTieflingPaladin(){
  const P = {
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xbcc2c6,
    gold:0xb08d46, goldDk:0x7d6432,
    tabard:0x38304a, tabardDk:0x271f36, tabardLt:0x473d5c,   /* deep indigo surcoat */
    leather:0x4e3d2a, leatherDk:0x362a1c,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a, hair:0x2a2320,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.230,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* TOWER SHIELD FIRST — kite raised to an oath-guard across the body */
  const SC = V(-0.255, 0.930, 0.290);
  const SN = V(-0.42, 0.06, 0.905).normalize();
  {
    const su = V(0,1,0).clone().sub(SN.clone().multiplyScalar(SN.y)).normalize();
    const sr = new THREE.Vector3().crossVectors(SN, su).normalize();
    const kite = (w,h) => [
      SC.clone().addScaledVector(su, 0.290*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su, 0.180*h).addScaledVector(sr, 0.185*w),
      SC.clone().addScaledVector(su,-0.070*h).addScaledVector(sr, 0.162*w),
      SC.clone().addScaledVector(su,-0.360*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su,-0.070*h).addScaledVector(sr,-0.162*w),
      SC.clone().addScaledVector(su, 0.180*h).addScaledVector(sr,-0.185*w),
    ];
    const front = kite(1,1).map(p=>p.clone().addScaledVector(SN,0.022));
    const back  = kite(0.94,0.96).map(p=>p.clone().addScaledVector(SN,-0.018));
    const n = front.length;
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(back[i], back[i2], front[i2], front[i], P.steelDk, 0.04); }
    const cF = SC.clone().addScaledVector(SN,0.028), cB = SC.clone().addScaledVector(SN,-0.024);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], cF, cF, P.tabard, 0.05);
      quad(cB, cB, back[i2], back[i], P.tabardDk, 0.05); }
    const frontIn = kite(0.86,0.86).map(p=>p.clone().addScaledVector(SN,0.026));
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], frontIn[i2], frontIn[i], P.gold, 0.03); }
    tube(SC.clone().addScaledVector(SN,0.03), SC.clone().addScaledVector(SN,0.080),
         0.052, 0.030, 8, P.steel, {capB:{hex:P.steel, lift:0.015}});
  }

  /* WARHAMMER SECOND — cocked back/up at the right shoulder */
  const H_BUTT = V(0.330, 0.680, 0.280), H_TOP = V(0.170, 1.480, -0.215);
  const AXIS = new THREE.Vector3().subVectors(H_TOP, H_BUTT).normalize();
  const GRIP = H_BUTT.clone().addScaledVector(AXIS, 0.28);
  {
    tube(H_BUTT, H_BUTT.clone().addScaledVector(AXIS,0.08), 0.020,0.018,6,P.leatherDk,{capA:{hex:P.gold, lift:0.016}});
    tube(H_BUTT.clone().addScaledVector(AXIS,0.08), GRIP.clone().addScaledVector(AXIS,-0.075), 0.018,0.018,6,P.wood);
    tube(GRIP.clone().addScaledVector(AXIS,-0.075), GRIP.clone().addScaledVector(AXIS,0.075), 0.021,0.021,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.075), H_TOP.clone().addScaledVector(AXIS,-0.12), 0.017,0.022,6,P.wood);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.12), H_TOP.clone().addScaledVector(AXIS,-0.02), 0.022,0.040,6,P.steelDk);
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const HC=H_TOP.clone().addScaledVector(AXIS,0.03);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.02), HC.clone().addScaledVector(AXIS,-0.072),
         0.040,0.048,6,P.steelDk);
    const blk=(du,dAx,dw)=>HC.clone().addScaledVector(u,du).addScaledVector(AXIS,dAx).addScaledVector(w,dw);
    const b=[
      blk(0.0,-0.072,-0.062), blk(0.0,0.072,-0.062), blk(0.0,0.072,0.062), blk(0.0,-0.072,0.062),
      blk(0.160,-0.064,-0.056), blk(0.160,0.064,-0.056), blk(0.160,0.064,0.056), blk(0.160,-0.064,0.056),
    ];
    quad(b[0],b[1],b[2],b[3],P.steelDk,0.03);
    quad(b[4],b[7],b[6],b[5],P.steel,0.03);
    quad(b[0],b[4],b[5],b[1],P.steel,0.03);
    quad(b[3],b[2],b[6],b[7],P.steel,0.03);
    quad(b[1],b[5],b[6],b[2],P.steel,0.03);
    quad(b[0],b[3],b[7],b[4],P.steel,0.03);
    const spTip = HC.clone().addScaledVector(u,-0.190);
    const spBase=[ HC.clone().addScaledVector(u,0.0).addScaledVector(w,-0.048),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(w, 0.048),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(AXIS,0.058),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(AXIS,-0.058) ];
    for(let i=0;i<4;i++){ const i2=(i+1)%4; quad(spBase[i],spBase[i2],spTip,spTip,P.steelDk,0.03); }
  }

  /* trunk — steel cuirass (slim tiefling) */
  stack([
    {y:L.hipY,   rx:0.175, rz:0.132, hex:P.steelDk},
    {y:L.waistY, rx:0.150, rz:0.116, hex:P.steel},
    {y:L.ribY,   rx:0.178, rz:0.134, hex:P.steel},
    {y:L.chestY, rx:0.204, rz:0.144, hex:P.steelLt},
    {y:L.shldY,  rx:0.210, rz:0.138, hex:P.steel},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.steelDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});
  {
    const rows=[[L.ribY,0.136],[0.925,0.146],[L.chestY,0.144]];
    for(const [y,z] of rows) quad(V(-0.024,y-0.02,z), V(0.024,y-0.02,z), V(0.024,y+0.02,z+0.014), V(-0.024,y+0.02,z+0.014), P.steelLt, 0.03);
  }
  stack([
    {y:0.475, rx:0.188, rz:0.150, hex:P.steelDk},
    {y:0.575, rx:0.180, rz:0.144, hex:P.steel},
    {y:L.hipY, rx:0.173, rz:0.135, hex:P.steel},
  ], 8, {});
  stack([
    {y:0.720, rx:0.158, rz:0.122, hex:P.leather},
    {y:0.770, rx:0.155, rz:0.119, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.032,0.726,0.126), V(0.032,0.726,0.126), V(0.032,0.766,0.122), V(-0.032,0.766,0.122), P.gold, 0.02);

  /* TABARD */
  {
    const fp=[[0.99,0.148],[0.82,0.156],[0.62,0.166],[0.44,0.176],[0.32,0.182]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.092,y2,z2), V(0.092,y2,z2), V(0.092,y1,z1), V(-0.092,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const [hy,hz]=fp.at(-1);
    quad(V(-0.092,hy-0.016,hz-0.004), V(0.092,hy-0.016,hz-0.004), V(0.092,hy+0.006,hz+0.002), V(-0.092,hy+0.006,hz+0.002), P.gold, 0.02);
  }

  /* PAULDRONS */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.01, 0.015);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.32); return q.add(pivot); };
    stack([
      {y:L.shldY-0.05, rx:0.120, rz:0.124, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.02, rx:0.108, rz:0.112, cx:pivot.x, cz:pivot.z, hex:P.steel},
      {y:L.shldY+0.09, rx:0.078, rz:0.082, cx:pivot.x, cz:pivot.z, hex:P.steelLt},
    ], 8, {xform:tilt, capTop:{hex:P.steelLt, lift:0.03}});
  }

  /* HEAD — inherited tiefling skull, bare (helmless). EYELESS. */
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

  /* RIGHT ARM — to the cocked hammer grip */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const fistNear=GRIP.clone().addScaledVector(AXIS,-0.055);
    const E=S.clone().lerp(fistNear, 0.5).add(V(0.065,0.03,0.06));
    tube(S,E,0.072,0.056,6,P.steel);
    tube(E,fistNear,0.052,0.044,6,P.steel);
    tube(fistNear, GRIP.clone().addScaledVector(AXIS,0.055),
         0.044,0.040,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEFT ARM — to the guard-height shield back */
  {
    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.045);
    const E2=V(-0.248, 0.810, 0.125);
    tube(S2,E2,0.070,0.054,6,P.steel);
    tube(E2,W2,0.050,0.042,6,P.steel);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.040,0.036,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* legs — wide braced staggered guard stance, steel greaves */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.155,0.40,0.145), ankL=V(-0.175,0.085,0.180);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.185,0.40,-0.115), ankR=V( 0.205,0.085,-0.165);
    tube(hipL,kneeL,0.072,0.052,6,P.steelDk);
    tube(kneeL,ankL,0.050,0.038,6,P.steel);
    tube(hipR,kneeR,0.072,0.052,6,P.steelDk);
    tube(kneeR,ankR,0.050,0.038,6,P.steel);
    for(const k of [kneeL,kneeR]) tube(k.clone().add(V(0,0.015,-0.01)), k.clone().add(V(0,0.015,0.045)), 0.044,0.038,8,P.steelLt,{capB:{hex:P.steelLt,lift:0.01}});
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.056, rz:0.062, cx:ank.x, cz:ank.z, hex:P.steelDk},
        {y:0.09,  rx:0.050, rz:0.052, cx:ank.x, cz:ank.z, hex:P.steel},
      ], 6, {capTop:{hex:P.steel, lift:0.008}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.125), 0.048,0.036,6,P.steel, {capB:{hex:P.steel, lift:0.015}, raz:0.042, rbz:0.030});
    }
  }

  /* TAIL — thin spade-tipped tail (inherited) */
  {
    const root = V(0.030, L.hipY-0.045, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.steelDk);
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
