/* dev/model-qa/creatures/halforc-fighter.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED half-orc race (heavy/broad frame, gray-green skin, heavy jaw + tusk nubs + jutting brow,
   cropped hair) wearing the FIGHTER kit (humanoid.js signature: a raised arming SWORD authored first
   so the fist derives true, a steel pauldron on the sword shoulder, a tunic-over-mail read). The
   half-orc's own broad proportions make it a naturally imposing fighter; the tusks + brow carry the
   race-read. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrcFighter(){
  const P = {
    tunic:0x66744e, tunicDk:0x525e3f, linen:0xcfc4a6, linenDk:0x8d846c,
    skin:0x7a8a6e, skinDk:0x525e48, tusk:0xd8cdae, tuskDk:0xb9ac86,
    mail:0x8d949a, mailDk:0x62686d,
    leather:0x4e3d2a, leatherDk:0x3a2d1f, trouser:0x4a4030,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0xb08d46,
    boot:0x352b1e, bootDk:0x291f15,
    hair:0x2a2420, hairDk:0x1c1815, eye:0x140f0c,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.735, waistY:0.815, ribY:0.930, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* SWORD FIRST — raised beside the head, grip = ground truth (fighter kit, scaled to broad half-orc) */
  const GRIP=V(0.360,1.010,0.30), TIP=V(0.520,1.62,0.66);
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

  /* trunk — mail collar + tunic, half-orc broad */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.180, hex:P.tunicDk},
    {y:L.waistY, rx:0.205, rz:0.160, hex:P.tunic},
    {y:L.ribY,   rx:0.245, rz:0.185, hex:P.tunic},
    {y:L.chestY, rx:0.282, rz:0.205, hex:P.tunic},
    {y:L.shldY,  rx:0.298, rz:0.198, hex:P.tunic},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.mailDk},
  ], 8, {capTop:{hex:P.mailDk, lift:0.006}});

  /* tunic skirt */
  stack([
    {y:0.475, rx:0.290, rz:0.225, hex:P.tunicDk},
    {y:0.610, rx:0.262, rz:0.202, hex:P.tunic},
    {y:0.750, rx:0.235, rz:0.175, hex:P.tunic},
  ], 8, {});

  /* belt + buckle */
  stack([
    {y:0.790, rx:0.212, rz:0.160, hex:P.leather},
    {y:0.850, rx:0.208, rz:0.157, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.03,0.796,0.168), V(0.03,0.796,0.168), V(0.03,0.842,0.164), V(-0.03,0.842,0.164), P.brass, 0.02);

  /* mail sleeve edge at the collar */
  for(const s of [-1,1]){
    quad(V(s*0.09,L.shldY+0.02,0.16), V(s*0.18,L.shldY+0.02,0.11), V(s*0.18,L.shldY-0.05,0.11), V(s*0.09,L.shldY-0.05,0.16), P.mail, 0.05);
  }

  /* HEAD — inherited half-orc skull (heavy jaw, jutting brow, tusks) */
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
      const ex=s*0.056, ey=L.cheekY+0.016, ez=0.150;
      quad(V(ex-0.016,ey-0.011,ez), V(ex+0.016,ey-0.011,ez),
           V(ex+0.016,ey+0.013,ez-0.007), V(ex-0.016,ey+0.013,ez-0.007), P.eye, 0.0);
    }
    for(const s of [-1,1]){
      const bx=s*0.044, by=L.jawY-0.006, bz=0.140;
      const tx=s*0.038, ty=by+0.040, tz=bz+0.032;
      const w=0.020;
      quad(V(bx-w,by-0.008,bz), V(bx+w,by-0.008,bz), V(tx+w*0.3,ty,tz), V(tx-w*0.3,ty,tz), P.tusk, 0.0);
    }
  }

  /* cropped dark hair (inherited) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.010, rx:0.136, rz:0.122, hex:P.hairDk},
      {y:L.crownY+0.004,rx:0.112, rz:0.100, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[1,2,3,4,5,6]});
    capFan(rings[1], V(0, L.headTopY+0.010, -0.004), P.hair);
  }

  /* RIGHT PAULDRON (sword shoulder) */
  {
    const s=1, pivot=V(s*L.shoulderX, L.shldY+0.02, 0.01);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.35); return q.add(pivot); };
    stack([
      {y:L.shldY-0.015, rx:0.125, rz:0.135, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.05,  rx:0.100, rz:0.108, cx:pivot.x, cz:pivot.z, hex:P.steel},
    ], 8, {xform:tilt, capTop:{hex:P.steel, lift:0.03}});
  }

  /* ARMS — right rises to the sword grip; left hangs planted */
  {
    const S=V(L.shoulderX, L.shldY-0.012, 0.018);
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.005);
    const W=FIST.clone().add(V(-0.028,0.052,-0.045));
    const E=V(0.380,1.000,0.11);
    tube(S,E,0.098,0.076,6,P.tunic);
    tube(E,W,0.072,0.058,6,P.leather);
    tube(FIST.clone().addScaledVector(BLADE,-0.055), FIST.clone().addScaledVector(BLADE,0.055), 0.060,0.054,6,P.skin, {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.012, 0.018);
    const E2=V(-0.372,0.860,0.070);
    const W2=V(-0.330,0.655,0.170);
    tube(S2,E2,0.098,0.076,6,P.tunic);
    tube(E2,W2,0.072,0.058,6,P.skin, {capB:{hex:P.skinDk}});
  }

  /* legs — braced stance, boots (half-orc broad) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.012, 0.012), kneeL=V(-0.165,0.395,0.080), ankL=V(-0.175,0.085,0.048);
    const hipR=V( L.hipHalf, L.hipY-0.012, 0.005), kneeR=V( 0.190,0.395,-0.038), ankR=V( 0.205,0.085,-0.090);
    tube(hipL,kneeL,0.100,0.074,6,P.trouser);
    tube(kneeL,ankL,0.070,0.050,6,P.trouser);
    tube(hipR,kneeR,0.100,0.074,6,P.trouser);
    tube(kneeR,ankR,0.070,0.050,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.078, rz:0.086, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.068, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.074, rz:0.074, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.062,0.048,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.054, rbz:0.038});
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
