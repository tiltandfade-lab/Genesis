/* dev/model-qa/creatures/prop-pillar.js — STONE VERTICALS + a fire BRAZIER. SET PIECES, not
   creatures (no eyes, no grips). Whole-object grammar: one function per prop, one geometry frame,
   no anchors. Props sit on the same base disc (r=0.42) the humanoid figures use, so they read at
   the right scale beside them (figures ~1.5u tall, ogre ~2.1u).
     buildPillar        — an intact stone column ~2.2u (stepped base, fluted-suggestion shaft, capital).
     buildPillarBroken  — the same column SNAPPED at ~40% (jagged fresh-break stump + a fallen drum).
     buildBrazier       — a short iron stand ~1.1u holding a fire bowl of layered white→red FLAME quads.
   Each builder takes an optional x-offset `ox` so the side-by-side probe can lay all three out in one
   geometry frame; default 0 = stands alone at origin (what the engine will call).
   VS-desaturated stone/wood palettes; the brazier flame is the sanctioned brightness exception
   (fire-elemental technique — jitter 0 on the bright quads, it must read as a LIGHT SOURCE at board
   distance). Imported by prop-pillar-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

/* shared stone palette (weathered grey, matches the gargoyle's living-stone family) */
const S = {
  stone:0x74716a, stoneDk:0x59564f, stoneDkr:0x413f3a, stoneLt:0x8b877d,
  chip:0xaba597,                                   // pale fresh chipped edge (weathering)
  fresh:0xb9b2a1, freshDk:0x958e7e,                // fresh-break interior (lighter than weathered skin)
  disc:0x3a352b, discTop:0x46402f,
};

/* shared base disc (r=0.42) authored at an x-offset. */
function baseDisc(ox){
  const r1=ring(V(ox,0.002,0), V(0,1,0), 0.42, 0.42, 16);
  const r2=ring(V(ox,0.055,0), V(0,1,0), 0.40, 0.40, 16);
  stitch([r1,r2], ()=>S.disc);
  capFan(r2, V(ox,0.058,0), S.discTop);
}

/* a square block (6 axis-aligned faces), lit top / shadowed right / dark back. Centered (cx,cz),
   half-extents hx,hz, from y0..y1. The workhorse for stepped bases + capitals + fallen drums. */
function block(cx, cz, hx, hz, y0, y1, hexTop, hexLt, hexDk){
  const tNW=V(cx-hx,y1,cz-hz), tNE=V(cx+hx,y1,cz-hz), tSE=V(cx+hx,y1,cz+hz), tSW=V(cx-hx,y1,cz+hz);
  const bNW=V(cx-hx,y0,cz-hz), bNE=V(cx+hx,y0,cz-hz), bSE=V(cx+hx,y0,cz+hz), bSW=V(cx-hx,y0,cz+hz);
  quad(tSW,tSE,tNE,tNW, hexTop, 0.05);   // top (lit)
  quad(tSW,tNW,bNW,bSW, hexLt,  0.05);   // left (+lit)
  quad(tNE,tSE,bSE,bNE, hexDk,  0.05);   // right (shadow)
  quad(tSE,tSW,bSW,bSE, hexLt,  0.05);   // front (+z)
  quad(tNW,tNE,bNE,bNW, hexDk,  0.05);   // back (−z)
}

