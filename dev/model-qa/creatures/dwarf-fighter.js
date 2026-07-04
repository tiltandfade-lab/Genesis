/* dev/model-qa/creatures/dwarf-fighter.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED dwarf race (race-dwarf.js proportions: squat-Medium ~1.04u head-top, broad barrel
   trunk, massive beard-wedge, domed helm, planted immovable stance) wearing the FIGHTER kit
   (humanoid.js signature: a raised arming sword authored FIRST so the fist derives true, a steel
   pauldron over the sword shoulder, a tunic-over-mail read). One whole-object function, no anchors:
   every vertex lands straight in the merged frame. The dwarf head/beard/helm are inherited verbatim
   from the post-F1 race-dwarf; only the body dress + a held sword + the braced fighter stance change. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarfFighter(){
  const P = {
    tunic:0x5a6b46, tunicDk:0x45543a, linen:0xc9bd9c, linenDk:0x8d846c,
    skin:0xb98a63, skinDk:0x7f5f42,
    trouser:0x4a4436, boot:0x2f271c, leather:0x4e3d2a, leatherDk:0x3a2d1f,
    beard:0x9a9086, beardDk:0x6d655c,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0xb08d46,
    helm:0x7d818a, helmDk:0x565a61,
    mail:0x8d949a, mailDk:0x62686d,
    eye:0x1a1512, disc:0x4a4038, discTop:0x585047,
  };

  /* dwarf landmarks (short ~1.04u but BROAD — from race-dwarf.js) */
  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.235,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* SWORD FIRST — raised beside the head, grip = ground truth (fighter kit).
     Scaled/placed for the short dwarf: grip near shoulder height, blade up-and-out. */
  const GRIP=V(0.315,0.60,0.24), TIP=V(0.470,1.02,0.52);
  const BLADE=new THREE.Vector3().subVectors(TIP,GRIP).normalize();
  const BUTT=GRIP.clone().addScaledVector(BLADE,-0.10);
  {
    tube(BUTT, GRIP.clone().addScaledVector(BLADE,0.04), 0.020, 0.020, 6, P.leatherDk, {capA:{hex:P.brass, lift:0.028}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.044);
    const gx=0.078, gy=0.013, gz=0.018;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.steelDk,0.03);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.steelDk,0.03);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.steel,0.03);
    quad(cnr(-1,-1,-1), cnr(-1,1,-1), cnr(-1,1,1), cnr(-1,-1,1), P.steel,0.03);
    quad(cnr(1,-1,-1), cnr(1,-1,1), cnr(1,1,1), cnr(1,1,-1), P.steel,0.03);
    const bl=(t,w,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.02,0.040,0.010), s2=bl(0.30,0.034,0.008), s3=bl(0.46,0.022,0.006);
    stitch([s1,s2,s3], ()=>P.steel);
    capFan(s3, g0.clone().addScaledVector(BLADE,0.54), P.steel);
  }

  /* trunk — broad barrel; mail collar + tunic (fighter cloth-over-mail). Dwarf-broad radii. */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.175, hex:P.trouser},
    {y:L.waistY, rx:0.235, rz:0.185, hex:P.tunic},
    {y:L.ribY,   rx:0.250, rz:0.195, hex:P.tunic},
    {y:L.chestY, rx:0.258, rz:0.200, hex:P.tunic},
    {y:L.shldY,  rx:0.260, rz:0.190, hex:P.tunic},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.mailDk},
  ], 8, {capTop:{hex:P.mailDk, lift:0.005}});

  /* tunic skirt over the hips (short, broad) */
  stack([
    {y:0.30, rx:0.250, rz:0.200, hex:P.tunicDk},
    {y:0.40, rx:0.235, rz:0.185, hex:P.tunic},
  ], 8, {});

  /* wide belt + buckle */
  stack([
    {y:L.waistY-0.03, rx:0.245, rz:0.192, hex:P.leather},
    {y:L.waistY+0.02, rx:0.243, rz:0.190, hex:P.leather},
  ], 8, {});
  quad(V(-0.038,L.waistY-0.026,0.198), V(0.038,L.waistY-0.026,0.198), V(0.038,L.waistY+0.024,0.194), V(-0.038,L.waistY+0.024,0.194), P.brass, 0.02);

  /* mail sleeve edge peeking at the collar (a couple of dark scallop quads) */
  for(const s of [-1,1]){
    quad(V(s*0.06,L.shldY+0.02,0.15), V(s*0.14,L.shldY+0.02,0.11), V(s*0.14,L.shldY-0.04,0.11), V(s*0.06,L.shldY-0.04,0.15), P.mail, 0.05);
  }

  /* HEAD — inherited from post-F1 race-dwarf (beard-wedge + domed helm + eye standard). */
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
    for(const s of [-1,1]){
      const ex=s*0.062, ey=(L.cheekY+L.browY)/2-0.002, ez=0.148;
      quad(V(ex-0.015,ey-0.011,ez), V(ex+0.015,ey-0.011,ez),
           V(ex+0.015,ey+0.013,ez-0.007), V(ex-0.015,ey+0.013,ez-0.007), P.eye, 0.0);
    }
  }

  /* MASSIVE BEARD wedge (jaw -> belt), inherited from race-dwarf */
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

  /* DOMED HELM (inherited) */
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
  }

  /* RIGHT PAULDRON (sword shoulder) — steel dome tilted out */
  {
    const s=1, pivot=V(s*L.shoulderX, L.shldY+0.02, 0.01);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.35); return q.add(pivot); };
    stack([
      {y:L.shldY-0.015, rx:0.115, rz:0.125, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.05,  rx:0.092, rz:0.100, cx:pivot.x, cz:pivot.z, hex:P.steel},
    ], 8, {xform:tilt, capTop:{hex:P.steel, lift:0.03}});
  }

  /* ARMS — right rises to the sword grip (fist derived); left hangs planted at the side. */
  {
    /* right (sword) arm */
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.005);
    const W=FIST.clone().add(V(-0.028,0.050,-0.045));
    const E=V(0.335,0.545,0.11);
    tube(S,E,0.096,0.078,6,P.tunic);
    tube(E,W,0.072,0.056,6,P.leather);
    tube(FIST.clone().addScaledVector(BLADE,-0.05), FIST.clone().addScaledVector(BLADE,0.05), 0.058,0.052,6,P.skin, {capA:{hex:P.skin}, capB:{hex:P.skin}});

    /* left arm — planted, hand near the thigh */
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.285, 0.535, 0.09);
    const W2=V(-0.250, 0.38, 0.145);
    tube(S2,E2,0.096,0.078,6,P.tunic);
    tube(E2,W2,0.076,0.060,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* LEGS — short, thick, wide-braced (inherited from race-dwarf) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), ankL=V(-0.175,0.085,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), ankR=V( 0.185,0.085,-0.02);
    tube(hipL,ankL,0.098,0.072,6,P.trouser);
    tube(hipR,ankR,0.098,0.072,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.30,0,0.95).normalize()]]){
      stack([
        {y:0.012, rx:0.082, rz:0.090, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.074, rz:0.076, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.155, rx:0.080, rz:0.080, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.068,0.050,6,P.boot, {capB:{hex:P.boot, lift:0.016}, raz:0.058, rbz:0.040});
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
