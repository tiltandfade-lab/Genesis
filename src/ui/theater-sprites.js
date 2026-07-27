/* THEATER SPRITES — the PIXEL-SPRITE / BILLBOARD family: the sprite texture cache and its async
   loader, the SRD size ladder, the standee side shell, the one billboard-mesh constructor every
   sprite in the game is built by (with the STANDEE-WINS-TIES depth-bias shader injection), the
   tabletop and interior TRUE-SCALE billboard wrappers, and the per-render Y-axis billboard facing
   pass — extracted VERBATIM from src/ui/theater-boot.js in split step B7 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   THE PROTECTED CONTRACT THIS FILE CARRIES (the brief's §Protected contracts, "pixel sprites as the
   canonical live figure register, including scale, alpha/depth behavior, billboarding, base/contact
   treatment, selection feedback, and fallbacks"): every one of those behaviours is a MOVE, never a
   rewrite. The SRD size ladder (SPRITE_SIZE_SCALE / spriteSizeScaleFor) and the TRUE-SCALE interior
   sizing (interiorSpriteBillboard's worldHeight/scaleVsHuman/scaleTrue precedence + the wall-height
   clamp) are byte-identical. The alpha-cutout law (alphaTest = entry.alphaCutoff, DoubleSide,
   depthWrite:true) and the SPRITE PURITY exemption (userData.psxExempt; these materials never route
   through applyPsxShaderTweaks) are byte-identical. The cast-shadow silhouette pair
   (customDepthMaterial + customDistanceMaterial, both alpha-tested off the same sprite texture) and
   receiveShadow:false are byte-identical. The footX/footY contact anchor, the eager standeeWrap
   split (camera tilt on the wrap, verb tilt on the outer group) and every userData key the rest of
   the engine reads off a standee group are byte-identical. The FALLBACK discipline holds unchanged:
   a miss (no texture yet, a failed load) returns null and the caller falls through to the 3D chain —
   this channel only ever ADDS a resolution, it never blocks one.

   SHADER-KEY LAW (B4's proof discipline, re-run for this step): the STANDEE-WINS-TIES depth-bias
   `mat.onBeforeCompile` closure and its `mat.customProgramCacheKey = function(){ return
   "standee-depth-bias-v1"; }` moved BYTE-IDENTICALLY — not one character of the injected GLSL
   (`uniform float uStandeeDepthBias;`, the four replacement lines around `#include <project_vertex>`)
   changed, and no accessor was threaded into that closure. That is why `SPRITE_DEPTH_BIAS_UNITS`
   itself MOVED here rather than staying a root `let` behind a ctx accessor: an accessor swap would
   have rewritten a line INSIDE the injection closure. The root keeps its facade seam
   (window.Theater._setStandeeDepthBiasForTest) and now writes/reads the value through this module's
   exported spritesSetDepthBiasUnits / spritesGetDepthBiasUnits pair — three ROOT lines changed, zero
   moved lines. SPRITE_DEPTH_BIAS_MATERIALS is a `const` array: the root's facade prunes and retunes
   the SAME array object through its imported binding, so the registry the shader injection pushes
   into IS the registry the diagnostic walks.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as every B1-B6 module): this module NEVER
   imports theater-boot.js. Capabilities arrive ONCE via spritesInit(ctx) into the module-local
   mirrors below, so every moved body keeps its bare identifiers. It DOES read and write the live
   theater state record (S.mounted / S.lastUnits / S.unitsKey / S.lastBoard / S.boardKey /
   S.rotationStep / S.unitGroup / S.propGroup / S.interiorGroup / S.standeeCollisionDirty), so the
   root also calls spritesSyncState(S) at BOTH `S = createTheaterState()` reassignment sites, beside
   the existing clayRoomSyncState / lightLabSyncState / postSyncState / lightingSyncState /
   motesSyncState / cameraSyncState / occlusionSyncState calls.

   THIS MODULE IS A LEAF-LEVEL PEER, NOT A ROOT — three one-way leaf->leaf edges, all censused
   acyclic, all spelled with the IDENTICAL specifier theater-boot.js uses for the same file so both
   resolve to the ONE cached module instance:
     - src/ui/theater-camera.js for CAM_ELEV_DEG / CAM_YAW_OFFSET_DEG (the authored camera pitch and
       dimetric yaw offset updateSpriteBillboardYaw derives its facing/tilt from). theater-camera.js
       reads NOTHING from this file.
     - src/ui/theater-lighting.js for updateSpriteCameraFill (the sprite-only camera fill re-aim that
       has always run as updateSpriteBillboardYaw's first statement). theater-lighting.js imports only
       "three".
     - src/ui/theater-standee-mount.js for mountedStandeeFigures / resolveMountedStandeeSupportCollisions
       / syncStandeeContactBlob (the support-collision + contact-pool sync tail of the same facing
       pass). That module imports only "three" — it reads nothing from this file.

   SCHEDULER LAW (the brief's §Protected contracts): this module owns NO requestAnimationFrame loop
   (censused: zero). updateSpriteBillboardYaw is still called by the ROOT's own scheduleRender rAF
   tick, by setUnits/rotate's post-mount pass and by the facade's deterministic test seam — exactly
   the three call sites it had in the monolith. It does not touch the practical FLICKER loop
   (theater-lighting.js), the MOTE loop (theater-motes.js), the verb tween channel (S.tweens) or the
   root's dirty-frame loop. Nothing was unified; nothing was re-cadenced.

   ROOT-OWNED, DELIBERATELY NOT MOVED (censused — they arrive through ctx or accessors instead):
     FACETED_FLIP_ENABLED — the S5 one-flag retreat literal. HARD PIN: dev/verify-l2-census.mjs
       rewrites `const FACETED_FLIP_ENABLED = true;` to `= false` in the ROOT's own source text and
       re-imports it, and dev/battle-gate/capture-s5-flip-card.mjs mutates that same literal. It stays
       in theater-boot.js untouched.
     spriteAssetPathFor — CENSUSED AND DELIBERATELY LEFT BEHIND. It reads FACETED_FLIP_ENABLED
       directly, and `_spriteCensusOutcome` (root, B3's census) exists precisely to MIRROR its gate
       "same three conditions, same order" — splitting the pair across two files would have put one
       half of one deliberately-mirrored gate behind an accessor and the other half on the bare
       literal, which is exactly the drift its own header warns about. dev/verify-s5-faceted-flip.mjs
       also asserts `NEW_SOURCE.includes("function spriteAssetPathFor(entry){")` against the ROOT's
       text. Its only moved reader is spriteTextureFor, so it costs exactly one ctx entry.
     spriteEntryFor + normalizeSpriteKey + SPRITE_JOIN_NAME_FALLBACK_COUNT/_WARNED — the registry
       JOIN. CENSUSED: not one body in this file calls spriteEntryFor (its callers are
       interiorBuildPieces, the facade seams and four ctx lists, all root). Two RED-FIRST harnesses
       MUTATE its body inside theater-boot.js's own source text and re-import the mutated root
       (dev/verify-theater-sprites.mjs stubs the `e.status !== "cut"` guard;
       dev/verify-sprite-join.mjs stubs the TIER 1 SPRITE_BY_BESTIARY_ID guard), so the join stays
       where those proofs can still reach it.
     SPRITE_CHANNEL_ENABLED — the kill switch. Already root-owned behind figure-build's B3 accessor;
       censused: no body here reads it.
     SPRITE_UNLIT_DEBUG — a mutable root `let` that window.Theater.__setSpriteUnlitDebug flips live,
       read by TWO root production builders as well (buildDressingCard and buildExtrusionProp keep
       their own copies of the same debug branch), so it stays root and is read LIVE through the
       spritesCtxUnlitDebug accessor.
     ITR_SPRITE_EMISSIVE_TINT — a mutable root `let` that setBoard RESETS to white and
       setInteriorBoard WRITES per realm grade, and that the same two root dressing builders read.
       Root-owned; read LIVE through the spritesCtxEmissiveTint accessor. ITR_SPRITE_TINT_STRENGTH
       (its blend weight) has no reader here at all and stayed put with it.
     LIGHT_TUNABLES — the live light-tunable record (B2's law: the root owns the seed set). Passed as
       a plain ctx mirror: it is never reassigned, only mutated in place, so the object read here IS
       the object the Light Lab tunes.
     _censusBoardSceneKind — shared with dressingTextureFor (root), so it stays root.
     GLB_TARGET_HEIGHT / HUMAN_TRUE_HEIGHT / SPRITE_CAMERA_FILL_LAYER / textureLoader / setUnits /
       setInteriorBoard — root (or root-imported) capabilities the async texture callback and the two
       sizing wrappers consume; all arrive through ctx.

   `theaterCensusRecord` stays a BARE GLOBAL reference, exactly as in the monolith and exactly as
   src/ui/theater-figure-build.js already documents: it is declared by the classic script src/state.js,
   every call site is guarded by `typeof theaterCensusRecord === "function"`, and a free-variable
   lookup from module scope resolves off globalThis through the identical path it always did.

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, the
   `split B7` chunk-boundary notes marking where a root-owned declaration was left behind, the two
   accessor swaps named above (both OUTSIDE every shader string and outside the injection closure),
   the two-line spritesSetDepthBiasUnits/spritesGetDepthBiasUnits accessor pair the root's facade
   seam writes through, and the trailing `export {...}` block. */
