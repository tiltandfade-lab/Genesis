/* THEATER INTERIOR MESH — the INSTANCED-GEOMETRY / GL-SURFACE family of the volumetric interior
   renderer: the two texture channels every world surface is painted from (the GR1 procedural
   CanvasTexture baker and the BW2-3 folded-file TextureLoader with its §2b per-surface repeat laws),
   the two shared geometries (the unit box and the round-column cylinder), the two pure per-instance
   colour passes (the U3 contact-seam AO darken and the BW2-3 instance-colour neutralization), the ONE
   InstancedMesh constructor every floor/wall/doorframe/pillar/skirt/portal on an interior board is
   built by, the pillar profile split, and STAGE-A A4's two per-instance ghost-mesh builders —
   extracted VERBATIM from src/ui/theater-boot.js in split step B8 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   THE PROTECTED CONTRACTS THIS FILE CARRIES: every authored number and every construction rule moved
   byte-identically. The draw-call budget (DUNGEON-GRAPH.md U3: "draw calls <= 1 per tile kind") is
   structural — one InstancedMesh per kind off ONE shared unit-cube geometry, unchanged. The GROUND
   CONVENTION is one derivation and still exactly one: y = yBase + sy/2 - 0.5 for every kind that grows
   UP off the shared y=-0.5 plane, and y = -0.5 - sy/2 for the one kind (GR4's diorama skirt) that
   hangs DOWN off it. The shadow law is unchanged (floors receive-only, everything but the skirt casts
   AND receives, a ghost neither casts nor receives). The BW2-1b diagnostic stamp
   mesh.userData.interiorKind — and its `kind + "-ghost"` variant, which
   _interiorRaycastClearForTest deliberately does NOT filter on — is byte-identical. The §2b UV
   MAPPING LAWS (floor 1x1 per cell so grout aligns with the combat grid, wall 1 x
   ITR_WALL_COURSE_REPEAT, trim ClampToEdge stretch-to-fit) are byte-identical, as is the
   NearestFilter min+mag world-surface law and the per-(material,baseColor,seedKey,grain,repeat)
   texture cache keying that makes the same realm+surface resolve the SAME baked texture object for
   the life of the session.

   ASYNC-REPLAY LAW (unchanged): interiorFileTexture's onLoad still calls markDirty() (the root's own
   dirty-frame kick) and its onError still just drops the decode so the painter/flat path wins — a
   failed texture never blocks or throws. INTERIOR_FILE_TEX_PENDING remains the capture rig's
   "are the walls actually painted yet" counter; it MOVED with the loader that increments it, so the
   root's window.Theater.interiorFileTexPending seam now reads it through the exported
   interiorMeshFileTexPending() accessor — ONE root line changed, zero moved lines.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as every B1-B7 module): this module NEVER
   imports theater-boot.js, and it imports no sibling either — its only import is "three".
   Capabilities arrive ONCE via interiorMeshInit(ctx) into the module-local mirrors below, so every
   moved body keeps its bare identifiers. Censused: NOT ONE line in this file reads or writes the live
   theater state record `S` (the monolith's own GL layer never did), so unlike B1/B2/B4-B7 this module
   takes NO SyncState — there is nothing here to re-point when the root reassigns S.

   `document`, `ImageData`, `materialTexturePixels` and `MATERIAL_TEXEL_PX` stay BARE GLOBALS exactly
   as in the monolith: the first two are DOM/platform globals, the last two are declared by the classic
   <script> src/ui/theater-materials.js and republished onto `window` there precisely so this sealed
   ES-module scope can reach them (see that file's own header + its manifest entry). Resolved the
   identical way, from the identical place, at the identical time.

   ROOT-OWNED, DELIBERATELY NOT MOVED (censused — they arrive through ctx instead):
     applyPsxShaderTweaks + nearestify — the shared material/texture treatments (read by a dozen
       non-interior root sites: the tabletop tile columns, the figure materials, the skins module's
       own ctx, the dressing module's own ctx).
     textureLoader + markDirty — the ONE shared THREE.TextureLoader instance and the root's own
       dirty-frame kick; both have many non-mesh root readers.
     THE ROOM-SHELL MOUNT PATH — censused and deliberately left behind. `compileRoomShell` (the pure
       assembler, src/ui/theater-room-mesh.js) has NO standalone consumer function in the monolith:
       ITR_ROOM_SHELL / ROOM_SHELL_POLYGON_KERNEL_FLAG / ITR_ROOM_SHELL_UV_DENSITY /
       ITR_ROOM_SHELL_RISER_DARKEN and every line that reads them live INSIDE setInteriorBoard's own
       body (there is no itrBuildRoomShell function to move), and ITR_ROOM_SHELL is additionally a
       live flag the Clay Room reads/writes through rootGetRoomShell/rootSetRoomShell. Extracting it
       would mean extracting setInteriorBoard itself, which is a later step's decision, not this one's.
     THE SKIRT — likewise not a function. GR4's diorama edge skirt is a shadowKind STRING passed to
       interiorBuildInstancedMesh from setInteriorBoard (`interiorBuildInstancedMesh(data.skirt, cx,
       cz, null, variant, "skirt")`); its whole implementation is the `skirtBand` branch inside this
       file's own mesh builder, which moved with it.
     interiorAssignShadowCasters — NOT here: censused as already moved in split B5 to
       src/ui/theater-practicals.js (the U3 shadow-caster budget travelled with the practical rig it
       serves). Nothing in this file touches it.

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, and the
   trailing `export {...}` block. There is not ONE accessor swap and not one changed production line in
   this file — every moved line is byte-identical to the monolith. */
