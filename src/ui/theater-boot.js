/* GENESIS MODULE — src/ui/theater-boot.js — BATTLE-THEATER T1 (docs/BATTLE-THEATER.md §2/§3/§7)
   + T1.5 PSX GRIT PASS (Adam's 2026-07-03 ruling: gritty PS1 — Vagrant Story surface feel, FFT
   board grammar; kill the clean/cartoon read).
   THE ONE ES-MODULE BOUNDARY FILE in Genesis. Everything else in this app is a classic <script>
   sharing global scope (CLAUDE.md: "ES-module migration is deferred (rides in with the eventual
   graphics engine)") — this file is that one sealed exception, loaded via
   `<script type="module" src="src/ui/theater-boot.js">` + an importmap resolving the bare "three"
   specifier to the vendored `vendor/three/three.module.js` (BATTLE-THEATER.md §2: "Classic scripts
   keep calling plain globals; module scope stays sealed inside the boot file"). It exposes exactly
   one classic-script-reachable surface: `window.Theater`.

   T1 scope (per the orchestrator's scope note on this unit): board render (tile columns, void
   background, orthographic camera + 90°-step rotation, flat Lambert materials, blob-shadow quads)
   + composed-cuboid FALLBACK figures for all five archetypes (biped/quadruped/flyer/serpent/swarm) —
   no glTF pack loading (T2), no verb/animation library beyond mount/setBoard/setUnits/rotate (T3),
   no terrain_change mutation replay (T4). Render-on-demand only: nothing repaints unless setBoard/
   setUnits/rotate/mount is called (SPEED-DOCTRINE hygiene, §2).

   T1.5 adds (this file only — theater-data.js's item-1 palette work is a separate, already-landed
   change this unit consumes): a LOW internal render resolution upscaled hard with CSS pixelation
   (the cheap robust PSX-blur route — no postprocessing chain), NearestFilter on every texture entry
   point, scene fog tuned so the far board edge just softens into the void, a per-env deep-void
   background (reads theaterBoardFrom's `env` field off the board data it's handed), an 80%-fill
   camera fit that's preserved across 90°-step rotation, 1.5x figure scale, VS-leaning (angular,
   longer-limbed, broader-shouldered, per-archetype-distinct) fallback figures, and a texture-hook
   surface (setTextures) that tints a manifest-supplied texture by the palette color instead of
   replacing the flat-color baseline outright.

   window.Theater = {
     mount(el)   -> bool. Creates the renderer/scene/camera inside `el`. Returns false (clean degrade,
                    no throw) if WebGL is unavailable or `el` is falsy — callers must treat a false
                    return as "the theater isn't here," never as an error to surface. Also attempts a
                    silent, best-effort fetch of assets/textures-psx/manifest.json (T1.5 item 4) —
                    a missing/failed fetch degrades to palette-only with no console error surfaced to
                    the caller (a 404 in dev tools is expected/harmless when the parallel asset unit
                    hasn't landed yet).
     setBoard(d) -> void. `d` is a theaterBoardFrom(...)-shaped {tiles,props,grid,env}. Rebuilds the
                    tile mesh + prop columns from scratch (T1 has no incremental diffing — boards are
                    cheap, a whole fight's tile count tops out at 12x9=108 tiles). Re-fits the camera
                    to the new board's bounding box (80% fill) and re-tints the void/fog from `env`.
     setUnits(u) -> void. `u` is a theaterUnitsFrom(...)-shaped {units:[...]}. Rebuilds unit figures
                    (fallback composed-cuboids, VS-proportioned, 1.5x scale x per-size scalar) + their
                    tinted base discs (G5 ROUND-1 ruling 2: a miniatures-style base — ember foe/gold
                    PC/blue ally — REPLACES the old flat black blob-shadow as the hostility signal).
     setTextures(manifest) -> void. `manifest` is a flat {"stone":path, ...} semantic-key map (T1.5
                    item 4). Loads each path via THREE.TextureLoader with NearestFilter/no mipmaps and
                    caches it; the next setBoard/setUnits call tints matched tile kinds by texture
                    instead of flat color. Safe to call before or after mount(); safe to call with an
                    absent/empty manifest (no-op, palette-only stays the baseline).
     rotate()    -> void. Steps the camera 90° around the board's vertical axis (BATTLE-THEATER §1
                    rule 4: "rotatable in 90° steps only"), preserving the current fit/zoom.
     zoom(dir)   -> number|false (THEATER-ZOOM-SPREAD). Steps the ortho camera in (dir>0) or out
                    (dir<0) by ZOOM_STEP_FACTOR (1.25x/step), clamped to [ZOOM_MIN,ZOOM_MAX]=[0.6,2.5]
                    as a multiplier on the board's own auto-fit viewSize. Persists across rotate()/
                    setBoard() re-fits (both re-derive viewSize as fittedViewSize*zoomLevel, never
                    reset zoomLevel itself except on an actual board-size-shape change). Returns the
                    resulting zoomLevel, or false pre-mount / on a zero/non-finite dir (no-op).
     retire()    -> void. Disposes geometries/materials/renderer + detaches the canvas. Safe to call
                    on an unmounted instance (no-op).
     play(verb,opts) -> bool (T3, docs/BATTLE-THEATER.md §4). Plays a named verb tween (advance/
                    withdraw/strike/hurt/down/cast/arc/knockback/sink/burst/flee/absurdity, plus the
                    `fx:<damageType>` addressable elemental bursts) — see src/ui/theater-verbs.js for
                    the full verb table + opts shape per verb. Returns false (no-op) for an unknown
                    verb or before mount(); never throws. Starts a tween-tick rAF loop that stops
                    itself the instant no tween remains live (render-on-demand preserved).
     verbs       -> the frozen THEATER_VERBS array (src/ui/theater-verbs.js) — every verb name play()
                    accepts, re-exported here for classic-script introspection.
   }

   Every method is null-safe pre-mount (calling setBoard/setUnits/rotate before a successful mount()
   is a no-op, not a throw) so a caller can wire these up before the mount gate resolves.

   T3 adds `play(verb, opts)` (docs/BATTLE-THEATER.md §4 — the verb library). ALL verb/tween logic
   lives in src/ui/theater-verbs.js (a SEPARATE module file, imported below) — this file only builds
   the small `ctx` object that module's playVerb/tickTweens need (live THREE handles, unit lookup,
   zone->world resolution reusing this file's OWN board-fit bookkeeping) and drives the tween tick
   loop, kept deliberately thin so parallel units editing this file's figure geometry / palette
   constants don't collide with the verb work (the orchestrator's file-split instruction for this
   wave). Render-on-demand is preserved end to end: play() schedules a frame only while >=1 tween is
   live (tickTweens' own return value gates whether another frame gets scheduled), so an idle theater
   goes back to fully event-driven rendering the instant the last tween completes. */
import * as THREE from "three";
import { playVerb, tickTweens, THEATER_VERBS, theaterFxFromLedger } from "./theater-verbs.js";
import * as Parts from "./theater-parts.js";

/* MODEL-GRAMMAR G1 (docs/MODEL-GRAMMAR.md §1/§2/§6): the archetype builders below are now THIN
   COMPOSITIONS over src/ui/theater-parts.js's pure part library via renderPartInto/flatTints (added
   just below the addTaperedLimb block — the composition engine the spec's §6 `buildFigureFromParts`
   language refers to; kept as two small named helpers here rather than one function, since this
   file's own material/PSX-shader construction stays centralized in addBox either way). Each build*
   function now calls renderPartInto(group, partFn, params, channelTints, offset) once per part
   instead of its old inline addBox/addTaperedLimb sequence — geometry stays visually equivalent (same
   box literals, now sourced from the part functions' own boxSpec calls, which were themselves lifted
   verbatim from these builders in theater-parts.js's authoring pass) so the PASS-2 visual output (box
   counts ±2, proportions) is unchanged; the preview page's "figures lineup" fixture (dev/theater-
   preview.html, fixture 4) is the visual gate. window.Theater's public surface is untouched — G2
   (recipes) is the unit that will expose anything new. */

/* ============================================================================
   T1.5 tunables. Boolean constants gate the STRETCH items (§ dither / vertex-snap) so a later pass
   (G9) can flip them without touching call sites — both default OFF (attempted only after the
   mandatory items are green, per the orchestrator's build order; landed/abandoned status reported
   at the end of the build). */
const PSX_DITHER_ENABLED = true;       // stretch: ordered-dither via onBeforeCompile fragment injection
const PSX_VERTEX_SNAP_ENABLED = true;  // stretch: clip-space vertex quantization via vertex injection
const PSX_VERTEX_SNAP_GRID = 96;       // clip-space quantization steps per axis (higher = subtler snap)
const PSX_DITHER_AMPLITUDE = 48.0;     // G9 tune 4: Bayer threshold divisor (DITHER_GLSL below) — was
                                        // 32.0 (a 1/32 nudge), which mushed the dark end into murk;
                                        // 48.0 is one notch weaker (~0.67x amplitude): still visibly
                                        // dithered, no longer mud at low luminance.

const CAM_ELEV_DEG = 35;
// G9 camera-yaw fix (docs/PRE-PLAYTEST-GAUNTLET.md §10b): the board's tile columns are plain
// axis-aligned boxes (setBoard's BoxGeometry, world X/Z grid) — an isometric/dimetric read is ENTIRELY
// a function of the camera sitting OFF that grid's axes. A yaw of exactly rotationStep*90° (the old
// math, with no offset) sits the camera dead-on one axis at every rotation step: it looks straight down
// a row, so only ONE side face of each tile column is ever visible and the board reads as a flat
// frontal wall (the regression this fix targets). +45° rotates the camera into the gap between axes —
// the classic FFT/dimetric camera — so two side faces are always visible and rows recede diagonally.
const CAM_YAW_OFFSET_DEG = 45;
// THEATER-ZOOM-SPREAD (Adam 2026-07-03: "still a little too zoomed out"): the default fit tightens
// from 0.90 -> 0.94 — placeCamera's viewSize is boardHalfExtent/CAM_FIT_MARGIN, so the margin fraction
// directly IS the board's fill fraction of the constraining canvas axis (a bigger margin -> a smaller
// viewSize -> the board covers more of the frame). 0.90 measured out to the orchestrator's ~88% report;
// 0.94 lands close to the requested ~92% without crowding the board against the canvas edge at any
// rotation step (verify-battle-stage's fixture-2 non-square-room overflow gate, G9 camera-yaw fix,
// still holds — this only rescales viewSize uniformly, it doesn't touch the yaw-aware footprint math).
const CAM_FIT_MARGIN = 0.94;
const TILE_SIZE = 1;          // world units per abstract tile (theater-data's x/z are already tile-indexed)
const TILE_GAP = 0.04;        // thin void seam between tile columns (reads as grid without a wireframe)
// G5 ROUND-1 (ruling 2): was the flat black blob-shadow's opacity; the base disc that REPLACES it
// (baseDiscMatFor, near unitTint below) reads at a higher, near-opaque value (0.85) — a miniatures
// base should read solid/present, not translucent like a soft-shadow blob — so this constant now
// documents that specific PSX-clean-disc opacity rather than the old shadow's dimmer 0.35.
const BASE_DISC_OPACITY = 0.85;
const FIGURE_SCALE = 1.5;      // §3 G9 tune: "figure scale ~1.5x current relative to tiles"

// THEATER-ZOOM-SPREAD — Theater.zoom(dir) step math: ortho zoom multiplies the FITTED viewSize by
// ZOOM_STEP_FACTOR per step (dir>0 = zoom IN = smaller viewSize = board looks bigger; dir<0 = zoom
// OUT), clamped to [ZOOM_MIN, ZOOM_MAX] as a multiplier on the board's own auto-fit viewSize (1.0 =
// the default fit, never a fixed absolute size — so the SAME zoom level still fits differently-sized
// boards proportionally). Persists across rotate()/setBoard() re-fits by being reapplied as a multiplier
// AFTER the fit recomputes viewSize from the board's current half-extents (placeCamera's own job),
// rather than stored as an absolute viewSize that would drift out of proportion on a board-size change.
const ZOOM_STEP_FACTOR = 1.25;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;
// small-board bias: Adam's "still a little too zoomed out" note, plus the observation that a small
// board (<=2 bands) reads even more distant than a large one at the SAME fit fraction (less geometry
// filling the same frame edge-to-edge) — bias the default one zoom step IN (viewSize *= 1/ZOOM_STEP_FACTOR)
// for boards at or under this band count, applied once per setBoard() call (not compounding on repeat
// calls with the same small board — see setBoard's own zoomLevel reset-to-bias logic below).
const SMALL_BOARD_BAND_THRESHOLD = 2;

/* G5 ROUND-1 (ruling 3, the small-figure fix): "a Small-size figure (goblin) renders its weapon
   visibly DETACHED beside it — likely the size scalar applies to the body but not the anchor offset."
   Before this pass NO size scalar existed at all (recipe.size was generated/carried but never read
   anywhere in this file) — every figure rendered at the same uniform FIGURE_SCALE regardless of its
   recipe's own size field, which is a real bug in its own right (a Small goblin should read visibly
   smaller than a Large ogre) and is ALSO the root of the detached-weapon symptom once a size scalar
   gets added carelessly: since renderPartInto composes a weapon module as a CHILD of the same THREE
   .Group its body boxes go into (both under one group-level scale), scaling the WHOLE group by a
   single size factor keeps body+weapon seated together automatically — there is no separate "anchor
   offset" transform that could drift out of sync UNLESS a size scalar were (wrongly) applied only to
   the body's own boxes post-hoc rather than to the group. SIZE_SCALE is applied at the group level
   (setUnits, alongside FIGURE_SCALE) for exactly this reason: one multiply, body and weapon both, by
   construction. */
