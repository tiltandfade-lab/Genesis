/* THEATER WHOLE-OBJECT — the P1' whole-object figure/prop geometry factory + material funnel and the
   BATTLE-THEATER T2 GLB seam, extracted VERBATIM from src/ui/theater-boot.js in split step B3
   (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: everything that turns a registered whole-object module (dev/model-qa/creatures/, reached
   through src/ui/theater-figures.js's registry) or a vendored .glb into renderable GPU resources —
   the §2.2 channel vocabulary and its bucket classifier, the procedural grain atlas (WHOLE_GRAIN_TEX),
   the quad-UV builder, the desaturate/retint colour-buffer math, and the two module-scope caches
   WHOLE_GEOMETRY_CACHE / WHOLE_MATERIALS_CACHE. Their end-of-life is disposeWholeObjectCaches(), which
   also moved here; the ROOT still calls it from retire(), so the one true end-of-life point is
   unchanged. Also owns the family's two placement laws — WHOLE_OBJECT_SCALE (§3-D1's single scale
   constant) and WHOLE_OBJECT_YAW (§3-D3's unconditional facing) — and wholeObjectKeyFor (§2.4's
   unit-side resolution key). No scheduler, no DOM, no theater state.

   CTX LAW (recon §7.3 — acyclic imports; same shape as theater-clay-room.js / theater-light-lab.js /
   theater-skins.js): this module NEVER imports theater-boot.js. Capabilities arrive ONCE via
   wholeObjectInit(ctx) into the module-local mirrors below, so every moved body stays byte-identical
   (same bare identifiers — the three.js onBeforeCompile program-cache key is a source-TEXT contract,
   and wholeObjectMaterialsFor's materials route through applyPsxShaderTweaks). Five capabilities
   arrive that way rather than being imported here:
     applyPsxShaderTweaks — the root's ONE PSX material funnel (dither/vertex-snap/figure-AO);
     nearestify — the root's ONE NearestFilter/no-mipmap texture funnel;
     GLTFLoader — theater-boot.js stays the single `three/addons/` import site (its own header's law);
     wholeObjectResetGeom / wholeObjectGetBuffers — probe-lib.js's shared POS/COL/CHAN buffers. The
       root passes the very function objects it static-imported, so this module reads the exact same
       module-scope buffers a just-invoked creature builder wrote into (P1-WIRING §4 step 3's law).
   There is no wholeObjectSyncState: nothing here reads the theater state record S. There were no
   top-level window.Theater assignments in this region either (the two _wholeObject*ForTest seams are
   root-side facade wrappers that call in), so there is no PublishSeams function.

   ROOT-OWNED, DELIBERATELY NOT MOVED: WHOLE_OBJECT_ENABLED (a mutable `let` the
   window.Theater.wholeObject setter writes — an import binding is read-only and a mirror would go
   stale; the readers that need it get it through an accessor) and HUMAN_TRUE_HEIGHT (it sat inside
   the GLB const block but is the INTERIOR channel's true-scale reference; nothing here reads it).

   NON-VERBATIM EDITS (the complete list): the header/import/mirror prologue above the first moved
   line, and the trailing `export {...}` block. Not one byte inside a moved declaration changed. */
import * as THREE from "three";
// The registry lookup wholeObjectGeometryFor performs. theater-figures.js is THREE-free and never
// imports this file or the root, so this stays acyclic (and resolves to the same module instance the
// root already holds — one registry, not two).
import { resolveWholeObject } from "./theater-figures.js";

// ---- root-capability mirrors (wired once by wholeObjectInit; see the CTX LAW note above) ----
let GLTFLoader, applyPsxShaderTweaks, nearestify, wholeObjectGetBuffers, wholeObjectResetGeom;

export function wholeObjectInit(ctx){
  ({ GLTFLoader,
    applyPsxShaderTweaks,
    nearestify,
    wholeObjectGetBuffers,
    wholeObjectResetGeom } = ctx);
}

// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §3-D1, R2): whole-object figures bake ABSOLUTE size in
// their own module geometry (the size law: Small ~0.95u, Medium ~1.45u, Large ~2.1u, Huge ~2.7u —
// dev/model-qa/sheets/INDEX.md) — applying the cuboid path's FIGURE_SCALE(1.5) x sizeScaleFor(size)
// on TOP of that would double-scale (D1's own failure mode), so the whole-object path scales by this
// ONE constant instead, and sizeScaleFor is NEVER applied on this path. CAPTURE-GATE FOLLOW-UP
// (2026-07-04, Adam at the capture gate: "make them 1.2 so they can be next to each other without
// touching") — R2's own 1.3-vs-1.5 comparison pair surfaced that even the smaller of the two crowded
// adjacent lanes; 1.2 is the director's own ruling, tuned by CAPTURE not box-math (§8 decision 5).
const WHOLE_OBJECT_SCALE = 1.2;
/* ============================================================================
   P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §2.2/§4 Unit A steps 3-4) — the geometry factory +
   material funnel for the whole-object figure/prop roster (dev/model-qa/creatures/, reached via
   src/ui/theater-figures.js's registry). Ported BYTE-FOR-BYTE from dev/model-qa/ps1-sheet.html's own
   figureScene/grainTexture/quadUVs/matBucket (that file is the byte-faithful copy of THIS file's PSX
   pass, so porting its whole-object rebuild back into the engine is the inverse of how it was
   authored) — §2.2's closed CHANNEL_KEYS vocabulary generalizes ps1-sheet's 3-bucket matBucket
   classifier (matte/metal/glass) to the full skin/cloth/leather/bone/scale/fur/wood/stone/glass/glow
   set, all of which render through ONE of THREE material classes (Lambert matte, Phong metal, Phong
   glass — §2.2's render-mapping table) — a channel's material palette differs by TEXEL PROGRAM
   (grain-atlas window family), not by THREE material subclass beyond those three buckets. ============================================================================ */

// §2.2 channel vocabulary (mirrors probe-lib.js's own CHANNEL_KEYS, kept in sync by convention/
// comment — this ES module could import it directly since probe-lib.js is also Node/browser-safe,
// but the values are a closed, rarely-changing vocabulary and this file already keeps several other
// small mirrored tables, e.g. ENV_VOID_TINT, for the same "sealed scope, small stable table" reason).
const WHOLE_CHANNEL_KEYS = ["", "skin", "cloth", "leather", "bone", "metal",
  "scale", "fur", "wood", "stone", "glass", "glow"];
// channel name -> material bucket index (0 matte/Lambert, 1 metal/Phong, 2 glass/Phong, 3 glow/Basic
// unlit) — §2.2's render-mapping table. CAPTURE-GATE FOLLOW-UP (2026-07-04, Adam: "the torch fire
// itself [must be] bright and looks like light/fire") — "glow" moves from bucket 0 (Lambert, lit —
// the spec's v1 placeholder, §2.2's own table footnote "real emissive deferred") to its OWN bucket 3
// (MeshBasicMaterial, always full-bright regardless of scene lighting) so flame/lantern-glow geometry
// actually reads as light instead of a dim lit-matte surface. An unrecognized/untagged ("") channel is
// a matte-bucket classifier read (wholeObjectClassifyBucket below), not a static lookup — see
// wholeObjectBucketFor.
const WHOLE_CHANNEL_BUCKET = {
  skin: 0, cloth: 0, leather: 0, bone: 0, scale: 0, fur: 0, wood: 0, stone: 0,
  metal: 1, glass: 2, glow: 3
};
/* untagged-tri classifier — matBucket (ps1-sheet.html L253-259) verbatim: a coarse color read over
   the tri's own averaged vertex color decides matte/metal/glass when the module shipped no CHAN tag
   for that tri (probe-lib.js's CHAN defaults every tri to 0/"" until a module calls setChannels()).
   This is the "untagged tris fall to the classifier" contract §2.2 names explicitly. */
function wholeObjectClassifyBucket(r, g, b){
  const v = Math.max(r, g, b), sat = v - Math.min(r, g, b);
  if(b > r && b > g && v > 0.55) return 2;                          // glass (orb cyans)
  if(r > g * 1.12 && g > b * 1.45 && v > 0.35 && sat > 0.15) return 1; // brass/gold -> metal
  if(sat < 0.09 && v > 0.40 && v < 0.74 && b >= r) return 1;         // steel (cool desaturated mids)
  return 0;                                                          // matte
}
// resolve a tri's material bucket: a tagged channel wins (WHOLE_CHANNEL_BUCKET lookup); an untagged
// ("" / unrecognized) channel falls to the coarse-color classifier over the tri's own averaged color.
function wholeObjectBucketFor(channelName, r, g, b){
  if(channelName && WHOLE_CHANNEL_BUCKET[channelName] != null) return WHOLE_CHANNEL_BUCKET[channelName];
  return wholeObjectClassifyBucket(r, g, b);
}

/* the texel-grain atlas — grainTexture() ported verbatim from ps1-sheet.html L203-231 (a seeded
   128px canvas, near-white base + mottle patches + darker/pale flecks + worn scratches; NearestFilter,
   no mipmaps, deterministic — no asset files, no Math.random). Memoized module-scope (one atlas for
   every whole-object figure, shared, matching the sheet's own single-instance discipline). */
