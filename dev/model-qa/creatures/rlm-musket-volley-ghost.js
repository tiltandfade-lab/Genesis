/* dev/model-qa/creatures/rlm-musket-volley-ghost.js — Musket Volley Ghost (theater, Medium, CR 1).
   A spectral rank of soldiers standing shoulder to shoulder in smoke. Whole-object grammar: read as
   ONE creature silhouette — a single ghostly mass built from THREE overlapping translucent-read
   soldier-silhouettes fused at the base into a rolling smoke-skirt, rifles raised in a ragged volley
   line, wisping upward into nothing above the shoulders. VS-desaturated spectral palette (pale ash-
   blue drab, faded ghost-white smoke, dull ghost-brass). NO eye quads — faces fade to smoke, no
   distinct heads (dissolve above the neckline). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMusketVolleyGhost(){
  const P = {
    spec:0x6a7078, specDk:0x454a52, specLt:0x8890966,
    smoke:0x9aa0a0, smokeLt:0xbfc4c2, smokeDk:0x6e7472,
    brass:0x6e6850,
    barrel:0x3c4044,
    disc:0x3e4442, discTop:0x4a504c,
  };

  /* ---------- ONE FUSED SMOKE-SKIRT BASE — the three figures share one rolling ground-hugging
     smoke mass so the whole reads as a single creature, not three. ---------- */
  {
    const skirtSpots = [[-0.20,0],[0.0,0.02],[0.20,-0.01]];
    for(const [x,z] of skirtSpots){
      const r1 = ring(V(x,0.06,z), V(0,1,0), 0.20, 0.17, 10, 0.3);
      const r2 = ring(V(x,0.16,z+0.02), V(0,1,0), 0.16, 0.13, 10, 0.5);
      stitch([r1,r2], ()=>P.smoke);
    }
    // connecting smoke webs between the three stances so it reads unified
    quad(V(-0.30,0.10,-0.02), V(-0.08,0.10,0.0), V(-0.10,0.20,0.02), V(-0.28,0.20,0.0), P.smokeLt, 0.10);
    quad(V(0.08,0.10,0.0), V(0.30,0.10,-0.02), V(0.28,0.20,0.0), V(0.10,0.20,0.02), P.smokeLt, 0.10);
  }

  /* ---------- THREE RANK SILHOUETTES — each a simple tapering torso+raised-musket loft, standing
     shoulder to shoulder, fading (thinning + paling) toward the top instead of resolving heads. ---------- */
  const rankX = [-0.20, 0.0, 0.20];
  const rankZ = [0.0, 0.03, -0.02];
  rankX.forEach((x,i)=>{
    const z = rankZ[i];
    const hex = i===1 ? P.specLt : (i===0? P.spec : P.specDk);
    const base = V(x, 0.14, z);
    const waist= V(x*0.9, 0.34, z+0.01);
    const chest= V(x*0.8, 0.52, z+0.02);
    const shldr= V(x*0.7, 0.64, z+0.02);
    const fade = V(x*0.5, 0.80, z);           // dissolving into smoke, no head
    tube(base, waist, 0.13, 0.115, 8, hex, {phase:Math.PI/8});
    tube(waist, chest, 0.115, 0.10, 8, hex, {phase:Math.PI/8});
    tube(chest, shldr, 0.10, 0.075, 8, hex, {phase:Math.PI/8});
    tube(shldr, fade, 0.075, 0.01, 8, P.smokeLt, {phase:Math.PI/8, capB:{hex:P.smokeLt, lift:0.02}});

    // raised musket for this rank-member: diagonal stock across chest up to a leveled barrel
    const stockB = V(x*0.85, waist.y+0.02, z+0.06);
    const stockM = V(x*0.6, chest.y+0.05, z+0.16);
    const muzzle = V(x*0.4, chest.y+0.14, z+0.42);
    tube(stockB, stockM, 0.020, 0.016, 6, P.barrel);
    tube(stockM, muzzle, 0.014, 0.009, 6, P.barrel, {capB:{hex:P.brass, lift:0.004}});
    // faint muzzle flash / smoke puff at each barrel tip
    quad(V(muzzle.x-0.05,muzzle.y,muzzle.z), V(muzzle.x+0.05,muzzle.y,muzzle.z),
         V(muzzle.x+0.03,muzzle.y+0.08,muzzle.z+0.06), V(muzzle.x-0.03,muzzle.y+0.08,muzzle.z+0.06), P.smokeLt, 0.12);
  });

  /* ---------- rising volley-smoke wisps binding the whole rank into one silhouette overhead ---------- */
  {
    const wisps = [[-0.14,0.70,0.10,0.10],[0.02,0.78,0.14,0.12],[0.16,0.72,0.10,0.09],[-0.02,0.90,0.20,0.14]];
    for(const [x,y,z,r] of wisps){
      quad(V(x-r,y,z), V(x+r,y,z), V(x+r*0.6,y+r*0.8,z+r*0.3), V(x-r*0.6,y+r*0.8,z+r*0.3), P.smokeLt, 0.12);
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
