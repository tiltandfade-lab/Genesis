/* dev/model-qa/creatures/rlm-the-first-priest-king-undying.js — THE FIRST PRIEST-KING, UNDYING
   (lost-world, Tiny, CR 18). A jeweled dreaming skull, all that remains of a founder-king. Read:
   a single ornate golden-crowned skull hovering just above a low reliquary base, cracked bone
   inlaid with turquoise/gold, jaw slightly agape as if murmuring in its sleep, a faint dreaming
   glow behind the eye sockets (no eye quads — a glow plane deep in the socket, not an eye).
   Whole-object grammar, one merged frame, no anchors. Tiny disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheFirstPriestKingUndying(){
  const P = {
    bone:0x9a8f6e, boneDk:0x6d6350, boneLt:0xb3a883,
    crack:0x2c2721,
    gold:0xa9873c, goldDk:0x7a5f28, goldLt:0xcaa855,
    ture:0x2f7d72, tureDk:0x1e5148,                 // turquoise inlay
    glow:0x8fd4c8, glowDk:0x4a8a7d,                 // dreaming glow deep in sockets
    resin:0x30281f,                                  // dark socket/mouth recess
    disc:0x463c2f, discTop:0x554839,
  };

  const cy = 0.30; // skull hovers a little above the base

  /* ---------- SKULL — a stacked-ring cranium, jaw slightly agape, cracked bone plates. ---------- */
  const n = 10, ph = Math.PI/n;
  const bands = [
    {y:cy-0.075, cz:-0.01, rx:0.135, rz:0.150, hex:P.bone},   // jaw hinge line
    {y:cy-0.010, cz: 0.02, rx:0.170, rz:0.178, hex:P.boneLt}, // cheek/brow widest
    {y:cy+0.075, cz: 0.00, rx:0.150, rz:0.155, hex:P.bone},   // upper cranium
    {y:cy+0.140, cz:-0.02, rx:0.108, rz:0.112, hex:P.boneDk}, // crown of skull
  ];
  const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
  stitch(rings, b=>bands[b].hex);
  capFan(rings.at(-1), V(0, cy+0.175, -0.02), P.boneDk);

  /* jaw underside cap (rounded chin, slightly open) */
  capFan(rings[0], V(0, cy-0.135, 0.02), P.boneDk, true);

  /* cracked plate seams across the cranium — thin dark quads */
  {
    const seams = [[cy+0.02,-0.10],[cy+0.05,0.03],[cy+0.10,-0.06]];
    for(const [y,cz] of seams){
      quad(V(-0.16,y,cz-0.02), V(0.16,y,cz-0.02), V(0.13,y-0.012,cz+0.06), V(-0.13,y-0.012,cz+0.06), P.crack, 0.05);
    }
  }

  /* ---------- EYE SOCKETS — deep recesses, no eye quads; a faint dreaming glow set back inside. ---------- */
  for(const s of [-1,1]){
    const sx = s*0.075, sy = cy+0.015, sz = 0.135;
    // socket rim (dark recess ring)
    quad(V(sx-0.058,sy+0.05,sz), V(sx+0.058,sy+0.05,sz), V(sx+0.052,sy-0.055,sz+0.01), V(sx-0.052,sy-0.055,sz+0.01), P.resin, 0.04);
    // glow set back inside the socket (small plane deeper in +z, not flush — reads as glow not eye)
    quad(V(sx-0.032,sy+0.024,sz-0.028), V(sx+0.032,sy+0.024,sz-0.028), V(sx+0.028,sy-0.026,sz-0.024), V(sx-0.028,sy-0.026,sz-0.024), P.glow, 0.10);
  }
  /* nasal cavity — small dark inverted triangle-ish notch between the sockets */
  quad(V(-0.020,cy-0.010,0.155), V(0.020,cy-0.010,0.155), V(0.0,cy-0.075,0.148), V(0.0,cy-0.075,0.148), P.resin, 0.05);

  /* ---------- JAW — slightly agape, murmuring; a dark mouth gap + small tooth ridge. ---------- */
  {
    const mL = V(-0.095, cy-0.098, 0.14), mR = V(0.095, cy-0.098, 0.14);
    const mLb = V(-0.075, cy-0.145, 0.11), mRb = V(0.075, cy-0.145, 0.11);
    quad(mL, mR, mRb, mLb, P.resin, 0.05);
    for(const s of [-1,1]){
      const tx = s*0.05;
      quad(V(tx-0.012,cy-0.098,0.135), V(tx+0.012,cy-0.098,0.135), V(tx+0.009,cy-0.118,0.125), V(tx-0.009,cy-0.118,0.125), P.boneLt, 0.03);
    }
  }

  /* ---------- CROWN — gold circlet with turquoise inlays, wraps the brow band. ---------- */
  {
    const cn=10, cph=Math.PI/cn;
    const crB = ring(V(0,cy+0.100,-0.01), V(0,1,0), 0.135, 0.140, cn, cph);
    const crT = ring(V(0,cy+0.150,-0.02), V(0,1,0), 0.120, 0.124, cn, cph);
    stitch([crB,crT], ()=>P.gold);
    capFan(crT, V(0,cy+0.152,-0.02), P.goldLt);
    // turquoise cabochons set into the circlet front
    for(const dz of [0.02,-0.08]){
      quad(V(-0.03,cy+0.118,0.135+dz), V(0.03,cy+0.118,0.135+dz), V(0.024,cy+0.098,0.128+dz), V(-0.024,cy+0.098,0.128+dz), P.ture, 0.06);
    }
    // a tall gold finial spike rising from the crown crest
    const finB = V(0, cy+0.150, -0.02);
    const finT = V(0, cy+0.290, -0.03);
    tube(finB, finT, 0.026, 0.006, 6, P.gold, {capB:{hex:P.goldLt, lift:0.01}});
    // small turquoise cap at the finial tip
    quad(V(-0.012,cy+0.288,-0.035), V(0.012,cy+0.288,-0.035), V(0.009,cy+0.302,-0.028), V(-0.009,cy+0.302,-0.028), P.tureDk, 0.03);
  }

  /* ---------- RELIQUARY BASE — a low gold-banded socket the skull dreams above, sits on the disc. --- */
  {
    const rn=10, rph=Math.PI/rn;
    const b0 = ring(V(0,0.045,0), V(0,1,0), 0.170, 0.170, rn, rph);
    const b1 = ring(V(0,0.090,0), V(0,1,0), 0.145, 0.145, rn, rph);
    stitch([b0,b1], ()=>P.goldDk);
    capFan(b1, V(0,0.092,0), P.gold);
    // low socket foot ring flaring to the ground
    const f0 = ring(V(0,0.006,0), V(0,1,0), 0.205, 0.205, rn, rph);
    stitch([f0,b0], ()=>P.tureDk);
  }

  /* ---------- base disc (Tiny: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.30, 0.30, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.042,0), P.discTop);
  }
}
