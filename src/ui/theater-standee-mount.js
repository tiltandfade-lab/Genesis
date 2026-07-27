/* THEATER STANDEE MOUNT — the BASE / CONTACT family: CL-R2's visible standee support (the shallow
   rounded plinth, its geometry/material caches and its tactical-span bound), BW2-2's standee contact
   line, BW2-2b's turn-glow toggle, CL-R2's support-collision resolver, and BW2-2's soft radial
   MULTIPLY contact pool — extracted VERBATIM from src/ui/theater-boot.js in split step B7
   (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   THE PROTECTED CONTRACT THIS FILE CARRIES (the brief's §Protected contracts — the "base/contact
   treatment" half of the pixel-sprite register, plus "collision-safe standee placement"): every
   authored number moved byte-identically — INTERIOR_BASE_HEIGHT 0.09, INTERIOR_BASE_TREAD_DEPTH 1/3,
   INTERIOR_BASE_Y_OFFSET 0.006, INTERIOR_POOL_Y_OFFSET 0.003, STANDEE_SUPPORT_CLEARANCE 0.035, the
   tiny/small/tread depth ladder, the 0.82 width bounds, the base tint multipliers (side x0.30 /
   top x0.62), the rounded-extrude bevel parameters and their primitive-geometry harness fallback,
   the pool gradient's four colour stops, and BASE_GLOW_EMISSIVE_HEX 0xd4af6e. The collision sweep
   keeps its exact deterministic shape: later-mounted pieces move, 12 ordered passes, the
   minimum-translation axis, the hashSeed tie-break, and the S.standeeCollisionAudit record.

   CONTACT-Y IS STILL ONE DERIVATION: interiorStandeeContactY(floorTop) = floorTop +
   INTERIOR_BASE_Y_OFFSET + INTERIOR_BASE_HEIGHT, unchanged. The FLOOR side of that law
   (interiorFloorTopMapFrom / interiorFloorTopAt / ITR_FLOOR_BASE_Y / ITR_FLOOR_HEIGHT_FALLBACK) is
   deliberately NOT here — see ROOT-OWNED below.

   NO SCHEDULER, NO rAF: censused zero requestAnimationFrame calls and zero S.tweens writes. The
   collision resolve + blob sync run inside the ROOT's existing per-render facing pass
   (updateSpriteBillboardYaw, src/ui/theater-sprites.js), on the same cadence they always did.
   Nothing was unified; nothing was re-cadenced.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as every B1-B6 module): this module NEVER
   imports theater-boot.js, and it imports no sibling either — its only import is "three". Capabilities
   arrive ONCE via standeeMountInit(ctx) into the module-local mirrors below, so every moved body
   keeps its bare identifiers. It DOES read and write the live theater state record
   (S.interiorGroup / S.unitGroup / S.standeeCollisionAudit / S.standeeCollisionDirty), so the root
   also calls standeeMountSyncState(S) at BOTH `S = createTheaterState()` reassignment sites, beside
   the existing clayRoomSyncState / lightLabSyncState / postSyncState / lightingSyncState /
   motesSyncState / cameraSyncState / occlusionSyncState calls.

   ROOT-OWNED, DELIBERATELY NOT MOVED (censused — they arrive through ctx instead):
     kilterFor + KILTER_YAW_DEG + KILTER_POS_FRAC — THE KILTER. HARD PIN: dev/verify-d4-doors.mjs
       extracts all three from theater-boot.js's own source TEXT (its Part B sandbox evals
       kilterFor's real body beside the door builders, which reuse the kilter jitter). They sit
       between setBaseGlow and the collision family in the monolith; the split steps around them.
     interiorFloorTopMapFrom / interiorFloorTopAt / ITR_FLOOR_BASE_Y / ITR_FLOOR_HEIGHT_FALLBACK —
       the FLOOR half of the BW2-2 floor-contact law. HARD PIN: interiorFloorTopAt, ITR_FLOOR_BASE_Y
       and ITR_FLOOR_HEIGHT_FALLBACK are text-extracted from the ROOT by dev/verify-d4-doors.mjs and
       (the two consts) by dev/verify-bw3-4-light-shafts.mjs, dev/verify-e0-1-fixture-fade.mjs and
       dev/verify-visible-practicals.mjs. They are also read by dozens of non-standee root sites
       (every piece/dressing/decal/light/door mount). The two consts arrive here through ctx for
       addInteriorContactBlob's own fallback expression; nothing else in this file needs them.
     addWallContactAO + WALL_AO_SCALE + WALL_AO_Z_OFFSET — CENSUSED AND DELIBERATELY LEFT BEHIND.
       Despite reusing this file's pool geometry/material, the wall-contact halo is DRESSING-owned by
       both its own header ("every wall-hung dressing card ... the extrusion prop") and its call
       graph: its ONE caller is interiorBuildWallProps, the interior realizer's wall-prop builder
       (B9's scope). It reaches interiorPoolGeoFor / interiorPoolMaterial as imported bindings from
       here, so it uses the SAME shared geometry cache and the SAME single material instance it
       always did.
     hexToRGB / rgbToHex / scaleRGB — the shared colour helpers (read by a dozen non-base root sites).
     hashSeed — the shared string hash (also used by the floater/verb families in the root).

   `document` stays a BARE GLOBAL in interiorPoolTexture, exactly as in the monolith, and its
   total-function degradation (a jsdom harness with no 2D context yields an untextured but still
   valid CanvasTexture rather than a throw) is unchanged.

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, the
   one `split B7` chunk-boundary note marking where a root-owned declaration was left behind (THE
   KILTER, which sits between setBaseGlow and the collision family in the monolith), and the trailing
   `export {...}` block. There is not ONE accessor swap in this file — every moved
   production line is byte-identical to the monolith. */
