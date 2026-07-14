/* dev/model-qa/creatures/mon-deepstalker.js — the BLIND DEEP STALKER (bespoke Medium Aberration).
   Adam's QA-review ruling 2026-07-04: it was an amorphous blob (no registry/sub entry -> cuboid
   fallback). The bestiary blind-deep-stalker is a Medium Aberration — an eyeless Underdark predator
   that fights with a Bone Cudgel and deals psychic damage. Built as a PROPER PREDATORY SILHOUETTE:
   a lean, hunched, elongated humanoid stalker — a smooth EYELESS head (no eyes at all — fits both
   the "blind" flavour AND the house eye-removal ruling) that is mostly a wide gaping FANGED MAW,
   long sinewy grasping arms tipped with hooked claws, a forward-stooped predatory crouch, digitigrade
   legs, and a crude BONE CUDGEL gripped in one fist (authored FIRST; the fist derives from the grip).
   Pallid cave-dweller flesh — dead grey-mauve, no pigment, with darker sinew shadows. Whole-object
   grammar: one function, one geometry frame, no anchors. Medium: ~1.5u tall, base disc r=0.42.
   Imported by mon-deepstalker-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDeepStalker(){
  /* ---------- PALETTE (pallid, pigmentless cave flesh; dead grey-mauve; dark sinew) ---------- */
  const P = {
    flesh:0x9a8892, fleshDk:0x6b5c66, fleshLt:0xb6a4ae,       // pallid grey-mauve cave skin
    sinew:0x504048, sinewDk:0x392e34,                          // dark sinew/vein shadows
    maw:0x1f151b, gum:0x74424e, fang:0xd8cdba,                 // dark gaping maw + pale fangs
    claw:0x2a2228, nail:0xcabaa8,                              // hooked dark claws / pale nail tips
    bone:0xc7bda0, boneDk:0x9a9078, boneBind:0x4a3a2a,         // the bone cudgel + its cord binding
    disc:0x3f362d, discTop:0x4c4238,
  };

  /* ---------- LANDMARKS — lean, elongated, forward-stooped. Head thrust FORWARD low (the stalk). --- */
  const L = {
    hipY:0.70, waistY:0.80, chestY:0.98, shldY:1.14, neckY:1.16,
    hipHalf:0.105, shoulderX:0.230,
  };
  /* forward stoop: pitch the upper body + head forward over the legs (predatory stalk) */
  const stoop = (p)=>{ const q=p.clone().sub(V(0,L.hipY,0)); q.applyAxisAngle(V(1,0,0), 0.26); return q.add(V(0,L.hipY,0)); };

  /* ===== BONE CUDGEL FIRST — a crude knobbed thigh-bone club held LOW in the right fist, out to
     the side. The grip is ground truth; the right hand derives from it. ===== */
  const GRIP = V(0.36, 0.66, 0.30), HEAD = V(0.58, 0.40, 0.62);   // club head low + forward-right
  const CDIR = new THREE.Vector3().subVectors(HEAD, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(CDIR, -0.14);
  {
    tube(BUTT, GRIP.clone().addScaledVector(CDIR,0.04), 0.026, 0.026, 6, P.boneDk, {capA:{hex:P.bone, lift:0.02}});
    tube(GRIP.clone().addScaledVector(CDIR,0.04), HEAD.clone().addScaledVector(CDIR,-0.10), 0.030, 0.044, 7, P.bone);
    // knobby bone head (a lumpy blob at the striking end)
    blob(HEAD.x, HEAD.y, HEAD.z, 0.060, 0.055, 0.060, P.bone, 7, 4);
    blob(HEAD.x+0.02, HEAD.y-0.02, HEAD.z+0.02, 0.030, 0.028, 0.030, P.boneDk, 6, 3);
    // a cord binding at the grip
    tube(GRIP.clone().addScaledVector(CDIR,-0.03), GRIP.clone().addScaledVector(CDIR,0.03), 0.032, 0.031, 6, P.boneBind);
  }

  /* ---------- TORSO — a lean elongated loft, ribs hinted, forward-stooped. ---------- */
  stack([
    {y:L.hipY,   rx:0.120, rz:0.098, hex:P.fleshDk},
    {y:L.waistY, rx:0.108, rz:0.088, hex:P.flesh},   // narrow gaunt waist
    {y:L.chestY, rx:0.150, rz:0.108, hex:P.flesh},   // deep hunched chest
    {y:L.shldY,  rx:0.158, rz:0.104, hex:P.fleshDk}, // hunched shoulders
    {y:L.neckY,  rx:0.058, rz:0.056, hex:P.fleshDk},
  ], 8, {xform:stoop, capBot:{hex:P.sinewDk, lift:0.006}});
  /* dark sinew shadows down the front (starved, ribby) + a spine ridge up the back */
  for(const s of [-1,1]){
    const rib=(y,z)=>stoop(V(s*0.06, y, z));
    quad(rib(L.chestY,0.100), rib(L.chestY,0.100).clone().add(V(s*0.03,0,0.01)),
         rib(L.waistY,0.088).clone().add(V(s*0.03,0,0.01)), rib(L.waistY,0.088), P.sinew, 0.05);
  }

  /* ---------- HEAD — a smooth EYELESS dome that is mostly a wide gaping FANGED MAW. No eyes. ---------- */
  {
    const n=8, ph=Math.PI/n;
    // the head is thrust forward + down (the stalk). A domed cranium tapering to the maw below.
    const hb = 1.15;   // head base y (pre-stoop; the stoop carries it forward)
    const bands=[
      {y:hb+0.02, rx:0.070, rz:0.084, hex:P.fleshDk},   // under-jaw / throat
      {y:hb+0.09, rx:0.108, rz:0.116, hex:P.flesh},     // wide cheek/jaw hinge
      {y:hb+0.17, rx:0.116, rz:0.120, hex:P.flesh},     // smooth swollen cranium (no brow, no eyes)
      {y:hb+0.25, rx:0.086, rz:0.088, hex:P.fleshDk},   // domed crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(stoop));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], stoop(V(0, hb+0.31, 0.01)), P.fleshDk);   // smooth blank dome top (no face)

    /* the WIDE GAPING MAW — a dark cavity across the lower front of the head with two rows of pale
       fangs. This IS the face (blind: no eyes, all mouth). Built as a recessed dark ring + fangs. */
    const my = hb+0.06;
    const mawFront = (x,y,z)=>stoop(V(x,y,z));
    // dark maw interior — a shallow recessed wedge
    {
      const mb=mawFront(0, my+0.02, 0.12), mm=mawFront(0, my-0.02, 0.16);
      tube(mb, mm, 0.088, 0.070, n, P.maw, {raz:0.078, rbz:0.060, phase:ph, capB:{hex:P.maw, lift:0.006}});
      // gum ring around the maw
      quad(mawFront(-0.078,my+0.050,0.116), mawFront(0.078,my+0.050,0.116),
           mawFront(0.066,my-0.050,0.112), mawFront(-0.066,my-0.050,0.112), P.gum, 0.04);
    }
    // upper + lower fang rows (pale triangles pointing into the maw)
    for(let k=-2;k<=2;k++){
      const fx=k*0.032;
      quad(mawFront(fx-0.011,my+0.048,0.126), mawFront(fx+0.011,my+0.048,0.126),
           mawFront(fx,my+0.006,0.128), mawFront(fx,my+0.006,0.128), P.fang, 0.0);       // upper
      quad(mawFront(fx-0.010,my-0.048,0.122), mawFront(fx+0.010,my-0.048,0.122),
           mawFront(fx,my-0.008,0.126), mawFront(fx,my-0.008,0.126), P.fang, 0.0);       // lower
    }
  }

  /* ---------- ARMS — long, sinewy, GRASPING. Right → the cudgel grip; left reaches forward, hooked
     claws splayed (the predatory reach). ---------- */
  const hookHand=(ctr, faceDir, hex)=>{
    const d=faceDir.clone().normalize();
    const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.03), ctr.clone().addScaledVector(d,0.03), 0.044, 0.038, 6, hex, {capA:{hex},capB:{hex}});
    for(const off of [-0.9,-0.3,0.3,0.9]){
      const kb=ctr.clone().addScaledVector(d,0.024).addScaledVector(side, off*0.030);
      const km=kb.clone().addScaledVector(d,0.050).addScaledVector(side, off*0.010);
      const kt=km.clone().addScaledVector(d,0.026).add(V(0,-0.030,0));    // claws hook DOWN
      tube(kb, km, 0.013, 0.009, 4, hex);
      tube(km, kt, 0.009, 0.003, 4, P.claw, {capB:{hex:P.nail, lift:0.004}});
    }
  };
  {
    /* RIGHT arm → cudgel grip (long humerus + forearm) */
    const S=stoop(V(L.shoulderX, L.shldY-0.02, 0.02));
    const FIST=GRIP.clone().addScaledVector(CDIR,-0.02);
    const E=V(0.360, 0.90, 0.24);
    tube(S,E,0.048,0.036,6,P.flesh, {capA:{hex:P.fleshDk}});
    tube(E,FIST,0.036,0.030,6,P.flesh);
    hookHand(FIST, CDIR, P.fleshLt);

    /* LEFT arm → reaching FORWARD low, hooked claws splayed (grasping the dark ahead) */
    const S2=stoop(V(-L.shoulderX, L.shldY-0.02, 0.02));
    const E2=V(-0.315, 0.86, 0.30);
    const H2=V(-0.220, 0.70, 0.52);          // reach out front
    tube(S2,E2,0.048,0.036,6,P.flesh, {capA:{hex:P.fleshDk}});
    tube(E2,H2,0.036,0.030,6,P.flesh);
    hookHand(H2, V(-0.1,-0.2,1), P.fleshLt);
  }

  /* ---------- LEGS — digitigrade-hinted, in a forward-braced predatory crouch, clawed feet. ---------- */
  {
    const legL=(sx)=>{
      const hip=V(sx*L.hipHalf, L.hipY-0.02, 0.0);
      const knee=V(sx*0.140, 0.42, 0.14);          // knee forward + out (crouch)
      const hock=V(sx*0.140, 0.20, 0.02);          // hock back (digitigrade)
      const toe=V(sx*0.130, 0.055, 0.10);          // foot plants forward
      tube(hip, knee, 0.052, 0.040, 6, P.flesh);
      tube(knee, hock, 0.038, 0.028, 6, P.fleshDk);
      tube(hock, toe, 0.030, 0.022, 6, P.fleshDk, {capA:{hex:P.fleshDk}});
      // clawed foot: heel pad + 3 forward claws
      const d=V(sx*0.10,0,1).normalize();
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const cb=V(toe.x,0.045,toe.z).addScaledVector(side, off*0.024);
        const ct=cb.clone().addScaledVector(d,0.078).addScaledVector(side, off*0.006).add(V(0,-0.020,0));
        tube(cb, ct, 0.014, 0.004, 4, P.claw, {capB:{hex:P.nail, lift:0.004}});
      }
    };
    legL(-1); legL(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
