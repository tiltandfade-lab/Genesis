/* THEATER INTERIOR REALIZE — the INTERIOR (diorama/tray) REALIZER: setInteriorBoard and
   setInteriorVariant, together with VQ2-RESPEC §4 unit F1's combat floor-grid overlay
   (f1CombatGridTexture / f1BuildCombatGrid) and the clay-diagnostic lighting identity
   (interiorLightingIdentityFor) — extracted from src/ui/theater-boot.js in split step B9
   (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   THIS IS ONE OF THE TWO SCENE REALIZERS. Its peer is src/ui/theater-tabletop.js (setBoard/setUnits).
   They are PEERS, not layers: neither imports the other, and every capability they share is reached
   through the SAME leaf modules with the SAME specifiers, so both channels consume one cached instance
   of each. The root keeps mount()/reattach()/retire()/rotate()/zoom()/play() and calls both realizers
   through imports; every async replay site (the sprite-texture settle, the donor settle, the
   whole-object post-load replay, the dressing real-art settle, the Clay Room, the Light Lab) receives
   THESE function objects through its own ctx, so every replay still lands in the identical place.

   ── THE DECOMPOSITION (the brief's item 5: "keep setInteriorBoard orchestration readable; do not
   merely move a single 5,000-line function unchanged and call the split complete") ──────────────────
   setInteriorBoard was a single 1,448-line body. It is now a READABLE PHASE LIST: the exported
   orchestrator keeps only its own admission guard (the mount/data check, MF-1's pre-fit pose capture
   and the dirty-key skip — control flow a phase list cannot express, since both are early returns) and
   then calls seventeen named phase functions in the ORIGINAL ORDER. Every phase BODY is a
   VERBATIM-LIFTED contiguous line range of the original function — the only lines this file adds are
   each phase's `const { … } = pass;` input line, its `pass.x = x;` output line, and the wrapper
   itself. No statement was reordered, merged, split, or rewritten; the shader census and the behaviour
   gates are the net under it.

   THE PHASE MAP (name — original theater-boot.js line range — what it owns):
      1. realizePhaseIntake       root 5297-5339 — the lighting-preservation decision (clay diagnostic), the MF-2 room-transition flag + opaque overlay snap, and the VP0 camera-mode swap
      2. realizePhaseTeardown     root 5340-5394 — the build counter, drainTweens, every clearGroup (fx/tile/prop/interior/unit/shadow — VP1c's kaiju clears included), the STAGE-A A4 occlusion-fade board-identity reset, and the per-build S resets (zoomLevel/isInteriorBoard/shadowMap)
      3. realizePhaseFrame        root 5395-5531 — bounds + focusRect, STAGE-A A3's shot-compose try/catch, the F1 pre-combat fit memo, S.boardCenter/halves/interiorFitMaxHeight, and the occlusion camera pose + BW2-1b bearing hysteresis
      4. realizePhaseLightBed     root 5532-5674 — env/tileKit/rigOn, the light-recipe void + fog grade, applyLightProfile, the bright/emissive scene-light bed, and BW2-4b's realm sprite-emissive tint
      5. realizePhaseSurfaces     root 5675-5763 — materialsOn, the cosmic albedo lift, floor/wall/pillar textures, the AO instance pass, S.interiorFloorTopMap, the piece sight points, and the floor InstancedMesh
      6. realizePhaseWallsDoors   root 5764-5919 — the camera-side cutaway band, BW2-5's wall parapet cut, the S-1/A4 wall + doorframe ankle-stub/ghost split, the wall/door InstancedMeshes, and the door mount map
      7. realizePhaseShell        root 5920-6331 — the C4 ROOM-SHELL COMPILER — shell cells, edge factor, materials, the per-segment colour samplers, compileRoomShell, the C4.1b wall-upper blocking sets, the wall-omission report, and every shell mesh (floor/stem/upper/trim/riser) plus S.interiorLastRoomShell
      8. realizePhasePillars      root 6332-6383 — the BW2-1b/S-1 pillar cutaway mask, ankle-stub/ghost split, and the pillar + pillar-ghost meshes
      9. realizePhaseGroups       root 6384-6409 — GR4's skirt, STAGE-A A1's portal cards, and THE ONE mesh-add sweep (itrAllInteriorMeshes) that seats every architectural mesh in S.interiorGroup and stamps S.interiorMeshCount
     10. realizePhasePracticals   root 6410-6482 — the wall-mount slot filter, interiorBuildLights, the E0-1 wall-fixture fade linkage, the cone/glow diagnostics, and the VP6 flicker join
     11. realizePhasePieces       root 6483-6530 — interiorBuildPieces (the true-scale standees), F1's combat floor grid, and interiorBuildDressing + both world-position diagnostics
     12. realizePhaseFurniture    root 6531-6570 — the A4 furniture occlusion mask, BW2-5's furniture volumes, and THE PROP PERSPECTIVE LAW's wall props + their AO diagnostic
     13. realizePhaseDoors        root 6571-6622 — D4's interactable doors, the D4 E0-1 fade compliance linkage, and the door diagnostics
     14. realizePhaseKitShells    root 6623-6653 — KS-3's kit shell walls/floors with the KS-3b camera-side cutaway parity pass
     15. realizePhaseAtmosphere   root 6654-6673 — VP6 item 4's decals and VP6 item 3's ambient motes (its own drift scheduler restart)
     16. realizePhaseCameraFit    root 6674-6686 — MF-1's authoritative tweened fit and BW3's post-suite mount
     17. realizePhaseTail         root 6687-6720 — MF-2 item 4's fade back to the revealed room, CL-R0's post-rebuild clay hook + lighting probe, and markDirty

   THE PASS OBJECT is the explicit, minimal context threaded through the phases: exactly those locals
   the original body shared ACROSS a phase seam, and nothing else. Nothing on it is reassigned by a
   later phase (censused): every field is written once by its producing phase and only READ downstream,
   which is why the lifted bodies still declare their own `const`/`let` exactly as before. Fields:
     from the orchestrator — data, renderOpts, variant, mf1PreFitPos, mf1PreFitTarget
     from Intake         — nextLightingKey, preserveInteriorLighting, preservedLightsBuilt,
                           clayLightingProbeBefore, isRoomTransition
     from Frame          — b, fit, cx, cz, occlusionCameraPos, occlusionHoldPrior, occlusionFurnitureOn
     from LightBed       — env, kit, rigOn, isBrightRealm, applyEmissiveAlbedoLift
     from Surfaces       — materialsOn, floorColorForRender, wallColorForRender, wallTex, pillarTex,
                           inst, itrSightPoints, floorFromFile, wallFromFile, floorList, floorMesh
     from WallsDoors     — itrCameraSideBand, ITR_CUTAWAY_STUB_HEIGHT_U, wallList, wallMesh,
                           wallGhostMesh, useCompiledRoomShell, doorMountMap, doorMesh, doorGhostMesh
     from Shell          — roomShellMeshes
     from Pillars        — pillarList, pillarMeshes, pillarGhostMeshes
     from Practicals     — wallUpperFadeEntries
   Closures and try/finally were never split across a seam: STAGE-A A3's whole shot-compose
   `try { … } catch(e){ camFit = null; … }` sits INSIDE realizePhaseFrame; the camera-side band closure
   `itrCameraSideBand` is DEFINED in realizePhaseWallsDoors and, because KS-3b's kit-wall cutaway calls
   it ~700 lines later, travels on the pass object as a function value rather than being re-derived;
   the room-shell block's five inner closures (shellEdgeFactor / wallHeightForSegment / floorColorAt /
   wallColorForSegment / upperVisibleForSegment) all live and die inside realizePhaseShell.

   THE PROTECTED CONTRACTS THIS FILE CARRIES: the dirty-key admission (variant folded into the key so a
   variant-only change still rebuilds; boardSkips on the skip), MF-1's pose capture BEFORE drainTweens,
   MF-2 item 4's transition overlay snapped opaque BEFORE the teardown and faded back only at the tail,
   the VP0 perspective-camera swap (the ONE place S.camera goes perspective), VP1c's
   clearGroup(S.unitGroup)+clearGroup(S.shadowGroup) on every interior rebuild (the kaiju leak),
   STAGE-A A4's board-identity fade-state reset, shadow-mapping ON (the ONE place), BW2-1's zoomLevel
   reset, the ROOM-SHELL COMPILER's exact either/or with the per-cell floor/wall meshes, the E0-1 and
   D4 append-never-overwrite fade linkages, and CL-R0's single post-rebuild hook
   (clayRoomAfterInteriorBoardRebuild) at the function's ONE exit — the funnel every interior rebuild
   and every asynchronous replay passes through.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as every B1-B8 module): this module NEVER
   imports theater-boot.js. Capabilities arrive ONCE via interiorRealizeInit(ctx) into the module-local
   mirrors below, so every lifted body keeps its bare identifiers. It reads AND writes the live theater
   state record, so the root also calls interiorRealizeSyncState(S) at BOTH
   `S = createTheaterState()` reassignment sites.

   NO CYCLE (censused): this module imports src/ui/theater-clay-room.js for the four CL-R0 hooks
   (clayRoomAfterInteriorBoardRebuild / clayRoomLightingSnapshot / clayRoomRecordLightingProbe /
   clayWallOmissionOn). theater-clay-room.js imports only three, ./standee-verbs.js,
   ./theater-room-mesh.js and ./theater-verbs.js — it receives setInteriorBoard/setInteriorVariant/
   f1BuildCombatGrid from the ROOT through clayRoomInit(ctx), never by import. The edge is one-way.
   The same holds for theater-dressing.js (it takes setBoard/setInteriorBoard through its own ctx).

   ACCESSORS (eleven lines — this side's only non-verbatim production edits): the mutable root `let`s
   ITR_ROOM_SHELL (2 reads — the Clay Room live-writes it through the root's rootSetRoomShell, and
   itrDoorMountFor/itrDoorMountMapFrom still read it in the root), ROOM_SHELL_POLYGON_KERNEL_FLAG (1),
   ITR_OCCLUSION_FADE_DISABLED_FOR_TEST (4 — wall/door/pillar/furniture), ITR_EMISSIVE_FILL_DISABLED_FOR_TEST
   (1), ITR_EMISSIVE_ALBEDO_LIFT_DISABLED_FOR_TEST (1) and ITR_SPRITE_EMISSIVE_TINT (2 writes, read live
   by theater-sprites.js/theater-dressing.js off the SAME root `let`). Each is reassigned at runtime by
   its own window.Theater seam, so an import binding (read-only) or a copied mirror (stale the instant a
   harness flips one) would both be wrong.
   ITR_ROOM_SHELL_UV_DENSITY and ITR_ROOM_SHELL_RISER_DARKEN are plain root `const`s with exactly one
   reader each (both inside realizePhaseShell) — censused as movable, but deliberately KEPT in the root
   beside ITR_ROOM_SHELL / ROOM_SHELL_POLYGON_KERNEL_FLAG so the room-shell tunables read as one block
   (B2's standing tunables law), and delivered here as plain ctx values.

   `GS` (src/state.js) and `lightRecipeColorNumber` (the classic light-recipe script) stay BARE GLOBALS
   exactly as in the monolith — resolved the identical way, from the identical place. `document` is the
   same DOM global f1CombatGridTexture always degraded against (a jsdom harness with no 2D backend gets
   null and the solid-colour fallback, never a throw). THIS MODULE OWNS NO SCHEDULER (censused: zero
   requestAnimationFrame) — the mote drift and the flicker interval stay in their own leaf modules, the
   tween loop stays the root's. */

import * as THREE from "three";
import { clearGroup } from "./theater-dispose.js";
import {
  CAM_ELEV_DEG, CAM_YAW_OFFSET_DEG, F1_COMBAT_CAM_CLAMP_FRAC, ITR_SHOT_COMPOSE,
  f1ClampCamFit, fitFromComposedCameraWideForTest, fitFromComposedShot,
  interiorCameraFitFor, interiorFitMaxHeightFor, placeCamera, placeCameraTweened, shotProjectTwoArg,
} from "./theater-camera.js";
import {
  CELESTIAL_PROFILE_SET, INTERIOR_LIGHT_FLICKER_AMPLITUDE, LIGHT_DEFAULT_PROFILE, LIGHT_PROFILES,
  applyLightProfile, celestialArcFor, mountInteriorCameraKey, mountSpriteCameraFill,
  startLightFlicker, voidTintFor,
} from "./theater-lighting.js";
import { mountPostSuite } from "./theater-post.js";
import { interiorBuildLights } from "./theater-practicals.js";
import { interiorBuildMotes, interiorMoteKindFor, startMoteDrift, stopMoteDrift } from "./theater-motes.js";
import {
  ITR_OCCLUSION_STEM_HEIGHT_U,
  ITR_OCCLUSION_RECLASSIFY_HYSTERESIS_DEG,
  itrFurnitureOcclusionMask, itrOcclusionAnkleHeight, itrOcclusionBearingDeg,
  itrOcclusionBearingDeltaDeg, itrOcclusionClassify, itrOcclusionIdFor, itrPieceSightPoints,
  itrPillarCutawayMask, itrSplitOccluderForAnkleGhost,
} from "./theater-occlusion.js";
import {
  interiorApplyAODarkening, interiorBuildInstancedMesh, interiorBuildPillarMeshes,
  interiorMaterialTexture, interiorSurfaceFileTexture, itrBuildOcclusionGhostMeshes,
  itrBuildOcclusionGhostPillarMeshes, itrNeutralizeInstanceColors,
} from "./theater-interior-mesh.js";
import {
  interiorBuildDressing, interiorBuildFurniture, interiorBuildPieces, interiorBuildWallProps,
} from "./theater-dressing.js";
import { interiorBuildDecals } from "./theater-overlays.js";
import {
  DEFAULT_WALL_CAP_HEIGHT, ROOM_SHELL_TIER_QUANTUM, compileRoomShell, segmentNormal,
} from "./theater-room-mesh.js";
import {
  OCCLUSION_SUBJECT_EYE_HEIGHT, composeShot, defaultCameraCandidates, shotPlanFrom,
  wallUpperBlockingSet, wallUpperCameraSideBlockingSet,
} from "./theater-shot.js";
import { ROOM_TRANSITION_DUR, pushScreenFade } from "./spawn-grace.js";
import {
  clayRoomAfterInteriorBoardRebuild, clayRoomLightingSnapshot, clayRoomRecordLightingProbe,
  clayWallOmissionOn,
} from "./theater-clay-room.js";

/* ---- the ctx mirrors (root-owned capabilities; see CTX LAW above) ---- */
let HEMI_INTENSITY_DEFAULT, INTERIOR_CAM_MODE, ITR_BRIGHT_PROFILES, ITR_EMISSIVE_ALBEDO_LIFT,
    ITR_EMISSIVE_PROFILES, ITR_EMISSIVE_SCENE_AMBIENT, ITR_EMISSIVE_SCENE_FILL,
    ITR_EMISSIVE_SCENE_FILL_SCALE, ITR_EMISSIVE_SCENE_HEMI, ITR_EMISSIVE_SCENE_KEY,
    ITR_FLOOR_BASE_Y, ITR_FLOOR_HEIGHT_FALLBACK, ITR_GLOOM_AMBIENT_LIFT,
    ITR_ROOM_SHELL_RISER_DARKEN, ITR_ROOM_SHELL_UV_DENSITY, ITR_SCENE_DOORFRAME_VALUE,
    ITR_SCENE_FILL, ITR_SCENE_FILL_SCALE, ITR_SCENE_HEMI, ITR_SCENE_KEY, ITR_SPRITE_TINT_STRENGTH,
    LIGHT_TUNABLES, THEATER_DEFAULT_ENV_FALLBACK;
let applyPsxShaderTweaks, buildTheaterCtx, drainTweens, gradeColorLocal, hexStrToNum,
    interiorBuildInteractables, interiorBuildKitShellFloors, interiorBuildKitShellWalls,
    interiorFloorTopAt, interiorFloorTopMapFrom, itrApplyDoorMounts, itrBrightRealmFillFor,
    itrDoorMountMapFrom, itrScaleHexValue, markDirty, startTweenLoop;
let itrCtxGetRoomShell, itrCtxRoomShellPolygonKernel, itrCtxOcclusionFadeDisabled,
    itrCtxEmissiveFillDisabled, itrCtxEmissiveAlbedoLiftDisabled, itrCtxSetSpriteEmissiveTint;
let S = null;

export function interiorRealizeInit(ctx){
  HEMI_INTENSITY_DEFAULT = ctx.HEMI_INTENSITY_DEFAULT;
  INTERIOR_CAM_MODE = ctx.INTERIOR_CAM_MODE;
  ITR_BRIGHT_PROFILES = ctx.ITR_BRIGHT_PROFILES;
  ITR_EMISSIVE_ALBEDO_LIFT = ctx.ITR_EMISSIVE_ALBEDO_LIFT;
  ITR_EMISSIVE_PROFILES = ctx.ITR_EMISSIVE_PROFILES;
  ITR_EMISSIVE_SCENE_AMBIENT = ctx.ITR_EMISSIVE_SCENE_AMBIENT;
  ITR_EMISSIVE_SCENE_FILL = ctx.ITR_EMISSIVE_SCENE_FILL;
  ITR_EMISSIVE_SCENE_FILL_SCALE = ctx.ITR_EMISSIVE_SCENE_FILL_SCALE;
  ITR_EMISSIVE_SCENE_HEMI = ctx.ITR_EMISSIVE_SCENE_HEMI;
  ITR_EMISSIVE_SCENE_KEY = ctx.ITR_EMISSIVE_SCENE_KEY;
  ITR_FLOOR_BASE_Y = ctx.ITR_FLOOR_BASE_Y;
  ITR_FLOOR_HEIGHT_FALLBACK = ctx.ITR_FLOOR_HEIGHT_FALLBACK;
  ITR_GLOOM_AMBIENT_LIFT = ctx.ITR_GLOOM_AMBIENT_LIFT;
  ITR_ROOM_SHELL_RISER_DARKEN = ctx.ITR_ROOM_SHELL_RISER_DARKEN;
  ITR_ROOM_SHELL_UV_DENSITY = ctx.ITR_ROOM_SHELL_UV_DENSITY;
  ITR_SCENE_DOORFRAME_VALUE = ctx.ITR_SCENE_DOORFRAME_VALUE;
  ITR_SCENE_FILL = ctx.ITR_SCENE_FILL;
  ITR_SCENE_FILL_SCALE = ctx.ITR_SCENE_FILL_SCALE;
  ITR_SCENE_HEMI = ctx.ITR_SCENE_HEMI;
  ITR_SCENE_KEY = ctx.ITR_SCENE_KEY;
  ITR_SPRITE_TINT_STRENGTH = ctx.ITR_SPRITE_TINT_STRENGTH;
  LIGHT_TUNABLES = ctx.LIGHT_TUNABLES;
  THEATER_DEFAULT_ENV_FALLBACK = ctx.THEATER_DEFAULT_ENV_FALLBACK;
  applyPsxShaderTweaks = ctx.applyPsxShaderTweaks;
  buildTheaterCtx = ctx.buildTheaterCtx;
  drainTweens = ctx.drainTweens;
  gradeColorLocal = ctx.gradeColorLocal;
  hexStrToNum = ctx.hexStrToNum;
  interiorBuildInteractables = ctx.interiorBuildInteractables;
  interiorBuildKitShellFloors = ctx.interiorBuildKitShellFloors;
  interiorBuildKitShellWalls = ctx.interiorBuildKitShellWalls;
  interiorFloorTopAt = ctx.interiorFloorTopAt;
  interiorFloorTopMapFrom = ctx.interiorFloorTopMapFrom;
  itrApplyDoorMounts = ctx.itrApplyDoorMounts;
  itrBrightRealmFillFor = ctx.itrBrightRealmFillFor;
  itrDoorMountMapFrom = ctx.itrDoorMountMapFrom;
  itrScaleHexValue = ctx.itrScaleHexValue;
  markDirty = ctx.markDirty;
  startTweenLoop = ctx.startTweenLoop;
  itrCtxGetRoomShell = ctx.itrCtxGetRoomShell;
  itrCtxRoomShellPolygonKernel = ctx.itrCtxRoomShellPolygonKernel;
  itrCtxOcclusionFadeDisabled = ctx.itrCtxOcclusionFadeDisabled;
  itrCtxEmissiveFillDisabled = ctx.itrCtxEmissiveFillDisabled;
  itrCtxEmissiveAlbedoLiftDisabled = ctx.itrCtxEmissiveAlbedoLiftDisabled;
  itrCtxSetSpriteEmissiveTint = ctx.itrCtxSetSpriteEmissiveTint;
  if(ctx.S) S = ctx.S;
}

