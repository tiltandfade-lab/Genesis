/* dev/model-qa/creatures/race-gnome.js — RIG-VARIANT race: same whole-object grammar as
   humanoid.js, different PROPORTIONS. ~0.95u head-top, ~3 heads tall: the head is proportionally
   HUGE on a tiny frame, stubby limbs, a pot-belly torso, big wedge ears, a pushed nose, and a
   small flat cap (NOT pointed — the wizard owns cones). Dressed as a plain adventurer: simple
   vest + trousers, earth tones, a small belt knife (no class read). Cheerful, feet-apart stance.
   Walking stick authored first so the off-hand grip is fitted to it (grip true by construction). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnome(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    vest:0x5f6b46, vestDk:0x4a5438, linen:0xc9bd9c, linenDk:0x8d846c,
    skin:0xcf9f78, skinDk:0x93714f, trouser:0x7a6a4a, trouserDk:0x5c4f38,
    boot:0x3c3226, leather:0x4e3d2a, leatherDk:0x3a2d1f,
    steel:0x9aa1a6, brass:0xb08d46, cap:0x6b5a42, capDk:0x4f4230,
    eye:0x1a1512, ear:0xc08a5e, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — tiny frame, huge head (~3 heads tall, headTopY ~0.95) ---------- */
  const L = {
    hipY:0.335, waistY:0.375, chestY:0.435, shldY:0.485, neckY:0.515,
    hipHalf:0.095, shoulderX:0.145,
    jawY:0.545, cheekY:0.635, browY:0.735, crownY:0.86, headTopY:0.945,
  };

  /* WALKING STICK FIRST — the off-hand grip is ground truth */
  const STICK_B = V(-0.235, 0.02, 0.13), STICK_T = V(-0.205, 0.62, 0.10);
  const SDIR = new THREE.Vector3().subVectors(STICK_T, STICK_B).normalize();
  const GRIP = V(-0.22, 0.40, 0.115);
  {
    tube(STICK_B, STICK_T, 0.020, 0.016, 6, P.leather, {capA:{hex:P.leatherDk}, capB:{hex:P.leatherDk, lift:0.01}});
  }

  /* pot-belly torso (one loft, hips -> neck; belly bulges wide at waist, wider than chest) */
  stack([
    {y:L.hipY,   rx:0.155, rz:0.130, hex:P.trouserDk},
    {y:L.waistY, rx:0.205, rz:0.185, hex:P.vest},
    {y:L.chestY, rx:0.185, rz:0.160, hex:P.vest},
    {y:L.shldY,  rx:0.170, rz:0.140, hex:P.vest},
    {y:L.neckY,  rx:0.075, rz:0.070, hex:P.linenDk},
  ], 8, {capTop:{hex:P.linenDk, lift:0.004}});

  /* vest front placket (small vertical band) */
  quad(V(-0.02,L.waistY,0.183), V(0.02,L.waistY,0.183), V(0.02,L.shldY,0.145), V(-0.02,L.shldY,0.145), P.vestDk, 0.04);

  /* belt (sits low under the belly) */
  stack([
    {y:L.waistY-0.03, rx:0.208, rz:0.188, hex:P.leather},
    {y:L.waistY+0.01, rx:0.206, rz:0.186, hex:P.leather},
  ], 8, {});
  quad(V(-0.016,L.waistY-0.028,0.190), V(0.016,L.waistY-0.028,0.190), V(0.016,L.waistY+0.012,0.187), V(-0.016,L.waistY+0.012,0.187), P.brass, 0.02);

  /* belt knife — a short sheath hung ON the hip belt (not a bare peg at the groin).
     Sheath top overlaps the belt band so it reads attached; a stub hilt sits proud above the
     belt; the whole thing rides the right hip (pushed to +x, pulled back off the front). */
  {
    /* sheath: from just below the belt down along the hip, top buried in the belt band */
    const kb=V(0.175,L.waistY-0.075,0.075), kt=V(0.185,L.waistY+0.015,0.085);
    tube(kb, kt, 0.017,0.013,5,P.leatherDk,{capB:{hex:P.leatherDk,lift:0.004}});
    /* belt-loop: a short strap wrapping the sheath over the belt band (anchors it visually) */
    const lb=V(0.185,L.waistY-0.03,0.088), lt=V(0.185,L.waistY+0.02,0.088);
    tube(lb, lt, 0.020,0.019,5,P.leather,{});
    /* hilt: a small nub proud above the belt */
    const hb=V(0.185,L.waistY+0.015,0.085), ht=V(0.188,L.waistY+0.055,0.088);
    tube(hb, ht, 0.011,0.009,5,P.brass,{capB:{hex:P.brass,lift:0.004}});
  }

  /* HEAD — proportionally HUGE (~1.7x the human head radii scaled to this frame). Nose pushed hard,
     ears are the wedge-tube icon. FRONT (+z) verts of this ring are 1 & 2 per the ring() convention. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.135, rz:0.145, hex:P.skin},
      {y:L.cheekY, rx:0.185, rz:0.178, hex:P.skin},
      {y:L.browY,  rx:0.192, rz:0.175, hex:P.skin},
      {y:L.crownY, rx:0.148, rz:0.135, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.018), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.052;             /* big nose push */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.013), P.skinDk);
    /* eyes — two SMALL intentional quads flanking the nose ridge, proud of the bulged face plane
       (house standard: never shaded ring columns). Scaled up slightly with the giant head. */
    for(const s of [-1,1]){
      const ex=s*0.088, ey=(L.cheekY+L.browY)/2-0.006, ez=0.205;
      quad(V(ex-0.020,ey-0.015,ez), V(ex+0.020,ey-0.015,ez),
           V(ex+0.020,ey+0.017,ez-0.009), V(ex-0.020,ey+0.017,ez-0.009), P.eye, 0.0);
    }
    /* oversized ears — two small wedge tubes flaring out from the cheek band */
    for(const s of [-1,1]){
      const eb=V(s*0.180, L.cheekY+0.01, 0.02);
      const et=eb.clone().add(V(s*0.095, 0.038, -0.01));
      tube(eb, et, 0.028, 0.010, 5, P.ear, {capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.004}});
    }
  }

  /* small flat cap (NOT pointed) — a low disc-brim sitting right on the crown, minimal rise */
  {
    const n=8, ph=Math.PI/n;
    const brimLo=ring(V(0,L.browY+0.045,0.0), V(0,1,0), 0.156, 0.144, n, ph);
    const crownLo=ring(V(0,L.browY+0.065,0.0), V(0,1,0), 0.152, 0.140, n, ph);
    const crownHi=ring(V(0,L.headTopY+0.012,0.0), V(0,1,0), 0.152, 0.140, n, ph);
    stitch([brimLo,crownLo], ()=>P.capDk);
    stitch([crownLo,crownHi], ()=>P.cap);
    capFan(crownHi, V(0, L.headTopY+0.02, 0.0), P.capDk);   /* flat top, close to the crown */
  }

  /* ARMS — stubby, short reach. Right hangs clear of the belly at the side; left derives to the stick grip. */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=V(0.205, 0.345, 0.045);
    const W=V(0.20, 0.20, 0.055);
    tube(S,E,0.052,0.042,6,P.vest);
    tube(E,W,0.040,0.034,6,P.skin,{capB:{hex:P.skinDk}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.20, 0.485, 0.09);
    tube(S2,E2,0.052,0.042,6,P.vest);
    tube(E2, GRIP.clone().addScaledVector(SDIR,0.03), 0.040,0.034,6,P.skin, {capB:{hex:P.skin}});
    tube(GRIP.clone().addScaledVector(SDIR,-0.03), GRIP.clone().addScaledVector(SDIR,0.05), 0.036,0.032,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — very short and stubby, feet-apart cheerful stance */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), ankL=V(-0.115,0.075,0.03);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), ankR=V( 0.12,0.075,-0.03);
    tube(hipL,ankL,0.070,0.050,6,P.trouser);
    tube(hipR,ankR,0.070,0.050,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(-0.10,0,1)], [ankR,V(0.20,0,1).normalize()]]){
      stack([
        {y:0.010, rx:0.062, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.075, rx:0.056, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.004}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.105), 0.052,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.044, rbz:0.030});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
