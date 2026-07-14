/* dev/model-qa/creatures/dragonborn-monk.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the MONK kit (monk.js signature:
   a QUARTERSTAFF held diagonally two-handed authored first so both fists derive true, a wrap-top GI
   + red SASH with a trailing knot, wrist wraps, a wide low HORSE-STANCE, scaled bare feet). A
   disciplined draconic ascetic; the muzzle + horns + tail carry the race. EYELESS. One whole-object
   function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornMonk(){
  const P = {
    gi:0xa89670, giDk:0x7d6d50, giLt:0xbcac86,
    sash:0xa8342c, sashDk:0x7a2620,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a,
    wrap:0xd8cdb0, wrapDk:0xa89b7c,
    trouser:0x4f4a3e, trouserDk:0x3a362c,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* torso (gi wrap-top, broad dragonborn) */
  stack([
    {y:L.hipY,   rx:0.215, rz:0.168, hex:P.trouserDk},
    {y:L.waistY, rx:0.190, rz:0.148, hex:P.gi},
    {y:L.ribY,   rx:0.230, rz:0.172, hex:P.gi},
    {y:L.chestY, rx:0.268, rz:0.188, hex:P.giLt},
    {y:L.shldY,  rx:0.278, rz:0.180, hex:P.gi},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.006}});
  {
    const zs=[[L.shldY-0.01,0.182],[L.chestY,0.192],[L.ribY,0.178],[L.waistY,0.152]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.11,y1,z1+0.006), V(0.01,y1,z1-0.004), V(0.03,y2,z2-0.004), V(-0.09,y2,z2+0.006), P.giLt, 0.03);
    }
  }

  /* SASH */
  stack([
    {y:L.waistY-0.045, rx:0.206, rz:0.158, hex:P.sashDk},
    {y:L.waistY-0.005, rx:0.204, rz:0.156, hex:P.sash},
    {y:L.waistY+0.035, rx:0.202, rz:0.154, hex:P.sash},
    {y:L.waistY+0.06,  rx:0.200, rz:0.152, hex:P.sashDk},
  ], 8, {capTop:{hex:P.sashDk,lift:0.006}, capBot:{hex:P.sashDk,lift:0.0}});
  {
    const kc=V(-0.175,L.waistY-0.02,0.12);
    stack([
      {y:kc.y+0.03, rx:0.034, rz:0.030, cx:kc.x, cz:kc.z, hex:P.sash},
      {y:kc.y-0.01, rx:0.036, rz:0.032, cx:kc.x, cz:kc.z, hex:P.sashDk},
    ], 6, {capTop:{hex:P.sash,lift:0.01}, capBot:{hex:P.sashDk,lift:0.0}});
    tube(V(kc.x+0.01,kc.y-0.01,kc.z), V(kc.x-0.015,kc.y-0.23,kc.z-0.02), 0.021,0.011,5,P.sash,{capB:{hex:P.sashDk}});
    tube(V(kc.x-0.02,kc.y-0.01,kc.z+0.01), V(kc.x-0.04,kc.y-0.19,kc.z+0.03), 0.018,0.009,5,P.sashDk,{capB:{hex:P.sashDk}});
  }

  /* HEAD — inherited dragonborn skull. EYELESS. */
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

  /* QUARTERSTAFF FIRST — held diagonally two-handed */
  const G1=V(0.290,1.000,0.210);
  const G2=V(-0.275,0.595,0.165);
  const STAFF_A=G1.clone().addScaledVector(new THREE.Vector3().subVectors(G1,G2).normalize(), 0.46);
  const STAFF_B=G2.clone().addScaledVector(new THREE.Vector3().subVectors(G2,G1).normalize(), 0.46);
  const AXIS=new THREE.Vector3().subVectors(STAFF_A,STAFF_B).normalize();
  {
    tube(STAFF_B, STAFF_A, 0.028, 0.028, 8, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
    tube(G1.clone().addScaledVector(AXIS,-0.06), G1.clone().addScaledVector(AXIS,0.06), 0.033,0.033,8,P.woodDk);
    tube(G2.clone().addScaledVector(AXIS,-0.06), G2.clone().addScaledVector(AXIS,0.06), 0.033,0.033,8,P.woodDk);
  }

  /* ARMS — both fists derived from the staff grips (scale skin) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const FIST1=G1.clone();
    const W=FIST1.clone();
    const E=V(0.360,0.910,0.150);
    tube(S,E,0.098,0.076,6,P.scale);
    tube(E,W,0.070,0.058,6,P.scale,{capB:{hex:P.scale}});
    tube(FIST1.clone().addScaledVector(AXIS,-0.05), FIST1.clone().addScaledVector(AXIS,0.05), 0.062,0.056,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});
    tube(E.clone().lerp(W,0.55).add(V(0,0.01,0)), E.clone().lerp(W,0.72).add(V(0,0.01,0)), 0.066,0.062,6,P.wrap);

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const FIST2=G2.clone();
    const E2=V(-0.340,0.810,0.070);
    tube(S2,E2,0.098,0.076,6,P.scale);
    const WR2=E2.clone().lerp(FIST2,0.72);
    tube(E2,WR2,0.070,0.058,6,P.scale);
    tube(E2.clone().lerp(FIST2,0.55).add(V(0,0.01,0)), WR2.clone().add(V(0,0.01,0)), 0.064,0.058,6,P.wrap);
    tube(WR2, FIST2.clone().addScaledVector(AXIS,-0.045), 0.058,0.070,6,P.scale,{capB:{hex:P.scaleDk}});
    tube(FIST2.clone().addScaledVector(AXIS,-0.045), FIST2.clone().addScaledVector(AXIS,0.045), 0.070,0.062,6,P.scale,{capA:{hex:P.scaleDk},capB:{hex:P.scale}});
  }

  /* LEGS — wide horse-stance, cropped trousers, scaled bare feet (broad dragonborn) */
  {
    const hipL=V(-0.235, L.hipY-0.01, 0.02), kneeL=V(-0.275,0.36,0.10), ankL=V(-0.265,0.075,0.055);
    const hipR=V( 0.235, L.hipY-0.01, -0.01), kneeR=V( 0.285,0.36,-0.075), ankR=V( 0.275,0.075,-0.10);
    tube(hipL,kneeL,0.108,0.078,6,P.trouser);
    tube(kneeL, kneeL.clone().lerp(ankL,0.55), 0.074,0.058,6,P.trouser);
    tube(hipR,kneeR,0.108,0.078,6,P.trouser);
    tube(kneeR, kneeR.clone().lerp(ankR,0.55), 0.074,0.058,6,P.trouser);
    for(const [knee,ank] of [[kneeL,ankL],[kneeR,ankR]]){
      const hemA=knee.clone().lerp(ank,0.55);
      stack([{y:hemA.y+0.015, rx:0.066, rz:0.060, cx:hemA.x, cz:hemA.z, hex:P.trouserDk}], 6, {});
      tube(hemA, ank, 0.058,0.048,6,P.scale);
      tube(hemA.clone().lerp(ank,0.55), hemA.clone().lerp(ank,0.78), 0.052,0.050,6,P.wrap);
    }
    for(const [ank,toeDir] of [[ankL,V(0.08,0,1)], [ankR,V(0.75,0,0.35).normalize()]]){
      stack([
        {y:0.010, rx:0.072, rz:0.086, cx:ank.x, cz:ank.z, hex:P.scaleDk},
        {y:0.055, rx:0.064, rz:0.070, cx:ank.x, cz:ank.z, hex:P.scale},
      ], 6, {capTop:{hex:P.scale, lift:0.004}, capBot:{hex:P.scaleDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.130), 0.060,0.038,6,P.scale, {capB:{hex:P.scaleDk, lift:0.012}, raz:0.052, rbz:0.032});
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
