/* dev/model-qa/creatures/cleric_fable.js — the holy warrior-priest landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js / mage.js: the ENTIRE creature is one function of shared
   primitives, every vertex in one model frame, no anchors. The MACE is authored first so the raised
   fist is fitted to the haft axis (grip true by construction); the shield hand is then fitted to the
   shield's back face. Silhouette-first: a tall MITRE (thin left-right, long front-back — nothing like
   the mage's cone), a knee-length vestment skirt over visible boots (between the fighter's tunic and
   the mage's floor robe), a hanging tabard with a raised cross, a shoulder mantle, a flanged mace
   held high beside the head, and a round shield on the left arm — the read that says "cleric" even
   under a flat PS1 tint. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildCleric(){
  /* ---------- PALETTE (VS desaturated; carried as vertex color into the OBJ) ---------- */
  const P = {
    vest:0xc9bfa2, vestDk:0x968c72, vestLt:0xddd4b8,        /* cream vestment cloth */
    tabard:0x7a2f2b, tabardDk:0x5c2421,                     /* deep oxblood tabard */
    gold:0xb08d46, goldDk:0x7d6432,                         /* holy trim / the cross */
    mail:0x8d949a, mailDk:0x62686d,                         /* chain under the cloth */
    skin:0xc49a72, skinDk:0x8a6a4e, eye:0x1a1512,
    wood:0x5a4326, steel:0x9aa1a6, steelDk:0x6b7176,
    boot:0x3c3226, leather:0x4e3d2a, trouser:0x50483c,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (broad-chested priest, ~4.5 heads) ---------- */
  const L = {
    hipY:0.70, waistY:0.80, ribY:0.92, chestY:1.03, shldY:1.10, neckY:1.145,
    shoulderX:0.240, hipHalf:0.11,
    jawY:1.175, cheekY:1.25, browY:1.325, crownY:1.415, headTopY:1.475,
  };

  /* trunk (one loft, hips→neck; mailed chest under the vestment) */
  stack([
    {y:L.hipY,   rx:0.200, rz:0.150, hex:P.mailDk},
    {y:L.waistY, rx:0.172, rz:0.132, hex:P.mail},
    {y:L.ribY,   rx:0.205, rz:0.152, hex:P.mail},
    {y:L.chestY, rx:0.228, rz:0.162, hex:P.mail},
    {y:L.shldY,  rx:0.232, rz:0.152, hex:P.mail},
    {y:L.neckY,  rx:0.082, rz:0.078, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* VESTMENT SKIRT — knee-length (hem ~0.30): boots show below = warrior-priest, not robed mage */
  stack([
    {y:0.30, rx:0.245, rz:0.200, hex:P.vestDk},
    {y:0.46, rx:0.225, rz:0.180, hex:P.vest},
    {y:0.62, rx:0.210, rz:0.165, hex:P.vest},
    {y:0.76, rx:0.195, rz:0.150, hex:P.vestLt},
  ], 8, {});
  /* gold hem band on the skirt lip */
  stack([
    {y:0.285, rx:0.250, rz:0.205, hex:P.goldDk},
    {y:0.325, rx:0.243, rz:0.198, hex:P.gold},
  ], 8, {});

  /* belt (cinches vestment over mail) */
  stack([
    {y:0.775, rx:0.188, rz:0.148, hex:P.leather},
    {y:0.835, rx:0.184, rz:0.144, hex:P.leather},
  ], 8, {});

  /* TABARD — flat panels hanging front and back over the vestment, cross raised on the front */
  {
    /* front panel (+z), slight outward flare toward the hem */
    const fp=[[1.04,0.170],[0.86,0.176],[0.66,0.186],[0.44,0.198],[0.30,0.208]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.105,y2,z2), V(0.105,y2,z2), V(0.105,y1,z1), V(-0.105,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    /* back panel (−z), reversed winding so it faces backward */
    const bp=[[1.04,-0.160],[0.78,-0.172],[0.52,-0.188],[0.30,-0.200]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,z1]=bp[i], [y2,z2]=bp[i+1];
      quad(V(0.105,y2,z2), V(-0.105,y2,z2), V(-0.105,y1,z1), V(0.105,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    /* THE CROSS — raised gold boxes proud of the front panel (silhouette-visible from the side) */
    const zAt=y=>{ for(let i=0;i<fp.length-1;i++){ const [y1,z1]=fp[i],[y2,z2]=fp[i+1];
      if(y<=y1&&y>=y2) return z1+(z2-z1)*(y1-y)/(y1-y2); } return 0.20; };
    const bar=(x1,x2,y1,y2)=>{                       /* small extruded box on the panel */
      const d=0.022, zA=zAt(y1)+0.004, zB=zAt(y2)+0.004;
      quad(V(x1,y2,zB+d), V(x2,y2,zB+d), V(x2,y1,zA+d), V(x1,y1,zA+d), P.gold, 0.02);   /* face */
      quad(V(x1,y1,zA), V(x2,y1,zA), V(x2,y1,zA+d), V(x1,y1,zA+d), P.goldDk, 0.02);     /* top */
      quad(V(x2,y2,zB), V(x1,y2,zB), V(x1,y2,zB+d), V(x2,y2,zB+d), P.goldDk, 0.02);     /* bottom */
      quad(V(x1,y2,zB), V(x1,y1,zA), V(x1,y1,zA+d), V(x1,y2,zB+d), P.goldDk, 0.02);     /* left */
      quad(V(x2,y1,zA), V(x2,y2,zB), V(x2,y2,zB+d), V(x2,y1,zA+d), P.goldDk, 0.02);     /* right */
    };
    bar(-0.028, 0.028, 0.94, 0.52);                  /* vertical beam */
    bar(-0.082, 0.082, 0.86, 0.79);                  /* crossbeam, high like a holy cross */
  }

  /* SHOULDER MANTLE — a short cape shell over the shoulders (priestly mass up top) */
  stack([
    {y:0.97,  rx:0.295, rz:0.225, hex:P.vestDk},
    {y:1.06,  rx:0.268, rz:0.198, hex:P.vest},
    {y:1.125, rx:0.240, rz:0.168, hex:P.vestLt},
  ], 8, {});

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts of this ring are 1 & 2. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.080, rz:0.086, hex:P.skin},
      {y:L.cheekY, rx:0.110, rz:0.106, hex:P.skin},
      {y:L.browY,  rx:0.114, rz:0.104, hex:P.skin},
      {y:L.crownY, rx:0.088, rz:0.080, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.020;          /* nose ridge on the front verts */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);
    /* eyes — two SMALL intentional quads flanking the nose, proud of the pushed face plane
       (Adam 2026-07-03: "smaller and more intentional, not shaded eye polys"). The nose-ridge
       push bulges the front face plane forward at this band, so z is taken proud of the PUSHED
       ring z (0.010+0.020=0.030 base), not the un-pushed ellipse — else the eyes end up buried. */
    for(const s of [-1,1]){
      const ex=s*0.052, ey=(L.cheekY+L.browY)/2-0.004, ez=0.030+0.106+0.004;   /* pushed-plane z + proud offset */
      quad(V(ex-0.013,ey-0.0105,ez), V(ex+0.013,ey-0.0105,ez),
           V(ex+0.013,ey+0.0105,ez-0.006), V(ex-0.013,ey+0.0105,ez-0.006), P.eye, 0.0);
    }
  }

  /* MITRE — the bishop's hat: a gold base band, then a tall blade that stays LONG front-to-back
     while pinching thin left-to-right, up to a high ridge peak. Front = tall triangle; side = broad
     shield-shape — unmistakable, and nothing like the mage's drooping cone. */
  {
    const n=10, ph=Math.PI/n;
    /* base band (gold circlet hugging the brow) */
    const bandLo=ring(V(0,L.browY+0.000,0.0), V(0,1,0), 0.134, 0.124, n, ph);
    const bandHi=ring(V(0,L.browY+0.055,0.0), V(0,1,0), 0.132, 0.124, n, ph);
    stitch([bandLo,bandHi], ()=>P.gold);
    capFan(bandLo, V(0,L.browY-0.012,0.0), P.goldDk, true);       /* underside */
    /* the blade: x narrows fast, z holds */
    const body=[
      {y:L.browY+0.055, rx:0.132, rz:0.124},
      {y:1.470,         rx:0.104, rz:0.122},
      {y:1.600,         rx:0.062, rz:0.108},
      {y:1.720,         rx:0.024, rz:0.078},
    ].map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(body, ()=>P.vestLt);
    capFan(body.at(-1), V(0,1.800,0.0), P.vestLt);                /* the ridge peak */
    /* gold front stripe running up the mitre face (+z), tracking the shrinking rz */
    const fs=[[1.385,0.126],[1.500,0.120],[1.620,0.102],[1.710,0.080]];
    for(let i=0;i<fs.length-1;i++){
      const [y1,z1]=fs[i], [y2,z2]=fs[i+1];
      quad(V(-0.020,y1,z1+0.006), V(0.020,y1,z1+0.006), V(0.016,y2,z2+0.006), V(-0.016,y2,z2+0.006), P.gold, 0.02);
    }
    /* lappets — the two ribbons hanging from the back of the mitre */
    for(const s of [-1,1]){
      const zb=-0.118;
      quad(V(s*0.062,1.335,zb), V(s*0.020,1.335,zb-0.006), V(s*0.016,1.10,zb-0.030), V(s*0.052,1.10,zb-0.024), P.gold, 0.03);
    }
  }

  /* MACE FIRST — raised high beside the head; the grip is the ground truth the arm must meet */
  const M_BUTT=V(0.335,0.700,0.185), M_TOP=V(0.385,1.340,0.100);
  const AXIS=new THREE.Vector3().subVectors(M_TOP,M_BUTT).normalize();
  const GRIP=M_BUTT.clone().addScaledVector(AXIS,0.215);          /* fist center on the haft */
  {
    /* haft (wood, leather wrap at the grip zone) */
    tube(M_BUTT, GRIP.clone().addScaledVector(AXIS,-0.065), 0.020,0.021,6,P.wood,{capA:{hex:P.steelDk, lift:0.02}});
    tube(GRIP.clone().addScaledVector(AXIS,-0.065), GRIP.clone().addScaledVector(AXIS,0.065), 0.022,0.022,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.065), M_TOP.clone().addScaledVector(AXIS,-0.130), 0.021,0.019,6,P.wood);
    /* neck flare into the head */
    tube(M_TOP.clone().addScaledVector(AXIS,-0.130), M_TOP.clone().addScaledVector(AXIS,-0.015), 0.019,0.052,6,P.steelDk);
    /* the head — a steel drum... */
    tube(M_TOP.clone().addScaledVector(AXIS,-0.015), M_TOP.clone().addScaledVector(AXIS,0.115), 0.060,0.052,6,P.steel,
         {capA:{hex:P.steelDk}, capB:{hex:P.steelDk, lift:0.030}});
    /* ...with 4 radial FLANGES (thin fins — the read that says mace, not staff) */
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const cLo=M_TOP.clone().addScaledVector(AXIS,-0.005), cHi=M_TOP.clone().addScaledVector(AXIS,0.105);
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2 + Math.PI/4;
      const d=u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a));
      const t=new THREE.Vector3().crossVectors(AXIS,d).normalize().multiplyScalar(0.007);
      const iA=cLo.clone().addScaledVector(d,0.050), iB=cHi.clone().addScaledVector(d,0.046);
      const oA=cLo.clone().addScaledVector(d,0.118), oB=cHi.clone().addScaledVector(d,0.098);
      quad(iA.clone().add(t), oA.clone().add(t), oB.clone().add(t), iB.clone().add(t), P.steel, 0.03);
      quad(iB.clone().sub(t), oB.clone().sub(t), oA.clone().sub(t), iA.clone().sub(t), P.steel, 0.03);
      quad(oA.clone().add(t), oA.clone().sub(t), oB.clone().sub(t), oB.clone().add(t), P.steelDk, 0.03);
    }
  }

  /* RIGHT ARM — mailed sleeve rising to the mace; fist DERIVED from the grip */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const W=GRIP.clone().add(V(-0.028,0.050,-0.045));            /* wrist tucked behind the fist */
    const E=V(0.305,1.005,0.055);
    tube(S,E,0.080,0.064,6,P.mail);
    tube(E,W,0.058,0.048,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,-0.055), GRIP.clone().addScaledVector(AXIS,0.055),
         0.052,0.048,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* SHIELD FIRST (left side) — a round targe angled out-forward; the left hand meets its back */
  const SC=V(-0.360,0.840,0.105);
  const SN=V(-0.800,0.060,0.470).normalize();                    /* shield normal: out-left, forward */
  {
    const R=0.205;
    const front=ring(SC.clone().addScaledVector(SN, 0.020), SN, R, R, 12);
    const back =ring(SC.clone().addScaledVector(SN,-0.018), SN, R*0.97, R*0.97, 12);
    stitch([back,front], ()=>P.steelDk);                          /* rim */
    capFan(front, SC.clone().addScaledVector(SN,0.075), P.steel); /* domed face */
    capFan(back,  SC.clone().addScaledVector(SN,-0.032), P.steelDk, true);
    tube(SC.clone().addScaledVector(SN,0.055), SC.clone().addScaledVector(SN,0.105),
         0.052,0.030,6,P.gold,{capB:{hex:P.gold, lift:0.014}});   /* gold boss */
  }

  /* LEFT ARM — down and out to the shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.045);              /* hand at the shield grip */
    const E2=V(-0.300,0.965,0.040);
    tube(S2,E2,0.080,0.064,6,P.mail);
    tube(E2,W2,0.058,0.048,6,P.leather);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — steady stance; lower legs + boots visible under the knee-length skirt */
  {
    for(const s of [-1,1]){
      const top=V(s*L.hipHalf, 0.44, 0.010), ank=V(s*0.115, 0.085, 0.020);
      tube(top, ank, 0.058, 0.043, 6, P.trouser);
      stack([
        {y:0.012, rx:0.068, rz:0.075, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.060, rz:0.062, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.066, rz:0.066, cx:ank.x, cz:ank.z, hex:P.leather},
      ], 6, {capTop:{hex:P.leather, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=V(s*0.10,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.135), 0.055,0.042,6,P.boot,
           {capB:{hex:P.boot, lift:0.015}, raz:0.048, rbz:0.034});
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
