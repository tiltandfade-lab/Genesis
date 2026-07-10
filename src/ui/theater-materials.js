/* GENESIS MODULE — src/ui/theater-materials.js — GR1: procedural per-realm material CanvasTexture
   painters (docs/GRAPHICS-ENGINE.md Part I law 3 SUBTLE-TEXTURE, §E TEXTURE-PER-REALM, build unit GR1).
   Classic <script> global, loaded after src/engine/place-spatialize.js (owns dspHashStr/dspMulberry32,
   the reference PRNG every seeded module in this repo shares — no Math.random anywhere below) and
   before src/ui/theater-boot.js's sealed ES-module scope (same load-order convention
   src/ui/theater-interior.js's own header documents).

   WHY A SEPARATE FILE FROM theater-interior.js (which OWNS REALM_MATERIALS, the per-realm/surface
   material+grain registry): that file's own header is explicit about staying "no THREE, no canvas, no
   DOM" — it turns a SpatialPlan into instance-transform data, nothing pixel-shaped ever touches it.
   This file is the mirror-image split one level down: it turns a (material, baseColor) pair into a
   PLAIN RGBA PIXEL BUFFER by pure per-pixel math — still no `document.createElement("canvas")`, no
   THREE.* anywhere below — so it stays testable head-on in a bare node `vm` context (dev/verify-
   dungeon-interior.mjs's own load-modules-into-one-sandbox pattern) without a browser or a `canvas` npm
   polyfill. theater-boot.js's interiorMaterialTexture is the ONE place a buffer from here becomes an
   actual THREE.CanvasTexture (putImageData'd onto a real <canvas>, then nearestify()'d) — same "data
   layer here, GL layer there" split theater-interior.js/theater-boot.js already keep.

   DETERMINISM: materialTexturePixels(material, baseColorHex, seedStr, size, grainIntensity) seeds off
   dspHashStr("gr1-material:"+material+":"+baseColorHex+":"+seedStr) -> dspMulberry32 — the SAME 5 args
   always paint a byte-identical buffer. theater-boot.js seeds with "<realmId>:<surface>" (boot-time,
   baked once per realm+surface pair, cached, never re-rolled per room/plan/session).

   SUBTLE-TEXTURE LAW (the low-contrast bound every painter below is built to satisfy BY CONSTRUCTION,
   not by a post-hoc clamp pass): every feature a painter draws (a stone block, a mortar line, a plank
   board, a nail dot, a metal seam, a rivet, a mottle blotch) is one bounded MULTIPLICATIVE factor in the
   closed band [1-grainIntensity, 1+grainIntensity], applied to the base color's own R/G/B channels, then
   rounded to a byte and clamped to [0,255]. Clamping can only pull a channel's relative deviation from
   base BACK toward zero (never push it past grainIntensity) — so every painter is contrast-bound-correct
   without a separate verification pass inside this file; dev/verify-dungeon-interior.mjs confirms it
   empirically by sampling real output. grainIntensity stays LOW everywhere it's set (REALM_MATERIALS:
   ~0.07-0.12) per the law's own "never busy, whisper the material" instruction. */

// one texel density across a realm kit's WHOLE surface set (the law's own words: "same px-per-cell for
// floor and wall") — ONE shared constant every painter bakes at, so no kit can accidentally drift its
// floor and wall textures to different resolutions; theater-boot.js never overrides this per-call.
const MATERIAL_TEXEL_PX = 64;
const MATERIAL_GRAIN_DEFAULT = 0.1; // LOW — used only when a REALM_MATERIALS entry omits its own value

// REALM_MATERIALS (src/ui/theater-interior.js) names one of these per surface; an unlisted/typo'd
// material string degrades to "mottle" (materialFamilyFor's own fallback, below) rather than throwing —
// same total-function discipline interiorTileKitFor/realmMaterialFor already keep one file over.
const MATERIAL_FAMILY = Object.freeze({
  "stone-course": "stone", "slab": "stone", "moss-stone": "stone",
  "plank": "plank",
  "metal-panel": "metal",
  "bone": "mottle", "flesh": "mottle", "ice": "mottle", "asphalt": "mottle", "linoleum": "mottle"
});
function materialFamilyFor(material) { return MATERIAL_FAMILY[material] || "mottle"; }

