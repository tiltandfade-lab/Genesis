/* dev/model-qa/creatures/tiefling-ranger.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED tiefling race (slim ~1.45u frame, dusky red-mauve skin, backswept HORNS, sharp GOATEE,
   thin spade-tipped TAIL) wearing the RANGER kit (ranger.js signature: a single C-arc LONGBOW at FULL
   DRAW — curved stave + STRAIGHT string chord connecting exactly at both tips, drawn to a deep V, a
   nocked arrow running forward through the grip, a back QUIVER, a shoulder half-cape). The hood is
   left OFF so the horns read; a lithe infernal hunter. EYELESS. One whole-object function, no anchors;
   figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTieflingRanger(){
  const P = {
    leather:0x5a4530, leatherDk:0x3f3020, leatherLt:0x6e5640,
    cloak:0x3f4a34, cloakDk:0x2c3524,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a, hair:0x2a2320,
    trouser:0x463c2c, boot:0x2e2418, bootDk:0x211a11,
    wood:0x6b4f2e, woodDk:0x4a3620, string:0xd8cdb0,
    fletch:0xc9c2a8, fletchDk:0x8f8870, shaft:0x8a6a42, arrowhead:0x8d949a,
    strap:0x2a2119, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.215,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* torso (leathers, slim tiefling) */
  stack([
    {y:L.hipY,   rx:0.170, rz:0.128, hex:P.leatherDk},
    {y:L.waistY, rx:0.148, rz:0.112, hex:P.leather},
    {y:L.ribY,   rx:0.172, rz:0.128, hex:P.leather},
    {y:L.chestY, rx:0.194, rz:0.138, hex:P.leatherLt},
    {y:L.shldY,  rx:0.198, rz:0.130, hex:P.leather},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  stack([
    {y:L.waistY-0.015, rx:0.152, rz:0.116, hex:P.leatherDk},
    {y:L.waistY+0.025, rx:0.150, rz:0.114, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.026,L.waistY-0.008,0.120), V(0.026,L.waistY-0.008,0.120), V(0.026,L.waistY+0.032,0.117), V(-0.026,L.waistY+0.032,0.117), P.brass, 0.02);
  stack([
    {y:0.50, rx:0.185, rz:0.148, hex:P.leatherDk},
    {y:0.62, rx:0.170, rz:0.135, hex:P.leather},
  ], 8, {});

  /* short half-cape shoulder mantle (hood OFF so horns read) */
  stack([
    {y:L.shldY+0.03, rx:0.255, rz:0.190, cz:-0.03, hex:P.cloakDk},
    {y:L.shldY-0.06, rx:0.232, rz:0.175, cz:-0.05, hex:P.cloak},
    {y:0.82,         rx:0.185, rz:0.145, cz:-0.06, hex:P.cloak},
    {y:0.66,         rx:0.140, rz:0.112, cz:-0.05, hex:P.cloakDk},
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
    stack([
      {y:L.crownY-0.01, rx:0.086, rz:0.078, cz:-0.006, hex:P.hair},
      {y:L.crownY+0.03, rx:0.070, rz:0.062, cz:-0.010, hex:P.hair},
    ], 8, {capTop:{hex:P.hair, lift:0.012}});
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
  /* HORNS */
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

  /* LONGBOW at FULL DRAW — single C-arc + straight string chord tip-to-tip drawn to a V */
  const BOW_YAW = 26 * Math.PI/180;
  const BOW_PIVOT = V(0.320, 0.905, 0.470);
  const BOW_FWD = 0.070;
  function bowXform(p){
    const rel = p.clone().sub(BOW_PIVOT);
    const cs = Math.cos(BOW_YAW), sn = Math.sin(BOW_YAW);
    const rx = rel.x*cs + rel.z*sn, rz = -rel.x*sn + rel.z*cs;
    return V(BOW_PIVOT.x + rx, p.y, BOW_PIVOT.z + rz + BOW_FWD);
  }
  const ARC_X = 0.320, Y_BOT = 0.28, Y_TOP = 1.55;
  const Z_CHORD = 0.420, Z_BELLY = 0.590;
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
  const ANCHOR = V(0.145, L.cheekY - 0.02, 0.070);
  {
    for(let i=0;i<SEG;i++){
      const a = arc[i], b = arc[i+1];
      const tA = i/SEG, tB = (i+1)/SEG;
      const rA = 0.013 + 0.015*(4*tA*(1-tA));
      const rB = 0.013 + 0.015*(4*tB*(1-tB));
      const capO = {};
      if(i===0) capO.capA = {hex:P.woodDk};
      if(i===SEG-1) capO.capB = {hex:P.woodDk};
      tube(a, b, rA, rB, 7, i%2? P.woodDk : P.wood, capO);
    }
    tube(arcPt(0.42), arcPt(0.58), 0.032, 0.032, 8, P.leatherDk);
    tube(BOW_TOP, ANCHOR, 0.008, 0.008, 5, P.string);
    tube(BOW_BOT, ANCHOR, 0.008, 0.008, 5, P.string);
    const DIR = new THREE.Vector3().subVectors(GRIP, ANCHOR).normalize();
    const ARROW_TAIL = ANCHOR.clone().addScaledVector(DIR, -0.010);
    const ARROW_HEAD_TIP = ANCHOR.clone().addScaledVector(DIR, GRIP.clone().sub(ANCHOR).length() + 0.32);
    tube(ANCHOR.clone().addScaledVector(DIR,-0.018), ANCHOR.clone().addScaledVector(DIR,0.018), 0.016,0.013,6,P.string);
    tube(ARROW_TAIL, ARROW_HEAD_TIP.clone().addScaledVector(DIR,-0.040), 0.009,0.009,6,P.shaft);
    tube(ARROW_HEAD_TIP.clone().addScaledVector(DIR,-0.040), ARROW_HEAD_TIP, 0.011,0.002,6,P.arrowhead,{capB:{hex:P.arrowhead}});
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2;
      const up=Math.abs(DIR.y)>0.9?V(0,0,1):V(0,1,0);
      const u=new THREE.Vector3().crossVectors(up,DIR).normalize(), w=new THREE.Vector3().crossVectors(DIR,u).normalize();
      const d=u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a));
      const base=ARROW_TAIL.clone().addScaledVector(DIR,0.050);
      const tip=ARROW_TAIL.clone();
      quad(base, base.clone().addScaledVector(d,0.026), tip.clone().addScaledVector(d,0.013), tip, P.fletchDk, 0.04);
    }
  }

  /* QUIVER — angled on the back */
  const QUIV_BASE=V(-0.11,0.78,-0.130), QUIV_MOUTH=V(-0.205,1.25,-0.02);
  {
    tube(QUIV_BASE, QUIV_MOUTH, 0.066, 0.078, 8, P.leatherDk, {capA:{hex:P.leatherDk}});
    stack([{y:0, rx:0.080,rz:0.080, cx:QUIV_MOUTH.x, cz:QUIV_MOUTH.z, hex:P.leather}], 8, {xform:p=>p.clone().add(V(0, QUIV_MOUTH.y, 0))});
    tube(V(0.12,L.shldY+0.02,0.10), QUIV_MOUTH.clone().add(V(0,0.02,0.04)), 0.016,0.014,5,P.strap);
    const qdir=new THREE.Vector3().subVectors(QUIV_MOUTH,QUIV_BASE).normalize();
    for(let k=0;k<5;k++){
      const t=(k-2)*0.026, s=(k-2)*0.018;
      const base=QUIV_MOUTH.clone().add(V(t*1.1, 0, s*0.6));
      const tip=base.clone().addScaledVector(qdir,0.27).add(V(t*0.4,0,s*0.3));
      tube(base, tip, 0.009,0.009,5,P.shaft);
      for(const side of [-1,1]){
        const u=V(1,0,0);
        const flareBase=tip.clone().addScaledVector(qdir,-0.055);
        quad(flareBase, flareBase.clone().add(u.clone().multiplyScalar(side*0.018)).add(V(0,0.018,0)),
             tip.clone().add(u.clone().multiplyScalar(side*0.009)), tip, P.fletch, 0.05);
      }
    }
  }

  /* ARMS — FULL DRAW: left (bow) arm forward to GRIP; right (draw) arm back to ANCHOR */
  {
    const S=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.55).add(V(0.02,-0.01,0.06));
    tube(S,E,0.062,0.050,6,P.leather);
    tube(E,GRIP,0.046,0.038,6,P.leatherLt,{capB:{hex:P.skin}});
    tube(GRIP.clone().add(V(0,-0.040,0)), GRIP.clone().add(V(0,0.040,0)), 0.040,0.036,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(0.375, 1.115, -0.135);
    tube(S2,E2,0.062,0.050,6,P.leather);
    tube(E2,ANCHOR,0.046,0.038,6,P.leatherLt,{capB:{hex:P.skin}});
    const HDIR=new THREE.Vector3().subVectors(ANCHOR,E2).normalize();
    tube(ANCHOR.clone().addScaledVector(HDIR,-0.040), ANCHOR.clone().addScaledVector(HDIR,0.040), 0.038,0.034,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — open staggered archer's stance, high boots (slim tiefling) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.125,0.42,0.120), shinL=V(-0.130,0.285,0.110), ankL=V(-0.140,0.085,0.100);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.145,0.42,-0.105), shinR=V(0.155,0.285,-0.125), ankR=V( 0.165,0.085,-0.145);
    tube(hipL,kneeL,0.068,0.050,6,P.trouser);
    tube(kneeL,shinL,0.046,0.042,6,P.trouser);
    tube(hipR,kneeR,0.068,0.050,6,P.trouser);
    tube(kneeR,shinR,0.046,0.042,6,P.trouser);
    for(const [shin,ank,toeDir] of [[shinL,ankL,V(0.06,0,1)], [shinR,ankR,V(0.82,0,0.32).normalize()]]){
      tube(ank, shin.clone().add(V(0,0.10,0)), 0.050,0.042,7,P.boot, {capB:{hex:P.bootDk, lift:0.01}});
      stack([
        {y:0.012, rx:0.056, rz:0.062, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.09,  rx:0.050, rz:0.052, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capBot:{hex:P.bootDk, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.120), 0.048,0.034,6,P.boot, {capB:{hex:P.bootDk, lift:0.015}, raz:0.042, rbz:0.028});
    }
  }

  /* TAIL — thin spade-tipped tail (inherited) */
  {
    const root = V(0.030, L.hipY-0.045, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.leatherDk);
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
