/* dev/model-qa/creatures/gnome-druid.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED gnome race (post-F1 big head + wedge EARS + eyeless, stubby frame) wearing the DRUID kit
   (druid.js signature: a GNARLED forked STAFF authored first + raked to a leaned-on communing lean, a
   hide/leaf MANTLE over the shoulders, an ANTLER/branch headdress, a ratty robe with a bone-charm belt).
   A tiny gnome hedge-druid — the big head + ears (peeking under the cowl) keep the race read. One
   whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGnomeDruid(){
  const P = {
    hide:0x6b5a3c, hideDk:0x4d4029, hideLt:0x7f6d4a,
    robe:0x5a5432, robeDk:0x413d24, robeLt:0x6d6640,
    leaf:0x5c6b3a, leafDk:0x424e29,
    bark:0x5c4325, barkDk:0x3f2e19, barkLt:0x715334,
    antler:0xcbbfa0, antlerDk:0x9a8e6f,
    bone:0xe4dcc4, boneDk:0xb0a882,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    cowl:0x453824, cowlDk:0x2f2618,
    cord:0x6b5535, disc:0x453a2c, discTop:0x554836,
  };

  /* gnome landmarks, robe is the lower body (hem at the disc) */
  const L = {
    hemY:0.03, kneeY:0.18, waistY:0.375, chestY:0.465, shldY:0.485, neckY:0.515,
    shoulderX:0.145,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* GNARLED STAFF FIRST — raked to a leaned-on lean, base out-left on the disc, top angled in */
  const ST_BASE = V(-0.290, 0.02, 0.22);
  const ST_TOP  = V(-0.130, 0.98, 0.02);
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

  /* ROBE — ratty, hips->neck (gnome) */
  stack([
    {y:L.hemY,   rx:0.190, rz:0.156, hex:P.robeDk},
    {y:L.kneeY,  rx:0.180, rz:0.148, hex:P.robe},
    {y:0.30,     rx:0.176, rz:0.146, hex:P.robe},
    {y:L.waistY, rx:0.178, rz:0.150, hex:P.robe},
    {y:L.chestY, rx:0.158, rz:0.130, hex:P.robeLt},
    {y:L.shldY,  rx:0.150, rz:0.122, hex:P.robe},
    {y:L.neckY,  rx:0.070, rz:0.066, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  /* uneven ragged hem */
  {
    const n=8, ph=Math.PI/n;
    const hemTop = ring(V(0,L.hemY+0.02,0), V(0,1,0), 0.196, 0.160, n, ph);
    const dropPattern = [0.0, -0.035, -0.010, -0.042, -0.016, -0.038, 0.0, -0.024];
    const hemBot = ring(V(0,L.hemY+0.02,0), V(0,1,0), 0.208, 0.170, n, ph).map((p,i)=>{ p.y += dropPattern[i]; return p; });
    stitch([hemTop, hemBot], ()=>P.robeDk);
    capFan(hemBot, V(0,L.hemY-0.03,0), P.robeDk, true);
  }
  /* belt + bone charms */
  stack([
    {y:L.waistY-0.02, rx:0.180, rz:0.152, hex:P.cord},
    {y:L.waistY+0.015, rx:0.178, rz:0.150, hex:P.cord},
  ], 8, {});
  {
    blob(0.130, 0.32, 0.135, 0.038, 0.042, 0.030, P.hideDk, 6, 4);
    for(const [ox,oz] of [[-0.09,0.150],[-0.04,0.160]]){
      const top=V(ox,0.370,oz), bot=V(ox+0.004,0.300,oz+0.008);
      tube(top,bot,0.005,0.005,4,P.cord);
      const charmR = ring(bot, V(0,1,0), 0.013,0.013,5);
      capFan(charmR, bot.clone().add(V(0,-0.016,0)), P.bone);
    }
  }

  /* HIDE/LEAF MANTLE — over the shoulders */
  {
    const n=8, ph=Math.PI/n;
    const mantleBands=[
      {y:0.44,  rx:0.190, rz:0.148, hex:P.hideDk},
      {y:0.485, rx:0.174, rz:0.134, hex:P.hide},
      {y:0.52,  rx:0.150, rz:0.114, hex:P.hideLt},
    ];
    const rings = mantleBands.map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    const mantleDrop=[0.0,-0.04,-0.014,-0.05,0.0,-0.035,-0.012,-0.045];
    rings[0].forEach((p,i)=>{ p.y += mantleDrop[i]; });
    stitch(rings, (b)=>mantleBands[b].hex);
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

  /* HIDE COWL — low, open-faced, under the antlers */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.004, rx:0.132, rz:0.124, hex:P.cowlDk},
      {y:L.jawY+0.020,  rx:0.168, rz:0.154, hex:P.cowl},
      {y:L.browY+0.02,  rx:0.172, rz:0.154, hex:P.cowl},
      {y:L.crownY+0.02, rx:0.128, rz:0.118, hex:P.cowl},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.007), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.014);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0.01, L.headTopY+0.03, -0.02), P.cowlDk);
  }

  /* ANTLER / BRANCH HEADDRESS */
  {
    for(const s of [-1,1]){
      const root = V(s*0.055, L.crownY+0.04, -0.01);
      const mainTip = root.clone().add(V(s*0.050, 0.150, -0.026));
      tube(root, mainTip, 0.015,0.009,6,P.antlerDk);
      const fork1Base = root.clone().lerp(mainTip, 0.38);
      const fork1Tip = fork1Base.clone().add(V(s*0.070, 0.060, 0.044));
      tube(fork1Base, fork1Tip, 0.009,0.004,5,P.antler,{capB:{hex:P.antler}});
      const fork2Base = root.clone().lerp(mainTip, 0.68);
      const fork2Tip = fork2Base.clone().add(V(s*0.058, 0.075, -0.038));
      tube(fork2Base, fork2Tip, 0.008,0.003,5,P.antler,{capB:{hex:P.antler}});
    }
  }

  /* ARMS — right rests high on the leaned staff grip; left reaches a lower two-handed hold */
  {
    const gu = new THREE.Vector3().crossVectors(V(0,1,0), SDIR).normalize();
    const shaftAt = (t)=> ST_BASE.clone().lerp(ST_TOP, t);
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(-0.02, 0.04, 0.05));
    const W=GRIP.clone().addScaledVector(gu, 0.026);
    tube(S,E,0.056,0.044,6,P.robe);
    tube(E,W,0.044,0.034,6,P.hideDk,{capB:{hex:P.hideDk}});
    tube(GRIP.clone().addScaledVector(gu,-0.036), GRIP.clone().addScaledVector(gu,0.036), 0.038,0.034,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const LOW_T = 0.42;
    const LOW = shaftAt(LOW_T);
    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=S2.clone().lerp(LOW, 0.5).add(V(-0.04,0.01,0.03));
    const W2 = LOW.clone().addScaledVector(gu, -0.024);
    tube(S2,E2,0.056,0.044,6,P.robe);
    tube(E2,W2,0.046,0.034,6,P.hideDk,{capB:{hex:P.hide}});
    tube(LOW.clone().addScaledVector(gu,-0.034), LOW.clone().addScaledVector(gu,0.034), 0.036,0.032,6,P.skin,
         {capA:{hex:P.skinDk}, capB:{hex:P.skinDk}});
  }

  /* LEGS — worn wrap-boots below the ragged hem */
  {
    for(const s of [-1,1]){
      const zf = s<0 ? 0.04 : -0.02;
      const top=V(s*0.09, 0.18, 0.010+zf*0.4), ank=V(s*0.10, 0.075, 0.015+zf);
      tube(top, ank, 0.046, 0.036, 6, P.robeDk);
      stack([
        {y:0.010, rx:0.052, rz:0.056, cx:ank.x, cz:ank.z, hex:P.hideDk},
        {y:0.07,  rx:0.046, rz:0.048, cx:ank.x, cz:ank.z, hex:P.hide},
      ], 6, {capTop:{hex:P.hideDk, lift:0.005}, capBot:{hex:P.hideDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=V(s*0.12,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.100), 0.046,0.034,6,P.hideDk, {capB:{hex:P.hideDk, lift:0.012}, raz:0.040, rbz:0.028});
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