/* ============================== 1. INTACT PILLAR ============================== */
export function buildPillar(ox = 0){
  /* ~2.2u. Stepped square base → tall octagonal shaft with vertical shading bands (fluting
     suggestion) → simple square capital. Ornament minimal so it reads as column / standing stone /
     obelisk all at once. */
  const baseY = 0.055;                       // top of the base disc

  /* stepped square base — two shrinking blocks */
  block(ox, 0, 0.30, 0.30, baseY,        baseY+0.13, S.stoneLt, S.stone,   S.stoneDk);
  block(ox, 0, 0.24, 0.24, baseY+0.13,   baseY+0.24, S.stoneLt, S.stone,   S.stoneDk);

  /* SHAFT — a tall octagon lofted from the base top to just under the capital. Alternating band
     hexes per vertical face-column give the fluted-suggestion vertical shading (no real flutes —
     just light/dark reads that suggest them at board distance). */
  {
    const n=8, shaftBot=baseY+0.24, shaftTop=1.92;
    const bands=[
      {y:shaftBot,        r:0.185},
      {y:shaftBot+0.45,   r:0.178},
      {y:shaftBot+0.90,   r:0.172},
      {y:shaftTop,        r:0.165},   // very slight entasis taper
    ];
    const rings=bands.map(b=>ring(V(ox,b.y,0), V(0,1,0), b.r, b.r, n, Math.PI/n));
    /* per vertical column i pick a shade so adjacent faces alternate lit/mid/shadow = fluting read.
       4-step ladder widens the light→dark spread so the vertical bands read at board distance. */
    const flute=[S.stoneLt, S.stone, S.stoneDk, S.stoneDkr, S.stoneDk, S.stone, S.stoneLt, S.stone];
    const colFor=(i)=> flute[i%flute.length];
    for(let b=0;b<rings.length-1;b++)
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], colFor(i), 0.04); }
  }

  /* CAPITAL — a slightly flared block band + a flat square top slab (minimal ornament) */
  block(ox, 0, 0.215, 0.215, 1.92, 2.02, S.stoneLt, S.stone,   S.stoneDk);   // echinus band
  block(ox, 0, 0.255, 0.255, 2.02, 2.14, S.stoneLt, S.stoneLt, S.stoneDk);   // abacus top slab (lit)

  /* a couple of chipped weathering facets high on the shaft + a corner off the capital */
  quad(V(ox-0.16,1.35,0.16), V(ox-0.06,1.35,0.185), V(ox-0.10,1.20,0.17), V(ox-0.10,1.20,0.17), S.chip, 0.03);
  quad(V(ox+0.255,2.14,0.20), V(ox+0.255,2.02,0.255), V(ox+0.18,2.14,0.255), V(ox+0.18,2.14,0.255), S.chip, 0.03);

  baseDisc(ox);
}

/* ============================== 2. BROKEN PILLAR ============================== */
export function buildPillarBroken(ox = 0){
  /* the same column SNAPPED at ~40% height. A stepped base + shaft stump ending in a jagged
     fresh-break crown, plus the fallen upper section lying as a broken drum on the disc beside it. */
  const baseY = 0.055;
  const snapY = 0.98;                          // the stump breaks here (~40% of the 2.2u original)

  /* same stepped base */
  block(ox, 0, 0.30, 0.30, baseY,        baseY+0.13, S.stoneLt, S.stone, S.stoneDk);
  block(ox, 0, 0.24, 0.24, baseY+0.13,   baseY+0.24, S.stoneLt, S.stone, S.stoneDk);

  /* STUMP SHAFT — octagon from base-top to the ragged snap line. Top ring is jaggedized (each vert
     jittered up/down) so the break reads as broken, not sawn. */
  const n=8, shaftBot=baseY+0.24;
  const botR=ring(V(ox,shaftBot,0), V(0,1,0), 0.185, 0.185, n, Math.PI/n);
  const midR=ring(V(ox,(shaftBot+snapY)/2,0), V(0,1,0), 0.180, 0.180, n, Math.PI/n);
  const topR=ring(V(ox,snapY,0), V(0,1,0), 0.176, 0.176, n, Math.PI/n);
  const jag=[0.10,-0.06,0.13,-0.04,0.08,-0.09,0.11,-0.05];   // per-vert break heights
  topR.forEach((p,i)=>{ p.y += jag[i]; });
  const colFor=(i)=>{ const m=i%3; return m===0? S.stoneLt : (m===1? S.stone : S.stoneDk); };
  for(const [ra,rb] of [[botR,midR],[midR,topR]])
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(ra[i], ra[i2], rb[i2], rb[i], colFor(i), 0.04); }
  /* JAGGED FRESH-BREAK FACE — pale fresh-break interior fanned from a low center up to the ragged
     rim verts (each triangle a bright fresh-stone facet; jitter carries the roughness). */
  {
    const center=V(ox, snapY-0.05, 0);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(topR[i], topR[i2], center, center, (i&1)? S.fresh : S.freshDk, 0.06); }
  }

  /* FALLEN UPPER SECTION — a fat broken drum lying on its side on the disc, clearly IN FRONT of the
     stump (a chunk of column knocked off). A stout horizontal cylinder (axis along +x, its own
     radius sets the resting height so it sits ON the disc), weathered flat cap on the outward end,
     jagged fresh-break face on the inner (toward-stump) end. Fatter + longer than the shaft so it
     unmistakably reads as a broken column section, not a kerb. */
  {
    const dr = 0.185;                         // drum radius — matches the shaft, and sets rest height
    const dz = 0.34;                          // sits forward (+z) of the stump
    const restY = 0.055 + dr;                 // disc top + radius = drum centerline (lies ON the disc)
    const a=V(ox-0.40, restY, dz), b=V(ox+0.14, restY, dz);   // longer barrel
    const m=8;
    const axis=new THREE.Vector3().subVectors(b,a).normalize();
    const ra=ring(a, axis, dr, dr, m, 0);
    const rb=ring(b, axis, dr, dr, m, 0);
    for(let i=0;i<m;i++){ const i2=(i+1)%m;
      const shade=(i%3===0)? S.stoneLt : (i%3===1? S.stone : S.stoneDk);
      quad(ra[i], ra[i2], rb[i2], rb[i], shade, 0.04); }
    // outward (−x) end: weathered flat cap (a couple recessed rings suggest a column drum end)
    capFan(ra, V(a.x-0.02, a.y, a.z), S.stoneDk, true);
    // inner (+x) end facing the stump: JAGGED FRESH-BREAK face (pale), matching the stump crown
    {
      const jr=ring(b, axis, dr, dr, m, 0);
      const jag2=[0.06,-0.05,0.07,-0.04,0.06,-0.05,0.05,-0.04];
      jr.forEach((p,i)=>{ p.x += jag2[i]; });
      const c=V(b.x+0.05, b.y, b.z);
      for(let i=0;i<m;i++){ const i2=(i+1)%m;
        quad(jr[i2], jr[i], c, c, (i&1)? S.fresh : S.freshDk, 0.06); }
    }
    // a chipped pale facet on the top of the drum flank
    quad(V(ox-0.20,restY+dr-0.02,dz+0.04), V(ox-0.06,restY+dr-0.01,dz+0.02),
         V(ox-0.13,restY+dr-0.12,dz+0.07), V(ox-0.13,restY+dr-0.12,dz+0.07), S.chip, 0.03);
  }

  baseDisc(ox);
}

