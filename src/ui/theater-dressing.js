/* THEATER DRESSING — the DRESSING / PROPS / SET-PIECE family of the interior realizer: the
   dressing-card texture channel (the synchronous placeholder label-card and the async real-art
   settle that replays the board), the card/extrusion/furniture builders and their per-realm panel
   textures, the wall-hang placement law, BW2-2b's wall-contact AO, and the four group builders
   setInteriorBoard mounts a dressed room from — interiorBuildPieces (the room's true-scale creature
   standees), interiorBuildDressing (the cards), interiorBuildFurniture (the BW2-5 volume channel) and
   interiorBuildWallProps (the extrusion props) — extracted VERBATIM from src/ui/theater-boot.js in
   split step B8 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   THE PROTECTED CONTRACTS THIS FILE CARRIES: every authored number moved byte-identically —
   CARD_SIZE_BY_KIND small 0.6 / medium 1.0 / large 1.6, the 0.95 wall-height cap on a piece, the
   alpha-cutout law (alphaTest 0.5, DoubleSide on cards, depthWrite:true) and the SPRITE PURITY
   exemption (userData.psxExempt — dressing art never routes through applyPsxShaderTweaks), the
   cast-shadow silhouette (customDepthMaterial off the same texture, receiveShadow:false),
   WALL_AO_SCALE 1.6 / WALL_AO_Z_OFFSET -0.02, ITR_WALLHANG_HEIGHT_FRAC 0.5 /
   ITR_WALLHANG_WALL_OFFSET 0.5 / ITR_WALLHANG_FALLBACK_WALL_HEIGHT 2, the ITR_WALL_SIDE_YAW and
   ITR_WALL_SIDE_NORMAL tables, the 0.04-margin edge-pixel ring itrPropEdgeColorFor samples, the
   BoxGeometry material-group order (art on +z, index 4), the 0.09 furniture panel grain, and the
   "back face on the wall plane" mesh.position.z = depth/2 convention. Every mount in this file still
   goes through the (cx,cz) origin subtraction (the v3 card bug class), and every floor contact still
   derives from interiorFloorTopAt — never a hardcoded plane.

   THE ASYNC REPLAY LAW (dressingTextureFor's real-art settle) moved BYTE-IDENTICALLY, guards
   included: on a successful assets/dressing/<slug>.png load the cache entry is swapped in place, the
   census records "resolved", and then — and only then — `S.mounted && S.lastBoard` gates the replay,
   routing an interior3d board back through setInteriorBoard and a flat (ENV-2 biome-scatter) board
   back through setBoard, each after nulling S.boardKey so the identical-payload skip cannot swallow
   the replay. A retired theater (S.mounted false) still cannot be resurrected by a late texture, and
   a failed load still keeps the placeholder forever, never retried, never thrown. Both root entry
   points arrive through ctx as the SAME function objects the root calls, so the replay lands in the
   identical place.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as every B1-B7 module): this module NEVER
   imports theater-boot.js. Capabilities arrive ONCE via dressingInit(ctx) into the module-local
   mirrors below, so every moved body keeps its bare identifiers. It DOES read and write the live
   theater state record (S.mounted / S.lastBoard / S.boardKey / S.standeeCollisionDirty), so the root
   also calls dressingSyncState(S) at BOTH `S = createTheaterState()` reassignment sites, beside the
   existing clayRoomSyncState / lightLabSyncState / postSyncState / lightingSyncState / motesSyncState
   / cameraSyncState / occlusionSyncState / standeeMountSyncState / spritesSyncState /
   overlaysSyncState calls.

   THIS MODULE IS A LEAF-LEVEL PEER, NOT A ROOT — five one-way leaf->leaf import edges, all censused
   acyclic, all spelled with the IDENTICAL specifier theater-boot.js uses for the same file so both
   resolve to the ONE cached module instance:
     - src/ui/theater-interior-mesh.js for interiorFileTexture (furniturePanelMaterial's folded
       PACKET-02 face-tile path — the SAME loader, the SAME cache, the SAME pending counter the
       walls/floors use). That module imports only "three" and reads nothing here.
     - src/ui/theater-sprites.js for interiorSpriteBillboard (interiorBuildPieces' VP1 TRUE-SCALE
       sizing). theater-sprites.js reads NOTHING from this file.
     - src/ui/theater-standee-mount.js for interiorStandeeSupportMetrics / buildInteriorBase /
       interiorStandeeContactY / addInteriorContactBlob (the plinth + contact line + pool a piece
       mounts with) and interiorPoolGeoFor / interiorPoolMaterial (addWallContactAO reuses the pool's
       SHARED geometry cache and its SINGLE material instance — that module's own header records this
       edge and is why the AO was left for this step). It imports only "three".
     - src/ui/theater-occlusion.js for itrBlockerNudgeCell / itrClipNudgeFor / CLIP_DRESSING_EPSILON
       (the BW2-4b blocker-cell exclusion and the CLIP MARGIN LAW). It is censused THREE-free and
       reads nothing here.
     - src/ui/standee-verbs.js for bindStandeeCtx / startIdleBreathe (VP6 item 1's mount-time
       idle-breathe on every living piece) — the identical specifier the root uses.

   SCHEDULER LAW (the brief's §Protected contracts): this module owns NO requestAnimationFrame loop
   (censused: zero). The MF-2 spawn/despawn GRACE GLUE (mfArtMaterialsOf / mfSetMaterialsOpacity /
   mfMountGraceFor / mfDespawnGraceFor / mfCascadeMount) deliberately STAYED IN THE ROOT — censused:
   mfMountGraceFor and mfDespawnGraceFor have live ROOT callers in setUnits (the combat-figure
   despawn diff and the new-unit mount), so the family is figure-grace glue shared by two channels,
   not dressing-owned. The three cascade call sites here reach it as the ctx entry mfCascadeMount, so
   the seeded stagger is still computed ONCE per set by the SAME function, off the SAME
   seededCascadeDelays / DRESSING_CASCADE_STEP_MS / DRESSING_CASCADE_CAP_MS imported from
   ./spawn-grace.js by the root with the identical specifier, and every grace tween still rides the
   shared S.tweens channel through the root's own startTweenLoop. Nothing was unified; nothing was
   re-cadenced.

   `document`, `theaterCensusRecord`, `furnitureFor`, `INTERIOR_TILE_KITS`, `textureFaceFor`,
   `materialTexturePixels` and `MATERIAL_TEXEL_PX` stay BARE GLOBALS exactly as in the monolith
   (a DOM global, src/state.js's classic recorder, and the classic <script> src/ui/theater-interior.js
   / src/ui/theater-materials.js declarations republished onto `window` for this sealed ES-module
   scope). Resolved the identical way, from the identical place. dressingPlaceholderTexture's
   total-function degradation is unchanged: a jsdom harness with no 2D canvas backend still yields a
   valid (if unpainted) CanvasTexture rather than a throw.

   ROOT-OWNED, DELIBERATELY NOT MOVED (censused — they arrive through ctx instead):
     spriteEntryFor — the registry JOIN. HARD PIN: two RED-FIRST harnesses MUTATE its body inside
       theater-boot.js's own source text and re-import the mutated root (dev/verify-theater-sprites.mjs
       stubs the `e.status !== "cut"` guard; dev/verify-sprite-join.mjs stubs the TIER 1
       SPRITE_BY_BESTIARY_ID guard). B7 left it root for exactly that reason; it stays.
     kilterFor + interiorFloorTopAt — THE KILTER and the FLOOR half of the contact law. HARD PIN:
       dev/verify-d4-doors.mjs text-extracts both from theater-boot.js's own source and evals them
       beside the door builders. The whole DOOR/KIT family (53 extracted symbols) stays root this step
       for the same reason — see this step's report.
     SPRITE_UNLIT_DEBUG (window.Theater.__setSpriteUnlitDebug flips it live) and
       ITR_SPRITE_EMISSIVE_TINT (setBoard resets it to white, setInteriorBoard writes the realm grade)
       — two mutable root `let`s ALREADY read through B7's accessors by theater-sprites.js. The two
       builders here that keep their own copy of the same branch (buildDressingCard and
       buildExtrusionProp — theater-sprites.js's own header names them) read them LIVE through this
       module's dressingCtxUnlitDebug / dressingCtxEmissiveTint accessors.
     LIGHT_TUNABLES — passed as the SAME object reference the Light Lab mutates, so
       LIGHT_TUNABLES.spriteEmissiveFloor still reads live.
     _censusBoardSceneKind / buildTheaterCtx / setBoard / setInteriorBoard / applyPsxShaderTweaks /
       nearestify / textureLoader / mfCascadeMount — root-owned with many non-dressing readers.
     interiorBuildDecals — NOT here: censused as already moved in split B7 to
       src/ui/theater-overlays.js (the decal channel travelled with the overlay family).

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init/sync prologue below,
   the one `split B8` chunk-boundary note marking where the MF-2 grace glue was left behind in the
   root, the trailing `export {...}` block, and FOUR accessor-swap lines — the two
   `SPRITE_UNLIT_DEBUG` branch heads and the two `ITR_SPRITE_EMISSIVE_TINT` emissive fields named
   above, each carrying its own inline `split B8` note. Every other moved production line is
   byte-identical to the monolith. */
