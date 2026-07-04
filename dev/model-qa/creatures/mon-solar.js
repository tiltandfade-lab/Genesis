/* dev/model-qa/creatures/mon-solar.js — the SOLAR (bespoke WINGED HUMANOID, Celestial — the greatest
   angel). docs/CREATURE-MODELS-P2.md Wave 5: a regal humanoid figure, tall and broad, gripping a
   massive GREATSWORD planted point-down at rest, with HUGE feathered wings rising off the shoulders
   and a bright HALO ring floating above the head. Brilliant gold skin (VS-desaturated but strongly
   luminous against the mottled register), white-gold feathered wings, a glowing halo channel.
   NO eye quads (house ruling). Whole-object grammar: one function, one merged geometry frame, no
   anchors, no part-object transforms — every part authored directly in world space via probe-lib
   primitives, following the paladin.js humanoid spine + the manticore.js wing grammar. Large size,
   base disc r=0.55. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildSolar(){
  /* ---------- PALETTE (VS-desaturated; brilliant dull gold skin, white-gold plumage, glow halo) ---------- */
  const P = {
    gold:0xcf9f4e, goldDk:0x9c7636, goldLt:0xe0b868,           // brilliant (but dulled) gold skin
    robe:0xcac2a8, robeDk:0x9a927a, robeLt:0xdcd4ba,           // pale ivory-gold robe/kilt
    plume:0xd8d0b8, plumeDk:0xa89f84, plumeLt:0xefe8d0,        // white-gold feathered wings
    metal:0xb9a866, metalDk:0x8a7a44,                          // gold trim/vambraces
    blade:0xaeb2ac, bladeDk:0x767a72,                          // pale steel greatsword
    hilt:0x6a5230, halo:0xf6e6a0, haloDk:0xc9ac5e,             // hilt wood-gold; halo glow
    hair:0x8a7a52,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.gold]:'skin', [P.goldDk]:'skin', [P.goldLt]:'skin',
    [P.robe]:'cloth', [P.robeDk]:'cloth', [P.robeLt]:'cloth',
    [P.plume]:'fur', [P.plumeDk]:'fur', [P.plumeLt]:'fur',
    [P.metal]:'metal', [P.metalDk]:'metal',
    [P.blade]:'metal', [P.bladeDk]:'metal',
    [P.halo]:'glow', [P.haloDk]:'glow',
  });

  /* ---------- LANDMARKS — upright regal stance, broader/taller than a mortal paladin. ---------- */
  const L = {
    hipY:0.74, waistY:0.84, ribY:0.98, chestY:1.10, shldY:1.235, neckY:1.275,
    hipHalf:0.115, shoulderX:0.245,
    jawY:1.315, cheekY:1.385, browY:1.445, crownY:1.520, headTopY:1.560,
  };

  /* trunk — tall regal torso, robed, broad chest */
  stack([
    {y:L.hipY,   rx:0.185, rz:0.140, hex:P.robe},
    {y:L.waistY, rx:0.165, rz:0.128, hex:P.robeDk},
    {y:L.ribY,   rx:0.195, rz:0.145, hex:P.gold},
    {y:L.chestY, rx:0.225, rz:0.158, hex:P.goldLt},
    {y:L.shldY,  rx:0.235, rz:0.150, hex:P.gold},
    {y:L.neckY,  rx:0.082, rz:0.076, hex:P.goldDk},
  ], 9, {capTop:{hex:P.goldDk, lift:0.005}});

  /* KILT/ROBE — draped panels over the hips, pale ivory-gold */
  {
    const fp=[[L.hipY,0.150],[0.56,0.165],[0.36,0.178],[0.18,0.185]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.155,y2,z2), V(0.155,y2,z2), V(0.155,y1,z1), V(-0.155,y1,z1), i%2?P.robe:P.robeDk, 0.04);
    }
    const [hy,hz]=fp.at(-1);
    quad(V(-0.155,hy-0.015,hz-0.004), V(0.155,hy-0.015,hz-0.004), V(0.155,hy+0.006,hz+0.002), V(-0.155,hy+0.006,hz+0.002), P.halo, 0.02);
  }
  /* gold belt/sash */
  stack([{y:0.795, rx:0.190, rz:0.144, hex:P.metalDk},{y:0.835, rx:0.186, rz:0.140, hex:P.metal}], 8, {});

  /* SHOULDER GUARDS — modest gold pauldrons (the wings carry the real silhouette, not armor mass) */
  for(const s of [-1,1]){
    const px=s*L.shoulderX;
    stack([
      {y:L.shldY-0.03, rx:0.098, rz:0.100, cx:px, cz:0.01, hex:P.metalDk},
      {y:L.shldY+0.045,rx:0.078, rz:0.082, cx:px, cz:0.01, hex:P.metal},
    ], 7, {capTop:{hex:P.metal, lift:0.02}});
  }

  /* head — gold-skinned, regal, calm brow. FRONT verts at ring index 1&2. NO eye quads. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.088, rz:0.092, hex:P.gold},
      {y:L.cheekY, rx:0.112, rz:0.108, hex:P.goldLt},
      {y:L.browY,  rx:0.116, rz:0.104, hex:P.gold},
      {y:L.crownY, rx:0.088, rz:0.080, hex:P.goldDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.016;
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY-0.02, 0.006), P.goldDk);
    /* simple swept-back hair mass, no face detail beyond brow shadow */
    quad(V(-0.07,L.crownY,-0.05), V(0.07,L.crownY,-0.05), V(0.05,L.headTopY+0.05,-0.10), V(-0.05,L.headTopY+0.05,-0.10), P.hair, 0.04);
  }

  /* HALO — a bright glowing ring floating above the head, the celestial's signature. */
  {
    const cy = L.headTopY + 0.22;
    const r1=ring(V(0,cy,0), V(0,1,0), 0.135, 0.032, 14);
    const r2=ring(V(0,cy,0), V(0,1,0), 0.100, 0.024, 14);
    stitch([r1,r2], ()=>P.halo);
    // thin bright inner rim so the glow channel reads strongly at grazing angles
    const r3=ring(V(0,cy,0), V(0,1,0), 0.118, 0.028, 14);
    stitch([r1,r3], ()=>P.haloDk, null);
  }

  /* GREATSWORD — planted point-down, gripped two-handed in front, a tall pale blade + cross-guard. */
  const G_TIP = V(0.02, 0.05, 0.40), G_HILT = V(0.03, 1.02, 0.34);
  const GAXIS = new THREE.Vector3().subVectors(G_HILT, G_TIP).normalize();
  const GRIP  = G_HILT.clone().addScaledVector(GAXIS, -0.12);
  {
    tube(G_TIP, G_TIP.clone().addScaledVector(GAXIS,0.10), 0.006,0.048,6,P.blade,{capA:{hex:P.blade}});
    tube(G_TIP.clone().addScaledVector(GAXIS,0.10), GRIP.clone().addScaledVector(GAXIS,0.05), 0.048,0.058,6,P.bladeDk);
    // cross-guard
    quad(GRIP.clone().add(V(-0.16,0.01,0)), GRIP.clone().add(V(0.16,0.01,0)),
         GRIP.clone().add(V(0.16,-0.03,0)), GRIP.clone().add(V(-0.16,-0.03,0)), P.metal, 0.03);
    tube(GRIP, GRIP.clone().addScaledVector(GAXIS,0.16), 0.032,0.028,6,P.hilt);
    tube(GRIP.clone().addScaledVector(GAXIS,0.16), GRIP.clone().addScaledVector(GAXIS,0.20), 0.034,0.044,6,P.metalDk,{capB:{hex:P.metalDk, lift:0.01}});
  }

  /* ARMS — both hands meet the grip, two-handed on the planted greatsword. */
  {
    const fistNear = GRIP.clone().addScaledVector(GAXIS, 0.05);
    const fistFar  = GRIP.clone().addScaledVector(GAXIS, 0.145);
    const SL=V(-L.shoulderX, L.shldY-0.02, 0.02), SR=V(L.shoulderX, L.shldY-0.02, 0.02);
    const EL=SL.clone().lerp(fistNear, 0.5).add(V(0.02,-0.02,0.08));
    const ER=SR.clone().lerp(fistFar, 0.5).add(V(-0.02,-0.02,0.08));
    tube(SL,EL,0.072,0.058,6,P.gold); tube(EL,fistNear,0.052,0.046,6,P.gold,{capB:{hex:P.gold}});
    tube(SR,ER,0.072,0.058,6,P.gold); tube(ER,fistFar, 0.052,0.046,6,P.gold,{capB:{hex:P.gold}});
  }

  /* LEGS — planted, upright stance, sandaled feet, gold-skinned shins under the robe hem. */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.0), kneeL=V(-0.135,0.42,0.03), ankL=V(-0.145,0.075,0.04);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.0), kneeR=V( 0.135,0.42,0.03), ankR=V( 0.145,0.075,0.04);
    tube(hipL,kneeL,0.088,0.062,6,P.robeDk); tube(kneeL,ankL,0.058,0.044,6,P.gold);
    tube(hipR,kneeR,0.088,0.062,6,P.robeDk); tube(kneeR,ankR,0.058,0.044,6,P.gold);
    for(const ank of [ankL,ankR]){
      const toeA=V(ank.x,0.045,ank.z);
      tube(toeA, toeA.clone().add(V(0,0,0.135)), 0.050,0.036,6,P.goldDk,{capB:{hex:P.goldDk, lift:0.012}});
    }
  }

  /* ---------- WINGS — the solar's SIGNATURE feature: HUGE feathered wings rising off the shoulders,
     half-spread, arcing well above the head/halo. Bone-strut spars fanning from a shoulder root, big
     feathered membrane panels between, plus overlapping feather-tip quads along the trailing edge so
     the silhouette reads as plumage, not a bat sail (per the manticore wing base, feather-dressed). */
  {
    const wing=(side)=>{
      const root = V(side*0.14, L.shldY+0.02, -0.03);
      const shoulder = V(side*0.26, L.shldY+0.20, -0.10);
      const f1 = V(side*0.50, L.headTopY+0.60, -0.30);   // top spar — arcs above the halo
      const f2 = V(side*0.74, L.headTopY+0.34, -0.52);
      const f3 = V(side*0.86, L.shldY+0.02,    -0.70);
      const f4 = V(side*0.70, L.hipY-0.10,     -0.66);

      tube(root, shoulder, 0.050, 0.038, 5, P.metalDk);
      tube(shoulder, f1, 0.038, 0.012, 5, P.plumeDk, {capB:{hex:P.plumeLt, lift:0.005}});
      tube(shoulder, f2, 0.034, 0.011, 5, P.plumeDk, {capB:{hex:P.plumeLt, lift:0.005}});
      tube(shoulder, f3, 0.030, 0.010, 5, P.plumeDk, {capB:{hex:P.plumeLt, lift:0.004}});
      tube(shoulder, f4, 0.026, 0.009, 4, P.plumeDk, {capB:{hex:P.plumeLt, lift:0.004}});

      // broad feathered membrane sail, panel by panel
      quad(shoulder, f1, f2, shoulder, P.plume, 0.08);
      quad(shoulder, f2, f3, shoulder, P.plumeLt, 0.08);
      quad(shoulder, f3, f4, shoulder, P.plume, 0.08);
      const trail = V(side*0.38, L.hipY+0.10, -0.42);
      quad(shoulder, f4, trail, root, P.plumeLt, 0.08);

      // overlapping feather-tip quads along the outer rim (f1->f2->f3->f4) for a plumage read
      const rim=[f1,f2,f3,f4];
      for(let i=0;i<rim.length-1;i++){
        const a=rim[i], b=rim[i+1];
        const mid=V((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);
        const tip=mid.clone().add(V(side*0.05,-0.02,-0.10));
        quad(a, b, tip, tip, P.plumeLt, 0.06);
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
