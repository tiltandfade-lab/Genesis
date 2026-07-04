/* dev/model-qa/creatures/npc-guard.js — the town-watch guard (whole-object NPC).
   Same whole-object grammar: one function, one geometry frame, no anchors. SPEAR authored first
   (vertical, butt-on-ground) so the resting fist derives from the shaft. Kettle-brim helm (a wide
   flat brim, distinct from the fighter's dome/paladin's closed helm), a quilted gambeson torso
   (stripe bands), and a small round buckler on the off arm. At-rest sentry stance — humbler than
   the 12 class figures: no drawn blade, no aggressive pose, plain gear. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildHead, buildBase } from '../parts.js';

export function buildGuard(){
  /* ---------- PALETTE (drab municipal — undyed gambeson, worn steel, no house colors) ---------- */
  const P = Object.assign({}, BASE_P, {
    gambeson:0x8a7a54, gambesonDk:0x6b5d3f, stripe:0x796a49,
    leather:0x4e3d2a, leatherDk:0x3a2d1f,
    steel:0x8f959a, steelDk:0x656b70, wood:0x5a4326, woodDk:0x3f2f1a,
    trouser:0x5b5244, boot:0x3c3226,
  });

  /* ---------- RIG — same landmarks as humanoid.js (upright sentry, no stoop) ---------- */
  const L = humanoidRig();

  /* SPEAR FIRST — vertical shaft, butt on the ground, held at rest beside the right foot.
     The shaft is the ground truth; the resting fist derives from a grip point partway up. */
  const BUTT=V(0.335,0.0,0.185), TIP=V(0.300,1.92,0.165);
  const SDIR=new THREE.Vector3().subVectors(TIP,BUTT).normalize();
  const GRIP=BUTT.clone().addScaledVector(SDIR, 0.78);      // resting grip, roughly shoulder-drop height
  {
    tube(BUTT, TIP.clone().addScaledVector(SDIR,-0.16), 0.024,0.020,6,P.wood,{capA:{hex:P.woodDk}});
    /* leaf spearhead: socket + tapering blade to a point */
    const up=V(0,0,1), su=new THREE.Vector3().crossVectors(up,SDIR).normalize(), sv=new THREE.Vector3().crossVectors(SDIR,su).normalize();
    const base=TIP.clone().addScaledVector(SDIR,-0.16);
    const bl=(t,w,th)=>{ const c=base.clone().addScaledVector(SDIR,t);
      return [c.clone().addScaledVector(su,w), c.clone().addScaledVector(sv,th), c.clone().addScaledVector(su,-w), c.clone().addScaledVector(sv,-th)]; };
    const s0=bl(0.0,0.026,0.020), s1=bl(0.05,0.040,0.022), s2=bl(0.14,0.022,0.012), s3=bl(0.20,0.008,0.006);
    stitch([s0,s1,s2,s3], (b)=> b<2?P.steelDk:P.steel);
    capFan(s3, base.clone().addScaledVector(SDIR,0.24), P.steel);
    /* socket collar where head meets shaft */
    tube(base.clone().addScaledVector(SDIR,-0.02), base, 0.026,0.024,6,P.steelDk);
  }

  /* torso — quilted gambeson loft with horizontal quilt-stripe bands (padded, not plate) */
  stack([
    {y:L.hipY,   rx:0.205, rz:0.155, hex:P.gambesonDk},
    {y:L.waistY, rx:0.178, rz:0.132, hex:P.gambeson},
    {y:0.855,    rx:0.198, rz:0.148, hex:P.stripe},
    {y:L.ribY,   rx:0.208, rz:0.155, hex:P.gambeson},
    {y:0.965,    rx:0.222, rz:0.162, hex:P.stripe},
    {y:L.chestY, rx:0.232, rz:0.168, hex:P.gambeson},
    {y:1.055,    rx:0.236, rz:0.158, hex:P.stripe},
    {y:L.shldY,  rx:0.236, rz:0.155, hex:P.gambeson},
    {y:L.neckY,  rx:0.085, rz:0.080, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* skirt of the gambeson (short, quilted, plain hem — no tunic ornament) */
  stack([
    {y:0.50, rx:0.230, rz:0.180, hex:P.gambesonDk},
    {y:0.62, rx:0.215, rz:0.165, hex:P.stripe},
    {y:L.hipY-0.01, rx:0.195, rz:0.148, hex:P.gambeson},
  ], 8, {});

  /* wide leather belt with a plain iron buckle */
  stack([
    {y:0.775, rx:0.188, rz:0.148, hex:P.leather},
    {y:0.835, rx:0.185, rz:0.145, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.030,0.782,0.152), V(0.030,0.782,0.152), V(0.030,0.828,0.148), V(-0.030,0.828,0.148), P.steelDk, 0.02);

  /* head — shared module */
  buildHead(L, P);

  /* KETTLE-BRIM HELM — a wide flat brim ringing the whole head at brow height + a low dome crown.
     Distinct silhouette from the fighter's rounded dome and the paladin's closed visor helm. */
  {
    const n=10, ph=Math.PI/n;
    /* the flat brim: two coplanar rings (wide outer, narrower inner) stitched top+underside */
    const brimOuter=ring(V(0,L.browY+0.02,0), V(0,1,0), 0.205, 0.195, n, ph);
    const brimInner=ring(V(0,L.browY+0.02,0), V(0,1,0), 0.118, 0.112, n, ph);
    stitch([brimInner,brimOuter], ()=>P.steel);             // topside
    stitch([brimOuter,brimInner], ()=>P.steelDk);           // underside (reversed winding via swapped order is fine for flat shading read)
    /* low dome crown sitting on top of the brim, down to a skirt that meets the brow */
    const domeBands=[
      {y:L.browY+0.015, rx:0.116, rz:0.110, hex:P.steelDk},
      {y:L.browY+0.06,  rx:0.122, rz:0.116, hex:P.steel},
      {y:L.crownY+0.03, rx:0.104, rz:0.096, hex:P.steel},
      {y:L.headTopY+0.02, rx:0.052, rz:0.048, hex:P.steelDk},
    ];
    const domeRings=domeBands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(domeRings, b=>domeBands[b].hex);
    capFan(domeRings.at(-1), V(0, L.headTopY+0.06, 0), P.steelDk);
  }

  /* BUCKLER — small round shield strapped to the LEFT (off) forearm, boss at center */
  const BUCKLER_C = V(-0.30, 0.72, 0.145);
  {
    const n=10;
    const rim   = ring(BUCKLER_C.clone().add(V(0,0,-0.015)), V(0,0,1), 0.118, 0.118, n, 0);
    const face  = ring(BUCKLER_C, V(0,0,1), 0.122, 0.122, n, 0);
    const skirt = ring(BUCKLER_C.clone().add(V(0,0,0.012)), V(0,0,1), 0.068, 0.068, n, 0);   // taper step
    const bossRing = ring(BUCKLER_C.clone().add(V(0,0,0.02)), V(0,0,1), 0.036, 0.036, n, 0);
    stitch([rim,face], ()=>P.wood);                                   // dished wood/leather face rim
    stitch([face, skirt, bossRing], ()=>P.leatherDk);                 // riveted leather face -> boss skirt (tapered)
    capFan(bossRing, BUCKLER_C.clone().add(V(0,0,0.05)), P.steel);     // central steel boss
  }

  /* arms — right hand rests on the spear grip (derived); left forearm carries the buckler */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015), E=V(0.30,0.885,0.12);
    tube(S,E,0.076,0.060,6,P.gambeson);
    tube(E,GRIP,0.056,0.046,6,P.leather,{capB:{hex:P.skin}});
    tube(GRIP.clone().add(V(-0.045,0.05,-0.02)), GRIP.clone().add(V(0.045,-0.05,0.02)), 0.048,0.044,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015), E2=V(-0.315,0.87,0.05);
    tube(S2,E2,0.076,0.060,6,P.gambeson);
    tube(E2,BUCKLER_C.clone().add(V(0.02,0.03,-0.06)),0.056,0.046,6,P.leather,{capB:{hex:P.skin}});
  }

  /* legs — plain trouser + simple boots, at-rest stance (feet apart, weight even) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.15,0.40,0.03), ankL=V(-0.15,0.085,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.155,0.40,0.00), ankR=V( 0.155,0.085,-0.01);
    tube(hipL,kneeL,0.086,0.060,6,P.trouser);
    tube(kneeL,ankL,0.056,0.040,6,P.trouser);
    tube(hipR,kneeR,0.086,0.060,6,P.trouser);
    tube(kneeR,ankR,0.056,0.040,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(-0.05,0,1)]]){
      stack([
        {y:0.012, rx:0.066, rz:0.073, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.11,  rx:0.058, rz:0.060, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.064, rz:0.064, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.13), 0.053,0.040,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.046, rbz:0.032});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
