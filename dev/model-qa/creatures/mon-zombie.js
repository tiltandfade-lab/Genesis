/* dev/model-qa/creatures/mon-zombie.js — the UNDEAD shambler (whole-object monster).
   Whole-object grammar: one function, one geometry frame, no anchors. NO held item.
   The read is DEAD-THING-WALKING, told by POSTURE alone — distinct from every living figure:
   a heavy forward SLUMP that leans the torso+head off-axis (asymmetric); one arm REACHING forward
   with splayed fingers, the other hanging dead; a torn tunic with a ragged uneven hem; grey-green
   necrotic skin mottled with darker rot patches; the head LOLLED to one side, mouth a dark slack
   gap; a dragging back leg. Desaturated, sickly. Silhouette must scream corpse before any detail. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { buildBase } from '../parts.js';

export function buildZombie(){
  /* ---------- PALETTE (necrotic grey-green, mottled; the sickliest skin in the cast) ---------- */
  const P = {
    skin:0x9aa886, skinDk:0x74815f, rot:0x565f47, rotDk:0x404834,   /* grey-green flesh + dark rot patches (lifted for dark panels) */
    tunic:0x6b6553, tunicDk:0x504b3d, tunicTorn:0x7a7360,            /* filthy torn rag */
    nail:0x2c261c, mouth:0x120e0a, eye:0x171712,
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- RIG (a living-figure skeleton; the SLUMP transform bends it forward off-axis) ------ */
  const L = {
    hipY:0.72, waistY:0.80, ribY:0.91, chestY:1.02, shldY:1.10, neckY:1.145,
    hipHalf:0.115, shoulderX:0.245,
    jawY:1.175, cheekY:1.25, browY:1.325, crownY:1.415, headTopY:1.475,
  };

  /* THE SLUMP — the defining transform. Everything above the hip pivot leans FORWARD (+z) AND
     to one side (−x drift) and sinks a little (−y). Grows with height so the head lolls furthest.
     This is what makes the silhouette read as a corpse mid-shamble, not a standing man. */
  const HIPY = L.hipY;
  const slump = (p) => {
    const t = Math.max(0, p.y - HIPY);          /* height above the hip hinge */
    const t2 = t*t;                              /* mild super-linear so head leads, not folds */
    return V(p.x - t*0.11 - t2*0.05,             /* drift left, gently accelerating */
             p.y - t*0.06,                       /* slight sink (compressed spine) */
             p.z + t*0.22 + t2*0.10);            /* forward lean — a stoop, NOT a fold */
  };

  /* ===== TRUNK — a filthy tunic loft, hips→neck, run through the slump ===== */
  stack([
    {y:L.hipY,   rx:0.200, rz:0.150, hex:P.tunicDk},
    {y:L.waistY, rx:0.168, rz:0.126, hex:P.tunic},
    {y:L.ribY,   rx:0.192, rz:0.144, hex:P.tunic},
    {y:L.chestY, rx:0.210, rz:0.150, hex:P.tunic},
    {y:L.shldY,  rx:0.206, rz:0.140, hex:P.tunicDk},
    {y:L.neckY,  rx:0.078, rz:0.072, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:slump});

  /* a torn belly rip — a dark rot gash showing through the tunic front */
  {
    const g0=slump(V(0,L.ribY-0.01,0.150)), g1=slump(V(0.02,L.waistY+0.02,0.146));
    blob(g0.x,g0.y,g0.z, 0.05,0.055,0.02, P.rotDk, 6, 4);
    blob(g1.x,g1.y,g1.z, 0.035,0.04,0.018, P.rot, 6, 4);
  }

  /* ===== TORN TUNIC SKIRT — ragged UNEVEN hem: each panel a different length (strips torn off) === */
  {
    const n=8, ph=Math.PI/n;
    const top=ring(V(0,L.hipY-0.005,0), V(0,1,0), 0.205, 0.158, n, ph).map(slump);
    /* per-panel hem heights — jagged, some strips hang long, some torn short */
    const hemY=[0.50,0.40,0.34,0.46,0.52,0.38,0.30,0.44];
    const hem=[];
    for(let i=0;i<n;i++){
      const t=ph + (i/n)*Math.PI*2;
      const rx=0.235, rz=0.185;
      hem.push(slump(V(Math.cos(t)*rx, hemY[i], Math.sin(t)*rz)));
    }
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(top[i], top[i2], hem[i2], hem[i], i&1?P.tunic:P.tunicTorn, 0.06);
    }
    /* a couple of loose hanging strips below the shortest panels */
    for(const i of [2,6]){
      const t=ph + (i/n)*Math.PI*2;
      const a=slump(V(Math.cos(t)*0.22, hemY[i], Math.sin(t)*0.175));
      tube(a, a.clone().add(V(0,-0.11,0.01)), 0.028,0.015,4,P.tunicTorn,{capB:{hex:P.tunicDk}});
    }
  }

  /* ===== HEAD — LOLLED to one side (roll about z) and forward, mouth a dark slack gap ===== */
  {
    const n=8, ph=Math.PI/n;
    /* the loll: rotate head verts about a neck pivot so it tips onto the (left) shoulder */
    const pivot=slump(V(0,L.neckY,0));
    const roll = 0.40;   /* head tipped ~23° onto the shoulder (the loll) */
    const loll = (p) => { const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), roll); q.applyAxisAngle(V(1,0,0), 0.10); return q.add(pivot); };
    const xf = (p) => loll(slump(p));

    const bands=[
      {y:L.jawY,   rx:0.084, rz:0.090, hex:P.skin},
      {y:L.cheekY, rx:0.112, rz:0.108, hex:P.skin},
      {y:L.browY,  rx:0.116, rz:0.106, hex:P.skinDk},
      {y:L.crownY, rx:0.092, rz:0.084, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.012), V(0,1,0), b.rx, b.rz, n, ph).map(xf));
    for(const i of [1,2]) rings[1][i].z += 0.020;   /* slack nose ridge on the front verts */
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){
      const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
    }
    capFan(rings[3], xf(V(0, L.headTopY, 0.008)), P.skinDk);
    /* MOUTH — a dark slack gap, hung open (a recessed dark quad on the lower face) */
    const my=L.jawY+0.028, mz=0.120;
    quad(xf(V(-0.034,my+0.006,mz)), xf(V(0.030,my+0.006,mz)),
         xf(V(0.028,my-0.048,mz-0.01)), xf(V(-0.032,my-0.048,mz-0.01)), P.mouth, 0.0);
    /* a slack lower jaw drop (skin) framing the gap */
    tube(xf(V(-0.052,L.jawY-0.01,0.03)), xf(V(0.052,L.jawY-0.01,0.03)), 0.018,0.018,5,P.skinDk);

    /* rot patches — mottled dark blobs on the scalp/cheek */
    blob(...(()=>{const q=xf(V(-0.06,L.browY,0.05)); return [q.x,q.y,q.z];})(), 0.04,0.03,0.03, P.rot, 6, 4);
    blob(...(()=>{const q=xf(V(0.05,L.cheekY,0.09)); return [q.x,q.y,q.z];})(), 0.028,0.024,0.022, P.rotDk, 6, 4);
  }

  /* ===== ARMS — RIGHT reaches forward, fingers splayed; LEFT hangs dead. From the slumped shoulder. */
  {
    const Ss = (x) => slump(V(x, L.shldY-0.01, 0.015));

    /* RIGHT — thrust forward + up, splayed grasping fingers */
    const S=Ss(L.shoulderX*0.9);
    const E=slump(V(0.30,1.04,0.26));          /* elbow forward + up */
    const W=slump(V(0.27,1.02,0.58));          /* wrist out front, held HIGH (grasping) */
    tube(S,E,0.070,0.056,6,P.tunicDk);          /* upper (sleeve) */
    tube(E,W,0.052,0.044,6,P.skin);             /* bare forearm */
    blob(W.x,W.y,W.z, 0.05,0.045,0.05, P.skin, 6, 4);   /* the reaching hand palm */
    /* splayed fingers — five bone-thin stubs fanning from the palm, forward */
    const fanDirs=[V(-0.35,-0.1,1),V(-0.15,0.15,1),V(0.05,0.25,1),V(0.25,0.12,1),V(0.32,-0.2,0.9)];
    for(const d of fanDirs){
      const dn=d.clone().normalize();
      const tip=W.clone().addScaledVector(dn,0.11);
      tube(W, tip, 0.017,0.010,4,P.skin,{capB:{hex:P.nail}});   /* dark nail tip = claw read */
    }

    /* LEFT — hangs DEAD, limp, swung slightly back (no reach at all) */
    const S2=Ss(-L.shoulderX*0.9);
    const E2=slump(V(-0.27,0.86,0.02));
    const W2=slump(V(-0.245,0.62,0.04));
    tube(S2,E2,0.070,0.056,6,P.tunicDk);
    tube(E2,W2,0.052,0.044,6,P.skin);
    /* limp dangling hand — a short down-hanging nub, fingers loose */
    const HW=W2.clone().add(V(0,-0.09,0.01));
    tube(W2, HW, 0.044,0.036,6,P.skin,{capB:{hex:P.skinDk}});
    for(const dx of [-0.02,0,0.02]) tube(HW, HW.clone().add(V(dx,-0.05,0.0)), 0.013,0.008,4,P.skinDk,{capB:{hex:P.nail}});
  }

  /* ===== LEGS — one plants, the other DRAGS behind (toe trailing, knee stiff) ===== */
  {
    /* FRONT/planting leg (left) — takes the weight, slightly forward */
    const hipL=slump(V(-L.hipHalf, L.hipY-0.01, 0.01));
    const kneeL=V(-0.145,0.40,0.10), ankL=V(-0.15,0.085,0.14);
    tube(hipL,kneeL,0.084,0.060,6,P.skinDk);
    tube(kneeL,ankL,0.056,0.042,6,P.skin);
    blob(kneeL.x,kneeL.y,kneeL.z, 0.045,0.04,0.045, P.skinDk, 6, 4);
    /* bare rotting foot, planted flat + forward */
    { const toeA=V(ankL.x,0.05,ankL.z), d=V(0.05,0,1).normalize();
      stack([{y:0.012,rx:0.06,rz:0.07,cx:ankL.x,cz:ankL.z,hex:P.skinDk},{y:0.07,rx:0.052,rz:0.05,cx:ankL.x,cz:ankL.z,hex:P.skin}],6,{capTop:{hex:P.skin,lift:0.004}});
      tube(toeA, toeA.clone().addScaledVector(d,0.12), 0.05,0.038,6,P.skinDk,{capB:{hex:P.skinDk,lift:0.012},raz:0.044,rbz:0.03}); }

    /* DRAGGING leg (right) — stiff, trailing BACK, toe dragging (foot behind + turned, on its top) */
    const hipR=slump(V(L.hipHalf, L.hipY-0.01, 0.0));
    const kneeR=V(0.165,0.36,-0.12), ankR=V(0.175,0.10,-0.28);   /* knee & ankle pulled BACK (−z) */
    tube(hipR,kneeR,0.084,0.060,6,P.skinDk);
    tube(kneeR,ankR,0.056,0.040,6,P.skin);
    blob(kneeR.x,kneeR.y,kneeR.z, 0.045,0.04,0.045, P.skinDk, 6, 4);
    /* the dragging foot — trailing back, toe pointed back-down (the tell of a limp) */
    { const toeA=V(ankR.x,0.035,ankR.z), d=V(0.02,-0.15,-1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.13), 0.05,0.03,6,P.skinDk,{capA:{hex:P.skin},capB:{hex:P.rotDk,lift:0.012},raz:0.044,rbz:0.022}); }
  }

  /* base disc — shared module */
  buildBase(P);
}
