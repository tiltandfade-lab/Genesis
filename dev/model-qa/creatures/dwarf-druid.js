/* dev/model-qa/creatures/dwarf-druid.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED dwarf race (squat-broad race-dwarf proportions + massive beard + eyeless head) wearing the
   DRUID kit (druid.js signature: a GNARLED forked STAFF authored first + raked to a leaned-on communing
   lean, a hide/leaf MANTLE over the shoulders, an ANTLER/branch headdress, a ratty robe with a bone-
   charm belt). The dwarf's beard reads as the weathered mountain-hermit; antlers rise off the cowl.
   One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDwarfDruid(){
  const P = {
    hide:0x6b5a3c, hideDk:0x4d4029, hideLt:0x7f6d4a,
    robe:0x5a5432, robeDk:0x413d24, robeLt:0x6d6640,
    leaf:0x5c6b3a, leafDk:0x424e29,
    bark:0x5c4325, barkDk:0x3f2e19, barkLt:0x715334,
    antler:0xcbbfa0, antlerDk:0x9a8e6f,
    bone:0xe4dcc4, boneDk:0xb0a882,
    skin:0xb98a63, skinDk:0x7f5f42,
    beard:0x9a9086, beardDk:0x6d655c,
    cowl:0x453824, cowlDk:0x2f2618, eye:0x1a1512,
    cord:0x6b5535, disc:0x453a2c, discTop:0x554836,
  };

  /* dwarf landmarks, but the robe is the lower body (hem at the disc) */
  const L = {
    hemY:0.04, kneeY:0.22, waistY:0.475, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.245,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* GNARLED STAFF FIRST — raked to a leaned-on lean, base out-left on the disc, top angled in */
  const ST_BASE = V(-0.395, 0.02, 0.30);
  const ST_TOP  = V(-0.170, 1.22, 0.02);
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
      const mid = forkBase.clone().addScaledVector(SDIR,0.10).add(V(s*0.055,0.040,s*0.01));
      const tip = forkBase.clone().addScaledVector(SDIR,0.20).add(V(s*0.140,0.11,s*0.03));
      tube(forkBase, mid, 0.018,0.014,6,P.bark);
      tube(mid, tip, 0.014,0.008,6,P.barkLt, {capB:{hex:P.barkDk}});
    }
    const gu = new THREE.Vector3().crossVectors(V(0,1,0),SDIR).normalize();
    tube(GRIP.clone().addScaledVector(gu,-0.012), GRIP.clone().addScaledVector(gu,0.012), 0.028,0.028,6,P.bark);
  }

  /* ROBE — ratty under-layer, hips->neck (dwarf broad) */
  stack([
    {y:L.hemY,   rx:0.258, rz:0.208, hex:P.robeDk},
    {y:L.kneeY,  rx:0.246, rz:0.196, hex:P.robe},
    {y:0.40,     rx:0.238, rz:0.188, hex:P.robe},
    {y:L.waistY, rx:0.235, rz:0.182, hex:P.robe},
    {y:L.chestY, rx:0.258, rz:0.198, hex:P.robeLt},
    {y:L.shldY,  rx:0.260, rz:0.190, hex:P.robe},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});
  /* uneven ragged hem */
  {
    const n=8, ph=Math.PI/n;
    const hemTop = ring(V(0,L.hemY+0.03,0), V(0,1,0), 0.264, 0.212, n, ph);
    const dropPattern = [0.0, -0.05, -0.014, -0.06, -0.022, -0.055, 0.0, -0.035];
    const hemBot = ring(V(0,L.hemY+0.03,0), V(0,1,0), 0.278, 0.222, n, ph).map((p,i)=>{ p.y += dropPattern[i]; return p; });
    stitch([hemTop, hemBot], ()=>P.robeDk);
    capFan(hemBot, V(0,L.hemY-0.05,0), P.robeDk, true);
  }
  /* belt + bone charms */
  stack([
    {y:L.waistY-0.02, rx:0.242, rz:0.190, hex:P.cord},
    {y:L.waistY+0.02, rx:0.240, rz:0.188, hex:P.cord},
  ], 8, {});
  {
    blob(0.190, 0.415, 0.185, 0.052, 0.058, 0.040, P.hideDk, 6, 4);
    for(const [ox,oz] of [[-0.13,0.200],[-0.07,0.216],[-0.01,0.206]]){
      const top=V(ox,0.470,oz), bot=V(ox+0.005,0.375,oz+0.01);
      tube(top,bot,0.006,0.006,4,P.cord);
      const charmR = ring(bot, V(0,1,0), 0.018,0.018,5);
      capFan(charmR, bot.clone().add(V(0,-0.022,0)), P.bone);
      capFan(charmR, bot.clone().add(V(0,0.006,0)), P.boneDk, true);
    }
  }

  /* HIDE/LEAF MANTLE — over the shoulders, uneven points (dwarf broad) */
  {
    const n=8, ph=Math.PI/n;
    const mantleBands=[
      {y:0.595, rx:0.290, rz:0.216, hex:P.hideDk},
      {y:0.665, rx:0.266, rz:0.196, hex:P.hide},
      {y:0.720, rx:0.238, rz:0.170, hex:P.hideLt},
    ];
    const rings = mantleBands.map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    const mantleDrop=[0.0,-0.06,-0.020,-0.08,0.0,-0.05,-0.016,-0.07];
    rings[0].forEach((p,i)=>{ p.y += mantleDrop[i]; });
    stitch(rings, (b)=>mantleBands[b].hex);
  }

  /* HEAD — inherited dwarf (eyeless) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.104, hex:P.skin},
      {y:L.cheekY, rx:0.128, rz:0.122, hex:P.skin},
      {y:L.browY,  rx:0.132, rz:0.118, hex:P.skin},
      {y:L.crownY, rx:0.100, rz:0.090, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.026;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
  }

  /* MASSIVE BEARD (inherited) */
  {
    const bands=[
      {y:L.jawY+0.005, rx:0.125, rz:0.095, cz:0.135, hex:P.beard},
      {y:L.cheekY-0.05, rx:0.120, rz:0.088, cz:0.185, hex:P.beard},
      {y:0.735,         rx:0.112, rz:0.080, cz:0.225, hex:P.beard},
      {y:0.665,         rx:0.100, rz:0.070, cz:0.250, hex:P.beard},
      {y:0.59,          rx:0.086, rz:0.060, cz:0.260, hex:P.beardDk},
      {y:0.515,         rx:0.066, rz:0.048, cz:0.250, hex:P.beardDk},
      {y:L.waistY+0.01, rx:0.044, rz:0.034, cz:0.215, hex:P.beardDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.waistY-0.03,0.185), P.beardDk);
  }

  /* HIDE COWL — low, open-faced, under the antlers */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.004, rx:0.132, rz:0.124, hex:P.cowlDk},
      {y:L.jawY+0.020,  rx:0.160, rz:0.148, hex:P.cowl},
      {y:L.browY+0.02,  rx:0.164, rz:0.148, hex:P.cowl},
      {y:L.crownY+0.02, rx:0.128, rz:0.118, hex:P.cowl},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.007), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.015);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0.01, L.headTopY+0.03, -0.025), P.cowlDk);
  }

  /* ANTLER / BRANCH HEADDRESS — two branching tube-pairs off the cowl */
  {
    for(const s of [-1,1]){
      const root = V(s*0.058, L.crownY+0.04, -0.01);
      const mainTip = root.clone().add(V(s*0.055, 0.185, -0.030));
      tube(root, mainTip, 0.018,0.011,6,P.antlerDk);
      const fork1Base = root.clone().lerp(mainTip, 0.38);
      const fork1Tip = fork1Base.clone().add(V(s*0.090, 0.075, 0.055));
      tube(fork1Base, fork1Tip, 0.011,0.005,5,P.antler,{capB:{hex:P.antler}});
      const fork2Base = root.clone().lerp(mainTip, 0.68);
      const fork2Tip = fork2Base.clone().add(V(s*0.072, 0.095, -0.048));
      tube(fork2Base, fork2Tip, 0.010,0.004,5,P.antler,{capB:{hex:P.antler}});
      tube(fork2Base, mainTip, 0.010,0.005,5,P.antler,{capB:{hex:P.antler}});
    }
  }

  /* ARMS — right rests high on the leaned staff grip; left reaches a lower two-handed hold */
  {
    const gu = new THREE.Vector3().crossVectors(V(0,1,0), SDIR).normalize();
    const shaftAt = (t)=> ST_BASE.clone().lerp(ST_TOP, t);
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(-0.02, 0.05, 0.06));
    const W=GRIP.clone().addScaledVector(gu, 0.034);
    tube(S,E,0.092,0.072,6,P.robe);
    tube(E,W,0.066,0.052,6,P.hideDk,{capB:{hex:P.hideDk}});
    tube(GRIP.clone().addScaledVector(gu,-0.050), GRIP.clone().addScaledVector(gu,0.050), 0.058,0.052,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const LOW_T = 0.42;
    const LOW = shaftAt(LOW_T);
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=S2.clone().lerp(LOW, 0.5).add(V(-0.05,0.02,0.04));
    const W2 = LOW.clone().addScaledVector(gu, -0.032);
    tube(S2,E2,0.092,0.072,6,P.robe);
    tube(E2,W2,0.070,0.054,6,P.hideDk,{capB:{hex:P.hide}});
    tube(LOW.clone().addScaledVector(gu,-0.046), LOW.clone().addScaledVector(gu,0.046), 0.052,0.046,6,P.skin,
         {capA:{hex:P.skinDk}, capB:{hex:P.skinDk}});
  }

  /* LEGS — visible below the ragged robe hem, worn wrap-boots (dwarf broad) */
  {
    for(const s of [-1,1]){
      const zf = s<0 ? 0.05 : -0.03;
      const top=V(s*0.13, 0.22, 0.010+zf*0.4), ank=V(s*0.155, 0.085, 0.020+zf);
      tube(top, ank, 0.078, 0.058, 6, P.robeDk);
      stack([
        {y:0.012, rx:0.076, rz:0.082, cx:ank.x, cz:ank.z, hex:P.hideDk},
        {y:0.09,  rx:0.070, rz:0.072, cx:ank.x, cz:ank.z, hex:P.hide},
      ], 6, {capTop:{hex:P.hideDk, lift:0.005}, capBot:{hex:P.hideDk, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=V(s*0.12,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.135), 0.064,0.048,6,P.hideDk, {capB:{hex:P.hideDk, lift:0.014}, raz:0.054, rbz:0.038});
    }
  }

  /* base disc (mossy) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
