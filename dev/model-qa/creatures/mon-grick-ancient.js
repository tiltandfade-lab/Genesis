/* dev/model-qa/creatures/mon-grick-ancient.js — the GRICK ANCIENT (bespoke Large aberration).
   Whole-object grammar: one function, one merged geometry frame, no anchors, no part-object
   transforms. The bestiary grick-ancient is a bigger, meaner grick: a thick worm-body reared
   up on its coiled tail-mass, a beaked maw ringed by four barbed tentacles, and a jutting
   tusk/crest at the beak. Rubbery grey-green, darker/older than the base grick. NO eye quads —
   the grick reads by its ringed beak + coiled bulk, not a face. Large size, base disc r=0.55. */
import { V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGrickAncient(){
  /* ---------- PALETTE (VS-desaturated rubbery grey-green, darker/mottled — an OLD grick) ---------- */
  const P = {
    hide:0x4a5240, hideDk:0x333a2c, hideLt:0x5c6650,      // rubbery grey-green skin
    mottleA:0x3e4636, mottleB:0x565f48,                    // dorsal mottle bands
    belly:0x767c62, bellyDk:0x585e48,                      // paler worm-belly rings
    beak:0x25231d, beakLt:0x37352b,                        // dark horny beak
    tusk:0x8a8270,                                          // jutting bone-pale tusk/crest
    tentacle:0x434c38, tentacleDk:0x2e3426,                 // barbed tentacles
    barb:0x1f2018,                                          // barb tips
    socket:0x14140f,                                        // dark eye-socket recesses (no eye quads)
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — a reared worm-body: coiled tail-mass low, spine rises to the beak. ---------- */
  const S = {
    tailTip: V(0.10, 0.045, -0.40),
    coilLo:  V(-0.05, 0.075, -0.28),
    coilHi:  V(0.06, 0.13, -0.10),
    base:    V(0, 0.20, 0.02),
    waist:   V(-0.03, 0.36, 0.06),
    chest:   V(0.02, 0.56, 0.02),
    throat:  V(0, 0.74, -0.03),
    jaw:     V(0, 0.90, -0.02),
    beakTip: V(0, 0.97, 0.14),
  };

  /* ---------- COILED TAIL-MASS — flattened rings on the disc, the worm settling onto itself. ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {c:S.tailTip, rx:0.070, rz:0.100, hex:P.hideDk},
      {c:S.coilLo,  rx:0.150, rz:0.190, hex:P.hide},
      {c:S.coilHi,  rx:0.190, rz:0.210, hex:P.mottleA},
      {c:S.base,    rx:0.205, rz:0.205, hex:P.hide},
    ];
    const rings=bands.map(b=>ring(b.c, V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(S.tailTip.x, S.tailTip.y-0.03, S.tailTip.z-0.03), P.hideDk, true);
    // pale worm-segment belly rings low on the coil flank
    for(const seg of [[S.coilLo,0.16],[S.coilHi,0.19]]){
      const [c,r]=seg;
      quad(V(c.x-r*0.6,c.y-0.05,c.z-r*0.3), V(c.x+r*0.6,c.y-0.05,c.z-r*0.3),
           V(c.x+r*0.5,c.y-0.02,c.z+r*0.5), V(c.x-r*0.5,c.y-0.02,c.z+r*0.5), P.belly, 0.05);
    }
  }

  /* ---------- REARED WORM-BODY — thick trunk rising from the coil to the throat. ---------- */
  tube(S.base,  S.waist, 0.200, 0.185, 10, P.hide,    {phase:Math.PI/10, capA:{hex:P.hideDk}});
  tube(S.waist, S.chest, 0.185, 0.175, 10, P.mottleB, {phase:Math.PI/10});
  tube(S.chest, S.throat,0.175, 0.140, 10, P.hide,    {phase:Math.PI/10});
  tube(S.throat,S.jaw,   0.140, 0.110, 10, P.hideDk,  {phase:Math.PI/10});
  /* worm-segment ring grooves up the trunk (dark banding lines) */
  {
    const segY=[0.28,0.40,0.50,0.60,0.68];
    for(const y of segY){
      const rr = 0.170 + (0.60-y)*0.02;
      quad(V(-rr*0.9,y,-0.02), V(rr*0.9,y,-0.02), V(rr*0.85,y+0.012,0.02), V(-rr*0.85,y+0.012,0.02), P.mottleA, 0.04);
    }
  }

  /* ---------- BEAKED MAW — ringed cranium narrowing to a hard hooked beak. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:0.90, cz:0.00, rx:0.115, rz:0.120, hex:P.hideDk},   // cranium base
      {y:0.98, cz:0.02, rx:0.100, rz:0.100, hex:P.hide},     // crown
      {y:1.02, cz:0.05, rx:0.070, rz:0.075, hex:P.beakLt},   // brow into beak root
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    // dark socket recesses (no eye quads) — carved dents either side of the cranium
    for(const s of [-1,1]){
      quad(V(s*0.075,0.95,0.03), V(s*0.095,0.95,0.05), V(s*0.090,0.90,0.06), V(s*0.070,0.90,0.04), P.socket, 0.02);
    }
    // hooked beak — two tapering plates meeting at a curved tip
    const bkRoot = V(0,1.00,0.08);
    const bkMid  = V(0,0.96,0.20);
    const bkTip  = V(0,0.90,0.30);
    tube(bkRoot, bkMid, 0.068, 0.048, 8, P.beak, {raz:0.060, rbz:0.038, phase:ph});
    tube(bkMid,  bkTip, 0.048, 0.010, 8, P.beak, {raz:0.038, rbz:0.010, phase:ph, capB:{hex:P.beak, lift:0.006}});
    // dark mouth seam under the beak join
    quad(V(-0.05,0.985,0.10), V(0.05,0.985,0.10), V(0.03,0.955,0.19), V(-0.03,0.955,0.19), P.socket, 0.03);
    // TUSK/CREST — a jutting bone-pale spur off the brow, arcing up+forward
    {
      const tR = V(0, 1.05, 0.05);
      const tM = V(0.01, 1.16, 0.10);
      const tT = V(0.02, 1.24, 0.16);
      tube(tR, tM, 0.028, 0.018, 6, P.tusk);
      tube(tM, tT, 0.018, 0.004, 6, P.tusk, {capB:{hex:P.tusk, lift:0.004}});
    }
  }

  /* ---------- FOUR BARBED TENTACLES — ringing the maw, splayed out from the throat/chest. ---------- */
  {
    const roots = [
      {a:V(-0.12,0.72,0.02), dir:V(-1,0.15,0.35)},
      {a:V( 0.12,0.72,0.02), dir:V( 1,0.15,0.35)},
      {a:V(-0.10,0.62,-0.05), dir:V(-0.75,-0.05,-0.55)},
      {a:V( 0.10,0.62,-0.05), dir:V( 0.75,-0.05,-0.55)},
    ];
    for(const {a,dir} of roots){
      const len = 0.46;
      const b = V(a.x+dir.x*len*0.55, a.y+dir.y*len*0.55, a.z+dir.z*len*0.55);
      const c = V(a.x+dir.x*len,      a.y+dir.y*len+0.06, a.z+dir.z*len);
      tube(a, b, 0.052, 0.034, 6, P.tentacle,   {capA:{hex:P.tentacleDk}});
      tube(b, c, 0.034, 0.012, 6, P.tentacleDk, {capB:{hex:P.tentacleDk, lift:0.004}});
      // barbs along the outer edge of each tentacle segment
      for(const t of [0.35,0.65,0.9]){
        const px = a.x+dir.x*len*t, py = a.y+dir.y*len*t+0.02, pz = a.z+dir.z*len*t;
        const nx = -dir.z, nz = dir.x; // rough perpendicular for outward barb
        const bb = V(px+nx*0.05, py+0.03, pz+nz*0.05);
        tube(V(px,py,pz), bb, 0.014, 0.003, 4, P.barb);
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