import * as THREE from "three";

// ---- root-capability mirrors (wired once by standeeMountInit; S re-synced by standeeMountSyncState) ----
let S;
let ITR_FLOOR_BASE_Y, ITR_FLOOR_HEIGHT_FALLBACK, hashSeed, hexToRGB, rgbToHex, scaleRGB;

export function standeeMountInit(ctx){
  ({ ITR_FLOOR_BASE_Y,
    ITR_FLOOR_HEIGHT_FALLBACK,
    hashSeed,
    hexToRGB,
    rgbToHex,
    scaleRGB } = ctx);
  S = ctx.S;
}
export function standeeMountSyncState(nextS){ S = nextS; }

// CL-R2 — STANDEE SUPPORTS: the visible support is a shallow, softly rounded strip under every
// interior standee, not a circular gameplay token. The tactical footprint remains the authoritative
// occupied-cell span; this support is only the physical-looking foot that holds the cutout upright.
// A Medium-or-larger support is exactly one stair tread deep (1/3 cell), while Small/Tiny supports
// may be shallower. This lets a 5-ft citizen sit naturally on any of the three treads represented by
// one cell without changing its 5x5 tactical ownership. Width is bounded by the tactical span, so a
// very wide sprite exposes an art-regeneration problem instead of silently inventing a collision disc.
const INTERIOR_BASE_HEIGHT = 0.09;                 // BW2-2b item 2: 0.04 -> ~0.09 ("a real plinth, per the mock read")
const INTERIOR_BASE_TREAD_DEPTH = 1 / 3;
const INTERIOR_BASE_Y_OFFSET = 0.006;              // clears the contact pool's own +0.003 (below) — never z-fights it
// BW2-2b item 3 (TURN GLOW) — the accent gold every acting standee's ring already uses (ACTING_RING_MAT,
// below); the base's own top/side materials swap TOWARD this on emissive when a standee is acting, so
// ring + glowing plinth read "your turn" together, diegetically.
const BASE_GLOW_EMISSIVE_HEX = 0xd4af6e;
const INTERIOR_BASE_GEO_CACHE = {};
function interiorTacticalSpanFor(size, authoredSpan){
  if(Number.isFinite(authoredSpan) && authoredSpan > 0) return authoredSpan;
  const key = String(size || "Medium").toLowerCase();
  if(key === "tiny") return 0.5;
  if(key === "large") return 2;
  if(key === "huge") return 3;
  if(key === "gargantuan") return 4;
  return 1;
}
function interiorStandeeSupportMetrics(renderedWidth, size, authoredSpan){
  const tacticalSpan = interiorTacticalSpanFor(size, authoredSpan);
  const sizeKey = String(size || (tacticalSpan <= 0.5 ? "Tiny" : "Medium")).toLowerCase();
  const depth = sizeKey === "tiny" ? 0.18 : (sizeKey === "small" ? 0.26 : INTERIOR_BASE_TREAD_DEPTH);
  const minimumWidth = depth * 1.35;
  const maximumWidth = Math.max(minimumWidth, tacticalSpan * 0.82);
  const width = Math.max(minimumWidth, Math.min(maximumWidth, Math.max(0.05, renderedWidth || 1) * 0.82));
  return {
    width: width,
    depth: depth,
    tacticalSpanCells: tacticalSpan,
    treadDepth: INTERIOR_BASE_TREAD_DEPTH,
    stairFit: depth <= INTERIOR_BASE_TREAD_DEPTH + 0.000001
  };
}
function interiorBaseGeoFor(width, depth){
  const safeWidth = Math.max(0.08, width || 0.45);
  const safeDepth = Math.max(0.08, depth || INTERIOR_BASE_TREAD_DEPTH);
  const key = safeWidth.toFixed(3) + "x" + safeDepth.toFixed(3);
  if(!INTERIOR_BASE_GEO_CACHE[key]){
    if(typeof THREE.Shape === "function" && typeof THREE.ExtrudeGeometry === "function"){
      const radius = Math.min(safeDepth * 0.42, safeWidth * 0.16);
      const x0 = -safeWidth / 2, x1 = safeWidth / 2;
      const z0 = -safeDepth / 2, z1 = safeDepth / 2;
      const shape = new THREE.Shape();
      shape.moveTo(x0 + radius, z0);
      shape.lineTo(x1 - radius, z0);
      shape.quadraticCurveTo(x1, z0, x1, z0 + radius);
      shape.lineTo(x1, z1 - radius);
      shape.quadraticCurveTo(x1, z1, x1 - radius, z1);
      shape.lineTo(x0 + radius, z1);
      shape.quadraticCurveTo(x0, z1, x0, z1 - radius);
      shape.lineTo(x0, z0 + radius);
      shape.quadraticCurveTo(x0, z0, x0 + radius, z0);
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: INTERIOR_BASE_HEIGHT,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelSize: Math.min(0.018, radius * 0.18),
        bevelThickness: 0.012,
        curveSegments: 4
      });
      // Shape lies in XY and extrudes +Z. +90deg about X maps its shape-Y to world Z and the
      // extrusion downward from local y=0, keeping the top face on the shared feet/contact origin.
      geo.rotateX(Math.PI / 2);
      INTERIOR_BASE_GEO_CACHE[key] = geo;
    } else {
      // Test harnesses may provide only the primitive geometry constructors. Preserve the same
      // dimensions/contact law there; production Three.js always takes the rounded extrusion above.
      const geo = new THREE.BoxGeometry(safeWidth, INTERIOR_BASE_HEIGHT, safeDepth);
      if(typeof geo.translate === "function") geo.translate(0, -INTERIOR_BASE_HEIGHT / 2, 0);
      INTERIOR_BASE_GEO_CACHE[key] = geo;
    }
  }
  return INTERIOR_BASE_GEO_CACHE[key];
}
const INTERIOR_BASE_MAT_CACHE = {};
function interiorBaseMaterialsFor(trimHex){
  const key = trimHex || "#8a8478";
  if(INTERIOR_BASE_MAT_CACHE[key]) return INTERIOR_BASE_MAT_CACHE[key];
  const c = hexToRGB(key);
  // BW2-4b item 3 — BASE TINT: bases were pale lily-pads (side x0.55 / top x1.4 off the bright trim
  // accent read as lit stone in noon light). Darkened to realm-trim STONE per the gloom mock — dark
  // sides, a subtly lighter (not bright) top — so a base reads as shadowed ground, and adjacent bases
  // fusing in a melee huddle read as one dark shadow-blob rather than a pale pad. Now that sprites +
  // bases are both LIT and the interior key is a whisper, these multipliers are the base's whole value.
  const sideRGB = scaleRGB(c, 0.30);
  const topRGB = scaleRGB(c, 0.62);
  const side = new THREE.MeshLambertMaterial({ color: rgbToHex(sideRGB.r, sideRGB.g, sideRGB.b) });
  const top = new THREE.MeshLambertMaterial({ color: rgbToHex(topRGB.r, topRGB.g, topRGB.b) });
  // ExtrudeGeometry material groups: [0]=front/back caps, [1]=side wall.
  const mats = [top, side];
  INTERIOR_BASE_MAT_CACHE[key] = mats;
  return mats;
}
// interiorStandeeContactY: the world Y a standee's own feet-line (its group's local y=0 —
// buildSpriteBillboardMesh's bottom-anchored convention) must sit at so the sprite reads as STANDING ON
// its own base's TOP FACE, not the raw floor. A registry floorFrac (a flying/floating creature's
// ground-contact fraction) still applies ON TOP of this exactly as it did pre-BW2-2 — it now lifts
// further above the base top instead of the bare -0.5 plane, same relative behavior, corrected origin.
function interiorStandeeContactY(floorTop){
  return floorTop + INTERIOR_BASE_Y_OFFSET + INTERIOR_BASE_HEIGHT;
}
// buildInteriorBase — one plinth mesh. Added as a CHILD of the standee's own figure group (never a
// sibling blob-group entry, and — BW2-2b item 1 — never a child of that group's own inner sprite wrap
// either, see buildSpriteBillboardMesh's own header) so BW2-2's item 4 ("the whole miniature-with-base
// tips as one") holds WITHOUT any reparenting trick: standee-verbs.js's fall-death now tips the OUTER
// group's own rotation.x directly (freed by camera-tilt moving to the inner wrap — see
// updateSpriteBillboardYaw), and a base mounted here as a plain sibling child of that same outer group
// rides along automatically, exactly like a real miniature-with-base tipping as one rigid piece. The
// blob/pool stays in its own untouched sibling group (added to S.shadowGroup/blobGroup directly, never
// to this figure), exactly per spec item 4's "the blob stays put." Local position is fixed regardless
// of floorFrac — the group's own world Y already carries the full contact-line math
// (interiorStandeeContactY minus floorFrac*height, at the call sites below), so the base's local origin
// is always "flush under local y=0": the group's local y=0 IS the base's own top face, which is also
// exactly where a floorFrac=0 sprite's own bottom edge sits (buildSpriteBillboardMesh's
// mesh.position.y=h/2 convention) — one shared local reference point, no separate bookkeeping.
function buildInteriorBase(width, depth, trimHex){
  const geo = interiorBaseGeoFor(width, depth);
  // BW2-2b item 3 (TURN GLOW): the cache above (interiorBaseMaterialsFor) deliberately shares ONE
  // material set per realm trim color across every standee mounted from the same board — cheap, and
  // correct for a static plinth tint. Turning a SINGLE acting standee's base gold via that shared
  // object would light up every OTHER standee sharing the same trim color too. Clone once per base
  // mesh here so setActingUnit's glow toggle only ever touches THIS standee's own materials.
  const mats = interiorBaseMaterialsFor(trimHex).map((m) => m.clone());
  const mesh = new THREE.Mesh(geo, mats);
  mesh.position.set(0, 0, 0);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.userData.standeeBase = true; // verify-bw2-2's per-standee base-count check
  mesh.userData.supportForm = "shallow-rounded-strip";
  mesh.userData.supportWidth = width;
  mesh.userData.supportDepth = depth;
  mesh.userData.supportHeight = INTERIOR_BASE_HEIGHT;
  return mesh;
}
// setBaseGlow(mesh, glowing) — BW2-2b item 3: toggles the acting-standee "your turn" plinth glow by
// writing straight to each of the base's own (per-instance-cloned, see buildInteriorBase above)
// materials' `emissive` channel — MeshLambertMaterial supports emissive self-illumination but has no
// `emissiveIntensity` knob (that's a MeshStandardMaterial-only field), so a flat on/off hex swap is the
// whole mechanism; combined with the existing gold acting ring (ACTING_RING_MAT) this reads as "ring +
// glowing plinth together" per the spec. Null-safe (a non-interior figure has no base mesh at all).
function setBaseGlow(mesh, glowing){
  if(!mesh || !mesh.material) return;
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach((m) => { if(m && m.emissive) m.emissive.setHex(glowing ? BASE_GLOW_EMISSIVE_HEX : 0x000000); });
}

