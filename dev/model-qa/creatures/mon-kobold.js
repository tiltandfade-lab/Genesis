/* dev/model-qa/creatures/mon-kobold.js — SMALL HOSTILE BIPED (whole-object grammar).
   The mini-dragonkin read: a small snouted head (short muzzle rings on a forward axis, smaller
   than the dragonborn's), two tiny horn nubs, a thin reptile TAIL dropping to the ground behind,
   digitigrade-hinted legs (a sharp reverse knee), and a small SPEAR held TWO-HANDED at a wary
   diagonal (authored FIRST — both fists derive from the shaft, grips true by construction).
   Rust-red scale tones with a paler belly. Skittish crouch. ~0.95u tall, base disc r=0.32.
   Deliberately NOT a small dragonborn adventurer: rattier posture, a spear not fine gear, no
   clothing — a scrappy tunnel creature. Imported by mon-kobold-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildKobold(){
  /* ---------- PALETTE (VS desaturated; rust-red scale + pale belly) ---------- */
  const P = {
    scale:0x9a4a34, scaleDk:0x672f22, scaleLt:0xb56a4a,     // rust-red hide
    belly:0xc0a274, bellyDk:0x94794f,                       // paler underbelly / throat
    horn:0x3a3128, hornTip:0x241f1a, nail:0x2b2620,
    wood:0x6a5334, woodDk:0x4a3a22, iron:0x82868a, ironDk:0x565a5e, cord:0x4c4029,
    eye:0xd8a838, eyeDk:0x1a0f0a, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — tiny skittish frame, snouted head, hunched. Small head (dragonkin,
     not the huge goblin cranium — the SNOUT carries the read, not skull size). ~0.95u top. ---------- */
  const L = {
    hipY:0.360, waistY:0.400, chestY:0.470, shldY:0.515, neckY:0.540,
    hipHalf:0.086, shoulderX:0.140,
    jawY:0.560, muzzleY:0.585, browY:0.685, crownY:0.790, headTopY:0.855,
  };

  /* forward-lean pitch (skittish crouch) applied to torso + head landmarks */
  const pitch = (p)=>{ const q=p.clone().sub(V(0,L.hipY,0)); q.applyAxisAngle(V(1,0,0), 0.14); return q.add(V(0,L.hipY,0)); };

  /* ---------- SPEAR FIRST — held TWO-HANDED across the body at a wary diagonal (butt low-right,
     head high-left, angled forward). Both hand grips are points ON the shaft; the fists derive. ---------- */
  const BUTT = V(0.245, 0.150, 0.235);                      // low, out to the right, forward
  const TIP  = V(-0.235, 0.760, 0.115);                     // up + across to the left
  const SDIR = new THREE.Vector3().subVectors(TIP, BUTT).normalize();
  const GRIP_LO = BUTT.clone().addScaledVector(SDIR, 0.235);   // lower (right) fist
  const GRIP_HI = BUTT.clone().addScaledVector(SDIR, 0.470);   // upper (left) fist
  {
    /* wooden shaft, butt to just below the head */
    tube(BUTT, TIP.clone().addScaledVector(SDIR,-0.145), 0.019, 0.017, 6, P.wood, {capA:{hex:P.woodDk, lift:0.01}});
    /* cord binding wraps at each grip (a darker collar) */
    for(const g of [GRIP_LO, GRIP_HI]) tube(g.clone().addScaledVector(SDIR,-0.024), g.clone().addScaledVector(SDIR,0.024), 0.023, 0.022, 6, P.cord);
    /* leaf spearhead: socket + tapering blade to a point */
    const up=V(0,0,1), su=new THREE.Vector3().crossVectors(up,SDIR).normalize(), sv=new THREE.Vector3().crossVectors(SDIR,su).normalize();
    const base=TIP.clone().addScaledVector(SDIR,-0.145);
    tube(base.clone().addScaledVector(SDIR,-0.02), base, 0.022, 0.020, 6, P.ironDk);   // socket collar
    const bl=(t,w,th)=>{ const c=base.clone().addScaledVector(SDIR,t);
      return [ c.clone().addScaledVector(su,w), c.clone().addScaledVector(sv,th), c.clone().addScaledVector(su,-w), c.clone().addScaledVector(sv,-th) ]; };
    const s0=bl(0.0,0.020,0.014), s1=bl(0.040,0.034,0.016), s2=bl(0.110,0.018,0.010), s3=bl(0.150,0.006,0.004);
    stitch([s0,s1,s2,s3], (b)=> b<2?P.ironDk:P.iron);
    capFan(s3, base.clone().addScaledVector(SDIR,0.185), P.iron);
  }

  /* ---------- TORSO — slight, reptilian. Paler belly on the front, rust scale on the back/sides.
     One loft, pitched forward for the skittish crouch. No clothing. ---------- */
  stack([
    {y:L.hipY,   rx:0.108, rz:0.092, hex:P.scaleDk},
    {y:L.waistY, rx:0.100, rz:0.084, hex:P.scale},
    {y:L.chestY, rx:0.128, rz:0.100, hex:P.scale},
    {y:L.shldY,  rx:0.132, rz:0.098, hex:P.scale},
    {y:L.neckY,  rx:0.052, rz:0.050, hex:P.scaleDk},
  ], 8, {xform:pitch, capTop:{hex:P.scaleDk, lift:0.004}});

  /* pale belly strip — a few front-arc quads over the torso loft (throat-to-gut underbelly) */
  {
    const yb=[L.hipY+0.01, L.waistY, L.chestY, L.shldY-0.01];
    const rr=[0.094, 0.086, 0.102, 0.100];
    const rings = yb.map((y,k)=>ring(V(0,y,0), V(0,1,0), rr[k], rr[k]*0.82, 8, Math.PI/8).map(pitch));
    for(let b=0;b<rings.length-1;b++) for(const i of [1,2]){ const i2=(i+1)%8;
      quad(rings[b][i].clone().add(V(0,0,0.004)), rings[b][i2].clone().add(V(0,0,0.004)),
           rings[b+1][i2].clone().add(V(0,0,0.004)), rings[b+1][i].clone().add(V(0,0,0.004)), P.belly, 0.05);
    }
  }

  /* ---------- HEAD — small dragonkin skull with a short forward snout. The snout is smaller than
     the dragonborn's (fewer/shorter segments) so it reads scrappy, not noble. Two tiny horn nubs. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.070, rz:0.074, hex:P.scale},        // smaller skull so the SNOUT dominates
      {y:L.muzzleY, rx:0.082, rz:0.084, hex:P.scale},        // (not a goblin cranium)
      {y:L.browY,   rx:0.086, rz:0.078, hex:P.scale},
      {y:L.crownY,  rx:0.066, rz:0.058, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(pitch));
    /* brow ridge push */
    for(const i of [1,2]){ rings[2][i].z += 0.014; rings[2][i].y -= 0.008; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], pitch(V(0, L.headTopY, 0.004)), P.scaleDk);

    /* SHORT SNOUT — a stubby wedge projecting forward (+z), built from two short chained tubes
       on a +z-leaning axis, tapering to a blunt nose. Smaller/shorter than the dragonborn muzzle. */
    const muzBase = pitch(V(0, L.muzzleY-0.008, 0.092));
    const muzMid  = pitch(V(0, L.muzzleY-0.026, 0.168));
    const muzTip  = pitch(V(0, L.muzzleY-0.040, 0.222));
    tube(muzBase, muzMid, 0.082, 0.060, n, P.scale, {raz:0.064, rbz:0.048, phase:ph});
    tube(muzMid, muzTip, 0.060, 0.028, n, P.scaleLt, {raz:0.048, rbz:0.022, phase:ph, capB:{hex:P.scaleDk, lift:0.010}});
    /* pale under-snout (throat) strip */
    quad(pitch(V(-0.036,L.muzzleY-0.044,0.100)), pitch(V(0.036,L.muzzleY-0.044,0.100)),
         pitch(V(0.020,L.muzzleY-0.055,0.205)), pitch(V(-0.020,L.muzzleY-0.055,0.205)), P.belly, 0.05);

    /* TWO TINY HORN NUBS — short back-swept stubs off the top/rear of the skull (much smaller
       than the dragonborn's; just nubs). */
    for(const s of [-1,1]){
      const hb=pitch(V(s*0.052, L.crownY-0.010, -0.018));
      const ht=pitch(V(s*0.070, L.crownY+0.048, -0.070));
      tube(hb, ht, 0.020, 0.006, 5, P.horn, {capB:{hex:P.hornTip, lift:0.006}});
    }

    /* eyes — two SMALL intentional quads flanking the brow, above the snout base so it can't
       occlude them, amber reptile glare (house standard: small deliberate pips, not shaded rings). */
    for(const s of [-1,1]){
      const ex=s*0.066, ey=L.browY-0.004, ez=0.086;
      const e=(x,y,z)=>pitch(V(x,y,z));
      quad(e(ex-0.018,ey-0.012,ez-0.005), e(ex+0.018,ey-0.012,ez-0.005),
           e(ex+0.018,ey+0.013,ez-0.011), e(ex-0.018,ey+0.013,ez-0.011), P.eyeDk, 0.0);
      quad(e(ex-0.010,ey-0.005,ez), e(ex+0.010,ey-0.005,ez),
           e(ex+0.010,ey+0.008,ez-0.004), e(ex-0.010,ey+0.008,ez-0.004), P.eye, 0.0);
    }
  }

  /* ---------- ARMS — thin. Both fists DERIVE from the two spear grips (two-handed hold). Right
     grips low, left grips high. Small 3-claw hands wrap each grip. ---------- */
  const clawHand = (ctr, faceDir, hex)=>{
    const d=faceDir.clone().normalize();
    const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.024), ctr.clone().addScaledVector(d,0.024), 0.040, 0.036, 6, hex, {capA:{hex}, capB:{hex}});
    for(const off of [-0.7,0,0.7]){
      const kb=ctr.clone().addScaledVector(d,0.020).addScaledVector(side, off*0.026);
      const kt=kb.clone().addScaledVector(d,0.030).addScaledVector(side, off*0.008);
      tube(kb, kt, 0.010, 0.004, 4, hex, {capB:{hex:P.nail, lift:0.003}});
    }
  };
  {
    /* right arm -> lower grip */
    const S=pitch(V(L.shoulderX, L.shldY-0.005, 0.02));
    const E=V(0.185, 0.360, 0.120);
    tube(S,E,0.034,0.028,6,P.scale);
    tube(E,GRIP_LO,0.028,0.024,6,P.scale);
    clawHand(GRIP_LO, SDIR, P.scaleLt);

    /* left arm -> upper grip (reaches across, wary) */
    const S2=pitch(V(-L.shoulderX, L.shldY-0.005, 0.02));
    const E2=V(-0.175, 0.470, 0.130);
    tube(S2,E2,0.034,0.028,6,P.scale);
    tube(E2,GRIP_HI,0.028,0.024,6,P.scale);
    clawHand(GRIP_HI, SDIR, P.scaleLt);
  }

  /* ---------- LEGS — digitigrade-hinted: a sharp forward reverse-knee (hip -> knee forward ->
     ankle back -> toe forward), spindly, in a skittish crouch. Clawed feet. ---------- */
  {
    // digitigrade: knee forward and high, ankle (hock) pulled back + low, then a forward foot
    const buildLeg=(sx)=>{
      const hip = V(sx*L.hipHalf, L.hipY-0.02, 0.01);
      const knee= V(sx*0.115, 0.230, 0.100);                 // knee thrust FORWARD (+z) + up
      const hock= V(sx*0.118, 0.135, 0.020);                 // ankle/hock pulled back + low (the reverse bend, softened)
      const toe = V(sx*0.112, 0.055, 0.080);                 // foot plants forward again
      tube(hip, knee, 0.044, 0.034, 6, P.scale);
      tube(knee, hock, 0.032, 0.024, 6, P.scaleDk);
      tube(hock, toe, 0.026, 0.020, 6, P.scaleDk, {capA:{hex:P.scaleDk}});
      /* clawed foot: heel pad + 3 forward claw toes */
      const d=V(sx*0.10,0,1).normalize();
      const heel=V(toe.x, 0.045, toe.z);
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(side, off*0.024);
        const tt=tb.clone().addScaledVector(d,0.070).addScaledVector(side, off*0.006);
        tube(tb, tt, 0.013, 0.005, 4, P.scaleDk, {capB:{hex:P.nail, lift:0.004}});
      }
    };
    buildLeg(-1); buildLeg(1);
  }

  /* ---------- TAIL — thin reptile tail chained from the LOW SPINE, dropping DOWN and BACK (-z)
     to the ground behind the base disc, then curling up at the tip. Root sits low + well behind
     the torso so it emerges from behind, not through the body. ---------- */
  {
    const root = V(0.02, L.hipY-0.06, -0.175);    // low + well behind the torso
    const t1   = V(0.045, 0.245, -0.270);         // drops DOWN-and-back, staying near centerline
    const t2   = V(0.075, 0.170, -0.360);         // continues arcing down behind the disc
    const t3   = V(0.095, 0.105, -0.415);
    const t4   = V(0.105, 0.070, -0.420);         // reaches the ground behind the disc edge
    const tip  = V(0.110, 0.105, -0.375);         // tip flicks up (alert)
    tube(root, t1, 0.072, 0.058, 8, P.scale,   {phase:Math.PI/8});
    tube(t1,   t2, 0.058, 0.044, 8, P.scale,   {phase:Math.PI/8});
    tube(t2,   t3, 0.044, 0.030, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t3,   t4, 0.030, 0.019, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t4,   tip,0.019, 0.010, 8, P.scaleDk, {phase:Math.PI/8, capB:{hex:P.scaleDk, lift:0.006}});
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.305, 0.305, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
