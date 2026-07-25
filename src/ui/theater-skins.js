/* THEATER SKINS — the procedural PIXEL-SKIN family + the FLOOR-TEXTURES.md floor-material family,
   extracted VERBATIM from src/ui/theater-boot.js in split step B3 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: every texel recipe this engine bakes on the CPU. The figure side — the canvas-2D
   capability probe, the deterministic hash + mulberry32 PRNG, the albedo floor, the L18 material
   programs and L19 eye dots, buildPixelSkinCanvas, and the bounded-LRU PIXEL_SKIN_CACHE with its
   symmetric disposePixelSkinCache end-of-life. The floor side — FLOOR_MATERIAL_BASE /
   FLOOR_MATERIAL_RECIPES / buildFloorMaterialCanvas and the FLOOR_TEXTURE_CACHE behind
   buildFloorCanvasTexture. Both caches are disposed by the ROOT's retire() path exactly as before
   (retire -> disposePixelSkinCache; retire -> disposeAuxCaches -> FLOOR_TEXTURE_CACHE), which keeps
   one end-of-life authority; this module owns no scheduler, no DOM, and no theater state.

   CTX LAW (recon §7.3 — acyclic imports; same shape as theater-clay-room.js / theater-light-lab.js):
   this module NEVER imports theater-boot.js. The root passes its capabilities ONCE via skinsInit(ctx)
   into the module-local mirrors below, so every moved body stays byte-identical (same bare
   identifiers — the shader/texture determinism law). Six root-owned symbols arrive that way and are
   deliberately NOT moved here, because non-skin subsystems own them too:
     clamp255 / hexToRGB / rgbToHex / scaleRGB / lumaOf — the generic color math gradeColorLocal,
       interiorBaseMaterialsFor and itrBrightRealmFillFor read as well;
     nearestify — the ONE NearestFilter/no-mipmap texture funnel nine root call sites share.
   There is no skinsSyncState: nothing in this module reads the theater state record S (verified by
   census — the region's only `S.` occurrences were prose in comments), so a state mirror here would
   be dead weight rather than a contract. PIXEL_SKIN_ENABLED likewise stays root-owned: the
   window.Theater.pixelSkin setter writes it and only the root's figureMaterialFor reads it, so
   nothing here needs an accessor for it. No top-level window.Theater assignment lived in this
   region, so there is no PublishSeams function to call.

   NON-VERBATIM EDITS (the complete list): the header/import/mirror prologue above the first moved
   line, and the trailing `export {...}` block. Not one byte inside a moved declaration changed. */
import * as THREE from "three";

// ---- root-capability mirrors (wired once by skinsInit; see the CTX LAW note above) ----
let clamp255, hexToRGB, lumaOf, nearestify, rgbToHex, scaleRGB;

export function skinsInit(ctx){
  ({ clamp255,
    hexToRGB,
    lumaOf,
    nearestify,
    rgbToHex,
    scaleRGB } = ctx);
}

/* ============================================================================
   FIGURE-FIDELITY ROUND-2, UNIT 1 — THE PROCEDURAL PIXEL-SKIN SYSTEM (REFERENCE-DIRECTION.md
   laws L2/L7; docs/MODEL-GRAMMAR.md §5 channels). "Detail lives in the texture, not the mesh"
   (RE1/the goblin reference): geometry owns silhouette, a tiny hand-shaded-look canvas texture
   owns the surface. At material-creation time (figureMaterialFor, the single funnel every figure
   box's material now routes through — see addBox) this replaces the pre-Unit-1 flat per-box color
   with a small procedural CanvasTexture that bakes L2's whole recipe into ~48x48 texels:
     base color (the part's already-resolved §5 channel color) -> quantize into 2-3 value bands,
     TOP-LIT (upper region lighter) -> Bayer/ordered dither between adjacent bands (±~6% value) ->
     a 1px lighter top-EDGE highlight row + a 1px darker bottom-edge row (the goblin reference's
     worn-edge paint, zero geometry) -> sparse low-alpha speckle for texel dirt.
   The texture is tinted-white-friendly: the material's own `color` stays 0xffffff so the baked
   texel colors show through 1:1 (a Lambert map multiplies the vertex/material color by the texel,
   so a white material color passes the texture through unchanged while still lighting correctly).

   DETERMINISM (the hard requirement): every random value here is drawn from a seeded PRNG whose
   seed is hash(partName + ":" + channelColorHex + ":" + variantKey) — NO Math.random anywhere.
   Same figure => byte-identical texel buffer, forever. CACHE: textures are memoized by that exact
   same key string (PIXEL_SKIN_CACHE) so the 510-recipe corpus mints one canvas per distinct
   (part, color, variant) triple, never thousands (a goblin's olive-dun torso texture is shared by
   every goblin's torso, and reused across re-renders/re-mounts within a page).

   HARD DEGRADE: pixelSkinCapable() capability-checks canvas 2D (try getContext('2d')); when it's
   absent (jsdom/headless/no-DOM) figureMaterialFor falls back to the EXACT pre-Unit-1 flat-color
   material path (a plain MeshLambertMaterial({color})), so every existing harness renders/asserts
   byte-identically to before this unit. A dev toggle (window.Theater.pixelSkin = false, wired on
   the public surface at the bottom of this file) A/Bs the whole system off against flat color at
   runtime without a reload — same escape-hatch spirit as psxEnabled's clean/PSX toggle.
   ============================================================================ */
