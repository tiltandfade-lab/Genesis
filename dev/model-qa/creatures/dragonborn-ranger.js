/* dev/model-qa/creatures/dragonborn-ranger.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the RANGER kit (ranger.js
   signature: a single C-arc LONGBOW at FULL DRAW — curved stave + STRAIGHT string chord connecting
   exactly at both tips, drawn to a deep V, a nocked arrow forward through the grip, a back QUIVER, a
   shoulder half-cape). The hood is left OFF so the muzzle + horns read; a draconic hunter. EYELESS.
   One whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornRanger(){
  const P = {
    leather:0x5a4530, leatherDk:0x3f3020, leatherLt:0x6e5640,
    cloak:0x3f4a34, cloakDk:0x2c3524,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a,
    trouser:0x463c2c, boot:0x2e2418, bootDk:0x211a11,
    wood:0x6b4f2e, woodDk:0x4a3620, string:0xd8cdb0,
    fletch:0xc9c2a8, fletchDk:0x8f8870, shaft:0x8a6a42, arrowhead:0x8d949a,
    strap:0x2a2119, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* torso (leathers over scale, broad dragonborn) */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.170, hex:P.leatherDk},
    {y:L.waistY, rx:0.190, rz:0.148, hex:P.leather},
    {y:L.ribY,   rx:0.230, rz:0.172, hex:P.leather},
    {y:L.chestY, rx:0.268, rz:0.188, hex:P.leatherLt},
    {y:L.shldY,  rx:0.278, rz:0.180, hex:P.leather},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.006}});
  stack([
    {y:L.waistY-0.020, rx:0.194, rz:0.152, hex:P.leatherDk},
    {y:L.waistY+0.020, rx:0.191, rz:0.149, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.035,L.waistY-0.010,0.156), V(0.035,L.waistY-0.010,0.156), V(0.035,L.waistY+0.032,0.152), V(-0.035,L.waistY+0.032,0.152), P.brass, 0.02);
  stack([
    {y:0.55, rx:0.235, rz:0.185, hex:P.leatherDk},
    {y:0.69, rx:0.215, rz:0.165, hex:P.leather},
  ], 8, {});

  /* short half-cape shoulder mantle (hood OFF so muzzle+horns read) */
  stack([
    {y:L.shldY+0.03, rx:0.300, rz:0.220, cz:-0.03, hex:P.cloakDk},
    {y:L.shldY-0.06, rx:0.275, rz:0.205, cz:-0.05, hex:P.cloak},
    {y:0.90,         rx:0.220, rz:0.170, cz:-0.06, hex:P.cloak},
    {y:0.74,         rx:0.165, rz:0.132, cz:-0.05, hex:P.cloakDk},
  ], 8, {});

  /* HEAD — inherited dragonborn skull (muzzle, horn stubs). EYELESS. */
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

  /* LONGBOW at FULL DRAW — single C-arc + straight string chord tip-to-tip drawn to a V */
  const BOW_YAW = 26 * Math.PI/180;
  const BOW_PIVOT = V(0.395, 0.985, 0.500);
  const BOW_FWD = 0.075;
  function bowXform(p){
    const rel = p.clone().sub(BOW_PIVOT);
    const cs = Math.cos(BOW_YAW), sn = Math.sin(BOW_YAW);
    const rx = rel.x*cs + rel.z*sn, rz = -rel.x*sn + rel.z*cs;
    return V(BOW_PIVOT.x + rx, p.y, BOW_PIVOT.z + rz + BOW_FWD);
  }
  const ARC_X = 0.395, Y_BOT = 0.32, Y_TOP = 1.72;
  const Z_CHORD = 0.445, Z_BELLY = 0.630;
  function arcPt(t){
    const y = Y_BOT + (Y_TOP - Y_BOT)*t;
    const bulge = 4*t*(1-t);
    const z = Z_CHORD + (Z_BELLY - Z_CHORD)*bulge;
    const x = ARC_X + 0.03*bulge;
    return bowXform(V(x, y, z));
  }
  const SEG = 6;
  const arc = []; for(let i=0;i<=SEG;i++) arc.push(arcPt(i/SEG));
  const BOW_BOT = arc[0], BOW_TOP = arc[SEG];
  const GRIP = arcPt(0.5);
  const ANCHOR = V(0.185, L.jawY - 0.02, 0.080);
  {
    for(let i=0;i<SEG;i++){
      const a = arc[i], b = arc[i+1];
      const tA = i/SEG, tB = (i+1)/SEG;
      const rA = 0.015 + 0.017*(4*tA*(1-tA));
      const rB = 0.015 + 0.017*(4*tB*(1-tB));
      const capO = {};
      if(i===0) capO.capA = {hex:P.woodDk};
      if(i===SEG-1) capO.capB = {hex:P.woodDk};
      tube(a, b, rA, rB, 7, i%2? P.woodDk : P.wood, capO);
    }
    tube(arcPt(0.42), arcPt(0.58), 0.036, 0.036, 8, P.leatherDk);
    tube(BOW_TOP, ANCHOR, 0.009, 0.009, 5, P.string);
    tube(BOW_BOT, ANCHOR, 0.009, 0.009, 5, P.string);
    const DIR = new THREE.Vector3().subVectors(GRIP, ANCHOR).normalize();
    const ARROW_TAIL = ANCHOR.clone().addScaledVector(DIR, -0.010);
    const ARROW_HEAD_TIP = ANCHOR.clone().addScaledVector(DIR, GRIP.clone().sub(ANCHOR).length() + 0.36);
    tube(ANCHOR.clone().addScaledVector(DIR,-0.020), ANCHOR.clone().addScaledVector(DIR,0.020), 0.018,0.015,6,P.string);
    tube(ARROW_TAIL, ARROW_HEAD_TIP.clone().addScaledVector(DIR,-0.045), 0.010,0.010,6,P.shaft);
    tube(ARROW_HEAD_TIP.clone().addScaledVector(DIR,-0.045), ARROW_HEAD_TIP, 0.012,0.002,6,P.arrowhead,{capB:{hex:P.arrowhead}});
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2;
      const up=Math.abs(DIR.y)>0.9?V(0,0,1):V(0,1,0);
      const u=new THREE.Vector3().crossVectors(up,DIR).normalize(), w=new THREE.Vector3().crossVectors(DIR,u).normalize();
      const d=u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a));
      const base=ARROW_TAIL.clone().addScaledVector(DIR,0.055);
      const tip=ARROW_TAIL.clone();
      quad(base, base.clone().addScaledVector(d,0.028), tip.clone().addScaledVector(d,0.014), tip, P.fletchDk, 0.04);
    }
  }

  /* QUIVER — angled on the back */
  const QUIV_BASE=V(-0.15,0.84,-0.150), QUIV_MOUTH=V(-0.265,1.34,-0.02);
  {
    tube(QUIV_BASE, QUIV_MOUTH, 0.078, 0.092, 8, P.leatherDk, {capA:{hex:P.leatherDk}});
    stack([{y:0, rx:0.094,rz:0.094, cx:QUIV_MOUTH.x, cz:QUIV_MOUTH.z, hex:P.leather}], 8, {xform:p=>p.clone().add(V(0, QUIV_MOUTH.y, 0))});
    tube(V(0.16,L.shldY+0.02,0.10), QUIV_MOUTH.clone().add(V(0,0.02,0.04)), 0.020,0.018,5,P.strap);
    const qdir=new THREE.Vector3().subVectors(QUIV_MOUTH,QUIV_BASE).normalize();
    for(let k=0;k<5;k++){
      const t=(k-2)*0.028, s=(k-2)*0.02;
      const base=QUIV_MOUTH.clone().add(V(t*1.1, 0, s*0.6));
      const tip=base.clone().addScaledVector(qdir,0.30).add(V(t*0.4,0,s*0.3));
      tube(base, tip, 0.010,0.010,5,P.shaft);
      for(const side of [-1,1]){
        const u=V(1,0,0);
        const flareBase=tip.clone().addScaledVector(qdir,-0.06);
        quad(flareBase, flareBase.clone().add(u.clone().multiplyScalar(side*0.02)).add(V(0,0.02,0)),
             tip.clone().add(u.clone().multiplyScalar(side*0.010)), tip, P.fletch, 0.05);
      }
    }
  }

  /* ARMS — FULL DRAW: left (bow) arm forward to GRIP; right (draw) arm back to ANCHOR */
  {
    const S=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.55).add(V(0.02,-0.01,0.06));
    tube(S,E,0.100,0.078,6,P.leather);
    tube(E,GRIP,0.074,0.058,6,P.leatherLt,{capB:{hex:P.scale}});
    tube(GRIP.clone().add(V(0,-0.050,0)), GRIP.clone().add(V(0,0.050,0)), 0.060,0.054,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});

    const S2=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(0.465, 1.185, -0.155);
    tube(S2,E2,0.100,0.078,6,P.leather);
    tube(E2,ANCHOR,0.074,0.058,6,P.leatherLt,{capB:{hex:P.scale}});
    const HDIR=new THREE.Vector3().subVectors(ANCHOR,E2).normalize();
    tube(ANCHOR.clone().addScaledVector(HDIR,-0.050), ANCHOR.clone().addScaledVector(HDIR,0.050), 0.056,0.050,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});
  }

  /* LEGS — open staggered archer's stance, high boots (broad dragonborn) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.205,0.42,0.140), shinL=V(-0.210,0.285,0.130), ankL=V(-0.220,0.085,0.120);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.235,0.42,-0.120), shinR=V(0.245,0.285,-0.145), ankR=V( 0.255,0.085,-0.165);
    tube(hipL,kneeL,0.110,0.078,6,P.trouser);
    tube(kneeL,shinL,0.072,0.066,6,P.trouser);
    tube(hipR,kneeR,0.110,0.078,6,P.trouser);
    tube(kneeR,shinR,0.072,0.066,6,P.trouser);
    for(const [shin,ank,toeDir] of [[shinL,ankL,V(0.06,0,1)], [shinR,ankR,V(0.82,0,0.32).normalize()]]){
      tube(ank, shin.clone().add(V(0,0.10,0)), 0.076,0.066,7,P.boot, {capB:{hex:P.bootDk, lift:0.01}});
      stack([
        {y:0.012, rx:0.080, rz:0.086, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.09,  rx:0.072, rz:0.074, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capBot:{hex:P.bootDk, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.150), 0.064,0.048,6,P.boot, {capB:{hex:P.bootDk, lift:0.015}, raz:0.056, rbz:0.038});
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