import * as THREE from "three";
// split B7: sibling leaf modules (leaf->leaf, one-way — see this file's header). Identical specifier
// spelling to theater-boot.js's own imports of the same files, so both resolve to the ONE cached
// module instance and the functions called here ARE the functions the root calls.
import { CAM_ELEV_DEG, CAM_YAW_OFFSET_DEG } from "./theater-camera.js";
import { updateSpriteCameraFill } from "./theater-lighting.js";
import {
  mountedStandeeFigures,
  resolveMountedStandeeSupportCollisions,
  syncStandeeContactBlob
} from "./theater-standee-mount.js";

// ---- root-capability mirrors (wired once by spritesInit; S re-synced by spritesSyncState) ----
let S;
let GLB_TARGET_HEIGHT, HUMAN_TRUE_HEIGHT, LIGHT_TUNABLES, SPRITE_CAMERA_FILL_LAYER,
    _censusBoardSceneKind, setInteriorBoard, setUnits, spriteAssetPathFor, textureLoader;
// live root `let`s — read through accessors, never mirrored (a mirror would go stale the moment the
// facade setter or setInteriorBoard writes one). See this file's header.
let spritesCtxUnlitDebug, spritesCtxEmissiveTint;

export function spritesInit(ctx){
  ({ GLB_TARGET_HEIGHT,
    HUMAN_TRUE_HEIGHT,
    LIGHT_TUNABLES,
    SPRITE_CAMERA_FILL_LAYER,
    _censusBoardSceneKind,
    setInteriorBoard,
    setUnits,
    spriteAssetPathFor,
    textureLoader,
    spritesCtxUnlitDebug,
    spritesCtxEmissiveTint } = ctx);
  S = ctx.S;
}
export function spritesSyncState(nextS){ S = nextS; }

// split B7 (SHADER-KEY LAW): SPRITE_DEPTH_BIAS_UNITS lives HERE so the depth-bias injection closure
// below could move byte-identically. The root's window.Theater._setStandeeDepthBiasForTest facade
// seam writes and reads it through this pair — the value the shader uniform is seeded from is always
// the one the diagnostic last set.
export function spritesSetDepthBiasUnits(v){ SPRITE_DEPTH_BIAS_UNITS = v; }
export function spritesGetDepthBiasUnits(){ return SPRITE_DEPTH_BIAS_UNITS; }

