/* dev/model-qa/creatures/tiefling-warlock.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED tiefling race (race-tiefling: dusky red-mauve skin, backswept HORNS off the temples, a
   sharp GOATEE, a thin spade-tipped TAIL) wearing the WARLOCK kit (warlock.js signature: a GRIMOIRE
   authored first — a bound tome with fanned pages cradled on the raised off forearm — a raised
   claw/invoking hand, a long layered dark robe, and a glowing eye-AMULET at the chest). The tiefling
   supplies its OWN horns (no warlock stub-horn cowl needed — the real horns are the read). One
   whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTieflingWarlock(){
  const P = {
    robe:0x2c2a34, robeDk:0x201e27, robeLt:0x3a3742,
    under:0x463a2e, underDk:0x332a21,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a,
    hair:0x2a2320, eye:0x1a1512,
    page:0xcbbf9e, pageDk:0x9c9077, cover:0x3a2420, coverDk:0x281812,
    gold:0x8d7238, goldDk:0x5f4c25,
    glow:0x8fd6a0, glowDk:0x4f8f66, glowCore:0xd8f2df,
    boot:0x1c1712, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.215,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* GRIMOIRE FIRST — cradled on the raised LEFT forearm (bound tome, fanned pages up toward camera) */
  const SPINE_A = V(-0.375, 0.815, 0.305), SPINE_B = V(-0.150, 0.845, 0.390);
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

  /* TRUNK — hunched (leans forward as y rises) */
  {
    const bands=[
      {y:L.hipY,   rx:0.180, rz:0.145, cz:0.0,   hex:P.underDk},
      {y:L.waistY, rx:0.158, rz:0.128, cz:0.010, hex:P.under},
      {y:L.ribY,   rx:0.182, rz:0.145, cz:0.024, hex:P.under},
      {y:L.chestY, rx:0.200, rz:0.155, cz:0.042, hex:P.robeDk},
      {y:L.shldY,  rx:0.198, rz:0.145, cz:0.058, hex:P.robeDk},
      {y:L.neckY,  rx:0.076, rz:0.072, cz:0.062, hex:P.skinDk},
    ];
    stack(bands, 8, {capTop:{hex:P.skinDk, lift:0.004}});
  }

  /* LONG LAYERED ROBE — floor-length outer shell */
  stack([
    {y:0.03,  rx:0.290, rz:0.245, cz:0.045, hex:P.robeDk},
    {y:0.20,  rx:0.270, rz:0.225, cz:0.040, hex:P.robe},
    {y:0.40,  rx:0.245, rz:0.200, cz:0.032, hex:P.robe},
    {y:0.60,  rx:0.220, rz:0.175, cz:0.022, hex:P.robeLt},
    {y:L.hipY,rx:0.195, rz:0.155, cz:0.012, hex:P.robeLt},
  ], 8, {});
  stack([
    {y:L.shldY-0.03, rx:0.215, rz:0.165, cz:0.050, hex:P.robeLt},
    {y:0.86,         rx:0.235, rz:0.185, cz:0.038, hex:P.robe},
    {y:0.62,         rx:0.250, rz:0.200, cz:0.024, hex:P.robeDk},
  ], 8, {});

  /* CHEST MEDALLION — the eye amulet with a witch-light glow */
  {
    const cy=0.92, cz=0.205;
    const ringOuter=ring(V(0,cy,cz), V(0,0,1), 0.058, 0.058, 10);
    const ringInner=ring(V(0,cy,cz+0.014), V(0,0,1), 0.040, 0.040, 10);
    stitch([ringOuter,ringInner], ()=>P.gold);
    capFan(ringOuter, V(0,cy,cz-0.012), P.goldDk, true);
    const eLid=ring(V(0,cy,cz+0.016), V(0,0,1), 0.026, 0.026, 8);
    capFan(eLid, V(0,cy,cz+0.026), P.glow);
    const eCore=ring(V(0,cy,cz+0.027), V(0,0,1), 0.010, 0.010, 6);
    capFan(eCore, V(0,cy,cz+0.033), P.glowCore);
    tube(V(-0.045,cy+0.05,cz-0.01), V(-0.075,L.neckY+0.02,0.062), 0.007,0.007,4,P.gold);
    tube(V( 0.045,cy+0.05,cz-0.01), V( 0.075,L.neckY+0.02,0.062), 0.007,0.007,4,P.gold);
  }

  /* HEAD — inherited tiefling skull (nose pushed, dusky skin). Slightly +z on the hunched neck. */
  const HEAD_Z=0.040;
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.076, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.104, rz:0.100, hex:P.skin},
      {y:L.browY,  rx:0.108, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.084, rz:0.076, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,HEAD_Z+0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, HEAD_Z+0.006), P.skinDk);
    for(const s of [-1,1]){
      const ex=s*0.050, ey=(L.cheekY+L.browY)/2-0.004, ez=HEAD_Z+0.116;
      quad(V(ex-0.013,ey-0.009,ez), V(ex+0.013,ey-0.009,ez),
           V(ex+0.013,ey+0.011,ez-0.006), V(ex-0.013,ey+0.011,ez-0.006), P.eye, 0.0);
    }
    /* short dark hair cap */
    stack([
      {y:L.crownY-0.01, rx:0.086, rz:0.078, cz:HEAD_Z-0.006, hex:P.hair},
      {y:L.crownY+0.03, rx:0.070, rz:0.062, cz:HEAD_Z-0.010, hex:P.hair},
    ], 8, {capTop:{hex:P.hair, lift:0.012}});
  }

  /* GOATEE — a small sharp wedge at the chin (inherited tiefling marker) */
  {
    const bands=[
      {y:L.jawY+0.010, rx:0.058, rz:0.046, cz:HEAD_Z+0.058, hex:P.hair},
      {y:L.jawY-0.034, rx:0.044, rz:0.036, cz:HEAD_Z+0.075, hex:P.hair},
      {y:L.jawY-0.072, rx:0.028, rz:0.024, cz:HEAD_Z+0.078, hex:P.hair},
      {y:L.jawY-0.100, rx:0.012, rz:0.011, cz:HEAD_Z+0.068, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.jawY-0.122,HEAD_Z+0.062), P.hair);
  }

  /* HORNS — backswept off the temples (inherited tiefling marker) */
  for(const s of [-1,1]){
    const baseX = s*0.100, baseZ = HEAD_Z-0.010;
    const base   = V(baseX, L.browY-0.010, baseZ);
    const p1 = V(baseX + s*0.026, L.browY+0.118, baseZ - 0.028);
    const p2 = V(baseX + s*0.044, L.browY+0.210, baseZ - 0.090);
    const p3 = V(baseX + s*0.052, L.browY+0.262, baseZ - 0.150);
    tube(base, p1, 0.030, 0.023, 6, P.horn,   {capA:{hex:P.hornDk}});
    tube(p1,   p2, 0.023, 0.015, 6, P.hornLt);
    tube(p2,   p3, 0.015, 0.003, 6, P.hornLt, {capB:{hex:P.hornDk}});
  }

  /* LEFT ARM — raised, forearm derived under the grimoire spine */
  {
    const S=V(-L.shoulderX, L.shldY-0.02, 0.05);
    const E=V(-0.355, 0.760, 0.220);
    tube(S,E,0.068,0.056,6,P.robe);
    tube(E, FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.03), 0.052,0.044,6,P.robeLt,{capB:{hex:P.skinDk}});
    tube(FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.03), FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,0.03),
         0.040,0.036,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* RIGHT ARM — raised claw/invoking gesture beside the head */
  const CLAW = V(0.395, 1.235, 0.205);
  const CDIR = V(0.35, 0.30, 0.55).normalize();
  {
    const S2=V(L.shoulderX, L.shldY-0.02, 0.05);
    const E2=V(0.365, 1.03, 0.155);
    const W2=CLAW.clone().addScaledVector(CDIR,-0.05);
    tube(S2,E2,0.066,0.054,6,P.robe);
    tube(E2,W2,0.048,0.036,6,P.robeLt,{capB:{hex:P.skinDk}});
    tube(W2, CLAW, 0.036,0.028,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,CDIR).normalize();
    const fv=new THREE.Vector3().crossVectors(CDIR,fu).normalize();
    for(const k of [-2.2,-0.9,0.9,2.2]){
      const base=CLAW.clone().addScaledVector(fu,k*0.017).addScaledVector(CDIR,0.01);
      const knuckle=base.clone().addScaledVector(CDIR,0.034).addScaledVector(fv,0.022).addScaledVector(fu,k*0.008);
      const tip=knuckle.clone().addScaledVector(CDIR,0.006).addScaledVector(fv,0.040).addScaledVector(fu,k*0.013);
      tube(base,knuckle,0.011,0.009,4,P.skin);
      tube(knuckle,tip,0.009,0.005,4,P.skinDk,{capB:{hex:P.skinDk}});
    }
  }

  /* LEGS — narrow stance, mostly hidden by the robe hem (boots show) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.02), ankL=V(-0.10, 0.085, 0.05);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.02), ankR=V( 0.115, 0.085, 0.02);
    tube(hipL,ankL,0.060,0.044,6,P.underDk);
    tube(hipR,ankR,0.060,0.044,6,P.underDk);
    for(const [ank,toeDir] of [[ankL,V(-0.1,0,1).normalize()], [ankR,V(0.15,0,1).normalize()]]){
      stack([
        {y:0.012, rx:0.062, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.056, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.115), 0.050,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.042, rbz:0.030});
    }
  }

  /* TAIL — thin spade-tipped tail chained from the hip, curving down and back (inherited) */
  {
    const root = V(0.030, L.hipY-0.045, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.robeDk);
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
