/* dev/model-qa/creatures/var-veteran.js — the VETERAN (armored professional soldier, sub-nearest
   doctrine, REALM core, 79 live instances — THE most-used body in the game). MODEL-FOUNDRY pass-1
   REBUILD (2026-07-08 foundry pilot, rebuild-w1 cell 4). Preserves the named signature — faded
   oxblood tunic, greyed cropped beard + grey linen hood, 3 pale battle scars, dented dark steel —
   from the prior kin-variant build; geometry replaced to add the BATTERED SHIELD + fighting stance
   the old sword-only pose lacked (law 5's literal example: braced-in-a-fight, not at attention).

   FEATURE CHECKLIST (the tri budget buys these):
     1. Scarred, bearded veteran head under an open-front grey hood — the identity read (kept from
        the prior build: cropped grizzled beard, 3 pale scar quads, one across the brow/eye).
     2. BATTERED ROUND SHIELD braced forward on the left arm — dented steel face, a dark scuff
        gouge across it, a rim notch chip, a central boss — the signature the pose is built around.
     3. NOTCHED BLADE cocked up over the shield's top rim on the right, ready to chop down — a real
        geometric pinch partway down the edge (the "notched" read, not paint).
     4. Dented pauldrons (kept) — the battle-worn steel-highlight read on both shoulders.
     5. BRACED FIGHTING STANCE — shield-side leg planted forward and low, sword-side leg braced
        back, torso squared to a threat: a fighting crouch, never parade rest.
     6. Steel highlights (shield face + blade + pauldron edges) carry the high-value zone against
        the desaturated tunic/leather field.

   POSE SENTENCE: a veteran soldier braced low in a fighting stance, shield thrust forward to meet
   a blow, notched sword cocked up and back over the shield's top rim, poised to chop down through
   whatever comes past the guard.

   Same whole-object grammar as humanoid.js: one function, one geometry frame, no anchors, spine +z,
   ground y=0. Shield authored first (left arm derives to its back face), sword second (right fist
   derives to its grip). Imported by ps1-sheet.html SETS['rebuild-w1'] cell 4. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildVeteran(){
  /* ---------- PALETTE (faded oxblood tunic; greyed hair; dented dark steel — kept) ---------- */
  const P = {
    tunic:0x6b463f, tunicDk:0x543630, linen:0xb4ac98, linenDk:0x7a7364,   // faded oxblood; greyed linen
    skin:0xbe9a76, skinDk:0x8a6a4e, leather:0x4e3d2a, leatherDk:0x3a2d1f,
    steel:0x6e7378, steelDk:0x494d51, steelLt:0xd6dade, brass:0xb08d46, trouser:0x4e463a,
    boot:0x3c3226, eye:0x1a1512, disc:0x4a4038, discTop:0x585047,
    hair:0x9a978c, hairDk:0x6f6c62, scar:0xd8c3ae,                          // grey hair/beard, pale scar
    shieldDk:0x565b5e,                                                     // scuffed shield-face gouge
  };
  /* ---------- LANDMARKS ---------- */
  const L = {
    hipY:0.72, waistY:0.80, ribY:0.91, chestY:1.02, shldY:1.10, neckY:1.145,
    hipHalf:0.115, shoulderX:0.245,
    jawY:1.175, cheekY:1.25, browY:1.325, crownY:1.415, headTopY:1.475,
  };

  /* ===== BATTERED SHIELD FIRST (left side) — braced forward at chest-guard height, face angled
     mostly forward (out to catch a blow), the left hand meets its back face. ===== */
  const SC = V(-0.320, 0.960, 0.290);
  const SN = V(-0.52, 0.05, 0.85).normalize();
  {
    const su = V(0,1,0).clone().sub(SN.clone().multiplyScalar(SN.y)).normalize();
    const sr = new THREE.Vector3().crossVectors(SN, su).normalize();
    const R = 0.190;
    const n = 10;
    const outline = [];
    for(let i=0;i<n;i++){
      const t = (i/n)*Math.PI*2;
      /* a touch flattened top/bottom — a working round shield, not a perfect disc */
      const rr = R * (1 - 0.06*Math.pow(Math.abs(Math.sin(t)),3));
      outline.push(SC.clone().addScaledVector(su, Math.cos(t)*rr).addScaledVector(sr, Math.sin(t)*rr));
    }
    const front = outline.map(p=>p.clone().addScaledVector(SN, 0.020));
    const back  = outline.map(p=>p.clone().addScaledVector(SN,-0.018));
    /* rim */
    for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(back[i], back[i2], front[i2], front[i], P.steelDk, 0.05); }
    /* faces, fanned from center — face slightly domed (lift toward SN) */
    const cF = SC.clone().addScaledVector(SN,0.055), cB = SC.clone().addScaledVector(SN,-0.026);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], cF, cF, P.steel, 0.05);
      quad(cB, cB, back[i2], back[i], P.steelDk, 0.04);
    }
    /* central boss */
    tube(SC.clone().addScaledVector(SN,0.028), SC.clone().addScaledVector(SN,0.095),
         0.052, 0.028, 8, P.brass, {capB:{hex:P.brass, lift:0.014}});
    /* battered signature: one dark scuff gouge raked across the lower-right face */
    quad(SC.clone().addScaledVector(su,-0.045).addScaledVector(sr,-0.020).addScaledVector(SN,0.058),
         SC.clone().addScaledVector(su,-0.030).addScaledVector(sr, 0.130).addScaledVector(SN,0.056),
         SC.clone().addScaledVector(su,-0.075).addScaledVector(sr, 0.140).addScaledVector(SN,0.052),
         SC.clone().addScaledVector(su,-0.090).addScaledVector(sr,-0.010).addScaledVector(SN,0.054), P.shieldDk, 0.03);
    /* a dent flake pressed into the upper rim (matches the pauldron dent language) */
    const dc = SC.clone().addScaledVector(su, 0.150).addScaledVector(sr,-0.060).addScaledVector(SN,0.045);
    quad(dc.clone().add(V(-0.020,-0.008,0)), dc.clone().add(V(0.006,-0.016,0)),
         dc.clone().add(V(0.016,0.012,0.004)), dc.clone().add(V(-0.012,0.018,0.004)), P.steelDk, 0.04);
    /* rim notch chip — a small missing-triangle bite out of the rim edge (upper-left) */
    const rimA = outline[7].clone().addScaledVector(SN,-0.014), rimB = outline[8].clone().addScaledVector(SN,-0.014);
    const bite = SC.clone().addScaledVector(su, (outline[7].clone().sub(SC).dot(su)+outline[8].clone().sub(SC).dot(su))*0.42)
                            .addScaledVector(sr, (outline[7].clone().sub(SC).dot(sr)+outline[8].clone().sub(SC).dot(sr))*0.42)
                            .addScaledVector(SN,-0.006);
    quad(rimA, rimB, bite, bite, P.shieldDk, 0.02);
  }

  /* ===== NOTCHED BLADE SECOND — cocked up and back at the right shoulder, tip rising above and
     past the shield's top rim, ready to chop down through the guard. ===== */
  const GRIP=V(0.290,0.960,0.230), TIP=V(0.120,1.420,0.520);
  const BLADE=new THREE.Vector3().subVectors(TIP,GRIP).normalize();
  const BUTT=GRIP.clone().addScaledVector(BLADE,-0.115);
  {
    tube(BUTT, GRIP.clone().addScaledVector(BLADE,0.045), 0.020, 0.020, 6, P.leatherDk, {capA:{hex:P.brass, lift:0.03}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.048);
    const gx=0.085, gy=0.014, gz=0.020;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.steelDk,0.03);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.steelDk,0.03);
    quad(cnr(-1,-1,-1), cnr(-1,-1,1), cnr(1,-1,1), cnr(1,-1,-1), P.steelDk,0.03);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.steel,0.03);
    quad(cnr(-1,-1,-1), cnr(-1,1,-1), cnr(-1,1,1), cnr(-1,-1,1), P.steel,0.03);
    quad(cnr(1,-1,-1), cnr(1,-1,1), cnr(1,1,1), cnr(1,1,-1), P.steel,0.03);
    const bl=(t,w,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    /* the NOTCH — a real pinch in the blade profile partway down the edge (not paint). Cross-
       sections held near/above the 0.04u dissolve floor (law 3) so the blade survives 1/3-res —
       a thin blade against a dark void is the Creeper's failure mode. */
    const s1=bl(0.02,0.050,0.026), sNotch=bl(0.26,0.026,0.022), s2=bl(0.42,0.044,0.024), s3=bl(0.62,0.032,0.020);
    stitch([s1,sNotch,s2,s3], ()=>P.steelLt);
    capFan(s3, g0.clone().addScaledVector(BLADE,0.72), P.steel);
  }

  /* trunk (one loft, hips->neck) */
  stack([
    {y:L.hipY,   rx:0.205, rz:0.155, hex:P.tunicDk},
    {y:L.waistY, rx:0.170, rz:0.130, hex:P.tunic},
    {y:L.ribY,   rx:0.200, rz:0.150, hex:P.tunic},
    {y:L.chestY, rx:0.230, rz:0.165, hex:P.tunic},
    {y:L.shldY,  rx:0.235, rz:0.155, hex:P.tunic},
    {y:L.neckY,  rx:0.085, rz:0.080, hex:P.linenDk},
  ], 8, {capTop:{hex:P.linenDk, lift:0.005}});

  /* tunic skirt */
  stack([
    {y:0.47, rx:0.255, rz:0.205, hex:P.tunicDk},
    {y:0.60, rx:0.235, rz:0.185, hex:P.tunic},
    {y:0.74, rx:0.210, rz:0.160, hex:P.tunic},
  ], 8, {});

  /* belt + buckle */
  stack([
    {y:0.775, rx:0.185, rz:0.145, hex:P.leather},
    {y:0.835, rx:0.182, rz:0.142, hex:P.leather},
  ], 8, {});
  quad(V(-0.035,0.782,0.152), V(0.035,0.782,0.152), V(0.035,0.828,0.148), V(-0.035,0.828,0.148), P.brass, 0.02);

  /* head (skin loft; nose pushed; eyes painted) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.082, rz:0.088, hex:P.skin},
      {y:L.cheekY, rx:0.112, rz:0.108, hex:P.skin},
      {y:L.browY,  rx:0.116, rz:0.106, hex:P.skin},
      {y:L.crownY, rx:0.090, rz:0.082, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.012), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.022;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.008), P.skinDk);
    /* GREY BEARD — a short cropped grizzled beard wrapping the jaw/chin, proud of the face plane. */
    for(const i of [7,0,1,2,3]){                         // front + front-flank verts of the jaw ring
      const p=rings[0][i];
      quad(p.clone().add(V(-0.020,-0.055,0.006)), p.clone().add(V(0.020,-0.055,0.006)),
           p.clone().add(V(0.016,0.010,0.010)), p.clone().add(V(-0.016,0.010,0.010)), i%2?P.hair:P.hairDk, 0.05);
    }
    // a chin tuft dropping just below the jaw line
    quad(V(-0.028,L.jawY-0.075,0.108), V(0.028,L.jawY-0.075,0.108),
         V(0.020,L.jawY-0.020,0.120), V(-0.020,L.jawY-0.020,0.120), P.hair, 0.05);

    /* SCARS — 2-3 pale quads. One across the face (cheek->brow, over the left eye), one on the
       right cheek, one nicking the jaw. */
    // across-the-face scar (diagonal over the left eye)
    quad(V(-0.088,L.browY+0.010,0.100), V(-0.070,L.browY+0.020,0.108),
         V(-0.030,L.cheekY-0.010,0.126), V(-0.048,L.cheekY-0.020,0.120), P.scar, 0.02);
    // short right-cheek scar
    quad(V(0.060,L.cheekY+0.010,0.116), V(0.072,L.cheekY+0.016,0.112),
         V(0.078,L.cheekY-0.028,0.110), V(0.066,L.cheekY-0.034,0.114), P.scar, 0.02);
    // jaw nick
    quad(V(0.030,L.jawY+0.018,0.118), V(0.044,L.jawY+0.020,0.112),
         V(0.048,L.jawY-0.006,0.110), V(0.034,L.jawY-0.008,0.116), P.scar, 0.02);
  }

  /* hood (greyed linen shell, open front window, dark lining) */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.005, rx:0.105, rz:0.100, hex:P.linenDk},
      {y:L.jawY+0.01,   rx:0.140, rz:0.128, hex:P.linen},
      {y:L.browY+0.005, rx:0.146, rz:0.130, hex:P.linen},
      {y:L.crownY+0.02, rx:0.112, rz:0.104, hex:P.linen},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.018);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.045, -0.03), P.linen);
    const inner=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx-0.018, b.rz-0.018, n, ph));
    inner[3].forEach(p=>p.z-=0.018);
    for(let b=1;b<3;b++) for(const edge of [0,3])
      quad(rings[b][edge], inner[b][edge], inner[b+1][edge], rings[b+1][edge], P.linenDk, 0.03);
  }

  /* pauldrons (DENTED darker steel domes tilted out) */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.02, 0.01);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.35); return q.add(pivot); };
    stack([
      {y:L.shldY-0.015, rx:0.105, rz:0.115, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.045, rx:0.085, rz:0.095, cx:pivot.x, cz:pivot.z, hex:P.steel},
    ], 8, {xform:tilt, capTop:{hex:P.steel, lift:0.03}});
    /* a dark dent flake pressed into the crown of the plate (battle-worn read) */
    const dc=tilt(V(pivot.x - s*0.02, L.shldY+0.055, 0.03));
    quad(dc.clone().add(V(-0.024,-0.010,0)), dc.clone().add(V(0.008,-0.018,0)),
         dc.clone().add(V(0.018,0.014,0.004)), dc.clone().add(V(-0.014,0.020,0.004)), P.steelDk, 0.04);
  }

  /* RIGHT ARM — steel-sleeved to the cocked sword; fist DERIVED from the grip */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.015);
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.005);
    const E=S.clone().lerp(FIST,0.5).add(V(0.045,0.045,0.05));
    tube(S,E,0.078,0.062,6,P.tunic);
    tube(E,FIST.clone().addScaledVector(BLADE,-0.055),0.058,0.048,6,P.leather);
    tube(FIST.clone().addScaledVector(BLADE,-0.055), FIST.clone().addScaledVector(BLADE,0.055), 0.052,0.048,6,P.skin, {capA:{hex:P.skin}, capB:{hex:P.skin}});
  }

  /* LEFT ARM — braced out and forward to the shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.045);
    const E2=V(-0.320,0.870,0.115);
    tube(S2,E2,0.078,0.062,6,P.tunic);
    tube(E2,W2,0.058,0.048,6,P.leather);
    const HDIR=W2.clone().sub(E2).normalize();
    tube(W2, W2.clone().addScaledVector(HDIR,0.095), 0.048,0.038,6,P.skin, {capB:{hex:P.skinDk}});
  }

  /* legs — BRACED FIGHTING STANCE: shield-side (left) leg planted forward and low, sword-side
     (right) leg braced back — weight set to take a blow, not a neutral square stand. */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.175,0.375,0.185), ankL=V(-0.190,0.075,0.235);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.195,0.400,-0.150), ankR=V( 0.215,0.085,-0.215);
    tube(hipL,kneeL,0.088,0.062,6,P.trouser);
    tube(kneeL,ankL,0.058,0.042,6,P.trouser);
    tube(hipR,kneeR,0.088,0.062,6,P.trouser);
    tube(kneeR,ankR,0.058,0.042,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,-0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.068, rz:0.075, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.060, rz:0.062, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.066, rz:0.066, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.135), 0.055,0.042,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.048, rbz:0.034});
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
