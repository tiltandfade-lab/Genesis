/* dev/model-qa/creatures/gnome-fighter.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED gnome race (post-F1 race-gnome: ~0.95u, head LARGER-than-human but reined in, big wedge
   EARS, eyeless, stubby limbs) wearing the FIGHTER kit (humanoid.js signature: a raised arming SWORD
   authored FIRST so the fist derives true, a steel pauldron over the sword shoulder, a tunic-over-mail
   read). A gnome fighter must read as ITS RACE at board distance — big head + big ears + tiny frame,
   not a short human — so the ears + oversized head are inherited verbatim. One whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnomeFighter(){
  const P = {
    tunic:0x5a6b46, tunicDk:0x45543a, linen:0xc9bd9c, linenDk:0x8d846c,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    trouser:0x4a4436, boot:0x2f271c, leather:0x4e3d2a, leatherDk:0x3a2d1f,
    hair:0x6d4b2c, hairDk:0x4a331d,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0xb08d46,
    helm:0x7d818a, helmDk:0x565a61, mail:0x8d949a, mailDk:0x62686d,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.335, waistY:0.375, ribY:0.435, chestY:0.465, shldY:0.485, neckY:0.515,
    hipHalf:0.115, shoulderX:0.150,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* SWORD FIRST — raised beside the head, grip = ground truth (fighter kit, scaled small) */
  const GRIP=V(0.205,0.44,0.20), TIP=V(0.320,0.80,0.42);
  const BLADE=new THREE.Vector3().subVectors(TIP,GRIP).normalize();
  const BUTT=GRIP.clone().addScaledVector(BLADE,-0.08);
  {
    tube(BUTT, GRIP.clone().addScaledVector(BLADE,0.03), 0.016, 0.016, 6, P.leatherDk, {capA:{hex:P.brass, lift:0.022}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.036);
    const gx=0.058, gy=0.010, gz=0.014;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.steelDk,0.03);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.steelDk,0.03);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.steel,0.03);
    const bl=(t,w,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.02,0.030,0.008), s2=bl(0.22,0.026,0.006), s3=bl(0.34,0.016,0.005);
    stitch([s1,s2,s3], ()=>P.steel);
    capFan(s3, g0.clone().addScaledVector(BLADE,0.40), P.steel);
  }

  /* trunk — mail collar + tunic (fighter cloth-over-mail), gnome stubby pot-belly */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.128, hex:P.trouser},
    {y:L.waistY, rx:0.175, rz:0.150, hex:P.tunic},   /* belly */
    {y:L.ribY,   rx:0.160, rz:0.134, hex:P.tunic},
    {y:L.chestY, rx:0.152, rz:0.126, hex:P.tunic},
    {y:L.shldY,  rx:0.150, rz:0.122, hex:P.tunic},
    {y:L.neckY,  rx:0.070, rz:0.066, hex:P.mailDk},
  ], 8, {capTop:{hex:P.mailDk, lift:0.004}});
  /* tunic skirt */
  stack([
    {y:0.24, rx:0.190, rz:0.160, hex:P.tunicDk},
    {y:0.32, rx:0.170, rz:0.140, hex:P.tunic},
  ], 8, {});
  /* belt + buckle */
  stack([
    {y:L.waistY-0.02, rx:0.178, rz:0.152, hex:P.leather},
    {y:L.waistY+0.012, rx:0.176, rz:0.150, hex:P.leather},
  ], 8, {});
  quad(V(-0.020,L.waistY-0.010,0.156), V(0.020,L.waistY-0.010,0.156), V(0.020,L.waistY+0.016,0.152), V(-0.020,L.waistY+0.016,0.152), P.brass, 0.02);
  /* mail sleeve peek */
  for(const s of [-1,1]){
    quad(V(s*0.04,L.shldY+0.01,0.11), V(s*0.10,L.shldY+0.01,0.08), V(s*0.10,L.shldY-0.03,0.08), V(s*0.04,L.shldY-0.03,0.11), P.mail, 0.05);
  }

  /* HEAD — inherited post-F1 gnome (big-head ratio, ears, eyeless) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.106, hex:P.skin},
      {y:L.cheekY, rx:0.134, rz:0.128, hex:P.skin},
      {y:L.browY,  rx:0.138, rz:0.126, hex:P.skin},
      {y:L.crownY, rx:0.106, rz:0.097, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.026;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
    for(const s of [-1,1]){
      const eb=V(s*0.128, L.cheekY+0.008, 0.016);
      const et=eb.clone().add(V(s*0.078, 0.032, -0.010));
      tube(eb, et, 0.024, 0.009, 5, P.ear, {capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.004}});
    }
  }

  /* DOMED KETTLE HELM (fighter), gnome-scaled, over the big head */
  {
    const n=8, ph=Math.PI/n;
    const rimLo=ring(V(0,L.browY+0.010,0.0), V(0,1,0), 0.146, 0.134, n, ph);
    const rimHi=ring(V(0,L.browY+0.035,0.0), V(0,1,0), 0.144, 0.132, n, ph);
    stitch([rimLo,rimHi], ()=>P.helmDk);
    const dome=[
      {y:L.browY+0.045, rx:0.142, rz:0.130},
      {y:L.crownY+0.01, rx:0.126, rz:0.114},
      {y:L.headTopY+0.02, rx:0.078, rz:0.070},
    ].map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(dome, ()=>P.helm);
    stitch([rimHi,dome[0]], ()=>P.helm);
    capFan(dome.at(-1), V(0, L.headTopY+0.075, 0.0), P.helmDk);
  }

  /* RIGHT PAULDRON (sword shoulder) */
  {
    const s=1, pivot=V(s*L.shoulderX, L.shldY+0.01, 0.01);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.35); return q.add(pivot); };
    stack([
      {y:L.shldY-0.01, rx:0.078, rz:0.084, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.04, rx:0.062, rz:0.066, cx:pivot.x, cz:pivot.z, hex:P.steel},
    ], 8, {xform:tilt, capTop:{hex:P.steel, lift:0.03}});
  }

  /* ARMS — right rises to the sword grip (fist derived); left hangs at the side. */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.005);
    const W=FIST.clone().add(V(-0.02,0.03,-0.03));
    const E=V(0.215,0.395,0.09);
    tube(S,E,0.058,0.046,6,P.tunic);
    tube(E,W,0.044,0.034,6,P.leather);
    tube(FIST.clone().addScaledVector(BLADE,-0.035), FIST.clone().addScaledVector(BLADE,0.035), 0.036,0.032,6,P.skin, {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.180, 0.375, 0.08);
    const W2=V(-0.160, 0.26, 0.11);
    tube(S2,E2,0.058,0.046,6,P.tunic);
    tube(E2,W2,0.046,0.036,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — short, stubby, braced */
  {
    const hipL=V(-0.100, L.hipY-0.01, 0.01), ankL=V(-0.130,0.075,0.02);
    const hipR=V( 0.100, L.hipY-0.01, 0.00), ankR=V( 0.140,0.075,-0.02);
    tube(hipL,ankL,0.062,0.046,6,P.trouser);
    tube(hipR,ankR,0.062,0.046,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(-0.05,0,1)], [ankR,V(0.30,0,0.95).normalize()]]){
      stack([
        {y:0.010, rx:0.058, rz:0.066, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.08,  rx:0.052, rz:0.054, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.13,  rx:0.056, rz:0.056, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.108), 0.048,0.034,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.040, rbz:0.028});
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
