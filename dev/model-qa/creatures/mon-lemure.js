/* dev/model-qa/creatures/mon-lemure.js — the LEMURE (bespoke MELTING BLOB, lesser devil, Wave 4).
   Bestiary lemure: a wretched, mindless lesser devil — a slumped mound of pale, half-formed flesh
   with a sagging face pressed into the front and stubby vestigial arms. The read: low, sagging,
   pathetic — a melted candle of a body, not a proud monster. NO eye quads (dark socket recesses
   only, house ruling). Whole-object grammar: one function, one geometry frame, no anchors. Medium
   size (small/wretched, held low): base disc r=0.42. */
import { V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildLemure(){
  /* ---------- PALETTE (VS desaturated; pallid pink-grey, dirty & mottled, never candy) --------- */
  const P = {
    flesh:0x8c7a72, fleshDk:0x6b5c56, fleshLt:0xa08d84,     // pallid pink-grey mound
    mottleA:0x776760, mottleB:0x93807a,                      // sagging mottle patches
    sag:0x5e5049,                                            // deep sagging folds/creases
    socket:0x241d1a,                                         // dark eye socket recesses
    mouth:0x2c211d, mouthDk:0x1a1310,
    claw:0x4a3f39,                                            // stubby half-formed arm/hand tips
    disc:0x453b35, discTop:0x54473f,
  };

  /* ---------- LANDMARKS — a low slumped mound centered near the disc, rising gently in +y. ------ */
  const baseY = 0.03;             // sits low, melted onto the ground
  const S = {
    rear:   V(0, baseY+0.02, -0.20),
    mid:    V(0, baseY+0.05,  0.00),
    fore:   V(0, baseY+0.04,  0.14),
    faceZ:  0.26,                 // sagging face pressed into the front
  };

  /* ---------- BODY — a melted, slumped mound loft (low bands, wider at base, sagging at the top). */
  {
    const n = 10, ph = Math.PI/n;
    const bands = [
      {y:0.010, cz:-0.10, rx:0.360, rz:0.330, hex:P.fleshDk},   // base of the mound (wide, slumped)
      {y:0.130, cz:-0.06, rx:0.340, rz:0.310, hex:P.flesh},
      {y:0.250, cz:-0.02, rx:0.300, rz:0.275, hex:P.mottleA},
      {y:0.350, cz: 0.02, rx:0.235, rz:0.225, hex:P.flesh},
      {y:0.420, cz: 0.04, rx:0.150, rz:0.150, hex:P.mottleB},   // sagging shoulder/top hump
      {y:0.460, cz: 0.05, rx:0.078, rz:0.080, hex:P.fleshLt},   // rounded slumped crown
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0, 0.006, -0.10), P.fleshDk, true);   // flat-ish underside seal
    capFan(rings.at(-1), V(0, 0.480, 0.055), P.fleshLt);     // soft rounded top

    /* SAGGING FOLDS — a few drooping crease quads down the flanks, the "melting candle" read. */
    const folds = [
      [ 0.24, 0.34, -0.02,  0.06, 0.10, -0.03],
      [-0.26, 0.36, -0.01, -0.07, 0.12, -0.02],
      [ 0.16, 0.20,  0.20,  0.03, 0.05,  0.24],
    ];
    for(const [x0,y0,z0,x1,y1,z1] of folds){
      quad(V(x0-0.03,y0,z0), V(x0+0.03,y0,z0), V(x1+0.02,y1,z1), V(x1-0.02,y1,z1), P.sag, 0.06);
    }
  }

  /* ---------- FACE — a sad sagging face pressed into the front of the mound. No eye quads: two
     dark socket recesses only (carved-in dark quads, not painted "eyes"), a downturned sagging
     mouth-crease, and drooping cheek-jowls. ---------- */
  {
    const fy = 0.235;                        // face height, low-mid on the mound
    const fz = S.faceZ;
    /* brow/cheek pressed-in pad (slightly darker, sunken into the mound face) */
    quad(V(-0.150, fy+0.075, fz-0.03), V(0.150, fy+0.075, fz-0.03),
         V(0.135, fy-0.120, fz+0.02), V(-0.135, fy-0.120, fz+0.02), P.mottleA, 0.05);

    /* dark socket recesses — small inset dark quads, deep-set, NOT eyes-as-shapes, just recess */
    for(const s of [-1,1]){
      const cx = s*0.065;
      quad(V(cx-0.028, fy+0.028, fz-0.015), V(cx+0.028, fy+0.028, fz-0.015),
           V(cx+0.022, fy-0.020, fz+0.010), V(cx-0.022, fy-0.020, fz+0.010), P.socket, 0.0);
    }

    /* drooping jowls — sagging cheek flesh hanging past the jaw line, the pathetic melt read */
    for(const s of [-1,1]){
      const jx = s*0.115;
      quad(V(jx-0.05, fy-0.03, fz-0.01), V(jx+0.05, fy-0.03, fz-0.01),
           V(jx+0.04, fy-0.135, fz+0.03), V(jx-0.04, fy-0.135, fz+0.03), P.fleshDk, 0.06);
    }

    /* sagging downturned mouth — a dark creased line, corners drooping down */
    quad(V(-0.085, fy-0.105, fz+0.03), V(0.085, fy-0.105, fz+0.03),
         V(0.055, fy-0.145, fz+0.05), V(-0.055, fy-0.145, fz+0.05), P.mouth, 0.03);
    quad(V(-0.055, fy-0.140, fz+0.045), V(0.055, fy-0.140, fz+0.045),
         V(0.030, fy-0.170, fz+0.05), V(-0.030, fy-0.170, fz+0.05), P.mouthDk, 0.04);
  }

  /* ---------- STUBBY HALF-FORMED ARMS — short vestigial nubs, barely arms, pressed at the sides. */
  {
    const armStub=(x, y, z, tipX, tipY, tipZ)=>{
      const shoulder = V(x, y, z);
      const tip = V(tipX, tipY, tipZ);
      tube(shoulder, tip, 0.075, 0.052, 6, P.flesh, {capB:{hex:P.fleshDk, lift:0.01}});
      // a couple of stubby half-formed digit nubs at the tip (no real hand, just lumps)
      for(const dx of [-0.02, 0.02]){
        const nb = V(tip.x+dx, tip.y-0.01, tip.z+0.01);
        const nt = V(tip.x+dx*1.6, tip.y-0.04, tip.z+0.05);
        tube(nb, nt, 0.020, 0.010, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    armStub(-0.235, 0.235, 0.02, -0.320, 0.170, 0.16);
    armStub( 0.235, 0.235, 0.02,  0.320, 0.170, 0.16);
  }

  /* ---------- base disc (r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
