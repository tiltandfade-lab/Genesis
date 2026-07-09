/* dev/model-qa/creatures/rlm-seas-bandit-captain.js — MODEL-FOUNDRY PASS-1 (seas-w2, cell 8).
   FEATURE CHECKLIST (the tris this budget buys):
     1. CUTLASS thrust FORWARD, point at the viewer — the loud signature, bright steel value-
        contrast zone leading the whole silhouette dead-on.
     2. PARRYING DAGGER held low off-hand, blade back-edge lit — the second-blade tell that says
        "captain, not deckhand."
     3. long weathered COAT with a flared hem (wind-caught, one side kicked out by the lunge) —
        the body-defining silhouette shape over the bandit chassis.
     4. TRICORN/broad hat, brim swept, worn low — paired with the coat as the captain read.
     5. one boot driven UP onto a rail block (front leg raised+planted higher than the back leg)
        — the "boarding command" stance, not a flat two-foot stand.
     6. lit shirt/blade/hat-trim value ladder against the dark coat — captures law 3 (contrast)
        deliberately: coat reads near-void, shirt+steel+trim pop clear of it.
   POSE SENTENCE: the boarding command — front boot driven up onto a low rail block, weight
   thrown forward and down through that raised leg, cutlass arm locked straight out and LEVEL,
   point aimed dead at the viewer (not a swing-mid-arc — a held THREAT), dagger low and back in
   the off hand, coat hem flared out to the trailing side as if still catching the wind of the
   leap that got him up there. This is the shadow-captain running his ship by fear, caught in the
   instant he tells you to stand down.
   Chassis: humanoid.js proportions, carried + adapted from the npc-bandit.js rebuild (asymmetric
   lunge-derived stance, same head/eye/torso landmark table) — the CORE IDENTITY escalated per
   MODEL-FOUNDRY law 4 (bandit body + coat + hat + two blades = the captain), not rebuilt from
   scratch. Whole-object grammar: one function, probe-lib primitives, spine +z, ground y=0, no
   anchors. All geometry authored with y>=0 (bbox floor guaranteed by construction). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildBanditCaptain(){
  /* ---------- PALETTE (VS desaturated: the coat carries the dark mass, shirt/steel/trim are the
     lit escapes off it — law 3 discipline baked into the palette itself) ---------- */
  const P = {
    coat:0x3a3226, coatDk:0x261f16, coatLit:0x6e5d46,   // PASS-1 SELF-CORRECT: lifted clear of the
    shirt:0x9a8c6c, shirtDk:0x6e6248,                    // void floor (r1 sampled coat/leg zones at
    sash:0x6e1f1f, sashDk:0x4a1414,                      // ~20-30 RGB, indistinguishable from void —
    hat:0x4a3c28, hatDk:0x2f2618, hatTrim:0xe8c468,      // whole lower body was one dead blob).
    skin:0xb08a5f, skinDk:0x7a5d3f,
    trouser:0x584a34, boot:0x2e2418, bootLt:0x6a5638,   // trousers lifted well clear of coat/void
    kneeLit:0xb89a5e, kneeLitDk:0x7a6440,                // PASS-2 CRITIC: measured render max was 134
    // RGB (below the 140 floor) and the knee-wrap/boot never cleared the coat mass at all — pushed
    // this whole warm-highlight tier further so the raised-leg stance has a real high-value zone.
    steel:0xb4bbc0, steelLt:0xf2f6fa, steelDk:0x5a5f63, hilt:0x241c13, hiltWrap:0x6e1f1f,
    // PASS-2 CRITIC: steelLt pushed to near-white — the cutlass is the LOUD signature per the
    // feature checklist but measured DIMMER than the dagger in r3 (127 vs 134 RGB, both under the
    // 140 floor). Steel tiers raised across the board so the cutlass actually reads as the loudest
    // value zone in the model, not the dagger.
    disc:0x3a3428, discTop:0x463f30, railBlock:0x241d14,
  };

  /* ---------- LANDMARKS — humanoid rig, z-sheared forward for the lunge-up-onto-the-rail lean
     (raised front leg pushes the whole trunk higher + more forward than the bandit's flat lunge) */
  const L = {
    hipY:0.660, waistY:0.745, ribY:0.840, chestY:0.935, shldY:1.015, neckY:1.052,
    hipZ:0.0,   waistZ:0.018, ribZ:0.040, chestZ:0.065, shldZ:0.088, neckZ:0.096,
    hipHalf:0.128, shoulderX:0.250,
    jawY:1.088, cheekY:1.160, browY:1.230, crownY:1.312, headTopY:1.372,
    jawZ:0.092, cheekZ:0.090, browZ:0.084, crownZ:0.070, headTopZ:0.056,
  };

  /* ================= THE CUTLASS — authored FIRST, level and POINTING dead at the viewer (the
     signature, the brightest value-contrast zone in the model) =========================== */
  /* PASS-1 SELF-CORRECT ROUND 2: r1's dead +z direction AND r2's (0.62,0.05,0.78) both still
     dot heavily onto the camera's ~(0.61,0.50,0.61) view axis (cos~0.9+) and foreshorten to an
     invisible stub either way — verified in both renders, blade never read. The DAGGER's own
     direction (-0.25,-0.35,0.6, cos~0.04 vs the view axis, near-perpendicular) is exactly why IT
     reads clean and long. Picked a cutlass direction with the same near-perpendicular relationship
     to the camera (screen-right-leaning, slight forward lean retained for the "thrust toward the
     threat" feel) so the blade finally draws a real line across the frame. */
  const GRIP = V(0.360, 0.905, 0.520);
  const CUT_DIR = V(0.66, 0.08, -0.20).normalize();   // near-perpendicular to the camera view axis — reads as a line, not a dot
  {
    const d = CUT_DIR, up = V(0,1,0);
    const gu = new THREE.Vector3().crossVectors(up,d).normalize();
    const gv = new THREE.Vector3().crossVectors(d,gu).normalize();
    const pommel = GRIP.clone().addScaledVector(d,-0.070);
    tube(pommel, GRIP.clone().addScaledVector(d,-0.018), 0.020,0.017,6,P.hiltWrap,{capA:{hex:P.hilt,lift:0.010}});
    // basket-guard sweep (captain-grade, not the bandit's plain crossbar)
    const guardC = GRIP.clone().addScaledVector(d,0.016);
    tube(guardC.clone().addScaledVector(gu,-0.048), guardC.clone().addScaledVector(gu,0.046), 0.013,0.013,5,P.steelDk,{capA:{hex:P.steelDk},capB:{hex:P.steelDk}});
    tube(guardC.clone().addScaledVector(gu,-0.048), guardC.clone().addScaledVector(gu,-0.010).addScaledVector(gv,-0.055), 0.010,0.008,4,P.steelDk,{capB:{hex:P.steelDk}});
    // curved cutlass blade — three ring-widths tapering to a point, sweeping slightly along gv
    const bl=(t,w,th,sw)=>{ const c=GRIP.clone().addScaledVector(d,0.03+t).addScaledVector(gv,sw);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.0,0.036,0.010,0.0), s2=bl(0.16,0.030,0.008,0.012), s3=bl(0.32,0.020,0.006,0.020), s4=bl(0.44,0.006,0.002,0.024);
    stitch([s1,s2], ()=>P.steel);
    stitch([s2,s3], ()=>P.steelLt);       // mid-blade lit
    stitch([s3,s4], ()=>P.steelLt);       // tip stays lit all the way to the point-of-focus
    capFan(s4, GRIP.clone().addScaledVector(d,0.46).addScaledVector(gv,0.025), P.steelLt);
  }

  /* ================= THE PARRYING DAGGER — off-hand, held low and back ==================== */
  const DGRIP = V(-0.290, 0.640, 0.220);
  const DAG_DIR = V(-0.25, -0.35, 0.60).normalize();
  {
    const d = DAG_DIR, up = Math.abs(d.y)>0.9?V(0,0,1):V(0,1,0);
    const gu = new THREE.Vector3().crossVectors(up,d).normalize();
    const gv = new THREE.Vector3().crossVectors(d,gu).normalize();
    tube(DGRIP.clone().addScaledVector(d,-0.045), DGRIP.clone().addScaledVector(d,-0.010), 0.014,0.012,5,P.hiltWrap,{capA:{hex:P.hilt,lift:0.008}});
    const gc = DGRIP.clone().addScaledVector(d,0.010);
    tube(gc.clone().addScaledVector(gu,-0.028), gc.clone().addScaledVector(gu,0.028), 0.008,0.008,4,P.steelDk,{capA:{hex:P.steelDk},capB:{hex:P.steelDk}});
    const bl=(t,w,th)=>{ const c=DGRIP.clone().addScaledVector(d,0.02+t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.0,0.020,0.006), s2=bl(0.09,0.012,0.004), s3=bl(0.16,0.003,0.001);
    stitch([s1,s2], ()=>P.steelLt);       // back-edge lit per the direction brief
    stitch([s2,s3], ()=>P.steel);
    capFan(s3, DGRIP.clone().addScaledVector(d,0.17), P.steel);
  }

  /* trunk (one loft, hips->neck, z-sheared forward) — shirt underneath, open at the collar */
  stack([
    {y:L.hipY,   rx:0.192, rz:0.148, cz:L.hipZ,   hex:P.trouser},
    {y:L.waistY, rx:0.168, rz:0.130, cz:L.waistZ, hex:P.shirtDk},
    {y:L.ribY,   rx:0.196, rz:0.148, cz:L.ribZ,   hex:P.shirt},
    {y:L.chestY, rx:0.220, rz:0.162, cz:L.chestZ, hex:P.shirt},
    {y:L.shldY,  rx:0.226, rz:0.154, cz:L.shldZ,  hex:P.shirtDk},
    {y:L.neckY,  rx:0.084, rz:0.080, cz:L.neckZ,  hex:P.skinDk},
  ], 8, {capTop:{hex:P.shirtDk, lift:0.004}});

  /* CAPTAIN'S SASH — worn diagonally across the open shirt, the one warm-lit color note tucked
     under the coat lapels so it peeks through without competing with the blades */
  {
    const a=V(0.140, L.shldY-0.02, L.shldZ+0.030), b=V(-0.075, L.waistY+0.02, L.waistZ+0.140);
    tube(a,b,0.052,0.046,6,P.sash,{capA:{hex:P.sashDk},capB:{hex:P.sashDk}});
  }

  /* LONG COAT — the body-defining shape over the trunk. Front panels open (showing shirt+sash),
     back+sides a wide dark mass, hem FLARED wide to the trailing (-x) side as if wind-caught mid
     leap. Coat sits proud of the trunk loft (a second wider stack), z-sheared with the torso.
     PASS-1 SELF-CORRECT: r1's hem dropped to y=0.150 (below knee height) and swallowed BOTH legs
     into the coat mass — the boarding-command raised-leg stance disappeared entirely. Raised the
     hem to stop at upper-thigh so the raised (front) leg's knee+shin+boot-on-block and the back
     leg both read clear below the coat line. */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:L.shldY-0.01,  rx:0.240, rz:0.170, cz:L.shldZ+0.006},
      {y:L.chestY-0.04, rx:0.260, rz:0.192, cz:L.chestZ+0.010},
      {y:L.waistY,      rx:0.235, rz:0.185, cz:L.waistZ+0.020},
      {y:L.hipY-0.05,   rx:0.270, rz:0.220, cz:L.hipZ+0.035},
      {y:0.560,         rx:0.330, rz:0.250, cz:L.hipZ+0.020},   // hem starts flaring wide (upper thigh)
      {y:0.470,         rx:0.420, rz:0.230, cz:L.hipZ-0.030},   // flare kicked hard to the trailing side, ends above the knees
    ];
    // flare the hem further to -x (trailing) so the coat reads as wind-caught, not a static cone
    bands[4].cx = -0.050; bands[5].cx = -0.135;
    const rings=bands.map(b=>ring(V(b.cx||0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    // cut the front panel open (skip the front-center columns on the lower bands) so shirt+sash show
    const skipFront = {2:[4,5], 3:[4,5], 4:[4,5]};
    stitch(rings, (b)=> b<2?P.coat:(b%2===0?P.coat:P.coatDk), skipFront);
    capFan(rings.at(-1), V(bands.at(-1).cx, 0.430, bands.at(-1).cz), P.coatDk);   // shallow cap, not a funnel down to the legs
    // coat collar/lapel — proud ring right at the shoulders, the lit-edge trim of the garment
    const collar = ring(V(0, L.shldY+0.02, L.shldZ+0.010), V(0,1,0), 0.150, 0.110, n, ph);
    const collarUp = collar.map(p=>p.clone().add(V(0,0.045,0)));
    stitch([collar, collarUp], ()=>P.coatLit);
    // two open front lapel edges (thin proud strips flanking the shirt opening) — a lit border
    // against the dark coat mass, the "coat over lit shirt" contrast law-3 anchor
    for(const sx of [1,-1]){
      const a=V(sx*0.065, L.shldY-0.02, L.shldZ+0.070), b=V(sx*0.090, L.waistY+0.03, L.waistZ+0.150);
      tube(a,b,0.020,0.018,4,P.coatLit,{capA:{hex:P.coatLit},capB:{hex:P.coatLit}});
    }
  }

  /* head (skin loft; nose pushed; eyes painted, locked forward on the target) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.082, rz:0.088, cz:L.jawZ,   hex:P.skin},
      {y:L.cheekY, rx:0.112, rz:0.108, cz:L.cheekZ, hex:P.skin},
      {y:L.browY,  rx:0.116, rz:0.106, cz:L.browZ,  hex:P.skin},
      {y:L.crownY, rx:0.090, rz:0.082, cz:L.crownZ, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.022;           /* nose ridge on the front verts */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, L.headTopZ), P.skinDk);
    // trimmed beard/goatee shadow under the jaw — cheap captain-face read, dark against skin
    const beardA=V(0,L.jawY-0.010,L.jawZ+0.060), beardB=V(0,L.jawY-0.075,L.jawZ+0.020);
    tube(beardA,beardB,0.052,0.020,6,P.skinDk,{capB:{hex:P.skinDk}});
  }

  /* TRICORN HAT — broad brim swept up on the sides/back, worn low over the brow, dark body with
     a lit gold trim band. Signature element #2, paired with the coat per direction. */
  {
    const n=10, ph=Math.PI/n;
    const crownBands=[
      {y:L.browY+0.038,   rx:0.128, rz:0.122, cz:L.browZ+0.012},
      {y:L.crownY+0.028,  rx:0.104, rz:0.096, cz:L.crownZ+0.006},
      {y:L.headTopY+0.055,rx:0.070, rz:0.062, cz:L.headTopZ-0.002},
    ];
    const crownRings=crownBands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(crownRings, ()=>P.hat);
    capFan(crownRings.at(-1), V(0,L.headTopY+0.095,L.headTopZ+0.005), P.hatDk);
    // gold trim band right at the crown base — the lit signature edge
    const trimLo = ring(V(0, L.browY+0.036, L.browZ+0.012), V(0,1,0), 0.130, 0.124, n, ph);
    const trimHi = trimLo.map(p=>p.clone().add(V(0,0.022,0)));
    stitch([trimLo, trimHi], ()=>P.hatTrim);
    // BROAD BRIM — wide flat ring, swept UP hard on both sides + the back (the tricorn cock),
    // left low and forward over the brow (shading the eyes per the "worn low" direction)
    const brimOuter = ring(V(0, L.browY+0.032, L.browZ+0.010), V(0,1,0), 0.260, 0.230, n, ph);
    const brimInner = ring(V(0, L.browY+0.040, L.browZ+0.014), V(0,1,0), 0.140, 0.128, n, ph);
    // sweep the two side verts + two back verts upward hard (the cocked corners); keep the two
    // front-center verts low and forward (the shading brim)
    for(const i of [0,1,2,3,4,5,6,7,8,9]){
      const p = brimOuter[i];
      if(i===0||i===9) { p.y += 0.135; p.z -= 0.010; }        // back corner cocked up
      else if(i===4||i===5) { p.y += 0.130; }                 // side corner cocked up
      else if(i===1||i===2) { p.z += 0.030; p.y -= 0.006; }   // front brim stays low, shades brow
    }
    stitch([brimInner, brimOuter], (b,i)=> (i===0||i===9||i===4||i===5)?P.hatDk:P.hat);
    // a short dark plume/feather off the back cocked corner — cheap silhouette break
    const plumeA=V(0.0, L.browY+0.170, L.browZ-0.020), plumeB=V(0.05,L.browY+0.260,L.browZ-0.080);
    tube(plumeA,plumeB,0.016,0.006,4,P.coatDk,{capB:{hex:P.coatDk}});
  }

  /* ARMS — cutlass arm locked straight out and level (the held-threat pose, not mid-swing).
     Dagger arm low and back, blade angled forward-down. Coat sleeves carried to the wrist. */
  {
    // cutlass arm: shoulder -> elbow -> wrist at the grip, arm driven forward and LEVEL
    const S=V(L.shoulderX, L.shldY-0.01, L.shldZ);
    const E=V(0.420, 0.905, 0.290);
    const W=GRIP.clone().addScaledVector(CUT_DIR,-0.02);
    tube(S,E,0.076,0.060,6,P.coat);
    tube(E,W,0.056,0.046,6,P.coatDk,{capB:{hex:P.skin}});
    tube(GRIP.clone().addScaledVector(CUT_DIR,-0.045), GRIP.clone().addScaledVector(CUT_DIR,0.03), 0.046,0.042,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skinDk}});

    // dagger arm: shoulder -> elbow -> wrist at the dagger grip, low and back
    const S2=V(-L.shoulderX, L.shldY-0.01, L.shldZ), E2=V(-0.320,0.760,0.230);
    tube(S2,E2,0.076,0.060,6,P.coat);
    tube(E2,DGRIP.clone().addScaledVector(DAG_DIR,-0.05),0.056,0.044,6,P.coatDk,{capB:{hex:P.skin}});
    tube(DGRIP.clone().addScaledVector(DAG_DIR,-0.055), DGRIP.clone().addScaledVector(DAG_DIR,0.015), 0.042,0.038,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skinDk}});
  }

  /* LEGS — the boarding command: FRONT (right) leg driven UP and forward, boot planted on a rail
     block well above ground level; BACK (left) leg extended down/back on the base, weight thrown
     through the raised leg. Not a flat lunge — a genuine step-up. */
  {
    const railTop = 0.150;
    // front (right) leg — steep rise to the raised, planted boot
    const hipR=V( L.hipHalf, L.hipY-0.01, L.hipZ), kneeR=V( 0.255, 0.400, 0.300), ankR=V( 0.215, railTop+0.070, 0.400);
    tube(hipR,kneeR,0.090,0.064,6,P.trouser);
    tube(kneeR,ankR,0.060,0.044,6,P.trouser);
    // lit knee-wrap on the raised (driving) knee — the raised leg's own high-value zone so the
    // "boot on the rail block" stance pops clear of coat/void instead of reading as a dark blur
    tube(kneeR.clone().addScaledVector(V(1,1.2,0.3).normalize(),-0.030),
         kneeR.clone().addScaledVector(V(1,1.2,0.3).normalize(),0.032),
         0.070,0.068,6,P.kneeLit,{capA:{hex:P.kneeLitDk},capB:{hex:P.kneeLitDk}});
    // back (left) leg — braced down on the base, more vertical, carrying the trailing weight
    const hipL=V(-L.hipHalf, L.hipY-0.01, L.hipZ-0.01), kneeL=V(-0.195, 0.330, -0.070), ankL=V(-0.165, 0.075, -0.220);
    tube(hipL,kneeL,0.088,0.062,6,P.trouser);
    tube(kneeL,ankL,0.058,0.040,6,P.trouser);

    for(const [ank,toeDir,elevated] of [[ankR,V(0.20,0,1).normalize(),true], [ankL,V(-0.20,0,-1).normalize(),false]]){
      const baseY = elevated ? railTop : 0.0;
      stack([
        {y:baseY+0.012, rx:0.068, rz:0.076, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:baseY+0.095, rx:0.060, rz:0.062, cx:ank.x, cz:ank.z, hex:P.bootLt},
      ], 6, {capTop:{hex:P.bootLt, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,baseY+0.050,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.13), 0.054,0.040,6,P.boot, {capB:{hex:P.boot, lift:0.013}, raz:0.046, rbz:0.032});
    }

    /* RAIL BLOCK — the low block the front boot is planted on top of, grounding the "boarding
       command" pose so the raised leg reads as a real step-up, not a floating foot */
    {
      const bx=ankR.x, bz=ankR.z;
      stack([
        {y:0.0,     rx:0.135, rz:0.150, cx:bx, cz:bz-0.02, hex:P.railBlock},
        {y:railTop, rx:0.130, rz:0.145, cx:bx, cz:bz-0.02, hex:P.railBlock},
      ], 8, {capTop:{hex:P.railBlock, lift:0.0}});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.46, 0.46, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.44, 0.44, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
