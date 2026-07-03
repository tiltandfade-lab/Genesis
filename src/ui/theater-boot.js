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
                    (fallback composed-cuboids, VS-proportioned, 1.5x scale) + their blob shadows.
     setTextures(manifest) -> void. `manifest` is a flat {"stone":path, ...} semantic-key map (T1.5
                    item 4). Loads each path via THREE.TextureLoader with NearestFilter/no mipmaps and
                    caches it; the next setBoard/setUnits call tints matched tile kinds by texture
                    instead of flat color. Safe to call before or after mount(); safe to call with an
                    absent/empty manifest (no-op, palette-only stays the baseline).
     rotate()    -> void. Steps the camera 90° around the board's vertical axis (BATTLE-THEATER §1
                    rule 4: "rotatable in 90° steps only"), preserving the 80%-fill fit.
     retire()    -> void. Disposes geometries/materials/renderer + detaches the canvas. Safe to call
                    on an unmounted instance (no-op).
   }

   Every method is null-safe pre-mount (calling setBoard/setUnits/rotate before a successful mount()
   is a no-op, not a throw) so a caller can wire these up before the mount gate resolves. */
import * as THREE from "three";

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
const CAM_FIT_MARGIN = 0.90;   // §3: "fill ~80%" — a hair of slack (0.90 factor on top of the fit calc
                                // below already targets 80% coverage; see fitCameraToBoard's comment)
const TILE_SIZE = 1;          // world units per abstract tile (theater-data's x/z are already tile-indexed)
const TILE_GAP = 0.04;        // thin void seam between tile columns (reads as grid without a wireframe)
const SHADOW_OPACITY = 0.35;
const FIGURE_SCALE = 1.5;      // §3 G9 tune: "figure scale ~1.5x current relative to tiles"

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
  swarm: buildSwarm
};

/* ============================================================================
   Fallback composed-cuboid figures (BATTLE-THEATER §3: "3-8 boxes each"), T1.5 G9 tune: VS-leaning
   proportions — angular, longer limbs, broader shoulders, a weapon-slab for bipeds, silhouettes that
   read apart from each other even at a 100px-tall render (§3's explicit test). Deterministic — every
   builder is a pure function of a seed number (from theaterWithinZoneOffset's hash, so a given unit
   id always composes the same figure), no Math.random. Colors are flat per-kind tints (pc/ally/foe
   distinguished by the caller via a group-level material tint, not baked into the geometry here) —
   T1.5 setUnits also applies a texture material when one is loaded for the "prop"-adjacent unit tint
   key, but the geometry/proportions below are untouched by that (textures ride on top of shape).
   ============================================================================ */
function seededJitter(seed, i, spread){
  // tiny deterministic pseudo-jitter so repeated boxes in one figure don't look copy-pasted identical;
  // NOT a security/statistical RNG, just a cheap hash -> [-spread, spread] mapper.
  const h = Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453);
  return ((h - Math.floor(h)) * 2 - 1) * spread;
}

function addBox(group, w, h, d, x, y, z, color, rotY){
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ color }));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  if(rotY) mesh.rotation.y = rotY;
  group.add(mesh);
  return mesh;
}

/* biped: VS-leaning — narrower waist, BROADER shoulder bar, longer angled limbs than T1's stocky
   read, a canted weapon-slab off the right hand (the "clearly a fighter silhouette" signal FFT/VS
   both lean on). 8 boxes: torso, shoulder bar, head, 2 legs, 2 arms, weapon-slab. */
function buildBiped(seed, tint){
  const g = new THREE.Group();
  addBox(g, 0.26, 0.56, 0.2, 0, 0.66, 0, tint);                    // torso — narrower, taller than T1
  addBox(g, 0.5, 0.1, 0.2, 0, 0.98, 0, tint);                      // shoulder bar — broad, reads instantly
  addBox(g, 0.2, 0.22, 0.2, 0, 1.2, 0, tint);                      // head, raised for the longer torso
  addBox(g, 0.1, 0.56, 0.1, -0.12, 0.28, 0, tint);                 // left leg — longer than T1 (0.46->0.56)
  addBox(g, 0.1, 0.56, 0.1, 0.12, 0.28, 0, tint);                  // right leg
  addBox(g, 0.09, 0.44, 0.09, -0.29, 0.62, 0, tint, 0.12);         // left arm — angled outward, longer
  addBox(g, 0.09, 0.44, 0.09, 0.29, 0.62, 0, tint, -0.12);         // right arm — angled outward
  addBox(g, 0.06, 0.6, 0.06, 0.4, 0.5, 0.05, tint, -0.35);         // weapon-slab — canted off the right hand
  return g;                                                         // 8 boxes
}

/* quadruped: low, long-bodied, angular haunches (raised rear pair reads "predator crouch" vs T1's
   flat table-stance) — a silhouette a biped can never be mistaken for even squashed to 100px. */