// texture cache, keyed by sprite slug: undefined (never requested) | "pending" | "failed" | a loaded
// THREE.Texture. Exposed read/write on window.Theater._spriteTextureCache (bottom of this file) as a
// TEST-ONLY seam — dev/verify-theater-sprites.mjs pre-seeds a fake Texture here to exercise the
// cut-status render path without a real network/file image load (the spec's own "stub texture
// loader" instruction); nothing in product logic writes to this object from outside spriteTextureFor.
const SPRITE_TEXTURE_CACHE = {};
// VQ2-RESPEC.md S5 cache-key law: SPRITE_TEXTURE_CACHE stays SLUG-keyed (existing diagnostic/
// capture-script contract — window.Theater._spriteTextureCache is read by slug elsewhere, e.g.
// dev/battle-gate/capture-mediums-lineup.mjs), but a slug's RESOLVED PATH can change mid-session
// (FACETED_FLIP_ENABLED toggled, or a registry regen flips runtimeAdmitted) — SPRITE_TEXTURE_SRC
// remembers which path is CURRENTLY loaded under each slug's cache entry, so spriteTextureFor can
// tell a real cache hit from a STALE one (same slug, different resolved asset) and evict+reload
// instead of silently serving the wrong asset's texture under the old key.
const SPRITE_TEXTURE_SRC = {};

// ---- split B7 chunk boundary: spriteEntryFor + the registry JOIN family (normalizeSpriteKey,
// SPRITE_JOIN_NAME_FALLBACK_COUNT/_WARNED) stay in theater-boot.js — see this file's header. ----

// SPRITE-SIZE LADDER — deliberately its OWN table, not a reuse of sizeScaleFor's SIZE_SCALE above.
// SIZE_SCALE is a cosmetic in-game-readability tune (gargantuan/medium = 2.2x) for the cuboid/recipe
// figure family; a billboard plane instead bakes the SRD size CATEGORY's real space ratio (5ft
// Medium square vs. a 20ft Gargantuan footprint = 4 squares = 4x) so "a Gargantuan dragon sprite must
// visibly dwarf a Medium PC sprite" (the spec's own decision 4 wording) holds at the geometry level,
// not just a readability nudge — this is the ratio dev/verify-theater-sprites.mjs's check (c) proves.
const SPRITE_SIZE_SCALE = {
  tiny: 0.5, small: 1, medium: 1, large: 2, huge: 3, gargantuan: 4
};
function spriteSizeScaleFor(size){
  const s = (size || "medium").toLowerCase();
  return SPRITE_SIZE_SCALE[s] != null ? SPRITE_SIZE_SCALE[s] : 1;
}

/* Async texture fetch, mirroring the glb path's own "resolved now or fall through, pick it up on the
   next replay" convention (loadWholeObjectBuilders' onSettled callback, this file's module-scope call
   near the bottom): a cache miss kicks off THREE.TextureLoader.load and returns null immediately (this
   call's figure falls through to the 3D chain, exactly like a whole-object entry whose builder isn't
   loaded yet) — success nearest-filters the texture (no mipmap smear, matching the PS1/cutout look)
   and, if the theater is still mounted, replays S.lastUnits (same null-the-dirty-key-then-resend
   trick loadWholeObjectBuilders' callback uses) so the sprite appears on the very next render without
   the caller having to re-drive anything. A failed load caches "failed" — permanently falls through,
   never retried, never throws.

   VQ2-RESPEC.md S5 -- takes the full registry ENTRY now (was just `slug`) so it can resolve THROUGH
   the entry's own admission fields (spriteAssetPathFor, above) instead of hard-building the legacy
   path itself. Cache-key law: SPRITE_TEXTURE_SRC[slug] remembers which path is currently loaded
   under SPRITE_TEXTURE_CACHE[slug] -- a resolved-path mismatch (the flip fired, or a regen changed
   this slug's admission, since the last request) evicts the stale entry and reloads from the NEW
   path, rather than serving a legacy texture out of a cache slot the candidate now owns (or vice
   versa) under the same slug key. */