import * as THREE from "three";
// leaf->leaf (censused acyclic; identical specifiers to theater-boot.js's own) — see the header.
import { interiorFileTexture } from "./theater-interior-mesh.js";
import { interiorSpriteBillboard } from "./theater-sprites.js";
import {
  interiorStandeeSupportMetrics, interiorStandeeContactY, buildInteriorBase, addInteriorContactBlob,
  interiorPoolGeoFor, interiorPoolMaterial
} from "./theater-standee-mount.js";
import { itrBlockerNudgeCell, itrClipNudgeFor, CLIP_DRESSING_EPSILON } from "./theater-occlusion.js";
import { bindStandeeCtx, startIdleBreathe } from "./standee-verbs.js";

// ---- root-capability mirrors (wired once by dressingInit; S re-synced by dressingSyncState) ----
let S;
let LIGHT_TUNABLES, _censusBoardSceneKind, applyPsxShaderTweaks, buildTheaterCtx, interiorFloorTopAt,
    kilterFor, mfCascadeMount, nearestify, setBoard, setInteriorBoard, spriteEntryFor, textureLoader;
let dressingCtxUnlitDebug, dressingCtxEmissiveTint;

export function dressingInit(ctx){
  ({ LIGHT_TUNABLES,
    _censusBoardSceneKind,
    applyPsxShaderTweaks,
    buildTheaterCtx,
    interiorFloorTopAt,
    kilterFor,
    mfCascadeMount,
    nearestify,
    setBoard,
    setInteriorBoard,
    spriteEntryFor,
    textureLoader,
    dressingCtxUnlitDebug,
    dressingCtxEmissiveTint } = ctx);
  S = ctx.S;
}

// the root reassigns `S = createTheaterState()` in mount() and retire(); this re-points the mirror at
// the SAME live record, exactly as every other split module does.
export function dressingSyncState(nextS){ S = nextS; }

// GRAPHICS-ENGINE.md GR2 (dressing cards): texture cache keyed by dressing slug — either a
// synchronously-generated placeholder label-card CanvasTexture (art doesn't exist yet — DRESSING-GEN
// runs in the codex after this unit) or, once assets/dressing/<slug>.png resolves, the real loaded
// THREE.Texture swapped in in-place. Unlike SPRITE_TEXTURE_CACHE above, a cache MISS here never
// returns null — dressingTextureFor always returns a usable texture immediately (the placeholder),
// so a dressing card never silently fails to mount pending an async load; see dressingTextureFor's
// own header comment for the swap-on-load mechanics.
const DRESSING_TEXTURE_CACHE = {};

/* ---- split B8 chunk boundary: the MF-2 SPAWN/DESPAWN GRACE GLUE (mfArtMaterialsOf /
   mfSetMaterialsOpacity / mfMountGraceFor / mfDespawnGraceFor / mfCascadeMount) sits HERE in the
   monolith, between the dressing texture cache above and interiorBuildPieces below. It stayed in
   theater-boot.js — censused: setUnits calls two of them directly. mfCascadeMount arrives through
   this module's ctx; nothing else about the cascade changed. ---- */

