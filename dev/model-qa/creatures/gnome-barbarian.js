/* dev/model-qa/creatures/gnome-barbarian.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED gnome race (post-F1 big head + wedge EARS + eyeless, stubby frame) wearing the BARBARIAN
   kit (barbarian.js signature: a two-handed AXE authored first so BOTH fists derive from the haft, a
   bare chest, a fur pelt over one shoulder, fur boot cuffs, a wide aggressive stance). A pint-sized
   gnome barbarian — the oversized head + ears keep the race read over the war-fury. One whole-object
   function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnomeBarbarian(){
  const P = {
    skin:0xcf9f78, skinDk:0x93714f, skinLt:0xe0b48a, ear:0xc08a5e, eye:0x1a1512,
    fur:0x9b8468, furDk:0x655336, furLt:0xc2b28e,
    trouser:0x5b4230, trouserDk:0x40301f,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    boot:0x3c3226, bootDk:0x2a2118,
    hair:0x6d4b2c, hairDk:0x4a331d,
    wood:0x5a4326, woodDk:0x3f2f1a,
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xb9bfc4,
    bronze:0x9c7d3e, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.335, waistY:0.375, ribY:0.435, chestY:0.465, shldY:0.485, neckY:0.515,
    hipHalf:0.115, shoulderX:0.155,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* AXE FIRST — two-handed haft raised diagonally; both fists derive. Head above the big skull. */
  const AXE_BUTT = V(-0.04, 0.20, -0.07), AXE_TOP = V(0.165, 1.02, 0.22);
  const AXIS = new THREE.Vector3().subVectors(AXE_TOP, AXE_BUTT).normalize();
  const GRIP_LO = AXE_BUTT.clone().addScaledVector(AXIS, 0.26);
  const GRIP_HI = AXE_BUTT.clone().addScaledVector(AXIS, 0.50);
  {
    tube(AXE_BUTT, AXE_BUTT.clone().addScaledVector(AXIS, 0.07), 0.018, 0.017, 6, P.leatherDk, {capA:{hex:P.bronze, lift:0.016}});
    tube(AXE_BUTT.clone().addScaledVector(AXIS, 0.07), GRIP_LO.clone().addScaledVector(AXIS, -0.06), 0.017, 0.017, 6, P.wood);
    tube(GRIP_LO.clone().addScaledVector(AXIS, -0.06), GRIP_LO.clone().addScaledVector(AXIS, 0.06), 0.019, 0.019, 6, P.leather);
    tube(GRIP_LO.clone().addScaledVector(AXIS, 0.06), GRIP_HI.clone().addScaledVector(AXIS, -0.06), 0.016, 0.015, 6, P.wood);
    tube(GRIP_HI.clone().addScaledVector(AXIS, -0.06), GRIP_HI.clone().addScaledVector(AXIS, 0.06), 0.018, 0.018, 6, P.leather);
    tube(GRIP_HI.clone().addScaledVector(AXIS, 0.06), AXE_TOP.clone().addScaledVector(AXIS, -0.14), 0.015, 0.022, 6, P.wood);
    tube(AXE_TOP.clone().addScaledVector(AXIS, -0.14), AXE_TOP.clone().addScaledVector(AXIS, -0.03), 0.022, 0.038, 6, P.steelDk);
    const up = V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, AXIS).normalize();
    const w = new THREE.Vector3().crossVectors(AXIS, u).normalize();
    const HEAD_C = AXE_TOP.clone().addScaledVector(AXIS, -0.015);
    tube(HEAD_C.clone().addScaledVector(w,-0.028), HEAD_C.clone().addScaledVector(w,0.028), 0.055, 0.055, 8, P.steelDk);
    const s=1;
    const root = HEAD_C.clone().addScaledVector(u, s*0.045);
    const bandN = 6;
    const innerPts = [], outerPts = [];
    for(let k=0;k<=bandN;k++){
      const t = k/bandN;
      const along = -0.10 + t*0.22;
      const reach = 0.045 + Math.sin(t*Math.PI)*0.22;
      innerPts.push(root.clone().addScaledVector(AXIS, along*0.35).addScaledVector(u, s*reach*0.15));
      outerPts.push(root.clone().addScaledVector(AXIS, along).addScaledVector(u, s*reach));
    }
    for(let k=0;k<bandN;k++){
      const a=innerPts[k], b=innerPts[k+1], c=outerPts[k+1], d=outerPts[k];
      const off = w.clone().multiplyScalar(0.013);
      quad(a.clone().add(off), b.clone().add(off), c.clone().add(off), d.clone().add(off), P.steel, 0.04);
      quad(d.clone().sub(off), c.clone().sub(off), b.clone().sub(off), a.clone().sub(off), P.steel, 0.04);
      quad(d.clone().add(off), c.clone().add(off), c.clone().sub(off), d.clone().sub(off), P.steelLt, 0.02);
    }
  }

  /* trunk — bare gnome chest, stubby pot-belly barbarian */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.128, hex:P.skinDk},
    {y:L.waistY, rx:0.172, rz:0.148, hex:P.skin},
    {y:L.ribY,   rx:0.160, rz:0.134, hex:P.skin},
    {y:L.chestY, rx:0.156, rz:0.128, hex:P.skinLt},
    {y:L.shldY,  rx:0.152, rz:0.122, hex:P.skin},
    {y:L.neckY,  rx:0.076, rz:0.070, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  {
    for(const s of [-1,1]){
      const cx=s*0.060, cy=L.chestY-0.010, cz=0.130;
      quad(V(cx-0.036,cy-0.008,cz), V(cx+0.036,cy-0.008,cz),
           V(cx+0.030,cy+0.008,cz+0.006), V(cx-0.030,cy+0.008,cz+0.006), P.skinDk, 0.045);
    }
  }
  /* leather belt + loincloth */
  stack([
    {y:L.waistY-0.02, rx:0.174, rz:0.148, hex:P.leather},
    {y:L.waistY+0.012, rx:0.172, rz:0.146, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.024,L.waistY-0.010,0.150), V(0.024,L.waistY-0.010,0.150), V(0.024,L.waistY+0.014,0.146), V(-0.024,L.waistY+0.014,0.146), P.bronze, 0.02);
  stack([
    {y:0.24, rx:0.180, rz:0.152, hex:P.trouserDk},
    {y:0.32, rx:0.168, rz:0.140, hex:P.trouser},
  ], 8, {});

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

  /* WILD TOP-KNOT MANE (barbarian read) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.010, rx:0.140, rz:0.128, hex:P.hairDk},
      {y:L.crownY+0.004,rx:0.108, rz:0.098, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[1,2,3,4,5,6]});
    capFan(rings[1], V(0, L.headTopY+0.010, -0.004), P.hair);
    tube(V(0,L.crownY+0.02,-0.02), V(-0.015,L.headTopY+0.11,-0.09), 0.024,0.010,6,P.hairDk,{capB:{hex:P.hairDk}});
  }

  /* FUR PELT — over the LEFT shoulder */
  {
    const n=8, ph=Math.PI/n;
    const wrap=[
      {y:L.shldY-0.03, rx:0.098, rz:0.092, cx:-0.100, hex:P.furDk},
      {y:L.shldY+0.03, rx:0.090, rz:0.084, cx:-0.106, hex:P.fur},
      {y:L.shldY+0.08, rx:0.064, rz:0.060, cx:-0.100, hex:P.furLt},
    ].map(b=>ring(V(b.cx,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(wrap, ()=>P.fur);
    capFan(wrap.at(-1), V(-0.100,L.shldY+0.12,0.02), P.furLt);
    const fp=[[L.shldY,-0.100,0.100],[0.40,-0.120,0.120],[0.32,-0.130,0.108]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,x1,z1]=fp[i], [y2,x2,z2]=fp[i+1];
      quad(V(x1-0.044,y1,z1), V(x1+0.036,y1,z1), V(x2+0.032,y2,z2), V(x2-0.048,y2,z2), i%2?P.fur:P.furDk, 0.06);
    }
  }

  /* RIGHT PAULDRON (bronze cop on the un-pelt shoulder) */
  {
    const pivot=V(L.shoulderX, L.shldY+0.01, 0.01);
    stack([
      {y:L.shldY-0.01, rx:0.056, rz:0.060, cx:pivot.x, cz:pivot.z, hex:P.leatherDk},
      {y:L.shldY+0.03, rx:0.046, rz:0.048, cx:pivot.x, cz:pivot.z, hex:P.bronze},
    ], 8, {capTop:{hex:P.bronze, lift:0.016}});
  }

  /* ARMS — both fists derive from the axe grips */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const FIST_HI=GRIP_HI.clone();
    const E=S.clone().lerp(FIST_HI, 0.5).add(V(0.03, 0.0, 0.02));
    tube(S,E,0.060,0.048,6,P.skin);
    tube(E,FIST_HI.clone().addScaledVector(AXIS,-0.02),0.046,0.036,6,P.skin);
    tube(FIST_HI.clone().addScaledVector(AXIS,-0.04), FIST_HI.clone().addScaledVector(AXIS,0.04), 0.038,0.034,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const FIST_LO=GRIP_LO.clone();
    const E2=S2.clone().lerp(FIST_LO, 0.5).add(V(0.015, 0.015, 0.015));
    tube(S2,E2,0.058,0.046,6,P.skin);
    tube(E2,FIST_LO.clone().addScaledVector(AXIS,-0.04),0.044,0.036,6,P.skin);
    tube(FIST_LO.clone().addScaledVector(AXIS,-0.04), FIST_LO.clone().addScaledVector(AXIS,0.04), 0.038,0.034,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});
  }

  /* LEGS — wide aggressive stance, fur boot cuffs */
  {
    const hipL=V(-0.108, L.hipY-0.01, 0.01), ankL=V(-0.155,0.075,0.05);
    const hipR=V( 0.108, L.hipY-0.01, 0.00), ankR=V( 0.165,0.075,-0.05);
    tube(hipL,ankL,0.062,0.046,6,P.trouser);
    tube(hipR,ankR,0.062,0.046,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(-0.08,0,1)], [ankR,V(0.40,0,0.90).normalize()]]){
      stack([
        {y:0.03,  rx:0.058, rz:0.064, cx:ank.x, cz:ank.z, hex:P.fur},
        {y:0.075, rx:0.052, rz:0.056, cx:ank.x, cz:ank.z, hex:P.furDk},
      ], 6, {capTop:{hex:P.furLt, lift:0.012}});
      stack([
        {y:0.010, rx:0.056, rz:0.060, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.06,  rx:0.050, rz:0.052, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capBot:{hex:P.bootDk, lift:0.0}});
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