const SIZE_SCALE = {
  tiny: 0.6, small: 0.82, medium: 1, large: 1.35, huge: 1.7, gargantuan: 2.2
};
function sizeScaleFor(size){
  const s = (size || "medium").toLowerCase();
  return SIZE_SCALE[s] != null ? SIZE_SCALE[s] : 1;
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
let PIXEL_SKIN_ENABLED = true;         // the dev A/B toggle (window.Theater.pixelSkin mirrors this)

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

// clamp a channel byte to [0,255].
function clamp255(v){ return v < 0 ? 0 : (v > 255 ? 255 : v | 0); }
// hex color number (e.g. 0x7d7048) -> {r,g,b} bytes. Accepts a THREE color-ish number only (every
// caller passes a resolved numeric channel color); a null/undefined color defaults to a mid grey so
// the texture never throws on a channel that resolved to "use base tint" null upstream (that case is
// already substituted with the real base tint before reaching here, but belt-and-suspenders).
function hexToRGB(hex){
  const n = (typeof hex === "number" && isFinite(hex)) ? (hex & 0xffffff) : 0x808080;
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}
function rgbToHex(r, g, b){ return (clamp255(r) << 16) | (clamp255(g) << 8) | clamp255(b); }
// scale an {r,g,b} toward black/white by `f` (f<1 darker, f>1 lighter), clamped.
function scaleRGB(c, f){ return { r: c.r * f, g: c.g * f, b: c.b * f }; }
// Rec.601 luma in [0,1] for an {r,g,b}-bytes color.
function lumaOf(c){ return (c.r * 0.299 + c.g * 0.587 + c.b * 0.114) / 255; }

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
function buildPixelSkinCanvas(colorHex, seed){
  const size = PIXEL_SKIN_TEX_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const data = img.data;
  const base = hexToRGB(colorHex);
  // three value bands, bracketing the base (top-lit): band 2 (upper) lighter, band 0 (lower) darker.
  const bands = [ scaleRGB(base, 0.80), base, scaleRGB(base, 1.18) ];
  const rand = mulberry32(seed);
  // precompute per-texel speckle decisions from the SAME stream, in a fixed order, so the speckle
  // pattern is deterministic per (part,color,variant). ~7% of texels get a dirt fleck.
  const speckle = new Uint8Array(size * size);
  for(let i = 0; i < size * size; i++){ speckle[i] = rand() < 0.07 ? 1 : 0; }
  for(let y = 0; y < size; y++){
    // vertical band selection: TOP of the texture (y small) is lit, so it biases toward the lighter
    // band; the bottom biases darker. A 3-way split by vertical thirds gives the top-lit read.
    const vt = y / (size - 1);            // 0 at top, 1 at bottom
    for(let x = 0; x < size; x++){
      // base band index by vertical position (top-lit): top third -> lighter(2), mid -> base(1),
      // bottom third -> darker(0).
      let bandIdx = vt < 0.34 ? 2 : (vt < 0.67 ? 1 : 0);
      // ordered dither: nudge the band boundary by the Bayer threshold so the transition between
      // bands is dithered rather than a hard line (the ±~6% value wobble L2 calls for). The Bayer
      // cell in [0,1) is compared against the texel's fractional distance into its third.
      const bayer = PIXEL_SKIN_BAYER4[(y % 4) * 4 + (x % 4)] / 16; // [0,1)
      const frac = (vt < 0.34 ? (vt / 0.34) : (vt < 0.67 ? ((vt - 0.34) / 0.33) : ((vt - 0.67) / 0.33)));
      // near a band's lower edge, dither DOWN into the next-darker band on ~half the cells; near the
      // upper edge, dither UP — a symmetric ±1-band ordered-dither seam.
      if(frac < 0.5 && bandIdx > 0 && bayer > frac * 2) bandIdx -= 1;
      else if(frac > 0.5 && bandIdx < 2 && bayer > (1 - frac) * 2) bandIdx += 1;
      let col = bands[bandIdx];
      // worn-edge paint (zero geometry): the very top texel row is a lighter highlight, the very
      // bottom row a darker underside — the goblin reference's painted edges.
      if(y === 0) col = scaleRGB(base, 1.32);
      else if(y === size - 1) col = scaleRGB(base, 0.66);
      // a subtle per-texel value jitter (±~5%) off the PRNG so no two texels in a band are identical
      // (kills the flat-fill look); deterministic since `rand` is seeded.
      const jitter = 1 + (rand() - 0.5) * 0.10;
      let r = col.r * jitter, g = col.g * jitter, b = col.b * jitter, a = 255;
      // sparse dirt speckle: a low-alpha darker fleck blended over the texel (still fully opaque in
      // alpha — we darken the RGB rather than punch a hole, so the figure never shows through).
      if(speckle[y * size + x]){ r *= 0.72; g *= 0.72; b *= 0.72; }
      const o = (y * size + x) * 4;
      data[o] = clamp255(r); data[o + 1] = clamp255(g); data[o + 2] = clamp255(b); data[o + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* the cached CanvasTexture factory. Key = partName:colorHex:variantKey (the exact tuple the brief
   names). One CanvasTexture per distinct triple; NearestFilter + no mipmaps (L2: "NearestFilter, no
   mips") applied via the same nearestify() helper every other texture entry point uses. Returns a
   THREE.Texture. On any failure (should never happen once capable) returns null so figureMaterialFor
   cleanly falls back to flat color. */
const PIXEL_SKIN_CACHE = {};
function pixelSkinTextureFor(colorHex, skinKey){
  const key = skinKey + ":" + (colorHex >>> 0).toString(16);
  const hit = PIXEL_SKIN_CACHE[key];
  if(hit) return hit;
  let tex = null;
  try {
    const canvas = buildPixelSkinCanvas(colorHex, pixelSkinHash(key));
    tex = new THREE.CanvasTexture(canvas);
    nearestify(tex);          // NearestFilter mag+min, generateMipmaps=false (L2)
    tex.colorSpace = THREE.SRGBColorSpace; // the canvas RGB bytes are authored in sRGB, like a PNG
  } catch(e){ tex = null; }
  PIXEL_SKIN_CACHE[key] = tex;
  return tex;
}

/* reverse map: a part FUNCTION -> its §1 kebab-case registry name, so renderPartInto (which is
   handed a partFn, not a name) can build the pixel-skin cache/seed key without every call site
   passing a name string. Built once off the frozen Parts.PARTS registry. A partFn not in the
   registry (a raw inline box in a builder that doesn't go through PARTS) maps to "" — the skin key
   then leans on the color+variant alone, still deterministic, just not part-name-scoped. */
const PART_NAME_BY_FN = (function(){
  const m = new Map();
  const reg = (Parts && Parts.PARTS) || {};
  Object.keys(reg).forEach(function(name){ m.set(reg[name], name); });
  return m;
})();
function partNameOf(partFn){ return PART_NAME_BY_FN.get(partFn) || ""; }

/* THE MATERIAL FUNNEL. Given a resolved color (numeric hex), an optional opacity (<1 = translucent),
   and a skinKey (partName:variantKey context the caller threads down — see renderPartInto/addBox),
   returns the MeshLambertMaterial for one figure box. When pixel-skin is enabled AND canvas-2D is
   available AND a texture builds, the material carries the procedural CanvasTexture map with a white
   base color (so the baked texel colors pass through 1:1); otherwise it's the EXACT pre-Unit-1 flat
   `new MeshLambertMaterial({color})` path — byte-identical to before this unit for every headless/
   toggled-off caller. PSX shader tweaks (dither/vertex-snap) still apply on top via applyPsxShaderTweaks,
   same as every other material this file builds. Translucent (opacity<1) is honored on both paths
   identically (transparent+depthWrite off), so the ghost/spectral read is unchanged. */
function figureMaterialFor(color, opacity, skinKey){
  const translucent = opacity != null && opacity < 1;
  // ALBEDO FLOOR (director intel): lift/cap the resolved base color into the visible desaturated band
  // BEFORE it becomes either a pixel-skin texture base or a flat material color, so BOTH render paths
  // get the same guarantee (a figure never resolves to a black column). A numeric color only — a null
  // (channel resolved to "use base tint") is already substituted with a real tint upstream, but guard
  // anyway so albedoFloor never sees a non-number.
  if(typeof color === "number" && isFinite(color)) color = albedoFloor(color);
  const usePixel = PIXEL_SKIN_ENABLED && pixelSkinCapable();
  let matOpts;
  if(usePixel){
    const tex = pixelSkinTextureFor(color, skinKey || ("c:" + (color >>> 0).toString(16)));
    if(tex){
      // white base color so the CanvasTexture's own baked colors show through unmodified (Lambert
      // multiplies map*color); the texture already carries the channel color + shading.
      matOpts = { color: 0xffffff, map: tex };
    } else {
      matOpts = { color }; // texture build failed — flat color, never a missing-material throw
    }
  } else {
    matOpts = { color }; // pixel-skin off / headless — the exact pre-Unit-1 flat path
  }
  if(translucent){ matOpts.transparent = true; matOpts.opacity = opacity; matOpts.depthWrite = false; }
  return applyPsxShaderTweaks(new THREE.MeshLambertMaterial(matOpts));
}

// PSX low-res internal render: the renderer's DRAWING BUFFER is sized to this fraction of the
// canvas's CSS size, then the canvas is stretched back up via CSS with `image-rendering:pixelated`
// (the cheap robust route the spec calls for — "no postprocessing chain"). 1/3 per the build note.
const PSX_RES_SCALE = 1 / 3;

// fog: near-black, distance-tuned so the far board edge just softens (never fully hides the back
// row — a 12x9 board's farthest tile sits well inside FOG_FAR at the default camera distance).
const FOG_NEAR = 14;
const FOG_FAR = 40;

// This module is a sealed ES-module scope (§2) — it never reads theater-data.js's classic-script
// globals (THEATER_ENV_PALETTE et al). It only ever consumes the PLAIN DATA those functions return
// (setBoard's `data.env`/tile `.tint` fields already carry every color decision) — this local fallback
// is only the pre-setBoard mount-time default before any real board has been handed over, matching
// theater-data.js's own THEATER_DEFAULT_ENV value by convention (kept in sync by naming, not import).
const THEATER_DEFAULT_ENV_FALLBACK = "dungeon";
const VOID_BG = 0x0a0908; // matches theater-data's dungeon palette voidTint — overridden per-env in setBoard

// tile kind -> the manifest's semantic texture key it prefers (theaterBoardFrom's kind vocabulary,
// src/engine/theater-data.js). A kind with no matching manifest entry stays palette-only (the no-
// asset baseline never regresses — §4: "palette-only remains the no-asset baseline").
const TILE_KIND_TEXTURE_KEY = {
  floor: "stone", elevated: "stone", hazard: "scorch", water: "water"
};

const ARCHETYPE_BUILDERS = {
  biped: buildBiped,
  quadruped: buildQuadruped,
  flyer: buildFlyer,
  serpent: buildSerpent,
  swarm: buildSwarm,
  giant: buildGiant,
  ooze: buildOoze,
  arachnid: buildArachnid,
  "amorphous-horror": buildAmorphousHorror
};

/* ============================================================================
   Fallback composed-cuboid figures (BATTLE-THEATER §3: "3-8 boxes each" in T1; PASS 2, 2026-07-03,
   raises that budget — "keep every figure under ~24 boxes" — to afford separated head/torso/pelvis,
   tapered stacked-segment limbs, and slight per-box rotations so a figure reads as a STANCED
   miniature, not a totem of bricks, at a 100px-tall render (§3's explicit test). Deterministic —
   every builder is a pure function of a seed number (from theaterWithinZoneOffset's hash, so a given
   unit id always composes the same figure) plus this pass's new inputs (silhouette, weapon) — no
   Math.random anywhere in this file. Colors are flat per-kind tints (pc/ally/foe distinguished by the
   caller via a group-level material tint, not baked into the geometry here) — T1.5 setUnits also
   applies a texture material when one is loaded for the "prop"-adjacent unit tint key, but the
   geometry/proportions below are untouched by that (textures ride on top of shape).

   PASS 2 additions (9 archetypes total, up from 5): giant (huge biped, massive shoulders, 1.5-2 tile
   read), ooze (low wide stacked-shrinking blob), arachnid (low body + 6-8 angled leg slabs),
   amorphous-horror (asymmetric mass + tentacle slabs) — plus every existing archetype gets a
   de-blocking pass: separated head/torso/pelvis instead of one torso slab, tapered (stacked-shrinking)
   limb segments instead of single uniform boxes, and small deterministic rotations on limb/stance
   boxes (a slight lean, a canted weapon, an asymmetric stance) so nothing stands at rigid attention.
   ============================================================================ */
function seededJitter(seed, i, spread){
  // tiny deterministic pseudo-jitter so repeated boxes in one figure don't look copy-pasted identical;
  // NOT a security/statistical RNG, just a cheap hash -> [-spread, spread] mapper.
  const h = Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453);
  return ((h - Math.floor(h)) * 2 - 1) * spread;
}

/* G5 ROUND-1 (ruling 4, translucent): `opacity` is an OPTIONAL 8th arg (undefined/1 = fully opaque,
   the pre-existing default every other caller keeps getting) — a figure-level translucent flag
   (buildFigureFromRecipe, see its own G5 comment) passes ~0.45 down through every box this function
   creates for that figure. transparent/depthWrite only toggle when opacity is actually < 1, so an
   opaque figure's material stays byte-identical to before this ruling (no behavior change for the
   overwhelming majority of figures that never carry `translucent`). */
/* UNIT 1: `skinKey` is an OPTIONAL 13th arg (partName:variantKey context the caller threads for the
   pixel-skin cache/seed — undefined for the handful of raw inline boxes that don't route through a
   part function, e.g. buildFlyer's own body/beak core; those fall back to a color-only skin key, still
   deterministic). Material construction now goes through figureMaterialFor (the one funnel): pixel-skin
   CanvasTexture when capable+enabled, the exact pre-Unit-1 flat-color material otherwise. */
function addBox(group, w, h, d, x, y, z, color, rotY, rotX, rotZ, opacity, skinKey){
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = figureMaterialFor(color, opacity, skinKey);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  if(rotY) mesh.rotation.y = rotY;
  if(rotX) mesh.rotation.x = rotX;
  if(rotZ) mesh.rotation.z = rotZ;
  group.add(mesh);
  return mesh;
}

/* a tapered stacked-segment limb: N shrinking boxes stacked bottom-to-top (or top-to-bottom, via
   `dir`), each segment slightly narrower than the last — the "de-block" answer to a single uniform
   leg/arm box (BATTLE-THEATER pass 2: "tapered limbs (stacked shrinking segments)"). `baseW`/`baseD`
   are the widest (root) segment's footprint; `taper` is the per-segment shrink factor (0.8 = each
   segment is 80% of the previous one's width/depth). Returns the total length consumed so callers can
   place the next joint above/below it. `tiltZ`/`tiltX` apply ONE shared small rotation to every
   segment in the limb (a slight outward cant or forward bend), not a per-segment random wobble —
   keeps the limb reading as one coherent angled piece, not a jittery stack. */
function addTaperedLimb(group, segCount, baseW, baseD, segLen, x, yStart, z, color, dir, tiltZ, tiltX){
  dir = dir || 1; // 1 = stack upward from yStart, -1 = stack downward
  let y = yStart;
  let w = baseW, d = baseD;
  const taper = 0.82;
  for(let i = 0; i < segCount; i++){
    const segY = y + (dir * segLen) / 2;
    addBox(group, w, segLen, d, x, segY, z, color, 0, tiltX || 0, tiltZ || 0);
    y += dir * segLen;
    w *= taper; d *= taper;
  }
  return Math.abs(segLen * segCount);
}

/* ============================================================================
   MODEL-GRAMMAR G1 (docs/MODEL-GRAMMAR.md §1/§2/§6) — buildFigureFromParts: the composition engine
   that turns theater-parts.js's pure {box,pos,rot,taper?,channel} arrays into real THREE meshes,
   reusing THIS file's own addBox (so PSX shader tweaks / material construction stay in exactly one
   place, unchanged). A part's boxes are authored in PART-LOCAL space; `offset`/rot let a caller place
   an attached module at its body's anchor transform (§2) — the archetype builders below pass the
   body's own `.anchors` entries straight through, so a module composes exactly where the body
   contract says it should. `channelTints` maps a part's semantic channel name (skin/armor/weapon/
   accent/glow) to an actual color for THIS figure — archetype builders below pass a single-tint map
   (every channel -> the same figure tint) to stay pixel-identical to the pre-G1 single-tint-per-
   figure baseline; a later recipe/loadout-mirror unit can pass a richer per-channel map without this
   function changing at all. */
/* G5 ROUND-1 (ruling 4): `opacity` is an optional 7th arg, threaded straight through to every
   addBox call this function makes (undefined = fully opaque, unchanged for every existing caller —
   only buildFigureFromRecipe passes a real value, and only for a recipe carrying `translucent`). */
/* UNIT 1: `variantKey` is an OPTIONAL 8th arg — the per-FIGURE context (recipe slug / archetype+seed
   bucket / "pc"/"ally"/"foe" kind) the caller threads so the pixel-skin cache key is
   partName:channel:variantKey (the brief's (part, palette, variant) triple). A caller that omits it
   (every pre-Unit-1 call site until they're updated) gets a stable "" variant — the skin is then keyed
   by part+channel-color alone, which is still fully deterministic and correctly shared across figures
   of the same species; variantKey only SUBDIVIDES the cache further when a caller wants a per-figure
   distinct skin. Kept optional so this is a purely additive thread — no existing call site breaks. */
function renderPartInto(group, partFn, params, channelTints, offset, rotOffset, opacity, variantKey){
  offset = offset || { x: 0, y: 0, z: 0 };
  rotOffset = rotOffset || { x: 0, y: 0, z: 0 };
  const boxes = partFn(params || {});
  const cosY = Math.cos(rotOffset.y || 0), sinY = Math.sin(rotOffset.y || 0);
  const partName = partNameOf(partFn);
  const vKey = variantKey || "";
  boxes.forEach(function(b){
    // rotate the box's local x/z by the anchor's yaw (rotOffset.y) before translating by offset —
    // matches how a module attaches to a body anchor with its own orientation (§2's `rot` transform).
    // x/z-tilt anchors (rare in this unit's own anchor set) are applied as a straight rotation add,
    // not a full matrix compose — sufficient for the axis-aligned attachments this library uses today.
    const lx = b.pos.x, lz = b.pos.z;
    const rx = lx * cosY - lz * sinY;
    const rz = lx * sinY + lz * cosY;
    const x = rx + offset.x, y = b.pos.y + offset.y, z = rz + offset.z;
    const rotY = (b.rot.y || 0) + (rotOffset.y || 0);
    const rotX = (b.rot.x || 0) + (rotOffset.x || 0);
    const rotZ = (b.rot.z || 0) + (rotOffset.z || 0);
    const channel = b.channel || "skin";
    const color = (channelTints && channelTints[channel] != null) ? channelTints[channel] : (channelTints && channelTints.skin);
    // UNIT 1: the pixel-skin cache/seed key is partName:channel:variantKey — the (part, palette-slot,
    // variant) triple the brief names (the resolved channel COLOR is appended inside figureMaterialFor,
    // so the same part+channel under two different palettes correctly mints two textures).
    const skinKey = partName + ":" + channel + ":" + vKey;
    addBox(group, b.box.w, b.box.h, b.box.d, x, y, z, color, rotY, rotX, rotZ, opacity, skinKey);
  });
}

/* a flat single-tint channel map — every §5 channel resolves to the SAME figure tint, matching the
   pre-G1 baseline (theater-boot.js has never had per-channel coloring; that's a later recipe-unit
   concern, §5's "the theater resolves channels through the active palette stack"). */
function flatTints(tint){
  return { skin: tint, armor: tint, weapon: tint, accent: tint, glow: tint };
}

/* biped: VS-leaning, PASS 2 de-blocked — separate head/torso/pelvis (was one torso slab), tapered
   stacked-segment legs+arms (was a single uniform box per limb), a slight asymmetric stance (weight
   on the left leg, right leg canted) instead of both legs standing dead-straight at attention, and a
   canted weapon-slab off the right hand shaped by `weapon` (§3 CLASS SILHOUETTES/WEAPON SHAPES — see
   weaponMeshFor below). `silhouette` (martial/ranger/caster/cleric, PC/ally only; undefined for foes)
   nudges the stance: caster gets a flared robe-skirt lower body instead of a pelvis box + legs;
   cleric gets a shield slab on the off-hand; ranger gets a lower crouched stance (torso/head dropped,
   knees bent via a sharper leg-segment angle). ~13-16 boxes depending on silhouette/weapon, well
   under the 24-box budget. */
/* MODEL-GRAMMAR G1: thin composition over theater-parts.js — torso-biped (the 4-box head/torso/
   shoulder/pelvis core, within the §1 <=6-box-per-part budget) + 2x leg-tapered (or, for the caster
   silhouette, robe-skirt swaps in for pelvis+legs) + 2x arm-tapered + an optional weapon/shield
   module, anchored at torso-biped's own §2 anchor set. Visually equivalent to the pre-G1 inline
   version (same box literals, now sourced from the part functions, legs/arms split into their own
   reusable limb parts). */
function buildBiped(seed, tint, silhouette, weapon){
  const g = new THREE.Group();
  const crouch = silhouette === "ranger" ? 0.06 : 0; // ranger/rogue: lower stance
  const stanceTilt = 0.05 + seededJitter(seed, 0, 0.02); // slight deterministic weight-shift, per-figure
  const tints = flatTints(tint);
  const anchors = Parts.torsoBiped.anchors;

  if(silhouette === "caster"){
    // caster: head/torso/shoulder-bar ONLY from torso-biped's own boxes (its own core's 4th box is a
    // pelvis — SKIPPED here since robe-skirt supplies its own pelvis/hip box in the exact same
    // position, trading torso-biped's bare pelvis for robe-skirt's flared trapezoid-read lower body,
    // matching the original's exact branch: a caster reads by NOT having leg-gaps).
    const headTorsoShoulder = Parts.torsoBiped({ crouch, stanceTilt }).slice(0, 3);
    headTorsoShoulder.forEach(function(b){
      addBox(g, b.box.w, b.box.h, b.box.d, b.pos.x, b.pos.y, b.pos.z, tints[b.channel] || tint, b.rot.y, b.rot.x, b.rot.z);
    });
    renderPartInto(g, Parts.robeSkirt, { crouch }, tints, { x: 0, y: 0, z: 0 });
  } else {
    renderPartInto(g, Parts.torsoBiped, { crouch, stanceTilt }, tints, { x: 0, y: 0, z: 0 });
    // legs: leg-tapered x2 (source params factored out onto torso-biped.legParams so the exact
    // thigh/shin literals live next to the body they came from, not duplicated at this call site).
    renderPartInto(g, Parts.legTapered, Parts.torsoBiped.legParams(-1, crouch, stanceTilt), tints, { x: 0, y: 0, z: 0 });
    renderPartInto(g, Parts.legTapered, Parts.torsoBiped.legParams(1, crouch, stanceTilt), tints, { x: 0, y: 0, z: 0 });
  }

  // arms: arm-tapered x2 (left/right), anchored at torso-biped's own `shoulders` transform (which is
  // {0,0,0}-offset by convention here — arm-tapered's own params already carry the absolute biped arm
  // position, matching §2's "modules declare which anchor they expect" while staying pixel-identical).
  renderPartInto(g, Parts.armTapered, { side: -1, tiltZ: 0.16, crouch }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.armTapered, { side: 1, tiltZ: -0.16, crouch }, tints, { x: 0, y: 0, z: 0 });

  const weaponMesh = weaponMeshFor(weapon, tint);
  if(weaponMesh){ weaponMesh.position.y -= crouch; g.add(weaponMesh); }
  if(silhouette === "cleric"){
    // off-hand shield slab: shield-slab's own box already carries the final rotY=0.15 (matching the
    // anchor's own rotation), so only POSITION offsets by the anchor here — passing rotOffset too
    // would double-apply the rotation (shieldSlab's internal ry + the anchor's own ry).
    renderPartInto(g, Parts.shieldSlab, {}, tints, { x: anchors.offHand.pos.x, y: anchors.offHand.pos.y - crouch, z: anchors.offHand.pos.z });
  }
  return g;
}

/* quadruped: low, long-bodied, PASS 2 de-blocked — separate head/snout/neck (was head+snout only),
   tapered 2-segment legs (was single uniform boxes) with the rear haunch pair carrying a sharper
   angle for the "predator crouch" read. ~10 boxes. */
/* MODEL-GRAMMAR G1: torso-quad (body/neck/head/snout core) + 4x leg-tapered (front pair tilts on X,
   rear/haunch pair tilts on Z — see leg-tapered's own params doc). */
function buildQuadruped(seed, tint){
  const g = new THREE.Group();
  const tints = flatTints(tint);
  renderPartInto(g, Parts.torsoQuad, {}, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.legTapered, { baseW: 0.085, segLen: 0.15, x: -0.3, z: -0.12, yStart: 0.02, tiltX: 0.05 }, tints, { x: 0, y: 0, z: 0 });   // front-left
  renderPartInto(g, Parts.legTapered, { baseW: 0.085, segLen: 0.15, x: -0.3, z: 0.12, yStart: 0.02, tiltX: -0.05 }, tints, { x: 0, y: 0, z: 0 });   // front-right
  renderPartInto(g, Parts.legTapered, { baseW: 0.095, segLen: 0.19, x: 0.26, z: -0.13, yStart: 0.02, tiltZ: 0.18 }, tints, { x: 0, y: 0, z: 0 });   // rear-left, haunch
  renderPartInto(g, Parts.legTapered, { baseW: 0.095, segLen: 0.19, x: 0.26, z: 0.13, yStart: 0.02, tiltZ: -0.18 }, tints, { x: 0, y: 0, z: 0 });   // rear-right, haunch
  return g;                                                                  // 8 boxes
}

/* flyer: slim vertical body, PASS 2 de-blocked — separate head/beak, 2-part swept wings (root+tip,
   each angled a bit more than the last for a real wing-bend instead of one flat slab) + a forked
   tail. ~9 boxes. */
/* MODEL-GRAMMAR G1: the flyer's slim body+head+beak core has NO listed §1 body precedent (the
   inventory's body list is biped/biped-huge/quad/blob/thorax-abdomen/serpent/swarm/horror-mass —
   no dedicated flyer torso), so it stays a small inline core (3 boxes, unchanged from T1/PASS-2)
   while the wings (2x wing-slab) and tail (2x single-segment tail-segments, reproducing the fork
   half exactly via tail-segments' x/yBase/zStart/rz overrides) move to their listed §1 parts. */
function buildFlyer(seed, tint){
  const g = new THREE.Group();
  const tints = flatTints(tint);
  addBox(g, 0.2, 0.3, 0.2, 0, 0.7, 0, tint);                                // body — slim, vertical
  addBox(g, 0.14, 0.14, 0.16, 0, 0.96, 0.08, tint, 0.05);                   // head
  addBox(g, 0.08, 0.06, 0.1, 0, 1.0, 0.2, tint);                            // beak stub
  renderPartInto(g, Parts.wingSlab, { side: -1 }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.wingSlab, { side: 1 }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.tailSegments, { segCount: 1, baseW: 0.06, x: -0.05, yBase: 0.38, zStart: -0.28, rz: 0.18 }, tints, { x: 0, y: 0, z: 0 }); // tail fork left
  renderPartInto(g, Parts.tailSegments, { segCount: 1, baseW: 0.06, x: 0.05, yBase: 0.38, zStart: -0.28, rz: -0.18 }, tints, { x: 0, y: 0, z: 0 }); // tail fork right
  return g;                                                                  // 9 boxes
}

/* MODEL-GRAMMAR G1: serpent-coil, split across TWO calls (segments 0-3, 4-6) to respect the part's
   <=6-box budget — totalSegs=7 keeps the taper/spacing math identical to the pre-split single loop,
   so the two halves read as one continuous coil. Seeded via zSeed/yawSeed arrays (unit-normalized
   [-1,1] hashes — the part itself applies the same 0.02/0.08 spread scale seededJitter used to apply
   internally, per §1's "seeding happens at recipe level" rule: this builder is now the caller that
   owns the seed). */
function buildSerpent(seed, tint){
  const g = new THREE.Group();
  const totalSegs = 7;
  const zSeed = [], yawSeed = [];
  for(let i = 0; i < totalSegs; i++){ zSeed.push(seededJitter(seed, i, 1)); yawSeed.push(seededJitter(seed, i + 30, 1)); }
  const tints = flatTints(tint);
  renderPartInto(g, Parts.serpentCoil, { totalSegs, startIdx: 0, count: 4, zSeed: zSeed.slice(0, 4), yawSeed: yawSeed.slice(0, 4) }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.serpentCoil, { totalSegs, startIdx: 4, count: 3, zSeed: zSeed.slice(4), yawSeed: yawSeed.slice(4) }, tints, { x: 0, y: 0, z: 0 });
  return g;                                                     // 7 boxes
}

/* MODEL-GRAMMAR G1: swarm-scatter, seeded via a `ring` array of {r,s,y,rot} per-element unit-
   normalized hashes, matching buildSwarm's original seededJitter spreads (r:0.06, s:0.03, y:0.1,
   rot:0.4) — swarm-scatter's own boxSpec math re-applies those same spreads. */
/* MODEL-GRAMMAR G1: swarm-scatter, split across TWO calls (elements 0-4, 5-8) to respect the part's
   <=6-box budget — totalN=9 keeps the ring-angle math identical to the pre-split single ring, so the
   two halves land on the SAME shared ring, not two independently-spaced smaller rings. Seeded via a
   `ring` array of {r,s,y,rot} per-element unit-normalized hashes, matching buildSwarm's original
   seededJitter spreads (r:0.06, s:0.03, y:0.1, rot:0.4). */
function buildSwarm(seed, tint){
  const g = new THREE.Group();
  const totalN = 9;
  const ring = [];
  for(let i = 0; i < totalN; i++){
    ring.push({
      r: seededJitter(seed, i, 0.06),
      s: seededJitter(seed, i + 50, 0.03),
      y: seededJitter(seed, i + 100, 0.1),
      rot: seededJitter(seed, i + 60, 0.4)
    });
  }
  const tints = flatTints(tint);
  renderPartInto(g, Parts.swarmScatter, { totalN, startIdx: 0, count: 5, ring: ring.slice(0, 5) }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.swarmScatter, { totalN, startIdx: 5, count: 4, ring: ring.slice(5) }, tints, { x: 0, y: 0, z: 0 });
  return g;                                                      // 9 boxes
}
/* NEW ARCHETYPE — giant: huge biped, massive shoulders, 1.5-2 tile stand-tall read (Adam: "huge
   biped, 1.5-2 tiles tall, massive shoulders"). Built from the same de-blocked biped vocabulary
   (separate head/torso/pelvis, tapered limbs) but every proportion is scaled up and the shoulder bar
   is dramatically wider/thicker than a biped's — the mass differential IS the archetype, not just a
   uniform scale-up of buildBiped (a giant needs to read distinctly bulkier even next to a scaled biped,
   so shoulder/torso width grows faster than height). No weapon slab by default (a bare massive-fist
   read); a foe-side weapon (club/mace/axe are common giant weapons) still composes via weaponMeshFor
   when the bestiary action text supplies one. ~11 boxes. */
/* MODEL-GRAMMAR G1: torso-biped-huge (head/torso/shoulder/pelvis/legs/arms, all 12 boxes — see that
   part's own header for the exact addTaperedLimb-equivalent leg/arm math). */
/* MODEL-GRAMMAR G1: torso-biped-huge (4-box core) + 2x leg-tapered + 2x arm-tapered, via the body's
   own .legParams/.armParams factories (see theater-parts.js for the exact source literals). */
function buildGiant(seed, tint, silhouette, weapon){
  const g = new THREE.Group();
  const lean = seededJitter(seed, 0, 0.04); // slight deterministic hunch/lean, never dead-upright
  const tints = flatTints(tint);
  renderPartInto(g, Parts.torsoBipedHuge, { lean }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.legTapered, Parts.torsoBipedHuge.legParams(-1), tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.legTapered, Parts.torsoBipedHuge.legParams(1), tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.armTapered, Parts.torsoBipedHuge.armParams(-1), tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.armTapered, Parts.torsoBipedHuge.armParams(1), tints, { x: 0, y: 0, z: 0 });
  // G5 ROUND-1 (ruling 3): seat the giant's weapon at ITS OWN arm anchor (torsoBipedHuge.anchors.
  // mainHand, x=0.5/y=0.42) instead of inheriting biped's smaller-figure default offset — the giant's
  // arm-tapered call sits at a completely different x/y than the biped's, so reusing WEAPON_BASE_OFFSET
  // here was the other half of the "disconnected" read (a correctly-anchored biped weapon would still
  // float beside a giant's actual hand).
  const giantHandOffset = { x: Parts.torsoBipedHuge.anchors.mainHand.pos.x,
    y: Parts.torsoBipedHuge.anchors.mainHand.pos.y, z: Parts.torsoBipedHuge.anchors.mainHand.pos.z };
  const weaponMesh = weaponMeshFor(weapon || "mace", tint, giantHandOffset); // giants default to a blunt weapon read
  if(weaponMesh){ weaponMesh.scale.setScalar(1.4); g.add(weaponMesh); }
  return g;                                                                  // 12 boxes
}

/* NEW ARCHETYPE — ooze: low wide blob, stacked shrinking irregular boxes (Adam: "low wide blob —
   stacked shrinking irregular boxes"). No limbs/head at all — the whole point of an ooze silhouette
   is the ABSENCE of any articulated parts, just a soft-edged (in read, not geometry — still cuboid)
   mound. Each layer is offset slightly off-center (seeded, deterministic) so the stack doesn't read
   as a perfect pyramid — an irregular slump instead. 6 layers. */
/* MODEL-GRAMMAR G1: blob-mass, seeded via a unit-normalized `offsets` array (blob-mass's own boxSpec
   math re-applies the 0.02/0.06/0.3 spreads seededJitter used inline). */
function buildOoze(seed, tint){
  const g = new THREE.Group();
  const layers = 6;
  const offsets = [];
  for(let i = 0; i < layers; i++){ offsets.push(seededJitter(seed, i, 1)); }
  renderPartInto(g, Parts.blobMass, { offsets }, flatTints(tint), { x: 0, y: 0, z: 0 });
  return g;                                                     // 6 boxes
}

/* NEW ARCHETYPE — arachnid: low body + 6-8 angled leg slabs (Adam: "low body + 6-8 angled leg
   slabs"). Two body segments (cephalothorax + abdomen, the real spider-anatomy split — reads more
   "spider" than one blob) and 8 thin angled leg slabs radiating outward, alternating up/down angle
   per side for a scuttling read instead of a symmetric star. ~10 boxes. */
/* MODEL-GRAMMAR G1: thorax-abdomen (body core) + 8x leg-spider (one call per leg, count=4 per side —
   matches the original's legCount/2 split exactly). */
function buildArachnid(seed, tint){
  const g = new THREE.Group();
  const tints = flatTints(tint);
  renderPartInto(g, Parts.thoraxAbdomen, {}, tints, { x: 0, y: 0, z: 0 });
  const legCount = 8;
  for(let i = 0; i < legCount; i++){
    const side = i < legCount / 2 ? 1 : -1;
    const idx = i % (legCount / 2);
    const tiltSeed = seededJitter(seed, i, 1); // unit-normalized; leg-spider re-applies the 0.08 spread
    renderPartInto(g, Parts.legSpider, { side, idx, count: legCount / 2, tiltSeed }, tints, { x: 0, y: 0, z: 0 });
  }
  return g;                                                     // 10 boxes
}

/* NEW ARCHETYPE — amorphous-horror: asymmetric mass + tentacle slabs (Adam: "aberration: asymmetric
   mass + tentacle slabs"). A lumpy asymmetric core (3 overlapping boxes at different sizes/offsets,
   deterministically seeded so no two aberrations look identical) with 4-6 thin tentacle slabs jutting
   at irregular angles — the "wrongness" read comes from the asymmetry itself, not from any single
   exotic shape. ~9 boxes. */
/* MODEL-GRAMMAR G1: horror-mass (asymmetric 3-box core) + drip-tendrils (5-tentacle count, reusing
   the SAME radiating-slab part the FX-attachment category lists — see that part's own header). */
function buildAmorphousHorror(seed, tint){
  const g = new THREE.Group();
  const tints = flatTints(tint);
  const jitter = [];
  for(let i = 0; i < 7; i++){ jitter.push(seededJitter(seed, i, 1)); }
  renderPartInto(g, Parts.horrorMass, { jitter }, tints, { x: 0, y: 0, z: 0 });
  const tentacles = 5;
  const angleSeed = [], lenSeed = [], tiltSeed = [], rollSeed = [];
  for(let i = 0; i < tentacles; i++){
    angleSeed.push(seededJitter(seed, i + 10, 0.6));
    lenSeed.push(seededJitter(seed, i + 20, 0.16));
    tiltSeed.push(seededJitter(seed, i + 30, 0.5));
    rollSeed.push(seededJitter(seed, i + 40, 0.5));
  }
  // angleAxis:"y" matches the original inline loop's rotY=ang placement (addBox's positional order
  // is rotY,rotX,rotZ — the source call passed `ang` first, i.e. into rotY).
  renderPartInto(g, Parts.dripTendrils, {
    count: tentacles, radius: 0.22, yBase: 0.2, baseLen: 0.32, thickness: 0.06, angleAxis: "y",
    angleSeed, lenSeed, tiltSeed, rollSeed
  }, tints, { x: 0, y: 0, z: 0 });
  return g;                                                     // 8 boxes
}

/* §3 WEAPON SHAPES — a small box (or box-pair) attached at the biped/giant's off-hand position, keyed
   by the weapon shape string theater-data.js derives (theaterWeaponForClass / theaterWeaponForFoe):
   sword = a long thin slab, axe = a short pole + a wide wedge-read box, bow = two thin angled slabs
   forming a shallow V (a real curve isn't worth a new geometry type — the angled-pair reads as a bow
   in silhouette per Adam's own fallback note), staff = a tall thin pole + a small tip cube, mace/
   dagger = shorter slab variants sized to their weapon. Returns null for "none"/unrecognized (no mesh
   added — the archetype's bare-limb read stands alone). Position is relative to the figure's own
   local origin (canted off the right/weapon hand, ~0.4 out on x) — callers may re-scale/reposition
   the returned group (buildGiant scales it up for its bigger hands). */
/* MODEL-GRAMMAR G1: weaponMeshFor is now a thin dispatch over the WEAPONS part category (sword-slab/
   axe-wedge/bow-arcs/staff-tipped/spear-pole/dagger-slabs). "mace" has no listed §1 weapon key of its
   own (weaponMeshFor's original vocabulary predates the §1 inventory, which names club-mass instead) —
   kept mapped to club-mass's blunt haft+head read, the closest §1 equivalent (both are "short haft +
   blunt head"), rather than dropping the mace lookup theater-data.js's weapon-word scan still emits.

   G5 ROUND-1 (ruling 3, the grip fix): this function used to offset every weapon at a hardcoded
   {0.42,0.5,0.04} — the SAME shoulder-height point torsoBiped.anchors.mainHand used to sit at before
   this same session's anchor retarget above. Both are now fixed together: this function's default
   offset/cant matches torso-biped's own corrected mainHand anchor so the legacy (non-recipe)
   archetype-builder path and the recipe-driven buildFigureFromRecipe path seat a weapon at the SAME
   hand position — one grip contract, two call sites (kept in sync by hand across this file and
   theater-parts.js's own torsoBiped.anchors — a drift here would desync the two render paths'
   weapon seat again, the exact class of bug this round's own fix addresses).

   G5 ROUND-2 (finding 1 — "the weapons are all still floating"): round 1's y=0.2 sat below this
   body's own pelvis box (bottom edge ~0.55) — see theater-parts.js's torsoBiped.anchors comment
   for the full mechanism. Retargeted to y=0.56 (the hip/pelvis band), matching torso-biped's own
   anchor retarget exactly (WEAPON_BASE_OFFSET must stay byte-identical to torsoBiped.anchors.
   mainHand.pos — this is the "one grip contract, two call sites" invariant this whole comment is
   about). WEAPON_CANT layers a per-weapon-shape rotation on top of that shared base seat (Adam's
   reference notes: "sword ~30-40° forward cant, spear near-vertical with hand at mid-shaft, bow
   held out") — a sword keeps the base anchor's own -0.6rad (~34°) cant, a spear is canted to
   near-vertical (-0.08rad) with its own y nudged up to read as gripped mid-shaft (spear-pole's head
   is well above the haft's midpoint), a bow rotates further forward+out (-1.1rad) so its arcs read
   held-out in front rather than alongside the body. `offset` (caller-supplied) lets buildGiant
   re-seat at its own bigger-armed anchor instead of inheriting biped's smaller-figure coordinates
   (the giant/biped weapon-offset mismatch round 1 also fixed — buildGiant reads
   torsoBipedHuge.anchors.mainHand live, so it inherited round 2's same hip-band retarget there
   automatically, no separate edit needed). */
const WEAPON_PART_KEY = {
  sword: "sword-slab", axe: "axe-wedge", bow: "bow-arcs", staff: "staff-tipped",
  spear: "spear-pole", mace: "club-mass", dagger: "dagger-slabs"
};
// THE FIST RULE (L14, 2026-07-03): kept byte-identical to torsoBiped.anchors.mainHand.pos (0.3, 0.58,
// 0.02) — the FIST CENTER the fist retarget moved the biped grip to (see theater-parts.js's own FIST-
// RULE anchor header). A weapon seated here has its grip section INSIDE the arm's oversized fist box
// (geometric intersection, not adjacency). The "one grip contract, two render paths" invariant: the
// legacy weaponMeshFor path (this constant) and the recipe path (the anchor) MUST agree; the giant
// path reads torsoBipedHuge.anchors.mainHand live (no separate literal).
const WEAPON_BASE_OFFSET = { x: 0.3, y: 0.58, z: 0.02 };
/* rz here is a DELTA added on top of each weapon part's OWN baked-in boxSpec rotation (sword-slab
   already carries rz:-0.3, axe-wedge/spear-pole -0.2/-0.15, dagger-slabs -0.35, club-mass -0.25,
   staff-tipped 0, bow-arcs's two boxes are a +/-0.5 V so it has no single "own cant" to add onto) —
   renderPartInto's rotOffset ADDS to a box's own rot.z (line ~245), so the total cant a weapon reads
   at is (part's own rz) + (this delta), not this value alone. Deltas below are tuned so the TOTAL
   lands in Adam's target ranges: sword/dagger/axe/mace -> ~30-40° forward cant (0.52-0.70 rad) total;
   spear/staff -> near-vertical (small total, hand reading mid-shaft via yNudge); bow -> held OUT
   (a stronger forward rotation than a bladed weapon's cant, since bow-arcs' V needs to visibly present
   forward rather than hang alongside the hip the way a sword does). */
const WEAPON_CANT = {
  // sword-slab's own rz=-0.3; delta -0.3 -> total -0.6 (~34°, mid the 30-40° spec range).
  sword: { rz: -0.3, yNudge: 0 },
  // dagger-slabs' own rz=-0.35; delta -0.25 -> total -0.6 (~34°, same family read, shorter blade).
  dagger: { rz: -0.25, yNudge: 0 },
  // axe-wedge's own rz=-0.2; delta -0.35 -> total -0.55 (~31.5°).
  axe: { rz: -0.35, yNudge: 0 },
  // club-mass's own rz=-0.25; delta -0.3 -> total -0.55 (~31.5°).
  mace: { rz: -0.3, yNudge: 0 },
  // spear-pole's own rz=-0.15; delta +0.07 -> total -0.08 (near-vertical). yNudge lifts the anchor so
  // the grip reads at the haft's MID-SHAFT (spear-pole's spearhead sits well above its local origin;
  // gripping near the bottom, per weaponMeshFor's own offset, would read as holding the very butt-end).
  spear: { rz: 0.07, yNudge: 0.14 },
  // staff-tipped's own rz=0 (a plain vertical pole+tip); a small -0.1 delta reads as a relaxed
  // near-vertical hold rather than dead-plumb, matching the spear's own "near-vertical" family.
  staff: { rz: -0.1, yNudge: 0.1 },
  // bow-arcs has no single baked cant (a symmetric +/-0.5 V) — the delta here is the weapon's WHOLE
  // presented rotation (held out in front, arcs facing the target line rather than hanging at the hip).
  bow: { rz: -0.9, yNudge: 0.02 }
};
/* ============================================================================
   CARRY STATES (L14/L15, 2026-07-03, Adam ruling 3): "every weapon class gets a static-piece-sensible
   carry, zero pose system needed." Which carry a weapon takes is a pure function of its PART (+ a
   name/item heavy-2H signal) — no per-figure pose. Five states:
     - held-fist  : 1H melee + versatile (sword/axe/mace/dagger) -> grip through the mainHand fist,
                    canted across the body (the WEAPON_CANT deltas above ARE this state's cant).
     - planted    : spear/staff/polearm -> vertical in the fist, butt near the ground (the classic
                    at-rest guard). The pole parts already stand near-vertical; the carry drops the
                    weapon so its butt reaches toward the floor and keeps it plumb.
     - back-mount : heavy 2H melee (greatsword/greataxe/maul) -> diagonal across the `back` anchor
                    (Adam: "that's how static game pieces work"; a 2H weapon floating near one hand is
                    a REJECTED state).
     - bow-held   : bow -> vertical arc in the fist (bows read iconic held; never back-mount v1).
     - shield     : off-hand -> the shield-slab already seats at the offHand fist/forearm; verified to
                    intersect it, not float (handled by the offHand anchor being the fist center now).
   The router returns {anchor, rz, dpos:{x,y,z}} — `anchor` names WHICH body anchor to attach at
   (mainHand for held/planted/bow, back for back-mount), `rz` the cant delta on the weapon part, `dpos`
   a small position adjustment layered on the anchor (e.g. planted drops the weapon toward the floor).
   held-fist reproduces the pre-L14 WEAPON_CANT behavior exactly (so a sword's cross-body read is
   unchanged); planted/back-mount/bow are the new deliberate carries. ============================================================================ */
// heavy two-handed melee — a name-keyword signal for the recipe side (the PC-mirror side reads the
// item's own two-handed/heavy property instead — see theaterUnitsFrom/pcRecipe). A weapon-part key
// alone can't tell a longsword (versatile, held-fist) from a greatsword (heavy 2H, back-mount) —
// both resolve to "sword-slab" — so the heavy signal is carried alongside the part.
const HEAVY_2H_NAME_RX = /\bgreat(sword|axe|club|maul)?\b|\bmaul\b|\bheavy\b|two-handed|greataxe|greatsword/i;
// weapon-part-key -> its default carry state (before the heavy-2H override promotes a great-weapon to
// back-mount). Poles plant; bows are held; blades/blunt are held-fist.
const WEAPON_CARRY_STATE = {
  "sword-slab": "held-fist", "axe-wedge": "held-fist", "club-mass": "held-fist", "dagger-slabs": "held-fist",
  "spear-pole": "planted", "staff-tipped": "planted",
  "bow-arcs": "bow-held"
};
/* resolve the carry for a weapon module. `partKey` is the §1 weapon part name (e.g. "sword-slab");
   `opts` may carry {heavy:true} (a heavy-2H signal from the recipe name keyword or the PC item's own
   two-handed property). Returns {anchor, rz, dpos} — never throws; an unknown part defaults to a
   held-fist read at the mainHand. cantKeyFor maps a part back to its WEAPON_CANT key (sword-slab ->
   "sword") for the held-fist cant. */
function weaponCarryFor(partKey, opts){
  opts = opts || {};
  let state = WEAPON_CARRY_STATE[partKey] || "held-fist";
  // heavy 2H promotes a held-fist blade/blunt to back-mount (a greatsword rides the back). Poles/bows
  // are NOT promoted — a heavy spear still plants, a bow is still held (per the ruling's own carve-outs).
  if(opts.heavy && state === "held-fist") state = "back-mount";
  const cantKey = WEAPON_PART_TO_CANT_KEY[partKey];
  const cant = (cantKey && WEAPON_CANT[cantKey]) || { rz: -0.6, yNudge: 0 };
  if(state === "held-fist"){
    return { anchor: "mainHand", rz: cant.rz, dpos: { x: 0, y: cant.yNudge, z: 0 } };
  }
  if(state === "planted"){
    // vertical in the fist, butt toward the floor: near-plumb (small rz), and dropped DOWN so the
    // pole's butt reaches below the fist toward the ground (the mainHand fist sits at y~0.58; a pole
    // is ~0.7 tall, so dropping the grip ~0.26 puts the butt near y~0 while the head clears the head).
    // dpos.x nudges the pole's own -x origin (staff-pole/spear-pole author their haft a touch to -x)
    // back onto the fist center so the haft passes THROUGH the fist (intersection, not adjacency).
    return { anchor: "mainHand", rz: 0.04, dpos: { x: 0.04, y: -0.26, z: 0 } };
  }
  if(state === "bow-held"){
    // vertical arc in the fist: the V stands upright (its two limbs form a vertical bow), held at the
    // fist. dpos.x compensates bow-arcs' own -x origin so the arc's mid-grip sits on the fist; z kept
    // small so the arc stays within the fist's z-depth (it must INTERSECT the fist, not float ahead).
    return { anchor: "mainHand", rz: 0.0, dpos: { x: 0.04, y: 0.0, z: 0.0 } };
  }
  // back-mount: diagonal across the back. Attach at `back` (shoulder-blade), cant strongly so the
  // weapon lies diagonally across the spine, raised so a greatsword's hilt clears one shoulder.
  return { anchor: "back", rz: 0.9, dpos: { x: 0, y: 0.35, z: -0.04 } };
}

/* weaponMeshFor — the LEGACY archetype-builder weapon composer (buildBiped/buildGiant's fallback path,
   used only when a unit has NO recipe). `weapon` is a weapon SHAPE key (sword/axe/spear/...); `offset`
   is the caller's grip anchor (torsoBiped/torsoBipedHuge mainHand). CARRY STATES (L14/L15): routes
   through the SAME weaponCarryFor the recipe path uses, so a legacy spear PLANTS and a legacy sword is
   held-fist identically to a recipe one — the two paths stay in sync (the desync the ruling warns
   against). The legacy path has no heavy-2H signal (a bare shape key can't distinguish a longsword from
   a greatsword) so it never back-mounts — a fallback figure just holds its weapon at the fist, which is
   correct (back-mount is a recipe/PC-item affordance). Returns null for none/unknown. */
function weaponMeshFor(weapon, tint, offset){
  if(!weapon || weapon === "none") return null;
  const partKey = WEAPON_PART_KEY[weapon];
  const partFn = partKey && Parts.PARTS[partKey];
  if(!partFn) return null;
  const base = offset || WEAPON_BASE_OFFSET;
  const carry = weaponCarryFor(partKey, { heavy: false });
  const g = new THREE.Group();
  const dpos = carry.dpos || { x: 0, y: 0, z: 0 };
  renderPartInto(g, partFn, {}, flatTints(tint),
    { x: base.x + (dpos.x || 0), y: base.y + (dpos.y || 0), z: base.z + (dpos.z || 0) }, { z: carry.rz });
  return g;
}

/* ============================================================================
   MODEL-GRAMMAR G2 §6 — buildFigureFromRecipe(recipe, tint): the recipe-driven figure
   composer. Reuses THIS file's own renderPartInto/flatTints (G1's composition engine —
   the spec's §6 "buildFigureFromParts" is what renderPartInto already is; this function is
   the whole-figure assembly loop ON TOP of it a recipe needs, same relationship figureFor
   has to the fixed archetype builders below). A recipe names a BASE body part + a flat
   modules[] list of {part,anchor,params?} — every module is looked up in the base body's
   OWN §2 .anchors object (Parts.PARTS[recipe.base].anchors) and rendered at that anchor's
   local transform via renderPartInto's existing offset/rotOffset params, exactly the same
   attach mechanism buildBiped/buildGiant already use for their fixed leg/arm/weapon/shield
   placements — a recipe module is just data naming what those hand-written calls used to
   hardcode. An unknown base/module part (should never happen — data/model-recipes.js's
   generator only ever emits real §1 part names, and the §4b shape-hint resolver validates
   DM-authored ones before they reach a recipe) degrades to the biped fallback / a skipped
   module rather than throwing, matching this file's total-function discipline everywhere
   else. §5 channel->tint: channel names resolve through CHANNEL_TINT_FALLBACK (a flat
   placeholder-tier palette per named channel value, e.g. "leather"/"armor"/"fire"/
   "shadow-dark" — §II.0b placeholder art; the real palette-stack resolution (env/realm/
   faction) is a later unit's scope, same as flatTints' own single-tint baseline before it)
   layered UNDER the unit's own kind tint (pc/ally/foe) so a figure still reads its side at
   a glance even when a recipe's channels diverge from "default". Budget: recipes may run
   over the fixed archetypes' informal box counts (§9 Decision 1: "recipes may improve
   figures... but the preview lineup must render clean") — no hard cap enforced here, the
   ≤24-box hero budget is a verify-time check (dev/verify-model-grammar.mjs), not a runtime
   truncation, so a rare over-budget recipe still renders (just heavier), never disappears. */
const CHANNEL_TINT_FALLBACK = {
  default: null,        // null = "use the caller's own base tint" (pc/ally/foe kind color)
  none: null,
  leather: 0x6b5744,
  armor: 0x8a8a92,
  plate: 0xb9bcc4,
  fire: 0xd97a34,
  radiant: 0xe8d9a0,
  frost: 0x9fd2e0,
  poison: 0x7a9e4a,
  crystal: 0xb8a8d8,
  fungal: 0x8fae6e,
  web: 0xd8d2c0,
  "shadow-dark": 0x2a2430,
  "skin-green-grey": 0x7a8a6e,
  // G5 ROUND-1 (ruling 1) — the natural-identity palette family (build/gen-model-recipes.py's
  // PALETTE_BY_TYPE/PALETTE_NAME_RULES resolve to these SAME slot names). Every value deliberately
  // desaturated/muted (docs/BATTLE-THEATER.md §0's Vagrant Story mood — "no candy"), hand-picked to
  // sit in the same low-chroma family the PSX grit pass's own tile/void palette already uses; none of
  // these approach a bright/saturated "toy" hue.
  "flesh-weathered": 0x9a7f68,     // humanoid base skin — a dusty, weathered flesh tone, not pink
  "grave-pallor": 0x8a9088,        // undead base skin — sallow grey-green pallor
  "bone-white": 0xd8cfb8,          // skeleton/skull family — desaturated bone, not bright white
  "sickly-grey-green": 0x6e7a5e,   // zombie/rot family
  "olive-dun": 0x7d7048,           // goblinoid family — olive/dun skin
  "leather-worn": 0x5c4a36,        // worn leather accent (goblinoid gear, humanoid default accent)
  "grey-brown-fur": 0x6b5c4a,      // beast/wolf family fur
  "murky-green": 0x4d5c46,         // ooze/monstrosity family
  "dark-red-black": 0x3a2224,      // fiend/aberration family
  "pale-blue-grey": 0x8a94a0,      // celestial/ghost/spectral family
  "radiant-dim": 0xb8ab84,         // celestial accent — a muted gold-ivory, not a bright glow
  "moss-dim": 0x5e6b4a,            // fey/plant family
  "stone-grey": 0x7a7972,          // construct/elemental/giant family
  "ash-grey": 0x6e6a62              // elemental accent
};
/* G5 ROUND-1 (ruling 1): `kind` gates whether natural per-creature channels (skin/accent) are allowed
   to override the caller's flat kind tint. "PC gold / ally blue KEEP their figure tints (player-side
   clarity beats naturalism there — unchanged)" — so a pc/ally figure (kind !== "foe") skips skin/
   accent channel resolution entirely, staying the flat gold/blue flatTints baseline exactly like
   before this ruling, even if it happens to resolve through a bestiary recipe (a companion/sidekick
   ally with its own statId->recipeSlug). armor/glow/weapon channels are UNCHANGED by this gate (a
   pc/ally still shows leather/plate/fire-glow material reads from its own equipment/conditions — only
   the natural SKIN/ACCENT identity read is what "keep the side tint" is about); `kind` defaulting to
   undefined (a caller that doesn't pass it, e.g. a narrow test harness) is treated as "not foe" — the
   SAFER default (never accidentally paints a figure a wrong natural color when the caller's intent is
   ambiguous; the pre-ruling flat-tint baseline is always a safe fallback). */
const NATURAL_CHANNEL_KEYS = { skin: 1, accent: 1 };
function recipeChannelTints(channels, baseTint, kind){
  const tints = flatTints(baseTint);
  const isFoe = kind === "foe";
  Object.keys(channels || {}).forEach(function(ch){
    if(!isFoe && NATURAL_CHANNEL_KEYS[ch]) return; // pc/ally: skip natural skin/accent, keep side tint
    const val = channels[ch];
    const resolved = (val != null && Object.prototype.hasOwnProperty.call(CHANNEL_TINT_FALLBACK, val))
      ? CHANNEL_TINT_FALLBACK[val] : null;
    if(resolved != null) tints[ch] = resolved;
  });
  return tints;
}

/* G5 ROUND-1 (ruling 3): the inverse of WEAPON_PART_KEY — a recipe module names a PART (e.g.
   "sword-slab"), not a weapon-shape key ("sword"), so buildFigureFromRecipe needs this reverse lookup
   to find the matching WEAPON_CANT delta for a mainHand/offHand module. Built once at module-load time
   off the existing WEAPON_PART_KEY table (single source, no second hand-typed map to drift). */
const WEAPON_PART_TO_CANT_KEY = Object.keys(WEAPON_PART_KEY).reduce(function(acc, k){
  acc[WEAPON_PART_KEY[k]] = k; return acc;
}, {});

/* G5 ROUND-1 (ruling 4): opacity ~0.45 (Adam's own "is there opacity? yes, wire it") for any recipe
   carrying `translucent:true` (ghost/spectre/wraith/spirit/phantom/shadow-keyword creatures, per the
   generator's translucent_for) — depthWrite off (via addBox's own opacity<1 branch) is the standard
   correct-sort-order trick for a translucent object so it doesn't z-fight/occlude wrongly against
   itself or other transparent figures. */
const TRANSLUCENT_OPACITY = 0.45;

/* G5 ROUND-2 (finding 1, the floor-weapon bug): base bodies in the BIPED family (torso-biped /
   torso-biped-huge) export `.legParams(side)` / `.armParams(side)` factories that the LEGACY
   archetype-builder path (buildBiped/buildGiant, above) always calls to draw real leg-tapered/
   arm-tapered limbs — but build/gen-model-recipes.py's derivation rules (§4) never emit a
   leg-tapered or arm-tapered MODULE, so every recipe-driven figure (buildFigureFromRecipe, the
   G2 path every fixture-6 foe + the PC's own pcRecipe actually render through) was a bare torso
   core plus small accessory modules (weapon/head/armor) — NO limbs at all. torsoBiped.anchors.
   mainHand (y=0.2 local) was tuned against the LEGACY path's real forearm (arm-tapered's own
   segment math bottoms out at y~0.14, so y=0.2 sits at the grip, ~30 comments up) — with no
   forearm actually drawn in the recipe path, that same anchor is just a bare point in space well
   BELOW the torso's own pelvis box (pelvis sits at local y~0.62, mainHand at y~0.2), which is
   exactly why a recipe-driven figure's weapon read as lying on the floor beside it rather than
   gripped: there was no arm there to read it as "held," and the figure's own silhouette had
   nothing between the pelvis and the ground either. Fix: render the SAME leg-tapered x2 +
   mainHand/offHand-side arm-tapered geometry the legacy path already draws for these two base
   bodies, so a recipe figure is a COMPLETE silhouette (matching the legacy figure's own limb
   grammar) and the mainHand/offHand anchors seat against a real forearm again, on both paths.
   Every other base (torso-quad/blob-mass/thorax-abdomen/serpent-coil/swarm-scatter/horror-mass)
   is unaffected — none of them carry a mainHand-anchored weapon module in the generated corpus
   today (theater-parts.js's own quad/thorax/blob/serpent/swarm anchors are all "best-effort,
   no true hand" per their own header comments), so this fix is scoped to the family that actually
   has the bug (§9 Decision 6 discipline: fix the real cause, don't touch what isn't broken). */
const BIPED_LIMB_ARM_PARAMS = {
  "torso-biped": function(side){ return { side, tiltZ: side < 0 ? 0.16 : -0.16 }; },
  // UNIT 2: torso-tapered reuses torso-biped's frame verbatim (same shoulder line/anchors) — so it is
  // biped-family for limb-drawing; a martial-humanoid recipe on the V-taper body still grows real
  // arms + legs (else it'd be the "legless plank" bug in a new coat). Same params as torso-biped.
  "torso-tapered": function(side){ return { side, tiltZ: side < 0 ? 0.16 : -0.16 }; },
  "torso-biped-huge": function(side){ return Parts.torsoBipedHuge.armParams(side); }
};
const BIPED_LIMB_LEG_PARAMS = {
  "torso-biped": function(side){ return Parts.torsoBiped.legParams(side, 0, 0.05); },
  "torso-tapered": function(side){ return Parts.torsoBiped.legParams(side, 0, 0.05); },  // UNIT 2 — same frame
  "torso-biped-huge": function(side){ return Parts.torsoBipedHuge.legParams(side); }
};

/* FRAME RETARGET (2026-07-03, director item 5 — the "legless plank" quadruped bug): the recipe path
   (buildFigureFromRecipe) only ever drew legs for the BIPED family (BIPED_LIMB_LEG_PARAMS above) —
   there was no leg-drawing at all for a `torso-quad` base, so every quadruped RECIPE figure (a wolf/
   worg/beast with a real statId -> recipe) rendered as its bare body slab with no legs: the "wolf =
   floating slab" Adam saw. The legacy buildQuadruped path DOES draw 4 legs inline; this table is the
   recipe-path equivalent, the SAME four leg-tapered param sets buildQuadruped uses (front pair splays
   on X, rear haunch pair cants on Z — see theater-parts.js's legTapered params doc). A structural
   attach fix, scoped to the base that actually lacked legs; every other base is unchanged. */
const QUAD_LIMB_LEG_SETS = {
  "torso-quad": [
    { baseW: 0.085, segLen: 0.15, x: -0.3, z: -0.12, yStart: 0.02, tiltX: 0.05 },   // front-left
    { baseW: 0.085, segLen: 0.15, x: -0.3, z: 0.12, yStart: 0.02, tiltX: -0.05 },   // front-right
    { baseW: 0.095, segLen: 0.19, x: 0.26, z: -0.13, yStart: 0.02, tiltZ: 0.18 },   // rear-left, haunch
    { baseW: 0.095, segLen: 0.19, x: 0.26, z: 0.13, yStart: 0.02, tiltZ: -0.18 }    // rear-right, haunch
  ]
};

function buildFigureFromRecipe(recipe, tint, kind){
  const g = new THREE.Group();
  if(!recipe) return g;
  const baseKey = (recipe.base && Parts.PARTS[recipe.base]) ? recipe.base : "torso-biped";
  const baseFn = Parts.PARTS[baseKey];
  const anchors = baseFn.anchors || {};
  const tints = recipeChannelTints(recipe.channels, tint, kind);
  const opacity = recipe.translucent ? TRANSLUCENT_OPACITY : undefined;

  // G5 ROUND-1 (ruling 5): stance + headScale ride into the base body's own params — torsoBiped is
  // the only §1 body that currently reads them (goblinoid hunch/zombie slouch/rogue crouch are all
  // biped-shaped bestiary rows; a non-biped base silently ignores unknown params, same total-function
  // discipline every part function already has — ARCHETYPE_TO_BASE never maps a goblin/zombie/rogue
  // row to anything but torso-biped today, so this is not a narrower guarantee than the data provides).
  // UNIT 3 (L3): family proportion scalars, applied AT ASSEMBLY. headScale/torsoScale ride into the
  // base body's params; handScale/legScale multiply into the arm/leg params below. A scalar absent =>
  // 1.0 (unchanged). This is the same seam the CR imposing scalar was always meant to use (bulk stays
  // a group-level read via sizeScaleFor's sibling; head/hand/leg/torso are per-part, applied here).
  const sc = recipe.scalars || {};
  const handScale = sc.handScale != null ? sc.handScale : 1;
  const legScale = sc.legScale != null ? sc.legScale : 1;
  const bodyParams = {};
  if(recipe.stance) bodyParams.stance = recipe.stance;
  if(sc.headScale != null) bodyParams.headScale = sc.headScale;
  if(sc.torsoScale != null) bodyParams.torsoScale = sc.torsoScale;

  // UNIT 1: the pixel-skin variant key for this whole figure = its recipe slug (or poseSeed) — so a
  // goblin's torso texture is shared by EVERY goblin (one cached canvas per part+channel per species),
  // never per-instance (the cache-explosion the brief warns against). The `kind` is folded in too so a
  // gold PC-side recipe figure and an ember foe-side one of the same slug don't collide (their skin
  // colors differ anyway via recipeChannelTints, but keying them apart keeps the cache honest).
  const vKey = ((recipe.slug || recipe.poseSeed || baseKey) + "|" + (kind || "foe"));

  // the base body itself, at the figure's own local origin (no offset — matches every fixed
  // archetype builder's own convention of drawing its body core at {0,0,0}).
  renderPartInto(g, baseFn, bodyParams, tints, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, opacity, vKey);

  // G5 ROUND-2 (finding 1 fix): legs + both arms, for biped-family bases only — see this
  // function's own header comment above for why. Legs use torso-biped's plain crouch=0/
  // stanceTilt=0.05 defaults (a recipe figure has no per-figure seededJitter weight-shift the
  // legacy path derives from its own `seed` — a fixed, still-natural default stance) so a
  // recipe figure's legs read as a normal stand, not a copy-pasted mirror of the archetype
  // fallback's own randomized lean.
  const legParamsFor = BIPED_LIMB_LEG_PARAMS[baseKey];
  const armParamsFor = BIPED_LIMB_ARM_PARAMS[baseKey];
  // UNIT 3 (L3): legScale multiplies the leg's own segLen (stumpy goblinoid legs = 0.65x); handScale
  // multiplies the arm's fist (and, gently, its width) so a goblinoid's oversized hands read. Folded
  // into the per-limb param object here so the scalar rides through the SAME leg-tapered/arm-tapered
  // param path the frame uses (no separate transform to drift). A scalar of 1 leaves the base params
  // byte-identical (Object.assign of {} onto the factory's own output).
  const scaleLeg = (p) => (legScale !== 1 ? Object.assign({}, p, { segLen: (p.segLen != null ? p.segLen : 0.26) * legScale }) : p);
  const scaleArm = (p) => (handScale !== 1 ? Object.assign({}, p, { fistScale: 1.3 * handScale }) : p);
  if(legParamsFor){
    renderPartInto(g, Parts.legTapered, scaleLeg(legParamsFor(-1)), tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey);
    renderPartInto(g, Parts.legTapered, scaleLeg(legParamsFor(1)), tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey);
  }
  if(armParamsFor){
    renderPartInto(g, Parts.armTapered, scaleArm(armParamsFor(-1)), tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey);
    renderPartInto(g, Parts.armTapered, scaleArm(armParamsFor(1)), tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey);
  }
  // FRAME RETARGET (director item 5): quadruped-family bases draw their 4 legs here — the recipe
  // path had NONE before (the "legless plank" wolf). Same leg-tapered sets buildQuadruped draws.
  const quadLegSets = QUAD_LIMB_LEG_SETS[baseKey];
  if(quadLegSets){
    quadLegSets.forEach(function(p){
      renderPartInto(g, Parts.legTapered, p, tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey);
    });
  }

  (recipe.modules || []).forEach(function(m){
    if(!m || !m.part) return;
    const partFn = Parts.PARTS[m.part];
    if(!partFn) return; // unknown part — skip, never throw (§4b's own "unknown -> omitted" discipline,
                          // reapplied here at render time as a defensive second gate)
    // CARRY STATES (L14/L15): a mainHand/offHand module whose part is a KNOWN weapon gets routed through
    // weaponCarryFor, which decides the carry (held-fist / planted / bow-held / back-mount) from the
    // part + a heavy-2H params flag (the generator sets params.heavy on a greatsword/maul name). The
    // carry may RE-ANCHOR the weapon (a back-mount greatsword attaches at `back`, not the hand) and
    // supplies the cant + a small position delta. A non-weapon module (head/armor/wings) keeps its own
    // anchor untouched. This supersedes the pre-L14 flat WEAPON_CANT application: held-fist reproduces
    // that exact cant, and the grip now seats at the FIST CENTER anchor so it intersects the fist box.
    let anchorName = m.anchor;
    let extraRz = 0, dpos = null;
    const isWeaponPart = !!WEAPON_PART_TO_CANT_KEY[m.part] || m.part === "shield-slab";
    if((m.anchor === "mainHand" || m.anchor === "offHand") && WEAPON_PART_TO_CANT_KEY[m.part]){
      const heavy = !!(m.params && m.params.heavy);
      const carry = weaponCarryFor(m.part, { heavy: heavy });
      // off-hand keeps its own hand (a two-weapon off-hand blade stays in the off-fist); only a
      // MAIN-hand weapon can promote to back-mount (a figure back-mounts its primary great-weapon).
      anchorName = (m.anchor === "offHand") ? "offHand" : carry.anchor;
      extraRz = carry.rz;
      dpos = carry.dpos;
    }
    const anchor = anchorName && anchors[anchorName];
    let offset = anchor ? anchor.pos : { x: 0, y: 0, z: 0 };
    let rotOffset = anchor ? anchor.rot : { x: 0, y: 0, z: 0 };
    if(dpos){
      offset = { x: offset.x + (dpos.x || 0), y: offset.y + (dpos.y || 0), z: offset.z + (dpos.z || 0) };
      rotOffset = Object.assign({}, rotOffset, { z: (rotOffset.z || 0) + extraRz });
    }
    renderPartInto(g, partFn, m.params || {}, tints, offset, rotOffset, opacity, vKey);
  });

  return g;
}

/* recipe lookup: MODEL_RECIPE_OVERRIDES wins by slug (§3, §9 Decision 2), falling through to
   the generated MODEL_RECIPES, falling through to null (no recipe at all — the caller's own
   archetype fallback stays authoritative, §9 Decision 6: "never worse than today"). Both
   globals are classic-script data (data/model-recipe-overrides.js / data/model-recipes.js)
   loaded before this ES module's own <script type="module"> tag executes (module scripts are
   deferred by the HTML spec, so every classic <script> above it has already run) — read
   defensively via typeof so a headless/jsdom harness missing either file degrades to "no
   recipe" instead of a ReferenceError. */
function recipeFor(slug){
  if(!slug) return null;
  if(typeof MODEL_RECIPE_OVERRIDES !== "undefined" && MODEL_RECIPE_OVERRIDES[slug]) return MODEL_RECIPE_OVERRIDES[slug];
  if(typeof MODEL_RECIPES !== "undefined" && MODEL_RECIPES[slug]) return MODEL_RECIPES[slug];
  return null;
}

function figureFor(archetype, seed, tint, silhouette, weapon, recipeSlug, pcRecipe, kind){
  // MODEL-GRAMMAR G2: a unit carrying a resolvable recipeSlug renders recipe-driven (§9
  // Decision 1: recipes may improve on the fixed archetypes — new weapon/armor modules from
  // actual bestiary fields — but never worse: recipeFor's own null-fallthrough plus this
  // function's existing archetype-builder fallback together guarantee SOME figure always
  // renders, recipe-driven or not). Silhouette/weapon (PC/ally class-driven / foe keyword-
  // scan) are ONLY meaningful to the fixed archetype builders (buildBiped's silhouette
  // branches, weaponMeshFor) — a recipe-driven figure ignores them entirely, since its own
  // modules[] already encode weapon/armor from the bestiary's real fields, a strictly richer
  // source than the name/action-text keyword scan those params come from.
  // MODEL-GRAMMAR G3 §2 (the loadout mirror): a unit carrying `pcRecipe` (theaterUnitsFrom's live
  // sheet.equipped derivation, PC/ally only) takes precedence over BOTH the bestiary recipeSlug
  // path and the archetype fallback — pcRecipe already IS a full §3 recipe shape
  // (buildFigureFromRecipe's own input), so this is just one more entry in the same precedence
  // chain (pcRecipe > bestiary recipe > archetype), not a new code path. A foe never carries
  // pcRecipe (theaterUnitsFrom only stamps it on pc/ally units), so this branch is a pure no-op
  // for every foe figure.
  if(pcRecipe) return buildFigureFromRecipe(pcRecipe, tint, kind);
  const recipe = recipeFor(recipeSlug);
  if(recipe) return buildFigureFromRecipe(recipe, tint, kind);
  const build = ARCHETYPE_BUILDERS[archetype] || ARCHETYPE_BUILDERS.biped;
  return build(seed, tint, silhouette, weapon);
}

/* ============================================================================
   MODEL-GRAMMAR G3 §2 — CONDITIONS AS MODULES, the render half. theaterConditionModsFrom
   (theater-data.js) hands back a pure array of {kind:"rotation",...} / {kind:"attach",...}
   descriptors; this function is the ONE place that turns those into actual THREE side effects,
   mirroring buildFigureFromRecipe's own "data in, boxes out" discipline — a condition mod is just
   one more small attach-at-anchor step, reusing renderPartInto exactly like a recipe module does
   (no new composition machinery). Applies to PC/ally figures AND foes alike (both carry
   conditionMods off theaterUnitsFrom) since the derivation itself doesn't discriminate by kind.
   `anchors` is the figure's OWN base body's anchor set when known (pcRecipe/bestiary-recipe
   figures always resolve one via Parts.PARTS[base].anchors) — for the fixed archetype-builder
   fallback (no recipe at all) this falls back to Parts.torsoBiped.anchors, the modal body every
   archetype's own weapon/shield placement already assumes (weaponMeshFor's own {0.42,0.5,0.04}
   literal below is torso-biped's mainHand anchor by construction), so an attach mod still lands
   somewhere sane even on a non-recipe figure. Rotation mods are applied to the GROUP itself
   (figure.rotation), same as the existing `u.down` 90°-topple convention — a figure can carry
   BOTH (prone rotation + a separately-tracked down pose) since they're independent signals; this
   function only ever touches rotation.z additively via the mod's own angle, never resetting an
   axis another mod/the down-flag already set. */
function applyConditionMods(figure, mods, anchors, tint){
  if(!mods || !mods.length) return;
  const tints = flatTints(tint);
  mods.forEach(function(m){
    if(!m || !m.kind) return;
    if(m.kind === "rotation"){
      const axis = m.axis || "z";
      figure.rotation[axis] = (figure.rotation[axis] || 0) + (m.angle || 0);
    } else if(m.kind === "attach"){
      const partFn = m.part && Parts.PARTS[m.part];
      if(!partFn) return; // unknown part name — never throw, same total-function discipline as buildFigureFromRecipe
      const a = m.anchor && anchors && anchors[m.anchor];
      const offset = a ? a.pos : { x: 0, y: 0, z: 0 };
      const rotOffset = a ? a.rot : { x: 0, y: 0, z: 0 };
      renderPartInto(figure, partFn, {}, tints, offset, rotOffset);
    }
  });
}

function unitTint(kind){
  if(kind === "pc") return 0xc9a24b;      // gold ring lineage — the PC's distinct silhouette (§3)
  if(kind === "ally") return 0x6fa8c9;
  return 0xc94a2e;                        // G9 tune 3: readable ember/oxblood — the old 0x9c5040 sat too
                                           // close in luminance/desaturation to the (now-lifted) dungeon
                                           // tile tops and got lost against the floor; this is far more
                                           // saturated than any palette tile color, so it separates on
                                           // saturation even where luminance ranges overlap
}

/* G5 ROUND-1 (ruling 2): the base disc's own tint — SAME hex family as unitTint (ember foe / gold PC /
   blue ally), kept as a separate function (not a direct unitTint() reuse) because the disc reads at a
   different opacity/material than a figure's body boxes (a flat MeshBasicMaterial disc, unlit, vs. the
   figure's MeshLambertMaterial boxes) — the color values matching is what makes this the SAME signal
   moved to a new location, not a coincidence two functions happen to agree on hex values today. Small
   per-kind cache (3 possible kinds) so setUnits doesn't allocate a fresh material per unit per call. */
const BASE_DISC_MAT_CACHE = {};
function baseDiscMatFor(kind){
  const key = kind || "foe";
  if(!BASE_DISC_MAT_CACHE[key]){
    BASE_DISC_MAT_CACHE[key] = new THREE.MeshBasicMaterial({
      color: unitTint(kind), transparent: true, opacity: BASE_DISC_OPACITY, depthWrite: false
    });
  }
  return BASE_DISC_MAT_CACHE[key];
}

/* GROUNDING SHADOWS (docs/BATTLE-THEATER.md follow-up, Adam 2026-07-03: "incredibly basic shadows to
   help the eye determine the exact location of things"). A flat, dark, near-opaque quad at ground
   contact — position-grounding, orthogonal to the faction/hostility disc above (G5 ROUND-1's colored
   base disc, unchanged): the blob answers "where exactly does this thing touch the floor," the disc
   answers "whose side is it on." Both coexist per-figure (blob slightly LARGER + darker, seated
   slightly BENEATH the disc — see setUnits' draw order/Y offsets below) and props get one too (they
   never had any grounding mark before this unit — the PSX-clean "no shadow maps, blob quads only" rule
   from §2 was always meant to cover every standing thing on the board, not just units).
   ONE shared near-black material (no per-kind tint — a grounding shadow reads the same color under a
   gold PC or an ember foe, only the disc above it carries the hostility tint) + a small per-scale
   geometry cache, same caching discipline as baseDiscGeoFor in setUnits. */
const GROUNDING_BLOB_MAT = new THREE.MeshBasicMaterial({
  color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false
});
const GROUNDING_BLOB_GEO_CACHE = {};
function groundingBlobGeoFor(radius){
  const key = radius.toFixed(3);
  if(!GROUNDING_BLOB_GEO_CACHE[key]) GROUNDING_BLOB_GEO_CACHE[key] = new THREE.CircleGeometry(radius, 16);
  return GROUNDING_BLOB_GEO_CACHE[key];
}
/* builds + positions one grounding blob quad at (x,z), seated at `y` (below whatever hostility disc or
   figure sits above it — callers pass a slightly lower y than their own disc/base so the blob reads as
   UNDER it, never fighting it for the same plane / z-fighting flicker). `radius` is the blob's own
   size — callers pass something a hair larger than their disc/footprint radius (§3: "blob slightly
   larger, darker, beneath the disc"). Returns the mesh so the caller can add it to whichever group it
   tracks (S.shadowGroup for units, S.propGroup for props — see call sites below). */
function addGroundingBlob(group, x, z, y, radius){
  if(!group) return null;
  const mesh = new THREE.Mesh(groundingBlobGeoFor(radius), GROUNDING_BLOB_MAT);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function hashSeed(id){
  let h = 0;
  const s = String(id || "");
  for(let i = 0; i < s.length; i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h) % 1000;
}

/* ============================================================================
   The Theater instance. One live instance per mount() call; retire() tears it fully down so a
   fresh mount() can start clean (the caller owns the mount/retire lifecycle, e.g. across panel
   opens/closes — this file never assumes it's mounted exactly once per page load).
   ============================================================================ */
function createTheaterState(){
  return {
    mounted: false, el: null, renderer: null, scene: null, camera: null,
    tileGroup: null, propGroup: null, unitGroup: null, shadowGroup: null,
    rotationStep: 0, dirty: false, raf: null, resizeHandler: null,
    // T1.5: board-fit tracking (§3 camera fit) — the half-extents (world units) of the LAST board's
    // tile footprint, used both at setBoard time and on every rotate() so the fit survives rotation.
    // boardHalfX/boardHalfZ (G9 camera-yaw fix) are the per-axis halves — needed separately because the
    // fit must be computed against the YAW-ROTATED projected bounding box (§ placeCamera), not just the
    // axis-aligned envelope; boardHalfExtent is kept as the axis-aligned max for back-compat/logging.
    boardHalfExtent: 5, boardHalfX: 5, boardHalfZ: 5, boardCenter: null, boardOrigin: null,
    // THEATER-ZOOM-SPREAD: zoomLevel is a MULTIPLIER on the auto-fit viewSize (1.0 = default fit,
    // <1 = zoomed in, >1 = zoomed out), applied in placeCamera AFTER the fit recomputes viewSize from
    // the current board's half-extents — see ZOOM_STEP_FACTOR's own header comment for why a
    // multiplier (not a stored absolute viewSize) is what survives setBoard()/rotate() re-fits
    // proportionally. Reset to the small-board-biased default on every setBoard() call (a fresh board
    // gets a fresh bias reading, not the previous board's zoom carried over at the wrong scale).
    zoomLevel: 1,
    zoomBiasBandCount: null, // last band-count shape the small-board bias was computed against (setBoard)
    env: null,           // last board's env key — drives void/fog color
    textures: {},         // semantic key -> loaded+cached THREE.Texture (setTextures)
    psxEnabled: true,     // T1.5 preview-only toggle (dev/theater-preview.html's "PSX/clean" button);
                           // the shipped default is always PSX ON — this only exists so the visual
                           // gate can A/B the grit pass against the T1 clean baseline in one click.
    // T3 (theater-verbs, §4): fxGroup holds every verb-spawned FX primitive (glyphs, elemental
    // bursts, the absurdity rift) — swept by clearGroup exactly like tiles/props/units on the next
    // setBoard/setUnits/retire, so a verb never leaks geometry across a re-render. tweens is the
    // live tween queue theater-verbs.js's tickTweens owns; tweenRaf is this file's OWN animation-loop
    // handle (separate from the render-on-demand `raf` above — see startTweenLoop/stopTweenLoop).
    fxGroup: null, tweens: [], tweenRaf: null,
    // last board's grid + origin, kept for zoneToWorld (T3): the same {cx,cz} setBoard already
    // computes for centering tiles/units, plus the grid's own band/lane arrays so a "band:lane"
    // string resolves to the identical world coordinates theaterUnitsFrom would place a unit at.
    lastGrid: null,
    // BOARD LIGHTING: ambientLight/pointLights are the LIVE THREE light objects setBoard rebuilds from
    // data.light.profile (see applyLightProfile) — kept off the scene graph groups (tile/prop/unit/etc.
    // groups are swept by clearGroup on every setBoard; lights are their own small set, added directly
    // to S.scene, disposed+removed explicitly by applyLightProfile's own teardown each call rather than
    // routed through clearGroup, since THREE.Light has no geometry/material to dispose). lightProfileKey
    // + flickerRaf/flickerRunning drive the flicker tick (tickLightFlicker) — a SEPARATE, cheap-by-design
    // low-frequency loop from both the render-on-demand `raf` and the tween `tweenRaf` chains (see that
    // function's own header for why a full-rAF loop would be wasteful for a "flicker ~2x/sec" cadence).
    ambientLight: null, pointLights: [], lightProfileKey: null, flickerRaf: null, keyLight: null
  };
}

let S = createTheaterState();

function supportsWebGL(){
  try{
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  }catch(e){ return false; }
}

function markDirty(){
  S.dirty = true;
  scheduleRender();
}

function scheduleRender(){
  if(!S.mounted || S.raf) return;
  S.raf = requestAnimationFrame(() => {
    S.raf = null;
    if(S.dirty && S.renderer && S.scene && S.camera){
      S.renderer.render(S.scene, S.camera);
      S.dirty = false;
    }
  });
}

/* T1.5 §3 camera fit: frame the board to fill ~80% of the canvas — fit the orthographic camera's
   half-height to the board's own half-extent (its largest tile-footprint radius) with a small margin,
   independent of aspect so it holds through resize, and independent of rotationStep so a 90°-turned
   board reads the SAME fill (an orthographic camera looking at a square-ish footprint from any of the
   4 yaw steps sees the same silhouette envelope — the fit only needs to be recomputed on setBoard,
   not on every rotate(), but rotate() calls this too for safety against an out-of-order call site).
   G9 TUNE 5 (docs/PRE-PLAYTEST-GAUNTLET.md §10b): the orchestrator measured the board filling only
   ~45% of the canvas, high-left of center. Two compounding bugs:
     1. An unexplained extra `* 1.15` pad on top of the already-intended CAM_FIT_MARGIN division
        inflated viewSize ~28% past its target, shrinking the board's apparent fill well below 80%.
     2. The fit only ever sized `viewSize` off the board's half-extent and applied `aspect` to the
        HORIZONTAL box only (`left`/`right`) — it never checked the fit against BOTH canvas dimensions.
        On a canvas narrower than it is tall (aspect < 1) this UNDER-fills horizontally (viewSize's
        vertical target left unchecked against the narrower width), which reads as the board sitting
        small and pushed toward one side rather than centered and filling the frame.
   G9 camera-yaw fix (this pass): the tune-5 fit above sized `half` off the AXIS-ALIGNED bounding box
   (max of the board's raw half-width/half-depth), which is only correct when the camera looks straight
   down an axis. Restoring the CAM_YAW_OFFSET_DEG 45° dimetric offset means the camera now looks at the
   board's DIAGONAL, so the true on-screen footprint is the board's YAW-ROTATED projected bounding box —
   for a rectangle of half-extents (hx,hz) viewed along a ground-plane direction (dx,dz), the projected
   half-width along that direction's perpendicular is `hx*|dx| + hz*|dz|` (an axis-aligned box's support
   function). Skipping this and reusing the old axis-aligned `half` at a 45° yaw underestimates the
   screen footprint by up to ~41% (a square's diagonal vs. its side), which is exactly what overflowed
   fixture 2 (a non-square 100'x60' room) off the edge of the canvas at some rotation steps. */
function placeCamera(){
  if(!S.camera) return;
  const rad = (CAM_ELEV_DEG * Math.PI) / 180;
  const yaw = (S.rotationStep * 90 * Math.PI) / 180 + (CAM_YAW_OFFSET_DEG * Math.PI) / 180;

  const hx = Math.max(2, S.boardHalfX || S.boardHalfExtent || 5);
  const hz = Math.max(2, S.boardHalfZ || S.boardHalfExtent || 5);
  // Screen-right axis (ground-plane, perpendicular to the camera's horizontal look direction) and the
  // ground-plane component of the screen-up axis (the camera's horizontal look direction itself, whose
  // contribution to screen-vertical is foreshortened by sin(elevation) — see camDist/y below for the
  // matching elevation split). Support-function projection of the (hx,hz) box onto each.
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
  const screenHalfWidth = hx * Math.abs(cosYaw) + hz * Math.abs(sinYaw);
  const screenHalfDepth = hx * Math.abs(sinYaw) + hz * Math.abs(cosYaw);
  const screenHalfHeight = screenHalfDepth * Math.sin(rad);
  // half: the larger of the two screen-space half-extents the fit needs to cover — mirrors the old
  // scalar's role (the single number viewSizeForHeight/Width fit against) but now yaw-aware.
  const half = Math.max(screenHalfWidth, screenHalfHeight);
  // aspect must be known BEFORE viewSize is picked, so the fit can be checked against both canvas
  // dimensions at once (fix #2) — target: the board's ROTATED screen footprint (both the horizontal
  // and the foreshortened-vertical extents) fills CAM_FIT_MARGIN (0.90 -> ~80% after typical void/
  // margin framing) of whichever canvas dimension is more constraining.
  const w = S.el ? (S.el.clientWidth || 480) : 480;
  const h = S.el ? (S.el.clientHeight || Math.round(w * (9 / 16))) : Math.round(480 * (9 / 16));
  const aspect = w / Math.max(1, h);
  // viewSize is the camera's half-HEIGHT. To fill the frame on the height axis: viewSize = screenHalfHeight / margin.
  // To fill the frame on the width axis: viewSize * aspect = screenHalfWidth / margin  =>  viewSize = screenHalfWidth / (margin * aspect).
  // Each candidate only guarantees containment on ITS OWN axis — picking the SMALLER (the tune-5 fit's
  // choice) leaves the OTHER axis under-sized, i.e. cropped, whenever screenHalfWidth != screenHalfHeight
  // (which the yaw-rotated footprint almost never is, and wasn't even reliably true in the axis-aligned
  // case on a non-square canvas — this is the actual mechanism behind "fixture 2 overflows"). Taking the
  // LARGER of the two guarantees BOTH axes are contained: the frustum this produces is always >= the
  // per-axis requirement, so the more generous axis just carries extra margin instead of clipping the
  // tighter one (fix #1 already removed the stray 1.15 overshoot so this doesn't over-shrink the board).
  const viewSizeForHeight = screenHalfHeight / CAM_FIT_MARGIN;
  const viewSizeForWidth = screenHalfWidth / (CAM_FIT_MARGIN * Math.max(aspect, 0.0001));
  const fittedViewSize = Math.max(viewSizeForHeight, viewSizeForWidth);
  // THEATER-ZOOM-SPREAD: zoomLevel scales the FITTED viewSize (a smaller viewSize = a tighter ortho
  // frustum = the board reads bigger on screen = "zoomed in") — applied here, after the fit itself is
  // computed, so zoom is always relative to "the board's own auto-fit," never an absolute world-unit
  // size that would read inconsistently across different board footprints.
  const viewSize = fittedViewSize * (S.zoomLevel || 1);
  S.viewSize = viewSize;

  // camera distance scales with viewSize so a big board doesn't clip through a fixed-distance camera
  // (T1 used a flat CAM_DIST=26; T1.5 makes it board-relative so the fit holds for any room size).
  // Distance also needs to clear the board's rotated footprint (not just `half`'s old axis-aligned
  // reading), so it's derived from the same screen-space half used for the fit.
  const camDist = Math.max(half, hx, hz) * 2.6;
  const horiz = Math.cos(rad) * camDist;
  const y = Math.sin(rad) * camDist;
  const x = Math.sin(yaw) * horiz;
  const z = Math.cos(yaw) * horiz;
  S.camera.position.set(x, y, z);
  S.camera.lookAt(S.boardCenter || new THREE.Vector3(0, 0, 0));

  S.camera.left = -viewSize * aspect;
  S.camera.right = viewSize * aspect;
  S.camera.top = viewSize;
  S.camera.bottom = -viewSize;
  S.camera.far = Math.max(100, camDist + FOG_FAR + 20);
  S.camera.updateProjectionMatrix();

  if(S.scene && S.scene.fog){
    // fog distances scale with the fit too, so a huge board's far edge still just "softens" instead
    // of vanishing entirely or not fogging at all — proportional to camDist rather than fixed.
    S.scene.fog.near = camDist * 0.55;
    S.scene.fog.far = camDist * 1.65;
  }
}

function clearGroup(group){
  if(!group) return;
  while(group.children.length){
    const child = group.children.pop();
    if(child.geometry) child.geometry.dispose();
    if(child.material){
      if(Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
  }
}

/* T1.5 §2: per-env deep void background, keyed by the same env strings theater-data.js's
   THEATER_ENV_PALETTE uses (a small duplicated table — this module is a sealed ES-module scope that
   can't read that classic-script const, §2's "module scope stays sealed" boundary; kept in sync with
   theater-data.js's voidTint values by convention/comment, not import). Falls back to the module's
   own VOID_BG default for any env this table doesn't recognize. */
const ENV_VOID_TINT = {
  dungeon: 0x0a0807, urban: 0x09090a, wilderness: 0x07090a, breach: 0x0a0610
};
function voidTintFor(env){
  return (env && ENV_VOID_TINT[env] !== undefined) ? ENV_VOID_TINT[env] : VOID_BG;
}

/* DEAD-STATE (2026-07-03): the obliteration tile marker reuses theater-data.js's own per-env `scorch`
   tint (the SAME color a hazard tile already uses for a "burn/scorch-mark" read, theater-data.js's own
   header comment) — a small mirrored table, same discipline as ENV_VOID_TINT just above (this module's
   sealed ES-module scope can't import THEATER_ENV_PALETTE, so these are kept in sync with that table's
   `scorch` field by convention/comment, not import). Falls back to the dungeon value for any env this
   table doesn't recognize, matching voidTintFor's own degrade discipline. */
const ENV_SCORCH_TINT = {
  dungeon: 0x3a2418, urban: 0x3f2c1c, wilderness: 0x3a2a16, breach: 0x421f2c
};
function scorchTintFor(env){
  return (env && ENV_SCORCH_TINT[env] !== undefined) ? ENV_SCORCH_TINT[env] : ENV_SCORCH_TINT.dungeon;
}

/* ============================================================================
   BOARD LIGHTING (docs/BATTLE-THEATER.md follow-up, Adam 2026-07-03) — §2: "light profiles in the
   theater." Each profile is {ambient:{color,intensity}, points:[{color,intensity,pos}]}, applied on
   setBoard from `data.light.profile` (the string key theaterBoardFrom/theater-data.js stamps — see
   that file's THEATER_LIGHT_TABLE, kept in sync with these keys by convention/comment, same one-way
   classic/ES-module boundary discipline as ENV_VOID_TINT above). PSX-clean per the spec: 1-2 point
   lights max, no shadow-mapping (renderer.shadowMap stays disabled — grounding is the blob-quad work
   below, never a real shadow map), Lambert-friendly (MeshLambertMaterial already reacts correctly to
   THREE.PointLight/AmbientLight with zero material changes needed).
   `points[].pos` is a FRACTION of the board's own half-extents (not a fixed world position) — applied
   in applyLightProfile below by multiplying against S.boardHalfX/boardHalfZ, so a point sits at a
   sane spot (center-ish, or biased toward an edge) regardless of the current board's actual size.
   `flicker` (optional): a per-profile amplitude (0 = none) for the slow subtle intensity tween — see
   tickLightFlicker below for the "only when a flicker profile is live" cadence discipline.

   POINT-LIGHT INTENSITY SCALE (found live in the browser-check pass, worth flagging): three.js r166
   uses PHYSICALLY CORRECT photometric units for THREE.PointLight/THREE.SpotLight — intensity is
   candela (lm/sr), which falls off with the inverse square of distance, so a value calibrated for the
   OLD pre-r155 "watts-ish" scale (0.4-1.5, what a first pass here used) reads as functionally zero at
   even a few world units away — every profile's point light was invisible, all nine profiles looked
   identical to `dark`. THREE.AmbientLight is UNAFFECTED (it isn't distance-attenuated, so its intensity
   scale didn't change across that three.js version bump) — only the point-light intensities below are
   the "large" numbers; ambient stays in the original small 0.3-0.85 range. Point lights use decay:0
   (applyLightProfile) — a flat, non-attenuating light rather than physically-correct falloff, since
   the board is small/fixed-size and a decaying point light would need per-profile distance tuning to
   read consistently; decay:0 makes the intensity number alone predictable board-to-board. */
const LIGHT_PROFILES = {
  dark: {
    ambient: { color: 0x8fa8c8, intensity: 0.38 },
    points: [],
    flicker: 0
  },
  torchlit: {
    ambient: { color: 0x4a3826, intensity: 0.32 },
    points: [ { color: 0xffa04a, intensity: 18, pos: { x: 0, y: 2.2, z: 0.6 } } ],
    flicker: 0.14
  },
  lavalit: {
    // "from below/edge tiles" (§2's own brief) — a literal below-floor Y is fully occluded by the tile
    // column geometry from the fixed top-down-ish camera (tiles sit roughly y:[-0.5, +0.5+height]), so
    // this reads as a low glow seeping up AT floor level rather than truly under it: still visibly the
    // lowest/reddest point of any profile, but actually contributes light to the scene.
    ambient: { color: 0x3a1c14, intensity: 0.3 },
    points: [ { color: 0xff5522, intensity: 22, pos: { x: 0, y: 0.15, z: 0 } } ],
    flicker: 0.18
  },
  "fungal-glow": {
    ambient: { color: 0x3a5a3a, intensity: 0.42 },
    points: [ { color: 0x7fdc6a, intensity: 9, pos: { x: 0.4, y: 1.0, z: 0.4 } } ],
    flicker: 0.05
  },
  "magic-glow": {
    ambient: { color: 0x4048a0, intensity: 0.4 },
    points: [ { color: 0x8a6bff, intensity: 14, pos: { x: -0.3, y: 1.6, z: 0.2 } } ],
    flicker: 0.06
  },
  lamplit: {
    ambient: { color: 0x40382a, intensity: 0.34 },
    points: [ { color: 0xffcf8a, intensity: 16, pos: { x: 0, y: 2.4, z: -0.5 } } ],
    flicker: 0.1
  },
  moonlit: {
    ambient: { color: 0x8fa0c8, intensity: 0.55 },
    points: [ { color: 0xaebfe8, intensity: 8, pos: { x: 0.5, y: 3, z: -0.5 } } ],
    flicker: 0
  },
  daylit: {
    ambient: { color: 0xd8dce0, intensity: 0.85 },
    points: [ { color: 0xfff2d8, intensity: 9, pos: { x: 0.4, y: 3, z: -0.4 } } ],
    flicker: 0
  },
  overcast: {
    ambient: { color: 0xa8adb5, intensity: 0.6 },
    points: [],
    flicker: 0
  },
  voidlit: {
    ambient: { color: 0x5a3a6e, intensity: 0.3 },
    points: [ { color: 0x9a5ad0, intensity: 11, pos: { x: 0, y: 1.2, z: 0 } } ],
    flicker: 0.08
  }
};
const LIGHT_DEFAULT_PROFILE = "dark";
function lightProfileFor(key){
  return LIGHT_PROFILES[key] || LIGHT_PROFILES[LIGHT_DEFAULT_PROFILE];
}

/* rebuild S.ambientLight/S.pointLights from a profile key. Idempotent + safe pre-mount (no-op if
   S.scene is absent). Tears down the PRIOR lights first (THREE.Light isn't pooled by clearGroup — it
   has no geometry/material to dispose, just remove-from-scene) so repeated setBoard calls on the SAME
   profile don't accumulate duplicate lights; `points` positions are board-relative FRACTIONS
   (LIGHT_PROFILES' own header comment) resolved against S.boardHalfX/boardHalfZ so a point sits at a
   sane spot regardless of the current board's size — falls back to a flat 4-unit default pre-setBoard
   (mount-time call, no board fitted yet). */
function applyLightProfile(key){
  if(!S.scene) return;
  if(S.ambientLight){ S.scene.remove(S.ambientLight); S.ambientLight = null; }
  (S.pointLights || []).forEach(l => S.scene.remove(l));
  S.pointLights = [];
  stopLightFlicker();

  const profile = lightProfileFor(key);
  S.lightProfileKey = key;

  const ambient = new THREE.AmbientLight(profile.ambient.color, profile.ambient.intensity);
  S.scene.add(ambient);
  S.ambientLight = ambient;

  const hx = S.boardHalfX || 4, hz = S.boardHalfZ || 4;
  profile.points.forEach(p => {
    // decay:0, distance:0 — a flat non-attenuating point light (see LIGHT_PROFILES' own header on why:
    // predictable per-profile intensity numbers regardless of board size, no physically-correct falloff
    // tuning needed per profile).
    const light = new THREE.PointLight(p.color, p.intensity, 0, 0);
    light.position.set((p.pos.x || 0) * hx, p.pos.y != null ? p.pos.y : 1.5, (p.pos.z || 0) * hz);
    S.scene.add(light);
    S.pointLights.push(light);
  });

  if(profile.flicker > 0) startLightFlicker(profile.flicker);
}

/* FLICKER (§2's own "optional flicker for torch/lava... a low-frequency setInterval that marks dirty
   ~2x/sec ONLY for flicker profiles; keep it cheap"). Deliberately NOT the tween rAF chain (theater-
   verbs.js's tickTweens runs every frame while >=1 verb tween is live — a torch flicker isn't a verb,
   it's ambient scene mood that should keep going for the ENTIRE time a flicker profile is mounted, verb
   tweens or no) and NOT a plain rAF loop either (60fps for a "randomly nudge one light's intensity"
   effect is wasted work the render-on-demand discipline this file otherwise holds to would flag) — a
   setInterval at ~2Hz is the cheapest mechanism that still reads as a living flame: each tick nudges
   every current point light's intensity by a small random delta around its profile base and calls
   markDirty() once. Self-stopping: stopLightFlicker (called at the top of every applyLightProfile, and
   from retire()) clears the interval, so a flicker never survives past the profile that requested it or
   past retire(). */
function startLightFlicker(amplitude){
  stopLightFlicker();
  const bases = S.pointLights.map(l => l.intensity);
  S.flickerRaf = setInterval(() => {
    if(!S.mounted || !S.pointLights.length){ stopLightFlicker(); return; }
    S.pointLights.forEach((l, i) => {
      const base = bases[i] != null ? bases[i] : l.intensity;
      l.intensity = Math.max(0.05, base + (Math.random() * 2 - 1) * amplitude);
    });
    markDirty();
  }, 480); // ~2x/sec per §2's own cadence note
}
function stopLightFlicker(){
  if(S.flickerRaf != null){ clearInterval(S.flickerRaf); S.flickerRaf = null; }
}

/* §4 texture hooks. TextureLoader is async by nature; loaded textures land in S.textures keyed by
   semantic name and get nearest-filtered the moment they resolve. A failed/missing manifest fetch or
   a failed individual image load is swallowed — palette-only stays correct with zero textures loaded,
   which is exactly the "degrade silently to palette-only if absent" contract. */
const textureLoader = new THREE.TextureLoader();

/* `manifest` is the flat {semanticKey: path} shape (§4's public contract); non-string/falsy entries
   and a reserved "_comment"/"alternates" style metadata key (the real textures-psx manifest carries
   both — see its own top-level fields) are silently skipped rather than attempted as an image load,
   same "never throw, degrade to palette-only for that key" discipline as a failed fetch.
   `baseUrl`, when given, resolves each relative path against it (used by the internal default-fetch
   path below, since the manifest's own paths are relative to assets/textures-psx/manifest.json's own
   location, not the calling page's document base); omitted for the public setTextures() call, whose
   contract is "manifest is a flat semantic-key manifest shape {'stone':path,...}" with paths the
   CALLER is responsible for making page-resolvable (a caller-supplied absolute/page-relative path is
   used as-is, matching how TextureLoader.load already behaves without this wrapper). */
// reserved manifest keys that are metadata, not a semantic-key->path entry — the real textures-psx
// manifest (a parallel unit's own file, outside this unit's control) carries both alongside its
// semantic keys, so this file can't assume "every key is a texture" even though the §4 contract
// describes a "flat {semanticKey:path} manifest shape". "alternates" is an object anyway (fails the
// typeof-string check below on its own) but "_comment" is a plain string and would otherwise be
// attempted as an image path — hence this explicit skip list rather than relying on shape alone.
const TEXTURE_MANIFEST_RESERVED_KEYS = new Set(["_comment", "alternates"]);

function loadTextureManifest(manifest, baseUrl){
  if(!manifest || typeof manifest !== "object") return;
  Object.keys(manifest).forEach(key => {
    if(TEXTURE_MANIFEST_RESERVED_KEYS.has(key)) return;
    const path = manifest[key];
    if(!path || typeof path !== "string") return; // skips non-path metadata (e.g. a nested object)
    if(S.textures[key]) return; // already loaded/loading — setTextures never re-fetches a known key
    let resolved = path;
    if(baseUrl){
      try{ resolved = new URL(path, baseUrl).href; }catch(e){ resolved = path; }
    }
    S.textures[key] = "pending";
    textureLoader.load(
      resolved,
      (tex) => { S.textures[key] = nearestify(tex); markDirty(); },
      undefined,
      () => { delete S.textures[key]; } // load failure -> silently forget the key, palette wins
    );
  });
}

function setTextures(manifest){
  loadTextureManifest(manifest);
}

function fetchDefaultTextureManifest(){
  // best-effort GET of the parallel asset unit's manifest, resolved relative to THIS MODULE's own
  // URL (import.meta.url) rather than the calling page's location — a plain relative fetch() path
  // resolves against the document base, which breaks the moment this module is mounted from a page
  // at a different path depth than genesis.html's repo root (e.g. dev/theater-preview.html sits one
  // level down, so a bare "assets/..." 404s at dev/assets/...). theater-boot.js lives at
  // src/ui/theater-boot.js, so assets/textures-psx/ is two levels up from THIS file regardless of
  // which page imported it. No throw, no console.error on a 404 — that's the expected common case
  // until the textures-psx unit lands (or when a caller sits at yet another path depth).
  try{
    const manifestUrl = new URL("../../assets/textures-psx/manifest.json", import.meta.url).href;
    fetch(manifestUrl, { cache: "no-store" })
      .then(r => (r && r.ok) ? r.json() : null)
      .then(json => { if(json) loadTextureManifest(json, manifestUrl); })
      .catch(() => {});
  }catch(e){ /* fetch unavailable or blocked — palette-only baseline, no surfaced error */ }
}

/* resolves the material(s) for one tile column: a texture (if loaded + kind-mapped) tinted by the
   tile's own palette color, or the flat-color top/side pair (T1's baseline) when no texture applies.
   Returns the 6-entry BoxGeometry material array (index 2 = +y = top face, §1 rule 2). */
function tileMaterialsFor(t, topColorCache, sideColorCache, colorFor){
  const texKey = TILE_KIND_TEXTURE_KEY[t.kind];
  const tex = texKey && S.textures[texKey];
  const hasTex = tex && tex !== "pending";
  const topColor = colorFor(t.tint || "#4a5a3c", 1.35, topColorCache);
  const sideColor = colorFor(t.tint || "#4a5a3c", 0.6, sideColorCache);
  const topMat = applyPsxShaderTweaks(hasTex
    ? new THREE.MeshLambertMaterial({ map: tex, color: topColor })   // texture tinted by palette color
    : new THREE.MeshLambertMaterial({ color: topColor }));
  const sideMat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ color: sideColor })); // sides
                                                                         // stay flat-tinted (§1 rule 2
                                                                         // is a TOP-face trick; texturing
                                                                         // sides too would wash out the
                                                                         // top/side contrast)
  return [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
}

/* T1.5 PSX low-res: sizes the renderer's DRAWING BUFFER to PSX_RES_SCALE of the element's CSS box,
   then stretches the canvas back up via CSS width/height + `image-rendering:pixelated` (set once at
   mount, never re-set per frame). `renderer.setSize(w, h, false)` — the `false` updateStyle arg is
   the whole trick: it sizes the drawing buffer to the LOW w/h without also writing that low size back
   onto the canvas's CSS box, so the CSS block below is what actually controls the on-screen size. */
function applyPsxCanvasSize(renderer, canvas, cssW, cssH){
  const scale = S.psxEnabled ? PSX_RES_SCALE : 1;
  const drawW = Math.max(1, Math.round(cssW * scale));
  const drawH = Math.max(1, Math.round(cssH * scale));
  renderer.setSize(drawW, drawH, false);
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  canvas.style.imageRendering = S.psxEnabled ? "pixelated" : "auto";
}

/* T1.5 §4 texture hooks: apply NearestFilter + no mipmap smoothing to any texture the moment it
   enters the scene, whatever the entry point (setTextures' loader callback AND any future loader) —
   centralizing this one call keeps "every texture is nearest-filtered" a single source of truth
   instead of a convention every call site has to remember. */
function nearestify(tex){
  if(!tex) return tex;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/* ============================================================================
   STRETCH (attempted after the mandatory items were green, per the build order): ordered-dither +
   vertex-snap, both via material.onBeforeCompile fragment/vertex injection, gated behind
   PSX_DITHER_ENABLED / PSX_VERTEX_SNAP_ENABLED so a later pass can flip them independently.
   Applied through ONE shared helper (applyPsxShaderTweaks) so every MeshLambertMaterial this file
   creates (tiles, props, fallback figures) gets both consistently — no call site has to remember.
   ============================================================================ */

/* ordered-dither: a classic 4x4 Bayer matrix, sampled by SCREEN-space pixel coordinate (gl_FragCoord)
   so the dither pattern is stable in screen space (not swimming with the object) — the standard PSX/
   retro dithering trick, applied as a tiny per-channel threshold nudge just before the fragment's
   final opaque output. Injected right before <opaque_fragment> so it dithers the LIT color (post
   lighting), matching how real PSX titles dither the final framebuffer write. */
const DITHER_GLSL = `
  #ifdef PSX_DITHER
  {
    const float bayer4x4[16] = float[16](
      0.0,  8.0,  2.0, 10.0,
      12.0, 4.0, 14.0,  6.0,
      3.0, 11.0,  1.0,  9.0,
      15.0, 7.0, 13.0,  5.0
    );
    int dx = int(mod(gl_FragCoord.x, 4.0));
    int dy = int(mod(gl_FragCoord.y, 4.0));
    float threshold = (bayer4x4[dy * 4 + dx] / 16.0 - 0.5) * (1.0 / ${PSX_DITHER_AMPLITUDE.toFixed(1)});
    outgoingLight += threshold;
  }
  #endif
`;

/* vertex-snap: quantizes the vertex's CLIP-SPACE xy to a coarse grid (relative to w, so it holds
   under perspective/ortho alike) before rasterization — the "wobbling low-poly PSX vertex" look,
   applied AFTER <project_vertex> (which is what actually writes gl_Position) so it snaps the final
   projected position, not an intermediate. */
const VERTEX_SNAP_GLSL = `
  #ifdef PSX_VERTEX_SNAP
  {
    float snapGrid = ${PSX_VERTEX_SNAP_GRID.toFixed(1)};
    vec4 snapped = gl_Position;
    snapped.xy = round((snapped.xy / snapped.w) * snapGrid) / snapGrid * snapped.w;
    gl_Position = snapped;
  }
  #endif
`;

function applyPsxShaderTweaks(material){
  if(!PSX_DITHER_ENABLED && !PSX_VERTEX_SNAP_ENABLED) return material;
  const priorHook = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if(typeof priorHook === "function") priorHook(shader, renderer);
    if(PSX_DITHER_ENABLED){
      shader.fragmentShader = "#define PSX_DITHER\n" + shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        DITHER_GLSL + "\n  #include <opaque_fragment>"
      );
    }
    if(PSX_VERTEX_SNAP_ENABLED){
      shader.vertexShader = "#define PSX_VERTEX_SNAP\n" + shader.vertexShader.replace(
        "#include <project_vertex>",
        "#include <project_vertex>\n  " + VERTEX_SNAP_GLSL
      );
    }
  };
  // three.js keys its program cache partly on a hash of onBeforeCompile.toString() — since every
  // material here gets the SAME injected function body (only priorHook differs, and none of this
  // file's materials set one), they naturally share one compiled program. No extra cache-key work
  // needed for T1.5's usage (a future per-material custom hook would need shader.customProgramCacheKey).
  return material;
}

function mount(el, opts){
  if(!el || !supportsWebGL()) return false;
  retire(); // idempotent: a re-mount tears down any prior instance first
  const priorTextures = S.textures; // T1.5: setTextures may be called before mount() — preserve any
                                     // already-loaded/loading cache across the retire()->fresh-state reset.
  S = createTheaterState();
  if(priorTextures) S.textures = priorTextures;
  if(opts && opts.psx === false) S.psxEnabled = false; // preview-only escape hatch, default stays ON

  const width = el.clientWidth || 480;
  const height = el.clientHeight || Math.round(width * (9 / 16));

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  // antialias OFF: PSX authenticity (T1's antialias:true fought the low-res/pixelated read) — the
  // low internal resolution + pixelated upscale IS the texture, smoothing it defeats the point.
  renderer.setClearColor(VOID_BG, 1);
  renderer.shadowMap.enabled = false; // §2: "no shadow maps" — blob quads only
  el.innerHTML = "";
  el.appendChild(renderer.domElement);
  applyPsxCanvasSize(renderer, renderer.domElement, width, height);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(VOID_BG);
  // §2 item: scene fog, near void-black, distance-tuned by placeCamera() (proportional to the fitted
  // camera distance) so the far board edge just softens rather than hard-clipping into the void.
  scene.fog = new THREE.Fog(VOID_BG, FOG_NEAR, FOG_FAR);

  const aspect = width / Math.max(1, height);
  const viewSize = 10;
  const camera = new THREE.OrthographicCamera(
    -viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 100
  );

  // BOARD LIGHTING: the key DirectionalLight stays a soft, fixed fill (keeps every Lambert face from
  // going fully flat/unlit on the shadowed side of a box — it's not the profile's job to replace basic
  // 3D modeling, only to color/mood the scene) — dimmer than the T1 baseline (0.55 -> 0.3) now that the
  // per-profile ambient+points below carry most of the mood. ambient/points themselves are NOT created
  // here — applyLightProfile (called once below with the mount-time default, and again on every
  // setBoard) owns their full lifecycle so mount() and setBoard() never duplicate that bookkeeping.
  const key = new THREE.DirectionalLight(0xffffff, 0.3);
  key.position.set(4, 10, 6);
  scene.add(key);
  S.keyLight = key;

  const tileGroup = new THREE.Group();
  const propGroup = new THREE.Group();
  const unitGroup = new THREE.Group();
  const shadowGroup = new THREE.Group();
  const fxGroup = new THREE.Group();     // T3: verb/FX primitives (theater-verbs.js), swept like any other group
  scene.add(tileGroup, propGroup, shadowGroup, unitGroup, fxGroup);

  S.mounted = true;
  S.el = el;
  S.renderer = renderer;
  S.scene = scene;
  S.camera = camera;
  S.tileGroup = tileGroup;
  S.propGroup = propGroup;
  S.unitGroup = unitGroup;
  S.shadowGroup = shadowGroup;
  S.fxGroup = fxGroup;
  S.tweens = [];
  S.rotationStep = 0;
  S.boardCenter = new THREE.Vector3(0, 0, 0);
  S.env = THEATER_DEFAULT_ENV_FALLBACK;
  applyLightProfile(LIGHT_DEFAULT_PROFILE); // mount-time baseline; setBoard re-applies from real board.light

  placeCamera();

  S.resizeHandler = () => {
    if(!S.mounted || !S.el || !S.renderer || !S.camera) return;
    const w = S.el.clientWidth || width;
    const h = S.el.clientHeight || height;
    applyPsxCanvasSize(S.renderer, S.renderer.domElement, w, h);
    placeCamera(); // recomputes left/right from the new aspect at the current fit's viewSize
    markDirty();
  };
  window.addEventListener("resize", S.resizeHandler);

  // §4: best-effort, silent-degrade fetch of the parallel textures unit's manifest. Never blocks
  // mount()'s synchronous return, never throws into the caller, never surfaces a console error for
  // the expected-common case (the manifest doesn't exist yet / a different unit hasn't landed it).
  fetchDefaultTextureManifest();

  markDirty();
  return true;
}

function setBoard(data){
  if(!S.mounted || !data) return;
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);

  const tiles = data.tiles || [];
  let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
  tiles.forEach(t => {
    minX = Math.min(minX, t.x); maxX = Math.max(maxX, t.x);
    minZ = Math.min(minZ, t.z); maxZ = Math.max(maxZ, t.z);
  });
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  // G9 tune 6 (docs/PRE-PLAYTEST-GAUNTLET.md §10b): the off-center/undersized-looking board bug the
  // orchestrator's tune-5 fill-fraction fix didn't fully solve. Every mesh below (tiles here, units in
  // setUnits) is positioned at `coord - cx`/`coord - cz` — i.e. the geometry is ALREADY re-centered to
  // sit at world origin (0,0,0). boardCenter is the camera's lookAt() target (placeCamera) and MUST be
  // that same world origin, not the pre-shift centroid (cx,cz) — the old code aimed the camera at a
  // point 4-5 world units away from where the board actually renders, which reads as the board sitting
  // small and pushed toward one side (exactly what an off-target lookAt in an orthographic camera looks
  // like: the correctly-sized/centered box appears shifted because the "center of frame" isn't where
  // the geometry is). boardOrigin keeps the raw (cx,cz) for the tile/unit shift math below (unchanged).
  S.boardCenter = new THREE.Vector3(0, 0, 0);
  S.boardOrigin = { cx, cz };
  // §3 camera fit: half-extent is the larger of the board's own half-width/half-depth (world units;
  // +1 covers the tile's own half-size at the footprint edge so the fit doesn't clip the outer row).
  // G9 camera-yaw fix: boardHalfX/boardHalfZ keep the PER-AXIS halves (same +1 pad) so placeCamera can
  // compute the actual yaw-rotated projected footprint instead of assuming the axis-aligned envelope.
  S.boardHalfX = (maxX - minX) / 2 + 1;
  S.boardHalfZ = (maxZ - minZ) / 2 + 1;
  S.boardHalfExtent = Math.max(S.boardHalfX, S.boardHalfZ);

  // T1.5 §1/§2: env threading — theaterBoardFrom (theater-data.js) stamps `env` on its return; this
  // is the ONLY place the GL layer learns which palette-driven void/fog tint to show (the tile tints
  // are already baked into `t.tint` by theater-data.js, so setBoard never re-derives palette colors
  // itself — it only reads the env label to pick the void/fog background, which theater-data.js has
  // no GL concept of).
  // T3 (§4 zoneToWorld): stash the grid this board was derived from so a later verb can resolve a
  // "band:lane" zone string to the SAME world coordinates a unit standing there would occupy —
  // mirrors theater-data.js's theaterZoneOrigin math (band*PATCH, lane*PATCH + patch-center), kept in
  // sync by reusing the identical THEATER_PATCH-equivalent constant this file already defines (TILE_SIZE
  // is 1 world unit per tile, and theater-data.js's patch is 3 tiles/zone — see zoneToWorld below).
  S.lastGrid = data.grid || null;
  // THEATER-ZOOM-SPREAD: small-board bias — a board at or under SMALL_BOARD_BAND_THRESHOLD bands reads
  // more distant than a bigger board at the SAME fit fraction (less geometry filling the same frame
  // edge-to-edge), so bias the default zoom one step IN for it. setBoard() is called on EVERY render
  // while a fight is live (theaterStageSync, src/world/render.js) — re-deriving the bias every single
  // call would stomp a player's manual Theater.zoom() adjustment on the very next render. Only
  // (re-)apply the bias the first time this board's own band-count SHAPE is seen (S.zoomBiasBandCount
  // tracks it): an actual board-size change (a new fight, or the rare mid-fight room-size change)
  // re-biases as intended, but a same-shape re-render (the common case) leaves S.zoomLevel exactly
  // where the player last set it via zoom(dir).
  const bandCount = (S.lastGrid && S.lastGrid.bandCount) || (S.lastGrid && S.lastGrid.bands && S.lastGrid.bands.length) || 0;
  if(S.zoomBiasBandCount !== bandCount){
    S.zoomBiasBandCount = bandCount;
    S.zoomLevel = (bandCount > 0 && bandCount <= SMALL_BOARD_BAND_THRESHOLD) ? (1 / ZOOM_STEP_FACTOR) : 1;
  }
  const env = data.env || THEATER_DEFAULT_ENV_FALLBACK;
  S.env = env;
  const voidTint = voidTintFor(env);
  if(S.scene){
    S.scene.background = new THREE.Color(voidTint);
    if(S.scene.fog) S.scene.fog.color = new THREE.Color(voidTint);
  }
  if(S.renderer) S.renderer.setClearColor(voidTint, 1);

  // BOARD LIGHTING: data.light.profile (theaterBoardFrom's own stamp — src/engine/theater-data.js)
  // picks the LIGHT_PROFILES entry; falls back to the dark baseline for a board with no light field at
  // all (an older snapshot / a preview fixture that hasn't set one — same graceful-degrade discipline
  // as the env fallback just above). Applied AFTER boardHalfX/boardHalfZ are set (earlier in this
  // function) so point-light positions resolve against the REAL board size, not the pre-board default.
  applyLightProfile((data.light && data.light.profile) || LIGHT_DEFAULT_PROFILE);

  const topColorCache = {};
  const sideColorCache = {};
  const colorFor = (tint, factor, cache) => {
    const key = tint + ":" + factor;
    if(!cache[key]){
      const c = new THREE.Color(tint);
      c.multiplyScalar(factor);
      cache[key] = c;
    }
    return cache[key];
  };

  tiles.forEach(t => {
    const h = Math.max(0.15, 0.5 + (t.h || 0));
    const geo = new THREE.BoxGeometry(TILE_SIZE - TILE_GAP, h, TILE_SIZE - TILE_GAP);
    // §1 rule 2: top != side — strongly contrasted flat colors on the same column, now via
    // tileMaterialsFor so a matching loaded texture (§4) tints in instead of the flat top color.
    // BoxGeometry's material groups are [+x,-x,+y,-y,+z,-z]; index 2 is +y (the top face).
    const materials = tileMaterialsFor(t, topColorCache, sideColorCache, colorFor);
    const mesh = new THREE.Mesh(geo, materials);
    mesh.position.set(t.x - cx, h / 2 - 0.5, t.z - cz);
    S.tileGroup.add(mesh);
  });

  (data.props || []).forEach(p => {
    // MODEL-GRAMMAR G4: a prop entry carrying `part` (theater-data.js's theaterPropForText keyword
    // derivation off the segment's feature/hazard text) renders the ACTUAL named part — a cart reads
    // as a cart, a shrine as a shrine-block — via the SAME renderPartInto composition engine G1/G2
    // already use for figures. `partParams` rides straight through to the part function (a caller-
    // seeded params object, never randomness inside the part itself, per §1). No `part` (no keyword
    // hit for this zone's text, or a legacy caller that never threaded feature text at all) falls
    // straight through to the exact pre-G4 generic flat prop-box, byte-identical to before (§9
    // Decision 6's "never worse than today," reapplied to props — this fallback path is untouched).
    const px = p.x - cx, pz = p.z - cz;
    // GROUNDING SHADOW (§3): props had NONE before this unit — "props currently may have none — add
    // them." One shared blob per prop entry, added to S.propGroup (swept by the SAME clearGroup(S.
    // propGroup) call at the top of setBoard, so it never leaks across re-renders like the unit-side
    // blobs above don't). A fixed mid-size radius (0.42) rather than a per-part-derived size — the part
    // library's own footprints vary too much to size against cheaply here, and a slightly-generous
    // fixed blob under every prop still reads as "this object touches the ground here" without needing
    // per-part geometry introspection.
    addGroundingBlob(S.propGroup, px, pz, -0.495, 0.42);

    const partFn = p.part && Parts.PARTS[p.part];
    if(partFn){
      const g = new THREE.Group();
      const propTint = flatTints(0x6b5638);
      renderPartInto(g, partFn, p.partParams || {}, propTint, { x: 0, y: 0, z: 0 });
      g.position.set(px, 0, pz);
      S.propGroup.add(g);
      return;
    }
    const geo = new THREE.BoxGeometry(0.5, 0.9, 0.5);
    const propTex = S.textures.prop;
    const mat = applyPsxShaderTweaks((propTex && propTex !== "pending")
      ? new THREE.MeshLambertMaterial({ map: propTex, color: 0x6b5638 })
      : new THREE.MeshLambertMaterial({ color: 0x6b5638 }));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, 0.45, pz);
    S.propGroup.add(mesh);
  });

  placeCamera();
  markDirty();
}

/* T3 zoneToWorld (§4 ctx contract, theater-verbs.js): "band:lane" -> the SAME world tile coordinates
   theaterUnitsFrom (theater-data.js) would place a lone occupant of that zone at — reusing THIS
   file's own THEATER_PATCH-equivalent (a local const below mirrors theater-data.js's THEATER_PATCH=3
   and center-offset math exactly; kept in sync by comment/convention, same discipline as this file's
   existing ENV_VOID_TINT table, since the sealed ES-module boundary can't import theater-data.js's
   classic-script const). Returns null for a band/lane not in the last-set board's grid, or before any
   board has been set (S.lastGrid absent) — a verb resolving against an unresolvable zone just no-ops
   (theater-verbs.js's resolvePoint already treats a null return as "skip this field cleanly"). */
const ZONE_TO_WORLD_PATCH = 3; // must match theater-data.js's THEATER_PATCH
function zoneToWorld(band, lane){
  if(!S.lastGrid) return null;
  const bandIdx = (S.lastGrid.bands || []).indexOf(band);
  const laneIdx = (S.lastGrid.lanes || []).indexOf(lane);
  if(bandIdx < 0 || laneIdx < 0) return null;
  const cx = (S.boardOrigin && S.boardOrigin.cx) || 0;
  const cz = (S.boardOrigin && S.boardOrigin.cz) || 0;
  const center = (ZONE_TO_WORLD_PATCH - 1) / 2;
  return {
    x: (laneIdx * ZONE_TO_WORLD_PATCH) + center - cx,
    z: (bandIdx * ZONE_TO_WORLD_PATCH) + center - cz
  };
}

/* T3 findUnit (§4 ctx contract): unit id -> its mounted THREE.Object3D group, tagged with
   userData.unitId at setUnits() time below. Returns null pre-mount / unknown id — every verb treats
   that as "can't resolve this unit," a clean no-op. */
function findUnit(id){
  if(!S.unitGroup || id == null) return null;
  const idStr = String(id);
  for(let i = 0; i < S.unitGroup.children.length; i++){
    if(S.unitGroup.children[i].userData && S.unitGroup.children[i].userData.unitId === idStr) return S.unitGroup.children[i];
  }
  return null;
}

/* T3: the ctx object handed to theater-verbs.js's playVerb/tickTweens (see that file's header for the
   full contract). Built fresh on every play() call (cheap — a handful of field reads/closures, no
   allocation of the actual GL resources) so it always reflects the CURRENT mount/board/unit state
   rather than risking a stale snapshot across a retire()/remount(). */
function buildTheaterCtx(){
  return {
    THREE, scene: S.scene, fxGroup: S.fxGroup, unitGroup: S.unitGroup, camera: S.camera,
    tweens: S.tweens, findUnit, zoneToWorld, markDirty
  };
}

/* T3 play(verb, opts) — the public surface this unit's brief calls for: "expose Theater.play(verb,opts),
   the tween tick loop with render-on-demand preserved — animate only while a tween is live." Null-safe
   pre-mount (matches every other Theater method). Delegates verb semantics entirely to theater-verbs.js;
   this function's only job is ctx construction + kicking the tween loop while at least one tween is live. */
function play(verb, opts){
  if(!S.mounted) return false;
  const ok = playVerb(buildTheaterCtx(), verb, opts || {});
  if(ok) startTweenLoop();
  return ok;
}

/* the tween tick loop: a SEPARATE rAF chain from the render-on-demand `raf` above (that one fires once
   per dirty flag and stops; this one runs every frame WHILE >=1 tween is live, per-frame calling
   tickTweens then markDirty to trigger the next render). Stops itself the instant tickTweens reports
   no tweens remain — "animate only while a tween is live" (this unit's brief, quoting §2's own
   render-on-demand discipline extended to animation). Idempotent: calling startTweenLoop while already
   running is a no-op (S.tweenRaf guard), so play() can call it after every verb without double-scheduling. */
function startTweenLoop(){
  if(!S.mounted || S.tweenRaf) return;
  const step = () => {
    if(!S.mounted){ S.tweenRaf = null; return; }
    const stillLive = tickTweens(buildTheaterCtx());
    if(stillLive){
      S.tweenRaf = requestAnimationFrame(step);
    } else {
      S.tweenRaf = null;
    }
  };
  S.tweenRaf = requestAnimationFrame(step);
}

/* DEAD-STATE (2026-07-03, Adam's ruling): desaturate every mesh in a figure's group toward grayscale —
   the SAME cheap no-shader luminance-preserving trick vDown (theater-verbs.js) already animates via a
   tween; this is the static/terminal application for a CORPSE that setUnits renders directly on every
   refresh (no tween needed — a re-mounted/re-rendered corpse must read gray immediately, not replay an
   animation). `amount` in [0,1] lets the down-pose (full desaturate, 1.0) share this helper with any
   future partial-desaturate need without duplicating the RGB math. */
function desaturateGroup(group, amount){
  group.traverse(n => {
    if(!n.material || !n.material.color) return;
    const c = n.material.color;
    const gray = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
    c.setRGB(
      c.r + (gray - c.r) * amount,
      c.g + (gray - c.g) * amount,
      c.b + (gray - c.b) * amount
    );
  });
}

function setUnits(data){
  if(!S.mounted || !data) return;
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);
  // DEAD-STATE: obliteration markers ride in S.propGroup (swept by the SAME clearGroup/retire lifecycle
  // as every other prop — cover columns, walk-feature props) rather than a new group, so this file's
  // existing teardown paths (retire(), the next setBoard/setUnits) sweep them with zero new plumbing.
  // setBoard already clears S.propGroup on every board rebuild; clear it again here too since setUnits
  // can be called on its own (a combat round tick) without a matching setBoard call, and a stale
  // obliteration marker from a since-cleared unit must not survive a unit-only refresh.
  clearGroup(S.propGroup);

  const cx = (S.boardOrigin && S.boardOrigin.cx) || 0;
  const cz = (S.boardOrigin && S.boardOrigin.cz) || 0;
  // G5 ROUND-1 (ruling 2): the base disc geometry is now sized per-UNIT (size-scaled — see the
  // baseDiscGeoFor cache below) rather than one shared geometry at a fixed FIGURE_SCALE radius, since
  // a Small goblin and a Huge ogre now render at different effective scales (ruling 3's SIZE_SCALE)
  // and their base discs should read proportionate to their own figure, not a one-size shadow blob.
  const baseDiscGeoCache = {};
  function baseDiscGeoFor(figScale){
    const key = figScale.toFixed(3);
    if(!baseDiscGeoCache[key]) baseDiscGeoCache[key] = new THREE.CircleGeometry(0.34 * figScale, 16);
    return baseDiscGeoCache[key];
  }
  // DEAD-STATE: a corpse's base disc darkens to near-black — a distinct material (never a mutation
  // of the shared kind mats) so the corpse read persists across every setUnits refresh.
  const corpseDiscMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.9, depthWrite: false });
  // DEAD-STATE: the obliteration tile marker — a thin scorch-tinted quad flush with the floor,
  // reusing the per-env scorch tint; shared per setUnits call (one env per fight).
  const scorchGeo = new THREE.CircleGeometry(0.42 * FIGURE_SCALE, 10);
  const scorchMat = applyPsxShaderTweaks(new THREE.MeshBasicMaterial({
    color: scorchTintFor(S.env), transparent: true, opacity: 0.88, depthWrite: false
  }));

  (data.units || []).forEach(u => {
    const x = u.x - cx, z = u.z - cz;

    // OBLITERATION (the exception per Adam's ruling): no figure, no shadow — a burst+sink FX plays via
    // the `obliterate` stage_fx verb (src/ui/theater-verbs.js) at the moment the flag is set; THIS
    // function only owns the RESTING state a re-render lands on afterward — nothing standing, a single
    // scorch-tinted tile marker left where the unit stood. Checked BEFORE the down branch below since
    // an obliterated unit is also down by construction (HP<=0) but must never ALSO render as a corpse.
    if(u.obliterated){
      // BUGFIX (found live in this unit's own browser check): a flat floor tile's TOP surface sits at
      // world y=0 (setBoard's own h/2-0.5 math — a flat tile's box spans y=[-0.5,0], center at -0.25,
      // half-height 0.25 -> top face at 0). The shadow discs below sit at y=-0.49 (well UNDER the tile
      // top, working only because they're never meant to be seen from above the opaque tile — they
      // read through anti-aliased edges/via the renderer's blending order in practice). A scorch quad
      // needs to be VISIBLE from the default camera angle looking down at the board, so it must sit
      // ABOVE the tile top (y=0), not buried inside the opaque tile geometry the way the old y=-0.485
      // placement (copy-pasted from the shadow convention without checking it against a floor tile
      // that isn't elevated/sunk) silently was — that placement rendered nothing, occluded by the
      // tile's own solid top face. 0.011 clears z-fighting against the flat-floor case while still
      // reading as "flush with the floor" at this camera's oblique angle.
      const scorch = new THREE.Mesh(scorchGeo, scorchMat);
      scorch.rotation.x = -Math.PI / 2;
      scorch.position.set(x, 0.011, z);
      S.propGroup.add(scorch);
      return;
    }

    const seed = hashSeed(u.id);
    const tint = unitTint(u.kind);
    // PASS 2: theaterUnitsFrom (src/engine/theater-data.js) now stamps `silhouette` (PC/ally class
    // read: martial/ranger/caster/cleric, undefined for foes) and `weapon` (a shape key every unit
    // carries — class-derived for PC/allies, name/action-keyword-derived for foes, "none" when no
    // weapon reads) onto each unit; figureFor threads both into the archetype builder so class
    // silhouettes + weapon slabs compose without this file re-deriving either.
    // MODEL-GRAMMAR G2: units may ALSO carry `recipeSlug` (theaterUnitsFrom stamps a foe's
    // resolved bestiary statId/slug when known) — figureFor resolves it through recipeFor
    // (overrides-then-generated-then-null) BEFORE falling back to the archetype builder, so a
    // recipe-driven figure wins whenever one exists for this unit's slug.
    // MODEL-GRAMMAR G3 §2: `pcRecipe` (PC/ally loadout-mirror units only) outranks both — see
    // figureFor's own precedence-chain comment.
    const figure = figureFor(u.archetype, seed, tint, u.silhouette, u.weapon, u.recipeSlug, u.pcRecipe, u.kind);
    // x/z already computed at the top of this forEach body (the obliterated branch above returns before
    // here, so this is the same block scope) — reuse them; a second `const x/z` here is a duplicate
    // declaration (a hard SyntaxError that stopped this whole module from parsing).
    figure.position.set(x, 0, z);
    // G5 ROUND-1 (ruling 3): recipe.size (a bestiary/pcRecipe field carried since MODEL-GRAMMAR G2 but
    // never read until now) scales the WHOLE figure group on top of FIGURE_SCALE — one multiply, so a
    // weapon module (already a child of this same group, attached via renderPartInto's offset math)
    // scales together with the body it's gripped by, never independently. The archetype-builder
    // fallback (no recipe at all) has no size field to read — stays at plain FIGURE_SCALE, matching
    // §9 Decision 6 ("never worse than today").
    const effRecipe = u.pcRecipe || recipeFor(u.recipeSlug);
    const figScale = FIGURE_SCALE * sizeScaleFor(effRecipe && effRecipe.size);
    figure.scale.setScalar(figScale); // §3 G9 tune: "figure scale ~1.5x current relative to tiles" x size
    if(u.down){
      figure.rotation.z = Math.PI / 2;
      figure.position.y += 0.12 * figScale; // matches the figure's own effective (size-scaled) height
      // DEAD-STATE: desaturate the WHOLE toppled figure on every render (a setUnits refresh after
      // the fight must still read as a corpse with no live tween in flight).
      desaturateGroup(figure, 1);
    }
    // MODEL-GRAMMAR G3 §2 (conditions as modules): applied AFTER the down-pose (so a prone rotation
    // mod adds onto, not overwrites, an already-down figure's 90° topple) and BEFORE fled-visibility
    // (a fled figure is invisible anyway, so attach order there doesn't matter). anchors resolve off
    // whichever base body this figure actually used — a recipe figure (pcRecipe or bestiary) reads
    // its own recipe.base's anchors; the archetype-builder fallback has no recipe object to consult,
    // so it uses torso-biped's anchors (see applyConditionMods' own header for why that's sane).
    const modAnchors = (u.pcRecipe && Parts.PARTS[u.pcRecipe.base] && Parts.PARTS[u.pcRecipe.base].anchors)
      || (recipeFor(u.recipeSlug) && Parts.PARTS[recipeFor(u.recipeSlug).base] && Parts.PARTS[recipeFor(u.recipeSlug).base].anchors)
      || Parts.torsoBiped.anchors;
    applyConditionMods(figure, u.conditionMods, modAnchors, tint);
    if(u.fled) figure.visible = false;
    // T3 (§4 ctx contract): tag every figure with its unit id so theater-verbs.js's findUnit(id) can
    // resolve a verb's `who` straight to this live Object3D — no separate id->handle map to keep in
    // sync, the tag lives on the object itself exactly where setUnits already iterates it.
    figure.userData.unitId = String(u.id);
    S.unitGroup.add(figure);

    // G5 ROUND-1 (ruling 2): the base disc REPLACES the flat black blob-shadow as the hostility
    // signal — a tinted disc/short cylinder under each unit, miniatures-style, matching unitTint's own
    // kind color (ember red foe / gold PC / blue ally, same palette the figure geometry already used
    // before ruling 1's natural-channel work moved foe TINT off the body). This is now the ONLY
    // hostility marker on a foe figure (ruling 1 kills the flat foe body tint in favor of natural
    // per-creature channel colors — see recipeChannelTints/buildBaseDiscMat below). Slightly WIDER
    // than the figure footprint (baseDiscGeoFor's 0.34 vs. the old shadow's 0.3 radius) and given a
    // shallow height (a short cylinder, not a flat disc-on-the-floor) for the "flat base/short
    // cylinder, PSX-clean" read the ruling calls for.
    const baseDisc = new THREE.Mesh(baseDiscGeoFor(figScale), u.down ? corpseDiscMat : baseDiscMatFor(u.kind));
    baseDisc.rotation.x = -Math.PI / 2;
    baseDisc.position.set(x, -0.49, z);
    if(u.fled) baseDisc.visible = false;
    S.shadowGroup.add(baseDisc);

    // GROUNDING SHADOW (§3): a dark blob quad BENEATH the hostility disc — slightly larger (1.15x the
    // disc's own size-scaled radius) and seated a hair lower (-0.495 vs. the disc's -0.49) so the two
    // never z-fight and the blob visibly reads as UNDER the disc, not competing with it. This is now
    // present on EVERY figure regardless of kind (the disc already carries the hostility read; the
    // blob's only job is "exactly where does this thing stand").
    const groundingBlob = addGroundingBlob(S.shadowGroup, x, z, -0.495, 0.34 * figScale * 1.15);
    if(groundingBlob && u.fled) groundingBlob.visible = false;
  });

  markDirty();
}

