/* dev/model-qa/creatures/gnome-paladin.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED gnome race (post-F1 big head + wedge EARS + eyeless, stubby frame) wearing the PALADIN kit
   (paladin.js OATH-GUARD signature: a TOWER SHIELD authored first raised across the body, a WARHAMMER
   cocked back/up at the right shoulder, a steel plate cuirass + faulds + pauldrons, an oxblood TABARD,
   a braced stance). The gnome keeps its big head + ears under a low crested helm (visor slit ok). One
   whole-object function; shield then hammer authored first so both hands derive true. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnomePaladin(){
  const P = {
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xbcc2c6,
    gold:0xb08d46, goldDk:0x7d6432,
    tabard:0x7a2f2b, tabardDk:0x5c2421,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    helm:0x7d818a, helmDk:0x565a61,
    wood:0x5a4326, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.335, waistY:0.375, ribY:0.435, chestY:0.465, shldY:0.485, neckY:0.515,
    hipHalf:0.115, shoulderX:0.155,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* TOWER SHIELD FIRST — raised across the body to a guard (gnome-scaled) */
  const SC = V(-0.215, 0.470, 0.230);
  const SN = V(-0.42, 0.06, 0.905).normalize();
  {
    const su = V(0,1,0).clone().sub(SN.clone().multiplyScalar(SN.y)).normalize();
    const sr = new THREE.Vector3().crossVectors(SN, su).normalize();
    const kite = (w,h) => [
      SC.clone().addScaledVector(su, 0.210*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su, 0.130*h).addScaledVector(sr, 0.150*w),
      SC.clone().addScaledVector(su,-0.055*h).addScaledVector(sr, 0.130*w),
      SC.clone().addScaledVector(su,-0.265*h).addScaledVector(sr, 0*w),
      SC.clone().addScaledVector(su,-0.055*h).addScaledVector(sr,-0.130*w),
      SC.clone().addScaledVector(su, 0.130*h).addScaledVector(sr,-0.150*w),
    ];
    const front = kite(1,1).map(p=>p.clone().addScaledVector(SN,0.016));
    const back  = kite(0.94,0.96).map(p=>p.clone().addScaledVector(SN,-0.013));
    const n = front.length;
    for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(back[i], back[i2], front[i2], front[i], P.steelDk, 0.04); }
    const cF = SC.clone().addScaledVector(SN,0.020), cB = SC.clone().addScaledVector(SN,-0.018);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], cF, cF, P.tabard, 0.05);
      quad(cB, cB, back[i2], back[i], P.tabardDk, 0.05);
    }
    const frontIn = kite(0.86,0.86).map(p=>p.clone().addScaledVector(SN,0.019));
    for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(front[i], front[i2], frontIn[i2], frontIn[i], P.gold, 0.03); }
    tube(SC.clone().addScaledVector(SN,0.022), SC.clone().addScaledVector(SN,0.060), 0.040, 0.024, 8, P.steel, {capB:{hex:P.steel, lift:0.012}});
  }

  /* WARHAMMER SECOND — cocked back/up at the right shoulder */
  const H_BUTT = V(0.270, 0.340, 0.220), H_TOP = V(0.155, 0.900, -0.170);
  const AXIS = new THREE.Vector3().subVectors(H_TOP, H_BUTT).normalize();
  const GRIP = H_BUTT.clone().addScaledVector(AXIS, 0.20);
  {
    tube(H_BUTT, H_BUTT.clone().addScaledVector(AXIS,0.06), 0.016,0.014,6,P.leatherDk,{capA:{hex:P.gold, lift:0.014}});
    tube(H_BUTT.clone().addScaledVector(AXIS,0.06), GRIP.clone().addScaledVector(AXIS,-0.05), 0.014,0.014,6,P.wood);
    tube(GRIP.clone().addScaledVector(AXIS,-0.05), GRIP.clone().addScaledVector(AXIS,0.05), 0.017,0.017,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.05), H_TOP.clone().addScaledVector(AXIS,-0.09), 0.013,0.017,6,P.wood);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.09), H_TOP.clone().addScaledVector(AXIS,-0.015), 0.017,0.032,6,P.steelDk);
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const HC=H_TOP.clone().addScaledVector(AXIS,0.015);
    const blk=(du,dAx,dw)=>HC.clone().addScaledVector(u,du).addScaledVector(AXIS,dAx).addScaledVector(w,dw);
    const b=[
      blk(0.0,-0.056,-0.048), blk(0.0,0.056,-0.048), blk(0.0,0.056,0.048), blk(0.0,-0.056,0.048),
      blk(0.120,-0.050,-0.043), blk(0.120,0.050,-0.043), blk(0.120,0.050,0.043), blk(0.120,-0.050,0.043),
    ];
    quad(b[0],b[1],b[2],b[3],P.steelDk,0.03);
    quad(b[4],b[7],b[6],b[5],P.steel,0.03);
    quad(b[0],b[4],b[5],b[1],P.steel,0.03);
    quad(b[3],b[2],b[6],b[7],P.steel,0.03);
    quad(b[1],b[5],b[6],b[2],P.steel,0.03);
    quad(b[0],b[3],b[7],b[4],P.steel,0.03);
    const spTip = HC.clone().addScaledVector(u,-0.150);
    const spBase=[ HC.clone().addScaledVector(w,-0.038), HC.clone().addScaledVector(w, 0.038),
                   HC.clone().addScaledVector(AXIS,0.046), HC.clone().addScaledVector(AXIS,-0.046) ];
    for(let i=0;i<4;i++){ const i2=(i+1)%4; quad(spBase[i],spBase[i2],spTip,spTip,P.steelDk,0.03); }
  }

  /* trunk — steel cuirass (gnome stubby) */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.128, hex:P.steelDk},
    {y:L.waistY, rx:0.170, rz:0.146, hex:P.steel},
    {y:L.ribY,   rx:0.158, rz:0.132, hex:P.steel},
    {y:L.chestY, rx:0.152, rz:0.124, hex:P.steelLt},
    {y:L.shldY,  rx:0.150, rz:0.120, hex:P.steel},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.steelDk},
  ], 8, {capTop:{hex:P.steelDk, lift:0.004}});
  /* faulds */
  stack([
    {y:0.24, rx:0.178, rz:0.150, hex:P.steelDk},
    {y:0.32, rx:0.166, rz:0.140, hex:P.steel},
  ], 8, {});
  /* belt */
  stack([
    {y:L.waistY-0.015, rx:0.172, rz:0.148, hex:P.leather},
    {y:L.waistY+0.012, rx:0.170, rz:0.146, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.024,L.waistY-0.006,0.150), V(0.024,L.waistY-0.006,0.150), V(0.024,L.waistY+0.018,0.146), V(-0.024,L.waistY+0.018,0.146), P.gold, 0.02);

  /* TABARD — oxblood field, gold hem */
  {
    const fp=[[L.chestY,0.126],[0.34,0.136],[0.22,0.146],[0.14,0.152]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.070,y2,z2), V(0.070,y2,z2), V(0.070,y1,z1), V(-0.070,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    const [hy,hz]=fp.at(-1);
    quad(V(-0.070,hy-0.012,hz-0.003), V(0.070,hy-0.012,hz-0.003), V(0.070,hy+0.004,hz+0.002), V(-0.070,hy+0.004,hz+0.002), P.gold, 0.02);
  }

  /* PAULDRONS — flared steel plates */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.01, 0.015);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.32); return q.add(pivot); };
    stack([
      {y:L.shldY-0.02, rx:0.086, rz:0.090, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.02, rx:0.074, rz:0.078, cx:pivot.x, cz:pivot.z, hex:P.steel},
      {y:L.shldY+0.06, rx:0.056, rz:0.058, cx:pivot.x, cz:pivot.z, hex:P.steelLt},
    ], 8, {xform:tilt, capTop:{hex:P.steelLt, lift:0.02}});
  }

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

  /* LOW CRESTED HELM (visor slit) with a gold cross fleuron */
  {
    const n=8, ph=Math.PI/n;
    const rimLo=ring(V(0,L.browY+0.010,0.0), V(0,1,0), 0.146, 0.134, n, ph);
    const rimHi=ring(V(0,L.browY+0.035,0.0), V(0,1,0), 0.144, 0.132, n, ph);
    stitch([rimLo,rimHi], ()=>P.helmDk);
    const dome=[
      {y:L.browY+0.045, rx:0.142, rz:0.130},
      {y:L.crownY+0.01, rx:0.126, rz:0.114},
      {y:L.headTopY+0.02, rx:0.078, rz:0.070},
    ].map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(dome, ()=>P.helm);
    stitch([rimHi,dome[0]], ()=>P.helm);
    capFan(dome.at(-1), V(0, L.headTopY+0.075, 0.0), P.helmDk);
    /* visor slit */
    quad(V(-0.070,L.cheekY+0.02,0.130), V(0.070,L.cheekY+0.02,0.130), V(0.070,L.cheekY+0.04,0.130), V(-0.070,L.cheekY+0.04,0.130), P.helmDk, 0.02);
    /* gold cross crest */
    quad(V(-0.008,L.crownY+0.02,0.116), V(0.008,L.crownY+0.02,0.116), V(0.008,L.headTopY+0.06,0.098), V(-0.008,L.headTopY+0.06,0.098), P.gold, 0.02);
    quad(V(-0.026,L.headTopY+0.02,0.106), V(0.026,L.headTopY+0.02,0.106), V(0.026,L.headTopY+0.036,0.104), V(-0.026,L.headTopY+0.036,0.104), P.gold, 0.02);
  }

  /* RIGHT ARM — steel sleeve to the warhammer grip; fist derived */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const fistNear=GRIP.clone().addScaledVector(AXIS,-0.04);
    const E=S.clone().lerp(fistNear, 0.5).add(V(0.05,0.015,0.05));
    tube(S,E,0.058,0.046,6,P.steel);
    tube(E,fistNear,0.044,0.036,6,P.steel);
    tube(fistNear, GRIP.clone().addScaledVector(AXIS,0.04),
         0.038,0.034,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEFT ARM — raised + bent to the shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.036);
    const E2=V(-0.205, 0.430, 0.080);
    tube(S2,E2,0.058,0.046,6,P.steel);
    tube(E2,W2,0.044,0.034,6,P.steel);
    tube(W2.clone().add(V(0.012,0.035,-0.012)), W2.clone().add(V(-0.012,-0.035,0.012)),
         0.034,0.030,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — steel greaves, braced */
  {
    const hipL=V(-0.100, L.hipY-0.01, 0.01), ankL=V(-0.140,0.075,0.06);
    const hipR=V( 0.100, L.hipY-0.01, 0.00), ankR=V( 0.150,0.075,-0.06);
    tube(hipL,ankL,0.062,0.046,6,P.steelDk);
    tube(hipR,ankR,0.062,0.046,6,P.steelDk);
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.40,0,0.90).normalize()]]){
      stack([
        {y:0.010, rx:0.058, rz:0.064, cx:ank.x, cz:ank.z, hex:P.steelDk},
        {y:0.08,  rx:0.052, rz:0.054, cx:ank.x, cz:ank.z, hex:P.steel},
      ], 6, {capTop:{hex:P.steel, lift:0.006}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.106), 0.048,0.034,6,P.steel, {capB:{hex:P.steel, lift:0.012}, raz:0.040, rbz:0.028});
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