let WHOLE_GRAIN_TEX = null;
function wholeObjectGrainTexture(){
  if(WHOLE_GRAIN_TEX) return WHOLE_GRAIN_TEX;
  if(typeof document === "undefined" || typeof document.createElement !== "function") return null; // headless degrade
  let c;
  try { c = document.createElement("canvas"); c.width = c.height = 128; } catch(e){ return null; }
  const g = c.getContext && c.getContext("2d");
  if(!g) return null;
  g.fillStyle = "#f2f2f2"; g.fillRect(0, 0, 128, 128);
  let s = 987654321 >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for(let i = 0; i < 170; i++){
    const v = (0.86 + rnd() * 0.10) * 255 | 0;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect((rnd() * 128) | 0, (rnd() * 128) | 0, 3 + ((rnd() * 4) | 0), 3 + ((rnd() * 4) | 0));
  }
  for(let i = 0; i < 4200; i++){
    const dark = rnd() < 0.85;
    const v = dark ? 0.60 + rnd() * 0.34 : 1.0;
    const vv = (v * 255) | 0;
    g.fillStyle = `rgb(${vv},${vv},${vv})`;
    g.fillRect((rnd() * 128) | 0, (rnd() * 128) | 0, 1 + ((rnd() * 3) | 0), 1 + ((rnd() * 3) | 0));
  }
  for(let i = 0; i < 110; i++){
    const x = (rnd() * 128) | 0, y = (rnd() * 128) | 0, len = 2 + (rnd() * 6) | 0, v = (0.58 + rnd() * 0.16) * 255 | 0;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x, y, rnd() < 0.5 ? len : 1, rnd() < 0.5 ? 1 : len);
  }
  const tex = new THREE.CanvasTexture(c);
  nearestify(tex);
  WHOLE_GRAIN_TEX = tex;
  return tex;
}
/* per-quad (tri-pair) UV windows into the 128px grain atlas — quadUVs() ported verbatim from
   ps1-sheet.html L232-245: a deterministic xorshift hash (fixed seed) picks a 14x14-grid window per
   quad, shared by both tris of the pair (a tri-pair IS the quad probe-lib.js's own quad() emits). */
function wholeObjectQuadUVs(triCount){
  const uv = new Float32Array(triCount * 3 * 2);
  const CELLS = 14, W = 2 / 16;
  let h = 2463534242 >>> 0;
  const hash = () => ((h = (h ^ (h << 13)) >>> 0, h = (h ^ (h >>> 17)) >>> 0, h = (h ^ (h << 5)) >>> 0) / 4294967296);
  let cu = 0, cv = 0;
  for(let t = 0; t < triCount; t++){
    if(t % 2 === 0){ cu = (hash() * CELLS | 0) / 16; cv = (hash() * CELLS | 0) / 16; }
    const o = t * 6;
    uv[o] = cu;     uv[o + 1] = cv;
    uv[o + 2] = cu + W; uv[o + 3] = cv;
    uv[o + 4] = cu + (t % 2 ? W : 0); uv[o + 5] = cv + W;
  }
  return uv;
}