import * as THREE from "three";

// ---- root-capability mirrors (wired once by interiorMeshInit; this module holds no S) ----
let applyPsxShaderTweaks, markDirty, nearestify, textureLoader;

export function interiorMeshInit(ctx){
  ({ applyPsxShaderTweaks,
    markDirty,
    nearestify,
    textureLoader } = ctx);
}

// BW2-3 MATERIAL TEXEL: the async-decode counter the root's window.Theater.interiorFileTexPending
// seam publishes. The `let` itself moved with interiorFileTexture (the only thing that mutates it);
// this accessor is how the root still reads it live.
export function interiorMeshFileTexPending(){ return INTERIOR_FILE_TEX_PENDING; }

// ─── DUNGEON-GRAPH.md U3 / GR1 (docs/GRAPHICS-ENGINE.md build unit GR1) — the volumetric interior
// renderer's GL layer ──────────────────────────────────────────────────────────────────────────────
// interiorMaterialTexture: the ONE place src/ui/theater-materials.js's pure pixel buffer
// (materialTexturePixels) becomes an actual THREE.CanvasTexture — putImageData onto a real <canvas>,
// nearest-filtered, RepeatWrapping (same "data layer elsewhere, GL layer here" split
// theater-interior.js's own header keeps, one file down: theater-materials.js stays as canvas/DOM-free
// as theater-interior.js does). Cached per (material,baseColor,seedKey) — GR1's own "boot-time, seeded"
// instruction: the SAME realm+surface always resolves the SAME cached texture object, baked once, never
// rebuilt per room/plan/session (materialTexturePixels itself is already deterministic off that same
// key — this cache just avoids re-painting the identical buffer + re-uploading it to the GPU on every
// setInteriorBoard call). seedKey is "<realmId>:<surface>" (theater-interior.js's tileKit doesn't carry
// realmId+surface directly here, so setInteriorBoard passes them through explicitly, below).
const INTERIOR_MATERIAL_TEXTURE_CACHE = {};
function interiorMaterialTexture(material, baseColorHex, seedKey, grainIntensity, repeatX, repeatZ){
  if(!material || !baseColorHex) return null;
  const key = material + ":" + baseColorHex + ":" + seedKey + ":" + grainIntensity + ":" + repeatX + ":" + repeatZ;
  if(INTERIOR_MATERIAL_TEXTURE_CACHE[key]) return INTERIOR_MATERIAL_TEXTURE_CACHE[key];
  const pixels = materialTexturePixels(material, baseColorHex, seedKey, MATERIAL_TEXEL_PX, grainIntensity);
  const canvas = document.createElement("canvas");
  canvas.width = pixels.width; canvas.height = pixels.height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(new ImageData(pixels.data, pixels.width, pixels.height), 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(Math.max(1, repeatX || 1), Math.max(1, repeatZ || 1));
  nearestify(tex);
  INTERIOR_MATERIAL_TEXTURE_CACHE[key] = tex;
  return tex;
}

// BW2-3 MATERIAL TEXEL (GENERATED-FIRST): the ONE place a folded PACKET-02 texture FILE
// (assets/textures/*.png, build/fold-textures.py) becomes a THREE.Texture on a world surface —
// async TextureLoader (image lands later; onLoad -> markDirty replays the render, the SAME pattern
// dressingTextureFor/loadTextureManifest already keep). NearestFilter min+mag (BW2-0 world-surface
// law: the texel is AUTHORED, crisp when magnified — the fold resamples the 512 source DOWN to engine
// texel so on-stage it is a MAGNIFICATION, no minification shimmer). `wrap` + per-surface `repeat` are
// the §2b UV MAPPING LAWS, applied by the caller. Cached per url+wrap+repeat so the same surface never
// re-fetches/re-uploads. INTERIOR_FILE_TEX_PENDING lets a capture harness wait for the async decodes.
let INTERIOR_FILE_TEX_PENDING = 0;
const INTERIOR_FILE_TEXTURE_CACHE = {};
function interiorFileTexture(url, wrapMode, repeatX, repeatZ){
  if(!url) return null;
  const key = url + ":" + wrapMode + ":" + repeatX + ":" + repeatZ;
  if(INTERIOR_FILE_TEXTURE_CACHE[key]) return INTERIOR_FILE_TEXTURE_CACHE[key];
  const wrap = wrapMode === "mirror" ? THREE.MirroredRepeatWrapping
             : wrapMode === "clamp" ? THREE.ClampToEdgeWrapping
             : THREE.RepeatWrapping;
  INTERIOR_FILE_TEX_PENDING++;
  const tex = textureLoader.load(url,
    () => { INTERIOR_FILE_TEX_PENDING = Math.max(0, INTERIOR_FILE_TEX_PENDING - 1); markDirty(); },
    undefined,
    () => { INTERIOR_FILE_TEX_PENDING = Math.max(0, INTERIOR_FILE_TEX_PENDING - 1); }); // load failure -> drop, painter/flat wins
  tex.wrapS = wrap; tex.wrapT = wrap;
  tex.repeat.set(Math.max(0.0001, repeatX || 1), Math.max(0.0001, repeatZ || 1));
  nearestify(tex);
  INTERIOR_FILE_TEXTURE_CACHE[key] = tex;
  return tex;
}

// BW2-3 §2b UV MAPPING LAWS — per-surface repeat. Every floor/wall/pillar InstancedMesh instance is a
// 1x1x* box sharing ONE unit-cube geometry (UV 0..1 per face) and ONE material, so texture.repeat is
// the per-cell tile count:
//   FLOOR: repeat (1,1) -> exactly ONE texture tile per 5ft cell; the tile's border grout thereby lands
//     on the cell boundary -> the grout grid ALIGNS with the combat grid (the room shows roomW x roomD
//     tiles == room cell dims, the spec's "repeat = room dims" expressed per-cell).
//   WALL: repeat (1, ITR_WALL_COURSE_REPEAT) -> one texture WIDTH per cell (courses continue seamlessly
//     across adjacent wall cells) and the full texture HEIGHT (~14 authored courses) over the wall
//     height. (Scale-domain-taller walls stretch the same courses — the pre-existing shared-material
//     limitation, not introduced here; base-height flagship walls read at fixed texel.)
//   TRIM: ClampToEdge, repeat (1,1) -> stretch-to-fit along the run (the one legal stretch case, §2b).
const ITR_WALL_COURSE_REPEAT = 1.0; // vertical wall repeat multiplier — the taste-loop dial to hit 14+/-3 courses
function interiorSurfaceFileTexture(surface, file, wrap){
  if(!file) return null;
  if(surface === "wall") return interiorFileTexture(file, wrap, 1, ITR_WALL_COURSE_REPEAT);
  if(surface === "trim") return interiorFileTexture(file, "clamp", 1, 1);
  return interiorFileTexture(file, wrap, 1, 1); // floor (and any other 1:1-per-cell surface)
}

// unit cube, shared by every InstancedMesh kind below — each instance's own transform (position+scale
// baked into its matrix) is what gives it its real footprint/height, per VOLUMETRIC WALL LAW (real
// BoxGeometry with height, never a flat plane) — never re-created per call.
let INTERIOR_UNIT_BOX = null;
function interiorUnitBoxGeometry(){
  if(!INTERIOR_UNIT_BOX) INTERIOR_UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
  return INTERIOR_UNIT_BOX;
}

// DUNGEON-GRAPH.md U3 render-quality study card (a/e/f variants): "baked vertex AO — darken wall-floor
// seams". A true per-vertex bake doesn't apply to a shared-geometry InstancedMesh (every instance reuses
// the SAME unit-cube vertices) — the INSTANCE-level equivalent this rig uses instead is a per-instance
// COLOR darken on any floor/door cell 4-adjacent to a wall cell (the contact seam), which is what the
// reference repo's screenshots actually read as: the darker line right where a wall meets the floor.
// Pure function over the plain instance arrays — no THREE, easy to unit-test, applied only when the
// study rig's AO variant is on (product callers never set this; see setInteriorVariant below).
function interiorApplyAODarkening(instances, factor){
  const wallKeys = new Set((instances.wall || []).map((w) => w.x + "," + w.z));
  const AO_FACTOR = (typeof factor === "number" && factor > 0 && factor < 1) ? factor : 0.45; // default = card-v6 pick; variant.aoFactor sweeps it (intensity taste card)
  ["floor", "doorframe"].forEach((kind) => {
    (instances[kind] || []).forEach((inst) => {
      const seam = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => wallKeys.has((inst.x + dx) + "," + (inst.z + dz)));
      if(!seam) return;
      const c = new THREE.Color(inst.color || "#ffffff").multiplyScalar(AO_FACTOR);
      inst.color = "#" + c.getHexString();
    });
  });
  return instances;
}

