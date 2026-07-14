/* dev/model-qa/creatures/dwarf-barbarian.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED dwarf race (race-dwarf.js squat-broad proportions + massive beard + eyeless head) wearing
   the BARBARIAN kit (barbarian.js signature: a two-handed GREAT-AXE authored first so BOTH fists derive
   from the haft, a bare barrel chest, a fur pelt over one shoulder, fur-cuffed boots, a wide aggressive
   stance). Scaled for the short heavy dwarf — the axe head rides just above the (low) skull. Beard is
   inherited verbatim; the dwarf keeps no helm here (a bound top-knot mane reads barbarian). One
   whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDwarfBarbarian(){
  const P = {
    skin:0xb98a63, skinDk:0x7f5f42, skinLt:0xcfa079,
    beard:0x8a6a44, beardDk:0x5f4830,
    fur:0x9b8468, furDk:0x655336, furLt:0xc2b28e,
    trouser:0x5b4230, trouserDk:0x40301f,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    boot:0x3c3226, bootDk:0x2a2118,
    hair:0x6d4b2c, hairDk:0x4a331d,
    wood:0x5a4326, woodDk:0x3f2f1a,
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xb9bfc4,
    bronze:0x9c7d3e, eye:0x140f0c,
    disc:0x4a4038, discTop:0x585047,
  };

  /* dwarf landmarks (short ~1.04u but BROAD) */
  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.245,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* GREAT-AXE FIRST — two-handed haft raised diagonally; both fists derive. Head above the low skull. */
  const AXE_BUTT = V(-0.05, 0.24, -0.09), AXE_TOP = V(0.205, 1.24, 0.28);
  const AXIS = new THREE.Vector3().subVectors(AXE_TOP, AXE_BUTT).normalize();
  const GRIP_LO = AXE_BUTT.clone().addScaledVector(AXIS, 0.30);
  const GRIP_HI = AXE_BUTT.clone().addScaledVector(AXIS, 0.60);
  {
    tube(AXE_BUTT, AXE_BUTT.clone().addScaledVector(AXIS, 0.09), 0.024, 0.022, 6, P.leatherDk, {capA:{hex:P.bronze, lift:0.02}});
    tube(AXE_BUTT.clone().addScaledVector(AXIS, 0.09), GRIP_LO.clone().addScaledVector(AXIS, -0.08), 0.022, 0.022, 6, P.wood);
    tube(GRIP_LO.clone().addScaledVector(AXIS, -0.08), GRIP_LO.clone().addScaledVector(AXIS, 0.08), 0.024, 0.024, 6, P.leather);
    tube(GRIP_LO.clone().addScaledVector(AXIS, 0.08), GRIP_HI.clone().addScaledVector(AXIS, -0.08), 0.021, 0.020, 6, P.wood);
    tube(GRIP_HI.clone().addScaledVector(AXIS, -0.08), GRIP_HI.clone().addScaledVector(AXIS, 0.08), 0.023, 0.023, 6, P.leather);
    tube(GRIP_HI.clone().addScaledVector(AXIS, 0.08), AXE_TOP.clone().addScaledVector(AXIS, -0.19), 0.020, 0.028, 6, P.wood);
    tube(AXE_TOP.clone().addScaledVector(AXIS, -0.19), AXE_TOP.clone().addScaledVector(AXIS, -0.04), 0.028, 0.048, 6, P.steelDk);
    const up = V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, AXIS).normalize();
    const w = new THREE.Vector3().crossVectors(AXIS, u).normalize();
    const HEAD_C = AXE_TOP.clone().addScaledVector(AXIS, -0.02);
    tube(HEAD_C.clone().addScaledVector(w,-0.034), HEAD_C.clone().addScaledVector(w,0.034), 0.068, 0.068, 8, P.steelDk);
    for(const s of [-1,1]){
      const root = HEAD_C.clone().addScaledVector(u, s*0.055);
      const bandN = 6;
      const innerPts = [], outerPts = [];
      for(let k=0;k<=bandN;k++){
        const t = k/bandN;
        const along = -0.13 + t*0.28;
        const reach = 0.055 + Math.sin(t*Math.PI)*0.27;
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

  /* trunk — bare barrel chest (dwarf-broad), muscle scoring */
  stack([
    {y:L.hipY,   rx:0.230, rz:0.178, hex:P.skinDk},
    {y:L.waistY, rx:0.240, rz:0.188, hex:P.skin},
    {y:L.ribY,   rx:0.256, rz:0.198, hex:P.skin},
    {y:L.chestY, rx:0.268, rz:0.204, hex:P.skinLt},
    {y:L.shldY,  rx:0.272, rz:0.196, hex:P.skin},
    {y:L.neckY,  rx:0.120, rz:0.114, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});
  {
    for(const s of [-1,1]){
      const cx=s*0.095, cy=L.chestY-0.024, cz=0.202;
      quad(V(cx-0.056,cy-0.012,cz), V(cx+0.056,cy-0.012,cz),
           V(cx+0.048,cy+0.012,cz+0.008), V(cx-0.048,cy+0.012,cz+0.008), P.skinDk, 0.045);
    }
  }

  /* leather belt + loincloth skirt (broad) */
  stack([
    {y:L.waistY-0.03, rx:0.245, rz:0.192, hex:P.leather},
    {y:L.waistY+0.02, rx:0.243, rz:0.190, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.045,L.waistY-0.026,0.196), V(0.045,L.waistY-0.026,0.196), V(0.045,L.waistY+0.024,0.192), V(-0.045,L.waistY+0.024,0.192), P.bronze, 0.02);
  stack([
    {y:0.28, rx:0.252, rz:0.200, hex:P.trouserDk},
    {y:0.40, rx:0.238, rz:0.186, hex:P.trouser},
  ], 8, {});

  /* HEAD — inherited dwarf skull (eyeless) */
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
    /* eyeless per 2026-07-04 evening ruling */
  }

  /* MASSIVE BEARD wedge (inherited) — a wilder, darker barbarian braid */
  {
    const bands=[
      {y:L.jawY+0.005, rx:0.125, rz:0.095, cz:0.135, hex:P.beard},
      {y:L.cheekY-0.05, rx:0.120, rz:0.088, cz:0.185, hex:P.beard},
      {y:0.735,         rx:0.112, rz:0.080, cz:0.225, hex:P.beard},
      {y:0.665,         rx:0.100, rz:0.070, cz:0.250, hex:P.beardDk},
      {y:0.59,          rx:0.086, rz:0.060, cz:0.260, hex:P.beardDk},
      {y:0.515,         rx:0.062, rz:0.046, cz:0.250, hex:P.beardDk},
      {y:L.waistY+0.01, rx:0.040, rz:0.030, cz:0.215, hex:P.beardDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.waistY-0.03,0.185), P.beardDk);
  }

  /* WILD TOP-KNOT MANE (barbarian read, no helm) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.010, rx:0.136, rz:0.122, hex:P.hairDk},
      {y:L.crownY+0.004,rx:0.110, rz:0.098, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[1,2,3,4,5,6]});
    capFan(rings[1], V(0, L.headTopY+0.010, -0.004), P.hair);
    tube(V(0,L.crownY+0.03,-0.02), V(-0.02,L.headTopY+0.15,-0.12), 0.032,0.012,6,P.hairDk,{capB:{hex:P.hairDk}});
  }

  /* FUR PELT — over the LEFT shoulder (barbarian read) */
  {
    const n=8, ph=Math.PI/n;
    const wrap=[
      {y:L.shldY-0.05, rx:0.150, rz:0.142, cx:-0.140, hex:P.furDk},
      {y:L.shldY+0.05, rx:0.140, rz:0.132, cx:-0.150, hex:P.fur},
      {y:L.shldY+0.12, rx:0.098, rz:0.092, cx:-0.145, hex:P.furLt},
    ].map(b=>ring(V(b.cx,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(wrap, ()=>P.fur);
    capFan(wrap.at(-1), V(-0.145,L.shldY+0.18,0.02), P.furLt);
    const fp=[[L.shldY,-0.140,0.150],[0.62,-0.170,0.180],[0.50,-0.185,0.168],[0.40,-0.185,0.145]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,x1,z1]=fp[i], [y2,x2,z2]=fp[i+1];
      quad(V(x1-0.062,y1,z1), V(x1+0.050,y1,z1), V(x2+0.046,y2,z2), V(x2-0.066,y2,z2), i%2?P.fur:P.furDk, 0.06);
    }
  }

  /* RIGHT PAULDRON (bronze cop on the un-pelt shoulder) */
  {
    const pivot=V(L.shoulderX, L.shldY+0.01, 0.01);
    stack([
      {y:L.shldY-0.02, rx:0.080, rz:0.084, cx:pivot.x, cz:pivot.z, hex:P.leatherDk},
      {y:L.shldY+0.03, rx:0.064, rz:0.068, cx:pivot.x, cz:pivot.z, hex:P.bronze},
    ], 8, {capTop:{hex:P.bronze, lift:0.02}});
  }

  /* ARMS — both fists derive from the axe grips */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const FIST_HI=GRIP_HI.clone();
    const E=S.clone().lerp(FIST_HI, 0.5).add(V(0.05, 0.0, 0.03));
    tube(S,E,0.100,0.080,6,P.skin);
    tube(E,FIST_HI.clone().addScaledVector(AXIS,-0.03),0.076,0.060,6,P.skin);
    tube(FIST_HI.clone().addScaledVector(AXIS,-0.06), FIST_HI.clone().addScaledVector(AXIS,0.06), 0.064,0.058,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const FIST_LO=GRIP_LO.clone();
    const E2=S2.clone().lerp(FIST_LO, 0.5).add(V(0.02, 0.02, 0.02));
    tube(S2,E2,0.096,0.078,6,P.skin);
    tube(E2,FIST_LO.clone().addScaledVector(AXIS,-0.06),0.074,0.060,6,P.skin);
    tube(FIST_LO.clone().addScaledVector(AXIS,-0.06), FIST_LO.clone().addScaledVector(AXIS,0.06), 0.064,0.058,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});
  }

  /* LEGS — short, thick, wide-braced, fur boot cuffs */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), ankL=V(-0.195,0.085,0.06);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), ankR=V( 0.205,0.085,-0.06);
    tube(hipL,ankL,0.100,0.074,6,P.trouser);
    tube(hipR,ankR,0.100,0.074,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(-0.10,0,1)], [ankR,V(0.40,0,0.90).normalize()]]){
      stack([
        {y:0.03,  rx:0.076, rz:0.084, cx:ank.x, cz:ank.z, hex:P.fur},
        {y:0.095, rx:0.070, rz:0.074, cx:ank.x, cz:ank.z, hex:P.furDk},
      ], 6, {capTop:{hex:P.furLt, lift:0.015}});
      stack([
        {y:0.012, rx:0.074, rz:0.080, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.075, rx:0.068, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capBot:{hex:P.bootDk, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.066,0.048,6,P.boot, {capB:{hex:P.boot, lift:0.016}, raz:0.056, rbz:0.040});
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