// data.pieces -> billboard sprites standing IN the room (DUNGEON-GRAPH.md U3 iteration-2, ruling 3:
// "creatures render at true scale... standing on the floor"). Each entry {slug, cellX, cellY,
// scaleVsHuman?} joins the sprite registry, but — BEAUTY-WAVE.md VP1 fix — sizes through
// interiorSpriteBillboard's OWN true-scale math (HUMAN_TRUE_HEIGHT * scaleTrue), NOT
// buildSpriteBillboard's tabletop render-height-multiplier convention (the kaiju bug: a medium
// creature inherited several world units of TABLE height in a room where 1 unit = 5ft). `entry.floor`
// (the registry's ground-contact-line fraction, up from the image's bottom edge) offsets the quad
// down so that line — not just the image's bottom pixel row — sits on y=-0.5, the room floor plane
// (a flying/floating creature's registry entry can sit its silhouette correctly without this function
// knowing anything about flight). Returns {group, resolved, requested} so setInteriorBoard can expose
// "did every piece sprite resolve" on window.Theater for the capture rig's metrics (a piece whose slug
// doesn't join the registry, or whose texture hasn't loaded yet, silently skips — same total-function/
// never-throw discipline every other figure resolution in this file keeps).
// BW2-1b + BW2-5 integration merge: prismLists (CLIP MARGIN LAW) and daisTop (finale dais
// preferDais bias) are BOTH additive tail params — the two units landed in parallel worktrees
// and compose here.
function interiorBuildPieces(pieces, cx, cz, wallHeightBase, floorTopMap, trimColor, prismLists, daisTop){
  const group = new THREE.Group();
  // VP7 CONTACT GROUNDING: blobs live in their OWN sibling sub-group, appended to `group` once at
  // the end — NOT interleaved into `group`'s direct children — so existing/other callers walking
  // `group.children` in piece order (this function's own established contract: "same order as the
  // pieces array", relied on by dev/verify-dungeon-interior.mjs's VP1 checks) see byte-identical
  // indices to before this unit.
  const blobGroup = new THREE.Group();
  let resolved = 0;
  // BEAUTY-WAVE-4.md MF-2 item 3 (DRESSING/FURNITURE CASCADE — pieces are the room's own creatures/
  // set-pieces, the SAME "the room sets itself" mount reveal the spec names): every piece resolved
  // this pass is collected here so mfCascadeMount can rank+stagger the whole set ONCE at the end,
  // rather than each piece guessing its own delay independent of its siblings.
  const mountEntries = [];
  // 0.95 * wall height: a titanic-in-a-human-room is a SCALE-DOMAIN problem, not a rendering one —
  // this cap only keeps a piece from visibly poking through the ceiling.
  const wallCap = (typeof wallHeightBase === "number" && wallHeightBase > 0) ? wallHeightBase * 0.95 : null;
  (pieces || []).forEach((p) => {
    const base = spriteEntryFor(p.slug);
    if(!base) return;
    const entry = Object.assign({}, base, {
      scaleVsHuman: p.scaleVsHuman != null ? p.scaleVsHuman : base.scaleVsHuman
    });
    const built = interiorSpriteBillboard(entry, p.allowOverheight ? null : wallCap);
    if(!built) return; // texture not loaded yet — falls through, same as every other billboard resolution
    // BEAUTY-WAVE-2.md BW2-5 item 3: "the boss standee's cell prefers the dais top". An opt-in
    // mechanism, additive/non-breaking — a piece the caller tags `preferDais:true` with NO explicit
    // cellX/cellY defaults onto the board's own finale-room dais anchor (data.daisTop, src/ui/theater-
    // interior.js's itrDaisAnchor) when one exists; every existing caller that sets a real cellX/cellY
    // (or doesn't tag preferDais at all) behaves exactly as before.
    if(p.preferDais && p.cellX == null && p.cellY == null && Array.isArray(daisTop) && daisTop.length){
      const anchor = (p.roomSegNum != null) ? (daisTop.find((d) => d.roomSegNum === p.roomSegNum) || daisTop[0]) : daisTop[0];
      if(anchor){ p = Object.assign({}, p, { cellX: anchor.x, cellY: anchor.y }); }
    }
    const g = built.group;
    g.userData.sceneObjectId = p.sourceRef || p.id || p.slug;
    g.userData.spriteSlug = p.slug;
    // footX/footY already moved the authored contact anchor onto local origin inside the billboard.
    // Applying the legacy `floor` fraction here as well would double-offset migrated sprites.
    const floorFrac = 0;
    // BW2-4b item 7c — BLOCKER-CELL EXCLUSION: shift a piece off any pillar/doorframe cell it landed on
    // (the loop-05 wolf-on-a-pillar) to the nearest clear cell before any contact/kilter/clip math reads
    // it. prismLists = [wallList, pillarList, doorframe]; slice(1) drops walls (perimeter, handled by the
    // clip nudge). Render-only — the caller's combat cell ownership (p.cellX/Y) is never rewritten.
    const rawCellX = p.cellX || 0, rawCellY = p.cellY || 0;
    const freeCell = itrBlockerNudgeCell(rawCellX, rawCellY, (prismLists || []).slice(1));
    const cellX = freeCell.x, cellY = freeCell.y;
    // BW2-2: the ground-contact line (image-bottom when floor=0) sits on THIS cell's own real floor
    // TOP (interiorFloorTopAt — the derived law, never the bare -0.5 plane) plus its own plinth base
    // (interiorStandeeContactY) — replaces the pre-BW2-2 hardcoded "-0.5 - floorFrac*height" that
    // assumed every floor tile was paper-thin and sat exactly at y=-0.5 (it doesn't; see this file's
    // own FLOOR CONTACT LAW header comment a few screens up for the measured burial this caused).
    const floorTop = interiorFloorTopAt(floorTopMap, cellX, cellY);
    const contactY = interiorStandeeContactY(floorTop);
    // BW2-2b item 4 (THE KILTER) + CLIP MARGIN LAW (BW2-1b addendum), COMPOSED at the integration
    // merge per the spec's own ordering note ("apply kilter BEFORE his clip check runs"): the kilter
    // offsets first (hand-placed-mini read), then the clip nudge is tested AT the kiltered position
    // so a kilter that would push a wide sprite into a wall is corrected by the same pass. Both are
    // visual offsets only — cell ownership (cellX/cellY) is UNTOUCHED. The contact pool below reads
    // g.position.x/z directly, so pool/base/sprite all share the final composed offset.
    const kilter = kilterFor(p.slug + ":" + cellX + "," + cellY);
    const clipNudge = itrClipNudgeFor(cellX + kilter.dx, cellY + kilter.dz, built.width * 0.5, prismLists);
    if(clipNudge.clamped){
      console.warn("qa: sprite-oversize", { slug: p.slug, cellX, cellY, rawMagnitude: clipNudge.rawMagnitude, clampedTo: clipNudge.magnitude });
    }
    g.position.set(
      cellX - (cx || 0) + kilter.dx + clipNudge.x,
      contactY - floorFrac * built.height,
      cellY - (cz || 0) + kilter.dz + clipNudge.z // origin-shifted like every tile/light (the v3 card bug: raw cell coords rendered pieces outside the fitted frame)
    );
    g.userData.kilterYawDeg = kilter.yawDeg; // read every frame by updateSpriteBillboardYaw's face()
    // CL-R2 STANDEE SUPPORT: a natural shallow strip bounded by the tactical footprint — added as a
    // CHILD of `g`, a plain SIBLING of `g`'s own inner sprite wrap
    // (buildSpriteBillboardMesh) so BW2-2b's floor-alignment fix (updateSpriteBillboardYaw) leaves it
    // floor-flat under everyday camera tilt, while still tipping WITH the sprite when fall-death moves
    // `g`'s own rotation.x (see buildInteriorBase's own header for the full mechanism).
    const support = interiorStandeeSupportMetrics(built.width, base.size, p.tacticalSpanCells);
    const baseMesh = buildInteriorBase(support.width, support.depth, trimColor);
    g.add(baseMesh);
    g.userData.standeeBaseMesh = baseMesh; // setActingUnit's BW2-2b glow-toggle target
    g.userData.interiorTrueScale = true;
    g.userData.interiorHeight = built.height;
    g.userData.interiorWidth = built.width;
    g.userData.interiorFloorFrac = floorFrac;
    // Kept only as a legacy selection-ring size; the visible support is not circular.
    g.userData.interiorBaseRadius = support.width * 0.5;
    g.userData.interiorBaseWidth = support.width;
    g.userData.interiorBaseDepth = support.depth;
    g.userData.standeeCollisionNudgeX = 0;
    g.userData.standeeCollisionNudgeZ = 0;
    g.userData.standeeCollisionRelocated = false;
    g.userData.tacticalSpanCells = support.tacticalSpanCells;
    g.userData.stairTreadDepth = support.treadDepth;
    g.userData.stairFit = support.stairFit;
    g.userData.canonicalHeight = built.canonicalHeight;
    g.userData.oversizeClamped = built.oversizeClamped;
    g.userData.spriteLabel = p.label || base.name || p.slug;
    g.userData.spriteStressRole = p.stress || null;
    g.userData.spriteRegenRecommended = support.tacticalSpanCells >= 2
      && built.width > support.tacticalSpanCells * 0.95;
    // DUNGEON-GRAPH.md finale-gate finding: a caller may tag an interior piece with the combat foe's
    // own `fid` (o.foes[i].fid, combat.js's combatStart) so play(verb,{who:fid}) — the SAME production
    // standee-verb entry point combat damage already routes through (§A STANDEE VERBS WIRING, this
    // file's STANDEE_VERB_FOR_THEATER_VERB table) — can resolve a piece standing in an interior room,
    // not just a unit built by setUnits(). Optional/additive: a piece with no `fid` is untagged and
    // behaves exactly as before.
    if(p.fid != null) g.userData.unitId = String(p.fid);
    group.add(g);
    // VP7 CONTACT GROUNDING: one pool per piece, at the SAME (x,z) as the piece's own floor-
    // contact position — added to the sibling `blobGroup` (not as a child of `g`, and not
    // interleaved into `group`'s own direct children) so it survives at a fixed world y even if a
    // caller later re-tweens `g`'s own rotation (e.g. a tipped fall-death card, STANDEE_VERBS'
    // fall-death — the corpse keeps its ground anchor because the pool isn't parented to the
    // tilting wrapper), and existing callers walking `group.children` in piece order see no change.
    // BW2-2: seated off THIS cell's own real floor top, not the old hardcoded -0.495.
    const contactBlob = addInteriorContactBlob(
      blobGroup, g.position.x, g.position.z, support.width, floorTop, support.depth
    );
    g.userData.contactBlobMesh = contactBlob;
    // VP6 item 1: idle-breathe auto-plays on every living piece the instant it mounts (a fresh
    // fall-death corpse never reaches this — dead pieces are re-mounted by the NEXT setInteriorBoard
    // call with p.fid's own userData never carrying userData.corpse from a torn-down prior group, so
    // this is a clean re-roll for a genuinely-new mount; a corpse persisting WITHIN one mount's
    // lifetime is fall-death's own stopIdleBreathe(...,true) call, not this mount-time start).
    bindStandeeCtx(buildTheaterCtx());
    startIdleBreathe(g, p.slug + ":" + p.cellX + "," + p.cellY);
    // BEAUTY-WAVE-4.md MF-2 item 3: this piece's own mount-grace entry, keyed the SAME slug+cell
    // identity kilterFor/idle-breathe already use — staggered below, once every piece has resolved.
    mountEntries.push({ group: g, key: p.slug + ":" + cellX + "," + cellY });
    resolved++;
  });
  group.add(blobGroup);
  S.standeeCollisionDirty = true;
  mfCascadeMount(buildTheaterCtx(), mountEntries, function(entry){ return entry.key; });
  return { group, resolved, requested: (pieces || []).length };
}

