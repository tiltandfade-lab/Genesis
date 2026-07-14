/* dev/model-qa/creatures/rlm-the-ironclad-reaver-queen.js — The Ironclad Reaver-Queen (theater,
   high-seas lens read, Huge, CR 15). A longship's iron-plated hull fused waist-down with its
   captain, one war-machine: below the waist a hull-shaped lower body — riveted iron plating,
   a curved dragon-prow jutting forward like a ram, oar-stubs along the flanks like clawed legs
   bracing the hull upright — above the waist a crowned reaver-queen torso rising from the deck
   like a figurehead come alive, iron breastplate, a tattered sail draped like a cloak off one
   shoulder, one arm raised gripping a boarding-axe, the other fused to the ship's wheel/tiller
   growing straight out of her hip. The read: ship AND captain, one silhouette, not two things
   glued together. VS-desaturated rust-iron + weathered-teal hull palette, salt-bleached wood.
   Whole-object grammar, one merged frame, no anchors. NO eye quads. Huge disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheIroncladReaverQueen(){
  const P = {
    iron:0x4a4e50, ironDk:0x2c2e30, ironLt:0x646a6c,
    rust:0x6e4432, rustDk:0x462a1e,
    hull:0x3c5450, hullDk:0x263834, hullLt:0x567268,       // weathered teal-green hull paint
    wood:0x4a3826, woodDk:0x2a1f16, woodLt:0x6a5238,
    sail:0x8a8270, sailDk:0x5c5648,
    skin:0x8a7863, skinDk:0x5c4c3c,
    crown:0x8a7844, crownDk:0x5c4c2c,
    rivet:0x1e2022,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — hull-body low, queen-torso rising from the deck at the waist. ---------- */
  const hullY = 0.30;
  const S = {
    sternHull: V(0, hullY, -0.60),
    midHull:   V(0, hullY+0.06, -0.10),
    deck:      V(0, hullY+0.20, 0.20),
    waist:     V(0, hullY+0.46, 0.20),
    chest:     V(0, hullY+0.72, 0.24),
    shldr:     V(0, hullY+0.92, 0.24),
    neck:      V(0, hullY+1.00, 0.20),
    headB:     V(0, hullY+1.05, 0.16),
    headT:     V(0, hullY+1.24, 0.10),
  };

  /* ---------- HULL-BODY — a riveted iron-plated longship hull as the lower body, curved keel
     belly, flanks rising to the deck where the queen's torso emerges. ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:S.sternHull.y-0.10, cz:S.sternHull.z, rx:0.26, rz:0.34, hex:P.hullDk},
      {y:S.sternHull.y,      cz:S.sternHull.z, rx:0.34, rz:0.40, hex:P.hull},
      {y:S.midHull.y,        cz:S.midHull.z,   rx:0.42, rz:0.46, hex:P.hullLt},
      {y:S.deck.y,           cz:S.deck.z,      rx:0.44, rz:0.44, hex:P.hull},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.sternHull.y-0.18,S.sternHull.z-0.06), P.hullDk, true);

    // riveted iron plating strakes along the hull flanks
    for(const [cz,rx] of [[-0.50,0.32],[-0.20,0.40],[0.10,0.43]]){
      const r1=ring(V(0,hullY+0.02,cz),V(0,1,0),rx,rx*1.05,n,ph), r2=ring(V(0,hullY+0.05,cz),V(0,1,0),rx*0.99,rx*1.04,n,ph);
      stitch([r1,r2],()=>P.iron);
      // rivet dots along the strake
      for(let i=0;i<n;i+=2){
        const t=ph+(i/n)*Math.PI*2;
        const rx2=rx*1.0;
        tube(V(Math.cos(t)*rx2*0.3,hullY+0.03,cz+Math.sin(t)*rx2*0.35), V(Math.cos(t)*rx2*0.32,hullY+0.03,cz+Math.sin(t)*rx2*0.37), 0.012,0.012,3,P.rivet);
      }
    }

    // DRAGON-PROW — a curved ram jutting forward from the hull nose
    const pr0=V(0,hullY+0.14,S.deck.z+0.30), pr1=V(0,hullY+0.30,S.deck.z+0.54), pr2=V(0,hullY+0.42,S.deck.z+0.66);
    tube(pr0,pr1,0.18,0.13,8,P.wood);
    tube(pr1,pr2,0.13,0.05,8,P.woodDk,{capB:{hex:P.iron,lift:0.02}});
    // curled prow-tip iron spike
    tube(pr2, V(0,hullY+0.58,S.deck.z+0.72), 0.05,0.015,5,P.ironDk,{capB:{hex:P.ironDk,lift:0.01}});

    // OAR-STUBS — clawed leg-like stubs bracing the hull upright along both flanks
    for(const sx of [-1,1]){
      for(const cz of [-0.44,-0.08]){
        const top=V(sx*0.40,hullY-0.04,cz), tip=V(sx*0.58,-0.02,cz+0.06);
        tube(top,tip,0.055,0.028,5,P.woodDk,{capB:{hex:P.ironDk,lift:0.01}});
      }
    }

    // KEEL FIN dropping straight down under the hull centerline (grounds the silhouette + base)
    quad(V(-0.05,hullY-0.10,-0.30), V(0.05,hullY-0.10,-0.30), V(0.03,-0.06,-0.20), V(-0.03,-0.06,-0.20), P.ironDk, 0.05);
  }

  /* ---------- QUEEN TORSO — rising from the deck, iron breastplate, tattered sail-cloak. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.waist.y, cz:S.waist.z, rx:0.185, hex:P.ironDk},
      {y:S.chest.y-0.06, cz:S.chest.z, rx:0.205, hex:P.iron},
      {y:S.chest.y,   cz:S.chest.z,   rx:0.220, hex:P.ironLt},
      {y:S.shldr.y,   cz:S.shldr.z,   rx:0.235, hex:P.iron},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.80, n, ph));
    stitch(rings, b=>bands[b].hex);
    // rivet seam down the breastplate center
    for(const t of [0,1,2]){
      const yy=S.waist.y+0.08+t*0.16;
      tube(V(-0.01,yy,S.chest.z+0.16), V(0.01,yy,S.chest.z+0.16), 0.014,0.014,3,P.rivet);
    }
    // TATTERED SAIL-CLOAK — draped off one shoulder, ragged bottom edge, salt-bleached canvas
    const clA=V(-0.24,S.shldr.y+0.04,S.shldr.z-0.04), clB=V(-0.30,S.waist.y-0.10,S.waist.z-0.30);
    const clC=V(-0.10,hullY+0.10,S.deck.z-0.40), clD=V(-0.14,S.chest.y,S.chest.z-0.10);
    quad(clA,clD,clC,clB,P.sail,0.06);
    quad(clB,clC,clD,clA,P.sailDk,0.06);
    // ragged tears along the cloak bottom
    for(const [dx,dz] of [[-0.02,0.06],[0.06,-0.02],[-0.08,0.02]]){
      quad(V(clC.x+dx,clC.y,clC.z+dz), V(clC.x+dx+0.05,clC.y,clC.z+dz),
           V(clC.x+dx+0.03,clC.y-0.10,clC.z+dz+0.02), V(clC.x+dx-0.02,clC.y-0.10,clC.z+dz), P.sailDk, 0.05);
    }
  }

  /* ---------- HEAD — crowned reaver-queen, hollow grim socket-face, no eye quads. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.088, hex:P.skinDk},
      {y:S.headB.y+0.07, r:0.096, hex:P.skin},
      {y:S.headT.y-0.04, r:0.078, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z-0.02), P.skin);
    // socket shading, no eyes
    quad(V(-0.062,S.headB.y+0.055,S.headB.z+0.075), V(-0.015,S.headB.y+0.055,S.headB.z+0.080),
         V(-0.020,S.headB.y+0.088,S.headB.z+0.074), V(-0.058,S.headB.y+0.088,S.headB.z+0.068), P.skinDk, 0.05);
    quad(V(0.015,S.headB.y+0.055,S.headB.z+0.080), V(0.062,S.headB.y+0.055,S.headB.z+0.075),
         V(0.058,S.headB.y+0.088,S.headB.z+0.068), V(0.020,S.headB.y+0.088,S.headB.z+0.074), P.skinDk, 0.05);
    // grim set mouth
    quad(V(-0.026,S.headB.y+0.005,S.headB.z+0.083), V(0.026,S.headB.y+0.005,S.headB.z+0.083),
         V(0.021,S.headB.y-0.015,S.headB.z+0.078), V(-0.021,S.headB.y-0.015,S.headB.z+0.078), P.skinDk, 0.04);
    // IRON CROWN — a jagged ring of iron points, ship-fitting made regalia
    const crB=ring(V(0,S.headT.y-0.02,S.headB.z-0.02), V(0,1,0), 0.088,0.078, 7, ph);
    const crT=ring(V(0,S.headT.y+0.03,S.headB.z-0.02), V(0,1,0), 0.076,0.068, 7, ph);
    stitch([crB,crT], ()=>P.crownDk);
    for(let i=0;i<7;i++){
      const p=crT[i];
      tube(V(p.x*0.95,p.y,p.z*0.95+S.headB.z*0.05), V(p.x*1.1,p.y+0.10,p.z*1.1), 0.014,0.004,3,P.crown,{capB:{hex:P.crown,lift:0.003}});
    }
  }

  /* ---------- ARMS — one raised gripping a boarding-axe, one fused to a ship's-wheel spoke
     growing straight from the hip (ship AND captain, one machine). ---------- */
  {
    // right arm: raised with boarding axe
    const shR=V(-0.20,S.shldr.y-0.02,S.shldr.z), elR=V(-0.32,S.chest.y+0.14,S.shldr.z+0.10), hR=V(-0.30,S.headT.y+0.06,S.shldr.z+0.20);
    tube(shR,elR,0.058,0.046,6,P.iron);
    tube(elR,hR,0.046,0.034,6,P.skin,{capB:{hex:P.skin,lift:0.02}});
    // boarding axe head + haft
    const haftT=V(-0.30,S.headT.y+0.24,S.shldr.z+0.30);
    tube(hR,haftT,0.020,0.014,5,P.woodDk);
    quad(V(-0.30,S.headT.y+0.24,S.shldr.z+0.30), V(-0.30,S.headT.y+0.16,S.shldr.z+0.30),
         V(-0.46,S.headT.y+0.20,S.shldr.z+0.36), V(-0.44,S.headT.y+0.30,S.shldr.z+0.38), P.ironLt, 0.05);

    // left arm: fused to a ship's-wheel growing from the hip
    const shL=V(0.20,S.shldr.y-0.02,S.shldr.z), elL=V(0.28,S.chest.y-0.14,S.shldr.z+0.06), hL=V(0.22,S.waist.y-0.02,S.waist.z+0.16);
    tube(shL,elL,0.058,0.046,6,P.iron);
    tube(elL,hL,0.046,0.036,6,P.iron,{capB:{hex:P.ironDk,lift:0.01}});
    // ship's wheel fused at the hip, spokes radiating
    const wheelC=V(0.24,S.waist.y-0.04,S.waist.z+0.20);
    const w1=ring(wheelC, V(0,0,1), 0.14,0.14,8), w2=ring(V(wheelC.x,wheelC.y,wheelC.z+0.03), V(0,0,1), 0.135,0.135,8);
    stitch([w1,w2],()=>P.woodDk);
    for(let i=0;i<8;i++){
      const p=w1[i];
      tube(V(wheelC.x,wheelC.y,wheelC.z), p, 0.014,0.014,3,P.wood);
      tube(p, V(p.x*1.15,p.y*1.15+wheelC.y*(1-1.15)+wheelC.y,wheelC.z), 0.018,0.006,3,P.woodLt);
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.062,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.065,0), P.discTop);
  }
}
