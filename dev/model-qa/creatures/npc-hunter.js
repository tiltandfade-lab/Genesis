/* dev/model-qa/creatures/npc-hunter.js — the hunter / trapper (whole-object NPC).
   npc-role rows 11-13 (Hunter or Trapper, 3/100) — "reads absence as much as presence." THE
   distinctness check: the hunter reads FIELD-OUTDOORS, not town. A fur-collared shoulder mantle,
   a broad-brimmed felt hat, a SHORT BOW slung and held loose in one hand with a quiver on the back
   (bow authored FIRST — the huntsman tell), a coiled SNARE/rope at the belt, soft laced boots, and
   a low wary tracking lean. Where the bandit crouches to menace, the hunter leans to READ ground.
   Earthy greens/browns + fur. Shared rig/base from parts.js. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildHunter(){
  /* ---------- PALETTE (field greens + leather + fur — outdoors, not urban) ---------- */
  const P = Object.assign({}, BASE_P, {
    coat:0x53603f, coatDk:0x3a4530, coatLt:0x64714c,        // mossy green field coat
    leather:0x5a4128, leatherDk:0x3d2c18, leatherLt:0x6e5232,
    fur:0x7a6a52, furDk:0x574a38, furLt:0x8f7d62,
    skin:0xbb9064, skinDk:0x835f3e,
    bow:0x6a4f30, bowDk:0x442f18, string:0xcabf9e,
    rope:0x9a8a62, ropeDk:0x6b5e3e,
    boot:0x47341f, bootDk:0x2f2213, hat:0x504632, hatDk:0x352d1e,
  });

  /* ---------- RIG — lean, athletic; a low forward TRACKING lean (reading the ground) ---------- */
  const L = humanoidRig({
    hipY:0.71, waistY:0.79, ribY:0.895, chestY:0.995, shldY:1.075, neckY:1.115,
    shoulderX:0.248,
    jawY:1.145, cheekY:1.22, browY:1.295, crownY:1.385, headTopY:1.445,
  });

  /* a mild forward tracking lean (fwd = +z), gentler than the beggar's collapse */
  const HIP_PIVOT_Y = L.hipY;
  const lean = (p) => { const t = Math.max(0, p.y - HIP_PIVOT_Y); return V(p.x, p.y - t*0.03, p.z + t*0.18); };

  /* ================= THE SHORT BOW — authored FIRST, held loose in the LEFT hand, canted, unstrung-
     ready at the side. A smooth C-arc riser + a straight string chord (a strung shortbow). The
     gripping hand derives to the bow's mid-grip. ================================================= */
  const BOW_GRIP = lean(V(-0.30, 0.78, 0.14));
  {
    /* bow arc in the vertical plane, bending toward +z (the belly faces forward), 4-seg C-curve */
    const gx=BOW_GRIP.x, gz=BOW_GRIP.z;
    const pts=[ V(gx-0.02,BOW_GRIP.y-0.42,gz-0.02), V(gx-0.005,BOW_GRIP.y-0.20,gz+0.05),
                V(gx,BOW_GRIP.y,gz+0.075), V(gx-0.005,BOW_GRIP.y+0.20,gz+0.05),
                V(gx-0.02,BOW_GRIP.y+0.42,gz-0.02) ];
    for(let i=0;i<pts.length-1;i++) tube(pts[i], pts[i+1], 0.016,0.016, 5, i===2||i===1?P.bow:P.bowDk, {capA:{hex:P.bowDk}});
    /* the string: a straight chord from top nock to bottom nock (behind the belly) */
    tube(pts[0], pts[4], 0.005,0.005, 4, P.string);
  }

  /* torso — a fitted field coat, layered leather over green wool */
  stack([
    {y:L.hipY,   rx:0.190, rz:0.145, hex:P.coatDk},
    {y:L.waistY, rx:0.168, rz:0.128, hex:P.coat},
    {y:L.ribY,   rx:0.188, rz:0.140, hex:P.coat},
    {y:L.chestY, rx:0.206, rz:0.152, hex:P.coatLt},
    {y:L.shldY,  rx:0.210, rz:0.148, hex:P.coat},
    {y:L.neckY,  rx:0.084, rz:0.078, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}, xform:lean});

  /* a FUR SHOULDER MANTLE — a thick furry collar/cape over both shoulders (the outdoorsman tell) */
  {
    const bands=[
      {y:L.shldY-0.03, rx:0.215, rz:0.160, hex:P.furDk},
      {y:L.shldY+0.05, rx:0.230, rz:0.172, hex:P.fur},
      {y:L.neckY+0.01, rx:0.150, rz:0.120, hex:P.furLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, 9, Math.PI/9).map(lean));
    stitch(rings, b=>bands[b].hex);
    /* a few jutting fur tufts round the collar edge (ragged fur read) */
    for(let k=0;k<9;k+=2){ const a=k/9*Math.PI*2;
      const base=lean(V(Math.cos(a)*0.215, L.shldY+0.03, Math.sin(a)*0.160));
      quad(base, base.clone().add(V(0,0.04,0)), base.clone().add(V(Math.cos(a)*0.03,0.06,Math.sin(a)*0.03)), base.clone().add(V(Math.cos(a)*0.02,0.02,Math.sin(a)*0.02)), P.furLt, 0.08); }
  }

  /* short coat skirt to mid-thigh (split for movement) */
  stack([
    {y:0.48, rx:0.205, rz:0.160, hex:P.coatDk},
    {y:0.60, rx:0.190, rz:0.148, hex:P.coat},
    {y:L.hipY-0.01, rx:0.176, rz:0.135, hex:P.coat},
  ], 8, {});

  /* a wide leather belt + a coiled SNARE/rope hanging at the right hip (trapper's kit) */
  { const b1=ring(V(0,0.755,0), V(0,1,0), 0.174,0.132, 8, Math.PI/8);
    const b2=ring(V(0,0.79,0), V(0,1,0), 0.171,0.129, 8, Math.PI/8);
    stitch([b1,b2], ()=>P.leatherDk);
    /* the coil: a small torus-ish stack of rope loops at the hip */
    const cc=V(0.16,0.68,0.13);
    for(const dy of [0,0.028,0.056]){
      const r1=ring(V(cc.x,cc.y+dy,cc.z), V(0.3,0,1), 0.055,0.055, 8, 0);
      const r2=ring(V(cc.x,cc.y+dy,cc.z), V(0.3,0,1), 0.045,0.045, 8, 0);
      stitch([r2,r1], ()=>dy===0.028?P.ropeDk:P.rope); }
  }

  /* head (skin loft; nose ridge; painted eyes) — weathered, under a broad hat brim */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.080, rz:0.086, hex:P.skin},
      {y:L.cheekY, rx:0.108, rz:0.104, hex:P.skin},
      {y:L.browY,  rx:0.112, rz:0.103, hex:P.skin},
      {y:L.crownY, rx:0.087, rz:0.079, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph).map(lean));
    for(const i of [1,2]) rings[1][i].z += 0.021;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    capFan(rings[3], lean(V(0, L.headTopY, 0.007)), P.skinDk);
    /* short stubble beard along the jaw */
    quad(lean(V(-0.070,L.jawY+0.005,0.075)), lean(V(0.070,L.jawY+0.005,0.075)),
         lean(V(0.055,L.jawY+0.055,0.110)), lean(V(-0.055,L.jawY+0.055,0.110)), P.skinDk, 0.06);

    /* BROAD-BRIMMED FELT HAT: a wide flat brim ringing the head + a low creased crown (huntsman) */
    const brimOuter=ring(V(0,L.browY+0.03,0), V(0,1,0), 0.190,0.180, n, ph).map(lean);
    const brimInner=ring(V(0,L.browY+0.03,0), V(0,1,0), 0.110,0.104, n, ph).map(lean);
    stitch([brimInner,brimOuter], ()=>P.hat);
    stitch([brimOuter,brimInner], ()=>P.hatDk);
    const crownBands=[
      {y:L.browY+0.025, rx:0.108, rz:0.100, hex:P.hatDk},
      {y:L.crownY+0.02, rx:0.100, rz:0.092, hex:P.hat},
      {y:L.headTopY+0.03, rx:0.062, rz:0.056, hex:P.hatDk},
    ];
    const crownRings=crownBands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph).map(lean));
    stitch(crownRings, b=>crownBands[b].hex);
    capFan(crownRings.at(-1), lean(V(0,L.headTopY+0.06,0)), P.hatDk);
  }

  /* the QUIVER on the back — a leather tube of arrows over the right shoulder (fletching pokes out) */
  {
    const qb=lean(V(0.09,0.86,-0.16)), qt=lean(V(0.15,1.24,-0.10));
    tube(qb, qt, 0.048,0.042, 7, P.leather, {capA:{hex:P.leatherDk}});
    /* arrow shafts + fletching poking from the top */
    for(const dx of [-0.02,0.015,0.04]){
      const ab=qt.clone().add(V(dx,0,0)), at=qt.clone().add(V(dx+0.02,0.14,0.01));
      tube(ab, at, 0.006,0.006, 4, P.bowDk);
      quad(at.clone().add(V(-0.02,0,0)), at.clone().add(V(0.02,0,0)), at.clone().add(V(0.015,0.045,0)), at.clone().add(V(-0.015,0.045,0)), P.furLt, 0.06); }
  }

  /* arms — LEFT holds the bow (derived to BOW_GRIP); RIGHT hangs, thumb hooked in the belt (ready) */
  {
    const S=V(-L.shoulderX, L.shldY-0.01, 0.02), EL=lean(V(-0.30,0.90,0.05));
    tube(lean(S),EL,0.074,0.056,6,P.coat);
    tube(EL,BOW_GRIP,0.056,0.046,6,P.leather,{capB:{hex:P.skin}});
    tube(BOW_GRIP.clone().add(V(-0.03,0.03,-0.02)), BOW_GRIP.clone().add(V(0.03,-0.03,0.02)), 0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(L.shoulderX, L.shldY-0.01, 0.02), EL2=lean(V(0.29,0.86,0.06)), W2=V(0.14,0.755,0.14);
    tube(lean(S2),EL2,0.074,0.056,6,P.coat);
    tube(EL2,W2,0.054,0.044,6,P.leather,{capB:{hex:P.skin}});
    tube(W2, W2.clone().add(V(-0.04,-0.02,0.01)), 0.044,0.040,6,P.skin,{capB:{hex:P.skinDk}});   // thumb-in-belt fist
  }

  /* legs — one foot forward (tracking stride), soft laced boots */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.02), kneeL=V(-0.14,0.40,0.12), ankL=V(-0.145,0.09,0.14);
    const hipR=V( L.hipHalf, L.hipY-0.01, -0.01), kneeR=V( 0.14,0.39,-0.04), ankR=V( 0.15,0.09,-0.09);
    tube(hipL,kneeL,0.082,0.058,6,P.coatDk);
    tube(kneeL,ankL,0.056,0.040,6,P.leatherDk);
    tube(hipR,kneeR,0.082,0.058,6,P.coatDk);
    tube(kneeR,ankR,0.056,0.040,6,P.leatherDk);
    for(const [ank,toeDir] of [[ankL,V(0.03,0,1)], [ankR,V(-0.05,0,1)]]){
      stack([
        {y:0.012, rx:0.060, rz:0.070, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.11,  rx:0.052, rz:0.056, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.17,  rx:0.056, rz:0.056, cx:ank.x, cz:ank.z, hex:P.leatherLt},
      ], 6, {capTop:{hex:P.leatherLt, lift:0.004}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.125), 0.050,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.042, rbz:0.028});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