// GRAPHICS-ENGINE.md GR2 §D DRESSING SYSTEM (render half) — data.dressing entries (src/engine/
// place-dressing.js's dressPlan output: {slug,x,y,primary,cardKind,roomSegNum,lightAffine?}) mount
// as upright CARDS, the same standee construction billboard pieces already use (nearestify, alpha-
// cutout, camera-facing yaw+tilt via updateSpriteBillboardYaw's face(), tagged userData.sprite so
// that function's existing "walk S.interiorGroup one level deep" scan already picks these up with
// zero changes there), shadow-casting, sized by CARD_SIZE_BY_KIND off the entry's own `cardKind`
// (small/medium/large, mirroring the manifest's own `size` field).
const CARD_SIZE_BY_KIND = { small: 0.6, medium: 1.0, large: 1.6 };
function dressingCardHeight(cardKind){
  return CARD_SIZE_BY_KIND[cardKind] != null ? CARD_SIZE_BY_KIND[cardKind] : CARD_SIZE_BY_KIND.medium;
}

// synchronously-built label-card CanvasTexture — the dev-only stand-in for a not-yet-generated
// assets/dressing/<slug>.png (DRESSING-GEN runs in the codex after this unit; see this file's own
// GR2 header note above). Small, legible, nearest-filtered (matches every other procedural texture
// this file builds, e.g. interiorPatternTexture) so it reads clearly as "placeholder art", not a
// rendering bug, at study-card distances.
function dressingPlaceholderTexture(slug){
  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#2a2a2a"; ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#c9a85c"; ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 120, 120);
  ctx.fillStyle = "#e8e8e8";
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // word-wrap the slug across a few lines — long dressing slugs (e.g. "gloom-clutter-mausoleumdoor-
  // shard") need to break somewhere to stay legible in a 128px card.
  const words = String(slug || "dressing").split("-");
  const lines = [];
  let line = "";
  words.forEach((w) => {
    const next = line ? line + "-" + w : w;
    if(next.length > 14 && line){ lines.push(line); line = w; } else { line = next; }
  });
  if(line) lines.push(line);
  const lineH = 14, startY = 64 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((ln, i) => ctx.fillText(ln, 64, startY + i * lineH));
  const tex = new THREE.CanvasTexture(canvas);
  nearestify(tex);
  return tex;
}

