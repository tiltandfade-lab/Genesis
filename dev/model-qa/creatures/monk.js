/* dev/model-qa/creatures/monk.js — the unarmed martial-artist landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js/mage.js/cleric_fable.js: the ENTIRE creature is one
   function of shared primitives, every vertex in one model frame, no anchors. The monk carries no
   weapon, so the QUARTERSTAFF is authored first anyway (held diagonally, two-handed) so both fists
   are fitted to the shaft — grip true by construction. Silhouette-first: a lean minimal frame, a
   simple wrap-top gi cinched by a contrasting sash with a trailing knot, bare forearms with wrist
   wraps, cropped trousers, bare feet, a shaved head — and a wide low horse-stance that reads as
   martial-arts stance rather than "unarmed civilian" even under a flat PS1 tint. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildMonk(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    gi:0xa89670, giDk:0x7d6d50, giLt:0xbcac86,          /* undyed linen wrap-top, deeper tone so it reads as cloth not plate */
    sash:0xa8342c, sashDk:0x7a2620,                      /* contrasting red-oxide sash — brighter for silhouette pop */
    skin:0xc49a72, skinDk:0x8a6a4e, eye:0x1a1512,
    wrap:0xd8cdb0, wrapDk:0xa89b7c,                      /* wrist/shin wraps, lighter linen */
    trouser:0x4f4a3e, trouserDk:0x3a362c,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (lean frame, ~4.7 heads — taller/leaner than the fighter) ---------- */
  const L = {
    hipY:0.70, waistY:0.775, ribY:0.88, chestY:0.99, shldY:1.075, neckY:1.115,
    hipHalf:0.105, shoulderX:0.225,
    jawY:1.145, cheekY:1.215, browY:1.29, crownY:1.385, headTopY:1.45,
  };

  /* torso (lean loft, hips->neck; the gi wrap-top, no armor mass) */
  stack([
    {y:L.hipY,   rx:0.155, rz:0.120, hex:P.trouserDk},
    {y:L.waistY, rx:0.150, rz:0.112, hex:P.gi},
    {y:L.ribY,   rx:0.172, rz:0.128, hex:P.gi},
    {y:L.chestY, rx:0.188, rz:0.138, hex:P.giLt},
    {y:L.shldY,  rx:0.192, rz:0.130, hex:P.gi},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* wrap-top V-crossover (the gi's crossed front panel — a raised fold, not a dark seam,
     so it reads as wrapped cloth rather than armor plating) */
  {
    const zs=[[L.shldY-0.01,0.128],[L.chestY,0.140],[L.ribY,0.130],[L.waistY,0.118]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.09,y1,z1+0.006), V(0.005,y1,z1-0.004), V(0.02,y2,z2-0.004), V(-0.075,y2,z2+0.006), P.giLt, 0.03);
    }
  }

  /* SASH — cinched at the waist, with a trailing knot hanging at the hip. Wider band + capped
     top/bottom lips so it reads as a thick wrapped sash rather than a thin belt line. */
  stack([
    {y:L.waistY-0.045, rx:0.168, rz:0.126, hex:P.sashDk},
    {y:L.waistY-0.005, rx:0.166, rz:0.124, hex:P.sash},
    {y:L.waistY+0.035, rx:0.164, rz:0.122, hex:P.sash},
    {y:L.waistY+0.06,  rx:0.162, rz:0.120, hex:P.sashDk},
  ], 8, {capTop:{hex:P.sashDk,lift:0.006}, capBot:{hex:P.sashDk,lift:0.0}});
  /* trailing knot + tails (hangs down the left hip) */
  {
    const kc=V(-0.14,L.waistY-0.02,0.09);
    stack([
      {y:kc.y+0.03, rx:0.032, rz:0.028, cx:kc.x, cz:kc.z, hex:P.sash},
      {y:kc.y-0.01, rx:0.034, rz:0.030, cx:kc.x, cz:kc.z, hex:P.sashDk},
    ], 6, {capTop:{hex:P.sash,lift:0.01}, capBot:{hex:P.sashDk,lift:0.0}});
    tube(V(kc.x+0.01,kc.y-0.01,kc.z), V(kc.x-0.015,kc.y-0.22,kc.z-0.02), 0.020,0.010,5,P.sash,{capB:{hex:P.sashDk}});
    tube(V(kc.x-0.02,kc.y-0.01,kc.z+0.01), V(kc.x-0.04,kc.y-0.18,kc.z+0.03), 0.017,0.008,5,P.sashDk,{capB:{hex:P.sashDk}});
  }

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts of this ring are 1 & 2. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.076, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.104, rz:0.100, hex:P.skin},
      {y:L.browY,  rx:0.108, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.084, rz:0.076, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.019;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    /* SHAVED HEAD — cap the crown directly in skinDk (no hair mass), then a clearly-read topknot:
       a small bound base plus a longer dark-hair tuft leaning back, unmistakable in silhouette. */
    capFan(rings[3], V(0, L.headTopY-0.01, 0.006), P.skinDk);
    stack([
      {y:L.headTopY-0.008, rx:0.034, rz:0.032, hex:P.skinDk},
      {y:L.headTopY+0.02,  rx:0.026, rz:0.024, hex:0x2a221a},
    ], 7, {capTop:{hex:0x2a221a, lift:0.006}});
    tube(V(0,L.headTopY+0.018,-0.006), V(-0.01,L.headTopY+0.09,-0.05), 0.022,0.010,6,0x2a221a,{capB:{hex:0x2a221a}});
  }

  /* QUARTERSTAFF FIRST — held diagonally two-handed, a long tube through 3 points for a slight taper read */
  const G1=V(0.235,0.965,0.185);   /* upper (right) grip */
  const G2=V(-0.225,0.565,0.145); /* lower (left) grip — pulled forward/up off the sash-knot tails so the fist closes in open air, not behind the tassel */
  const STAFF_A=G1.clone().addScaledVector(new THREE.Vector3().subVectors(G1,G2).normalize(), 0.42);
  const STAFF_B=G2.clone().addScaledVector(new THREE.Vector3().subVectors(G2,G1).normalize(), 0.42);
  const AXIS=new THREE.Vector3().subVectors(STAFF_A,STAFF_B).normalize();
  {
    tube(STAFF_B, STAFF_A, 0.026, 0.026, 8, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
    /* leather-wrap bands at both grips (visual only, sits under the derived fists) */
    tube(G1.clone().addScaledVector(AXIS,-0.06), G1.clone().addScaledVector(AXIS,0.06), 0.030,0.030,8,P.woodDk);
    tube(G2.clone().addScaledVector(AXIS,-0.06), G2.clone().addScaledVector(AXIS,0.06), 0.030,0.030,8,P.woodDk);
  }

  /* ARMS — both fists DERIVED from the staff grips (upper/right hand forward-high, lower/left hand back-low) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const FIST1=G1.clone();
    const W=FIST1.clone().addScaledVector(AXIS,0.0).add(V(0.0,0.0,0.0));
    const E=V(0.30,0.86,0.13);
    tube(S,E,0.070,0.056,6,P.skin);
    tube(E,W,0.052,0.044,6,P.skin,{capB:{hex:P.skin}});
    tube(FIST1.clone().addScaledVector(AXIS,-0.05), FIST1.clone().addScaledVector(AXIS,0.05), 0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    /* wrist wrap band on the right forearm */
    tube(E.clone().lerp(W,0.55).add(V(0,0.01,0)), E.clone().lerp(W,0.72).add(V(0,0.01,0)), 0.050,0.048,6,P.wrap);

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const FIST2=G2.clone();
    const E2=V(-0.28,0.775,0.06);
    tube(S2,E2,0.070,0.056,6,P.skin);
    /* forearm runs to a wrist point short of the grip (leaves room for the fist bulge, no cuff/gap) */
    const WR2=E2.clone().lerp(FIST2,0.72);
    tube(E2,WR2,0.052,0.044,6,P.skin);
    /* wrist wrap band, sized UNDER the fist that follows it so it doesn't out-silhouette the hand */
    tube(E2.clone().lerp(FIST2,0.55).add(V(0,0.01,0)), WR2.clone().add(V(0,0.01,0)), 0.048,0.044,6,P.wrap);
    /* CLOSED FIST — a proper knuckle bulge straddling the grip point, wider than forearm+wrap so it
       reads as a hand gripping the shaft, not a stick continuing past the cuff */
    tube(WR2, FIST2.clone().addScaledVector(AXIS,-0.045), 0.044,0.058,6,P.skin,{capB:{hex:P.skinDk}});
    tube(FIST2.clone().addScaledVector(AXIS,-0.045), FIST2.clone().addScaledVector(AXIS,0.045), 0.058,0.052,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skin}});
  }

  /* LEGS — wide horse-stance, weight low, cropped trousers above bare ankles/feet */
  {
    const hipL=V(-0.20, L.hipY-0.01, 0.02), kneeL=V(-0.235,0.36,0.10), ankL=V(-0.225,0.075,0.055);
    const hipR=V( 0.20, L.hipY-0.01, -0.01), kneeR=V( 0.245,0.36,-0.075), ankR=V( 0.235,0.075,-0.10);
    tube(hipL,kneeL,0.082,0.060,6,P.trouser);
    tube(kneeL, kneeL.clone().lerp(ankL,0.55), 0.056,0.044,6,P.trouser);
    tube(hipR,kneeR,0.082,0.060,6,P.trouser);
    tube(kneeR, kneeR.clone().lerp(ankR,0.55), 0.056,0.044,6,P.trouser);
    /* cropped hem band (trouser ends mid-shin) + bare shin/wrap below */
    for(const [knee,ank] of [[kneeL,ankL],[kneeR,ankR]]){
      const hemA=knee.clone().lerp(ank,0.55);
      stack([
        {y:hemA.y+0.015, rx:0.050, rz:0.046, cx:hemA.x, cz:hemA.z, hex:P.trouserDk},
      ], 6, {});
      tube(hemA, ank, 0.044,0.036,6,P.skin);
      /* shin wrap band just above the ankle */
      tube(hemA.clone().lerp(ank,0.55), hemA.clone().lerp(ank,0.78), 0.040,0.038,6,P.wrap);
    }
    /* BARE FEET — flat low pads, toes suggested by a slight forward taper (no boots) */
    for(const [ank,toeDir] of [[ankL,V(0.08,0,1)], [ankR,V(0.75,0,0.35).normalize()]]){
      stack([
        {y:0.010, rx:0.058, rz:0.070, cx:ank.x, cz:ank.z, hex:P.skinDk},
        {y:0.055, rx:0.052, rz:0.058, cx:ank.x, cz:ank.z, hex:P.skin},
      ], 6, {capTop:{hex:P.skin, lift:0.004}, capBot:{hex:P.skinDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.105), 0.048,0.030,6,P.skin, {capB:{hex:P.skinDk, lift:0.012}, raz:0.042, rbz:0.026});
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
