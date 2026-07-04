/* dev/model-qa/creatures/druid.js — the wild-shape-adjacent nature priest landmark table
   (whole-object probe). Same whole-object grammar as humanoid.js/mage.js/cleric_fable.js: the
   ENTIRE creature is one function of shared primitives, every vertex in one model frame, no
   anchors. The GNARLED STAFF is authored FIRST — a knobbly tube with a forked crook at the top —
   so the gripping hand derives from the crook's cross-brace. Silhouette-first: an antler/branch
   headdress rising off a hide cowl, a layered hide+leaf mantle over ratty uneven-hemmed robes
   (earthier and rougher than the wizard's floor robe), small bone charms hanging at the belt.
   The read vs the wizard is ORGANIC vs TAILORED: antlers + crooked knobbly staff vs a pointed hat
   + a dead-straight staff. Imported by whole-body-probe.html (render) and export-obj.mjs. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDruid(){
  /* ---------- PALETTE (VS desaturated — mosses, bark browns, bone) ---------- */
  const P = {
    hide:0x6b5a3c, hideDk:0x4d4029, hideLt:0x7f6d4a,          /* rough hide mantle */
    robe:0x5a5432, robeDk:0x413d24, robeLt:0x6d6640,          /* mossy-drab under-robe */
    leaf:0x5c6b3a, leafDk:0x424e29,                           /* leaf-layer accents on the mantle */
    bark:0x5c4325, barkDk:0x3f2e19, barkLt:0x715334,          /* the staff */
    antler:0xcbbfa0, antlerDk:0x9a8e6f,                       /* antlers/headdress branches */
    bone:0xe4dcc4, boneDk:0xb0a882,                           /* belt charms */
    skin:0xa9825e, skinDk:0x76573c, eye:0x1a1512,
    cowl:0x453824, cowlDk:0x2f2618,
    cord:0x6b5535, disc:0x453a2c, discTop:0x554836,           /* mossier disc than the tailored classes */
  };

  /* ---------- LANDMARKS (weathered wanderer, ~4.6 heads) ---------- */
  const L = {
    hemY:0.06, kneeY:0.40, waistY:0.79, chestY:1.00, shldY:1.08, neckY:1.125,
    shoulderX:0.220,
    jawY:1.155, cheekY:1.225, browY:1.30, crownY:1.385, headTopY:1.44,
  };

  /* ===================== GNARLED STAFF FIRST — ground truth the hand meets ===================== */
  /* Taller than the figure (headTopY≈1.44), a knobbly shaft with a forked crook/branch-Y at the
     top — NOT a smooth wizard rod. The hand grips a cross-brace low in the fork. */
  const ST_BASE = V(-0.335, 0.02, 0.24);
  const ST_TOP  = V(-0.285, 1.72, 0.145);
  const SDIR = new THREE.Vector3().subVectors(ST_TOP, ST_BASE).normalize();
  const GRIP = ST_BASE.clone().lerp(ST_TOP, 0.60);              // where the fist wraps the shaft
  {
    /* knobbly shaft: NOT a single smooth tube — several slightly-offset segments with knob
       bulges at the joints, so the silhouette reads gnarled rather than a straight dowel. */
    const knots = [0, 0.16, 0.34, 0.52, 0.70, 0.85, 1.0];
    const jitter = [ [0.012,-0.008], [-0.010,0.014], [0.014,0.006], [-0.008,-0.012], [0.010,0.010], [-0.006,0.004], [0,0] ];
    const pts = knots.map((t,i)=> ST_BASE.clone().lerp(ST_TOP, t).add(V(jitter[i][0], 0, jitter[i][1])) );
    for(let i=0;i<pts.length-1;i++){
      const rA = 0.026 - i*0.0022, rB = 0.026 - (i+1)*0.0022;
      tube(pts[i], pts[i+1], Math.max(rA,0.010), Math.max(rB,0.010), 6, i%2?P.bark:P.barkLt);
    }
    /* knob rings at interior joints (a slightly fatter ring stitched into the tube run —
       reads as bark knuckles along the shaft) */
    for(let i=1;i<pts.length-1;i++){
      const r = 0.030 - i*0.002;
      const rgA = ring(pts[i].clone().addScaledVector(SDIR,-0.018), SDIR, r*0.7, r*0.7, 6);
      const rgB = ring(pts[i], SDIR, r, r, 6);
      const rgC = ring(pts[i].clone().addScaledVector(SDIR, 0.018), SDIR, r*0.7, r*0.7, 6);
      stitch([rgA,rgB,rgC], ()=>P.barkDk);
    }
    /* the FORKED CROOK at the top: two branches splitting from the last shaft point, curving
       outward — the "crook" a shepherd/druid staff reads by. */
    const forkBase = pts.at(-1);
    for(const s of [-1,1]){
      const mid = forkBase.clone().addScaledVector(SDIR,0.10).add(V(s*0.055,0.04,s*0.01));
      const tip = forkBase.clone().addScaledVector(SDIR,0.20).add(V(s*0.145,0.11,s*0.03));
      tube(forkBase, mid, 0.017,0.013,6,P.bark);
      tube(mid, tip, 0.013,0.007,6,P.barkLt, {capB:{hex:P.barkDk}});
      /* a couple of small twig nubs off the fork for the "branch" read */
      const nub = mid.clone().add(V(s*0.03,0.02,-0.02));
      tube(mid, nub, 0.007,0.003,4,P.barkDk,{capB:{hex:P.barkDk}});
    }
    /* GRIP cross-brace: a short horizontal bar the fist wraps, low in the fork, true to GRIP */
    const gu = new THREE.Vector3().crossVectors(V(0,1,0),SDIR).normalize();
    tube(GRIP.clone().addScaledVector(gu,-0.01), GRIP.clone().addScaledVector(gu,0.01), 0.024,0.024,6,P.bark);
    /* a hanging leather binding + feather/charm just below the fork, for texture */
    tube(forkBase.clone().add(V(0,-0.01,0.02)), forkBase.clone().add(V(0.01,-0.09,0.05)), 0.010,0.004,4,P.cord,{capB:{hex:P.bone}});
  }

  /* ===================== ROBE — ratty, uneven-hemmed under-layer (hips -> neck) ===================== */
  stack([
    {y:L.hemY,   rx:0.235, rz:0.190, hex:P.robeDk},
    {y:L.kneeY,  rx:0.205, rz:0.165, hex:P.robe},
    {y:0.58,     rx:0.182, rz:0.148, hex:P.robe},
    {y:L.waistY, rx:0.160, rz:0.128, hex:P.robe},
    {y:L.chestY, rx:0.185, rz:0.142, hex:P.robeLt},
    {y:L.shldY,  rx:0.190, rz:0.130, hex:P.robe},
    {y:L.neckY,  rx:0.076, rz:0.070, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* UNEVEN HEM — ragged bottom edge (alternating drop-lengths, NOT a clean flare like the mage) */
  {
    const n=8, ph=Math.PI/n;
    const hemTop = ring(V(0,L.hemY+0.03,0), V(0,1,0), 0.245, 0.198, n, ph);
    const dropPattern = [0.0, -0.045, -0.012, -0.058, -0.02, -0.05, 0.0, -0.03];
    const hemBot = ring(V(0,L.hemY+0.03,0), V(0,1,0), 0.258, 0.208, n, ph).map((p,i)=>{
      p.y += dropPattern[i]; return p;
    });
    stitch([hemTop, hemBot], ()=>P.robeDk);
    capFan(hemBot, V(0,L.hemY-0.05,0), P.robeDk, true);
  }

  /* belt + a few small BONE CHARMS hanging off it (druid's pouch-and-charms read) */
  stack([
    {y:0.735, rx:0.168, rz:0.134, hex:P.cord},
    {y:0.775, rx:0.165, rz:0.131, hex:P.cord},
  ], 8, {});
  {
    /* small hide pouch at the hip */
    blob(0.145, 0.68, 0.115, 0.048, 0.055, 0.038, P.hideDk, 6, 4);
    /* three bone charms dangling on cords */
    for(const [ox,oz] of [[-0.10,0.13],[-0.06,0.145],[-0.02,0.135]]){
      const top=V(ox,0.735,oz), bot=V(ox+0.005,0.635,oz+0.01);
      tube(top,bot,0.006,0.006,4,P.cord);
      const charmR = ring(bot, V(0,1,0), 0.018,0.018,5);
      capFan(charmR, bot.clone().add(V(0,-0.022,0)), P.bone);
      capFan(charmR, bot.clone().add(V(0,0.006,0)), P.boneDk, true);
    }
  }

  /* ===================== LAYERED HIDE/LEAF MANTLE — over the shoulders, uneven points ============ */
  {
    const n=8, ph=Math.PI/n;
    const mantleBands=[
      {y:0.935, rx:0.270, rz:0.205, hex:P.hideDk},
      {y:1.03,  rx:0.245, rz:0.180, hex:P.hide},
      {y:1.10,  rx:0.215, rz:0.152, hex:P.hideLt},
    ];
    const rings = mantleBands.map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    /* drop the lowest ring unevenly (ragged mantle points, echoing the hem) */
    const mantleDrop=[0.0,-0.06,-0.02,-0.08,0.0,-0.05,-0.015,-0.07];
    rings[0].forEach((p,i)=>{ p.y += mantleDrop[i]; });
    stitch(rings, (b)=>mantleBands[b].hex);
    /* a few leaf-tone accent quads scattered on the mantle face (patchwork leaves sewn in) */
    for(const [i,yy,zz] of [[1,1.04,0.16],[4,1.05,-0.14],[6,0.99,0.10]]){
      const c=V(Math.cos(ph+i*Math.PI*2/n)*0.20, yy, Math.sin(ph+i*Math.PI*2/n)*0.145+zz*0.15);
      quad(c.clone().add(V(-0.03,0.02,0.01)), c.clone().add(V(0.03,0.018,0.012)),
           c.clone().add(V(0.02,-0.03,0.01)), c.clone().add(V(-0.02,-0.028,0.008)), P.leaf, 0.05);
    }
  }

  /* ===================== HEAD (skin loft; nose pushed; eyes painted) ===================== */
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
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);
    /* eyes — two SMALL intentional quads flanking the nose, proud of the face surface (the
       house ruling: small + deliberate, not a shaded full-band eye poly that reads as a void). */
    for(const s of [-1,1]){
      const ex=s*0.048, ey=(L.cheekY+L.browY)/2-0.004, ez=0.114;
      quad(V(ex-0.012,ey-0.009,ez), V(ex+0.012,ey-0.009,ez),
           V(ex+0.012,ey+0.010,ez-0.006), V(ex-0.012,ey+0.010,ez-0.006), P.eye, 0.0);
    }
  }

  /* ===================== HIDE COWL — low, open-faced, sitting under the antlers ===================== */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.004, rx:0.098, rz:0.094, hex:P.cowlDk},
      {y:L.jawY+0.008,  rx:0.128, rz:0.118, hex:P.cowl},
      {y:L.browY-0.01,  rx:0.132, rz:0.120, hex:P.cowl},
      {y:L.crownY+0.01, rx:0.100, rz:0.092, hex:P.cowl},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.005), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.015);
    stitch(rings, b=>bands[b].hex, skip);
    /* ragged cowl edge (a couple of hide points, not a clean rim) instead of a full cap */
    capFan(rings[3], V(0.01, L.headTopY+0.02, -0.025), P.cowlDk);
    const inner=bands.map(b=>ring(V(0,b.y,0.005), V(0,1,0), b.rx-0.016, b.rz-0.016, n, ph));
    inner[3].forEach(p=>p.z-=0.015);
    for(let b=1;b<3;b++) for(const edge of [0,3])
      quad(rings[b][edge], inner[b][edge], inner[b+1][edge], rings[b+1][edge], P.cowlDk, 0.03);
  }

  /* ===================== ANTLER / BRANCH HEADDRESS — two branching tube-pairs off the cowl ======= */
  {
    /* base antler stubs rise from the crown of the cowl, then each forks into two tines */
    for(const s of [-1,1]){
      const root = V(s*0.052, L.crownY+0.03, -0.01);
      const mainTip = root.clone().add(V(s*0.045, 0.185, -0.025));
      tube(root, mainTip, 0.017,0.010,6,P.antlerDk);
      /* first fork, roughly a third up the main beam */
      const fork1Base = root.clone().lerp(mainTip, 0.38);
      const fork1Tip = fork1Base.clone().add(V(s*0.085, 0.075, 0.055));
      tube(fork1Base, fork1Tip, 0.010,0.005,5,P.antler,{capB:{hex:P.antler}});
      /* second fork, two-thirds up */
      const fork2Base = root.clone().lerp(mainTip, 0.68);
      const fork2Tip = fork2Base.clone().add(V(s*0.070, 0.095, -0.045));
      tube(fork2Base, fork2Tip, 0.009,0.004,5,P.antler,{capB:{hex:P.antler}});
      /* main beam continues to a tapered tip past the second fork */
      tube(fork2Base, mainTip, 0.009,0.005,5,P.antler,{capB:{hex:P.antler}});
      /* a couple of tiny snag-nub tines for texture (the "gnarled branch" read) */
      const snagBase = root.clone().lerp(mainTip, 0.16);
      tube(snagBase, snagBase.clone().add(V(s*0.03,0.03,0.03)), 0.006,0.003,4,P.antlerDk,{capB:{hex:P.antlerDk}});
    }
  }

  /* ===================== ARMS — RIGHT to the staff grip, LEFT to a lower grip near the belt ======= */
  {
    /* the shaft's local perpendicular ("wrap") axis at any height — the direction a fist must
       run along to read as wrapped AROUND the shaft rather than a rod running beside it */
    const gu = new THREE.Vector3().crossVectors(V(0,1,0), SDIR).normalize();
    const shaftAt = (t)=> ST_BASE.clone().lerp(ST_TOP, t);

    /* right: shoulder -> elbow -> wrist at GRIP (fist wraps the cross-brace) */
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(-0.10, 0.92, 0.10);
    const W=GRIP.clone().addScaledVector(gu, 0.028);
    tube(S,E,0.066,0.052,6,P.robe);
    tube(E,W,0.048,0.040,6,P.hideDk,{capB:{hex:P.hideDk}});
    /* fist tube runs ALONG gu (perpendicular to the shaft), centered ON the shaft point, so it
       reads as a knuckle wrapped around the pole in every view instead of a rod beside it */
    tube(GRIP.clone().addScaledVector(gu,-0.040), GRIP.clone().addScaledVector(gu,0.040), 0.044,0.040,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    /* left: reaches DOWN to a second, lower grip on the shaft near the belt/pouch height (a
       genuine two-handed hold on the staff — not a loose hang) */
    const LOW_T = 0.34;                                    // ~belt height on the shaft
    const LOW = shaftAt(LOW_T);
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02), E2=V(-0.235,0.82,0.05);
    const W2 = LOW.clone().addScaledVector(gu, -0.026);
    tube(S2,E2,0.066,0.052,6,P.robe);
    tube(E2,W2,0.058,0.044,6,P.hideDk,{capB:{hex:P.hide}});
    /* fist wraps the shaft the same way as the upper hand: along gu, centered on the shaft */
    tube(LOW.clone().addScaledVector(gu,-0.036), LOW.clone().addScaledVector(gu,0.036), 0.038,0.034,6,P.skin,
         {capA:{hex:P.skinDk}, capB:{hex:P.skinDk}});
  }

  /* ===================== LEGS — visible below the ragged robe hem, worn wraps + sandal-boots ===== */
  {
    for(const s of [-1,1]){
      const top=V(s*0.10, 0.30, 0.010), ank=V(s*0.11, 0.085, 0.020);
      tube(top, ank, 0.052, 0.040, 6, P.robeDk);
      /* worn wrap-boots (lower + rougher than the tailored classes' boots) */
      stack([
        {y:0.012, rx:0.058, rz:0.064, cx:ank.x, cz:ank.z, hex:P.hideDk},
        {y:0.075, rx:0.052, rz:0.054, cx:ank.x, cz:ank.z, hex:P.hide},
        {y:0.13,  rx:0.056, rz:0.056, cx:ank.x, cz:ank.z, hex:P.hideDk},
      ], 6, {capTop:{hex:P.hideDk, lift:0.005}, capBot:{hex:P.hideDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=V(s*0.12,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.12), 0.050,0.038,6,P.hideDk, {capB:{hex:P.hideDk, lift:0.012}, raz:0.044, rbz:0.030});
    }
  }

  /* base disc (mossier tone than the tailored classes) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
