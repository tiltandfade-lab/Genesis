/* THEATER CLAY ROOM — the ?clayroom=1 dev workbench, extracted VERBATIM from
   src/ui/theater-boot.js in split step B1 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).
   The CLAY-ROOM ADDITIONS BEGIN/END markers below delimit the same region
   dev/verify-clay-room.mjs has always grep-gated — the markers travel with the code.

   OWNERSHIP: every clayRoom-/clay-prefixed S-field namespace entry, the clay DOM panel, its overlay
   groups, pick/movement/lighting/structure benches, and their teardown (clayRoomUnmount).
   State/GPU resources it creates are torn down by its own unmount path; it owns no scheduler
   (the root's dirty-frame scheduler renders; the root's renderTheaterFrame polls
   clayRoomMaybeAutoMount, and setInteriorBoard's tail calls clayRoomAfterInteriorBoardRebuild).

   CTX LAW (recon §7.3 — acyclic imports): this module NEVER imports theater-boot.js. The root
   passes its capabilities ONCE via clayRoomInit(ctx) into the module-local mirrors below, so the
   moved bodies stay byte-identical (same bare identifiers). S is the ONE live theater-state
   record; the root re-syncs the mirror via clayRoomSyncState(S) at both of its
   `S = createTheaterState()` sites (retire/remount) — a stale S here would resurrect a retired
   theater, which the split brief forbids. ITR_ROOM_SHELL stays a ROOT-owned live flag (the
   facade's setRoomShell writes it): the three sites in this region that touched it now go
   through the clayCtxGet/SetRoomShell accessors instead of a stale mirror. */
import * as THREE from "three";
import { playStandeeVerb, bindStandeeCtx, stopIdleBreathe } from "./standee-verbs.js";
import { DEFAULT_WALL_CAP_HEIGHT, compileRoomShell, segmentNormal } from "./theater-room-mesh.js";
/* R1 (2026-07-28) — the camera-pitch constant, imported leaf-to-leaf exactly as this module already
   takes standee-verbs and theater-room-mesh. The R1 agreement instrument has to know what the ONE
   permitted angle between a sprite and its base IS, and re-declaring 35 here would be a second
   truth that drifts the day the camera moves. theater-camera.js imports only three and
   theater-post.js, so this adds no cycle. */
import { CAM_ELEV_DEG } from "./theater-camera.js";
import { tickTweens } from "./theater-verbs.js";

// ---- root-capability mirrors (wired once by clayRoomInit; S re-synced by clayRoomSyncState) ----
let S;
let clayCtxGetRoomShell, clayCtxSetRoomShell;
let addInteriorContactBlob, addWallContactAO, applyLightProfile, applyPsxCanvasSize, buildFurnitureAssembly;
let buildInteriorBase, buildSpriteBillboard, buildTheaterCtx, clayRoomSetSelectedSprite, clayRoomSetSelectedSpriteView;
let clayRoomSpriteCitizenshipSnapshot, clearGroup, createTheaterState, donorTemplateFor, drainTweens;
let dressingTextureFor, f1BuildCombatGrid, findUnit, interiorBuildInstancedMesh, interiorBuildInteractables;
let interiorBuildLights, interiorBuildMotes, interiorBuildPieces, interiorFloorTopAt, interiorSpriteBillboard;
let interiorStandeeContactY, interiorStandeeSupportMetrics, itrOcclusionClassify, itrPillarCutawayMask, lightFlickerApplySample;
let lightFlickerStep, lightLabApplyTunables, lightLabMaybeAutoMount, lightLabShouldEnable, markDirty;
let mount, mountLightLab, placeCameraTweened, play, renderTheaterFrame;
let retire, rotate, scheduleRender, setBaseGlow, setInteriorBoard;
let setInteriorVariant, spriteAssetPathFor, spriteEntryFor, spriteTextureFor, startLightFlicker;
let startTweenLoop, stopLightFlicker, stopMoteDrift, syncStandeeContactBlob, zoom, BLOOM_LAYER;
let HUMAN_TRUE_HEIGHT, INTERIOR_BASE_HEIGHT, INTERIOR_BASE_TREAD_DEPTH, INTERIOR_CAM_MODE, ITR_DOOR_DEPTH_IN_WALL_DEFAULT;
let ITR_DOOR_MOUNT_ALONG_SHELL, ITR_DOOR_SWING_TWEEN_MS, ITR_SHADOW_FORM_HEMI_FLOOR, LIGHT_LAB_AUTHORED_BASELINE, LIGHT_TUNABLES;
let PSX_RES_SCALE;

export function clayRoomInit(ctx){
  ({ addInteriorContactBlob,
    addWallContactAO,
    applyLightProfile,
    applyPsxCanvasSize,
    buildFurnitureAssembly,
    buildInteriorBase,
    buildSpriteBillboard,
    buildTheaterCtx,
    clayRoomSetSelectedSprite,
    clayRoomSetSelectedSpriteView,
    clayRoomSpriteCitizenshipSnapshot,
    clearGroup,
    createTheaterState,
    donorTemplateFor,
    drainTweens,
    dressingTextureFor,
    f1BuildCombatGrid,
    findUnit,
    interiorBuildInstancedMesh,
    interiorBuildInteractables,
    interiorBuildLights,
    interiorBuildMotes,
    interiorBuildPieces,
    interiorFloorTopAt,
    interiorSpriteBillboard,
    interiorStandeeContactY,
    interiorStandeeSupportMetrics,
    itrOcclusionClassify,
    itrPillarCutawayMask,
    lightFlickerApplySample,
    lightFlickerStep,
    lightLabApplyTunables,
    lightLabMaybeAutoMount,
    lightLabShouldEnable,
    markDirty,
    mount,
    mountLightLab,
    placeCameraTweened,
    play,
    renderTheaterFrame,
    retire,
    rotate,
    scheduleRender,
    setBaseGlow,
    setInteriorBoard,
    setInteriorVariant,
    spriteAssetPathFor,
    spriteEntryFor,
    spriteTextureFor,
    startLightFlicker,
    startTweenLoop,
    stopLightFlicker,
    stopMoteDrift,
    syncStandeeContactBlob,
    zoom,
    BLOOM_LAYER,
    HUMAN_TRUE_HEIGHT,
    INTERIOR_BASE_HEIGHT,
    INTERIOR_BASE_TREAD_DEPTH,
    INTERIOR_CAM_MODE,
    ITR_DOOR_DEPTH_IN_WALL_DEFAULT,
    ITR_DOOR_MOUNT_ALONG_SHELL,
    ITR_DOOR_SWING_TWEEN_MS,
    ITR_SHADOW_FORM_HEMI_FLOOR,
    LIGHT_LAB_AUTHORED_BASELINE,
    LIGHT_TUNABLES,
    PSX_RES_SCALE } = ctx);
  S = ctx.S;
  clayCtxGetRoomShell = ctx.clayCtxGetRoomShell;
  clayCtxSetRoomShell = ctx.clayCtxSetRoomShell;
}
// The root calls this at BOTH of its `S = createTheaterState()` sites — the mirror must always
// point at the live record, never a retired one.
export function clayRoomSyncState(nextS){ S = nextS; }

/* CLAY-ROOM ADDITIONS BEGIN — docs/C1A-CLAY-ROOM.md (Q12-B wave-12 gate, execution order U1->U2->U3;
   D15 re-wire addendum, 2026-07-23, this unit).
   D2 placement law: appended functions ONLY, plus at most two hook lines total added to the file's
   pre-existing bodies — this file adds exactly ONE (the clayRoomMaybeAutoMount() poll call inside
   renderTheaterFrame, beside lightLabMaybeAutoMount()'s own call, near this file's top). D1 clones
   the Light Lab dormant pattern verbatim (lightLabShouldEnable/lightLabMaybeAutoMount, this file
   ~14089-14110): a URL flag (?clayroom=1) OR a live console-settable GS.clayRoomEnabled, memoized
   once, zero DOM/listeners until the flag actually flips true.

   C1A surfaces below read the frozen record from clayRoomRecordFrom(seed). C1B movement projects
   immutable TacticalQueryKernel range/preview/commit receipts and feeds their exact cells into the
   existing move-step standee verb; this renderer still owns no rules, die resolution, or event
   application (grep-gated by dev/verify-clay-room.mjs check 7). D3: the interior
   (volumetric, perspective-composed) channel
   with the FIXED camera setInteriorBoard already gives it by default (INTERIOR_CAM_MODE==="persp",
   theater-interior.js:205) — this block never calls rotate()/zoom(), so "no rotation, no orbit"
   (W3 law) holds by omission, not a new guard. D5: the default (non-psx) canvas path — mount() is
   called with no `opts`, so S.psxEnabled stays its createTheaterState() default (false) and
   applyPsxCanvasSize's own DPR-capped branch runs unmodified; no new DPR code here.

   D15 RE-WIRE (docs/C1A-CLAY-ROOM.md spec addendum D15): the board-data path is now
   src/engine/clay-room.js's clayRoomBoardFrom(record) — the REAL production compile chain (a pinned
   synthetic walk fixture -> spatializePlan -> interiorBuildBoard), never a hand-assembled
   instances/doorframe/kitDoors/interactables literal (the OLD clayRoomBoardDataFrom shim, deleted
   this unit). mountClayRoom below calls it, then setInteriorBoard(compiled.board) directly — this
   file adds only POST-mount, additive treatment over that PRODUCTION output: the D4 light-profile
   override (clayRoomApplyLightProfile, unchanged), the D2-step-3 flat-grey material swaps
   (clayRoomFlattenFurniture, unchanged; clayRoomFlattenStructure, new — floor/wall/doorframe/pillar),
   the D12a seam grid (clayRoomBuildSeamGrid, unchanged), and D13 provenance tagging/audit (new). The
   door LEAF (a swinging mesh with an open/closed pose) is production's own data.interactables
   consumer (interiorBuildInteractables) fed by bindWalkInteractables in the real trayFrom pipeline —
   a pipeline stage D15 does not name and this unit does not call, so board.interactables stays empty
   (clay-room.js's own clayRoomBoardFrom sets it explicitly) rather than hand-built: the wall APERTURE
   and frame (jambs/header/arch corbels — real interiorBuildBoard output) render; no leaf fills it.
   Reported as a production-pipeline finding in this unit's own build report, never patched from here. */

let CLAY_ROOM_URL_FLAG = null;
// Holds ITR_ROOM_SHELL's pre-mount value across a mount/unmount cycle — see mountClayRoom's own
// header note (the room-shell-compiler finding) for why the restore happens in clayRoomUnmount,
// never immediately after setInteriorBoard.
let CLAY_ROOM_PRIOR_ROOM_SHELL = true;
function clayRoomShouldEnable(){
  try {
    if(typeof window === "undefined") return false;
    if(window.GS && window.GS.clayRoomEnabled === true) return true;
    if(CLAY_ROOM_URL_FLAG === null){
      CLAY_ROOM_URL_FLAG = !!(window.location && window.location.search
        && new URLSearchParams(window.location.search).get("clayroom") === "1");
    }
    return CLAY_ROOM_URL_FLAG;
  } catch(e){}
  return false;
}

const CLAY_ROOM_TRUTH_FIXTURE_ID = "cl-f00-room-truth";
const CLAY_ROOM_STRUCTURE_BENCH_ID = "cl-f01-structure-bench";
const CLAY_ROOM_LIGHTING_BENCH_ID = "cl-f02-lighting-bench";
const CLAY_ROOM_SPRITE_BENCH_ID = "cl-f03-sprite-citizenship";
const CLAY_ROOM_MATERIAL_BENCH_ID = "cl-f04-material-bench";
const CLAY_ROOM_TRIM_BENCH_ID = "cl-f05-trim-bench";
const CLAY_ROOM_GROUND_FIELD_BENCH_ID = "cl-f06-ground-field";
const CLAY_ROOM_SPRITE_SCALE_MODES = Object.freeze(["true-scale", "diagnostic-cap"]);
const CLAY_ROOM_LIGHT_PREVIEW_SEEDS = Object.freeze(["A", "B", "C"]);
const CLAY_ROOM_LORE_LIGHT_PREVIEWS = Object.freeze([
  Object.freeze({ id: "daylit", label: "SUN · DAY", source: "sunlight" }),
  Object.freeze({ id: "moonlit", label: "MOON · NIGHT", source: "moonlight" }),
  Object.freeze({ id: "magic-glow", label: "MAGIC", source: "arcane crystal" }),
  Object.freeze({ id: "torchlit", label: "FIRE", source: "torch flame" }),
  Object.freeze({ id: "lavalit", label: "LAVA", source: "molten fissure" })
]);
const CLAY_ROOM_MOOD_EXAMPLES = Object.freeze([
  Object.freeze({ id: "none", label: "SOURCE ONLY" }),
  Object.freeze({ id: "dawn-violet", label: "VIOLET DAWN" }),
  Object.freeze({ id: "crypt-violet", label: "VIOLET CRYPT" }),
  Object.freeze({ id: "dungeon-cold", label: "COLD DUNGEON" }),
  Object.freeze({ id: "spore-haze", label: "SPORE HAZE" })
]);
const CLAY_ROOM_LIGHTING_MATRIX_RECIPES = Object.freeze([
  "clay-neutral-truth",
  "clay-opposing-pair",
  "daylit",
  "moonlit",
  "magic-glow",
  "torchlit",
  "lavalit"
]);
function clayRoomFixtureIdFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("clayfixture")
      : null;
    if(raw === "room" || raw === CLAY_ROOM_TRUTH_FIXTURE_ID) return CLAY_ROOM_TRUTH_FIXTURE_ID;
    if(raw === "structure" || raw === "structure-bench" || raw === CLAY_ROOM_STRUCTURE_BENCH_ID){
      return CLAY_ROOM_STRUCTURE_BENCH_ID;
    }
    if(raw === "lights" || raw === "lighting-bench" || raw === CLAY_ROOM_LIGHTING_BENCH_ID){
      return CLAY_ROOM_LIGHTING_BENCH_ID;
    }
    if(raw === "sprites" || raw === "sprite-citizenship" || raw === CLAY_ROOM_SPRITE_BENCH_ID){
      return CLAY_ROOM_SPRITE_BENCH_ID;
    }
    if(raw === "materials" || raw === "material-bench" || raw === CLAY_ROOM_MATERIAL_BENCH_ID){
      return CLAY_ROOM_MATERIAL_BENCH_ID;
    }
    if(raw === "trim" || raw === "trim-bench" || raw === CLAY_ROOM_TRIM_BENCH_ID){
      return CLAY_ROOM_TRIM_BENCH_ID;
    }
    if(raw === "terrain" || raw === "terrain-bench" || raw === "cl-f07-terrain-bench"){
      return "cl-f07-terrain-bench";
    }
    if(raw === "ground" || raw === "ground-field" || raw === CLAY_ROOM_GROUND_FIELD_BENCH_ID){
      return CLAY_ROOM_GROUND_FIELD_BENCH_ID;
    }
  } catch(e){}
  // The active reset-ladder checkpoint opens on the fixture under review. Earlier fixtures remain
  // one click away and can be pinned directly with ?clayfixture=room or ?clayfixture=lights.
  return CLAY_ROOM_STRUCTURE_BENCH_ID;
}

function clayRoomGroundFieldModeFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("groundfield")
      : null;
    if(raw === "repeated" || raw === "control") return "repeated-control";
  } catch(e){}
  return "compiled";
}

/* CL-F06 stays on the real clayRoomBoardFrom -> interiorBuildBoard -> setInteriorBoard path, but
   strips the old creature/dressing presentation cast from this one material proof. The current
   production walls, floor volumes, camera, lights, shadows, and post path remain; only the optional
   world-sized field replaces the visible floor surface. */
function clayRoomBoardForFixture(board){
  if(!board || S.clayRoomFixtureId !== CLAY_ROOM_GROUND_FIELD_BENCH_ID) return board;
  const comparisonMode = clayRoomGroundFieldModeFromLocation();
  const root = "dev/model-qa/assetforge-real/runs/ground-field/positive/";
  return Object.assign({}, board, {
    groundField: {
      fixtureId: CLAY_ROOM_GROUND_FIELD_BENCH_ID,
      comparisonMode: comparisonMode,
      albedo: root + (comparisonMode === "repeated-control"
        ? "repeated-single-baseline.png" : "field-albedo.png"),
      normal: comparisonMode === "repeated-control" ? null : root + "field-normal.png",
      orm: comparisonMode === "repeated-control" ? null : root + "field-orm.png",
      roughness: root + "field-roughness.png",
      compilerReceipt: root + "receipt.json",
      roughnessValue: 0.86,
      normalScale: 1,
      aoMapIntensity: 0.72
    },
    pieces: [],
    dressing: [],
    furniture: [],
    wallProps: [],
    interactables: [],
    decals: [],
    portals: [],
    combat: null,
    cameraFit: { mode: "room", maxHeight: 0.5 }
  });
}

function clayRoomSetInteriorBoard(board, renderOpts){
  return setInteriorBoard(clayRoomBoardForFixture(board), renderOpts);
}
function clayRoomMaybeAutoMount(){
  // CL-R0 (docs/CLAYROOM-RESET-LADDER.md): this poll now does ONE thing — mount the surface if the
  // flag is on and it isn't up yet. It used to ALSO reassert the light profile every frame, because
  // production's asynchronous board replays overwrite the mounted scene's lights from outside
  // mountClayRoom(). That per-frame reassert was a patch over the real defect: the clay fixture had
  // no post-rebuild lifecycle hook at all, so it covered lights (which someone noticed) and not
  // materials (which nobody did) — the exact asymmetry that let the dungeon floor come back while
  // the two-temperature profile appeared to hold. Both now reassert together, once per rebuild,
  // from clayRoomAfterInteriorBoardRebuild() at setInteriorBoard's own tail.
  if(S.clayRoomMounted) return;
  if(!clayRoomShouldEnable()) return;
  mountClayRoom();
}

// D7/D2 step 3 — flat, untextured clay-grey, swapped onto ALREADY-BUILT PRODUCTION geometry
// post-mount (never a hand-assembled instance array — see this region's own D15 header note above
// for why that path is gone). No hand-derived wall-height/door-height/edge-offset constants remain
// here: those numbers now come from the REAL spatializer + interiorBuildBoard chain
// (src/engine/clay-room.js's clayRoomBoardFrom), never re-authored in this file.
// CL-R0: the COLOUR and the per-role ROUTE are no longer decided here at all — they come from
// CLAY_DIAGNOSTIC_SURFACE_RECIPE (src/engine/clay-room.js), read at CALL time inside the clay
// functions, never at module-eval time. That timing matters: several harnesses legitimately load
// theater-boot.js on its own, without the engine module, and a top-level read of a callTimeDep
// throws ReferenceError before a single test runs (caught by the full verify sweep the moment this
// was written as a module-scope const — dev/verify-agx-tonecurve.mjs and friends went red with
// "CLAY_DIAGNOSTIC_SURFACE_RECIPE is not defined"). manifest.json declares the module as a
// callTimeDep precisely because that is the contract: call time, not load time.

// D4 / CL-R1 — the authored ambient remains a scene-level light, but the opposing point pair now
// arrives through board.lights -> interiorBuildLights, the real production practical path. This hook
// therefore removes only applyLightProfile's unrelated tabletop/profile points and installs the
// authored 0.18 ambient. It is idempotent: a geometry/door rebuild that preserved the lighting
// identity returns without replacing a light object, material, or scheduler.
function clayRoomApplyLightProfile(record){
  if(!S.scene) return;
  const recipeId = S.clayRoomLightRecipeId
    || (S.clayRoomCompiled && S.clayRoomCompiled.lightRecipeId)
    || "clay-opposing-pair";
  const recipe = LIGHT_TUNABLES.profiles[recipeId] || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
  const profile = lightRecipeLegacyProfile(recipe);
  const ambientIsAuthored = !!(S.ambientLight && S.ambientLight.userData
    && S.ambientLight.userData.clayLightId === "clay-ambient");
  const hasForeignProfilePoints = !!(S.pointLights && S.pointLights.length);
  if(!ambientIsAuthored){
    if(S.ambientLight) S.scene.remove(S.ambientLight);
    const ambient = new THREE.AmbientLight(profile.ambient.color, profile.ambient.intensity);
    ambient.userData.clayLightId = "clay-ambient";
    ambient.userData.clayLightRecipeId = recipe.id;
    S.scene.add(ambient);
    S.ambientLight = ambient;
  } else {
    S.ambientLight.color.setHex(profile.ambient.color);
    S.ambientLight.intensity = profile.ambient.intensity;
    S.ambientLight.userData.clayLightRecipeId = recipe.id;
  }
  if(hasForeignProfilePoints){
    // The old scheduler captured these exact profile point objects/bases. Stop it at the ownership
    // boundary before removing them, then bind the local-state scheduler to production practicals.
    stopLightFlicker();
    S.pointLights.forEach(function(l){ S.scene.remove(l); });
    S.pointLights = [];
    startLightFlicker(0, S.interiorLightTargets || []);
  }
  // Diagnostic modes still remove uncredited camera/key lights, but retain the low hemisphere
  // shadow-form floor: it is environment bounce, not a second subject light, and keeps tread/riser
  // orientation barely legible.
  if(recipe.mode.indexOf("diagnostic-") === 0){
    if(S.hemiLight) S.hemiLight.intensity = ITR_SHADOW_FORM_HEMI_FLOOR;
    [S.keyLight, S.fillLight, S.interiorCameraKey].forEach(function(light){
      if(light) light.intensity = 0;
    });
  }
  if(!S.clayRoomLightingBaseline && (S.interiorLightTargets || []).length){
    S.clayRoomLightingBaseline = clayRoomLightingSnapshot("authored-baseline");
  }
}

function clayRoomMoodLayerRecord(id){
  const vocabulary = (typeof CLAY_ROOM_MOOD_LAYERS !== "undefined")
    ? CLAY_ROOM_MOOD_LAYERS : null;
  if(!vocabulary || !vocabulary.layers) return null;
  return vocabulary.layers[id] || vocabulary.layers[vocabulary.defaultId] || null;
}
function clayRoomDisposeMoodLayer(){
  const group = S.clayRoomMoodGroup;
  if(group && group.parent) group.parent.remove(group);
  S.clayRoomMoodGroup = null;
}
function clayRoomApplyMoodLayer(){
  if(!S.scene) return null;
  const layer = clayRoomMoodLayerRecord(S.clayRoomMoodLayerId || "none");
  if(!layer) return null;
  clayRoomDisposeMoodLayer();
  const group = new THREE.Group();
  group.name = "clay-room-mood-" + layer.id;
  group.userData.clayRoomMood = true;
  group.userData.moodLayerId = layer.id;
  group.userData.nonShadowCasting = true;
  if(layer.ambient.intensity > 0){
    const ambient = new THREE.AmbientLight(layer.ambient.color, layer.ambient.intensity);
    ambient.name = "room-mood-ambient";
    ambient.castShadow = false;
    ambient.userData.clayRoomMoodLight = true;
    ambient.userData.moodRole = "ambient-volume";
    group.add(ambient);
  }
  if(layer.hemisphere.intensity > 0){
    const hemi = new THREE.HemisphereLight(
      layer.hemisphere.sky,
      layer.hemisphere.ground,
      layer.hemisphere.intensity
    );
    hemi.name = "room-mood-hemisphere";
    hemi.castShadow = false;
    hemi.userData.clayRoomMoodLight = true;
    hemi.userData.moodRole = "sky-ground-volume";
    group.add(hemi);
  }
  S.scene.add(group);
  S.clayRoomMoodGroup = group;

  const baseBackground = S.clayRoomMoodBaseBackground;
  if(baseBackground != null && S.scene.background && S.scene.background.isColor){
    const mixed = new THREE.Color(baseBackground).lerp(
      new THREE.Color(layer.void.color),
      Math.max(0, Math.min(1, layer.void.mix || 0))
    );
    S.scene.background.copy(mixed);
    if(S.scene.fog && S.scene.fog.color) S.scene.fog.color.copy(mixed);
    if(S.renderer) S.renderer.setClearColor(mixed, 1);
  }
  return clayRoomMoodSnapshot();
}
function clayRoomSetMoodLayer(id, reason){
  const layer = clayRoomMoodLayerRecord(id);
  if(!layer || layer.id !== id) return false;
  S.clayRoomMoodLayerId = id;
  S.clayRoomPixelMetricsCache = null;
  clayRoomApplyMoodLayer();
  if(typeof S.clayRoomRefreshLights === "function") S.clayRoomRefreshLights();
  markDirty();
  scheduleRender();
  return true;
}
function clayRoomMoodSnapshot(){
  const layer = clayRoomMoodLayerRecord(S.clayRoomMoodLayerId || "none");
  if(!layer) return null;
  const sourceRecipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId] || null;
  const sourceLights = [];
  if(S.interiorGroup){
    S.interiorGroup.traverse(function(light){
      if(!light || !light.isLight || !light.userData || !light.userData.lightId) return;
      sourceLights.push({
        id: light.userData.lightId,
        type: light.type,
        visible: light.visible !== false,
        intensity: Number.isFinite(light.intensity) ? +light.intensity.toFixed(5) : null,
        castShadow: !!light.castShadow
      });
    });
  }
  const moodLights = [];
  if(S.clayRoomMoodGroup){
    S.clayRoomMoodGroup.children.forEach(function(light){
      if(!light || !light.isLight) return;
      moodLights.push({
        role: light.userData.moodRole || null,
        type: light.type,
        intensity: Number.isFinite(light.intensity) ? +light.intensity.toFixed(5) : null,
        castShadow: !!light.castShadow
      });
    });
  }
  const combinedMoodIntensity = layer.ambient.intensity + layer.hemisphere.intensity;
  return {
    vocabularyId: CLAY_ROOM_MOOD_LAYERS.id,
    vocabularyVersion: CLAY_ROOM_MOOD_LAYERS.version,
    pairId: (S.clayRoomLightRecipeId || "none") + "+" + layer.id,
    baseRecipeId: S.clayRoomLightRecipeId || null,
    sourceClass: sourceRecipe && sourceRecipe.source ? sourceRecipe.source.class : null,
    sourceLabel: sourceRecipe && sourceRecipe.source ? sourceRecipe.source.label : null,
    layerId: layer.id,
    label: layer.label,
    themes: layer.themes.slice(),
    combinedMoodIntensity: +combinedMoodIntensity.toFixed(5),
    energyCap: CLAY_ROOM_MOOD_LAYERS.maxCombinedIntensity,
    underEnergyCap: combinedMoodIntensity <= CLAY_ROOM_MOOD_LAYERS.maxCombinedIntensity,
    sourceLights: sourceLights,
    moodLights: moodLights,
    sourceRetained: sourceLights.length > 0 && sourceLights.every(function(row){ return row.visible; }),
    moodCastsShadow: moodLights.some(function(row){ return row.castShadow; }),
    background: S.scene && S.scene.background && S.scene.background.isColor
      ? S.scene.background.getHex() : null
  };
}

function clayRoomSetLightingRecipe(recipeId, reason){
  if(!S.clayRoomRecord || !LIGHT_TUNABLES.profiles[recipeId]) return false;
  S.clayRoomPixelMetricsCache = null;
  const recipe = lightRecipeDeepClone(LIGHT_TUNABLES.profiles[recipeId]);
  // Seed preview is a disposable clone-time input, never a mutation of LIGHT_TUNABLES or the
  // authored lock. Static sun/moon recipes are unchanged; licensed flicker recipes replay a
  // different deterministic target sequence while preserving every physical value.
  const previewSeed = S.clayRoomPreviewSeed || CLAY_ROOM_LIGHT_PREVIEW_SEEDS[0];
  (recipe.lights || []).forEach(function(light){
    if(!light.flicker || !(Number(light.flicker.amplitude) > 0)) return;
    const authoredSeed = light.flicker.seed || (recipe.id + ":" + light.id);
    light.flicker.seed = authoredSeed + ":clay-preview-" + previewSeed;
  });
  const validation = lightRecipeValidate(recipe);
  if(!validation.ok){
    try { console.warn("qa: rejected invalid Clayroom lighting recipe", recipeId, validation.errors); } catch(e){}
    return false;
  }
  const compiled = clayRoomBoardFrom(S.clayRoomRecord, {
    lightRecipeId: recipeId,
    lightRecipe: recipe
  });
  S.clayRoomCompiled = compiled;
  S.clayRoomLightRecipeId = recipeId;
  S.clayRoomLightingBaseline = null;
  S.boardKey = null;
  const session = clayRoomMovementSession();
  clayRoomSetInteriorBoard(
    (session && clayRoomMovementBoardFromState(session.state)) || compiled.board,
    { roomTransition: false, reason: reason || "clayroom-light-recipe" }
  );
  // A recipe change is the one rebuild that SHOULD replace lighting identity. Do not present that
  // expected replacement as a lifecycle failure in the same readout used for geometry-only replays.
  S.clayRoomLightingProbeToken = (S.clayRoomLightingProbeToken || 0) + 1;
  S.clayRoomLightingProbe = {
    label: "recipe switch → " + recipeId,
    expectedReplacement: true,
    preserved: false,
    duringPass: true,
    afterPass: true
  };
  if(typeof S.clayRoomRefreshLightCatalog === "function") S.clayRoomRefreshLightCatalog();
  if(typeof S.clayRoomRefreshLights === "function") S.clayRoomRefreshLights();
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
  return true;
}

function clayRoomSetFixture(fixtureId, reason){
  if(fixtureId !== CLAY_ROOM_TRUTH_FIXTURE_ID
    && fixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID
    && fixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID
    && fixtureId !== CLAY_ROOM_SPRITE_BENCH_ID
    && fixtureId !== CLAY_ROOM_MATERIAL_BENCH_ID
    && fixtureId !== CLAY_ROOM_TRIM_BENCH_ID
    && fixtureId !== CLAY_ROOM_TERRAIN_BENCH_ID
    && fixtureId !== CLAY_ROOM_GROUND_FIELD_BENCH_ID){
    return false;
  }
  if(!S.clayRoomCompiled || !S.clayRoomRecord) return false;
  S.clayRoomFixtureId = fixtureId;
  S.clayCamOffset = { x: 0, z: 0 };
  S.clayCamZoom = fixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
      ? 0.72 : (fixtureId === CLAY_ROOM_SPRITE_BENCH_ID ? 0.9
      : (fixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID ? 0.65
        : (fixtureId === CLAY_ROOM_MATERIAL_BENCH_ID ? 0.78
          : (fixtureId === CLAY_ROOM_TRIM_BENCH_ID ? 0.5
            : (fixtureId === CLAY_ROOM_TERRAIN_BENCH_ID ? 0.42
              : (fixtureId === CLAY_ROOM_GROUND_FIELD_BENCH_ID ? 0.72 : 1))))));
  S.boardKey = null;
  const session = clayRoomMovementSession();
  const board = (session && clayRoomMovementBoardFromState(session.state)) || S.clayRoomCompiled.board;
  clayRoomSetInteriorBoard(board, { roomTransition: false, reason: reason || "clayroom-fixture-switch" });
  if(fixtureId === CLAY_ROOM_TRUTH_FIXTURE_ID) clayRoomMovementRangesRender();
  else clayRoomDisposeMovementOverlay();
  if(typeof S.clayRoomRefreshFixtureControls === "function") S.clayRoomRefreshFixtureControls();
  if(typeof S.clayRoomWorkbenchSelect === "function"){
    const roomOnlySelected = S.clayRoomSelectedId === S.clayRoomRecord.portal.id
      || S.clayRoomSelectedId === S.clayRoomRecord.object.id;
    if((fixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
      || fixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
      || fixtureId === CLAY_ROOM_SPRITE_BENCH_ID
      || fixtureId === CLAY_ROOM_MATERIAL_BENCH_ID
      || fixtureId === CLAY_ROOM_TRIM_BENCH_ID
      || fixtureId === CLAY_ROOM_TERRAIN_BENCH_ID
      || fixtureId === CLAY_ROOM_GROUND_FIELD_BENCH_ID) && roomOnlySelected){
      const recipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId];
      const light = recipe && (recipe.lights || []).find(function(row){ return row.enabled !== false; });
      if(light) S.clayRoomWorkbenchSelect(light.id, "fixture switch");
    }
    if(fixtureId === CLAY_ROOM_SPRITE_BENCH_ID){
      const fixture = clayRoomSpriteCitizenshipFixtureFrom(S.clayRoomRecord);
      S.clayRoomSelectedSpriteSlug = S.clayRoomSelectedSpriteSlug || fixture.selectedSlug;
      S.clayRoomWorkbenchSelect(S.clayRoomSelectedSpriteSlug, "fixture switch");
      if(typeof S.clayRoomShowTab === "function") S.clayRoomShowTab("sprites");
    }
    if(fixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID){
      S.clayRoomSelectedId = "compiled-shell";
      S.clayRoomWorkbenchSelect("compiled-shell", "fixture switch");
      if(typeof S.clayRoomShowTab === "function") S.clayRoomShowTab("structure");
    }
    if(fixtureId === CLAY_ROOM_MATERIAL_BENCH_ID){
      S.clayRoomSelectedId = CLAY_MATERIAL_BENCH_FIXTURE.materials[0].id;
      S.clayRoomWorkbenchSelect(S.clayRoomSelectedId, "fixture switch");
      if(typeof S.clayRoomShowTab === "function") S.clayRoomShowTab("materials");
    }
    if(fixtureId === CLAY_ROOM_TRIM_BENCH_ID){
      S.clayRoomSelectedId = CLAY_TRIM_BENCH_FIXTURE.structures[0].id;
      S.clayRoomWorkbenchSelect(S.clayRoomSelectedId, "fixture switch");
      if(typeof S.clayRoomShowTab === "function") S.clayRoomShowTab("trim");
    }
  }
  if(typeof S.clayRoomRefreshLights === "function") S.clayRoomRefreshLights();
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
  if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
  if(typeof S.clayRoomRefreshMaterials === "function") S.clayRoomRefreshMaterials();
  if(typeof S.clayRoomRefreshTrim === "function") S.clayRoomRefreshTrim();
  if(fixtureId === CLAY_ROOM_MATERIAL_BENCH_ID || fixtureId === CLAY_ROOM_TRIM_BENCH_ID){
    S.clayRoomCatalogCollapsed = true;
    clayRoomApplyWorkbenchLayout();
    setTimeout(function(){ clayRoomResizeAndRestorePose(); }, 0);
  }
  return true;
}

function clayRoomSetSpriteScaleMode(mode, reason){
  if(CLAY_ROOM_SPRITE_SCALE_MODES.indexOf(mode) < 0) return false;
  if(S.clayRoomSpriteScaleMode === mode) return true;
  S.clayRoomSpriteScaleMode = mode;
  if(S.clayRoomFixtureId !== CLAY_ROOM_SPRITE_BENCH_ID) return true;
  S.boardKey = null;
  const session = clayRoomMovementSession();
  const board = session && clayRoomMovementBoardFromState(session.state);
  if(board) clayRoomSetInteriorBoard(board, { roomTransition: false, reason: reason || "clayroom-sprite-scale-mode" });
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
  return true;
}

function clayRoomLightingSnapshot(label){
  function n(v){ return Number.isFinite(v) ? +v.toFixed(6) : null; }
  function colorOf(light){
    return light && light.color && typeof light.color.getHex === "function" ? light.color.getHex() : null;
  }
  function rigLight(light){
    return light ? { uuid: light.uuid, intensity: n(light.intensity), color: colorOf(light) } : null;
  }
  const targets = (S.interiorLightTargets || []).map(function(t){
    const emitted = t.pl ? t.pl.intensity : null;
    const mesh = t.marker && t.marker.material
      ? (t.emissiveFlicker ? t.marker.material.emissiveIntensity : t.marker.material.opacity)
      : null;
    const baseMesh = t.emissiveFlicker ? t.baseEmissiveIntensity : t.baseOpacity;
    const emittedNormalized = t.baseIntensity ? emitted / t.baseIntensity : null;
    const meshNormalized = baseMesh ? mesh / baseMesh : null;
    // WORLD position — the readout's mounted-truth line must name where the light actually sits
    // in the room, not its local offset inside a fixture group (Checkpoint 2 readout truth).
    const pointPosition = (function(){
      if(!t.pl || !t.pl.getWorldPosition) return null;
      const wp = new THREE.Vector3();
      t.pl.getWorldPosition(wp);
      return [n(wp.x), n(wp.y), n(wp.z)];
    })();
    const emitterPosition = t.marker && t.marker.position
      ? [n(t.marker.position.x), n(t.marker.position.y), n(t.marker.position.z)]
      : null;
    const direction = t.directionSample || { x: 0, y: 0, z: 0 };
    const directionRadius = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y + direction.z * direction.z
    );
    const directionAmplitude = Number(t.directionAmplitude) || 0;
    return {
      id: t.id,
      sourceRef: t.sourceRef,
      state: t.state,
      sampleIndex: t.sampleIndex || 0,
      normalizedSample: n(t.normalizedSample),
      emitted: n(emitted),
      emittedBase: n(t.baseIntensity),
      emittedNormalized: n(emittedNormalized),
      mesh: n(mesh),
      meshBase: n(baseMesh),
      meshNormalized: n(meshNormalized),
      parity: emittedNormalized != null && meshNormalized != null
        ? Math.abs(emittedNormalized - meshNormalized) < 0.000001
        : false,
      pointUuid: t.pl ? t.pl.uuid : null,
      emitterUuid: t.marker ? t.marker.uuid : null,
      emitterBloomSuppressed: !!(t.marker && t.marker.userData && t.marker.userData.bloomSuppressed),
      materialUuid: t.marker && t.marker.material ? t.marker.material.uuid : null,
      color: colorOf(t.pl),
      distance: t.pl ? n(t.pl.distance) : null,
      decay: t.pl ? n(t.pl.decay) : null,
      castShadow: t.pl ? !!t.pl.castShadow : null,
      shadowMapSize: t.pl && t.pl.shadow && t.pl.shadow.mapSize
        ? [n(t.pl.shadow.mapSize.x), n(t.pl.shadow.mapSize.y)]
        : null,
      shadowCameraFar: t.pl && t.pl.shadow && t.pl.shadow.camera
        ? n(t.pl.shadow.camera.far)
        : null,
      pointPosition: pointPosition,
      emitterPosition: emitterPosition,
      celestial: t.pl && t.pl.userData && t.pl.userData.celestial ? t.pl.userData.celestial : null,
      basePointPosition: t.basePointPosition
        ? [n(t.basePointPosition.x), n(t.basePointPosition.y), n(t.basePointPosition.z)]
        : null,
      baseEmitterPosition: t.baseMarkerPosition
        ? [n(t.baseMarkerPosition.x), n(t.baseMarkerPosition.y), n(t.baseMarkerPosition.z)]
        : null,
      directionSample: { x: n(direction.x), y: n(direction.y), z: n(direction.z) },
      directionAmplitude: n(directionAmplitude),
      directionWithinBounds: directionAmplitude === 0
        ? directionRadius < 0.000001
        : directionRadius <= directionAmplitude * 1.05,
      coLocated: !!pointPosition && !!emitterPosition
        && pointPosition.every(function(value, index){
          return Math.abs(value - emitterPosition[index]) < 0.000001;
        }),
      cadenceMs: t.cadenceMs,
      intervalJitter: n(t.intervalJitter),
      lastIntervalMs: t.lastIntervalMs == null ? null : n(t.lastIntervalMs),
      nextIntervalMs: t.nextIntervalMs == null ? null : n(t.nextIntervalMs),
      materialColor: t.marker && t.marker.material && t.marker.material.color
        ? t.marker.material.color.getHex()
        : null,
      materialEmissive: t.marker && t.marker.material && t.marker.material.emissive
        ? t.marker.material.emissive.getHex()
        : null,
      materialOpacity: t.marker && t.marker.material ? n(t.marker.material.opacity) : null,
    };
  });
  return {
    label: label || "",
    at: Date.now(),
    ambient: S.ambientLight ? {
      uuid: S.ambientLight.uuid,
      intensity: n(S.ambientLight.intensity),
      color: colorOf(S.ambientLight),
    } : null,
    rig: {
      hemi: rigLight(S.hemiLight),
      key: rigLight(S.keyLight),
      fill: rigLight(S.fillLight),
      cameraKey: rigLight(S.interiorCameraKey),
    },
    lights: targets,
  };
}

function clayRoomLightingSnapshotsMatch(before, after){
  if(!before || !after || !before.ambient || !after.ambient) return false;
  if(before.ambient.uuid !== after.ambient.uuid
    || before.ambient.intensity !== after.ambient.intensity
    || before.ambient.color !== after.ambient.color
    || JSON.stringify(before.rig) !== JSON.stringify(after.rig)) return false;
  if(before.lights.length !== after.lights.length) return false;
  return before.lights.every(function(b){
    const a = after.lights.find(function(row){ return row.id === b.id; });
    if(!a || a.pointUuid !== b.pointUuid || a.emitterUuid !== b.emitterUuid
      || a.materialUuid !== b.materialUuid || a.color !== b.color || a.state !== b.state
      || a.distance !== b.distance || a.decay !== b.decay
      || a.castShadow !== b.castShadow || a.shadowCameraFar !== b.shadowCameraFar
      || JSON.stringify(a.shadowMapSize) !== JSON.stringify(b.shadowMapSize)
      || JSON.stringify(a.basePointPosition) !== JSON.stringify(b.basePointPosition)
      || JSON.stringify(a.baseEmitterPosition) !== JSON.stringify(b.baseEmitterPosition)
      || a.directionAmplitude !== b.directionAmplitude
      || a.cadenceMs !== b.cadenceMs || a.intervalJitter !== b.intervalJitter
      || a.materialColor !== b.materialColor || a.materialEmissive !== b.materialEmissive
      || a.materialOpacity !== b.materialOpacity || !a.parity
      || !a.coLocated || !a.directionWithinBounds) return false;
    // Flickering is allowed to move by definition; steady means byte-stable photometric + visible.
    if(a.state === "steady"){
      return a.emitted === b.emitted && a.mesh === b.mesh
        && a.emittedNormalized === 1 && a.meshNormalized === 1
        && JSON.stringify(a.pointPosition) === JSON.stringify(b.pointPosition)
        && JSON.stringify(a.emitterPosition) === JSON.stringify(b.emitterPosition);
    }
    return true;
  });
}

function clayRoomRecordLightingProbe(label, before, preserved){
  const during = clayRoomLightingSnapshot("during-animation");
  const token = (S.clayRoomLightingProbeToken || 0) + 1;
  S.clayRoomLightingProbeToken = token;
  S.clayRoomLightingProbe = {
    label: label,
    preserved: !!preserved,
    before: before,
    during: during,
    after: null,
    duringPass: !!preserved && clayRoomLightingSnapshotsMatch(before, during),
    afterPass: null,
  };
  setTimeout(function(){
    if(!S.clayRoomDiagnosticActive || S.clayRoomLightingProbeToken !== token) return;
    const after = clayRoomLightingSnapshot("after-animation");
    S.clayRoomLightingProbe.after = after;
    S.clayRoomLightingProbe.afterPass = clayRoomLightingSnapshotsMatch(before, after);
  }, 900);
}

function clayRoomSetLightState(lightId, nextState){
  const target = (S.interiorLightTargets || []).find(function(t){ return t && t.id === lightId; });
  if(!target) return false;
  target.state = nextState === "flickering" ? "flickering" : "steady";
  target.sampleIndex = 0;
  target.normalizedSample = 1;
  if(target.pl) target.pl.userData.lightState = target.state;
  if(target.marker) target.marker.userData.lightState = target.state;
  if(target.pl && target.pl.parent && target.pl.parent.userData){
    target.pl.parent.userData.lightState = target.state;
  }
  if(target.state === "steady") lightFlickerApplySample(target, 1);
  startLightFlicker(0, S.interiorLightTargets || []);
  markDirty();
  return true;
}

function clayRoomRestoreAuthoredLightBaseline(){
  const recipeId = S.clayRoomLightRecipeId || "clay-opposing-pair";
  const authoredRecipe = LIGHT_LAB_AUTHORED_BASELINE.profiles[recipeId] || null;
  if(LIGHT_LAB_AUTHORED_BASELINE.profiles[recipeId]){
    LIGHT_TUNABLES.profiles[recipeId] = lightRecipeDeepClone(
      LIGHT_LAB_AUTHORED_BASELINE.profiles[recipeId]
    );
    clayRoomSetLightingRecipe(recipeId, "clayroom-authored-baseline");
  }
  (S.interiorLightTargets || []).forEach(function(t){
    const authoredLight = authoredRecipe && (authoredRecipe.lights || []).find(function(light){
      return light.id === t.id;
    });
    t.state = authoredLight && authoredLight.state === "flickering" ? "flickering" : "steady";
    t.sampleIndex = 0;
    lightFlickerApplySample(t, 1);
  });
  startLightFlicker(0, S.interiorLightTargets || []);
  markDirty();
}

/* ─── CL-R0 (docs/CLAYROOM-RESET-LADDER.md) — THE DIAGNOSTIC SURFACE ROUTE ────────────────────────
   Replaces clayRoomFlattenFurniture + clayRoomFlattenStructure (both deleted this unit). Those were
   two hand-written sweeps over a hardcoded four-kind whitelist, run ONCE from mountClayRoom(). Two
   independent defects followed, both measured live in the CL-R0 "before" capture
   (dev/clay-captures/cl-r0/before-receipt.json):

     1. NOT DURABLE. setInteriorBoard is re-entered from at least five asynchronous production
        replay sites OUTSIDE mountClayRoom() — spriteTextureFor's texture settle (this file ~3078),
        donorTemplateFor's GLTF settle (~4029), dressingTextureFor's real-art settle (~9167/9177),
        the module-scope post-load whole-object replay (~12524), and setInteriorVariant/
        lightLabApplyTunables (~11752/~13992). Each one rebuilds S.interiorGroup with production
        materials. The old sweeps never ran again, so the settled frame showed the realm's own
        textured floor/wall/doorframe: Adam's "It seems to have basic dungeon floor glued to it."
        Measured: floor region meanSaturation 175.4, neutralPct 0.00% — not one neutral pixel.
     2. NOT COMPLETE. The whitelist named floor/wall/doorframe/pillar. skirt, portal, every
        room-shell/kit-shell kind, and every future kind were never claimed at all.

   The repair is a single recipe-driven pass invoked from ONE post-rebuild lifecycle hook
   (clayRoomAfterInteriorBoardRebuild, at setInteriorBoard's own tail) so every rebuild path —
   present and future — routes through it. It swaps materials on already-built PRODUCTION geometry;
   it builds no geometry, forks no renderer, and holds no per-seed special case.

   INSTANCE COLOUR. interiorBuildInstancedMesh tints each instance via setColorAt (this file ~8103/
   ~8156), and THREE multiplies instanceColor into the material colour. Swapping the material alone
   therefore does NOT produce flat clay — it produces clay tinted by the kit's per-cell palette,
   which is why the fixture never looked uniform even before a replay landed. Claimed instanced
   meshes get every instance colour written to white so the multiply is identity; the census records
   `instanceColorNeutralized` so that fact is data, not a silent mutation. */
const CLAY_DIAGNOSTIC_MATERIALS = {};   // "#rrggbb" -> shared MeshLambertMaterial (flat, no map)
function clayDiagnosticMaterialFor(hex){
  if(!CLAY_DIAGNOSTIC_MATERIALS[hex]){
    CLAY_DIAGNOSTIC_MATERIALS[hex] = new THREE.MeshLambertMaterial({ color: hex });
    // Match the production world-surface shadow contract. Leaving this at THREE's automatic
    // FrontSide -> back-face shadow rule produces a false bright seam between flush clay blocks.
    CLAY_DIAGNOSTIC_MATERIALS[hex].shadowSide = THREE.FrontSide;
    CLAY_DIAGNOSTIC_MATERIALS[hex].userData.shadowContactMode = "front-face";
  }
  return CLAY_DIAGNOSTIC_MATERIALS[hex];
}

// The active diagnostic mode ("clay" | "role-id"), resolved ONCE from ?claysurface= (or a live
// GS.clayRoomSurfaceMode) through the engine module's own reader so no second spelling exists.
let CLAY_SURFACE_MODE = null;
function clayRoomSurfaceMode(){
  if(CLAY_SURFACE_MODE === null){
    let raw = null;
    try {
      if(typeof window !== "undefined"){
        if(window.GS && window.GS.clayRoomSurfaceMode) raw = window.GS.clayRoomSurfaceMode;
        else if(window.location && window.location.search){
          raw = new URLSearchParams(window.location.search).get("claysurface");
        }
      }
    } catch(e){}
    CLAY_SURFACE_MODE = clayDiagnosticModeFrom(raw);
  }
  return CLAY_SURFACE_MODE;
}

/* clayRoomSurfaceRoleFor(node, ancestorRole) -> a recipe role or null. Resolves ONE scene node
   against the renderer's own existing ownership tags, in the order production actually stamps them.
   No new tagging is introduced: every branch reads a userData field some production builder already
   writes, which is why this doubles as an honest provenance answer rather than a parallel registry.

   `ancestorRole` carries a role down a sub-tree (a furniture assembly's prisms, a sprite
   billboard's plane) so a child mesh inherits its assembly's ownership instead of reading as
   unclaimed. */
function clayRoomSurfaceRoleFor(node, ancestorRole){
  if(!node) return ancestorRole || null;
  const ud = node.userData || {};
  if(ud.clayGuardVisualMaterial) return "guard-visual-candidate";      // Golden Site governed material
  if(ud.groundField) return "ground-field-proof";                       // CL-F06 compiled field
  if(ud.clayMaterialBenchSurface) return "material-proof";            // CL-F04 candidate material
  const byKind = clayDiagnosticRoleForKind(ud.interiorKind);           // interiorBuildInstancedMesh / room-shell / kit-shell
  if(byKind) return byKind;
  // recipe v2: the standee support strip is its OWN surface under test (clay-routed so cast
  // shadows/AO read on it) — resolved BEFORE the sprite ancestor role can sweep it into passthrough
  if(ud.standeeBase) return "standee-base";                            // buildInteriorBase (~3852)
  if(ud.furnitureKind) return "furniture";                             // buildFurnitureAssembly (~9278)
  if(ud.spriteSlug) return "sprite";                                   // buildSpriteBillboard (~3180)
  if(ud.isDoorLeaf || ud.isDoorShard) return "door";                   // hinged leaf / broken shard
  if(ud.kind === "interactable" && ud.archetype === "door") return "door";
  if(ud.contactBlob || ud.wallContactAO) return "contact-shadow";      // addInteriorContactBlob / addWallContactAO
  if(ud.motePiece) return "mote";                                      // interiorBuildMotes
  if(ud.fixtureId || ud.emitter || ud.isLightEmitter) return "emitter"; // practical light bodies
  return ancestorRole || null;
}

/* clayRoomWalkSurfaces(visit) — one shared traversal, carrying the resolved role down each branch.
   Both the route application and the read-only census run through it, so what the census reports is
   by construction what the route saw.

   SCOPE (widened during CL-R0's own capture review): the walk starts at S.scene, not at
   S.interiorGroup. The first routed capture still showed one dark, red-mottled textured panel
   standing in the room while the census reported every surface flat and claimed — because that panel
   was mounted OUTSIDE S.interiorGroup and the census simply never looked at it. A provenance answer
   scoped to one group cannot honour CL-R0's requirement to say which system owns *every visible*
   surface; a surface the census cannot see is exactly the surface that reintroduces site material.
   `visit` receives the owning top-level group name so a foreign mount is attributable, not anonymous. */
function clayRoomSceneGroupNameFor(node){
  if(node === S.interiorGroup) return "interiorGroup";
  if(node === S.tileGroup) return "tileGroup";
  if(node === S.propGroup) return "propGroup";
  if(node === S.unitGroup) return "unitGroup";
  if(node === S.shadowGroup) return "shadowGroup";
  if(node === S.fxGroup) return "fxGroup";
  if(node === S.moteGroup) return "moteGroup";
  return null;
}
function clayRoomWalkSurfaces(visit){
  const root = S.scene || S.interiorGroup;
  if(!root) return;
  (function walk(node, ancestorRole, groupName){
    const g = clayRoomSceneGroupNameFor(node) || groupName;
    const role = clayRoomSurfaceRoleFor(node, ancestorRole);
    if(node.isMesh || node.isInstancedMesh) visit(node, role, g || "scene-direct");
    (node.children || []).forEach(function(child){ walk(child, role, g); });
  })(root, null, null);
}

/* clayRoomApplyDiagnosticSurfaces() — execute CLAY_DIAGNOSTIC_SURFACE_RECIPE over the mounted tree.
   Idempotent: safe to run after every rebuild, and a second run over an already-routed tree is a
   no-op assignment. Returns the count of surfaces it claimed, for the mount log. */
function clayRoomApplyDiagnosticSurfaces(){
  if(!S.scene && !S.interiorGroup) return 0;
  const mode = clayRoomSurfaceMode();
  let claimed = 0;
  clayRoomWalkSurfaces(function(mesh, role, groupName){
    // The seam grid is the diagnostic's own instrument, not a surface under test. It carries its own
    // recipe-owned colour (gridColor/gridOpacity) and must not be repainted by the role route.
    if(mesh.userData && mesh.userData.clayGrid) return;
    const decision = clayDiagnosticRouteFor(role, mode);
    if(decision.route === "passthrough") return;   // sprite art / emitter body / door state colour
    // "unclaimed" lands here too, deliberately: it is painted the loud UNCLAIMED colour rather than
    // left carrying whatever site material production gave it. A kind this recipe has never heard of
    // must be visible as a hole in the recipe, never as plausible-looking dungeon stone.
    //
    // FADE-AWARE SWAP (found live 2026-07-23, the ?clayshell=1 A/B): the room-shell wall-upper meshes
    // carry per-segment cloned materials whose OPACITY is mutated between rebuilds by the cutaway
    // tween (itrOcclusionClassify's fadeEntry.materials — see the wall-upper build site ~11378). A
    // naive `mesh.material = shared` swap severs that linkage: the probe showed the camera-side
    // suppression correctly classifying the two near walls as blocking and tweening THEIR OLD
    // materials to opacity 0.08 while the mesh rendered the shared clay material at 1.0 — opaque dark
    // slabs, the cutaway visibly "not working" while its state machine ran perfectly. So: if the
    // material being replaced is referenced by any live fade entry, the clay material is CLONED per
    // mesh (a shared material can't hold per-segment opacity), given the entry's CURRENT opacity +
    // transparent flag, and the entry's materials array is re-pointed at the clone — the tween keeps
    // driving the exact material the mesh renders, before and after every clay re-route.
    const priorMat = (mesh.material && !Array.isArray(mesh.material)) ? mesh.material : null;
    let fadeEntry = null;
    if(priorMat && S.occlusionFadeState){
      S.occlusionFadeState.forEach(function(e){
        if(!fadeEntry && e.materials && e.materials.indexOf(priorMat) >= 0) fadeEntry = e;
      });
    }
    if(fadeEntry){
      const clayMat = clayDiagnosticMaterialFor(decision.color).clone();
      clayMat.transparent = true;
      clayMat.opacity = (typeof fadeEntry.opacity === "number") ? fadeEntry.opacity : 1;
      mesh.material = clayMat;
      fadeEntry.materials = fadeEntry.materials.map(function(m){ return m === priorMat ? clayMat : m; });
    } else if(mesh.userData && mesh.userData.standeeBase){
      // recipe v2: the standee base swaps to clay like any surface under test, but as a PER-MESH
      // CLONE — setBaseGlow/selection write emissive straight onto this mesh's material, and a
      // shared clay material would light every clay surface in the room when one base glows.
      // The base geometry uses material GROUPS (top/side/bevel), so mirror its array shape.
      const baseClay = clayDiagnosticMaterialFor(decision.color);
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(function(){ return baseClay.clone(); })
        : baseClay.clone();
    } else {
      mesh.material = clayDiagnosticMaterialFor(decision.color);
    }
    if(mesh.isInstancedMesh && mesh.instanceColor){
      const white = new THREE.Color(1, 1, 1);
      for(let i = 0; i < mesh.count; i++) mesh.setColorAt(i, white);
      mesh.instanceColor.needsUpdate = true;
      mesh.userData.clayInstanceColorNeutralized = true;
    }
    mesh.userData.clayRoute = decision.route;
    mesh.userData.clayRole = decision.role;
    mesh.userData.clayGroup = groupName;
    claimed++;
  });
  return claimed;
}

/* clayRoomSurfaceCensus() -> the CL-R0 provenance answer: for every visible surface in the fixture,
   which builder owns it, which recipe route claimed it, and whether a colour texture is still bound.
   Read-only. This is the debug output the reset ladder requires ("tell which system owns every
   visible surface") and the shape the executable invariant asserts over:

     texturedClayCount   surfaces the recipe routed to diagnostic-clay that STILL carry a map.
                         Must be 0. A non-zero value is exactly the CR-1 regression returning.
     unclaimed           surfaces no recipe role matched. Must be 0 in an accepted fixture. */
function clayRoomSurfaceCensus(){
  const surfaces = [], unclaimed = [];
  const mode = clayRoomSurfaceMode();
  let texturedClayCount = 0;
  clayRoomWalkSurfaces(function(mesh, role, groupName){
    if(mesh.userData && mesh.userData.clayGrid) return; // the diagnostic's own instrument, not a surface under test
    const decision = clayDiagnosticRouteFor(role, mode);
    const mat = (mesh.material && !Array.isArray(mesh.material)) ? mesh.material : null;
    const textured = !!(mat && mat.map);
    // CR-6's lesson made permanent (the seam grid audited "owned" while rendering 13 cells away, and
    // the door tranche found the leaf owned-but-perpendicular): provenance without PLACEMENT is half
    // an answer. Every census row now carries the mesh's world position and its geometry's local
    // bounding size, computed without importing THREE into this diagnostic (the Vector3 comes from
    // position.constructor — the instance's own class).
    let worldPos = null, size = null;
    try {
      const v = new mesh.position.constructor();
      mesh.getWorldPosition(v);
      worldPos = [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
      if(mesh.geometry){
        if(!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const bb = mesh.geometry.boundingBox;
        if(bb){
          size = [+(bb.max.x - bb.min.x).toFixed(3), +(bb.max.y - bb.min.y).toFixed(3), +(bb.max.z - bb.min.z).toFixed(3)];
          // world centre of the geometry's own bb (translate-only — exact for the unrotated shell/
          // instanced meshes this exists to locate; a rotated mesh's pos field is already honest).
          worldPos = [+(worldPos[0] + (bb.min.x + bb.max.x) / 2).toFixed(3),
                      +(worldPos[1] + (bb.min.y + bb.max.y) / 2).toFixed(3),
                      +(worldPos[2] + (bb.min.z + bb.max.z) / 2).toFixed(3)];
        }
      }
    } catch(e){}
    const row = {
      role: decision.role,
      route: decision.route,
      group: groupName,
      pos: worldPos,
      size: size,
      rotY: +((mesh.rotation && mesh.rotation.y) || 0).toFixed(3),
      builder: (mesh.userData && mesh.userData.interiorKind) ? "interiorBuildInstancedMesh/" + mesh.userData.interiorKind
        : (mesh.userData && mesh.userData.spriteSlug) ? "buildSpriteBillboard"
        : (mesh.userData && mesh.userData.furnitureKind) ? "buildFurnitureAssembly"
        : (mesh.userData && (mesh.userData.isDoorLeaf || mesh.userData.archetype === "door")) ? "interiorBuildInteractables"
        : "unattributed",
      instances: mesh.isInstancedMesh ? mesh.count : 1,
      textured: textured,
      colorHex: (mat && mat.color) ? "#" + mat.color.getHexString() : null,
      instanceColorNeutralized: !!(mesh.userData && mesh.userData.clayInstanceColorNeutralized),
    };
    if(decision.route === "diagnostic-clay" && textured) texturedClayCount++;
    if(decision.route === "unclaimed") unclaimed.push(row);
    surfaces.push(row);
  });
  return {
    recipe: { id: CLAY_DIAGNOSTIC_SURFACE_RECIPE.id, version: CLAY_DIAGNOSTIC_SURFACE_RECIPE.version, mode: mode },
    surfaces: surfaces,
    unclaimed: unclaimed,
    texturedClayCount: texturedClayCount,
  };
}

/* CL-F01 structure bench — the production room-shell compiler owns the continuous floor, exposed
   slab sides, wall volumes/caps, corners, aperture, threshold, and retaining/riser runs. Generic
   structure-part assemblers own the remaining catalog atoms. All meshes remain in the same scene,
   camera, lights, shadows, tone map, and diagnostic-surface router as gameplay. */
function clayStructureMaterial(color){
  const material = new THREE.MeshStandardMaterial({
    color: color || CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor,
    roughness: 0.96,
    metalness: 0
  });
  material.shadowSide = THREE.FrontSide;
  material.userData.shadowContactMode = "front-face";
  return material;
}
function clayStructureTag(mesh, specId, kind){
  mesh.castShadow = kind !== "floor";
  mesh.receiveShadow = true;
  mesh.userData.interiorKind = kind;
  mesh.userData.structureCatalogId = CLAY_STRUCTURE_KIT_CATALOG.id;
  mesh.userData.structureCatalogVersion = CLAY_STRUCTURE_KIT_CATALOG.version;
  mesh.userData.structureSpecId = specId;
  mesh.userData.structureProvenance = CLAY_STRUCTURE_KIT_CATALOG.provenance;
  return mesh;
}
function clayStructureRampGeometry(width, run, rise){
  const hw = width / 2, hr = run / 2;
  const vertices = new Float32Array([
    -hw, 0, -hr,   hw, 0, -hr,   -hw, rise, hr,   hw, rise, hr,
    -hw, 0, hr,    hw, 0, hr
  ]);
  const indices = [
    0, 1, 3, 0, 3, 2,       // walk surface
    0, 4, 5, 0, 5, 1,       // underside
    4, 2, 3, 4, 3, 5,       // high face
    0, 2, 4,                 // left
    1, 5, 3                  // right
  ];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  // Checkpoint 4 (Adam's diagnosis: "the ramp ... looks inflated or pillow-like instead of
  // planar"): indexed shared vertices average normals across the wedge's hard faces. Drop the
  // index so computeVertexNormals produces true per-face normals — a crisp planar wedge.
  const hardFaced = geometry.toNonIndexed();
  hardFaced.computeVertexNormals();
  return hardFaced;
}
function clayStructureStripBetween(a, b, color, view, specId, thickness){
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.max(0.001, Math.hypot(dx, dz));
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(len, thickness || 0.035, (thickness || 0.035) * 1.45),
    new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false, toneMapped: false })
  );
  mesh.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.interiorKind = "clay-diagnostic-overlay";
  mesh.userData.structureOverlayView = view;
  mesh.userData.structureSpecId = specId;
  mesh.renderOrder = 72;
  return mesh;
}
// Checkpoint 4 SOCKET TRUTH ("socket marks do not communicate type, facing direction, polarity/
// ownership, or valid candidate pairing"): every socket now draws a TYPE-COLOURED ARROW along its
// actual authored axis — shaft plus angled head, so direction and polarity read from the frame.
// Omnidirectional sockets (floor-mount/top-surface, axis 0/0) draw a type-coloured cross at their
// face. The colour vocabulary is fixed and matches the panel legend.
const CLAY_SOCKET_TYPE_COLORS = {
  "butt-join-n": 0x35d8ff, "butt-join-e": 0x35d8ff, "butt-join-s": 0x35d8ff, "butt-join-w": 0x35d8ff,
  "walk-surface": 0x66dfa0, "top-surface": 0x6f8fff, "terrain-join": 0xc08a5a,
  "hinge": 0xff7ad8, "catch": 0xffe066, "floor-mount": 0xb9c2cc, "wall-mount": 0xb9c2cc,
};
function clayStructureOverlayLabel(text, x, y, z, color, view, specId){
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(12,17,22,0.88)";
  ctx.fillRect(0, 4, 256, 56);
  ctx.strokeStyle = "#" + new THREE.Color(color).getHexString();
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 6, 252, 52);
  ctx.fillStyle = "#f4f7fa";
  ctx.font = "700 23px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(text || "").toUpperCase(), 128, 33);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  }));
  sprite.position.set(x, y, z);
  sprite.scale.set(0.9, 0.225, 1);
  sprite.userData.interiorKind = "clay-diagnostic-overlay";
  sprite.userData.structureOverlayView = view;
  sprite.userData.structureSpecId = specId;
  sprite.renderOrder = 74;
  return sprite;
}
function clayStructureSocketLabel(socket){
  const axis = socket.axis || {};
  const direction = Math.abs(axis.x || 0) > Math.abs(axis.z || 0)
    ? ((axis.x || 0) > 0 ? "E" : "W")
    : ((axis.z || 0) > 0 ? "S" : ((axis.z || 0) < 0 ? "N" : ""));
  const shortType = String(socket.type || "")
    .replace(/^butt-join-./, "BUTT")
    .replace("-surface", "")
    .replace("-mount", "")
    .replace("-join", "");
  return (direction ? direction + " · " : "") + shortType;
}
function clayStructureAddSocketOverlay(group, spec, rawFloor, origin){
  const at = spec.at;
  const lift = spec.lift || 0;
  (spec.sockets || []).forEach(function(socket, index){
    const axis = socket.axis || { x: 0, z: 0 };
    const color = CLAY_SOCKET_TYPE_COLORS[socket.type] != null ? CLAY_SOCKET_TYPE_COLORS[socket.type] : 0x35d8ff;
    const spread = (index - ((spec.sockets.length - 1) / 2)) * 0.13;
    const x = at.x - origin.cx + (axis.x || 0) * 0.45 + (axis.z || 0) * spread;
    const z = at.z - origin.cz + (axis.z || 0) * 0.45 - (axis.x || 0) * spread;
    const y = rawFloor + lift + (socket.type === "top-surface" ? (spec.height || spec.rise || 0.5) + 0.05 : 0.08);
    const ax = axis.x || 0, az = axis.z || 0;
    if(Math.abs(ax) + Math.abs(az) > 0){
      // ARROW: shaft from the piece toward the joining direction, head at the tip
      const tip = new THREE.Vector3(x + ax * 0.34, y, z + az * 0.34);
      const tail = new THREE.Vector3(x - ax * 0.2, y, z - az * 0.2);
      group.add(clayStructureStripBetween(tail, tip, color, "sockets", spec.id, 0.05));
      // head: two short strips angled back from the tip (perpendicular blend)
      const px = -az, pz = ax; // perpendicular
      const headL = new THREE.Vector3(tip.x - ax * 0.14 + px * 0.1, y, tip.z - az * 0.14 + pz * 0.1);
      const headR = new THREE.Vector3(tip.x - ax * 0.14 - px * 0.1, y, tip.z - az * 0.14 - pz * 0.1);
      group.add(clayStructureStripBetween(headL, tip, color, "sockets", spec.id, 0.05));
      group.add(clayStructureStripBetween(headR, tip, color, "sockets", spec.id, 0.05));
      group.add(clayStructureOverlayLabel(
        clayStructureSocketLabel(socket),
        tip.x + ax * 0.18, y + 0.18 + index * 0.04, tip.z + az * 0.18,
        color, "sockets", spec.id
      ));
    } else {
      group.add(clayStructureStripBetween(
        new THREE.Vector3(x - 0.16, y, z), new THREE.Vector3(x + 0.16, y, z), color, "sockets", spec.id, 0.045));
      group.add(clayStructureStripBetween(
        new THREE.Vector3(x, y, z - 0.16), new THREE.Vector3(x, y, z + 0.16), color, "sockets", spec.id, 0.045));
      group.add(clayStructureOverlayLabel(
        clayStructureSocketLabel(socket),
        x, y + 0.22 + index * 0.05, z, color, "sockets", spec.id
      ));
    }
  });
}
// Checkpoint 4 ACCESS TRUTH ("show access data per relevant face rather than assigning one summary
// colour to an entire object"): each authored face class draws its OWN frame in its OWN class
// colour — the top/tread class outlines the top plane, the side class frames the two camera-facing
// vertical faces, and 'none' renders neutral grey so inaccessibility is visibly a datum, not an
// omission. Colours are fixed vocabulary matched by the panel legend.
const CLAY_ACCESS_CLASS_COLORS = { walk: 0x66dfa0, "climb-cost": 0xf3bd55, "climb-dc": 0xff6d68, none: 0x8a9099 };
function clayStructureAddAccessOverlay(group, spec, rawFloor, origin){
  const at = spec.at;
  const lift = spec.lift || 0;
  const width = spec.width || spec.length || ((spec.radius || 0.35) * 2) || 1;
  const depth = spec.depth || spec.run || spec.thickness || ((spec.radius || 0.35) * 2) || 0.45;
  const hw = Math.max(0.22, width / 2), hd = Math.max(0.18, depth / 2);
  const cx0 = at.x - origin.cx, cz0 = at.z - origin.cz;
  const h = (spec.rise || spec.height || 0.1);
  const baseY = rawFloor + lift + 0.02;
  const topY = rawFloor + lift + h + 0.025;
  const access = spec.access || {};
  const topClass = access.top || access.treads || null;
  const sideClass = access.sides || access.shaft || access.faces || access.inner || access.outer || null;
  const colorFor = function(cls){ return CLAY_ACCESS_CLASS_COLORS[cls] != null ? CLAY_ACCESS_CLASS_COLORS[cls] : 0xf3bd55; };
  const accessLabel = function(face, cls){
    if(face === "TOP" && cls === "walk") return "TOP · STANDABLE";
    if(cls === "climb-dc") return face + " · ROLL TO CLIMB";
    if(cls === "climb-cost") return face + " · CLIMB COST";
    return face + " · " + cls;
  };
  const frame = function(points, cls){
    if(!cls) return;
    for(let i = 0; i < points.length - 1; i++){
      group.add(clayStructureStripBetween(points[i], points[i + 1], colorFor(cls), "access", spec.id, 0.035));
    }
  };
  // TOP face (walk/tread class) — for the ramp, the frame follows the actual inclined plane
  if(spec.kind === "ramp"){
    const lowY = rawFloor + lift + 0.03, highY = rawFloor + lift + (spec.rise || 0.5) + 0.03;
    frame([
      new THREE.Vector3(cx0 - hw, lowY, cz0 - hd), new THREE.Vector3(cx0 + hw, lowY, cz0 - hd),
      new THREE.Vector3(cx0 + hw, highY, cz0 + hd), new THREE.Vector3(cx0 - hw, highY, cz0 + hd),
      new THREE.Vector3(cx0 - hw, lowY, cz0 - hd)
    ], topClass || access.top);
  } else {
    frame([
      new THREE.Vector3(cx0 - hw, topY, cz0 - hd), new THREE.Vector3(cx0 + hw, topY, cz0 - hd),
      new THREE.Vector3(cx0 + hw, topY, cz0 + hd), new THREE.Vector3(cx0 - hw, topY, cz0 + hd),
      new THREE.Vector3(cx0 - hw, topY, cz0 - hd)
    ], topClass);
  }
  if(topClass){
    group.add(clayStructureOverlayLabel(
      accessLabel("TOP", topClass),
      cx0, topY + 0.19, cz0, colorFor(topClass), "access", spec.id
    ));
  }
  // SIDE faces (the two camera-facing planes under the fixed production camera: +x and +z)
  if(sideClass){
    frame([
      new THREE.Vector3(cx0 + hw, baseY, cz0 - hd), new THREE.Vector3(cx0 + hw, baseY, cz0 + hd),
      new THREE.Vector3(cx0 + hw, topY, cz0 + hd), new THREE.Vector3(cx0 + hw, topY, cz0 - hd),
      new THREE.Vector3(cx0 + hw, baseY, cz0 - hd)
    ], sideClass);
    frame([
      new THREE.Vector3(cx0 - hw, baseY, cz0 + hd), new THREE.Vector3(cx0 + hw, baseY, cz0 + hd),
      new THREE.Vector3(cx0 + hw, topY, cz0 + hd), new THREE.Vector3(cx0 - hw, topY, cz0 + hd),
      new THREE.Vector3(cx0 - hw, baseY, cz0 + hd)
    ], sideClass);
    group.add(clayStructureOverlayLabel(
      accessLabel("SIDE", sideClass),
      cx0 + hw + 0.08, baseY + Math.max(0.22, h * 0.55), cz0 + hd + 0.08,
      colorFor(sideClass), "access", spec.id
    ));
  }
}
const CLAY_STRUCTURE_CONTACT_EMBED = 0.02;
function clayStructureCornerStair(group, spec, rawFloor, origin, add){
  const size = Math.max(0.75, spec.run || spec.width || 1);
  const steps = Math.max(2, spec.steps || 3);
  const tread = size / steps;
  const minX = spec.at.x - origin.cx - size / 2;
  const minZ = spec.at.z - origin.cz - size / 2;
  const maxX = minX + size;
  const maxZ = minZ + size;
  for(let i = 0; i < steps; i++){
    const height = spec.rise * (i + 1) / steps;
    const geometryHeight = height + CLAY_STRUCTURE_CONTACT_EMBED;
    const remaining = size - i * tread;
    const startX = minX + i * tread;
    const startZ = minZ + i * tread;
    const tagStep = function(mesh){
      mesh.userData.structureStepIndex = i;
      mesh.userData.structureStepCount = steps;
      mesh.userData.structureStepAxis = "corner";
      mesh.userData.structureStepDirection = 1;
      mesh.userData.structureStepSurfaceY = rawFloor + (spec.lift || 0) + height;
      mesh.userData.structureStepTreadDepth = tread;
      mesh.userData.structureGridShape = "rect";
      return mesh;
    };
    // INNER is the inverse of OUTER, not another shrinking outer corner. Its smallest bridge tread
    // is the LOWEST surface at the concave corner; successively higher non-overlapping L-bands expand
    // away from it and continue both incoming flights' rise. OUTER keeps the convex open-quadrant
    // wrap: a large low L contracts toward its small high corner.
    if(spec.kind === "stair-inner-corner"){
      const span = tread * (i + 1);
      const bandX = maxX - span;
      const bandZ = maxZ - span;
      tagStep(add(
        new THREE.Mesh(new THREE.BoxGeometry(span, geometryHeight, tread), clayStructureMaterial()),
        rawFloor + height / 2 - CLAY_STRUCTURE_CONTACT_EMBED / 2,
        bandX + span / 2, bandZ + tread / 2, "riser"
      ));
      if(span > tread + 0.001){
        tagStep(add(
          new THREE.Mesh(new THREE.BoxGeometry(tread, geometryHeight, span - tread), clayStructureMaterial()),
          rawFloor + height / 2 - CLAY_STRUCTURE_CONTACT_EMBED / 2,
          bandX + tread / 2, bandZ + tread + (span - tread) / 2, "riser"
        ));
      }
    } else {
      tagStep(add(
        new THREE.Mesh(new THREE.BoxGeometry(remaining, geometryHeight, tread), clayStructureMaterial()),
        rawFloor + height / 2 - CLAY_STRUCTURE_CONTACT_EMBED / 2,
        startX + remaining / 2, startZ + tread / 2, "riser"
      ));
      if(remaining > tread + 0.001){
        tagStep(add(
          new THREE.Mesh(new THREE.BoxGeometry(tread, geometryHeight, remaining - tread), clayStructureMaterial()),
          rawFloor + height / 2 - CLAY_STRUCTURE_CONTACT_EMBED / 2,
          startX + tread / 2, startZ + tread + (remaining - tread) / 2, "riser"
        ));
      }
    }
  }
}
function clayStructureBuildPart(group, spec, rawFloor, origin){
  const mat = clayStructureMaterial();
  function add(mesh, y, x, z, kind){
    // spec.lift: assembled pieces may stand on the shell's own tiers (world-unit vertical offset)
    mesh.position.set(x == null ? spec.at.x - origin.cx : x, y + (spec.lift || 0), z == null ? spec.at.z - origin.cz : z);
    clayStructureTag(mesh, spec.id, kind || "furniture");
    mesh.userData.structureAssembly = !!spec.assembly;
    mesh.userData.structureProofFamily = spec.proofFamily || null;
    mesh.userData.structureSpecimenPhysical = true;
    group.add(mesh);
    return mesh;
  }
  function groundBox(width, height, depth, x, z, kind){
    return add(
      new THREE.Mesh(
        new THREE.BoxGeometry(width, height + CLAY_STRUCTURE_CONTACT_EMBED, depth),
        mat.clone()
      ),
      rawFloor + height / 2 - CLAY_STRUCTURE_CONTACT_EMBED / 2,
      x, z, kind
    );
  }
  function addConnectorBlock(x, z, width, height, depth, kind){
    const block = groundBox(width, height, depth, x, z, kind || "wall");
    block.userData.structureConnector = true;
    return block;
  }
  function markWalkSurface(mesh, surfaceY, shape){
    if(!mesh) return mesh;
    mesh.userData.structureWalkSurfaceY = surfaceY;
    mesh.userData.structureGridShape = shape || "rect";
    return mesh;
  }
  if(spec.kind === "wall-run"){
    const dims = spec.axis === "z"
      ? [spec.thickness, spec.height, spec.length]
      : [spec.length, spec.height, spec.thickness];
    const wallRun = groundBox(dims[0], dims[1], dims[2], null, null, "wall");
    if(spec.access && spec.access.top === "walk"){
      markWalkSurface(wallRun, rawFloor + (spec.lift || 0) + spec.height, "rect");
    }
    const half = spec.length / 2;
    const cap = Math.max(0.3, spec.thickness + 0.12);
    if(spec.axis === "z"){
      addConnectorBlock(spec.at.x - origin.cx, spec.at.z - origin.cz - half, cap, spec.height, cap, "wall");
      addConnectorBlock(spec.at.x - origin.cx, spec.at.z - origin.cz + half, cap, spec.height, cap, "wall");
    } else {
      addConnectorBlock(spec.at.x - origin.cx - half, spec.at.z - origin.cz, cap, spec.height, cap, "wall");
      addConnectorBlock(spec.at.x - origin.cx + half, spec.at.z - origin.cz, cap, spec.height, cap, "wall");
    }
  } else if(spec.kind === "t-junction"){
    groundBox(spec.length, spec.height, spec.thickness, null, null, "wall");
    // Branch ends flush on the main run's outer face: no overlapping internal end volume.
    const branchZ = spec.at.z - origin.cz + spec.thickness / 2 + spec.branchLength / 2;
    groundBox(spec.thickness, spec.height, spec.branchLength, spec.at.x - origin.cx, branchZ, "wall");
    addConnectorBlock(
      spec.at.x - origin.cx, spec.at.z - origin.cz + spec.thickness / 2,
      spec.thickness + 0.16, spec.height, spec.thickness + 0.16, "wall"
    );
  } else if(spec.kind === "stair"){
    const tread = spec.run / spec.steps;
    const direction = spec.direction === -1 ? -1 : 1;
    const axis = spec.axis === "x" ? "x" : "z";
    for(let i = 0; i < spec.steps; i++){
      const height = spec.rise * (i + 1) / spec.steps;
      const along = direction * (-spec.run / 2 + tread * (i + 0.5));
      const x = spec.at.x - origin.cx + (axis === "x" ? along : 0);
      const z = spec.at.z - origin.cz + (axis === "z" ? along : 0);
      // Treads interpenetrate their neighbours by one contact embed on each edge. This removes the
      // zoom-level light slit that exact coplanar faces can expose after AO/downsample filtering.
      const step = axis === "x"
        ? groundBox(tread + CLAY_STRUCTURE_CONTACT_EMBED * 2, height, spec.width, x, z, "riser")
        : groundBox(spec.width, height, tread + CLAY_STRUCTURE_CONTACT_EMBED * 2, x, z, "riser");
      step.userData.structureStepIndex = i;
      step.userData.structureStepCount = spec.steps;
      step.userData.structureStepAxis = axis;
      step.userData.structureStepDirection = direction;
      step.userData.structureStepSurfaceY = rawFloor + (spec.lift || 0) + height;
      step.userData.structureStepTreadDepth = tread;
      step.userData.structureGridShape = "rect";
    }
  } else if(spec.kind === "stair-inner-corner" || spec.kind === "stair-outer-corner"){
    clayStructureCornerStair(group, spec, rawFloor, origin, add);
  } else if(spec.kind === "platform"){
    const thickness = spec.thickness || 0.18;
    const platform = add(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          spec.width,
          thickness + CLAY_STRUCTURE_CONTACT_EMBED * 2,
          spec.depth || spec.run || 1
        ),
        mat.clone()
      ),
      rawFloor - thickness / 2,
      spec.at.x - origin.cx,
      spec.at.z - origin.cz,
      "floor"
    );
    platform.userData.structureWalkSurfaceY = rawFloor + (spec.lift || 0);
    platform.userData.structureGridShape = "rect";
  } else if(spec.kind === "ramp"){
    const ramp = add(new THREE.Mesh(clayStructureRampGeometry(spec.width, spec.run, spec.rise), mat),
      rawFloor - CLAY_STRUCTURE_CONTACT_EMBED, null, null, "riser");
    ramp.userData.structureRampGrid = {
      width: spec.width,
      run: spec.run,
      rise: spec.rise,
      lowY: rawFloor + (spec.lift || 0),
      highY: rawFloor + (spec.lift || 0) + spec.rise
    };
  } else if(spec.kind === "blocker"){
    const dims = spec.axis === "z"
      ? [spec.thickness, spec.height, spec.length]
      : [spec.length, spec.height, spec.thickness];
    const blocker = groundBox(dims[0], dims[1], dims[2], null, null, "wall");
    if(spec.access && spec.access.top === "walk"){
      markWalkSurface(blocker, rawFloor + (spec.lift || 0) + spec.height, "rect");
    }
    const half = spec.length / 2;
    const cap = Math.max(0.3, spec.thickness + 0.12);
    if(spec.axis === "z"){
      addConnectorBlock(spec.at.x - origin.cx, spec.at.z - origin.cz - half, cap, spec.height, cap, "wall");
      addConnectorBlock(spec.at.x - origin.cx, spec.at.z - origin.cz + half, cap, spec.height, cap, "wall");
    } else {
      addConnectorBlock(spec.at.x - origin.cx - half, spec.at.z - origin.cz, cap, spec.height, cap, "wall");
      addConnectorBlock(spec.at.x - origin.cx + half, spec.at.z - origin.cz, cap, spec.height, cap, "wall");
    }
  } else if(spec.kind === "support-square"){
    addConnectorBlock(null, null, spec.width + 0.14, 0.12, spec.width + 0.14, "foundation");
    const squareSupport = groundBox(spec.width, spec.height, spec.width, null, null, "pillar");
    markWalkSurface(squareSupport, rawFloor + (spec.lift || 0) + spec.height, "rect");
  } else if(spec.kind === "support-round"){
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.radius * 1.25, spec.radius * 1.3, 0.12 + CLAY_STRUCTURE_CONTACT_EMBED, 20),
      mat.clone()
    );
    add(plinth, rawFloor + 0.06 - CLAY_STRUCTURE_CONTACT_EMBED / 2, null, null, "foundation");
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.radius, spec.radius * 1.04, spec.height + CLAY_STRUCTURE_CONTACT_EMBED, 20),
      mat
    );
    add(shaft, rawFloor + spec.height / 2 - CLAY_STRUCTURE_CONTACT_EMBED / 2, null, null, "pillar");
    markWalkSurface(shaft, rawFloor + (spec.lift || 0) + spec.height, "circle");
    shaft.userData.structureGridRadius = spec.radius;
  }
  clayStructureAddSocketOverlay(group, spec, rawFloor, origin);
  clayStructureAddAccessOverlay(group, spec, rawFloor, origin);
}
function clayStructureBuildOpening(group, shell, fixture, tierHeights, origin){
  const aperture = shell.apertures && shell.apertures[0];
  if(!aperture) return null;
  const a = aperture.a, b = aperture.b;
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.max(0.0001, Math.hypot(dx, dz));
  const tx = dx / len, tz = dz / len;
  const width = Math.min(fixture.opening.width, len * 0.82);
  const floorY = tierHeights[aperture.tier] == null ? tierHeights[0] : tierHeights[aperture.tier];
  const midX = (a.x + b.x) / 2, midZ = (a.z + b.z) / 2;
  const hinge = new THREE.Group();
  hinge.name = fixture.opening.id;
  hinge.position.set(midX - tx * width / 2 - origin.cx, floorY, midZ - tz * width / 2 - origin.cz);
  hinge.rotation.y = -Math.atan2(tz, tx);
  hinge.userData.structureSpecId = fixture.opening.id;
  hinge.userData.structureSocket = fixture.opening.socket;
  hinge.userData.structureSwingClearanceDeg = fixture.opening.swingClearanceDeg;
  const geo = new THREE.BoxGeometry(width, fixture.opening.height, 0.075);
  geo.translate(width / 2, fixture.opening.height / 2, 0);
  const leaf = new THREE.Mesh(geo, clayStructureMaterial("#6f6f73"));
  const doorState = S.clayRoomStructureStageLatch
    ? S.clayRoomStructureStageLatch.doorState
    : fixture.opening.state;
  leaf.rotation.y = doorState === "open" ? Math.PI / 2 : (doorState === "ajar" ? Math.PI / 6 : 0);
  clayStructureTag(leaf, fixture.opening.id, "door");
  leaf.userData.isDoorLeaf = true;
  leaf.userData.structureDoorState = doorState;
  hinge.add(leaf);
  const arc = [];
  for(let i = 0; i <= 18; i++){
    const angle = (i / 18) * Math.PI / 2;
    arc.push(new THREE.Vector3(Math.cos(angle) * width, 0.035, -Math.sin(angle) * width));
  }
  const swing = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arc),
    new THREE.LineDashedMaterial({ color: 0x6fcfff, dashSize: 0.08, gapSize: 0.05, transparent: true, opacity: 0.78 })
  );
  swing.computeLineDistances();
  swing.userData.interiorKind = "clay-diagnostic-overlay";
  swing.userData.structureOverlayView = "sockets";
  swing.userData.structureSpecId = fixture.opening.id;
  swing.renderOrder = 70;
  hinge.add(swing);
  group.add(hinge);
  return { aperture, hinge, leaf, swing };
}
function clayRoomApplyStructureViewVisibility(view){
  const group = S.clayRoomStructureBenchGroup;
  const focused = S.clayRoomSelectedId;
  const focusOverlay = view === "sockets" || view === "access";
  if(group){
    group.traverse(function(node){
      const data = node.userData || {};
      const ownView = data.structureOverlayView;
      const specId = data.structureSpecId;
      if(ownView){
        node.visible = ownView === view && (!focusOverlay || !focused || specId === focused);
      } else if(data.structureNegativeControl){
        node.visible = view === "negative";
      } else if(data.structureSpecimenPhysical){
        if(view === "stairs"){
          node.visible = !!data.structureProofFamily
            && (!S.clayRoomStructureProofFamilyFocus
              || data.structureProofFamily === S.clayRoomStructureProofFamilyFocus);
        } else if(view === "assembled" || view === "strategic"){
          node.visible = !!data.structureAssembly;
        } else if(view === "sockets" || view === "access" || view === "climb"){
          node.visible = !!focused && specId === focused;
        } else {
          node.visible = false;
        }
      }
    });
  }
  if(S.clayRoomRecord && S.clayRoomCompiled){
    clayRoomDisposeSeamGrid();
    S.clayGridMesh = clayRoomBuildSeamGrid(S.clayRoomRecord, S.clayRoomCompiled.room);
    clayRoomTagAllProvenance();
  }
  clayRoomApplyCamPose();
  if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
  markDirty();
  scheduleRender();
}
function clayRoomRebuildStructureBench(reason){
  if(S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID) return false;
  const session = clayRoomMovementSession();
  const board = session && clayRoomMovementBoardFromState(session.state);
  if(!board) return false;
  S.boardKey = null;
  clayRoomSetInteriorBoard(board, { roomTransition: false, reason: reason || "clayroom-structure-rebuild" });
  return true;
}
function clayRoomSetStructureView(view){
  if(CLAY_STRUCTURE_BENCH_FIXTURE.views.indexOf(view) < 0) return false;
  if(view === "sockets" || view === "access" || view === "climb"){
    const focused = CLAY_STRUCTURE_BENCH_FIXTURE.pieces.some(function(spec){
      return spec.id === S.clayRoomSelectedId;
    });
    const needsAccessExample = (view === "access" || view === "climb")
      && S.clayRoomSelectedId === "straight-wall";
    if(!focused || needsAccessExample){
      const fallbackId = view === "sockets" ? "straight-wall" : "square-support";
      S.clayRoomSelectedId = fallbackId;
      if(typeof S.clayRoomWorkbenchSelect === "function"){
        S.clayRoomWorkbenchSelect(fallbackId, "structure " + view + " focus");
      }
    }
  }
  const wasStrategic = S.clayRoomStructureView === "strategic";
  if(view === "stairs") S.clayRoomStructureProofFamilyFocus = null;
  S.clayRoomStructureView = view;
  const isStrategic = view === "strategic";
  // Strategic mode changes the compiler input: every upper is built. Crossing that boundary
  // therefore rebuilds the production shell; merely hiding a pre-existing upper would lie about
  // the compile-time omission contract.
  if(S.clayRoomStructureBenchGroup && wasStrategic !== isStrategic){
    return clayRoomRebuildStructureBench("clayroom-structure-camera-mode");
  }
  clayRoomApplyStructureViewVisibility(view);
  return true;
}
function clayRoomSetStructureStaged(staged){
  if(S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID) return false;
  S.clayRoomStructureStageLatch = clayStructureStagingLatchTransition(
    S.clayRoomStructureStageLatch,
    { type: staged ? CLAY_STRUCTURE_BENCH_FIXTURE.wallOmission.stagedEvent
      : CLAY_STRUCTURE_BENCH_FIXTURE.wallOmission.releaseEvent }
  );
  return clayRoomRebuildStructureBench(staged
    ? "clayroom-structure-space-entered"
    : "clayroom-structure-space-left-play");
}
function clayRoomSetStructureDoorState(state){
  if(S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID) return false;
  const session = clayRoomMovementSession();
  if(!session || session.busy) return false;
  const committed = tqConnectionStateCommit(session.fixture.space, session.state, {
    connectionId: session.fixture.connectionId,
    state: state
  });
  if(!committed.ok) return false;
  session.state = committed.state;
  session.lastReceipt = committed.receipt;
  session.preview = null;
  S.clayRoomStructureStageLatch = clayStructureStagingLatchTransition(
    S.clayRoomStructureStageLatch,
    { type: "door-state", state: state }
  );
  return clayRoomRebuildStructureBench("clayroom-structure-door-" + state);
}
function clayRoomStructureClimbSession(){
  return S.clayRoomStructureClimbSession || null;
}
function clayRoomStructureClimbActor(){
  const fixture = S.clayRoomRecord && clayRoomStructureBenchFixtureFrom(S.clayRoomRecord);
  if(!fixture) return null;
  return clayRoomNodeForSelection(fixture.cutawayWitness.id)
    || clayRoomNodeForSelection(fixture.cutawayWitness.pieceSlug);
}
function clayRoomStructureClimbSessionEnsure(){
  if(S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID) return null;
  let session = S.clayRoomStructureClimbSession;
  const actor = clayRoomStructureClimbActor();
  if(!session){
    session = S.clayRoomStructureClimbSession = {
      version: 1,
      target: null,
      last: null,
      busy: false,
      phase: "ready",
      athleticsModifier: CLAY_STRUCTURE_KIT_CATALOG.climbLaw.defaultAthleticsModifier,
      actorBase: actor ? {
        x: actor.position.x,
        y: actor.position.y,
        z: actor.position.z
      } : null
    };
  } else if(actor && !session.actorBase){
    session.actorBase = { x: actor.position.x, y: actor.position.y, z: actor.position.z };
  }
  return session;
}
function clayRoomStructureClimbTargetSpec(id, hitNode){
  const fixture = S.clayRoomRecord && clayRoomStructureBenchFixtureFrom(S.clayRoomRecord);
  const authored = fixture && fixture.pieces.find(function(spec){ return spec.id === id; });
  if(authored) return authored;
  const kind = hitNode && hitNode.userData && hitNode.userData.interiorKind;
  if(/^compiled-/.test(String(id || "")) && kind === "wall"){
    return {
      id: id,
      label: "compiled 10 ft wall",
      kind: "wall-run",
      height: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.storeyWorldUnits,
      climbDC: 15,
      access: { faces: "climb-dc", top: "walk" },
      entry: {
        normal: "Athletics climb, then balance",
        small: "Athletics climb, then balance",
        topCheck: "balance"
      }
    };
  }
  return null;
}
function clayRoomStructureClimbTargetBox(id, hitNode){
  const box = new THREE.Box3();
  let found = false;
  if(/^compiled-/.test(String(id || "")) && hitNode && hitNode.isMesh){
    box.setFromObject(hitNode);
    found = !box.isEmpty();
  } else if(S.clayRoomStructureBenchGroup){
    S.clayRoomStructureBenchGroup.traverse(function(node){
      if(!node.isMesh || !node.userData || !node.userData.structureSpecimenPhysical) return;
      if(node.userData.structureSpecId !== id) return;
      const partBox = new THREE.Box3().setFromObject(node);
      if(partBox.isEmpty()) return;
      if(!found) box.copy(partBox);
      else box.union(partBox);
      found = true;
    });
  }
  return found ? box : null;
}
function clayRoomStructureClimbTargetSet(id, hitNode, hitPoint){
  const session = clayRoomStructureClimbSessionEnsure();
  if(!session || session.busy) return false;
  const spec = clayRoomStructureClimbTargetSpec(id, hitNode);
  if(!spec) return false;
  const access = spec.access || {};
  const climbClass = access.shaft || access.faces || access.inner || access.outer || null;
  if(climbClass !== "climb-dc") return false;
  const box = clayRoomStructureClimbTargetBox(id, hitNode);
  if(!box) return false;
  const center = box.getCenter(new THREE.Vector3());
  const point = hitPoint && hitPoint.isVector3 ? hitPoint : center;
  const actor = clayRoomStructureClimbActor();
  session.target = {
    id: spec.id,
    label: spec.label,
    kind: spec.kind,
    access: spec.access,
    entry: spec.entry || null,
    climbDC: spec.climbDC || CLAY_STRUCTURE_KIT_CATALOG.climbLaw.defaultDc,
    surfaceY: box.max.y,
    perchWorld: {
      x: spec.kind === "support-square" || spec.kind === "support-round" ? center.x : point.x,
      // A standee group's origin is the TOP of its own base; the base extends downward by
      // INTERIOR_BASE_HEIGHT. Seating the group origin directly on box.max.y embedded most of the
      // plinth in a column top. Measure the rounded base's real bounding box (including its bevel)
      // so the base BOTTOM clears the support by the same 0.006 u used everywhere else.
      y: clayRoomStructureStandeeOriginYForSurface(actor, box.max.y),
      z: spec.kind === "support-square" || spec.kind === "support-round" ? center.z : point.z
    }
  };
  session.last = null;
  session.phase = "targeted";
  if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
  return true;
}
function clayRoomStructureStepMesh(id, stepIndex){
  let found = null;
  if(!S.clayRoomStructureBenchGroup) return found;
  S.clayRoomStructureBenchGroup.traverse(function(node){
    if(found || !node.isMesh || !node.userData) return;
    if(node.userData.structureSpecId !== id) return;
    if(Number(node.userData.structureStepIndex) !== Number(stepIndex)) return;
    found = node;
  });
  return found;
}
function clayRoomStructureSupportLock(actor, worldYaw, surfaceY){
  if(!actor || !actor.userData) return;
  actor.userData.claySupportWorldYaw = worldYaw;
  actor.userData.claySupportSurfaceY = surfaceY;
  if(actor.children){
    actor.children.forEach(function(child){
      if(!child || !child.userData || !child.userData.standeeBase) return;
      child.rotation.order = "YXZ";
      child.rotation.y = worldYaw - (actor.rotation ? actor.rotation.y || 0 : 0);
    });
  }
  if(typeof syncStandeeContactBlob === "function") syncStandeeContactBlob(actor);
}
function clayRoomStructureSupportUnlock(actor){
  if(!actor || !actor.userData) return;
  delete actor.userData.claySupportWorldYaw;
  delete actor.userData.claySupportSurfaceY;
  if(actor.children){
    actor.children.forEach(function(child){
      if(child && child.userData && child.userData.standeeBase) child.rotation.y = 0;
    });
  }
  if(typeof syncStandeeContactBlob === "function") syncStandeeContactBlob(actor);
}
function clayRoomStructureBaseClearanceAudit(actor, surfaceY){
  if(!actor) return null;
  actor.updateMatrixWorld(true);
  let base = null;
  if(actor.children){
    base = actor.children.find(function(child){
      return child && child.userData && child.userData.standeeBase;
    }) || null;
  }
  if(!base) return null;
  const baseBox = new THREE.Box3().setFromObject(base);
  const clearance = baseBox.min.y - surfaceY;
  return {
    surfaceY: +surfaceY.toFixed(5),
    baseBottomY: +baseBox.min.y.toFixed(5),
    baseTopY: +baseBox.max.y.toFixed(5),
    clearance: +clearance.toFixed(5),
    baseBottomOnSurface: clearance >= -0.0001 && clearance <= 0.01
  };
}
function clayRoomStructureStandeeOriginYForSurface(actor, surfaceY){
  if(!actor) return interiorStandeeContactY(surfaceY);
  actor.updateMatrixWorld(true);
  let base = null;
  if(actor.children){
    base = actor.children.find(function(child){
      return child && child.userData && child.userData.standeeBase;
    }) || null;
  }
  if(!base) return interiorStandeeContactY(surfaceY);
  const actorWorld = actor.getWorldPosition(new THREE.Vector3());
  const baseBox = new THREE.Box3().setFromObject(base);
  const originAboveBottom = actorWorld.y - baseBox.min.y;
  const productionClearance = interiorStandeeContactY(0) - INTERIOR_BASE_HEIGHT;
  return surfaceY + productionClearance + originAboveBottom;
}
function clayRoomStructureParkingAudit(actor, step, id, stepIndex, surfaceY, worldYaw){
  actor.updateMatrixWorld(true);
  step.updateMatrixWorld(true);
  const treadBox = new THREE.Box3().setFromObject(step);
  const treadCenter = treadBox.getCenter(new THREE.Vector3());
  let base = null;
  if(actor.children){
    base = actor.children.find(function(child){
      return child && child.userData && child.userData.standeeBase;
    }) || null;
  }
  const baseBox = base ? new THREE.Box3().setFromObject(base) : new THREE.Box3();
  const axis = step.userData.structureStepAxis === "x" ? "x" : "z";
  const alongSpan = axis === "x"
    ? treadBox.max.x - treadBox.min.x
    : treadBox.max.z - treadBox.min.z;
  const crossSpan = axis === "x"
    ? treadBox.max.z - treadBox.min.z
    : treadBox.max.x - treadBox.min.x;
  const supportAlong = Number(actor.userData.interiorBaseDepth) || INTERIOR_BASE_TREAD_DEPTH;
  const supportCross = Number(actor.userData.interiorBaseWidth) || supportAlong;
  const alongMargin = (alongSpan - supportAlong) / 2;
  const crossMargin = (crossSpan - supportCross) / 2;
  const clearance = base && !baseBox.isEmpty() ? baseBox.min.y - surfaceY : null;
  return {
    version: 1,
    specId: id,
    stepIndex: Number(stepIndex),
    stepCount: Number(step.userData.structureStepCount),
    axis: axis,
    direction: Number(step.userData.structureStepDirection),
    surfaceY: +surfaceY.toFixed(5),
    targetWorld: {
      x: +treadCenter.x.toFixed(5),
      y: +actor.getWorldPosition(new THREE.Vector3()).y.toFixed(5),
      z: +treadCenter.z.toFixed(5)
    },
    supportWorldYawDeg: +(worldYaw * 180 / Math.PI).toFixed(1),
    tread: {
      along: +alongSpan.toFixed(5),
      cross: +crossSpan.toFixed(5),
      logicalDepth: +Number(step.userData.structureStepTreadDepth).toFixed(5)
    },
    support: {
      along: +supportAlong.toFixed(5),
      cross: +supportCross.toFixed(5),
      alongMargin: +alongMargin.toFixed(5),
      crossMargin: +crossMargin.toFixed(5),
      baseBottomClearance: clearance == null ? null : +clearance.toFixed(5)
    },
    centered: Math.abs(actor.getWorldPosition(new THREE.Vector3()).x - treadCenter.x) < 0.001
      && Math.abs(actor.getWorldPosition(new THREE.Vector3()).z - treadCenter.z) < 0.001,
    baseBottomOnSurface: clearance != null && clearance >= -0.0001 && clearance <= 0.01,
    balanced: alongMargin >= -0.0001 && crossMargin >= -0.0001,
    clipsTreadEdge: alongMargin < -0.0001 || crossMargin < -0.0001
  };
}
function clayRoomStructureParkActorOnStep(id, stepIndex, options){
  const actor = clayRoomStructureClimbActor();
  const step = clayRoomStructureStepMesh(id, stepIndex);
  if(!actor || !step) return { ok: false, reason: actor ? "step-not-found" : "actor-not-found" };
  const stepBox = new THREE.Box3().setFromObject(step);
  const center = stepBox.getCenter(new THREE.Vector3());
  const surfaceY = stepBox.max.y;
  const axis = step.userData.structureStepAxis === "x" ? "x" : "z";
  const worldYaw = axis === "x" ? Math.PI / 2 : 0;
  const worldTarget = new THREE.Vector3(
    center.x,
    clayRoomStructureStandeeOriginYForSurface(actor, surfaceY),
    center.z
  );
  const localTarget = actor.parent ? actor.parent.worldToLocal(worldTarget.clone()) : worldTarget;
  clayRoomStructureSupportLock(actor, worldYaw, surfaceY);
  const finish = function(){
    actor.position.copy(localTarget);
    clayRoomStructureSupportLock(actor, worldYaw, surfaceY);
    S.clayRoomStructureParking = clayRoomStructureParkingAudit(
      actor, step, id, stepIndex, surfaceY, worldYaw
    );
    markDirty();
    scheduleRender();
  };
  if(options && options.animate){
    bindStandeeCtx(buildTheaterCtx());
    const started = playStandeeVerb(actor, "move-step", { targetPos: localTarget, onDone: finish });
    if(started) startTweenLoop();
    else finish();
  } else {
    finish();
  }
  return Object.assign({ ok: true }, S.clayRoomStructureParking || {
    specId: id, stepIndex: Number(stepIndex), pending: true
  });
}
function clayRoomStructureClimbReset(){
  const session = clayRoomStructureClimbSessionEnsure();
  if(!session || session.busy) return false;
  const actor = clayRoomStructureClimbActor();
  if(actor && session.actorBase){
    actor.position.set(session.actorBase.x, session.actorBase.y, session.actorBase.z);
    clayRoomStructureSupportUnlock(actor);
  }
  S.clayRoomStructureParking = null;
  S.clayRoomStructurePerchAudit = null;
  session.last = null;
  session.phase = session.target ? "targeted" : "ready";
  markDirty();
  scheduleRender();
  if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
  return true;
}
function clayRoomStructureClimbAttempt(d20, athleticsModifier){
  const session = clayRoomStructureClimbSessionEnsure();
  if(!session || session.busy || !session.target){
    return { ok: false, reason: session && session.busy ? "climb-animation-active" : "climb-target-required" };
  }
  const result = clayStructureClimbResolve(session.target, {
    d20: Number(d20),
    athleticsModifier: Number(athleticsModifier)
  });
  if(!result.ok){
    session.last = result;
    if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
    return result;
  }
  session.last = result;
  session.athleticsModifier = result.modifier;
  session.phase = result.passed ? "climbing" : "slipping";
  const actor = clayRoomStructureClimbActor();
  if(!actor || !session.actorBase){
    session.phase = result.outcome;
    if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
    return result;
  }
  actor.position.set(session.actorBase.x, session.actorBase.y, session.actorBase.z);
  const perchWorld = new THREE.Vector3(
    session.target.perchWorld.x,
    session.target.perchWorld.y,
    session.target.perchWorld.z
  );
  const perchLocal = actor.parent ? actor.parent.worldToLocal(perchWorld.clone()) : perchWorld;
  const baseLocal = new THREE.Vector3(session.actorBase.x, session.actorBase.y, session.actorBase.z);
  const finish = function(){
    session.busy = false;
    session.phase = result.outcome;
    if(result.passed){
      actor.userData.claySupportSurfaceY = session.target.surfaceY;
      if(typeof syncStandeeContactBlob === "function") syncStandeeContactBlob(actor);
      S.clayRoomStructurePerchAudit = clayRoomStructureBaseClearanceAudit(
        actor, session.target.surfaceY
      );
    } else {
      clayRoomStructureSupportUnlock(actor);
      S.clayRoomStructurePerchAudit = null;
    }
    if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
    markDirty();
    scheduleRender();
  };
  bindStandeeCtx(buildTheaterCtx());
  session.busy = true;
  if(result.passed){
    const started = playStandeeVerb(actor, "move-step", { targetPos: perchLocal, onDone: finish });
    if(started) startTweenLoop();
    else {
      actor.position.copy(perchLocal);
      finish();
    }
  } else {
    const halfway = baseLocal.clone().lerp(perchLocal, 0.55);
    const started = playStandeeVerb(actor, "move-step", {
      targetPos: halfway,
      onDone: function(){
        session.phase = result.fall ? "falling" : "losing-grip";
        if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
        setTimeout(function(){
          bindStandeeCtx(buildTheaterCtx());
          const fell = playStandeeVerb(actor, "move-step", { targetPos: baseLocal, onDone: finish });
          if(fell) startTweenLoop();
          else {
            actor.position.copy(baseLocal);
            finish();
          }
        }, 0);
      }
    });
    if(started) startTweenLoop();
    else {
      actor.position.copy(baseLocal);
      finish();
    }
  }
  if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
  return result;
}
function clayRoomStructureClimbSnapshot(){
  const session = clayRoomStructureClimbSession();
  if(!session) return null;
  return {
    version: session.version,
    target: session.target ? Object.assign({}, session.target, {
      access: Object.assign({}, session.target.access),
      perchWorld: Object.assign({}, session.target.perchWorld)
    }) : null,
    last: session.last ? Object.assign({}, session.last) : null,
    busy: session.busy,
    phase: session.phase,
    athleticsModifier: session.athleticsModifier,
    actorBase: session.actorBase ? Object.assign({}, session.actorBase) : null,
    perchAudit: S.clayRoomStructurePerchAudit
      ? Object.assign({}, S.clayRoomStructurePerchAudit)
      : null
  };
}
function clayRoomStructureFocusSpec(id, zoom){
  if(!S.clayCamFit) return false;
  const box = clayRoomStructureClimbTargetBox(id, null);
  if(!box) return false;
  const center = box.getCenter(new THREE.Vector3());
  const target = S.clayCamFit.target;
  S.clayCamOffset = {
    x: center.x - target.x,
    z: center.z - target.z
  };
  S.clayCamZoom = Math.min(
    CLAY_CAM_ZOOM_MAX,
    Math.max(CLAY_CAM_ZOOM_MIN, Number(zoom) || 0.28)
  );
  clayRoomApplyCamPose();
  return true;
}
function clayRoomStructureFocusProofFamily(family, zoom){
  if(!S.clayCamFit || !S.clayRoomStructureBenchGroup) return false;
  S.clayRoomStructureProofFamilyFocus = family;
  if(S.clayRoomStructureView === "stairs"){
    clayRoomApplyStructureViewVisibility("stairs");
  }
  const box = new THREE.Box3();
  let found = false;
  S.clayRoomStructureBenchGroup.traverse(function(node){
    if(!node.isMesh || !node.userData || !node.userData.structureSpecimenPhysical) return;
    if(node.userData.structureProofFamily !== family) return;
    const partBox = new THREE.Box3().setFromObject(node);
    if(partBox.isEmpty()) return;
    if(!found) box.copy(partBox);
    else box.union(partBox);
    found = true;
  });
  if(!found) return false;
  const center = box.getCenter(new THREE.Vector3());
  const target = S.clayCamFit.target;
  S.clayCamOffset = { x: center.x - target.x, z: center.z - target.z };
  S.clayCamZoom = Math.min(
    CLAY_CAM_ZOOM_MAX,
    Math.max(CLAY_CAM_ZOOM_MIN, Number(zoom) || 0.28)
  );
  clayRoomApplyCamPose();
  return true;
}
function clayStructureBuildShellFoundations(group, shell, tierHeights, datumY, origin){
  const wallThickness = 0.22;
  const foundationThickness = wallThickness + 0.1;
  const cornerWidth = foundationThickness + 0.08;
  const corners = new Set();
  let runCount = 0;
  let cornerCount = 0;
  (shell.wallSegments || []).forEach(function(seg){
    const topY = tierHeights[seg.tier];
    const height = topY - datumY;
    if(!(height > 0.02)) return;
    const dx = seg.b.x - seg.a.x, dz = seg.b.z - seg.a.z;
    const length = Math.max(0.01, Math.hypot(dx, dz));
    const run = new THREE.Mesh(
      new THREE.BoxGeometry(
        length + foundationThickness,
        height + CLAY_STRUCTURE_CONTACT_EMBED * 2,
        foundationThickness
      ),
      clayStructureMaterial()
    );
    run.position.set(
      (seg.a.x + seg.b.x) / 2 - origin.cx,
      datumY + height / 2,
      (seg.a.z + seg.b.z) / 2 - origin.cz
    );
    run.rotation.y = -Math.atan2(dz, dx);
    clayStructureTag(run, "compiled-foundation", "foundation");
    run.userData.structureConnector = true;
    run.userData.structureFoundationTier = seg.tier;
    group.add(run);
    runCount++;
    [seg.a, seg.b].forEach(function(point){
      const key = [point.x, point.z, seg.tier].join(",");
      if(corners.has(key)) return;
      corners.add(key);
      const corner = new THREE.Mesh(
        new THREE.BoxGeometry(
          cornerWidth,
          height + CLAY_STRUCTURE_CONTACT_EMBED * 2,
          cornerWidth
        ),
        clayStructureMaterial()
      );
      corner.position.set(point.x - origin.cx, datumY + height / 2, point.z - origin.cz);
      clayStructureTag(corner, "compiled-foundation", "foundation");
      corner.userData.structureConnector = true;
      corner.userData.structureFoundationCorner = true;
      corner.userData.structureFoundationTier = seg.tier;
      group.add(corner);
      cornerCount++;
    });
  });
  return {
    datumY: datumY,
    runCount: runCount,
    cornerCount: cornerCount,
    contactEmbed: CLAY_STRUCTURE_CONTACT_EMBED
  };
}
function clayStructureBuildShellJunctions(group, shell, tierHeights, origin, omittedKeys){
  const wallThickness = 0.22;
  const junctionWidth = wallThickness + CLAY_STRUCTURE_CONTACT_EMBED * 3;
  const storeyHeight = CLAY_STRUCTURE_KIT_CATALOG.gridLaw.storeyWorldUnits;
  const buckets = new Map();
  const segmentKey = function(seg){
    return [seg.a.x, seg.a.z, seg.b.x, seg.b.z].join(",");
  };
  (shell.wallSegments || []).forEach(function(seg){
    const dx = seg.b.x - seg.a.x, dz = seg.b.z - seg.a.z;
    const orientation = Math.abs(dx) >= Math.abs(dz) ? "x" : "z";
    [seg.a, seg.b].forEach(function(point){
      const key = [point.x, point.z, seg.tier].join(",");
      const bucket = buckets.get(key) || {
        point: point,
        tier: seg.tier,
        orientations: new Set(),
        incident: []
      };
      bucket.orientations.add(orientation);
      bucket.incident.push(seg);
      buckets.set(key, bucket);
    });
  });
  let junctionCount = 0;
  let cutawayReturnCount = 0;
  buckets.forEach(function(bucket){
    if(!(bucket.orientations.has("x") && bucket.orientations.has("z"))) return;
    const hasVisibleIncident = bucket.incident.some(function(seg){
      return !omittedKeys || !omittedKeys.has(segmentKey(seg));
    });
    if(!hasVisibleIncident) return;
    const floorY = tierHeights[bucket.tier];
    if(!Number.isFinite(floorY)) return;
    const junction = new THREE.Mesh(
      new THREE.BoxGeometry(
        junctionWidth,
        storeyHeight + CLAY_STRUCTURE_CONTACT_EMBED * 2,
        junctionWidth
      ),
      clayStructureMaterial()
    );
    junction.position.set(
      bucket.point.x - origin.cx,
      floorY + storeyHeight / 2,
      bucket.point.z - origin.cz
    );
    clayStructureTag(junction, "compiled-junction", "wall");
    junction.userData.structureConnector = true;
    junction.userData.structureWallCorner = true;
    junction.userData.structureJunctionTier = bucket.tier;
    group.add(junction);
    junctionCount++;

    // A camera-side omission may remove one incident wall while leaving its perpendicular neighbour.
    // A bare quoin at that transition still reads like a broken wall end. Carry the omitted run a
    // short distance around the corner as a full-height dollhouse return: the room remains open to
    // the governed camera, but the surviving wall visibly turns a real corner before the cutaway.
    const omittedIncident = bucket.incident.filter(function(seg){
      return omittedKeys && omittedKeys.has(segmentKey(seg));
    });
    const builtIncident = bucket.incident.filter(function(seg){
      return !omittedKeys || !omittedKeys.has(segmentKey(seg));
    });
    if(omittedIncident.length && builtIncident.length){
      omittedIncident.forEach(function(seg){
        const other = (seg.a.x === bucket.point.x && seg.a.z === bucket.point.z) ? seg.b : seg.a;
        const dx = other.x - bucket.point.x, dz = other.z - bucket.point.z;
        const segLength = Math.hypot(dx, dz);
        if(segLength < 0.001) return;
        const returnLength = Math.min(0.42, segLength * 0.42);
        const ux = dx / segLength, uz = dz / segLength;
        const cutawayReturn = new THREE.Mesh(
          new THREE.BoxGeometry(
            returnLength + CLAY_STRUCTURE_CONTACT_EMBED * 2,
            storeyHeight + CLAY_STRUCTURE_CONTACT_EMBED * 2,
            wallThickness + CLAY_STRUCTURE_CONTACT_EMBED * 2
          ),
          clayStructureMaterial()
        );
        cutawayReturn.position.set(
          bucket.point.x + ux * returnLength / 2 - origin.cx,
          floorY + storeyHeight / 2,
          bucket.point.z + uz * returnLength / 2 - origin.cz
        );
        cutawayReturn.rotation.y = -Math.atan2(uz, ux);
        clayStructureTag(cutawayReturn, "compiled-cutaway-return", "wall");
        cutawayReturn.userData.structureConnector = true;
        cutawayReturn.userData.structureCutawayReturn = true;
        cutawayReturn.userData.structureJunctionTier = bucket.tier;
        group.add(cutawayReturn);
        cutawayReturnCount++;
      });
    }
  });
  return {
    count: junctionCount,
    cutawayReturns: cutawayReturnCount,
    width: junctionWidth,
    profile: "interpenetrating full-height corner quoin"
  };
}
function clayRoomMountStructureBench(){
  S.clayRoomStructureBenchGroup = null;
  S.clayRoomStructureReport = null;
  S.clayRoomStructureClimbSession = null;
  if(S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID || !S.interiorGroup || !S.clayRoomRecord){
    return null;
  }
  const fixture = clayRoomStructureBenchFixtureFrom(S.clayRoomRecord);
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  const origin = S.boardOrigin;
  if(!room || !origin) return null;
  const group = new THREE.Group();
  group.name = fixture.id;
  group.userData.clayStructureBench = true;
  group.userData.fixtureId = fixture.id;
  group.userData.fixtureVersion = fixture.version;
  group.userData.structureCatalogId = fixture.catalogId;

  // The 15×15 host supplies the calibrated floor, grid, camera, light, and shadow receiver. Its
  // tall perimeter uppers are not specimens and would turn the construction bench into a second
  // enclosed room, so CL-F01 leaves the mechanics stem and suppresses only that host upper/trim.
  // The fixture's own compiled shell below is the visible full-height wall-volume proof.
  S.interiorGroup.traverse(function(node){
    const kind = node.userData && node.userData.interiorKind;
    if(kind === "room-shell-wall-upper" || kind === "room-shell-wall-trim"){
      node.visible = false;
      node.userData.clayStructureHostSuppressed = true;
    }
  });

  const baseFloor = interiorFloorTopAt(S.interiorFloorTopMap, room.x + 7, room.y + 7);
  const h = CLAY_STRUCTURE_KIT_CATALOG.gridLaw.verticalQuantumWorldUnits;
  const tierHeights = { "-1": baseFloor + 0.025, "0": baseFloor + h + 0.025, "1": baseFloor + h * 2 + 0.025 };
  const cells = fixture.shellCells.map(function(cell){
    return {
      x: room.x + cell.x,
      z: room.y + cell.z,
      tier: cell.tier,
      isDoor: cell.isDoor,
      sourceRef: cell.sourceRef
    };
  });
  group.userData.structureWalkSurfaces = cells.map(function(cell){
    return {
      source: "compiled-shell-cell",
      shape: "rect",
      x: cell.x - origin.cx,
      z: cell.z - origin.cz,
      y: tierHeights[cell.tier],
      width: 1,
      depth: 1,
      tier: cell.tier,
      sourceRef: cell.sourceRef
    };
  });
  const omittedKeys = new Set();
  const staging = S.clayRoomStructureStageLatch || Object.freeze({
    staged: !!fixture.wallOmission.initialState.staged,
    latched: !!fixture.wallOmission.initialState.latched,
    lastEvent: "fixture-default",
    doorState: fixture.opening.state
  });
  const strategicView = S.clayRoomStructureView === "strategic";
  const omissionActive = staging.staged && staging.latched && !strategicView;
  const cameraRaw = S.camera
    ? { x: S.camera.position.x + origin.cx, z: S.camera.position.z + origin.cz }
    : { x: room.x + room.w, z: room.y + room.d };
  function upperVisibleForSegment(seg){
    // Apertures always retain their upper/frame volume; tier risers are separate compiler output
    // and therefore cannot enter this omission predicate at all.
    if(seg.kind === "door") return true;
    if(!omissionActive) return true;
    const normal = segmentNormal(seg);
    const mx = (seg.a.x + seg.b.x) / 2, mz = (seg.a.z + seg.b.z) / 2;
    const outwardX = -normal.x, outwardZ = -normal.z;
    const cameraOutside = (cameraRaw.x - mx) * outwardX + (cameraRaw.z - mz) * outwardZ > 0.15;
    if(cameraOutside) omittedKeys.add([seg.a.x, seg.a.z, seg.b.x, seg.b.z].join(","));
    return !cameraOutside;
  }
  const shell = compileRoomShell(cells, {
    tierHeights,
    roomShellPolygonKernel: "oss",
    wallHeight: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.storeyWorldUnits,
    wallThickness: 0.22,
    wallStemHeight: Math.max(
      0.01,
      CLAY_STRUCTURE_KIT_CATALOG.gridLaw.cutawayStubWorldUnits - DEFAULT_WALL_CAP_HEIGHT
    ),
    wallCapHeight: 0.06,
    wallCapOverhang: 0.035,
    upperVisibleForSegment
  });
  const shellGroup = new THREE.Group();
  shellGroup.name = "compiled-shell";
  shellGroup.userData.structureSpecId = "compiled-shell";
  function addShell(geometry, kind, specId, cast){
    if(!geometry) return null;
    const mesh = new THREE.Mesh(geometry, clayStructureMaterial());
    mesh.position.set(-origin.cx, 0, -origin.cz);
    clayStructureTag(mesh, specId || "compiled-shell", kind);
    mesh.castShadow = cast !== false;
    shellGroup.add(mesh);
    return mesh;
  }
  addShell(shell.floorGeometry, "floor", "compiled-shell", false);
  addShell(shell.wallStemGeometry, "wall", "compiled-shell", true);
  (shell.wallUpperMeshes || []).forEach(function(entry){
    const mesh = addShell(entry.geometry, "wall", "compiled-shell", true);
    if(mesh) mesh.userData.ownerSegIndex = entry.ownerSegIndex;
  });
  addShell(shell.wallTrimGeometry, "trim", "compiled-shell", true);
  addShell(shell.riserGeometry, "riser", "compiled-shell", true);
  group.add(shellGroup);

  // CL-R3 correction: the compiler owns the mitered wall/floor topology; this first bounded
  // connective assembly closes the vertical gap it intentionally does not own. Every perimeter
  // wall above the lowest site datum gets a continuous plinth down to that datum, plus overlapping
  // corner blocks. The overlap is deliberate contact geometry: no coplanar one-pixel light seam.
  const foundationBuilt = clayStructureBuildShellFoundations(
    group, shell, tierHeights, tierHeights[-1], origin
  );
  const junctionBuilt = clayStructureBuildShellJunctions(
    group, shell, tierHeights, origin, omittedKeys
  );
  const openingBuilt = clayStructureBuildOpening(group, shell, fixture, tierHeights, origin);
  fixture.pieces.forEach(function(spec){
    const worldSpec = Object.assign({}, spec, {
      at: { x: room.x + spec.at.x, z: room.y + spec.at.z }
    });
    clayStructureBuildPart(group, worldSpec, baseFloor + 0.025, origin);
  });

  // Negative control: two otherwise-valid wall prisms stay visibly separated. The red X is only
  // shown in NEGATIVE view; the physical gap remains in every view so rejection never masquerades
  // as a successful join.
  const bad = fixture.negativeControl;
  const badMat = clayStructureMaterial();
  const badX = room.x + bad.at.x - origin.cx, badZ = room.y + bad.at.z - origin.cz;
  const badA = clayStructureTag(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.72, 0.22), badMat), bad.id, "wall");
  badA.position.set(badX - 0.55, baseFloor + 0.385, badZ);
  badA.userData.structureNegativeControl = true;
  const badB = clayStructureTag(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.8), badMat.clone()), bad.id, "wall");
  badB.position.set(badX + 0.32, baseFloor + 0.385, badZ + 0.42);
  badB.userData.structureNegativeControl = true;
  group.add(badA, badB);
  const xY = baseFloor + 0.82;
  group.add(
    clayStructureStripBetween(
      new THREE.Vector3(badX - 0.38, xY, badZ - 0.38),
      new THREE.Vector3(badX + 0.38, xY, badZ + 0.38),
      0xff3030, "negative", bad.id, 0.075
    ),
    clayStructureStripBetween(
      new THREE.Vector3(badX - 0.38, xY, badZ + 0.38),
      new THREE.Vector3(badX + 0.38, xY, badZ - 0.38),
      0xff3030, "negative", bad.id, 0.075
    )
  );

  S.interiorGroup.add(group);
  S.clayRoomStructureBenchGroup = group;
  const assessment = clayStructureSocketJoinAssessment(bad.source, bad.candidate);
  const slopeDeg = Math.atan2(
    fixture.pieces.find(function(p){ return p.id === "shallow-ramp"; }).rise,
    fixture.pieces.find(function(p){ return p.id === "shallow-ramp"; }).run
  ) * 180 / Math.PI;
  S.clayRoomStructureReport = {
    fixtureId: fixture.id,
    fixtureVersion: fixture.version,
    catalogId: CLAY_STRUCTURE_KIT_CATALOG.id,
    catalogVersion: CLAY_STRUCTURE_KIT_CATALOG.version,
    gridLaw: CLAY_STRUCTURE_KIT_CATALOG.gridLaw,
    shell: {
      meta: shell.meta,
      polygonKernel: "oss",
      apertures: shell.apertures.length,
      tiers: Object.keys(tierHeights).map(Number).sort(),
      riserSegments: shell.riserSegments.length,
      wallSegments: shell.wallSegments.length,
      mountSlots: shell.mountSlots.length,
      builtUpperSegments: shell.wallUpperMeshes.length,
      omittedUpperSegments: omittedKeys.size,
      totalUpperSegments: shell.wallUpperMeshes.length + omittedKeys.size,
      exposedSlabSides: !!shell.riserGeometry,
      foundations: foundationBuilt
    },
    // Checkpoint 4 reporting parity ("the fixture can report all uppers present while also saying
    // camera-side omission is active"): the omission projection is derived HERE, from the exact
    // predicate/keys THIS build ran — never from the room-truth shell's separate generic report.
    cameraSideOmission: {
      ruleId: fixture.wallOmission.ruleId,
      version: fixture.wallOmission.version,
      active: omissionActive,
      retainedStubFeet: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.cutawayStubFeet,
      retainedStubWorldUnits: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.cutawayStubWorldUnits,
      omitted: shell.wallSegments
        .map(function(seg, i){ return { seg: seg, segIndex: i }; })
        .filter(function(row){ return omittedKeys.has([row.seg.a.x, row.seg.a.z, row.seg.b.x, row.seg.b.z].join(",")); })
        .map(function(row){ return { segIndex: row.segIndex, mid: { x: (row.seg.a.x + row.seg.b.x) / 2, z: (row.seg.a.z + row.seg.b.z) / 2 } }; }),
      built: shell.wallSegments
        .map(function(seg, i){ return { seg: seg, segIndex: i }; })
        .filter(function(row){ return !omittedKeys.has([row.seg.a.x, row.seg.a.z, row.seg.b.x, row.seg.b.z].join(",")); })
        .map(function(row){ return { segIndex: row.segIndex, mid: { x: (row.seg.a.x + row.seg.b.x) / 2, z: (row.seg.a.z + row.seg.b.z) / 2 } }; })
    },
    wallOmission: {
      ruleId: fixture.wallOmission.ruleId,
      version: fixture.wallOmission.version,
      staged: staging.staged,
      latched: staging.latched,
      lastEvent: staging.lastEvent,
      doorState: staging.doorState,
      strategicView: strategicView,
      cameraMode: strategicView ? "top-down-strategic" : "fixed-production",
      active: omissionActive,
      retainedStubFeet: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.cutawayStubFeet,
      retainedStubWorldUnits: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.cutawayStubWorldUnits,
      carveouts: fixture.wallOmission.carveouts,
      apertureUpperBuilt: !!openingBuilt,
      structuralMassBuilt: shell.riserSegments.length > 0,
      rawDoorStateChangesLatch: false
    },
    opening: {
      mounted: !!openingBuilt,
      threshold: fixture.opening.threshold,
      hingeSocket: fixture.opening.socket.type,
      doorState: staging.doorState,
      hingeAngleDeg: openingBuilt ? +(openingBuilt.leaf.rotation.y * 180 / Math.PI).toFixed(1) : null,
      swingClearanceDeg: fixture.opening.swingClearanceDeg,
      leafCastsShadow: !!(openingBuilt && openingBuilt.leaf.castShadow)
    },
    specimens: fixture.pieces.map(function(spec){
      return {
        id: spec.id, kind: spec.kind, assembly: !!spec.assembly,
        sockets: spec.sockets, access: spec.access, climbDC: spec.climbDC || null,
        entry: spec.entry || null,
        provenance: CLAY_STRUCTURE_KIT_CATALOG.provenance
      };
    }),
    stairAdapter: {
      law: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.stairAdapter,
      examples: fixture.pieces
        .filter(function(spec){
          return spec.kind === "stair" && !spec.assembly && !spec.proofFamily && spec.run === 1;
        })
        .map(function(spec){
          return {
            id: spec.id,
            riseFeet: +(spec.rise * CLAY_STRUCTURE_KIT_CATALOG.gridLaw.cellFeet).toFixed(1),
            footprintCells: spec.run,
            steps: spec.steps
          };
        }),
      cornerFamilies: fixture.pieces
        .filter(function(spec){ return spec.kind === "stair-inner-corner" || spec.kind === "stair-outer-corner"; })
        .map(function(spec){ return spec.kind; }),
      cornerTopologies: fixture.pieces
        .filter(function(spec){ return spec.kind === "stair-inner-corner" || spec.kind === "stair-outer-corner"; })
        .map(function(spec){
          return {
            id: spec.id,
            kind: spec.kind,
            topology: spec.kind === "stair-inner-corner"
              ? "inverse-expanding-l-bands-smallest-low"
              : "open-quadrant-l-wrap-smallest-high"
          };
        }),
      fullStoreyProof: {
        lowerId: "assembly-story-lower-stair",
        upperId: "assembly-story-upper-stair",
        deckId: "assembly-second-floor",
        stairUnits: 2,
        footprintCells: 2,
        riseFeet: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.storeyFeet,
        connected: true
      },
      lStoreyProof: {
        lowerId: "l-storey-lower-stair",
        landingId: "l-storey-landing",
        upperId: "l-storey-upper-stair",
        deckId: "l-storey-second-floor",
        footprintCells: 3,
        turnDeg: 90,
        riseFeet: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.storeyFeet,
        connected: true
      }
    },
    connectiveTissue: {
      polygonKernel: "oss",
      foundationRuns: foundationBuilt.runCount,
      foundationCorners: foundationBuilt.cornerCount,
      wallJunctions: junctionBuilt.count,
      cutawayReturns: junctionBuilt.cutawayReturns,
      contactEmbed: foundationBuilt.contactEmbed,
      connectorProfile: "overlapping plinth + full-height corner quoin + endpoint cap"
    },
    slope: {
      degrees: +slopeDeg.toFixed(3),
      maxDegrees: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.maxWalkableSlopeDeg,
      walkable: slopeDeg <= CLAY_STRUCTURE_KIT_CATALOG.gridLaw.maxWalkableSlopeDeg
    },
    negativeControl: {
      id: bad.id,
      accepted: assessment.accepted,
      reason: assessment.reason,
      expectedReason: bad.expectedReason,
      visibleGap: true
    },
    cutawayWitness: {
      id: fixture.cutawayWitness.id,
      pieceSlug: fixture.cutawayWitness.pieceSlug,
      occluderId: fixture.cutawayWitness.occluder.id,
      rendererPath: "data.pieces + data.instances.pillar -> itrPillarCutawayMask -> itrOcclusionClassify"
    },
    climbMechanicsImplemented: CLAY_STRUCTURE_KIT_CATALOG.climbMechanicsImplemented,
    provenance: CLAY_STRUCTURE_KIT_CATALOG.provenance
  };
  clayRoomStructureClimbSessionEnsure();
  clayRoomApplyStructureViewVisibility(S.clayRoomStructureView || fixture.defaultView);
  return group;
}

/* CL-F04 material bench — two unpromoted sprite-first parents through the production renderer in
   matched bays. The fixture owns no procedural material choice: it proves channel interpretation,
   world scale, UV phase, grid contrast, fallback, and architectural continuity for the exact
   candidates named by CLAY_MATERIAL_BENCH_FIXTURE. */
const CLAY_MATERIAL_TEXTURE_CACHE = new Map();
function clayRoomMaterialTexture(url, colorSpace){
  const key = url + "|" + colorSpace;
  if(CLAY_MATERIAL_TEXTURE_CACHE.has(key)) return CLAY_MATERIAL_TEXTURE_CACHE.get(key);
  const pending = new Promise(function(resolve, reject){
    new THREE.TextureLoader().load(url, function(texture){
      texture.colorSpace = colorSpace === "sRGB"
        ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      resolve(texture);
    }, undefined, function(error){
      reject(error || new Error("Texture failed: " + url));
    });
  });
  CLAY_MATERIAL_TEXTURE_CACHE.set(key, pending);
  return pending;
}
function clayRoomMaterialMapUrl(materialSpec, channel){
  const spec = materialSpec.maps[channel];
  return "/" + materialSpec.exportRoot + "/" + materialSpec.exportStem + spec.suffix;
}
function clayRoomMaterialLoadSet(materialSpec){
  const sourceUrl = "/" + materialSpec.sourceSprite;
  const albedoUrl = clayRoomMaterialMapUrl(materialSpec, "albedo");
  const normalUrl = clayRoomMaterialMapUrl(materialSpec, "normal");
  const ormUrl = clayRoomMaterialMapUrl(materialSpec, "orm");
  return Promise.allSettled([
    clayRoomMaterialTexture(albedoUrl, "sRGB"),
    clayRoomMaterialTexture(normalUrl, "linear"),
    clayRoomMaterialTexture(ormUrl, "linear")
  ]).then(function(results){
    const albedoResult = results[0];
    if(albedoResult.status === "fulfilled"){
      return {
        albedo: albedoResult.value,
        normal: results[1].status === "fulfilled" ? results[1].value : null,
        orm: results[2].status === "fulfilled" ? results[2].value : null,
        albedoSource: "compiled-exact",
        errors: results.map(function(result, index){
          return result.status === "rejected"
            ? ["albedo", "normal", "orm"][index] + ": " + String(result.reason) : null;
        }).filter(Boolean)
      };
    }
    // The source sprite is the albedo authority. If a compiled map is absent, the truthful
    // fallback is that exact sprite plus scalar roughness—not clay, magenta, or a different stone.
    return clayRoomMaterialTexture(sourceUrl, "sRGB").then(function(source){
      return {
        albedo: source,
        normal: results[1].status === "fulfilled" ? results[1].value : null,
        orm: results[2].status === "fulfilled" ? results[2].value : null,
        albedoSource: "source-authority-fallback",
        errors: results.map(function(result, index){
          return result.status === "rejected"
            ? ["albedo", "normal", "orm"][index] + ": " + String(result.reason) : null;
        }).filter(Boolean)
      };
    });
  });
}
function clayRoomMaterialUvProject(geometry, worldPosition, phase, worldUnitsPerTile){
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const uv = geometry.attributes.uv;
  for(let i = 0; i < position.count; i++){
    const x = worldPosition.x + position.getX(i);
    const y = worldPosition.y + position.getY(i);
    const z = worldPosition.z + position.getZ(i);
    const nx = normal.getX(i), ny = normal.getY(i);
    let u, v;
    if(Math.abs(ny) > 0.5){
      u = (x - phase.x) / worldUnitsPerTile;
      v = (z - phase.z) / worldUnitsPerTile;
    } else if(Math.abs(nx) > 0.5){
      u = (z - phase.z) / worldUnitsPerTile;
      v = (y - phase.y) / worldUnitsPerTile;
    } else {
      u = (x - phase.x) / worldUnitsPerTile;
      v = (y - phase.y) / worldUnitsPerTile;
    }
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;
  geometry.setAttribute("uv1", uv.clone());
}
function clayRoomMaterialUvBounds(geometry){
  const uv = geometry && geometry.attributes && geometry.attributes.uv;
  if(!uv) return null;
  let minU = Infinity, minV = Infinity, maxU = -Infinity, maxV = -Infinity;
  for(let i = 0; i < uv.count; i++){
    minU = Math.min(minU, uv.getX(i)); maxU = Math.max(maxU, uv.getX(i));
    minV = Math.min(minV, uv.getY(i)); maxV = Math.max(maxV, uv.getY(i));
  }
  return [minU, minV, maxU, maxV].map(function(value){ return +value.toFixed(5); });
}
function clayRoomMaterialForMode(materialSpec, textures, mode){
  if(mode === "clay-control"){
    const clay = clayStructureMaterial(CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor);
    clay.userData.clayMaterialBenchMode = mode;
    clay.userData.clayMaterialPbrReady = !!(
      textures && textures.albedo && textures.normal && textures.orm
    );
    return clay;
  }
  const hasPbr = !!(textures && textures.albedo && textures.normal && textures.orm);
  const usePbr = hasPbr && (mode === "pbr" || mode === "normal-negative");
  const material = new THREE.MeshStandardMaterial({
    map: textures && textures.albedo ? textures.albedo : null,
    color: textures && textures.albedo ? 0xffffff : 0xb8b1a5,
    roughness: usePbr ? 1 : materialSpec.roughnessFallback,
    metalness: usePbr ? 1 : materialSpec.metalnessFallback
  });
  if(usePbr){
    material.normalMap = textures.normal;
    material.normalMapType = THREE.TangentSpaceNormalMap;
    const scale = mode === "normal-negative"
      ? materialSpec.normalNegativeScale : materialSpec.normalScale;
    material.normalScale.set(scale, scale);
    material.aoMap = textures.orm;
    material.aoMapIntensity = materialSpec.aoMapIntensity;
    material.roughnessMap = textures.orm;
    material.metalnessMap = textures.orm;
  }
  material.shadowSide = THREE.FrontSide;
  material.userData.clayMaterialBenchMode = usePbr ? mode : "albedo-fallback";
  material.userData.clayMaterialPbrReady = hasPbr;
  return material;
}
function clayRoomApplyMaterialBenchMode(){
  const group = S.clayRoomMaterialBenchGroup;
  if(!group) return false;
  const fixture = clayRoomMaterialBenchFixtureFrom(S.clayRoomRecord);
  const requested = fixture.modes.indexOf(S.clayRoomMaterialMode) >= 0
    ? S.clayRoomMaterialMode : fixture.defaultMode;
  const textureSets = group.userData.materialTextureSets || {};
  const materialsById = {};
  fixture.materials.forEach(function(materialSpec){
    materialsById[materialSpec.id] = clayRoomMaterialForMode(
      materialSpec,
      textureSets[materialSpec.id] || null,
      requested
    );
  });
  group.traverse(function(node){
    if(!node.isMesh || !node.userData || !node.userData.clayMaterialBenchSurface) return;
    node.material = materialsById[node.userData.materialParentId];
  });
  const actualModes = {};
  const pbrReadyByParent = {};
  fixture.materials.forEach(function(materialSpec){
    const material = materialsById[materialSpec.id];
    actualModes[materialSpec.id] = material.userData.clayMaterialBenchMode;
    pbrReadyByParent[materialSpec.id] = !!material.userData.clayMaterialPbrReady;
  });
  const uniqueActualModes = Array.from(new Set(Object.keys(actualModes).map(function(id){
    return actualModes[id];
  })));
  group.userData.materialRequestedMode = requested;
  group.userData.materialActualModes = actualModes;
  group.userData.materialActualMode = uniqueActualModes.length === 1
    ? uniqueActualModes[0] : "mixed";
  group.userData.materialPbrReadyByParent = pbrReadyByParent;
  group.userData.materialPbrReady = fixture.materials.every(function(materialSpec){
    return pbrReadyByParent[materialSpec.id];
  });
  S.clayRoomMaterialReport = clayRoomMaterialBenchSnapshot();
  if(typeof S.clayRoomRefreshMaterials === "function") S.clayRoomRefreshMaterials();
  markDirty();
  scheduleRender();
  return true;
}
function clayRoomSetMaterialMode(mode){
  const fixture = clayRoomMaterialBenchFixtureFrom(S.clayRoomRecord);
  if(fixture.modes.indexOf(mode) < 0) return false;
  S.clayRoomMaterialMode = mode;
  return clayRoomApplyMaterialBenchMode();
}
function clayRoomMaterialBenchSnapshot(){
  const group = S.clayRoomMaterialBenchGroup;
  const fixture = S.clayRoomRecord
    ? clayRoomMaterialBenchFixtureFrom(S.clayRoomRecord) : CLAY_MATERIAL_BENCH_FIXTURE;
  if(!group) return {
    fixtureId: fixture.id,
    fixtureVersion: fixture.version,
    mounted: false,
    tasteStatus: fixture.tasteStatus
  };
  const surfaces = [];
  group.traverse(function(node){
    if(!node.isMesh || !node.userData || !node.userData.clayMaterialBenchSurface) return;
    const material = Array.isArray(node.material) ? node.material[0] : node.material;
    surfaces.push({
      id: node.userData.materialSpecId,
      bayId: node.userData.materialBayId,
      materialParentId: node.userData.materialParentId,
      role: node.userData.materialSurfaceRole,
      traversableTop: !!node.userData.materialTraversableTop,
      contactEmbed: node.userData.clayContactEmbed || 0,
      uvBounds: clayRoomMaterialUvBounds(node.geometry),
      uv1Present: !!(node.geometry && node.geometry.attributes && node.geometry.attributes.uv1),
      receiveShadow: !!node.receiveShadow,
      castShadow: !!node.castShadow,
      channels: {
        albedo: !!(material && material.map),
        normal: !!(material && material.normalMap),
        ao: !!(material && material.aoMap),
        roughness: !!(material && material.roughnessMap),
        metalness: !!(material && material.metalnessMap)
      }
    });
  });
  const channelBoundCounts = ["albedo", "normal", "ao", "roughness", "metalness"].reduce(
    function(counts, channel){
      counts[channel] = surfaces.filter(function(surface){
        return surface.channels[channel];
      }).length;
      return counts;
    }, {}
  );
  return {
    fixtureId: fixture.id,
    fixtureVersion: fixture.version,
    mounted: true,
    question: fixture.question,
    tasteStatus: fixture.tasteStatus,
    material: null,
    materials: fixture.materials.map(function(materialSpec){
      const textures = group.userData.materialTextureSets
        ? group.userData.materialTextureSets[materialSpec.id] : null;
      return {
        id: materialSpec.id,
        label: materialSpec.label,
        family: materialSpec.family,
        tasteStatus: materialSpec.tasteStatus,
        scaleStatus: materialSpec.scaleStatus,
        workflow: materialSpec.workflow,
        sourceSprite: materialSpec.sourceSprite,
        sourceSha256: materialSpec.sourceSha256,
        graph: materialSpec.graph,
        graphSha256: materialSpec.graphSha256,
        exportReceipt: materialSpec.exportReceipt,
        mapHashes: {
          albedo: materialSpec.maps.albedo.sha256,
          normal: materialSpec.maps.normal.sha256,
          orm: materialSpec.maps.orm.sha256
        },
        actualMode: group.userData.materialActualModes
          ? group.userData.materialActualModes[materialSpec.id] : "loading",
        pbrReady: group.userData.materialPbrReadyByParent
          ? !!group.userData.materialPbrReadyByParent[materialSpec.id] : false,
        albedoSource: textures ? textures.albedoSource : "loading",
        loadErrors: textures ? textures.errors.slice() : []
      };
    }),
    bays: fixture.bays,
    scale: {
      metersPerTile: fixture.metersPerTile,
      metersPerWorldUnit: fixture.metersPerWorldUnit,
      worldUnitsPerTile: +(fixture.metersPerTile / fixture.metersPerWorldUnit).toFixed(6),
      repeatProof: fixture.repeatProof,
      supportFootprint: fixture.supportFootprint,
      phaseAnchor: fixture.phaseAnchor
    },
    requestedMode: group.userData.materialRequestedMode || S.clayRoomMaterialMode,
    actualMode: group.userData.materialActualMode || "loading",
    pbrReady: !!group.userData.materialPbrReady,
    fallback: "exact source albedo + scalar roughness/metalness when normal or ORM is absent",
    surfaceCount: surfaces.length,
    groundedSurfaceCount: surfaces.filter(function(surface){ return surface.contactEmbed > 0; }).length,
    channelBoundCounts: channelBoundCounts,
    roles: Array.from(new Set(surfaces.map(function(row){ return row.role; }))).sort(),
    surfaces: surfaces
  };
}
function clayRoomMountMaterialBench(){
  S.clayRoomMaterialBenchGroup = null;
  S.clayRoomMaterialReport = null;
  if(S.clayRoomFixtureId !== CLAY_ROOM_MATERIAL_BENCH_ID || !S.interiorGroup || !S.clayRoomRecord){
    return null;
  }
  const fixture = clayRoomMaterialBenchFixtureFrom(S.clayRoomRecord);
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  const origin = S.boardOrigin;
  if(!room || !origin) return null;

  // The outer room is a calibrated camera/light/shadow host, not a second stone composition.
  S.interiorGroup.traverse(function(node){
    const kind = node.userData && node.userData.interiorKind;
    if(kind === "room-shell-wall-upper" || kind === "room-shell-wall-trim"){
      node.visible = false;
      node.userData.clayMaterialHostSuppressed = true;
    }
  });
  const rawX = room.x + (room.w - 1) / 2;
  const rawZ = room.y + (room.d - 1) / 2;
  const floorTop = interiorFloorTopAt(S.interiorFloorTopMap, rawX, rawZ);
  const centerX = rawX - origin.cx;
  const centerZ = rawZ - origin.cz - 0.35;
  const worldUnitsPerTile = fixture.metersPerTile / fixture.metersPerWorldUnit;
  const group = new THREE.Group();
  group.name = fixture.id;
  group.userData.clayMaterialBench = true;
  group.userData.clayMaterialBenchSurface = true;
  group.userData.fixtureId = fixture.id;
  group.userData.fixtureVersion = fixture.version;
  group.userData.materialWalkSurfaces = [];
  group.userData.materialGridSurfaces = [];
  group.userData.materialTextureSets = {};
  fixture.bays.forEach(function(bay){
    const materialSpec = fixture.materials.find(function(candidate){
      return candidate.id === bay.materialId;
    });
    if(!materialSpec) throw new Error("CL-F04 bay has no material parent: " + bay.materialId);
    const bayCenterX = centerX + bay.offset.x;
    const bayCenterZ = centerZ + bay.offset.z;
    const phase = new THREE.Vector3(
      bayCenterX + fixture.phaseAnchor.x,
      floorTop + fixture.phaseAnchor.y,
      bayCenterZ + fixture.phaseAnchor.z
    );
    fixture.specimens.forEach(function(spec){
      const authoredPosition = new THREE.Vector3(
        bayCenterX + spec.offset.x,
        floorTop + spec.offset.y,
        bayCenterZ + spec.offset.z
      );
      // Exact face-to-face stair joins can open into a dark anti-contact slit once cast shadows and
      // the AO/downsample path are both active. Preserve every authored top elevation, but sink solid
      // specimens into their support and let adjacent risers overlap slightly along the run.
      const verticalEmbed = spec.role === "floor" ? 0 : CLAY_STRUCTURE_CONTACT_EMBED;
      const runEmbed = spec.role === "riser" ? CLAY_STRUCTURE_CONTACT_EMBED * 2 : 0;
      const position = authoredPosition.clone();
      position.y -= verticalEmbed / 2;
      const geometry = new THREE.BoxGeometry(
        spec.size.x,
        spec.size.y + verticalEmbed,
        spec.size.z + runEmbed
      );
      clayRoomMaterialUvProject(geometry, position, phase, worldUnitsPerTile);
      const mesh = new THREE.Mesh(
        geometry,
        clayRoomMaterialForMode(materialSpec, null, "albedo-fallback")
      );
      mesh.name = bay.id + "-" + spec.id;
      mesh.position.copy(position);
      mesh.castShadow = spec.role !== "floor";
      mesh.receiveShadow = true;
      mesh.userData.clayMaterialBenchSurface = true;
      mesh.userData.materialSpecId = spec.id;
      mesh.userData.materialBayId = bay.id;
      mesh.userData.materialParentId = materialSpec.id;
      mesh.userData.materialSurfaceRole = spec.role;
      mesh.userData.materialTraversableTop = !!spec.traversableTop;
      mesh.userData.clayContactEmbed = verticalEmbed || runEmbed;
      mesh.userData.interiorKind = "material-proof";
      group.add(mesh);
      // Every horizontal top is a flat surface even when it is not ordinary walk terrain. Grid it
      // (wall/header caps included) while keeping traversal permission as a separate explicit fact.
      group.userData.materialGridSurfaces.push({
        id: bay.id + "-" + spec.id,
        bayId: bay.id,
        materialParentId: materialSpec.id,
        traversable: !!spec.traversableTop,
        minX: authoredPosition.x - spec.size.x / 2,
        maxX: authoredPosition.x + spec.size.x / 2,
        minZ: authoredPosition.z - spec.size.z / 2,
        maxZ: authoredPosition.z + spec.size.z / 2,
        y: authoredPosition.y + spec.size.y / 2
      });
      if(spec.traversableTop){
        group.userData.materialWalkSurfaces.push({
          id: bay.id + "-" + spec.id,
          bayId: bay.id,
          materialParentId: materialSpec.id,
          minX: authoredPosition.x - spec.size.x / 2,
          maxX: authoredPosition.x + spec.size.x / 2,
          minZ: authoredPosition.z - spec.size.z / 2,
          maxZ: authoredPosition.z + spec.size.z / 2,
          y: authoredPosition.y + spec.size.y / 2
        });
      }
    });
  });
  S.interiorGroup.add(group);
  S.clayRoomMaterialBenchGroup = group;
  S.clayRoomMaterialMode = fixture.modes.indexOf(S.clayRoomMaterialMode) >= 0
    ? S.clayRoomMaterialMode : fixture.defaultMode;
  S.clayRoomMaterialReport = clayRoomMaterialBenchSnapshot();
  Promise.all(fixture.materials.map(function(materialSpec){
    return clayRoomMaterialLoadSet(materialSpec).then(function(textures){
      return { id: materialSpec.id, textures: textures };
    }).catch(function(error){
      return {
        id: materialSpec.id,
        textures: {
          albedo: null, normal: null, orm: null,
          albedoSource: "unavailable",
          errors: [String(error)]
        }
      };
    });
  })).then(function(results){
    if(S.clayRoomMaterialBenchGroup !== group) return;
    results.forEach(function(result){
      group.userData.materialTextureSets[result.id] = result.textures;
    });
    clayRoomApplyMaterialBenchMode();
  });
  return group;
}

/* CL-F05 trim bench — two complete, matched cutaway rooms. Body parents use CL-F04's exact
   world-space projection; trim faces use the admitted h6-v1 atlas layout and split every run at a
   repeat boundary so U never wraps through a neighbouring semantic band. Profile cores provide
   real silhouette/relief behind those exact sampled faces. */
const CLAY_TRIM_TEXTURE_CACHE = new Map();
const CLAY_TRIM_ROLE_COLORS = Object.freeze({
  "plain-band": "#63b6e6",
  "base-course": "#65c77d",
  "cornice-belt": "#d7b84b",
  "coping-cap": "#d879c8",
  "stair-nosing": "#ef805f",
  "curb-retaining": "#8d7fe1"
});
function clayRoomTrimTexture(url, colorSpace){
  const key = url + "|" + colorSpace;
  if(CLAY_TRIM_TEXTURE_CACHE.has(key)) return CLAY_TRIM_TEXTURE_CACHE.get(key);
  const pending = new Promise(function(resolve, reject){
    new THREE.TextureLoader().load(url, function(texture){
      texture.colorSpace = colorSpace === "sRGB"
        ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
      resolve(texture);
    }, undefined, function(error){
      reject(error || new Error("Trim texture failed: " + url));
    });
  });
  CLAY_TRIM_TEXTURE_CACHE.set(key, pending);
  return pending;
}
function clayRoomTrimLoadSet(culture){
  return Promise.allSettled(["basecolor", "normal", "orm"].map(function(channel){
    const map = culture.maps[channel];
    return clayRoomTrimTexture("/" + culture.atlasRoot + "/" + map.file, map.colorSpace);
  })).then(function(results){
    return {
      basecolor: results[0].status === "fulfilled" ? results[0].value : null,
      normal: results[1].status === "fulfilled" ? results[1].value : null,
      orm: results[2].status === "fulfilled" ? results[2].value : null,
      errors: results.map(function(result, index){
        return result.status === "rejected"
          ? ["basecolor", "normal", "orm"][index] + ": " + String(result.reason) : null;
      }).filter(Boolean)
    };
  });
}
function clayRoomTrimRunGeometry(run, slot, runtimeSize){
  const origin = new THREE.Vector3(run.start[0], run.start[1], run.start[2]);
  const along = new THREE.Vector3(run.tangent[0], run.tangent[1], run.tangent[2]).normalize();
  const across = new THREE.Vector3(run.cross[0], run.cross[1], run.cross[2]);
  const outward = new THREE.Vector3(run.normal[0], run.normal[1], run.normal[2]).normalize();
  const frontWinding = along.clone().cross(across).dot(outward) >= 0;
  const repeat = slot.repeatWorldLength;
  const y = slot.rectPx[1], height = slot.rectPx[3];
  const v0 = 1 - ((y + height - 1) / runtimeSize[1]);
  const v1 = 1 - ((y + 1) / runtimeSize[1]);
  const positions = [], normals = [], uvs = [], indices = [], chunks = [];
  let cursor = 0, vertex = 0;
  while(cursor < run.length - 1e-7){
    const worldPhase = (run.phaseOrigin || 0) + cursor;
    let localPhase = ((worldPhase % repeat) + repeat) % repeat;
    if(repeat - localPhase < 1e-6) localPhase = 0;
    const segmentLength = Math.min(run.length - cursor, repeat - localPhase);
    const p0 = origin.clone().addScaledVector(along, cursor);
    const p1 = origin.clone().addScaledVector(along, cursor + segmentLength);
    const p2 = p1.clone().add(across);
    const p3 = p0.clone().add(across);
    const u0 = localPhase / repeat, u1 = (localPhase + segmentLength) / repeat;
    [p0, p1, p2, p3].forEach(function(point){
      positions.push(point.x, point.y, point.z);
      normals.push(outward.x, outward.y, outward.z);
    });
    uvs.push(u0, v0, u1, v0, u1, v1, u0, v1);
    if(frontWinding){
      indices.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3);
    } else {
      indices.push(vertex, vertex + 2, vertex + 1, vertex, vertex + 3, vertex + 2);
    }
    chunks.push({
      startWorld: +cursor.toFixed(5),
      length: +segmentLength.toFixed(5),
      u0: +u0.toFixed(6),
      u1: +u1.toFixed(6)
    });
    cursor += segmentLength;
    vertex += 4;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("uv1", new THREE.Float32BufferAttribute(uvs.slice(), 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return {
    geometry: geometry,
    report: {
      id: run.id,
      structureId: run.structureId,
      slotId: slot.id,
      semanticRole: slot.semanticRole,
      length: run.length,
      repeatWorldLength: repeat,
      phaseStart: +((((run.phaseOrigin || 0) % repeat) + repeat) % repeat).toFixed(5),
      phaseEnd: +(((((run.phaseOrigin || 0) + run.length) % repeat) + repeat) % repeat).toFixed(5),
      segmentCount: chunks.length,
      nonExactRepeat: Math.abs((run.length / repeat) - Math.round(run.length / repeat)) > 1e-6,
      uvRange: {
        u: [Math.min.apply(null, chunks.map(function(chunk){ return chunk.u0; })),
          Math.max.apply(null, chunks.map(function(chunk){ return chunk.u1; }))],
        v: [+v0.toFixed(6), +v1.toFixed(6)]
      },
      chunks: chunks
    }
  };
}
function clayRoomTrimMaterial(culture, slot, textures, mode, core){
  if(mode === "clay-control"){
    const clay = clayStructureMaterial(CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor);
    clay.userData.clayTrimActualMode = mode;
    clay.userData.clayTrimPbrReady = !!(
      textures && textures.basecolor && textures.normal && textures.orm
    );
    return clay;
  }
  if(mode === "trim-debug"){
    const debug = new THREE.MeshStandardMaterial({
      color: CLAY_TRIM_ROLE_COLORS[slot.semanticRole] || "#d6d6d6",
      roughness: 0.82,
      metalness: 0
    });
    debug.userData.clayTrimActualMode = mode;
    debug.userData.clayTrimPbrReady = !!(
      textures && textures.basecolor && textures.normal && textures.orm
    );
    return debug;
  }
  const pbrReady = !!(textures && textures.basecolor && textures.normal && textures.orm);
  const pbr = mode === "pbr" && pbrReady;
  const material = new THREE.MeshStandardMaterial({
    map: !core && textures ? textures.basecolor : null,
    color: core ? culture.coreColor : (textures && textures.basecolor ? 0xffffff : culture.coreColor),
    roughness: pbr ? 1 : 0.78,
    metalness: 0
  });
  if(pbr && !core){
    material.normalMap = textures.normal;
    material.normalMapType = THREE.TangentSpaceNormalMap;
    material.normalScale.set(0.9, 0.9);
    material.aoMap = textures.orm;
    material.aoMapIntensity = 0.68;
    material.roughnessMap = textures.orm;
    material.metalnessMap = textures.orm;
    material.metalness = 1;
  }
  material.userData.clayTrimActualMode = pbr ? "pbr" : "albedo-only";
  material.userData.clayTrimPbrReady = pbrReady;
  return material;
}
function clayRoomTrimCoreGeometry(run, depth){
  const along = new THREE.Vector3(run.tangent[0], run.tangent[1], run.tangent[2]).normalize();
  const across = new THREE.Vector3(run.cross[0], run.cross[1], run.cross[2]);
  const normal = new THREE.Vector3(run.normal[0], run.normal[1], run.normal[2]).normalize();
  const size = new THREE.Vector3(
    Math.abs(along.x) * run.length + Math.abs(across.x) + Math.abs(normal.x) * depth,
    Math.abs(along.y) * run.length + Math.abs(across.y) + Math.abs(normal.y) * depth,
    Math.abs(along.z) * run.length + Math.abs(across.z) + Math.abs(normal.z) * depth
  );
  const center = new THREE.Vector3(run.start[0], run.start[1], run.start[2])
    .addScaledVector(along, run.length / 2)
    .addScaledVector(across, 0.5)
    .addScaledVector(normal, depth / 2);
  return {
    geometry: new THREE.BoxGeometry(
      Math.max(0.008, size.x),
      Math.max(0.008, size.y),
      Math.max(0.008, size.z)
    ),
    position: center
  };
}
function clayRoomApplyTrimBenchMode(){
  const group = S.clayRoomTrimBenchGroup;
  if(!group) return false;
  const fixture = clayRoomTrimBenchFixtureFrom(S.clayRoomRecord);
  const mode = fixture.modes.indexOf(S.clayRoomTrimMode) >= 0
    ? S.clayRoomTrimMode : fixture.defaultMode;
  const bodyMode = mode === "pbr" ? "pbr"
    : (mode === "albedo-only" ? "albedo-fallback" : "clay-control");
  const bodySets = group.userData.trimBodyTextureSets || {};
  const trimSets = group.userData.trimTextureSets || {};
  group.traverse(function(node){
    if(!node.isMesh || !node.userData) return;
    if(node.userData.clayTrimBodySurface){
      const materialSpec = CLAY_MATERIAL_BENCH_FIXTURE.materials.find(function(row){
        return row.id === node.userData.materialParentId;
      });
      node.material = clayRoomMaterialForMode(
        materialSpec,
        bodySets[materialSpec.id] || null,
        bodyMode
      );
    } else if(node.userData.clayTrimSurface || node.userData.clayTrimCore){
      const culture = fixture.cultures.find(function(row){
        return row.id === node.userData.trimCultureId;
      });
      const slot = fixture.slots.find(function(row){
        return row.id === node.userData.trimSlotId;
      });
      node.material = clayRoomTrimMaterial(
        culture,
        slot,
        trimSets[culture.id] || null,
        mode,
        !!node.userData.clayTrimCore
      );
    }
  });
  group.userData.trimRequestedMode = mode;
  group.userData.trimPbrReady = fixture.cultures.every(function(culture){
    const set = trimSets[culture.id];
    return !!(set && set.basecolor && set.normal && set.orm);
  }) && fixture.structures.every(function(structure){
    return [structure.wallMaterialId, structure.floorMaterialId].every(function(id){
      const set = bodySets[id];
      return !!(set && set.albedo && set.normal && set.orm);
    });
  });
  S.clayRoomTrimReport = clayRoomTrimBenchSnapshot();
  if(typeof S.clayRoomRefreshTrim === "function") S.clayRoomRefreshTrim();
  markDirty();
  scheduleRender();
  return true;
}
function clayRoomSetTrimMode(mode){
  const fixture = clayRoomTrimBenchFixtureFrom(S.clayRoomRecord);
  if(fixture.modes.indexOf(mode) < 0) return false;
  S.clayRoomTrimMode = mode;
  return clayRoomApplyTrimBenchMode();
}
function clayRoomTrimBenchSnapshot(){
  const fixture = S.clayRoomRecord
    ? clayRoomTrimBenchFixtureFrom(S.clayRoomRecord) : CLAY_TRIM_BENCH_FIXTURE;
  const group = S.clayRoomTrimBenchGroup;
  if(!group){
    return {
      fixtureId: fixture.id,
      fixtureVersion: fixture.version,
      mounted: false,
      tasteStatus: fixture.tasteStatus
    };
  }
  const body = [], trim = [];
  group.traverse(function(node){
    if(!node.isMesh || !node.userData) return;
    if(node.userData.clayTrimBodySurface){
      const material = Array.isArray(node.material) ? node.material[0] : node.material;
      body.push({
        id: node.name,
        structureId: node.userData.trimStructureId,
        parentId: node.userData.materialParentId,
        role: node.userData.trimBodyRole,
        gridTop: !!node.userData.trimGridTop,
        channels: {
          albedo: !!(material && material.map),
          normal: !!(material && material.normalMap),
          orm: !!(material && material.roughnessMap && material.aoMap && material.metalnessMap)
        }
      });
    }
    if(node.userData.clayTrimSurface){
      const material = Array.isArray(node.material) ? node.material[0] : node.material;
      trim.push({
        id: node.name,
        structureId: node.userData.trimStructureId,
        cultureId: node.userData.trimCultureId,
        slotId: node.userData.trimSlotId,
        role: node.userData.trimSemanticRole,
        uv1Present: !!(node.geometry && node.geometry.attributes && node.geometry.attributes.uv1),
        mapBound: !!(material && material.map),
        report: node.userData.trimRunReport
      });
    }
  });
  const runReports = trim.map(function(row){ return row.report; });
  return {
    fixtureId: fixture.id,
    fixtureVersion: fixture.version,
    mounted: true,
    question: fixture.question,
    tasteStatus: fixture.tasteStatus,
    requestedMode: group.userData.trimRequestedMode || S.clayRoomTrimMode,
    pbrReady: !!group.userData.trimPbrReady,
    atlasLayoutId: fixture.atlasLayoutId,
    atlasRuntimeSize: fixture.atlasRuntimeSize,
    structures: fixture.structures,
    cultures: fixture.cultures.map(function(culture){
      const textures = group.userData.trimTextureSets[culture.id];
      return {
        id: culture.id,
        label: culture.label,
        metadataSha256: culture.metadataSha256,
        pbrReady: !!(textures && textures.basecolor && textures.normal && textures.orm),
        errors: textures ? textures.errors.slice() : []
      };
    }),
    architecture: fixture.architecture,
    architectureAudit: clayRoomTrimArchitectureAudit(fixture),
    routingContract: fixture.routingContract,
    bodySurfaceCount: body.length,
    trimSurfaceCount: trim.length,
    trimCoreCount: group.userData.trimCoreCount,
    gridSurfaceCount: (group.userData.trimGridSurfaces || []).length,
    walkSurfaceCount: (group.userData.trimWalkSurfaces || []).length,
    semanticRoles: Array.from(new Set(trim.map(function(row){ return row.role; }))).sort(),
    allRolesPerStructure: fixture.structures.every(function(structure){
      return fixture.slots.every(function(slot){
        return trim.some(function(row){
          return row.structureId === structure.id && row.role === slot.semanticRole;
        });
      });
    }),
    segmentedRuns: runReports.filter(function(report){ return report.segmentCount > 1; }).length,
    nonExactRepeatRuns: runReports.filter(function(report){ return report.nonExactRepeat; }).length,
    uvClamped: runReports.every(function(report){
      return report.uvRange.u[0] >= 0 && report.uvRange.u[1] <= 1
        && report.uvRange.v[0] >= 0 && report.uvRange.v[1] <= 1;
    }),
    body: body,
    trim: trim
  };
}
function clayRoomMountTrimBench(){
  S.clayRoomTrimBenchGroup = null;
  S.clayRoomTrimReport = null;
  if(S.clayRoomFixtureId !== CLAY_ROOM_TRIM_BENCH_ID || !S.interiorGroup || !S.clayRoomRecord){
    return null;
  }
  const fixture = clayRoomTrimBenchFixtureFrom(S.clayRoomRecord);
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  const origin = S.boardOrigin;
  if(!room || !origin) return null;
  S.interiorGroup.traverse(function(node){
    const kind = node.userData && node.userData.interiorKind;
    if(kind === "room-shell-wall-upper" || kind === "room-shell-wall-trim"){
      node.visible = false;
      node.userData.clayTrimHostSuppressed = true;
    }
    if(kind === "portal"){
      node.visible = false;
      node.userData.clayTrimHostSuppressed = true;
    }
  });
  const rawX = room.x + (room.w - 1) / 2;
  const rawZ = room.y + (room.d - 1) / 2;
  const hostFloorTop = interiorFloorTopAt(S.interiorFloorTopMap, rawX, rawZ);
  const sceneCenterX = rawX - origin.cx;
  const sceneCenterZ = rawZ - origin.cz - 0.25;
  const dims = fixture.architecture;
  const group = new THREE.Group();
  group.name = fixture.id;
  group.userData.fixtureId = fixture.id;
  group.userData.fixtureVersion = fixture.version;
  group.userData.clayTrimBench = true;
  group.userData.trimBodyTextureSets = {};
  group.userData.trimTextureSets = {};
  group.userData.trimGridSurfaces = [];
  group.userData.trimWalkSurfaces = [];
  group.userData.trimRunReports = [];
  group.userData.trimCoreCount = 0;

  function materialSpec(id){
    return CLAY_MATERIAL_BENCH_FIXTURE.materials.find(function(row){ return row.id === id; });
  }
  function cultureSpec(id){
    return fixture.cultures.find(function(row){ return row.id === id; });
  }
  function slotSpec(id){
    return fixture.slots.find(function(row){ return row.id === id; });
  }
  function addBodyBox(structure, spec, center, size, parentId, role, gridTop, traversable){
    const parent = materialSpec(parentId);
    const embed = role === "floor" ? 0 : dims.contactEmbed;
    const authored = new THREE.Vector3(center[0], center[1], center[2]);
    const position = authored.clone();
    position.y -= embed / 2;
    const geometry = new THREE.BoxGeometry(size[0], size[1] + embed, size[2]);
    const phase = new THREE.Vector3(
      sceneCenterX + structure.offset.x - dims.width / 2,
      hostFloorTop + dims.slabThickness,
      sceneCenterZ + structure.offset.z - dims.depth / 2
    );
    clayRoomMaterialUvProject(
      geometry,
      position,
      phase,
      CLAY_MATERIAL_BENCH_FIXTURE.metersPerTile / CLAY_MATERIAL_BENCH_FIXTURE.metersPerWorldUnit
    );
    const mesh = new THREE.Mesh(
      geometry,
      clayRoomMaterialForMode(parent, null, "albedo-fallback")
    );
    mesh.name = structure.id + "-" + spec;
    mesh.position.copy(position);
    mesh.castShadow = role !== "floor";
    mesh.receiveShadow = true;
    mesh.userData.interiorKind = "trim-proof";
    mesh.userData.clayTrimBodySurface = true;
    mesh.userData.trimStructureId = structure.id;
    mesh.userData.materialParentId = parentId;
    mesh.userData.trimBodyRole = role;
    mesh.userData.trimGridTop = !!gridTop;
    group.add(mesh);
    if(gridTop){
      const surface = {
        id: mesh.name,
        structureId: structure.id,
        traversable: !!traversable,
        minX: authored.x - size[0] / 2,
        maxX: authored.x + size[0] / 2,
        minZ: authored.z - size[2] / 2,
        maxZ: authored.z + size[2] / 2,
        y: authored.y + size[1] / 2
      };
      group.userData.trimGridSurfaces.push(surface);
      if(traversable) group.userData.trimWalkSurfaces.push(surface);
    }
    return mesh;
  }
  function addTrimRun(structure, definition){
    const culture = cultureSpec(structure.cultureId);
    const slot = slotSpec(definition.slotId);
    const normal = new THREE.Vector3(
      definition.normal[0], definition.normal[1], definition.normal[2]
    ).normalize();
    const frontStart = [
      definition.start[0] + normal.x * (dims.trimReliefDepth + 0.002),
      definition.start[1] + normal.y * (dims.trimReliefDepth + 0.002),
      definition.start[2] + normal.z * (dims.trimReliefDepth + 0.002)
    ];
    const surfaceDefinition = Object.assign({}, definition, {
      start: frontStart,
      structureId: structure.id
    });
    const built = clayRoomTrimRunGeometry(
      surfaceDefinition,
      slot,
      fixture.atlasRuntimeSize
    );
    const surface = new THREE.Mesh(
      built.geometry,
      clayRoomTrimMaterial(culture, slot, null, "albedo-only", false)
    );
    surface.name = structure.id + "-" + definition.id;
    surface.castShadow = false;
    surface.receiveShadow = true;
    surface.userData.interiorKind = "trim-proof";
    surface.userData.clayTrimSurface = true;
    surface.userData.trimStructureId = structure.id;
    surface.userData.trimCultureId = culture.id;
    surface.userData.trimSlotId = slot.id;
    surface.userData.trimSemanticRole = slot.semanticRole;
    surface.userData.trimRunReport = built.report;
    group.add(surface);
    const coreBuilt = clayRoomTrimCoreGeometry(definition, dims.trimReliefDepth);
    const core = new THREE.Mesh(
      coreBuilt.geometry,
      clayRoomTrimMaterial(culture, slot, null, "albedo-only", true)
    );
    core.name = surface.name + "-profile-core";
    core.position.copy(coreBuilt.position);
    core.castShadow = true;
    core.receiveShadow = true;
    core.userData.interiorKind = "trim-proof";
    core.userData.clayTrimCore = true;
    core.userData.trimStructureId = structure.id;
    core.userData.trimCultureId = culture.id;
    core.userData.trimSlotId = slot.id;
    core.userData.trimSemanticRole = slot.semanticRole;
    group.add(core);
    group.userData.trimRunReports.push(built.report);
    group.userData.trimCoreCount++;
  }

  fixture.structures.forEach(function(structure){
    const cx = sceneCenterX + structure.offset.x;
    const cz = sceneCenterZ + structure.offset.z;
    const floorY = hostFloorTop;
    const baseY = floorY + dims.slabThickness;
    const w = dims.width, d = dims.depth, t = dims.wallThickness, h = dims.wallHeight;
    // Keep the north doorway in the low west bay. The raised platform occupies the north-east
    // corner; sharing the same threshold footprint would turn the lower half of the doorway into
    // an accidental retaining wall.
    const openingCenterX = cx + dims.openingCenterX;
    const openingLeft = openingCenterX - dims.openingWidth / 2;
    const openingRight = openingCenterX + dims.openingWidth / 2;
    const leftWallMin = cx - w / 2 + t;
    const rightWallMax = cx + w / 2 - t;
    const leftLength = openingLeft - leftWallMin;
    const rightLength = rightWallMax - openingRight;
    const wallCenterY = baseY + h / 2;
    const stubCenterY = baseY + dims.stubHeight / 2;

    addBodyBox(structure, "supported-slab",
      [cx, floorY + dims.slabThickness / 2, cz],
      [w + t, dims.slabThickness, d + t],
      structure.floorMaterialId, "floor", true, true);
    addBodyBox(structure, "west-wall",
      [cx - w / 2 + t / 2, wallCenterY, cz],
      [t, h, d], structure.wallMaterialId, "wall", true, false);
    addBodyBox(structure, "north-wall-left",
      [(leftWallMin + openingLeft) / 2, wallCenterY, cz - d / 2 + t / 2],
      [leftLength, h, t], structure.wallMaterialId, "wall", true, false);
    addBodyBox(structure, "north-wall-right",
      [(openingRight + rightWallMax) / 2, wallCenterY, cz - d / 2 + t / 2],
      [rightLength, h, t], structure.wallMaterialId, "wall", true, false);
    addBodyBox(structure, "north-opening-header",
      [openingCenterX, baseY + dims.openingHeight + (h - dims.openingHeight) / 2, cz - d / 2 + t / 2],
      [dims.openingWidth, h - dims.openingHeight, t],
      structure.wallMaterialId, "opening", true, false);
    addBodyBox(structure, "south-wall-stub",
      [cx, stubCenterY, cz + d / 2 - t / 2],
      [w, dims.stubHeight, t], structure.wallMaterialId, "cutaway-stub", true, false);
    addBodyBox(structure, "east-wall-stub",
      [cx + w / 2 - t / 2, stubCenterY, cz],
      [t, dims.stubHeight, d], structure.wallMaterialId, "cutaway-stub", true, false);

    const platform = dims.platform;
    const stair = dims.stair;
    const platformCx = cx + w / 2 - t - platform.width / 2;
    // The platform seats against the north wall and the two-tread approach remains wholly inside
    // the room. The earlier +0.40 placement pushed the low tread through the south cutaway stub,
    // making an otherwise valid .18 -> .36 -> .54 rise sequence read as a floating add-on.
    const platformCz = cz - d / 2 + t + platform.depth / 2;
    const platformSouth = platformCz + platform.depth / 2;
    addBodyBox(structure, "raised-platform",
      [platformCx, baseY + platform.height / 2, platformCz],
      [platform.width, platform.height, platform.depth],
      structure.floorMaterialId, "platform", true, true);
    addBodyBox(structure, "stair-high",
      [platformCx, baseY + stair.highHeight / 2,
        platformSouth + stair.treadDepth / 2 - dims.contactEmbed],
      [stair.width, stair.highHeight, stair.treadDepth + dims.contactEmbed * 2],
      structure.floorMaterialId, "stair", true, true);
    addBodyBox(structure, "stair-low",
      [platformCx, baseY + stair.lowHeight / 2,
        platformSouth + stair.treadDepth * 1.5 - dims.contactEmbed * 2],
      [stair.width, stair.lowHeight, stair.treadDepth + dims.contactEmbed * 2],
      structure.floorMaterialId, "stair", true, true);

    const westInnerX = cx - w / 2 + t;
    const eastInnerX = cx + w / 2 - t;
    const northInnerZ = cz - d / 2 + t;
    const southInnerZ = cz + d / 2 - t;
    const innerW = w - t * 2, innerD = d - t * 2;
    const baseBandH = 0.22, corniceH = 0.22, frameW = 0.14;
    const phase = structure.id === "institutional-workroom" ? 0.17 : 0.41;
    const runs = [
      { id: "west-base-course", slotId: "base-course",
        start: [westInnerX, baseY, northInnerZ], tangent: [0,0,1], cross: [0,baseBandH,0],
        normal: [1,0,0], length: innerD, phaseOrigin: phase },
      { id: "north-base-left", slotId: "base-course",
        start: [leftWallMin, baseY, northInnerZ], tangent: [1,0,0], cross: [0,baseBandH,0],
        normal: [0,0,1], length: leftLength, phaseOrigin: phase },
      { id: "north-base-right", slotId: "base-course",
        start: [openingRight, baseY, northInnerZ], tangent: [1,0,0], cross: [0,baseBandH,0],
        normal: [0,0,1], length: rightLength, phaseOrigin: phase + leftLength + dims.openingWidth },
      { id: "south-stub-base", slotId: "base-course",
        start: [cx - innerW / 2, baseY, southInnerZ], tangent: [1,0,0], cross: [0,baseBandH,0],
        normal: [0,0,-1], length: innerW, phaseOrigin: phase },
      { id: "east-stub-base", slotId: "base-course",
        start: [eastInnerX, baseY, cz - innerD / 2], tangent: [0,0,1], cross: [0,baseBandH,0],
        normal: [-1,0,0], length: innerD, phaseOrigin: phase },
      { id: "west-cornice", slotId: "cornice-belt",
        start: [westInnerX, baseY + h - corniceH, northInnerZ], tangent: [0,0,1], cross: [0,corniceH,0],
        normal: [1,0,0], length: innerD, phaseOrigin: phase },
      { id: "north-cornice", slotId: "cornice-belt",
        start: [leftWallMin, baseY + h - corniceH, northInnerZ], tangent: [1,0,0], cross: [0,corniceH,0],
        normal: [0,0,1], length: innerW, phaseOrigin: phase },
      { id: "west-coping", slotId: "coping-cap",
        start: [cx - w / 2, baseY + h, cz - d / 2], tangent: [0,0,1], cross: [t,0,0],
        normal: [0,1,0], length: d, phaseOrigin: phase },
      { id: "north-coping", slotId: "coping-cap",
        start: [cx - w / 2, baseY + h, cz - d / 2], tangent: [1,0,0], cross: [0,0,t],
        normal: [0,1,0], length: w, phaseOrigin: phase },
      { id: "south-stub-coping", slotId: "coping-cap",
        start: [cx - w / 2, baseY + dims.stubHeight, cz + d / 2 - t], tangent: [1,0,0], cross: [0,0,t],
        normal: [0,1,0], length: w, phaseOrigin: phase },
      { id: "east-stub-coping", slotId: "coping-cap",
        start: [cx + w / 2 - t, baseY + dims.stubHeight, cz - d / 2], tangent: [0,0,1], cross: [t,0,0],
        normal: [0,1,0], length: d, phaseOrigin: phase },
      { id: "door-left-jamb", slotId: "plain-band",
        start: [openingLeft - frameW, baseY, northInnerZ], tangent: [0,1,0], cross: [frameW,0,0],
        normal: [0,0,1], length: dims.openingHeight, phaseOrigin: phase },
      { id: "door-right-jamb", slotId: "plain-band",
        start: [openingRight, baseY, northInnerZ], tangent: [0,1,0], cross: [frameW,0,0],
        normal: [0,0,1], length: dims.openingHeight, phaseOrigin: phase },
      { id: "door-header-band", slotId: "plain-band",
        start: [openingLeft - frameW, baseY + dims.openingHeight, northInnerZ], tangent: [1,0,0], cross: [0,frameW,0],
        normal: [0,0,1], length: dims.openingWidth + frameW * 2, phaseOrigin: phase },
      { id: "inside-corner-west-return", slotId: "plain-band",
        start: [westInnerX, baseY, northInnerZ], tangent: [0,1,0], cross: [0,0,frameW],
        normal: [1,0,0], length: h, phaseOrigin: phase },
      { id: "inside-corner-north-return", slotId: "plain-band",
        start: [westInnerX, baseY, northInnerZ], tangent: [0,1,0], cross: [frameW,0,0],
        normal: [0,0,1], length: h, phaseOrigin: phase },
      // The retaining curb owns the platform front but yields the actual stair opening. Continuing
      // one solid band across the landing would make the stair terminate at a wall.
      { id: "platform-front-curb-left", slotId: "curb-retaining",
        start: [platformCx - platform.width / 2, baseY, platformSouth],
        tangent: [1,0,0], cross: [0,platform.height,0], normal: [0,0,1],
        length: (platform.width - stair.width) / 2, phaseOrigin: phase },
      { id: "platform-front-curb-right", slotId: "curb-retaining",
        start: [platformCx + stair.width / 2, baseY, platformSouth],
        tangent: [1,0,0], cross: [0,platform.height,0], normal: [0,0,1],
        length: (platform.width - stair.width) / 2,
        phaseOrigin: phase + (platform.width + stair.width) / 2 },
      { id: "platform-side-curb", slotId: "curb-retaining",
        start: [platformCx - platform.width / 2, baseY, platformCz - platform.depth / 2],
        tangent: [0,0,1], cross: [0,platform.height,0],
        normal: [-1,0,0], length: platform.depth, phaseOrigin: phase },
      { id: "high-stair-nosing", slotId: "stair-nosing",
        start: [platformCx - stair.width / 2, baseY + stair.highHeight - 0.09,
          platformSouth + stair.treadDepth - dims.contactEmbed],
        tangent: [1,0,0], cross: [0,0.09,0], normal: [0,0,1],
        length: stair.width, phaseOrigin: phase },
      { id: "low-stair-nosing", slotId: "stair-nosing",
        start: [platformCx - stair.width / 2, baseY + stair.lowHeight - 0.09,
          platformSouth + stair.treadDepth * 2 - dims.contactEmbed * 2],
        tangent: [1,0,0], cross: [0,0.09,0], normal: [0,0,1],
        length: stair.width, phaseOrigin: phase }
    ];
    runs.forEach(function(run){ addTrimRun(structure, run); });
  });
  S.interiorGroup.add(group);
  S.clayRoomTrimBenchGroup = group;
  S.clayRoomTrimMode = fixture.modes.indexOf(S.clayRoomTrimMode) >= 0
    ? S.clayRoomTrimMode : fixture.defaultMode;
  S.clayRoomTrimReport = clayRoomTrimBenchSnapshot();
  const bodyIds = Array.from(new Set(fixture.structures.reduce(function(ids, structure){
    return ids.concat([structure.wallMaterialId, structure.floorMaterialId]);
  }, [])));
  Promise.all([
    Promise.all(bodyIds.map(function(id){
      return clayRoomMaterialLoadSet(materialSpec(id)).then(function(textures){
        return { id: id, textures: textures };
      });
    })),
    Promise.all(fixture.cultures.map(function(culture){
      return clayRoomTrimLoadSet(culture).then(function(textures){
        return { id: culture.id, textures: textures };
      });
    }))
  ]).then(function(results){
    if(S.clayRoomTrimBenchGroup !== group) return;
    results[0].forEach(function(result){
      group.userData.trimBodyTextureSets[result.id] = result.textures;
    });
    results[1].forEach(function(result){
      group.userData.trimTextureSets[result.id] = result.textures;
    });
    clayRoomApplyTrimBenchMode();
  }).catch(function(error){
    group.userData.trimLoadError = String(error);
    clayRoomApplyTrimBenchMode();
  });
  return group;
}

/* CL-F02 lighting bench — deterministic test INPUT mounted inside the same production Theater scene.
   These are neutral comparison forms, not a second renderer: the same camera, diagnostic surface
   route, real sprite builder, PointLights, shadows, tone map, and post chain remain in charge. */
function clayRoomMountLightingBench(){
  S.clayRoomLightingBenchGroup = null;
  if(S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID || !S.interiorGroup || !S.clayRoomRecord){
    return null;
  }
  const fixture = clayRoomLightingBenchFixtureFrom(S.clayRoomRecord);
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  const origin = S.boardOrigin;
  if(!room || !origin) return null;
  const rawX = room.x + (room.w - 1) / 2;
  const rawZ = room.y + (room.d - 1) / 2;
  const floorTop = interiorFloorTopAt(S.interiorFloorTopMap, rawX, rawZ);
  const centerX = rawX - origin.cx;
  const centerZ = rawZ - origin.cz;
  const group = new THREE.Group();
  group.name = fixture.id;
  group.userData.clayLightingBench = true;
  group.userData.fixtureId = fixture.id;
  group.userData.fixtureVersion = fixture.version;
  fixture.primitives.forEach(function(spec){
    let geometry, height, contactSink;
    if(spec.primitive === "sphere"){
      geometry = new THREE.SphereGeometry(spec.radius, 32, 20);
      height = spec.radius * 2;
      contactSink = CLAY_STRUCTURE_CONTACT_EMBED;
    } else {
      geometry = new THREE.BoxGeometry(
        spec.size.x,
        spec.size.y + CLAY_STRUCTURE_CONTACT_EMBED,
        spec.size.z
      );
      height = spec.size.y;
      contactSink = CLAY_STRUCTURE_CONTACT_EMBED / 2;
    }
    const material = new THREE.MeshStandardMaterial({
      color: CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor,
      roughness: 1,
      metalness: 0
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = spec.id;
    mesh.position.set(
      centerX + spec.offset.x,
      floorTop + height / 2 - contactSink,
      centerZ + spec.offset.z
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.interiorKind = spec.role;
    mesh.userData.clayBenchPrimitive = spec.id;
    mesh.userData.clayBenchPrimitiveType = spec.primitive;
    mesh.userData.clayContactEmbed = CLAY_STRUCTURE_CONTACT_EMBED;
    group.add(mesh);
  });
  S.interiorGroup.add(group);
  S.clayRoomLightingBenchGroup = group;
  return group;
}

/* CL-F03 sprite bench — the lineup itself comes through data.pieces -> interiorBuildPieces. This
   post-build group adds only two visual measuring aids: tactical-footprint outlines (gameplay truth,
   explicitly separate from the visible support) and a three-tread stair carrying face/three-quarter/
   edge-on copies built by the same production billboard/base functions. */
function clayRoomMountSpriteBench(){
  S.clayRoomSpriteBenchGroup = null;
  if(S.clayRoomFixtureId !== CLAY_ROOM_SPRITE_BENCH_ID || !S.interiorGroup || !S.clayRoomRecord){
    return null;
  }
  const fixture = clayRoomSpriteCitizenshipFixtureFrom(S.clayRoomRecord);
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  const origin = S.boardOrigin;
  if(!room || !origin) return null;
  const group = new THREE.Group();
  group.name = fixture.id + "-measures";
  group.userData.claySpriteBench = true;
  group.userData.fixtureId = fixture.id;
  group.userData.fixtureVersion = fixture.version;

  fixture.cast.forEach(function(spec){
    const rawX = room.x + spec.lineupCell.x;
    const rawZ = room.y + spec.lineupCell.z;
    const span = spec.tacticalSpanCells;
    const y = interiorFloorTopAt(S.interiorFloorTopMap, rawX, rawZ) + 0.018;
    const half = span / 2;
    const points = [
      new THREE.Vector3(rawX - origin.cx - half, y, rawZ - origin.cz - half),
      new THREE.Vector3(rawX - origin.cx + half, y, rawZ - origin.cz - half),
      new THREE.Vector3(rawX - origin.cx + half, y, rawZ - origin.cz + half),
      new THREE.Vector3(rawX - origin.cx - half, y, rawZ - origin.cz + half)
    ];
    const outline = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: spec.slug === fixture.selectedSlug ? 0x6fcfff : 0xd6b86c,
        transparent: true,
        opacity: 0.78,
        depthTest: true,
        depthWrite: false
      })
    );
    outline.userData.clayTacticalFootprint = true;
    outline.userData.spriteSlug = spec.slug;
    outline.userData.tacticalSpanCells = span;
    group.add(outline);
  });

  const stair = new THREE.Group();
  stair.name = fixture.stair.id;
  stair.userData.claySpriteStair = true;
  const stairCenterRawX = room.x + 7;
  const stairCenterRawZ = room.y + 12.25;
  const stairFloor = interiorFloorTopAt(S.interiorFloorTopMap, stairCenterRawX, stairCenterRawZ);
  const tread = fixture.stair.treadDepth;
  const riser = fixture.stair.riserHeight;
  for(let i = 0; i < fixture.stair.steps; i++){
    const layers = fixture.stair.steps - i;
    const depth = layers * tread;
    const height = (i + 1) * riser;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(fixture.stair.treadWidth + 1.2, height, depth),
      new THREE.MeshStandardMaterial({
        color: CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor,
        roughness: 1,
        metalness: 0
      })
    );
    mesh.position.set(
      stairCenterRawX - origin.cx,
      stairFloor + height / 2,
      stairCenterRawZ - origin.cz - i * tread / 2
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.interiorKind = "riser";
    mesh.userData.claySpriteStairLayer = i;
    mesh.userData.treadDepth = tread;
    stair.add(mesh);
  }

  const selectedEntry = spriteEntryFor(fixture.selectedSlug);
  if(selectedEntry){
    [-1, 0, 1].forEach(function(offset, index){
      const built = interiorSpriteBillboard(selectedEntry, null);
      if(!built) return;
      const sample = built.group;
      const stepTop = stairFloor + (index + 1) * riser;
      const z = stairCenterRawZ - origin.cz + (1 - index) * tread;
      sample.position.set(stairCenterRawX - origin.cx + offset * 1.05, interiorStandeeContactY(stepTop), z);
      sample.userData.sceneObjectId = "stair-" + ["face", "three-quarter", "edge"][index];
      sample.userData.claySpriteStairSample = ["face", "three-quarter", "edge"][index];
      sample.userData.claySpriteViewYawOffset = [0, Math.PI / 4, Math.PI / 2][index];
      sample.userData.kilterYawDeg = 0;
      const support = interiorStandeeSupportMetrics(built.width, selectedEntry.size, 1);
      const baseMesh = buildInteriorBase(
        support.width,
        support.depth,
        S.lastBoard && S.lastBoard.tileKit && S.lastBoard.tileKit.trimColor
      );
      sample.add(baseMesh);
      sample.userData.standeeBaseMesh = baseMesh;
      sample.userData.interiorBaseWidth = support.width;
      sample.userData.interiorBaseDepth = support.depth;
      sample.userData.standeeCollisionExcluded = true;
      sample.userData.stairTreadDepth = tread;
      sample.userData.stairFit = support.depth <= tread + 0.000001;
      sample.userData.interiorHeight = built.height;
      sample.userData.interiorWidth = built.width;
      stair.add(sample);
    });
  }
  group.add(stair);
  S.interiorGroup.add(group);
  S.clayRoomSpriteBenchGroup = group;
  S.standeeCollisionDirty = true;
  return group;
}

/* ─── CL-F07 TERRAIN BENCH (docs/TERRAIN-PROGRAM.md §4.1/§4.3) ─────────────────────────────────
   The sixth bench in this module, following CL-F00…CL-F05 exactly: the ENGINE owns the terrain
   (src/engine/terrain-{field,pieces,bench}.js author every height, face, water datum and support
   edge); this function only PROJECTS what the chassis already decided. It never invents a height,
   never smooths one, and never authors a second renderer — a rule the clay-proof contract states
   and the walk-native diorama contract restates as "dioramas project walk facts".

   Placement decision (2026-07-27, grounds in docs/DESIGN.md): the terrain bench lives here rather
   than in a new theater ES module because all five existing benches do, this module already holds
   every capability terrain needs (THREE, S, interiorFloorTopAt, clayStructure*, the standee mount,
   the governed 72° camera), and a sixth bench in a new module would require rewiring the root's
   ctx injection — protected core the graphics charter tells me not to touch for a first pass. */
const CLAY_ROOM_TERRAIN_BENCH_ID = "cl-f07-terrain-bench";
const CLAY_TERRAIN_FEATURE_SCENE_IDS = Object.freeze(
  typeof CL_F08_TERRAIN_FEATURE_BOOK === "object"
    ? CL_F08_TERRAIN_FEATURE_BOOK.scenes.map(function(scene){ return scene.id; }) : []);
const CLAY_GOLDEN_VIGNETTE_SCENE_IDS = Object.freeze(
  typeof GOLDEN_VIGNETTE_WAVE2_SCENE_IDS !== "undefined"
    ? GOLDEN_VIGNETTE_WAVE2_SCENE_IDS.slice() : []);
const CLAY_ARCHITECTURE_FORM_SCENE_IDS = Object.freeze(
  typeof ARCHITECTURE_FORM_SCENE_IDS !== "undefined"
    ? ARCHITECTURE_FORM_SCENE_IDS.slice() : []);
const CLAY_TERRAIN_SCENE_IDS = Object.freeze([
  "thirteen-piece-sheet", "one-clamp-proof", "boundary-sheet", "route-proof",
  "walk-down-16", "support-graph", "dark"
].concat(CLAY_TERRAIN_FEATURE_SCENE_IDS, CLAY_GOLDEN_VIGNETTE_SCENE_IDS,
  CLAY_ARCHITECTURE_FORM_SCENE_IDS));
/* Diagnostic colours, deliberately NOT art: the clay register stays neutral so Adam is ruling on
   FORM, and every non-clay colour here is an overlay that a capture can turn off. */
const CLAY_TERRAIN_COLORS = Object.freeze({
  ground: 0x9c9a95, trail: 0xb69c76, gully: 0x817b75,
  guarded: 0x7a736c, boulder: 0x8d857c, water: 0x4d7f96,
  thicket: 0x5d6b4b, trunks: 0x6b5b47, fog: 0xb8bcc2,
  standable: 0x6fcfff, unreachable: 0xff3030, entry: 0xffd166,
  approach: 0x8fe08f, retreat: 0xe08f8f, objective: 0xffd166, span: 0xc8a06a
});

function clayRoomTerrainSceneIdFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("terrainscene") : null;
    if(raw && CLAY_TERRAIN_SCENE_IDS.indexOf(raw) >= 0) return raw;
  } catch(e){}
  return CLAY_TERRAIN_SCENE_IDS[0];
}

/* Which frame of a multi-frame scene (the boundary sheet's six) this mount carries. */
function clayRoomTerrainFrameFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("terrainframe") : null;
    if(raw != null && raw !== "" && isFinite(Number(raw))) return Math.max(0, Number(raw) | 0);
  } catch(e){}
  return null;
}

/* The terrain proof uses the production Theater's own four rotationStep bearings. The URL seam is
   deterministic capture input, not a second camera: 0/1/2/3 map to the same quarter turns that the
   combat-stage rotate button drives. Absence means "keep the current production bearing." */
function clayRoomTerrainQuarterTurnFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("terrainturn") : null;
    if(raw != null && raw !== "" && isFinite(Number(raw))){
      return ((Number(raw) | 0) % 4 + 4) % 4;
    }
  } catch(e){}
  return null;
}

function clayRoomSetTerrainFrame(frameIndex){
  S.clayRoomTerrainFrame = frameIndex == null ? null : Math.max(0, frameIndex | 0);
  if(S.clayRoomFixtureId !== CLAY_ROOM_TERRAIN_BENCH_ID) return false;
  if(S.clayRoomTerrainBenchGroup && S.clayRoomTerrainBenchGroup.parent){
    S.clayRoomTerrainBenchGroup.parent.remove(S.clayRoomTerrainBenchGroup);
    clearGroup(S.clayRoomTerrainBenchGroup);
  }
  S.clayRoomTerrainWitnessRetry = false;
  clayRoomMountTerrainBench();
  markDirty(); scheduleRender();
  return true;
}

function clayRoomTerrainSeedFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("terrainseed") : null;
    if(raw != null && raw !== "" && isFinite(Number(raw))) return Number(raw) >>> 0;
  } catch(e){}
  return null;
}

/* Canonical CL-F09 forms remain the reviewed source library. `bounded` asks for a complete-form
   affine sibling; `growth` asks for reviewed rooms/storeys/routes/cutaways. The renderer still
   receives only compiled members plus an exact presentation-hidden set and cannot invent either. */
function clayRoomArchitectureVariantFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("architecturevariant") : null;
    if(raw === "bounded" || raw === "growth") return raw;
  } catch(e){}
  return null;
}

/* A VISUAL PROFILE IS PRESENTATION INPUT, never a terrain seed or architecture variant. Keeping it
   in its own URL seam lets the exact same committed Guard Post be compared as neutral clay,
   institutional frontier work, and upland vernacular construction without rebuilding the plan. */
function clayRoomGuardVisualProfileFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("guardprofile") : null;
    if(raw === "institutional-frontier" || raw === "upland-vernacular"
        || raw === "neutral-clay") return raw;
  } catch(e){}
  return "institutional-frontier";
}

/* Ground calibration is presentation-only. It can swap one reviewed albedo candidate and one
   declared physical repeat scale, but it never enters the vignette request or terrain mechanics. */
function clayRoomGuardGroundCalibrationFromLocation(){
  const result = { candidate: "v018", metersPerRepeat: null };
  try {
    const params = window.location && window.location.search
      ? new URLSearchParams(window.location.search) : null;
    const candidate = params ? params.get("guardgroundcandidate") : null;
    if(candidate === "v010" || candidate === "v011"
        || candidate === "v016" || candidate === "v017" || candidate === "v018"){
      result.candidate = candidate;
    }
    const rawRepeat = params ? params.get("guardgroundrepeat") : null;
    const repeat = rawRepeat == null || rawRepeat === "" ? NaN : Number(rawRepeat);
    if([4.95, 6.6, 8.25, 9.9].indexOf(repeat) >= 0) result.metersPerRepeat = repeat;
  } catch(e){}
  return result;
}

/* Masonry candidates are presentation-only. A candidate can be rendered against the committed
   Guard Post without receiving approval, changing construction, or entering default selection. */
function clayRoomGuardMasonryCandidateFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("guardmasonrycandidate") : null;
    if(raw === "v015") return "v015";
  } catch(e){}
  return "v010";
}

/* Condition candidates share the same presentation-only gate as masonry candidates. */
function clayRoomGuardConditionCandidateFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("guardconditioncandidate") : null;
    if(raw === "v015") return "v015";
  } catch(e){}
  return "v013";
}

/* The 32 px/ft party-vs-guards cast is an opt-in visual-density experiment. It consumes the
   committed Guard Post zones but owns no movement, hostility, initiative, or battle state. */
function clayRoomGuardWorldPixelDensityProofFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("guardpartyproof") : null;
    if(raw === "32ppf" || raw === "party-guards") return "party-guards";
  } catch(e){}
  return null;
}

/* WHICH RUNG OF THE EXPRESSION LADDER this mount carries (docs/TERRAIN-EXPRESSION-BUILD.md §5).
   The rung is a RENDER-TIME device mask over an otherwise identical field: same seed, same camera,
   same layout throughout, which is precisely what makes the six captures a bin-isolation ladder and
   not six different boards. An unknown rung throws inside terrainExpressionFlags rather than
   falling back to naked — a capture labelled `prop` that quietly rendered naked is the same class
   of lie the light-recipe round already cost us. */
function clayRoomTerrainRungFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("terrainrung") : null;
    if(raw) return String(raw);
  } catch(e){}
  return null;
}

/* The original seven CL-F07 scenes are an expression-ladder instrument, so their unqualified
   control remains `naked`. Authored feature maps are pictures of the intended battlefield, not
   bin-isolation controls: they enter through the complete responsive surface unless a URL or the
   workbench explicitly asks for another rung. This prevents a feature URL from silently replacing
   natural grades with the legacy one-box-per-cell renderer. */
function clayRoomTerrainDefaultRung(sceneId){
  return (CLAY_TERRAIN_FEATURE_SCENE_IDS.indexOf(sceneId) >= 0
    || CLAY_GOLDEN_VIGNETTE_SCENE_IDS.indexOf(sceneId) >= 0
    || CLAY_ARCHITECTURE_FORM_SCENE_IDS.indexOf(sceneId) >= 0) ? "all" : "naked";
}

/* WHICH PROOF PROBE this mount carries. `standee-contract` adds the §3 B3 matrix — three envelopes
   on each of the four surface classes a standee must survive — ON TOP of the scene's own witnesses,
   at FREE yaw. It is a URL flag rather than an eighth scene precisely so the seven CL-F07a captures
   and every gate that counts them stay exactly as they were. */
function clayRoomTerrainProbeFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("terrainprobe") : null;
    if(raw) return String(raw);
  } catch(e){}
  return null;
}

/* R4 — WHICH RUNG OF THE GRADE LADDER this mount renders. Same discipline as the device rung: an
   unknown grade throws inside terrainGradeById rather than falling back to the default, because a
   frame labelled `g4` that quietly drew `g2` is the same lie as a rung that quietly drew naked. */
function clayRoomTerrainGradeFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("terraingrade") : null;
    if(raw) return String(raw);
  } catch(e){}
  return null;
}

function clayRoomTerrainFlags(){
  const sceneId = S.clayRoomTerrainSceneId || clayRoomTerrainSceneIdFromLocation();
  const rung = S.clayRoomTerrainRung || clayRoomTerrainRungFromLocation()
    || clayRoomTerrainDefaultRung(sceneId);
  const grade = S.clayRoomTerrainGrade || clayRoomTerrainGradeFromLocation() || null;
  if(typeof terrainExpressionFlags !== "function"){
    return { rungId: "naked", rungIndex: 0, rungLabel: "A0 · NAKED (expression chassis absent)",
      on: [], off: [], anyDevice: false };
  }
  return terrainExpressionFlags(rung, grade ? { gradeId: grade } : null);
}

function clayRoomTerrainOverhangFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("terrainoverhang") : null;
    if(raw){
      const v = String(raw);
      if(["rule", "universal", "none"].indexOf(v) < 0){
        throw new Error("clayRoomTerrainOverhangFromLocation: unknown mode " + v);
      }
      return v;
    }
  } catch(e){ if(/unknown mode/.test(String(e && e.message))) throw e; }
  return null;
}

/* R2 — the skirt depth, overridable so the packet can show the ruling beside its absence. `0` is
   the pre-ruling render (no skirt at all) and is what the skirt-invisibility gate proves itself
   against: with no skirt the margin is exactly minus the daylight, so the check fails for the
   reason it exists. */
function clayRoomTerrainSkirtDepth(plane){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("terrainskirt") : null;
    if(raw != null && raw !== "" && isFinite(Number(raw))) return Math.max(0, Number(raw));
  } catch(e){}
  if(S.clayRoomTerrainSkirtDepth != null) return S.clayRoomTerrainSkirtDepth;
  if(plane && Number.isFinite(plane.skirtDepthWU)) return Math.max(0, plane.skirtDepthWU);
  return (typeof TERRAIN_BASE_SKIRT === "object") ? TERRAIN_BASE_SKIRT.depthWU : 0;
}

function clayRoomSetTerrainGrade(gradeId){
  S.clayRoomTerrainGrade = gradeId == null ? null : String(gradeId);
  if(S.clayRoomFixtureId !== CLAY_ROOM_TERRAIN_BENCH_ID) return false;
  if(S.clayRoomTerrainBenchGroup && S.clayRoomTerrainBenchGroup.parent){
    S.clayRoomTerrainBenchGroup.parent.remove(S.clayRoomTerrainBenchGroup);
    clearGroup(S.clayRoomTerrainBenchGroup);
  }
  S.clayRoomTerrainWitnessRetry = false;
  clayRoomMountTerrainBench();
  markDirty(); scheduleRender();
  return true;
}

function clayRoomSetTerrainRung(rungId){
  S.clayRoomTerrainRung = rungId == null ? null : String(rungId);
  if(S.clayRoomFixtureId !== CLAY_ROOM_TERRAIN_BENCH_ID) return false;
  if(S.clayRoomTerrainBenchGroup && S.clayRoomTerrainBenchGroup.parent){
    S.clayRoomTerrainBenchGroup.parent.remove(S.clayRoomTerrainBenchGroup);
    clearGroup(S.clayRoomTerrainBenchGroup);
  }
  S.clayRoomTerrainWitnessRetry = false;
  clayRoomMountTerrainBench();
  markDirty(); scheduleRender();
  return true;
}

/* ─── THE EXPRESSION DEVICES, projected (docs/TERRAIN-EXPRESSION-BUILD.md §2-§4) ──────────────
   Every one of these reads src/engine/terrain-expression.js and draws what it says. None of them
   writes a height, a standable flag, a walk edge or a cover value — that is what the six-rung
   walk-fingerprint gate re-proves rather than what this comment claims. */
const CLAY_TERRAIN_CAP_H = 0.10;        /* wu — the cap slab whose 1x1 top plane is never cut */
const CLAY_TERRAIN_CHAMFER = 0.125;     /* wu — 1/8 cell, and it lives BELOW the top plane (A3) */
const CLAY_TERRAIN_ROLLOVER = 0.16;     /* wu — how far the top material hangs down a face (A2) */
const CLAY_TERRAIN_NOSING = 0.06;       /* wu — the tread's overhang past its riser (B2) */

function clayTerrainScaleHex(hex, factor){
  const r = Math.max(0, Math.min(255, Math.round(((hex >> 16) & 255) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(((hex >> 8) & 255) * factor)));
  const b = Math.max(0, Math.min(255, Math.round((hex & 255) * factor)));
  return (r << 16) | (g << 8) | b;
}

/* Which of a cell's four sides is EXPOSED — the neighbour is lower, void, or off the field. An
   exposed side is where every device in this family is allowed to spend; an interior side is a
   seam between two equal grounds and must stay welded shut or the field reads as loose tiles. */
function clayTerrainExposedSides(field, c){
  const ex = field.extent.x, ey = field.extent.y;
  function drop(dx, dy){
    const nx = c.x + dx, ny = c.y + dy;
    if(nx < 0 || ny < 0 || nx >= ex || ny >= ey) return 99;
    const n = field.cells[ny * ex + nx];
    if(!n || n.kind === "void") return 99;
    return c.h - n.h;
  }
  return { w: drop(-1, 0), e: drop(1, 0), n: drop(0, -1), s: drop(0, 1) };
}

/* The cell's rendered top, as four shared FFT-style corner heights in WORLD Y. These are corner
   nodes of one responsive field, not four independent samples from a cell-local plane. */
function clayTerrainCapCorners(field, index, flags, baseY){
  const q = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
  const uv = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
  return uv.map(function(p){
    return baseY + terrainCellTopH(field, index, p[0], p[1], flags) * q;
  });
}

/* A2 — MATERIAL ROLL-OVER AT THE ARRIS. The top's own material wraps the top edge and hangs down
   the face with a noisy, per-cell-varied lower boundary, so the hard two-tone cube line never
   exists. Three segments per exposed side, each with its own seeded depth: "the two tones
   interpenetrate", which is the whole device. */
function clayTerrainRolloverMesh(field, c, sides, topY, colour){
  const segs = 3;
  const pos = [];
  const rnd = terrainRng(terrainHash32(field.seed + ":roll:" + c.x + "," + c.y));
  const edges = [
    { key: "w", ax: -0.5, az0: -0.5, az1: 0.5, axis: "z" },
    { key: "e", ax: 0.5, az0: -0.5, az1: 0.5, axis: "z" },
    { key: "n", ax: -0.5, az0: 0.5, az1: -0.5, axis: "x" },
    { key: "s", ax: -0.5, az0: 0.5, az1: -0.5, axis: "x" }
  ];
  function quad(x0, z0, x1, z1, d0, d1){
    const yTop = topY;
    pos.push(x0, yTop, z0, x1, yTop, z1, x1, yTop - d1, z1);
    pos.push(x0, yTop, z0, x1, yTop - d1, z1, x0, yTop - d0, z0);
  }
  ["w", "e", "n", "s"].forEach(function(key){
    if(!(sides[key] > 0)) return;
    for(let i = 0; i < segs; i++){
      const t0 = -0.5 + i / segs, t1 = -0.5 + (i + 1) / segs;
      const d0 = CLAY_TERRAIN_ROLLOVER * (0.45 + rnd() * 0.75);
      const d1 = CLAY_TERRAIN_ROLLOVER * (0.45 + rnd() * 0.75);
      if(key === "w") quad(-0.5, t0, -0.5, t1, d0, d1);
      else if(key === "e") quad(0.5, t1, 0.5, t0, d0, d1);
      else if(key === "n") quad(t1, -0.5, t0, -0.5, d0, d1);
      else quad(t0, 0.5, t1, 0.5, d0, d1);
    }
  });
  if(!pos.length) return null;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, clayStructureMaterial(colour));
  mesh.material.side = THREE.DoubleSide;
  mesh.userData.terrainExpression = "A2-rollover";
  return mesh;
}

/* A4 — THE TWO-FREQUENCY JOINT. The coarse ring is the ONLY line allowed to reach the tactical
   boundary. Fine joints are a clipped, staggered running bond: bed joints stop before the ring and
   head joints terminate at each bed. The first implementation drew a complete 4x4 square lattice
   on every cell; it did not make the grid diegetic, it minted a second grid at quarter scale. */
function clayTerrainJointMesh(field, index, flags, baseY, cx, cz, coarseColour, fineColour){
  const q = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
  const lift = 0.006;
  function y(u, v){ return baseY + terrainCellTopH(field, index, u, v, flags) * q + lift; }
  const coarseSoft = [], coarseRelief = [];
  const c = field.cells[index];
  function neighbour(dx, dy){
    const x = c.x + dx, yy = c.y + dy;
    if(x < 0 || yy < 0 || x >= field.extent.x || yy >= field.extent.y) return null;
    const n = field.cells[yy * field.extent.x + x];
    return n && n.kind !== "void" && n.inPlayfield ? n : null;
  }
  function coarseEdge(points, n){
    const joins = n && typeof terrainCellsJoinAsSurface === "function"
      ? terrainCellsJoinAsSurface(field, index, n.index, flags)
      : !!(n && n.h === c.h);
    const out = joins ? coarseSoft : coarseRelief;
    out.push(cx + points[0], y(points[0], points[1]), cz + points[1],
      cx + points[2], y(points[2], points[3]), cz + points[3]);
  }
  /* Canonical ownership: every cell owns north + west; east + south draw only at the field edge.
     The old full ring was emitted by BOTH cells at an interior seam. Multiply blending therefore
     made a nominal 55% line roughly 30% after the overlap — a black tile outline. */
  coarseEdge([-0.5, -0.5, 0.5, -0.5], neighbour(0, -1));
  coarseEdge([-0.5, 0.5, -0.5, -0.5], neighbour(-1, 0));
  if(!neighbour(1, 0)) coarseEdge([0.5, -0.5, 0.5, 0.5], null);
  if(!neighbour(0, 1)) coarseEdge([0.5, 0.5, -0.5, 0.5], null);
  const fine = [];
  const fineSegments = (typeof terrainFineJointSegments === "function")
    ? terrainFineJointSegments(field, index) : [];
  fineSegments.forEach(function(s){
    fine.push(cx + s[0], y(s[0], s[1]), cz + s[1],
      cx + s[2], y(s[2], s[3]), cz + s[3]);
  });
  const group = new THREE.Group();
  /* A JOINT IS ALWAYS DARKER THAN ITS SURROUND, in every light case. A line cannot be lit in three.js
     — LineBasicMaterial ignores every light in the scene — so an ordinary line drawn over the DARK
     scene blazes as a bright cross-hatch and reads as HUD wireframe, which is the exact opposite of
     this device's purpose. Caught by looking at the banked dark frame, not by any number.
     MULTIPLY is the fix and it is the same trick the contact pool already uses: white is the
     identity, so a grey line darkens whatever is under it by a fixed ratio whether the ground is
     noon-lit or nearly black, and it can never add light. */
  function seg(points, grey, role){
    if(!points.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    const line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      color: grey, blending: THREE.MultiplyBlending, transparent: false,
      depthWrite: false, toneMapped: false }));
    line.userData.terrainExpression = "A4-joint";
    line.userData.contactBlendMode = "multiply";
    line.userData.terrainJointRole = role;
    group.add(line);
  }
  const jointLaw = (typeof TERRAIN_FINE_JOINT_LAW === "object")
    ? TERRAIN_FINE_JOINT_LAW : {
      fineValueMultiplier: 0.95, continuousTacticalValueMultiplier: 0.82,
      reliefBoundaryValueMultiplier: 0.58
    };
  function greyAt(multiplier){
    const byte = Math.max(0, Math.min(255, Math.round(multiplier * 255)));
    return byte * 0x010101;
  }
  /* The grid stays readable, but it is no longer the darkest shape in the field. A continuous
     terrace/ramp receives a restrained construction seam; an actual riser/cliff/perimeter earns
     the stronger line. This is the XCOM part of the grammar: topology dominates the cell lattice. */
  seg(fine, greyAt(jointLaw.fineValueMultiplier), "fine-material");
  seg(coarseSoft, greyAt(jointLaw.continuousTacticalValueMultiplier), "continuous-tactical");
  seg(coarseRelief, greyAt(jointLaw.reliefBoundaryValueMultiplier), "relief-boundary");
  group.userData.terrainExpression = "A4-joint";
  group.userData.terrainJointPattern = (typeof TERRAIN_FINE_JOINT_LAW === "object")
    ? TERRAIN_FINE_JOINT_LAW.pattern : "staggered-running-bond";
  group.userData.terrainFineJointSegments = fineSegments.length;
  group.userData.terrainFineJointReachesBoundary = fineSegments.some(function(s){
    return Math.abs(s[0]) >= 0.5 || Math.abs(s[1]) >= 0.5
      || Math.abs(s[2]) >= 0.5 || Math.abs(s[3]) >= 0.5;
  });
  return group;
}

/* R6 — THE CLIMBABLE ROCK BITS. A stack of small proud nubs up ONE exposed side of a cell that owns
   an eased face, staggered left/right so the eye reads a route rather than a ladder decal. Drawn
   only where terrainFaceClimb marked the face eased; the count is that same predicate's own
   reliefBits, so the picture and the DC can never disagree. */
function clayTerrainClimbBits(field, c, sides, topY, faceBottomY, colour, eased, insets){
  const group = new THREE.Group();
  const height = topY - faceBottomY;
  if(height < 0.2) return null;
  const ins = insets || { w: 0, e: 0, n: 0, s: 0 };
  /* the deepest exposed side owns the face — one route per cell, not four */
  let key = null, best = 0;
  ["w", "e", "n", "s"].forEach(function(k){ if(sides[k] > best){ best = sides[k]; key = k; } });
  if(!key) return null;
  const facePlane = 0.5 - (ins[key] || 0);
  const rnd = terrainRng(terrainHash32(field.seed + ":climbbits:" + c.x + "," + c.y));
  const n = Math.max(2, eased.reliefBits || 2);
  for(let i = 0; i < n; i++){
    const t = (i + 0.5) / n;
    const by = faceBottomY + height * t;
    const along = (i % 2 ? 1 : -1) * (0.10 + rnd() * 0.12);
    /* SIZE AND VALUE ARE THE AFFORDANCE, and both were set by LOOKING. The first cut used
       0.10-0.16 wu bits at 0.72-0.88 of the cell tone: at the production camera that is a 6-10 inch
       lump the same value as the face it sits on, and in the banked crop it was almost impossible
       to find — an affordance the player cannot read is the tooltip R6 explicitly forbids. These are
       0.16-0.26 wu (10-16 inches, a real hand- or foothold at 5 ft per cell) and LIGHTER than the
       face rather than darker, because a proud rock on a shaded vertical catches the key. */
    const size = 0.16 + rnd() * 0.10;
    const proud = size * 0.60;
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0),
      clayStructureMaterial(clayTerrainScaleHex(colour, 1.10 + rnd() * 0.18)));
    const outward = facePlane + proud * 0.5;
    mesh.position.set(
      key === "w" ? -outward : (key === "e" ? outward : along),
      by,
      key === "n" ? -outward : (key === "s" ? outward : along));
    mesh.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.terrainExpression = "R6-climb-bit";
    mesh.userData.terrainClimbBit = { cell: c.index, faceId: eased.faceId, dc: eased.dc,
      auto: !!eased.auto, side: key };
    group.add(mesh);
  }
  return group.children.length ? group : null;
}

/* One field -> one group of cell columns. Ground is SOLID, so every standable cell is a column
   from the field's own floor datum up to its top surface — not a floating tile. A void cell emits
   nothing, which is what makes a chasm a hole rather than a dark texture. */
function clayTerrainBuildFieldGroup(field, originCell, baseY, origin, opts){
  const h = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
  const visualContext = opts && opts.visualContext;
  const group = new THREE.Group();
  group.name = "terrain-field-" + field.id;
  group.userData.terrainFieldId = field.id;
  group.userData.terrainFingerprint = field.fingerprint;
  const cellMeshes = [];
  /* Authored proof routes stay visible through the neutral-clay sweep. Colour distinguishes the
     two tactical propositions on a map; it does not decorate the ground or create geometry. */
  const markedSurfaceColours = {
    "switchback-trail": CLAY_TERRAIN_COLORS.trail,
    "gully-route": CLAY_TERRAIN_COLORS.gully,
    "ridge-saddle-track": 0xb49a72,
    "ridge-flank-track": 0x827b70,
    "ravine-high-crossing": 0xc0a36f,
    "ravine-floor-route": 0x6f7f7d,
    "bluff-ascent": 0xb99a6a,
    "bluff-scramble": 0x89776b,
    "earthwork-entry": 0xad9064,
    "earthwork-sally": 0x786b61,
    "guard-through-road": 0xb59a72,
    "guard-terrain-flank": 0x7d8069,
    "guard-retained-shelf": 0x999189
  };
  function markedSurfaceColour(surface){
    return Object.prototype.hasOwnProperty.call(markedSurfaceColours, surface)
      ? markedSurfaceColours[surface] : null;
  }
  const trayLaw = (typeof TERRAIN_DIORAMA_TRAY_CLOSURE === "object")
    ? TERRAIN_DIORAMA_TRAY_CLOSURE : null;
  const floorH = field.metrics.minH
    - (trayLaw && trayLaw.enabled ? trayLaw.baseOffsetH : 1);
  function isPerimeterCell(c){
    return c.x === 0 || c.y === 0
      || c.x === field.extent.x - 1 || c.y === field.extent.y - 1;
  }
  /* An INTERIOR cell's column reaches down to its LOWEST ORTHOGONAL NEIGHBOUR, not to the deepest point of
     the whole field. Ground is a continuous mass and its exposed face is only as tall as the drop
     beside it — running every column to the field minimum turns a 1h berm into a 22-ft monolith
     and hides the very faces this bench exists to show. A void neighbour drops the full depth,
     because that is exactly what a chasm wall is.

     The DIORAMA PERIMETER is intentionally different: every live boundary silhouette closes to
     the one shared tray datum. That produces a solid cut face under high ground instead of the old
     constant shallow skirt, while no interior height or tactical fact changes. */
  function baseHFor(c){
    if(trayLaw && trayLaw.enabled && isPerimeterCell(c)) return floorH;
    let low = c.h;
    [[c.x - 1, c.y], [c.x + 1, c.y], [c.x, c.y - 1], [c.x, c.y + 1]].forEach(function(nb){
      if(nb[0] < 0 || nb[1] < 0 || nb[0] >= field.extent.x || nb[1] >= field.extent.y){
        low = Math.min(low, c.h - 1);
        return;
      }
      const n = field.cells[nb[1] * field.extent.x + nb[0]];
      low = Math.min(low, n.kind === "void" ? field.metrics.minH - 2 : n.h);
    });
    return low - 1;
  }
  const trayBoundaryCells = field.cells.filter(function(c){
    return c.kind !== "void" && isPerimeterCell(c);
  });
  const trayBoundaryMaxH = trayBoundaryCells.reduce(function(maxH, c){
    const top = (typeof terrainSurfaceCellDatumH === "function")
      ? terrainSurfaceCellDatumH(field, c.index) : c.h;
    return Math.max(maxH, top);
  }, floorH);
  const trayClosureReport = {
    id: trayLaw ? trayLaw.id : "legacy-shallow-boundary",
    enabled: !!(trayLaw && trayLaw.enabled),
    scope: trayLaw ? trayLaw.scope : "none",
    baseDatumH: floorH,
    boundaryCellCount: trayBoundaryCells.length,
    highestBoundaryH: trayBoundaryMaxH,
    maximumCutDepthWU: Number(((trayBoundaryMaxH - floorH) * h).toFixed(4)),
    surfaceRole: trayLaw ? trayLaw.surfaceRole : null,
    mechanicalEffect: trayLaw ? trayLaw.mechanicalEffect : null
  };
  group.userData.terrainDioramaTrayClosure = trayClosureReport;
  /* THE RUNG. `naked` takes the byte-identical legacy path below — one BoxGeometry per cell,
     nothing added — so the A0 control frame is genuinely the control and not a re-implementation
     that happens to look similar. Every device only ever runs on the expressed branch. */
  const flags = (opts && opts.flags) || { anyDevice: false };
  /* R3 — THE OVERHANG LICENCE, decided ONCE per field. Adam: *"i don't want EVERY single top level
     plane to overhang… the 3rd image where every single block has an overhang is absolute
     overkill."* The rule lives in the engine (terrainOverhangCensus); the renderer only obeys it.
     It has to be a FIELD-WIDE decision because the scene cap cannot be seen from inside one cell. */
  const overhangCensus = (typeof terrainOverhangCensus === "function")
    ? terrainOverhangCensus(field, flags) : null;
  /* THREE MODES, because Adam has to be able to SEE the ruling beside what it replaced:
       rule       — the licence above. The default, and Adam's ruling.
       universal  — every exposed side, which is what R1 shipped and what he called overkill. Kept
                    as a named mode so the comparison capture is the real prior render rather than
                    a reconstruction, and so the R3 gate has something to fail against.
       none       — no overhang at all, the third leg of the comparison. */
  const overhangMode = (opts && opts.overhangMode) || "rule";
  group.userData.terrainOverhangMode = overhangMode;
  group.userData.terrainOverhangCensus = overhangCensus ? {
    liveCells: overhangCensus.liveCells, ruleLicensedCells: overhangCensus.ruleLicensedCells,
    ruleShare: overhangCensus.ruleShare, overhangCells: overhangCensus.overhangCells,
    finalShare: overhangCensus.finalShare, withdrawnCells: overhangCensus.withdrawnCells,
    capShare: overhangCensus.capShare, obeysCap: overhangCensus.obeysCap
  } : null;
  /* R6 — which faces carry climbable relief, and therefore the eased DC band. One predicate feeds
     both the number and the picture, so a face cannot be easy without looking easy. */
  const climbCensus = (typeof terrainFaceClimbCensus === "function")
    ? terrainFaceClimbCensus(field) : null;
  const easedFaceByCell = {};
  if(climbCensus && flags.climbease){
    (field.faces || []).forEach(function(f, i){
      const row = climbCensus.rows[i];
      if(row && row.eased) easedFaceByCell[f.highIndex] = row;
    });
  }
  field.cells.forEach(function(c){
    if(c.kind === "void") return;
    const topH = (typeof terrainSurfaceCellDatumH === "function")
      ? terrainSurfaceCellDatumH(field, c.index) : c.h;
    const cellBaseH = baseHFor(c);
    const columnH = Math.max(0.05, (topH - cellBaseH) * h);
    const markedColour = markedSurfaceColour(c.surface);
    const kindColor = c.kind === "guarded-slope" ? CLAY_TERRAIN_COLORS.guarded
      : (c.kind === "boulder" ? CLAY_TERRAIN_COLORS.boulder
        : (markedColour == null ? CLAY_TERRAIN_COLORS.ground : markedColour));
    const cx = originCell.x + c.x - origin.cx + 0.5;
    const cz = originCell.z + c.y - origin.cz + 0.5;
    if(!flags.anyDevice){
      const geometry = new THREE.BoxGeometry(1, columnH, 1);
      const materialId = clayGuardTerrainMaterialId(visualContext, c, "natural-top");
      const materialDefinition = materialId
        ? visualContext.profile.materialDefinitions[materialId] : null;
      const material = materialId
        ? clayGuardVisualMaterial(visualContext, materialId, "terrain:naked-column") : null;
      const mesh = new THREE.Mesh(geometry,
        material || clayStructureMaterial(c.inPlayfield ? kindColor : kindColor));
      mesh.position.set(cx, baseY + cellBaseH * h + columnH / 2, cz);
      if(materialDefinition){
        const uvBounds = clayGuardVisualUvProject(geometry,
          clayGuardVisualComposeMatrix(mesh.position, null), materialDefinition);
        const surfaceAttributes = clayGuardVisualSurfaceAttributes(
          geometry, field, c, cx, cz, visualContext, materialDefinition);
        mesh.userData.clayGuardVisualMaterial = {
          materialId: materialId, state: materialDefinition.state,
          contextVerdict: materialDefinition.contextVerdict,
          projection: materialDefinition.projection, uvBounds: uvBounds,
          surfaceAttributes: surfaceAttributes
        };
      }
      clayStructureTag(mesh, "cl-f07:" + field.id + ":cell", c.kind === "guarded-slope" ? "riser" : "floor");
      mesh.castShadow = true;
      mesh.userData.terrainCell = { x: c.x, y: c.y, h: c.h, kind: c.kind,
        standable: c.standable, inPlayfield: c.inPlayfield, owner: c.owner,
        surface: c.surface, localSlopeDeg: c.localSlopeDeg };
      group.add(mesh);
      cellMeshes.push(mesh);
      return;
    }

    /* ── the expressed cell ───────────────────────────────────────────────────────────────── */
    const cellGroup = new THREE.Group();
    cellGroup.position.set(cx, 0, cz);
    const sides = clayTerrainExposedSides(field, c);
    const corners = clayTerrainCapCorners(field, c.index, flags, baseY);   /* nw ne se sw, world Y */
    const minCornerY = Math.min.apply(null, corners);
    const capBottomY = minCornerY - CLAY_TERRAIN_CAP_H;
    const wash = (typeof terrainCellWashFactor === "function")
      ? terrainCellWashFactor(field, c.index, flags) : 1;
    const cellColour = clayTerrainScaleHex(kindColor, wash);

    /* A3 — the shaft is INSET on exposed sides only; the cap keeps the full 1x1 top plane, so the
       chamfer is a cap OVERHANG that lives strictly below the top plane and intrudes 0.000 wu on
       the standee's protected disc at any size (STANDEE-CONTRACT §5's compatibility rule). An
       interior side is never inset, or the ground would read as loose tiles with slots between. */
    /* R3 — the inset is applied only where the LICENCE says so. Before Adam's ruling every exposed
       side got it, which is the picture he called overkill; now a side has to earn it (a 2h+ drop:
       a cliffside) and the field has to be under its scene cap. `licence` is the engine's answer;
       `applied` records what was actually built, so the gate compares reality against the rule
       rather than comparing the rule against itself. */
    const licence = overhangMode === "universal"
      ? { w: true, e: true, n: true, s: true }
      : (overhangMode === "none" ? { w: false, e: false, n: false, s: false }
        : ((typeof terrainOverhangSides === "function")
          ? terrainOverhangSides(overhangCensus, c.index)
          : { w: false, e: false, n: false, s: false }));
    const inset = flags.chamfer ? CLAY_TERRAIN_CHAMFER : 0;
    const iw = (sides.w > 0 && licence.w) ? inset : 0, ie = (sides.e > 0 && licence.e) ? inset : 0;
    const inn = (sides.n > 0 && licence.n) ? inset : 0, is = (sides.s > 0 && licence.s) ? inset : 0;
    const shaftH = Math.max(0.02, capBottomY - (baseY + cellBaseH * h));
    const shaftGeometry = new THREE.BoxGeometry(
      Math.max(0.05, 1 - iw - ie), shaftH, Math.max(0.05, 1 - inn - is));
    const shaftFaceRole = trayLaw && trayLaw.enabled && isPerimeterCell(c)
      ? "tray-wall" : "exposed-face";
    const shaftMaterialId = clayGuardTerrainMaterialId(visualContext, c, shaftFaceRole);
    const shaftMaterialDefinition = shaftMaterialId
      ? visualContext.profile.materialDefinitions[shaftMaterialId] : null;
    const shaftMaterial = shaftMaterialId
      ? clayGuardVisualMaterial(visualContext, shaftMaterialId,
        shaftFaceRole === "tray-wall" ? "terrain:tray-wall" : "terrain:exposed-face") : null;
    const shaft = new THREE.Mesh(
      shaftGeometry,
      shaftMaterial || clayStructureMaterial(clayTerrainScaleHex(cellColour, 0.94)));
    shaft.position.set((iw - ie) / 2, capBottomY - shaftH / 2, (inn - is) / 2);
    if(shaftMaterialDefinition){
      const shaftWorldPosition = new THREE.Vector3(
        cx + shaft.position.x, shaft.position.y, cz + shaft.position.z);
      const uvBounds = clayGuardVisualUvProject(shaftGeometry,
        clayGuardVisualComposeMatrix(shaftWorldPosition, null), shaftMaterialDefinition);
      const surfaceAttributes = clayGuardVisualSurfaceAttributes(
        shaftGeometry, field, c, cx, cz, visualContext, shaftMaterialDefinition);
      shaft.userData.clayGuardVisualMaterial = {
        materialId: shaftMaterialId, state: shaftMaterialDefinition.state,
        contextVerdict: shaftMaterialDefinition.contextVerdict,
        projection: shaftMaterialDefinition.projection, uvBounds: uvBounds,
        surfaceAttributes: surfaceAttributes
      };
    }
    clayStructureTag(shaft, "cl-f07:" + field.id + ":cell",
      c.kind === "guarded-slope" ? "riser" : "floor");
    shaft.castShadow = true;
    shaft.userData.terrainExpression = "A3-shaft";
    /* WHAT WAS ACTUALLY BUILT, not what was licensed — the gate compares this against the engine's
       own census, so a renderer that ignored the licence fails rather than agreeing with itself. */
    shaft.userData.terrainOverhangApplied = { w: iw > 0, e: ie > 0, n: inn > 0, s: is > 0,
      any: (iw > 0 || ie > 0 || inn > 0 || is > 0), cell: c.index, mode: overhangMode };
    cellGroup.add(shaft);

    function sideIndex(dx, dy){
      const nx = c.x + dx, ny = c.y + dy;
      return nx < 0 || ny < 0 || nx >= field.extent.x || ny >= field.extent.y
        ? -1 : ny * field.extent.x + nx;
    }
    function sideKind(dx, dy){
      const j = sideIndex(dx, dy);
      return j < 0 || typeof terrainSurfaceEdgeKind !== "function"
        ? "boundary" : terrainSurfaceEdgeKind(field, c.index, j);
    }
    const sideKinds = {
      w: sideKind(-1, 0), e: sideKind(1, 0), n: sideKind(0, -1), s: sideKind(0, 1)
    };
    const reliefSides = {
      w: (sideKinds.w === "curb" || sideKinds.w === "cliff" || sideKinds.w === "boundary") ? sides.w : 0,
      e: (sideKinds.e === "curb" || sideKinds.e === "cliff" || sideKinds.e === "boundary") ? sides.e : 0,
      n: (sideKinds.n === "curb" || sideKinds.n === "cliff" || sideKinds.n === "boundary") ? sides.n : 0,
      s: (sideKinds.s === "curb" || sideKinds.s === "cliff" || sideKinds.s === "boundary") ? sides.s : 0
    };

    /* B2 — NOSING BELONGS TO A CURB/TREAD, not to every natural 1h rise. Mandalia-style hill
       grades keep their shared edge; an authored terrace bench can still expose a short riser. */
    const nose = flags.nosing ? CLAY_TERRAIN_NOSING : 0;
    const nw = nose && reliefSides.w === 1 ? nose : 0;
    const ne2 = nose && reliefSides.e === 1 ? nose : 0;
    const nn = nose && reliefSides.n === 1 ? nose : 0;
    const ns = nose && reliefSides.s === 1 ? nose : 0;

    /* The cap is the engine's EXACT responsive FFT topology: one authored centre, four shared edge
       midpoints, four shared corners, and eight broad facets. Do not re-tessellate these facets into
       a checker. The former 4x4 subdivision alternated a diagonal in every micro-quad; hard low-poly
       normals turned that implementation detail into the visible zipper running across every
       diagonal hillside. Eight topology-aligned facets retain changing tile angles without minting
       a second geometric lattice. */
    const x0 = -0.5 - nw, x1 = 0.5 + ne2, z0 = -0.5 - nn, z1 = 0.5 + ns;
    const capPos = [], capIndex = [];
    function vertex(point){
      const at = capPos.length / 3;
      capPos.push(point[0], point[1], point[2]);
      return at;
    }
    function tri(a, b, cc){ capIndex.push(a, b, cc); }
    function capPoint(u, v){
      const px = u === -0.5 ? x0 : (u === 0.5 ? x1 : u);
      const pz = v === -0.5 ? z0 : (v === 0.5 ? z1 : v);
      return [px, baseY + terrainCellTopH(field, c.index, u, v, flags) * h, pz];
    }
    const centre = capPoint(0, 0);
    const capRing = [
      capPoint(-0.5, -0.5), capPoint(0, -0.5), capPoint(0.5, -0.5),
      capPoint(0.5, 0), capPoint(0.5, 0.5), capPoint(0, 0.5),
      capPoint(-0.5, 0.5), capPoint(-0.5, 0)
    ];
    const centreIndex = vertex(centre);
    const ringIndex = capRing.map(vertex);
    for(let ri = 0; ri < capRing.length; ri++){
      /* Ring order is clockwise in X/Z. Reverse each pair so the top normal points +Y. */
      tri(centreIndex, ringIndex[(ri + 1) % ringIndex.length], ringIndex[ri]);
    }
    /* A hard edge can bend through its shared midpoint, so its skirt follows two segments rather
       than bridging corner-to-corner. Natural grades get no skirt at all. */
    const skirtRuns = [
      { on: reliefSides.n > 0, pts: [capPoint(-0.5, -0.5), capPoint(0, -0.5), capPoint(0.5, -0.5)] },
      { on: reliefSides.e > 0, pts: [capPoint(0.5, -0.5), capPoint(0.5, 0), capPoint(0.5, 0.5)] },
      { on: reliefSides.s > 0, pts: [capPoint(0.5, 0.5), capPoint(0, 0.5), capPoint(-0.5, 0.5)] },
      { on: reliefSides.w > 0, pts: [capPoint(-0.5, 0.5), capPoint(-0.5, 0), capPoint(-0.5, -0.5)] }
    ];
    skirtRuns.forEach(function(run){
      if(!run.on) return;
      for(let k = 0; k + 1 < run.pts.length; k++){
        const a = run.pts[k], b = run.pts[k + 1];
        /* Duplicate the skirt vertices so the cap may share/smooth its responsive nodes without
           rounding a real cliff edge into the vertical face. */
        const ia = vertex(a), ib = vertex(b);
        const ibb = vertex([b[0], capBottomY, b[2]]);
        const iab = vertex([a[0], capBottomY, a[2]]);
        tri(ia, ib, ibb);
        tri(ia, ibb, iab);
      }
    });
    const capGeo = new THREE.BufferGeometry();
    capGeo.setAttribute("position", new THREE.Float32BufferAttribute(capPos, 3));
    capGeo.setIndex(capIndex);
    capGeo.computeVertexNormals();
    const capMaterialId = clayGuardTerrainMaterialId(visualContext, c, "natural-top");
    const capMaterialDefinition = capMaterialId
      ? visualContext.profile.materialDefinitions[capMaterialId] : null;
    const capMaterial = capMaterialId
      ? clayGuardVisualMaterial(visualContext, capMaterialId,
        c.surface === "guard-through-road" ? "terrain:traffic-top" : "terrain:natural-top") : null;
    const cap = new THREE.Mesh(capGeo, capMaterial || clayStructureMaterial(cellColour));
    if(capMaterialDefinition){
      const uvBounds = clayGuardVisualUvProject(capGeo,
        clayGuardVisualComposeMatrix(new THREE.Vector3(cx, 0, cz), null), capMaterialDefinition);
      const surfaceAttributes = clayGuardVisualSurfaceAttributes(
        capGeo, field, c, cx, cz, visualContext, capMaterialDefinition);
      cap.userData.clayGuardVisualMaterial = {
        materialId: capMaterialId, state: capMaterialDefinition.state,
        contextVerdict: capMaterialDefinition.contextVerdict,
        projection: capMaterialDefinition.projection, uvBounds: uvBounds,
        surfaceAttributes: surfaceAttributes
      };
    }
    clayStructureTag(cap, "cl-f07:" + field.id + ":cell",
      c.kind === "guarded-slope" ? "riser" : "floor");
    cap.castShadow = true;
    cap.userData.terrainCell = { x: c.x, y: c.y, h: c.h, kind: c.kind,
      standable: c.standable, inPlayfield: c.inPlayfield, owner: c.owner,
      surface: c.surface, localSlopeDeg: c.localSlopeDeg,
      tileType: (typeof terrainSurfaceTileProfile === "function")
        ? terrainSurfaceTileProfile(field, c.index, flags).type : null,
      edgeKinds: sideKinds,
      capTopology: "fft-centre-edge-corner-8-smooth-cap" };
    /* The route material is part of this terrain proof, not stray site art. Preserve only the marked
       tread's authored colour through the neutral-clay sweep so a reviewer can distinguish the
       switchback from an accidental contour line. The shaft and every unmarked ground cap remain
       diagnostic clay. */
    if(markedColour != null){
      cap.userData.clayMaterialBenchSurface = true;
    }
    cellGroup.add(cap);
    cellMeshes.push(cap);

    if(flags.rollover){
      const roll = clayTerrainRolloverMesh(field, c, reliefSides, capBottomY + 0.004,
        clayTerrainScaleHex(cellColour, 0.86));
      if(roll) cellGroup.add(roll);
    }
    if(flags.joint){
      cellGroup.add(clayTerrainJointMesh(field, c.index, flags, baseY, 0, 0,
        clayTerrainScaleHex(cellColour, 0.55), clayTerrainScaleHex(cellColour, 0.78)));
    }
    /* R6 — THE EASED CLIMB AFFORDANCE, on its OWN device flag.
       Adam: *"i like the idea of having some edges where there are little rock bits that maybe a
       character can climb with a low or auto DC check vs the standard."* Proud rock is geometry,
       not paint, and putting it in the geometry bin is also what makes it present in the MATERIAL
       rung — the frame Adam has already said he prefers, which is the one it needs to be judged in.
       The bits are drawn ONLY on a face the same predicate marked eased, so the affordance is the
       reason for the DC rather than decoration applied next to one. */
    if(flags.climbease){
      const eased = easedFaceByCell[c.index];
      if(eased){
        const bits = clayTerrainClimbBits(field, c, sides, capBottomY - 0.04,
          baseY + cellBaseH * h, cellColour, eased, { w: iw, e: ie, n: inn, s: is });
        if(bits) cellGroup.add(bits);
      }
    }
    group.add(cellGroup);
  });

  /* A5 — EDGE-BIASED OCCLUDERS. Break the grid with something that is not on the grid. Every site
     the placement law emits sits ON a cell boundary, so a piece is by construction half on one cell
     and half on the other and its centre is 0.5 wu from either stand point — outside the 0.466
     protected radius of the worst Medium, which is the whole ring the standee contract leaves. */
  if(flags.occluders && typeof terrainOccluderSites === "function"){
    const authoredOccluder = visualContext && visualContext.profile
      ? visualContext.profile.terrainOccluderPresentation : null;
    const authoredOccluderBudget = authoredOccluder
      && authoredOccluder.selectionBudget;
    const sites = terrainOccluderSites(field, flags, authoredOccluderBudget ? {
      everyNthEdge: authoredOccluderBudget.everyNthEdge,
      maxSites: authoredOccluderBudget.maximumSites
    } : null);
    const occluderRows = [];
    sites.forEach(function(site){
      const j = flags.jitter && typeof terrainExpressionJitter === "function"
        ? terrainExpressionJitter(field.seed, site.key)
        : { sinkH: 0, tiltXDeg: 0, tiltZDeg: 0, yawDeg: 0, tone: 1, scale: 1 };
      const size = site.sizeCells * j.scale;
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size * 0.5, 0),
        clayStructureMaterial(clayTerrainScaleHex(CLAY_TERRAIN_COLORS.boulder, j.tone)));
      mesh.position.set(
        originCell.x + site.u - origin.cx,
        baseY + site.seatH * h + size * 0.5 - j.sinkH * h - 0.02,
        originCell.z + site.v - origin.cz
      );
      mesh.rotation.order = "YXZ";
      mesh.rotation.y = j.yawDeg * Math.PI / 180;
      mesh.rotation.x = j.tiltXDeg * Math.PI / 180;
      mesh.rotation.z = j.tiltZDeg * Math.PI / 180;
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData.terrainExpression = "A5-occluder";
      mesh.userData.terrainOccluder = { kind: site.kind, straddles: site.straddles,
        deltaH: site.deltaH, key: site.key };
      group.add(mesh);
      const row = {
        siteKey: site.key,
        kind: site.kind,
        declaredSizeCells: Number(size.toFixed(4)),
        placementAuthority: authoredOccluder
          ? authoredOccluder.placementAuthority : "terrainOccluderSites",
        collisionAuthority: authoredOccluder
          ? authoredOccluder.collisionAuthority : "terrain-expression-site-no-battle-collision",
        fallback: authoredOccluder ? authoredOccluder.fallback : "renderer-icosahedron",
        requestedSlug: null,
        status: "fallback-active"
      };
      occluderRows.push(row);
      /* Golden profiles may present the SAME engine-owned occluder site with an admitted donor.
         The donor cannot choose placement, scale, collision, or mechanics: it inherits the exact
         site position/jitter and is scaled back to the site's declared visual diameter. The
         icosahedron remains a truthful fallback until the donor settles, then becomes invisible.
         This is presentation substitution, not a second scatter system. */
      const slug = authoredOccluder && authoredOccluder.allowedSlugs
        && authoredOccluder.allowedSlugs[0];
      if(!slug) return;
      row.requestedSlug = slug;
      if(!window.TheaterDonor || typeof window.TheaterDonor.loadDonorPiece !== "function"){
        row.status = "loader-unavailable:fallback";
        return;
      }
      row.status = "loading:fallback-active";
      window.TheaterDonor.loadDonorPiece(authoredOccluder.catalog, slug, {
        seedKey: field.id + ":" + site.key,
        materialContext: authoredOccluder.materialContext || null
      }).then(function(donor){
        if(!group.parent || group.parent !== S.clayRoomTerrainBenchGroup) return;
        donor.name = "terrain-occluder-asset:" + site.key + ":" + slug;
        donor.position.set(
          originCell.x + site.u - origin.cx,
          baseY + site.seatH * h - j.sinkH * h - 0.02,
          originCell.z + site.v - origin.cz
        );
        donor.rotation.order = "YXZ";
        donor.rotation.y = j.yawDeg * Math.PI / 180;
        donor.rotation.x = j.tiltXDeg * Math.PI / 180;
        donor.rotation.z = j.tiltZDeg * Math.PI / 180;
        donor.scale.setScalar(size / Math.max(
          0.001, Number(authoredOccluder.canonicalWorldWidth) || 1.15));
        donor.userData.terrainOccluderAsset = {
          siteKey: site.key,
          slug: slug,
          placementAuthority: authoredOccluder.placementAuthority,
          transformAuthority: authoredOccluder.transformAuthority,
          collisionAuthority: authoredOccluder.collisionAuthority,
          mechanicalEffect: authoredOccluder.mechanicalEffect
        };
        donor.traverse(function(node){
          if(node.isMesh){ node.castShadow = true; node.receiveShadow = true; }
        });
        let donorMeshCount = 0;
        donor.traverse(function(node){ if(node.isMesh) donorMeshCount++; });
        group.add(donor);
        mesh.visible = false;
        row.status = "loaded-citizen:fallback-hidden";
        row.loadedSlug = slug;
        row.appliedScale = Number(donor.scale.x.toFixed(6));
        row.meshCount = donorMeshCount;
        /* The mount census is built before asynchronous donor settlement. Mutate only the live
           report belonging to this still-mounted field so the banked receipt counts what the
           screenshot actually contains: one hidden fallback replaced by one authored group. */
        const liveReport = S.clayRoomTerrainReport;
        const liveCensus = liveReport && liveReport.frameCensus;
        if(liveCensus){
          liveCensus.terrainOccluderAssets =
            (liveCensus.terrainOccluderAssets || 0) + 1;
          liveCensus.terrainOccluderAssetParts =
            (liveCensus.terrainOccluderAssetParts || 0) + donorMeshCount;
          liveCensus.occluders = Math.max(0, (liveCensus.occluders || 0) - 1);
        }
        markDirty(); scheduleRender();
      }).catch(function(error){
        row.status = "load-failed:fallback-active";
        row.error = String(error && error.message || error);
        markDirty(); scheduleRender();
      });
    });
    group.userData.terrainOccluderCount = sites.length;
    group.userData.terrainOccluderPresentation = {
      schema: authoredOccluder ? authoredOccluder.schema : null,
      rows: occluderRows,
      mechanicalEffect: authoredOccluder ? authoredOccluder.mechanicalEffect : null
    };
  }

  /* Volume boundaries (thicket, trunk field, fog) are OCCUPANCY, not ground: they stand ON the
     cell they govern and declare whether they stop movement, sight, or both. */
  field.cells.forEach(function(c){
    if(!c.surface) return;
    const volume = c.surface === "thicket" ? { color: CLAY_TERRAIN_COLORS.thicket, height: 3, opacity: 1 }
      : c.surface === "trunk-field" ? { color: CLAY_TERRAIN_COLORS.trunks, height: 5, opacity: 1 }
      : c.surface === "fog" ? { color: CLAY_TERRAIN_COLORS.fog, height: 3, opacity: 0.34 }
      : null;
    if(!volume) return;
    const geo = c.surface === "trunk-field"
      ? new THREE.CylinderGeometry(0.3, 0.36, volume.height * h, 7)
      : new THREE.BoxGeometry(0.94, volume.height * h, 0.94);
    const mat = new THREE.MeshStandardMaterial({ color: volume.color, roughness: 0.95, metalness: 0,
      transparent: volume.opacity < 1, opacity: volume.opacity });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      originCell.x + c.x - origin.cx + 0.5,
      baseY + (c.h) * h + volume.height * h / 2,
      originCell.z + c.y - origin.cz + 0.5
    );
    mesh.castShadow = c.surface !== "fog";
    mesh.receiveShadow = true;
    mesh.userData.interiorKind = "clay-terrain-volume";
    mesh.userData.terrainVolume = { surface: c.surface, cell: { x: c.x, y: c.y } };
    group.add(mesh);
  });

  /* Water is a PLANE at a datum. One quad per water body, at the datum, so the shoreline the
     player sees is the DERIVED one — wherever the ground crosses the plane. */
  const waterBodies = {};
  field.cells.forEach(function(c){
    if(!(c.depthH > 0)) return;
    const datum = c.h + c.depthH;
    const key = datum.toFixed(3);
    if(!waterBodies[key]) waterBodies[key] = { datum: datum, cells: [] };
    waterBodies[key].cells.push(c);
  });
  Object.keys(waterBodies).forEach(function(key){
    const body = waterBodies[key];
    body.cells.forEach(function(c){
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshStandardMaterial({ color: CLAY_TERRAIN_COLORS.water, roughness: 0.22,
          metalness: 0, transparent: true, opacity: 0.72 }));
      quad.rotation.x = -Math.PI / 2;
      quad.position.set(
        originCell.x + c.x - origin.cx + 0.5,
        baseY + body.datum * h + 0.004,
        originCell.z + c.y - origin.cz + 0.5
      );
      quad.userData.interiorKind = "clay-terrain-water";
      quad.userData.terrainWater = { datumH: body.datum, depthH: c.depthH };
      quad.receiveShadow = false;
      group.add(quad);
    });
  });

  /* THE SUPPORT-GRAPH OVERLAY — the CL-R3 traversability grid projected onto terrain. Every
     walkable cell claimed, every guarded slope excluded, and any unreachable standable surface
     drawn RED so a failure is visible rather than merely counted. */
  if(opts && opts.supportOverlay){
    field.cells.forEach(function(c){
      if(!c.standable) return;
      const y = baseY + (c.h + c.sub) * h + 0.02;
      const cx = originCell.x + c.x - origin.cx + 0.5;
      const cz = originCell.z + c.y - origin.cz + 0.5;
      const color = c.reachableNonFlying ? CLAY_TERRAIN_COLORS.standable : CLAY_TERRAIN_COLORS.unreachable;
      const pts = [
        new THREE.Vector3(cx - 0.46, y, cz - 0.46), new THREE.Vector3(cx + 0.46, y, cz - 0.46),
        new THREE.Vector3(cx + 0.46, y, cz + 0.46), new THREE.Vector3(cx - 0.46, y, cz + 0.46)
      ];
      const loop = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: color, transparent: true,
          opacity: c.reachableNonFlying ? 0.6 : 1, depthWrite: false }));
      loop.userData.interiorKind = "clay-diagnostic-overlay";
      loop.userData.terrainSupportCell = { x: c.x, y: c.y, reachable: !!c.reachableNonFlying };
      group.add(loop);
    });
  }
  return { group: group, floorH: floorH, cellMeshes: cellMeshes,
    trayClosure: trayClosureReport };
}

/* THE FRAME'S OWN PROJECTION, read off the live camera and the live canvas. Everything a capture
   needs to turn a world point into a pixel in the banked PNG: the two matrices exactly as the
   renderer used them (no fov/aspect reconstruction, which is where a projection check would quietly
   drift from the picture), the canvas's CSS rect inside the page the screenshot framed, and the
   device pixel ratio the screenshot was taken at. */
function clayTerrainCameraProjection(){
  if(!S.camera) return null;
  S.camera.updateMatrixWorld(true);
  const view = new THREE.Matrix4().copy(S.camera.matrixWorld).invert();
  const canvas = (S.renderer && S.renderer.domElement)
    || (typeof document !== "undefined" ? document.querySelector("canvas") : null);
  const rect = canvas && canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : null;
  return {
    kind: S.camera.isPerspectiveCamera ? "perspective" : "orthographic",
    fov: S.camera.isPerspectiveCamera ? S.camera.fov : null,
    aspect: S.camera.aspect != null ? S.camera.aspect : null,
    near: S.camera.near, far: S.camera.far,
    position: S.camera.position.toArray(),
    projectionMatrix: Array.prototype.slice.call(S.camera.projectionMatrix.elements),
    viewMatrix: Array.prototype.slice.call(view.elements),
    canvasRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
    drawingBuffer: canvas ? { width: canvas.width, height: canvas.height } : null,
    devicePixelRatio: (typeof window !== "undefined" && window.devicePixelRatio) || 1,
    clayZoom: S.clayCamZoom || 1,
    view: S.clayRoomTerrainView || "production"
  };
}

function clayTerrainCellWorld(field, originCell, baseY, origin, index){
  const h = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
  const c = field.cells[index];
  return new THREE.Vector3(
    originCell.x + c.x - origin.cx + 0.5,
    /* Match the responsive field's authored centre node; independent `sub` noise is not terrain. */
    baseY + ((typeof terrainSurfaceCellDatumH === "function")
      ? terrainSurfaceCellDatumH(field, index) : c.h) * h,
    originCell.z + c.y - origin.cz + 0.5
  );
}

/* Pick the cell in a piece's bay that best READS as ground under a standee: the most same-height
   orthogonal neighbours wins, then the lowest, then cell order. Deterministic, and it never leaves
   a witness on a one-cell pinnacle that its own billboard hides. */
function clayTerrainSameHeightNeighbours(field, idx){
  const ex = field.extent.x, ey = field.extent.y;
  const c = field.cells[idx];
  if(!c) return 0;
  let same = 0;
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){
    const nx = c.x + d[0], ny = c.y + d[1];
    if(nx < 0 || ny < 0 || nx >= ex || ny >= ey) return;
    const n = field.cells[ny * ex + nx];
    if(n && n.standable && n.h === c.h) same++;
  });
  return same;
}

function clayTerrainSupportedWitnessCell(field, piece){
  const ex = field.extent.x, ey = field.extent.y;
  const bay = piece.bay;
  const authored = piece.witnessCell.y * ex + piece.witnessCell.x;
  if(!bay) return authored;
  let best = null, bestScore = null;
  for(let y = bay.y; y < bay.y + bay.d && y < ey; y++){
    for(let x = bay.x; x < bay.x + bay.w && x < ex; x++){
      const idx = y * ex + x;
      const c = field.cells[idx];
      if(!c || !c.standable) continue;
      let same = 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){
        const nx = x + d[0], ny = y + d[1];
        if(nx < 0 || ny < 0 || nx >= ex || ny >= ey) return;
        const n = field.cells[ny * ex + nx];
        if(n && n.standable && n.h === c.h) same++;
      });
      const score = [same, -c.h, -idx];
      if(!bestScore || score[0] > bestScore[0]
        || (score[0] === bestScore[0] && score[1] > bestScore[1])
        || (score[0] === bestScore[0] && score[1] === bestScore[1] && score[2] > bestScore[2])){
        bestScore = score; best = idx;
      }
    }
  }
  return best == null ? authored : best;
}

function clayTerrainPlaceWitness(group, slug, position, label, failures, contact, contactSupport, plane,
  entryOverride){
  const note = function(why){ if(failures) failures.push({ slug: slug, label: label, why: why }); return null; };
  const entry = entryOverride
    || ((typeof spriteEntryFor === "function") ? spriteEntryFor(slug) : null);
  if(!entry) return note("no sprite registry entry for " + slug);
  let built = null;
  try { built = interiorSpriteBillboard(entry, null); }
  catch(e){ return note("interiorSpriteBillboard threw: " + (e && e.message)); }
  if(!built) return note("interiorSpriteBillboard returned null (texture not ready?)");
  const figure = built.group;
  figure.position.set(position.x, interiorStandeeContactY(position.y), position.z);
  const support = interiorStandeeSupportMetrics(built.width, entry.size, 1);
  const supportVisualScale = entryOverride && entryOverride.supportVisualScale
    ? entryOverride.supportVisualScale : { x: 1, z: 1 };
  const visualSupportWidth = support.width
    * (Number(supportVisualScale.x) > 0 ? Number(supportVisualScale.x) : 1);
  const visualSupportDepth = support.depth
    * (Number(supportVisualScale.z) > 0 ? Number(supportVisualScale.z) : 1);
  const skirtDepth = clayRoomTerrainSkirtDepth(plane);
  /* R2 — THE BASE SKIRT (Adam 2026-07-28): *"we might need to extend the base down through the
     floor, so even on hills the base appears to make contact with the full ground, rather than just
     floating or teetering."* Passed as an option rather than baked into every plinth in the game:
     the flat tabletop and the interior boards stand on slabs whose thickness this build has not
     measured, and a skirt that pokes out of a thin tile would be a new defect in service of fixing
     an old one. Terrain is where hills are, so terrain is where the skirt is. */
  const ordinaryBaseTrim = S.lastBoard && S.lastBoard.tileKit
    && S.lastBoard.tileKit.trimColor;
  const baseTrim = entryOverride && entryOverride.baseTrimHex
    ? entryOverride.baseTrimHex : ordinaryBaseTrim;
  const base = buildInteriorBase(visualSupportWidth, visualSupportDepth, baseTrim,
    { skirtDepth: skirtDepth });
  figure.add(base);
  figure.userData.standeeBaseMesh = base;
  figure.userData.interiorBaseWidth = support.width;
  figure.userData.interiorBaseDepth = support.depth;
  figure.userData.standeeCollisionExcluded = true;
  /* F3 is measured against the support polygon this envelope actually owns — one cell for a
     Medium, two for a Large, three for a Huge. Measuring a Huge against one cell would report a
     0.67 overhang that is not a defect but a category error. */
  figure.userData.clayStandeeSpanCells = support.tacticalSpanCells;
  figure.userData.interiorHeight = built.height;
  /* Keep the real source-aspect width beside the height. __spriteScreenRects consumes both when
     deciding whether a governed party-proof frame contains complete silhouettes; omitting width
     made every terrain witness audit as a square even though these authored canvases range from
     96×224 to 192×224. */
  figure.userData.interiorWidth = built.width;
  figure.userData.clayTerrainWitness = { slug: slug, label: label || null,
    surfaceClass: (plane && plane.surfaceClass) || null,
    envelope: (plane && plane.envelope) || null };
  /* B1 — THE TILTED PLINTH (docs/TERRAIN-EXPRESSION-BUILD.md §3, STANDEE-CONTRACT §3(d)). Plant a
     flat plinth on a graded cell and every yaw except "long axis exactly across the gradient"
     buries the uphill half and leaves the downhill half airborne — 0.09-0.43 wu of error, 3-15 px
     of visible defect at the production read. Tilting the plinth to the cell's own declared stand
     plane is the ONLY option with zero error at every yaw, by construction.

     THE THREE ROTATION BUDGETS STAY SEPARATE, and this writes only the third:
       · the OUTER group's rotation.x is standee-verbs.js's fall-death tip — untouched here;
       · the sprite's own camera-pitch tilt lives on standeeWrap — untouched here;
       · the BASE CHILD's rotation.x/.z were unused by anything. They are the plinth's own
         conformance to the ground, and they are what this writes.
     The base child's rotation.y is written every frame by updateSpriteBillboardYaw, so the tilt is
     stored on userData and re-applied there rather than fought over. */
  const dYdx = plane ? plane.dYdx || 0 : 0;
  const dYdz = plane ? plane.dYdz || 0 : 0;
  const tilted = !!(plane && plane.tilt && (Math.abs(dYdx) > 1e-9 || Math.abs(dYdz) > 1e-9));
  if(tilted){
    /* Only the FACT and the world gradient are recorded here. The angles themselves are written by
       updateSpriteBillboardYaw, every frame, because the tilt is a WORLD fact on a child of a group
       that turns with the camera — baking an angle at placement would point the plinth uphill at
       exactly one camera step and downhill at the opposite one. One writer, no second truth. */
    figure.userData.clayStandeePlaneTilt = { dYdx: dYdx, dYdz: dYdz,
      tiltDeg: Number((Math.atan(Math.sqrt(dYdx * dYdx + dYdz * dYdz)) * 180 / Math.PI).toFixed(4)) };
  }
  /* the pool is a SECOND, larger footprint and it breaks before the plinth does: a flat quad 1.22 wu
     wide over sloping ground penetrates/floats by +-0.303 wu. It tilts with the plinth. */
  figure.userData.claySupportSurfaceY = position.y;
  figure.userData.clayStandeePlane = { y: position.y, dYdx: dYdx, dYdz: dYdz, tilted: tilted,
    slopeDeg: plane ? plane.slopeDeg || 0 : 0, normal: plane ? plane.normal || null : null,
    gradeId: plane ? plane.gradeId || null : null };
  /* R2 — the sampler for the ground as DRAWN (plane + B4's fold), so the skirt can be measured
     against the surface a viewer actually sees rather than against the plane the plinth conforms
     to. Held as a live function; nothing serialises it. */
  figure.userData.clayStandeeRenderedTopAt = plane ? plane.renderedTopAt || null : null;
  figure.userData.clayStandeeSkirtDepth = skirtDepth;
  figure.userData.clayStandeeBaseBox = (function(){
    const geo = base.geometry;
    if(geo && typeof geo.computeBoundingBox === "function"){
      if(!geo.boundingBox) geo.computeBoundingBox();
      const bb = geo.boundingBox;
      if(bb) return { w: bb.max.x - bb.min.x, d: bb.max.z - bb.min.z,
        yMin: bb.min.y, yMax: bb.max.y };
    }
    return { w: support.width, d: support.depth, yMin: -INTERIOR_BASE_HEIGHT, yMax: 0 };
  })();
  /* GOLDEN SITE 1 grounding resumption (2026-07-30): terrain witnesses bypass the ordinary
     interiorBuildPieces mount, so they also bypassed its addInteriorContactBlob call. The result
     was a sharp but visibly floating Guard NPC: base present, zero local contact occlusion. Mount
     the SAME governed standee pool here, as a sibling of the figure exactly like the production
     interior path. syncStandeeContactBlob owns its continuing position and slope conformance. */
  const contactBlob = addInteriorContactBlob(
    group, figure.position.x, figure.position.z,
    visualSupportWidth, position.y, visualSupportDepth
  );
  if(contactBlob){
    figure.userData.contactBlobMesh = contactBlob;
    contactBlob.userData.linkedSceneObjectId = figure.userData.sceneObjectId
      || "terrain-witness-" + (label || slug);
    contactBlob.userData.terrainWitnessContact = true;
  }
  /* Record the ground this witness was placed ON and the gap it ended at, so "0 refusals" can be
     checked against "0 levitations" rather than assumed. */
  if(contact){
    contact.push({ label: label || null, slug: slug,
      sameHeightNeighbours: contactSupport == null ? null : contactSupport,
      groundY: Number(position.y.toFixed(4)),
      standeeY: Number(figure.position.y.toFixed(4)),
      gap: Number((figure.position.y - position.y).toFixed(4)),
      contactPool: contactBlob ? {
        linked: true,
        diameter: Number(contactBlob.userData.contactPoolDiameter.toFixed(4)),
        blendMode: contactBlob.userData.contactBlendMode,
        terrainConformanceRequired: tilted
      } : null });
  }
  figure.userData.sceneObjectId = "terrain-witness-" + (label || slug);
  group.add(figure);
  const baseMaterialColors = (Array.isArray(base.material)
    ? base.material : [base.material]).map(function(material){
      return material && material.color && typeof material.color.getHex === "function"
        ? material.color.getHex() : null;
    });
  return { slug: slug, label: label || null, height: built.height,
    sourceAsset: entryOverride ? entryOverride.legacyAsset : null,
    worldHeightFeet: entryOverride ? entryOverride.worldHeight : null,
    pixelsPerFoot: entryOverride ? entryOverride.pixelsPerFoot : null,
    bodySubjectHeightPixels: entryOverride ? entryOverride.bodySubjectHeightPixels : null,
    standeeExtrusion: entryOverride ? entryOverride.standeeExtrusion === true : null,
    baseStyle: entryOverride ? entryOverride.baseStyle || null : null,
    baseTrimHex: entryOverride ? entryOverride.baseTrimHex || null : null,
    baseVisualSize: {
      width: Number(visualSupportWidth.toFixed(4)),
      depth: Number(visualSupportDepth.toFixed(4))
    },
    baseMaterialColors: baseMaterialColors,
    at: { x: position.x, y: position.y, z: position.z } };
}

/* ─── THE WITNESS FACING + CONTACT INSTRUMENT (read LIVE, after the facing pass) ───────────────
   TWO defects this exists to make countable, both named in the round-5 research:

   P1 — the terrain witnesses never billboard. updateSpriteBillboardYaw's interior sweep walked
   exactly two levels (interiorGroup -> sub -> figure) while a terrain witness lives three down
   (interiorGroup -> bench -> field -> figure), so every terrain proof ever banked tested only the
   easy axis-aligned yaw — the exact case that hides the stair-overhang problem. The check here is
   PHYSICAL, not constant-matched: does the card's own normal point at the camera?

   P2 — WITNESS_MAX_GAP measures the ORIGIN gap, which interiorStandeeContactY pins at exactly 0.096
   by construction. It cannot move, so it reads green on a plinth whose uphill corner is buried
   0.217 wu and whose downhill corner is 0.217 wu airborne. This reports the NEAREST-CONTACT GAP
   UNDER THE PLINTH FOOTPRINT — four corners of the plinth's RENDERED bbox against the support plane
   sampled at each corner — and prints the legacy number beside it so the receipt carries the
   argument for the replacement rather than a claim about it. */
function clayTerrainWitnessFacingReport(){
  const out = { measured: false, camera: null, witnesses: [] };
  if(!S.clayRoomTerrainBenchGroup || !S.camera) return out;
  S.camera.updateMatrixWorld(true);
  const cam = new THREE.Vector3(); S.camera.getWorldPosition(cam);
  out.camera = [Number(cam.x.toFixed(3)), Number(cam.y.toFixed(3)), Number(cam.z.toFixed(3))];
  out.measured = true;
  S.clayRoomTerrainBenchGroup.traverse(function(node){
    const ud = node.userData || {};
    if(!ud.clayTerrainWitness) return;
    const wp = new THREE.Vector3(); node.getWorldPosition(wp);
    /* the card is authored facing +Z; rotation.y = facing turns that face back at the camera */
    const yaw = node.rotation ? node.rotation.y || 0 : 0;
    const normal = { x: Math.sin(yaw), z: Math.cos(yaw) };
    let dx = cam.x - wp.x, dz = cam.z - wp.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    dx /= len; dz /= len;
    const dot = Math.max(-1, Math.min(1, normal.x * dx + normal.z * dz));
    /* CONVENTION-FREE. updateSpriteBillboardYaw sets rotation.y = yaw + PI, so the card's local +Z
       ends up pointing 180 degrees from the camera and its OTHER face is the visible one — measured,
       not assumed. What matters for P1 is not which face is front but that the card is
       PERPENDICULAR to the view direction, which is true for exactly one yaw regardless of which
       side is textured. A witness that never faced reads 45 degrees off; a faced one reads ~0. */
    const perpErr = Math.min(Math.acos(dot), Math.PI - Math.acos(dot)) * 180 / Math.PI;
    const wrap = ud.standeeWrap;
    const baseMesh = ud.standeeBaseMesh;
    const plane = ud.clayStandeePlane || { y: wp.y, dYdx: 0, dYdz: 0, tilted: false };
    const box = ud.clayStandeeBaseBox || { w: 0.744, d: 0.3693, yMin: -0.102, yMax: 0.012 };
    /* the base child's own world yaw (it may be counter-rotated by claySupportWorldYaw) */
    const baseYaw = baseMesh ? yaw + (baseMesh.rotation ? baseMesh.rotation.y || 0 : 0) : yaw;
    /* MEASURED off the live scene graph, never modelled: the plinth's four bbox corners taken
       through its own world matrix, so a rotation-order mistake in the tilt shows as a gap instead
       of cancelling out of both sides of the arithmetic. */
    let cornersWorld = null;
    if(baseMesh && typeof baseMesh.localToWorld === "function"){
      baseMesh.updateMatrixWorld(true);
      const hw = box.w / 2, hd = box.d / 2;
      cornersWorld = [[-hw, box.yMin, -hd], [hw, box.yMin, -hd], [hw, box.yMin, hd], [-hw, box.yMin, hd]]
        .map(function(p){
          const v = baseMesh.localToWorld(new THREE.Vector3(p[0], p[1], p[2]));
          return [v.x, v.y, v.z];
        });
    }
    let probe = null;
    if(typeof terrainStandeeContactProbe === "function"){
      probe = terrainStandeeContactProbe({
        bboxW: box.w, bboxD: box.d, yawRad: baseYaw,
        originY: wp.y, bottomBelowOrigin: -box.yMin,
        standX: wp.x, standZ: wp.z, cornersWorld: cornersWorld,
        supportHalfX: (ud.clayStandeeSpanCells || 1) / 2,
        supportHalfZ: (ud.clayStandeeSpanCells || 1) / 2,
        tilted: !!plane.tilted, planeDYdx: plane.dYdx, planeDYdz: plane.dYdz,
        planeAt: function(x, z){
          return plane.y + (x - wp.x) * (plane.dYdx || 0) + (z - wp.z) * (plane.dYdz || 0);
        }
      });
    }
    /* ─── R1 · DOES THE SPRITE MATCH ITS BASE? ────────────────────────────────────────────────
       Adam's ruling reverses the standee-contract study: *"the sprite itself should always be
       fixed at the same angle as its base."* Measured as a PHYSICAL relation between two world
       matrices, not as a constant match:

         agreementDeg  the angle between the sprite wrap's world up and the base's world up. Every
                       standee carries a fixed camera-pitch tilt on the wrap (the un-foreshortening
                       trick), so the two are never identical — but if the sprite leans WITH the
                       base then that angle is the camera-pitch CONSTANT and nothing else, at every
                       grade and every yaw. If the sprite stays vertical while the base tilts, the
                       angle wanders with the grade. One number, and it fails for the right reason.
         conformDeg    the same claim from the other side: strip the known camera pitch off the
                       wrap's world orientation and what is left must be the base's own frame. 0 if
                       they agree. Independent of agreementDeg because it uses the full rotation
                       rather than one axis — a roll about the view direction moves this and not
                       that. */
    let agreementDeg = null, conformDeg = null, spriteWorldUp = null, baseWorldUp = null;
    if(wrap && baseMesh && typeof wrap.updateMatrixWorld === "function"){
      wrap.updateMatrixWorld(true);
      baseMesh.updateMatrixWorld(true);
      const upOf = function(obj){
        const e = obj.matrixWorld.elements;              /* column 1 = the local +Y axis */
        const l = Math.hypot(e[4], e[5], e[6]) || 1;
        return [e[4] / l, e[5] / l, e[6] / l];
      };
      spriteWorldUp = upOf(wrap);
      baseWorldUp = upOf(baseMesh);
      const dotUp = Math.max(-1, Math.min(1, spriteWorldUp[0] * baseWorldUp[0]
        + spriteWorldUp[1] * baseWorldUp[1] + spriteWorldUp[2] * baseWorldUp[2]));
      agreementDeg = Math.acos(dotUp) * 180 / Math.PI;
      const qWrap = new THREE.Quaternion(); wrap.getWorldQuaternion(qWrap);
      const qBase = new THREE.Quaternion(); baseMesh.getWorldQuaternion(qBase);
      const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0),
        (CAM_ELEV_DEG * Math.PI) / 180);
      /* wrapWorld = baseWorld * pitch  <=>  wrapWorld * pitch^-1 * baseWorld^-1 = identity */
      const qConform = qWrap.clone().multiply(qPitch.clone().invert())
        .multiply(qBase.clone().invert());
      conformDeg = 2 * Math.acos(Math.min(1, Math.abs(qConform.w))) * 180 / Math.PI;
    }

    /* ─── R2 · IS THE PLINTH MAKING FULL CONTACT, AND DOES THE SKIRT HIDE THE REST? ───────────
       Sampled against the ground AS DRAWN (terrainCellTopH — plane plus B4's fold), which no gate
       before this one did: the contact probe evaluates the stand PLANE, so a fold dipping away
       under a plinth corner was invisible to every number the R1 build produced.
         worstDaylightWU  the deepest gap between the plinth's own tilted bottom face and the drawn
                          ground, over a grid across the footprint. This is the teetering Adam saw.
         skirtMarginWU    how far the skirt's bottom sits BELOW the drawn ground at the worst
                          sample. Positive = no camera can see under the base there. With no skirt
                          it is exactly -worstDaylight, which is what makes this gate red-first. */
    let skirt = null;
    const topAt = ud.clayStandeeRenderedTopAt;
    if(typeof topAt === "function" && baseMesh && cornersWorld){
      const skirtDepth = ud.clayStandeeSkirtDepth || 0;
      const samples = [];
      const hw = box.w / 2, hd = box.d / 2;
      for(let sx = -1; sx <= 1; sx++){
        for(let sz = -1; sz <= 1; sz++){
          samples.push(baseMesh.localToWorld(new THREE.Vector3(sx * hw, box.yMin, sz * hd)));
        }
      }
      let worstDaylight = -Infinity, worstMargin = Infinity;
      samples.forEach(function(p){
        const groundY = topAt(p.x, p.z);
        const daylight = p.y - groundY;                   /* + = the plinth floats here */
        if(daylight > worstDaylight) worstDaylight = daylight;
        const margin = groundY - (p.y - skirtDepth);      /* + = the skirt is buried here */
        if(margin < worstMargin) worstMargin = margin;
      });
      skirt = {
        skirtDepthWU: Number(skirtDepth.toFixed(4)),
        samples: samples.length,
        worstDaylightWU: Number(worstDaylight.toFixed(5)),
        skirtMarginWU: Number(worstMargin.toFixed(5)),
        hidden: worstMargin > 0
      };
    }

    out.witnesses.push({
      label: ud.clayTerrainWitness.label, slug: ud.clayTerrainWitness.slug,
      spriteWorldUp: spriteWorldUp ? spriteWorldUp.map(function(v){ return Number(v.toFixed(6)); }) : null,
      baseWorldUp: baseWorldUp ? baseWorldUp.map(function(v){ return Number(v.toFixed(6)); }) : null,
      spriteBaseAgreementDeg: agreementDeg == null ? null : Number(agreementDeg.toFixed(4)),
      spriteBaseConformDeg: conformDeg == null ? null : Number(conformDeg.toFixed(4)),
      cameraPitchDeg: CAM_ELEV_DEG,
      skirt: skirt,
      surfaceClass: ud.clayTerrainWitness.surfaceClass || null,
      envelope: ud.clayTerrainWitness.envelope || null,
      spanCells: ud.clayStandeeSpanCells || null,
      at: [Number(wp.x.toFixed(3)), Number(wp.y.toFixed(3)), Number(wp.z.toFixed(3))],
      yawRad: Number(yaw.toFixed(5)),
      yawDeg: Number((yaw * 180 / Math.PI).toFixed(3)),
      facingErrorDeg: Number((Math.acos(dot) * 180 / Math.PI).toFixed(3)),
      cardPerpErrorDeg: Number(perpErr.toFixed(3)),
      billboards: perpErr <= 15,
      wrapTiltDeg: wrap && wrap.rotation
        ? Number((wrap.rotation.x * 180 / Math.PI).toFixed(3)) : null,
      outerTiltXDeg: node.rotation ? Number((node.rotation.x * 180 / Math.PI).toFixed(4)) : null,
      baseTiltXDeg: baseMesh && baseMesh.rotation
        ? Number((baseMesh.rotation.x * 180 / Math.PI).toFixed(3)) : null,
      baseTiltZDeg: baseMesh && baseMesh.rotation
        ? Number((baseMesh.rotation.z * 180 / Math.PI).toFixed(3)) : null,
      baseBox: { w: Number(box.w.toFixed(4)), d: Number(box.d.toFixed(4)),
        yMin: Number(box.yMin.toFixed(4)) },
      standPlane: { slopeDeg: Number((plane.slopeDeg || 0).toFixed(3)), tilted: !!plane.tilted,
        dYdx: Number((plane.dYdx || 0).toFixed(5)), dYdz: Number((plane.dYdz || 0).toFixed(5)) },
      contact: probe
    });
  });
  const gaps = out.witnesses.map(function(w){ return w.contact ? w.contact.maxCornerGap : 0; });
  const mins = out.witnesses.map(function(w){ return w.contact ? w.contact.minCornerGap : 0; });
  out.worstMaxCornerGap = gaps.length ? Number(Math.max.apply(null, gaps).toFixed(5)) : null;
  out.worstMinCornerGap = mins.length ? Number(Math.min.apply(null, mins).toFixed(5)) : null;
  out.worstFacingErrorDeg = out.witnesses.length
    ? Number(Math.max.apply(null, out.witnesses.map(function(w){ return w.cardPerpErrorDeg; })).toFixed(3))
    : null;
  /* R1/R2 rollups. `worstSpriteBaseDisagreementDeg` is the DEVIATION from the camera-pitch
     constant, not the raw angle — so 0 means "the sprite carries exactly the camera pitch relative
     to its base and nothing else", which is the ruling, at any grade. */
  const agree = out.witnesses.map(function(w){ return w.spriteBaseAgreementDeg; })
    .filter(function(v){ return v != null; });
  out.worstSpriteBaseDisagreementDeg = agree.length
    ? Number(Math.max.apply(null, agree.map(function(v){ return Math.abs(v - CAM_ELEV_DEG); })).toFixed(4))
    : null;
  const conform = out.witnesses.map(function(w){ return w.spriteBaseConformDeg; })
    .filter(function(v){ return v != null; });
  out.worstSpriteBaseConformDeg = conform.length
    ? Number(Math.max.apply(null, conform).toFixed(4)) : null;
  const skirts = out.witnesses.map(function(w){ return w.skirt; }).filter(Boolean);
  out.worstDaylightWU = skirts.length
    ? Number(Math.max.apply(null, skirts.map(function(s){ return s.worstDaylightWU; })).toFixed(5)) : null;
  out.worstSkirtMarginWU = skirts.length
    ? Number(Math.min.apply(null, skirts.map(function(s){ return s.skirtMarginWU; })).toFixed(5)) : null;
  out.skirtSampledWitnesses = skirts.length;
  out.witnessesWithSkirtVisible = skirts.filter(function(s){ return !s.hidden; }).length;
  out.nonBillboarding = out.witnesses.filter(function(w){ return w.cardPerpErrorDeg > 15; }).length;
  out.distinctYaws = Array.from(new Set(out.witnesses.map(function(w){ return w.yawDeg; })));
  return out;
}

/* HOST CHROME. The 15×15 host supplies the calibrated grid, camera, light and shadow receiver
   exactly as CL-F01 uses it. Everything ELSE it carries is room furniture with nowhere to live on
   an outdoor field: a door leaf with no wall reads as a dark slab floating in mid-air, and the two
   diagnostic calibration bulbs — housing plus emitter, at ±4.24 either side of the room's centre
   line, 1.7 units up — read as two objects hovering above the terrain. Matched on their OWN
   userData markers, not on interiorKind: the door leaf and the fixture bodies carry no interiorKind
   at all, which is exactly why the first pass (which only matched interiorKind) missed every one of
   them. Visibility only — nothing is unmounted or destroyed, so the host bench is whole again the
   moment another fixture is selected. */
function clayTerrainSuppressHostChrome(){
  const suppressed = { shell: 0, door: 0, fixture: 0, mote: 0, overlay: 0, unowned: 0 };
  const root = S.interiorGroup;
  if(!root || !S.clayRoomRecord) return suppressed;
  const portalId = S.clayRoomRecord.portal && S.clayRoomRecord.portal.id;
  /* NEVER match anything the terrain bench itself built. This sweep runs a second time at the tail
     of the rebuild — by which point clayRoomApplyDiagnosticSurfaces has tagged every routed surface
     with clayRole/clayRoute, so a `clayRole` bucket matched all 564 terrain cells and hid the whole
     field (overlay: 577). The matcher is now allow-listed against terrain ownership first and the
     clayRole bucket is gone: it only ever caught one incidental host mesh, at a cost of being able
     to erase the entire proof. */
  const terrainGroup = S.clayRoomTerrainBenchGroup;
  root.traverse(function(node){
    const ud = node.userData || {};
    if(ud.terrainCell || ud.terrainWater || ud.terrainVolume || ud.terrainSpan
      || ud.clayTerrainWitness || ud.terrainSupportCell || ud.terrainRoute
      || ud.clayTerrainBench) return;
    if(terrainGroup){
      let anc = node.parent, inTerrain = false;
      while(anc){ if(anc === terrainGroup){ inTerrain = true; break; } anc = anc.parent; }
      if(inTerrain) return;
    }
    const kind = ud.interiorKind;
    let bucket = null;
    if(kind === "room-shell-wall-upper" || kind === "room-shell-wall-trim"
      || kind === "room-shell-wall-stem" || kind === "room-shell-floor"
      || kind === "skirt" || kind === "portal") bucket = "shell";
    else if(ud.isDoorLeaf || ud.doorLeaf || (portalId && ud.interactableId === portalId)) bucket = "door";
    else if(ud.fixtureEmitter || ud.isLightEmitter) bucket = "fixture";
    else if(ud.motePiece) bucket = "mote";
    /* The C1A crate, by its diagnostic ROLE rather than by clayRole's mere presence — terrain
       surfaces are routed as floor/riser, furniture is the host's own prop. Narrow on purpose:
       matching clayRole at all is what erased the field. */
    else if(ud.clayRole === "furniture") bucket = "overlay";
    if(!bucket || node.visible === false) return;
    node.visible = false;
    node.userData.clayTerrainHostSuppressed = bucket;
    suppressed[bucket]++;
  });

  /* THE CLOSING RULE. Named buckets catch what we have already identified; this catches the rest.
     Anything in the interior group that the terrain bench did not build is host chrome by
     definition — the crate's occlusion ghost, an unmarked prop, whatever the host adds next. Only
     MESHES, so the 17d law holds: a light is never hidden and never detached, and the bench's own
     subtree is excluded outright rather than matched on a tag that the diagnostic surface pass can
     also stamp onto terrain (the mistake that erased the field). */
  const benchGroup = S.clayRoomTerrainBenchGroup;
  if(benchGroup){
    root.traverse(function(node){
      if(!node.isMesh || node.isLight || node.visible === false) return;
      let cur = node, mine = false;
      while(cur){ if(cur === benchGroup){ mine = true; break; } cur = cur.parent; }
      if(mine) return;
      node.visible = false;
      node.userData.clayTerrainHostSuppressed = "unowned";
      suppressed.unowned = (suppressed.unowned || 0) + 1;
    });
  }
  /* A fixture BODY is an unmarked sibling of its emitter inside the practical's own group. Round 1
     DETACHED that group — and `clay-opposing-pair` is literally a two-point-light opposing pair
     whose lights live inside those two practicals, so the detach carried the scene's entire
     illumination out with the housings. Every production frame then rendered as an unlit
     silhouette on a pale backdrop, which the whole-frame luma gate could not see.
     NEVER touch a light, and never hide a group that contains one: hide the MESH bodies only. */
  root.traverse(function(node){
    if(!(node.userData && node.userData.fixtureEmitter)) return;
    const practical = node.parent;
    if(!practical || practical === root) return;
    practical.traverse(function(child){
      if(child.isLight) return;
      if(!child.isMesh || child.visible === false) return;
      child.visible = false;
      child.userData.clayTerrainHostSuppressed = "fixture";
    });
  });

  /* Report the CUMULATIVE state, not this pass's delta. The sweep runs twice per rebuild and the
     second pass skips what the first already hid, so a delta reads as "0 suppressed" on a frame
     where the door and both fixtures are in fact gone — a receipt that says nothing was suppressed
     while the suppression is working is worse than no receipt. */
  const total = { shell: 0, door: 0, fixture: 0, mote: 0, overlay: 0, unowned: 0 };
  root.traverse(function(node){
    const b = node.userData && node.userData.clayTerrainHostSuppressed;
    if(b && total[b] != null) total[b]++;
  });
  total.detachedPracticals = 0;   /* nothing is detached any more — see the note above */
  return total;
}

/* WHY THE FIRST DARK CAPTURE WAS NOT DARK. The clay recipe owns S.ambientLight and S.pointLights
   and reasserts both — the dark profile's authored 0.25 ambient WAS applied, and the receipt's
   recipe id was honest. But setInteriorBoard's own base rig ALSO hangs lights on the scene that
   clayRoomApplyLightProfile never touches: a 4.5-intensity AmbientLight, an 18-intensity
   sprite-camera fill SpotLight, an interior camera key, and three small base lights. In a 15×15
   room the shell hides most of that rig; the terrain bench suppresses the shell, so it fell on the
   field unopposed and washed the dark case to pale grey.
   Zeroing intensity alone is not enough — the camera-tracking fills have their intensity re-driven
   every frame, so a one-shot zero is overwritten before the capture. `visible` is not on that
   driver's path. Every original is remembered on the light itself, so nothing is destroyed and a
   fixture switch restores it. */
function clayTerrainNeutralizeForeignLights(){
  const out = [];
  let root = S.scene;
  if(!root && S.interiorGroup){ root = S.interiorGroup; while(root.parent) root = root.parent; }
  if(!root) return out;
  root.traverse(function(node){
    if(!node.isLight) return;
    if(node.userData && node.userData.clayLightId) return;
    if(!node.userData.clayTerrainForeignLight){
      node.userData.clayTerrainForeignLight = {
        type: node.type,
        role: node.userData.spriteCameraFill ? "sprite-camera-fill"
          : (node.userData.interiorCameraKey ? "interior-camera-key" : "base-rig"),
        originalIntensity: Number(node.intensity) || 0,
        originalVisible: node.visible !== false,
        color: node.color ? node.color.getHexString() : null
      };
    }
    node.intensity = 0;
    node.visible = false;
    out.push(node.userData.clayTerrainForeignLight);
  });
  return out;
}

/* Put every detached practical back exactly where it was, so selecting another Clayroom fixture
   finds its own bench intact. */
function clayTerrainRestoreHostChrome(){
  const held = S.clayRoomTerrainDetachedPracticals || [];
  held.forEach(function(entry){
    if(!entry.group || !entry.parent) return;
    if(entry.group.parent) return;
    entry.parent.add(entry.group);
  });
  S.clayRoomTerrainDetachedPracticals = [];
  let restored = 0;
  if(S.interiorGroup){
    S.interiorGroup.traverse(function(node){
      if(!(node.userData && node.userData.clayTerrainHostSuppressed)) return;
      node.visible = true;
      delete node.userData.clayTerrainHostSuppressed;
      restored++;
    });
  }
  return restored + held.length;
}

function clayTerrainRestoreForeignLights(){
  let root = S.scene;
  if(!root && S.interiorGroup){ root = S.interiorGroup; while(root.parent) root = root.parent; }
  if(!root) return 0;
  let restored = 0;
  root.traverse(function(node){
    const rec = node.userData && node.userData.clayTerrainForeignLight;
    if(!rec) return;
    node.intensity = rec.originalIntensity;
    node.visible = rec.originalVisible !== false;
    delete node.userData.clayTerrainForeignLight;
    restored++;
  });
  return restored;
}

/* GOLDEN SITE 1 MATERIAL PROJECTION. The profile is pure engine data; this block only interprets
   its channel and projection declarations through THREE. All maps stay candidates until an
   in-context ruling. Texture load success is recorded separately from visual admission. */
const CLAY_GUARD_VISUAL_TEXTURE_CACHE = new Map();
function clayGuardVisualTexture(url, colorSpace, wrapMode){
  const resolvedWrapMode = wrapMode === "clamp" || wrapMode === "repeat-x-clamp-y"
    ? wrapMode : "repeat";
  const key = url + "|" + colorSpace + "|" + resolvedWrapMode;
  if(CLAY_GUARD_VISUAL_TEXTURE_CACHE.has(key)) return CLAY_GUARD_VISUAL_TEXTURE_CACHE.get(key);
  const pending = new Promise(function(resolve, reject){
    new THREE.TextureLoader().load(url, function(texture){
      texture.colorSpace = colorSpace === "sRGB"
        ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.wrapS = resolvedWrapMode === "clamp"
        ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
      texture.wrapT = resolvedWrapMode === "repeat"
        ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
      /* Sprite-derived ALBEDO keeps the visible pixel clusters that give the TS/FFT material
         language its character. Trilinear albedo mips averaged those clusters into the same soft
         procedural surface the source-sprite workflow exists to avoid. Data maps remain linearly
         mip-filtered: interpolating a normal/ORM signal is correct, while interpolating painted
         albedo identity is not. Quarter-turn cameras are discrete, so the albedo path does not need
         a continuously-orbiting shimmer compromise. */
      const spriteAlbedo = colorSpace === "sRGB";
      texture.magFilter = spriteAlbedo ? THREE.NearestFilter : THREE.LinearFilter;
      texture.minFilter = spriteAlbedo ? THREE.NearestFilter : THREE.LinearMipmapLinearFilter;
      texture.generateMipmaps = !spriteAlbedo;
      texture.userData.guardSampling = spriteAlbedo
        ? "sprite-albedo-nearest-no-mipmap"
        : "linear-data-trilinear-mipmap";
      texture.needsUpdate = true;
      resolve(texture);
    }, undefined, function(error){
      reject(error || new Error("Guard visual texture failed: " + url));
    });
  });
  CLAY_GUARD_VISUAL_TEXTURE_CACHE.set(key, pending);
  return pending;
}

function clayGuardVisualContext(profile){
  if(!profile) return null;
  const materials = new Map();
  const loadRows = {};
  const uses = {};
  const context = {
    profile: profile,
    materials: materials,
    loadRows: loadRows,
    uses: uses,
    report: {
      schema: profile.schema,
      version: profile.version,
      profileId: profile.profileId,
      cultureId: profile.cultureId,
      planRef: profile.planRef,
      mechanicsRef: profile.mechanicsRef,
      materialPackRef: profile.materialPackRef,
      materialSourcePacks: (profile.materialSourcePacks || [profile.materialPackRef]).slice(),
      fingerprint: profile.fingerprint,
      verdict: "PENDING_GUARD_POST_REVIEW",
      worldSignifierDemonstration: profile.worldSignifierDemonstration
        ? Object.assign({}, profile.worldSignifierDemonstration, {
            supportedMedia: (profile.worldSignifierDemonstration.supportedMedia || []).slice()
          }) : null,
      terrainDressing: profile.terrainDressing ? {
        schema: profile.terrainDressing.schema,
        id: profile.terrainDressing.id,
        status: profile.terrainDressing.status,
        sourceAsset: profile.terrainDressing.sourceAsset,
        pixelsPerFoot: profile.terrainDressing.pixelsPerFoot,
        sourceEnvelope: profile.terrainDressing.sourceEnvelope,
        projection: profile.terrainDressing.projection,
        placementRule: profile.terrainDressing.placementRule,
        placementCount: (profile.terrainDressing.placements || []).length,
        fingerprint: profile.terrainDressing.fingerprint,
        mechanicalEffect: profile.terrainDressing.mechanicalEffect
      } : null,
      conditionLayers: (profile.conditionLayers || []).map(function(layer){
        return Object.assign({}, layer);
      }),
      terrainConditionFields: (profile.terrainConditionFields || []).map(function(field){
        return {
          schema: field.schema,
          id: field.id,
          fieldRef: field.fieldRef,
          sourceFactRefs: (field.sourceFactRefs || []).slice(),
          sourceLocal: Object.assign({}, field.sourceLocal),
          pathCells: (field.pathCells || []).map(function(cell){ return Object.assign({}, cell); }),
          projection: field.projection,
          coordinateDomain: field.coordinateDomain,
          distributionRule: field.distributionRule,
          maximumWeight: field.maximumWeight,
          weightFingerprint: field.weightFingerprint,
          mechanicalEffect: field.mechanicalEffect
        };
      }),
      materialBlendContracts: Object.keys(profile.materialDefinitions || {}).reduce(
        function(contracts, materialId){
          const definition = profile.materialDefinitions[materialId];
          if(definition && definition.parentBlend){
            contracts[materialId] = Object.assign({}, definition.parentBlend);
          }
          return contracts;
        }, {}),
      materialProjectionContracts: Object.keys(profile.materialDefinitions || {}).reduce(
        function(contracts, materialId){
          const definition = profile.materialDefinitions[materialId];
          if(!definition) return contracts;
          contracts[materialId] = {
            mode: definition.projection || "world-dominant-planar",
            metersPerRepeat: definition.metersPerRepeat || 1.65,
            metersPerRepeatX: definition.metersPerRepeatX
              || definition.metersPerRepeat || 1.65,
            metersPerRepeatY: definition.metersPerRepeatY
              || definition.metersPerRepeat || 1.65,
            worldUnitsPerRepeatX: definition.worldUnitsPerRepeatX,
            worldUnitsPerRepeatY: definition.worldUnitsPerRepeatY,
            feetPerWorldUnit: definition.feetPerWorldUnit || 5,
            wrapMode: definition.wrapMode || "repeat"
          };
          if(definition.faceLocalModuleFeet != null){
            contracts[materialId].faceLocalModuleFeet = definition.faceLocalModuleFeet;
          }
          if(definition.masonryCourse){
            contracts[materialId].masonryCourse =
              Object.assign({}, definition.masonryCourse);
          }
          if(definition.atlasSlot){
            contracts[materialId].atlasSlot = Object.assign({}, definition.atlasSlot);
          }
          if(definition.repeatWorldLength != null){
            contracts[materialId].repeatWorldLength = definition.repeatWorldLength;
          }
          if(definition.projection === "edge-local-planar"){
            contracts[materialId].edgeAnchor = "receiver-local-min-boundary";
            contracts[materialId].horizontalPhaseSource = "stable-projection-identity";
          } else if(definition.projection === "receiver-local-decal"){
            contracts[materialId].edgeAnchor = "receiver-local-min-boundary";
            contracts[materialId].horizontalPhaseSource = "none:single-authored-cutout";
          } else if(definition.projection === "receiver-local-trim"){
            contracts[materialId].edgeAnchor = "receiver-local-min-boundary";
            contracts[materialId].horizontalPhaseSource = "continuous-distance-along-receiver";
          }
          return contracts;
        }, {}),
      materialLoads: loadRows,
      materialUses: uses
    }
  };
  return context;
}

function clayGuardVisualMaterial(context, materialId, usage){
  if(!context || !materialId) return null;
  const definition = context.profile.materialDefinitions[materialId];
  if(!definition) return null;
  const usageKey = usage || "unspecified";
  if(!context.uses[materialId]) context.uses[materialId] = {};
  context.uses[materialId][usageKey] = (context.uses[materialId][usageKey] || 0) + 1;
  if(context.materials.has(materialId)) return context.materials.get(materialId);

  const material = new THREE.MeshStandardMaterial({
    color: definition.tint || "#ffffff",
    roughness: definition.roughness == null ? 0.92 : definition.roughness,
    metalness: definition.metalness == null ? 0 : definition.metalness,
    alphaTest: definition.alphaTest || 0,
    opacity: definition.opacity == null ? 1 : definition.opacity,
    transparent: !!definition.transparent,
    depthWrite: definition.depthWrite !== false,
    alphaToCoverage: !!definition.alphaToCoverage
  });
  /* This renderer has no image-based environmental light. A restrained material-declared indirect
     floor keeps vertical cut faces and deeply shadowed masonry in the authored palette rather than
     collapsing to black. It is deliberately per-material and tiny; it does not move the sun,
     flatten cast shadows, or add a second scene light. */
  if(definition.shadowLift > 0){
    material.emissive = new THREE.Color(definition.tint || "#ffffff");
    material.emissiveIntensity = definition.shadowLift;
  }
  if(definition.surfaceBlend){
    /* GOLDEN SITE 1 GROUND FIELD v1. One PBR material samples the turf parent and the traffic
       parent through a continuous geometry attribute. The shader consumes committed surface facts;
       it does not decide where the road is. A second low-frequency attribute modulates value over
       several cells, breaking repeated-tile cadence without inventing footing, color families, or
       per-cell random materials. */
    material.userData.guardSurfaceBlend = Object.assign({}, definition.surfaceBlend, {
      secondarySurfaces: (definition.surfaceBlend.secondarySurfaces || []).slice()
    });
    material.onBeforeCompile = function(shader){
      shader.uniforms.guardSecondaryMap = {
        value: material.userData.guardSecondaryAlbedo || material.map
      };
      shader.uniforms.guardSecondaryNormalMap = {
        value: material.userData.guardSecondaryNormal || material.normalMap
      };
      shader.uniforms.guardSecondaryOrmMap = {
        value: material.userData.guardSecondaryOrm || material.roughnessMap
      };
      shader.uniforms.guardConditionMap = {
        value: material.userData.guardConditionAlbedo || material.map
      };
      shader.uniforms.guardFoundationConditionMap = {
        value: material.userData.guardFoundationConditionAlbedo || material.map
      };
      shader.uniforms.guardFoundationConditionTint = {
        value: new THREE.Color("#403725")
      };
      material.userData.guardSurfaceBlendUniform = shader.uniforms.guardSecondaryMap;
      material.userData.guardSurfaceBlendNormalUniform = shader.uniforms.guardSecondaryNormalMap;
      material.userData.guardSurfaceBlendOrmUniform = shader.uniforms.guardSecondaryOrmMap;
      material.userData.guardConditionUniform = shader.uniforms.guardConditionMap;
      material.userData.guardFoundationConditionUniform =
        shader.uniforms.guardFoundationConditionMap;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <uv_pars_vertex>",
          [
            "#include <uv_pars_vertex>",
            "attribute float guardSurfaceMix;",
            "attribute float guardMacroValue;",
            "attribute float guardConditionWeight;",
            "attribute float guardFoundationConditionWeight;",
            "varying float vGuardSurfaceMix;",
            "varying float vGuardMacroValue;",
            "varying float vGuardConditionWeight;",
            "varying float vGuardFoundationConditionWeight;"
          ].join("\n")
        )
        .replace(
          "#include <uv_vertex>",
          [
            "#include <uv_vertex>",
            "vGuardSurfaceMix = guardSurfaceMix;",
            "vGuardMacroValue = guardMacroValue;",
            "vGuardConditionWeight = guardConditionWeight;"
            ,"vGuardFoundationConditionWeight = guardFoundationConditionWeight;"
          ].join("\n")
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <map_pars_fragment>",
          [
            "#include <map_pars_fragment>",
            "uniform sampler2D guardSecondaryMap;",
            "uniform sampler2D guardSecondaryNormalMap;",
            "uniform sampler2D guardSecondaryOrmMap;",
            "uniform sampler2D guardConditionMap;",
            "uniform sampler2D guardFoundationConditionMap;",
            "uniform vec3 guardFoundationConditionTint;",
            "varying float vGuardSurfaceMix;",
            "varying float vGuardMacroValue;",
            "varying float vGuardConditionWeight;",
            "varying float vGuardFoundationConditionWeight;"
          ].join("\n")
        )
        .replace(
          "#include <map_fragment>",
          [
            "#ifdef USE_MAP",
            "  vec4 guardNatural = texture2D( map, vMapUv );",
            "  vec4 guardTraffic = texture2D( guardSecondaryMap, vMapUv );",
            "  float guardBlend = smoothstep( 0.08, 0.92, clamp( vGuardSurfaceMix, 0.0, 1.0 ) );",
            "  diffuseColor *= mix( guardNatural, guardTraffic, guardBlend );",
            "  diffuseColor.rgb *= clamp( vGuardMacroValue, 0.82, 1.12 );",
            "  vec4 guardCondition = texture2D( guardConditionMap, vMapUv * 2.35 );",
            "  float guardConditionMix = clamp( vGuardConditionWeight, 0.0, 1.0 )",
            "    * guardCondition.a;",
            "  diffuseColor.rgb = mix( diffuseColor.rgb, guardCondition.rgb, guardConditionMix );",
            "  vec4 guardFoundationCondition = texture2D(",
            "    guardFoundationConditionMap, vMapUv * 2.35 );",
            "  float guardFoundationBreakup = max(",
            "    guardFoundationCondition.a, 0.34 );",
            "  float guardFoundationConditionMix = clamp(",
            "    vGuardFoundationConditionWeight, 0.0, 1.0 )",
            "    * guardFoundationBreakup * 0.82;",
            "  diffuseColor.rgb = mix(",
            "    diffuseColor.rgb, guardFoundationConditionTint,",
            "    guardFoundationConditionMix );",
            "  float guardFoundationGrowthMix = clamp(",
            "    vGuardFoundationConditionWeight, 0.0, 1.0 )",
            "    * guardCondition.a * 0.74;",
            "  diffuseColor.rgb = mix(",
            "    diffuseColor.rgb, guardCondition.rgb,",
            "    guardFoundationGrowthMix );",
            "#endif"
          ].join("\n")
        )
        .replace(
          "#include <roughnessmap_fragment>",
          [
            "float roughnessFactor = roughness;",
            "#ifdef USE_ROUGHNESSMAP",
            "  vec4 guardNaturalOrmR = texture2D( roughnessMap, vRoughnessMapUv );",
            "  vec4 guardTrafficOrmR = texture2D( guardSecondaryOrmMap, vRoughnessMapUv );",
            "  roughnessFactor *= mix( guardNaturalOrmR, guardTrafficOrmR, guardBlend ).g;",
            "#endif"
          ].join("\n")
        )
        .replace(
          "#include <normal_fragment_maps>",
          [
            "#if defined( USE_NORMALMAP_TANGENTSPACE )",
            "  vec3 guardNaturalN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;",
            "  vec3 guardTrafficN = texture2D( guardSecondaryNormalMap, vNormalMapUv ).xyz * 2.0 - 1.0;",
            "  vec3 mapN = normalize( mix( guardNaturalN, guardTrafficN, guardBlend ) );",
            "  mapN.xy *= normalScale;",
            "  normal = normalize( tbn * mapN );",
            "#else",
            "  #include <normal_fragment_maps>",
            "#endif"
          ].join("\n")
        )
        .replace(
          "#include <aomap_fragment>",
          [
            "#ifdef USE_AOMAP",
            "  vec4 guardNaturalOrmA = texture2D( aoMap, vAoMapUv );",
            "  vec4 guardTrafficOrmA = texture2D( guardSecondaryOrmMap, vAoMapUv );",
            "  float ambientOcclusion = ( mix( guardNaturalOrmA, guardTrafficOrmA, guardBlend ).r - 1.0 ) * aoMapIntensity + 1.0;",
            "  reflectedLight.indirectDiffuse *= ambientOcclusion;",
            "  #if defined( USE_CLEARCOAT )",
            "    clearcoatSpecularIndirect *= ambientOcclusion;",
            "  #endif",
            "  #if defined( USE_SHEEN )",
            "    sheenSpecularIndirect *= ambientOcclusion;",
            "  #endif",
            "  #if defined( USE_ENVMAP ) && defined( STANDARD )",
            "    float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );",
            "    reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );",
            "  #endif",
            "#endif"
          ].join("\n")
        );
    };
    material.customProgramCacheKey = function(){ return "guard-ground-field-pbr-condition-blend-v5"; };
  }
  if(definition.conditionBlend && !definition.surfaceBlend){
    /* Architecture condition belongs in the parent fragment, not on a second shadow-casting
       polygon. Engine-authored receiver-band attributes say where the causal history exists;
       this shader only samples the generic trim and modulates the already-lit parent albedo. */
    material.userData.guardArchitectureConditionBlend =
      Object.assign({}, definition.conditionBlend);
    material.onBeforeCompile = function(shader){
      shader.uniforms.guardArchitectureConditionMap = {
        value: material.userData.guardConditionAlbedo || material.map
      };
      shader.uniforms.guardArchitectureConditionStrength = {
        value: Number.isFinite(Number(definition.conditionBlend.strength))
          ? Number(definition.conditionBlend.strength) : 0.5
      };
      shader.uniforms.guardArchitectureConditionTint = {
        value: new THREE.Color(definition.conditionBlend.tint || "#4b3825")
      };
      shader.uniforms.guardArchitectureGrowthMap = {
        value: material.userData.guardGrowthConditionAlbedo || material.map
      };
      shader.uniforms.guardArchitectureGrowthTopMap = {
        value: material.userData.guardGrowthTopConditionAlbedo
          || material.userData.guardGrowthConditionAlbedo || material.map
      };
      shader.uniforms.guardArchitectureGrowthStrength = {
        value: Number.isFinite(Number(definition.conditionBlend.growthStrength))
          ? Number(definition.conditionBlend.growthStrength) : 0
      };
      shader.uniforms.guardArchitectureGrowthTopStrength = {
        value: Number.isFinite(Number(definition.conditionBlend.growthTopStrength))
          ? Number(definition.conditionBlend.growthTopStrength)
          : Number.isFinite(Number(definition.conditionBlend.growthStrength))
            ? Number(definition.conditionBlend.growthStrength) : 0
      };
      shader.uniforms.guardArchitectureGrowthContactApron = {
        value: Number.isFinite(Number(definition.conditionBlend.growthContactApron))
          ? Number(definition.conditionBlend.growthContactApron) : 0
      };
      shader.uniforms.guardArchitectureConditionMinimumHeight = {
        value: Number.isFinite(Number(definition.conditionBlend.minimumNormalizedHeight))
          ? Number(definition.conditionBlend.minimumNormalizedHeight) : -0.32
      };
      material.userData.guardArchitectureConditionUniform =
        shader.uniforms.guardArchitectureConditionMap;
      material.userData.guardArchitectureGrowthUniform =
        shader.uniforms.guardArchitectureGrowthMap;
      material.userData.guardArchitectureGrowthTopUniform =
        shader.uniforms.guardArchitectureGrowthTopMap;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <uv_pars_vertex>",
          [
            "#include <uv_pars_vertex>",
            "attribute vec2 guardConditionUv;",
            "attribute vec2 guardConditionTopUv;",
            "attribute float guardConditionWeight;",
            "attribute float guardConditionUpward;",
            "varying vec2 vGuardConditionUv;",
            "varying vec2 vGuardConditionTopUv;",
            "varying float vGuardConditionWeight;",
            "varying float vGuardConditionUpward;"
          ].join("\n")
        )
        .replace(
          "#include <uv_vertex>",
          [
            "#include <uv_vertex>",
            "vGuardConditionUv = guardConditionUv;",
            "vGuardConditionTopUv = guardConditionTopUv;",
            "vGuardConditionWeight = guardConditionWeight;",
            "vGuardConditionUpward = guardConditionUpward;"
          ].join("\n")
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <map_pars_fragment>",
          [
            "#include <map_pars_fragment>",
            "uniform sampler2D guardArchitectureConditionMap;",
            "uniform float guardArchitectureConditionStrength;",
            "uniform vec3 guardArchitectureConditionTint;",
            "uniform sampler2D guardArchitectureGrowthMap;",
            "uniform sampler2D guardArchitectureGrowthTopMap;",
            "uniform float guardArchitectureGrowthStrength;",
            "uniform float guardArchitectureGrowthTopStrength;",
            "uniform float guardArchitectureGrowthContactApron;",
            "uniform float guardArchitectureConditionMinimumHeight;",
            "varying vec2 vGuardConditionUv;",
            "varying vec2 vGuardConditionTopUv;",
            "varying float vGuardConditionWeight;",
            "varying float vGuardConditionUpward;"
          ].join("\n")
        )
        .replace(
          "#include <map_fragment>",
          [
            "#include <map_fragment>",
            "vec4 guardArchitectureCondition = texture2D(",
            "  guardArchitectureConditionMap,",
            "  vec2(fract(vGuardConditionUv.x), clamp(vGuardConditionUv.y, 0.0, 1.0))",
            ");",
            "float guardArchitectureContactApron = 1.0 - smoothstep(",
            "  guardArchitectureConditionMinimumHeight, 0.22,",
            "  clamp(vGuardConditionUv.y, guardArchitectureConditionMinimumHeight, 1.0)",
            ");",
            "float guardArchitectureConditionCoverage = max(",
            "  guardArchitectureCondition.a, guardArchitectureContactApron * 0.92",
            ");",
            "float guardArchitectureConditionMix = guardArchitectureConditionStrength",
            "  * clamp(vGuardConditionWeight, 0.0, 1.0)",
            "  * guardArchitectureConditionCoverage",
            "  * step(guardArchitectureConditionMinimumHeight, vGuardConditionUv.y)",
            "  * step(vGuardConditionUv.y, 1.0);",
            "diffuseColor.rgb = mix(",
            "  diffuseColor.rgb, guardArchitectureConditionTint,",
            "  clamp(guardArchitectureConditionMix, 0.0, 1.0)",
            ");"
            ,"vec4 guardArchitectureVerticalGrowth = texture2D(",
            "  guardArchitectureGrowthMap,",
            "  vec2(fract(vGuardConditionUv.x), clamp(vGuardConditionUv.y, 0.0, 1.0))",
            ");",
            "vec4 guardArchitectureTopGrowth = texture2D(",
            "  guardArchitectureGrowthTopMap, fract(vGuardConditionTopUv)",
            ");",
            "float guardArchitectureUpward = clamp(vGuardConditionUpward, 0.0, 1.0);",
            "vec4 guardArchitectureGrowth = mix(",
            "  guardArchitectureVerticalGrowth, guardArchitectureTopGrowth,",
            "  guardArchitectureUpward",
            ");",
            "float guardArchitectureGrowthApron = 1.0 - smoothstep(",
            "  guardArchitectureConditionMinimumHeight, 0.18,",
            "  clamp(vGuardConditionUv.y, guardArchitectureConditionMinimumHeight, 1.0)",
            ");",
            "float guardArchitectureGrowthCoverage = max(",
            "  guardArchitectureGrowth.a,",
            "  guardArchitectureGrowthApron * guardArchitectureGrowthContactApron",
            "    * (0.42 + guardArchitectureGrowth.a * 0.58)",
            ");",
            "float guardArchitectureResolvedGrowthStrength = mix(",
            "  guardArchitectureGrowthStrength, guardArchitectureGrowthTopStrength,",
            "  guardArchitectureUpward",
            ");",
            "float guardArchitectureGrowthMix = guardArchitectureResolvedGrowthStrength",
            "  * clamp(vGuardConditionWeight, 0.0, 1.0)",
            "  * guardArchitectureGrowthCoverage",
            "  * step(guardArchitectureConditionMinimumHeight, vGuardConditionUv.y)",
            "  * step(vGuardConditionUv.y, 1.0);",
            "diffuseColor.rgb = mix(",
            "  diffuseColor.rgb, guardArchitectureGrowth.rgb,",
            "  clamp(guardArchitectureGrowthMix, 0.0, 1.0)",
            ");"
          ].join("\n")
        );
    };
    material.customProgramCacheKey = function(){
      return "guard-architecture-parent-condition-blend-v12";
    };
  }
  material.name = "guard-candidate:" + materialId;
  const maps = definition.maps || {};
  const requested = Object.keys(maps).filter(function(channel){
    return channel === "albedo" || channel === "secondaryAlbedo"
      || channel === "normal" || channel === "secondaryNormal"
      || channel === "orm" || channel === "secondaryOrm"
      || channel === "conditionAlbedo"
      || channel === "foundationConditionAlbedo"
      || channel === "growthConditionAlbedo"
      || channel === "growthTopConditionAlbedo";
  });
  const row = {
    materialId: materialId,
    state: definition.state,
    contextVerdict: definition.contextVerdict,
    requestedChannels: requested.slice(),
    loadedChannels: [],
    failedChannels: [],
    status: requested.length ? "loading" : "scalar-proxy"
  };
  context.loadRows[materialId] = row;
  context.materials.set(materialId, material);

  if(requested.length){
    Promise.allSettled(requested.map(function(channel){
      return clayGuardVisualTexture(maps[channel],
        channel === "albedo" || channel === "secondaryAlbedo"
          || channel === "conditionAlbedo"
          || channel === "foundationConditionAlbedo"
          || channel === "growthConditionAlbedo"
          || channel === "growthTopConditionAlbedo" ? "sRGB" : "linear",
        channel === "conditionAlbedo" && definition.conditionBlend
          ? "repeat-x-clamp-y" : definition.wrapMode)
        .then(function(texture){ return { channel: channel, texture: texture }; });
    })).then(function(results){
      results.forEach(function(result, index){
        const channel = requested[index];
        if(result.status === "rejected"){
          row.failedChannels.push(channel);
          return;
        }
        const texture = result.value.texture;
        row.loadedChannels.push(channel);
        if(channel === "albedo") material.map = texture;
        if(channel === "secondaryAlbedo"){
          material.userData.guardSecondaryAlbedo = texture;
          if(material.userData.guardSurfaceBlendUniform){
            material.userData.guardSurfaceBlendUniform.value = texture;
          }
        }
        if(channel === "conditionAlbedo"){
          material.userData.guardConditionAlbedo = texture;
          if(material.userData.guardConditionUniform){
            material.userData.guardConditionUniform.value = texture;
          }
          if(material.userData.guardArchitectureConditionUniform){
            material.userData.guardArchitectureConditionUniform.value = texture;
          }
        }
        if(channel === "foundationConditionAlbedo"){
          material.userData.guardFoundationConditionAlbedo = texture;
          if(material.userData.guardFoundationConditionUniform){
            material.userData.guardFoundationConditionUniform.value = texture;
          }
        }
        if(channel === "growthConditionAlbedo"){
          material.userData.guardGrowthConditionAlbedo = texture;
          if(material.userData.guardArchitectureGrowthUniform){
            material.userData.guardArchitectureGrowthUniform.value = texture;
          }
        }
        if(channel === "growthTopConditionAlbedo"){
          material.userData.guardGrowthTopConditionAlbedo = texture;
          if(material.userData.guardArchitectureGrowthTopUniform){
            material.userData.guardArchitectureGrowthTopUniform.value = texture;
          }
        }
        if(channel === "secondaryNormal"){
          material.userData.guardSecondaryNormal = texture;
          if(material.userData.guardSurfaceBlendNormalUniform){
            material.userData.guardSurfaceBlendNormalUniform.value = texture;
          }
        }
        if(channel === "secondaryOrm"){
          material.userData.guardSecondaryOrm = texture;
          if(material.userData.guardSurfaceBlendOrmUniform){
            material.userData.guardSurfaceBlendOrmUniform.value = texture;
          }
        }
        if(channel === "normal"){
          material.normalMap = texture;
          const scale = definition.normalScale == null ? 1 : definition.normalScale;
          material.normalScale = new THREE.Vector2(scale, scale);
        }
        if(channel === "orm"){
          material.aoMap = texture;
          material.aoMapIntensity = definition.aoIntensity == null ? 1 : definition.aoIntensity;
          material.roughnessMap = texture;
          material.metalnessMap = texture;
          /* ORM's blue channel owns whether a texel is metal; scalar 1 lets that authored channel
             pass. A stone ORM remains non-metal because its blue channel is black. */
          material.metalness = 1;
        }
        /* Wall-face module materials are per-face clones because each wall has its own authored
           compositor output. Texture loads are asynchronous, so propagate parent PBR channels to
           clones instead of letting an early compile freeze them as scalar-only materials. */
        (material.userData.guardWallModuleDerivatives || []).forEach(function(derived){
          if(channel === "albedo") derived.map = texture;
          if(channel === "normal"){
            derived.normalMap = texture;
            derived.normalScale.copy(material.normalScale);
          }
          if(channel === "orm"){
            derived.aoMap = texture;
            derived.aoMapIntensity = material.aoMapIntensity;
            derived.roughnessMap = texture;
            derived.metalnessMap = texture;
            derived.metalness = material.metalness;
          }
          derived.needsUpdate = true;
        });
      });
      row.status = row.failedChannels.indexOf("albedo") >= 0
        ? "albedo-failed:truthful-scalar-proxy"
        : (row.failedChannels.length ? "partial-channel-fallback" : "loaded-candidate");
      material.needsUpdate = true;
      markDirty(); scheduleRender();
    });
  }
  return material;
}

/* WALL FACE MODULE COMPOSITOR · renderer half of WallFaceModuleCompilerV1.
   The engine supplies physical wall extents, a construction datum, deterministic W5H5 choices,
   and real aperture coordinates. This compositor is intentionally blind to guardrooms and combat:
   it only paints the declared visual layers into one nearest-sampled albedo overlay. */
const CLAY_GUARD_WALL_MODULE_TEXTURE_CACHE = new Map();
const CLAY_GUARD_WALL_MODULE_MATERIAL_CACHE = new Map();
const CLAY_GUARD_WALL_RELIEF_IMAGE_CACHE = new Map();

function clayGuardWallReliefImage(source, callback){
  if(!source || typeof callback !== "function") return;
  const cached = CLAY_GUARD_WALL_RELIEF_IMAGE_CACHE.get(source);
  if(cached && cached.status === "loaded"){
    callback(cached.image);
    return;
  }
  if(cached){
    cached.callbacks.push(callback);
    return;
  }
  const row = { status: "loading", image: new Image(), callbacks: [callback] };
  CLAY_GUARD_WALL_RELIEF_IMAGE_CACHE.set(source, row);
  row.image.onload = function(){
    row.status = "loaded";
    row.callbacks.splice(0).forEach(function(fn){ fn(row.image); });
  };
  row.image.onerror = function(){
    row.status = "failed";
    row.callbacks.length = 0;
  };
  row.image.src = source;
}

function clayGuardWallModuleTexture(facePlan, cultureId){
  if(!facePlan || !facePlan.moduleGrid) return null;
  const expressionProfile =
    facePlan.authoredExpressionProfile || "authored-pixel-standard";
  const boldExpression = expressionProfile === "authored-pixel-bold";
  const key = facePlan.fingerprint + "|" + (cultureId || "neutral")
    + "|" + expressionProfile;
  if(CLAY_GUARD_WALL_MODULE_TEXTURE_CACHE.has(key)){
    return CLAY_GUARD_WALL_MODULE_TEXTURE_CACHE.get(key);
  }
  const ppf = Math.max(8, Number(facePlan.moduleGrid.pixelsPerFoot) || 32);
  const width = Math.max(1,
    Math.round(Number(facePlan.physicalExtent.lengthFeet) * ppf));
  const height = Math.max(1,
    Math.round(Number(facePlan.physicalExtent.heightFeet) * ppf));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: true });
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, width, height);
  const px = function(feet){ return Math.round(feet * ppf); };
  const canvasY = function(feet){ return height - px(feet); };
  const fillRectFeet = function(x, y, w, h, color){
    context.fillStyle = color;
    context.fillRect(px(x), canvasY(y + h), Math.max(1, px(w)), Math.max(1, px(h)));
  };

  /* Quiet modules are authored rhythm, not random dirt. The bold profile makes the same governed
     pixel clusters survive the gameplay camera through stronger value separation and a slightly
     broader silhouette; it does not change their location, module envelope, or mechanics. */
  (facePlan.slots || []).forEach(function(slot){
    if(slot.variant !== "quiet-W5H5"
        && slot.variant.indexOf("quiet-W5H10:") !== 0) return;
    const x = slot.column * 5;
    const y = slot.row * 5;
    fillRectFeet(x + 0.42, y + 0.86,
      boldExpression ? 0.82 : 0.56, boldExpression ? 0.15625 : 0.09375,
      boldExpression ? "rgba(49,42,37,0.82)" : "rgba(58,50,44,0.58)");
    fillRectFeet(x + 1.78, y + 2.78,
      boldExpression ? 1.12 : 0.82, boldExpression ? 0.15625 : 0.09375,
      boldExpression ? "rgba(247,224,183,0.72)" : "rgba(241,221,188,0.46)");
    fillRectFeet(x + 3.46, y + 3.88,
      boldExpression ? 0.68 : 0.42, boldExpression ? 0.1875 : 0.125,
      boldExpression ? "rgba(55,47,41,0.76)" : "rgba(67,57,49,0.52)");
    if(boldExpression){
      fillRectFeet(x + 0.62, y + 1.02, 0.21875, 0.21875, "rgba(38,34,31,0.72)");
      fillRectFeet(x + 2.42, y + 2.58, 0.3125, 0.15625, "rgba(255,231,190,0.58)");
      fillRectFeet(x + 3.72, y + 4.06, 0.21875, 0.25, "rgba(42,37,34,0.68)");
    }
  });

  /* Aperture surrounds follow exact engine openings, including non-grid-aligned widths. The
     continuous trim is assembled from a fixed pixel palette at the governed pixels-per-foot
     density; it never fills the aperture and therefore cannot contradict geometry truth. */
  (facePlan.apertures || []).forEach(function(aperture){
    const left = aperture.stationFeet - aperture.widthFeet / 2;
    const bottom = aperture.bottomFeet;
    const trim = (aperture.kind === "controlled-door" ? 0.46 : 0.56)
      * (boldExpression ? 1.12 : 1);
    const outerLeft = left - trim;
    const outerBottom = Math.max(0, bottom - trim);
    const outerWidth = aperture.widthFeet + trim * 2;
    const outerHeight = aperture.heightFeet + trim + (bottom > 0 ? trim : 0);
    const dark = "rgba(49,42,37,0.88)";
    const mid = "rgba(166,143,112,0.98)";
    const light = "rgba(242,218,176,1)";
    const shadow = boldExpression ? 0.22 : 0.16;
    fillRectFeet(outerLeft - shadow, outerBottom,
      trim + shadow, outerHeight, dark);
    fillRectFeet(left + aperture.widthFeet, outerBottom,
      trim + shadow, outerHeight, dark);
    fillRectFeet(outerLeft - shadow, bottom + aperture.heightFeet,
      outerWidth + shadow * 2, trim + shadow, dark);
    if(bottom > 0){
      fillRectFeet(outerLeft - shadow, outerBottom,
        outerWidth + shadow * 2, trim + shadow, dark);
    }
    fillRectFeet(outerLeft, outerBottom, trim, outerHeight, mid);
    fillRectFeet(left + aperture.widthFeet, outerBottom, trim, outerHeight, mid);
    fillRectFeet(outerLeft, bottom + aperture.heightFeet,
      outerWidth, trim, mid);
    if(bottom > 0) fillRectFeet(outerLeft, outerBottom, outerWidth, trim, mid);
    fillRectFeet(outerLeft + 0.08, outerBottom, 0.125, outerHeight, light);
    fillRectFeet(left + aperture.widthFeet + 0.08, outerBottom,
      0.125, outerHeight, light);
    fillRectFeet(outerLeft, bottom + aperture.heightFeet + trim - 0.14,
      outerWidth, 0.14, light);
  });

  /* Endpoint treatments come from shared wall-run topology. They are therefore allowed to close a
     real isolated end, turn a real miter, or mark a real junction—but never invent one. These are
     surface transitions over architecture-owned closed geometry, not duplicate corner prisms. */
  const faceLength = Number(facePlan.physicalExtent.lengthFeet);
  const faceHeight = Number(facePlan.physicalExtent.heightFeet);
  (facePlan.topologyEdges || []).forEach(function(edge){
    if(edge.socketKind === "seamless-continuation") return;
    const upland = cultureId === "upland-vernacular";
    const atLeft = edge.side === "left";
    const baseWidth = edge.socketKind === "multi-run-junction" ? 0.72
      : edge.socketKind === "matched-miter-corner" ? 0.46 : 0.3;
    const edgeX = atLeft ? 0 : faceLength - baseWidth;
    const dark = upland ? "rgba(79,48,29,0.9)" : "rgba(55,49,44,0.88)";
    const mid = upland ? "rgba(165,105,43,0.92)" : "rgba(190,169,132,0.9)";
    const light = upland ? "rgba(222,158,63,0.74)" : "rgba(242,221,181,0.78)";
    fillRectFeet(edgeX, 0, baseWidth, faceHeight, dark);
    for(let course = 0; course < Math.ceil(faceHeight); course++){
      const courseHeight = Math.min(0.82, faceHeight - course);
      if(courseHeight <= 0) continue;
      const inset = course % 2 === 0 ? 0.07 : 0.14;
      const blockWidth = Math.max(0.12, baseWidth - inset);
      fillRectFeet(atLeft ? edgeX + inset : edgeX,
        course + 0.08, blockWidth, courseHeight, mid);
      fillRectFeet(atLeft ? edgeX + inset : edgeX + blockWidth - 0.08,
        course + 0.12, 0.08, Math.max(0.1, courseHeight - 0.16), light);
    }
  });

  /* Partial modules preserve parent bond and physical texel density. Only their true exterior
     boundary receives a cropped closure accent; there is deliberately no line at the internal
     5-ft solver boundary, which would expose implementation rather than construction. */
  if(facePlan.remainder && facePlan.remainder.widthFeet > 0){
    const rightEdge = Math.max(0, faceLength - 0.18);
    fillRectFeet(rightEdge, 0, 0.18, faceHeight, "rgba(54,48,43,0.66)");
    for(let course = 0; course < Math.ceil(faceHeight); course += 2){
      fillRectFeet(rightEdge - 0.18, course + 0.14, 0.18,
        Math.min(0.58, faceHeight - course - 0.14), "rgba(232,210,173,0.62)");
    }
  }
  if(facePlan.remainder && facePlan.remainder.heightFeet > 0){
    const topEdge = Math.max(0, faceHeight - 0.18);
    fillRectFeet(0, topEdge, faceLength, 0.18, "rgba(57,50,44,0.62)");
  }

  /* Construction-history modules require an explicit fact reference from the caller. A repair
     infill and a storey band are authored visual readings of those facts, never random ageing. */
  (facePlan.authoredFeatures || []).forEach(function(feature){
    const left = Math.max(0, feature.stationFeet - feature.widthFeet / 2);
    const bottom = Math.max(0, feature.bottomFeet);
    const featureWidth = Math.min(feature.widthFeet, faceLength - left);
    const featureHeight = Math.min(feature.heightFeet, faceHeight - bottom);
    if(featureWidth <= 0 || featureHeight <= 0) return;
    if(feature.kind === "repair-infill"){
      fillRectFeet(left, bottom, featureWidth, featureHeight, "rgba(59,50,42,0.88)");
      fillRectFeet(left + 0.12, bottom + 0.12,
        Math.max(0.1, featureWidth - 0.24), Math.max(0.1, featureHeight - 0.24),
        "rgba(177,137,88,0.94)");
      for(let y = bottom + 0.34; y < bottom + featureHeight - 0.12; y += 0.72){
        fillRectFeet(left + 0.12, y, Math.max(0.1, featureWidth - 0.24), 0.1,
          "rgba(83,62,45,0.78)");
      }
      fillRectFeet(left + 0.22, bottom + 0.22, 0.12,
        Math.max(0.1, featureHeight - 0.44), "rgba(231,190,125,0.62)");
    } else if(feature.kind === "storey-band"){
      fillRectFeet(left, bottom, featureWidth, featureHeight, "rgba(54,47,42,0.9)");
      fillRectFeet(left, bottom + featureHeight * 0.24,
        featureWidth, featureHeight * 0.54, "rgba(183,156,116,0.94)");
      fillRectFeet(left, bottom + featureHeight * 0.68,
        featureWidth, Math.max(0.08, featureHeight * 0.16), "rgba(243,218,177,0.86)");
    }
  });

  /* Culture supplies attachment practice; fixture world truth supplies placeholder content.
     This first surface feature is deliberately noncanonical and nonmechanical. */
  if(facePlan.cultureFeature){
    const door = (facePlan.apertures || []).find(function(aperture){
      return aperture.kind === "controlled-door";
    });
    const center = door ? door.stationFeet
      : Number(facePlan.physicalExtent.lengthFeet) * 0.5;
    const top = Math.min(Number(facePlan.physicalExtent.heightFeet) - 0.45,
      door ? door.bottomFeet + door.heightFeet + 2.35 : 8.8);
    if(facePlan.cultureFeature.medium === "dressed-stone-heraldic-inset"){
      fillRectFeet(center - 0.92, top - 1.72, 1.84, 1.5, "rgba(55,46,42,0.92)");
      fillRectFeet(center - 0.76, top - 1.56, 1.52, 1.18, "rgba(205,178,132,0.98)");
      fillRectFeet(center - 0.14, top - 1.42, 0.28, 0.16, "rgba(139,38,49,1)");
      fillRectFeet(center - 0.34, top - 1.26, 0.68, 0.18, "rgba(139,38,49,1)");
      fillRectFeet(center - 0.54, top - 1.08, 1.08, 0.22, "rgba(139,38,49,1)");
      fillRectFeet(center - 0.34, top - 0.86, 0.68, 0.18, "rgba(139,38,49,1)");
      fillRectFeet(center - 0.14, top - 0.68, 0.28, 0.16, "rgba(139,38,49,1)");
    } else {
      fillRectFeet(center - 1.02, top - 1.58, 0.24, 1.3, "rgba(139,78,27,0.96)");
      fillRectFeet(center + 0.78, top - 1.58, 0.24, 1.3, "rgba(139,78,27,0.96)");
      fillRectFeet(center - 0.78, top - 1.42, 1.56, 0.22, "rgba(191,128,35,0.94)");
      fillRectFeet(center - 0.56, top - 1.06, 1.12, 0.3, "rgba(115,38,31,0.94)");
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.flipY = true;
  texture.needsUpdate = true;
  texture.userData.guardWallFaceModule = {
    compiler: "WallFaceModuleCompilerV1",
    facePlanFingerprint: facePlan.fingerprint,
    pixelsPerFoot: ppf,
    pixelSize: [width, height],
    authoredExpressionProfile: expressionProfile,
    layers: (facePlan.layers || []).slice(),
    mechanicalEffect: "none"
  };
  if(facePlan.cultureRelief && facePlan.cultureRelief.source){
    clayGuardWallReliefImage(facePlan.cultureRelief.source, function(image){
      const relief = facePlan.cultureRelief;
      const crop = relief.sourceCropPx;
      const envelope = relief.physicalEnvelopeFeet;
      if(!crop || !envelope) return;
      const panelWidth = Math.min(Number(envelope.width) || 5,
        Number(facePlan.physicalExtent.lengthFeet));
      const panelHeight = Math.min(Number(envelope.height) || 3,
        Number(facePlan.physicalExtent.heightFeet));
      const panelBottom = Math.max(0.5,
        Number(facePlan.physicalExtent.heightFeet) - panelHeight - 1.25);
      context.save();
      context.imageSmoothingEnabled = false;
      const panelCount = Math.min(
        Math.max(0, Number(relief.maximumPerFace) || 0),
        Math.floor(Number(facePlan.physicalExtent.lengthFeet) / panelWidth));
      const runWidth = panelCount * panelWidth;
      const panelStart = Math.max(0,
        (Number(facePlan.physicalExtent.lengthFeet) - runWidth) / 2);
      for(let panelIndex = 0; panelIndex < panelCount; panelIndex++){
        context.drawImage(image,
          crop.x, crop.y, crop.width, crop.height,
          px(panelStart + panelIndex * panelWidth),
          canvasY(panelBottom + panelHeight),
          Math.max(1, px(panelWidth)), Math.max(1, px(panelHeight)));
      }
      context.restore();
      texture.needsUpdate = true;
      texture.userData.guardWallFaceModule.authoredReliefSource = relief.source;
      markDirty();
      scheduleRender();
    });
  }
  CLAY_GUARD_WALL_MODULE_TEXTURE_CACHE.set(key, texture);
  return texture;
}

function clayGuardWallModuleMaterial(baseMaterial, facePlan, cultureId){
  if(!baseMaterial || !facePlan) return baseMaterial;
  const key = baseMaterial.uuid + "|" + facePlan.fingerprint + "|" + (cultureId || "neutral");
  if(CLAY_GUARD_WALL_MODULE_MATERIAL_CACHE.has(key)){
    return CLAY_GUARD_WALL_MODULE_MATERIAL_CACHE.get(key);
  }
  const overlay = clayGuardWallModuleTexture(facePlan, cultureId);
  const material = baseMaterial.clone();
  const parentCompile = baseMaterial.onBeforeCompile;
  const compileState = {
    called: false,
    hadUvVertexChunk: false,
    hadAlphaMapChunk: false,
    injectedVertex: false,
    injectedFragment: false,
    injectedFeatureNormal: false,
    injectedFeatureRoughness: false
  };
  material.onBeforeCompile = function(shader, renderer){
    compileState.called = true;
    if(parentCompile) parentCompile.call(material, shader, renderer);
    compileState.hadUvVertexChunk =
      shader.vertexShader.indexOf("#include <uv_vertex>") >= 0;
    compileState.hadAlphaMapChunk =
      shader.fragmentShader.indexOf("#include <alphamap_fragment>") >= 0;
    shader.uniforms.guardWallModuleMap = { value: overlay };
    shader.uniforms.guardWallModuleTexelSize = {
      value: new THREE.Vector2(
        1 / Math.max(1, overlay.image.width),
        1 / Math.max(1, overlay.image.height))
    };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <uv_pars_vertex>",
        [
          "#include <uv_pars_vertex>",
          "attribute vec2 guardWallModuleUv;",
          "attribute float guardWallModuleWeight;",
          "varying vec2 vGuardWallModuleUv;",
          "varying float vGuardWallModuleWeight;"
        ].join("\n")
      )
      .replace(
        "#include <uv_vertex>",
        [
          "#include <uv_vertex>",
          "vGuardWallModuleUv = guardWallModuleUv;",
          "vGuardWallModuleWeight = guardWallModuleWeight;"
        ].join("\n")
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <map_pars_fragment>",
        [
          "#include <map_pars_fragment>",
          "uniform sampler2D guardWallModuleMap;",
          "uniform vec2 guardWallModuleTexelSize;",
          "varying vec2 vGuardWallModuleUv;",
          "varying float vGuardWallModuleWeight;"
        ].join("\n")
      )
      .replace(
        "#include <alphamap_fragment>",
        [
          "vec4 guardWallModule = texture2D(",
          "  guardWallModuleMap, clamp(vGuardWallModuleUv, 0.0, 1.0));",
          "float guardWallModuleMix = guardWallModule.a",
          "  * clamp(vGuardWallModuleWeight, 0.0, 1.0);",
          "diffuseColor.rgb = mix(",
          "  diffuseColor.rgb, guardWallModule.rgb, guardWallModuleMix);",
          "#include <alphamap_fragment>"
        ].join("\n")
      )
      .replace(
        "#include <roughnessmap_fragment>",
        [
          "#include <roughnessmap_fragment>",
          "float guardWallFeaturePbrWeight = guardWallModule.a",
          "  * clamp(vGuardWallModuleWeight, 0.0, 1.0);",
          "roughnessFactor = mix(",
          "  roughnessFactor, 0.76, guardWallFeaturePbrWeight * 0.34);"
        ].join("\n")
      )
      .replace(
        "#include <normal_fragment_maps>",
        [
          "#include <normal_fragment_maps>",
          "#if defined( USE_NORMALMAP_TANGENTSPACE )",
          "  vec2 guardWallUv = clamp(vGuardWallModuleUv, 0.0, 1.0);",
          "  float guardWallAlphaL = texture2D(guardWallModuleMap,",
          "    clamp(guardWallUv - vec2(guardWallModuleTexelSize.x, 0.0), 0.0, 1.0)).a;",
          "  float guardWallAlphaR = texture2D(guardWallModuleMap,",
          "    clamp(guardWallUv + vec2(guardWallModuleTexelSize.x, 0.0), 0.0, 1.0)).a;",
          "  float guardWallAlphaD = texture2D(guardWallModuleMap,",
          "    clamp(guardWallUv - vec2(0.0, guardWallModuleTexelSize.y), 0.0, 1.0)).a;",
          "  float guardWallAlphaU = texture2D(guardWallModuleMap,",
          "    clamp(guardWallUv + vec2(0.0, guardWallModuleTexelSize.y), 0.0, 1.0)).a;",
          "  vec3 guardWallFeatureNormal = normalize(vec3(",
          "    (guardWallAlphaL - guardWallAlphaR) * 2.1,",
          "    (guardWallAlphaD - guardWallAlphaU) * 2.1, 1.0));",
          "  vec3 guardWallFeatureWorldNormal = normalize(tbn * guardWallFeatureNormal);",
          "  normal = normalize(mix(normal, guardWallFeatureWorldNormal,",
          "    guardWallFeaturePbrWeight * 0.42));",
          "#endif"
        ].join("\n")
      );
    compileState.injectedVertex =
      shader.vertexShader.indexOf("vGuardWallModuleUv = guardWallModuleUv") >= 0;
    compileState.injectedFragment =
      shader.fragmentShader.indexOf("guardWallModuleMix") >= 0;
    compileState.injectedFeatureNormal =
      shader.fragmentShader.indexOf("guardWallFeatureNormal") >= 0;
    compileState.injectedFeatureRoughness =
      shader.fragmentShader.indexOf("guardWallFeaturePbrWeight") >= 0;
  };
  material.customProgramCacheKey = function(){
    return "guard-wall-face-modules-v1|" + facePlan.fingerprint;
  };
  material.name = baseMaterial.name + ":wall-modules:" + facePlan.wallRunId;
  material.userData.guardWallFaceModule = Object.assign(
    {}, overlay.userData.guardWallFaceModule, {
      wallRunId: facePlan.wallRunId,
      normalOrmStatus:
        "feature-alpha-derived-tangent-normal-and-roughness-over-parent-normal-orm"
    });
  material.userData.guardWallModuleCompileState = compileState;
  if(!baseMaterial.userData.guardWallModuleDerivatives){
    baseMaterial.userData.guardWallModuleDerivatives = [];
  }
  baseMaterial.userData.guardWallModuleDerivatives.push(material);
  CLAY_GUARD_WALL_MODULE_MATERIAL_CACHE.set(key, material);
  return material;
}

function clayGuardWallModuleAttributes(
  geometry, matrix, facePlan, worldCenter, sceneBaseY, materialDefinition
){
  if(!geometry || !facePlan || !facePlan.constructionDatum) return null;
  if(!geometry.attributes.normal) geometry.computeVertexNormals();
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const uvValues = new Float32Array(position.count * 2);
  const weights = new Float32Array(position.count);
  const point = new THREE.Vector3();
  const faceNormal = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
  const datum = facePlan.constructionDatum;
  const startX = worldCenter.x + datum.start.x;
  const startZ = worldCenter.z + datum.start.z;
  const base = sceneBaseY + datum.baseY;
  const axisX = datum.axis.x;
  const axisZ = datum.axis.z;
  const length = Math.max(0.001, facePlan.physicalExtent.lengthWorldUnits);
  const height = Math.max(0.001, facePlan.physicalExtent.heightWorldUnits);
  const faceLocalModuleFeet = materialDefinition
    && Number(materialDefinition.faceLocalModuleFeet) > 0
    ? Number(materialDefinition.faceLocalModuleFeet) : null;
  const faceLocalRepeatWorldUnits = faceLocalModuleFeet
    ? faceLocalModuleFeet / 5 : null;
  const parentUv = geometry.attributes.uv;
  let activeVertices = 0;
  for(let i = 0; i < position.count; i++){
    point.fromBufferAttribute(position, i).applyMatrix4(matrix);
    faceNormal.fromBufferAttribute(normal, i).applyNormalMatrix(normalMatrix).normalize();
    const station = (point.x - startX) * axisX + (point.z - startZ) * axisZ;
    const vertical = point.y - base;
    uvValues[i * 2] = station / length;
    uvValues[i * 2 + 1] = vertical / height;
    const axisDot = Math.abs(faceNormal.x * axisX + faceNormal.z * axisZ);
    const active = Math.abs(faceNormal.y) < 0.5 && axisDot < 0.5;
    weights[i] = active ? 1 : 0;
    if(active){
      activeVertices++;
      if(parentUv && faceLocalRepeatWorldUnits){
        parentUv.setXY(
          i,
          station / faceLocalRepeatWorldUnits,
          vertical / faceLocalRepeatWorldUnits
        );
      }
    }
  }
  if(parentUv && faceLocalRepeatWorldUnits){
    parentUv.needsUpdate = true;
    geometry.setAttribute("uv1", parentUv.clone());
  }
  geometry.setAttribute("guardWallModuleUv",
    new THREE.Float32BufferAttribute(uvValues, 2));
  geometry.setAttribute("guardWallModuleWeight",
    new THREE.Float32BufferAttribute(weights, 1));
  return {
    wallRunId: facePlan.wallRunId,
    facePlanFingerprint: facePlan.fingerprint,
    activeVertices: activeVertices,
    vertexCount: position.count,
    parentUvMode: faceLocalRepeatWorldUnits
      ? "face-local-construction-datum" : "existing-parent-projection",
    parentModuleFeet: faceLocalModuleFeet,
    constructionDatum: Object.assign({}, facePlan.constructionDatum),
    mechanicalEffect: "none"
  };
}

/* Dominant-planar, world-locked UVs retain the sprite tile's authored pixels while adjacent
   fragments share phase. The supplied matrix is the mesh's immutable authored transform, not a
   camera matrix, so quarter turns cannot alter selection, scale, or orientation. */
function clayGuardVisualUvProject(geometry, matrix, definition, projectionIdentity){
  if(!geometry || !geometry.attributes || !geometry.attributes.position || !definition) return null;
  if(!geometry.attributes.normal) geometry.computeVertexNormals();
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  let uv = geometry.attributes.uv;
  if(!uv || uv.count !== position.count){
    uv = new THREE.Float32BufferAttribute(new Float32Array(position.count * 2), 2);
    geometry.setAttribute("uv", uv);
  }
  const metersPerWorldUnit = definition.metersPerWorldUnit || 1.65;
  const worldUnitsPerRepeatX = Math.max(0.05,
    definition.worldUnitsPerRepeatX
      || (definition.metersPerRepeatX || definition.metersPerRepeat || 1.65)
        / metersPerWorldUnit);
  const worldUnitsPerRepeatY = Math.max(0.05,
    definition.worldUnitsPerRepeatY
      || (definition.metersPerRepeatY || definition.metersPerRepeat || 1.65)
        / metersPerWorldUnit);
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
  const point = new THREE.Vector3();
  const faceNormal = new THREE.Vector3();
  const edgeLocal = definition.projection === "edge-local-planar";
  const receiverLocal = definition.projection === "receiver-local-decal";
  const trimLocal = definition.projection === "receiver-local-trim";
  const localProjection = edgeLocal || receiverLocal || trimLocal;
  let edgePhase = 0;
  let localMin = null;
  let localExtent = null;
  if(localProjection){
    geometry.computeBoundingBox();
    localMin = geometry.boundingBox.min;
    localExtent = new THREE.Vector3().subVectors(
      geometry.boundingBox.max, geometry.boundingBox.min);
    if(edgeLocal){
      const identity = String(projectionIdentity || definition.id || "edge-condition");
      let hash = 2166136261;
      for(let i = 0; i < identity.length; i++){
        hash ^= identity.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      edgePhase = (hash >>> 0) / 4294967296;
    }
  }
  for(let i = 0; i < position.count; i++){
    point.fromBufferAttribute(position, i);
    faceNormal.fromBufferAttribute(normal, i);
    if(!localProjection){
      point.applyMatrix4(matrix);
      faceNormal.applyNormalMatrix(normalMatrix).normalize();
    }
    const ax = Math.abs(faceNormal.x), ay = Math.abs(faceNormal.y), az = Math.abs(faceNormal.z);
    let u, v;
    if(localProjection){
      const nx = (point.x - localMin.x) / Math.max(0.0001, localExtent.x);
      const ny = (point.y - localMin.y) / Math.max(0.0001, localExtent.y);
      const nz = (point.z - localMin.z) / Math.max(0.0001, localExtent.z);
      if(ay >= ax && ay >= az){
        u = trimLocal
          ? (point.x - localMin.x) / Math.max(0.0001, definition.repeatWorldLength || 1)
          : nx + edgePhase;
        v = nz;
      } else if(ax >= az){
        u = trimLocal
          ? (point.z - localMin.z) / Math.max(0.0001, definition.repeatWorldLength || 1)
          : nz + edgePhase;
        v = ny;
      } else {
        u = trimLocal
          ? (point.x - localMin.x) / Math.max(0.0001, definition.repeatWorldLength || 1)
          : nx + edgePhase;
        v = ny;
      }
    } else {
      if(ay >= ax && ay >= az){
        u = point.x / worldUnitsPerRepeatX;
        v = point.z / worldUnitsPerRepeatX;
      } else if(ax >= az){
        u = point.z / worldUnitsPerRepeatX;
        v = point.y / worldUnitsPerRepeatY;
      } else {
        u = point.x / worldUnitsPerRepeatX;
        v = point.y / worldUnitsPerRepeatY;
      }
    }
    if(definition.atlasSlot){
      const slot = definition.atlasSlot;
      const textureSizePx = Math.max(1, Number(slot.textureSizePx) || 512);
      const sampleInset = Math.max(0, Number(slot.sampleInsetPx) || 0) / textureSizePx;
      /* Atlas coordinates name a closed semantic rectangle, but sampling the exact rectangle
         boundary is not closed: the GPU may choose the neighbouring texel. That previously let
         seam moss leak into the bottom row of the grime trim and let adjacent condition cards show
         at corner seams. Inset clamped axes to texel centres. The grime slot alone spans the full
         atlas width and repeats in X, so its periodic U seam remains un-inset while V is still
         protected from the row below. */
      const repeatFullAtlasX = trimLocal
        && definition.wrapMode === "repeat-x-clamp-y"
        && Math.abs(slot.u) < 0.000001
        && Math.abs(slot.w - 1) < 0.000001;
      u = repeatFullAtlasX
        ? slot.u + u * slot.w
        : slot.u + sampleInset + u * Math.max(0, slot.w - sampleInset * 2);
      v = slot.v + sampleInset + v * Math.max(0, slot.h - sampleInset * 2);
    }
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;
  geometry.setAttribute("uv1", uv.clone());
  return clayRoomMaterialUvBounds(geometry);
}

function clayGuardArchitectureConditionAttributes(
  geometry, matrix, band, sceneBaseY, definition, terrainHeightAt
){
  const position = geometry && geometry.attributes && geometry.attributes.position;
  if(!position || !definition || !definition.conditionBlend) return null;
  if(!geometry.attributes.normal) geometry.computeVertexNormals();
  const normal = geometry.attributes.normal;
  const uvValues = new Float32Array(position.count * 2);
  const topUvValues = new Float32Array(position.count * 2);
  const weights = new Float32Array(position.count);
  const upwardWeights = new Float32Array(position.count);
  const point = new THREE.Vector3();
  const faceNormal = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
  const rootY = band ? sceneBaseY + Number(band.rootY || 0) : 0;
  const rise = band ? Math.max(0.04, Number(band.riseWorldHeight) || 0.7) : 1;
  const repeat = band
    ? Math.max(0.05, Number(band.horizontalRepeatWorldLength) || 3.3) : 1;
  let activeVertices = 0;
  let activeVerticalVertices = 0;
  let activeUpwardVertices = 0;
  let minimumLocalHeight = Infinity;
  let maximumLocalHeight = -Infinity;
  for(let i = 0; i < position.count; i++){
    point.fromBufferAttribute(position, i).applyMatrix4(matrix);
    faceNormal.fromBufferAttribute(normal, i)
      .applyNormalMatrix(normalMatrix).normalize();
    const verticalFace = Math.abs(faceNormal.y) < 0.5;
    const upwardSupportFace = faceNormal.y > 0.5;
    const terrainRoot = band && band.rootMode === "terrain-contact-line"
      && terrainHeightAt ? terrainHeightAt(point.x, point.z) : null;
    const resolvedRootY = Number.isFinite(terrainRoot) ? terrainRoot : rootY;
    const localHeight = point.y - resolvedRootY;
    minimumLocalHeight = Math.min(minimumLocalHeight, localHeight);
    maximumLocalHeight = Math.max(maximumLocalHeight, localHeight);
    /* Per-vertex band membership fails on an embedded face: buried bottom vertices are disabled
       while exposed top vertices are enabled, so interpolation weakens or inverts the mask at the
       actual contact. The complete governed vertical face is a receiver; the fragment shader
       clips the interpolated local-height coordinate to the authored band. */
    const includeUpwardSupport = band
      && band.receiverFaceMode === "vertical-and-upward-support";
    const active = !!band && (verticalFace
      || (includeUpwardSupport && upwardSupportFace));
    const horizontal = Math.abs(faceNormal.x) >= Math.abs(faceNormal.z)
      ? point.z : point.x;
    uvValues[i * 2] = horizontal / repeat;
    uvValues[i * 2 + 1] = localHeight / rise;
    topUvValues[i * 2] = point.x / repeat;
    topUvValues[i * 2 + 1] = point.z / repeat;
    weights[i] = active ? 1 : 0;
    upwardWeights[i] = includeUpwardSupport && upwardSupportFace ? 1 : 0;
    if(active){
      activeVertices++;
      if(verticalFace) activeVerticalVertices++;
      if(upwardSupportFace) activeUpwardVertices++;
    }
  }
  geometry.setAttribute("guardConditionUv",
    new THREE.Float32BufferAttribute(uvValues, 2));
  geometry.setAttribute("guardConditionTopUv",
    new THREE.Float32BufferAttribute(topUvValues, 2));
  geometry.setAttribute("guardConditionWeight",
    new THREE.Float32BufferAttribute(weights, 1));
  geometry.setAttribute("guardConditionUpward",
    new THREE.Float32BufferAttribute(upwardWeights, 1));
  return {
    bandId: band ? band.id : null,
    activeVertices: activeVertices,
    activeVerticalVertices: activeVerticalVertices,
    activeUpwardVertices: activeUpwardVertices,
    vertexCount: position.count,
    rootY: band ? band.rootY : null,
    rootMode: band ? band.rootMode || "authored-flat-datum" : null,
    receiverFaceMode: band ? band.receiverFaceMode || "vertical-only" : null,
    riseWorldHeight: band ? band.riseWorldHeight : null,
    horizontalRepeatWorldLength: band ? band.horizontalRepeatWorldLength : null,
    horizontalPhaseLaw:
      "world-distance-on-dominant-face-axis; continuous-across-split-members; repeat-not-stretch",
    minimumLocalHeight: Number.isFinite(minimumLocalHeight) ? minimumLocalHeight : null,
    maximumLocalHeight: Number.isFinite(maximumLocalHeight) ? maximumLocalHeight : null
  };
}

function clayGuardGroundHash(ix, iz, seed){
  let value = Math.imul((ix | 0) ^ (seed | 0), 0x45d9f3b);
  value = Math.imul(value ^ (iz | 0), 0x27d4eb2d);
  value ^= value >>> 15;
  return (value >>> 0) / 4294967295;
}

function clayGuardGroundMacroValue(wx, wz, seed, scale, strength){
  const fieldScale = Math.max(1, scale || 7.5);
  const fx = wx / fieldScale, fz = wz / fieldScale;
  const ix = Math.floor(fx), iz = Math.floor(fz);
  let tx = fx - ix, tz = fz - iz;
  tx = tx * tx * (3 - 2 * tx);
  tz = tz * tz * (3 - 2 * tz);
  const a = clayGuardGroundHash(ix, iz, seed);
  const b = clayGuardGroundHash(ix + 1, iz, seed);
  const c = clayGuardGroundHash(ix, iz + 1, seed);
  const d = clayGuardGroundHash(ix + 1, iz + 1, seed);
  const top = a + (b - a) * tx;
  const bottom = c + (d - c) * tx;
  const noise = top + (bottom - top) * tz;
  return 1 + (noise - 0.5) * 2 * Math.max(0, strength || 0);
}

/* The committed surface vocabulary becomes one continuous scalar field at geometry vertices.
   Cell centres remain exact (road=1, substrate=0); shared edges interpolate to the same value from
   either side, so the shoulder cannot expose a one-cell zipper or choose a random material per
   tile. The separate macro channel is also world-continuous and seed-stable. */
function clayGuardVisualSurfaceAttributes(geometry, field, cell, cx, cz, context, definition){
  const blend = definition && definition.surfaceBlend;
  const position = geometry && geometry.attributes && geometry.attributes.position;
  if(!blend || !position || !field || !cell) return null;
  const secondary = new Set(blend.secondarySurfaces || []);
  const width = field.extent.x, height = field.extent.y;
  const indicator = function(ix, iz){
    const x = Math.max(0, Math.min(width - 1, ix));
    const z = Math.max(0, Math.min(height - 1, iz));
    const sample = field.cells[z * width + x];
    return sample && secondary.has(sample.surface) ? 1 : 0;
  };
  const sampleMix = function(gx, gz){
    const ix = Math.floor(gx), iz = Math.floor(gz);
    const tx = gx - ix, tz = gz - iz;
    const a = indicator(ix, iz), b = indicator(ix + 1, iz);
    const c = indicator(ix, iz + 1), d = indicator(ix + 1, iz + 1);
    return (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * tz;
  };
  const conditionFields = context && context.profile
    ? (context.profile.terrainConditionFields || []).filter(function(candidate){
      return !candidate.fieldRef || candidate.fieldRef === field.fingerprint;
    }) : [];
  const runoffField = conditionFields.find(function(candidate){
    return candidate.id === "route-control-outfall-downhill-damp";
  });
  const foundationField = conditionFields.find(function(candidate){
    return candidate.id === "route-control-guard-foundation-contact-damp";
  });
  const conditionAt = function(conditionField, ix, iz){
    const x = Math.max(0, Math.min(width - 1, ix));
    const z = Math.max(0, Math.min(height - 1, iz));
    const index = z * width + x;
    const conditionWeights = conditionField && conditionField.weights;
    return conditionWeights && conditionWeights[index] != null ? conditionWeights[index] : 0;
  };
  /* Cell centres are integer coordinates in this renderer. Sampling the same bilinear scalar at
     both sides of every separately-built cap boundary makes a moisture trail continuous even while
     the terrain angles change from triangle to triangle. */
  const sampleCondition = function(conditionField, gx, gz){
    const ix = Math.floor(gx), iz = Math.floor(gz);
    const tx = gx - ix, tz = gz - iz;
    const a = conditionAt(conditionField, ix, iz);
    const b = conditionAt(conditionField, ix + 1, iz);
    const c = conditionAt(conditionField, ix, iz + 1);
    const d = conditionAt(conditionField, ix + 1, iz + 1);
    return (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * tz;
  };
  const mixes = new Float32Array(position.count);
  const macros = new Float32Array(position.count);
  const conditions = new Float32Array(position.count);
  const foundationConditions = new Float32Array(position.count);
  const seed = context && context.profile ? context.profile.seed >>> 0 : 0;
  let mixMin = 1, mixMax = 0, macroMin = Infinity, macroMax = -Infinity;
  let conditionMin = 1, conditionMax = 0;
  let foundationConditionMin = 1, foundationConditionMax = 0;
  for(let i = 0; i < position.count; i++){
    const localX = position.getX(i), localZ = position.getZ(i);
    const mix = Math.max(0, Math.min(1, sampleMix(cell.x + localX, cell.y + localZ)));
    const condition = Math.max(0, Math.min(1,
      sampleCondition(runoffField, cell.x + localX, cell.y + localZ)));
    const foundationCondition = Math.max(0, Math.min(1,
      sampleCondition(foundationField, cell.x + localX, cell.y + localZ)));
    const macro = clayGuardGroundMacroValue(
      cx + localX, cz + localZ, seed,
      blend.macroScaleWorldUnits, blend.macroStrength);
    mixes[i] = mix;
    macros[i] = macro;
    conditions[i] = condition;
    foundationConditions[i] = foundationCondition;
    mixMin = Math.min(mixMin, mix); mixMax = Math.max(mixMax, mix);
    macroMin = Math.min(macroMin, macro); macroMax = Math.max(macroMax, macro);
    conditionMin = Math.min(conditionMin, condition);
    conditionMax = Math.max(conditionMax, condition);
    foundationConditionMin = Math.min(foundationConditionMin, foundationCondition);
    foundationConditionMax = Math.max(foundationConditionMax, foundationCondition);
  }
  geometry.setAttribute("guardSurfaceMix", new THREE.Float32BufferAttribute(mixes, 1));
  geometry.setAttribute("guardMacroValue", new THREE.Float32BufferAttribute(macros, 1));
  geometry.setAttribute("guardConditionWeight",
    new THREE.Float32BufferAttribute(conditions, 1));
  geometry.setAttribute("guardFoundationConditionWeight",
    new THREE.Float32BufferAttribute(foundationConditions, 1));
  return {
    transition: blend.transition,
    secondarySurfaces: Array.from(secondary),
    mixRange: [+mixMin.toFixed(4), +mixMax.toFixed(4)],
    macroRange: [+macroMin.toFixed(4), +macroMax.toFixed(4)],
    conditionFieldIds: conditionFields.map(function(conditionField){
      return conditionField.id;
    }),
    conditionCombinationLaw: "independent-causal-fields-source-over-parent-in-declared-order",
    conditionProjection: conditionFields.length ? conditionFields[0].projection : null,
    conditionRange: [+conditionMin.toFixed(4), +conditionMax.toFixed(4)],
    foundationConditionRange: [
      +foundationConditionMin.toFixed(4), +foundationConditionMax.toFixed(4)
    ],
    macroScaleWorldUnits: blend.macroScaleWorldUnits,
    macroStrength: blend.macroStrength
  };
}

function clayGuardVisualComposeMatrix(position, rotation){
  const quaternion = new THREE.Quaternion();
  if(rotation){
    quaternion.setFromEuler(new THREE.Euler(rotation.x || 0, rotation.y || 0, rotation.z || 0, "XYZ"));
  }
  return new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3(1, 1, 1));
}

function clayGuardTerrainMaterialId(context, cell, faceRole){
  if(!context) return null;
  const bindings = context.profile.materialBindings || {};
  const terrain = bindings.terrain || {};
  if(faceRole === "tray-wall") return terrain["tray-wall"] || terrain["exposed-face"] || null;
  if(faceRole === "exposed-face") return terrain["exposed-face"] || null;
  if(cell.kind === "boulder") return terrain.boulder || terrain["exposed-face"] || null;
  const bySurface = bindings.terrainSurface || {};
  return bySurface[cell.surface]
    || (cell.surface === "guard-through-road" ? terrain["traffic-top"] : null)
    || terrain["natural-top"] || null;
}

/* CL-F09 architecture is deliberately a DUMB projector. Every visible box, roof plane, stair
   tread, wall fragment, opening lintel and threshold beam was compiled by architecture-forms.js.
   Keeping this function role-agnostic is the gate: adding a `guardroom` or `tower` branch here would
   recreate the Wave 2 failure under a new name. */
const CLAY_ARCHITECTURE_ROLE_COLORS = Object.freeze({
  "site-road": 0x8d7962,
  "site-earthwork": 0x817b70,
  "site-water": 0x556f79,
  "foundation": 0x686663,
  "masonry-wall": 0x79746f,
  "masonry-edge": 0x918a82,
  "timber-structure": 0x665343,
  "timber-surface": 0x786451,
  "roof-field": 0x71665f,
  "metal-mechanism": 0x4e5152,
  "repair": 0x755b45,
  "cutaway-cap": 0x9b9388,
  "ornamental-stone": 0xaaa096,
  "stained-glass": 0x547887,
  "luxury-floor": 0x8b7d70,
  "arcane-residue": 0x7c668b,
  "gilded-metal": 0x9b7f48,
  "signifier-support": 0x3f4547,
  "signifier-cloth-primary": 0x8f3044,
  "signifier-cloth-secondary": 0xd3ad58,
  "signifier-surface-mark": 0x59242d,
  "practical-housing": 0x302a24,
  "practical-emitter": 0xffb35f
});

function clayArchitectureMaterialFor(member, visualContext){
  if(member.role === "practical-emitter"){
    return new THREE.MeshStandardMaterial({
      color: 0xffc47a,
      emissive: 0xff9b45,
      emissiveIntensity: 2.25,
      roughness: 0.78,
      metalness: 0,
      side: THREE.DoubleSide
    });
  }
  const bindings = visualContext && visualContext.profile.materialBindings
    ? visualContext.profile.materialBindings.architecture : null;
  const materialId = bindings && bindings[member.role];
  const projected = materialId
    ? clayGuardVisualMaterial(visualContext, materialId, "architecture:" + member.role) : null;
  if(projected) return projected;
  let color = CLAY_ARCHITECTURE_ROLE_COLORS[member.role]
    || CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor;
  if(member.condition === "ruined") color = clayTerrainScaleHex(color, 0.91);
  return clayStructureMaterial(color);
}

function clayArchitectureMountPlan(parent, plan, firstBuild, baseY, boardOrigin, visualContext){
  const architectureGroup = new THREE.Group();
  architectureGroup.name = "architecture-form:" + plan.formId;
  architectureGroup.userData.clayArchitectureForm = {
    sceneId: plan.sceneId, formId: plan.formId, label: plan.label
  };
  const worldCenter = {
    x: firstBuild.originCell.x + firstBuild.field.extent.x / 2 - boardOrigin.cx,
    z: firstBuild.originCell.z + firstBuild.field.extent.y / 2 - boardOrigin.cz
  };
  const terrainHeightAt = function(worldX, worldZ){
    const field = firstBuild.field;
    if(!field || typeof terrainCellTopH !== "function") return null;
    const minX = firstBuild.originCell.x - boardOrigin.cx;
    const minZ = firstBuild.originCell.z - boardOrigin.cz;
    const localX = Math.max(0.0001,
      Math.min(field.extent.x - 0.0001, worldX - minX));
    const localZ = Math.max(0.0001,
      Math.min(field.extent.y - 0.0001, worldZ - minZ));
    const cellX = Math.floor(localX), cellZ = Math.floor(localZ);
    const index = cellZ * field.extent.x + cellX;
    const cell = field.cells[index];
    if(!cell || cell.kind === "void") return null;
    const u = localX - cellX - 0.5;
    const v = localZ - cellZ - 0.5;
    return baseY + terrainCellTopH(
      field, index, u, v, firstBuild.flags || clayRoomTerrainFlags()
    ) * TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
  };
  const materialRoles = {};
  const presentationHidden = new Set(plan.presentation && plan.presentation.hiddenMemberIds || []);
  const lowerWallConditionProjection = (plan.conditionProjection || []).find(function(row){
    return row.id === "route-control-lower-wall-history";
  });
  const architectureConditionBands = lowerWallConditionProjection
    && lowerWallConditionProjection.receiverBands || [];
  const conditionBandForMember = function(memberId){
    return architectureConditionBands.find(function(band){
      return (band.memberPrefixes || []).some(function(prefix){
        return memberId === prefix || memberId.indexOf(prefix + ":") === 0;
      });
    }) || null;
  };
  const wallFacePlans = plan.wallFaceModulePlans || [];
  const wallFacePlanByRun = new Map(wallFacePlans.map(function(facePlan){
    return [facePlan.wallRunId, facePlan];
  }));
  const wallFacePlanForMember = function(member){
    return wallFacePlans.find(function(facePlan){
      return member.id.indexOf(facePlan.memberPrefix) === 0;
    }) || null;
  };
  let visibleMemberCount = 0;
  let shaderConditionMemberCount = 0;
  let wallModuleMemberCount = 0;
  let suppressedConditionReceiverCount = 0;
  const conditionProjectionRows = [];
  const wallModuleProjectionRows = [];
  plan.compiledMembers.forEach(function(member){
    if(presentationHidden.has(member.id)) return;
    /* Lower-wall grime is now folded into the physical receiver's fragment. The compiled
       presentation members remain deterministic engine evidence and WFC closure receipts, but
       rendering them as extra prisms would recreate the false gap, shadow, and floating strip. */
    if(member.role === "condition-lower-wall-grime"){
      suppressedConditionReceiverCount++;
      return;
    }
    visibleMemberCount++;
    let geometry;
    if(member.shape === "polyhedron" && member.vertices && member.triangles){
      const positions = [];
      member.triangles.forEach(function(triangle){
        triangle.forEach(function(index){
          const vertex = member.vertices[index];
          positions.push(vertex.x, vertex.y, vertex.z);
        });
      });
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.computeVertexNormals();
    } else {
      geometry = new THREE.BoxGeometry(member.size.x, member.size.y, member.size.z);
    }
    const baseMaterial = clayArchitectureMaterialFor(member, visualContext);
    const mesh = new THREE.Mesh(geometry, baseMaterial);
    if(member.shape === "polyhedron"){
      mesh.position.set(worldCenter.x, baseY, worldCenter.z);
    } else {
      mesh.position.set(worldCenter.x + member.center.x, baseY + member.center.y,
        worldCenter.z + member.center.z);
      mesh.rotation.set(member.rotation.x, member.rotation.y, member.rotation.z, "XYZ");
    }
    const architectureBindings = visualContext && visualContext.profile.materialBindings
      ? visualContext.profile.materialBindings.architecture : null;
    const materialId = architectureBindings && architectureBindings[member.role];
    const materialDefinition = materialId && visualContext.profile.materialDefinitions[materialId];
    if(materialDefinition){
      const matrix = clayGuardVisualComposeMatrix(mesh.position, mesh.rotation);
      const uvBounds = clayGuardVisualUvProject(
        geometry, matrix, materialDefinition, member.id);
      const conditionBand = conditionBandForMember(member.id);
      const conditionProjection = clayGuardArchitectureConditionAttributes(
        geometry, matrix, conditionBand, baseY, materialDefinition, terrainHeightAt);
      if(conditionProjection){
        conditionProjectionRows.push({
          memberId: member.id,
          role: member.role,
          materialId: materialId,
          bandId: conditionProjection.bandId,
          activeVertices: conditionProjection.activeVertices,
          activeVerticalVertices: conditionProjection.activeVerticalVertices,
          activeUpwardVertices: conditionProjection.activeUpwardVertices,
          vertexCount: conditionProjection.vertexCount,
          rootMode: conditionProjection.rootMode,
          receiverFaceMode: conditionProjection.receiverFaceMode,
          riseWorldHeight: conditionProjection.riseWorldHeight,
          horizontalRepeatWorldLength: conditionProjection.horizontalRepeatWorldLength,
          horizontalPhaseLaw: conditionProjection.horizontalPhaseLaw,
          minimumLocalHeight: conditionProjection.minimumLocalHeight,
          maximumLocalHeight: conditionProjection.maximumLocalHeight
        });
      }
      if(conditionProjection && conditionProjection.activeVertices > 0){
        shaderConditionMemberCount++;
      }
      const wallFacePlan = wallFacePlanForMember(member);
      const wallModuleProjection = wallFacePlan
        ? clayGuardWallModuleAttributes(
            geometry, matrix, wallFacePlan, worldCenter, baseY, materialDefinition)
        : null;
      if(wallModuleProjection && wallModuleProjection.activeVertices > 0){
        mesh.material = clayGuardWallModuleMaterial(
          baseMaterial, wallFacePlan, plan.cultureProfileId);
        wallModuleMemberCount++;
        wallModuleProjectionRows.push(Object.assign({
          memberId: member.id,
          role: member.role,
          materialId: materialId,
          materialName: mesh.material.name,
          compileState: mesh.material.userData.guardWallModuleCompileState
        }, wallModuleProjection));
      }
      mesh.userData.clayGuardVisualMaterial = {
        materialId: materialId,
        state: materialDefinition.state,
        contextVerdict: materialDefinition.contextVerdict,
        projection: materialDefinition.projection,
        uvBounds: uvBounds,
        conditionProjection: conditionProjection,
        wallFaceModuleProjection: wallModuleProjection
      };
    }
    /* Paper-thin condition receivers are color/alpha projections, not physical ledges. Letting
       them cast a second shadow against the parent created the false black "grime gap" at the
       exact contact line and made transparent ivy cards read as solid fins. Until condition is
       folded into the parent fragment shader, presentation-only/nonmechanical receivers inherit
       scene lighting but neither cast nor receive an independent shadow. */
    const nonPhysicalPresentation = !!member.presentationOnly
      && member.mechanicalEffect === "none";
    mesh.castShadow = member.role !== "site-road" && !nonPhysicalPresentation;
    mesh.receiveShadow = !nonPhysicalPresentation;
    mesh.userData.interiorKind = "clay-architecture-member";
    mesh.userData.clayArchitectureMember = {
      id: member.id, ownerId: member.ownerId, role: member.role,
      supportedBy: member.supportedBy.slice(), cutawayGroup: member.cutawayGroup,
      access: member.access, cover: member.cover, condition: member.condition,
      presentationOnly: !!member.presentationOnly,
      mechanicalEffect: member.mechanicalEffect || null,
      shadowPolicy: nonPhysicalPresentation
        ? "condition-receiver-no-independent-shadow"
        : "physical-member-cast-and-receive",
      cultureRef: member.cultureRef || null,
      variantRef: member.variantRef || null,
      worldTruthRef: member.worldTruthRef || null,
      signifierRef: member.signifierRef || null,
      placeholderState: member.placeholderState || null
    };
    architectureGroup.add(mesh);
    materialRoles[member.role] = (materialRoles[member.role] || 0) + 1;
  });

  const lightRows = [];
  (plan.lightSockets || []).forEach(function(socket){
    const light = new THREE.PointLight(socket.color, socket.intensity,
      socket.distance, socket.decay);
    light.name = "architecture-light:" + socket.id;
    light.position.set(worldCenter.x + socket.at.x, baseY + socket.at.y,
      worldCenter.z + socket.at.z);
    light.castShadow = false;
    light.userData.clayArchitectureLight = {
      id: socket.id, purpose: socket.purpose, supportId: socket.supportId,
      intensity: socket.intensity, distance: socket.distance
    };
    architectureGroup.add(light);
    lightRows.push(Object.assign({}, light.userData.clayArchitectureLight, {
      color: socket.color, at: Object.assign({}, socket.at)
    }));
  });

  const assetRows = [];
  plan.assetSockets.forEach(function(socket){
    const promotionCandidates = (socket.promotionCandidates || []).map(function(candidate){
      return Object.assign({}, candidate);
    });
    const row = {
      id: socket.id,
      purpose: socket.purpose,
      runtimeCandidates: socket.allowedSlugs.slice(),
      promotionCandidates: promotionCandidates,
      plannedCandidates: (socket.plannedCandidates || []).map(function(candidate){
        return Object.assign({}, candidate);
      }),
      materialContext: socket.materialContext
        ? Object.assign({}, socket.materialContext) : null,
      fallback: socket.fallback,
      status: null,
      loadedSlug: null,
      appliedMaterialContext: null,
      materialFamiliesApplied: []
    };
    assetRows.push(row);
    if(!socket.allowedSlugs.length){
      row.status = promotionCandidates.length ? "promotion-pending:fallback" : "planned-only:fallback";
      return;
    }
    if(!window.TheaterDonor || typeof window.TheaterDonor.loadDonorPiece !== "function"){
      row.status = "loader-unavailable:fallback";
      return;
    }
    row.status = "loading";
    const socketRuntimeSlug = socket.allowedSlugs[0];
    window.TheaterDonor.loadDonorPiece(socket.catalog, socketRuntimeSlug, {
      seedKey: plan.sceneId + ":" + socket.id,
      materialContext: socket.materialContext || null
    }).then(function(donor){
      /* A load may finish after the user has changed scenes. Never resurrect an asset into a
         detached proof; the next mount will issue its own request. */
      if(!architectureGroup.parent || S.clayRoomTerrainBenchGroup !== parent) return;
      donor.name = "architecture-asset:" + socket.id + ":" + socketRuntimeSlug;
      donor.position.set(worldCenter.x + socket.at.x, baseY + socket.at.y,
        worldCenter.z + socket.at.z);
      donor.rotation.y = socket.yaw;
      donor.scale.setScalar(socket.scale);
      donor.userData.clayArchitectureAsset = {
        socketId: socket.id, slug: socketRuntimeSlug, purpose: socket.purpose,
        collisionAuthority: socket.collisionAuthority, stateOwner: socket.stateOwner
      };
      donor.traverse(function(node){
        if(node.isMesh){ node.castShadow = true; node.receiveShadow = true; }
      });
      architectureGroup.add(donor);
      row.status = promotionCandidates.length ? "loaded-citizen:promotion-alternative" : "loaded-citizen";
      row.loadedSlug = socketRuntimeSlug;
      const donorReceipt = donor.userData && donor.userData.genesisDonorPiece;
      row.appliedMaterialContext = donorReceipt && donorReceipt.materialContext
        ? Object.assign({}, donorReceipt.materialContext) : null;
      row.materialFamiliesApplied = donorReceipt
        && Array.isArray(donorReceipt.materialFamiliesApplied)
        ? donorReceipt.materialFamiliesApplied.slice().sort() : [];
      markDirty(); scheduleRender();
    }).catch(function(error){
      row.status = "load-failed:fallback";
      row.error = String(error && error.message || error);
      markDirty(); scheduleRender();
    });
  });
  parent.add(architectureGroup);
  return {
    group: architectureGroup,
    worldCenter: worldCenter,
    memberCount: visibleMemberCount,
    physicalMemberCount: plan.compiledMembers.length,
    presentationHiddenCount: presentationHidden.size,
    suppressedConditionReceiverCount: suppressedConditionReceiverCount,
    shaderConditionMemberCount: shaderConditionMemberCount,
    wallModuleMemberCount: wallModuleMemberCount,
    wallModuleProjectionRows: wallModuleProjectionRows,
    wallFaceModuleCompilerReceipt: plan.wallFaceModuleCompilerReceipt || null,
    conditionProjectionRows: conditionProjectionRows,
    conditionProjectionPolicy: "engine-receiver-band-modulates-parent-fragment",
    materialRoles: materialRoles,
    visualProfile: visualContext ? visualContext.report : null,
    lightRows: lightRows,
    assetRows: assetRows
  };
}

function clayRoomMountTerrainBench(){
  S.clayRoomTerrainBenchGroup = null;
  S.clayRoomTerrainReport = null;
  if(S.clayRoomFixtureId !== CLAY_ROOM_TERRAIN_BENCH_ID || !S.interiorGroup || !S.clayRoomRecord){
    return null;
  }
  /* The chassis is a classic-script engine module. If it has not loaded, the bench refuses to
     draw rather than inventing terrain — a renderer that can author ground is the exact failure
     the walk-native contract forbids. */
  if(typeof terrainBenchSceneBuild !== "function" || typeof CL_F07_TERRAIN_BENCH === "undefined"){
    S.clayRoomTerrainReport = { error: "terrain chassis not loaded (src/engine/terrain-*.js)" };
    return null;
  }
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  const origin = S.boardOrigin;
  if(!room || !origin) return null;

  /* The host's MOVE/DASH range overlay is a 15x15 room diagnostic. When the Clayroom opens
     STRAIGHT onto a bench from the URL, clayRoomSetFixture never runs, so the overlay the initial
     mount drew is never disposed — it survives as a magenta patch of host-room cells sitting in the
     middle of an outdoor field, which is both wrong and unreadable. Dispose it here, on every
     rebuild, so the frame carries only terrain's own overlays. */
  if(typeof clayRoomDisposeMovementOverlay === "function") clayRoomDisposeMovementOverlay();

  const sceneId = S.clayRoomTerrainSceneId || clayRoomTerrainSceneIdFromLocation();
  S.clayRoomTerrainSceneId = sceneId;
  const seed = S.clayRoomTerrainSeed != null ? S.clayRoomTerrainSeed : clayRoomTerrainSeedFromLocation();
  const frameIndex = S.clayRoomTerrainFrame != null
    ? S.clayRoomTerrainFrame : clayRoomTerrainFrameFromLocation();
  const architectureScene = CLAY_ARCHITECTURE_FORM_SCENE_IDS.indexOf(sceneId) >= 0;
  const architectureVariant = architectureScene ? clayRoomArchitectureVariantFromLocation() : null;
  const goldenScene = CLAY_GOLDEN_VIGNETTE_SCENE_IDS.indexOf(sceneId) >= 0;
  const guardVisualProfileId = goldenScene
    ? clayRoomGuardVisualProfileFromLocation() : null;
  const guardGroundCalibration = goldenScene
    ? clayRoomGuardGroundCalibrationFromLocation() : null;
  const guardMasonryCandidate = goldenScene
    ? clayRoomGuardMasonryCandidateFromLocation() : null;
  const guardConditionCandidate = goldenScene
    ? clayRoomGuardConditionCandidateFromLocation() : null;
  const guardWorldPixelDensityProof = goldenScene
    ? clayRoomGuardWorldPixelDensityProofFromLocation() : null;
  let scene;
  try {
    scene = architectureScene
      ? architectureFormSceneBuild(sceneId, seed, { variant: architectureVariant })
      : (goldenScene
        ? goldenVignetteWave2SceneBuild(sceneId, seed, {
            frameIndex: frameIndex,
            visualProfileId: guardVisualProfileId,
            groundCandidate: guardGroundCalibration.candidate,
            groundMetersPerRepeat: guardGroundCalibration.metersPerRepeat,
            masonryCandidate: guardMasonryCandidate,
            conditionCandidate: guardConditionCandidate,
            worldPixelDensityProof: guardWorldPixelDensityProof
          })
        : terrainBenchSceneBuild(sceneId, seed, { frameIndex: frameIndex }));
  } catch(error){
    S.clayRoomTerrainReport = { error: String(error && error.message || error), sceneId: sceneId };
    return null;
  }

  const hostSuppressed = clayTerrainSuppressHostChrome();

  /* THE SCENE'S OWN LIGHT CASE. Declared in the fixture data and asserted here, so every rebuild
     reasserts it — a one-shot call from a capture rig is silently lost to the next board replay,
     and "requested dark" then ships as a receipt field with a pale frame beside it. */
  const requestedLightRecipe = architectureScene
    ? architectureFormSceneLightRecipe(sceneId)
    : (goldenScene
      ? goldenVignetteWave2SceneLightRecipe(sceneId)
      : terrainBenchSceneLightRecipe(sceneId));
  if(S.clayRoomLightRecipeId !== requestedLightRecipe){
    clayRoomSetLightingRecipe(requestedLightRecipe, "cl-f07-scene-light-case");
  }
  /* DECLARING a light case and TAKING THE HOST RIG DOWN are two different decisions. Round 1
     conflated them: "neutralise iff the scene declares a recipe" meant the production scenes —
     which declared nothing — kept a neutralised rig with no substitute and went black. Only a scene
     whose whole point is the absence of light may take the rig down; every other scene keeps it. */
  const neutralizeRig = architectureScene
    ? architectureFormSceneNeutralizesRig(sceneId)
    : (goldenScene
      ? goldenVignetteWave2SceneNeutralizesRig(sceneId)
      : terrainBenchSceneNeutralizesRig(sceneId));
  const foreignLights = neutralizeRig
    ? clayTerrainNeutralizeForeignLights()
    : (clayTerrainRestoreForeignLights(), []);

  const group = new THREE.Group();
  group.name = CL_F07_TERRAIN_BENCH.id + ":" + sceneId;
  group.userData.clayTerrainBench = true;
  group.userData.fixtureId = CL_F07_TERRAIN_BENCH.id;
  group.userData.fixtureVersion = CL_F07_TERRAIN_BENCH.version;
  group.userData.terrainSceneId = sceneId;

  const baseY = interiorFloorTopAt(S.interiorFloorTopMap, room.x + 7, room.y + 7);
  /* THE EXPRESSION RUNG. Resolved ONCE per mount and handed to every device, so a frame can never
     be half one rung and half another. */
  const expressionFlags = clayRoomTerrainFlags();
  /* R3 — which overhang mode this mount renders. `rule` is Adam's ruling and the default; the other
     two exist so the comparison capture shows the ruling beside what it replaced. */
  const overhangMode = S.clayRoomTerrainOverhang || clayRoomTerrainOverhangFromLocation() || "rule";
  /* ONE publication of the cell's stand plane, read by the renderer that draws the cap AND by the
     standee mount that tilts the plinth. Two derivations would be two truths and the plinth would
     float on one of them (STANDEE-CONTRACT §3(d)'s second rider). */
  const standPlaneFor = function(field, index, originCell){
    if(typeof terrainCellStandPlane !== "function"){
      return { dYdx: 0, dYdz: 0, slopeDeg: 0, tilt: false, normal: [0, 1, 0] };
    }
    const p = terrainCellStandPlane(field, index, expressionFlags);
    /* R2 — THE RENDERED TOP, not the stand plane. The plinth conforms to the PLANE, but the ground
       it visually sits on is the plane PLUS B4's fold, and nothing before this sampled that: the
       contact probe's planeAt() evaluates the plane, so the fold's dip under a plinth corner was
       invisible to every gate the R1 build shipped. This closure evaluates what is actually drawn,
       in world space, for exactly the cell the witness stands on — which is what the skirt has to
       cover and what "the base appears to make contact with the full ground" has to be measured
       against. Null when the caller has no origin (the contract probe path supplies one). */
    let renderedTopAt = null;
    if(originCell && typeof terrainCellTopH === "function"){
      const cell = field.cells[index];
      const q = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
      const cx = originCell.x + cell.x - origin.cx + 0.5;
      const cz = originCell.z + cell.y - origin.cz + 0.5;
      renderedTopAt = function(wx, wz){
        const u = Math.max(-0.5, Math.min(0.5, wx - cx));
        const v = Math.max(-0.5, Math.min(0.5, wz - cz));
        return baseY + terrainCellTopH(field, index, u, v, expressionFlags) * q;
      };
    }
    return { dYdx: p.dYdx, dYdz: p.dYdz, slopeDeg: p.slopeDeg, normal: p.normal,
      gradeId: p.gradeId, renderedTopAt: renderedTopAt,
      skirtDepthWU: (typeof terrainStandeeSkirtNeedWU === "function")
        ? terrainStandeeSkirtNeedWU(field, index, expressionFlags) : clayRoomTerrainSkirtDepth(),
      tilt: !!expressionFlags.slopeplinth };
  };
  const fields = scene.fields || [];
  /* Multi-field scenes (the one-clamp pair, the six boundary frames) lay their fields out in one
     row, centred on the host, so a single frame carries the comparison the capture is about. */
  const gap = 2;
  const totalWidth = fields.reduce(function(sum, f){ return sum + f.extent.x; }, 0)
    + gap * Math.max(0, fields.length - 1);
  let cursorX = room.x + 7 - totalWidth / 2;
  const built = [];
  const witnesses = [];
  const witnessFailures = [];
  const witnessContact = [];
  const contractProbe = clayRoomTerrainProbeFromLocation() === "standee-contract";
  const contractPicks = {};
  const defenseStructures = [];
  const terrainDressingRows = [];
  let architectureProjection = null;
  const guardVisualContext = goldenScene && scene.visualProfile
    ? clayGuardVisualContext(scene.visualProfile) : null;
  const worldPixelDensityProof = goldenScene && scene.visualProfile
    ? scene.visualProfile.worldPixelDensityDemonstration : null;
  fields.forEach(function(field, index){
    const originCell = { x: cursorX, z: room.y + 7 - field.extent.y / 2 };
    const fieldBuild = clayTerrainBuildFieldGroup(field, originCell, baseY, origin, {
      supportOverlay: sceneId === "support-graph",
      flags: expressionFlags,
      overhangMode: overhangMode,
      visualContext: guardVisualContext
    });
    fieldBuild.group.userData.terrainFieldIndex = index;
    group.add(fieldBuild.group);
    /* THE DECLARED FOOTPRINT, in world coordinates, straight off the chassis. One row per cell the
       renderer is contractually required to draw (everything that is not a void), each carrying the
       world point at the centre of its own top surface — the same clayTerrainCellWorld() the
       witnesses and the route overlay use, so there is one projection and not two. A capture
       projects these through the recorded camera and samples the frame at each: a declared cell that
       lands on backdrop was DECLARED AND NOT DRAWN, which is a number rather than an impression. */
    const declaredTops = [];
    field.cells.forEach(function(c){
      if(c.kind === "void") return;
      const p = clayTerrainCellWorld(field, originCell, baseY, origin, c.index);
      declaredTops.push([c.x, c.y, +p.x.toFixed(4), +p.y.toFixed(4), +p.z.toFixed(4),
        c.inPlayfield ? 1 : 0]);
    });
    built.push({ field: field, group: fieldBuild.group,
      originCell: originCell, floorH: fieldBuild.floorH,
      cellMeshes: fieldBuild.cellMeshes.length, declaredTops: declaredTops,
      flags: expressionFlags,
      trayClosure: fieldBuild.trayClosure,
      /* R3 — the licence the builder actually decided for THIS field, carried forward so the
         receipt reports the rule beside what was built rather than re-deriving it (and rather than
         reporting null, which is what reaching for a `group` key this record never had produced). */
      overhangCensus: fieldBuild.group.userData.terrainOverhangCensus || null,
      terrainOccluderPresentation:
        fieldBuild.group.userData.terrainOccluderPresentation || null });

    /* THE SIX-FOOT HUMAN WITNESS ON EVERY RELIEF DATUM IN THE SAME FRAME (§4.2 condition 2). On
       the sheet that is one per piece; elsewhere it is the extremes of the field's own relief. */
    const spec = scene.spec && scene.spec.pieces ? scene.spec : null;
    if(worldPixelDensityProof && index === 0){
      (worldPixelDensityProof.actors || []).forEach(function(actor){
        const cell = field.cells[actor.cell.index];
        if(!cell || !cell.standable) return;
        const proofEntry = {
          slug: actor.id,
          legacyAsset: actor.asset,
          runtimeAdmitted: "legacy",
          size: "Medium",
          worldHeight: actor.worldHeightFeet,
          pixelsPerFoot: actor.pixelsPerFoot,
          bodySubjectHeightPixels: actor.bodySubjectHeightPixels,
          alphaCutoff: actor.alphaCutoff,
          standeeExtrusion: actor.standeeExtrusion,
          baseStyle: actor.supportStyle,
          baseTrimHex: actor.supportTrimHex,
          supportVisualScale: actor.supportVisualScale
        };
        const placed = clayTerrainPlaceWitness(fieldBuild.group, actor.id,
          clayTerrainCellWorld(field, originCell, baseY, origin, cell.index),
          "density-proof:" + actor.side + ":" + actor.id,
          witnessFailures, witnessContact,
          clayTerrainSameHeightNeighbours(field, cell.index),
          standPlaneFor(field, cell.index, originCell), proofEntry);
        if(placed) witnesses.push(Object.assign({
          densityProof: true,
          side: actor.side,
          role: actor.role,
          cell: Object.assign({}, actor.cell)
        }, placed));
      });
    } else if(sceneId === "thirteen-piece-sheet" || sceneId === "dark"){
      (spec ? spec.pieces : []).forEach(function(piece){
        if(!piece.witnessCell) return;
        /* A WITNESS MUST STAND ON FOOTING THAT READS AS FOOTING. The authored cell is a fixed bay
           corner; on R1-03 that corner is the top of a ONE-CELL crevice wall, and a 6-ft billboard
           on a 5-ft pinnacle hides its own support — the figure reads as hovering with the pillar's
           top corner peeking out beneath it as a small grey wedge. That is exactly the "floating
           figure with a drop-marker" in the packet, and it was geometrically correct the whole time,
           which is why every contact measurement passed.
           So: prefer the best-supported standable cell in the piece's own bay — most same-height
           orthogonal neighbours, then lowest, then cell order for determinism. */
        const wIdx = clayTerrainSupportedWitnessCell(field, piece);
        const cell = field.cells[wIdx];
        if(!cell || !cell.standable) return;
        const placed = clayTerrainPlaceWitness(fieldBuild.group,
          CL_F07_TERRAIN_BENCH.witnessSlug,
          clayTerrainCellWorld(field, originCell, baseY, origin, wIdx), piece.id,
          witnessFailures, witnessContact, clayTerrainSameHeightNeighbours(field, wIdx),
          standPlaneFor(field, wIdx, originCell));
        if(placed) witnesses.push(Object.assign({ piece: piece.id }, placed));
      });
    } else if(!goldenScene) {
      /* The lowest/highest pair is a TERRAIN-DIAGNOSTIC instrument, not population dressing.
         Mounting it in a Golden Site beauty/material frame caused two false failures:
           - the rear datum could be buried by a crest from the governed camera;
           - distant world cells could collapse onto the same screen-space silhouette and read as
             a single clipped/spliced character.
         Golden Sites therefore carry no implicit legacy witnesses. Characters appear only through
         an explicit governed population proof (currently `party-guards` above), whose allocator
         owns architecture clearance, four-bearing sightlines, and inter-actor silhouette spacing.
         Ordinary terrain benches retain the datum pair because it is still useful there. */
      const standables = field.cells.filter(function(c){ return c.standable; });
      if(standables.length){
        const lowest = standables.reduce(function(a, b){ return b.h < a.h ? b : a; });
        const highest = standables.reduce(function(a, b){ return b.h > a.h ? b : a; });
        const picks = [{ cell: lowest, label: "foot" }];
        if(highest.index !== lowest.index) picks.push({ cell: highest, label: "top" });
        /* The three envelopes read DIFFERENTLY against terrain than against architecture, which is
           why CL-F03's cast does not substitute: a 2h step a Medium climbs is a wall to a Small. */
        const envelopes = CL_F07_TERRAIN_BENCH.witnessEnvelopes;
        picks.forEach(function(pick, pIdx){
          const env = envelopes[Math.min(pIdx === 0 ? 1 : 0, envelopes.length - 1)];
          const placed = clayTerrainPlaceWitness(fieldBuild.group,
            pIdx === 0 ? CL_F07_TERRAIN_BENCH.witnessSlug : env.slug,
            clayTerrainCellWorld(field, originCell, baseY, origin, pick.cell.index),
            field.id + ":" + pick.label, witnessFailures, witnessContact,
            clayTerrainSameHeightNeighbours(field, pick.cell.index),
            standPlaneFor(field, pick.cell.index, originCell));
          if(placed) witnesses.push(Object.assign({ datum: pick.label, fieldId: field.id }, placed));
        });
      }
    }

    /* §3 B3 — THE STANDEE CONTRACT MATRIX. Three envelopes on each of the four surface classes a
       standee must survive (flat / edge / run / face-top), at FREE yaw — the yaw regime no banked
       terrain capture had ever exercised, because until P1 landed the terrain witnesses never
       billboarded at all. Only ever the FIRST field, so the matrix reads as one row per class and
       not as six copies across a boundary sheet. */
    if(contractProbe && index === 0 && typeof terrainContractCellPicks === "function"){
      const picks = terrainContractCellPicks(field, { perClass: 3, minSpacing: 4 });
      const envs = CL_F07_TERRAIN_BENCH.witnessEnvelopes;
      Object.keys(picks).forEach(function(cls){
        picks[cls].forEach(function(cellIdx, k){
          const env = envs[Math.min(k, envs.length - 1)];
          const plane = standPlaneFor(field, cellIdx, originCell);
          plane.surfaceClass = cls;
          plane.envelope = env.envelope;
          const placed = clayTerrainPlaceWitness(fieldBuild.group, env.slug,
            clayTerrainCellWorld(field, originCell, baseY, origin, cellIdx),
            "contract:" + cls + ":" + env.envelope, witnessFailures, witnessContact,
            clayTerrainSameHeightNeighbours(field, cellIdx), plane);
          if(placed) witnesses.push(Object.assign({ contract: cls, envelope: env.envelope }, placed));
        });
      });
      contractPicks[field.id] = picks;
    }

    /* THE ROUTE PROOF overlay: approach / deployment / objective / retreat drawn on the frame
       (clay-proof contract item 5), from the chassis's own BFS over the walk graph. */
    if(sceneId === "route-proof" && scene.route){
      const drawPath = function(path, color, tag){
        if(!path) return;
        for(let i = 0; i + 1 < path.length; i++){
          const a = clayTerrainCellWorld(field, originCell, baseY, origin, path[i]);
          const b = clayTerrainCellWorld(field, originCell, baseY, origin, path[i + 1]);
          a.y += 0.05; b.y += 0.05;
          const strip = clayStructureStripBetween(a, b, color, "route", "cl-f07:route:" + tag, 0.09);
          strip.userData.terrainRoute = tag;
          fieldBuild.group.add(strip);
        }
      };
      drawPath(scene.route.approach, CLAY_TERRAIN_COLORS.approach, "approach");
      drawPath(scene.route.retreat, CLAY_TERRAIN_COLORS.retreat, "retreat");
      (scene.route.deployment || []).forEach(function(idx){
        const p = clayTerrainCellWorld(field, originCell, baseY, origin, idx);
        const marker = new THREE.Mesh(new THREE.RingGeometry(0.26, 0.4, 16),
          new THREE.MeshBasicMaterial({ color: CLAY_TERRAIN_COLORS.entry, depthTest: false,
            depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(p.x, p.y + 0.05, p.z);
        marker.renderOrder = 72;
        marker.userData.interiorKind = "clay-diagnostic-overlay";
        marker.userData.terrainRoute = "deployment";
        fieldBuild.group.add(marker);
      });
      if(scene.route.objective != null){
        const p = clayTerrainCellWorld(field, originCell, baseY, origin, scene.route.objective);
        const pin = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 10),
          new THREE.MeshBasicMaterial({ color: CLAY_TERRAIN_COLORS.objective, toneMapped: false }));
        pin.position.set(p.x, p.y + 0.5, p.z);
        pin.userData.interiorKind = "clay-diagnostic-overlay";
        pin.userData.terrainRoute = "objective";
        fieldBuild.group.add(pin);
      }
    }

    /* R1-13 CHASSIS HOOKS: the beams. A beam is NOT graded ground — writing it into the heightfield
       would mint a false 5-ft footprint in the support graph — so the chassis produced the anchors
       and the undercut, and the renderer draws the span between them. */
    /* SPANS ARE BUILT ONLY WHERE THE SPEC ASKS FOR ONE, AND ONLY ON THAT PIECE'S OWN ANCHORS.
       Building them on every field from whatever anchors the whole field happened to yield put two
       beams off the far edge of the sheet at z=-11.5, hanging 1h above the highest anchor they could
       find — the "two floating objects" in the packet. A cylinder seen end-on at this camera reads
       as a small grey wedge, which is exactly what it looked like. */
    const spanPiece = (spec && spec.pieces ? spec.pieces : []).filter(function(p){
      return p.pieceId === "R1-13";
    })[0];
    if(spanPiece && typeof terrainAnchorSet === "function" && typeof terrainSpanNetwork === "function"){
      const bay = spanPiece.bay;
      const anchors = terrainAnchorSet(field).filter(function(a){
        if(!a.at) return false;
        /* inside the piece's own bay when it has one, and inside the field always */
        if(a.at.x < 0 || a.at.y < 0 || a.at.x >= field.extent.x || a.at.y >= field.extent.y) return false;
        if(!bay) return true;
        return a.at.x >= bay.x && a.at.x < bay.x + bay.w
          && a.at.y >= bay.y && a.at.y < bay.y + bay.d;
      });
      if(anchors.length >= 2){
        const spanParams = spanPiece.params || {};
        const network = terrainSpanNetwork(anchors, {
          spanCount: Math.min(spanParams.spanCount || 2, anchors.length - 1),
          diameterFt: spanParams.diameterFt || 2,
          heightAboveDatumH: spanParams.heightAboveDatumH == null
            ? 1 : spanParams.heightAboveDatumH,
          barkCondition: spanParams.barkCondition || "sound",
          undercutDepthH: spanParams.undercutDepthH == null ? 1 : spanParams.undercutDepthH
        });
        network.spans.forEach(function(span){
          const ai = span.from.at.y * field.extent.x + span.from.at.x;
          const bi = span.to.at.y * field.extent.x + span.to.at.x;
          if(!field.cells[ai] || !field.cells[bi]) return;
          const a = clayTerrainCellWorld(field, originCell, baseY, origin, ai);
          const b = clayTerrainCellWorld(field, originCell, baseY, origin, bi);
          const rise = span.heightAboveDatumH * TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
          a.y += rise; b.y += rise;
          const len = a.distanceTo(b);
          if(len < 0.5 || len > 8) return;
          const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(span.diameterFt / 10, span.diameterFt / 10 * (1 + span.taper), len, 8),
            clayStructureMaterial(CLAY_TERRAIN_COLORS.span));
          beam.position.copy(a).add(b).multiplyScalar(0.5);
          beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0),
            b.clone().sub(a).normalize());
          beam.castShadow = true;
          beam.userData.interiorKind = "clay-terrain-span";
          const bayMinX = bay ? originCell.x + bay.x - origin.cx : null;
          const bayMaxX = bay ? bayMinX + bay.w : null;
          const bayMinZ = bay ? originCell.z + bay.y - origin.cz : null;
          const bayMaxZ = bay ? bayMinZ + bay.d : null;
          const mid = beam.position;
          beam.userData.terrainSpan = { id: span.id, treadWidthFt: span.treadWidthFt,
            movement: span.movement, climbDc: span.climbDc, collapse: span.collapse,
            declaringPiece: spanPiece.id,
            outsideDeclaringBay: bay ? (mid.x < bayMinX - 1 || mid.x > bayMaxX + 1
              || mid.z < bayMinZ - 1 || mid.z > bayMaxZ + 1) : false };
          fieldBuild.group.add(beam);
        });
        fieldBuild.group.userData.terrainSpanNetwork = {
          spanCount: network.spanCount, junctionCount: network.junctionCount,
          deferred: network.deferred };
      }
    }
    cursorX += field.extent.x + gap;
  });

  if(scene.architecturePlan && built.length){
    architectureProjection = clayArchitectureMountPlan(group, scene.architecturePlan,
      built[0], baseY, origin, guardVisualContext);
  }

  /* Golden Site 1's quiet turf parent intentionally contains no camera-facing fan tufts. Sparse
     readable growth returns as engine-authored semantic placements using two crossed, fixed
     world planes. Each plane roots both lower corners against the actual rendered terrain surface,
     so responsive slopes bend the root line without billboarding, floating, or flattening the
     hill. The profile owns source, density, cells, scale, and yaw; this renderer only projects. */
  const terrainDressing = goldenScene && scene.visualProfile
    ? scene.visualProfile.terrainDressing : null;
  if(terrainDressing && built.length && guardVisualContext){
    const first = built[0];
    const material = clayGuardVisualMaterial(
      guardVisualContext, terrainDressing.materialId, "terrain-dressing");
    if(material){
      material.side = THREE.DoubleSide;
      const dressingGroup = new THREE.Group();
      dressingGroup.name = "guard-terrain-dressing:" + terrainDressing.id;
      dressingGroup.userData.terrainDressingGroup = {
        id: terrainDressing.id,
        projection: terrainDressing.projection,
        mechanicalEffect: terrainDressing.mechanicalEffect
      };
      (terrainDressing.placements || []).forEach(function(placement){
        const cell = first.field.cells[placement.cell.index];
        if(!cell || !cell.standable) return;
        const center = clayTerrainCellWorld(
          first.field, first.originCell, baseY, origin, cell.index);
        const supportPlane = standPlaneFor(first.field, cell.index, first.originCell);
        const scale = Math.max(0.2, Math.min(0.8, placement.scaleWorldUnits || 0.5));
        const cluster = new THREE.Group();
        cluster.name = "guard-terrain-dressing-cluster:" + placement.id;
        cluster.position.set(center.x, center.y, center.z);
        const baseYaw = (placement.yawDegrees || 0) * Math.PI / 180;
        [0, Math.PI / 2].forEach(function(angle, planeIndex){
          const yaw = baseYaw + angle;
          const dx = Math.cos(yaw) * scale * 0.5;
          const dz = Math.sin(yaw) * scale * 0.5;
          const x0 = center.x - dx, z0 = center.z - dz;
          const x1 = center.x + dx, z1 = center.z + dz;
          const y0 = supportPlane && supportPlane.renderedTopAt
            ? supportPlane.renderedTopAt(x0, z0) - center.y - 0.012 : -0.012;
          const y1 = supportPlane && supportPlane.renderedTopAt
            ? supportPlane.renderedTopAt(x1, z1) - center.y - 0.012 : -0.012;
          const positions = new Float32Array([
            -dx, y0, -dz, dx, y1, dz, dx, y1 + scale, dz,
            -dx, y0, -dz, dx, y1 + scale, dz, -dx, y0 + scale, -dz
          ]);
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position",
            new THREE.Float32BufferAttribute(positions, 3));
          geometry.setAttribute("uv", new THREE.Float32BufferAttribute(
            new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]), 2));
          geometry.computeVertexNormals();
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          mesh.userData.terrainDressing = {
            id: placement.id,
            role: placement.role,
            sourceZoneId: placement.sourceZoneId,
            cellIndex: placement.cell.index,
            planeIndex: planeIndex,
            projection: terrainDressing.projection,
            slopeRooted: !!(supportPlane && supportPlane.renderedTopAt),
            mechanicalEffect: "none"
          };
          cluster.add(mesh);
        });
        dressingGroup.add(cluster);
        terrainDressingRows.push({
          id: placement.id,
          role: placement.role,
          sourceZoneId: placement.sourceZoneId,
          cell: Object.assign({}, placement.cell),
          scaleWorldUnits: scale,
          yawDegrees: placement.yawDegrees || 0,
          planes: 2,
          slopeRooted: true,
          mechanicalEffect: "none"
        });
      });
      first.group.add(dressingGroup);
    }
  }

  /* CL-F08a'S DEFENSIVE ANCHORS. These are exact engine-authored footprints, base datums, and
     storey counts from terrain-features.js. The renderer projects the diagnostic masses but does
     not decide where they stand or silently cap them at the Clayroom's usual two storeys.

     A gatehouse is projected as two piers plus an upper bridge, leaving a true passage void. That
     is still one declared mass and it keeps the terrain proof honest: the climbing causeway
     arrives THROUGH the gate rather than into a painted rectangle. */
  /* A compiled ArchitectureAssemblyPlan supersedes the old role-specific diagnostic proxy.
     Keeping both would double every wall and let the renderer's historical Guard branches
     overwrite the engine-owned assembly we are trying to prove. */
  const declaredDefenseStructures = scene.architecturePlan ? [] : (scene.structures || []);
  if(declaredDefenseStructures.length && built.length){
    const first = built[0];
    const q = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
    const storeyH = TERRAIN_GRID_LAW.storeyQuanta * q;
    const cameraRows = scene.cameraReport && scene.cameraReport.rows
      ? scene.cameraReport.rows : [];
    function cameraRow(id){
      return cameraRows.filter(function(row){ return row.id === id; })[0] || null;
    }
    function mountDefenseBox(parent, structure, part, x, z, w, d, bottomY, height, color){
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, height, d),
        clayStructureMaterial(color));
      mesh.position.set(x, bottomY + height / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.interiorKind = "clay-terrain-defense-structure";
      mesh.userData.terrainDefenseStructure = {
        id: structure.id, role: structure.role, storeys: structure.storeys, part: part
      };
      parent.add(mesh);
      return mesh;
    }
    function mountDefenseTieredColumn(parent, structure, part, x, z, w, d, bottomY, height, color){
      /* Diagnostic massing only: the declared footprint and total storeys remain authoritative.
         Small setbacks keep a legal tall far-band mass from reading as one placeholder cuboid. */
      const lowerH = height * 0.38;
      const middleH = height * 0.34;
      const upperH = height - lowerH - middleH;
      const inset1 = Math.min(0.18, Math.max(0, Math.min(w, d) * 0.07));
      const inset2 = Math.min(0.3, Math.max(0, Math.min(w, d) * 0.12));
      mountDefenseBox(parent, structure, part + "-lower",
        x, z, w, d, bottomY, lowerH, color);
      mountDefenseBox(parent, structure, part + "-middle",
        x, z, Math.max(0.5, w - inset1 * 2), Math.max(0.5, d - inset1 * 2),
        bottomY + lowerH, middleH, 0x7b7670);
      mountDefenseBox(parent, structure, part + "-upper",
        x, z, Math.max(0.5, w - inset2 * 2), Math.max(0.5, d - inset2 * 2),
        bottomY + lowerH + middleH, upperH, 0x827d77);
      mountDefenseBox(parent, structure, part + "-cap",
        x, z, w + 0.18, d + 0.18, bottomY + height, 0.16, 0x918a82);
    }
    declaredDefenseStructures.forEach(function(structure){
      const fp = structure.footprint;
      const centerX = first.originCell.x + fp.x + fp.w / 2 - origin.cx;
      const centerZ = first.originCell.z + fp.y + fp.d / 2 - origin.cz;
      const bottomY = baseY + structure.baseH * q;
      const height = structure.storeys * storeyH;
      const structureGroup = new THREE.Group();
      structureGroup.name = "terrain-defense-" + structure.id;
      structureGroup.userData.terrainDefenseStructureGroup = {
        id: structure.id, role: structure.role, storeys: structure.storeys
      };
      if(structure.role === "gatehouse"){
        const pierW = Math.max(1, fp.w * 0.28);
        const passageW = Math.max(1, fp.w - pierW * 2);
        const openingH = Math.min(height * 0.42, storeyH * 1.55);
        mountDefenseTieredColumn(structureGroup, structure, "west-pier",
          centerX - (fp.w - pierW) / 2, centerZ, pierW, fp.d, bottomY, height, 0x77736e);
        mountDefenseTieredColumn(structureGroup, structure, "east-pier",
          centerX + (fp.w - pierW) / 2, centerZ, pierW, fp.d, bottomY, height, 0x77736e);
        mountDefenseBox(structureGroup, structure, "upper-bridge",
          centerX, centerZ, passageW, Math.max(1, fp.d - 0.35),
          bottomY + openingH, Math.min(storeyH * 1.35, height - openingH), 0x827d77);
        mountDefenseBox(structureGroup, structure, "bridge-cap",
          centerX, centerZ, passageW + 0.18, fp.d - 0.12,
          bottomY + openingH + Math.min(storeyH * 1.35, height - openingH),
          0.16, 0x918a82);
      } else if(structure.role === "guardroom"){
        /* Wave 2's post is a room embedded in a working shelf, not a solid two-storey cube. The
           diagnostic proxy therefore exposes the playable/open front, keeps a full uphill wall,
           shortens the two returns unequally, and carries a shallow roof/deck slab. */
        const wall = Math.min(0.52, Math.max(0.34, Math.min(fp.w, fp.d) * 0.11));
        const roomH = Math.max(storeyH * 1.55, height * 0.78);
        mountDefenseBox(structureGroup, structure, "floor-plinth",
          centerX, centerZ, fp.w, fp.d, bottomY, 0.22, 0x625e59);
        mountDefenseBox(structureGroup, structure, "uphill-back-wall",
          centerX, centerZ - (fp.d - wall) / 2, fp.w, wall,
          bottomY + 0.22, roomH, 0x77716a);
        mountDefenseBox(structureGroup, structure, "west-return-wall",
          centerX - (fp.w - wall) / 2, centerZ - fp.d * 0.08,
          wall, fp.d * 0.84, bottomY + 0.22, roomH * 0.84, 0x716c66);
        mountDefenseBox(structureGroup, structure, "east-return-wall",
          centerX + (fp.w - wall) / 2, centerZ - fp.d * 0.18,
          wall, fp.d * 0.64, bottomY + 0.22, roomH * 0.68, 0x746f69);
        mountDefenseBox(structureGroup, structure, "front-west-pier",
          centerX - fp.w * 0.34, centerZ + (fp.d - wall) / 2,
          wall * 1.25, wall, bottomY + 0.22, roomH * 0.52, 0x716c66);
        mountDefenseBox(structureGroup, structure, "front-east-pier",
          centerX + fp.w * 0.34, centerZ + (fp.d - wall) / 2,
          wall * 1.25, wall, bottomY + 0.22, roomH * 0.72, 0x716c66);
        mountDefenseBox(structureGroup, structure, "working-roof-slab",
          centerX - fp.w * 0.05, centerZ - fp.d * 0.07,
          fp.w * 0.9, fp.d * 0.84, bottomY + roomH * 0.72,
          0.24, 0x625e59);
        mountDefenseBox(structureGroup, structure, "observation-lintel",
          centerX, centerZ - (fp.d - wall) / 2 - 0.02,
          fp.w * 0.54, wall + 0.08, bottomY + roomH * 0.55,
          0.28, 0x8b8175);
      } else if(structure.role === "observation-deck"){
        /* A thin playable crown with a defensive edge and posts, not another building block. */
        const slabY = bottomY + 0.12;
        const parapetH = Math.min(storeyH * 0.48, 0.86);
        const rail = 0.32;
        mountDefenseBox(structureGroup, structure, "deck-slab",
          centerX, centerZ, fp.w, fp.d, bottomY, 0.24, 0x655e56);
        mountDefenseBox(structureGroup, structure, "far-parapet",
          centerX, centerZ - (fp.d - rail) / 2, fp.w, rail,
          slabY + 0.12, parapetH, 0x77716a);
        mountDefenseBox(structureGroup, structure, "west-parapet",
          centerX - (fp.w - rail) / 2, centerZ - fp.d * 0.08,
          rail, fp.d * 0.84, slabY + 0.12, parapetH * 0.8, 0x716c66);
        mountDefenseBox(structureGroup, structure, "east-broken-parapet",
          centerX + (fp.w - rail) / 2, centerZ - fp.d * 0.24,
          rail, fp.d * 0.46, slabY + 0.12, parapetH * 0.62, 0x746f69);
        [-1, 1].forEach(function(side){
          mountDefenseBox(structureGroup, structure, "watch-post-" + (side < 0 ? "west" : "east"),
            centerX + side * (fp.w * 0.5 - 0.28), centerZ - fp.d * 0.42,
            0.34, 0.34, slabY + 0.12, storeyH * 0.82, 0x62584d);
        });
      } else if(structure.role === "retaining-wall"){
        /* Localized masonry follows the working shelf in three unequal runs. This is construction
           negotiating one face, never a repeated contour band around the hill. */
        const runD = fp.d / 3;
        [0, 1, 2].forEach(function(run){
          const runH = storeyH * [0.72, 0.94, 0.61][run];
          mountDefenseBox(structureGroup, structure, "retaining-run-" + run,
            centerX + (run === 1 ? 0.08 : -0.04),
            centerZ - fp.d / 2 + runD * (run + 0.5),
            Math.max(0.42, fp.w), Math.max(0.5, runD - 0.1),
            bottomY, runH, run === 1 ? 0x77716a : 0x716c66);
          mountDefenseBox(structureGroup, structure, "retaining-coping-" + run,
            centerX + (run === 1 ? 0.08 : -0.04),
            centerZ - fp.d / 2 + runD * (run + 0.5),
            Math.max(0.52, fp.w + 0.12), Math.max(0.48, runD - 0.18),
            bottomY + runH, 0.14, 0x918a82);
        });
      } else if(structure.role === "road-barrier"){
        /* Two sockets and one operable beam leave the road physically readable beneath it. */
        const postH = Math.min(storeyH * 0.9, 1.65);
        const postW = 0.42;
        const beamH = 0.28;
        [-1, 1].forEach(function(side){
          mountDefenseBox(structureGroup, structure, "barrier-post-" + (side < 0 ? "west" : "east"),
            centerX + side * (fp.w * 0.5 - postW * 0.55), centerZ,
            postW, Math.max(0.42, fp.d), bottomY, postH, 0x5e5145);
        });
        mountDefenseBox(structureGroup, structure, "operable-beam",
          centerX, centerZ, Math.max(0.5, fp.w - postW * 1.5), 0.24,
          bottomY + postH * 0.52, beamH, 0x6a4938);
      } else if(structure.role === "ruined-tower"){
        /* A ruin is not a solid tower with a "ruined" label. The far/west corner still carries the
           full three-storey silhouette, while the camera-near corner is physically absent and the
           other two supports break at unequal heights. Two partial wall runs establish the tower's
           former enclosure without closing its playable/readable centre. The four canonical FFT
           bearings therefore reveal materially different interior/occlusion reads. */
        const pier = Math.max(0.9, Math.min(1.08, Math.min(fp.w, fp.d) * 0.26));
        const edge = pier / 2 + 0.12;
        const westX = centerX - fp.w / 2 + edge;
        const eastX = centerX + fp.w / 2 - edge;
        const farZ = centerZ - fp.d / 2 + edge;
        const nearZ = centerZ + fp.d / 2 - edge;
        mountDefenseBox(structureGroup, structure, "weathered-plinth",
          centerX, centerZ, fp.w, fp.d, bottomY, 0.22, 0x625e59);
        mountDefenseTieredColumn(structureGroup, structure, "far-west-pier",
          westX, farZ, pier, pier, bottomY + 0.22, height, 0x716d68);
        mountDefenseTieredColumn(structureGroup, structure, "far-east-broken-pier",
          eastX, farZ, pier, pier, bottomY + 0.22, height * 0.72, 0x746f69);
        mountDefenseTieredColumn(structureGroup, structure, "near-west-broken-pier",
          westX, nearZ, pier, pier, bottomY + 0.22, height * 0.46, 0x746f69);
        /* Split wall remnants make a jagged skyline without a decorative sawtooth. Each fragment
           is a structural continuation of the surviving far/west corner, and their unequal tops
           leave the former upper room legible as missing volume. */
        mountDefenseBox(structureGroup, structure, "far-wall-west-fragment",
          westX + 0.95, farZ, 1.45, 0.5,
          bottomY + 0.22, storeyH * 2.12, 0x77716a);
        mountDefenseBox(structureGroup, structure, "far-wall-east-fragment",
          eastX - 0.58, farZ, 0.74, 0.5,
          bottomY + 0.22, storeyH * 1.48, 0x716c66);
        mountDefenseBox(structureGroup, structure, "west-wall-far-fragment",
          westX, farZ + 0.92, 0.5, 1.35,
          bottomY + 0.22, storeyH * 1.72, 0x6d6964);
        mountDefenseBox(structureGroup, structure, "west-wall-near-fragment",
          westX, nearZ - 0.58, 0.5, 0.74,
          bottomY + 0.22, storeyH * 1.02, 0x69645f);
        mountDefenseBox(structureGroup, structure, "fallen-near-sill",
          centerX + fp.w * 0.14, nearZ, Math.max(0.9, fp.w * 0.28), 0.42,
          bottomY + 0.22, storeyH * 0.18, 0x69645f);
      } else {
        mountDefenseTieredColumn(structureGroup, structure, "mass",
          centerX, centerZ, fp.w, fp.d, bottomY, height, 0x716d68);
      }
      group.add(structureGroup);
      const row = cameraRow(structure.id);
      defenseStructures.push({
        id: structure.id, role: structure.role, storeys: structure.storeys,
        footprint: Object.assign({}, fp), baseH: structure.baseH,
        cameraDepth01: row ? row.cameraDepth01 : null,
        inFarBand: row ? row.inFarBand : null
      });
    });
  }

  S.interiorGroup.add(group);
  S.clayRoomTerrainBenchGroup = group;
  S.clayRoomTerrainForeignRestorePending = true;

  /* The governed zoom is fitted to the FIELD, not to the 15x15 host room: a 24x24 bench sheet or
     six 12x16 boundary frames in a row do not fit a room-sized frame, and a cropped proof frame is
     not a proof. Still a governed zoom inside the fixture's own range — never a free orbit. */
  const spanCells = Math.max(totalWidth, fields.length
    ? Math.max.apply(null, fields.map(function(f){ return f.extent.y; })) : 15);
  const fitZoom = Math.max(0.3, Math.min(2.5, (spanCells / 15) * 1.28));
  S.clayCamZoom = fitZoom;
  S.clayRoomTerrainHalfSpan = spanCells / 2;
  group.userData.terrainFitZoom = fitZoom;
  clayRoomApplyCamPose();

  /* The receipt. One source of numbers: the same terrainBenchGateReport() the jsdom harness calls,
     plus what this frame actually placed, so a capture can never disagree with the gate. */
  const receiptFixture = scene.architectureFixture || scene.featureBook || CL_F07_TERRAIN_BENCH;
  S.clayRoomTerrainReport = {
    fixtureId: receiptFixture.id,
    fixtureVersion: receiptFixture.version,
    status: receiptFixture.status,
    proof: receiptFixture.proof || receiptFixture.question,
    sceneId: sceneId,
    frameIndex: frameIndex,
    frameCount: scene.frameCount || 1,
    boundary: scene.boundary || null,
    seed: fields.length ? fields[0].seed : null,
    view: S.clayRoomTerrainView || "production",
    fitZoom: fitZoom,
    strategicDistanceClamped: S.clayRoomStrategicDistanceClamped || null,
    cameraFarSizing: S.clayRoomCameraFar || null,
    requestedLightRecipe: requestedLightRecipe,
    appliedLightRecipe: S.clayRoomLightRecipeId
      || (S.clayRoomCompiled && S.clayRoomCompiled.lightRecipeId) || null,
    lightRecipeDrift: !!(requestedLightRecipe && S.clayRoomLightRecipeId !== requestedLightRecipe),
    neutralizeHostRig: neutralizeRig,
    guardVisualProfile: !goldenScene ? null : (scene.visualProfile ? {
      requestedProfileId: scene.visualProfileRequested,
      schema: scene.visualProfile.schema,
      version: scene.visualProfile.version,
      profileId: scene.visualProfile.profileId,
      cultureId: scene.visualProfile.cultureId,
      planRef: scene.visualProfile.planRef,
      mechanicsRef: scene.visualProfile.mechanicsRef,
      materialPackRef: scene.visualProfile.materialPackRef,
      groundCalibration: scene.visualProfile.groundCalibration || null,
      terrainDressing: scene.visualProfile.terrainDressing ? {
        schema: scene.visualProfile.terrainDressing.schema,
        id: scene.visualProfile.terrainDressing.id,
        projection: scene.visualProfile.terrainDressing.projection,
        placementRule: scene.visualProfile.terrainDressing.placementRule,
        placementCount: scene.visualProfile.terrainDressing.placements.length,
        renderedRows: terrainDressingRows,
        mechanicalEffect: scene.visualProfile.terrainDressing.mechanicalEffect
      } : null,
      terrainOccluderPresentation: scene.visualProfile.terrainOccluderPresentation ? {
        schema: scene.visualProfile.terrainOccluderPresentation.schema,
        catalog: scene.visualProfile.terrainOccluderPresentation.catalog,
        allowedSlugs: scene.visualProfile.terrainOccluderPresentation.allowedSlugs.slice(),
        placementAuthority: scene.visualProfile.terrainOccluderPresentation.placementAuthority,
        transformAuthority: scene.visualProfile.terrainOccluderPresentation.transformAuthority,
        collisionAuthority: scene.visualProfile.terrainOccluderPresentation.collisionAuthority,
        selectionBudget: Object.assign({},
          scene.visualProfile.terrainOccluderPresentation.selectionBudget),
        fallback: scene.visualProfile.terrainOccluderPresentation.fallback,
        fields: built.map(function(fieldRecord){
          return {
            id: fieldRecord.field.id,
            report: fieldRecord.terrainOccluderPresentation
          };
        }),
        mechanicalEffect: scene.visualProfile.terrainOccluderPresentation.mechanicalEffect
      } : null,
      fingerprint: scene.visualProfile.fingerprint,
      contextVerdict: "PENDING_GUARD_POST_REVIEW",
      projection: guardVisualContext ? guardVisualContext.report : null
    } : {
      requestedProfileId: scene.visualProfileRequested || null,
      contextVerdict: "NEUTRAL_CLAY_CONTROL",
      projection: null
    }),
    worldPixelDensityProof: worldPixelDensityProof ? {
      schema: worldPixelDensityProof.schema,
      id: worldPixelDensityProof.id,
      targetPixelsPerFoot: worldPixelDensityProof.targetPixelsPerFoot,
      actorCount: worldPixelDensityProof.actorCount,
      sourceManifest: worldPixelDensityProof.sourceManifest,
      placementRule: worldPixelDensityProof.placementRule,
      planRef: worldPixelDensityProof.planRef,
      mechanicsRef: worldPixelDensityProof.mechanicsRef,
      mechanicalEffect: worldPixelDensityProof.mechanicalEffect
    } : null,
    witnessPolicy: goldenScene
      ? (worldPixelDensityProof
        ? "explicit-governed-population-proof-only"
        : "no-implicit-terrain-diagnostic-witnesses")
      : "terrain-diagnostic-witnesses-allowed",
    gridLaw: TERRAIN_GRID_LAW,
    /* WHICH DEVICES DREW THIS FRAME, and the walk-only fingerprint of every field in it. The second
       half is what makes "this is a dressing pass" provable rather than claimed: it folds only the
       heights, the standable flags, the walk adjacency, the faces and the entries — nothing a
       render device can reach — so it must be byte-identical across all six rungs. */
    expression: {
      rungId: expressionFlags.rungId,
      rungIndex: expressionFlags.rungIndex,
      rungLabel: expressionFlags.rungLabel,
      devicesOn: expressionFlags.on,
      devicesOff: expressionFlags.off,
      shallowGradeH: (typeof TERRAIN_SHALLOW_GRADE_H === "number") ? TERRAIN_SHALLOW_GRADE_H : null,
      shallowGradeDeg: (typeof terrainSlopeDegForStepH === "function"
        && typeof TERRAIN_SHALLOW_GRADE_H === "number")
        ? Number(terrainSlopeDegForStepH(TERRAIN_SHALLOW_GRADE_H).toFixed(3)) : null,
      walkStepDeg: (typeof terrainSlopeDegForStepH === "function")
        ? Number(terrainSlopeDegForStepH(1).toFixed(3)) : null,
      noiseBudgetH: (typeof TERRAIN_WALK_NOISE_BUDGET_H === "object")
        ? TERRAIN_WALK_NOISE_BUDGET_H.perCellH : null,
      capH: CLAY_TERRAIN_CAP_H, chamfer: CLAY_TERRAIN_CHAMFER,
      rollover: CLAY_TERRAIN_ROLLOVER, nosing: CLAY_TERRAIN_NOSING,
      /* ─── R2 ROUND ADDITIONS ────────────────────────────────────────────────────────────────
         Every one of Adam's rulings that has a NUMBER puts it in the receipt, so the packet he
         rules on carries the measurement beside the picture instead of a claim about it. */
      gradeId: expressionFlags.gradeId || null,
      gradeDeg: expressionFlags.gradeDeg == null ? null : expressionFlags.gradeDeg,
      gradeMode: expressionFlags.gradeMode || null,
      gradeLadder: (typeof TERRAIN_GRADE_LADDER === "object")
        ? TERRAIN_GRADE_LADDER.map(function(g){
            return { id: g.id, deg: g.deg, edgeDeg: g.edgeDeg, mode: g.mode, label: g.label }; })
        : null,
      gradeMaxProposed: (typeof TERRAIN_GRADE_MAX_PROPOSED === "object")
        ? TERRAIN_GRADE_MAX_PROPOSED : null,
      overhangMode: overhangMode,
      overhangLaw: (typeof TERRAIN_OVERHANG_LAW === "object") ? TERRAIN_OVERHANG_LAW : null,
      overhangCensus: built.map(function(b){
        return { id: b.field.id, census: b.overhangCensus || null };
      }),
      dioramaTrayClosure: (typeof TERRAIN_DIORAMA_TRAY_CLOSURE === "object")
        ? {
            law: TERRAIN_DIORAMA_TRAY_CLOSURE,
            fields: built.map(function(b){
              return { id: b.field.id, report: b.trayClosure || null };
            })
          }
        : null,
      baseSkirt: (typeof TERRAIN_BASE_SKIRT === "object") ? TERRAIN_BASE_SKIRT : null,
      baseSkirtDepthApplied: clayRoomTerrainSkirtDepth(),
      mediumAccessLaw: (typeof TERRAIN_MEDIUM_ACCESS_LAW === "object")
        ? TERRAIN_MEDIUM_ACCESS_LAW : null,
      mediumAccessCensus: (typeof terrainMediumAccessCensus === "function")
        ? built.map(function(b){
            const c = terrainMediumAccessCensus(b.field);
            return { id: b.field.id, standable: c.standableCells, admitting: c.mediumAdmittingCells,
              share: c.mediumShare, cohesion: c.cohesion, smallTinyOnly: c.smallTinyOnlyCells,
              entriesBlocked: c.entriesBlockedToMedium, ok: c.ok }; })
        : null,
      climbEased: (typeof TERRAIN_CLIMB_EASED === "object") ? TERRAIN_CLIMB_EASED : null,
      climbCensus: (typeof terrainFaceClimbCensus === "function")
        ? built.map(function(b){
            const c = terrainFaceClimbCensus(b.field);
            return { id: b.field.id, faces: c.faces, eased: c.easedFaces, share: c.easedShare,
              auto: c.autoFaces }; })
        : null,
      /* The angle gate used to inspect each cell in isolation. This receipt records the proposition
         the picture actually needs: cells that claim one surface agree at the same shared points. */
      surfaceContinuity: (typeof terrainSurfaceContinuityReport === "function")
        ? built.map(function(b){
            return { id: b.field.id, report: terrainSurfaceContinuityReport(b.field, expressionFlags) };
          })
        : null,
      surfaceVariation: (typeof terrainSurfaceVariationReport === "function")
        ? built.map(function(b){
            return { id: b.field.id, report: terrainSurfaceVariationReport(b.field, expressionFlags) };
          })
        : null,
      fineJointLaw: (typeof TERRAIN_FINE_JOINT_LAW === "object")
        ? TERRAIN_FINE_JOINT_LAW : null,
      walkFingerprints: (typeof terrainWalkFingerprint === "function")
        ? built.map(function(b){ return { id: b.field.id, walk: terrainWalkFingerprint(b.field) }; })
        : null,
      probe: contractProbe ? "standee-contract" : null,
      contractPicks: contractProbe ? contractPicks : null,
      contract: (typeof TERRAIN_STANDEE_CONTRACT === "object")
        ? { protectedDiameterMediumCap: Number(terrainProtectedDiameter("mediumCap").toFixed(4)),
            protectedDiameterMedium: Number(terrainProtectedDiameter("medium").toFixed(4)),
            protectedDiameterSmall: Number(terrainProtectedDiameter("small").toFixed(4)),
            protectedDiameterLarge: Number(terrainProtectedDiameter("large").toFixed(4)),
            thresholds: TERRAIN_CONTACT_THRESHOLDS }
        : null
    },
    fields: built.map(function(b){
      return {
        id: b.field.id, segmentId: b.field.segmentId, seed: b.field.seed,
        fingerprint: b.field.fingerprint,
        extent: b.field.extent, shape: b.field.shape,
        slopeClamp: b.field.slopeClamp, waterDatumH: b.field.waterDatumH,
        metrics: b.field.metrics,
        pieces: b.field.pieces,
        degradedFrom: b.field.degradedFrom,
        cellMeshes: b.cellMeshes,
        /* [cellX, cellY, worldX, worldY(top surface), worldZ, inPlayfield] per non-void cell. */
        declaredCellTops: b.declaredTops,
        declaredCellTopsFormat: "[cellX,cellY,worldX,worldYTop,worldZ,inPlayfield]"
      };
    }),
    macroGraph: scene.macroGraph || null,
    routeReport: scene.routeReport || null,
    quietSurfaceReport: scene.quietSurfaceReport || null,
    witnesses: witnesses,
    witnessFailures: witnessFailures,
    /* COUNTABLE FRAME CENSUS, walked off the live scene after everything is mounted. The bench may
       contain terrain, water, volumes, its own witnesses, declared span beams and its own overlays
       — and nothing else. A foreign figure, or a bench object that is none of those, is a defect
       the receipt must name rather than a thing a viewer has to spot. */
    fieldWorldBounds: built.map(function(bd){
      return { id: bd.field.id,
        minX: bd.originCell.x - origin.cx, maxX: bd.originCell.x - origin.cx + bd.field.extent.x,
        minZ: bd.originCell.z - origin.cz, maxZ: bd.originCell.z - origin.cz + bd.field.extent.y };
    }),
    frameCensus: (function(){
      const c = { terrainCells: 0, water: 0, volumes: 0, spans: 0, overlays: 0,
        defenseStructures: 0, architectureMembers: 0, architectureAssets: 0,
        architectureAssetParts: 0,
        terrainOccluderAssets: 0, terrainOccluderAssetParts: 0,
        terrainDressing: 0, witnessFigures: 0, witnessParts: 0,
        foreignFigures: 0, untagged: 0, untaggedSample: [],
        expression: 0, occluders: 0,
        spanPositions: [], spansOutsideDeclaringBay: 0, fieldBounds: null };
      if(!S.interiorGroup) return c;
      function visible(node){
        let cur = node;
        while(cur){ if(cur.visible === false) return false; cur = cur.parent; }
        return true;
      }
      S.interiorGroup.traverse(function(node){
        const ud = node.userData || {};
        if(ud.clayTerrainWitness && visible(node)) c.witnessFigures++;
        if(ud.clayArchitectureAsset && visible(node)) c.architectureAssets++;
        if(ud.terrainOccluderAsset && visible(node)) c.terrainOccluderAssets++;
        /* Joint metadata lives on the A4 group rather than one of its line children. Count it
           before the mesh-only census guard so a line law cannot silently disappear from receipts. */
        if(ud.terrainJointPattern && visible(node)){
          c.fineJointGroups = (c.fineJointGroups || 0) + 1;
          c.fineJointPatterns = c.fineJointPatterns || [];
          if(c.fineJointPatterns.indexOf(ud.terrainJointPattern) < 0){
            c.fineJointPatterns.push(ud.terrainJointPattern);
          }
          if(ud.terrainFineJointReachesBoundary){
            c.fineJointBoundaryBreaches = (c.fineJointBoundaryBreaches || 0) + 1;
          }
        }
        if(!(node.isMesh || node.isSprite) || !visible(node)) return;
        let inWitness = false, inArchitectureAsset = false;
        let inTerrainOccluderAsset = false, cur = node;
        while(cur){
          if(cur.userData && cur.userData.clayTerrainWitness) inWitness = true;
          if(cur.userData && cur.userData.clayArchitectureAsset) inArchitectureAsset = true;
          if(cur.userData && cur.userData.terrainOccluderAsset){
            inTerrainOccluderAsset = true;
          }
          cur = cur.parent;
        }
        if(ud.terrainCell) c.terrainCells++;
        else if(ud.terrainDressing) c.terrainDressing++;
        else if(ud.terrainWater) c.water++;
        else if(ud.terrainVolume) c.volumes++;
        else if(ud.terrainDefenseStructure) c.defenseStructures++;
        else if(ud.clayArchitectureMember) c.architectureMembers++;
        else if(inArchitectureAsset) c.architectureAssetParts++;
        else if(inTerrainOccluderAsset) c.terrainOccluderAssetParts++;
        else if(ud.terrainSpan){
          c.spans++;
          /* A span must sit over the piece that declared it. Recording each beam's world position
             makes "a beam floating off the edge of the field" a number rather than something a
             human has to notice in a 2x crop. */
          const sp = new THREE.Vector3(); node.getWorldPosition(sp);
          c.spanPositions = c.spanPositions || [];
          c.spanPositions.push([Number(sp.x.toFixed(2)), Number(sp.y.toFixed(2)), Number(sp.z.toFixed(2))]);
          if(ud.terrainSpan.outsideDeclaringBay) c.spansOutsideDeclaringBay = (c.spansOutsideDeclaringBay || 0) + 1;
        }
        else if(ud.terrainSupportCell || ud.terrainRoute) c.overlays++;
        else if(ud.terrainExpression){
          c.expression = (c.expression || 0) + 1;
          if(ud.terrainOccluder) c.occluders = (c.occluders || 0) + 1;
          /* R3/R6 — COUNTED OFF THE LIVE SCENE, not off the intent. `overhangApplied` is what the
             renderer actually built, which is the only thing worth comparing against the licence;
             `climbBits` is the eased-face affordance, so "the affordance is visible" is a number. */
          if(ud.terrainOverhangApplied){
            c.overhangShafts = (c.overhangShafts || 0) + 1;
            if(ud.terrainOverhangApplied.any) c.overhangCellsApplied = (c.overhangCellsApplied || 0) + 1;
            c.overhangApplied = c.overhangApplied || [];
            if(ud.terrainOverhangApplied.any){
              c.overhangApplied.push([ud.terrainOverhangApplied.cell,
                (ud.terrainOverhangApplied.w ? "w" : "") + (ud.terrainOverhangApplied.e ? "e" : "")
                + (ud.terrainOverhangApplied.n ? "n" : "") + (ud.terrainOverhangApplied.s ? "s" : "")]);
            }
          }
          if(ud.terrainClimbBit){
            c.climbBits = (c.climbBits || 0) + 1;
            c.climbBitFaces = c.climbBitFaces || [];
            if(c.climbBitFaces.indexOf(ud.terrainClimbBit.faceId) < 0){
              c.climbBitFaces.push(ud.terrainClimbBit.faceId);
            }
          }
        }
        else if(inWitness) c.witnessParts++;
        else if(ud.sceneObjectId || ud.unitId || ud.spriteSlug || ud.bestiaryId) c.foreignFigures++;
        else {
          c.untagged++;
          if(c.untaggedSample.length < 6){
            const wp = new THREE.Vector3(); node.getWorldPosition(wp);
            c.untaggedSample.push({ keys: Object.keys(ud).slice(0, 6),
              at: [Number(wp.x.toFixed(2)), Number(wp.y.toFixed(2)), Number(wp.z.toFixed(2))] });
          }
        }
      });
      return c;
    })(),
    witnessContact: witnessContact,
    witnessMinSupport: witnessContact.length
      ? Math.min.apply(null, witnessContact.map(function(c){
          return c.sameHeightNeighbours == null ? 4 : c.sameHeightNeighbours; })) : null,
    witnessMaxGap: witnessContact.length
      ? Number(Math.max.apply(null, witnessContact.map(function(c){ return c.gap; })).toFixed(4)) : null,
    hostSuppressed: hostSuppressed,
    foreignLightsNeutralized: foreignLights,
    featureBook: scene.featureBook ? {
      id: scene.featureBook.id, version: scene.featureBook.version,
      status: scene.featureBook.status, featureId: scene.featureId || null,
      feature: scene.feature ? {
        id: scene.feature.id, name: scene.feature.name, scale: scene.feature.scale,
        construction: scene.feature.construction, tacticalRead: scene.feature.tacticalRead,
        qualityLock: scene.feature.qualityLock
      } : null,
      tacticalGrammar: scene.tacticalGrammar || null,
      cameraLaw: scene.cameraLaw || null,
      cameraReport: scene.cameraReport || null,
      structures: defenseStructures
    } : null,
    architecture: scene.architecturePlan ? {
      fixtureId: scene.architectureFixture.id,
      fixtureVersion: scene.architectureFixture.version,
      formId: scene.architecturePlan.formId,
      label: scene.architecturePlan.label,
      scale: scene.architecturePlan.scale,
      primarySpatialSentence: scene.architecturePlan.primarySpatialSentence,
      constructionProfile: scene.architecturePlan.constructionProfile,
      physicalState: scene.architecturePlan.physicalState,
      operatingState: scene.architecturePlan.operatingState,
      battleSpaceMode: scene.architecturePlan.battleSpaceMode,
      occupantProfile: scene.architecturePlan.occupantProfile,
      assemblyClearancePolicy: scene.architecturePlan.assemblyClearancePolicy,
      materializationWindow: scene.architecturePlan.materializationWindow || null,
      scaleRegime: scene.architecturePlan.scaleRegime || null,
      wonderSignature: scene.architecturePlan.wonderSignature || null,
      variation: scene.architecturePlan.variation || null,
      growth: scene.architecturePlan.growth || null,
      cultureProfileId: scene.architecturePlan.cultureProfileId || null,
      cultureMorphology: scene.architecturePlan.cultureMorphology || null,
      worldSignifierLayer: scene.architecturePlan.worldSignifierLayer || null,
      conditionProjection: scene.architecturePlan.conditionProjection || [],
      wallFaceModulePlans: scene.architecturePlan.wallFaceModulePlans || [],
      wallFaceModuleCompilerReceipt:
        scene.architecturePlan.wallFaceModuleCompilerReceipt || null,
      clearanceEnvelopes: scene.architecturePlan.clearanceEnvelopes || [],
      presentation: scene.architecturePlan.presentation || null,
      validation: scene.architecturePlan.validation,
      memberCount: architectureProjection ? architectureProjection.memberCount : 0,
      physicalMemberCount: architectureProjection ? architectureProjection.physicalMemberCount : 0,
      presentationHiddenCount: architectureProjection
        ? architectureProjection.presentationHiddenCount : 0,
      suppressedConditionReceiverCount: architectureProjection
        ? architectureProjection.suppressedConditionReceiverCount : 0,
      shaderConditionMemberCount: architectureProjection
        ? architectureProjection.shaderConditionMemberCount : 0,
      wallModuleMemberCount: architectureProjection
        ? architectureProjection.wallModuleMemberCount : 0,
      wallModuleProjectionRows: architectureProjection
        ? architectureProjection.wallModuleProjectionRows : [],
      conditionProjectionRows: architectureProjection
        ? architectureProjection.conditionProjectionRows : [],
      conditionProjectionPolicy: architectureProjection
        ? architectureProjection.conditionProjectionPolicy : null,
      materialRoles: architectureProjection ? architectureProjection.materialRoles : {},
      lightSockets: architectureProjection ? architectureProjection.lightRows : [],
      assetSockets: architectureProjection ? architectureProjection.assetRows : [],
      promotionCensus: (typeof ARCHITECTURE_ASSET_PROMOTION_CENSUS === "object")
        ? ARCHITECTURE_ASSET_PROMOTION_CENSUS : null,
      barrierAudit: scene.architecturePlan.barrierAudit,
      accessGraph: scene.architecturePlan.accessGraph,
      stairs: scene.architecturePlan.stairs.map(function(stair){
        return {
          id: stair.id, start: stair.start, end: stair.end,
          baseY: stair.baseY, topY: stair.topY, width: stair.width,
          foundationBaseY: stair.foundationBaseY, supportMode: stair.supportMode,
          lowerLandingId: stair.lowerLandingId, upperLandingId: stair.upperLandingId
        };
      }),
      openings: scene.architecturePlan.openings.map(function(opening){
        return { id: opening.id, runId: opening.runId, kind: opening.kind,
          width: opening.width, height: opening.height, access: opening.access,
          observation: opening.observation };
      })
    } : null,
    oneClamp: scene.proof || null,
    route: scene.route ? {
      sourceRow: scene.route.sourceRow, namedEntries: scene.route.namedEntries,
      approachCells: scene.route.approach ? scene.route.approach.length : 0,
      retreatCells: scene.route.retreat ? scene.route.retreat.length : 0,
      deploymentCells: scene.route.deployment.length,
      objective: scene.route.objective, plans: scene.route.plans
    } : null,
    walkDown: scene.walkDown ? {
      degradedFrom: scene.walkDown.degradedFrom, legalBoard: scene.walkDown.legalBoard,
      requestedFootprintCells: scene.walkDown.requestedFootprintCells,
      finalFootprintCells: scene.walkDown.finalFootprintCells,
      trayCells: scene.walkDown.trayCells } : null,
    support: scene.support || null,
    synthesis: scene.compilation ? {
      version: scene.compilation.version,
      planFingerprint: scene.compilation.plan.planFingerprint,
      mechanicsFingerprint: scene.compilation.plan.mechanicsFingerprint,
      receiptFingerprint: scene.compilation.receipt.receiptFingerprint,
      selectedCandidateId: scene.compilation.receipt.selectedCandidateId,
      candidates: scene.compilation.receipt.candidates,
      scoring: scene.compilation.receipt.scoring,
      repairs: scene.compilation.receipt.repairs,
      surfaceDemandCount: scene.compilation.surfaceDemands.length,
      materialFamilyCount: scene.compilation.materialFamilies.families.length,
      surfaceBindingCount: scene.compilation.surfaceProjection.bindings.length,
      proofPackage: scene.compilation.proofPackage
    } : null,
    gate: architectureScene && typeof architectureFormGateReport === "function"
      ? architectureFormGateReport(seed)
      : (scene.compilation && typeof goldenVignetteValidateCompilation === "function"
      ? goldenVignetteValidateCompilation(scene.compilation)
      : (scene.featureBook && typeof terrainFeatureGateReport === "function"
        ? terrainFeatureGateReport(seed)
        : ((typeof terrainBenchGateReport === "function") ? terrainBenchGateReport(seed) : null)))
  };
  /* Read-only capture seams, in this file's established window.Theater._*ForTest convention.
     The view seam is the ONLY one that mutates, and it mutates exactly one governed camera mode —
     never a free orbit, which the clay-proof contract forbids. */
  /* Sprite textures load ASYNCHRONOUSLY. The first mount can legitimately run before the witness
     PNG has decoded, and a bench with no witness in it proves nothing about scale — §4.2's second
     condition is the six-foot human on every relief datum. So: if any witness was refused for a
     not-ready texture, request one rebuild once the decode has had time to land. Bounded to a
     single retry (a flag on S), so it can never become a render loop. */
  if(witnessFailures.length && !S.clayRoomTerrainWitnessRetry){
    S.clayRoomTerrainWitnessRetry = true;
    setTimeout(function(){
      if(S.clayRoomFixtureId !== CLAY_ROOM_TERRAIN_BENCH_ID) return;
      if(S.clayRoomTerrainBenchGroup && S.clayRoomTerrainBenchGroup.parent){
        S.clayRoomTerrainBenchGroup.parent.remove(S.clayRoomTerrainBenchGroup);
        clearGroup(S.clayRoomTerrainBenchGroup);
      }
      clayRoomMountTerrainBench();
      markDirty(); scheduleRender();
    }, 900);
  }
  if(window.Theater){
    /* The report is built ONCE at mount; the camera moves afterwards (the strategic toggle only
       re-poses it, and pan/zoom re-pose it again). So the projection is read LIVE at probe time and
       appended — a receipt that carries a mount-time camera would let a capture project every cell
       through a pose the banked PNG was not taken at. With this block a capture can compute, for
       every declared cell, the exact pixel it occupies in the frame: that is what makes "did the
       renderer draw the whole declared field?" countable instead of a thing a viewer must spot. */
    window.Theater._clayTerrainBenchForTest = function(){
      const report = S.clayRoomTerrainReport;
      if(!report) return null;
      return Object.assign({}, report, {
        cameraProjection: clayTerrainCameraProjection(),
        cameraQuarterTurn: clayRoomTerrainQuarterTurnSnapshot()
      });
    };
    window.Theater._clayTerrainSetViewForTest = function(view){ return clayRoomSetTerrainView(view); };
    window.Theater._clayTerrainSetQuarterTurnForTest = function(step){
      return clayRoomSetTerrainQuarterTurn(step);
    };
    /* A production plate is evidence of the authored scene, never of the workbench selection
       state that happened to be active when the terrain fixture mounted. Keep this as an explicit
       capture seam instead of teaching ordinary selection to disappear: diagnostic captures may
       still show the BoxHelper, while clean/beauty captures can remove it deterministically. */
    window.Theater._clayTerrainClearSelectionForTest = function(){
      clayRoomHighlightSelection(null);
      S.clayRoomSelectedId = null;
      return !S.clayRoomSelectionHelper && !S.clayRoomSelectionGlowSprite;
    };
    /* THE GOVERNED POSE, for the resize-survival probe (dev/verify-clay-camera-resize.cjs). Read
       seam reports what the pose actually produced — including the far plane, which is part of it —
       so a probe can ask the physical question (is the whole content sphere inside the frustum?)
       rather than eyeball a frame. The setter goes through clayRoomApplyCamPose, the same entry
       point the drag and wheel handlers use, so the probe exercises the shipped path; it moves the
       governed pan and zoom only, never bearing or pitch, which the clay-proof contract forbids. */
    window.Theater._clayCamPoseForTest = function(){
      if(!S.camera) return null;
      const t = S.cameraLookTarget || null;
      return {
        diagnosticActive: !!S.clayRoomDiagnosticActive,
        pos: S.camera.position.toArray(),
        target: t ? t.toArray() : null,
        far: S.camera.far, near: S.camera.near, aspect: S.camera.aspect,
        dist: t ? S.camera.position.distanceTo(t) : null,
        contentRadius: clayRoomPosedContentRadius(),
        offset: S.clayCamOffset ? { x: S.clayCamOffset.x, z: S.clayCamOffset.z } : null,
        zoom: S.clayCamZoom != null ? S.clayCamZoom : null,
        rotationStep: ((Number(S.rotationStep) || 0) % 4 + 4) % 4,
        bearingDeg: clayRoomCameraBearingDeg(),
        fitPos: S.clayCamFit ? S.clayCamFit.pos.toArray() : null,
        posedAt: S.clayCamPosedAt ? S.clayCamPosedAt.toArray() : null
      };
    };
    window.Theater._clayCamPoseSetForTest = function(offset, zoom){
      if(offset) S.clayCamOffset = { x: offset.x, z: offset.z };
      if(zoom != null) S.clayCamZoom = zoom;
      clayRoomApplyCamPose();
      return window.Theater._clayCamPoseForTest();
    };
    /* THE BACKDROP PLATE. The same frame with the bench hidden and nothing else changed — same
       camera, same lights, same canvas. It is what "nothing is there" looks like at every pixel,
       which is the only honest answer to that question in a frame carrying a vignette gradient: the
       modal-colour version of this test read the ground itself as backdrop the moment the field
       filled the frame. Visibility only — the group is never detached, so the next render restores
       it exactly. */
    window.Theater._clayTerrainSetBenchVisibleForTest = function(visible){
      if(!S.clayRoomTerrainBenchGroup) return false;
      S.clayRoomTerrainBenchGroup.visible = !!visible;
      markDirty(); scheduleRender();
      return true;
    };
    window.Theater._clayTerrainSetFrameForTest = function(i){ return clayRoomSetTerrainFrame(i); };
    /* THE FACING + CONTACT INSTRUMENT, read LIVE after the render pass — see
       clayTerrainWitnessFacingReport's own header for the two defects it exists to count. */
    window.Theater._clayTerrainWitnessFacingForTest = function(){ return clayTerrainWitnessFacingReport(); };
    window.Theater._clayTerrainSetRungForTest = function(id){ return clayRoomSetTerrainRung(id); };
    window.Theater._clayTerrainSetGradeForTest = function(id){ return clayRoomSetTerrainGrade(id); };
    window.Theater._clayTerrainExpressionForTest = function(){
      return (S.clayRoomTerrainReport && S.clayRoomTerrainReport.expression) || null;
    };
    window.Theater._clayInteriorGroupForTest = function(){ return S.interiorGroup || null; };
  }
  S.standeeCollisionDirty = true;
  return group;
}

function clayRoomSetTerrainScene(sceneId){
  if(CLAY_TERRAIN_SCENE_IDS.indexOf(sceneId) < 0) return false;
  S.clayRoomTerrainSceneId = sceneId;
  S.clayRoomTerrainWitnessRetry = false;
  if(S.clayRoomFixtureId !== CLAY_ROOM_TERRAIN_BENCH_ID) return false;
  if(S.clayRoomTerrainBenchGroup && S.clayRoomTerrainBenchGroup.parent){
    S.clayRoomTerrainBenchGroup.parent.remove(S.clayRoomTerrainBenchGroup);
    clearGroup(S.clayRoomTerrainBenchGroup);
  }
  clayRoomMountTerrainBench();
  markDirty(); scheduleRender();
  return true;
}

function clayRoomSetTerrainView(view){
  if(view !== "production" && view !== "strategic") return false;
  S.clayRoomTerrainView = view;
  clayRoomApplyCamPose();
  return true;
}

function clayRoomCameraBearingDeg(){
  if(!S.camera) return null;
  const target = S.cameraLookTarget || (S.clayCamFit && S.clayCamFit.target);
  if(!target) return null;
  const dx = S.camera.position.x - target.x;
  const dz = S.camera.position.z - target.z;
  if(dx * dx + dz * dz < 0.000001) return null;
  const bearing = ((Math.atan2(dx, dz) * 180 / Math.PI) % 360 + 360) % 360;
  return Number(bearing.toFixed(3));
}

function clayRoomTerrainQuarterTurnSnapshot(){
  const step = ((Number(S.rotationStep) || 0) % 4 + 4) % 4;
  return {
    step: step,
    bearingDeg: clayRoomCameraBearingDeg(),
    canonicalBearings: 4,
    incrementDeg: 90,
    freeOrbit: false,
    productionRotateVerb: true
  };
}

function clayRoomRefreshTerrainTurnControl(){
  const control = S.clayRoomTerrainTurnControl;
  if(!control) return;
  const active = S.clayRoomFixtureId === CLAY_ROOM_TERRAIN_BENCH_ID;
  control.root.style.display = active ? "flex" : "none";
  const snap = clayRoomTerrainQuarterTurnSnapshot();
  control.label.textContent = "VIEW " + snap.step + " · "
    + (snap.bearingDeg == null ? "—" : snap.bearingDeg + "°");
}

/* Discrete and deliberately asymmetric: this delegates to production rotate(), whose public combat
   control is also a clockwise quarter turn. Setting an earlier numbered view may invoke it up to
   three times, but there is still no arbitrary yaw, pitch, or orbit seam. After rotate() performs
   the host fit, the Clayroom captures that bearing as its fresh fit and reapplies only its governed
   terrain pan/zoom. */
function clayRoomSetTerrainQuarterTurn(step){
  if(S.clayRoomFixtureId !== CLAY_ROOM_TERRAIN_BENCH_ID || !S.camera
    || typeof rotate !== "function" || !isFinite(Number(step))) return false;
  const desired = ((Number(step) | 0) % 4 + 4) % 4;
  const current = ((Number(S.rotationStep) || 0) % 4 + 4) % 4;
  const turns = (desired - current + 4) % 4;
  for(let i = 0; i < turns; i++) rotate();
  if(turns){
    clayRoomSettleCameraPoseTween();
    clayRoomCaptureCamFit();
  }
  S.clayRoomTerrainQuarterTurnRequested = desired;
  clayRoomApplyCamPose();
  clayRoomRefreshTerrainTurnControl();
  return clayRoomTerrainQuarterTurnSnapshot();
}

function clayRoomTerrainBenchSnapshot(){
  return S.clayRoomTerrainReport || null;
}

function clayRoomSuppressLightingBenchNoise(){
  if((S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID
    && S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID
    && S.clayRoomFixtureId !== CLAY_ROOM_SPRITE_BENCH_ID) || !S.moteGroup) return;
  stopMoteDrift();
  if(S.moteGroup.parent) S.moteGroup.parent.remove(S.moteGroup);
  clearGroup(S.moteGroup);
  S.moteGroup = null;
}

function clayRoomDisposeLightOverlays(){
  const group = S.clayRoomLightOverlayGroup;
  if(!group) return;
  if(group.parent) group.parent.remove(group);
  clearGroup(group);
  S.clayRoomLightOverlayGroup = null;
}

function clayRoomBuildLightOverlays(){
  clayRoomDisposeLightOverlays();
  if(S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID || !S.scene) return null;
  const modes = S.clayRoomLightOverlayModes || { position: false, range: false, shadow: false };
  S.clayRoomLightOverlayModes = modes;
  const group = new THREE.Group();
  group.name = "cl-f02-light-overlays";
  group.userData.clayLightingOverlay = true;
  (S.interiorLightTargets || []).forEach(function(target){
    if(!target || !target.pl) return;
    const light = target.pl;
    const p = new THREE.Vector3();
    light.getWorldPosition(p);
    const rawX = p.x + ((S.boardOrigin && S.boardOrigin.cx) || 0);
    const rawZ = p.z + ((S.boardOrigin && S.boardOrigin.cz) || 0);
    const floorY = interiorFloorTopAt(S.interiorFloorTopMap, rawX, rawZ) + 0.018;
    const color = light.color && typeof light.color.getHex === "function" ? light.color.getHex() : 0xffffff;
    if(modes.position){
      const r = 0.22;
      const points = [
        p.x - r, p.y, p.z, p.x + r, p.y, p.z,
        p.x, p.y - r, p.z, p.x, p.y + r, p.z,
        p.x, p.y, p.z - r, p.x, p.y, p.z + r,
        p.x, floorY, p.z, p.x, p.y, p.z
      ];
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
      const line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
        color, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false
      }));
      line.userData.clayLightOverlayKind = "position";
      line.userData.lightId = target.id;
      line.renderOrder = 60;
      group.add(line);
    }
    if(modes.range && light.distance > 0){
      [0.25, 0.5, 1].forEach(function(frac){
        const radius = light.distance * frac;
        const points = [];
        for(let i = 0; i < 64; i++){
          const a = (i / 64) * Math.PI * 2;
          points.push(new THREE.Vector3(p.x + Math.cos(a) * radius, floorY, p.z + Math.sin(a) * radius));
        }
        const line = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({
            color, transparent: true, opacity: frac === 1 ? 0.78 : 0.34,
            depthTest: false, depthWrite: false
          })
        );
        line.userData.clayLightOverlayKind = "range";
        line.userData.lightId = target.id;
        line.userData.rangeFraction = frac;
        line.userData.range = light.distance;
        line.renderOrder = 59;
        group.add(line);
      });
    }
    if(modes.shadow && light.castShadow && light.distance > 0){
      let sourceGeometry;
      if(light.isSpotLight){
        const coneRadius = Math.tan(light.angle || Math.PI / 4) * light.distance;
        sourceGeometry = new THREE.ConeGeometry(coneRadius, light.distance, 16, 1, true);
      } else {
        sourceGeometry = new THREE.SphereGeometry(light.distance, 12, 8);
      }
      const wireGeometry = new THREE.WireframeGeometry(sourceGeometry);
      sourceGeometry.dispose();
      const wire = new THREE.LineSegments(wireGeometry, new THREE.LineBasicMaterial({
        color, transparent: true, opacity: 0.16, depthTest: false, depthWrite: false
      }));
      wire.position.copy(p);
      if(light.isSpotLight){
        wire.position.y -= light.distance / 2;
      }
      wire.userData.clayLightOverlayKind = light.isSpotLight ? "shadow-frustum" : "shadow-volume";
      wire.userData.lightId = target.id;
      wire.renderOrder = 58;
      group.add(wire);
    }
  });
  S.scene.add(group);
  S.clayRoomLightOverlayGroup = group;
  return group;
}

/* CL-R1 live pixel diagnostics. These measurements read the final display-space framebuffer after
   the production post chain. They intentionally do not inspect authored light values and call them
   "brightness": a clipped pixel, a crushed pixel, and a desaturated sprite are counted from what
   the user can actually see. The sprite crop comes from __spriteScreenRects(), which projects the
   live mounted billboard. Its local surround ring is the comparison field for the simple
   readability deltas; no subjective pass/fail threshold is invented here. */
function clayRoomMetricsForRgba(pixels, width, height, rect, opts){
  opts = opts || {};
  if(!pixels || !width || !height) return null;
  const box = rect || { x: 0, y: 0, w: width, h: height };
  const x0 = Math.max(0, Math.min(width, Math.floor(box.x)));
  const y0 = Math.max(0, Math.min(height, Math.floor(box.y)));
  const x1 = Math.max(x0, Math.min(width, Math.ceil(box.x + box.w)));
  const y1 = Math.max(y0, Math.min(height, Math.ceil(box.y + box.h)));
  const exclude = opts.excludeRect || null;
  const sampleStep = Math.max(1, Number(opts.sampleStep) || 1);
  const alphaMin = opts.alphaMin == null ? 0 : Number(opts.alphaMin);
  const flipY = opts.flipY !== false;
  const histogram = new Uint32Array(256);
  let count = 0, lumaSum = 0, saturationSum = 0, spreadSum = 0;
  let clipped = 0, crushed = 0, neutral = 0;
  for(let sy = y0; sy < y1; sy += sampleStep){
    for(let sx = x0; sx < x1; sx += sampleStep){
      if(exclude
        && sx >= exclude.x && sx < exclude.x + exclude.w
        && sy >= exclude.y && sy < exclude.y + exclude.h) continue;
      const sourceY = flipY ? (height - 1 - sy) : sy;
      const i = (sourceY * width + sx) * 4;
      if(pixels[i + 3] < alphaMin) continue;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const lumaBin = Math.max(0, Math.min(255, Math.round(luma)));
      const maxChannel = Math.max(r, g, b);
      const minChannel = Math.min(r, g, b);
      const spread = maxChannel - minChannel;
      histogram[lumaBin]++;
      count++;
      lumaSum += luma;
      spreadSum += spread;
      saturationSum += maxChannel === 0 ? 0 : 255 * spread / maxChannel;
      if(r >= 250 && g >= 250 && b >= 250) clipped++;
      if(r <= 5 && g <= 5 && b <= 5) crushed++;
      if(spread <= 6) neutral++;
    }
  }
  if(!count) return null;
  function percentile(fraction){
    const target = Math.max(0, Math.min(count - 1, Math.floor(count * fraction)));
    let seen = 0;
    for(let value = 0; value < histogram.length; value++){
      seen += histogram[value];
      if(seen > target) return value;
    }
    return 255;
  }
  function rounded(value, places){
    const factor = Math.pow(10, places == null ? 2 : places);
    return Math.round(value * factor) / factor;
  }
  return {
    pixelsSampled: count,
    sampleStep: sampleStep,
    meanLuma: rounded(lumaSum / count),
    medianLuma: percentile(0.5),
    p05Luma: percentile(0.05),
    p95Luma: percentile(0.95),
    clippedHighlightPct: rounded(100 * clipped / count, 3),
    crushedShadowPct: rounded(100 * crushed / count, 3),
    meanSaturation: rounded(saturationSum / count),
    meanChromaSpread: rounded(spreadSum / count),
    neutralPct: rounded(100 * neutral / count)
  };
}

function clayRoomReadback(fullResolution){
  if(!S.mounted || !S.renderer || !S.camera) return null;
  renderTheaterFrame();
  // The always-visible readout uses a small same-task 2D copy of the just-rendered WebGL canvas.
  // It keeps the flame's 60fps animation from paying a full-resolution GPU readback every refresh.
  // The explicit comparison-sheet capture below requests the full framebuffer instead.
  if(!fullResolution && typeof document !== "undefined"){
    const source = S.renderer.domElement;
    const width = Math.min(480, source.width);
    const height = Math.max(1, Math.round(source.height * (width / source.width)));
    const sample = document.createElement("canvas");
    sample.width = width;
    sample.height = height;
    const ctx = sample.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, width, height);
    const image = ctx.getImageData(0, 0, width, height);
    return {
      pixels: new Uint8Array(image.data.buffer.slice(0)),
      width: width,
      height: height,
      flipY: false,
      sourceWidth: source.width,
      sourceHeight: source.height
    };
  }
  const gl = S.renderer.getContext();
  if(!gl) return null;
  const width = gl.drawingBufferWidth, height = gl.drawingBufferHeight;
  if(!width || !height) return null;
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return {
    pixels: pixels,
    width: width,
    height: height,
    flipY: true,
    sourceWidth: width,
    sourceHeight: height
  };
}

function clayRoomCitizenScreenRect(readback){
  if(!readback || !window.Theater || typeof window.Theater.__spriteScreenRects !== "function"){
    return null;
  }
  const expected = S.clayRoomRecord && S.clayRoomRecord.citizen
    ? S.clayRoomRecord.citizen.bestiaryId : null;
  const rects = window.Theater.__spriteScreenRects();
  const found = rects.find(function(rect){ return rect.slug === expected; }) || rects[0];
  if(!found || !(found.w > 1) || !(found.h > 1)) return null;
  const scaleX = readback.width / (readback.sourceWidth || readback.width);
  const scaleY = readback.height / (readback.sourceHeight || readback.height);
  const foundX = found.cx * scaleX, foundY = found.cy * scaleY;
  const foundW = found.w * scaleX, foundH = found.h * scaleY;
  const pad = Math.max(3, Math.min(foundW, foundH) * 0.06);
  return {
    slug: found.slug,
    x: Math.max(0, foundX - foundW / 2 - pad),
    y: Math.max(0, foundY - foundH / 2 - pad),
    w: Math.min(readback.width, foundW + pad * 2),
    h: Math.min(readback.height, foundH + pad * 2)
  };
}

function clayRoomCanvasFromReadback(readback, rect, targetCanvas){
  if(!readback || typeof document === "undefined") return null;
  const sourceRect = rect || { x: 0, y: 0, w: readback.width, h: readback.height };
  const x0 = Math.max(0, Math.floor(sourceRect.x));
  const y0 = Math.max(0, Math.floor(sourceRect.y));
  const width = Math.max(1, Math.min(readback.width - x0, Math.ceil(sourceRect.w)));
  const height = Math.max(1, Math.min(readback.height - y0, Math.ceil(sourceRect.h)));
  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = height;
  const scratchCtx = scratch.getContext("2d");
  const imageData = scratchCtx.createImageData(width, height);
  for(let y = 0; y < height; y++){
    const sourceY = readback.flipY === false ? (y0 + y) : (readback.height - 1 - (y0 + y));
    const start = (sourceY * readback.width + x0) * 4;
    imageData.data.set(readback.pixels.subarray(start, start + width * 4), y * width * 4);
  }
  scratchCtx.putImageData(imageData, 0, 0);
  if(!targetCanvas) return scratch;
  const outCtx = targetCanvas.getContext("2d");
  outCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  outCtx.fillStyle = "#090a0d";
  outCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  const scale = Math.min(targetCanvas.width / width, targetCanvas.height / height);
  const drawW = width * scale, drawH = height * scale;
  outCtx.imageSmoothingEnabled = false;
  outCtx.drawImage(
    scratch,
    (targetCanvas.width - drawW) / 2,
    (targetCanvas.height - drawH) / 2,
    drawW,
    drawH
  );
  return targetCanvas;
}

function clayRoomMountSourceSpriteCard(canvas, statusEl){
  if(!canvas || !S.clayRoomRecord) return null;
  const entry = spriteEntryFor(S.clayRoomRecord.citizen.bestiaryId);
  const path = entry ? spriteAssetPathFor(entry) : null;
  const state = { path: path, metrics: null, loaded: false };
  S.clayRoomSourceSprite = state;
  if(!path){
    if(statusEl) statusEl.textContent = "source sprite unavailable";
    return state;
  }
  const img = new Image();
  img.addEventListener("load", function(){
    const scratch = document.createElement("canvas");
    scratch.width = img.naturalWidth || 1;
    scratch.height = img.naturalHeight || 1;
    const scratchCtx = scratch.getContext("2d");
    scratchCtx.drawImage(img, 0, 0);
    const sourcePixels = scratchCtx.getImageData(0, 0, scratch.width, scratch.height);
    state.metrics = clayRoomMetricsForRgba(
      sourcePixels.data,
      scratch.width,
      scratch.height,
      null,
      { flipY: false, alphaMin: 8, sampleStep: 1 }
    );
    state.loaded = true;
    S.clayRoomPixelMetricsCache = null;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#090a0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / scratch.width, canvas.height / scratch.height);
    const drawW = scratch.width * scale, drawH = scratch.height * scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scratch, (canvas.width - drawW) / 2, (canvas.height - drawH) / 2, drawW, drawH);
    if(statusEl){
      statusEl.textContent = "authored PNG · opaque pixels · " + path.replace(/^assets\/sprites\//, "");
    }
  });
  img.addEventListener("error", function(){
    if(statusEl) statusEl.textContent = "source sprite failed to load · " + path;
  });
  img.src = path;
  return state;
}

function clayRoomLightingPixelMetrics(force){
  if(S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID) return null;
  const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const cacheKey = (S.clayRoomLightRecipeId || "") + ":" + (S.clayRoomPreviewSeed || "A");
  const cached = S.clayRoomPixelMetricsCache;
  // Measuring is intentionally event-driven (recipe/seed/camera changes or the explicit refresh
  // button), never a recurring GPU sync while a flame is animating. "Live" means pixels from the
  // current mounted frame, not a background profiler that periodically steals an animation frame.
  if(!force && cached && cached.cacheKey === cacheKey) return cached.value;
  if(!force && S.clayRoomMatrixCaptureInProgress) return cached ? cached.value : null;
  const readback = clayRoomReadback(false);
  if(!readback) return null;
  const spriteRect = clayRoomCitizenScreenRect(readback);
  const frame = clayRoomMetricsForRgba(
    readback.pixels,
    readback.width,
    readback.height,
    null,
    { sampleStep: 1, flipY: readback.flipY }
  );
  const sprite = spriteRect ? clayRoomMetricsForRgba(
    readback.pixels,
    readback.width,
    readback.height,
    spriteRect,
    { sampleStep: 1, flipY: readback.flipY }
  ) : null;
  let surround = null;
  if(spriteRect){
    const growX = Math.max(8, spriteRect.w * 0.45);
    const growY = Math.max(8, spriteRect.h * 0.25);
    surround = clayRoomMetricsForRgba(
      readback.pixels,
      readback.width,
      readback.height,
      {
        x: spriteRect.x - growX,
        y: spriteRect.y - growY,
        w: spriteRect.w + growX * 2,
        h: spriteRect.h + growY * 2
      },
      { sampleStep: 1, excludeRect: spriteRect, flipY: readback.flipY }
    );
  }
  const readability = sprite && surround ? {
    lumaDelta: Math.round(Math.abs(sprite.medianLuma - surround.medianLuma) * 100) / 100,
    chromaDelta: Math.round(Math.abs(sprite.meanChromaSpread - surround.meanChromaSpread) * 100) / 100,
    definition: "absolute sprite-screen-box vs local-surround deltas; measurement only"
  } : null;
  if(S.clayRoomRenderedSpriteCanvas && spriteRect){
    clayRoomCanvasFromReadback(readback, spriteRect, S.clayRoomRenderedSpriteCanvas);
  }
  const value = {
    recipeId: S.clayRoomLightRecipeId || null,
    previewSeed: S.clayRoomPreviewSeed || CLAY_ROOM_LIGHT_PREVIEW_SEEDS[0],
    drawingBuffer: { w: readback.width, h: readback.height },
    frame: frame,
    sprite: sprite,
    localSurround: surround,
    readability: readability,
    sourceSprite: S.clayRoomSourceSprite ? {
      path: S.clayRoomSourceSprite.path,
      loaded: S.clayRoomSourceSprite.loaded,
      metrics: S.clayRoomSourceSprite.metrics
    } : null
  };
  S.clayRoomPixelMetricsCache = { cacheKey: cacheKey, measuredAt: now, value: value };
  return value;
}

function clayRoomWaitForCaptureSettle(ms){
  return new Promise(function(resolve){
    const afterFrames = function(){
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){ setTimeout(resolve, ms || 0); });
      });
    };
    if(typeof requestAnimationFrame === "function") afterFrames();
    else setTimeout(resolve, ms || 0);
  });
}

function clayRoomDownloadBlob(filename, type, content){
  const blob = content instanceof Blob ? content : new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 0);
}

function clayRoomShowLightingMatrix(sheetCanvas, receipt){
  const stale = document.getElementById("clay-lighting-matrix-sheet");
  if(stale && stale.parentNode) stale.parentNode.removeChild(stale);
  const overlay = document.createElement("div");
  overlay.id = "clay-lighting-matrix-sheet";
  overlay.style.cssText = "position:fixed;inset:54px 22px 18px;z-index:10020;background:rgba(10,11,14,.97);border:1px solid #56606d;border-radius:6px;padding:12px;box-sizing:border-box;overflow:auto;color:#e7edf4;font:11px/1.4 monospace;";
  const toolbar = document.createElement("div");
  toolbar.style.cssText = "position:sticky;top:0;z-index:2;display:flex;gap:6px;align-items:center;background:#111318;padding:0 0 9px;";
  const title = document.createElement("strong");
  title.textContent = "CL-R1 · COMPLETE LIGHTING COMPARISON · 7 REAL RECIPES";
  title.style.cssText = "margin-right:auto;font:600 12px -apple-system,sans-serif;";
  toolbar.appendChild(title);
  [
    ["DOWNLOAD PNG", function(){
      sheetCanvas.toBlob(function(blob){
        if(blob) clayRoomDownloadBlob("cl-r1-lighting-comparison.png", "image/png", blob);
      }, "image/png");
    }],
    ["DOWNLOAD RECEIPT", function(){
      clayRoomDownloadBlob(
        "cl-r1-lighting-comparison-receipt.json",
        "application/json",
        JSON.stringify(receipt, null, 2)
      );
    }],
    ["CLOSE", function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); }]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[0];
    button.style.cssText = "font:10px monospace;background:#252b33;color:#e3e8ee;border:1px solid #4b5562;border-radius:3px;padding:5px 8px;cursor:pointer;";
    button.addEventListener("click", def[1]);
    toolbar.appendChild(button);
  });
  overlay.appendChild(toolbar);
  sheetCanvas.style.cssText = "display:block;width:min(100%,1600px);height:auto;margin:0 auto;border:1px solid #333;background:#0b0d11;";
  overlay.appendChild(sheetCanvas);
  document.body.appendChild(overlay);
  S.clayRoomLightingMatrixOverlay = overlay;
}

async function clayRoomCaptureLightingMatrix(){
  if(S.clayRoomMatrixCaptureInProgress || S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID){
    return null;
  }
  S.clayRoomMatrixCaptureInProgress = true;
  if(S.clayRoomMatrixStatusEl) S.clayRoomMatrixStatusEl.textContent = "capturing 1 / 7…";
  const originalRecipeId = S.clayRoomLightRecipeId || "clay-opposing-pair";
  const originalOverlayModes = Object.assign(
    { position: false, range: false, shadow: false },
    S.clayRoomLightOverlayModes || {}
  );
  const previewSeed = S.clayRoomPreviewSeed || CLAY_ROOM_LIGHT_PREVIEW_SEEDS[0];
  const cards = [];
  try {
    S.clayRoomLightOverlayModes = { position: false, range: false, shadow: false };
    clayRoomBuildLightOverlays();
    for(let index = 0; index < CLAY_ROOM_LIGHTING_MATRIX_RECIPES.length; index++){
      const recipeId = CLAY_ROOM_LIGHTING_MATRIX_RECIPES[index];
      if(S.clayRoomMatrixStatusEl){
        S.clayRoomMatrixStatusEl.textContent = "capturing " + (index + 1) + " / "
          + CLAY_ROOM_LIGHTING_MATRIX_RECIPES.length + " · " + recipeId;
      }
      if(!clayRoomSetLightingRecipe(recipeId, "clayroom-matrix-capture")){
        throw new Error("could not mount lighting matrix recipe " + recipeId);
      }
      await clayRoomWaitForCaptureSettle(180);
      // Animated recipes become deterministic stills at their second seeded target. This changes
      // no authored state; the restored live recipe restarts its ordinary smooth animation below.
      // Settle the standee's seeded mount/breathe tweens too, otherwise identical runs can catch a
      // different sub-frame of the goblin and move a handful of shadow pixels.
      if(S.interiorGroup){
        S.interiorGroup.traverse(function(object){
          if(object && object.userData && object.userData.sprite) stopIdleBreathe(object, false);
        });
      }
      drainTweens(S);
      stopLightFlicker();
      lightFlickerStep([], [], S.interiorLightTargets || [], 0, 2);
      const readback = clayRoomReadback(true);
      if(!readback) throw new Error("could not read rendered pixels for " + recipeId);
      const recipe = LIGHT_TUNABLES.profiles[recipeId];
      const targetById = {};
      (S.interiorLightTargets || []).forEach(function(target){ targetById[target.id] = target; });
      const liveLights = [];
      if(S.interiorGroup){
        S.interiorGroup.traverse(function(light){
          if(!light || !light.isLight || !light.userData || !light.userData.lightId) return;
          const worldPosition = new THREE.Vector3();
          light.getWorldPosition(worldPosition);
          const target = targetById[light.userData.lightId];
          liveLights.push({
            id: light.userData.lightId,
            type: light.isDirectionalLight ? "directional"
              : light.isAmbientLight ? "environment"
              : light.isSpotLight ? "spot" : "point",
            state: light.userData.lightState || (target && target.state) || "steady",
            color: light.color && typeof light.color.getHex === "function" ? light.color.getHex() : null,
            intensity: Number.isFinite(light.intensity) ? +light.intensity.toFixed(6) : null,
            range: Number.isFinite(light.distance) ? +light.distance.toFixed(6) : null,
            decay: Number.isFinite(light.decay) ? +light.decay.toFixed(6) : null,
            castShadow: !!light.castShadow,
            worldPosition: {
              x: +worldPosition.x.toFixed(6),
              y: +worldPosition.y.toFixed(6),
              z: +worldPosition.z.toFixed(6)
            },
            sampleIndex: target ? target.sampleIndex : 0,
            normalizedSample: target && Number.isFinite(target.normalizedSample)
              ? +target.normalizedSample.toFixed(6) : 1
          });
        });
      }
      cards.push({
        recipeId: recipeId,
        label: recipe.label,
        mode: recipe.mode,
        source: lightRecipeDeepClone(recipe.source),
        canvas: clayRoomCanvasFromReadback(readback),
        metrics: clayRoomMetricsForRgba(
          readback.pixels,
          readback.width,
          readback.height,
          null,
          { sampleStep: 2, flipY: readback.flipY }
        ),
        lights: liveLights
      });
    }

    const cardWidth = 380, cardHeight = 360, columns = 4;
    const rows = Math.ceil(cards.length / columns);
    const sheet = document.createElement("canvas");
    sheet.width = columns * cardWidth;
    sheet.height = 104 + rows * cardHeight;
    const ctx = sheet.getContext("2d");
    ctx.fillStyle = "#0b0d11";
    ctx.fillRect(0, 0, sheet.width, sheet.height);
    ctx.fillStyle = "#eef3f8";
    ctx.font = "600 28px -apple-system, sans-serif";
    ctx.fillText("CL-R1 · LIGHTING COMPARISON", 24, 38);
    ctx.fillStyle = "#9aa8b8";
    ctx.font = "16px monospace";
    ctx.fillText(
      "production renderer · fixture " + CLAY_ROOM_LIGHTING_BENCH_ID
        + " · preview seed " + previewSeed + " · dynamic sample 2",
      24,
      70
    );
    ctx.fillText("brightness, clipping, and colour are measured from final display pixels", 24, 94);
    cards.forEach(function(card, index){
      const col = index % columns, row = Math.floor(index / columns);
      const x = col * cardWidth, y = 104 + row * cardHeight;
      ctx.fillStyle = index % 2 ? "#11151b" : "#0f1318";
      ctx.fillRect(x + 6, y + 6, cardWidth - 12, cardHeight - 12);
      ctx.strokeStyle = card.source.loreNative ? "#476a58" : "#665b3d";
      ctx.strokeRect(x + 6.5, y + 6.5, cardWidth - 13, cardHeight - 13);
      ctx.fillStyle = "#edf2f7";
      ctx.font = "600 18px -apple-system, sans-serif";
      ctx.fillText(card.label, x + 18, y + 33);
      ctx.fillStyle = card.source.loreNative ? "#7fd6a4" : "#d8bd72";
      ctx.font = "12px monospace";
      ctx.fillText(card.source.loreNative ? "LORE-NATIVE" : "DIAGNOSTIC ONLY", x + 18, y + 52);
      const imageX = x + 18, imageY = y + 64, imageW = cardWidth - 36, imageH = 220;
      ctx.fillStyle = "#050608";
      ctx.fillRect(imageX, imageY, imageW, imageH);
      const imageScale = Math.min(imageW / card.canvas.width, imageH / card.canvas.height);
      const drawW = card.canvas.width * imageScale, drawH = card.canvas.height * imageScale;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        card.canvas,
        imageX + (imageW - drawW) / 2,
        imageY + (imageH - drawH) / 2,
        drawW,
        drawH
      );
      const m = card.metrics;
      ctx.fillStyle = "#b9c6d3";
      ctx.font = "12px monospace";
      ctx.fillText("median " + m.medianLuma + "/255 · p95 " + m.p95Luma + "/255", x + 18, y + 306);
      ctx.fillText(
        "clipped " + m.clippedHighlightPct.toFixed(3) + "% · crushed "
          + m.crushedShadowPct.toFixed(3) + "%",
        x + 18,
        y + 325
      );
      ctx.fillText("colour spread " + m.meanChromaSpread.toFixed(2) + "/255", x + 18, y + 344);
    });

    const receipt = {
      id: "cl-r1-lighting-comparison",
      version: 1,
      rendererPath: "authored light lock -> clayRoomBoardFrom -> production Theater -> display-space framebuffer",
      fixtureId: CLAY_ROOM_LIGHTING_BENCH_ID,
      fixtureVersion: CLAY_LIGHTING_BENCH_FIXTURE.version,
      fixtureSeed: S.clayRoomRecord ? S.clayRoomRecord.seed : null,
      previewSeed: previewSeed,
      dynamicSampleIndex: 2,
      lightLock: {
        id: LIGHT_PROFILE_LOCKS_COMPILED.id,
        version: LIGHT_PROFILE_LOCKS_COMPILED.version,
        schemaVersion: LIGHT_PROFILE_LOCKS_COMPILED.schemaVersion
      },
      sourceSprite: S.clayRoomSourceSprite ? {
        path: S.clayRoomSourceSprite.path,
        metrics: S.clayRoomSourceSprite.metrics
      } : null,
      cards: cards.map(function(card){
        return {
          recipeId: card.recipeId,
          label: card.label,
          mode: card.mode,
          source: card.source,
          metrics: card.metrics,
          lights: card.lights
        };
      })
    };
    const dataUrl = sheet.toDataURL("image/png");
    S.clayRoomLightingMatrixArtifact = {
      receipt: receipt,
      dataUrl: dataUrl,
      width: sheet.width,
      height: sheet.height
    };
    clayRoomShowLightingMatrix(sheet, receipt);
    if(S.clayRoomMatrixStatusEl){
      S.clayRoomMatrixStatusEl.textContent = "ready · 7 recipes · PNG + receipt";
    }
    return S.clayRoomLightingMatrixArtifact;
  } catch(error) {
    if(S.clayRoomMatrixStatusEl) S.clayRoomMatrixStatusEl.textContent = "capture failed · " + error.message;
    throw error;
  } finally {
    S.clayRoomLightOverlayModes = originalOverlayModes;
    clayRoomSetLightingRecipe(originalRecipeId, "clayroom-matrix-restore");
    clayRoomBuildLightOverlays();
    S.clayRoomMatrixCaptureInProgress = false;
  }
}

/* A screen-space tilt-shift band cannot distinguish playable foreground from scenic foreground.
   Terrain and Golden Site benches currently materialize no separate context-depth mask, so their
   entire tactical floor must remain sharp. Preserve the user's prior DoF state and restore it when
   leaving these benches; a later context-band implementation may replace this conservative policy
   with an authored mask, but it may never blur the playable floor again. */
function clayRoomApplyPlayableFloorDofPolicy(){
  if(!S.postSuite || !S.postSuite.dof) return null;
  const suppress = S.clayRoomFixtureId === CLAY_ROOM_TERRAIN_BENCH_ID
    || S.clayRoomFixtureId === CLAY_ROOM_GROUND_FIELD_BENCH_ID;
  if(suppress){
    if(!S.clayRoomPlayableFloorDofSuppressed){
      S.clayRoomPlayableFloorDofPrevious = !!S.postSuite.dof.enabled;
    }
    S.postSuite.dof.enabled = false;
    S.clayRoomPlayableFloorDofSuppressed = true;
  } else if(S.clayRoomPlayableFloorDofSuppressed){
    S.postSuite.dof.enabled = S.clayRoomPlayableFloorDofPrevious !== false;
    S.clayRoomPlayableFloorDofSuppressed = false;
    S.clayRoomPlayableFloorDofPrevious = null;
  }
  return {
    policy: suppress ? "playable-floor-sharp-until-context-mask-exists" : "interior-authored-dof",
    suppressed: suppress,
    dofEnabled: !!S.postSuite.dof.enabled
  };
}

/* clayRoomAfterInteriorBoardRebuild() — THE ONE LIFECYCLE HOOK. Called from setInteriorBoard's own
   tail (its single exit point), so it fires on the mount's first build AND on every asynchronous
   replay, without the clay surface having to know that those replay sites exist. A no-op unless the
   clay fixture is active, so the byte-for-byte-identical-boot requirement (D1) is unchanged: one
   boolean read per interior rebuild in normal play.

   Order matters: materials first (so a census taken later sees the routed tree), then the light
   profile (setInteriorBoard's own rigOn block has just overwritten S.ambientLight/S.pointLights),
   then provenance re-tagging (the rebuild replaced the children the previous tags pointed at). */
function clayRoomAfterInteriorBoardRebuild(){
  if(!S.clayRoomDiagnosticActive) return;
  // setInteriorBoard has just restored the base recipe's own void/fog. Bank that source-owned
  // colour before the independent room-mood layer blends over it; direct mood switches always
  // return to this clean base rather than compounding one tint into the next.
  if(S.scene && S.scene.background && S.scene.background.isColor){
    S.clayRoomMoodBaseBackground = S.scene.background.getHex();
  }
  clayRoomMountStructureBench();
  clayRoomMountLightingBench();
  clayRoomMountSpriteBench();
  clayRoomMountMaterialBench();
  clayRoomMountTrimBench();
  clayRoomMountTerrainBench();
  const playableFloorDofPolicy = clayRoomApplyPlayableFloorDofPolicy();
  if(S.clayRoomTerrainReport){
    S.clayRoomTerrainReport.playableFloorDofPolicy = playableFloorDofPolicy;
  }
  clayRoomSuppressLightingBenchNoise();
  clayRoomApplyDiagnosticSurfaces();
  clayRoomApplyLightProfile(S.clayRoomRecord);
  /* AFTER the light profile, never before. applyLightProfile is where the theater's key rig is
     (re)hung AND where the diagnostic practicals are rebuilt, so a terrain frame swept at mount
     time is always one step behind both. Restores the moment any other fixture is selected, so
     this costs the other five benches nothing. */
  if(S.clayRoomFixtureId === CLAY_ROOM_TERRAIN_BENCH_ID){
    const sceneNeutralizes = typeof terrainBenchSceneNeutralizesRig === "function"
      && terrainBenchSceneNeutralizesRig(S.clayRoomTerrainSceneId);
    const lateLights = sceneNeutralizes ? clayTerrainNeutralizeForeignLights() : [];
    const lateChrome = clayTerrainSuppressHostChrome();
    if(S.clayRoomTerrainReport){
      S.clayRoomTerrainReport.foreignLightsNeutralized = lateLights;
      S.clayRoomTerrainReport.hostSuppressed = lateChrome;
    }
  } else if(S.clayRoomTerrainForeignRestorePending){
    clayTerrainRestoreForeignLights();
    clayTerrainRestoreHostChrome();
    S.clayRoomTerrainForeignRestorePending = false;
  }
  clayRoomApplyMoodLayer();
  clayRoomBuildLightOverlays();
  clayRoomDisposeSeamGrid();
  S.clayGridMesh = S.clayRoomFixtureId === CLAY_ROOM_TERRAIN_BENCH_ID
    || S.clayRoomFixtureId === CLAY_ROOM_GROUND_FIELD_BENCH_ID
    ? null
    : clayRoomBuildSeamGrid(
        S.clayRoomRecord,
        S.clayRoomCompiled && S.clayRoomCompiled.room
      );
  clayRoomTagAllProvenance();
  // pan/zoom survives rebuilds without compounding: capture THIS rebuild's fresh camera fit, then
  // re-derive the pose from fit ∘ offset ∘ zoom (see the CLAY CAMERA PAN/ZOOM block).
  // PROBE-CAUGHT (2026-07-23): placeCameraTweened GLIDES to the new fit, so at this hook the camera
  // still holds the pre-rebuild pose — capturing here stored a contaminated "fit" (pan+zoom baked
  // in, then re-applied on top = double), and the tween then landed on the TRUE fit, wiping the pan
  // entirely (probe: afterNudgeRebuild snapped back to the fit; reset then restored the contaminated
  // pose). Settle ONLY the camera-pose tween to its END pose first. The old drainTweens(S) call
  // force-finished every channel, including a newly queued door-state tween, which made the
  // Clayroom incapable of proving that a door actually swings. Board teardown still uses the full
  // drain; this live post-build hook preserves non-camera animation.
  clayRoomSettleCameraPoseTween();
  clayRoomCaptureCamFit();
  if(S.clayRoomFixtureId === CLAY_ROOM_TERRAIN_BENCH_ID){
    const requestedTurn = S.clayRoomTerrainQuarterTurnRequested == null
      ? clayRoomTerrainQuarterTurnFromLocation()
      : S.clayRoomTerrainQuarterTurnRequested;
    if(requestedTurn == null) clayRoomApplyCamPose();
    else clayRoomSetTerrainQuarterTurn(requestedTurn);
  } else clayRoomApplyCamPose();
  clayRoomRefreshTerrainTurnControl();
  if(S.clayRoomSelectedId) clayRoomHighlightSelection(S.clayRoomSelectedId);
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
}

function clayRoomSettleCameraPoseTween(){
  if(!S.tweens || !S.tweens.length) return;
  const keep = [], settle = [];
  S.tweens.forEach(function(tw){
    if(tw && tw.isCameraPoseTween) settle.push(tw);
    else keep.push(tw);
  });
  S.tweens = keep;
  settle.forEach(function(tw){
    if(tw && typeof tw.onDone === "function"){
      try { tw.onDone(); } catch(e){}
    }
  });
}

// ─── D12a (Adam's founder redline, capture packet #1, 2026-07-23 — verbatim: "i need a semi-
// transparent grid overlaying the seams of the tiles") ───────────────────────────────────────────
// A semi-transparent world-space strip grid drawn exactly on every cell BOUNDARY of the record's
// own floor — a visual truth aid, never a second source of cell geometry. Segment COUNT is derived
// FROM record.dims, never a hardcoded literal: (w+1) lines running along Z (one per x-boundary,
// x=0..w) + (d+1) lines running along X (one per z-boundary, z=0..d) — exactly the spec's own
// "(w+1)+(d+1) lines". Origin/cell-size math mirrors the SAME law the floor itself renders through:
// cell size = 1 world unit = 5 ft (GRID LAW), origin = S.boardOrigin (setInteriorBoard's own
// (minX+maxX)/2,(minZ+maxZ)/2 — the EXACT cx/cz every floor/wall/doorframe instance already
// subtracts, interiorBuildInstancedMesh's own position.set line, this file ~8097) — read LIVE off S
// rather than re-derived, so the grid can never drift from wherever the floor actually mounted; a
// record.dims-only fallback (== the SAME (w-1)/2,(d-1)/2 setInteriorBoard would compute for this
// record's own bounds) covers a harness/edge case where S.boardOrigin hasn't been set yet. y sits
// just above the floor's own TOP surface via interiorFloorTopAt (the SAME derived-never-hand-tuned
// law every other floor-contact mount in this file already uses) plus a small clearance
// (CLAY_GRID_CLEARANCE, matching f1BuildCombatGrid's own +0.01 decal-clearance convention, this
// file ~10411) — enough to clear z-fighting without visibly floating. GL line width used to be
// capped at 1 px on most backends, which made correct coverage disappear over detailed
// albedo at review scale. Each deduplicated segment now becomes a narrow surface-clipped quad whose
// premultiplied custom blend performs alpha-weighted multiply:
//     destination × (1 - alpha + gridColour × alpha)
// This darkens the underlying material without bleaching it, glowing, or erasing its texture.
// depthWrite:false (this file's own standard transparent-decal pairing) keeps it from corrupting
// the depth buffer other transparent draws (the citizen's sprite billboard) test against; a
// renderOrder BELOW the scene default (0) draws it EARLY in the transparent queue so it composites
// under later-drawn transparent geometry ("under the figures/objects", D12a), while ordinary
// depth-tested opaque geometry (walls, the crate, the door) still correctly occludes it via the
// normal depth test regardless of renderOrder. Added directly to S.scene (never as a child of
// S.interiorGroup) so setInteriorBoard's own clearGroup(S.interiorGroup) — which reruns on every
// async replay this mount can trigger (a sprite texture settling, the D12b kit-door template
// warming) — can never silently wipe it the way a same-frame reassert would otherwise have to guard
// against (mirrors clayRoomApplyLightProfile's own per-frame-reassert note just above, for the
// SAME class of replay, minus the need for a reassert since nothing else in this file ever touches
// S.scene's own top-level children list).
// CL-R0: colour/opacity now come from CLAY_DIAGNOSTIC_SURFACE_RECIPE, not from literals here — the
// grid is part of the diagnostic surface and must be legible against whatever the recipe paints the
// floor. The authored white was chosen against the REGRESSED near-black floor and disappeared the
// moment CL-R0 restored legible clay; that dependency is exactly why the value belongs in the recipe.
// Read at CALL time (see the CLAY_GREY note above for why module-eval reads of the engine module
// are forbidden here). D12a's own 0.25-0.35 opacity law is enforced on the recipe by the harness.
function clayRoomGridColor(){ return CLAY_DIAGNOSTIC_SURFACE_RECIPE.gridColor; }
function clayRoomGridOpacity(){ return CLAY_DIAGNOSTIC_SURFACE_RECIPE.gridOpacity; }
function clayRoomGridStripWidth(){ return CLAY_DIAGNOSTIC_SURFACE_RECIPE.gridStripWidth; }
const CLAY_GRID_CLEARANCE = 0.01;   // matches f1BuildCombatGrid's own +0.01 (this file ~10411)
// CL-R0 COORDINATE FIX (found by the provenance audit's own new bbox field, not by eye): this grid
// was authored against the record's LOCAL 0..4 cell frame, but D15 re-wired the render to compile
// through the real spatializer, which places the room at the plan rect (room.x, room.y) — (3, 13)
// for the pinned fixture. setInteriorBoard then centres on the BOARD's bounds, so the floor draws at
// `room.x + cellX - cx` while this grid drew at `cellX - cx`: the grid mounted a full (3, 13) cells
// away from the room it was meant to overlay (audited bbox x[-5.5,-0.5] z[-15.5,-10.5] against a
// board of x[-3.5,3.5] z[-3.5,3.5]) and was simply off-camera. It audited "owned" the whole time,
// which is why the D13 audit alone never caught it. Nobody SAW it because the regressed floor was
// near-black; CL-R0's legible clay is what made the absence visible. `roomRect` is the spatialized
// room (clayRoomBoardFrom's own `room`), passed in rather than re-derived so the grid can never
// drift from wherever the spatializer actually put the room.
function clayRoomDisposeSeamGrid(){
  const grid = S.clayGridMesh;
  if(!grid) return;
  if(grid.parent) grid.parent.remove(grid);
  if(grid.geometry && grid.geometry.dispose) grid.geometry.dispose();
  if(grid.material && grid.material.dispose) grid.material.dispose();
  S.clayGridMesh = null;
}
function clayRoomBuildSeamGrid(record, roomRect){
  if(!S.scene || !record || !record.dims) return null;
  const ox = roomRect && typeof roomRect.x === "number" ? roomRect.x : 0;
  const oz = roomRect && typeof roomRect.y === "number" ? roomRect.y : 0;
  const cx = (S.boardOrigin && typeof S.boardOrigin.cx === "number")
    ? S.boardOrigin.cx : ox + (record.dims.w - 1) / 2;
  const cz = (S.boardOrigin && typeof S.boardOrigin.cz === "number")
    ? S.boardOrigin.cz : oz + (record.dims.d - 1) / 2;
  const segments = [];
  const segmentKeys = new Set();
  const report = {
    contract: "every-flat-or-traversable-surface",
    hostFloorCells: 0,
    shellFloorCells: 0,
    stairTreads: 0,
    walkableTops: 0,
    rampSurfaces: 0,
    crateTops: 0,
    roundTops: 0,
    materialSurfaces: 0,
    trimSurfaces: 0,
    uniqueSegments: 0,
    generatedQuadCount: 0,
    renderer: "surface-clipped-world-strips",
    blendContract: CLAY_DIAGNOSTIC_SURFACE_RECIPE.gridBlendContract,
    stripWidthWorldUnits: clayRoomGridStripWidth()
  };
  function pointKey(p){
    return [p.x, p.y, p.z].map(function(value){ return Number(value).toFixed(4); }).join(",");
  }
  function addSegment(a, b){
    const ak = pointKey(a), bk = pointKey(b);
    const key = ak < bk ? ak + "|" + bk : bk + "|" + ak;
    if(segmentKeys.has(key)) return;
    segmentKeys.add(key);
    segments.push([a.clone(), b.clone()]);
  }
  function addRect(minX, maxX, minZ, maxZ, y){
    const p0 = new THREE.Vector3(minX, y, minZ);
    const p1 = new THREE.Vector3(maxX, y, minZ);
    const p2 = new THREE.Vector3(maxX, y, maxZ);
    const p3 = new THREE.Vector3(minX, y, maxZ);
    addSegment(p0, p1); addSegment(p1, p2); addSegment(p2, p3); addSegment(p3, p0);
  }
  function addCellGridRect(minX, maxX, minZ, maxZ, y){
    addRect(minX, maxX, minZ, maxZ, y);
    const firstX = Math.ceil(minX + cx - 0.5);
    for(let rawX = firstX; ; rawX++){
      const x = rawX + 0.5 - cx;
      if(x >= maxX - 0.0001) break;
      if(x > minX + 0.0001){
        addSegment(new THREE.Vector3(x, y, minZ), new THREE.Vector3(x, y, maxZ));
      }
    }
    const firstZ = Math.ceil(minZ + cz - 0.5);
    for(let rawZ = firstZ; ; rawZ++){
      const z = rawZ + 0.5 - cz;
      if(z >= maxZ - 0.0001) break;
      if(z > minZ + 0.0001){
        addSegment(new THREE.Vector3(minX, y, z), new THREE.Vector3(maxX, y, z));
      }
    }
  }
  function addCircle(x, z, y, radius){
    const steps = 24;
    for(let index = 0; index < steps; index++){
      const a = index / steps * Math.PI * 2;
      const b = (index + 1) / steps * Math.PI * 2;
      addSegment(
        new THREE.Vector3(x + Math.cos(a) * radius, y, z + Math.sin(a) * radius),
        new THREE.Vector3(x + Math.cos(b) * radius, y, z + Math.sin(b) * radius)
      );
    }
  }

  // The host floor may eventually carry cell-specific tiers. Read each live floor-top lookup rather
  // than assuming one Y plane, and de-duplicate shared coplanar edges so opacity stays authored.
  for(let ix = 0; ix < record.dims.w; ix++){
    for(let iz = 0; iz < record.dims.d; iz++){
      const y = interiorFloorTopAt(S.interiorFloorTopMap, ox + ix, oz + iz) + CLAY_GRID_CLEARANCE;
      const x = ox + ix - cx, z = oz + iz - cz;
      addRect(x - 0.5, x + 0.5, z - 0.5, z + 0.5, y);
      report.hostFloorCells++;
    }
  }

  const structure = S.clayRoomStructureBenchGroup;
  if(structure){
    (structure.userData.structureWalkSurfaces || []).forEach(function(surface){
      addRect(
        surface.x - surface.width / 2,
        surface.x + surface.width / 2,
        surface.z - surface.depth / 2,
        surface.z + surface.depth / 2,
        surface.y + CLAY_GRID_CLEARANCE
      );
      report.shellFloorCells++;
    });
    structure.updateMatrixWorld(true);
    structure.traverse(function(node){
      if(!node || !node.isMesh || node.visible === false || !node.userData) return;
      const ud = node.userData;
      if(ud.structureRampGrid){
        const ramp = ud.structureRampGrid;
        const lowLeft = node.localToWorld(new THREE.Vector3(
          -ramp.width / 2, CLAY_GRID_CLEARANCE, -ramp.run / 2
        ));
        const lowRight = node.localToWorld(new THREE.Vector3(
          ramp.width / 2, CLAY_GRID_CLEARANCE, -ramp.run / 2
        ));
        const highRight = node.localToWorld(new THREE.Vector3(
          ramp.width / 2, ramp.rise + CLAY_GRID_CLEARANCE, ramp.run / 2
        ));
        const highLeft = node.localToWorld(new THREE.Vector3(
          -ramp.width / 2, ramp.rise + CLAY_GRID_CLEARANCE, ramp.run / 2
        ));
        addSegment(lowLeft, lowRight);
        addSegment(lowRight, highRight);
        addSegment(highRight, highLeft);
        addSegment(highLeft, lowLeft);
        report.rampSurfaces++;
        return;
      }
      const surfaceY = ud.structureStepSurfaceY != null
        ? ud.structureStepSurfaceY : ud.structureWalkSurfaceY;
      if(surfaceY == null) return;
      const box = new THREE.Box3().setFromObject(node);
      const y = surfaceY + CLAY_GRID_CLEARANCE;
      if(ud.structureGridShape === "circle"){
        const center = new THREE.Vector3();
        node.getWorldPosition(center);
        addCircle(center.x, center.z, y, ud.structureGridRadius || Math.min(
          box.max.x - box.min.x,
          box.max.z - box.min.z
        ) / 2);
        report.roundTops++;
      } else {
        addRect(box.min.x, box.max.x, box.min.z, box.max.z, y);
      }
      if(ud.structureStepSurfaceY != null) report.stairTreads++;
      else report.walkableTops++;
    });
  }

  // CL-F04 material specimens are genuine walkable tops, not a texture-only backdrop. Extend the
  // same canonical one-cell grid phase over every declared top while leaving walls/riser faces
  // unobscured for material review.
  const materialBench = S.clayRoomMaterialBenchGroup;
  if(materialBench){
    (materialBench.userData.materialGridSurfaces || []).forEach(function(surface){
      addCellGridRect(
        surface.minX, surface.maxX, surface.minZ, surface.maxZ,
        surface.y + CLAY_GRID_CLEARANCE
      );
      report.materialSurfaces++;
    });
  }
  const trimBench = S.clayRoomTrimBenchGroup;
  if(trimBench){
    (trimBench.userData.trimGridSurfaces || []).forEach(function(surface){
      addCellGridRect(
        surface.minX, surface.maxX, surface.minZ, surface.maxZ,
        surface.y + CLAY_GRID_CLEARANCE
      );
      report.trimSurfaces++;
    });
  }

  // The room-truth crate is production FACED_BOX geometry, not a Clayroom re-creation. Its live
  // assembly bounds own the overlay, so a later size/material change moves the top grid with it.
  let crateRoot = null;
  if(S.interiorGroup && record.object && record.object.access && record.object.access.top === "walk"){
    S.interiorGroup.traverse(function(node){
      if(crateRoot || !node || !node.userData) return;
      if(node.userData.sceneObjectId === record.object.id && node.userData.furnitureKind === "crate"){
        crateRoot = node;
      }
    });
  }
  if(crateRoot){
    crateRoot.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(crateRoot);
    addRect(
      box.min.x, box.max.x, box.min.z, box.max.z,
      box.max.y + CLAY_GRID_CLEARANCE
    );
    report.crateTops++;
  }

  report.uniqueSegments = segmentKeys.size;
  const pts = [];
  const halfWidth = clayRoomGridStripWidth() / 2;
  segments.forEach(function(segment){
    const a = segment[0], b = segment[1];
    const dx = b.x - a.x, dz = b.z - a.z;
    const horizontalLength = Math.hypot(dx, dz);
    if(horizontalLength < 0.000001) return;
    const px = -dz / horizontalLength * halfWidth;
    const pz = dx / horizontalLength * halfWidth;
    const a0 = [a.x + px, a.y, a.z + pz];
    const a1 = [a.x - px, a.y, a.z - pz];
    const b0 = [b.x + px, b.y, b.z + pz];
    const b1 = [b.x - px, b.y, b.z - pz];
    pts.push(
      a0[0], a0[1], a0[2], a1[0], a1[1], a1[2], b0[0], b0[1], b0[2],
      a1[0], a1[1], a1[2], b1[0], b1[1], b1[2], b0[0], b0[1], b0[2]
    );
    report.generatedQuadCount++;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const mat = new THREE.MeshBasicMaterial({
    color: clayRoomGridColor(),
    transparent: true,
    opacity: clayRoomGridOpacity(),
    premultipliedAlpha: true,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.DstColorFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
    side: THREE.DoubleSide
  });
  const grid = new THREE.Mesh(geo, mat);
  grid.name = "clay-traversability-grid";
  grid.renderOrder = -1;
  grid.userData.clayGrid = true;
  grid.userData.clayGridReport = report;
  S.scene.add(grid);
  return grid;
}

/* ─── C1B MOVEMENT PROJECTION ─────────────────────────────────────────────────────────────────
   The production TacticalQueryKernel owns cells, cost, legality, route choice, connection use, and
   preview/commit receipts. These helpers only project its immutable answers into the real Theater:
   a filled primary band, a hollow diamond Dash extension, an exact route line, and one move-step
   standee animation per receipt cell. No rule math lives here.
*/
function clayRoomMovementSession(){
  return (typeof GS !== "undefined" && GS) ? GS.clayRoomMovementSession || null : null;
}
function clayRoomMovementPoint(cellId){
  const coord = (typeof tqCellCoord === "function") ? tqCellCoord(cellId) : null;
  if(!coord || !S.boardOrigin) return null;
  const floorY = interiorFloorTopAt(S.interiorFloorTopMap, coord.x, coord.y);
  return new THREE.Vector3(
    coord.x - S.boardOrigin.cx,
    floorY + 0.025,
    coord.y - S.boardOrigin.cz
  );
}
function clayRoomDisposeMovementOverlay(){
  const group = S.clayRoomMovementOverlayGroup;
  if(!group) return;
  if(group.parent) group.parent.remove(group);
  group.traverse(function(node){
    if(node.geometry && node.geometry.dispose) node.geometry.dispose();
    if(node.material){
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach(function(mat){ if(mat && mat.dispose) mat.dispose(); });
    }
  });
  S.clayRoomMovementOverlayGroup = null;
}
function clayRoomMovementCellInFocus(cellId){
  const coord = (typeof tqCellCoord === "function") ? tqCellCoord(cellId) : null;
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  return !!(coord && room
    && coord.x >= room.x && coord.x < room.x + room.w
    && coord.y >= room.y && coord.y < room.y + room.d);
}
function clayRoomRenderMovementOverlay(ranges, preview){
  clayRoomDisposeMovementOverlay();
  if(!S.scene || !ranges) return;
  const group = new THREE.Group();
  group.userData.clayMovementOverlay = true;
  const moveGeo = new THREE.BoxGeometry(0.86, 0.018, 0.86);
  const moveMat = new THREE.MeshBasicMaterial({
    color: 0x43b9df, transparent: true, opacity: 0.26,
    depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2
  });
  (ranges.moveCellIds || []).forEach(function(cellId){
    if(!clayRoomMovementCellInFocus(cellId)) return;
    const point = clayRoomMovementPoint(cellId); if(!point) return;
    const tile = new THREE.Mesh(moveGeo, moveMat);
    tile.position.copy(point);
    tile.userData.rangeBand = "move";
    tile.userData.cellId = cellId;
    tile.renderOrder = 20;
    group.add(tile);
  });
  const dashGeo = new THREE.RingGeometry(0.26, 0.40, 4);
  const dashMat = new THREE.MeshBasicMaterial({
    color: 0xf2bd54, transparent: true, opacity: 0.75,
    side: THREE.DoubleSide, depthWrite: false, depthTest: false
  });
  (ranges.dashCellIds || []).forEach(function(cellId){
    if(!clayRoomMovementCellInFocus(cellId)) return;
    const point = clayRoomMovementPoint(cellId); if(!point) return;
    const diamond = new THREE.Mesh(dashGeo, dashMat);
    diamond.rotation.x = -Math.PI / 2;
    diamond.rotation.z = Math.PI / 4;
    diamond.position.copy(point);
    diamond.position.y += 0.015;
    diamond.userData.rangeBand = "dash";
    diamond.userData.cellId = cellId;
    diamond.renderOrder = 21;
    group.add(diamond);
  });
  const origin = clayRoomMovementPoint(ranges.originCellId);
  if(origin){
    const originMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.45, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, depthTest: false })
    );
    originMesh.rotation.x = -Math.PI / 2;
    originMesh.position.copy(origin);
    originMesh.position.y += 0.035;
    originMesh.userData.rangeBand = "origin";
    originMesh.renderOrder = 23;
    group.add(originMesh);
  }
  if(preview && preview.ok && preview.route && preview.route.cells){
    const routePoints = preview.route.cells
      .filter(clayRoomMovementCellInFocus)
      .map(clayRoomMovementPoint)
      .filter(Boolean)
      .map(function(point){ point.y += 0.06; return point; });
    if(routePoints.length >= 2){
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(routePoints),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthTest: false })
      );
      line.userData.clayMovementRoute = true;
      line.renderOrder = 24;
      group.add(line);
    }
    routePoints.forEach(function(point, index){
      const marker = new THREE.Mesh(
        new THREE.CircleGeometry(index === routePoints.length - 1 ? 0.16 : 0.09, 16),
        new THREE.MeshBasicMaterial({
          color: index === routePoints.length - 1 ? 0x79e5a3 : 0xffffff,
          side: THREE.DoubleSide, depthTest: false
        })
      );
      marker.rotation.x = -Math.PI / 2;
      marker.position.copy(point);
      marker.position.y += 0.01;
      marker.userData.clayMovementStep = index;
      marker.renderOrder = 25;
      group.add(marker);
    });
  }
  S.scene.add(group);
  S.clayRoomMovementOverlayGroup = group;
  S.clayRoomMovementOverlaySummary = {
    revision: ranges.stateRevision,
    originCellId: ranges.originCellId,
    moveCells: ranges.moveCellIds.length,
    dashCells: ranges.dashCellIds.length,
    previewId: preview ? preview.id : null,
    previewOk: preview ? preview.ok : null
  };
  markDirty();
  scheduleRender();
}
function clayRoomMovementRangesRender(){
  if(S.clayRoomFixtureId !== CLAY_ROOM_TRUTH_FIXTURE_ID){
    clayRoomDisposeMovementOverlay();
    return null;
  }
  const session = clayRoomMovementSession();
  if(!session) return null;
  const ranges = tqMovementRanges(session.fixture.space, session.state, session.fixture.actorId);
  clayRoomRenderMovementOverlay(ranges, session.preview);
  return ranges;
}
function clayRoomMovementPickAt(ev, host){
  const session = clayRoomMovementSession();
  if(!session || !S.camera || !S.boardOrigin || !host) return false;
  const rect = host.getBoundingClientRect();
  if(rect.width <= 0 || rect.height <= 0) return false;
  const pointer = new THREE.Vector2(
    ((ev.clientX - rect.left) / rect.width) * 2 - 1,
    -((ev.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, S.camera);
  const floorY = interiorFloorTopAt(
    S.interiorFloorTopMap,
    session.state.actors[0].cellId ? tqCellCoord(session.state.actors[0].cellId).x : 0,
    session.state.actors[0].cellId ? tqCellCoord(session.state.actors[0].cellId).y : 0
  );
  const point = new THREE.Vector3();
  if(!raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY), point)) return false;
  const cellId = tqCellId(
    Math.round(point.x + S.boardOrigin.cx),
    Math.round(point.z + S.boardOrigin.cz)
  );
  if(!session.fixture.space.cells.some(function(cell){ return cell.id === cellId; })) return false;
  if(S.clayRoomMovementPreviewCell) S.clayRoomMovementPreviewCell(cellId);
  return true;
}
function clayRoomMovementBoardFromState(state){
  const compiled = S.clayRoomCompiled;
  if(!compiled || !compiled.board || !state) return null;
  const session = clayRoomMovementSession();
  const actor = state.actors.find(function(row){ return row.id === session.fixture.actorId; });
  const connection = state.connections.find(function(row){ return row.id === session.fixture.connectionId; });
  const base = compiled.board;
  let pieces = [];
  if(actor && actor.sceneId === "clay-room"){
    const coord = tqCellCoord(actor.cellId);
    pieces = (base.pieces || []).map(function(piece){
      return Object.assign({}, piece, { cellX: coord.x, cellY: coord.y });
    });
  }
  const interactables = (base.interactables || []).map(function(entry){
    return entry.connectionId === session.fixture.connectionId
      ? Object.assign({}, entry, { state: connection ? connection.state : "shut" })
      : entry;
  });
  if(S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID){
    const fixture = clayRoomLightingBenchFixtureFrom(S.clayRoomRecord);
    const room = compiled.room;
    pieces = pieces.map(function(piece){
      return Object.assign({}, piece, {
        cellX: room.x + fixture.spriteCell.x,
        cellY: room.y + fixture.spriteCell.z
      });
    });
    // CL-F02 is a measurement fixture. The approved sprite remains, but the room-truth crate and
    // door are removed from this projection so their extra faces do not muddle the comparison.
    return Object.assign({}, base, {
      pieces: pieces,
      furniture: [],
      interactables: [],
      dressing: []
    });
  }
  if(S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID){
    // CL-F01 isolates architecture. The outer production room remains the calibrated floor/light/
    // camera host; its crate, citizen, dressing, and authored door cannot be mistaken for bench
    // specimens. The structure fixture itself mounts in the post-build lifecycle hook below.
    const fixture = clayRoomStructureBenchFixtureFrom(S.clayRoomRecord);
    const room = compiled.room;
    const witness = fixture.cutawayWitness;
    const witnessPiece = {
      id: witness.id,
      sourceRef: witness.pieceSlug,
      slug: witness.pieceSlug,
      label: "Human scale / cutaway witness",
      cellX: room.x + witness.pieceCell.x,
      cellY: room.y + witness.pieceCell.z,
      allowOverheight: true
    };
    const witnessPillar = {
      x: room.x + witness.occluder.at.x,
      z: room.y + witness.occluder.at.z,
      sx: witness.occluder.sx,
      sy: witness.occluder.sy,
      sz: witness.occluder.sz,
      color: "#888888",
      profile: witness.occluder.profile,
      sourceRef: witness.occluder.id
    };
    return Object.assign({}, base, {
      instances: Object.assign({}, base.instances, {
        pillar: (base.instances.pillar || []).concat([witnessPillar])
      }),
      pieces: [witnessPiece],
      furniture: [],
      interactables: [],
      dressing: [],
      wallProps: []
    });
  }
  if(S.clayRoomFixtureId === CLAY_ROOM_MATERIAL_BENCH_ID){
    const room = compiled.room;
    pieces = pieces.map(function(piece){
      return Object.assign({}, piece, {
        cellX: room.x + 5,
        cellY: room.y + 9
      });
    });
    return Object.assign({}, base, {
      pieces: pieces,
      furniture: [],
      interactables: [],
      dressing: [],
      wallProps: []
    });
  }
  if(S.clayRoomFixtureId === CLAY_ROOM_TRIM_BENCH_ID){
    return Object.assign({}, base, {
      pieces: [],
      furniture: [],
      interactables: [],
      dressing: [],
      wallProps: []
    });
  }
  if(S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID){
    const fixture = clayRoomSpriteCitizenshipFixtureFrom(S.clayRoomRecord);
    const room = compiled.room;
    const capMode = S.clayRoomSpriteScaleMode === "diagnostic-cap";
    const cap = fixture.candidatePresentationCap;
    pieces = fixture.cast.map(function(spec){
      const registry = spriteEntryFor(spec.slug);
      const worldHeight = registry && Number.isFinite(registry.worldHeight)
        ? registry.worldHeight
        : (registry && Number.isFinite(registry.feet) ? registry.feet : HUMAN_TRUE_HEIGHT * 5);
      const presentedFeet = capMode
        ? Math.max(cap.minFeet, Math.min(cap.maxFeet, worldHeight))
        : worldHeight;
      return {
        id: "clay-citizen-" + spec.slug,
        sourceRef: spec.slug,
        slug: spec.slug,
        label: spec.label,
        stress: spec.stress,
        tacticalSpanCells: spec.tacticalSpanCells,
        cellX: room.x + spec.lineupCell.x,
        cellY: room.y + spec.lineupCell.z,
        scaleVsHuman: capMode ? presentedFeet / 5.5 : null,
        allowOverheight: true
      };
    });
    return Object.assign({}, base, {
      pieces: pieces,
      furniture: [],
      interactables: [],
      dressing: [],
      cameraFit: {
        maxHeight: capMode ? cap.maxFeet / 5 : Math.max.apply(null, fixture.cast.map(function(spec){
          const registry = spriteEntryFor(spec.slug);
          return registry && Number.isFinite(registry.worldHeight) ? registry.worldHeight / 5 : 1.1;
        }))
      }
    });
  }
  return Object.assign({}, base, { pieces: pieces, interactables: interactables });
}
function clayRoomApplyMovementBoard(state, reason){
  const board = clayRoomMovementBoardFromState(state);
  if(!board) return;
  S.boardKey = null;
  clayRoomSetInteriorBoard(board, { roomTransition: false, reason: reason || "clayroom-movement-commit" });
  clayRoomMovementRangesRender();
}
function clayRoomAnimateMovementReceipt(receipt, onDone, onProgress){
  const session = clayRoomMovementSession();
  const actor = session && (findUnit(session.fixture.actorId) || clayRoomNodeForSelection(session.fixture.actorId));
  const cells = receipt && receipt.route ? receipt.route.cells || [] : [];
  if(session){
    session.animationProof = {
      receiptId: receipt ? receipt.id : null,
      actorFound: !!actor,
      requestedSteps: Math.max(0, cells.length - 1),
      startedSteps: 0,
      completedSteps: 0,
      selectionProbe: S.clayRoomSelectionProbe || null,
      status: actor && cells.length >= 2 ? "active" : "degraded-no-mounted-actor"
    };
  }
  if(!actor || cells.length < 2){
    if(onProgress) onProgress();
    if(onDone) onDone();
    return;
  }
  if(onProgress) onProgress();
  const fromPoint = clayRoomMovementPoint(cells[0]);
  const visualOffset = fromPoint ? {
    x: actor.position.x - fromPoint.x,
    z: actor.position.z - fromPoint.z
  } : { x: 0, z: 0 };
  let index = 1;
  function playNext(){
    if(index >= cells.length){
      session.animationProof.status = "settled";
      if(onProgress) onProgress();
      if(onDone) onDone();
      return;
    }
    const point = clayRoomMovementPoint(cells[index++]);
    if(!point){ playNext(); return; }
    point.x += visualOffset.x;
    point.z += visualOffset.z;
    point.y = actor.position.y;
    bindStandeeCtx(buildTheaterCtx());
    session.animationProof.startedSteps++;
    if(onProgress) onProgress();
    const started = playStandeeVerb(actor, "move-step", {
      targetPos: point,
      // tickTweens replaces its live list at the end of each pass. Schedule the next cell after
      // that pass completes so a tween created from onDone cannot be discarded as re-entrant work.
      onDone: function(){
        session.animationProof.completedSteps++;
        if(onProgress) onProgress();
        setTimeout(playNext, 0);
      }
    });
    if(started) startTweenLoop();
    else {
      session.animationProof.status = "degraded-verb-refused";
      playNext();
    }
  }
  playNext();
}

// ─── D13 (docs/C1A-CLAY-ROOM.md spec addendum D15 point 4 — provenance audit) ──────────────────────
// clayRoomTagProvenance(node,builder) stamps userData.clayProvenance = {builder,recordRef:"clay-c1a"}
// on ONE node and records it in S.clayRoomProvenanceRoots — the tracked root SET
// clayRoomProvenanceAudit walks. Scope is deliberately the clay mount's OWN attachment points
// (S.interiorGroup as a whole — the real production board tree setInteriorBoard just populated,
// floor/wall/doorframe/pillar/lights/pieces/furniture/dressing/interactables all nested under it;
// S.clayGridMesh; the light-profile's own ambient+point lights), never mount()'s generic baseline
// scaffolding (the hemisphere/key/fill lights and empty tile/prop/unit/shadow/fx groups every theater
// instance gets regardless of clay) — that scaffolding traces to no record and tagging it would be a
// false provenance claim, not an honest one. "Under a tagged group" (D15's own words) reads as: every
// one of these tracked roots IS itself tagged at attachment time, so nothing in this tracked set can
// ever be an orphan by construction; an entry only shows up missing if the node it names was never
// built at all (e.g. mount() degraded, S.interiorGroup absent) — reported as an orphan then, honestly.
function clayRoomTagProvenance(node, builder){
  if(!node || !node.userData) return;
  node.userData.clayProvenance = { builder: builder, recordRef: "clay-c1a" };
  S.clayRoomProvenanceRoots = S.clayRoomProvenanceRoots || [];
  S.clayRoomProvenanceRoots.push(node);
}
function clayRoomTagAllProvenance(){
  S.clayRoomProvenanceRoots = [];
  if(S.interiorGroup) clayRoomTagProvenance(S.interiorGroup, "setInteriorBoard"); // board/figure/lights/furniture — nested
  if(S.clayGridMesh) clayRoomTagProvenance(S.clayGridMesh, "clayRoomBuildSeamGrid"); // grid
  if(S.clayRoomLightOverlayGroup) clayRoomTagProvenance(S.clayRoomLightOverlayGroup, "clayRoomBuildLightOverlays");
  if(S.clayRoomMoodGroup) clayRoomTagProvenance(S.clayRoomMoodGroup, "clayRoomApplyMoodLayer");
  if(S.ambientLight) clayRoomTagProvenance(S.ambientLight, "clayRoomApplyLightProfile"); // lights
  (S.pointLights || []).forEach(function(l){ clayRoomTagProvenance(l, "clayRoomApplyLightProfile"); }); // lights
}
// clayRoomProvenanceAudit() -> {tagged:[{type,builder}...], orphans:[{type}...]} — walks
// S.clayRoomProvenanceRoots (populated by clayRoomTagAllProvenance at mount time), never all of
// S.scene.children (see this section's own header note on why that scope would be dishonest).
function clayRoomProvenanceAudit(){
  const tagged = [], orphans = [];
  (S.clayRoomProvenanceRoots || []).forEach(function(node){
    if(node && node.userData && node.userData.clayProvenance){
      // CL-R0: the audit now also reports WHERE each owned root actually sits. "Owned" is only half
      // the provenance question; a correctly-tagged object mounted in the wrong coordinate frame is
      // still a lie the frame tells. (Found by exactly this: the D12a seam grid audited clean while
      // rendering nowhere near the floor.) Lights have no geometry, so bbox is null for them.
      let bbox = null;
      try {
        if(node.isObject3D && typeof THREE !== "undefined" && THREE.Box3){
          const box = new THREE.Box3().setFromObject(node);
          if(isFinite(box.min.x)) bbox = {
            min: [+box.min.x.toFixed(3), +box.min.y.toFixed(3), +box.min.z.toFixed(3)],
            max: [+box.max.x.toFixed(3), +box.max.y.toFixed(3), +box.max.z.toFixed(3)],
          };
        }
      } catch(e){}
      tagged.push({ type: node.type, builder: node.userData.clayProvenance.builder, bbox: bbox });
    } else if(node){
      orphans.push({ type: node.type });
    }
  });
  return { tagged: tagged, orphans: orphans };
}

/* ─── CLAY CAMERA PAN/ZOOM (Adam, 2026-07-23: "i need to be able to pan around the room because the
   control panel is blocking the door") ─────────────────────────────────────────────────────────────
   The GOVERNED camera verbs only (W3 §12.13: fixed camera with governed pan/zoom/focus; the
   Workbench ruling forbids unlocked production camera PITCH): panning translates the camera position
   and its look target by the SAME ground-plane offset, and zoom dollies along the existing view ray
   — bearing and pitch are mathematically unchanged by both. No orbit, no rotation, dev-surface only
   (listeners exist solely on the clay host, which is created at clay mount and removed at unmount).

   Pose model: every rebuild re-fits the camera (placeCameraTweened), so the pan must survive
   rebuilds without compounding — the FIT pose is captured once per rebuild
   (clayRoomCaptureCamFit, called from the one lifecycle hook) and the final pose is always
   pose = fit ∘ offset ∘ zoom, recomputed from scratch. Drag = grab convention (the room follows
   the cursor). Double-click resets. */
// The fitted pose remains the reset/default. 0.12 lets the art director dolly roughly 8.3× closer
// for feet, shell, and alpha-edge inspection without unlocking bearing or pitch.
const CLAY_CAM_ZOOM_MIN = 0.12, CLAY_CAM_ZOOM_MAX = 2.5;
/* Breathing room beyond the posed camera's own content sphere. Terrain columns hang below their
   own top surface and the host keeps chrome behind the bench; this is the slack that covers both
   without turning the depth range into a precision problem. */
const CLAY_CAM_FAR_MARGIN = 12;
/* The half-diagonal of WHAT IS MOUNTED, in world units. One expression, used by the strategic fit
   and by the clip-range sizing below, so the camera can never be fitted to one radius and clipped
   against another. */
function clayRoomPosedContentRadius(){
  const terrainSpan = (S.clayRoomFixtureId === CLAY_ROOM_TERRAIN_BENCH_ID
    && S.clayRoomTerrainHalfSpan) ? S.clayRoomTerrainHalfSpan : null;
  return terrainSpan
    ? terrainSpan * 1.42 + 1.5
    : Math.sqrt(
        Math.pow(S.boardHalfX || 8, 2) + Math.pow(S.boardHalfZ || 8, 2)
      ) * 1.12 + 1.5; // margin: wall thickness + breathing room
}
/* THE FAR PLANE IS PART OF THE POSE — CL-F07a round 4.
   setInteriorBoard sizes the shared camera's clip range for the 15x15 HOST ROOM's own fit distance
   (camDist + FOG_FAR + 20 = 116.63). The clay benches then dolly along the view ray, and the
   terrain sheet's governed fit parks the camera 2.048x further out — 115.98 from the target, 0.65
   inside its own far plane. Everything more than 0.65 units BEYOND the target was outside the
   frustum and was never drawn: half of a 24x24 field, cut by a plane perpendicular to the view
   axis, which reads on screen as a clean diagonal across the grid with the tall pillars surviving
   (raising a point moves it toward the camera along that axis). The field data was complete
   throughout; the clip range was the thing that never moved. Sized here, where the pose is set, so
   a camera and the volume it can see are decided together.
   GROW-ONLY: no other bench's clip range changes, so this can add geometry to a frame and can never
   remove any. */
function clayRoomGrowCameraFar(needed){
  if(!S.camera || !(needed > 0)) return null;
  const before = S.camera.far;
  if(S.camera.far >= needed) return { far: before, needed: needed, grown: false };
  S.camera.far = needed;
  if(S.camera.updateProjectionMatrix) S.camera.updateProjectionMatrix();
  return { far: needed, needed: needed, grown: true, from: before };
}
function clayRoomCaptureCamFit(){
  if(!S.camera) return;
  const t = S.cameraLookTarget ? S.cameraLookTarget.clone() : new THREE.Vector3(0, 0, 0);
  S.clayCamFit = { pos: S.camera.position.clone(), target: t };
  if(!S.clayCamOffset) S.clayCamOffset = { x: 0, z: 0 };
  if(!S.clayCamZoom) S.clayCamZoom = 1;
}
function clayRoomApplyCamPose(){
  if(!S.camera || !S.clayCamFit) return;
  const off = S.clayCamOffset || { x: 0, z: 0 };
  const zoom = S.clayCamZoom || 1;
  const target = S.clayCamFit.target.clone(); target.x += off.x; target.z += off.z;
  const pos = S.clayCamFit.pos.clone(); pos.x += off.x; pos.z += off.z;
  if((S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
    && S.clayRoomStructureView === "strategic")
    || (S.clayRoomFixtureId === CLAY_ROOM_TERRAIN_BENCH_ID
      && S.clayRoomTerrainView === "strategic")){
    // The strategic camera is the one governed pitch exception named by the wall-omission ruling:
    // fixed 72° map-reading pitch, same production bearing, pan, target, and perspective camera.
    // It is a named mode, never free orbit. Every wall is compiled in this mode (see CL-F01 mount).
    const ray = pos.sub(target);
    // Checkpoint 4 ("ALL WALLS is poorly fitted in the narrow viewport, crops or flattens the
    // scene"): the map-reading distance is computed from the ROOM'S OWN BOUNDS against the live
    // camera fov/aspect, not inherited from the production-pitch fit ray. The 72° pitch, bearing,
    // and governed zoom are unchanged — only the fit is honest to the viewport now.
    let distance;
    {
      const terrainSpan = (S.clayRoomFixtureId === CLAY_ROOM_TERRAIN_BENCH_ID
        && S.clayRoomTerrainHalfSpan) ? S.clayRoomTerrainHalfSpan : null;
      const halfDiag = clayRoomPosedContentRadius();
      const vFov = ((S.camera.fov || 20) * Math.PI / 180) / 2;
      const aspect = S.camera.aspect || 1;
      const hFov = Math.atan(Math.tan(vFov) * aspect);
      /* Never multiply a fit by a fit: on the terrain bench the governed zoom IS the size fit. */
      distance = (halfDiag / Math.tan(Math.min(vFov, hFov))) * (terrainSpan ? 1 : zoom);
      /* And never fit past the FAR PLANE. A camera parked beyond `far` renders an empty frame, which
         is the failure that got this bench's first strategic pass banked as a brown rectangle.
         ROUND 4: the far plane is now SIZED TO THE REQUESTED FIT before this test rather than the
         fit being cropped to a stale far plane — cropping was treating the symptom of exactly the
         defect this round fixes, and it was silently pulling the 24x24 sheet's map read 14 units
         closer than the fit asked for. The clamp stays as the residual safety net (a camera must
         still sit far enough inside the far plane that the content's own radius fits), and records
         itself when it fires, which under the sizing above it should not. */
      clayRoomGrowCameraFar(distance + halfDiag + CLAY_CAM_FAR_MARGIN);
      const farLimit = (S.camera.far || 100) - halfDiag - 1;
      if(distance > farLimit){
        S.clayRoomStrategicDistanceClamped = { requested: distance, applied: farLimit,
          reason: "camera fit exceeded the far plane" };
        distance = farLimit;
      } else S.clayRoomStrategicDistanceClamped = null;
    }
    const ground = new THREE.Vector2(ray.x, ray.z);
    if(ground.lengthSq() < 0.0001) ground.set(1, 1);
    ground.normalize();
    const pitch = 72 * Math.PI / 180;
    pos.set(
      target.x + ground.x * Math.cos(pitch) * distance,
      target.y + Math.sin(pitch) * distance,
      target.z + ground.y * Math.cos(pitch) * distance
    );
  } else {
    // dolly along the existing ray — direction (and therefore bearing+pitch) preserved exactly
    pos.sub(target).multiplyScalar(zoom).add(target);
  }
  S.camera.position.copy(pos);
  if(S.cameraLookTarget) S.cameraLookTarget.copy(target);
  S.camera.lookAt(target);
  /* THE POSE IS NOT SET UNTIL THE VOLUME IT CAN SEE IS SET. Both branches land here, so the
     production dolly (which is what the sheet's 2.048x fit uses) and the strategic fit are covered
     by one rule instead of one of them being remembered and the other forgotten. */
  S.clayRoomCameraFar = clayRoomGrowCameraFar(
    pos.distanceTo(target) + clayRoomPosedContentRadius() + CLAY_CAM_FAR_MARGIN);
  /* WHERE THE POSE ACTUALLY PUT THE CAMERA. Both branches land here, so this is the one place that
     knows the answer; the resize funnel below reads it to tell "the host re-fitted and wiped the
     pose" from "nothing has touched the camera since", instead of keeping a second copy of the
     pose math that would drift out of step with this one. */
  S.clayCamPosedAt = pos.clone();
  S.clayRoomPixelMetricsCache = null;
  markDirty();
  scheduleRender();
}
/* THE POSE MUST SURVIVE A RESIZE. Every clay-owned caller of the host resize goes through here and
   none of them calls S.resizeHandler directly, because that handler ends in placeCamera(), which
   re-fits the camera to the HOST ROOM and hard-resets S.camera.far to the host's own clip range
   (theater-camera.js — an absolute assignment at four sites, not a grow). A live viewer who resized
   the window therefore lost the governed pan, the governed zoom, and — since round 4 made the far
   plane part of the pose — the clip range that keeps the whole field inside the frustum. On the
   terrain sheet that is exactly the round-4 defect returning at runtime: half a 24x24 field cut
   away on a plane perpendicular to the view axis. No capture ever caught it because the capture rig
   never resizes.

   THE FIT IS RE-CAPTURED, NOT RESTORED. clayCamFit holds the UNPOSED fit and is aspect-dependent;
   placeCamera has just computed the correct fit for the new aspect and left the camera sitting on
   it, which is the one moment where capturing cannot fold the pan and zoom into the fit itself. The
   governed offset and zoom are deltas and survive untouched (clayRoomCaptureCamFit only initialises
   them when absent). Re-applying a STALE fit instead would answer the new viewport with the old
   viewport's framing — the narrow-viewport crop the strategic fit above already had to correct. */
function clayRoomResizeAndRestorePose(){
  if(S.resizeHandler) S.resizeHandler();
  if(!S.clayRoomDiagnosticActive || !S.camera) return false;
  /* Re-capture ONLY when something moved the camera off the pose we last set — i.e. the host resize
     really re-fitted. If it early-returned (unmounted, no renderer) or the viewport did not actually
     change, the camera is still posed, and capturing here would fold offset+zoom into the fit and
     compound them on every later resize. Re-applying, by contrast, is unconditional: the far plane
     is part of the pose and placeCamera resets it even when the fitted POSITION is unchanged, which
     is precisely the sheet's default unpanned, unzoomed state — the case that clipped half the
     field. */
  if(!S.clayCamPosedAt || !S.camera.position.equals(S.clayCamPosedAt)) clayRoomCaptureCamFit();
  clayRoomApplyCamPose();
  return true;
}
function clayRoomNodeForSelection(id){
  if(!id || !S.interiorGroup) return null;
  let found = null;
  const probe = { requested: String(id), visited: 0, candidates: [] };
  S.interiorGroup.traverse(function(node){
    if(found || !node) return;
    probe.visited++;
    const ud = node.userData || {};
    const candidate = ud.structureSpecId || ud.unitId || ud.sceneObjectId || ud.lightId || ud.dressingSlug;
    if(candidate != null && probe.candidates.length < 12) probe.candidates.push(String(candidate));
    if(String(ud.structureSpecId || "") === String(id)
      || String(ud.sceneObjectId || "") === String(id)
      || String(ud.unitId || "") === String(id)
      || String(ud.lightId || "") === String(id)
      || String(ud.dressingSlug || "") === String(id)){
      found = node;
      return;
    }
    if(id === "room-shell" && ud.interiorKind
      && /^(room-shell|floor|wall|trim|skirt)/.test(String(ud.interiorKind))){
      found = node;
    }
  });
  probe.found = !!found;
  S.clayRoomSelectionProbe = probe;
  return found;
}
function clayRoomStandeeForSelectionNode(node){
  let cursor = node;
  while(cursor && cursor !== S.interiorGroup && cursor !== S.scene){
    if(cursor.userData && cursor.userData.sprite) return cursor;
    cursor = cursor.parent;
  }
  return null;
}
// CL-R2 selection follow-up — selected support illumination must read as NEON emitted by the blue
// vertical sidewall itself, never as a point bulb hidden at the base center. Standard real-time
// emissive materials do not illuminate nearby pixels, so the visible emission is paired with ONE
// very cheap, additive floor-spill quad shaped to the support's rounded-strip footprint. The opaque
// support hides its bright center; only the cyan feather immediately outside the physical sidewall
// remains visible. It adds no scene light, no extra shadow caster, and follows base relocation/yaw as
// a child of that same base.
const CLAY_SELECTION_BASE_NEON_COLOR = 0x53d5ff;
const CLAY_SELECTION_BASE_NEON_WIDTH_SCALE = 1.24;
const CLAY_SELECTION_BASE_NEON_DEPTH_SCALE = 1.72;
let CLAY_SELECTION_BASE_NEON_TEXTURE = null;
let CLAY_SELECTION_BASE_NEON_MATERIAL = null;
let CLAY_SELECTION_BASE_NEON_GEOMETRY = null;
function claySelectionBaseNeonTexture(){
  if(CLAY_SELECTION_BASE_NEON_TEXTURE) return CLAY_SELECTION_BASE_NEON_TEXTURE;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext && canvas.getContext("2d");
  if(ctx && typeof ctx.createRadialGradient === "function"){
    ctx.clearRect(0, 0, size, size);
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,0.72)");
    grad.addColorStop(0.46, "rgba(255,255,255,0.50)");
    grad.addColorStop(0.74, "rgba(255,255,255,0.20)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.userData.claySelectionBaseNeonTexture = true;
  CLAY_SELECTION_BASE_NEON_TEXTURE = tex;
  return tex;
}
function claySelectionBaseNeonMaterial(){
  if(CLAY_SELECTION_BASE_NEON_MATERIAL) return CLAY_SELECTION_BASE_NEON_MATERIAL;
  const mat = new THREE.MeshBasicMaterial({
    map: claySelectionBaseNeonTexture(),
    color: CLAY_SELECTION_BASE_NEON_COLOR,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  mat.userData.shared = true;
  mat.userData.claySelectionBaseNeonMaterial = true;
  CLAY_SELECTION_BASE_NEON_MATERIAL = mat;
  return mat;
}
function claySelectionBaseNeonGeometry(){
  if(CLAY_SELECTION_BASE_NEON_GEOMETRY) return CLAY_SELECTION_BASE_NEON_GEOMETRY;
  const geo = new THREE.PlaneGeometry(1, 1);
  geo.userData.shared = true;
  CLAY_SELECTION_BASE_NEON_GEOMETRY = geo;
  return geo;
}
function setStandeeSelectionBaseNeon(fig, glowing){
  if(!fig || !fig.userData || !fig.userData.standeeBaseMesh) return;
  const base = fig.userData.standeeBaseMesh;
  let spill = fig.userData.claySelectionBaseNeon || null;
  if(glowing){
    if(!spill){
      spill = new THREE.Mesh(claySelectionBaseNeonGeometry(), claySelectionBaseNeonMaterial());
      spill.rotation.x = -Math.PI / 2;
      spill.position.set(0, -INTERIOR_BASE_HEIGHT - 0.002, 0);
      spill.scale.set(
        (base.userData.supportWidth || 0.45) * CLAY_SELECTION_BASE_NEON_WIDTH_SCALE,
        (base.userData.supportDepth || INTERIOR_BASE_TREAD_DEPTH) * CLAY_SELECTION_BASE_NEON_DEPTH_SCALE,
        1
      );
      spill.castShadow = false;
      spill.receiveShadow = false;
      spill.renderOrder = 3;
      spill.userData.claySelectionBaseNeon = true;
      spill.userData.emissionSource = "emissive-sidewall";
      spill.userData.footprintShape = "support-rounded-strip";
      spill.userData.spillWidth = spill.scale.x;
      spill.userData.spillDepth = spill.scale.y;
      fig.userData.claySelectionBaseNeon = spill;
    }
    if(spill.parent !== base){
      if(spill.parent) spill.parent.remove(spill);
      base.add(spill);
    }
    spill.visible = true;
    spill.userData.linkedSceneObjectId = fig.userData.sceneObjectId || fig.userData.unitId || null;
  } else if(spill){
    spill.visible = false;
  }
}
function setStandeeSelectionBaseRing(fig, glowing){
  if(!fig || !fig.userData || !fig.userData.standeeBaseMesh) return;
  const base = fig.userData.standeeBaseMesh;
  const mats = Array.isArray(base.material) ? base.material : [base.material];
  // ExtrudeGeometry's material contract is [top/bottom caps, vertical side wall]. Selection belongs
  // ONLY on index 1: the shallow outer face becomes a luminous ring while the top remains ordinary
  // stone and the character card receives no outline.
  const side = mats[1] || mats[0];
  if(side && side.emissive) side.emissive.setHex(glowing ? 0x53d5ff : 0x000000);
  if(base.layers){
    if(glowing) base.layers.enable(BLOOM_LAYER);
    else base.layers.disable(BLOOM_LAYER);
  }
  base.userData.claySelectionBaseRingGlow = !!glowing;
  setStandeeSelectionBaseNeon(fig, glowing);
}
function clayRoomClearSelectionGlow(){
  if(S.clayRoomSelectionGlowSprite){
    setStandeeSelectionBaseRing(S.clayRoomSelectionGlowSprite, false);
  }
  S.clayRoomSelectionGlowSprite = null;
}
function clayRoomMountSelectionGlow(node){
  const fig = clayRoomStandeeForSelectionNode(node);
  if(!fig || !S.scene) return;
  setStandeeSelectionBaseRing(fig, true);
  S.clayRoomSelectionGlowSprite = fig;
}
function clayRoomHighlightSelection(id){
  if(S.clayRoomSelectionHelper && S.clayRoomSelectionHelper.parent){
    S.clayRoomSelectionHelper.parent.remove(S.clayRoomSelectionHelper);
    if(S.clayRoomSelectionHelper.geometry) S.clayRoomSelectionHelper.geometry.dispose();
    if(S.clayRoomSelectionHelper.material) S.clayRoomSelectionHelper.material.dispose();
  }
  S.clayRoomSelectionHelper = null;
  clayRoomClearSelectionGlow();
  const node = clayRoomNodeForSelection(id);
  if(!node || !S.scene) return;
  // The compiled shell is the whole architectural composition, not one editable part. Boxing the
  // entire specimen field makes the assembled review read like a selection cage.
  if(id === "compiled-shell"){
    markDirty();
    scheduleRender();
    return;
  }
  // A standee selects through its diegetic base ring. Do not also draw the generic cyan BoxHelper
  // around the character card—the user's clarification is specifically that only the base wall
  // should light. Non-standee objects retain the workbench bounding-box diagnostic.
  if(clayRoomStandeeForSelectionNode(node)){
    clayRoomMountSelectionGlow(node);
    markDirty();
    scheduleRender();
    return;
  }
  const helper = new THREE.BoxHelper(node, 0x6fcfff);
  helper.material.depthTest = false;
  helper.material.transparent = true;
  helper.material.opacity = 0.9;
  helper.renderOrder = 999;
  helper.userData.claySelectionHelper = true;
  S.scene.add(helper);
  S.clayRoomSelectionHelper = helper;
  markDirty();
  scheduleRender();
}
function clayRoomPickAt(ev, host){
  if(!S.camera || !S.interiorGroup || !host) return null;
  const rect = host.getBoundingClientRect();
  if(rect.width <= 0 || rect.height <= 0) return null;
  const pointer = new THREE.Vector2(
    ((ev.clientX - rect.left) / rect.width) * 2 - 1,
    -((ev.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, S.camera);
  const hits = raycaster.intersectObjects(S.interiorGroup.children, true);
  for(let i = 0; i < hits.length; i++){
    let node = hits[i].object;
    while(node && node !== S.interiorGroup){
      const ud = node.userData || {};
      const id = ud.structureSpecId || ud.sceneObjectId || ud.lightId || ud.dressingSlug;
      if(id){
        S.clayRoomSelectedId = id;
        if(S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID){
          clayRoomStructureClimbTargetSet(id, hits[i].object, hits[i].point);
        }
        if(S.clayRoomWorkbenchSelect) S.clayRoomWorkbenchSelect(id, "viewport");
        return id;
      }
      if(ud.interiorKind && /^(room-shell|floor|wall|trim|skirt)/.test(String(ud.interiorKind))){
        S.clayRoomSelectedId = "room-shell";
        if(S.clayRoomWorkbenchSelect) S.clayRoomWorkbenchSelect("room-shell", "viewport");
        return "room-shell";
      }
      node = node.parent;
    }
  }
  return null;
}
function clayRoomWirePanZoom(host){
  if(!host || host.__clayPanWired) return;
  host.__clayPanWired = true;
  let dragging = false, lastX = 0, lastY = 0, startX = 0, startY = 0, moved = false;
  host.style.cursor = "grab";
  host.addEventListener("pointerdown", function(ev){
    if(ev.button !== 0) return;
    dragging = true; moved = false;
    startX = lastX = ev.clientX; startY = lastY = ev.clientY;
    host.style.cursor = "grabbing";
    try { host.setPointerCapture(ev.pointerId); } catch(e){}
  });
  host.addEventListener("pointermove", function(ev){
    if(!dragging || !S.camera || !S.clayCamFit) return;
    const dxPx = ev.clientX - lastX, dyPx = ev.clientY - lastY;
    lastX = ev.clientX; lastY = ev.clientY;
    if(Math.hypot(ev.clientX - startX, ev.clientY - startY) > 4) moved = true;
    const target = S.clayCamFit.target, pos = S.camera.position;
    const dist = pos.distanceTo(S.cameraLookTarget || target);
    const fovRad = (S.camera.fov || 20) * Math.PI / 180;
    const worldPerPx = (2 * dist * Math.tan(fovRad / 2)) / Math.max(1, host.clientHeight);
    // ground-plane screen axes from the camera's own bearing (never re-derived constants)
    const dir = new THREE.Vector3().subVectors(S.cameraLookTarget || target, pos);
    const right = new THREE.Vector3(dir.z, 0, -dir.x).normalize();     // screen-right on the ground
    const fwd = new THREE.Vector3(dir.x, 0, dir.z).normalize();        // camera-forward on the ground
    const off = S.clayCamOffset || (S.clayCamOffset = { x: 0, z: 0 });
    // This offset moves the CAMERA, so it must follow the requested screen motion to make the
    // rendered room follow the pointer in this fixed-bearing rig. Both signs are browser-verified:
    // dragging right keeps the room moving right; dragging down keeps it moving down.
    off.x += (right.x * dxPx + fwd.x * dyPx) * worldPerPx;
    off.z += (right.z * dxPx + fwd.z * dyPx) * worldPerPx;
    clayRoomApplyCamPose();
  });
  const endDrag = function(){ dragging = false; host.style.cursor = "grab"; };
  host.addEventListener("pointerup", function(ev){
    const wasClick = dragging && !moved;
    endDrag();
    if(wasClick){
      if(S.clayRoomMovementPickMode && clayRoomMovementPickAt(ev, host)) return;
      clayRoomPickAt(ev, host);
    }
  });
  host.addEventListener("pointerleave", endDrag);
  host.addEventListener("wheel", function(ev){
    ev.preventDefault();
    if(!S.clayCamFit) return;
    const factor = ev.deltaY > 0 ? 1.18 : 0.82;
    S.clayCamZoom = Math.min(CLAY_CAM_ZOOM_MAX, Math.max(CLAY_CAM_ZOOM_MIN, (S.clayCamZoom || 1) * factor));
    clayRoomApplyCamPose();
  }, { passive: false });
  host.addEventListener("dblclick", function(){
    S.clayCamOffset = { x: 0, z: 0 };
    S.clayCamZoom = 1;
    clayRoomApplyCamPose();
  });
}

// Live proof read: board-authored state + the actual mounted hinge/leaf pose. The State tab and
// browser harness both consume this one measurement so the UI cannot claim a swing that the scene
// did not perform.
function clayRoomDoorProofState(){
  const authoredDoor = S.lastBoard && Array.isArray(S.lastBoard.interactables)
    ? S.lastBoard.interactables.find(function(e){ return e && e.archetype === "door" && !e.reserve; })
    : null;
  let hinge = null;
  if(S.interiorGroup){
    S.interiorGroup.traverse(function(node){
      if(!hinge && node.userData && node.userData.kind === "interactable" && node.userData.archetype === "door"){
        hinge = node;
      }
    });
  }
  const leaf = hinge && hinge.userData ? hinge.userData.leaf : null;
  const angleDeg = leaf ? leaf.rotation.y * 180 / Math.PI : null;
  return {
    sourceRef: authoredDoor ? authoredDoor.sourceRef : null,
    authoredState: authoredDoor ? authoredDoor.state : null,
    mountedState: hinge && hinge.userData ? hinge.userData.state : null,
    hingeAngleDeg: angleDeg == null ? null : +angleDeg.toFixed(1),
    leafVisible: !!(leaf && leaf.visible),
    tweenActive: !!((S.tweens || []).some(function(tw){ return tw && tw.isDoorStateTween; })),
    mount: S.doorMountReport && S.doorMountReport.perDoor ? S.doorMountReport.perDoor[0] || null : null,
  };
}

// Concept 1 — DOCKED STUDIO. The shell is deliberately DOM-only and dev-only; the center host still
// mounts the real Theater renderer and every list entry refers to an object already supplied by the
// production Clayroom record. Catalog buttons do not manufacture demo meshes.
function clayRoomWorkbenchDimensions(){
  // Checkpoint 4 ("the inspector consumes roughly half of a narrow browser window, leaving a
  // portrait-shaped renderer unsuitable for visual signoff"): chrome scales DOWN before the
  // viewport does. Below 1000px the catalog auto-collapses to its rail unless the user explicitly
  // expanded it this session (S.clayRoomCatalogCollapsed === false is an explicit choice; null/
  // undefined means default). The inspector clamps proportionally so the renderer always keeps
  // the MAJORITY of the window at review sizes.
  const w = typeof window !== "undefined" ? window.innerWidth : 1280;
  const compact = w < 900;
  const catalogAutoCollapsed = w < 1000 && S.clayRoomCatalogCollapsed !== false;
  const inspector = Math.round(Math.min(390, Math.max(230, w * 0.28)));
  return {
    catalog: (S.clayRoomCatalogCollapsed || catalogAutoCollapsed) ? 42 : (compact ? 170 : 260),
    inspector: compact ? Math.min(inspector, 250) : inspector,
  };
}
function clayRoomApplyWorkbenchLayout(){
  const dims = clayRoomWorkbenchDimensions();
  const rail = document.getElementById("clay-room-workbench-catalog");
  const viewport = document.getElementById("clay-room-workbench-viewport");
  const panel = document.getElementById("clay-room-overlay");
  if(rail){
    rail.style.width = dims.catalog + "px";
    rail.style.padding = S.clayRoomCatalogCollapsed ? "8px 5px" : "12px";
    Array.from(rail.children).forEach(function(child){
      child.style.visibility = S.clayRoomCatalogCollapsed ? "hidden" : "visible";
    });
  }
  if(viewport){
    viewport.style.left = dims.catalog + "px";
    viewport.style.right = dims.inspector + "px";
  }
  if(panel && !CLAY_ROOM_PANEL_POSITION) panel.style.width = dims.inspector + "px";
}
function clayRoomBuildWorkbenchChrome(record){
  const top = document.createElement("div");
  top.id = "clay-room-workbench-topbar";
  top.style.cssText = "position:fixed;left:0;right:0;top:0;height:44px;z-index:9003;background:#15171b;border-bottom:1px solid #39404a;color:#e8edf2;display:flex;align-items:center;padding:0 14px;gap:14px;font:11px/1.2 monospace;box-sizing:border-box;";
  top.innerHTML =
    "<strong style='font:600 13px -apple-system,sans-serif;letter-spacing:.04em'>GENESIS · CLAYROOM</strong>" +
    "<span style='color:#91a0b2'>DOCKED STUDIO · CONCEPT 1</span>" +
    "<span style='margin-left:auto;color:#77d39a'>SESSION ONLY</span>" +
    "<span style='color:#aab4c0'>1 cell = 5 ft · walls = 10 ft · human = 6 ft reference</span>";
  const catalogToggle = document.createElement("button");
  catalogToggle.type = "button";
  catalogToggle.textContent = "catalog ◀";
  catalogToggle.setAttribute("aria-label", "Collapse or expand Clayroom catalog");
  catalogToggle.style.cssText = "order:-1;background:#252a32;color:#ccd5df;border:1px solid #414955;border-radius:3px;padding:4px 6px;font:9px monospace;cursor:pointer;";
  top.appendChild(catalogToggle);
  /* Same verb as the production combat-stage ⟳ control. Kept in the persistent top bar so the
     terrain can be judged with the inspector open or closed; hidden for every non-terrain bench. */
  const terrainTurnRoot = document.createElement("div");
  terrainTurnRoot.setAttribute("data-clay-terrain-camera", "1");
  terrainTurnRoot.style.cssText = "display:none;align-items:center;gap:5px;";
  const terrainTurnButton = document.createElement("button");
  terrainTurnButton.type = "button";
  terrainTurnButton.textContent = "⟳ 90°";
  terrainTurnButton.title = "Rotate to the next canonical FFT camera bearing";
  terrainTurnButton.setAttribute("aria-label", "Rotate terrain camera 90 degrees clockwise");
  terrainTurnButton.style.cssText = "background:#283644;color:#dcecff;border:1px solid #4a647c;border-radius:3px;padding:4px 7px;font:9px monospace;cursor:pointer;";
  const terrainTurnLabel = document.createElement("span");
  terrainTurnLabel.style.cssText = "color:#8fb0ca;font:9px monospace;min-width:88px;";
  terrainTurnButton.addEventListener("click", function(){
    const current = ((Number(S.rotationStep) || 0) % 4 + 4) % 4;
    clayRoomSetTerrainQuarterTurn(current + 1);
  });
  terrainTurnRoot.appendChild(terrainTurnButton);
  terrainTurnRoot.appendChild(terrainTurnLabel);
  top.appendChild(terrainTurnRoot);
  S.clayRoomTerrainTurnControl = {
    root: terrainTurnRoot, button: terrainTurnButton, label: terrainTurnLabel
  };

  const rail = document.createElement("aside");
  rail.id = "clay-room-workbench-catalog";
  rail.style.cssText = "position:fixed;left:0;top:44px;bottom:0;width:260px;z-index:9002;background:#17191e;border-right:1px solid #39404a;color:#dce3ea;overflow:hidden auto;padding:12px;box-sizing:border-box;font:11px/1.35 -apple-system,sans-serif;transition:width 120ms ease;";

  function railHeading(text){
    const h = document.createElement("div");
    h.textContent = text;
    h.style.cssText = "margin:2px 0 7px;color:#8e9baa;font:600 10px monospace;letter-spacing:.12em;";
    return h;
  }
  rail.appendChild(railHeading("CATALOG · LIVE FIXTURE SLICE"));
  const catalog = [
    ["STRUCTURE", "10 ft wall", "room-shell"],
    ["STRUCTURE KIT", "Construction bench", "compiled-shell"],
    ["SCALE / CUTAWAY", "Human witness", "structure-cutaway-witness"],
    ["PROP", "Crate · 3 ft", record.object.id],
    ["INTERACTABLE", "Door · 36 × 80 in", record.portal.id],
    ["DIAGNOSTIC LIGHT", "Warm calibration bulb", "clay-west-warm"],
    ["DIAGNOSTIC LIGHT", "Cool calibration bulb", "clay-east-cool"],
    ["SPRITE", "Goblin", record.citizen.bestiaryId],
  ];
  catalog.forEach(function(row){
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.claySelect = row[2];
    if(row[2] === "compiled-shell" || row[2] === "structure-cutaway-witness") b.dataset.clayStructureOnly = "1";
    if(row[2] === record.citizen.bestiaryId) b.dataset.claySpriteCatalog = "1";
    if(row[2] === record.object.id || row[2] === record.portal.id) b.dataset.clayRoomTruthOnly = "1";
    if(row[2] === "clay-west-warm") b.dataset.clayLightCatalogSlot = "0";
    if(row[2] === "clay-east-cool") b.dataset.clayLightCatalogSlot = "1";
    b.style.cssText = "width:100%;text-align:left;background:#20242b;color:#e0e5ea;border:1px solid #333a44;border-radius:4px;padding:7px 8px;margin:0 0 5px;cursor:pointer;";
    b.innerHTML = "<small data-clay-light-kind style='display:block;color:#8290a1;font:9px monospace'>" + row[0] + "</small>" +
      "<span data-clay-light-label>" + row[1] + "</span>" +
      "<small data-clay-light-status style='float:right;color:#6fcf91;font:9px monospace'>MOUNTED</small>";
    b.addEventListener("click", function(){
      S.clayRoomSelectedId = b.dataset.claySelect;
      if(S.clayRoomWorkbenchSelect) S.clayRoomWorkbenchSelect(b.dataset.claySelect, "catalog");
    });
    rail.appendChild(b);
  });

  const scene = document.createElement("section");
  scene.id = "clay-room-workbench-scene";
  scene.style.cssText = "border-top:1px solid #333a44;margin-top:12px;padding-top:10px;";
  scene.appendChild(railHeading("SCENE · LIVE PRODUCTION OBJECTS"));
  [
    ["Room shell", "room-shell"],
    ["Construction bench", "compiled-shell"],
    ["Human cutaway witness", "structure-cutaway-witness"],
    ["Door", record.portal.id],
    ["Crate", record.object.id],
    ["Goblin", record.citizen.bestiaryId],
    ["Warm calibration bulb", "clay-west-warm"],
    ["Cool calibration bulb", "clay-east-cool"],
  ].forEach(function(row){
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.claySceneId = row[1];
    if(row[1] === "compiled-shell" || row[1] === "structure-cutaway-witness") b.dataset.clayStructureOnly = "1";
    if(row[1] === record.citizen.bestiaryId) b.dataset.claySpriteCatalog = "1";
    if(row[1] === record.object.id || row[1] === record.portal.id) b.dataset.clayRoomTruthOnly = "1";
    if(row[1] === "clay-west-warm") b.dataset.clayLightSceneSlot = "0";
    if(row[1] === "clay-east-cool") b.dataset.clayLightSceneSlot = "1";
    b.textContent = "◇  " + row[0];
    b.style.cssText = "display:block;width:100%;text-align:left;background:transparent;color:#cbd3dc;border:0;border-left:2px solid transparent;padding:5px 7px;cursor:pointer;font:11px monospace;";
    b.addEventListener("click", function(){
      S.clayRoomSelectedId = b.dataset.claySceneId;
      if(S.clayRoomWorkbenchSelect) S.clayRoomWorkbenchSelect(b.dataset.claySceneId, "scene");
    });
    scene.appendChild(b);
  });
  rail.appendChild(scene);
  const safety = document.createElement("div");
  safety.style.cssText = "margin-top:14px;padding:8px;border:1px solid #4d4431;background:#242117;color:#d7c58c;font:10px/1.4 monospace;";
  safety.textContent = "The light rows mirror the current recipe. Diagnostic bulbs never masquerade as world fixtures; placement edits remain session-only.";
  rail.appendChild(safety);

  const viewport = document.createElement("div");
  viewport.id = "clay-room-workbench-viewport";
  viewport.style.cssText = "position:fixed;left:260px;right:390px;top:44px;bottom:0;z-index:9000;background:#000;transition:left 120ms ease;";
  const host = document.createElement("div");
  host.id = "clay-room-host";
  host.style.cssText = "position:absolute;inset:0;background:#000;";
  viewport.appendChild(host);

  document.body.appendChild(top);
  document.body.appendChild(rail);
  document.body.appendChild(viewport);
  catalogToggle.addEventListener("click", function(){
    S.clayRoomCatalogCollapsed = !S.clayRoomCatalogCollapsed;
    catalogToggle.textContent = S.clayRoomCatalogCollapsed ? "catalog ▶" : "catalog ◀";
    rail.setAttribute("aria-expanded", S.clayRoomCatalogCollapsed ? "false" : "true");
    clayRoomApplyWorkbenchLayout();
    setTimeout(function(){
      clayRoomResizeAndRestorePose();
      markDirty(); scheduleRender();
    }, 140);
  });
  clayRoomApplyWorkbenchLayout();
  return { host: host, chrome: [top, rail, viewport] };
}

// mountClayRoom() — D2/wire-in steps 1-5 (the overlay, step 6, is built by
// clayRoomMountOverlay(record,host) — see the U3 addition below this comment once it lands). Never
// throws (mirrors mountLightLab's own dormant-surface discipline): a WebGL-less environment degrades
// to mount() returning false and this function no-oping.
// D15 re-wire: step 3 (project the record through the real interior board builders) is now
// clayRoomBoardFrom(record) — src/engine/clay-room.js's own real spatializer + interiorBuildBoard
// chain — feeding setInteriorBoard directly; this file adds no board-data assembly of its own.
//
// ITR_ROOM_SHELL (this file's own module-scope flag, default true, line ~10103 — "ROOM-SHELL
// COMPILER... flips ITR_ROOM_SHELL live") — found LIVE in the orchestrator's own browser re-gate:
// setInteriorBoard's own room-shell compiler is ON BY DEFAULT for every interior board (not a
// clay-specific mechanism), and it REPLACES the per-cell InstancedMesh floor/wall channel with a
// separate, non-instanced, kit-realm-textured mesh trio (room-shell-floor/wall-stem/wall-upper/
// wall-trim, tagged `kind` in _interiorGroupMeshInfoForTest) that clayRoomFlattenStructure's own
// InstancedMesh-only sweep never touches by construction (it isn't an InstancedMesh at all) — so
// with room-shell on, the floor/walls rendered their REAL, unflattened, dark realm colors instead
// of clay grey (dark enough under D4's own low-ambient profile to read as void-black, the exact
// "floor/walls didn't render" first read). Disabled the SAME way KIT_SHELL_ENABLED/KIT_DOORS_ENABLED
// already are (an existing, documented dev/harness toggle — "flips ITR_ROOM_SHELL live", this file's
// own comment at its definition — never a new mechanism): OFF only while the clay room stays mounted
// (restored in clayRoomUnmount, not immediately here) because setInteriorBoard's own async replay
// (the SPRITE_CHANNEL texture-settle callback this file's own header already documents) re-invokes
// setInteriorBoard(S.lastBoard) OUTSIDE this function, and ITR_ROOM_SHELL is read fresh every one of
// those calls — restoring it here would let that later replay silently rebuild an unflattened shell
// again. This keeps geometry in the plain InstancedMesh/BoxGeometry family every other kind already
// uses (D2 step 3's own "never a bespoke material... SAME InstancedMesh/BoxGeometry construction" law).
function mountClayRoom(){
  try {
    if(S.clayRoomMounted) return;
    const record = clayRoomRecordFrom(0x6c0ffee); // the CI seed, pinned per docs/C1A-CLAY-ROOM.md wire-in step 1
    const initialFixtureId = clayRoomFixtureIdFromLocation();
    // CL-F04/05 are focused visual comparisons. Collapse the generic object catalog by default so
    // the production renderer keeps a landscape review viewport; the rail remains one click away.
    if(initialFixtureId === CLAY_ROOM_MATERIAL_BENCH_ID
      || initialFixtureId === CLAY_ROOM_TRIM_BENCH_ID
      || initialFixtureId === CLAY_ROOM_GROUND_FIELD_BENCH_ID) S.clayRoomCatalogCollapsed = true;

    const workbench = clayRoomBuildWorkbenchChrome(record);
    const host = workbench.host;

    const mounted = mount(host); // D5: no `opts` -> the default (non-psx) canvas path
    if(!mounted){
      workbench.chrome.forEach(function(el){ if(el && el.parentNode) el.parentNode.removeChild(el); });
      return;
    }
    S.clayRoomWorkbenchChrome = workbench.chrome;

    CLAY_ROOM_PRIOR_ROOM_SHELL = clayCtxGetRoomShell(); // split B1: root owns the flag; accessor replaces the same-module read
    // CL-R0 note: the room-shell compiler stays OFF by default (see this function's header), but the
    // diagnostic recipe now routes room-shell/kit-shell kinds too, so `?clayshell=1` can turn it back
    // on for an A/B against the production construction path. That A/B is EVIDENCE for the next
    // tranche, not a default flip — flipping it changes the fixture's geometry, which is a CL-R3
    // question, not a CL-R0 one.
    clayCtxSetRoomShell(clayRoomShellOverrideOn()); // restored in clayRoomUnmount — see this function's own header note above (split B1: accessor — ES import bindings are read-only)

    // CL-R3's canonical review is the daylight hero: neutral clay still carries no authored site
    // material, while the shared production sun makes wall thickness, caps, stairs, and slab faces
    // readable without diagnostic bulbs. Other fixtures retain their existing opposing-pair start.
    const initialLightRecipeId = initialFixtureId === CLAY_ROOM_GROUND_FIELD_BENCH_ID
      ? "daylit"
      : (initialFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
      || initialFixtureId === CLAY_ROOM_MATERIAL_BENCH_ID
      || initialFixtureId === CLAY_ROOM_TRIM_BENCH_ID)
      ? "daylit"
      : "clay-opposing-pair";
    const compiled = clayRoomBoardFrom(record, { lightRecipeId: initialLightRecipeId }); // D15 — real spatializer + interiorBuildBoard (src/engine/clay-room.js)
    const movementFixture = clayRoomMovementFixtureFrom(record, compiled);
    // C1B mechanical session truth lives in GS, not in the renderer state. Rebuilds and animations
    // may replace THREE objects, but they keep this exact revisioned query state. Closing/reopening
    // the dev surface within one app session also keeps it until the explicit Movement reset.
    if(!GS.clayRoomMovementSession
      || !GS.clayRoomMovementSession.fixture
      || GS.clayRoomMovementSession.fixture.space.id !== movementFixture.space.id){
      GS.clayRoomMovementSession = {
        version: 1,
        fixture: movementFixture,
        initialState: movementFixture.state,
        state: movementFixture.state,
        preview: null,
        lastReceipt: null,
        pace: "dash",
        route: "east"
      };
    } else {
      GS.clayRoomMovementSession.fixture = movementFixture;
      GS.clayRoomMovementSession.initialState = movementFixture.state;
    }
    // CL-R0: the record and the diagnostic-active flag are set BEFORE the first setInteriorBoard so
    // that build's own tail hook (clayRoomAfterInteriorBoardRebuild) applies the surface route, the
    // light profile, and provenance exactly the way every LATER rebuild will. One code path for the
    // first frame and the thousandth — the previous version's separate post-mount call sequence is
    // precisely what later replays could not reproduce.
    S.clayRoomRecord = record;
    S.clayRoomCompiled = compiled;
    S.clayRoomLightRecipeId = compiled.lightRecipeId || "clay-opposing-pair";
    S.clayRoomMoodLayerId = CLAY_ROOM_MOOD_LAYERS.defaultId;
    S.clayRoomFixtureId = initialFixtureId;
    // CL-R2 ruling: presentation scale is the working default. True scale stays one click away as
    // an honest size-spectrum check; neither view mutates registry worldHeight or tactical span.
    S.clayRoomSpriteScaleMode = "diagnostic-cap";
    S.clayRoomSelectedSpriteSlug = CLAY_SPRITE_CITIZENSHIP_FIXTURE.selectedSlug;
    S.clayRoomLightOverlayModes = { position: false, range: false, shadow: false };
    S.clayRoomPreviewSeed = CLAY_ROOM_LIGHT_PREVIEW_SEEDS[0];
    S.clayCamOffset = { x: 0, z: 0 };
    S.clayCamZoom = S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
      ? 0.72 : (S.clayRoomFixtureId === CLAY_ROOM_TERRAIN_BENCH_ID ? 0.42
      : (S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID ? 0.9
        : (S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID ? 0.65
          : (S.clayRoomFixtureId === CLAY_ROOM_MATERIAL_BENCH_ID ? 0.78
            : (S.clayRoomFixtureId === CLAY_ROOM_TRIM_BENCH_ID ? 0.5
              : (S.clayRoomFixtureId === CLAY_ROOM_GROUND_FIELD_BENCH_ID ? 0.72 : 1))))));
    S.clayRoomStructureView = CLAY_STRUCTURE_BENCH_FIXTURE.defaultView;
    S.clayRoomMaterialMode = CLAY_MATERIAL_BENCH_FIXTURE.defaultMode;
    S.clayRoomTrimMode = CLAY_TRIM_BENCH_FIXTURE.defaultMode;
    S.clayRoomStructureStageLatch = clayStructureStagingLatchTransition(
      null,
      { type: CLAY_STRUCTURE_BENCH_FIXTURE.wallOmission.stagedEvent }
    );
    const initialStructureConnection = GS.clayRoomMovementSession.state.connections.find(function(row){
      return row.id === GS.clayRoomMovementSession.fixture.connectionId;
    });
    S.clayRoomStructureStageLatch = clayStructureStagingLatchTransition(
      S.clayRoomStructureStageLatch,
      { type: "door-state", state: initialStructureConnection ? initialStructureConnection.state : "shut" }
    );
    S.clayRoomDiagnosticActive = true;
    clayRoomSetInteriorBoard(clayRoomMovementBoardFromState(GS.clayRoomMovementSession.state) || compiled.board);
    if(initialFixtureId === CLAY_ROOM_GROUND_FIELD_BENCH_ID) clayRoomDisposeMovementOverlay();
    else clayRoomMovementRangesRender();
    clayRoomTagAllProvenance();
    markDirty();
    scheduleRender();

    S.clayRoomMounted = true;
    S.clayRoomHost = host;
    clayRoomWirePanZoom(host); // governed pan/zoom (drag · wheel · dblclick reset) — dev host only
    clayRoomMountOverlay(record, host);
  } catch(e) {
    try { console.warn("qa: clay-room mount failed", e); } catch(e2){}
  }
}

// CL-R3a (Adam's 2026-07-23 wall-omission ruling, RULED FOR TEST) — clayWallOmissionOn(): should
// camera-side wall segments build NO upper volume (compile-time omission, stem retained)? Default:
// ON exactly when the clay fixture is enabled (the ruled test bed), OFF in normal play until the
// test passes and Adam promotes the ruling game-wide. ?wallomit=1 forces on anywhere, ?wallomit=0
// forces off (the fade-only A/B). Memoized like every other clay flag.
let CLAY_WALL_OMISSION_FLAG = null;
function clayWallOmissionOn(){
  if(CLAY_WALL_OMISSION_FLAG === null){
    let on = null;
    try {
      if(typeof window !== "undefined" && window.location && window.location.search){
        const raw = new URLSearchParams(window.location.search).get("wallomit");
        if(raw === "1") on = true;
        else if(raw === "0") on = false;
      }
      if(on === null && typeof window !== "undefined" && window.GS && typeof window.GS.wallOmission === "boolean"){
        on = window.GS.wallOmission;
      }
    } catch(e){}
    CLAY_WALL_OMISSION_FLAG = (on === null) ? clayRoomShouldEnable() : on;
  }
  return CLAY_WALL_OMISSION_FLAG;
}

// CL-R0 — `?clayshell=1` (or GS.clayRoomShell === true) re-enables setInteriorBoard's own room-shell
// compiler for the clay fixture. Default OFF, preserving the pre-CL-R0 behaviour exactly; the flag
// exists so the "does the fixture still read as clay through the PRODUCTION room-shell construction
// path?" A/B is a reproducible capture rather than a source edit. Memoized like every other clay flag.
// CL-R3a: default flipped ON (was OFF) — the clay fixture now adopts the PRODUCTION room-shell wall
// construction (stem + uppers) by default, per the wall-omission ruling's test spec: with omission
// active, near walls simply build stem-only, so the old "shell walls read dark/opaque" reason for
// forcing the shell off is gone (and it was already fixed by the fade-aware swap, harness check 20).
// ?clayshell=0 (or GS.clayRoomShell === false) restores the plain InstancedMesh channel for the A/B.
let CLAY_ROOM_SHELL_FLAG = null;
function clayRoomShellOverrideOn(){
  if(CLAY_ROOM_SHELL_FLAG === null){
    let on = true;
    try {
      if(typeof window !== "undefined"){
        if(window.GS && window.GS.clayRoomShell === false) on = false;
        else if(window.location && window.location.search
          && new URLSearchParams(window.location.search).get("clayshell") === "0") on = false;
      }
    } catch(e){}
    CLAY_ROOM_SHELL_FLAG = on;
  }
  return CLAY_ROOM_SHELL_FLAG;
}

// D2 step 6 / D9 / D11 — the overlay panel, dormant-built the SAME way mountLightLab builds its own
// (plain styled divs, no framework, panel.id-guarded against a stale double-mount). Two tabs:
//   Facts   — clayRoomProse(record) shown VERBATIM (D9's own "same-facts-equivalence by
//             construction" law: the overlay never re-derives or reformats a single fact).
//   Explain — clayRoomExplain(record) VERBATIM, plus ONE edit affordance per BodyForm field
//             (worldHeight/heightSource/sizeCategory/occupiedCells/bestiaryId) that calls
//             clayRoomEditRefusal(field) and prints the typed refusal inline — D11's "no other
//             workbench scope" law: this is the only interactive control the panel offers besides
//             the tab switch and the close button.
// Plus a `renderer size <w>x<h> @ dpr <n>` line (wire-in step 6's own countable capture-packet line)
// read straight off the live S.renderer, never a re-derived guess.
let CLAY_ROOM_PANEL_POSITION = null;
function clayRoomMountOverlay(record, host){
  if(typeof document === "undefined") return;
  const stale = document.getElementById("clay-room-overlay");
  if(stale && stale.parentNode) stale.parentNode.removeChild(stale);

  const panel = document.createElement("div");
  panel.id = "clay-room-overlay";
  panel.setAttribute("data-region", "clay-room-workbench-inspector");
  panel.style.cssText =
    "position:fixed;top:44px;right:0;bottom:0;width:" + clayRoomWorkbenchDimensions().inspector + "px;overflow:auto;z-index:9002;box-sizing:border-box;" +
    "background:rgba(20,20,24,0.98);border-left:1px solid #444;padding:10px;" +
    "font:12px/1.3 -apple-system,sans-serif;color:#eee;box-shadow:0 4px 18px rgba(0,0,0,0.5);";

  const title = document.createElement("div");
  title.id = "clay-room-panel-drag-handle";
  title.setAttribute("aria-label", "Drag Clayroom panel");
  title.style.cssText = "font-weight:600;margin-bottom:4px;display:flex;gap:6px;justify-content:space-between;align-items:center;cursor:move;user-select:none;touch-action:none;";
  const titleText = document.createElement("span");
  titleText.textContent = S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
    ? "CL-F01 · STRUCTURE REVIEW"
    : (S.clayRoomFixtureId === CLAY_ROOM_MATERIAL_BENCH_ID
      ? "CL-F04 · MATERIAL REVIEW"
      : (S.clayRoomFixtureId === CLAY_ROOM_TRIM_BENCH_ID
        ? "CL-F05 · TRIMMED STRUCTURES"
        : "INSPECTOR · CLAY ROOM C1A"));
  titleText.style.cssText = "flex:1;";
  title.appendChild(titleText);
  const resetPositionBtn = document.createElement("button");
  resetPositionBtn.textContent = "dock right";
  resetPositionBtn.setAttribute("aria-label", "Reset Clayroom panel position and dock right");
  resetPositionBtn.style.cssText = "background:#2a2a30;border:1px solid #555;border-radius:3px;color:#ccd;font:10px monospace;cursor:pointer;padding:2px 5px;";
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Close Clayroom");
  closeBtn.style.cssText = "background:none;border:none;color:#ccc;font-size:16px;cursor:pointer;line-height:1;";
  closeBtn.addEventListener("click", function(){ clayRoomUnmount(); });
  title.appendChild(resetPositionBtn);
  title.appendChild(closeBtn);
  panel.appendChild(title);

  const panelPositionLine = document.createElement("div");
  panelPositionLine.id = "clay-room-panel-position";
  panelPositionLine.style.cssText = "color:#7f9;margin-bottom:5px;font:10px monospace;";
  panel.appendChild(panelPositionLine);

  const selectionCard = document.createElement("section");
  selectionCard.id = "clay-room-selection-inspector";
  selectionCard.style.cssText = "border:1px solid #39404a;background:#181b20;padding:8px;margin:0 0 8px;";
  const selectionKicker = document.createElement("div");
  selectionKicker.textContent = "SELECTED · LIVE PRODUCTION OBJECT";
  selectionKicker.style.cssText = "color:#8290a1;font:9px monospace;letter-spacing:.1em;";
  const selectionName = document.createElement("div");
  selectionName.style.cssText = "font:600 15px -apple-system,sans-serif;color:#eef3f7;margin:2px 0;";
  const selectionMeta = document.createElement("div");
  selectionMeta.style.cssText = "color:#9da8b5;font:10px/1.35 monospace;margin-bottom:7px;";
  selectionCard.appendChild(selectionKicker);
  selectionCard.appendChild(selectionName);
  selectionCard.appendChild(selectionMeta);
  const scopeRow = document.createElement("div");
  scopeRow.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;";
  const instanceScopeBtn = document.createElement("button");
  instanceScopeBtn.textContent = "INSTANCE";
  instanceScopeBtn.title = "Move or tune only this Clayroom instance; session-only by default.";
  const stateScopeBtn = document.createElement("button");
  stateScopeBtn.textContent = "STATE";
  stateScopeBtn.title = "Edit the selected production object's named state.";
  const socketScopeBtn = document.createElement("button");
  socketScopeBtn.textContent = "🔒 SOCKET";
  socketScopeBtn.title = "Protected authored socket. Use the explicit Mount tab and lock export.";
  const defaultScopeBtn = document.createElement("button");
  defaultScopeBtn.textContent = "🔒 DEFAULT";
  defaultScopeBtn.title = "Protected production default; an overwrite affects future rolls.";
  [instanceScopeBtn, stateScopeBtn, socketScopeBtn, defaultScopeBtn].forEach(function(b){
    b.style.cssText = "font:9px monospace;background:#252a32;color:#cad2dc;border:1px solid #414955;border-radius:3px;padding:5px 2px;cursor:pointer;";
    scopeRow.appendChild(b);
  });
  instanceScopeBtn.style.cssText += "background:#24516a;border-color:#4b9bc3;color:#eefaff;";
  socketScopeBtn.style.opacity = "0.72";
  defaultScopeBtn.style.opacity = "0.72";
  selectionCard.appendChild(scopeRow);
  const sessionLaw = document.createElement("div");
  sessionLaw.textContent = "SESSION ONLY · Clayroom movement does not rewrite a production socket.";
  sessionLaw.style.cssText = "padding:5px 6px;background:#17271f;color:#79d69a;border-left:2px solid #4da66d;font:9px/1.35 monospace;";
  selectionCard.appendChild(sessionLaw);
  const editorActions = document.createElement("div");
  editorActions.style.cssText = "display:flex;gap:5px;margin-top:6px;";
  const spriteEditorBtn = document.createElement("button");
  spriteEditorBtn.textContent = "open sprite editor ↗";
  spriteEditorBtn.title = "Run python3 dev/sprite-review.py, then open the selected sprite in the dedicated editor";
  const materialEditorBtn = document.createElement("button");
  materialEditorBtn.textContent = "material editor";
  materialEditorBtn.title = "Shared Material Editor seam; the admitted MM mapping pass is next.";
  [spriteEditorBtn, materialEditorBtn].forEach(function(b){
    b.style.cssText = "flex:1;font:9px monospace;background:#252a32;color:#ccd5df;border:1px solid #414955;border-radius:3px;padding:5px;cursor:pointer;";
    editorActions.appendChild(b);
  });
  materialEditorBtn.disabled = true;
  materialEditorBtn.style.opacity = "0.55";
  selectionCard.appendChild(editorActions);
  const saveActions = document.createElement("div");
  saveActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:5px;";
  const saveVariantBtn = document.createElement("button");
  saveVariantBtn.textContent = "SAVE AS NEW STATE";
  saveVariantBtn.title = "Session-state scaffold; persistence will land through a versioned recipe.";
  const overwriteDefaultBtn = document.createElement("button");
  overwriteDefaultBtn.textContent = "🔒 OVERWRITE DEFAULT";
  overwriteDefaultBtn.title = "Protected. DEFAULT changes apply to FUTURE ROLLS.";
  overwriteDefaultBtn.disabled = true;
  [saveVariantBtn, overwriteDefaultBtn].forEach(function(b){
    b.style.cssText = "font:9px monospace;background:#252a32;color:#ccd5df;border:1px solid #414955;border-radius:3px;padding:5px;";
    saveActions.appendChild(b);
  });
  overwriteDefaultBtn.style.opacity = "0.55";
  selectionCard.appendChild(saveActions);
  const futureRolls = document.createElement("div");
  futureRolls.textContent = "DEFAULT OVERWRITE → FUTURE ROLLS · locked until explicit promotion";
  futureRolls.style.cssText = "color:#a69773;font:9px monospace;margin-top:4px;";
  selectionCard.appendChild(futureRolls);
  panel.appendChild(selectionCard);
  function clayPanelClamp(left, top){
    const pad = 8, minTop = 52; // keep the floating title below the persistent 44px workbench bar
    const maxLeft = Math.max(pad, window.innerWidth - panel.offsetWidth - pad);
    const maxTop = Math.max(minTop, window.innerHeight - panel.offsetHeight - pad);
    return {
      left: Math.max(pad, Math.min(maxLeft, Number(left) || pad)),
      top: Math.max(minTop, Math.min(maxTop, Number(top) || minTop)),
    };
  }
  function clayPanelPlace(left, top, remember){
    const pos = clayPanelClamp(left, top);
    panel.style.bottom = "auto";
    panel.style.maxHeight = "calc(100vh - 60px)";
    panel.style.border = "1px solid #444";
    panel.style.borderRadius = "6px";
    panel.style.left = Math.round(pos.left) + "px";
    panel.style.top = Math.round(pos.top) + "px";
    panel.style.right = "auto";
    if(remember !== false) CLAY_ROOM_PANEL_POSITION = { left: pos.left, top: pos.top };
    const rect = panel.getBoundingClientRect();
    const inside = rect.left >= 0 && rect.top >= 0
      && rect.right <= window.innerWidth + 0.5 && rect.bottom <= window.innerHeight + 0.5;
    panelPositionLine.textContent = "panel x " + Math.round(rect.left) + " y " + Math.round(rect.top)
      + " · viewport clamp " + (inside ? "PASS" : "FAIL");
  }
  function clayPanelDockRight(){
    CLAY_ROOM_PANEL_POSITION = null;
    panel.style.width = clayRoomWorkbenchDimensions().inspector + "px";
    panel.style.left = "auto";
    panel.style.right = "0";
    panel.style.top = "44px";
    panel.style.bottom = "0";
    panel.style.maxHeight = "none";
    panel.style.border = "0";
    panel.style.borderLeft = "1px solid #444";
    panel.style.borderRadius = "0";
    panelPositionLine.textContent = "panel docked right · viewport clamp PASS · drag title to float";
  }
  function clayPanelResetPosition(){
    clayPanelDockRight();
  }
  resetPositionBtn.addEventListener("click", function(ev){
    ev.stopPropagation();
    clayPanelResetPosition();
  });
  let panelDrag = null;
  title.addEventListener("pointerdown", function(ev){
    if(ev.button !== 0 || (ev.target && ev.target.closest && ev.target.closest("button"))) return;
    const rect = panel.getBoundingClientRect();
    panelDrag = { pointerId: ev.pointerId, dx: ev.clientX - rect.left, dy: ev.clientY - rect.top };
    // Dragging the dedicated inspector title undocks it without disturbing any control below.
    clayPanelPlace(rect.left, rect.top, true);
    title.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  function clayPanelDragMove(ev){
    if(!panelDrag || panelDrag.pointerId !== ev.pointerId) return;
    clayPanelPlace(ev.clientX - panelDrag.dx, ev.clientY - panelDrag.dy, true);
  }
  function clayPanelEndDrag(ev){
    if(!panelDrag || panelDrag.pointerId !== ev.pointerId) return;
    panelDrag = null;
    if(title.hasPointerCapture(ev.pointerId)) title.releasePointerCapture(ev.pointerId);
  }
  // Listen on window as well as using capture: automation and older pointer implementations may
  // not retarget every move to the captured element once the cursor leaves the narrow title row.
  window.addEventListener("pointermove", clayPanelDragMove);
  window.addEventListener("pointerup", clayPanelEndDrag);
  window.addEventListener("pointercancel", clayPanelEndDrag);
  S.clayRoomPanelDragCleanup = function(){
    window.removeEventListener("pointermove", clayPanelDragMove);
    window.removeEventListener("pointerup", clayPanelEndDrag);
    window.removeEventListener("pointercancel", clayPanelEndDrag);
  };
  S.clayRoomPanelResizeHandler = function(){
    if(CLAY_ROOM_PANEL_POSITION){
      const rect = panel.getBoundingClientRect();
      clayPanelPlace(rect.left, rect.top, true);
    } else {
      clayPanelDockRight();
    }
    clayRoomApplyWorkbenchLayout();
    clayRoomResizeAndRestorePose();
  };
  window.addEventListener("resize", S.clayRoomPanelResizeHandler);

  const rendererLine = document.createElement("div");
  rendererLine.style.cssText = "color:#9ab;margin-bottom:6px;font:11px monospace;";
  const size = (S.renderer && typeof S.renderer.getSize === "function") ? S.renderer.getSize(new THREE.Vector2()) : null;
  const dpr = S.psxEnabled ? PSX_RES_SCALE : Math.min((typeof window !== "undefined" && window.devicePixelRatio) || 1, 2);
  rendererLine.textContent = size
    ? ("renderer size " + Math.round(size.x) + "x" + Math.round(size.y) + " @ dpr " + dpr)
    : "renderer size unavailable";
  panel.appendChild(rendererLine);

  // CL-R0 — the recipe identity line, beside the renderer line. A frame is only reproducible if the
  // receipt names BOTH identities: the fixture record (id/version/seed, in Facts) and the surface
  // recipe (id/version/mode) that decided what every surface rendered as.
  const recipeLine = document.createElement("div");
  recipeLine.style.cssText = "color:#9ab;margin-bottom:6px;font:11px monospace;";
  recipeLine.textContent = "surface recipe " + CLAY_DIAGNOSTIC_SURFACE_RECIPE.id +
    " v" + CLAY_DIAGNOSTIC_SURFACE_RECIPE.version + " mode " + clayRoomSurfaceMode();
  panel.appendChild(recipeLine);
  const camHint = document.createElement("div");
  camHint.textContent = "drag canvas to pan · wheel to zoom (up to 8× closer) · double-click to reset";
  camHint.style.cssText = "color:#7a8494;margin-bottom:6px;font:10px monospace;";
  panel.appendChild(camHint);

  const tabBar = document.createElement("div");
  tabBar.style.cssText = "display:flex;flex-wrap:wrap;gap:4px;border-top:1px solid #333;padding-top:6px;margin-bottom:6px;";
  const factsTabBtn = document.createElement("button");
  factsTabBtn.textContent = "Facts";
  const explainTabBtn = document.createElement("button");
  explainTabBtn.textContent = "Explain";
  const surfacesTabBtn = document.createElement("button");
  surfacesTabBtn.textContent = "Surfaces";
  const mountTabBtn = document.createElement("button");
  mountTabBtn.textContent = "Mount";
  const stateTabBtn = document.createElement("button");
  stateTabBtn.textContent = "State";
  const movementTabBtn = document.createElement("button");
  movementTabBtn.textContent = "Move";
  movementTabBtn.setAttribute("aria-label", "Clayroom production movement proof");
  const structureTabBtn = document.createElement("button");
  structureTabBtn.textContent = "Structure";
  structureTabBtn.setAttribute("aria-label", "Clayroom reusable structure grammar proof");
  const lightsTabBtn = document.createElement("button");
  lightsTabBtn.textContent = "Lights";
  lightsTabBtn.setAttribute("aria-label", "Clayroom lighting proof");
  const spritesTabBtn = document.createElement("button");
  spritesTabBtn.textContent = "Sprites";
  spritesTabBtn.setAttribute("aria-label", "Clayroom sprite citizenship proof");
  const materialsTabBtn = document.createElement("button");
  materialsTabBtn.textContent = "Materials";
  materialsTabBtn.setAttribute("aria-label", "Clayroom material integration proof");
  const trimTabBtn = document.createElement("button");
  trimTabBtn.textContent = "Trim";
  trimTabBtn.setAttribute("aria-label", "Clayroom complete trimmed structure proof");
  [factsTabBtn, explainTabBtn, surfacesTabBtn, mountTabBtn, stateTabBtn, movementTabBtn, structureTabBtn, lightsTabBtn, spritesTabBtn, materialsTabBtn, trimTabBtn].forEach(function(b){
    b.style.cssText = "flex:1 1 46px;font:11px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
  });
  tabBar.appendChild(factsTabBtn); tabBar.appendChild(explainTabBtn); tabBar.appendChild(surfacesTabBtn);
  tabBar.appendChild(mountTabBtn); tabBar.appendChild(stateTabBtn); tabBar.appendChild(movementTabBtn);
  tabBar.appendChild(structureTabBtn); tabBar.appendChild(lightsTabBtn); tabBar.appendChild(spritesTabBtn);
  tabBar.appendChild(materialsTabBtn); tabBar.appendChild(trimTabBtn);
  panel.appendChild(tabBar);
  if(S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
    || S.clayRoomFixtureId === CLAY_ROOM_MATERIAL_BENCH_ID
    || S.clayRoomFixtureId === CLAY_ROOM_TRIM_BENCH_ID){
    // CL-R3 correction: the generic object editor is useful in the ordinary Clayroom, but it
    // buried this focused review under scope buttons, editor actions, renderer telemetry, and nine
    // tabs. The structure fixture rebuilds the overlay when entered, so it can present one task:
    // the structure view itself. Fixture switching remains inside the Structure body.
    selectionCard.style.display = "none";
    rendererLine.style.display = "none";
    recipeLine.style.display = "none";
    camHint.style.display = "none";
    tabBar.style.display = "none";
  }

  const factsBody = document.createElement("pre");
  factsBody.style.cssText = "white-space:pre-wrap;font:11px/1.4 monospace;color:#dde;margin:0;";
  factsBody.textContent = clayRoomProse(record);

  const explainBody = document.createElement("div");
  explainBody.style.cssText = "display:none;";
  const explainPre = document.createElement("pre");
  explainPre.style.cssText = "white-space:pre-wrap;font:11px/1.4 monospace;color:#dde;margin:0 0 6px;";
  // D13 (spec addendum D15 point 4) — one line, LIVE values off the real audit function, appended to
  // clayRoomExplain(record)'s own verbatim text (never folded into that pure engine-module string,
  // which has no S/scene access to compute this from).
  const provenanceAudit = (typeof clayRoomProvenanceAudit === "function") ? clayRoomProvenanceAudit() : { tagged: [], orphans: [] };
  explainPre.textContent = clayRoomExplain(record) +
    "\nProvenance audit: " + provenanceAudit.tagged.length + " groups tagged, " + provenanceAudit.orphans.length + " orphans.";
  explainBody.appendChild(explainPre);

  const refusalHeader = document.createElement("div");
  refusalHeader.textContent = "BodyForm fields (generated — edit refused):";
  refusalHeader.style.cssText = "color:#9ab;margin-bottom:2px;";
  explainBody.appendChild(refusalHeader);
  const refusalOut = document.createElement("pre");
  refusalOut.style.cssText = "white-space:pre-wrap;font:10px/1.4 monospace;color:#e8b;margin:4px 0 0;min-height:1em;";
  ["worldHeight", "heightSource", "sizeCategory", "occupiedCells", "bestiaryId"].forEach(function(field){
    const btn = document.createElement("button");
    btn.textContent = "edit " + field;
    btn.style.cssText = "font:10px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:2px 5px;margin:0 4px 4px 0;";
    btn.addEventListener("click", function(){
      refusalOut.textContent = JSON.stringify(clayRoomEditRefusal(field));
    });
    explainBody.appendChild(btn);
  });
  explainBody.appendChild(refusalOut);

  // CL-R0 Surfaces tab — the provenance inspector's v0: every visible surface, its owning builder,
  // the recipe route that claimed it, and whether a colour texture is still bound. Rendered LIVE on
  // each tab open (never cached at mount) so it reflects the tree after whatever rebuild ran last —
  // which is the whole point: the durability question is answered by looking, not by trusting.
  const surfacesBody = document.createElement("pre");
  surfacesBody.style.cssText = "display:none;white-space:pre-wrap;font:10px/1.4 monospace;color:#dde;margin:0;";
  function clayRenderSurfacesTab(){
    const c = clayRoomSurfaceCensus();
    const lines = [];
    lines.push("recipe " + c.recipe.id + " v" + c.recipe.version + " mode " + c.recipe.mode);
    lines.push("textured-clay surfaces: " + c.texturedClayCount + "   (CL-R0 requires 0)");
    lines.push("unclaimed surfaces:     " + c.unclaimed.length + "   (CL-R0 requires 0)");
    lines.push("");
    c.surfaces.forEach(function(s){
      lines.push([
        (s.role || "—").padEnd(10),
        s.route.padEnd(16),
        (s.colorHex || "—").padEnd(8),
        (s.textured ? "TEXTURED" : "flat").padEnd(9),
        "x" + s.instances,
        s.builder,
      ].join(" "));
    });
    surfacesBody.textContent = lines.join("\n");
  }

  // ── Mount tab — DEV-PORTAL.md §6.1 Object Workbench, the DOOR-MOUNT SLICE (landed early; see the
  // spec's own implementation-status note). Adam, 2026-07-23: "i need the dev tool to just do it
  // myself, make sure there is some kind of snapping and individual axis control." Conformance:
  //   - §6.1's nudge ladder verbatim: click/arrow 0.01 · Shift 0.001 · Alt 0.10 (world units).
  //   - individual axes: depthInWall (along, + = deeper into the wall) · sideLap (lateral along the
  //     wall run) · sill (vertical). Mapped onto GS.doorMountTune {along, lateral, vertical}.
  //   - named snap candidates per the spec amendment: cell-centre / boundary / wall-centre (the
  //     wall-centre candidate is MEASURED off the built wall body nearest the door, live).
  //   - portal rule 4: edits mutate only the in-memory tune and replay the board — never a mesh
  //     drag, never a JS-constant rewrite. The lock-shaped export (kind:object-mount) is the save
  //     surrogate until the portal's lock compiler exists.
  const mountBody = document.createElement("div");
  mountBody.style.cssText = "display:none;font:11px/1.5 monospace;color:#dde;";
  function clayMountTune(){ 
    if(typeof GS === "undefined" || !GS) return null;
    if(!GS.doorMountTune) GS.doorMountTune = {
      along: ITR_DOOR_DEPTH_IN_WALL_DEFAULT, lateral: 0, vertical: 0
    };
    return GS.doorMountTune;
  }
  function clayMountReplay(){
    S.boardKey = null;
    if(S.lastBoard && S.lastBoard.kind === "interior3d"){
      clayRoomSetInteriorBoard(S.lastBoard, { roomTransition: false, reason: "clayroom-mount-edit" });
    }
  }
  // wall-centre snap: measure the built wall body nearest the door along its passage axis — the
  // same translate-only bb-centre read the census uses, scoped to room-shell wall meshes.
  function clayMountWallCentreAlong(){
    const axes = (S.lastBoard && S.lastBoard.doorAxes && S.lastBoard.doorAxes[0]) || null;
    if(!axes || !S.interiorGroup) return null;
    const passageIsZ = !axes.widthAxisIsZ;
    const doorWorld = passageIsZ ? (axes.z - (S.boardOrigin ? S.boardOrigin.cz : 0)) : (axes.x - (S.boardOrigin ? S.boardOrigin.cx : 0));
    let best = null, bestD = Infinity;
    S.interiorGroup.traverse(function(node){
      if(!node.isMesh || !node.userData || String(node.userData.interiorKind || "").indexOf("wall") < 0) return;
      if(!node.geometry) return;
      if(!node.geometry.boundingBox) node.geometry.computeBoundingBox();
      const bb = node.geometry.boundingBox; if(!bb) return;
      const c = passageIsZ ? (node.position.z + (bb.min.z + bb.max.z) / 2) : (node.position.x + (bb.min.x + bb.max.x) / 2);
      const thick = passageIsZ ? (bb.max.z - bb.min.z) : (bb.max.x - bb.min.x);
      if(thick > 1) return; // a wall RUN measured along its run axis, not its thickness — skip
      const d = Math.abs(c - doorWorld);
      if(d < bestD){ bestD = d; best = c; }
    });
    if(best === null) return null;
    // convert the wall-centre world coord into a NET along value (cell centre -> wall centre,
    // outward-signed), then into the TUNE value (net minus the anchor-derivation default).
    const sign = passageIsZ ? (axes.edgeSignZ || 0) : (axes.edgeSignX || 0);
    if(!sign) return null;
    const net = (best - doorWorld) * sign;
    return net - ITR_DOOR_MOUNT_ALONG_SHELL;
  }
  const mountRows = {};
  function clayMountRender(){
    const tune = clayMountTune(); if(!tune) return;
    const rep = S.doorMountReport;
    mountRows.depthInWall.textContent = (tune.along >= 0 ? "+" : "") + tune.along.toFixed(3);
    mountRows.sideLap.textContent = (tune.lateral >= 0 ? "+" : "") + tune.lateral.toFixed(3);
    mountRows.sill.textContent = (tune.vertical >= 0 ? "+" : "") + tune.vertical.toFixed(3);
    mountRows.applied.textContent = rep && rep.perDoor[0]
      ? ("applied dx " + rep.perDoor[0].dx + "  dz " + rep.perDoor[0].dz + "  dy " + rep.perDoor[0].dy +
         "  (anchor default along " + rep.alongDefault + ", shell " + rep.shellOn + ")")
      : "no door mounted";
    mountRows.exportBox.value = JSON.stringify({
      kind: "object-mount", id: "door", version: 1,
      fixture: "clay-c1a", recipe: "camera-side-wall-omission v1 + clay-diagnostic-surface v1",
      values: { depthInWallU: tune.along, sideLapU: tune.lateral, sillU: tune.vertical },
      appliedWorld: rep && rep.perDoor[0] ? rep.perDoor[0] : null,
    });
  }
  function clayMountNudge(axis, dir, ev){
    const tune = clayMountTune(); if(!tune) return;
    const step = ev && ev.shiftKey ? 0.001 : (ev && ev.altKey ? 0.10 : 0.01); // §6.1's ladder verbatim
    tune[axis] = +(tune[axis] + dir * step).toFixed(3);
    clayMountReplay(); clayMountRender();
  }
  function clayMountSnap(which){
    const tune = clayMountTune(); if(!tune) return;
    if(which === "cell-centre") tune.along = -ITR_DOOR_MOUNT_ALONG_SHELL; // net 0 from the cell
    else if(which === "boundary") tune.along = 0;                        // centre plane on wall face
    else if(which === "wall-centre"){
      const v = clayMountWallCentreAlong();
      if(v !== null) tune.along = +v.toFixed(3);
    }
    clayMountReplay(); clayMountRender();
  }
  [["depthInWall", "along", "depth into wall"], ["sideLap", "lateral", "lateral along run"], ["sill", "vertical", "vertical"]].forEach(function(def){
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:5px;margin:3px 0;";
    const label = document.createElement("span");
    label.textContent = def[0]; label.title = def[2];
    label.style.cssText = "width:86px;color:#9ab;";
    const minus = document.createElement("button"); minus.textContent = "−";
    const value = document.createElement("span"); value.style.cssText = "width:64px;text-align:center;";
    const plus = document.createElement("button"); plus.textContent = "+";
    [minus, plus].forEach(function(b){ b.style.cssText = "font:11px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:1px 8px;"; });
    minus.addEventListener("click", function(ev){ clayMountNudge(def[1], -1, ev); });
    plus.addEventListener("click", function(ev){ clayMountNudge(def[1], +1, ev); });
    row.appendChild(label); row.appendChild(minus); row.appendChild(value); row.appendChild(plus);
    mountBody.appendChild(row);
    mountRows[def[0]] = value;
  });
  const stepNote = document.createElement("div");
  stepNote.textContent = "click ±0.01 · shift-click ±0.001 · alt-click ±0.10 (world units; 1 = 1 cell = 5 ft)";
  stepNote.style.cssText = "color:#7a8494;margin:2px 0 6px;";
  mountBody.appendChild(stepNote);
  const snapRow = document.createElement("div");
  snapRow.style.cssText = "display:flex;gap:4px;margin:2px 0 6px;";
  ["cell-centre", "boundary", "wall-centre"].forEach(function(which){
    const b = document.createElement("button");
    b.textContent = "snap " + which;
    b.style.cssText = "flex:1;font:10px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:3px;";
    b.addEventListener("click", function(){ clayMountSnap(which); });
    snapRow.appendChild(b);
  });
  mountBody.appendChild(snapRow);
  mountRows.applied = document.createElement("div");
  mountRows.applied.style.cssText = "color:#9ab;margin:4px 0;";
  mountBody.appendChild(mountRows.applied);
  const exportLabel = document.createElement("div");
  exportLabel.textContent = "lock export (kind:object-mount — copy; the portal's SAVE pipeline lands with DEV-PORTAL):";
  exportLabel.style.cssText = "color:#7a8494;margin-top:6px;";
  mountBody.appendChild(exportLabel);
  mountRows.exportBox = document.createElement("textarea");
  mountRows.exportBox.readOnly = true;
  mountRows.exportBox.style.cssText = "width:100%;height:64px;font:10px monospace;background:#1a1a20;color:#cd9;border:1px solid #333;border-radius:3px;margin-top:2px;";
  mountBody.appendChild(mountRows.exportBox);

  // C1B Move tab — every answer comes from src/engine/tactical-query.js over the SAME SpatialPlan
  // that built the visible room. Filled cyan cells are the ordinary 30-ft band; hollow amber
  // diamonds are the additional Dash band, so the distinction survives without colour. Clicking
  // the real floor chooses a destination; only the kernel decides whether the preview is lawful.
  const movementBody = document.createElement("div");
  movementBody.style.cssText = "display:none;font:10px/1.45 monospace;color:#dde;";
  const movementIntro = document.createElement("div");
  movementIntro.innerHTML =
    "<div style='color:#9ab;margin-bottom:5px'>PRODUCTION SPATIALPLAN → TACTICAL QUERY → RECEIPT → MOVE-STEP</div>" +
    "<div><span style='color:#43b9df'>■ filled</span> MOVE 30 ft · <span style='color:#f2bd54'>◇ hollow</span> DASH +30 ft</div>" +
    "<div style='color:#7a8494;margin:3px 0 7px'>Move tab active: click a floor cell to preview. Pan still works by dragging.</div>";
  movementBody.appendChild(movementIntro);
  const movementPace = document.createElement("div");
  movementPace.style.cssText = "display:flex;gap:5px;margin-bottom:5px;";
  const movePaceBtn = document.createElement("button");
  movePaceBtn.textContent = "MOVE · 30 ft";
  const dashPaceBtn = document.createElement("button");
  dashPaceBtn.textContent = "DASH · 60 ft";
  [movePaceBtn, dashPaceBtn].forEach(function(button){
    button.style.cssText = "flex:1;font:10px monospace;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    movementPace.appendChild(button);
  });
  movementBody.appendChild(movementPace);
  const movementRoute = document.createElement("div");
  movementRoute.style.cssText = "display:flex;gap:5px;margin-bottom:5px;";
  const autoRouteBtn = document.createElement("button");
  autoRouteBtn.textContent = "AUTO";
  const eastRouteBtn = document.createElement("button");
  eastRouteBtn.textContent = "EAST / SAFE";
  const westRouteBtn = document.createElement("button");
  westRouteBtn.textContent = "WEST / DIFFICULT";
  [autoRouteBtn, eastRouteBtn, westRouteBtn].forEach(function(button){
    button.style.cssText = "flex:1;font:9px monospace;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    movementRoute.appendChild(button);
  });
  movementBody.appendChild(movementRoute);
  const movementActions = document.createElement("div");
  movementActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:6px;";
  const previewDoorBtn = document.createElement("button");
  previewDoorBtn.textContent = "PREVIEW DOOR";
  const usePortalBtn = document.createElement("button");
  usePortalBtn.textContent = "PREVIEW PORTAL USE";
  const commitMoveBtn = document.createElement("button");
  commitMoveBtn.textContent = "COMMIT PREVIEW";
  const resetMoveBtn = document.createElement("button");
  resetMoveBtn.textContent = "RESET MOVEMENT";
  [previewDoorBtn, usePortalBtn, commitMoveBtn, resetMoveBtn].forEach(function(button){
    button.style.cssText = "font:9px monospace;background:#252a32;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
    movementActions.appendChild(button);
  });
  commitMoveBtn.style.background = "#254536";
  resetMoveBtn.style.background = "#49352e";
  movementBody.appendChild(movementActions);
  const movementOut = document.createElement("pre");
  movementOut.id = "clay-room-movement-readout";
  movementOut.style.cssText = "white-space:pre-wrap;color:#dde;border-top:1px solid #333;padding-top:6px;margin:6px 0 0;";
  movementBody.appendChild(movementOut);

  function clayMovementSession(){
    return clayRoomMovementSession();
  }
  function clayMovementVia(session){
    if(session.route === "east") return session.fixture.localCells.east;
    if(session.route === "west") return session.fixture.localCells.west;
    return null;
  }
  function clayMovementPreview(request){
    const session = clayMovementSession();
    if(!session || session.busy) return;
    session.preview = tqMovementPreview(session.fixture.space, session.state, request);
    clayMovementRender();
  }
  function clayMovementPreviewCell(cellId){
    const session = clayMovementSession();
    if(!session) return;
    clayMovementPreview({
      actorId: session.fixture.actorId,
      destinationCellId: cellId,
      pace: session.pace,
      viaCellId: clayMovementVia(session),
      routeLabel: session.route === "west"
        ? "west difficult shoulder"
        : (session.route === "east" ? "east of the crate" : "shortest lawful route")
    });
  }
  S.clayRoomMovementPreviewCell = clayMovementPreviewCell;
  function clayMovementRender(readoutOnly){
    const session = clayMovementSession();
    if(!session) return;
    const actor = session.state.actors.find(function(row){ return row.id === session.fixture.actorId; });
    const connection = session.state.connections.find(function(row){ return row.id === session.fixture.connectionId; });
    const ranges = tqMovementRanges(session.fixture.space, session.state, session.fixture.actorId);
    if(!readoutOnly){
      if(S.clayRoomFixtureId === CLAY_ROOM_GROUND_FIELD_BENCH_ID) clayRoomDisposeMovementOverlay();
      else clayRoomRenderMovementOverlay(ranges, session.preview);
    }
    movePaceBtn.style.background = session.pace === "move" ? "#24516a" : "#2a2a30";
    dashPaceBtn.style.background = session.pace === "dash" ? "#6a4d24" : "#2a2a30";
    autoRouteBtn.style.background = session.route === "auto" ? "#3a3a44" : "#2a2a30";
    eastRouteBtn.style.background = session.route === "east" ? "#35543b" : "#2a2a30";
    westRouteBtn.style.background = session.route === "west" ? "#684a28" : "#2a2a30";
    commitMoveBtn.disabled = !session.preview || !session.preview.ok || !!session.busy;
    commitMoveBtn.style.opacity = commitMoveBtn.disabled ? "0.5" : "1";
    const conn = session.fixture.space.connections[0];
    const ordinary = tqConnectionAssessment(conn, actor.bodyForm);
    const largeBody = Object.assign({}, actor.bodyForm, { sizeCategory: "Large" });
    const hugeBody = Object.assign({}, actor.bodyForm, { sizeCategory: "Huge" });
    const difficult = tqConnectionAssessment(conn, largeBody);
    const blocked = tqConnectionAssessment(conn, hugeBody);
    const uncertain = tqConnectionAssessment(conn, actor.bodyForm, "force-warped-frame");
    const lines = [
      "STATE rev " + session.state.revision + " · actor " + actor.sceneId + " / " + actor.cellId,
      "CONNECTION " + connection.id + " v" + connection.version + " · " + connection.state + " · one owner",
      "RANGE move " + ranges.moveCellIds.length + " cells · dash-only " + ranges.dashCellIds.length + " cells",
      "DOOR " + (ranges.moveCellIds.indexOf(session.fixture.localCells.portal) >= 0 ? "MOVE" :
        (ranges.dashCellIds.indexOf(session.fixture.localCells.portal) >= 0 ? "DASH" : "OUT OF RANGE")),
      "",
      "BODY CASES (same production connection)",
      "  Small → " + ordinary.kind,
      "  Large → " + difficult.kind + " · " + difficult.reason,
      "  Huge  → " + blocked.kind + " · alternatives " + blocked.alternatives.length,
      "  optional warped-frame method → " + uncertain.kind + " · exact DC hidden until commit",
      ""
    ];
    if(session.preview){
      lines.push(tqReceiptProse(session.preview));
    } else {
      lines.push("No preview. Click a floor cell or use a preview button.");
    }
    if(session.lastReceipt){
      lines.push("", "LAST COMMIT", tqReceiptProse(session.lastReceipt));
    }
    const animation = session.animationProof;
    lines.push("", "ANIMATION " + (session.busy ? "ACTIVE · receipt already committed" : "settled"));
    if(animation){
      lines.push("  actor " + (animation.actorFound ? "FOUND" : "MISSING")
        + " · steps " + animation.completedSteps + "/" + animation.requestedSteps
        + " · " + animation.status);
      if(!animation.actorFound && animation.selectionProbe){
        lines.push("  lookup " + animation.selectionProbe.visited + " nodes · candidates "
          + (animation.selectionProbe.candidates.join(", ") || "none"));
      }
    }
    movementOut.textContent = lines.join("\n");
  }
  movePaceBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.pace = "move"; clayMovementRender();
  });
  dashPaceBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.pace = "dash"; clayMovementRender();
  });
  autoRouteBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.route = "auto"; clayMovementRender();
  });
  eastRouteBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.route = "east"; clayMovementRender();
  });
  westRouteBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.route = "west"; clayMovementRender();
  });
  previewDoorBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    clayMovementPreviewCell(session.fixture.localCells.portal);
  });
  usePortalBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    clayMovementPreview({
      actorId: session.fixture.actorId,
      connectionId: session.fixture.connectionId,
      pace: session.pace,
      routeLabel: "use canonical north connection"
    });
  });
  commitMoveBtn.addEventListener("click", function(){
    const session = clayMovementSession();
    if(!session || session.busy || !session.preview || !session.preview.ok) return;
    const committed = tqMovementCommit(session.fixture.space, session.state, session.preview);
    if(!committed.ok){
      session.preview = committed;
      clayMovementRender();
      return;
    }
    session.state = committed.state;
    session.lastReceipt = committed.receipt;
    session.preview = null;
    session.busy = true;
    const lightBefore = clayRoomLightingSnapshot("before-movement-animation");
    clayRoomRecordLightingProbe("movement " + committed.receipt.id, lightBefore, true);
    clayMovementRender();
    clayRoomAnimateMovementReceipt(committed.receipt, function(){
      clayRoomApplyMovementBoard(session.state, "clayroom-movement-receipt");
      session.busy = false;
      clayMovementRender();
    }, function(){ clayMovementRender(true); });
  });
  resetMoveBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session || session.busy) return;
    session.state = session.initialState;
    session.preview = null;
    session.lastReceipt = null;
    session.animationProof = null;
    session.pace = "dash";
    session.route = "east";
    clayRoomApplyMovementBoard(session.state, "clayroom-movement-reset");
    clayMovementRender();
  });

  // State tab — an executable proof of the production door projection, not a second demo door.
  // Each button clone-patches S.lastBoard.interactables and replays the SAME setInteriorBoard ->
  // interiorBuildInteractables -> hinge tween path normal state projection uses. The canonical clay
  // record stays frozen; this override lives only for the current dev session.
  const stateBody = document.createElement("div");
  stateBody.style.cssText = "display:none;font:11px/1.5 monospace;color:#dde;";
  const stateIntro = document.createElement("div");
  stateIntro.textContent = "canonical Connection commit → board.interactables projection → 320ms hinge tween";
  stateIntro.style.cssText = "color:#9ab;margin-bottom:6px;";
  stateBody.appendChild(stateIntro);
  const stateButtons = document.createElement("div");
  stateButtons.style.cssText = "display:flex;gap:5px;margin-bottom:7px;";
  const stateOut = document.createElement("div");
  stateOut.style.cssText = "white-space:pre-wrap;color:#cd9;border-top:1px solid #333;padding-top:6px;";
  function clayDoorStateRender(){
    const proof = clayRoomDoorProofState();
    stateOut.textContent = [
      "authored " + (proof.authoredState || "—") + " · mounted " + (proof.mountedState || "—"),
      "hinge " + (proof.hingeAngleDeg == null ? "—" : proof.hingeAngleDeg.toFixed(1) + "°") +
        " · leaf " + (proof.leafVisible ? "visible" : "hidden"),
      "tween " + (proof.tweenActive ? "ACTIVE" : "settled") +
        (proof.mount ? " · mount dx " + proof.mount.dx + " dz " + proof.mount.dz + " dy " + proof.mount.dy : ""),
    ].join("\n");
  }
  function clayDoorStateApply(nextState){
    const session = clayMovementSession();
    if(!session || session.busy) return;
    const committed = tqConnectionStateCommit(session.fixture.space, session.state, {
      connectionId: session.fixture.connectionId,
      state: nextState
    });
    if(!committed.ok) return;
    session.state = committed.state;
    session.lastReceipt = committed.receipt;
    session.preview = null;
    clayRoomApplyMovementBoard(session.state, "clayroom-door-state");
    clayDoorStateRender();
    clayMovementRender();
    setTimeout(clayDoorStateRender, ITR_DOOR_SWING_TWEEN_MS + 40);
  }
  [["shut", "Set door shut"], ["ajar", "Set door ajar"], ["open", "Set door open"]].forEach(function(def){
    const b = document.createElement("button");
    b.textContent = def[0];
    b.setAttribute("aria-label", def[1]);
    b.style.cssText = "flex:1;font:11px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    b.addEventListener("click", function(){ clayDoorStateApply(def[0]); });
    stateButtons.appendChild(b);
  });
  stateBody.appendChild(stateButtons);
  stateBody.appendChild(stateOut);

  // CL-R3 Structure tab — inspection and A/B views over the mounted production structure bench.
  // The controls reveal authored facts; they do not mutate dimensions or invent a second builder.
  const structureBody = document.createElement("div");
  structureBody.style.cssText = "display:none;font:10px/1.45 -apple-system,sans-serif;color:#dde;";
  const structureIntro = document.createElement("div");
  structureIntro.innerHTML =
    "<div style='color:#9fd4ec;font:600 12px monospace;margin-bottom:4px'>CL-F01 · STRUCTURAL CONTINUITY</div>" +
    "<div style='color:#9ab'>Corners, foundations, elevation joins, stairs, and access. Select one view; diagnostic overlays focus on one piece.</div>";
  structureBody.appendChild(structureIntro);
  const structureFixtureDetails = document.createElement("details");
  structureFixtureDetails.style.cssText = "margin:7px 0;color:#9ab;";
  const structureFixtureSummary = document.createElement("summary");
  structureFixtureSummary.textContent = "Switch fixture";
  structureFixtureSummary.style.cssText = "cursor:pointer;color:#aeb9c6;font:9px monospace;";
  structureFixtureDetails.appendChild(structureFixtureSummary);
  const structureFixtureNav = document.createElement("div");
  structureFixtureNav.style.cssText = "display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:5px 0;";
  [
    [CLAY_ROOM_TRUTH_FIXTURE_ID, "ROOM"],
    [CLAY_ROOM_STRUCTURE_BENCH_ID, "STRUCTURE"],
    [CLAY_ROOM_LIGHTING_BENCH_ID, "LIGHTS"],
    [CLAY_ROOM_SPRITE_BENCH_ID, "SPRITES"],
    [CLAY_ROOM_MATERIAL_BENCH_ID, "MATERIAL"],
    [CLAY_ROOM_TRIM_BENCH_ID, "TRIM"],
    [CLAY_ROOM_TERRAIN_BENCH_ID, "TERRAIN"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.style.cssText = "font:8px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", function(){
      clayRoomSetFixture(def[0], "clayroom-structure-fixture-nav");
      if(def[0] === CLAY_ROOM_STRUCTURE_BENCH_ID) clayShowTab("structure");
      else if(def[0] === CLAY_ROOM_LIGHTING_BENCH_ID) clayShowTab("lights");
      else if(def[0] === CLAY_ROOM_SPRITE_BENCH_ID) clayShowTab("sprites");
      else if(def[0] === CLAY_ROOM_MATERIAL_BENCH_ID) clayShowTab("materials");
      else if(def[0] === CLAY_ROOM_TRIM_BENCH_ID) clayShowTab("trim");
      else clayShowTab("movement");
    });
    structureFixtureNav.appendChild(button);
  });
  structureFixtureDetails.appendChild(structureFixtureNav);
  structureBody.appendChild(structureFixtureDetails);
  const structureViewLabel = document.createElement("div");
  structureViewLabel.textContent = "VIEW";
  structureViewLabel.style.cssText = "color:#7f8d9c;font:600 9px monospace;letter-spacing:.12em;margin:8px 0 4px;";
  structureBody.appendChild(structureViewLabel);
  const structureViewActions = document.createElement("div");
  structureViewActions.style.cssText = "display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:7px;";
  const structureViewButtons = {};
  [
    ["assembled", "ASSEMBLED"],
    ["stairs", "STAIRS"],
    ["sockets", "SOCKETS"],
    ["access", "ACCESS"],
    ["climb", "CLIMB"],
    ["negative", "BAD JOIN"],
    ["strategic", "ALL WALLS"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Show Clayroom structure " + def[0] + " view");
    button.style.cssText = "font:8px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetStructureView(def[0]); });
    structureViewActions.appendChild(button);
    structureViewButtons[def[0]] = button;
  });
  structureBody.appendChild(structureViewActions);
  const structureStageDetails = document.createElement("details");
  structureStageDetails.style.cssText = "margin:5px 0 8px;color:#9ab;";
  const structureStageSummary = document.createElement("summary");
  structureStageSummary.textContent = "Scene staging controls";
  structureStageSummary.style.cssText = "cursor:pointer;color:#aeb9c6;font:9px monospace;";
  structureStageDetails.appendChild(structureStageSummary);
  const structureStageActions = document.createElement("div");
  structureStageActions.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:5px 0;";
  const structureStageButtons = {};
  [
    ["sealed", "LEAVE PLAY", function(){ clayRoomSetStructureStaged(false); }],
    ["staged", "STAGE SPACE", function(){ clayRoomSetStructureStaged(true); }],
    ["shut", "SHUT DOOR", function(){ clayRoomSetStructureDoorState("shut"); }],
    ["open", "OPEN DOOR", function(){ clayRoomSetStructureDoorState("open"); }]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Clayroom structure " + def[0]);
    button.style.cssText = "font:7px monospace;background:#252a32;color:#cfd8e3;border:1px solid #414955;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", def[2]);
    structureStageActions.appendChild(button);
    structureStageButtons[def[0]] = button;
  });
  structureStageDetails.appendChild(structureStageActions);
  structureBody.appendChild(structureStageDetails);
  const structureFixture = clayRoomStructureBenchFixtureFrom(record);
  const structurePieceLabel = document.createElement("label");
  structurePieceLabel.textContent = "FOCUS PIECE";
  structurePieceLabel.style.cssText = "display:block;color:#7f8d9c;font:600 9px monospace;letter-spacing:.12em;margin:8px 0 4px;";
  const structurePieceSelect = document.createElement("select");
  structurePieceSelect.setAttribute("aria-label", "Choose Clayroom structure focus piece");
  structurePieceSelect.style.cssText = "width:100%;background:#20252c;color:#e2e8ef;border:1px solid #46515e;border-radius:4px;padding:7px;font:10px monospace;margin-bottom:7px;";
  structureFixture.pieces.forEach(function(spec){
    const option = document.createElement("option");
    option.value = spec.id;
    option.textContent = (spec.assembly ? "ASSEMBLY · " : "") + spec.label.replace(/^ASSEMBLY · /, "");
    structurePieceSelect.appendChild(option);
  });
  structurePieceSelect.addEventListener("change", function(){
    S.clayRoomSelectedId = structurePieceSelect.value;
    clayRoomStructureClimbTargetSet(structurePieceSelect.value, null, null);
    S.clayRoomWorkbenchSelect(structurePieceSelect.value, "structure focus");
    clayRoomApplyStructureViewVisibility(S.clayRoomStructureView || structureFixture.defaultView);
  });
  structureBody.appendChild(structurePieceLabel);
  structureBody.appendChild(structurePieceSelect);
  const structureLegend = document.createElement("div");
  structureLegend.id = "clay-room-structure-legend";
  structureLegend.style.cssText = "background:#171d24;border:1px solid #35414d;border-radius:4px;padding:8px;color:#aeb9c6;margin-bottom:7px;";
  structureBody.appendChild(structureLegend);
  const structureSummaryCard = document.createElement("div");
  structureSummaryCard.style.cssText = "background:#202831;border-left:3px solid #6fcfff;padding:8px;margin:7px 0;color:#dfe7ef;";
  structureBody.appendChild(structureSummaryCard);
  const structureClimbCard = document.createElement("div");
  structureClimbCard.style.cssText = "background:#171d24;border:1px solid #40505f;border-radius:4px;padding:8px;margin:7px 0;color:#dfe7ef;";
  const structureClimbTitle = document.createElement("div");
  structureClimbTitle.textContent = "CLICK-TO-CLIMB";
  structureClimbTitle.style.cssText = "color:#f0c76c;font:700 10px monospace;letter-spacing:.08em;margin-bottom:4px;";
  const structureClimbTarget = document.createElement("div");
  structureClimbTarget.style.cssText = "color:#aebdcb;font:9px/1.4 monospace;margin-bottom:6px;";
  const structureClimbControls = document.createElement("div");
  structureClimbControls.style.cssText = "display:grid;grid-template-columns:64px 54px 1fr;gap:5px;align-items:end;";
  const structureClimbRollLabel = document.createElement("label");
  structureClimbRollLabel.textContent = "OPEN d20";
  structureClimbRollLabel.style.cssText = "display:grid;gap:2px;color:#8090a0;font:8px monospace;";
  const structureClimbRoll = document.createElement("input");
  structureClimbRoll.type = "number";
  structureClimbRoll.min = "1";
  structureClimbRoll.max = "20";
  structureClimbRoll.value = "12";
  structureClimbRoll.setAttribute("aria-label", "Clayroom climb open d20");
  structureClimbRoll.style.cssText = "width:100%;background:#20252c;color:#f4f7fa;border:1px solid #4b5967;border-radius:3px;padding:5px;font:10px monospace;";
  structureClimbRollLabel.appendChild(structureClimbRoll);
  const structureClimbModLabel = document.createElement("label");
  structureClimbModLabel.textContent = "ATH";
  structureClimbModLabel.style.cssText = structureClimbRollLabel.style.cssText;
  const structureClimbMod = document.createElement("input");
  structureClimbMod.type = "number";
  structureClimbMod.value = String(CLAY_STRUCTURE_KIT_CATALOG.climbLaw.defaultAthleticsModifier);
  structureClimbMod.setAttribute("aria-label", "Clayroom climb Athletics modifier");
  structureClimbMod.style.cssText = structureClimbRoll.style.cssText;
  structureClimbModLabel.appendChild(structureClimbMod);
  const structureClimbAttempt = document.createElement("button");
  structureClimbAttempt.textContent = "RESOLVE CLIMB";
  structureClimbAttempt.style.cssText = "font:9px monospace;background:#5c4724;color:#fff1c8;border:1px solid #8a6a31;border-radius:3px;padding:6px 4px;cursor:pointer;";
  structureClimbControls.append(structureClimbRollLabel, structureClimbModLabel, structureClimbAttempt);
  const structureClimbResult = document.createElement("div");
  structureClimbResult.style.cssText = "color:#8fa0b0;font:9px/1.4 monospace;margin-top:6px;";
  const structureClimbReset = document.createElement("button");
  structureClimbReset.textContent = "RESET CLIMBER";
  structureClimbReset.style.cssText = "margin-top:6px;font:8px monospace;background:#252a32;color:#aebdcb;border:1px solid #404b57;border-radius:3px;padding:4px 7px;cursor:pointer;";
  structureClimbCard.append(
    structureClimbTitle,
    structureClimbTarget,
    structureClimbControls,
    structureClimbResult,
    structureClimbReset
  );
  structureBody.appendChild(structureClimbCard);
  structureClimbAttempt.addEventListener("click", function(){
    clayRoomStructureClimbAttempt(
      Number(structureClimbRoll.value),
      Number(structureClimbMod.value)
    );
  });
  structureClimbReset.addEventListener("click", clayRoomStructureClimbReset);
  const structureEngineering = document.createElement("details");
  structureEngineering.style.cssText = "margin-top:8px;color:#9ba8b6;";
  const structureEngineeringSummary = document.createElement("summary");
  structureEngineeringSummary.textContent = "Engineering receipt";
  structureEngineeringSummary.style.cssText = "cursor:pointer;font:9px monospace;";
  structureEngineering.appendChild(structureEngineeringSummary);
  const structureOut = document.createElement("pre");
  structureOut.id = "clay-room-structure-readout";
  structureOut.style.cssText = "white-space:pre-wrap;color:#cdd7e1;border-top:1px solid #333;padding-top:6px;margin:6px 0 0;font:9px/1.45 monospace;";
  structureEngineering.appendChild(structureOut);
  structureBody.appendChild(structureEngineering);
  function clayStructureRender(){
    const snap = window.Theater._clayStructureBenchForTest();
    Object.keys(structureViewButtons).forEach(function(view){
      structureViewButtons[view].style.background = snap && snap.view === view ? "#35516a" : "#2a2a30";
    });
    if(!snap){
      structureLegend.textContent = "Switch to the Structure fixture to mount CL-F01.";
      structureSummaryCard.textContent = "No structure fixture mounted.";
      structureClimbTarget.textContent = "No structure fixture mounted.";
      structureClimbResult.textContent = "";
      structureClimbAttempt.disabled = true;
      structureOut.textContent = "Switch to the Structure fixture to mount CL-F01.";
      return;
    }
    const climb = clayRoomStructureClimbSnapshot();
    structureClimbAttempt.disabled = !climb || !climb.target || climb.busy;
    structureClimbAttempt.style.opacity = structureClimbAttempt.disabled ? "0.5" : "1";
    structureClimbTarget.textContent = climb && climb.target
      ? climb.target.label + " · Athletics DC " + climb.target.climbDC + " · click another wall/column to retarget"
      : "Click a wall, square column, or round column in the 3D view.";
    if(climb && climb.last && climb.last.ok){
      structureClimbResult.textContent =
        "d20 " + climb.last.d20 + " + " + climb.last.modifier + " = " + climb.last.total +
        " vs DC " + climb.last.dc + " · " + climb.last.outcome.toUpperCase() +
        (climb.last.damage !== "none" ? " · " + climb.last.damage + " fall damage" : "") +
        (climb.last.balanceRequired ? " · balance still required on top" : "");
      structureClimbResult.style.color = climb.last.passed ? "#78dda4" : "#ff8f85";
    } else {
      structureClimbResult.textContent = climb && climb.busy
        ? "Resolving " + climb.phase + "…"
        : "Success perches the human witness; failure visibly returns them to the floor.";
      structureClimbResult.style.color = "#8fa0b0";
    }
    const selectedSpec = snap.specimens.find(function(row){ return row.id === S.clayRoomSelectedId; })
      || snap.specimens.find(function(row){ return row.id === "straight-wall"; })
      || snap.specimens[0];
    if(selectedSpec){
      structurePieceSelect.value = selectedSpec.id;
    }
    const selectedFixtureSpec = structureFixture.pieces.find(function(row){
      return selectedSpec && row.id === selectedSpec.id;
    });
    const socketList = selectedSpec
      ? selectedSpec.sockets.map(function(socket){ return clayStructureSocketLabel(socket); }).join(" · ")
      : "—";
    const accessList = selectedSpec
      ? Object.keys(selectedSpec.access).map(function(face){
          return face + " = " + selectedSpec.access[face];
        }).join(" · ")
      : "—";
    const legendByView = {
      assembled:
        "<strong style='color:#dce7f1'>ASSEMBLED</strong><br>" +
        "Clay geometry only. Darker base masses are foundations; proud blocks close endpoints and corners.",
      stairs:
        "<strong style='color:#dce7f1'>STOREY STAIR PROOFS</strong><br>" +
        "Straight = two 5×5 flights. L = lower flight + turning landing + upper flight. Both reach occupied 10 ft decks.",
      sockets:
        "<strong style='color:#dce7f1'>SOCKET KEY · selected piece only</strong><br>" +
        "<span style='color:#35d8ff'>cyan butt</span> · <span style='color:#66dfa0'>green walk</span> · " +
        "<span style='color:#6f8fff'>blue top</span> · <span style='color:#c08a5a'>brown terrain</span> · " +
        "<span style='color:#ff7ad8'>pink hinge</span> · <span style='color:#b9c2cc'>grey mount</span>",
      access:
        "<strong style='color:#dce7f1'>ACCESS KEY · selected piece only</strong><br>" +
        "<span style='color:#66dfa0'>green walk</span> · <span style='color:#f3bd55'>amber climb cost</span> · " +
        "<span style='color:#ff6d68'>red climb/check</span> · <span style='color:#8a9099'>grey none</span>",
      climb:
        "<strong style='color:#dce7f1'>CLIMB TEST · selected target only</strong><br>" +
        "Clean geometry view. Click a wall or column, enter the open d20 below, and resolve.",
      negative:
        "<strong style='color:#dce7f1'>BAD JOIN</strong><br>Red X = rejected axis pairing. The physical gap remains visible.",
      strategic:
        "<strong style='color:#dce7f1'>ALL WALLS</strong><br>Strategic camera rebuilds every upper; foundations remain continuous to datum."
    };
    structureLegend.innerHTML = legendByView[snap.view] || legendByView.assembled;
    if(snap.view === "sockets"){
      structureSummaryCard.innerHTML =
        "<strong>" + selectedFixtureSpec.label + "</strong><br><span style='color:#9fb0c0'>" + socketList + "</span>";
    } else if(snap.view === "access"){
      const entryText = selectedSpec.entry
        ? "<br><span style='color:#9fb0c0'>Normal: " + selectedSpec.entry.normal +
          " · Small: " + selectedSpec.entry.small + "</span>"
        : "";
      structureSummaryCard.innerHTML =
        "<strong>" + selectedFixtureSpec.label + "</strong><br><span style='color:#9fb0c0'>" +
        accessList + "</span>" + entryText;
    } else if(snap.view === "negative"){
      structureSummaryCard.innerHTML =
        "<strong>Join rejected</strong><br><span style='color:#9fb0c0'>" +
        snap.negativeControl.reason + " · geometry was not snapped</span>";
    } else {
      structureSummaryCard.innerHTML =
        "<strong>Continuity candidate</strong><br><span style='color:#9fb0c0'>" +
        snap.shell.polygonKernel.toUpperCase() + " corners · " +
        snap.connectiveTissue.foundationRuns + " foundation runs · " +
        snap.connectiveTissue.wallJunctions + " full-height wall junctions · two 5×5 units reach the 10 ft floor</span>";
    }
    structureStageButtons.staged.style.background = snap.wallOmission.staged ? "#35543b" : "#252a32";
    structureStageButtons.sealed.style.background = snap.wallOmission.staged ? "#252a32" : "#684a28";
    structureStageButtons.shut.style.background = snap.wallOmission.doorState === "shut" ? "#35516a" : "#252a32";
    structureStageButtons.open.style.background = snap.wallOmission.doorState === "open" ? "#35516a" : "#252a32";
    const lines = [
      "fixture " + snap.fixtureId + " v" + snap.fixtureVersion + " · catalog " + snap.catalogId + " v" + snap.catalogVersion,
      "GRID 1 cell = " + snap.gridLaw.cellFeet + " ft · h = " + snap.gridLaw.verticalQuantumFeet
        + " ft · storey = " + snap.gridLaw.storeyFeet + " ft",
      "SHELL " + snap.shell.meta.floorCellCount + " cells · " + snap.shell.wallSegments + " wall runs · "
        + snap.shell.riserSegments + " retaining/riser runs",
      "      " + snap.shell.polygonKernel.toUpperCase() + " kernel · tiers " + snap.shell.tiers.join("/")
        + " · slab sides " + (snap.shell.exposedSlabSides ? "PASS" : "FAIL")
        + " · omitted near uppers " + snap.shell.omittedUpperSegments,
      "FOUNDATION " + snap.connectiveTissue.foundationRuns + " runs · "
        + snap.connectiveTissue.foundationCorners + " corner blocks · contact embed "
        + snap.connectiveTissue.contactEmbed + " u",
      "JUNCTIONS " + snap.connectiveTissue.wallJunctions + " full-height corner quoins · "
        + snap.connectiveTissue.cutawayReturns + " cutaway returns · "
        + snap.connectiveTissue.connectorProfile,
      "STAIRS 5×5 adapter · examples "
        + snap.stairAdapter.examples.map(function(row){ return row.riseFeet + " ft"; }).join("/")
        + " · INNER " + snap.stairAdapter.cornerTopologies[0].topology
        + " · OUTER " + snap.stairAdapter.cornerTopologies[1].topology,
      "STOREY " + snap.stairAdapter.fullStoreyProof.stairUnits + " stair units → "
        + snap.stairAdapter.fullStoreyProof.riseFeet + " ft occupied deck · "
        + (snap.stairAdapter.fullStoreyProof.connected ? "CONNECTED" : "FAIL"),
      "L STOREY " + snap.stairAdapter.lStoreyProof.footprintCells + " cells · "
        + snap.stairAdapter.lStoreyProof.turnDeg + "° turn → "
        + snap.stairAdapter.lStoreyProof.riseFeet + " ft occupied deck · "
        + (snap.stairAdapter.lStoreyProof.connected ? "CONNECTED" : "FAIL"),
      "OMISSION " + (snap.wallOmission.active
        ? snap.wallOmission.retainedStubFeet + " FT STUB"
        : "ALL UPPERS") + " · staged "
        + (snap.wallOmission.staged ? "YES" : "NO") + " · latched "
        + (snap.wallOmission.latched ? "YES" : "NO") + " · door " + snap.wallOmission.doorState,
      "         camera " + snap.wallOmission.cameraMode + " · aperture "
        + (snap.wallOmission.apertureUpperBuilt ? "KEPT" : "FAIL") + " · riser mass "
        + (snap.wallOmission.structuralMassBuilt ? "KEPT" : "FAIL"),
      "OPENING aperture " + snap.shell.apertures + " · frame/threshold/hinge leaf · "
        + snap.opening.swingClearanceDeg + "° clearance",
      "RAMP " + snap.slope.degrees + "° ≤ " + snap.slope.maxDegrees + "° · " + (snap.slope.walkable ? "WALK" : "FAIL"),
      "SOCKETS " + CLAY_STRUCTURE_KIT_CATALOG.socketTypes.length + " named families · "
        + snap.specimens.reduce(function(n, row){ return n + row.sockets.length; }, 0) + " mounted specimen sockets",
      "ACCESS walk / climb-cost / climb-dc / none · mechanics "
        + (snap.climbMechanicsImplemented ? "IMPLEMENTED" : "NOT CLAIMED"),
      "BAD JOIN " + (snap.negativeControl.accepted ? "WRONG PASS" : "REJECTED") + " · "
        + snap.negativeControl.reason + " · visible gap " + (snap.negativeControl.visibleGap ? "YES" : "NO"),
      "CUTAWAY camera-side omission " + (snap.cameraSideOmission && snap.cameraSideOmission.active ? "ACTIVE" : "OFF")
        + " · dynamic classifier " + snap.dynamicCutaway.candidates + " candidates / "
        + snap.dynamicCutaway.blocking + " blocking / " + snap.dynamicCutaway.faded + " faded",
      "MESHES " + snap.mountedMeshes + " · shadow casters " + snap.shadowCasters + " · receivers " + snap.shadowReceivers,
      "SHADOW CONTACT " + snap.shadowContact.rendererFilter.toUpperCase() + " · front-face solid casters "
        + snap.shadowContact.frontFaceShadowCasters + " · automatic " + snap.shadowContact.automaticShadowCasters,
      "PROVENANCE " + snap.provenance.author + " · " + snap.provenance.source
    ];
    structureOut.textContent = lines.join("\n");
  }
  S.clayRoomRefreshStructure = clayStructureRender;

  // CL-R1 Lights tab — reads and controls the real production fixture targets. No demonstration
  // meshes/lights are mounted here; every value comes from the live PointLight + emitter material.
  const lightsBody = document.createElement("div");
  lightsBody.style.cssText = "display:none;font:10px/1.45 monospace;color:#dde;";
  const fixtureActions = document.createElement("div");
  fixtureActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:7px;";
  const fixtureButtons = {};
  [
    [CLAY_ROOM_TRUTH_FIXTURE_ID, "ROOM TRUTH"],
    [CLAY_ROOM_STRUCTURE_BENCH_ID, "STRUCTURE BENCH"],
    [CLAY_ROOM_LIGHTING_BENCH_ID, "LIGHTING BENCH"],
    [CLAY_ROOM_SPRITE_BENCH_ID, "SPRITE BENCH"],
    [CLAY_ROOM_MATERIAL_BENCH_ID, "MATERIAL BENCH"],
    [CLAY_ROOM_TRIM_BENCH_ID, "TRIM BENCH"],
    [CLAY_ROOM_TERRAIN_BENCH_ID, "TERRAIN BENCH"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Use " + def[0] + " Clayroom fixture");
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
    button.addEventListener("click", function(){ clayRoomSetFixture(def[0], "clayroom-fixture-button"); });
    fixtureActions.appendChild(button);
    fixtureButtons[def[0]] = button;
  });
  lightsBody.appendChild(fixtureActions);
  const lightsIntro = document.createElement("div");
  lightsIntro.textContent = "CL-F02: neutral stairs + matte sphere/cube + real sprite, through the production renderer";
  lightsIntro.style.cssText = "color:#9ab;margin-bottom:6px;";
  lightsBody.appendChild(lightsIntro);
  const lightingModeActions = document.createElement("div");
  lightingModeActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  const lightingModeButtons = {};
  [
    ["clay-neutral-truth", "NEUTRAL"],
    ["clay-opposing-pair", "WARM / COOL"],
    ["torchlit", "FANTASY TORCH"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Use " + def[0] + " lighting recipe");
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
    button.addEventListener("click", function(){ clayRoomSetLightingRecipe(def[0], "clayroom-mode-button"); });
    lightingModeActions.appendChild(button);
    lightingModeButtons[def[0]] = button;
  });
  lightsBody.appendChild(lightingModeActions);
  const lorePreviewLabel = document.createElement("div");
  lorePreviewLabel.textContent = "LORE-NATIVE PREVIEWS · existing renderer recipes";
  lorePreviewLabel.style.cssText = "color:#8fb7a1;margin:8px 0 4px;";
  lightsBody.appendChild(lorePreviewLabel);
  const lorePreviewActions = document.createElement("div");
  lorePreviewActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  CLAY_ROOM_LORE_LIGHT_PREVIEWS.forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def.label;
    button.title = def.source + " · shared authored recipe " + def.id;
    button.setAttribute("aria-label", "Preview lore-native " + def.source + " recipe");
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #44534b;border-radius:3px;cursor:pointer;padding:5px;";
    button.addEventListener("click", function(){
      clayRoomSetLightingRecipe(def.id, "clayroom-lore-preview");
    });
    lorePreviewActions.appendChild(button);
    lightingModeButtons[def.id] = button;
  });
  lightsBody.appendChild(lorePreviewActions);

  const moodLayerLabel = document.createElement("div");
  moodLayerLabel.textContent = "ROOM MOOD · layered over the source · never a shadow caster";
  moodLayerLabel.style.cssText = "color:#b8a0d0;margin:8px 0 4px;";
  lightsBody.appendChild(moodLayerLabel);
  const moodLayerActions = document.createElement("div");
  moodLayerActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:7px;";
  const moodLayerButtons = {};
  CLAY_ROOM_MOOD_EXAMPLES.forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def.label;
    button.setAttribute("aria-label", "Layer Clayroom mood " + def.id + " over the current source");
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #554966;border-radius:3px;cursor:pointer;padding:5px;";
    button.addEventListener("click", function(){
      clayRoomSetMoodLayer(def.id, "clayroom-mood-button");
    });
    moodLayerActions.appendChild(button);
    moodLayerButtons[def.id] = button;
  });
  lightsBody.appendChild(moodLayerActions);

  const seedLabel = document.createElement("div");
  seedLabel.textContent = "ANIMATION SEED PREVIEW · physical values stay locked";
  seedLabel.style.cssText = "color:#9ab;margin:5px 0 4px;";
  lightsBody.appendChild(seedLabel);
  const seedActions = document.createElement("div");
  seedActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  const seedButtons = {};
  CLAY_ROOM_LIGHT_PREVIEW_SEEDS.forEach(function(seed){
    const button = document.createElement("button");
    button.textContent = "SEED " + seed;
    button.setAttribute("aria-label", "Use Clayroom animation preview seed " + seed);
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    button.addEventListener("click", function(){
      S.clayRoomPreviewSeed = seed;
      S.clayRoomPixelMetricsCache = null;
      clayRoomSetLightingRecipe(S.clayRoomLightRecipeId || "torchlit", "clayroom-seed-preview");
    });
    seedActions.appendChild(button);
    seedButtons[seed] = button;
  });
  lightsBody.appendChild(seedActions);

  const overlayActions = document.createElement("div");
  overlayActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  const overlayButtons = {};
  [
    ["position", "POSITION"],
    ["range", "RANGE"],
    ["shadow", "SHADOW VOLUME"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Toggle " + def[0] + " light overlay");
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
    button.addEventListener("click", function(){
      S.clayRoomLightOverlayModes = S.clayRoomLightOverlayModes || { position: false, range: false, shadow: false };
      S.clayRoomLightOverlayModes[def[0]] = !S.clayRoomLightOverlayModes[def[0]];
      clayRoomBuildLightOverlays();
      if(S.clayRoomRefreshFixtureControls) S.clayRoomRefreshFixtureControls();
      markDirty();
    });
    overlayActions.appendChild(button);
    overlayButtons[def[0]] = button;
  });
  lightsBody.appendChild(overlayActions);
  // Checkpoint 1 — the bounded ENVIRONMENT AO diagnostic A/B. One ON/OFF comparison control
  // (the same pass-enabled seam the harness uses), deliberately not a strength/radius slider:
  // the AO settings are authored constants, reviewed like any other visual law.
  const envAOActions = document.createElement("div");
  envAOActions.style.cssText = "display:grid;grid-template-columns:1fr;gap:4px;margin-bottom:7px;";
  const envAOButton = document.createElement("button");
  envAOButton.setAttribute("aria-label", "Toggle environment ambient occlusion A/B");
  envAOButton.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
  const envAOSync = function(){
    const ao = S.postSuite && S.postSuite.ao;
    const on = !!(ao && ao.enabled);
    envAOButton.textContent = "ENV AO " + (on ? "ON" : "OFF") + " · A/B";
    envAOButton.style.background = on ? "#35516a" : "#2a2a30";
  };
  envAOButton.addEventListener("click", function(){
    const ao = S.postSuite && S.postSuite.ao;
    if(!ao) return;
    ao.enabled = !ao.enabled;
    envAOSync();
    markDirty();
  });
  envAOActions.appendChild(envAOButton);
  envAOSync();
  S.clayRoomEnvAOSyncButton = envAOSync;
  lightsBody.appendChild(envAOActions);
  const lightsActions = document.createElement("div");
  lightsActions.style.cssText = "display:flex;gap:5px;margin-bottom:7px;";
  const restoreLightsBtn = document.createElement("button");
  restoreLightsBtn.textContent = "authored baseline";
  restoreLightsBtn.setAttribute("aria-label", "Restore authored lighting baseline");
  const rebuildLightsBtn = document.createElement("button");
  rebuildLightsBtn.textContent = "rebuild/fade proof";
  rebuildLightsBtn.setAttribute("aria-label", "Run Clayroom board rebuild lighting proof");
  const refreshPixelsBtn = document.createElement("button");
  refreshPixelsBtn.textContent = "refresh pixels";
  refreshPixelsBtn.setAttribute("aria-label", "Refresh Clayroom final pixel measurements");
  [restoreLightsBtn, rebuildLightsBtn, refreshPixelsBtn].forEach(function(b){
    b.style.cssText = "flex:1;font:10px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    lightsActions.appendChild(b);
  });
  lightsBody.appendChild(lightsActions);

  const comparisonLabel = document.createElement("div");
  comparisonLabel.textContent = "SOURCE ART ↔ LIVE RENDER";
  comparisonLabel.style.cssText = "color:#9ab;border-top:1px solid #333;padding-top:7px;margin-top:7px;";
  lightsBody.appendChild(comparisonLabel);
  const comparisonCards = document.createElement("div");
  comparisonCards.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:5px 0 3px;";
  function comparisonCard(label){
    const card = document.createElement("div");
    card.style.cssText = "border:1px solid #303740;background:#111419;padding:4px;";
    const heading = document.createElement("div");
    heading.textContent = label;
    heading.style.cssText = "color:#aeb9c5;margin-bottom:3px;";
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 170;
    canvas.style.cssText = "display:block;width:100%;height:100px;background:#090a0d;image-rendering:pixelated;";
    card.appendChild(heading);
    card.appendChild(canvas);
    comparisonCards.appendChild(card);
    return canvas;
  }
  const sourceSpriteCanvas = comparisonCard("AUTHORED PNG");
  const renderedSpriteCanvas = comparisonCard("FINAL PIXELS");
  lightsBody.appendChild(comparisonCards);
  const sourceSpriteStatus = document.createElement("div");
  sourceSpriteStatus.style.cssText = "color:#768697;font:9px/1.35 monospace;margin-bottom:6px;overflow-wrap:anywhere;";
  sourceSpriteStatus.textContent = "loading authored source…";
  lightsBody.appendChild(sourceSpriteStatus);
  S.clayRoomRenderedSpriteCanvas = renderedSpriteCanvas;
  clayRoomMountSourceSpriteCard(sourceSpriteCanvas, sourceSpriteStatus);

  const pixelReadout = document.createElement("pre");
  pixelReadout.id = "clay-room-pixel-readout";
  pixelReadout.style.cssText = "white-space:pre-wrap;color:#bfd0df;border:1px solid #303740;background:#111419;padding:6px;margin:5px 0 7px;";
  pixelReadout.textContent = "reading final display pixels…";
  lightsBody.appendChild(pixelReadout);

  const matrixButton = document.createElement("button");
  matrixButton.textContent = "BUILD COMPLETE 7-LIGHT SHEET";
  matrixButton.setAttribute("aria-label", "Capture the complete Clayroom lighting comparison sheet");
  matrixButton.style.cssText = "width:100%;font:10px monospace;background:#283a34;color:#def4e7;border:1px solid #4b6d5d;border-radius:3px;cursor:pointer;padding:6px;";
  matrixButton.addEventListener("click", async function(){
    matrixButton.disabled = true;
    try {
      await clayRoomCaptureLightingMatrix();
    } catch(error) {
      try { console.warn("qa: Clayroom lighting matrix capture failed", error); } catch(e){}
    } finally {
      matrixButton.disabled = false;
    }
  });
  lightsBody.appendChild(matrixButton);
  const matrixStatus = document.createElement("div");
  matrixStatus.style.cssText = "color:#7f9488;margin:3px 0 7px;";
  matrixStatus.textContent = "one click · neutral + diagnostic + sun/moon/magic/fire/lava";
  lightsBody.appendChild(matrixStatus);
  S.clayRoomMatrixStatusEl = matrixStatus;

  const lightStateButtons = {};
  const lightRows = document.createElement("div");
  lightsBody.appendChild(lightRows);
  let lightRowsKey = "";
  function clayLightsBuildRows(){
    const nextKey = (S.interiorLightTargets || []).map(function(target){ return target.id; }).join("|");
    if(nextKey === lightRowsKey) return;
    lightRowsKey = nextKey;
    lightRows.innerHTML = "";
    Object.keys(lightStateButtons).forEach(function(key){ delete lightStateButtons[key]; });
    (S.interiorLightTargets || []).forEach(function(target){
    const row = document.createElement("div");
    row.style.cssText = "display:grid;grid-template-columns:1fr auto auto;gap:5px;align-items:center;margin:4px 0;";
    const label = document.createElement("span");
    label.textContent = target.id;
    label.style.cssText = "color:#cd9;";
    const steady = document.createElement("button");
    steady.textContent = "steady";
    steady.setAttribute("aria-label", "Set " + target.id + " steady");
    const flicker = document.createElement("button");
    flicker.textContent = "flicker";
    flicker.setAttribute("aria-label", "Set " + target.id + " flickering");
    [steady, flicker].forEach(function(b){
      b.style.cssText = "font:10px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:2px 5px;";
    });
    steady.addEventListener("click", function(){ clayRoomSetLightState(target.id, "steady"); clayLightsRender(); });
    flicker.addEventListener("click", function(){ clayRoomSetLightState(target.id, "flickering"); clayLightsRender(); });
    row.appendChild(label); row.appendChild(steady); row.appendChild(flicker);
    lightRows.appendChild(row);
    lightStateButtons[target.id] = { steady: steady, flicker: flicker };
    });
  }
  const lightsOut = document.createElement("pre");
  lightsOut.id = "clay-room-lighting-readout";
  lightsOut.style.cssText = "white-space:pre-wrap;color:#dde;border-top:1px solid #333;padding-top:6px;margin:6px 0 0;";
  lightsBody.appendChild(lightsOut);
  function clayLightsRender(){
    clayLightsBuildRows();
    const snap = clayRoomLightingSnapshot("panel");
    const activeRecipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId]
      || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
    const authoredRecipe = LIGHT_LAB_AUTHORED_BASELINE.profiles[activeRecipe.id] || activeRecipe;
    const activeProfile = lightRecipeLegacyProfile(authoredRecipe);
    const recipeIsAuthored = JSON.stringify(activeRecipe) === JSON.stringify(authoredRecipe);
    const baselineActive = !!(snap.ambient
      && recipeIsAuthored
      && snap.ambient.intensity === activeProfile.ambient.intensity
      && snap.ambient.color === activeProfile.ambient.color
      && snap.lights.length === activeProfile.points.length
      && snap.lights.every(function(l){
        const authoredLight = activeProfile.points.find(function(point){ return point.id === l.id; });
        if(!authoredLight || l.state !== authoredLight.state) return false;
        // markerless environmental rows have no emitter mesh to hold parity against
        const meshOk = l.emitterUuid ? (l.parity && l.meshNormalized === 1) : true;
        return l.state === "flickering" || (l.emittedNormalized === 1 && meshOk);
      }));
    const flickering = snap.lights.filter(function(l){ return l.state === "flickering"; });
    const steady = snap.lights.filter(function(l){ return l.state === "steady"; });
    const isolationPass = flickering.length === 1
      && steady.every(function(l){ return l.emittedNormalized === 1 && l.meshNormalized === 1 && l.parity; });
    const mood = clayRoomMoodSnapshot();
    const lines = [
      "fixture " + (S.clayRoomFixtureId || "—")
        + (S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
          ? " · 3 steps + matte cube/sphere + approved sprite"
          : (S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID
            ? " · 7-sprite scale spectrum + stair fit"
            : " · architecture/movement truth")),
      "recipe " + activeRecipe.id + " · " + activeRecipe.mode,
      "source " + activeRecipe.source.label
        + (activeRecipe.source.loreNative ? " · LORE-NATIVE" : " · DIAGNOSTIC ONLY"),
      "room mood " + (mood ? mood.label : "—") + " · pair " + (mood ? mood.pairId : "—"),
      "mood energy " + (mood ? mood.combinedMoodIntensity.toFixed(3) : "—")
        + " / " + (mood ? mood.energyCap.toFixed(3) : "—")
        + " · shadows " + (mood && mood.moodCastsShadow ? "FAIL" : "NONE")
        + " · source retained " + (mood && mood.sourceRetained ? "PASS" : "FAIL"),
      "authored baseline " + (baselineActive ? "PASS" : "inactive (restore available)"),
      "one-light isolation " + (flickering.length === 1 ? (isolationPass ? "PASS" : "FAIL") : "arm exactly one flicker"),
      "ambient " + (snap.ambient ? snap.ambient.intensity.toFixed(2) : "—")
        + " · rig hemi/key/fill/cam "
        + ["hemi", "key", "fill", "cameraKey"].map(function(k){
          return snap.rig[k] ? snap.rig[k].intensity.toFixed(3) : "—";
        }).join("/"),
      ""
    ];
    snap.lights.forEach(function(l){
      // Checkpoint 2 READOUT TRUTH: every line below is the LIVE mounted object, never the
      // authored recipe — environmental rows (sun/moon; markerless, no distance) print their own
      // shape instead of crashing the practical-shaped formatter.
      const sample = l.normalizedSample == null ? "—" : l.normalizedSample.toFixed(6);
      lines.push(l.id + " [" + l.state + "] sample " + sample);
      lines.push("  emitted " + (l.emitted == null ? "—" : l.emitted.toFixed(6))
        + "/" + (l.emittedBase == null ? "—" : l.emittedBase.toFixed(6))
        + (l.emittedNormalized == null ? "" : " = " + l.emittedNormalized.toFixed(6)));
      if(l.mesh != null){
        lines.push("  mesh    " + l.mesh.toFixed(6) + "/" + l.meshBase.toFixed(6)
          + " = " + l.meshNormalized.toFixed(6) + " · parity " + (l.parity ? "PASS" : "FAIL"));
      }
      lines.push("  " + (l.distance != null
          ? "range " + l.distance.toFixed(2) + " · decay " + (l.decay == null ? "—" : l.decay.toFixed(2))
          : "directional (no falloff)")
        + " · shadows " + (l.castShadow ? "ON" : "OFF"));
      if(l.pointPosition){
        lines.push("  mounted pos " + l.pointPosition.map(function(v){ return v.toFixed(2); }).join("/"));
      }
      if(l.celestial){
        const hh = Math.floor(l.celestial.clockMin / 60), mm = Math.round(l.celestial.clockMin % 60);
        lines.push("  clock " + (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm
          + " · arc dir " + [l.celestial.derivedDir.x, l.celestial.derivedDir.y, l.celestial.derivedDir.z]
            .map(function(v){ return v.toFixed(2); }).join("/")
          + " · arc ×" + l.celestial.intensityScale.toFixed(3));
      }
      if(l.emitterUuid){
        lines.push("  dance Δ "
          + [l.directionSample.x, l.directionSample.y, l.directionSample.z]
            .map(function(value){ return value.toFixed(3); }).join("/")
          + " · co-located " + (l.coLocated && l.directionWithinBounds ? "PASS" : "FAIL"));
        lines.push("  interval last/next "
          + (l.lastIntervalMs == null ? "—" : l.lastIntervalMs.toFixed(0))
          + "/" + (l.nextIntervalMs == null ? "—" : l.nextIntervalMs.toFixed(0)) + " ms");
      }
      lines.push("  ids point " + String(l.pointUuid).slice(0, 8)
        + " · material " + String(l.materialUuid).slice(0, 8));
      const buttons = lightStateButtons[l.id];
      if(buttons){
        buttons.steady.style.background = l.state === "steady" ? "#35543b" : "#2a2a30";
        buttons.flicker.style.background = l.state === "flickering" ? "#684a28" : "#2a2a30";
      }
    });
    const probe = S.clayRoomLightingProbe;
    lines.push("");
    if(!probe){
      lines.push("animation guard: not run");
    } else if(probe.expectedReplacement){
      lines.push("animation guard: " + probe.label);
      lines.push("  lighting identity replacement EXPECTED · next geometry-only rebuild must preserve it");
    } else {
      lines.push("animation guard: " + probe.label);
      lines.push("  object/material preservation " + (probe.preserved ? "PASS" : "FAIL"));
      lines.push("  before → during " + (probe.duringPass ? "PASS" : "FAIL"));
      lines.push("  before → after " + (probe.afterPass == null ? "pending…" : (probe.afterPass ? "PASS" : "FAIL")));
    }
    Object.keys(lightingModeButtons).forEach(function(id){
      lightingModeButtons[id].style.background = id === activeRecipe.id ? "#35516a" : "#2a2a30";
    });
    Object.keys(moodLayerButtons).forEach(function(id){
      moodLayerButtons[id].style.background = id === S.clayRoomMoodLayerId ? "#503e66" : "#2a2a30";
    });
    Object.keys(seedButtons).forEach(function(seed){
      seedButtons[seed].style.background = seed === (S.clayRoomPreviewSeed || "A") ? "#4b3f61" : "#2a2a30";
    });
    const pixel = clayRoomLightingPixelMetrics(false);
    if(!pixel){
      pixelReadout.textContent = "FINAL PIXEL MEASUREMENTS\nlighting bench required";
    } else {
      const fmt = function(value){ return value == null ? "—" : Number(value).toFixed(2); };
      const frame = pixel.frame || {};
      const sprite = pixel.sprite || {};
      const source = pixel.sourceSprite && pixel.sourceSprite.metrics
        ? pixel.sourceSprite.metrics : null;
      pixelReadout.textContent = [
        "FINAL PIXEL MEASUREMENTS · no recipe-value guesses",
        "frame brightness  median " + fmt(frame.medianLuma) + "/255 · p95 " + fmt(frame.p95Luma) + "/255",
        "frame clipping    white " + fmt(frame.clippedHighlightPct) + "% · black " + fmt(frame.crushedShadowPct) + "%",
        "frame colour      chroma spread " + fmt(frame.meanChromaSpread) + "/255",
        "",
        "goblin screen box median " + fmt(sprite.medianLuma) + "/255 · p95 " + fmt(sprite.p95Luma) + "/255",
        "goblin clipping   white " + fmt(sprite.clippedHighlightPct) + "% · black " + fmt(sprite.crushedShadowPct) + "%",
        "goblin colour     chroma spread " + fmt(sprite.meanChromaSpread) + "/255",
        "readability       luma Δ " + fmt(pixel.readability && pixel.readability.lumaDelta)
          + " · colour Δ " + fmt(pixel.readability && pixel.readability.chromaDelta)
          + " vs nearby background",
        "",
        source
          ? "authored PNG      median " + fmt(source.medianLuma) + "/255 · colour " + fmt(source.meanChromaSpread) + "/255 · clipped " + fmt(source.clippedHighlightPct) + "%"
          : "authored PNG      measuring opaque source pixels…",
        "measurement only · no taste threshold silently applied"
      ].join("\n");
    }
    lightsOut.textContent = lines.join("\n");
  }
  function clayRefreshFixtureControls(){
    Object.keys(fixtureButtons).forEach(function(id){
      fixtureButtons[id].style.background = id === S.clayRoomFixtureId ? "#35516a" : "#2a2a30";
    });
    const modes = S.clayRoomLightOverlayModes || {};
    Object.keys(overlayButtons).forEach(function(id){
      overlayButtons[id].style.background = modes[id] ? "#5b4728" : "#2a2a30";
      overlayButtons[id].style.opacity = S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID ? "1" : "0.45";
      overlayButtons[id].disabled = S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID;
    });
    const roomTruth = S.clayRoomFixtureId === CLAY_ROOM_TRUTH_FIXTURE_ID;
    const structureBench = S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID;
    document.querySelectorAll("[data-clay-room-truth-only]").forEach(function(button){
      const status = button.querySelector("[data-clay-light-status]");
      if(status){
        status.textContent = roomTruth ? "MOUNTED" : "ROOM ONLY";
        button.disabled = !roomTruth;
        button.style.opacity = roomTruth ? "1" : "0.48";
      } else {
        button.style.display = roomTruth ? "block" : "none";
      }
    });
    document.querySelectorAll("[data-clay-structure-only]").forEach(function(button){
      button.style.display = structureBench ? "block" : "none";
      button.disabled = !structureBench;
    });
    document.querySelectorAll("[data-clay-sprite-catalog]").forEach(function(button){
      const mounted = roomTruth || S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID;
      const status = button.querySelector("[data-clay-light-status]");
      if(status) status.textContent = mounted ? "MOUNTED" : "NOT IN FIXTURE";
      button.disabled = !mounted;
      button.style.opacity = mounted ? "1" : "0.42";
      if(!status) button.style.display = mounted ? "block" : "none";
    });
    clayRoomRefreshTerrainTurnControl();
  }
  S.clayRoomRefreshFixtureControls = clayRefreshFixtureControls;
  restoreLightsBtn.addEventListener("click", function(){
    clayRoomRestoreAuthoredLightBaseline();
    clayLightsRender();
  });
  rebuildLightsBtn.addEventListener("click", function(){
    if(!S.lastBoard || S.lastBoard.kind !== "interior3d") return;
    S.boardKey = null;
    clayRoomSetInteriorBoard(S.lastBoard, { roomTransition: false, reason: "clayroom-lighting-proof" });
    clayLightsRender();
  });
  refreshPixelsBtn.addEventListener("click", function(){
    S.clayRoomPixelMetricsCache = null;
    clayRoomLightingPixelMetrics(true);
    clayLightsRender();
  });
  S.clayRoomRefreshLights = clayLightsRender;

  // CL-R2 Sprites tab — one live control surface for the production lineup, canonical-vs-cap A/B,
  // source alpha, face/edge view, stair fit, and the accepted lighting contexts. It reads the mounted
  // production groups through clayRoomSpriteCitizenshipSnapshot; no parallel sprite preview renderer.
  const spritesBody = document.createElement("div");
  spritesBody.style.cssText = "display:none;font:10px/1.4 monospace;color:#dde;";
  const spritesIntro = document.createElement("div");
  spritesIntro.innerHTML =
    "<div style='color:#9fd4ec;margin-bottom:4px'>CL-F03 · PHYSICAL CITIZENS, NOT PAPER</div>" +
    "<div style='color:#9ab'>Gold/cyan floor outlines are tactical footprints. The shallow rounded strip is only the visible standee support.</div>";
  spritesBody.appendChild(spritesIntro);

  const spriteFixtureNav = document.createElement("div");
  spriteFixtureNav.style.cssText = "display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:7px 0;";
  [
    [CLAY_ROOM_TRUTH_FIXTURE_ID, "ROOM"],
    [CLAY_ROOM_STRUCTURE_BENCH_ID, "STRUCTURE"],
    [CLAY_ROOM_LIGHTING_BENCH_ID, "LIGHTS"],
    [CLAY_ROOM_SPRITE_BENCH_ID, "SPRITES"],
    [CLAY_ROOM_MATERIAL_BENCH_ID, "MATERIAL"],
    [CLAY_ROOM_TRIM_BENCH_ID, "TRIM"],
    [CLAY_ROOM_TERRAIN_BENCH_ID, "TERRAIN"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px;cursor:pointer;";
    button.addEventListener("click", function(){
      clayRoomSetFixture(def[0], "clayroom-sprite-fixture-nav");
      if(def[0] === CLAY_ROOM_STRUCTURE_BENCH_ID) clayShowTab("structure");
      else if(def[0] === CLAY_ROOM_LIGHTING_BENCH_ID) clayShowTab("lights");
      else if(def[0] === CLAY_ROOM_MATERIAL_BENCH_ID) clayShowTab("materials");
      else if(def[0] === CLAY_ROOM_TRIM_BENCH_ID) clayShowTab("trim");
      else if(def[0] === CLAY_ROOM_TRUTH_FIXTURE_ID) clayShowTab("movement");
      else clayShowTab("sprites");
    });
    spriteFixtureNav.appendChild(button);
  });
  spritesBody.appendChild(spriteFixtureNav);

  const spriteScaleLabel = document.createElement("div");
  spriteScaleLabel.textContent = "SCALE SPECTRUM";
  spriteScaleLabel.style.cssText = "color:#aeb7c4;margin-top:7px;";
  spritesBody.appendChild(spriteScaleLabel);
  const spriteScaleActions = document.createElement("div");
  spriteScaleActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 0 7px;";
  const trueScaleBtn = document.createElement("button");
  trueScaleBtn.textContent = "TRUE SCALE CHECK";
  const capScaleBtn = document.createElement("button");
  capScaleBtn.textContent = "PRESENTATION · 1–30 FT";
  [trueScaleBtn, capScaleBtn].forEach(function(button){
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px;cursor:pointer;";
    spriteScaleActions.appendChild(button);
  });
  trueScaleBtn.addEventListener("click", function(){ clayRoomSetSpriteScaleMode("true-scale", "clayroom-sprite-ui"); });
  capScaleBtn.addEventListener("click", function(){ clayRoomSetSpriteScaleMode("diagnostic-cap", "clayroom-sprite-ui"); });
  spritesBody.appendChild(spriteScaleActions);

  const spriteCastLabel = document.createElement("div");
  spriteCastLabel.textContent = "LIVE CAST · click to inspect";
  spriteCastLabel.style.cssText = "color:#aeb7c4;";
  spritesBody.appendChild(spriteCastLabel);
  const spriteCastActions = document.createElement("div");
  spriteCastActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 0 7px;";
  const spriteCastButtons = {};
  const spriteFixture = clayRoomSpriteCitizenshipFixtureFrom(record);
  spriteFixture.cast.forEach(function(spec){
    const button = document.createElement("button");
    button.textContent = spec.label;
    button.title = spec.stress;
    button.style.cssText = "font:9px monospace;text-align:left;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetSelectedSprite(spec.slug); });
    spriteCastActions.appendChild(button);
    spriteCastButtons[spec.slug] = button;
  });
  spritesBody.appendChild(spriteCastActions);

  const spriteViewActions = document.createElement("div");
  spriteViewActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  const spriteViewButtons = {};
  [["face", "FACE"], ["angled", "3/4"], ["edge", "EDGE"]].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetSelectedSpriteView(def[0]); });
    spriteViewActions.appendChild(button);
    spriteViewButtons[def[0]] = button;
  });
  spritesBody.appendChild(spriteViewActions);

  const spriteLightLabel = document.createElement("div");
  spriteLightLabel.textContent = "LIGHT RESPONSE · shared production recipes";
  spriteLightLabel.style.cssText = "color:#aeb7c4;";
  spritesBody.appendChild(spriteLightLabel);
  const spriteLightActions = document.createElement("div");
  spriteLightActions.style.cssText = "display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin:4px 0 7px;";
  const spriteLightButtons = {};
  [
    ["clay-neutral-truth", "NEUTRAL"],
    ["moonlit", "DARK"],
    ["torchlit", "WARM"],
    ["magic-glow", "COOL"],
    ["daylit", "DAY"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.title = def[0];
    button.style.cssText = "font:8px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetLightingRecipe(def[0], "clayroom-sprite-light-context"); });
    spriteLightActions.appendChild(button);
    spriteLightButtons[def[0]] = button;
  });
  spritesBody.appendChild(spriteLightActions);

  const spriteSourceCard = document.createElement("div");
  spriteSourceCard.style.cssText = "display:grid;grid-template-columns:92px 1fr;gap:7px;align-items:center;border:1px solid #39404a;background:#181b20;padding:6px;margin-bottom:7px;";
  const spriteSourceImg = document.createElement("img");
  spriteSourceImg.alt = "Selected sprite source PNG";
  spriteSourceImg.style.cssText = "width:88px;height:88px;object-fit:contain;image-rendering:pixelated;background:repeating-conic-gradient(#252830 0 25%,#17191e 0 50%) 0/12px 12px;";
  const spriteSourceText = document.createElement("div");
  spriteSourceText.style.cssText = "color:#9ab;white-space:pre-wrap;";
  spriteSourceCard.appendChild(spriteSourceImg);
  spriteSourceCard.appendChild(spriteSourceText);
  spritesBody.appendChild(spriteSourceCard);

  const spritesOut = document.createElement("pre");
  spritesOut.id = "clay-room-sprite-readout";
  spritesOut.style.cssText = "white-space:pre-wrap;color:#dde;border-top:1px solid #333;padding-top:6px;margin:6px 0 0;";
  spritesBody.appendChild(spritesOut);

  function claySpritesRender(){
    const snap = clayRoomSpriteCitizenshipSnapshot();
    if(!snap){
      spritesOut.textContent = "sprite fixture unavailable";
      return;
    }
    trueScaleBtn.style.background = snap.scaleMode === "true-scale" ? "#35516a" : "#2a2a30";
    capScaleBtn.style.background = snap.scaleMode === "diagnostic-cap" ? "#684a28" : "#2a2a30";
    Object.keys(spriteCastButtons).forEach(function(slug){
      spriteCastButtons[slug].style.background = slug === snap.selectedSlug ? "#35516a" : "#2a2a30";
    });
    Object.keys(spriteViewButtons).forEach(function(view){
      spriteViewButtons[view].style.background = view === snap.selectedView ? "#4b3f61" : "#2a2a30";
    });
    Object.keys(spriteLightButtons).forEach(function(id){
      spriteLightButtons[id].style.background = id === S.clayRoomLightRecipeId ? "#35543b" : "#2a2a30";
    });
    const selected = snap.lineup.find(function(row){ return row.slug === snap.selectedSlug; });
    const selectedEntry = spriteEntryFor(snap.selectedSlug);
    if(selectedEntry) spriteSourceImg.src = spriteAssetPathFor(selectedEntry);
    spriteSourceText.textContent = selected
      ? [
          "SOURCE PNG · sRGB",
          selected.label,
          selected.canonicalFeet + " ft canonical",
          "anchor " + Number(selected.footX).toFixed(3) + " / " + Number(selected.footY).toFixed(3),
          "bounds " + (selected.contentBounds ? "compiled" : "MISSING · editor pass needed"),
          "alpha cutoff " + selected.alphaCutoff
        ].join("\n")
      : "selected sprite is loading…";
    const lines = [
      "fixture " + snap.fixtureId + " v" + snap.fixtureVersion,
      "mode " + snap.scaleMode + (snap.scaleMode === "diagnostic-cap" ? " · PREFERRED PRESENTATION" : " · CANONICAL SIZE CHECK"),
      "support " + snap.supportForm + " · tactical footprint remains separate",
      "contact pool multiply · darkens lit and already-shadowed floor values",
      "cast shadow alpha silhouette · edge shell non-casting",
      "shadow form " + Number(snap.environmentFormFill.intensity).toFixed(3)
        + " hemisphere · shadowless · tread/riser value floor",
      selected && selected.selectionBaseNeon
        ? "selected base neon · " + selected.selectionBaseNeon.source
          + " · " + selected.selectionBaseNeon.footprintShape
          + " · additive spill · no center bulb"
        : "selected base neon loading…",
      "stair proof " + (snap.stairSamples.length === 3 && snap.stairSamples.every(function(row){ return row.stairFit; })
        ? "PASS · face / 3⁄4 / edge"
        : "loading…"),
      ""
    ];
    snap.lineup.forEach(function(row){
      const renderedFeet = row.renderedWorldHeight == null ? "—" : (row.renderedWorldHeight * 5).toFixed(2);
      lines.push(
        (row.selected ? "▶ " : "  ") + row.label + " · canonical " + row.canonicalFeet + " ft · shown " + renderedFeet + " ft"
      );
      lines.push(
        "    tactical " + row.tacticalSpanCells + " cell · support "
        + Number(row.supportWidth).toFixed(2) + "×" + Number(row.supportDepth).toFixed(3)
        + " · tread " + Number(row.treadDepth).toFixed(3) + " · shell " + (row.shell ? "PASS" : "FAIL")
      );
      if(row.regenRecommended) lines.push("    ⚑ WIDTH FLAG · consider a taller/more upright regeneration");
    });
    lines.push("", "WIDTH FLAGS " + (snap.regenRecommended.length ? snap.regenRecommended.length : "none"));
    spritesOut.textContent = lines.join("\n");
  }
  S.clayRoomRefreshSprites = claySpritesRender;

  // CL-R4b Materials tab — two exact parents in matched bays and four truthful comparison modes.
  // The compact hierarchy is a review card, not a dump of every manifest field.
  const materialsBody = document.createElement("div");
  materialsBody.style.cssText = "display:none;font:11px/1.45 -apple-system,sans-serif;color:#dde;";
  const materialsIntro = document.createElement("div");
  materialsIntro.innerHTML =
    "<div style='color:#e2bd68;font:600 12px monospace;margin-bottom:4px'>CL-R4b · TWO MATERIALS · SAME TEST</div>" +
    "<div style='font:500 18px Georgia,serif;color:#f0eadc'>Fine brick scale × large block</div>" +
    "<div style='color:#9fa9b4;margin-top:3px'>Matched geometry, phase, camera, and light. Taste pending; no production material has been promoted.</div>";
  materialsBody.appendChild(materialsIntro);

  const materialFixtureNav = document.createElement("div");
  materialFixtureNav.style.cssText = "display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:9px 0;";
  [
    [CLAY_ROOM_TRUTH_FIXTURE_ID, "ROOM"],
    [CLAY_ROOM_STRUCTURE_BENCH_ID, "STRUCT"],
    [CLAY_ROOM_LIGHTING_BENCH_ID, "LIGHT"],
    [CLAY_ROOM_SPRITE_BENCH_ID, "SPRITE"],
    [CLAY_ROOM_MATERIAL_BENCH_ID, "MATERIAL"],
    [CLAY_ROOM_TRIM_BENCH_ID, "TRIM"],
    [CLAY_ROOM_TERRAIN_BENCH_ID, "TERRAIN"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.style.cssText = "font:8px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", function(){
      clayRoomSetFixture(def[0], "clayroom-material-fixture-nav");
      if(def[0] === CLAY_ROOM_STRUCTURE_BENCH_ID) clayShowTab("structure");
      else if(def[0] === CLAY_ROOM_LIGHTING_BENCH_ID) clayShowTab("lights");
      else if(def[0] === CLAY_ROOM_SPRITE_BENCH_ID) clayShowTab("sprites");
      else if(def[0] === CLAY_ROOM_MATERIAL_BENCH_ID) clayShowTab("materials");
      else if(def[0] === CLAY_ROOM_TRIM_BENCH_ID) clayShowTab("trim");
      else clayShowTab("movement");
    });
    materialFixtureNav.appendChild(button);
  });
  materialsBody.appendChild(materialFixtureNav);

  const materialSourceGrid = document.createElement("div");
  materialSourceGrid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;";
  CLAY_MATERIAL_BENCH_FIXTURE.materials.forEach(function(materialSpec){
    const card = document.createElement("button");
    card.type = "button";
    card.style.cssText = "display:grid;grid-template-columns:66px 1fr;gap:7px;text-align:left;background:#17191d;color:#dde;border:1px solid #3c4148;padding:6px;cursor:pointer;";
    card.addEventListener("click", function(){
      S.clayRoomWorkbenchSelect(materialSpec.id, "material parent card");
    });
    const image = document.createElement("img");
    image.src = "/" + materialSpec.sourceSprite;
    image.alt = materialSpec.label + " source sprite";
    image.style.cssText = "width:64px;height:64px;object-fit:cover;image-rendering:pixelated;border:1px solid #555;";
    const text = document.createElement("div");
    text.innerHTML =
      "<div style='color:#7f8d9c;font:8px monospace;letter-spacing:.08em'>ALBEDO AUTHORITY</div>" +
      "<div style='margin-top:2px;font:600 10px sans-serif'>" + materialSpec.label + "</div>" +
      "<div style='color:" + (materialSpec.scaleStatus.indexOf("ACCEPTED") >= 0 ? "#79d69a" : "#c9a765") +
      ";font:8px/1.3 monospace;margin-top:4px'>" + materialSpec.scaleStatus + "</div>";
    card.appendChild(image);
    card.appendChild(text);
    materialSourceGrid.appendChild(card);
  });
  materialsBody.appendChild(materialSourceGrid);

  const materialModeLabel = document.createElement("div");
  materialModeLabel.textContent = "COMPARE";
  materialModeLabel.style.cssText = "color:#7f8d9c;font:600 9px monospace;letter-spacing:.12em;margin:8px 0 4px;";
  materialsBody.appendChild(materialModeLabel);
  const materialModeActions = document.createElement("div");
  materialModeActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:5px;";
  const materialModeButtons = {};
  [
    ["pbr", "PBR", "albedo + normal + ORM"],
    ["albedo-fallback", "ALBEDO ONLY", "truthful missing-map fallback"],
    ["clay-control", "CLAY", "same geometry and light"],
    ["normal-negative", "TOO MUCH NORMAL", "intentional rejection control"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.innerHTML = "<span style='display:block;font:600 9px monospace'>" + def[1] +
      "</span><span style='display:block;color:#99a2ad;font:8px/1.25 sans-serif;margin-top:2px'>" + def[2] + "</span>";
    button.style.cssText = "min-height:48px;background:#25282e;color:#e3e8ee;border:1px solid #464b54;border-radius:3px;padding:5px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetMaterialMode(def[0]); });
    materialModeActions.appendChild(button);
    materialModeButtons[def[0]] = button;
  });
  materialsBody.appendChild(materialModeActions);

  const materialReadout = document.createElement("div");
  materialReadout.style.cssText = "margin-top:8px;border-top:1px solid #383d45;padding-top:7px;";
  materialsBody.appendChild(materialReadout);
  function clayMaterialsRender(){
    const snap = clayRoomMaterialBenchSnapshot();
    Object.keys(materialModeButtons).forEach(function(mode){
      materialModeButtons[mode].style.background = mode === snap.requestedMode
        ? (mode === "normal-negative" ? "#653a31" : "#3d4f3d") : "#25282e";
    });
    const pbrColor = snap.pbrReady ? "#79d69a" : "#d5a65c";
    const roles = snap.roles && snap.roles.length ? snap.roles.join(" · ") : "loading";
    const uvPass = !!(snap.surfaces && snap.surfaces.length
      && snap.surfaces.every(function(row){ return row.uv1Present; }));
    const gridReport = S.clayGridMesh && S.clayGridMesh.userData
      ? S.clayGridMesh.userData.clayGridReport : null;
    const parentLine = snap.materials && snap.materials.length
      ? snap.materials.map(function(row){
        return row.label + " " + (row.pbrReady ? "READY" : "FALLBACK");
      }).join("<br>") : "loading";
    materialReadout.innerHTML =
      "<div style='display:grid;grid-template-columns:1fr auto;gap:3px 8px;background:#17191d;border:1px solid #3c4148;padding:8px'>" +
      "<span style='color:#9fa9b4'>Runtime maps</span><span style='color:" + pbrColor + ";font:600 10px monospace'>" + (snap.pbrReady ? "READY" : "FALLBACK") + "</span>" +
      "<span style='color:#9fa9b4'>Material parents</span><span style='font:9px/1.45 monospace;text-align:right'>" + parentLine + "</span>" +
      "<span style='color:#9fa9b4'>Actual mode</span><span style='font:10px monospace'>" + (snap.actualMode || "loading") + "</span>" +
      "<span style='color:#9fa9b4'>Physical scale</span><span style='font:10px monospace'>" + (snap.scale ? snap.scale.metersPerTile.toFixed(2) + " m / tile" : "—") + "</span>" +
      "<span style='color:#9fa9b4'>Floor repeat</span><span style='font:10px monospace'>2 bays × 3 × 3 exact</span>" +
      "<span style='color:#9fa9b4'>Architectural roles</span><span style='font:10px monospace;text-align:right'>" + roles + "</span>" +
      "<span style='color:#9fa9b4'>AO UV1</span><span style='color:" + (uvPass ? "#79d69a" : "#d5a65c") + ";font:600 10px monospace'>" + (uvPass ? "PASS" : "LOADING") + "</span>" +
      "<span style='color:#9fa9b4'>Flat / walk grid</span><span style='font:10px monospace'>" + (gridReport ? gridReport.materialSurfaces + " tops" : "loading") + "</span>" +
      "<span style='color:#9fa9b4'>Grid blend</span><span style='font:9px monospace'>" + (gridReport ? gridReport.blendContract : "loading") + "</span>" +
      "</div>" +
      "<div style='color:#8f99a4;font:9px/1.4 monospace;margin-top:6px'>LINEAGE · 2 × B04 v003 · exact albedo · tangent normal · ORM R/AO G/rough B/metal · surface-clipped multiply grid</div>";
  }
  S.clayRoomRefreshMaterials = clayMaterialsRender;

  // CL-R5 Trim tab — complete-room composition, with the diagnostic role colours retained as an
  // audit mode over the exact same profile geometry and routing.
  const trimBody = document.createElement("div");
  trimBody.style.cssText = "display:none;font:11px/1.45 -apple-system,sans-serif;color:#dde;";
  const trimIntro = document.createElement("div");
  trimIntro.innerHTML =
    "<div style='color:#c9b484;font:600 12px monospace;margin-bottom:4px'>CL-R5 · COMPLETE STRUCTURES</div>" +
    "<div style='font:500 18px Georgia,serif;color:#f0eadc'>Same room · swapped body parents · culture-owned trim</div>" +
    "<div style='color:#9fa9b4;margin-top:3px'>Supported slabs, full far walls, one-foot cutaway stubs, owned corners, framed openings, platforms, and stairs.</div>";
  trimBody.appendChild(trimIntro);
  const trimFixtureNav = document.createElement("div");
  trimFixtureNav.style.cssText = "display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:9px 0;";
  [
    [CLAY_ROOM_TRUTH_FIXTURE_ID, "ROOM", "movement"],
    [CLAY_ROOM_STRUCTURE_BENCH_ID, "STRUCT", "structure"],
    [CLAY_ROOM_LIGHTING_BENCH_ID, "LIGHT", "lights"],
    [CLAY_ROOM_SPRITE_BENCH_ID, "SPRITE", "sprites"],
    [CLAY_ROOM_MATERIAL_BENCH_ID, "MATERIAL", "materials"],
    [CLAY_ROOM_TRIM_BENCH_ID, "TRIM", "trim"],
    [CLAY_ROOM_TERRAIN_BENCH_ID, "TERRAIN", "terrain"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.style.cssText = "font:8px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", function(){
      clayRoomSetFixture(def[0], "clayroom-trim-fixture-nav");
      clayShowTab(def[2]);
    });
    trimFixtureNav.appendChild(button);
  });
  trimBody.appendChild(trimFixtureNav);

  const trimCultureGrid = document.createElement("div");
  trimCultureGrid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;";
  CLAY_TRIM_BENCH_FIXTURE.structures.forEach(function(structure){
    const culture = CLAY_TRIM_BENCH_FIXTURE.cultures.find(function(row){
      return row.id === structure.cultureId;
    });
    const wall = CLAY_MATERIAL_BENCH_FIXTURE.materials.find(function(row){
      return row.id === structure.wallMaterialId;
    });
    const floor = CLAY_MATERIAL_BENCH_FIXTURE.materials.find(function(row){
      return row.id === structure.floorMaterialId;
    });
    const card = document.createElement("button");
    card.type = "button";
    card.style.cssText = "display:grid;grid-template-columns:74px 1fr;gap:7px;text-align:left;background:#17191d;color:#dde;border:1px solid #3c4148;padding:6px;cursor:pointer;";
    card.addEventListener("click", function(){
      S.clayRoomWorkbenchSelect(structure.id, "trim structure card");
    });
    const image = document.createElement("img");
    image.src = "/" + culture.atlasRoot + "/" + culture.maps.basecolor.file;
    image.alt = culture.label + " h6-v1 trim atlas";
    image.style.cssText = "width:72px;height:72px;object-fit:cover;image-rendering:pixelated;border:1px solid #555;";
    const text = document.createElement("div");
    text.innerHTML =
      "<div style='color:#7f8d9c;font:8px monospace;letter-spacing:.08em'>" + culture.id.toUpperCase() + "</div>" +
      "<div style='margin-top:2px;font:600 10px sans-serif'>" + structure.label + "</div>" +
      "<div style='color:#b9c3ce;font:8px/1.35 monospace;margin-top:4px'>WALL · " + wall.label +
      "<br>FLOOR · " + floor.label + "<br>TRIM · h6-v1 / 6 roles</div>";
    card.appendChild(image);
    card.appendChild(text);
    trimCultureGrid.appendChild(card);
  });
  trimBody.appendChild(trimCultureGrid);

  const trimModeLabel = document.createElement("div");
  trimModeLabel.textContent = "VIEW";
  trimModeLabel.style.cssText = "color:#7f8d9c;font:600 9px monospace;letter-spacing:.12em;margin:8px 0 4px;";
  trimBody.appendChild(trimModeLabel);
  const trimModeActions = document.createElement("div");
  trimModeActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:5px;";
  const trimModeButtons = {};
  [
    ["pbr", "PBR BEAUTY", "body + culture trim maps"],
    ["trim-debug", "ROLE DEBUG", "six semantic colours"],
    ["albedo-only", "ALBEDO ONLY", "normal / ORM removed"],
    ["clay-control", "CLAY", "same complete geometry"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.innerHTML = "<span style='display:block;font:600 9px monospace'>" + def[1] +
      "</span><span style='display:block;color:#99a2ad;font:8px/1.25 sans-serif;margin-top:2px'>" + def[2] + "</span>";
    button.style.cssText = "min-height:48px;background:#25282e;color:#e3e8ee;border:1px solid #464b54;border-radius:3px;padding:5px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetTrimMode(def[0]); });
    trimModeActions.appendChild(button);
    trimModeButtons[def[0]] = button;
  });
  trimBody.appendChild(trimModeActions);
  const trimReadout = document.createElement("div");
  trimReadout.style.cssText = "margin-top:8px;border-top:1px solid #383d45;padding-top:7px;";
  trimBody.appendChild(trimReadout);
  function clayTrimRender(){
    const snap = clayRoomTrimBenchSnapshot();
    Object.keys(trimModeButtons).forEach(function(mode){
      trimModeButtons[mode].style.background = mode === snap.requestedMode
        ? (mode === "trim-debug" ? "#4b425f" : "#3d4f3d") : "#25282e";
    });
    const readyColor = snap.pbrReady ? "#79d69a" : "#d5a65c";
    const roles = snap.semanticRoles && snap.semanticRoles.length
      ? snap.semanticRoles.join(" · ") : "loading";
    const gridReport = S.clayGridMesh && S.clayGridMesh.userData
      ? S.clayGridMesh.userData.clayGridReport : null;
    trimReadout.innerHTML =
      "<div style='display:grid;grid-template-columns:1fr auto;gap:3px 8px;background:#17191d;border:1px solid #3c4148;padding:8px'>" +
      "<span style='color:#9fa9b4'>Runtime maps</span><span style='color:" + readyColor + ";font:600 10px monospace'>" + (snap.pbrReady ? "READY" : "LOADING / FALLBACK") + "</span>" +
      "<span style='color:#9fa9b4'>Complete rooms</span><span style='font:10px monospace'>2 matched</span>" +
      "<span style='color:#9fa9b4'>Body surfaces</span><span style='font:10px monospace'>" + (snap.bodySurfaceCount || 0) + "</span>" +
      "<span style='color:#9fa9b4'>Trim faces / cores</span><span style='font:10px monospace'>" + (snap.trimSurfaceCount || 0) + " / " + (snap.trimCoreCount || 0) + "</span>" +
      "<span style='color:#9fa9b4'>Six roles per room</span><span style='color:" + (snap.allRolesPerStructure ? "#79d69a" : "#d5a65c") + ";font:600 10px monospace'>" + (snap.allRolesPerStructure ? "PASS" : "LOADING") + "</span>" +
      "<span style='color:#9fa9b4'>Semantic routing</span><span style='max-width:185px;font:8px/1.35 monospace;text-align:right'>" + roles + "</span>" +
      "<span style='color:#9fa9b4'>Repeat-safe runs</span><span style='font:10px monospace'>" + (snap.segmentedRuns || 0) + " segmented · " + (snap.nonExactRepeatRuns || 0) + " non-multiple</span>" +
      "<span style='color:#9fa9b4'>Atlas UV clamp</span><span style='color:" + (snap.uvClamped ? "#79d69a" : "#d5a65c") + ";font:600 10px monospace'>" + (snap.uvClamped ? "PASS" : "REVIEW") + "</span>" +
      "<span style='color:#9fa9b4'>Flat-surface grid</span><span style='font:10px monospace'>" + (gridReport ? gridReport.trimSurfaces + " tops" : "loading") + "</span>" +
      "<span style='color:#9fa9b4'>Cutaway wall</span><span style='font:10px monospace'>" + CLAY_TRIM_BENCH_FIXTURE.architecture.stubFeet + " ft retained stub</span>" +
      "</div>" +
      "<div style='color:#8f99a4;font:9px/1.4 monospace;margin-top:6px'>LINEAGE · B04 body parents + deterministic B06 h6-v1 trim · exact basecolor · tangent normal · ORM · zero tactical mutation</div>";
  }
  S.clayRoomRefreshTrim = clayTrimRender;

  panel.appendChild(factsBody);
  panel.appendChild(explainBody);
  panel.appendChild(surfacesBody);
  panel.appendChild(mountBody);
  panel.appendChild(stateBody);
  panel.appendChild(movementBody);
  panel.appendChild(structureBody);
  panel.appendChild(lightsBody);
  panel.appendChild(spritesBody);
  panel.appendChild(materialsBody);
  panel.appendChild(trimBody);

  function clayShowTab(which){
    factsBody.style.display = which === "facts" ? "" : "none";
    explainBody.style.display = which === "explain" ? "" : "none";
    surfacesBody.style.display = which === "surfaces" ? "" : "none";
    mountBody.style.display = which === "mount" ? "" : "none";
    stateBody.style.display = which === "state" ? "" : "none";
    movementBody.style.display = which === "movement" ? "" : "none";
    structureBody.style.display = which === "structure" ? "" : "none";
    lightsBody.style.display = which === "lights" ? "" : "none";
    spritesBody.style.display = which === "sprites" ? "" : "none";
    materialsBody.style.display = which === "materials" ? "" : "none";
    trimBody.style.display = which === "trim" ? "" : "none";
    factsTabBtn.style.background = which === "facts" ? "#3a3a44" : "#2a2a30";
    explainTabBtn.style.background = which === "explain" ? "#3a3a44" : "#2a2a30";
    surfacesTabBtn.style.background = which === "surfaces" ? "#3a3a44" : "#2a2a30";
    mountTabBtn.style.background = which === "mount" ? "#3a3a44" : "#2a2a30";
    stateTabBtn.style.background = which === "state" ? "#3a3a44" : "#2a2a30";
    movementTabBtn.style.background = which === "movement" ? "#3a3a44" : "#2a2a30";
    structureTabBtn.style.background = which === "structure" ? "#3a3a44" : "#2a2a30";
    lightsTabBtn.style.background = which === "lights" ? "#3a3a44" : "#2a2a30";
    spritesTabBtn.style.background = which === "sprites" ? "#3a3a44" : "#2a2a30";
    materialsTabBtn.style.background = which === "materials" ? "#3a3a44" : "#2a2a30";
    trimTabBtn.style.background = which === "trim" ? "#3a3a44" : "#2a2a30";
    S.clayRoomMovementPickMode = which === "movement";
    if(which === "surfaces") clayRenderSurfacesTab();
    if(which === "mount") clayMountRender();
    if(which === "state") clayDoorStateRender();
    if(which === "movement") clayMovementRender();
    else clayRoomDisposeMovementOverlay();
    if(which === "structure") clayStructureRender();
    if(which === "lights") clayLightsRender();
    if(which === "sprites") claySpritesRender();
    if(which === "materials") clayMaterialsRender();
    if(which === "trim") clayTrimRender();
    if(CLAY_ROOM_PANEL_POSITION){
      const panelRect = panel.getBoundingClientRect();
      clayPanelPlace(panelRect.left, panelRect.top, true);
    } else {
      clayPanelDockRight();
    }
  }
  S.clayRoomShowTab = clayShowTab;
  function claySelectionInfo(id){
    if(id === record.portal.id) return { name: "Door", type: "INTERACTABLE", ref: id, tab: "state", socket: true, sprite: false };
    if(id === record.object.id) return { name: "Crate · 3 ft", type: "PROP · FACED_BOX", ref: id, tab: "surfaces", socket: false, sprite: false };
    if(id === record.citizen.id || id === record.citizen.bestiaryId) return {
      name: "Goblin", type: "APPROVED CHARACTER SPRITE", ref: record.citizen.bestiaryId, tab: "facts", socket: false, sprite: true
    };
    const structureSpec = id === "compiled-shell"
      ? { id: "compiled-shell", label: "Compiled shell" }
      : clayRoomStructureBenchFixtureFrom(record).pieces.find(function(row){ return row.id === id; });
    if(structureSpec) return {
      name: structureSpec.label,
      type: id === "compiled-shell" ? "PRODUCTION COMPILED STRUCTURE" : "STRUCTURE KIT SPECIMEN",
      ref: structureSpec.id,
      tab: "structure",
      socket: id !== "compiled-shell",
      sprite: false
    };
    if(id === clayRoomStructureBenchFixtureFrom(record).cutawayWitness.id) return {
      name: "Human cutaway witness",
      type: "PRODUCTION STANDEE · DYNAMIC OCCLUSION TARGET",
      ref: clayRoomStructureBenchFixtureFrom(record).cutawayWitness.pieceSlug,
      tab: "structure",
      socket: false,
      sprite: true
    };
    const spriteSpec = clayRoomSpriteCitizenshipFixtureFrom(record).cast.find(function(row){ return row.slug === id; });
    if(spriteSpec) return {
      name: spriteSpec.label,
      type: "SPRITE CITIZEN · " + spriteSpec.stress,
      ref: spriteSpec.slug,
      tab: "sprites",
      socket: false,
      sprite: true
    };
    const materialSpec = CLAY_MATERIAL_BENCH_FIXTURE.materials.find(function(row){
      return row.id === id;
    });
    if(materialSpec) return {
      name: materialSpec.label,
      type: "TASTE-PENDING MATERIAL PARENT",
      ref: materialSpec.id,
      tab: "materials",
      socket: false,
      sprite: false
    };
    const trimStructure = CLAY_TRIM_BENCH_FIXTURE.structures.find(function(row){
      return row.id === id;
    });
    if(trimStructure) return {
      name: trimStructure.label,
      type: trimStructure.cultureId.toUpperCase() + " · COMPLETE TRIMMED STRUCTURE",
      ref: trimStructure.id,
      tab: "trim",
      socket: false,
      sprite: false
    };
    const activeRecipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId]
      || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
    const activeLight = (activeRecipe.lights || []).find(function(light){ return light.id === id; });
    if(activeLight) return {
      name: activeLight.label,
      type: activeRecipe.mode.indexOf("diagnostic-") === 0 ? "DIAGNOSTIC LIGHT" : "LORE-NATIVE LIGHT",
      ref: id,
      tab: "lights",
      socket: false,
      sprite: false
    };
    return { name: "Room shell · 10 ft", type: "STRUCTURE", ref: "clay-c1a", tab: "surfaces", socket: false, sprite: false };
  }
  S.clayRoomRefreshLightCatalog = function(){
    const activeRecipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId]
      || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
    const lights = (activeRecipe.lights || []).filter(function(light){ return light.enabled !== false; });
    const diagnostic = activeRecipe.mode.indexOf("diagnostic-") === 0;
    document.querySelectorAll("[data-clay-light-catalog-slot]").forEach(function(button){
      const light = lights[Number(button.dataset.clayLightCatalogSlot)];
      button.style.display = light ? "" : "none";
      if(!light) return;
      button.dataset.claySelect = light.id;
      const kind = button.querySelector("[data-clay-light-kind]");
      const label = button.querySelector("[data-clay-light-label]");
      const status = button.querySelector("[data-clay-light-status]");
      if(kind) kind.textContent = diagnostic ? "DIAGNOSTIC LIGHT" : "LORE-NATIVE LIGHT";
      if(label) label.textContent = light.label;
      if(status) status.textContent = diagnostic ? "TEST ONLY" : "MOUNTED";
    });
    document.querySelectorAll("[data-clay-light-scene-slot]").forEach(function(button){
      const light = lights[Number(button.dataset.clayLightSceneSlot)];
      button.style.display = light ? "" : "none";
      if(!light) return;
      button.dataset.claySceneId = light.id;
      button.textContent = "◇  " + light.label;
    });
  };
  S.clayRoomWorkbenchSelect = function(id, source){
    S.clayRoomSelectedId = id;
    const info = claySelectionInfo(id);
    selectionName.textContent = info.name;
    selectionMeta.textContent = info.type + " · " + info.ref + " · selected from " + (source || "workbench");
    spriteEditorBtn.disabled = !info.sprite;
    spriteEditorBtn.style.opacity = info.sprite ? "1" : "0.5";
    socketScopeBtn.style.opacity = info.socket ? "1" : "0.55";
    socketScopeBtn.textContent = info.socket ? "🔒 SOCKET" : "SOCKET — N/A";
    stateScopeBtn.style.opacity = info.tab === "state" || info.tab === "structure"
      || info.tab === "lights" || info.tab === "sprites" || info.tab === "materials"
      || info.tab === "trim" ? "1" : "0.7";
    document.querySelectorAll("[data-clay-scene-id]").forEach(function(b){
      const active = b.dataset.claySceneId === id
        || (id === record.citizen.bestiaryId && b.dataset.claySceneId === record.citizen.id);
      b.style.borderLeftColor = active ? "#6fcfff" : "transparent";
      b.style.background = active ? "#202b35" : "transparent";
      b.style.color = active ? "#f0f8ff" : "#cbd3dc";
    });
    clayRoomHighlightSelection(id);
    if(info.tab === "structure"){
      clayRoomStructureClimbTargetSet(id, null, null);
      clayRoomApplyStructureViewVisibility(S.clayRoomStructureView || CLAY_STRUCTURE_BENCH_FIXTURE.defaultView);
      if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
    }
    if(info.tab === "materials" && typeof S.clayRoomRefreshMaterials === "function"){
      S.clayRoomRefreshMaterials();
    }
    if(info.tab === "trim" && typeof S.clayRoomRefreshTrim === "function"){
      S.clayRoomRefreshTrim();
    }
  };
  instanceScopeBtn.addEventListener("click", function(){
    sessionLaw.textContent = "INSTANCE · SESSION ONLY · transforms here never rewrite the production socket.";
  });
  stateScopeBtn.addEventListener("click", function(){
    const info = claySelectionInfo(S.clayRoomSelectedId);
    clayShowTab(info.tab);
  });
  socketScopeBtn.addEventListener("click", function(){
    const info = claySelectionInfo(S.clayRoomSelectedId);
    if(info.socket){
      if(info.tab === "structure"){
        sessionLaw.textContent = "SOCKET PROTECTED · showing authored axis/type; incompatible axes reject without relocation.";
        clayRoomSetStructureView("sockets");
        clayShowTab("structure");
      } else {
        sessionLaw.textContent = "SOCKET PROTECTED · Mount tab edits a session tune and exports an object-mount lock.";
        clayShowTab("mount");
      }
    } else {
      sessionLaw.textContent = "No socket on this selection. Clayroom movement stays instance-local.";
    }
  });
  defaultScopeBtn.addEventListener("click", function(){
    sessionLaw.textContent = "DEFAULT PROTECTED · an explicit promoted overwrite would affect FUTURE ROLLS.";
  });
  spriteEditorBtn.addEventListener("click", function(){
    const info = claySelectionInfo(S.clayRoomSelectedId);
    if(!info.sprite) return;
    window.open(
      "http://127.0.0.1:5179/?sprite=" + encodeURIComponent(info.ref),
      "genesis-sprite-editor"
    );
  });
  saveVariantBtn.addEventListener("click", function(){
    const info = claySelectionInfo(S.clayRoomSelectedId);
    sessionLaw.textContent = "SESSION STATE CAPTURED · " + info.name + " · persistence awaits versioned recipe save.";
  });
  factsTabBtn.addEventListener("click", function(){ clayShowTab("facts"); });
  explainTabBtn.addEventListener("click", function(){ clayShowTab("explain"); });
  surfacesTabBtn.addEventListener("click", function(){ clayShowTab("surfaces"); });
  mountTabBtn.addEventListener("click", function(){ clayShowTab("mount"); });
  stateTabBtn.addEventListener("click", function(){ clayShowTab("state"); });
  movementTabBtn.addEventListener("click", function(){ clayShowTab("movement"); });
  structureTabBtn.addEventListener("click", function(){ clayShowTab("structure"); });
  lightsTabBtn.addEventListener("click", function(){ clayShowTab("lights"); });
  spritesTabBtn.addEventListener("click", function(){ clayShowTab("sprites"); });
  materialsTabBtn.addEventListener("click", function(){ clayShowTab("materials"); });
  trimTabBtn.addEventListener("click", function(){ clayShowTab("trim"); });
  clayShowTab(S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
    ? "structure" : (S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
      ? "lights" : (S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID
        ? "sprites" : (S.clayRoomFixtureId === CLAY_ROOM_MATERIAL_BENCH_ID
          ? "materials" : (S.clayRoomFixtureId === CLAY_ROOM_TRIM_BENCH_ID
            ? "trim" : "movement")))));

  document.body.appendChild(panel);
  if(CLAY_ROOM_PANEL_POSITION){
    clayPanelPlace(CLAY_ROOM_PANEL_POSITION.left, CLAY_ROOM_PANEL_POSITION.top, true);
  } else {
    clayPanelDockRight();
  }
  const activeInitialRecipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId]
    || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
  const activeInitialLight = (activeInitialRecipe.lights || []).find(function(light){ return light.enabled !== false; });
  const initialSelection = S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID && activeInitialLight
    ? activeInitialLight.id
    : (S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
      ? "compiled-shell"
      : (S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID
      ? (S.clayRoomSelectedSpriteSlug || spriteFixture.selectedSlug)
      : (S.clayRoomFixtureId === CLAY_ROOM_MATERIAL_BENCH_ID
        ? CLAY_MATERIAL_BENCH_FIXTURE.materials[0].id
        : (S.clayRoomFixtureId === CLAY_ROOM_TRIM_BENCH_ID
          ? CLAY_TRIM_BENCH_FIXTURE.structures[0].id
          : (S.clayRoomSelectedId || record.portal.id)))));
  S.clayRoomWorkbenchSelect(initialSelection, "initial");
  S.clayRoomRefreshLightCatalog();
  clayRefreshFixtureControls();
  S.clayRoomLightReadoutTimer = setInterval(function(){
    if(S.clayRoomMounted && lightsBody.style.display !== "none") clayLightsRender();
  }, 120);
  S.clayRoomOverlayEl = panel;
}

// Dev-only teardown (the panel's own close button) — disposes the dedicated GL instance mountClayRoom
// created (retire(), the SAME teardown mount() itself calls on every re-mount) and removes both DOM
// hosts, then clears the mounted flag so a later flag re-flip (?clayroom=1 revisited, or
// GS.clayRoomEnabled toggled again) can mount fresh. Never touches anything the normal game flow
// owns — this dev surface only ever tears down what it itself built. retire() itself replaces `S`
// with a fresh createTheaterState() (mirroring mount()'s own idempotent-re-mount teardown), so the
// two DOM handles are captured BEFORE calling it, not read off S afterward.
function clayRoomUnmount(){
  if(!S.clayRoomMounted) return;
  const overlayEl = S.clayRoomOverlayEl, hostEl = S.clayRoomHost;
  const workbenchChrome = (S.clayRoomWorkbenchChrome || []).slice();
  const panelResizeHandler = S.clayRoomPanelResizeHandler;
  const panelDragCleanup = S.clayRoomPanelDragCleanup;
  const lightReadoutTimer = S.clayRoomLightReadoutTimer;
  const lightingMatrixOverlay = S.clayRoomLightingMatrixOverlay;
  // CL-R0: stand the lifecycle hook down BEFORE retire(). retire() swaps in a fresh
  // createTheaterState() (so the flag would clear anyway), but any setInteriorBoard that fires
  // during teardown must not try to re-route a tree that is being disposed.
  S.clayRoomDiagnosticActive = false;
  clayRoomDisposeLightOverlays();
  if(panelDragCleanup) panelDragCleanup();
  if(panelResizeHandler) window.removeEventListener("resize", panelResizeHandler);
  if(lightReadoutTimer != null) clearInterval(lightReadoutTimer);
  retire();
  clayCtxSetRoomShell(CLAY_ROOM_PRIOR_ROOM_SHELL); // restore mountClayRoom's own ITR_ROOM_SHELL override — see that function's header note (split B1: accessor)
  if(overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
  if(hostEl && hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
  if(lightingMatrixOverlay && lightingMatrixOverlay.parentNode){
    lightingMatrixOverlay.parentNode.removeChild(lightingMatrixOverlay);
  }
  workbenchChrome.forEach(function(el){ if(el && el.parentNode) el.parentNode.removeChild(el); });
}

// Spec addendum D1a (docs/C1A-CLAY-ROOM.md, orchestrator re-gate finding): clayRoomMaybeAutoMount's
// own per-frame poll (hooked into renderTheaterFrame, this file's top) only ever RUNS once some
// theater is already mounted and drawing frames — either the game's own board/interior mount kicks
// off scheduleRender's rAF loop, or a harness calls measureRenderFps/measureComposerFps directly.
// A COLD BOOT (title screen, no game session yet) never mounts anything and so never calls
// renderTheaterFrame at all — verified live by the orchestrator loading genesis.html?clayroom=1 from
// a blank tab: {theaterMounted:false, clayHost:false, canvases:0}. Light Lab's dormant-poll pattern
// (D1's own precedent) is fine living entirely inside that poll because Light Lab is a LIVE-theater
// accessory (it only ever makes sense once a board is already up); the clay room is a STANDALONE dev
// surface (docs/C1A-CLAY-ROOM.md's own framing — "the game boots identically with the flag off") and
// must self-mount at boot rather than wait on a frame that, on a cold title screen, may never come.
//
// Direct call, no setTimeout/microtask defer: this file's own <script type="module"> tag
// (genesis.html:1541) makes theater-boot.js an implicitly-deferred module script. Per the HTML
// spec, deferred/module scripts execute only once the document has finished parsing (document.body
// and every element already exist), AFTER every classic synchronous <script> in the document —
// including data/sprite-registry.js and the engine/clay-room.js tag (both load earlier, per D2's own
// manifest note) and the page's own end-of-body classic boot script that sets up window.GS — even
// though that classic script's <script> tag sits textually AFTER this module's tag in genesis.html
// (classic scripts run synchronously as the parser reaches them; deferred/module scripts always run
// after ALL of those, never before). This line also sits at the literal end of the file, after every
// function this region defines and after `let S = createTheaterState();` (this file's line ~5011),
// so there is no hoisting/ordering hazard to defer past. Net: a direct top-level call is exactly as
// "ready" as it will ever be — a setTimeout(0) here would only add a frame of avoidable latency for a
// dev-only cold-boot surface.
//
// Cost with the flag OFF (the byte-for-byte-identical-boot requirement): ONE clayRoomShouldEnable()
// call — a location.search read, memoized — and nothing else. Same one-boolean-read-when-off law D1
// already pays for the per-frame poll; this just pays it once, at boot, instead of (also) waiting for
// a frame that a cold title screen never produces.
function clayRoomBootSelfMount(){
  if(S.clayRoomMounted) return;
  if(!clayRoomShouldEnable()) return;
  mountClayRoom();
}
// split B1: the boot-time self-mount CALL lives in the root's own tail (theater-boot.js) —
// module evaluation runs before the root body wires ctx/S, so a top-level call here would
// null-deref; the root's end-of-body call preserves the original end-of-file timing exactly.
/* CLAY-ROOM ADDITIONS END */
// ---- the root imports exactly these (the region's pre-split externally-referenced surface) ----
export {
  mountClayRoom,
  clayRoomBootSelfMount,
  clayRoomMaybeAutoMount,
  clayRoomAfterInteriorBoardRebuild,
  clayRoomCaptureLightingMatrix,
  clayRoomDoorProofState,
  clayRoomLightingPixelMetrics,
  clayRoomLightingSnapshot,
  clayRoomMaterialBenchSnapshot,
  clayRoomTrimBenchSnapshot,
  clayRoomMoodSnapshot,
  clayRoomMovementSession,
  clayRoomProvenanceAudit,
  clayRoomRecordLightingProbe,
  clayRoomSetFixture,
  clayRoomSetLightingRecipe,
  clayRoomSetMaterialMode,
  clayRoomSetTrimMode,
  clayRoomSetMoodLayer,
  clayRoomSetSpriteScaleMode,
  clayRoomStructureClimbAttempt,
  clayRoomStructureClimbReset,
  clayRoomStructureClimbSnapshot,
  clayRoomStructureClimbTargetSet,
  clayRoomStructureFocusProofFamily,
  clayRoomStructureFocusSpec,
  clayRoomStructureParkActorOnStep,
  clayRoomSetStructureDoorState,
  clayRoomSetStructureStaged,
  clayRoomSetStructureView,
  clayRoomSurfaceCensus,
  clayWallOmissionOn,
  CLAY_CAM_ZOOM_MIN,
  CLAY_CAM_ZOOM_MAX,
  clayRoomSetTerrainScene,
  clayRoomSetTerrainFrame,
  clayRoomSetTerrainView,
  clayRoomSetTerrainQuarterTurn,
  clayRoomTerrainBenchSnapshot,
  clayGuardWallModuleTexture,
  CLAY_ROOM_TERRAIN_BENCH_ID,
  CLAY_TERRAIN_SCENE_IDS,
  CLAY_ROOM_LIGHTING_BENCH_ID,
  CLAY_ROOM_MATERIAL_BENCH_ID,
  CLAY_ROOM_TRIM_BENCH_ID,
  CLAY_ROOM_LIGHTING_MATRIX_RECIPES,
  CLAY_ROOM_LIGHT_PREVIEW_SEEDS,
  CLAY_ROOM_LORE_LIGHT_PREVIEWS,
  CLAY_ROOM_MOOD_EXAMPLES
};
