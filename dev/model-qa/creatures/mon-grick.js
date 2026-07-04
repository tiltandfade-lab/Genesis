/* dev/model-qa/creatures/mon-grick.js — the GRICK (bespoke wormlike ABERRATION, Medium).
   The bestiary grick: a rubbery serpentine burrower with a small beaked maw ringed by FOUR
   barbed tentacles (the signature read). The read: a thick, rubbery, grey-green body reared
   up off the disc in a short S-curve, front held aloft with a stubby BEAKED maw at its tip,
   ringed by four thin barbed tentacles splaying outward; the rest of the worm-body trails back
   down onto the disc. NO eye quads (sockets are shape only). Whole-object grammar: one function,
   one geometry frame, no anchors. Medium size: base disc r=0.42.
   Imported by mon-grick-probe.html + the proof sheet. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGrick(){
  /* ---------- PALETTE (VS desaturated — rubbery grey-green, mottled, dirty) ---------- */
  const P = {
    hide:0x5a6155, hideDk:0x3d4438, hideLt:0x6d7364,      // rubbery grey-green hide
    mottleA:0x4e5449, mottleB:0x656b58,                    // dorsal mottle bands
    belly:0x82897a, bellyDk:0x656b5c,                      // paler rubbery underside
    beak:0x2b2823, beakLt:0x3a362f,                        // horn-dark beaked maw
    tentacle:0x4a5148, tentacleDk:0x363b32,                // barbed tentacles
    barb:0x201d19,                                          // barb tips
    socket:0x1c1a17,                                        // dark eye-socket recess (no eye quad)
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- THE SPINE PATH — one continuous centerline, tail on the disc, rearing to the maw. ---------- */
  const path = [];
  const TAIL_R = 0.028, MID_R = 0.115, NECK_R = 0.078;
  const GROUND = 0.045;

  /* tail lies back on the disc, thin, tapering from the tip */
  const TAIL = [
    { p:V(0.02, GROUND-0.01, -0.38), r:TAIL_R,        t:0.00 },
    { p:V(0.04, GROUND+0.00, -0.30), r:TAIL_R*1.6,    t:0.08 },
    { p:V(0.02, GROUND+0.01, -0.20), r:TAIL_R*2.6,    t:0.16 },
  ];
  for(const s of TAIL) path.push(s);

  /* mid body thickens, still resting low, curling gently across the disc */
  const MID = [
    { p:V(-0.02, GROUND+0.03, -0.09), r:MID_R*0.62, t:0.28 },
    { p:V(-0.03, GROUND+0.07,  0.03), r:MID_R*0.85, t:0.40 },
    { p:V( 0.00, GROUND+0.14,  0.13), r:MID_R,       t:0.50 },
  ];
  for(const s of MID) path.push(s);

  /* fore-body rears up in a short S-curve toward the maw, held within the disc footprint (+y rise) */
  const RISE = [
    { p:V(0.02, GROUND+0.24, 0.16), r:MID_R*0.92, t:0.60 },
    { p:V(0.03, GROUND+0.36, 0.12), r:NECK_R*1.15, t:0.70 },
    { p:V(0.02, GROUND+0.47, 0.06), r:NECK_R,       t:0.80 },
    { p:V(0.00, GROUND+0.55, 0.02), r:NECK_R*0.80,  t:0.90 },
    { p:V(0.00, GROUND+0.60, 0.00), r:NECK_R*0.58,  t:0.97 },  // base of the beaked maw
  ];
  for(const s of RISE) path.push(s);

  /* ---------- LOFT THE BODY — ring cross-sections along the path, stitched, mottled banding. ---------- */
  const NSEG = 8;
  const rings = [];
  for(let i=0;i<path.length;i++){
    const cur = path[i];
    const nxt = path[Math.min(i+1, path.length-1)].p;
    const prv = path[Math.max(i-1, 0)].p;
    const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
    const rx = cur.r*1.04, rz = cur.r*0.96;
    rings.push(ring(cur.p, axis, rx, rz, NSEG, Math.PI/NSEG));
  }
  const colFn = (b) => {
    const t = path[b].t;
    const band = Math.floor(t*14)%2===0;
    return band ? P.hide : P.mottleA;
  };
  stitch(rings, colFn);
  capFan(rings[0], path[0].p.clone().add(V(0,-0.01,-0.02)), P.hideDk, true);
  /* pale rubbery belly strip along the trailing underside */
  {
    const b0=V(-0.06, GROUND-0.005, -0.32), b1=V(0.06, GROUND-0.005, -0.32);
    const b2=V(0.05, GROUND+0.02, -0.05),  b3=V(-0.05, GROUND+0.02, -0.05);
    quad(b0,b1,b2,b3, P.belly, 0.05);
  }

  /* ---------- HEAD/MAW — a stubby beaked maw capping the reared fore-body. ---------- */
  const headBase = path[path.length-1].p;
  const headPrev = path[path.length-2].p;
  const HAXIS = new THREE.Vector3().subVectors(headBase, headPrev).normalize();
  let beakTip;
  {
    const fwd = HAXIS.clone();
    const up = Math.abs(fwd.y) > 0.9 ? V(1,0,0) : new THREE.Vector3().crossVectors(fwd, V(0,1,0)).cross(fwd).normalize();
    const bulbRings = [];
    const bands = [ {along:0.00, rx:0.072, rz:0.072}, {along:0.05, rx:0.078, rz:0.078}, {along:0.10, rx:0.052, rz:0.052} ];
    for(const bd of bands){
      const c = headBase.clone().addScaledVector(fwd, bd.along);
      bulbRings.push(ring(c, fwd, bd.rx, bd.rz, 8, Math.PI/8));
    }
    stitch(bulbRings, (b)=> b===0?P.hideDk:P.hideLt);
    /* beak: two small tapering tubes (upper/lower mandible) closing to a point */
    const mawC = headBase.clone().addScaledVector(fwd, 0.10);
    const upJ = mawC.clone().addScaledVector(up, 0.018);
    const loJ = mawC.clone().addScaledVector(up, -0.018);
    beakTip = mawC.clone().addScaledVector(fwd, 0.10);
    tube(upJ, beakTip.clone().addScaledVector(up,0.012), 0.032, 0.006, 5, P.beak, {capA:{hex:P.beakLt}});
    tube(loJ, beakTip.clone().addScaledVector(up,-0.012), 0.032, 0.006, 5, P.beak, {capA:{hex:P.beakLt}});
    /* two dark eye-socket recesses (shape only, no eye quad) sunk into the bulb flanks */
    const side1 = new THREE.Vector3().crossVectors(V(0,1,0), fwd).normalize();
    for(const s of [-1,1]){
      const sc = headBase.clone().addScaledVector(fwd,0.045).addScaledVector(side1, s*0.045).addScaledVector(up,0.01);
      const sIn = sc.clone().addScaledVector(fwd, 0.012);
      quad(sc.clone().addScaledVector(up,0.014), sc.clone().addScaledVector(side1,s*0.014),
           sIn, sc.clone().addScaledVector(up,-0.014), P.socket, 0.02);
    }

    /* ---------- FOUR BARBED TENTACLES — the signature — splaying from around the maw. ---------- */
    const tAngles = [ -0.9, -0.32, 0.32, 0.9 ];  // radians offset around fwd axis, spread wide
    for(const ta of tAngles){
      const dir = side1.clone().multiplyScalar(Math.sin(ta)).add(up.clone().multiplyScalar(Math.cos(ta)*0.7)).add(fwd.clone().multiplyScalar(0.35)).normalize();
      const root = headBase.clone().addScaledVector(fwd,0.02).addScaledVector(dir, 0.05);
      const mid  = root.clone().addScaledVector(dir, 0.16).addScaledVector(fwd, 0.05);
      const tip  = mid.clone().addScaledVector(dir, 0.16).addScaledVector(fwd, 0.10);
      tube(root, mid, 0.026, 0.015, 5, P.tentacle, {capA:{hex:P.tentacleDk}});
      tube(mid, tip, 0.015, 0.005, 5, P.tentacleDk, {capB:{hex:P.barb, lift:0.006}});
      /* small barb spurs along the tentacle */
      const barbPt = mid.clone().addScaledVector(dir, 0.06);
      const barbTip = barbPt.clone().addScaledVector(side1, ta>0? -0.03:0.03).addScaledVector(up,-0.02);
      tube(barbPt, barbTip, 0.010, 0.002, 4, P.barb);
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
