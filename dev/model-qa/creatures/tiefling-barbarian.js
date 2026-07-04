/* dev/model-qa/creatures/tiefling-barbarian.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED tiefling race (slim-but-here-hardened frame, dusky red-mauve skin, backswept HORNS, sharp
   GOATEE, thin spade-tipped TAIL) wearing the BARBARIAN kit (barbarian.js signature: a two-handed
   GREAT-AXE authored first so BOTH fists derive from the haft, a bare skin chest with pec scoring, a
   fur pelt over one shoulder, a wide aggressive stance). An infernal-blooded reaver; the horns +
   goatee + tail carry the race over the bare mauve chest. EYELESS. One whole-object function, no
   anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTieflingBarbarian(){
  const P = {
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a, hair:0x2a2320,
    fur:0x9b8468, furDk:0x655336, furLt:0xc2b28e,
    trouser:0x3a2e26, trouserDk:0x281f18,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    boot:0x3c3226, bootDk:0x2a2118,
    wood:0x5a4326, woodDk:0x3f2f1a,
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xb9bfc4, bronze:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.230,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* GREAT-AXE FIRST — two-handed haft; both fists derive from it */
  const AXE_BUTT = V(-0.05, 0.55, -0.09), AXE_TOP = V(0.210, 1.72, 0.28);
  const AXIS = new THREE.Vector3().subVectors(AXE_TOP, AXE_BUTT).normalize();
  const GRIP_LO = AXE_BUTT.clone().addScaledVector(AXIS, 0.30);
  const GRIP_HI = AXE_BUTT.clone().addScaledVector(AXIS, 0.60);
  {
    tube(AXE_BUTT, AXE_BUTT.clone().addScaledVector(AXIS, 0.10), 0.024,0.022,6, P.leatherDk, {capA:{hex:P.bronze, lift:0.02}});
    tube(AXE_BUTT.clone().addScaledVector(AXIS, 0.10), GRIP_LO.clone().addScaledVector(AXIS, -0.09), 0.022,0.022,6, P.wood);
    tube(GRIP_LO.clone().addScaledVector(AXIS, -0.09), GRIP_LO.clone().addScaledVector(AXIS, 0.09), 0.024,0.024,6, P.leather);
    tube(GRIP_LO.clone().addScaledVector(AXIS, 0.09), GRIP_HI.clone().addScaledVector(AXIS, -0.09), 0.021,0.020,6, P.wood);
    tube(GRIP_HI.clone().addScaledVector(AXIS, -0.09), GRIP_HI.clone().addScaledVector(AXIS, 0.09), 0.023,0.023,6, P.leather);
    tube(GRIP_HI.clone().addScaledVector(AXIS, 0.09), AXE_TOP.clone().addScaledVector(AXIS, -0.20), 0.020,0.028,6, P.wood);
    tube(AXE_TOP.clone().addScaledVector(AXIS, -0.20), AXE_TOP.clone().addScaledVector(AXIS, -0.05), 0.028,0.048,6, P.steelDk);
    const up = V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, AXIS).normalize();
    const w = new THREE.Vector3().crossVectors(AXIS, u).normalize();
    const HEAD_C = AXE_TOP.clone().addScaledVector(AXIS, -0.02);
    tube(HEAD_C.clone().addScaledVector(w,-0.035), HEAD_C.clone().addScaledVector(w,0.035), 0.070, 0.070, 8, P.steelDk);
    for(const s of [-1,1]){
      const root = HEAD_C.clone().addScaledVector(u, s*0.055);
      const bandN = 6;
      const innerPts = [], outerPts = [];
      for(let k=0;k<=bandN;k++){
        const t = k/bandN;
        const along = -0.13 + t*0.28;
        const reach = 0.055 + Math.sin(t*Math.PI)*0.28;
        innerPts.push(root.clone().addScaledVector(AXIS, along*0.35).addScaledVector(u, s*reach*0.15));
        outerPts.push(root.clone().addScaledVector(AXIS, along).addScaledVector(u, s*reach));
      }
      for(let k=0;k<bandN;k++){
        const a=innerPts[k], b=innerPts[k+1], c=outerPts[k+1], d=outerPts[k];
        const off = w.clone().multiplyScalar(0.015);
        quad(a.clone().add(off), b.clone().add(off), c.clone().add(off), d.clone().add(off), P.steel, 0.04);
        quad(d.clone().sub(off), c.clone().sub(off), b.clone().sub(off), a.clone().sub(off), P.steel, 0.04);
        quad(d.clone().add(off), c.clone().add(off), c.clone().sub(off), d.clone().sub(off), P.steelLt, 0.02);
      }
    }
  }

  /* trunk — bare dusky chest with pec/ab scoring (slim tiefling reaver) */
  stack([
    {y:L.hipY,   rx:0.170, rz:0.128, hex:P.skinDk},
    {y:L.waistY, rx:0.148, rz:0.112, hex:P.skin},
    {y:L.ribY,   rx:0.180, rz:0.134, hex:P.skin},
    {y:L.chestY, rx:0.210, rz:0.146, hex:P.skin},
    {y:L.shldY,  rx:0.218, rz:0.140, hex:P.skin},
    {y:L.neckY,  rx:0.078, rz:0.074, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});
  {
    const rows=[[L.ribY,0.134],[0.925,0.142],[L.chestY,0.146]];
    for(const [y,z] of rows){
      quad(V(-0.030,y-0.008,z), V(0.030,y-0.008,z), V(0.030,y+0.008,z+0.01), V(-0.030,y+0.008,z+0.01), P.skinDk, 0.05);
    }
    for(const s of [-1,1]){
      const cx=s*0.082, cy=L.chestY-0.024, cz=0.144;
      quad(V(cx-0.050,cy-0.012,cz), V(cx+0.050,cy-0.012,cz),
           V(cx+0.044,cy+0.010,cz+0.008), V(cx-0.044,cy+0.010,cz+0.008), P.skinDk, 0.045);
    }
  }

  /* belt + loincloth */
  stack([
    {y:0.735, rx:0.155, rz:0.118, hex:P.leather},
    {y:0.780, rx:0.152, rz:0.115, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.035,0.740,0.120), V(0.035,0.740,0.120), V(0.035,0.775,0.116), V(-0.035,0.775,0.116), P.bronze, 0.02);
  stack([
    {y:0.475, rx:0.180, rz:0.140, hex:P.trouserDk},
    {y:0.585, rx:0.172, rz:0.132, hex:P.trouser},
    {y:L.hipY, rx:0.166, rz:0.126, hex:P.trouser},
  ], 8, {});

  /* HEAD — inherited tiefling skull. EYELESS. */
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
    /* wild top-knot mane (barbarian read) */
    stack([
      {y:L.crownY-0.01, rx:0.086, rz:0.078, cz:-0.006, hex:P.hair},
      {y:L.crownY+0.03, rx:0.070, rz:0.062, cz:-0.010, hex:P.hair},
    ], 8, {capTop:{hex:P.hair, lift:0.012}});
    tube(V(0,L.crownY+0.03,-0.02), V(-0.02,L.headTopY+0.11,-0.10), 0.028,0.011,6,P.hair,{capB:{hex:P.hair}});
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
  /* HORNS — backswept */
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

  /* FUR PELT — over the LEFT shoulder */
  {
    const n=8, ph=Math.PI/n;
    const wrap=[
      {y:L.shldY-0.05, rx:0.130, rz:0.122, cx:-0.120, hex:P.furDk},
      {y:L.shldY+0.06, rx:0.122, rz:0.114, cx:-0.128, hex:P.fur},
      {y:L.shldY+0.14, rx:0.086, rz:0.080, cx:-0.124, hex:P.furLt},
    ].map(b=>ring(V(b.cx,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(wrap, ()=>P.fur);
    capFan(wrap.at(-1), V(-0.124,L.shldY+0.20,0.02), P.furLt);
    const fp=[[L.shldY,-0.120,0.120],[0.90,-0.145,0.145],[0.74,-0.160,0.135],[0.58,-0.160,0.115]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,x1,z1]=fp[i], [y2,x2,z2]=fp[i+1];
      quad(V(x1-0.055,y1,z1), V(x1+0.045,y1,z1), V(x2+0.040,y2,z2), V(x2-0.060,y2,z2), i%2?P.fur:P.furDk, 0.06);
    }
  }

  /* RIGHT PAULDRON (bronze cop on the un-pelt shoulder) */
  {
    const pivot=V(L.shoulderX, L.shldY+0.01, 0.01);
    stack([
      {y:L.shldY-0.02, rx:0.072, rz:0.076, cx:pivot.x, cz:pivot.z, hex:P.leatherDk},
      {y:L.shldY+0.03, rx:0.058, rz:0.062, cx:pivot.x, cz:pivot.z, hex:P.bronze},
    ], 8, {capTop:{hex:P.bronze, lift:0.02}});
  }

  /* ARMS — both fists derive from the axe grips (dusky skin) */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const FIST_HI=GRIP_HI.clone();
    const E=S.clone().lerp(FIST_HI, 0.5).add(V(0.05, 0.0, 0.03));
    tube(S,E,0.078,0.062,6,P.skin);
    tube(E,FIST_HI.clone().addScaledVector(AXIS,-0.03),0.058,0.048,6,P.skin);
    tube(FIST_HI.clone().addScaledVector(AXIS,-0.06), FIST_HI.clone().addScaledVector(AXIS,0.06), 0.050,0.046,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const FIST_LO=GRIP_LO.clone();
    const E2=S2.clone().lerp(FIST_LO, 0.5).add(V(0.02, 0.02, 0.02));
    tube(S2,E2,0.076,0.060,6,P.skin);
    tube(E2,FIST_LO.clone().addScaledVector(AXIS,-0.06),0.056,0.048,6,P.skin);
    tube(FIST_LO.clone().addScaledVector(AXIS,-0.06), FIST_LO.clone().addScaledVector(AXIS,0.06), 0.050,0.046,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});
  }

  /* legs — wide aggressive stance, fur boot cuffs (slim tiefling) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.205,0.40,0.12), ankL=V(-0.215,0.085,0.085);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.225,0.40,-0.06), ankR=V( 0.240,0.085,-0.13);
    tube(hipL,kneeL,0.078,0.056,6,P.trouser);
    tube(kneeL,ankL,0.052,0.040,6,P.skin);
    tube(hipR,kneeR,0.078,0.056,6,P.trouser);
    tube(kneeR,ankR,0.052,0.040,6,P.skin);
    for(const [ank,toeDir] of [[ankL,V(0.08,0,1)], [ankR,V(0.85,0,0.32).normalize()]]){
      stack([
        {y:0.03,  rx:0.058, rz:0.064, cx:ank.x, cz:ank.z, hex:P.fur},
        {y:0.095, rx:0.052, rz:0.056, cx:ank.x, cz:ank.z, hex:P.furDk},
      ], 6, {capTop:{hex:P.furLt, lift:0.015}});
      stack([
        {y:0.012, rx:0.056, rz:0.062, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.075, rx:0.050, rz:0.052, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capBot:{hex:P.bootDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.125), 0.048,0.036,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.040, rbz:0.028});
    }
  }

  /* TAIL — thin spade-tipped tail from the hip (inherited) */
  {
    const root = V(0.030, L.hipY-0.045, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.trouserDk);
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