// mirrors spriteTextureFor's async-load/replay convention (this file's own established pattern) but
// NEVER returns null: a cache miss synthesizes+caches the placeholder immediately (so the caller's
// card mounts on the very first render pass, no pending/blank state) while a real
// assets/dressing/<slug>.png load races in the background; on success the cache entry is swapped to
// the real texture and S.lastBoard is replayed (same "null the dirty key, resend" trick), so real art
// drops in with ZERO code change the moment DRESSING-GEN's files land. A failed load just keeps the
// placeholder forever (loader that "falls back cleanly", per this unit's own brief) — never retried,
// never throws.
function dressingTextureFor(slug){
  const cached = DRESSING_TEXTURE_CACHE[slug];
  if(cached) return cached;
  const placeholder = dressingPlaceholderTexture(slug);
  DRESSING_TEXTURE_CACHE[slug] = placeholder;
  // VQ2-RESPEC.md §3 unit L2 — the synchronous name-label CanvasTexture fires HERE, on every slug's
  // first request this session; a real assets/dressing/<slug>.png (if/when it settles below) upgrades
  // the SAME slug to "resolved" separately, mirroring what actually renders on screen frame-to-frame
  // (a placeholder card first, real art once it lands — never invented as already-resolved).
  if(typeof theaterCensusRecord === "function") theaterCensusRecord("dressing", "placeholder-card", slug, _censusBoardSceneKind());
  textureLoader.load(
    "assets/dressing/" + slug + ".png",
    function(tex){
      nearestify(tex);
      DRESSING_TEXTURE_CACHE[slug] = tex;
      if(typeof theaterCensusRecord === "function") theaterCensusRecord("dressing", "resolved", slug, _censusBoardSceneKind());
      if(S.mounted && S.lastBoard && S.lastBoard.kind === "interior3d"){
        S.boardKey = null;
        setInteriorBoard(S.lastBoard);
      } else if(S.mounted && S.lastBoard && S.lastBoard.kind !== "interior3d" && Array.isArray(S.lastBoard.props)){
        // ENV-2 (docs/ENV-EXTERIOR-WAVE.md) — the flat tabletop board (setBoard, NOT setInteriorBoard;
        // no `kind` field at all — see setBoard's own comment on that) can now ALSO carry dressing
        // cards (a travel leg's biome scatter). Before this unit, this replay-on-real-art-arrival
        // trick only knew how to re-invoke setInteriorBoard — a flat board's placeholder card would
        // stay a placeholder FOREVER even after the real assets/dressing/<slug>.png finished loading,
        // since setBoard was never told to re-run. Mirrors the interior branch exactly: null the dirty
        // key so the "identical payload" skip doesn't swallow this replay, re-run the SAME last board.
        S.boardKey = null;
        setBoard(S.lastBoard);
      }
    },
    undefined,
    function(){ /* no assets/dressing/<slug>.png yet (or failed) — placeholder stays permanently */ }
  );
  return placeholder;
}

// a single dressing card group — same construction discipline as buildSpriteBillboard (SPRITE PURITY:
// psxExempt, no dither/vertex-snap on card pixels; camera-facing group, feet-at-origin, alpha-cutout
// shadow casting via a MeshDepthMaterial keyed off the same texture) — kept as its OWN function
// (not a buildSpriteBillboard call) since dressing cards resolve via dressingTextureFor (always-
// available placeholder-or-real) rather than the sprite registry's resolved-or-null join.
function buildDressingCard(entry){
  const tex = dressingTextureFor(entry.slug);
  const h = dressingCardHeight(entry.cardKind);
  const geo = new THREE.PlaneGeometry(h, h);
  // BW2-4b item 1 — LIT cutout family: dressing cards RECEIVE the scene like the standee billboards
  // (same MeshLambert + emissive readability floor, same BRIGHTNESS LAW) so a floor-clutter card in a
  // dark corner reads dim, not pasted-bright. Purity holds (lighting response only). Debug seam mirrors
  // the standee's so a full-bright reference frame captures cards unlit too.
  const mat = dressingCtxUnlitDebug() // split B8: mutable root `let` (window.Theater.__setSpriteUnlitDebug flips it live) — read through the ctx accessor
    ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true })
    : new THREE.MeshLambertMaterial({
        map: tex, emissiveMap: tex, emissive: dressingCtxEmissiveTint(), emissiveIntensity: LIGHT_TUNABLES.spriteEmissiveFloor, // split B8: mutable root `let` (setBoard resets it, setInteriorBoard writes the realm grade) — read through the ctx accessor
        transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true
      });
  mat.userData.psxExempt = true; // SPRITE PURITY — cards are flat painted art, never PS1-distorted
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = h / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
    map: tex, alphaTest: 0.5, depthPacking: THREE.RGBADepthPacking
  });
  const g = new THREE.Group();
  g.add(mesh);
  g.userData.sprite = true; // updateSpriteBillboardYaw's existing scan picks this group up unmodified
  g.userData.dressingSlug = entry.slug;
  return g;
}

