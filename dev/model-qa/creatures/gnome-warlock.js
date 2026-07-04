/* dev/model-qa/creatures/gnome-warlock.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED gnome race (post-F1 big head + wedge EARS + eyeless, stubby frame) wearing the WARLOCK kit
   (warlock.js signature: a GRIMOIRE authored first — a bound tome with fanned pages cradled on the
   raised off forearm — a raised claw/invoking hand, a long layered dark robe, a glowing eye-AMULET at
   the chest). The gnome keeps its big head + ears under the hood (race-read). One whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnomeWarlock(){
  const P = {
    robe:0x2c2a34, robeDk:0x201e27, robeLt:0x3a3742,
    under:0x463a2e, underDk:0x332a21,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    hood:0x26242e, hoodDk:0x1a1820,
    page:0xcbbf9e, pageDk:0x9c9077, cover:0x3a2420, coverDk:0x281812,
    gold:0x8d7238, goldDk:0x5f4c25,
    glow:0x8fd6a0, glowDk:0x4f8f66, glowCore:0xd8f2df,
    boot:0x1c1712, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hemY:0.03, kneeY:0.18, hipY:0.335, waistY:0.375, ribY:0.435, chestY:0.465, shldY:0.485, neckY:0.515,
    hipHalf:0.100, shoulderX:0.150,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* GRIMOIRE FIRST — cradled on the raised LEFT forearm (bound tome, fanned pages up) */
  const SPINE_A = V(-0.285, 0.450, 0.235), SPINE_B = V(-0.120, 0.475, 0.300);
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

  /* TRUNK — under-tunic (gnome stubby) */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.126, hex:P.underDk},
    {y:L.waistY, rx:0.166, rz:0.140, hex:P.under},
    {y:L.ribY,   rx:0.156, rz:0.130, hex:P.under},
    {y:L.chestY, rx:0.150, rz:0.124, hex:P.robeDk},
    {y:L.shldY,  rx:0.148, rz:0.120, hex:P.robeDk},
    {y:L.neckY,  rx:0.070, rz:0.066, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* LONG LAYERED ROBE — floor-length outer shell */
  stack([
    {y:L.hemY, rx:0.196, rz:0.164, hex:P.robeDk},
    {y:0.16,   rx:0.186, rz:0.154, hex:P.robe},
    {y:0.30,   rx:0.176, rz:0.146, hex:P.robe},
    {y:L.hipY, rx:0.168, rz:0.138, hex:P.robeLt},
  ], 8, {});
  stack([
    {y:L.shldY-0.02, rx:0.150, rz:0.124, hex:P.robeLt},
    {y:0.42,         rx:0.172, rz:0.144, hex:P.robe},
    {y:0.30,         rx:0.180, rz:0.150, hex:P.robeDk},
  ], 8, {});

  /* CHEST MEDALLION — the eye amulet with a witch-light glow */
  {
    const cy=L.chestY-0.02, cz=0.128;
    const ringOuter=ring(V(0,cy,cz), V(0,0,1), 0.042, 0.042, 10);
    const ringInner=ring(V(0,cy,cz+0.010), V(0,0,1), 0.028, 0.028, 10);
    stitch([ringOuter,ringInner], ()=>P.gold);
    capFan(ringOuter, V(0,cy,cz-0.010), P.goldDk, true);
    const eLid=ring(V(0,cy,cz+0.012), V(0,0,1), 0.018, 0.018, 8);
    capFan(eLid, V(0,cy,cz+0.020), P.glow);
    const eCore=ring(V(0,cy,cz+0.021), V(0,0,1), 0.007, 0.007, 6);
    capFan(eCore, V(0,cy,cz+0.026), P.glowCore);
  }

  /* HEAD — inherited gnome (big head, ears, eyeless) */
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

  /* HOOD — dark, open-face (over the big ears) */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.128, rz:0.120, hex:P.hoodDk},
      {y:L.jawY+0.03,   rx:0.166, rz:0.152, hex:P.hood},
      {y:L.browY+0.02,  rx:0.170, rz:0.152, hex:P.hood},
      {y:L.crownY+0.02, rx:0.128, rz:0.118, hex:P.hood},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.016);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.03, -0.03), P.hood);
  }

  /* LEFT ARM — raised, forearm derived under the grimoire spine */
  {
    const S=V(-L.shoulderX, L.shldY-0.01, 0.03);
    const E=V(-0.260, 0.440, 0.150);
    tube(S,E,0.056,0.044,6,P.robe);
    tube(E, FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.025), 0.044,0.034,6,P.robeLt,{capB:{hex:P.skinDk}});
    tube(FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.025), FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,0.025),
         0.036,0.032,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* RIGHT ARM — raised claw/invoking gesture beside the head */
  const CLAW = V(0.290, 0.700, 0.150);
  const CDIR = V(0.35, 0.30, 0.55).normalize();
  {
    const S2=V(L.shoulderX, L.shldY-0.01, 0.03);
    const E2=V(0.265, 0.520, 0.110);
    const W2=CLAW.clone().addScaledVector(CDIR,-0.04);
    tube(S2,E2,0.054,0.042,6,P.robe);
    tube(E2,W2,0.044,0.032,6,P.robeLt,{capB:{hex:P.skinDk}});
    tube(W2, CLAW, 0.036,0.028,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,CDIR).normalize();
    const fv=new THREE.Vector3().crossVectors(CDIR,fu).normalize();
    for(const k of [-2.2,-0.9,0.9,2.2]){
      const base=CLAW.clone().addScaledVector(fu,k*0.014).addScaledVector(CDIR,0.008);
      const knuckle=base.clone().addScaledVector(CDIR,0.028).addScaledVector(fv,0.018).addScaledVector(fu,k*0.008);
      const tip=knuckle.clone().addScaledVector(CDIR,0.006).addScaledVector(fv,0.032).addScaledVector(fu,k*0.011);
      tube(base,knuckle,0.010,0.008,4,P.skin);
      tube(knuckle,tip,0.008,0.004,4,P.skinDk,{capB:{hex:P.skinDk}});
    }
  }

  /* LEGS — boots peeking under the robe hem */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.02), ankL=V(-0.08, 0.075, 0.04);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.02), ankR=V( 0.095, 0.075, 0.02);
    tube(hipL,ankL,0.052,0.040,6,P.underDk);
    tube(hipR,ankR,0.052,0.040,6,P.underDk);
    for(const [ank,toeDir] of [[ankL,V(-0.1,0,1).normalize()], [ankR,V(0.15,0,1).normalize()]]){
      stack([
        {y:0.010, rx:0.056, rz:0.062, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.08,  rx:0.048, rz:0.050, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.100), 0.046,0.034,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.040, rbz:0.028});
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
