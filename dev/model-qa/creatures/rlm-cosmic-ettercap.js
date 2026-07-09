/* dev/model-qa/creatures/rlm-cosmic-ettercap.js — COSMIC realm, cosmic-w1 cell 8.
   ETTERCAP — Medium, CR 2. The spider-man shepherd of webs: an extra-jointed ex-fisherman still
   casting lines with unnatural reach. Hunched biped torso fused with a spider abdomen slung behind
   the hips, extra-long forearms ending in spinneret fingers.

   FEATURE CHECKLIST (the budget buys): (1) hunched humanoid torso+head with fang chelicerae
   flanking a small mouth, (2) spider abdomen (bulbous, banded, pinched waist) slung low/back off
   the hips — the ARTHROPOD tell, (3) FOUR extra-jointed arachnid legs anchored at the hip/abdomen
   join (knees riding above the body per the arthropod law), (4) two humanoid arms but abnormally
   long/multi-jointed (shoulder-elbow-WRIST-elbow2 before the spinneret hand) — the "extra-jointed"
   flavor tell, (5) the SIGNATURE: one arm swept high and back trailing a pale ghost-white WEB
   STRAND arcing off the spinneret fingers (the >=140 RGB high-value zone), the other arm low and
   gathering, fingers splayed as if reeling a line in.

   POSE SENTENCE: the line-cast — weight sunk into a deep hunch over bent hind legs, the cast arm
   swept high-and-back trailing the web strand off its fingertips (the loudest, palest shape in the
   frame), the gather arm low and drawn in tight to the gut, head thrust forward on a bowed neck
   with fang chelicerae leading the silhouette, abdomen counter-weighting low and back off the hips.

   SPINE-GESTURE SENTENCE: hip->shoulder->skull axis is a deep forward-leaning C-curve (the hunch),
   continued at the top by the neck driving the head further forward past the knees, and balanced
   at the bottom by the abdomen mass hanging back off the pelvis — a single unbroken lean, not a
   plumb column with limbs bolted on.

   Whole-object grammar: one exported build fn, ground y=0. Spine +z (front), up +y.
   Palette: chitin-violet body kept well OFF the void floor (>=60 RGB over 10,9,8); the SIGNATURE
   web strand + spinneret glow run near-white ghost-blue (>=140 RGB) as the one loud zone per law 3.
   COSMIC dark-on-dark warning respected — no pure-black masses; darkest chitin still reads ~40+ RGB. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

const P = {
  chitin:    0x6e5a8c,   // main torso/limb chitin — violet, well off the void
  chitinDk:  0x483c66,   // shade
  chitinLt:  0x8c76ac,   // highlight band
  abdomen:   0x5a4a7c,   // abdomen base
  abdomenDk: 0x3a2f56,
  abdomenBand: 0x8270a2, // banded stripe on abdomen
  leg:       0x564a76,
  legDk:     0x362c50,
  fang:      0x201a30,
  mouth:     0x14101f,
  eye:       0xd8c8ff,
  eyeGlow:   0xe8f0ff,
  web:       0xecf4ff,   // SIGNATURE — the cast web strand, near-white ghost-blue (>=140 RGB)
  webDk:     0xb8d4f0,
  spinneret: 0xf0f6ff,
  disc:      0x241f36,
  discTop:   0x342c4c,
};

/* one web-strand segment — a thinning tube arcing off the fingertips, capped pale at the far end. */
function webStrand(pts, r0){
  for(let i=0;i<pts.length-1;i++){
    const t = i/(pts.length-2);
    const ra = r0*(1-t*0.7);
    const rb = r0*(1-(t+1/(pts.length-1))*0.7);
    tube(pts[i], pts[i+1], Math.max(ra,0.006), Math.max(rb,0.004), 4, P.web, { phase: Math.PI/4 });
  }
  const tip = pts[pts.length-1];
  blob(tip.x, tip.y, tip.z, 0.018, 0.018, 0.018, P.spinneret, 5, 3);
}

