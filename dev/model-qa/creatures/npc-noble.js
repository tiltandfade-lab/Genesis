/* dev/model-qa/creatures/npc-noble.js — the wealthy-NPC landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js: the ENTIRE creature is one function of shared
   primitives, every vertex in one model frame, no anchors. The CANE is authored FIRST, held
   tip-to-ground, so the gloved hand is derived to its head. Long fitted coat with a contrasting
   collar band and cuff bands, a short two-shoulder cape (unlike the bard's one-shoulder drape),
   upright chin-high posture, and a single gold chest chain read "noble" at a glance — rich but
   desaturated (wine, slate, umber — never neon). Human proportions copied from humanoid.js
   (head-top ~1.475, 4.5 heads). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildNoble(){
  /* ---------- PALETTE (VS desaturated: wine / slate / umber — no neon) ---------- */
  const P = {
    coat:0x5a2f38, coatDk:0x452330, coatLt:0x6d3a44,          /* wine coat */
    collar:0x4a4550, collarDk:0x373339,                        /* slate contrast collar/cuffs */
    cape:0x3d3630, capeDk:0x2c2721,                            /* umber shoulder cape */
    linen:0xc9bfa0, linenDk:0x8d846c,
    skin:0xc49a72, skinDk:0x8a6a4e, eye:0x1a1512,
    glove:0x2f2a26, gloveDk:0x201c19,
    gold:0x9c7d3e, goldDk:0x6d5a2c,
    wood:0x4a3826, woodDk:0x342718, steel:0x9aa1a6,
    trouser:0x433c34, boot:0x241d15,
    hair:0x413428, hairDk:0x2b2118,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — copy humanoid.js's rig numbers verbatim (upright, chin-high) ---------- */
  const L = {
    hipY:0.72, waistY:0.80, ribY:0.91, chestY:1.02, shldY:1.10, neckY:1.145,
    hipHalf:0.115, shoulderX:0.245,
    jawY:1.175, cheekY:1.25, browY:1.325, crownY:1.415, headTopY:1.475,
  };

  /* ================= THE CANE — authored FIRST, tip planted on the ground, held upright =========
     A thin shaft from a ground tip up to a gloved-hand grip at roughly hip height, topped by a
     small round pommel above the grip. The RIGHT hand (fist) derives to this grip. */
  const TIP = V(0.335, 0.0, 0.075);
  const GRIP = V(0.318, 0.775, 0.045);
  const POMMEL = V(0.312, 0.845, 0.038);
  const CANE_DIR = new THREE.Vector3().subVectors(GRIP, TIP).normalize();
  {
    tube(TIP, GRIP.clone().addScaledVector(CANE_DIR, 0.05), 0.014, 0.014, 6, P.wood, {capA:{hex:P.woodDk}});
    tube(GRIP.clone().addScaledVector(CANE_DIR, 0.05), POMMEL, 0.014, 0.020, 6, P.gold);
    // small round pommel cap
    const pr = ring(POMMEL.clone().addScaledVector(CANE_DIR, 0.012), CANE_DIR, 0.020, 0.020, 8);
    capFan(pr, POMMEL.clone().addScaledVector(CANE_DIR, 0.028), P.goldDk);
  }

  /* trunk (one loft, hips->neck) — same silhouette family as humanoid.js's fighter */
  stack([
    {y:L.hipY,   rx:0.185, rz:0.140, hex:P.coatDk},
    {y:L.waistY, rx:0.165, rz:0.125, hex:P.coat},
    {y:L.ribY,   rx:0.190, rz:0.140, hex:P.coat},
    {y:L.chestY, rx:0.210, rz:0.150, hex:P.coatLt},
    {y:L.shldY,  rx:0.215, rz:0.145, hex:P.coatLt},
    {y:L.neckY,  rx:0.082, rz:0.078, hex:P.collarDk},
  ], 8, {capTop:{hex:P.collarDk, lift:0.004}});

  /* LONG FITTED COAT — a floor-reaching-past-hip skirt, tapering, buttoned front placket */
  stack([
    {y:0.10,  rx:0.240, rz:0.195, hex:P.coatDk},
    {y:0.28,  rx:0.225, rz:0.182, hex:P.coat},
    {y:0.46,  rx:0.208, rz:0.168, hex:P.coat},
    {y:0.62,  rx:0.195, rz:0.156, hex:P.coat},
    {y:L.hipY,rx:0.188, rz:0.142, hex:P.coatLt},
  ], 8, {capBot:{hex:P.coatDk, lift:0.0}});
  // buttoned front placket (a vertical row of small gold dots down the coat front)
  {
    const zs=[[L.chestY,0.158],[0.92,0.170],[L.waistY,0.148],[0.62,0.198],[0.40,0.212],[0.20,0.222]];
    for(const [y,z] of zs){
      quad(V(-0.009,y-0.009,z), V(0.009,y-0.009,z), V(0.009,y+0.009,z-0.004), V(-0.009,y+0.009,z-0.004), P.gold, 0.03);
    }
  }

  /* CONTRASTING COLLAR BAND — a slate ring at the neckline, standing proud of the coat */
  stack([
    {y:L.neckY-0.05, rx:0.098, rz:0.090, hex:P.collar},
    {y:L.neckY+0.005,rx:0.092, rz:0.084, hex:P.collar},
  ], 8, {capTop:{hex:P.collarDk, lift:0.006}});

  /* SHORT SHOULDER CAPE — off BOTH shoulders (unlike the bard's one-shoulder drape): a short
     hanging shell that sits PROUD of the coat (wider radii than the trunk at the same heights),
     draping from the shoulder line down past the shoulder blades, front-open at the chest so the
     coat placket/chain still read. Authored before the chain so the chain sits visibly on top. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.shldY+0.035, rx:0.270, rz:0.205, hex:P.cape},
      {y:L.chestY+0.01, rx:0.290, rz:0.220, hex:P.cape},
      {y:0.90,          rx:0.270, rz:0.205, hex:P.capeDk},
      {y:0.80,          rx:0.235, rz:0.180, hex:P.capeDk},
    ];
    const faceCols=[1,2];   // open the front so the coat placket still reads
    const skip={0:faceCols, 1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,-0.015), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[0], V(0, L.shldY+0.075, -0.02), P.cape);
    // two small gold clasps at the front where the cape gathers on each side of the chest
    for(const s of [-1,1]){
      quad(V(s*0.16,L.shldY+0.005,0.175), V(s*0.185,L.shldY+0.005,0.178), V(s*0.185,L.shldY+0.045,0.172), V(s*0.16,L.shldY+0.045,0.169), P.gold, 0.02);
    }
  }

  /* GOLD CHAIN ACCENT — a single draped chain across the chest, OVER the cape's open front
     (chain-of-office read), hanging low enough to clear the cape collar and read against the coat */
  {
    const aY=L.shldY+0.01, aZL=0.185, aZR=-0.185, dropY=L.chestY-0.06, dropZ=0.205;
    const chainPts=[
      V(-0.155, aY, aZL), V(-0.09, dropY-0.02, dropZ*0.85), V(0.0, dropY, dropZ), V(0.09, dropY-0.02, dropZ*0.85), V(0.155, aY, aZR),
    ];
    for(let i=0;i<chainPts.length-1;i++){
      tube(chainPts[i], chainPts[i+1], 0.010, 0.010, 5, P.gold);
    }
    // a small medallion at the drop point, proud of the chest
    const med=ring(V(0, dropY-0.02, dropZ+0.018), V(0,0,1), 0.028,0.028,8);
    capFan(med, V(0,dropY-0.02,dropZ+0.032), P.goldDk);
  }

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts of this ring are 1 & 2 — the
     humanoid.js HOUSE EYE STANDARD, copied exactly. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.082, rz:0.088, hex:P.skin},
      {y:L.cheekY, rx:0.112, rz:0.108, hex:P.skin},
      {y:L.browY,  rx:0.116, rz:0.106, hex:P.skin},
      {y:L.crownY, rx:0.090, rz:0.082, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.012), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.022;           /* nose ridge on the front verts */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.008), P.skinDk);
    /* eyes — two SMALL intentional quads flanking the nose, proud of the face surface
       (Adam 2026-07-03: "smaller and more intentional, not shaded eye polys"). House standard. */
    for(const s of [-1,1]){
      const ex=s*0.054, ey=(L.cheekY+L.browY)/2-0.004, ez=0.126;
      quad(V(ex-0.014,ey-0.010,ez), V(ex+0.014,ey-0.010,ez),
           V(ex+0.014,ey+0.012,ez-0.006), V(ex-0.014,ey+0.012,ez-0.006), P.eye, 0.0);
    }
  }

  /* SLICKED-BACK HAIR — a simple close cap (no hood, so the upright chin-high posture reads clean) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.01, rx:0.112, rz:0.100, hex:P.hair},
      {y:L.crownY+0.015,rx:0.096, rz:0.086, hex:P.hair},
      {y:L.headTopY+0.008,rx:0.070,rz:0.062,hex:P.hairDk},
    ];
    const skip={0:[1,2],1:[1,2]};   // open the front so the face still reads
    const rings=bands.map(b=>ring(V(0,b.y,-0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings.at(-1), V(0,L.headTopY+0.035,-0.01), P.hairDk);
  }

  /* arms — RIGHT hand DERIVED from the cane grip (gloved fist wrapped around the shaft);
     LEFT hand hangs relaxed at the side, also gloved. */
  {
    const S=V(L.shoulderX-0.01, L.shldY-0.01, 0.01);
    const E=V(0.305, 0.905, 0.055);
    const WRIST=GRIP.clone().addScaledVector(CANE_DIR,0.065);
    tube(S,E,0.072,0.058,6,P.coat);
    tube(E,WRIST,0.054,0.046,6,P.collarDk,{capB:{hex:P.glove}});   // cuff sleeve to the wrist
    tube(GRIP.clone().addScaledVector(CANE_DIR,-0.05), WRIST.clone().addScaledVector(CANE_DIR,0.01), 0.050,0.046,6,P.glove, {capA:{hex:P.gloveDk}, capB:{hex:P.gloveDk}});

    const S2=V(-L.shoulderX+0.01, L.shldY-0.01, 0.01), E2=V(-0.30,0.86,0.03), W2=V(-0.275,0.685,0.04);
    tube(S2,E2,0.072,0.058,6,P.coat);
    tube(E2,W2,0.054,0.044,6,P.collarDk,{capB:{hex:P.glove}});
    tube(W2, W2.clone().add(V(0.0,-0.075,0.01)), 0.042,0.036,6,P.glove, {capB:{hex:P.gloveDk}});
  }

  /* CUFF BANDS — contrasting slate bands at both wrists (matches the collar band material) */
  {
    const cR=GRIP.clone().addScaledVector(CANE_DIR,0.05);
    stack([{y:cR.y-0.018, rx:0.052, rz:0.046, cx:cR.x, cz:cR.z, hex:P.collar},{y:cR.y+0.012, rx:0.050, rz:0.044, cx:cR.x, cz:cR.z, hex:P.collar}], 6, {});
    const cL=V(-0.275,0.685,0.04);
    stack([{y:cL.y-0.018, rx:0.050, rz:0.044, cx:cL.x, cz:cL.z, hex:P.collar},{y:cL.y+0.012, rx:0.048, rz:0.042, cx:cL.x, cz:cL.z, hex:P.collar}], 6, {});
  }

  /* legs — narrow, upright stance (no brace — noble stands composed, weight on the cane) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.135,0.40,0.03), ankL=V(-0.14,0.085,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.145,0.40,0.02), ankR=V( 0.15,0.085,0.01);
    tube(hipL,kneeL,0.078,0.056,6,P.trouser);
    tube(kneeL,ankL,0.052,0.038,6,P.trouser);
    tube(hipR,kneeR,0.078,0.056,6,P.trouser);
    tube(kneeR,ankR,0.052,0.038,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.03,0,1)], [ankR,V(0.05,0,1)]]){
      stack([
        {y:0.012, rx:0.062, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.056, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.125), 0.050,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.044, rbz:0.032});
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
