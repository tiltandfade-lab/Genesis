/* dev/model-qa/creatures/prop-blast-shutter-frame.js — BLAST SHUTTER FRAME (CHROME set piece, Huge).
   A retracted armored shutter recessed into a wall-mounted track — the read: a tall armored FRAME
   (two side jambs + a header lintel) bolted flush against a wall plane, with the SHUTTER PLATE
   itself retracted UP into a housing at the top (a thick slab visibly tucked into the header, its
   bottom edge just peeking below the lintel — "retracted", not absent), vertical TRACK RAILS running
   down both jambs the shutter would ride on, and a housing hint of segmented slats on the tucked
   slab's exposed edge. Scuffed heavy gunmetal, VS-desaturated (gritted-tech). One function, one
   geometry frame, no anchors. Huge size disc r=0.68. Imported by prop-blast-shutter-frame-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropBlastShutterFrame(){
  /* ---------- PALETTE ---------- */
  const P = {
    frame:0x4c5052, frameDk:0x33373a, frameLt:0x686d70,     // jamb/header armor
    track:0x2e3234, trackDk:0x1e2122,                        // recessed track rail
    shutter:0x5c6164, shutterDk:0x3d4143, shutterLt:0x767b7e,// retracted slab
    bolt:0x232526,
    rust:0x5a4a35, scuff:0x8a8f90,
    disc:0x3a3838, discTop:0x454242,
  };

  const halfW = 0.62;      // frame half-width (wide, Huge footprint)
  const jambTop = 1.95;     // tall — reads floor-to-ceiling
  const headerY0 = 1.70, headerY1 = jambTop;

  /* ---------- WALL-MOUNT BACK PLATE — a flat slab the whole assembly sits flush against ---------- */
  {
    const bz = -0.10;
    quad(V(-halfW-0.06,0,bz), V(halfW+0.06,0,bz), V(halfW+0.06,jambTop+0.10,bz), V(-halfW-0.06,jambTop+0.10,bz), P.frameDk, 0.05);
  }

  /* ---------- SIDE JAMBS — two vertical armored posts ---------- */
  for(const sx of [-1,1]){
    const x = sx*halfW;
    tube(V(x,0.02,0), V(x,jambTop,0), 0.09, 0.085, 8, P.frame, {phase:Math.PI/8, capA:{hex:P.frameDk}});
    // raised bolt-flange strip down the outer edge
    quad(V(x+sx*0.09,0.05,0.02), V(x+sx*0.12,0.05,0.02), V(x+sx*0.12,jambTop-0.05,0.02), V(x+sx*0.09,jambTop-0.05,0.02), P.frameLt, 0.05);
    // bolt heads dotting the flange
    for(let yy=0.15; yy<jambTop-0.1; yy+=0.30){
      const bc = V(x+sx*0.105, yy, 0.03);
      const b1=ring(bc, V(sx,0,0), 0.018,0.018,6,0);
      capFan(b1, V(bc.x+sx*0.01,bc.y,bc.z), P.bolt);
    }
  }

  /* ---------- HEADER LINTEL — the top beam housing the retracted shutter ---------- */
  {
    quad(V(-halfW,headerY0,-0.02), V(halfW,headerY0,-0.02), V(halfW,headerY1,-0.02), V(-halfW,headerY1,-0.02), P.frameDk, 0.04);
    quad(V(-halfW,headerY0,0.16), V(halfW,headerY0,0.16), V(halfW,headerY1,0.16), V(-halfW,headerY1,0.16), P.frame, 0.05);
    // header underside (the lip the shutter would drop from)
    quad(V(-halfW,headerY0,-0.02), V(-halfW,headerY0,0.16), V(halfW,headerY0,0.16), V(halfW,headerY0,-0.02), P.frameLt, 0.05);
  }

  /* ---------- TRACK RAILS — recessed vertical grooves down both jambs, dark ---------- */
  for(const sx of [-1,1]){
    const x = sx*halfW*0.72;
    quad(V(x-0.025,0.05,0.04), V(x+0.025,0.05,0.04), V(x+0.02,headerY0-0.02,0.04), V(x-0.02,headerY0-0.02,0.04), P.trackDk, 0.04);
    quad(V(x-0.02,0.05,0.06), V(x+0.02,0.05,0.06), V(x+0.016,headerY0-0.02,0.06), V(x-0.016,headerY0-0.02,0.06), P.track, 0.05);
  }

  /* ---------- RETRACTED SHUTTER SLAB — tucked up into the header, its bottom edge peeking below
     the lintel line so the "retracted" read is legible (not simply an empty doorway). ---------- */
  {
    const slabBotY = headerY0 - 0.14;   // peeks below the header underside
    const slabTopY = headerY1 + 0.06;   // tucked up past the visible header top (into the housing)
    const sw = halfW*0.78;
    quad(V(-sw,slabBotY,0.05), V(sw,slabBotY,0.05), V(sw,slabTopY,0.05), V(-sw,slabTopY,0.05), P.shutter, 0.05);
    quad(V(-sw,slabBotY,0.09), V(sw,slabBotY,0.09), V(sw,slabTopY,0.09), V(-sw,slabTopY,0.09), P.shutterLt, 0.05);
    // segmented slat lines on the exposed bottom edge (corrugated-shutter tell)
    for(let i=0;i<5;i++){
      const yy = slabBotY + 0.02 + i*0.045;
      if(yy > headerY0+0.05) break;
      quad(V(-sw,yy,0.098), V(sw,yy,0.098), V(sw,yy+0.014,0.098), V(-sw,yy+0.014,0.098), P.shutterDk, 0.04);
    }
    // bottom edge cap (thickness read)
    quad(V(-sw,slabBotY,0.05), V(sw,slabBotY,0.05), V(sw,slabBotY,0.09), V(-sw,slabBotY,0.09), P.shutterDk, 0.03);
  }

  /* ---------- scuffs / rust streaks on the frame ---------- */
  quad(V(-halfW-0.02,0.30,0.03), V(-halfW+0.04,0.32,0.03), V(-halfW+0.03,0.62,0.02), V(-halfW-0.03,0.60,0.02), P.rust, 0.06);
  quad(V(halfW-0.10,1.10,0.10), V(halfW-0.02,1.12,0.10), V(halfW-0.03,1.40,0.08), V(halfW-0.11,1.38,0.08), P.scuff, 0.08);

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
