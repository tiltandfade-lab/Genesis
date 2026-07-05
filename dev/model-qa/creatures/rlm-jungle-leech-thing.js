/* dev/model-qa/creatures/rlm-jungle-leech-thing.js — Jungle Leech-Thing (theater, Small, CR 0.25).
   A canopy-dwelling leech creature dropping onto exposed necks. REPAIR 2026-07-05 (judge: read as a
   generic pink/magenta blob, no leech/canopy-drop silhouette, candy-pink palette violated VS grit):
   swapped the whole palette to a grimy wet-black/khaki-drab hide (no purple/pink hue family at all —
   only the innermost maw throat keeps a small raw-meat accent, heavily muddied and jitter-dark) and
   STRETCHED the body into a long thin questing worm (5 tight segments, aspect ratio pushed much more
   elongated + thinner) held in a sharp overhead C-hook so the silhouette reads unambiguously as a
   dangling/dropping leech rather than a round mass. Grip-tendrils enlarged + pulled to the very top
   so the "hanging from canopy" read is legible from the game-panel silhouette. NO eye quads — leeches
   have none; blunt questing fore-end only. Small disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildJungleLeechThing(){
  const P = {
    hide:0x2e3324, hideDk:0x1b1e15, hideLt:0x3f4530,
    bruise:0x252a1e, bruiseDk:0x14160f,
    seg:0x101208,
    maw:0x6b3428, mawDk:0x40201a, mawWet:0x7a4234,
    tendril:0x272a1e,
    disc:0x342e26, discTop:0x3f382e,
  };

  /* ---------- LANDMARKS — a tight overhead C-hook: rear anchored HIGH (near the canopy grip),
     the body dropping in a sharp arc down and forward to a low questing fore-end — unmistakably a
     thing dangling and striking down, not a coiled blob. Stretched long + thin (worm proportions). */
  const S = {
    rear:   V(0, 0.52, -0.16),
    mid1:   V(0.01, 0.42, -0.10),
    mid2:   V(0.015, 0.30, -0.02),
    mid3:   V(0.01, 0.18, 0.08),
    mid4:   V(0.005, 0.09, 0.16),
    fore:   V(0, 0.045, 0.22),
    mawB:   V(0, 0.02, 0.27),
  };

  /* ---------- BODY — segmented ringed loft along the arch, alternating hide/bruise bands for the
     leech's ringed-segment read. Slimmer radii + one extra segment (mid4) stretches the worm out
     long and thin instead of reading as a round mass. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const pts=[S.rear,S.mid1,S.mid2,S.mid3,S.mid4,S.fore];
    const radii=[0.088,0.098,0.086,0.068,0.048,0.032];
    const hexes=[P.hideDk,P.bruise,P.hide,P.bruiseDk,P.hide,P.hideDk];
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
    capFan(ring(S.rear, new THREE.Vector3(0,1,0.3).normalize(), 0.088, 0.078, n, ph), V(0,0.58,-0.22), P.hideDk, true);
  }

  /* ---------- MAW — a small blunt sucker-disc at the fore end, tight to the thin fore-taper (a
     questing leech mouth, not a dominant feature); the raw-meat accent is muddied dark so it never
     jumps toward pink/magenta. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const rim = ring(S.mawB, V(0,0.4,1).normalize(), 0.036, 0.036, n, ph);
    const lip = ring(V(S.mawB.x,S.mawB.y-0.008,S.mawB.z+0.02), V(0,0.4,1).normalize(), 0.028, 0.028, n, ph);
    stitch([rim,lip], ()=>P.mawDk);
    capFan(lip, V(S.mawB.x,S.mawB.y-0.014,S.mawB.z+0.032), P.maw);
    // wet inner ring, kept small + dark
    const inner = ring(V(S.mawB.x,S.mawB.y-0.004,S.mawB.z+0.014), V(0,0.4,1).normalize(), 0.016, 0.016, n, ph);
    stitch([lip, inner], ()=>P.mawWet);
  }

  /* ---------- REAR GRIP-TENDRILS — enlarged + pulled up to the very top of the rear anchor, reading
     clearly as canopy-gripping hooks so the whole creature reads as HANGING, not standing. ---------- */
  {
    for(const [dx,dz] of [[-0.08,-0.03],[0.09,-0.04],[0.0,-0.10]]){
      const base = V(dx*0.6, S.rear.y+0.08, S.rear.z+dz*0.6);
      const tip = V(dx, S.rear.y+0.22, S.rear.z+dz*1.6-0.03);
      tube(base, tip, 0.028, 0.008, 5, P.tendril, {capB:{hex:P.tendril, lift:0.005}});
    }
  }

  /* ---------- mottled dark patches along the flank for the wet-jungle read (no pink/purple hue) ---------- */
  {
    quad(V(-0.045,0.38,-0.14), V(0.045,0.38,-0.12), V(0.038,0.46,-0.18), V(-0.038,0.46,-0.20), P.bruiseDk, 0.07);
    quad(V(-0.030,0.22,0.04), V(0.036,0.22,0.05), V(0.030,0.28,0.0), V(-0.024,0.28,-0.01), P.bruise, 0.07);
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.30, 0.30, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