// ---- split B7 chunk boundary: THE KILTER (kilterFor + KILTER_YAW_DEG + KILTER_POS_FRAC) stays in
// theater-boot.js — dev/verify-d4-doors.mjs text-extracts all three from the root. ----

// CL-R2 follow-up — VISIBLE SUPPORT COLLISION. Tactical occupancy remains owned by the board/query
// layer; this pass only prevents two rendered standee strips from occupying the same physical space.
// Each support is an oriented rectangle (the standee yaw rotates it). A small deterministic
// minimum-translation push moves the later-mounted piece along the shallowest separating axis,
// exactly like nudging two board pieces apart without changing either piece's logical square.
const STANDEE_SUPPORT_CLEARANCE = 0.035;
function standeeSupportObb(fig){
  if(!fig || !fig.userData) return null;
  const width = Number(fig.userData.interiorBaseWidth);
  const depth = Number(fig.userData.interiorBaseDepth);
  if(!(width > 0) || !(depth > 0)) return null;
  const yaw = Number.isFinite(fig.userData.claySupportWorldYaw)
    ? fig.userData.claySupportWorldYaw
    : (fig.rotation ? fig.rotation.y || 0 : 0);
  return {
    fig: fig,
    cx: fig.position.x,
    cz: fig.position.z,
    halfWidth: width * 0.5 + STANDEE_SUPPORT_CLEARANCE * 0.5,
    halfDepth: depth * 0.5 + STANDEE_SUPPORT_CLEARANCE * 0.5,
    widthAxis: { x: Math.cos(yaw), z: -Math.sin(yaw) },
    depthAxis: { x: Math.sin(yaw), z: Math.cos(yaw) }
  };
}
function standeeSupportRadiusOn(obb, axis){
  return obb.halfWidth * Math.abs(obb.widthAxis.x * axis.x + obb.widthAxis.z * axis.z)
    + obb.halfDepth * Math.abs(obb.depthAxis.x * axis.x + obb.depthAxis.z * axis.z);
}
function standeeSupportPenetration(a, b){
  if(!a || !b) return null;
  const dx = b.cx - a.cx, dz = b.cz - a.cz;
  const axes = [a.widthAxis, a.depthAxis, b.widthAxis, b.depthAxis];
  let best = null;
  for(let i = 0; i < axes.length; i++){
    const axis = axes[i];
    const signedDistance = dx * axis.x + dz * axis.z;
    const overlap = standeeSupportRadiusOn(a, axis) + standeeSupportRadiusOn(b, axis) - Math.abs(signedDistance);
    if(overlap <= 0) return null;
    if(!best || overlap < best.overlap){
      best = { axis: axis, overlap: overlap, signedDistance: signedDistance };
    }
  }
  return best;
}
function standeeCollisionSign(a, b, penetration){
  if(Math.abs(penetration.signedDistance) > 0.000001) return penetration.signedDistance < 0 ? -1 : 1;
  const aKey = String(a.fig.userData.sceneObjectId || a.fig.userData.unitId || a.fig.userData.spriteSlug || "");
  const bKey = String(b.fig.userData.sceneObjectId || b.fig.userData.unitId || b.fig.userData.spriteSlug || "");
  return (hashSeed(aKey + "->" + bKey) & 1) ? 1 : -1;
}
function mountedStandeeFigures(){
  const figures = [];
  function visit(root){
    if(!root || typeof root.traverse !== "function") return;
    root.traverse(function(node){
      if(!node || !node.userData || !node.userData.sprite || node.userData.standeeCollisionExcluded) return;
      if(node.userData.interiorBaseWidth > 0 && node.userData.interiorBaseDepth > 0) figures.push(node);
    });
  }
  visit(S.interiorGroup);
  visit(S.unitGroup);
  return figures;
}
function resolveMountedStandeeSupportCollisions(){
  const figures = mountedStandeeFigures();
  let relocations = 0, checkedPairs = 0;
  // Later-mounted pieces move; earlier pieces remain stable. Repeating the ordered sweep handles a
  // piece that needs to clear two neighbors without introducing random or frame-dependent motion.
  for(let pass = 0; pass < 12; pass++){
    let movedThisPass = false;
    for(let i = 1; i < figures.length; i++){
      for(let j = 0; j < i; j++){
        const a = standeeSupportObb(figures[j]), b = standeeSupportObb(figures[i]);
        checkedPairs++;
        const hit = standeeSupportPenetration(a, b);
        if(!hit) continue;
        const sign = standeeCollisionSign(a, b, hit);
        const push = hit.overlap + 0.001;
        figures[i].position.x += hit.axis.x * push * sign;
        figures[i].position.z += hit.axis.z * push * sign;
        figures[i].userData.standeeCollisionNudgeX =
          (figures[i].userData.standeeCollisionNudgeX || 0) + hit.axis.x * push * sign;
        figures[i].userData.standeeCollisionNudgeZ =
          (figures[i].userData.standeeCollisionNudgeZ || 0) + hit.axis.z * push * sign;
        figures[i].userData.standeeCollisionRelocated = true;
        relocations++;
        movedThisPass = true;
      }
    }
    if(!movedThisPass) break;
  }
  let remainingOverlaps = 0;
  for(let i = 1; i < figures.length; i++){
    for(let j = 0; j < i; j++){
      if(standeeSupportPenetration(standeeSupportObb(figures[j]), standeeSupportObb(figures[i]))){
        remainingOverlaps++;
      }
    }
  }
  S.standeeCollisionAudit = {
    pieces: figures.length,
    checkedPairs: checkedPairs,
    relocations: relocations,
    remainingOverlaps: remainingOverlaps
  };
  S.standeeCollisionDirty = false;
}

