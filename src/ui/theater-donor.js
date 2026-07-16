/* GENESIS MODULE — src/ui/theater-donor.js — KS-1 (docs/KENNEY-SOCKET-WAVE.md) the Kenney donor
   RUNTIME loader. Sister file to build/normalize-donors.py (that script's own header carries the
   full P-B recipe quote + the build/runtime split rationale — read it first). This is the "one
   adapter at the GLTF boundary" Sol's recipe asks for, and it is the ONLY runtime file this KS-1
   unit touches — per its own spec: "keep ALL runtime touches inside this new module + manifest —
   do NOT edit theater-boot.js, theater-materials.js, or gen-sprite-registry.py — other concurrent
   units own them." Registered in manifest.json (id ui.theater-donor, type:"module", its own
   `<script type="module">` tag in genesis.html, loaded after theater-boot.js's tag per the
   established "other theater-* ES-module files" convention — see genesis.html).

   ES-MODULE BOUNDARY (why this file cannot literally call theater-boot.js's gradeColorLocal /
   interiorMaterialTexture): both are internal to theater-boot.js's sealed ES-module scope with NO
   export and NO `window` republish (checked: `grep window\.gradeColorLocal|window\.
   interiorMaterialTexture src/ui/theater-boot.js` — zero hits, unlike theater-materials.js's own
   `window.materialTexturePixels`/`window.materialFamilyFor`, which ARE republished and this file
   DOES reuse below). Editing theater-boot.js to export them is out of this unit's lane. This file
   therefore carries its own LOCAL MIRROR of gradeColorLocal's grade math — not a fresh invention:
   theater-boot.js's OWN header for that function already documents this exact mirror pattern as
   precedented in this codebase ("gradeColorLocal — the GL-side mirror of data/realms.js's
   gradeColor: identical saturation -> tint -> contrast math, byte-identical output for the
   identical (hex, profile) input", src/ui/theater-boot.js:5569). donorGradeColor below is the
   SAME mirror one level further out: identical formula, verified byte-identical against
   theater-boot.js's own gradeColorLocal source (read at src/ui/theater-boot.js:5574-5601) for the
   same (hex, profile) input. It is NOT wired to any live GS/S singleton — this module takes an
   explicit `profile` parameter on every call (a clean adapter boundary: donor pieces are not yet
   wired into the live interior scene at all this wave — KS-2/KS-3 do that — so there is no "the
   current realm profile" for this module to reach into even if theater-boot.js's S were reachable).
   A null/absent profile is a byte-identical passthrough, matching every other "null profile is a
   no-op" convention already established at every gradeColorLocal call site in theater-boot.js.

   The pixel-buffer GRAIN painter itself (interiorMaterialTexture's ACTUAL texture math) is NOT
   re-derived here — it is REUSED via `window.materialTexturePixels`, theater-materials.js's own
   already-exported pure pixel painter (window.materialTexturePixels = materialTexturePixels,
   src/ui/theater-materials.js:214). Only the canvas-wrapping (putImageData -> THREE.CanvasTexture
   -> nearestify) is duplicated locally — that's ~10 lines of standard THREE boilerplate identical
   in shape to interiorMaterialTexture's own (src/ui/theater-boot.js:7266-7281), not a "law" that
   needs quoting, just a mechanical GL-upload step every texture consumer in this codebase repeats.
   materialFamilyFor's KNOWN families (stone-course/slab/moss-stone -> stone, plank -> plank,
   metal-panel -> metal — src/ui/theater-materials.js:43-48) are deliberately targeted below (never
   an unmapped string) so this module NEVER triggers theater-materials.js's own mottle-fallback
   census path — the KS-1 gate's "zero mottle-fallback material families on admitted pieces"
   requirement, satisfied by construction: donorPaintKeyForFamily's table below only emits
   "stone-course"/"plank"/"metal-panel", every one of which IS a MATERIAL_FAMILY key.

   OUTLINE LAW — quoted verbatim (docs/KENNEY-SOCKET-WAVE.md's KS-1 text points at ART-DIRECTION-
   CANON.md for this; that file (read in full before writing this module) does not actually
   contain outline language — grepped "outline" against docs/ART-DIRECTION-CANON.md: zero hits.
   The real source is docs/BEAUTY-WAVE.md's own "OUTLINE LAW (ruling #5 — per-realm...)" section,
   quoted here faithfully rather than fabricated under the wrong citation):
     "One outline treatment per realm, no mixing. Flagship defaults (Adam may red-pen): fantasy =
     selective dark-umber outline (outer silhouette only) · gloom = full 1px near-black outline
     (the VHS-horror cel look) · chrome = NO line; neon rim-edge carries the silhouette."
   That law was written for 2D sprite art (an "edge-detect + darken" post-process, "1px" is a
   pixel-space unit). This module is the FIRST place it needs a 3D-geometry adaptation, since donor
   architecture is real GLTF geometry, not a sprite card. donorOutlineFor implements a standard
   inverted-hull outline (a backface-culled, slightly-expanded duplicate shell in a solid color) —
   "full" (gloom) gets a normal-width hull in near-black; "selective" (fantasy) gets a thinner
   hull in dark-umber (the closest honest 3D analog of "outer silhouette only, not every internal
   edge" this technique affords); "none" (chrome) adds no hull at all. KGR-2 RETIREMENT: gameplay
   captures proved that geometry approach unsafe (coplanar stipple/moire and polygon intersection),
   so the inverted-hull geometry implementation is retired. The per-realm table remains below as
   dormant policy metadata for a future screen-space/shader outline unit; loading a donor never adds
   duplicate hull geometry.

   KGR-3 SOCKET SCHEMA: normalized v2 output carries identified attachment frames
   (floor-mount, wall-mount, top-surface, hinge), each with position + quaternion in the identity
   donor-root frame. Structural placement is canonical cell + orientationIndex 0..3; v2 emits no
   butt-join sockets. The source-to-Genesis TRS lives exactly once on the
   `genesis-source-transform` child. THREE.js's GLTFLoader copies a glTF node's `extras` onto the parsed Object3D's
   own `.userData` (documented three.js GLTFLoader behavior — this is how "socket metadata rides
   userData (classic-script friendly)" from the KS-1 spec is actually realized at runtime: no
   custom parsing needed, GLTFLoader does it for free). loadDonorPiece below walks the loaded scene
   and republishes every node's `userData.genesisDonor.sockets` onto ONE flat array on the
   returned group's own userData.sockets, so a caller never needs to traverse the hierarchy itself.
*/
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { socketFrameOf } from "./theater-attachment.js";