const PIXEL_SKIN_TEX_SIZE = 48;        // texels per axis (L2's "~32-64px painted-look textures")

// capability probe, memoized (null = not yet checked). A headless/jsdom document either has no
// document.createElement at all, or a <canvas> whose getContext('2d') returns null (no 2D backend) —
// either way pixel-skin degrades to the flat-color path. Wrapped in try/catch so a throwing stub
// (some minimal DOM shims throw rather than return null) counts as "not capable," never propagates.
let PIXEL_SKIN_CAPABLE = null;
function pixelSkinCapable(){
  if(PIXEL_SKIN_CAPABLE !== null) return PIXEL_SKIN_CAPABLE;
  let ok = false;
  try {
    if(typeof document !== "undefined" && typeof document.createElement === "function"){
      const c = document.createElement("canvas");
      ok = !!(c && typeof c.getContext === "function" && c.getContext("2d"));
    }
  } catch(e){ ok = false; }
  PIXEL_SKIN_CAPABLE = ok;
  return ok;
}

// deterministic string hash (same ((h<<5)-h+ch)|0 algorithm as hashSeed/theaterLightSeedHash below,
// kept local so pixel-skin has no ordering dependency on where hashSeed is declared). Always returns
// a non-negative 32-bit int; a stable 0 for an empty/absent seed.
function pixelSkinHash(s){
  s = String(s || "");
  let h = 0;
  for(let i = 0; i < s.length; i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return h >>> 0; // unsigned so the PRNG seed is well-defined
}
// mulberry32 — a tiny, fast, well-distributed seeded PRNG. Pure function of its state; identical
// seed => identical stream, which is the whole determinism guarantee. Returns a closure yielding
// floats in [0,1). NOT a cryptographic RNG; just a stable per-texel jitter source (L2's dither/
// speckle need pseudo-randomness that reproduces byte-for-byte, which Math.random cannot give).
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* THE ALBEDO FLOOR (director intel: "add a resolved-albedo luminance floor... resolved base colors
   land roughly 0.25-0.65 luminance, desaturated but VISIBLE"). Applied to a figure's RESOLVED base
   color (numeric hex) right before it becomes a material/pixel-skin base — a defensive guarantee that
   NO figure's albedo drops so dark it reads as a black column (the §7b lineup's "bone Skeleton
   indistinguishable from charcoal Bandit" failure the intel flagged, whatever the exact upstream
   cause). Only LIFTS a color that's below the floor (a bright bone-white 0.81 is untouched); it lifts
   by uniformly scaling the RGB toward the floor luminance, which preserves hue+relative-channel ratios
   (a dark-red stays red, just a visible dark red — never desaturated to grey), and CAPS at the upper
   bound so an over-bright value is gently pulled down into the desaturated band too. Deterministic and
   pure (no state), so it doesn't perturb any determinism guarantee. */
const ALBEDO_FLOOR_LUM = 0.26;   // resolved base colors never render darker than this luminance
const ALBEDO_CEIL_LUM = 0.66;    // ...nor brighter (keeps the whole roster in the desaturated band)
function albedoFloor(hex){
  const c = hexToRGB(hex);
  const L = lumaOf(c);
  if(L >= ALBEDO_FLOOR_LUM && L <= ALBEDO_CEIL_LUM) return hex; // already in-band — untouched
  if(L <= 0.0001){
    // a pure/near-black channel color has no hue to preserve — lift to a neutral floor grey rather
    // than divide-by-~zero. (No real channel resolves this dark, but belt-and-suspenders.)
    const v = clamp255(ALBEDO_FLOOR_LUM * 255);
    return rgbToHex(v, v, v);
  }
  const target = L < ALBEDO_FLOOR_LUM ? ALBEDO_FLOOR_LUM : ALBEDO_CEIL_LUM;
  const f = target / L;                 // uniform scale preserves hue + channel ratios
  return rgbToHex(c.r * f, c.g * f, c.b * f);
}

/* the L2 texture recipe. Draws PIXEL_SKIN_TEX_SIZE^2 texels of a top-lit, band-quantized, ordered-
   dithered, worn-edge-highlighted paint skin off a single base color, seeded deterministically.
   Returns the <canvas> element (the caller wraps it in a CanvasTexture). Value banding: the base
   color is the MIDDLE band; a lighter band (top-lit upper region) and a darker band (lower region)
   bracket it, and the ordered-dither (a 4x4 Bayer matrix, screen-independent here since it's baked
   into texel space) nudges each texel between its band and the adjacent one by ±~6% value so the
   two-tone banding reads as hand-shading, not hard stripes. Row 0 (top edge) is a lighter highlight;
   the bottom row is darker (the reference's painted worn edges). Sparse speckle: a small fraction of
   texels get a low-alpha darker fleck for texel dirt (deterministic which ones, via the same PRNG). */
const PIXEL_SKIN_BAYER4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5
];

