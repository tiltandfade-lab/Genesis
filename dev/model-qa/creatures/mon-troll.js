/* dev/model-qa/creatures/mon-troll.js — the TROLL landmark table (regenerating horror, LARGE).
   Whole-object grammar: one function, one geometry frame, no anchors. NO held item — the CLAWS are
   the weapons. LARGE size class (disc r=0.55, ~2.2u tall) but WRONG where the ogre is round: this
   thing is GANGLY and STRETCHED. Long dangling arms with oversized claw-fingered hands that reach
   past the knees, a hunched-forward spine that pitches the shoulders ahead of the hips, a long warty
   NOSE shoved forward (the troll signature), lank strands of hair, mottled moss-green rubbery hide
   with darker wart clusters, a wide mouth of needle-tooth hints. The regeneration horror reads in
   the FLESH: uneven, lumpy, asymmetric — one shoulder higher, the belly bulging off-center, warts
   clustered at random. It must dwarf even the ogre. Imported by mon-troll-probe.html + the sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTroll(){
  /* ---------- PALETTE (VS desaturated; mottled moss-green rubbery hide, wide value spread) ---------- */
  const P = {
    hide:0x6a7a44, hideDk:0x47522d, hideLt:0x849356, hideMot:0x556236,   // moss-green rubbery hide + a mottle tone
    belly:0x7c8654, bellyDk:0x596038,                                     // paler over-stretched belly
    wart:0x3d4a26, wartLt:0x5a6a38,                                       // darker wart clusters (regen lumps)
    claw:0xd8cca4, clawTip:0x2a251d,                                      // pale bone claws, dark tips
    nose:0x74814a, noseWart:0x4a5528,                                     // the long warty nose
    mouth:0x160f0a, tooth:0xd0c6a8,                                       // dark maw, needle-tooth hints
    eye:0xb0a63c, eyeDk:0x120e07,                                         // sickly yellow eye deep in the socket
    hair:0x2c2a1e, hairDk:0x1e1c14,                                       // lank greasy strands
    disc:0x3f3a2c, discTop:0x4b4530,
  };

  /* ---------- LANDMARKS — LARGE but GANGLY. Where the ogre is round, the troll is STRETCHED and
     LOPSIDED. The spine HUNCHES forward hard (shoulders ahead of the hips), the belly bulges off to
     one side, and the whole frame is taller + narrower than the ogre's barrel. ~2.2u head-top but the
     silhouette is all crooked verticals + dangling arms, not muscle mass. ---------- */
  const L = {
    hipY:0.98, gutY:1.12, waistY:1.24, ribY:1.46, chestY:1.62, shldY:1.76, neckY:1.82,
    hipHalf:0.190, shoulderX:0.400,
    jawY:1.94, cheekY:2.02, browY:2.10, crownY:2.18, headTopY:2.24,
    // the hunch pitches the upper body forward about the hips
    hunchZ:0.26,
  };

  /* HUNCHED-FORWARD spine — a strong forward tip of everything above the hips (much more than the
     ogre's gentle slump; this is a stooped, predatory crook). Asymmetric roll-in added per-part. */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.30);      // pitch the upper body forward
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — TALL and GAUNT-BULGY (not the ogre's round barrel). A stretched ribcage over a
     lopsided belly that bulges to one side (cx offset) — the regeneration horror in the flesh. Shoulders
     narrow + high + UNEVEN. Everything hunched forward. ---------- */
  stack([
    {y:L.hipY,   rx:0.240, rz:0.215, hex:P.hideDk},                        // narrow hips
    {y:L.gutY,   rx:0.310, rz:0.290, cx:-0.055, hex:P.belly},              // belly bulges OFF-CENTER (left)
    {y:L.waistY, rx:0.325, rz:0.280, cx:-0.070, hex:P.belly},             // lopsided gut, widest belly band
    {y:L.ribY,   rx:0.255, rz:0.205, cx:0.030, hex:P.bellyDk},            // pulls in above the gut, drifts back right
    {y:L.chestY, rx:0.270, rz:0.200, hex:P.hide},                          // narrow stretched chest
    {y:L.shldY,  rx:0.320, rz:0.215, cx:0.030, hex:P.hideLt},             // shoulders — pushed slightly right (uneven)
    {y:L.neckY,  rx:0.150, rz:0.140, hex:P.hideDk},                        // scrawny neck
  ], 8, {xform:hunch, capTop:{hex:P.hideDk, lift:0.008}});

  /* WART CLUSTERS + mottle lumps scattered asymmetrically over the hide — the regeneration read: the
     flesh boils and re-knits unevenly. Small blobs at random landmarks, clustered (not spread). */
  {
    const lumps = [
      [-0.16, L.gutY+0.02, 0.22, 0.070, P.wart],
      [-0.10, L.gutY-0.04, 0.24, 0.052, P.wart],
      [-0.22, L.waistY, 0.18, 0.060, P.wartLt],
      [ 0.20, L.ribY+0.04, 0.16, 0.048, P.hideMot],
      [ 0.14, L.chestY-0.02, 0.19, 0.042, P.wart],
      [-0.24, L.chestY+0.04, 0.10, 0.038, P.wartLt],
      [ 0.05, L.shldY+0.05, 0.12, 0.055, P.hideMot],   // lump on one shoulder (uneven)
    ];
    for(const [cx,cy,cz,r,hex] of lumps){
      const c = hunch(V(cx,cy,cz));
      blob(c.x, c.y, c.z, r, r*0.8, r*0.7, hex, 6, 4);
    }
  }

  /* ---------- HEAD — a stretched skull carrying the LONG WARTY NOSE (the troll signature: a big
     drooping forward push). Sloped low brow, sickly deep-set eyes, a wide needle-toothed maw. The
     head is tipped forward on the hunch. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.165, rz:0.155, hex:P.hideLt},        // jaw
      {y:L.cheekY, rx:0.155, rz:0.150, hex:P.hide},
      {y:L.browY,  rx:0.140, rz:0.120, hex:P.hide},          // brow shelf
      {y:L.crownY, rx:0.100, rz:0.088, hex:P.hideDk},        // narrow crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* SLOPED LOW BROW — heavy shelf pushed forward + down over the eyes */
    for(const i of [1,2]){ rings[2][i].z += 0.050; rings[2][i].y -= 0.024; }
    for(const i of [0,3]){ rings[2][i].z += 0.024; }
    /* crown recedes back */
    rings[3].forEach(p=>{ p.z -= 0.038; p.y -= 0.008; });
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], hunch(V(0, L.headTopY, -0.05)), P.hideDk);

    /* LONG WARTY NOSE — the troll signature. A big BULBOUS drooping hooter shoved FAR forward + down
       off the brow line, and crucially SWELLING toward the tip (a fat knobbly bulb, NOT a tapering
       beak). Then a cluster of warts encrusting the whole tip so it reads as diseased flesh. */
    const noseBase = hunch(V(0, L.browY-0.01, 0.14));
    const noseMid  = hunch(V(0, L.cheekY-0.05, 0.32));
    const noseTip  = hunch(V(0, L.jawY+0.04, 0.40));         // hooks down + far forward
    tube(noseBase, noseMid, 0.086, 0.076, 6, P.nose, {raz:0.072, rbz:0.066});
    tube(noseMid, noseTip, 0.082, 0.090, 6, P.nose, {raz:0.070, rbz:0.078});   // SWELLS toward the tip (bulbous)
    // fat bulb cap on the very end (the drooping troll bulb)
    { const b = noseTip.clone().add(V(0,-0.02,0.03)); blob(b.x, b.y, b.z, 0.075, 0.070, 0.075, P.nose, 7, 4); }
    /* warts ENCRUSTING the tip + bridge — many small clustered knobs (the diseased knobbly read) */
    for(const [dx,dy,dz,r] of [
      [ 0.040,-0.02,0.03,0.032],[-0.036,0.00,0.02,0.030],[ 0.012, 0.03,0.05,0.026],
      [ 0.000,-0.05,0.04,0.028],[-0.020,-0.03,0.04,0.024],[ 0.030, 0.02,0.02,0.022],
      [ 0.000, 0.08,-0.02,0.022],[-0.045,0.05,0.00,0.020],
    ]){
      const c = hunch(V(dx, L.jawY+0.06+dy, 0.36+dz));
      blob(c.x, c.y, c.z, r, r*0.95, r*0.85, P.noseWart, 5, 3);
    }

    /* WIDE MAW — a broad dark grinning slot low on the jaw, sitting BELOW + clear of the drooping
       nose bulb, needle-tooth hints top and bottom (troll mouth is a slot, not tusks). Pushed forward
       to the face plane so it isn't lost in shadow. */
    {
      const my = L.jawY-0.09, mz = 0.235;
      const m=(x,y,z)=>hunch(V(x,y,z));
      quad(m(-0.115,my+0.040,mz), m(0.115,my+0.040,mz),
           m(0.100,my-0.036,mz-0.01), m(-0.100,my-0.036,mz-0.01), P.mouth, 0.0);
      // needle teeth — thin nubs along both gum lines
      const tooth=(x,y,z,down)=>{
        const ty = down ? y-0.028 : y+0.028;
        quad(m(x-0.011,y,z+0.008), m(x+0.011,y,z+0.008), m(x,ty,z+0.006), m(x,ty,z+0.006), P.tooth, 0.02);
      };
      for(const x of [-0.090,-0.058,-0.026,0.026,0.058,0.090]){
        tooth(x, my+0.038, mz+0.004, true);    // upper needles
        tooth(x, my-0.034, mz+0.004, false);   // lower needles
      }
    }
    /* LANK HAIR — long greasy strands DRAPING off the back + sides of the skull, hanging well down the
       neck/back (matted rat-tails, not crown spikes). Anchored behind the crown and swinging down-and-
       back so nothing pokes up out of the top of the head. Uneven lengths. */
    const strands = [
      [-0.10, L.crownY-0.02, -0.12,  0.02, 0.50],
      [ 0.03, L.crownY-0.01, -0.14,  0.00, 0.62],   // longest rat-tail down the spine
      [ 0.12, L.crownY-0.03, -0.11, -0.02, 0.46],
      [-0.17, L.browY+0.02, -0.10,  0.02, 0.54],    // side-locks by the ears
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

  /* ---------- ARMS — LONG and DANGLING, the troll's whole point: they hang PAST the knees, ending in
     oversized claw-fingered hands nearly at the ground. Gaunt uneven limbs (one a touch longer). No
     held item — these claws ARE the weapons. ---------- */
  const clawHand = (ctr, faceDir, hex)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    // big splayed palm block
    tube(ctr.clone().addScaledVector(d,-0.070), ctr.clone().addScaledVector(d,0.070),
         0.115, 0.100, 6, hex, {raz:0.078, rbz:0.078, capA:{hex}, capB:{hex}});
    // FOUR long claw-fingers fanning down + forward, oversized, pale bone tips (the weapons)
    for(const off of [-1.4,-0.5,0.5,1.4]){
      const kb = ctr.clone().addScaledVector(d,0.060).addScaledVector(side, off*0.058);
      const kt = kb.clone().addScaledVector(d,0.150).addScaledVector(side, off*0.020).add(V(0,-0.06,0));
      tube(kb, kt, 0.030, 0.010, 4, hex, {capB:{hex:P.clawTip, lift:0.008}});
      // pale claw sheath at the fingertip
      const ct = kt.clone().addScaledVector(d,0.055).add(V(0,-0.03,0));
      tube(kt, ct, 0.016, 0.006, 4, P.claw, {capB:{hex:P.clawTip, lift:0.008}});
    }
    // a thumb-claw jutting to the inside
    const tb = ctr.clone().addScaledVector(side, -Math.sign(ctr.x||1)*0.070).addScaledVector(d,0.020);
    const tt = tb.clone().addScaledVector(d,0.100).add(V(0,-0.04,0));
    tube(tb, tt, 0.024, 0.009, 4, hex, {capB:{hex:P.clawTip, lift:0.006}});
  };
  {
    /* LEFT arm — hangs long past the knee, big claw hand near the ground. The shoulder start is pulled
       INTO the torso (overlapping the shoulder band) + a deltoid blob bridges the seam so nothing floats. */
    const S=hunch(V(-L.shoulderX+0.06, L.shldY-0.01, 0.02));
    const E=V(-0.520, 1.10, 0.30);                           // elbow out + forward (dangling)
    const W=V(-0.560, 0.56, 0.36);                           // wrist LOW — past the knees
    { const d=hunch(V(-L.shoulderX+0.02, L.shldY, 0.03)); blob(d.x,d.y,d.z, 0.155,0.140,0.140, P.hide, 7, 4); }  // deltoid cap
    tube(S,E,0.140,0.108,6,P.hide);
    tube(E,W,0.100,0.078,6,P.hideDk);
    clawHand(W, V(-0.06,-0.55,1), P.hideLt);

    /* RIGHT arm — a touch longer + drifted forward (asymmetry), claw hand nearly at the floor */
    const S2=hunch(V(L.shoulderX-0.06, L.shldY+0.03, 0.02));  // shoulder slightly higher (uneven)
    const E2=V(0.540, 1.02, 0.34);
    const W2=V(0.580, 0.44, 0.42);                           // reaches even lower than the left
    { const d=hunch(V(L.shoulderX-0.02, L.shldY+0.04, 0.03)); blob(d.x,d.y,d.z, 0.155,0.140,0.140, P.hideLt, 7, 4); }  // deltoid cap (uneven, paler)
    tube(S2,E2,0.140,0.108,6,P.hide);
    tube(E2,W2,0.100,0.076,6,P.hideDk);
    clawHand(W2, V(0.06,-0.55,1), P.hideLt);
  }

  /* ---------- LEGS — long gaunt bent legs, knees slightly bent (the crouched stoop), splayed. Big
     splayed clawed feet. Uneven (one foot further forward). ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.03, 0.02), kneeL=V(-0.320,0.54,0.20), ankL=V(-0.340,0.12,0.10);
    const hipR=V( L.hipHalf, L.hipY-0.03, 0.00), kneeR=V( 0.340,0.52,0.10), ankR=V( 0.360,0.11,0.02);
    tube(hipL,kneeL,0.150,0.108,6,P.hide);
    tube(kneeL,ankL,0.100,0.072,6,P.hideDk);
    tube(hipR,kneeR,0.150,0.108,6,P.hide);
    tube(kneeR,ankR,0.100,0.070,6,P.hideDk);
    /* CLAWED FEET — broad low foot slabs, thick toes ending in pale claws */
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.10,0,1)]]){
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

  /* ---------- base disc (LARGE: r=0.55, same footprint class as the ogre — but the piece towers) --- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 16);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.53, 0.53, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.061,0), P.discTop);
  }
}