/* the root re-points this at BOTH `S = createTheaterState()` sites (mount() and retire()) — the same
   SyncState law every B1-B8 module follows. */
export function interiorRealizeSyncState(next){ S = next; }

// VQ2-RESPEC.md §4 unit F1 — "grid = thin umber lines on the room floor (depthWrite:false,
// opacity:0.16, polygonOffset, radial fade before wall-adjacent cells)". f1CombatGridTexture() is a
// small cached CanvasTexture: a single grid cell's border (a thin inset stroke), tiled ONE-PER-LEGAL-
// CELL by f1BuildCombatGrid below (never a single room-spanning plane — that would draw grid lines
// across furniture-blocked/non-room cells too, the exact thing "dressing-blocked cells excluded"
// forbids). Cached module-scope (built once, reused for the life of the session — the texture itself
// carries no per-room data, only the line pattern).
let F1_GRID_TEX_CACHE = null;
function f1CombatGridTexture(){
  if(F1_GRID_TEX_CACHE) return F1_GRID_TEX_CACHE;
  if(typeof document === "undefined") return null; // headless/jsdom harness with no canvas — degrade to no texture (solid-color fallback below)
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  if(!ctx) return null;
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = "#8a5a2b"; // thin umber
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  F1_GRID_TEX_CACHE = tex;
  return tex;
}
// f1BuildCombatGrid(legalCells, cx, cz, floorTopMap) -> THREE.Group — one 1x1 quad per legal combat
// cell (GRID LAW: 1 SpatialPlan cell = 1 world unit), flat on the room's own real floor top
// (interiorFloorTopAt, the SAME derived law every other floor-contact mount in this file uses — never
// a hardcoded plane). "radial fade before wall-adjacent cells": any legal cell touching the room
// boundary (one of its 4 orthogonal neighbors is NOT itself a legal cell — a wall, a door threshold,
// or a dressing-blocked cell) gets its opacity roughly halved instead of the interior's full 0.16, so
// the overlay visually recedes before it ever touches a wall face rather than terminating with a hard
// cut. depthWrite:false + polygonOffset (factor/units -1) keep it a pure decal over the floor mesh —
// visible without z-fighting, never occluding anything drawn after it.
const F1_GRID_OPACITY = 0.16;
const F1_GRID_EDGE_OPACITY = 0.08;
export function f1BuildCombatGrid(legalCells, cx, cz, floorTopMap){
  const group = new THREE.Group();
  if(!Array.isArray(legalCells) || !legalCells.length) return group;
  const legalKeys = new Set(legalCells.map((c) => c.x + "," + c.y));
  const tex = f1CombatGridTexture();
  const geo = new THREE.PlaneGeometry(0.96, 0.96);
  geo.rotateX(-Math.PI / 2);
  legalCells.forEach((c) => {
    const isEdge = !legalKeys.has((c.x + 1) + "," + c.y) || !legalKeys.has((c.x - 1) + "," + c.y)
      || !legalKeys.has(c.x + "," + (c.y + 1)) || !legalKeys.has(c.x + "," + (c.y - 1));
    const opacity = isEdge ? F1_GRID_EDGE_OPACITY : F1_GRID_OPACITY;
    const mat = new THREE.MeshBasicMaterial({
      color: 0x8a5a2b, map: tex || null, transparent: true, opacity,
      depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    const floorTop = interiorFloorTopAt(floorTopMap, c.x, c.y);
    mesh.position.set(c.x - (cx || 0), floorTop + 0.01, c.y - (cz || 0));
    group.add(mesh);
  });
  return group;
}

function interiorLightingIdentityFor(data, variant){
  // Lighting objects may survive a geometry-only replay only when every input that can affect their
  // fixture recipe, placement, scene rig, or authored value is identical. Door/interactable state is
  // intentionally absent: a hinge swing is not a lighting authoring change.
  return JSON.stringify({
    realmId: data && data.realmId,
    lightProfile: data && data.lightProfile,
    lights: (data && data.lights) || [],
    bounds: data && data.bounds,
    focusRect: data && data.focusRect,
    walls: data && data.instances && data.instances.wall,
    doorAxes: data && data.doorAxes,
    roomShell: itrCtxGetRoomShell(),
    rig: !variant || variant.rig !== false,
  });
}

/* setInteriorBoard(data, renderOpts) — THE INTERIOR REALIZER. See THE DECOMPOSITION in this
   file's header for the phase map. What stays HERE, in the orchestrator itself, is the
   ADMISSION GUARD only: the mount/data check, MF-1's pre-fit camera-pose capture (which must
   happen even on the skip path) and the dirty-key skip — three early returns a phase list
   cannot express. Everything after them is the ordered phase call list, and every phase body
   is a verbatim-lifted range of the pre-split function. */
export function setInteriorBoard(data, renderOpts){
  if(!S.mounted || !data) return;
  renderOpts = renderOpts || {};
  // BEAUTY-WAVE-4.md MF-1: capture the TRUE live camera pose as the very FIRST thing this function
  // does — before drainTweens() (a few lines down) gets a chance to force-complete an in-flight
  // camera-pose tween to ITS end pose. drainTweens' own job is legitimate (force-settle tweens whose
  // Object3D/material handles are about to be disposed by the clearGroup calls that follow it) — a
  // camera-pose tween doesn't hold any such handle (it only ever touches the persistent S.camera), so
  // it's harmless for drainTweens to complete it too, but doing so BEFORE this capture point would
  // silently defeat MF-1's own "retarget from the CURRENT interpolated pose" contract (found live
  // debugging this unit: a fit fired mid-glide always re-derived its start from the OLD tween's own
  // end, never the live mid-flight pose, because drainTweens had already snapped to it by the time the
  // old capture point — right before the preview placeCamera() call, much later in this function — ever
  // ran). Captured unconditionally (even on the dirty-key skip path below) — a wasted clone is cheap.
  const mf1PreFitPos = S.camera ? S.camera.position.clone() : null;
  const mf1PreFitTarget = S.cameraLookTarget ? S.cameraLookTarget.clone() : null;
  // DUNGEON-GRAPH.md U3 render-quality study card: S.interiorVariant (window.Theater.setInteriorVariant,
  // below) folds into the dirty key so a variant-only change (same board data, different AO/banded/fog
  // flags — exactly what the study rig does per scene) still forces a rebuild instead of skipping.
  const variant = S.interiorVariant || {};
  const dirtyKey = "interior:" + JSON.stringify(variant) + ":" + JSON.stringify(data);
  if(dirtyKey === S.boardKey){ window.Theater.stats.boardSkips++; return; }
  S.boardKey = dirtyKey;
  /* the phase context — see THE PASS OBJECT in this file's header. */
  const pass = { data, renderOpts, variant, mf1PreFitPos, mf1PreFitTarget };
  realizePhaseIntake(pass);
  realizePhaseTeardown(pass);
  realizePhaseFrame(pass);
  realizePhaseLightBed(pass);
  realizePhaseSurfaces(pass);
  realizePhaseWallsDoors(pass);
  realizePhaseShell(pass);
  realizePhasePillars(pass);
  realizePhaseGroups(pass);
  realizePhasePracticals(pass);
  realizePhasePieces(pass);
  realizePhaseFurniture(pass);
  realizePhaseDoors(pass);
  realizePhaseKitShells(pass);
  realizePhaseAtmosphere(pass);
  realizePhaseCameraFit(pass);
  realizePhaseTail(pass);
}

/* PHASE 1 (realizePhaseIntake) — the lighting-preservation decision (clay diagnostic), the MF-2
   room-transition flag + opaque overlay snap, and the VP0 camera-mode swap. VERBATIM from theater-
   boot.js lines 5297-5339. */
function realizePhaseIntake(pass){
  const { data, renderOpts, variant } = pass;
  const nextLightingKey = S.clayRoomDiagnosticActive
    ? interiorLightingIdentityFor(data, variant)
    : null;
  const preserveInteriorLighting = !!(
    S.clayRoomDiagnosticActive
    && S.interiorLightsBuilt
    && S.interiorLightsBuilt.group
    && S.interiorLightsBuilt.group.parent === S.interiorGroup
    && S.interiorLightingKey === nextLightingKey
  );
  const preservedLightsBuilt = preserveInteriorLighting ? S.interiorLightsBuilt : null;
  const clayLightingProbeBefore = S.clayRoomDiagnosticActive
    ? clayRoomLightingSnapshot("before-rebuild")
    : null;
  S.interiorLightingPreservedThisBuild = preserveInteriorLighting;
  // BEAUTY-WAVE-4.md MF-2 item 4 (ROOM TRANSITION CROSSFADE): only a REAL swap gets the crossfade —
  // "walk/travel BOARD SWAPS", not this mount's very first room reveal (nothing to hide a cut FROM
  // yet; the dressing/piece cascade already wired into interiorBuildPieces/Dressing/Furniture is that
  // first reveal's own "the room sets itself" beat). S.lastBoard is still the PRIOR board here (this
  // function only overwrites it a few lines down) — truthy iff a board was already showing. The
  // overlay snaps OPAQUE synchronously, right here, BEFORE drainTweens/clearGroup/rebuild run — this
  // whole function is single-threaded JS, so no frame is ever painted mid-rebuild; the opaque snap is
  // what "the rebuild happens under it" means when the rebuild itself is synchronous. The fade back to
  // transparent (revealing the NEW room) is pushed once the rebuild + camera fit are done, at this
  // function's own tail below.
  // A full-screen fade is travel grammar, never generic rebuild grammar. Same-board async settles,
  // camera/material replays, and explicitly-local Clayroom state edits rebuild in place.
  const isRoomTransition = !!S.lastBoard
    && data !== S.lastBoard
    && renderOpts.roomTransition !== false;
  if(isRoomTransition && S.transitionEl){
    S.transitionEl.style.opacity = "1";
  }
  // GRAPHICS-ENGINE law 2b/VP0 (docs/BEAUTY-WAVE.md): the interior channel's own camera-mode switch.
  // `variant.camMode` (study-rig ONLY — dev/battle-gate/capture-two-flag-card.mjs's ortho/persp cells)
  // overrides the module default INTERIOR_CAM_MODE for this render only; no product caller ever sets
  // it, so this degrades to INTERIOR_CAM_MODE everywhere else. setBoard's own S.orthoCamera restore
  // (above) is the one place that ever swaps back to ortho for the tabletop channel — this is the one
  // place that ever swaps TO the perspective camera.
  const camMode = (variant.camMode === "ortho" || variant.camMode === "persp") ? variant.camMode : INTERIOR_CAM_MODE;
  const wantPersp = camMode === "persp";
  if(wantPersp && S.perspCamera && S.camera !== S.perspCamera) S.camera = S.perspCamera;
  else if(!wantPersp && S.orthoCamera && S.camera !== S.orthoCamera) S.camera = S.orthoCamera;
  // -> the pass context (see THE PASS OBJECT in this file's header)
  pass.nextLightingKey = nextLightingKey;
  pass.preserveInteriorLighting = preserveInteriorLighting;
  pass.preservedLightsBuilt = preservedLightsBuilt;
  pass.clayLightingProbeBefore = clayLightingProbeBefore;
  pass.isRoomTransition = isRoomTransition;
}

/* PHASE 2 (realizePhaseTeardown) — the build counter, drainTweens, every clearGroup
   (fx/tile/prop/interior/unit/shadow — VP1c's kaiju clears included), the STAGE-A A4 occlusion-
   fade board-identity reset, and the per-build S resets (zoomLevel/isInteriorBoard/shadowMap).
   VERBATIM from theater-boot.js lines 5340-5394. */
function realizePhaseTeardown(pass){
  const { data, preserveInteriorLighting, preservedLightsBuilt } = pass;
  window.Theater.stats.boardBuilds++;
  drainTweens(S);
  clearGroup(S.fxGroup);
  if(preserveInteriorLighting) S.interiorGroup.remove(preservedLightsBuilt.group);
  S.lastBoard = data;
  // STAGE-A A4 — a genuinely NEW board object (not a same-object rebuild: rotate()/zoom/variant-only
  // replays never change `data`'s own identity, matching setInteriorVariant's own "null S.boardKey,
  // replay S.lastBoard" trick) clears the persistent occlusion fade state + hysteresis bearing anchor.
  // Walking into a new room must never inherit a torn-down room's stale fade entries, or hold a
  // brand-new room's own first classification against an unrelated old bearing. A same-object replay
  // correctly PRESERVES fade state across the rebuild — exactly what the hysteresis hold needs.
  if(data !== S.__occlusionFadeBoardRef){
    S.occlusionFadeState = new Map();
    S.occlusionClassifyBearingDeg = null;
    S.__occlusionFadeBoardRef = data;
  }
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);
  clearGroup(S.interiorGroup);
  // BEAUTY-WAVE.md VP1c (THE LOOP-04 KAIJU PROBE, diagnosed this unit): production's own per-render
  // sync (src/world/render.js theaterStageSync) pushes the FLAT TABLETOP board+units into S.unitGroup/
  // S.shadowGroup (window.Theater.setBoard + setUnits) on every renderWorld() while GS.combat.active —
  // and dm.js's combat_start handler calls renderWorld() at the end of its own case. Those units size
  // through the pre-VP1 render-height-multiplier convention (GLB_TARGET_HEIGHT x entry.scale x
  // spriteSizeScaleFor), NOT the true-scale math VP1/VP1b gave interior pieces. Neither group was ever
  // cleared here, so a caller that drives combat_start and then separately mounts an interior tray
  // (window.Theater.setInteriorBoard — the dungeon-loop gate's own documented allowance, and any future
  // combat-in-a-room feature) inherited the leftover flat-tabletop meshes standing in the SAME world-
  // origin neighborhood the interior camera frames — the kaiju towering in the loop-04/05 contact-sheet
  // frames. An interior tray's creatures are pieces (VP1/VP1b's own true-scale render family); the flat
  // tabletop unit family must never coexist with it. setBoard already clears these same two groups for
  // the reverse direction (a tabletop board must not inherit a prior interior tray's leftover pieces);
  // this is the missing other half.
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);
  S.propOccupiedZones = {};
  // BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA): setInteriorBoard never used to manage S.zoomLevel at
  // all (only setBoard's own small-board bias ever touched it) — a LATENT gap, harmless before this
  // unit since the pre-unit fit was always generously padded enough to absorb a stray leftover
  // zoomLevel from a prior flat-tabletop mount. It stops being harmless now: interiorCameraFitFor's
  // "beat" fit + placeCamera's own exact-containment correction (this unit) compute a precise
  // corrected auto-fit distance, and then apply S.zoomLevel ON TOP of it (by design — a PLAYER's own
  // manual Theater.zoom() call is intentionally allowed to crop past the auto-fit); a stale zoomLevel
  // inherited from a completely different board (the tabletop's own bias, or a previous interior
  // board's manual zoom) would silently re-introduce the exact crop this unit fixes. Reset to 1 on
  // every ACTUAL rebuild (the dirty-key skip above already returns before this line, so a caller
  // polling the SAME board every render tick never has an in-progress manual zoom reset out from
  // under it) — mirrors setBoard's own "a fresh board gets a fresh [zoom] reading" convention.
  S.zoomLevel = 1;
  S.isInteriorBoard = true; // placeCamera's own tabletop-vs-interior half-floor split
  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2: interior boards get real shadow-mapping — the
  // tabletop/combat path's "no shadow maps" ruling (§2, this file's mount()-time default + setBoard's
  // own explicit restore below) is untouched; this is the ONE place shadow-mapping turns on.
  if(S.renderer) S.renderer.shadowMap.enabled = true;

}

/* PHASE 3 (realizePhaseFrame) — bounds + focusRect, STAGE-A A3's shot-compose try/catch, the F1
   pre-combat fit memo, S.boardCenter/halves/interiorFitMaxHeight, and the occlusion camera pose +
   BW2-1b bearing hysteresis. VERBATIM from theater-boot.js lines 5395-5531. */
