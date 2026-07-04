/* dev/model-qa/creatures/mon-carrioncrawler.js — the CARRION CRAWLER (bespoke SEGMENTED
   MANY-LEGGED SCAVENGER, Large, lifts the worm/tube base from mon-purpleworm.js + the
   segmented-tube technique from mon-snake.js). CREATURE-MODELS-P2 §5 Wave 2 brief: a giant
   segmented worm-caterpillar held LOW on many small legs down both sides, its FRONT reared up
   with a ring of hanging face-TENTACLES around a round sucking maw. Sickly grey-green hide
   (VS desaturated, mottled, never candy). NO eye quads — no face at all, just the tentacle ring
   + the maw. Whole-object grammar: one function, one merged geometry frame, no anchors, no part
   transforms. Stays inside the r=0.55 base disc footprint: the body runs low along the disc,
   the front rears UP in +y rather than sprawling past the rim. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildCarrionCrawler(){
  /* ---------- PALETTE (VS desaturated — sickly grey-green hide, mottled, dirty) ---------- */
  const P = {
    hide:0x7a8568, hideDk:0x596349, hideLt:0x8d9878,          // sickly grey-green hide
    mottleA:0x6b755a, mottleB:0x84906e,                        // dorsal mottle
    belly:0x8a8a74, bellyDk:0x6b6b58,                          // pale sickly underside
    ring:0x353c2e,                                             // dark segmentation bands
    tent:0x4a5240, tentTip:0x2e332a,                            // hanging face tentacles
    maw:0x1a1c16,                                               // dark maw interior
    tooth:0xb8b49a, gum:0x453227,                               // pale rasp-ridge, dusky gum
    leg:0x596349, claw:0x232520,                                // many small legs + tiny claws
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({ [P.hide]:"scale", [P.hideDk]:"scale", [P.hideLt]:"scale", [P.tooth]:"bone" });

  /* ---------- THE SPINE PATH — low along the disc, then rears up at the front (+z, +y). ---------- */
  const path = [];                  // {p:Vector3, r:radius}
  const joints = [];                // path indices stamped with a segmentation ring

  const TAIL_R = 0.045, MID_R = 0.130, NECK_R = 0.098, GROUND = 0.075;

  /* --- Low trailing body: a gentle back-curve resting near the ground, tail tucked toward the
     rear of the disc so the reared front has room near center. --- */
  const LOW_SAMP = 10;
  for(let i=0;i<=LOW_SAMP;i++){
    const f = i/LOW_SAMP;                              // 0=tail tip .. 1=start of the rise
    const z = -0.40 + f*0.46;                           // -0.40 .. 0.06
    const x = Math.sin(f*Math.PI*0.5) * -0.03;          // a faint lateral wave
    const thick = TAIL_R + (MID_R-TAIL_R)*f;
    path.push({ p:V(x, GROUND, z), r:thick });
  }

  /* --- Rising fore-body: peels up +y and forward +z into the reared front carrying the maw. --- */
  const last = path[path.length-1].p;
  const RISE = [
    { p:V(0.01, GROUND+0.05, last.z+0.06), r:MID_R*1.02 },
    { p:V(0.00, 0.18,        0.14),        r:MID_R*1.00 },   // thickest mid-body mass
    { p:V(0.00, 0.30,        0.16),        r:MID_R*0.90 },
    { p:V(0.00, 0.40,        0.14),        r:NECK_R*0.92 },
    { p:V(0.00, 0.48,        0.10),        r:NECK_R*0.74 },  // neck, reared, base of the maw
  ];
  for(const s of RISE) path.push(s);

  for(let i=1;i<path.length-1;i++) joints.push(i);          // segmentation ring every joint

  /* ---------- LOFT THE BODY — ring cross-sections along the path, stitched. ---------- */
  const NSEG = 8;
  const rings = [];
  for(let i=0;i<path.length;i++){
    const cur = path[i];
    const nxt = path[Math.min(i+1, path.length-1)].p;
    const prv = path[Math.max(i-1, 0)].p;
    const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
    const isJoint = joints.includes(i);
    const rr = isJoint ? cur.r*1.07 : cur.r;
    rings.push(ring(cur.p, axis, rr, rr*0.94, NSEG, Math.PI/NSEG));
  }
  const colFn = (b) => joints.includes(b) ? P.ring : (b%3===0 ? P.mottleA : (b%3===1 ? P.hide : P.mottleB));
  stitch(rings, colFn);
  capFan(rings[0], path[0].p.clone().add(V(0,-0.01,0)), P.hideDk, true);   // tail tip cap

  /* pale sickly ventral strip along the low trailing underside */
  {
    const vB = path[1].p, vT = path[9].p;
    quad(V(vB.x-0.05,vB.y-0.03,vB.z-0.02), V(vB.x+0.05,vB.y-0.03,vB.z-0.02),
         V(vT.x+0.06,vT.y-0.03,vT.z+0.02), V(vT.x-0.06,vT.y-0.03,vT.z+0.02), P.belly, 0.05);
  }

  /* ---------- MANY SMALL LEGS — held low, running down both sides of the trailing body. ---------- */
  {
    const legAt = (i, side)=>{
      const seg = path[i].p;
      const hipY = seg.y - seg.r*0.35;
      const hip = V(seg.x + side*seg.r*0.85, hipY, seg.z);
      const knee = V(hip.x + side*0.055, GROUND-0.015, hip.z);
      const foot = V(hip.x + side*0.075, 0.012, hip.z);
      tube(hip, knee, 0.028, 0.018, 5, P.leg);
      tube(knee, foot, 0.018, 0.009, 5, P.leg, {capB:{hex:P.claw, lift:0.004}});
    };
    for(let i=0;i<=8;i++){ legAt(i,-1); legAt(i,1); }
  }

  /* ---------- REARED FRONT — a ring of hanging face-tentacles around a round sucking maw.
     NO face plane at all; the tentacle ring itself IS the read. ---------- */
  const mawEnd = path[path.length-1].p;
  const mawPrev = path[path.length-2].p;
  const FWD = new THREE.Vector3().subVectors(mawEnd, mawPrev).normalize();
  {
    /* the maw rim + dark receded throat */
    const rim   = ring(mawEnd.clone().addScaledVector(FWD,0.05), FWD, NECK_R*0.62, NECK_R*0.60, 10, Math.PI/10);
    const gumR  = ring(mawEnd.clone().addScaledVector(FWD,0.09), FWD, NECK_R*0.56, NECK_R*0.54, 10, Math.PI/10);
    const throat= ring(mawEnd.clone().addScaledVector(FWD,-0.06), FWD, NECK_R*0.30, NECK_R*0.28, 10, Math.PI/10);
    stitch([rim, gumR], ()=>P.gum);
    stitch([gumR, throat], ()=>P.maw);
    capFan(throat, mawEnd.clone().addScaledVector(FWD,-0.24), P.maw);

    /* a small rasp-ridge of pale teeth-nubs just inside the rim */
    const toothPts = ring(mawEnd.clone().addScaledVector(FWD,0.06), FWD, NECK_R*0.50, NECK_R*0.48, 10, 0);
    const ctr = mawEnd.clone().addScaledVector(FWD,0.02);
    for(const pt of toothPts){
      const inward = new THREE.Vector3().subVectors(ctr, pt).normalize();
      const tip = pt.clone().addScaledVector(inward, 0.045).addScaledVector(FWD, 0.02);
      tube(pt, tip, 0.014, 0.003, 3, P.tooth, {capA:{hex:P.tooth}});
    }

    /* HANGING FACE-TENTACLES — a ring of drooping feelers hung around the maw rim, sagging down
       + slightly forward, each tapering to a dark tip. This is the creature's whole "face". */
    const side0 = new THREE.Vector3().crossVectors(V(0,1,0), FWD).normalize();
    const up0 = new THREE.Vector3().crossVectors(FWD, side0).normalize();
    const nTent = 8;
    for(let k=0;k<nTent;k++){
      const a = (k/nTent)*Math.PI*2;
      const rimPt = mawEnd.clone()
        .addScaledVector(FWD, 0.05)
        .addScaledVector(side0, Math.cos(a)*NECK_R*0.78)
        .addScaledVector(up0,   Math.sin(a)*NECK_R*0.78);
      const sag = rimPt.clone()
        .addScaledVector(FWD, 0.10)
        .addScaledVector(up0, -0.16)
        .addScaledVector(side0, Math.cos(a)*0.03);
      const tip = sag.clone()
        .addScaledVector(FWD, 0.05)
        .addScaledVector(up0, -0.10);
      tube(rimPt, sag, 0.022, 0.014, 4, P.tent);
      tube(sag, tip, 0.014, 0.004, 4, P.tentTip, {capB:{hex:P.tentTip, lift:0.003}});
    }
  }

  /* ---------- dorsal mottle patches along the reared mass (breaks up the tube-silhouette read) --- */
  {
    const m0 = path[10].p, m1 = path[12].p;
    quad(V(-0.05,m0.y+0.06,m0.z), V(0.05,m0.y+0.06,m0.z),
         V(0.045,m1.y+0.05,m1.z), V(-0.045,m1.y+0.05,m1.z), P.mottleB, 0.05);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
