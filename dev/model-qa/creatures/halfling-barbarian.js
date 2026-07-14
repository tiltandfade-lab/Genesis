/* dev/model-qa/creatures/halfling-barbarian.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet — the icon) wearing the
   BARBARIAN kit (barbarian.js signature: a two-handed AXE authored first so BOTH fists derive from the
   haft, a bare chest, a fur pelt over one shoulder, a wide aggressive stance). A ferocious little
   halfling reaver — the curls + bare feet keep the race read over the war-fury. One whole-object
   function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalflingBarbarian(){
  const P = {
    skin:0xc99b70, skinDk:0x8e6c4c, skinLt:0xdcb082, footpad:0xc99b70, footpadDk:0x8e6c4c,
    fur:0x9b8468, furDk:0x655336, furLt:0xc2b28e,
    trouser:0x5b4230, trouserDk:0x40301f,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    hairC:0x4a3220, hairDkC:0x332216,
    wood:0x5a4326, woodDk:0x3f2f1a,
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xb9bfc4,
    bronze:0x9c7d3e, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.375, waistY:0.42, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.140,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* AXE FIRST — two-handed haft raised diagonally; both fists derive. Head above the skull. */
  const AXE_BUTT = V(-0.04, 0.22, -0.07), AXE_TOP = V(0.175, 1.14, 0.24);
  const AXIS = new THREE.Vector3().subVectors(AXE_TOP, AXE_BUTT).normalize();
  const GRIP_LO = AXE_BUTT.clone().addScaledVector(AXIS, 0.28);
  const GRIP_HI = AXE_BUTT.clone().addScaledVector(AXIS, 0.54);
  {
    tube(AXE_BUTT, AXE_BUTT.clone().addScaledVector(AXIS, 0.08), 0.018, 0.017, 6, P.leatherDk, {capA:{hex:P.bronze, lift:0.016}});
    tube(AXE_BUTT.clone().addScaledVector(AXIS, 0.08), GRIP_LO.clone().addScaledVector(AXIS, -0.07), 0.017, 0.017, 6, P.wood);
    tube(GRIP_LO.clone().addScaledVector(AXIS, -0.07), GRIP_LO.clone().addScaledVector(AXIS, 0.07), 0.019, 0.019, 6, P.leather);
    tube(GRIP_LO.clone().addScaledVector(AXIS, 0.07), GRIP_HI.clone().addScaledVector(AXIS, -0.07), 0.016, 0.015, 6, P.wood);
    tube(GRIP_HI.clone().addScaledVector(AXIS, -0.07), GRIP_HI.clone().addScaledVector(AXIS, 0.07), 0.018, 0.018, 6, P.leather);
    tube(GRIP_HI.clone().addScaledVector(AXIS, 0.07), AXE_TOP.clone().addScaledVector(AXIS, -0.16), 0.015, 0.023, 6, P.wood);
    tube(AXE_TOP.clone().addScaledVector(AXIS, -0.16), AXE_TOP.clone().addScaledVector(AXIS, -0.03), 0.023, 0.040, 6, P.steelDk);
    const up = V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, AXIS).normalize();
    const w = new THREE.Vector3().crossVectors(AXIS, u).normalize();
    const HEAD_C = AXE_TOP.clone().addScaledVector(AXIS, -0.015);
    tube(HEAD_C.clone().addScaledVector(w,-0.030), HEAD_C.clone().addScaledVector(w,0.030), 0.058, 0.058, 8, P.steelDk);
    const s=1;
    const root = HEAD_C.clone().addScaledVector(u, s*0.048);
    const bandN = 6;
    const innerPts = [], outerPts = [];
    for(let k=0;k<=bandN;k++){
      const t = k/bandN;
      const along = -0.11 + t*0.24;
      const reach = 0.048 + Math.sin(t*Math.PI)*0.24;
      innerPts.push(root.clone().addScaledVector(AXIS, along*0.35).addScaledVector(u, s*reach*0.15));
      outerPts.push(root.clone().addScaledVector(AXIS, along).addScaledVector(u, s*reach));
    }
    for(let k=0;k<bandN;k++){
      const a=innerPts[k], b=innerPts[k+1], c=outerPts[k+1], d=outerPts[k];
      const off = w.clone().multiplyScalar(0.014);
      quad(a.clone().add(off), b.clone().add(off), c.clone().add(off), d.clone().add(off), P.steel, 0.04);
      quad(d.clone().sub(off), c.clone().sub(off), b.clone().sub(off), a.clone().sub(off), P.steel, 0.04);
      quad(d.clone().add(off), c.clone().add(off), c.clone().sub(off), d.clone().sub(off), P.steelLt, 0.02);
    }
  }

  /* trunk — bare halfling chest, slim barbarian */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.096, hex:P.skinDk},
    {y:L.waistY, rx:0.114, rz:0.090, hex:P.skin},
    {y:L.ribY,   rx:0.126, rz:0.100, hex:P.skin},
    {y:L.chestY, rx:0.134, rz:0.102, hex:P.skinLt},
    {y:L.shldY,  rx:0.136, rz:0.098, hex:P.skin},
    {y:L.neckY,  rx:0.062, rz:0.058, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  {
    for(const s of [-1,1]){
      const cx=s*0.050, cy=L.chestY-0.006, cz=0.102;
      quad(V(cx-0.030,cy-0.006,cz), V(cx+0.030,cy-0.006,cz),
           V(cx+0.024,cy+0.008,cz+0.006), V(cx-0.024,cy+0.008,cz+0.006), P.skinDk, 0.045);
    }
  }
  /* belt + loincloth */
  stack([
    {y:L.waistY-0.015, rx:0.116, rz:0.092, hex:P.leather},
    {y:L.waistY+0.012, rx:0.114, rz:0.090, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.018,L.waistY-0.008,0.096), V(0.018,L.waistY-0.008,0.096), V(0.018,L.waistY+0.012,0.093), V(-0.018,L.waistY+0.012,0.093), P.bronze, 0.02);
  stack([
    {y:0.30, rx:0.140, rz:0.112, hex:P.trouserDk},
    {y:0.37, rx:0.126, rz:0.100, hex:P.trouser},
  ], 8, {});

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

  /* CURLY HAIR CAP (inherited) — wilder/darker for the barbarian read */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.045, rx:0.104, rz:0.096, hex:P.hairDkC},
      {y:L.crownY-0.005,rx:0.116, rz:0.106, hex:P.hairC},
      {y:L.crownY+0.045,rx:0.100, rz:0.090, hex:P.hairC},
      {y:L.headTopY+0.012, rx:0.062, rz:0.055, hex:P.hairDkC},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,-0.004), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY+0.05, -0.004), P.hairDkC);
    for(const a of [0.3,1.1,2.0,2.9,3.7,4.6,5.4]){
      const cx=Math.cos(a)*0.102, cz=Math.sin(a)*0.096-0.004, cy=L.crownY+Math.sin(a*3)*0.022;
      const base=V(cx,cy,cz), out=base.clone().addScaledVector(V(cx,0.01,cz).normalize(),0.016);
      tube(base, out, 0.017, 0.014, 4, P.hairC, {capB:{hex:P.hairC, lift:0.003}});
    }
  }

  /* FUR PELT — over the LEFT shoulder */
  {
    const n=8, ph=Math.PI/n;
    const wrap=[
      {y:L.shldY-0.03, rx:0.088, rz:0.082, cx:-0.090, hex:P.furDk},
      {y:L.shldY+0.03, rx:0.080, rz:0.074, cx:-0.096, hex:P.fur},
      {y:L.shldY+0.08, rx:0.056, rz:0.052, cx:-0.090, hex:P.furLt},
    ].map(b=>ring(V(b.cx,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(wrap, ()=>P.fur);
    capFan(wrap.at(-1), V(-0.090,L.shldY+0.12,0.02), P.furLt);
    const fp=[[L.shldY,-0.090,0.090],[0.44,-0.108,0.108],[0.36,-0.116,0.096]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,x1,z1]=fp[i], [y2,x2,z2]=fp[i+1];
      quad(V(x1-0.040,y1,z1), V(x1+0.032,y1,z1), V(x2+0.028,y2,z2), V(x2-0.044,y2,z2), i%2?P.fur:P.furDk, 0.06);
    }
  }

  /* RIGHT PAULDRON (bronze cop on the un-pelt shoulder) */
  {
    const pivot=V(L.shoulderX, L.shldY+0.01, 0.01);
    stack([
      {y:L.shldY-0.01, rx:0.050, rz:0.054, cx:pivot.x, cz:pivot.z, hex:P.leatherDk},
      {y:L.shldY+0.03, rx:0.042, rz:0.044, cx:pivot.x, cz:pivot.z, hex:P.bronze},
    ], 8, {capTop:{hex:P.bronze, lift:0.014}});
  }

  /* ARMS — both fists derive from the axe grips */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const FIST_HI=GRIP_HI.clone();
    const E=S.clone().lerp(FIST_HI, 0.5).add(V(0.03, 0.0, 0.02));
    tube(S,E,0.050,0.040,6,P.skin);
    tube(E,FIST_HI.clone().addScaledVector(AXIS,-0.02),0.038,0.030,6,P.skin);
    tube(FIST_HI.clone().addScaledVector(AXIS,-0.035), FIST_HI.clone().addScaledVector(AXIS,0.035), 0.032,0.028,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const FIST_LO=GRIP_LO.clone();
    const E2=S2.clone().lerp(FIST_LO, 0.5).add(V(0.015, 0.015, 0.015));
    tube(S2,E2,0.048,0.038,6,P.skin);
    tube(E2,FIST_LO.clone().addScaledVector(AXIS,-0.035),0.036,0.030,6,P.skin);
    tube(FIST_LO.clone().addScaledVector(AXIS,-0.035), FIST_LO.clone().addScaledVector(AXIS,0.035), 0.032,0.028,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});
  }

  /* LEGS — wide aggressive stance, BARE oversized feet */
  {
    const hipL=V(-0.092, L.hipY-0.008, 0.008), shinL=V(-0.115,0.185,0.05);
    const hipR=V( 0.092, L.hipY-0.008, 0.006), shinR=V( 0.130,0.185,-0.05);
    tube(hipL,shinL,0.056,0.040,6,P.trouser);
    tube(hipR,shinR,0.056,0.040,6,P.trouser);
    for(const [shin,toeDir] of [[shinL,V(-0.08,0,1)], [shinR,V(0.40,0,0.90).normalize()]]){
      const ankBot=V(shin.x, 0.075, shin.z);
      tube(shin, ankBot, 0.038, 0.058, 6, P.skin);
      stack([
        {y:0.016, rx:0.080, rz:0.098, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.065, rx:0.074, rz:0.086, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.040,shin.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.158), 0.074,0.055,6,P.footpad, {capB:{hex:P.footpad, lift:0.017}, raz:0.064, rbz:0.045});
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
