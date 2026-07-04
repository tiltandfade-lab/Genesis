/* dev/model-qa/creatures/dragonborn-druid.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the DRUID kit (druid.js signature:
   a GNARLED forked STAFF authored first raked to a leaned-on lean, a hide/leaf MANTLE over the
   shoulders, a ratty robe with a bone-charm belt). The antler headdress is DROPPED (the dragon's own
   horns are the crown); a primal draconic warden. EYELESS. One whole-object function, no anchors;
   figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDragonbornDruid(){
  const P = {
    hide:0x6b5a3c, hideDk:0x4d4029, hideLt:0x7f6d4a,
    robe:0x5a5432, robeDk:0x413d24, robeLt:0x6d6640,
    leaf:0x5c6b3a, leafDk:0x424e29,
    bark:0x5c4325, barkDk:0x3f2e19, barkLt:0x715334,
    bone:0xe4dcc4, boneDk:0xb0a882,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a,
    cord:0x6b5535, disc:0x453a2c, discTop:0x554836,
  };

  const L = {
    hemY:0.06, kneeY:0.42, waistY:0.83, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* GNARLED STAFF FIRST — raked to a leaned-on lean */
  const ST_BASE = V(-0.430, 0.02, 0.32);
  const ST_TOP  = V(-0.170, 1.72, 0.04);
  const SDIR = new THREE.Vector3().subVectors(ST_TOP, ST_BASE).normalize();
  const GRIP = ST_BASE.clone().lerp(ST_TOP, 0.66);
  {
    const knots = [0, 0.16, 0.34, 0.52, 0.70, 0.85, 1.0];
    const jitter = [ [0.012,-0.008], [-0.010,0.014], [0.014,0.006], [-0.008,-0.012], [0.010,0.010], [-0.006,0.004], [0,0] ];
    const pts = knots.map((t,i)=> ST_BASE.clone().lerp(ST_TOP, t).add(V(jitter[i][0], 0, jitter[i][1])) );
    for(let i=0;i<pts.length-1;i++){
      const rA = 0.028 - i*0.0024, rB = 0.028 - (i+1)*0.0024;
      tube(pts[i], pts[i+1], Math.max(rA,0.010), Math.max(rB,0.010), 6, i%2?P.bark:P.barkLt);
    }
    for(let i=1;i<pts.length-1;i++){
      const r = 0.032 - i*0.002;
      const rgA = ring(pts[i].clone().addScaledVector(SDIR,-0.018), SDIR, r*0.7, r*0.7, 6);
      const rgB = ring(pts[i], SDIR, r, r, 6);
      const rgC = ring(pts[i].clone().addScaledVector(SDIR, 0.018), SDIR, r*0.7, r*0.7, 6);
      stitch([rgA,rgB,rgC], ()=>P.barkDk);
    }
    const forkBase = pts.at(-1);
    for(const s of [-1,1]){
      const mid = forkBase.clone().addScaledVector(SDIR,0.11).add(V(s*0.060,0.045,s*0.01));
      const tip = forkBase.clone().addScaledVector(SDIR,0.22).add(V(s*0.155,0.12,s*0.03));
      tube(forkBase, mid, 0.018,0.014,6,P.bark);
      tube(mid, tip, 0.014,0.008,6,P.barkLt, {capB:{hex:P.barkDk}});
    }
    const gu = new THREE.Vector3().crossVectors(V(0,1,0),SDIR).normalize();
    tube(GRIP.clone().addScaledVector(gu,-0.012), GRIP.clone().addScaledVector(gu,0.012), 0.026,0.026,6,P.bark);
  }

  /* ROBE — ratty under-layer (broad dragonborn) */
  stack([
    {y:L.hemY,   rx:0.290, rz:0.230, hex:P.robeDk},
    {y:L.kneeY,  rx:0.255, rz:0.205, hex:P.robe},
    {y:0.62,     rx:0.225, rz:0.180, hex:P.robe},
    {y:L.waistY, rx:0.205, rz:0.162, hex:P.robe},
    {y:L.chestY, rx:0.260, rz:0.185, hex:P.robeLt},
    {y:L.shldY,  rx:0.275, rz:0.180, hex:P.robe},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.005}});
  {
    const n=8, ph=Math.PI/n;
    const hemTop = ring(V(0,L.hemY+0.03,0), V(0,1,0), 0.300, 0.238, n, ph);
    const dropPattern = [0.0, -0.05, -0.014, -0.06, -0.022, -0.055, 0.0, -0.035];
    const hemBot = ring(V(0,L.hemY+0.03,0), V(0,1,0), 0.316, 0.250, n, ph).map((p,i)=>{ p.y += dropPattern[i]; return p; });
    stitch([hemTop, hemBot], ()=>P.robeDk);
    capFan(hemBot, V(0,L.hemY-0.05,0), P.robeDk, true);
  }
  stack([
    {y:0.805, rx:0.212, rz:0.168, hex:P.cord},
    {y:0.845, rx:0.209, rz:0.165, hex:P.cord},
  ], 8, {});
  {
    blob(0.175, 0.735, 0.135, 0.052, 0.058, 0.040, P.hideDk, 6, 4);
    for(const [ox,oz] of [[-0.12,0.155],[-0.07,0.170],[-0.02,0.160]]){
      const top=V(ox,0.805,oz), bot=V(ox+0.005,0.705,oz+0.01);
      tube(top,bot,0.006,0.006,4,P.cord);
      const charmR = ring(bot, V(0,1,0), 0.018,0.018,5);
      capFan(charmR, bot.clone().add(V(0,-0.022,0)), P.bone);
      capFan(charmR, bot.clone().add(V(0,0.006,0)), P.boneDk, true);
    }
  }

  /* HIDE/LEAF MANTLE */
  {
    const n=8, ph=Math.PI/n;
    const mantleBands=[
      {y:0.995, rx:0.310, rz:0.230, hex:P.hideDk},
      {y:1.085, rx:0.282, rz:0.205, hex:P.hide},
      {y:1.155, rx:0.250, rz:0.175, hex:P.hideLt},
    ];
    const rings = mantleBands.map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    const mantleDrop=[0.0,-0.07,-0.024,-0.09,0.0,-0.06,-0.018,-0.08];
    rings[0].forEach((p,i)=>{ p.y += mantleDrop[i]; });
    stitch(rings, (b)=>mantleBands[b].hex);
    for(const [i,yy,zz] of [[1,1.10,0.18],[4,1.11,-0.16],[6,1.04,0.12]]){
      const c=V(Math.cos(ph+i*Math.PI*2/n)*0.24, yy, Math.sin(ph+i*Math.PI*2/n)*0.170+zz*0.15);
      quad(c.clone().add(V(-0.03,0.02,0.01)), c.clone().add(V(0.03,0.018,0.012)),
           c.clone().add(V(0.02,-0.03,0.01)), c.clone().add(V(-0.02,-0.028,0.008)), P.leaf, 0.05);
    }
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

  /* ARMS — right rests high on the leaned staff grip; left reaches a lower two-handed hold */
  {
    const gu = new THREE.Vector3().crossVectors(V(0,1,0), SDIR).normalize();
    const shaftAt = (t)=> ST_BASE.clone().lerp(ST_TOP, t);
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(-0.03, 0.07, 0.06));
    const W=GRIP.clone().addScaledVector(gu, 0.034);
    tube(S,E,0.092,0.072,6,P.robe);
    tube(E,W,0.066,0.052,6,P.hideDk,{capB:{hex:P.hideDk}});
    tube(GRIP.clone().addScaledVector(gu,-0.050), GRIP.clone().addScaledVector(gu,0.050), 0.058,0.052,6,P.scale,
         {capA:{hex:P.scale}, capB:{hex:P.scale}});

    const LOW_T = 0.40;
    const LOW = shaftAt(LOW_T);
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=S2.clone().lerp(LOW, 0.5).add(V(-0.07,0.02,0.04));
    const W2 = LOW.clone().addScaledVector(gu, -0.032);
    tube(S2,E2,0.092,0.072,6,P.robe);
    tube(E2,W2,0.072,0.054,6,P.hideDk,{capB:{hex:P.hide}});
    tube(LOW.clone().addScaledVector(gu,-0.046), LOW.clone().addScaledVector(gu,0.046), 0.052,0.046,6,P.scale,
         {capA:{hex:P.scaleDk}, capB:{hex:P.scaleDk}});
  }

  /* LEGS — visible below the ragged robe hem, worn wrap-boots (broad dragonborn) */
  {
    for(const s of [-1,1]){
      const zf = s<0 ? 0.055 : -0.035;
      const top=V(s*0.12, 0.30, 0.010+zf*0.4), ank=V(s*0.135, 0.085, 0.020+zf);
      tube(top, ank, 0.062, 0.048, 6, P.robeDk);
      stack([
        {y:0.012, rx:0.068, rz:0.074, cx:ank.x, cz:ank.z, hex:P.hideDk},
        {y:0.085, rx:0.062, rz:0.064, cx:ank.x, cz:ank.z, hex:P.hide},
        {y:0.14,  rx:0.066, rz:0.066, cx:ank.x, cz:ank.z, hex:P.hideDk},
      ], 6, {capTop:{hex:P.hideDk, lift:0.005}, capBot:{hex:P.hideDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=V(s*0.12,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.135), 0.058,0.044,6,P.hideDk, {capB:{hex:P.hideDk, lift:0.014}, raz:0.050, rbz:0.034});
    }
  }

  /* TAIL — thick tapering dragonborn tail (inherited) */
  {
    const root = V(0.04, L.waistY-0.22, -0.245);
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

  /* base disc (mossy) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
