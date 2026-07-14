/* dev/model-qa/creatures/mon-elderdeepthing.js — the ELDER DEEP THING (bespoke whole-object
   ABERRATION, Large lovecraftian horror). The read: a hunched bulky humanoid mass whose FACE is
   a knot of writhing TENTACLES instead of a face, heavy rolled shoulders, long clawed limbs.
   Deep-sea blue-black mottled flesh (VS desaturated — dirty, never candy). NO eye quads (house
   ruling — dark socket recesses only, and here there IS no face at all, just the tentacle mass).
   Whole-object grammar: one function, one merged geometry frame, no anchors, no part-object
   transforms. Keeps its rise in +y over the disc rather than sprawling past it. Base disc r=0.55.
   Imported by the ps1-sheet proof harness. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildElderDeepThing(){
  /* ---------- PALETTE (VS desaturated — deep-sea blue-black mottled flesh) ---------- */
  const P = {
    flesh:0x3a4048, fleshDk:0x22262c, fleshLt:0x525a60,        // blue-black base flesh
    mottleA:0x2e3a3c, mottleB:0x445048,                          // dirty mottle patches
    belly:0x5c6560, bellyDk:0x424944,                            // paler underside
    tent:0x384a46, tentDk:0x1f2a26, tentLt:0x4c625c,             // tentacle-mass flesh
    sucker:0x1a221f, suckerLt:0x2e3a34,                          // sucker recesses (dark, not eyes)
    claw:0x14100e, clawLt:0x241d19,
    socket:0x0e1210,                                             // dark socket recesses (not eyes)
    disc:0x322d2a, discTop:0x3c3632,
  };
  setChannels({ [P.flesh]:'skin', [P.fleshDk]:'skin', [P.fleshLt]:'skin',
    [P.mottleA]:'skin', [P.mottleB]:'skin', [P.belly]:'skin', [P.bellyDk]:'skin',
    [P.tent]:'skin', [P.tentDk]:'skin', [P.tentLt]:'skin', [P.claw]:'bone', [P.clawLt]:'bone' });

  /* ---------- LANDMARKS — hunched heavy mass, rise concentrated in +y over the disc center. ---------- */
  const L = { hipY:0.30, waistY:0.44, chestY:0.60, shldY:0.76, neckY:0.82, headY:0.92 };
  const hunch = (p)=>{                                    // pitch the whole upper mass forward+down
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.34);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — bulky hunched mass, uneven overlapping bands for a lumpy silhouette. ---------- */
  {
    const bands = [
      {y:L.hipY,   rx:0.230, rz:0.200, hex:P.fleshDk},
      {y:L.waistY, rx:0.270, rz:0.225, hex:P.flesh},
      {y:L.chestY, rx:0.330, rz:0.250, hex:P.mottleA},        // barrel chest, widest
      {y:L.shldY,  rx:0.360, rz:0.240, hex:P.fleshLt},        // heavy rolled shoulders
      {y:L.neckY,  rx:0.170, rz:0.155, hex:P.fleshDk},        // thick neck stump
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, 9, Math.PI/9).map(hunch));
    stitch(rings, b=>bands[b].hex);
    // pale belly patch low on the front
    {
      const by = L.waistY - 0.02;
      quad(hunch(V(-0.14,by,0.20)), hunch(V(0.14,by,0.20)), hunch(V(0.11,by+0.18,0.22)), hunch(V(-0.11,by+0.18,0.22)), P.belly, 0.05);
    }
    // mottled dark patches riding the torso, uneven placement (dirty read, not smooth)
    for(const [cx,cy,rx,rz,hex] of [
      [-0.16, L.chestY+0.02, 0.11, 0.10, P.mottleB],
      [ 0.14, L.waistY+0.04, 0.09, 0.09, P.fleshDk],
      [ 0.05, L.shldY-0.05,  0.10, 0.09, P.mottleA],
    ]){
      const r0 = ring(hunch(V(cx,cy-0.05,0.16)), V(0,0,1), rx*0.8, rz*0.8, 6, Math.PI/6);
      const r1 = ring(hunch(V(cx,cy+0.05,0.19)), V(0,0,1), rx, rz, 6, Math.PI/6);
      stitch([r0,r1], ()=>hex);
      capFan(r1, hunch(V(cx,cy+0.10,0.20)), hex);
    }
  }

  /* ---------- THE FACE — a writhing knot of TENTACLES where a face would be. A cluster of 7
     short-to-long tapering tubes erupting from the front of the head mass, curling and reaching,
     around a dark socket recess where the head-front skull-shape would sit. NO eye quads. ---------- */
  {
    const headC = hunch(V(0, L.headY, 0.10));
    // small head-mass base (the "skull" the tentacles erupt from) — a stubby ring stack
    const hb = [
      {y:L.neckY+0.02, rx:0.150, rz:0.140, hex:P.fleshDk},
      {y:L.headY,      rx:0.175, rz:0.165, hex:P.tent},
    ];
    const hr = hb.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, 8, Math.PI/8).map(hunch));
    stitch(hr, b=>hb[b].hex);
    // dark socket recesses (not eyes — shape only) sunk into the head-mass front, low-key
    for(const s of [-1,1]){
      const c = hunch(V(s*0.055, L.headY-0.01, 0.145));
      quad(c.clone().add(V(-0.022,-0.018,0)), c.clone().add(V(0.022,-0.018,0)),
           c.clone().add(V(0.018,0.018,-0.01)), c.clone().add(V(-0.018,0.018,-0.01)), P.socket, 0.02);
    }
    // TENTACLES — erupting radially from the head-mass front hemisphere, curling forward/down/out.
    const tentSpec = [
      {ang:-1.3, len:0.42, droop:0.24, r0:0.052},
      {ang:-0.75,len:0.50, droop:0.18, r0:0.058},
      {ang:-0.25,len:0.58, droop:0.10, r0:0.062},
      {ang: 0.10,len:0.44, droop:0.30, r0:0.050},
      {ang: 0.45,len:0.56, droop:0.14, r0:0.060},
      {ang: 0.95,len:0.48, droop:0.22, r0:0.054},
      {ang: 1.55,len:0.36, droop:0.34, r0:0.046},
    ];
    for(const ts of tentSpec){
      const dirX = Math.sin(ts.ang), dirZFwd = Math.cos(ts.ang)*0.6+0.5;
      const base = headC.clone().add(V(dirX*0.10, 0.02, 0.13));
      const p0 = base;
      const p1 = base.clone().add(V(dirX*ts.len*0.35, -ts.droop*0.25, ts.len*0.42));
      const p2 = base.clone().add(V(dirX*ts.len*0.70, -ts.droop*0.70, ts.len*0.30 + dirZFwd*0.10));
      const p3 = base.clone().add(V(dirX*ts.len*0.95, -ts.droop*1.05, ts.len*0.12 + dirZFwd*0.06));
      tube(p0,p1, ts.r0,       ts.r0*0.72, 5, P.tent,   {capA:{hex:P.tentDk}});
      tube(p1,p2, ts.r0*0.72,  ts.r0*0.44, 5, P.tentLt);
      tube(p2,p3, ts.r0*0.44,  ts.r0*0.16, 5, P.tentDk, {capB:{hex:P.tentDk, lift:0.012}});
      // a couple of small sucker-recess dots along the underside of the mid segment
      for(const f of [0.3,0.65]){
        const sc = p1.clone().lerp(p2, f).add(V(0,-ts.r0*0.5,0));
        quad(sc.clone().add(V(-0.012,0,0)), sc.clone().add(V(0.012,0,0)),
             sc.clone().add(V(0.008,-0.010,0)), sc.clone().add(V(-0.008,-0.010,0)), P.sucker, 0.03);
      }
    }
  }

  /* ---------- LONG CLAWED LIMBS — disproportionately long arms with splayed clawed hands. ---------- */
  const clawHand = (ctr, dir, hex)=>{
    const d = dir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.03), ctr.clone().addScaledVector(d,0.03), 0.062,0.054,6,hex,{capA:{hex},capB:{hex}});
    for(const off of [-1,0,1]){
      const cb = ctr.clone().addScaledVector(d,0.028).addScaledVector(side, off*0.036);
      const ct = cb.clone().addScaledVector(d,0.11).addScaledVector(side, off*0.014);
      tube(cb, ct, 0.017, 0.004, 4, P.claw, {capB:{hex:P.clawLt, lift:0.006}});
    }
  };
  {
    const shR = hunch(V( 0.335, L.shldY-0.02, 0.06));
    const elR = V(0.520, 0.52, 0.14);
    const wrR = V(0.470, 0.20, 0.24);
    tube(shR, elR, 0.100, 0.076, 6, P.flesh);
    tube(elR, wrR, 0.074, 0.052, 6, P.fleshDk);
    clawHand(wrR, V(0.15,-0.6,1), P.tentDk);

    const shL = hunch(V(-0.335, L.shldY-0.02, 0.06));
    const elL = V(-0.500, 0.50, 0.16);
    const wrL = V(-0.430, 0.18, 0.22);
    tube(shL, elL, 0.100, 0.076, 6, P.flesh);
    tube(elL, wrL, 0.074, 0.052, 6, P.fleshDk);
    clawHand(wrL, V(-0.15,-0.6,1), P.tentDk);
  }

  /* ---------- LEGS — thick, bent, planted for the hunch; short so the mass stays low+wide. ---------- */
  {
    const hipL=V(-0.155, L.hipY-0.02, 0.02), kneeL=V(-0.185,0.155,0.14), ankL=V(-0.165,0.045,0.05);
    const hipR=V( 0.155, L.hipY-0.02, 0.00), kneeR=V( 0.190,0.155,0.10), ankR=V( 0.170,0.045,0.02);
    tube(hipL,kneeL,0.115,0.084,6,P.fleshDk);
    tube(kneeL,ankL,0.080,0.058,6,P.flesh);
    tube(hipR,kneeR,0.115,0.084,6,P.fleshDk);
    tube(kneeR,ankR,0.080,0.058,6,P.flesh);
    for(const [ank,toeDir] of [[ankL,V(-0.08,0,1)],[ankR,V(0.08,0,1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.035,ank.z);
      tube(heel.clone().addScaledVector(d,-0.015), heel.clone().addScaledVector(d,0.11), 0.062,0.046,6,P.tent,{capA:{hex:P.fleshDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.10).addScaledVector(side, off*0.036);
        const tt=tb.clone().addScaledVector(d,0.035).addScaledVector(side, off*0.006);
        tube(tb, tt, 0.016,0.005,4,P.claw,{capB:{hex:P.clawLt, lift:0.004}});
      }
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
