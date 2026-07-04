/* dev/model-qa/creatures/dwarf-warlock.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED dwarf race (squat-broad race-dwarf proportions + massive beard + eyeless head) wearing the
   WARLOCK kit (warlock.js signature: a GRIMOIRE authored first — a bound tome with fanned pages cradled
   on the raised off forearm — a raised claw/invoking hand, a long layered dark robe, a glowing eye-
   AMULET at the chest). The dwarf supplies no horns; the beard + hood + witch-light are the read.
   One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarfWarlock(){
  const P = {
    robe:0x2c2a34, robeDk:0x201e27, robeLt:0x3a3742,
    under:0x463a2e, underDk:0x332a21,
    skin:0xb98a63, skinDk:0x7f5f42,
    beard:0x8a8078, beardDk:0x605852,
    hood:0x26242e, hoodDk:0x1a1820, eye:0x1a1512,
    page:0xcbbf9e, pageDk:0x9c9077, cover:0x3a2420, coverDk:0x281812,
    gold:0x8d7238, goldDk:0x5f4c25,
    glow:0x8fd6a0, glowDk:0x4f8f66, glowCore:0xd8f2df,
    boot:0x1c1712, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hemY:0.03, kneeY:0.22, hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.235,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* GRIMOIRE FIRST — cradled on the raised LEFT forearm (bound tome, fanned pages up toward camera) */
  const SPINE_A = V(-0.400, 0.560, 0.300), SPINE_B = V(-0.175, 0.590, 0.385);
  const SPINE_DIR = new THREE.Vector3().subVectors(SPINE_B, SPINE_A).normalize();
  const SPINE_LEN = SPINE_A.distanceTo(SPINE_B);
  const BOOK_FWD = V(0.20, 0.30, 0.60).normalize();
  const BOOK_UP = new THREE.Vector3().crossVectors(BOOK_FWD, SPINE_DIR).normalize();
  const SPINE_MID = SPINE_A.clone().lerp(SPINE_B, 0.5);
  const FOREARM_GRIP = SPINE_MID.clone().addScaledVector(BOOK_UP, -0.05).addScaledVector(BOOK_FWD, -0.03);
  {
    const coverT=0.058;
    const cTop = (t)=> SPINE_A.clone().lerp(SPINE_B,t).addScaledVector(BOOK_UP, 0.006);
    const cBot = (t)=> SPINE_A.clone().lerp(SPINE_B,t).addScaledVector(BOOK_UP, -coverT);
    quad(cTop(0), cTop(1), cBot(1), cBot(0), P.coverDk, 0.03);
    const cFwdTop=(t)=>cTop(t).addScaledVector(BOOK_FWD,0.072), cFwdBot=(t)=>cBot(t).addScaledVector(BOOK_FWD,0.072);
    quad(cFwdBot(0), cFwdBot(1), cFwdTop(1), cFwdTop(0), P.cover, 0.04);
    quad(cBot(0), cFwdBot(0), cFwdBot(1), cBot(1), P.coverDk, 0.03);
    const inset=0.012, half=(SPINE_LEN/2-inset)*1.55, pageDepth=SPINE_LEN*0.95;
    const pageQuad=(sign)=>{
      const n0=SPINE_MID.clone().addScaledVector(SPINE_DIR,-half).addScaledVector(BOOK_UP,0.012);
      const n1=SPINE_MID.clone().addScaledVector(SPINE_DIR, half).addScaledVector(BOOK_UP,0.012);
      const outVec=BOOK_FWD.clone().multiplyScalar(pageDepth).addScaledVector(SPINE_DIR, sign*pageDepth*0.44).addScaledVector(BOOK_UP,0.028+pageDepth*0.12);
      const far0=n0.clone().add(outVec), far1=n1.clone().add(outVec);
      quad(n0, n1, far1, far0, P.page, 0.05);
      const d=BOOK_UP.clone().multiplyScalar(0.010);
      quad(n0.clone().sub(d), far0.clone().sub(d), far1.clone().sub(d), n1.clone().sub(d), P.pageDk, 0.04);
      quad(far0, far1, far1.clone().sub(d), far0.clone().sub(d), P.pageDk, 0.03);
    };
    pageQuad(-1); pageQuad(1);
    for(const sign of [-1,1]){
      for(let k=1;k<=3;k++){
        const t=0.20*k;
        const along=BOOK_FWD.clone().multiplyScalar(t*pageDepth).addScaledVector(SPINE_DIR, sign*t*pageDepth*0.50).addScaledVector(BOOK_UP,0.010);
        const a=SPINE_MID.clone().addScaledVector(SPINE_DIR,-half*0.72).add(along);
        const b=SPINE_MID.clone().addScaledVector(SPINE_DIR, half*0.72).add(along);
        quad(a,b,b.clone().addScaledVector(BOOK_UP,0.004),a.clone().addScaledVector(BOOK_UP,0.004),P.pageDk,0.02);
      }
    }
    tube(SPINE_MID.clone().addScaledVector(BOOK_UP,0.008), SPINE_MID.clone().addScaledVector(BOOK_UP,-0.09), 0.008,0.006,4,P.gold,{capB:{hex:P.goldDk}});
  }

  /* TRUNK — under-tunic over the broad dwarf barrel */
  stack([
    {y:L.hipY,   rx:0.228, rz:0.176, hex:P.underDk},
    {y:L.waistY, rx:0.238, rz:0.184, hex:P.under},
    {y:L.ribY,   rx:0.250, rz:0.194, hex:P.under},
    {y:L.chestY, rx:0.256, rz:0.196, hex:P.robeDk},
    {y:L.shldY,  rx:0.258, rz:0.188, hex:P.robeDk},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* LONG LAYERED ROBE — floor-length outer shell (dwarf broad) */
  stack([
    {y:L.hemY, rx:0.290, rz:0.240, hex:P.robeDk},
    {y:0.20,   rx:0.276, rz:0.226, hex:P.robe},
    {y:0.40,   rx:0.260, rz:0.208, hex:P.robe},
    {y:0.56,   rx:0.252, rz:0.196, hex:P.robeLt},
    {y:L.hipY, rx:0.248, rz:0.190, hex:P.robeLt},
  ], 8, {});
  stack([
    {y:L.shldY-0.02, rx:0.262, rz:0.194, hex:P.robeLt},
    {y:0.62,         rx:0.268, rz:0.206, hex:P.robe},
    {y:0.42,         rx:0.272, rz:0.216, hex:P.robeDk},
  ], 8, {});

  /* CHEST MEDALLION — the eye amulet with a witch-light glow */
  {
    const cy=L.chestY-0.03, cz=0.202;
    const ringOuter=ring(V(0,cy,cz), V(0,0,1), 0.058, 0.058, 10);
    const ringInner=ring(V(0,cy,cz+0.014), V(0,0,1), 0.040, 0.040, 10);
    stitch([ringOuter,ringInner], ()=>P.gold);
    capFan(ringOuter, V(0,cy,cz-0.012), P.goldDk, true);
    const eLid=ring(V(0,cy,cz+0.016), V(0,0,1), 0.026, 0.026, 8);
    capFan(eLid, V(0,cy,cz+0.026), P.glow);
    const eCore=ring(V(0,cy,cz+0.027), V(0,0,1), 0.010, 0.010, 6);
    capFan(eCore, V(0,cy,cz+0.033), P.glowCore);
  }

  /* HEAD — inherited dwarf (eyeless) */
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

  /* HOOD — dark, open-face (over the beard) */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.128, rz:0.120, hex:P.hoodDk},
      {y:L.jawY+0.03,   rx:0.156, rz:0.144, hex:P.hood},
      {y:L.browY+0.02,  rx:0.160, rz:0.144, hex:P.hood},
      {y:L.crownY+0.02, rx:0.128, rz:0.118, hex:P.hood},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.018);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.045, -0.03), P.hood);
  }

  /* LEFT ARM — raised, forearm derived under the grimoire spine */
  {
    const S=V(-L.shoulderX, L.shldY-0.02, 0.04);
    const E=V(-0.365, 0.545, 0.190);
    tube(S,E,0.090,0.072,6,P.robe);
    tube(E, FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.03), 0.064,0.050,6,P.robeLt,{capB:{hex:P.skinDk}});
    tube(FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.03), FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,0.03),
         0.050,0.044,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* RIGHT ARM — raised claw/invoking gesture beside the head */
  const CLAW = V(0.420, 0.885, 0.200);
  const CDIR = V(0.35, 0.30, 0.55).normalize();
  {
    const S2=V(L.shoulderX, L.shldY-0.02, 0.04);
    const E2=V(0.385, 0.640, 0.155);
    const W2=CLAW.clone().addScaledVector(CDIR,-0.05);
    tube(S2,E2,0.088,0.070,6,P.robe);
    tube(E2,W2,0.062,0.048,6,P.robeLt,{capB:{hex:P.skinDk}});
    tube(W2, CLAW, 0.050,0.038,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,CDIR).normalize();
    const fv=new THREE.Vector3().crossVectors(CDIR,fu).normalize();
    for(const k of [-2.2,-0.9,0.9,2.2]){
      const base=CLAW.clone().addScaledVector(fu,k*0.020).addScaledVector(CDIR,0.01);
      const knuckle=base.clone().addScaledVector(CDIR,0.038).addScaledVector(fv,0.024).addScaledVector(fu,k*0.010);
      const tip=knuckle.clone().addScaledVector(CDIR,0.008).addScaledVector(fv,0.044).addScaledVector(fu,k*0.015);
      tube(base,knuckle,0.013,0.010,4,P.skin);
      tube(knuckle,tip,0.010,0.006,4,P.skinDk,{capB:{hex:P.skinDk}});
    }
  }

  /* LEGS — boots peeking under the robe hem */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.02), ankL=V(-0.11, 0.085, 0.05);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.02), ankR=V( 0.125, 0.085, 0.02);
    tube(hipL,ankL,0.080,0.060,6,P.underDk);
    tube(hipR,ankR,0.080,0.060,6,P.underDk);
    for(const [ank,toeDir] of [[ankL,V(-0.1,0,1).normalize()], [ankR,V(0.15,0,1).normalize()]]){
      stack([
        {y:0.012, rx:0.074, rz:0.082, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.066, rz:0.068, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.120), 0.060,0.044,6,P.boot, {capB:{hex:P.boot, lift:0.013}, raz:0.052, rbz:0.036});
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
