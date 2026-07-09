/* dev/model-qa/creatures/mon-zombie.js — the ZOMBIE (HUMANOID, Medium, CR 1/4, realm core),
   REBUILT 2026-07-08 under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (rebuild-w3, cell 1).
   Flavor: 9-direct plague-carrier — a fresh-buried neighbor still walking its route. Necrotic
   grey-green skin, torn tunic, the sickliest palette in the cast — palette intent PRESERVED
   from the prior pass; geometry rebuilt to the law-5 pose brief below.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID torso per ANATOMY-CANON standing anatomy (hip/waist/rib/chest/shoulder/neck loft),
        run through a forward-stoop transform so the spine itself leans off dead-center — never a
        flat frontal stack.
     2. SIGNATURE — an EXPOSED WOUND ZONE on the torso: a torn tunic flap peeled back to a pale
        rib/bone patch (the single highest-value zone on the model, lifted clear of the necrotic
        skin and dark rag palette so it reads as the loud identity feature at a squint).
     3. Torn tunic skirt, ragged uneven hem (per-panel jagged lengths + a couple of loose hanging
        strips) — the corpse-clothing tell.
     4. LOLLED head — rolled off-axis at the neck pivot, dark slack-mouth gap, mottled rot patches.
     5. POSEFIX 2026-07-08 (Adam's POSE-ANATOMY ruling) — arms carry ZOMBIE LOOSENESS as HANGING
        JOINTS, not a rigor-mortis reach (the mummy carve-out does not apply to this creature):
        the dragging-leg-side arm hangs and SWINGS mid-pendulum, bent hard at the elbow, wrist
        low and trailing; the planting-leg-side arm is only BARELY lifted off the hang, elbow
        bent, hand resting near the belly — its shoulder rolls forward/up with the lift (law 3).
        Neither arm is a straight stick; both read a visible elbow arc.
     6. One leg PLANTS forward (weight-bearing stride), the other DRAGS behind carving a furrow —
        stiff knee, toe trailing low and turned, the limp's tell.

   POSE SENTENCE: caught mid-shamble, torso stooped forward AND slumped laterally toward the
   dragging leg (the spine gesture — not a plumb diagonal), head lolled onto one shoulder, the
   near arm hanging loose mid-swing with a hard elbow bend while the far arm is barely lifted off
   its hang with a rolled-forward shoulder, one leg striding forward to plant while the other
   drags stiff-kneed behind — dragging a furrow, not walking — never an at-attention stance,
   always the half-second of the lurch itself.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w3'], cell 1, fn buildZombie). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { buildBase } from '../parts.js';

export function buildZombie(){
  /* ---------- PALETTE (necrotic grey-green, mottled; the sickliest skin in the cast) ---------- */
  const P = {
    skin:0x9aa886, skinDk:0x74815f, rot:0x565f47, rotDk:0x404834,   /* grey-green flesh + dark rot */
    bone:0xd8d2b8, boneDk:0xb0a888,                                  /* the exposed rib patch — HIGH VALUE */
    tunic:0x6b6553, tunicDk:0x504b3d, tunicTorn:0x7a7360,            /* filthy torn rag */
    nail:0x2c261c, mouth:0x120e0a, eye:0x171712,
  };

  /* ---------- RIG (standing HUMANOID anatomy; the STOOP transform bends it forward off-axis) --- */
  const L = {
    hipY:0.72, waistY:0.80, ribY:0.91, chestY:1.02, shldY:1.10, neckY:1.145,
    hipHalf:0.115, shoulderX:0.245,
    jawY:1.175, cheekY:1.25, browY:1.325, crownY:1.415, headTopY:1.475,
  };

  /* THE STOOP — everything above the hip pivot leans FORWARD (+z) and drifts to one side (+x, the
     DRAGGING-LEG side — POSEFIX 2026-07-08, Adam's POSE-ANATOMY ruling), sinking slightly, growing
     with height so the head leads furthest off-axis. This IS the spine gesture: one C-curve from
     pelvis to skull slumping toward the dragging leg (dragging leg is +x, see LEGS below) — the
     lurch collapsing sideways onto its bad side, not a plumb lean. */
  const HIPY = L.hipY;
  const stoop = (p) => {
    const t = Math.max(0, p.y - HIPY);
    const t2 = t*t;
    return V(p.x + t*0.10 + t2*0.04,
             p.y - t*0.05,
             p.z + t*0.20 + t2*0.09);
  };

  /* ===== TRUNK — filthy tunic loft, hips→neck, run through the stoop ===== */
  stack([
    {y:L.hipY,   rx:0.200, rz:0.150, hex:P.tunicDk},
    {y:L.waistY, rx:0.168, rz:0.126, hex:P.tunic},
    {y:L.ribY,   rx:0.192, rz:0.144, hex:P.tunic},
    {y:L.chestY, rx:0.210, rz:0.150, hex:P.tunic},
    {y:L.shldY,  rx:0.206, rz:0.140, hex:P.tunicDk},
    {y:L.neckY,  rx:0.078, rz:0.072, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:stoop});

  /* ===== SIGNATURE — the EXPOSED WOUND ZONE: torn tunic flap peeled back to a pale rib patch ==== */
  {
    /* the peeled-back flap — a dark ragged tunic triangle, hinged at one edge, folded outward */
    /* moved UP-LEFT onto the far shoulder/upper-chest — clear of the near (right) reaching arm
       that crosses the lower torso, so the loud signature never gets occluded by its own pose */
    const hingeA = stoop(V(-0.16, L.shldY+0.01, 0.132));
    const hingeB = stoop(V(-0.02, L.chestY-0.02, 0.140));
    const flapTipA = stoop(V(-0.22, L.chestY+0.06, 0.03));   /* peeled OUT and to the side, away from torso */
    const flapTipB = stoop(V(-0.22, L.chestY-0.08, 0.03));
    quad(hingeA, hingeB, flapTipB, flapTipA, P.tunicTorn, 0.05);

    /* the exposed patch beneath — pale rib/bone showing through the tear, HIGH VALUE against the
       dark tunic + necrotic skin around it (law 3: the loud signature carries the light) —
       enlarged + unoccluded so it reads at a squint */
    const woundC = stoop(V(-0.09, L.chestY-0.01, 0.150));
    blob(woundC.x, woundC.y, woundC.z, 0.078, 0.088, 0.024, P.rotDk, 6, 4);      /* the raw wound bed */
    blob(woundC.x-0.006, woundC.y+0.006, woundC.z+0.008, 0.062, 0.066, 0.020, P.bone, 6, 4); /* rib patch — brightest zone on the model */
    /* three thin rib striations across the pale patch — the countable "bone" read */
    for(const dy of [-0.020, 0.002, 0.024]){
      const a = stoop(V(-0.09-0.036, L.chestY-0.01+dy, 0.156));
      const b = stoop(V(-0.09+0.038, L.chestY-0.01+dy, 0.156));
      tube(a, b, 0.008, 0.007, 4, P.boneDk);
    }
  }

  /* ===== TORN TUNIC SKIRT — ragged UNEVEN hem: each panel a different length ===== */
  {
    const n=8, ph=Math.PI/n;
    const top=ring(V(0,L.hipY-0.005,0), V(0,1,0), 0.205, 0.158, n, ph).map(stoop);
    const hemY=[0.50,0.40,0.34,0.46,0.52,0.38,0.30,0.44];
    const hem=[];
    for(let i=0;i<n;i++){
      const t=ph + (i/n)*Math.PI*2;
      const rx=0.235, rz=0.185;
      hem.push(stoop(V(Math.cos(t)*rx, hemY[i], Math.sin(t)*rz)));
    }
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(top[i], top[i2], hem[i2], hem[i], i&1?P.tunic:P.tunicTorn, 0.06);
    }
    for(const i of [2,6]){
      const t=ph + (i/n)*Math.PI*2;
      const a=stoop(V(Math.cos(t)*0.22, hemY[i], Math.sin(t)*0.175));
      tube(a, a.clone().add(V(0,-0.11,0.01)), 0.028,0.015,4,P.tunicTorn,{capB:{hex:P.tunicDk}});
    }
  }

  /* ===== HEAD — LOLLED to one side (roll about z), mouth a dark slack gap ===== */
  {
    const n=8, ph=Math.PI/n;
    const pivot=stoop(V(0,L.neckY,0));
    const roll = 0.40;
    const loll = (p) => { const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), roll); q.applyAxisAngle(V(1,0,0), 0.10); return q.add(pivot); };
    const xf = (p) => loll(stoop(p));

    const bands=[
      {y:L.jawY,   rx:0.084, rz:0.090, hex:P.skin},
      {y:L.cheekY, rx:0.112, rz:0.108, hex:P.skin},
      {y:L.browY,  rx:0.116, rz:0.106, hex:P.skinDk},
      {y:L.crownY, rx:0.092, rz:0.084, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.012), V(0,1,0), b.rx, b.rz, n, ph).map(xf));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){
      const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
    }
    capFan(rings[3], xf(V(0, L.headTopY, 0.008)), P.skinDk);
    /* MOUTH — dark slack gap */
    const my=L.jawY+0.028, mz=0.120;
    quad(xf(V(-0.034,my+0.006,mz)), xf(V(0.030,my+0.006,mz)),
         xf(V(0.028,my-0.048,mz-0.01)), xf(V(-0.032,my-0.048,mz-0.01)), P.mouth, 0.0);
    tube(xf(V(-0.052,L.jawY-0.01,0.03)), xf(V(0.052,L.jawY-0.01,0.03)), 0.018,0.018,5,P.skinDk);

    /* rot patches — mottled dark blobs on scalp/cheek */
    { const q=xf(V(-0.06,L.browY,0.05)); blob(q.x,q.y,q.z, 0.04,0.03,0.03, P.rot, 6, 4); }
    { const q=xf(V(0.05,L.cheekY,0.09)); blob(q.x,q.y,q.z, 0.028,0.024,0.022, P.rotDk, 6, 4); }
  }

  /* ===== ARMS — POSEFIX 2026-07-08: HANGING joints, not a rigor-mortis reach. Both elbows bend
     hard (~105-127°, never a straight stick); the two arms are UNEVEN — one swinging loose off a
     plain hang, the other barely lifted with its shoulder rolled forward (law 3). ===== */
  {
    const Ss = (x) => stoop(V(x, L.shldY-0.01, 0.015));
    /* Elbow/wrist are authored as OFFSETS off the already-stooped shoulder, not independently
       re-stooped raw points — a hanging wrist sits near/below hip height, where stoop()'s offset
       collapses toward zero while the shoulder (well above hip) carries a large offset; stooping
       each joint on its own raw y tears the arm apart. Offsets keep the arm rigid on the torso. */

    /* NEAR arm (right) — the DRAGGING-LEG side — hangs and SWINGS mid-pendulum: upper arm drops
       almost straight down off the shoulder, forearm kicks BACK and further down at a hard elbow
       bend, wrist low and trailing behind the body line — the loose dead-weight swing. */
    const S=Ss(L.shoulderX*0.9);
    const E=S.clone().add(V(0.040,-0.330,0.105));
    const W=E.clone().add(V(0.040,-0.240,-0.170));
    tube(S,E,0.070,0.056,6,P.tunicDk);
    tube(E,W,0.052,0.044,6,P.skin);
    blob(W.x,W.y,W.z, 0.05,0.045,0.05, P.skin, 6, 4);
    /* loose dangling fingers — hang down and trail back with the wrist, not splayed forward */
    const fanDirs=[V(-0.25,-1,-0.25),V(0.05,-1,-0.15),V(0.30,-0.85,0.05),V(0.35,-0.6,0.25),V(0.10,-0.55,0.40)];
    for(const d of fanDirs){
      const dn=d.clone().normalize();
      const tip=W.clone().addScaledVector(dn,0.10);
      tube(W, tip, 0.017,0.010,4,P.skin,{capB:{hex:P.nail}});
    }

    /* FAR arm (left) — the PLANTING-LEG side — only BARELY lifted off the hang: shoulder rolled
       forward/up with the lift (law 3), elbow flares OUT and DOWN clear of the wound signature
       (both live on this side of the torso — the elbow has to swing wide before the forearm cuts
       back in), hand resting near the belly rather than reaching out. */
    const S2=stoop(V(-L.shoulderX*0.9, L.shldY+0.02, 0.045));   /* rolled-forward/up shoulder */
    const E2=S2.clone().add(V(-0.050,-0.320,0.040));
    const W2=E2.clone().add(V(0.190,-0.080,0.060));
    tube(S2,E2,0.070,0.056,6,P.tunicDk);
    tube(E2,W2,0.052,0.044,6,P.skin);
    blob(W2.x,W2.y,W2.z, 0.046,0.042,0.046, P.skin, 6, 4);
    /* relaxed fingers curled near the belly, not splayed outward */
    const fanDirs2=[V(-0.3,-0.5,0.4),V(-0.1,-0.6,0.5),V(0.1,-0.5,0.55),V(0.25,-0.3,0.45)];
    for(const d of fanDirs2){
      const dn=d.clone().normalize();
      const tip=W2.clone().addScaledVector(dn,0.085);
      tube(W2, tip, 0.015,0.009,4,P.skin,{capB:{hex:P.nail}});
    }
  }

  /* ===== LEGS — one PLANTS forward (stride), the other DRAGS behind carving a furrow ===== */
  {
    /* FRONT/planting leg (left) — weight-bearing, striding forward */
    const hipL=stoop(V(-L.hipHalf, L.hipY-0.01, 0.01));
    const kneeL=V(-0.145,0.40,0.16), ankL=V(-0.155,0.085,0.22);
    tube(hipL,kneeL,0.084,0.060,6,P.skinDk);
    tube(kneeL,ankL,0.056,0.042,6,P.skin);
    blob(kneeL.x,kneeL.y,kneeL.z, 0.045,0.04,0.045, P.skinDk, 6, 4);
    { const toeA=V(ankL.x,0.05,ankL.z), d=V(0.05,0,1).normalize();
      stack([{y:0.012,rx:0.06,rz:0.07,cx:ankL.x,cz:ankL.z,hex:P.skinDk},{y:0.07,rx:0.052,rz:0.05,cx:ankL.x,cz:ankL.z,hex:P.skin}],6,{capTop:{hex:P.skin,lift:0.004}});
      tube(toeA, toeA.clone().addScaledVector(d,0.12), 0.05,0.038,6,P.skinDk,{capB:{hex:P.skinDk,lift:0.012},raz:0.044,rbz:0.03}); }

    /* DRAGGING leg (right) — stiff, trailing back, toe carving a furrow behind it */
    const hipR=stoop(V(L.hipHalf, L.hipY-0.01, 0.0));
    const kneeR=V(0.165,0.36,-0.14), ankR=V(0.175,0.09,-0.32);
    tube(hipR,kneeR,0.084,0.060,6,P.skinDk);
    tube(kneeR,ankR,0.056,0.040,6,P.skin);
    blob(kneeR.x,kneeR.y,kneeR.z, 0.045,0.04,0.045, P.skinDk, 6, 4);
    /* the dragging foot */
    { const toeA=V(ankR.x,0.035,ankR.z), d=V(0.02,-0.15,-1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.13), 0.05,0.03,6,P.skinDk,{capA:{hex:P.skin},capB:{hex:P.rotDk,lift:0.012},raz:0.044,rbz:0.022}); }
    /* the FURROW — a low dark scuffed ridge in the dirt trailing behind the dragging toe, the
       ground-tell that reads even before the foot itself does */
    { const fa=V(ankR.x-0.01,0.030,ankR.z-0.12), fb=V(ankR.x+0.02,0.026,ankR.z-0.30);
      tube(fa, fb, 0.020,0.014,5,P.rotDk); }
  }

  /* base disc — shared module */
  buildBase(P);
}
