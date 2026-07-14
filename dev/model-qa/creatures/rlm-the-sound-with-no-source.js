/* dev/model-qa/creatures/rlm-the-sound-with-no-source.js — THE SOUND WITH NO SOURCE
   (cosmic, Gargantuan, CR 15). Read: a vast half-formed silhouette woven from visible, rippling
   sound-waves — no solid mass, just concentric wave-rings and rippling wave-sheets stacked into a
   towering humanoid-ish silhouette that never quite resolves into a body. VS-desaturated cosmic
   palette (per data/realms.js cosmic register: "scale that doesn't fit in a sentence"), grey-violet
   and sick pale-cyan, nothing warm. NO eye quads. Whole-object grammar, one merged frame.
   Gargantuan disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheSoundWithNoSource(){
  const P = {
    waveA:0x4a4658, waveB:0x5c5a70, waveC:0x3a3846,           // grey-violet wave bands
    waveLt:0x7a7690, waveDk:0x282632,
    core:0x8a92a0, coreDk:0x565c68,                            // pale sick cyan-grey "throat" of the sound
    ripple:0x6a6478, rippleDk:0x36333e,
    disc:0x28262e, discTop:0x38343e,
  };

  /* ---------- LANDMARKS — a rough vertical column, torso-ish, never solid: spine of wave-rings. -- */
  const S = {
    base:  V(0, 0.10, 0.0),
    low:   V(0.04, 0.55, -0.05),
    mid:   V(-0.05, 1.05, 0.06),
    chestB:V(0.02, 1.55, -0.02),
    upper: V(-0.03, 2.05, 0.04),
    head:  V(0.0,  2.45, 0.0),
    crown: V(0.02, 2.80, -0.02),
  };

  /* ---------- WAVE-COLUMN — stacked concentric rings, radii oscillating (ripple, not a solid taper). */
  {
    const n=14, ph=Math.PI/n;
    const bands=[
      {y:0.10, r:0.28, hex:P.waveDk},
      {y:0.42, r:0.52, hex:P.waveA},
      {y:0.55, r:0.40, hex:P.waveB},
      {y:0.72, r:0.60, hex:P.waveC},
      {y:0.90, r:0.46, hex:P.waveA},
      {y:1.10, r:0.58, hex:P.waveB},
      {y:1.30, r:0.44, hex:P.waveC},
      {y:1.50, r:0.50, hex:P.waveA},
      {y:1.70, r:0.38, hex:P.waveDk},
      {y:1.90, r:0.44, hex:P.waveB},
      {y:2.10, r:0.32, hex:P.waveC},
      {y:2.30, r:0.24, hex:P.waveA},
      {y:2.50, r:0.15, hex:P.waveDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.r, b.r, n, ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(0,2.62,0), P.waveDk);
  }

  /* ---------- RIPPLE SHEETS — thin radiating quad-fins jutting out from the column at intervals,
     reading as visible sound-waves rippling outward, breaking the silhouette's edge. ---------- */
  {
    const heights=[0.42,0.72,1.10,1.50,1.90,2.30];
    heights.forEach((hy,i)=>{
      const rC = (i%2? 0.62:0.50);
      for(let k=0;k<6;k++){
        const a = (k/6)*Math.PI*2 + (i*0.4);
        const x0=Math.cos(a)*rC*0.9, z0=Math.sin(a)*rC*0.9;
        const x1=Math.cos(a)*(rC+0.30), z1=Math.sin(a)*(rC+0.30);
        const yA=hy, yB=hy+0.16*(k%2?1:-1);
        quad(V(x0,yA-0.10,z0), V(x0,yA+0.10,z0), V(x1,yB+0.05,z1), V(x1,yB-0.05,z1), (k%2?P.ripple:P.rippleDk), 0.10);
      }
    });
  }

  /* ---------- THROAT / CORE — a pale sick-cyan resonant throat glimpsed through the wave-mass,
     the notional "source" that never resolves — held mid-column, small, half-hidden. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const rings=[
      ring(V(0,1.00,0.10), V(0,1,0), 0.12, 0.10, n, ph),
      ring(V(0,1.28,0.12), V(0,1,0), 0.16, 0.13, n, ph),
      ring(V(0,1.56,0.09), V(0,1,0), 0.10, 0.08, n, ph),
    ];
    stitch(rings, ()=>P.core);
    capFan(rings.at(-1), V(0,1.62,0.09), P.coreDk);
    capFan(rings[0], V(0,0.96,0.10), P.coreDk, true);
  }

  /* ---------- HEAD-ECHO — where a head would resolve: a loose ring-lattice, no solid skull, no
     eye quads — just wave-rings tightening to a point that suggests without confirming a head. --- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:2.15, r:0.30, hex:P.waveB},
      {y:2.34, r:0.22, hex:P.waveA},
      {y:2.52, r:0.14, hex:P.waveDk},
      {y:2.68, r:0.07, hex:P.waveC},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.r, b.r, n, ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(0,2.78,0), P.waveDk);
  }

  /* ---------- TRAILING WAVE-LIMBS — two loose ribbon-tubes hanging where arms might be, made of
     the same rippling wave-stuff, tapering to nothing (never resolving into hands). ---------- */
  for(const s of [-1,1]){
    const a0 = V(s*0.42, 1.65, 0.0);
    const a1 = V(s*0.65, 1.25, s*0.10);
    const a2 = V(s*0.78, 0.75, -s*0.08);
    const a3 = V(s*0.82, 0.30, s*0.06);
    tube(a0, a1, 0.16, 0.13, 8, P.waveB, {phase:Math.PI/8});
    tube(a1, a2, 0.13, 0.08, 8, P.waveC, {phase:Math.PI/8});
    tube(a2, a3, 0.08, 0.02, 8, P.waveDk, {phase:Math.PI/8, capB:{hex:P.waveDk, lift:0.02}});
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.71, 0.71, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.021,0), P.discTop, true);
  }
}
