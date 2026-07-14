/* dev/model-qa/creatures/npc-laborer.js — the dockhand/laborer/porter (whole-object NPC).
   THE most common on-screen civilian shape after the generic commoner (npc-role d100 rows
   16-24: Laborer or Porter + Dockworker or Stevedore = 9/100, the top unmodeled weight). The
   read is HAULING: a heavy CRATE shouldered on the right side (authored FIRST — the gripping
   hand + braced arm derive from it), a wide-braced load-bearing stance, sleeves rolled to bare
   forearms, a leather back-strap/apron and knee-wrap. Distinct from the commoner (who carries a
   little sack low in a loose hand with a mild stoop) by the BIG shoulder mass + braced legs +
   bare arms. Undyed working canvas. Shared rig/base from parts.js. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildLaborer(){
  /* ---------- PALETTE (rough working canvas + rope + bare tanned forearms) ---------- */
  const P = Object.assign({}, BASE_P, {
    shirt:0x9a8c68, shirtDk:0x71654a, canvas:0x8a7c58, canvasDk:0x625637,
    apron:0x5c4a30, apronDk:0x40331f, strap:0x4a3a26, strapDk:0x332818,
    skin:0xbf9060, skinDk:0x87643f, trouser:0x6b6045, trouserDk:0x4b4230,
    crate:0x7a5f3a, crateDk:0x54401f, crateLt:0x8d7047, nail:0x5a5550,
    boot:0x3a2f22, bootDk:0x281f16,
  });

  /* ---------- RIG — stocky, weight-braced; a touch shorter than the class figs, broad shoulders ---------- */
  const L = humanoidRig({
    hipY:0.70, waistY:0.78, ribY:0.885, chestY:0.985, shldY:1.07, neckY:1.11,
    shoulderX:0.265,
    jawY:1.14, cheekY:1.215, browY:1.29, crownY:1.38, headTopY:1.44,
  });

  /* ================= THE CRATE — authored FIRST, shouldered on the RIGHT (rests on the deltoid),
     one hand up steadying its far top edge. A boxy wooden crate: 6 faces + plank/nail read. ===== */
  const CRATE_C = V(0.32, 1.19, 0.02);           // centre, riding high on the right shoulder
  const cx=CRATE_C.x, cy=CRATE_C.y, cz=CRATE_C.z, hx=0.20, hy=0.155, hz=0.185;
  const STEADY = V(cx+0.03, cy+0.145, cz+0.16);  // right hand steadies the near-top edge (grip derived below)
  {
    const nx=[cx-hx,cx+hx], ny=[cy-hy,cy+hy], nz=[cz-hz,cz+hz];
    const c=(i,j,k)=>V(nx[i],ny[j],nz[k]);
    const box=(a,b,cc,d,hex)=>quad(a,b,cc,d,hex,0.05);
    box(c(0,0,1),c(1,0,1),c(1,1,1),c(0,1,1), P.crateLt);   // front (+z)
    box(c(1,0,0),c(0,0,0),c(0,1,0),c(1,1,0), P.crateDk);   // back
    box(c(1,0,1),c(1,0,0),c(1,1,0),c(1,1,1), P.crate);     // right
    box(c(0,0,0),c(0,0,1),c(0,1,1),c(0,1,0), P.crateDk);   // left
    box(c(0,1,1),c(1,1,1),c(1,1,0),c(0,1,0), P.crateLt);   // top
    box(c(0,0,0),c(1,0,0),c(1,0,1),c(0,0,1), P.crateDk);   // bottom
    /* a diagonal batten plank across the front + corner nails (reads as a real crate, not a block) */
    quad(V(cx-hx+0.02,cy-hy+0.03,cz+hz+0.004), V(cx-hx+0.09,cy-hy+0.03,cz+hz+0.004),
         V(cx+hx-0.02,cy+hy-0.03,cz+hz+0.004), V(cx+hx-0.09,cy+hy-0.03,cz+hz+0.004), P.crateDk, 0.04);
    for(const [sx,sy] of [[-hx+0.03,-hy+0.03],[hx-0.03,-hy+0.03],[-hx+0.03,hy-0.03],[hx-0.03,hy-0.03]])
      quad(V(cx+sx-0.012,cy+sy-0.012,cz+hz+0.006), V(cx+sx+0.012,cy+sy-0.012,cz+hz+0.006),
           V(cx+sx+0.012,cy+sy+0.012,cz+hz+0.006), V(cx+sx-0.012,cy+sy+0.012,cz+hz+0.006), P.nail, 0.0);
  }

  /* torso — broad canvas shirt, thicker through the chest (a hauler's build) */
  stack([
    {y:L.hipY,   rx:0.205, rz:0.150, hex:P.shirtDk},
    {y:L.waistY, rx:0.190, rz:0.140, hex:P.canvas},
    {y:L.ribY,   rx:0.210, rz:0.152, hex:P.shirt},
    {y:L.chestY, rx:0.238, rz:0.168, hex:P.shirt},
    {y:L.shldY,  rx:0.256, rz:0.172, hex:P.shirt},
    {y:L.neckY,  rx:0.088, rz:0.082, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* short work-apron over the front of the thighs (leather, cut off at mid-thigh, plain) */
  stack([
    {y:0.46, rx:0.170, rz:0.150, hex:P.apronDk},
    {y:0.58, rx:0.178, rz:0.150, hex:P.apron},
    {y:L.hipY-0.02, rx:0.176, rz:0.146, hex:P.apron},
  ], 7, {skip:{0:[4,5,6],1:[4,5,6],2:[4,5,6]}});   // apron only across the FRONT arc

  /* crossed leather straps over the shoulders (carries the load) + a waist belt */
  for(const s of [-1,1]){
    tube(V(s*0.11,L.shldY+0.02,0.10), V(-s*0.09,0.775,0.14), 0.024,0.022,4,P.strap);
  }
  { const b1=ring(V(0,0.755,0), V(0,1,0), 0.196,0.146, 8, Math.PI/8);
    const b2=ring(V(0,0.795,0), V(0,1,0), 0.192,0.143, 8, Math.PI/8);
    stitch([b1,b2], ()=>P.strapDk); }

  /* head (skin loft; nose ridge; painted eyes) — a plain sweat-rag knotted round the brow */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.082, rz:0.088, hex:P.skin},
      {y:L.cheekY, rx:0.112, rz:0.108, hex:P.skin},
      {y:L.browY,  rx:0.116, rz:0.107, hex:P.skin},
      {y:L.crownY, rx:0.091, rz:0.083, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.021;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    capFan(rings[3], V(0, L.headTopY, 0.007), P.skinDk);
    /* sweat-rag: a single dark band ringing the brow (working-man tell, not a cap) */
    const r1=ring(V(0,L.browY-0.005,0), V(0,1,0), 0.122,0.112, n, ph);
    const r2=ring(V(0,L.browY+0.045,0), V(0,1,0), 0.120,0.110, n, ph);
    stitch([r1,r2], ()=>P.strap);
    /* short-cropped hair cap above the rag */
    capFan(ring(V(0,L.crownY+0.01,0), V(0,1,0), 0.088,0.080, n, ph), V(0,L.headTopY+0.02,0), P.skinDk);
  }

  /* arms — BOTH bare (sleeves rolled): RIGHT up bracing the crate underside; LEFT hangs, fist loose.
     Right hand derives to STEADY; the forearm passes UNDER the crate. */
  {
    /* right upper arm out and up to the shoulder-load, rolled sleeve to bare forearm */
    const S=V(L.shoulderX, L.shldY-0.005, 0.02), EL=V(0.335,1.02,0.10);
    tube(S,EL,0.082,0.062,6,P.shirt,{capB:{hex:P.skin}});               // sleeve rolled -> bare
    tube(EL,STEADY,0.060,0.050,6,P.skin,{capB:{hex:P.skin}});           // bare forearm up to the crate edge
    tube(STEADY.clone().add(V(-0.04,-0.02,-0.03)), STEADY.clone().add(V(0.04,0.03,0.03)),
         0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});   // fist on the crate corner

    /* left arm hangs, bare forearm, loose fist at the side */
    const S2=V(-L.shoulderX, L.shldY-0.005, 0.015), EL2=V(-0.305,0.82,0.05), W2=V(-0.285,0.60,0.075);
    tube(S2,EL2,0.082,0.062,6,P.shirt,{capB:{hex:P.skin}});
    tube(EL2,W2,0.058,0.048,6,P.skin);
    tube(W2, W2.clone().add(V(0.0,-0.075,0.01)), 0.046,0.040,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* legs — WIDE braced load-bearing stance (feet planted apart, knees slightly bent, weight forward) */
  {
    const hipL=V(-L.hipHalf-0.02, L.hipY-0.01, 0.01), kneeL=V(-0.20,0.39,0.06), ankL=V(-0.215,0.09,0.05);
    const hipR=V( L.hipHalf+0.02, L.hipY-0.01, 0.00), kneeR=V( 0.19,0.39,0.02), ankR=V( 0.20,0.09,-0.01);
    tube(hipL,kneeL,0.092,0.064,6,P.trouser);
    tube(kneeL,ankL,0.062,0.044,6,P.trouserDk);
    tube(hipR,kneeR,0.092,0.064,6,P.trouser);
    tube(kneeR,ankR,0.062,0.044,6,P.trouserDk);
    /* heavy flat work-boots */
    for(const [ank,toeDir] of [[ankL,V(0.08,0,1)], [ankR,V(-0.06,0,1)]]){
      stack([
        {y:0.012, rx:0.066, rz:0.074, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.10,  rx:0.060, rz:0.062, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.004}});
      const toeA=V(ank.x,0.055,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.135), 0.056,0.042,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.048, rbz:0.032});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
