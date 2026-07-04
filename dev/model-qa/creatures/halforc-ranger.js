/* dev/model-qa/creatures/halforc-ranger.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED half-orc race (heavy/broad frame, gray-green skin, heavy jaw + tusk nubs + jutting brow)
   wearing the RANGER kit (ranger.js signature: a single C-arc LONGBOW authored first at FULL DRAW —
   a smooth curved stave + STRAIGHT string chord connecting exactly at both tips, drawn to a deep V,
   a nocked arrow running forward through the grip, a back QUIVER, a hooded half-cloak). A big orcish
   hunter drawn to full anchor; the tusks + brow keep the race read under the hood. EYELESS. One
   whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrcRanger(){
  const P = {
    leather:0x5a4530, leatherDk:0x3f3020, leatherLt:0x6e5640,
    cloak:0x3f4a34, cloakDk:0x2c3524,
    skin:0x7a8a6e, skinDk:0x525e48, skinLt:0x8fa080,
    tusk:0xd8cdae, tuskDk:0xb9ac86, hair:0x2a2420, hairDk:0x1c1815,
    trouser:0x463c2c, boot:0x2e2418, bootDk:0x211a11,
    wood:0x6b4f2e, woodDk:0x4a3620, string:0xd8cdb0,
    fletch:0xc9c2a8, fletchDk:0x8f8870, shaft:0x8a6a42, arrowhead:0x8d949a,
    strap:0x2a2119, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.735, waistY:0.815, ribY:0.930, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* torso (leathers, broad half-orc loft) */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.180, hex:P.leatherDk},
    {y:L.waistY, rx:0.205, rz:0.160, hex:P.leather},
    {y:L.ribY,   rx:0.250, rz:0.185, hex:P.leather},
    {y:L.chestY, rx:0.290, rz:0.200, hex:P.leatherLt},
    {y:L.shldY,  rx:0.305, rz:0.192, hex:P.leather},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});

  /* belt + buckle */
  stack([
    {y:L.waistY-0.020, rx:0.210, rz:0.162, hex:P.leatherDk},
    {y:L.waistY+0.020, rx:0.207, rz:0.159, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.035,L.waistY-0.010,0.166), V(0.035,L.waistY-0.010,0.166), V(0.035,L.waistY+0.032,0.162), V(-0.035,L.waistY+0.032,0.162), P.brass, 0.02);

  /* hip skirt (short leather tassets) */
  stack([
    {y:0.545, rx:0.262, rz:0.202, hex:P.leatherDk},
    {y:0.690, rx:0.238, rz:0.180, hex:P.leather},
  ], 8, {});

  /* HEAD — inherited half-orc skull (heavy jaw, jutting brow, tusks). EYELESS. */
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
    for(const s of [-1,1]){
      const bx=s*0.044, by=L.jawY-0.006, bz=0.140;
      const tx=s*0.038, ty=by+0.040, tz=bz+0.032;
      const w=0.020;
      quad(V(bx-w,by-0.008,bz), V(bx+w,by-0.008,bz), V(tx+w*0.3,ty,tz), V(tx-w*0.3,ty,tz), P.tusk, 0.0);
    }
  }

  /* HOODED HALF-CLOAK — face window open (brow clear), mossy green (broad half-orc scale) */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.152, rz:0.144, hex:P.cloakDk},
      {y:L.jawY+0.02,   rx:0.176, rz:0.162, hex:P.cloak},
      {y:L.browY+0.02,  rx:0.180, rz:0.164, hex:P.cloak},
      {y:L.crownY+0.015,rx:0.140, rz:0.130, hex:P.cloak},
    ];
    const skip={1:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.012);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.03, -0.02), P.cloak);
    const inner=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx-0.016, b.rz-0.016, n, ph));
    inner[3].forEach(p=>p.z-=0.012);
    for(const edge of [0,3]) quad(rings[1][edge], inner[1][edge], inner[2][edge], rings[2][edge], P.cloakDk, 0.03);

    /* short half-cape shoulder mantle */
    stack([
      {y:L.shldY+0.03, rx:0.320, rz:0.235, cz:-0.03, hex:P.cloakDk},
      {y:L.shldY-0.06, rx:0.295, rz:0.220, cz:-0.05, hex:P.cloak},
      {y:0.90,         rx:0.240, rz:0.185, cz:-0.06, hex:P.cloak},
      {y:0.74,         rx:0.185, rz:0.150, cz:-0.05, hex:P.cloakDk},
    ], 8, {});
  }

  /* LONGBOW at FULL DRAW — single C-arc stave, STRAIGHT string chord tip-to-tip, drawn to a V.
     Local arc in plane x≈const, yawed ~26° about the grip so the C reads at the game camera. */
  const BOW_YAW = 26 * Math.PI/180;
  const BOW_PIVOT = V(0.400, 0.980, 0.500);
  const BOW_FWD = 0.075;
  function bowXform(p){
    const rel = p.clone().sub(BOW_PIVOT);
    const cs = Math.cos(BOW_YAW), sn = Math.sin(BOW_YAW);
    const rx = rel.x*cs + rel.z*sn, rz = -rel.x*sn + rel.z*cs;
    return V(BOW_PIVOT.x + rx, p.y, BOW_PIVOT.z + rz + BOW_FWD);
  }
  const ARC_X = 0.400, Y_BOT = 0.32, Y_TOP = 1.70;
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
  const ANCHOR = V(0.185, L.cheekY - 0.02, 0.080);
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
    /* STRING — straight chord drawn to the ANCHOR: top-nock → anchor → bottom-nock, connecting at tips */
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

  /* QUIVER — angled on the back, fletchings over the shoulder */
  const QUIV_BASE=V(-0.15,0.83,-0.150), QUIV_MOUTH=V(-0.265,1.33,-0.02);
  {
    tube(QUIV_BASE, QUIV_MOUTH, 0.078, 0.092, 8, P.leatherDk, {capA:{hex:P.leatherDk}});
    stack([
      {y:0, rx:0.094,rz:0.094, cx:QUIV_MOUTH.x, cz:QUIV_MOUTH.z, hex:P.leather},
    ], 8, {xform:p=>p.clone().add(V(0, QUIV_MOUTH.y, 0))});
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

  /* ARMS — FULL DRAW: left (bow) arm extended forward to GRIP; right (draw) arm back to ANCHOR */
  {
    const S=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.55).add(V(0.02,-0.01,0.06));
    tube(S,E,0.100,0.078,6,P.leather);
    tube(E,GRIP,0.072,0.058,6,P.leatherLt,{capB:{hex:P.skin}});
    tube(GRIP.clone().add(V(0,-0.050,0)), GRIP.clone().add(V(0,0.050,0)), 0.060,0.054,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(0.470, 1.185, -0.155);
    tube(S2,E2,0.100,0.078,6,P.leather);
    tube(E2,ANCHOR,0.072,0.058,6,P.leatherLt,{capB:{hex:P.skin}});
    const HDIR=new THREE.Vector3().subVectors(ANCHOR,E2).normalize();
    tube(ANCHOR.clone().addScaledVector(HDIR,-0.050), ANCHOR.clone().addScaledVector(HDIR,0.050), 0.056,0.050,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — open staggered archer's stance, high boots (broad half-orc) */
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

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
