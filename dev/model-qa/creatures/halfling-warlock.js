/* dev/model-qa/creatures/halfling-warlock.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet — the icon) wearing the
   WARLOCK kit (warlock.js signature: a GRIMOIRE authored first — a bound tome with fanned pages cradled
   on the raised off forearm — a raised claw/invoking hand, a long layered dark robe, a glowing eye-
   AMULET at the chest). The bare oversized feet peek from the robe hem (the halfling read). One
   whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalflingWarlock(){
  const P = {
    robe:0x2c2a34, robeDk:0x201e27, robeLt:0x3a3742,
    under:0x463a2e, underDk:0x332a21,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a, eye:0x1a1512,
    hood:0x26242e, hoodDk:0x1a1820,
    page:0xcbbf9e, pageDk:0x9c9077, cover:0x3a2420, coverDk:0x281812,
    gold:0x8d7238, goldDk:0x5f4c25,
    glow:0x8fd6a0, glowDk:0x4f8f66, glowCore:0xd8f2df,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hemY:0.03, kneeY:0.20, hipY:0.375, waistY:0.42, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* GRIMOIRE FIRST — cradled on the raised LEFT forearm (bound tome, fanned pages up) */
  const SPINE_A = V(-0.285, 0.530, 0.235), SPINE_B = V(-0.120, 0.555, 0.300);
  const SPINE_DIR = new THREE.Vector3().subVectors(SPINE_B, SPINE_A).normalize();
  const SPINE_LEN = SPINE_A.distanceTo(SPINE_B);
  const BOOK_FWD = V(0.20, 0.30, 0.60).normalize();
  const BOOK_UP = new THREE.Vector3().crossVectors(BOOK_FWD, SPINE_DIR).normalize();
  const SPINE_MID = SPINE_A.clone().lerp(SPINE_B, 0.5);
  const FOREARM_GRIP = SPINE_MID.clone().addScaledVector(BOOK_UP, -0.04).addScaledVector(BOOK_FWD, -0.025);
  {
    const coverT=0.046;
    const cTop = (t)=> SPINE_A.clone().lerp(SPINE_B,t).addScaledVector(BOOK_UP, 0.005);
    const cBot = (t)=> SPINE_A.clone().lerp(SPINE_B,t).addScaledVector(BOOK_UP, -coverT);
    quad(cTop(0), cTop(1), cBot(1), cBot(0), P.coverDk, 0.03);
    const cFwdTop=(t)=>cTop(t).addScaledVector(BOOK_FWD,0.056), cFwdBot=(t)=>cBot(t).addScaledVector(BOOK_FWD,0.056);
    quad(cFwdBot(0), cFwdBot(1), cFwdTop(1), cFwdTop(0), P.cover, 0.04);
    quad(cBot(0), cFwdBot(0), cFwdBot(1), cBot(1), P.coverDk, 0.03);
    const inset=0.010, half=(SPINE_LEN/2-inset)*1.55, pageDepth=SPINE_LEN*0.95;
    const pageQuad=(sign)=>{
      const n0=SPINE_MID.clone().addScaledVector(SPINE_DIR,-half).addScaledVector(BOOK_UP,0.010);
      const n1=SPINE_MID.clone().addScaledVector(SPINE_DIR, half).addScaledVector(BOOK_UP,0.010);
      const outVec=BOOK_FWD.clone().multiplyScalar(pageDepth).addScaledVector(SPINE_DIR, sign*pageDepth*0.44).addScaledVector(BOOK_UP,0.022+pageDepth*0.12);
      const far0=n0.clone().add(outVec), far1=n1.clone().add(outVec);
      quad(n0, n1, far1, far0, P.page, 0.05);
      const d=BOOK_UP.clone().multiplyScalar(0.008);
      quad(n0.clone().sub(d), far0.clone().sub(d), far1.clone().sub(d), n1.clone().sub(d), P.pageDk, 0.04);
      quad(far0, far1, far1.clone().sub(d), far0.clone().sub(d), P.pageDk, 0.03);
    };
    pageQuad(-1); pageQuad(1);
    for(const sign of [-1,1]){
      for(let k=1;k<=3;k++){
        const t=0.20*k;
        const along=BOOK_FWD.clone().multiplyScalar(t*pageDepth).addScaledVector(SPINE_DIR, sign*t*pageDepth*0.50).addScaledVector(BOOK_UP,0.008);
        const a=SPINE_MID.clone().addScaledVector(SPINE_DIR,-half*0.72).add(along);
        const b=SPINE_MID.clone().addScaledVector(SPINE_DIR, half*0.72).add(along);
        quad(a,b,b.clone().addScaledVector(BOOK_UP,0.003),a.clone().addScaledVector(BOOK_UP,0.003),P.pageDk,0.02);
      }
    }
    tube(SPINE_MID.clone().addScaledVector(BOOK_UP,0.006), SPINE_MID.clone().addScaledVector(BOOK_UP,-0.07), 0.006,0.005,4,P.gold,{capB:{hex:P.goldDk}});
  }

  /* TRUNK — under-tunic (halfling slim) */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.096, hex:P.underDk},
    {y:L.waistY, rx:0.114, rz:0.090, hex:P.under},
    {y:L.ribY,   rx:0.126, rz:0.100, hex:P.under},
    {y:L.chestY, rx:0.134, rz:0.102, hex:P.robeDk},
    {y:L.shldY,  rx:0.136, rz:0.098, hex:P.robeDk},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* LONG LAYERED ROBE — floor-length outer shell */
  stack([
    {y:L.hemY, rx:0.140, rz:0.116, hex:P.robeDk},
    {y:0.16,   rx:0.132, rz:0.108, hex:P.robe},
    {y:0.30,   rx:0.126, rz:0.102, hex:P.robe},
    {y:L.hipY, rx:0.122, rz:0.098, hex:P.robeLt},
  ], 8, {});
  stack([
    {y:L.shldY-0.02, rx:0.134, rz:0.100, hex:P.robeLt},
    {y:0.44,         rx:0.128, rz:0.102, hex:P.robe},
    {y:0.30,         rx:0.132, rz:0.106, hex:P.robeDk},
  ], 8, {});

  /* CHEST MEDALLION — the eye amulet with a witch-light glow */
  {
    const cy=L.chestY-0.02, cz=0.104;
    const ringOuter=ring(V(0,cy,cz), V(0,0,1), 0.038, 0.038, 10);
    const ringInner=ring(V(0,cy,cz+0.010), V(0,0,1), 0.026, 0.026, 10);
    stitch([ringOuter,ringInner], ()=>P.gold);
    capFan(ringOuter, V(0,cy,cz-0.010), P.goldDk, true);
    const eLid=ring(V(0,cy,cz+0.012), V(0,0,1), 0.017, 0.017, 8);
    capFan(eLid, V(0,cy,cz+0.020), P.glow);
    const eCore=ring(V(0,cy,cz+0.021), V(0,0,1), 0.007, 0.007, 6);
    capFan(eCore, V(0,cy,cz+0.026), P.glowCore);
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

  /* CURLS peeking at the temples under the hood */
  for(const s of [-1,1]){
    const cx=s*0.090, cz=0.020, cy=L.cheekY+0.006;
    tube(V(cx,cy,cz), V(cx*1.08,cy-0.03,cz+0.01), 0.020,0.016,4,P.hair,{capB:{hex:P.hairDk}});
  }

  /* HOOD — dark, open-face (over the curls) */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.100, rz:0.094, hex:P.hoodDk},
      {y:L.jawY+0.02,   rx:0.128, rz:0.118, hex:P.hood},
      {y:L.browY+0.02,  rx:0.132, rz:0.118, hex:P.hood},
      {y:L.crownY+0.02, rx:0.098, rz:0.090, hex:P.hood},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.014);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.02, -0.02), P.hood);
  }

  /* LEFT ARM — raised, forearm derived under the grimoire spine */
  {
    const S=V(-L.shoulderX, L.shldY-0.01, 0.03);
    const E=V(-0.235, 0.520, 0.150);
    tube(S,E,0.048,0.038,6,P.robe);
    tube(E, FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.025), 0.036,0.028,6,P.robeLt,{capB:{hex:P.skinDk}});
    tube(FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.025), FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,0.025),
         0.030,0.026,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* RIGHT ARM — raised claw/invoking gesture beside the head */
  const CLAW = V(0.265, 0.780, 0.150);
  const CDIR = V(0.35, 0.30, 0.55).normalize();
  {
    const S2=V(L.shoulderX, L.shldY-0.01, 0.03);
    const E2=V(0.245, 0.600, 0.110);
    const W2=CLAW.clone().addScaledVector(CDIR,-0.04);
    tube(S2,E2,0.046,0.036,6,P.robe);
    tube(E2,W2,0.036,0.028,6,P.robeLt,{capB:{hex:P.skinDk}});
    tube(W2, CLAW, 0.030,0.024,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,CDIR).normalize();
    const fv=new THREE.Vector3().crossVectors(CDIR,fu).normalize();
    for(const k of [-2.2,-0.9,0.9,2.2]){
      const base=CLAW.clone().addScaledVector(fu,k*0.012).addScaledVector(CDIR,0.008);
      const knuckle=base.clone().addScaledVector(CDIR,0.024).addScaledVector(fv,0.016).addScaledVector(fu,k*0.007);
      const tip=knuckle.clone().addScaledVector(CDIR,0.006).addScaledVector(fv,0.028).addScaledVector(fu,k*0.010);
      tube(base,knuckle,0.009,0.007,4,P.skin);
      tube(knuckle,tip,0.007,0.004,4,P.skinDk,{capB:{hex:P.skinDk}});
    }
  }

  /* LEGS — BARE oversized feet peeking under the robe hem */
  {
    for(const s of [-1,1]){
      const shin=V(s*0.072, 0.11, 0.02);
      const ankBot=V(shin.x, 0.075, shin.z);
      tube(shin, ankBot, 0.034, 0.052, 6, P.skin);
      stack([
        {y:0.016, rx:0.072, rz:0.090, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.058, rx:0.066, rz:0.078, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.038,shin.z), d=V(s*0.12,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.138), 0.066,0.050,6,P.footpad, {capB:{hex:P.footpad, lift:0.015}, raz:0.056, rbz:0.040});
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