// CL-R1: sprite colour-space tagging. ON by default (the proven-correct behaviour); ?spritesrgb=0
// or GS.spriteSrgb === false restores the old untagged path so the causal A/B stays reproducible
// rather than living only in a banked screenshot.
let SPRITE_SRGB_FLAG = null;
function spriteSrgbTaggingOn(){
  if(SPRITE_SRGB_FLAG === null){
    let on = true;
    try {
      if(typeof window !== "undefined"){
        if(window.GS && window.GS.spriteSrgb === false) on = false;
        else if(window.location && window.location.search
          && new URLSearchParams(window.location.search).get("spritesrgb") === "0") on = false;
      }
    } catch(e){}
    SPRITE_SRGB_FLAG = on;
  }
  return SPRITE_SRGB_FLAG;
}
function spriteTextureFor(entry){
  // named spriteSlug (not `slug`) -- `slug` is a symbol world.state already owns; a same-named
  // const/let/var here (even function-local) trips check-manifest's single-definition DRIFT check,
  // which scans by regex, not real scope (build/check-manifest.py's own documented limitation).
  const spriteSlug = entry && entry.slug;
  if(!spriteSlug) return null;
  const path = spriteAssetPathFor(entry);
  // A slug never seen before (SPRITE_TEXTURE_SRC has no prior record) just records `path` without
  // evicting -- a test harness pre-seeding SPRITE_TEXTURE_CACHE[slug] directly (the "stub texture
  // loader" seam, dev/verify-theater-sprites.mjs) must still hit on ITS first read; only a slug
  // seen before whose resolved path has since CHANGED (a real flip, mid-session) is stale.
  const priorPath = SPRITE_TEXTURE_SRC[spriteSlug];
  SPRITE_TEXTURE_SRC[spriteSlug] = path;
  if(priorPath !== undefined && priorPath !== path){
    delete SPRITE_TEXTURE_CACHE[spriteSlug]; // stale -- loaded (or pending/failed) from a DIFFERENT path
  }
  const cached = SPRITE_TEXTURE_CACHE[spriteSlug];
  if(cached && cached !== "pending" && cached !== "failed") return cached;
  if(cached === "pending") return null;
  if(cached === "failed"){
    // VQ2-RESPEC.md §3 unit L2 — a slug that already failed to load stays permanently failed (never
    // retried, per this function's own header); each subsequent request is a fresh demand hitting the
    // same dead end, so it's recorded every time, not just on the original failure.
    if(typeof theaterCensusRecord === "function") theaterCensusRecord("sprite-texture", "sprite-load-failed", spriteSlug, _censusBoardSceneKind());
    return null;
  }
  SPRITE_TEXTURE_CACHE[spriteSlug] = "pending";
  textureLoader.load(
    path,
    function(tex){
      // BEAUTY-WAVE-2 BW2-0: magFilter stays Nearest (crisp when magnified — the pixel-art law, a
      // creature sprite viewed close must show its authored texel grid, not smoothed mush). minFilter
      // becomes Linear (was Nearest) — a billboard plane shrinks as it recedes/rotates, and
      // Nearest-minification is what actually produced the "mode-7" shimmer/warp (nearest-picks a
      // single aliasing texel per screen pixel instead of blending the covered footprint); Linear
      // minification kills that without needing mipmaps (NPOT-safe — generateMipmaps stays false,
      // Linear minFilter doesn't require them, only NearestMipmap*/LinearMipmap* variants do).
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      // CL-R1 CAUSAL A/B SEAM (docs/CLAYROOM-RESET-LADDER.md §CL-R1) — Adam, 2026-07-23: "the sprite
      // is back to an overexposed undersaturated crappy looking piece of paper". THE CANDIDATE CAUSE:
      // this loader never tagged the PNG's colour space, while every other authored colour texture in
      // this file does (~891, ~944, ~13930). three r166 defaults WebGLRenderer.outputColorSpace to
      // SRGBColorSpace and this file never overrides it, so an UNTAGGED texture is sampled as if its
      // sRGB bytes were already linear and then gamma-encoded a SECOND time on output. That transform
      // lifts midtones hard and collapses chroma — pale, low-contrast, "sickly", which is exactly the
      // symptom. Gated behind ?spritesrgb=1 for now so the fix is proven by a reproducible A/B capture
      // (source art vs unlit render vs lit render, tagged vs untagged) rather than asserted, per the
      // ladder's own causality law. Flip to unconditional once the A/B is banked and Adam has ruled.
      if(spriteSrgbTaggingOn()) tex.colorSpace = THREE.SRGBColorSpace;
      SPRITE_TEXTURE_CACHE[spriteSlug] = tex;
      if(S.mounted && S.lastUnits){
        S.unitsKey = null; // force the dirty-key skip past, same trick as the glb-settle replay
        setUnits(S.lastUnits);
      }
      // DUNGEON-GRAPH.md U3 iteration-2, ruling 3: an interior board's `pieces` are billboard sprites
      // too (interiorBuildPieces -> buildSpriteBillboard, same async-texture-not-loaded-yet miss this
      // callback exists to recover from) — S.lastUnits alone (above) never covers them, since pieces
      // mount via S.lastBoard/setInteriorBoard, a completely separate replay target. Same "null the
      // dirty key, replay" trick, gated to the interior3d board kind so a combat board's lastBoard is
      // never accidentally replayed through the wrong builder.
      if(S.mounted && S.lastBoard && S.lastBoard.kind === "interior3d"){
        S.boardKey = null;
        setInteriorBoard(S.lastBoard);
      }
    },
    undefined,
    function(){
      SPRITE_TEXTURE_CACHE[spriteSlug] = "failed";
      // VQ2-RESPEC.md §3 unit L2 — the FIRST failure, recorded at the moment it happens (the "failed"
      // cache-state check above only catches requests AFTER this one).
      if(typeof theaterCensusRecord === "function") theaterCensusRecord("sprite-texture", "sprite-load-failed", spriteSlug, _censusBoardSceneKind());
    }
  );
  return null;
}

/* Billboard construction (T4.2): a single THREE plane, textured, nearest-filtered, alpha-cutout (no
   blend-order fighting between overlapping sprites), sized from the SPRITE-SIZE LADDER above times
   GLB_TARGET_HEIGHT (the module-height convention this file already established for the glb path,
   L1173 — reused here rather than inventing a second height constant, since both paths bake an
   ABSOLUTE authored size into their own geometry the same way). Seated feet-at-0 (mesh.position.y =
   h/2 lifts the plane's own center up to half its height, matching every other figure's feet-on-the-
   base-disc convention) — the base disc ITSELF is untouched (setUnits' own math; see this unit's
   header note: this group carries no userData.wholeObject, so it falls through setUnits' EXISTING
   non-whole-object disc branch, unmodified by this unit). Y-axis-only billboarding to the camera is
   applied per render pass by updateSpriteBillboardYaw() (scheduleRender, below) rather than baked
   here — the group's OWN rotation.y is reset every dirty render, so it never drifts out of sync with
   whichever way setUnits/rotate() last left the camera. */
// BEAUTY-WAVE.md VP1: shared billboard-mesh construction, factored out of buildSpriteBillboard so
// the interior TRUE-SCALE path (interiorSpriteBillboard, below) can build a differently-proportioned
// (width != height, from the texture's own aspect) plane through the exact same material/shadow
// setup, rather than forking that logic a second time. w/h are already-final WORLD units; this
// function does no sizing math of its own.

// ---- split B7 chunk boundary: SPRITE_UNLIT_DEBUG (root `let`, read here through
// spritesCtxUnlitDebug) stays in theater-boot.js — see this file's header. ----

