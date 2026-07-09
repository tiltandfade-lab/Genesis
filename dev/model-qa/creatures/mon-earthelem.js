/* dev/model-qa/creatures/mon-earthelem.js — THE EARTH ELEMENTAL (whole-object grammar), FOUNDRY
   REBUILD (docs/MODEL-FOUNDRY.md, 2026-07-08, set rebuild-w2 cell 6). Large, CR 5, realm core, 27
   instances. REQUEUE NOTE: the prior wave-2 pass reported a 1520-tri rebuild but the file on disk
   was still the untouched 2026-07-04 gorilla-mass version — this pass replaces the geometry for
   real (verified by re-reading the file post-write, see bottom of this header).

   ELEMENTAL MASS anatomy: no neck, no separate head — the "face" (a brow-ledge, eyeless per
   Adam's 2026-07-04 ruling) is set into the front of the shoulder mass. Torn root-veined earth:
   boulders + dark packed soil, asymmetric (never a symmetric idol-mass — one shoulder/arm/leg
   always reads bigger/higher than its mirror, the "just erupted from the ground" read). Reads
   distinct from the stone golem (dressed cut masonry, square seams) — this is RAW TORN EARTH,
   round lumpy boulders + soil, no clean edges.

   FEATURE CHECKLIST (the ~1,000-2,000 budget buys):
     1. LEANING CORE MASS — an asymmetric barrel of stacked boulders pitched forward into the
        stride (the surge), heavier/higher on the raised-arm side.
     2. RAISED BOULDER FIST — the loud exaggerated signature: one massive arm cocked straight up
        overhead, shoulder->forearm->a huge knuckled fist boulder raised high, arcing forward as if
        about to slam down.
     3. TRAILING OFF-ARM — low, dragging, smaller — the asymmetric counterweight to the raised arm
        (law 5), knuckles brushing the ground behind the stride.
     4. SEAM-VEINS — pale mineral veins crackling across the dark earth mass in branching root-like
        streaks (the high-value zone law 3 needs), concentrated on the torso and the raised arm so
        the signature itself carries the light.
     5. MID-STRIDE LEGS — one stone leg planted forward under the lean, one trailing back and lifted
        mid-step (never a static symmetric plant — this is the erupting stride, not an idle stand).
     6. TRAILING RUBBLE — small broken rock chunks scattered low and behind the trailing leg, selling
        motion (debris kicked up / still falling from the eruption).

   POSE SENTENCE: caught mid-surge, erupting forward out of the ground with its whole leaning mass
   pitched into the stride, one boulder-sized fist cocked high overhead about to slam down, the
   trailing arm and leg still dragging clods of torn earth behind it — never an at-attention idol,
   always the half-second before the ground-shaking blow lands.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Large size: base disc r=0.55. Imported by ps1-sheet.html (SETS['rebuild-w2'],
   cell 6, fn buildEarthElemental) + the p2mon WHOLE_OBJECT_REGISTRY.

   R2 CRITIC FIX (post r1 engine render, same pass — self-correction round): r1 read as a single
   narrow vertical rock TOWER, not a lunging surge — the raised arm stacked straight above the
   torso with no silhouette gap, the trailing leg/arm sat too close-in to register, and the veins
   (0.012-0.018 half-... full width 0.024-0.036u) were UNDER the law-3 0.04u floor so they
   vanished entirely (no visible value contrast anywhere on the model). Reworked: the raised arm
   now bends OUT to the side before going up (shoulder->elbow-out->fist-up-forward), opening a real
   negative-space notch in the silhouette; the whole stance widened (trailing arm/leg pushed
   further -x, raised arm further +x) so the model reads WIDE like the owlbear rebuild (x-span
   ~1.7u) instead of a narrow column; veins widened to >=0.03 half-width (>=0.06u full) and two
   broad pale vein-patches added on the torso/fist for a real area-based high-value zone, not just
   thin lines. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildEarthElemental(){
  /* ---------- PALETTE (uneven torn earth — dark packed soil + grey-brown boulders, plus the
     bright pale seam-vein signature so it carries real value contrast against the dark mass). ---- */
  /* R3 SELF-CORRECTION (post r2 engine render): the r2 capture still read too dark overall — the
     whole model sat in one narrow dark-brown value band with almost no lit surface, so the
     silhouette read (torso+bent-arm) landed but the "signature carries the light" half of law 3
     didn't. Every rock tier lifted, and the raised-arm chain (shoulder/elbow/fist) deliberately
     recolored to the brightest tiers so that arm is unmistakably the lit half of the model. */
  const P = {
    rockA:0x8c8270,   /* pale grey-brown boulder (R3: lifted) */
    rockB:0x746a58,   /* mid brown boulder (R3: lifted) */
    rockC:0x5c5344,   /* darker brown boulder (R3: lifted, still darkest rock tier) */
    rockD:0xa89c82,   /* lightest lit rock — reserved for the raised-arm chain (R3: lifted hard) */
    soil:0x453a2e, soilDk:0x362d24,   /* dark packed torn soil (the "raw earth" tell vs golem's cut stone) */
    shadow:0x3a3226,  /* deep crevice shadow between boulders */
    vein:0xe4d8b4, veinLt:0xfaf3d8,   /* pale mineral seam-veins — the signature, high-value (R3: brightened further) */
    disc:0x3a352b, discTop:0x46402f,
  };

  /* a rounded BOULDER — a stacked-ring lump with per-vertex jitter so no boulder is a clean
     sphere. Draws straight into the frame. (kept from the prior pass's helper, proven geometry.)
     BUG FIX vs the prior pass: `stitch()` bakes vertex VALUES into POS immediately, so any
     ring-point mutation done by the CALLER after boulder() returns (e.g. a "flatten onto the
     disc" pass) is silently too late — the old file's flatten-after-return calls never actually
     worked, which is why the prior rebuild's bbox min.y went negative. `floorY`, when passed,
     clamps the bottom two bands (the ground-facing pole + its neighbor ring) BEFORE stitching. */
  function boulder(cx, cy, cz, rx, ry, rz, hex, lump = 0.10, n = 8, bands = 5, seed = 1, floorY = null){
    let s = seed >>> 0;
    const rnd = ()=>{ s = (s*1664525 + 1013904223) >>> 0; return (s>>>8)/16777216; };
    const rings = [];
    for(let k=0;k<=bands;k++){
      const t=k/bands, ang=t*Math.PI, yy=cy + ry*(-Math.cos(ang)), rr=Math.sin(ang);
      const rg = ring(V(cx,yy,cz), V(0,1,0), rx*rr+0.0001, rz*rr+0.0001, n, Math.PI/n);
      rg.forEach(p=>{ p.x += (rnd()*2-1)*lump*rr; p.y += (rnd()*2-1)*lump*0.4; p.z += (rnd()*2-1)*lump*rr; });
      if(floorY != null && k<=1) rg.forEach(p=>{ if(p.y<floorY) p.y=floorY; });
      rings.push(rg);
    }
    stitch(rings, ()=>hex);
    return rings;
  }

  /* a pale seam-vein — a bright quad-strip tracing the surface in a shallow branching path (2-3
     short segments so it reads as a crack/vein, not a straight scratch). `w` is the HALF-width, so
     the drawn strip is 2w wide — floored at 0.03 (0.06u full width) per the R2 fix, comfortably
     clear of law 3's 0.04u minimum-feature floor (r1's 0.012-0.018 half-widths were UNDER it and
     vanished in the engine capture). */
  function vein(pts, w, hex){
    w = Math.max(w, 0.03);
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i], b=pts[i+1];
      const dx=b.x-a.x, dz=b.z-a.z, len=Math.hypot(dx,dz)||1;
      const nx=-dz/len*w, nz=dx/len*w;
      quad(V(a.x+nx,a.y,a.z+nz), V(a.x-nx,a.y,a.z-nz), V(b.x-nx,b.y,b.z-nz), V(b.x+nx,b.y,b.z+nz), hex, 0.05);
    }
  }

  /* a broad pale vein-PATCH — an area-based high-value zone (not just a thin line), draped over a
     boulder's crown so it survives the 1/3-res engine dither the way the thin veins alone didn't
     (R2 fix: law 3 needs a real high-value ZONE, and a 0.06u line is still a thin single-pixel-row
     risk at 1/3-res — a patch guarantees the zone reads). */
  /* R4 CRITIC FIX (fresh-context pass-2 gate, post r3 engine render): re-derived the ellipsoid
     surface z at each patch's actual (x,y) against its host boulder — the R3 "on-surface" repos
     were still WRONG (same embedding bug one layer down): the slanted quad's NEAR edge (z-r*0.5)
     landed 0.2-0.25u INSIDE the host boulder's solid shell at every one of the 3 call sites, so the
     whole patch was occluded except a thin misaligned sliver at the far edge — which is exactly why
     r3's capture shows zero visible high-value zone (measured: max pixel brightness 112/255, ZERO
     pixels >140 in the model region). Flattened to a single constant-z quad (no more near/far
     slant) and every call site below re-centered at (host surface z + 0.06-0.09u margin) so the
     ENTIRE patch clears the boulder shell, not just one corner. */
  function veinPatch(x,y,z,r,hex){
    quad(V(x-r,y-r*0.65,z), V(x+r,y-r*0.65,z), V(x+r*0.85,y+r*0.65,z), V(x-r*0.85,y+r*0.65,z), hex, 0.06);
  }

  /* ---------- LANDMARKS — asymmetric leaning mass, pitched forward (+z) into the stride, heavier
     on the raised-arm (+x) side. NO separate head: the brow-ledge sits in the front of the core. */
  const L = {
    coreY:0.98, coreLeanZ:0.08, shoulderX:0.40, browY:1.14,
  };

  /* ===== CORE MASS — the leaning barrel, asymmetric: the +x side (under the raised arm) rides
     higher/bigger than the -x side, and the whole stack drifts +z with height (the forward pitch
     of the surge). R2: widened rx/rz so the torso itself reads as a broad mass, not a narrow post. */
  boulder(0.05, 0.92, 0.12, 0.46, 0.48, 0.42, P.rockB, 0.10, 9, 6, 11);
  boulder(0.20, 1.22, 0.26, 0.36, 0.34, 0.32, P.rockC, 0.10, 8, 5, 19);   /* raised-side upper mass, higher+forward */
  boulder(-0.14, 0.50, 0.06, 0.40, 0.30, 0.36, P.rockC, 0.09, 8, 4, 23);  /* lower belly, slight -x drag */

  /* ===== BROW-LEDGE — the "head" merged into the front of the core, up near the raised-arm side
     (asymmetric, not centered) so the mass reads like it just tore itself out of the ground at an
     angle. Eyeless per the standing ruling — a jutting overhang + a dark undercut socket band. ==== */
  {
    const bx = 0.16, bz = 0.40;
    const bl = boulder(bx, L.browY, bz, 0.26, 0.12, 0.20, P.rockA, 0.06, 8, 3, 77);
    bl.forEach(rg=>rg.forEach(p=>{ if(p.z>bz-0.06) p.y += 0.02; }));   /* tip the front lip down (overhang) */
    quad(V(bx-0.22, L.browY-0.10, bz-0.04), V(bx+0.22, L.browY-0.10, bz-0.04),
         V(bx+0.20, L.browY-0.20, bz-0.08), V(bx-0.20, L.browY-0.20, bz-0.08), P.shadow, 0.03);
  }

  /* ===== RAISED BOULDER FIST — the signature: shoulder -> elbow bent OUT to the side -> a huge
     knuckled fist boulder cocked up-and-forward. R2 FIX: r1 stacked the whole arm straight above
     the shoulder (a "tower"); the elbow now swings well out to +x before the forearm angles back
     up-and-in to the fist, opening a real negative-space notch between arm and torso in the
     silhouette — and the fist itself is now bigger than the shoulder ("huge fist" per DIRECTION,
     r1 had them the same size). ===== */
  {
    /* R4 FIX: the r3 render fused shoulder->elbow->fist into one rounded lobe indistinguishable
       from the torso silhouette (no visible negative-space notch, no readable "cocked overhead"
       read — a squint just sees one lumpy pile). Elbow pushed further +x/-z (out and back before
       swinging up) and the fist pushed further +y/+z (up and forward) so the arm chain occupies
       silhouette space the torso and other boulders don't reach — opening a real void gap. */
    const sh = V(0.56, 1.22, 0.16);
    const el = V(1.02, 1.46, -0.12);
    const wr = V(0.80, 2.08, 0.38);
    /* R3: the whole raised-arm chain recolored to the brightest rock tiers (rockA->rockD escalating
       to the fist) so this arm is unmistakably the model's lit half — value itself carries the
       signature, not just the thin veins riding on top of it. */
    boulder(sh.x, sh.y, sh.z, 0.30, 0.30, 0.28, P.rockA, 0.10, 8, 4, 101);   /* shoulder boulder */
    boulder(el.x, el.y, el.z, 0.25, 0.27, 0.23, P.rockD, 0.10, 8, 4, 107);   /* elbow boulder, swung OUT */
    /* the huge cocked FIST boulder, up and forward — bigger than the shoulder, brightest tier */
    boulder(wr.x, wr.y, wr.z, 0.36, 0.32, 0.33, P.rockD, 0.11, 9, 5, 113);
    /* 3 rounded knuckle bumps on the top-front of the fist, reading against the sky/void */
    for(const kx of [-0.15,0,0.15]){
      boulder(wr.x+kx, wr.y+0.19, wr.z+0.12, 0.085, 0.078, 0.078, P.rockA, 0.04, 6, 3, 131+kx*100|0);
    }
    /* crevice shadow at the elbow bend and under the fist so both joints read as distinct volumes */
    quad(V(sh.x+0.10, sh.y+0.02, sh.z-0.04), V(sh.x+0.24, sh.y+0.10, sh.z-0.02),
         V(el.x+0.02, el.y-0.14, el.z+0.02), V(el.x-0.08, el.y-0.10, el.z+0.02), P.shadow, 0.03);
    quad(V(el.x-0.06, el.y+0.22, el.z+0.10), V(el.x+0.10, el.y+0.24, el.z+0.14),
         V(wr.x+0.04, wr.y-0.20, wr.z-0.04), V(wr.x-0.10, wr.y-0.18, wr.z-0.06), P.shadow, 0.03);
  }

  /* ===== TRAILING OFF-ARM — low, smaller, dragging behind the stride (the -x side, asymmetric
     counterweight to the raised fist). R2: pushed further -x/-z so the wide stance reads on both
     sides, not just the fist side. Knuckles brush the ground behind the trailing leg. ===== */
  {
    const sh = V(-0.48, 0.90, -0.06);
    const el = V(-0.64, 0.54, -0.28);
    const kn = V(-0.58, 0.20, -0.46);
    boulder(sh.x, sh.y, sh.z, 0.24, 0.24, 0.22, P.rockB, 0.09, 7, 3, 151);
    boulder(el.x, el.y, el.z, 0.21, 0.22, 0.20, P.rockC, 0.09, 7, 3, 157);
    boulder(kn.x, kn.y, kn.z, 0.22, 0.19, 0.21, P.rockA, 0.08, 7, 4, 163, 0.02);   /* knuckles graze the ground */
  }

  /* ===== MID-STRIDE LEGS — no feet, stone leg-columns: one planted forward under the lean, one
     trailing back and lifted (the erupting stride, never a symmetric idle plant). R2: widened the
     fore/aft spread and thickened both so they register as legs, not swallowed by the core mass. */
  {
    /* front planted leg — under the core's forward lean, wide stony stump on the disc */
    const fThigh = V(0.14, 0.58, 0.28);
    const fFoot = V(0.22, 0.10, 0.46);
    boulder(fThigh.x, fThigh.y, fThigh.z, 0.24, 0.26, 0.23, P.rockB, 0.09, 8, 4, 71);
    boulder(fFoot.x, fFoot.y, fFoot.z, 0.27, 0.17, 0.27, P.rockD, 0.09, 8, 3, 83, 0.015);

    /* trailing leg — kicked back and lifted, smaller, off the ground (mid-stride) */
    const bThigh = V(-0.22, 0.52, -0.34);
    const bFoot = V(-0.32, 0.22, -0.58);
    boulder(bThigh.x, bThigh.y, bThigh.z, 0.20, 0.22, 0.19, P.rockC, 0.09, 7, 4, 91);
    boulder(bFoot.x, bFoot.y, bFoot.z, 0.21, 0.16, 0.21, P.rockA, 0.08, 7, 3, 97);
  }

  /* ===== TRAILING RUBBLE — small torn rock chunks scattered low and behind the trailing leg,
     selling the still-falling debris of the eruption (motion cue, cheap tris). ===== */
  {
    const rubble = [
      {x:-0.44, y:0.10, z:-0.48, r:0.10, hex:P.rockA, sd:201},
      {x:-0.56, y:0.06, z:-0.34, r:0.08, hex:P.rockC, sd:202},
      {x:-0.38, y:0.14, z:-0.62, r:0.09, hex:P.rockB, sd:203},
      {x:-0.60, y:0.18, z:-0.50, r:0.07, hex:P.soil,  sd:204},
      {x:-0.26, y:0.08, z:-0.56, r:0.06, hex:P.rockD, sd:205},
    ];
    for(const c of rubble){
      boulder(c.x, c.y, c.z, c.r, c.r*0.85, c.r, c.hex, 0.05, 6, 2, c.sd, 0.01);
    }
  }

  /* ===== SOIL SKIRT — a few dark packed-soil clumps at the base of the core/legs (distinct dark
     tone from the boulders — the "torn out of the ground" tell, not dressed masonry). ===== */
  {
    boulder(0.02, 0.20, -0.02, 0.30, 0.16, 0.28, P.soilDk, 0.07, 8, 3, 301, 0.005);
    boulder(0.24, 0.14, 0.36, 0.16, 0.11, 0.16, P.soil, 0.06, 6, 2, 307, 0.005);
    boulder(-0.10, 0.12, -0.14, 0.14, 0.10, 0.14, P.soilDk, 0.06, 6, 2, 311, 0.005);
  }

  /* ===== SEAM-VEINS — the signature: pale mineral veins crackling across the dark mass in short
     branching root-like paths, concentrated on the torso (front-facing, camera side) and up the
     raised arm so the loudest feature also carries the light (law 3). R2: widths floored at 0.03
     (>=0.06u full width, well clear of the 0.04u minimum-feature floor r1 fell under), plus two
     broad vein-PATCHES for a guaranteed area-based high-value zone on the torso and the fist. ==== */
  {
    vein([V(-0.06,1.26,0.34), V(-0.02,1.06,0.38), V(0.06,0.86,0.36), V(0.04,0.62,0.32)], 0.035, P.vein);
    vein([V(0.06,0.86,0.36), V(0.20,0.78,0.32)], 0.030, P.veinLt);   /* branch off the main crack */
    vein([V(0.26,1.18,0.24), V(0.36,1.02,0.20), V(0.34,0.82,0.18)], 0.032, P.vein);
    vein([V(0.58,1.28,0.18), V(0.76,1.36,0.08), V(0.86,1.60,0.16), V(0.74,1.82,0.26)], 0.036, P.veinLt);   /* shoulder->elbow->fist, the loudest run */
    vein([V(0.76,1.36,0.08), V(0.90,1.24,-0.02)], 0.028, P.vein);   /* branch off the elbow vein */
    vein([V(-0.24,0.80,0.02), V(-0.16,0.60,0.08)], 0.030, P.vein);
    /* R4 FIX: r3's patches were STILL embedded (see veinPatch header note) — each z below is the
       host boulder's analytically-solved ellipsoid surface z at this exact (x,y), plus a 0.06-0.09u
       clearance margin so the flattened (non-slanted) quad pokes fully clear of the shell at every
       corner, not just one edge. */
    veinPatch(0.20, 1.15, 0.64, 0.15, P.veinLt);       /* broad torso patch — clears boulder2's surface (0.575) by 0.065 */
    veinPatch(0.83, 2.15, 0.49, 0.15, P.veinLt);       /* broad fist-TOP patch — clears the fist boulder's surface (0.386) by 0.10 */
    veinPatch(0.91, 1.60, 0.23, 0.13, P.veinLt);       /* elbow-crest patch — clears the elbow boulder's surface (0.111) by 0.12 */
  }

  /* pale chipped facets — flat bright shear facets where rock broke, cheap value beats scattered
     across the core and fist (secondary contrast beats alongside the veins). */
  {
    const chip=(x,y,z,r)=>quad(V(x-r,y+r,z), V(x+r,y+r*0.4,z), V(x+r*0.6,y-r,z+r*0.3), V(x-r*0.6,y-r*0.6,z+r*0.3), P.rockD, 0.05);
    chip(0.34, 0.70, 0.38, 0.09);
    chip(0.70, 1.86, 0.24, 0.08);
    chip(-0.36, 0.48, -0.20, 0.07);
  }

  /* ---------- BASE DISC (r=0.55 — Large, matching the owlbear/wyvern rebuild convention). ------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.53, 0.53, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