// BW2-3 MATERIAL TEXEL — INSTANCE-COLOR NEUTRALIZATION. A floor/wall InstancedMesh multiplies its
// texture map by each instance's per-cell COLOR (setColorAt). Those colors are the kit's DARK palette
// anchor (floorColor/wallColor) modulated by the scene value-scripts (BW2-4 rim plunge, VP3 perimeter
// darken/tone jitter) — perfect for the PROCEDURAL painter, whose texture is a near-flat tint of that
// same base. But a FOLDED file texture already carries full realm color, so multiplying by the dark
// base double-darkens it to near-black under the plunged ambient (the gloom R1 read). Fix: convert
// each per-cell color to a NEUTRAL grey VALUE MULTIPLIER = its luminance RELATIVE to the kit base — so
// a normal cell reads the texture at full value, while a perimeter/AO-darkened cell still darkens it
// proportionally (the rim vignette + contact seam survive; only the absolute dark HUE is dropped, which
// the texture now supplies itself). Pure over the plain instance list (returns a shallow-cloned list).
function itrNeutralizeInstanceColors(list, baseHex){
  const base = new THREE.Color(baseHex || "#808080");
  const baseLum = Math.max(0.02, 0.299 * base.r + 0.587 * base.g + 0.114 * base.b);
  return (list || []).map(function(inst){
    const c = new THREE.Color(inst.color || baseHex || "#808080");
    const lum = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    const g = Math.max(0, Math.min(1.2, lum / baseLum)); // relative value; >1 clamped so it never blows out
    return Object.assign({}, inst, { color: "#" + new THREE.Color(g, g, g).getHexString() });
  });
}