function realizePhaseFrame(pass){
  const { data, variant } = pass;
  const b = data.bounds || { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
  // Camera framing: fit to the FOCUS ROOM when the board carries one (interiorBuildBoard's
  // focusRect — study card v3 "camera pulled into the room"); neighbors still render, they just
  // sit outside the fitted frame. Fallback: the whole board footprint, the original behavior.
  const fit = data.focusRect || b;
  const cx = (fit.minX + fit.maxX) / 2, cz = (fit.minZ + fit.maxZ) / 2;
  S.boardOrigin = { cx, cz };
  // BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA): the camera-FIT box (what placeCamera sizes/aims at) is
  // now independent of the geometry-mount origin shift above (cx/cz — untouched, room footprints stay
  // exactly where they always were, per this unit's own OUT OF SCOPE). data.cameraFit is a plain
  // caller-set field (data.pieces/data.dressing/data.lightProfile's own convention): absent boards
  // default to "room" mode, byte-identical in SHAPE to the pre-unit fit (still data.focusRect), just
  // CLOSER (see interiorCameraFitFor's own header). See that function for "beat" mode.

  /* GRAPHICS-NORTH-STAR.md STAGE A unit A3 (docs/STAGE-A.md §A3; docs/WALK-NATIVE-A.md A3): compose
     the interior camera off the ShotPlan (theater-shot.js) instead of the plain data.cameraFit/
     focusRect path below, behind ITR_SHOT_COMPOSE (default ON — see that const's own header comment
     for why it's read off `variant.shotCompose` rather than a bare module flag). shotPlanFrom/
     composeShot are pure and never touch S.*; this block is the ONLY place their output is allowed to
     reach the render, and only ever by way of `camFit` below (via fitFromComposedShot — see its own
     header for why the fit frames the action-cluster EXTENT, reusing interiorCameraFitFor's proven
     beat crop, rather than the composed camera's full-frustum distance) — the EXACT {center,halfX,
     halfZ} shape interiorCameraFitFor already returns, so every downstream consumer (placeCamera/
     placeCameraTweened, the exact-containment correction loop, S.zoomLevel) is untouched either way.
     FALLBACK EVERYWHERE (byte-identical to pre-unit behavior): `camFit` stays null — falling through
     to the pre-existing `interiorCameraFitFor(data.cameraFit, fit, cx, cz)` call, unchanged — when the
     flag is off, when shotPlanFrom/composeShot/defaultCameraCandidates aren't loaded (a narrow
     harness), when composeShot throws, or when EVERY candidate failed its hard constraints
     (`metrics.allRejected` — composeShot's own header notes it never returns nothing, always
     best-effort-picking the highest-scoring REJECTED candidate in that case; that best-effort pick is
     exactly the spec's "no valid candidate" fallback trigger, not a real composed frame worth trusting).
     S.lastComposedShot/S.lastShotPlan are harness-facing-only reads (republished onto
     window.Theater.lastComposedShot/lastShotPlan near this file's other diagnostics, below) — no
     product code reads either field. S.lastComposedShotAttempt/S.lastComposedShotError are the SAME
     kind of harness-only diagnostic, one level earlier: the RAW composeShot result (even when
     all-rejected, so a harness can assert the rejection actually happened) and any thrown error
     message respectively — neither ever influences camFit itself. */
  const shotComposeOn = (typeof variant.shotCompose === "boolean") ? variant.shotCompose : ITR_SHOT_COMPOSE;
  let camFit = null;
  S.lastComposedShot = null;
  S.lastShotPlan = null;
  S.lastComposedShotAttempt = null;
  S.lastComposedShotError = null;
  if(shotComposeOn && typeof shotPlanFrom === "function" && typeof composeShot === "function" && typeof defaultCameraCandidates === "function"){
    try {
      // S.zoomLevel was reset to 1 a few lines above (this function's own "fresh board gets a fresh
      // zoom reading" convention) and nothing between there and here touches it — passing 1 explicitly
      // avoids a reader ever wondering whether a stale zoom could sneak into the composed distance and
      // then get double-applied by placeCamera's own S.zoomLevel multiplier further downstream.
      const viewState = { yawDeg: (S.rotationStep * 90) + CAM_YAW_OFFSET_DEG, pitchDeg: CAM_ELEV_DEG, zoomLevel: 1 };
      const shotPlan = shotPlanFrom(data, (typeof GS !== "undefined" && GS && GS.combat) || null, viewState);
      const candidates = defaultCameraCandidates(shotPlan, viewState);
      const composed = composeShot(shotPlan, candidates, shotProjectTwoArg);
      S.lastComposedShotAttempt = composed;
      if(composed && composed.camera && !(composed.metrics && composed.metrics.allRejected)){
        // production: the action-cluster crop (fitFromComposedShot). Test-only: the superseded wide
        // full-frustum box, only when a harness flips variant.shotComposeWideBoxForTest for its own
        // figure-height RED-FIRST baseline (see fitFromComposedCameraWideForTest's header).
        const composedFit = variant.shotComposeWideBoxForTest
          ? fitFromComposedCameraWideForTest(composed.camera, cx, cz)
          : fitFromComposedShot(shotPlan, fit, cx, cz);
        if(composedFit){
          camFit = composedFit;
          S.lastComposedShot = composed;
          S.lastShotPlan = shotPlan;
        }
      }
    } catch(e){ camFit = null; S.lastComposedShotError = e && e.message ? e.message : String(e); } // any throw -> the exact pre-existing focusRect path below, untouched
  }
  if(!camFit) camFit = interiorCameraFitFor(data.cameraFit, fit, cx, cz);
  // VQ2-RESPEC.md §4 unit F1 — "camera yaw/pitch preserved from exploration; target/distance delta
  // clamped ≤10%". Yaw/pitch are ALREADY preserved by construction: placeCamera()/placeCameraTweened()
  // derive yaw ONLY from S.rotationStep (mount()-time 0, changed ONLY by the player's own rotate()
  // call — see this file's own "S.rotationStep =" writers, never touched anywhere in this function),
  // so a combat render never rotates the camera regardless of what camFit lands on. What CAN move is
  // camFit itself: shotPlanFrom (a few lines up) already threads GS.combat into the action-cluster
  // anchors the shot-compose path scores against, so the SAME room's combat-vs-exploration fit can
  // legitimately differ once units land on real cells (F1's own placement, theaterUnitsOnRoomCells).
  // f1ClampCamFit bounds that drift: S.f1PreCombatCamFit is the last NON-combat fit this exact room
  // produced (snapshotted below, every non-combat render — "from exploration" always means the most
  // recent one, matching a player who was just standing here); a combat render for the SAME
  // activeRoomId clamps its own camFit against that baseline, never against an unrelated room's.
  if(data.combat && S.f1PreCombatCamFit && S.f1PreCombatCamFit.activeRoomId === data.activeRoomId){
    camFit = f1ClampCamFit(camFit, S.f1PreCombatCamFit, F1_COMBAT_CAM_CLAMP_FRAC);
  } else if(!data.combat){
    S.f1PreCombatCamFit = { activeRoomId: data.activeRoomId, center: { x: camFit.center.x, z: camFit.center.z }, halfX: camFit.halfX, halfZ: camFit.halfZ };
  }
  S.boardCenter = camFit.center;
  S.boardHalfX = camFit.halfX;
  S.boardHalfZ = camFit.halfZ;
  S.boardHalfExtent = Math.max(S.boardHalfX, S.boardHalfZ);
  // BEAUTY-WAVE-2.md BW2-1: see placeCamera's own screenHalfHeight comment — the fit above is FLOOR-
  // footprint-only; this is the standee-height correction term it's missing. An explicit
  // data.cameraFit.maxHeight wins (a caller who already knows its own roster's tallest piece); else
  // auto-derived from data.pieces' real true-scale heights (interiorSpriteBillboard's own UNCLAMPED
  // formula — deliberately ignoring the wall-height clamp, since the fit should account for a
  // creature's full intended height even where the render later clips it for ceiling clearance).
  S.interiorFitMaxHeight = interiorFitMaxHeightFor(data);
  S.lastGrid = null; // no band/lane grid on an interior tray — zoneToWorld/zoom-bias callers degrade to their own defaults

  // BEAUTY-WAVE-4.md MF-1: mf1PreFitPos/mf1PreFitTarget (captured at this function's very TOP, before
  // drainTweens() could force-complete an in-flight camera tween) are what placeCameraTweened() below
  // uses as its start pose — NOT a fresh read of S.camera here, since the preview placeCamera() call
  // just below is byte-identical to the authoritative one further down this function (see its own
  // comment: "idempotent... not a second/different fit") and would already have snapped the camera to
  // what becomes the "end" pose by the time control reaches past it.

  // BEAUTY-WAVE-2.md BW2-1b (THE OCCLUSION LAW), item 1: a PREVIEW placeCamera() call — every input
  // it reads (S.boardCenter/halfX/halfZ/halfExtent, S.interiorFitMaxHeight, S.rotationStep,
  // S.zoomLevel=1 just reset above, S.el's own DOM layout, S.camera's own persp/ortho type already
  // resolved above this line) is already final by this point in the function, and NOTHING between
  // here and this function's own later, authoritative placeCamera() call (below) changes any of
  // them — so this early call is a byte-identical, side-effect-free PREVIEW of the real camera
  // position (idempotent: calling it twice with no state change between calls yields the same
  // S.camera.position both times), not a second/different fit. It exists only so the CUTAWAY
  // pillar/wall-adjacent occlusion test below can raycast from the camera's REAL world position
  // instead of re-deriving a parallel approximation of it.
  placeCamera();
  const occlusionCameraPos = S.camera ? { x: S.camera.position.x, y: S.camera.position.y, z: S.camera.position.z } : null;
  // STAGE-A A4 — the reclassify-hold decision, computed ONCE per rebuild and shared by every kind's
  // classification pass below (wall/pillar/furniture): a small camera-bearing move since the last FREE
  // classification holds every already-seen id's prior commitment; the anchor bearing advances on
  // every NON-held pass (whether or not anything actually flipped this time), so a long slow drift
  // still eventually re-anchors instead of comparing forever against one stale bearing.
  const occlusionBearingNow = itrOcclusionBearingDeg(occlusionCameraPos);
  const occlusionHoldPrior = S.occlusionClassifyBearingDeg != null && occlusionBearingNow != null &&
    itrOcclusionBearingDeltaDeg(occlusionBearingNow, S.occlusionClassifyBearingDeg) < ITR_OCCLUSION_RECLASSIFY_HYSTERESIS_DEG;
  if(!occlusionHoldPrior) S.occlusionClassifyBearingDeg = occlusionBearingNow;
  // STAGE-A A4: blockers now come from ShotPlan.occlusionTargets (docs/STAGE-A.md §A4), not only the
  // wall/pillar instance lists S-1 originally tested — furniture (tall crates/cabinets/shelf-units,
  // data.furniture, BW2-5's own "furniture-class blocker volumes") joins the candidate set whenever
  // THIS shot's own ShotPlan (S.lastShotPlan, A3, set a few lines above this preview fit) actually
  // classifies furniture as an occlusion kind. Absent a ShotPlan (ITR_SHOT_COMPOSE off, or a narrow
  // harness that never builds one), furniture blocking stays off — byte-identical to pre-A4 behavior;
  // wall/pillar classification is unconditional either way (unchanged from S-1).
  const occlusionShotTargets = (S.lastShotPlan && Array.isArray(S.lastShotPlan.occlusionTargets)) ? S.lastShotPlan.occlusionTargets : null;
  const occlusionFurnitureOn = !!(occlusionShotTargets && occlusionShotTargets.some(function(t){ return t && t.kind === "furniture"; }));
  // -> the pass context (see THE PASS OBJECT in this file's header)
  pass.b = b;
  pass.fit = fit;
  pass.cx = cx;
  pass.cz = cz;
  pass.occlusionCameraPos = occlusionCameraPos;
  pass.occlusionHoldPrior = occlusionHoldPrior;
  pass.occlusionFurnitureOn = occlusionFurnitureOn;
}

/* PHASE 4 (realizePhaseLightBed) — env/tileKit/rigOn, the light-recipe void + fog grade,
   applyLightProfile, the bright/emissive scene-light bed, and BW2-4b's realm sprite-emissive tint.
   VERBATIM from theater-boot.js lines 5532-5674. */
function realizePhaseLightBed(pass){
  const { data, variant, preserveInteriorLighting, cx, cz } = pass;

  const env = data.env || THEATER_DEFAULT_ENV_FALLBACK;
  S.env = env;
  S.realmProfile = null; // tileKit colors are already final (src/ui/theater-interior.js) — no second grade pass
  const kit = data.tileKit || {};
  // GR3 (docs/GRAPHICS-ENGINE.md build unit GR3, LIGHT RIG LAW): the kit's own gradeTint/gradeStrength
  // (src/ui/theater-interior.js's tileKit, GR3 addition) becomes a gradeColorLocal-shaped profile —
  // the SAME grade FUNCTION setBoard's own void-tint line already applies for the flat table (line
  // ~3981's `gradeColorLocal(voidTintFor(env), S.realmProfile)`), just sourced from the kit's own
  // authored numbers instead of data/realms.js's REALM_RENDER_DEFAULT table (GR3's "parity" is the
  // shared math, not a duplicated per-realm registry — the interior kits and the table's realm
  // profiles are deliberately two different authored sources, per REALM_MATERIALS' own sibling-
  // registry precedent one unit up). null when a kit carries no grade at all (an unresolved/legacy
  // realmId) -> gradeColorLocal's own no-op passthrough, never a thrown/undefined color.
  // study-rig ONLY toggle (dev/battle-gate/capture-interior-study.mjs's rig-on/rig-off card, mirroring
  // GR1's own materials-on/off convention): `variant.rig === false` drops the grade profile to null
  // (an honest "no GR3 grade" baseline) and dims the shared hemisphere key to 0 for THIS render — no
  // product caller ever sets S.interiorVariant, so this is a no-op everywhere except the study card.
  const rigOn = variant.rig !== false;
  if(!preserveInteriorLighting && S.hemiLight) S.hemiLight.intensity = rigOn ? HEMI_INTENSITY_DEFAULT : 0;
  const gradeProfile = (rigOn && kit.gradeStrength)
    ? { sat: 1, tintAmt: kit.gradeStrength, contrast: 1, tint: hexStrToNum(kit.gradeTint) }
    : null;
  // GR4 (docs/GRAPHICS-ENGINE.md build unit GR4 STAGE LAW): "void backdrop tinted per realm — route
  // voidTintFor through the kit grade" — the fallback branch (a kit with no authored fog.color) now
  // grades voidTintFor(env) instead of using it raw; a kit-authored fog.color is graded too (the SAME
  // profile, so the two branches never diverge in how "final" a color reads).
  // Checkpoint 3 (2026-07-25, "the same dark-brown void persists through very different recipes"):
  // when the board carries a light-recipe lock, the void/fog answers to the RECIPE, not only the
  // realm env key. One derivation, two honest sources: a celestial recipe with a clock takes the
  // celestial arc's own authored void keyframe (the same voidTint the tabletop channel uses); any
  // other recipe derives a deep backdrop from its authored ambient colour (the recipe's mood is its
  // ambient), darkened well below surface values so the void stays a void. Boards without a recipe
  // lock keep the env-keyed tint unchanged.
  let recipeVoidNum = null;
  if(data.lightRecipeLock && data.lightRecipeLock.id){
    const lockRecipe = LIGHT_TUNABLES.profiles[data.lightRecipeLock.id];
    const celestialLight = (data.lights || []).find(function(l){ return l && l.clockMin != null && CELESTIAL_PROFILE_SET[l.recipeId]; });
    if(celestialLight){
      recipeVoidNum = celestialArcFor(celestialLight.recipeId, celestialLight.clockMin).voidTint;
    } else if(lockRecipe && lockRecipe.ambient){
      const ambientColor = new THREE.Color(lightRecipeColorNumber(lockRecipe.ambient.color));
      recipeVoidNum = ambientColor.multiplyScalar(0.16).getHex();
    }
  }
  const fogColorNum = gradeColorLocal(
    recipeVoidNum != null ? recipeVoidNum
      : ((data.fog && data.fog.color) ? hexStrToNum(data.fog.color) : voidTintFor(env)),
    gradeProfile
  );
  const fogColorObj = new THREE.Color(fogColorNum);
  // GR3: the interior fog DEFAULT is now the kit's own fogWhisper (tileKit.fogWhisper, GR3 addition) —
  // "fog off by default except a whisper where the realm earns it" REPLACES the old ad-hoc per-kit
  // `fog.density` numbers (0.02-0.035, GR1-era, no shared rationale). study-rig fog variant (d/f):
  // `variant.fog === false` still swaps in a near-zero-density FogExp2 instead of removing S.scene.fog
  // outright — placeCamera (above) unconditionally reads S.scene.fog.near/far when it exists, and
  // setBoard's own combat path expects SOME fog object to mutate .color on, so a null fog would
  // silently break the NEXT combat render rather than this one.
  const fogWhisper = (typeof kit.fogWhisper === "number" && isFinite(kit.fogWhisper)) ? kit.fogWhisper : 0;
  const fogDensity = variant.fog === false ? 0.0015 : fogWhisper;
  if(S.scene){
    S.scene.background = fogColorObj;
    S.scene.fog = new THREE.FogExp2(fogColorObj, fogDensity);
  }
  if(S.renderer) S.renderer.setClearColor(fogColorObj, 1);

  S.lightPropAnchor = null; // interior boards carry no light-prop registry mapping (data.light absent) — plain profile lighting
  // interior boards may name their own profile (the tile kits are dark-value surfaces; the "dark"
  // default reads near-black on them — study card v1/v2). Falls back to the standing default.
  if(!preserveInteriorLighting){
    applyLightProfile((data.lightProfile && LIGHT_PROFILES[data.lightProfile]) ? data.lightProfile : LIGHT_DEFAULT_PROFILE);
  }

  // LIGHT-CLOSE unit (2026-07-11) — hoisted OUTSIDE `if(rigOn)` below: the fill-number override
  // (rigOn-gated, unchanged) AND two NEW consumers that must see the SAME classification regardless of
  // the study-rig flag — interiorBuildLights' bright-practical suppression (its own call site, below)
  // and the cosmic albedo lift (floor/wall instance-color construction, further below) — both need
  // isBrightRealm/isEmissiveRealm even on a rigOn===false capture. S.lightProfileKey is already final
  // (set a moment ago by applyLightProfile above).
  // docs/DIEGETIC-LIGHT.md L-4 / docs/LIGHT-SIGHT-POLISH.md P-1 — BRIGHT-REALM HEMISPHERE: daylit/
  // overcast/moonlit are the sun/moon/sky's OWN diegetic reach — they get a per-realm bright-fill row
  // (ITR_BRIGHT_REALM_FILL / itrBrightRealmFillFor, above) instead of the dim single-torch dungeon
  // model below (this is the "daylit lost-world reads darker than a torchlit crypt" inversion Adam
  // caught). P-1's own fix: this used to be ONE global set of numbers (tuned for lost-world's dark
  // jungle albedo) applied to every bright realm alike — suburb's much lighter kit blew out under
  // lost-world's numbers. Now keyed on data.realmId, with a luminance-derived fallback for any realm
  // with no explicit row.
  const isBrightRealm = ITR_BRIGHT_PROFILES.has(S.lightProfileKey);
  // docs/LIGHT-SIGHT-POLISH.md P-1 problem 2 — cosmic's voidlit gets its OWN dim/cool/legible path
  // (ITR_EMISSIVE_SCENE_*, above), distinct from both the dim dungeon default and the sunlit numbers.
  const isEmissiveRealm = !isBrightRealm && !itrCtxEmissiveFillDisabled() && ITR_EMISSIVE_PROFILES.has(S.lightProfileKey);
  // LIGHT-CLOSE — COSMIC ALBEDO LIFT gate: a SEPARATE test-only flag from the emissive-light toggle
  // just above (ITR_EMISSIVE_ALBEDO_LIFT_DISABLED_FOR_TEST, near ITR_EMISSIVE_ALBEDO_LIFT) so a harness
  // can isolate the geometry-albedo lift's OWN contribution to roomMean, independent of the ambient/
  // hemi/key/fill numbers ITR_EMISSIVE_FILL_DISABLED_FOR_TEST already gates.
  const applyEmissiveAlbedoLift = isEmissiveRealm && !itrCtxEmissiveAlbedoLiftDisabled();

  // BW2-4 THE VALUE PLUNGE (docs/BEAUTY-WAVE-2.md §BW2-4, item 1) — interior scene-wide fill drop.
  // applyLightProfile just (a) floored ambient to STAGE_AMBIENT_FLOOR, (b) rebuilt the profile's own
  // overhead fill point(s) into S.pointLights. Both flatten the value structure the mocks avoid and
  // wash out the torch cast-shadows (addendum: shadows must READ). Drop all three here so the torch/
  // lamp data.lights carry the scene. Gated behind rigOn so the study-rig's honest "no GR3" baseline
  // (variant.rig === false) is untouched. MUST run BEFORE interiorBuildLights + startLightFlicker below
  // so the flicker bases (startLightFlicker snapshots S.pointLights[i].intensity) capture the plunged
  // fill, not the pre-plunge value. See ITR_SCENE_* constants (near HEMI_*) for the tuned numbers.
  if(rigOn && !preserveInteriorLighting){
    const brightFill = isBrightRealm ? itrBrightRealmFillFor(data.realmId, kit) : null;
    // BW2-4b item 6 — THE GLOOM LIFT: gloom ONLY gets a small ambient bump (fantasy is the reference
    // register — never brightened). Every other non-bright/non-emissive realm keeps ITR_SCENE_AMBIENT
    // exactly.
    const gloomLift = (data.realmId === "gloom") ? ITR_GLOOM_AMBIENT_LIFT : 0;
    if(S.ambientLight) S.ambientLight.intensity = isBrightRealm ? brightFill.ambient : isEmissiveRealm ? ITR_EMISSIVE_SCENE_AMBIENT : (LIGHT_TUNABLES.sceneAmbient + gloomLift);
    if(S.hemiLight) S.hemiLight.intensity = isBrightRealm ? brightFill.hemi : isEmissiveRealm ? ITR_EMISSIVE_SCENE_HEMI : ITR_SCENE_HEMI;
    (S.pointLights || []).forEach((l) => { l.intensity *= isBrightRealm ? brightFill.fillScale : isEmissiveRealm ? ITR_EMISSIVE_SCENE_FILL_SCALE : ITR_SCENE_FILL_SCALE; });
    // BW2-4b item 1 — THE BRIGHTNESS LAW: dim the tabletop key/fill DirectionalLights to a whisper for
    // the interior channel. They light a camera-facing billboard's normal at N·L~0.6, so at the mount
    // default (0.72/0.22) a sprite reads ~0.5 of full-bright everywhere BEFORE any torch — "full
    // brightness even in the dark", the exact thing the law forbids. setBoard restores the tabletop
    // values on its own path (mirroring the hemi restore just above the shadowMap toggle there).
    // L-4/P-1: bright realms restore these MOST of the way toward that tabletop default (sunlit, not
    // dim, and scaled per-realm); cosmic gets a faint star-key, well under the bright numbers.
    if(S.keyLight) S.keyLight.intensity = isBrightRealm ? brightFill.key : isEmissiveRealm ? ITR_EMISSIVE_SCENE_KEY : ITR_SCENE_KEY;
    if(S.fillLight) S.fillLight.intensity = isBrightRealm ? brightFill.fill : isEmissiveRealm ? ITR_EMISSIVE_SCENE_FILL : ITR_SCENE_FILL;
    // BW2-4b item 2 — camera-key: mount/refresh the soft fill DirectionalLight from the camera's general
    // direction (L-2: no longer a shadow source by default — see ITR_CAMERA_KEY_CASTS_SHADOW).
    mountInteriorCameraKey(cx, cz);
    mountSpriteCameraFill();
  }
  // BW2-4b item 1 — REALM GRADE on the sprite floor: tint the emissive readability floor toward this
  // realm's grade (kit.gradeTint) at ITR_SPRITE_TINT_STRENGTH so a lit standee reads the realm (chrome
  // cool, fantasy warm) even out of torch reach. White when the kit carries no grade or the study rig is
  // off. Set BEFORE interiorBuildPieces below (it bakes the emissive color at material-build time).
  {
    const gt = (rigOn && kit.gradeTint) ? hexStrToNum(kit.gradeTint) : null;
    if(gt == null){ itrCtxSetSpriteEmissiveTint(0xffffff); }
    else {
      const s = ITR_SPRITE_TINT_STRENGTH, inv = 1 - s;
      const r = Math.round(255 * inv + ((gt >> 16) & 255) * s);
      const g = Math.round(255 * inv + ((gt >> 8) & 255) * s);
      const b = Math.round(255 * inv + (gt & 255) * s);
      itrCtxSetSpriteEmissiveTint((r << 16) | (g << 8) | b);
    }
  }
  // -> the pass context (see THE PASS OBJECT in this file's header)
  pass.env = env;
  pass.kit = kit;
  pass.rigOn = rigOn;
  pass.isBrightRealm = isBrightRealm;
  pass.applyEmissiveAlbedoLift = applyEmissiveAlbedoLift;
}

/* PHASE 5 (realizePhaseSurfaces) — materialsOn, the cosmic albedo lift, floor/wall/pillar
   textures, the AO instance pass, S.interiorFloorTopMap, the piece sight points, and the floor
   InstancedMesh. VERBATIM from theater-boot.js lines 5675-5763. */
function realizePhaseSurfaces(pass){
  const { data, variant, b, cx, cz, kit, applyEmissiveAlbedoLift, occlusionCameraPos } = pass;

  // GR1 (docs/GRAPHICS-ENGINE.md build unit GR1): floor/wall each bake their own REALM_MATERIALS
  // painter into a real CanvasTexture (interiorMaterialTexture, above) — replaces the old flat-pattern
  // texture entirely, per GR1's own "replace the current flat/pattern textures" instruction. The study
  // rig's `variant.materials === false` (dev/battle-gate/capture-interior-study.mjs's before/after
  // card) drops back to texture:null (a flat single-color material, interiorBuildInstancedMesh's own
  // "no texture" branch) so a materials-off shot is an honest OLD-FLAT baseline, not the retired
  // pattern texture (which no longer exists) — product callers never set this flag, so this is a no-op
  // everywhere except the study card.
  // BW2-3 MATERIAL TEXEL (GENERATED-FIRST seam): a folded PACKET-02 texture FILE (kit.*TextureFile,
  // chosen by interiorBuildBoard's VARIANT ROLL — flagships only) WINS; the procedural REALM_MATERIALS
  // painter (interiorMaterialTexture) is the FALLBACK for the 9 non-flagship realms. Exactly
  // `interiorSurfaceFileTexture(...) || <procedural>`. `variant.materials === false` (study rig) still
  // drops to null (flat) for an honest OLD-FLAT baseline, ahead of both branches.
  const materialsOn = variant.materials !== false;
  // LIGHT-CLOSE — COSMIC ALBEDO LIFT (ITR_EMISSIVE_ALBEDO_LIFT, near ITR_EMISSIVE_SCENE_* above): the
  // procedural texture painter (interiorMaterialTexture) bakes pixels directly off its baseColorHex
  // argument, so lifting the base HERE — before it's ever painted — lifts the material itself. Only the
  // emissive/voidlit path's floor/wall base color is ever touched; every other realm's floorColorForRender/
  // wallColorForRender is byte-identical to kit.floorColor/kit.wallColor.
  const floorColorForRender = applyEmissiveAlbedoLift ? itrScaleHexValue(kit.floorColor, ITR_EMISSIVE_ALBEDO_LIFT) : kit.floorColor;
  const wallColorForRender = applyEmissiveAlbedoLift ? itrScaleHexValue(kit.wallColor, ITR_EMISSIVE_ALBEDO_LIFT) : kit.wallColor;
  const floorTex = materialsOn
    ? (interiorSurfaceFileTexture("floor", kit.floorTextureFile, kit.floorTextureWrap)
        || interiorMaterialTexture(kit.floorMaterial, floorColorForRender, data.realmId + ":floor", kit.floorGrain,
            Math.max(1, b.maxX - b.minX + 1), Math.max(1, b.maxZ - b.minZ + 1)))
    : null;
  const wallTex = materialsOn
    ? (interiorSurfaceFileTexture("wall", kit.wallTextureFile, kit.wallTextureWrap)
        || interiorMaterialTexture(kit.wallMaterial, wallColorForRender, data.realmId + ":wall", kit.wallGrain,
            1, Math.max(1, data.wallHeightBase || 1)))
    : null;
  // BW2-3 §2b COLUMNS: pillars take the WALL sheet (per-face planar from the wall texture at matching
  // texel), null on a non-flagship realm OR materials-off — the pre-BW2-3 flat-colored pillar. (TRIM:
  // the folded trim strip is registered on the tileKit (kit.trimTextureFile) + REALM_TEXTURES but is
  // NOT GL-wired this unit — its only candidate geometry today is the BW2-5 arch doorframe, which BW2-4
  // deliberately plunges to near-black, and a baseboard/cornice STRIP stretched over a big arch prism
  // reads wrong. Trim awaits a dedicated trim-run geometry, unchanged from the pre-BW2-3 "trim stays
  // flat, registry data not yet GL-wired" note — the arrival is folded + staged, honest, just not
  // force-fit onto the wrong surface.)
  // BW2-4b item 4 — PILLAR TEXTURE: pillars now take the SAME fully-resolved wallTex the walls do
  // (file texture on flagships, procedural REALM_MATERIALS fallback on the other 9 realms), not the
  // file-only lookup that left every non-flagship pillar an untextured flat monolith (the loop-05
  // black-pillar read). "columns take the WALL sheet" (BW2-3 §2b), now on every realm per the UV laws.
  const pillarTex = materialsOn ? wallTex : null;

  // study-rig AO variant (b/e/f): darken instance colors at wall-floor seams (interiorApplyAODarkening,
  // above) — operates on a SHALLOW-CLONED instances object so the caller's own `data` (which may be
  // S.lastBoard, replayed by setInteriorVariant below) is never mutated in place.
  const inst = variant.ao
    ? interiorApplyAODarkening({
        floor: (data.instances && data.instances.floor || []).map((o) => Object.assign({}, o)),
        wall: (data.instances && data.instances.wall || []).map((o) => Object.assign({}, o)),
        doorframe: (data.instances && data.instances.doorframe || []).map((o) => Object.assign({}, o)),
        pillar: (data.instances && data.instances.pillar || []).map((o) => Object.assign({}, o)),
      }, variant.aoFactor)
    : (data.instances || {});
  // BW2-2 — THE FLOOR CONTACT LAW: one lookup, built off THIS board's own real floor instances
  // (inst.floor, post-AO-clone above), cached on S so setUnits (a separate, later call against the
  // SAME mounted board) can reuse it without rebuilding — see this file's own FLOOR CONTACT LAW header
  // comment (interiorFloorTopMapFrom/interiorFloorTopAt) for the derivation this replaces the old
  // hardcoded -0.5/-0.4 assumptions with.
  S.interiorFloorTopMap = interiorFloorTopMapFrom(inst.floor);
  // S-1 OCCLUSION FADE (docs/DIEGETIC-LIGHT.md) — sight points computed ONCE here (needs
  // S.interiorFloorTopMap, just set above) and shared by BOTH the wall-occlusion and pillar-occlusion
  // masks below; BW2-1b's own pillar-only cutaway used to compute this locally further down this
  // function — hoisted so walls (which never got a sightline-based treatment at all before S-1, only
  // the unconditional focusRect parapet below) get the identical treatment.
  const itrSightPoints = occlusionCameraPos ? itrPieceSightPoints(data.pieces, cx, cz, S.interiorFloorTopMap) : [];
  // BW2-3: file-textured surfaces neutralize their per-cell color to a value multiplier (the texture
  // carries the hue). floorFromFile/wallFromFile track which branch floorTex/wallTex resolved from.
  const floorFromFile = materialsOn && !!kit.floorTextureFile;
  const wallFromFile = materialsOn && !!kit.wallTextureFile;
  // LIGHT-CLOSE — COSMIC ALBEDO LIFT: the procedural (non-file) floor list carries RAW baked absolute
  // colors (theater-interior.js's own itrDarkenHex passes off the AUTHORED kit.floorColor) — multiplied
  // straight against floorTex, which now paints at the LIFTED floorColorForRender above. Route them
  // through the SAME itrNeutralizeInstanceColors the from-file branch already uses, referenced against
  // the ORIGINAL (un-lifted) kit.floorColor — this re-expresses each cell's raw color as a per-cell
  // VALUE MULTIPLIER (its own tone/jitter/darkening, clamped ~1.2) relative to the realm's own base tone,
  // so the lift lives ENTIRELY in the (already-lifted) texture and never double-applies. Never touched
  // on a non-emissive realm — floorList stays exactly `inst.floor`, byte-identical to before this unit.
  const floorList = (floorFromFile || applyEmissiveAlbedoLift)
    ? itrNeutralizeInstanceColors(inst.floor, kit.floorColor)
    : inst.floor;
  const floorMesh = interiorBuildInstancedMesh(floorList, cx, cz, floorTex, variant, "floor");
  // STAGE-A A1 test seam, mirrors S.interiorLastWallList/S.interiorLastPillarList's own convention —
  // the exact per-instance list the live floorMesh was built from (dev/verify-active-room-only.mjs
  // reads this to assert no floor instance falls inside a non-kept neighbor room's rect).
  S.interiorLastFloorList = floorList;
  // -> the pass context (see THE PASS OBJECT in this file's header)
  pass.materialsOn = materialsOn;
  pass.floorColorForRender = floorColorForRender;
  pass.wallColorForRender = wallColorForRender;
  pass.wallTex = wallTex;
  pass.pillarTex = pillarTex;
  pass.inst = inst;
  pass.itrSightPoints = itrSightPoints;
  pass.floorFromFile = floorFromFile;
  pass.wallFromFile = wallFromFile;
  pass.floorList = floorList;
  pass.floorMesh = floorMesh;
}

/* PHASE 6 (realizePhaseWallsDoors) — the camera-side cutaway band, BW2-5's wall parapet cut, the
   S-1/A4 wall + doorframe ankle-stub/ghost split, the wall/door InstancedMeshes, and the door
   mount map. VERBATIM from theater-boot.js lines 5764-5919. */
function realizePhaseWallsDoors(pass){
  const { data, variant, cx, cz, kit, rigOn, inst, wallTex, wallFromFile, applyEmissiveAlbedoLift,
         itrSightPoints, occlusionCameraPos, occlusionHoldPrior } = pass;
  // CUTAWAY WALLS (study card v4; BEAUTY-WAVE-2.md BW2-5 item 2 amendment): when the board frames a
  // focus room, the room's CAMERA-SIDE perimeter walls drop to a PARAPET so the camera sees INTO the
  // room instead of at the outside face of a (possibly scale-domain-tall) wall — the standard dungeon-
  // view cutaway. PRE-BW2-5 this dropped every camera-side wall to a FIXED absolute height (KNEE=0.35
  // world units, ~15% of the base 2.4 wall height) regardless of the room's own (possibly scaled)
  // wall height — thin enough to read as barely-there rather than "a box you look into" (the finale
  // mock's parapet rim). BW2-5's amendment: "full walls drop to parapet, never to nothing" — a
  // Adam's 2026-07-26 ruling replaces the proportional parapet with a canonical one-foot plan stub.
  // One world unit is five feet, so the retained opaque geometry reaches 0.2u and never grows a wall
  // that was already structurally lower than that.
  // Computed from the camera yaw AT BUILD TIME (a later user rotate keeps the same cutaway until the
  // next board build — acceptable v1, noted here on purpose).
  const ITR_CUTAWAY_STUB_HEIGHT_U = ITR_OCCLUSION_STEM_HEIGHT_U;
  // KS-3b item 2 (docs/KENNEY-SOCKET-WAVE.md) — itrCameraSideBand: the "is this WORLD (x,z) on the
  // camera-facing side of the room's own focusRect band" test, hoisted out of the wallList map below
  // into its own closure so the kit-shell wall mounting call further down this function (which never
  // had ANY cutaway treatment before this unit — the ORCHESTRATOR flag this fixes) can apply the
  // IDENTICAL test to donor wall RUNS instead of a second, driftable copy of the same yaw/dot-product
  // math. A board with no framed room (data.focusRect absent) reports "never camera-side" for every
  // position — full height everywhere, byte-identical to every pre-KS-3b board.
  let itrCameraSideBand = function(){ return false; };
  if(data.focusRect){
    const fr = data.focusRect;
    const yawNow = (S.rotationStep * 90 * Math.PI) / 180 + (CAM_YAW_OFFSET_DEG * Math.PI) / 180;
    const dirX = Math.sin(yawNow), dirZ = Math.cos(yawNow);
    itrCameraSideBand = function(x, z){
      const inBand = x >= fr.minX - 1 && x <= fr.maxX + 1 && z >= fr.minZ - 1 && z <= fr.maxZ + 1;
      if(!inBand) return false;
      const rx = x - cx, rz = z - cz;
      return (rx * dirX + rz * dirZ) > 0;
    };
  }
  let wallList = inst.wall;
  if(data.focusRect){
    wallList = inst.wall.map(function(wi){
      if(!itrCameraSideBand(wi.x, wi.z)) return wi;         // far-side / out-of-band walls stay full height
      const fullH = wi.sy || 1;
      const stubH = Math.min(fullH, ITR_CUTAWAY_STUB_HEIGHT_U);
      if(fullH <= stubH) return wi;                         // already at/under stub height — never GROWS a wall
      return Object.assign({}, wi, { sy: stubH });
    });
  }
  // S-1 OCCLUSION FADE (docs/DIEGETIC-LIGHT.md) — separate concern from the focusRect PARAPET just
  // above (that's whole-room camera-side framing, unconditional on any actual figure; this is
  // per-figure sightline occlusion, the SAME itrPillarCutawayMask segment-vs-AABB test the pillar path
  // below already used, generalized to walls — which never got a sightline-based treatment before this
  // unit). Runs against wallList AFTER the parapet (so an already-parapetted near wall's smaller box is
  // what's actually tested); any instance whose box sits on a camera->figure segment gets split into an
  // ankle-height solid stub (rendered here, in the normal opaque wallMesh) + a ~5% ghost of the
  // removed upper portion (rendered in the separate wallGhostMesh below — its own draw call, only
  // built when at least one wall instance is actually occluding this frame).
  // STAGE-A A4: the raw mask is UNCHANGED math (itrPillarCutawayMask); what's new is that the split
  // decision now runs through itrOcclusionClassify (persistent per-id state + hysteresis hold) instead
  // of splitting on the raw mask directly — `entry.fading` (blocking, or still easing back up from a
  // fade-out) decides whether THIS build renders the split, not the instantaneous raw test alone.
  let wallGhostList = [];   // flat descriptor list — S.interiorLastWallGhostList's own established shape
  let wallGhostBuild = [];  // {inst, fadeEntry} pairs — drives the individually-tweened ghost meshes below
  if(!itrCtxOcclusionFadeDisabled() && itrSightPoints.length && wallList.length){
    const wallOcclusionMask = itrPillarCutawayMask(wallList, occlusionCameraPos, itrSightPoints, cx, cz);
    const wallAnkleH = itrOcclusionAnkleHeight(data.wallHeightBase);
    wallList = wallList.map(function(wi, i){
      const id = itrOcclusionIdFor("wall", wi.x, wi.z, wi.yBase);
      const entry = itrOcclusionClassify(id, !!wallOcclusionMask[i], occlusionHoldPrior);
      if(!entry.fading) return wi;
      const split = itrSplitOccluderForAnkleGhost(wi, wallAnkleH);
      if(split.ghost){
        wallGhostList.push(split.ghost);
        wallGhostBuild.push({ inst: split.ghost, fadeEntry: entry });
      }
      return split.stub;
    });
  }
  S.interiorLastWallList = wallList; // S-1 test seam, mirrors S.interiorLastPillarList's own convention
  S.interiorLastWallGhostList = wallGhostList;
  // LIGHT-CLOSE — COSMIC ALBEDO LIFT: same "the lift lives in the texture, instances become a relative
  // value multiplier" mechanism as the floor list above (never a double-apply).
  const wallMesh = interiorBuildInstancedMesh(
    (wallFromFile || applyEmissiveAlbedoLift) ? itrNeutralizeInstanceColors(wallList, kit.wallColor) : wallList,
    cx, cz, wallTex, variant, "wall");
  // STAGE-A A4: ONE small ghost mesh PER blocking instance (never a big shared material carrying every
  // ghost of a kind at one flat alpha) — each instance's own live tween mutates ONLY its own material,
  // so two simultaneously-fading walls at different progress never fight over a shared opacity value.
  const wallGhostMesh = wallGhostBuild.length ? itrBuildOcclusionGhostMeshes(
    wallGhostBuild.map(function(pair){
      return {
        inst: (wallFromFile || applyEmissiveAlbedoLift) ? itrNeutralizeInstanceColors([pair.inst], kit.wallColor)[0] : pair.inst,
        fadeEntry: pair.fadeEntry
      };
    }),
    cx, cz, wallTex, variant, "wall") : null;
  // BW2-4b item 4 — DOORFRAME VALUE + TEXTURE. The doorframe ships trimColor as its instance color; a
  // textured InstancedMesh MULTIPLIES its map by that per-instance color, so a dark trim double-darkened
  // the wallTex to a pure-black slab (the loop-02 black-monolith arch — the exact bug the WALL
  // neutralization one section up already solved). When textured, NEUTRALIZE the doorframe color to a
  // value multiplier (relative to the wall base, same as the wall path) so the arch shows the wall
  // texture at proper value, THEN apply the recess-darken (ITR_SCENE_DOORFRAME_VALUE) so it reads a
  // touch darker than the wall — a recessed textured stone arch, per the mock. Untextured (no wallTex)
  // keeps the old plain trim-value darken. rigOn-gated so the study baseline stays honest.
  // Resolve this before the doorframe fallback is built: on the compiled-shell path the wall compiler
  // owns the doorway socket, so the old three-prism doorway construction must not render at all. Kit
  // shells still use the legacy/fallback instances because they do not consume compileRoomShell.
  const useCompiledRoomShell = itrCtxGetRoomShell() && !((data.kitShellWalls && data.kitShellWalls.length) || (data.kitShellFloors && data.kitShellFloors.length));
  // door-mount map for THIS rebuild (doorAxes + live tune; writes S.doorMountReport)
  const doorMountMap = itrDoorMountMapFrom(data.doorAxes);
  const doorframeFallbackSource = useCompiledRoomShell ? [] : (inst.doorframe || []);
  let doorList = wallTex
    ? itrNeutralizeInstanceColors(doorframeFallbackSource, kit.wallColor).map((d) => Object.assign({}, d, { color: itrScaleHexValue(d.color, ITR_SCENE_DOORFRAME_VALUE) }))
    : (rigOn ? doorframeFallbackSource.map((d) => Object.assign({}, d, { color: itrScaleHexValue(d.color, ITR_SCENE_DOORFRAME_VALUE) })) : doorframeFallbackSource);
  doorList = itrApplyDoorMounts(doorList, doorMountMap); // socket the frame into its wall (clone, never a mutation)
  // DOORFRAME OCCLUSION FIX (found live re-gating dev/verify-bw2-1b-occlusion.mjs --with-render, checks
  // 31/32/35): doorframes (the main frame body AND BW2-5's own arch-header prisms) were NEVER wired into
  // the S-1/A4 occlusion classify pass — only wall/pillar/furniture were (this unit's own STAGE-A A4
  // header comment, several hundred lines up, lists exactly those three). A doorframe is real, permanent
  // dungeon architecture — connecting-room doorways sit on genuine camera->standee sightlines the same
  // way a wall or pillar can (confirmed empirically: a real THREE.Raycaster hit two of a real seeded
  // room's own arch-header prisms, at their true authored width — 0.736/0.56 fractions of the 0.8 base,
  // a deliberately NARROWING taper per the arch's own build comment above, not an inflated hitbox — on a
  // real camera->standee sightline from a wide multi-corner "beat" fit). Root cause was a genuine
  // coverage gap, not a geometry bug: SAME per-instance itrPillarCutawayMask + itrOcclusionClassify +
  // itrSplitOccluderForAnkleGhost pattern the wall pass above already runs, applied here to `doorList`
  // (which is ALREADY fully color-resolved by this point — the neutralize/ITR_SCENE_DOORFRAME_VALUE
  // darken just above — so a stub/ghost split inherits the correct final color directly with no separate
  // late-color step, unlike wall/pillar's own two-stage pipeline whose neutralize runs AFTER classify).
  // Each of the door's 1-3 prisms (main body, archStep1, archStep2) classifies independently — the SAME
  // per-instance-id discipline itrOcclusionIdFor's own yBase-discrimination already established for a
  // tapered pillar's stacked shaft+cap. This also depends on itrPillarCutawayMask's own yBase fix (see
  // that function's own header) — without it, the arch-header prisms' near-ceiling boxes would have been
  // tested as if sitting near the floor, silently missing the exact instances a real sightline hits.
  let doorGhostList = [];   // flat descriptor list, mirrors S.interiorLastWallGhostList's own shape
  let doorGhostBuild = [];  // {inst, fadeEntry} pairs — drives the individually-tweened ghost meshes below
  if(!itrCtxOcclusionFadeDisabled() && occlusionCameraPos && doorList.length && itrSightPoints.length){
    const doorOcclusionMask = itrPillarCutawayMask(doorList, occlusionCameraPos, itrSightPoints, cx, cz);
    const doorAnkleH = itrOcclusionAnkleHeight(data.wallHeightBase);
    doorList = doorList.map(function(di, i){
      const id = itrOcclusionIdFor("doorframe", di.x, di.z, di.yBase);
      const entry = itrOcclusionClassify(id, !!doorOcclusionMask[i], occlusionHoldPrior);
      if(!entry.fading) return di;
      const split = itrSplitOccluderForAnkleGhost(di, doorAnkleH);
      if(split.ghost){
        doorGhostList.push(split.ghost);
        doorGhostBuild.push({ inst: split.ghost, fadeEntry: entry });
      }
      return split.stub;
    });
  }
  // BW2-4b item 4 — DOORFRAME TEXTURE: doorframes carried texture=null (an untextured flat prism), then
  // the BW2-4 value-plunge darkened them to near-black — the loop-05/loop-02 "black monolith arch". Now
  // they take the SAME wallTex the walls/pillars do (per-face planar for the vertical prism), with the
  // darkened-trim instance color kept (NOT neutralized) so the arch reads as textured dark stone with a
  // whisper of the trim accent hue — the mock's dark textured archway, not a flat black block.
  const doorMesh = interiorBuildInstancedMesh(doorList, cx, cz, wallTex, variant, "doorframe");
  // STAGE-A A4: ONE small ghost mesh PER blocking doorframe instance — same "never a big shared material
  // carrying every ghost of a kind" mandate the wall/pillar ghost builds above already keep.
  const doorGhostMesh = doorGhostBuild.length ? itrBuildOcclusionGhostMeshes(doorGhostBuild, cx, cz, wallTex, variant, "doorframe") : null;
  // STAGE-A A1 test seams, same convention as S.interiorLastFloorList/WallList/PillarList above.
  S.interiorLastDoorList = doorList;
  S.interiorLastDoorGhostList = doorGhostList; // S-1/A4 test seam — the separately-drawn doorframe ghosts
  S.interiorLastPortalList = data.portals || [];
  // -> the pass context (see THE PASS OBJECT in this file's header)
  pass.itrCameraSideBand = itrCameraSideBand;
  // KS-3b's kit-wall cutaway (realizePhaseKitShells) multiplies the SAME authored fraction into its own
  // holders — one shared constant, never a drifted duplicate — so it crosses the seam with the closure
  // it belongs to rather than being re-declared downstream.
  pass.ITR_CUTAWAY_STUB_HEIGHT_U = ITR_CUTAWAY_STUB_HEIGHT_U;
  pass.wallList = wallList;
  pass.wallMesh = wallMesh;
  pass.wallGhostMesh = wallGhostMesh;
  pass.useCompiledRoomShell = useCompiledRoomShell;
  pass.doorMountMap = doorMountMap;
  pass.doorMesh = doorMesh;
  pass.doorGhostMesh = doorGhostMesh;
}

/* PHASE 7 (realizePhaseShell) — the C4 ROOM-SHELL COMPILER — shell cells, edge factor, materials,
   the per-segment colour samplers, compileRoomShell, the C4.1b wall-upper blocking sets, the wall-
   omission report, and every shell mesh (floor/stem/upper/trim/riser) plus
   S.interiorLastRoomShell. VERBATIM from theater-boot.js lines 5920-6331. */
function realizePhaseShell(pass){
  const { data, variant, cx, cz, kit, inst, materialsOn, floorColorForRender, wallColorForRender,
         floorList, floorFromFile, wallFromFile, applyEmissiveAlbedoLift, useCompiledRoomShell,
         occlusionCameraPos, occlusionHoldPrior } = pass;

  // KS-3 (docs/KENNEY-SOCKET-WAVE.md) — the C4 room-shell compiler builds ONE continuous polygon/wall-
  // stem mesh from `floorList`'s own cell set, entirely INDEPENDENT of the discrete `inst.wall` cell
  // array (its wall stem is offset from the floor polygon's own boundary contour, never built from
  // individual wall-cell boxes) — so a kit wall module and the compiled shell's own continuous stem
  // would occupy the SAME physical space at every kit-claimed run (found live: a visible double-wall
  // moire in the first real capture). The compiled shell and the per-cell floorMesh/wallMesh pair below
  // are ALREADY a mutually-exclusive either/or (itrFloorWallMeshes, a few hundred lines down) gated on
  // ITR_ROOM_SHELL alone; useCompiledRoomShell extends that SAME gate so a board this build's own
  // kitShellWalls/kitShellFloors actually claimed something for renders via the per-cell prism path
  // INSTEAD (floorMesh/wallMesh, which floorList/wallList already derive from the kit-skipped
  // inst.floor/inst.wall — the same backing my pure-data harness proved gap/overlap-free), never both
  // systems at once. A board with nothing kit-claimed (KIT_SHELL_ENABLED off, or a shape/scale this
  // unit's own eligibility tests exclude) is COMPLETELY UNAFFECTED — useCompiledRoomShell reduces to
  // the bare ITR_ROOM_SHELL flag, byte-identical to pre-KS-3.
  // `useCompiledRoomShell` is resolved above the fallback-doorframe render path so that path can omit
  // its applied prisms when this compiler owns the socket. Its shell/per-cell exclusivity law remains
  // unchanged here.

  // ═══ ROOM-SHELL COMPILER (docs/ROOM-SHELL-COMPILER.md; docs/GRAPHICS-NORTH-STAR.md Stage C unit
  // C4) — compiles the active room's own floor cells into a CONTINUOUS shell (one triangulated floor
  // polygon per elevation tier + wall/riser quad-strips from boundary segments) instead of the per-
  // cell floorMesh/wallMesh InstancedMesh pair above, when useCompiledRoomShell is true (ITR_ROOM_SHELL
  // on AND — KS-3 — this board has nothing kit-claimed). Built straight off `floorList`/`data.doorAxes`
  // — the SAME data interiorBuildBoard already produced; this unit never re-reads plan.cells, per the
  // spec's own "keep interiorBuildBoard as the data producer, the compiler is render-only" instruction.
  // Pillars/doorframe/skirt/portals/dressing/lights/standees below are UNTOUCHED (they still read
  // S.interiorFloorTopMap, built earlier off `inst.floor` regardless of this flag).
  let roomShellMeshes = [];
  S.interiorLastRoomShell = null;
  if(useCompiledRoomShell && floorList && floorList.length){
    // doorAxes is the authoritative one-row-per-door data seam. The old frame list has THREE rows per
    // door and is now only a non-shell fallback, so deriving apertures from it would couple the real
    // wall socket back to the very applied geometry this path retires.
    const shellDoorSources = (data.doorAxes && data.doorAxes.length) ? data.doorAxes : (inst.doorframe || []);
    const doorKeySet = new Set(shellDoorSources.map((d) => Math.round(d.x) + "," + Math.round(d.z)));
    const shellCells = floorList.map((f) => {
      const sy = (typeof f.sy === "number" && Number.isFinite(f.sy)) ? f.sy : ITR_FLOOR_HEIGHT_FALLBACK;
      return {
        x: Math.round(f.x), z: Math.round(f.z),
        tier: Math.round(sy / ROOM_SHELL_TIER_QUANTUM),
        elevationY: ITR_FLOOR_BASE_Y + sy,
        isDoor: doorKeySet.has(Math.round(f.x) + "," + Math.round(f.z)),
      };
    });
    // BRIGHTNESS-REGRESSION FIX — THE RESIDUAL-FALLOFF TERM. Measured directly (a controlled gloom
    // fixture, per-cell vs compiled, same torch/camera): the per-cell path's own floorList[].color
    // (VP3 tone/jitter/valueScript/rim-vignette, now correctly carried over as vertex color above)
    // only accounts for a SMALL fraction of why a far-room corner reads dark — corner vs mid-room
    // color differed by just ~12% (#b3b3b3 vs #cbcbcb in the fixture) while the REAL per-cell RENDER
    // differed by >2x. The rest is real diegetic falloff (the torch's own physical distance decay +
    // shadow-casting geometry) that the per-cell path's discrete wall/pillar BOXES apparently occlude
    // more completely near a room's own corner than the compiled shell's continuous (bevel-inset) wall
    // does — a real, screenshot-measured render difference this unit closes with an explicit residual
    // EDGE FACTOR (the directive's own "low-frequency AO... perimeter darkening", now calibrated to the
    // measured gap rather than guessed): darkens floor/wall tone further as a cell nears the room's own
    // true boundary (a SEPARATE, smaller-scope term than VP3's own per-cell tone — this is architecture-
    // level "near the wall" shading, same spirit as real-time AO). Never touches geometry, only the
    // vertex-color tint fed into the SAME floorColorAt/wallColorForSegment lookups below.
    const ITR_ROOM_SHELL_EDGE_MIN = 0.44;
    const ITR_ROOM_SHELL_EDGE_BAND = 2;
    let shellMinX = Infinity, shellMaxX = -Infinity, shellMinZ = Infinity, shellMaxZ = -Infinity;
    shellCells.forEach((c) => {
      if(c.x < shellMinX) shellMinX = c.x; if(c.x > shellMaxX) shellMaxX = c.x;
      if(c.z < shellMinZ) shellMinZ = c.z; if(c.z > shellMaxZ) shellMaxZ = c.z;
    });
    const shellEdgeFactor = (x, z) => {
      const depth = Math.min(x - shellMinX, shellMaxX - x, z - shellMinZ, shellMaxZ - z);
      if(depth >= ITR_ROOM_SHELL_EDGE_BAND) return 1;
      const t = Math.max(0, depth) / ITR_ROOM_SHELL_EDGE_BAND;
      return ITR_ROOM_SHELL_EDGE_MIN + (1 - ITR_ROOM_SHELL_EDGE_MIN) * t;
    };
    // wall height: ANY one raw (pre-parapet, pre-occlusion) wall instance of THIS room shares the
    // room's own scaleDomain-derived height (ITR_ACTIVE_ROOM_ONLY renders one room at a time) — never
    // read off the post-cutaway `wallList` below (a DIFFERENT, deliberately-deferred concern; see the
    // parapet callback's own comment for what IS carried over and what isn't).
    const roomWallHeight = (inst.wall && inst.wall.length && typeof inst.wall[0].sy === "number")
      ? inst.wall[0].sy : (data.wallHeightBase || 2);
    // PARAPET PARITY: reapplies the SAME camera-facing cutaway the per-cell path computes above
    // (BW2-5 item 2) per COMPILED SEGMENT, so the compiled shell doesn't regress "camera sees into the
    // room" — the one piece of the existing per-cell view-dependent machinery this unit carries
    // forward. S-1's PER-FIGURE sightline occlusion ankle-stub/ghost-fade is NOT yet integrated with
    // the compiled wall (a deliberately scoped gap for a fast-follow — see this unit's own report);
    // the compiled wall renders at full (parapet-cut) height regardless of figure occlusion.
    // wallHeightForSegment: C4.1a retires this as the parapet-cut mechanism — every segment now gets
    // its own real full STRUCTURAL height (roomWallHeight); kept accepted by the compiler for a future
    // genuine structural variance (a licensed low/ruined wall roll), never a camera-driven cut.
    const wallHeightForSegment = () => roomWallHeight;
    // C4.1b (docs/WALL-VOLUMES-PRACTICALS.md): the C4.1a static near/far-yaw `upperVisibleForSegment`
    // predicate (a whole-room-band test keyed only on S.rotationStep) is RETIRED here — replaced by a
    // real camera-to-subject ray test against each segment's own upper volume, computed below once
    // `shell.wallSegments` exists (wallUpperRawBlocking) and applied per-mesh through the existing
    // itrOcclusionClassify tween engine at the assembler block. No compiler-level omission changes:
    // the compiler still builds EVERY segment's own upper geometry unconditionally (unchanged from
    // C4.1a) — this unit only changes how the ALREADY-BUILT upper mesh's opacity is driven.
    // per-vertex world-aligned UVs replace the per-instance shared texture.repeat trick (BW2-3 §2b) —
    // a (1,1) repeat variant of the SAME texture family/seed the per-cell path already resolved above
    // (reuse, not a new material — Stage E owns actual material changes, not this unit).
    // BRIGHTNESS-REGRESSION FIX: use floorColorForRender/wallColorForRender (LC-2's own emissive-
    // albedo-lift-aware values, computed once above — `applyEmissiveAlbedoLift ? lifted : kit.color`),
    // NOT the raw kit color — the per-cell path's OWN procedural texture (floorTex/wallTex, built
    // earlier in this function) already paints at the LIFTED value on a lift-eligible realm (cosmic);
    // building the compiled shell's texture off the raw un-lifted kit color silently dropped that lift
    // for the shell path, which is why LC-2 (cosmic's own albedo-lift gate) read almost no improvement
    // between lift-off and lift-on until this fix.
    const roomShellFloorTex = materialsOn
      ? (interiorSurfaceFileTexture("floor", kit.floorTextureFile, kit.floorTextureWrap)
          || interiorMaterialTexture(kit.floorMaterial, floorColorForRender, data.realmId + ":floor:shell", kit.floorGrain, 1, 1))
      : null;
    const roomShellWallTex = materialsOn
      ? (interiorSurfaceFileTexture("wall", kit.wallTextureFile, kit.wallTextureWrap)
          || interiorMaterialTexture(kit.wallMaterial, wallColorForRender, data.realmId + ":wall:shell", kit.wallGrain, 1, 1))
      : null;
    const shellPsxOpts = { worldSurface: true, worldPsxOverride: (variant && typeof variant.worldPsx === "boolean") ? variant.worldPsx : undefined };
    // BRIGHTNESS-REGRESSION FIX (docs/ROOM-SHELL-COMPILER.md close, 2026-07-12): the integration gate
    // (dev/verify-diegetic-light.mjs) caught the compiled shell rendering uniformly too bright — it
    // dropped VP3's own per-cell floor/wall tone entirely (room tone/jitter/perimeter-darken/
    // valueScript/rim-vignette AND, on the emissive realm, the albedo-lift mode-switch below).
    // interiorBuildInstancedMesh's OWN matBase is ALWAYS white (`texture ? {map:texture} :
    // {color:0xffffff}` — texture or no texture, file or procedural, EVERY per-cell caller stays
    // white-base) — 100% of the tone comes from the per-instance COLOR multiplying whatever's there.
    // An EARLIER pass of this fix tried giving the compiled material a flat kit-color BASE for non-
    // file realms (a guess at "reproducing a double multiply") — that was wrong: it created a hard
    // multiplicative CEILING no vertex tint could lift past, which is exactly what silently capped
    // LC-2's own albedo-lift ratio near 1.1x regardless of how strong the lift was pushed (verified:
    // even a 100x lift only moved cosmic's roomMean from 0.023 to 0.026 — proof the ceiling, not the
    // lift math, was the bug). The correct fix: white base ALWAYS (matching per-cell exactly), and
    // the per-VERTEX tint carries floorList's/wallList's OWN already-computed per-cell `.color` value
    // verbatim (whichever branch that realm's per-cell path already resolved — RAW absolute when
    // !fromFile && !lift, NEUTRALIZED relative when fromFile || lift; see floorList's own definition
    // above) — never re-derived here. The emissive-albedo LIFT itself lives entirely in the TEXTURE
    // argument (floorColorForRender/wallColorForRender, above), matching the per-cell path's own
    // documented law. Verified: with this model, `node dev/verify-diegetic-light.mjs` after temporarily
    // forcing ITR_ROOM_SHELL=false (the per-cell path) passes 60/0 including LC-2's own 4.45x ratio —
    // confirming the gate itself is satisfiable and the compiled-shell numbers below are being chased
    // against a real, achievable target, not a moving one.
    // floorLiftOrFile/wallLiftOrFile: the EXACT same branch condition floorList/wallList already use
    // to decide raw-absolute vs neutralized-relative — hoisted here (before the materials) because the
    // material base color needs it too (see ITR_ROOM_SHELL_RAW_COMPENSATION below): a lift-eligible or
    // file-textured realm (gloom, cosmic) stays WHITE base (verified: LC-2 hits 3.40x there — any flat
    // kit-color base creates a hard multiplicative CEILING no vertex tint can lift past, which is what
    // silently capped LC-2's own ratio near 1.1x on an earlier pass of this fix). Only the plain RAW-
    // ABSOLUTE branch (suburb/bright-kingdom/most non-flagship realms — no file, no lift) gets the
    // compensation, since THAT'S the branch measured to still read too bright otherwise (see below).
    const floorLiftOrFile = floorFromFile || applyEmissiveAlbedoLift;
    const wallLiftOrFile = wallFromFile || applyEmissiveAlbedoLift;
    // RAW-ABSOLUTE PROCEDURAL COMPENSATION (measured, suburb/bright-kingdom): even with the vertex
    // tint byte-identical to the per-cell path's own instance color, a realm on the RAW-ABSOLUTE
    // branch still reads measurably brighter compiled than per-cell (suburb daylit ambient-only:
    // roomMax 0.993/clippedFraction 0.41 vs the per-cell target 0.974/0.03) — the residual traces to
    // the procedural canvas texture itself (roomShellFloorTex, a SEPARATELY-keyed ":shell" variant at
    // repeat (1,1)) sampling measurably brighter on average than the per-cell path's own differently-
    // keyed/-repeated texture, a real texture-generation quirk, not a math error in the tint chain. A
    // material-base multiplier (not just a vertex one — verified a vertex-only version of this same
    // compensation barely moved suburb's numbers, since the bright texture dominates) closes it; tuned
    // against the real gate (suburb/bright-kingdom clip checks), never guessed. NEVER applied on the
    // fromFile/lift branch (see the header comment above — that's what broke LC-2 the first time).
    const ITR_ROOM_SHELL_RAW_COMPENSATION = 0.98;
    const floorMat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial(Object.assign(
      roomShellFloorTex ? { map: roomShellFloorTex } : {},
      { color: floorLiftOrFile ? "#ffffff" : itrScaleHexValue(kit.floorColor || "#888888", ITR_ROOM_SHELL_RAW_COMPENSATION), vertexColors: true, side: THREE.DoubleSide })), shellPsxOpts);
    const wallBaseColor = wallLiftOrFile ? "#ffffff" : itrScaleHexValue(kit.wallColor || "#888888", ITR_ROOM_SHELL_RAW_COMPENSATION);
    const wallMat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial(Object.assign(
      roomShellWallTex ? { map: roomShellWallTex } : {}, { color: wallBaseColor, vertexColors: true, side: THREE.DoubleSide })), shellPsxOpts);
    // directive step 7 — risers are a deliberately DARKER material variant, darkened relative to
    // whatever the wall's OWN base tone is above — never a second, independent darken stacked on the
    // wall's already-tinted value. Risers don't (yet) carry their own vertex-color gradient (out of
    // THIS fix's measured scope — no failing gate check reads riser luminance), so `vertexColors:true`
    // here is a no-op today (every riser vertex defaults white) but kept for consistency/future AO.
    const riserMat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial(Object.assign(
      roomShellWallTex ? { map: roomShellWallTex } : {},
      { color: itrScaleHexValue(wallBaseColor, ITR_ROOM_SHELL_RISER_DARKEN), vertexColors: true, side: THREE.DoubleSide })), shellPsxOpts);
    // floorColorAt/wallColorForSegment: reuse floorList's/wallList's OWN per-cell `.color` value
    // VERBATIM (never re-derived) — floorList is built earlier in this function by the SAME fromFile-
    // or-lift branch the per-cell floorMesh already consumes, so the compiled shell inherits whichever
    // representation (raw-absolute or neutralized-relative) that realm's per-cell path actually uses,
    // with zero risk of the two paths drifting onto different conventions. `shellEdgeFactor` (defined
    // above, off the room's own true bounds) is an ADDITIONAL low-frequency darken this unit adds on
    // top — measured against the per-cell path directly (a controlled gloom fixture, torch 2 cells off
    // room center): the compiled far-corner floor luminance needed this extra term to fall in the same
    // band as the per-cell path's own (both floorList's color AND real point-light falloff alone left
    // a real but insufficient gap — see this unit's own report for the measured before/after numbers).
    // The RAW-ABSOLUTE procedural compensation lives in the MATERIAL base color above (floorMat/
    // wallMat), not here — a vertex-only version of the same compensation barely moved suburb's own
    // numbers (the bright procedural texture dominates), so it needs to multiply the whole pipeline.
    const shellFloorColorIndex = new Map();
    (floorList || []).forEach((f) => shellFloorColorIndex.set(Math.round(f.x) + "," + Math.round(f.z), f.color || "#ffffff"));
    const floorColorAt = (x, z) => itrScaleHexValue(shellFloorColorIndex.get(x + "," + z) || "#ffffff", shellEdgeFactor(x, z));
    const wallColorSourceList = wallLiftOrFile ? itrNeutralizeInstanceColors(inst.wall, kit.wallColor) : inst.wall;
    const shellWallColorIndex = new Map();
    (wallColorSourceList || []).forEach((w) => shellWallColorIndex.set(Math.round(w.x) + "," + Math.round(w.z), w.color || "#ffffff"));
    // a compiled wall SEGMENT can span several original wall cells (that's the whole point of
    // simplification) — sample one point per cell-width along the segment's own length, each stepped
    // HALF a unit OUTWARD (opposite the segment's own inward normal) to land on the actual wall-cell
    // ring (one unit-grid ring outside the floor boundary, same spacing convention as the floor
    // cells), then average — a flat per-segment tint (walls don't need an interior gradient; they
    // already sit at the room's own edge by construction).
    const wallColorForSegment = (segMeta) => {
      const n = segmentNormal({ a: segMeta.a, b: segMeta.b });
      const dx = segMeta.b.x - segMeta.a.x, dz = segMeta.b.z - segMeta.a.z;
      const steps = Math.max(1, Math.round(Math.hypot(dx, dz)));
      let sr = 0, sg = 0, sb = 0, cnt = 0;
      for(let s = 0; s < steps; s++){
        const t = (s + 0.5) / steps;
        const px = segMeta.a.x + dx * t, pz = segMeta.a.z + dz * t;
        const wx = Math.round(px - n.x * 0.5), wz = Math.round(pz - n.z * 0.5);
        const rawHex = shellWallColorIndex.get(wx + "," + wz);
        if(rawHex){
          const c = new THREE.Color(itrScaleHexValue(rawHex, shellEdgeFactor(wx, wz)));
          sr += c.r; sg += c.g; sb += c.b; cnt++;
        }
      }
      if(!cnt) return "#ffffff";
      return "#" + new THREE.Color(sr / cnt, sg / cnt, sb / cnt).getHexString();
    };
    // STAGE-C3b (docs/STAGE-C.md C3b addendum): `data.activeRoomShape` is theater-interior.js's own
    // sibling of `focusRect` (interiorBuildBoard's own `plan.rooms.find` lookup) — the active room's
    // STAGE-C C3 `shape` tag, forwarded VERBATIM. compileRoomShellData itself decides what (if
    // anything) to do with it: 'circle'/'ellipse' round the boundary, 'octagon'/'L'/'T'/'cross' chamfer
    // any real staircase run into a diagonal face, 'rect'/'cave'/null take the untouched simplify path
    // — see theater-room-mesh.js's own `opts.smoothShape` doc for the full per-tag behavior.
    // C4.1a: the compiler always builds EVERY segment's own upper geometry (upperVisibleForSegment is
    // NOT threaded into the compiler call here — see this unit's own comment at that const's
    // declaration above for why); the compiler's `opts.upperVisibleForSegment` stays available for a
    // genuine STRUCTURAL omission a future caller might license, never this camera-driven one.
    const shell = compileRoomShell(shellCells, {
      wallHeight: roomWallHeight, wallHeightForSegment, uvDensity: ITR_ROOM_SHELL_UV_DENSITY,
      floorColorAt, wallColorForSegment, smoothShape: data.activeRoomShape,
      // Stem BODY plus cap reaches the same exact one-foot cutaway top used by the prism and kit
      // paths. Full-height walls remain continuous because their upper begins at the body seam.
      wallStemHeight: Math.max(0.01, ITR_OCCLUSION_STEM_HEIGHT_U - DEFAULT_WALL_CAP_HEIGHT),
      // UNIT G2: the migration switch pass-through — default "legacy", test-seam-settable via
      // window.Theater._setRoomShellPolygonKernel (see that setter's own comment, below).
      roomShellPolygonKernel: itrCtxRoomShellPolygonKernel(),
    });
    // C4.1b (docs/WALL-VOLUMES-PRACTICALS.md): the REQUIRED subject set for the wall-upper ray test —
    // player/primaryThreat/objective/focalLight, straight off THIS build's own ShotPlan anchors (the
    // SAME anchors the camera composition a few hundred lines up this function already scored against
    // — never re-derived here). ShotPlan anchors carry only ground-plane {x,z} (no per-creature true
    // height) — OCCLUSION_SUBJECT_EYE_HEIGHT is the SAME torso/eye-level proxy theater-shot.js's own
    // scoring path (penaltyHardOcclusionArea) uses, so runtime and scoring never drift onto two
    // different subject-height conventions. The spec's 4th required subject ("focal interaction") has
    // no dedicated ShotPlan anchor yet — focalLight (the dominant practical, the closest existing
    // analog) stands in until a real one exists; absent a ShotPlan entirely (shotCompose off, or a
    // narrow harness), subjects stays empty and every upper segment simply reads full/opaque — an
    // honest "nothing known to protect visibility of" degrade, matching occlusionFurnitureOn's own
    // ShotPlan-gated convention a few hundred lines up.
    const wallOcclusionAnchors = S.lastShotPlan ? S.lastShotPlan.anchors : null;
    const wallOcclusionAnchorSubjects = wallOcclusionAnchors
      ? ["player", "primaryThreat", "objective", "focalLight"]
          .map((k) => wallOcclusionAnchors[k]).filter(Boolean)
          .map((a) => ({ x: a.x, z: a.z, y: OCCLUSION_SUBJECT_EYE_HEIGHT }))
      : [];
    // P3-1d (docs/PHASE-3-WAVE-1-SPECS.md P3-1d): extend the ray-test subject list beyond the 4
    // required ShotPlan anchors to EVERY mounted figure (data.pieces — the SAME source
    // itrPieceSightPoints reads, raw world {cellX,cellY}, matching wallSegments'/occlusionCameraPos's
    // own raw-world coordinate frame — never the cx/cz-offset frame itrPieceSightPoints itself returns).
    // Anchor subjects come first and are never dropped by the cap (they're required by C4.1b's own
    // decision); only the ADDITIONAL non-anchor figures are capped. No-silent-caps law: log once per
    // build when a room's mounted-figure count actually exceeds the cap.
    const OCCLUSION_SUBJECT_CAP = 24; // perf cap on non-anchor occlusion ray-test subjects per board build
    const mountedFigureSubjects = (data.pieces || [])
      .filter((p) => p && p.slug)
      .map((p) => ({ x: p.cellX || 0, z: p.cellY || 0, y: OCCLUSION_SUBJECT_EYE_HEIGHT }));
    if(mountedFigureSubjects.length > OCCLUSION_SUBJECT_CAP){
      console.warn("[wallUpperOcclusion] mounted-figure subjects", mountedFigureSubjects.length,
        "exceed OCCLUSION_SUBJECT_CAP", OCCLUSION_SUBJECT_CAP, "— truncating (no silent cap)");
    }
    const wallOcclusionSubjects = wallOcclusionAnchorSubjects.concat(
      mountedFigureSubjects.slice(0, OCCLUSION_SUBJECT_CAP)
    );
    const wallUpperRayBlocking = wallUpperBlockingSet({
      camera: occlusionCameraPos, subjects: wallOcclusionSubjects, wallSegments: shell.wallSegments,
      stemHeight: ITR_OCCLUSION_STEM_HEIGHT_U
    });
    // P3-1d: restore BW2-5's whole-room CAMERA-SIDE upper-band suppression, retired by C4.1b when it
    // replaced C4.1a's static near/far-yaw `upperVisibleForSegment` (see git 8d1b94f5) with the
    // exclusive-anchor ray-fade above. wallUpperCameraSideBlockingSet (theater-shot.js, pure) reproduces
    // that EXACT retired geometry test — camera-side segments within the active room's band drop opaque
    // upper volume regardless of any specific occluded subject — keyed on shell.wallSegments' own
    // indices (ownerSegIndex) so it composes with the C4.1b ray-fade above rather than replacing it: a
    // segment fades if EITHER test flags it (camera-side band suppression ∪ specific-occluder ray
    // test). The compiler's `upperVisibleForSegment` seam (declared, unused, above) stays untouched —
    // this is render-time suppression of an already-built mesh's opacity, never compiler-level geometry
    // omission.
    const wallUpperCameraSideBlocking = wallUpperCameraSideBlockingSet({
      focusRect: data.focusRect, wallSegments: shell.wallSegments, cx, cz,
      yawDeg: (S.rotationStep * 90) + CAM_YAW_OFFSET_DEG
    });
    // wallUpperRawBlocking: the UNION consumed by the assembler block below — a segment fades if either
    // treatment says so (P3-1d Decision item 2: "the two treatments coexist").
    const wallUpperRawBlocking = new Set([...wallUpperRayBlocking, ...wallUpperCameraSideBlocking]);
    // CL-R3a (Adam's 2026-07-23 camera-side wall-omission ruling, RULED FOR TEST — verbatim authority
    // ART-DIRECTION-CANON "Camera-side wall omission"; test spec CLAYROOM-RESET-LADDER §CL-R3a).
    // Under the FIXED production camera, wallUpperCameraSideBlockingSet's output is a STATIC fact of
    // the layout (focusRect + wallSegments + a fixed yaw — nothing per-frame in it), so the ruling
    // promotes it from a fade TARGET to a compile-time build decision: an omitted segment builds NO
    // upper volume at all (the stem below stays — the mechanics truth-marker). The ray-blocking set
    // keeps driving the fade for segments that DO build (dynamic piece-occlusion — a pillar between
    // camera and a figure — is still a render-time question). Gated by clayWallOmissionOn(): ON by
    // default in the clay fixture (the ruled test bed), OFF in normal play until the test passes and
    // Adam promotes the ruling; ?wallomit=1/0 overrides either way for the A/B. The decision set is
    // recorded on S.wallOmissionReport (deterministic, exposed via _wallOmissionForTest) so every
    // capture receipt names exactly which segments were omitted and by which rule/version.
    const wallOmissionActive = (typeof clayWallOmissionOn === "function") && clayWallOmissionOn();
    S.wallOmissionReport = {
      ruleId: "camera-side-wall-omission", version: 1, active: wallOmissionActive,
      retainedStubFeet: 1,
      retainedStubWorldUnits: ITR_OCCLUSION_STEM_HEIGHT_U,
      omitted: [], built: []
    };
    if(shell.floorGeometry){
      const m = new THREE.Mesh(shell.floorGeometry, floorMat);
      m.position.set(-cx, 0, -cz);
      m.receiveShadow = true;
      m.userData.interiorKind = "room-shell-floor";
      roomShellMeshes.push(m);
    }
    // C4.1a WALL VOLUME meshes (docs/WALL-VOLUMES-PRACTICALS.md) — REPLACE the old single wallGeometry
    // mesh (deprecated stem-inner-face-only bundle at shell.wallGeometry, left unconsumed here so it
    // never double-renders against the real stem mesh below) with three real bodies: an always-opaque
    // STEM, one independently-visible UPPER mesh per wall segment, and an optional TRIM mesh.
    let wallStemMesh = null;
    if(shell.wallStemGeometry){
      wallStemMesh = new THREE.Mesh(shell.wallStemGeometry, wallMat);
      wallStemMesh.position.set(-cx, 0, -cz);
      wallStemMesh.castShadow = true; wallStemMesh.receiveShadow = true;
      wallStemMesh.userData.interiorKind = "room-shell-wall-stem";
      roomShellMeshes.push(wallStemMesh);
    }
    // C4.1b (docs/WALL-VOLUMES-PRACTICALS.md): per-segment mid (world x,z) lookup off shell.wallSegments
    // (the SAME a/b/tier/height metadata list `mountSlots`/wallUpperMeshes key their own ownerSegIndex
    // against) — used to build this segment's persistent occlusion-fade id, never to rebuild geometry.
    const wallUpperMeshList = [];
    (shell.wallUpperMeshes || []).forEach((entry) => {
      if(!entry.geometry) return;
      // CL-R3a omission (see the ruling note above wallOmissionReport): camera-side segments build
      // no upper AT ALL when the ruling is active — not a mesh faded to 0.08, no mesh. This also
      // stops the ghost-shadow artefact (THREE's shadow pass ignores opacity, so a faded upper still
      // cast a full shadow; an omitted one cannot). The stem/trim meshes are untouched.
      const segMidSeg = shell.wallSegments[entry.ownerSegIndex];
      const segMid = segMidSeg ? { x: (segMidSeg.a.x + segMidSeg.b.x) / 2, z: (segMidSeg.a.z + segMidSeg.b.z) / 2 } : null;
      if(wallOmissionActive && wallUpperCameraSideBlocking.has(entry.ownerSegIndex)){
        S.wallOmissionReport.omitted.push({ segIndex: entry.ownerSegIndex, mid: segMid });
        return;
      }
      // built entries carry their mids too (door-tranche receipt gap: built:[0,1,4] was unanswerable)
      S.wallOmissionReport.built.push({ segIndex: entry.ownerSegIndex, mid: segMid });
      // C4.1b: each upper mesh gets its OWN cloned material — never the shared `wallMat` the stem/trim
      // meshes use. Independent per-segment opacity is the entire point of C4.1a's own "one mesh per
      // segment" decision (theater-boot.js:8907's own comment); sharing `wallMat` here would make
      // itrOcclusionClassify's tween mutate EVERY upper/stem/trim mesh's opacity at once instead of
      // just this one segment's. `transparent:true` is set unconditionally (not only while fading) —
      // the live tween (S.tweens/tickTweens) mutates this exact material's opacity BETWEEN board
      // rebuilds with no further material swap, so it must already be capable of rendering translucent
      // the instant a fade starts, not just after the next rebuild happens to notice it. A plain
      // opacity-only material change — no PBR/bloom work, per this unit's own scope.
      const upperMat = wallMat.clone();
      upperMat.transparent = true;
      const m = new THREE.Mesh(entry.geometry, upperMat);
      m.position.set(-cx, 0, -cz);
      m.castShadow = true; m.receiveShadow = true;
      m.userData.interiorKind = "room-shell-wall-upper";
      m.userData.ownerSegIndex = entry.ownerSegIndex;
      const ownerSeg = shell.wallSegments[entry.ownerSegIndex];
      const mid = ownerSeg ? { x: (ownerSeg.a.x + ownerSeg.b.x) / 2, z: (ownerSeg.a.z + ownerSeg.b.z) / 2 } : { x: 0, z: 0 };
      // C4.1b: camera-relative per-segment fade — REPLACES C4.1a's static near/far `.visible` toggle.
      // `id` is keyed on the segment's own world midpoint (itrOcclusionIdFor's established position-
      // keyed convention every other occluder kind already uses, e.g. "wall"/"doorframe"/"furniture"
      // above) so the SAME physical wall keeps its persistent fade-state entry across a rebuild even if
      // compileRoomShellData's own segment array order ever shifts. `rawBlocking` comes straight from
      // wallUpperRawBlocking (computed once per rebuild, above, off THIS build's real camera position +
      // required subjects) — itrOcclusionClassify applies the SAME hysteresis+tween engine the wall/
      // pillar/door/furniture occlusion passes already use (docs/WALL-VOLUMES-PRACTICALS.md C4.1b's own
      // "reuse itrOcclusionClassify" decision). `.visible` stays permanently true — only opacity ever
      // changes (this unit's own "never toggle .visible hard once tweening" rule); the stem mesh (built
      // above, untouched) never enters this classify pass at all, so it can never fade.
      const id = itrOcclusionIdFor("wall-upper", mid.x, mid.z);
      const fadeEntry = itrOcclusionClassify(id, wallUpperRawBlocking.has(entry.ownerSegIndex), occlusionHoldPrior);
      fadeEntry.materials = [upperMat];
      upperMat.opacity = fadeEntry.opacity;
      m.visible = true;
      roomShellMeshes.push(m);
      // E0-1: `fadeEntry` rides along too — the interiorBuildLights call site (below, same function
      // scope) appends each wall-mounted fixture's own [bodyClone, emitterMat] into this EXACT entry's
      // `.materials` array so a fixture tweens in lockstep with the wall segment it's mounted on,
      // never a second/parallel opacity source.
      wallUpperMeshList.push({ mesh: m, ownerSegIndex: entry.ownerSegIndex, fadeEntry });
    });
    let wallTrimMesh = null;
    if(shell.wallTrimGeometry){
      wallTrimMesh = new THREE.Mesh(shell.wallTrimGeometry, wallMat);
      wallTrimMesh.position.set(-cx, 0, -cz);
      wallTrimMesh.castShadow = true; wallTrimMesh.receiveShadow = true;
      wallTrimMesh.userData.interiorKind = "room-shell-wall-trim";
      roomShellMeshes.push(wallTrimMesh);
    }
    if(shell.riserGeometry){
      const m = new THREE.Mesh(shell.riserGeometry, riserMat);
      m.position.set(-cx, 0, -cz);
      m.castShadow = true; m.receiveShadow = true;
      m.userData.interiorKind = "room-shell-riser";
      roomShellMeshes.push(m);
    }
    // diagnostics + the logical cell<->triangle map (directive step 9) — dev/verify-room-shell-
    // render.mjs's own primitive-count/bevel/riser assertions read this, never decomposing geometry.
    // C4.1a additions: wallStemMesh/wallUpperMeshes/wallTrimMesh/mountSlots — E0 (a later unit) parents
    // wall-mounted fixtures to `mountSlots`; C4.1b re-targets `wallUpperMeshes[].mesh`'s own opacity.
    S.interiorLastRoomShell = {
      meta: shell.meta, cellTriangleMap: shell.cellTriangleMap, apertures: shell.apertures,
      wallSegments: shell.wallSegments, riserSegments: shell.riserSegments, floorTiers: shell.floorTiers,
      wallStemMesh, wallUpperMeshes: wallUpperMeshList, wallTrimMesh, mountSlots: shell.mountSlots,
      // UNIT G2 — null except in oss-compare/oss mode (see compileRoomShellData's own return-assembly
      // comment); exposed here so dev/verify-room-shell-oss.mjs can read live parity diagnostics off
      // window.Theater._interiorRoomShellForTest() the same way every other room-shell test seam does.
      parityDiagnostics: shell.parityDiagnostics, ossDiagnostics: shell.ossDiagnostics,
    };
  }
  // -> the pass context (see THE PASS OBJECT in this file's header)
  pass.roomShellMeshes = roomShellMeshes;
}

