/* dev/model-qa/creatures/prop-light.js — LIGHTING PROPS (torch sconce / candelabra / lantern post).
   SET PIECES, not creatures (no eyes, no grips). Whole-object grammar: one function per prop, one
   geometry frame, no anchors. Props sit on the same base disc (r=0.42) the humanoid figures use.

   ENGINE NOTE: these are the visual anchors for the rolled per-room light profiles
   (theaterRollLightProfile / LIGHT_PROFILES in the engine). At P1' wiring, the scene's point lights
   should SOURCE at these props — the torch = a bright warm point at its flame head, the candelabra =
   three smaller warm points, the lantern = a dimmer, warmer caged point. The flame geometry here is
   the emissive-looking placeholder; the actual illumination is the engine light co-located with it.

     buildTorch       — a standing iron sconce ~1.3u: slim dark post, ring bracket, wrapped torch head
                        with a layered 3-4 quad FLAME (fire-elemental glow technique).
     buildCandelabra  — a three-arm standing candelabra ~1.4u: center post splitting to three curved
                        arms, each with a pale candle + small flame tuft.
     buildLanternPost — a hooked post ~1.6u with a hanging CAGED LANTERN: a dark frame box with warm
                        glowing panel quads inside (glow is INSIDE the cage — dimmer + warmer).

   Each builder takes an optional x-offset `ox` so the side-by-side probe lays all three in one frame;
   default 0 = stands alone at origin (what the engine calls). VS-desaturated iron/wood; flame is the
   sanctioned brightness exception (jitter 0 on bright quads). Imported by prop-light-probe.html.

   CAPTURE-GATE FOLLOW-UP (2026-07-04, Adam: "the torch fire itself [must be] bright and looks like
   light/fire") — every flame/glow hex below is registered via setChannels() as the "glow" material
   channel (docs/P1-WIRING.md §2.2), which theater-boot.js's wholeObjectMaterialsFor now renders as an
   UNLIT MeshBasicMaterial slot (full brightness regardless of scene lighting) instead of the old lit
   Lambert bucket — the actual fix for "flame renders dark." The FLAME_HEXES map + setChannels() call at
   the top of each builder is the tagging half of that fix; this file's other half is the brightened
   palette itself (bright yellow-white core, orange skirt) below. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

/* shared iron / disc palette */
const M = {
  iron:0x34312d, ironLt:0x49453e, ironDk:0x232120,
  wood:0x4a3a28, woodDk:0x342719,                         // torch handle wrap
  wax:0xd9cdae, waxDk:0xb2a688,                            // pale candle
  brass:0x8a6f3a, brassLt:0xb08d46,
  disc:0x33302a, discTop:0x3e3a31,
};
/* shared flame palette (the brightness exception) — CAPTURE-GATE FOLLOW-UP: brightened one clear step
   further (bright yellow-white core, orange skirt) now that "glow" renders unlit, so the baked vertex
   colors ARE the final on-screen brightness with no lit-Lambert falloff dimming them. redDk/red pull
   toward the ORANGE side (less muddy brown) since an unlit dark-red tri would otherwise read as a flat
   dark patch rather than a fire's outer skirt. */
const F = {
  white:0xfff8e6, whiteHot:0xffffff, yellow:0xffe873, orange:0xff9a35, orangeDk:0xf2720f,
  red:0xe0501f, redDk:0xb03a12, glow:0x6e3a1e,
  lantern:0xffc266, lanternDk:0xd98f3a,                    // warmer, dimmer caged glow — bumped alongside the flame palette
};
/* every flame/glow hex above, tagged "glow" for the material-channel classifier (probe-lib's
   setChannels/quad contract — quad() records this per-tri by exact hex match). Called once at the top
   of each builder (setChannels is cleared by resetGeom() before each build, so it can't live at
   module scope). */
const FLAME_HEXES = {
  [F.white]: "glow", [F.whiteHot]: "glow", [F.yellow]: "glow", [F.orange]: "glow", [F.orangeDk]: "glow",
  [F.red]: "glow", [F.redDk]: "glow", [F.glow]: "glow",
  [F.lantern]: "glow", [F.lanternDk]: "glow",
};

function baseDisc(ox){
  const r1=ring(V(ox,0.002,0), V(0,1,0), 0.42, 0.42, 16);
  const r2=ring(V(ox,0.055,0), V(0,1,0), 0.40, 0.40, 16);
  stitch([r1,r2], ()=>M.disc);
  capFan(r2, V(ox,0.058,0), M.discTop);
}

/* a small upward flame tuft: a fan of 3-4 tapering triangles, white core → orange → red. cx,cz,base
   = where it sits; `sc` scales the whole tuft. Jitter 0 (bright). Shared by torch + candelabra. */