/* wholeObjectMaterialsFor(entry) — §3-D5: the 4-slot material array (Lambert matte / Phong metal /
   Phong glass / Basic glow-unlit), the figureScene construction from ps1-sheet.html L293-297 ported
   byte-for-byte for the first 3 slots — each `{vertexColors:true, flatShading:true, map:grainAtlas,
   color:0xffffff}` (white base color so the baked vertex colors show through 1:1, matching
   figureMaterialFor's own pixel-skin convention) then `applyPsxShaderTweaks`'d exactly like every other
   material this file builds. Does NOT route through pixelSkinTextureFor/figureMaterialFor (D5: "no
   double eyes — house eyes are geometry" — a whole-object module bakes its own eyes as vertex-colored
   geometry, so layering a procedural pixel-skin texture on top would double-paint). Memoized (one
   quadruple per opacity value — translucent entries clone with transparent+depthWrite:false per the
   TRANSLUCENT_OPACITY precedent, L1458-ish).

   CAPTURE-GATE FOLLOW-UP (2026-07-04, Adam: "the torch fire itself [must be] bright and looks like
   light/fire") — slot 3 is MeshBasicMaterial, not Lambert: unlit means it ignores the scene's key/
   fill/ambient lights entirely and always renders at its own baked vertex-color brightness, which is
   exactly what a flame/glow surface needs (a lit Lambert flame reads dark in a "dark" room profile —
   the bug this fixes). Verified `applyPsxShaderTweaks` works unmodified on MeshBasicMaterial: it only
   needs the `<opaque_fragment>` (fragment) and `<project_vertex>` (vertex) shader-chunk anchors to
   splice its dither/vertex-snap GLSL into, and vendor/three/three.module.js's own meshbasic_frag/
   meshbasic_vert chunks (ShaderLib.basic) both carry those two anchors verbatim — same as every other
   material class this file already tweaks — so no emissive-boosted-Lambert fallback was needed.

   FLAME-GLOW FOLLOW-UP (2026-07-04, Adam: "the material on the flame still reads flat, it should be
   glowing/bright vs a flat orange texture, probably with some opacity as well") — unlit alone still
   reads as a flat painted-orange surface at board distance: full-bright is necessary but not
   sufficient for a LIGHT read. Slot 3 now additionally carries `transparent:true, opacity:0.85,
   blending:THREE.AdditiveBlending, depthWrite:false`. Additive blending is what actually sells "this
   surface emits" — it sums the flame's own color into whatever's behind/around it (the dark board/fog)
   instead of just occluding it at a fixed unlit brightness, which is the visual signature of light
   sources vs. painted matte surfaces in every PSX-era game this project's grit reference draws from.
   depthWrite:false is required alongside transparent (the standard three.js pairing — an opaque
   depth-write from a see-through/additive surface would incorrectly occlude geometry behind it and,
   for overlapping flame tufts, z-fight/hide layers that should all be summing together). opacity 0.85
   rather than 1.0 leaves the additive sum from behind-showing-through readable as PART of the glow
   (a fully opaque additive layer still sums fine, but 0.85 gave a slightly softer/less-clipped core in
   capture — Adam's own "with some opacity as well" ask). This is independent of the entry-level
   `opacity` field (a whole-object's overall ghost/translucency dial, e.g. an incorporeal figure) —
   glow buckets are ALWAYS additive-transparent regardless of that field; if a translucent entry ever
   also carries glow tris, the entry opacity still multiplies in via the base object's `opacity` key
   (Object.assign below applies glowOpts after base, so translucent-entry opacity is overridden by the
   fixed glow opacity — a translucent whole-object's flame reads at the same glow brightness as any
   other, which is the desired "fire is fire" behavior, not dimmed by an unrelated ghost dial).
   applyPsxShaderTweaks verified unaffected: dither still splices into `<opaque_fragment>` (present in
   meshbasic_frag regardless of the material's transparent/blending state — that chunk sets the final
   `gl_FragColor` before the tonemapping/colorspace chunks that follow it, not before whatever blend
   mode the GL state applies) and vertex-snap still splices into `<project_vertex>` — additive+dither
   judged on capture (dev/model-qa/gate-followups/flame-glow-*): no banding/moire artifacts, dither
   speckle reads as a texel/grain cue same as every other material, no double-brightening from the
   dither's own signed offset (it's a small +/- nudge on an already-additive-summed color, not a second
   multiplicative pass). */
const WHOLE_MATERIALS_CACHE = {};
function wholeObjectMaterialsFor(entry){
  const opacity = (entry && entry.opacity != null) ? entry.opacity : 1;
  const key = "op:" + opacity;
  if(WHOLE_MATERIALS_CACHE[key]) return WHOLE_MATERIALS_CACHE[key];
  const grain = wholeObjectGrainTexture();
  const base = { vertexColors: true, flatShading: true, color: 0xffffff };
  if(grain) base.map = grain;
  const translucent = opacity < 1;
  if(translucent){ base.transparent = true; base.opacity = opacity; base.depthWrite = false; }
  // slot 3 = "glow": always additive-transparent (see the FLAME-GLOW FOLLOW-UP header above) — applied
  // AFTER base so these three keys win over any entry-level translucent opacity/transparent/depthWrite.
  const glowOpts = { transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false };
  // figureAO on the three lit body buckets (matte/metal/glass) — the base-darkening occlusion read.
  // NOT on the glow bucket (slot 3): those texels are meant to be full-bright emissive (flame/rune),
  // AO-darkening them would dim the fire.
  const mats = [
    applyPsxShaderTweaks(new THREE.MeshLambertMaterial(Object.assign({}, base)), { figureAO: true }),
    applyPsxShaderTweaks(new THREE.MeshPhongMaterial(Object.assign({}, base, { shininess: 46, specular: 0x8a8f94 })), { figureAO: true }),
    applyPsxShaderTweaks(new THREE.MeshPhongMaterial(Object.assign({}, base, { shininess: 95, specular: 0xbfdbe8 })), { figureAO: true }),
    // MeshBasicMaterial has no `flatShading` concept (unlit, no normals-based shading at all) — omit
    // it rather than pass a meaningless key; vertexColors/map carry over from base as-is.
    applyPsxShaderTweaks(new THREE.MeshBasicMaterial(Object.assign({}, base, { flatShading: undefined }, glowOpts)))
  ];
  // D7: tag each cached material shared, same discipline as the geometry cache (wholeObjectGeometryFor)
  // — clearGroup's disposeMeshMaybeShared skips .dispose() for a shared material too, since this
  // opacity-keyed set is reused across every whole-object figure/prop at that opacity.
  mats.forEach(m => { m.userData.shared = true; });
  WHOLE_MATERIALS_CACHE[key] = mats;
  return mats;
}