/* PHASE 8 (realizePhasePillars) — the BW2-1b/S-1 pillar cutaway mask, ankle-stub/ghost split, and
   the pillar + pillar-ghost meshes. VERBATIM from theater-boot.js lines 6332-6383. */
function realizePhasePillars(pass){
  const { data, variant, cx, cz, kit, inst, pillarTex, itrSightPoints, occlusionCameraPos,
         occlusionHoldPrior } = pass;
  // BEAUTY-WAVE-2.md BW2-1b (THE OCCLUSION LAW), item 1, superseded by docs/DIEGETIC-LIGHT.md unit S-1
  // (Adam's live steer, 2026-07-11): DYNAMIC CUTAWAY for pillar prisms — a pillar between the camera
  // and a mounted standee. Recomputed every board build (camera refit, BW2-1's own fitMode changes,
  // AND every standee move-step — a move-step is itself a data.pieces change that forces a fresh
  // setInteriorBoard call, so "recompute on move-step" falls out of the existing dirty-key rebuild
  // path for free, no separate hook needed). WAS a pure height stub to a KNEE (ITR_PILLAR_STUB_FRAC's
  // old 0.3 — Adam's own bug report: "columns and walls still obscure figures" — the old knee (0.72
  // world units at the 2.4 default) sat BELOW a typical torso sight point, so it never actually
  // cleared the sightline it claimed to). NOW: an offending instance drops to a genuinely-low ANKLE
  // stub (itrOcclusionAnkleHeight, same shared deriver the wall path above now also uses) PLUS a ~5%
  // GHOST of the removed upper portion (itrSplitOccluderForAnkleGhost) so the column still reads as
  // "there" — see pillarGhostMeshes below, its own (small, occlusion-only) draw call.
  let pillarList = inst.pillar;
  let pillarGhostList = [];   // flat descriptor list — S.interiorLastPillarGhostList's own established shape
  let pillarGhostBuild = [];  // {inst, fadeEntry} pairs — drives the individually-tweened ghost meshes below
  if(!itrCtxOcclusionFadeDisabled() && occlusionCameraPos && pillarList && pillarList.length && itrSightPoints.length){
    const mask = itrPillarCutawayMask(pillarList, occlusionCameraPos, itrSightPoints, cx, cz);
    const pillarAnkleH = itrOcclusionAnkleHeight(data.wallHeightBase);
    pillarList = pillarList.map(function(pinst, i){
      const id = itrOcclusionIdFor("pillar", pinst.x, pinst.z, pinst.yBase);
      const entry = itrOcclusionClassify(id, !!mask[i], occlusionHoldPrior);
      if(!entry.fading) return pinst;
      const split = itrSplitOccluderForAnkleGhost(pinst, pillarAnkleH);
      if(split.ghost){
        pillarGhostList.push(split.ghost);
        pillarGhostBuild.push({ inst: split.ghost, fadeEntry: entry });
      }
      return split.stub;
    });
  }
  // BW2-1b — harness diagnostic: the FINAL (post-cutaway) pillar instance list, byte-identical shape
  // to data.instances.pillar (same length — a stub only rewrites `sy`/`yBase`, never adds/removes an
  // entry, preserving U3's own draw-call budget for the MAIN mesh) so a harness can assert stub-applied
  // vs full-height per instance without decomposing InstancedMesh matrices.
  S.interiorLastPillarList = pillarList;
  S.interiorLastPillarGhostList = pillarGhostList; // S-1 test seam — the separately-drawn ghosts
  // BW2-5 THE COLUMN DEMOTION: pillar instances split by `profile` (round gets its own cylinder
  // mesh) — fed the POST-CUTAWAY list so the sightline stubs apply to every profile alike.
  const pillarMeshes = interiorBuildPillarMeshes(
    pillarTex ? itrNeutralizeInstanceColors(pillarList, kit.wallColor) : pillarList,
    cx, cz, variant, pillarTex);
  // STAGE-A A4: ONE small ghost mesh PER blocking pillar (never a big shared material carrying every
  // ghost of a kind at one flat alpha) — see itrBuildOcclusionGhostPillarMeshes's own header.
  const pillarGhostGroup = pillarGhostBuild.length ? itrBuildOcclusionGhostPillarMeshes(
    pillarGhostBuild.map(function(pair){
      return {
        inst: pillarTex ? itrNeutralizeInstanceColors([pair.inst], kit.wallColor)[0] : pair.inst,
        fadeEntry: pair.fadeEntry
      };
    }),
    cx, cz, variant, pillarTex) : null;
  const pillarGhostMeshes = pillarGhostGroup ? [pillarGhostGroup] : [];
  // -> the pass context (see THE PASS OBJECT in this file's header)
  pass.pillarList = pillarList;
  pass.pillarMeshes = pillarMeshes;
  pass.pillarGhostMeshes = pillarGhostMeshes;
}

