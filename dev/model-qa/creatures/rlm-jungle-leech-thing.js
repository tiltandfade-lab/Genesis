/* dev/model-qa/creatures/rlm-jungle-leech-thing.js — Jungle Leech-Thing (theater, Small, CR 0.25).
   A canopy-dwelling leech creature dropping onto exposed necks. Whole-object grammar: one merged
   frame, a segmented ringed leech body arched into a dropping/striking C-curve, a sucker-disc maw
   at the fore end, small vestigial grip-tendrils at the rear for canopy anchoring. VS-desaturated
   wet-jungle palette (mottled bruise-purple/black hide, glistening dark segment rings, a raw pink
   sucker maw). NO eye quads — leeches have none; blunt questing fore-end only. Small disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildJungleLeechThing(){
  const P = {
    hide:0x463a4a, hideDk:0x2c2530, hideLt:0x5c4d5e,
    bruise:0x54324a, bruiseDk:0x361f30,
    seg:0x241e28,
    maw:0x8a4550, mawDk:0x5c2b32, mawWet:0xa15862,
    tendril:0x3a3040,
    disc:0x3e3630, discTop:0x4a4238,
  };

  /* ---------- LANDMARKS — an arched C-curve, rear anchored high/back, fore-end dropping low/fwd,
     as if hanging from a branch overhead and striking down toward a neck. ---------- */
  const S = {
    rear:   V(0, 0.34, -0.20),
    mid1:   V(0.01, 0.30, -0.06),
    mid2:   V(0.02, 0.22, 0.06),
    mid3:   V(0.01, 0.14, 0.14),
    fore:   V(0, 0.08, 0.20),
    mawB:   V(0, 0.05, 0.24),
  };

  /* ---------- BODY — segmented ringed loft along the arch, alternating hide/bruise bands for the
     leech's ringed-segment read. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const pts=[S.rear,S.mid1,S.mid2,S.mid3,S.fore];
    const radii=[0.115,0.125,0.110,0.085,0.058];
    const hexes=[P.hideDk,P.bruise,P.hide,P.bruiseDk,P.hide];
    for(let i=0;i<pts.length-1;i++){
      tube(pts[i], pts[i+1], radii[i], radii[i+1], n, hexes[i], {phase:ph, capA: i===0?{hex:P.hideDk}:undefined});
      // dark segment-ring groove between bands
      const midp = V((pts[i].x+pts[i+1].x)/2, (pts[i].y+pts[i+1].y)/2, (pts[i].z+pts[i+1].z)/2);
      const rr = (radii[i]+radii[i+1])/2 * 1.02;
      const axis = new THREE.Vector3().subVectors(pts[i+1],pts[i]).normalize();
      const g1 = ring(midp, axis, rr, rr*0.9, n, ph);
      const g2 = ring(V(midp.x,midp.y+0.008,midp.z), axis, rr*0.98, rr*0.88, n, ph);
      stitch([g1,g2], ()=>P.seg);
    }
    // rear anchor cap
    capFan(ring(S.rear, new THREE.Vector3(0,1,0.3).normalize(), 0.115, 0.10, n, ph), V(0,0.40,-0.26), P.hideDk, true);
  }

  /* ---------- MAW — a broad sucker-disc at the fore end, raw wet pink interior, rimmed lips. ---------- */
  {
    const n=10, ph=Math.PI/n;
    const rim = ring(S.mawB, V(0,0.4,1).normalize(), 0.062, 0.062, n, ph);
    const lip = ring(V(S.mawB.x,S.mawB.y-0.01,S.mawB.z+0.03), V(0,0.4,1).normalize(), 0.050, 0.050, n, ph);
    stitch([rim,lip], ()=>P.mawDk);
    capFan(lip, V(S.mawB.x,S.mawB.y-0.02,S.mawB.z+0.05), P.maw);
    // wet inner ring highlight
    const inner = ring(V(S.mawB.x,S.mawB.y-0.005,S.mawB.z+0.02), V(0,0.4,1).normalize(), 0.030, 0.030, n, ph);
    stitch([lip, inner], ()=>P.mawWet);
  }

  /* ---------- REAR GRIP-TENDRILS — small vestigial anchor-tendrils near the rear, for canopy grip. ---------- */
  {
    for(const [dx,dz] of [[-0.06,-0.02],[0.07,-0.03],[0.0,-0.08]]){
      const base = V(dx, S.rear.y+0.06, S.rear.z+dz);
      const tip = V(dx*1.6, S.rear.y+0.14, S.rear.z+dz*1.4-0.04);
      tube(base, tip, 0.020, 0.006, 5, P.tendril, {capB:{hex:P.tendril, lift:0.004}});
    }
  }

  /* ---------- mottled bruise patches along the flank for the wet-jungle read ---------- */
  {
    quad(V(-0.06,0.24,-0.02), V(0.06,0.24,0.0), V(0.05,0.32,-0.06), V(-0.05,0.32,-0.08), P.bruiseDk, 0.07);
    quad(V(-0.04,0.16,0.10), V(0.05,0.16,0.11), V(0.04,0.22,0.06), V(-0.03,0.22,0.05), P.bruise, 0.07);
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.30, 0.30, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