// STANDEE-WINS-TIES bias (2026-07-25): view-space camera-ward depth pull applied in the sprite
// card's vertex stage (depth test+write only — pixels, anchors, and cast shadows untouched). A
// LIVE-tunable uniform so the diagnostic A/B can prove the bias in one call; the authored default
// is the reviewed production value, not a taste slider.
let SPRITE_DEPTH_BIAS_UNITS = 0.25;
const SPRITE_DEPTH_BIAS_MATERIALS = [];

// ---- split B7 chunk boundary: ITR_SPRITE_EMISSIVE_TINT (root `let`, read here through
// spritesCtxEmissiveTint) and ITR_SPRITE_TINT_STRENGTH stay in theater-boot.js. ----

const STANDEE_SIDE_SHELL_THICKNESS = 0.035;
let STANDEE_SIDE_SHELL_MATERIALS = null;
function standeeSideShellMaterials(){
  if(STANDEE_SIDE_SHELL_MATERIALS) return STANDEE_SIDE_SHELL_MATERIALS;
  const side = new THREE.MeshLambertMaterial({
    color: 0x3d342b,
    side: THREE.DoubleSide
  });
  const hiddenFace = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
    colorWrite: false,
    side: THREE.DoubleSide
  });
  // THREE.BoxGeometry groups: +X, -X, +Y, -Y, +Z, -Z. Only the four thin edges render;
  // front/back stay invisible so transparent PNG regions never reveal a rectangular backing card.
  STANDEE_SIDE_SHELL_MATERIALS = [side, side, side, side, hiddenFace, hiddenFace];
  return STANDEE_SIDE_SHELL_MATERIALS;
}
function buildSpriteBillboardMesh(tex, w, h, entry){
  entry = entry || {};
  const spriteSlug = entry.slug || null;
  const alphaCutoff = (typeof entry.alphaCutoff === "number")
    ? Math.max(0, Math.min(1, entry.alphaCutoff)) : 0.5;
  const footX = (typeof entry.footX === "number")
    ? Math.max(0, Math.min(1, entry.footX)) : 0.5;
  const footY = (typeof entry.footY === "number")
    ? Math.max(0, Math.min(1, entry.footY)) : 1;
  const geo = new THREE.PlaneGeometry(w, h);
  // BW2-4b item 1 — THE BRIGHTNESS LAW (see ITR_SCENE_KEY/ITR_SPRITE_EMISSIVE_FLOOR): the billboard is
  // now LIT — a MeshLambertMaterial that RECEIVES the interior hemisphere key + torch PointLights +
  // the realm-graded ambient, so a sprite beside a torch reads warmer/brighter than the same sprite in
  // a dark corner (the HD-2D integration trick). SPRITE PURITY holds: this is a LIGHTING response only,
  // zero geometric/texel distortion (no dither, no vertex-snap — it still never routes through
  // applyPsxShaderTweaks). emissiveMap = the sprite's own texture at ITR_SPRITE_EMISSIVE_FLOOR gives an
  // albedo-scaled readability floor so a dark-art creature never crushes to unreadable black, WITHOUT
  // ever reading as day-lit (emissive is a fixed dim self-illumination, not a light). receiveShadow
  // stays OFF (U3 ruling: a cast shadow smeared across a flat cutout reads as a bug). The debug flag
  // (SPRITE_UNLIT_DEBUG) restores the old full-bright MeshBasic for the measurement reference capture.
  const mat = spritesCtxUnlitDebug() // split B7: mutable root `let` (window.Theater.__setSpriteUnlitDebug flips it live) — read through the ctx accessor
    ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: alphaCutoff, side: THREE.DoubleSide, depthWrite: true })
    : new THREE.MeshLambertMaterial({
        map: tex, emissiveMap: tex, emissive: spritesCtxEmissiveTint(), emissiveIntensity: LIGHT_TUNABLES.spriteEmissiveFloor, // split B7: mutable root `let` (setBoard resets it, setInteriorBoard writes the realm grade) — read through the ctx accessor
        transparent: true, alphaTest: alphaCutoff, side: THREE.DoubleSide, depthWrite: true
      });
  SPRITE_DEPTH_BIAS_MATERIALS.push(mat);
  // (SPRITE_DEPTH_BIAS_UNITS + the registry are module-scope, declared beside SPRITE_UNLIT_DEBUG.)
  // STANDEE-WINS-TIES depth law (Adam, 2026-07-25: "the sprite should be in front of the sphere"):
  // a flat card beside a bulging prop (the bench sphere's near limb) loses the per-pixel depth
  // fight along its card edges even when the standee's cell is nearer — physically true for the
  // geometry, wrong for the tabletop fiction, where an upright standee occludes props behind its
  // cell. The card's DEPTH (test + write) is pulled a quarter-unit camera-ward in view space at
  // the vertex stage; screen pixels, foot anchor, selection, and the alpha-silhouette CAST SHADOW
  // (customDepthMaterial, untouched) all stay exactly where they were. A real occluder — a pillar
  // or wall half a cell nearer — still covers the card; only near-ties flip to the standee.
  mat.onBeforeCompile = function(shader){
    shader.uniforms.uStandeeDepthBias = { value: SPRITE_DEPTH_BIAS_UNITS };
    mat.userData.standeeDepthBiasUniform = shader.uniforms.uStandeeDepthBias;
    shader.vertexShader = "uniform float uStandeeDepthBias;\n" + shader.vertexShader.replace(
      "#include <project_vertex>",
      [
        "vec4 mvPosition = vec4( transformed, 1.0 );",
        "mvPosition = modelViewMatrix * mvPosition;",
        "mvPosition.z += uStandeeDepthBias; // STANDEE-WINS-TIES: camera-ward depth bias (view units)",
        "gl_Position = projectionMatrix * mvPosition;"
      ].join("\n")
    );
  };
  // shared program across sprite materials must key on the injected chunk, not collide with stock Lambert
  mat.customProgramCacheKey = function(){ return "standee-depth-bias-v1"; };
  // DUNGEON-GRAPH.md U3 iteration-2, SPRITE PURITY ruling (Adam 2026-07-10 evening): billboards must
  // carry ZERO PS1 distortion (no dither, no vertex-snap) — a flat-cut 2D sprite reads as a sticker
  // the moment its texel grid wobbles or dithers, unlike a real low-poly mesh where those tricks read
  // as "in-world" texture grain. This material deliberately never routes through applyPsxShaderTweaks
  // (contrast wholeObjectMaterialsFor/figureMaterialFor/interiorBuildInstancedMesh, which all do).
  // userData.psxExempt is a TESTABILITY flag only (no runtime behavior reads it) — dev/verify-dungeon-
  // interior.mjs's sprite-purity check asserts it's set (billboards) vs. absent+psxApplied set (walls).
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  // Layer 0 keeps the complete production light response. Layer 2 adds the sprite-only camera fill;
  // the camera itself still sees layer 0, so this is a LIGHT MASK, never a visibility fork.
  if(mesh.layers) mesh.layers.enable(SPRITE_CAMERA_FILL_LAYER);
  // `footX`/`footY` are the ONE authored contact/rotation anchor. Move the art around local origin
  // so that exact image coordinate sits at (0,0), rather than compensating later with a second
  // `floor` offset. The legacy bottom-centre default (0.5,1) is byte-identical to x=0,y=h/2.
  mesh.position.set((0.5 - footX) * w, (footY - 0.5) * h, STANDEE_SIDE_SHELL_THICKNESS / 2 + 0.001);
  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2 (real light sources + cast shadows, interiors only):
  // a billboard CASTS a shadow (so creature silhouettes fall on the interior floor) via a dedicated
  // alpha-tested depth + distance material (a plain opaque shadow pass would cast a solid SQUARE
  // shadow off the plane's full quad, not the sprite's actual cutout silhouette) but never RECEIVES one (a receiving
  // billboard would show other casters' shadows smeared across its own flat alpha-cutout face, which
  // reads as a lighting bug, not grounding). Harmless when renderer.shadowMap.enabled is false (the
  // combat/tabletop path, §2's untouched "no shadow maps" ruling) — shadowMap being globally off means
  // these per-mesh flags are simply never consulted there.
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
    map: tex, alphaTest: alphaCutoff, side: THREE.DoubleSide, depthPacking: THREE.RGBADepthPacking
  });
  // Directional/spot lights use customDepthMaterial; point lights use customDistanceMaterial.
  // Both sample the already-resident sprite alpha, so every production shadow-light type receives
  // the same cutout silhouette without adding a second caster or another texture.
  mesh.customDistanceMaterial = new THREE.MeshDistanceMaterial({
    map: tex, alphaTest: alphaCutoff, side: THREE.DoubleSide
  });
  const g = new THREE.Group();
  // BW2-2b item 1 (FLOOR-ALIGNED BASES — "the bug"): the sprite mesh lives in its OWN inner wrapper,
  // built EAGERLY here (not lazily on first verb, standee-verbs.js's pre-BW2-2b ensureWrap convention)
  // so camera-pitch tilt has somewhere to go that ISN'T this outer group `g` the moment a standee
  // mounts — before this fix, updateSpriteBillboardYaw stamped `fig.rotation.x = tilt` straight onto
  // `g`, and BW2-2's plinth base (added later as a plain CHILD of `g` — buildInteriorBase's own header)
  // inherited that tilt with it, reading as a coin propped up on edge instead of a flat mini base. Now
  // only `wrap` (holding the cutout plane + its thin side shell) gets the camera tilt (see
  // updateSpriteBillboardYaw below); a support/selection ring mounted as a SIBLING of `wrap`
  // directly on `g` (interiorBuildPieces/setUnits,
  // setActingUnit) stays floor-flat under `g`'s own yaw-only rotation. `g.userData.standeeWrap` is the
  // SAME identity key standee-verbs.js's runKeyframeVerb reads/writes — see that file's own updated
  // COMPOSITION CONTRACT header for the other half of this split (verb-tilt, e.g. fall-death, now
  // writes `g.rotation.x` directly instead, freed by camera-tilt vacating that field).
  const wrap = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, STANDEE_SIDE_SHELL_THICKNESS),
    standeeSideShellMaterials()
  );
  shell.position.set((0.5 - footX) * w, (footY - 0.5) * h, 0);
  // The shell gives the standee a visible physical edge, but it is still a full rectangular box.
  // If it enters a shadow map it projects that hidden card shape behind the alpha-cut sprite. The
  // cutout plane above is the sole shadow caster; removing this redundant caster is also cheaper.
  shell.castShadow = false;
  shell.receiveShadow = false;
  shell.userData.standeeSideShell = true;
  shell.userData.spriteSlug = spriteSlug;
  wrap.add(shell);
  wrap.add(mesh);
  g.add(wrap);
  g.userData.sprite = true;
  g.userData.spriteSlug = spriteSlug;
  g.userData.spriteBillboardMesh = mesh; // updateSpriteBillboardYaw's per-frame Y-facing target
  g.userData.standeeWrap = wrap;
  g.userData.standeeSideShell = shell;
  g.userData.footX = footX;
  g.userData.footY = footY;
  g.userData.alphaCutoff = alphaCutoff;
  g.userData.contentBounds = entry.contentBounds || null;
  return g;
}

