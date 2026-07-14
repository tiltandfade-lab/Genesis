/* dev/model-qa/creatures/mage.js — the robed spellcaster (WIZARD) landmark table (whole-object probe).
   F3 RE-POSE (2026-07-04): an INCANTATION stance replaces the OG upright parade (kept as mage-alt1).
   Per pose-refs.md §F3.3 (spell-casting pose refs): the orb-staff is CANTED forward (top + orb
   leading toward the fore, not a vertical post), the FREE (left) hand is RAISED up-and-forward in an
   open casting gesture (fingers a spread claw), and the head/beard/hat TIP FORWARD in a slight
   incantation lean. The floor-length robe (the lower body) stays planted on the disc — only the
   staff cant, the raised casting arm, and a light head-region lean move. Orb stays ON the staff (no
   new floating element — that's the sorcerer's one legal floater; the wizard is staff-only).

   Same whole-object grammar as humanoid.js: the ENTIRE creature is one function of shared primitives,
   every vertex in one model frame, no anchors. The staff is authored first. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildMage(){
  /* ---------- PALETTE (VS desaturated; carried as vertex color into the GLB) ---------- */
  const P = {
    robe:0x3b3f63, robeDk:0x2c2f4c, robeLt:0x4a4f78, trim:0xb08d46, trimDk:0x7d6432,
    linen:0xcfc4a6, skin:0xc49a72, skinDk:0x8a6a4e, beard:0xbfc2c4, beardDk:0x8f9294,
    eye:0x1a1512, wood:0x5a4326, woodDk:0x3f2f1a, orb:0x9fd8e6, orbCore:0xe8f6fb,
    hat:0x33375a, hatDk:0x24274238&0xffffff, disc:0x4a4038, discTop:0x585047,
  };
  P.hatDk = 0x242742;

  /* ---------- LANDMARKS (slim caster, ~4.6 heads) ---------- */
  const L = {
    hemY:0.05, kneeY:0.42, waistY:0.82, chestY:1.02, shldY:1.11, neckY:1.155,
    shoulderX:0.225,
    jawY:1.185, cheekY:1.26, browY:1.335, crownY:1.425, headTopY:1.485,
  };

  /* F3 re-pose: a LIGHT forward incantation lean of the HEAD/NECK region only (head, beard, hat) —
     points above the neck pitch forward (+z) about a neck pivot, so the caster's head bows into the
     spell. The floor-length robe (lower body) stays planted, so the hem never lifts off the disc. */
  const HUNCH = 0.20, HPIVOT = V(0, L.neckY - 0.02, 0.0);
  const hunch = (p)=>{
    if(p.y <= HPIVOT.y) return p;
    const q = p.clone().sub(HPIVOT); q.applyAxisAngle(V(1,0,0), HUNCH); return q.add(HPIVOT);
  };

  /* ROBE — one long loft, floor hem up to the neck (this IS the lower body) */
  stack([
    {y:L.hemY,   rx:0.315, rz:0.255, hex:P.robeDk},
    {y:L.kneeY,  rx:0.270, rz:0.220, hex:P.robe},
    {y:0.62,     rx:0.235, rz:0.190, hex:P.robe},
    {y:L.waistY, rx:0.190, rz:0.155, hex:P.robe},
    {y:L.chestY, rx:0.215, rz:0.165, hex:P.robeLt},
    {y:L.shldY,  rx:0.220, rz:0.150, hex:P.robeLt},
    {y:L.neckY,  rx:0.080, rz:0.075, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* robe hem flare (a second skirt lip so the base of the loft reads as heavy cloth) */
  stack([
    {y:L.hemY-0.005, rx:0.345, rz:0.280, hex:P.robeDk},
    {y:0.16,         rx:0.300, rz:0.245, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});

  /* front trim placket — a vertical band of trim quads down the robe front (+z face) */
  {
    const zs=[[L.chestY,0.163],[0.92,0.175],[L.waistY,0.150],[0.66,0.185],[0.50,0.213],[L.kneeY,0.222]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.035,y1,z1), V(0.035,y1,z1), V(0.035,y2,z2), V(-0.035,y2,z2), i%2?P.trim:P.trimDk, 0.04);
    }
  }

  /* belt cord + hanging knot */
  stack([
    {y:L.waistY-0.01, rx:0.198, rz:0.162, hex:P.trimDk},
    {y:L.waistY+0.03, rx:0.196, rz:0.160, hex:P.trim},
  ], 8, {});
  tube(V(0.02,L.waistY,0.16), V(0.05,0.66,0.20), 0.018,0.012,6,P.trim,{capB:{hex:P.trimDk}});

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts are 1 & 2. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.078, rz:0.084, hex:P.skin},
      {y:L.cheekY, rx:0.106, rz:0.104, hex:P.skin},
      {y:L.browY,  rx:0.112, rz:0.104, hex:P.skin},
      {y:L.crownY, rx:0.088, rz:0.080, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    rings.forEach(r=>r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));   /* F3 incantation lean */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], hunch(V(0, L.headTopY, 0.006)), P.skinDk);
  }

  /* BEARD — a tapering wedge of rings from the jaw down the chest (front-offset) */
  {
    const bands=[
      {y:L.jawY+0.01, rx:0.095, rz:0.070, cz:0.045, hex:P.beard},
      {y:L.cheekY-0.06,rx:0.088,rz:0.062, cz:0.070, hex:P.beard},
      {y:1.06,        rx:0.078, rz:0.055, cz:0.085, hex:P.beard},
      {y:0.96,        rx:0.058, rz:0.045, cz:0.080, hex:P.beardDk},
      {y:0.88,        rx:0.030, rz:0.028, cz:0.070, hex:P.beardDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    rings.forEach(r=>r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));   /* F3 incantation lean */
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), hunch(V(0,0.83,0.062)), P.beardDk);
  }

  /* POINTED HAT — brim ring around the brow, then a tall drooping cone.
     F3: the entire hat is passed through hunch() so it tips forward with the head as one unit. */
  {
    const n=10, ph=Math.PI/n;
    const H = (r)=>{ r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }); return r; };
    const brimLo=H(ring(V(0,L.browY+0.01,0.0), V(0,1,0), 0.185, 0.175, n, ph));
    const brimHi=H(ring(V(0,L.browY+0.05,0.0), V(0,1,0), 0.155, 0.148, n, ph));
    stitch([brimLo,brimHi], ()=>P.hatDk);
    capFan(brimLo, hunch(V(0,L.browY-0.01,0.0)), P.hatDk, true);   // underside of brim
    /* cone body: rings shrinking + leaning back, up to a drooped tip */
    const cone=[
      {y:L.crownY-0.02, rx:0.150, rz:0.142, cz:0.0},
      {y:1.62,          rx:0.110, rz:0.104, cz:-0.02},
      {y:1.80,          rx:0.072, rz:0.068, cz:-0.05},
      {y:1.96,          rx:0.040, rz:0.038, cz:-0.09},
    ].map(b=>H(ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph)));
    stitch(cone, ()=>P.hat);
    stitch([brimHi,cone[0]], ()=>P.hat);
    capFan(cone.at(-1), hunch(V(0.02,2.06,-0.16)), P.hatDk);        // drooping point
    /* hat band */
    const bandLo=H(ring(V(0,L.crownY-0.01,0.0), V(0,1,0), 0.152,0.144,n,ph));
    const bandHi=H(ring(V(0,L.crownY+0.05,0.0),V(0,1,0), 0.140,0.132,n,ph));
    stitch([bandLo,bandHi], ()=>P.trim);
  }

  /* STAFF FIRST — F3 re-pose: CANTED forward, the orb leading toward the fore (was a vertical post).
     The base stays planted out-right on the disc; the top rakes FORWARD (+z) and slightly in, so the
     orb thrusts out ahead of the caster — the "channeling / directing the spell" read. */
  const SHAFT_B=V(0.34,0.02,0.20), SHAFT_T=V(0.285,1.60,0.44);
  const SDIR=new THREE.Vector3().subVectors(SHAFT_T,SHAFT_B).normalize();
  const GRIP=SHAFT_B.clone().lerp(SHAFT_T, 0.60);           // where the fist meets the (canted) shaft
  {
    tube(SHAFT_B, SHAFT_T, 0.028, 0.024, 6, P.wood, {capA:{hex:P.woodDk}});
    /* orb cradle: three prongs + an orb */
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2, pr=0.055;
      const claw=V(SHAFT_T.x+Math.cos(a)*pr, SHAFT_T.y+0.06, SHAFT_T.z+Math.sin(a)*pr);
      tube(SHAFT_T, claw, 0.014,0.008,5,P.woodDk,{capB:{hex:P.woodDk}});
    }
    // orb — small ellipsoid blob at the crown of the staff
    const oc=V(SHAFT_T.x, SHAFT_T.y+0.11, SHAFT_T.z);
    const orb=[];
    const ob=[0.0,0.35,0.62,0.82,0.96,1.0];
    for(const t of ob){ const yy=oc.y-0.058+t*0.116; const rr=Math.sqrt(Math.max(0,1-Math.pow((t-0.5)*2,2)))*0.062;
      orb.push(ring(V(oc.x,yy,oc.z), V(0,1,0), rr+0.001, rr+0.001, 8, Math.PI/8)); }
    stitch(orb, (b)=> b<2?P.orb:P.orbCore);
  }

  /* ARMS — bell sleeves. Right arm raised to the staff grip; left hangs at the side. */
  {
    /* right: shoulder -> elbow -> wrist at the (forward-canted) GRIP. F3: the elbow lifts + comes
       FORWARD toward the raked staff so the forearm follows the cant instead of hanging vertical. */
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(0.01,-0.02,0.06));
    const W=GRIP.clone().add(V(0.0,-0.02,-0.01));
    tube(S,E,0.090,0.075,6,P.robeLt);                       // upper sleeve
    tube(E,W,0.088,0.055,6,P.robe,{capB:{hex:P.robeDk}});   // bell forearm sleeve (wide->narrow at cuff)
    tube(GRIP.clone().add(V(-0.01,-0.05,0.0)), GRIP.clone().add(V(0.01,0.05,0.0)), 0.042,0.040,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    /* left: F3 re-pose — RAISED up-and-forward in an open CASTING gesture (was hanging at the side).
       Shoulder -> elbow (lifted, out) -> wrist high + forward, then an open hand: a small palm block
       + three short finger nubs spread toward the fore (the "weaving the spell" read). */
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const CAST=V(-0.345, 1.235, 0.335);                    // raised casting hand: up + forward + out-left
    const E2=S2.clone().lerp(CAST, 0.5).add(V(-0.07,-0.03,0.02));
    tube(S2,E2,0.090,0.075,6,P.robeLt);
    tube(E2,CAST,0.086,0.050,6,P.robe,{capB:{hex:P.robeDk}});  // bell sleeve up to the raised wrist
    /* open casting hand: palm + a spread of finger nubs pointing up-and-forward */
    tube(CAST.clone().add(V(0.0,-0.02,-0.01)), CAST.clone().add(V(0.0,0.03,0.02)), 0.040,0.036,6,P.skin,{capA:{hex:P.skin}});
    for(const fx of [-0.024,0.0,0.024]){
      const base=CAST.clone().add(V(fx,0.03,0.02));
      tube(base, base.clone().add(V(fx*0.6,0.055,0.03)), 0.011,0.006,4,P.skin,{capB:{hex:P.skinDk}});
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