function flameTuft(cx, cz, base, sc){
  const m=5;
  const brim=ring(V(cx,base,cz), V(0,1,0), 0.055*sc, 0.055*sc, m, 0);
  const layer=(r, topY, hexLo, hexHi, spin)=>{
    const bl=ring(V(cx,base,cz), V(0,1,0), r, r, m, spin);
    for(let i=0;i<m;i++){ const i2=(i+1)%m;
      const peak=V(cx + (bl[i].x+bl[i2].x-2*cx)/2*0.3, topY - (i%2)*0.05*sc, cz + (bl[i].z+bl[i2].z-2*cz)/2*0.3);
      quad(bl[i], bl[i2], peak, peak, (i%2)? hexHi : hexLo, 0.0); }
  };
  layer(0.058*sc, base+0.20*sc, F.redDk, F.orange, 0.0);   // outer
  layer(0.036*sc, base+0.24*sc, F.orange, F.yellow, 0.5);  // inner
  // white-hot core teardrop
  quad(V(cx-0.018*sc, base+0.02*sc, cz), V(cx+0.018*sc, base+0.02*sc, cz),
       V(cx, base+0.26*sc, cz), V(cx, base+0.26*sc, cz), F.whiteHot, 0.0);
}

/* ============================== 1. TORCH SCONCE ============================== */
export function buildTorch(ox = 0){
  /* ~1.3u. A slim dark iron post rising from a small footed base, a ring bracket near the top, and a
     wrapped torch head sitting in the ring, crowned by a layered flame. */
  setChannels(FLAME_HEXES); // resetGeom() clears the channel map before every build — re-register per-call
  const footY=0.055;

  // footed base — a small flared iron foot on the disc
  {
    const b1=ring(V(ox,footY,0), V(0,1,0), 0.14, 0.14, 8, 0);
    const b2=ring(V(ox,footY+0.06,0), V(0,1,0), 0.09, 0.09, 8, 0);
    stitch([b1,b2], ()=>M.ironDk);
    capFan(b2, V(ox,footY+0.065,0), M.iron);
  }
  // slim post
  tube(V(ox,footY+0.06,0), V(ox,1.02,0), 0.038, 0.032, 6, M.iron, {capA:{hex:M.ironDk}});

  // ring bracket near the top — a small torus-ish ring around the post (two stacked rings tilted out)
  {
    const ry=0.96;
    const rr1=ring(V(ox,ry,0.02), V(0,1,0), 0.075, 0.070, 8, 0);
    const rr2=ring(V(ox,ry+0.05,0.03), V(0,1,0), 0.085, 0.078, 8, 0);
    stitch([rr1,rr2], ()=>M.ironLt);
  }

  // wrapped torch head — a short handle wrap sitting up out of the bracket, dark wood-wrapped
  const headBase=V(ox, 1.00, 0.03), headTop=V(ox, 1.14, 0.05);
  tube(headBase, headTop, 0.048, 0.052, 8, M.wood, {capA:{hex:M.woodDk}});
  // a couple of wrap-band rings (lit) around the head
  for(const yy of [1.04, 1.10]){
    const w1=ring(V(ox,yy,0.035+(yy-1.0)*0.14), V(0,1,0), 0.054, 0.056, 8, 0);
    const w2=ring(V(ox,yy+0.012,0.035+(yy-1.0)*0.14), V(0,1,0), 0.054, 0.056, 8, 0);
    stitch([w1,w2], ()=>M.brass);
  }
  // the pitch-soaked burning top (dark) then the flame
  capFan(ring(headTop, V(0,1,0), 0.052, 0.052, 8, 0), V(headTop.x, headTop.y+0.02, headTop.z), M.ironDk);

  // FLAME — layered, riding out of the torch head. Bigger + brighter than a candle tuft.
  {
    const cx=ox, cz=0.05, base=1.14;
    const m=7;
    const layer=(r, topY, hexLo, hexHi, spin)=>{
      const bl=ring(V(cx,base,cz), V(0,1,0), r, r, m, spin);
      for(let i=0;i<m;i++){ const i2=(i+1)%m;
        const peak=V(cx + (bl[i].x+bl[i2].x-2*cx)/2*0.3, topY-(i%2)*0.07, cz + (bl[i].z+bl[i2].z-2*cz)/2*0.3);
        quad(bl[i], bl[i2], peak, peak, (i%2)? hexHi : hexLo, 0.0); }
    };
    layer(0.115, base+0.34, F.redDk,  F.red,    0.0);   // outer red spread
    layer(0.085, base+0.40, F.red,    F.orange, 0.4);   // orange
    layer(0.055, base+0.46, F.orange, F.yellow, 0.8);   // yellow
    // white-hot core
    quad(V(cx-0.03,base+0.02,cz+0.01), V(cx+0.03,base+0.02,cz+0.01),
         V(cx, base+0.52, cz), V(cx, base+0.52, cz), F.whiteHot, 0.0);
    quad(V(cx-0.02,base+0.22,cz), V(cx+0.02,base+0.22,cz),
         V(cx, base+0.40, cz), V(cx, base+0.40, cz), F.white, 0.0);
  }

  baseDisc(ox);
}