function rotate(){
  if(!S.mounted) return;
  S.rotationStep = (S.rotationStep + 1) % 4;
  placeCamera();
  markDirty();
}

/* THEATER-ZOOM-SPREAD — Theater.zoom(dir): ortho zoom, one discrete step per call. `dir` follows the
   same sign convention as a scroll-wheel delta's negation / a "+"-button click: dir>0 (or any truthy
   positive number) zooms IN (viewSize shrinks, board reads bigger), dir<0 zooms OUT. dir===0 or a
   non-finite value is a no-op (never throws, matches every other Theater method's null-safety). The
   new zoomLevel is clamped to [ZOOM_MIN, ZOOM_MAX] and re-applied via placeCamera() so it takes effect
   immediately — it then PERSISTS across any later rotate()/setBoard() call because those both re-derive
   viewSize by multiplying the board's fresh auto-fit by S.zoomLevel (placeCamera's own logic), never by
   resetting S.zoomLevel itself (setBoard() only resets it on an actual board-SHAPE change, see its own
   comment). Returns the resulting zoomLevel (useful for a caller wanting to reflect the current step in
   UI, e.g. disabling a +/- button at the clamp), or false pre-mount/on a bad dir. */
function zoom(dir){
  if(!S.mounted) return false;
  const d = Number(dir);
  if(!isFinite(d) || d === 0) return false;
  const factor = d > 0 ? (1 / ZOOM_STEP_FACTOR) : ZOOM_STEP_FACTOR; // dir>0 = zoom IN = smaller viewSize
  S.zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, (S.zoomLevel || 1) * factor));
  placeCamera();
  markDirty();
  return S.zoomLevel;
}

