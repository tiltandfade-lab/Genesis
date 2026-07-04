/* dev/model-qa/creatures/mon-voidmonk-zerth.js — the VOID-MONK ZERTH (bespoke HUMANOID, Medium
   githzerai ascetic warrior). Whole-object grammar (CREATURE-MODELS-P2.md §1): one function, one
   merged geometry frame, no anchors, no part-object transforms — authored directly in world space
   like mon-lizard.js. The read: a LEAN robed-and-hooded ascetic, hood shadowing a gaunt ashen-grey
   face (dark socket recesses only, NO eye quads), a plain muted monastic robe cinched at the waist,
   bare forearms/hands, standing in a narrow martial ready-stance, gripping TWIN curved short-blades
   held low and reverse-angled. VS-desaturated palette — mottled ash/bone/steel, never candy.
   Medium size: base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildVoidMonkZerth(){
  /* ---------- PALETTE (VS desaturated; ashen grey-yellow skin, muted robe, dull steel) ---------- */
  const P = {
    skin:0x8c8468, skinDk:0x5f5946, skinLt:0x9c9478,      // ashen grey-yellow zerth skin
    socket:0x1c1812,                                       // dark eye-socket recess (no eye quad)
    robe:0x4a4638, robeDk:0x342f24, robeLt:0x5c5744,       // muted drab robe cloth
    hood:0x3a3628, hoodDk:0x272318,                        // deeper hood shadow tone
    sash:0x6b5a3a, sashDk:0x4a3d28,                        // dull rope-cord sash
    steel:0x8a8d8e, steelDk:0x5c5e60, steelLt:0xa6a9aa,    // twin blade steel
    grip:0x372e22, gripDk:0x241e16,                        // blade grips
    disc:0x4a4038, discTop:0x585047,
  };
  /* ---------- LANDMARKS (lean ascetic frame, ~4.6 heads, narrow ready-stance) ---------- */
  const L = {
    hipY:0.66, waistY:0.735, ribY:0.835, chestY:0.935, shldY:1.01, neckY:1.045,
    shoulderX:0.205,
    jawY:1.075, cheekY:1.135, browY:1.20, crownY:1.285, headTopY:1.335,
  };

  /* ---------- TORSO — lean robe loft, hips->neck ---------- */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.115, hex:P.robeDk},
    {y:L.waistY, rx:0.142, rz:0.108, hex:P.robe},
    {y:L.ribY,   rx:0.160, rz:0.122, hex:P.robe},
    {y:L.chestY, rx:0.172, rz:0.130, hex:P.robeLt},
    {y:L.shldY,  rx:0.176, rz:0.122, hex:P.robe},
    {y:L.neckY,  rx:0.066, rz:0.062, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* wrap-front seam (robe overlap fold) */
  {
    const zs=[[L.shldY-0.01,0.118],[L.chestY,0.128],[L.ribY,0.118],[L.waistY,0.104]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.08,y1,z1+0.006), V(0.004,y1,z1-0.004), V(0.018,y2,z2-0.004), V(-0.068,y2,z2+0.006), P.robeDk, 0.04);
    }
  }

  /* ROPE SASH — thin cinch at the waist with a short trailing tail */
  stack([
    {y:L.waistY-0.03, rx:0.150, rz:0.112, hex:P.sashDk},
    {y:L.waistY+0.01, rx:0.148, rz:0.110, hex:P.sash},
  ], 8, {capTop:{hex:P.sashDk,lift:0.004}, capBot:{hex:P.sashDk,lift:0.0}});
  tube(V(-0.10,L.waistY-0.01,0.09), V(-0.12,L.waistY-0.20,0.07), 0.016,0.008,5,P.sash,{capB:{hex:P.sashDk}});

  /* ---------- HEAD — gaunt ashen face, dark socket recesses, no eye quads ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.066, rz:0.074, hex:P.skinDk},
      {y:L.cheekY, rx:0.090, rz:0.090, hex:P.skin},
      {y:L.browY,  rx:0.094, rz:0.086, hex:P.skin},
      {y:L.crownY, rx:0.074, rz:0.066, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings.at(-1), V(0, L.headTopY-0.01, 0.004), P.skinDk);
    /* SOCKET RECESSES — small dark pits set into the brow band, shape not paint */
    for(const s of [-1,1]){
      const cb=V(s*0.036, L.browY-0.012, 0.076), ct=V(s*0.036, L.browY-0.028, 0.066);
      tube(cb, ct, 0.020, 0.014, 5, P.socket, {capB:{hex:P.socket, lift:0.004}});
    }
    /* gaunt cheek hollow lines (subtle dark strip, ascetic starved read) */
    quad(V(-0.082,L.cheekY-0.02,0.058), V(-0.05,L.cheekY-0.02,0.078), V(-0.04,L.jawY+0.01,0.07), V(-0.07,L.jawY+0.01,0.05), P.skinDk, 0.04);
    quad(V(0.082,L.cheekY-0.02,0.058), V(0.05,L.cheekY-0.02,0.078), V(0.04,L.jawY+0.01,0.07), V(0.07,L.jawY+0.01,0.05), P.skinDk, 0.04);

    /* ---------- HOOD — a loose drooping cowl overshadowing the crown+brow, shoulders-mounted ---------- */
    stack([
      {y:L.shldY-0.01, rx:0.185, rz:0.150, cz:-0.01, hex:P.hoodDk},
      {y:L.neckY+0.03, rx:0.150, rz:0.130, cz:0.0,  hex:P.hood},
      {y:L.browY+0.05, rx:0.115, rz:0.106, cz:0.01, hex:P.hood},
      {y:L.crownY+0.03,rx:0.088, rz:0.080, cz:0.01, hex:P.hoodDk},
    ], 8, {capTop:{hex:P.hoodDk, lift:0.01}});
    /* hood peak point rising just above the crown */
    tube(V(0,L.crownY+0.03,0.01), V(0,L.headTopY+0.075,-0.01), 0.03,0.006,6,P.hoodDk,{capB:{hex:P.hoodDk}});
  }

  /* ---------- TWIN CURVED SHORT-BLADES — held low, reverse-angled, one per fist ---------- */
  const bladeCurve = (hilt, tipDir, hex)=>{
    const b0 = hilt.clone();
    const b1 = hilt.clone().addScaledVector(tipDir,0.14).add(V(0,0.02,0));
    const b2 = hilt.clone().addScaledVector(tipDir,0.27).add(V(0,0.05,0));
    const tip= hilt.clone().addScaledVector(tipDir,0.37).add(V(0,0.075,0));
    tube(b0,b1,0.024,0.020,6,hex,{capA:{hex:P.steelDk}});
    tube(b1,b2,0.020,0.013,6,P.steelLt);
    tube(b2,tip,0.013,0.003,6,hex,{capB:{hex:hex,lift:0.004}});
  };
  const gripFist = (center, axis, hex)=>{
    tube(center.clone().addScaledVector(axis,-0.045), center.clone().addScaledVector(axis,0.045), 0.034,0.030,6,hex,{capA:{hex:P.gripDk},capB:{hex:hex}});
  };

  /* ---------- ARMS — bare forearms, fists gripping the blade hilts, narrow ready-stance ---------- */
  {
    /* right arm — blade angled forward-down-right, reverse grip */
    const SR=V(L.shoulderX, L.shldY-0.01, 0.01);
    const ER=V(0.275,0.80,0.075);
    const HR=V(0.235,0.60,0.135); // hilt/fist position
    tube(SR,ER,0.062,0.050,6,P.skin);
    tube(ER,HR,0.048,0.040,6,P.skin,{capB:{hex:P.skin}});
    gripFist(HR, new THREE.Vector3().subVectors(HR,ER).normalize(), P.grip);
    bladeCurve(HR, V(0.55,-0.55,0.62), P.steel);

    /* left arm — blade mirrored, angled forward-down-left */
    const SL=V(-L.shoulderX, L.shldY-0.01, 0.01);
    const EL=V(-0.265,0.775,0.09);
    const HL=V(-0.22,0.575,0.15);
    tube(SL,EL,0.062,0.050,6,P.skin);
    tube(EL,HL,0.048,0.040,6,P.skin,{capB:{hex:P.skin}});
    gripFist(HL, new THREE.Vector3().subVectors(HL,EL).normalize(), P.grip);
    bladeCurve(HL, V(-0.5,-0.5,0.68), P.steel);
  }

  /* ---------- LEGS — narrow martial ready-stance, robe hem mid-shin, bare feet ---------- */
  {
    const hipL=V(-0.10, L.hipY-0.01, 0.03), kneeL=V(-0.135,0.36,0.13), ankL=V(-0.12,0.075,0.10);
    const hipR=V( 0.10, L.hipY-0.01,-0.03), kneeR=V( 0.145,0.34,-0.14), ankR=V( 0.13,0.075,-0.11);
    /* robe hem cone from hips down to mid-shin */
    stack([
      {y:L.hipY-0.02, rx:0.150, rz:0.115, hex:P.robeDk},
      {y:0.44,        rx:0.185, rz:0.150, hex:P.robe},
      {y:0.28,        rx:0.205, rz:0.170, hex:P.robeDk},
    ], 8, {capBot:{hex:P.robeDk, lift:0.0}});
    /* bare shins + feet emerging below the hem */
    for(const [knee,ank] of [[kneeL,ankL],[kneeR,ankR]]){
      tube(V(knee.x,0.30,knee.z), ank, 0.040,0.034,6,P.skin);
      stack([
        {y:0.010, rx:0.050, rz:0.062, cx:ank.x, cz:ank.z, hex:P.skinDk},
        {y:0.050, rx:0.046, rz:0.052, cx:ank.x, cz:ank.z, hex:P.skin},
      ], 6, {capTop:{hex:P.skin, lift:0.004}, capBot:{hex:P.skinDk, lift:0.0}});
      const toeA=V(ank.x,0.04,ank.z+0.05);
      tube(toeA, toeA.clone().addScaledVector(V(0,0,1),0.08), 0.040,0.024,6,P.skin,{capB:{hex:P.skinDk, lift:0.01}});
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