/* ============================== 2. CANDELABRA ============================== */
export function buildCandelabra(ox = 0){
  /* ~1.4u. A center iron post on a small base, splitting near the top into three curved arms that
     sweep up + out, each holding a pale candle with a small flame tuft. */
  setChannels(FLAME_HEXES); // resetGeom() clears the channel map before every build — re-register per-call
  const footY=0.055;

  // base foot
  {
    const b1=ring(V(ox,footY,0), V(0,1,0), 0.15, 0.15, 8, 0);
    const b2=ring(V(ox,footY+0.07,0), V(0,1,0), 0.075, 0.075, 8, 0);
    stitch([b1,b2], ()=>M.ironDk);
    capFan(b2, V(ox,footY+0.075,0), M.iron);
    // a decorative knop bulge on the shaft
    const k1=ring(V(ox,0.42,0), V(0,1,0), 0.048, 0.048, 8, 0);
    const k2=ring(V(ox,0.50,0), V(0,1,0), 0.070, 0.070, 8, 0);
    const k3=ring(V(ox,0.58,0), V(0,1,0), 0.048, 0.048, 8, 0);
    stitch([k1,k2], ()=>M.ironLt); stitch([k2,k3], ()=>M.ironLt);
  }
  // center post
  const splitY=0.92;
  tube(V(ox,footY+0.07,0), V(ox,splitY,0), 0.040, 0.034, 6, M.iron, {capA:{hex:M.ironDk}});

  // the CENTER candle (rises straight from the split) + two OUTER arms curving out
  const candle=(cx, cy, cz)=>{
    // pale candle stub
    tube(V(cx,cy,cz), V(cx,cy+0.13,cz), 0.030, 0.028, 6, M.wax, {capA:{hex:M.waxDk}});
    // tiny dark wick + the flame tuft
    flameTuft(cx, cz, cy+0.13, 0.85);
  };

  // center candle
  candle(ox, splitY, 0);

  // three... actually two side arms + the center = 3 lights. Two curved arms sweeping out (±x) and a
  // touch forward, each ending in a cup + candle.
  for(const s of [-1, 1]){
    const a0=V(ox, splitY-0.04, 0);
    const a1=V(ox + s*0.14, splitY+0.02, 0.02);
    const a2=V(ox + s*0.26, splitY+0.14, 0.04);   // arm rises as it goes out (a curve)
    tube(a0, a1, 0.030, 0.026, 5, M.ironLt);
    tube(a1, a2, 0.026, 0.022, 5, M.iron);
    // a small cup at the arm end
    const cup1=ring(a2, V(0,1,0), 0.040, 0.040, 6, 0);
    const cup2=ring(V(a2.x,a2.y+0.03,a2.z), V(0,1,0), 0.048, 0.048, 6, 0);
    stitch([cup1,cup2], ()=>M.brass);
    candle(a2.x, a2.y+0.03, a2.z);
  }

  baseDisc(ox);
}