/* PHASE 9 (realizePhaseGroups) — GR4's skirt, STAGE-A A1's portal cards, and THE ONE mesh-add
   sweep (itrAllInteriorMeshes) that seats every architectural mesh in S.interiorGroup and stamps
   S.interiorMeshCount. VERBATIM from theater-boot.js lines 6384-6409. */
function realizePhaseGroups(pass){
  const { data, variant, cx, cz, doorMountMap, useCompiledRoomShell, roomShellMeshes, floorMesh,
         wallMesh, wallGhostMesh, doorMesh, doorGhostMesh, pillarMeshes, pillarGhostMeshes } = pass;
  // GR4 (docs/GRAPHICS-ENGINE.md build unit GR4): the diorama edge skirt — data.skirt (src/ui/theater-
  // interior.js's interiorBuildBoard, GR4 addition), a sibling of `instances` (never counted toward the
  // "4 known instance kinds" data-shape check — see that function's own doc comment). Untextured (flat
  // darkened color, same as pillar/doorframe) — a texture would be wasted detail on a band the camera
  // only ever sees edge-on.
  const skirtMesh = interiorBuildInstancedMesh(data.skirt, cx, cz, null, variant, "skirt");
  // STAGE-A A1 (docs/STAGE-A.md): DARKNESS PORTAL cards — data.portals (src/ui/theater-interior.js's
  // interiorBuildBoard, A1 addition), a sibling of `instances` same as skirt just above (never counted
  // toward the "4 known instance kinds" data-shape check). Untextured flat dark slab (the card IS a
  // flat void-color read, not a surface that wants grain) — null texture, same convention skirt uses.
  const portalMesh = interiorBuildInstancedMesh(itrApplyDoorMounts(data.portals, doorMountMap), cx, cz, null, variant, "portal");
  // BW2-5: furniture-class blocker volumes + wall-hang extrusion props (THE PROP PERSPECTIVE LAW) —
  // built further below (after dressing) since both read S.interiorFloorTopMap; declared here so the
  // mesh-count/group-add sweep stays one place. See interiorBuildFurniture/interiorBuildWallProps.
  // S-1 OCCLUSION FADE: the ghost overlays (wallGhostMesh, pillarGhostMeshes) are ADDITIONAL draw
  // calls over the pre-S-1 budget — only ever created when at least one instance of that kind is
  // actually occluding a figure this frame (both are null/empty otherwise, so a board with no
  // occlusion in play costs exactly what it did before this unit).
  // ROOM-SHELL COMPILER: when ITR_ROOM_SHELL is on and a shell actually compiled, the continuous
  // floor/wall/riser meshes REPLACE the per-cell floorMesh/wallMesh/wallGhostMesh pair above (never
  // both — that would double-render the same surfaces). doorMesh/skirtMesh/portalMesh/pillarMeshes
  // stay unconditional either way (this unit's scope is floor/wall/riser geometry only).
  const itrFloorWallMeshes = (useCompiledRoomShell && roomShellMeshes.length) ? roomShellMeshes : [floorMesh, wallMesh, wallGhostMesh];
  const itrAllInteriorMeshes = itrFloorWallMeshes.concat([doorMesh, doorGhostMesh, skirtMesh, portalMesh]).concat(pillarMeshes).concat(pillarGhostMeshes);
  itrAllInteriorMeshes.forEach((mesh) => { if(mesh) S.interiorGroup.add(mesh); });
  S.interiorMeshCount = itrAllInteriorMeshes.filter(Boolean).length;
}