// BEAUTY-WAVE-2.md BW2-5 FURNITURE CHANNEL — "mid-room verticality is FURNITURE, not columns" (the
// chrome mock's crates/cabinets/machines). Real multi-prism BoxGeometry assemblies (furnitureFor(kind,
// realm), src/ui/theater-interior.js — the shared builder ROOM-GRAMMAR.md §4 names as its own
// dependency), textured per PACKET-02's planar-face law (textureFaceFor(realm,face) || the procedural
// panel fallback below — PACKET-02's crate-face arrivals haven't landed yet).
const FURNITURE_PANEL_TEXTURE_CACHE = {};
function proceduralPanelTexture(realm, face, baseColorHex){
  const key = realm + ":" + face + ":" + baseColorHex;
  if(FURNITURE_PANEL_TEXTURE_CACHE[key]) return FURNITURE_PANEL_TEXTURE_CACHE[key];
  const pixels = materialTexturePixels("mottle", baseColorHex, "furniture:" + key, MATERIAL_TEXEL_PX, 0.09);
  const canvas = document.createElement("canvas");
  canvas.width = pixels.width; canvas.height = pixels.height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(new ImageData(pixels.data, pixels.width, pixels.height), 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  nearestify(tex);
  FURNITURE_PANEL_TEXTURE_CACHE[key] = tex;
  return tex;
}
function furniturePanelMaterial(realm, face, baseColorHex){
  // BW2-3: textureFaceFor now returns a folded PACKET-02 face-tile FILE PATH (flagships) or null. A
  // path loads as a per-face planar ClampToEdge texture (§2b FURNITURE law — one self-contained face
  // tile per face, never wrapped); null falls back to the procedural panel painter. Same seam shape.
  const faceFile = textureFaceFor(realm, face);
  const tex = (faceFile ? interiorFileTexture(faceFile, "clamp", 1, 1) : null)
    || proceduralPanelTexture(realm, face, baseColorHex);
  return applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ map: tex }), { worldSurface: true });
}
// STAGE-A A4 (docs/STAGE-A.md §A4): `fadeOpacity` (optional, a live-interpolated number from a
// occlusion-fade entry) renders EVERY prism of this ONE furniture piece translucent+depthWrite:false at
// that opacity, mirroring the wall/pillar ghost treatment's own contract — a whole-assembly fade rather
// than a stub/ghost height split (furniture has no single "ankle" that means anything across a table/
// shelf-unit/cabinet's own varied prism heights; the geometric occlusion test itself already only fires
// when a prism's real AABB actually straddles the sightline, so an untouched, un-tall piece never fades
// at all — see itrFurnitureOcclusionBoxFor at this file's setInteriorBoard call site). Every existing
// caller omits the 2nd argument, so `isFading` is false and this function's output is byte-identical to
// before this unit for every non-A4 caller. furniturePanelMaterial always builds a FRESH material per
// call (never cached/shared across furniture pieces — see its own header), so mutating one piece's own
// materials here can never bleed opacity onto an unrelated furniture instance.
function buildFurnitureAssembly(entry, fadeOpacity){
  const recipe = furnitureFor(entry.kind, entry.realmId);
  const kit = INTERIOR_TILE_KITS ? (INTERIOR_TILE_KITS[entry.realmId] || INTERIOR_TILE_KITS.chrome) : null;
  const baseColorHex = (kit && kit.trimColor) || "#8a7a63";
  const isFading = typeof fadeOpacity === "number";
  const group = new THREE.Group();
  const materials = [];
  recipe.prisms.forEach((p) => {
    const geo = new THREE.BoxGeometry(Math.max(0.02, p.sx), Math.max(0.02, p.sy), Math.max(0.02, p.sz));
    const mat = furniturePanelMaterial(entry.realmId, p.face, baseColorHex);
    const topMat = p.topFace ? furniturePanelMaterial(entry.realmId, p.topFace, baseColorHex) : mat;
    if(isFading) Object.assign(mat, { transparent: true, opacity: fadeOpacity, depthWrite: false });
    if(isFading && topMat !== mat) Object.assign(topMat, { transparent: true, opacity: fadeOpacity, depthWrite: false });
    materials.push(mat);
    if(topMat !== mat) materials.push(topMat);
    // THREE.BoxGeometry material groups are +X, -X, +Y, -Y, +Z, -Z. A crate remains one six-sided
    // box; the top merely selects its admitted top face tile instead of inventing lid geometry.
    const mesh = new THREE.Mesh(geo, topMat === mat ? mat : [mat, mat, topMat, mat, mat, mat]);
    mesh.position.set(p.dx || 0, (p.yBase || 0) + p.sy / 2, p.dz || 0);
    mesh.castShadow = !isFading;
    mesh.receiveShadow = !isFading;
    group.add(mesh);
  });
  group.userData.furnitureKind = recipe.kind;
  group.userData.dressingSlug = entry.slug;
  group.userData.sceneObjectId = entry.slug;
  group.userData.occlusionGhost = isFading;
  group.userData.occlusionMaterials = materials; // interiorBuildFurniture's own fade-entry wiring reads this
  return group;
}
// data.furniture -> group of furniture assemblies, origin-shifted the SAME way every other interior
// mount already is (cx/cz subtraction) — feet-on-floor via the SAME FLOOR CONTACT LAW every other
// mount point reads through (interiorFloorTopAt). STAGE-A A4: `classifyFn(f)` (optional) is called once
// per furniture entry; a non-null return `{opacity}` renders this ONE piece as an occlusion ghost (its
// own live-tweened opacity), and its built materials are stashed onto the SAME fade-state entry so
// itrOcclusionClassify's tween can keep mutating them every tick with no further rebuild. Every existing
// caller omits `classifyFn`, so this degrades to byte-identical pre-A4 rendering (every prism opaque).
function interiorBuildFurniture(furniture, cx, cz, floorTopMap, classifyFn){
  const group = new THREE.Group();
  // BEAUTY-WAVE-4.md MF-2 item 3: "Dressing/FURNITURE on first room reveal" — furniture assemblies get
  // the SAME seeded stagger cascade as data.pieces/data.dressing (see mfCascadeMount's own header).
  const mountEntries = [];
  (furniture || []).forEach((f) => {
    if(!f || !f.slug) return;
    const fadeEntry = (typeof classifyFn === "function") ? classifyFn(f) : null;
    const g = buildFurnitureAssembly(f, fadeEntry ? fadeEntry.opacity : undefined);
    if(fadeEntry) fadeEntry.materials = g.userData.occlusionMaterials;
    const floorTop = interiorFloorTopAt(floorTopMap, f.x || 0, f.y || 0);
    g.position.set((f.x || 0) - (cx || 0), floorTop, (f.y || 0) - (cz || 0));
    g.userData.dressingSlug = f.slug;
    g.userData.sceneObjectId = f.slug;
    group.add(g);
    mountEntries.push({ group: g, key: f.slug + ":" + f.x + "," + f.y });
  });
  mfCascadeMount(buildTheaterCtx(), mountEntries, function(entry){ return entry.key; });
  return group;
}

