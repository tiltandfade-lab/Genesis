/* dev/model-qa/creatures/mon-purpleworm.js — the PURPLE WORM (bespoke SEGMENTED BURROWER,
   Gargantuan, seeds the worm/tube base for Wave 2's remorhaz/carrion-crawler).
   CREATURE-MODELS-P2 §5 Wave 1 brief: an immense segmented burrowing worm reared up in an
   S-curve off the disc — thick RINGED body segments (visible segmentation bands down the
   length), tapering slightly toward a tail that trails onto the disc, and at the raised top a
   round MAW ringed with concentric rows of TEETH (lamprey/sarlacc-style, NO face). Bruised
   purple-grey hide (VS desaturated), darker segment rings, bone-pale teeth, dark maw interior.
   Whole-object grammar: one function, one merged geometry frame, no anchors, no part transforms.
   Whole thing stays inside the r=0.72 base disc footprint — rears UP in y, tail coils onto the
   disc rather than sprawling past the rim. Lofted as a chain of tapered tubes along a curved
   spine (per mon-snake.js's segmented-tube technique), with a raised ring band stitched at each
   segment joint for the visible segmentation read. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildPurpleWorm(){
  /* ---------- PALETTE (VS desaturated — bruised purple-grey hide, NOT candy purple) ---------- */
  const P = {
    hide:0x5a4f5c, hideDk:0x40384a, hideLt:0x6e6270,          // bruised purple-grey hide
    ring:0x342c3c, ringLt:0x453c4e,                            // dark segmentation rings (bands)
    belly:0x7a6f76, bellyDk:0x5e5560,                          // slightly paler ventral hint
    maw:0x1c1620,                                              // dark maw interior
    tooth:0xc9bfa8, toothDk:0xa89d86,                          // bone-pale teeth
    gum:0x4a2530,                                              // dusky red-brown gumline
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({ [P.hide]:"scale", [P.hideDk]:"scale", [P.hideLt]:"scale",
    [P.tooth]:"bone", [P.toothDk]:"bone" });

  /* ---------- THE SPINE PATH — a single centerline: tail coils flat on the disc, then the
     fore-body peels up in an S-curve, rearing to the raised maw at the top. Segment joints are
     recorded (their path index) so a raised ring band can be stitched at each — the visible
     "ringed body segment" read. ---------- */
  const path = [];              // {p:Vector3, r:radius}
  const joints = [];            // path indices where a segmentation ring band gets stamped

  const TAIL_R = 0.050, MID_R = 0.185, NECK_R = 0.150, GROUND = 0.045;

  /* --- Tail coil: a short flattened loop resting on the disc, tucked toward the rear so the
     rearing fore-body has room to rise near center. Stays well inside r=0.72. --- */
  const COIL_SAMP = 18;
  for(let i=0;i<=COIL_SAMP;i++){
    const f = i/COIL_SAMP;                          // 0=tail tip .. 1=coil end
    const ang = Math.PI*0.35 + f*Math.PI*1.35;      // a little over 3/4 turn
    const rad = 0.60 - f*0.24;                      // shrinks inward toward the rise point
    const thick = TAIL_R + (MID_R*0.72-TAIL_R)*f;
    path.push({ p:V(Math.cos(ang)*rad, GROUND+f*0.02, -0.10+Math.sin(ang)*rad*0.6), r:thick });
  }

  /* --- Rising fore-body: an S-curve off the coil's inner end, thickening toward mid-body, then
     narrowing slightly toward the neck below the maw (per brief: "tapering slightly toward the
     tail" — the taper reads at the tail end above; the reared portion stays thick-to-neck). --- */
  const last = path[path.length-1].p;
  const RISE = [
    { p:V(last.x*0.75, GROUND+0.10, last.z*0.65 + 0.08), r:MID_R*0.85 },
    { p:V(last.x*0.42, GROUND+0.34, 0.02),                r:MID_R*1.00 },
    { p:V(0.10,         0.70,        -0.06),               r:MID_R*1.05 },   // thickest — mid-body mass
    { p:V(0.02,         1.10,        -0.10),               r:MID_R*0.92 },
    { p:V(-0.04,        1.48,        -0.04),               r:NECK_R*0.88 },  // belly of the S, leaning back
    { p:V(0.02,         1.82,         0.06),               r:NECK_R*0.78 },  // curling forward again
    { p:V(0.06,         2.06,         0.14),               r:NECK_R*0.66 },  // neck, reared near-vertical
    { p:V(0.06,         2.24,         0.18),               r:NECK_R*0.56 },  // base of the maw ring
  ];
  for(const s of RISE) path.push(s);

  /* record segmentation joints every ~2 samples across the whole path (skip the very first/last
     couple so caps stay clean) */
  for(let i=2;i<path.length-1;i+=2) joints.push(i);

  /* ---------- LOFT THE BODY — ring cross-sections along the path, stitched; segmentation
     bands stamped as a slightly wider dark ring at each joint index. ---------- */
  const NSEG = 10;
  const rings = [];
  for(let i=0;i<path.length;i++){
    const cur = path[i];
    const nxt = path[Math.min(i+1, path.length-1)].p;
    const prv = path[Math.max(i-1, 0)].p;
    const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
    const isJoint = joints.includes(i);
    const rr = isJoint ? cur.r*1.06 : cur.r;             // segmentation rings bulge slightly
    rings.push(ring(cur.p, axis, rr, rr*0.96, NSEG, Math.PI/NSEG));
  }
  const colFn = (b) => joints.includes(b) || joints.includes(b+1) ? P.ring : (b%4<2 ? P.hide : P.hideLt);
  stitch(rings, colFn);
  capFan(rings[0], path[0].p.clone().add(V(0,-0.01,0)), P.hideDk, true);   // tail tip cap

  /* pale ventral hint strip along the underside of the reared portion (subtle, not a full belly) */
  {
    const vB = path[8].p, vT = path[13].p;
    quad(V(vB.x-0.05,vB.y-0.10,vB.z-0.03), V(vB.x+0.05,vB.y-0.10,vB.z-0.03),
         V(vT.x+0.04,vT.y-0.08,vT.z-0.02), V(vT.x-0.04,vT.y-0.08,vT.z-0.02), P.belly, 0.05);
  }

  /* ---------- MAW — a round toothy ring at the reared top (lamprey/sarlacc-style), NO face.
     Built as a short flared cross-section stack ending in a wide open ring, with 2 concentric
     rows of teeth pointing inward from the rim and a dark maw-interior cap behind them. ---------- */
  const mawEnd = path[path.length-1].p;
  const mawPrev = path[path.length-2].p;
  const FWD = new THREE.Vector3().subVectors(mawEnd, mawPrev).normalize();
  {
    const flareA = ring(mawEnd.clone().addScaledVector(FWD,0.02),  FWD, NECK_R*0.60, NECK_R*0.58, 12, Math.PI/12);
    const flareB = ring(mawEnd.clone().addScaledVector(FWD,0.14),  FWD, NECK_R*0.86, NECK_R*0.84, 12, Math.PI/12);
    const rimF   = ring(mawEnd.clone().addScaledVector(FWD,0.20),  FWD, NECK_R*0.92, NECK_R*0.90, 12, Math.PI/12); // outer lip
    stitch([flareA, flareB, rimF], (b)=> b===0?P.ring:P.hide);

    /* dark maw interior — a receded cap so the throat reads as a black void behind the teeth */
    const throat = ring(mawEnd.clone().addScaledVector(FWD,-0.10), FWD, NECK_R*0.42, NECK_R*0.40, 12, Math.PI/12);
    capFan(throat, mawEnd.clone().addScaledVector(FWD,-0.34), P.maw);
    stitch([flareA, throat], ()=>P.maw, null);   // funnel the visible rim down into the dark throat

    /* gumline ring right at the rim */
    const gumR = ring(mawEnd.clone().addScaledVector(FWD,0.205), FWD, NECK_R*0.90, NECK_R*0.88, 12, Math.PI/12);
    stitch([rimF, gumR], ()=>P.gum);

    /* OUTER ROW of teeth — n small cones pointing inward+forward from the outer rim */
    const outerPts = ring(mawEnd.clone().addScaledVector(FWD,0.21), FWD, NECK_R*0.88, NECK_R*0.86, 14, 0);
    const ctrOuter = mawEnd.clone().addScaledVector(FWD,0.14);
    for(const pt of outerPts){
      const inward = new THREE.Vector3().subVectors(ctrOuter, pt).normalize();
      const tip = pt.clone().addScaledVector(inward, 0.115).addScaledVector(FWD, 0.05);
      const base1 = pt.clone().addScaledVector(FWD, 0.015);
      tube(base1, tip, 0.028, 0.004, 4, P.tooth, {capA:{hex:P.toothDk}});
    }
    /* INNER ROW — a smaller concentric ring of teeth set back + inward (the second row read) */
    const innerPts = ring(mawEnd.clone().addScaledVector(FWD,0.11), FWD, NECK_R*0.55, NECK_R*0.53, 12, Math.PI/12);
    const ctrInner = mawEnd.clone().addScaledVector(FWD,0.02);
    for(const pt of innerPts){
      const inward = new THREE.Vector3().subVectors(ctrInner, pt).normalize();
      const tip = pt.clone().addScaledVector(inward, 0.075).addScaledVector(FWD, 0.03);
      tube(pt, tip, 0.020, 0.003, 4, P.toothDk, {capA:{hex:P.toothDk}});
    }
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