// ─── index fetch + cache ────────────────────────────────────────────────────────────────────────
const DONOR_INDEX_CACHE = {}; // pack -> Promise<index object> (assets/models-normalized/<pack>/index.json)
const DONOR_GLTF_CACHE = {};  // "pack/slug" -> Promise<THREE.Group> (the RAW loaded+dressed template; callers get a .clone())
let _donorGltfLoader = null;

function donorLoader() {
  if (!_donorGltfLoader) _donorGltfLoader = new GLTFLoader();
  return _donorGltfLoader;
}

function donorIndexUrl(pack) {
  return new URL(`../../assets/models-normalized/${pack}/index.json`, import.meta.url).href;
}
function donorGlbUrl(pack, file) {
  return new URL(`../../assets/models-normalized/${pack}/${file}`, import.meta.url).href;
}

// donorIndexFor(pack) -> Promise<index> — fetches the raw index envelope. KGR-3 output is
// genesis.donor-index.v2 with entries under `assets`; donorEntriesForRead below also accepts the
// old flat v1 object for graceful output compatibility. Fetched once per pack (the index is a build
// artifact; a changed pack means a re-run of the normalizer, which is a fresh page load in
// practice — no live invalidation needed this wave).
export function donorIndexFor(pack) {
  if (!DONOR_INDEX_CACHE[pack]) {
    DONOR_INDEX_CACHE[pack] = fetch(donorIndexUrl(pack))
      .then((r) => { if (!r.ok) throw new Error(`donor index ${pack}: HTTP ${r.status}`); return r.json(); });
  }
  return DONOR_INDEX_CACHE[pack];
}

// Runtime loads remain backward compatible with committed v1 flat indexes. New registry
// generation is deliberately stricter: only the calibrated v2 envelope may mint registry data.
// This keeps an old output renderable while preventing it from silently becoming new authority.
export function donorEntriesForRead(index) {
  if (index && index.schema === "genesis.donor-index.v2") return index.assets || {};
  return index || {};
}

const DONOR_QA_STATUSES = new Set([
  "needs-review", "approved-dev", "approved-runtime", "quarantined",
]);