/* Rec.601 luma-desaturation of a flat [r,g,b] color-buffer IN PLACE — the D8 gray-variant helper
   (corpse desaturation without touching desaturateGroup's live-material mutation path, which would
   corrupt the SHARED cached geometry every other standing figure of the same key also uses). */
function wholeObjectDesaturateColorBuffer(col){
  for(let i = 0; i < col.length; i += 3){
    const r = col[i], g = col[i + 1], b = col[i + 2];
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    col[i] = gray; col[i + 1] = gray; col[i + 2] = gray;
  }
}

/* QF-B1 (2026-07-14, PLAY-LENS P0 #4 — "unshaded white wireframe mesh floating in the settlement
   tray"): a targeted per-instance RECOLOR of a baked color-buffer IN PLACE, same "mutate the cached
   buffer once before it becomes a BufferAttribute" idiom as wholeObjectDesaturateColorBuffer just
   above. ROOT CAUSE this repairs: data/realm-props.js reuses a small set of whole-object models as
   generic SHAPE placeholders across many semantically-unrelated named props — most visibly
   prop-web.js's buildWebMass (a giant-spider corner web: thin pale ghost-silk strand tubes) standing
   in for "Alley Fire Escape" / "Rebar Thicket" / "Cable Snarl" / "Cargo Net Tangle" / "Barbed Coil" /
   "Coiled Mooring Rope" / "Shopping Cart Tangle" / "Broken Parking Meter Row" and others — none of
   which should read as pale silk. The whole-object pipeline has no other per-instance color hook
   (materials are shared/cached by opacity only, base color is always white so the BAKED vertex colors
   show through 1:1 — see wholeObjectMaterialsFor's own header) so every reuse rendered in the SAME
   fixed near-white palette regardless of what it was standing in for; on thin low-poly strand
   geometry that reads exactly as an unshaded white wireframe cage, not "a dark iron fire escape."
   Preserves each vertex's own baked LUMA (the model's existing lit/shadow/highlight pattern survives
   untouched — a strand still reads brighter where the original bake lit it) and replaces only the HUE,
   by scaling the target tint's r/g/b channels by that per-vertex luma — the standard "recolor a
   grayscale ramp" technique, deliberately simple (placeholder-tier, CLAUDE.md §II.0b "ALL ART IS
   PLACEHOLDER" — this un-blocks the wrong-palette bug without pretending to be a bespoke re-model). */
function wholeObjectRetintColorBuffer(col, targetHex){
  const tr = ((targetHex >> 16) & 255) / 255, tg = ((targetHex >> 8) & 255) / 255, tb = (targetHex & 255) / 255;
  for(let i = 0; i < col.length; i += 3){
    const r = col[i], g = col[i + 1], b = col[i + 2];
    const luma = r * 0.299 + g * 0.587 + b * 0.114;
    col[i] = tr * luma; col[i + 1] = tg * luma; col[i + 2] = tb * luma;
  }
}

/* wholeObjectGeometryFor(key, gray) — §4 step 3: cache-checked; else resolves the registry entry,
   calls its (already-loaded) builder between resetGeom()/getBuffers() (probe-lib.js's own contract),
   buckets tris by channel (WHOLE_CHANNEL_BUCKET, classifier fallback for untagged/"" tris), rebuilds
   the position/color/uv buffers BUCKET-CONTIGUOUS so THREE's addGroup material-index ranges work (the
   figureScene rebuild, ps1-sheet.html L266-291, ported verbatim), computes vertex normals, and caches
   the resulting BufferGeometry by registry key (+ "|gray" for the D8 desaturated corpse variant).
   Returns null on ANY failure (entry not registered, builder not yet loaded/failed import, a throwing
   builder) — callers (figureFor) treat null as "fall through to the existing cuboid chain," never a
   crash (§4 step 5's own guard list). D7: geometry is cached and tagged so clearGroup's per-setUnits
   sweep can skip disposing a SHARED cached geometry (see clearGroup's own edit below). */
