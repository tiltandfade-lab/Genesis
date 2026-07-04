/* dev/model-qa/parts.js — the SHARED HUMANOID PARTS KIT (modularity proof).
   The whole-object law still holds: every part function draws into the ONE current geometry frame
   (probe-lib's POS/COL buffers). Parts are shared *source functions*, NOT glued meshes — a figure is
   still baked as a single welded mesh. Reuse comes from composition against a shared rig of named
   landmarks, and held items are authored first so the gripping hand derives from the grip.
   Consumed by creatures/*.js class recipes. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from './probe-lib.js';

/* ---------- the shared humanoid rig: one canonical skeleton every class registers to ---------- */
export function humanoidRig(over = {}){
  return Object.assign({
    hipY:0.72, waistY:0.80, ribY:0.91, chestY:1.02, shldY:1.10, neckY:1.145,
    hipHalf:0.115, shoulderX:0.245,
    jawY:1.175, cheekY:1.25, browY:1.325, crownY:1.415, headTopY:1.475,
  }, over);
}

/* palette atoms shared across classes (skin/eye/disc); each class extends with its own cloth/metal */
export const BASE_P = {
  skin:0xc49a72, skinDk:0x8a6a4e, eye:0x1a1512,
  disc:0x4a4038, discTop:0x585047,
};

/* ---------- HEAD (skin loft; nose ridge; painted eyes). Optional beard via opts.beard.
   Optional opts.xform(p)->p re-poses the whole head as a unit (F2 rogue crouch: the head leans+drops
   with the body). Default identity, so every existing caller is unchanged. ---------- */