// The soft pool is deliberately a little larger than the physical strip and biased slightly behind
// it. The dense core still touches the support, while the feather remains visible instead of being
// completely hidden by the base. Sync runs whenever billboards face the camera, so movement,
// collision relocation, and inspection yaw can never leave the pool behind.
function syncStandeeContactBlob(fig){
  if(!fig || !fig.userData || !fig.userData.contactBlobMesh) return;
  const blob = fig.userData.contactBlobMesh;
  const yaw = Number.isFinite(fig.userData.claySupportWorldYaw)
    ? fig.userData.claySupportWorldYaw
    : (fig.rotation ? fig.rotation.y || 0 : 0);
  const depth = Number(fig.userData.interiorBaseDepth) || 0.33;
  const offset = Math.min(0.12, Math.max(0.045, depth * 0.24));
  blob.position.x = fig.position.x + Math.sin(yaw) * offset;
  blob.position.z = fig.position.z + Math.cos(yaw) * offset;
  if(Number.isFinite(fig.userData.claySupportSurfaceY)){
    blob.position.y = fig.userData.claySupportSurfaceY + INTERIOR_POOL_Y_OFFSET;
  }
  blob.rotation.order = "YXZ";
  blob.rotation.x = -Math.PI / 2;
  blob.rotation.y = yaw;
  blob.userData.contactOffset = offset;
  blob.userData.linkedSceneObjectId = fig.userData.sceneObjectId || fig.userData.unitId || null;
}

