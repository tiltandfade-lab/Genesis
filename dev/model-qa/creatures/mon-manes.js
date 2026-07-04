/* dev/model-qa/creatures/mon-manes.js — the MANES / VAPORSPAWN (bespoke small hunched lesser demon).
   Wretched lowest-rung demon: a gaunt, ribby, clawed imp-figure hunched close to the ground, a
   sunken fanged face, splayed clawed hands and feet, wispy trailing rags of vapor. Grey-green
   rotting skin, VS-desaturated and mottled — never candy. NO eye quads (dark socket recesses
   only, per house ruling). Whole-object grammar: one function, one merged geometry frame, no
   anchors, no part-object transforms. Small size: base disc r=0.42 per this unit's spec.
   Silhouette debt: mon-bugbear.js (hunch pattern) + mon-lizard.js (band/tube/disc pattern). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildManesVaporspawn(){
  /* ---------- PALETTE (VS desaturated; grey-green rot, mottled, wispy vapor trims) ---------- */
  const P = {
    skin:0x5c6858, skinDk:0x39422f, skinLt:0x788363,           // grey-green rotting hide
    mottleA:0x4a5340, mottleB:0x687358,                         // patchy rot mottle
    rib:0x8f9583, ribDk:0x555e4a,                               // pale exposed rib bone-ish ridges
    socket:0x14150f,                                            // dark eye-socket recess (no eye quad)
    fang:0xc8c2ac, fangDk:0x8a8570,                             // yellowed fangs
    claw:0x2c2b22, clawLt:0x494a38,
    vapor:0x9aa896, vaporDk:0x5f6d5a,                           // wispy trailing vapor rags
    disc:0x413b30, discTop:0x4d4638,
  };
  setChannels({ [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin',
    [P.mottleA]:'skin', [P.mottleB]:'skin', [P.fang]:'bone', [P.fangDk]:'bone',
    [P.rib]:'bone', [P.ribDk]:'bone', [P.claw]:'bone', [P.clawLt]:'bone' });

  /* ---------- LANDMARKS — small, HUNCHED close to the ground (a wretched crouching thing).
     Torso pitched forward hard over the hips; head juts low and forward. ---------- */
  const L = {
    hipY:0.135, waistY:0.185, chestY:0.235, shldY:0.270, neckY:0.285,
    jawY:0.300, muzY:0.320, browY:0.345, crownY:0.375,
  };
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.55);            // steep forward pitch — wretched hunch
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — gaunt, ribby barrel. Narrow, uneven bands so ribs read through the hide. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.085, rz:0.078, hex:P.skinDk},
      {y:L.waistY, rx:0.100, rz:0.088, hex:P.mottleA},
      {y:L.chestY, rx:0.118, rz:0.098, hex:P.skin},     // gaunt "chest" — still slight, ribby
      {y:L.shldY,  rx:0.108, rz:0.090, hex:P.mottleB},
      {y:L.neckY,  rx:0.060, rz:0.052, hex:P.skinDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], hunch(V(0, L.hipY-0.02, 0)), P.skinDk, true);
    /* ribby ridge lines on the flanks — thin pale bone-ish arcs over the gaunt torso */
    for(const s of [-1,1]){
      for(const yb of [L.waistY+0.01, L.chestY-0.01, L.chestY+0.03]){
        const a = hunch(V(s*0.03, yb, 0.09));
        const b = hunch(V(s*0.11, yb-0.01, -0.01));
        quad(a, a.clone().add(V(0,0.014,0)), b.clone().add(V(0,0.012,0)), b, s>0?P.rib:P.ribDk, 0.05);
      }
    }
  }

  /* ---------- HEAD — sunken fanged face, dark socket recesses (no eye quads), small horns/ears. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.062, rz:0.068, hex:P.skin},
      {y:L.muzY,   rx:0.070, rz:0.072, hex:P.mottleA},   // slight muzzle bulge
      {y:L.browY,  rx:0.064, rz:0.058, hex:P.skinDk},    // brow pulls in — sunken read
      {y:L.crownY, rx:0.040, rz:0.036, hex:P.skinDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* push muzzle front verts forward (gaunt jutting jaw) */
    for(const i of [1,2]){ rings[1][i].z += 0.028; }
    for(const i of [1,2]){ rings[0][i].z += 0.020; }
    /* pull the brow verts IN + down over dark sunken sockets (no eye quads — recess only) */
    for(const i of [1,2]){ rings[2][i].y -= 0.010; rings[2][i].z -= 0.006; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.crownY+0.03, -0.01)), P.skinDk);

    /* dark socket recesses — small inset dark quads pressed into the brow, NOT painted eye shapes */
    for(const s of [-1,1]){
      const c = hunch(V(s*0.030, L.browY-0.006, 0.052));
      quad(c.clone().add(V(-0.012,-0.008,0)), c.clone().add(V(0.012,-0.008,0)),
           c.clone().add(V(0.010,0.010,-0.010)), c.clone().add(V(-0.010,0.010,-0.010)), P.socket, 0.0);
    }

    /* fanged sunken mouth line — dark gash with a couple of jutting fangs */
    {
      const mc = hunch(V(0, L.jawY-0.020, 0.078));
      quad(mc.clone().add(V(-0.038,0,0)), mc.clone().add(V(0.038,0,0)),
           mc.clone().add(V(0.024,-0.014,-0.010)), mc.clone().add(V(-0.024,-0.014,-0.010)), P.socket, 0.0);
      for(const s of [-1,1]){
        const fb = mc.clone().add(V(s*0.026, 0.002, 0.002));
        const ft = fb.clone().add(V(s*0.006, -0.034, 0.006));
        tube(fb, ft, 0.009, 0.002, 4, P.fang, {capB:{hex:P.fangDk, lift:0.004}});
      }
    }

    /* small ragged bat-ish ears set back on the skull */
    for(const s of [-1,1]){
      const eb = hunch(V(s*0.045, L.browY+0.01, -0.02));
      const et = hunch(V(s*0.085, L.crownY+0.05, -0.05));
      tube(eb, et, 0.020, 0.005, 4, P.skinDk, {raz:0.012, rbz:0.003, capA:{hex:P.skinDk}, capB:{hex:P.mottleA, lift:0.004}});
    }
  }

  /* ---------- ARMS — long, gaunt, ending in splayed clawed hands, held low/forward (grasping). */
  const splayHand = (ctr, faceDir, hex)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.018), ctr.clone().addScaledVector(d,0.018),
         0.026, 0.022, 5, hex, {raz:0.020, rbz:0.020, capA:{hex}, capB:{hex}});
    for(const off of [-1,-0.33,0.33,1]){
      const kb = ctr.clone().addScaledVector(d,0.016).addScaledVector(side, off*0.020);
      const kt = kb.clone().addScaledVector(d,0.040).addScaledVector(side, off*0.010);
      tube(kb, kt, 0.010, 0.003, 4, hex, {capB:{hex:P.claw, lift:0.004}});
    }
  };
  {
    const S1 = hunch(V(0.100, L.shldY-0.01, 0.01));
    const E1 = V(0.155, 0.115, 0.10);
    const W1 = V(0.130, 0.055, 0.185);
    tube(S1, E1, 0.034, 0.026, 6, P.skin);
    tube(E1, W1, 0.026, 0.019, 6, P.mottleA);
    splayHand(W1, V(0.20,-0.35,1), P.skinDk);

    const S2 = hunch(V(-0.100, L.shldY-0.01, 0.01));
    const E2 = V(-0.160, 0.100, 0.13);
    const W2 = V(-0.140, 0.045, 0.20);
    tube(S2, E2, 0.034, 0.026, 6, P.skin);
    tube(E2, W2, 0.026, 0.019, 6, P.mottleB);
    splayHand(W2, V(-0.20,-0.35,1), P.skinDk);
  }

  /* ---------- LEGS — short, bent, crouching; splayed clawed feet. ---------- */
  {
    const hipL=hunch(V(-0.055, L.hipY-0.01, 0.00)), kneeL=V(-0.095,0.070,0.045), ankL=V(-0.078,0.028,0.020);
    const hipR=hunch(V( 0.055, L.hipY-0.01, 0.00)), kneeR=V( 0.095,0.070,0.045), ankR=V( 0.078,0.028,0.020);
    tube(hipL,kneeL,0.044,0.032,6,P.skin);
    tube(kneeL,ankL,0.030,0.020,6,P.skinDk);
    tube(hipR,kneeR,0.044,0.032,6,P.skin);
    tube(kneeR,ankR,0.030,0.020,6,P.skinDk);
    for(const [ank,toeDir] of [[ankL,V(-0.15,0,1)], [ankR,V(0.15,0,1)]]){
      const d=toeDir.clone().normalize();
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=ank.clone().addScaledVector(d,0.018).addScaledVector(side, off*0.020);
        const tt=tb.clone().addScaledVector(d,0.048).addScaledVector(side, off*0.008);
        tube(tb, tt, 0.011, 0.003, 4, P.skinDk, {capB:{hex:P.claw, lift:0.004}});
      }
    }
  }

  /* ---------- WISPY TRAILING VAPOR — thin ragged rags trailing off the back/shoulders, the
     "vaporspawn" read; short soft-tapered tubes rather than a solid mass. ---------- */
  {
    const roots = [
      hunch(V(-0.09, L.shldY+0.02, -0.03)),
      hunch(V( 0.06, L.chestY+0.01, -0.05)),
      hunch(V( 0.00, L.waistY, -0.06)),
    ];
    const tips = [
      V(-0.16, 0.145+0.32, -0.20),
      V( 0.13, 0.100+0.30, -0.24),
      V( 0.02, 0.060+0.28, -0.26),
    ];
    for(let i=0;i<roots.length;i++){
      const mid = roots[i].clone().lerp(tips[i], 0.5).add(V(0, 0.04, 0));
      tube(roots[i], mid, 0.020, 0.012, 4, P.vapor, {capA:{hex:P.vaporDk}});
      tube(mid, tips[i], 0.012, 0.003, 4, P.vaporDk, {capB:{hex:P.vaporDk, lift:0.003}});
    }
  }

  /* ---------- base disc (r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
