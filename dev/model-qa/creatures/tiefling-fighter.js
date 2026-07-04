/* dev/model-qa/creatures/tiefling-fighter.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED tiefling race (slim ~1.45u frame, dusky red-mauve skin, backswept HORNS off the temples,
   a sharp GOATEE, a thin spade-tipped TAIL) wearing the FIGHTER kit (humanoid.js signature: a raised
   arming SWORD authored first so the fist derives true, a steel pauldron on the sword shoulder, a
   tunic-over-mail read, a braced stance). The horns + goatee + tail carry the race; the raised blade
   carries the class. EYELESS. One whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTieflingFighter(){
  const P = {
    tunic:0x3c3440, tunicDk:0x2b2530, tunicLt:0x4a4050,
    mail:0x8d949a, mailDk:0x62686d,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a, hair:0x2a2320,
    leather:0x4e3d2a, leatherDk:0x362a1c, trouser:0x342c22,
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xbcc2c6, brass:0x9c7d3e,
    boot:0x2a221c, bootDk:0x1d1712,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.215,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* SWORD FIRST — raised beside the head, grip = ground truth (slim tiefling) */
  const GRIP=V(0.315,0.945,0.28), TIP=V(0.455,1.51,0.60);
  const BLADE=new THREE.Vector3().subVectors(TIP,GRIP).normalize();
  const BUTT=GRIP.clone().addScaledVector(BLADE,-0.10);
  {
    tube(BUTT, GRIP.clone().addScaledVector(BLADE,0.045), 0.019, 0.019, 6, P.leatherDk, {capA:{hex:P.brass, lift:0.03}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.05);
    const gx=0.078, gy=0.012, gz=0.018;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.steelDk,0.03);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.steelDk,0.03);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.steel,0.03);
    quad(cnr(-1,-1,-1), cnr(-1,1,-1), cnr(-1,1,1), cnr(-1,-1,1), P.steel,0.03);
    quad(cnr(1,-1,-1), cnr(1,-1,1), cnr(1,1,1), cnr(1,1,-1), P.steel,0.03);
    const bl=(t,w,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.02,0.038,0.010), s2=bl(0.36,0.032,0.008), s3=bl(0.54,0.022,0.006);
    stitch([s1,s2,s3], ()=>P.steel);
    capFan(s3, g0.clone().addScaledVector(BLADE,0.62), P.steel);
  }

  /* trunk — tunic over mail collar (slim tiefling) */
  stack([
    {y:L.hipY,   rx:0.172, rz:0.128, hex:P.tunicDk},
    {y:L.waistY, rx:0.145, rz:0.110, hex:P.tunic},
    {y:L.ribY,   rx:0.170, rz:0.126, hex:P.tunic},
    {y:L.chestY, rx:0.194, rz:0.138, hex:P.tunicLt},
    {y:L.shldY,  rx:0.198, rz:0.130, hex:P.tunic},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.mailDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* tunic skirt + belt */
  stack([
    {y:0.485, rx:0.205, rz:0.165, hex:P.tunicDk},
    {y:0.58,  rx:0.192, rz:0.150, hex:P.tunic},
    {y:L.hipY,rx:0.176, rz:0.132, hex:P.tunic},
  ], 8, {});
  stack([
    {y:0.735, rx:0.150, rz:0.114, hex:P.leather},
    {y:0.775, rx:0.148, rz:0.112, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.026,0.740,0.122), V(0.026,0.740,0.122), V(0.026,0.772,0.118), V(-0.026,0.772,0.118), P.brass, 0.02);

  /* RIGHT PAULDRON (sword shoulder) */
  {
    const s=1, pivot=V(s*L.shoulderX, L.shldY+0.02, 0.01);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.35); return q.add(pivot); };
    stack([
      {y:L.shldY-0.015, rx:0.100, rz:0.108, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.05,  rx:0.080, rz:0.086, cx:pivot.x, cz:pivot.z, hex:P.steel},
    ], 8, {xform:tilt, capTop:{hex:P.steel, lift:0.03}});
  }

  /* HEAD — inherited tiefling skull (nose push, hair cap). EYELESS. */
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
  /* HORNS — backswept off the temples */
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

  /* ARMS — right rises to the sword grip; left hangs planted (slim tiefling) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.005);
    const W=FIST.clone().add(V(-0.024,0.048,-0.040));
    const E=V(0.330,0.930,0.10);
    tube(S,E,0.062,0.050,6,P.tunic);
    tube(E,W,0.046,0.038,6,P.leather);
    tube(FIST.clone().addScaledVector(BLADE,-0.050), FIST.clone().addScaledVector(BLADE,0.050), 0.040,0.036,6,P.skin, {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.012), E2=V(-0.268,0.815,0.045), W2=V(-0.232,0.610,0.085);
    tube(S2,E2,0.062,0.050,6,P.tunic);
    tube(E2,W2,0.046,0.038,6,P.tunicDk);
    tube(W2, W2.clone().add(V(-0.008,-0.075,0.020)), 0.038,0.030,6,P.skin, {capB:{hex:P.skinDk}});
  }

  /* legs — clean braced stance, boots (slim tiefling) */
  {
    const ankL=V(-0.128,0.085,0.020), ankR=V(0.128,0.085,-0.012);
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.008), kneeL=V(-0.118,0.40,0.032);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00),  kneeR=V( 0.122,0.40,-0.020);
    tube(hipL,kneeL,0.068,0.050,6,P.trouser);
    tube(kneeL,ankL,0.046,0.034,6,P.trouser);
    tube(hipR,kneeR,0.068,0.050,6,P.trouser);
    tube(kneeR,ankR,0.046,0.034,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.056, rz:0.062, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.095, rx:0.050, rz:0.052, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.150, rx:0.055, rz:0.055, cx:ank.x, cz:ank.z, hex:P.bootDk},
      ], 6, {capTop:{hex:P.bootDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.048,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.118), 0.046,0.034,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.040, rbz:0.028});
    }
  }

  /* TAIL — thin spade-tipped tail from the hip (inherited) */
  {
    const root = V(0.030, L.hipY-0.045, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.tunicDk);
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
