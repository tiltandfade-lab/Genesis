/* dev/model-qa/creatures/prop-holo-pillar-ad.js — HOLO-PILLAR AD (CHROME set piece, Medium).
   A slim floor-to-ceiling projector column throwing a looping flat image — the read: a slim dark
   utility COLUMN (base foot to a domed projector head) with a thin flickering flat HOLOGRAM PANEL
   floating just off one face, cyan/magenta scan-banded, slightly transparent-read via alternating
   bright/dim horizontal bands (no real transparency in the quad-soup grammar — the flicker-band
   read substitutes for it), plus a small lens aperture on the column where the beam originates.
   VS-desaturated chrome body; the holo light is the sanctioned brightness exception (glow channel
   convention borrowed from prop-light.js), unlit-bright cyan/magenta so it reads as projected light
   against the gritted column. One function, one geometry frame, no anchors. Sits on base disc r=0.42.
   Imported by prop-holo-pillar-ad-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildPropHoloPillarAd(){
  /* ---------- PALETTE ---------- */
  const P = {
    col:0x54585a, colDk:0x393d3e, colLt:0x6e7274,           // utility column
    dome:0x3a3e40, domeDk:0x252829,                          // projector dome head
    lens:0x1c2830, lensRim:0x101416,                         // beam-origin lens aperture
    foot:0x3f4244, footDk:0x2a2c2d,
    rust:0x5a4a35, scuff:0x8a8f90,
    disc:0x3a3838, discTop:0x454242,
  };
  /* holo panel — bright unlit cyan/magenta scan bands (the flicker-projection tell) */
  const H = {
    cyan:0x7fe8e0, cyanDk:0x3ab0a8, mag:0xe07fd8, magDk:0xa03aa0,
    white:0xd8f4f0,
  };
  setChannels({
    [H.cyan]:"glow", [H.cyanDk]:"glow", [H.mag]:"glow", [H.magDk]:"glow", [H.white]:"glow",
  });

  const footY = 0.05;
  const colTop = 1.55;   // floor-to-ceiling-reading slim column

  /* ---------- FOOT — a small flared base the column rises from ---------- */
  {
    const f1=ring(V(0,footY,0), V(0,1,0), 0.13, 0.13, 10, 0);
    const f2=ring(V(0,footY+0.05,0), V(0,1,0), 0.085,0.085,10, 0);
    stitch([f1,f2], ()=>P.footDk);
    capFan(f2, V(0,footY+0.055,0), P.foot);
  }

  /* ---------- SLIM COLUMN — floor to ceiling-reading, tapering slightly ---------- */
  tube(V(0,footY+0.05,0), V(0,colTop,0), 0.075, 0.055, 8, P.col, {phase:Math.PI/8, capA:{hex:P.colDk}});
  // a few raised utility bands up the column
  for(const yy of [0.55, 1.00, 1.30]){
    const b1=ring(V(0,yy,0), V(0,1,0), 0.070,0.070,8,0);
    const b2=ring(V(0,yy+0.025,0), V(0,1,0), 0.070,0.070,8,0);
    stitch([b1,b2], ()=>P.colDk);
  }

  /* ---------- DOME PROJECTOR HEAD — atop the column ---------- */
  const domeY = colTop;
  {
    const bands=[
      {y:domeY,      rx:0.075, hex:P.dome},
      {y:domeY+0.05, rx:0.090, hex:P.domeDk},
      {y:domeY+0.11, rx:0.060, hex:P.dome},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx, 10, Math.PI/10));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,domeY+0.15,0), P.domeDk);
  }

  /* ---------- LENS APERTURE — where the beam originates, mid-column ---------- */
  const lensY = 0.95;
  {
    const l1=ring(V(0,lensY,0.075), V(0,0,1), 0.045,0.045,8,0);
    const l2=ring(V(0,lensY,0.09), V(0,0,1), 0.045,0.045,8,0);
    stitch([l1,l2], ()=>P.lensRim);
    capFan(l2, V(0,lensY,0.095), P.lens);
  }

  /* ---------- HOLOGRAM PANEL — a thin flat floating image plane just off the column's +z face,
     built as stacked horizontal scan-bands alternating cyan/magenta/white (the flicker-transparency
     substitute), with a thin dark "flicker gap" band breaking up the read. ---------- */
  {
    const px0=-0.34, px1=0.34;         // panel half-width
    const pz = 0.32;                    // floating distance off the column face
    const pyBot=0.55, pyTop=1.42;
    const bandN = 9;
    const bandH = (pyTop-pyBot)/bandN;
    const bandHex = [H.cyan, H.mag, H.cyanDk, H.white, H.mag, H.cyan, H.magDk, H.white, H.cyan];
    for(let i=0;i<bandN;i++){
      const y0 = pyBot + i*bandH, y1 = y0 + bandH*0.82; // small gap = flicker-scan seam
      quad(V(px0,y0,pz), V(px1,y0,pz), V(px1,y1,pz), V(px0,y1,pz), bandHex[i%bandHex.length], 0.0);
    }
    // a thin bright edge-frame outline (front-facing sliver quads) so the panel reads as a bounded plane
    quad(V(px0-0.01,pyBot,pz), V(px0,pyBot,pz), V(px0,pyTop,pz), V(px0-0.01,pyTop,pz), H.white, 0.0);
    quad(V(px1,pyBot,pz), V(px1+0.01,pyBot,pz), V(px1+0.01,pyTop,pz), V(px1,pyTop,pz), H.white, 0.0);
    // faint back-face bands (so the panel doesn't vanish from a slight angle read) — dimmer
    for(let i=0;i<bandN;i+=2){
      const y0 = pyBot + i*bandH, y1=y0+bandH*0.7;
      quad(V(px1,y1,pz-0.004), V(px0,y1,pz-0.004), V(px0,y0,pz-0.004), V(px1,y0,pz-0.004), H.cyanDk, 0.0);
    }
    // the projector beam itself: a thin faint cone-ish sliver from the lens to the panel base
    quad(V(-0.02,lensY,0.095), V(0.02,lensY,0.095), V(px1*0.5,pyBot+0.05,pz-0.02), V(px0*0.5,pyBot+0.05,pz-0.02), H.cyanDk, 0.0);
  }

  /* ---------- scuffs / oxidation on the column ---------- */
  quad(V(-0.06,0.20,0.06), V(-0.02,0.21,0.06), V(-0.025,0.40,0.045), V(-0.065,0.39,0.045), P.rust, 0.06);
  quad(V(0.02,0.60,-0.05), V(0.06,0.61,-0.05), V(0.055,0.78,-0.04), V(0.015,0.77,-0.04), P.scuff, 0.08);

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