// ─── tiny pure color helpers (no THREE.Color — this file stays GL-free, see header) ─────────────────
function mtHexToRgb(hex) {
  const h = String(hex || "#888888").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const v = Number.isFinite(n) ? n : 0x888888;
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}
function mtClampByte(v) { return v < 0 ? 0 : v > 255 ? 255 : Math.round(v); }
// writes one bounded-factor RGBA pixel into `data` at byte-index i (the ONE place a factor becomes
// real bytes — every painter below funnels through this, so the contrast-bound law only needs proving
// once: mtClampByte can only shrink |actual-base|/base, never grow it past the factor's own band).
function mtWritePixel(data, i, base, factor) {
  data[i] = mtClampByte(base.r * factor);
  data[i + 1] = mtClampByte(base.g * factor);
  data[i + 2] = mtClampByte(base.b * factor);
  data[i + 3] = 255;
}
// one bounded draw from `rng` (dspMulberry32's own [0,1) stream) -> a factor in [1-grain, 1+grain].
function mtFactor(rng, grain) { return 1 - grain + rng() * (2 * grain); }

// ─── painters — family name -> function; each returns {width,height,data:Uint8ClampedArray} ─────────
// STONE COURSE: staggered rows of square-ish blocks (odd rows offset half a block, the classic running-
// bond brick/stone pattern) + darker mortar lines at every block boundary + one independent jitter
// factor per block (picked once, cached, on first visit — the row-major pixel scan order below is
// itself deterministic, so the cache-population order is too).
function mtPaintStone(rng, baseHex, size, grain) {
  const base = mtHexToRgb(baseHex);
  const data = new Uint8ClampedArray(size * size * 4);
  const rows = 4, blockH = Math.max(1, Math.round(size / rows)), blockW = blockH;
  const mortarPx = Math.max(1, Math.round(size / 32));
  const blockFactors = {};
  for (let y = 0; y < size; y++) {
    const row = Math.floor(y / blockH);
    const stagger = (row % 2) ? Math.floor(blockW / 2) : 0;
    const yInBlock = y % blockH;
    for (let x = 0; x < size; x++) {
      const col = Math.floor((x + stagger) / blockW);
      const xInBlock = (x + stagger) % blockW;
      const isMortar = yInBlock < mortarPx || xInBlock < mortarPx;
      const key = row + "," + col;
      if (!(key in blockFactors)) blockFactors[key] = mtFactor(rng, grain);
      mtWritePixel(data, (y * size + x) * 4, base, isMortar ? (1 - grain) : blockFactors[key]);
    }
  }
  return { width: size, height: size, data };
}
// PLANK: horizontal boards + a darker seam at every board's top edge + thin deterministic grain
// streaks running along each board + one nail-dot per board (a single darkened texel near its own
// deterministic x) — all bounded to the same [1-grain,1+grain] band as every other painter.
function mtPaintPlank(rng, baseHex, size, grain) {
  const base = mtHexToRgb(baseHex);
  const data = new Uint8ClampedArray(size * size * 4);
  const boards = 6, boardH = Math.max(1, Math.round(size / boards));
  const seamPx = Math.max(1, Math.round(size / 48));
  const boardFactors = [], nailX = [];
  for (let b = 0; b <= boards; b++) { boardFactors.push(mtFactor(rng, grain)); nailX.push(Math.floor(rng() * size)); }
  for (let y = 0; y < size; y++) {
    const board = Math.min(boards, Math.floor(y / boardH));
    const yInBoard = y % boardH;
    const isSeam = yInBoard < seamPx;
    for (let x = 0; x < size; x++) {
      const isGrainLine = !isSeam && ((x + board * 7) % 11 === 0); // thin deterministic streak cadence
      const isNail = !isSeam && Math.abs(x - nailX[board]) < 1 && yInBoard === Math.floor(boardH / 2);
      let factor = boardFactors[board];
      if (isSeam || isNail) factor = 1 - grain;
      else if (isGrainLine) factor = Math.max(1 - grain, factor - grain * 0.4);
      mtWritePixel(data, (y * size + x) * 4, base, factor);
    }
  }
  return { width: size, height: size, data };
}
// METAL PANEL: a grid of panels + darker seams at every panel boundary + a brighter rivet square just
// inside each seam corner + a subtle per-row "brushed" jitter layered onto each panel's own factor
// (explicitly re-clamped to [1-grain,1+grain] after the layering, never just multiplied unbounded).
function mtPaintMetal(rng, baseHex, size, grain) {
  const base = mtHexToRgb(baseHex);
  const data = new Uint8ClampedArray(size * size * 4);
  const panels = 4, panelH = Math.max(1, Math.round(size / panels)), panelW = panelH;
  const seamPx = Math.max(1, Math.round(size / 48));
  const rivetPx = Math.max(1, Math.round(size / 24));
  const panelFactors = {};
  const rowJitter = [];
  for (let y = 0; y < size; y++) rowJitter.push((rng() * 2 - 1) * grain * 0.3);
  for (let y = 0; y < size; y++) {
    const prow = Math.floor(y / panelH), yInPanel = y % panelH;
    for (let x = 0; x < size; x++) {
      const pcol = Math.floor(x / panelW), xInPanel = x % panelW;
      const key = prow + "," + pcol;
      if (!(key in panelFactors)) panelFactors[key] = mtFactor(rng, grain);
      const isSeam = yInPanel < seamPx || xInPanel < seamPx;
      const isRivet = !isSeam && yInPanel >= seamPx && xInPanel >= seamPx
        && yInPanel < seamPx + rivetPx && xInPanel < seamPx + rivetPx;
      let factor;
      if (isSeam) factor = 1 - grain;
      else if (isRivet) factor = 1 + grain;
      else factor = Math.max(1 - grain, Math.min(1 + grain, panelFactors[key] + rowJitter[y]));
      mtWritePixel(data, (y * size + x) * 4, base, factor);
    }
  }
  return { width: size, height: size, data };
}
// MOTTLE (generic fallback): a coarse grid of independently-drawn factors, bilinearly interpolated per
// pixel — bilinear interpolation is a convex combination of 4 values already inside [1-grain,1+grain],
// so the result stays inside that band with no extra clamp needed. Smooth soft blotches — the "whisper
// of material" texture for any surface that doesn't earn a dedicated stone/plank/metal painter.
function mtPaintMottle(rng, baseHex, size, grain) {
  const base = mtHexToRgb(baseHex);
  const data = new Uint8ClampedArray(size * size * 4);
  const cells = 8, cellPx = Math.max(1, Math.round(size / cells));
  const grid = [];
  for (let gy = 0; gy <= cells; gy++) {
    const row = [];
    for (let gx = 0; gx <= cells; gx++) row.push(mtFactor(rng, grain));
    grid.push(row);
  }
  for (let y = 0; y < size; y++) {
    const gy = Math.min(cells - 1, Math.floor(y / cellPx));
    const fy = (y - gy * cellPx) / cellPx;
    for (let x = 0; x < size; x++) {
      const gx = Math.min(cells - 1, Math.floor(x / cellPx));
      const fx = (x - gx * cellPx) / cellPx;
      const top = grid[gy][gx] * (1 - fx) + grid[gy][gx + 1] * fx;
      const bot = grid[gy + 1][gx] * (1 - fx) + grid[gy + 1][gx + 1] * fx;
      mtWritePixel(data, (y * size + x) * 4, base, top * (1 - fy) + bot * fy);
    }
  }
  return { width: size, height: size, data };
}