function buildQuadruped(seed, tint){
  const g = new THREE.Group();
  addBox(g, 0.82, 0.26, 0.3, 0, 0.42, 0, tint, 0.0);               // body — longer, lower than T1
  addBox(g, 0.2, 0.22, 0.22, 0.48, 0.5, 0, tint);                  // head, forward and low (predator reach)
  addBox(g, 0.14, 0.12, 0.14, 0.58, 0.56, 0, tint);                // snout stub — extra angular detail
  addBox(g, 0.09, 0.3, 0.09, -0.3, 0.16, -0.12, tint);             // front-left leg
  addBox(g, 0.09, 0.3, 0.09, -0.3, 0.16, 0.12, tint);              // front-right leg
  addBox(g, 0.1, 0.38, 0.1, 0.26, 0.2, -0.13, tint, 0.15);         // rear-left leg — taller, angled (haunch)
  addBox(g, 0.1, 0.38, 0.1, 0.26, 0.2, 0.13, tint, -0.15);         // rear-right leg — taller, angled
  return g;                                                         // 7 boxes
}

/* flyer: slim vertical body, sharply swept-back angular wings (vs T1's flat horizontal slabs) + a
   forked tail — a silhouette that reads "airborne" from the wing angle alone, not just position. */
function buildFlyer(seed, tint){
  const g = new THREE.Group();
  addBox(g, 0.22, 0.4, 0.22, 0, 0.72, 0, tint);                    // body — slim, vertical (not squat)
  addBox(g, 0.16, 0.16, 0.2, 0, 1.02, 0.1, tint);                  // head, forward-tilted
  addBox(g, 0.56, 0.05, 0.24, -0.42, 0.82, -0.08, tint, 0.3);      // left wing — swept back at an angle
  addBox(g, 0.56, 0.05, 0.24, 0.42, 0.82, -0.08, tint, -0.3);      // right wing — swept back at an angle
  addBox(g, 0.07, 0.28, 0.07, -0.06, 0.38, -0.3, tint, 0.2);       // tail fork left
  addBox(g, 0.07, 0.28, 0.07, 0.06, 0.38, -0.3, tint, -0.2);       // tail fork right
  return g;                                                         // 6 boxes
}

function buildSerpent(seed, tint){
  const g = new THREE.Group();
  const segs = 6;
  for(let i = 0; i < segs; i++){
    const t = i / (segs - 1);
    const w = 0.26 - t * 0.14;
    addBox(g, w, w, 0.3, 0, 0.14 + w / 2, -0.75 + i * 0.3 + seededJitter(seed, i, 0.02), tint);
  }
  return g;                                                     // 6 boxes
}

function buildSwarm(seed, tint){
  const g = new THREE.Group();
  const n = 8;
  for(let i = 0; i < n; i++){
    const ang = (i / n) * Math.PI * 2;
    const r = 0.28 + seededJitter(seed, i, 0.06);
    const x = Math.cos(ang) * r, z = Math.sin(ang) * r;
    const s = 0.09 + Math.abs(seededJitter(seed, i + 50, 0.03));
    addBox(g, s, s, s, x, 0.16 + Math.abs(seededJitter(seed, i + 100, 0.1)), z, tint);
  }
  return g;                                                     // 8 boxes
}