export function donorRegistryFromIndex(index) {
  if (!index || index.schema !== "genesis.donor-index.v2" || !index.assets) {
    throw new Error("donorRegistryFromIndex: genesis.donor-index.v2 required");
  }
  const registry = {};
  for (const [slug, entry] of Object.entries(index.assets)) {
    if (!entry || entry.schema !== "genesis.donor.v2" ||
        entry.assetId !== `${index.pack}/${slug}` ||
        !/^[0-9a-f]{64}$/.test(entry.sourceSha256 || "") ||
        !/^[0-9a-f]{64}$/.test(entry.recipeHash || "") ||
        !DONOR_QA_STATUSES.has(entry.qaStatus)) {
      throw new Error(`donorRegistryFromIndex: invalid v2 entry ${slug}`);
    }
    if (entry.qaStatus !== "approved-runtime") continue;
    registry[entry.assetId] = entry;
  }
  return registry;
}

// ─── material recipe (Sol P-B, quoted in build/normalize-donors.py's own header) ─────────────────
// roughness ALWAYS 0.82-0.94 regardless of family; ONLY metalness varies (0, except iron 0.35).
// Kept identical to build/normalize-donors.py's own MATERIAL_RECIPE table (that file is the
// single source Adam reviews; this module cannot `import` a .py file, so the same numbers are
// inlined here — both copies are small enough to eyeball-diff in review, and
// dev/verify-kenney-adapter.mjs cross-checks them are not silently drifting).
const MATERIAL_RECIPE = Object.freeze({
  stone: { roughness: 0.90, metalness: 0.0 },
  wood: { roughness: 0.85, metalness: 0.0 },
  iron: { roughness: 0.88, metalness: 0.35 },
  roof: { roughness: 0.88, metalness: 0.0 },
  glass: { roughness: 0.30, metalness: 0.0 },
  cloth: { roughness: 0.92, metalness: 0.0 },
});

// a five-band base albedo per family (the "five-band albedo" the recipe calls for — a small fixed
// value ladder per family, graded through donorGradeColor below when a realm profile is supplied).
// Bands run dark->light; donorMaterialFamilyColor picks a band deterministically off a seed string
// so the SAME (family, seedKey) always paints the SAME band (no per-frame flicker).
const FAMILY_ALBEDO_BANDS = Object.freeze({
  stone: [0x4a4842, 0x5c5951, 0x716d63, 0x86816f, 0x9c9482],
  wood: [0x3c2a1c, 0x54392a, 0x6e4c33, 0x87613f, 0xa1794f],
  iron: [0x2b2b2e, 0x3a3a3f, 0x4c4c52, 0x5f5f66, 0x76767d],
  roof: [0x3a2f28, 0x4c3e33, 0x604f40, 0x77634f, 0x8f7a63],
  glass: [0x5f7a7d, 0x6f8b8e, 0x82a0a3, 0x9bb8ba, 0xb6d3d4],
  cloth: [0x4a3f4e, 0x5c4f61, 0x716374, 0x877689, 0x9c8c9e],
});

// tiny deterministic string hash (mulberry-32 seeding pattern already used elsewhere in this repo,
// e.g. src/engine/place-spatialize.js's dspHashStr — this module intentionally stays dependency-
// free of that classic-global rather than reaching across the lane boundary for a one-line hash).
function donorHashStr(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function donorAlbedoBandColor(family, seedKey) {
  const bands = FAMILY_ALBEDO_BANDS[family] || FAMILY_ALBEDO_BANDS.stone;
  const idx = donorHashStr(family + ":" + seedKey) % bands.length;
  return bands[idx];
}

// ─── donorGradeColor — the documented mirror of theater-boot.js's gradeColorLocal (see this
// file's own header for the full precedent/rationale). `profile` shape matches gradeColorLocal's
// own: {sat, tintAmt, tint, contrast} — a null/absent profile is a byte-identical passthrough. ──
function donorHexToRGB(hex) {
  return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 };
}
function donorClamp255(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
function donorLumaOf(rgb) { return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255; }
function donorRgbToHex(r, g, b) { return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b); }

