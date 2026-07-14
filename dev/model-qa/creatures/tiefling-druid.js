/* dev/model-qa/creatures/tiefling-druid.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED tiefling race (slim ~1.45u frame, dusky red-mauve skin, backswept HORNS, sharp GOATEE,
   thin spade-tipped TAIL) wearing the DRUID kit (druid.js signature: a GNARLED forked STAFF authored
   first raked to a leaned-on lean, a hide/leaf MANTLE over the shoulders, a ratty robe with a
   bone-charm belt). The antler headdress is DROPPED (the tiefling's own horns are the crown); a wild
   infernal hedge-witch. EYELESS. One whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTieflingDruid(){
  const P = {
    hide:0x6b5a3c, hideDk:0x4d4029, hideLt:0x7f6d4a,
    robe:0x5a5432, robeDk:0x413d24, robeLt:0x6d6640,
    leaf:0x5c6b3a, leafDk:0x424e29,
    bark:0x5c4325, barkDk:0x3f2e19, barkLt:0x715334,
    bone:0xe4dcc4, boneDk:0xb0a882,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a, hair:0x2a2320,
    cord:0x6b5535, disc:0x453a2c, discTop:0x554836,
  };

  const L = {
    hemY:0.06, kneeY:0.40, waistY:0.765, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.220,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* GNARLED STAFF FIRST — raked to a leaned-on lean */
  const ST_BASE = V(-0.345, 0.02, 0.28);
  const ST_TOP  = V(-0.135, 1.53, 0.05);
  const SDIR = new THREE.Vector3().subVectors(ST_TOP, ST_BASE).normalize();
  const GRIP = ST_BASE.clone().lerp(ST_TOP, 0.66);
  {
    const knots = [0, 0.16, 0.34, 0.52, 0.70, 0.85, 1.0];
    const jitter = [ [0.012,-0.008], [-0.010,0.014], [0.014,0.006], [-0.008,-0.012], [0.010,0.010], [-0.006,0.004], [0,0] ];
    const pts = knots.map((t,i)=> ST_BASE.clone().lerp(ST_TOP, t).add(V(jitter[i][0], 0, jitter[i][1])) );
    for(let i=0;i<pts.length-1;i++){
      const rA = 0.024 - i*0.0020, rB = 0.024 - (i+1)*0.0020;
      tube(pts[i], pts[i+1], Math.max(rA,0.010), Math.max(rB,0.010), 6, i%2?P.bark:P.barkLt);
    }
    for(let i=1;i<pts.length-1;i++){
      const r = 0.028 - i*0.002;
      const rgA = ring(pts[i].clone().addScaledVector(SDIR,-0.018), SDIR, r*0.7, r*0.7, 6);
      const rgB = ring(pts[i], SDIR, r, r, 6);
      const rgC = ring(pts[i].clone().addScaledVector(SDIR, 0.018), SDIR, r*0.7, r*0.7, 6);
      stitch([rgA,rgB,rgC], ()=>P.barkDk);
    }
    const forkBase = pts.at(-1);
    for(const s of [-1,1]){
      const mid = forkBase.clone().addScaledVector(SDIR,0.10).add(V(s*0.052,0.04,s*0.01));
      const tip = forkBase.clone().addScaledVector(SDIR,0.20).add(V(s*0.140,0.11,s*0.03));
      tube(forkBase, mid, 0.016,0.012,6,P.bark);
      tube(mid, tip, 0.012,0.007,6,P.barkLt, {capB:{hex:P.barkDk}});
      const nub = mid.clone().add(V(s*0.03,0.02,-0.02));
      tube(mid, nub, 0.007,0.003,4,P.barkDk,{capB:{hex:P.barkDk}});
    }
    const gu = new THREE.Vector3().crossVectors(V(0,1,0),SDIR).normalize();
    tube(GRIP.clone().addScaledVector(gu,-0.01), GRIP.clone().addScaledVector(gu,0.01), 0.022,0.022,6,P.bark);
  }

  /* ROBE — ratty under-layer (slim tiefling) */
  stack([
    {y:L.hemY,   rx:0.215, rz:0.175, hex:P.robeDk},
    {y:L.kneeY,  rx:0.188, rz:0.152, hex:P.robe},
    {y:0.56,     rx:0.166, rz:0.136, hex:P.robe},
    {y:L.waistY, rx:0.148, rz:0.118, hex:P.robe},
    {y:L.chestY, rx:0.172, rz:0.132, hex:P.robeLt},
    {y:L.shldY,  rx:0.176, rz:0.120, hex:P.robe},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  {
    const n=8, ph=Math.PI/n;
    const hemTop = ring(V(0,L.hemY+0.03,0), V(0,1,0), 0.225, 0.182, n, ph);
    const dropPattern = [0.0, -0.045, -0.012, -0.058, -0.02, -0.05, 0.0, -0.03];
    const hemBot = ring(V(0,L.hemY+0.03,0), V(0,1,0), 0.238, 0.192, n, ph).map((p,i)=>{ p.y += dropPattern[i]; return p; });
    stitch([hemTop, hemBot], ()=>P.robeDk);
    capFan(hemBot, V(0,L.hemY-0.05,0), P.robeDk, true);
  }
  /* belt + bone charms */
  stack([
    {y:0.720, rx:0.156, rz:0.124, hex:P.cord},
    {y:0.760, rx:0.153, rz:0.121, hex:P.cord},
  ], 8, {});
  {
    blob(0.130, 0.665, 0.105, 0.044, 0.050, 0.034, P.hideDk, 6, 4);
    for(const [ox,oz] of [[-0.09,0.120],[-0.055,0.132],[-0.02,0.122]]){
      const top=V(ox,0.720,oz), bot=V(ox+0.005,0.625,oz+0.01);
      tube(top,bot,0.006,0.006,4,P.cord);
      const charmR = ring(bot, V(0,1,0), 0.016,0.016,5);
      capFan(charmR, bot.clone().add(V(0,-0.020,0)), P.bone);
      capFan(charmR, bot.clone().add(V(0,0.006,0)), P.boneDk, true);
    }
  }

  /* HIDE/LEAF MANTLE */
  {
    const n=8, ph=Math.PI/n;
    const mantleBands=[
      {y:0.915, rx:0.245, rz:0.185, hex:P.hideDk},
      {y:1.005, rx:0.222, rz:0.162, hex:P.hide},
      {y:1.075, rx:0.194, rz:0.136, hex:P.hideLt},
    ];
    const rings = mantleBands.map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    const mantleDrop=[0.0,-0.06,-0.02,-0.08,0.0,-0.05,-0.015,-0.07];
    rings[0].forEach((p,i)=>{ p.y += mantleDrop[i]; });
    stitch(rings, (b)=>mantleBands[b].hex);
    for(const [i,yy,zz] of [[1,1.02,0.14],[4,1.03,-0.12],[6,0.97,0.09]]){
      const c=V(Math.cos(ph+i*Math.PI*2/n)*0.18, yy, Math.sin(ph+i*Math.PI*2/n)*0.130+zz*0.15);
      quad(c.clone().add(V(-0.03,0.02,0.01)), c.clone().add(V(0.03,0.018,0.012)),
           c.clone().add(V(0.02,-0.03,0.01)), c.clone().add(V(-0.02,-0.028,0.008)), P.leaf, 0.05);
    }
  }

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

  /* ARMS — right rests high on the leaned staff grip; left reaches a lower two-handed hold */
  {
    const gu = new THREE.Vector3().crossVectors(V(0,1,0), SDIR).normalize();
    const shaftAt = (t)=> ST_BASE.clone().lerp(ST_TOP, t);
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(-0.02, 0.06, 0.06));
    const W=GRIP.clone().addScaledVector(gu, 0.026);
    tube(S,E,0.066,0.052,6,P.robe);
    tube(E,W,0.048,0.040,6,P.hideDk,{capB:{hex:P.hideDk}});
    tube(GRIP.clone().addScaledVector(gu,-0.038), GRIP.clone().addScaledVector(gu,0.038), 0.042,0.038,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const LOW_T = 0.40;
    const LOW = shaftAt(LOW_T);
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=S2.clone().lerp(LOW, 0.5).add(V(-0.06,0.02,0.04));
    const W2 = LOW.clone().addScaledVector(gu, -0.024);
    tube(S2,E2,0.066,0.052,6,P.robe);
    tube(E2,W2,0.056,0.042,6,P.hideDk,{capB:{hex:P.hide}});
    tube(LOW.clone().addScaledVector(gu,-0.034), LOW.clone().addScaledVector(gu,0.034), 0.036,0.032,6,P.skin,
         {capA:{hex:P.skinDk}, capB:{hex:P.skinDk}});
  }

  /* LEGS — visible below the ragged robe hem, worn wrap-boots (slim tiefling) */
  {
    for(const s of [-1,1]){
      const zf = s<0 ? 0.055 : -0.035;
      const top=V(s*0.09, 0.30, 0.010+zf*0.4), ank=V(s*0.10, 0.085, 0.020+zf);
      tube(top, ank, 0.050, 0.038, 6, P.robeDk);
      stack([
        {y:0.012, rx:0.054, rz:0.060, cx:ank.x, cz:ank.z, hex:P.hideDk},
        {y:0.075, rx:0.048, rz:0.050, cx:ank.x, cz:ank.z, hex:P.hide},
        {y:0.13,  rx:0.052, rz:0.052, cx:ank.x, cz:ank.z, hex:P.hideDk},
      ], 6, {capTop:{hex:P.hideDk, lift:0.005}, capBot:{hex:P.hideDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=V(s*0.12,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.115), 0.046,0.034,6,P.hideDk, {capB:{hex:P.hideDk, lift:0.012}, raz:0.040, rbz:0.028});
    }
  }

  /* TAIL — thin spade-tipped tail (inherited) */
  {
    const root = V(0.030, L.waistY-0.045, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.robeDk);
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

  /* base disc (mossy) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
