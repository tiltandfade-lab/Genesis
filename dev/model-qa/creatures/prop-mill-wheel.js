/* dev/model-qa/creatures/prop-mill-wheel.js — the MILL WHEEL: a vertical paddle-wheel on a
   stone housing (whole-object prop). Not a creature — no disc-figure, no eyes, no grip. One
   function, one geometry frame, no anchors.
   SILHOUETTE FIX (2026-07-10, PLACE-PARTS-WAVE B4 re-cut): the wheel's circular face now lies
   in the X-Y PLANE with its rotation AXIS ALONG Z, offset to the +x side of a shrunk stone
   mount — so from the PS1 contact sheet's 3/4-high camera (looking out of the +x/+z quadrant)
   the ring reads face-on as a full circle instead of edge-on as a sliver. The old build had the
   wheel's plane in Y-Z (axis along X), parallel to the housing's own dominant flank faces —
   both edge-on to that camera. Never re-orient the wheel back onto the X-axis without
   re-checking the real contact sheet.
   FEATURE CHECKLIST (what the tri budget buys):
     - a squat, SHRUNK STONE MOUNT (de-emphasized — the wheel is the signature, this is just its
       plinth) with a pale coping band on top, bracket-armed out to the wheel's hub
     - an IRON AXLE running through the hub along Z, poking past both rim hoops, capped both ends
     - a HUB + two THIN RIM HOOPS (the wheel's side plates, normal along Z) with 4 front spokes
     - TEN PADDLES ringing a complete rim circle around a visible hub (spokes >=0.04u), each
       >=0.07u thick, colored in three bands around the circumference: PALE weathered wood at the
       top (the high-value zone, hex 0x9a+), a mid stained band at the sides, and WET-DARK tones
       on the lowest paddles
     - a flat DARK WATER PLANE at the wheel's lower quarter, with a stain streak climbing the
       stone mount — the use-tell
   USE SENTENCE: the wheel is caught mid-turn, its lowest paddles dripping and dark from the
   millrace it's just churned through, the upper paddles still pale and dry.
   VS-desaturated timber+stone palette (neutral Frontier/Gloom register): a few close stone
   greys, a few close weathered-wood tans, one wet-dark accent, one iron accent.
   Scale reference: figures ~1.5u tall; wheel diameter ~1.7u (R=0.85), footprint well under the
   2x2 five-ft-cell (~2.5u) cap. Imported by the theater prop registry as prop:mill-wheel. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropMillWheel(){
  /* ---------- PALETTE (VS desaturated timber + stone) ---------- */
  const P = {
    wallLt:0x7a766c, wall:0x615d54, wallDk:0x423f38,      // stone housing wall
    copeLt:0x8f8a7c, cope:0x726d60,                        // coping band on wall top
    iron:0x3c3a38, ironDk:0x232220, ironLt:0x57534c,       // axle + hub metal
    padPaleLt:0xb8a980, padPale:0x9a8c68, padPaleDk:0x6d6248,   // dry upper paddles (pale = HIGH VALUE, 0x9a+)
    padStainLt:0x796b52, padStain:0x5f543e, padStainDk:0x453c2c, // side transitional band
    padWetLt:0x453c30, padWet:0x342c22, padWetDk:0x241e18,       // lowest, wet-dark paddles
    rimWood:0x564a36, rimWoodDk:0x3a3122,                   // rim hoops + spokes
    water:0x1c2226, waterHi:0x2b3a3d,                       // millrace surface
    stainWet:0x33291d,                                      // waterline stain streak on wall
  };

  /* ---------- shared axis-aligned box helper (altar convention: 3-tone, closed, no caps) ---------- */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05);
    quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05);
    quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);
    quad(Cc,G,H,D, top, 0.05);
  }

  /* ---------- wheel geometry constants ---------- */
  const GROUND = 0.055;
  const R = 0.85;                              // wheel core radius (rim), diameter ~1.7u
  const PAD_OVER = 0.25;                       // paddle overhang past the rim (matches PADR1 below)
  const WHEEL_CY = 0.055 + PAD_OVER + R;        // axle height — keeps the lowest paddle tip at ground clearance
  const WHEEL_BOTTOM_Y = WHEEL_CY - R;          // wheel core (rim) bottom, above the paddle-dip trough
  const WATER_Y = WHEEL_BOTTOM_Y + 0.5*R;       // waterline sits at the wheel's lower quarter
  const VH = 0.28;                             // half-width along the axle — now Z (depth), not X
  const CX = -0.10;                            // hub center X — the wheel sits to the +x side of the mount

  /* a paddle-frame box: u = radial (r0..r1), v = axle-width/depth (-VH..VH, along Z), w =
     tangential thickness. theta measured so 0deg = top of wheel, sweeping through +X/-Y/-X/+Y —
     the ring now spins in the X-Y PLANE (axis along Z) so it reads face-on from the +x/+z 3/4
     camera, instead of the old Y-Z plane (axis along X) which sat edge-on to it. */
  function paddleBox(theta, r0, r1, w0, w1, top, mid, dk){
    const ct=Math.cos(theta), st=Math.sin(theta);
    function Pt(u,v,w){ return V(CX + u*st + w*ct, WHEEL_CY + u*ct - w*st, v); }
    const A=Pt(r0,-VH,w0), B=Pt(r1,-VH,w0), Cc=Pt(r1,VH,w0), D=Pt(r0,VH,w0);
    const E=Pt(r0,-VH,w1), F=Pt(r1,-VH,w1), G=Pt(r1,VH,w1), H=Pt(r0,VH,w1);
    quad(H,G,F,E, top, 0.05);
    quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05);
    quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);
    quad(Cc,G,H,D, top, 0.05);
  }

  /* ===== 1) STONE MOUNT — shrunk plinth the axle brackets off of, with a pale coping. The
     wheel is the signature here, not the stone — kept low and narrow relative to the ring. ===== */
  box(-1.35,-0.95, GROUND,1.05, -0.35,0.35, P.wallLt, P.wall, P.wallDk);
  box(-1.37,-0.93, 1.05,1.16, -0.38,0.38, P.copeLt, P.cope, P.wallDk);
  // a waterline stain streak climbing the mount from the millrace (use-tell continuity)
  {
    const y0=GROUND, y1=WATER_Y+0.22;
    quad(V(-0.93,y0,-0.30), V(-0.93,y0,0.30), V(-0.93,y1,0.30), V(-0.93,y1,-0.30), P.stainWet, 0.05);
  }

  /* ===== 2) BRACKET + AXLE — a stub arm off the mount into the hub, then the iron axle runs
     through the hub along Z, poking past both rim hoops, capped at both free ends. ===== */
  tube(V(-0.95,WHEEL_CY,0), V(CX,WHEEL_CY,0), 0.065,0.065, 8, P.iron);
  tube(V(CX,WHEEL_CY,-VH-0.06), V(CX,WHEEL_CY,VH+0.06), 0.065,0.065, 8, P.iron, {capA:{hex:P.ironLt}, capB:{hex:P.ironLt}});

  /* ===== 3) HUB — short iron drum spanning the axle width, spokes fan from it. ===== */
  tube(V(CX,WHEEL_CY,-VH), V(CX,WHEEL_CY,VH), 0.15,0.15, 8, P.iron, {capA:{hex:P.ironDk}, capB:{hex:P.ironDk}});

  /* ===== 4) RIM HOOPS — two thin wooden bands (the wheel's side plates), normal along Z, at
     each axle end — a complete visible ring circle. ===== */
  for(const z of [-VH, VH]){
    const rOut = ring(V(CX,WHEEL_CY,z-0.025), V(0,0,1), R, R, 16, Math.PI/16);
    const rIn  = ring(V(CX,WHEEL_CY,z+0.025), V(0,0,1), R, R, 16, Math.PI/16);
    stitch([rOut, rIn], ()=>P.rimWood);
  }

  /* ===== 5) SPOKES — 4 front spokes (visible face, near +z toward the camera) hub-to-rim,
     each a full-width tube (>=0.04u law). ===== */
  for(let i=0;i<4;i++){
    const a = i*(Math.PI/2) + Math.PI/4;
    const sz = VH-0.02;
    const pIn  = V(CX + 0.15*Math.cos(a), WHEEL_CY + 0.15*Math.sin(a), sz);
    const pOut = V(CX + R*Math.cos(a),    WHEEL_CY + R*Math.sin(a),    sz);
    tube(pIn, pOut, 0.04,0.04, 4, P.rimWoodDk);
  }

  /* ===== 6) PADDLES — 10 around a complete rim circle, banded pale (top) / stained (sides) /
     wet (bottom). ===== */
  const PADR0 = R-0.05, PADR1 = R+0.25, WT = 0.035;   // thickness half 0.035 -> 0.07u full (>=0.05u law)
  const BANDS = [
    {deg:0,   set:[P.padPaleLt, P.padPale, P.padPaleDk]},
    {deg:36,  set:[P.padPaleLt, P.padPale, P.padPaleDk]},
    {deg:72,  set:[P.padStainLt, P.padStain, P.padStainDk]},
    {deg:108, set:[P.padWetLt, P.padWet, P.padWetDk]},
    {deg:144, set:[P.padWetLt, P.padWet, P.padWetDk]},
    {deg:180, set:[P.padWetLt, P.padWet, P.padWetDk]},
    {deg:216, set:[P.padWetLt, P.padWet, P.padWetDk]},
    {deg:252, set:[P.padStainLt, P.padStain, P.padStainDk]},
    {deg:288, set:[P.padPaleLt, P.padPale, P.padPaleDk]},
    {deg:324, set:[P.padPaleLt, P.padPale, P.padPaleDk]},
  ];
  for(const b of BANDS){
    const th = b.deg * Math.PI/180;
    paddleBox(th, PADR0, PADR1, -WT, WT, b.set[0], b.set[1], b.set[2]);
  }

  /* ===== 7) MILLRACE WATER — flat dark plane at the wheel's lower-quarter waterline, with a
     paler ripple accent where the paddle churns through. ===== */
  {
    const y = WATER_Y - 0.01;
    quad(V(CX-1.15,y,-0.55), V(CX+1.15,y,-0.55), V(CX+1.15,y,0.55), V(CX-1.15,y,0.55), P.water, 0.04);
    quad(V(CX-0.30,y+0.004,0.05), V(CX+0.30,y+0.004,0.10), V(CX+0.25,y+0.004,0.42), V(CX-0.35,y+0.004,0.37), P.waterHi, 0.06);
  }
}