// ADDENDUM — THE PROP PERSPECTIVE LAW: surface-attached props mount as real SHALLOW-EXTRUSION prisms,
// wall-LOCKED (never camera-billboarded — that's the whole bug this fixes: a billboard always faces
// the camera regardless of which wall it's mounted on, so at a fixed isometric angle a "screen" can
// read backwards). Side/back faces are EDGE-SAMPLED off the SAME art texture's own outermost opaque
// pixel ring (automatic — no second authored color source), front face is the real dressing art.
const ITR_EDGE_COLOR_CACHE = {};
function itrPropEdgeColorFor(slug, tex){
  if(ITR_EDGE_COLOR_CACHE[slug]) return ITR_EDGE_COLOR_CACHE[slug];
  let color = "#3a3a3a"; // safe neutral fallback (image not yet loaded / canvas-tainted / degenerate)
  try {
    const img = tex && tex.image;
    if(img && img.width && img.height){
      const cvs = document.createElement("canvas");
      cvs.width = img.width; cvs.height = img.height;
      const cctx = cvs.getContext("2d");
      cctx.drawImage(img, 0, 0);
      const data = cctx.getImageData(0, 0, img.width, img.height).data;
      const margin = Math.max(1, Math.round(Math.min(img.width, img.height) * 0.04));
      let r = 0, g = 0, b = 0, n = 0;
      const sample = (x, y) => {
        if(x < 0 || y < 0 || x >= img.width || y >= img.height) return;
        const i = (y * img.width + x) * 4;
        if(data[i + 3] < 40) return; // skip near-transparent — "the outermost OPAQUE ring"
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      };
      for(let x = 0; x < img.width; x++){ sample(x, margin); sample(x, img.height - 1 - margin); }
      for(let y = 0; y < img.height; y++){ sample(margin, y); sample(img.width - 1 - margin, y); }
      if(n > 0){
        const hx = (v) => Math.round(v).toString(16).padStart(2, "0");
        color = "#" + hx(r / n) + hx(g / n) + hx(b / n);
      }
    }
  } catch(e) { /* cross-origin/canvas-tainted or not-yet-loaded image — keep the safe fallback */ }
  ITR_EDGE_COLOR_CACHE[slug] = color;
  return color;
}
// front (+z local) faces AWAY from the wall the prop is mounted on, into the room — "n"/"s"/"e"/"w"
// names which side the adjacent WALL cell sits on (itrWallSideAt, src/ui/theater-interior.js).
const ITR_WALL_SIDE_YAW = { n: 0, s: Math.PI, w: -Math.PI / 2, e: Math.PI / 2 };
// LIGHT-SIGHT-POLISH.md P-2 — WALL-HANG PLACEMENT FIX. Before this, interiorBuildWallProps mounted
// every wall-hang extrusion prop at the cell CENTER, at FLOOR level, with no push toward the wall
// plane — a painting/sconce sat as a small tan box floating mid-room at floor height, showing its
// edge-sampled tan SIDE faces (the "floating rhomboid" bug). ITR_WALL_SIDE_YAW above already resolves
// the prop's ROTATION off entry.wallSide (itrWallSideAt, computed once in theater-interior.js off the
// SpatialPlan's own wall-cell mask — never re-derived here); these two knobs finish the job: lift the
// mount to wall mid-height, and push the mount point from the cell center onto the actual wall plane.
// Both named + dialable per the spec's own "Adam dials from the next re-shoot" clause.
const ITR_WALLHANG_HEIGHT_FRAC = 0.5;  // mount Y = floorTop + wallHeightBase * this fraction (mid-wall)
const ITR_WALLHANG_WALL_OFFSET = 0.5;  // half a cell (GRID LAW: cellSize=1, theater-interior.js) toward the wall
const ITR_WALLHANG_FALLBACK_WALL_HEIGHT = 2; // 10 ft; mirrors ITR_WALL_HEIGHT_BASE
// unit normal pointing FROM the cell center TOWARD the adjacent wall cell it's keyed off — same
// plan-x->world-x / plan-y->world-z axis mapping interiorBuildWallProps' own position.set already
// uses, keyed off the SAME entry.wallSide ITR_WALL_SIDE_YAW reads (one resolution, two consumers).
const ITR_WALL_SIDE_NORMAL = { n: { x: 0, z: -1 }, s: { x: 0, z: 1 }, w: { x: -1, z: 0 }, e: { x: 1, z: 0 } };
function buildExtrusionProp(entry){
  const tex = dressingTextureFor(entry.slug);
  const h = dressingCardHeight(entry.cardKind);
  const depth = Math.max(0.01, entry.depth || 0.05);
  const geo = new THREE.BoxGeometry(h, h, depth);
  const sideColorHex = itrPropEdgeColorFor(entry.slug, tex);
  // BW2-4b item 1 — LIT cutout family: the extrusion prop's FRONT (art) face receives the scene too
  // (the side faces are already MeshLambert), so a wall-hung painting/screen tracks the plunge with its
  // own edges instead of glowing full-bright off a dark wall. Purity holds (lighting response only).
  const frontMat = dressingCtxUnlitDebug() // split B8: mutable root `let` (window.Theater.__setSpriteUnlitDebug flips it live) — read through the ctx accessor
    ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, depthWrite: true })
    : new THREE.MeshLambertMaterial({
        map: tex, emissiveMap: tex, emissive: dressingCtxEmissiveTint(), emissiveIntensity: LIGHT_TUNABLES.spriteEmissiveFloor, // split B8: mutable root `let` (setBoard resets it, setInteriorBoard writes the realm grade) — read through the ctx accessor
        transparent: true, alphaTest: 0.5, depthWrite: true
      });
  frontMat.userData.psxExempt = true; // SPRITE PURITY — the art face is flat painted art, never PS1-distorted
  const sideMat = new THREE.MeshLambertMaterial({ color: sideColorHex });
  // BoxGeometry material-group order: 0:+x 1:-x 2:+y 3:-y 4:+z 5:-z — the art sits on +z (index 4)
  const mesh = new THREE.Mesh(geo, [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat]);
  mesh.position.y = h / 2;      // same "bottom edge at group origin" convention buildDressingCard keeps
  mesh.position.z = depth / 2;  // the -z (BACK) face sits flush on the wall plane; extrudes +z into the room
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ map: tex, alphaTest: 0.5, depthPacking: THREE.RGBADepthPacking });
  const g = new THREE.Group();
  g.rotation.y = ITR_WALL_SIDE_YAW[entry.wallSide] || 0;
  g.add(mesh);
  g.userData.dressingSlug = entry.slug;
  g.userData.extrusionProp = true; // deliberately NOT userData.sprite — wall-LOCKED, never camera-billboarded
  g.userData.extrusionHeight = h;   // BW2-2b integration: wall-contact AO sizes its halo off this
  return g;
}
function interiorBuildWallProps(wallProps, cx, cz, floorTopMap, wallHeightBase){
  const group = new THREE.Group();
  (wallProps || []).forEach((d) => {
    if(!d || !d.slug) return;
    const g = buildExtrusionProp(d);
    const floorTop = interiorFloorTopAt(floorTopMap, d.x || 0, d.y || 0);
    // P-2 WALL-HANG PLACEMENT FIX (LIGHT-SIGHT-POLISH.md): buildExtrusionProp's mesh is built so its
    // BACK face passes through the group's own local origin (mesh.position.z = depth/2, back face at
    // local z=0) — meaning wherever we place g.position IS the point the back face sits on. Resolve
    // the wall normal off the SAME entry.wallSide ITR_WALL_SIDE_YAW already rotated the prop with
    // (itrWallSideAt, computed once in theater-interior.js off the SpatialPlan's own wall-cell mask —
    // never re-derived/re-guessed here); push that point half a cell toward the wall so the back face
    // lands ON the wall plane instead of floating at the cell center, and lift it to wall mid-height.
    const wallNormal = ITR_WALL_SIDE_NORMAL[d.wallSide];
    if(wallNormal){
      const wallH = (typeof wallHeightBase === "number" && wallHeightBase > 0) ? wallHeightBase : ITR_WALLHANG_FALLBACK_WALL_HEIGHT;
      g.position.set(
        (d.x || 0) - (cx || 0) + wallNormal.x * ITR_WALLHANG_WALL_OFFSET,
        floorTop + wallH * ITR_WALLHANG_HEIGHT_FRAC,
        (d.y || 0) - (cz || 0) + wallNormal.z * ITR_WALLHANG_WALL_OFFSET
      );
    } else {
      // degenerate/ambiguous case (itrWallSideAt found no adjacent WALL cell — rare, per its own
      // comment) — never throw; keep the PRE-FIX placement (floor level, cell center, no push) and
      // log so it's visible in QA rather than silently producing a still-floating prop.
      console.warn("qa: wallhang-no-wallside", d.slug, d.x, d.y);
      g.position.set((d.x || 0) - (cx || 0), floorTop, (d.y || 0) - (cz || 0));
    }
    // BW2-2b item 5b (wired here at the integration merge): WALL-CONTACT AO now attaches to the
    // EXTRUSION prop, not the old flat wall-hang card — BW2-5 rerouted wall-hangs through this
    // builder (interiorBuildDressing skips primary:"wall-hang" entirely), which made BW2-2b's
    // original in-loop AO call dead code. The AO halo mounts as a child of the extrusion group,
    // sitting a hair behind the prop's back face (the wall plane) so it reads as the seam shadow
    // hugging where the object meets the wall — exactly the mock's painting vignette, and per the
    // extrusion addendum's own coordination note ("your extrusion gives that band a real volume
    // edge to hug"). Still valid after the P-2 reposition above: the AO quad is a CHILD of g, mounted
    // in g's own local space, so it rides along with whatever world position/rotation g now has.
    addWallContactAO(g, (g.userData && g.userData.extrusionHeight) || 1, 0.005);
    group.add(g);
  });
  return group;
}

// data.dressing -> group of dressing card standees, origin-shifted the SAME way tiles/lights/pieces
// already are (the v3 card bug class this unit's own brief calls out by name: raw cell coords render
// outside the fitted camera frame — every mount in this function goes through the (cx,cz) subtraction,
// no exceptions).