const WHOLE_GEOMETRY_CACHE = {};
/* QF-B1 (2026-07-14, PLAY-LENS P0 #4): `retintHex` is an OPTIONAL 4th arg — a realm-props.js entry
   that REUSES a whole-object model whose baked palette doesn't match what it's standing in for (e.g.
   "Alley Fire Escape"/"Rebar Thicket"/"Cable Snarl" all reuse prop-web.js's buildWebMass — a giant-
   spider corner web authored in pale ghost-silk tones — as a generic thin-tangled-lattice placeholder
   shape; a fire escape/rebar/cable has no business rendering pale silk-white) threads its own
   `partParams.retint` hex straight through from the props mount call site below to
   wholeObjectRetintColorBuffer, applied to the SAME cached-geometry pipeline the `gray` desaturated-
   corpse variant already uses (own cache-key suffix, so a retinted variant never clobbers the
   original-palette geometry every OTHER reuse of that key still wants — see setBoard's props loop).
   Omitted (every pre-existing figure call site, and every prop reuse whose baked palette already
   fits — Cobweb Mass/Hanging Cocoon Cluster genuinely ARE pale silk) is a byte-identical no-op. */
function wholeObjectGeometryFor(key, gray, pieceKind, retintHex){
  if(!key) return null;
  const cacheKey = key + (gray ? "|gray" : "") + (retintHex != null ? ("|retint:" + retintHex.toString(16)) : "");
  const cached = WHOLE_GEOMETRY_CACHE[cacheKey];
  if(cached) return cached;

  // TABLETOP-UNITS.md §U3: pieceKind ("figure"/"prop") threads through to resolveWholeObject so a
  // genuine miss resolves to the blank-piece entry instead of null — see that function's own header
  // comment. Omitted (mountLightProp's "light:" lookups) keeps the original null-on-miss contract.
  const entry = resolveWholeObject(key, pieceKind);
  if(!entry || typeof entry.build !== "function") return null; // not registered / not yet loaded / failed import

  let POS, COL, CHAN;
  try {
    wholeObjectResetGeom();
    entry.build();
    const buf = wholeObjectGetBuffers();
    POS = buf.POS; COL = buf.COL; CHAN = buf.CHAN;
  } catch(e){
    // a throwing builder — evict any stale cache entry for this key and fall through to null (§4
    // step 5's "geometry build throws -> catch, evict cache entry, skip").
    delete WHOLE_GEOMETRY_CACHE[cacheKey];
    return null;
  }
  if(!POS || !POS.length) return null;

  const triCount = POS.length / 9;
  const uvAll = wholeObjectQuadUVs(triCount);
  // CAPTURE-GATE FOLLOW-UP: 4 buckets now (matte/metal/glass/glow) — see wholeObjectMaterialsFor's own
  // header for why "glow" got promoted out of the matte bucket into its own unlit slot.
  const buckets = [[], [], [], []];
  for(let t = 0; t < triCount; t++){
    const chanByte = (CHAN && CHAN[t] != null) ? CHAN[t] : 0;
    const chanName = WHOLE_CHANNEL_KEYS[chanByte] || "";
    const r = (COL[t * 9] + COL[t * 9 + 3] + COL[t * 9 + 6]) / 3;
    const g = (COL[t * 9 + 1] + COL[t * 9 + 4] + COL[t * 9 + 7]) / 3;
    const b = (COL[t * 9 + 2] + COL[t * 9 + 5] + COL[t * 9 + 8]) / 3;
    buckets[wholeObjectBucketFor(chanName, r, g, b)].push(t);
  }
  const pos = new Float32Array(POS.length), col = new Float32Array(COL.length), uv = new Float32Array(triCount * 6);
  let w = 0;
  const ranges = [];
  for(const bkt of buckets){
    const start = w;
    for(const t of bkt){
      pos.set(POS.slice(t * 9, t * 9 + 9), w * 9);
      col.set(COL.slice(t * 9, t * 9 + 9), w * 9);
      uv.set(uvAll.slice(t * 6, t * 6 + 6), w * 6);
      w++;
    }
    ranges.push([start * 3, (w - start) * 3]);
  }
  if(gray) wholeObjectDesaturateColorBuffer(col);
  if(retintHex != null) wholeObjectRetintColorBuffer(col, retintHex);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  ranges.forEach(([s, c], i) => { if(c > 0) geo.addGroup(s, c, i); });
  geo.computeVertexNormals();
  geo.userData.shared = true; // D7: clearGroup's dispose-skip tag for cached whole-object geometry
  WHOLE_GEOMETRY_CACHE[cacheKey] = geo;
  return geo;
}

