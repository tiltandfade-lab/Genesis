/* dev/model-qa/creatures/mon-troll.js — the TROLL landmark table (regenerating horror, LARGE),
   REBUILT under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, rebuild-w4 cell 9,
   realm core, CR 5, flavor: 2 instances + the regenerator family — Large anatomy may justify going
   over 2,000 tris; this build lands inside the band without needing the exception).
   Whole-object grammar: one function, one geometry frame, no anchors. NO held item — the CLAWS
   are the weapons. LARGE size class (disc r=0.55, ~2.0u tall). ANATOMY (HUMANOID, wrong on
   purpose): too-long arm ending in raking claws, hunched gangly frame, warty hide, lank hair
   curtain. Imported by ps1-sheet.html (SETS['rebuild-w4'], cell 9, fn buildTroll).

   FEATURE CHECKLIST (the ~1,700-2,000 budget buys):
     1. HUMANOID torso+legs, hunched-gangly and asymmetric (uneven shoulders, off-center belly
        bulge) — the regeneration horror lives in the lopsided flesh, not a clean muscular build.
     2. SIGNATURE — the too-long claw arm: the RIGHT arm is stretched to near-full-body length,
        already flung out toward the viewer at the climax of the reach, four raking claw-fingers
        splayed at the end. The left arm stays shorter/tucked, bracing the crouch.
     3. SIGNATURE — the hanging jaw: the lower jaw is dropped and pushed forward, wide open,
        a dark maw ringed with needle teeth — mid-snarl, not a closed slot.
     4. The long warty nose (secondary troll tell) still rides the face above the open jaw.
     5. Lank draping hair strands off the skull and down the neck (uneven lengths, matted).
     6. Value ladder: pale bone claws + pale needle teeth light up against the dark moss-green
        hide and near-void mouth interior — the high-value zone sits ON the signature (claw hand
        + open jaw), satisfying law 3.

   POSE SENTENCE: rising out of a crouch mid-reach — the legs still bent and low (the launch,
   not yet standing), the spine uncoiling forward, the right arm already flung out to its full
   too-long extension straight toward the viewer with the claw hand splayed to grab, the left arm
   drawn back low bracing the push-off, and the jaw hanging wide open mid-snarl. The unfolding
   moment, not a standing idle stance — law 5.

   REBUILD NOTE: previous pass had a static hunched-stand with both arms hanging symmetrically at
   the sides and a closed mouth-slot. This pass keeps the palette intent (mottled moss-green hide,
   pale bone claws, warty nose, lank hair) and the named signature (long nose + long claw arms)
   but replaces the pose with the launching reach + open jaw the DIRECTION calls for, and drops
   the left arm's length back so the asymmetry reads as "one arm already thrown," not "two long
   arms that happen to differ a little." */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTroll(){
  /* ---------- PALETTE (VS desaturated; mottled moss-green rubbery hide, wide value spread) ---------- */
  const P = {
    hide:0x6a7a44, hideDk:0x47522d, hideLt:0x849356, hideMot:0x556236,   // moss-green rubbery hide + a mottle tone
    belly:0x7c8654, bellyDk:0x596038,                                     // paler over-stretched belly
    wart:0x3d4a26, wartLt:0x5a6a38,                                       // darker wart clusters (regen lumps)
    claw:0xf5efd6, clawTip:0x2a251d,                                      // pale bone claws (near-white — law 3), dark tips
    nose:0x74814a, noseWart:0x6a7a3c,                                     // the long warty nose (brightened wart tone)
    mouth:0x160f0a, mouthDeep:0x0a0806, tooth:0xf6f0d4,                   // dark maw, near-white needle teeth
    eye:0xd8cc44, eyeDk:0x120e07,                                         // sickly yellow eye deep in the socket
    hair:0x2c2a1e, hairDk:0x1e1c14,                                       // lank greasy strands
    disc:0x3f3a2c, discTop:0x4b4530,
  };

  /* ---------- LANDMARKS — the crouch: hips DROPPED and knees bent (launch position), spine
     uncoiling forward hard off the low hips. Lower than the old standing-hunch rig. ---------- */
  const L = {
    hipY:0.78, gutY:0.92, waistY:1.04, ribY:1.26, chestY:1.42, shldY:1.56, neckY:1.62,
    hipHalf:0.200, shoulderX:0.410,
    jawY:1.72, cheekY:1.82, browY:1.90, crownY:1.98, headTopY:2.04,
    hunchZ:0.30,
  };

  /* UNCOILING spine — pitched forward hard off the low hips, mid-launch (steeper than a passive
     stoop: the body is already rising and driving forward). */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.34);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — tall gaunt-bulgy stretched ribcage over a lopsided belly (regeneration
     horror in the flesh), narrow uneven shoulders, all pitched forward on the uncoil. ---------- */
  stack([
    {y:L.hipY,   rx:0.250, rz:0.225, hex:P.hideDk},                        // narrow hips
    {y:L.gutY,   rx:0.320, rz:0.300, cx:-0.055, hex:P.belly},              // belly bulges OFF-CENTER (left)
    {y:L.waistY, rx:0.335, rz:0.290, cx:-0.070, hex:P.belly},             // lopsided gut, widest belly band
    {y:L.ribY,   rx:0.262, rz:0.212, cx:0.030, hex:P.bellyDk},            // pulls in above the gut, drifts back right
    {y:L.chestY, rx:0.278, rz:0.206, hex:P.hide},                          // narrow stretched chest
    {y:L.shldY,  rx:0.330, rz:0.222, cx:0.040, hex:P.hideLt},             // shoulders — pushed slightly right (uneven)
    {y:L.neckY,  rx:0.156, rz:0.144, hex:P.hideDk},                        // scrawny neck
  ], 8, {xform:hunch, capTop:{hex:P.hideDk, lift:0.008}});

  /* WART CLUSTERS + mottle lumps scattered asymmetrically over the hide — the regeneration read. */
  {
    const lumps = [
      [-0.16, L.gutY+0.02, 0.22, 0.070, P.wart],
      [-0.10, L.gutY-0.04, 0.24, 0.052, P.wart],
      [-0.22, L.waistY, 0.18, 0.060, P.wartLt],
      [ 0.20, L.ribY+0.04, 0.16, 0.048, P.hideMot],
      [ 0.14, L.chestY-0.02, 0.19, 0.042, P.wart],
      [-0.24, L.chestY+0.04, 0.10, 0.038, P.wartLt],
      [ 0.05, L.shldY+0.05, 0.12, 0.055, P.hideMot],
    ];
    for(const [cx,cy,cz,r,hex] of lumps){
      const c = hunch(V(cx,cy,cz));
      blob(c.x, c.y, c.z, r, r*0.8, r*0.7, hex, 6, 4);
    }
  }

  /* ---------- HEAD — the long warty nose still rides above, but the jaw is DROPPED WIDE OPEN,
     pushed forward, mid-snarl (signature #3). The head is tipped forward hard on the uncoil. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY-0.06, rx:0.170, rz:0.160, hex:P.hideLt},      // lower-jaw band, dropped low
      {y:L.cheekY,     rx:0.158, rz:0.152, hex:P.hide},
      {y:L.browY,      rx:0.142, rz:0.122, hex:P.hide},        // brow shelf
      {y:L.crownY,     rx:0.102, rz:0.090, hex:P.hideDk},      // narrow crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* SLOPED LOW BROW — heavy shelf pushed forward + down over the eyes */
    for(const i of [1,2]){ rings[2][i].z += 0.052; rings[2][i].y -= 0.024; }
    for(const i of [0,3]){ rings[2][i].z += 0.024; }
    rings[3].forEach(p=>{ p.z -= 0.038; p.y -= 0.008; });
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], hunch(V(0, L.headTopY, -0.05)), P.hideDk);

    /* LONG WARTY NOSE — rides above the open jaw, bulbous swelling tip, encrusted with pale-ish
       wart nubs (kept bright enough to hold value against the hide per law 3). */
    const noseBase = hunch(V(0, L.browY+0.02, 0.15));
    const noseMid  = hunch(V(0, L.cheekY-0.02, 0.33));
    const noseTip  = hunch(V(0, L.jawY+0.02, 0.41));
    tube(noseBase, noseMid, 0.086, 0.076, 6, P.nose, {raz:0.072, rbz:0.066});
    tube(noseMid, noseTip, 0.082, 0.090, 6, P.nose, {raz:0.070, rbz:0.078});
    { const b = noseTip.clone().add(V(0,-0.02,0.03)); blob(b.x, b.y, b.z, 0.075, 0.070, 0.075, P.nose, 7, 4); }
    for(const [dx,dy,dz,r] of [
      [ 0.040,-0.02,0.03,0.032],[-0.036,0.00,0.02,0.030],[ 0.012, 0.03,0.05,0.026],
      [ 0.000,-0.05,0.04,0.028],[-0.020,-0.03,0.04,0.024],[ 0.030, 0.02,0.02,0.022],
      [ 0.000, 0.08,-0.02,0.022],[-0.045,0.05,0.00,0.020],
    ]){
      const c = hunch(V(dx, L.jawY+0.06+dy, 0.36+dz));
      blob(c.x, c.y, c.z, r, r*0.95, r*0.85, P.noseWart, 5, 3);
    }

    /* HANGING JAW — the signature open maw. Lower jaw is a hinged block dropped WELL below the
       upper jaw line and pushed forward, opening a deep dark cavity between them. Bright needle
       teeth line both the upper gum (fixed to the skull) and the dropped lower jaw so the shape
       of the opening reads clearly even in-engine. A dark-on-darker interior throat wedge gives
       the mouth real depth instead of a flat slot. */
    {
      const upperY = L.jawY - 0.03, mz = 0.235;
      const lowerY = L.jawY - 0.235;               // jaw hangs open, well below the upper line
      const lowerZ = mz + 0.045;                     // and juts slightly forward (the drop-and-push)
      const m=(x,y,z)=>hunch(V(x,y,z));

      /* upper gum ridge (fixed) */
      const uL = m(-0.118, upperY, mz), uR = m(0.118, upperY, mz);
      /* lower jaw ridge (dropped + forward) */
      const lL = m(-0.108, lowerY, lowerZ), lR = m(0.108, lowerY, lowerZ);
      /* deep dark interior wedge behind both ridges (the cavity) */
      const dL = m(-0.075, upperY-0.09, mz-0.075), dR = m(0.075, upperY-0.09, mz-0.075);

      // interior back wall
      quad(dL, dR, lR.clone().add(V(0,0.02,-0.02)), lL.clone().add(V(0,0.02,-0.02)), P.mouthDeep, 0.0);
      // upper palate face
      quad(uL, uR, dR, dL, P.mouth, 0.0);
      // lower jaw inner face (visible through the open mouth)
      quad(dL, dR, lR, lL, P.mouthDeep, 0.0);
      // outer lower-jaw chin block (gives the dropped jaw real volume, not a paper flap)
      const chinL = m(-0.100, lowerY-0.055, lowerZ+0.03), chinR = m(0.100, lowerY-0.055, lowerZ+0.03);
      quad(lL, lR, chinR, chinL, P.hideLt, 0.0);
      quad(chinL, chinR, dR.clone().add(V(0,-0.10,0.02)), dL.clone().add(V(0,-0.10,0.02)), P.hideDk, 0.0);

      // needle teeth — bright, upper fixed row + lower row riding the dropped jaw. CRITIC PASS-2:
      // widened base (was ±0.011 = 0.022u total, under the law-3 0.04u floor and dissolving into
      // dither at 1/3-res) to ±0.021 = 0.042u total, and lengthened tips so the bright fangs read
      // as a clear ring around the open maw instead of faint flecks.
      const tooth=(base,tipDy)=>{
        const a = base.clone().add(V(-0.021,0,0.006));
        const b = base.clone().add(V( 0.021,0,0.006));
        const t = base.clone().add(V(0, tipDy, 0.004));
        quad(a, b, t, t, P.tooth, 0.02);
      };
      for(const x of [-0.090,-0.058,-0.026,0.026,0.058,0.090]){
        tooth(m(x, upperY, mz+0.006), -0.052);          // hang down from the upper gum
        tooth(m(x, lowerY+0.012, lowerZ+0.006), 0.050);  // rise up off the lower jaw
      }
    }

    /* LANK HAIR — long greasy strands draping off the back + sides of the skull, uneven lengths. */
    const strands = [
      [-0.10, L.crownY-0.02, -0.12,  0.02, 0.50],
      [ 0.03, L.crownY-0.01, -0.14,  0.00, 0.62],
      [ 0.12, L.crownY-0.03, -0.11, -0.02, 0.46],
      [-0.17, L.browY+0.02, -0.10,  0.02, 0.54],
      [ 0.17, L.browY+0.00, -0.09, -0.02, 0.50],
    ];
    for(const [dx,y,dz,ddx,len] of strands){
      const base = hunch(V(dx, y, dz));
      const mid  = hunch(V(dx+ddx*0.5, y-len*0.5, dz-0.10));
      const tip  = hunch(V(dx+ddx, y-len, dz-0.14));
      tube(base, mid, 0.026, 0.014, 4, P.hair, {capA:{hex:P.hairDk}});
      tube(mid, tip, 0.014, 0.005, 4, P.hairDk, {capB:{hex:P.hairDk, lift:0.004}});
    }
  }

  /* ---------- ARMS — the signature. RIGHT arm is thrown to near-full extension straight toward
     the viewer (+z), the launch already mid-reach; LEFT arm stays short and drawn back low,
     bracing the crouch push-off. Big splayed claw hand at the reaching end. ---------- */
  const clawHand = (ctr, faceDir, hex, scale=1.0)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.070*scale), ctr.clone().addScaledVector(d,0.070*scale),
         0.115*scale, 0.100*scale, 6, hex, {raz:0.078*scale, rbz:0.078*scale, capA:{hex}, capB:{hex}});
    for(const off of [-1.4,-0.5,0.5,1.4]){
      const kb = ctr.clone().addScaledVector(d,0.060*scale).addScaledVector(side, off*0.058*scale);
      const kt = kb.clone().addScaledVector(d,0.150*scale).addScaledVector(side, off*0.020*scale).add(V(0,-0.06*scale,0));
      tube(kb, kt, 0.030*scale, 0.010*scale, 4, hex, {capB:{hex:P.clawTip, lift:0.008}});
      const ct = kt.clone().addScaledVector(d,0.055*scale).add(V(0,-0.03*scale,0));
      tube(kt, ct, 0.016*scale, 0.006*scale, 4, P.claw, {capB:{hex:P.clawTip, lift:0.008}});
    }
    const tb = ctr.clone().addScaledVector(side, -Math.sign(ctr.x||1)*0.070*scale).addScaledVector(d,0.020*scale);
    const tt = tb.clone().addScaledVector(d,0.100*scale).add(V(0,-0.04*scale,0));
    tube(tb, tt, 0.024*scale, 0.009*scale, 4, hex, {capB:{hex:P.clawTip, lift:0.006}});
  };
  {
    /* RIGHT arm — the too-long claw arm, thrown to near-full extension straight out toward the
       viewer at the climax of the reach (elbow barely bent, mostly straight — a launched throw,
       not a dangle). Reaches well past the disc's own radius. */
    const S2=hunch(V(L.shoulderX-0.04, L.shldY+0.03, 0.03));
    const E2=V(0.360, 1.30, 0.62);           // elbow only slightly dropped — nearly straight
    const W2=V(0.300, 1.18, 1.10);           // wrist flung far out toward the viewer (+z)
    { const d=hunch(V(L.shoulderX-0.01, L.shldY+0.04, 0.04)); blob(d.x,d.y,d.z, 0.160,0.145,0.145, P.hideLt, 7, 4); }
    tube(S2,E2,0.145,0.112,6,P.hide);
    tube(E2,W2,0.104,0.082,6,P.hideDk);
    clawHand(W2, V(0.10,-0.05,1), P.hideLt, 1.08);   // slightly oversized hand at the reach — the payoff

    /* LEFT arm — SHORT and drawn back low, bracing the crouch/push-off (the launch's other half:
       one arm thrown forward, one still coiled behind). Deliberately shorter than the old
       symmetric pass so the asymmetry reads as "mid-throw," not "two long arms." */
    const S=hunch(V(-L.shoulderX+0.06, L.shldY-0.01, 0.02));
    const E=V(-0.440, 0.96, -0.10);          // elbow pulled BACK behind the hip line
    const W=V(-0.400, 0.62, -0.32);          // hand drawn back and down, bracing
    { const d=hunch(V(-L.shoulderX+0.02, L.shldY, 0.03)); blob(d.x,d.y,d.z, 0.150,0.136,0.136, P.hide, 7, 4); }
    tube(S,E,0.132,0.100,6,P.hide);
    tube(E,W,0.092,0.070,6,P.hideDk);
    clawHand(W, V(-0.10,-0.35,-1), P.hideLt, 0.82);
  }

  /* ---------- LEGS — DEEPLY bent, low crouch (launch position, not a standing stoop): hips low,
     knees driven forward-and-out, weight still loaded — the instant BEFORE the legs drive
     straight. Big splayed clawed feet, one foot forward (the push-off stance). ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.00), kneeL=V(-0.360,0.44,0.34), ankL=V(-0.310,0.10,0.08);
    const hipR=V( L.hipHalf, L.hipY-0.02, -0.02), kneeR=V( 0.380,0.40,0.16), ankR=V( 0.340,0.09,0.18);
    tube(hipL,kneeL,0.158,0.116,6,P.hide);
    tube(kneeL,ankL,0.106,0.078,6,P.hideDk);
    tube(hipR,kneeR,0.158,0.116,6,P.hide);
    tube(kneeR,ankR,0.106,0.076,6,P.hideDk);
    for(const [ank,toeDir] of [[ankL,V(-0.10,0,1)], [ankR,V(0.14,0,1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.070,ank.z);
      tube(heel.clone().addScaledVector(d,-0.03), heel.clone().addScaledVector(d,0.200), 0.100,0.072,6,P.hide,
           {raz:0.090, rbz:0.060, capA:{hex:P.hideDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.180).addScaledVector(side, off*0.062);
        const tt=tb.clone().addScaledVector(d,0.070).addScaledVector(side, off*0.008);
        tube(tb, tt, 0.028,0.010,4,P.hideDk,{capB:{hex:P.claw, lift:0.006}});
      }
    }
  }

  /* ---------- base disc (LARGE: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 16);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.53, 0.53, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.061,0), P.discTop);
  }
}
