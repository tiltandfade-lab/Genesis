/* dev/model-qa/creatures/halforc-paladin.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED half-orc race (race-halforc: heavy/broad frame, gray-green skin, heavy SQUARE jaw with
   pale TUSK nubs, aggressively jutting BROW, cropped dark hair) wearing the PALADIN kit (paladin.js
   signature: a TOWER kite SHIELD authored first raised to an oath-guard across the body, a WARHAMMER
   COCKED back/up at the shoulder ready to strike, flared steel pauldrons, a deep-oxblood tabard, a
   braced staggered stance). The half-orc's mass sells a grim orcish holy-warrior; the tusks + brow
   read UNDER the open helm-less head (the head stays bare so the race reads). EYELESS per the
   2026-07-04 reversal. One whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrcPaladin(){
  const P = {
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xbcc2c6,
    gold:0xb08d46, goldDk:0x7d6432,
    tabard:0x5f6b3a, tabardDk:0x47522b, tabardLt:0x71804a,   /* deep war-green surcoat (orcish order) */
    leather:0x4e3d2a, leatherDk:0x362a1c,
    skin:0x7a8a6e, skinDk:0x525e48, skinLt:0x8fa080,
    tusk:0xd8cdae, tuskDk:0xb9ac86, hair:0x2a2420, hairDk:0x1c1815,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* half-orc landmarks (heavy/broad, ~1.52u — from race-halforc.js) */
  const L = {
    hipY:0.735, waistY:0.815, ribY:0.930, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* TOWER SHIELD FIRST — a large kite raised to an oath-guard across the body (mostly forward face) */
  const SC = V(-0.310, 1.020, 0.335);
  const SN = V(-0.42, 0.06, 0.905).normalize();
  {
    const su = V(0,1,0).clone().sub(SN.clone().multiplyScalar(SN.y)).normalize();
    const sr = new THREE.Vector3().crossVectors(SN, su).normalize();
    const kite = (w,h) => [
      SC.clone().addScaledVector(su, 0.330*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su, 0.205*h).addScaledVector(sr, 0.215*w),
      SC.clone().addScaledVector(su,-0.080*h).addScaledVector(sr, 0.188*w),
      SC.clone().addScaledVector(su,-0.410*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su,-0.080*h).addScaledVector(sr,-0.188*w),
      SC.clone().addScaledVector(su, 0.205*h).addScaledVector(sr,-0.215*w),
    ];
    const front = kite(1,1).map(p=>p.clone().addScaledVector(SN,0.024));
    const back  = kite(0.94,0.96).map(p=>p.clone().addScaledVector(SN,-0.020));
    const n = front.length;
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(back[i], back[i2], front[i2], front[i], P.steelDk, 0.04); }
    const cF = SC.clone().addScaledVector(SN,0.030), cB = SC.clone().addScaledVector(SN,-0.026);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], cF, cF, P.tabard, 0.05);
      quad(cB, cB, back[i2], back[i], P.tabardDk, 0.05); }
    const frontIn = kite(0.86,0.86).map(p=>p.clone().addScaledVector(SN,0.028));
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], frontIn[i2], frontIn[i], P.gold, 0.03); }
    tube(SC.clone().addScaledVector(SN,0.03), SC.clone().addScaledVector(SN,0.090),
         0.064, 0.036, 8, P.steel, {capB:{hex:P.steel, lift:0.015}});
  }

  /* WARHAMMER SECOND — COCKED back/up at the right shoulder, ready to strike */
  const H_BUTT = V(0.395, 0.735, 0.320), H_TOP = V(0.215, 1.640, -0.250);
  const AXIS = new THREE.Vector3().subVectors(H_TOP, H_BUTT).normalize();
  const GRIP = H_BUTT.clone().addScaledVector(AXIS, 0.32);
  {
    tube(H_BUTT, H_BUTT.clone().addScaledVector(AXIS,0.09), 0.024,0.022,6,P.leatherDk,{capA:{hex:P.gold, lift:0.018}});
    tube(H_BUTT.clone().addScaledVector(AXIS,0.09), GRIP.clone().addScaledVector(AXIS,-0.09), 0.022,0.022,6,P.wood);
    tube(GRIP.clone().addScaledVector(AXIS,-0.09), GRIP.clone().addScaledVector(AXIS,0.09), 0.025,0.025,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.09), H_TOP.clone().addScaledVector(AXIS,-0.14), 0.021,0.026,6,P.wood);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.14), H_TOP.clone().addScaledVector(AXIS,-0.02), 0.026,0.048,6,P.steelDk);
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const HC=H_TOP.clone().addScaledVector(AXIS,0.03);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.02), HC.clone().addScaledVector(AXIS,-0.082),
         0.048,0.056,6,P.steelDk);
    const blk=(du,dAx,dw)=>HC.clone().addScaledVector(u,du).addScaledVector(AXIS,dAx).addScaledVector(w,dw);
    const b=[
      blk(0.0,-0.082,-0.072), blk(0.0,0.082,-0.072), blk(0.0,0.082,0.072), blk(0.0,-0.082,0.072),
      blk(0.185,-0.074,-0.066), blk(0.185,0.074,-0.066), blk(0.185,0.074,0.066), blk(0.185,-0.074,0.066),
    ];
    quad(b[0],b[1],b[2],b[3],P.steelDk,0.03);
    quad(b[4],b[7],b[6],b[5],P.steel,0.03);
    quad(b[0],b[4],b[5],b[1],P.steel,0.03);
    quad(b[3],b[2],b[6],b[7],P.steel,0.03);
    quad(b[1],b[5],b[6],b[2],P.steel,0.03);
    quad(b[0],b[3],b[7],b[4],P.steel,0.03);
    const spTip = HC.clone().addScaledVector(u,-0.220);
    const spBase=[ HC.clone().addScaledVector(u,0.0).addScaledVector(w,-0.056),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(w, 0.056),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(AXIS,0.066),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(AXIS,-0.066) ];
    for(let i=0;i<4;i++){ const i2=(i+1)%4; quad(spBase[i],spBase[i2],spTip,spTip,P.steelDk,0.03); }
  }

  /* trunk — heavy steel cuirass (broad half-orc taper) */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.180, hex:P.steelDk},
    {y:L.waistY, rx:0.205, rz:0.160, hex:P.steel},
    {y:L.ribY,   rx:0.250, rz:0.185, hex:P.steel},
    {y:L.chestY, rx:0.290, rz:0.200, hex:P.steelLt},
    {y:L.shldY,  rx:0.305, rz:0.192, hex:P.steel},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});

  /* raised breastplate ridge */
  {
    const rows=[[L.ribY,0.188],[0.995,0.198],[L.chestY,0.200]];
    for(const [y,z] of rows) quad(V(-0.030,y-0.02,z), V(0.030,y-0.02,z), V(0.030,y+0.02,z+0.014), V(-0.030,y+0.02,z+0.014), P.steelLt, 0.03);
  }

  /* faulds + belt */
  stack([
    {y:0.475, rx:0.250, rz:0.198, hex:P.steelDk},
    {y:0.610, rx:0.240, rz:0.188, hex:P.steel},
    {y:L.hipY, rx:0.230, rz:0.176, hex:P.steel},
  ], 8, {});
  stack([
    {y:0.790, rx:0.216, rz:0.166, hex:P.leather},
    {y:0.850, rx:0.212, rz:0.162, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.045,0.796,0.170), V(0.045,0.796,0.170), V(0.045,0.845,0.166), V(-0.045,0.845,0.166), P.gold, 0.02);

  /* TABARD — deep war-green surcoat over the cuirass front, gold hem */
  {
    const fp=[[1.06,0.202],[0.87,0.212],[0.66,0.222],[0.46,0.232],[0.32,0.238]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.120,y2,z2), V(0.120,y2,z2), V(0.120,y1,z1), V(-0.120,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const [hy,hz]=fp.at(-1);
    quad(V(-0.120,hy-0.018,hz-0.004), V(0.120,hy-0.018,hz-0.004), V(0.120,hy+0.006,hz+0.002), V(-0.120,hy+0.006,hz+0.002), P.gold, 0.02);
  }

  /* SHOULDER PAULDRONS — big flared steel plates */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.01, 0.015);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.32); return q.add(pivot); };
    stack([
      {y:L.shldY-0.05, rx:0.155, rz:0.160, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.02, rx:0.140, rz:0.145, cx:pivot.x, cz:pivot.z, hex:P.steel},
      {y:L.shldY+0.095,rx:0.100, rz:0.108, cx:pivot.x, cz:pivot.z, hex:P.steelLt},
    ], 8, {xform:tilt, capTop:{hex:P.steelLt, lift:0.03}});
  }

  /* HEAD — inherited half-orc skull (heavy jaw, jutting brow, tusks), bare (no helm). EYELESS. */
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
    /* tusk nubs */
    for(const s of [-1,1]){
      const bx=s*0.044, by=L.jawY-0.006, bz=0.140;
      const tx=s*0.038, ty=by+0.040, tz=bz+0.032;
      const w=0.020;
      quad(V(bx-w,by-0.008,bz), V(bx+w,by-0.008,bz), V(tx+w*0.3,ty,tz), V(tx-w*0.3,ty,tz), P.tusk, 0.0);
    }
  }

  /* cropped dark hair cap (inherited) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.010, rx:0.136, rz:0.122, hex:P.hairDk},
      {y:L.crownY+0.004,rx:0.112, rz:0.100, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, {0:[1,2,3,4,5,6]});
    capFan(rings[1], V(0, L.headTopY+0.010, -0.004), P.hair);
  }

  /* RIGHT ARM — steel sleeve to the cocked hammer grip; fist derived from GRIP */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const fistNear=GRIP.clone().addScaledVector(AXIS,-0.055);
    const E=S.clone().lerp(fistNear, 0.5).add(V(0.080,0.03,0.06));
    tube(S,E,0.100,0.078,6,P.steel);
    tube(E,fistNear,0.070,0.060,6,P.steel);
    tube(fistNear, GRIP.clone().addScaledVector(AXIS,0.055),
         0.062,0.056,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEFT ARM — raised + bent to the guard-height shield back */
  {
    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.045);
    const E2=V(-0.300, 0.870, 0.140);
    tube(S2,E2,0.098,0.076,6,P.steel);
    tube(E2,W2,0.070,0.058,6,P.steel);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.056,0.050,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* legs — wide braced staggered guard stance, steel greaves + sabatons */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.200,0.40,0.155), ankL=V(-0.220,0.085,0.190);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.230,0.40,-0.125), ankR=V( 0.250,0.085,-0.180);
    tube(hipL,kneeL,0.112,0.078,6,P.steelDk);
    tube(kneeL,ankL,0.074,0.055,6,P.steel);
    tube(hipR,kneeR,0.112,0.078,6,P.steelDk);
    tube(kneeR,ankR,0.074,0.055,6,P.steel);
    for(const k of [kneeL,kneeR]) tube(k.clone().add(V(0,0.015,-0.01)), k.clone().add(V(0,0.015,0.045)), 0.058,0.048,8,P.steelLt,{capB:{hex:P.steelLt,lift:0.01}});
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.074, rz:0.082, cx:ank.x, cz:ank.z, hex:P.steelDk},
        {y:0.09,  rx:0.068, rz:0.070, cx:ank.x, cz:ank.z, hex:P.steel},
      ], 6, {capTop:{hex:P.steel, lift:0.008}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.150), 0.062,0.046,6,P.steel, {capB:{hex:P.steel, lift:0.015}, raz:0.054, rbz:0.038});
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