/* ============================================================================
   SHAPE-WAVE UNIT 4 — MATERIAL PROGRAMS (L18) + EYES (L19). The pixel-skin generator grows PER-MATERIAL
   texel programs selected by (part kind + channel + a coarse color read), not one generic dither:
     bone    — pale base, darker JOINT CRACK lines (a skeleton must READ bone)
     plate   — horizontal BANDS + RIVET dots + a bright RIM highlight row (armored humanoids read metal)
     cloth   — soft vertical WEAVE banding (robes/cloth)
     scale   — offset ROW pattern (a reptile/dragon scale read)
     leather — mottle (worn hide)
     fur     — directional streak NOISE (beast pelts)
     generic — the pre-U4 top-lit band+dither+speckle (the universal fallback, unchanged look)
   Plus EYE DOTS on head-front parts (2-4 px, black default, RED for undead/fiends — the cheapest life a
   figure can get). Every program is deterministic (the same seeded PRNG; no Math.random) and headless-
   degrades exactly like before (the whole system is behind pixelSkinCapable()). ============================================================================ */
// derive a material program from the part name + channel + a coarse color luminance/hue read. Curated,
// keyword-driven (no NLP) off the part-name vocabulary — the same discipline the recipe rules use.
const PLATE_PARTS = { "chest-plate": 1, "pauldrons": 1, "helm-crest": 1, "shield-slab": 1 };
const BONE_PARTS = { "head-skull": 1, "bone-protrusions": 1 };
const FUR_BODY_PARTS = { "torso-quad": 1 };
// UNIT 6: head-eyeless is deliberately NOT here — an eyeless aberration gets NO eye dots (its blank
// smooth dome is the read). Every other head-front part gets eyes (L19).
const HEAD_FRONT_PARTS = { "head-round": 1, "head-snout": 1, "head-horned": 1, "head-skull": 1, "maw-open": 1, "helm-crest": 1 };
function materialProgramFor(partName, channel, colorHex){
  const c = hexToRGB(colorHex), L = lumaOf(c);
  const bluishPale = (c.b >= c.r) && L > 0.5;       // bone-white / grave-pallor read
  if(BONE_PARTS[partName]) return "bone";
  if(channel === "armor"){
    if(partName === "robe-skirt") return "cloth";
    if(PLATE_PARTS[partName]) return "plate";
    // an armor-channel torso band on a humanoid reads as worn plate/harness; a light metal color -> plate,
    // else leather.
    return L > 0.5 ? "plate" : "leather";
  }
  // a pale, bluish skin on a skull-adjacent part reads bone even without the skull part (a bleached body).
  if(channel === "skin" && bluishPale && (partName === "torso-biped" || partName === "arm-tapered" || partName === "leg-tapered")) return "bone";
  if(FUR_BODY_PARTS[partName]) return "fur";
  if(partName === "legTapered" || partName === "leg-tapered") return "skinSmooth";
  return "generic";
}
// eye rule: head-front parts get eyes; RED when the resolved color reads fiendish/dark-red (a hot,
// red-dominant, dark color) — otherwise black. Undead skulls (bone program) get dark hollow sockets
// (near-black), which read correctly as empty eye sockets.
function eyeSpecFor(partName, channel, colorHex){
  if(!HEAD_FRONT_PARTS[partName]) return null;
  const c = hexToRGB(colorHex);
  const redDominant = c.r > c.g + 20 && c.r > c.b + 20;   // a red-forward color -> fiend/undead-hot eyes
  return { color: redDominant ? 0xd83a2a : 0x000000 };
}