/* ============================== 3. BRAZIER ============================== */
export function buildBrazier(ox = 0){
  /* ~1.1u. Dark-iron tripod stand holding a wide fire BOWL topped with layered FLAME quads
     (white-hot core → orange → deep red edges). It must read as a LIGHT SOURCE at board distance:
     bright fire is the whole point, jitter 0 on the bright quads (fire-elemental technique). */
  const M = { iron:0x35322e, ironLt:0x4a463f, ironDk:0x24221f, bowl:0x3d3934, bowlDk:0x2a2723 };
  const F = { white:0xfff4d8, whiteHot:0xffffff, yellow:0xffdd55, orange:0xf2892c, orangeDk:0xd9631a, red:0xb8331a, redDk:0x8a2412, glow:0x6e3a1e };

  const rimY = 0.68;                            // the bowl rim height

  /* TRIPOD LEGS — three slim iron struts splaying from a low hub up to the bowl underside */
  {
    const hub=V(ox, 0.10, 0);
    for(let k=0;k<3;k++){
      const t=k/3*Math.PI*2 + Math.PI/6;
      const foot=V(ox+Math.cos(t)*0.24, 0.055, Math.sin(t)*0.24);
      const top =V(ox+Math.cos(t)*0.11, 0.52, Math.sin(t)*0.11);
      tube(foot, top, 0.028, 0.022, 5, M.iron, {capA:{hex:M.ironDk}});
      // a small foot pad
      tube(foot, V(foot.x, 0.055, foot.z), 0.045, 0.045, 5, M.ironDk);
    }
    // a binding ring where the legs meet under the bowl
    const b1=ring(V(ox,0.44,0), V(0,1,0), 0.13, 0.13, 8, 0);
    const b2=ring(V(ox,0.50,0), V(0,1,0), 0.13, 0.13, 8, 0);
    stitch([b1,b2], ()=>M.ironLt);
    hub.y;   // (hub kept for readability)
  }

  /* FIRE BOWL — a wide shallow iron bowl (flared truncated cone), dark outside, dark rim */
  {
    const n=10;
    const bot=ring(V(ox,0.50,0), V(0,1,0), 0.14, 0.14, n, Math.PI/n);
    const mid=ring(V(ox,0.60,0), V(0,1,0), 0.28, 0.28, n, Math.PI/n);
    const rim=ring(V(ox,rimY,0), V(0,1,0), 0.34, 0.34, n, Math.PI/n);
    stitch([bot,mid], ()=>M.bowlDk);
    stitch([mid,rim], ()=>M.bowl);
    // inner rim lip (a thin ring turned down inside) reading darker
    const inner=ring(V(ox,rimY-0.03,0), V(0,1,0), 0.30, 0.30, n, Math.PI/n);
    stitch([rim,inner], ()=>M.ironDk);
    capFan(bot, V(ox,0.49,0), M.bowlDk, true);
    // a warm glow ring on the inner bowl floor (fire spilling light onto the iron)
    const g1=ring(V(ox,rimY-0.05,0), V(0,1,0), 0.26, 0.26, 10, 0);
    const g2=ring(V(ox,rimY-0.06,0), V(0,1,0), 0.12, 0.12, 10, 0);
    stitch([g1,g2], ()=>F.glow);
  }

  /* FLAME — layered rising quads out of the bowl. A broad outer red/orange body, an inner yellow
     tongue, and a white-hot core, each a fan of upward-tapering triangles. Jitter 0 = clean bright. */
  {
    const cx=ox, cz=0, base=rimY-0.02;
    // one flame layer = a ring of upward triangles from a base ring to a shared top apex
    const layer=(r, topY, hexLo, hexHi, m, spin)=>{
      const brim=ring(V(cx,base,cz), V(0,1,0), r, r, m, spin);
      const apex=V(cx, topY, cz);
      // give each tongue its own peak height (flicker) + slight inward lean
      for(let i=0;i<m;i++){ const i2=(i+1)%m;
        const peak=V((brim[i].x+brim[i2].x)/2*0.35 + cx*0.65,
                     topY - (i%2)*0.10,
                     (brim[i].z+brim[i2].z)/2*0.35);
        quad(brim[i], brim[i2], peak, peak, (i%2)? hexHi : hexLo, 0.0); }
      return brim;
    };
    layer(0.30, 1.02, F.redDk,  F.red,    9, 0.0);       // outer red tongues (tallest spread)
    layer(0.235,1.06, F.red,    F.orange, 8, 0.4);       // orange body
    layer(0.165,1.10, F.orange, F.yellow, 7, 0.8);       // yellow inner
    layer(0.095,1.14, F.yellow, F.white,  6, 1.2);       // white heart
    // a bright white-hot core teardrop dead center
    quad(V(cx-0.05, base+0.02, cz+0.02), V(cx+0.05, base+0.02, cz+0.02),
         V(cx+0.02, base+0.42, cz), V(cx-0.02, base+0.42, cz), F.whiteHot, 0.0);
    quad(V(cx-0.03, base+0.30, cz+0.01), V(cx+0.03, base+0.30, cz+0.01),
         V(cx, base+0.60, cz), V(cx, base+0.60, cz), F.white, 0.0);
  }

  baseDisc(ox);
}

