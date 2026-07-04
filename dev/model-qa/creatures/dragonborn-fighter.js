/* dev/model-qa/creatures/dragonborn-fighter.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the FIGHTER kit (humanoid.js
   signature: a raised arming SWORD authored first so the fist derives true, a steel pauldron on the
   sword shoulder, a tunic-over-scale read). The dragon head stays bare (the muzzle is the read); the
   scale hide + horns + tail carry the race, the raised sword + braced stance carry the class. One
   whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornFighter(){
  const P = {
    tunic:0x556b52, tunicDk:0x415440, linen:0xb8a888, linenDk:0x847053,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a, eye:0x1a1512, eyeGlow:0xd9c25a,
    leather:0x4e3d2a, leatherDk:0x3a2d1f, trouser:0x554a34,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0xb08d46,
    boot:0x3c3226,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* SWORD FIRST — raised beside the head, grip = ground truth (broad dragonborn scale) */
  const GRIP=V(0.375,1.010,0.30), TIP=V(0.535,1.63,0.66);
  const BLADE=new THREE.Vector3().subVectors(TIP,GRIP).normalize();
  const BUTT=GRIP.clone().addScaledVector(BLADE,-0.115);
  {
    tube(BUTT, GRIP.clone().addScaledVector(BLADE,0.045), 0.022, 0.022, 6, P.leatherDk, {capA:{hex:P.brass, lift:0.03}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.05);
    const gx=0.090, gy=0.014, gz=0.020;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.steelDk,0.03);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.steelDk,0.03);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.steel,0.03);
    quad(cnr(-1,-1,-1), cnr(-1,1,-1), cnr(-1,1,1), cnr(-1,-1,1), P.steel,0.03);
    quad(cnr(1,-1,-1), cnr(1,-1,1), cnr(1,1,1), cnr(1,1,-1), P.steel,0.03);
    const bl=(t,w,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.02,0.044,0.011), s2=bl(0.40,0.037,0.009), s3=bl(0.60,0.026,0.007);
    stitch([s1,s2,s3], ()=>P.steel);
    capFan(s3, g0.clone().addScaledVector(BLADE,0.70), P.steel);
  }

  /* trunk — tunic over scale collar (broad dragonborn) */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.170, hex:P.tunicDk},
    {y:L.waistY, rx:0.188, rz:0.145, hex:P.tunic},
    {y:L.ribY,   rx:0.222, rz:0.165, hex:P.tunic},
    {y:L.chestY, rx:0.258, rz:0.185, hex:P.tunic},
    {y:L.shldY,  rx:0.268, rz:0.175, hex:P.tunic},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.005}});

  /* scale-accent bands on the chest (a couple of darker rust ring-segments) */
  {
    const bands=[
      {y:L.ribY+0.02,   rx:0.226, rz:0.168},
      {y:L.chestY-0.03, rx:0.250, rz:0.180},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    for(let b=0;b<rings.length-1;b++){
      for(const i of [0,1,2,3]){
        const i2=(i+1)%8;
        const r0=rings[b], r1=rings[b+1];
        quad(r0[i].clone().add(V(0,0,0.006)), r0[i2].clone().add(V(0,0,0.006)),
             r1[i2].clone().add(V(0,0,0.006)), r1[i].clone().add(V(0,0,0.006)), P.scaleDk, 0.05);
      }
    }
  }

  /* tunic skirt */
  stack([
    {y:0.48, rx:0.245, rz:0.195, hex:P.tunicDk},
    {y:0.62, rx:0.228, rz:0.178, hex:P.tunic},
    {y:0.77, rx:0.205, rz:0.155, hex:P.tunic},
  ], 8, {});

  /* belt + buckle */
  stack([
    {y:0.805, rx:0.196, rz:0.152, hex:P.leather},
    {y:0.860, rx:0.193, rz:0.150, hex:P.leather},
  ], 8, {});
  quad(V(-0.035,0.812,0.160), V(0.035,0.812,0.160), V(0.035,0.855,0.156), V(-0.035,0.855,0.156), P.brass, 0.02);

  /* RIGHT PAULDRON (sword shoulder) */
  {
    const s=1, pivot=V(s*L.shoulderX, L.shldY+0.02, 0.01);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.35); return q.add(pivot); };
    stack([
      {y:L.shldY-0.015, rx:0.122, rz:0.132, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.05,  rx:0.098, rz:0.106, cx:pivot.x, cz:pivot.z, hex:P.steel},
    ], 8, {xform:tilt, capTop:{hex:P.steel, lift:0.03}});
  }

  /* HEAD — inherited dragonborn reptilian skull (muzzle, horns, glow eyes) */
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
    for(const s of [-1,1]){
      const ex=s*0.092, ey=L.browY-0.006, ez=0.118;
      quad(V(ex-0.017,ey-0.012,ez), V(ex+0.017,ey-0.012,ez),
           V(ex+0.017,ey+0.014,ez-0.007), V(ex-0.017,ey+0.014,ez-0.007), P.eye, 0.0);
      quad(V(ex-0.007,ey-0.003,ez+0.003), V(ex+0.007,ey-0.003,ez+0.003),
           V(ex+0.007,ey+0.006,ez-0.002), V(ex-0.007,ey+0.006,ez-0.002), P.eyeGlow, 0.0);
    }
  }

  /* ARMS — right rises to the sword grip; left hangs planted */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.005);
    const W=FIST.clone().add(V(-0.028,0.052,-0.045));
    const E=V(0.395,1.000,0.11);
    tube(S,E,0.092,0.072,6,P.tunic);
    tube(E,W,0.066,0.054,6,P.leather);
    tube(FIST.clone().addScaledVector(BLADE,-0.055), FIST.clone().addScaledVector(BLADE,0.055), 0.058,0.052,6,P.scale, {capA:{hex:P.scale}, capB:{hex:P.scale}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const E2=V(-0.345, 0.885, 0.060);
    const W2=V(-0.315, 0.635, 0.130);
    tube(S2,E2,0.092,0.072,6,P.tunic);
    tube(E2,W2,0.066,0.054,6,P.leather);
    tube(W2, W2.clone().add(V(-0.012,-0.075,0.038)), 0.056,0.044,6,P.scale, {capB:{hex:P.scaleDk}});
  }

  /* LEGS + boots (broad dragonborn) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.165,0.415,0.075), ankL=V(-0.175,0.090,0.045);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.190,0.415,-0.035), ankR=V( 0.205,0.090,-0.085);
    tube(hipL,kneeL,0.098,0.070,6,P.trouser);
    tube(kneeL,ankL,0.064,0.046,6,P.trouser);
    tube(hipR,kneeR,0.098,0.070,6,P.trouser);
    tube(kneeR,ankR,0.064,0.046,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.076, rz:0.084, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.066, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.072, rz:0.074, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.062,0.046,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.052, rbz:0.036});
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
