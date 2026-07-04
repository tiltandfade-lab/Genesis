/* dev/model-qa/creatures/halforc-barbarian.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED half-orc race (race-halforc: heavy/broad frame, gray-green skin, heavy SQUARE jaw with
   pale TUSK nubs, aggressively jutting BROW) wearing the BARBARIAN kit (barbarian.js signature: a
   two-handed GREAT-AXE authored first so BOTH fists derive from the haft, a bare gray-green chest,
   a fur pelt over one shoulder, fur-cuffed boots, a wide aggressive stance). Half-orc barbarian is
   the iconic combo — the tusks + jutting brow + green skin over the bare muscled chest is the read.
   The wild hair mass sits behind the cropped-hair skull. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrcBarbarian(){
  const P = {
    skin:0x7a8a6e, skinDk:0x525e48, skinLt:0x8fa080,
    tusk:0xd8cdae, tuskDk:0xb9ac86,
    fur:0x9b8468, furDk:0x655336, furLt:0xc2b28e,
    trouser:0x5b4230, trouserDk:0x40301f,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    boot:0x3c3226, bootDk:0x2a2118,
    hair:0x2a2420, hairDk:0x1c1815,
    wood:0x5a4326, woodDk:0x3f2f1a,
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xb9bfc4,
    bronze:0x9c7d3e, eye:0x140f0c,
    disc:0x4a4038, discTop:0x585047,
  };

  /* half-orc landmarks (heavy/broad, ~1.52u — from race-halforc.js) */
  const L = {
    hipY:0.735, waistY:0.815, ribY:0.930, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* GREAT-AXE FIRST — massive two-handed haft; both fists derive from it. Head above the skull. */
  const AXE_BUTT = V(-0.06, 0.60, -0.10), AXE_TOP = V(0.235, 1.86, 0.30);
  const AXIS = new THREE.Vector3().subVectors(AXE_TOP, AXE_BUTT).normalize();
  const GRIP_LO = AXE_BUTT.clone().addScaledVector(AXIS, 0.32);
  const GRIP_HI = AXE_BUTT.clone().addScaledVector(AXIS, 0.64);
  {
    tube(AXE_BUTT, AXE_BUTT.clone().addScaledVector(AXIS, 0.10), 0.026, 0.024, 6, P.leatherDk, {capA:{hex:P.bronze, lift:0.02}});
    tube(AXE_BUTT.clone().addScaledVector(AXIS, 0.10), GRIP_LO.clone().addScaledVector(AXIS, -0.09), 0.024, 0.024, 6, P.wood);
    tube(GRIP_LO.clone().addScaledVector(AXIS, -0.09), GRIP_LO.clone().addScaledVector(AXIS, 0.09), 0.026, 0.026, 6, P.leather);
    tube(GRIP_LO.clone().addScaledVector(AXIS, 0.09), GRIP_HI.clone().addScaledVector(AXIS, -0.09), 0.023, 0.022, 6, P.wood);
    tube(GRIP_HI.clone().addScaledVector(AXIS, -0.09), GRIP_HI.clone().addScaledVector(AXIS, 0.09), 0.025, 0.025, 6, P.leather);
    tube(GRIP_HI.clone().addScaledVector(AXIS, 0.09), AXE_TOP.clone().addScaledVector(AXIS, -0.22), 0.022, 0.030, 6, P.wood);
    tube(AXE_TOP.clone().addScaledVector(AXIS, -0.22), AXE_TOP.clone().addScaledVector(AXIS, -0.05), 0.030, 0.052, 6, P.steelDk);
    const up = V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, AXIS).normalize();
    const w = new THREE.Vector3().crossVectors(AXIS, u).normalize();
    const HEAD_C = AXE_TOP.clone().addScaledVector(AXIS, -0.02);
    tube(HEAD_C.clone().addScaledVector(w,-0.038), HEAD_C.clone().addScaledVector(w,0.038), 0.075, 0.075, 8, P.steelDk);
    for(const s of [-1,1]){
      const root = HEAD_C.clone().addScaledVector(u, s*0.06);
      const bandN = 6;
      const innerPts = [], outerPts = [];
      for(let k=0;k<=bandN;k++){
        const t = k/bandN;
        const along = -0.14 + t*0.30;
        const reach = 0.06 + Math.sin(t*Math.PI)*0.30;
        innerPts.push(root.clone().addScaledVector(AXIS, along*0.35).addScaledVector(u, s*reach*0.15));
        outerPts.push(root.clone().addScaledVector(AXIS, along).addScaledVector(u, s*reach));
      }
      for(let k=0;k<bandN;k++){
        const a=innerPts[k], b=innerPts[k+1], c=outerPts[k+1], d=outerPts[k];
        const off = w.clone().multiplyScalar(0.016);
        quad(a.clone().add(off), b.clone().add(off), c.clone().add(off), d.clone().add(off), P.steel, 0.04);
        quad(d.clone().sub(off), c.clone().sub(off), b.clone().sub(off), a.clone().sub(off), P.steel, 0.04);
        quad(d.clone().add(off), c.clone().add(off), c.clone().sub(off), d.clone().sub(off), P.steelLt, 0.02);
      }
    }
  }

  /* trunk — broad bare gray-green chest (half-orc skin), hulking taper */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.180, hex:P.skinDk},
    {y:L.waistY, rx:0.205, rz:0.160, hex:P.skin},
    {y:L.ribY,   rx:0.250, rz:0.185, hex:P.skin},
    {y:L.chestY, rx:0.290, rz:0.200, hex:P.skin},
    {y:L.shldY,  rx:0.305, rz:0.192, hex:P.skin},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.skinDk},   /* thick half-orc neck column */
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});

  /* chest/ab muscle scoring + symmetric pec shadows */
  {
    const rows=[[L.ribY,0.185],[0.985,0.195],[L.chestY,0.200]];
    for(const [y,z] of rows){
      quad(V(-0.035,y-0.008,z), V(0.035,y-0.008,z), V(0.035,y+0.008,z+0.01), V(-0.035,y+0.008,z+0.01), P.skinDk, 0.05);
    }
    for(const s of [-1,1]){
      const cx=s*0.105, cy=L.chestY-0.028, cz=0.198;
      quad(V(cx-0.062,cy-0.014,cz), V(cx+0.062,cy-0.014,cz),
           V(cx+0.054,cy+0.012,cz+0.008), V(cx-0.054,cy+0.012,cz+0.008), P.skinDk, 0.045);
    }
  }

  /* wide leather belt + loincloth skirt */
  stack([
    {y:0.790, rx:0.215, rz:0.165, hex:P.leather},
    {y:0.850, rx:0.212, rz:0.162, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.045,0.796,0.170), V(0.045,0.796,0.170), V(0.045,0.845,0.166), V(-0.045,0.845,0.166), P.bronze, 0.02);
  stack([
    {y:0.475, rx:0.240, rz:0.190, hex:P.trouserDk},
    {y:0.610, rx:0.230, rz:0.180, hex:P.trouser},
    {y:L.hipY, rx:0.225, rz:0.172, hex:P.trouser},
  ], 8, {});

  /* HEAD — inherited half-orc skull (heavy jaw, jutting brow, tusks) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.148, rz:0.126, hex:P.skin},
      {y:L.cheekY, rx:0.140, rz:0.130, hex:P.skin},
      {y:L.browY,  rx:0.132, rz:0.118, hex:P.skin},
      {y:L.crownY, rx:0.108, rz:0.096, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(const i of [1,2]) rings[2][i].z += 0.058;
    for(const i of [0,3]) rings[2][i].z += 0.030;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
    /* eyes REMOVED 2026-07-04 (Adam: "across the board the eyes are in the wrong place so just
       get rid of them"). See dev/model-qa/REFERENCE-DIRECTION.md's dated reversal block. */
    /* tusk nubs */
    for(const s of [-1,1]){
      const bx=s*0.044, by=L.jawY-0.006, bz=0.140;
      const tx=s*0.038, ty=by+0.040, tz=bz+0.032;
      const w=0.020;
      quad(V(bx-w,by-0.008,bz), V(bx+w,by-0.008,bz), V(tx+w*0.3,ty,tz), V(tx-w*0.3,ty,tz), P.tusk, 0.0);
    }
  }

  /* cropped dark hair cap (inherited) + a rough top-knot mane for the barbarian read */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.010, rx:0.136, rz:0.122, hex:P.hairDk},
      {y:L.crownY+0.004,rx:0.112, rz:0.100, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[1,2,3,4,5,6]});
    capFan(rings[1], V(0, L.headTopY+0.010, -0.004), P.hair);
    /* a bound top-knot tuft leaning back (barbarian read) */
    tube(V(0,L.crownY+0.03,-0.02), V(-0.02,L.headTopY+0.12,-0.10), 0.030,0.012,6,P.hairDk,{capB:{hex:P.hairDk}});
  }

  /* FUR PELT — over the LEFT shoulder, hanging front + back (barbarian read) */
  {
    const n=8, ph=Math.PI/n;
    const wrap=[
      {y:L.shldY-0.05, rx:0.170, rz:0.160, cx:-0.155, hex:P.furDk},
      {y:L.shldY+0.06, rx:0.160, rz:0.150, cx:-0.165, hex:P.fur},
      {y:L.shldY+0.14, rx:0.110, rz:0.104, cx:-0.160, hex:P.furLt},
    ].map(b=>ring(V(b.cx,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(wrap, ()=>P.fur);
    capFan(wrap.at(-1), V(-0.160,L.shldY+0.21,0.02), P.furLt);
    const fp=[[L.shldY,-0.155,0.155],[0.98,-0.185,0.185],[0.80,-0.205,0.175],[0.62,-0.205,0.150]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,x1,z1]=fp[i], [y2,x2,z2]=fp[i+1];
      quad(V(x1-0.070,y1,z1), V(x1+0.055,y1,z1), V(x2+0.050,y2,z2), V(x2-0.075,y2,z2), i%2?P.fur:P.furDk, 0.06);
    }
    const bp=[[L.shldY+0.02,-0.16,-0.13],[0.95,-0.19,-0.17],[0.72,-0.20,-0.15]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,x1,z1]=bp[i], [y2,x2,z2]=bp[i+1];
      quad(V(x1+0.070,y1,z1), V(x1-0.055,y1,z1), V(x2-0.050,y2,z2), V(x2+0.075,y2,z2), i%2?P.fur:P.furDk, 0.06);
    }
  }

  /* RIGHT PAULDRON (bronze cop on the un-pelt shoulder) */
  {
    const pivot=V(L.shoulderX, L.shldY+0.01, 0.01);
    stack([
      {y:L.shldY-0.02, rx:0.088, rz:0.092, cx:pivot.x, cz:pivot.z, hex:P.leatherDk},
      {y:L.shldY+0.03, rx:0.070, rz:0.074, cx:pivot.x, cz:pivot.z, hex:P.bronze},
    ], 8, {capTop:{hex:P.bronze, lift:0.02}});
  }

  /* ARMS — both fists derive from the axe grips (gray-green skin) */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const FIST_HI=GRIP_HI.clone();
    const E=S.clone().lerp(FIST_HI, 0.5).add(V(0.05, 0.0, 0.03));
    tube(S,E,0.105,0.082,6,P.skin);
    tube(E,FIST_HI.clone().addScaledVector(AXIS,-0.03),0.078,0.062,6,P.skin);
    tube(FIST_HI.clone().addScaledVector(AXIS,-0.06), FIST_HI.clone().addScaledVector(AXIS,0.06), 0.066,0.060,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const FIST_LO=GRIP_LO.clone();
    const E2=S2.clone().lerp(FIST_LO, 0.5).add(V(0.02, 0.02, 0.02));
    tube(S2,E2,0.100,0.080,6,P.skin);
    tube(E2,FIST_LO.clone().addScaledVector(AXIS,-0.06),0.076,0.062,6,P.skin);
    tube(FIST_LO.clone().addScaledVector(AXIS,-0.06), FIST_LO.clone().addScaledVector(AXIS,0.06), 0.066,0.060,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});
  }

  /* legs — wide aggressive stance, fur boot cuffs */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.270,0.40,0.13), ankL=V(-0.280,0.085,0.09);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.290,0.40,-0.07), ankR=V( 0.305,0.085,-0.14);
    tube(hipL,kneeL,0.112,0.080,6,P.trouser);
    tube(kneeL,ankL,0.074,0.055,6,P.skin);
    tube(hipR,kneeR,0.112,0.080,6,P.trouser);
    tube(kneeR,ankR,0.074,0.055,6,P.skin);
    for(const [ank,toeDir] of [[ankL,V(0.08,0,1)], [ankR,V(0.85,0,0.32).normalize()]]){
      stack([
        {y:0.03,  rx:0.075, rz:0.082, cx:ank.x, cz:ank.z, hex:P.fur},
        {y:0.095, rx:0.068, rz:0.072, cx:ank.x, cz:ank.z, hex:P.furDk},
      ], 6, {capTop:{hex:P.furLt, lift:0.015}});
      stack([
        {y:0.012, rx:0.072, rz:0.078, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.075, rx:0.066, rz:0.068, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capBot:{hex:P.bootDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.062,0.046,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.052, rbz:0.036});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
