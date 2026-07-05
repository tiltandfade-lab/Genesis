/* dev/model-qa/creatures/rlm-the-ghost-ship-herself.js — THE GHOST SHIP HERSELF (high-seas,
   Gargantuan, CR 10). Read: a sail-shredded derelict with a translucent hull, sailing herself —
   a full ship silhouette (hull, single mast, tattered sail, bowsprit) rendered as the "monster":
   the hull reads pale and see-through (translucent-pale planking, dark ribs showing through),
   shredded sail hanging in tatters, mast leaning, no crew, moving on its own. VS-desaturated
   high-seas register (salt, debt-to-the-crew, a horizon that keeps its own counsel): bone-pale
   ghost-timber, dark waterlogged ribs, tattered bone-grey sailcloth. NO eye quads (a ship has
   none — a dark ragged figurehead-hollow instead). Whole-object grammar, one merged frame.
   Gargantuan disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheGhostShipHerself(){
  const P = {
    hull:0x8a8478, hullDk:0x5c584c, hullLt:0xa6a094,            // bone-pale translucent-read hull planking
    rib:0x3a362c, ribDk:0x242017,                                // dark waterlogged ribs showing through
    sail:0x8c8a80, sailDk:0x5e5c52, sailTear:0x3a3830,          // tattered bone-grey sailcloth
    mast:0x4a4438, mastDk:0x2c2820,
    hollow:0x141210,                                             // figurehead dark hollow (no eyes)
    rope:0x5a5040,
    disc:0x2c2924, discTop:0x3a362e,
  };

  /* ---------- HULL — a long low ship-hull silhouette, keel to gunwale, tapering to bow + stern. -- */
  const hy = 0.20;                                    // waterline height
  const S = {
    stern: V(0, hy+0.06, -0.66),
    aft:   V(0, hy+0.10, -0.40),
    mid:   V(0, hy+0.14, 0.0),
    fore:  V(0, hy+0.10, 0.40),
    bow:   V(0, hy+0.04, 0.62),
    bowspr:V(0, hy-0.02, 0.86),
  }
  {
    const n=12, ph=Math.PI/n;
    const bands=[
      {pt:S.stern, rx:0.10, rz:0.16, hex:P.hullDk},
      {pt:S.aft,   rx:0.24, rz:0.28, hex:P.hull},
      {pt:S.mid,   rx:0.30, rz:0.34, hex:P.hullLt},
      {pt:S.fore,  rx:0.24, rz:0.26, hex:P.hull},
      {pt:S.bow,   rx:0.12, rz:0.14, hex:P.hullDk},
    ];
    const rings = bands.map(b=>ring(V(b.pt.x,b.pt.y,b.pt.z), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), S.bow, P.hullDk);
    capFan(rings[0], S.stern, P.hullDk, true);
    // dark waterlogged ribs showing through the "translucent" hull — visible rib-lines along the flank
    for(const s of [-1,1]){
      for(let i=0;i<6;i++){
        const t=i/5, z = -0.55+t*1.1;
        const rx = s*(0.20+0.10*Math.sin(t*Math.PI));
        quad(V(rx-0.015,hy-0.10,z-0.03), V(rx+0.015,hy-0.10,z-0.03), V(rx*0.9,hy+0.16,z+0.02), V(rx*0.9-0.01,hy+0.16,z-0.01), P.rib, 0.10);
      }
    }
    // keel underside, dark
    quad(V(-0.06,hy-0.16,-0.55), V(0.06,hy-0.16,-0.55), V(0.04,hy-0.20,0.45), V(-0.04,hy-0.20,0.45), P.ribDk, 0.05);
  }

  /* ---------- FIGUREHEAD — a dark ragged hollow shape at the bow, once-carved, now just a
     silhouette-suggestion, no facial features, no eyes — a hollow where a face would be. -------- */
  {
    const fb = V(0, hy+0.02, 0.66);
    const ft = V(0, hy+0.18, 0.78);
    tube(fb, ft, 0.06, 0.02, 6, P.hullDk, {capB:{hex:P.hullDk, lift:0.01}});
    quad(V(-0.03,hy+0.06,0.70), V(0.03,hy+0.06,0.70), V(0.02,hy+0.12,0.72), V(-0.02,hy+0.12,0.72), P.hollow, 0.05);
  }

  /* ---------- BOWSPRIT — a long spar jutting forward from the bow, trailing frayed rigging. ----- */
  {
    tube(S.bow, S.bowspr, 0.030, 0.010, 6, P.mastDk, {capB:{hex:P.mastDk, lift:0.008}});
    // frayed rigging line hanging off
    const rTip = V(0.03, hy-0.06, 0.80);
    tube(S.bowspr, rTip, 0.010, 0.003, 4, P.rope);
  }

  /* ---------- MAST — a single leaning mast, cross-yard, tattered sail hanging in shreds. -------- */
  const mastBase = V(-0.02, hy+0.16, -0.02);
  const mastTop  = V(0.08, hy+1.30, -0.10);          // leaning, off-vertical
  {
    tube(mastBase, mastTop, 0.045, 0.020, 8, P.mast, {phase:Math.PI/8, capB:{hex:P.mastDk, lift:0.01}});
    // cross-yard
    const yardY = hy+0.85;
    const yardL = V(mastBase.x + (mastTop.x-mastBase.x)*0.55 - 0.42, yardY, mastBase.z + (mastTop.z-mastBase.z)*0.55);
    const yardR = V(mastBase.x + (mastTop.x-mastBase.x)*0.55 + 0.42, yardY, mastBase.z + (mastTop.z-mastBase.z)*0.55);
    tube(yardL, yardR, 0.018, 0.018, 6, P.mastDk);

    /* ---------- TATTERED SAIL — hangs off the yard, shredded into uneven ragged strips. -------- */
    const stripCount=6;
    for(let i=0;i<stripCount;i++){
      const t0=i/stripCount, t1=(i+1)/stripCount;
      const xA = yardL.x + (yardR.x-yardL.x)*t0, xB = yardL.x + (yardR.x-yardL.x)*t1;
      const dropLen = 0.35 + ((i*37)%5)*0.06;              // uneven tear lengths
      const yTearA = yardY - dropLen, yTearB = yardY - dropLen*0.7;
      quad(V(xA,yardY,yardL.z), V(xB,yardY,yardL.z), V(xB-0.02,yTearB,yardL.z+0.03), V(xA+0.02,yTearA,yardL.z+0.03), (i%2?P.sail:P.sailDk), 0.10);
    }
    // dark tear-edges along the strips
    for(let i=1;i<stripCount;i++){
      const t=i/stripCount, x=yardL.x+(yardR.x-yardL.x)*t;
      quad(V(x-0.012,yardY,yardL.z+0.02), V(x+0.012,yardY,yardL.z+0.02), V(x+0.008,yardY-0.30,yardL.z+0.04), V(x-0.008,yardY-0.30,yardL.z+0.04), P.sailTear, 0.08);
    }
  }

  /* ---------- rigging lines from mast-top down to bow + stern (ghostly, sparse) ---------- */
  {
    tube(mastTop, S.bow, 0.010, 0.005, 3, P.rope, {capB:{hex:P.rope, lift:0.002}});
    tube(mastTop, S.stern, 0.010, 0.005, 3, P.rope, {capB:{hex:P.rope, lift:0.002}});
  }

  /* ---------- base disc (Gargantuan: r=0.72) — the "water" the ship stands on. ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.71, 0.71, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.021,0), P.discTop, true);
  }
}