export function donorGradeColor(hex, profile) {
  if (!profile) return hex;
  const p = profile;
  const rgb = donorHexToRGB(hex);
  const sat = (typeof p.sat === "number" && isFinite(p.sat)) ? p.sat : 1;
  const tintAmt = (typeof p.tintAmt === "number" && isFinite(p.tintAmt)) ? p.tintAmt : 0;
  const contrast = (typeof p.contrast === "number" && isFinite(p.contrast)) ? p.contrast : 1;

  const grey = donorLumaOf(rgb) * 255;
  let r = grey + (rgb.r - grey) * sat;
  let g = grey + (rgb.g - grey) * sat;
  let b = grey + (rgb.b - grey) * sat;
  r = donorClamp255(r); g = donorClamp255(g); b = donorClamp255(b);

  if (tintAmt > 0) {
    const t = donorHexToRGB(p.tint);
    const amt = tintAmt < 0 ? 0 : tintAmt;
    r = donorClamp255(r + (t.r - r) * amt);
    g = donorClamp255(g + (t.g - g) * amt);
    b = donorClamp255(b + (t.b - b) * amt);
  }

  r = donorClamp255(127.5 + (r - 127.5) * contrast);
  g = donorClamp255(127.5 + (g - 127.5) * contrast);
  b = donorClamp255(127.5 + (b - 127.5) * contrast);

  return donorRgbToHex(r, g, b);
}

// ─── grain texture — REUSES theater-materials.js's own exported pixel painter (window.
// materialTexturePixels), only the canvas/GPU-upload wrapping is local. donorPaintKeyForFamily
// maps a genesisDonor family to a KNOWN materialFamilyFor key (never an unmapped string — the
// "zero mottle-fallback" gate, satisfied by construction, see this file's own header). ───────────
const DONOR_PAINT_KEY = Object.freeze({
  stone: "stone-course", wood: "plank", iron: "metal-panel",
  // roof/glass/cloth are UNUSED by the KS-1 structural pilot (verified in
  // dev/model-foundry/KS1-PROVENANCE.json's materialFamiliesUnusedThisWave) — mapped here anyway
  // so a future decor donor wave doesn't silently mottle-fallback the day these families first
  // appear. roof reads as a stone-family painter (shingle/slate courses); cloth as the mottle
  // "whisper of material" family (no dedicated weave painter exists yet in theater-materials.js —
  // an honest, not a hidden, choice); glass gets no painter at all (see donorMaterialForFamily,
  // below — glass is a transmission material, painting a grain texture onto it is wrong).
  roof: "stone-course", cloth: "bone",
});