/* ============================================================================
   BATTLE-THEATER T2 — THE GLB / GLTFLoader SEAM (docs/BATTLE-THEATER.md §7, vendor/three/README.md).
   A Blender-authored .glb model loaded ALONGSIDE the hand-authored probe-lib figures, routed through
   the IDENTICAL PS1 treatment so an import matches the shipped look, never a glossy passthrough:
     - glbLoadScene(url): the injected loader theater-figures.js's loadWholeObjectBuilders calls (kept
       here so THREE/GLTFLoader never enter that THREE-free, Node-importable file). One shared
       GLTFLoader instance; resolves gltf.scene (or null). Any parse/network failure rejects and the
       loader's own catch leaves the entry unresolved -> figureFor's glb branch skips it -> cuboid
       fallback (the same total-function miss-chain every other whole-object call site follows).
     - wholeObjectGeometryForGlb(cacheKey, entry): walks the parsed scene's meshes, bakes world-space
       triangles into the SAME non-indexed POS/COL buffer shape wholeObjectGeometryFor produces from a
       probe-lib builder, normalizes to the module size/seat convention (center X/Z, feet at y=0,
       uniform-scaled to GLB_TARGET_HEIGHT so the downstream WHOLE_OBJECT_SCALE/disc/seat path in
       setUnits treats it byte-identically to a procedural figure), and returns a BufferGeometry that
       wholeObjectMaterialsFor's faceted/flat-shaded/grain-mapped/dither-snapped materials render.
   Colour: a GLB usually carries no probe-lib CHAN channels and no baked vertex colours (the grunt
   test asset is white PBR), so per-vertex colour is taken from a mesh vertex-colour attribute when
   present, else the material base colour; a near-white/near-black material (no usable hue) substitutes
   the grit-neutral stone default so a colourless export reads as desaturated stone, not glaring white;
   then every colour is pulled GLB_DESAT_MIX of the way toward its own luma to sit in the grit palette
   range. All tris route to the matte/Lambert bucket (slot 0) — the same slot an untagged procedural
   tri classifies into — since there is no channel data to bucket by. This is a FIRST seam: per-entry
   height/colour overrides and channel-tagged GLB materials are deferred tuning knobs, not this unit.
   ============================================================================ */
const GLB_TARGET_HEIGHT = 1.5;      // module height convention (humanoid.js tops out ~1.475 incl. its baked disc)
const GLB_NEUTRAL_COLOR = 0x8a8378; // grit stone-grey for a colourless (near-white/black) GLB material
const GLB_DESAT_MIX = 0.35;         // fraction each imported colour is pulled toward its own luma
let _glbLoader = null;
function glbLoadScene(url){
  if(!_glbLoader) _glbLoader = new GLTFLoader();
  return _glbLoader.loadAsync(url).then(function(gltf){ return (gltf && gltf.scene) ? gltf.scene : null; });
}
function wholeObjectGeometryForGlb(cacheKey, entry){
  const cached = WHOLE_GEOMETRY_CACHE[cacheKey];
  if(cached) return cached;
  const scene = entry && entry.glbScene;
  if(!scene) return null;
  const POS = [], COL = [];
  const tmpV = new THREE.Vector3();
  const nCol = new THREE.Color(GLB_NEUTRAL_COLOR);
  try {
    scene.updateMatrixWorld(true);
    scene.traverse(function(obj){
      if(!obj.isMesh || !obj.geometry) return;
      const geom = obj.geometry;
      const posAttr = geom.getAttribute("position");
      if(!posAttr) return;
      const idx = geom.getIndex();
      const colAttr = geom.getAttribute("color");
      let mat = obj.material;
      if(Array.isArray(mat)) mat = mat[0];
      const baseCol = new THREE.Color(0xffffff);
      if(mat && mat.color) baseCol.copy(mat.color);
      const mn = Math.min(baseCol.r, baseCol.g, baseCol.b), mx = Math.max(baseCol.r, baseCol.g, baseCol.b);
      const neutralish = (mn > 0.9) || (mx < 0.06); // no usable hue -> grit-neutral substitute
      const world = obj.matrixWorld;
      const vertCount = idx ? idx.count : posAttr.count;
      for(let i = 0; i < vertCount; i++){
        const vi = idx ? idx.getX(i) : i;
        tmpV.fromBufferAttribute(posAttr, vi).applyMatrix4(world);
        POS.push(tmpV.x, tmpV.y, tmpV.z);
        let cr, cg, cb;
        if(colAttr){ cr = colAttr.getX(vi); cg = colAttr.getY(vi); cb = colAttr.getZ(vi); }
        else if(neutralish){ cr = nCol.r; cg = nCol.g; cb = nCol.b; }
        else { cr = baseCol.r; cg = baseCol.g; cb = baseCol.b; }
        const luma = cr * 0.299 + cg * 0.587 + cb * 0.114;
        cr += (luma - cr) * GLB_DESAT_MIX; cg += (luma - cg) * GLB_DESAT_MIX; cb += (luma - cb) * GLB_DESAT_MIX;
        COL.push(cr, cg, cb);
      }
    });
  } catch(e){ delete WHOLE_GEOMETRY_CACHE[cacheKey]; return null; }
  if(!POS.length || POS.length % 9 !== 0) return null; // empty / not clean triangle soup

  // normalize to the module seat convention: center X/Z, feet (min Y) at 0, uniform-scale to target height.
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for(let i = 0; i < POS.length; i += 3){
    if(POS[i] < minX) minX = POS[i]; if(POS[i] > maxX) maxX = POS[i];
    if(POS[i + 1] < minY) minY = POS[i + 1]; if(POS[i + 1] > maxY) maxY = POS[i + 1];
    if(POS[i + 2] < minZ) minZ = POS[i + 2]; if(POS[i + 2] > maxZ) maxZ = POS[i + 2];
  }
  const h = maxY - minY;
  const scale = (h > 1e-4) ? (GLB_TARGET_HEIGHT / h) : 1;
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  for(let i = 0; i < POS.length; i += 3){
    POS[i] = (POS[i] - cx) * scale;
    POS[i + 1] = (POS[i + 1] - minY) * scale;
    POS[i + 2] = (POS[i + 2] - cz) * scale;
  }

  const triCount = POS.length / 9;
  const uv = wholeObjectQuadUVs(triCount); // same per-tri grain windows the probe-lib path uses
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(POS), 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(COL), 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.addGroup(0, POS.length / 3, 0); // one group -> matte/Lambert bucket (slot 0); no CHAN data to bucket by
  geo.computeVertexNormals(); // non-indexed -> per-face normals -> faceted read under flatShading (D5 look)
  geo.userData.shared = true; // D7: clearGroup's dispose-skip tag for cached whole-object geometry
  WHOLE_GEOMETRY_CACHE[cacheKey] = geo;
  return geo;
}
// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §3-D3): every whole-object module is authored facing
// +z (verified against humanoid.js/mon-wolf.js/mon-giant.js/spider.js/prop-light.js — §1 ground
// truth), so the whole-object path sets figure.rotation.y to this ONE constant UNCONDITIONALLY —
// BASE_ORIENT_YAW (the cuboid-recipe orientation law above) never applies on this path, since a
// whole-object quadruped is already composed broadside in its own geometry, not end-on like the
// cuboid torso-quad base. Kept as a single named constant (not a bare 0 literal at the call site)
// so a future capture-review finding ("quadruped broadside" read issue) is ONE constant to flip,
// never a per-module edit (§3-D3's own text).
const WHOLE_OBJECT_YAW = 0;
/* P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §2.4/§4 step 5) — the unit-side resolution key: a
   pc/ally with a known class resolves "class:<lowercase class>"; every other unit (foe, or a
   pc/ally with no className) resolves its bestiary recipeSlug directly (already the exact bestiary
   id per theater-data.js's own comments). Mirrors §2.4's resolution-order pseudocode exactly. */