/* ============================== 4. FORGE HEARTH ============================== */
export function buildForgeHearth(ox = 0){
  /* ~1×1 cell (1.25u), squat brick/stone hearth block ~1.1u tall.
     Feature checklist (what the ~450-tri budget buys):
       - squat brick hearth block (stepped courses, warm-mortar seam shading)
       - a glowing mouth cut into the front face: pale-hot core (0x9a-0xb0 white-orange) ringed by
         ember-orange/red — the HIGH-VALUE zone, front-and-center under the 3/4 camera
       - a stubby chimney stub rising off the back-left corner, soot-streaked up its face
       - an anvil nub (small iron block + horn stub) sitting beside the hearth mouth, a glowing
         billet resting on its face (the use-tell payoff — mid-forging)
       - a coal/ash pile spilling out the mouth lip onto the hearth apron (use-tell: recent work)
     Use sentence: the smith just pulled a hot billet from the hearth and set it on the anvil —
     the fire is still roaring in the mouth, ash and coal spilled at the lip, soot climbing the
     chimney stub. Reads squat/blocky at a squint (brick block + chimney stub silhouette), the
     glowing mouth is the loud signature feature that survives 1/3-res + dark void. */
  const H = {
    brick:0x6b5a4a, brickLt:0x81705d, brickDk:0x4e4137, mortar:0x3c332b,
    soot:0x2b2622, sootLt:0x3f3833,
    iron:0x2e2b28, ironLt:0x433f39,
    coal:0x2a2420, coalLt:0x4a3f36, ember:0xb8471f,
  };
  const E = { hot:0xffb37a, hotPale:0xffe0b8, orange:0xe2621f, orangeDk:0xa8380f, red:0x7a2510 };

  const baseY = 0.055;

  /* HEARTH BLOCK — squat stepped brick mass, ~0.62u wide, 0.5u deep, up to ~0.62u tall */
  block(ox-0.02, -0.02, 0.31, 0.25, baseY,       baseY+0.10, H.brickLt, H.brick,  H.brickDk);  // course 1 (apron)
  block(ox-0.02, -0.02, 0.27, 0.22, baseY+0.10,  baseY+0.55, H.brickLt, H.brick,  H.brickDk);  // main body
  block(ox-0.02, -0.02, 0.29, 0.24, baseY+0.55,  baseY+0.63, H.brickDk, H.brickDk,H.mortar);   // cap course (shadowed lintel band)

  /* mortar seam lines (thin dark bands at the course breaks — cheap horizontal reads) */
  quad(V(ox-0.29,baseY+0.10,0.02), V(ox+0.25,baseY+0.10,0.02), V(ox+0.25,baseY+0.115,0.02), V(ox-0.29,baseY+0.115,0.02), H.mortar, 0.03);

  /* HEARTH MOUTH — carved across the block's near +x/+z corner (NOT the flat +z face) so the glow
     faces dead-on into the sheet's 3/4 camera (yaw45°/elev35° sits exactly on this diagonal — see
     mountSheet's cam(45,35,...) in probe-lib.js). Gate fix 2026-07-10: the previous +z-face version
     was ALSO wound backward — its quads used the mirror of block()'s verified +z-normal vertex
     order, so it silently back-face-culled from every outside angle (invisible from any camera, not
     just this one). Rebuilt here with a hand-verified outward normal (cross(tangent,up)=+normal)
     AND moved onto the corner so it reads square-on instead of glancing. */
  {
    const mcx=ox+0.25, mcz=0.20;                 // the main body's +x/+z outer corner (exact edge)
    const nx=0.7071, nz=0.7071;                  // outward diagonal normal (+x/+z bisector)
    const tx=0.7071, tz=-0.7071;                 // tangent across the corner (⟂ to the normal)
    const my0=baseY+0.14, my1=baseY+0.42;
    const P = (u,d,y)=> V(mcx + tx*u + nx*d, y, mcz + tz*u + nz*d);   // u=across, d=proud-of-corner
    // BL,BR,TR,TL order — verified: cross(tangent,up) = +normal, so this winding faces outward.
    const mouthQuad = (hw, ylo, yhi, d, hex, jit) =>
      quad(P(-hw,d,ylo), P(hw,d,ylo), P(hw,d,yhi), P(-hw,d,yhi), hex, jit);
    mouthQuad(0.155, my0,       my1,       0.00, H.mortar,   0.02);   // dark recessed jamb (reads as a hole)
    mouthQuad(0.12,  my0+0.02,  my1-0.02,  0.01, E.orangeDk, 0.02);   // ember-orange ring just inside
    mouthQuad(0.09,  my0+0.045, my1-0.045, 0.02, E.orange,   0.0);
    mouthQuad(0.05,  my0+0.06,  my1-0.08,  0.03, E.hotPale,  0.0);    // PALE-HOT CORE — the high-value zone
    mouthQuad(0.025, my0+0.09,  my1-0.10,  0.04, E.hot,      0.0);
    // warm rim on the mouth's TOP LIP — a bright strip riding just above the arch so the "lit
    // forge" reads even at an angle oblique enough to foreshorten the mouth opening itself.
    mouthQuad(0.17,  my1,       my1+0.025, 0.045, E.hot,     0.03);
    // GLOW SPILL — pale-hot floor patch in front of the mouth (top-facing quads on the ground),
    // so the "lit forge" reads from a value cue alone even if the mouth's own faces are shadowed.
    {
      const gx=mcx+nx*0.14, gz=mcz+nz*0.14, gy=baseY+0.105;
      const F = (uu,vv)=> V(gx+tx*uu+nx*vv, gy, gz+tz*uu+nz*vv);
      quad(F(-0.12,0.08), F(0.12,0.08), F(0.12,-0.07), F(-0.12,-0.07), E.hotPale, 0.04);
      quad(F(-0.06,0.05), F(0.06,0.05), F(0.06,-0.05), F(-0.06,-0.05), E.hot,     0.03);
    }
  }

  /* CHIMNEY STUB — a stubby square flue rising off the back-left corner, soot-streaked */
  {
    const cx=ox-0.20, cz=-0.16;
    block(cx, cz, 0.09, 0.09, baseY+0.63, baseY+1.05, H.brick, H.brickDk, H.mortar);
    // flue mouth cap (dark)
    block(cx, cz, 0.075, 0.075, baseY+1.05, baseY+1.10, H.sootLt, H.soot, H.soot);
    // soot streak down the front (+z) face of the stub onto the body — one clear dark band
    quad(V(cx-0.05,baseY+1.02,cz+0.09), V(cx+0.05,baseY+1.02,cz+0.09), V(cx+0.04,baseY+0.63,cz+0.11), V(cx-0.04,baseY+0.63,cz+0.11), H.soot, 0.05);
    quad(V(cx-0.03,baseY+0.65,cz+0.115), V(cx+0.03,baseY+0.65,cz+0.115), V(cx+0.025,baseY+0.20,cz+0.14), V(cx-0.025,baseY+0.20,cz+0.14), H.sootLt, 0.05);
  }

  /* ANVIL NUB — small iron block + horn stub beside the hearth mouth (+x side), with a glowing
     billet laid across its face — the use-tell payoff. */
  {
    const ax=ox+0.235, az=0.10;
    block(ax, az, 0.075, 0.11, baseY, baseY+0.16, H.ironLt, H.iron, H.iron);            // waist/base
    block(ax, az, 0.095, 0.14, baseY+0.16, baseY+0.20, H.ironLt, H.ironLt, H.iron);      // face (lit top-plate)
    // horn stub tapering off the back (−z) end
    tube(V(ax, baseY+0.185, az-0.14), V(ax, baseY+0.17, az-0.24), 0.045, 0.015, 5, H.iron, {capA:{hex:H.ironLt}});
    // glowing billet resting on the face, running toward the hearth mouth
    quad(V(ax-0.10,baseY+0.205,az-0.02), V(ax-0.10,baseY+0.205,az+0.10), V(ax-0.16,baseY+0.225,az+0.10), V(ax-0.16,baseY+0.225,az-0.02), E.hot, 0.0);
    quad(V(ax-0.13,baseY+0.215,az+0.02), V(ax-0.13,baseY+0.215,az+0.06), V(ax-0.155,baseY+0.225,az+0.06), V(ax-0.155,baseY+0.225,az+0.02), E.hotPale, 0.0);
  }

  /* ASH/COAL PILE spilling from the mouth lip onto the apron — cheap low tris, reads as use-tell */
  {
    const px=ox-0.03, pz=0.28, py=baseY+0.105;
    quad(V(px-0.10,py,pz-0.02), V(px+0.09,py,pz-0.02), V(px+0.05,py+0.035,pz+0.05), V(px-0.06,py+0.035,pz+0.05), H.coal, 0.06);
    quad(V(px-0.04,py+0.03,pz+0.01), V(px+0.03,py+0.03,pz+0.01), V(px+0.01,py+0.05,pz+0.035), V(px-0.02,py+0.05,pz+0.035), H.coalLt, 0.06);
    // one bright ember catching in the pile
    quad(V(px-0.01,py+0.033,pz+0.015), V(px+0.015,py+0.033,pz+0.015), V(px+0.005,py+0.045,pz+0.03), V(px+0.005,py+0.045,pz+0.03), H.ember, 0.0);
  }

  baseDisc(ox);
}