function buildSpriteBillboard(entry){
  const tex = spriteTextureFor(entry); // S5: resolves through entry's own admission fields, not just the slug
  if(!tex) return null; // not loaded yet / failed load -> caller falls through, never rejects
  // entry.scale = the per-slug heads-line-up calibration from the sprite-review overlay
  // (dev/sprite-review.py -> sprite-tags-overlay.json -> gen-sprite-registry.py) — crops vary
  // in headroom/tightness, so the size ladder alone can't make same-size creatures read the
  // same height.
  const calib = (typeof entry.scale === "number" && entry.scale > 0) ? entry.scale : 1;
  // DUNGEON-GRAPH.md law 1 (TRUE-SCALE RENDER LAW): scaleVsHuman (feet/5.5, the real progression-payoff
  // ratio) wins over the SRD size-CATEGORY ladder (spriteSizeScaleFor) whenever it's present — on either
  // the registry entry itself (once data/sprite-registry.js's corpus-sizing fold lands, HANDOFF item 2)
  // or passed straight through on the board piece data (`entry.scaleVsHuman`, a caller-supplied override
  // — no registry edit required to exercise true scale today). Absent on both -> the old compressed
  // SRD-category ladder, byte-identical to before this law (the "legacy fallback view only" clause).
  // NOTE (BEAUTY-WAVE.md VP1 OUT OF SCOPE): this is the TABLETOP convention, deliberately untouched —
  // interior pieces route through interiorSpriteBillboard below, its own TRUE-SCALE sizing.
  const sizeMultiplier = (typeof entry.scaleVsHuman === "number" && entry.scaleVsHuman > 0)
    ? entry.scaleVsHuman
    : spriteSizeScaleFor(entry.size);
  const h = sizeMultiplier * GLB_TARGET_HEIGHT * calib;
  return buildSpriteBillboardMesh(tex, h, h, entry); // square plane; the sprite's own alpha silhouette reads the real shape
}