function figureFor(archetype, seed, tint){
  const build = ARCHETYPE_BUILDERS[archetype] || ARCHETYPE_BUILDERS.biped;
  return build(seed, tint);
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
    boardHalfExtent: 5, boardCenter: null, boardOrigin: null,
    env: null,           // last board's env key — drives void/fog color
    textures: {},         // semantic key -> loaded+cached THREE.Texture (setTextures)
    psxEnabled: true      // T1.5 preview-only toggle (dev/theater-preview.html's "PSX/clean" button);
                           // the shipped default is always PSX ON — this only exists so the visual
                           // gate can A/B the grit pass against the T1 clean baseline in one click.
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
        small and pushed toward one side rather than centered and filling the frame. */
function placeCamera(){
  if(!S.camera) return;
  const rad = (CAM_ELEV_DEG * Math.PI) / 180;
  const yaw = (S.rotationStep * 90 * Math.PI) / 180;

  const half = Math.max(2, S.boardHalfExtent || 5);
  // aspect must be known BEFORE viewSize is picked, so the fit can be checked against both canvas
  // dimensions at once (fix #2) — target: the board's half-extent (both x and z, since the footprint
  // is fit isometrically) fills CAM_FIT_MARGIN (0.90 -> ~80% after typical void/margin framing) of
  // whichever canvas dimension is more constraining.
  const w = S.el ? (S.el.clientWidth || 480) : 480;
  const h = S.el ? (S.el.clientHeight || Math.round(w * (9 / 16))) : Math.round(480 * (9 / 16));
  const aspect = w / Math.max(1, h);
  // viewSize is the camera's half-HEIGHT. To fill the frame on the height axis: viewSize = half / margin.
  // To fill the frame on the width axis: viewSize * aspect = half / margin  =>  viewSize = half / (margin * aspect).
  // Taking the SMALLER of the two viewSize candidates is what actually fills the more constraining
  // dimension without overflowing the other (fix #1 removes the stray 1.15 overshoot entirely).
  const viewSizeForHeight = half / CAM_FIT_MARGIN;
  const viewSizeForWidth = half / (CAM_FIT_MARGIN * Math.max(aspect, 0.0001));
  const viewSize = Math.min(viewSizeForHeight, viewSizeForWidth);
  S.viewSize = viewSize;

  // camera distance scales with viewSize so a big board doesn't clip through a fixed-distance camera
  // (T1 used a flat CAM_DIST=26; T1.5 makes it board-relative so the fit holds for any room size).
  const camDist = viewSize * 2.6;
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

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(4, 10, 6);
  scene.add(ambient, key);

  const tileGroup = new THREE.Group();
  const propGroup = new THREE.Group();
  const unitGroup = new THREE.Group();
  const shadowGroup = new THREE.Group();
  scene.add(tileGroup, propGroup, shadowGroup, unitGroup);

  S.mounted = true;
  S.el = el;
  S.renderer = renderer;
  S.scene = scene;
  S.camera = camera;
  S.tileGroup = tileGroup;
  S.propGroup = propGroup;
  S.unitGroup = unitGroup;
  S.shadowGroup = shadowGroup;
  S.rotationStep = 0;
  S.boardCenter = new THREE.Vector3(0, 0, 0);
  S.env = THEATER_DEFAULT_ENV_FALLBACK;

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
  S.boardHalfExtent = Math.max((maxX - minX) / 2, (maxZ - minZ) / 2) + 1;

  // T1.5 §1/§2: env threading — theaterBoardFrom (theater-data.js) stamps `env` on its return; this
  // is the ONLY place the GL layer learns which palette-driven void/fog tint to show (the tile tints
  // are already baked into `t.tint` by theater-data.js, so setBoard never re-derives palette colors
  // itself — it only reads the env label to pick the void/fog background, which theater-data.js has
  // no GL concept of).
  const env = data.env || THEATER_DEFAULT_ENV_FALLBACK;
  S.env = env;
  const voidTint = voidTintFor(env);
  if(S.scene){
    S.scene.background = new THREE.Color(voidTint);
    if(S.scene.fog) S.scene.fog.color = new THREE.Color(voidTint);
  }
  if(S.renderer) S.renderer.setClearColor(voidTint, 1);

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
    const geo = new THREE.BoxGeometry(0.5, 0.9, 0.5);
    const propTex = S.textures.prop;
    const mat = applyPsxShaderTweaks((propTex && propTex !== "pending")
      ? new THREE.MeshLambertMaterial({ map: propTex, color: 0x6b5638 })
      : new THREE.MeshLambertMaterial({ color: 0x6b5638 }));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x - cx, 0.45, p.z - cz);
    S.propGroup.add(mesh);
  });

  placeCamera();
  markDirty();
}

function setUnits(data){
  if(!S.mounted || !data) return;
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);

  const cx = (S.boardOrigin && S.boardOrigin.cx) || 0;
  const cz = (S.boardOrigin && S.boardOrigin.cz) || 0;
  // shadow radius scales with FIGURE_SCALE too, so a bigger figure still sits on a proportionate blob.
  const shadowGeo = new THREE.CircleGeometry(0.3 * FIGURE_SCALE, 12);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: SHADOW_OPACITY, depthWrite: false
  });

  (data.units || []).forEach(u => {
    const seed = hashSeed(u.id);
    const tint = unitTint(u.kind);
    const figure = figureFor(u.archetype, seed, tint);
    const x = u.x - cx, z = u.z - cz;
    figure.position.set(x, 0, z);
    figure.scale.setScalar(FIGURE_SCALE); // §3 G9 tune: "figure scale ~1.5x current relative to tiles"
    if(u.down){
      figure.rotation.z = Math.PI / 2;
      figure.position.y += 0.12 * FIGURE_SCALE;
    }
    if(u.fled) figure.visible = false;
    S.unitGroup.add(figure);

    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, -0.49, z);
    if(u.fled) shadow.visible = false;
    S.shadowGroup.add(shadow);
  });

  markDirty();
}

function rotate(){
  if(!S.mounted) return;
  S.rotationStep = (S.rotationStep + 1) % 4;
  placeCamera();
  markDirty();
}

function retire(){
  if(S.resizeHandler) window.removeEventListener("resize", S.resizeHandler);
  if(S.raf) cancelAnimationFrame(S.raf);
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);
  if(S.renderer){
    S.renderer.dispose();
    if(S.renderer.domElement && S.renderer.domElement.parentNode){
      S.renderer.domElement.parentNode.removeChild(S.renderer.domElement);
    }
  }
  S = createTheaterState();
}

window.Theater = { mount, setBoard, setUnits, setTextures, rotate, retire };