function buildPixelSkinCanvas(colorHex, seed, program, eyeSpec, texSize){
  const size = texSize || PIXEL_SKIN_TEX_SIZE;
  program = program || "generic";
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const data = img.data;
  const base = hexToRGB(colorHex);
  const bands = [ scaleRGB(base, 0.80), base, scaleRGB(base, 1.18) ];
  const rand = mulberry32(seed);
  // one deterministic PRNG stream, consumed in a FIXED ORDER regardless of program, so a program swap
  // never desyncs the determinism guarantee: pull the speckle decisions first (every program shares
  // this budget), then each program pulls its own extra stream as needed.
  const speckle = new Uint8Array(size * size);
  for(let i = 0; i < size * size; i++){ speckle[i] = rand() < 0.07 ? 1 : 0; }
  const set = (x, y, r, g, b) => { const o = (y * size + x) * 4; data[o] = clamp255(r); data[o+1] = clamp255(g); data[o+2] = clamp255(b); data[o+3] = 255; };

  for(let y = 0; y < size; y++){
    const vt = y / (size - 1);            // 0 top .. 1 bottom
    for(let x = 0; x < size; x++){
      const ht = x / (size - 1);
      // --- the base top-lit band+dither (every program starts here, then layers its own marks) ---
      let bandIdx = vt < 0.34 ? 2 : (vt < 0.67 ? 1 : 0);
      const bayer = PIXEL_SKIN_BAYER4[(y % 4) * 4 + (x % 4)] / 16;
      const frac = (vt < 0.34 ? (vt / 0.34) : (vt < 0.67 ? ((vt - 0.34) / 0.33) : ((vt - 0.67) / 0.33)));
      if(frac < 0.5 && bandIdx > 0 && bayer > frac * 2) bandIdx -= 1;
      else if(frac > 0.5 && bandIdx < 2 && bayer > (1 - frac) * 2) bandIdx += 1;
      let col = bands[bandIdx];
      if(y === 0) col = scaleRGB(base, 1.32);
      else if(y === size - 1) col = scaleRGB(base, 0.66);
      let mul = 1;                          // per-texel value multiplier the program layers on
      // --- PER-MATERIAL PROGRAM (L18) ---
      if(program === "plate"){
        // horizontal plate BANDS (a lame/lamellar read): a repeating dark seam every ~1/4 height, with
        // a bright RIM row just below each seam (the worn metal highlight), + rivet dots on the seams.
        const bandN = 4, bp = vt * bandN, seam = bp - Math.floor(bp);
        if(seam < 0.08) mul *= 0.6;                       // the recessed seam between plates (dark)
        else if(seam < 0.16) mul *= 1.35;                 // the bright rim highlight just below the seam
        // rivets: dots along each seam line at regular x
        const rivetX = Math.abs((ht * 6) % 1 - 0.5) < 0.08;
        if(seam < 0.1 && rivetX) mul *= 1.5;              // a bright rivet head
      } else if(program === "bone"){
        // pale bone base + darker JOINT CRACK lines: a couple of thin dark diagonal/horizontal fissures
        // (the seams between bones) + a slightly desaturated, brighter overall value.
        mul *= 1.08;
        const crack1 = Math.abs(vt - 0.4) < 0.03, crack2 = Math.abs(vt - 0.72) < 0.025;
        const crackV = Math.abs(ht - 0.5) < 0.02;         // a vertical fissure down the center
        if(crack1 || crack2 || crackV) mul *= 0.5;        // the dark crack
      } else if(program === "scale"){
        // offset ROW pattern (reptile scales): a grid of half-offset cells, each with a dark lower edge
        // (the scale overlap shadow) — the classic dragon-scale read.
        const rows = 8, rp = vt * rows, rowY = rp - Math.floor(rp);
        const offset = (Math.floor(rp) % 2) * 0.5;
        const cp = ((ht * rows) + offset) % 1;
        if(rowY > 0.7) mul *= 0.68;                        // the scale's lower overlap shadow
        if(cp < 0.1 || cp > 0.9) mul *= 0.85;              // the vertical scale edges
      } else if(program === "cloth"){
        // soft vertical WEAVE banding (a robe's folds): gentle sinusoidal light/dark columns.
        const fold = Math.sin(ht * Math.PI * 5);
        mul *= 1 + fold * 0.14;
        // a faint horizontal weave cross-hatch
        if((y % 3) === 0) mul *= 0.96;
      } else if(program === "fur"){
        // directional streak NOISE (a pelt): vertical streaks of value, biased by a per-column hash so
        // the fur reads as combed downward.
        const streak = swarmHashLocal(x, 7);              // stable per-column
        mul *= 0.86 + streak * 0.28;
        if((y % 2) === 0 && streak > 0.6) mul *= 1.1;     // a lit guard hair
      } else if(program === "leather"){
        // mottle: soft irregular blotches (worn hide) via a low-freq per-cell hash.
        const blot = swarmHashLocal(Math.floor(x / 4) * 13 + Math.floor(y / 4) * 7, 11);
        mul *= 0.82 + blot * 0.34;
      }
      // per-texel micro-jitter (kills the flat fill) — shared by every program, one draw from the stream.
      const jitter = 1 + (rand() - 0.5) * 0.10;
      let r = col.r * jitter * mul, g = col.g * jitter * mul, b = col.b * jitter * mul;
      if(speckle[y * size + x]){ r *= 0.72; g *= 0.72; b *= 0.72; }
      set(x, y, r, g, b);
    }
  }

  // --- EYES (L19): 2 dots on the head-front (upper-mid band), 2-4 px each, black default / red for
  // fiends. Drawn AFTER the material fill so they sit on top. Scaled to texSize so the 64px hero variant
  // gets proportionally-sized eyes. Only head-front parts pass a non-null eyeSpec. ---
  if(eyeSpec){
    const ec = hexToRGB(eyeSpec.color);
    const dot = Math.max(2, Math.round(size / 16));       // 3px @48, 4px @64
    const ey = Math.round(size * 0.4);                    // eye row (upper-mid — the face)
    const exL = Math.round(size * 0.36), exR = Math.round(size * 0.64);
    for(let dy = 0; dy < dot; dy++){
      for(let dx = 0; dx < dot; dx++){
        set(exL + dx - ((dot/2)|0), ey + dy, ec.r, ec.g, ec.b);
        set(exR + dx - ((dot/2)|0), ey + dy, ec.r, ec.g, ec.b);
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}
// a tiny deterministic per-index hash local to the pixel-skin programs (fur streaks / leather mottle),
// matching swarmHash's algorithm shape but self-contained here (the swarm one lives in theater-parts).
function swarmHashLocal(i, salt){
  let h = ((i + 1) * 374761393 + salt * 668265263) | 0;
  h = (h ^ (h >>> 13)) | 0; h = Math.imul(h, 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ============================================================================
   FLOOR-TEXTURES.md §3 — procedural floor textures. Mirrors buildPixelSkinCanvas's technique (base
   value banding + 4x4 Bayer dither + sparse speckle) for the 12 §1 floor materials, so a rolled
   room's floor reads as a MATERIAL (flagstone/cobble/sand/grass/etc.) instead of a flat two-tone
   checker. Every recipe below is a small per-texel program keyed off the same PIXEL_SKIN_BAYER4
   matrix + mulberry32 seeded PRNG this file already uses for figure skins — deterministic, offline,
   no asset files (§6 decision 2). ============================================================ */
const FLOOR_TEX_SIZE = 64; // texels per axis (§1: "~64 texels, tiling")

// each recipe is a small per-texel draw function: (ctx: {x,y,size,vt,ht,base,bands,bayer,rand,
// speckle}) -> {r,g,b} (pre-jitter/speckle; the shared tail applies per-texel jitter + speckle same
// as buildPixelSkinCanvas does). `bands` is the same [dark, base, light] triple buildPixelSkinCanvas
// derives; recipes lean on it so every material stays in the same tonal family as its tile tint.
// each material's OWN characteristic base color (VS-desaturated but distinct) — so snow reads pale,
// sand tan, grass green, mud brown, rather than every material collapsing to the env palette tint.
// buildFloorMaterialCanvas mixes this 88/12 toward the tile tint on a NO-REALM floor (material
// dominates); on a realm-surface floor the ratio INVERTS (12/88) — the authored realm baseTint
// leads and this color is only a hue nudge under the recipe's pattern (Adam 2026-07-08).
const FLOOR_MATERIAL_BASE = {
  flagstone: 0x6f6f74, cobble: 0x777069, "cracked-earth": 0x7d6a4c, "cave-rock": 0x615c53,
  grass: 0x5c7038, "leaf-litter": 0x6d5a35, sand: 0xbcac7c, "snow-ice": 0xccd4e0,
  mud: 0x4f4335, scree: 0x827c73, plank: 0x715736, ash: 0x84817b,
  // net-new realm-surface bases (docs/REALM-SURFACES-DRAFT.md)
  grating: 0x585d64, asphalt: 0x3a3c40, "void-floor": 0x141620, "rope-matting": 0x8a7854, "candy-tile": 0xd85a84,
};
// mix two {r,g,b} — tB is the weight on b (0 = all a).
function mixRGB(a, b, tB){ const tA = 1 - tB; return { r: a.r * tA + b.r * tB, g: a.g * tA + b.g * tB, b: a.b * tA + b.b * tB }; }

const FLOOR_MATERIAL_RECIPES = {
  // cut rectangular blocks: a grout grid of darker mortar lines, slight per-block value jitter.
  flagstone(c){
    const cols = 4, rows = 4;
    const cx = (c.ht * cols) % 1, cy = (c.vt * rows) % 1;
    const grout = cx < 0.06 || cx > 0.94 || cy < 0.06 || cy > 0.94;
    const blockJitter = swarmHashLocal(Math.floor(c.ht * cols) * 13 + Math.floor(c.vt * rows) * 7, 3);
    let mul = 0.92 + blockJitter * 0.2;
    if(grout) mul *= 0.55;
    return scaleRGB(c.base, mul);
  },
  // packed rounded cobbles: many small ovoid cells with darker gaps, pebbly.
  cobble(c){
    const cellsX = 8, cellsY = 8;
    const cx = (c.ht * cellsX) % 1 - 0.5, cy = (c.vt * cellsY) % 1 - 0.5;
    const d = Math.sqrt(cx * cx + cy * cy);
    const cellJitter = swarmHashLocal(Math.floor(c.ht * cellsX) * 17 + Math.floor(c.vt * cellsY) * 11, 5);
    let mul = 0.88 + cellJitter * 0.3;
    if(d > 0.42) mul *= 0.5; // the gap between cobbles
    return scaleRGB(c.base, mul);
  },
  // packed dirt: broad value mottle + a few branching darker crack lines.
  "cracked-earth"(c){
    const blot = swarmHashLocal(Math.floor(c.ht * 10) * 13 + Math.floor(c.vt * 10) * 7, 11);
    let mul = 0.82 + blot * 0.34;
    const crack = Math.abs(((c.ht * 3 + c.vt * 2) % 1) - 0.5) < 0.025;
    if(crack) mul *= 0.55;
    return scaleRGB(c.base, mul);
  },
  // rough uneven stone: coarse value blotches, no grid, dark pits.
  "cave-rock"(c){
    const blot = swarmHashLocal(Math.floor(c.ht * 9) * 19 + Math.floor(c.vt * 9) * 23, 17);
    let mul = 0.75 + blot * 0.5;
    const pit = swarmHashLocal(Math.floor(c.ht * 14) * 5 + Math.floor(c.vt * 14) * 31, 29) > 0.92;
    if(pit) mul *= 0.4;
    return scaleRGB(c.base, mul);
  },
  // turf: fine vertical blade speckle, two-green value flecking.
  grass(c){
    const streak = swarmHashLocal(Math.floor(c.x / 1) + Math.floor(c.y / 2) * 3, 7);
    let mul = 0.85 + streak * 0.3;
    if((c.y % 2) === 0 && streak > 0.55) mul *= 1.12; // a lit blade tip
    return scaleRGB(c.base, mul);
  },
  // forest floor: scattered small angular leaf flecks over dark loam.
  "leaf-litter"(c){
    let mul = 0.7; // dark loam base
    const leaf = swarmHashLocal(Math.floor(c.ht * 12) * 41 + Math.floor(c.vt * 12) * 3, 13) > 0.72;
    if(leaf) mul = 0.95 + swarmHashLocal(Math.floor(c.ht * 12), 19) * 0.35;
    return scaleRGB(c.base, mul);
  },
  // dune: soft horizontal ripple bands, fine grain speckle.
  sand(c){
    const ripple = Math.sin(c.vt * Math.PI * 10 + c.ht * 1.5);
    let mul = 1 + ripple * 0.1;
    const grain = swarmHashLocal(Math.floor(c.x) + Math.floor(c.y) * 71, 3);
    mul *= 0.94 + grain * 0.12;
    return scaleRGB(c.base, mul);
  },
  // pale smooth with faint blue sheen bands + sparse sparkle specks.
  "snow-ice"(c){
    const sheen = Math.sin(c.vt * Math.PI * 4 + c.ht * 2.2);
    let mul = 1.05 + sheen * 0.06;
    const sparkle = swarmHashLocal(Math.floor(c.x) * 3 + Math.floor(c.y) * 97, 41) > 0.94;
    const col = scaleRGB(c.base, mul);
    if(sparkle) return { r: col.r * 1.3 + 20, g: col.g * 1.3 + 20, b: col.b * 1.35 + 25 };
    return col;
  },
  // wet dark: broad glossy value blobs, a few darker puddle centers.
  mud(c){
    const blot = swarmHashLocal(Math.floor(c.ht * 7) * 13 + Math.floor(c.vt * 7) * 29, 23);
    let mul = 0.68 + blot * 0.3;
    const puddle = swarmHashLocal(Math.floor(c.ht * 5) * 3 + Math.floor(c.vt * 5) * 7, 31) > 0.85;
    if(puddle) mul *= 0.5;
    return scaleRGB(c.base, mul);
  },
  // loose rock: many small angular pebble cells of varied value.
  scree(c){
    const cell = swarmHashLocal(Math.floor(c.ht * 11) * 37 + Math.floor(c.vt * 11) * 43, 7);
    let mul = 0.7 + cell * 0.55;
    return scaleRGB(c.base, mul);
  },
  // wood boards: long horizontal planks with darker seam lines + grain streaks.
  plank(c){
    const planks = 5, pp = c.vt * planks, seam = pp - Math.floor(pp);
    let mul = 1;
    if(seam < 0.06) mul *= 0.55; // the seam between boards
    const grain = swarmHashLocal(Math.floor(c.x / 1) + Math.floor(pp) * 53, 9);
    mul *= 0.9 + grain * 0.22;
    return scaleRGB(c.base, mul);
  },
  // grey soot: fine even fleck of light+dark over a mid grey.
  ash(c){
    const fleck = swarmHashLocal(Math.floor(c.x) * 3 + Math.floor(c.y) * 89, 53);
    const mul = 0.8 + fleck * 0.4;
    return scaleRGB(c.base, mul);
  },
  // REALM-SURFACE net-new bases (docs/REALM-SURFACES-DRAFT.md) --------------------------------------
  // perforated metal walkway: a grid of punched holes (dark see-through gaps) between lit metal ribs.
  grating(c){
    const cells = 6, cx = (c.ht * cells) % 1 - 0.5, cy = (c.vt * cells) % 1 - 0.5;
    const d = Math.max(Math.abs(cx), Math.abs(cy));
    let mul = 0.95 + swarmHashLocal(Math.floor(c.ht * cells) * 7 + Math.floor(c.vt * cells) * 13, 5) * 0.12;
    if(d < 0.30) mul *= 0.18; else if(d < 0.37) mul *= 0.5;   // punched hole + rim shadow
    return scaleRGB(c.base, mul);
  },
  // rolled asphalt: fine dark grain + a faded painted lane stripe ghosting diagonally through.
  asphalt(c){
    const grain = swarmHashLocal(Math.floor(c.x) * 3 + Math.floor(c.y) * 61, 41);
    const s = (c.ht + c.vt) % 1;
    if(s > 0.46 && s < 0.54) return { r: 150 + grain * 36, g: 148 + grain * 36, b: 136 + grain * 36 }; // worn paint stripe
    return scaleRGB(c.base, 0.82 + grain * 0.30);
  },
  // star-flecked void: a near-black floor with sparse bright star specks + faint constellation seams.
  "void-floor"(c){
    const star = swarmHashLocal(Math.floor(c.x * 1.3) * 17 + Math.floor(c.y * 1.3) * 29, 71);
    if(star > 0.972){ const b = 180 + (star - 0.972) / 0.028 * 70; return { r: b * 0.88, g: b * 0.94, b: b }; }
    const seam = ((c.ht * 3) % 1) < 0.05 || ((c.vt * 3) % 1) < 0.05;
    let mul = 0.7 + swarmHashLocal(Math.floor(c.ht * 3) * 5 + Math.floor(c.vt * 3) * 7, 3) * 0.5;
    if(seam) mul *= 1.4;
    return scaleRGB(c.base, mul);
  },
  // woven rope matting: over-under strand weave, under-strands in shadow.
  "rope-matting"(c){
    const strands = 7, sx = Math.floor(c.ht * strands), sy = Math.floor(c.vt * strands);
    const over = ((sx + sy) % 2) === 0;
    const along = over ? ((c.vt * strands) % 1 - 0.5) : ((c.ht * strands) % 1 - 0.5);
    let mul = (0.78 + (1 - Math.abs(along) * 2) * 0.32) * (over ? 1.0 : 0.86);
    return scaleRGB(c.base, mul);
  },
  // candy tile: a bright checkerboard of two confection tones — bright-kingdom pops HIGH-SAT by design
  // (the "too-bright color of a warning"), so this recipe ignores the env tint on purpose.
  "candy-tile"(c){
    const cells = 4, on = ((Math.floor(c.ht * cells) + Math.floor(c.vt * cells)) % 2) === 0;
    const jit = 1 + (swarmHashLocal(Math.floor(c.ht * cells) * 3 + Math.floor(c.vt * cells) * 7, 9) - 0.5) * 0.10;
    return on ? { r: 222 * jit, g: 98 * jit, b: 134 * jit } : { r: 150 * jit, g: 210 * jit, b: 190 * jit };
  }
};

function buildFloorMaterialCanvas(material, colorHex, seed, realmLead){
  const size = FLOOR_TEX_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const data = img.data;
  // 2026-07-08 (Adam "floors are drab as hell" — the realm tint funnel): two mixing regimes off ONE
  // room-wide tint (the checker's per-parity double-texture is gone with the parity tint itself):
  //   realmLead (tile carries a realm surface baseTint): the AUTHORED realm color LEADS — the
  //     material base contributes only a 12% hue nudge plus its full per-texel pattern, so red rock
  //     reads RED and bright-kingdom SCREAMS instead of collapsing to the material's stock gray.
  //   no realm: material's OWN color dominates as before, env tint mixed for cohesion — weight
  //     reduced 0.30 -> 0.12 so the (gray-ish) env fallback stops dragging every material toward
  //     the same drab hue; the recipe's own color + pattern carry the look.
  const envRGB = hexToRGB(colorHex);
  const matHex = FLOOR_MATERIAL_BASE[material];
  const base = (matHex != null)
    ? (realmLead ? mixRGB(envRGB, hexToRGB(matHex), 0.12) : mixRGB(hexToRGB(matHex), envRGB, 0.12))
    : envRGB;
  const bands = [scaleRGB(base, 0.80), base, scaleRGB(base, 1.18)];
  const rand = mulberry32(seed);
  const speckle = new Uint8Array(size * size);
  for(let i = 0; i < size * size; i++){ speckle[i] = rand() < 0.05 ? 1 : 0; }
  const set = (x, y, r, g, b) => { const o = (y * size + x) * 4; data[o] = clamp255(r); data[o+1] = clamp255(g); data[o+2] = clamp255(b); data[o+3] = 255; };
  const recipe = FLOOR_MATERIAL_RECIPES[material] || FLOOR_MATERIAL_RECIPES.flagstone;

  for(let y = 0; y < size; y++){
    const vt = y / (size - 1);
    for(let x = 0; x < size; x++){
      const ht = x / (size - 1);
      const col = recipe({ x, y, vt, ht, base, bands, rand });
      const jitter = 1 + (rand() - 0.5) * 0.08;
      let r = col.r * jitter, g = col.g * jitter, b = col.b * jitter;
      if(speckle[y * size + x]){ r *= 0.75; g *= 0.75; b *= 0.75; }
      set(x, y, r, g, b);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// module-scope cache: material+":"+tintHex -> THREE.CanvasTexture (the figure-texture cache
// precedent — a dungeon has few distinct floor textures, never thousands, §3 item 1). `tintHex` is
// the tile's own `t.tint` value — a "#rrggbb" string in this codebase (theater-data.js's palette
// entries) — used verbatim as the cache key so two tiles sharing a tint+material share one texture.
const FLOOR_TEXTURE_CACHE = new Map();
function buildFloorCanvasTexture(material, tintHex, seed, realmLead){
  // realmLead rides the cache key: a realm-led mix and a material-led mix of the same (material,
  // tint) pair are genuinely different canvases and must never collide.
  const key = material + ":" + tintHex + (realmLead ? ":realm" : "");
  const hit = FLOOR_TEXTURE_CACHE.get(key);
  if(hit) return hit;
  let tex = null;
  try {
    // resolve tintHex (a "#rrggbb" string, or already-numeric) to a numeric 0xrrggbb via THREE.Color
    // so this stays in sync with however colorFor/topColor elsewhere in this file parse the same
    // tile.tint field — never a bespoke string hash of the color (that would drift the hue).
    const parsed = new THREE.Color(tintHex);
    const colorHex = (parsed.r * 255 << 16) | (parsed.g * 255 << 8) | (parsed.b * 255 | 0);
    const canvas = buildFloorMaterialCanvas(material, colorHex, pixelSkinHash(key + ":" + seed), !!realmLead);
    tex = new THREE.CanvasTexture(canvas);
    nearestify(tex); // NearestFilter mag+min, generateMipmaps=false (§3 item 1)
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
  } catch(e){ tex = null; }
  FLOOR_TEXTURE_CACHE.set(key, tex);
  return tex;
}

/* the cached CanvasTexture factory. Key = partName:colorHex:variantKey (the exact tuple the brief
   names). One CanvasTexture per distinct triple; NearestFilter + no mipmaps (L2: "NearestFilter, no
   mips") applied via the same nearestify() helper every other texture entry point uses. Returns a
   THREE.Texture. On any failure (should never happen once capable) returns null so figureMaterialFor
   cleanly falls back to flat color.

   A3 (REVIEW-FIXES-0705-VISUAL.md §W2-A finding 3) — PIXEL_SKIN_CACHE used to retain EVERY CanvasTexture
   ever minted for the lifetime of the mount (key space is part:channel:variant:colorHex x realm grading,
   so a long session touring many realms/creatures grows this unboundedly) and retire() never disposed
   it at all — asymmetric with disposeWholeObjectCaches' own D7 treatment of the whole-object caches.
   Fix: a bounded LRU (a `Map`, whose iteration/re-insertion order gives "least-recently-fetched" for
   free — re-`set`ting an existing key on a cache HIT bumps it to the most-recent position by delete+
   re-insert) capped at PIXEL_SKIN_CACHE_CAP entries; inserting past the cap evicts + disposes the
   oldest entry. 128 comfortably covers a board's live variety while bounding a long session. Disposed
   symmetrically at retire() (see disposePixelSkinCache below) — retire() is the one true end-of-life
   point for this cache too, matching disposeWholeObjectCaches. figureMaterialFor (:781-ish, the only
   consumer) is untouched — this file's own signature/behavior at the call site is unchanged. */
const PIXEL_SKIN_CACHE_CAP = 128;
const PIXEL_SKIN_CACHE = new Map();
// UNIT 4 (L18/L19): the skinKey is "partName:channel:variantKey" (renderPartInto builds it); variantKey
// is "slug|kind". Parse it to pick the material program + eye spec + (U7-lite) the hero-tier 64px texel
// size. The cache key already includes all of these (via skinKey + color), so a program/eye/size change
// mints its own texture and never collides with a differently-programmed one.
const PIXEL_SKIN_HERO_TEX_SIZE = 64;   // U7-lite: PC/boss tier gets a crisper 64px skin at ~2x screen size
function pixelSkinTextureFor(colorHex, skinKey){
  const key = skinKey + ":" + (colorHex >>> 0).toString(16);
  if(PIXEL_SKIN_CACHE.has(key)){
    // LRU touch: bump this key to the most-recently-fetched position (delete+re-insert — a Map's own
    // iteration order is insertion order, so this is the whole LRU mechanism, no separate timestamp).
    const hit = PIXEL_SKIN_CACHE.get(key);
    PIXEL_SKIN_CACHE.delete(key);
    PIXEL_SKIN_CACHE.set(key, hit);
    return hit;
  }
  let tex = null;
  try {
    const parts = String(skinKey).split(":");
    const partName = parts[0] || "";
    const channel = parts[1] || "skin";
    const variantKey = parts.slice(2).join(":");
    const kind = (variantKey.split("|")[1] || "");
    const program = materialProgramFor(partName, channel, colorHex);
    const eyeSpec = eyeSpecFor(partName, channel, colorHex);
    const texSize = (kind === "pc") ? PIXEL_SKIN_HERO_TEX_SIZE : PIXEL_SKIN_TEX_SIZE;
    const canvas = buildPixelSkinCanvas(colorHex, pixelSkinHash(key), program, eyeSpec, texSize);
    tex = new THREE.CanvasTexture(canvas);
    nearestify(tex);          // NearestFilter mag+min, generateMipmaps=false (L2)
    tex.colorSpace = THREE.SRGBColorSpace; // the canvas RGB bytes are authored in sRGB, like a PNG
  } catch(e){ tex = null; }
  PIXEL_SKIN_CACHE.set(key, tex);
  if(PIXEL_SKIN_CACHE.size > PIXEL_SKIN_CACHE_CAP){
    // evict the OLDEST entry — a Map's iterator yields insertion order, so .next() on .keys() is
    // exactly the least-recently-fetched key (every cache HIT above re-inserts to bump recency).
    const oldestKey = PIXEL_SKIN_CACHE.keys().next().value;
    const oldestTex = PIXEL_SKIN_CACHE.get(oldestKey);
    if(oldestTex && oldestTex.dispose) oldestTex.dispose();
    PIXEL_SKIN_CACHE.delete(oldestKey);
  }
  return tex;
}
/* A3 — the symmetric end-of-life dispose point for PIXEL_SKIN_CACHE, called from retire() alongside
   disposeWholeObjectCaches(). Disposes every still-cached CanvasTexture then empties the cache so a
   subsequent mount() starts fresh (a disposed THREE.Texture can't be reused, same discipline as
   disposeWholeObjectCaches). Idempotent-safe: an already-empty cache is a no-op. */
function disposePixelSkinCache(){
  PIXEL_SKIN_CACHE.forEach(function(tex){ if(tex && tex.dispose) tex.dispose(); });
  PIXEL_SKIN_CACHE.clear();
}

// ---- the surface the root (and any future leaf) consumes. FLOOR_TEXTURE_CACHE is exported as the
// LIVE Map object so the root's disposeAuxCaches keeps disposing the very cache buildFloorCanvasTexture
// fills — same object identity as before the split, not a copy. ----
export {
  albedoFloor,
  pixelSkinCapable,
  pixelSkinTextureFor,
  disposePixelSkinCache,
  buildFloorCanvasTexture,
  FLOOR_TEXTURE_CACHE
};
