/* dev/model-qa/creatures/halfling-druid.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet — the icon) wearing the
   DRUID kit (druid.js signature: a GNARLED forked STAFF authored first + raked to a leaned-on communing
   lean, a hide/leaf MANTLE over the shoulders, an ANTLER/branch headdress nested in the curls, a ratty
   robe with a bone-charm belt). Bare feet inherited (a barefoot hedge-druid). One whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildHalflingDruid(){
  const P = {
    hide:0x6b5a3c, hideDk:0x4d4029, hideLt:0x7f6d4a,
    robe:0x5a5432, robeDk:0x413d24, robeLt:0x6d6640,
    leaf:0x5c6b3a, leafDk:0x424e29,
    bark:0x5c4325, barkDk:0x3f2e19, barkLt:0x715334,
    antler:0xcbbfa0, antlerDk:0x9a8e6f,
    bone:0xe4dcc4, boneDk:0xb0a882,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a,
    cowl:0x453824, cowlDk:0x2f2618, eye:0x1a1512,
    cord:0x6b5535, disc:0x453a2c, discTop:0x554836,
  };

  const L = {
    hemY:0.04, kneeY:0.24, waistY:0.42, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* GNARLED STAFF FIRST — raked to a leaned-on lean, base out-left, top angled in */
  const ST_BASE = V(-0.290, 0.02, 0.22);
  const ST_TOP  = V(-0.130, 1.10, 0.02);
  const SDIR = new THREE.Vector3().subVectors(ST_TOP, ST_BASE).normalize();
  const GRIP = ST_BASE.clone().lerp(ST_TOP, 0.62);
  {
    const knots = [0, 0.16, 0.34, 0.52, 0.70, 0.85, 1.0];
    const jitter = [ [0.010,-0.006], [-0.008,0.010], [0.010,0.004], [-0.006,-0.008], [0.008,0.008], [-0.004,0.003], [0,0] ];
    const pts = knots.map((t,i)=> ST_BASE.clone().lerp(ST_TOP, t).add(V(jitter[i][0], 0, jitter[i][1])) );
    for(let i=0;i<pts.length-1;i++){
      const rA = 0.022 - i*0.0018, rB = 0.022 - (i+1)*0.0018;
      tube(pts[i], pts[i+1], Math.max(rA,0.008), Math.max(rB,0.008), 6, i%2?P.bark:P.barkLt);
    }
    for(let i=1;i<pts.length-1;i++){
      const r = 0.026 - i*0.0016;
      const rgA = ring(pts[i].clone().addScaledVector(SDIR,-0.014), SDIR, r*0.7, r*0.7, 6);
      const rgB = ring(pts[i], SDIR, r, r, 6);
      const rgC = ring(pts[i].clone().addScaledVector(SDIR, 0.014), SDIR, r*0.7, r*0.7, 6);
      stitch([rgA,rgB,rgC], ()=>P.barkDk);
    }
    const forkBase = pts.at(-1);
    for(const s of [-1,1]){
      const mid = forkBase.clone().addScaledVector(SDIR,0.08).add(V(s*0.044,0.032,s*0.008));
      const tip = forkBase.clone().addScaledVector(SDIR,0.16).add(V(s*0.110,0.090,s*0.024));
      tube(forkBase, mid, 0.014,0.011,6,P.bark);
      tube(mid, tip, 0.011,0.006,6,P.barkLt, {capB:{hex:P.barkDk}});
    }
    const gu = new THREE.Vector3().crossVectors(V(0,1,0),SDIR).normalize();
    tube(GRIP.clone().addScaledVector(gu,-0.010), GRIP.clone().addScaledVector(gu,0.010), 0.022,0.022,6,P.bark);
  }

  /* ROBE — ratty, hips->neck (halfling slim) */
  stack([
    {y:L.hemY,   rx:0.130, rz:0.108, hex:P.robeDk},
    {y:L.kneeY,  rx:0.124, rz:0.102, hex:P.robe},
    {y:0.36,     rx:0.120, rz:0.098, hex:P.robe},
    {y:L.waistY, rx:0.118, rz:0.096, hex:P.robe},
    {y:L.chestY, rx:0.130, rz:0.100, hex:P.robeLt},
    {y:L.shldY,  rx:0.132, rz:0.096, hex:P.robe},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  /* uneven ragged hem */
  {
    const n=8, ph=Math.PI/n;
    const hemTop = ring(V(0,L.hemY+0.02,0), V(0,1,0), 0.136, 0.112, n, ph);
    const dropPattern = [0.0, -0.030, -0.008, -0.036, -0.012, -0.032, 0.0, -0.020];
    const hemBot = ring(V(0,L.hemY+0.02,0), V(0,1,0), 0.146, 0.120, n, ph).map((p,i)=>{ p.y += dropPattern[i]; return p; });
    stitch([hemTop, hemBot], ()=>P.robeDk);
    capFan(hemBot, V(0,L.hemY-0.03,0), P.robeDk, true);
  }
  /* belt + bone charms */
  stack([
    {y:L.waistY-0.02, rx:0.120, rz:0.098, hex:P.cord},
    {y:L.waistY+0.015, rx:0.118, rz:0.096, hex:P.cord},
  ], 8, {});
  {
    blob(0.090, 0.36, 0.098, 0.034, 0.038, 0.026, P.hideDk, 6, 4);
    for(const [ox,oz] of [[-0.06,0.104],[-0.02,0.112]]){
      const top=V(ox,0.415,oz), bot=V(ox+0.004,0.350,oz+0.008);
      tube(top,bot,0.005,0.005,4,P.cord);
      const charmR = ring(bot, V(0,1,0), 0.012,0.012,5);
      capFan(charmR, bot.clone().add(V(0,-0.014,0)), P.bone);
    }
  }

  /* HIDE/LEAF MANTLE — over the shoulders */
  {
    const n=8, ph=Math.PI/n;
    const mantleBands=[
      {y:0.52,  rx:0.150, rz:0.118, hex:P.hideDk},
      {y:0.565, rx:0.136, rz:0.106, hex:P.hide},
      {y:0.60,  rx:0.116, rz:0.088, hex:P.hideLt},
    ];
    const rings = mantleBands.map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    const mantleDrop=[0.0,-0.03,-0.010,-0.04,0.0,-0.026,-0.008,-0.034];
    rings[0].forEach((p,i)=>{ p.y += mantleDrop[i]; });
    stitch(rings, (b)=>mantleBands[b].hex);
  }

  /* HEAD — inherited halfling */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.072, rz:0.078, hex:P.skin},
      {y:L.cheekY, rx:0.098, rz:0.096, hex:P.skin},
      {y:L.browY,  rx:0.102, rz:0.094, hex:P.skin},
      {y:L.crownY, rx:0.080, rz:0.072, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);
  }

  /* CURLS peeking at the temples (under the cowl) */
  for(const s of [-1,1]){
    const cx=s*0.092, cz=0.020, cy=L.cheekY+0.006;
    tube(V(cx,cy,cz), V(cx*1.08,cy-0.03,cz+0.01), 0.020,0.016,4,P.hair,{capB:{hex:P.hairDk}});
  }

  /* HIDE COWL — low, open-faced, under the antlers */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.004, rx:0.100, rz:0.094, hex:P.cowlDk},
      {y:L.jawY+0.015,  rx:0.128, rz:0.118, hex:P.cowl},
      {y:L.browY+0.02,  rx:0.132, rz:0.118, hex:P.cowl},
      {y:L.crownY+0.02, rx:0.098, rz:0.090, hex:P.cowl},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.012);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0.01, L.headTopY+0.02, -0.02), P.cowlDk);
  }

  /* ANTLER / BRANCH HEADDRESS */
  {
    for(const s of [-1,1]){
      const root = V(s*0.042, L.crownY+0.03, -0.01);
      const mainTip = root.clone().add(V(s*0.040, 0.130, -0.024));
      tube(root, mainTip, 0.013,0.008,6,P.antlerDk);
      const fork1Base = root.clone().lerp(mainTip, 0.38);
      const fork1Tip = fork1Base.clone().add(V(s*0.060, 0.050, 0.038));
      tube(fork1Base, fork1Tip, 0.008,0.004,5,P.antler,{capB:{hex:P.antler}});
      const fork2Base = root.clone().lerp(mainTip, 0.68);
      const fork2Tip = fork2Base.clone().add(V(s*0.050, 0.065, -0.034));
      tube(fork2Base, fork2Tip, 0.007,0.003,5,P.antler,{capB:{hex:P.antler}});
    }
  }

  /* ARMS — right rests high on the leaned staff grip; left reaches a lower two-handed hold */
  {
    const gu = new THREE.Vector3().crossVectors(V(0,1,0), SDIR).normalize();
    const shaftAt = (t)=> ST_BASE.clone().lerp(ST_TOP, t);
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(-0.02, 0.04, 0.05));
    const W=GRIP.clone().addScaledVector(gu, 0.024);
    tube(S,E,0.048,0.038,6,P.robe);
    tube(E,W,0.036,0.028,6,P.hideDk,{capB:{hex:P.hideDk}});
    tube(GRIP.clone().addScaledVector(gu,-0.032), GRIP.clone().addScaledVector(gu,0.032), 0.030,0.026,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const LOW_T = 0.42;
    const LOW = shaftAt(LOW_T);
    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=S2.clone().lerp(LOW, 0.5).add(V(-0.04,0.01,0.03));
    const W2 = LOW.clone().addScaledVector(gu, -0.022);
    tube(S2,E2,0.048,0.038,6,P.robe);
    tube(E2,W2,0.038,0.028,6,P.hideDk,{capB:{hex:P.hide}});
    tube(LOW.clone().addScaledVector(gu,-0.030), LOW.clone().addScaledVector(gu,0.030), 0.030,0.026,6,P.skin,
         {capA:{hex:P.skinDk}, capB:{hex:P.skinDk}});
  }

  /* LEGS — BARE oversized feet below the ragged hem */
  {
    for(const s of [-1,1]){
      const zf = s<0 ? 0.03 : -0.02;
      const top=V(s*0.078, 0.24, 0.010+zf*0.4), shin=V(s*0.088, 0.185, 0.015+zf);
      tube(top, shin, 0.044, 0.036, 6, P.robeDk);
      const ankBot=V(shin.x, 0.075, shin.z);
      tube(shin, ankBot, 0.036, 0.056, 6, P.skin);
      stack([
        {y:0.016, rx:0.076, rz:0.094, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.065, rx:0.070, rz:0.082, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.040,shin.z), d=V(s*0.12,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.150), 0.070,0.052,6,P.footpad, {capB:{hex:P.footpad, lift:0.016}, raz:0.060, rbz:0.042});
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