/* PHASE 10 (realizePhasePracticals) — the wall-mount slot filter, interiorBuildLights, the E0-1
   wall-fixture fade linkage, the cone/glow diagnostics, and the VP6 flicker join. VERBATIM from
   theater-boot.js lines 6410-6482. */
function realizePhasePracticals(pass){
  const { data, cx, cz, preserveInteriorLighting, preservedLightsBuilt, isBrightRealm,
         nextLightingKey } = pass;

  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2: real environmental light sources (data.lights, emitted
  // by src/ui/theater-interior.js's interiorBuildBoard) — realm-flavored PointLights + their own
  // visible physical FIXTURES (E0, WALL-VOLUMES-PRACTICALS.md), capped at INTERIOR_SHADOW_CASTER_CAP
  // shadow-casters.
  // LIGHT-CLOSE: isBrightRealm (hoisted above) tells interiorBuildLights whether THIS board's profile
  // is a bright/sky-lit one, so it can suppress torch/lamp practicals at the light seeds (§4.7).
  // E0 — Seam for wall mounts: thread C4.1a's own mount-slot data (S.interiorLastRoomShell, built by
  // the shell block above) in so a wall-mount light can snap to its nearest slot; absent (ITR_ROOM_SHELL
  // off, or a shell that produced zero slots) degrades every wall-mount fixture to floor, defensively.
  // Wall-omission ruling clause 5 (ART-DIRECTION-CANON, Adam 2026-07-23): "meaningful wall-mounted
  // content biases to camera-visible walls at placement time — a solver constraint, never a renderer
  // patch." Found live in the door tranche: the re-pinned walkId re-rolled the room's torch onto the
  // SOUTH wall, which the omission ruling doesn't build — the fixture hung mid-air on a wall that
  // isn't there. Slots on omitted segments are filtered out ahead of nearest-slot resolution
  // (S.wallOmissionReport was just written by the shell block above, same rebuild). If the filter
  // would empty the list entirely (cannot happen while far walls always build — defensively), the
  // unfiltered list stands rather than degrading every wall fixture to floor.
  let mountSlotsForPlacement = S.interiorLastRoomShell ? S.interiorLastRoomShell.mountSlots : null;
  if(mountSlotsForPlacement && S.wallOmissionReport && S.wallOmissionReport.active && S.wallOmissionReport.omitted.length){
    const omittedSegs = new Set(S.wallOmissionReport.omitted.map((o) => o.segIndex));
    const visibleSlots = mountSlotsForPlacement.filter((sl) => sl && !omittedSegs.has(sl.ownerSegIndex));
    if(visibleSlots.length) mountSlotsForPlacement = visibleSlots;
  }
  const wallMountData = S.interiorLastRoomShell
    ? { mountSlots: mountSlotsForPlacement, wallSegments: S.interiorLastRoomShell.wallSegments }
    : null;
  const lightsBuilt = preserveInteriorLighting
    ? preservedLightsBuilt
    : interiorBuildLights(data.lights, cx, cz, data.realmId, S.interiorFloorTopMap, data.pieces, isBrightRealm, wallMountData);
  S.interiorGroup.add(lightsBuilt.group);
  S.interiorLightsBuilt = lightsBuilt;
  S.interiorLightTargets = lightsBuilt.flickerTargets;
  S.interiorLightingKey = nextLightingKey;
  S.interiorShadowCasterCount = lightsBuilt.casters;
  S.interiorLightCount = (data.lights || []).length;
  // E0-1 (docs/PHASE-3-WAVE-1-SPECS.md) — WALL-FIXTURE OCCLUSION-FADE LINKAGE: this is the ONE call
  // site with BOTH the just-built wall fixtures (lightsBuilt.wallFixtureFadeTargets) AND the per-
  // segment fadeEntry map (S.interiorLastRoomShell.wallUpperMeshes, built by the room-shell block
  // above — same ownerSegIndex convention) in scope. For each wall-mounted fixture, find its owning
  // segment's ALREADY-CREATED fadeEntry and APPEND (never overwrite — the wall segment's own upper
  // mesh material already occupies `fadeEntry.materials`) the fixture's [bodyClone, emitterMat] pair,
  // syncing them to the entry's CURRENT opacity immediately (not just on the next tween tick) so a
  // fixture built mid-fade never floats at opacity 1 for one frame. A fixture whose ownerSegIndex has
  // no matching entry (a room-shell-less board, or ITR_ROOM_SHELL off) is simply not registered — the
  // spec's own defensive "unaffected" case.
  const wallUpperFadeEntries = (S.interiorLastRoomShell && S.interiorLastRoomShell.wallUpperMeshes) || [];
  (lightsBuilt.wallFixtureFadeTargets || []).forEach((target) => {
    const owner = wallUpperFadeEntries.find((e) => e.ownerSegIndex === target.ownerSegIndex);
    if(!owner || !owner.fadeEntry) return;
    const fadeEntry = owner.fadeEntry;
    if(!fadeEntry.materials) fadeEntry.materials = [];
    target.materials.forEach((mat) => {
      if(!mat) return;
      fadeEntry.materials.push(mat);
      mat.opacity = fadeEntry.opacity;
    });
  });
  // L-1 (DIEGETIC-LIGHT.md) harness diagnostic, same read-only convention as interiorShadowCasterCount
  // above: how many light-shaft cones actually mounted this call (0 whenever ITR_LIGHT_CONE_ENABLED is
  // false, since interiorBuildLights skips both the mount AND the flickerTargets.cone assignment then).
  S.interiorLightConeCount = lightsBuilt.flickerTargets.filter((t) => t.cone).length;
  // LIGHT-CLOSE — harness diagnostic, same convention: how many glow discs actually mounted this call
  // (0 for every light on a bright/sky-lit profile once ITR_BRIGHT_SUPPRESS_PRACTICALS suppresses them).
  S.interiorLightGlowCount = lightsBuilt.glowCount;
  // VP6 item 2: join the interior lights (+ their emissive markers) onto the shared flicker channel —
  // startLightFlicker tore down any board-level flicker a moment ago (applyLightProfile above always
  // calls stopLightFlicker first), so this call is the one that actually starts ticking for an interior
  // board with any lights at all; a light-less room (lightsBuilt.flickerTargets === []) is a clean no-op
  // (startLightFlicker's own interval self-stops when both lists are empty).
  if(!preserveInteriorLighting && lightsBuilt.flickerTargets.length){
    startLightFlicker(INTERIOR_LIGHT_FLICKER_AMPLITUDE, lightsBuilt.flickerTargets);
  }
  // -> the pass context (see THE PASS OBJECT in this file's header)
  pass.wallUpperFadeEntries = wallUpperFadeEntries;
}

/* PHASE 11 (realizePhasePieces) — interiorBuildPieces (the true-scale standees), F1's combat floor
   grid, and interiorBuildDressing + both world-position diagnostics. VERBATIM from theater-boot.js
   lines 6483-6530. */
function realizePhasePieces(pass){
  const { data, cx, cz, kit, wallList, pillarList, inst } = pass;

  // DUNGEON-GRAPH.md U3 iteration-2, ruling 3: creature/PC billboard sprites standing in the room
  // (data.pieces, a plain field the caller sets directly on the board object — independent of
  // interiorBuildBoard, same as data.lightProfile above).
  // CLIP MARGIN LAW (Adam addendum, mid-flight on BW2-1b): the solid prisms a standee's own footprint
  // must clear — wallList/pillarList are the SAME post-cutaway lists just mounted above (cutaway only
  // ever changes a stubbed instance's sy/height, never its sx/sz footprint, so testing against the
  // post-cutaway lists is byte-identical to testing against the pre-cutaway ones on the XZ axes this
  // check actually reads). daisTop rides per BW2-5 (finale preferDais bias).
  const piecesBuilt = interiorBuildPieces(data.pieces, cx, cz, data.wallHeightBase, S.interiorFloorTopMap, kit.trimColor, [wallList, pillarList, inst.doorframe], data.daisTop);
  S.interiorGroup.add(piecesBuilt.group);
  S.interiorPiecesResolved = piecesBuilt.resolved;
  S.interiorPiecesRequested = piecesBuilt.requested;

  // VQ2-RESPEC.md §4 unit F1 — the combat floor-grid overlay (data.combat.legalCells, stamped by
  // render.js's theaterStageSync onto the board before this call — see theaterCombatRoomCellsFor,
  // src/engine/theater-data.js). A pure DECAL layer over the room's own real floor (never new wall/
  // light/material INSTANCES — the "zero new architecture at combat start" gate reads S.interiorGroup's
  // wall/floor/light child counts, none of which this touches); mounted as a child of S.interiorGroup
  // so it's swept by the SAME clearGroup(S.interiorGroup) call above every rebuild, combat or not —
  // combat_end's next non-combat render (data.combat absent) simply never re-adds it, the exact
  // "combat end restores exactly" behavior for free, no separate teardown call needed.
  if(data.combat && Array.isArray(data.combat.legalCells) && data.combat.legalCells.length){
    S.interiorGroup.add(f1BuildCombatGrid(data.combat.legalCells, cx, cz, S.interiorFloorTopMap));
  }
  // BW2-1b — harness-facing diagnostic (mirrors S.interiorDressingWorldPositions, below): one entry
  // per MOUNTED standee, its REAL world position read straight off the group THREE actually placed
  // (post CLIP MARGIN nudge) — so an occlusion/clip-margin harness asserts against the mount, never a
  // parallel formula that could drift from it. piecesBuilt.group's own children are the per-piece
  // groups (tagged userData.interiorTrueScale, interiorBuildPieces' own convention) FOLLOWED by the
  // sibling blobGroup (untagged) — filtering on the tag excludes the blob group cleanly.
  S.interiorPiecesWorldPositions = piecesBuilt.group.children
    .filter((g) => g.userData && g.userData.interiorTrueScale)
    .map((g) => ({ x: g.position.x, y: g.position.y, z: g.position.z, height: g.userData.interiorHeight, width: g.userData.interiorWidth, unitId: g.userData.unitId || null }));

  // GRAPHICS-ENGINE.md GR2 §D: dressing cards (data.dressing, src/engine/place-dressing.js's
  // dressPlan output — a plain field the caller sets directly on the board object, same convention
  // as data.pieces/data.lightProfile above).
  const dressingGroup = interiorBuildDressing(data.dressing, cx, cz, S.interiorFloorTopMap, [wallList, pillarList, inst.doorframe]);
  S.interiorGroup.add(dressingGroup);
  S.interiorDressingCount = (data.dressing || []).length;
  // harness-facing diagnostic (dev/verify-dungeon-dressing.mjs check 4: "render mount... origin-
  // shifted correctly") — one entry per mounted card, its REAL world position read straight off the
  // group THREE actually placed (never recomputed by the test), so the check proves the mount, not a
  // parallel formula that could drift from it.
  S.interiorDressingWorldPositions = dressingGroup.children.map((g) => ({
    slug: g.userData && g.userData.dressingSlug, x: g.position.x, y: g.position.y, z: g.position.z
  }));
}

/* PHASE 12 (realizePhaseFurniture) — the A4 furniture occlusion mask, BW2-5's furniture volumes,
   and THE PROP PERSPECTIVE LAW's wall props + their AO diagnostic. VERBATIM from theater-boot.js
   lines 6531-6570. */
function realizePhaseFurniture(pass){
  const { data, cx, cz, occlusionFurnitureOn, occlusionCameraPos, itrSightPoints, occlusionHoldPrior } = pass;

  // BEAUTY-WAVE-2.md BW2-5: furniture-class blocker volumes (data.furniture) + wall-hang extrusion
  // props (data.wallProps, THE PROP PERSPECTIVE LAW) — both siblings of data.dressing, built off the
  // SAME roll (see interiorBuildDressing's own skip-blocker/wall-hang comment just above).
  // STAGE-A A4: furniture joins the occlusion candidate set whenever THIS shot's own ShotPlan actually
  // classifies furniture as a blocker kind (occlusionFurnitureOn, computed once near occlusionCameraPos
  // above) — the classify callback runs itrFurnitureOcclusionMask's own per-entry AABB test through the
  // SAME itrOcclusionClassify persistent-state+hysteresis path wall/pillar already use, per instance.
  let furnitureFadeById = null; // Map(id -> entry), id = itrOcclusionIdFor("furniture", f.x, f.y)
  if(occlusionFurnitureOn && !itrCtxOcclusionFadeDisabled() && occlusionCameraPos && itrSightPoints.length && (data.furniture || []).length){
    const furnitureMask = itrFurnitureOcclusionMask(data.furniture, cx, cz, S.interiorFloorTopMap, occlusionCameraPos, itrSightPoints);
    furnitureFadeById = new Map();
    (data.furniture || []).forEach(function(f, i){
      const id = itrOcclusionIdFor("furniture", f.x, f.y);
      furnitureFadeById.set(id, itrOcclusionClassify(id, !!furnitureMask[i], occlusionHoldPrior));
    });
  }
  const furnitureGroup = interiorBuildFurniture(data.furniture, cx, cz, S.interiorFloorTopMap,
    furnitureFadeById ? function(f){
      const entry = furnitureFadeById.get(itrOcclusionIdFor("furniture", f.x, f.y));
      return entry && entry.fading ? entry : null;
    } : null);
  S.interiorGroup.add(furnitureGroup);
  S.interiorFurnitureCount = (data.furniture || []).length;
  const wallPropsGroup = interiorBuildWallProps(data.wallProps, cx, cz, S.interiorFloorTopMap, data.wallHeightBase);
  S.interiorGroup.add(wallPropsGroup);
  S.interiorWallPropsCount = (data.wallProps || []).length;
  S.interiorWallPropsWorldPositions = wallPropsGroup.children.map((g) => {
    // P-2 addendum: the wall-contact AO quad is the extrusion group's 2nd child (addWallContactAO adds
    // it AFTER the art mesh) — surfacing its local z here lets a harness confirm the AO still hugs the
    // (possibly repositioned) back face without a separate traverse-the-whole-scene seam.
    const aoChild = g.children.find((c) => c.userData && c.userData.wallContactAO);
    return {
      slug: g.userData && g.userData.dressingSlug, x: g.position.x, y: g.position.y, z: g.position.z,
      rotY: g.rotation.y, depth: g.children[0] && g.children[0].geometry && g.children[0].geometry.parameters
        && g.children[0].geometry.parameters.depth,
      aoPresent: !!aoChild, aoZ: aoChild ? aoChild.position.z : null
    };
  });

}

/* PHASE 13 (realizePhaseDoors) — D4's interactable doors, the D4 E0-1 fade compliance linkage, and
   the door diagnostics. VERBATIM from theater-boot.js lines 6571-6622. */
function realizePhaseDoors(pass){
  const { data, cx, cz, wallUpperFadeEntries } = pass;
  // docs/STAGE-D-WAVE-SPECS.md D4 — data.interactables is a plain field the caller sets directly on
  // the board object (src/engine/theater-data.js's trayFrom — same convention as data.pieces/
  // data.dressing/data.wallProps above). D4 scope: door archetype only (see
  // interiorBuildInteractables' own header for the full render-keystone contract). KS-2:
  // data.kitDoors is interiorBuildBoard's OWN output (theater-interior.js, a sibling of data.instances)
  // — unlike interactables/pieces/dressing above, this one IS produced by interiorBuildBoard itself.
  const interactablesGroup = interiorBuildInteractables(data.interactables, cx, cz, S.interiorFloorTopMap, data.kitDoors, data.realmId, S.realmProfile, data.doorAxes);
  S.interiorGroup.add(interactablesGroup);
  // D4 — E0-1 FADE COMPLIANCE (the SAME append-never-overwrite pattern the wall-fixture block above
  // uses, docs/PHASE-3-WAVE-1-SPECS.md E0-1): a door on an occlusion-suppressed wall segment fades
  // WITH that segment. Each mounted door leaf's material joins the fadeEntry of the wall segment
  // whose midpoint is nearest the door's own world position (the wall run its aperture interrupts —
  // shell.wallSegments carries no per-door ownerSegIndex, so nearest-midpoint is this layer's honest
  // ownership stand-in, same class of geometric stand-in rgDoorApronCells already documents). Opacity
  // syncs immediately so a door built mid-fade never floats opaque against a ghosted wall. A board
  // with no room shell (wallUpperFadeEntries empty / ITR_ROOM_SHELL off) registers nothing — E0-1's
  // own defensive "unaffected" case.
  if(wallUpperFadeEntries.length){
    interactablesGroup.children.forEach((hinge) => {
      const leaf = hinge.userData && hinge.userData.leaf;
      if(!leaf || !leaf.material) return;
      const doorPlanX = hinge.position.x + cx, doorPlanZ = hinge.position.z + cz;
      let owner = null, bestDist = Infinity;
      wallUpperFadeEntries.forEach((e) => {
        const seg = S.interiorLastRoomShell && S.interiorLastRoomShell.wallSegments && S.interiorLastRoomShell.wallSegments[e.ownerSegIndex];
        if(!seg) return;
        const mx = (seg.a.x + seg.b.x) / 2, mz = (seg.a.z + seg.b.z) / 2;
        const d = Math.abs(mx - doorPlanX) + Math.abs(mz - doorPlanZ);
        if(d < bestDist){ bestDist = d; owner = e; }
      });
      if(!owner || !owner.fadeEntry) return;
      if(!owner.fadeEntry.materials) owner.fadeEntry.materials = [];
      owner.fadeEntry.materials.push(leaf.material);
      leaf.material.opacity = owner.fadeEntry.opacity;
    });
  }
  S.interiorInteractablesCount = (data.interactables || []).filter((e) => e && e.archetype === "door" && !e.reserve).length;
  // harness-facing diagnostic (dev/verify-d4-doors.mjs), same convention as
  // S.interiorDressingWorldPositions above: one entry per MOUNTED door, its REAL world position/state
  // read straight off the group THREE actually placed, never a parallel formula that could drift.
  S.interiorInteractablesWorldPositions = interactablesGroup.children.map((hinge) => ({
    sourceRef: hinge.userData && hinge.userData.sourceRef,
    archetype: hinge.userData && hinge.userData.archetype,
    state: hinge.userData && hinge.userData.state,
    arched: hinge.userData && hinge.userData.arched,
    x: hinge.position.x, y: hinge.position.y, z: hinge.position.z,
    leafRotY: hinge.userData && hinge.userData.leaf && hinge.userData.leaf.rotation.y,
    leafRotX: hinge.userData && hinge.userData.leaf && hinge.userData.leaf.rotation.x,
    // D4c additive diagnostics — never consumed by anything pre-D4c, safe to extend.
    brokenVariant: hinge.userData && hinge.userData.brokenVariant,
    shardCount: (hinge.userData && hinge.userData.shards) ? hinge.userData.shards.length : 0
  }));
}

/* PHASE 14 (realizePhaseKitShells) — KS-3's kit shell walls/floors with the KS-3b camera-side
   cutaway parity pass. VERBATIM from theater-boot.js lines 6623-6653. */
function realizePhaseKitShells(pass){
  const { data, cx, cz, itrCameraSideBand, ITR_CUTAWAY_STUB_HEIGHT_U } = pass;

  // KS-3 (docs/KENNEY-SOCKET-WAVE.md) — ROOM SHELLS FROM THE KIT. data.kitShellWalls/data.kitShellFloors
  // are interiorBuildBoard's OWN output (theater-interior.js, siblings of data.kitDoors — see that
  // field's own comment above) — pure placement data; both empty whenever KIT_SHELL_ENABLED is off
  // (theater-interior.js's own flag), so these two builders add zero geometry in that state (the
  // per-cell prism `wall`/`floor` instance meshes above already cover every cell in full, byte-
  // identical to pre-KS-3). realmId/realmProfile close the SAME live-grading path the KS-3 door
  // retrofit above uses — every kit piece (door, wall, floor) now shares one recipe.
  const kitShellWallGroup = interiorBuildKitShellWalls(data.kitShellWalls, cx, cz, data.realmId, S.realmProfile, data.wallHeightBase);
  // KS-3b item 2 (docs/KENNEY-SOCKET-WAVE.md's own KS-3 gate flag) — CAMERA-SIDE CUTAWAY PARITY. Kit
  // wall modules previously rendered at full height/opacity unconditionally — the prism wallList
  // cutaway pass a few hundred lines up (itrCameraSideBand/ITR_CUTAWAY_STUB_HEIGHT_U) only ever touched
  // `inst.wall`, never these donor-piece runs, so a kit-shelled room read "walled-in" regardless of
  // camera framing (the diorama's own open-tray identity, BW2-5 item 2, silently didn't apply to the
  // new shell type). Reuses the IDENTICAL closure + one-foot target the prism path just computed
  // above — never a second copy of the yaw/dot-product math — applied per RUN (data.kitShellWalls[i], in
  // WORLD coordinates, zipped by index with kitShellWallGroup.children[i] — interiorBuildKitShellWalls
  // builds one holder per run in that exact array order) so a mixed kit+prism room's walls cut away
  // consistently at every camera-facing wall, whichever path rendered it.
  (data.kitShellWalls || []).forEach(function(run, i){
    const holder = kitShellWallGroup.children[i];
    if(!holder || !itrCameraSideBand(run.x || 0, run.z || 0)) return;
    const fullH = (typeof data.wallHeightBase === "number" && data.wallHeightBase > 0)
      ? data.wallHeightBase : 2;
    holder.scale.y *= Math.min(1, ITR_CUTAWAY_STUB_HEIGHT_U / fullH);
  });
  S.interiorGroup.add(kitShellWallGroup);
  const kitShellFloorGroup = interiorBuildKitShellFloors(data.kitShellFloors, cx, cz, data.realmId, S.realmProfile);
  S.interiorGroup.add(kitShellFloorGroup);
  // harness-facing diagnostics — mirrors S.interiorLastDoorList's own "read what THREE actually placed"
  // convention, never a parallel formula that could drift from the render.
  S.interiorLastKitShellWalls = kitShellWallGroup.children.map((h) => ({ x: h.position.x, y: h.position.y, z: h.position.z, rotY: h.rotation.y, axis: h.userData.axis, scaleY: h.scale.y }));
  S.interiorLastKitShellFloors = kitShellFloorGroup.children.map((h) => ({ x: h.position.x, y: h.position.y, z: h.position.z, room: h.userData.room }));
}

/* PHASE 15 (realizePhaseAtmosphere) — VP6 item 4's decals and VP6 item 3's ambient motes (its own
   drift scheduler restart). VERBATIM from theater-boot.js lines 6654-6673. */
function realizePhaseAtmosphere(pass){
  const { data, cx, cz, b, fit, env } = pass;

  // BEAUTY-WAVE.md VP6 item 4 — VISIBLE HISTORY (render half). data.decals is a plain field the caller
  // sets directly on the board object (same convention as data.pieces/data.dressing above), sourced
  // from src/world/prep.js's spatialDecalsForSeg(pn, segNum) — the persist half.
  const decalsGroup = interiorBuildDecals(data.decals, cx, cz, S.interiorFloorTopMap);
  S.interiorGroup.add(decalsGroup);
  S.interiorDecalCount = (data.decals || []).length;

  // BEAUTY-WAVE.md VP6 item 3 — ambient motes, seeded off this board's own focus rect so re-rendering
  // the SAME board data yields the SAME mote field (never re-rolled every frame).
  // BW3-4 MOTE COUPLING: data.lights + cx/cz now ride along so interiorBuildMotes can (a) bias spawns
  // toward the room's own light pools and (b) mount the whole field in the SAME shifted coordinate
  // space every other piece of interior geometry already uses (see that function's own COORDINATE FIX
  // comment — the pre-unit call passed raw `b` with no shift at all).
  stopMoteDrift();
  const moteSeed = "motes:" + (data.realmId || env) + ":" + JSON.stringify(fit);
  const moteGroup = interiorBuildMotes(moteSeed, b, interiorMoteKindFor(data.lights), data.lights, cx, cz);
  S.interiorGroup.add(moteGroup);
  S.moteGroup = moteGroup;
  startMoteDrift();
}

/* PHASE 16 (realizePhaseCameraFit) — MF-1's authoritative tweened fit and BW3's post-suite mount.
   VERBATIM from theater-boot.js lines 6674-6686. */
function realizePhaseCameraFit(pass){
  const { mf1PreFitPos, mf1PreFitTarget, kit, rigOn } = pass;

  // BEAUTY-WAVE-4.md MF-1: this is the authoritative fit for the interior channel — covers every
  // beat/room refit AND every move-step (a move-step forces a fresh setInteriorBoard rebuild, so
  // "recompute on move-step" falls out of this same call path, per the pillar-cutaway comment above).
  // Tweened (not the plain placeCamera()) so the camera glides instead of snapping (Feel Law 1).
  placeCameraTweened((mf1PreFitPos && mf1PreFitTarget) ? { pos: mf1PreFitPos, target: mf1PreFitTarget } : null);
  // BEAUTY-WAVE-3 THE POST SUITE (BW3-2/3/6): mount DoF + selective bloom + filmic grade onto the
  // composer for this interior board. AFTER the authoritative placeCamera above so updateDofFocus
  // projects the FINAL camera fit (the focal band tracks beat-vs-room framing). kit + rigOn are this
  // function's own locals (the tile kit's authored gradeTint/gradeStrength drive the per-realm grade;
  // rigOn=false drops to a neutral grade for the study-rig's honest baseline). INTERIOR-ONLY — setBoard
  // (the flat tabletop) tears it back off.
  mountPostSuite(kit, rigOn);
}

/* PHASE 17 (realizePhaseTail) — MF-2 item 4's fade back to the revealed room, CL-R0's post-rebuild
   clay hook + lighting probe, and markDirty. VERBATIM from theater-boot.js lines 6687-6720. */
function realizePhaseTail(pass){
  const { isRoomTransition, clayLightingProbeBefore, preserveInteriorLighting } = pass;

  // BEAUTY-WAVE-4.md MF-2 item 4: the rebuild (everything above) has finished — fade the transition
  // overlay back to transparent over ROOM_TRANSITION_DUR, revealing the freshly-built room. Skipped on
  // this mount's first reveal (isRoomTransition false — the overlay was never snapped opaque, so a
  // fade from 0 would be a harmless no-op anyway, but skipping is the honest "no transition happened"
  // read for a fresh mount's own instrumentation).
  if(isRoomTransition && S.transitionEl){
    pushScreenFade(buildTheaterCtx(), {
      setOpacity: function(v){ S.transitionEl.style.opacity = String(v); },
      from: 1, to: 0, dur: ROOM_TRANSITION_DUR
    });
    startTweenLoop();
  }

  // CL-R0 (docs/CLAYROOM-RESET-LADDER.md) — THE ONE post-rebuild hook for the Clayroom diagnostic
  // fixture. It lives HERE, at this function's single exit, because this function is the one funnel
  // every interior rebuild passes through: the clay mount's own first build and all five
  // asynchronous replay sites (sprite texture settle ~3078, donor template settle ~4029, dressing
  // art settle ~9167/9177, the module-scope post-load whole-object replay ~12524, setInteriorVariant
  // ~11752 / lightLabApplyTunables ~13992). Before CL-R0 the clay fixture reasserted itself from
  // mountClayRoom() alone plus a per-frame light poll, so every one of those replays silently
  // restored production site materials — the measured cause of "basic dungeon floor glued to it."
  // Costs one boolean read (S.clayRoomDiagnosticActive) per interior rebuild in normal play; the
  // function is declared in this file's CLAY-ROOM ADDITIONS region and hoists.
  clayRoomAfterInteriorBoardRebuild();
  if(clayLightingProbeBefore){
    clayRoomRecordLightingProbe(
      "door/camera/fade/board rebuild",
      clayLightingProbeBefore,
      preserveInteriorLighting
    );
  }

  markDirty();
}

/* window.Theater.setInteriorVariant(flags) — DUNGEON-GRAPH.md U3 render-quality study card ONLY
   (dev/battle-gate/capture-interior-study.mjs is the sole caller; no product code path sets this).
   flags: {ao, banded, fog} — see interiorApplyAODarkening / applyPsxShaderTweaks' banded injection /
   setInteriorBoard's fogOn ternary above for what each does. Merges onto S.interiorVariant (persists
   across calls, same convention as S.zoomLevel) and, if an interior board is already mounted, forces
   an immediate rebuild under the new flags by replaying S.lastBoard through setInteriorBoard (the
   SAME "null the dirty key, replay" trick the async texture/glb loaders already use elsewhere in this
   file) — the study rig calls this BETWEEN setInteriorBoard(sameBoard) calls to capture every variant
   of the identical scene. */
export function setInteriorVariant(flags){
  S.interiorVariant = Object.assign({}, S.interiorVariant, flags || {});
  if(S.lastBoard && S.lastBoard.kind === "interior3d"){
    S.boardKey = null;
    setInteriorBoard(S.lastBoard);
  }
}