const DONOR_TEXTURE_CACHE = {};
function donorMaterialTexture(family, baseColorHex, seedKey) {
  if (typeof window === "undefined" || typeof window.materialTexturePixels !== "function") return null;
  const paintKey = DONOR_PAINT_KEY[family];
  if (!paintKey) return null; // glass: no grain texture, see donorMaterialForFamily
  const key = paintKey + ":" + baseColorHex + ":" + seedKey;
  if (DONOR_TEXTURE_CACHE[key]) return DONOR_TEXTURE_CACHE[key];
  const hexStr = "#" + baseColorHex.toString(16).padStart(6, "0");
  // 32x32 nearest-filtered grain, per KS-1's own recipe text ("nearest 32×32 grain") — a DIFFERENT
  // fixed size than interiorMaterialTexture's own MATERIAL_TEXEL_PX (64, theater-materials.js's
  // shared interior-surface constant); donor architecture is coarser/chunkier geometry at a
  // different UV density than the tiled interior floor/wall surfaces, so a distinct texel size is
  // an intentional per-consumer choice, not a drifted duplicate of the interior constant.
  const pixels = window.materialTexturePixels(paintKey, hexStr, "donor:" + seedKey, 32, 0.1);
  const canvas = document.createElement("canvas");
  canvas.width = pixels.width; canvas.height = pixels.height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(new ImageData(pixels.data, pixels.width, pixels.height), 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  DONOR_TEXTURE_CACHE[key] = tex;
  return tex;
}

// donorMaterialForFamily(family, seedKey, profile) -> THREE.Material — the actual "rebuild with
// Genesis materials" step, Sol P-B: roughness 0.82-0.94 / metalness 0 (iron 0.35) / five-band
// albedo through gradeColorLocal / nearest 32x32 grain through interiorMaterialTexture.
function donorMaterialForFamily(family, seedKey, profile) {
  const recipe = MATERIAL_RECIPE[family] || MATERIAL_RECIPE.stone;
  const baseHex = donorAlbedoBandColor(family, seedKey);
  const gradedHex = donorGradeColor(baseHex, profile);
  if (family === "glass") {
    // glass is a transmission material, not a grain-painted opaque surface — MeshPhysicalMaterial
    // with transmission, per the cut list's own "no realistic caustics" law (P-E, quoted in
    // VQ2-RESPEC.md — this module honors the SAME cut even though P-E is a different unit, since
    // it's the same underlying material-law family). UNUSED this wave (see header) — implemented
    // for completeness/future donors, not exercised by any KS-1 pilot piece.
    return new THREE.MeshPhysicalMaterial({
      color: gradedHex, roughness: recipe.roughness, metalness: recipe.metalness,
      transmission: 0.75, thickness: 0.05, transparent: true, opacity: 0.85,
    });
  }
  const map = donorMaterialTexture(family, gradedHex, seedKey);
  return new THREE.MeshStandardMaterial({
    color: map ? 0xffffff : gradedHex, // texture already carries the graded base color; flat fallback uses it directly
    map: map || null,
    roughness: recipe.roughness,
    metalness: recipe.metalness,
  });
}

function donorMaterialFamilyForMesh(mesh) {
  const primitiveFamily = mesh.geometry && mesh.geometry.userData &&
    mesh.geometry.userData.genesisDonor && mesh.geometry.userData.genesisDonor.materialFamily;
  if (primitiveFamily) return primitiveFamily;
  for (let owner = mesh; owner; owner = owner.parent) {
    const donorData = owner.userData && owner.userData.genesisDonor;
    if (donorData && donorData.materialFamily) return donorData.materialFamily;
  }
  return null;
}

// ─── outline policy metadata ───────────────────────────────────────────────────────────────────
// KGR-2: the inverted-hull geometry implementation is retired. Keep this realm table + lookup as
// dormant art policy only; a future shader/screen-space unit may consume it without reintroducing
// child geometry at the donor-loader boundary.
const OUTLINE_STYLE_BY_REALM = Object.freeze({
  fantasy: { mode: "selective", color: 0x3a2a1a, widthWorld: 0.015 }, // dark-umber, thin (outer-silhouette approximation)
  gloom: { mode: "full", color: 0x0a0a0a, widthWorld: 0.035 },        // near-black, full width (the VHS-horror cel look)
  chrome: { mode: "none", color: 0x000000, widthWorld: 0 },           // no line; neon rim-edge is a shader concern, not this module's
});
export function donorOutlineStyleFor(realmId) {
  return OUTLINE_STYLE_BY_REALM[realmId] || null; // unset realms: no outline (drafted-per-realm, per BEAUTY-WAVE.md's own "others drafted... when their expansion ships")
}

// ─── loadDonorPiece — the public loader ─────────────────────────────────────────────────────────
// loadDonorPiece(pack, slug, opts) -> Promise<THREE.Group>
//   opts.realmProfile  — {sat,tintAmt,tint,contrast} passed to donorGradeColor per material (null
//                         = byte-identical unpainted passthrough, same convention as gradeColorLocal)
//   opts.realmId        — reserved for future non-geometry outline policy; retained API compatibility
//   opts.seedKey         — deterministic grain/albedo-band seed (defaults to "pack/slug")
// Returns a FRESH clone every call (SkeletonUtils-free clone via Object3D.clone(true), safe here
// since donor pieces carry no skinning) so two placed instances of the same donor never share a
// mutable Object3D graph; materials/textures ARE shared/cached (DONOR_TEXTURE_CACHE, the material
// objects built per (family,seedKey,profile) triple below) since THREE materials are safe to share
// across meshes and re-creating them per instance would defeat the whole point of caching.
export async function loadDonorPiece(pack, slug, opts) {
  opts = opts || {};
  const index = await donorIndexFor(pack);
  const entry = donorEntriesForRead(index)[slug];
  if (!entry) throw new Error(`loadDonorPiece: unknown donor ${pack}/${slug} (not in the calibrated normalized index)`);

  const cacheKey = pack + "/" + slug;
  if (!DONOR_GLTF_CACHE[cacheKey]) {
    DONOR_GLTF_CACHE[cacheKey] = donorLoader().loadAsync(donorGlbUrl(pack, entry.file)).then((gltf) => gltf.scene);
  }
  const template = await DONOR_GLTF_CACHE[cacheKey];
  const group = template.clone(true);

  const seedKey = opts.seedKey || cacheKey;
  const realmProfile = opts.realmProfile || null;
  const socketRecords = [];
  const materialFamiliesApplied = [];
  let loadedV2Metadata = null;

  group.traverse((obj) => {
    const donorData = obj.userData && obj.userData.genesisDonor;
    if (donorData) {
      if (donorData.schema === "genesis.donor.v2") loadedV2Metadata = donorData;
      if (Array.isArray(donorData.sockets)) {
        donorData.sockets.forEach((socket) => socketRecords.push({ owner: obj, socket }));
      }
    }
    if (obj.isMesh) {
      const family = donorMaterialFamilyForMesh(obj);
      if (family) {
        obj.material = donorMaterialForFamily(family, seedKey + ":" + obj.name, realmProfile);
        materialFamiliesApplied.push(family);
      }
    }
  });

  if (entry.schema === "genesis.donor.v2" &&
      (!loadedV2Metadata || loadedV2Metadata.assetId !== entry.assetId ||
       loadedV2Metadata.sourceSha256 !== entry.sourceSha256 ||
       loadedV2Metadata.recipeHash !== entry.recipeHash)) {
    throw new Error(`loadDonorPiece: v2 provenance mismatch for ${pack}/${slug}`);
  }

  group.userData.genesisDonorPiece = {
    schema: entry.schema || "genesis.donor.v1",
    assetId: entry.assetId || `${pack}/${slug}`,
    pack, slug,
    admissionClass: entry.admissionClass,
    category: entry.category,
    semanticParts: entry.semanticParts,
    materialFamiliesApplied,
    canonicalScale: entry.canonicalScale,
    sourceSha256: entry.sourceSha256 || null,
    recipeHash: entry.recipeHash,
    normalizedFrame: entry.normalizedFrame || null,
    structuralGrid: entry.structuralGrid || null,
    bounds: entry.bounds || null,
    qaStatus: entry.qaStatus || null,
    companionLeaf: entry.companionLeaf || null,
  };
  // KGR-4B: classic callers receive the same sockets converted from their owning donor node into
  // the identity piece-root frame. socketFrameOf performs the full hierarchy composition (including
  // quaternion and scale); localMatrix preserves that six-degree frame without reducing it back to
  // position-only metadata. Duplicate ids stay duplicated and unconverted so the solver rejects the
  // piece instead of laundering an ambiguous attachment point into production.
  const socketIdCounts = new Map();
  socketRecords.forEach(({ socket }) => {
    socketIdCounts.set(socket.id, (socketIdCounts.get(socket.id) || 0) + 1);
  });
  const sockets = socketRecords.map(({ owner, socket }) => {
    if (socketIdCounts.get(socket.id) !== 1) return Object.assign({ node: owner.name }, socket);
    const frame = socketFrameOf(group, socket.id);
    if (!frame) return Object.assign({ node: owner.name }, socket);
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    frame.localMatrix.decompose(position, rotation, scale);
    return Object.assign({}, socket, {
      node: owner.name,
      position: position.toArray(),
      rotation: rotation.normalize().toArray(),
      localMatrix: frame.localMatrix.elements.slice(),
    });
  });
  group.userData.sockets = sockets;
  return group;
}

// socketsOf(group) -> the flat socket array a loaded piece carries (convenience read, mirrors the
// "userData (classic-script friendly)" law — a future classic-script caller can read
// pieceGroup.userData.sockets directly with no import needed once the group exists).
export function socketsOf(group) {
  return (group && group.userData && group.userData.sockets) || [];
}

export function socketsByType(group, type) {
  return socketsOf(group).filter((s) => s.type === type);
}

// ─── classic-script bridge — same republish pattern theater-materials.js/theater-interior.js use
// (their own headers document why: a top-level `const`/`export function` never auto-attaches to
// `window`). Nothing in KS-1 wires this into the live classic-script world yet (that is KS-2/KS-3's
// job) — republished defensively now so this module is reachable from a dev console or a future
// classic caller without a second edit later. ─────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  window.TheaterDonor = {
    loadDonorPiece, donorIndexFor, donorEntriesForRead, donorRegistryFromIndex,
    donorGradeColor, donorOutlineStyleFor, socketsOf, socketsByType,
  };
}
