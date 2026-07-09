/* dev/model-qa/creatures/mon-kobold.js — KOBOLD (REBUILD, foundry pilot, rebuild-w4 cell 8),
   HUMANOID-REPTILE family, Small, CR 1/8, realm core. Authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band. Preserves the prior pass's palette intent (rust-red scale + pale belly,
   scrappy tunnel-creature register, no clothing/gear beyond the thrown rock) and its named
   signature (the balancing tail + snout) — geometry replaced end to end for the skitter-throw.

   FEATURE CHECKLIST (the budget buys):
     1. HUMANOID-REPTILE Small biped per the digitigrade construction rule (ANATOMY-CANON quadruped
        hock logic adapted to two legs): forward-thrust knee, high backward-drawn hock, clawed toes.
     2. SIGNATURE — the balancing TAIL, whipped out hard to one side (away from the throwing arm)
        at shoulder height, countering the twisted backpedal torque — the loudest read in silhouette.
     3. Snout + tiny horns — short forward snout on a small dragonkin skull, two stub horn nubs.
     4. The throwing arm — cocked past the shoulder, wrist snapped forward, a rock just leaving the
        clawed fingers (a small trailing sphere, not gripped) — the mid-release instant.
     5. Pale belly/throat scale ladder (law-3 high-value zone) against rust-red back/limb scale.
     6. The SKITTER-THROW pose (law 5) — mid-backpedal: weight rocking onto the trailing back leg,
        lead leg kicking free off the ground, torso torqued and canted backward+away from the throw
        line, head cringing down and away from its own release, tail whipped for balance. Never a
        standing idle stance.

   POSE SENTENCE: mid-backpedal — the trailing leg planted and driving the body away, the lead leg
   kicked loose off the ground, torso wrenched back off the throw line, the right arm snapped
   forward at full extension with the rock just leaving its claws, the head flinched down and away
   from its own throw, and the tail whipped hard to the left for balance.

   Small, base disc r=0.32. Whole-object grammar: one function, one geometry frame, no anchors.
   Spine +z (front), up +y, ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w4'], cell 8,
   fn buildKobold). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildKobold(){
  /* ---------- PALETTE (kept from the prior pass — VS desaturated rust-red scale + pale belly) ---------- */
  const P = {
    scale:0x9a4a34, scaleDk:0x672f22, scaleLt:0xb56a4a,     // rust-red hide
    belly:0xd4b688, bellyDk:0xa8895a,                       // paler underbelly / throat, lifted for value contrast (R1 self-correction)
    horn:0x3a3128, hornTip:0x241f1a, nail:0x2b2620,
    eye:0xf0c860, eyeDk:0x1a0f0a,
    rock:0x8a8276, rockDk:0x625a4e,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — tiny frame, torso torqued back off the throw line. ---------- */
  const L = {
    hipY:0.330, waistY:0.375, chestY:0.450, shldY:0.500, neckY:0.525,
    hipHalf:0.086, shoulderX:0.140,
    jawY:0.545, muzzleY:0.572, browY:0.665, crownY:0.765, headTopY:0.828,
  };

  /* torso/head torque: leans BACK (away from +z throw line) and twists slightly, pivoting from
     the hip — the backpedal recoil off the release. */
  const torque = (p)=>{
    const q=p.clone().sub(V(0,L.hipY,0));
    q.applyAxisAngle(V(1,0,0), -0.30);   // lean back (opposite the old forward crouch)
    q.applyAxisAngle(V(0,1,0), 0.16);    // twist off the throw line
    return q.add(V(0,L.hipY,0));
  };

  /* ---------- TORSO — slight, reptilian, torqued back off the throw. Paler belly on the front,
     rust scale on the back/sides. No clothing. ---------- */
  stack([
    {y:L.hipY,   rx:0.104, rz:0.090, hex:P.scaleDk},
    {y:L.waistY, rx:0.098, rz:0.082, hex:P.scale},
    {y:L.chestY, rx:0.122, rz:0.098, hex:P.scale},
    {y:L.shldY,  rx:0.128, rz:0.096, hex:P.scale},
    {y:L.neckY,  rx:0.050, rz:0.048, hex:P.scaleDk},
  ], 8, {xform:torque, capTop:{hex:P.scaleDk, lift:0.004}});

  /* pale belly strip — front-arc quads over the torso loft (throat-to-gut underbelly, the
     high-value law-3 zone). Raised past the shell radius so it isn't buried. */
  {
    const yb=[L.hipY+0.01, L.waistY, L.chestY, L.shldY-0.01];
    const rr=[0.090, 0.082, 0.098, 0.096];
    const rings = yb.map((y,k)=>ring(V(0,y,0), V(0,1,0), rr[k]*1.16, rr[k]*0.94, 8, Math.PI/8).map(torque));
    for(let b=0;b<rings.length-1;b++) for(const i of [1,2]){ const i2=(i+1)%8;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], P.belly, 0.05);
    }
  }

  /* ---------- HEAD — small dragonkin skull, short forward snout, two tiny horn nubs. Flinched
     DOWN and away from the throw (extra forward+down pitch layered on the torso torque). ---------- */
  let eyeCtr=[];
  {
    const flinch = (p)=>{
      const q=torque(p).sub(torque(V(0,L.neckY,0)));
      q.applyAxisAngle(V(1,0,0), -0.22);   // chin tucks down further
      q.applyAxisAngle(V(0,1,0), 0.26);    // head turns away from the throw line
      return q.add(torque(V(0,L.neckY,0)));
    };
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.068, rz:0.072, hex:P.scale},
      {y:L.muzzleY, rx:0.080, rz:0.082, hex:P.scale},
      {y:L.browY,   rx:0.084, rz:0.076, hex:P.scale},
      {y:L.crownY,  rx:0.064, rz:0.056, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(flinch));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], flinch(V(0, L.headTopY, 0.004)), P.scaleDk);

    /* SHORT SNOUT — stubby forward wedge, tapering to a blunt nose. */
    const muzBase = flinch(V(0, L.muzzleY-0.008, 0.090));
    const muzMid  = flinch(V(0, L.muzzleY-0.024, 0.164));
    const muzTip  = flinch(V(0, L.muzzleY-0.036, 0.216));
    tube(muzBase, muzMid, 0.080, 0.058, n, P.scale, {raz:0.062, rbz:0.046, phase:ph});
    tube(muzMid, muzTip, 0.058, 0.026, n, P.scaleLt, {raz:0.046, rbz:0.020, phase:ph, capB:{hex:P.scaleDk, lift:0.010}});
    /* pale under-snout (throat) strip */
    quad(flinch(V(-0.034,L.muzzleY-0.042,0.098)), flinch(V(0.034,L.muzzleY-0.042,0.098)),
         flinch(V(0.018,L.muzzleY-0.052,0.200)), flinch(V(-0.018,L.muzzleY-0.052,0.200)), P.belly, 0.05);

    /* eyes — squeezed averted, glancing back toward the throw despite the flinch (the "did it
       land" beat); small bright dots so the flinch reads as a choice, not blindness. */
    for(const s of [-1,1]){
      const ec=flinch(V(s*0.052, L.browY+0.004, 0.070));
      eyeCtr.push(ec);
      blob(ec.x, ec.y, ec.z, 0.014, 0.012, 0.011, P.eye, 5, 3);
    }

    /* TWO TINY HORN NUBS — short back-swept stubs off the top/rear of the skull. */
    for(const s of [-1,1]){
      const hb=flinch(V(s*0.050, L.crownY-0.010, -0.016));
      const ht=flinch(V(s*0.066, L.crownY+0.044, -0.064));
      tube(hb, ht, 0.019, 0.006, 5, P.horn, {capB:{hex:P.hornTip, lift:0.006}});
    }
  }

  /* ---------- ARMS. Right = the THROWING arm, snapped forward at full extension, wrist past
     the release point, a rock just leaving the clawed fingers (small trailing sphere, gap from
     the hand). Left = flung back/out for counterbalance, claws splayed. ---------- */
  const clawHand = (ctr, faceDir, hex, spread=0.026)=>{
    const d=faceDir.clone().normalize();
    const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.022), ctr.clone().addScaledVector(d,0.022), 0.038, 0.034, 6, hex, {capA:{hex}, capB:{hex}});
    for(const off of [-0.9,0,0.9]){
      const kb=ctr.clone().addScaledVector(d,0.018).addScaledVector(side, off*spread);
      const kt=kb.clone().addScaledVector(d,0.034).addScaledVector(side, off*0.010);
      tube(kb, kt, 0.010, 0.004, 4, hex, {capB:{hex:P.nail, lift:0.003}});
    }
  };
  {
    /* right arm -> full extension throw, wrist snapped forward-down past shoulder height */
    const S=torque(V(L.shoulderX, L.shldY-0.005, 0.02));
    const E=V(0.235, 0.480, 0.290);           // elbow driven forward
    const W=V(0.255, 0.410, 0.470);           // wrist at full extension, past the body line
    tube(S,E,0.033,0.027,6,P.scale);
    tube(E,W,0.027,0.020,6,P.scale);
    const throwDir=new THREE.Vector3().subVectors(W,E).normalize();
    clawHand(W, throwDir, P.scaleLt, 0.030);
    /* the rock — mid-release, just clear of the fingers along the throw line */
    const rockC = W.clone().addScaledVector(throwDir, 0.075);
    blob(rockC.x, rockC.y, rockC.z, 0.024, 0.021, 0.023, P.rock, 6, 4);
    blob(rockC.x-0.006, rockC.y-0.004, rockC.z+0.004, 0.010, 0.009, 0.010, P.rockDk, 4, 2);

    /* left arm -> flung back/out for counterbalance, claws splayed open */
    const S2=torque(V(-L.shoulderX, L.shldY-0.005, 0.02));
    const E2=V(-0.210, 0.430, -0.130);
    const W2=V(-0.235, 0.380, -0.280);
    tube(S2,E2,0.033,0.027,6,P.scale);
    tube(E2,W2,0.027,0.020,6,P.scale);
    const backDir=new THREE.Vector3().subVectors(W2,E2).normalize();
    clawHand(W2, backDir, P.scaleLt, 0.032);
  }

  /* ---------- LEGS — digitigrade-hinted backpedal: trailing (back, -z-ish) leg planted and
     driving weight away, lead leg kicked FREE off the ground (toe clear, knee high). ---------- */
  {
    /* trailing leg (left, sx=-1) — planted, weight-bearing, driving the backpedal */
    const hipL = V(-L.hipHalf, L.hipY-0.02, -0.010);
    const kneeL= V(-0.120, 0.215, -0.110);
    const hockL= V(-0.128, 0.115, -0.045);
    const toeL = V(-0.118, 0.040, -0.130);          // planted behind, driving the push-off
    tube(hipL, kneeL, 0.046, 0.035, 6, P.scale);
    tube(kneeL, hockL, 0.033, 0.025, 6, P.scaleDk);
    tube(hockL, toeL, 0.026, 0.020, 6, P.scaleDk, {capA:{hex:P.scaleDk}});
    {
      const d=V(-0.10,0,-1).normalize();
      const heel=V(toeL.x, 0.038, toeL.z);
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(side, off*0.023);
        const tt=tb.clone().addScaledVector(d,0.066).addScaledVector(side, off*0.006);
        tube(tb, tt, 0.012, 0.005, 4, P.scaleDk, {capB:{hex:P.nail, lift:0.004}});
      }
    }

    /* lead leg (right, sx=1) — kicked free, off the ground: knee thrust high+forward, toe
       trailing clear of the floor, the mid-backpedal beat. */
    const hipR = V(0.086, L.hipY-0.02, 0.010);
    const kneeR= V(0.150, 0.290, 0.185);
    const hockR= V(0.145, 0.195, 0.150);
    const toeR = V(0.128, 0.135, 0.205);            // never reaches y=0 — kicked clear of the ground
    tube(hipR, kneeR, 0.044, 0.034, 6, P.scale);
    tube(kneeR, hockR, 0.031, 0.024, 6, P.scaleDk);
    tube(hockR, toeR, 0.025, 0.018, 6, P.scaleDk, {capA:{hex:P.scaleDk}});
    {
      const d=V(0.10,0.15,1).normalize();
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=toeR.clone().addScaledVector(side, off*0.020);
        const tt=tb.clone().addScaledVector(d,0.058).addScaledVector(side, off*0.005);
        tube(tb, tt, 0.011, 0.004, 4, P.scaleDk, {capB:{hex:P.nail, lift:0.004}});
      }
    }
  }

  /* ---------- TAIL — the SIGNATURE. Whipped out HARD to the left (opposite the throwing arm),
     roughly shoulder-height, countering the backpedal torque — the loudest silhouette read, not
     a low trailing drop. Chained from the low spine, sweeping up and OUT-and-FORWARD (+z, toward
     the dimetric camera at yaw45) so the whip clears the torso mass instead of hiding behind it
     (R1 SELF-CORRECTION: the first pass swung -x/-z, straight away from the yaw45 camera —
     it vanished behind the body in the engine render; flipped the z sweep to +z here).
     R2 CRITIC FIX: projected the landmark chain through the actual figureScene camera — the
     outer third (t3->tip) tapered to 0.018-0.009 radius (diameter 0.036-0.018u), BELOW the
     0.04u law-3 feature floor, so it dissolved into a thin disconnected fleck at 1/3-res
     (readable in the r2 capture only as an ambiguous fragment near the head, easily mistaken
     for a leg). Fix: floor every segment's diameter above 0.04u, and swap the outer half from
     scaleLt/scaleDk to the PALE belly tones so the tail's tip — not the belly patch — carries
     the law-3 high-value zone, the loud signature the laws require. */
  {
    const root = V(-0.02, L.hipY-0.04, -0.060);
    const t1   = V(-0.150, L.waistY+0.06,  0.045);
    const t2   = V(-0.300, L.chestY+0.02,  0.150);
    const t3   = V(-0.410, L.chestY-0.02,  0.130);
    const t4   = V(-0.475, L.chestY-0.05,  0.040);
    const tip  = V(-0.480, L.chestY+0.04, -0.045);   // tip curls back — the balancing flick
    tube(root, t1, 0.070, 0.056, 8, P.scale,   {phase:Math.PI/8});
    tube(t1,   t2, 0.056, 0.042, 8, P.scale,   {phase:Math.PI/8});
    tube(t2,   t3, 0.042, 0.032, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t3,   t4, 0.032, 0.024, 8, P.belly,   {phase:Math.PI/8});
    tube(t4,   tip,0.024, 0.021, 8, P.belly,   {phase:Math.PI/8, capB:{hex:P.bellyDk, lift:0.008}});
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.305, 0.305, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
