/* dev/model-qa/creatures/halfling-fighter.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet — the icon) wearing the
   FIGHTER kit (humanoid.js signature: a raised arming SWORD authored FIRST so the fist derives true, a
   steel pauldron over the sword shoulder, a tunic-over-mail read). The halfling keeps its curly hair
   (no helm — the curls are the crown read) and its bare oversized feet. One whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalflingFighter(){
  const P = {
    tunic:0x5a6b46, tunicDk:0x45543a, linen:0xc9bd9c, linenDk:0x8d846c,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a, eye:0x1a1512,
    trouser:0x4a4436, leather:0x4e3d2a, leatherDk:0x3a2d1f,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0xb08d46,
    mail:0x8d949a, mailDk:0x62686d,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.375, waistY:0.42, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* SWORD FIRST — raised beside the head, grip = ground truth (fighter kit, halfling-scaled) */
  const GRIP=V(0.205,0.51,0.22), TIP=V(0.325,0.93,0.44);
  const BLADE=new THREE.Vector3().subVectors(TIP,GRIP).normalize();
  const BUTT=GRIP.clone().addScaledVector(BLADE,-0.075);
  {
    tube(BUTT, GRIP.clone().addScaledVector(BLADE,0.03), 0.014, 0.014, 6, P.leatherDk, {capA:{hex:P.brass, lift:0.020}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.032);
    const gx=0.052, gy=0.009, gz=0.012;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.steelDk,0.03);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.steelDk,0.03);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.steel,0.03);
    const bl=(t,w,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.02,0.026,0.007), s2=bl(0.24,0.022,0.006), s3=bl(0.38,0.014,0.004);
    stitch([s1,s2,s3], ()=>P.steel);
    capFan(s3, g0.clone().addScaledVector(BLADE,0.46), P.steel);
  }

  /* trunk — mail collar + tunic (halfling slim) */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.096, hex:P.trouser},
    {y:L.waistY, rx:0.114, rz:0.090, hex:P.tunic},
    {y:L.ribY,   rx:0.124, rz:0.098, hex:P.tunic},
    {y:L.chestY, rx:0.132, rz:0.100, hex:P.tunic},
    {y:L.shldY,  rx:0.134, rz:0.096, hex:P.tunic},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.mailDk},
  ], 8, {capTop:{hex:P.mailDk, lift:0.004}});
  /* tunic skirt */
  stack([
    {y:0.30, rx:0.152, rz:0.124, hex:P.tunicDk},
    {y:0.37, rx:0.132, rz:0.104, hex:P.tunic},
  ], 8, {});
  /* belt + buckle */
  stack([
    {y:L.waistY-0.015, rx:0.116, rz:0.092, hex:P.leather},
    {y:L.waistY+0.012, rx:0.114, rz:0.090, hex:P.leather},
  ], 8, {});
  quad(V(-0.014,L.waistY-0.010,0.096), V(0.014,L.waistY-0.010,0.096), V(0.014,L.waistY+0.014,0.093), V(-0.014,L.waistY+0.014,0.093), P.brass, 0.02);
  /* mail sleeve peek */
  for(const s of [-1,1]){
    quad(V(s*0.03,L.shldY+0.01,0.09), V(s*0.08,L.shldY+0.01,0.06), V(s*0.08,L.shldY-0.03,0.06), V(s*0.03,L.shldY-0.03,0.09), P.mail, 0.05);
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

  /* CURLY HAIR CAP (inherited icon) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.045, rx:0.104, rz:0.096, hex:P.hairDk},
      {y:L.crownY-0.005,rx:0.114, rz:0.104, hex:P.hair},
      {y:L.crownY+0.045,rx:0.098, rz:0.088, hex:P.hair},
      {y:L.headTopY+0.010, rx:0.060, rz:0.053, hex:P.hairDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,-0.004), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY+0.045, -0.004), P.hairDk);
    for(const a of [0.3,1.1,2.0,2.9,3.7,4.6,5.4]){
      const cx=Math.cos(a)*0.100, cz=Math.sin(a)*0.094-0.004, cy=L.crownY+Math.sin(a*3)*0.018;
      const base=V(cx,cy,cz), out=base.clone().addScaledVector(V(cx,0.01,cz).normalize(),0.014);
      tube(base, out, 0.016, 0.014, 4, P.hair, {capB:{hex:P.hair, lift:0.003}});
    }
  }

  /* RIGHT PAULDRON (sword shoulder) */
  {
    const s=1, pivot=V(s*L.shoulderX, L.shldY+0.01, 0.01);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.35); return q.add(pivot); };
    stack([
      {y:L.shldY-0.01, rx:0.068, rz:0.074, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.035, rx:0.054, rz:0.058, cx:pivot.x, cz:pivot.z, hex:P.steel},
    ], 8, {xform:tilt, capTop:{hex:P.steel, lift:0.03}});
  }

  /* ARMS — right rises to the sword grip (fist derived); left hangs at the side. */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.005);
    const W=FIST.clone().add(V(-0.02,0.03,-0.03));
    const E=V(0.195,0.475,0.10);
    tube(S,E,0.048,0.038,6,P.tunic);
    tube(E,W,0.036,0.028,6,P.leather);
    tube(FIST.clone().addScaledVector(BLADE,-0.03), FIST.clone().addScaledVector(BLADE,0.03), 0.030,0.026,6,P.skin, {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.160, 0.455, 0.07);
    const W2=V(-0.145, 0.33, 0.10);
    tube(S2,E2,0.048,0.038,6,P.tunic);
    tube(E2,W2,0.038,0.028,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — slim, braced, BARE oversized feet (inherited icon) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.008, 0.008), shinL=V(-0.088,0.185,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.008, 0.006), shinR=V( 0.100,0.185,-0.02);
    tube(hipL,shinL,0.056,0.040,6,P.trouser);
    tube(hipR,shinR,0.056,0.040,6,P.trouser);
    for(const shin of [shinL,shinR]){
      stack([{y:0.16, rx:0.044, rz:0.038, cx:shin.x, cz:shin.z, hex:P.trouserDk}],6,{capTop:{hex:P.trouserDk,lift:0.003}});
    }
    for(const [shin,toeDir] of [[shinL,V(-0.06,0,1)], [shinR,V(0.35,0,0.94).normalize()]]){
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