// BEAUTY-WAVE.md VP1 (the kaiju-scale-bug fix): interior pieces are TRUE-SCALE (cellSize: 1 world
// unit = 5ft, DUNGEON-GRAPH.md law 1), NOT the tabletop's render-height-multiplier convention above
// — a medium creature must stand ~1.1 world units tall in a room, not several. Height comes from
// entry.worldHeight (the authoritative feet value) or a caller-supplied scaleVsHuman override,
// falling back to the registry's legacy rounded scaleTrue and then 1.0 when neither is present.
// Reading worldHeight directly avoids turning a 0.25-ft rat into 0.275 ft through scaleTrue's
// intentionally compact two-decimal generated representation. Width is derived from the loaded
// texture's own pixel aspect ratio (a sprite crop is rarely square) rather than the tabletop's
// baked square plane. Returns {group, height} so interiorBuildPieces can floor-offset + wall-clamp
// without re-deriving the height.
function interiorSpriteBillboard(entry, wallHeightCap){
  const tex = spriteTextureFor(entry); // S5: resolves through entry's own admission fields, not just the slug
  if(!tex) return null; // not loaded yet / failed load -> caller falls through, never rejects
  // A caller-supplied scaleVsHuman is an explicit presentation override (the CL-R2 preferred cap
  // uses it without mutating authored worldHeight), so it wins over the registry's canonical value.
  const scaleTrue = (typeof entry.scaleVsHuman === "number" && entry.scaleVsHuman > 0)
    ? entry.scaleVsHuman
    : (typeof entry.worldHeight === "number" && entry.worldHeight > 0)
      ? entry.worldHeight / 5.5
      : (typeof entry.scaleTrue === "number" && entry.scaleTrue > 0)
        ? entry.scaleTrue
        : 1.0;
  let h = HUMAN_TRUE_HEIGHT * scaleTrue;
  let oversizeClamped = false;
  // Cap render height at the room's wall height * 0.95 (a titanic in a human room is a SCALE-DOMAIN
  // problem — DUNGEON-GRAPH.md's scale-domain law — not something this renderer should paper over by
  // clipping through the ceiling).
  if(typeof wallHeightCap === "number" && wallHeightCap > 0 && h > wallHeightCap){
    h = wallHeightCap;
    oversizeClamped = true;
  }
  const img = tex.image;
  const aspect = (img && img.width && img.height) ? (img.width / img.height) : 1;
  const w = h * aspect;
  const g = buildSpriteBillboardMesh(tex, w, h, entry);
  if(oversizeClamped){
    console.warn("qa: oversize-clamped", entry.slug, "-> capped at wall height", wallHeightCap);
  }
  return {
    group: g,
    height: h,
    width: w,
    canonicalHeight: HUMAN_TRUE_HEIGHT * scaleTrue,
    oversizeClamped: oversizeClamped
  };
}

// ---- split B7 chunk boundary: everything between interiorSpriteBillboard and this facing pass —
// figure resolution, the base-disc/grounding-blob family, the standee mount + contact family
// (src/ui/theater-standee-mount.js), doors, kit shells, the overlay family
// (src/ui/theater-overlays.js) and the root's own render/dirty-frame plumbing — is not sprite-owned.
// updateSpriteBillboardYaw follows its family here; its three call sites stay in the root. ----