/* ============================== 3. LANTERN POST ============================== */
export function buildLanternPost(ox = 0){
  /* ~1.6u. A tall iron post with a hooked top from which a CAGED LANTERN hangs: a dark frame box
     with warm glowing panels inside the cage (the glow is INSIDE — dimmer + warmer than the torch). */
  setChannels(FLAME_HEXES); // resetGeom() clears the channel map before every build — re-register per-call
  const footY=0.055;

  // base foot
  {
    const b1=ring(V(ox,footY,0), V(0,1,0), 0.15, 0.15, 8, 0);
    const b2=ring(V(ox,footY+0.06,0), V(0,1,0), 0.085, 0.085, 8, 0);
    stitch([b1,b2], ()=>M.ironDk);
    capFan(b2, V(ox,footY+0.065,0), M.iron);
  }
  // tall post
  const postTop=1.44;
  tube(V(ox,footY+0.06,0), V(ox,postTop,0), 0.040, 0.034, 6, M.iron, {capA:{hex:M.ironDk}});

  // HOOK — an arm curving out + over from the post top, from which the lantern hangs (over +z front)
  const h0=V(ox, postTop, 0);
  const h1=V(ox+0.02, postTop+0.10, 0.14);
  const h2=V(ox, postTop+0.06, 0.28);          // curls back down + forward = the hook eye
  tube(h0, h1, 0.032, 0.028, 5, M.iron);
  tube(h1, h2, 0.028, 0.022, 5, M.ironLt, {capB:{hex:M.ironDk}});
  // short hang link from the hook down to the lantern top
  const lanTopY=1.24, lanCz=0.28;              // lantern hangs below the hook, forward of the post
  tube(V(ox,postTop+0.04,lanCz), V(ox,lanTopY+0.10,lanCz), 0.014, 0.014, 5, M.ironDk);

  // CAGED LANTERN — a small box frame. Build the WARM GLOWING inner core first (a small bright box),
  // then the dark cage frame struts around it so the glow reads as trapped light behind bars.
  {
    const cx=ox, cz=lanCz, cy=lanTopY-0.06;    // lantern body center
    const hx=0.075, hy=0.095, hz=0.075;        // half-extents of the glowing core
    // inner glowing panels — 4 side faces, warm. Front + sides read as lit glass; back darker.
    // Jitter 0 so the warm glow reads clean (a caged light, dimmer + warmer than the torch flame).
    const gc=(sx,sy,sz)=>V(cx+sx*hx, cy+sy*hy, cz+sz*hz);
    quad(gc(-1,-1,1), gc(1,-1,1), gc(1,1,1), gc(-1,1,1), F.lantern, 0.0);      // front (+z, brightest)
    quad(gc(1,-1,-1), gc(-1,-1,-1), gc(-1,1,-1), gc(1,1,-1), F.lanternDk, 0.0);// back
    quad(gc(-1,-1,-1), gc(-1,-1,1), gc(-1,1,1), gc(-1,1,-1), F.lantern, 0.0);  // left (lit glass)
    quad(gc(1,-1,1), gc(1,-1,-1), gc(1,1,-1), gc(1,1,1), F.lanternDk, 0.0);    // right (shadowed)
    // a hotter candle-flame core proud of the front glass so the light reads through the bars
    quad(V(cx-0.028,cy-0.055,cz+hz+0.010), V(cx+0.028,cy-0.055,cz+hz+0.010),
         V(cx+0.020,cy+0.055,cz+hz+0.010), V(cx-0.020,cy+0.055,cz+hz+0.010), F.white, 0.0);
    quad(V(cx-0.016,cy-0.02,cz+hz+0.014), V(cx+0.016,cy-0.02,cz+hz+0.014),
         V(cx, cy+0.085, cz+hz+0.010), V(cx, cy+0.085, cz+hz+0.010), F.whiteHot, 0.0);  // little flame tip

    // DARK CAGE FRAME — a box roof + floor + 4 vertical corner struts, dark iron, proud of the glow.
    const fx=hx+0.014, fz=hz+0.014, roofY=cy+hy+0.02, floorY=cy-hy-0.02;
    // roof (a little peaked cap) + floor plates
    const roofRing=[V(cx-fx,roofY,cz-fz), V(cx+fx,roofY,cz-fz), V(cx+fx,roofY,cz+fz), V(cx-fx,roofY,cz+fz)];
    quad(roofRing[3],roofRing[2],roofRing[1],roofRing[0], M.ironDk, 0.03);
    capFan(roofRing, V(cx,roofY+0.06,cz), M.iron);          // little peaked roof
    quad(V(cx-fx,floorY,cz-fz), V(cx+fx,floorY,cz-fz), V(cx+fx,floorY,cz+fz), V(cx-fx,floorY,cz+fz), M.ironDk, 0.03);
    // 4 corner struts (thin dark tubes) — these are the bars the glow reads through
    for(const sx of [-1,1]) for(const sz of [-1,1])
      tube(V(cx+sx*fx, floorY, cz+sz*fz), V(cx+sx*fx, roofY, cz+sz*fz), 0.012, 0.012, 4, M.iron);
    // a couple of thin front cross-bars, held PROUD of the lit glass so they read as dark bars
    // silhouetted against the glow (the cage grille), not as occluding slabs.
    for(const yy of [cy-0.035, cy+0.045])
      tube(V(cx-fx,yy,cz+fz+0.012), V(cx+fx,yy,cz+fz+0.012), 0.007, 0.007, 4, M.ironDk);
    // one vertical mullion down the front too
    tube(V(cx,floorY+0.02,cz+fz+0.012), V(cx,roofY-0.02,cz+fz+0.012), 0.007, 0.007, 4, M.ironDk);
    // a top ring to hang from
    const hr=ring(V(cx,roofY+0.06,cz), V(0,1,0), 0.022, 0.022, 6, 0);
    capFan(hr, V(cx,roofY+0.09,cz), M.ironLt);
  }

  baseDisc(ox);
}
