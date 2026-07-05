/* dev/model-qa/creatures/prop-charnel-pit.js — CHARNEL PIT (GLOOM set piece, Huge).
   The read: a wide sunken PIT dug into the floor, its rim built up from a low ring of packed dark
   earth/ash, the pit floor down inside strewn with a jumble of BONES (long-bones + a couple of
   bare skulls, not one neat pile — scattered), a few charred BLACKENED patches on the rim and pit
   floor (burnt-offering tell), and a haze of ash-grey dust settled in the low points. Occult-horror
   register: grim, not gothic-pretty — a working charnel site. VS-desaturated dark earth + bone-pale
   + ash-grey + char-black. One function, one geometry frame, no anchors. Huge disc r=0.68.
   Imported by prop-charnel-pit-probe.html.
   REPAIR 2026-07-05 (judge: reads as an empty flat oval smudge, no discernible rim/depth/content):
   root cause was the "prop-pool" mistake in reverse — rim outer radius sat well inside the Huge
   disc (0.60 vs 0.68), leaving a dead bare-disc band, the rim itself only rose ~0.09u (barely a
   lip), the pit was a shallow 0.16u dish, and every tell (bones/char/ash) was small + within the
   same dark low-value earth family as the rim/floor — near-zero contrast at dimetric distance.
   Fix mirrors what prop-pool.js does right: push the rim OUT to the disc edge (no dead band),
   raise the rim + deepen the pit for real silhouette relief, and push the bone-pale MUCH lighter/
   brighter than the earth so the charnel content actually pops against the dark pit floor. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropCharnelPit(){
  /* ---------- PALETTE (bone pushed pale/bright; earth/pit kept dark for contrast) ---------- */
  const P = {
    earth:0x453c2c, earthDk:0x2a2216, earthLt:0x5c5138,      // packed rim earth
    pitFloor:0x1c160f, pitFloorDk:0x110d08,                    // sunken pit floor (near-black)
    bone:0xe4d8b8, boneDk:0xb8ab88, boneShad:0x8a7d5c,        // bones — pale, high-contrast vs pit
    char:0x0c0a08, charLt:0x1e1a15,                            // charred patches
    ash:0x9a9488, ashDk:0x6f6a5e,                              // settled ash haze
    disc:0x2c2822, discTop:0x362f27,
  };

  const rimR = 0.68, rimIn = 0.56, pitR = 0.50, pitDepth = 0.26;

  /* ---------- RIM — built up ring of packed earth, reaching the FULL disc edge (no dead band)
     and raised enough (~0.20u) to read as a real lip in silhouette. ---------- */
  {
    const r0=ring(V(0,0.003,0), V(0,1,0), rimR, rimR, 20, 0);
    const r1=ring(V(0,0.20,0), V(0,1,0), rimIn, rimIn, 20, 0);
    // outer sloped face — alternating earth tones for a lumpy packed-earth read
    for(let i=0;i<20;i++){ const j=(i+1)%20; quad(r0[i],r0[j],r1[j],r1[i], (i%3===0? P.earthDk : P.earth), 0.06); }
    // top coping (the flat-ish rim crest, lit)
    const rTop=ring(V(0,0.215,0), V(0,1,0), rimIn-0.03, rimIn-0.03, 20, 0);
    stitch([r1,rTop], ()=>P.earthLt);
    // inner rim slope down toward the pit lip (in shadow)
    const rLip=ring(V(0,0.03,0), V(0,1,0), pitR+0.03, pitR+0.03, 20, 0);
    stitch([rTop,rLip], ()=>P.earthDk);
  }

  /* ---------- PIT FLOOR — deep sunken bowl, near-black so the pale bones read against it ---------- */
  {
    const rTop=ring(V(0,0.03,0), V(0,1,0), pitR, pitR, 20, 0);
    const rMid=ring(V(0,0.03-pitDepth*0.55,0), V(0,1,0), pitR*0.82, pitR*0.82, 20, 0);
    const rBot=ring(V(0,0.03-pitDepth,0), V(0,1,0), pitR*0.55, pitR*0.55, 20, 0);
    stitch([rTop,rMid], (b,i)=>(i%2? P.pitFloor:P.pitFloorDk));
    stitch([rMid,rBot], ()=>P.pitFloorDk);
    capFan(rBot, V(0,0.03-pitDepth-0.01,0), P.pitFloorDk);
  }

  const floorY = 0.03-pitDepth+0.008;

  /* ---------- CHARRED PATCHES — burnt-black smears on rim + pit floor ---------- */
  quad(V(-0.36,0.205,0.10), V(-0.16,0.208,0.16), V(-0.19,0.20,0.34), V(-0.39,0.198,0.28), P.char, 0.05);
  quad(V(0.06,floorY,-0.14), V(0.30,floorY,-0.08), V(0.28,floorY,0.12), V(0.04,floorY,0.08), P.charLt, 0.05);

  /* ---------- ASH HAZE — settled grey dust filling the low points, lighter so it reads vs floor ---------- */
  quad(V(-0.26,floorY+0.003,-0.26), V(0.02,floorY+0.003,-0.32), V(0.05,floorY+0.003,-0.08), V(-0.22,floorY+0.003,-0.04), P.ash, 0.07);
  quad(V(0.12,floorY+0.003,0.18), V(0.34,floorY+0.003,0.15), V(0.32,floorY+0.003,0.36), V(0.11,floorY+0.003,0.37), P.ashDk, 0.06);

  /* ---------- BONES — scattered jumble: long-bones as tapered tubes + three bare skulls, sized up
     and paled so the charnel content is unmistakable against the dark pit floor. ---------- */
  {
    const longBone=(x0,z0,x1,z1,y,hex)=>{
      const a=V(x0,y,z0), b=V(x1,y+0.012,z1);
      tube(a,b,0.030,0.024,6,hex,{capA:{hex:P.boneShad}, capB:{hex:P.boneShad}});
      const e1=ring(a,V(b.x-a.x,0,b.z-a.z),0.038,0.038,6,0); capFan(e1,V(a.x-(b.x-a.x)*0.05,a.y,a.z-(b.z-a.z)*0.05),hex,true);
      const e2=ring(b,V(a.x-b.x,0,a.z-b.z),0.038,0.038,6,0); capFan(e2,V(b.x-(a.x-b.x)*0.05,b.y,b.z-(a.z-b.z)*0.05),hex);
    };
    longBone(-0.28,-0.20, 0.03,0.14, floorY+0.01, P.bone);
    longBone(0.14,0.28, -0.08,-0.02, floorY+0.008, P.boneDk);
    longBone(-0.06,0.32, 0.24,0.40, floorY+0.014, P.bone);
    longBone(0.30,-0.22, 0.46,-0.06, floorY+0.008, P.boneDk);
    longBone(-0.34,0.05, -0.16,0.24, floorY+0.01, P.boneDk);

    const skull=(cx,cz,y,scale)=>{
      const s=scale;
      const bands=[
        {y:y,        cz:cz-0.014*s, rx:0.066*s, hex:P.boneShad},
        {y:y+0.042*s, cz:cz,        rx:0.086*s, hex:P.bone},
        {y:y+0.084*s, cz:cz+0.007*s,rx:0.070*s, hex:P.boneDk},
      ];
      const rings=bands.map(b=>ring(V(cx,b.y,b.cz),V(0,1,0),b.rx,b.rx*0.92,8,Math.PI/8));
      stitch(rings,b=>bands[b].hex);
      capFan(rings.at(-1), V(cx,y+0.105*s,cz), P.bone);
      // eye sockets (dark pits, not quad "eyes" — recessed hollows read as sockets)
      for(const s2 of [-1,1]){
        const ec=V(cx+s2*0.030*s, y+0.048*s, cz+0.062*s);
        const e1=ring(ec, V(0,0,1), 0.020*s,0.020*s,6,0);
        capFan(e1, V(ec.x,ec.y,ec.z+0.008*s), P.char);
      }
      // jaw hint (a small dark wedge below)
      quad(V(cx-0.035*s,y-0.014*s,cz+0.042*s), V(cx+0.035*s,y-0.014*s,cz+0.042*s), V(cx+0.021*s,y-0.042*s,cz+0.049*s), V(cx-0.021*s,y-0.042*s,cz+0.049*s), P.boneShad, 0.05);
    };
    skull(-0.14,-0.10, floorY+0.02, 1.3);
    skull(0.24,0.20, floorY+0.016, 1.15);
    skull(-0.04,0.34, floorY+0.014, 1.0);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
