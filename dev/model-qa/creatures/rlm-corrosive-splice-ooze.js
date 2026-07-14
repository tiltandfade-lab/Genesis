/* dev/model-qa/creatures/rlm-corrosive-splice-ooze.js — CORROSIVE SPLICE-OOZE (chrome, Large
   ooze, CR 5). Read: a bubbling puddle of illegal gene-splice runoff — a broad low blob-mass
   with pockmarked bubbling craters, drips/pseudopod bulges reaching hungrily outward, a
   sickly acid-green translucent hide with a darker corrosive sludge underlayer. Chrome
   register: bio-splice runoff rather than a natural swamp ooze — chemical acid-green +
   a few embedded scrap/graft fragments dissolving in the mass. NO eye quads — the ooze has
   no face. Whole-object grammar: one function, one frame, no anchors. Large size, base disc
   r=0.55, the puddle sits low and wide, flush to the disc. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob, spotHash } from '../probe-lib.js';

export function buildCorrosiveSpliceOoze(){
  const P = {
    ooze:0x7ba83c, oozeDk:0x4c6e22, oozeLt:0x9ec766,
    sludge:0x3a4a1c, sludgeDk:0x24300f,
    bubble:0xc4e896, bubbleDk:0x6a8a3a,
    scrap:0x6e7274, scrapDk:0x44484a,
    drip:0x8fc94a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- main puddle mass — a broad low blob flattened to the ground, wide silhouette ---------- */
  blob(0, 0.13, 0, 0.46, 0.20, 0.40, P.ooze, 10, 5);
  /* secondary lower sludge layer underneath, darker, wider than the main mass */
  blob(0, 0.06, 0, 0.50, 0.08, 0.44, P.sludgeDk, 10, 3);

  /* reaching pseudopod bulges — the ooze reaching hungrily outward, asymmetric bulges off the main mass */
  blob( 0.34, 0.14,  0.20, 0.16, 0.16, 0.15, P.oozeLt, 8, 4);
  blob(-0.30, 0.10, -0.24, 0.15, 0.14, 0.14, P.ooze,   8, 4);
  blob( 0.10, 0.20,  0.36, 0.13, 0.15, 0.13, P.oozeLt, 8, 4);
  blob(-0.16, 0.09,  0.34, 0.12, 0.11, 0.12, P.ooze,   8, 4);
  /* one bulge stretching up + reaching, taller than the rest — a rearing pseudopod */
  blob( 0.02, 0.32, -0.06, 0.13, 0.22, 0.13, P.oozeLt, 8, 5);
  {
    const tip = V(0.05, 0.52, -0.10);
    tube(V(0.02,0.42,-0.06), tip, 0.09, 0.02, 6, P.ooze, {capB:{hex:P.drip, lift:0.01}});
  }

  /* pockmarked bubbling craters across the surface — corrosive gas bubbles breaking the surface */
  const craters = [
    V(0.12,0.20,0.10), V(-0.18,0.18,0.05), V(0.02,0.22,-0.14), V(0.24,0.14,-0.06),
    V(-0.08,0.16,0.22), V(0.18,0.10,0.24), V(-0.26,0.12,-0.10), V(0.0,0.08,0.0),
  ];
  craters.forEach((c, ci) => {
    const rim = ring(c, V(0,1,0), 0.06, 0.06, 6, Math.PI/6);
    const pit = ring(V(c.x,c.y-0.03,c.z), V(0,1,0), 0.035, 0.035, 6, Math.PI/6);
    stitch([rim,pit], ()=>P.bubbleDk);
    capFan(pit, V(c.x,c.y-0.04,c.z), P.sludge, true);
    /* a small bright bubble mid-pop above some craters — deterministic per-crater pick
       (~60% pop rate, fixed forever per spot, not re-rolled per build) */
    if(spotHash("bubble:" + ci) % 5 < 3) quad(V(c.x-0.02,c.y+0.03,c.z), V(c.x+0.02,c.y+0.03,c.z), V(c.x+0.016,c.y+0.06,c.z), V(c.x-0.016,c.y+0.06,c.z), P.bubble, 0.15);
  });

  /* embedded scrap/graft fragments half-dissolved in the mass (chrome-splice flavor, not a natural ooze) */
  for(const [x,z,ry] of [[0.20,0.05,0.10],[-0.22,-0.12,0.08],[0.05,0.28,0.07]]){
    quad(V(x-0.05,ry,z-0.03), V(x+0.05,ry,z-0.03), V(x+0.04,ry+0.06,z+0.02), V(x-0.04,ry+0.06,z+0.02), P.scrap, 0.08);
    quad(V(x-0.03,ry+0.01,z-0.02), V(x+0.02,ry+0.01,z-0.02), V(x+0.015,ry+0.04,z+0.01), V(x-0.025,ry+0.04,z+0.01), P.scrapDk, 0.08);
  }

  /* drip strands hanging/reaching off the mass edges toward the ground, corrosive dribble */
  for(const [x,z] of [[0.38,0.02],[-0.36,0.06],[0.10,0.42],[-0.06,-0.38]]){
    const top = V(x*0.9, 0.16, z*0.9);
    const bot = V(x*1.05, 0.02, z*1.05);
    tube(top, bot, 0.04, 0.012, 4, P.drip, {capB:{hex:P.drip, lift:0.004}});
  }

  /* base disc (Large: r=0.55) — the puddle sits flush/low against it */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop);
  }
}
