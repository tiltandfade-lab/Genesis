/* dev/model-qa/creatures/dragonborn-paladin.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED dragonborn race (race-dragonborn: broad powerful frame, reptilian MUZZLE head with a
   heavy brow + back-swept HORN STUBS, a thick tapering TAIL, bronze/rust scale hide) wearing the
   PALADIN kit (paladin.js signature: a TOWER SHIELD authored first raised to an OATH-GUARD, a
   WARHAMMER cocked back at the shoulder ready to strike, a steel full-plate cuirass + faulds + big
   pauldrons, an oxblood TABARD, a wide staggered braced stance). The dragon head stays BARE (no
   closed helm — the muzzle is the read) with a small steel gorget. One whole-object function, no
   anchors; shield then hammer authored first so both hands derive true. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornPaladin(){
  const P = {
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xbcc2c6,
    gold:0xb08d46, goldDk:0x7d6432,
    tabard:0x7a2f2b, tabardDk:0x5c2421, tabardLt:0x8f3a34,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a, eye:0x1a1512, eyeGlow:0xd9c25a,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* TOWER SHIELD FIRST — raised to a chest guard, crossing the body, face to the fore */
  const SC = V(-0.285, 1.000, 0.310);
  const SN = V(-0.42, 0.06, 0.905).normalize();
  {
    const su = V(0,1,0).clone().sub(SN.clone().multiplyScalar(SN.y)).normalize();
    const sr = new THREE.Vector3().crossVectors(SN, su).normalize();
    const kite = (w,h) => [
      SC.clone().addScaledVector(su, 0.300*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su, 0.190*h).addScaledVector(sr, 0.195*w),
      SC.clone().addScaledVector(su,-0.075*h).addScaledVector(sr, 0.170*w),
      SC.clone().addScaledVector(su,-0.375*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su,-0.075*h).addScaledVector(sr,-0.170*w),
      SC.clone().addScaledVector(su, 0.190*h).addScaledVector(sr,-0.195*w),
    ];
    const front = kite(1,1).map(p=>p.clone().addScaledVector(SN,0.022));
    const back  = kite(0.94,0.96).map(p=>p.clone().addScaledVector(SN,-0.018));
    const n = front.length;
    for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(back[i], back[i2], front[i2], front[i], P.steelDk, 0.04); }
    const cF = SC.clone().addScaledVector(SN,0.028), cB = SC.clone().addScaledVector(SN,-0.024);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], cF, cF, P.tabard, 0.05);
      quad(cB, cB, back[i2], back[i], P.tabardDk, 0.05);
    }
    const frontIn = kite(0.86,0.86).map(p=>p.clone().addScaledVector(SN,0.026));
    for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(front[i], front[i2], frontIn[i2], frontIn[i], P.gold, 0.03); }
    tube(SC.clone().addScaledVector(SN,0.03), SC.clone().addScaledVector(SN,0.085), 0.058, 0.032, 8, P.steel, {capB:{hex:P.steel, lift:0.015}});
  }

  /* WARHAMMER SECOND — cocked back/up at the right shoulder, ready to strike */
  const H_BUTT = V(0.360, 0.720, 0.300), H_TOP = V(0.190, 1.560, -0.230);
  const AXIS = new THREE.Vector3().subVectors(H_TOP, H_BUTT).normalize();
  const GRIP = H_BUTT.clone().addScaledVector(AXIS, 0.30);
  {
    tube(H_BUTT, H_BUTT.clone().addScaledVector(AXIS,0.09), 0.022,0.020,6,P.leatherDk,{capA:{hex:P.gold, lift:0.018}});
    tube(H_BUTT.clone().addScaledVector(AXIS,0.09), GRIP.clone().addScaledVector(AXIS,-0.075), 0.020,0.020,6,P.wood);
    tube(GRIP.clone().addScaledVector(AXIS,-0.075), GRIP.clone().addScaledVector(AXIS,0.075), 0.023,0.023,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.075), H_TOP.clone().addScaledVector(AXIS,-0.13), 0.019,0.024,6,P.wood);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.13), H_TOP.clone().addScaledVector(AXIS,-0.02), 0.024,0.044,6,P.steelDk);
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const HC=H_TOP.clone().addScaledVector(AXIS,0.03);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.02), HC.clone().addScaledVector(AXIS,-0.078), 0.044,0.052,6,P.steelDk);
    const blk=(du,dAx,dw)=>HC.clone().addScaledVector(u,du).addScaledVector(AXIS,dAx).addScaledVector(w,dw);
    const b=[
      blk(0.0,-0.078,-0.068), blk(0.0,0.078,-0.068), blk(0.0,0.078,0.068), blk(0.0,-0.078,0.068),
      blk(0.175,-0.070,-0.062), blk(0.175,0.070,-0.062), blk(0.175,0.070,0.062), blk(0.175,-0.070,0.062),
    ];
    quad(b[0],b[1],b[2],b[3],P.steelDk,0.03);
    quad(b[4],b[7],b[6],b[5],P.steel,0.03);
    quad(b[0],b[4],b[5],b[1],P.steel,0.03);
    quad(b[3],b[2],b[6],b[7],P.steel,0.03);
    quad(b[1],b[5],b[6],b[2],P.steel,0.03);
    quad(b[0],b[3],b[7],b[4],P.steel,0.03);
    const spTip = HC.clone().addScaledVector(u,-0.205);
    const spBase=[ HC.clone().addScaledVector(u,0.0).addScaledVector(w,-0.052),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(w, 0.052),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(AXIS,0.062),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(AXIS,-0.062) ];
    for(let i=0;i<4;i++){ const i2=(i+1)%4; quad(spBase[i],spBase[i2],spTip,spTip,P.steelDk,0.03); }
  }

  /* trunk — the steel cuirass (broad dragonborn frame) */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.170, hex:P.steelDk},
    {y:L.waistY, rx:0.195, rz:0.150, hex:P.steel},
    {y:L.ribY,   rx:0.228, rz:0.170, hex:P.steel},
    {y:L.chestY, rx:0.262, rz:0.182, hex:P.steelLt},
    {y:L.shldY,  rx:0.272, rz:0.176, hex:P.steel},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.005}});
  /* breastplate ridge */
  {
    const rows=[[L.ribY,0.172],[1.00,0.185],[L.chestY,0.184]];
    for(const [y,z] of rows) quad(V(-0.028,y-0.02,z), V(0.028,y-0.02,z), V(0.028,y+0.02,z+0.014), V(-0.028,y+0.02,z+0.014), P.steelLt, 0.03);
  }
  /* faulds */
  stack([
    {y:0.50, rx:0.240, rz:0.190, hex:P.steelDk},
    {y:0.62, rx:0.228, rz:0.180, hex:P.steel},
    {y:L.hipY, rx:0.220, rz:0.170, hex:P.steel},
  ], 8, {});
  /* belt */
  stack([
    {y:0.805, rx:0.202, rz:0.158, hex:P.leather},
    {y:0.860, rx:0.198, rz:0.155, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.04,0.812,0.162), V(0.04,0.812,0.162), V(0.04,0.855,0.158), V(-0.04,0.855,0.158), P.gold, 0.02);

  /* TABARD — oxblood field over the cuirass, gold hem */
  {
    const fp=[[1.06,0.185],[0.87,0.195],[0.66,0.208],[0.46,0.220],[0.32,0.226]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.110,y2,z2), V(0.110,y2,z2), V(0.110,y1,z1), V(-0.110,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const [hy,hz]=fp.at(-1);
    quad(V(-0.110,hy-0.018,hz-0.004), V(0.110,hy-0.018,hz-0.004), V(0.110,hy+0.006,hz+0.002), V(-0.110,hy+0.006,hz+0.002), P.gold, 0.02);
  }

  /* PAULDRONS — big flared steel plates */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.01, 0.015);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.32); return q.add(pivot); };
    stack([
      {y:L.shldY-0.05, rx:0.145, rz:0.150, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.02, rx:0.130, rz:0.135, cx:pivot.x, cz:pivot.z, hex:P.steel},
      {y:L.shldY+0.095,rx:0.095, rz:0.100, cx:pivot.x, cz:pivot.z, hex:P.steelLt},
    ], 8, {xform:tilt, capTop:{hex:P.steelLt, lift:0.03}});
  }

  /* steel gorget at the neck (throat guard) */
  stack([
    {y:L.neckY-0.01, rx:0.115, rz:0.108, hex:P.steelDk},
    {y:L.jawY-0.03,  rx:0.122, rz:0.112, hex:P.steel},
  ], 10, {});

  /* HEAD — inherited dragonborn reptilian skull (muzzle, brow ridge, horn stubs, glow eyes) */
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
    /* MUZZLE — blunt deep dragon snout (post-F1) */
    const muzBase = V(0, L.muzzleY-0.01, 0.118);
    const muzMid  = V(0, L.muzzleY-0.030, 0.186);
    const muzTip  = V(0, L.muzzleY-0.050, 0.238);
    tube(muzBase, muzMid, 0.112, 0.094, n, P.scale, {raz:0.100, rbz:0.086, phase:ph});
    tube(muzMid, muzTip, 0.094, 0.066, n, P.scaleLt, {raz:0.086, rbz:0.060, phase:ph, capB:{hex:P.scaleDk, lift:0.014}});
    quad(V(-0.058,L.muzzleY-0.070,0.128), V(0.058,L.muzzleY-0.070,0.128),
         V(0.036,L.muzzleY-0.086,0.224), V(-0.036,L.muzzleY-0.086,0.224), P.scaleBelly, 0.05);
    /* horn stubs */
    for(const s of [-1,1]){
      const hb = V(s*0.072, L.crownY-0.015, -0.020);
      const ht = V(s*0.098, L.crownY+0.075, -0.115);
      tube(hb, ht, 0.032, 0.012, 6, P.horn, {capB:{hex:P.hornTip, lift:0.008}});
    }
    /* glow eyes */
    for(const s of [-1,1]){
      const ex=s*0.092, ey=L.browY-0.006, ez=0.118;
      quad(V(ex-0.017,ey-0.012,ez), V(ex+0.017,ey-0.012,ez),
           V(ex+0.017,ey+0.014,ez-0.007), V(ex-0.017,ey+0.014,ez-0.007), P.eye, 0.0);
      quad(V(ex-0.007,ey-0.003,ez+0.003), V(ex+0.007,ey-0.003,ez+0.003),
           V(ex+0.007,ey+0.006,ez-0.002), V(ex-0.007,ey+0.006,ez-0.002), P.eyeGlow, 0.0);
    }
  }

  /* RIGHT ARM — steel sleeve to the warhammer grip; fist derived */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const fistNear=GRIP.clone().addScaledVector(AXIS,-0.055);
    const E=S.clone().lerp(fistNear, 0.5).add(V(0.075,0.03,0.06));
    tube(S,E,0.090,0.072,6,P.steel);
    tube(E,fistNear,0.064,0.056,6,P.steel);
    tube(fistNear, GRIP.clone().addScaledVector(AXIS,0.055),
         0.056,0.050,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});
  }

  /* LEFT ARM — raised + bent to the guard-height shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.045);
    const E2=V(-0.280, 0.855, 0.130);
    tube(S2,E2,0.088,0.070,6,P.steel);
    tube(E2,W2,0.062,0.052,6,P.steel);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.048,0.044,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});
  }

  /* legs — steel greaves + sabatons, wide staggered guard stance */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.185,0.40,0.150), ankL=V(-0.205,0.090,0.185);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.215,0.40,-0.120), ankR=V( 0.235,0.090,-0.175);
    tube(hipL,kneeL,0.098,0.072,6,P.steelDk);
    tube(kneeL,ankL,0.066,0.050,6,P.steel);
    tube(hipR,kneeR,0.098,0.072,6,P.steelDk);
    tube(kneeR,ankR,0.066,0.050,6,P.steel);
    for(const k of [kneeL,kneeR]) tube(k.clone().add(V(0,0.015,-0.01)), k.clone().add(V(0,0.015,0.045)), 0.052,0.044,8,P.steelLt,{capB:{hex:P.steelLt,lift:0.01}});
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.070, rz:0.078, cx:ank.x, cz:ank.z, hex:P.steelDk},
        {y:0.09,  rx:0.064, rz:0.066, cx:ank.x, cz:ank.z, hex:P.steel},
      ], 6, {capTop:{hex:P.steel, lift:0.008}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.058,0.044,6,P.steel, {capB:{hex:P.steel, lift:0.015}, raz:0.050, rbz:0.036});
    }
  }

  /* TAIL — thick tapering dragonborn tail, curving down and back off to one side (inherited) */
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
