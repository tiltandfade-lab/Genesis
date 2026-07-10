/* dev/model-qa/creatures/prop-standpipe.js — the STANDPIPE: a squat riveted-steel water tower
   (whole-object prop, Gloom register — "mundane-wrong Americana"). Not a creature — no disc-
   figure, no eyes, no grip. One function, one geometry frame, no anchors. Anchors a NAMED place
   ("The standpipe"), not ambient dressing.
   Feature checklist (what the tri budget buys), bottom→top:
     - 4 STUB LEGS w/ an X-BRACE ring — squat splayed steel legs holding the tank up
     - a LADDER up one leg + partway up the tank face — a use-tell (someone climbs this)
     - the TANK BARREL — a fat riveted-steel cylinder, banded with RIVET-LINE seams
     - a SERVICE DOOR set into the tank, low, PAINTED SHUT — a paint-drip seam sealing the jamb
       is the wrong-tell (a door that doesn't open)
     - a pale MINERAL-STAIN streak running down one face from a seam — the value-read feature
     - a shallow CONE ROOF cap closing the top
   Use sentence: the standpipe sits mid-service — rust weeping from its rivets, its door
   permanently sealed with a slapped-on coat of paint, exactly as it's always been.
   Scale: figures ~1.5u tall, waist ≈0.5u, one 5-ft cell ≈1.25u. Footprint 2×2 cells (~2.5u
   square plan); total height ~2.4u. VS-desaturated steel palette (close greys/browns + one pale
   mineral-stain accent + one dull paint accent). Imported by the orchestrator's prop registry
   under prop:standpipe. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropStandpipe(){
  /* ---------- PALETTE (VS desaturated riveted steel) ---------- */
  const P = {
    // tank barrel — lit faces RAISED into pale weathered-steel range (law 3 fix: the tank was
    // reading as one dim grey mass under the PS1 grade; steelLt/steelTop now carry the
    // high-value read on the mid-bulge + top panels, well clear of the shadow tones below).
    steel:0x5b5850, steelLt:0x928d7a, steelTop:0x847f6e, steelDk:0x403d37, steelDkr:0x2c2a26,
    leg:0x4a463f, legDk:0x322f2b,                                            // legs / bracing
    rivet:0x9a9484,                                                          // brightened rivet dots — reads as a dotted seam, not invisible on the dark bands
    rust:0x5a3a26, rustDk:0x3d271a,                                          // rust weep near rivets
    stain:0xb0a890, stainDk:0x9a9482,                                        // MINERAL-STAIN streak — pushed genuinely pale (near 0xb0a890), the signature high-value read
    door:0x445c3c, doorDk:0x2f3f28,                                          // the sealed door — distinct dull institutional GREEN (the wrong-tell hue), no longer steel-toned
    paint:0x6b5230, paintDk:0x4a3720,                                        // paint-drip seam (dull ochre-brown, contrasts against the green door)
    roof:0x53504a, roofDk:0x38362f,                                          // cone roof
    ladder:0x726e63,                                                        // ladder rails/rungs
    disc:0x322f2a, discTop:0x3e3b34,
  };

  const CX = 0, CZ = 0;             // plan center
  const LEG_R = 0.85;                // leg splay radius (fits inside a 2x2 = ~2.5u plan)
  const LEG_TOP_R = 0.62;            // legs pull in slightly toward the tank underside
  const GROUND = 0.055;
  const LEG_TOP_Y = 1.05;            // tank underside height
  const TANK_H = 0.95;
  const TANK_TOP_Y = LEG_TOP_Y + TANK_H;
  const TANK_R = 0.72;

  /* ===== 1) FOUR STUB LEGS — squat splayed steel posts from the ground up to the tank
     underside, angled slightly inward. ===== */
  const legAngles = [45, 135, 225, 315].map(d => d*Math.PI/180);
  const legTopPts = [];
  for(const a of legAngles){
    const bx = CX + Math.cos(a)*LEG_R, bz = CZ + Math.sin(a)*LEG_R;
    const tx = CX + Math.cos(a)*LEG_TOP_R, tz = CZ + Math.sin(a)*LEG_TOP_R;
    tube(V(bx,GROUND,bz), V(tx,LEG_TOP_Y,tz), 0.075, 0.06, 6, P.leg, {capA:{hex:P.legDk}});
    legTopPts.push(V(tx,LEG_TOP_Y,tz));
  }
  /* X-brace ring — cross braces between adjacent legs at mid-height (silhouette + read as
     "engineered structure", not four bare sticks). */
  const braceY = GROUND + (LEG_TOP_Y-GROUND)*0.45;
  for(let i=0;i<4;i++){
    const a0=legAngles[i], a1=legAngles[(i+1)%4];
    const r0 = LEG_R + (LEG_TOP_R-LEG_R)*0.45;
    const p0 = V(CX+Math.cos(a0)*r0, braceY, CZ+Math.sin(a0)*r0);
    const p1 = V(CX+Math.cos(a1)*r0, braceY, CZ+Math.sin(a1)*r0);
    tube(p0, p1, 0.035, 0.035, 5, P.legDk);
  }

  /* ===== 2) TANK BARREL — a fat riveted cylinder, banded top/mid/bottom with rivet-line seams.
     Slightly bulged mid-band (the coopered-tank read). ===== */
  const bands = [
    {y:LEG_TOP_Y,             rx:TANK_R*0.94, hex:P.steelDk},
    {y:LEG_TOP_Y+TANK_H*0.18, rx:TANK_R,      hex:P.steel},
    {y:LEG_TOP_Y+TANK_H*0.50, rx:TANK_R*1.03, hex:P.steelLt},   // mid bulge, lit
    {y:LEG_TOP_Y+TANK_H*0.82, rx:TANK_R,      hex:P.steel},
    {y:TANK_TOP_Y,            rx:TANK_R*0.92, hex:P.steelTop},   // top band, also lit — pale, was buried at steelDk
  ];
  stack(bands, 12, {});

  /* rivet-line seams — small pale dot-quads ringing the barrel at each band seam (3 seams x 8
     rivets = countable detail that reads at 1/3-res as a texture line, not clutter). */
  {
    const seamYs = [LEG_TOP_Y+TANK_H*0.18, LEG_TOP_Y+TANK_H*0.50, LEG_TOP_Y+TANK_H*0.82];
    for(const sy of seamYs){
      const rr = ring(V(CX,sy,CZ), V(0,1,0), TANK_R*1.005, TANK_R*1.005, 16, Math.PI/16);
      for(let i=0;i<16;i+=2){
        const p = rr[i];
        const nx = (p.x-CX)/TANK_R, nz = (p.z-CZ)/TANK_R;   // outward normal (approx)
        const s = 0.028;
        quad(V(p.x-nz*s, p.y+s, p.z+nx*s), V(p.x+nz*s, p.y+s, p.z-nx*s),
             V(p.x+nz*s, p.y-s, p.z-nx*s), V(p.x-nz*s, p.y-s, p.z+nx*s), P.rivet, 0.05);
      }
    }
    // a couple of rust-weep drips just under the mid seam (age tell, small — reads warm on cool steel)
    const wy = LEG_TOP_Y+TANK_H*0.50;
    quad(V(CX+TANK_R*0.55,wy,CZ+0.62), V(CX+TANK_R*0.62,wy,CZ+0.55),
         V(CX+TANK_R*0.58,wy-0.18,CZ+0.52), V(CX+TANK_R*0.51,wy-0.18,CZ+0.58), P.rust, 0.05);
    quad(V(CX+TANK_R*0.57,wy-0.06,CZ+0.58), V(CX+TANK_R*0.60,wy-0.06,CZ+0.55),
         V(CX+TANK_R*0.58,wy-0.14,CZ+0.53), V(CX+TANK_R*0.55,wy-0.14,CZ+0.56), P.rustDk, 0.04);
  }

  /* ===== 3) SERVICE DOOR — set low into the tank face (+z), rectangular, PAINTED SHUT: the
     jamb carries a slapped ochre paint-drip seam sealing every edge — the wrong-tell. Door clear
     height nods to the 1.7-1.9u figure convention but scaled down to fit a ~1.9u-tall tank face:
     built ~0.55u tall (a service hatch, not a walk-through door on this small a vessel). ===== */
  {
    const dz = TANK_R*0.995;
    const dy0 = LEG_TOP_Y + TANK_H*0.12, dy1 = dy0 + 0.55;
    const dx0 = -0.19, dx1 = 0.19;
    // recessed door panel (slightly darker, set back a hair to read as a hatch, not a decal)
    quad(V(dx0,dy1,dz), V(dx1,dy1,dz), V(dx1,dy0,dz), V(dx0,dy0,dz), P.door, 0.05);
    // two flat door battens (vertical planks read)
    quad(V(dx0+0.03,dy1-0.03,dz+0.004), V(dx0+0.10,dy1-0.03,dz+0.004), V(dx0+0.10,dy0+0.03,dz+0.004), V(dx0+0.03,dy0+0.03,dz+0.004), P.doorDk, 0.04);
    quad(V(dx1-0.10,dy1-0.03,dz+0.004), V(dx1-0.03,dy1-0.03,dz+0.004), V(dx1-0.03,dy0+0.03,dz+0.004), V(dx1-0.10,dy0+0.03,dz+0.004), P.doorDk, 0.04);
    // PAINT-DRIP SEAM — a slapped ochre-brown bead running all the way around the jamb, with
    // three drips sagging down the face below the seam (the tell: paint has run and dried,
    // gluing the door into its frame — it does not open).
    const seamY = dy1 + 0.015;
    quad(V(dx0-0.03,seamY,dz+0.006), V(dx1+0.03,seamY,dz+0.006), V(dx1+0.03,seamY-0.045,dz+0.006), V(dx0-0.03,seamY-0.045,dz+0.006), P.paint, 0.05);
    quad(V(dx0-0.03,dy0+0.045,dz+0.006), V(dx1+0.03,dy0+0.045,dz+0.006), V(dx1+0.03,dy0,dz+0.006), V(dx0-0.03,dy0,dz+0.006), P.paint, 0.05);
    quad(V(dx0-0.045,dy1,dz+0.006), V(dx0,dy1,dz+0.006), V(dx0,dy0,dz+0.006), V(dx0-0.045,dy0,dz+0.006), P.paint, 0.05);
    quad(V(dx1,dy1,dz+0.006), V(dx1+0.045,dy1,dz+0.006), V(dx1+0.045,dy0,dz+0.006), V(dx1,dy0,dz+0.006), P.paint, 0.05);
    // three paint drips hanging off the top seam
    for(const dxOff of [-0.10, 0.01, 0.13]){
      quad(V(dx0+0.13+dxOff,seamY-0.04,dz+0.007), V(dx0+0.18+dxOff,seamY-0.04,dz+0.007),
           V(dx0+0.165+dxOff,seamY-0.15,dz+0.007), V(dx0+0.145+dxOff,seamY-0.15,dz+0.007), P.paintDk, 0.04);
    }
  }

  /* ===== 4) MINERAL-STAIN STREAK — a pale weathering run down one face (-x facing away from the
     door), from the top seam down past the bottom band. This is the VALUE-READ feature: a bright
     pale streak against the mid-value steel, wide enough (>0.04u) to survive 1/3-res. ===== */
  {
    const sx = CX - TANK_R*0.98;
    quad(V(sx,TANK_TOP_Y-0.05,CZ+0.14), V(sx,TANK_TOP_Y-0.05,CZ-0.06),
         V(sx,LEG_TOP_Y+0.10,CZ-0.10), V(sx,LEG_TOP_Y+0.10,CZ+0.10), P.stain, 0.06);
    quad(V(sx,TANK_TOP_Y-0.10,CZ+0.05), V(sx,TANK_TOP_Y-0.10,CZ-0.02),
         V(sx,LEG_TOP_Y+0.30,CZ-0.04), V(sx,LEG_TOP_Y+0.30,CZ+0.04), P.stainDk, 0.05);
  }

  /* ===== 5) LADDER — a use-tell: two rails climbing one leg from the ground, then continuing
     up the tank face to a small landing at the roof line. Rungs at even spacing (≥0.04u thick,
     readable at 1/3-res). ===== */
  {
    const la = legAngles[0];
    const railInset = 0.10;
    const bx = CX + Math.cos(la)*(LEG_R-railInset), bz = CZ + Math.sin(la)*(LEG_R-railInset);
    const tx = CX + Math.cos(la)*(TANK_R*0.75), tz = CZ + Math.sin(la)*(TANK_R*0.75);
    const wallOff = 0.06;   // rail offset either side of the climb line, tangential
    const nx = -Math.sin(la), nz = Math.cos(la);
    const railTop = TANK_TOP_Y - 0.10;
    for(const side of [-1,1]){
      const rb = V(bx+nx*wallOff*side, GROUND, bz+nz*wallOff*side);
      const rt = V(tx+nx*wallOff*side, railTop, tz+nz*wallOff*side);
      tube(rb, rt, 0.028, 0.024, 5, P.ladder);
    }
    // rungs — evenly spaced steps between the two rails, straight tubes
    const N_RUNGS = 9;
    for(let i=1;i<N_RUNGS;i++){
      const t = i/N_RUNGS;
      const cx_ = bx + (tx-bx)*t, cz_ = bz + (tz-bz)*t, cy_ = GROUND + (railTop-GROUND)*t;
      const a0 = V(cx_+nx*wallOff, cy_, cz_+nz*wallOff);
      const a1 = V(cx_-nx*wallOff, cy_, cz_-nz*wallOff);
      tube(a0, a1, 0.022, 0.022, 4, P.ladder);
    }
  }

  /* ===== 6) CONE ROOF — a shallow cap closing the tank top (band ring -> apex). ===== */
  {
    const rTop = ring(V(CX,TANK_TOP_Y,CZ), V(0,1,0), TANK_R*0.92, TANK_R*0.92, 12, Math.PI/12);
    capFan(rTop, V(CX,TANK_TOP_Y+0.30,CZ), P.roof);
    // a low collar band under the cone base (roof overhang read)
    const rCollar = ring(V(CX,TANK_TOP_Y+0.02,CZ), V(0,1,0), TANK_R*0.98, TANK_R*0.98, 12, Math.PI/12);
    stitch([rTop, rCollar], ()=>P.roofDk);
  }

  /* base disc — shared style, sized to the 2x2 footprint (r ≈ 1.1 fits inside a 2.5u plan). */
  {
    const r1 = ring(V(CX,0.002,CZ), V(0,1,0), 1.10, 1.10, 16);
    const r2 = ring(V(CX,GROUND,CZ), V(0,1,0), 1.05, 1.05, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(CX,GROUND+0.003,CZ), P.discTop);
  }
}
