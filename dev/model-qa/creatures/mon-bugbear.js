/* dev/model-qa/creatures/mon-bugbear.js — the BUGBEAR landmark table (HUMANOID, long-armed
   hunched-power build, Medium, CR 1, realm core), REBUILT under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (2026-07-08 foundry pilot, rebuild-w4 cell 1). Core identity kept from the
   prior pass: the ambush heavy — a huge hairy goblinoid whose arms reach the knees. Geometry
   replaced end to end for the DIRECTION brief's ambush-spring pose + spiked MORNINGSTAR (was a
   plain club) — palette intent (dusty-brown shag fur, pale tan muzzle, iron spikes) preserved.

   FEATURE CHECKLIST (the ~1,500-1,900 budget buys):
     1. HUMANOID torso per ANATOMY-CANON (PC-kit grammar): hip/waist/rib/chest/shoulder/neck loft,
        pitched forward hard into a CROUCH (not the old standing hunch) so the spine coils low and
        forward-loaded — the ambush-spring read starts at the torso angle.
     2. SIGNATURE — the too-long arms + a spiked MORNINGSTAR: right arm trails back and low with a
        chained/hafted morningstar (spiked ball head, thickest/highest-value zone on the model);
        left arm reaches forward and SPLAYED WIDE, claws spread, balancing the pounce.
     3. Anatomy tell — disproportionately long arms, knuckles/paw well below knee height even in
        the crouch, the goblinoid-family exaggeration law 4 calls for.
     4. Shaggy lumpy fur torso — uneven overlapping band radii + ragged tuft quads, dusty brown
        with a wide value ladder so the silhouette separates instead of muddying to one blob.
     5. Head — wide flat nose, small mean amber eyes under a heavy fur brow, PALE tan muzzle (the
        law-3 high-value zone on the face), short rounded fur-backed ears, head low and thrust
        forward off the coiled neck.
     6. Rear haunches loaded low, back leg driving, front leg planted forward — the mid-pounce
        weight transfer (crouched low, about to spring), big flat clawed feet.

   POSE SENTENCE: crouched low mid-pounce — weight coiled back over a loaded rear leg, the front
   leg already planted and driving forward, torso pitched down and forward, the spiked
   morningstar trailing low behind the cocked right arm while the long left arm reaches out ahead
   splayed wide, claws spread — the half-second before the ambush lands, never an upright stance.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w4'], cell 1, fn buildBugbear). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildBugbear(){
  /* ---------- PALETTE (VS desaturated; dusty brown fur, TAN muzzle — kept from the prior pass).
     Deliberately WIDE value spread so the shaggy silhouette separates instead of muddying into
     one brown blob: bright dusty highlights on the raised fur, deep shadow in the cavities, a
     clearly pale tan face, and near-white iron spikes carrying the signature's high-value zone. */
  const P = {
    fur:0x8a7350, furDk:0x4a3b28, furLt:0xa89066, furGrey:0x746850,   // dusty brown, wide value range
    muzzle:0xc2ac82, muzzleDk:0x8f7a56, muzzleLt:0xd8c299,             // PALE tan face/muzzle — pops off the fur
    nose:0x2e241d, ear:0x9a8460, earDk:0x5f4c34,
    wood:0x7a5c38, woodDk:0x3f2f1a, woodLt:0x967248,                   // haft/chain wood+iron — lightened from the
                                                                        // original 0x5a4326/0x6e5432 (too close to the
                                                                        // void tone, the haft was dissolving on-screen)
    spike:0xc4c9ce, spikeDk:0x767c82, spikeLt:0xe6e9ec, lash:0x463522, // near-white iron spikes — high-value signature
    ballIron:0x565b60,
    claw:0x241f19, palm:0x8a745a,
    eye:0xcfbb44, eyeDk:0x14100a,                                       // small mean amber eyes
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — CROUCH frame: hips dropped low, the whole trunk pitched forward hard
     over a loaded rear leg so the coil is unmistakable pre-pounce (steeper + lower than the old
     standing hunch, which pitched about a higher hip). ---------- */
  const L = {
    hipY:0.62, waistY:0.72, ribY:0.85, chestY:0.98, shldY:1.08, neckY:1.13,
    hipHalf:0.150, shoulderX:0.320,
    jawY:1.16, cheekY:1.225, browY:1.30, crownY:1.385, headTopY:1.45,
  };

  /* crouch pitch — pitch the whole upper body forward hard about the hips so the shoulders roll
     over and the head drops in front and low (mid-pounce coil). Steeper than a standing hunch. */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.44);                        // hard forward pitch — coiled, not upright
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- SPIKED MORNINGSTAR FIRST — held low and BACK, trailing off the cocked right arm as
     it swings into the pounce. Chain-wrapped haft + a broad spiked iron ball head (the loudest,
     highest-value zone on the model). Grip is ground truth (the fist derives from it). ---------- */
  const GRIP = hunch(V(0.40, 0.50, -0.06));                 // low, out right, trailing BACK (-z) — CROUCH frame
  const BALL = hunch(V(0.60, 0.56, -0.22));                 // ball swings back and OUT to the side — pulled off the
                                                             // arm's z-depth so the haft isn't foreshortened edge-on
                                                             // to camera / hidden behind the forearm mass (was
                                                             // -0.38z: nearly co-linear with the view axis, so the
                                                             // connecting haft vanished behind the arm on screen)
  const HAFT = new THREE.Vector3().subVectors(BALL, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(HAFT, -0.24);
  {
    tube(BUTT, BUTT.clone().addScaledVector(HAFT,0.05), 0.046, 0.046, 6, P.woodLt, {capA:{hex:P.woodDk, lift:0.02}});
    tube(BUTT.clone().addScaledVector(HAFT,0.05), GRIP.clone().addScaledVector(HAFT,-0.08), 0.046, 0.050, 6, P.woodLt);
    tube(GRIP.clone().addScaledVector(HAFT,-0.08), GRIP.clone().addScaledVector(HAFT,0.08), 0.056, 0.056, 6, P.wood); // wrapped grip
    tube(GRIP.clone().addScaledVector(HAFT,0.08), BALL.clone().addScaledVector(HAFT,-0.09), 0.050, 0.058, 6, P.woodLt); // shaft to the ball — fattened well past the naive 1/3-res floor: this segment runs near-parallel to the camera view axis (isometric foreshortening), so it needs real bulk, not just enough radius for a broadside view, to bridge the fist-to-ball gap on screen
    /* mid-haft iron collar — a fat overlapping band straddling the fist-to-ball midpoint. The thin
       haft alone kept dissolving under the camera's foreshortened view of this swing (proven with
       debug markers: a fat blob at the midpoint reliably reads, a thin cylinder along this exact
       axis does not) — this collar is the guaranteed bridge, and doubles as a weapon detail. */
    tube(GRIP.clone().lerp(BALL,0.42).addScaledVector(HAFT,-0.05), GRIP.clone().lerp(BALL,0.42).addScaledVector(HAFT,0.05),
         0.095, 0.088, 6, P.ballIron, {capA:{hex:P.spikeDk}, capB:{hex:P.spikeDk}});

    /* the iron ball head — a small stacked-ring sphere-ish core so it reads as a distinct mass,
       then a full radial ring of spikes so it silhouettes as a bristling ball, not a knob. */
    const ballC = BALL.clone();
    const bRings = [];
    for(const [dy,rr] of [[-0.075,0.030],[-0.038,0.052],[0,0.062],[0.038,0.052],[0.072,0.028]]){
      bRings.push(ring(ballC.clone().add(V(0,dy,0)), HAFT, rr, rr, 8, 0).map(p=>p));
    }
    stitch(bRings, ()=>P.ballIron);
    capFan(bRings.at(-1), ballC.clone().add(V(0,0.09,0)), P.ballIron);
    capFan(bRings[0], ballC.clone().add(V(0,-0.10,0)), P.ballIron, true);

    /* radial spikes off the ball — near-white so the whole signature carries the law-3 high-value
       zone even in deep shadow */
    const up=V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, HAFT).normalize();
    const w = new THREE.Vector3().crossVectors(HAFT, u).normalize();
    const spikeAt = (dyFrac, ang)=>{
      const c = ballC.clone().add(V(0, dyFrac*0.062, 0));
      const dir = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang)).normalize();
      const base = c.clone().addScaledVector(dir, 0.050);
      const tip  = c.clone().addScaledVector(dir, 0.155);
      tube(base, tip, 0.024, 0.005, 4, P.spike, {capB:{hex:P.spikeLt, lift:0.006}, capA:{hex:P.spikeDk}});
    };
    for(let r=0;r<6;r++) spikeAt(0.6, r/6*Math.PI*2);
    for(let r=0;r<6;r++) spikeAt(-0.5, r/6*Math.PI*2 + 0.5);
    /* tip spikes fore/aft along the haft axis */
    tube(ballC.clone().add(V(0,0.095,0)), ballC.clone().addScaledVector(HAFT,0.18), 0.022, 0.005, 4, P.spike, {capB:{hex:P.spikeLt, lift:0.005}});
  }

  /* ---------- TORSO — LUMPY shaggy fur, NOT a smooth loft. Uneven overlapping band radii (each
     band bulged a different amount) give the mangy silhouette; ragged tuft quads added after. ---------- */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.195, hex:P.furDk},
    {y:L.waistY, rx:0.255, rz:0.205, hex:P.fur},             // waist BULGES wider than hips (lumpy)
    {y:L.ribY,   rx:0.290, rz:0.215, hex:P.furGrey},
    {y:L.chestY, rx:0.335, rz:0.235, hex:P.fur},             // barrel chest
    {y:L.shldY,  rx:0.360, rz:0.230, hex:P.furLt},           // huge rolled shoulders
    {y:L.neckY,  rx:0.180, rz:0.170, hex:P.furDk},           // thick furred neck stump
  ], 8, {xform:hunch, capTop:{hex:P.furDk, lift:0.006}});

  /* lumpy fur overlay — extra bulged partial bands riding proud of the torso at uneven heights,
     each offset so the silhouette never reads smooth */
  for(const [y,rx,rz,cx,hex] of [
    [L.chestY+0.02, 0.180, 0.150, -0.12, P.furDk],
    [L.ribY+0.03,   0.165, 0.140,  0.14, P.fur],
    [L.waistY+0.02, 0.150, 0.130,  0.10, P.furGrey],
    [L.shldY-0.04,  0.160, 0.140, -0.15, P.furLt],
  ]){
    const rings=[
      ring(V(cx,y-0.05,0.03), V(0,1,0), rx*0.85, rz*0.85, 7, Math.PI/7).map(hunch),
      ring(V(cx,y+0.05,0.03), V(0,1,0), rx, rz, 7, Math.PI/7).map(hunch),
    ];
    stitch(rings, ()=>hex);
    capFan(rings[1], hunch(V(cx,y+0.11,0.03)), hex);
  }

  /* ragged tuft quads at the shoulders (the shaggy fringe) */
  for(const s of [-1,1]){
    for(const [dy,len,zk] of [[0.0,0.11,0.02],[0.06,0.08,-0.03],[-0.05,0.09,0.04]]){
      const base = hunch(V(s*0.30, L.shldY+dy, 0.10+zk));
      quad(base, base.clone().add(V(s*0.05,len,zk)), base.clone().add(V(s*0.09,len*0.55,zk*1.5)), base, s>0?P.furDk:P.fur, 0.08);
    }
  }

  /* ---------- HEAD — wide flat nose, small mean eyes under a heavy FUR brow, tan muzzle. Sits LOW
     and jutting forward on the coiled neck. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.140, rz:0.150, hex:P.muzzle},        // muzzle juts forward (rz>rx)
      {y:L.cheekY, rx:0.170, rz:0.152, hex:P.muzzleLt},      // pale tan face — the bright read
      {y:L.browY,  rx:0.166, rz:0.138, hex:P.fur},           // furred upper head starts here
      {y:L.crownY-0.02, rx:0.128, rz:0.114, hex:P.fur},      // rounder skull, pulled in
      {y:L.crownY+0.05, rx:0.078, rz:0.070, hex:P.furDk},    // extra dome band → loses the flat-cap look
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* WIDE FLAT NOSE — push the jaw/muzzle front verts forward (broad, not a hook); keep it low + wide */
    for(const i of [1,2]){ rings[0][i].z += 0.048; }
    for(const i of [1,2]){ rings[1][i].z += 0.030; rings[1][i].y -= 0.010; }
    /* HEAVY FUR BROW — shove the brow front verts forward + down for a shelf over the small eyes */
    for(const i of [1,2]){ rings[2][i].z += 0.058; rings[2][i].y -= 0.016; }
    for(const i of [0,3]){ rings[2][i].z += 0.030; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.headTopY+0.02, -0.01)), P.furDk);

    /* wide flat nose pad — a dark broad quad on the muzzle front */
    {
      const c = hunch(V(0, L.jawY+0.03, 0.198));
      quad(c.clone().add(V(-0.040,-0.020,0)), c.clone().add(V(0.040,-0.020,0)),
           c.clone().add(V(0.028,0.020,-0.006)), c.clone().add(V(-0.028,0.020,-0.006)), P.nose, 0.03);
    }
    /* small mean amber eyes under the brow shelf */
    for(const s of [-1,1]){
      const c = hunch(V(s*0.075, L.browY-0.010, 0.150));
      quad(c.clone().add(V(-0.018,-0.010,0)), c.clone().add(V(0.018,-0.010,0)),
           c.clone().add(V(0.014,0.010,-0.004)), c.clone().add(V(-0.014,0.010,-0.004)), P.eye, 0.05);
    }
    /* fur brow tufts — a couple of small tuft quads riding the brow ridge for the shaggy read */
    for(const s of [-1,1]){
      const base = hunch(V(s*0.09, L.browY+0.02, 0.16));
      quad(base, base.clone().add(V(s*0.03,0.05,-0.03)), base.clone().add(V(s*0.05,0.03,-0.05)), base, P.furDk, 0.08);
    }

    /* EARS — rounded fur-backed ears set back on the sides (bugbear = bear-ish), short */
    for(const s of [-1,1]){
      const eb = hunch(V(s*0.165, L.browY+0.02, -0.03));
      const et = hunch(V(s*0.215, L.crownY+0.03, -0.10));
      tube(eb, et, 0.052, 0.020, 5, P.ear, {raz:0.032, rbz:0.014, capA:{hex:P.earDk}, capB:{hex:P.earDk, lift:0.006}});
    }
  }

  /* ---------- ARMS — DISPROPORTIONATELY LONG, the ambush-spring pose. Right arm trails BACK and
     LOW to the morningstar grip (mid-swing cock); left arm reaches FORWARD and SPLAYED WIDE, big
     clawed hand spread, balancing the pounce. Thick furred. ---------- */
  const bigPaw = (ctr, faceDir, hex, spread=1)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.040), ctr.clone().addScaledVector(d,0.040),
         0.070, 0.062, 6, hex, {raz:0.045, rbz:0.045, capA:{hex}, capB:{hex}});
    for(const off of [-1.3,-0.5,0.5,1.3]){                    // 4 splayed claws (wider fan for the splayed hand)
      const kb = ctr.clone().addScaledVector(d,0.034).addScaledVector(side, off*0.034*spread);
      const kt = kb.clone().addScaledVector(d,0.075).addScaledVector(side, off*0.030*spread);
      tube(kb, kt, 0.017, 0.006, 4, hex, {capB:{hex:P.claw, lift:0.005}});
    }
  };
  {
    /* right arm -> morningstar fist (trailing low + back, cocked to swing forward) */
    const S=hunch(V(L.shoulderX, L.shldY-0.02, 0.02));
    const FIST=GRIP.clone();
    const E=hunch(V(0.460, 0.62, -0.12));                     // elbow trails back + low — CROUCH frame (matches S/GRIP)
    tube(S,E,0.105,0.084,6,P.fur);
    tube(E, FIST.clone().addScaledVector(HAFT,-0.04), 0.082,0.064,6,P.furDk);
    tube(FIST.clone().addScaledVector(HAFT,-0.06), FIST.clone().addScaledVector(HAFT,0.06), 0.072,0.066,6,P.palm,
         {capA:{hex:P.palm}, capB:{hex:P.palm}});
    /* forearm tuft quads (shaggy) */
    for(const [dy,len] of [[0.0,0.07],[-0.06,0.06]]){
      const base=E.clone().add(V(0.02,dy,-0.04));
      quad(base, base.clone().add(V(0.04,len,-0.03)), base.clone().add(V(0.07,len*0.5,-0.05)), base, P.furDk, 0.08);
    }

    /* left arm -> LONG reach FORWARD, splayed clawed hand well ahead of the body, low (pounce
       balance — knuckles still well below knee height even reaching forward-low) */
    const S2=hunch(V(-L.shoulderX, L.shldY-0.02, 0.02));
    const E2=hunch(V(-0.400, 0.50, 0.28));
    const W2=hunch(V(-0.300, 0.32, 0.56));                    // wrist reaches well out front, low — CROUCH frame (matches S2)
    tube(S2,E2,0.105,0.084,6,P.fur);
    tube(E2,W2,0.082,0.062,6,P.furDk);
    bigPaw(W2, V(-0.14,-0.12,1), P.palm, 1.25);
    for(const [dy,len] of [[0.0,0.07],[-0.07,0.06]]){
      const base=E2.clone().add(V(-0.02,dy,-0.03));
      quad(base, base.clone().add(V(-0.04,len,-0.03)), base.clone().add(V(-0.07,len*0.5,-0.05)), base, P.fur, 0.08);
    }
  }

  /* ---------- LEGS — mid-pounce weight transfer: rear leg loaded low and coiled (deep bend, hip
     drawn back), front leg already planted forward and driving. BIG FLAT FEET. ---------- */
  {
    /* rear (left) leg — deeply coiled, hip drawn back and low */
    const hipL=V(-L.hipHalf, L.hipY-0.02, -0.06), kneeL=V(-0.260,0.30,-0.02), ankL=V(-0.225,0.070,0.10);
    /* front (right) leg — planted forward, driving, straighter */
    const hipR=V( L.hipHalf, L.hipY-0.02,  0.04), kneeR=V( 0.270,0.36,0.34), ankR=V( 0.235,0.075,0.42);
    tube(hipL,kneeL,0.135,0.098,6,P.fur);
    tube(kneeL,ankL,0.092,0.068,6,P.furDk);
    tube(hipR,kneeR,0.128,0.094,6,P.fur);
    tube(kneeR,ankR,0.088,0.064,6,P.furDk);
    /* BIG FLAT FEET — broad low foot slabs with splayed clawed toes, oriented to each leg's stance */
    for(const [ank,toeDir] of [[ankL,V(-0.08,0,0.85)], [ankR,V(0.10,0,1.15)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.048,ank.z);
      tube(heel.clone().addScaledVector(d,-0.02), heel.clone().addScaledVector(d,0.150), 0.078,0.058,6,P.palm,
           {raz:0.038, rbz:0.026, capA:{hex:P.furDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.140).addScaledVector(side, off*0.048);
        const tt=tb.clone().addScaledVector(d,0.045).addScaledVector(side, off*0.008);
        tube(tb, tt, 0.020,0.007,4,P.palm,{capB:{hex:P.claw, lift:0.005}});
      }
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
