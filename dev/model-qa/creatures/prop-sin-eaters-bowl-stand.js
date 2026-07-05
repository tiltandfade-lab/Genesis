/* dev/model-qa/creatures/prop-sin-eaters-bowl-stand.js — SIN-EATER'S BOWL STAND (GLOOM set piece, Small).
   The read: a squat three-legged wooden STAND holding a single shallow ritual BOWL at chest-ish
   height, the bowl's contents a dark congealed residue (the "sin" consumed — occult-funerary tell),
   a scatter of coarse SALT or bread-crumb offerings on the stand's small shelf-lip around the bowl,
   and a stub of a spent black candle guttered beside it. Dingy, stained, occult-domestic — not
   grand. VS-desaturated dark wood + bone-pale salt + a near-black residue. One function, one
   geometry frame, no anchors. Small disc r=0.32. Imported by prop-sin-eaters-bowl-stand-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan, spotHash } from '../probe-lib.js';

export function buildPropSinEatersBowlStand(){
  /* ---------- PALETTE ---------- */
  const P = {
    wood:0x352a1e, woodDk:0x231a12, woodLt:0x483a29,        // stand timber
    bowl:0x4a4038, bowlDk:0x322a22, bowlIn:0x1c1712,         // clay bowl, dark interior
    residue:0x120e0b, residueSheen:0x241d16,                 // congealed dark contents
    salt:0xcfc6b0, saltDk:0x9d9580,                           // salt/crumb offerings
    wax:0x1c1a1a, waxDk:0x0e0c0c, wick:0x3a332c,             // spent black candle stub
    disc:0x241f1a, discTop:0x2e2822,
  };

  const shelfY = 0.42;

  /* ---------- THREE LEGS — splayed, meeting a small shelf disc ---------- */
  {
    const legAngles = [0.3, 2.4, 4.5];
    for(const a of legAngles){
      const foot = V(Math.cos(a)*0.19, 0.03, Math.sin(a)*0.19);
      const top  = V(Math.cos(a)*0.06, shelfY-0.03, Math.sin(a)*0.06);
      tube(foot, top, 0.028, 0.020, 5, P.wood, {capA:{hex:P.woodDk}});
      // a small cross-brace stub near the base for a rickety-stand read
      const braceMid = V(Math.cos(a)*0.12, 0.14, Math.sin(a)*0.12);
      tube(V(Math.cos(a)*0.19,0.09,Math.sin(a)*0.19), braceMid, 0.012, 0.010, 4, P.woodDk);
    }
  }

  /* ---------- SHELF — a small round wooden platform ---------- */
  {
    const s1=ring(V(0,shelfY-0.02,0), V(0,1,0), 0.145,0.145,10,0);
    const s2=ring(V(0,shelfY,0), V(0,1,0), 0.155,0.155,10,0);
    stitch([s1,s2], ()=>P.woodLt);
    capFan(s2, V(0,shelfY+0.006,0), P.wood);
  }

  /* ---------- BOWL — a shallow ritual bowl centered on the shelf ---------- */
  const bowlY = shelfY+0.01;
  {
    const b0=ring(V(0,bowlY,0), V(0,1,0), 0.075,0.075,10,0);
    const b1=ring(V(0,bowlY+0.045,0), V(0,1,0), 0.100,0.100,10,0);
    const b2=ring(V(0,bowlY+0.065,0), V(0,1,0), 0.105,0.105,10,0);
    stitch([b0,b1], ()=>P.bowlDk);
    stitch([b1,b2], ()=>P.bowl);
    // dark congealed residue pooled inside, just below the rim
    const rIn = ring(V(0,bowlY+0.055,0), V(0,1,0), 0.085,0.085,10,0);
    capFan(rIn, V(0,bowlY+0.050,0), P.residue);
    // a sheen fleck off-center on the residue surface
    quad(V(-0.02,bowlY+0.056,0.01), V(0.015,bowlY+0.056,0.01), V(0.01,bowlY+0.056,-0.02), V(-0.025,bowlY+0.056,-0.02), P.residueSheen, 0.04);
  }

  /* ---------- SALT / CRUMB OFFERINGS — a scatter on the shelf-lip around the bowl ---------- */
  {
    const spots = [[0.11,0.04],[0.09,-0.09],[-0.10,0.07],[-0.08,-0.10],[0.13,-0.01]];
    spots.forEach(([sx,sz],si)=>{
      const cx=sx, cz=sz;
      const g1=ring(V(cx,shelfY+0.004,cz), V(0,1,0), 0.018,0.018,5,0);
      // deterministic per-spot salt/crumb tint pick (fixed forever per spot, not re-rolled per build)
      capFan(g1, V(cx,shelfY+0.012,cz), (spotHash("salt:"+si) % 3 === 0)?P.saltDk:P.salt);
    });
  }

  /* ---------- SPENT BLACK CANDLE STUB — guttered, beside the bowl ---------- */
  {
    const cx=-0.10, cz=0.09;
    tube(V(cx,shelfY+0.002,cz), V(cx,shelfY+0.05,cz), 0.018, 0.014, 6, P.wax, {capB:{hex:P.waxDk}});
    // guttered wax drip down one side
    quad(V(cx+0.015,shelfY+0.04,cz), V(cx+0.024,shelfY+0.04,cz), V(cx+0.020,shelfY+0.005,cz+0.01), V(cx+0.013,shelfY+0.005,cz+0.01), P.waxDk, 0.05);
    // dead wick stub
    tube(V(cx,shelfY+0.05,cz), V(cx-0.004,shelfY+0.066,cz), 0.004,0.002,3, P.wick);
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