/* reattach(el) — re-parent the LIVE canvas into a new container after the host UI re-rendered its
   DOM. renderWorld() does full innerHTML replacement, which detaches (not destroys) the canvas —
   a WebGL context survives re-parenting — but the old mount-once flow left the canvas orphaned
   forever (found live 2026-07-03: battle-stage mounted into the probe, then the stage re-render
   nuked it -> black stage). Also re-fits size + camera against the NEW container, which fixes the
   sibling bug of mount() sizing against the hidden zero-size probe. Null-safe pre-mount. */
function reattach(el){
  if(!S.mounted || !S.renderer || !el) return false;
  if(S.renderer.domElement.parentNode !== el) el.appendChild(S.renderer.domElement);
  S.el = el;
  const w = el.clientWidth || 1, h = el.clientHeight || 1;
  applyPsxCanvasSize(S.renderer, S.renderer.domElement, w, h);
  placeCamera();
  markDirty();
  return true;
}

function retire(){
  if(S.resizeHandler) window.removeEventListener("resize", S.resizeHandler);
  if(S.raf) cancelAnimationFrame(S.raf);
  if(S.tweenRaf) cancelAnimationFrame(S.tweenRaf); // T3: stop the verb tween loop too, not just render-on-demand's raf
  stopLightFlicker(); // BOARD LIGHTING: the ~2Hz setInterval flicker tick outlives raf/tweenRaf otherwise
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);
  clearGroup(S.fxGroup);   // T3: sweep any live verb/FX primitives (glyphs, elemental bursts, the absurdity rift)
  if(S.renderer){
    S.renderer.dispose();
    if(S.renderer.domElement && S.renderer.domElement.parentNode){
      S.renderer.domElement.parentNode.removeChild(S.renderer.domElement);
    }
  }
  S = createTheaterState();
}