// SPRITE-TRANSITION T4.2: Y-axis-only billboarding — every sprite group (tagged userData.sprite by
// buildSpriteBillboard) turns to face the camera's current yaw step each render pass, rotating the
// GROUP about Y only (rotation.x/z stay 0 — "sprites stay upright" per the spec) rather than a true
// look-at (which would also tip the plane's top toward/away from the camera at this game's fixed
// elevation, reading as a leaning card instead of an upright PS1/Doom sprite). The camera only ever
// sits at one of placeCamera's 4 discrete 90°-step yaws (+ the fixed CAM_YAW_OFFSET_DEG dimetric
// offset), so recomputing this on every dirty render (cheap — a handful of live sprite units at most)
// is simpler and just as correct as hooking rotate()/placeCamera() separately. A plane is authored
// facing +Z (buildSpriteBillboard's own PlaneGeometry default); +PI turns that face to point back at
// the camera position (which sits at angle `yaw` from the board origin, looking inward).
function updateSpriteBillboardYaw(){
  updateSpriteCameraFill();
  const yaw = (S.rotationStep * 90 * Math.PI) / 180 + (CAM_YAW_OFFSET_DEG * Math.PI) / 180;
  const facing = yaw + Math.PI;
  // Camera-pitch tilt (Adam 2026-07-10 evening): an upright quad under the elevated ortho camera
  // foreshortens vertically by cos(elevation) — reads as a SQUASHED sprite. Tilting each standee
  // back by the camera elevation makes the quad camera-perpendicular: full sprite height on
  // screen, no distortion, feet still anchored at the group origin. rotation order YXZ so the
  // pitch rides the yaw.
  const tilt = (CAM_ELEV_DEG * Math.PI) / 180; // top leans AWAY from the camera (standee), not into the floor
  // BW2-2b item 1 (FLOOR-ALIGNED BASES): camera-pitch tilt now lands on the standee's INNER wrapper
  // (g.userData.standeeWrap, built eagerly by buildSpriteBillboardMesh above — holds ONLY the sprite
  // mesh) instead of the OUTER group `fig` itself. `fig.rotation.x` is deliberately left untouched
  // here — a plinth base/acting ring mounted as a direct SIBLING child of `fig` (never of the wrap)
  // then stays floor-flat under `fig`'s own yaw-only rotation, and `fig.rotation.x` is FREE for
  // standee-verbs.js's verb-tilt (fall-death) to tip the whole mini — base included — as one rigid
  // body (see that file's runKeyframeVerb). A group whose wrap is missing (defensive — every real
  // sprite built via buildSpriteBillboardMesh has one) falls back to the pre-BW2-2b behavior on the
  // OUTER group so nothing silently stops tilting.
  // BW2-2b item 4 (THE KILTER): a per-standee seeded yaw jitter (kilterFor, below) rides on TOP of the
  // camera-relative facing yaw, applied to the OUTER group (fig) — so the WHOLE mini (base+sprite)
  // reads as sitting a hair off-true on its tile, exactly like a hand-placed physical miniature, per
  // Adam's mock read (ui-sketches/mock-frames/mock-01-gloom-combat.png: the ghost's base sits
  // perceptibly off-kilter next to the knight's square one).
  function face(fig){
    fig.rotation.order = "YXZ";
    const kilterRad = ((fig.userData.kilterYawDeg || 0) * Math.PI) / 180;
    const viewOffset = Number.isFinite(fig.userData.claySpriteViewYawOffset)
      ? fig.userData.claySpriteViewYawOffset : 0;
    fig.rotation.y = facing + kilterRad + viewOffset;
    // CL-R3 stair parking: the billboard may continue facing the camera while its physical plinth
    // holds a stable world yaw across a narrow tread. Counter-rotate only the base child inside the
    // billboard group; collision/contact math reads the same world yaw from claySupportWorldYaw.
    if(Number.isFinite(fig.userData.claySupportWorldYaw) && fig.children){
      for(let i = 0; i < fig.children.length; i++){
        const child = fig.children[i];
        if(child && child.userData && child.userData.standeeBase){
          child.rotation.order = "YXZ";
          child.rotation.y = fig.userData.claySupportWorldYaw - fig.rotation.y;
        }
      }
    }
    const wrap = fig.userData.standeeWrap;
    if(wrap){
      wrap.rotation.order = "YXZ";
      wrap.rotation.x = tilt;
    } else {
      fig.rotation.x = tilt;
    }
  }
  if(S.unitGroup){
    for(let i = 0; i < S.unitGroup.children.length; i++){
      const fig = S.unitGroup.children[i];
      if(fig && fig.userData && fig.userData.sprite) face(fig);
    }
  }
  // ENV-2 (docs/ENV-EXTERIOR-WAVE.md) — the flat tabletop's own board.props (setBoard, above) can now
  // carry biome-scatter dressing CARDS (buildDressingCard — same userData.sprite tag every other
  // billboard group in this file already carries), mounted into S.propGroup. This group was NEVER
  // scanned here before this unit (no prop ever carried userData.sprite) — a pure additive no-op for
  // every existing board/prop; only ENV-2's own new dressing cards are affected.
  if(S.propGroup){
    for(let i = 0; i < S.propGroup.children.length; i++){
      const fig = S.propGroup.children[i];
      if(fig && fig.userData && fig.userData.sprite) face(fig);
    }
  }
  // DUNGEON-GRAPH.md U3 iteration-2, ruling 3: interior "pieces" (creature/PC sprites standing in the
  // room) are billboard groups too (interiorBuildPieces -> buildSpriteBillboard, same userData.sprite
  // tag), but they live in S.interiorGroup's own pieces sub-group, not S.unitGroup — walk the group
  // tree one level deep (interiorGroup -> {tile/wall/light/pieces sub-groups} -> sprite groups) rather
  // than a flat scan, so this stays cheap even on an 80-room whole-plan interior render.
  if(S.interiorGroup){
    for(let i = 0; i < S.interiorGroup.children.length; i++){
      const sub = S.interiorGroup.children[i];
      if(!sub || !sub.children) continue;
      for(let j = 0; j < sub.children.length; j++){
        const fig = sub.children[j];
        if(fig && fig.userData && fig.userData.sprite) face(fig);
      }
    }
  }
  if(S.standeeCollisionDirty) resolveMountedStandeeSupportCollisions();
  mountedStandeeFigures().forEach(syncStandeeContactBlob);
}

export {
  SPRITE_TEXTURE_CACHE, SPRITE_TEXTURE_SRC,
  SPRITE_SIZE_SCALE, spriteSizeScaleFor,
  spriteSrgbTaggingOn, spriteTextureFor,
  SPRITE_DEPTH_BIAS_MATERIALS,
  STANDEE_SIDE_SHELL_THICKNESS, standeeSideShellMaterials,
  buildSpriteBillboardMesh, buildSpriteBillboard, interiorSpriteBillboard,
  updateSpriteBillboardYaw
};
