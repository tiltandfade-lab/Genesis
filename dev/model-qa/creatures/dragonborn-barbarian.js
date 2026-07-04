/* dev/model-qa/creatures/dragonborn-barbarian.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the BARBARIAN kit (barbarian.js
   signature: a two-handed GREAT-AXE authored first so BOTH fists derive from the haft, a bare scaled
   chest with dark accent scoring, a fur pelt over one shoulder, a wide aggressive stance). A draconic
   reaver; the muzzle + horns + tail carry the race over the bare rust chest. EYELESS. One whole-object
   function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornBarbarian(){
  const P = {
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a,
    fur:0x9b8468, furDk:0x655336, furLt:0xc2b28e,
    trouser:0x554a34, trouserDk:0x3d3525,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    boot:0x3c3226, bootDk:0x2a2118,
    wood:0x5a4326, woodDk:0x3f2f1a,
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xb9bfc4, bronze:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* GREAT-AXE FIRST — two-handed haft; both fists derive from it */
  const AXE_BUTT = V(-0.06, 0.62, -0.10), AXE_TOP = V(0.235, 1.90, 0.30);
  const AXIS = new THREE.Vector3().subVectors(AXE_TOP, AXE_BUTT).normalize();
  const GRIP_LO = AXE_BUTT.clone().addScaledVector(AXIS, 0.34);
  const GRIP_HI = AXE_BUTT.clone().addScaledVector(AXIS, 0.66);
  {
    tube(AXE_BUTT, AXE_BUTT.clone().addScaledVector(AXIS, 0.10), 0.026,0.024,6, P.leatherDk, {capA:{hex:P.bronze, lift:0.02}});
    tube(AXE_BUTT.clone().addScaledVector(AXIS, 0.10), GRIP_LO.clone().addScaledVector(AXIS, -0.09), 0.024,0.024,6, P.wood);
    tube(GRIP_LO.clone().addScaledVector(AXIS, -0.09), GRIP_LO.clone().addScaledVector(AXIS, 0.09), 0.026,0.026,6, P.leather);
    tube(GRIP_LO.clone().addScaledVector(AXIS, 0.09), GRIP_HI.clone().addScaledVector(AXIS, -0.09), 0.023,0.022,6, P.wood);
    tube(GRIP_HI.clone().addScaledVector(AXIS, -0.09), GRIP_HI.clone().addScaledVector(AXIS, 0.09), 0.025,0.025,6, P.leather);
    tube(GRIP_HI.clone().addScaledVector(AXIS, 0.09), AXE_TOP.clone().addScaledVector(AXIS, -0.22), 0.022,0.030,6, P.wood);
    tube(AXE_TOP.clone().addScaledVector(AXIS, -0.22), AXE_TOP.clone().addScaledVector(AXIS, -0.05), 0.030,0.052,6, P.steelDk);
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

  /* trunk — bare rust-scale chest with dark accent scoring (broad dragonborn) */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.170, hex:P.scaleDk},
    {y:L.waistY, rx:0.190, rz:0.148, hex:P.scale},
    {y:L.ribY,   rx:0.230, rz:0.172, hex:P.scale},
    {y:L.chestY, rx:0.268, rz:0.188, hex:P.scale},
    {y:L.shldY,  rx:0.278, rz:0.180, hex:P.scale},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.006}});
  {
    /* belly-toned scale plates + dark pec scoring */
    const rows=[[L.ribY,0.172],[1.005,0.182],[L.chestY,0.188]];
    for(const [y,z] of rows){
      quad(V(-0.058,y-0.008,z), V(0.058,y-0.008,z), V(0.052,y+0.008,z+0.01), V(-0.052,y+0.008,z+0.01), P.scaleBelly, 0.05);
    }
    for(const s of [-1,1]){
      const cx=s*0.095, cy=L.chestY-0.026, cz=0.186;
      quad(V(cx-0.056,cy-0.013,cz), V(cx+0.056,cy-0.013,cz),
           V(cx+0.048,cy+0.011,cz+0.008), V(cx-0.048,cy+0.011,cz+0.008), P.scaleDk, 0.045);
    }
  }

  /* belt + loincloth */
  stack([
    {y:0.805, rx:0.196, rz:0.152, hex:P.leather},
    {y:0.860, rx:0.193, rz:0.150, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.045,0.812,0.156), V(0.045,0.812,0.156), V(0.045,0.855,0.152), V(-0.045,0.855,0.152), P.bronze, 0.02);
  stack([
    {y:0.48, rx:0.225, rz:0.178, hex:P.trouserDk},
    {y:0.62, rx:0.215, rz:0.168, hex:P.trouser},
    {y:L.hipY, rx:0.210, rz:0.160, hex:P.trouser},
  ], 8, {});

  /* HEAD — inherited dragonborn reptilian skull (muzzle, horn stubs). EYELESS. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.100, rz:0.098, hex:P.scale},
      {y:L.muzzleY, rx:0.118, rz:0.116, hex:P.scale},
      {y:L.browY,   rx:0.122, rz:0.108, hex:P.scale},
      {y:L.crownY,  rx:0.098, rz:0.086, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.010; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.004), P.scaleDk);
    const muzBase = V(0, L.muzzleY-0.01, 0.118);
    const muzMid  = V(0, L.muzzleY-0.030, 0.186);
    const muzTip  = V(0, L.muzzleY-0.050, 0.238);
    tube(muzBase, muzMid, 0.112, 0.094, n, P.scale, {raz:0.100, rbz:0.086, phase:ph});
    tube(muzMid, muzTip, 0.094, 0.066, n, P.scaleLt, {raz:0.086, rbz:0.060, phase:ph, capB:{hex:P.scaleDk, lift:0.014}});
    quad(V(-0.058,L.muzzleY-0.070,0.128), V(0.058,L.muzzleY-0.070,0.128),
         V(0.036,L.muzzleY-0.086,0.224), V(-0.036,L.muzzleY-0.086,0.224), P.scaleBelly, 0.05);
    for(const s of [-1,1]){
      const hb = V(s*0.072, L.crownY-0.015, -0.020);
      const ht = V(s*0.098, L.crownY+0.075, -0.115);
      tube(hb, ht, 0.032, 0.012, 6, P.horn, {capB:{hex:P.hornTip, lift:0.008}});
    }
  }

  /* FUR PELT — over the LEFT shoulder */
  {
    const n=8, ph=Math.PI/n;
    const wrap=[
      {y:L.shldY-0.05, rx:0.160, rz:0.150, cx:-0.150, hex:P.furDk},
      {y:L.shldY+0.06, rx:0.150, rz:0.140, cx:-0.160, hex:P.fur},
      {y:L.shldY+0.14, rx:0.104, rz:0.098, cx:-0.155, hex:P.furLt},
    ].map(b=>ring(V(b.cx,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(wrap, ()=>P.fur);
    capFan(wrap.at(-1), V(-0.155,L.shldY+0.21,0.02), P.furLt);
    const fp=[[L.shldY,-0.150,0.150],[1.00,-0.180,0.180],[0.82,-0.200,0.170],[0.64,-0.200,0.145]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,x1,z1]=fp[i], [y2,x2,z2]=fp[i+1];
      quad(V(x1-0.065,y1,z1), V(x1+0.050,y1,z1), V(x2+0.045,y2,z2), V(x2-0.070,y2,z2), i%2?P.fur:P.furDk, 0.06);
    }
  }

  /* RIGHT PAULDRON (bronze cop on the un-pelt shoulder) */
  {
    const pivot=V(L.shoulderX, L.shldY+0.01, 0.01);
    stack([
      {y:L.shldY-0.02, rx:0.086, rz:0.090, cx:pivot.x, cz:pivot.z, hex:P.leatherDk},
      {y:L.shldY+0.03, rx:0.068, rz:0.072, cx:pivot.x, cz:pivot.z, hex:P.bronze},
    ], 8, {capTop:{hex:P.bronze, lift:0.02}});
  }

  /* ARMS — both fists derive from the axe grips (scale skin) */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const FIST_HI=GRIP_HI.clone();
    const E=S.clone().lerp(FIST_HI, 0.5).add(V(0.05, 0.0, 0.03));
    tube(S,E,0.100,0.078,6,P.scale);
    tube(E,FIST_HI.clone().addScaledVector(AXIS,-0.03),0.074,0.058,6,P.scale);
    tube(FIST_HI.clone().addScaledVector(AXIS,-0.06), FIST_HI.clone().addScaledVector(AXIS,0.06), 0.062,0.056,6,P.scale,
         {capA:{hex:P.scale}, capB:{hex:P.scale}});

    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const FIST_LO=GRIP_LO.clone();
    const E2=S2.clone().lerp(FIST_LO, 0.5).add(V(0.02, 0.02, 0.02));
    tube(S2,E2,0.096,0.076,6,P.scale);
    tube(E2,FIST_LO.clone().addScaledVector(AXIS,-0.06),0.072,0.058,6,P.scale);
    tube(FIST_LO.clone().addScaledVector(AXIS,-0.06), FIST_LO.clone().addScaledVector(AXIS,0.06), 0.062,0.056,6,P.scale,
         {capA:{hex:P.scale}, capB:{hex:P.scale}});
  }

  /* legs — wide aggressive stance, fur boot cuffs (broad dragonborn) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.270,0.40,0.13), ankL=V(-0.280,0.085,0.09);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.290,0.40,-0.07), ankR=V( 0.305,0.085,-0.14);
    tube(hipL,kneeL,0.112,0.080,6,P.trouser);
    tube(kneeL,ankL,0.074,0.055,6,P.scale);
    tube(hipR,kneeR,0.112,0.080,6,P.trouser);
    tube(kneeR,ankR,0.074,0.055,6,P.scale);
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

  /* TAIL — thick tapering dragonborn tail (inherited) */
  {
    const root = V(0.04, L.hipY-0.14, -0.245);
    const t1   = V(0.230,0.545, -0.320);
    const t2   = V(0.360,0.400, -0.360);
    const t3   = V(0.445,0.270, -0.360);
    const t4   = V(0.470,0.165, -0.320);
    const tip  = V(0.470,0.115, -0.255);
    tube(root, t1, 0.112, 0.092, 8, P.scale,   {phase:Math.PI/8});
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
