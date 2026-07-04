/* dev/model-qa/creatures/mon-remorhaz.js — the REMORHAZ (bespoke SEGMENTED CENTIPEDE-WORM, Huge,
   Wave 2 lift off the Wave-1 worm/tube base seeded by mon-purpleworm.js).
   CREATURE-MODELS-P2 §5 Wave 2 brief: a huge segmented centipede-worm with a chitinous plated
   back, reared front, and a big mandibled maw. Blue-black chitin (VS desaturated) with GLOWING
   orange ember seams between the back plates — the "heated body" read (SRD: Heated Body deals
   fire damage on contact), a bright glow/ember channel, never candy-bright elsewhere.
   Whole-object grammar: one function, one merged geometry frame, no anchors, no part transforms.
   NO eye quads — dark socket recesses only. Stays inside the r=0.68 base disc: body coils low on
   the disc then rears UP in y near center rather than sprawling past the rim. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildRemorhaz(){
  /* ---------- PALETTE (VS desaturated blue-black chitin; bright ember-glow seams only) ---------- */
  const P = {
    chit:0x434a5a, chitDk:0x2f3442, chitLt:0x545c70,          // blue-black chitin plates
    plate:0x3a3f4e, plateDk:0x2a2e3c,                          // underlying plate/segment base
    leg:0x333a46, legDk:0x24272f,                               // short centipede legs
    maw:0x120e0c,                                               // dark maw interior
    mandible:0x3a3630, mandibleDk:0x252220,                     // horn-dark mandibles
    tooth:0xa89880, toothDk:0x87795f,                           // dull bone teeth
    socket:0x0c0d10,                                            // dark eye-socket recess
    ember:0xff7a1f, emberDk:0xc44a10, emberHot:0xffb347,        // GLOWING orange ember seams
    disc:0x342c2a, discTop:0x413630,
  };
  setChannels({
    [P.chit]:"stone", [P.chitDk]:"stone", [P.chitLt]:"stone",
    [P.plate]:"stone", [P.plateDk]:"stone",
    [P.tooth]:"bone", [P.toothDk]:"bone",
    [P.ember]:"glow", [P.emberDk]:"glow", [P.emberHot]:"glow",
  });

  /* ---------- SPINE PATH — tail coils low on the disc, fore-body rears up near center to the
     reared plated front + maw. Everything kept inside r=0.68. ---------- */
  const path = [];
  const TAIL_R = 0.045, MID_R = 0.155, NECK_R = 0.125, GROUND = 0.045;

  const COIL_SAMP = 14;
  for(let i=0;i<=COIL_SAMP;i++){
    const f = i/COIL_SAMP;
    const ang = Math.PI*0.30 + f*Math.PI*1.15;
    const rad = 0.52 - f*0.22;
    const thick = TAIL_R + (MID_R*0.75-TAIL_R)*f;
    path.push({ p:V(Math.cos(ang)*rad, GROUND+f*0.015, -0.08+Math.sin(ang)*rad*0.55), r:thick });
  }

  const last = path[path.length-1].p;
  const RISE = [
    { p:V(last.x*0.7,  GROUND+0.08, last.z*0.6+0.06), r:MID_R*0.90 },
    { p:V(last.x*0.4,  GROUND+0.26, 0.02),             r:MID_R*1.00 },
    { p:V(0.06,         0.52,        -0.04),           r:MID_R*1.05 },   // thick mid-body mass
    { p:V(0.02,         0.82,        -0.06),           r:MID_R*0.90 },
    { p:V(-0.02,        1.08,        -0.02),           r:NECK_R*0.86 },  // leaning back
    { p:V(0.02,         1.30,         0.06),           r:NECK_R*0.72 },  // curling forward
    { p:V(0.05,         1.46,         0.13),           r:NECK_R*0.60 },  // reared neck
    { p:V(0.05,         1.58,         0.17),           r:NECK_R*0.50 },  // base of the maw
  ];
  for(const s of RISE) path.push(s);

  const joints = [];
  for(let i=2;i<path.length-1;i+=2) joints.push(i);

  /* ---------- LOFT THE BODY — segmented chitin plates, dark ember seam ring at each joint. ---------- */
  const NSEG = 10;
  const rings = [];
  for(let i=0;i<path.length;i++){
    const cur = path[i];
    const nxt = path[Math.min(i+1, path.length-1)].p;
    const prv = path[Math.max(i-1, 0)].p;
    const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
    const isJoint = joints.includes(i);
    const rr = isJoint ? cur.r*1.05 : cur.r;
    rings.push(ring(cur.p, axis, rr, rr*0.94, NSEG, Math.PI/NSEG));
  }
  const colFn = (b) => (b%3===0 ? P.chit : (b%3===1 ? P.plate : P.chitLt));
  stitch(rings, colFn);
  capFan(rings[0], path[0].p.clone().add(V(0,-0.01,0)), P.chitDk, true);

  /* GLOWING EMBER SEAMS — thin bright bands stitched right at each segment joint, between plates */
  for(const j of joints){
    if(j<1 || j>=rings.length-1) continue;
    const rA = rings[j], rB = rings[Math.min(j+1, rings.length-1)];
    const seamMid = rA.map((p,i)=>{
      const q = rB[i];
      return V(p.x+(q.x-p.x)*0.5, p.y+(q.y-p.y)*0.5, p.z+(q.z-p.z)*0.5);
    });
    stitch([rA, seamMid], ()=>P.ember);
    stitch([seamMid, rB], ()=>P.emberDk);
  }
  /* a hot ember flare along the very top plate near the reared neck */
  {
    const gA = rings[rings.length-3], gB = rings[rings.length-2];
    stitch([gA, gB], ()=>P.emberHot, null);
  }

  /* ---------- SHORT CENTIPEDE LEGS — pairs of short stubby legs along the low coiled portion. ---------- */
  {
    const legPairsAt = [2,4,6,8,10,12];
    for(const idx of legPairsAt){
      if(idx>=path.length) continue;
      const cur = path[idx].p;
      for(const side of [-1,1]){
        const hip = V(cur.x + side*cur.r*0.9, cur.y-cur.r*0.2, cur.z);
        const foot = V(cur.x + side*(cur.r*1.9), 0.02, cur.z + 0.02*side);
        tube(hip, foot, 0.028, 0.012, 5, P.leg, {capB:{hex:P.legDk, lift:0.004}});
      }
    }
  }

  /* ---------- REARED HEAD/MAW — plated head mass + mandibles + toothy maw, NO eye quads
     (dark socket recesses only). ---------- */
  const headEnd = path[path.length-1].p;
  const headPrev = path[path.length-2].p;
  const FWD = new THREE.Vector3().subVectors(headEnd, headPrev).normalize();
  {
    /* plated cranium mass rising above the neck */
    const crownA = ring(headEnd.clone().addScaledVector(FWD,0.02), FWD, NECK_R*0.55, NECK_R*0.52, 10, Math.PI/10);
    const crownB = ring(headEnd.clone().addScaledVector(FWD,0.13), FWD, NECK_R*0.62, NECK_R*0.58, 10, Math.PI/10);
    stitch([crownA, crownB], ()=>P.chit);
    capFan(crownB, headEnd.clone().addScaledVector(FWD,0.19), P.chitDk);
    /* ember seam ringing the cranium base */
    stitch([crownA.map(p=>p), ring(headEnd.clone().addScaledVector(FWD,0.055), FWD, NECK_R*0.58, NECK_R*0.55, 10, Math.PI/10)], ()=>P.ember);

    /* dark eye-socket recesses (no eye quads — just carved-in dark quads set into the cranium) */
    for(const s of [-1,1]){
      const c = headEnd.clone().addScaledVector(FWD,0.09);
      const sideV = new THREE.Vector3().crossVectors(FWD, V(0,1,0)).normalize().multiplyScalar(s*NECK_R*0.44);
      const cs = c.clone().add(sideV);
      quad(V(cs.x-0.02,cs.y+0.02,cs.z), V(cs.x+0.02,cs.y+0.02,cs.z),
           V(cs.x+0.018,cs.y-0.02,cs.z), V(cs.x-0.018,cs.y-0.02,cs.z), P.socket, 0.0);
    }

    /* MANDIBLES — two large curved jaw-hooks projecting forward from below the cranium */
    const jawRoot = headEnd.clone().addScaledVector(FWD,0.06);
    for(const s of [-1,1]){
      const sideV = new THREE.Vector3().crossVectors(FWD, V(0,1,0)).normalize().multiplyScalar(s*NECK_R*0.5);
      const rootP = jawRoot.clone().add(sideV).add(V(0,-0.05,0));
      const midP  = rootP.clone().addScaledVector(FWD,0.14).add(V(0,-0.04,0)).add(sideV.clone().multiplyScalar(-0.3));
      const tipP  = midP.clone().addScaledVector(FWD,0.10).add(V(0,-0.02,0)).add(sideV.clone().multiplyScalar(-0.6));
      tube(rootP, midP, 0.045, 0.028, 6, P.mandible, {capA:{hex:P.mandibleDk}});
      tube(midP, tipP, 0.028, 0.008, 6, P.mandibleDk, {capB:{hex:P.mandibleDk, lift:0.004}});
    }

    /* the MAW — a wide dark opening below the mandibles, ringed with teeth */
    const mawC = jawRoot.clone().addScaledVector(FWD,0.04).add(V(0,-0.10,0));
    const mawRing = ring(mawC, FWD, NECK_R*0.46, NECK_R*0.30, 10, Math.PI/10);
    const throat = ring(mawC.clone().addScaledVector(FWD,-0.06), FWD, NECK_R*0.30, NECK_R*0.20, 10, Math.PI/10);
    capFan(throat, mawC.clone().addScaledVector(FWD,-0.22), P.maw);
    stitch([mawRing, throat], ()=>P.maw);
    for(const pt of mawRing){
      const inward = new THREE.Vector3().subVectors(mawC, pt).normalize();
      const tip = pt.clone().addScaledVector(inward, 0.07).addScaledVector(FWD, 0.02);
      tube(pt, tip, 0.018, 0.003, 4, P.tooth, {capA:{hex:P.toothDk}});
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.052,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.055,0), P.discTop);
  }
}