// BW2-2b item 5b — WALL-CONTACT AO. Every wall-hung dressing card (REALM_DRESSING roster entries
// tagged `primary:"wall-hang"` in src/engine/place-dressing.js — paintings, the chrome broken-screen,
// wall clutter) gets a soft dark gradient card mounted directly BEHIND its own billboard at the
// attachment seam, per Adam's read of the mock's painting ("a soft dark vignette hugging the wall
// around the frame"): "same CanvasTexture-gradient channel as the pool" (the spec's own words) —
// interiorPoolGeoFor/interiorPoolMaterial ARE that channel, reused verbatim rather than a second
// texture/material path. The pool rotates that same PlaneGeometry flat (-90 deg on X) to lie on the
// floor; this quad leaves it in its AUTHORED orientation (facing +Z, buildSpriteBillboard's own
// convention) and mounts it as a CHILD of the card's own billboard group at a small negative local Z —
// "behind" the card in the group's own local frame, which rides along with whatever camera-facing
// yaw+tilt updateSpriteBillboardYaw gives the PARENT group every frame (this AO quad is a grandchild,
// never independently tagged userData.sprite, so it never gets its own separate facing pass — it just
// inherits the parent's transform for free, always reading as flush behind the card from every yaw
// step). Sized larger than the card so it "halos" past the card's own edges rather than reading as a
// hard-edged rectangle. Cheap: one extra quad per wall-hang, no SSAO pass.
const WALL_AO_SCALE = 1.6;     // same multiplier as the pool's own feather-extent (footprint x 1.6)
const WALL_AO_Z_OFFSET = -0.02;
function addWallContactAO(cardGroup, cardHeight, zOffset){
  const radius = Math.max(0.05, (cardHeight || 1) * 0.5 * WALL_AO_SCALE);
  const mesh = new THREE.Mesh(interiorPoolGeoFor(radius), interiorPoolMaterial());
  // zOffset: flat billboard cards sit at local z=0 with the camera-facing pass yawing the group, so
  // "behind the card" is NEGATIVE local z (the original -0.02). An EXTRUSION prop's back face sits ON
  // the wall plane at local z=0 with the room toward +z, so its seam halo must sit a hair in FRONT of
  // the wall (+0.005) to be visible around the prop's silhouette — the caller picks per mount type.
  mesh.position.set(0, (cardHeight || 1) / 2, (typeof zOffset === "number") ? zOffset : WALL_AO_Z_OFFSET);
  mesh.userData.wallContactAO = true; // verify hook — per-wall-hang AO presence/count check
  cardGroup.add(mesh);
  return mesh;
}
function interiorBuildDressing(dressing, cx, cz, floorTopMap, prismLists){
  const group = new THREE.Group();
  // VP7 CONTACT GROUNDING: same sibling-subgroup convention as interiorBuildPieces' blobGroup
  // (below) — blobs never interleave into `group`'s own direct children.
  const blobGroup = new THREE.Group();
  // BEAUTY-WAVE-4.md MF-2 item 3: dressing cards get the SAME seeded stagger cascade as
  // data.pieces/data.furniture — "the room sets itself" applies to every set-piece family.
  const mountEntries = [];
  (dressing || []).forEach((d) => {
    if(!d || !d.slug) return;
    // BW2-5: blocker-primary entries render as furniture-class volumes (interiorBuildFurniture,
    // off the sibling data.furniture array) and wall-hang entries as extrusion props
    // (interiorBuildWallProps, off data.wallProps) — both derived from this SAME dressing roll, so
    // skip them here to avoid mounting the same entry twice.
    if(d.primary === "blocker" || d.primary === "wall-hang") return;
    const g = buildDressingCard(d);
    // BW2-2: feet on THIS cell's own real floor top (interiorFloorTopAt — the derived law), replacing
    // the pre-BW2-2 hardcoded -0.4 (that value's own comment falsely claimed parity with pieces' -0.5
    // convention — it was actually 0.1 units higher, and still 0.1 below the true nominal floor top;
    // see this file's FLOOR CONTACT LAW header for the measured numbers). Dressing gets NO plinth base
    // (per the mock, ui-sketches/mock-frames/mock-01-gloom-combat.png — only combat-representing
    // standees carry a base; a tombstone/torch/painting sits directly on the floor).
    const floorTop = interiorFloorTopAt(floorTopMap, d.x || 0, d.y || 0);
    // CLIP MARGIN LAW (Adam addendum, mid-flight on BW2-1b), item 2 — LARGE cards only ("every
    // interior piece + large dressing card" is VP7's own existing large-only carve-out, reused
    // here): may TOUCH the wall plane (that's the point, dpAdjacentToWall already seeds it there) but
    // never pass THROUGH it — resolved via the SAME itrClipNudgeFor circle-vs-prism push, radius
    // inflated by CLIP_DRESSING_EPSILON so the card's own true edge clears the wall face by a hair
    // (no magnitude cap/warning: a wall-adjacent card's own overlap is always small by construction).
    let dressNudge = { x: 0, z: 0 };
    if(d.cardKind === "large"){
      dressNudge = itrClipNudgeFor((d.x || 0), (d.y || 0), dressingCardHeight(d.cardKind) / 2 + CLIP_DRESSING_EPSILON, prismLists, { maxMag: 1 });
    }
    g.position.set((d.x || 0) - (cx || 0) + dressNudge.x, floorTop, (d.y || 0) - (cz || 0) + dressNudge.z);
    group.add(g);
    // VP7 CONTACT GROUNDING: large dressing cards only (§VP7: "every interior piece + large
    // dressing card") — small/medium cards (crates, wall clutter) stay floater-free by spec.
    if(d.cardKind === "large"){
      addInteriorContactBlob(blobGroup, g.position.x, g.position.z, dressingCardHeight(d.cardKind), floorTop);
    }
    mountEntries.push({ group: g, key: d.slug + ":" + d.x + "," + d.y });
  });
  group.add(blobGroup);
  mfCascadeMount(buildTheaterCtx(), mountEntries, function(entry){ return entry.key; });
  return group;
}

export {
  DRESSING_TEXTURE_CACHE, dressingTextureFor, dressingPlaceholderTexture,
  CARD_SIZE_BY_KIND, dressingCardHeight, buildDressingCard,
  FURNITURE_PANEL_TEXTURE_CACHE, proceduralPanelTexture, furniturePanelMaterial,
  buildFurnitureAssembly, interiorBuildFurniture,
  ITR_EDGE_COLOR_CACHE, itrPropEdgeColorFor,
  ITR_WALL_SIDE_YAW, ITR_WALL_SIDE_NORMAL,
  ITR_WALLHANG_HEIGHT_FRAC, ITR_WALLHANG_WALL_OFFSET, ITR_WALLHANG_FALLBACK_WALL_HEIGHT,
  buildExtrusionProp, interiorBuildWallProps,
  WALL_AO_SCALE, WALL_AO_Z_OFFSET, addWallContactAO,
  interiorBuildPieces, interiorBuildDressing,
};
