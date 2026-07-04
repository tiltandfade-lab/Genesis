/* dev/model-qa/creatures/mon-goblin.js — SMALL HOSTILE BIPED (whole-object grammar).
   Same one-function / one-geometry-frame / no-anchors law as humanoid.js, but a MONSTER read:
   an oversized head with HUGE back-swept pointed ears, a hooked-nose push, a wide toothy
   underbite hint, spindly limbs ending in oversized clawing hands, a ragged loin-wrap +
   scrap-leather chestpiece, and a crude jagged shortblade held LOW in the right fist (authored
   FIRST so the fist derives from the grip — grip true by construction). Hunched, skulking stance.
   Sickly green-olive skin. ~0.95u tall, base disc r=0.32 (the Small-creature disc). The read is
   feral and mean — clearly hostile, NOT the cheerful gnome. Imported by mon-goblin-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGoblin(){
  /* ---------- PALETTE (VS desaturated; sickly green-olive hide) ---------- */
  const P = {
    skin:0x6f7a41, skinDk:0x4f5730, skinLt:0x869150,       // green-olive, murky
    rag:0x6b5d3f, ragDk:0x4c4029, loin:0x7d6a45,           // dirty ragged cloth
    leather:0x4a3a26, leatherDk:0x34281a, strap:0x5a4830,  // scrap chestpiece
    iron:0x82868a, ironDk:0x565a5e, rust:0x6a4a34,         // crude blade
    tooth:0xc9bfa0, eye:0xb8452c, eyeDk:0x1a0f0a,          // mean red eye, dark socket
    nail:0x2b2620, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — tiny hunched frame, oversized head. F1: the head is SLIGHTLY smaller than
     the kept original (crown/headTop lowered ~0.03u, band radii cut ~10%) — still clearly a big mean
     goblin head, just reined in a notch. The big-head original lives on as mon-goblin-alt1.js. ---------- */
  const L = {
    hipY:0.345, waistY:0.385, chestY:0.455, shldY:0.500, neckY:0.525,
    hipHalf:0.088, shoulderX:0.150,
    jawY:0.548, cheekY:0.622, browY:0.706, crownY:0.808, headTopY:0.872,
  };

  /* ---------- CLEAVER-SHORTBLADE FIRST — held LOW in the right fist, the grip is ground truth.
     A jagged, crude single-edge blade angled down-and-out, ready to skulk-stab. ---------- */
  const GRIP = V(0.235, 0.300, 0.150);                      // low, out to the right, forward of the hip
  const TIP  = V(0.360, 0.120, 0.360);                      // blade sweeps down + forward
  const BLADE = new THREE.Vector3().subVectors(TIP, GRIP).normalize();
  const BUTT  = GRIP.clone().addScaledVector(BLADE, -0.055);
  {
    /* short wrapped handle */
    tube(BUTT, GRIP.clone().addScaledVector(BLADE, 0.035), 0.017, 0.016, 5, P.leatherDk, {capA:{hex:P.ironDk, lift:0.012}});
    /* a stubby crossguard nub */
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE, 0.040);
    tube(g0.clone().addScaledVector(gu,-0.030), g0.clone().addScaledVector(gu,0.030), 0.012, 0.012, 5, P.rust);
    /* jagged single-edge blade: a flat quad slab that widens then hooks to a point, one edge
       notched (asymmetric = crude/jagged read). Built from stitched cross-sections. */
    const bl=(t,wBack,wFore,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [ c.clone().addScaledVector(gu, wFore).addScaledVector(gv, th),   // fore (cutting) edge, +gv
               c.clone().addScaledVector(gu, wFore).addScaledVector(gv,-th),
               c.clone().addScaledVector(gu,-wBack).addScaledVector(gv,-th),   // back (spine) edge
               c.clone().addScaledVector(gu,-wBack).addScaledVector(gv, th) ];
    };
    const s0=bl(0.015, 0.020, 0.026, 0.006);
    const s1=bl(0.110, 0.028, 0.052, 0.006);                // belly of the blade widens (cleaver)
    const s2=bl(0.180, 0.030, 0.030, 0.005);                // notch — pull the fore edge back in
    const s3=bl(0.240, 0.014, 0.052, 0.004);                // re-widen: jagged tooth
    const s4=bl(0.300, 0.006, 0.010, 0.003);
    stitch([s0,s1,s2,s3,s4], (b)=> b===2 ? P.ironDk : P.iron);
    capFan(s4, g0.clone().addScaledVector(BLADE, 0.335), P.iron);
  }

  /* ---------- TORSO — spindly, hunched. A slight forward pitch applied to the whole loft so the
     chest leans over the blade (skulking). Scrap-leather chestpiece dark over the green hide. ---------- */
  const pitch = (p)=>{ // rotate about the hip point for a hunched lean
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.16);                       // tip forward (+z lean up top)
    return q.add(V(0, L.hipY, 0));
  };
  stack([
    {y:L.hipY,   rx:0.120, rz:0.098, hex:P.skinDk},
    {y:L.waistY, rx:0.112, rz:0.090, hex:P.skin},
    {y:L.chestY, rx:0.150, rz:0.115, hex:P.leather},        // chestpiece
    {y:L.shldY,  rx:0.158, rz:0.112, hex:P.leather},
    {y:L.neckY,  rx:0.058, rz:0.055, hex:P.skinDk},
  ], 8, {xform:pitch, capTop:{hex:P.skinDk, lift:0.004}});

  /* chestpiece straps — two dark diagonal bands crossing the front (scrap-leather harness) */
  for(const s of [-1,1]){
    const a=pitch(V(s*0.10, L.chestY+0.03, 0.115)), b=pitch(V(-s*0.05, L.waistY, 0.108));
    tube(a, b, 0.016, 0.014, 4, P.strap);
  }

  /* ragged loin-wrap — a short torn skirt low on the hips (uneven hem via jittered bands) */
  stack([
    {y:0.290, rx:0.140, rz:0.116, hex:P.loin},
    {y:0.345, rx:0.128, rz:0.104, hex:P.rag},
    {y:0.400, rx:0.120, rz:0.096, hex:P.ragDk},
  ], 8, {xform:pitch});
  /* a hanging torn flap in front (asymmetric ragged read) */
  quad(pitch(V(-0.045,0.24,0.128)), pitch(V(0.038,0.255,0.126)),
       pitch(V(0.030,0.345,0.118)), pitch(V(-0.052,0.34,0.120)), P.ragDk, 0.06);

  /* ---------- HEAD — OVERSIZED, mean. Hooked nose push, heavy brow, wide toothy underbite hint.
     The whole head is pitched forward with the torso so it juts on the hunched neck. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.095, rz:0.108, hex:P.skinLt},        // jaw juts forward (rz>rx) — underbite base
      {y:L.cheekY, rx:0.137, rz:0.124, hex:P.skin},          // wider L-R than deep (less egg-like)
      {y:L.browY,  rx:0.144, rz:0.115, hex:P.skin},
      {y:L.crownY, rx:0.106, rz:0.090, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(pitch));
    /* hooked nose: a distinct forward-and-DOWN hook on the cheek-band front verts (big push so it
       reads as a beaky hook from the front, not a smooth face); the mid front vert (nose tip) drops most */
    for(const i of [1,2]){ rings[1][i].z += 0.062; rings[1][i].y -= 0.036; }
    /* heavy scowling brow: shove the brow front verts forward + down HARD for a deep overhang
       that shades the eyes (the mean read) */
    for(const i of [1,2]){ rings[2][i].z += 0.040; rings[2][i].y -= 0.018; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings[3], pitch(V(0, L.headTopY, 0.008)), P.skinDk);

    /* jaw / underbite — a short forward-jutting lower-jaw wedge below the jaw band, paler,
       with a row of tiny tooth quads on its upper front edge (the toothy underbite hint). */
    const jawFrontTop = pitch(V(0, L.jawY-0.005, 0.150));
    const jawFrontBot = pitch(V(0, L.jawY-0.070, 0.128));
    tube(pitch(V(0,L.jawY+0.005,0.02)), jawFrontBot, 0.088, 0.058, 6, P.skinLt, {raz:0.070, rbz:0.052, capB:{hex:P.skinDk}});
    /* tooth row: 3 tiny upward tooth-nubs along the underbite lip */
    for(const tx of [-0.052, 0, 0.052]){
      const base = pitch(V(tx, L.jawY-0.010, 0.150));
      const tip  = pitch(V(tx, L.jawY+0.028, 0.146));
      tube(base, tip, 0.014, 0.006, 4, P.tooth, {capB:{hex:P.tooth, lift:0.004}});
    }
    /* HUGE POINTED EARS — long wedge tubes swept back and out from the cheek band, tapering
       to sharp points (the goblin silhouette icon; oversized per the reference). */
    for(const s of [-1,1]){
      const eb = pitch(V(s*0.136, L.cheekY+0.018, 0.00));
      const et = pitch(V(s*0.226, L.browY+0.070, -0.122));   // swept back (-z) + up + out
      tube(eb, et, 0.050, 0.006, 5, P.skin, {raz:0.025, rbz:0.004, capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.006}});
    }
  }

  /* ---------- ARMS — spindly, ending in OVERSIZED clawing hands. Right derives to the blade
     grip; left hangs low and forward, splayed (menace). Hands are wide flat blobs w/ claw nubs. ---------- */
  const bigHand = (ctr, faceDir, hex)=>{
    // a wide flattened palm blob + 3 claw nubs splaying off the front edge
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.030), ctr.clone().addScaledVector(d,0.030),
         0.052, 0.046, 6, hex, {raz:0.030, rbz:0.030, capA:{hex}, capB:{hex}});
    for(const off of [-1,0,1]){
      const kb = ctr.clone().addScaledVector(d,0.028).addScaledVector(side, off*0.032);
      const kt = kb.clone().addScaledVector(d,0.052).addScaledVector(side, off*0.010);
      tube(kb, kt, 0.013, 0.005, 4, hex, {capB:{hex:P.nail, lift:0.004}});
    }
  };
  {
    /* right arm -> blade fist */
    const S=pitch(V(L.shoulderX, L.shldY-0.005, 0.02));
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.010);
    const E=V(0.235, 0.400, 0.075);
    tube(S,E,0.040,0.032,6,P.skin);
    tube(E,FIST,0.032,0.026,6,P.skin);
    bigHand(FIST, BLADE, P.skin);

    /* left arm -> splayed empty claw, low + forward */
    const S2=pitch(V(-L.shoulderX, L.shldY-0.005, 0.02));
    const E2=V(-0.230, 0.395, 0.085);
    const W2=V(-0.215, 0.245, 0.185);
    tube(S2,E2,0.040,0.032,6,P.skin);
    tube(E2,W2,0.032,0.026,6,P.skin);
    bigHand(W2, V(-0.10,-0.35,1), P.skin);
  }

  /* ---------- LEGS — stumpy, spindly, bent in a crouch. Knees pushed out, feet planted wide. ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.130,0.195,0.075), ankL=V(-0.115,0.070,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.135,0.195,0.055), ankR=V( 0.120,0.070,0.00);
    tube(hipL,kneeL,0.050,0.040,6,P.skin);
    tube(kneeL,ankL,0.038,0.030,6,P.skinDk);
    tube(hipR,kneeR,0.050,0.040,6,P.skin);
    tube(kneeR,ankR,0.038,0.030,6,P.skinDk);
    /* bare splayed feet with claw toes (no boots — feral) */
    for(const [ank,toeDir] of [[ankL,V(-0.15,0,1)], [ankR,V(0.15,0,1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.045,ank.z);
      tube(heel, heel.clone().addScaledVector(d,0.100), 0.044,0.030,6,P.skinDk, {raz:0.038, rbz:0.022, capA:{hex:P.skinDk}});
      /* 2 claw toes off the front */
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-0.5,0.5]){
        const tb=heel.clone().addScaledVector(d,0.095).addScaledVector(side, off*0.030);
        const tt=tb.clone().addScaledVector(d,0.030);
        tube(tb, tt, 0.011,0.005,4,P.skinDk,{capB:{hex:P.nail, lift:0.003}});
      }
    }
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.305, 0.305, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
