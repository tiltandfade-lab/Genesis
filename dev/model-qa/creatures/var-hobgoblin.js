/* dev/model-qa/creatures/var-hobgoblin.js — HOBGOBLIN SOLDIER (REBUILD 2026-07-08 under
   docs/MODEL-FOUNDRY.md, foundry pilot rebuild-w4, cell 5). Core identity: the DISCIPLINED
   goblinoid — must read the opposite of the goblin: upright, uniformed, in formation, drilled
   violence rather than wild scrabbling. Palette intent PRESERVED from the prior kin-variant pass
   (grey-orange goblinoid hide, dark uniform iron, a red cloth/trim accent) but the geometry is a
   full rebuild: a squared humanoid soldier frame (per ANATOMY-CANON — HUMANOID = the PC-kit
   grammar) in a lamellar cuirass, wielding a longsword + a round shield locked square to the
   front, caught in the phalanx step.

   FEATURE CHECKLIST (the ~1,000-2,000 budget buys):
     1. HUMANOID torso, squared and UPRIGHT (no forward torque/lean) — the disciplined military
        bearing, a straight spine, read opposite of a hunched goblin.
     2. LAMELLAR CUIRASS — banded overlapping plate rows (alternating dark iron / lit iron ridge)
        across the torso, plus a bright RED SASH band at the chest: the uniform tell.
     3. SIGNATURE A — ROUND SHIELD locked SQUARE to the front (minimal outward angle, unlike an
        angled duelist's shield), a bright iron BOSS at center: the shield-wall read, outline-
        changing on the body's left.
     4. SIGNATURE B — LONGSWORD held HORIZONTAL at shoulder height, blade thrust forward across
        the body in the mid-thrust instant (not sheathed, not raised overhead): bright steel blade
        crossing the silhouette on the right.
     5. Pose legs — one boot planted forward (the phalanx step), the trailing leg straighter but
        NOT lunging low: a drilled advance, not a wild leap.
     6. Peaked LAMELLAR HELM with cheek flaps + a small red crest: completes "uniformed," echoes
        the sash's red value beat at head height.

   POSE SENTENCE: the phalanx step — shield locked flush to the front, the longsword driven
   forward horizontal at shoulder height in a level mid-thrust, spine straight, one boot stepping
   forward into the line: drilled violence, not a wild swing.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w4'], cell 5, fn buildHobgoblin). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { buildHead, buildBase } from '../parts.js';

export function buildHobgoblin(){
  /* ---------- PALETTE (grey-orange goblinoid hide; disciplined dark iron + red uniform trim) --- */
  const P = {
    skin:0x8a6a4a, skinDk:0x5e4830, skinLt:0x9c7c56,
    iron:0x545a5f, ironDk:0x33383c, ironLt:0x848c92,          // dark uniform iron (disciplined plate)
    steel:0xa8afb5, steelDk:0x6b7176, steelLt:0xf3f5f6,       // bright weapon steel (value zone — near-white so it clears the in-engine lighting falloff, law 3)
    cloth:0xc9333a, clothDk:0x7c2023,                          // red uniform sash/trim (brightened — R2 was reading near-invisible against the iron)
    leather:0x4e3d2a, leatherDk:0x352a1c,
    strap:0x2c2420,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- RIG (stocky goblinoid: broader shoulders/hips than the human guard rig) ---------- */
  const L = {
    hipY:0.74, waistY:0.825, ribY:0.94, chestY:1.055, shldY:1.15, neckY:1.19,
    hipHalf:0.150, shoulderX:0.300,
    jawY:1.220, cheekY:1.295, browY:1.370, crownY:1.460, headTopY:1.520,
  };

  /* ---------- SHIELD FIRST (left arm) — locked SQUARE to the front, minimal outward angle: the
     shield-wall read. A round shield, bright iron boss at center for the value beat. ---------- */
  const SC = V(-0.360, 1.020, 0.360);
  const SN = V(-0.10, 0.02, 0.994).clone().normalize();       // near-square to the front (locked)
  {
    const su = V(0,1,0).clone().sub(SN.clone().multiplyScalar(SN.y)).normalize();
    const sr = new THREE.Vector3().crossVectors(SN, su).normalize();
    const n = 10, ph = Math.PI / n;
    const rimOuter = ring(SC.clone().addScaledVector(SN, 0.020), SN, 0.230, 0.230, n, ph);
    const rimInner = ring(SC.clone().addScaledVector(SN, 0.020), SN, 0.190, 0.190, n, ph);
    const back     = ring(SC.clone().addScaledVector(SN,-0.018), SN, 0.220, 0.220, n, ph);
    stitch([rimInner, rimOuter], ()=>P.ironLt);
    stitch([rimOuter, back], ()=>P.ironDk);
    stitch([back, rimInner], ()=>P.iron);
    // face panel (red-trimmed, uniform) — a large solid disc, not a thin hoop
    const faceOuter = ring(SC.clone().addScaledVector(SN,0.028), SN, 0.190, 0.190, n, ph);
    const faceInner = ring(SC.clone().addScaledVector(SN,0.032), SN, 0.100, 0.100, n, ph);
    stitch([faceInner, faceOuter], ()=>P.cloth);
    // bright boss (the value zone) — enlarged + pushed further forward to catch full light
    const bossR = ring(SC.clone().addScaledVector(SN,0.060), SN, 0.100, 0.100, n, ph);
    stitch([faceInner, bossR], ()=>P.steelLt);
    capFan(bossR, SC.clone().addScaledVector(SN,0.115), P.steelLt);
    // grip boss on the back
    tube(SC.clone().addScaledVector(SN,-0.018), SC.clone().addScaledVector(SN,-0.075), 0.050,0.036,6,P.leather,{capB:{hex:P.skin}});
  }
  const SHIELD_FIST = SC.clone().addScaledVector(SN,-0.075);

  /* ---------- LONGSWORD SECOND (right arm) — HORIZONTAL at shoulder height, driven forward in a
     level mid-thrust across the body: the outline-changing signature on the right. ---------- */
  const GRIP = V(0.235, 1.145, 0.36);
  const TIP  = V(-0.070, 1.155, 1.130);
  const SDIR = new THREE.Vector3().subVectors(TIP, GRIP).normalize();
  {
    const up = V(0,1,0);
    const su = new THREE.Vector3().crossVectors(up, SDIR).normalize();
    const sv = new THREE.Vector3().crossVectors(SDIR, su).normalize();
    // pommel + grip wrap + crossguard
    const BUTT = GRIP.clone().addScaledVector(SDIR, -0.085);
    tube(BUTT, BUTT.clone().addScaledVector(SDIR,0.02), 0.026,0.026,6,P.steelDk,{capA:{hex:P.steel, lift:0.015}});
    tube(BUTT.clone().addScaledVector(SDIR,0.02), GRIP.clone().addScaledVector(SDIR,-0.01), 0.020,0.020,6,P.strap);
    const g0 = GRIP.clone().addScaledVector(SDIR, 0.02);
    quad(g0.clone().addScaledVector(su,0.072), g0.clone().addScaledVector(su,-0.072),
         g0.clone().addScaledVector(su,-0.072).addScaledVector(SDIR,0.022), g0.clone().addScaledVector(su,0.072).addScaledVector(SDIR,0.022),
         P.steelDk, 0.03);
    // blade — straight taper to a point, bright steel (the high-value zone on the right)
    const bl=(t,w,th)=>{ const c=g0.clone().addScaledVector(SDIR,t+0.03);
      return [c.clone().addScaledVector(su,w), c.clone().addScaledVector(sv,th), c.clone().addScaledVector(su,-w), c.clone().addScaledVector(sv,-th)]; };
    const s0=bl(0.00,0.038,0.012), s1=bl(0.28,0.030,0.009), s2=bl(0.56,0.020,0.006), s3=bl(0.78,0.006,0.003);
    stitch([s0,s1,s2,s3], (b)=> b<1?P.steel:P.steelLt);
    capFan(s3, g0.clone().addScaledVector(SDIR,0.86), P.steelLt);
  }

  /* ---------- TORSO — squared and UPRIGHT (no forward lean: disciplined bearing) ---------- */
  stack([
    {y:L.hipY,   rx:0.255, rz:0.195, hex:P.skinDk},
    {y:L.waistY, rx:0.230, rz:0.172, hex:P.iron},
    {y:0.87,     rx:0.258, rz:0.196, hex:P.ironDk},
    {y:L.ribY,   rx:0.278, rz:0.205, hex:P.iron},
    {y:1.00,     rx:0.300, rz:0.212, hex:P.ironDk},
    {y:L.chestY, rx:0.318, rz:0.218, hex:P.iron},
    {y:L.shldY,  rx:0.330, rz:0.208, hex:P.ironDk},
    {y:L.neckY,  rx:0.135, rz:0.128, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});

  /* RED SASH — a bright horizontal uniform band across the chest (the value beat, law 3) */
  {
    const y0=0.985, y1=1.045, hw=0.322;
    quad(V(-hw,y0,0.145), V(hw,y0,0.145), V(hw,y1,0.145), V(-hw,y1,0.145), P.cloth, 0.04);
    quad(V(-hw,y0,0.135), V(hw,y0,0.135), V(hw,y1,0.135), V(-hw,y1,0.135), P.clothDk, 0.04);
    quad(V(-hw,y0,-0.140), V(hw,y0,-0.140), V(hw,y1,-0.140), V(-hw,y1,-0.140), P.cloth, 0.04);
  }

  /* skirt/faulds — matching (uniform) plates, both sides identical unlike a bandit's mismatch */
  stack([
    {y:0.50, rx:0.265, rz:0.205, hex:P.ironDk},
    {y:0.62, rx:0.250, rz:0.190, hex:P.iron},
    {y:L.hipY-0.01, rx:0.235, rz:0.178, hex:P.ironDk},
  ], 8, {});

  /* belt */
  stack([
    {y:0.775, rx:0.238, rz:0.180, hex:P.leather},
    {y:0.835, rx:0.235, rz:0.178, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.032,0.782,0.184), V(0.032,0.782,0.184), V(0.032,0.828,0.180), V(-0.032,0.828,0.180), P.steelDk, 0.02);

  /* ---------- BOTH shoulders get an IDENTICAL matching pauldron — military uniformity ---------- */
  for(const s of [-1,1]){
    const pivot = V(s*L.shoulderX, L.shldY+0.02, 0.01);
    stack([
      {y:L.shldY-0.03, rx:0.145, rz:0.155, cx:pivot.x, cz:pivot.z, hex:P.ironDk},
      {y:L.shldY+0.045, rx:0.125, rz:0.130, cx:pivot.x, cz:pivot.z, hex:P.iron},
    ], 8, {capTop:{hex:P.ironLt, lift:0.01}});
  }

  /* ---------- HEAD (shared module, no forward drop — chin level: disciplined) ---------- */
  buildHead(L, P);

  /* ---------- PEAKED LAMELLAR HELM — cheek flaps + a small red crest (echoes the sash) ------- */
  {
    const n=10, ph=Math.PI/n;
    const domeBands=[
      {y:L.browY+0.01,  rx:0.128, rz:0.120, hex:P.ironDk},
      {y:L.browY+0.05,  rx:0.134, rz:0.126, hex:P.iron},
      {y:L.crownY+0.02, rx:0.112, rz:0.102, hex:P.iron},
      {y:L.headTopY-0.01, rx:0.062, rz:0.056, hex:P.ironDk},
    ];
    const domeRings = domeBands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(domeRings, b=>domeBands[b].hex);
    capFan(domeRings.at(-1), V(0, L.headTopY+0.02, 0.005), P.ironDk);
    // cheek flaps (both sides matching)
    for(const s of [-1,1]){
      quad(V(s*0.112,L.browY+0.02,0.05), V(s*0.150,L.browY+0.02,0.02),
           V(s*0.140,L.jawY-0.03,0.03), V(s*0.100,L.jawY-0.01,0.06), P.iron, 0.03);
    }
    // red crest — a thin bright ridge along the peak, the head-height value echo
    const crestBase = V(0, L.headTopY-0.02, -0.02), crestTip = V(0, L.headTopY+0.16, -0.05);
    tube(crestBase, crestTip, 0.020, 0.006, 5, P.cloth, {capB:{hex:P.clothDk, lift:0.01}});
    tube(V(0,L.crownY+0.03,-0.10), V(0,L.headTopY+0.02,-0.08), 0.026,0.020,5,P.clothDk);
  }

  /* ---------- ARMS — right hand drives the sword horizontal; left hand locks the shield ------- */
  {
    const S = V(L.shoulderX, L.shldY-0.01, 0.02), E = V(0.30, 1.10, 0.20);
    tube(S,E,0.084,0.066,6,P.iron);
    tube(E,GRIP,0.062,0.050,6,P.leather,{capB:{hex:P.skin}});
    tube(GRIP.clone().add(V(-0.05,0.05,-0.02)), GRIP.clone().add(V(0.05,-0.05,0.02)), 0.052,0.048,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2 = V(-L.shoulderX, L.shldY-0.01, 0.02), E2 = V(-0.32, 1.05, 0.24);
    tube(S2,E2,0.084,0.066,6,P.iron);
    tube(E2,SHIELD_FIST,0.062,0.050,6,P.leather,{capB:{hex:P.skin}});
  }

  /* ---------- LEGS — the phalanx step: right boot planted forward, left trailing straighter --- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, -0.03), kneeL=V(-0.19,0.42,-0.05), ankL=V(-0.17,0.085,-0.06);
    const hipR=V( L.hipHalf, L.hipY-0.01,  0.03), kneeR=V( 0.24,0.40, 0.42), ankR=V( 0.23,0.085, 0.56);
    tube(hipL,kneeL,0.095,0.066,6,P.skinDk);
    tube(kneeL,ankL,0.062,0.044,6,P.skinDk);
    tube(hipR,kneeR,0.098,0.068,6,P.skinDk);
    tube(kneeR,ankR,0.064,0.045,6,P.skinDk);
    // matching greaves (uniform, both legs identical plate)
    for(const [hip,knee] of [[hipL,kneeL],[hipR,kneeR]]){
      const mid = hip.clone().lerp(knee,0.55);
      stack([
        {y:mid.y-0.05, rx:0.072, rz:0.072, cx:mid.x, cz:mid.z, hex:P.ironDk},
        {y:mid.y+0.05, rx:0.066, rz:0.066, cx:mid.x, cz:mid.z, hex:P.iron},
      ], 6, {});
    }
    for(const [ank,toeDir] of [[ankL,V(0.03,0,1)], [ankR,V(0.02,0,1)]]){
      stack([
        {y:0.012, rx:0.070, rz:0.078, cx:ank.x, cz:ank.z, hex:P.leatherDk},
        {y:0.11,  rx:0.062, rz:0.064, cx:ank.x, cz:ank.z, hex:P.leatherDk},
        {y:0.16,  rx:0.068, rz:0.068, cx:ank.x, cz:ank.z, hex:P.leather},
      ], 6, {capTop:{hex:P.leather, lift:0.005}, capBot:{hex:P.leatherDk, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.14), 0.056,0.042,6,P.leatherDk, {capB:{hex:P.leatherDk, lift:0.014}, raz:0.048, rbz:0.034});
    }
  }

  /* ---------- base disc — shared module ---------- */
  buildBase(P);
}
