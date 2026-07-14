/* dev/model-qa/creatures/mon-goblin.js — GOBLIN WARRIOR (HUMANOID, Small, CR 1/4, realm core),
   REBUILT under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot,
   rebuild-w4, cell 3). Same file path + exported fn as the prior pass; geometry replaced, the
   mottled-green-olive palette intent and the huge-ears/oversized-head signature KEPT (both were
   already correct — the miss was the pose: a skulking crouch, not the shrieking rush this brief
   calls for).

   FEATURE CHECKLIST (the ~1,000-1,600 budget buys):
     1. HUMANOID Small anatomy per ANATOMY-CANON — scrawny torso, knees-out crouch stance, but the
        whole frame pitched hard into a forward SPRINT lean (not the neutral hunch) so the anatomy
        itself carries the charge.
     2. SIGNATURE — the oversized head + HUGE back-swept ears, now FLATTENED hard against the skull
        (a sprinting-animal ear read, wind-pinned) rather than idly splayed.
     3. Wide-open shrieking mouth — a real gap between upper and lower jaw (not a closed line), a
        tooth row on both lips, the high-value read Adam's brief calls out.
     4. Crude jagged shortblade, now swung BACK behind the shoulder mid-windup (not held low/ready)
        — the weapon reads as motion, not a static prop.
     5. Mottled green-olive hide — blotchy value-varied skin bands (not one flat green) so the body
        still reads as textured hide against the dark void, law 3's second high-value zone.
     6. Spindly limbs / oversized clawing hands, splayed for balance mid-sprint (off-hand thrown
        wide, not hanging).

   POSE SENTENCE: caught mid-sprint in the shrieking rush — torso pitched hard forward over
   churning bent legs, off-arm thrown wide for balance, the jagged blade swung back behind the
   shoulder for the coming cut, mouth torn wide in a shriek, huge ears pinned flat back by the
   charge — never the idle skulk, always the half-second before it reaches you.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w4'], cell 3, fn buildGoblin). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGoblin(){

  /* ---------- PALETTE (VS desaturated; mottled sickly green-olive hide + one bright tooth/eye
     high-value zone) ---------- */
  const P = {
    skin:0x6f7a41, skinDk:0x4a5228, skinLt:0x8a9758, skinMot:0x596532,   // mottled hide bands
    rag:0x6b5d3f, ragDk:0x4c4029, loin:0x7d6a45,           // dirty ragged cloth
    leather:0x4a3a26, leatherDk:0x34281a, strap:0x5a4830,  // scrap chestpiece
    iron:0xf0f2f4, ironDk:0x656a6e, rust:0x6a4a34,         // crude blade — bright silver, the high-value beat
    tooth:0xf2e8cc, eye:0xd8542c, eyeDk:0x1a0f0a,          // bright teeth + a hot mean eye
    mouth:0x2a1410,                                        // dark open-maw interior
    nail:0x2b2620, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — tiny sprint-crouched frame, oversized head. Hip/waist/chest/shoulder/
     neck heights as before; the SPRINT lean is applied as a steeper forward pitch below. ---------- */
  const L = {
    hipY:0.320, waistY:0.365, chestY:0.435, shldY:0.482, neckY:0.508,
    hipHalf:0.088, shoulderX:0.150,
    jawY:0.528, cheekY:0.602, browY:0.688, crownY:0.792, headTopY:0.856,
  };

  /* pitch: rotate about the hip point — steep forward lean (sprint) shared by torso/head/loin */
  const pitch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.34);                       // deep forward charge-lean
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- BLADE — swung BACK behind the right shoulder mid-windup (not held low). Grip is
     ground truth for the fist below. ---------- */
  const GRIP = pitch(V(0.205, 0.470, -0.145));               // up, back, out to the right — windup
  const TIP  = pitch(V(0.335, 0.640, -0.330));                // blade sweeps further back + up
  const BLADE = new THREE.Vector3().subVectors(TIP, GRIP).normalize();
  const BUTT  = GRIP.clone().addScaledVector(BLADE, -0.055);
  {
    tube(BUTT, GRIP.clone().addScaledVector(BLADE, 0.035), 0.017, 0.016, 5, P.leatherDk, {capA:{hex:P.ironDk, lift:0.012}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE, 0.040);
    tube(g0.clone().addScaledVector(gu,-0.030), g0.clone().addScaledVector(gu,0.030), 0.012, 0.012, 5, P.rust);
    /* jagged single-edge blade — flat slab widening then hooking to a point, one notch */
    const bl=(t,wBack,wFore,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [ c.clone().addScaledVector(gu, wFore).addScaledVector(gv, th),
               c.clone().addScaledVector(gu, wFore).addScaledVector(gv,-th),
               c.clone().addScaledVector(gu,-wBack).addScaledVector(gv,-th),
               c.clone().addScaledVector(gu,-wBack).addScaledVector(gv, th) ];
    };
    const s0=bl(0.015, 0.020, 0.026, 0.006);
    const s1=bl(0.110, 0.028, 0.052, 0.006);
    const s2=bl(0.180, 0.030, 0.030, 0.005);
    const s3=bl(0.240, 0.014, 0.052, 0.004);
    const s4=bl(0.300, 0.006, 0.010, 0.003);
    stitch([s0,s1,s2,s3,s4], (b)=> b===2 ? P.ironDk : P.iron);
    capFan(s4, g0.clone().addScaledVector(BLADE, 0.335), P.iron);
  }

  /* ---------- TORSO — spindly, charging. Mottled bands vary the hide value so the body reads as
     textured against the void (law 3), scrap-leather chestpiece dark over it. ---------- */
  stack([
    {y:L.hipY,   rx:0.118, rz:0.096, hex:P.skinDk},
    {y:L.waistY, rx:0.110, rz:0.088, hex:P.skinMot},
    {y:L.chestY, rx:0.148, rz:0.112, hex:P.leather},        // chestpiece
    {y:L.shldY,  rx:0.156, rz:0.110, hex:P.leather},
    {y:L.neckY,  rx:0.056, rz:0.053, hex:P.skinDk},
  ], 8, {xform:pitch, capTop:{hex:P.skinDk, lift:0.004}});

  /* chestpiece straps — two dark diagonal bands crossing the front */
  for(const s of [-1,1]){
    const a=pitch(V(s*0.10, L.chestY+0.03, 0.113)), b=pitch(V(-s*0.05, L.waistY, 0.106));
    tube(a, b, 0.016, 0.014, 4, P.strap);
  }
  /* mottled patch blobs on the exposed hip band — cheap value-varied texture read */
  for(const [mx,my,mz] of [[0.075,L.hipY+0.01,0.05],[-0.06,L.waistY-0.02,-0.06],[0.02,L.hipY-0.02,-0.08]]){
    const c = pitch(V(mx,my,mz));
    tube(c, c.clone().addScaledVector(V(0,1,0),0.015), 0.028, 0.024, 5, P.skinLt);
  }

  /* ragged loin-wrap — short torn skirt, uneven hem */
  stack([
    {y:0.270, rx:0.136, rz:0.112, hex:P.loin},
    {y:0.320, rx:0.124, rz:0.100, hex:P.rag},
    {y:0.372, rx:0.116, rz:0.092, hex:P.ragDk},
  ], 8, {xform:pitch});
  quad(pitch(V(-0.045,0.222,0.124)), pitch(V(0.038,0.235,0.122)),
       pitch(V(0.030,0.320,0.114)), pitch(V(-0.052,0.315,0.116)), P.ragDk, 0.06);

  /* ---------- HEAD — OVERSIZED, mean, torn open in a shriek. Pitched with the torso so it juts
     forward on the charge. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.090, rz:0.102, hex:P.skinLt},
      {y:L.cheekY, rx:0.135, rz:0.122, hex:P.skin},
      {y:L.browY,  rx:0.142, rz:0.113, hex:P.skin},
      {y:L.crownY, rx:0.104, rz:0.088, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(pitch));
    /* hooked nose on the cheek band */
    for(const i of [1,2]){ rings[1][i].z += 0.058; rings[1][i].y -= 0.030; }
    /* heavy scowling brow, driven forward+down over the shriek */
    for(const i of [1,2]){ rings[2][i].z += 0.036; rings[2][i].y -= 0.016; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings[3], pitch(V(0, L.headTopY, 0.008)), P.skinDk);

    /* EYES — small mean glare tucked under the brow ridge, cream sclera + a dark pupil punched
       toward the viewer. This is the render's actual high-value zone: the signature ears break
       the silhouette but sit at the same dim hide value as the rest of the body, so without this
       the model has no bright spot ON the head at all (critic finding — law 3 wants the light on
       the signature, not just the blade). Cheap (2 tiny blobs), well inside the tri budget. */
    for(const s of [-1,1]){
      const ec = pitch(V(s*0.068, L.cheekY+0.058, 0.150));           // pushed proud of the cheek/
                                                                       // brow surface (z~0.122-0.136)
                                                                       // so it isn't buried inside the head
      blob(ec.x, ec.y, ec.z, 0.032, 0.026, 0.024, P.tooth, 6, 3);
      const pc = ec.clone().addScaledVector(V(s*0.2,0.05,1).normalize(), 0.020);
      blob(pc.x, pc.y, pc.z, 0.015, 0.015, 0.013, P.eyeDk, 5, 3);
    }

    /* WIDE-OPEN SHRIEKING MOUTH — a real vertical gap between an upper lip ridge and a dropped
       lower jaw wedge, dark interior between them, tooth rows on BOTH edges (the high-value beat
       the brief calls out). Upper lip stays close under the cheek band; lower jaw drops hard. */
    const upperLipY = L.jawY + 0.028;
    const upperTip = pitch(V(0, upperLipY, 0.148));
    tube(pitch(V(0,upperLipY+0.018,0.02)), upperTip, 0.082, 0.050, 6, P.skinLt, {raz:0.066, rbz:0.046});
    const jawFrontBot = pitch(V(0, L.jawY-0.092, 0.132));      // dropped hard = the gape
    tube(pitch(V(0,L.jawY-0.010,0.03)), jawFrontBot, 0.086, 0.056, 6, P.skinLt, {raz:0.068, rbz:0.050, capB:{hex:P.skinDk}});
    /* dark mouth-interior gusset closing the gap between the two lip rims */
    quad(pitch(V(-0.052,upperLipY,0.146)), pitch(V(0.052,upperLipY,0.146)),
         pitch(V(0.056,L.jawY-0.010,0.130)), pitch(V(-0.056,L.jawY-0.010,0.130)), P.mouth, 0.04);
    /* upper tooth row (hangs down from the upper lip) — widened to clear the 0.04u feature floor */
    for(const tx of [-0.052, 0, 0.052]){
      const base = pitch(V(tx, upperLipY-0.006, 0.150));
      const tip  = pitch(V(tx, upperLipY-0.046, 0.144));
      tube(base, tip, 0.022, 0.010, 4, P.tooth, {capB:{hex:P.tooth, lift:0.004}});
    }
    /* lower tooth row (juts up from the dropped jaw — the underbite tusks), widened to match */
    for(const tx of [-0.048, 0.048]){
      const base = pitch(V(tx, L.jawY-0.026, 0.140));
      const tip  = pitch(V(tx, L.jawY+0.020, 0.134));
      tube(base, tip, 0.024, 0.011, 4, P.tooth, {capB:{hex:P.tooth, lift:0.004}});
    }

    /* HUGE POINTED EARS — swept back by the charge but flared WIDE OUT to the sides so they still
       break the silhouette from the 3/4 dimetric read (pass-1 self-correct: a pure backward sweep
       tucked them fully behind the skull from this camera and the signature vanished — law 2).
       Bigger base radius than the prior pass ("HUGE" per the brief), tapering to sharp points. */
    for(const s of [-1,1]){
      const eb = pitch(V(s*0.140, L.cheekY+0.014, 0.010));
      const et = pitch(V(s*0.320, L.browY+0.020, -0.110));     // flared far OUT + up, swept back only moderately
      tube(eb, et, 0.060, 0.007, 5, P.skin, {raz:0.028, rbz:0.006, capA:{hex:P.skinDk}, capB:{hex:P.skinLt, lift:0.006}});
    }
  }

  /* ---------- ARMS — spindly, ending in OVERSIZED clawing hands. Right arm swings the blade back
     behind the shoulder (windup, derives from GRIP/BLADE above); left arm THROWN WIDE for sprint
     balance (not hanging low). ---------- */
  const bigHand = (ctr, faceDir, hex)=>{
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
    /* right arm -> blade fist, swung back overhead */
    const S=pitch(V(L.shoulderX, L.shldY-0.005, 0.02));
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.010);
    const E=pitch(V(0.220, 0.560, -0.050));
    tube(S,E,0.040,0.032,6,P.skin);
    tube(E,FIST,0.032,0.026,6,P.skin);
    bigHand(FIST, BLADE, P.skin);

    /* left arm -> thrown wide for balance, splayed claw open */
    const S2=pitch(V(-L.shoulderX, L.shldY-0.005, 0.02));
    const E2=pitch(V(-0.290, 0.400, 0.060));
    const W2=pitch(V(-0.340, 0.330, 0.170));
    tube(S2,E2,0.040,0.032,6,P.skin);
    tube(E2,W2,0.032,0.026,6,P.skin);
    bigHand(W2, V(-0.25,-0.15,0.95), P.skin);
  }

  /* ---------- LEGS — churning mid-stride. Trailing leg back and bent high (push-off), leading
     leg forward and planted (the sprint's front foot). Knees pushed out, feet splayed. ---------- */
  {
    /* trailing (rear) leg — kicked back and up, heel toward the seat, the push-off leg. Knee/ankle
       pushed further out past the torso's left silhouette edge (critic finding — the prior values
       sat inside the torso's shadow footprint from the rebuild-w4 cam and read as a missing leg;
       matches how the off-arm already clears the torso on the same side) so it reads as a second
       churning leg instead of vanishing behind the body. */
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.230,0.250,-0.070), ankL=V(-0.195,0.165,-0.115);
    /* leading (front) leg — planted forward under the charge lean */
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.155,0.185,0.140), ankR=V( 0.130,0.055,0.190);
    tube(hipL,kneeL,0.050,0.040,6,P.skin);
    tube(kneeL,ankL,0.038,0.030,6,P.skinDk);
    tube(hipR,kneeR,0.050,0.040,6,P.skin);
    tube(kneeR,ankR,0.038,0.030,6,P.skinDk);
    /* bare splayed feet with claw toes — trailing foot points back/up, leading foot points fwd/down */
    const heelL=V(ankL.x,0.075,ankL.z), toeDirL=V(-0.10,-0.25,-1).normalize();
    const heelR=V(ankR.x,0.040,ankR.z), toeDirR=V( 0.15, 0.02, 1).normalize();
    for(const [heel,d] of [[heelL,toeDirL],[heelR,toeDirR]]){
      tube(heel, heel.clone().addScaledVector(d,0.100), 0.044,0.030,6,P.skinDk, {raz:0.038, rbz:0.022, capA:{hex:P.skinDk}});
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