// one InstancedMesh per tile KIND (floor/wall/doorframe/pillar) — the draw-call budget DUNGEON-GRAPH.md
// U3's acceptance names ("draw calls <= 1 per tile kind"), however many hundreds/thousands of instances
// an 80-room plan carries. `list` is one of data.instances.{floor,wall,doorframe,pillar} (§ interiorBuildBoard,
// src/ui/theater-interior.js) — each entry {x,z,sx,sy,sz,color}. Ground convention matches the existing
// tile-column math a few hundred lines up (mesh.position.y = h/2-0.5 -> every column's base sits on the
// SAME y=-0.5 floor plane): here that's y = sy/2 - 0.5. `variant.banded` (study rig only) routes through
// applyPsxShaderTweaks' quantized-lighting injection.
function interiorBuildInstancedMesh(list, cx, cz, texture, variant, shadowKind, ghostOpacity){
  if(!list || !list.length) return null;
  const geo = interiorUnitBoxGeometry();
  const vertical = shadowKind === "wall" || shadowKind === "pillar" || shadowKind === "doorframe";
  // S-1 OCCLUSION FADE (docs/DIEGETIC-LIGHT.md): a caller passing a numeric `ghostOpacity` wants THIS
  // mesh built as the translucent GHOST overlay for an already-ankle-stubbed occluder list (see
  // itrSplitOccluderForAnkleGhost) rather than the normal opaque mesh — every existing call site never
  // passes a 7th argument, so `isGhost` is false and this function's behavior is byte-identical to
  // before this unit for every non-S-1 caller.
  const isGhost = typeof ghostOpacity === "number";
  const matBase = texture ? { map: texture } : { color: 0xffffff };
  if(isGhost) Object.assign(matBase, { transparent: true, opacity: ghostOpacity, depthWrite: false });
  const mat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial(matBase), {
       banded: !!(variant && variant.banded), bandedSteps: variant && variant.bandedSteps,
       baseAO: (variant && variant.ao && vertical) ? { floor: variant.aoFactor || 0.45, range: 0.22 } : null, // tight contact band — 0.45 spread read as mush (pixel-diff proved it rendered, eyes said no)
       worldSurface: true, // GRAPHICS-ENGINE law 2 (VP0): the interior channel's floor/wall/doorframe/pillar
                            // materials are its WORLD surfaces — gate dither+snap through WORLD_PSX_ENABLED
       worldPsxOverride: (variant && typeof variant.worldPsx === "boolean") ? variant.worldPsx : undefined });
  const mesh = new THREE.InstancedMesh(geo, mat, list.length);
  // BW2-1b — TEST/DIAGNOSTIC TAG: which instance-kind this mesh is (floor/wall/doorframe/pillar/
  // skirt) — a plain read-only userData stamp (harmless to production rendering) so a harness can
  // pick the SOLID kinds (wall/pillar/doorframe) out of S.interiorGroup.children for a real
  // THREE.Raycaster occlusion check (_interiorRaycastClearForTest, below) without this file needing
  // to expose the raw mesh references any other way. S-1: a ghost overlay is tagged kind+"-ghost" —
  // deliberately NOT one of the solid tags _interiorRaycastClearForTest filters on, since a translucent
  // ghost is exactly the geometry that should read as "sightline clear" now.
  mesh.userData.interiorKind = isGhost ? (shadowKind + "-ghost") : shadowKind;
  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2: wall/floor/pillar/doorframe instanced meshes cast AND
  // receive real shadows on an interior board (harmless while renderer.shadowMap.enabled is false on
  // the combat/tabletop path — these flags are simply never consulted there). Floors are the one
  // exception on cast: a floor slab casting onto itself/adjacent floor cells buys nothing and only
  // costs shadow-map budget, so floors receive-only, everything else casts+receives. S-1: a ghost
  // overlay (~5% opacity) neither casts nor receives — a near-invisible slab throwing/catching a full
  // shadow would read as a visual bug, not atmosphere.
  mesh.receiveShadow = isGhost ? false : (shadowKind !== "skirt");
  mesh.castShadow = isGhost ? false : (shadowKind !== "floor" && shadowKind !== "skirt");
  const m = new THREE.Matrix4();
  const colorObj = new THREE.Color();
  // GR4: every OTHER kind grows UP off the shared y=-0.5 floor plane (position.y = sy/2-0.5, this
  // function's own header comment); the skirt is the one kind that hangs DOWN off that same plane
  // instead — its own top face sits flush at y=-0.5 and it extends downward by its own sy, reading as
  // the underside of the floating slab rather than a second floor layer.
  const skirtBand = shadowKind === "skirt";
  // BEAUTY-WAVE-2.md BW2-5: `yBase` (default 0, so every pre-existing instance renders IDENTICALLY to
  // before this unit) lets a prism's bottom sit ABOVE the shared floor plane instead of always growing
  // up off it — arch-header prisms stacking on top of a doorframe, a tapered column's narrower cap.
  // `ox`/`oz` (also default 0) offset the instance WITHIN its own cell — door-reveal jambs sitting in
  // the margin beside a narrower frame, sub-cell furniture-assembly prisms.
  list.forEach((inst, i) => {
    const yBase = (typeof inst.yBase === "number") ? inst.yBase : 0;
    const y = skirtBand ? (-0.5 - (inst.sy || 1) / 2) : (yBase + (inst.sy || 1) / 2 - 0.5);
    m.compose(
      new THREE.Vector3((inst.x + (inst.ox || 0)) - cx, y, (inst.z + (inst.oz || 0)) - cz),
      new THREE.Quaternion(),
      new THREE.Vector3(Math.max(0.01, inst.sx || 1), Math.max(0.01, inst.sy || 1), Math.max(0.01, inst.sz || 1))
    );
    mesh.setMatrixAt(i, m);
    colorObj.set(inst.color || "#ffffff");
    mesh.setColorAt(i, colorObj);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if(mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

// BW2-5 THE COLUMN DEMOTION: pillar instances now carry an optional `profile` field (square/round/
// tapered/broken/tapered-cap — theater-interior.js's own column-roll comment). square/tapered/broken/
// tapered-cap stay box-based (scale/height differences alone read the profile, same shared box
// InstancedMesh every other kind already uses); "round" gets a small dedicated CylinderGeometry
// InstancedMesh instead — columns are now RARE (<=1/room, most rooms earn none), so this NEVER
// meaningfully grows the draw-call budget dev/verify-dungeon-interior.mjs check 2 guards (that check
// only asserts board.instances' own KEYS, which this split never touches — it's a pure GL-layer
// interpretation of the SAME `pillar` array).
let INTERIOR_CYLINDER_GEO = null;
function interiorCylinderGeometry(){
  if(!INTERIOR_CYLINDER_GEO) INTERIOR_CYLINDER_GEO = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
  return INTERIOR_CYLINDER_GEO;
}
function interiorBuildPillarMeshes(list, cx, cz, variant, pillarTex, ghostOpacity){
  const boxList = (list || []).filter((p) => p.profile !== "round");
  const roundList = (list || []).filter((p) => p.profile === "round");
  const meshes = [];
  // BW2-3 §2b COLUMNS: per-face planar from the WALL sheet (pillarTex) — box pillars route it through
  // interiorBuildInstancedMesh's own map path, round pillars get it below. null on non-flagship/off ->
  // the pre-BW2-3 flat-colored pillar, unchanged.
  const boxMesh = interiorBuildInstancedMesh(boxList, cx, cz, pillarTex || null, variant, "pillar", ghostOpacity);
  if(boxMesh) meshes.push(boxMesh);
  if(roundList.length){
    const geo = interiorCylinderGeometry();
    // S-1 OCCLUSION FADE: same ghost-overlay convention interiorBuildInstancedMesh's own box path uses
    // — round pillars are rare (<=1/room) but must fade too when they're the occluder.
    const isGhost = typeof ghostOpacity === "number";
    const roundMatBase = pillarTex ? { map: pillarTex } : { color: 0xffffff };
    if(isGhost) Object.assign(roundMatBase, { transparent: true, opacity: ghostOpacity, depthWrite: false });
    const mat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial(roundMatBase), {
      banded: !!(variant && variant.banded), bandedSteps: variant && variant.bandedSteps, worldSurface: true,
      worldPsxOverride: (variant && typeof variant.worldPsx === "boolean") ? variant.worldPsx : undefined
    });
    const mesh = new THREE.InstancedMesh(geo, mat, roundList.length);
    mesh.receiveShadow = !isGhost; mesh.castShadow = !isGhost;
    const m = new THREE.Matrix4(); const colorObj = new THREE.Color();
    roundList.forEach((inst, i) => {
      const yBase = (typeof inst.yBase === "number") ? inst.yBase : 0;
      const y = yBase + (inst.sy || 1) / 2 - 0.5;
      m.compose(
        new THREE.Vector3((inst.x + (inst.ox || 0)) - cx, y, (inst.z + (inst.oz || 0)) - cz),
        new THREE.Quaternion(),
        new THREE.Vector3(Math.max(0.01, inst.sx || 1), Math.max(0.01, inst.sy || 1), Math.max(0.01, inst.sz || 1))
      );
      mesh.setMatrixAt(i, m);
      colorObj.set(inst.color || "#ffffff");
      mesh.setColorAt(i, colorObj);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if(mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    meshes.push(mesh);
  }
  return meshes;
}

// STAGE-A A4 (docs/STAGE-A.md §A4) — DYNAMIC OCCLUSION v2's own "small ghost mesh, never a big shared
// material" mandate: builds ONE ghost mesh per blocking instance (a 1-item interiorBuildInstancedMesh
// call, reusing 100% of its texture/AO/shading logic) rather than batching every ghost of a kind into
// one InstancedMesh at one flat opacity. Stashes the built mesh's own material onto `fadeEntry.materials`
// so itrOcclusionClassify's live tween can mutate it directly, every tick, with no further rebuild
// between now and whenever the next setInteriorBoard call replaces this mesh. `entries` is a list of
// {inst, fadeEntry} pairs (inst = the split-out ghost instance descriptor, fadeEntry = that SAME
// instance's persistent S.occlusionFadeState entry, already carrying its own live `.opacity`).
function itrBuildOcclusionGhostMeshes(entries, cx, cz, texture, variant, shadowKind){
  const group = new THREE.Group();
  (entries || []).forEach(function(pair){
    if(!pair || !pair.inst || !pair.fadeEntry) return;
    const mesh = interiorBuildInstancedMesh([pair.inst], cx, cz, texture, variant, shadowKind, pair.fadeEntry.opacity);
    if(!mesh) return;
    pair.fadeEntry.materials = [mesh.material];
    group.add(mesh);
  });
  return group.children.length ? group : null;
}
// same per-instance-mesh/per-instance-material contract as itrBuildOcclusionGhostMeshes above, routed
// through interiorBuildPillarMeshes so a round-profile occluder's own CylinderGeometry ghost gets the
// identical individually-tweened treatment as a box pillar's (interiorBuildPillarMeshes already splits
// box vs round internally; a single-instance call here returns exactly one of the two mesh families).
function itrBuildOcclusionGhostPillarMeshes(entries, cx, cz, variant, pillarTex){
  const group = new THREE.Group();
  (entries || []).forEach(function(pair){
    if(!pair || !pair.inst || !pair.fadeEntry) return;
    const meshes = interiorBuildPillarMeshes([pair.inst], cx, cz, variant, pillarTex, pair.fadeEntry.opacity);
    if(!meshes || !meshes.length) return;
    pair.fadeEntry.materials = meshes.map(function(m){ return m.material; });
    meshes.forEach(function(m){ group.add(m); });
  });
  return group.children.length ? group : null;
}

export {
  INTERIOR_MATERIAL_TEXTURE_CACHE, interiorMaterialTexture,
  INTERIOR_FILE_TEXTURE_CACHE, interiorFileTexture,
  ITR_WALL_COURSE_REPEAT, interiorSurfaceFileTexture,
  interiorUnitBoxGeometry, interiorCylinderGeometry,
  interiorApplyAODarkening, itrNeutralizeInstanceColors,
  interiorBuildInstancedMesh, interiorBuildPillarMeshes,
  itrBuildOcclusionGhostMeshes, itrBuildOcclusionGhostPillarMeshes,
};
