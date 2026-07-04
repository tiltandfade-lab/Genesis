/* dev/model-qa/creatures/dragonborn-warlock.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the WARLOCK kit (warlock.js
   signature: an open GRIMOIRE authored first cradled on the raised off forearm, a raised claw/invoking
   hand, a long layered dark ROBE, a glowing eye-AMULET at the chest). A draconic pact-caster; the
   muzzle + horns + tail carry the race. EYELESS. One whole-object function, no anchors; figure faces
   +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornWarlock(){
  const P = {
    robe:0x2c2a34, robeDk:0x201e27, robeLt:0x3a3742,
    under:0x463a2e, underDk:0x332a21,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a,
    page:0xcbbf9e, pageDk:0x9c9077, cover:0x3a2420, coverDk:0x281812,
    gold:0x8d7238, goldDk:0x5f4c25,
    glow:0x8fd6a0, glowDk:0x4f8f66, glowCore:0xd8f2df,
    boot:0x1c1712, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* GRIMOIRE FIRST — cradled on the raised LEFT forearm (open tome, fanned pages up toward camera) */
  const SPINE_A = V(-0.470, 0.930, 0.340), SPINE_B = V(-0.190, 0.965, 0.430);
  const SPINE_DIR = new THREE.Vector3().subVectors(SPINE_B, SPINE_A).normalize();
  const SPINE_LEN = SPINE_A.distanceTo(SPINE_B);
  const BOOK_FWD = V(0.20, 0.30, 0.60).normalize();
  const BOOK_UP = new THREE.Vector3().crossVectors(BOOK_FWD, SPINE_DIR).normalize();
  const SPINE_MID = SPINE_A.clone().lerp(SPINE_B, 0.5);
  const FOREARM_GRIP = SPINE_MID.clone().addScaledVector(BOOK_UP, -0.05).addScaledVector(BOOK_FWD, -0.03);
  {
    const coverT=0.062;
    const cTop = (t)=> SPINE_A.clone().lerp(SPINE_B,t).addScaledVector(BOOK_UP, 0.006);
    const cBot = (t)=> SPINE_A.clone().lerp(SPINE_B,t).addScaledVector(BOOK_UP, -coverT);
    quad(cTop(0), cTop(1), cBot(1), cBot(0), P.coverDk, 0.03);
    const cFwdTop=(t)=>cTop(t).addScaledVector(BOOK_FWD,0.078), cFwdBot=(t)=>cBot(t).addScaledVector(BOOK_FWD,0.078);
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
    tube(SPINE_MID.clone().addScaledVector(BOOK_UP,0.008), SPINE_MID.clone().addScaledVector(BOOK_UP,-0.10), 0.008,0.006,4,P.gold,{capB:{hex:P.goldDk}});
  }

  /* TRUNK — hunched (leans forward as y rises), broad dragonborn */
  {
    const bands=[
      {y:L.hipY,   rx:0.225, rz:0.170, cz:0.0,   hex:P.underDk},
      {y:L.waistY, rx:0.190, rz:0.148, cz:0.010, hex:P.under},
      {y:L.ribY,   rx:0.230, rz:0.172, cz:0.024, hex:P.under},
      {y:L.chestY, rx:0.262, rz:0.186, cz:0.042, hex:P.robeDk},
      {y:L.shldY,  rx:0.278, rz:0.178, cz:0.058, hex:P.robeDk},
      {y:L.neckY,  rx:0.100, rz:0.095, cz:0.062, hex:P.scaleDk},
    ];
    stack(bands, 8, {capTop:{hex:P.scaleDk, lift:0.004}});
  }

  /* LONG LAYERED ROBE — floor-length outer shell (broad dragonborn) */
  stack([
    {y:0.03,  rx:0.360, rz:0.300, cz:0.045, hex:P.robeDk},
    {y:0.20,  rx:0.335, rz:0.280, cz:0.040, hex:P.robe},
    {y:0.40,  rx:0.305, rz:0.250, cz:0.032, hex:P.robe},
    {y:0.60,  rx:0.275, rz:0.220, cz:0.022, hex:P.robeLt},
    {y:L.hipY,rx:0.245, rz:0.195, cz:0.012, hex:P.robeLt},
  ], 8, {});
  stack([
    {y:L.shldY-0.03, rx:0.270, rz:0.205, cz:0.050, hex:P.robeLt},
    {y:0.90,         rx:0.290, rz:0.225, cz:0.038, hex:P.robe},
    {y:0.66,         rx:0.305, rz:0.240, cz:0.024, hex:P.robeDk},
  ], 8, {});

  /* CHEST AMULET — glowing eye medallion */
  {
    const cy=0.99, cz=0.230;
    const ringOuter=ring(V(0,cy,cz), V(0,0,1), 0.064, 0.064, 10);
    const ringInner=ring(V(0,cy,cz+0.014), V(0,0,1), 0.044, 0.044, 10);
    stitch([ringOuter,ringInner], ()=>P.gold);
    capFan(ringOuter, V(0,cy,cz-0.012), P.goldDk, true);
    const eLid=ring(V(0,cy,cz+0.016), V(0,0,1), 0.028, 0.028, 8);
    capFan(eLid, V(0,cy,cz+0.028), P.glow);
    const eCore=ring(V(0,cy,cz+0.029), V(0,0,1), 0.011, 0.011, 6);
    capFan(eCore, V(0,cy,cz+0.036), P.glowCore);
    tube(V(-0.050,cy+0.05,cz-0.01), V(-0.085,L.neckY+0.02,0.070), 0.007,0.007,4,P.gold);
    tube(V( 0.050,cy+0.05,cz-0.01), V( 0.085,L.neckY+0.02,0.070), 0.007,0.007,4,P.gold);
  }

  /* HEAD — inherited dragonborn skull, slight +z on the hunched neck. EYELESS. */
  const HEAD_Z=0.040;
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.100, rz:0.098, hex:P.scale},
      {y:L.muzzleY, rx:0.118, rz:0.116, hex:P.scale},
      {y:L.browY,   rx:0.122, rz:0.108, hex:P.scale},
      {y:L.crownY,  rx:0.098, rz:0.086, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,HEAD_Z+0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.010; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, HEAD_Z+0.004), P.scaleDk);
    const muzBase = V(0, L.muzzleY-0.01, HEAD_Z+0.118);
    const muzMid  = V(0, L.muzzleY-0.030, HEAD_Z+0.186);
    const muzTip  = V(0, L.muzzleY-0.050, HEAD_Z+0.238);
    tube(muzBase, muzMid, 0.112, 0.094, n, P.scale, {raz:0.100, rbz:0.086, phase:ph});
    tube(muzMid, muzTip, 0.094, 0.066, n, P.scaleLt, {raz:0.086, rbz:0.060, phase:ph, capB:{hex:P.scaleDk, lift:0.014}});
    quad(V(-0.058,L.muzzleY-0.070,HEAD_Z+0.128), V(0.058,L.muzzleY-0.070,HEAD_Z+0.128),
         V(0.036,L.muzzleY-0.086,HEAD_Z+0.224), V(-0.036,L.muzzleY-0.086,HEAD_Z+0.224), P.scaleBelly, 0.05);
    for(const s of [-1,1]){
      const hb = V(s*0.072, L.crownY-0.015, HEAD_Z-0.020);
      const ht = V(s*0.098, L.crownY+0.075, HEAD_Z-0.115);
      tube(hb, ht, 0.032, 0.012, 6, P.horn, {capB:{hex:P.hornTip, lift:0.008}});
    }
  }

  /* LEFT ARM — raised, forearm derived under the grimoire spine */
  {
    const S=V(-L.shoulderX, L.shldY-0.02, 0.05);
    const E=V(-0.445, 0.860, 0.235);
    tube(S,E,0.098,0.076,6,P.robe);
    tube(E, FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.03), 0.072,0.058,6,P.robeLt,{capB:{hex:P.scaleDk}});
    tube(FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.03), FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,0.03),
         0.056,0.050,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});
  }

  /* RIGHT ARM — raised claw/invoking gesture beside the head */
  const CLAW = V(0.470, 1.300, 0.220);
  const CDIR = V(0.35, 0.30, 0.55).normalize();
  {
    const S2=V(L.shoulderX, L.shldY-0.02, 0.05);
    const E2=V(0.440, 1.08, 0.160);
    const W2=CLAW.clone().addScaledVector(CDIR,-0.05);
    tube(S2,E2,0.096,0.074,6,P.robe);
    tube(E2,W2,0.068,0.052,6,P.robeLt,{capB:{hex:P.scaleDk}});
    tube(W2, CLAW, 0.052,0.040,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,CDIR).normalize();
    const fv=new THREE.Vector3().crossVectors(CDIR,fu).normalize();
    for(const k of [-2.2,-0.9,0.9,2.2]){
      const base=CLAW.clone().addScaledVector(fu,k*0.021).addScaledVector(CDIR,0.01);
      const knuckle=base.clone().addScaledVector(CDIR,0.040).addScaledVector(fv,0.026).addScaledVector(fu,k*0.010);
      const tip=knuckle.clone().addScaledVector(CDIR,0.008).addScaledVector(fv,0.046).addScaledVector(fu,k*0.015);
      tube(base,knuckle,0.014,0.011,4,P.scale);
      tube(knuckle,tip,0.011,0.006,4,P.scaleDk,{capB:{hex:P.scaleDk}});
    }
  }

  /* LEGS — narrow stance, mostly hidden by the robe hem (boots show) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.02), ankL=V(-0.14, 0.085, 0.05);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.02), ankR=V( 0.155, 0.085, 0.02);
    tube(hipL,ankL,0.088,0.060,6,P.underDk);
    tube(hipR,ankR,0.088,0.060,6,P.underDk);
    for(const [ank,toeDir] of [[ankL,V(-0.1,0,1).normalize()], [ankR,V(0.15,0,1).normalize()]]){
      stack([
        {y:0.012, rx:0.078, rz:0.086, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.070, rz:0.072, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.130), 0.062,0.046,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.054, rbz:0.038});
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
    tube(root, t1, 0.112, 0.092, 8, P.robeDk,  {phase:Math.PI/8});
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