function wholeObjectKeyFor(kind, className, recipeSlug){
  if((kind === "pc" || kind === "ally") && className) return "class:" + className;
  return recipeSlug || null;
}
// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §3-D7's last clause: "retire() gains an explicit
// cache-dispose sweep"). clearGroup's per-render sweeps deliberately SKIP disposing shared whole-
// object geometry/materials (they're reused across every figure/prop of the same key, still live);
// retire() is the one true end-of-life point for this Theater instance, so it's the right place to
// actually free that GPU memory — every cached BufferGeometry + material triple, plus the grain
// atlas texture, disposed exactly once, then the caches themselves cleared so a subsequent mount()
// rebuilds fresh (dispose()'d THREE objects can't be reused). Idempotent-safe: an already-empty
// cache (retire() called twice, or called before any whole-object figure ever rendered) is a no-op.
function disposeWholeObjectCaches(){
  Object.keys(WHOLE_GEOMETRY_CACHE).forEach(function(k){
    const geo = WHOLE_GEOMETRY_CACHE[k];
    if(geo && geo.dispose) geo.dispose();
    delete WHOLE_GEOMETRY_CACHE[k];
  });
  Object.keys(WHOLE_MATERIALS_CACHE).forEach(function(k){
    const mats = WHOLE_MATERIALS_CACHE[k];
    if(Array.isArray(mats)) mats.forEach(function(m){ if(m && m.dispose) m.dispose(); });
    delete WHOLE_MATERIALS_CACHE[k];
  });
  if(WHOLE_GRAIN_TEX){ WHOLE_GRAIN_TEX.dispose(); WHOLE_GRAIN_TEX = null; }
}

// ---- the surface the root and the figure-build leaf consume. The two caches stay module-private:
// their only outside contract is disposeWholeObjectCaches(), which retire() still calls. ----
export {
  WHOLE_OBJECT_SCALE,
  WHOLE_OBJECT_YAW,
  GLB_TARGET_HEIGHT,
  glbLoadScene,
  wholeObjectKeyFor,
  wholeObjectGeometryFor,
  wholeObjectGeometryForGlb,
  wholeObjectMaterialsFor,
  wholeObjectRetintColorBuffer,
  disposeWholeObjectCaches
};
