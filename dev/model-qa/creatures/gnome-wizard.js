/* dev/model-qa/creatures/gnome-wizard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED gnome race (post-F1 race-gnome proportions: ~0.95u, head LARGER-than-human but reined
   in, big wedge EARS, moderate nose push, eyes WIDE flanking the ridge per the house standard,
   stubby limbs) wearing the WIZARD kit (mage.js signature: a floor-length trim-placketed robe, an
   orb-staff authored first + canted forward, a POINTED drooping hat replacing the gnome cap, a small
   raised casting hand). A gnome wizard must read as ITS RACE at board distance — big head, big ears,
   tiny frame — not a short human, so the ears + oversized head are inherited verbatim. One
   whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnomeWizard(){
  const P = {
    robe:0x3b3f63, robeDk:0x2c2f4c, robeLt:0x4a4f78, trim:0xb08d46, trimDk:0x7d6432,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e,
    wood:0x5a4326, woodDk:0x3f2f1a, orb:0x9fd8e6, orbCore:0xe8f6fb,
    hat:0x33375a, hatDk:0x242742, eye:0x1a1512,
    disc:0x4a4038, discTop:0x585047,
  };

  /* gnome landmarks (from race-gnome.js) — but the robe is the lower body (hem at the disc) */
  const L = {
    hemY:0.03, kneeY:0.20, waistY:0.375, chestY:0.435, shldY:0.485, neckY:0.515,
    shoulderX:0.145,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* ROBE — one loft, floor hem up to the neck (this IS the lower body); pot-belly bulge kept */
  stack([
    {y:L.hemY,   rx:0.215, rz:0.175, hex:P.robeDk},
    {y:L.kneeY,  rx:0.205, rz:0.165, hex:P.robe},
    {y:0.30,     rx:0.200, rz:0.170, hex:P.robe},
    {y:L.waistY, rx:0.205, rz:0.185, hex:P.robe},   /* belly bulge */
    {y:L.chestY, rx:0.185, rz:0.155, hex:P.robeLt},
    {y:L.shldY,  rx:0.170, rz:0.140, hex:P.robeLt},
    {y:L.neckY,  rx:0.075, rz:0.070, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* robe hem flare */
  stack([
    {y:L.hemY-0.004, rx:0.235, rz:0.192, hex:P.robeDk},
    {y:0.11,         rx:0.212, rz:0.172, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});

  /* front trim placket down the robe front */
  {
    const zs=[[L.chestY,0.158],[0.35,0.172],[L.waistY,0.187],[0.20,0.168],[0.08,0.180]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.028,y1,z1), V(0.028,y1,z1), V(0.028,y2,z2), V(-0.028,y2,z2), i%2?P.trim:P.trimDk, 0.04);
    }
  }

  /* belt cord */
  stack([
    {y:L.waistY-0.02, rx:0.208, rz:0.188, hex:P.trimDk},
    {y:L.waistY+0.02, rx:0.206, rz:0.186, hex:P.trim},
  ], 8, {});

  /* HEAD — inherited post-F1 gnome (big-head ratio, wide eyes, ears) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.106, hex:P.skin},
      {y:L.cheekY, rx:0.134, rz:0.128, hex:P.skin},
      {y:L.browY,  rx:0.138, rz:0.126, hex:P.skin},
      {y:L.crownY, rx:0.106, rz:0.097, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.026;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
    for(const s of [-1,1]){
      const ex=s*0.072, ey=(L.cheekY+L.browY)/2-0.004, ez=0.150;
      quad(V(ex-0.016,ey-0.012,ez), V(ex+0.016,ey-0.012,ez),
           V(ex+0.016,ey+0.014,ez-0.007), V(ex-0.016,ey+0.014,ez-0.007), P.eye, 0.0);
    }
    /* oversized wedge EARS — the gnome silhouette read (inherited) */
    for(const s of [-1,1]){
      const eb=V(s*0.128, L.cheekY+0.008, 0.016);
      const et=eb.clone().add(V(s*0.078, 0.032, -0.010));
      tube(eb, et, 0.024, 0.009, 5, P.ear, {capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.004}});
    }
  }

  /* POINTED WIZARD HAT — brim around the brow, then a tall drooping cone (replaces the gnome cap) */
  {
    const n=10, ph=Math.PI/n;
    const brimLo=ring(V(0,L.browY+0.010,0.0), V(0,1,0), 0.175, 0.164, n, ph);
    const brimHi=ring(V(0,L.browY+0.044,0.0), V(0,1,0), 0.150, 0.142, n, ph);
    stitch([brimLo,brimHi], ()=>P.hatDk);
    capFan(brimLo, V(0,L.browY-0.006,0.0), P.hatDk, true);
    const cone=[
      {y:L.crownY-0.01, rx:0.146, rz:0.138, cz:0.0},
      {y:0.90,          rx:0.100, rz:0.094, cz:-0.02},
      {y:1.02,          rx:0.062, rz:0.058, cz:-0.05},
      {y:1.12,          rx:0.032, rz:0.030, cz:-0.09},
    ].map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(cone, ()=>P.hat);
    stitch([brimHi,cone[0]], ()=>P.hat);
    capFan(cone.at(-1), V(0.02,1.20,-0.14), P.hatDk);
    const bandLo=ring(V(0,L.crownY-0.01,0.0), V(0,1,0), 0.148,0.140,n,ph);
    const bandHi=ring(V(0,L.crownY+0.04,0.0),V(0,1,0), 0.138,0.130,n,ph);
    stitch([bandLo,bandHi], ()=>P.trim);
  }

  /* STAFF FIRST — canted forward, orb leading; base planted on the disc out-right */
  const SHAFT_B=V(0.245,0.02,0.16), SHAFT_T=V(0.205,0.98,0.32);
  const GRIP=SHAFT_B.clone().lerp(SHAFT_T, 0.55);
  {
    tube(SHAFT_B, SHAFT_T, 0.022, 0.018, 6, P.wood, {capA:{hex:P.woodDk}});
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2, pr=0.042;
      const claw=V(SHAFT_T.x+Math.cos(a)*pr, SHAFT_T.y+0.045, SHAFT_T.z+Math.sin(a)*pr);
      tube(SHAFT_T, claw, 0.011,0.006,5,P.woodDk,{capB:{hex:P.woodDk}});
    }
    const oc=V(SHAFT_T.x, SHAFT_T.y+0.085, SHAFT_T.z);
    const orb=[];
    const ob=[0.0,0.35,0.62,0.82,0.96,1.0];
    for(const t of ob){ const yy=oc.y-0.046+t*0.092; const rr=Math.sqrt(Math.max(0,1-Math.pow((t-0.5)*2,2)))*0.050;
      orb.push(ring(V(oc.x,yy,oc.z), V(0,1,0), rr+0.001, rr+0.001, 8, Math.PI/8)); }
    stitch(orb, (b)=> b<2?P.orb:P.orbCore);
  }

  /* ARMS — stubby bell sleeves. Right grips the staff; left raised in a small casting gesture. */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(0.01,-0.01,0.04));
    const W=GRIP.clone().add(V(0.0,-0.01,-0.01));
    tube(S,E,0.058,0.048,6,P.robeLt);
    tube(E,W,0.056,0.038,6,P.robe,{capB:{hex:P.robeDk}});
    tube(GRIP.clone().add(V(-0.01,-0.035,0.0)), GRIP.clone().add(V(0.01,0.035,0.0)), 0.030,0.028,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const CAST=V(-0.245, 0.62, 0.22);
    const E2=S2.clone().lerp(CAST, 0.5).add(V(-0.05,-0.02,0.02));
    tube(S2,E2,0.058,0.048,6,P.robeLt);
    tube(E2,CAST,0.056,0.036,6,P.robe,{capB:{hex:P.robeDk}});
    tube(CAST.clone().add(V(0.0,-0.015,-0.01)), CAST.clone().add(V(0.0,0.02,0.02)), 0.030,0.026,6,P.skin,{capA:{hex:P.skin}});
    for(const fx of [-0.018,0.0,0.018]){
      const base=CAST.clone().add(V(fx,0.02,0.02));
      tube(base, base.clone().add(V(fx*0.6,0.04,0.02)), 0.009,0.005,4,P.skin,{capB:{hex:P.skinDk}});
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
