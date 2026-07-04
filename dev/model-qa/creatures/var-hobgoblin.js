/* dev/model-qa/creatures/var-hobgoblin.js — HOBGOBLIN kin-variant (sub-nearest doctrine).
   COPIES mon-orc.js: all coordinates+radii scaled x0.95, grey-orange skin, the ASYMMETRIC hide
   armor read REPLACED with disciplined MATCHING bands (both shoulders one uniform dark iron
   pauldron + a red cloth accent band across the chest — military discipline vs. orc chaos). Keeps
   the cleaver-axe. Everything else identical. Imported by var-hobgoblin-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

const k = 0.95;                                 // scale factor
const KV = (x,y,z)=>V(x*k, y*k, z*k);

export function buildHobgoblin(){
  /* ---------- PALETTE (grey-orange skin; disciplined dark iron + red cloth) ---------- */
  const P = {
    skin:0x8a6a4a, skinDk:0x5e4830, skinLt:0x9c7c56,        // grey-orange goblinoid hide
    tusk:0xd6cba8, tuskDk:0xb4a780,
    hide:0x5c4a30, hideDk:0x3e3120, hideLt:0x6e5a3c,
    iron:0x4a4e52, ironDk:0x2f3236, ironLt:0x6b7076,        // DARK uniform iron (disciplined plate)
    rust:0x6a4a34, strap:0x2c2420, loin:0x594936,
    cloth:0x8a2a24, clothDk:0x5e1c18,                        // red cloth accent band
    paint:0x3d2c30, paintDk:0x2a1e21,
    scar:0x9c8f66, topknot:0x2e2a22, topknotDk:0x201d17,
    eye:0xc4b23c, eyeDk:0x161009, nail:0x2b2620,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (scaled x0.95) ---------- */
  const L = {
    hipY:0.72*k, waistY:0.81*k, ribY:0.94*k, chestY:1.055*k, shldY:1.155*k, neckY:1.20*k,
    hipHalf:0.145*k, shoulderX:0.330*k,
    jawY:1.225*k, cheekY:1.305*k, browY:1.385*k, crownY:1.475*k, headTopY:1.535*k,
  };

  const lean = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.15);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- CLEAVER-AXE FIRST (kept, scaled) ---------- */
  const GRIP = KV(0.375, 0.62, 0.28);
  const HTOP = KV(0.505, 1.05, 0.44);
  const HAFT = new THREE.Vector3().subVectors(HTOP, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(HAFT, -0.34*k);
  {
    tube(BUTT, BUTT.clone().addScaledVector(HAFT, 0.06*k), 0.028*k, 0.026*k, 6, P.ironDk, {capA:{hex:P.iron, lift:0.02*k}});
    tube(BUTT.clone().addScaledVector(HAFT, 0.06*k), GRIP.clone().addScaledVector(HAFT,-0.09*k), 0.024*k, 0.024*k, 6, P.rust);
    tube(GRIP.clone().addScaledVector(HAFT,-0.09*k), GRIP.clone().addScaledVector(HAFT,0.09*k), 0.027*k, 0.027*k, 6, P.strap);
    tube(GRIP.clone().addScaledVector(HAFT,0.09*k), HTOP.clone().addScaledVector(HAFT,-0.10*k), 0.023*k, 0.028*k, 6, P.rust);
    tube(HTOP.clone().addScaledVector(HAFT,-0.10*k), HTOP.clone().addScaledVector(HAFT,-0.02*k), 0.030*k, 0.046*k, 6, P.ironDk);

    const up=V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, HAFT).normalize();
    const w = new THREE.Vector3().crossVectors(HAFT, u).normalize();
    const HEAD_C = HTOP.clone().addScaledVector(HAFT, -0.01*k);
    tube(HEAD_C.clone().addScaledVector(w,-0.038*k), HEAD_C.clone().addScaledVector(w,0.038*k), 0.070*k, 0.070*k, 8, P.ironDk);
    const s = 1;
    const root = HEAD_C.clone().addScaledVector(u, s*0.05*k);
    const bandN = 7, innerPts=[], outerPts=[];
    for(let kk=0;kk<=bandN;kk++){
      const t=kk/bandN;
      const along = (-0.20 + t*0.40)*k;
      const reach = (0.10 + Math.sin(t*Math.PI)*0.46)*k;
      innerPts.push(root.clone().addScaledVector(HAFT, along*0.30).addScaledVector(u, s*reach*0.16));
      outerPts.push(root.clone().addScaledVector(HAFT, along).addScaledVector(u, s*reach));
    }
    for(let kk=0;kk<bandN;kk++){
      const a=innerPts[kk], b=innerPts[kk+1], c=outerPts[kk+1], d=outerPts[kk];
      const off=w.clone().multiplyScalar(0.014*k);
      quad(a.clone().add(off), b.clone().add(off), c.clone().add(off), d.clone().add(off), P.iron, 0.05);
      quad(d.clone().sub(off), c.clone().sub(off), b.clone().sub(off), a.clone().sub(off), P.iron, 0.05);
      quad(d.clone().add(off), c.clone().add(off), c.clone().sub(off), d.clone().sub(off), P.ironLt, 0.03);
    }
  }

  /* ---------- TORSO ---------- */
  stack([
    {y:L.hipY,   rx:0.245*k, rz:0.190*k, hex:P.skinDk},
    {y:L.waistY, rx:0.220*k, rz:0.168*k, hex:P.skin},
    {y:L.ribY,   rx:0.270*k, rz:0.198*k, hex:P.skin},
    {y:L.chestY, rx:0.320*k, rz:0.215*k, hex:P.skinLt},
    {y:L.shldY,  rx:0.340*k, rz:0.205*k, hex:P.skin},
    {y:L.neckY,  rx:0.140*k, rz:0.130*k, hex:P.skinDk},
  ], 8, {xform:lean, capTop:{hex:P.skinDk, lift:0.006*k}});

  stack([
    {y:0.50*k, rx:0.255*k, rz:0.205*k, hex:P.hideDk},
    {y:0.62*k, rx:0.242*k, rz:0.192*k, hex:P.hide},
    {y:L.hipY, rx:0.228*k, rz:0.178*k, hex:P.hide},
  ], 8, {xform:lean});
  stack([
    {y:0.77*k, rx:0.228*k, rz:0.178*k, hex:P.strap},
    {y:0.83*k, rx:0.225*k, rz:0.175*k, hex:P.strap},
  ], 8, {xform:lean});
  quad(lean(KV(-0.05,0.778,0.185)), lean(KV(0.05,0.778,0.185)),
       lean(KV(0.05,0.828,0.180)), lean(KV(-0.05,0.828,0.180)), P.iron, 0.02);

  /* ---------- DISCIPLINED MATCHING ARMOR — BOTH shoulders get an identical dark iron pauldron
     (military uniformity, replacing the orc's one-plated-one-bare asymmetry). ---------- */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.02*k, 0.01*k);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.38); return q.add(pivot); };
    stack([
      {y:L.shldY-0.05*k, rx:0.150*k, rz:0.160*k, cx:pivot.x, cz:pivot.z, hex:P.ironDk},
      {y:L.shldY+0.02*k, rx:0.135*k, rz:0.145*k, cx:pivot.x, cz:pivot.z, hex:P.iron},
      {y:L.shldY+0.09*k, rx:0.098*k, rz:0.104*k, cx:pivot.x, cz:pivot.z, hex:P.ironLt},
    ], 8, {xform:p=>lean(tilt(p)), capTop:{hex:P.ironLt, lift:0.03*k}});
    /* matching rivet nubs on each plate (symmetric — discipline) */
    for(const [dx,dy] of [[-0.06*k,0.02*k],[0.05*k,0.05*k]]){
      const c=lean(tilt(V(pivot.x+dx, L.shldY+dy, 0.155*k)));
      quad(c.clone().add(V(-0.012*k,-0.012*k,0)), c.clone().add(V(0.012*k,-0.012*k,0)),
           c.clone().add(V(0.012*k,0.012*k,0.004*k)), c.clone().add(V(-0.012*k,0.012*k,0.004*k)), P.ironLt, 0.0);
    }
  }
  /* RED CLOTH ACCENT BAND — a clean uniform sash across the chest, cheek to cheek (unit colors) */
  for(const [y,cz] of [[L.chestY+0.005*k,0.215*k]]){
    for(const s of [-1,1]){
      const a=lean(V(s*0.02*k, y-0.028*k, cz));
      const b=lean(V(s*0.30*k, (L.ribY+L.chestY)/2-0.04*k, 0.13*k));
      const c=lean(V(s*0.30*k, (L.ribY+L.chestY)/2+0.02*k, 0.13*k));
      const d=lean(V(s*0.02*k, y+0.030*k, cz));
      quad(a,b,c,d, P.cloth, 0.03);
    }
    // a darker under-edge so the sash reads as a band, not a paint smear
    for(const s of [-1,1]){
      const a=lean(V(s*0.02*k, L.chestY-0.030*k, 0.213*k));
      const b=lean(V(s*0.30*k, (L.ribY+L.chestY)/2-0.058*k, 0.128*k));
      const c=lean(V(s*0.30*k, (L.ribY+L.chestY)/2-0.040*k, 0.128*k));
      const d=lean(V(s*0.02*k, L.chestY-0.012*k, 0.213*k));
      quad(a,b,c,d, P.clothDk, 0.02);
    }
  }

  /* ---------- HEAD ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.150*k, rz:0.148*k, hex:P.skinLt},
      {y:L.cheekY, rx:0.162*k, rz:0.150*k, hex:P.skin},
      {y:L.browY,  rx:0.150*k, rz:0.132*k, hex:P.skin},
      {y:L.crownY, rx:0.120*k, rz:0.104*k, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014*k), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(lean));
    for(const i of [1,2]) rings[1][i].z += 0.020*k;
    for(const i of [1,2]){ rings[2][i].z += 0.070*k; rings[2][i].y -= 0.020*k; }
    for(const i of [0,3]){ rings[2][i].z += 0.038*k; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], lean(V(0, L.headTopY, 0.006*k)), P.skinDk);

    const jawFrontBot = lean(V(0, L.jawY-0.085*k, 0.150*k));
    tube(lean(V(0,L.jawY+0.005*k,0.02*k)), jawFrontBot, 0.130*k, 0.082*k, 6, P.skinLt, {raz:0.100*k, rbz:0.066*k, capB:{hex:P.skinDk}});

    for(const s of [-1,1]){
      const base = lean(V(s*0.070*k, L.jawY-0.055*k, 0.150*k));
      const mid  = lean(V(s*0.078*k, L.jawY+0.010*k, 0.175*k));
      const tip  = lean(V(s*0.068*k, L.jawY+0.080*k, 0.165*k));
      tube(base, mid, 0.030*k, 0.024*k, 5, P.tusk, {capA:{hex:P.tuskDk}});
      tube(mid, tip, 0.024*k, 0.008*k, 5, P.tusk, {capB:{hex:P.tuskDk, lift:0.006*k}});
    }
    for(const tx of [-0.028*k, 0.028*k]){
      const b=lean(V(tx, L.jawY-0.015*k, 0.158*k)), t=lean(V(tx, L.jawY+0.022*k, 0.154*k));
      tube(b, t, 0.013*k, 0.006*k, 4, P.tuskDk, {capB:{hex:P.tusk, lift:0.003*k}});
    }

    /* dark face band — kept subdued (disciplined; not war-paint chaos) */
    for(const s of [-1,1]){
      const ey = L.cheekY + 0.010*k;
      const a=lean(V(s*0.015*k, ey-0.024*k, 0.170*k));
      const b=lean(V(s*0.150*k, ey-0.018*k, 0.062*k));
      const c=lean(V(s*0.150*k, ey+0.024*k, 0.062*k));
      const d=lean(V(s*0.015*k, ey+0.030*k, 0.170*k));
      quad(a,b,c,d, P.paint, 0.02);
    }

    for(const s of [-1,1]){
      const ex=s*0.062*k, ey=(L.cheekY+L.browY)/2-0.002*k, ez=0.166*k;
      const e=(x,y,z)=>lean(V(x,y,z));
      quad(e(ex-0.024*k,ey-0.016*k,ez-0.006*k), e(ex+0.024*k,ey-0.016*k,ez-0.006*k),
           e(ex+0.024*k,ey+0.018*k,ez-0.012*k), e(ex-0.024*k,ey+0.018*k,ez-0.012*k), P.eyeDk, 0.0);
      quad(e(ex-0.013*k,ey-0.007*k,ez), e(ex+0.013*k,ey-0.007*k,ez),
           e(ex+0.013*k,ey+0.010*k,ez-0.005*k), e(ex-0.013*k,ey+0.010*k,ez-0.005*k), P.eye, 0.0);
    }

    for(const s of [-1,1]){
      const eb = lean(V(s*0.155*k, L.cheekY+0.01*k, -0.02*k));
      const et = lean(V(s*0.215*k, L.cheekY+0.075*k, -0.115*k));
      tube(eb, et, 0.048*k, 0.006*k, 5, P.skin, {raz:0.028*k, rbz:0.004*k, capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.005*k}});
    }

    for(const [sx,sz] of [[-0.03*k,0.02*k],[0.05*k,-0.03*k]]){
      const c=lean(V(sx, L.crownY+0.02*k, sz+0.02*k));
      quad(c.clone().add(V(-0.006*k,-0.03*k,0)), c.clone().add(V(0.006*k,-0.03*k,0)),
           c.clone().add(V(0.006*k,0.03*k,0)), c.clone().add(V(-0.006*k,0.03*k,0)), P.scar, 0.05);
    }
    {
      const kb = lean(V(0, L.crownY+0.02*k, -0.02*k));
      const km = lean(V(0, L.headTopY+0.08*k, -0.11*k));
      const kt = lean(V(0, L.headTopY+0.14*k, -0.20*k));
      tube(kb, km, 0.038*k, 0.030*k, 5, P.topknotDk, {capA:{hex:P.topknotDk}});
      tube(km, kt, 0.030*k, 0.008*k, 5, P.topknot, {capB:{hex:P.topknotDk, lift:0.006*k}});
    }
  }

  /* ---------- ARMS ---------- */
  {
    const S=lean(V(L.shoulderX, L.shldY-0.02*k, 0.02*k));
    const FIST=GRIP.clone();
    const E=KV(0.395, 0.86, 0.15);
    tube(S,E,0.110*k,0.086*k,6,P.skin);
    tube(E, FIST.clone().addScaledVector(HAFT,-0.03*k), 0.082*k,0.066*k,6,P.skin);
    tube(FIST.clone().addScaledVector(HAFT,-0.06*k), FIST.clone().addScaledVector(HAFT,0.06*k), 0.070*k,0.064*k,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=lean(V(-L.shoulderX, L.shldY-0.02*k, 0.02*k));
    const E2=KV(-0.395, 0.86, 0.10);
    const W2=KV(-0.360, 0.60, 0.20);
    tube(S2,E2,0.110*k,0.086*k,6,P.skin);
    tube(E2,W2,0.082*k,0.066*k,6,P.skin);
    tube(W2.clone().add(V(0,0.03*k,-0.02*k)), W2.clone().add(V(0,-0.05*k,0.03*k)), 0.072*k,0.060*k,6,P.skin,
         {capA:{hex:P.skinDk}, capB:{hex:P.skinDk}});
  }

  /* ---------- LEGS ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02*k, 0.01*k), kneeL=KV(-0.270,0.40,0.11), ankL=KV(-0.285,0.085,0.07);
    const hipR=V( L.hipHalf, L.hipY-0.02*k, 0.00), kneeR=KV( 0.295,0.40,-0.06), ankR=KV( 0.310,0.085,-0.12);
    tube(hipL,kneeL,0.125*k,0.090*k,6,P.skin);
    tube(kneeL,ankL,0.084*k,0.060*k,6,P.skinDk);
    tube(hipR,kneeR,0.125*k,0.090*k,6,P.skin);
    tube(kneeR,ankR,0.084*k,0.060*k,6,P.skinDk);
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.015*k, rx:0.080*k, rz:0.090*k, cx:ank.x, cz:ank.z, hex:P.hideDk},
        {y:0.10*k,  rx:0.072*k, rz:0.076*k, cx:ank.x, cz:ank.z, hex:P.hide},
      ], 6, {capTop:{hex:P.hideDk, lift:0.006*k}, capBot:{hex:P.skinDk, lift:0.0}});
      const toeA=V(ank.x,0.05*k,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140*k), 0.066*k,0.050*k,6,P.skinDk, {capB:{hex:P.nail, lift:0.012*k}, raz:0.056*k, rbz:0.038*k});
    }
  }

  /* ---------- base disc (scaled x0.95) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42*k, 0.42*k, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40*k, 0.40*k, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