// T3: THEATER_VERBS + theaterFxFromLedger re-exported on window.Theater so classic-script callers can
// reach them without their own import statement (ES-module scope is sealed, §2) — mirrors how every
// other Theater method is the classic-script-reachable surface for functionality that actually lives
// in an ES-module scope. cmTheaterNotify (src/world/render.js) is the one caller of fxFromLedger; it
// treats a missing window.Theater/fxFromLedger as a clean no-op (headless/jsdom), never a throw.
// reattach: the canvas re-parenting seam (battle-stage; renderWorld's innerHTML pass detaches the canvas).
window.Theater = {
  mount, reattach, setBoard, setUnits, setTextures, rotate, zoom, retire, play,
  verbs: THEATER_VERBS, fxFromLedger: theaterFxFromLedger
};

/* UNIT 1 dev A/B toggle: `window.Theater.pixelSkin` (get/set) flips the procedural pixel-skin system
   on/off at runtime, so a visual gate can A/B the textured figures against the pre-Unit-1 flat-color
   baseline in one line (window.Theater.pixelSkin = false) without a reload — the same escape-hatch
   spirit as the psx clean/grit toggle. Defined as an accessor property (not a plain field) so a
   simple assignment drives the module-scope PIXEL_SKIN_ENABLED flag; the next setUnits() re-render
   picks it up. This ADDS an opt-in property; every existing method above keeps its exact shape (the
   flat-color path is byte-identical to pre-Unit-1 when this is false or when canvas-2D is absent). */
Object.defineProperty(window.Theater, "pixelSkin", {
  get: function(){ return PIXEL_SKIN_ENABLED; },
  set: function(v){ PIXEL_SKIN_ENABLED = !!v; },
  enumerable: true, configurable: true
});