const MATERIAL_PAINTERS = Object.freeze({ stone: mtPaintStone, plank: mtPaintPlank, metal: mtPaintMetal, mottle: mtPaintMottle });

/* materialTexturePixels(material, baseColorHex, seedStr, size, grainIntensity) -> {width,height,data}
   Pure + deterministic (this file's own header). `size` defaults to MATERIAL_TEXEL_PX (the shared
   one-texel-density constant); `grainIntensity` defaults to MATERIAL_GRAIN_DEFAULT. Never throws on an
   unknown material (materialFamilyFor's own mottle fallback). */
function materialTexturePixels(material, baseColorHex, seedStr, size, grainIntensity) {
  size = size || MATERIAL_TEXEL_PX;
  grainIntensity = grainIntensity != null ? grainIntensity : MATERIAL_GRAIN_DEFAULT;
  const seed = dspHashStr("gr1-material:" + material + ":" + baseColorHex + ":" + seedStr);
  const rng = dspMulberry32(seed);
  const painter = MATERIAL_PAINTERS[materialFamilyFor(material)];
  return painter(rng, baseColorHex, size, grainIntensity);
}

// ─── ES-module bridge (see theater-interior.js's own header note — top-level `const` never auto-
// attaches to `window`, only `var`/function declarations do; theater-boot.js's sealed ES-module scope
// can only reach these via `window.`) ─────────────────────────────────────────────────────────────
window.MATERIAL_TEXEL_PX = MATERIAL_TEXEL_PX;
window.materialTexturePixels = materialTexturePixels;
window.materialFamilyFor = materialFamilyFor;