export function buildHead(L, P, opts = {}){
  const n=8, ph=Math.PI/n;
  const xf = opts.xform || (p=>p);
  const bands=[
    {y:L.jawY,   rx:0.080, rz:0.086, hex:P.skin},
    {y:L.cheekY, rx:0.110, rz:0.106, hex:P.skin},
    {y:L.browY,  rx:0.114, rz:0.105, hex:P.skin},
    {y:L.crownY, rx:0.089, rz:0.081, hex:P.skinDk},
  ];
  const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph));
  for(const i of [1,2]) rings[1][i].z += 0.021;
  rings.forEach(r=>r.forEach((p,i)=>{ const q=xf(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
  for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){
    const i2=(i+1)%n;
    quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
  }
  capFan(rings[3], xf(V(0, L.headTopY, 0.007)), P.skinDk);
  /* eyes — two SMALL intentional quads flanking the nose (the house eye standard, Adam 2026-07-03:
     "smaller and more intentional, not shaded eye polys"). Reads as painted-mini dot eyes at 1/3-res. */
  for(const s of [-1,1]){
    const ex=s*0.052, ey=(L.cheekY+L.browY)/2-0.004, ez=0.124;   /* flank the nose ridge, proud of the bulged face plane */
    quad(xf(V(ex-0.013,ey-0.010,ez)), xf(V(ex+0.013,ey-0.010,ez)),
         xf(V(ex+0.013,ey+0.011,ez-0.006)), xf(V(ex-0.013,ey+0.011,ez-0.006)), P.eye, 0.0);
  }
}

/* ---------- HOOD (linen/cloth shell, open face window, dark lining). Colors from P.hood/P.hoodDk.
   Optional opts.xform re-poses the whole hood as a unit (matches buildHead). Default identity. ------ */
export function buildHood(L, P, opts = {}){
  const n=8, ph=Math.PI/n, faceCols=[0,1,2];
  const xf = opts.xform || (p=>p);
  const hood=P.hood, hoodDk=P.hoodDk;
  const bands=[
    {y:L.neckY-0.005, rx:0.105, rz:0.100, hex:hoodDk},
    {y:L.jawY+0.01,   rx:0.140, rz:0.128, hex:hood},
    {y:L.browY+0.005, rx:0.146, rz:0.130, hex:hood},
    {y:L.crownY+0.02, rx:0.112, rz:0.104, hex:hood},
  ];
  const skip={1:faceCols, 2:faceCols};
  const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
  rings[3].forEach(p=>p.z-=0.018);
  rings.forEach(r=>r.forEach(p=>{ const q=xf(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
  stitch(rings, b=>bands[b].hex, skip);
  capFan(rings[3], xf(V(0, L.headTopY+0.045, -0.03)), hood);
  const inner=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx-0.018, b.rz-0.018, n, ph));
  inner[3].forEach(p=>p.z-=0.018);
  inner.forEach(r=>r.forEach(p=>{ const q=xf(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
  for(let b=1;b<3;b++) for(const edge of [0,3])
    quad(rings[b][edge], inner[b][edge], inner[b+1][edge], rings[b+1][edge], hoodDk, 0.03);
}

/* ---------- TORSO LOFT: a class body from a band list (armor/robe/leathers all use this) ------- */
export function buildTorso(bands, opts = {}){ return stack(bands, opts.n || 8, opts); }

/* ---------- ARM to a grip: shoulder -> auto-derived elbow -> wrist@grip, then a hand nub -------
   bend = outward/vertical bulge of the elbow off the shoulder->grip line. Hand derives from grip. */
export function buildArmToGrip(shoulder, grip, P, opts = {}){
  const bend = opts.bend || V(0.06,0.03,0.02);
  const elbow = shoulder.clone().lerp(grip, 0.5).add(bend);
  tube(shoulder, elbow, opts.upR ?? 0.078, opts.midR ?? 0.062, 6, opts.sleeveHex ?? P.skin);
  tube(elbow, grip, opts.midR ?? 0.058, opts.cuffR ?? 0.048, 6, opts.cuffHex ?? P.skin,
       {capB:{hex:opts.cuffHex ?? P.skin}});
  return { elbow };
}

/* ---------- DAGGER module: authored from a grip along a blade direction. Reusable, instanceable.
   Draws guard + grip wrap + a leaf blade. Returns the fist point so an arm can derive to it. ----- */
export function buildDagger(grip, dir, P){
  const D = dir.clone().normalize();
  const steel=P.steel ?? 0x9aa1a6, steelDk=P.steelDk ?? 0x6b7176, wrap=P.leatherDk ?? 0x3a2d1f, brass=P.brass ?? 0xb08d46;
  // pommel + grip wrap (behind the fist), fist sits at `grip`
  const butt=grip.clone().addScaledVector(D,-0.075);
  tube(butt, grip.clone().addScaledVector(D,0.02), 0.018,0.018,6, wrap, {capA:{hex:brass, lift:0.02}});
  // crossguard
  const up=Math.abs(D.y)>0.9?V(0,0,1):V(0,1,0);
  const gu=new THREE.Vector3().crossVectors(up,D).normalize();
  const g0=grip.clone().addScaledVector(D,0.03);
  quad(g0.clone().addScaledVector(gu,0.05), g0.clone().addScaledVector(gu,-0.05),
       g0.clone().addScaledVector(gu,-0.05).addScaledVector(D,0.02), g0.clone().addScaledVector(gu,0.05).addScaledVector(D,0.02),
       steelDk, 0.03);
  // leaf blade: three cross-sections narrowing to a tip
  const bl=(t,w,th)=>{ const c=g0.clone().addScaledVector(D,t);
    const gv=new THREE.Vector3().crossVectors(D,gu).normalize();
    return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
  const s1=bl(0.03,0.030,0.008), s2=bl(0.14,0.024,0.006), s3=bl(0.22,0.014,0.004);
  stitch([s1,s2,s3], ()=>steel);
  capFan(s3, g0.clone().addScaledVector(D,0.30), steel);
  return grip.clone();
}

/* ---------- BASE DISC (the miniature stand every figure gets) ---------- */
export function buildBase(P = BASE_P){
  const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
  const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
  stitch([r1,r2], ()=>P.disc);
  capFan(r2, V(0,0.058,0), P.discTop);
}