// BW2-2 ADDENDUM (Adam, mid-flight review — "the contact shadow... really sells the illusion"): the
// contact pool is a SOFT RADIAL MULTIPLY quad, replacing VP7's flat hard-edged disc. The texture is
// opaque white at its rim (multiply identity) and falls toward dark gray at contact. THREE's
// MultiplyBlending therefore computes `floor * pool` after the floor has already received ambient and
// diegetic shadow: the contact patch remains darker than an already-shadowed tread instead of merely
// painting a second flat black value over it. ONE shared gradient CanvasTexture (never a per-standee
// canvas — the gradient SHAPE is identical everywhere; only the quad's own world-space SCALE differs
// per standee footprint), linear-filtered (SPRITE PURITY's nearest-only rule guards CHARACTER pixels —
// buildSpriteBillboardMesh's own header comment names the exemption for exactly this kind of
// non-character ground shadow/blob quad).
let INTERIOR_POOL_TEXTURE = null;
function interiorPoolTexture(){
  if(INTERIOR_POOL_TEXTURE) return INTERIOR_POOL_TEXTURE;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  // total-function discipline (every other texture builder in this file — interiorMaterialTexture,
  // dressingPlaceholderTexture — degrades cleanly rather than throwing): a jsdom harness with no native
  // `canvas` npm package installed returns ctx===null (a real browser/Chrome, the only place this ever
  // actually renders, always resolves a working 2D context) — skip the paint rather than crash, and
  // hand back an untextured (but still valid) CanvasTexture so interiorBuildPieces/setUnits' pool-mount
  // call sites never need their own null-guard.
  const ctx = canvas.getContext && canvas.getContext("2d");
  if(ctx && typeof ctx.createRadialGradient === "function"){
    // White is the multiply identity, so the square quad disappears completely outside the soft pool.
    // Gray—not alpha—owns the occlusion strength. This keeps the result load-bearing in both lit and
    // already-shadowed floor values; the contact core multiplies either value down proportionally.
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, size, size);
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgb(64,64,64)");      // 0.25× at the hidden center beneath the standee
    grad.addColorStop(0.46, "rgb(92,92,92)");   // dense contact band hugging the support
    grad.addColorStop(0.72, "rgb(170,170,170)");// readable occlusion just beyond the base edge
    grad.addColorStop(1, "rgb(255,255,255)");   // exact multiply identity at the rim
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; // deliberately NOT nearestify() — SPRITE PURITY's carve-out for non-character ground shadows
  tex.userData.contactMultiplyMap = true;
  INTERIOR_POOL_TEXTURE = tex;
  return tex;
}
const INTERIOR_POOL_GEO_CACHE = {};
function interiorPoolGeoFor(radius){
  const key = radius.toFixed(3);
  if(!INTERIOR_POOL_GEO_CACHE[key]) INTERIOR_POOL_GEO_CACHE[key] = new THREE.PlaneGeometry(radius * 2, radius * 2);
  return INTERIOR_POOL_GEO_CACHE[key];
}
let INTERIOR_POOL_MAT = null;
function interiorPoolMaterial(){
  if(!INTERIOR_POOL_MAT){
    INTERIOR_POOL_MAT = new THREE.MeshBasicMaterial({
      map: interiorPoolTexture(),
      transparent: false,
      blending: THREE.MultiplyBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false
    });
    INTERIOR_POOL_MAT.userData.contactBlendMode = "multiply";
  }
  return INTERIOR_POOL_MAT;
}
// BEAUTY-WAVE.md VP7 (CONTACT GROUNDING), BW2-2-upgraded: interior pieces + combat units + large
// dressing cards get one soft contact pool each (reuse, don't reinvent). `texWidth` is the standee/
// card's own rendered world-space width (radius = texWidth*0.4, unchanged from VP7 — a hair under half
// its footprint); the POOL itself extends further per the addendum ("feather extends ~1.6x the base
// radius"). `floorTop` (BW2-2) replaces the old hardcoded y=-0.495 — the pool now seats a hair above
// THIS cell's own real floor surface (never the bare -0.5 plane), below every base's own +INTERIOR_BASE_Y_OFFSET
// so the two never z-fight.
const INTERIOR_POOL_Y_OFFSET = 0.003;
function addInteriorContactBlob(group, x, z, texWidth, floorTop, texDepth){
  if(!group) return null;
  const footprint = Math.max(0.05, (texWidth || 1) * 0.48);
  const poolRadius = footprint * 1.55;
  const mesh = new THREE.Mesh(interiorPoolGeoFor(poolRadius), interiorPoolMaterial());
  mesh.rotation.x = -Math.PI / 2;
  if(Number.isFinite(texDepth) && texDepth > 0){
    // Keep the feather tied to the natural standee strip instead of restoring a circular token
    // silhouette in shadow. Geometry remains shared; scale alone makes the pool elliptical.
    mesh.scale.y = Math.max(0.18, texDepth / Math.max(0.001, texWidth || 1));
  }
  const y = (typeof floorTop === "number" ? floorTop : ITR_FLOOR_BASE_Y + ITR_FLOOR_HEIGHT_FALLBACK) + INTERIOR_POOL_Y_OFFSET;
  mesh.position.set(x, y, z);
  mesh.userData.contactBlob = true; // verify-dungeon-interior's per-piece blob-count check
  mesh.userData.contactWidth = texWidth;
  mesh.userData.contactDepth = Number.isFinite(texDepth) ? texDepth : texWidth;
  mesh.userData.contactPoolDiameter = poolRadius * 2;
  mesh.userData.contactBlendMode = "multiply";
  mesh.userData.contactMultiplyIdentityRim = true;
  mesh.renderOrder = 2;
  group.add(mesh);
  return mesh;
}

export {
  INTERIOR_BASE_HEIGHT, INTERIOR_BASE_TREAD_DEPTH, INTERIOR_BASE_Y_OFFSET, BASE_GLOW_EMISSIVE_HEX,
  interiorTacticalSpanFor, interiorStandeeSupportMetrics, interiorBaseGeoFor, interiorBaseMaterialsFor,
  interiorStandeeContactY, buildInteriorBase, setBaseGlow,
  STANDEE_SUPPORT_CLEARANCE, standeeSupportObb, standeeSupportRadiusOn, standeeSupportPenetration,
  standeeCollisionSign, mountedStandeeFigures, resolveMountedStandeeSupportCollisions,
  syncStandeeContactBlob,
  interiorPoolTexture, interiorPoolGeoFor, interiorPoolMaterial,
  INTERIOR_POOL_Y_OFFSET, addInteriorContactBlob
};