export function buildEttercap(){
  /* ---------- LANDMARKS — deep forward hunch, head thrust past the knees. ---------- */
  const S = {
    hip:    V(0, 0.58, -0.02),
    waist:  V(0.02, 0.76, 0.06),
    chest:  V(0.02, 0.92, 0.16),
    shldr:  V(0.0, 1.04, 0.20),
    neck:   V(0.0, 1.12, 0.30),
    head:   V(0.0, 1.18, 0.40),   // head driven forward past the hip line — the hunch payoff
  };

  /* ---------- ABDOMEN — bulbous, banded, slung low/back off the hips (the arthropod tell). ---- */
  {
    blob(-0.01, 0.52, -0.34, 0.19, 0.165, 0.22, P.abdomen, 9, 6);
    blob(0.0, 0.40, -0.42, 0.155, 0.13, 0.18, P.abdomenDk, 8, 5);
    // pinch (pedicel) tying abdomen to the hip mass
    blob(0.0, 0.58, -0.14, 0.06, 0.05, 0.06, P.chitinDk, 6, 3);
    // banded stripes across the abdomen top
    for(const dz of [-0.20,-0.30,-0.40]){
      quad(V(-0.10,0.60,dz), V(0.10,0.60,dz), V(0.09,0.50,dz-0.03), V(-0.09,0.50,dz-0.03), P.abdomenBand, 0.05);
    }
    // spinnerets at the abdomen tip
    blob(0.0, 0.36, -0.53, 0.03, 0.026, 0.03, P.abdomenDk, 5, 3);
  }

  /* ---------- TORSO — lean hunched humanoid, pinched waist into the abdomen join. ---------- */
  {
    const n=9, ph=Math.PI/n;
    tube(S.hip, S.waist,   0.135, 0.115, n, P.chitinDk, {phase:ph});
    tube(S.waist, S.chest, 0.115, 0.135, n, P.chitin,   {phase:ph});
    tube(S.chest, S.shldr, 0.135, 0.095, n, P.chitinLt, {phase:ph});
    tube(S.shldr, S.neck,  0.095, 0.055, n, P.chitinDk, {phase:ph});
    tube(S.neck, S.head,   0.055, 0.070, n, P.chitin,   {phase:ph});
    // rib/chitin plating slivers down the flank
    for(const dz of [-0.02,0.03,0.08]){
      quad(V(-0.11,S.waist.y-0.02+dz*0.2,S.waist.z-0.02+dz*0.3), V(-0.09,S.waist.y-0.02+dz*0.2,S.waist.z-0.02+dz*0.3),
           V(-0.10,S.chest.y+dz*0.2,S.chest.z+0.02+dz*0.3), V(-0.12,S.chest.y+dz*0.2,S.chest.z+0.02+dz*0.3), P.chitinDk, 0.05);
    }
  }

  /* ---------- HEAD — thrust forward, fang chelicerae leading, small pale eye cluster. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.head.y-0.06, cz:S.head.z-0.02, rx:0.085, rz:0.095, hex:P.chitin},
      {y:S.head.y+0.03, cz:S.head.z,      rx:0.090, rz:0.090, hex:P.chitinLt},
      {y:S.head.y+0.12, cz:S.head.z-0.03, rx:0.065, rz:0.070, hex:P.chitinDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(0,S.head.y+0.19,S.head.z-0.03), P.chitinDk);
    // small pale eye cluster, forward-facing
    for(const [dx,dy] of [[-0.045,0.045],[0.045,0.045],[-0.02,0.065],[0.02,0.065],[0,0.02]]){
      blob(dx, S.head.y+dy, S.head.z+0.085, 0.012, 0.012, 0.012, P.eye, 4, 2);
    }
    blob(0, S.head.y+0.04, S.head.z+0.10, 0.006, 0.006, 0.006, P.eyeGlow, 3, 2);
    // fang chelicerae flanking a small dark mouth
    quad(V(-0.05,S.head.y-0.075,S.head.z+0.075), V(0.05,S.head.y-0.075,S.head.z+0.075),
         V(0.038,S.head.y-0.12,S.head.z+0.09), V(-0.038,S.head.y-0.12,S.head.z+0.09), P.mouth, 0.04);
    capFan(ring(V(-0.045,S.head.y-0.07,S.head.z+0.08), V(-0.2,-0.7,1), 0.020,0.020,5,0), V(-0.065,S.head.y-0.16,S.head.z+0.14), P.fang);
    capFan(ring(V(0.045,S.head.y-0.07,S.head.z+0.08), V(0.2,-0.7,1), 0.020,0.020,5,0), V(0.065,S.head.y-0.16,S.head.z+0.14), P.fang);
  }

  /* ---------- ARMS — extra-jointed (shoulder-elbow-wrist-elbow2-hand), abnormally long. ----------
     CAST arm (+x, right): swept high and back, trailing the SIGNATURE web strand off the spinneret
     fingers. GATHER arm (-x, left): low, drawn tight to the gut, fingers splayed reeling a line in.
     Shoulders ride with the cast arm (right shoulder lifted) per POSE-ANATOMY law 3; hips/abdomen
     counter-weight low-back to keep the pose from toppling (law 4). */
  {
    // CAST arm — +x — high sweep, four segments, then the web strand payload.
    const shR   = V(0.14, S.shldr.y+0.03, S.shldr.z-0.01);   // shoulder rides UP with the reach
    const elbow1= V(0.26, S.shldr.y+0.12, S.shldr.z-0.08);   // swings up-and-back
    const wrist = V(0.33, S.shldr.y+0.24, S.shldr.z-0.22);   // extra joint — the "unnatural reach"
    const elbow2= V(0.35, S.shldr.y+0.34, S.shldr.z-0.34);
    const hand  = V(0.33, S.shldr.y+0.40, S.shldr.z-0.44);
    tube(shR, elbow1, 0.052, 0.040, 6, P.chitin,   {phase:Math.PI/6});
    tube(elbow1, wrist, 0.040, 0.030, 6, P.chitinDk,{phase:Math.PI/6});
    tube(wrist, elbow2, 0.030, 0.022, 6, P.chitin,  {phase:Math.PI/6});
    tube(elbow2, hand,  0.022, 0.015, 6, P.chitinDk,{phase:Math.PI/6});
    // spinneret fingers, splayed, fanning outward from the hand
    for(const [dx,dy,dz] of [[-0.05,0.02,0.03],[0.0,0.03,0.05],[0.05,0.02,0.03],[0.02,-0.02,0.05]]){
      tube(hand, V(hand.x+dx,hand.y+dy,hand.z+dz), 0.010, 0.004, 4, P.chitinDk, {capB:{hex:P.spinneret}});
    }
    // the SIGNATURE web strand — arcs off the fingertips, high-value pale zone.
    webStrand([
      V(hand.x+0.01, hand.y+0.01, hand.z+0.03),
      V(hand.x+0.10, hand.y-0.03, hand.z-0.08),
      V(hand.x+0.15, hand.y-0.11, hand.z-0.22),
      V(hand.x+0.12, hand.y-0.22, hand.z-0.40),
      V(hand.x+0.03, hand.y-0.30, hand.z-0.56),
    ], 0.020);

    // GATHER arm — -x — low, tight to the gut, reeling a line in.
    const shL   = V(-0.13, S.shldr.y-0.02, S.shldr.z-0.01);
    const elbowL1 = V(-0.20, S.chest.y-0.06, S.chest.z+0.10);
    const wristL  = V(-0.14, S.waist.y-0.02, S.waist.z+0.16);
    const elbowL2 = V(-0.08, S.waist.y-0.10, S.waist.z+0.10);
    const handL   = V(-0.02, S.waist.y-0.14, S.waist.z+0.04);
    tube(shL, elbowL1, 0.050, 0.038, 6, P.chitin,   {phase:Math.PI/6});
    tube(elbowL1, wristL, 0.038, 0.028, 6, P.chitinDk,{phase:Math.PI/6});
    tube(wristL, elbowL2, 0.028, 0.020, 6, P.chitin,  {phase:Math.PI/6});
    tube(elbowL2, handL,  0.020, 0.014, 6, P.chitinDk,{phase:Math.PI/6});
    for(const [dx,dy,dz] of [[-0.03,0.0,0.03],[0.0,0.01,0.04],[0.03,0.0,0.02]]){
      tube(handL, V(handL.x+dx,handL.y+dy,handL.z+dz), 0.009, 0.004, 4, P.chitinDk, {capB:{hex:P.spinneret}});
    }
    // a short gathered loop of line already reeled in at the gather hand
    webStrand([
      V(handL.x, handL.y-0.01, handL.z+0.03),
      V(handL.x-0.05, handL.y-0.02, handL.z-0.02),
      V(handL.x-0.02, handL.y-0.05, handL.z-0.06),
    ], 0.012);
  }

  /* ---------- FOUR ARACHNID HIND LEGS — anchored at the hip/abdomen join, knees ABOVE the body
     line per the ARTHROPOD family law (femur up-and-out, tibia down past vertical, thin tarsus). --- */
  {
    const hips = [
      { z: 0.10, dz:  1.0, frontBias:  0.9 },   // front pair
      { z: -0.10, dz: -0.7, frontBias: -0.6 },   // rear pair
    ];
    const frontBias = (h) => h.dz > 0 ? 1 : -1;
    hips.forEach((h) => {
      for(const s of [-1,1]){
        const base = V(s*0.14, S.hip.y-0.08, h.z);
        const kneeOut = 0.22;
        const knee = V(base.x + s*kneeOut + frontBias(h)*0.06, S.hip.y+0.06, base.z + h.dz*kneeOut*0.6 + frontBias(h)*0.05);
        tube(base, knee, 0.048, 0.036, 6, P.leg, {phase:Math.PI/6});
        const ankleOut = kneeOut + 0.32;
        const ankle = V(base.x + s*ankleOut, 0.16, base.z + h.dz*ankleOut*0.6);
        tube(knee, ankle, 0.036, 0.022, 6, P.legDk, {phase:Math.PI/6});
        const foot = V(base.x + s*(ankleOut+0.12), 0.02, base.z + h.dz*(ankleOut+0.12)*0.6);
        tube(ankle, foot, 0.022, 0.010, 5, P.legDk, {phase:Math.PI/6, capB:{hex:P.legDk}});
      }
    });
  }

  /* ---------- LEGS (humanoid hind legs, bent, bracing the hunch) ---------- */
  for(const s of [-1,1]){
    const hip  = V(s*0.10, S.hip.y-0.04, -0.02);
    const knee = V(s*0.12, 0.32, 0.10);        // knee driven forward under the hunch
    const foot = V(s*0.10, 0.02, -0.02);
    tube(hip, knee, 0.070, 0.050, 7, P.chitinDk, {phase:Math.PI/7});
    tube(knee, foot, 0.050, 0.032, 7, P.chitin,  {phase:Math.PI/7, capB:{hex:P.legDk}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.047,0), P.discTop);
  }
}
